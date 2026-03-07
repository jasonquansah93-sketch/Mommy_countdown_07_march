/**
 * EditorialHeroCountdown — großes kuratiertes Herzstück, atmosphärisch.
 * Mock-up-fidel: 45–50% Bildschirmhöhe, layered sepia/beige, Weeks/Days/Hours + Min:Sec-Pille.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  useWindowDimensions,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '../../../context/ProfileContext';
import { useDesign } from '../../../context/DesignContext';
import { usePremium } from '../../../context/PremiumContext';
import { getWeeksAndDays, getTimeUntilDueMs } from '../../../utils/date';
import { useRouter } from 'expo-router';
import { getResolvedFontFamily } from '../../../constants/fonts';
import { EDITORIAL, EDITORIAL_RADIUS, EDITORIAL_TYPOGRAPHY } from '../../../theme/editorialTheme';

interface Props {
  onScrollToDetails?: () => void;
}

/** Layered sepia/beige — bildähnlich, weiche Blur-/Glow-Flächen, leichte Vignette */
const HERO_GRADIENT = ['#F8F4EE', '#F2EDE4', '#EDE6DC', '#E8E0D4', '#E2D9CC'] as const;
const HERO_OVERLAY = ['rgba(255,252,248,0.4)', 'rgba(0,0,0,0.02)'] as const;

export default function EditorialHeroCountdown({ onScrollToDetails }: Props) {
  const { height: screenHeight } = useWindowDimensions();
  const heroHeight = Math.max(screenHeight * 0.48, 340);

  const { profile } = useProfile();
  const { design } = useDesign();
  const { isPremium } = usePremium();
  const router = useRouter();
  const cardRef = useRef<View>(null);

  const { weeks, days } = getWeeksAndDays(profile.dueDate);
  const [time, setTime] = useState(getTimeUntilDueMs(profile.dueDate));
  const countdownStarted = profile.countdownStarted === true;

  useEffect(() => {
    if (!countdownStarted) return;
    const interval = setInterval(() => {
      setTime(getTimeUntilDueMs(profile.dueDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [profile.dueDate, countdownStarted]);

  const genderLabel =
    profile.gender === 'boy' ? "It's a Boy" : profile.gender === 'girl' ? "It's a Girl" : "It's a Surprise";

  const displayFont = getResolvedFontFamily(design.fontFamily);
  const showGenderBadge = !design.hideGenderLabel;

  const handleShare = async () => {
    try {
      const uri = await captureRef(cardRef, { format: 'jpg', quality: 0.92 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'image/jpeg', dialogTitle: 'Share our countdown' });
      } else {
        Share.share({ message: `Only ${weeks} weeks and ${days} days until we meet our baby!` });
      }
    } catch {
      Share.share({ message: `Only ${weeks} weeks and ${days} days until we meet our baby!` });
    }
  };

  return (
    <View style={styles.wrapper} ref={cardRef} collapsable={false}>
      <View style={[styles.hero, { minHeight: heroHeight }]}>
        {/* Layer 1: Base sepia gradient */}
        <LinearGradient
          colors={[...HERO_GRADIENT]}
          style={StyleSheet.absoluteFill}
        />
        {/* Layer 2: Subtle overlay — organic depth, leichte Vignette */}
        <LinearGradient
          colors={HERO_OVERLAY}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Layer 3: Very subtle radial-like darkening at edges (diagonal) */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.03)']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content}>
          {/* Top row */}
          <View style={styles.topRow}>
            {showGenderBadge ? (
              <View style={styles.badge}>
                <Text style={[styles.badgeText, { fontFamily: displayFont }]}>{genderLabel}</Text>
                {isPremium && (
                  <Ionicons name="star" size={10} color={EDITORIAL.primary} style={styles.badgeStar} />
                )}
              </View>
            ) : (
              <View style={{ width: 1 }} />
            )}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push('/(tabs)/design')}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={16} color={EDITORIAL.textSecondary} />
            </TouchableOpacity>
          </View>

          {!countdownStarted ? (
            <View style={styles.notStarted}>
              <Text style={[styles.notStartedTitle, { fontFamily: displayFont }]}>Ready to start?</Text>
              <Text style={[styles.notStartedSub, { fontFamily: displayFont }]}>
                Set your dates and begin counting down
              </Text>
              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={() => onScrollToDetails?.()}
                activeOpacity={0.8}
              >
                <Text style={styles.ctaText}>Start your countdown</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[styles.headline, { fontFamily: displayFont }]}>
                {design.headlineText || 'Meeting you in...'}
              </Text>

              {/* Main countdown: Weeks / Days / Hours */}
              <View style={styles.countdown}>
                <View style={styles.primaryRow}>
                  <Unit value={String(weeks).padStart(2, '0')} label="WEEKS" fontFamily={displayFont} />
                  <View style={styles.divider} />
                  <Unit value={String(days).padStart(2, '0')} label="DAYS" fontFamily={displayFont} />
                  <View style={styles.divider} />
                  <Unit value={String(time.hours).padStart(2, '0')} label="HOURS" fontFamily={displayFont} />
                </View>
                {/* Mini-Timer: Min:Sec in Pille */}
                <View style={styles.miniTimerPill}>
                  <Text style={[styles.miniTimerText, { fontFamily: displayFont }]}>
                    {String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
                  </Text>
                </View>
              </View>

              {/* Share CTA — immer sichtbar wenn Countdown läuft */}
              <TouchableOpacity style={styles.ctaBtn} onPress={handleShare} activeOpacity={0.8}>
                  <Ionicons name="share-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.ctaText}>Share our countdown</Text>
                </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

function Unit({
  value,
  label,
  fontFamily,
}: {
  value: string;
  label: string;
  fontFamily: string;
}) {
  return (
    <View style={styles.unit}>
      <Text style={[styles.unitValue, { fontFamily }]}>{value}</Text>
      <Text style={[styles.unitLabel, { fontFamily }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: EDITORIAL_RADIUS.card,
    overflow: 'hidden',
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 8,
  },
  hero: {
    overflow: 'hidden',
    borderRadius: EDITORIAL_RADIUS.card,
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: EDITORIAL.text,
  },
  badgeStar: {
    marginLeft: 6,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notStarted: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  notStartedTitle: {
    fontSize: 26,
    fontWeight: '300',
    color: EDITORIAL.text,
    marginBottom: 10,
  },
  notStartedSub: {
    fontSize: 15,
    color: EDITORIAL.textSecondary,
    marginBottom: 32,
  },
  headline: {
    ...EDITORIAL_TYPOGRAPHY.headline,
    fontSize: 26,
    color: EDITORIAL.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  countdown: {
    alignItems: 'center',
    marginBottom: 28,
  },
  primaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unit: {
    alignItems: 'center',
    minWidth: 72,
  },
  unitValue: {
    fontSize: 58,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    color: EDITORIAL.text,
    letterSpacing: -1,
  },
  unitLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: EDITORIAL.textSecondary,
    marginTop: 6,
    opacity: 0.9,
  },
  divider: {
    width: 1,
    height: 52,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 22,
  },
  miniTimerPill: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  miniTimerText: {
    fontSize: 22,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    color: EDITORIAL.text,
    letterSpacing: 0.5,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: EDITORIAL.primary,
    paddingVertical: 16,
    borderRadius: EDITORIAL_RADIUS.button,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
