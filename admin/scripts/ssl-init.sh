#!/bin/sh
# One-shot SSL initializer (runs as root before nginx/admin/certbot).
#
#  - prepares the shared volumes and makes them writable by the admin (uid 1001)
#  - generates a self-signed bootstrap certificate so nginx can start even
#    before a real certificate has been issued
#  - on first production boot with SSL_MODE=letsencrypt, queues an issuance job
#    that the certbot agent will pick up
set -e

apk add --no-cache openssl >/dev/null 2>&1 || true

mkdir -p /certs /control /var/www/certbot
# The admin panel runs as uid 1001 and needs to write certs + control files.
chown -R 1001:1001 /certs /control 2>/dev/null || true
chmod 755 /certs /control 2>/dev/null || true

DOMAIN="${SSL_DOMAIN:-localhost}"

if [ ! -f /certs/fullchain.pem ] || [ ! -f /certs/privkey.pem ]; then
  echo "[ssl-init] generating self-signed bootstrap certificate for ${DOMAIN}"
  openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
    -keyout /certs/privkey.pem -out /certs/fullchain.pem \
    -subj "/CN=${DOMAIN}" -addext "subjectAltName=DNS:${DOMAIN}" >/dev/null 2>&1
  chown 1001:1001 /certs/fullchain.pem /certs/privkey.pem 2>/dev/null || true
  chmod 644 /certs/fullchain.pem
  chmod 600 /certs/privkey.pem
fi

# Queue a Let's Encrypt issuance on first prod boot (idempotent via marker file).
if [ "${SSL_MODE}" = "letsencrypt" ] && [ -n "${SSL_DOMAIN}" ] && [ -n "${SSL_EMAIL}" ] && [ ! -f /control/le-bootstrapped ]; then
  echo "[ssl-init] queueing Let's Encrypt issuance for ${SSL_DOMAIN}"
  staging=false
  [ "${SSL_STAGING}" = "true" ] && staging=true
  printf '{"domain":"%s","email":"%s","staging":%s}\n' "${SSL_DOMAIN}" "${SSL_EMAIL}" "${staging}" > /control/letsencrypt.request.json
  chown 1001:1001 /control/letsencrypt.request.json 2>/dev/null || true
  touch /control/le-bootstrapped
fi

echo "[ssl-init] done"
