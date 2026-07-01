import 'package:shared_preferences/shared_preferences.dart';

/// Which AI backend is active.
/// - [claude] / [ollama] : the device calls the model directly (advanced mode).
/// - [server]            : the app calls the NoBrainFit back-end, which holds
///                         the keys, enforces quotas and stores history.
/// - [demo]              : no network at all — canned local responses, so the
///                         app can be shown off without any backend running.
enum AiBackend { claude, ollama, server, demo }

/// Runtime-mutable configuration stored in SharedPreferences.
class AiConfig {
  const AiConfig({
    required this.backend,
    required this.claudeApiKey,
    required this.ollamaBaseUrl,
    required this.ollamaModel,
    required this.serverBaseUrl,
    required this.serverToken,
    required this.serverEmail,
  });

  final AiBackend backend;
  final String claudeApiKey;
  final String ollamaBaseUrl;
  final String ollamaModel;
  final String serverBaseUrl;
  final String serverToken;
  final String serverEmail;

  /// True when the server backend is selected and the user is authenticated.
  bool get serverReady => serverToken.isNotEmpty;

  /// True when running in demo mode (no backend required).
  bool get isDemo => backend == AiBackend.demo;

  // ── Keys ─────────────────────────────────────────────────────
  static const _kBackend     = 'ai_backend';
  static const _kApiKey      = 'claude_api_key';
  static const _kOllamaUrl   = 'ollama_base_url';
  static const _kOllamaModel = 'ollama_model';
  static const _kServerUrl   = 'server_base_url';
  static const _kServerToken = 'server_token';
  static const _kServerEmail = 'server_email';

  // ── Defaults ─────────────────────────────────────────────────
  // On Android emulator, host machine localhost = 10.0.2.2.
  // On a real device on the same WiFi, use the machine's local IP.
  static const defaultOllamaUrl   = 'http://10.0.2.2:11434';
  static const defaultOllamaModel = 'llama3.2';
  static const defaultClaudeModel = 'claude-haiku-4-5-20251001';
  static const defaultServerUrl   = 'http://10.0.2.2:3000';

  static AiConfig get defaults => const AiConfig(
    backend: AiBackend.server,
    claudeApiKey: '',
    ollamaBaseUrl: defaultOllamaUrl,
    ollamaModel: defaultOllamaModel,
    serverBaseUrl: defaultServerUrl,
    serverToken: '',
    serverEmail: '',
  );

  static AiBackend _parseBackend(String? raw) => switch (raw) {
        'claude' => AiBackend.claude,
        'ollama' => AiBackend.ollama,
        'demo' => AiBackend.demo,
        _ => AiBackend.server,
      };

  // ── Persistence ───────────────────────────────────────────────
  static Future<AiConfig> load() async {
    final p = await SharedPreferences.getInstance();
    return AiConfig(
      backend:       _parseBackend(p.getString(_kBackend)),
      claudeApiKey:  p.getString(_kApiKey)      ?? '',
      ollamaBaseUrl: p.getString(_kOllamaUrl)   ?? defaultOllamaUrl,
      ollamaModel:   p.getString(_kOllamaModel) ?? defaultOllamaModel,
      serverBaseUrl: p.getString(_kServerUrl)   ?? defaultServerUrl,
      serverToken:   p.getString(_kServerToken) ?? '',
      serverEmail:   p.getString(_kServerEmail) ?? '',
    );
  }

  Future<void> save() async {
    final p = await SharedPreferences.getInstance();
    await p.setString(_kBackend,     backend.name);
    await p.setString(_kApiKey,      claudeApiKey);
    await p.setString(_kOllamaUrl,   ollamaBaseUrl);
    await p.setString(_kOllamaModel, ollamaModel);
    await p.setString(_kServerUrl,   serverBaseUrl);
    await p.setString(_kServerToken, serverToken);
    await p.setString(_kServerEmail, serverEmail);
  }

  AiConfig copyWith({
    AiBackend? backend,
    String? claudeApiKey,
    String? ollamaBaseUrl,
    String? ollamaModel,
    String? serverBaseUrl,
    String? serverToken,
    String? serverEmail,
  }) => AiConfig(
    backend:       backend       ?? this.backend,
    claudeApiKey:  claudeApiKey  ?? this.claudeApiKey,
    ollamaBaseUrl: ollamaBaseUrl ?? this.ollamaBaseUrl,
    ollamaModel:   ollamaModel   ?? this.ollamaModel,
    serverBaseUrl: serverBaseUrl ?? this.serverBaseUrl,
    serverToken:   serverToken   ?? this.serverToken,
    serverEmail:   serverEmail   ?? this.serverEmail,
  );
}
