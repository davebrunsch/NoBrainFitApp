import 'package:flutter/material.dart';
import 'package:no_brain_fit/utils/brand.dart';

class FlowScaffold extends StatelessWidget {
  const FlowScaffold({
    super.key,
    required this.icon,
    required this.sup,
    required this.title,
    required this.accent,
    required this.step,
    required this.totalSteps,
    required this.onBack,
    required this.question,
    required this.stepLabel,
    required this.child,
  });

  final IconData icon;
  final String sup, title, question, stepLabel;
  final Color accent;
  final int step, totalSteps;
  final VoidCallback onBack;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Brand.bgVoid,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s16, Brand.s20, 0),
              child: Row(
                children: [
                  _BackButton(onTap: onBack),
                  const SizedBox(width: Brand.s12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        sup.toUpperCase(),
                        style: Brand.mono(size: 10, weight: FontWeight.w700, color: accent, letterSpacing: 1.4),
                      ),
                      Text(title, style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w600, letterSpacing: -.3, color: Brand.white)),
                    ],
                  ),
                ],
              ),
            ),
            // Step segments
            Padding(
              padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s16, Brand.s20, 0),
              child: Row(
                children: List.generate(totalSteps, (i) => Expanded(
                  child: Container(
                    height: 3,
                    margin: EdgeInsets.only(right: i < totalSteps - 1 ? Brand.s8 : 0),
                    decoration: BoxDecoration(
                      color: i <= step ? accent : Brand.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                )),
              ),
            ),
            // Question + counter
            Padding(
              padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s24, Brand.s20, Brand.s16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Expanded(
                    child: Text(question, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w600, letterSpacing: -.5, color: Brand.white)),
                  ),
                  Text(stepLabel, style: Brand.mono(size: 11, weight: FontWeight.w700, color: Brand.grey1, letterSpacing: .5)),
                ],
              ),
            ),
            Expanded(child: child),
          ],
        ),
      ),
    );
  }
}

class _BackButton extends StatelessWidget {
  const _BackButton({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38, height: 38,
        decoration: BoxDecoration(
          color: Brand.bgCard,
          borderRadius: BorderRadius.circular(Brand.rButton),
          border: Border.all(color: Brand.border2),
        ),
        child: const Icon(Icons.chevron_left_rounded, size: 22, color: Brand.white),
      ),
    );
  }
}
