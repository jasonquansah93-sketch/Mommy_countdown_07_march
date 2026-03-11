import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Share, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProfile } from '../../context/ProfileContext';
import { usePremium } from '../../context/PremiumContext';

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
    ms,
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

/* ── Cycling units for Time Remaining ── */
const UNITS = [
  { key: 'days',    label: 'days',    hint: 'weeks'   },
  { key: 'weeks',   label: 'weeks',   hint: 'hours'   },
  { key: 'hours',   label: 'hours',   hint: 'minutes' },
  { key: 'minutes', label: 'minutes', hint: 'seconds' },
  { key: 'seconds', label: 'seconds', hint: 'days'    },
] as const;
type UnitKey = typeof UNITS[number]['key'];

function getUnitValue(key: UnitKey, t: ReturnType<typeof getLeft>): number {
  const totalMs = t.ms;
  switch (key) {
    case 'days':         return Math.floor(totalMs / 86400000);
    case 'weeks':        return Math.floor(totalMs / 604800000);
    case 'hours':        return Math.floor(totalMs / 3600000);
    case 'minutes':      return Math.floor(totalMs / 60000);
    case 'seconds':      return Math.floor(totalMs / 1000);
    default:             return 0;
  }
}

export default function HomeScreenEditorialV2() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const { isPremium } = usePremium();

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
  const [unitIdx, setUnitIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTime(getLeft(dueDate)), 1000);
    return () => clearInterval(id);
  }, [dueDate]);

  const pct = useMemo(() => getPct(startDate, dueDate), [startDate, dueDate]);

  const gBadge =
    gender === 'boy'  ? "IT'S A BOY" :
    gender === 'girl' ? "IT'S A GIRL" : "IT'S A SURPRISE";

  const currentUnit = UNITS[unitIdx];
  const remainingValue = getUnitValue(currentUnit.key, time);
  const cycleUnit = () => setUnitIdx(i => (i + 1) % UNITS.length);

  const onShare = useCallback(() => {
    Share.share({
      message: `Meeting you in ${time.weeks} weeks, ${time.days} days and ${time.hours} hours.`,
    });
  }, [time]);

  return (
    <View style={s.screen}>

      {/* ── Botanische Textur — echtes Foto, fixierter Hintergrund ── */}
      <Image
        source={require('../../assets/images/floral-bg.png')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
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

      {/* ══ SCROLLVIEW ══ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 108 }]}
      >

        {/* ════════════════════════════════════════
            1. HERO AREA — kein Card-Container
        ════════════════════════════════════════ */}
        <View style={s.heroArea}>

          {/* Badge + Edit-Button Row */}
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

          {/* ── WEEKS / DAYS / HOURS ── */}
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

          {/* ── MIN : SEC — kein Kasten, frei auf dem Hintergrund ── */}
          <View style={s.minSecRow}>
            <View style={s.minSecCol}>
              <Text style={s.minSecNum}>{pad(time.minutes)}</Text>
              <Text style={s.minSecLbl}>MIN</Text>
            </View>
            <Text style={s.minSecColon}>:</Text>
            <View style={s.minSecCol}>
              <Text style={s.minSecNum}>{pad(time.seconds)}</Text>
              <Text style={s.minSecLbl}>SEC</Text>
            </View>
          </View>

          {/* Share CTA — volle Breite, Pill-Form */}
          <TouchableOpacity style={s.shareBtn} onPress={onShare} activeOpacity={0.88}>
            <LinearGradient
              colors={['#C09A72', '#A87E52', '#C09A72']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="share-outline" size={17} color="rgba(255,248,238,0.95)" style={{ marginRight: 9 }} />
            <Text style={s.shareTxt}>Share our countdown</Text>
          </TouchableOpacity>

          {/* ── Premium share teaser (free only) ── */}
          {!isPremium && (
            <TouchableOpacity
              onPress={() => router.push('/modal/paywall')}
              activeOpacity={0.7}
              style={s.shareTeaser}
            >
              <Text style={s.shareTeaserTxt}>✦  Share a beautiful card with Plus</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ════════════════════════════════════════
            HAIRLINE
        ════════════════════════════════════════ */}
        <View style={s.hairline} />

        {/* ════════════════════════════════════════
            2. TIME REMAINING — Cycling Big Number
        ════════════════════════════════════════ */}
        <TouchableOpacity
          style={s.sec}
          onPress={cycleUnit}
          activeOpacity={0.85}
        >
          {/* Header row */}
          <View style={s.remHead}>
            <Text style={s.remTitle}>TIME REMAINING</Text>
            <Text style={s.remHint}>tap · {currentUnit.hint}</Text>
          </View>

          {/* Big cycling number */}
          <Text style={s.remNum}>
            {remainingValue.toLocaleString()}
          </Text>
          <Text style={s.remUnit}>{currentUnit.label}</Text>
        </TouchableOpacity>

        {/* ════════════════════════════════════════
            JOURNEY PROGRESS CARD
        ════════════════════════════════════════ */}
        <View style={[s.progCard, { marginBottom: 22 }]}>
          <LinearGradient
            colors={['rgba(253,247,239,0.95)', 'rgba(249,242,232,0.93)', 'rgba(244,236,224,0.91)']}
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

          {/* ── Memory nudge — subtil, kein Premium-Lock ── */}
          <View style={s.progMemoryRow}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/journey')}
              activeOpacity={0.7}
              style={s.progMemoryBtn}
            >
              <Ionicons name="camera-outline" size={13} color="rgba(90,74,56,0.55)" />
              <Text style={s.progMemoryTxt}>Capture a memory</Text>
              <Ionicons name="chevron-forward" size={12} color="rgba(90,74,56,0.40)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ════════════════════════════════════════
            3. IT'S A… — 3 Tiles (kein Profile)
        ════════════════════════════════════════ */}
        <View style={s.sec}>
          <View style={s.secHead}>
            <Text style={s.secTitle}>It's a…</Text>
            <View style={s.secLine} />
          </View>

          <View style={s.tileRow}>
            {([
              { key: 'boy'      as GenderValue, label: 'Boy',      icon: 'male-outline'   },
              { key: 'girl'     as GenderValue, label: 'Girl',     icon: 'female-outline' },
              { key: 'surprise' as GenderValue, label: 'Surprise', icon: 'gift-outline'   },
            ] as const).map((item, i) => {
              const sel = gender === item.key;
              return (
                <TouchableOpacity
                  key={i}
                  style={[s.tile, sel && s.tileSel]}
                  onPress={() => updateProfile?.({ gender: item.key })}
                  activeOpacity={0.78}
                >
                  <LinearGradient
                    colors={
                      sel
                        ? ['rgba(255,255,255,0.98)', 'rgba(255,254,252,0.96)']
                        : ['rgba(255,255,255,0.60)', 'rgba(255,251,244,0.52)']
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

        {/* ════════════════════════════════════════
            4. MAKE IT TRULY YOURS
        ════════════════════════════════════════ */}
        <View style={s.custCard}>
          <LinearGradient
            colors={['rgba(253,247,239,0.95)', 'rgba(249,242,232,0.93)', 'rgba(244,236,224,0.91)']}
            start={{ x: 0.05, y: 0 }} end={{ x: 0.95, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View pointerEvents="none" style={{
            position: 'absolute', right: -20, top: -16,
            width: 172, height: 156,
            borderTopLeftRadius: 86, borderTopRightRadius: 18,
            borderBottomLeftRadius: 18, borderBottomRightRadius: 86,
            backgroundColor: 'rgba(224,210,190,0.40)',
            transform: [{ rotate: '14deg' }],
          }} />
          <View pointerEvents="none" style={{
            position: 'absolute', left: -12, bottom: -10,
            width: 200, height: 102,
            borderTopLeftRadius: 62, borderTopRightRadius: 16,
            borderBottomLeftRadius: 16, borderBottomRightRadius: 62,
            backgroundColor: 'rgba(218,204,182,0.36)',
            transform: [{ rotate: '-10deg' }],
          }} />

          <Text style={s.custTitle}>Make it truly yours</Text>
          <Text style={s.custBody}>
            Personalise your countdown with fonts,{'\n'}colors, and your own photos.
          </Text>

          {/* ── 3 Feature-Pills — subtil, elegant ── */}
          <View style={s.featurePills}>
            {([
              { label: 'Premium Themes', icon: 'color-palette-outline' },
              { label: 'Memory Vault',   icon: 'images-outline'        },
              { label: 'Video Export',   icon: 'film-outline'          },
            ] as const).map((f, i) => (
              <View key={i} style={s.featurePill}>
                <Ionicons name={f.icon} size={11} color="#9A8472" style={{ marginRight: 4 }} />
                <Text style={s.featurePillTxt}>{f.label}</Text>
              </View>
            ))}
          </View>

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

          {/* ── Sekundärer Premium-Link (free only) ── */}
          {!isPremium && (
            <TouchableOpacity
              onPress={() => router.push('/modal/paywall')}
              activeOpacity={0.7}
              style={s.custUpgradeRow}
            >
              <Text style={s.custUpgradeTxt}>Unlock everything with Plus  →</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

/* ──────────────────────────────────── Styles ──────────────────────────────────── */
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E8D8C4' },

  /* ── Header ── */
  header: {
    paddingHorizontal: H_PAD, paddingBottom: 12,
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

  scroll: { paddingHorizontal: H_PAD, paddingTop: 10 },

  /* ── Hero ── */
  heroArea:   { paddingTop: 6, paddingBottom: 28 },
  heroTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.84)',
  },
  badgeTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: '#8B6E50' },

  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center', justifyContent: 'center',
  },

  heroTitle: {
    textAlign: 'center', fontSize: 38, color: '#3A2A1C',
    fontFamily: 'Georgia', fontStyle: 'italic', fontWeight: '400',
    letterSpacing: 0.2, marginTop: 20, marginBottom: 18,
  },

  /* Countdown WEEKS / DAYS / HOURS */
  countRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 16,
  },
  countCol:  { flex: 1, alignItems: 'center' },
  countNum: {
    fontSize: 72, lineHeight: 76, fontWeight: '300',
    letterSpacing: -2, color: '#2C211A', fontFamily: 'Georgia',
    fontVariant: ['tabular-nums'],
  },
  countLbl: {
    marginTop: 5, fontSize: 10, fontWeight: '700',
    letterSpacing: 2.2, color: '#A08C76',
  },
  countDiv: {
    width: 1, height: 72,
    backgroundColor: 'rgba(100,78,55,0.18)', marginBottom: 18,
  },

  /* ── MIN : SEC — kein Kasten, frei auf dem Hintergrund ── */
  minSecRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'center', marginBottom: 20,
  },
  minSecCol: { alignItems: 'center', minWidth: 64 },
  minSecNum: {
    fontSize: 44, lineHeight: 48, fontWeight: '300',
    letterSpacing: -1, color: '#2C211A', fontFamily: 'Georgia',
    fontVariant: ['tabular-nums'],
  },
  minSecLbl: {
    marginTop: 3, fontSize: 10, fontWeight: '700',
    letterSpacing: 2.2, color: '#A08C76',
  },
  minSecColon: {
    fontSize: 44, lineHeight: 48, fontWeight: '300',
    color: 'rgba(100,78,55,0.35)', marginHorizontal: 6,
    fontFamily: 'Georgia',
  },

  /* Share Button */
  shareBtn: {
    height: 52, borderRadius: 26, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    alignSelf: 'stretch',
  },
  shareTxt: { fontSize: 16, fontWeight: '600', color: '#FFF8EF', letterSpacing: 0.1 },

  /* Hairline */
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120,90,60,0.22)',
    marginTop: 2, marginBottom: 24,
  },

  /* ── Sections ── */
  sec:      { marginBottom: 22 },
  secHead:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  secTitle: { fontSize: 17, fontWeight: '600', color: '#4A3A2C', letterSpacing: -0.1 },
  secLine:  { flex: 1, height: 1, backgroundColor: 'rgba(100,80,60,0.14)', marginLeft: 10 },

  /* ── TIME REMAINING — cycling number, editorial & light ── */
  remHead: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  remTitle: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2.0,
    color: '#A08C76', textTransform: 'uppercase',
  },
  remHint: {
    fontSize: 11, color: '#B8A490', letterSpacing: 0.4,
  },
  remNum: {
    fontSize: 64, lineHeight: 68, fontWeight: '300',
    color: '#2C211A', letterSpacing: -1.5,
    fontFamily: 'Georgia', fontVariant: ['tabular-nums'],
  },
  remUnit: {
    fontSize: 16, fontWeight: '300', color: '#9A8472',
    letterSpacing: 1.2, marginTop: 4, marginBottom: 6,
    fontFamily: 'Georgia', fontStyle: 'italic',
  },

  /* ── Journey Progress Card ── */
  progCard: {
    borderRadius: 18, overflow: 'hidden',
    paddingHorizontal: 18, paddingVertical: 16,
    backgroundColor: 'rgba(250,244,236,0.90)',
    borderWidth: 0.5, borderColor: 'rgba(180,155,125,0.15)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  progTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'baseline', marginBottom: 10,
  },
  progDate:    { fontSize: 14, color: '#5A4A38', fontWeight: '500', letterSpacing: 0.1 },
  progPct:     { fontSize: 24, color: '#5A4A38', fontWeight: '600' },
  progTrack:   { height: 6, borderRadius: 3, backgroundColor: 'rgba(120,95,70,0.16)', overflow: 'hidden' },
  progFill:    { height: 6, borderRadius: 3 },
  progDateBot: { fontSize: 14, color: '#5A4A38', fontWeight: '500', letterSpacing: 0.1, marginTop: 10 },

  /* ── It's a… — 3 Tiles ── */
  tileRow: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1, height: 92, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 0.5, borderColor: 'rgba(180,155,125,0.18)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 7, elevation: 2,
  },
  tileSel:    { borderColor: 'rgba(168,126,82,0.35)', shadowOpacity: 0.13, shadowRadius: 10, elevation: 4 },
  tileLbl:    { marginTop: 6, fontSize: 12, color: '#A09080', fontWeight: '500', letterSpacing: 0.3 },
  tileLblSel: { color: '#A07A52', fontWeight: '700' },

  /* ── Customize Card ── */
  custCard: {
    borderRadius: 22, overflow: 'hidden',
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 22,
    backgroundColor: 'rgba(250,244,236,0.90)',
    borderWidth: 0.5, borderColor: 'rgba(180,155,125,0.15)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09, shadowRadius: 16, elevation: 4,
    marginBottom: 16,
  },
  custTitle: {
    fontSize: 28, lineHeight: 34, color: '#2C211A',
    fontFamily: 'Georgia', fontStyle: 'italic', fontWeight: '400',
    marginBottom: 10,
  },
  custBody: {
    fontSize: 14, lineHeight: 21, color: '#7A6A58',
    marginBottom: 20, letterSpacing: 0.1,
  },
  custBtn: {
    height: 52, borderRadius: 26, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    alignSelf: 'stretch',
  },
  custBtnTxt: { fontSize: 15, fontWeight: '600', color: '#FFF8EF', letterSpacing: 0.1 },

  /* ── Share teaser ── */
  shareTeaser: { alignItems: 'center', marginTop: 11 },
  shareTeaserTxt: {
    fontSize: 11, color: 'rgba(160,140,118,0.78)',
    fontFamily: 'Georgia', fontStyle: 'italic', letterSpacing: 0.2,
  },

  /* ── Journey Progress — memory nudge ── */
  progMemoryRow: {
    marginTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(120,90,60,0.15)',
    paddingTop: 10,
  },
  progMemoryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  progMemoryTxt: {
    flex: 1, fontSize: 13, color: 'rgba(90,74,56,0.60)',
    fontFamily: 'Georgia', fontStyle: 'italic',
  },

  /* ── Customize — feature pills ── */
  featurePills: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20,
  },
  featurePill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(192,154,114,0.11)',
    borderWidth: 0.5, borderColor: 'rgba(168,126,82,0.22)',
  },
  featurePillTxt: {
    fontSize: 11, color: '#9A8472', fontWeight: '500', letterSpacing: 0.1,
  },

  /* ── Customize — upgrade link ── */
  custUpgradeRow: { alignItems: 'center', marginTop: 13 },
  custUpgradeTxt: {
    fontSize: 12, color: '#B0997E',
    fontFamily: 'Georgia', fontStyle: 'italic', letterSpacing: 0.1,
  },
});
