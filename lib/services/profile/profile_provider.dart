import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'user_profile.dart';

/// Loads and persists the [UserProfile] from local storage.
class UserProfileNotifier extends AsyncNotifier<UserProfile> {
  @override
  Future<UserProfile> build() => UserProfile.load();

  /// Persists [profile] and updates the in-memory state.
  Future<void> save(UserProfile profile) async {
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
