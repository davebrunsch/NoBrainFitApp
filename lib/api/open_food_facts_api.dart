import 'package:dio/dio.dart';
import 'package:no_brain_fit/api/models/food_product.dart';

/// Exception levée lorsqu'un appel à l'API OpenFoodFacts échoue.
class FoodApiException implements Exception {
  final String message;
  const FoodApiException(this.message);

  @override
  String toString() => 'FoodApiException: $message';
}

/// Client pour l'API publique et gratuite OpenFoodFacts.
///
/// Aucune clé n'est nécessaire. OpenFoodFacts demande seulement un
/// User-Agent identifiant l'application appelante.
///
/// Docs : https://openfoodfacts.github.io/openfoodfacts-server/api/
class OpenFoodFactsApi {
  final Dio _dio;

  OpenFoodFactsApi({Dio? dio})
      : _dio = dio ??
            Dio(BaseOptions(
              connectTimeout: const Duration(seconds: 10),
              receiveTimeout: const Duration(seconds: 10),
              headers: const {
                'User-Agent': 'NoBrainFit/1.0 (flutter app)',
              },
            ));

  static const _searchUrl =
      'https://world.openfoodfacts.org/cgi/search.pl';
  static const _productUrl =
      'https://world.openfoodfacts.org/api/v2/product';

  /// Recherche des produits par texte libre (nom, marque…).
  ///
  /// Renvoie au plus [pageSize] produits ayant un nom exploitable,
  /// triés par popularité (par défaut côté API).
  Future<List<FoodProduct>> search(String query, {int pageSize = 20}) async {
    final q = query.trim();
    if (q.isEmpty) return const [];

    try {
      final res = await _dio.get(
        _searchUrl,
        queryParameters: {
          'search_terms': q,
          'search_simple': 1,
          'action': 'process',
          'json': 1,
          'page_size': pageSize,
          // On limite la charge réseau aux seuls champs utilisés.
          'fields':
              'code,product_name,product_name_fr,generic_name,generic_name_fr,'
                  'brands,image_front_small_url,image_small_url,image_url,nutriments',
        },
      );

      final data = res.data;
      final products = data is Map ? data['products'] : null;
      if (products is! List) return const [];

      return products
          .whereType<Map>()
          .map((p) => FoodProduct.fromJson(Map<String, dynamic>.from(p)))
          .whereType<FoodProduct>()
          .toList();
    } on DioException catch (e) {
      throw FoodApiException(_friendlyError(e));
    }
  }

  /// Récupère un produit unique à partir de son code-barres.
  ///
  /// Renvoie `null` si le code-barres est inconnu de la base.
  Future<FoodProduct?> getByBarcode(String barcode) async {
    final code = barcode.trim();
    if (code.isEmpty) return null;

    try {
      final res = await _dio.get(
        '$_productUrl/$code.json',
        queryParameters: const {
          'fields':
              'code,product_name,product_name_fr,generic_name,generic_name_fr,'
                  'brands,image_front_small_url,image_small_url,image_url,nutriments',
        },
      );

      final data = res.data;
      if (data is! Map) return null;
      // status == 1 quand le produit existe, 0 sinon.
      if (data['status'] != 1) return null;
      final product = data['product'];
      if (product is! Map) return null;

      return FoodProduct.fromJson(Map<String, dynamic>.from(product));
    } on DioException catch (e) {
      throw FoodApiException(_friendlyError(e));
    }
  }

  String _friendlyError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.sendTimeout:
        return 'Connexion trop lente. Réessaie.';
      case DioExceptionType.connectionError:
        return 'Pas de connexion internet.';
      default:
        return 'Service indisponible. Réessaie plus tard.';
    }
  }
}
