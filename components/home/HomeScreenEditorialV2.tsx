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

const BG = '#F8F4EE';
const SURFACE = '#F3EEE6';
const SURFACE_CARD = '#EFE8DE';
const SURFACE_CARD_DARKER = '#ECE4D8';
const WHITE_GLASS = 'rgba(255,255,255,0.62)';
const WHITE_SOFT = 'rgba(255,255,255,0.82)';
const TEXT = '#2B2420';
const TEXT_SOFT = '#998C80';
const TEXT_FAINT = '#B5A79A';
const ACCENT = '#C6AB8E';
const ACCENT_DARK = '#B29372';
const SHADOW = 'rgba(117, 93, 69, 0.10)';

const H_PADDING = 20;
const HERO_RADIUS = 34;
const CARD_RADIUS = 30;
const PILL_RADIUS = 999;
const BUTTON_RADIUS = 31;

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
  isPremium,
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
  isPremium: boolean;
  onEdit: () => void;
  onShare: () => void;
  onScrollToDetails: () => void;
}) {
  const heroHeight = 455;

  return (
    <View style={styles.heroOuter}>
      <View style={[styles.heroShadow, { height: heroHeight + 18 }]} />

      <View style={[styles.heroCard, { minHeight: heroHeight }]}>
        <LinearGradient
          colors={['#F6F1EA', '#EEE5DA', '#E7DDCF']}
          start={{ x: 0.05, y: 0.05 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.heroShapeOne} />
        <View style={styles.heroShapeTwo} />
        <View style={styles.heroShapeThree} />
        <View style={styles.heroShapeFour} />
        <View style={styles.heroMist} />
        <View style={styles.heroBand} />

        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{genderLabel}</Text>
            {isPremium ? (
              <Ionicons name="star" size={11} color={ACCENT_DARK} style={{ marginLeft: 6 }} />
            ) : null}
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
            </View>

            <TouchableOpacity style={styles.heroCta} onPress={onShare} activeOpacity={0.9}>
              <Ionicons name="share-outline" size={18} color="#fff" />
              <Text style={styles.heroCtaText}>Share our countdown</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
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

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>

        <View style={styles.progressDates}>
          <Text style={styles.progressDateText}>Start {startLabel}</Text>
          <Text style={styles.progressDateText}>Due {dueLabel}</Text>
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
            <Ionicons name="calendar-outline" size={22} color={ACCENT_DARK} />
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
            <Ionicons name="calendar" size={22} color={ACCENT_DARK} />
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
                size={34}
                color={active ? ACCENT_DARK : '#A89C90'}
                style={{ marginBottom: 12 }}
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
          <Ionicons name="pencil-outline" size={18} color="#fff" />
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
    scrollRef.current?.scrollTo({ y: 690, animated: true });
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
          isPremium={isPremium}
          onEdit={() => router.push('/(tabs)/design')}
          onShare={handleShare}
          onScrollToDetails={scrollToDetails}
        />

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
    paddingBottom: 16,
  },

  header: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brand: {
    marginLeft: 12,
    fontSize: 22,
    letterSpacing: -0.35,
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
    marginTop: 10,
    marginBottom: 22,
  },

  heroShadow: {
    position: 'absolute',
    top: 18,
    left: 10,
    right: 10,
    borderRadius: HERO_RADIUS + 2,
    backgroundColor: SHADOW,
    shadowColor: '#8F775D',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.06,
    shadowRadius: 28,
    elevation: 7,
  },

  heroCard: {
    overflow: 'hidden',
    borderRadius: HERO_RADIUS,
    backgroundColor: SURFACE,
    paddingTop: 22,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },

  heroShapeOne: {
    position: 'absolute',
    top: -12,
    left: -62,
    width: 300,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },

  heroShapeTwo: {
    position: 'absolute',
    right: -30,
    top: 92,
    width: 240,
    height: 170,
    borderRadius: 999,
    backgroundColor: 'rgba(233,223,210,0.42)',
  },

  heroShapeThree: {
    position: 'absolute',
    left: 174,
    bottom: 54,
    width: 190,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(214,198,179,0.16)',
  },

  heroShapeFour: {
    position: 'absolute',
    left: -22,
    top: 182,
    width: 380,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  heroMist: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },

  heroBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 122,
    backgroundColor: 'rgba(194,171,142,0.055)',
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heroBadge: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: PILL_RADIUS,
    backgroundColor: WHITE_GLASS,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: TEXT,
  },

  heroEdit: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroHeadline: {
    marginTop: 22,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '300',
    letterSpacing: -1,
    color: TEXT_SOFT,
  },

  heroCountdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  heroUnit: {
    minWidth: 92,
    alignItems: 'center',
  },

  heroValue: {
    fontSize: 82,
    lineHeight: 86,
    fontWeight: '300',
    letterSpacing: -3.2,
    color: TEXT,
    fontVariant: ['tabular-nums'],
  },

  heroLabel: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 2.1,
    color: TEXT_SOFT,
  },

  heroDivider: {
    width: 1,
    height: 60,
    marginHorizontal: 14,
    backgroundColor: 'rgba(104,82,61,0.08)',
  },

  heroTimerPill: {
    alignSelf: 'center',
    width: 168,
    height: 66,
    borderRadius: 24,
    backgroundColor: 'rgba(60,45,32,0.055)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  heroTimerText: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '300',
    letterSpacing: 0.2,
    color: TEXT,
    fontVariant: ['tabular-nums'],
  },

  heroCta: {
    height: 62,
    borderRadius: BUTTON_RADIUS,
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCtaText: {
    marginLeft: 10,
    color: '#fff',
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  heroEmpty: {
    paddingVertical: 34,
    alignItems: 'center',
  },

  heroEmptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: TEXT_SOFT,
    textAlign: 'center',
    marginBottom: 22,
  },

  sectionWrap: {
    marginHorizontal: H_PADDING,
    marginBottom: 26,
  },

  sectionWrapLast: {
    marginHorizontal: H_PADDING,
    marginBottom: 110,
  },

  sectionEyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.95,
    color: TEXT_SOFT,
    marginBottom: 6,
  },

  sectionHint: {
    fontSize: 11,
    lineHeight: 15,
    color: TEXT_FAINT,
    marginBottom: 12,
  },

  timeBlock: {
    marginHorizontal: H_PADDING,
    marginBottom: 26,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  timeNumber: {
    fontSize: 64,
    lineHeight: 68,
    fontWeight: '300',
    letterSpacing: -2.4,
    color: TEXT,
    fontVariant: ['tabular-nums'],
    marginRight: 8,
  },

  timeUnit: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '300',
    color: TEXT_SOFT,
  },

  softCard: {
    backgroundColor: SURFACE_CARD,
    borderRadius: CARD_RADIUS,
    padding: 22,
  },

  softCardDarker: {
    backgroundColor: SURFACE_CARD_DARKER,
    borderRadius: CARD_RADIUS,
    padding: 20,
  },

  cardEyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.95,
    color: TEXT_SOFT,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  progressPercent: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '300',
    color: ACCENT_DARK,
  },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(92,74,52,0.08)',
    overflow: 'hidden',
    marginBottom: 16,
  },

  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: ACCENT,
  },

  progressDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressDateText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_SOFT,
  },

  formRow: {
    marginBottom: 16,
  },

  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.7,
    color: TEXT_SOFT,
    marginBottom: 8,
  },

  fieldValue: {
    minHeight: 74,
    borderRadius: 22,
    backgroundColor: WHITE_SOFT,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  fieldValueText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: -0.4,
    color: TEXT,
  },

  secondaryCta: {
    marginTop: 4,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryCtaText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '600',
  },

  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  genderCard: {
    width: '31.5%',
    height: 120,
    borderRadius: 24,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  genderCardActive: {
    backgroundColor: 'rgba(255,255,255,0.74)',
    borderWidth: 1.2,
    borderColor: 'rgba(184,160,136,0.34)',
  },

  genderText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#AA9D91',
  },

  genderTextActive: {
    color: ACCENT_DARK,
  },

  customizeTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '400',
    letterSpacing: -0.9,
    color: TEXT,
    marginBottom: 12,
  },

  customizeBody: {
    fontSize: 16,
    lineHeight: 25,
    color: TEXT_SOFT,
    marginBottom: 22,
  },
});
