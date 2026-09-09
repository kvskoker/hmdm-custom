#!/usr/bin/env bash
# One command for both modes. Everything comes from .env.
#
#   ./deploy.sh up        start (build if needed)
#   ./deploy.sh rebuild   rebuild the server image, then start
#   ./deploy.sh down      stop, keeping data
#   ./deploy.sh logs      follow the server log
#   ./deploy.sh reset     stop AND DELETE the database and uploaded files
#
# Anything else is passed straight to "docker compose", so
# "./deploy.sh ps", "./deploy.sh exec db psql -U hmdm -d hmdm" and
# "./deploy.sh logs --tail=500 hmdm" all work.
#
# DEPLOY_MODE in .env decides http-on-localhost versus https-on-your-domain.
# Compose cannot derive one variable from another, so this script does that one
# step. It writes the results back into .env in a managed block, which means
# plain "docker compose ..." works too - without that, every compose command
# run by hand fails with "required variable HMDM_BASE_HOST is missing a value".
set -euo pipefail
cd "$(dirname "$0")"

[ -f .env ] || { cp .env.example .env; echo "Created .env from the template - edit it, then run this again."; exit 1; }

MARK_BEGIN="# ---- derived by deploy.sh from DEPLOY_MODE - do not edit ----"
MARK_END="# ---- end derived block ----"

# Read only the part of .env a human maintains. The derived block at the end is
# this script's own output; sourcing it would let last run's values win over
# this run's derivation - which is how a stale HMDM_BASE_HOST or PROXY_IP_HEADER
# would quietly survive a change to DEPLOY_MODE.
USER_ENV=$(awk -v e="$MARK_END" '
    /^# ---- derived by deploy\.(sh|ps1) from DEPLOY_MODE/ { skip = 1; next }
    $0 == e                                                { skip = 0; next }
    !skip                                                  { print }
  ' .env)

# shellcheck disable=SC1090,SC1091
set -a; . /dev/stdin <<< "$USER_ENV"; set +a

: "${DEPLOY_MODE:=dev}"
: "${HMDM_DOMAIN:?set HMDM_DOMAIN in .env}"

case "$DEPLOY_MODE" in
  prod)
    : "${LETSENCRYPT_EMAIL:?set LETSENCRYPT_EMAIL in .env - Let us Encrypt requires it}"
    COMPOSE_PROFILES=prod
    HMDM_PROTOCOL=https
    # Devices reach the panel on 443 through Caddy, so the advertised host
    # carries no port. Tomcat is bound to loopback; only Caddy talks to it.
    HMDM_BASE_HOST="$HMDM_DOMAIN"
    PANEL_PUBLISH="127.0.0.1:8080"
    DB_PUBLISH="127.0.0.1:5433"
    # Caddy is the only thing in front of Tomcat. Trusting the whole Docker
    # bridge range is safe here because nothing else can reach the container.
    PROXY_ADDRESSES="${PROXY_ADDRESSES:-172.16.0.0/12}"
    PROXY_IP_HEADER="${PROXY_IP_HEADER:-X-Real-IP}"
    ;;
  dev)
    COMPOSE_PROFILES=""
    HMDM_PROTOCOL=http
    HMDM_BASE_HOST="$HMDM_DOMAIN:8080"
    PANEL_PUBLISH="8080"
    DB_PUBLISH="5433"
    PROXY_ADDRESSES=""
    PROXY_IP_HEADER=""
    ;;
  *) echo "DEPLOY_MODE must be 'dev' or 'prod', not '$DEPLOY_MODE'"; exit 1 ;;
esac

export COMPOSE_PROFILES HMDM_PROTOCOL HMDM_BASE_HOST PANEL_PUBLISH DB_PUBLISH \
       PROXY_ADDRESSES PROXY_IP_HEADER

# --- keep .env in step with DEPLOY_MODE --------------------------------------
# Compose reads .env by itself, so once these values are in there, every plain
# "docker compose" command works exactly as this script's do. The block is
# rewritten on every run; edit DEPLOY_MODE and HMDM_DOMAIN above it, not this.
cp .env .env.bak
{
  printf '%s\n\n' "$USER_ENV"
  printf '%s\n' "$MARK_BEGIN"
  printf 'COMPOSE_PROFILES=%s\n' "$COMPOSE_PROFILES"
  printf 'HMDM_PROTOCOL=%s\n'    "$HMDM_PROTOCOL"
  printf 'HMDM_BASE_HOST=%s\n'   "$HMDM_BASE_HOST"
  printf 'PANEL_PUBLISH=%s\n'    "$PANEL_PUBLISH"
  printf 'DB_PUBLISH=%s\n'       "$DB_PUBLISH"
  printf 'PROXY_ADDRESSES=%s\n'  "$PROXY_ADDRESSES"
  printf 'PROXY_IP_HEADER=%s\n'  "$PROXY_IP_HEADER"
  printf '%s\n' "$MARK_END"
} > .env

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
  logs)    shift
           if [ "$#" -eq 0 ]; then docker compose logs -f hmdm
           else docker compose logs "$@"; fi ;;
  reset)
    read -r -p "This deletes the database and every uploaded APK. Type 'yes': " a
    [ "$a" = yes ] && docker compose down -v || echo "Cancelled."
    ;;
  *)       docker compose "$@" ;;
esac
