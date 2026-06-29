import 'package:dio/dio.dart';
import 'package:no_brain_fit/services/fitness_api/fitness_api_service.dart';
import 'ai_service.dart';
import 'ai_parsers.dart';

/// Ollama local backend.
///
/// Requires an Ollama instance running at [baseUrl].
/// On Android emulator: use http://10.0.2.2:11434
/// On a real device (same WiFi): use your machine's LAN IP, e.g. http://192.168.1.X:11434
///
/// Recommended models: llama3.2, mistral, gemma3
class OllamaService implements AiService {
  OllamaService({required this.baseUrl, required this.model})
      : _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 120),
        ));

  final String baseUrl;
  final String model;
  final Dio _dio;

  Future<String> _complete(String prompt) async {
    final res = await _dio.post('/api/generate', data: {
      'model': model,
      'prompt': prompt,
      'stream': false,
      'options': {'temperature': 0.7, 'num_predict': 1024},
    });
    return (res.data['response'] as String).trim();
  }

  // Forces strict JSON output via Ollama's native format parameter.
  Future<String> _completeJson(String prompt) async {
    final res = await _dio.post('/api/generate', data: {
      'model': model,
      'prompt': prompt,
      'stream': false,
      'format': 'json',
      'options': {'temperature': 0.5, 'num_predict': 2048},
    });
    return (res.data['response'] as String).trim();
  }

  @override
  Future<WorkoutPlan> generateWorkout({
    required String duration,
    required String location,
  }) async {
    final raw = await _complete(AiPrompts.workout(duration: duration, location: location));
    return parseWorkout(raw);
  }

  @override
  Future<RecipeSuggestions> generateRecipes({
    required String effort,
    required String portions,
  }) async {
    final raw = await _complete(AiPrompts.recipes(effort: effort, portions: portions));
    return parseRecipes(raw);
  }

  @override
  Future<String> generateNutritionTip({
    required String mealType,
    required String mealSize,
    required int totalKcal,
  }) async {
    return _complete(AiPrompts.nutritionTip(
      mealType: mealType,
      mealSize: mealSize,
      totalKcal: totalKcal,
    ));
  }

  @override
  Future<FoodEstimate> estimateFood({required String description}) async {
    final raw = await _completeJson(AiPrompts.foodEstimate(description: description));
    return parseFoodEstimate(raw);
  }

  @override
  Future<RecipeDetail> generateRecipeDetail({required String name, required String portions}) async {
    final raw = await _completeJson(AiPrompts.recipeDetail(name: name, portions: portions));
    return parseRecipeDetail(raw);
  }

  @override
  Future<WorkoutPlan> generateRagWorkout({
    required String goal,
    required String duration,
    required String equipment,
    required List<FitnessApiExercise> exercises,
  }) async {
    final raw = await _completeJson(AiPrompts.ragWorkout(
      goal: goal,
      duration: duration,
      equipment: equipment,
      exercises: exercises,
    ));
    return parseWorkout(raw);
  }
}
