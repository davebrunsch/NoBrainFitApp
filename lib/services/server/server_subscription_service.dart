import 'package:dio/dio.dart';

/// Snapshot of the user's plan and remaining daily quota.
class ServerSubscription {
  const ServerSubscription({
    required this.planName,
    required this.status,
    required this.workoutsRemaining,
    required this.aiCallsRemaining,
    this.features = const [],
  });

  final String planName;
  final String status;
  final int workoutsRemaining; // -1 = unlimited
  final int aiCallsRemaining;  // -1 = unlimited

  /// Feature keys granted by the active plan (see admin/src/lib/features.ts).
  final List<String> features;

  /// Whether the active plan unlocks [feature].
  bool can(String feature) => features.contains(feature);
}

/// Reads `GET /api/app/subscription` (plan + today's usage).
class ServerSubscriptionService {
  ServerSubscriptionService({required this.baseUrl, required this.token})
      : _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          headers: {'Authorization': 'Bearer $token'},
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 15),
        ));

  final String baseUrl;
  final String token;
  final Dio _dio;

  Future<ServerSubscription> fetch() async {
    final res = await _dio.get('/api/app/subscription');
    final data = res.data as Map<String, dynamic>;
    final plan = (data['plan'] as Map<String, dynamic>?) ?? const {};
    final usage = (data['usage'] as Map<String, dynamic>?) ?? const {};
    final features = (data['features'] as List?)?.whereType<String>().toList() ?? const <String>[];
    return ServerSubscription(
      planName: plan['name'] as String? ?? 'Free',
      status: plan['status'] as String? ?? 'NONE',
      workoutsRemaining: (usage['workoutsRemaining'] as num?)?.toInt() ?? 0,
      aiCallsRemaining: (usage['aiCallsRemaining'] as num?)?.toInt() ?? 0,
      features: features,
    );
  }
}
