import 'package:shared_preferences/shared_preferences.dart';

/// User preferences for the guided workout session.
class TrainingPrefs {
  const TrainingPrefs({
    required this.defaultRestSec,
    required this.vibrate,
    required this.sound,
  });

  final int defaultRestSec; // used when a generated exercise has no rest value
  final bool vibrate;       // haptic feedback on set done / rest end
  final bool sound;         // system alert sound on rest end

  static const defaults = TrainingPrefs(defaultRestSec: 60, vibrate: true, sound: false);

  static const _kRest    = 'training_default_rest';
  static const _kVibrate = 'training_vibrate';
  static const _kSound   = 'training_sound';

  static Future<TrainingPrefs> load() async {
    final p = await SharedPreferences.getInstance();
    return TrainingPrefs(
      defaultRestSec: p.getInt(_kRest) ?? defaults.defaultRestSec,
      vibrate: p.getBool(_kVibrate) ?? defaults.vibrate,
      sound: p.getBool(_kSound) ?? defaults.sound,
    );
  }

  Future<void> save() async {
    final p = await SharedPreferences.getInstance();
    await p.setInt(_kRest, defaultRestSec);
    await p.setBool(_kVibrate, vibrate);
    await p.setBool(_kSound, sound);
  }

  TrainingPrefs copyWith({int? defaultRestSec, bool? vibrate, bool? sound}) => TrainingPrefs(
        defaultRestSec: defaultRestSec ?? this.defaultRestSec,
        vibrate: vibrate ?? this.vibrate,
        sound: sound ?? this.sound,
      );
}
