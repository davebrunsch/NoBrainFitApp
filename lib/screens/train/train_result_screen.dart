import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/services/ai/ai_provider.dart';
import 'package:no_brain_fit/services/ai/ai_service.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/widgets/result_scaffold.dart';
import 'package:no_brain_fit/screens/train/active_workout_screen.dart';

class TrainResultScreen extends ConsumerStatefulWidget {
  const TrainResultScreen({super.key, required this.duration, required this.location});
  final String duration, location;

  @override
  ConsumerState<TrainResultScreen> createState() => _TrainResultScreenState();
}

class _TrainResultScreenState extends ConsumerState<TrainResultScreen> {
  final Set<int> _done = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(workoutProvider.notifier).generate(
        duration: widget.duration,
        location: widget.location,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final workoutAsync = ref.watch(workoutProvider);

    return workoutAsync.when(
      loading: () => _buildShell(
        title: 'Génération…',
        sub: '${widget.duration} · ${widget.location}',
        child: const _LoadingCard(),
      ),
      error: (e, _) => _buildShell(
        title: 'Erreur',
        sub: '${widget.duration} · ${widget.location}',
        child: _ErrorCard(message: e.toString()),
      ),
      data: (plan) {
        if (plan == null) {
          return _buildShell(
            title: 'Prêt.',
            sub: '${widget.duration} · ${widget.location}',
            child: const _LoadingCard(),
          );
        }
        return _buildShell(
          title: plan.title,
          sub: '${plan.exercises.length} exercices · ${widget.location}',
          child: _ExerciseCard(
            exercises: plan.exercises,
            done: _done,
            onToggle: (i) => setState(() {
              _done.contains(i) ? _done.remove(i) : _done.add(i);
            }),
          ),
          doneCount: _done.length,
          totalCount: plan.exercises.length,
          onStart: () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => ActiveWorkoutScreen(plan: plan, accent: Brand.blue)),
          ),
        );
      },
    );
  }

  Widget _buildShell({
    required String title,
    required String sub,
    required Widget child,
    int doneCount = 0,
    int totalCount = 0,
    VoidCallback? onStart,
  }) {
    return ResultScaffold(
      accent: Brand.blue,
      kicker: 'Training · Généré pour toi',
      title: title,
      sub: sub,
      onHome: () => context.go('/'),
      primaryLabel: '▶  Démarrer',
      onPrimary: onStart ?? () {},
      children: [child],
    );
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _LoadingCard extends StatelessWidget {
  const _LoadingCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Brand.s24),
      decoration: BoxDecoration(
        color: Brand.bgCard,
        borderRadius: BorderRadius.circular(Brand.rCard),
        border: Border.all(color: Brand.border),
      ),
      child: const Center(
        child: Column(
          children: [
            CircularProgressIndicator(color: Brand.blue, strokeWidth: 2),
            SizedBox(height: Brand.s16),
            Text('L\'IA prépare ta séance…', style: TextStyle(fontSize: 13, color: Brand.grey1)),
          ],
        ),
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Brand.s16),
      decoration: BoxDecoration(
        color: Brand.bgCard,
        borderRadius: BorderRadius.circular(Brand.rCard),
        border: Border.all(color: Brand.orange.withOpacity(.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(children: [
            Icon(Icons.warning_amber_rounded, size: 16, color: Brand.orange),
            SizedBox(width: Brand.s8),
            Text('Erreur de génération', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.orange)),
          ]),
          const SizedBox(height: Brand.s8),
          Text(message, style: const TextStyle(fontSize: 12, color: Brand.grey1)),
          const SizedBox(height: Brand.s12),
          const Text(
            'Vérifie la config IA dans les Paramètres.',
            style: TextStyle(fontSize: 12, color: Brand.grey2),
          ),
        ],
      ),
    );
  }
}

class _ExerciseCard extends StatelessWidget {
  const _ExerciseCard({required this.exercises, required this.done, required this.onToggle});
  final List<Exercise> exercises;
  final Set<int> done;
  final void Function(int) onToggle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Brand.s16),
      decoration: BoxDecoration(
        color: Brand.bgCard,
        borderRadius: BorderRadius.circular(Brand.rCard),
        border: Border.all(color: Brand.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            const Text('Ta séance', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.white)),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
              decoration: BoxDecoration(
                color: Brand.blue.withOpacity(.12),
                borderRadius: BorderRadius.circular(Brand.rChip),
                border: Border.all(color: Brand.blue.withOpacity(.25)),
              ),
              child: Text(
                '${done.length} / ${exercises.length}',
                style: Brand.mono(size: 11, weight: FontWeight.w700, color: Brand.blue, letterSpacing: .04),
              ),
            ),
          ]),
          const SizedBox(height: Brand.s8),
          ...List.generate(exercises.length, (i) => _ExerciseRow(
            index: i + 1,
            exercise: exercises[i],
            isDone: done.contains(i),
            onToggle: () => onToggle(i),
          )),
        ],
      ),
    );
  }
}

class _ExerciseRow extends StatelessWidget {
  const _ExerciseRow({required this.index, required this.exercise, required this.isDone, required this.onToggle});
  final int index;
  final Exercise exercise;
  final bool isDone;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onToggle,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: Brand.s12),
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Brand.border))),
        child: Row(children: [
          Container(
            width: 24, height: 24,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Brand.blue.withOpacity(.12),
              borderRadius: BorderRadius.circular(7),
            ),
            child: Text(
              index.toString().padLeft(2, '0'),
              style: Brand.mono(size: 11, weight: FontWeight.w700, color: Brand.blue),
            ),
          ),
          const SizedBox(width: Brand.s12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(
                exercise.name,
                style: TextStyle(
                  fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: -.2,
                  color: isDone ? Brand.grey2 : Brand.white,
                  decoration: isDone ? TextDecoration.lineThrough : null,
                  decorationColor: Brand.grey2,
                ),
              ),
              const SizedBox(height: 2),
              Text(exercise.detail, style: const TextStyle(fontSize: 11, color: Brand.grey2)),
            ]),
          ),
          AnimatedContainer(
            duration: const Duration(milliseconds: 140),
            width: 22, height: 22,
            decoration: BoxDecoration(
              color: isDone ? Brand.blue : Colors.transparent,
              borderRadius: BorderRadius.circular(7),
              border: Border.all(color: isDone ? Brand.blue : Brand.grey2, width: 1.5),
            ),
            child: isDone ? const Icon(Icons.check_rounded, size: 14, color: Brand.bgVoid) : null,
          ),
        ]),
      ),
    );
  }
}
