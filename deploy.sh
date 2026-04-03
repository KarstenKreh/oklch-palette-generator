#!/bin/bash
set -e

SERVER="root@46.225.131.97"
SSH_KEY="C:/Users/karst/repositories/SSH Keys/hetzner_ed25519"
REMOTE_DIR="/opt/oklch-palette"

# Ensure Traefik network exists
echo "==> Checking Traefik..."
ssh -i "$SSH_KEY" "$SERVER" 'docker network inspect traefik_web >/dev/null 2>&1 || { echo "ERROR: Traefik network not found. Run setup-traefik.sh first."; exit 1; }'

echo "==> Deploying OKLCH Palette Generator..."
ssh -i "$SSH_KEY" "$SERVER" "mkdir -p $REMOTE_DIR/color-react $REMOTE_DIR/public"
scp -i "$SSH_KEY" index.html docker-compose.yml Dockerfile nginx.conf og-server.js shared.css "$SERVER:$REMOTE_DIR/"
scp -i "$SSH_KEY" public/* "$SERVER:$REMOTE_DIR/public/"

# Upload color-react source (tar to exclude node_modules/dist, unpack on server)
echo "==> Uploading color-react source..."
tar cf - --exclude='node_modules' --exclude='dist' --exclude='.git' color-react/ | ssh -i "$SSH_KEY" "$SERVER" "cd $REMOTE_DIR && rm -rf color-react && tar xf -"

# Upload type-react source (tar to exclude node_modules/dist, unpack on server)
echo "==> Uploading type-react source..."
tar cf - --exclude='node_modules' --exclude='dist' --exclude='.git' type-react/ | ssh -i "$SSH_KEY" "$SERVER" "cd $REMOTE_DIR && rm -rf type-react && tar xf -"

echo "==> Docker-Container bauen und starten..."
ssh -i "$SSH_KEY" "$SERVER" "cd $REMOTE_DIR && docker compose up -d --build"

echo "==> Fertig! Erreichbar unter: https://standby.design"
