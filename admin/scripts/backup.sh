#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="nobrainfitdb_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Load env
set -a; source .env; set +a

echo "=== NoBrainFit Admin — Backup ==="
echo "Dumping database → $BACKUP_DIR/$FILENAME"

docker compose exec -T postgres pg_dump \
  -U "${POSTGRES_USER:-nobrainfit}" \
  "${POSTGRES_DB:-nobrainfitdb}" \
  | gzip > "$BACKUP_DIR/$FILENAME"

echo "✅ Backup saved: $BACKUP_DIR/$FILENAME"

# Prune backups older than 30 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
echo "🗑  Pruned backups older than 30 days."
