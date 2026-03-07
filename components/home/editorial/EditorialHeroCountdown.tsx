import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

import { useProfile } from '../../../context/ProfileContext';
import { useDesign } from '../../../context/DesignContext';
import { usePremium } from '../../../context/PremiumContext';
import { getWeeksAndDays, getTimeUntilDueMs } from '../../../utils/date';
import { getResolvedFontFamily } from '../../../constants/fonts';
import { EDITORIAL, EDITORIAL_TYPOGRAPHY } from '../../../theme/editorialTheme';

type Props = {
  onScrollToDetails?: () => void;
};

const BASE_GRADIENT = ['#f7f2ea', '#efe7dc', '#e7ddcf', '#ddd1c2'] as const;
const SOFT_OVERLAY = ['rgba(255,255,255,0.38)', 'rgba(92,74,52,0.05)'] as const;
const SHADOW_TINT = 'rgba(120, 96, 72, 0.14)';

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export default function EditorialHeroCountdown({ onScrollToDetails }: Props) {
  const { height: screenHeight } = useWindowDimensions();
  const heroHeight = Math.max(Math.min(screenHeight * 0.49, 490), 390);

  const { profile } = useProfile();
  const { design } = useDesign();
  const { isPremium } = usePremium();
  const router = useRouter();

  const cardRef = useRef<View>(null);

  const countdownStarted = profile?.countdownStarted === true && !!profile?.dueDate;
  const dueDate = profile?.dueDate;

  const initialTime = dueDate ? getTimeUntilDueMs(dueDate) : {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    ms: 0,
    totalMinutes: 0,
  };

  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    if (!countdownStarted || !dueDate) return;

    const update = () => setTime(getTimeUntilDueMs(dueDate));
    update();

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [countdownStarted, dueDate]);

  const weekDay = useMemo(() => {
    if (!dueDate) return { weeks: 0, days: 0 };
    return getWeeksAndDays(dueDate);
  }, [dueDate]);

  const displayFont = getResolvedFontFamily?.(design?.fontFamily) || undefined;

  const genderLabel =
    profile?.gender === 'boy'
      ? "IT'S A BOY"
      : profile?.gender === 'girl'
      ? "IT'S A GIRL"
      : "IT'S A SURPRISE";

  const headline = design?.headlineText?.trim() || 'Meeting you in...';

  const handleShare = async () => {
    const message = `Only ${weekDay.weeks} weeks and ${weekDay.days} days until we meet our baby.`;
    try {
      if (cardRef.current) {
        const uri = await captureRef(cardRef, {
          format: 'jpg',
          quality: 0.95,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/jpeg',
            dialogTitle: 'Share our countdown',
          });
          return;
        }
      }

      await Share.share({ message });
    } catch {
      await Share.share({ message });
    }
  };

  const openDesign = () => {
    router.push('/(tabs)/design');
  };

  const heroTextColor = '#2c2521';
  const labelColor = '#8f8072';

  return (
    <View style={styles.outer}>
      <View style={[styles.shadow, { height: heroHeight + 24 }]} />
      <View ref={cardRef} style={[styles.card, { minHeight: heroHeight }]}>
        <LinearGradient colors={BASE_GRADIENT} style={StyleSheet.absoluteFillObject} />

        <LinearGradient
          colors={SOFT_OVERLAY}
          start={{ x: 0.12, y: 0.08 }}
          end={{ x: 0.86, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />
        <View style={styles.glowThree} />

        <View style={styles.noiseSoft} />

        <View style={styles.topRow}>
          <BlurChip>
            <Text style={[styles.badgeText, { color: heroTextColor }]}>
              {genderLabel}
            </Text>
            {isPremium ? (
              <Ionicons
                name="star"
                size={12}
                color="#b99773"
                style={{ marginLeft: 7 }}
              />
            ) : null}
          </BlurChip>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={openDesign}
            style={styles.editButton}
          >
            <BlurView intensity={28} tint="light" style={styles.editBlur}>
              <Ionicons name="pencil" size={18} color="#8c7c6d" />
            </BlurView>
          </TouchableOpacity>
        </View>

        {!countdownStarted ? (
          <View style={styles.emptyState}>
            <Text style={[styles.headline, { color: labelColor, fontFamily: displayFont }]}>
              Ready to start?
            </Text>
            <Text style={[styles.emptySub, { fontFamily: displayFont }]}>
              Set your dates and begin your countdown.
            </Text>
            <TouchableOpacity activeOpacity={0.9} onPress={onScrollToDetails} style={styles.cta}>
              <Text style={styles.ctaText}>Start your countdown</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text
              style={[
                styles.headline,
                { color: labelColor, fontFamily: displayFont },
              ]}
            >
              {headline}
            </Text>

            <View style={styles.countdownRow}>
              <CountdownCell
                value={pad(weekDay.weeks)}
                label="WEEKS"
                fontFamily={displayFont}
                valueColor={heroTextColor}
                labelColor={labelColor}
              />
              <View style={styles.divider} />
              <CountdownCell
                value={pad(weekDay.days)}
                label="DAYS"
                fontFamily={displayFont}
                valueColor={heroTextColor}
                labelColor={labelColor}
              />
              <View style={styles.divider} />
              <CountdownCell
                value={pad(time.hours)}
                label="HOURS"
                fontFamily={displayFont}
                valueColor={heroTextColor}
                labelColor={labelColor}
              />
            </View>

            <View style={styles.timerWrapper}>
              <BlurChip rounded extraStyle={styles.timerChip}>
                <Text style={[styles.timerText, { color: heroTextColor, fontFamily: displayFont }]}>
                  {pad(time.minutes)}:{pad(time.seconds)}
                </Text>
              </BlurChip>
            </View>

            <TouchableOpacity activeOpacity={0.92} onPress={handleShare} style={styles.cta}>
              <Ionicons name="share-outline" size={20} color="#fff" />
              <Text style={styles.ctaText}>Share our countdown</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

function CountdownCell({
  value,
  label,
  fontFamily,
  valueColor,
  labelColor,
}: {
  value: string;
  label: string;
  fontFamily?: string;
  valueColor: string;
  labelColor: string;
}) {
  return (
    <View style={styles.unit}>
      <Text style={[styles.unitValue, { color: valueColor, fontFamily }]}>
        {value}
      </Text>
      <Text style={[styles.unitLabel, { color: labelColor, fontFamily }]}>
        {label}
      </Text>
    </View>
  );
}

function BlurChip({
  children,
  rounded = false,
  extraStyle,
}: {
  children: React.ReactNode;
  rounded?: boolean;
  extraStyle?: any;
}) {
  const inner = (
    <View
      style={[
        styles.chipFallback,
        rounded && styles.chipRounded,
        extraStyle,
      ]}
    >
      {children}
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={32}
        tint="light"
        style={[
          styles.chipFallback,
          rounded && styles.chipRounded,
          extraStyle,
        ]}
      >
        {children}
      </BlurView>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  shadow: {
    position: 'absolute',
    top: 18,
    left: 14,
    right: 14,
    borderRadius: 36,
    backgroundColor: SHADOW_TINT,
    opacity: 0.6,
    transform: [{ scaleY: 0.98 }],
    shadowColor: '#7e6b57',
    shadowOffset: { width: 0, height: 28 },
    shadowOpacity: 0.08,
    shadowRadius: 34,
    elevation: 10,
  },
  card: {
    borderRadius: 36,
    overflow: 'hidden',
    paddingHorizontal: 28,
    paddingTop: 26,
    paddingBottom: 30,
    justifyContent: 'space-between',
    backgroundColor: '#efe8dd',
  },
  glowOne: {
    position: 'absolute',
    width: 280,
    height: 220,
    borderRadius: 999,
    top: -10,
    left: -30,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  glowTwo: {
    position: 'absolute',
    width: 320,
    height: 240,
    borderRadius: 999,
    bottom: 30,
    right: -70,
    backgroundColor: 'rgba(199,177,152,0.14)',
  },
  glowThree: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    top: 120,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  noiseSoft: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipFallback: {
    backgroundColor: 'rgba(255,255,255,0.46)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipRounded: {
    borderRadius: 24,
  },
  badgeText: {
    fontSize: 12,
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  editButton: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  editBlur: {
    width: 46,
    height: 46,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  headline: {
    ...EDITORIAL_TYPOGRAPHY.headline,
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 20,
    fontWeight: '300',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  unit: {
    minWidth: 86,
    alignItems: 'center',
  },
  unitValue: {
    fontSize: 74,
    lineHeight: 78,
    fontWeight: '200',
    letterSpacing: -2.4,
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 2,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 68,
    backgroundColor: 'rgba(89,74,57,0.08)',
    marginHorizontal: 14,
  },
  timerWrapper: {
    alignItems: 'center',
    marginBottom: 26,
  },
  timerChip: {
    minWidth: 154,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  timerText: {
    fontSize: 30,
    lineHeight: 34,
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.2,
    fontVariant: ['tabular-nums'],
  },
  cta: {
    minHeight: 64,
    borderRadius: 32,
    backgroundColor: EDITORIAL.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 10,
  },
  emptySub: {
    fontSize: 16,
    lineHeight: 24,
    color: '#8f8072',
    textAlign: 'center',
    marginBottom: 26,
  },
});
