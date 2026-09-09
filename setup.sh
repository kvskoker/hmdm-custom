#!/usr/bin/env bash
# hmdm-server and hmdm-android are part of this repository now - there is nothing
# to clone. This script only checks that the tools needed to build are present.
#
# (It used to clone both projects from GitHub. Kept as a no-op so anyone following
# the old README instructions gets told what changed instead of a confusing error.)
set -e
cd "$(dirname "$0")"

ok=1
for cmd in docker; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "MISSING: $cmd"; ok=0
    fi
done
docker compose version >/dev/null 2>&1 || { echo "MISSING: docker compose (v2)"; ok=0; }

[ -f .env ] || { echo "No .env yet - copying .env.example"; cp .env.example .env; }

if [ "$ok" = "1" ]; then
    echo "Ready. Build and run with:"
    echo "    docker compose up --build"
    echo "Then open http://localhost:8080  (admin / admin)"
else
    echo "Install the missing tools above, then re-run."
    exit 1
fi
