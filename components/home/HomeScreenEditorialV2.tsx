import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const { width: SW } = Dimensions.get('window');
const H_PAD = 20;
const CARD_W = SW - H_PAD * 2;

const TEXT_DARK  = '#2E2418';
const TEXT_MED   = '#6B5C4D';
const TEXT_SOFT  = '#9E9082';
const ACCENT     = '#B89060';
const ACCENT_BTN = '#C0996A';

type GenderValue = 'boy' | 'girl' | 'surprise';

function pad(v: number) {
  return String(Math.max(0, v)).padStart(2, '0');
}

function fmt(d: string | Date) {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dt);
}

function getLeft(due: string | Date) {
  const d   = typeof due === 'string' ? new Date(due) : due;
  const ms  = Math.max(0, d.getTime() - Date.now());
  const tot = Math.floor(ms / 86400000);
  return {
    weeks:   Math.floor(tot / 7),
    days:    tot % 7,
    hours:   Math.floor((ms % 86400000) / 3600000),
    minutes: Math.floor((ms % 3600000)  / 60000),
    seconds: Math.floor((ms % 60000)    / 1000),
  };
}

function getPct(start: string | Date, due: string | Date) {
  const s = typeof start === 'string' ? new Date(start) : start;
  const d = typeof due   === 'string' ? new Date(due)   : due;
  const total   = d.getTime() - s.getTime();
  const elapsed = Date.now() - s.getTime();
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export default function HomeScreenEditorialV2() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const dueDate = useMemo(() => {
    if (profile?.dueDate) return profile.dueDate;
    const d = new Date(); d.setDate(d.getDate() + 23); return d.toISOString();
  }, [profile?.dueDate]);

  const startDate = useMemo(() => {
    if (profile?.startDate) return profile.startDate;
    const d = new Date(); d.setDate(d.getDate() - 260); return d.toISOString();
  }, [profile?.startDate]);

  const gender: GenderValue = (profile?.gender as GenderValue) || 'boy';
  const [time, setTime] = useState(() => getLeft(dueDate));

  useEffect(() => {
    const id = setInterval(() => setTime(getLeft(dueDate)), 1000);
    return () => clearInterval(id);
  }, [dueDate]);

  const pct = useMemo(() => getPct(startDate, dueDate), [startDate, dueDate]);

  const gBadge =
    gender === 'boy'  ? "IT'S A BOY" :
    gender === 'girl' ? "IT'S A GIRL" : "IT'S A SURPRISE";

  const onShare = useCallback(() => {
    Share.share({
      message: `Meeting you in ${time.weeks} weeks, ${time.days} days and ${time.hours} hours.`,
    });
  }, [time]);

  return (
    <View style={s.screen}>
      <LinearGradient
        colors={['#F3EDE3', '#EDE7DC', '#E8E2D6']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <View style={s.headerLeft}>
          <View style={s.hHeart}>
            <Ionicons name="heart" size={16} color={ACCENT} />
          </View>
          <Text style={s.brand}>
            <Text style={s.brandB}>Mommy</Text>
            <Text style={s.brandL}>Count</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={s.hGear}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-outline" size={20} color={TEXT_SOFT} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 104 }]}
      >
        {/* ══════════════════════════════════════
            HERO CARD
        ══════════════════════════════════════ */}
        <View style={s.heroCard}>
          {/* Base gradient */}
          <LinearGradient
            colors={['#E9DECE', '#E1D3C0', '#D9CAB5', '#D4C5AE']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Floral / botanical texture — layered organic shapes */}
          <View style={s.f1} /><View style={s.f2} /><View style={s.f3} />
          <View style={s.f4} /><View style={s.f5} /><View style={s.f6} />
          <View style={s.f7} /><View style={s.f8} /><View style={s.f9} />
          {/* Paper grain wash */}
          <View style={s.paperWash} />

          {/* top row */}
          <View style={s.heroTop}>
            <View style={s.badge}>
              <Ionicons name="heart" size={13} color={ACCENT} style={{ marginRight: 7 }} />
              <Text style={s.badgeTxt}>{gBadge}</Text>
            </View>
            <TouchableOpacity
              style={s.editBtn}
              onPress={() => router.push('/(tabs)/design')}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={16} color={TEXT_MED} />
            </TouchableOpacity>
          </View>

          {/* Headline */}
          <Text style={s.heroTitle}>Meeting you in...</Text>

          {/* Countdown */}
          <View style={s.countRow}>
            <View style={s.countCol}>
              <Text style={s.countNum}>{pad(time.weeks)}</Text>
              <Text style={s.countLbl}>WEEKS</Text>
            </View>
            <View style={s.countDivider} />
            <View style={s.countCol}>
              <Text style={s.countNum}>{pad(time.days)}</Text>
              <Text style={s.countLbl}>DAYS</Text>
            </View>
            <View style={s.countDivider} />
            <View style={s.countCol}>
              <Text style={s.countNum}>{pad(time.hours)}</Text>
              <Text style={s.countLbl}>HOURS</Text>
            </View>
          </View>

          {/* Timer pill */}
          <View style={s.timerPill}>
            <LinearGradient
              colors={['rgba(255,255,255,0.92)', 'rgba(250,245,237,0.82)']}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={s.timerVal}>{pad(time.minutes)}:{pad(time.seconds)}</Text>
            <View style={s.timerMeta}>
              <Text style={s.timerLbl}>MIN</Text>
              <Text style={s.timerLbl}>SEC</Text>
            </View>
          </View>

          {/* Share button — inside hero footer band */}
          <View style={s.heroFooter}>
            <TouchableOpacity style={s.shareBtn} onPress={onShare} activeOpacity={0.88}>
              <LinearGradient
                colors={[ACCENT_BTN, '#B48C5E', ACCENT_BTN]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Ionicons name="share-outline" size={18} color="#FFF8EF" style={{ marginRight: 10 }} />
              <Text style={s.shareTxt}>Share our countdown</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ══════════════════════════════════════
            VALUE LINE
        ══════════════════════════════════════ */}
        <View style={s.valueLine}>
          <Text style={s.valueT1}>Keep memories as beautiful as your journey.</Text>
          <Text style={s.valueT2}>Upgrade for more.</Text>
        </View>

        {/* ══════════════════════════════════════
            TIME REMAINING
        ══════════════════════════════════════ */}
        <View style={s.section}>
          <View style={s.secHead}>
            <Text style={s.secTitle}>Time remaining</Text>
            <View style={s.secLine} />
          </View>
          <Text style={s.secSub}>Tap for weeks</Text>

          <View style={s.progCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.80)', 'rgba(248,241,232,0.68)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={s.progTex} />
            <View style={s.progTopRow}>
              <Text style={s.progDate}>Start {fmt(startDate)}</Text>
              <Text style={s.progPct}>{pct}%</Text>
            </View>
            <View style={s.progTrack}>
              <LinearGradient
                colors={['#B89060', '#C9A478', '#D4B488']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.progFill, { width: `${pct}%` as any }]}
              />
            </View>
            <Text style={s.progDate}>Due {fmt(dueDate)}</Text>
          </View>
        </View>

        {/* ══════════════════════════════════════
            YOUR PREGNANCY  — 4 tiles as in mockup
        ══════════════════════════════════════ */}
        <View style={s.section}>
          <View style={s.secHead}>
            <Text style={s.secTitle}>Your pregnancy</Text>
            <View style={s.secLine} />
          </View>

          <View style={s.tileRow}>
            {[
              { key: 'boy'      as GenderValue, label: 'Boy',      icon: 'male-outline'   },
              { key: 'girl'     as GenderValue, label: 'Girl',     icon: 'female-outline' },
              { key: 'surprise' as GenderValue, label: 'Surprise', icon: 'gift-outline'   },
              { key: null,                       label: 'Profile',  icon: 'person-outline' },
            ].map((item, i) => {
              const sel = item.key !== null && gender === item.key;
              return (
                <TouchableOpacity
                  key={i}
                  style={[s.tile, sel && s.tileActive]}
                  onPress={() => {
                    if (item.key !== null) {
                      updateProfile?.({ gender: item.key });
                    } else {
                      router.push('/(tabs)/profile');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      sel
                        ? ['rgba(255,255,255,0.96)', 'rgba(252,248,241,0.90)']
                        : ['rgba(255,255,255,0.52)', 'rgba(250,244,236,0.38)']
                    }
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Ionicons
                    name={item.icon as any}
                    size={34}
                    color={sel ? ACCENT : TEXT_SOFT}
                  />
                  <Text style={[s.tileLbl, sel && s.tileLblActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ══════════════════════════════════════
            MAKE IT TRULY YOURS
        ══════════════════════════════════════ */}
        <View style={s.custCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.82)', 'rgba(248,241,231,0.74)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={s.custTex} />

          <Text style={s.custTitle}>Make it truly yours</Text>
          <Text style={s.custBody}>
            Personalize your countdown with fonts, colors, and photos
          </Text>

          <TouchableOpacity
            style={s.custBtn}
            onPress={() => router.push('/(tabs)/design')}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[ACCENT_BTN, '#B48C5E', ACCENT_BTN]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="pencil" size={16} color="#FFF8EF" style={{ marginRight: 10 }} />
            <Text style={s.custBtnTxt}>Customize design</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EDE8DE' },

  /* header */
  header: {
    paddingHorizontal: H_PAD,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  hHeart: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(240,233,221,0.95)',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  brand:  { fontSize: 22, letterSpacing: -0.4 },
  brandB: { color: '#2E2418', fontWeight: '700' },
  brandL: { color: '#9E9082', fontWeight: '300' },
  hGear: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(240,233,221,0.95)',
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingHorizontal: H_PAD, paddingTop: 4 },

  /* ── Hero ── */
  heroCard: {
    width: CARD_W,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: '#DDD0BC',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 0,
    marginBottom: 20,
    shadowColor: '#8B6E48',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 26,
    elevation: 8,
  },

  /* Botanical texture blobs */
  f1: {
    position: 'absolute', top: -30, right: -40,
    width: 220, height: 200, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  f2: {
    position: 'absolute', top: 50, right: 30,
    width: 130, height: 160, borderRadius: 999,
    backgroundColor: 'rgba(225,210,190,0.20)',
    transform: [{ rotate: '25deg' }],
  },
  f3: {
    position: 'absolute', top: 80, left: -30,
    width: 180, height: 110, borderRadius: 999,
    backgroundColor: 'rgba(245,235,218,0.18)',
    transform: [{ rotate: '-18deg' }],
  },
  f4: {
    position: 'absolute', top: 160, right: -20,
    width: 150, height: 190, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.09)',
    transform: [{ rotate: '12deg' }],
  },
  f5: {
    position: 'absolute', top: 200, left: 60,
    width: 110, height: 130, borderRadius: 999,
    backgroundColor: 'rgba(210,195,172,0.15)',
    transform: [{ rotate: '40deg' }],
  },
  f6: {
    position: 'absolute', bottom: 140, left: -10,
    width: 200, height: 90, borderRadius: 999,
    backgroundColor: 'rgba(240,228,210,0.16)',
    transform: [{ rotate: '-8deg' }],
  },
  f7: {
    position: 'absolute', bottom: 200, right: 40,
    width: 100, height: 120, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: [{ rotate: '55deg' }],
  },
  f8: {
    position: 'absolute', bottom: 80, right: -30,
    width: 170, height: 140, borderRadius: 999,
    backgroundColor: 'rgba(215,198,175,0.14)',
    transform: [{ rotate: '20deg' }],
  },
  f9: {
    position: 'absolute', top: -20, left: 80,
    width: 160, height: 80, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    transform: [{ rotate: '-30deg' }],
  },
  paperWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  badgeTxt: { fontSize: 13, fontWeight: '600', letterSpacing: 0.7, color: '#8B6E50' },
  editBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.58)',
    alignItems: 'center', justifyContent: 'center',
  },

  heroTitle: {
    textAlign: 'center',
    fontSize: 36,
    color: '#4A3B2C',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontWeight: '400',
    marginTop: 26,
    marginBottom: 20,
  },

  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  countCol: { flex: 1, alignItems: 'center' },
  countNum: {
    fontSize: 86,
    lineHeight: 90,
    fontWeight: '400',
    letterSpacing: -2,
    color: '#2E2418',
    fontFamily: 'Georgia',
    fontVariant: ['tabular-nums'],
  },
  countLbl: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
    color: '#9E8E78',
  },
  countDivider: {
    width: 1,
    height: 96,
    backgroundColor: 'rgba(100,78,55,0.18)',
    marginBottom: 18,
  },

  timerPill: {
    alignSelf: 'center',
    width: CARD_W - 96,
    height: 78,
    borderRadius: 39,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    marginBottom: 22,
  },
  timerVal: {
    fontSize: 38,
    fontWeight: '300',
    color: '#2E2418',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  timerMeta: { marginLeft: 12 },
  timerLbl: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: '#9E8E78',
    lineHeight: 17,
  },

  heroFooter: {
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(110,88,60,0.08)',
    backgroundColor: 'rgba(248,242,234,0.30)',
  },
  shareBtn: {
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareTxt: { fontSize: 18, fontWeight: '600', color: '#FFF8EF', letterSpacing: -0.1 },

  /* ── Value line ── */
  valueLine: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 24,
  },
  valueT1: {
    fontSize: 15, color: '#9E8E80', textAlign: 'center',
    fontWeight: '400', lineHeight: 22, marginBottom: 5,
  },
  valueT2: {
    fontSize: 15, color: '#B0A090', textAlign: 'center', fontWeight: '500',
  },

  /* ── Sections ── */
  section:  { marginBottom: 28 },
  secHead:  { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  secTitle: { fontSize: 20, fontWeight: '600', color: '#5A4A3C', letterSpacing: -0.2 },
  secLine:  { flex: 1, height: 1, backgroundColor: 'rgba(100,80,60,0.13)', marginLeft: 12 },
  secSub:   { fontSize: 13, color: '#B0A090', marginBottom: 12 },

  /* ── Progress card ── */
  progCard: {
    borderRadius: 22,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: 'rgba(255,255,255,0.48)',
    borderWidth: 1,
    borderColor: 'rgba(120,100,78,0.07)',
    shadowColor: '#8B6E4E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  progTex: {
    position: 'absolute', right: -18, bottom: -16,
    width: 150, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(220,204,182,0.18)',
  },
  progTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  progDate: { fontSize: 18, color: '#6A5A4A', fontWeight: '400' },
  progPct:  { fontSize: 22, color: '#7A6A56', fontWeight: '500' },
  progTrack: {
    height: 8, borderRadius: 4,
    backgroundColor: 'rgba(120,100,78,0.12)',
    overflow: 'hidden', marginBottom: 12,
  },
  progFill: { height: 8, borderRadius: 4 },

  /* ── Gender tiles — 4 as in mockup ── */
  tileRow: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1,
    height: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.36)',
    borderWidth: 1,
    borderColor: 'rgba(120,100,78,0.07)',
    shadowColor: '#8B6E4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tileActive: {
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderColor: 'rgba(184,144,96,0.24)',
  },
  tileLbl: { marginTop: 7, fontSize: 13, color: '#A09082', fontWeight: '500' },
  tileLblActive: { color: '#B89060', fontWeight: '700' },

  /* ── Customize card ── */
  custCard: {
    borderRadius: 26,
    overflow: 'hidden',
    padding: 22,
    backgroundColor: 'rgba(255,255,255,0.48)',
    borderWidth: 1,
    borderColor: 'rgba(120,100,78,0.07)',
    shadowColor: '#8B6E4E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 16,
  },
  custTex: {
    position: 'absolute', right: -20, top: -20,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(220,204,182,0.15)',
  },
  custTitle: {
    fontSize: 30,
    lineHeight: 36,
    color: '#3A2E22',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontWeight: '400',
    marginBottom: 10,
  },
  custBody: {
    fontSize: 15, lineHeight: 22,
    color: '#8A7A6A', marginBottom: 22,
  },
  custBtn: {
    height: 54, borderRadius: 27,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  custBtnTxt: { fontSize: 17, fontWeight: '600', color: '#FFF8EF', letterSpacing: -0.1 },
});
