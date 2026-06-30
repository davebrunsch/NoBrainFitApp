import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:no_brain_fit/services/ai/ai_provider.dart';
import 'package:no_brain_fit/services/nutrition/nutrition_models.dart';
import 'package:no_brain_fit/services/nutrition/nutrition_service.dart';
import 'package:no_brain_fit/utils/brand.dart';

/// Log a food item: describe it, let the AI estimate macros, edit, save.
class LogFoodScreen extends ConsumerStatefulWidget {
  const LogFoodScreen({super.key, this.initialMealType});
  final String? initialMealType;

  @override
  ConsumerState<LogFoodScreen> createState() => _LogFoodScreenState();
}

class _LogFoodScreenState extends ConsumerState<LogFoodScreen> {
  static const _meals = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'];

  final _descCtrl  = TextEditingController();
  final _nameCtrl  = TextEditingController();
  final _kcalCtrl  = TextEditingController();
  final _protCtrl  = TextEditingController();
  final _carbsCtrl = TextEditingController();
  final _fatCtrl   = TextEditingController();

  late String _mealType = widget.initialMealType ?? 'Déjeuner';
  bool _estimating = false;
  bool _hasValues = false;
  String? _error;

  @override
  void dispose() {
    _descCtrl.dispose(); _nameCtrl.dispose(); _kcalCtrl.dispose();
    _protCtrl.dispose(); _carbsCtrl.dispose(); _fatCtrl.dispose();
    super.dispose();
  }

  Future<void> _estimate() async {
    final desc = _descCtrl.text.trim();
    if (desc.isEmpty) return;
    final service = ref.read(aiServiceProvider);
    if (service == null) {
      setState(() => _error = 'Aucun backend IA configuré. Saisis les valeurs manuellement.');
      return;
    }
    setState(() { _estimating = true; _error = null; });
    try {
      final est = await service.estimateFood(description: desc);
      _nameCtrl.text  = est.name.isEmpty ? desc : est.name;
      _kcalCtrl.text  = est.kcal.toString();
      _protCtrl.text  = est.proteinG.toString();
      _carbsCtrl.text = est.carbsG.toString();
      _fatCtrl.text   = est.fatG.toString();
      setState(() => _hasValues = true);
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _estimating = false);
    }
  }

  int _int(TextEditingController c) => int.tryParse(c.text.trim()) ?? 0;

  Future<void> _save() async {
    final name = _nameCtrl.text.trim().isNotEmpty ? _nameCtrl.text.trim() : _descCtrl.text.trim();
    if (name.isEmpty) {
      setState(() => _error = 'Décris l\'aliment ou donne-lui un nom.');
      return;
    }
    await NutritionService().add(FoodEntry(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      name: name,
      mealType: _mealType,
      kcal: _int(_kcalCtrl),
      proteinG: _int(_protCtrl),
      carbsG: _int(_carbsCtrl),
      fatG: _int(_fatCtrl),
      loggedAt: DateTime.now(),
    ));
    if (mounted) Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Brand.bgVoid,
      body: SafeArea(
        child: Column(
          children: [
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
                const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('NUTRITION', style: Brand.labelMono),
                  Text('Ajouter un aliment', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w600, letterSpacing: -.3, color: Brand.white)),
                ]),
              ]),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s24, Brand.s20, Brand.s20),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('REPAS', style: Brand.labelMono),
                  const SizedBox(height: Brand.s8),
                  Wrap(spacing: 6, runSpacing: 6, children: _meals.map((m) {
                    final sel = _mealType == m;
                    return GestureDetector(
                      onTap: () => setState(() => _mealType = m),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: sel ? Brand.lime.withOpacity(.12) : Brand.bgCard,
                          borderRadius: BorderRadius.circular(Brand.rChip),
                          border: Border.all(color: sel ? Brand.lime : Brand.border2),
                        ),
                        child: Text(m, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: sel ? Brand.lime : Brand.grey1)),
                      ),
                    );
                  }).toList()),
                  const SizedBox(height: Brand.s20),
                  const Text('DÉCRIS CE QUE TU AS MANGÉ', style: Brand.labelMono),
                  const SizedBox(height: Brand.s8),
                  TextField(
                    controller: _descCtrl,
                    maxLines: 2,
                    style: const TextStyle(fontSize: 14, color: Brand.white, fontFamily: 'SpaceGrotesk'),
                    decoration: InputDecoration(
                      hintText: 'ex : 150g de poulet, un bol de riz, salade',
                      hintStyle: const TextStyle(color: Brand.grey2, fontSize: 13),
                      filled: true,
                      fillColor: Brand.bgCard,
                      contentPadding: const EdgeInsets.all(14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(Brand.rChip), borderSide: BorderSide(color: Brand.border)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Brand.rChip), borderSide: BorderSide(color: Brand.border)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Brand.rChip), borderSide: const BorderSide(color: Brand.lime, width: 1.5)),
                    ),
                  ),
                  const SizedBox(height: Brand.s8),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _estimating ? null : _estimate,
                      icon: _estimating
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Brand.lime))
                          : const Icon(Icons.auto_awesome_rounded, size: 16, color: Brand.lime),
                      label: Text(_estimating ? 'Estimation…' : 'Estimer avec l\'IA', style: const TextStyle(color: Brand.lime)),
                      style: OutlinedButton.styleFrom(side: BorderSide(color: Brand.lime.withOpacity(.4)), padding: const EdgeInsets.symmetric(vertical: 13)),
                    ),
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: Brand.s8),
                    Text(_error!, style: const TextStyle(fontSize: 12, color: Brand.orange)),
                  ],
                  const SizedBox(height: Brand.s20),
                  const Text('VALEURS (MODIFIABLES)', style: Brand.labelMono),
                  const SizedBox(height: Brand.s8),
                  _NumField(label: 'Nom', ctrl: _nameCtrl, isText: true),
                  const SizedBox(height: Brand.s8),
                  Row(children: [
                    Expanded(child: _NumField(label: 'kcal', ctrl: _kcalCtrl)),
                    const SizedBox(width: Brand.s8),
                    Expanded(child: _NumField(label: 'Prot. (g)', ctrl: _protCtrl)),
                  ]),
                  const SizedBox(height: Brand.s8),
                  Row(children: [
                    Expanded(child: _NumField(label: 'Gluc. (g)', ctrl: _carbsCtrl)),
                    const SizedBox(width: Brand.s8),
                    Expanded(child: _NumField(label: 'Lip. (g)', ctrl: _fatCtrl)),
                  ]),
                ]),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(Brand.s20, 0, Brand.s20, Brand.s20),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Brand.lime,
                    foregroundColor: Brand.bgVoid,
                    padding: const EdgeInsets.symmetric(vertical: Brand.s16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rButton)),
                  ),
                  child: Text(_hasValues ? 'Enregistrer' : 'Enregistrer manuellement',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NumField extends StatelessWidget {
  const _NumField({required this.label, required this.ctrl, this.isText = false});
  final String label;
  final TextEditingController ctrl;
  final bool isText;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: ctrl,
      keyboardType: isText ? TextInputType.text : TextInputType.number,
      style: const TextStyle(fontSize: 14, color: Brand.white, fontFamily: 'SpaceGrotesk'),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Brand.grey2, fontSize: 12),
        filled: true,
        fillColor: Brand.bgCard,
        contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(Brand.rChip), borderSide: BorderSide(color: Brand.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Brand.rChip), borderSide: BorderSide(color: Brand.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Brand.rChip), borderSide: const BorderSide(color: Brand.lime, width: 1.5)),
      ),
    );
  }
}
