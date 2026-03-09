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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BG = '#F6F2EC';
const PAPER = '#F8F4EE';
const PAPER_SOFT = '#F4EEE6';
const CARD = '#F1E9DF';
const CARD_DARK = '#E8DDD0';
const WHITE_GLASS = 'rgba(255,255,255,0.74)';
const TEXT = '#2E2723';
const TEXT_SOFT = '#8F8376';
const TEXT_MUTED = '#A59788';
const ACCENT = '#C7AA87';
const ACCENT_DARK = '#B6946F';
const BORDER = 'rgba(126, 105, 82, 0.08)';
const SHADOW = 'rgba(98, 76, 53, 0.12)';

type GenderValue = 'boy' | 'girl' | 'surprise';

function pad(value: number) {
  return String(Math.max(0, value)).padStart(2, '0');
}

function formatLongDate(dateLike: string | Date) {
  const date = typeof dateLike === 'string' ? new Date(dateLike) : dateLike;
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

function getRemainingParts(dueDateLike: string | Date) {
  const dueDate = typeof dueDateLike === 'string' ? new Date(dueDateLike) : dueDateLike;
  const diff = Math.max(0, dueDate.getTime() - Date.now());

  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const seconds = Math.floor(diff / 1000) % 60;

  return {
    diff,
    totalDays,
    weeks,
    days,
    hours,
    minutes,
    seconds,
  };
}

function getProgress(startDateLike: string | Date, dueDateLike: string | Date) {
  const start = typeof startDateLike === 'string' ? new Date(startDateLike) : startDateLike;
  const due = typeof dueDateLike === 'string' ? new Date(dueDateLike) : dueDateLike;

  const total = due.getTime() - start.getTime();
  const elapsed = Date.now() - start.getTime();

  if (total <= 0) return 0;
  const raw = (elapsed / total) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

export default function HomeScreenEditorialV2() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const dueDate = useMemo(() => {
    if (profile?.dueDate) return profile.dueDate;
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 20);
    return fallback.toISOString();
  }, [profile?.dueDate]);

  const startDate = useMemo(() => {
    if (profile?.startDate) return profile.startDate;
    const fallback = new Date();
    fallback.setDate(fallback.getDate() - 260);
    return fallback.toISOString();
  }, [profile?.startDate]);

  const gender = (profile?.gender as GenderValue) || 'boy';

  const [time, setTime] = useState(() => getRemainingParts(dueDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getRemainingParts(dueDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);

  const progress = useMemo(() => getProgress(startDate, dueDate), [startDate, dueDate]);

  const genderLabel =
    gender === 'boy' ? "IT'S A BOY" : gender === 'girl' ? "IT'S A GIRL" : "IT'S A SURPRISE";

  const handleShare = useCallback(() => {
    Share.share({
      message: `Meeting you in ${time.weeks} weeks, ${time.days} days and ${time.hours} hours.`,
    });
  }, [time.weeks, time.days, time.hours]);

  const setGender = useCallback(
    (value: GenderValue) => {
      updateProfile?.({ gender: value });
    },
    [updateProfile]
  );

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#FBF8F3', '#F5F0E9', '#F4EFE8']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.brandWrap}>
          <View style={styles.brandIcon}>
            <Ionicons name="heart" size={18} color={ACCENT_DARK} />
          </View>
          <Text style={styles.brandText}>
            <Text style={styles.brandTextBold}>Mommy</Text>
            <Text style={styles.brandTextLight}>Count</Text>
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.headerAction}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="settings-outline" size={22} color={TEXT_MUTED} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(120, insets.bottom + 88) },
        ]}
      >
        <View style={styles.heroShadow} />

        <View style={styles.hero}>
          <LinearGradient
            colors={['#EFE5D9', '#E8DBCC', '#E6D9CB']}
            start={{ x: 0.05, y: 0.02 }}
            end={{ x: 0.95, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.heroTextureA} />
          <View style={styles.heroTextureB} />
          <View style={styles.heroTextureC} />
          <View style={styles.heroTextureD} />
          <View style={styles.heroTextureE} />
          <View style={styles.heroSoftWash} />

          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Ionicons name="heart" size={15} color={ACCENT_DARK} />
              <Text style={styles.heroBadgeText}>{genderLabel}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.heroEdit}
              onPress={() => router.push('/(tabs)/design')}
            >
              <Ionicons name="pencil" size={18} color={TEXT_SOFT} />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>Meeting you in...</Text>

          <View style={styles.countdownRow}>
            <View style={styles.countItem}>
              <Text style={styles.countValue}>{pad(time.weeks)}</Text>
              <Text style={styles.countLabel}>WEEKS</Text>
            </View>

            <View style={styles.countDivider} />

            <View style={styles.countItem}>
              <Text style={styles.countValue}>{pad(time.days)}</Text>
              <Text style={styles.countLabel}>DAYS</Text>
            </View>

            <View style={styles.countDivider} />

            <View style={styles.countItem}>
              <Text style={styles.countValue}>{pad(time.hours)}</Text>
              <Text style={styles.countLabel}>HOURS</Text>
            </View>
          </View>

          <View style={styles.timerPill}>
            <LinearGradient
              colors={['rgba(255,255,255,0.86)', 'rgba(249,245,239,0.68)']}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.timerValue}>
              {pad(time.minutes)}:{pad(time.seconds)}
            </Text>
            <View style={styles.timerMeta}>
              <Text style={styles.timerMetaText}>MIN</Text>
              <Text style={styles.timerMetaText}>SEC</Text>
            </View>
          </View>

          <View style={styles.heroFooterBand}>
            <TouchableOpacity activeOpacity={0.9} style={styles.shareBtn} onPress={handleShare}>
              <LinearGradient
                colors={[ACCENT, '#D1B18D', ACCENT]}
                start={{ x: 0.05, y: 0 }}
                end={{ x: 0.95, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Ionicons name="share-outline" size={18} color="#FFFDFB" />
              <Text style={styles.shareText}>Share our countdown</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.valueTextWrap}>
          <Text style={styles.valueTextLineOne}>Keep memories as beautiful as your journey.</Text>
          <Text style={styles.valueTextLineTwo}>Upgrade for more.</Text>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Time remaining</Text>
            <View style={styles.sectionHairline} />
          </View>
          <Text style={styles.sectionHint}>Tap for weeks</Text>

          <View style={styles.progressCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.76)', 'rgba(247,242,234,0.58)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.progressTextureOne} />
            <View style={styles.progressTextureTwo} />

            <View style={styles.progressTopRow}>
              <Text style={styles.progressDateTop}>Start {formatLongDate(startDate)}</Text>
              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>

            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[ACCENT_DARK, ACCENT, '#D9B896']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress}%` as any }]}
              />
            </View>

            <Text style={styles.progressDateBottom}>Due {formatLongDate(dueDate)}</Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Your pregnancy</Text>
            <View style={styles.sectionHairline} />
          </View>

          <View style={styles.genderRow}>
            {[
              { key: 'boy' as GenderValue, label: 'Boy', icon: 'male-outline' },
              { key: 'girl' as GenderValue, label: 'Girl', icon: 'female-outline' },
              { key: 'surprise' as GenderValue, label: 'Surprise', icon: 'gift-outline' },
            ].map((item) => {
              const selected = gender === item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.86}
                  style={[styles.genderCard, selected && styles.genderCardSelected]}
                  onPress={() => setGender(item.key)}
                >
                  <LinearGradient
                    colors={
                      selected
                        ? ['rgba(255,255,255,0.86)', 'rgba(250,247,243,0.76)']
                        : ['rgba(255,255,255,0.36)', 'rgba(247,242,234,0.18)']
                    }
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Ionicons
                    name={item.icon as any}
                    size={42}
                    color={selected ? ACCENT_DARK : TEXT_MUTED}
                  />
                  <Text style={[styles.genderLabel, selected && styles.genderLabelSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.customizeCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.76)', 'rgba(245,238,228,0.66)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.customizeTextureA} />
            <View style={styles.customizeTextureB} />

            <Text style={styles.customizeTitle}>Make it truly yours</Text>
            <Text style={styles.customizeBody}>
              Personalize your countdown with fonts, colors, and photos
            </Text>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.customizeButton}
              onPress={() => router.push('/(tabs)/design')}
            >
              <LinearGradient
                colors={[ACCENT_DARK, ACCENT, '#D2B08A']}
                start={{ x: 0.05, y: 0 }}
                end={{ x: 0.95, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Ionicons name="pencil" size={18} color="#FFFDFB" />
              <Text style={styles.customizeButtonText}>Customize design</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const H_PAD = 24;
const HERO_WIDTH = SCREEN_WIDTH - H_PAD * 2;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    paddingHorizontal: H_PAD,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(245,239,231,0.98)',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  brandText: {
    fontSize: 30,
    letterSpacing: -0.7,
  },

  brandTextBold: {
    color: TEXT,
    fontWeight: '700',
  },

  brandTextLight: {
    color: TEXT_MUTED,
    fontWeight: '300',
  },

  headerAction: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(245,239,231,0.98)',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    paddingHorizontal: H_PAD,
    paddingTop: 8,
  },

  heroShadow: {
    position: 'absolute',
    top: 36,
    left: H_PAD + 14,
    right: H_PAD + 14,
    height: 930,
    borderRadius: 44,
    backgroundColor: SHADOW,
    opacity: 0.12,
    shadowColor: '#7F6448',
    shadowOffset: { width: 0, height: 28 },
    shadowOpacity: 0.08,
    shadowRadius: 44,
    elevation: 14,
  },

  hero: {
    width: HERO_WIDTH,
    borderRadius: 38,
    overflow: 'hidden',
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: 'rgba(131,108,84,0.04)',
    marginBottom: 18,
  },

  heroTextureA: {
    position: 'absolute',
    top: -28,
    left: -46,
    width: 310,
    height: 250,
    borderRadius: 160,
    backgroundColor: 'rgba(255,255,255,0.26)',
  },

  heroTextureB: {
    position: 'absolute',
    top: 112,
    right: -56,
    width: 360,
    height: 250,
    borderRadius: 180,
    backgroundColor: 'rgba(233,221,206,0.28)',
  },

  heroTextureC: {
    position: 'absolute',
    bottom: 94,
    right: 18,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  heroTextureD: {
    position: 'absolute',
    left: -22,
    bottom: 108,
    width: 260,
    height: 120,
    borderRadius: 70,
    backgroundColor: 'rgba(249,245,239,0.16)',
  },

  heroTextureE: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 320,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  heroSoftWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
  },

  heroBadge: {
    minHeight: 50,
    borderRadius: 25,
    paddingHorizontal: 18,
    backgroundColor: WHITE_GLASS,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#91745A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  heroBadgeText: {
    fontSize: 15,
    letterSpacing: 1.1,
    color: ACCENT_DARK,
    fontWeight: '600',
  },

  heroEdit: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.54)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },

  heroTitle: {
    marginTop: 34,
    textAlign: 'center',
    fontSize: 34,
    color: '#5B4B3D',
    fontStyle: 'italic',
    fontWeight: '400',
  },

  countdownRow: {
    marginTop: 30,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  countItem: {
    flex: 1,
    alignItems: 'center',
  },

  countValue: {
    fontSize: 82,
    lineHeight: 88,
    letterSpacing: -4,
    color: TEXT,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },

  countLabel: {
    marginTop: 10,
    fontSize: 13,
    letterSpacing: 2.5,
    color: TEXT_SOFT,
    fontWeight: '600',
  },

  countDivider: {
    width: 1,
    height: 120,
    backgroundColor: 'rgba(113,92,71,0.12)',
  },

  timerPill: {
    marginTop: 28,
    alignSelf: 'center',
    width: HERO_WIDTH - 118,
    minHeight: 98,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.50)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    overflow: 'hidden',
  },

  timerValue: {
    fontSize: 42,
    lineHeight: 46,
    color: TEXT,
    fontWeight: '300',
    letterSpacing: 0.4,
    fontVariant: ['tabular-nums'],
  },

  timerMeta: {
    marginLeft: 18,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  timerMetaText: {
    fontSize: 15,
    color: TEXT_SOFT,
    letterSpacing: 2.1,
    marginVertical: 2,
  },

  heroFooterBand: {
    marginTop: 30,
    backgroundColor: 'rgba(249,245,239,0.34)',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: 'rgba(117,95,72,0.08)',
  },

  shareBtn: {
    minHeight: 62,
    borderRadius: 31,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#8F7152',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },

  shareText: {
    color: '#FFFDFB',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  },

  valueTextWrap: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 28,
  },

  valueTextLineOne: {
    fontSize: 18,
    color: TEXT_SOFT,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 8,
  },

  valueTextLineTwo: {
    fontSize: 18,
    color: TEXT_MUTED,
    fontWeight: '500',
    textAlign: 'center',
  },

  sectionBlock: {
    marginBottom: 38,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 22,
    color: '#6F6255',
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  sectionHairline: {
    height: 1,
    flex: 1,
    marginLeft: 12,
    backgroundColor: 'rgba(118,100,81,0.12)',
  },

  sectionHint: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 14,
  },

  progressCard: {
    minHeight: 150,
    borderRadius: 28,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingVertical: 18,
    backgroundColor: 'rgba(255,255,255,0.40)',
    borderWidth: 1,
    borderColor: 'rgba(121,101,81,0.08)',
    shadowColor: '#8D6D52',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },

  progressTextureOne: {
    position: 'absolute',
    right: -18,
    bottom: -12,
    width: 158,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(233,220,205,0.22)',
  },

  progressTextureTwo: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 200,
    height: 58,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },

  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressDateTop: {
    fontSize: 23,
    color: '#6B5C4E',
    fontWeight: '400',
  },

  progressPercent: {
    fontSize: 28,
    color: '#7D6854',
    fontWeight: '500',
  },

  progressTrack: {
    height: 10,
    marginTop: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(122,101,79,0.14)',
    overflow: 'hidden',
  },

  progressFill: {
    height: 10,
    borderRadius: 8,
  },

  progressDateBottom: {
    fontSize: 23,
    color: '#6B5C4E',
    fontWeight: '400',
    marginTop: 16,
  },

  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  genderCard: {
    width: (HERO_WIDTH - 28) / 3,
    height: 126,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(121,101,81,0.05)',
    shadowColor: '#8D6D52',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    overflow: 'hidden',
  },

  genderCardSelected: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(184,160,136,0.24)',
  },

  genderLabel: {
    marginTop: 12,
    fontSize: 19,
    color: TEXT_SOFT,
    fontWeight: '500',
  },

  genderLabelSelected: {
    color: ACCENT_DARK,
    fontWeight: '600',
  },

  customizeCard: {
    minHeight: 280,
    borderRadius: 32,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(121,101,81,0.08)',
    shadowColor: '#8D6D52',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },

  customizeTextureA: {
    position: 'absolute',
    right: -24,
    bottom: -22,
    width: 180,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(232,219,204,0.26)',
  },

  customizeTextureB: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 220,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  customizeTitle: {
    fontSize: 34,
    lineHeight: 40,
    color: '#5B4B3D',
    fontStyle: 'italic',
    marginBottom: 14,
  },

  customizeBody: {
    fontSize: 19,
    lineHeight: 31,
    color: TEXT_SOFT,
    marginBottom: 30,
    maxWidth: '92%',
  },

  customizeButton: {
    minHeight: 62,
    borderRadius: 31,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  customizeButtonText: {
    color: '#FFFDFB',
    fontSize: 21,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
