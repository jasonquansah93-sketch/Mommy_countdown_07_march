import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Share, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProfile } from '../../context/ProfileContext';

const { width: SW, height: SH } = Dimensions.get('window');
const H_PAD = 20;
const CW = SW - H_PAD * 2;

type GenderValue = 'boy' | 'girl' | 'surprise';

function pad(v: number) { return String(Math.max(0, v)).padStart(2, '0'); }

function fmt(d: string | Date) {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(dt);
}

function getLeft(due: string | Date) {
  const d  = typeof due === 'string' ? new Date(due) : due;
  const ms = Math.max(0, d.getTime() - Date.now());
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

function Blob({ style }: { style: object }) {
  return <View style={[s.ab, style as any]} pointerEvents="none" />;
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

      {/* ── Warm cream gradient base ── */}
      <LinearGradient
        colors={['#EDE8DC', '#E5DDD0', '#D9CEBC', '#D0C3AC']}
        start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Botanical background texture (visible through frosted cards) ── */}
      {/* Upper-right cluster — dominant in mockup */}
      <Blob style={{ top: -50, right: -65, width: 330, height: 290, borderRadius: 165, backgroundColor: 'rgba(255,252,245,0.30)', transform: [{ rotate: '12deg' }] }} />
      <Blob style={{ top:  18, right:  20, width: 190, height: 250, borderRadius: 999,  backgroundColor: 'rgba(232,218,198,0.24)', transform: [{ rotate: '29deg' }] }} />
      <Blob style={{ top:  75, right:  86, width:  64, height:  92, borderRadius: 999,  backgroundColor: 'rgba(255,250,240,0.22)', transform: [{ rotate: '-26deg' }] }} />
      <Blob style={{ top:  42, right: 120, width:  38, height:  56, borderRadius: 999,  backgroundColor: 'rgba(255,255,255,0.20)', transform: [{ rotate: '44deg'  }] }} />
      {/* Lower accents */}
      <Blob style={{ top: SH * 0.52, right: -32, width: 210, height: 168, borderRadius: 999, backgroundColor: 'rgba(228,216,198,0.15)', transform: [{ rotate: '10deg'  }] }} />
      <Blob style={{ top: SH * 0.67, left:  -32, width: 250, height: 126, borderRadius: 999, backgroundColor: 'rgba(240,228,210,0.14)', transform: [{ rotate: '-9deg'  }] }} />
      <Blob style={{ top: SH * 0.83, right: -42, width: 210, height: 168, borderRadius: 999, backgroundColor: 'rgba(255,248,234,0.12)', transform: [{ rotate: '22deg'  }] }} />

      {/* ══ HEADER ══ */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <View style={s.headerLeft}>
          <View style={s.hHeart}>
            <Ionicons name="heart" size={14} color="#B8906A" />
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
          <Ionicons name="settings-outline" size={18} color="#9E9082" />
        </TouchableOpacity>
      </View>

      {/* ══ SCROLL ══ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 108 }]}
      >

        {/* ══════════════════════════════════════
            1. HERO CARD
            Frosted glass over botanical bg
        ══════════════════════════════════════ */}
        <View style={s.hero}>
          {/* Frosted warm-white overlay */}
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.55)',
              'rgba(255,252,246,0.48)',
              'rgba(252,246,238,0.45)',
            ]}
            start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Botanical hints inside hero (simulate bg showing through) */}
          <Blob style={{ top: -36, right: -44, width: 230, height: 208, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.20)', transform: [{ rotate: '10deg' }] }} />
          <Blob style={{ top:  44, right: -26, width: 162, height: 218, borderRadius: 999, backgroundColor: 'rgba(234,220,200,0.18)', transform: [{ rotate: '26deg' }] }} />
          <Blob style={{ top: 178, left:  -34, width: 164, height:  94, borderRadius: 999, backgroundColor: 'rgba(248,240,224,0.16)', transform: [{ rotate: '-14deg' }] }} />
          <Blob style={{ bottom: 38, right: -18, width: 174, height: 128, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.11)', transform: [{ rotate: '19deg' }] }} />

          {/* Badge + Edit row */}
          <View style={s.heroTop}>
            <View style={s.badge}>
              <Ionicons name="heart" size={11} color="#B8906A" style={{ marginRight: 6 }} />
              <Text style={s.badgeTxt}>{gBadge}</Text>
            </View>
            <TouchableOpacity
              style={s.editBtn}
              onPress={() => router.push('/(tabs)/design')}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={14} color="#6B5C4D" />
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
            <View style={s.countDiv} />
            <View style={s.countCol}>
              <Text style={s.countNum}>{pad(time.days)}</Text>
              <Text style={s.countLbl}>DAYS</Text>
            </View>
            <View style={s.countDiv} />
            <View style={s.countCol}>
              <Text style={s.countNum}>{pad(time.hours)}</Text>
              <Text style={s.countLbl}>HOURS</Text>
            </View>
          </View>

          {/* Timer pill */}
          <View style={s.timerPill}>
            <LinearGradient
              colors={['rgba(255,255,255,0.94)', 'rgba(252,248,242,0.90)']}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={s.timerNum}>{pad(time.minutes)}:{pad(time.seconds)}</Text>
            <View style={s.timerMeta}>
              <Text style={s.timerLbl}>MIN</Text>
              <Text style={s.timerLbl}>SEC</Text>
            </View>
          </View>

          {/* Share CTA — full pill */}
          <TouchableOpacity style={s.shareBtn} onPress={onShare} activeOpacity={0.88}>
            <LinearGradient
              colors={['#C09A72', '#A87E52', '#C09A72']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="share-outline" size={17} color="rgba(255,248,238,0.95)" style={{ marginRight: 9 }} />
            <Text style={s.shareTxt}>Share our countdown</Text>
          </TouchableOpacity>
        </View>

        {/* ══════════════════════════════════════
            2. TIME REMAINING
        ══════════════════════════════════════ */}
        <View style={s.sec}>
          <View style={s.secHead}>
            <Text style={s.secTitle}>Time remaining</Text>
            <View style={s.secLine} />
          </View>
          <Text style={s.secSub}>Tap for weeks</Text>

          {/* Progress card — near-white / frosted */}
          <View style={s.progCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.92)', 'rgba(255,253,250,0.90)', 'rgba(252,248,242,0.88)']}
              start={{ x: 0.05, y: 0 }} end={{ x: 0.95, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={s.progTop}>
              <Text style={s.progDate}>Start  {fmt(startDate)}</Text>
              <Text style={s.progPct}>{pct}%</Text>
            </View>
            <View style={s.progTrack}>
              <LinearGradient
                colors={['#B8895A', '#C49A6E', '#B8895A']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.progFill, { width: `${pct}%` as any }]}
              />
            </View>
            <Text style={s.progDateBot}>Due  {fmt(dueDate)}</Text>
          </View>
        </View>

        {/* ══════════════════════════════════════
            3. YOUR PREGNANCY — 4 tiles
        ══════════════════════════════════════ */}
        <View style={s.sec}>
          <View style={s.secHead}>
            <Text style={s.secTitle}>Your pregnancy</Text>
            <View style={s.secLine} />
          </View>

          <View style={s.tileRow}>
            {([
              { key: 'boy'      as GenderValue, label: 'Boy',      icon: 'male-outline'   },
              { key: 'girl'     as GenderValue, label: 'Girl',     icon: 'female-outline' },
              { key: 'surprise' as GenderValue, label: 'Surprise', icon: 'gift-outline'   },
              { key: null,                       label: 'Profile',  icon: 'person-outline' },
            ] as const).map((item, i) => {
              const sel = item.key !== null && gender === item.key;
              return (
                <TouchableOpacity
                  key={i}
                  style={[s.tile, sel && s.tileSel]}
                  onPress={() => {
                    if (item.key !== null) updateProfile?.({ gender: item.key });
                    else router.push('/(tabs)/profile');
                  }}
                  activeOpacity={0.78}
                >
                  <LinearGradient
                    colors={
                      sel
                        ? ['rgba(255,255,255,0.98)', 'rgba(255,254,252,0.96)']
                        : ['rgba(255,255,255,0.60)', 'rgba(255,252,246,0.52)']
                    }
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Ionicons
                    name={item.icon as any}
                    size={28}
                    color={sel ? '#A07A50' : '#B0A090'}
                  />
                  <Text style={[s.tileLbl, sel && s.tileLblSel]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ══════════════════════════════════════
            4. MAKE IT TRULY YOURS
        ══════════════════════════════════════ */}
        <View style={s.custCard}>
          {/* Near-white frosted surface */}
          <LinearGradient
            colors={['rgba(255,255,255,0.92)', 'rgba(255,253,250,0.90)', 'rgba(252,248,242,0.88)']}
            start={{ x: 0.05, y: 0 }} end={{ x: 0.95, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Subtle botanical depth */}
          <Blob style={{ right: -26, top:  -20, width: 180, height: 164, borderRadius: 999, backgroundColor: 'rgba(232,220,204,0.24)', transform: [{ rotate: '12deg'  }] }} />
          <Blob style={{ left:  -16, bottom: -14, width: 218, height: 110, borderRadius: 999, backgroundColor: 'rgba(226,214,196,0.22)', transform: [{ rotate: '-9deg' }] }} />

          <Text style={s.custTitle}>Make it truly yours</Text>
          <Text style={s.custBody}>
            Personalize your countdown with fonts,{'\n'}colors, and photos
          </Text>

          {/* CTA — full pill */}
          <TouchableOpacity
            style={s.custBtn}
            onPress={() => router.push('/(tabs)/design')}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#C09A72', '#A87E52', '#C09A72']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="pencil-outline" size={15} color="rgba(255,248,238,0.95)" style={{ marginRight: 9 }} />
            <Text style={s.custBtnTxt}>Customize design</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

/* ──────────────────────────────── Styles ──────────────────────────────── */
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E8DFD2' },
  ab:     { position: 'absolute' },

  /* ── Header ── */
  header: {
    paddingHorizontal: H_PAD, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  hHeart: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(248,242,232,0.92)',
    alignItems: 'center', justifyContent: 'center', marginRight: 9,
  },
  brand:  { fontSize: 21, letterSpacing: -0.3 },
  brandB: { color: '#2C211A', fontWeight: '700' },
  brandL: { color: '#A09282', fontWeight: '300' },
  hGear: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(248,242,232,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingHorizontal: H_PAD, paddingTop: 6 },

  /* ── Hero card ── */
  hero: {
    width: CW,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(248,244,236,0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.48)',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    marginBottom: 20,
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 20,
    elevation: 6,
  },
  heroTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  badgeTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: '#8B6E50' },
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.64)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* ── Hero headline — 38 px matches mockup proportion ── */
  heroTitle: {
    textAlign: 'center',
    fontSize: 38,
    color: '#3A2A1C',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontWeight: '400',
    letterSpacing: 0.2,
    marginTop: 20,
    marginBottom: 16,
  },

  /* ── Countdown ── */
  countRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 18,
  },
  countCol: { flex: 1, alignItems: 'center' },
  countNum: {
    fontSize: 72,
    lineHeight: 76,
    fontWeight: '300',
    letterSpacing: -2,
    color: '#2C211A',
    fontFamily: 'Georgia',
    fontVariant: ['tabular-nums'],
  },
  countLbl: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.2,
    color: '#A08C76',
  },
  countDiv: {
    width: 1,
    height: 78,
    backgroundColor: 'rgba(100,78,55,0.18)',
    marginBottom: 14,
  },

  /* ── Timer pill ── */
  timerPill: {
    alignSelf: 'center',
    width: CW - 88,
    height: 68,
    borderRadius: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.55)',
    marginBottom: 18,
  },
  timerNum: {
    fontSize: 34,
    fontWeight: '300',
    color: '#2C211A',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  timerMeta: { marginLeft: 10 },
  timerLbl: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: '#A08C76',
    lineHeight: 16,
  },

  /* ── Share button — full pill ── */
  shareBtn: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareTxt: { fontSize: 16, fontWeight: '600', color: '#FFF8EF', letterSpacing: 0.1 },

  /* ── Section layout ── */
  sec:      { marginBottom: 22 },
  secHead:  { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  secTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3A2C',
    letterSpacing: -0.1,
  },
  secLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(100,80,60,0.14)',
    marginLeft: 10,
  },
  secSub: { fontSize: 12, color: '#B0A090', marginBottom: 10, letterSpacing: 0.2 },

  /* ── Progress card — near-white frosted ── */
  progCard: {
    borderRadius: 18,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 0.5,
    borderColor: 'rgba(180,155,125,0.15)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  progTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  progDate: {
    fontSize: 15,
    color: '#5A4A38',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  /* "94%" — larger, bold, left-aligned with value */
  progPct: {
    fontSize: 22,
    color: '#5A4A38',
    fontWeight: '600',
  },
  progTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(120,95,70,0.16)',
    overflow: 'hidden',
  },
  progFill: { height: 6, borderRadius: 3 },
  /* "Due" date — left-aligned, same style as start */
  progDateBot: {
    fontSize: 15,
    color: '#5A4A38',
    fontWeight: '500',
    letterSpacing: 0.1,
    marginTop: 10,
  },

  /* ── Pregnancy tiles ── */
  tileRow: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1,
    height: 88,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 0.5,
    borderColor: 'rgba(180,155,125,0.18)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
  },
  tileSel: {
    borderColor: 'rgba(168,126,82,0.30)',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  tileLbl:    { marginTop: 6, fontSize: 11, color: '#A09080', fontWeight: '500', letterSpacing: 0.3 },
  tileLblSel: { color: '#A07A52', fontWeight: '700' },

  /* ── Customize card — near-white frosted ── */
  custCard: {
    borderRadius: 22,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 0.5,
    borderColor: 'rgba(180,155,125,0.15)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 16,
  },
  custTitle: {
    fontSize: 28,
    lineHeight: 34,
    color: '#2C211A',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontWeight: '400',
    marginBottom: 10,
  },
  custBody: {
    fontSize: 14,
    lineHeight: 21,
    color: '#7A6A58',
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  /* CTA — full pill matching share button */
  custBtn: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  custBtnTxt: { fontSize: 15, fontWeight: '600', color: '#FFF8EF', letterSpacing: 0.1 },
});
