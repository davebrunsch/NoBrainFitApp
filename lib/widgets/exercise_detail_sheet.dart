import 'package:flutter/material.dart';
import 'package:no_brain_fit/services/ai/ai_service.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/utils/workout_parse.dart';

/// Generic execution cues shown for any exercise. Real per-exercise
/// instructions would come from an enriched exercise library (future).
const _formCues = [
  'Contrôle la descente, ne relâche pas en bas du mouvement.',
  'Garde le dos neutre et les abdos gainés.',
  'Respire : expire à l\'effort, inspire au retour.',
  'Privilégie l\'amplitude complète à la charge.',
];

void showExerciseDetailSheet(BuildContext context, Exercise exercise, {Color accent = Brand.blue}) {
  final info = WorkoutSetInfo.parse(exercise.detail);
  showModalBottomSheet<void>(
    context: context,
    backgroundColor: Brand.bgSurface,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(Brand.rSheet)),
    ),
    builder: (_) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s12, Brand.s20, Brand.s24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 36, height: 4,
                decoration: BoxDecoration(color: Brand.grey3, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: Brand.s20),
            Text(exercise.name,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, letterSpacing: -.5, color: Brand.white)),
            const SizedBox(height: Brand.s16),
            Row(children: [
              _Metric(label: 'Séries', value: '${info.sets}', accent: accent),
              const SizedBox(width: Brand.s8),
              _Metric(label: 'Reps', value: info.reps.isEmpty ? '—' : info.reps, accent: accent),
              const SizedBox(width: Brand.s8),
              _Metric(label: 'Repos', value: info.restSec == null ? '—' : '${info.restSec}s', accent: accent),
            ]),
            const SizedBox(height: Brand.s20),
            const Text('Conseils de forme', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: .14, color: Brand.grey2)),
            const SizedBox(height: Brand.s8),
            ..._formCues.map((c) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Icon(Icons.check_rounded, size: 15, color: accent),
                    const SizedBox(width: Brand.s8),
                    Expanded(child: Text(c, style: const TextStyle(fontSize: 13, color: Brand.grey1, height: 1.4))),
                  ]),
                )),
          ],
        ),
      ),
    ),
  );
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value, required this.accent});
  final String label, value;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: Brand.s12),
        decoration: BoxDecoration(
          color: Brand.bgCard,
          borderRadius: BorderRadius.circular(Brand.rCard),
          border: Border.all(color: Brand.border),
        ),
        child: Column(children: [
          Text(value, style: Brand.mono(size: 18, weight: FontWeight.w700, color: accent)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 11, color: Brand.grey2)),
        ]),
      ),
    );
  }
}
