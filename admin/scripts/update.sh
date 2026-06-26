#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "=== NoBrainFit Admin — Update ==="

echo "Pulling latest code…"
git pull

echo "Rebuilding image…"
docker compose build admin

echo "Applying migrations…"
docker compose run --rm admin npx prisma migrate deploy

echo "Restarting service (zero-downtime)…"
docker compose up -d --no-deps admin

echo "✅ Update complete!"
docker compose ps
