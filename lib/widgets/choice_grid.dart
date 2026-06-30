import 'package:flutter/material.dart';
import 'package:no_brain_fit/utils/brand.dart';

class ChoiceItem {
  const ChoiceItem({required this.icon, required this.label, this.sub});
  final IconData icon;
  final String label;
  final String? sub;
}

class ChoiceList extends StatefulWidget {
  const ChoiceList({
    super.key,
    required this.choices,
    required this.onSelect,
    required this.accent,
  });
  final List<ChoiceItem> choices;
  final void Function(ChoiceItem) onSelect;
  final Color accent;

  @override
  State<ChoiceList> createState() => _ChoiceListState();
}

class _ChoiceListState extends State<ChoiceList> {
  int? _selected;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: Brand.s20),
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: widget.choices.length,
      separatorBuilder: (_, __) => const SizedBox(height: Brand.s8),
      itemBuilder: (_, i) {
        final c = widget.choices[i];
        final sel = _selected == i;
        return _OptionRow(
          choice: c,
          selected: sel,
          accent: widget.accent,
          onTap: () {
            setState(() => _selected = i);
            Future.delayed(const Duration(milliseconds: 180), () => widget.onSelect(c));
          },
        );
      },
    );
  }
}

class _OptionRow extends StatelessWidget {
  const _OptionRow({required this.choice, required this.selected, required this.accent, required this.onTap});
  final ChoiceItem choice;
  final bool selected;
  final Color accent;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 140),
        padding: const EdgeInsets.symmetric(horizontal: Brand.s16, vertical: Brand.s16),
        decoration: BoxDecoration(
          color: selected ? accent.withOpacity(.08) : Brand.bgCard,
          borderRadius: BorderRadius.circular(Brand.rCard),
          border: Border.all(color: selected ? accent : Brand.border),
        ),
        child: Row(
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 140),
              width: 38, height: 38,
              decoration: BoxDecoration(
                color: selected ? accent.withOpacity(.15) : Brand.bgSurface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: selected ? accent.withOpacity(.4) : Brand.border),
              ),
              child: Icon(choice.icon, size: 20, color: selected ? accent : Brand.titane),
            ),
            const SizedBox(width: Brand.s12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    choice.label,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, letterSpacing: -.2, color: Brand.white),
                  ),
                  if (choice.sub != null) ...[
                    const SizedBox(height: 2),
                    Text(choice.sub!, style: const TextStyle(fontSize: 11, color: Brand.grey2)),
                  ],
                ],
              ),
            ),
            AnimatedOpacity(
              duration: const Duration(milliseconds: 140),
              opacity: selected ? 1.0 : 0.0,
              child: Icon(Icons.check_rounded, size: 18, color: accent),
            ),
          ],
        ),
      ),
    );
  }
}
