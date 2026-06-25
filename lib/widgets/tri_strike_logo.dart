import 'package:flutter/material.dart';
import 'package:no_brain_fit/utils/brand.dart';

/// The NoBrainFit "Tri-Strike" logo mark.
/// Three angled geometric bars — one per pillar (Nutrition / Training / Cuisine).
class TriStrikeMark extends StatelessWidget {
  const TriStrikeMark({super.key, this.size = 32});

  final double size;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _TriStrikePainter(),
    );
  }
}

class _TriStrikePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    void drawBar(Color color, double yCenter) {
      final paint = Paint()
        ..color = color
        ..style = PaintingStyle.fill;

      final barW = w * 0.72;
      final barH = h * 0.14;
      final rx    = barH / 2;
      final angle = -18 * 3.14159265 / 180;

      final rect = RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(w * 0.42, yCenter),
          width: barW,
          height: barH,
        ),
        Radius.circular(rx),
      );

      canvas.save();
      canvas.translate(w * 0.42, yCenter);
      canvas.rotate(angle);
      canvas.translate(-w * 0.42, -yCenter);
      canvas.drawRRect(rect, paint);
      canvas.restore();
    }

    drawBar(Brand.lime,   h * 0.23);
    drawBar(Brand.blue,   h * 0.50);
    drawBar(Brand.orange, h * 0.77);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Full wordmark: Tri-Strike mark + "NoBrainFit" text.
class TriStrikeWordmark extends StatelessWidget {
  const TriStrikeWordmark({super.key, this.markSize = 26});

  final double markSize;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        TriStrikeMark(size: markSize),
        SizedBox(width: markSize * 0.34),
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: 'NoBrain',
                style: TextStyle(
                  fontFamily: 'SpaceGrotesk',
                  fontSize: markSize * 0.62,
                  fontWeight: FontWeight.w700,
                  color: Brand.white,
                  letterSpacing: -0.4,
                ),
              ),
              TextSpan(
                text: 'Fit',
                style: TextStyle(
                  fontFamily: 'SpaceGrotesk',
                  fontSize: markSize * 0.62,
                  fontWeight: FontWeight.w700,
                  color: Brand.lime,
                  letterSpacing: -0.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
