import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:no_brain_fit/api/food_providers.dart';
import 'package:no_brain_fit/api/models/food_product.dart';

/// Écran de recherche d'aliment branché sur l'API OpenFoodFacts.
///
/// L'aliment sélectionné est renvoyé via `Navigator.pop(context, product)`.
class FoodSearchScreen extends ConsumerStatefulWidget {
  const FoodSearchScreen({super.key});

  @override
  ConsumerState<FoodSearchScreen> createState() => _FoodSearchScreenState();
}

class _FoodSearchScreenState extends ConsumerState<FoodSearchScreen> {
  static const _color = Color(0xFFE8622A);

  final _controller = TextEditingController();
  Timer? _debounce;
  String _query = '';

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 450), () {
      final q = value.trim();
      if (q != _query) setState(() => _query = q);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.chevron_left,
                          color: Colors.white, size: 22),
                    ),
                  ),
                  const SizedBox(width: 14),
                  const Text('🔍', style: TextStyle(fontSize: 24)),
                  const SizedBox(width: 8),
                  const Text('Chercher un aliment',
                      style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: Colors.white)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(16),
                  border:
                      Border.all(color: Colors.white.withOpacity(0.1), width: 1.5),
                ),
                child: Row(
                  children: [
                    Icon(Icons.search, color: Colors.white.withOpacity(0.5)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        autofocus: true,
                        style: const TextStyle(color: Colors.white),
                        textInputAction: TextInputAction.search,
                        onChanged: _onChanged,
                        decoration: const InputDecoration(
                          hintText: 'Ex : yaourt, banane, Nutella…',
                          hintStyle: TextStyle(color: Colors.white38),
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                    if (_controller.text.isNotEmpty)
                      GestureDetector(
                        onTap: () {
                          _controller.clear();
                          setState(() => _query = '');
                        },
                        child: Icon(Icons.close,
                            color: Colors.white.withOpacity(0.5), size: 20),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(child: _buildResults()),
          ],
        ),
      ),
    );
  }

  Widget _buildResults() {
    if (_query.length < 2) {
      return const _Hint(
        emoji: '🍎',
        text: 'Tape le nom d\'un aliment pour voir\nses calories et macros réelles.',
      );
    }

    final async = ref.watch(foodSearchProvider(_query));
    return async.when(
      loading: () => const Center(
        child: CircularProgressIndicator(color: _color),
      ),
      error: (e, _) => _Hint(
        emoji: '⚠️',
        text: e.toString().replaceFirst('FoodApiException: ', ''),
      ),
      data: (products) {
        if (products.isEmpty) {
          return const _Hint(
            emoji: '🤷',
            text: 'Aucun résultat.\nEssaie un autre terme.',
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          itemCount: products.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (_, i) => _ProductTile(
            product: products[i],
            onTap: () => Navigator.of(context).pop(products[i]),
          ),
        );
      },
    );
  }
}

class _ProductTile extends StatelessWidget {
  final FoodProduct product;
  final VoidCallback onTap;

  const _ProductTile({required this.product, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final kcal = product.kcalPer100g;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(
                width: 52,
                height: 52,
                child: product.imageUrl != null
                    ? Image.network(
                        product.imageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const _ImageFallback(),
                      )
                    : const _ImageFallback(),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 14),
                  ),
                  if (product.brand != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        product.brand!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                            color: Colors.white38, fontSize: 12),
                      ),
                    ),
                  const SizedBox(height: 4),
                  Text(
                    kcal != null
                        ? '${kcal.round()} kcal / 100g'
                        : 'Valeurs non renseignées',
                    style: TextStyle(
                        color: kcal != null
                            ? const Color(0xFFE8622A)
                            : Colors.white38,
                        fontSize: 12,
                        fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.white24),
          ],
        ),
      ),
    );
  }
}

class _ImageFallback extends StatelessWidget {
  const _ImageFallback();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white.withOpacity(0.06),
      alignment: Alignment.center,
      child: const Text('🍽️', style: TextStyle(fontSize: 22)),
    );
  }
}

class _Hint extends StatelessWidget {
  final String emoji, text;
  const _Hint({required this.emoji, required this.text});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 48)),
            const SizedBox(height: 12),
            Text(
              text,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white54, height: 1.5),
            ),
          ],
        ),
      ),
    );
  }
}
