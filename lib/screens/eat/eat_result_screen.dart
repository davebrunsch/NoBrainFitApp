import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/api/models/food_product.dart';

class EatResultScreen extends StatelessWidget {
  final String mealType;
  final String mealSize;

  /// Aliment réel issu d'OpenFoodFacts (optionnel).
  /// Quand il est fourni, les calories et macros affichées sont réelles.
  final FoodProduct? product;

  const EatResultScreen({
    super.key,
    required this.mealType,
    required this.mealSize,
    this.product,
  });

  /// Portion de référence utilisée pour un aliment scanné (en grammes).
  static const _portionGrams = 100.0;

  int get _estimatedKcal {
    final real = product?.kcalForPortion(_portionGrams);
    if (real != null) return real;
    switch (mealSize) {
      case 'Léger': return 350;
      case 'Normal': return 600;
      case 'Copieux': return 900;
      default: return 500;
    }
  }

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
            const SizedBox(height: 24),
            const Text('✅', style: TextStyle(fontSize: 64)),
            const SizedBox(height: 12),
            Text('Repas enregistré !',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800, color: Colors.white)),
            Text(
                product != null
                    ? '$mealType · ${product!.name}'
                    : '$mealType · ~$_estimatedKcal kcal estimées',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 32),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    if (product != null) ...[
                      _ProductDetailCard(
                          product: product!, portionGrams: _portionGrams),
                      const SizedBox(height: 12),
                    ],
                    _ResultCard(
                      title: 'Bilan du jour',
                      badge: '1890 / 2000 kcal',
                      badgeColor: const Color(0xFFE8622A),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: const [
                          _MacroChip(value: '92g', label: 'Protéines', color: Color(0xFF4CAF50)),
                          _MacroChip(value: '210g', label: 'Glucides', color: Color(0xFF2196F3)),
                          _MacroChip(value: '55g', label: 'Lipides', color: Color(0xFFFF9800)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    _ResultCard(
                      title: 'Conseil du soir 💡',
                      child: Text(
                        'Il te reste 110 kcal. Un dîner léger — soupe ou yaourt — et tu seras pile sur ton objectif 🎯',
                        style: TextStyle(color: Colors.grey[300], fontSize: 14, height: 1.5),
                      ),
                    ),
                  ],
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
                        backgroundColor: const Color(0xFFE8622A),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Text('+ Ajouter un aliment',
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

class _ResultCard extends StatelessWidget {
  final String title;
  final String? badge;
  final Color? badgeColor;
  final Widget child;

  const _ResultCard({required this.title, required this.child, this.badge, this.badgeColor});

  @override
  Widget build(BuildContext context) {
    return Container(
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
              Text(title, style: const TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
              if (badge != null) ...[
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: badgeColor?.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(badge!, style: TextStyle(fontSize: 11, color: badgeColor, fontWeight: FontWeight.w600)),
                ),
              ],
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

/// Carte détaillant l'aliment réel scanné via OpenFoodFacts.
class _ProductDetailCard extends StatelessWidget {
  final FoodProduct product;
  final double portionGrams;

  const _ProductDetailCard({required this.product, required this.portionGrams});

  String _macro(double? per100g) {
    if (per100g == null) return '—';
    return '${(per100g * portionGrams / 100).round()}g';
  }

  @override
  Widget build(BuildContext context) {
    final kcal = product.kcalForPortion(portionGrams);
    return _ResultCard(
      title: 'Aliment loggé',
      badge: kcal != null ? '$kcal kcal · ${portionGrams.round()}g' : 'OpenFoodFacts',
      badgeColor: const Color(0xFFE8622A),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _MacroChip(
              value: _macro(product.proteinsPer100g),
              label: 'Protéines',
              color: const Color(0xFF4CAF50)),
          _MacroChip(
              value: _macro(product.carbsPer100g),
              label: 'Glucides',
              color: const Color(0xFF2196F3)),
          _MacroChip(
              value: _macro(product.fatPer100g),
              label: 'Lipides',
              color: const Color(0xFFFF9800)),
        ],
      ),
    );
  }
}

class _MacroChip extends StatelessWidget {
  final String value, label;
  final Color color;
  const _MacroChip({required this.value, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
      ],
    );
  }
}
