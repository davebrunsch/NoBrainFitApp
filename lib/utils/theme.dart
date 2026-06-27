import 'package:flutter/material.dart';
import 'brand.dart';

class AppTheme {
  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        fontFamily: 'SpaceGrotesk',
        scaffoldBackgroundColor: Brand.bgVoid,
        colorScheme: ColorScheme.dark(
          primary:    Brand.lime,
          secondary:  Brand.blue,
          tertiary:   Brand.orange,
          surface:    Brand.bgCard,
          onSurface:  Brand.white,
          outline:    Brand.border,
        ),
        textTheme: const TextTheme(
          // Display
          displayLarge:  TextStyle(fontSize: 48, fontWeight: FontWeight.w700, letterSpacing: -2,   color: Brand.white),
          displayMedium: TextStyle(fontSize: 36, fontWeight: FontWeight.w600, letterSpacing: -1.2, color: Brand.white),
          // Headline
          headlineLarge:  TextStyle(fontSize: 26, fontWeight: FontWeight.w600, letterSpacing: -.6, color: Brand.white),
          headlineMedium: TextStyle(fontSize: 22, fontWeight: FontWeight.w600, letterSpacing: -.4, color: Brand.white),
          headlineSmall:  TextStyle(fontSize: 18, fontWeight: FontWeight.w600, letterSpacing: -.3, color: Brand.white),
          // Title
          titleLarge:  TextStyle(fontSize: 16, fontWeight: FontWeight.w600, letterSpacing: -.2, color: Brand.white),
          titleMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: -.1, color: Brand.white),
          // Body
          bodyLarge:  TextStyle(fontSize: 15, fontWeight: FontWeight.w400, color: Brand.grey1, height: 1.65),
          bodyMedium: TextStyle(fontSize: 13, fontWeight: FontWeight.w400, color: Brand.grey1, height: 1.5),
          bodySmall:  TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Brand.grey2, letterSpacing: .04),
          // Label
          labelLarge:  TextStyle(fontSize: 14, fontWeight: FontWeight.w700, letterSpacing: -.1, color: Brand.white),
          labelMedium: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: .14, color: Brand.grey2),
          labelSmall:  TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: .18, color: Brand.grey2),
        ),
        cardTheme: CardTheme(
          color: Brand.bgCard,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(Brand.rCard),
            side: BorderSide(color: Brand.border),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Brand.lime,
            foregroundColor: Brand.bgVoid,
            textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, fontFamily: 'SpaceGrotesk'),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rButton)),
            padding: const EdgeInsets.symmetric(vertical: 15),
            elevation: 0,
            overlayColor: Brand.bgVoid.withOpacity(.08),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: Brand.grey1,
            side: BorderSide(color: Brand.border2),
            textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, fontFamily: 'SpaceGrotesk'),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Brand.rButton)),
            padding: const EdgeInsets.symmetric(vertical: 15),
          ),
        ),
        dividerTheme: DividerThemeData(color: Brand.border, thickness: 1, space: 0),
        iconTheme: IconThemeData(color: Brand.grey2, size: 20),
        splashColor: Brand.border,
        highlightColor: Brand.border,
        bottomSheetTheme: BottomSheetThemeData(
          backgroundColor: Brand.bgCard,
          surfaceTintColor: Colors.transparent,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(Brand.rSheet)),
          ),
        ),
      );
}
