import 'package:flutter/material.dart';
import 'package:no_brain_fit/services/cook/shopping_list_service.dart';
import 'package:no_brain_fit/utils/brand.dart';

/// The user's persistent shopping list.
class ShoppingListScreen extends StatefulWidget {
  const ShoppingListScreen({super.key});

  @override
  State<ShoppingListScreen> createState() => _ShoppingListScreenState();
}

class _ShoppingListScreenState extends State<ShoppingListScreen> {
  final ShoppingListService _service = ShoppingListService();
  List<ShoppingItem> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final items = await _service.items();
    if (mounted) setState(() { _items = items; _loading = false; });
  }

  Future<void> _toggle(int i) async {
    await _service.toggle(i);
    await _load();
  }

  Future<void> _removeChecked() async {
    await _service.removeChecked();
    await _load();
  }

  Future<void> _clear() async {
    await _service.clear();
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final checkedCount = _items.where((i) => i.checked).length;
    return Scaffold(
      backgroundColor: Brand.bgVoid,
      body: SafeArea(
        child: Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s16, Brand.s20, 0),
            child: Row(children: [
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 38, height: 38,
                  decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rButton), border: Border.all(color: Brand.border2)),
                  child: const Icon(Icons.arrow_back_rounded, size: 20, color: Brand.white),
                ),
              ),
              const SizedBox(width: Brand.s12),
              const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('CUISINE', style: Brand.labelMono),
                Text('Ma liste de courses', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w600, letterSpacing: -.3, color: Brand.white)),
              ]),
              const Spacer(),
              if (_items.isNotEmpty)
                GestureDetector(onTap: _clear, child: const Icon(Icons.delete_outline_rounded, size: 20, color: Brand.grey2)),
            ]),
          ),
          const SizedBox(height: Brand.s16),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Brand.orange, strokeWidth: 2))
                : _items.isEmpty
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.all(Brand.s32),
                          child: Column(mainAxisSize: MainAxisSize.min, children: [
                            Icon(Icons.shopping_cart_outlined, size: 40, color: Brand.grey3),
                            SizedBox(height: Brand.s16),
                            Text('Ta liste est vide.\nAjoute des articles depuis une recette.',
                                textAlign: TextAlign.center, style: TextStyle(fontSize: 13, color: Brand.grey2, height: 1.5)),
                          ]),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(Brand.s20, 0, Brand.s20, Brand.s20),
                        itemCount: _items.length,
                        itemBuilder: (_, i) {
                          final item = _items[i];
                          return GestureDetector(
                            onTap: () => _toggle(i),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: Brand.s12),
                              decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Brand.border))),
                              child: Row(children: [
                                AnimatedContainer(
                                  duration: const Duration(milliseconds: 140),
                                  width: 20, height: 20,
                                  decoration: BoxDecoration(
                                    color: item.checked ? Brand.orange : Colors.transparent,
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: item.checked ? Brand.orange : Brand.grey2, width: 1.5),
                                  ),
                                  child: item.checked ? const Icon(Icons.check_rounded, size: 13, color: Brand.bgVoid) : null,
                                ),
                                const SizedBox(width: Brand.s12),
                                Expanded(
                                  child: Text(item.label, style: TextStyle(
                                    fontSize: 14, fontWeight: FontWeight.w500,
                                    color: item.checked ? Brand.grey2 : Brand.white,
                                    decoration: item.checked ? TextDecoration.lineThrough : null,
                                    decorationColor: Brand.grey2,
                                  )),
                                ),
                              ]),
                            ),
                          );
                        },
                      ),
          ),
          if (checkedCount > 0)
            Padding(
              padding: const EdgeInsets.fromLTRB(Brand.s20, 0, Brand.s20, Brand.s20),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: _removeChecked,
                  child: Text('Retirer les $checkedCount articles cochés'),
                ),
              ),
            ),
        ]),
      ),
    );
  }
}
