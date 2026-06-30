import 'package:flutter/material.dart';
import 'package:no_brain_fit/services/ai/ai_service.dart';
import 'package:no_brain_fit/services/library/library_models.dart';
import 'package:no_brain_fit/services/library/library_service.dart';
import 'package:no_brain_fit/utils/brand.dart';

/// Pill button that saves a generated [WorkoutPlan] to the local favorites.
class SaveWorkoutButton extends StatefulWidget {
  const SaveWorkoutButton({super.key, required this.plan, required this.type, this.accent = Brand.blue});

  final WorkoutPlan plan;
  final String type;
  final Color accent;

  @override
  State<SaveWorkoutButton> createState() => _SaveWorkoutButtonState();
}

class _SaveWorkoutButtonState extends State<SaveWorkoutButton> {
  bool _saved = false;

  Future<void> _save() async {
    await LibraryService().save(SavedWorkout.fromPlan(widget.plan, type: widget.type));
    if (!mounted) return;
    setState(() => _saved = true);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: const Text('Programme enregistré'),
      backgroundColor: Brand.bgCard,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rChip)),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _saved ? null : _save,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
        decoration: BoxDecoration(
          color: _saved ? widget.accent.withOpacity(.12) : Brand.bgCard,
          borderRadius: BorderRadius.circular(Brand.rButton),
          border: Border.all(color: _saved ? widget.accent.withOpacity(.4) : Brand.border2),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(_saved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
              size: 16, color: _saved ? widget.accent : Brand.grey1),
          const SizedBox(width: 6),
          Text(_saved ? 'Enregistré' : 'Enregistrer',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _saved ? widget.accent : Brand.grey1)),
        ]),
      ),
    );
  }
}
