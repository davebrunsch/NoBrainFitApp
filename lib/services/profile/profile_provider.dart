import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:no_brain_fit/services/ai/ai_provider.dart';
import 'package:no_brain_fit/services/server/server_profile_service.dart';
import 'user_profile.dart';

/// Loads and persists the [UserProfile].
///
/// Local storage ([SharedPreferences]) is the source of truth for the UI;
/// the server copy is kept in sync best-effort so the profile follows the
/// user across devices / reinstalls.
class UserProfileNotifier extends AsyncNotifier<UserProfile> {
  @override
  Future<UserProfile> build() => UserProfile.load();

  /// Server profile client for the current session, or null when the user
  /// isn't authenticated against the server backend.
  ServerProfileService? _service() {
    final config = ref.read(aiConfigProvider).valueOrNull;
    if (config == null || !config.serverReady) return null;
    return ServerProfileService(
        baseUrl: config.serverBaseUrl, token: config.serverToken);
  }

  /// Persists [profile] locally, then pushes it to the server (best-effort).
  Future<void> save(UserProfile profile) async {
    await profile.save();
    state = AsyncData(profile);
    try {
      await _service()?.save(profile);
    } catch (_) {
      // Offline / server error → local copy stands, re-syncs on next save.
    }
  }

  /// Stores a profile locally without pushing it back to the server.
  /// Used after login when adopting the server's copy.
  Future<void> adopt(UserProfile profile) async {
    await profile.save();
    state = AsyncData(profile);
  }

  /// Clears the saved profile (e.g. on logout / account switch).
  Future<void> reset() async {
    await UserProfile.clear();
    state = const AsyncData(UserProfile.empty);
  }
}

final userProfileProvider =
    AsyncNotifierProvider<UserProfileNotifier, UserProfile>(
  UserProfileNotifier.new,
);
