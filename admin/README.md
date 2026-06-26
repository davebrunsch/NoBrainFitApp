# NoBrainFit — Admin Backend

Web admin panel (Next.js + Prisma + PostgreSQL) to manage users, subscriptions,
the AI program generators (prompts + exercise library), and the API configuration
(Ollama, Claude, Fitness API).

## Installation en une commande

Prérequis : **Docker** + **Docker Compose** (Docker Desktop suffit).

```bash
git pull
bash scripts/setup.sh
```

Le script :

1. vérifie Docker,
2. demande le **nom**, l'**email** et le **mot de passe** de l'administrateur,
   ainsi que le port et l'URL publique,
3. génère automatiquement tous les secrets (`NEXTAUTH_SECRET`, `APP_API_TOKEN`,
   mot de passe PostgreSQL) dans un fichier `.env`,
4. construit les images, démarre PostgreSQL, applique le schéma, insère les
   données initiales (admin, plans, prompts, exercices),
5. attend que le backend réponde, puis affiche l'URL de connexion.

À la fin, le backend tourne sur l'URL indiquée (par défaut
<http://localhost:3000>). Connecte-toi avec l'email / mot de passe saisis.

## Scripts

| Commande | Rôle |
|----------|------|
| `bash scripts/setup.sh`  | Installation initiale (interactive, local ou production+HTTPS) |
| `bash scripts/update.sh` | `git pull` + rebuild + migration + redémarrage |
| `bash scripts/backup.sh` | Dump PostgreSQL compressé (rétention 30 jours) |
| `bash scripts/ssl.sh`    | Gestion des certificats (`status` / `renew` / `request`) |

## Commandes Docker utiles

```bash
docker compose ps              # état des services
docker compose logs -f admin   # logs du backend
docker compose down            # arrêter (les données sont conservées)
docker compose down -v         # arrêter ET supprimer la base de données
```

## Architecture des services

```
postgres  ──(healthy)──▶  migrate  ──(completed)──▶  admin
  │                          │                          │
  base de données      db push + seed            Next.js (port 3000)
                       (one-shot, exits)
```

Le service `migrate` est un conteneur éphémère qui synchronise le schéma Prisma
(`prisma db push`) puis lance le seed. Le service `admin` n'attend que sa
réussite avant de démarrer.

## Déploiement VPS (production) + HTTPS

`bash scripts/setup.sh` propose un mode **Production** qui démarre Nginx en
reverse-proxy avec TLS, rate-limiting et gestion automatique des certificats.
Choisis ton domaine puis le type de certificat :

- **Auto-signé** — immédiat, avertissement navigateur (usage interne / test).
- **Let's Encrypt** — gratuit et reconnu. Le domaine doit pointer vers le
  serveur et les ports **80/443** doivent être ouverts. L'émission se fait
  automatiquement au premier démarrage (le panel sert d'abord un certificat
  auto-signé, puis bascule sur le certificat Let's Encrypt une fois émis).

### Cycle de vie des certificats

Tout est géré sans accès au socket Docker, via des volumes partagés et un agent
`certbot` :

```
ssl-init ─▶ génère un cert auto-signé + prépare les volumes (uid 1001)
nginx    ─▶ recharge à chaud quand /control/reload change (cert remplacé)
certbot  ─▶ traite les demandes (/control/letsencrypt.request.json)
            et renouvelle automatiquement 2×/jour
admin    ─▶ panel « Système → Certificats SSL »
```

Depuis le panel tu peux à tout moment :

- voir le certificat courant (émetteur, domaines, expiration, jours restants) ;
- **demander / renouveler** un certificat Let's Encrypt ;
- **téléverser** un certificat personnalisé (PEM cert + clé, validés) ;
- **régénérer** un certificat auto-signé.

En ligne de commande :

```bash
bash scripts/ssl.sh status                       # état du certificat
bash scripts/ssl.sh renew                        # forcer un renouvellement
bash scripts/ssl.sh request mondomaine.com me@x.fr   # émettre/renouveler
```

## Configuration des API IA

Les clés Ollama / Claude / API-Ninjas **ne sont pas** dans le `.env` : elles sont
stockées en base et se gèrent depuis le panel → **Configuration → APIs**.
