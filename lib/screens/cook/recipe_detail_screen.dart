import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:no_brain_fit/services/ai/ai_provider.dart';
import 'package:no_brain_fit/services/ai/ai_service.dart';
import 'package:no_brain_fit/services/nutrition/nutrition_models.dart';
import 'package:no_brain_fit/services/nutrition/nutrition_service.dart';
import 'package:no_brain_fit/utils/brand.dart';

/// Full recipe: AI-generated ingredients + steps, with a one-tap
/// "log to nutrition" shortcut (cross-pillar).
class RecipeDetailScreen extends ConsumerStatefulWidget {
  const RecipeDetailScreen({super.key, required this.recipe, required this.portions});
  final Recipe recipe;
  final String portions;

  @override
  ConsumerState<RecipeDetailScreen> createState() => _RecipeDetailScreenState();
}

class _RecipeDetailScreenState extends ConsumerState<RecipeDetailScreen> {
  RecipeDetail? _detail;
  bool _loading = true;
  String? _error;
  bool _logged = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final service = ref.read(aiServiceProvider);
    if (service == null) {
      setState(() { _loading = false; _error = 'Aucun backend IA configuré. Vérifie les Paramètres.'; });
      return;
    }
    try {
      final d = await service.generateRecipeDetail(name: widget.recipe.name, portions: widget.portions);
      if (mounted) setState(() { _detail = d; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _loading = false; _error = e.toString().replaceFirst('Exception: ', ''); });
    }
  }

  Future<void> _logToNutrition() async {
    final r = widget.recipe;
    await NutritionService().add(FoodEntry(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      name: r.name,
      mealType: 'Repas',
      kcal: r.kcal,
      proteinG: r.protG,
      carbsG: r.carbsG,
      fatG: r.fatG,
      loggedAt: DateTime.now(),
    ));
    if (!mounted) return;
    setState(() => _logged = true);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: const Text('Ajouté à ton suivi nutrition'),
      backgroundColor: Brand.bgCard,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rChip)),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.recipe;
    return Scaffold(
      backgroundColor: Brand.bgVoid,
      body: SafeArea(
        child: Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s16, Brand.s20, 0),
            child: Row(children: [
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 38, height: 38,
                  decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rButton), border: Border.all(color: Brand.border2)),
                  child: const Icon(Icons.arrow_back_rounded, size: 20, color: Brand.white),
                ),
              ),
              const SizedBox(width: Brand.s12),
              const Text('RECETTE', style: Brand.labelMono),
            ]),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s16, Brand.s20, Brand.s20),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(r.name, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w700, letterSpacing: -.8, color: Brand.white)),
                const SizedBox(height: Brand.s12),
                Wrap(spacing: 6, runSpacing: 6, children: [
                  _Tag('${r.timeMin} min', Brand.orange),
                  _Tag('${r.kcal} kcal', Brand.orange),
                  _Tag('P ${r.protG}g', Brand.lime),
                  _Tag('G ${r.carbsG}g', Brand.blue),
                  _Tag('L ${r.fatG}g', Brand.orange),
                ]),
                const SizedBox(height: Brand.s20),
                if (_loading)
                  const _LoadingBlock()
                else if (_error != null)
                  _ErrorBlock(message: _error!)
                else if (_detail != null) ...[
                  _Section(title: 'Ingrédients · ${widget.portions}', items: _detail!.ingredients, numbered: false, accent: Brand.orange),
                  const SizedBox(height: Brand.s16),
                  _Section(title: 'Préparation', items: _detail!.steps, numbered: true, accent: Brand.orange),
                ],
              ]),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(Brand.s20, 0, Brand.s20, Brand.s20),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _logged ? null : _logToNutrition,
                icon: Icon(_logged ? Icons.check_rounded : Icons.add_rounded, size: 18),
                label: Text(_logged ? 'Ajouté au suivi' : 'J\'ai cuisiné ça',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _logged ? Brand.bgCard : Brand.lime,
                  foregroundColor: _logged ? Brand.lime : Brand.bgVoid,
                  padding: const EdgeInsets.symmetric(vertical: Brand.s16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rButton)),
                ),
              ),
            ),
          ),
        ]),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag(this.text, this.color);
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(.12),
        borderRadius: BorderRadius.circular(Brand.rChip),
        border: Border.all(color: color.withOpacity(.25)),
      ),
      child: Text(text, style: Brand.mono(size: 11, weight: FontWeight.w700, color: color)),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.items, required this.numbered, required this.accent});
  final String title;
  final List<String> items;
  final bool numbered;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Brand.s16),
      decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rCard), border: Border.all(color: Brand.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.white)),
        const SizedBox(height: Brand.s12),
        ...items.asMap().entries.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: Brand.s8),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                if (numbered)
                  Container(
                    width: 22, height: 22, alignment: Alignment.center,
                    decoration: BoxDecoration(color: accent.withOpacity(.12), borderRadius: BorderRadius.circular(6)),
                    child: Text('${e.key + 1}', style: Brand.mono(size: 11, weight: FontWeight.w700, color: accent)),
                  )
                else
                  Padding(padding: const EdgeInsets.only(top: 5), child: Icon(Icons.circle, size: 6, color: accent)),
                const SizedBox(width: Brand.s12),
                Expanded(child: Text(e.value, style: const TextStyle(fontSize: 13, color: Brand.grey1, height: 1.45))),
              ]),
            )),
      ]),
    );
  }
}

class _LoadingBlock extends StatelessWidget {
  const _LoadingBlock();
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Brand.s24),
      decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rCard), border: Border.all(color: Brand.border)),
      child: const Center(child: Column(children: [
        CircularProgressIndicator(color: Brand.orange, strokeWidth: 2),
        SizedBox(height: Brand.s16),
        Text('Le chef prépare la recette…', style: TextStyle(fontSize: 13, color: Brand.grey1)),
      ])),
    );
  }
}

class _ErrorBlock extends StatelessWidget {
  const _ErrorBlock({required this.message});
  final String message;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Brand.s16),
      decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rCard), border: Border.all(color: Brand.orange.withOpacity(.3))),
      child: Text(message, style: const TextStyle(fontSize: 13, color: Brand.grey1)),
    );
  }
}
