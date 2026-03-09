#!/bin/bash
set -e

SERVER="root@46.225.131.97"
SSH_KEY="C:/Users/Karsten/Dev/Repositories/SSH Keys/hetzner_ed25519"

# ── WICHTIG: Trage hier deine E-Mail für Let's Encrypt ein ──
LETSENCRYPT_EMAIL="traefik.uninstall433@passmail.net"

if [ "$LETSENCRYPT_EMAIL" = "DEINE_EMAIL" ]; then
    echo "ERROR: Bitte trage deine E-Mail-Adresse in setup-traefik.sh ein (LETSENCRYPT_EMAIL)."
    exit 1
fi

echo "==> Stopping existing containers..."
ssh -i "$SSH_KEY" "$SERVER" "cd /opt/corethority && docker compose down || true"
ssh -i "$SSH_KEY" "$SERVER" "cd /opt/oklch-palette && docker compose down || true"

echo "==> Setting up Traefik..."
ssh -i "$SSH_KEY" "$SERVER" "mkdir -p /opt/traefik"

# Create traefik.yml
ssh -i "$SSH_KEY" "$SERVER" "cat > /opt/traefik/traefik.yml << 'EOF'
entryPoints:
  web:
    address: \":80\"
  websecure:
    address: \":443\"

certificatesResolvers:
  letsencrypt:
    acme:
      email: ${LETSENCRYPT_EMAIL}
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    exposedByDefault: false
    network: traefik_web
EOF"

# Fix: replace placeholder email with actual value
ssh -i "$SSH_KEY" "$SERVER" "sed -i 's|\${LETSENCRYPT_EMAIL}|${LETSENCRYPT_EMAIL}|' /opt/traefik/traefik.yml"

# Create docker-compose.yml for Traefik
ssh -i "$SSH_KEY" "$SERVER" "cat > /opt/traefik/docker-compose.yml << 'EOF'
services:
  traefik:
    image: traefik:v3
    container_name: traefik
    restart: unless-stopped
    ports:
      - \"80:80\"
      - \"443:443\"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml:ro
      - letsencrypt:/letsencrypt
    networks:
      - web

volumes:
  letsencrypt:

networks:
  web:
    name: traefik_web
EOF"

echo "==> Starting Traefik..."
ssh -i "$SSH_KEY" "$SERVER" "cd /opt/traefik && docker compose up -d"

echo "==> Deploying updated OKLCH Palette Generator..."
REMOTE_DIR="/opt/oklch-palette"
scp -i "$SSH_KEY" index.html docker-compose.yml Dockerfile nginx.conf "$SERVER:$REMOTE_DIR/"
scp -i "$SSH_KEY" -r color "$SERVER:$REMOTE_DIR/"
ssh -i "$SSH_KEY" "$SERVER" "cd $REMOTE_DIR && docker compose up -d --build"

echo "==> Deploying updated corethority..."
CORETHORITY_LOCAL="C:/Users/Karsten/Dev/Repositories/corethority"
scp -i "$SSH_KEY" "$CORETHORITY_LOCAL/docker-compose.yml" "$SERVER:/opt/corethority/"
scp -i "$SSH_KEY" "$CORETHORITY_LOCAL/nginx/default.conf" "$SERVER:/opt/corethority/nginx/"
ssh -i "$SSH_KEY" "$SERVER" "cd /opt/corethority && docker compose up -d --build"

echo "==> Cleaning up old networks..."
ssh -i "$SSH_KEY" "$SERVER" "docker network rm corethority_internal 2>/dev/null || true"

echo ""
echo "==> Migration complete!"
echo "    standby.design       → OKLCH Palette Generator (HTTPS)"
echo "    46.225.131.97        → corethority (HTTP)"
