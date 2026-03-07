/**
 * HomeScreenEditorialV2
 * Ziel: deutlich näher an das Mock-up.
 * Fokus: ruhigere Typografie, dichteres Spacing, subtilerer Header,
 * weicherer Hero, elegantere Karten, weniger utilitaristisch.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useProfile } from '../../context/ProfileContext';
import {
  getWeeksAndDays,
  getTimeUntilDueMs,
  getJourneyProgress,
  formatDateLabel,
  formatDateShort,
} from '../../utils/date';
import { loadJSON, saveJSON } from '../../utils/storage';

// ─────────────────────────────────────────────────────────────────────────────
// TOKENS — enger am Mock-up
// ─────────────────────────────────────────────────────────────────────────────
const BG = '#F8F4EE';
const SURFACE = '#F4EFE8';
const SURFACE_SOFT = '#F1EBE3';
const SURFACE_CARD = '#EEE7DD';
const CHIP = 'rgba(255,255,255,0.56)';
const CHIP_DARK = 'rgba(60, 45, 32, 0.055)';

const TEXT = '#2E2723';
const TEXT_SOFT = '#9B8D81';
const TEXT_MUTED = '#B5A79A';
const ACCENT = '#C2A88E';
const ACCENT_DARK = '#AF947A';
const BORDER = 'rgba(114, 90, 66, 0.08)';

const HERO_RADIUS = 34;
const CARD_RADIUS = 30;
const INPUT_RADIUS = 22;
const BUTTON_RADIUS = 31;

const H_PADDING = 20;

// ─────────────────────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────────────────────
function V2Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[headerStyles.container, { paddingTop: insets.top + 12 }]}>
      <View style={headerStyles.left}>
        <View style={headerStyles.iconCircle}>
          <Ionicons name="heart" size={16} color={ACCENT_DARK} />
        </View>

        <Text style={headerStyles.brand}>
          <Text style={headerStyles.brandBold}>Mommy</Text>
          <Text style={headerStyles.brandLight}>Count</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={headerStyles.settingsBtn}
        onPress={() => router.push('/(tabs)/profile')}
        activeOpacity={0.8}
      >
        <Ionicons name="settings-outline" size={19} color={TEXT_SOFT} />
      </TouchableOpacity>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SURFACE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brand: {
    fontSize: 22,
    letterSpacing: -0.35,
  },
  brandBold: {
    fontWeight: '700',
    color: TEXT,
  },
  brandLight: {
    fontWeight: '300',
    color: TEXT_SOFT,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SURFACE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function V2HeroBlock({
  weeks,
  days,
  hours,
  minutes,
  seconds,
  genderLabel,
  isPremium,
  countdownStarted,
  onScrollToDetails,
  onShare,
  onEdit,
}: {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  genderLabel: string;
  isPremium: boolean;
  countdownStarted: boolean;
  onScrollToDetails?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
}) {
  const { height: screenHeight } = useWindowDimensions();
  const heroHeight = 430;

  const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

  return (
    <View style={heroStyles.outer}>
      <View style={[heroStyles.shadowBack, { height: heroHeight + 16 }]} />
      <View style={[heroStyles.card, { minHeight: heroHeight }]}>
        <LinearGradient
          colors={['#F6F1E9', '#EFE7DC', '#E7DDD0']}
          start={{ x: 0.04, y: 0.04 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={heroStyles.textureTopLeft} />
        <View style={heroStyles.textureMidRight} />
        <View style={heroStyles.textureBottomCenter} />
        <View style={heroStyles.softWash} />
        <View style={heroStyles.bottomWarmBand} />

        <View style={heroStyles.topRow}>
          <View style={heroStyles.badge}>
            <Text style={heroStyles.badgeText}>{genderLabel}</Text>
            {isPremium ? (
              <Ionicons name="star" size={11} color={ACCENT_DARK} style={{ marginLeft: 6 }} />
            ) : null}
          </View>

          <TouchableOpacity style={heroStyles.editBtn} onPress={onEdit} activeOpacity={0.82}>
            <Ionicons name="pencil" size={18} color={TEXT_SOFT} />
          </TouchableOpacity>
        </View>

        {!countdownStarted ? (
          <View style={heroStyles.emptyState}>
            <Text style={heroStyles.headline}>Ready to start?</Text>
            <Text style={heroStyles.emptySub}>
              Set your dates and begin your countdown.
            </Text>
            <TouchableOpacity
              style={heroStyles.cta}
              onPress={onScrollToDetails}
              activeOpacity={0.9}
            >
              <Text style={heroStyles.ctaText}>Start your countdown</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={heroStyles.headline}>Meeting you in...</Text>

            <View style={heroStyles.countdownRow}>
              <HeroUnit value={pad(weeks)} label="WEEKS" />
              <View style={heroStyles.divider} />
              <HeroUnit value={pad(days)} label="DAYS" />
              <View style={heroStyles.divider} />
              <HeroUnit value={pad(hours)} label="HOURS" />
            </View>

            <View style={heroStyles.timerPill}>
              <Text style={heroStyles.timerText}>
                {pad(minutes)}:{pad(seconds)}
              </Text>
            </View>

            <TouchableOpacity style={heroStyles.cta} onPress={onShare} activeOpacity={0.9}>
              <Ionicons name="share-outline" size={18} color="#fff" />
              <Text style={heroStyles.ctaText}>Share our countdown</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

function HeroUnit({ value, label }: { value: string; label: string }) {
  return (
    <View style={heroStyles.unit}>
      <Text style={heroStyles.unitValue}>{value}</Text>
      <Text style={heroStyles.unitLabel}>{label}</Text>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  outer: {
    marginHorizontal: H_PADDING,
    marginTop: 10,
    marginBottom: 22,
  },
  shadowBack: {
    position: 'absolute',
    top: 16,
    left: 10,
    right: 10,
    borderRadius: HERO_RADIUS + 2,
    backgroundColor: 'rgba(130, 109, 86, 0.10)',
    shadowColor: '#876F58',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.06,
    shadowRadius: 28,
    elevation: 8,
  },
  card: {
    borderRadius: HERO_RADIUS,
    overflow: 'hidden',
    backgroundColor: SURFACE,
    paddingTop: 22,
    paddingBottom: 22,
    paddingHorizontal: 20,
  },
  textureTopLeft: {
    position: 'absolute',
    width: 320,
    height: 220,
    borderRadius: 999,
    top: -6,
    left: -70,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  textureMidRight: {
    position: 'absolute',
    width: 250,
    height: 180,
    borderRadius: 999,
    top: 94,
    right: -34,
    backgroundColor: 'rgba(233,223,209,0.42)',
  },
  textureBottomCenter: {
    position: 'absolute',
    width: 210,
    height: 170,
    borderRadius: 999,
    bottom: 56,
    left: 148,
    backgroundColor: 'rgba(213,197,178,0.18)',
  },
  softWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  bottomWarmBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 132,
    backgroundColor: 'rgba(192, 170, 145, 0.06)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: CHIP,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: TEXT,
  },
  editBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    marginTop: 18,
    marginBottom: 18,
    textAlign: 'center',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '300',
    color: TEXT_SOFT,
    letterSpacing: -0.8,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  unit: {
    minWidth: 88,
    alignItems: 'center',
  },
  unitValue: {
    fontSize: 78,
    lineHeight: 82,
    fontWeight: '300',
    letterSpacing: -2.6,
    color: TEXT,
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 2,
    color: TEXT_SOFT,
  },
  divider: {
    width: 1,
    height: 58,
    marginHorizontal: 14,
    backgroundColor: 'rgba(111, 91, 69, 0.08)',
  },
  timerPill: {
    alignSelf: 'center',
    width: 150,
    height: 62,
    borderRadius: 22,
    marginBottom: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CHIP_DARK,
  },
  timerText: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
    color: TEXT,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.2,
  },
  cta: {
    height: 62,
    borderRadius: BUTTON_RADIUS,
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    marginLeft: 9,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.1,
  },
  emptyState: {
    paddingTop: 34,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySub: {
    fontSize: 15,
    lineHeight: 22,
    color: TEXT_SOFT,
    textAlign: 'center',
    marginBottom: 22,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// TIME REMAINING
// ─────────────────────────────────────────────────────────────────────────────
type TimeMode = 'days' | 'weeks' | 'hours';
const MODES: TimeMode[] = ['days', 'weeks', 'hours'];

function V2TimeRemaining({
  countdownStarted,
  timeData,
  weekDay,
}: {
  countdownStarted: boolean;
  timeData: ReturnType<typeof getTimeUntilDueMs>;
  weekDay: { weeks: number; days: number };
}) {
  const [mode, setMode] = useState<TimeMode>('days');

  useEffect(() => {
    loadJSON<TimeMode>('v2_time_mode').then((saved) => {
      if (saved && MODES.includes(saved)) setMode(saved);
    });
  }, []);

  const cycle = useCallback(() => {
    const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
    saveJSON('v2_time_mode', next);
    setMode(next);
  }, [mode]);

  const value =
    mode === 'days'
      ? timeData.days
      : mode === 'weeks'
      ? weekDay.weeks
      : timeData.days * 24 + timeData.hours;

  const unit = mode === 'days' ? 'days' : mode === 'weeks' ? 'weeks' : 'hours';
  const nextMode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];

  return (
    <TouchableOpacity
      style={timeStyles.container}
      onPress={countdownStarted ? cycle : undefined}
      activeOpacity={countdownStarted ? 0.82 : 1}
    >
      <Text style={timeStyles.label}>Time remaining</Text>
      {countdownStarted ? <Text style={timeStyles.tapHint}>Tap for {nextMode}</Text> : null}

      <View style={timeStyles.row}>
        <Text style={timeStyles.number}>{countdownStarted ? value : '—'}</Text>
        {countdownStarted ? <Text style={timeStyles.unit}>{unit}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const timeStyles = StyleSheet.create({
  container: {
    marginHorizontal: H_PADDING,
    marginBottom: 26,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.9,
    color: TEXT_SOFT,
    marginBottom: 4,
  },
  tapHint: {
    fontSize: 11,
    lineHeight: 15,
    color: TEXT_MUTED,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  number: {
    fontSize: 64,
    lineHeight: 68,
    fontWeight: '300',
    color: TEXT,
    letterSpacing: -2.3,
    fontVariant: ['tabular-nums'],
    marginRight: 6,
  },
  unit: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '300',
    color: TEXT_SOFT,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNEY PROGRESS
// ─────────────────────────────────────────────────────────────────────────────
function V2JourneyProgress({
  percent,
  startLabel,
  dueLabel,
}: {
  percent: number;
  startLabel: string;
  dueLabel: string;
}) {
  return (
    <View style={journeyStyles.card}>
      <View style={journeyStyles.header}>
        <Text style={journeyStyles.title}>Journey progress</Text>
        <Text style={journeyStyles.percent}>{percent}%</Text>
      </View>

      <View style={journeyStyles.track}>
        <View style={[journeyStyles.fill, { width: `${percent}%` }]} />
      </View>

      <View style={journeyStyles.dateRow}>
        <Text style={journeyStyles.dateText}>Start {startLabel}</Text>
        <Text style={journeyStyles.dateText}>Due {dueLabel}</Text>
      </View>
    </View>
  );
}

const journeyStyles = StyleSheet.create({
  card: {
    marginHorizontal: H_PADDING,
    marginBottom: 26,
    padding: 22,
    backgroundColor: '#F0E9DF',
    borderRadius: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.95,
    color: TEXT_SOFT,
  },
  percent: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '300',
    color: ACCENT_DARK,
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(92, 74, 52, 0.08)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  fill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: ACCENT,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#8E8072',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// PREGNANCY
// ─────────────────────────────────────────────────────────────────────────────
function V2PregnancyDetails({
  startDate,
  dueDate,
  countdownStarted,
  onStartCountdown,
}: {
  startDate: string;
  dueDate: string;
  countdownStarted: boolean;
  onStartCountdown?: () => void;
}) {
  const router = useRouter();

  return (
    <View style={pregnancyStyles.section}>
      <Text style={pregnancyStyles.title}>Your pregnancy</Text>

      <View style={pregnancyStyles.card}>
        <View style={pregnancyStyles.row}>
          <Text style={pregnancyStyles.label}>Start date</Text>
          <TouchableOpacity
            style={pregnancyStyles.value}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.82}
          >
            <Text style={pregnancyStyles.valueText}>{formatDateShort(startDate)}</Text>
            <Ionicons name="calendar-outline" size={22} color={ACCENT_DARK} />
          </TouchableOpacity>
        </View>

        <View style={pregnancyStyles.row}>
          <Text style={pregnancyStyles.label}>Due date</Text>
          <TouchableOpacity
            style={pregnancyStyles.value}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.82}
          >
            <Text style={pregnancyStyles.valueText}>{formatDateShort(dueDate)}</Text>
            <Ionicons name="calendar" size={22} color={ACCENT_DARK} />
          </TouchableOpacity>
        </View>

        {!countdownStarted ? (
          <TouchableOpacity style={pregnancyStyles.cta} onPress={onStartCountdown} activeOpacity={0.9}>
            <Text style={pregnancyStyles.ctaText}>Start countdown</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const pregnancyStyles = StyleSheet.create({
  section: {
    marginHorizontal: H_PADDING,
    marginBottom: 24,
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.95,
    color: TEXT_SOFT,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#EEE7DD',
    borderRadius: 30,
    padding: 20,
  },
  row: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.7,
    color: TEXT_SOFT,
    marginBottom: 8,
  },
  value: {
    minHeight: 74,
    borderRadius: INPUT_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '500',
    color: TEXT,
    letterSpacing: -0.4,
  },
  cta: {
    marginTop: 6,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '600',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// GENDER
// ─────────────────────────────────────────────────────────────────────────────
const GENDERS = [
  { key: 'boy' as const, label: 'Boy', icon: 'male-outline' as const },
  { key: 'girl' as const, label: 'Girl', icon: 'female-outline' as const },
  { key: 'surprise' as const, label: 'Surprise', icon: 'gift-outline' as const },
] as const;

function V2GenderSelector({
  selected,
  onSelect,
}: {
  selected: 'boy' | 'girl' | 'surprise';
  onSelect: (g: 'boy' | 'girl' | 'surprise') => void;
}) {
  return (
    <View style={genderStyles.section}>
      <Text style={genderStyles.title}>It's a...</Text>

      <View style={genderStyles.row}>
        {GENDERS.map((g) => {
          const isSelected = selected === g.key;

          return (
            <TouchableOpacity
              key={g.key}
              style={[genderStyles.option, isSelected && genderStyles.optionSelected]}
              onPress={() => onSelect(g.key)}
              activeOpacity={0.78}
            >
              <Ionicons
                name={g.icon}
                size={34}
                color={isSelected ? ACCENT_DARK : '#A79B8F'}
                style={{ marginBottom: 12 }}
              />
              <Text style={[genderStyles.label, isSelected && genderStyles.labelSelected]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const genderStyles = StyleSheet.create({
  section: {
    marginHorizontal: H_PADDING,
    marginBottom: 24,
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.95,
    color: TEXT_SOFT,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    width: '31.5%',
    height: 120,
    borderRadius: 24,
    backgroundColor: SURFACE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1.2,
    borderColor: 'rgba(184,160,136,0.36)',
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#A79B8F',
  },
  labelSelected: {
    color: ACCENT_DARK,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// CTA
// ─────────────────────────────────────────────────────────────────────────────
function V2CustomizeCTA() {
  const router = useRouter();

  return (
    <View style={customizeStyles.card}>
      <Text style={customizeStyles.title}>Make it truly yours</Text>
      <Text style={customizeStyles.subtitle}>
        Personalize your countdown with fonts, colors, and photos
      </Text>

      <TouchableOpacity
        style={customizeStyles.cta}
        onPress={() => router.push('/(tabs)/design')}
        activeOpacity={0.9}
      >
        <Ionicons name="pencil-outline" size={18} color="#fff" />
        <Text style={customizeStyles.ctaText}>Customize design</Text>
      </TouchableOpacity>
    </View>
  );
}

const customizeStyles = StyleSheet.create({
  card: {
    marginHorizontal: H_PADDING,
    marginBottom: 110,
    backgroundColor: '#EFE8DE',
    borderRadius: 30,
    padding: 24,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '400',
    color: TEXT,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: TEXT_SOFT,
    marginBottom: 22,
  },
  cta: {
    height: 58,
    borderRadius: 29,
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    marginLeft: 10,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '600',
    color: '#fff',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function HomeScreenEditorialV2() {
  const { profile, updateProfile } = useProfile();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const dueDate = profile?.dueDate ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const startDate =
    profile?.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const countdownStarted = profile?.countdownStarted === true;
  const gender = (profile?.gender as 'boy' | 'girl' | 'surprise') ?? 'boy';
  const isPremium = false;

  const weekDay = useMemo(() => getWeeksAndDays(dueDate), [dueDate]);
  const [time, setTime] = useState(() => getTimeUntilDueMs(dueDate));
  const percent = useMemo(() => getJourneyProgress(startDate, dueDate), [startDate, dueDate]);

  useEffect(() => {
    if (!countdownStarted) return;
    const interval = setInterval(() => setTime(getTimeUntilDueMs(dueDate)), 1000);
    return () => clearInterval(interval);
  }, [countdownStarted, dueDate]);

  const handleShare = useCallback(() => {
    Share.share({
      message: `Only ${weekDay.weeks} weeks and ${weekDay.days} days until we meet our baby.`,
    });
  }, [weekDay]);

  const scrollToDetails = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 620, animated: true });
  }, []);

  const handleStartCountdown = useCallback(() => {
    updateProfile?.({ countdownStarted: true });
  }, [updateProfile]);

  const genderLabel =
    gender === 'boy' ? "IT'S A BOY" : gender === 'girl' ? "IT'S A GIRL" : "IT'S A SURPRISE";

  return (
    <View style={screenStyles.screen}>
      <V2Header />

      <ScrollView
        ref={scrollRef}
        style={screenStyles.scroll}
        contentContainerStyle={screenStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <V2HeroBlock
          weeks={weekDay.weeks}
          days={weekDay.days}
          hours={time.hours}
          minutes={time.minutes}
          seconds={time.seconds}
          genderLabel={genderLabel}
          isPremium={isPremium}
          countdownStarted={countdownStarted}
          onScrollToDetails={scrollToDetails}
          onShare={handleShare}
          onEdit={() => router.push('/(tabs)/design')}
        />

        <V2TimeRemaining
          countdownStarted={countdownStarted}
          timeData={time}
          weekDay={weekDay}
        />

        <V2JourneyProgress
          percent={countdownStarted ? percent : 0}
          startLabel={formatDateLabel(startDate)}
          dueLabel={formatDateLabel(dueDate)}
        />

        <V2PregnancyDetails
          startDate={startDate}
          dueDate={dueDate}
          countdownStarted={countdownStarted}
          onStartCountdown={handleStartCountdown}
        />

        <V2GenderSelector
          selected={gender}
          onSelect={(g) => updateProfile?.({ gender: g })}
        />

        <V2CustomizeCTA />
      </ScrollView>
    </View>
  );
}

const screenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingTop: 0,
    paddingBottom: 18,
  },
});
