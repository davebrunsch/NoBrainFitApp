import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
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
  String? _mealSize;

  static const _color = Color(0xFFE8622A);

  @override
  Widget build(BuildContext context) {
    return FlowScaffold(
      emoji: '🍽️',
      title: _step == 0 ? 'Manger' : (_mealType ?? 'Manger'),
      color: _color,
      progress: (_step + 1) / 3,
      onBack: _step == 0 ? () => context.pop() : () => setState(() => _step--),
      child: _step == 0 ? _step1() : _step2(),
    );
  }

  Widget _step1() {
    return ChoiceGrid(
      color: _color,
      choices: const [
        ChoiceItem(emoji: '☀️', label: 'Petit-déjeuner'),
        ChoiceItem(emoji: '🌤️', label: 'Déjeuner'),
        ChoiceItem(emoji: '🌙', label: 'Dîner'),
        ChoiceItem(emoji: '🍎', label: 'Collation'),
      ],
      onSelect: (choice) => setState(() {
        _mealType = choice.label;
        _step = 1;
      }),
    );
  }

  Widget _step2() {
    return ChoiceGrid(
      color: _color,
      choices: const [
        ChoiceItem(emoji: '🥗', label: 'Léger', sub: 'Salade, soupe…'),
        ChoiceItem(emoji: '🍝', label: 'Normal', sub: 'Repas classique'),
        ChoiceItem(emoji: '🍔', label: 'Copieux', sub: 'Resto, fête…'),
        ChoiceItem(emoji: '📸', label: 'Scanner', sub: 'Code-barres'),
      ],
      onSelect: (choice) {
        _mealSize = choice.label;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => EatResultScreen(
              mealType: _mealType!,
              mealSize: _mealSize!,
            ),
          ),
        );
      },
    );
  }
}
