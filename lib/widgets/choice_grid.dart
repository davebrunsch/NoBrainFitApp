import 'package:flutter/material.dart';

class ChoiceItem {
  final String emoji;
  final String label;
  final String? sub;
  const ChoiceItem({required this.emoji, required this.label, this.sub});
}

class ChoiceGrid extends StatefulWidget {
  final List<ChoiceItem> choices;
  final void Function(ChoiceItem) onSelect;
  final Color color;

  const ChoiceGrid({
    super.key,
    required this.choices,
    required this.onSelect,
    required this.color,
  });

  @override
  State<ChoiceGrid> createState() => _ChoiceGridState();
}

class _ChoiceGridState extends State<ChoiceGrid> {
  int? _selected;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.1,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: List.generate(widget.choices.length, (i) {
              final c = widget.choices[i];
              final selected = _selected == i;
              return GestureDetector(
                onTap: () {
                  setState(() => _selected = i);
                  Future.delayed(
                    const Duration(milliseconds: 180),
                    () => widget.onSelect(c),
                  );
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  decoration: BoxDecoration(
                    color: selected
                        ? widget.color.withOpacity(0.15)
                        : Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: selected
                          ? widget.color
                          : Colors.white.withOpacity(0.1),
                      width: selected ? 2 : 1.5,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(c.emoji, style: const TextStyle(fontSize: 32)),
                      const SizedBox(height: 8),
                      Text(c.label,
                          style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Colors.white)),
                      if (c.sub != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(c.sub!,
                              style: const TextStyle(
                                  fontSize: 11, color: Colors.white54)),
                        ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
