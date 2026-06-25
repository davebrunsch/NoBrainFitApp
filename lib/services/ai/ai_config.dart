import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Which AI backend is active.
enum AiBackend { claude, ollama }

/// Runtime-mutable configuration stored in SharedPreferences.
class AiConfig {
  const AiConfig({
    required this.backend,
    required this.claudeApiKey,
    required this.ollamaBaseUrl,
    required this.ollamaModel,
  });

  final AiBackend backend;
  final String claudeApiKey;
  final String ollamaBaseUrl;
  final String ollamaModel;

  // ── Keys ─────────────────────────────────────────────────────
  static const _kBackend    = 'ai_backend';
  static const _kApiKey     = 'claude_api_key';
  static const _kOllamaUrl  = 'ollama_base_url';
  static const _kOllamaModel = 'ollama_model';

  // ── Defaults ─────────────────────────────────────────────────
  // On Android emulator, host machine localhost = 10.0.2.2.
  // On a real device on the same WiFi, use the machine's local IP.
  static const defaultOllamaUrl   = 'http://10.0.2.2:11434';
  static const defaultOllamaModel = 'llama3.2';
  static const defaultClaudeModel = 'claude-haiku-4-5-20251001';

  static AiConfig get defaults => const AiConfig(
    backend: AiBackend.ollama,
    claudeApiKey: '',
    ollamaBaseUrl: defaultOllamaUrl,
    ollamaModel: defaultOllamaModel,
  );

  // ── Persistence ───────────────────────────────────────────────
  static Future<AiConfig> load() async {
    final p = await SharedPreferences.getInstance();
    return AiConfig(
      backend:      p.getString(_kBackend) == 'claude' ? AiBackend.claude : AiBackend.ollama,
      claudeApiKey: p.getString(_kApiKey)     ?? '',
      ollamaBaseUrl: p.getString(_kOllamaUrl) ?? defaultOllamaUrl,
      ollamaModel:  p.getString(_kOllamaModel) ?? defaultOllamaModel,
    );
  }

  Future<void> save() async {
    final p = await SharedPreferences.getInstance();
    await p.setString(_kBackend,     backend == AiBackend.claude ? 'claude' : 'ollama');
    await p.setString(_kApiKey,      claudeApiKey);
    await p.setString(_kOllamaUrl,   ollamaBaseUrl);
    await p.setString(_kOllamaModel, ollamaModel);
  }

  AiConfig copyWith({
    AiBackend? backend,
    String? claudeApiKey,
    String? ollamaBaseUrl,
    String? ollamaModel,
  }) => AiConfig(
    backend:       backend       ?? this.backend,
    claudeApiKey:  claudeApiKey  ?? this.claudeApiKey,
    ollamaBaseUrl: ollamaBaseUrl ?? this.ollamaBaseUrl,
    ollamaModel:   ollamaModel   ?? this.ollamaModel,
  );
}
