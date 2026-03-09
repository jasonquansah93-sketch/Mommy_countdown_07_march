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

      {/* ── Warme Basis-Gradient — fixierter Screen-Hintergrund ── */}
      <LinearGradient
        colors={['#EDE8DC', '#E5DDD0', '#D9CEBC', '#D0C3AC']}
        start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
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
            position: absolute → hinter allem anderen,
            left:0/right:0 innerhalb contentContainer = volle Bildschirmbreite
        ══════════════════════════════════════════════ */}
        <View style={s.botLayer} pointerEvents="none">
          {/* Oben-rechts: dominante Blüten-Cluster (wie im Mockup) */}
          <Blob style={{ top: -30, right: -10, width: 310, height: 295, borderRadius: 158, backgroundColor: 'rgba(255,252,244,0.34)', transform: [{ rotate: '14deg'  }] }} />
          <Blob style={{ top:  10, right:  22, width: 172, height: 234, borderRadius: 999,  backgroundColor: 'rgba(226,212,192,0.28)', transform: [{ rotate: '30deg'  }] }} />
          <Blob style={{ top:  55, right:  78, width:  64, height:  92, borderRadius: 999,  backgroundColor: 'rgba(255,250,240,0.24)', transform: [{ rotate: '-26deg' }] }} />
          <Blob style={{ top:  34, right: 116, width:  38, height:  56, borderRadius: 999,  backgroundColor: 'rgba(255,255,255,0.22)', transform: [{ rotate: '44deg'  }] }} />
          {/* Oben-links: weicher Akzent */}
          <Blob style={{ top:  85, left:  -16, width: 155, height:  95, borderRadius: 999,  backgroundColor: 'rgba(238,226,208,0.20)', transform: [{ rotate: '-14deg' }] }} />
          {/* Mitte — blassen Akzente, die beim Scrollen sichtbar werden */}
          <Blob style={{ top: 430, right: -18, width: 185, height: 145, borderRadius: 999,  backgroundColor: 'rgba(226,214,196,0.14)', transform: [{ rotate: '10deg'  }] }} />
          <Blob style={{ top: 550, left:  -20, width: 205, height: 106, borderRadius: 999,  backgroundColor: 'rgba(236,224,206,0.12)', transform: [{ rotate: '-8deg'  }] }} />
          {/* Unten — sehr subtil */}
          <Blob style={{ top: 900, right: -14, width: 168, height: 130, borderRadius: 999,  backgroundColor: 'rgba(226,214,196,0.10)', transform: [{ rotate: '14deg'  }] }} />
        </View>

        {/* ════════════════════════════════════════
            1. HERO AREA
            KEIN Card-Container — Elemente schweben
            direkt auf der botanischen Fläche
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
              colors={['rgba(255,255,255,0.96)', 'rgba(252,248,244,0.94)']}
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
            HAIRLINE — echte dünne Trennlinie,
            subtil, kein Card-Rand
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

          {/* Progress Card — nah-weiß, frosted */}
          <View style={s.progCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.94)', 'rgba(255,253,250,0.92)', 'rgba(252,248,242,0.90)']}
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
                        : ['rgba(255,255,255,0.64)', 'rgba(255,252,246,0.56)']
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
            colors={['rgba(255,255,255,0.94)', 'rgba(255,253,250,0.92)', 'rgba(252,248,242,0.90)']}
            start={{ x: 0.05, y: 0 }} end={{ x: 0.95, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Subtile botanische Tiefe innerhalb der Card */}
          <Blob style={{ right: -20, top:  -16, width: 168, height: 152, borderRadius: 999, backgroundColor: 'rgba(230,218,202,0.22)', transform: [{ rotate: '12deg'  }] }} />
          <Blob style={{ left:  -12, bottom: -10, width: 200, height: 100, borderRadius: 999, backgroundColor: 'rgba(224,212,196,0.20)', transform: [{ rotate: '-9deg' }] }} />

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

  scroll: { paddingHorizontal: H_PAD, paddingTop: 8 },

  /* ── Botanische Textur-Schicht (scrollt mit Content) ──
     left:0 / right:0 innerhalb des contentContainers = volle Bildschirmbreite */
  botLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2500,
  },

  /* ════════════════════════════════════
     HERO — KEIN sichtbarer Container
     Kein backgroundColor, kein border,
     kein borderRadius, kein shadow
  ════════════════════════════════════ */
  heroArea: {
    paddingTop: 4,
    paddingBottom: 30,
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
    marginBottom: 16,
  },

  /* Countdown-Zahlen */
  countRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 18,
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
    width: 1, height: 78,
    backgroundColor: 'rgba(100,78,55,0.22)',
    marginBottom: 14,
  },

  /* Timer Pill — weiß, klar sichtbar auf botanischem Hintergrund */
  timerPill: {
    alignSelf: 'center',
    width: CW - 60,
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

  /* Hairline — echte dünne Trennlinie, kein Card-Rand */
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120,90,60,0.24)',
    marginBottom: 22,
  },

  /* ── Sections ── */
  sec:      { marginBottom: 22 },
  secHead:  { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  secTitle: { fontSize: 17, fontWeight: '600', color: '#4A3A2C', letterSpacing: -0.1 },
  secLine:  { flex: 1, height: 1, backgroundColor: 'rgba(100,80,60,0.14)', marginLeft: 10 },
  secSub:   { fontSize: 12, color: '#B0A090', marginBottom: 10, letterSpacing: 0.2 },

  /* ── Progress Card — nah-weiß, frosted ── */
  progCard: {
    borderRadius: 18, overflow: 'hidden',
    paddingHorizontal: 18, paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 0.5, borderColor: 'rgba(180,155,125,0.15)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  progTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'baseline', marginBottom: 10,
  },
  progDate:    { fontSize: 15, color: '#5A4A38', fontWeight: '500', letterSpacing: 0.1 },
  progPct:     { fontSize: 22, color: '#5A4A38', fontWeight: '600' },
  progTrack:   { height: 6, borderRadius: 3, backgroundColor: 'rgba(120,95,70,0.16)', overflow: 'hidden' },
  progFill:    { height: 6, borderRadius: 3 },
  progDateBot: { fontSize: 15, color: '#5A4A38', fontWeight: '500', letterSpacing: 0.1, marginTop: 10 },

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

  /* ── Customize Card — nah-weiß, frosted ── */
  custCard: {
    borderRadius: 22, overflow: 'hidden',
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 22,
    backgroundColor: 'rgba(255,255,255,0.82)',
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
  /* CTA — volle Breite, Pill-Form */
  custBtn: {
    height: 52, borderRadius: 26, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    alignSelf: 'stretch',
  },
  custBtnTxt: { fontSize: 15, fontWeight: '600', color: '#FFF8EF', letterSpacing: 0.1 },
});
