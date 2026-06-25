import 'dart:convert';
import 'package:dio/dio.dart';
import 'ai_service.dart';
import 'ai_config.dart';

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
    return _parseWorkout(raw);
  }

  @override
  Future<RecipeSuggestions> generateRecipes({
    required String effort,
    required String portions,
  }) async {
    final raw = await _complete(AiPrompts.recipes(effort: effort, portions: portions));
    return _parseRecipes(raw);
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
}

// ── Parsers (shared with OllamaService) ──────────────────────────────────────

WorkoutPlan _parseWorkout(String raw) {
  final json = jsonDecode(_extractJson(raw)) as Map<String, dynamic>;
  final exList = (json['exercises'] as List).map((e) => Exercise(
    name: e['name'] as String,
    detail: e['detail'] as String,
  )).toList();
  return WorkoutPlan(title: json['title'] as String, exercises: exList);
}

RecipeSuggestions _parseRecipes(String raw) {
  final json = jsonDecode(_extractJson(raw)) as Map<String, dynamic>;
  final recipes = (json['recipes'] as List).map((r) => Recipe(
    name:    r['name']    as String,
    timeMin: r['time_min'] as int,
    kcal:    r['kcal']    as int,
    protG:   r['prot_g']  as int,
  )).toList();
  final shopping = (json['shopping_list'] as List).cast<String>();
  return RecipeSuggestions(recipes: recipes, shoppingList: shopping);
}

/// Strip any markdown fences before parsing JSON.
String _extractJson(String raw) {
  final s = raw.trim();
  final fence = RegExp(r'```(?:json)?\s*([\s\S]*?)```');
  final m = fence.firstMatch(s);
  return m != null ? m.group(1)!.trim() : s;
}
