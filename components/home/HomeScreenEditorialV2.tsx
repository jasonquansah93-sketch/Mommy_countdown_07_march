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

const { width: SW } = Dimensions.get('window');
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

      {/* Clean warm gradient — no dominant overlay blobs */}
      <LinearGradient
        colors={['#EDE6D8', '#E6DDD0', '#DACEC0', '#D4C7B2']}
        start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

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

        {/* ══════════════════════════════════
            1. HERO CARD
        ══════════════════════════════════ */}
        <View style={s.hero}>
          {/* Hero card warm gradient fill */}
          <LinearGradient
            colors={['rgba(235,225,210,0.94)', 'rgba(220,208,192,0.96)', 'rgba(210,196,178,0.92)']}
            start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Local botanical texture — stays inside hero card only */}
          <Blob style={{ top: -44, right: -52, width: 250, height: 220, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.15)', transform: [{ rotate: '12deg' }] }} />
          <Blob style={{ top:  52, right: -35, width: 188, height: 240, borderRadius: 999,  backgroundColor: 'rgba(224,212,194,0.20)', transform: [{ rotate: '26deg' }] }} />
          <Blob style={{ top: 118, left:  -44, width: 192, height: 112, borderRadius: 999,  backgroundColor: 'rgba(245,234,218,0.18)', transform: [{ rotate: '-18deg' }] }} />
          <Blob style={{ top: 250, right:  -8, width: 140, height: 180, borderRadius: 999,  backgroundColor: 'rgba(255,255,255,0.09)', transform: [{ rotate: '14deg' }] }} />
          <Blob style={{ bottom: 48, right: -24, width: 198, height: 142, borderRadius: 999, backgroundColor: 'rgba(226,214,198,0.14)', transform: [{ rotate: '22deg' }] }} />
          <Blob style={{ top:  48, right:  82, width: 40, height: 60, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.22)', transform: [{ rotate: '40deg'  }] }} />
          <Blob style={{ top: 106, left:   58, width: 34, height: 54, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', transform: [{ rotate: '-34deg' }] }} />

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

          {/* Countdown — weeks / days / hours */}
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

          {/* Timer pill — min:sec */}
          <View style={s.timerPill}>
            <LinearGradient
              colors={['rgba(255,255,255,0.88)', 'rgba(252,246,238,0.82)']}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={s.timerNum}>{pad(time.minutes)}:{pad(time.seconds)}</Text>
            <View style={s.timerMeta}>
              <Text style={s.timerLbl}>MIN</Text>
              <Text style={s.timerLbl}>SEC</Text>
            </View>
          </View>

          {/* Share CTA */}
          <TouchableOpacity style={s.shareBtn} onPress={onShare} activeOpacity={0.88}>
            <LinearGradient
              colors={['#BA9268', '#A87E52', '#BA9268']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="share-outline" size={17} color="#FFF8EF" style={{ marginRight: 9 }} />
            <Text style={s.shareTxt}>Share our countdown</Text>
          </TouchableOpacity>
        </View>

        {/* ══════════════════════════════════
            2. VALUE LINE
        ══════════════════════════════════ */}
        <View style={s.valueLine}>
          <Text style={s.valueT1}>
            "Every moment before hello{'\n'}is worth remembering."
          </Text>
          <Text style={s.valueT2}>Upgrade to capture it all.</Text>
        </View>

        {/* ══════════════════════════════════
            3. TIME REMAINING
        ══════════════════════════════════ */}
        <View style={s.sec}>
          <View style={s.secHead}>
            <Text style={s.secTitle}>Time remaining</Text>
            <View style={s.secLine} />
          </View>
          <Text style={s.secSub}>Your journey progress</Text>

          <View style={s.progCard}>
            {/* Warm paper card gradient */}
            <LinearGradient
              colors={['rgba(240,231,218,0.96)', 'rgba(232,220,204,0.94)', 'rgba(225,212,196,0.92)']}
              start={{ x: 0.05, y: 0 }} end={{ x: 0.95, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Subtle internal texture */}
            <Blob style={{ right: -18, bottom: -12, width: 168, height: 120, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', transform: [{ rotate: '18deg' }] }} />
            <Blob style={{ left:  -12, top:    -10, width: 124, height:  78, borderRadius: 999, backgroundColor: 'rgba(245,234,218,0.16)', transform: [{ rotate: '-12deg' }] }} />

            <View style={s.progTop}>
              <Text style={s.progDate}>Start  {fmt(startDate)}</Text>
              <Text style={s.progPct}>{pct}%</Text>
            </View>
            <View style={s.progTrack}>
              <LinearGradient
                colors={['#C4996C', '#B88A5E', '#C4A070']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.progFill, { width: `${pct}%` as any }]}
              />
            </View>
            <Text style={s.progDateBot}>Due  {fmt(dueDate)}</Text>
          </View>
        </View>

        {/* ══════════════════════════════════
            4. YOUR PREGNANCY — 4 tiles
        ══════════════════════════════════ */}
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
                        ? ['rgba(255,255,255,0.98)', 'rgba(252,248,242,0.94)']
                        : ['rgba(238,230,218,0.72)', 'rgba(230,220,206,0.64)']
                    }
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Ionicons
                    name={item.icon as any}
                    size={26}
                    color={sel ? '#A87E52' : '#A09080'}
                  />
                  <Text style={[s.tileLbl, sel && s.tileLblSel]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ══════════════════════════════════
            5. MAKE IT TRULY YOURS
        ══════════════════════════════════ */}
        <View style={s.custCard}>
          {/* Warm paper gradient with botanical depth */}
          <LinearGradient
            colors={['rgba(240,232,218,0.96)', 'rgba(230,220,204,0.94)', 'rgba(222,210,193,0.92)']}
            start={{ x: 0.05, y: 0 }} end={{ x: 0.95, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Floral depth blobs */}
          <Blob style={{ right: -28, top:    -22, width: 190, height: 174, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)', transform: [{ rotate: '13deg'  }] }} />
          <Blob style={{ left:  -18, bottom: -18, width: 228, height: 122, borderRadius: 999, backgroundColor: 'rgba(218,206,188,0.22)', transform: [{ rotate: '-10deg' }] }} />
          <Blob style={{ right:  36, bottom:  20, width:  72, height:  92, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.10)', transform: [{ rotate: '28deg'  }] }} />
          <Blob style={{ left:   82, top:    -16, width:  60, height:  80, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.13)', transform: [{ rotate: '-22deg' }] }} />

          <Text style={s.custTitle}>Make it{'\n'}truly yours</Text>
          <Text style={s.custBody}>
            Personalize your countdown with fonts,{'\n'}colors, and photos that tell your story.
          </Text>

          <TouchableOpacity
            style={s.custBtn}
            onPress={() => router.push('/(tabs)/design')}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#BA9268', '#A87E52', '#BA9268']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="pencil-outline" size={15} color="#FFF8EF" style={{ marginRight: 9 }} />
            <Text style={s.custBtnTxt}>Customize design</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

/* ──────────────────────────── Styles ──────────────────────────── */
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E8DFD2' },
  ab:     { position: 'absolute' },

  /* ── Header ── */
  header:     {
    paddingHorizontal: H_PAD, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  hHeart: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(248,242,232,0.90)',
    alignItems: 'center', justifyContent: 'center', marginRight: 9,
  },
  brand:  { fontSize: 21, letterSpacing: -0.3 },
  brandB: { color: '#2C211A', fontWeight: '700' },
  brandL: { color: '#A09282', fontWeight: '300' },
  hGear: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(248,242,232,0.90)',
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingHorizontal: H_PAD, paddingTop: 6 },

  /* ── Hero card ── */
  hero: {
    width: CW,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#D8CCBA',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    marginBottom: 18,
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  heroTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 13, paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  badgeTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: '#8B6E50' },
  editBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.58)',
    alignItems: 'center', justifyContent: 'center',
  },

  heroTitle: {
    textAlign: 'center',
    fontSize: 30,
    color: '#3A2A1C',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontWeight: '400',
    letterSpacing: 0.2,
    marginTop: 22,
    marginBottom: 18,
  },

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

  timerPill: {
    alignSelf: 'center',
    width: CW - 88,
    height: 68,
    borderRadius: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.52)',
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
  timerLbl:  {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: '#A08C76',
    lineHeight: 16,
  },

  shareBtn: {
    height: 50,
    borderRadius: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareTxt: { fontSize: 16, fontWeight: '600', color: '#FFF8EF', letterSpacing: 0.1 },

  /* ── Value line ── */
  valueLine: { alignItems: 'center', paddingVertical: 10, marginBottom: 22 },
  valueT1: {
    fontSize: 14,
    color: '#9E8E7E',
    textAlign: 'center',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    lineHeight: 21,
    marginBottom: 5,
  },
  valueT2: {
    fontSize: 12,
    color: '#B8A894',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.4,
  },

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

  /* ── Progress card ── */
  progCard: {
    borderRadius: 18,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#D8CCBA',
    borderWidth: 0.5,
    borderColor: 'rgba(120,95,70,0.10)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
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
    fontSize: 13,
    color: '#6A5A48',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  progDateBot: {
    fontSize: 13,
    color: '#6A5A48',
    fontWeight: '500',
    letterSpacing: 0.1,
    marginTop: 10,
    textAlign: 'right',
  },
  progPct: {
    fontSize: 19,
    color: '#6A5A46',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  progTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(120,95,70,0.16)',
    overflow: 'hidden',
  },
  progFill: { height: 5, borderRadius: 3 },

  /* ── Pregnancy tiles ── */
  tileRow: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    height: 90,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#CBBFAD',
    borderWidth: 0.5,
    borderColor: 'rgba(120,95,70,0.10)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
  },
  tileSel: {
    borderColor: 'rgba(168,126,82,0.28)',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  tileLbl:    { marginTop: 6, fontSize: 11, color: '#A09080', fontWeight: '500', letterSpacing: 0.3 },
  tileLblSel: { color: '#A07A52', fontWeight: '700' },

  /* ── Customize card ── */
  custCard: {
    borderRadius: 22,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    backgroundColor: '#D8CCBA',
    borderWidth: 0.5,
    borderColor: 'rgba(120,95,70,0.10)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.11,
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
  custBtn: {
    height: 48,
    borderRadius: 13,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  custBtnTxt: { fontSize: 15, fontWeight: '600', color: '#FFF8EF', letterSpacing: 0.1 },
});
