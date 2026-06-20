import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _Header(),
              const SizedBox(height: 8),
              const _QuickStats(),
              const SizedBox(height: 20),
              const Expanded(child: _ThreeButtons()),
            ],
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Bonjour 👋',
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: Colors.grey)),
        const SizedBox(height: 2),
        Text(
          "Qu'est-ce qu'on fait ?",
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: -0.5,
              ),
        ),
        Text(
          "Appuie, l'app s'occupe du reste.",
          style: Theme.of(context)
              .textTheme
              .bodySmall
              ?.copyWith(color: Colors.grey),
        ),
      ],
    );
  }
}

class _QuickStats extends StatelessWidget {
  const _QuickStats();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: const [
          _Pill(emoji: '🔥', text: '1240 kcal'),
          SizedBox(width: 8),
          _Pill(emoji: '💪', text: 'Repos'),
          SizedBox(width: 8),
          _Pill(emoji: '🏅', text: 'Jour 5'),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  final String emoji, text;
  const _Pill({required this.emoji, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 14)),
          const SizedBox(width: 5),
          Text(text,
              style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 13,
                  fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _ThreeButtons extends StatelessWidget {
  const _ThreeButtons();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _BigButton(
          emoji: '🍽️',
          label: 'MANGER',
          sub: 'Loguer un repas',
          gradient: const LinearGradient(
            colors: [Color(0xFFE8622A), Color(0xFFC0392B)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          shadowColor: const Color(0xFFE8622A),
          onTap: () => context.push('/eat'),
        ),
        const SizedBox(height: 14),
        _BigButton(
          emoji: '💪',
          label: "S'ENTRAÎNER",
          sub: 'Programme du jour',
          gradient: const LinearGradient(
            colors: [Color(0xFF2980B9), Color(0xFF1565C0)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          shadowColor: const Color(0xFF2980B9),
          onTap: () => context.push('/train'),
        ),
        const SizedBox(height: 14),
        _BigButton(
          emoji: '👨‍🍳',
          label: 'CUISINER',
          sub: '3 recettes rapides',
          gradient: const LinearGradient(
            colors: [Color(0xFF27AE60), Color(0xFF1A8A49)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          shadowColor: const Color(0xFF27AE60),
          onTap: () => context.push('/cook'),
        ),
      ],
    );
  }
}

class _BigButton extends StatefulWidget {
  final String emoji, label, sub;
  final LinearGradient gradient;
  final Color shadowColor;
  final VoidCallback onTap;

  const _BigButton({
    required this.emoji,
    required this.label,
    required this.sub,
    required this.gradient,
    required this.shadowColor,
    required this.onTap,
  });

  @override
  State<_BigButton> createState() => _BigButtonState();
}

class _BigButtonState extends State<_BigButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) {
          setState(() => _pressed = false);
          widget.onTap();
        },
        onTapCancel: () => setState(() => _pressed = false),
        child: AnimatedScale(
          scale: _pressed ? 0.96 : 1.0,
          duration: const Duration(milliseconds: 100),
          child: Container(
            decoration: BoxDecoration(
              gradient: widget.gradient,
              borderRadius: BorderRadius.circular(28),
              boxShadow: [
                BoxShadow(
                  color: widget.shadowColor.withOpacity(0.35),
                  blurRadius: 24,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Row(
                children: [
                  Text(widget.emoji, style: const TextStyle(fontSize: 48)),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(widget.label,
                            style: const TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: -0.5,
                            )),
                        Text(widget.sub,
                            style: TextStyle(
                                fontSize: 13,
                                color: Colors.white.withOpacity(0.75))),
                      ],
                    ),
                  ),
                  Text('›',
                      style: TextStyle(
                          fontSize: 28,
                          color: Colors.white.withOpacity(0.5))),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
