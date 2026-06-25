import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/widgets/result_scaffold.dart';

class TrainResultScreen extends StatefulWidget {
  const TrainResultScreen({super.key, required this.duration, required this.location});
  final String duration, location;

  @override
  State<TrainResultScreen> createState() => _TrainResultScreenState();
}

class _TrainResultScreenState extends State<TrainResultScreen> {
  static const _exercises = [
    _Ex('Pompes',        '3 × 12 reps · 60 s repos'),
    _Ex('Squats sautés', '3 × 15 reps · 45 s repos'),
    _Ex('Gainage',       '3 × 40 secondes'),
    _Ex('Burpees',       '2 × 10 reps · 60 s repos'),
  ];
  final Set<int> _done = {};

  @override
  Widget build(BuildContext context) {
    return ResultScaffold(
      accent: Brand.blue,
      kicker: 'Training · Généré pour toi',
      title: 'Full Body · ${widget.duration}',
      sub: '${_exercises.length} exercices · ${widget.location}',
      onHome: () => context.go('/'),
      primaryLabel: '▶  Démarrer',
      onPrimary: () {},
      children: [
        Container(
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
                    '${_done.length} / ${_exercises.length}',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Brand.blue, letterSpacing: .04),
                  ),
                ),
              ]),
              const SizedBox(height: Brand.s8),
              ...List.generate(_exercises.length, (i) => _ExerciseRow(
                index: i + 1,
                ex: _exercises[i],
                done: _done.contains(i),
                onToggle: () => setState(() { _done.contains(i) ? _done.remove(i) : _done.add(i); }),
              )),
            ],
          ),
        ),
      ],
    );
  }
}

class _ExerciseRow extends StatelessWidget {
  const _ExerciseRow({required this.index, required this.ex, required this.done, required this.onToggle});
  final int index;
  final _Ex ex;
  final bool done;
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
                ex.name,
                style: TextStyle(
                  fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: -.2,
                  color: done ? Brand.grey2 : Brand.white,
                  decoration: done ? TextDecoration.lineThrough : null,
                  decorationColor: Brand.grey2,
                ),
              ),
              const SizedBox(height: 2),
              Text(ex.detail, style: const TextStyle(fontSize: 11, color: Brand.grey2)),
            ]),
          ),
          AnimatedContainer(
            duration: const Duration(milliseconds: 140),
            width: 22, height: 22,
            decoration: BoxDecoration(
              color: done ? Brand.blue : Colors.transparent,
              borderRadius: BorderRadius.circular(7),
              border: Border.all(color: done ? Brand.blue : Brand.grey2, width: 1.5),
            ),
            child: done ? const Icon(Icons.check_rounded, size: 14, color: Brand.bgVoid) : null,
          ),
        ]),
      ),
    );
  }
}

class _Ex {
  const _Ex(this.name, this.detail);
  final String name, detail;
}
