import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/services/ai/ai_service.dart';
import 'package:no_brain_fit/services/library/library_models.dart';
import 'package:no_brain_fit/services/library/library_service.dart';
import 'package:no_brain_fit/services/library/training_prefs.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/utils/workout_parse.dart';
import 'package:no_brain_fit/widgets/exercise_detail_sheet.dart';

/// Full-screen guided workout: one exercise at a time, set-by-set, with a
/// counted-down rest timer between sets and a summary at the end.
class ActiveWorkoutScreen extends StatefulWidget {
  const ActiveWorkoutScreen({
    super.key,
    required this.plan,
    this.accent = Brand.blue,
    this.workoutType = 'Séance',
  });

  final WorkoutPlan plan;
  final Color accent;
  final String workoutType;

  @override
  State<ActiveWorkoutScreen> createState() => _ActiveWorkoutScreenState();
}

class _ActiveWorkoutScreenState extends State<ActiveWorkoutScreen> {
  late final List<_SetPlan> _items = widget.plan.exercises.map(_SetPlan.new).toList();
  late final int _totalSets = _items.fold(0, (sum, e) => sum + e.sets);
  final DateTime _startedAt = DateTime.now();
  final LibraryService _library = LibraryService();

  TrainingPrefs _prefs = TrainingPrefs.defaults;
  int _exIndex = 0;
  int _setNumber = 1;
  int _completedSets = 0;
  bool _resting = false;
  int _restRemaining = 0;
  int _restTotal = 0;
  bool _finished = false;
  Duration _elapsed = Duration.zero;
  Timer? _timer;

  _SetPlan get _current => _items[_exIndex];
  bool get _isLastExercise => _exIndex >= _items.length - 1;
  bool get _isLastSet => _setNumber >= _current.sets;

  int _restSecFor(_SetPlan e) => e.restSec ?? _prefs.defaultRestSec;

  @override
  void initState() {
    super.initState();
    _loadPrefs();
    if (_items.isEmpty) _finish();
  }

  Future<void> _loadPrefs() async {
    final p = await TrainingPrefs.load();
    if (mounted) setState(() => _prefs = p);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _onSetDone() {
    if (_prefs.vibrate) HapticFeedback.mediumImpact();
    setState(() => _completedSets++);
    if (_isLastSet && _isLastExercise) {
      _finish();
      return;
    }
    _startRest(_restSecFor(_current));
  }

  void _startRest(int seconds) {
    _timer?.cancel();
    if (seconds <= 0) {
      _advance();
      return;
    }
    setState(() {
      _resting = true;
      _restRemaining = seconds;
      _restTotal = seconds;
    });
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_restRemaining <= 1) {
        t.cancel();
        _notifyRestEnd();
        _advance();
      } else {
        setState(() => _restRemaining--);
      }
    });
  }

  void _notifyRestEnd() {
    if (_prefs.vibrate) HapticFeedback.mediumImpact();
    if (_prefs.sound) SystemSound.play(SystemSoundType.alert);
  }

  void _advance() {
    _timer?.cancel();
    setState(() {
      _resting = false;
      if (_setNumber < _current.sets) {
        _setNumber++;
      } else {
        _exIndex++;
        _setNumber = 1;
      }
    });
  }

  void _addRest() => setState(() => _restRemaining += 15);

  void _skipExercise() {
    _timer?.cancel();
    if (_isLastExercise) {
      _finish();
      return;
    }
    setState(() {
      _resting = false;
      _exIndex++;
      _setNumber = 1;
    });
  }

  void _finish() {
    _timer?.cancel();
    final elapsed = DateTime.now().difference(_startedAt);
    setState(() {
      _finished = true;
      _resting = false;
      _elapsed = elapsed;
    });
    if (_completedSets > 0) {
      _library.addHistory(WorkoutHistoryEntry(
        id: DateTime.now().microsecondsSinceEpoch.toString(),
        title: widget.plan.title,
        type: widget.workoutType,
        date: DateTime.now(),
        durationSec: elapsed.inSeconds,
        exercisesCount: _items.length,
        setsCompleted: _completedSets,
      ));
    }
  }

  Future<void> _confirmQuit() async {
    final quit = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Brand.bgCard,
        title: const Text('Quitter la séance ?', style: TextStyle(color: Brand.white, fontSize: 16)),
        content: const Text('Ta progression ne sera pas enregistrée.', style: TextStyle(color: Brand.grey1, fontSize: 13)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Continuer', style: TextStyle(color: Brand.grey1))),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Quitter', style: TextStyle(color: Brand.orange))),
        ],
      ),
    );
    if (quit == true && mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: _finished,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _confirmQuit();
      },
      child: Scaffold(
        backgroundColor: Brand.bgVoid,
        body: SafeArea(
          child: _finished
              ? _SummaryView(
                  accent: widget.accent,
                  exercises: _items.length,
                  sets: _completedSets,
                  elapsed: _elapsed,
                  onHome: () => context.go('/'),
                )
              : Column(
                  children: [
                    _TopBar(
                      title: widget.plan.title,
                      progress: _totalSets == 0 ? 0 : _completedSets / _totalSets,
                      label: 'Exercice ${_exIndex + 1} / ${_items.length}',
                      accent: widget.accent,
                      onClose: _confirmQuit,
                    ),
                    Expanded(child: _resting ? _buildRest() : _buildActiveSet()),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildActiveSet() {
    final ex = _current;
    return Padding(
      padding: const EdgeInsets.all(Brand.s20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Spacer(),
          Text('SÉRIE $_setNumber / ${ex.sets}',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: .18, color: widget.accent)),
          const SizedBox(height: Brand.s8),
          GestureDetector(
            onTap: () => showExerciseDetailSheet(context, ex.exercise, accent: widget.accent),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Expanded(
                child: Text(ex.name,
                    style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w700, letterSpacing: -1, color: Brand.white)),
              ),
              const SizedBox(width: Brand.s8),
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Icon(Icons.info_outline_rounded, size: 20, color: widget.accent),
              ),
            ]),
          ),
          const SizedBox(height: Brand.s16),
          Row(children: [
            if (ex.reps.isNotEmpty) _Pill(label: '${ex.reps} reps', accent: widget.accent),
            if (ex.reps.isNotEmpty) const SizedBox(width: Brand.s8),
            _Pill(label: '${_restSecFor(ex)}s repos', accent: widget.accent),
          ]),
          const SizedBox(height: Brand.s12),
          Text(ex.detail, style: const TextStyle(fontSize: 13, color: Brand.grey1)),
          const Spacer(flex: 2),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _onSetDone,
              style: ElevatedButton.styleFrom(
                backgroundColor: widget.accent,
                foregroundColor: Brand.bgVoid,
                padding: const EdgeInsets.symmetric(vertical: 18),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rButton)),
              ),
              child: Text(_isLastSet && _isLastExercise ? 'Terminer la séance' : 'Série terminée',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            ),
          ),
          const SizedBox(height: Brand.s8),
          Center(
            child: TextButton(
              onPressed: _skipExercise,
              child: const Text('Passer l\'exercice', style: TextStyle(fontSize: 13, color: Brand.grey2)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRest() {
    final nextLabel = _setNumber < _current.sets
        ? 'Série ${_setNumber + 1} · ${_current.name}'
        : (_isLastExercise ? 'Fin de séance' : _items[_exIndex + 1].name);
    return Padding(
      padding: const EdgeInsets.all(Brand.s20),
      child: Column(
        children: [
          const Spacer(),
          Text('REPOS',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: .2, color: widget.accent)),
          const SizedBox(height: Brand.s24),
          SizedBox(
            width: 200,
            height: 200,
            child: Stack(alignment: Alignment.center, children: [
              SizedBox(
                width: 200,
                height: 200,
                child: CircularProgressIndicator(
                  value: _restTotal == 0 ? 0 : _restRemaining / _restTotal,
                  strokeWidth: 6,
                  backgroundColor: Brand.bgCard,
                  valueColor: AlwaysStoppedAnimation(widget.accent),
                ),
              ),
              Text('$_restRemaining', style: Brand.mono(size: 64, weight: FontWeight.w700, color: Brand.white)),
            ]),
          ),
          const SizedBox(height: Brand.s24),
          Text('À suivre : $nextLabel', style: const TextStyle(fontSize: 13, color: Brand.grey1)),
          const Spacer(flex: 2),
          Row(children: [
            Expanded(
              child: OutlinedButton(onPressed: _addRest, child: const Text('+15 s')),
            ),
            const SizedBox(width: Brand.s12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: _advance,
                style: ElevatedButton.styleFrom(
                  backgroundColor: widget.accent,
                  foregroundColor: Brand.bgVoid,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rButton)),
                ),
                child: const Text('Passer le repos', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
              ),
            ),
          ]),
        ],
      ),
    );
  }
}

// ── Parsed exercise ──────────────────────────────────────────────────────────

class _SetPlan {
  _SetPlan(this.exercise) : _info = WorkoutSetInfo.parse(exercise.detail);

  final Exercise exercise;
  final WorkoutSetInfo _info;

  String get name => exercise.name;
  String get detail => exercise.detail;
  int get sets => _info.sets;
  String get reps => _info.reps;
  int? get restSec => _info.restSec;
}

// ── Sub-widgets ──────────────────────────────────────────────────────────────

class _TopBar extends StatelessWidget {
  const _TopBar({required this.title, required this.progress, required this.label, required this.accent, required this.onClose});
  final String title, label;
  final double progress;
  final Color accent;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s16, Brand.s20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: .18, color: Brand.grey2)),
                const SizedBox(height: 2),
                Text(title, maxLines: 1, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600, color: Brand.white)),
              ]),
            ),
            GestureDetector(
              onTap: onClose,
              child: Container(
                width: 38, height: 38,
                decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rButton), border: Border.all(color: Brand.border2)),
                child: const Icon(Icons.close_rounded, size: 20, color: Brand.grey1),
              ),
            ),
          ]),
          const SizedBox(height: Brand.s16),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress.clamp(0, 1),
              minHeight: 6,
              backgroundColor: Brand.bgCard,
              valueColor: AlwaysStoppedAnimation(accent),
            ),
          ),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.label, required this.accent});
  final String label;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: accent.withOpacity(.12),
        borderRadius: BorderRadius.circular(Brand.rChip),
        border: Border.all(color: accent.withOpacity(.25)),
      ),
      child: Text(label, style: Brand.mono(size: 12, weight: FontWeight.w700, color: accent)),
    );
  }
}

class _SummaryView extends StatelessWidget {
  const _SummaryView({required this.accent, required this.exercises, required this.sets, required this.elapsed, required this.onHome});
  final Color accent;
  final int exercises, sets;
  final Duration elapsed;
  final VoidCallback onHome;

  String get _time {
    final m = elapsed.inMinutes;
    final s = elapsed.inSeconds % 60;
    return '${m}m ${s.toString().padLeft(2, '0')}s';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(Brand.s20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Spacer(),
          Icon(Icons.check_circle_rounded, size: 64, color: accent),
          const SizedBox(height: Brand.s20),
          const Text('Séance terminée', textAlign: TextAlign.center,
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, letterSpacing: -1, color: Brand.white)),
          const SizedBox(height: Brand.s8),
          const Text('Beau travail. 💪', textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: Brand.grey1)),
          const SizedBox(height: Brand.s32),
          Row(children: [
            _Stat(value: '$exercises', label: 'Exercices', accent: accent),
            _Stat(value: '$sets', label: 'Séries', accent: accent),
            _Stat(value: _time, label: 'Durée', accent: accent),
          ]),
          const Spacer(flex: 2),
          ElevatedButton(
            onPressed: onHome,
            style: ElevatedButton.styleFrom(
              backgroundColor: accent,
              foregroundColor: Brand.bgVoid,
              padding: const EdgeInsets.symmetric(vertical: 18),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rButton)),
            ),
            child: const Text('Retour à l\'accueil', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.value, required this.label, required this.accent});
  final String value, label;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(vertical: Brand.s16),
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
