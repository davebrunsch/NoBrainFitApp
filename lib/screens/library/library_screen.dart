import 'package:flutter/material.dart';
import 'package:no_brain_fit/screens/train/active_workout_screen.dart';
import 'package:no_brain_fit/services/library/library_models.dart';
import 'package:no_brain_fit/services/library/library_service.dart';
import 'package:no_brain_fit/utils/brand.dart';

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({super.key});

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  final LibraryService _service = LibraryService();
  int _tab = 0;
  bool _loading = true;
  List<WorkoutHistoryEntry> _history = [];
  List<SavedWorkout> _saved = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final h = await _service.history();
    final s = await _service.saved();
    if (mounted) setState(() { _history = h; _saved = s; _loading = false; });
  }

  static String _two(int n) => n.toString().padLeft(2, '0');
  static String _fmtDate(DateTime d) => '${_two(d.day)}/${_two(d.month)} · ${_two(d.hour)}:${_two(d.minute)}';
  static String _fmtDur(int sec) => '${sec ~/ 60}m ${_two(sec % 60)}s';

  Future<void> _clearHistory() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Brand.bgCard,
        title: const Text('Effacer l\'historique ?', style: TextStyle(color: Brand.white, fontSize: 16)),
        content: const Text('Toutes les séances enregistrées seront supprimées.', style: TextStyle(color: Brand.grey1, fontSize: 13)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler', style: TextStyle(color: Brand.grey1))),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Effacer', style: TextStyle(color: Brand.orange))),
        ],
      ),
    );
    if (ok == true) {
      await _service.clearHistory();
      await _load();
    }
  }

  void _redo(SavedWorkout w) {
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => ActiveWorkoutScreen(plan: w.toPlan(), accent: Brand.blue, workoutType: w.type),
    ));
  }

  Future<void> _deleteSaved(SavedWorkout w) async {
    await _service.removeSaved(w.id);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Brand.bgVoid,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s16, Brand.s20, 0),
              child: Row(children: [
                GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: Container(
                    width: 38, height: 38,
                    decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rButton), border: Border.all(color: Brand.border2)),
                    child: const Icon(Icons.arrow_back_rounded, size: 20, color: Brand.white),
                  ),
                ),
                const SizedBox(width: Brand.s12),
                const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('BIBLIOTHÈQUE', style: Brand.labelMono),
                  Text('Tes séances', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w600, letterSpacing: -.3, color: Brand.white)),
                ]),
                const Spacer(),
                if (_tab == 0 && _history.isNotEmpty)
                  GestureDetector(
                    onTap: _clearHistory,
                    child: const Icon(Icons.delete_outline_rounded, size: 20, color: Brand.grey2),
                  ),
              ]),
            ),
            const SizedBox(height: Brand.s20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: Brand.s20),
              child: Row(children: [
                _TabBtn(label: 'Historique', selected: _tab == 0, onTap: () => setState(() => _tab = 0)),
                const SizedBox(width: Brand.s8),
                _TabBtn(label: 'Favoris', selected: _tab == 1, onTap: () => setState(() => _tab = 1)),
              ]),
            ),
            const SizedBox(height: Brand.s16),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator(color: Brand.blue, strokeWidth: 2))
                  : (_tab == 0 ? _buildHistory() : _buildSaved()),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistory() {
    if (_history.isEmpty) {
      return const _Empty(icon: Icons.history_rounded, text: 'Aucune séance terminée pour l\'instant.\nTermine une séance pour la voir ici.');
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(Brand.s20, 0, Brand.s20, Brand.s20),
      itemCount: _history.length,
      separatorBuilder: (_, __) => const SizedBox(height: Brand.s8),
      itemBuilder: (_, i) {
        final h = _history[i];
        return Container(
          padding: const EdgeInsets.all(Brand.s16),
          decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rCard), border: Border.all(color: Brand.border)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text(h.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Brand.white))),
              Text(_fmtDate(h.date), style: Brand.mono(size: 11, weight: FontWeight.w500, color: Brand.grey2)),
            ]),
            const SizedBox(height: 6),
            Text('${h.type} · ${h.exercisesCount} exercices · ${h.setsCompleted} séries · ${_fmtDur(h.durationSec)}',
                style: const TextStyle(fontSize: 12, color: Brand.grey1)),
          ]),
        );
      },
    );
  }

  Widget _buildSaved() {
    if (_saved.isEmpty) {
      return const _Empty(icon: Icons.bookmark_border_rounded, text: 'Aucun favori enregistré.\nEnregistre un programme depuis l\'écran de résultat.');
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(Brand.s20, 0, Brand.s20, Brand.s20),
      itemCount: _saved.length,
      separatorBuilder: (_, __) => const SizedBox(height: Brand.s8),
      itemBuilder: (_, i) {
        final w = _saved[i];
        return Container(
          padding: const EdgeInsets.all(Brand.s16),
          decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rCard), border: Border.all(color: Brand.border)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text(w.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Brand.white))),
              GestureDetector(
                onTap: () => _deleteSaved(w),
                child: const Icon(Icons.delete_outline_rounded, size: 18, color: Brand.grey2),
              ),
            ]),
            const SizedBox(height: 4),
            Text('${w.type} · ${w.exercises.length} exercices', style: const TextStyle(fontSize: 12, color: Brand.grey1)),
            const SizedBox(height: Brand.s12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _redo(w),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Brand.blue,
                  foregroundColor: Brand.bgVoid,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rButton)),
                ),
                child: const Text('▶  Refaire', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
              ),
            ),
          ]),
        );
      },
    );
  }
}

class _TabBtn extends StatelessWidget {
  const _TabBtn({required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: Brand.s12),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: selected ? Brand.blue.withOpacity(.1) : Brand.bgCard,
            borderRadius: BorderRadius.circular(Brand.rChip),
            border: Border.all(color: selected ? Brand.blue : Brand.border, width: selected ? 1.5 : 1),
          ),
          child: Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: selected ? Brand.blue : Brand.grey1)),
        ),
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty({required this.icon, required this.text});
  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(Brand.s32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 40, color: Brand.grey3),
          const SizedBox(height: Brand.s16),
          Text(text, textAlign: TextAlign.center, style: const TextStyle(fontSize: 13, color: Brand.grey2, height: 1.5)),
        ]),
      ),
    );
  }
}
