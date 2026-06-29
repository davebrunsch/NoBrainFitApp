import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:no_brain_fit/utils/brand.dart';
import 'package:no_brain_fit/widgets/tri_strike_logo.dart';
import 'package:no_brain_fit/services/ai/ai_config.dart';
import 'package:no_brain_fit/services/ai/ai_provider.dart';
import 'package:no_brain_fit/services/server/server_auth_service.dart';

/// Startup gate — the user must log in or create an account before reaching
/// the app. On success the session token is stored in [AiConfig] and the
/// router redirects to onboarding (or home, if already completed).
class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _serverCtrl = TextEditingController();

  bool _registerMode = false;
  bool _busy = false;
  bool _obscure = true;
  bool _showAdvanced = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _nameCtrl.dispose();
    _serverCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit(AiConfig config) async {
    FocusScope.of(context).unfocus();
    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text;
    final name = _nameCtrl.text.trim();

    if (email.isEmpty || pass.isEmpty || (_registerMode && name.isEmpty)) {
      setState(() => _error = 'Remplis tous les champs.');
      return;
    }
    if (_registerMode && pass.length < 6) {
      setState(() => _error = 'Mot de passe : 6 caractères minimum.');
      return;
    }

    setState(() {
      _busy = true;
      _error = null;
    });

    final baseUrl = _serverCtrl.text.trim().isNotEmpty
        ? _serverCtrl.text.trim()
        : (config.serverBaseUrl.isNotEmpty
            ? config.serverBaseUrl
            : AiConfig.defaultServerUrl);
    final auth = ServerAuthService(baseUrl: baseUrl);

    try {
      final session = _registerMode
          ? await auth.register(email: email, password: pass, name: name)
          : await auth.login(email: email, password: pass);
      if (session.token.isEmpty) {
        throw Exception('Réponse serveur invalide.');
      }
      await ref.read(aiConfigProvider.notifier).save(config.copyWith(
            backend: AiBackend.server,
            serverBaseUrl: baseUrl,
            serverToken: session.token,
            serverEmail: session.email,
          ));
      // The router redirect takes over from here.
    } catch (e) {
      if (mounted) {
        setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final configAsync = ref.watch(aiConfigProvider);
    return Scaffold(
      backgroundColor: Brand.bgVoid,
      body: configAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: Brand.lime)),
        error: (e, _) => Center(
            child: Text('$e', style: const TextStyle(color: Brand.orange))),
        data: (config) {
          if (_serverCtrl.text.isEmpty) _serverCtrl.text = config.serverBaseUrl;
          return SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(
                    Brand.s24, Brand.s32, Brand.s24, Brand.s24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Brand
                    const Center(child: TriStrikeWordmark(markSize: 40)),
                    const SizedBox(height: Brand.s24),
                    Text(
                      _registerMode ? 'Crée ton compte' : 'Content de te revoir',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -.5,
                          color: Brand.white),
                    ),
                    const SizedBox(height: Brand.s8),
                    Text(
                      _registerMode
                          ? 'Quelques secondes, puis on construit ton programme.'
                          : 'Connecte-toi pour retrouver ton programme.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          fontSize: 14, color: Brand.grey1, height: 1.5),
                    ),
                    const SizedBox(height: Brand.s32),

                    if (_registerMode) ...[
                      _AuthField(
                        label: 'Prénom',
                        hint: 'Ton prénom',
                        ctrl: _nameCtrl,
                        icon: Icons.person_outline_rounded,
                        textInputAction: TextInputAction.next,
                      ),
                      const SizedBox(height: Brand.s12),
                    ],
                    _AuthField(
                      label: 'Email',
                      hint: 'toi@exemple.com',
                      ctrl: _emailCtrl,
                      icon: Icons.alternate_email_rounded,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: Brand.s12),
                    _AuthField(
                      label: 'Mot de passe',
                      hint: '••••••••',
                      ctrl: _passCtrl,
                      icon: Icons.lock_outline_rounded,
                      obscure: _obscure,
                      onSubmitted: (_) => _submit(config),
                      suffixIcon: IconButton(
                        icon: Icon(
                            _obscure
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            size: 18,
                            color: Brand.grey2),
                        onPressed: () => setState(() => _obscure = !_obscure),
                      ),
                    ),

                    if (_error != null) ...[
                      const SizedBox(height: Brand.s12),
                      Row(children: [
                        const Icon(Icons.error_outline_rounded,
                            size: 15, color: Brand.orange),
                        const SizedBox(width: Brand.s8),
                        Expanded(
                          child: Text(_error!,
                              style: const TextStyle(
                                  fontSize: 12.5, color: Brand.orange)),
                        ),
                      ]),
                    ],

                    const SizedBox(height: Brand.s24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _busy ? null : () => _submit(config),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Brand.lime,
                          foregroundColor: Brand.bgVoid,
                          disabledBackgroundColor: Brand.lime.withOpacity(.4),
                          padding:
                              const EdgeInsets.symmetric(vertical: Brand.s16),
                          shape: RoundedRectangleBorder(
                              borderRadius:
                                  BorderRadius.circular(Brand.rButton)),
                        ),
                        child: _busy
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Brand.bgVoid))
                            : Text(
                                _registerMode
                                    ? 'Créer mon compte'
                                    : 'Se connecter',
                                style: const TextStyle(
                                    fontSize: 15, fontWeight: FontWeight.w700)),
                      ),
                    ),
                    const SizedBox(height: Brand.s16),
                    Center(
                      child: GestureDetector(
                        onTap: _busy
                            ? null
                            : () => setState(() {
                                  _registerMode = !_registerMode;
                                  _error = null;
                                }),
                        child: Text.rich(
                          TextSpan(
                            text: _registerMode
                                ? 'Déjà un compte ? '
                                : 'Pas encore de compte ? ',
                            style: const TextStyle(
                                fontSize: 13, color: Brand.grey1),
                            children: [
                              TextSpan(
                                text: _registerMode
                                    ? 'Se connecter'
                                    : 'Créer un compte',
                                style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: Brand.lime),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: Brand.s24),
                    const Divider(height: 1, color: Brand.border),
                    const SizedBox(height: Brand.s12),
                    // Advanced — server URL (for self-hosters / emulator)
                    GestureDetector(
                      onTap: () =>
                          setState(() => _showAdvanced = !_showAdvanced),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                              _showAdvanced
                                  ? Icons.expand_less_rounded
                                  : Icons.expand_more_rounded,
                              size: 16,
                              color: Brand.grey2),
                          const SizedBox(width: 4),
                          const Text('Réglages serveur',
                              style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Brand.grey2)),
                        ],
                      ),
                    ),
                    if (_showAdvanced) ...[
                      const SizedBox(height: Brand.s12),
                      _AuthField(
                        label: 'URL du serveur',
                        hint: AiConfig.defaultServerUrl,
                        ctrl: _serverCtrl,
                        icon: Icons.dns_rounded,
                        keyboardType: TextInputType.url,
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _AuthField extends StatelessWidget {
  const _AuthField({
    required this.label,
    required this.hint,
    required this.ctrl,
    required this.icon,
    this.obscure = false,
    this.suffixIcon,
    this.keyboardType,
    this.textInputAction,
    this.onSubmitted,
  });

  final String label, hint;
  final TextEditingController ctrl;
  final IconData icon;
  final bool obscure;
  final Widget? suffixIcon;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label,
          style: const TextStyle(
              fontSize: 12, fontWeight: FontWeight.w600, color: Brand.grey1)),
      const SizedBox(height: 6),
      TextField(
        controller: ctrl,
        obscureText: obscure,
        keyboardType: keyboardType,
        textInputAction: textInputAction,
        onSubmitted: onSubmitted,
        autocorrect: false,
        enableSuggestions: false,
        style: const TextStyle(
            fontSize: 14, color: Brand.white, fontFamily: 'SpaceGrotesk'),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Brand.grey2, fontSize: 13),
          prefixIcon: Icon(icon, size: 18, color: Brand.grey2),
          suffixIcon: suffixIcon,
          filled: true,
          fillColor: Brand.bgCard,
          contentPadding:
              const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(Brand.rChip),
              borderSide: const BorderSide(color: Brand.border)),
          enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(Brand.rChip),
              borderSide: const BorderSide(color: Brand.border)),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(Brand.rChip),
              borderSide: const BorderSide(color: Brand.lime, width: 1.5)),
        ),
      ),
    ]);
  }
}
