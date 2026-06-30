import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/services/ai/ai_provider.dart';
import 'package:no_brain_fit/services/ai/ai_service.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/widgets/result_scaffold.dart';
import 'package:no_brain_fit/screens/cook/recipe_detail_screen.dart';
import 'package:no_brain_fit/screens/cook/shopping_list_screen.dart';
import 'package:no_brain_fit/services/cook/shopping_list_service.dart';

class CookResultScreen extends ConsumerStatefulWidget {
  const CookResultScreen({super.key, required this.effort, required this.portions});
  final String effort, portions;

  @override
  ConsumerState<CookResultScreen> createState() => _CookResultScreenState();
}

class _CookResultScreenState extends ConsumerState<CookResultScreen> {
  final Set<int> _checked = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(recipesProvider.notifier).generate(
        effort: widget.effort,
        portions: widget.portions,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final recipesAsync = ref.watch(recipesProvider);

    return recipesAsync.when(
      loading: () => _buildShell(
        sub: widget.portions,
        child: const _LoadingCard(),
      ),
      error: (e, _) => _buildShell(
        sub: widget.portions,
        child: _ErrorCard(message: e.toString()),
      ),
      data: (suggestions) {
        if (suggestions == null) {
          return _buildShell(sub: widget.portions, child: const _LoadingCard());
        }
        final avgTime = suggestions.recipes.isEmpty
            ? 0
            : suggestions.recipes.map((r) => r.timeMin).reduce((a, b) => a + b) ~/ suggestions.recipes.length;
        return _buildShell(
          sub: '~$avgTime min · ${widget.portions}',
          onPrimary: suggestions.recipes.isEmpty ? null : () => _openRecipe(suggestions.recipes.first),
          child: _RecipesContent(
            suggestions: suggestions,
            checked: _checked,
            onToggle: (i) => setState(() {
              _checked.contains(i) ? _checked.remove(i) : _checked.add(i);
            }),
            onOpenRecipe: _openRecipe,
            onAddToList: () => _addToList(suggestions.shoppingList),
            onOpenList: _openList,
          ),
        );
      },
    );
  }

  void _openRecipe(Recipe r) => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => RecipeDetailScreen(recipe: r, portions: widget.portions)),
      );

  void _openList() => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const ShoppingListScreen()),
      );

  Future<void> _addToList(List<String> items) async {
    final added = await ShoppingListService().addAll(items);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(added > 0 ? '$added articles ajoutés à ta liste' : 'Déjà dans ta liste'),
      backgroundColor: Brand.bgCard,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rChip)),
    ));
  }

  Widget _buildShell({required String sub, required Widget child, VoidCallback? onPrimary}) {
    return ResultScaffold(
      accent: Brand.orange,
      kicker: 'Cuisine · Sélection du soir',
      title: '3 recettes.',
      sub: sub,
      onHome: () => context.go('/'),
      primaryLabel: 'Voir la recette',
      onPrimary: onPrimary ?? () {},
      children: [child],
    );
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _LoadingCard extends StatelessWidget {
  const _LoadingCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Brand.s24),
      decoration: BoxDecoration(
        color: Brand.bgCard,
        borderRadius: BorderRadius.circular(Brand.rCard),
        border: Border.all(color: Brand.border),
      ),
      child: const Center(
        child: Column(
          children: [
            CircularProgressIndicator(color: Brand.orange, strokeWidth: 2),
            SizedBox(height: Brand.s16),
            Text('L\'IA prépare tes recettes…', style: TextStyle(fontSize: 13, color: Brand.grey1)),
          ],
        ),
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Brand.s16),
      decoration: BoxDecoration(
        color: Brand.bgCard,
        borderRadius: BorderRadius.circular(Brand.rCard),
        border: Border.all(color: Brand.orange.withOpacity(.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(children: [
            Icon(Icons.warning_amber_rounded, size: 16, color: Brand.orange),
            SizedBox(width: Brand.s8),
            Text('Erreur de génération', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.orange)),
          ]),
          const SizedBox(height: Brand.s8),
          Text(message, style: const TextStyle(fontSize: 12, color: Brand.grey1)),
          const SizedBox(height: Brand.s12),
          const Text(
            'Vérifie la config IA dans les Paramètres.',
            style: TextStyle(fontSize: 12, color: Brand.grey2),
          ),
        ],
      ),
    );
  }
}

class _RecipesContent extends StatelessWidget {
  const _RecipesContent({
    required this.suggestions,
    required this.checked,
    required this.onToggle,
    required this.onOpenRecipe,
    required this.onAddToList,
    required this.onOpenList,
  });
  final RecipeSuggestions suggestions;
  final Set<int> checked;
  final void Function(int) onToggle;
  final void Function(Recipe) onOpenRecipe;
  final VoidCallback onAddToList;
  final VoidCallback onOpenList;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ...suggestions.recipes.map((r) => Padding(
          padding: const EdgeInsets.only(bottom: Brand.s8),
          child: _RecipeRow(recipe: r, onTap: () => onOpenRecipe(r)),
        )),
        const SizedBox(height: Brand.s4),
        _ShoppingList(items: suggestions.shoppingList, checked: checked, onToggle: onToggle),
        const SizedBox(height: Brand.s8),
        Row(children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: onAddToList,
              icon: const Icon(Icons.add_shopping_cart_outlined, size: 16),
              label: const Text('Ajouter à ma liste'),
            ),
          ),
          const SizedBox(width: Brand.s8),
          Expanded(
            child: OutlinedButton.icon(
              onPressed: onOpenList,
              icon: const Icon(Icons.list_alt_rounded, size: 16),
              label: const Text('Ma liste'),
            ),
          ),
        ]),
      ],
    );
  }
}

class _RecipeRow extends StatelessWidget {
  const _RecipeRow({required this.recipe, required this.onTap});
  final Recipe recipe;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
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
            color: Brand.bgCardHi,
            borderRadius: BorderRadius.circular(Brand.rChip),
            border: Border.all(color: Brand.border2),
          ),
          child: const Icon(Icons.restaurant_outlined, size: 22, color: Brand.titane),
        ),
        const SizedBox(width: Brand.s12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(recipe.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: -.2, color: Brand.white)),
            const SizedBox(height: 5),
            Row(children: [
              _Tag('${recipe.timeMin} min'),
              const SizedBox(width: 5),
              _Tag('${recipe.kcal} kcal'),
              const SizedBox(width: 5),
              _Tag('${recipe.protG} g prot'),
            ]),
          ]),
        ),
        const Icon(Icons.chevron_right_rounded, size: 18, color: Brand.grey2),
      ]),
      ),
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
      child: Text(text, style: Brand.mono(size: 10, weight: FontWeight.w400, color: Brand.grey1)),
    );
  }
}

class _ShoppingList extends StatelessWidget {
  const _ShoppingList({required this.items, required this.checked, required this.onToggle});
  final List<String> items;
  final Set<int> checked;
  final void Function(int) onToggle;

  @override
  Widget build(BuildContext context) {
    return Container(
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
              child: Text(
                '${items.length} articles',
                style: Brand.mono(size: 10, weight: FontWeight.w700, color: Brand.orange),
              ),
            ),
          ]),
          const SizedBox(height: Brand.s8),
          ...items.asMap().entries.map((e) => _ShopRow(
            label: e.value,
            checked: checked.contains(e.key),
            onToggle: () => onToggle(e.key),
          )),
        ],
      ),
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
