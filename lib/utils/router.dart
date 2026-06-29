import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/screens/home_screen.dart';
import 'package:no_brain_fit/screens/auth/auth_screen.dart';
import 'package:no_brain_fit/screens/onboarding/onboarding_flow.dart';
import 'package:no_brain_fit/screens/eat/nutrition_dashboard.dart';
import 'package:no_brain_fit/screens/train/train_flow.dart';
import 'package:no_brain_fit/screens/train/rag_train_flow.dart';
import 'package:no_brain_fit/screens/cook/cook_flow.dart';
import 'package:no_brain_fit/screens/settings/settings_screen.dart';
import 'package:no_brain_fit/screens/library/library_screen.dart';
import 'package:no_brain_fit/services/ai/ai_provider.dart';
import 'package:no_brain_fit/services/profile/profile_provider.dart';

/// Splash shown while auth/profile state is still loading from disk.
class _Splash extends StatelessWidget {
  const _Splash();
  @override
  Widget build(BuildContext context) => const ColoredBox(
        color: Brand.bgVoid,
        child: Center(
          child: CircularProgressIndicator(color: Brand.lume),
        ),
      );
}

/// The app router. Gates the whole app behind authentication and a completed
/// onboarding profile:
///   not logged in            → `/auth`
///   logged in, no profile    → `/onboarding`
///   logged in + onboarded    → the app
final routerProvider = Provider<GoRouter>((ref) {
  // Re-run the redirect whenever auth or profile state changes, without
  // rebuilding the GoRouter itself (which would reset navigation).
  final refresh = ValueNotifier(0);
  ref.listen(aiConfigProvider, (_, __) => refresh.value++);
  ref.listen(userProfileProvider, (_, __) => refresh.value++);
  ref.onDispose(refresh.dispose);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: refresh,
    redirect: (context, state) {
      final config = ref.read(aiConfigProvider);
      final profile = ref.read(userProfileProvider);

      // Still loading from disk → hold on the splash.
      if (!config.hasValue || !profile.hasValue) {
        return state.matchedLocation == '/splash' ? null : '/splash';
      }

      final loggedIn = config.requireValue.serverReady;
      final onboarded = profile.requireValue.completed;
      final loc = state.matchedLocation;

      if (!loggedIn) return loc == '/auth' ? null : '/auth';
      if (!onboarded) return loc == '/onboarding' ? null : '/onboarding';

      // Authenticated & onboarded — keep them out of the gate screens.
      if (loc == '/auth' || loc == '/splash') return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (c, s) => const _Splash()),
      GoRoute(path: '/auth', builder: (c, s) => const AuthScreen()),
      GoRoute(path: '/onboarding', builder: (c, s) => const OnboardingFlow()),
      GoRoute(path: '/', builder: (c, s) => const HomeScreen()),
      GoRoute(path: '/eat', builder: (c, s) => const NutritionDashboard()),
      GoRoute(path: '/train', builder: (c, s) => const TrainFlow()),
      GoRoute(path: '/train/rag', builder: (c, s) => const RagTrainFlow()),
      GoRoute(path: '/cook', builder: (c, s) => const CookFlow()),
      GoRoute(path: '/settings', builder: (c, s) => const SettingsScreen()),
      GoRoute(path: '/library', builder: (c, s) => const LibraryScreen()),
    ],
  );
});
