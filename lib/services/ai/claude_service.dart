import 'package:dio/dio.dart';
import 'package:no_brain_fit/services/fitness_api/fitness_api_service.dart';
import 'ai_service.dart';
import 'ai_config.dart';
import 'ai_parsers.dart';

/// Claude API (Anthropic) backend.
class ClaudeService implements AiService {
  ClaudeService({required this.apiKey})
      : _dio = Dio(BaseOptions(
          baseUrl: 'https://api.anthropic.com/v1',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          connectTimeout: const Duration(seconds: 20),
          receiveTimeout: const Duration(seconds: 60),
        ));

  final String apiKey;
  final Dio _dio;

  Future<String> _complete(String prompt) async {
    final res = await _dio.post('/messages', data: {
      'model': AiConfig.defaultClaudeModel,
      'max_tokens': 1024,
      'messages': [
        {'role': 'user', 'content': prompt}
      ],
    });
    final content = res.data['content'] as List;
    return (content.first['text'] as String).trim();
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
  Future<WorkoutPlan> generateRagWorkout({
    required String goal,
    required String duration,
    required String equipment,
    required List<FitnessApiExercise> exercises,
  }) async {
    final raw = await _complete(AiPrompts.ragWorkout(
      goal: goal,
      duration: duration,
      equipment: equipment,
      exercises: exercises,
    ));
    return parseWorkout(raw);
  }
}
