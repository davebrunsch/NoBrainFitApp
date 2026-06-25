import 'dart:convert';
import 'ai_service.dart';

WorkoutPlan parseWorkout(String raw) {
  final json = jsonDecode(extractJson(raw)) as Map<String, dynamic>;
  final exList = (json['exercises'] as List).map((e) => Exercise(
    name: e['name'] as String,
    detail: e['detail'] as String,
  )).toList();
  return WorkoutPlan(title: json['title'] as String, exercises: exList);
}

RecipeSuggestions parseRecipes(String raw) {
  final json = jsonDecode(extractJson(raw)) as Map<String, dynamic>;
  final recipes = (json['recipes'] as List).map((r) => Recipe(
    name:    r['name']     as String,
    timeMin: r['time_min'] as int,
    kcal:    r['kcal']     as int,
    protG:   r['prot_g']   as int,
  )).toList();
  final shopping = (json['shopping_list'] as List).cast<String>();
  return RecipeSuggestions(recipes: recipes, shoppingList: shopping);
}

String extractJson(String raw) {
  final s = raw.trim();
  final fence = RegExp(r'```(?:json)?\s*([\s\S]*?)```');
  final m = fence.firstMatch(s);
  return m != null ? m.group(1)!.trim() : s;
}
