import 'package:flutter/material.dart';

abstract final class Brand {
  // ── Backgrounds ──────────────────────────────────────────────
  static const Color bgVoid    = Color(0xFF08080C);
  static const Color bgSurface = Color(0xFF111115);
  static const Color bgCard    = Color(0xFF16161C); // charte §02
  static const Color bgCardHi  = Color(0xFF1C1C24);

  // ── Accents (one per pillar) ──────────────────────────────────
  static const Color lime   = Color(0xFFCCFF00); // Nutrition
  static const Color blue   = Color(0xFF3D8EFF); // Training
  static const Color orange = Color(0xFFFF5C2B); // Cuisine

  // ── Neutrals ─────────────────────────────────────────────────
  static const Color white  = Color(0xFFF5F5F7);
  static const Color grey1  = Color(0xFF9898A8);
  static const Color grey2  = Color(0xFF56565F);
  static const Color grey3  = Color(0xFF2A2A32);

  // ── Borders ──────────────────────────────────────────────────
  static const Color border  = Color(0x12FFFFFF); // 7%  (charte)
  static const Color border2 = Color(0x24FFFFFF); // 14% (charte)

  // ── Typefaces ────────────────────────────────────────────────
  static const String fontHead = 'SpaceGrotesk'; // Display & UI (primaire)
  static const String fontMono = 'SpaceMono';    // Données & valeurs (secondaire)

  /// Monospace style for data readouts — values, statistics, counters.
  /// Mirrors the charte's `.t-mono` token (Space Mono).
  static TextStyle mono({
    double size = 13,
    FontWeight weight = FontWeight.w700,
    Color color = white,
    double letterSpacing = 0,
  }) =>
      TextStyle(
        fontFamily: fontMono,
        fontSize: size,
        fontWeight: weight,
        color: color,
        letterSpacing: letterSpacing,
      );

  // ── Spacing (base-4) ─────────────────────────────────────────
  static const double s4  = 4;
  static const double s8  = 8;
  static const double s12 = 12;
  static const double s16 = 16;
  static const double s20 = 20;
  static const double s24 = 24;
  static const double s32 = 32;
  static const double s40 = 40;
  static const double s48 = 48;

  // ── Border radii ─────────────────────────────────────────────
  static const double rTag    = 4;
  static const double rChip   = 8;
  static const double rButton = 12;
  static const double rCard   = 16;
  static const double rRow    = 20;
  static const double rSheet  = 24;

  // ── Accent helpers ───────────────────────────────────────────
  static Color limeAlpha(double opacity)   => lime.withOpacity(opacity);
  static Color blueAlpha(double opacity)   => blue.withOpacity(opacity);
  static Color orangeAlpha(double opacity) => orange.withOpacity(opacity);

  // ── Section accent by index ──────────────────────────────────
  static Color accentFor(SectionType type) => switch (type) {
    SectionType.eat   => lime,
    SectionType.train => blue,
    SectionType.cook  => orange,
  };

  // ── Visual richness ──────────────────────────────────────────
  /// Subtle top-to-bottom card gradient — adds depth without noise.
  static LinearGradient cardGradient([Color base = bgCard]) => LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Color.alphaBlend(Colors.white.withOpacity(.018), base),
          base,
        ],
      );

  /// Accent-tinted tile gradient used behind pillar icons.
  static LinearGradient accentTile(Color accent) => LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [accent.withOpacity(.18), accent.withOpacity(.06)],
      );

  /// Soft accent glow for elevated / focused surfaces.
  static List<BoxShadow> accentGlow(Color accent, {double opacity = .14, double blur = 22, double spread = -6}) => [
        BoxShadow(
          color: accent.withOpacity(opacity),
          blurRadius: blur,
          spreadRadius: spread,
          offset: const Offset(0, 6),
        ),
      ];
}

enum SectionType { eat, train, cook }
