/// Daily nutrition goal — drives the computed targets.
enum NutritionGoal {
  lose,
  maintain,
  gain;

  String get label => switch (this) {
        NutritionGoal.lose => 'Perte de poids',
        NutritionGoal.maintain => 'Maintien',
        NutritionGoal.gain => 'Prise de masse',
      };

  static NutritionGoal fromName(String? n) =>
      NutritionGoal.values.firstWhere((g) => g.name == n, orElse: () => NutritionGoal.maintain);
}

/// Computed daily targets (kcal + macros in grams).
class NutritionTargets {
  const NutritionTargets({
    required this.kcal,
    required this.proteinG,
    required this.carbsG,
    required this.fatG,
  });

  final int kcal;
  final int proteinG;
  final int carbsG;
  final int fatG;
}

/// User nutrition profile, persisted locally. Targets are derived from it.
class NutritionProfile {
  const NutritionProfile({required this.goal, required this.weightKg, required this.isSet});

  final NutritionGoal goal;
  final double weightKg;
  final bool isSet; // false until the user completes setup

  static const defaults = NutritionProfile(goal: NutritionGoal.maintain, weightKg: 70, isSet: false);

  /// Simple, transparent model: kcal/kg and macro split by goal.
  NutritionTargets get targets {
    final double w = weightKg.clamp(30, 250).toDouble();
    final kcalPerKg = switch (goal) {
      NutritionGoal.lose => 28.0,
      NutritionGoal.maintain => 33.0,
      NutritionGoal.gain => 38.0,
    };
    final protPerKg = switch (goal) {
      NutritionGoal.lose => 2.0,
      NutritionGoal.maintain => 1.8,
      NutritionGoal.gain => 2.0,
    };
    const fatPerKg = 0.9;

    final kcal = (w * kcalPerKg).round();
    final prot = (w * protPerKg).round();
    final fat = (w * fatPerKg).round();
    final carbs = ((kcal - prot * 4 - fat * 9) / 4).round().clamp(0, 1000);

    return NutritionTargets(kcal: kcal, proteinG: prot, carbsG: carbs, fatG: fat);
  }

  NutritionProfile copyWith({NutritionGoal? goal, double? weightKg, bool? isSet}) => NutritionProfile(
        goal: goal ?? this.goal,
        weightKg: weightKg ?? this.weightKg,
        isSet: isSet ?? this.isSet,
      );
}

/// A single logged food / meal item.
class FoodEntry {
  const FoodEntry({
    required this.id,
    required this.name,
    required this.mealType,
    required this.kcal,
    required this.proteinG,
    required this.carbsG,
    required this.fatG,
    required this.loggedAt,
  });

  final String id;
  final String name;
  final String mealType;
  final int kcal;
  final int proteinG;
  final int carbsG;
  final int fatG;
  final DateTime loggedAt;

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'mealType': mealType,
        'kcal': kcal,
        'proteinG': proteinG,
        'carbsG': carbsG,
        'fatG': fatG,
        'loggedAt': loggedAt.toIso8601String(),
      };

  factory FoodEntry.fromJson(Map<String, dynamic> j) => FoodEntry(
        id: j['id'] as String? ?? '',
        name: j['name'] as String? ?? '',
        mealType: j['mealType'] as String? ?? '',
        kcal: (j['kcal'] as num?)?.toInt() ?? 0,
        proteinG: (j['proteinG'] as num?)?.toInt() ?? 0,
        carbsG: (j['carbsG'] as num?)?.toInt() ?? 0,
        fatG: (j['fatG'] as num?)?.toInt() ?? 0,
        loggedAt: DateTime.tryParse(j['loggedAt'] as String? ?? '') ?? DateTime.now(),
      );
}

/// Sum of macros for a given day.
class DayTotals {
  const DayTotals({required this.kcal, required this.proteinG, required this.carbsG, required this.fatG});

  final int kcal;
  final int proteinG;
  final int carbsG;
  final int fatG;

  static const zero = DayTotals(kcal: 0, proteinG: 0, carbsG: 0, fatG: 0);
}
