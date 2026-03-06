import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesign } from '../../context/DesignContext';
import { useProfile } from '../../context/ProfileContext';
import { usePremium } from '../../context/PremiumContext';
import { getDaysRemaining } from '../../utils/date';
import { useReducedMotion } from '../../utils/motion';
import { Ionicons } from '@expo/vector-icons';

// Fallback gradient when no background photo (avoids missing asset)
const DEFAULT_BG_GRADIENT = ['#1a0a2e', '#2d1b4e', '#1a0a2e'] as const;

export default function AmbientScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { design } = useDesign();
  const { profile } = useProfile();
  const { isPremium } = usePremium();
  const reducedMotion = useReducedMotion();

  // Gate: redirect non-premium users to paywall
  useEffect(() => {
    if (!isPremium) {
      router.replace('/modal/paywall');
    }
  }, [isPremium]);

  const daysLeft = getDaysRemaining(profile.dueDate);

  // ── Mount animation: scale + fade (Premium cinematic entry, 300ms) ───────
  const mountOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const mountScale = useRef(new Animated.Value(reducedMotion ? 1 : 1.08)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.parallel([
      Animated.timing(mountOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(mountScale, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [reducedMotion]);

  // ── Slow pulse animation on the days number ──────────────────────────────
  const pulse = useRef(new Animated.Value(reducedMotion ? 1 : 0.88)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.88, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, [reducedMotion]);

  const hasBgPhoto = !!design.backgroundPhoto;

  if (!isPremium) return null;

  return (
    <Animated.View
      style={[
        styles.root,
        { opacity: mountOpacity, transform: [{ scale: mountScale }] },
      ]}
    >
      <StatusBar hidden />

      {hasBgPhoto ? (
        <ImageBackground
          source={{ uri: design.backgroundPhoto }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          blurRadius={design.blur ?? 0}
        >
          <View style={[StyleSheet.absoluteFill, styles.veil]} />
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={[...DEFAULT_BG_GRADIENT]}
          style={StyleSheet.absoluteFill}
        >
          <View style={[StyleSheet.absoluteFill, styles.veil]} />
        </LinearGradient>
      )}

      {/* Close button */}
      <TouchableOpacity
        style={[styles.closeZone, { top: insets.top + 12, right: 20 }]}
        onPress={() => router.back()}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <Ionicons name="close-circle" size={30} color="rgba(255,255,255,0.4)" />
      </TouchableOpacity>

      {/* Centered countdown */}
      <View style={styles.center} pointerEvents="none">
        <Animated.Text
          style={[
            styles.daysNumber,
            { transform: [{ scale: reducedMotion ? 1 : pulse }] },
          ]}
        >
          {daysLeft}
        </Animated.Text>
        <Text style={styles.daysLabel}>DAYS TO GO</Text>
        {profile.name ? (
          <Text style={styles.babyName}>{profile.name}</Text>
        ) : null}
      </View>

      {/* Tap hint */}
      <Text style={[styles.hint, { bottom: insets.bottom + 20 }]}>
        Tap to close
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  veil: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  closeZone: {
    position: 'absolute',
    zIndex: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysNumber: {
    fontSize: 120,
    fontWeight: '800',
    lineHeight: 130,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  daysLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 6,
    marginTop: 8,
    color: 'rgba(255,255,255,0.6)',
  },
  babyName: {
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: 2,
    marginTop: 16,
    color: 'rgba(255,255,255,0.45)',
  },
  hint: {
    position: 'absolute',
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.25)',
    fontSize: 13,
    letterSpacing: 1,
  },
});
