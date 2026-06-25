import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'ai_config.dart';
import 'ai_service.dart';
import 'claude_service.dart';
import 'ollama_service.dart';

// ── Config state ──────────────────────────────────────────────────────────────

class AiConfigNotifier extends AsyncNotifier<AiConfig> {
  @override
  Future<AiConfig> build() => AiConfig.load();

  Future<void> save(AiConfig config) async {
    await config.save();
    state = AsyncData(config);
  }
}

final aiConfigProvider = AsyncNotifierProvider<AiConfigNotifier, AiConfig>(
  AiConfigNotifier.new,
);

// ── Service instance ──────────────────────────────────────────────────────────

/// Returns the active [AiService] based on current config.
/// Returns null if backend is not configured (e.g. Claude without an API key).
final aiServiceProvider = Provider<AiService?>((ref) {
  final configAsync = ref.watch(aiConfigProvider);
  return configAsync.whenOrNull(
    data: (config) => switch (config.backend) {
      AiBackend.claude when config.claudeApiKey.isNotEmpty =>
        ClaudeService(apiKey: config.claudeApiKey),
      AiBackend.ollama =>
        OllamaService(baseUrl: config.ollamaBaseUrl, model: config.ollamaModel),
      _ => null, // Claude selected but no key
    },
  );
});

// ── Generation providers (AsyncNotifier per use-case) ─────────────────────────

/// Workout generation.
class WorkoutNotifier extends AsyncNotifier<WorkoutPlan?> {
  @override
  Future<WorkoutPlan?> build() async => null; // idle initially

  Future<void> generate({required String duration, required String location}) async {
    state = const AsyncLoading();
    final service = ref.read(aiServiceProvider);
    if (service == null) {
      state = AsyncError('Aucun backend AI configuré.', StackTrace.current);
      return;
    }
    state = await AsyncValue.guard(
      () => service.generateWorkout(duration: duration, location: location),
    );
  }
}

final workoutProvider = AsyncNotifierProvider<WorkoutNotifier, WorkoutPlan?>(
  WorkoutNotifier.new,
);

/// Recipe generation.
class RecipesNotifier extends AsyncNotifier<RecipeSuggestions?> {
  @override
  Future<RecipeSuggestions?> build() async => null;

  Future<void> generate({required String effort, required String portions}) async {
    state = const AsyncLoading();
    final service = ref.read(aiServiceProvider);
    if (service == null) {
      state = AsyncError('Aucun backend AI configuré.', StackTrace.current);
      return;
    }
    state = await AsyncValue.guard(
      () => service.generateRecipes(effort: effort, portions: portions),
    );
  }
}

final recipesProvider = AsyncNotifierProvider<RecipesNotifier, RecipeSuggestions?>(
  RecipesNotifier.new,
);

/// Nutrition tip generation.
class NutritionTipNotifier extends AsyncNotifier<String?> {
  @override
  Future<String?> build() async => null;

  Future<void> generate({
    required String mealType,
    required String mealSize,
    required int totalKcal,
  }) async {
    state = const AsyncLoading();
    final service = ref.read(aiServiceProvider);
    if (service == null) {
      state = AsyncError('Aucun backend AI configuré.', StackTrace.current);
      return;
    }
    state = await AsyncValue.guard(
      () => service.generateNutritionTip(
        mealType: mealType,
        mealSize: mealSize,
        totalKcal: totalKcal,
      ),
    );
  }
}

final nutritionTipProvider = AsyncNotifierProvider<NutritionTipNotifier, String?>(
  NutritionTipNotifier.new,
);
