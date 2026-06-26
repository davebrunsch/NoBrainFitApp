#!/usr/bin/env bash
#
# NoBrainFit Admin — database backup (gzipped pg_dump, 30-day retention).
#   bash scripts/backup.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

if docker compose version >/dev/null 2>&1; then DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then DC="docker-compose"
else echo "Docker Compose introuvable." >&2; exit 1; fi

BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="nobrainfit_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Read only what we need (never `source` .env — values may contain spaces/$).
envget() { grep -E "^$1=" .env | head -n1 | cut -d= -f2-; }
POSTGRES_USER="$(envget POSTGRES_USER)"
POSTGRES_DB="$(envget POSTGRES_DB)"

echo "=== NoBrainFit Admin — Backup ==="
echo "Dumping database → $BACKUP_DIR/$FILENAME"

$DC exec -T postgres pg_dump \
  -U "${POSTGRES_USER:-nobrainfit}" \
  "${POSTGRES_DB:-nobrainfit}" \
  | gzip > "$BACKUP_DIR/$FILENAME"

echo "✅ Backup saved: $BACKUP_DIR/$FILENAME"

# Prune backups older than 30 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
echo "🗑  Pruned backups older than 30 days."
