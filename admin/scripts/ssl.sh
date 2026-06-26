#!/usr/bin/env bash
#
# NoBrainFit Admin — SSL helper (production stack).
#
#   bash scripts/ssl.sh status              # show current cert + LE status
#   bash scripts/ssl.sh renew               # force a Let's Encrypt renewal now
#   bash scripts/ssl.sh request <domain> <email> [--staging]   # issue/renew
#   bash scripts/ssl.sh reload              # tell nginx to reload certs
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

if docker compose version >/dev/null 2>&1; then DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then DC="docker-compose"
else echo "Docker Compose introuvable." >&2; exit 1; fi

CF="docker-compose.prod.yml"
DCC() { $DC -f "$CF" "$@"; }

cmd="${1:-status}"
case "$cmd" in
  status)
    echo "── Certificat courant ──────────────────────────────"
    DCC exec -T certbot sh -c 'openssl x509 -in /certs/fullchain.pem -noout -subject -issuer -enddate 2>/dev/null' \
      || echo "(aucun certificat lisible)"
    echo
    echo "── Dernier statut Let's Encrypt ────────────────────"
    DCC exec -T certbot sh -c 'cat /control/letsencrypt.status.json 2>/dev/null' \
      || echo "(aucun statut)"
    ;;

  renew)
    echo "▸ Renouvellement Let's Encrypt…"
    DCC exec -T certbot sh -c '
      certbot renew --webroot -w /var/www/certbot \
        --deploy-hook "sh -c \"for d in /etc/letsencrypt/live/*/; do cp \$d/fullchain.pem /certs/fullchain.pem; cp \$d/privkey.pem /certs/privkey.pem; done; touch /control/reload\""
    '
    echo "✓ Terminé."
    ;;

  request)
    domain="${2:-}"; email="${3:-}"; staging="false"
    [ "${4:-}" = "--staging" ] && staging="true"
    [ -z "$domain" ] || [ -z "$email" ] && { echo "Usage: ssl.sh request <domain> <email> [--staging]" >&2; exit 1; }
    echo "▸ Demande de certificat pour $domain…"
    DCC exec -T certbot sh -c "printf '{\"domain\":\"%s\",\"email\":\"%s\",\"staging\":%s}\n' '$domain' '$email' $staging > /control/letsencrypt.request.json"
    echo "✓ Demande enregistrée. L'agent certbot la traitera sous ~15 s."
    echo "  Suivi : bash scripts/ssl.sh status"
    ;;

  reload)
    DCC exec -T certbot sh -c 'touch /control/reload'
    echo "✓ Signal de rechargement envoyé à nginx."
    ;;

  *)
    echo "Commandes : status | renew | request <domain> <email> [--staging] | reload" >&2
    exit 1
    ;;
esac
