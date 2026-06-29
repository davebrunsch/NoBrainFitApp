import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/services/ai/ai_config.dart';
import 'package:no_brain_fit/services/ai/ai_provider.dart';
import 'package:no_brain_fit/services/server/server_auth_service.dart';
import 'package:no_brain_fit/services/server/server_subscription_service.dart';
import 'package:no_brain_fit/services/library/training_prefs.dart';
import 'package:no_brain_fit/services/profile/profile_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final _apiKeyCtrl   = TextEditingController();
  final _urlCtrl      = TextEditingController();
  final _modelCtrl    = TextEditingController();
  final _serverUrlCtrl = TextEditingController();
  bool _saving = false;
  bool _obscureKey = true;

  @override
  void dispose() {
    _apiKeyCtrl.dispose(); _urlCtrl.dispose(); _modelCtrl.dispose();
    _serverUrlCtrl.dispose();
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
        if (_serverUrlCtrl.text.isEmpty) _serverUrlCtrl.text = config.serverBaseUrl;

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

                        // ── SERVEUR ───────────────────────────────────
                        _SectionLabel('Serveur NoBrainFit (recommandé)'),
                        const SizedBox(height: Brand.s8),
                        _InfoCard(
                          icon: Icons.cloud_outlined,
                          color: Brand.lime,
                          text: 'Le serveur gère l\'IA, les quotas et ton historique.\n'
                              'Connecte-toi pour générer tes séances et recettes.\n'
                              'Émulateur Android : l\'IP hôte est 10.0.2.2',
                        ),
                        const SizedBox(height: Brand.s12),
                        _Field(
                          label: 'URL du serveur',
                          hint: AiConfig.defaultServerUrl,
                          ctrl: _serverUrlCtrl,
                          icon: Icons.dns_rounded,
                        ),
                        const SizedBox(height: Brand.s12),
                        _ServerAuthCard(
                          config: config,
                          serverUrlCtrl: _serverUrlCtrl,
                          onSession: (s) => _save(config.copyWith(
                            backend: AiBackend.server,
                            serverBaseUrl: _serverUrlCtrl.text.trim().isNotEmpty
                                ? _serverUrlCtrl.text.trim()
                                : AiConfig.defaultServerUrl,
                            serverToken: s.token,
                            serverEmail: s.email,
                          )),
                          onLogout: () async {
                            // Clearing the token gates the app back to /auth;
                            // wipe the profile so a new account starts fresh.
                            await ref.read(userProfileProvider.notifier).reset();
                            await _save(config.copyWith(serverToken: '', serverEmail: ''));
                          },
                        ),
                        const SizedBox(height: Brand.s24),

                        // ── PROFIL ────────────────────────────────────
                        _SectionLabel('Mon profil'),
                        const SizedBox(height: Brand.s8),
                        const _ProfileCard(),
                        const SizedBox(height: Brand.s24),

                        // ── OLLAMA ────────────────────────────────────
                        _SectionLabel('Ollama (local · avancé)'),
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
                        const SizedBox(height: Brand.s32),

                        // ── SÉANCE D'ENTRAÎNEMENT ─────────────────────
                        _SectionLabel('Séance d\'entraînement'),
                        const SizedBox(height: Brand.s8),
                        const _TrainingPrefsCard(),
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
      _ToggleBtn(label: 'Serveur', icon: Icons.cloud_rounded, accent: Brand.lime, selected: current == AiBackend.server, onTap: () => onChange(AiBackend.server)),
      const SizedBox(width: Brand.s8),
      _ToggleBtn(label: 'Ollama', icon: Icons.computer_rounded, accent: Brand.blue, selected: current == AiBackend.ollama, onTap: () => onChange(AiBackend.ollama)),
      const SizedBox(width: Brand.s8),
      _ToggleBtn(label: 'Claude', icon: Icons.auto_awesome_rounded, accent: Brand.orange, selected: current == AiBackend.claude, onTap: () => onChange(AiBackend.claude)),
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

/// Login / register against the NoBrainFit server, with connected state.
class _ServerAuthCard extends StatefulWidget {
  const _ServerAuthCard({
    required this.config,
    required this.serverUrlCtrl,
    required this.onSession,
    required this.onLogout,
  });

  final AiConfig config;
  final TextEditingController serverUrlCtrl;
  final void Function(ServerSession) onSession;
  final VoidCallback onLogout;

  @override
  State<_ServerAuthCard> createState() => _ServerAuthCardState();
}

class _ServerAuthCardState extends State<_ServerAuthCard> {
  final _emailCtrl = TextEditingController();
  final _passCtrl  = TextEditingController();
  final _nameCtrl  = TextEditingController();
  bool _registerMode = false;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose(); _passCtrl.dispose(); _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() { _busy = true; _error = null; });
    final baseUrl = widget.serverUrlCtrl.text.trim().isNotEmpty
        ? widget.serverUrlCtrl.text.trim()
        : AiConfig.defaultServerUrl;
    final auth = ServerAuthService(baseUrl: baseUrl);
    try {
      final session = _registerMode
          ? await auth.register(
              email: _emailCtrl.text.trim(),
              password: _passCtrl.text,
              name: _nameCtrl.text.trim(),
            )
          : await auth.login(
              email: _emailCtrl.text.trim(),
              password: _passCtrl.text,
            );
      if (session.token.isEmpty) throw Exception('Réponse serveur invalide.');
      _passCtrl.clear();
      if (mounted) widget.onSession(session);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.config.serverReady) {
      return Container(
        padding: const EdgeInsets.all(Brand.s16),
        decoration: BoxDecoration(
          color: Brand.bgCard,
          borderRadius: BorderRadius.circular(Brand.rChip),
          border: Border.all(color: Brand.lime.withOpacity(.25)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Icon(Icons.check_circle_rounded, size: 18, color: Brand.lime),
            const SizedBox(width: Brand.s12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Connecté', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.white)),
                Text(widget.config.serverEmail, style: const TextStyle(fontSize: 11, color: Brand.grey2)),
              ]),
            ),
            GestureDetector(
              onTap: widget.onLogout,
              child: Text('Déconnexion', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Brand.orange.withOpacity(.9))),
            ),
          ]),
          const SizedBox(height: Brand.s12),
          const Divider(height: 1, color: Brand.border),
          const SizedBox(height: Brand.s12),
          _SubscriptionLine(baseUrl: widget.config.serverBaseUrl, token: widget.config.serverToken),
        ]),
      );
    }

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (_registerMode) ...[
        _Field(label: 'Nom', hint: 'Ton prénom', ctrl: _nameCtrl, icon: Icons.person_outline_rounded),
        const SizedBox(height: Brand.s8),
      ],
      _Field(label: 'Email', hint: 'toi@exemple.com', ctrl: _emailCtrl, icon: Icons.alternate_email_rounded),
      const SizedBox(height: Brand.s8),
      _Field(label: 'Mot de passe', hint: '••••••••', ctrl: _passCtrl, icon: Icons.lock_outline_rounded, obscure: true),
      if (_error != null) ...[
        const SizedBox(height: Brand.s8),
        Text(_error!, style: const TextStyle(fontSize: 12, color: Brand.orange)),
      ],
      const SizedBox(height: Brand.s12),
      SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: _busy ? null : _submit,
          style: ElevatedButton.styleFrom(
            backgroundColor: Brand.lime,
            foregroundColor: Brand.bgVoid,
            padding: const EdgeInsets.symmetric(vertical: Brand.s16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rButton)),
          ),
          child: _busy
              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Brand.bgVoid))
              : Text(_registerMode ? 'Créer un compte' : 'Se connecter',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
        ),
      ),
      const SizedBox(height: Brand.s8),
      Center(
        child: GestureDetector(
          onTap: _busy ? null : () => setState(() { _registerMode = !_registerMode; _error = null; }),
          child: Text(
            _registerMode ? 'J\'ai déjà un compte — Se connecter' : 'Pas de compte ? Créer un compte',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Brand.grey1),
          ),
        ),
      ),
    ]);
  }
}

/// Shows the current plan and remaining daily quota for a connected user.
class _SubscriptionLine extends StatefulWidget {
  const _SubscriptionLine({required this.baseUrl, required this.token});
  final String baseUrl;
  final String token;

  @override
  State<_SubscriptionLine> createState() => _SubscriptionLineState();
}

class _SubscriptionLineState extends State<_SubscriptionLine> {
  late final Future<ServerSubscription> _future =
      ServerSubscriptionService(baseUrl: widget.baseUrl, token: widget.token).fetch();

  String _fmt(int remaining) => remaining < 0 ? '∞' : '$remaining';

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ServerSubscription>(
      future: _future,
      builder: (context, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const Text('Chargement du plan…', style: TextStyle(fontSize: 12, color: Brand.grey2));
        }
        if (!snap.hasData) {
          return const Text('Plan indisponible', style: TextStyle(fontSize: 12, color: Brand.grey2));
        }
        final s = snap.data!;
        return Row(children: [
          const Icon(Icons.workspace_premium_outlined, size: 16, color: Brand.lime),
          const SizedBox(width: Brand.s8),
          Expanded(
            child: Text('Plan ${s.planName}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.white)),
          ),
          Text(
            '${_fmt(s.workoutsRemaining)} séances · ${_fmt(s.aiCallsRemaining)} IA',
            style: Brand.mono(size: 11, weight: FontWeight.w700, color: Brand.grey1),
          ),
        ]);
      },
    );
  }
}

/// Compact summary of the user's fitness profile with an edit shortcut.
class _ProfileCard extends ConsumerWidget {
  const _ProfileCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(userProfileProvider);
    return async.maybeWhen(
      orElse: () => Container(
        height: 64,
        decoration: BoxDecoration(
          color: Brand.bgCard,
          borderRadius: BorderRadius.circular(Brand.rCard),
          border: Border.all(color: Brand.border),
        ),
        child: const Center(
            child: SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: Brand.lime))),
      ),
      data: (p) {
        if (!p.completed) {
          return GestureDetector(
            onTap: () => context.push('/onboarding'),
            child: Container(
              padding: const EdgeInsets.all(Brand.s16),
              decoration: BoxDecoration(
                color: Brand.bgCard,
                borderRadius: BorderRadius.circular(Brand.rCard),
                border: Border.all(color: Brand.lime.withOpacity(.25)),
              ),
              child: Row(children: [
                const Icon(Icons.assignment_outlined,
                    size: 18, color: Brand.lime),
                const SizedBox(width: Brand.s12),
                const Expanded(
                  child: Text('Complète ton profil',
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Brand.white)),
                ),
                const Icon(Icons.chevron_right_rounded,
                    size: 20, color: Brand.grey2),
              ]),
            ),
          );
        }
        return Container(
          padding: const EdgeInsets.all(Brand.s16),
          decoration: BoxDecoration(
            color: Brand.bgCard,
            borderRadius: BorderRadius.circular(Brand.rCard),
            border: Border.all(color: Brand.border),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p.goal.label,
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Brand.white)),
                    const SizedBox(height: 2),
                    Text(
                        '${p.level.label} · ${p.daysPerWeek}x/sem · ${p.equipment.label}',
                        style: const TextStyle(fontSize: 11.5, color: Brand.grey2)),
                  ],
                ),
              ),
              GestureDetector(
                onTap: () => context.push('/onboarding'),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: Brand.s12, vertical: 7),
                  decoration: BoxDecoration(
                    color: Brand.lime.withOpacity(.1),
                    borderRadius: BorderRadius.circular(Brand.rChip),
                    border: Border.all(color: Brand.lime.withOpacity(.3)),
                  ),
                  child: const Text('Modifier',
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Brand.lime)),
                ),
              ),
            ]),
            const SizedBox(height: Brand.s12),
            const Divider(height: 1, color: Brand.border),
            const SizedBox(height: Brand.s12),
            Row(children: [
              _ProfileStat(
                  value: '${p.weightKg.round()}', unit: 'kg', label: 'POIDS'),
              _ProfileStat(
                  value: p.bmi.toStringAsFixed(1), unit: 'IMC', label: 'INDICE'),
              _ProfileStat(
                  value: '${p.dailyCalorieTarget}',
                  unit: 'kcal',
                  label: 'CIBLE/J'),
            ]),
          ]),
        );
      },
    );
  }
}

class _ProfileStat extends StatelessWidget {
  const _ProfileStat(
      {required this.value, required this.unit, required this.label});
  final String value, unit, label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(children: [
        Text(label,
            style: const TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w700,
                letterSpacing: .18,
                color: Brand.grey2)),
        const SizedBox(height: 4),
        Text(value,
            style: Brand.mono(size: 18, weight: FontWeight.w700, color: Brand.white)),
        Text(unit, style: const TextStyle(fontSize: 10, color: Brand.grey2)),
      ]),
    );
  }
}

/// Preferences for the guided workout session (rest, haptics, sound).
class _TrainingPrefsCard extends StatefulWidget {
  const _TrainingPrefsCard();

  @override
  State<_TrainingPrefsCard> createState() => _TrainingPrefsCardState();
}

class _TrainingPrefsCardState extends State<_TrainingPrefsCard> {
  TrainingPrefs _prefs = TrainingPrefs.defaults;
  bool _loaded = false;

  static const _restOptions = [30, 45, 60, 90, 120];

  @override
  void initState() {
    super.initState();
    TrainingPrefs.load().then((p) {
      if (mounted) setState(() { _prefs = p; _loaded = true; });
    });
  }

  Future<void> _update(TrainingPrefs next) async {
    setState(() => _prefs = next);
    await next.save();
  }

  @override
  Widget build(BuildContext context) {
    if (!_loaded) {
      return Container(
        height: 64,
        decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rCard), border: Border.all(color: Brand.border)),
        child: const Center(child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Brand.blue))),
      );
    }
    return Container(
      padding: const EdgeInsets.all(Brand.s16),
      decoration: BoxDecoration(color: Brand.bgCard, borderRadius: BorderRadius.circular(Brand.rCard), border: Border.all(color: Brand.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Repos par défaut', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.white)),
        const SizedBox(height: 2),
        const Text('Utilisé quand un exercice ne précise pas de temps de repos.', style: TextStyle(fontSize: 11, color: Brand.grey2)),
        const SizedBox(height: Brand.s12),
        Wrap(spacing: 6, runSpacing: 6, children: _restOptions.map((sec) {
          final sel = _prefs.defaultRestSec == sec;
          return GestureDetector(
            onTap: () => _update(_prefs.copyWith(defaultRestSec: sec)),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: sel ? Brand.blue.withOpacity(.12) : Brand.bgCardHi,
                borderRadius: BorderRadius.circular(Brand.rChip),
                border: Border.all(color: sel ? Brand.blue : Brand.border2),
              ),
              child: Text('${sec}s', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: sel ? Brand.blue : Brand.grey1)),
            ),
          );
        }).toList()),
        const SizedBox(height: Brand.s16),
        const Divider(height: 1, color: Brand.border),
        _ToggleRow(
          label: 'Vibration',
          sub: 'À la fin d\'une série et du repos',
          value: _prefs.vibrate,
          onChanged: (v) => _update(_prefs.copyWith(vibrate: v)),
        ),
        _ToggleRow(
          label: 'Son',
          sub: 'Bip à la fin du temps de repos',
          value: _prefs.sound,
          onChanged: (v) => _update(_prefs.copyWith(sound: v)),
        ),
      ]),
    );
  }
}

class _ToggleRow extends StatelessWidget {
  const _ToggleRow({required this.label, required this.sub, required this.value, required this.onChanged});
  final String label, sub;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: Brand.s12),
      child: Row(children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.white)),
            Text(sub, style: const TextStyle(fontSize: 11, color: Brand.grey2)),
          ]),
        ),
        Switch(
          value: value,
          onChanged: onChanged,
          activeColor: Brand.bgVoid,
          activeTrackColor: Brand.blue,
          inactiveThumbColor: Brand.grey1,
          inactiveTrackColor: Brand.bgCardHi,
        ),
      ]),
    );
  }
}
