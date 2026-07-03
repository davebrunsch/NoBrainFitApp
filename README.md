# NoBrainFit

> **Appuie. L'app s'occupe du reste.**

Application Flutter de fitness et nutrition minimaliste — zéro réflexion, zéro friction — accompagnée de son **back-end d'administration** (Next.js + Prisma + PostgreSQL) qui pilote l'IA, les comptes, les abonnements et les quotas.

---

## Sommaire

- [Concept](#concept)
- [Structure du dépôt](#structure-du-dépôt)
- [Fonctionnalités de l'app](#fonctionnalités-de-lapp)
- [Backends IA](#backends-ia)
- [Console d'administration](#console-dadministration)
- [API applicative](#api-applicative)
- [Stack technique](#stack-technique)
- [Architecture du code Flutter](#architecture-du-code-flutter)
- [Design system — charte V2.0](#design-system--charte-v20)
- [Configuration Android](#configuration-android)
- [Démarrage rapide](#démarrage-rapide)
- [CI/CD](#cicd)
- [Données & vie privée](#données--vie-privée)

---

## Concept

NoBrainFit repose sur une philosophie simple : éliminer toute friction entre l'intention et l'action. L'utilisateur répond à 2 questions maximum (des boutons, jamais de texte à saisir), l'app fait le reste grâce à l'IA.

**Trois piliers :**

| Pilier | Action | Résultat |
|--------|--------|----------|
| **Manger** | Décrire son repas (ou choisir un type) | Estimation kcal + macros par IA, suivi journalier |
| **S'entraîner** | Choisir durée + lieu (ou objectif + matériel) | Séance complète générée par IA, guidée série par série |
| **Cuisiner** | Choisir effort + portions | 3 recettes + liste de courses persistante |

**Cible :** 18-35 ans, actifs mais débordés, qui veulent prendre soin d'eux sans se prendre la tête.

---

## Structure du dépôt

```
NoBrainFitApp/
├── lib/                  # Application Flutter (Dart)
├── android/              # Projet Android (Gradle, manifest, ressources)
├── assets/fonts/         # Space Grotesk + Space Mono (embarquées)
├── admin/                # Back-end : console admin + API (Next.js 15 / Prisma / PostgreSQL)
│   ├── src/app/(admin)/  # Pages de la console (dashboard, users, plans…)
│   ├── src/app/api/      # API REST (admin + app mobile)
│   ├── prisma/           # Schéma + seed
│   └── scripts/          # setup.sh, update.sh, backup.sh, ssl.sh (déploiement Docker)
├── demo/                 # Maquettes HTML statiques (app + charte graphique)
├── DESIGN_BRIEF.md       # Brief design du projet
├── GraphicChart.html     # Charte graphique interactive (bundle HTML)
└── .github/workflows/    # CI : analyse + typecheck + build APK
```

---

## Fonctionnalités de l'app

### Démarrage — Compte + profil

À la première ouverture, l'app est verrouillée derrière deux étapes :

1. **Connexion / création de compte** — écran dédié branché sur `POST /api/app/auth` (token JWT 30 jours stocké localement). Un bouton **« Essayer en mode démo »** permet de passer cette étape sans aucun backend.
2. **Questionnaire de profil** — onboarding en plusieurs étapes pour construire le contexte de l'utilisateur :
   - Mensurations : sexe, âge, taille, poids (+ poids cible optionnel)
   - Niveau d'expérience (Débutant / Intermédiaire / Confirmé)
   - Mode de vie (Sédentaire → Très actif)
   - Objectif (Perte de gras / Muscle / Recomposition / Forme / Performance)
   - Fréquence d'entraînement (1–7 séances/sem)
   - Matériel à disposition + abonnement en salle

Le profil est stocké **localement** (`SharedPreferences`, source de vérité pour l'UI) **et synchronisé avec le serveur** (`GET`/`PUT /api/app/profile`) — il suit l'utilisateur d'un appareil à l'autre. À la connexion, l'app adopte le profil distant s'il est complet ; à chaque enregistrement, elle le repousse (best-effort). Métriques dérivées calculées à la volée : **IMC**, **métabolisme de base** (Mifflin-St Jeor), **dépense énergétique (TDEE)** et **cible calorique** selon l'objectif.

Le routage (`GoRouter`) applique la règle :
`non connecté (ni démo) → /auth` · `connecté sans profil → /onboarding` · sinon l'app.

### Accueil — Le hub 3 boutons

- Bandeau de stats du jour : **kcal consommées**, **séance faite/repos**, **streak** d'entraînement (jours consécutifs).
- 3 rangées d'action (Manger / S'entraîner / Cuisiner). La rangée Training propose des **quick picks** (15 min · Maison, 30 min · Salle, 45 min · Dehors) via bottom sheet, ou un glissement pour le flow complet.
- Accès Bibliothèque (historique + programmes sauvegardés) et Paramètres.

### Manger — Suivi nutrition

- **Objectif nutritionnel** (perte / maintien / prise de masse) + poids → cibles kcal et macros calculées (protéines / glucides / lipides).
- **Log d'un repas en texte libre** (« 150 g de poulet, un bol de riz ») → l'IA estime kcal + macros (`estimateFood`).
- Dashboard du jour : anneau calories, barres de macros vs cibles, liste des repas (suppression d'un geste).
- **Conseil nutritionnel IA** contextuel après chaque repas loggé (bannière refermable).

### S'entraîner — Deux générateurs + séance guidée

- **Séance classique** : durée (15/30/45/60 min) + lieu (Maison / Salle / Dehors / Cardio) → 4 à 6 exercices générés.
- **Programme IA (RAG)** : objectif + durée + matériel → l'app récupère une **liste d'exercices vérifiés** (bibliothèque du serveur, API fitness ou pool local selon le backend) et impose à l'IA de ne piocher que dedans — zéro exercice halluciné.
- **Séance guidée plein écran** : un exercice à la fois, série par série, **timer de repos** circulaire (+15 s, passer), vibration/son configurables, résumé de fin (exercices, séries, durée).
- **Bibliothèque** : historique des séances terminées (streak) + programmes **sauvegardés** rejouables sans régénération.
- Fiche exercice en bottom sheet (muscle, matériel, difficulté).

### Cuisiner — 3 recettes + courses

- Niveau d'effort (La flemme 10 min / Un peu 20 min / Motivé 45 min+) + portions (Solo / 2 personnes / Famille / Meal prep).
- 3 recettes avec temps, calories et macros par portion.
- **Détail complet à la demande** : ingrédients + étapes générés par IA (`recipe-detail`).
- **Liste de courses persistante** : consolidée sur les 3 recettes, dédupliquée, cases à cocher, purge des articles cochés.

### Abonnements & fonctionnalités (côté serveur)

- Catalogue de features centralisé (`admin/src/lib/features.ts`) : `classic_workout`, `rag_workout`, `nutrition_ai`, `cook_module`, `barcode_scan`, `history_full`, `priority_support`.
- Le plan effectif d'un utilisateur (quotas + features) est résolu côté serveur (`resolveSubscription`), expiration comprise (bascule paresseuse en `EXPIRED`) ; sans abonnement actif → palier gratuit (3 séances/j, 10 appels IA/j).
- Les endpoints applicatifs sont **gardés par feature** (`featureGuard`) et **par quota journalier** (`quotaGuard`, réponse 429 avec compteurs).
- L'app affiche son plan et ses quotas restants (`GET /api/app/subscription`) dans les Paramètres.

---

## Backends IA

L'app sait parler à **quatre** backends, commutables dans Paramètres → Backend actif :

| Backend | Description |
|---------|-------------|
| **Serveur** (recommandé) | L'app appelle le back-end NoBrainFit, qui détient les clés, applique prompts/quotas/features et journalise les appels. Auth JWT. |
| **Ollama** (local) | LLM auto-hébergé, appel direct depuis l'appareil. Aucune donnée ne sort du réseau local. |
| **Claude** (Anthropic) | Appel direct à l'API Anthropic avec une clé personnelle stockée sur l'appareil. |
| **Démo** | Zéro réseau : réponses réalistes pré-écrites avec latence simulée, pour montrer l'app de bout en bout sans rien installer. |

```
Serveur  : http://10.0.2.2:3000 par défaut (émulateur Android → hôte)
Claude   : https://api.anthropic.com/v1 · modèle claude-haiku-4-5-20251001 · 1024 tokens max
Ollama   : http://10.0.2.2:11434 par défaut · llama3.2, llama3.1, mistral, gemma3, phi3, qwen2.5
           (format JSON natif d'Ollama utilisé pour les réponses structurées)
```

Toutes les réponses IA passent par des **parsers tolérants** (`ai_parsers.dart`) : extraction du JSON même entouré de prose ou de fences Markdown, coercition des types (`"480"` → `480`).

---

## Console d'administration

Back-office web complet dans [`admin/`](admin/README.md) (installation Docker en une commande, HTTPS Let's Encrypt en option) :

- **Dashboard** — statistiques d'usage (utilisateurs, séances, appels IA, erreurs).
- **Utilisateurs** — liste, fiche détaillée (profil fitness synchronisé), suspension, rôle.
- **Abonnements** — souscriptions par utilisateur ; **Plans** : CRUD, prix, quotas journaliers (`-1` = illimité) et features cochables.
- **Générateurs** — bibliothèque d'**exercices** vérifiés (source RAG) + **prompts** IA éditables à chaud (templates `{variable}`, sans redéploiement).
- **APIs** — choix du backend IA serveur (Claude / Ollama), configuration + boutons de test de connexion.
- **Certificats** — gestion SSL (Let's Encrypt / auto-signé).

Voir [`admin/README.md`](admin/README.md) pour l'installation, les scripts (`setup.sh`, `update.sh`, `backup.sh`, `ssl.sh`) et l'exploitation Docker.

---

## API applicative

Endpoints consommés par l'app mobile (préfixe `/api/app`, auth `Authorization: Bearer <jwt>` sauf `auth`) :

| Endpoint | Méthode | Rôle | Garde |
|----------|---------|------|-------|
| `/auth` | POST | Login / register (JWT 30 j) | — |
| `/profile` | GET · PUT | Profil fitness (validation stricte des enums/bornes) | auth |
| `/subscription` | GET · POST | Plan, features, quotas restants · changement de plan | auth |
| `/exercises` | GET | Bibliothèque d'exercices par matériel (RAG) | auth |
| `/workout` | POST | Génération séance RAG | `rag_workout` + quotas |
| `/workout/classic` | POST | Génération séance classique | `classic_workout` + quotas |
| `/recipes` | POST | 3 recettes + liste de courses | `cook_module` + quota IA |
| `/recipe-detail` | POST | Ingrédients + étapes d'une recette | `cook_module` + quota IA |
| `/nutrition-estimate` | POST | Estimation macros d'un texte libre | `nutrition_ai` + quota IA |
| `/nutrition-tip` | POST | Conseil nutrition contextuel | `nutrition_ai` + quota IA |
| `/api/health` | GET | Healthcheck | — |

Chaque appel IA est journalisé (`ApiCallLog` : provider, endpoint, statut, durée) — le dashboard et les quotas reflètent l'usage réel.

---

## Stack technique

### App Flutter

| Couche | Technologie |
|--------|-------------|
| Framework | Flutter 3.27 (Dart SDK ≥ 3.0) |
| State management | Riverpod 2.x (`flutter_riverpod`, `AsyncNotifier`) |
| Navigation | GoRouter 13.x (redirect gate auth/onboarding) |
| HTTP client | Dio 5.x |
| Persistance locale | SharedPreferences (config, profil, historique, nutrition, courses — JSON) |
| Typographie | Space Grotesk (display/UI) + Space Mono (données) |
| Lint | `flutter_lints` 4.x — `flutter analyze` sans aucun warning |

### Back-end admin

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15 (App Router) + React 18 |
| ORM / DB | Prisma 5 + PostgreSQL |
| Auth console | NextAuth (credentials + bcrypt) |
| Auth app | JWT `jose` (HS256, secret partagé `NEXTAUTH_SECRET`) |
| UI | Tailwind CSS + Radix UI + Recharts |
| Déploiement | Docker Compose (app + PostgreSQL + nginx), scripts d'installation |

---

## Architecture du code Flutter

```
lib/
├── main.dart                          # Entry point — ProviderScope + MaterialApp.router
├── screens/
│   ├── home_screen.dart               # Hub — stats du jour + 3 rangées d'action
│   ├── auth/auth_screen.dart          # Connexion / inscription / mode démo
│   ├── onboarding/onboarding_flow.dart# Questionnaire profil multi-étapes
│   ├── eat/
│   │   ├── nutrition_dashboard.dart   # Anneau kcal + macros + repas du jour
│   │   ├── nutrition_goal_screen.dart # Objectif + poids → cibles
│   │   └── log_food_screen.dart       # Log texte libre → estimation IA
│   ├── train/
│   │   ├── train_flow.dart            # Questionnaire séance classique (2 étapes)
│   │   ├── train_result_screen.dart   # Exercices générés + lancement séance
│   │   ├── rag_train_flow.dart        # Questionnaire programme IA (objectif/durée/matériel)
│   │   ├── rag_train_result_screen.dart
│   │   └── active_workout_screen.dart # Séance guidée : séries, repos, résumé
│   ├── cook/
│   │   ├── cook_flow.dart             # Questionnaire recettes (2 étapes)
│   │   ├── cook_result_screen.dart    # 3 recettes + liste de courses
│   │   ├── recipe_detail_screen.dart  # Ingrédients + étapes (IA)
│   │   └── shopping_list_screen.dart  # Liste persistante
│   ├── library/library_screen.dart    # Historique + programmes sauvegardés
│   └── settings/settings_screen.dart  # Backends IA, compte, profil, prefs séance
├── services/
│   ├── ai/
│   │   ├── ai_service.dart            # Interface + modèles + prompts
│   │   ├── ai_parsers.dart            # Extraction/parsing JSON tolérant
│   │   ├── ai_config.dart             # Config runtime (SharedPreferences)
│   │   ├── ai_provider.dart           # Providers Riverpod (workout, recettes, tips…)
│   │   ├── claude_service.dart        # Backend Claude direct
│   │   ├── ollama_service.dart        # Backend Ollama direct
│   │   └── demo_ai_service.dart       # Backend démo hors-ligne
│   ├── server/
│   │   ├── server_auth_service.dart   # POST /api/app/auth
│   │   ├── server_ai_service.dart     # Délégation IA au back-end (+ erreurs quota/session)
│   │   ├── server_profile_service.dart# Sync profil GET/PUT
│   │   └── server_subscription_service.dart
│   ├── profile/                       # UserProfile (IMC, BMR, TDEE) + notifier
│   ├── nutrition/                     # Objectifs, entrées, totaux/jour
│   ├── library/                       # Historique, programmes sauvés, prefs séance
│   ├── cook/shopping_list_service.dart
│   └── fitness_api/                   # Exercices : mock local / API-Ninjas / serveur
├── utils/
│   ├── router.dart                    # GoRouter + gate auth/onboarding + RouteObserver
│   ├── brand.dart                     # Design tokens (charte V2.0)
│   ├── theme.dart                     # Thème Material 3 dark
│   └── workout_parse.dart             # Parsing "3 × 12 reps · 60 s repos"
└── widgets/                           # flow_scaffold, result_scaffold, choice_grid,
                                       # exercise_detail_sheet, save_workout_button, logo…
```

---

## Design system — charte V2.0

La charte V2.0 abandonne le code couleur par pilier au profit d'un **accent unique, le « Lume »**, réservé à l'action et à la donnée vivante — le reste vit en niveaux d'acier.

### Palette

| Token | Valeur | Usage |
|-------|--------|-------|
| `bgVoid` | `#0B0B0F` | Fond absolu |
| `bgSurface` | `#101015` | Sous-couche |
| `bgCard` | `#16161B` | Cartes |
| `bgCardHi` | `#1C1C22` | Cartes surélevées |
| `lume` | `#C4ED4A` | **Accent unique** — actions, données vivantes |
| `acier` | `#D8D8DE` | Marque, lignes |
| `titane` | `#86868F` | Icônes au repos |
| `white` | `#F2F2F4` | Texte principal |
| `grey1` | `#9A9AA4` | Texte secondaire |
| `grey2` / `graphite` | `#55555E` | Labels, tertiaire |

### Typographie
- **Space Grotesk** (300–700) — display & UI
- **Space Mono** (400/700) — données, statistiques, compteurs

### Spacing (base-4)
`s4` · `s8` · `s12` · `s16` · `s20` · `s24` · `s32` · `s40` · `s48`

### Border radii
`rTag(4)` · `rChip(8)` · `rButton(12)` · `rCard(16)` · `rRow(20)` · `rSheet(24)`

La charte interactive complète est consultable dans `GraphicChart.html` et `demo/brand.html` ; une maquette navigable de l'app vit dans `demo/index.html`.

---

## Configuration Android

```
Application ID  : com.nobrainfit
Min SDK         : 21  (Android 5.0+)
Target SDK      : 34  (Android 14)
Compile SDK     : 34
NDK             : 25.1.8937393
```

**Permission requise :** `INTERNET` (appels API). Le trafic HTTP clair est autorisé uniquement vers les hôtes de dev locaux (`network_security_config.xml`).

---

## Démarrage rapide

### Prérequis
- Flutter ≥ 3.27 · Dart ≥ 3.0
- Android SDK 34 (ou émulateur)
- Un backend au choix : serveur NoBrainFit auto-hébergé, Ollama local, clé Anthropic — **ou rien du tout (mode démo)**

### Lancer l'app

```bash
git clone https://github.com/davebrunsch/NoBrainFitApp.git
cd NoBrainFitApp
flutter pub get
flutter run
```

```bash
# Build APK debug
flutter build apk --debug
# Output : build/app/outputs/flutter-apk/app-debug.apk
```

### Choisir son backend

**Option 0 — Mode démo (zéro install)**
Sur l'écran de connexion → **« Essayer en mode démo (sans backend) »**. Profil pré-rempli, données IA simulées, tout est navigable.

**Option A — Serveur NoBrainFit (recommandé)**
1. Déployer le back-end : `cd admin && bash scripts/setup.sh` (voir [admin/README.md](admin/README.md))
2. Dans l'app : URL du serveur (`http://10.0.2.2:3000` sur émulateur), créer un compte → tout passe par le serveur (prompts, quotas, historique).

**Option B — Ollama (local, données privées)**
1. Installer [Ollama](https://ollama.ai) puis `ollama pull llama3.2`
2. App → Paramètres → **Ollama** → URL (`http://10.0.2.2:11434` sur émulateur, IP LAN sinon) + modèle → Enregistrer.

**Option C — Claude (cloud)**
1. App → Paramètres → **Claude** → coller sa clé API ([console.anthropic.com](https://console.anthropic.com)) → Enregistrer.

**Option facultative — exercices réels pour le RAG hors serveur :**
```bash
flutter run --dart-define=FITNESS_API_KEY=ta_cle_api_ninjas
```
Sans clé et hors backend serveur, un pool local de ~70 exercices est utilisé.

---

## CI/CD

Deux workflows GitHub Actions :

| Workflow | Déclencheur | Contenu |
|----------|-------------|---------|
| `checks.yml` | push / PR | **Admin** : `npm ci` + `prisma generate` + `tsc --noEmit` · **App** : `flutter analyze --fatal-infos` (Flutter 3.27.4) |
| `build-apk.yml` | push sur `main` | Build APK debug (Java 17) · artifact `NoBrainFit-debug` (rétention 7 j) |

---

## Données & vie privée

- Les données d'usage (repas, séances, liste de courses) sont stockées **localement** sur l'appareil (`SharedPreferences`).
- Le profil fitness est synchronisé avec **ton** serveur auto-hébergé (si backend serveur) — jamais avec un tiers.
- La clé API Claude éventuelle reste sur l'appareil et n'est envoyée qu'à l'API Anthropic.
- Avec **Ollama** ou le **mode démo**, aucune donnée ne quitte l'appareil/le réseau local.
- Côté serveur : mots de passe hachés (bcrypt), sessions JWT signées, quotas et journaux d'appels IA pour la transparence d'usage.
