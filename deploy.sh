#!/usr/bin/env bash
# One command for both modes. Everything comes from .env.
#
#   ./deploy.sh up        start (build if needed)
#   ./deploy.sh rebuild   rebuild the server image, then start
#   ./deploy.sh down      stop, keeping data
#   ./deploy.sh logs      follow the server log
#   ./deploy.sh reset     stop AND DELETE the database and uploaded files
#
# DEPLOY_MODE in .env decides http-on-localhost versus https-on-your-domain.
# Compose cannot derive one variable from another, so this script does that
# one step and then hands over to plain "docker compose".
set -euo pipefail
cd "$(dirname "$0")"

[ -f .env ] || { cp .env.example .env; echo "Created .env from the template - edit it, then run this again."; exit 1; }

# shellcheck disable=SC1091
set -a; . ./.env; set +a

: "${DEPLOY_MODE:=dev}"
: "${HMDM_DOMAIN:?set HMDM_DOMAIN in .env}"

case "$DEPLOY_MODE" in
  prod)
    : "${LETSENCRYPT_EMAIL:?set LETSENCRYPT_EMAIL in .env - Let us Encrypt requires it}"
    export COMPOSE_PROFILES=prod
    export HMDM_PROTOCOL=https
    # Devices reach the panel on 443 through Caddy, so the advertised host
    # carries no port. Tomcat is bound to loopback; only Caddy talks to it.
    export HMDM_BASE_HOST="$HMDM_DOMAIN"
    export PANEL_PUBLISH="127.0.0.1:8080"
    export DB_PUBLISH="127.0.0.1:5433"
    # Caddy is the only thing in front of Tomcat. Trusting the whole Docker
    # bridge range is safe here because nothing else can reach the container.
    export PROXY_ADDRESSES="${PROXY_ADDRESSES:-172.16.0.0/12}"
    export PROXY_IP_HEADER="${PROXY_IP_HEADER:-X-Real-IP}"
    ;;
  dev)
    export COMPOSE_PROFILES=""
    export HMDM_PROTOCOL=http
    export HMDM_BASE_HOST="$HMDM_DOMAIN:8080"
    export PANEL_PUBLISH="8080"
    export DB_PUBLISH="5433"
    export PROXY_ADDRESSES=""
    ;;
  *) echo "DEPLOY_MODE must be 'dev' or 'prod', not '$DEPLOY_MODE'"; exit 1 ;;
esac

banner() {
    echo
    echo "  mode     $DEPLOY_MODE"
    echo "  panel    $HMDM_PROTOCOL://$HMDM_DOMAIN$( [ "$DEPLOY_MODE" = dev ] && echo :8080 )"
    echo "  devices  advertised as $HMDM_PROTOCOL://$HMDM_BASE_HOST, MQTT on $HMDM_DOMAIN:31000"
    echo
}

case "${1:-up}" in
  up)      banner; docker compose up -d ;;
  rebuild) banner; docker compose build hmdm && docker compose up -d ;;
  down)    docker compose down ;;
  logs)    docker compose logs -f hmdm ;;
  reset)
    read -r -p "This deletes the database and every uploaded APK. Type 'yes': " a
    [ "$a" = yes ] && docker compose down -v || echo "Cancelled."
    ;;
  *) echo "Usage: $0 {up|rebuild|down|logs|reset}"; exit 1 ;;
esac
