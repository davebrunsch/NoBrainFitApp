import { WorkoutPlan, Exercise, RecipeSuggestions, RecipeDetail, FoodEstimate } from '../types';

// ── Canned exercise pools mirroring Flutter DemoAiService ───────────────────

const CLASSIC_POOL: Exercise[] = [
  { name: 'Pompes', detail: '4 × 12 reps · 60 s repos' },
  { name: 'Squats au poids du corps', detail: '4 × 15 reps · 60 s repos' },
  { name: 'Fentes avant alternées', detail: '3 × 12 reps · 45 s repos' },
  { name: 'Gainage planche abdominale', detail: '3 × 45 s · 45 s repos' },
  { name: 'Mountain Climbers', detail: '3 × 35 s · 30 s repos' },
  { name: 'Dips sur chaise ou banc', detail: '3 × 12 reps · 45 s repos' },
  { name: 'Superman gainage lombaire', detail: '3 × 15 reps · 30 s repos' },
  { name: 'Burpees dynamiques', detail: '3 × 10 reps · 60 s repos' },
];

const GYM_POOL: Exercise[] = [
  { name: 'Développé couché barre', detail: '4 × 8-10 reps · 90 s repos' },
  { name: 'Tirage vertical poulie haute', detail: '4 × 10-12 reps · 75 s repos' },
  { name: 'Presse à cuisses inclinée', detail: '4 × 12 reps · 90 s repos' },
  { name: 'Développé militaire haltères', detail: '3 × 10 reps · 75 s repos' },
  { name: 'Leg Curl ischios-jambiers', detail: '3 × 12 reps · 60 s repos' },
  { name: 'Élévations latérales poulie', detail: '3 × 15 reps · 45 s repos' },
  { name: 'Crunch à la poulie haute', detail: '3 × 15 reps · 45 s repos' },
];

const DUMBBELL_POOL: Exercise[] = [
  { name: 'Développé haltères couché ou sol', detail: '4 × 10 reps · 60 s repos' },
  { name: 'Rowing buste penché haltères', detail: '4 × 12 reps · 60 s repos' },
  { name: 'Goblet Squat avec haltère', detail: '4 × 12 reps · 60 s repos' },
  { name: 'Fentes marchées haltères', detail: '3 × 10 reps/jambe · 60 s repos' },
  { name: 'Développé épaules assis', detail: '3 × 12 reps · 60 s repos' },
  { name: 'Curl biceps marteau', detail: '3 × 12 reps · 45 s repos' },
];

// Helper delay to mimic AI thinking
const think = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export const aiService = {
  async generateWorkout(duration: string, location: string): Promise<WorkoutPlan> {
    await think(650);
    const count = duration.includes('15') ? 4 : duration.includes('45') ? 6 : duration.includes('1h') ? 7 : 5;
    const sourcePool = location.toLowerCase().includes('salle') ? GYM_POOL : CLASSIC_POOL;
    const picked = sourcePool.slice(0, count);

    return {
      title: `Full Body · ${duration} (${location})`,
      exercises: picked,
    };
  },

  async generateRagWorkout(goal: string, duration: string, equipment: string): Promise<WorkoutPlan> {
    await think(700);
    let pool = CLASSIC_POOL;
    if (equipment.toLowerCase().includes('haltère') || equipment.toLowerCase().includes('dumb')) {
      pool = [...DUMBBELL_POOL, ...CLASSIC_POOL.slice(0, 3)];
    } else if (equipment.toLowerCase().includes('salle') || equipment.toLowerCase().includes('machine')) {
      pool = [...GYM_POOL, ...DUMBBELL_POOL.slice(0, 2)];
    }

    const count = duration.includes('60') ? 7 : duration.includes('45') ? 6 : 5;
    const picked = pool.slice(0, count);

    return {
      title: `${goal.split(' ')[0]} · ${equipment} (${duration})`,
      exercises: picked.map((e, idx) => ({
        name: e.name,
        detail: goal.toLowerCase().includes('force')
          ? '4 × 6-8 reps lourdes · 90 s repos'
          : goal.toLowerCase().includes('hypertrophie')
          ? '3 × 10-12 reps · 60 s repos'
          : '3 × 15 reps dynamiques · 45 s repos',
      })),
    };
  },

  async generateRecipes(effort: string, portions: string): Promise<RecipeSuggestions> {
    await think(650);

    if (effort.toLowerCase().includes('flemme') || effort.includes('10')) {
      return {
        recipes: [
          { name: 'Bowl thon avocat maïs & œuf dur', timeMin: 10, kcal: 450, protG: 36, carbsG: 28, fatG: 18 },
          { name: 'Wrap poulet rôti feta & épinards', timeMin: 8, kcal: 420, protG: 34, carbsG: 38, fatG: 14 },
          { name: 'Omelette champignons & parmesan', timeMin: 10, kcal: 380, protG: 26, carbsG: 6, fatG: 28 },
        ],
        shoppingList: [
          'Thon au naturel · 2 boîtes',
          'Avocat mûr · 2',
          'Œufs plein air · 6',
          'Galettes wrap blé complet · 1 paquet',
          'Blanc de poulet émincé · 300 g',
          'Feta AOP · 150 g',
          'Pousses d\'épinards fraîches',
          'Champignons de Paris · 250 g',
        ],
      };
    }

    if (effort.toLowerCase().includes('motivé') || effort.includes('45')) {
      return {
        recipes: [
          { name: 'Saumon rôti en croûte d\'herbes & patates douces', timeMin: 40, kcal: 580, protG: 44, carbsG: 46, fatG: 22 },
          { name: 'Curry coco pois chiches poulet & riz sauvage', timeMin: 45, kcal: 620, protG: 48, carbsG: 62, fatG: 18 },
          { name: 'Lasagnes légères bœuf 5% & courgettes', timeMin: 50, kcal: 540, protG: 45, carbsG: 40, fatG: 16 },
        ],
        shoppingList: [
          'Pavés de saumon frais · 400 g',
          'Patates douces · 2 grosses',
          'Aneth & herbes fraîches',
          'Filets de poulet fermier · 500 g',
          'Lait de coco bio · 1 brique',
          'Pois chiches cuits · 1 bocal',
          'Pâte de curry doux',
          'Bœuf haché 5% · 400 g',
          'Courgettes fraîches · 3',
          'Coulis de tomate bio',
        ],
      };
    }

    // Default 'Un peu' (20-25 min)
    return {
      recipes: [
        { name: 'Poulet basmati grillé & brocolis vapeur', timeMin: 20, kcal: 520, protG: 42, carbsG: 55, fatG: 14 },
        { name: 'Bowl saumon avocat quinoa & citron vert', timeMin: 15, kcal: 480, protG: 34, carbsG: 40, fatG: 20 },
        { name: 'Chili con carne express maison', timeMin: 25, kcal: 560, protG: 38, carbsG: 48, fatG: 22 },
      ],
      shoppingList: [
        'Blanc de poulet · 400 g',
        'Riz basmati parfumé · 300 g',
        'Brocolis frais · 1 tête',
        'Pavé de saumon · 300 g',
        'Avocats · 2',
        'Quinoa bio · 200 g',
        'Bœuf haché 5% · 400 g',
        'Haricots rouges · 1 boîte',
        'Tomates concassées · 1 boîte',
        'Oignons jaunes · 2',
        'Ail frais · 4 gousses',
        'Huile d\'olive vierge extra',
      ],
    };
  },

  async generateRecipeDetail(name: string, portions: string): Promise<RecipeDetail> {
    await think(500);

    return {
      ingredients: [
        `Protéine principale adaptée pour ${portions}`,
        'Légumes frais de saison · 300 g',
        'Féculent au choix (riz, quinoa, patates) · 200 g',
        'Huile d\'olive vierge · 1 c. à soupe',
        'Sel de Guérande, poivre moulu, herbes aromatiques',
      ],
      steps: [
        `Prépare les ingrédients et réchauffe ta poêle pour "${name}".`,
        'Découpe les légumes en morceaux réguliers et fais-les suer à feu moyen avec un filet d\'huile.',
        'Saisis la source de protéines jusqu\'à belle coloration dorée.',
        'Assemble l\'ensemble avec les féculents cuits et ajuste l\'assaisonnement.',
        'Dresse chaud dans une assiette creuse et déguste sans attendre.',
      ],
    };
  },

  async estimateFood(description: string): Promise<FoodEstimate> {
    await think(600);
    const desc = description.trim().toLowerCase();

    // Smart heuristic parser for common foods
    let kcal = 350;
    let prot = 20;
    let carbs = 40;
    let fat = 10;

    if (desc.includes('poulet') || desc.includes('dinde')) {
      kcal += 180;
      prot += 32;
    }
    if (desc.includes('oeuf') || desc.includes('œuf')) {
      kcal += 150;
      prot += 14;
      fat += 10;
    }
    if (desc.includes('saumon') || desc.includes('thon') || desc.includes('poisson')) {
      kcal += 200;
      prot += 28;
      fat += 10;
    }
    if (desc.includes('riz') || desc.includes('pâte') || desc.includes('pain')) {
      kcal += 220;
      carbs += 48;
      prot += 5;
    }
    if (desc.includes('avocat') || desc.includes('huile') || desc.includes('beurre') || desc.includes('fromage')) {
      kcal += 160;
      fat += 16;
    }
    if (desc.includes('salade') || desc.includes('légume') || desc.includes('brocoli')) {
      kcal += 40;
      carbs += 8;
    }

    // Capitalize first letter of display name
    const cleanedName = description.trim().charAt(0).toUpperCase() + description.trim().slice(1);

    return {
      name: cleanedName.length > 50 ? cleanedName.slice(0, 48) + '…' : cleanedName,
      kcal: Math.round(kcal),
      proteinG: Math.round(prot),
      carbsG: Math.round(carbs),
      fatG: Math.round(fat),
    };
  },

  async generateNutritionTip(mealType: string, mealSize: string, totalKcal: number): Promise<string> {
    await think(400);
    const tips = [
      'Bon rythme aujourd\'hui — pense à bien t\'hydrater avant ta prochaine séance.',
      'Repas équilibré. Ajoute une portion de légumes verts au prochain pour faire le plein de fibres.',
      'Tu es parfaitement dans ton cap calorique — garde cette régularité jusqu\'au soir.',
      'Pense à une belle source de protéines au prochain repas pour la reconstruction musculaire.',
      'Bravo pour le tracking régulier ! La constance est la seule clé du succès long terme.',
    ];
    return tips[Math.abs(totalKcal) % tips.length];
  },
};
