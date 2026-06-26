import 'package:dio/dio.dart';

/// A single exercise from the fitness API.
class FitnessApiExercise {
  const FitnessApiExercise({
    required this.name,
    required this.type,
    required this.muscle,
    required this.equipment,
    required this.difficulty,
  });

  final String name;
  final String type;
  final String muscle;
  final String equipment;
  final String difficulty;

  factory FitnessApiExercise.fromJson(Map<String, dynamic> j) =>
      FitnessApiExercise(
        name:       j['name']       as String? ?? '',
        type:       j['type']       as String? ?? '',
        muscle:     j['muscle']     as String? ?? '',
        equipment:  j['equipment']  as String? ?? '',
        difficulty: j['difficulty'] as String? ?? '',
      );
}

/// Equipment categories.
enum FitnessEquipment {
  bodyweight,
  dumbbells,
  machines,
  fullGym;

  String get label => switch (this) {
        FitnessEquipment.bodyweight => 'Poids de corps',
        FitnessEquipment.dumbbells  => 'Haltères',
        FitnessEquipment.machines   => 'Machines guidées',
        FitnessEquipment.fullGym    => 'Salle complète',
      };

  static FitnessEquipment fromLabel(String label) => FitnessEquipment.values
      .firstWhere((e) => e.label == label, orElse: () => FitnessEquipment.bodyweight);
}

/// Abstract fitness API service.
abstract class FitnessApiService {
  Future<List<FitnessApiExercise>> fetchExercises(FitnessEquipment equipment);
}

// ── Mock ──────────────────────────────────────────────────────────────────────

class MockFitnessApiService implements FitnessApiService {
  const MockFitnessApiService();

  @override
  Future<List<FitnessApiExercise>> fetchExercises(FitnessEquipment equipment) async {
    await Future.delayed(const Duration(milliseconds: 180));
    return _data[equipment] ?? [];
  }

  static const _bodyweight = [
    FitnessApiExercise(name: 'Pompes',             type: 'strength', muscle: 'chest',       equipment: 'body_only', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Squats',             type: 'strength', muscle: 'quads',       equipment: 'body_only', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Fentes avant',       type: 'strength', muscle: 'quads',       equipment: 'body_only', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Mountain Climbers',  type: 'cardio',   muscle: 'abdominals',  equipment: 'body_only', difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Burpees',            type: 'cardio',   muscle: 'full_body',   equipment: 'body_only', difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Dips sur chaise',    type: 'strength', muscle: 'triceps',     equipment: 'body_only', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Planche',            type: 'strength', muscle: 'abdominals',  equipment: 'body_only', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Crunchs',            type: 'strength', muscle: 'abdominals',  equipment: 'body_only', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Superman',           type: 'strength', muscle: 'lower_back',  equipment: 'body_only', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Hip Thrust au sol',  type: 'strength', muscle: 'glutes',      equipment: 'body_only', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Jumping Jacks',      type: 'cardio',   muscle: 'full_body',   equipment: 'body_only', difficulty: 'beginner'),
    FitnessApiExercise(name: 'High Knees',         type: 'cardio',   muscle: 'abdominals',  equipment: 'body_only', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Pike Push-ups',      type: 'strength', muscle: 'shoulders',   equipment: 'body_only', difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Pompes déclinées',   type: 'strength', muscle: 'chest',       equipment: 'body_only', difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Wall Sit',           type: 'strength', muscle: 'quads',       equipment: 'body_only', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Glute Bridge',       type: 'strength', muscle: 'glutes',      equipment: 'body_only', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Bear Crawl',         type: 'cardio',   muscle: 'full_body',   equipment: 'body_only', difficulty: 'intermediate'),
  ];

  static const _dumbbells = [
    FitnessApiExercise(name: 'Curl biceps haltères',       type: 'strength', muscle: 'biceps',    equipment: 'dumbbell', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Développé épaules haltères', type: 'strength', muscle: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Rowing haltère',             type: 'strength', muscle: 'lats',      equipment: 'dumbbell', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Squat gobelet',              type: 'strength', muscle: 'quads',     equipment: 'dumbbell', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Fentes avec haltères',       type: 'strength', muscle: 'quads',     equipment: 'dumbbell', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Développé couché haltères',  type: 'strength', muscle: 'chest',     equipment: 'dumbbell', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Élévations latérales',       type: 'strength', muscle: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Extension triceps haltère',  type: 'strength', muscle: 'triceps',   equipment: 'dumbbell', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Romanian Deadlift haltères', type: 'strength', muscle: 'hamstrings',equipment: 'dumbbell', difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Shrugs haltères',            type: 'strength', muscle: 'traps',     equipment: 'dumbbell', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Curl marteau',               type: 'strength', muscle: 'biceps',    equipment: 'dumbbell', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Sumo squat haltère',         type: 'strength', muscle: 'glutes',    equipment: 'dumbbell', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Fly couché haltères',        type: 'strength', muscle: 'chest',     equipment: 'dumbbell', difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Bent-over row haltères',     type: 'strength', muscle: 'lats',      equipment: 'dumbbell', difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Élévations frontales',       type: 'strength', muscle: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Kickback triceps',           type: 'strength', muscle: 'triceps',   equipment: 'dumbbell', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Pull-over haltère',          type: 'strength', muscle: 'lats',      equipment: 'dumbbell', difficulty: 'intermediate'),
  ];

  static const _machines = [
    FitnessApiExercise(name: 'Leg Press',                type: 'strength', muscle: 'quads',     equipment: 'machine', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Leg Extension',            type: 'strength', muscle: 'quads',     equipment: 'machine', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Leg Curl',                 type: 'strength', muscle: 'hamstrings',equipment: 'machine', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Chest Press machine',      type: 'strength', muscle: 'chest',     equipment: 'machine', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Shoulder Press machine',   type: 'strength', muscle: 'shoulders', equipment: 'machine', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Lat Pulldown',             type: 'strength', muscle: 'lats',      equipment: 'cable',   difficulty: 'beginner'),
    FitnessApiExercise(name: 'Cable Row',                type: 'strength', muscle: 'lats',      equipment: 'cable',   difficulty: 'beginner'),
    FitnessApiExercise(name: 'Pec Deck',                 type: 'strength', muscle: 'chest',     equipment: 'machine', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Tricep Pushdown câble',    type: 'strength', muscle: 'triceps',   equipment: 'cable',   difficulty: 'beginner'),
    FitnessApiExercise(name: 'Curl biceps machine',      type: 'strength', muscle: 'biceps',    equipment: 'machine', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Abduction hanche machine', type: 'strength', muscle: 'abductors', equipment: 'machine', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Adduction hanche machine', type: 'strength', muscle: 'adductors', equipment: 'machine', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Hack Squat machine',       type: 'strength', muscle: 'quads',     equipment: 'machine', difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Calf Raise assis',         type: 'strength', muscle: 'calves',    equipment: 'machine', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Traction assistée',        type: 'strength', muscle: 'lats',      equipment: 'machine', difficulty: 'beginner'),
    FitnessApiExercise(name: 'Face Pulls câble',         type: 'strength', muscle: 'shoulders', equipment: 'cable',   difficulty: 'beginner'),
  ];

  static const _fullGym = [
    FitnessApiExercise(name: 'Squat barre',                  type: 'strength', muscle: 'quads',      equipment: 'barbell',   difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Soulevé de terre',             type: 'strength', muscle: 'hamstrings', equipment: 'barbell',   difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Développé couché barre',       type: 'strength', muscle: 'chest',      equipment: 'barbell',   difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Rowing barre',                 type: 'strength', muscle: 'lats',       equipment: 'barbell',   difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Overhead Press barre',         type: 'strength', muscle: 'shoulders',  equipment: 'barbell',   difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Tractions',                    type: 'strength', muscle: 'lats',       equipment: 'body_only', difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Dips',                         type: 'strength', muscle: 'chest',      equipment: 'body_only', difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Romanian Deadlift barre',      type: 'strength', muscle: 'hamstrings', equipment: 'barbell',   difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Développé incliné barre',      type: 'strength', muscle: 'chest',      equipment: 'barbell',   difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Leg Press',                    type: 'strength', muscle: 'quads',      equipment: 'machine',   difficulty: 'beginner'),
    FitnessApiExercise(name: 'Lat Pulldown',                 type: 'strength', muscle: 'lats',       equipment: 'cable',     difficulty: 'beginner'),
    FitnessApiExercise(name: 'Cable Row',                    type: 'strength', muscle: 'lats',       equipment: 'cable',     difficulty: 'beginner'),
    FitnessApiExercise(name: 'Tricep Pushdown câble',        type: 'strength', muscle: 'triceps',    equipment: 'cable',     difficulty: 'beginner'),
    FitnessApiExercise(name: 'Curl câble',                   type: 'strength', muscle: 'biceps',     equipment: 'cable',     difficulty: 'beginner'),
    FitnessApiExercise(name: 'Élévations latérales haltères',type: 'strength', muscle: 'shoulders',  equipment: 'dumbbell',  difficulty: 'beginner'),
    FitnessApiExercise(name: 'Leg Extension',                type: 'strength', muscle: 'quads',      equipment: 'machine',   difficulty: 'beginner'),
    FitnessApiExercise(name: 'Leg Curl',                     type: 'strength', muscle: 'hamstrings', equipment: 'machine',   difficulty: 'beginner'),
    FitnessApiExercise(name: 'Face Pulls câble',             type: 'strength', muscle: 'shoulders',  equipment: 'cable',     difficulty: 'beginner'),
    FitnessApiExercise(name: 'Hip Thrust barre',             type: 'strength', muscle: 'glutes',     equipment: 'barbell',   difficulty: 'intermediate'),
    FitnessApiExercise(name: 'Calf Raise debout',            type: 'strength', muscle: 'calves',     equipment: 'barbell',   difficulty: 'beginner'),
  ];

  static const _data = {
    FitnessEquipment.bodyweight: _bodyweight,
    FitnessEquipment.dumbbells:  _dumbbells,
    FitnessEquipment.machines:   _machines,
    FitnessEquipment.fullGym:    _fullGym,
  };
}

// ── Real (API-Ninjas) ─────────────────────────────────────────────────────────

class RealFitnessApiService implements FitnessApiService {
  RealFitnessApiService({required this.apiKey})
      : _dio = Dio(BaseOptions(
          baseUrl: 'https://api.api-ninjas.com/v1',
          headers: {'X-Api-Key': apiKey},
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 20),
        ));

  final String apiKey;
  final Dio _dio;

  static const _equipmentMap = {
    FitnessEquipment.bodyweight: 'body_only',
    FitnessEquipment.dumbbells:  'dumbbell',
    FitnessEquipment.machines:   'machine',
    FitnessEquipment.fullGym:    'barbell',
  };

  @override
  Future<List<FitnessApiExercise>> fetchExercises(FitnessEquipment equipment) async {
    final eq = _equipmentMap[equipment] ?? 'body_only';
    final res = await _dio.get('/exercises', queryParameters: {
      'type': 'strength',
      'equipment': eq,
      'limit': 20,
    });
    final list = res.data as List;
    return list.map((e) => FitnessApiExercise.fromJson(e as Map<String, dynamic>)).toList();
  }
}
