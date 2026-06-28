import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Admin user ──────────────────────────────────────────────────────────────
  const adminEmail    = process.env.ADMIN_EMAIL    ?? 'admin@nobrainfitapp.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'changeme123'
  const adminName     = process.env.ADMIN_NAME     ?? 'Admin'
  const adminHash     = await bcrypt.hash(adminPassword, 12)

  // Upsert ensures the credentials provided at setup time always work,
  // even when re-running the seed against an existing database.
  await db.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminHash,
      name: adminName,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      name: adminName,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log(`✅ Admin user: ${adminEmail} (${adminName})`)

  // ── Plans ───────────────────────────────────────────────────────────────────
  const plans = [
    {
      name: 'Free',
      slug: 'free',
      description: 'Pour découvrir NoBrainFit',
      priceMonthly: 0,
      maxWorkoutsDay: 3,
      maxAiCallsDay: 10,
      features: ['3 séances/jour', '10 appels IA/jour', 'Exercices de base'],
    },
    {
      name: 'Pro',
      slug: 'pro',
      description: 'Pour les sportifs réguliers',
      priceMonthly: 9.99,
      maxWorkoutsDay: 20,
      maxAiCallsDay: 100,
      features: ['20 séances/jour', '100 appels IA/jour', 'Programme RAG', 'Historique 30 jours'],
    },
    {
      name: 'Premium',
      slug: 'premium',
      description: 'Accès illimité à tout',
      priceMonthly: 19.99,
      maxWorkoutsDay: -1,
      maxAiCallsDay: -1,
      features: ['Séances illimitées', 'IA illimitée', 'Priorité serveur', 'Historique complet', 'Support prioritaire'],
    },
  ]

  for (const plan of plans) {
    await db.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    })
  }
  console.log(`✅ Plans: ${plans.map(p => p.name).join(', ')}`)

  // ── App Config ──────────────────────────────────────────────────────────────
  const configs = [
    { key: 'ollama.base_url',          value: 'http://localhost:11434',       description: 'URL du serveur Ollama',               isSecret: false },
    { key: 'ollama.model',             value: 'llama3.2',                     description: 'Modèle Ollama par défaut',            isSecret: false },
    { key: 'ollama.timeout_seconds',   value: '120',                          description: 'Timeout Ollama (secondes)',            isSecret: false },
    { key: 'claude.api_key',           value: '',                             description: 'Clé API Anthropic Claude',            isSecret: true  },
    { key: 'claude.model',             value: 'claude-haiku-4-5-20251001',    description: 'Modèle Claude par défaut',            isSecret: false },
    { key: 'claude.max_tokens',        value: '1024',                         description: 'Tokens max par réponse Claude',       isSecret: false },
    { key: 'fitness_api.provider',     value: 'mock',                         description: 'Provider exercices (mock|ninjas)',    isSecret: false },
    { key: 'fitness_api.key',          value: '',                             description: 'Clé API API-Ninjas Exercises',        isSecret: true  },
    { key: 'app.ai_backend',           value: 'ollama',                       description: 'Backend IA par défaut (ollama|claude)', isSecret: false },
    { key: 'app.maintenance_mode',     value: 'false',                        description: 'Mode maintenance (désactive l\'app)', isSecret: false },
    { key: 'app.default_plan',         value: 'free',                         description: 'Plan par défaut à l\'inscription',   isSecret: false },
    { key: 'app.rag_exercises_count',  value: '20',                           description: 'Nb d\'exercices envoyés au prompt RAG', isSecret: false },
    { key: 'ssl.mode',                 value: process.env.SSL_MODE   ?? '',    description: 'Mode SSL (self-signed|letsencrypt)',  isSecret: false },
    { key: 'ssl.domain',               value: process.env.SSL_DOMAIN ?? '',    description: 'Domaine du certificat HTTPS',         isSecret: false },
    { key: 'ssl.email',                value: process.env.SSL_EMAIL  ?? '',    description: 'Email de contact Let\'s Encrypt',     isSecret: false },
  ]

  for (const cfg of configs) {
    await db.appConfig.upsert({
      where: { key: cfg.key },
      update: { description: cfg.description, isSecret: cfg.isSecret },
      create: cfg,
    })
  }
  console.log(`✅ App config: ${configs.length} clés`)

  // ── AI Prompts ──────────────────────────────────────────────────────────────
  const prompts = [
    {
      slug: 'rag_workout',
      name: 'Générateur RAG',
      description: 'Programme basé sur une liste d\'exercices fournie (RAG). Variables : {goal}, {duration}, {equipment}, {exercises_json}',
      variables: ['goal', 'duration', 'equipment', 'exercises_json'],
      template: `Tu es un coach sportif expert. Crée un programme de {goal} d'une durée de {duration} avec {equipment}.

Règle ABSOLUE : Tu DOIS construire la séance UNIQUEMENT en piochant dans cette liste d'exercices. Ne propose AUCUN exercice qui n'est pas dans cette liste :
{exercises_json}

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans explication :
{
  "title": "Nom court de la séance (ex: Force · Haltères · 45 min)",
  "exercises": [
    {"name": "Nom exact de l'exercice depuis la liste ci-dessus", "detail": "X séries × Y reps · Z s repos"},
    ...
  ]
}
Génère entre 5 et 8 exercices. Adapte les séries/reps/repos à l'objectif {goal}. Sois précis et réaliste.`,
    },
    {
      slug: 'classic_workout',
      name: 'Générateur classique',
      description: 'Programme libre sans contrainte d\'exercices. Variables : {duration}, {location}',
      variables: ['duration', 'location'],
      template: `Tu es un coach fitness. Génère une séance d'entraînement pour les paramètres suivants :
- Durée : {duration}
- Lieu : {location}

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans explication :
{
  "title": "Nom de la séance (ex: Full Body · 30 min)",
  "exercises": [
    {"name": "Nom de l'exercice", "detail": "X × Y reps · Z s repos"},
    ...
  ]
}
Génère entre 4 et 6 exercices adaptés au lieu et à la durée. Sois précis et réaliste.`,
    },
    {
      slug: 'recipes',
      name: 'Générateur de recettes',
      description: 'Suggestions de recettes + liste de courses. Variables : {effort}, {portions}',
      variables: ['effort', 'portions'],
      template: `Tu es un nutritionniste cuisinier. Génère 3 recettes rapides et équilibrées pour :
- Niveau d'effort : {effort}
- Nombre de personnes : {portions}

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans explication :
{
  "recipes": [
    {"name": "Nom de la recette", "time_min": 20, "kcal": 480, "prot_g": 35}
  ],
  "shopping_list": ["Ingrédient · quantité", ...]
}
3 recettes variées. Liste de courses consolidée pour les 3 recettes.`,
    },
    {
      slug: 'nutrition_tip',
      name: 'Conseil nutritionnel',
      description: 'Conseil court après un repas. Variables : {meal_type}, {meal_size}, {total_kcal}',
      variables: ['meal_type', 'meal_size', 'total_kcal'],
      template: `Tu es un nutritionniste bienveillant. L'utilisateur vient de loguer :
- Repas : {meal_type} ({meal_size})
- Calories consommées aujourd'hui : {total_kcal} kcal (objectif : 2000 kcal)

Donne un conseil court (1-2 phrases max), positif et concret pour la suite de la journée.
Réponds directement en français, sans introduction, sans formatage.`,
    },
    {
      slug: 'nutrition_estimate',
      name: 'Estimation nutritionnelle',
      description: 'Estime kcal + macros d\'un aliment décrit en texte. Variables : {description}',
      variables: ['description'],
      template: `Tu es un nutritionniste. Estime les valeurs nutritionnelles TOTALES de ce que l'utilisateur a mangé : "{description}".

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown :
{"name":"nom court de l'aliment ou du repas","kcal":0,"prot_g":0,"carbs_g":0,"fat_g":0}
Valeurs entières correspondant à la quantité décrite (pas par 100g).`,
    },
  ]

  for (const prompt of prompts) {
    await db.aiPrompt.upsert({
      where: { slug: prompt.slug },
      update: { name: prompt.name, description: prompt.description, template: prompt.template, variables: prompt.variables },
      create: { ...prompt, updatedAt: new Date() },
    })
  }
  console.log(`✅ AI Prompts: ${prompts.map(p => p.name).join(', ')}`)

  // ── Exercise Library ────────────────────────────────────────────────────────
  const exercises = [
    // Poids de corps
    { name: 'Pompes',            type: 'strength', muscle: 'chest',       equipment: 'body_only', difficulty: 'beginner'     },
    { name: 'Squats',            type: 'strength', muscle: 'quads',       equipment: 'body_only', difficulty: 'beginner'     },
    { name: 'Fentes avant',      type: 'strength', muscle: 'quads',       equipment: 'body_only', difficulty: 'beginner'     },
    { name: 'Mountain Climbers', type: 'cardio',   muscle: 'abdominals',  equipment: 'body_only', difficulty: 'intermediate' },
    { name: 'Burpees',           type: 'cardio',   muscle: 'full_body',   equipment: 'body_only', difficulty: 'intermediate' },
    { name: 'Dips sur chaise',   type: 'strength', muscle: 'triceps',     equipment: 'body_only', difficulty: 'beginner'     },
    { name: 'Planche',           type: 'strength', muscle: 'abdominals',  equipment: 'body_only', difficulty: 'beginner'     },
    { name: 'Crunchs',           type: 'strength', muscle: 'abdominals',  equipment: 'body_only', difficulty: 'beginner'     },
    { name: 'Superman',          type: 'strength', muscle: 'lower_back',  equipment: 'body_only', difficulty: 'beginner'     },
    { name: 'Hip Thrust au sol', type: 'strength', muscle: 'glutes',      equipment: 'body_only', difficulty: 'beginner'     },
    { name: 'Jumping Jacks',     type: 'cardio',   muscle: 'full_body',   equipment: 'body_only', difficulty: 'beginner'     },
    { name: 'High Knees',        type: 'cardio',   muscle: 'abdominals',  equipment: 'body_only', difficulty: 'beginner'     },
    { name: 'Pike Push-ups',     type: 'strength', muscle: 'shoulders',   equipment: 'body_only', difficulty: 'intermediate' },
    { name: 'Pompes déclinées',  type: 'strength', muscle: 'chest',       equipment: 'body_only', difficulty: 'intermediate' },
    { name: 'Wall Sit',          type: 'strength', muscle: 'quads',       equipment: 'body_only', difficulty: 'beginner'     },
    { name: 'Glute Bridge',      type: 'strength', muscle: 'glutes',      equipment: 'body_only', difficulty: 'beginner'     },
    { name: 'Bear Crawl',        type: 'cardio',   muscle: 'full_body',   equipment: 'body_only', difficulty: 'intermediate' },
    // Haltères
    { name: 'Curl biceps haltères',       type: 'strength', muscle: 'biceps',     equipment: 'dumbbell', difficulty: 'beginner'     },
    { name: 'Développé épaules haltères', type: 'strength', muscle: 'shoulders',  equipment: 'dumbbell', difficulty: 'beginner'     },
    { name: 'Rowing haltère',             type: 'strength', muscle: 'lats',       equipment: 'dumbbell', difficulty: 'beginner'     },
    { name: 'Squat gobelet',              type: 'strength', muscle: 'quads',      equipment: 'dumbbell', difficulty: 'beginner'     },
    { name: 'Fentes avec haltères',       type: 'strength', muscle: 'quads',      equipment: 'dumbbell', difficulty: 'beginner'     },
    { name: 'Développé couché haltères',  type: 'strength', muscle: 'chest',      equipment: 'dumbbell', difficulty: 'beginner'     },
    { name: 'Élévations latérales',       type: 'strength', muscle: 'shoulders',  equipment: 'dumbbell', difficulty: 'beginner'     },
    { name: 'Extension triceps haltère',  type: 'strength', muscle: 'triceps',    equipment: 'dumbbell', difficulty: 'beginner'     },
    { name: 'Romanian Deadlift haltères', type: 'strength', muscle: 'hamstrings', equipment: 'dumbbell', difficulty: 'intermediate' },
    { name: 'Shrugs haltères',            type: 'strength', muscle: 'traps',      equipment: 'dumbbell', difficulty: 'beginner'     },
    { name: 'Curl marteau',               type: 'strength', muscle: 'biceps',     equipment: 'dumbbell', difficulty: 'beginner'     },
    { name: 'Sumo squat haltère',         type: 'strength', muscle: 'glutes',     equipment: 'dumbbell', difficulty: 'beginner'     },
    { name: 'Fly couché haltères',        type: 'strength', muscle: 'chest',      equipment: 'dumbbell', difficulty: 'intermediate' },
    // Barres
    { name: 'Squat barre',             type: 'strength', muscle: 'quads',      equipment: 'barbell', difficulty: 'intermediate' },
    { name: 'Soulevé de terre',        type: 'strength', muscle: 'hamstrings', equipment: 'barbell', difficulty: 'intermediate' },
    { name: 'Développé couché barre',  type: 'strength', muscle: 'chest',      equipment: 'barbell', difficulty: 'intermediate' },
    { name: 'Rowing barre',            type: 'strength', muscle: 'lats',       equipment: 'barbell', difficulty: 'intermediate' },
    { name: 'Overhead Press barre',    type: 'strength', muscle: 'shoulders',  equipment: 'barbell', difficulty: 'intermediate' },
    { name: 'Romanian Deadlift barre', type: 'strength', muscle: 'hamstrings', equipment: 'barbell', difficulty: 'intermediate' },
    { name: 'Développé incliné barre', type: 'strength', muscle: 'chest',      equipment: 'barbell', difficulty: 'intermediate' },
    { name: 'Hip Thrust barre',        type: 'strength', muscle: 'glutes',     equipment: 'barbell', difficulty: 'intermediate' },
    // Câbles
    { name: 'Lat Pulldown',          type: 'strength', muscle: 'lats',      equipment: 'cable', difficulty: 'beginner' },
    { name: 'Cable Row',             type: 'strength', muscle: 'lats',      equipment: 'cable', difficulty: 'beginner' },
    { name: 'Tricep Pushdown câble', type: 'strength', muscle: 'triceps',   equipment: 'cable', difficulty: 'beginner' },
    { name: 'Curl câble',            type: 'strength', muscle: 'biceps',    equipment: 'cable', difficulty: 'beginner' },
    { name: 'Face Pulls câble',      type: 'strength', muscle: 'shoulders', equipment: 'cable', difficulty: 'beginner' },
    // Machines
    { name: 'Leg Press',                type: 'strength', muscle: 'quads',     equipment: 'machine', difficulty: 'beginner'     },
    { name: 'Leg Extension',            type: 'strength', muscle: 'quads',     equipment: 'machine', difficulty: 'beginner'     },
    { name: 'Leg Curl',                 type: 'strength', muscle: 'hamstrings',equipment: 'machine', difficulty: 'beginner'     },
    { name: 'Chest Press machine',      type: 'strength', muscle: 'chest',     equipment: 'machine', difficulty: 'beginner'     },
    { name: 'Shoulder Press machine',   type: 'strength', muscle: 'shoulders', equipment: 'machine', difficulty: 'beginner'     },
    { name: 'Pec Deck',                 type: 'strength', muscle: 'chest',     equipment: 'machine', difficulty: 'beginner'     },
    { name: 'Curl biceps machine',      type: 'strength', muscle: 'biceps',    equipment: 'machine', difficulty: 'beginner'     },
    { name: 'Hack Squat machine',       type: 'strength', muscle: 'quads',     equipment: 'machine', difficulty: 'intermediate' },
    { name: 'Calf Raise assis',         type: 'strength', muscle: 'calves',    equipment: 'machine', difficulty: 'beginner'     },
    { name: 'Traction assistée',        type: 'strength', muscle: 'lats',      equipment: 'machine', difficulty: 'beginner'     },
    { name: 'Abduction hanche machine', type: 'strength', muscle: 'abductors', equipment: 'machine', difficulty: 'beginner'     },
    { name: 'Adduction hanche machine', type: 'strength', muscle: 'adductors', equipment: 'machine', difficulty: 'beginner'     },
  ]

  let created = 0
  for (const ex of exercises) {
    const existing = await db.exercise.findFirst({ where: { name: ex.name } })
    if (!existing) {
      await db.exercise.create({ data: ex })
      created++
    }
  }
  console.log(`✅ Exercices: ${created} créés (${exercises.length - created} déjà présents)`)

  console.log('\n🎉 Seed terminé !')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
