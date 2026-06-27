import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/screens/home_screen.dart';
import 'package:no_brain_fit/screens/eat/eat_flow.dart';
import 'package:no_brain_fit/screens/train/train_flow.dart';
import 'package:no_brain_fit/screens/train/rag_train_flow.dart';
import 'package:no_brain_fit/screens/cook/cook_flow.dart';
import 'package:no_brain_fit/screens/settings/settings_screen.dart';
import 'package:no_brain_fit/screens/library/library_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (c, s) => const HomeScreen()),
    GoRoute(path: '/eat', builder: (c, s) => const EatFlow()),
    GoRoute(path: '/train', builder: (c, s) => const TrainFlow()),
    GoRoute(path: '/train/rag', builder: (c, s) => const RagTrainFlow()),
    GoRoute(path: '/cook', builder: (c, s) => const CookFlow()),
    GoRoute(path: '/settings', builder: (c, s) => const SettingsScreen()),
    GoRoute(path: '/library', builder: (c, s) => const LibraryScreen()),
  ],
);
