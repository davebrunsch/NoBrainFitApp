import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/screens/eat/log_food_screen.dart';
import 'package:no_brain_fit/screens/eat/nutrition_goal_screen.dart';
import 'package:no_brain_fit/services/nutrition/nutrition_models.dart';
import 'package:no_brain_fit/services/nutrition/nutrition_service.dart';
import 'package:no_brain_fit/utils/brand.dart';

/// The "Manger" hub: daily macro tracking vs goal-based targets.
class NutritionDashboard extends StatefulWidget {
  const NutritionDashboard({super.key});

  @override
  State<NutritionDashboard> createState() => _NutritionDashboardState();
}

class _NutritionDashboardState extends State<NutritionDashboard> {
  final NutritionService _service = NutritionService();
  bool _loading = true;
  NutritionProfile _profile = NutritionProfile.defaults;
  List<FoodEntry> _today = [];
  DayTotals _totals = DayTotals.zero;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final now = DateTime.now();
    final profile = await _service.profile();
    final today = await _service.entriesForDay(now);
    final totals = await _service.totalsForDay(now);
    if (mounted) setState(() { _profile = profile; _today = today; _totals = totals; _loading = false; });
  }

  Future<void> _openGoal() async {
    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => NutritionGoalScreen(initial: _profile)),
    );
    if (changed == true) _load();
  }

  Future<void> _openLog() async {
    final added = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const LogFoodScreen()),
    );
    if (added == true) _load();
  }

  Future<void> _delete(String id) async {
    await _service.remove(id);
    _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(backgroundColor: Brand.bgVoid, body: Center(child: CircularProgressIndicator(color: Brand.lime, strokeWidth: 2)));
    }
    return Scaffold(
      backgroundColor: Brand.bgVoid,
      body: SafeArea(
        child: Column(children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s16, Brand.s20, 0),
            child: Row(children: [
              GestureDetector(
                onTap: () => context.go('/'),
                child: Container(
                  width: 38, height: 38,
                  decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rButton), border: Border.all(color: Brand.border2)),
                  child: const Icon(Icons.home_outlined, size: 18, color: Brand.grey1),
                ),
              ),
              const SizedBox(width: Brand.s12),
              const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('NUTRITION', style: Brand.labelMono),
                Text('Aujourd\'hui', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w600, letterSpacing: -.3, color: Brand.white)),
              ]),
              const Spacer(),
              GestureDetector(
                onTap: _openGoal,
                child: Container(
                  width: 38, height: 38,
                  decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rButton), border: Border.all(color: Brand.border2)),
                  child: const Icon(Icons.tune_rounded, size: 18, color: Brand.grey1),
                ),
              ),
            ]),
          ),
          Expanded(child: _profile.isSet ? _buildDashboard() : _buildSetup()),
        ]),
      ),
      floatingActionButton: _profile.isSet
          ? FloatingActionButton.extended(
              onPressed: _openLog,
              backgroundColor: Brand.lime,
              foregroundColor: Brand.bgVoid,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Ajouter', style: TextStyle(fontWeight: FontWeight.w700)),
            )
          : null,
    );
  }

  Widget _buildSetup() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(Brand.s24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.flag_outlined, size: 44, color: Brand.titane),
          const SizedBox(height: Brand.s16),
          const Text('Définis ton objectif', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Brand.white)),
          const SizedBox(height: Brand.s8),
          const Text('Choisis un objectif et ton poids pour calculer tes cibles de calories et de macros.',
              textAlign: TextAlign.center, style: TextStyle(fontSize: 13, color: Brand.grey2, height: 1.5)),
          const SizedBox(height: Brand.s20),
          ElevatedButton(
            onPressed: _openGoal,
            style: ElevatedButton.styleFrom(
              backgroundColor: Brand.lime,
              foregroundColor: Brand.bgVoid,
              padding: const EdgeInsets.symmetric(horizontal: Brand.s24, vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rButton)),
            ),
            child: const Text('Configurer', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          ),
        ]),
      ),
    );
  }

  Widget _buildDashboard() {
    final t = _profile.targets;
    final kcalLeft = t.kcal - _totals.kcal;
    return ListView(
      padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s20, Brand.s20, 96),
      children: [
        // Calories ring
        Container(
          padding: const EdgeInsets.all(Brand.s20),
          decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rCard), border: Border.all(color: Brand.border)),
          child: Row(children: [
            SizedBox(
              width: 110, height: 110,
              child: Stack(alignment: Alignment.center, children: [
                SizedBox(
                  width: 110, height: 110,
                  child: CircularProgressIndicator(
                    value: t.kcal == 0 ? 0 : (_totals.kcal / t.kcal).clamp(0.0, 1.0),
                    strokeWidth: 8,
                    backgroundColor: Brand.bgCardHi,
                    valueColor: const AlwaysStoppedAnimation(Brand.lime),
                  ),
                ),
                Column(mainAxisSize: MainAxisSize.min, children: [
                  Text('${_totals.kcal}', style: Brand.mono(size: 24, weight: FontWeight.w700, color: Brand.white)),
                  Text('/ ${t.kcal}', style: Brand.mono(size: 11, weight: FontWeight.w500, color: Brand.grey2)),
                ]),
              ]),
            ),
            const SizedBox(width: Brand.s20),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Calories', style: TextStyle(fontSize: 13, color: Brand.grey1)),
                const SizedBox(height: 4),
                Text(kcalLeft >= 0 ? '$kcalLeft kcal restantes' : '${-kcalLeft} kcal au-dessus',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: kcalLeft >= 0 ? Brand.white : Brand.orange)),
                const SizedBox(height: 4),
                Text('Objectif : ${_profile.goal.label}', style: const TextStyle(fontSize: 11, color: Brand.grey2)),
              ]),
            ),
          ]),
        ),
        const SizedBox(height: Brand.s12),
        // Macro bars
        Container(
          padding: const EdgeInsets.all(Brand.s16),
          decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rCard), border: Border.all(color: Brand.border)),
          child: Column(children: [
            _MacroBar(label: 'Protéines', value: _totals.proteinG, target: t.proteinG, color: Brand.lime),
            const SizedBox(height: Brand.s12),
            _MacroBar(label: 'Glucides', value: _totals.carbsG, target: t.carbsG, color: Brand.blue),
            const SizedBox(height: Brand.s12),
            _MacroBar(label: 'Lipides', value: _totals.fatG, target: t.fatG, color: Brand.orange),
          ]),
        ),
        const SizedBox(height: Brand.s20),
        Row(children: [
          const Text('Repas du jour', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.white)),
          const Spacer(),
          Text('${_today.length}', style: Brand.mono(size: 12, weight: FontWeight.w700, color: Brand.grey2)),
        ]),
        const SizedBox(height: Brand.s8),
        if (_today.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: Brand.s24),
            child: Center(child: Text('Aucun repas enregistré aujourd\'hui.', style: TextStyle(fontSize: 13, color: Brand.grey2))),
          )
        else
          ..._today.map((e) => Padding(
                padding: const EdgeInsets.only(bottom: Brand.s8),
                child: _MealCard(entry: e, onDelete: () => _delete(e.id)),
              )),
      ],
    );
  }
}

class _MacroBar extends StatelessWidget {
  const _MacroBar({required this.label, required this.value, required this.target, required this.color});
  final String label;
  final int value, target;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final ratio = target == 0 ? 0.0 : (value / target).clamp(0.0, 1.0);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Brand.grey1)),
        const Spacer(),
        Text('$value / ${target}g', style: Brand.mono(size: 11, weight: FontWeight.w700, color: color)),
      ]),
      const SizedBox(height: 6),
      ClipRRect(
        borderRadius: BorderRadius.circular(3),
        child: LinearProgressIndicator(
          value: ratio,
          minHeight: 5,
          backgroundColor: Brand.bgCardHi,
          valueColor: AlwaysStoppedAnimation(color),
        ),
      ),
    ]);
  }
}

class _MealCard extends StatelessWidget {
  const _MealCard({required this.entry, required this.onDelete});
  final FoodEntry entry;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Brand.s12),
      decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rChip), border: Border.all(color: Brand.border)),
      child: Row(children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(entry.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.white)),
            const SizedBox(height: 2),
            Text('${entry.mealType} · P ${entry.proteinG} · G ${entry.carbsG} · L ${entry.fatG}',
                style: const TextStyle(fontSize: 11, color: Brand.grey2)),
          ]),
        ),
        const SizedBox(width: Brand.s8),
        Text('${entry.kcal} kcal', style: Brand.mono(size: 12, weight: FontWeight.w700, color: Brand.lime)),
        const SizedBox(width: Brand.s8),
        GestureDetector(onTap: onDelete, child: const Icon(Icons.close_rounded, size: 16, color: Brand.grey2)),
      ]),
    );
  }
}
