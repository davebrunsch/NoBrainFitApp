import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'nutrition_models.dart';

/// Local-first nutrition storage: profile + logged food entries
/// (SharedPreferences, JSON). Mirrors the library/training storage approach.
class NutritionService {
  static const _kEntries    = 'nutrition_entries';
  static const _kGoal       = 'nutrition_goal';
  static const _kWeight     = 'nutrition_weight';
  static const _kProfileSet = 'nutrition_profile_set';
  static const _maxEntries  = 1000;

  // ── Profile ─────────────────────────────────────────────────────────────────

  Future<NutritionProfile> profile() async {
    final p = await SharedPreferences.getInstance();
    return NutritionProfile(
      goal: NutritionGoal.fromName(p.getString(_kGoal)),
      weightKg: p.getDouble(_kWeight) ?? NutritionProfile.defaults.weightKg,
      isSet: p.getBool(_kProfileSet) ?? false,
    );
  }

  Future<void> saveProfile(NutritionProfile profile) async {
    final p = await SharedPreferences.getInstance();
    await p.setString(_kGoal, profile.goal.name);
    await p.setDouble(_kWeight, profile.weightKg);
    await p.setBool(_kProfileSet, true);
  }

  // ── Entries ──────────────────────────────────────────────────────────────────

  Future<List<FoodEntry>> entries() async {
    final p = await SharedPreferences.getInstance();
    final raw = p.getString(_kEntries);
    if (raw == null || raw.isEmpty) return [];
    try {
      return (jsonDecode(raw) as List)
          .map((e) => FoodEntry.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> _writeEntries(List<FoodEntry> list) async {
    final p = await SharedPreferences.getInstance();
    await p.setString(_kEntries, jsonEncode(list.map((e) => e.toJson()).toList()));
  }

  static bool _sameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  Future<List<FoodEntry>> entriesForDay(DateTime day) async {
    final all = await entries();
    return all.where((e) => _sameDay(e.loggedAt, day)).toList();
  }

  Future<void> add(FoodEntry entry) async {
    final list = await entries();
    list.insert(0, entry);
    if (list.length > _maxEntries) list.removeRange(_maxEntries, list.length);
    await _writeEntries(list);
  }

  Future<void> remove(String id) async {
    final list = await entries();
    list.removeWhere((e) => e.id == id);
    await _writeEntries(list);
  }

  Future<DayTotals> totalsForDay(DateTime day) async {
    final list = await entriesForDay(day);
    var kcal = 0, prot = 0, carbs = 0, fat = 0;
    for (final e in list) {
      kcal += e.kcal;
      prot += e.proteinG;
      carbs += e.carbsG;
      fat += e.fatG;
    }
    return DayTotals(kcal: kcal, proteinG: prot, carbsG: carbs, fatG: fat);
  }
}
