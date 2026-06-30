import 'package:flutter/material.dart';
import 'package:no_brain_fit/services/nutrition/nutrition_models.dart';
import 'package:no_brain_fit/services/nutrition/nutrition_service.dart';
import 'package:no_brain_fit/utils/brand.dart';

/// Goal + weight setup → derives the daily kcal & macro targets.
class NutritionGoalScreen extends StatefulWidget {
  const NutritionGoalScreen({super.key, required this.initial});
  final NutritionProfile initial;

  @override
  State<NutritionGoalScreen> createState() => _NutritionGoalScreenState();
}

class _NutritionGoalScreenState extends State<NutritionGoalScreen> {
  late NutritionGoal _goal = widget.initial.goal;
  late final TextEditingController _weightCtrl =
      TextEditingController(text: widget.initial.weightKg.toStringAsFixed(0));
  bool _saving = false;

  @override
  void dispose() {
    _weightCtrl.dispose();
    super.dispose();
  }

  double get _weight {
    final v = double.tryParse(_weightCtrl.text.replaceAll(',', '.'));
    return (v == null || v <= 0) ? widget.initial.weightKg : v;
  }

  NutritionProfile get _preview => NutritionProfile(goal: _goal, weightKg: _weight, isSet: true);

  Future<void> _save() async {
    setState(() => _saving = true);
    await NutritionService().saveProfile(_preview);
    if (mounted) Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    final t = _preview.targets;
    return Scaffold(
      backgroundColor: Brand.bgVoid,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s16, Brand.s20, 0),
              child: Row(children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 38, height: 38,
                    decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rButton), border: Border.all(color: Brand.border2)),
                    child: const Icon(Icons.arrow_back_rounded, size: 20, color: Brand.white),
                  ),
                ),
                const SizedBox(width: Brand.s12),
                const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('NUTRITION', style: Brand.labelMono),
                  Text('Ton objectif', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w600, letterSpacing: -.3, color: Brand.white)),
                ]),
              ]),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s24, Brand.s20, Brand.s20),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('OBJECTIF', style: Brand.labelMono),
                  const SizedBox(height: Brand.s8),
                  ...NutritionGoal.values.map((g) => Padding(
                        padding: const EdgeInsets.only(bottom: Brand.s8),
                        child: _GoalTile(goal: g, selected: _goal == g, onTap: () => setState(() => _goal = g)),
                      )),
                  const SizedBox(height: Brand.s16),
                  const Text('POIDS (KG)', style: Brand.labelMono),
                  const SizedBox(height: Brand.s8),
                  TextField(
                    controller: _weightCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    onChanged: (_) => setState(() {}),
                    style: const TextStyle(fontSize: 15, color: Brand.white, fontFamily: 'SpaceGrotesk'),
                    decoration: InputDecoration(
                      hintText: '70',
                      hintStyle: const TextStyle(color: Brand.grey2),
                      prefixIcon: const Icon(Icons.monitor_weight_outlined, size: 18, color: Brand.grey2),
                      filled: true,
                      fillColor: Brand.bgCard,
                      contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(Brand.rChip), borderSide: BorderSide(color: Brand.border)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Brand.rChip), borderSide: BorderSide(color: Brand.border)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Brand.rChip), borderSide: const BorderSide(color: Brand.lime, width: 1.5)),
                    ),
                  ),
                  const SizedBox(height: Brand.s24),
                  const Text('TES CIBLES JOURNALIÈRES', style: Brand.labelMono),
                  const SizedBox(height: Brand.s8),
                  Container(
                    padding: const EdgeInsets.all(Brand.s16),
                    decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rCard), border: Border.all(color: Brand.border)),
                    child: Column(children: [
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        const Text('Calories', style: TextStyle(fontSize: 13, color: Brand.grey1)),
                        Text('${t.kcal} kcal', style: Brand.mono(size: 15, weight: FontWeight.w700, color: Brand.lime)),
                      ]),
                      const SizedBox(height: Brand.s12),
                      Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                        _TargetMacro(value: t.proteinG, label: 'PROT.', color: Brand.lime),
                        _TargetMacro(value: t.carbsG, label: 'GLUC.', color: Brand.blue),
                        _TargetMacro(value: t.fatG, label: 'LIP.', color: Brand.orange),
                      ]),
                    ]),
                  ),
                ]),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(Brand.s20, 0, Brand.s20, Brand.s20),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _saving ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Brand.lime,
                    foregroundColor: Brand.bgVoid,
                    padding: const EdgeInsets.symmetric(vertical: Brand.s16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rButton)),
                  ),
                  child: _saving
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Brand.bgVoid))
                      : const Text('Valider', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GoalTile extends StatelessWidget {
  const _GoalTile({required this.goal, required this.selected, required this.onTap});
  final NutritionGoal goal;
  final bool selected;
  final VoidCallback onTap;

  IconData get _icon => switch (goal) {
        NutritionGoal.lose => Icons.trending_down_rounded,
        NutritionGoal.maintain => Icons.trending_flat_rounded,
        NutritionGoal.gain => Icons.trending_up_rounded,
      };

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: Brand.s16, vertical: Brand.s16),
        decoration: BoxDecoration(
          color: selected ? Brand.lime.withOpacity(.1) : Brand.bgCard,
          borderRadius: BorderRadius.circular(Brand.rCard),
          border: Border.all(color: selected ? Brand.lime : Brand.border, width: selected ? 1.5 : 1),
        ),
        child: Row(children: [
          Icon(_icon, size: 22, color: selected ? Brand.lime : Brand.grey2),
          const SizedBox(width: Brand.s12),
          Text(goal.label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: selected ? Brand.lime : Brand.grey1)),
          const Spacer(),
          if (selected) const Icon(Icons.check_circle_rounded, size: 18, color: Brand.lime),
        ]),
      ),
    );
  }
}

class _TargetMacro extends StatelessWidget {
  const _TargetMacro({required this.value, required this.label, required this.color});
  final int value;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text('${value}g', style: Brand.mono(size: 18, weight: FontWeight.w700, color: color)),
      const SizedBox(height: 3),
      Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: .12, color: Brand.grey2)),
    ]);
  }
}
