#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "=== NoBrainFit Admin — Setup ==="

# Check .env exists
if [ ! -f .env ]; then
  echo "Creating .env from .env.example…"
  cp .env.example .env
  echo "⚠  Edit .env before continuing (set NEXTAUTH_SECRET, passwords, etc.)"
  echo "   Run: nano .env"
  exit 1
fi

# Generate a random NEXTAUTH_SECRET if still the placeholder
if grep -q "CHANGE_ME" .env; then
  SECRET=$(openssl rand -base64 32)
  sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${SECRET}|" .env
  echo "✓ Generated NEXTAUTH_SECRET"
fi

echo "Starting containers…"
docker compose up -d --build

echo "Waiting for postgres to be ready…"
until docker compose exec -T postgres pg_isready -U "$(grep POSTGRES_USER .env | cut -d= -f2)" 2>/dev/null; do
  sleep 2
done

echo "Running migrations…"
docker compose exec admin npx prisma migrate deploy

echo "Seeding initial data…"
docker compose exec admin npx prisma db seed

echo ""
echo "✅ Setup complete!"
echo "   Admin panel: http://localhost:3000"
echo "   Login with the ADMIN_EMAIL / ADMIN_PASSWORD from your .env"
