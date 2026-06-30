/// Best-effort parsing of an AI `detail` string into structured set data,
/// e.g. "3 × 12 reps · 60 s repos" or "4 séries × 10 reps · 90 s repos".
class WorkoutSetInfo {
  const WorkoutSetInfo({required this.sets, required this.reps, required this.restSec});

  final int sets;
  final String reps;
  final int? restSec; // null when the string carries no rest → caller's default

  static WorkoutSetInfo parse(String detail) {
    int sets = 3;
    final setsM = RegExp(r'(\d+)\s*(?:×|x|s[ée]ries?|sets?)', caseSensitive: false).firstMatch(detail)
        ?? RegExp(r'(\d+)').firstMatch(detail);
    if (setsM != null) sets = int.tryParse(setsM.group(1)!) ?? 3;

    int? rest;
    final restMatches = RegExp(r'(\d+)\s*s(?![a-z])', caseSensitive: false).allMatches(detail).toList();
    if (restMatches.isNotEmpty) rest = int.tryParse(restMatches.last.group(1)!);

    String reps = '';
    final repsM = RegExp(r'(\d+(?:\s*[-à]\s*\d+)?)\s*reps?', caseSensitive: false).firstMatch(detail);
    if (repsM != null) reps = repsM.group(1)!.trim();

    return WorkoutSetInfo(
      sets: sets.clamp(1, 12),
      reps: reps,
      restSec: rest == null ? null : rest.clamp(0, 600),
    );
  }
}
