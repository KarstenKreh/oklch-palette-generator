#!/bin/bash
set -e

SERVER="root@46.225.131.97"
SSH_KEY="C:/Users/karst/repositories/SSH Keys/hetzner_ed25519"
REMOTE_DIR="/opt/oklch-palette"

# Ensure Traefik network exists
echo "==> Checking Traefik..."
ssh -i "$SSH_KEY" "$SERVER" 'docker network inspect traefik_web >/dev/null 2>&1 || { echo "ERROR: Traefik network not found. Run setup-traefik.sh first."; exit 1; }'

echo "==> Deploying OKLCH Palette Generator..."
ssh -i "$SSH_KEY" "$SERVER" "mkdir -p $REMOTE_DIR"
scp -i "$SSH_KEY" index.html docker-compose.yml Dockerfile nginx.conf "$SERVER:$REMOTE_DIR/"

# Sync color-react source (exclude node_modules and dist)
echo "==> Uploading color-react source..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  -e "ssh -i \"$SSH_KEY\"" \
  color-react/ "$SERVER:$REMOTE_DIR/color-react/"

echo "==> Docker-Container bauen und starten..."
ssh -i "$SSH_KEY" "$SERVER" "cd $REMOTE_DIR && docker compose up -d --build"

echo "==> Fertig! Erreichbar unter: https://standby.design"
