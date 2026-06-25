import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/services/ai/ai_provider.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/widgets/result_scaffold.dart';

class EatResultScreen extends ConsumerStatefulWidget {
  const EatResultScreen({super.key, required this.mealType, required this.mealSize});
  final String mealType, mealSize;

  @override
  ConsumerState<EatResultScreen> createState() => _EatResultScreenState();
}

class _EatResultScreenState extends ConsumerState<EatResultScreen> {
  int get _kcal => switch (widget.mealSize) {
    'Léger'   => 350,
    'Normal'  => 600,
    'Copieux' => 900,
    _         => 500,
  };

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(nutritionTipProvider.notifier).generate(
        mealType: widget.mealType,
        mealSize: widget.mealSize,
        totalKcal: _kcal,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final tipAsync = ref.watch(nutritionTipProvider);
    final totalKcal = _kcal;
    final filled = (totalKcal / 2000).clamp(0.0, 1.0);

    return ResultScaffold(
      accent: Brand.lime,
      kicker: 'Nutrition · Enregistré',
      title: 'Repas loggé.',
      sub: '${widget.mealType} · ~$totalKcal kcal',
      onHome: () => context.go('/'),
      primaryLabel: 'Ajouter un aliment',
      onPrimary: () {},
      children: [
        _BrandCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                const Text('Bilan du jour', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.white)),
                const Spacer(),
                _NeonBadge('$totalKcal / 2000 kcal', Brand.lime),
              ]),
              const SizedBox(height: Brand.s16),
              const Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                _MacroStat(value: '92g', label: 'PROT.', color: Brand.lime),
                _MacroStat(value: '210g', label: 'GLUC.', color: Brand.blue),
                _MacroStat(value: '55g', label: 'LIP.', color: Brand.orange),
              ]),
              const SizedBox(height: Brand.s16),
              _KcalBar(filled: filled),
            ],
          ),
        ),
        const SizedBox(height: Brand.s12),
        _BrandCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Conseil', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.white)),
              const SizedBox(height: Brand.s12),
              tipAsync.when(
                loading: () => const Row(children: [
                  SizedBox(width: 14, height: 14, child: CircularProgressIndicator(color: Brand.lime, strokeWidth: 1.5)),
                  SizedBox(width: Brand.s8),
                  Text('Analyse en cours…', style: TextStyle(fontSize: 13, color: Brand.grey2)),
                ]),
                error: (e, _) => Text(
                  'Conseil indisponible. Vérifie la config IA.',
                  style: const TextStyle(fontSize: 13, color: Brand.grey2, height: 1.6),
                ),
                data: (tip) => Text(
                  tip ?? 'Bien joué ! Continue comme ça.',
                  style: const TextStyle(fontSize: 13, color: Brand.grey1, height: 1.6),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Shared sub-widgets ────────────────────────────────────────────────────────

class _BrandCard extends StatelessWidget {
  const _BrandCard({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Brand.s16),
      decoration: BoxDecoration(
        color: Brand.bgCard,
        borderRadius: BorderRadius.circular(Brand.rCard),
        border: Border.all(color: Brand.border),
      ),
      child: child,
    );
  }
}

class _NeonBadge extends StatelessWidget {
  const _NeonBadge(this.text, this.color);
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(.12),
        borderRadius: BorderRadius.circular(Brand.rChip),
        border: Border.all(color: color.withOpacity(.25)),
      ),
      child: Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color, letterSpacing: .04)),
    );
  }
}

class _MacroStat extends StatelessWidget {
  const _MacroStat({required this.value, required this.label, required this.color});
  final String value, label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, letterSpacing: -.5, color: color)),
      const SizedBox(height: 3),
      Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: .12, color: Brand.grey2)),
    ]);
  }
}

class _KcalBar extends StatelessWidget {
  const _KcalBar({required this.filled});
  final double filled;

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      ClipRRect(
        borderRadius: BorderRadius.circular(2),
        child: LinearProgressIndicator(
          value: filled,
          minHeight: 3,
          backgroundColor: Brand.border,
          valueColor: const AlwaysStoppedAnimation<Color>(Brand.lime),
        ),
      ),
      const SizedBox(height: Brand.s8),
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        const Text('0', style: TextStyle(fontSize: 11, color: Brand.grey2)),
        Text('${(filled * 100).round()} %', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Brand.lime)),
        const Text('2000 kcal', style: TextStyle(fontSize: 11, color: Brand.grey2)),
      ]),
    ]);
  }
}
