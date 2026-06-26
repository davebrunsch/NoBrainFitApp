import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/services/ai/ai_provider.dart';
import 'package:no_brain_fit/services/ai/ai_service.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/widgets/result_scaffold.dart';

class RagTrainResultScreen extends ConsumerStatefulWidget {
  const RagTrainResultScreen({
    super.key,
    required this.goal,
    required this.duration,
    required this.equipment,
  });

  final String goal;
  final String duration;
  final String equipment;

  @override
  ConsumerState<RagTrainResultScreen> createState() => _RagTrainResultScreenState();
}

class _RagTrainResultScreenState extends ConsumerState<RagTrainResultScreen> {
  final Set<int> _done = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(ragWorkoutProvider.notifier).generate(
        goal: widget.goal,
        duration: widget.duration,
        equipment: widget.equipment,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final workoutAsync = ref.watch(ragWorkoutProvider);

    return workoutAsync.when(
      loading: () => _shell(
        title: 'Génération…',
        sub: '${widget.goal} · ${widget.duration}',
        child: _LoadingCard(goal: widget.goal, equipment: widget.equipment),
      ),
      error: (e, _) => _shell(
        title: 'Erreur',
        sub: '${widget.goal} · ${widget.duration}',
        child: _ErrorCard(message: e.toString()),
      ),
      data: (plan) {
        if (plan == null) {
          return _shell(
            title: 'Prêt.',
            sub: '${widget.goal} · ${widget.duration}',
            child: _LoadingCard(goal: widget.goal, equipment: widget.equipment),
          );
        }
        return _shell(
          title: plan.title,
          sub: '${plan.exercises.length} exercices · ${widget.equipment}',
          child: _ExerciseCard(
            exercises: plan.exercises,
            done: _done,
            goal: widget.goal,
            onToggle: (i) => setState(() {
              _done.contains(i) ? _done.remove(i) : _done.add(i);
            }),
          ),
        );
      },
    );
  }

  Widget _shell({required String title, required String sub, required Widget child}) {
    return ResultScaffold(
      accent: Brand.blue,
      kicker: 'Training · Programme IA',
      title: title,
      sub: sub,
      onHome: () => context.go('/'),
      primaryLabel: '▶  Démarrer',
      onPrimary: () {},
      children: [child],
    );
  }
}

// ── Loading ───────────────────────────────────────────────────────────────────

class _LoadingCard extends StatelessWidget {
  const _LoadingCard({required this.goal, required this.equipment});
  final String goal, equipment;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Brand.s24),
      decoration: BoxDecoration(
        color: Brand.bgCard,
        borderRadius: BorderRadius.circular(Brand.rCard),
        border: Border.all(color: Brand.border),
      ),
      child: Column(
        children: [
          const CircularProgressIndicator(color: Brand.blue, strokeWidth: 2),
          const SizedBox(height: Brand.s16),
          const Text(
            'Sélection des exercices…',
            style: TextStyle(fontSize: 13, color: Brand.grey1),
          ),
          const SizedBox(height: Brand.s8),
          Text(
            '$goal · $equipment',
            style: const TextStyle(fontSize: 11, color: Brand.grey2),
          ),
        ],
      ),
    );
  }
}

// ── Error ─────────────────────────────────────────────────────────────────────

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
            Text(
              'Erreur de génération',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.orange),
            ),
          ]),
          const SizedBox(height: Brand.s8),
          Text(message, style: const TextStyle(fontSize: 12, color: Brand.grey1)),
          const SizedBox(height: Brand.s12),
          const Text(
            'Vérifie que ton backend IA est actif dans les Paramètres.',
            style: TextStyle(fontSize: 12, color: Brand.grey2),
          ),
        ],
      ),
    );
  }
}

// ── Exercise card ─────────────────────────────────────────────────────────────

class _ExerciseCard extends StatelessWidget {
  const _ExerciseCard({
    required this.exercises,
    required this.done,
    required this.goal,
    required this.onToggle,
  });
  final List<Exercise> exercises;
  final Set<int> done;
  final String goal;
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
          // Header row
          Row(children: [
            const Text(
              'Ta séance',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.white),
            ),
            const SizedBox(width: Brand.s8),
            _GoalBadge(goal: goal),
            const Spacer(),
            _ProgressBadge(done: done.length, total: exercises.length),
          ]),
          const SizedBox(height: Brand.s8),
          ...List.generate(
            exercises.length,
            (i) => _ExerciseRow(
              index: i + 1,
              exercise: exercises[i],
              isDone: done.contains(i),
              onToggle: () => onToggle(i),
            ),
          ),
          const SizedBox(height: Brand.s12),
          // RAG source disclaimer
          Row(children: const [
            Icon(Icons.verified_outlined, size: 12, color: Brand.grey2),
            SizedBox(width: 5),
            Text(
              'Exercices issus de la base API Fitness',
              style: TextStyle(fontSize: 11, color: Brand.grey2),
            ),
          ]),
        ],
      ),
    );
  }
}

class _GoalBadge extends StatelessWidget {
  const _GoalBadge({required this.goal});
  final String goal;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: Brand.blue.withOpacity(.10),
        borderRadius: BorderRadius.circular(Brand.rTag),
        border: Border.all(color: Brand.blue.withOpacity(.20)),
      ),
      child: Text(
        goal,
        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Brand.blue, letterSpacing: .04),
      ),
    );
  }
}

class _ProgressBadge extends StatelessWidget {
  const _ProgressBadge({required this.done, required this.total});
  final int done, total;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: Brand.blue.withOpacity(.12),
        borderRadius: BorderRadius.circular(Brand.rChip),
        border: Border.all(color: Brand.blue.withOpacity(.25)),
      ),
      child: Text(
        '$done / $total',
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Brand.blue, letterSpacing: .04),
      ),
    );
  }
}

class _ExerciseRow extends StatelessWidget {
  const _ExerciseRow({
    required this.index,
    required this.exercise,
    required this.isDone,
    required this.onToggle,
  });
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
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Brand.blue),
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
