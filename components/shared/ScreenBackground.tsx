/**
 * ScreenBackground — the universal screen canvas for all 4 tabs.
 *
 * Produces a two-stop vertical gradient from the theme's background color
 * (top) to a slightly deeper variant (bottom), creating depth on dark themes.
 *
 * For dark themes (e.g. basic #0D0718):
 *   top  = #0D0718 (theme background)
 *   bottom = shadeColor(background, -20) → even deeper dark
 *   Result: subtle depth that grounds the screen without being heavy.
 *
 * Mount animation: calm 320ms opacity + translateY(6→0) slide-fade.
 * Respects system Reduce Motion preference.
 *
 * RULE: GRADIENT.cinematic is only for paywall.tsx and ambient.tsx.
 * Free screens use the subtle theme-derived gradient here.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDesign } from '../../context/DesignContext';
import { shadeColor } from '../../utils/color';
import { useReducedMotion } from '../../utils/motion';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function ScreenBackground({ children, style }: Props) {
  const { colors } = useDesign();
  const reducedMotion = useReducedMotion();

  // Subtle vertical gradient: top = background, bottom = slightly darker.
  // For light themes (high luminance), use a very gentle shade shift (-6)
  // so the gradient is barely perceptible — just enough for depth.
  // For dark themes, a stronger shift (-18) creates more visible depth.
  const isLight = parseInt(colors.background.slice(1, 3), 16) > 128;
  const top = colors.background;
  const bottom = shadeColor(colors.background, isLight ? -6 : -18);

  const opacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reducedMotion ? 0 : 6)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  }, [reducedMotion]);

  return (
    <Animated.View style={[styles.root, { opacity, transform: [{ translateY }] }, style]}>
      <LinearGradient
        colors={[top, bottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
