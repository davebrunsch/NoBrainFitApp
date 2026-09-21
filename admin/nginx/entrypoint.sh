#!/bin/sh
# Nginx entrypoint with a hot-reload watcher.
#
# Watches /control/reload (touched by the admin panel / certbot when a
# certificate changes) and runs `nginx -s reload` so new certs are picked up
# without restarting the container. Also reloads periodically to catch
# automatic Let's Encrypt renewals.
set -e

CONTROL_SIGNAL="/control/reload"

reload_if_valid() {
  if nginx -t 2>/tmp/nginx-test.log; then
    nginx -s reload && echo "[nginx-reloader] reloaded $(date -u +%H:%M:%S)"
  else
    echo "[nginx-reloader] config test failed, skipping reload:"
    cat /tmp/nginx-test.log
  fi
}

# Background watcher: signal-driven + 6h safety net for renewals.
(
  # Snapshot the baseline once so the first real change (e.g. the initial
  # Let's Encrypt issuance) triggers a reload, but startup itself does not.
  last="$(stat -c %Y "$CONTROL_SIGNAL" 2>/dev/null || echo "")"
  elapsed=0
  while true; do
    cur="$(stat -c %Y "$CONTROL_SIGNAL" 2>/dev/null || echo "")"
    if [ "$cur" != "$last" ]; then
      reload_if_valid
      last="$cur"
    fi
    elapsed=$((elapsed + 5))
    if [ "$elapsed" -ge 21600 ]; then    # every 6h
      reload_if_valid
      elapsed=0
    fi
    sleep 5
  done
) &

echo "[nginx] starting…"
exec nginx -g 'daemon off;'
