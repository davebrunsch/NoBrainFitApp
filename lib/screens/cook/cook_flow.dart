import 'package:flutter/material.dart';
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
  String? _portions;

  static const _color = Color(0xFF27AE60);

  @override
  Widget build(BuildContext context) {
    return FlowScaffold(
      emoji: '👨‍🍳',
      title: _step == 0 ? 'Cuisiner' : (_effort ?? 'Cuisiner'),
      color: _color,
      progress: (_step + 1) / 3,
      onBack: _step == 0
          ? () => Navigator.of(context).pop()
          : () => setState(() => _step--),
      child: _step == 0 ? _step1() : _step2(),
    );
  }

  Widget _step1() {
    return ChoiceGrid(
      color: _color,
      choices: const [
        ChoiceItem(emoji: '🛋️', label: 'La flemme', sub: 'Max 10 min'),
        ChoiceItem(emoji: '😊', label: 'Un peu', sub: '20-25 min'),
        ChoiceItem(emoji: '👨‍🍳', label: 'Motivé !', sub: '45 min+'),
        ChoiceItem(emoji: '🛒', label: 'Courses', sub: 'Liste auto'),
      ],
      onSelect: (choice) => setState(() {
        _effort = choice.label;
        _step = 1;
      }),
    );
  }

  Widget _step2() {
    return ChoiceGrid(
      color: _color,
      choices: const [
        ChoiceItem(emoji: '🧍', label: 'Juste moi'),
        ChoiceItem(emoji: '👫', label: '2 personnes'),
        ChoiceItem(emoji: '👨‍👩‍👧', label: 'Famille'),
        ChoiceItem(emoji: '📦', label: 'Meal prep', sub: 'Toute la semaine'),
      ],
      onSelect: (choice) {
        _portions = choice.label;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => CookResultScreen(
              effort: _effort!,
              portions: _portions!,
            ),
          ),
        );
      },
    );
  }
}
