import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  static const _kName = 'profile_name';
  static const _kGoal = 'profile_goal';
  static const _kNotifications = 'pref_notifications';
  static const _kSound = 'pref_sound';

  final _nameController = TextEditingController();
  String _goal = 'maintain';
  bool _notifications = true;
  bool _sound = true;
  bool _loaded = false;

  static const _goals = <String, ({String emoji, String label})>{
    'lose': (emoji: '🔥', label: 'Perdre du gras'),
    'maintain': (emoji: '⚖️', label: 'Maintenir'),
    'gain': (emoji: '💪', label: 'Prendre du muscle'),
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _nameController.text = prefs.getString(_kName) ?? '';
      _goal = prefs.getString(_kGoal) ?? 'maintain';
      _notifications = prefs.getBool(_kNotifications) ?? true;
      _sound = prefs.getBool(_kSound) ?? true;
      _loaded = true;
    });
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kName, _nameController.text.trim());
    await prefs.setString(_kGoal, _goal);
    await prefs.setBool(_kNotifications, _notifications);
    await prefs.setBool(_kSound, _sound);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Préférences enregistrées ✅'),
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      body: SafeArea(
        child: !_loaded
            ? const Center(child: CircularProgressIndicator())
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: () => context.pop(),
                          child: Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.chevron_left,
                                color: Colors.white, size: 22),
                          ),
                        ),
                        const SizedBox(width: 14),
                        const Text('⚙️', style: TextStyle(fontSize: 26)),
                        const SizedBox(width: 8),
                        const Text('Réglages',
                            style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: Colors.white)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                      children: [
                        const _Avatar(),
                        const SizedBox(height: 28),
                        const _SectionLabel('Profil'),
                        const SizedBox(height: 10),
                        _Card(
                          child: TextField(
                            controller: _nameController,
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              labelText: 'Ton prénom',
                              labelStyle:
                                  const TextStyle(color: Colors.white54),
                              border: InputBorder.none,
                              icon: Icon(Icons.person_outline,
                                  color: Colors.white.withOpacity(0.6)),
                            ),
                          ),
                        ),
                        const SizedBox(height: 28),
                        const _SectionLabel('Objectif'),
                        const SizedBox(height: 10),
                        ..._goals.entries.map((e) {
                          final selected = _goal == e.key;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: GestureDetector(
                              onTap: () => setState(() => _goal = e.key),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 150),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 18, vertical: 16),
                                decoration: BoxDecoration(
                                  color: selected
                                      ? const Color(0xFFE8622A)
                                          .withOpacity(0.15)
                                      : Colors.white.withOpacity(0.05),
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(
                                    color: selected
                                        ? const Color(0xFFE8622A)
                                        : Colors.white.withOpacity(0.1),
                                    width: selected ? 2 : 1.5,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Text(e.value.emoji,
                                        style: const TextStyle(fontSize: 24)),
                                    const SizedBox(width: 14),
                                    Text(e.value.label,
                                        style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w600,
                                            color: Colors.white)),
                                    const Spacer(),
                                    if (selected)
                                      const Icon(Icons.check_circle,
                                          color: Color(0xFFE8622A), size: 22),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }),
                        const SizedBox(height: 18),
                        const _SectionLabel('Préférences'),
                        const SizedBox(height: 10),
                        _Card(
                          child: Column(
                            children: [
                              _SwitchRow(
                                emoji: '🔔',
                                label: 'Notifications',
                                value: _notifications,
                                onChanged: (v) =>
                                    setState(() => _notifications = v),
                              ),
                              Divider(
                                  color: Colors.white.withOpacity(0.08),
                                  height: 24),
                              _SwitchRow(
                                emoji: '🔊',
                                label: 'Sons',
                                value: _sound,
                                onChanged: (v) => setState(() => _sound = v),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 28),
                        const _SectionLabel('À propos'),
                        const SizedBox(height: 10),
                        _Card(
                          child: Row(
                            children: [
                              Icon(Icons.info_outline,
                                  color: Colors.white.withOpacity(0.6)),
                              const SizedBox(width: 14),
                              const Text('NoBrainFit',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600)),
                              const Spacer(),
                              const Text('v1.0.0',
                                  style: TextStyle(color: Colors.white38)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 28),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _save,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFE8622A),
                              foregroundColor: Colors.white,
                              padding:
                                  const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(18),
                              ),
                            ),
                            child: const Text('Enregistrer',
                                style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 88,
        height: 88,
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            colors: [Color(0xFFE8622A), Color(0xFFC0392B)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: const Icon(Icons.person, color: Colors.white, size: 44),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text.toUpperCase(),
      style: const TextStyle(
        color: Colors.white38,
        fontSize: 12,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.2,
      ),
    );
  }
}

class _Card extends StatelessWidget {
  final Widget child;
  const _Card({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.1), width: 1.5),
      ),
      child: child,
    );
  }
}

class _SwitchRow extends StatelessWidget {
  final String emoji, label;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _SwitchRow({
    required this.emoji,
    required this.label,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(emoji, style: const TextStyle(fontSize: 20)),
        const SizedBox(width: 14),
        Text(label,
            style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w600)),
        const Spacer(),
        Switch(
          value: value,
          onChanged: onChanged,
          activeColor: const Color(0xFFE8622A),
        ),
      ],
    );
  }
}
