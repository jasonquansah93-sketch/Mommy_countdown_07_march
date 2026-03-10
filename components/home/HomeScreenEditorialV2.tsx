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

/* ─────────────────────────────────────────
   Organic leaf/petal shape helper.
   Instead of borderRadius:999 (perfect oval),
   each shape uses asymmetric per-corner radii
   to mimic natural botanical silhouettes.
───────────────────────────────────────── */
type LeafStyle = {
  top?: number; bottom?: number;
  left?: number; right?: number;
  width: number; height: number;
  tl: number; tr: number; bl: number; br: number;
  color: string;
  rotate: string;
  opacity?: number;
};

function Leaf({ s: ls }: { s: LeafStyle }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top:    ls.top,
        bottom: ls.bottom,
        left:   ls.left,
        right:  ls.right,
        width:  ls.width,
        height: ls.height,
        borderTopLeftRadius:     ls.tl,
        borderTopRightRadius:    ls.tr,
        borderBottomLeftRadius:  ls.bl,
        borderBottomRightRadius: ls.br,
        backgroundColor: ls.color,
        opacity: ls.opacity ?? 1,
        transform: [{ rotate: ls.rotate }],
      }}
    />
  );
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

      {/* ── Warme Basis-Gradient — fixierter Screen-Hintergrund ── */}
      <LinearGradient
        colors={['#EDE6D8', '#E4D9C8', '#D8CDB8', '#CFC0A6']}
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

      {/* ══ SCROLLVIEW ══ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 108 }]}
      >

        {/* ══════════════════════════════════════════════
            BOTANISCHE TEXTUR — scrollt mit dem Content
            Organische Blatt-/Blütenformen mit
            asymmetrischen Eckenradien (kein borderRadius:999)
        ══════════════════════════════════════════════ */}
        <View style={s.botLayer} pointerEvents="none">

          {/* ── Großes Hauptblatt oben-rechts (dominanter Anker) ── */}
          <Leaf s={{ top: -50, right: -30, width: 240, height: 340,
            tl: 120, tr: 24,  bl: 24,  br: 120,
            color: 'rgba(255,252,242,0.52)', rotate: '18deg' }} />
          <Leaf s={{ top:   8, right:   8, width: 160, height: 230,
            tl:  80, tr: 16,  bl: 16,  br:  80,
            color: 'rgba(220,204,178,0.44)', rotate: '32deg' }} />
          {/* ── Kleines Akzentblatt oben-rechts ── */}
          <Leaf s={{ top:  48, right:  76, width: 62, height: 94,
            tl:  38, tr:  8,  bl:  8,  br:  38,
            color: 'rgba(248,238,222,0.40)', rotate: '-22deg' }} />
          <Leaf s={{ top:  30, right: 118, width: 38, height: 60,
            tl:  24, tr:  6,  bl:  6,  br:  24,
            color: 'rgba(255,255,255,0.36)', rotate: '48deg' }} />

          {/* ── Breites Blatt oben-links ── */}
          <Leaf s={{ top:  72, left: -24, width: 148, height: 84,
            tl:  50, tr: 18,  bl: 18,  br:  50,
            color: 'rgba(234,218,196,0.34)', rotate: '-16deg' }} />
          {/* ── Schmales Stielblatt oben-links ── */}
          <Leaf s={{ top: 130, left:  12, width:  34, height: 64,
            tl:  20, tr:  6,  bl:  6,  br:  20,
            color: 'rgba(248,238,220,0.28)', rotate: '-38deg' }} />

          {/* ── Mitte-rechts (hinter Time remaining) ── */}
          <Leaf s={{ top: 410, right: -28, width: 186, height: 128,
            tl:  72, tr: 22,  bl: 22,  br:  72,
            color: 'rgba(224,208,184,0.30)', rotate: '10deg' }} />
          <Leaf s={{ top: 470, right:  54, width:  48, height: 76,
            tl:  30, tr:  8,  bl:  8,  br:  30,
            color: 'rgba(248,238,222,0.26)', rotate: '-30deg' }} />

          {/* ── Mitte-links (hinter Pregnancy-Sektion) ── */}
          <Leaf s={{ top: 548, left: -28, width: 210, height: 104,
            tl:  62, tr: 18,  bl: 18,  br:  62,
            color: 'rgba(230,214,192,0.28)', rotate: '-10deg' }} />
          <Leaf s={{ top: 634, left:  38, width:  46, height: 68,
            tl:  28, tr:  8,  bl:  8,  br:  28,
            color: 'rgba(252,244,230,0.24)', rotate: '26deg' }} />

          {/* ── Unten-rechts (hinter Customize Card) ── */}
          <Leaf s={{ top: 842, right: -22, width: 178, height: 136,
            tl:  68, tr: 20,  bl: 20,  br:  68,
            color: 'rgba(220,204,182,0.26)', rotate: '20deg' }} />
          <Leaf s={{ top: 968, left: -18, width: 162, height: 100,
            tl:  56, tr: 16,  bl: 16,  br:  56,
            color: 'rgba(234,218,196,0.22)', rotate: '-13deg' }} />
          {/* ── Extra-Akzentblatt unten-rechts ── */}
          <Leaf s={{ top: 1080, right: 30, width: 42, height: 66,
            tl:  26, tr:  7,  bl:  7,  br:  26,
            color: 'rgba(248,236,218,0.20)', rotate: '38deg' }} />
        </View>

        {/* ════════════════════════════════════════
            1. HERO AREA
            KEIN Card-Container — Elemente schweben
            direkt auf der botanischen Fläche.
            Sehr subtiler Warmton-Hauch (kein Rahmen,
            kein borderRadius, kein sichtbares Rechteck)
        ════════════════════════════════════════ */}
        <View style={s.heroArea}>
          {/* Sanfter Wärmeton-Hauch hinter den Hero-Elementen —
              kein Card, nur eine weiche Aufhellung der Fläche */}
          <LinearGradient
            colors={[
              'rgba(255,252,246,0.28)',
              'rgba(253,248,240,0.18)',
              'rgba(255,251,244,0.10)',
              'rgba(255,255,255,0.00)',
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

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

          {/* Countdown — Weeks / Days / Hours */}
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

          {/* Timer Pill — Min:Sec */}
          <View style={s.timerPill}>
            <LinearGradient
              colors={['rgba(255,255,255,0.97)', 'rgba(253,249,244,0.95)']}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={s.timerNum}>{pad(time.minutes)}:{pad(time.seconds)}</Text>
            <View style={s.timerMeta}>
              <Text style={s.timerLbl}>MIN</Text>
              <Text style={s.timerLbl}>SEC</Text>
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
        </View>

        {/* ════════════════════════════════════════
            HAIRLINE — echte dünne Trennlinie
        ════════════════════════════════════════ */}
        <View style={s.hairline} />

        {/* ════════════════════════════════════════
            2. TIME REMAINING
        ════════════════════════════════════════ */}
        <View style={s.sec}>
          <View style={s.secHead}>
            <Text style={s.secTitle}>Time remaining</Text>
            <View style={s.secLine} />
          </View>
          <Text style={s.secSub}>Tap for weeks</Text>

          {/* Progress Card */}
          <View style={s.progCard}>
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
          </View>
        </View>

        {/* ════════════════════════════════════════
            3. YOUR PREGNANCY — 4 Tiles
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
          {/* Organische Blätter innerhalb der Card */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute', right: -20, top: -16,
              width: 172, height: 156,
              borderTopLeftRadius: 86, borderTopRightRadius: 18,
              borderBottomLeftRadius: 18, borderBottomRightRadius: 86,
              backgroundColor: 'rgba(224,210,190,0.40)',
              transform: [{ rotate: '14deg' }],
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute', left: -12, bottom: -10,
              width: 200, height: 102,
              borderTopLeftRadius: 62, borderTopRightRadius: 16,
              borderBottomLeftRadius: 16, borderBottomRightRadius: 62,
              backgroundColor: 'rgba(218,204,182,0.36)',
              transform: [{ rotate: '-10deg' }],
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute', right: 42, bottom: 20,
              width: 58, height: 82,
              borderTopLeftRadius: 36, borderTopRightRadius: 8,
              borderBottomLeftRadius: 8, borderBottomRightRadius: 36,
              backgroundColor: 'rgba(232,218,198,0.30)',
              transform: [{ rotate: '34deg' }],
            }}
          />

          <Text style={s.custTitle}>Make it truly yours</Text>
          <Text style={s.custBody}>
            Personalize your countdown with fonts,{'\n'}colors, and photos
          </Text>

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

/* ──────────────────────────────────── Styles ──────────────────────────────────── */
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E5DBCA' },

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

  /* ── Botanische Textur-Schicht (scrollt mit Content) ── */
  botLayer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 2500,
  },

  /* ════════════════════════════════════
     HERO — KEIN sichtbarer Container.
     Nur ein ganz zarter Warm-Hauch als
     Hintergrund (LinearGradient, kein Rand).
  ════════════════════════════════════ */
  heroArea: {
    paddingTop: 6,
    paddingBottom: 28,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* Badge — weiße Pill */
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.84)',
  },
  badgeTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: '#8B6E50' },

  /* Edit-Button — weißer Kreis */
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Headline */
  heroTitle: {
    textAlign: 'center',
    fontSize: 38,
    color: '#3A2A1C',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontWeight: '400',
    letterSpacing: 0.2,
    marginTop: 20,
    marginBottom: 18,
  },

  /* Countdown-Zahlen */
  countRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 20,
  },
  countCol: { flex: 1, alignItems: 'center' },
  countNum: {
    fontSize: 72, lineHeight: 76,
    fontWeight: '300', letterSpacing: -2,
    color: '#2C211A', fontFamily: 'Georgia',
    fontVariant: ['tabular-nums'],
  },
  countLbl: {
    marginTop: 5, fontSize: 10,
    fontWeight: '700', letterSpacing: 2.2,
    color: '#A08C76',
  },
  countDiv: {
    width: 1, height: 72,
    backgroundColor: 'rgba(100,78,55,0.18)',
    marginBottom: 18,
  },

  /* Timer Pill */
  timerPill: {
    alignSelf: 'center',
    width: CW - 40,
    height: 68,
    borderRadius: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.90)',
    marginBottom: 18,
  },
  timerNum: {
    fontSize: 34, fontWeight: '300',
    color: '#2C211A', letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  timerMeta: { marginLeft: 10 },
  timerLbl: {
    fontSize: 10, fontWeight: '700',
    letterSpacing: 1.6, color: '#A08C76', lineHeight: 16,
  },

  /* Share Button — volle Breite, Pill-Form */
  shareBtn: {
    height: 52, borderRadius: 26,
    overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    alignSelf: 'stretch',
  },
  shareTxt: { fontSize: 16, fontWeight: '600', color: '#FFF8EF', letterSpacing: 0.1 },

  /* Hairline */
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120,90,60,0.22)',
    marginTop: 2,
    marginBottom: 24,
  },

  /* ── Sections ── */
  sec:      { marginBottom: 22 },
  secHead:  { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  secTitle: { fontSize: 17, fontWeight: '600', color: '#4A3A2C', letterSpacing: -0.1 },
  secLine:  { flex: 1, height: 1, backgroundColor: 'rgba(100,80,60,0.14)', marginLeft: 10 },
  secSub:   { fontSize: 12, color: '#B0A090', marginBottom: 10, letterSpacing: 0.2 },

  /* ── Progress Card ── */
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

  /* ── Pregnancy Tiles ── */
  tileRow: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1, height: 88, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 0.5, borderColor: 'rgba(180,155,125,0.18)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 7, elevation: 2,
  },
  tileSel:    { borderColor: 'rgba(168,126,82,0.30)', shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  tileLbl:    { marginTop: 6, fontSize: 11, color: '#A09080', fontWeight: '500', letterSpacing: 0.3 },
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
});
