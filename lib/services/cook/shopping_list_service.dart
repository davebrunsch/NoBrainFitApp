import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class ShoppingItem {
  const ShoppingItem({required this.label, required this.checked});
  final String label;
  final bool checked;

  ShoppingItem copyWith({bool? checked}) => ShoppingItem(label: label, checked: checked ?? this.checked);

  Map<String, dynamic> toJson() => {'label': label, 'checked': checked};
  factory ShoppingItem.fromJson(Map<String, dynamic> j) =>
      ShoppingItem(label: j['label'] as String? ?? '', checked: j['checked'] as bool? ?? false);
}

/// Persistent shopping list (SharedPreferences). Items added from generated
/// recipes accumulate here and survive navigation.
class ShoppingListService {
  static const _key = 'shopping_list';

  Future<List<ShoppingItem>> items() async {
    final p = await SharedPreferences.getInstance();
    final raw = p.getString(_key);
    if (raw == null || raw.isEmpty) return [];
    try {
      return (jsonDecode(raw) as List).map((e) => ShoppingItem.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> _write(List<ShoppingItem> list) async {
    final p = await SharedPreferences.getInstance();
    await p.setString(_key, jsonEncode(list.map((e) => e.toJson()).toList()));
  }

  /// Appends labels, skipping ones already present (case-insensitive).
  /// Returns the number actually added.
  Future<int> addAll(List<String> labels) async {
    final list = await items();
    final existing = list.map((i) => i.label.toLowerCase()).toSet();
    var added = 0;
    for (final l in labels) {
      final label = l.trim();
      if (label.isEmpty || existing.contains(label.toLowerCase())) continue;
      list.add(ShoppingItem(label: label, checked: false));
      existing.add(label.toLowerCase());
      added++;
    }
    await _write(list);
    return added;
  }

  Future<void> toggle(int index) async {
    final list = await items();
    if (index < 0 || index >= list.length) return;
    list[index] = list[index].copyWith(checked: !list[index].checked);
    await _write(list);
  }

  Future<void> removeChecked() async {
    final list = await items();
    list.removeWhere((i) => i.checked);
    await _write(list);
  }

  Future<void> clear() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(_key);
  }
}
