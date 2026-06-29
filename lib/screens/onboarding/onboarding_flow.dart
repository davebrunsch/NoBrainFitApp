import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/services/profile/user_profile.dart';
import 'package:no_brain_fit/services/profile/profile_provider.dart';

/// Multi-step questionnaire that builds the user's fitness context.
///
/// Reached right after sign-up (the router gates `/` behind a completed
/// profile). Can also be reopened later to edit the profile.
class OnboardingFlow extends ConsumerStatefulWidget {
  const OnboardingFlow({super.key});

  @override
  ConsumerState<OnboardingFlow> createState() => _OnboardingFlowState();
}

class _OnboardingFlowState extends ConsumerState<OnboardingFlow> {
  late UserProfile _draft;
  bool _seeded = false;
  int _step = 0;
  bool _saving = false;

  static const _accent = Brand.lime;

  // The ordered list of steps. `_total` excludes the final recap.
  static const _stepCount = 11; // 0..10 questions, then recap at index 11
  int get _total => _stepCount + 1;

  void _seed(UserProfile current) {
    if (_seeded) return;
    // Start from the saved profile when editing, else from sane defaults.
    _draft = current.completed ? current : UserProfile.empty;
    _seeded = true;
  }

  void _next() {
    if (_step < _total - 1) {
      setState(() => _step++);
    } else {
      _finish();
    }
  }

  void _back() {
    if (_step > 0) {
      setState(() => _step--);
    } else {
      Navigator.of(context).maybePop();
    }
  }

  Future<void> _finish() async {
    setState(() => _saving = true);
    await ref
        .read(userProfileProvider.notifier)
        .save(_draft.copyWith(completed: true));
    if (!mounted) return;
    // Editing (pushed from settings) → pop back. Fresh signup (gate
    // redirect, nothing below us) → go home.
    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(userProfileProvider);
    return Scaffold(
      backgroundColor: Brand.bgVoid,
      body: async.when(
        loading: () =>
            const Center(child: CircularProgressIndicator(color: _accent)),
        error: (e, _) =>
            Center(child: Text('$e', style: const TextStyle(color: Brand.orange))),
        data: (current) {
          _seed(current);
          return SafeArea(
            child: Column(
              children: [
                _Header(step: _step, total: _total, onBack: _back),
                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 200),
                    child: SingleChildScrollView(
                      key: ValueKey(_step),
                      padding: const EdgeInsets.fromLTRB(
                          Brand.s20, Brand.s8, Brand.s20, Brand.s20),
                      child: _buildStep(),
                    ),
                  ),
                ),
                _Footer(
                  step: _step,
                  total: _total,
                  saving: _saving,
                  onNext: _next,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStep() {
    switch (_step) {
      case 0:
        return _Question(
          title: 'Tu es…',
          subtitle: 'Pour calibrer ton métabolisme et tes séances.',
          child: Column(
            children: Sex.values
                .map((s) => _SelectTile(
                      icon: s == Sex.male
                          ? Icons.male_rounded
                          : Icons.female_rounded,
                      label: s.label,
                      selected: _draft.sex == s,
                      onTap: () => setState(() => _draft = _draft.copyWith(sex: s)),
                    ))
                .toList(),
          ),
        );
      case 1:
        return _Question(
          title: 'Quel âge as-tu ?',
          subtitle: 'On adapte l\'intensité et la récupération.',
          child: _Stepper(
            value: _draft.age,
            min: 14,
            max: 90,
            unit: 'ans',
            onChanged: (v) => setState(() => _draft = _draft.copyWith(age: v)),
          ),
        );
      case 2:
        return _Question(
          title: 'Ta taille ?',
          subtitle: 'Utilisée pour ton IMC et tes besoins caloriques.',
          child: _Stepper(
            value: _draft.heightCm,
            min: 130,
            max: 220,
            unit: 'cm',
            onChanged: (v) =>
                setState(() => _draft = _draft.copyWith(heightCm: v)),
          ),
        );
      case 3:
        return _Question(
          title: 'Ton poids ?',
          subtitle: 'Tu pourras le mettre à jour à tout moment.',
          child: _Stepper(
            value: _draft.weightKg.round(),
            min: 35,
            max: 200,
            unit: 'kg',
            onChanged: (v) =>
                setState(() => _draft = _draft.copyWith(weightKg: v.toDouble())),
          ),
        );
      case 4:
        return _Question(
          title: 'Ton niveau ?',
          subtitle: 'Sois honnête — on ajuste la difficulté.',
          child: Column(
            children: FitnessLevel.values
                .map((l) => _SelectTile(
                      icon: switch (l) {
                        FitnessLevel.beginner => Icons.eco_rounded,
                        FitnessLevel.intermediate => Icons.fitness_center_rounded,
                        FitnessLevel.advanced => Icons.local_fire_department_rounded,
                      },
                      label: l.label,
                      sub: l.sub,
                      selected: _draft.level == l,
                      onTap: () =>
                          setState(() => _draft = _draft.copyWith(level: l)),
                    ))
                .toList(),
          ),
        );
      case 5:
        return _Question(
          title: 'Ton mode de vie ?',
          subtitle: 'En dehors des séances de sport.',
          child: Column(
            children: Lifestyle.values
                .map((l) => _SelectTile(
                      icon: switch (l) {
                        Lifestyle.sedentary => Icons.weekend_rounded,
                        Lifestyle.light => Icons.directions_walk_rounded,
                        Lifestyle.active => Icons.directions_run_rounded,
                        Lifestyle.veryActive => Icons.bolt_rounded,
                      },
                      label: l.label,
                      sub: l.sub,
                      selected: _draft.lifestyle == l,
                      onTap: () =>
                          setState(() => _draft = _draft.copyWith(lifestyle: l)),
                    ))
                .toList(),
          ),
        );
      case 6:
        return _Question(
          title: 'Ton objectif ?',
          subtitle: 'Ce que tu veux vraiment atteindre.',
          child: Column(
            children: Goal.values
                .map((g) => _SelectTile(
                      icon: switch (g) {
                        Goal.loseFat => Icons.trending_down_rounded,
                        Goal.buildMuscle => Icons.trending_up_rounded,
                        Goal.recomposition => Icons.sync_alt_rounded,
                        Goal.maintain => Icons.trending_flat_rounded,
                        Goal.performance => Icons.emoji_events_rounded,
                      },
                      label: g.label,
                      sub: g.sub,
                      selected: _draft.goal == g,
                      onTap: () =>
                          setState(() => _draft = _draft.copyWith(goal: g)),
                    ))
                .toList(),
          ),
        );
      case 7:
        final hasTarget = _draft.targetWeightKg > 0;
        return _Question(
          title: 'Un poids cible ?',
          subtitle: 'Optionnel — un repère pour suivre ta progression.',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _SelectTile(
                icon: Icons.flag_outlined,
                label: 'Pas d\'objectif de poids précis',
                selected: !hasTarget,
                onTap: () => setState(
                    () => _draft = _draft.copyWith(targetWeightKg: 0)),
              ),
              const SizedBox(height: Brand.s8),
              _SelectTile(
                icon: Icons.adjust_rounded,
                label: 'Je vise un poids',
                selected: hasTarget,
                onTap: () => setState(() => _draft = _draft.copyWith(
                    targetWeightKg:
                        hasTarget ? _draft.targetWeightKg : _draft.weightKg)),
              ),
              if (hasTarget) ...[
                const SizedBox(height: Brand.s16),
                _Stepper(
                  value: _draft.targetWeightKg.round(),
                  min: 35,
                  max: 200,
                  unit: 'kg',
                  onChanged: (v) => setState(() =>
                      _draft = _draft.copyWith(targetWeightKg: v.toDouble())),
                ),
              ],
            ],
          ),
        );
      case 8:
        return _Question(
          title: 'Combien de séances par semaine ?',
          subtitle: 'On construira ton planning autour de ça.',
          child: _DaysPicker(
            value: _draft.daysPerWeek,
            onChanged: (v) =>
                setState(() => _draft = _draft.copyWith(daysPerWeek: v)),
          ),
        );
      case 9:
        return _Question(
          title: 'Quel matériel as-tu ?',
          subtitle: 'Tes séances n\'utiliseront que ce que tu as.',
          child: Column(
            children: Equipment.values
                .map((e) => _SelectTile(
                      icon: switch (e) {
                        Equipment.bodyweight => Icons.accessibility_new_rounded,
                        Equipment.dumbbells => Icons.fitness_center_rounded,
                        Equipment.machines => Icons.precision_manufacturing_rounded,
                        Equipment.fullGym => Icons.sports_gymnastics_rounded,
                      },
                      label: e.label,
                      sub: e.sub,
                      selected: _draft.equipment == e,
                      onTap: () => setState(
                          () => _draft = _draft.copyWith(equipment: e)),
                    ))
                .toList(),
          ),
        );
      case 10:
        return _Question(
          title: 'Abonnement en salle ?',
          subtitle: 'On bascule entre Maison et Salle en un geste.',
          child: Column(
            children: [
              _SelectTile(
                icon: Icons.check_circle_outline_rounded,
                label: 'Oui, j\'ai une salle',
                sub: 'Accès aux machines et charges libres',
                selected: _draft.gymMember,
                onTap: () =>
                    setState(() => _draft = _draft.copyWith(gymMember: true)),
              ),
              _SelectTile(
                icon: Icons.home_outlined,
                label: 'Non, je m\'entraîne à la maison',
                sub: 'Séances adaptées à ton matériel',
                selected: !_draft.gymMember,
                onTap: () =>
                    setState(() => _draft = _draft.copyWith(gymMember: false)),
              ),
            ],
          ),
        );
      default:
        return _Recap(profile: _draft);
    }
  }
}

// ── Header (progress) ─────────────────────────────────────────────────────────

class _Header extends StatelessWidget {
  const _Header({required this.step, required this.total, required this.onBack});
  final int step, total;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s16, Brand.s20, Brand.s8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            GestureDetector(
              onTap: onBack,
              child: Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: Brand.bgCard,
                  borderRadius: BorderRadius.circular(Brand.rButton),
                  border: Border.all(color: Brand.border2),
                ),
                child: const Icon(Icons.chevron_left_rounded,
                    size: 22, color: Brand.white),
              ),
            ),
            const SizedBox(width: Brand.s12),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('PROFIL',
                    style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: .18,
                        color: Brand.lime)),
                Text('On apprend à te connaître',
                    style: TextStyle(
                        fontSize: 19,
                        fontWeight: FontWeight.w600,
                        letterSpacing: -.3,
                        color: Brand.white)),
              ],
            ),
            const Spacer(),
            Text('${step + 1}/$total',
                style: Brand.mono(
                    size: 12, weight: FontWeight.w700, color: Brand.grey1)),
          ]),
          const SizedBox(height: Brand.s16),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: (step + 1) / total,
              minHeight: 4,
              backgroundColor: Brand.border,
              valueColor: const AlwaysStoppedAnimation(Brand.lime),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Footer (continue button) ──────────────────────────────────────────────────

class _Footer extends StatelessWidget {
  const _Footer({
    required this.step,
    required this.total,
    required this.saving,
    required this.onNext,
  });
  final int step, total;
  final bool saving;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    final isLast = step == total - 1;
    return Padding(
      padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s8, Brand.s20, Brand.s20),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: saving ? null : onNext,
          style: ElevatedButton.styleFrom(
            backgroundColor: Brand.lime,
            foregroundColor: Brand.bgVoid,
            disabledBackgroundColor: Brand.lime.withOpacity(.4),
            padding: const EdgeInsets.symmetric(vertical: Brand.s16),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(Brand.rButton)),
          ),
          child: saving
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: Brand.bgVoid))
              : Text(isLast ? 'Lancer mon programme' : 'Continuer',
                  style:
                      const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
        ),
      ),
    );
  }
}

// ── Question wrapper ──────────────────────────────────────────────────────────

class _Question extends StatelessWidget {
  const _Question(
      {required this.title, required this.subtitle, required this.child});
  final String title, subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: Brand.s16),
        Text(title,
            style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                letterSpacing: -.5,
                color: Brand.white)),
        const SizedBox(height: 6),
        Text(subtitle,
            style: const TextStyle(
                fontSize: 13.5, color: Brand.grey1, height: 1.4)),
        const SizedBox(height: Brand.s24),
        child,
      ],
    );
  }
}

// ── Reusable inputs ───────────────────────────────────────────────────────────

class _SelectTile extends StatelessWidget {
  const _SelectTile({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
    this.sub,
  });
  final IconData icon;
  final String label;
  final String? sub;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: Brand.s8),
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 140),
          padding: const EdgeInsets.symmetric(
              horizontal: Brand.s16, vertical: Brand.s16),
          decoration: BoxDecoration(
            color: selected ? Brand.lime.withOpacity(.08) : Brand.bgCard,
            borderRadius: BorderRadius.circular(Brand.rCard),
            border: Border.all(
                color: selected ? Brand.lime : Brand.border,
                width: selected ? 1.5 : 1),
          ),
          child: Row(children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color:
                    selected ? Brand.lime.withOpacity(.15) : Brand.bgSurface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                    color: selected
                        ? Brand.lime.withOpacity(.4)
                        : Brand.border),
              ),
              child: Icon(icon,
                  size: 21, color: selected ? Brand.lime : Brand.grey2),
            ),
            const SizedBox(width: Brand.s12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          letterSpacing: -.2,
                          color: Brand.white)),
                  if (sub != null) ...[
                    const SizedBox(height: 2),
                    Text(sub!,
                        style: const TextStyle(
                            fontSize: 11.5, color: Brand.grey2)),
                  ],
                ],
              ),
            ),
            AnimatedOpacity(
              duration: const Duration(milliseconds: 140),
              opacity: selected ? 1 : 0,
              child: const Icon(Icons.check_circle_rounded,
                  size: 20, color: Brand.lime),
            ),
          ]),
        ),
      ),
    );
  }
}

/// Big number input with − / + steppers.
class _Stepper extends StatelessWidget {
  const _Stepper({
    required this.value,
    required this.min,
    required this.max,
    required this.unit,
    required this.onChanged,
  });
  final int value, min, max;
  final String unit;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: Brand.s16, vertical: Brand.s24),
      decoration: BoxDecoration(
        color: Brand.bgCard,
        borderRadius: BorderRadius.circular(Brand.rCard),
        border: Border.all(color: Brand.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _RoundBtn(
            icon: Icons.remove_rounded,
            enabled: value > min,
            onTap: () => onChanged(value - 1),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('$value',
                  style: Brand.mono(
                      size: 44, weight: FontWeight.w700, color: Brand.white)),
              Text(unit.toUpperCase(),
                  style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: .2,
                      color: Brand.grey2)),
            ],
          ),
          _RoundBtn(
            icon: Icons.add_rounded,
            enabled: value < max,
            onTap: () => onChanged(value + 1),
          ),
        ],
      ),
    );
  }
}

class _RoundBtn extends StatelessWidget {
  const _RoundBtn(
      {required this.icon, required this.enabled, required this.onTap});
  final IconData icon;
  final bool enabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Container(
        width: 52,
        height: 52,
        decoration: BoxDecoration(
          color: enabled ? Brand.lime.withOpacity(.12) : Brand.bgSurface,
          shape: BoxShape.circle,
          border: Border.all(
              color: enabled ? Brand.lime.withOpacity(.4) : Brand.border),
        ),
        child: Icon(icon,
            size: 24, color: enabled ? Brand.lime : Brand.grey2),
      ),
    );
  }
}

/// 1–7 day chip selector.
class _DaysPicker extends StatelessWidget {
  const _DaysPicker({required this.value, required this.onChanged});
  final int value;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: Brand.s8,
      runSpacing: Brand.s8,
      children: List.generate(7, (i) {
        final n = i + 1;
        final sel = value == n;
        return GestureDetector(
          onTap: () => onChanged(n),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 140),
            width: 44,
            height: 56,
            decoration: BoxDecoration(
              color: sel ? Brand.lime.withOpacity(.12) : Brand.bgCard,
              borderRadius: BorderRadius.circular(Brand.rChip),
              border: Border.all(
                  color: sel ? Brand.lime : Brand.border2,
                  width: sel ? 1.5 : 1),
            ),
            alignment: Alignment.center,
            child: Text('$n',
                style: Brand.mono(
                    size: 20,
                    weight: FontWeight.w700,
                    color: sel ? Brand.lime : Brand.grey1)),
          ),
        );
      }),
    );
  }
}

// ── Recap ─────────────────────────────────────────────────────────────────────

class _Recap extends StatelessWidget {
  const _Recap({required this.profile});
  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: Brand.s16),
        const Text('Ton profil est prêt',
            style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                letterSpacing: -.5,
                color: Brand.white)),
        const SizedBox(height: 6),
        const Text(
            'On utilise ça pour générer tes séances et tes repas. Modifiable à tout moment.',
            style: TextStyle(fontSize: 13.5, color: Brand.grey1, height: 1.4)),
        const SizedBox(height: Brand.s24),

        // Headline metrics
        Container(
          padding: const EdgeInsets.all(Brand.s16),
          decoration: BoxDecoration(
            gradient: Brand.cardGradient(),
            borderRadius: BorderRadius.circular(Brand.rCard),
            border: Border.all(color: Brand.lime.withOpacity(.25)),
          ),
          child: Row(
            children: [
              _Metric(
                  value: profile.dailyCalorieTarget.toString(),
                  unit: 'kcal/j',
                  label: 'CIBLE'),
              _divider(),
              _Metric(
                  value: profile.bmi.toStringAsFixed(1),
                  unit: 'IMC',
                  label: 'INDICE'),
              _divider(),
              _Metric(
                  value: profile.tdee.toString(),
                  unit: 'kcal/j',
                  label: 'DÉPENSE'),
            ],
          ),
        ),
        const SizedBox(height: Brand.s16),

        // Summary rows
        Container(
          padding: const EdgeInsets.symmetric(
              horizontal: Brand.s16, vertical: Brand.s4),
          decoration: BoxDecoration(
            color: Brand.bgCard,
            borderRadius: BorderRadius.circular(Brand.rCard),
            border: Border.all(color: Brand.border),
          ),
          child: Column(
            children: [
              _row('Objectif', profile.goal.label),
              _row('Niveau', profile.level.label),
              _row('Mode de vie', profile.lifestyle.label),
              _row('Fréquence', '${profile.daysPerWeek} séances / semaine'),
              _row('Matériel', profile.equipment.label),
              _row('Salle de sport', profile.gymMember ? 'Oui' : 'Non'),
              _row(
                  'Mensurations',
                  '${profile.sex.label} · ${profile.age} ans · '
                      '${profile.heightCm} cm · ${profile.weightKg.round()} kg',
                  last: true),
            ],
          ),
        ),
      ],
    );
  }

  Widget _divider() =>
      Container(width: 1, height: 38, color: Brand.border);

  Widget _row(String label, String value, {bool last = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: Brand.s12),
      decoration: BoxDecoration(
        border: last
            ? null
            : const Border(bottom: BorderSide(color: Brand.border)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(label,
                style: const TextStyle(fontSize: 13, color: Brand.grey1)),
          ),
          const SizedBox(width: Brand.s12),
          Expanded(
            child: Text(value,
                textAlign: TextAlign.right,
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Brand.white)),
          ),
        ],
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.value, required this.unit, required this.label});
  final String value, unit, label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  letterSpacing: .18,
                  color: Brand.grey2)),
          const SizedBox(height: 6),
          Text(value,
              style: Brand.mono(
                  size: 22, weight: FontWeight.w700, color: Brand.lime)),
          Text(unit,
              style: const TextStyle(fontSize: 10, color: Brand.grey2)),
        ],
      ),
    );
  }
}
