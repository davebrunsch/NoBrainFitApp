import 'package:flutter/material.dart';
import 'package:no_brain_fit/widgets/flow_scaffold.dart';
import 'package:no_brain_fit/widgets/choice_grid.dart';
import 'package:no_brain_fit/screens/train/train_result_screen.dart';

class TrainFlow extends StatefulWidget {
  const TrainFlow({super.key});

  @override
  State<TrainFlow> createState() => _TrainFlowState();
}

class _TrainFlowState extends State<TrainFlow> {
  int _step = 0;
  String? _duration;
  String? _location;

  static const _color = Color(0xFF2980B9);

  @override
  Widget build(BuildContext context) {
    return FlowScaffold(
      emoji: '💪',
      title: _step == 0 ? "S'entraîner" : (_duration ?? "S'entraîner"),
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
        ChoiceItem(emoji: '⚡', label: '15 min', sub: 'Express'),
        ChoiceItem(emoji: '🏃', label: '30 min', sub: 'Standard'),
        ChoiceItem(emoji: '💪', label: '45 min', sub: 'Complet'),
        ChoiceItem(emoji: '🏋️', label: '1h+', sub: 'Intensif'),
      ],
      onSelect: (choice) => setState(() {
        _duration = choice.label;
        _step = 1;
      }),
    );
  }

  Widget _step2() {
    return ChoiceGrid(
      color: _color,
      choices: const [
        ChoiceItem(emoji: '🏠', label: 'Maison', sub: 'Sans matériel'),
        ChoiceItem(emoji: '🏋️', label: 'Salle', sub: 'Avec machines'),
        ChoiceItem(emoji: '🌳', label: 'Dehors', sub: 'Parc, rue…'),
        ChoiceItem(emoji: '🚴', label: 'Cardio', sub: 'Vélo, rameur…'),
      ],
      onSelect: (choice) {
        _location = choice.label;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => TrainResultScreen(
              duration: _duration!,
              location: _location!,
            ),
          ),
        );
      },
    );
  }
}
