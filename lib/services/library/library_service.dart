import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'library_models.dart';

/// Local-first storage for workout history and saved programs.
/// Backed by SharedPreferences (JSON lists) — no extra dependency, works
/// regardless of the active AI backend.
class LibraryService {
  static const _kHistory = 'workout_history';
  static const _kSaved   = 'saved_workouts';
  static const _maxHistory = 100;

  Future<List<T>> _read<T>(String key, T Function(Map<String, dynamic>) fromJson) async {
    final p = await SharedPreferences.getInstance();
    final raw = p.getString(key);
    if (raw == null || raw.isEmpty) return [];
    try {
      final list = jsonDecode(raw) as List;
      return list.map((e) => fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> _write(String key, List<Map<String, dynamic>> data) async {
    final p = await SharedPreferences.getInstance();
    await p.setString(key, jsonEncode(data));
  }

  // ── History ────────────────────────────────────────────────────────────────

  Future<List<WorkoutHistoryEntry>> history() =>
      _read(_kHistory, WorkoutHistoryEntry.fromJson);

  Future<void> addHistory(WorkoutHistoryEntry entry) async {
    final list = await history();
    list.insert(0, entry);
    if (list.length > _maxHistory) list.removeRange(_maxHistory, list.length);
    await _write(_kHistory, list.map((e) => e.toJson()).toList());
  }

  Future<void> clearHistory() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(_kHistory);
  }

  // ── Saved programs ───────────────────────────────────────────────────────────

  Future<List<SavedWorkout>> saved() => _read(_kSaved, SavedWorkout.fromJson);

  Future<void> save(SavedWorkout workout) async {
    final list = await saved();
    list.insert(0, workout);
    await _write(_kSaved, list.map((e) => e.toJson()).toList());
  }

  Future<void> removeSaved(String id) async {
    final list = await saved();
    list.removeWhere((w) => w.id == id);
    await _write(_kSaved, list.map((e) => e.toJson()).toList());
  }
}
