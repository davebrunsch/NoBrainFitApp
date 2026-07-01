import 'dart:math';

import 'package:no_brain_fit/services/fitness_api/fitness_api_service.dart';
import 'ai_service.dart';

/// Offline, no-network implementation of [AiService] used by "Mode démo".
///
/// Returns realistic, hand-written content instantly (with a short artificial
/// delay so loading states still look natural) — lets the app be demoed end
/// to end with no server, no Ollama and no Claude key configured.
class DemoAiService implements AiService {
  const DemoAiService();

  static const _thinkDelay = Duration(milliseconds: 650);

  @override
  Future<WorkoutPlan> generateWorkout({
    required String duration,
    required String location,
  }) async {
    await Future.delayed(_thinkDelay);
    final count = duration.contains('15')
        ? 4
        : duration.contains('45')
            ? 7
            : 5;
    return WorkoutPlan(
      title: 'Full Body · $duration ($location)',
      exercises: _classicPool.take(count).toList(),
    );
  }

  @override
  Future<WorkoutPlan> generateRagWorkout({
    required String goal,
    required String duration,
    required String equipment,
    required List<FitnessApiExercise> exercises,
  }) async {
    await Future.delayed(_thinkDelay);
    final pool = exercises.isNotEmpty
        ? exercises
        : const [
            FitnessApiExercise(name: 'Pompes', type: 'strength', muscle: 'chest', equipment: 'body_only', difficulty: 'beginner'),
            FitnessApiExercise(name: 'Squats', type: 'strength', muscle: 'quads', equipment: 'body_only', difficulty: 'beginner'),
          ];
    final count = min(duration.contains('60') ? 8 : duration.contains('45') ? 7 : 5, pool.length);
    final picked = (List.of(pool)..shuffle(Random(goal.hashCode))).take(count);
    return WorkoutPlan(
      title: '${goal.split(' ').first} · $equipment · $duration',
      exercises: picked
          .map((e) => Exercise(name: e.name, detail: '${3 + Random(e.name.hashCode).nextInt(2)} × 10-12 reps · 60 s repos'))
          .toList(),
    );
  }

  @override
  Future<RecipeSuggestions> generateRecipes({
    required String effort,
    required String portions,
  }) async {
    await Future.delayed(_thinkDelay);
    return const RecipeSuggestions(
      recipes: [
        Recipe(name: 'Poulet basmati & brocolis', timeMin: 20, kcal: 520, protG: 42, carbsG: 55, fatG: 14),
        Recipe(name: 'Bowl saumon avocat quinoa', timeMin: 15, kcal: 480, protG: 34, carbsG: 40, fatG: 20),
        Recipe(name: 'Chili con carne maison', timeMin: 30, kcal: 560, protG: 38, carbsG: 48, fatG: 22),
      ],
      shoppingList: [
        'Blanc de poulet · 400 g',
        'Riz basmati · 300 g',
        'Brocolis · 1 tête',
        'Pavé de saumon · 300 g',
        'Avocat · 2',
        'Quinoa · 200 g',
        'Bœuf haché 5% · 400 g',
        'Haricots rouges · 1 boîte',
        'Tomates concassées · 1 boîte',
        'Oignon · 2',
        'Ail · 4 gousses',
        'Huile d\'olive',
      ],
    );
  }

  @override
  Future<String> generateNutritionTip({
    required String mealType,
    required String mealSize,
    required int totalKcal,
  }) async {
    await Future.delayed(_thinkDelay);
    final tips = [
      'Bon rythme aujourd\'hui — pense à bien t\'hydrater avant ta prochaine séance.',
      'Repas équilibré. Ajoute une portion de légumes verts au prochain pour les fibres.',
      'Tu es dans ton objectif calorique — garde ce cap jusqu\'au soir.',
      'Pense à une source de protéines au prochain repas pour la récupération musculaire.',
    ];
    return tips[totalKcal % tips.length];
  }

  @override
  Future<FoodEstimate> estimateFood({required String description}) async {
    await Future.delayed(_thinkDelay);
    final base = 150 + (description.length * 7) % 450;
    return FoodEstimate(
      name: description.length > 40 ? '${description.substring(0, 40)}…' : description,
      kcal: base,
      proteinG: (base * 0.18).round(),
      carbsG: (base * 0.45).round(),
      fatG: (base * 0.12).round(),
    );
  }

  @override
  Future<RecipeDetail> generateRecipeDetail({
    required String name,
    required String portions,
  }) async {
    await Future.delayed(_thinkDelay);
    return RecipeDetail(
      ingredients: [
        'Ingrédient principal · adapté pour $portions',
        'Légumes de saison · 300 g',
        'Féculent au choix · 200 g',
        'Huile d\'olive · 1 c. à soupe',
        'Sel, poivre, épices au choix',
      ],
      steps: [
        'Préchauffe le four ou une poêle selon la recette de "$name".',
        'Prépare et découpe tous les ingrédients.',
        'Fais cuire la source de protéines à feu moyen.',
        'Ajoute les légumes et laisse mijoter quelques minutes.',
        'Assaisonne, dresse et sers immédiatement.',
      ],
    );
  }

  static const _classicPool = [
    Exercise(name: 'Pompes', detail: '4 × 12 reps · 60 s repos'),
    Exercise(name: 'Squats', detail: '4 × 15 reps · 60 s repos'),
    Exercise(name: 'Fentes avant', detail: '3 × 12 reps · 45 s repos'),
    Exercise(name: 'Planche', detail: '3 × 40 s · 45 s repos'),
    Exercise(name: 'Mountain Climbers', detail: '3 × 30 s · 30 s repos'),
    Exercise(name: 'Dips sur chaise', detail: '3 × 12 reps · 45 s repos'),
    Exercise(name: 'Superman', detail: '3 × 15 reps · 30 s repos'),
  ];
}
