import 'dart:convert';
import 'ai_service.dart';

WorkoutPlan parseWorkout(String raw) {
  final json = jsonDecode(extractJson(raw)) as Map<String, dynamic>;
  final exList = (json['exercises'] as List? ?? const []).map((e) => Exercise(
    name: _asString(e['name']),
    detail: _asString(e['detail']),
  )).toList();
  return WorkoutPlan(title: _asString(json['title']), exercises: exList);
}

RecipeSuggestions parseRecipes(String raw) {
  final json = jsonDecode(extractJson(raw)) as Map<String, dynamic>;
  final recipes = (json['recipes'] as List? ?? const []).map((r) => Recipe(
    name:    _asString(r['name']),
    timeMin: _asInt(r['time_min']),
    kcal:    _asInt(r['kcal']),
    protG:   _asInt(r['prot_g']),
  )).toList();
  final shopping = (json['shopping_list'] as List? ?? const [])
      .map(_asString)
      .toList();
  return RecipeSuggestions(recipes: recipes, shoppingList: shopping);
}

/// Extracts a JSON object from a raw LLM completion.
/// Handles ```json fenced blocks and any prose surrounding the object.
FoodEstimate parseFoodEstimate(String raw) {
  final json = jsonDecode(extractJson(raw)) as Map<String, dynamic>;
  return FoodEstimate(
    name:     _asString(json['name']),
    kcal:     _asInt(json['kcal']),
    proteinG: _asInt(json['prot_g']),
    carbsG:   _asInt(json['carbs_g']),
    fatG:     _asInt(json['fat_g']),
  );
}

String extractJson(String raw) {
  var s = raw.trim();
  final fence = RegExp(r'```(?:json)?\s*([\s\S]*?)```');
  final m = fence.firstMatch(s);
  if (m != null) s = m.group(1)!.trim();
  // Fallback: slice from the first { to the last } when the model wraps
  // the JSON in explanatory text despite instructions not to.
  if (!s.startsWith('{')) {
    final start = s.indexOf('{');
    final end = s.lastIndexOf('}');
    if (start != -1 && end > start) s = s.substring(start, end + 1);
  }
  return s;
}

// ── Coercion helpers ────────────────────────────────────────────────────────
// LLMs are inconsistent: a numeric field may come back as 480, 480.0 or "480".

String _asString(dynamic v) => v?.toString() ?? '';

int _asInt(dynamic v) {
  if (v is int) return v;
  if (v is num) return v.toInt();
  return int.tryParse(v?.toString().trim() ?? '') ?? 0;
}
