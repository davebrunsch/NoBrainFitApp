import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'fitness_api_service.dart';

// Set via: flutter run --dart-define=FITNESS_API_KEY=your_key_here
const _fitnessApiKey = String.fromEnvironment('FITNESS_API_KEY', defaultValue: '');

/// Returns the real API-Ninjas service when FITNESS_API_KEY is set,
/// otherwise falls back to the local mock.
final fitnessApiServiceProvider = Provider<FitnessApiService>((ref) {
  if (_fitnessApiKey.isNotEmpty) {
    return RealFitnessApiService(apiKey: _fitnessApiKey);
  }
  return const MockFitnessApiService();
});
