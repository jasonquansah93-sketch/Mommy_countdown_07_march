import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  TouchableOpacity,
  // TouchableOpacity still needed for edit + share buttons
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../context/ProfileContext';
import { useDesign } from '../../context/DesignContext';
import { getResolvedFontFamily } from '../../constants/fonts';
import { getContrastingTextColor, getBadgeTextColor, isLightBackground } from '../../utils/contrast';
import { usePremium } from '../../context/PremiumContext';
import { getWeeksAndDays, getTimeUntilDueMs } from '../../utils/date';
import GradientButton from './GradientButton';
import { useRouter } from 'expo-router';
import CountdownCardBackground from '../shared/CountdownCardBackground';

interface Props {
  onScrollToDetails?: () => void;
}

export default function HeroCountdownCard({ onScrollToDetails }: Props) {
  const { profile } = useProfile();
  const { colors, design } = useDesign();
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
    }, 100);
    return () => clearInterval(interval);
  }, [profile.dueDate, countdownStarted]);

  const genderLabel =
    profile.gender === 'boy'
      ? "IT'S A BOY"
      : profile.gender === 'girl'
        ? "IT'S A GIRL"
        : "IT'S A SURPRISE";

  const displayFont = getResolvedFontFamily(design.fontFamily);
  const showGenderBadge = !design.hideGenderLabel;

  const mode = design.textColorMode ?? 'auto';
  const customColor = design.customTextColor;
  const badgeBg = '#FFFFFF';
  const badgeTextColor = getBadgeTextColor(badgeBg);
  const contentTextColor = getContrastingTextColor(colors.background, mode, customColor);
  const isLightText = isLightBackground(contentTextColor);

  // Secondary pill scrim — ensures MIN/SEC/MS are always readable
  const pillScrimColor = isLightText
    ? 'rgba(0,0,0,0.35)'
    : 'rgba(255,255,255,0.70)';

  // Text shadow for legibility on any background
  const textShadowStyle = isLightText
    ? { textShadowColor: 'rgba(0,0,0,0.55)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }
    : undefined;

  const handleShare = async () => {
    try {
      const uri = await captureRef(cardRef, { format: 'jpg', quality: 0.92 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'image/jpeg', dialogTitle: 'Share our countdown 💛' });
      } else {
        // Fallback: share text
        const msg = `Only ${weeks} weeks and ${days} days until we meet our baby! 💕`;
        Share.share({ message: msg });
      }
    } catch {
      // Fallback to text share if image capture fails
      const msg = `Only ${weeks} weeks and ${days} days until we meet our baby! 💕`;
      Share.share({ message: msg });
    }
  };

  return (
    <CountdownCardBackground
      design={design}
      isLightText={isLightText}
      cardBgColor={colors.surface}
      cardStyle={styles.cardMargin}
    >
      <View style={styles.innerCard} ref={cardRef} collapsable={false}>
        {/* Top row: gender badge + premium + edit */}
        <View style={styles.topRow}>
          {showGenderBadge && (
            <View style={[styles.genderBadge, { backgroundColor: colors.surface + 'CC' }]}>
              <Text style={[styles.genderText, { color: badgeTextColor, fontFamily: displayFont }]}>
                {genderLabel}
              </Text>
            </View>
          )}
          <View style={styles.topRight}>
            {isPremium === true && (
              <View style={[styles.premiumBadge, { backgroundColor: colors.surface + 'CC' }]}>
                <Ionicons name="star" size={12} color={colors.primary} />
                <Text style={[styles.premiumText, { color: colors.primary }]}>Premium</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.editCircle, { backgroundColor: colors.surface + 'CC' }]}
              onPress={() => router.push('/(tabs)/design')}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={16} color={contentTextColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* STATE A: Not started */}
        {!countdownStarted && (
          <View style={styles.notStartedContent}>
            <Text style={[styles.notStartedTitle, { color: contentTextColor }]}>
              Ready to start?
            </Text>
            <Text style={[styles.notStartedSub, { color: contentTextColor, opacity: 0.85 }]}>
              Set your dates and begin counting down
            </Text>
            <GradientButton
              title="START YOUR COUNTDOWN"
              onPress={() => onScrollToDetails?.()}
              style={styles.fullWidthBtn}
            />
          </View>
        )}

        {/* STATE B: Countdown running */}
        {countdownStarted && (
          <>
            {/* Headline — single source of truth: design.headlineText */}
            <Text style={[styles.subtitle, { color: contentTextColor, fontFamily: displayFont }]}>
              {design.headlineText || 'Meeting you in...'}
            </Text>

            {/* Static countdown display — always shows Weeks / Days / Hours */}
            <View style={styles.countdownTouchable}>
              <View style={styles.primaryRow}>
                <CountUnit value={String(weeks).padStart(2, '0')} label="WEEKS" color={contentTextColor} />
                <View style={[styles.divider, { backgroundColor: colors.accent }]} />
                <CountUnit value={String(days).padStart(2, '0')} label="DAYS" color={contentTextColor} />
                <View style={[styles.divider, { backgroundColor: colors.accent }]} />
                <CountUnit value={String(time.hours).padStart(2, '0')} label="HOURS" color={contentTextColor} />
              </View>

              {/* Live MIN : SEC : MS pill */}
              <View style={[styles.secondaryPill, { backgroundColor: pillScrimColor }]}>
                <SmallUnit value={String(time.minutes).padStart(2, '0')} label="MIN" color={contentTextColor} textShadow={textShadowStyle} />
                <Text style={[styles.colon, { color: contentTextColor }, textShadowStyle]}>:</Text>
                <SmallUnit value={String(time.seconds).padStart(2, '0')} label="SEC" color={contentTextColor} textShadow={textShadowStyle} />
                <Text style={[styles.colon, { color: contentTextColor }, textShadowStyle]}>:</Text>
                <SmallUnit value={String(time.ms).padStart(2, '0')} label="MS" color={contentTextColor} style={{ opacity: 0.8 }} textShadow={textShadowStyle} />
              </View>
            </View>

            <GradientButton
              title="SHARE OUR COUNTDOWN 💛"
              icon="share-outline"
              onPress={handleShare}
              style={styles.fullWidthBtn}
            />
          </>
        )}
      </View>
    </CountdownCardBackground>
  );
}

function CountUnit({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.cBlock}>
      <Text style={[styles.cValue, { color }]}>{value}</Text>
      <Text style={[styles.cLabel, { color }]}>{label}</Text>
    </View>
  );
}

function SmallUnit({
  value,
  label,
  color,
  style,
  textShadow,
}: {
  value: string;
  label: string;
  color: string;
  style?: object;
  textShadow?: object;
}) {
  return (
    <View style={styles.sBlock}>
      <Text style={[styles.sValue, { color }, textShadow]}>{value}</Text>
      <Text style={[styles.sLabel, { color }, style, textShadow]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Extra margin applied via cardStyle prop on CountdownCardBackground
  cardMargin: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  innerCard: {
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  genderBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  genderText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  editCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  notStartedContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  notStartedTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  notStartedSub: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  fullWidthBtn: {
    width: '100%',
  },
  subtitle: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  primaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  divider: {
    width: 1,
    height: 48,
    marginHorizontal: 16,
  },
  cBlock: {
    alignItems: 'center',
    minWidth: 60,
  },
  cValue: {
    fontSize: 48,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  cLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  countdownTouchable: {
    alignItems: 'center',
  },
  secondaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  modeHint: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  colon: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 8,
    marginBottom: 14,
  },
  sBlock: {
    alignItems: 'center',
    minWidth: 48,
  },
  sValue: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
});
