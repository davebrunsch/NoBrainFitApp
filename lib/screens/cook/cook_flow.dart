import 'package:flutter/material.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/widgets/flow_scaffold.dart';
import 'package:no_brain_fit/widgets/choice_grid.dart';
import 'package:no_brain_fit/screens/cook/cook_result_screen.dart';

class CookFlow extends StatefulWidget {
  const CookFlow({super.key});

  @override
  State<CookFlow> createState() => _CookFlowState();
}

class _CookFlowState extends State<CookFlow> {
  int _step = 0;
  String? _effort;

  @override
  Widget build(BuildContext context) {
    return FlowScaffold(
      icon: Icons.soup_kitchen_outlined,
      sup: 'Cuisine',
      title: _step == 0 ? 'Cuisiner' : (_effort ?? 'Cuisiner'),
      accent: Brand.orange,
      step: _step,
      totalSteps: 2,
      question: _step == 0 ? 'T\'as le courage ?' : 'Pour combien ?',
      stepLabel: '${_step + 1} / 2',
      onBack: _step == 0 ? () => Navigator.of(context).pop() : () => setState(() => _step--),
      child: _step == 0 ? _step1() : _step2(),
    );
  }

  Widget _step1() => ChoiceList(
    accent: Brand.orange,
    choices: const [
      ChoiceItem(icon: Icons.weekend_outlined,       label: 'La flemme',  sub: 'Max 10 min'),
      ChoiceItem(icon: Icons.sentiment_satisfied_outlined, label: 'Un peu', sub: '20–25 min'),
      ChoiceItem(icon: Icons.soup_kitchen_outlined,  label: 'Motivé !',   sub: '45 min +'),
      ChoiceItem(icon: Icons.shopping_cart_outlined, label: 'Juste les courses', sub: 'Liste auto'),
    ],
    onSelect: (c) => setState(() { _effort = c.label; _step = 1; }),
  );

  Widget _step2() => ChoiceList(
    accent: Brand.orange,
    choices: const [
      ChoiceItem(icon: Icons.person_outline_rounded,        label: 'Juste moi'),
      ChoiceItem(icon: Icons.people_outline_rounded,        label: '2 personnes'),
      ChoiceItem(icon: Icons.family_restroom_outlined,      label: 'Famille'),
      ChoiceItem(icon: Icons.inventory_2_outlined,          label: 'Meal prep', sub: 'Toute la semaine'),
    ],
    onSelect: (c) => Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => CookResultScreen(effort: _effort!, portions: c.label)),
    ),
  );
}
