import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class TrainResultScreen extends StatefulWidget {
  final String duration;
  final String location;

  const TrainResultScreen({
    super.key,
    required this.duration,
    required this.location,
  });

  @override
  State<TrainResultScreen> createState() => _TrainResultScreenState();
}

class _TrainResultScreenState extends State<TrainResultScreen> {
  static const _color = Color(0xFF2980B9);

  final List<_Exercise> _exercises = const [
    _Exercise(name: 'Pompes', detail: '3 séries × 12 reps · 60s repos'),
    _Exercise(name: 'Squats sautés', detail: '3 séries × 15 reps · 45s repos'),
    _Exercise(name: 'Gainage', detail: '3 séries × 40 secondes'),
    _Exercise(name: 'Burpees', detail: '2 séries × 10 reps · 60s repos'),
  ];

  final Set<int> _done = {};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => context.go('/'),
                    child: Container(
                      width: 38, height: 38,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.home_outlined, color: Colors.white, size: 20),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text(widget.location == 'Maison' ? '🏠' : widget.location == 'Salle' ? '🏋️' : widget.location == 'Dehors' ? '🌳' : '🚴',
                style: const TextStyle(fontSize: 56)),
            const SizedBox(height: 10),
            Text('Full Body · ${widget.duration}',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800, color: Colors.white)),
            Text('${_exercises.length} exercices · ${widget.location}',
                style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 24),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text('Ta séance', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              color: _color.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text('${_done.length} / ${_exercises.length}',
                                style: TextStyle(fontSize: 11, color: _color, fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ...List.generate(_exercises.length, (i) {
                        final ex = _exercises[i];
                        final done = _done.contains(i);
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Row(
                            children: [
                              Container(
                                width: 28, height: 28,
                                decoration: BoxDecoration(
                                  color: _color.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Center(
                                  child: Text('${i + 1}',
                                      style: TextStyle(
                                          color: _color,
                                          fontWeight: FontWeight.w700,
                                          fontSize: 12)),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(ex.name,
                                        style: TextStyle(
                                          fontWeight: FontWeight.w600,
                                          color: done ? Colors.grey : Colors.white,
                                          decoration: done ? TextDecoration.lineThrough : null,
                                        )),
                                    Text(ex.detail, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                                  ],
                                ),
                              ),
                              GestureDetector(
                                onTap: () => setState(() {
                                  if (done) _done.remove(i); else _done.add(i);
                                }),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 150),
                                  width: 28, height: 28,
                                  decoration: BoxDecoration(
                                    color: done ? _color : Colors.transparent,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                        color: done ? _color : Colors.white24, width: 1.5),
                                  ),
                                  child: done
                                      ? const Icon(Icons.check, size: 16, color: Colors.white)
                                      : null,
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => context.go('/'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: Colors.white24),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Text('Accueil', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _color,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Text('▶ Démarrer',
                          style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Exercise {
  final String name, detail;
  const _Exercise({required this.name, required this.detail});
}
