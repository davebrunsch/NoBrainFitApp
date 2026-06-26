#!/usr/bin/env bash
#
# NoBrainFit Admin — fully automated setup.
#
#   git pull && bash scripts/setup.sh
#
# Asks for the admin account, the deployment type (local or production) and,
# for production, the HTTPS strategy (self-signed or Let's Encrypt). Generates
# every secret, builds the containers, provisions TLS, prepares the database,
# and leaves the backend running.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# ── pretty output ─────────────────────────────────────────────────────────────
BOLD=$'\033[1m'; DIM=$'\033[2m'; RESET=$'\033[0m'
BLUE=$'\033[34m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RED=$'\033[31m'
info()  { printf "%s\n" "${BLUE}▸${RESET} $1"; }
ok()    { printf "%s\n" "${GREEN}✓${RESET} $1"; }
warn()  { printf "%s\n" "${YELLOW}!${RESET} $1"; }
err()   { printf "%s\n" "${RED}✗${RESET} $1" >&2; }
hr()    { printf "%s\n" "${DIM}────────────────────────────────────────────────────────${RESET}"; }

printf "\n%s\n" "${BOLD}${BLUE}  NoBrainFit Admin — Setup${RESET}"
hr

# ── 1. prerequisites ──────────────────────────────────────────────────────────
need() { command -v "$1" >/dev/null 2>&1; }

if ! need docker; then
  err "Docker n'est pas installé. → https://docs.docker.com/get-docker/"
  exit 1
fi
if docker compose version >/dev/null 2>&1; then DC="docker compose"
elif need docker-compose; then DC="docker-compose"
else err "Docker Compose introuvable."; exit 1; fi
if ! docker info >/dev/null 2>&1; then
  err "Le daemon Docker ne tourne pas. Démarre Docker puis relance ce script."
  exit 1
fi

gen_secret() {
  if need openssl; then openssl rand -base64 "${1:-32}" | tr -d '\n/+=' | cut -c1-"${2:-44}"
  else head -c 96 /dev/urandom | LC_ALL=C tr -dc 'A-Za-z0-9' | cut -c1-"${2:-44}"; fi
}

ok "Docker détecté ($DC)"

# ── 2. existing install? ──────────────────────────────────────────────────────
RECONFIGURE=1
if [ -f .env ]; then
  warn "Un fichier .env existe déjà."
  read -r -p "    Le reconfigurer (réécrit les identifiants admin) ? [o/N] " ans
  case "${ans:-N}" in o|O|y|Y) RECONFIGURE=1 ;; *) RECONFIGURE=0; info "Conservation du .env existant." ;; esac
fi

COMPOSE_FILE="docker-compose.yml"

if [ "$RECONFIGURE" -eq 1 ]; then
  # ── 3. deployment type ──────────────────────────────────────────────────────
  hr
  printf "%s\n\n" "${BOLD}Type de déploiement${RESET}"
  echo "  1) Local / développement   — HTTP direct sur un port (pas de TLS)"
  echo "  2) Production              — Nginx + HTTPS (auto-signé ou Let's Encrypt)"
  echo
  read -r -p "  Choix [1] : " DEPLOY
  DEPLOY="${DEPLOY:-1}"

  # ── 4. admin account ────────────────────────────────────────────────────────
  hr
  printf "%s\n\n" "${BOLD}Compte administrateur${RESET}"
  read -r -p "  Nom de l'administrateur [Admin] : " ADMIN_NAME
  ADMIN_NAME="${ADMIN_NAME:-Admin}"
  while true; do
    read -r -p "  Email de connexion : " ADMIN_EMAIL
    printf "%s" "$ADMIN_EMAIL" | grep -Eq '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' && break
    err "  Email invalide, réessaie."
  done
  while true; do
    read -r -s -p "  Mot de passe (min. 8 caractères) : " ADMIN_PASSWORD; echo
    [ "${#ADMIN_PASSWORD}" -lt 8 ] && { err "  Trop court (8 min.)."; continue; }
    read -r -s -p "  Confirme le mot de passe : " ADMIN_PASSWORD2; echo
    [ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD2" ] && { err "  Ne correspondent pas."; continue; }
    break
  done

  # secrets + DB creds (shared)
  NEXTAUTH_SECRET="$(gen_secret 32 44)"
  APP_API_TOKEN="$(gen_secret 32 44)"
  POSTGRES_USER="nobrainfit"; POSTGRES_DB="nobrainfit"
  POSTGRES_PASSWORD="$(gen_secret 24 32)"

  # SSL defaults
  SSL_MODE="none"; SSL_DOMAIN="localhost"; SSL_EMAIL=""; SSL_STAGING="false"

  if [ "$DEPLOY" = "2" ]; then
    # ── 5a. production / SSL ──────────────────────────────────────────────────
    COMPOSE_FILE="docker-compose.prod.yml"
    hr
    printf "%s\n\n" "${BOLD}Production — domaine & HTTPS${RESET}"
    while true; do
      read -r -p "  Domaine(s) du panel, séparés par des virgules (ex: admin.mondomaine.com) : " SSL_DOMAIN
      printf "%s" "$SSL_DOMAIN" | grep -Eq '^[a-zA-Z0-9.,[:space:]-]+$' && [ -n "$SSL_DOMAIN" ] && break
      err "  Domaine invalide."
    done
    # normalize (strip spaces) so the value is safe in .env / shell
    SSL_DOMAIN="$(printf "%s" "$SSL_DOMAIN" | tr -d ' ')"
    # primary domain (first of the list) → used for the canonical URL
    PRIMARY_DOMAIN="$(printf "%s" "$SSL_DOMAIN" | cut -d',' -f1)"
    echo
    echo "  Certificat HTTPS :"
    echo "    1) Auto-signé        — immédiat, avertissement navigateur (interne/test)"
    echo "    2) Let's Encrypt     — gratuit, reconnu (le domaine doit pointer ici, ports 80/443 ouverts)"
    echo
    read -r -p "  Choix [2] : " SSLCHOICE
    SSLCHOICE="${SSLCHOICE:-2}"
    if [ "$SSLCHOICE" = "1" ]; then
      SSL_MODE="self-signed"
    else
      SSL_MODE="letsencrypt"
      while true; do
        read -r -p "  Email Let's Encrypt (alertes d'expiration) : " SSL_EMAIL
        printf "%s" "$SSL_EMAIL" | grep -Eq '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' && break
        err "  Email invalide."
      done
      read -r -p "  Mode test (staging) pour valider sans limite de débit ? [o/N] " stg
      case "${stg:-N}" in o|O|y|Y) SSL_STAGING="true" ;; *) SSL_STAGING="false" ;; esac
    fi
    APP_PORT="3000"; POSTGRES_PORT="5432"
    NEXTAUTH_URL="https://${PRIMARY_DOMAIN}"
  else
    # ── 5b. local ─────────────────────────────────────────────────────────────
    hr
    printf "%s\n\n" "${BOLD}Réseau (local)${RESET}"
    read -r -p "  Port d'écoute du panel [3000] : " APP_PORT; APP_PORT="${APP_PORT:-3000}"
    read -r -p "  URL publique [http://localhost:${APP_PORT}] : " NEXTAUTH_URL
    NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:${APP_PORT}}"
    read -r -p "  Port PostgreSQL exposé [5432] : " POSTGRES_PORT; POSTGRES_PORT="${POSTGRES_PORT:-5432}"
  fi

  # ── 6. write .env ───────────────────────────────────────────────────────────
  info "Génération des secrets et du fichier .env…"
  cat > .env <<EOF
# Generated by scripts/setup.sh on $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# Do not commit this file.

# ── Deployment ────────────────────────────────────────────────────────────────
COMPOSE_FILE=${COMPOSE_FILE}

# ── Database ──────────────────────────────────────────────────────────────────
POSTGRES_DB=${POSTGRES_DB}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_PORT=${POSTGRES_PORT}
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}

# ── App ───────────────────────────────────────────────────────────────────────
APP_PORT=${APP_PORT}
NEXTAUTH_URL=${NEXTAUTH_URL}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
APP_API_TOKEN=${APP_API_TOKEN}

# ── Admin account (seeded into the database) ──────────────────────────────────
ADMIN_NAME=${ADMIN_NAME}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}

# ── SSL / TLS (production) ────────────────────────────────────────────────────
SSL_MODE=${SSL_MODE}
SSL_DOMAIN=${SSL_DOMAIN}
SSL_EMAIL=${SSL_EMAIL}
SSL_STAGING=${SSL_STAGING}
EOF
  chmod 600 .env
  ok ".env généré (permissions 600)"
else
  # reuse existing .env to know which compose file to drive
  COMPOSE_FILE="$(grep -E '^COMPOSE_FILE=' .env | cut -d= -f2 || true)"
  COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
fi

# protect .env
if [ -f .gitignore ]; then grep -qxF '.env' .gitignore || echo '.env' >> .gitignore
else echo '.env' > .gitignore; fi

DCC() { $DC -f "$COMPOSE_FILE" "$@"; }

# ── 7. build & launch ─────────────────────────────────────────────────────────
hr
info "Déploiement : ${BOLD}${COMPOSE_FILE}${RESET}"
info "Construction des images (quelques minutes la 1re fois)…"
DCC build

info "Démarrage de la stack (db → migrate → ssl → backend → nginx)…"
DCC up -d

# ── 8. wait for the backend ───────────────────────────────────────────────────
# Read values straight from .env (never `source` it — passwords/domains may
# contain characters that break shell parsing).
envget() { grep -E "^$1=" .env | head -n1 | cut -d= -f2-; }
if [ "$RECONFIGURE" -eq 0 ]; then
  APP_PORT="$(envget APP_PORT)"
  NEXTAUTH_URL="$(envget NEXTAUTH_URL)"
  SSL_MODE="$(envget SSL_MODE)"
  ADMIN_EMAIL="$(envget ADMIN_EMAIL)"
fi

is_prod() { [ "$COMPOSE_FILE" = "docker-compose.prod.yml" ]; }
if is_prod; then HEALTH_URL="https://127.0.0.1/api/health"; else HEALTH_URL="http://localhost:${APP_PORT:-3000}/api/health"; fi

info "Attente du backend…"
ready=0
for i in $(seq 1 60); do
  if need curl && curl -fsk "$HEALTH_URL" >/dev/null 2>&1; then ready=1; break; fi
  if DCC ps 2>/dev/null | grep -q 'admin.*healthy'; then ready=1; break; fi
  # surface a failed one-shot job early
  code="$(DCC ps -a --format '{{.Service}} {{.ExitCode}}' 2>/dev/null | awk '$1=="migrate"{print $2}')"
  if [ -n "${code:-}" ] && [ "${code:-0}" != "0" ]; then
    err "Le service 'migrate' a échoué (exit ${code})."; echo; DCC logs migrate | tail -n 40; exit 1
  fi
  printf "  %s/60\r" "$i"; sleep 3
done
echo

if [ "$ready" != "1" ]; then
  err "Le backend n'a pas répondu à temps. Logs :"; echo; DCC logs --tail 50 admin; exit 1
fi

# ── 9. done ───────────────────────────────────────────────────────────────────
hr
printf "\n%s\n\n" "${BOLD}${GREEN}🎉 Backend en ligne !${RESET}"
printf "  %s %s\n"   "${BOLD}Panel :${RESET}" "${NEXTAUTH_URL}"
printf "  %s %s\n"   "${BOLD}Login :${RESET}" "${ADMIN_EMAIL}"
printf "  %s %s\n\n" "${BOLD}Pass  :${RESET}" "(celui saisi à l'instant)"

if is_prod; then
  case "${SSL_MODE}" in
    letsencrypt)
      warn "Let's Encrypt : émission en cours en arrière-plan (jusqu'à ~1 min)."
      echo  "   Suivi : $DC -f $COMPOSE_FILE logs -f certbot"
      echo  "   Le panel sert d'abord un certificat auto-signé, puis bascule"
      echo  "   automatiquement sur le certificat Let's Encrypt une fois émis." ;;
    self-signed)
      warn "Certificat auto-signé : le navigateur affichera un avertissement (normal)." ;;
  esac
  echo
  echo  "  Gestion des certificats dans le panel → ${BOLD}Système → Certificats SSL${RESET}"
fi
echo
printf "%s\n" "${DIM}  Commandes utiles :"
printf "%s\n" "    $DC -f $COMPOSE_FILE ps"
printf "%s\n" "    $DC -f $COMPOSE_FILE logs -f admin"
printf "%s\n" "    bash scripts/update.sh   ·   bash scripts/backup.sh   ·   bash scripts/ssl.sh status${RESET}"
echo
