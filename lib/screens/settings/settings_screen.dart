import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/services/ai/ai_config.dart';
import 'package:no_brain_fit/services/ai/ai_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final _apiKeyCtrl   = TextEditingController();
  final _urlCtrl      = TextEditingController();
  final _modelCtrl    = TextEditingController();
  bool _saving = false;
  bool _obscureKey = true;

  @override
  void dispose() {
    _apiKeyCtrl.dispose(); _urlCtrl.dispose(); _modelCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final configAsync = ref.watch(aiConfigProvider);
    return configAsync.when(
      loading: () => const Scaffold(backgroundColor: Brand.bgVoid, body: Center(child: CircularProgressIndicator(color: Brand.lime))),
      error:   (e, _) => Scaffold(backgroundColor: Brand.bgVoid, body: Center(child: Text('$e', style: const TextStyle(color: Brand.orange)))),
      data: (config) {
        // Sync controllers on first load
        if (_apiKeyCtrl.text.isEmpty && config.claudeApiKey.isNotEmpty) {
          _apiKeyCtrl.text = config.claudeApiKey;
        }
        if (_urlCtrl.text.isEmpty) _urlCtrl.text = config.ollamaBaseUrl;
        if (_modelCtrl.text.isEmpty) _modelCtrl.text = config.ollamaModel;

        return Scaffold(
          backgroundColor: Brand.bgVoid,
          body: SafeArea(
            child: Column(
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.fromLTRB(Brand.s20, Brand.s16, Brand.s20, 0),
                  child: Row(
                    children: [
                      _IconBtn(icon: Icons.arrow_back_rounded, onTap: () => Navigator.of(context).pop()),
                      const SizedBox(width: Brand.s12),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('PARAMÈTRES', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: .18, color: Brand.grey2)),
                          Text('Intelligence artificielle', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w600, letterSpacing: -.3, color: Brand.white)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: Brand.s24),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: Brand.s20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Backend toggle
                        _SectionLabel('Backend actif'),
                        const SizedBox(height: Brand.s8),
                        _BackendToggle(
                          current: config.backend,
                          onChange: (b) => _save(config.copyWith(backend: b)),
                        ),
                        const SizedBox(height: Brand.s24),

                        // ── OLLAMA ────────────────────────────────────
                        _SectionLabel('Ollama (local · recommandé)'),
                        const SizedBox(height: Brand.s8),
                        _InfoCard(
                          icon: Icons.info_outline_rounded,
                          color: Brand.blue,
                          text: 'Lance Ollama sur ton Mac/PC avec :\n'
                              'ollama serve\n'
                              'Sur émulateur Android : l\'IP hôte est 10.0.2.2\n'
                              'Sur un vrai téléphone (même WiFi) : l\'IP LAN de ton PC',
                        ),
                        const SizedBox(height: Brand.s12),
                        _Field(
                          label: 'URL Ollama',
                          hint: AiConfig.defaultOllamaUrl,
                          ctrl: _urlCtrl,
                          icon: Icons.link_rounded,
                        ),
                        const SizedBox(height: Brand.s8),
                        _Field(
                          label: 'Modèle',
                          hint: AiConfig.defaultOllamaModel,
                          ctrl: _modelCtrl,
                          icon: Icons.memory_rounded,
                        ),
                        const SizedBox(height: Brand.s8),
                        _ModelSuggestions(
                          onPick: (m) => setState(() => _modelCtrl.text = m),
                        ),
                        const SizedBox(height: Brand.s24),

                        // ── CLAUDE ────────────────────────────────────
                        _SectionLabel('Claude API (Anthropic)'),
                        const SizedBox(height: Brand.s8),
                        _InfoCard(
                          icon: Icons.lock_outline_rounded,
                          color: Brand.lime,
                          text: 'Clé API disponible sur console.anthropic.com\n'
                              'Modèle utilisé : ${AiConfig.defaultClaudeModel}\n'
                              'La clé n\'est stockée que sur cet appareil.',
                        ),
                        const SizedBox(height: Brand.s12),
                        _Field(
                          label: 'Clé API Claude',
                          hint: 'sk-ant-...',
                          ctrl: _apiKeyCtrl,
                          icon: Icons.vpn_key_rounded,
                          obscure: _obscureKey,
                          suffixIcon: IconButton(
                            icon: Icon(_obscureKey ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 18, color: Brand.grey2),
                            onPressed: () => setState(() => _obscureKey = !_obscureKey),
                          ),
                        ),
                        const SizedBox(height: Brand.s32),

                        // Save button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _saving ? null : () => _save(config.copyWith(
                              claudeApiKey:  _apiKeyCtrl.text.trim(),
                              ollamaBaseUrl: _urlCtrl.text.trim().isNotEmpty ? _urlCtrl.text.trim() : AiConfig.defaultOllamaUrl,
                              ollamaModel:   _modelCtrl.text.trim().isNotEmpty ? _modelCtrl.text.trim() : AiConfig.defaultOllamaModel,
                            )),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Brand.lime,
                              foregroundColor: Brand.bgVoid,
                              padding: const EdgeInsets.symmetric(vertical: Brand.s16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rButton)),
                            ),
                            child: _saving
                              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Brand.bgVoid))
                              : const Text('Enregistrer', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                          ),
                        ),
                        const SizedBox(height: Brand.s20),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _save(AiConfig config) async {
    setState(() => _saving = true);
    await ref.read(aiConfigProvider.notifier).save(config);
    if (mounted) {
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text('Paramètres sauvegardés'),
        backgroundColor: Brand.bgCard,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rChip)),
      ));
    }
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Text(
    text.toUpperCase(),
    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: .18, color: Brand.grey2),
  );
}

class _BackendToggle extends StatelessWidget {
  const _BackendToggle({required this.current, required this.onChange});
  final AiBackend current;
  final void Function(AiBackend) onChange;

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      _ToggleBtn(label: 'Ollama', icon: Icons.computer_rounded, accent: Brand.blue, selected: current == AiBackend.ollama, onTap: () => onChange(AiBackend.ollama)),
      const SizedBox(width: Brand.s8),
      _ToggleBtn(label: 'Claude', icon: Icons.auto_awesome_rounded, accent: Brand.lime, selected: current == AiBackend.claude, onTap: () => onChange(AiBackend.claude)),
    ]);
  }
}

class _ToggleBtn extends StatelessWidget {
  const _ToggleBtn({required this.label, required this.icon, required this.accent, required this.selected, required this.onTap});
  final String label; final IconData icon; final Color accent; final bool selected; final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: Brand.s16),
          decoration: BoxDecoration(
            color: selected ? accent.withOpacity(.1) : Brand.bgCard,
            borderRadius: BorderRadius.circular(Brand.rCard),
            border: Border.all(color: selected ? accent : Brand.border, width: selected ? 1.5 : 1),
          ),
          child: Column(children: [
            Icon(icon, size: 22, color: selected ? accent : Brand.grey2),
            const SizedBox(height: 6),
            Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: selected ? accent : Brand.grey1)),
          ]),
        ),
      ),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({required this.label, required this.hint, required this.ctrl, required this.icon, this.obscure = false, this.suffixIcon});
  final String label, hint; final TextEditingController ctrl; final IconData icon; final bool obscure; final Widget? suffixIcon;

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Brand.grey1)),
      const SizedBox(height: 6),
      TextField(
        controller: ctrl,
        obscureText: obscure,
        style: const TextStyle(fontSize: 14, color: Brand.white, fontFamily: 'SpaceGrotesk'),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Brand.grey2, fontSize: 13),
          prefixIcon: Icon(icon, size: 18, color: Brand.grey2),
          suffixIcon: suffixIcon,
          filled: true,
          fillColor: Brand.bgCard,
          contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(Brand.rChip), borderSide: BorderSide(color: Brand.border)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Brand.rChip), borderSide: BorderSide(color: Brand.border)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Brand.rChip), borderSide: const BorderSide(color: Brand.lime, width: 1.5)),
        ),
      ),
    ]);
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.icon, required this.color, required this.text});
  final IconData icon; final Color color; final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Brand.s12),
      decoration: BoxDecoration(
        color: color.withOpacity(.07),
        borderRadius: BorderRadius.circular(Brand.rChip),
        border: Border.all(color: color.withOpacity(.2)),
      ),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: Brand.s8),
        Expanded(child: Text(text, style: TextStyle(fontSize: 12, color: color.withOpacity(.85), height: 1.6))),
      ]),
    );
  }
}

class _ModelSuggestions extends StatelessWidget {
  const _ModelSuggestions({required this.onPick});
  final void Function(String) onPick;

  static const _models = ['llama3.2', 'llama3.1', 'mistral', 'gemma3', 'phi3', 'qwen2.5'];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 6,
      runSpacing: 6,
      children: _models.map((m) => GestureDetector(
        onTap: () => onPick(m),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: Brand.bgCard,
            borderRadius: BorderRadius.circular(Brand.rTag),
            border: Border.all(color: Brand.border2),
          ),
          child: Text(m, style: const TextStyle(fontSize: 11, color: Brand.grey1, fontWeight: FontWeight.w500)),
        ),
      )).toList(),
    );
  }
}

class _IconBtn extends StatelessWidget {
  const _IconBtn({required this.icon, required this.onTap});
  final IconData icon; final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38, height: 38,
        decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rButton), border: Border.all(color: Brand.border2)),
        child: Icon(icon, size: 20, color: Brand.white),
      ),
    );
  }
}
