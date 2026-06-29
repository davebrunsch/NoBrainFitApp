import 'package:no_brain_fit/services/fitness_api/fitness_api_service.dart';

/// Abstract AI service interface.
/// Both Claude and Ollama backends implement this.
abstract class AiService {
  /// Generate a workout plan.
  /// [duration] : e.g. "30 min"
  /// [location] : e.g. "Maison", "Salle", "Dehors", "Cardio"
  Future<WorkoutPlan> generateWorkout({
    required String duration,
    required String location,
  });

  /// Generate a RAG workout plan.
  /// The AI must only use exercises from [exercises] (retrieved from the fitness API).
  /// [goal]      : e.g. "Perte de poids", "Force", "Hypertrophie"
  /// [duration]  : e.g. "30 min", "45 min", "60 min"
  /// [equipment] : e.g. "Haltères", "Salle complète"
  /// [exercises] : curated list fetched from the fitness API
  Future<WorkoutPlan> generateRagWorkout({
    required String goal,
    required String duration,
    required String equipment,
    required List<FitnessApiExercise> exercises,
  });

  /// Generate recipe suggestions.
  /// [effort]   : e.g. "La flemme", "Un peu", "Motivé"
  /// [portions] : e.g. "2 personnes", "Famille"
  Future<RecipeSuggestions> generateRecipes({
    required String effort,
    required String portions,
  });

  /// Generate a nutritional tip for the day.
  /// [mealType] : e.g. "Déjeuner"
  /// [mealSize] : e.g. "Normal"
  /// [totalKcal] : kcal already consumed today
  Future<String> generateNutritionTip({
    required String mealType,
    required String mealSize,
    required int totalKcal,
  });

  /// Estimate the nutrition of a free-text food description.
  /// [description] : e.g. "150g de poulet, un bol de riz".
  Future<FoodEstimate> estimateFood({required String description});

  /// Generate the full detail (ingredients + steps) for a named recipe.
  Future<RecipeDetail> generateRecipeDetail({
    required String name,
    required String portions,
  });
}

// ── Data models ───────────────────────────────────────────────────────────────

class WorkoutPlan {
  const WorkoutPlan({required this.title, required this.exercises});
  final String title;
  final List<Exercise> exercises;
}

class Exercise {
  const Exercise({required this.name, required this.detail});
  final String name;   // e.g. "Pompes"
  final String detail; // e.g. "3 × 12 reps · 60 s repos"
}

class RecipeSuggestions {
  const RecipeSuggestions({required this.recipes, required this.shoppingList});
  final List<Recipe> recipes;
  final List<String> shoppingList;
}

class Recipe {
  const Recipe({
    required this.name,
    required this.timeMin,
    required this.kcal,
    required this.protG,
    this.carbsG = 0,
    this.fatG = 0,
  });
  final String name;
  final int timeMin;
  final int kcal;
  final int protG;
  final int carbsG;
  final int fatG;
}

/// Full recipe: ingredients + step-by-step instructions.
class RecipeDetail {
  const RecipeDetail({required this.ingredients, required this.steps});
  final List<String> ingredients;
  final List<String> steps;
}

/// AI-estimated nutrition for a food description.
class FoodEstimate {
  const FoodEstimate({
    required this.name,
    required this.kcal,
    required this.proteinG,
    required this.carbsG,
    required this.fatG,
  });
  final String name;
  final int kcal;
  final int proteinG;
  final int carbsG;
  final int fatG;
}

// ── Prompt helpers ────────────────────────────────────────────────────────────

abstract class AiPrompts {
  static String workout({required String duration, required String location}) => '''
Tu es un coach fitness. Génère une séance d'entraînement pour les paramètres suivants :
- Durée : $duration
- Lieu : $location

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans explication :
{
  "title": "Nom de la séance (ex: Full Body · 30 min)",
  "exercises": [
    {"name": "Nom de l'exercice", "detail": "X × Y reps · Z s repos"},
    ...
  ]
}
Génère entre 4 et 6 exercices adaptés au lieu et à la durée. Sois précis et réaliste.
''';

  static String recipes({required String effort, required String portions}) => '''
Tu es un nutritionniste cuisinier. Génère 3 recettes rapides et équilibrées pour :
- Niveau d'effort : $effort
- Nombre de personnes : $portions

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans explication :
{
  "recipes": [
    {
      "name": "Nom de la recette",
      "time_min": 20,
      "kcal": 480,
      "prot_g": 35,
      "carbs_g": 45,
      "fat_g": 18
    }
  ],
  "shopping_list": [
    "Ingrédient · quantité",
    ...
  ]
}
3 recettes variées (protéinées, équilibrées, rapides). Valeurs nutritionnelles par portion. Liste de courses consolidée pour les 3 recettes.
''';

  static String recipeDetail({required String name, required String portions}) => '''
Tu es un chef cuisinier. Donne la recette complète de "$name" pour $portions.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans explication :
{
  "ingredients": ["Ingrédient · quantité", ...],
  "steps": ["Étape 1…", "Étape 2…", ...]
}
Ingrédients avec quantités adaptées au nombre de personnes. Étapes claires et numérotées (5 à 8 étapes).
''';

  static String nutritionTip({
    required String mealType,
    required String mealSize,
    required int totalKcal,
  }) => '''
Tu es un nutritionniste bienveillant. L'utilisateur vient de loguer :
- Repas : $mealType ($mealSize)
- Calories consommées aujourd'hui : $totalKcal kcal (objectif : 2000 kcal)

Donne un conseil court (1-2 phrases max), positif et concret pour la suite de la journée.
Réponds directement en français, sans introduction, sans formatage.
''';

  static String foodEstimate({required String description}) => '''
Tu es un nutritionniste. Estime les valeurs nutritionnelles TOTALES de ce que l'utilisateur a mangé : "$description".

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans explication :
{
  "name": "nom court de l'aliment ou du repas",
  "kcal": 0,
  "prot_g": 0,
  "carbs_g": 0,
  "fat_g": 0
}
Valeurs entières correspondant à la quantité décrite (pas par 100g).
''';

  static String ragWorkout({
    required String goal,
    required String duration,
    required String equipment,
    required List<FitnessApiExercise> exercises,
  }) {
    final list = exercises
        .map((e) => '{"name":"${e.name}","muscle":"${e.muscle}","equipment":"${e.equipment}"}')
        .join(',\n    ');
    return '''
Tu es un coach sportif expert. Crée un programme de $goal d'une durée de $duration avec $equipment.

Règle ABSOLUE : Tu DOIS construire la séance UNIQUEMENT en piochant dans cette liste d'exercices. Ne propose AUCUN exercice qui n'est pas dans cette liste :
[
    $list
]

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans explication :
{
  "title": "Nom court de la séance (ex: Force · Haltères · 45 min)",
  "exercises": [
    {"name": "Nom exact de l'exercice depuis la liste ci-dessus", "detail": "X séries × Y reps · Z s repos"},
    ...
  ]
}
Génère entre 5 et 8 exercices. Adapte les séries/reps/repos à l'objectif $goal. Sois précis et réaliste.
''';
  }
}
