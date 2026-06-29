import 'package:shared_preferences/shared_preferences.dart';

// ── Enums ─────────────────────────────────────────────────────────────────────

/// Biological sex — used for BMR (Mifflin-St Jeor) and exercise selection.
enum Sex {
  male,
  female;

  String get label => switch (this) {
        Sex.male => 'Homme',
        Sex.female => 'Femme',
      };
}

/// Self-reported training experience.
enum FitnessLevel {
  beginner,
  intermediate,
  advanced;

  String get label => switch (this) {
        FitnessLevel.beginner => 'Débutant',
        FitnessLevel.intermediate => 'Intermédiaire',
        FitnessLevel.advanced => 'Confirmé',
      };

  String get sub => switch (this) {
        FitnessLevel.beginner => 'Je commence ou je reprends',
        FitnessLevel.intermediate => 'Je m\'entraîne régulièrement',
        FitnessLevel.advanced => 'Plusieurs années d\'expérience',
      };
}

/// Day-to-day activity level — drives the TDEE multiplier.
enum Lifestyle {
  sedentary,
  light,
  active,
  veryActive;

  String get label => switch (this) {
        Lifestyle.sedentary => 'Sédentaire',
        Lifestyle.light => 'Peu actif',
        Lifestyle.active => 'Actif',
        Lifestyle.veryActive => 'Très actif',
      };

  String get sub => switch (this) {
        Lifestyle.sedentary => 'Bureau, peu de marche',
        Lifestyle.light => 'Un peu de marche / debout',
        Lifestyle.active => 'Travail physique ou sport régulier',
        Lifestyle.veryActive => 'Sport intense ou métier très physique',
      };

  /// Mifflin-St Jeor activity factor (excluding deliberate workouts,
  /// which are layered on top by the goal).
  double get factor => switch (this) {
        Lifestyle.sedentary => 1.2,
        Lifestyle.light => 1.375,
        Lifestyle.active => 1.55,
        Lifestyle.veryActive => 1.725,
      };
}

/// Primary fitness objective.
enum Goal {
  loseFat,
  buildMuscle,
  recomposition,
  maintain,
  performance;

  String get label => switch (this) {
        Goal.loseFat => 'Perdre du gras',
        Goal.buildMuscle => 'Prendre du muscle',
        Goal.recomposition => 'Me recomposer',
        Goal.maintain => 'Rester en forme',
        Goal.performance => 'Performer',
      };

  String get sub => switch (this) {
        Goal.loseFat => 'Sécher, perdre du poids',
        Goal.buildMuscle => 'Gagner en masse et en volume',
        Goal.recomposition => 'Perdre du gras et gagner du muscle',
        Goal.maintain => 'Entretenir ma condition physique',
        Goal.performance => 'Force, endurance, dépassement',
      };

  /// Daily calorie delta (kcal) applied on top of maintenance (TDEE).
  int get kcalDelta => switch (this) {
        Goal.loseFat => -450,
        Goal.buildMuscle => 350,
        Goal.recomposition => -150,
        Goal.maintain => 0,
        Goal.performance => 150,
      };
}

/// Equipment the user has access to. Mirrors [FitnessEquipment] labels so the
/// RAG workout generator can reuse the selection directly.
enum Equipment {
  bodyweight,
  dumbbells,
  machines,
  fullGym;

  String get label => switch (this) {
        Equipment.bodyweight => 'Poids de corps',
        Equipment.dumbbells => 'Haltères',
        Equipment.machines => 'Machines guidées',
        Equipment.fullGym => 'Salle complète',
      };

  String get sub => switch (this) {
        Equipment.bodyweight => 'Aucun matériel, juste mon corps',
        Equipment.dumbbells => 'Quelques haltères à la maison',
        Equipment.machines => 'Machines guidées à dispo',
        Equipment.fullGym => 'Salle équipée, tout le matériel',
      };
}

// ── Model ─────────────────────────────────────────────────────────────────────

/// The user's fitness context, captured at onboarding and reused everywhere
/// (workout generation, nutrition targets, copy personalisation).
///
/// Persisted locally in [SharedPreferences] — no profile data leaves the device.
class UserProfile {
  const UserProfile({
    required this.completed,
    required this.sex,
    required this.age,
    required this.heightCm,
    required this.weightKg,
    required this.targetWeightKg,
    required this.level,
    required this.lifestyle,
    required this.goal,
    required this.daysPerWeek,
    required this.equipment,
    required this.gymMember,
  });

  /// Whether the onboarding questionnaire has been completed.
  final bool completed;

  final Sex sex;
  final int age;
  final int heightCm;
  final double weightKg;

  /// Optional goal weight. `0` when not set (e.g. maintain / performance).
  final double targetWeightKg;

  final FitnessLevel level;
  final Lifestyle lifestyle;
  final Goal goal;

  /// Desired training sessions per week (1–7).
  final int daysPerWeek;

  final Equipment equipment;
  final bool gymMember;

  // ── Sensible starting point for a fresh questionnaire ─────────
  static const empty = UserProfile(
    completed: false,
    sex: Sex.male,
    age: 25,
    heightCm: 175,
    weightKg: 75,
    targetWeightKg: 0,
    level: FitnessLevel.beginner,
    lifestyle: Lifestyle.light,
    goal: Goal.recomposition,
    daysPerWeek: 3,
    equipment: Equipment.bodyweight,
    gymMember: false,
  );

  // ── Derived metrics ──────────────────────────────────────────

  /// Body Mass Index (kg/m²).
  double get bmi {
    final m = heightCm / 100.0;
    if (m <= 0) return 0;
    return weightKg / (m * m);
  }

  /// Basal Metabolic Rate (kcal/day) — Mifflin-St Jeor.
  int get bmr {
    final base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    final adj = switch (sex) { Sex.male => base + 5, Sex.female => base - 161 };
    return adj.round();
  }

  /// Total Daily Energy Expenditure (kcal/day) — BMR × lifestyle factor.
  int get tdee => (bmr * lifestyle.factor).round();

  /// Recommended daily calorie target, adjusted for the goal.
  int get dailyCalorieTarget => (tdee + goal.kcalDelta).clamp(1200, 5000);

  // ── Persistence ──────────────────────────────────────────────
  static const _kCompleted = 'profile_completed';
  static const _kSex = 'profile_sex';
  static const _kAge = 'profile_age';
  static const _kHeight = 'profile_height_cm';
  static const _kWeight = 'profile_weight_kg';
  static const _kTargetWeight = 'profile_target_weight_kg';
  static const _kLevel = 'profile_level';
  static const _kLifestyle = 'profile_lifestyle';
  static const _kGoal = 'profile_goal';
  static const _kDays = 'profile_days_per_week';
  static const _kEquipment = 'profile_equipment';
  static const _kGym = 'profile_gym_member';

  static T _parse<T extends Enum>(List<T> values, String? raw, T fallback) =>
      values.firstWhere((e) => e.name == raw, orElse: () => fallback);

  static Future<UserProfile> load() async {
    final p = await SharedPreferences.getInstance();
    return UserProfile(
      completed: p.getBool(_kCompleted) ?? false,
      sex: _parse(Sex.values, p.getString(_kSex), empty.sex),
      age: p.getInt(_kAge) ?? empty.age,
      heightCm: p.getInt(_kHeight) ?? empty.heightCm,
      weightKg: p.getDouble(_kWeight) ?? empty.weightKg,
      targetWeightKg: p.getDouble(_kTargetWeight) ?? empty.targetWeightKg,
      level: _parse(FitnessLevel.values, p.getString(_kLevel), empty.level),
      lifestyle: _parse(Lifestyle.values, p.getString(_kLifestyle), empty.lifestyle),
      goal: _parse(Goal.values, p.getString(_kGoal), empty.goal),
      daysPerWeek: p.getInt(_kDays) ?? empty.daysPerWeek,
      equipment: _parse(Equipment.values, p.getString(_kEquipment), empty.equipment),
      gymMember: p.getBool(_kGym) ?? empty.gymMember,
    );
  }

  Future<void> save() async {
    final p = await SharedPreferences.getInstance();
    await p.setBool(_kCompleted, completed);
    await p.setString(_kSex, sex.name);
    await p.setInt(_kAge, age);
    await p.setInt(_kHeight, heightCm);
    await p.setDouble(_kWeight, weightKg);
    await p.setDouble(_kTargetWeight, targetWeightKg);
    await p.setString(_kLevel, level.name);
    await p.setString(_kLifestyle, lifestyle.name);
    await p.setString(_kGoal, goal.name);
    await p.setInt(_kDays, daysPerWeek);
    await p.setString(_kEquipment, equipment.name);
    await p.setBool(_kGym, gymMember);
  }

  /// Wipes the saved profile (used on logout / account switch).
  static Future<void> clear() async {
    final p = await SharedPreferences.getInstance();
    for (final k in [
      _kCompleted, _kSex, _kAge, _kHeight, _kWeight, _kTargetWeight,
      _kLevel, _kLifestyle, _kGoal, _kDays, _kEquipment, _kGym,
    ]) {
      await p.remove(k);
    }
  }

  UserProfile copyWith({
    bool? completed,
    Sex? sex,
    int? age,
    int? heightCm,
    double? weightKg,
    double? targetWeightKg,
    FitnessLevel? level,
    Lifestyle? lifestyle,
    Goal? goal,
    int? daysPerWeek,
    Equipment? equipment,
    bool? gymMember,
  }) =>
      UserProfile(
        completed: completed ?? this.completed,
        sex: sex ?? this.sex,
        age: age ?? this.age,
        heightCm: heightCm ?? this.heightCm,
        weightKg: weightKg ?? this.weightKg,
        targetWeightKg: targetWeightKg ?? this.targetWeightKg,
        level: level ?? this.level,
        lifestyle: lifestyle ?? this.lifestyle,
        goal: goal ?? this.goal,
        daysPerWeek: daysPerWeek ?? this.daysPerWeek,
        equipment: equipment ?? this.equipment,
        gymMember: gymMember ?? this.gymMember,
      );
}
