#!/usr/bin/env bash
# Read-only timings. No credentials, response bodies, or environment dumps.
set -eu
root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="$root/.env"
[[ -f "$env_file" ]] || { echo 'Missing repository .env file.' >&2; exit 1; }
# Read only these settings as data; never execute .env or print its secrets.
read_setting() {
    awk -v key="$1" '
        /^# ---- derived by deploy\./ { skip=1; next }
        /^# ---- end derived block ----/ { skip=0; next }
        !skip && $0 ~ "^[[:space:]]*" key "[[:space:]]*=" {
            sub(/^[^=]*=[[:space:]]*/, ""); sub(/\r$/, "")
            sub(/[[:space:]]+$/, "")
            if (substr($0,1,1)=="\047" || substr($0,1,1)=="\042") {
                quote=substr($0,1,1)
                if (substr($0,length($0),1)==quote) $0=substr($0,2,length($0)-2)
            } else { sub(/[[:space:]]+#.*$/, "") }
            value=$0
        }
        END { print value }
    ' "$env_file"
}
domain="$(read_setting HMDM_DOMAIN)"
[[ "$domain" =~ ^[A-Za-z0-9][A-Za-z0-9.-]*$ ]] || { echo 'Set HMDM_DOMAIN in .env to a hostname or IPv4 address (no scheme, port or path).' >&2; exit 1; }
port="$(read_setting HMDM_HTTP_PORT)"
port="${port:-8080}"
[[ "$port" =~ ^[0-9]{1,5}$ ]] && ((10#$port >= 1 && 10#$port <= 65535)) || { echo 'Invalid HMDM_HTTP_PORT in .env.' >&2; exit 1; }
mode="$(read_setting DEPLOY_MODE)"
case "${mode:-dev}" in
    prod) public="https://$domain"; host="$domain" ;;
    dev) public="http://$domain:$port"; host="$domain:$port" ;;
    *) echo 'DEPLOY_MODE must be dev or prod.' >&2; exit 1 ;;
esac
upstream="http://127.0.0.1:$port"
case "${1:-}" in
    --domain) printf '%s\n' "$domain"; exit 0 ;;
    --port) printf '%s\n' "$port"; exit 0 ;;
esac
if [[ "${1:-}" == '--check' ]]; then
    printf 'Public: %s\nUpstream: %s\nHost: %s\n' "$public" "$upstream" "$host"
    exit 0
fi
for base in "$upstream" "$public"; do
    printf '\nTesting %s\n' "$base"
    for path in / /rest/public/plugin/main/registered /remoteEntry.json; do
        for attempt in 1 2 3; do
            printf '%s attempt=%s ' "$path" "$attempt"
            curl -sS -o /dev/null --connect-timeout 5 --max-time 20 \
                -H "Host: $host" \
                -w 'HTTP=%{http_code} protocol=%{http_version} DNS=%{time_namelookup} connect=%{time_connect} TLS=%{time_appconnect} TTFB=%{time_starttransfer} total=%{time_total}\n' \
                "${base%/}$path" || true
        done
    done
done
