import 'package:flutter/material.dart';
import 'package:no_brain_fit/utils/brand.dart';

class ResultScaffold extends StatelessWidget {
  const ResultScaffold({
    super.key,
    required this.accent,
    required this.kicker,
    required this.title,
    required this.sub,
    required this.onHome,
    required this.primaryLabel,
    required this.onPrimary,
    required this.children,
  });

  final Color accent;
  final String kicker, title, sub, primaryLabel;
  final VoidCallback onHome, onPrimary;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Brand.bgVoid,
      body: SafeArea(
        child: Column(
          children: [
            // Top nav
            Padding(
              padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s16, Brand.s20, 0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: _HomeButton(onTap: onHome),
              ),
            ),
            // Scrollable content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s24, Brand.s20, Brand.s16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Kicker
                    Text(
                      kicker.toUpperCase(),
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: .18, color: accent),
                    ),
                    const SizedBox(height: Brand.s8),
                    // Title
                    Text(title, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w600, letterSpacing: -1, color: Brand.white)),
                    const SizedBox(height: 5),
                    Text(sub, style: const TextStyle(fontSize: 13, color: Brand.grey1)),
                    const SizedBox(height: Brand.s20),
                    ...children,
                  ],
                ),
              ),
            ),
            // Action bar
            Padding(
              padding: const EdgeInsets.fromLTRB(Brand.s20, 0, Brand.s20, Brand.s20),
              child: Row(children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onHome,
                    child: const Text('Accueil'),
                  ),
                ),
                const SizedBox(width: Brand.s12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: onPrimary,
                    style: ElevatedButton.styleFrom(backgroundColor: accent, foregroundColor: Brand.bgVoid),
                    child: Text(primaryLabel),
                  ),
                ),
              ]),
            ),
          ],
        ),
      ),
    );
  }
}

class HomeButton extends StatelessWidget {
  const HomeButton({super.key, required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => _HomeButton(onTap: onTap);
}

class _HomeButton extends StatelessWidget {
  const _HomeButton({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38, height: 38,
        decoration: BoxDecoration(
          color: Brand.bgCard,
          borderRadius: BorderRadius.circular(Brand.rButton),
          border: Border.all(color: Brand.border2),
        ),
        child: const Icon(Icons.home_outlined, size: 18, color: Brand.grey1),
      ),
    );
  }
}
