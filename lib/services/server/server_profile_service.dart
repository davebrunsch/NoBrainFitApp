import 'package:dio/dio.dart';
import 'package:no_brain_fit/services/profile/user_profile.dart';

/// Reads / writes the user's fitness profile on the NoBrainFit server
/// (`GET` & `PUT /api/app/profile`), authenticated with the app JWT.
class ServerProfileService {
  ServerProfileService({required this.baseUrl, required this.token})
      : _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          headers: {'Authorization': 'Bearer $token'},
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 15),
        ));

  final String baseUrl;
  final String token;
  final Dio _dio;

  /// Fetches the stored profile, or null if the server returns none.
  Future<UserProfile?> fetch() async {
    final res = await _dio.get('/api/app/profile');
    final data = res.data as Map<String, dynamic>;
    final p = data['profile'] as Map<String, dynamic>?;
    return p == null ? null : UserProfile.fromJson(p);
  }

  /// Persists the profile server-side.
  Future<void> save(UserProfile profile) async {
    await _dio.put('/api/app/profile', data: profile.toJson());
  }
}
