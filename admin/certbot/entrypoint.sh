#!/bin/sh
# Certbot agent: a small job runner that
#   1. watches /control/letsencrypt.request.json for issuance/renewal jobs
#      written by the admin panel (or setup.sh), and
#   2. auto-renews existing certificates twice a day.
#
# On success it copies the live cert into the shared /certs volume and touches
# /control/reload so nginx hot-reloads. No Docker socket required.
set -e

CERT_DIR="/certs"
CONTROL="/control"
WEBROOT="/var/www/certbot"
LE="/etc/letsencrypt"

REQUEST="$CONTROL/letsencrypt.request.json"
STATUS="$CONTROL/letsencrypt.status.json"

mkdir -p "$CERT_DIR" "$CONTROL" "$WEBROOT"

write_status() {
  printf '{"state":"%s","message":"%s","ts":"%s"}\n' \
    "$1" "$2" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$STATUS"
}

json_get() {
  # crude JSON string extractor: json_get <key> <file>
  grep -o "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" "$2" 2>/dev/null \
    | sed 's/.*:[[:space:]]*"//;s/"$//' | head -n1
}

install_live_cert() {
  domain="$1"
  live="$LE/live/$domain"
  if [ -f "$live/fullchain.pem" ] && [ -f "$live/privkey.pem" ]; then
    cp "$live/fullchain.pem" "$CERT_DIR/fullchain.pem"
    cp "$live/privkey.pem"   "$CERT_DIR/privkey.pem"
    chmod 644 "$CERT_DIR/fullchain.pem"
    chmod 600 "$CERT_DIR/privkey.pem" 2>/dev/null || true
    return 0
  fi
  return 1
}

process_request() {
  [ -f "$REQUEST" ] || return 0

  domain="$(json_get domain "$REQUEST")"
  email="$(json_get email "$REQUEST")"
  staging=""
  grep -q '"staging"[[:space:]]*:[[:space:]]*true' "$REQUEST" 2>/dev/null && staging="--staging"
  rm -f "$REQUEST"

  if [ -z "$domain" ] || [ -z "$email" ]; then
    write_status error "Domaine ou email manquant dans la requête."
    return 0
  fi

  # Expand a comma-separated domain list into multiple -d flags.
  # The first domain names the certbot live/ directory.
  primary="$(echo "$domain" | cut -d',' -f1 | tr -d ' ')"
  dflags=""
  for d in $(echo "$domain" | tr ',' ' '); do
    [ -n "$d" ] && dflags="$dflags -d $d"
  done

  write_status running "Émission du certificat pour $domain…"
  echo "[certbot] requesting cert for $domain (staging=${staging:-no})"

  if certbot certonly --webroot -w "$WEBROOT" \
        $dflags --email "$email" \
        --agree-tos --no-eff-email --non-interactive \
        --keep-until-expiring --cert-name "$primary" $staging; then
    if install_live_cert "$primary"; then
      touch "$CONTROL/reload"
      write_status success "Certificat actif pour $domain."
      echo "[certbot] success for $domain"
    else
      write_status error "Certificat émis mais introuvable dans $LE/live/$domain."
    fi
  else
    write_status error "Échec de l'émission pour $domain. Vérifie le DNS et les ports 80/443."
    echo "[certbot] FAILED for $domain"
  fi
}

# ── Renewal loop (every 12h) ──────────────────────────────────────────────────
renew_loop() {
  while true; do
    sleep 43200
    echo "[certbot] running scheduled renewal check…"
    certbot renew --webroot -w "$WEBROOT" --quiet \
      --deploy-hook "touch $CONTROL/renewed" || true
    if [ -f "$CONTROL/renewed" ]; then
      for d in "$LE"/live/*/; do
        [ -d "$d" ] || continue
        name="$(basename "$d")"
        install_live_cert "$name" || true
      done
      rm -f "$CONTROL/renewed"
      touch "$CONTROL/reload"
      echo "[certbot] renewed certificate(s), nginx reload signalled."
    fi
  done
}

renew_loop &

echo "[certbot] agent ready — watching for jobs."
# ── Request-watcher loop (every 15s) ──────────────────────────────────────────
while true; do
  process_request
  sleep 15
done
