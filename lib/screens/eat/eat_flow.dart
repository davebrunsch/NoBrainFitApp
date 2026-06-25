import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/widgets/flow_scaffold.dart';
import 'package:no_brain_fit/widgets/choice_grid.dart';
import 'package:no_brain_fit/screens/eat/eat_result_screen.dart';

class EatFlow extends StatefulWidget {
  const EatFlow({super.key});

  @override
  State<EatFlow> createState() => _EatFlowState();
}

class _EatFlowState extends State<EatFlow> {
  int _step = 0;
  String? _mealType;

  @override
  Widget build(BuildContext context) {
    return FlowScaffold(
      icon: Icons.restaurant_outlined,
      sup: 'Nutrition',
      title: _step == 0 ? 'Manger' : (_mealType ?? 'Manger'),
      accent: Brand.lime,
      step: _step,
      totalSteps: 2,
      question: _step == 0 ? 'Quel repas ?' : 'Quelle quantité ?',
      stepLabel: '${_step + 1} / 2',
      onBack: _step == 0 ? () => context.pop() : () => setState(() => _step--),
      child: _step == 0 ? _step1() : _step2(),
    );
  }

  Widget _step1() => ChoiceList(
    accent: Brand.lime,
    choices: const [
      ChoiceItem(icon: Icons.wb_sunny_outlined,    label: 'Petit-déjeuner'),
      ChoiceItem(icon: Icons.wb_cloudy_outlined,   label: 'Déjeuner'),
      ChoiceItem(icon: Icons.nightlight_outlined,  label: 'Dîner'),
      ChoiceItem(icon: Icons.apple_outlined,       label: 'Collation'),
    ],
    onSelect: (c) => setState(() { _mealType = c.label; _step = 1; }),
  );

  Widget _step2() => ChoiceList(
    accent: Brand.lime,
    choices: const [
      ChoiceItem(icon: Icons.eco_outlined,          label: 'Léger',    sub: '~350 kcal'),
      ChoiceItem(icon: Icons.dinner_dining_outlined, label: 'Normal',   sub: '~600 kcal'),
      ChoiceItem(icon: Icons.fastfood_outlined,     label: 'Copieux',  sub: '~900 kcal'),
      ChoiceItem(icon: Icons.qr_code_scanner_outlined, label: 'Scanner', sub: 'Code-barres'),
    ],
    onSelect: (c) => Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => EatResultScreen(mealType: _mealType!, mealSize: c.label)),
    ),
  );
}
