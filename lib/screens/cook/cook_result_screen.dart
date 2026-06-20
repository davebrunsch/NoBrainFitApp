import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CookResultScreen extends StatefulWidget {
  final String effort;
  final String portions;

  const CookResultScreen({
    super.key,
    required this.effort,
    required this.portions,
  });

  @override
  State<CookResultScreen> createState() => _CookResultScreenState();
}

class _CookResultScreenState extends State<CookResultScreen> {
  static const _color = Color(0xFF27AE60);
  final Set<int> _checkedItems = {};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: GestureDetector(
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
            ),
            const SizedBox(height: 16),
            const Text('🍳', style: TextStyle(fontSize: 52)),
            const SizedBox(height: 8),
            Text('3 recettes pour ce soir',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800, color: Colors.white)),
            Text('~25 min · ${widget.portions}',
                style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 20),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  _RecipeCard(
                    emoji: '🥗',
                    name: 'Poulet grillé & légumes rôtis',
                    time: '25 min',
                    kcal: '480 kcal',
                    prot: '38g prot',
                    bgColor: const Color(0xFF1A3A2A),
                  ),
                  const SizedBox(height: 10),
                  _RecipeCard(
                    emoji: '🍜',
                    name: 'Pâtes au pesto & thon',
                    time: '15 min',
                    kcal: '520 kcal',
                    prot: '30g prot',
                    bgColor: const Color(0xFF1A2A3A),
                  ),
                  const SizedBox(height: 10),
                  _RecipeCard(
                    emoji: '🥚',
                    name: 'Omelette aux champignons',
                    time: '10 min',
                    kcal: '310 kcal',
                    prot: '24g prot',
                    bgColor: const Color(0xFF2A2A1A),
                  ),
                  const SizedBox(height: 14),
                  Container(
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
                            const Text('🛒', style: TextStyle(fontSize: 18)),
                            const SizedBox(width: 8),
                            const Text('Liste de courses',
                                style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: _color.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text('Monoprix 0.3km',
                                  style: TextStyle(fontSize: 10, color: _color, fontWeight: FontWeight.w600)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ...List.generate(_shoppingItems.length, (i) {
                          final checked = _checkedItems.contains(i);
                          return GestureDetector(
                            onTap: () => setState(() {
                              if (checked) _checkedItems.remove(i);
                              else _checkedItems.add(i);
                            }),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 7),
                              child: Row(
                                children: [
                                  AnimatedContainer(
                                    duration: const Duration(milliseconds: 150),
                                    width: 22, height: 22,
                                    decoration: BoxDecoration(
                                      color: checked ? _color : Colors.transparent,
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(
                                          color: checked ? _color : Colors.white24,
                                          width: 1.5),
                                    ),
                                    child: checked
                                        ? const Icon(Icons.check, size: 14, color: Colors.white)
                                        : null,
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    _shoppingItems[i],
                                    style: TextStyle(
                                      color: checked ? Colors.grey : Colors.white,
                                      decoration: checked ? TextDecoration.lineThrough : null,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
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
                        backgroundColor: _color,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Text('Voir la recette →',
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

  static const _shoppingItems = [
    'Escalope de poulet (300g)',
    'Courgettes',
    'Poivrons rouges',
    'Huile d\'olive',
    'Pâtes (200g)',
    'Pesto basilic',
  ];
}

class _RecipeCard extends StatelessWidget {
  final String emoji, name, time, kcal, prot;
  final Color bgColor;

  const _RecipeCard({
    required this.emoji,
    required this.name,
    required this.time,
    required this.kcal,
    required this.prot,
    required this.bgColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        children: [
          Container(
            height: 80,
            alignment: Alignment.center,
            child: Text(emoji, style: const TextStyle(fontSize: 44)),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.06),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(18),
                bottomRight: Radius.circular(18),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        fontSize: 14)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    _Tag('⏱️ $time'),
                    const SizedBox(width: 6),
                    _Tag('🔥 $kcal'),
                    const SizedBox(width: 6),
                    _Tag('💪 $prot'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  final String text;
  const _Tag(this.text);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(text, style: const TextStyle(fontSize: 10, color: Colors.white70)),
    );
  }
}
