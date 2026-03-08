import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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

// Mock-up: sepia / cream / soft beige, Apple-premium, editorial
const BG = '#F7F3ED';
const SURFACE = '#F2EDE5';
const SURFACE_CARD = '#EFE9E0';
const SURFACE_CARD_DARKER = '#EBE5DB';
const WHITE_GLASS = 'rgba(255,255,255,0.58)';
const WHITE_SOFT = 'rgba(255,255,255,0.88)';
const TEXT = '#2A231E';
const TEXT_SOFT = '#8E8175';
const TEXT_FAINT = '#A99D92';
const ACCENT = '#B89A7A';
const ACCENT_DARK = '#A68B6B';
const SHADOW = 'rgba(110, 88, 66, 0.08)';

const H_PADDING = 22;
const HERO_RADIUS = 32;
const CARD_RADIUS = 28;
const PILL_RADIUS = 999;
const BUTTON_RADIUS = 26;

type TimeMode = 'days' | 'weeks' | 'hours';
const MODES: TimeMode[] = ['days', 'weeks', 'hours'];

function pad(value: number) {
  return String(Math.max(0, value)).padStart(2, '0');
}

function Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <View style={styles.headerLeft}>
        <View style={styles.headerCircle}>
          <Ionicons name="heart" size={16} color={ACCENT_DARK} />
        </View>
        <Text style={styles.brand}>
          <Text style={styles.brandBold}>Mommy</Text>
          <Text style={styles.brandLight}>Count</Text>
        </Text>
      </View>
      <TouchableOpacity
        style={styles.headerCircle}
        onPress={() => router.push('/(tabs)/profile')}
        activeOpacity={0.82}
      >
        <Ionicons name="settings-outline" size={18} color={TEXT_SOFT} />
      </TouchableOpacity>
    </View>
  );
}

function HeroUnit({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.heroUnit}>
      <Text style={styles.heroValue}>{value}</Text>
      <Text style={styles.heroLabel}>{label}</Text>
    </View>
  );
}

function HeroBlock({
  weeks,
  days,
  hours,
  minutes,
  seconds,
  countdownStarted,
  genderLabel,
  onEdit,
  onShare,
  onScrollToDetails,
}: {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  countdownStarted: boolean;
  genderLabel: string;
  onEdit: () => void;
  onShare: () => void;
  onScrollToDetails: () => void;
}) {
  const heroHeight = 420;

  return (
    <View style={styles.heroOuter}>
      <View style={[styles.heroShadow, { height: heroHeight + 14 }]} />
      <View style={[styles.heroCard, { minHeight: heroHeight }]}>
        <LinearGradient
          colors={['#F5F0E8', '#EDE6DC', '#E5DCD0', '#DFD5C8']}
          start={{ x: 0.03, y: 0.03 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.heroTexture1} />
        <View style={styles.heroTexture2} />
        <View style={styles.heroTexture3} />
        <View style={styles.heroMist} />
        <View style={styles.heroBand} />

        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Ionicons name="heart" size={12} color={TEXT} style={{ marginRight: 8 }} />
            <Text style={styles.heroBadgeText}>{genderLabel}</Text>
          </View>
          <TouchableOpacity style={styles.heroEdit} onPress={onEdit} activeOpacity={0.82}>
            <Ionicons name="pencil" size={18} color={TEXT_SOFT} />
          </TouchableOpacity>
        </View>

        {!countdownStarted ? (
          <View style={styles.heroEmpty}>
            <Text style={styles.heroHeadline}>Ready to start?</Text>
            <Text style={styles.heroEmptyText}>
              Set your dates and begin your countdown.
            </Text>
            <TouchableOpacity style={styles.heroCta} onPress={onScrollToDetails} activeOpacity={0.9}>
              <Text style={styles.heroCtaText}>Start your countdown</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.heroHeadline}>Meeting you in...</Text>
            <View style={styles.heroCountdownRow}>
              <HeroUnit value={pad(weeks)} label="WEEKS" />
              <View style={styles.heroDivider} />
              <HeroUnit value={pad(days)} label="DAYS" />
              <View style={styles.heroDivider} />
              <HeroUnit value={pad(hours)} label="HOURS" />
            </View>
            <View style={styles.heroTimerPill}>
              <Text style={styles.heroTimerText}>
                {pad(minutes)}:{pad(seconds)}
              </Text>
              <View style={styles.heroTimerLabels}>
                <Text style={styles.heroTimerLabel}>MIN</Text>
                <Text style={styles.heroTimerLabel}>SEC</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.heroCta} onPress={onShare} activeOpacity={0.9}>
              <Ionicons name="share-outline" size={16} color="#fff" />
              <Text style={styles.heroCtaText}>Share our countdown</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

function ValueText() {
  return (
    <View style={styles.valueTextWrap}>
      <Text style={styles.valueTextLine}>Keep memories as beautiful as your journey.</Text>
      <Text style={styles.valueTextSub}>Upgrade for more.</Text>
    </View>
  );
}

function TimeRemaining({
  countdownStarted,
  weekDay,
  timeData,
}: {
  countdownStarted: boolean;
  weekDay: { weeks: number; days: number };
  timeData: ReturnType<typeof getTimeUntilDueMs>;
}) {
  const [mode, setMode] = useState<TimeMode>('days');

  useEffect(() => {
    loadJSON<TimeMode>('v2_time_mode').then((saved) => {
      if (saved && MODES.includes(saved)) setMode(saved);
    });
  }, []);

  const nextMode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
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

  return (
    <TouchableOpacity
      style={styles.timeBlock}
      onPress={countdownStarted ? cycle : undefined}
      activeOpacity={countdownStarted ? 0.82 : 1}
    >
      <Text style={styles.sectionEyebrow}>Time remaining</Text>
      {countdownStarted ? <Text style={styles.sectionHint}>Tap for {nextMode}</Text> : null}
      <View style={styles.timeRow}>
        <Text style={styles.timeNumber}>{countdownStarted ? value : '—'}</Text>
        {countdownStarted ? <Text style={styles.timeUnit}>{unit}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function JourneyProgressCard({
  percent,
  startLabel,
  dueLabel,
}: {
  percent: number;
  startLabel: string;
  dueLabel: string;
}) {
  return (
    <View style={styles.sectionWrap}>
      <View style={styles.softCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.cardEyebrow}>Journey progress</Text>
          <Text style={styles.progressPercent}>{percent}%</Text>
        </View>
        <View style={styles.progressDates}>
          <Text style={styles.progressDateText}>Start {startLabel}</Text>
          <Text style={styles.progressDateText}>Due {dueLabel}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
      </View>
    </View>
  );
}

function PregnancyCard({
  startDate,
  dueDate,
  countdownStarted,
  onStartCountdown,
}: {
  startDate: string;
  dueDate: string;
  countdownStarted: boolean;
  onStartCountdown: () => void;
}) {
  const router = useRouter();

  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionEyebrow}>Your pregnancy</Text>
      <View style={styles.softCardDarker}>
        <View style={styles.formRow}>
          <Text style={styles.fieldLabel}>Start date</Text>
          <TouchableOpacity
            style={styles.fieldValue}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.82}
          >
            <Text style={styles.fieldValueText}>{formatDateShort(startDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color={ACCENT_DARK} />
          </TouchableOpacity>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.fieldLabel}>Due date</Text>
          <TouchableOpacity
            style={styles.fieldValue}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.82}
          >
            <Text style={styles.fieldValueText}>{formatDateShort(dueDate)}</Text>
            <Ionicons name="calendar" size={20} color={ACCENT_DARK} />
          </TouchableOpacity>
        </View>
        {!countdownStarted ? (
          <TouchableOpacity style={styles.secondaryCta} onPress={onStartCountdown} activeOpacity={0.9}>
            <Text style={styles.secondaryCtaText}>Start countdown</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const GENDERS = [
  { key: 'boy' as const, label: 'Boy', icon: 'male-outline' as const },
  { key: 'girl' as const, label: 'Girl', icon: 'female-outline' as const },
  { key: 'surprise' as const, label: 'Surprise', icon: 'gift-outline' as const },
];

function GenderSelector({
  selected,
  onSelect,
}: {
  selected: 'boy' | 'girl' | 'surprise';
  onSelect: (g: 'boy' | 'girl' | 'surprise') => void;
}) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionEyebrow}>It's a...</Text>
      <View style={styles.genderRow}>
        {GENDERS.map((item) => {
          const active = item.key === selected;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.genderCard, active && styles.genderCardActive]}
              onPress={() => onSelect(item.key)}
              activeOpacity={0.82}
            >
              <Ionicons
                name={item.icon}
                size={32}
                color={active ? ACCENT_DARK : '#A89C90'}
                style={{ marginBottom: 10 }}
              />
              <Text style={[styles.genderText, active && styles.genderTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function CustomizeCard() {
  const router = useRouter();

  return (
    <View style={styles.sectionWrapLast}>
      <View style={styles.softCardDarker}>
        <Text style={styles.customizeTitle}>Make it truly yours</Text>
        <Text style={styles.customizeBody}>
          Personalize your countdown with fonts, colors, and photos
        </Text>
        <TouchableOpacity
          style={styles.heroCta}
          onPress={() => router.push('/(tabs)/design')}
          activeOpacity={0.9}
        >
          <Ionicons name="pencil-outline" size={17} color="#fff" />
          <Text style={styles.heroCtaText}>Customize design</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreenEditorialV2() {
  const { profile, updateProfile } = useProfile();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const dueDate =
    profile?.dueDate ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const startDate =
    profile?.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const countdownStarted = profile?.countdownStarted === true;
  const gender = (profile?.gender as 'boy' | 'girl' | 'surprise') ?? 'boy';

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
    scrollRef.current?.scrollTo({ y: 720, animated: true });
  }, []);

  const handleStartCountdown = useCallback(() => {
    updateProfile?.({ countdownStarted: true });
  }, [updateProfile]);

  const genderLabel =
    gender === 'boy' ? "IT'S A BOY" : gender === 'girl' ? "IT'S A GIRL" : "IT'S A SURPRISE";

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HeroBlock
          weeks={weekDay.weeks}
          days={weekDay.days}
          hours={time.hours}
          minutes={time.minutes}
          seconds={time.seconds}
          countdownStarted={countdownStarted}
          genderLabel={genderLabel}
          onEdit={() => router.push('/(tabs)/design')}
          onShare={handleShare}
          onScrollToDetails={scrollToDetails}
        />

        <ValueText />

        <TimeRemaining
          countdownStarted={countdownStarted}
          weekDay={weekDay}
          timeData={time}
        />

        <JourneyProgressCard
          percent={countdownStarted ? percent : 0}
          startLabel={formatDateLabel(startDate)}
          dueLabel={formatDateLabel(dueDate)}
        />

        <PregnancyCard
          startDate={startDate}
          dueDate={dueDate}
          countdownStarted={countdownStarted}
          onStartCountdown={handleStartCountdown}
        />

        <GenderSelector
          selected={gender}
          onSelect={(g) => updateProfile?.({ gender: g })}
        />

        <CustomizeCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    marginLeft: 12,
    fontSize: 21,
    letterSpacing: -0.3,
  },
  brandBold: {
    color: TEXT,
    fontWeight: '700',
  },
  brandLight: {
    color: TEXT_SOFT,
    fontWeight: '300',
  },
  heroOuter: {
    marginHorizontal: H_PADDING,
    marginTop: 12,
    marginBottom: 28,
  },
  heroShadow: {
    position: 'absolute',
    top: 14,
    left: 12,
    right: 12,
    borderRadius: HERO_RADIUS + 2,
    backgroundColor: SHADOW,
    shadowColor: '#8A7358',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 6,
  },
  heroCard: {
    overflow: 'hidden',
    borderRadius: HERO_RADIUS,
    backgroundColor: SURFACE,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 22,
  },
  heroTexture1: {
    position: 'absolute',
    top: -16,
    left: -50,
    width: 280,
    height: 200,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroTexture2: {
    position: 'absolute',
    right: -24,
    top: 80,
    width: 200,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(228,218,205,0.38)',
  },
  heroTexture3: {
    position: 'absolute',
    left: 120,
    bottom: 48,
    width: 160,
    height: 120,
    borderRadius: 999,
    backgroundColor: 'rgba(210,195,178,0.14)',
  },
  heroMist: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  heroBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    backgroundColor: 'rgba(180,155,130,0.045)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadge: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: PILL_RADIUS,
    backgroundColor: WHITE_GLASS,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.9,
    color: TEXT,
  },
  heroEdit: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeadline: {
    marginTop: 20,
    marginBottom: 18,
    textAlign: 'center',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '300',
    letterSpacing: -0.6,
    color: TEXT_SOFT,
  },
  heroCountdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroUnit: {
    minWidth: 88,
    alignItems: 'center',
  },
  heroValue: {
    fontSize: 76,
    lineHeight: 80,
    fontWeight: '300',
    letterSpacing: -2.8,
    color: TEXT,
    fontVariant: ['tabular-nums'],
  },
  heroLabel: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    letterSpacing: 2,
    color: TEXT_SOFT,
  },
  heroDivider: {
    width: 1,
    height: 56,
    marginHorizontal: 12,
    backgroundColor: 'rgba(100,80,60,0.07)',
  },
  heroTimerPill: {
    alignSelf: 'center',
    width: 140,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(55,42,30,0.05)',
  },
  heroTimerText: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
    letterSpacing: 0.2,
    color: TEXT,
    fontVariant: ['tabular-nums'],
  },
  heroTimerLabels: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 24,
  },
  heroTimerLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    color: TEXT_FAINT,
  },
  heroCta: {
    height: 52,
    borderRadius: BUTTON_RADIUS,
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.05,
  },
  heroEmpty: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  heroEmptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: TEXT_SOFT,
    textAlign: 'center',
    marginBottom: 20,
  },
  valueTextWrap: {
    marginHorizontal: H_PADDING,
    marginBottom: 32,
    alignItems: 'center',
  },
  valueTextLine: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: TEXT_SOFT,
    textAlign: 'center',
  },
  valueTextSub: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_FAINT,
    marginTop: 4,
  },
  sectionWrap: {
    marginHorizontal: H_PADDING,
    marginBottom: 32,
  },
  sectionWrapLast: {
    marginHorizontal: H_PADDING,
    marginBottom: 120,
  },
  sectionEyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.9,
    color: TEXT_SOFT,
    marginBottom: 10,
  },
  sectionHint: {
    fontSize: 11,
    lineHeight: 15,
    color: TEXT_FAINT,
    marginBottom: 14,
  },
  timeBlock: {
    marginHorizontal: H_PADDING,
    marginBottom: 32,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timeNumber: {
    fontSize: 58,
    lineHeight: 62,
    fontWeight: '300',
    letterSpacing: -2.2,
    color: TEXT,
    fontVariant: ['tabular-nums'],
    marginRight: 8,
  },
  timeUnit: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '300',
    color: TEXT_SOFT,
  },
  softCard: {
    backgroundColor: SURFACE_CARD,
    borderRadius: CARD_RADIUS,
    padding: 24,
    shadowColor: '#8A7358',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  softCardDarker: {
    backgroundColor: SURFACE_CARD_DARKER,
    borderRadius: CARD_RADIUS,
    padding: 24,
    shadowColor: '#8A7358',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  cardEyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.9,
    color: TEXT_SOFT,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  progressPercent: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '300',
    color: ACCENT_DARK,
  },
  progressDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  progressDateText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_SOFT,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(88,70,52,0.07)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: ACCENT,
  },
  formRow: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 0.7,
    color: TEXT_SOFT,
    marginBottom: 8,
  },
  fieldValue: {
    minHeight: 68,
    borderRadius: 22,
    backgroundColor: WHITE_SOFT,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldValueText: {
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '500',
    letterSpacing: -0.3,
    color: TEXT,
  },
  secondaryCta: {
    marginTop: 6,
    height: 52,
    borderRadius: 26,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCtaText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  genderCard: {
    flex: 1,
    height: 112,
    borderRadius: 22,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderCardActive: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(168,138,108,0.28)',
  },
  genderText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    color: '#A89C90',
  },
  genderTextActive: {
    color: ACCENT_DARK,
  },
  customizeTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '400',
    letterSpacing: -0.8,
    color: TEXT,
    marginBottom: 10,
  },
  customizeBody: {
    fontSize: 15,
    lineHeight: 23,
    color: TEXT_SOFT,
    marginBottom: 20,
  },
});
