import 'package:no_brain_fit/services/ai/ai_service.dart';

/// A single exercise as stored locally (history / favorites).
class StoredExercise {
  const StoredExercise({required this.name, required this.detail});
  final String name;
  final String detail;

  Exercise toExercise() => Exercise(name: name, detail: detail);

  Map<String, dynamic> toJson() => {'name': name, 'detail': detail};
  factory StoredExercise.fromJson(Map<String, dynamic> j) =>
      StoredExercise(name: j['name'] as String? ?? '', detail: j['detail'] as String? ?? '');
  factory StoredExercise.fromExercise(Exercise e) =>
      StoredExercise(name: e.name, detail: e.detail);
}

/// A completed workout, recorded when a guided session finishes.
class WorkoutHistoryEntry {
  const WorkoutHistoryEntry({
    required this.id,
    required this.title,
    required this.type,
    required this.date,
    required this.durationSec,
    required this.exercisesCount,
    required this.setsCompleted,
  });

  final String id;
  final String title;
  final String type;
  final DateTime date;
  final int durationSec;
  final int exercisesCount;
  final int setsCompleted;

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'type': type,
        'date': date.toIso8601String(),
        'durationSec': durationSec,
        'exercisesCount': exercisesCount,
        'setsCompleted': setsCompleted,
      };

  factory WorkoutHistoryEntry.fromJson(Map<String, dynamic> j) => WorkoutHistoryEntry(
        id: j['id'] as String? ?? '',
        title: j['title'] as String? ?? 'Séance',
        type: j['type'] as String? ?? '',
        date: DateTime.tryParse(j['date'] as String? ?? '') ?? DateTime.now(),
        durationSec: (j['durationSec'] as num?)?.toInt() ?? 0,
        exercisesCount: (j['exercisesCount'] as num?)?.toInt() ?? 0,
        setsCompleted: (j['setsCompleted'] as num?)?.toInt() ?? 0,
      );
}

/// A saved program the user can re-run without regenerating it.
class SavedWorkout {
  const SavedWorkout({
    required this.id,
    required this.title,
    required this.type,
    required this.exercises,
    required this.savedAt,
  });

  final String id;
  final String title;
  final String type;
  final List<StoredExercise> exercises;
  final DateTime savedAt;

  WorkoutPlan toPlan() =>
      WorkoutPlan(title: title, exercises: exercises.map((e) => e.toExercise()).toList());

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'type': type,
        'savedAt': savedAt.toIso8601String(),
        'exercises': exercises.map((e) => e.toJson()).toList(),
      };

  factory SavedWorkout.fromJson(Map<String, dynamic> j) => SavedWorkout(
        id: j['id'] as String? ?? '',
        title: j['title'] as String? ?? 'Séance',
        type: j['type'] as String? ?? '',
        savedAt: DateTime.tryParse(j['savedAt'] as String? ?? '') ?? DateTime.now(),
        exercises: ((j['exercises'] as List?) ?? const [])
            .map((e) => StoredExercise.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  factory SavedWorkout.fromPlan(WorkoutPlan plan, {required String type}) => SavedWorkout(
        id: DateTime.now().microsecondsSinceEpoch.toString(),
        title: plan.title,
        type: type,
        savedAt: DateTime.now(),
        exercises: plan.exercises.map(StoredExercise.fromExercise).toList(),
      );
}
