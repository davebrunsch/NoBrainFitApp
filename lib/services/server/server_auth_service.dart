import 'package:dio/dio.dart';

/// Result of a successful authentication against the NoBrainFit back-end.
class ServerSession {
  const ServerSession({required this.token, required this.email, required this.name});
  final String token;
  final String email;
  final String name;
}

/// Talks to `POST /api/app/auth` (login / register) on the NoBrainFit server.
class ServerAuthService {
  ServerAuthService({required this.baseUrl})
      : _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 20),
          // Don't throw on 4xx — we read the error body ourselves.
          validateStatus: (s) => s != null && s < 500,
        ));

  final String baseUrl;
  final Dio _dio;

  Future<ServerSession> login({required String email, required String password}) =>
      _auth({'action': 'login', 'email': email, 'password': password});

  Future<ServerSession> register({
    required String email,
    required String password,
    required String name,
  }) =>
      _auth({'action': 'register', 'email': email, 'password': password, 'name': name});

  Future<ServerSession> _auth(Map<String, dynamic> body) async {
    final res = await _dio.post('/api/app/auth', data: body);
    final data = res.data as Map<String, dynamic>;

    if (res.statusCode == null || res.statusCode! >= 400) {
      throw Exception(data['error']?.toString() ?? 'Échec de la connexion (${res.statusCode})');
    }

    final user = (data['user'] as Map<String, dynamic>?) ?? const {};
    return ServerSession(
      token: data['token'] as String? ?? '',
      email: user['email'] as String? ?? '',
      name: user['name'] as String? ?? user['email'] as String? ?? '',
    );
  }
}
