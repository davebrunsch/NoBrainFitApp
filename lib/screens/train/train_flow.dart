import 'package:flutter/material.dart';
import 'package:no_brain_fit/utils/brand.dart';
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

  @override
  Widget build(BuildContext context) {
    return FlowScaffold(
      icon: Icons.fitness_center_outlined,
      sup: 'Training',
      title: _step == 0 ? "S'entraîner" : (_duration ?? "S'entraîner"),
      accent: Brand.blue,
      step: _step,
      totalSteps: 2,
      question: _step == 0 ? 'Combien de temps ?' : 'Où tu t\'entraînes ?',
      stepLabel: '${_step + 1} / 2',
      onBack: _step == 0 ? () => Navigator.of(context).pop() : () => setState(() => _step--),
      child: _step == 0 ? _step1() : _step2(),
    );
  }

  Widget _step1() => ChoiceList(
    accent: Brand.blue,
    choices: const [
      ChoiceItem(icon: Icons.bolt_outlined,            label: '15 min', sub: 'Express'),
      ChoiceItem(icon: Icons.directions_run_outlined,  label: '30 min', sub: 'Standard'),
      ChoiceItem(icon: Icons.fitness_center_outlined,  label: '45 min', sub: 'Complet'),
      ChoiceItem(icon: Icons.local_fire_department_outlined, label: '1h +', sub: 'Intensif'),
    ],
    onSelect: (c) => setState(() { _duration = c.label; _step = 1; }),
  );

  Widget _step2() => ChoiceList(
    accent: Brand.blue,
    choices: const [
      ChoiceItem(icon: Icons.home_outlined,          label: 'Maison',  sub: 'Sans matériel'),
      ChoiceItem(icon: Icons.fitness_center_outlined, label: 'Salle',  sub: 'Avec machines'),
      ChoiceItem(icon: Icons.park_outlined,          label: 'Dehors',  sub: 'Parc, rue…'),
      ChoiceItem(icon: Icons.directions_bike_outlined, label: 'Cardio', sub: 'Vélo, rameur…'),
    ],
    onSelect: (c) => Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => TrainResultScreen(duration: _duration!, location: c.label)),
    ),
  );
}
