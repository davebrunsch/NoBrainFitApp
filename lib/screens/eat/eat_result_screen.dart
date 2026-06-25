import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/widgets/result_scaffold.dart';

class EatResultScreen extends StatelessWidget {
  const EatResultScreen({super.key, required this.mealType, required this.mealSize});
  final String mealType, mealSize;

  int get _kcal => switch (mealSize) {
    'Léger'   => 350,
    'Normal'  => 600,
    'Copieux' => 900,
    _         => 500,
  };

  @override
  Widget build(BuildContext context) {
    return ResultScaffold(
      accent: Brand.lime,
      kicker: 'Nutrition · Enregistré',
      title: 'Repas loggé.',
      sub: '$mealType · ~$_kcal kcal',
      onHome: () => context.go('/'),
      primaryLabel: 'Ajouter un aliment',
      onPrimary: () {},
      children: [
        // Bilan card
        _BrandCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                const Text('Bilan du jour', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.white)),
                const Spacer(),
                _NeonBadge('1890 / 2000 kcal', Brand.lime),
              ]),
              const SizedBox(height: Brand.s16),
              Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: const [
                _MacroStat(value: '92g', label: 'PROT.', color: Brand.lime),
                _MacroStat(value: '210g', label: 'GLUC.', color: Brand.blue),
                _MacroStat(value: '55g', label: 'LIP.', color: Brand.orange),
              ]),
              const SizedBox(height: Brand.s16),
              _KcalBar(filled: .945),
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
              const Text(
                'Il te reste 110 kcal. Un dîner léger — soupe ou yaourt — et tu seras pile sur ton objectif.',
                style: TextStyle(fontSize: 13, color: Brand.grey1, height: 1.6),
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
