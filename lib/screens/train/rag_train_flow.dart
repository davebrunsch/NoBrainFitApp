import 'package:flutter/material.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/widgets/flow_scaffold.dart';
import 'package:no_brain_fit/widgets/choice_grid.dart';
import 'package:no_brain_fit/screens/train/rag_train_result_screen.dart';

class RagTrainFlow extends StatefulWidget {
  const RagTrainFlow({super.key});

  @override
  State<RagTrainFlow> createState() => _RagTrainFlowState();
}

class _RagTrainFlowState extends State<RagTrainFlow> {
  int _step = 0;
  String? _goal;
  String? _duration;

  String get _title => switch (_step) {
        0 => 'Programme IA',
        1 => _goal ?? 'Programme IA',
        _ => _duration ?? _goal ?? 'Programme IA',
      };

  String get _question => switch (_step) {
        0 => 'Quel est ton objectif ?',
        1 => 'Durée de la séance ?',
        _ => 'Quel équipement tu as ?',
      };

  void _back() {
    if (_step == 0) {
      Navigator.of(context).pop();
    } else {
      setState(() => _step--);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FlowScaffold(
      icon: Icons.auto_awesome_outlined,
      sup: 'Training · IA',
      title: _title,
      accent: Brand.blue,
      step: _step,
      totalSteps: 3,
      question: _question,
      stepLabel: '${_step + 1} / 3',
      onBack: _back,
      child: _buildStep(),
    );
  }

  Widget _buildStep() {
    return switch (_step) {
      0 => _stepGoal(),
      1 => _stepDuration(),
      _ => _stepEquipment(),
    };
  }

  Widget _stepGoal() => ChoiceList(
        accent: Brand.blue,
        choices: const [
          ChoiceItem(
            icon: Icons.local_fire_department_outlined,
            label: 'Perte de poids',
            sub: 'Cardio + circuits',
          ),
          ChoiceItem(
            icon: Icons.fitness_center_outlined,
            label: 'Force',
            sub: 'Charges lourdes · peu de reps',
          ),
          ChoiceItem(
            icon: Icons.show_chart_outlined,
            label: 'Hypertrophie',
            sub: 'Volume · 8-12 reps',
          ),
        ],
        onSelect: (c) => setState(() {
          _goal = c.label;
          _step = 1;
        }),
      );

  Widget _stepDuration() => ChoiceList(
        accent: Brand.blue,
        choices: const [
          ChoiceItem(
            icon: Icons.bolt_outlined,
            label: '30 min',
            sub: 'Express · efficace',
          ),
          ChoiceItem(
            icon: Icons.directions_run_outlined,
            label: '45 min',
            sub: 'Standard',
          ),
          ChoiceItem(
            icon: Icons.timer_outlined,
            label: '60 min',
            sub: 'Séance complète',
          ),
        ],
        onSelect: (c) => setState(() {
          _duration = c.label;
          _step = 2;
        }),
      );

  Widget _stepEquipment() => ChoiceList(
        accent: Brand.blue,
        choices: const [
          ChoiceItem(
            icon: Icons.accessibility_new_outlined,
            label: 'Poids de corps',
            sub: 'Aucun matériel',
          ),
          ChoiceItem(
            icon: Icons.fitness_center_outlined,
            label: 'Haltères',
            sub: 'Haltères libres',
          ),
          ChoiceItem(
            icon: Icons.settings_outlined,
            label: 'Machines guidées',
            sub: 'Appareils de salle',
          ),
          ChoiceItem(
            icon: Icons.sports_gymnastics_outlined,
            label: 'Salle complète',
            sub: 'Barres, haltères, câbles…',
          ),
        ],
        onSelect: (c) => Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => RagTrainResultScreen(
              goal: _goal!,
              duration: _duration!,
              equipment: c.label,
            ),
          ),
        ),
      );
}
