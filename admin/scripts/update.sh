#!/usr/bin/env bash
#
# NoBrainFit Admin — update an existing install.
#   bash scripts/update.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

if docker compose version >/dev/null 2>&1; then DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then DC="docker-compose"
else echo "Docker Compose introuvable." >&2; exit 1; fi

if [ ! -f .env ]; then
  echo "Aucun .env trouvé — lance d'abord: bash scripts/setup.sh" >&2
  exit 1
fi

echo "▸ Récupération du code…"
git pull --ff-only || echo "  (git pull ignoré — pas un dépôt ou déjà à jour)"

echo "▸ Reconstruction des images…"
$DC build

# `up -d` re-resolves the dependency chain: if the schema changed, the migrator
# image changes → migrate re-runs (db push + idempotent seed) before admin
# restarts. If nothing changed, only updated services are recreated.
echo "▸ Application des migrations + redémarrage…"
$DC up -d

echo "✓ Mise à jour terminée."
$DC ps
