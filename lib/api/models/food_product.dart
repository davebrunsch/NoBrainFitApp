/// Modèle représentant un produit alimentaire issu de l'API OpenFoodFacts.
///
/// Toutes les valeurs nutritionnelles sont exprimées pour 100 g / 100 ml,
/// conformément à la convention OpenFoodFacts.
class FoodProduct {
  final String barcode;
  final String name;
  final String? brand;
  final String? imageUrl;
  final double? kcalPer100g;
  final double? proteinsPer100g;
  final double? carbsPer100g;
  final double? fatPer100g;

  const FoodProduct({
    required this.barcode,
    required this.name,
    this.brand,
    this.imageUrl,
    this.kcalPer100g,
    this.proteinsPer100g,
    this.carbsPer100g,
    this.fatPer100g,
  });

  /// Indique si le produit a au moins une donnée énergétique exploitable.
  bool get hasNutrition => kcalPer100g != null;

  /// Construit un [FoodProduct] depuis un objet `product` OpenFoodFacts.
  ///
  /// Renvoie `null` si l'entrée n'a pas de nom exploitable (produits
  /// incomplets fréquents dans la base communautaire).
  static FoodProduct? fromJson(Map<String, dynamic> json) {
    final name = _firstNonEmpty([
      json['product_name_fr'],
      json['product_name'],
      json['generic_name_fr'],
      json['generic_name'],
    ]);
    if (name == null) return null;

    final code = (json['code'] ?? json['_id'])?.toString() ?? '';
    final nutriments = json['nutriments'];
    final n = nutriments is Map ? nutriments : const {};

    return FoodProduct(
      barcode: code,
      name: name,
      brand: _firstNonEmpty([json['brands']]),
      imageUrl: _firstNonEmpty([
        json['image_front_small_url'],
        json['image_small_url'],
        json['image_url'],
      ]),
      kcalPer100g: _toDouble(n['energy-kcal_100g']),
      proteinsPer100g: _toDouble(n['proteins_100g']),
      carbsPer100g: _toDouble(n['carbohydrates_100g']),
      fatPer100g: _toDouble(n['fat_100g']),
    );
  }

  /// Estime les kcal pour une portion donnée (en grammes).
  int? kcalForPortion(double grams) {
    if (kcalPer100g == null) return null;
    return (kcalPer100g! * grams / 100).round();
  }

  static String? _firstNonEmpty(List<dynamic> values) {
    for (final v in values) {
      if (v is String && v.trim().isNotEmpty) return v.trim();
    }
    return null;
  }

  static double? _toDouble(dynamic v) {
    if (v == null) return null;
    if (v is num) return v.toDouble();
    if (v is String) return double.tryParse(v.replaceAll(',', '.'));
    return null;
  }
}
