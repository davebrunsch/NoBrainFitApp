import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/widgets/tri_strike_logo.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Brand.bgVoid,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s16, Brand.s20, Brand.s20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _TopBar(),
              const SizedBox(height: Brand.s24),
              const _HeroText(),
              const SizedBox(height: Brand.s20),
              const _StatStrip(),
              const SizedBox(height: Brand.s20),
              const Expanded(child: _ActionRows()),
            ],
          ),
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const TriStrikeWordmark(markSize: 26),
        const Spacer(),
        _AvatarButton(),
      ],
    );
  }
}

class _AvatarButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 34,
      height: 34,
      decoration: BoxDecoration(
        color: Brand.bgCard,
        shape: BoxShape.circle,
        border: Border.all(color: Brand.border2),
      ),
      child: const Icon(Icons.person_outline_rounded, size: 18, color: Brand.grey1),
    );
  }
}

class _HeroText extends StatelessWidget {
  const _HeroText();

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    final months = ['jan.', 'fév.', 'mar.', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'];
    final label = '${days[now.weekday - 1]} ${now.day} ${months[now.month - 1]}';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 10, fontWeight: FontWeight.w700,
            letterSpacing: .18, color: Brand.grey2,
          ),
        ),
        const SizedBox(height: Brand.s8),
        RichText(
          text: const TextSpan(
            style: TextStyle(fontFamily: 'SpaceGrotesk', fontSize: 34, fontWeight: FontWeight.w600, letterSpacing: -1.2, height: 1.05),
            children: [
              TextSpan(text: 'On fait quoi\n', style: TextStyle(color: Brand.white)),
              TextSpan(text: 'aujourd\'hui ?', style: TextStyle(color: Brand.grey2)),
            ],
          ),
        ),
      ],
    );
  }
}

class _StatStrip extends StatelessWidget {
  const _StatStrip();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Brand.border),
        borderRadius: BorderRadius.circular(Brand.rCard),
      ),
      child: Row(
        children: [
          _StatCell(value: '1 240', label: 'kcal', valueColor: Brand.lime, isLast: false),
          _StatCell(value: 'Repos', label: 'Séance', isLast: false),
          _StatCell(value: 'J · 5', label: 'Streak', isLast: true),
        ],
      ),
    );
  }
}

class _StatCell extends StatelessWidget {
  const _StatCell({required this.value, required this.label, this.valueColor, required this.isLast});
  final String value, label;
  final Color? valueColor;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: Brand.s16, vertical: 14),
        decoration: isLast ? null : BoxDecoration(border: Border(right: BorderSide(color: Brand.border))),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600, letterSpacing: -.5, color: valueColor ?? Brand.white)),
            const SizedBox(height: 3),
            Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: .12, color: Brand.grey2)),
          ],
        ),
      ),
    );
  }
}

class _ActionRows extends StatelessWidget {
  const _ActionRows();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _ActionRow(
          index: '01',
          icon: Icons.restaurant_outlined,
          kicker: 'Nutrition',
          title: 'Manger',
          sub: 'Loguer un repas en 2 gestes',
          accent: Brand.lime,
          onTap: () => context.push('/eat'),
        ),
        const SizedBox(height: Brand.s12),
        _ActionRow(
          index: '02',
          icon: Icons.fitness_center_outlined,
          kicker: 'Training',
          title: 'S\'entraîner',
          sub: 'Séance générée pour toi',
          accent: Brand.blue,
          onTap: () => context.push('/train'),
        ),
        const SizedBox(height: Brand.s12),
        _ActionRow(
          index: '03',
          icon: Icons.soup_kitchen_outlined,
          kicker: 'Cuisine',
          title: 'Cuisiner',
          sub: '3 recettes + liste de courses',
          accent: Brand.orange,
          onTap: () => context.push('/cook'),
        ),
      ],
    );
  }
}

class _ActionRow extends StatefulWidget {
  const _ActionRow({
    required this.index,
    required this.icon,
    required this.kicker,
    required this.title,
    required this.sub,
    required this.accent,
    required this.onTap,
  });
  final String index, kicker, title, sub;
  final IconData icon;
  final Color accent;
  final VoidCallback onTap;

  @override
  State<_ActionRow> createState() => _ActionRowState();
}

class _ActionRowState extends State<_ActionRow> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) { setState(() => _pressed = false); widget.onTap(); },
        onTapCancel: () => setState(() => _pressed = false),
        child: AnimatedScale(
          scale: _pressed ? .98 : 1.0,
          duration: const Duration(milliseconds: 100),
          child: Container(
            decoration: BoxDecoration(
              color: _pressed ? Brand.bgCardHi : Brand.bgCard,
              borderRadius: BorderRadius.circular(Brand.rRow),
              border: Border.all(color: _pressed ? Brand.border2 : Brand.border),
            ),
            padding: const EdgeInsets.symmetric(horizontal: Brand.s20),
            child: Row(
              children: [
                // Icon container
                Container(
                  width: 46, height: 46,
                  decoration: BoxDecoration(
                    color: widget.accent.withOpacity(.10),
                    borderRadius: BorderRadius.circular(Brand.rCard),
                    border: Border.all(color: widget.accent.withOpacity(.2)),
                  ),
                  child: Icon(widget.icon, size: 22, color: widget.accent),
                ),
                const SizedBox(width: Brand.s16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        widget.kicker.toUpperCase(),
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: .16, color: widget.accent),
                      ),
                      const SizedBox(height: 3),
                      Text(widget.title, style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w600, letterSpacing: -.4, color: Brand.white)),
                      const SizedBox(height: 2),
                      Text(widget.sub, style: const TextStyle(fontSize: 12, color: Brand.grey2)),
                    ],
                  ),
                ),
                Text(
                  widget.index,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: .1, color: Brand.grey2),
                ),
                const SizedBox(width: Brand.s8),
                const Icon(Icons.chevron_right_rounded, size: 20, color: Brand.grey2),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
