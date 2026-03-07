/**
 * HomeScreenEditorialV2 — Pixelnahe Rekonstruktion des Mock-ups.
 * Rein präsentationsorientiert, minimale Datenbindung.
 * Keine Wiederverwendung alter Home- oder Editorial-Komponenten.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Share,
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

// ─── Design Tokens (Mock-up-nah) ───────────────────────────────────────────
const BG = '#F8F4EE';
const SURFACE = '#F5F2EC';
const SURFACE_MUTED = '#EFE9E0';
const TEXT = '#2C2521';
const TEXT_MUTED = '#8F8072';
const ACCENT = '#B8A088';
const CARD_RADIUS = 28;
const HERO_RADIUS = 36;

// ─── 1. Top Header ─────────────────────────────────────────────────────────
function V2Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[headerStyles.container, { paddingTop: insets.top + 16 }]}>
      <View style={headerStyles.left}>
        <View style={headerStyles.iconCircle}>
          <Ionicons name="heart" size={16} color={ACCENT} />
        </View>
        <Text style={headerStyles.brand}>
          <Text style={headerStyles.brandBold}>Mommy</Text>
          <Text style={headerStyles.brandLight}>Count</Text>
        </Text>
      </View>
      <TouchableOpacity
        style={headerStyles.settingsBtn}
        onPress={() => router.push('/(tabs)/profile')}
        activeOpacity={0.7}
      >
        <Ionicons name="menu-outline" size={22} color={TEXT_MUTED} />
      </TouchableOpacity>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SURFACE_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
  brandBold: {
    fontWeight: '600',
    color: TEXT,
  },
  brandLight: {
    fontWeight: '300',
    color: TEXT_MUTED,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SURFACE_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── 2. Hero Block ─────────────────────────────────────────────────────────
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
  const heroHeight = Math.max(Math.min(screenHeight * 0.49, 490), 380);

  const pad = (n: number) => String(n).padStart(2, '0');

  const gradient = ['#F7F2EA', '#EFE7DC', '#E7DDCF', '#DDD1C2'] as const;
  const overlay = ['rgba(255,255,255,0.35)', 'rgba(92,74,52,0.04)'] as const;

  return (
    <View style={[heroStyles.outer, { marginBottom: 24 }]}>
      <View style={[heroStyles.shadow, { height: heroHeight + 20 }]} />
      <View style={[heroStyles.card, { minHeight: heroHeight }]}>
        <LinearGradient colors={gradient} style={StyleSheet.absoluteFillObject} />
        <LinearGradient
          colors={overlay}
          start={{ x: 0.1, y: 0.05 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={heroStyles.glow1} />
        <View style={heroStyles.glow2} />
        <View style={heroStyles.glow3} />
        <View style={heroStyles.noise} />

        <View style={heroStyles.topRow}>
          <View style={heroStyles.badge}>
            <Text style={heroStyles.badgeText}>{genderLabel}</Text>
            {isPremium && (
              <Ionicons name="star" size={11} color="#B99773" style={{ marginLeft: 6 }} />
            )}
          </View>
          <TouchableOpacity
            style={heroStyles.editBtn}
            onPress={onEdit}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={18} color={TEXT_MUTED} />
          </TouchableOpacity>
        </View>

        {!countdownStarted ? (
          <View style={heroStyles.emptyState}>
            <Text style={heroStyles.headline}>Ready to start?</Text>
            <Text style={heroStyles.emptySub}>Set your dates and begin your countdown.</Text>
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
              <Ionicons name="share-outline" size={20} color="#fff" />
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
    marginHorizontal: 20,
    marginTop: 8,
  },
  shadow: {
    position: 'absolute',
    top: 16,
    left: 12,
    right: 12,
    borderRadius: HERO_RADIUS,
    backgroundColor: 'rgba(120,96,72,0.12)',
    opacity: 0.5,
    transform: [{ scaleY: 0.98 }],
    shadowColor: '#7e6b57',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 8,
  },
  card: {
    borderRadius: HERO_RADIUS,
    overflow: 'hidden',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 28,
    justifyContent: 'space-between',
    backgroundColor: '#EFE8DD',
  },
  glow1: {
    position: 'absolute',
    width: 260,
    height: 200,
    borderRadius: 999,
    top: -20,
    left: -40,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  glow2: {
    position: 'absolute',
    width: 300,
    height: 220,
    borderRadius: 999,
    bottom: 40,
    right: -80,
    backgroundColor: 'rgba(199,177,152,0.12)',
  },
  glow3: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
    top: 100,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  noise: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
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
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 30,
    fontWeight: '300',
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 18,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  unit: {
    minWidth: 82,
    alignItems: 'center',
  },
  unitValue: {
    fontSize: 70,
    fontWeight: '200',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
    color: TEXT,
  },
  unitLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: TEXT_MUTED,
  },
  divider: {
    width: 1,
    height: 64,
    backgroundColor: 'rgba(89,74,57,0.08)',
    marginHorizontal: 16,
  },
  timerPill: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 28,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    color: TEXT,
    letterSpacing: 0.5,
  },
  cta: {
    minHeight: 60,
    borderRadius: 30,
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptySub: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 28,
  },
});

// ─── 3. Time remaining ────────────────────────────────────────────────────
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
      activeOpacity={countdownStarted ? 0.8 : 1}
    >
      <Text style={timeStyles.label}>Time remaining</Text>
      {countdownStarted && (
        <Text style={timeStyles.tapHint}>Tap for {nextMode}</Text>
      )}
      {countdownStarted ? (
        <View style={timeStyles.row}>
          <Text style={timeStyles.number}>{value}</Text>
          <Text style={timeStyles.unit}>{unit}</Text>
        </View>
      ) : (
        <Text style={timeStyles.muted}>—</Text>
      )}
    </TouchableOpacity>
  );
}

const timeStyles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  tapHint: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginBottom: 16,
    opacity: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  number: {
    fontSize: 52,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
    color: TEXT,
  },
  unit: {
    fontSize: 20,
    fontWeight: '300',
    color: TEXT_MUTED,
  },
  muted: {
    fontSize: 52,
    fontWeight: '200',
    color: TEXT_MUTED,
  },
});

// ─── 4. Journey progress ───────────────────────────────────────────────────
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
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 26,
    backgroundColor: SURFACE_MUTED,
    borderRadius: CARD_RADIUS,
    borderWidth: 0,
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: TEXT_MUTED,
  },
  percent: {
    fontSize: 18,
    fontWeight: '300',
    color: ACCENT,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
});

// ─── 5. Your pregnancy ─────────────────────────────────────────────────────
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
          <TouchableOpacity style={pregnancyStyles.value} onPress={() => router.push('/(tabs)/design')}>
            <Text style={pregnancyStyles.valueText}>{formatDateShort(startDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color={ACCENT} />
          </TouchableOpacity>
        </View>
        <View style={[pregnancyStyles.row, pregnancyStyles.rowTop]}>
          <Text style={pregnancyStyles.label}>Due date</Text>
          <TouchableOpacity style={pregnancyStyles.value} onPress={() => router.push('/(tabs)/design')}>
            <Text style={pregnancyStyles.valueText}>{formatDateShort(dueDate)}</Text>
            <Ionicons name="calendar" size={20} color={ACCENT} />
          </TouchableOpacity>
        </View>
        {!countdownStarted && (
          <TouchableOpacity
            style={pregnancyStyles.cta}
            onPress={onStartCountdown}
            activeOpacity={0.9}
          >
            <Text style={pregnancyStyles.ctaText}>Start countdown</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const pregnancyStyles = StyleSheet.create({
  section: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: TEXT_MUTED,
    marginBottom: 14,
  },
  card: {
    padding: 24,
    backgroundColor: SURFACE_MUTED,
    borderRadius: CARD_RADIUS,
    borderWidth: 0,
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  row: {
    marginBottom: 16,
  },
  rowTop: {
    marginBottom: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  value: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  valueText: {
    fontSize: 17,
    fontWeight: '500',
    color: TEXT,
  },
  cta: {
    marginTop: 22,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: ACCENT,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

// ─── 6. Gender selection ───────────────────────────────────────────────────
const GENDERS = [
  { key: 'boy' as const, label: 'Boy', icon: 'male' as const },
  { key: 'girl' as const, label: 'Girl', icon: 'female' as const },
  { key: 'surprise' as const, label: 'Surprise', icon: 'gift' as const },
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
              activeOpacity={0.7}
            >
              <View style={genderStyles.iconWrap}>
                <Ionicons
                  name={g.icon}
                  size={28}
                  color={isSelected ? ACCENT : TEXT_MUTED}
                />
              </View>
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
    marginHorizontal: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: TEXT_MUTED,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 26,
    borderRadius: CARD_RADIUS,
    backgroundColor: SURFACE_MUTED,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(184,160,136,0.4)',
    borderWidth: 1.5,
  },
  iconWrap: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: TEXT_MUTED,
  },
  labelSelected: {
    color: ACCENT,
  },
});

// ─── 7. Customize CTA ────────────────────────────────────────────────────
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
        <Ionicons name="pencil" size={18} color="#fff" />
        <Text style={customizeStyles.ctaText}>Customize design</Text>
      </TouchableOpacity>
    </View>
  );
}

const customizeStyles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 120,
    padding: 28,
    backgroundColor: SURFACE_MUTED,
    borderRadius: CARD_RADIUS,
    borderWidth: 0,
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: TEXT_MUTED,
    marginBottom: 24,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: ACCENT,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function HomeScreenEditorialV2() {
  const { profile, updateProfile } = useProfile();
  const router = useRouter();
  const scrollRef = React.useRef<ScrollView>(null);

  const dueDate = profile?.dueDate ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const startDate =
    profile?.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const countdownStarted = profile?.countdownStarted === true;
  const gender = profile?.gender ?? 'boy';
  const isPremium = false;

  const weekDay = getWeeksAndDays(dueDate);
  const [time, setTime] = useState(() => getTimeUntilDueMs(dueDate));
  const percent = getJourneyProgress(startDate, dueDate);

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
    scrollRef.current?.scrollTo({ y: 600, animated: true });
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
        contentContainerStyle={screenStyles.scrollContent}
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

        <V2GenderSelector selected={gender} onSelect={(g) => updateProfile?.({ gender: g })} />

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
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 40,
  },
});
