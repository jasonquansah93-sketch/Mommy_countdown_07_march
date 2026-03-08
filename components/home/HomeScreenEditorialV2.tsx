/**
 * HomeScreenEditorialV2 — full editorial redesign
 * Design language: warm sepia · cream · soft beige · ultra-light numbers
 * italic headlines · generous air · refined orb textures · no utilitarian widgets
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Dimensions,
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

// ─── Design tokens ─────────────────────────────────────────────────────────
const SCREEN_W    = Dimensions.get('window').width;

const BG          = '#F5F0E8';   // main screen background — warm cream
const HERO_A      = '#EEE5D8';   // hero gradient start
const HERO_B      = '#E5DACC';   // hero gradient mid
const HERO_C      = '#D9CCBC';   // hero gradient end
const CARD        = '#EBE4DA';   // default card
const CARD_ALT    = '#E6DED3';   // slightly deeper card
const CARD_DARK   = '#DDD5C8';   // darkest card used in customize
const WHITE_GLASS = 'rgba(255,255,255,0.54)';

const INK         = '#231C17';   // deep warm near-black
const INK_MED     = '#6A5C52';   // medium warm
const INK_SOFT    = '#9B8D83';   // faint warm
const ACCENT      = '#B28D68';   // warm terracotta-gold
const ACCENT_DEEP = '#9A7550';   // deeper accent for active states
const RULE        = 'rgba(155,125,95,0.18)';

const H_PAD       = 22;
const HERO_R      = 34;
const CARD_R      = 28;

type TimeMode = 'days' | 'weeks' | 'hours';
const MODES: TimeMode[] = ['days', 'weeks', 'hours'];

function pad(v: number) {
  return String(Math.max(0, v)).padStart(2, '0');
}

// ─── Header ────────────────────────────────────────────────────────────────
function Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
      <View style={styles.headerBrand}>
        <View style={styles.headerHeart}>
          <Ionicons name="heart" size={14} color={ACCENT} />
        </View>
        <Text style={styles.brandText}>
          <Text style={styles.brandBold}>Mommy</Text>
          <Text style={styles.brandLight}>Count</Text>
        </Text>
      </View>
      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={() => router.push('/(tabs)/profile')}
        activeOpacity={0.78}
      >
        <Ionicons name="settings-outline" size={18} color={INK_MED} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────
function HeroBlock({
  weeks, days, hours, minutes, seconds,
  countdownStarted, genderLabel,
  onEdit, onShare, onScrollToDetails,
}: {
  weeks: number; days: number; hours: number;
  minutes: number; seconds: number;
  countdownStarted: boolean; genderLabel: string;
  onEdit: () => void; onShare: () => void; onScrollToDetails: () => void;
}) {
  return (
    <View style={styles.heroOuter}>
      {/* Soft ambient shadow */}
      <View style={styles.heroShadow} />

      <View style={styles.heroCard}>
        <LinearGradient
          colors={[HERO_A, HERO_B, HERO_C, '#CEBFAE']}
          start={{ x: 0.05, y: 0.05 }}
          end={{ x: 0.95, y: 0.95 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Soft organic orbs for texture */}
        <View style={styles.orbTopLeft} />
        <View style={styles.orbBottomRight} />
        <View style={styles.orbMidRight} />
        <View style={styles.orbBottomLeft} />

        {/* Top row: gender badge + edit */}
        <View style={styles.heroTopRow}>
          <View style={styles.genderPill}>
            <Ionicons name="heart" size={10} color={ACCENT_DEEP} style={{ marginRight: 6 }} />
            <Text style={styles.genderPillText}>{genderLabel}</Text>
          </View>
          <TouchableOpacity style={styles.heroEditBtn} onPress={onEdit} activeOpacity={0.78}>
            <Ionicons name="pencil" size={15} color={INK_MED} />
          </TouchableOpacity>
        </View>

        {/* Italic headline */}
        <Text style={styles.heroHeadline}>
          {countdownStarted ? 'Meeting you in\u2026' : 'Ready to begin?'}
        </Text>

        {countdownStarted ? (
          <>
            {/* Big countdown: WEEKS · DAYS · HRS */}
            <View style={styles.countRow}>
              <View style={styles.countUnit}>
                <Text style={styles.countNum}>{pad(weeks)}</Text>
                <Text style={styles.countLabel}>WEEKS</Text>
              </View>

              <View style={styles.countSep} />

              <View style={styles.countUnit}>
                <Text style={styles.countNum}>{pad(days)}</Text>
                <Text style={styles.countLabel}>DAYS</Text>
              </View>

              <View style={styles.countSep} />

              <View style={styles.countUnit}>
                <Text style={styles.countNum}>{pad(hours)}</Text>
                <Text style={styles.countLabel}>HRS</Text>
              </View>
            </View>

            {/* Subtle MM:SS ticker */}
            <View style={styles.tickerPill}>
              <Text style={styles.tickerNum}>{pad(minutes)}</Text>
              <Text style={styles.tickerColon}>:</Text>
              <Text style={styles.tickerNum}>{pad(seconds)}</Text>
              <View style={styles.tickerLabels}>
                <Text style={styles.tickerLabel}>MIN</Text>
                <Text style={styles.tickerLabel}>SEC</Text>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity style={styles.heroCta} onPress={onShare} activeOpacity={0.86}>
              <Ionicons name="share-outline" size={15} color="#fff" />
              <Text style={styles.heroCtaText}>Share our countdown</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.heroEmptyWrap}>
            <Text style={styles.heroEmptySub}>
              Set your dates to begin the journey.
            </Text>
            <TouchableOpacity style={styles.heroCta} onPress={onScrollToDetails} activeOpacity={0.86}>
              <Text style={styles.heroCtaText}>Start countdown</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Value / Premium line ─────────────────────────────────────────────────
function ValueLine() {
  return (
    <View style={styles.valueWrap}>
      <View style={styles.valueSep} />
      <Text style={styles.valueText}>
        Every moment of this journey{'\n'}is worth remembering.
      </Text>
      <Text style={styles.valueUpgrade}>Upgrade to Premium →</Text>
      <View style={styles.valueSep} />
    </View>
  );
}

// ─── Time Remaining ────────────────────────────────────────────────────────
function TimeRemaining({
  countdownStarted, weekDay, timeData,
}: {
  countdownStarted: boolean;
  weekDay: { weeks: number; days: number };
  timeData: ReturnType<typeof getTimeUntilDueMs>;
}) {
  const [mode, setMode] = useState<TimeMode>('days');

  useEffect(() => {
    loadJSON<TimeMode>('v2_time_mode').then((s) => {
      if (s && MODES.includes(s)) setMode(s);
    });
  }, []);

  const cycle = useCallback(() => {
    const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
    saveJSON('v2_time_mode', next);
    setMode(next);
  }, [mode]);

  const displayValue =
    mode === 'days'  ? timeData.days :
    mode === 'weeks' ? weekDay.weeks :
    timeData.days * 24 + timeData.hours;

  const displayUnit =
    mode === 'days'  ? 'days' :
    mode === 'weeks' ? 'weeks' : 'hours';

  const nextMode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];

  return (
    <View style={styles.block}>
      <View style={styles.blockTitleRow}>
        <Text style={styles.eyebrow}>Time remaining</Text>
        {countdownStarted && (
          <TouchableOpacity onPress={cycle} activeOpacity={0.78} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.modeLink}>→ {nextMode}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeNum}>
          {countdownStarted ? String(displayValue) : '—'}
        </Text>
        {countdownStarted && (
          <Text style={styles.timeUnit}>{displayUnit}</Text>
        )}
      </View>
    </View>
  );
}

// ─── Journey Progress ─────────────────────────────────────────────────────
function JourneyProgress({
  percent, startLabel, dueLabel,
}: {
  percent: number; startLabel: string; dueLabel: string;
}) {
  const safePct = Math.min(Math.max(0, percent), 100);

  return (
    <View style={styles.block}>
      <View style={styles.softCard}>
        {/* Header row */}
        <View style={styles.progressTitleRow}>
          <Text style={styles.eyebrow}>Journey progress</Text>
          <Text style={styles.progressPct}>{safePct}%</Text>
        </View>

        {/* Date endpoints */}
        <View style={styles.progressDates}>
          <Text style={styles.progressDate}>{startLabel}</Text>
          <Text style={styles.progressDate}>{dueLabel}</Text>
        </View>

        {/* Track */}
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[ACCENT, ACCENT_DEEP]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${safePct}%` as any }]}
          />
        </View>

        {/* Endpoint dots */}
        <View style={styles.progressDotRow}>
          <View style={[styles.progressDot, { backgroundColor: ACCENT }]} />
          <View style={[styles.progressDot, { backgroundColor: RULE }]} />
        </View>
      </View>
    </View>
  );
}

// ─── Pregnancy Section ────────────────────────────────────────────────────
function PregnancySection({
  startDate, dueDate, countdownStarted, onStartCountdown,
}: {
  startDate: string; dueDate: string;
  countdownStarted: boolean; onStartCountdown: () => void;
}) {
  const router = useRouter();

  return (
    <View style={styles.block}>
      <Text style={[styles.eyebrow, { marginBottom: 14 }]}>Your pregnancy</Text>
      <View style={styles.cardAlt}>
        {/* Start date row */}
        <TouchableOpacity
          style={styles.dateRow}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.78}
        >
          <View>
            <Text style={styles.dateRowLabel}>Start date</Text>
            <Text style={styles.dateRowValue}>{formatDateShort(startDate)}</Text>
          </View>
          <Ionicons name="calendar-outline" size={22} color={ACCENT} />
        </TouchableOpacity>

        <View style={styles.cardRule} />

        {/* Due date row */}
        <TouchableOpacity
          style={styles.dateRow}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.78}
        >
          <View>
            <Text style={styles.dateRowLabel}>Due date</Text>
            <Text style={styles.dateRowValue}>{formatDateShort(dueDate)}</Text>
          </View>
          <Ionicons name="calendar" size={22} color={ACCENT} />
        </TouchableOpacity>

        {!countdownStarted && (
          <TouchableOpacity
            style={styles.secondaryCta}
            onPress={onStartCountdown}
            activeOpacity={0.86}
          >
            <Text style={styles.secondaryCtaText}>Start countdown</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Gender Section ───────────────────────────────────────────────────────
const GENDERS = [
  { key: 'boy'      as const, label: 'Boy',      icon: 'male-outline'   as const },
  { key: 'girl'     as const, label: 'Girl',     icon: 'female-outline' as const },
  { key: 'surprise' as const, label: 'Surprise', icon: 'gift-outline'   as const },
] as const;

function GenderSection({
  selected, onSelect,
}: {
  selected: 'boy' | 'girl' | 'surprise';
  onSelect: (g: 'boy' | 'girl' | 'surprise') => void;
}) {
  return (
    <View style={styles.block}>
      <Text style={[styles.eyebrow, { marginBottom: 14 }]}>It's a…</Text>
      <View style={styles.genderRow}>
        {GENDERS.map((item) => {
          const active = item.key === selected;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.genderCard, active && styles.genderCardActive]}
              onPress={() => onSelect(item.key)}
              activeOpacity={0.78}
            >
              <Ionicons
                name={item.icon}
                size={26}
                color={active ? ACCENT_DEEP : INK_SOFT}
                style={{ marginBottom: 10 }}
              />
              <Text style={[styles.genderCardLabel, active && styles.genderCardLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Customize Section ────────────────────────────────────────────────────
function CustomizeSection() {
  const router = useRouter();

  return (
    <View style={styles.customizeOuter}>
      <LinearGradient
        colors={[CARD_ALT, CARD_DARK, '#CFC3B3']}
        start={{ x: 0.05, y: 0.05 }}
        end={{ x: 0.95, y: 0.95 }}
        style={styles.customizeGrad}
      >
        {/* Decorative orb */}
        <View style={styles.customizeOrb} />

        <Text style={styles.customizeEyebrow}>CUSTOMIZE</Text>
        <Text style={styles.customizeHeadline}>
          Make it{'\n'}truly yours.
        </Text>
        <Text style={styles.customizeBody}>
          Personalize with fonts, colors, and photos — create a countdown as unique as your story.
        </Text>
        <TouchableOpacity
          style={styles.customizeCta}
          onPress={() => router.push('/(tabs)/design')}
          activeOpacity={0.86}
        >
          <Ionicons name="pencil-outline" size={15} color="#fff" />
          <Text style={styles.customizeCtaText}>Customize design</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────
export default function HomeScreenEditorialV2() {
  const { profile, updateProfile } = useProfile();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const dueDate   = profile?.dueDate   ?? new Date(Date.now() + 90 * 86400000).toISOString();
  const startDate = profile?.startDate ?? new Date(Date.now() - 30 * 86400000).toISOString();

  const countdownStarted = profile?.countdownStarted === true;
  const gender = (profile?.gender as 'boy' | 'girl' | 'surprise') ?? 'surprise';

  const weekDay = useMemo(() => getWeeksAndDays(dueDate), [dueDate]);
  const [time, setTime] = useState(() => getTimeUntilDueMs(dueDate));
  const percent = useMemo(() => getJourneyProgress(startDate, dueDate), [startDate, dueDate]);

  useEffect(() => {
    if (!countdownStarted) return;
    const id = setInterval(() => setTime(getTimeUntilDueMs(dueDate)), 1000);
    return () => clearInterval(id);
  }, [countdownStarted, dueDate]);

  const handleShare = useCallback(() => {
    Share.share({
      message: `${weekDay.weeks} weeks and ${weekDay.days} days until we meet our little one \u{1F49B}`,
    });
  }, [weekDay]);

  const scrollToDetails = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 780, animated: true });
  }, []);

  const handleStartCountdown = useCallback(() => {
    updateProfile?.({ countdownStarted: true });
  }, [updateProfile]);

  const genderLabel =
    gender === 'boy'  ? "IT'S A BOY" :
    gender === 'girl' ? "IT'S A GIRL" : "IT'S A SURPRISE";

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero Countdown */}
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

        {/* 2. Value / Premium line under hero */}
        <ValueLine />

        {/* 3. Time Remaining */}
        <TimeRemaining
          countdownStarted={countdownStarted}
          weekDay={weekDay}
          timeData={time}
        />

        {/* 4. Journey Progress */}
        <JourneyProgress
          percent={countdownStarted ? percent : 0}
          startLabel={formatDateLabel(startDate)}
          dueLabel={formatDateLabel(dueDate)}
        />

        {/* 5. Your Pregnancy */}
        <PregnancySection
          startDate={startDate}
          dueDate={dueDate}
          countdownStarted={countdownStarted}
          onStartCountdown={handleStartCountdown}
        />

        {/* 6. Gender Selection */}
        <GenderSection
          selected={gender}
          onSelect={(g) => updateProfile?.({ gender: g })}
        />

        {/* 7. Customize Design */}
        <CustomizeSection />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 36,
  },

  // ── Header ──
  header: {
    paddingHorizontal: H_PAD,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BG,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerHeart: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 21,
    letterSpacing: -0.3,
  },
  brandBold: {
    color: INK,
    fontWeight: '700',
  },
  brandLight: {
    color: INK_MED,
    fontWeight: '300',
  },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Hero ──
  heroOuter: {
    marginHorizontal: H_PAD,
    marginTop: 6,
    marginBottom: 40,
  },
  heroShadow: {
    position: 'absolute',
    top: 18,
    left: 8,
    right: 8,
    bottom: -10,
    borderRadius: HERO_R + 4,
    backgroundColor: 'rgba(115,88,62,0.06)',
    shadowColor: '#6E4E2C',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.09,
    shadowRadius: 36,
    elevation: 10,
  },
  heroCard: {
    overflow: 'hidden',
    borderRadius: HERO_R,
    minHeight: 450,
    paddingTop: 24,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  orbTopLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 360,
    height: 290,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  orbBottomRight: {
    position: 'absolute',
    bottom: -50,
    right: -70,
    width: 280,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(190,168,140,0.16)',
  },
  orbMidRight: {
    position: 'absolute',
    right: -30,
    top: 120,
    width: 180,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(208,188,162,0.13)',
  },
  orbBottomLeft: {
    position: 'absolute',
    left: -20,
    bottom: 60,
    width: 140,
    height: 110,
    borderRadius: 999,
    backgroundColor: 'rgba(230,215,195,0.12)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  genderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: WHITE_GLASS,
  },
  genderPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: INK,
  },
  heroEditBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeadline: {
    marginTop: 24,
    marginBottom: 26,
    textAlign: 'center',
    fontSize: 33,
    lineHeight: 40,
    fontWeight: '300',
    fontStyle: 'italic',
    letterSpacing: -0.6,
    color: INK_MED,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  countUnit: {
    alignItems: 'center',
    minWidth: 88,
  },
  countNum: {
    fontSize: 82,
    lineHeight: 86,
    fontWeight: '200',
    letterSpacing: -3.5,
    color: INK,
    fontVariant: ['tabular-nums'],
  },
  countLabel: {
    marginTop: 5,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: INK_SOFT,
  },
  countSep: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(100,78,55,0.20)',
    marginBottom: 26,
    marginHorizontal: 6,
  },
  tickerPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 16,
    backgroundColor: 'rgba(50,35,20,0.05)',
    marginBottom: 26,
    gap: 4,
  },
  tickerNum: {
    fontSize: 28,
    fontWeight: '200',
    letterSpacing: -0.5,
    color: INK,
    fontVariant: ['tabular-nums'],
  },
  tickerColon: {
    fontSize: 22,
    fontWeight: '200',
    color: INK_MED,
    marginBottom: 4,
  },
  tickerLabels: {
    marginLeft: 8,
    gap: 6,
  },
  tickerLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: INK_SOFT,
  },
  heroCta: {
    height: 52,
    borderRadius: 999,
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroCtaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  heroEmptyWrap: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 22,
  },
  heroEmptySub: {
    fontSize: 16,
    lineHeight: 25,
    fontStyle: 'italic',
    color: INK_MED,
    textAlign: 'center',
  },

  // ── Value line ──
  valueWrap: {
    marginHorizontal: H_PAD,
    marginBottom: 46,
    alignItems: 'center',
    gap: 12,
  },
  valueSep: {
    width: SCREEN_W * 0.38,
    height: 1,
    backgroundColor: RULE,
  },
  valueText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    color: INK_SOFT,
    textAlign: 'center',
    letterSpacing: 0.05,
  },
  valueUpgrade: {
    fontSize: 12,
    fontWeight: '600',
    color: ACCENT,
    letterSpacing: 0.2,
  },

  // ── Section blocks ──
  block: {
    marginHorizontal: H_PAD,
    marginBottom: 42,
  },
  blockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: INK_SOFT,
    textTransform: 'uppercase',
  },
  modeLink: {
    fontSize: 12,
    fontWeight: '500',
    color: ACCENT,
    letterSpacing: 0.2,
  },

  // ── Time Remaining ──
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  timeNum: {
    fontSize: 76,
    lineHeight: 80,
    fontWeight: '200',
    letterSpacing: -3.5,
    color: INK,
    fontVariant: ['tabular-nums'],
  },
  timeUnit: {
    fontSize: 24,
    fontWeight: '300',
    color: INK_MED,
    letterSpacing: -0.3,
  },

  // ── Soft cards ──
  softCard: {
    backgroundColor: CARD,
    borderRadius: CARD_R,
    padding: 26,
  },
  cardAlt: {
    backgroundColor: CARD_ALT,
    borderRadius: CARD_R,
    paddingVertical: 4,
    paddingHorizontal: 22,
  },

  // ── Journey progress internals ──
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  progressPct: {
    fontSize: 18,
    fontWeight: '300',
    color: ACCENT,
    letterSpacing: -0.4,
  },
  progressDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressDate: {
    fontSize: 13,
    fontWeight: '500',
    color: INK_MED,
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(90,68,46,0.08)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
    borderRadius: 999,
  },
  progressDotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── Pregnancy section internals ──
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  dateRowLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: INK_SOFT,
    marginBottom: 6,
  },
  dateRowValue: {
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: -0.4,
    color: INK,
  },
  cardRule: {
    height: 1,
    backgroundColor: 'rgba(115,90,65,0.08)',
  },
  secondaryCta: {
    marginTop: 18,
    marginBottom: 12,
    height: 52,
    borderRadius: 999,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCtaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Gender section ──
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderCard: {
    flex: 1,
    height: 120,
    borderRadius: 26,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderCardActive: {
    backgroundColor: WHITE_GLASS,
    borderWidth: 1.5,
    borderColor: 'rgba(160,128,95,0.28)',
  },
  genderCardLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: INK_SOFT,
  },
  genderCardLabelActive: {
    color: ACCENT_DEEP,
    fontWeight: '600',
  },

  // ── Customize section ──
  customizeOuter: {
    marginHorizontal: H_PAD,
    marginBottom: 120,
    borderRadius: CARD_R + 6,
    overflow: 'hidden',
  },
  customizeGrad: {
    padding: 32,
    paddingBottom: 38,
    borderRadius: CARD_R + 6,
    overflow: 'hidden',
    position: 'relative',
  },
  customizeOrb: {
    position: 'absolute',
    top: -50,
    right: -60,
    width: 240,
    height: 200,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  customizeEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.2,
    color: ACCENT_DEEP,
    marginBottom: 14,
  },
  customizeHeadline: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '300',
    fontStyle: 'italic',
    letterSpacing: -1.2,
    color: INK,
    marginBottom: 16,
  },
  customizeBody: {
    fontSize: 15,
    lineHeight: 24,
    color: INK_MED,
    marginBottom: 30,
  },
  customizeCta: {
    height: 52,
    borderRadius: 999,
    backgroundColor: ACCENT_DEEP,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  customizeCtaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
