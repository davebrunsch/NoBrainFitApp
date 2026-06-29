# NoBrainFit

> **Appuie. L'app s'occupe du reste.**

Application Flutter de fitness et nutrition minimaliste — zéro réflexion, zéro friction. Trois boutons, deux gestes, un résultat.

---

## Concept

NoBrainFit repose sur une philosophie simple : éliminer toute friction entre l'intention et l'action. L'utilisateur répond à 2 questions maximum, l'app fait le reste grâce à l'IA.

**Trois piliers :**

| Pilier | Couleur | Action | Résultat |
|--------|---------|--------|----------|
| **Manger** | Lime `#CCFF00` | Choisir repas + portion | Macros + conseil nutrition IA |
| **S'entraîner** | Blue `#3D8EFF` | Choisir durée + lieu | Séance complète générée par IA |
| **Cuisiner** | Orange `#FF5C2B` | Choisir effort + portions | 3 recettes + liste de courses |

**Cible :** 18-35 ans, actifs mais débordés, qui veulent prendre soin d'eux sans se prendre la tête.

---

## Fonctionnalités

### Démarrage — Compte + profil
À la première ouverture, l'app est verrouillée derrière deux étapes :
1. **Connexion / création de compte** — écran dédié branché sur `POST /api/app/auth` (token JWT stocké localement).
2. **Questionnaire de profil** — onboarding en plusieurs étapes pour construire le contexte de l'utilisateur :
   - Mensurations : sexe, âge, taille, poids (+ poids cible optionnel)
   - Niveau d'expérience (Débutant / Intermédiaire / Confirmé)
   - Mode de vie (Sédentaire → Très actif)
   - Objectif (Perte de gras / Muscle / Recomposition / Forme / Performance)
   - Fréquence d'entraînement (1–7 séances/sem)
   - Matériel à disposition + abonnement en salle

Le profil est stocké **localement** (`SharedPreferences`) et sert de contexte
partout. Métriques dérivées calculées à la volée : **IMC**, **métabolisme de
base** (Mifflin-St Jeor), **dépense énergétique** et **cible calorique** selon
l'objectif. Modifiable à tout moment depuis Paramètres → *Mon profil*.

Le routage (`GoRouter`) applique la règle :
`non connecté → /auth` · `connecté sans profil → /onboarding` · sinon l'app.

### Manger — Log en 2 gestes
1. Type de repas (Petit-déjeuner / Déjeuner / Dîner / Collation)
2. Taille de portion (Léger ~350 kcal / Normal ~600 / Copieux ~900) ou **scan de code-barres**
- Affichage des macros (Protéines / Glucides / Lipides)
- Progression vers l'objectif journalier (2000 kcal)
- Conseil nutritionnel personnalisé généré par IA

### S'entraîner — Séance sur mesure
1. Durée souhaitée (15 min / 30 min / 45 min / 1h+)
2. Lieu (Maison / Salle / Dehors / Cardio)
- Génération de 4 à 6 exercices adaptés
- Détail complet : sets × reps × temps de repos
- Cases à cocher pour suivre la progression

### Cuisiner — 3 recettes + courses
1. Niveau d'effort (La flemme 10min / Un peu 20min / Motivé 45min+)
2. Nombre de portions (Solo / 2 personnes / Famille / Meal prep semaine)
- 3 recettes avec temps, calories et protéines
- Liste de courses auto-générée
- Suivi par cases à cocher

### Paramètres — Double backend IA
Bascule entre deux moteurs IA :
- **Claude (Anthropic)** — API cloud, clé personnalisée
- **Ollama** — LLM local, zéro données envoyées à l'extérieur

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Flutter (Dart SDK ≥ 3.0) |
| State management | Riverpod 2.x (`flutter_riverpod`) |
| Navigation | GoRouter 13.x |
| HTTP client | Dio 5.x |
| Base de données locale | SQLite (`sqflite`) |
| Persistance config | SharedPreferences |
| Scan code-barres | Camera + Google ML Kit |
| Géolocalisation | Geolocator |
| Typographie | Space Grotesk (300–700) |

### Backend IA

#### Claude API (Anthropic)
```
Endpoint : https://api.anthropic.com/v1
Modèle   : claude-haiku-4-5-20251001
Tokens   : 1024 max
Auth     : x-api-key (stockée localement, jamais envoyée ailleurs)
```

#### Ollama (LLM local)
```
Endpoint par défaut : http://10.0.2.2:11434  (émulateur Android)
Modèles supportés   : llama3.2, llama3.1, mistral, gemma3, phi3, qwen2.5
Température         : 0.7
```

---

## Architecture

```
lib/
├── main.dart                      # Entry point — ProviderScope + MaterialApp
├── screens/
│   ├── home_screen.dart           # Hub — 3 boutons d'action + stats
│   ├── eat/
│   │   ├── eat_flow.dart          # Questionnaire repas (2 étapes)
│   │   └── eat_result_screen.dart # Macros + conseil IA
│   ├── train/
│   │   ├── train_flow.dart        # Questionnaire séance (2 étapes)
│   │   └── train_result_screen.dart # Exercices générés + suivi
│   ├── cook/
│   │   ├── cook_flow.dart         # Questionnaire recettes (2 étapes)
│   │   └── cook_result_screen.dart  # Recettes + liste de courses
│   └── settings/
│       └── settings_screen.dart   # Config backend IA
├── services/
│   └── ai/
│       ├── ai_service.dart        # Interface abstraite
│       ├── ai_config.dart         # Modèle de config (SharedPreferences)
│       ├── ai_provider.dart       # Providers Riverpod
│       ├── claude_service.dart    # Implémentation Claude API
│       └── ollama_service.dart    # Implémentation Ollama
├── utils/
│   ├── router.dart                # Routes GoRouter
│   ├── brand.dart                 # Design tokens (couleurs, spacing, radii)
│   └── theme.dart                 # Thème Material 3 dark
└── widgets/
    ├── flow_scaffold.dart         # Template flows multi-étapes
    ├── result_scaffold.dart       # Template écrans résultat
    ├── choice_grid.dart           # Grille de choix animée
    └── tri_strike_logo.dart       # Logo 3 barres peint custom
```

---

## Design system

### Palette

| Token | Valeur | Usage |
|-------|--------|-------|
| `bgVoid` | `#08080C` | Fond absolu |
| `bgSurface` | `#111115` | Fond principal |
| `bgCard` | `#141418` | Cartes |
| `bgCardHi` | `#1A1A20` | Cartes surélevées |
| `lime` | `#CCFF00` | Pilier Nutrition |
| `blue` | `#3D8EFF` | Pilier Entraînement |
| `orange` | `#FF5C2B` | Pilier Cuisine |
| `white` | `#F5F5F7` | Texte principal |
| `grey1` | `#9898A8` | Texte secondaire |
| `grey2` | `#56565F` | Texte tertiaire |

### Spacing (base-4)
`s4` · `s8` · `s12` · `s16` · `s20` · `s24` · `s32` · `s40` · `s48`

### Border radii
`rTag(4)` · `rChip(8)` · `rButton(12)` · `rCard(16)` · `rRow(20)` · `rSheet(24)`

---

## Configuration Android

```
Application ID  : com.nobrainfit
Min SDK         : 21  (Android 5.0+)
Target SDK      : 34  (Android 14)
Compile SDK     : 34
NDK             : 25.1.8937393
```

**Permissions requises :**
- `INTERNET` — Appels API IA
- `CAMERA` — Scan code-barres (optionnel)
- `ACCESS_FINE_LOCATION` — Géolocalisation

---

## Démarrage rapide

### Prérequis
- Flutter ≥ 3.22.3
- Dart ≥ 3.0.0
- Android SDK 34 (ou émulateur)
- Un compte Anthropic **ou** Ollama en local

### Installation

```bash
git clone https://github.com/davebrunsch/NoBrainFitApp.git
cd NoBrainFitApp
flutter pub get
flutter run
```

### Build APK debug

```bash
flutter build apk --debug
# Output : build/app/outputs/flutter-apk/app-debug.apk
```

### Configuration IA

**Option A — Claude (cloud)**
1. Ouvrir l'app → icône paramètres (en haut à droite)
2. Sélectionner **Claude**
3. Coller ta clé API Anthropic
4. Sauvegarder

**Option B — Ollama (local, données privées)**
1. Installer [Ollama](https://ollama.ai) sur ta machine
2. `ollama pull llama3.2`
3. Dans l'app → Paramètres → **Ollama**
4. URL : `http://10.0.2.2:11434` (émulateur) ou IP de ta machine
5. Choisir le modèle → Sauvegarder

---

## CI/CD

Un workflow GitHub Actions build l'APK debug à chaque push :

```yaml
# .github/workflows/build-apk.yml
Flutter 3.22.3 · Java 17 · ubuntu-latest
Artifact : NoBrainFit-debug (rétention 7 jours)
```

---

## Données & vie privée

- Toutes les données (repas, séances) sont stockées **localement** sur l'appareil (SQLite)
- La clé API Claude est stockée en `SharedPreferences` — jamais transmise à un serveur tiers
- Avec Ollama, **aucune donnée ne quitte l'appareil**
