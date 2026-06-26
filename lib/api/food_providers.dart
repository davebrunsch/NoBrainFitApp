import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:no_brain_fit/api/open_food_facts_api.dart';
import 'package:no_brain_fit/api/models/food_product.dart';

/// Instance partagée du client OpenFoodFacts.
final foodApiProvider = Provider<OpenFoodFactsApi>((ref) {
  return OpenFoodFactsApi();
});

/// Recherche d'aliments par texte libre.
///
/// `family` permet de mettre en cache le résultat par requête et d'exposer
/// automatiquement les états loading / error / data au widget.
final foodSearchProvider =
    FutureProvider.family<List<FoodProduct>, String>((ref, query) async {
  final api = ref.watch(foodApiProvider);
  return api.search(query);
});
