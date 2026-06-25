import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/widgets/result_scaffold.dart';

class CookResultScreen extends StatefulWidget {
  const CookResultScreen({super.key, required this.effort, required this.portions});
  final String effort, portions;

  @override
  State<CookResultScreen> createState() => _CookResultScreenState();
}

class _CookResultScreenState extends State<CookResultScreen> {
  static const _recipes = [
    _Recipe('Poulet grillé & légumes rôtis', '25 min', '480 kcal', '38 g prot'),
    _Recipe('Pâtes au pesto & thon',         '15 min', '520 kcal', '30 g prot'),
    _Recipe('Omelette aux champignons',       '10 min', '310 kcal', '24 g prot'),
  ];
  static const _shop = [
    'Escalope de poulet · 300 g',
    'Courgettes',
    'Poivrons rouges',
    "Huile d'olive",
    'Pâtes · 200 g',
    'Pesto basilic',
  ];
  final Set<int> _checked = {};

  @override
  Widget build(BuildContext context) {
    return ResultScaffold(
      accent: Brand.orange,
      kicker: 'Cuisine · Sélection du soir',
      title: '3 recettes.',
      sub: '~25 min · ${widget.portions}',
      onHome: () => context.go('/'),
      primaryLabel: 'Voir la recette',
      onPrimary: () {},
      children: [
        // Recipes
        ..._recipes.map((r) => Padding(
          padding: const EdgeInsets.only(bottom: Brand.s8),
          child: _RecipeRow(recipe: r),
        )),
        const SizedBox(height: Brand.s4),
        // Shopping list
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
                const Text('Liste de courses', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.white)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Brand.orange.withOpacity(.12),
                    borderRadius: BorderRadius.circular(Brand.rChip),
                    border: Border.all(color: Brand.orange.withOpacity(.25)),
                  ),
                  child: const Text('Monoprix · 0,3 km', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Brand.orange)),
                ),
              ]),
              const SizedBox(height: Brand.s8),
              ..._shop.asMap().entries.map((e) => _ShopRow(
                label: e.value,
                checked: _checked.contains(e.key),
                onToggle: () => setState(() { _checked.contains(e.key) ? _checked.remove(e.key) : _checked.add(e.key); }),
              )),
            ],
          ),
        ),
      ],
    );
  }
}

class _RecipeRow extends StatelessWidget {
  const _RecipeRow({required this.recipe});
  final _Recipe recipe;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: Brand.s12, vertical: Brand.s12),
      decoration: BoxDecoration(
        color: Brand.bgCard,
        borderRadius: BorderRadius.circular(Brand.rCard),
        border: Border.all(color: Brand.border),
      ),
      child: Row(children: [
        Container(
          width: 50, height: 50,
          decoration: BoxDecoration(
            color: Brand.orange.withOpacity(.10),
            borderRadius: BorderRadius.circular(Brand.rChip),
            border: Border.all(color: Brand.orange.withOpacity(.2)),
          ),
          child: const Icon(Icons.restaurant_outlined, size: 22, color: Brand.orange),
        ),
        const SizedBox(width: Brand.s12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(recipe.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: -.2, color: Brand.white)),
            const SizedBox(height: 5),
            Row(children: [
              _Tag('⏱ ${recipe.time}'),
              const SizedBox(width: 5),
              _Tag('🔥 ${recipe.kcal}'),
              const SizedBox(width: 5),
              _Tag('💪 ${recipe.prot}'),
            ]),
          ]),
        ),
        const Icon(Icons.chevron_right_rounded, size: 18, color: Brand.grey2),
      ]),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: Brand.border,
        borderRadius: BorderRadius.circular(Brand.rTag),
      ),
      child: Text(text, style: const TextStyle(fontSize: 10, color: Brand.grey1)),
    );
  }
}

class _ShopRow extends StatelessWidget {
  const _ShopRow({required this.label, required this.checked, required this.onToggle});
  final String label;
  final bool checked;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onToggle,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: Brand.s8),
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Brand.border))),
        child: Row(children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 140),
            width: 19, height: 19,
            decoration: BoxDecoration(
              color: checked ? Brand.orange : Colors.transparent,
              borderRadius: BorderRadius.circular(5),
              border: Border.all(color: checked ? Brand.orange : Brand.grey2, width: 1.5),
            ),
            child: checked ? const Icon(Icons.check_rounded, size: 12, color: Brand.bgVoid) : null,
          ),
          const SizedBox(width: Brand.s12),
          Text(
            label,
            style: TextStyle(
              fontSize: 13, fontWeight: FontWeight.w500,
              color: checked ? Brand.grey2 : Brand.white,
              decoration: checked ? TextDecoration.lineThrough : null,
              decorationColor: Brand.grey2,
            ),
          ),
        ]),
      ),
    );
  }
}

class _Recipe {
  const _Recipe(this.name, this.time, this.kcal, this.prot);
  final String name, time, kcal, prot;
}
