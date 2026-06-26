import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:no_brain_fit/services/ai/ai_service.dart';
import 'package:no_brain_fit/services/ai/ai_parsers.dart';
import 'package:no_brain_fit/services/fitness_api/fitness_api_service.dart';

/// AI backend that delegates everything to the NoBrainFit server.
/// Keys, prompts, quotas and history all live server-side.
class ServerAiService implements AiService {
  ServerAiService({required this.baseUrl, required this.token})
      : _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          headers: {'Authorization': 'Bearer $token'},
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 90),
          validateStatus: (s) => s != null && s < 500,
        ));

  final String baseUrl;
  final String token;
  final Dio _dio;

  /// Unwraps a server response, turning auth/quota/error codes into messages.
  Map<String, dynamic> _unwrap(Response res) {
    final data = res.data is Map<String, dynamic>
        ? res.data as Map<String, dynamic>
        : <String, dynamic>{};
    final code = res.statusCode ?? 0;
    if (code == 401) throw Exception('Session expirée — reconnecte-toi dans les Paramètres.');
    if (code == 429) {
      throw Exception('Quota atteint (${data['used']}/${data['limit']}). Réessaie demain ou change de plan.');
    }
    if (code >= 400) throw Exception(data['error']?.toString() ?? 'Erreur serveur ($code)');
    return data;
  }

  @override
  Future<WorkoutPlan> generateWorkout({
    required String duration,
    required String location,
  }) async {
    final res = await _dio.post('/api/app/workout/classic',
        data: {'duration': duration, 'location': location});
    final data = _unwrap(res);
    return parseWorkout(jsonEncode(data['workout']));
  }

  @override
  Future<WorkoutPlan> generateRagWorkout({
    required String goal,
    required String duration,
    required String equipment,
    required List<FitnessApiExercise> exercises,
  }) async {
    final res = await _dio.post('/api/app/workout', data: {
      'goal': goal,
      'duration': duration,
      'equipment': equipment,
      'exercises': exercises
          .map((e) => {'name': e.name, 'muscle': e.muscle, 'equipment': e.equipment})
          .toList(),
    });
    final data = _unwrap(res);
    return parseWorkout(jsonEncode(data['workout']));
  }

  @override
  Future<RecipeSuggestions> generateRecipes({
    required String effort,
    required String portions,
  }) async {
    final res = await _dio.post('/api/app/recipes',
        data: {'effort': effort, 'portions': portions});
    final data = _unwrap(res);
    return parseRecipes(jsonEncode(data));
  }

  @override
  Future<String> generateNutritionTip({
    required String mealType,
    required String mealSize,
    required int totalKcal,
  }) async {
    final res = await _dio.post('/api/app/nutrition-tip',
        data: {'mealType': mealType, 'mealSize': mealSize, 'totalKcal': totalKcal});
    final data = _unwrap(res);
    return (data['tip'] as String? ?? '').trim();
  }
}

/// Fitness exercise source backed by the server's curated DB library.
/// Used for RAG when the server backend is active, so the exercise pool is
/// managed from the admin back-office rather than bundled in the app.
class ServerFitnessApiService implements FitnessApiService {
  ServerFitnessApiService({required this.baseUrl, required this.token})
      : _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          headers: {'Authorization': 'Bearer $token'},
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 20),
        ));

  final String baseUrl;
  final String token;
  final Dio _dio;

  @override
  Future<List<FitnessApiExercise>> fetchExercises(FitnessEquipment equipment) async {
    final res = await _dio.get('/api/app/exercises',
        queryParameters: {'equipment': equipment.name});
    final data = res.data as Map<String, dynamic>;
    final list = (data['exercises'] as List? ?? const []);
    return list
        .map((e) => FitnessApiExercise.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
