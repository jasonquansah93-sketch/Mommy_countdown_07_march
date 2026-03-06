/**
 * CountdownCardBackground — single source of truth for the card image pipeline.
 *
 * Both DesignPreview and HeroCountdownCard MUST use this component so that the
 * background image, overlays, blur, and brightness adjustments are rendered
 * with the exact same logic and layer order on every screen.
 *
 * Layer order (bottom → top):
 *   1. ImageBackground  (blurred photo or default baby-bg)
 *   2. Brightness overlay  (dark when brightness < 100, light when > 100)
 *   3. Adaptive content overlay  (white 0.75 for dark text / dark 0.45 for light text)
 *   4. children  (card content — badges, headline, numbers, etc.)
 */
import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSettings } from '../../types';
import { SHADOW, RADIUS } from '../../constants/tokens';

const DEFAULT_BG_GRADIENT = ['#2d1b4e', '#1a0a2e', '#2d1b4e'] as const;

interface Props {
  design: DesignSettings;
  /** Pass `isLightBackground(contentTextColor)` from the parent — true when text is white/light */
  isLightText: boolean;
  children: React.ReactNode;
  /** Style for the outer card wrapper (e.g. borderRadius, shadow) */
  cardStyle?: object;
  /** Background colour for the card wrapper View (typically colors.surface) */
  cardBgColor?: string;
}

export default function CountdownCardBackground({
  design,
  isLightText,
  children,
  cardStyle,
  cardBgColor = '#FFFFFF',
}: Props) {
  const hasCustomBg = design.backgroundPhoto != null;

  // Blur: for custom photos use design.blur
  const blurVal = design.blur ?? 0;

  // Layer 2 — Brightness overlay (only for custom photo, only when not neutral)
  const brightnessOverlayOpacity = hasCustomBg
    ? design.brightness < 100
      ? (100 - design.brightness) / 100
      : design.brightness > 100
        ? (design.brightness - 100) / 100
        : 0
    : 0;
  const brightnessOverlayColor =
    design.brightness < 100
      ? `rgba(0,0,0,${brightnessOverlayOpacity})`
      : `rgba(255,255,255,${brightnessOverlayOpacity})`;

  // Layer 3 — Adaptive content overlay
  const adaptiveOverlayColor = isLightText
    ? 'rgba(0,0,0,0.45)'
    : 'rgba(255,255,255,0.75)';

  const layers = (
    <>
      {/* Layer 2: Brightness adjustment overlay */}
      {hasCustomBg && brightnessOverlayOpacity > 0 && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: brightnessOverlayColor }]}
          pointerEvents="none"
        />
      )}

      {/* Layer 3: Adaptive content overlay */}
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: adaptiveOverlayColor }]}
        pointerEvents="none"
      />

      {/* Layer 4: Card content */}
      {children}
    </>
  );

  return (
    <View style={[styles.card, { backgroundColor: cardBgColor }, cardStyle]}>
      {hasCustomBg ? (
        <ImageBackground
          source={{ uri: design.backgroundPhoto! }}
          style={styles.fill}
          imageStyle={styles.bgImage}
          blurRadius={blurVal}
          resizeMode="cover"
        >
          {layers}
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={[...DEFAULT_BG_GRADIENT]}
          style={[styles.fill, styles.bgImage]}
        >
          {layers}
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    ...SHADOW.card,
  },
  fill: {
    width: '100%',
  },
  bgImage: {
    borderRadius: RADIUS.card,
  },
});
