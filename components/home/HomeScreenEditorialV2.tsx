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

/* ─── tiny helper so we don't repeat pointerEvents="none" inline ─── */
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

      {/* ══════════════════════════════════════════════════════
          GLOBAL PAPER BACKGROUND — warm gradient + botanical
          Static behind ScrollView so it forms the paper world
      ══════════════════════════════════════════════════════ */}
      <LinearGradient
        colors={['#EDE5D6', '#E5DDD0', '#DACFBE', '#D2C4AF']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top-right botanical cluster */}
      <Blob style={{ top: -55, right: -75, width: 310, height: 268, borderRadius: 155, backgroundColor: 'rgba(255,252,244,0.22)', transform: [{ rotate: '14deg' }] }} />
      <Blob style={{ top: 15,  right:  18, width: 175, height: 225, borderRadius: 999,  backgroundColor: 'rgba(226,213,194,0.26)', transform: [{ rotate: '29deg' }] }} />
      <Blob style={{ top: 65,  right:  80, width:  82, height: 115, borderRadius: 999,  backgroundColor: 'rgba(255,250,240,0.22)', transform: [{ rotate: '-26deg' }] }} />
      {/* Top-left cluster */}
      <Blob style={{ top: 105, left: -42, width: 205, height: 135, borderRadius: 999, backgroundColor: 'rgba(242,230,214,0.22)', transform: [{ rotate: '-14deg' }] }} />
      <Blob style={{ top: 185, left:   8, width: 104, height: 155, borderRadius: 999, backgroundColor: 'rgba(255,248,234,0.18)', transform: [{ rotate: '23deg'  }] }} />
      {/* Mid right */}
      <Blob style={{ top: SH * 0.30, right: -32, width: 185, height: 245, borderRadius: 999, backgroundColor: 'rgba(220,208,190,0.20)', transform: [{ rotate: '9deg'  }] }} />
      {/* Mid left */}
      <Blob style={{ top: SH * 0.36, left:  -35, width: 225, height: 122, borderRadius: 999, backgroundColor: 'rgba(238,226,208,0.18)', transform: [{ rotate: '-11deg' }] }} />
      {/* Lower */}
      <Blob style={{ top: SH * 0.56, right:   8, width: 155, height: 204, borderRadius: 999, backgroundColor: 'rgba(210,196,175,0.18)', transform: [{ rotate: '36deg' }] }} />
      <Blob style={{ top: SH * 0.66, left:  -28, width: 255, height: 115, borderRadius: 999, backgroundColor: 'rgba(232,220,202,0.16)', transform: [{ rotate: '-11deg' }] }} />
      <Blob style={{ top: SH * 0.79, right: -52, width: 225, height: 185, borderRadius: 999, backgroundColor: 'rgba(255,248,236,0.14)', transform: [{ rotate: '21deg' }] }} />
      {/* Small petal accents */}
      <Blob style={{ top:  72, right: 118, width: 40, height: 60, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.24)', transform: [{ rotate: '44deg'  }] }} />
      <Blob style={{ top: 148, left:  92,  width: 46, height: 68, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.20)', transform: [{ rotate: '-40deg' }] }} />
      <Blob style={{ top: SH * 0.41, right: 58, width: 54, height: 78, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', transform: [{ rotate: '58deg'  }] }} />
      <Blob style={{ top: SH * 0.59, left:  48, width: 44, height: 65, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', transform: [{ rotate: '-50deg' }] }} />

      {/* ══ HEADER ══ */}
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <View style={s.headerLeft}>
          <View style={s.hHeart}>
            <Ionicons name="heart" size={15} color="#B8906A" />
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
          <Ionicons name="settings-outline" size={19} color="#9E9082" />
        </TouchableOpacity>
      </View>

      {/* ══ SCROLLVIEW — transparent so global texture shows through ══ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 104 }]}
      >

        {/* ════════════════════════════════════════
            1. HERO CARD
        ════════════════════════════════════════ */}
        <View style={s.hero}>
          {/* Hero gradient overlay */}
          <LinearGradient
            colors={['rgba(232,222,208,0.90)', 'rgba(218,206,188,0.93)', 'rgba(206,192,172,0.90)']}
            start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Botanical blobs inside hero */}
          <Blob style={{ top: -48, right: -58, width: 265, height: 235, borderRadius: 133, backgroundColor: 'rgba(255,255,255,0.18)', transform: [{ rotate: '12deg' }] }} />
          <Blob style={{ top:  58, right: -38, width: 195, height: 248, borderRadius: 999,  backgroundColor: 'rgba(224,210,190,0.22)', transform: [{ rotate: '27deg' }] }} />
          <Blob style={{ top: 125, left:  -48, width: 198, height: 118, borderRadius: 999,  backgroundColor: 'rgba(245,234,216,0.20)', transform: [{ rotate: '-19deg' }] }} />
          <Blob style={{ top: 245, right:  -12, width: 148, height: 188, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.10)', transform: [{ rotate: '15deg' }] }} />
          <Blob style={{ top: 365, left:    18, width: 168, height:  88, borderRadius: 999, backgroundColor: 'rgba(215,198,175,0.18)', transform: [{ rotate: '-9deg'  }] }} />
          <Blob style={{ bottom: 55, right: -28, width: 208, height: 150, borderRadius: 999, backgroundColor: 'rgba(228,216,198,0.16)', transform: [{ rotate: '22deg' }] }} />
          <Blob style={{ top:  52, right:  88, width: 44, height: 65, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.24)', transform: [{ rotate: '40deg'  }] }} />
          <Blob style={{ top: 112, left:   62, width: 38, height: 58, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.20)', transform: [{ rotate: '-34deg' }] }} />
          <Blob style={{ top: 288, left:   88, width: 54, height: 74, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', transform: [{ rotate: '48deg'  }] }} />

          {/* Badge + Edit row */}
          <View style={s.heroTop}>
            <View style={s.badge}>
              <Ionicons name="heart" size={13} color="#B8906A" style={{ marginRight: 7 }} />
              <Text style={s.badgeTxt}>{gBadge}</Text>
            </View>
            <TouchableOpacity
              style={s.editBtn}
              onPress={() => router.push('/(tabs)/design')}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={15} color="#6B5C4D" />
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
              colors={['rgba(255,255,255,0.92)', 'rgba(252,246,238,0.86)']}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={s.timerNum}>{pad(time.minutes)}:{pad(time.seconds)}</Text>
            <View style={s.timerMeta}>
              <Text style={s.timerLbl}>MIN</Text>
              <Text style={s.timerLbl}>SEC</Text>
            </View>
          </View>

          {/* Share button */}
          <TouchableOpacity style={s.shareBtn} onPress={onShare} activeOpacity={0.88}>
            <LinearGradient
              colors={['#C09870', '#AE8456', '#BE9770']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="share-outline" size={18} color="#FFF8EF" style={{ marginRight: 10 }} />
            <Text style={s.shareTxt}>Share our countdown</Text>
          </TouchableOpacity>
        </View>

        {/* ════════════════════════════════════════
            2. VALUE LINE
        ════════════════════════════════════════ */}
        <View style={s.valueLine}>
          <Text style={s.valueT1}>Keep memories as beautiful as your journey.</Text>
          <Text style={s.valueT2}>Upgrade for more.</Text>
        </View>

        {/* ════════════════════════════════════════
            3. TIME REMAINING
        ════════════════════════════════════════ */}
        <View style={s.sec}>
          <View style={s.secHead}>
            <Text style={s.secTitle}>Time remaining</Text>
            <View style={s.secLine} />
          </View>
          <Text style={s.secSub}>Tap for weeks</Text>

          {/* Progress card — warm paper, same world as hero */}
          <View style={s.progCard}>
            <LinearGradient
              colors={['rgba(236,228,215,0.90)', 'rgba(228,218,202,0.86)', 'rgba(222,210,195,0.84)']}
              start={{ x: 0.05, y: 0 }} end={{ x: 0.95, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Blob style={{ right: -20, bottom: -14, width: 178, height: 128, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', transform: [{ rotate: '18deg' }] }} />
            <Blob style={{ left:  -14, top:    -12, width: 132, height:  84, borderRadius: 999, backgroundColor: 'rgba(242,232,215,0.18)', transform: [{ rotate: '-12deg' }] }} />
            <Blob style={{ right:  62, top:     -6, width:  62, height:  42, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', transform: [{ rotate: '15deg'  }] }} />

            <View style={s.progTop}>
              <Text style={s.progDate}>Start {fmt(startDate)}</Text>
              <Text style={s.progPct}>{pct}%</Text>
            </View>
            <View style={s.progTrack}>
              <LinearGradient
                colors={['#B8906A', '#C9A478', '#D4B488']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.progFill, { width: `${pct}%` as any }]}
              />
            </View>
            <Text style={s.progDateBot}>Due {fmt(dueDate)}</Text>
          </View>
        </View>

        {/* ════════════════════════════════════════
            4. YOUR PREGNANCY — 4 tiles
        ════════════════════════════════════════ */}
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
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      sel
                        ? ['rgba(255,255,255,0.96)', 'rgba(252,248,242,0.92)']
                        : ['rgba(236,228,215,0.68)', 'rgba(228,218,204,0.58)']
                    }
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Ionicons
                    name={item.icon as any}
                    size={32}
                    color={sel ? '#B8906A' : '#9E9082'}
                  />
                  <Text style={[s.tileLbl, sel && s.tileLblSel]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ════════════════════════════════════════
            5. MAKE IT TRULY YOURS
        ════════════════════════════════════════ */}
        <View style={s.custCard}>
          <LinearGradient
            colors={['rgba(236,228,215,0.90)', 'rgba(228,218,202,0.86)', 'rgba(222,210,195,0.84)']}
            start={{ x: 0.05, y: 0 }} end={{ x: 0.95, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Blob style={{ right: -30, top:    -24, width: 198, height: 182, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', transform: [{ rotate: '14deg' }] }} />
          <Blob style={{ left:  -20, bottom: -20, width: 238, height: 128, borderRadius: 999, backgroundColor: 'rgba(222,210,192,0.20)', transform: [{ rotate: '-10deg' }] }} />
          <Blob style={{ right:  44, bottom:  22, width:  80, height:  98, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', transform: [{ rotate: '28deg' }] }} />

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
              colors={['#C09870', '#AE8456', '#BE9770']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
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

/* ─────────────────────────── Styles ─────────────────────────── */
const s = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: '#E5DDD0' },
  ab:         { position: 'absolute' },

  /* Header */
  header:     { paddingHorizontal: H_PAD, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  hHeart:     { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(245,238,226,0.92)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  brand:      { fontSize: 22, letterSpacing: -0.4 },
  brandB:     { color: '#2C211A', fontWeight: '700' },
  brandL:     { color: '#9E9082', fontWeight: '300' },
  hGear:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(245,238,226,0.92)', alignItems: 'center', justifyContent: 'center' },

  scroll:     { paddingHorizontal: H_PAD, paddingTop: 4 },

  /* ── Hero ── */
  hero: {
    width: CW, borderRadius: 32, overflow: 'hidden',
    backgroundColor: '#D6CAB6',
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 22,
    marginBottom: 22,
    shadowColor: '#8B6E48', shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16, shadowRadius: 28, elevation: 7,
  },
  heroTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.76)' },
  badgeTxt: { fontSize: 13, fontWeight: '600', letterSpacing: 0.6, color: '#8B6E50' },
  editBtn:  { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.62)', alignItems: 'center', justifyContent: 'center' },

  heroTitle: {
    textAlign: 'center', fontSize: 36, color: '#3E2E20',
    fontFamily: 'Georgia', fontStyle: 'italic', fontWeight: '400',
    marginTop: 24, marginBottom: 20,
  },

  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  countCol: { flex: 1, alignItems: 'center' },
  countNum: {
    fontSize: 80, lineHeight: 84, fontWeight: '400', letterSpacing: -1.5,
    color: '#2C211A', fontFamily: 'Georgia', fontVariant: ['tabular-nums'],
  },
  countLbl: { marginTop: 6, fontSize: 11, fontWeight: '700', letterSpacing: 2.0, color: '#9E8E78' },
  countDiv: { width: 1, height: 90, backgroundColor: 'rgba(100,78,55,0.20)', marginBottom: 18 },

  timerPill: {
    alignSelf: 'center', width: CW - 100, height: 76, borderRadius: 38,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.58)', marginBottom: 20,
  },
  timerNum:  { fontSize: 38, fontWeight: '300', color: '#2C211A', letterSpacing: 1, fontVariant: ['tabular-nums'] },
  timerMeta: { marginLeft: 12 },
  timerLbl:  { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: '#9E8E78', lineHeight: 17 },

  shareBtn:  { height: 52, borderRadius: 26, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  shareTxt:  { fontSize: 18, fontWeight: '600', color: '#FFF8EF', letterSpacing: -0.1 },

  /* ── Value line ── */
  valueLine: { alignItems: 'center', paddingVertical: 8, marginBottom: 24 },
  valueT1:   { fontSize: 15, color: '#9E8E80', textAlign: 'center', fontWeight: '400', lineHeight: 22, marginBottom: 4 },
  valueT2:   { fontSize: 15, color: '#B0A090', textAlign: 'center', fontWeight: '500' },

  /* ── Sections ── */
  sec:      { marginBottom: 26 },
  secHead:  { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  secTitle: { fontSize: 20, fontWeight: '700', color: '#4A3A2C', letterSpacing: -0.2 },
  secLine:  { flex: 1, height: 1, backgroundColor: 'rgba(100,80,60,0.16)', marginLeft: 12 },
  secSub:   { fontSize: 13, color: '#B0A090', marginBottom: 12 },

  /* ── Progress card ── */
  progCard: {
    borderRadius: 20, overflow: 'hidden',
    paddingHorizontal: 18, paddingVertical: 16,
    backgroundColor: '#D3C7B3',
    borderWidth: 0.5, borderColor: 'rgba(120,95,70,0.12)',
    shadowColor: '#8B6E4E', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 14, elevation: 3,
  },
  progTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  progDate:    { fontSize: 17, color: '#5A4A38', fontWeight: '400' },
  progDateBot: { fontSize: 17, color: '#5A4A38', fontWeight: '400', marginTop: 12 },
  progPct:     { fontSize: 22, color: '#6A5A46', fontWeight: '600' },
  progTrack:   { height: 7, borderRadius: 4, backgroundColor: 'rgba(120,95,70,0.18)', overflow: 'hidden' },
  progFill:    { height: 7, borderRadius: 4 },

  /* ── Pregnancy tiles ── */
  tileRow: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1, height: 96, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#CABEAD',
    borderWidth: 0.5, borderColor: 'rgba(120,95,70,0.10)',
  },
  tileSel:    { borderColor: 'rgba(180,140,90,0.26)', shadowColor: '#8B6E4E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.09, shadowRadius: 8, elevation: 3 },
  tileLbl:    { marginTop: 7, fontSize: 13, color: '#A09082', fontWeight: '500' },
  tileLblSel: { color: '#A07A56', fontWeight: '700' },

  /* ── Customize card ── */
  custCard: {
    borderRadius: 24, overflow: 'hidden',
    paddingHorizontal: 20, paddingTop: 22, paddingBottom: 20,
    backgroundColor: '#D3C7B3',
    borderWidth: 0.5, borderColor: 'rgba(120,95,70,0.12)',
    shadowColor: '#8B6E4E', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10, shadowRadius: 18, elevation: 4,
    marginBottom: 16,
  },
  custTitle: {
    fontSize: 30, lineHeight: 36, color: '#2C211A',
    fontFamily: 'Georgia', fontStyle: 'italic', fontWeight: '400', marginBottom: 10,
  },
  custBody:   { fontSize: 15, lineHeight: 22, color: '#7A6A58', marginBottom: 20 },
  custBtn:    { height: 52, borderRadius: 26, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  custBtnTxt: { fontSize: 17, fontWeight: '600', color: '#FFF8EF', letterSpacing: -0.1 },
});
