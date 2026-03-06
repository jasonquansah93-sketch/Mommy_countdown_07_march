import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePremium } from '../../context/PremiumContext';
import { useDesign } from '../../context/DesignContext';
import { GRADIENT } from '../../constants/tokens';
import { useReducedMotion } from '../../utils/motion';

const HIGHLIGHTS = [
  {
    icon: 'images-outline' as const,
    title: 'Unlimited Moments',
    body: 'Capture every feeling, every day, without limits.',
  },
  {
    icon: 'color-palette-outline' as const,
    title: 'All Premium Designs',
    body: 'Bloom, Moon, Luxe — every preset, font and filter unlocked.',
  },
  {
    icon: 'moon-outline' as const,
    title: 'Ambient Countdown',
    body: 'Turn any screen into a cinematic bedside display.',
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium, togglePremium } = usePremium();
  const { colors } = useDesign();
  const reducedMotion = useReducedMotion();

  // Hero fade-in — skipped when Reduce Motion is enabled
  const heroOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const heroTranslate = useRef(new Animated.Value(reducedMotion ? 0 : 24)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(heroTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [reducedMotion]);

  // If already premium after activating, auto-close
  useEffect(() => {
    if (isPremium) {
      const t = setTimeout(() => router.back(), 300);
      return () => clearTimeout(t);
    }
  }, [isPremium]);

  const handleUpgrade = () => {
    // In production this would call StoreKit/RevenueCat.
    // For now togglePremium() simulates the purchase.
    togglePremium();
  };

  const handleRestore = () => {
    // In production: restore purchases.
    togglePremium();
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={GRADIENT.cinematic}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Close button */}
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 12 }]}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View
          style={[
            styles.heroBlock,
            { opacity: heroOpacity, transform: [{ translateY: heroTranslate }] },
          ]}
        >
          <View style={styles.crownCircle}>
            <Ionicons name="heart" size={34} color="#FFFFFF" />
          </View>

          <Text style={styles.eyebrow}>MOMMYCOUNT PLUS</Text>
          <Text style={styles.heroHeadline}>Your story deserves{'\n'}to be kept.</Text>
          <Text style={styles.heroSub}>
            One season. One story. Kept forever.
          </Text>
        </Animated.View>

        {/* Highlights */}
        <View style={styles.highlights}>
          {HIGHLIGHTS.map((h) => (
            <View key={h.icon} style={styles.highlightRow}>
              <View style={styles.highlightIconCircle}>
                <Ionicons name={h.icon} size={20} color="#FFFFFF" />
              </View>
              <View style={styles.highlightText}>
                <Text style={styles.highlightTitle}>{h.title}</Text>
                <Text style={styles.highlightBody}>{h.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingBlock}>
          {/* Lifetime anchor — makes annual feel obvious */}
          <TouchableOpacity style={styles.lifetimeRow} activeOpacity={0.7}>
            <Text style={styles.lifetimeLabel}>Lifetime access</Text>
            <Text style={styles.lifetimePrice}>$14.99</Text>
          </TouchableOpacity>

          {/* Primary CTA */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleUpgrade}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#FF6EC7', '#E040FB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>Start Premium — $4.99 / year</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.ctaNote}>$0.41 / month  •  Cancel anytime</Text>
        </View>

        {/* Restore */}
        <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legal}>
          Payment charged to your Apple ID account. Subscription renews automatically.
          Cancel any time in App Store settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GRADIENT.cinematic[0],
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroBlock: {
    alignItems: 'center',
    marginBottom: 40,
  },
  crownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  heroHeadline: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  highlights: {
    width: '100%',
    marginBottom: 36,
    gap: 20,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  highlightIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  highlightText: {
    flex: 1,
    paddingTop: 2,
  },
  highlightTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  highlightBody: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 19,
  },
  pricingBlock: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  lifetimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  lifetimeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '600',
  },
  lifetimePrice: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  ctaButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#E040FB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 12,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ctaNote: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textAlign: 'center',
  },
  restoreBtn: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  restoreText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontWeight: '500',
  },
  legal: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});
