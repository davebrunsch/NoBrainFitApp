import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/services/library/library_models.dart';
import 'package:no_brain_fit/services/library/library_service.dart';
import 'package:no_brain_fit/services/nutrition/nutrition_service.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/utils/router.dart';
import 'package:no_brain_fit/widgets/tri_strike_logo.dart';
import 'package:no_brain_fit/screens/train/train_result_screen.dart';

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
        _LibraryButton(),
        const SizedBox(width: Brand.s8),
        _AvatarButton(),
      ],
    );
  }
}

class _LibraryButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/library'),
      child: Container(
        width: 34,
        height: 34,
        decoration: BoxDecoration(
          color: Brand.bgCard,
          shape: BoxShape.circle,
          border: Border.all(color: Brand.border2),
        ),
        child: const Icon(Icons.bookmark_border_rounded, size: 18, color: Brand.grey1),
      ),
    );
  }
}

class _AvatarButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/settings'),
      child: Container(
        width: 34,
        height: 34,
        decoration: BoxDecoration(
          color: Brand.bgCard,
          shape: BoxShape.circle,
          border: Border.all(color: Brand.border2),
        ),
        child: const Icon(Icons.person_outline_rounded, size: 18, color: Brand.grey1),
      ),
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
          style: Brand.labelMono,
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

class _StatStrip extends StatefulWidget {
  const _StatStrip();

  @override
  State<_StatStrip> createState() => _StatStripState();
}

class _StatStripState extends State<_StatStrip> with RouteAware {
  final _nutrition = NutritionService();
  final _library = LibraryService();

  int _kcal = 0;
  bool _trainedToday = false;
  int _streak = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final route = ModalRoute.of(context);
    if (route is PageRoute) routeObserver.subscribe(this, route);
  }

  @override
  void dispose() {
    routeObserver.unsubscribe(this);
    super.dispose();
  }

  @override
  void didPopNext() => _load();

  static bool _sameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  int _computeStreak(List<WorkoutHistoryEntry> history) {
    if (history.isEmpty) return 0;
    final days = history.map((e) => DateTime(e.date.year, e.date.month, e.date.day)).toSet();
    final today = DateTime.now();
    var day = DateTime(today.year, today.month, today.day);
    if (!days.contains(day)) day = day.subtract(const Duration(days: 1));
    var streak = 0;
    while (days.contains(day)) {
      streak++;
      day = day.subtract(const Duration(days: 1));
    }
    return streak;
  }

  static String _formatKcal(int value) {
    final digits = value.toString();
    final buf = StringBuffer();
    for (var i = 0; i < digits.length; i++) {
      if (i > 0 && (digits.length - i) % 3 == 0) buf.write(' ');
      buf.write(digits[i]);
    }
    return buf.toString();
  }

  Future<void> _load() async {
    final totals = await _nutrition.totalsForDay(DateTime.now());
    final history = await _library.history();
    if (!mounted) return;
    setState(() {
      _kcal = totals.kcal;
      _trainedToday = history.any((e) => _sameDay(e.date, DateTime.now()));
      _streak = _computeStreak(history);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: Brand.cardGradient(),
        border: Border.all(color: Brand.border),
        borderRadius: BorderRadius.circular(Brand.rCard),
      ),
      child: Row(
        children: [
          _StatCell(value: _formatKcal(_kcal), label: 'kcal', valueColor: Brand.lime, isLast: false),
          _StatCell(value: _trainedToday ? 'Fait' : 'Repos', label: 'Séance', isLast: false),
          _StatCell(value: 'J · $_streak', label: 'Streak', isLast: true),
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
            Text(value, style: Brand.mono(size: 17, weight: FontWeight.w700, color: valueColor ?? Brand.white, letterSpacing: -.5)),
            const SizedBox(height: 3),
            Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: .12, color: Brand.grey2)),
          ],
        ),
      ),
    );
  }
}

// ── Quick pick ────────────────────────────────────────────────────────────────

class _QuickPick {
  const _QuickPick({required this.icon, required this.label, required this.sub, required this.destination});
  final IconData icon;
  final String label;
  final String sub;
  final Widget Function() destination;
}

// ── Action rows ───────────────────────────────────────────────────────────────

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
          sub: 'Suivi des calories & macros',
          accent: Brand.lime,
          advancedRoute: '/eat',
        ),
        const SizedBox(height: Brand.s12),
        _ActionRow(
          index: '02',
          icon: Icons.fitness_center_outlined,
          kicker: 'Training',
          title: 'S\'entraîner',
          sub: 'Glisse pour le programme IA · ou choisir',
          accent: Brand.blue,
          advancedRoute: '/train/rag',
          quickPicks: [
            _QuickPick(
              icon: Icons.bolt_outlined,
              label: '15 min · Maison',
              sub: 'Express · Sans matériel',
              destination: () => const TrainResultScreen(duration: '15 min', location: 'Maison'),
            ),
            _QuickPick(
              icon: Icons.fitness_center_outlined,
              label: '30 min · Salle',
              sub: 'Standard · Avec machines',
              destination: () => const TrainResultScreen(duration: '30 min', location: 'Salle'),
            ),
            _QuickPick(
              icon: Icons.park_outlined,
              label: '45 min · Dehors',
              sub: 'Complet · Parc, rue…',
              destination: () => const TrainResultScreen(duration: '45 min', location: 'Dehors'),
            ),
          ],
        ),
        const SizedBox(height: Brand.s12),
        _ActionRow(
          index: '03',
          icon: Icons.soup_kitchen_outlined,
          kicker: 'Cuisine',
          title: 'Cuisiner',
          sub: '3 recettes + liste de courses',
          accent: Brand.orange,
          advancedRoute: '/cook',
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
    required this.advancedRoute,
    this.quickPicks,
  });
  final String index, kicker, title, sub, advancedRoute;
  final IconData icon;
  final Color accent;
  final List<_QuickPick>? quickPicks;

  @override
  State<_ActionRow> createState() => _ActionRowState();
}

class _ActionRowState extends State<_ActionRow> {
  bool _pressed = false;

  void _goAdvanced() => context.push(widget.advancedRoute);

  void _handleTap() {
    final picks = widget.quickPicks;
    if (picks != null) {
      showModalBottomSheet(
        context: context,
        backgroundColor: Brand.bgCard,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(Brand.rSheet)),
        ),
        builder: (_) => _QuickSheet(
          title: widget.title,
          icon: widget.icon,
          accent: widget.accent,
          picks: picks,
          onAdvanced: _goAdvanced,
        ),
      );
    } else {
      _goAdvanced();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) { setState(() => _pressed = false); _handleTap(); },
        onTapCancel: () => setState(() => _pressed = false),
        onHorizontalDragEnd: (d) {
          if ((d.primaryVelocity ?? 0).abs() > 200) _goAdvanced();
        },
        child: AnimatedScale(
          scale: _pressed ? .98 : 1.0,
          duration: const Duration(milliseconds: 100),
          child: Container(
            decoration: BoxDecoration(
              gradient: Brand.cardGradient(_pressed ? Brand.bgCardHi : Brand.bgCard),
              borderRadius: BorderRadius.circular(Brand.rRow),
              border: Border.all(color: _pressed ? widget.accent.withOpacity(.35) : Brand.border),
              boxShadow: _pressed ? Brand.accentGlow(widget.accent, opacity: .18) : null,
            ),
            padding: const EdgeInsets.symmetric(horizontal: Brand.s20),
            child: Row(
              children: [
                Container(
                  width: 46, height: 46,
                  decoration: BoxDecoration(
                    // Icône en acier au repos ; le Lume ne marque que l'état actif.
                    gradient: _pressed ? Brand.accentTile(widget.accent) : Brand.steelTile(),
                    borderRadius: BorderRadius.circular(Brand.rCard),
                    border: Border.all(color: _pressed ? widget.accent.withOpacity(.4) : Brand.border2),
                  ),
                  child: Icon(widget.icon, size: 22, color: _pressed ? widget.accent : Brand.titane),
                ),
                const SizedBox(width: Brand.s16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        widget.kicker.toUpperCase(),
                        style: const TextStyle(fontFamily: Brand.fontMono, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: .16, color: Brand.grey1),
                      ),
                      const SizedBox(height: 3),
                      Text(widget.title, style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w600, letterSpacing: -.4, color: Brand.white)),
                      const SizedBox(height: 2),
                      Text(widget.sub, style: const TextStyle(fontSize: 12, color: Brand.grey2)),
                    ],
                  ),
                ),
                // Index numérique en Lume — distingue les piliers (charte V2.0).
                Text(
                  widget.index,
                  style: Brand.mono(size: 12, weight: FontWeight.w700, color: Brand.lume, letterSpacing: .1),
                ),
                const SizedBox(width: Brand.s8),
                Icon(
                  widget.quickPicks != null ? Icons.expand_more_rounded : Icons.chevron_right_rounded,
                  size: 20,
                  color: Brand.grey2,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Quick sheet (bottom sheet) ────────────────────────────────────────────────

class _QuickSheet extends StatelessWidget {
  const _QuickSheet({
    required this.title,
    required this.icon,
    required this.accent,
    required this.picks,
    required this.onAdvanced,
  });
  final String title;
  final IconData icon;
  final Color accent;
  final List<_QuickPick> picks;
  final VoidCallback onAdvanced;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s12, Brand.s20, Brand.s32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 36, height: 4,
            decoration: BoxDecoration(
              color: Brand.grey2,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: Brand.s20),
          // Header
          Row(
            children: [
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(
                  color: accent.withOpacity(.10),
                  borderRadius: BorderRadius.circular(Brand.rCard),
                  border: Border.all(color: accent.withOpacity(.2)),
                ),
                child: Icon(icon, size: 18, color: accent),
              ),
              const SizedBox(width: Brand.s12),
              Text(
                title,
                style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600, letterSpacing: -.3, color: Brand.white),
              ),
            ],
          ),
          const SizedBox(height: Brand.s16),
          // Quick pick rows
          ...picks.map((p) => _QuickOption(pick: p, accent: accent)),
          const SizedBox(height: Brand.s4),
          // Advanced link
          GestureDetector(
            onTap: () {
              Navigator.of(context).pop();
              onAdvanced();
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: Brand.s12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Text(
                    'Configurer',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Brand.grey1, letterSpacing: .1),
                  ),
                  SizedBox(width: Brand.s4),
                  Icon(Icons.arrow_forward_rounded, size: 14, color: Brand.grey1),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickOption extends StatefulWidget {
  const _QuickOption({required this.pick, required this.accent});
  final _QuickPick pick;
  final Color accent;

  @override
  State<_QuickOption> createState() => _QuickOptionState();
}

class _QuickOptionState extends State<_QuickOption> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: Brand.s8),
      child: GestureDetector(
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) {
          setState(() => _pressed = false);
          final nav = Navigator.of(context);
          final dest = widget.pick.destination();
          nav.pop();
          nav.push(MaterialPageRoute(builder: (_) => dest));
        },
        onTapCancel: () => setState(() => _pressed = false),
        child: AnimatedScale(
          scale: _pressed ? .98 : 1.0,
          duration: const Duration(milliseconds: 80),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: Brand.s16, vertical: Brand.s12),
            decoration: BoxDecoration(
              color: _pressed ? Brand.bgCardHi : Brand.bgSurface,
              borderRadius: BorderRadius.circular(Brand.rCard),
              border: Border.all(color: _pressed ? Brand.border2 : Brand.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(
                    color: widget.accent.withOpacity(.08),
                    borderRadius: BorderRadius.circular(Brand.rButton),
                  ),
                  child: Icon(widget.pick.icon, size: 18, color: widget.accent),
                ),
                const SizedBox(width: Brand.s12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.pick.label,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: -.2, color: Brand.white),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        widget.pick.sub,
                        style: const TextStyle(fontSize: 12, color: Brand.grey1),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right_rounded, size: 18, color: Brand.grey2),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
