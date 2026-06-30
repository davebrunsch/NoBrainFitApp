import 'package:flutter/material.dart';

abstract final class Brand {
  // ── Backgrounds — « fond d'acier » (charte V2.0 §02) ──────────
  static const Color bgVoid    = Color(0xFF0B0B0F); // Void · background
  static const Color bgSurface = Color(0xFF101015); // sous-couche
  static const Color bgCard    = Color(0xFF16161B); // Surface · cards
  static const Color bgCardHi  = Color(0xFF1C1C22); // surface surélevée

  // ── Accent unique « Lume » ────────────────────────────────────
  // La charte V2.0 ne code plus les piliers par couleur : un seul
  // accent vif (le Lume), réservé à l'action et à la donnée vivante.
  static const Color lume = Color(0xFFC4ED4A); // Accent · Signature

  // Alias rétro-compat : les anciens accents par pilier pointent
  // tous vers le Lume — un seul accent dans tout le système.
  static const Color lime   = lume;
  static const Color blue   = lume;
  static const Color orange = lume;

  // ── Acier & graphite (le reste vit en niveaux d'acier) ────────
  static const Color acier  = Color(0xFFD8D8DE); // Marque · Lignes
  static const Color titane  = Color(0xFF86868F); // 3e bande · Repos · Icônes
  static const Color graphite = Color(0xFF55555E); // Labels · Mono

  // ── Neutrals ─────────────────────────────────────────────────
  static const Color white  = Color(0xFFF2F2F4); // White Ice · texte principal
  static const Color grey1  = Color(0xFF9A9AA4); // Silver · texte secondaire
  static const Color grey2  = Color(0xFF55555E); // Graphite · labels
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

  /// Section label — Space Mono, uppercase tracking (charte `.t-label`).
  static const TextStyle labelMono = TextStyle(
    fontFamily: fontMono,
    fontSize: 10,
    fontWeight: FontWeight.w700,
    letterSpacing: 1.2,
    color: grey2,
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

  // ── Accent helpers (un seul accent : le Lume) ─────────────────
  static Color lumeAlpha(double opacity)   => lume.withOpacity(opacity);
  static Color limeAlpha(double opacity)   => lume.withOpacity(opacity);
  static Color blueAlpha(double opacity)   => lume.withOpacity(opacity);
  static Color orangeAlpha(double opacity) => lume.withOpacity(opacity);

  // ── Section accent ────────────────────────────────────────────
  // Les piliers ne sont plus codés par couleur (charte V2.0) — ils
  // se distinguent par leur index numérique. L'accent reste le Lume.
  static Color accentFor(SectionType type) => lume;

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

  /// Accent-tinted tile gradient — réservé aux états actifs.
  static LinearGradient accentTile(Color accent) => LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [accent.withOpacity(.18), accent.withOpacity(.06)],
      );

  /// Steel tile gradient — fond neutre des icônes au repos.
  /// L'acier porte le reste ; le Lume ne marque que l'état actif.
  static LinearGradient steelTile() => LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color.alphaBlend(Colors.white.withOpacity(.05), bgCardHi), bgCardHi],
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
