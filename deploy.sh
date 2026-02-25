#!/bin/bash
set -e

SERVER="root@46.225.131.97"
SSH_KEY="C:/Local Data/Repositories/SSH Keys/hetzner_ed25519"
REMOTE_DIR="/opt/oklch-palette"

echo "==> Dateien auf Server kopieren..."
ssh -i "$SSH_KEY" "$SERVER" "mkdir -p $REMOTE_DIR"
scp -i "$SSH_KEY" index.html docker-compose.yml Dockerfile nginx.conf "$SERVER:$REMOTE_DIR/"

echo "==> Docker-Container bauen und starten..."
ssh -i "$SSH_KEY" "$SERVER" "cd $REMOTE_DIR && docker compose up -d --build"

echo "==> Fertig! App erreichbar unter: http://46.225.131.97"
