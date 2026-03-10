import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, FlatList, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePregnancy } from '../../context/PregnancyContext';
import { useProfile } from '../../context/ProfileContext';
import { usePremium } from '../../context/PremiumContext';
import { Moment, Milestone } from '../../types/pregnancy';
import { formatDateLabel, getDaysRemaining, getMilestoneDateState } from '../../utils/date';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadJSON, saveJSON } from '../../utils/storage';
import KicksCounter from '../../components/journey/KicksCounter';
import TimeCapsuleModal from '../../components/modals/TimeCapsuleModal';

const PAYWALL_100_KEY = 'mommy_paywall_100shown';

export default function JourneyScreen() {
  const router = useRouter();
  const [capsuleVisible, setCapsuleVisible] = useState(false);
  const {
    pregnancies, currentPregnancy, selectedPregnancyId,
    setSelectedPregnancyId, isLoaded, archiveCurrentPregnancy,
    createNewPregnancy, getManualMoments,
  } = usePregnancy();
  const { profile, updateProfile } = useProfile();
  const { isPremium } = usePremium();
  const insets = useSafeAreaInsets();
  const paywall100Triggered = useRef(false);

  const hasMultiplePregnancies = pregnancies.length > 1;
  const activePregnancy = pregnancies.find(p => p.status === 'active');
  const daysRemaining = currentPregnancy ? getDaysRemaining(currentPregnancy.dueDate) : 999;

  useEffect(() => {
    if (activePregnancy && daysRemaining <= 0 && profile.countdownStarted)
      archiveCurrentPregnancy();
  }, [daysRemaining, activePregnancy, profile.countdownStarted, archiveCurrentPregnancy]);

  useEffect(() => {
    if (isPremium || paywall100Triggered.current) return;
    if (daysRemaining !== 100) return;
    loadJSON<boolean>(PAYWALL_100_KEY).then(shown => {
      if (!shown) {
        paywall100Triggered.current = true;
        saveJSON(PAYWALL_100_KEY, true);
        router.push('/modal/paywall');
      }
    });
  }, [daysRemaining, isPremium]);

  const manualMoments = getManualMoments();
  const recentMoments = [...manualMoments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const handleMomentPress   = (id: string) => router.push(`/modal/moment-detail?id=${id}`);
  const handleMilestonePress = (id: string) => router.push(`/modal/milestone?id=${id}`);

  const renderMomentItem = useCallback(({ item }: { item: Moment }) => (
    <TouchableOpacity
      style={s.momentCard}
      onPress={() => handleMomentPress(item.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {item.imageUri && <Image source={{ uri: item.imageUri }} style={s.momentImage} />}
      <Text style={s.momentDate}>{formatDateLabel(item.createdAt)}</Text>
      <Text style={s.momentText} numberOfLines={2}>{item.title ?? item.note ?? ''}</Text>
    </TouchableOpacity>
  ), []);

  const getMilestoneEmphasis = useCallback((title: string) => {
    if (title.includes('Due Date'))     return 'due-date'    as const;
    if (title.includes('1 Day to Go')) return 'celebratory' as const;
    if (title.includes('5 Days to Go')) return 'strong'     as const;
    if (title.includes('10 Days to Go')) return 'subtle'    as const;
    return 'normal' as const;
  }, []);

  const renderMilestoneItem = useCallback(({ item }: { item: Milestone }) => {
    const hasLinked = (item.linkedMomentIds?.length ?? 0) > 0 ||
      (currentPregnancy?.moments.some(m => m.type === 'moment' && m.linkedMilestoneId === item.id) ?? false);
    const dateState = getMilestoneDateState(item.milestoneDate);
    const emphasis  = getMilestoneEmphasis(item.title);
    const isCompleted = dateState === 'past';
    const isToday     = dateState === 'today';

    let circleBg   = hasLinked ? '#C09A72' : 'rgba(192,154,114,0.35)';
    let rowBg: string | undefined;
    let titleColor = '#2C211A';
    let titleWeight: '600' | '700' | '800' = '600';
    let leftBorder: object = {};

    if (isToday) { rowBg = 'rgba(192,154,114,0.10)'; titleWeight = '800'; }

    if (emphasis === 'subtle' && !isCompleted) {
      titleWeight = '700';
    } else if (emphasis === 'strong' && !isCompleted) {
      leftBorder  = { borderLeftWidth: 3, borderLeftColor: '#C09A72' };
      titleWeight = '800';
    } else if (emphasis === 'celebratory' && !isCompleted) {
      leftBorder  = { borderLeftWidth: 3, borderLeftColor: '#C09A72' };
      rowBg       = 'rgba(192,154,114,0.08)';
      titleColor  = '#A87E52';
      titleWeight = '800';
    } else if (emphasis === 'due-date' && !isCompleted) {
      circleBg    = '#A87E52';
      rowBg       = 'rgba(168,126,82,0.10)';
      titleColor  = '#A87E52';
      titleWeight = '800';
    }

    return (
      <TouchableOpacity
        style={[
          s.milestoneEntry,
          isCompleted && { opacity: 0.65 },
          rowBg ? { backgroundColor: rowBg } : undefined,
          leftBorder,
        ]}
        onPress={() => handleMilestonePress(item.id)}
        activeOpacity={0.7}
      >
        <View style={[s.milestoneCircle, { backgroundColor: circleBg }]}>
          {emphasis === 'due-date' && !isCompleted && (
            <Ionicons name="balloon" size={20} color="#FFF8EF" />
          )}
        </View>
        <View style={s.milestoneContent}>
          <Text style={[s.milestoneTitle, { color: titleColor, fontWeight: titleWeight }]}>
            {item.title}
          </Text>
          <Text style={s.milestoneDate}>{formatDateLabel(item.milestoneDate)}</Text>
          <Text style={s.milestoneAdd}>Add a memory</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color="rgba(160,140,118,0.55)" />
      </TouchableOpacity>
    );
  }, [currentPregnancy, getMilestoneEmphasis]);

  if (!isLoaded) {
    return (
      <View style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <Image
          source={require('../../assets/images/floral-bg.png')}
          style={StyleSheet.absoluteFillObject} resizeMode="cover"
        />
        <Text style={{ color: '#9A8472', fontFamily: 'Georgia', fontStyle: 'italic' }}>
          Loading…
        </Text>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      {/* ── Botanical background ── */}
      <Image
        source={require('../../assets/images/floral-bg.png')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Text style={s.headerTitle}>
          <Text style={s.headerTitleB}>Your</Text>
          <Text style={s.headerTitleL}> Journey</Text>
        </Text>
        <Text style={s.headerSub}>Every moment, memory & milestone</Text>
      </View>

      {/* ── Pregnancy selector (only when needed) ── */}
      {(hasMultiplePregnancies || !activePregnancy) && (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.selectorRow}
          >
            {!activePregnancy && (
              <TouchableOpacity
                style={[s.selectorPill, s.selectorPillActive]}
                onPress={() => {
                  const defaultDue = new Date();
                  defaultDue.setMonth(defaultDue.getMonth() + 6);
                  const defaultStart = new Date(defaultDue);
                  defaultStart.setDate(defaultStart.getDate() - 280);
                  const dueIso   = defaultDue.toISOString();
                  const startIso = defaultStart.toISOString();
                  updateProfile({ dueDate: dueIso, startDate: startIso, countdownStarted: true });
                  createNewPregnancy({ ...profile, dueDate: dueIso, startDate: startIso });
                }}
              >
                <Text style={[s.selectorPillTxt, s.selectorPillTxtActive]}>+ New Pregnancy</Text>
              </TouchableOpacity>
            )}
            {pregnancies.map(p => {
              const isSel = p.id === selectedPregnancyId;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[s.selectorPill, isSel && s.selectorPillActive]}
                  onPress={() => setSelectedPregnancyId(p.id)}
                >
                  <Text style={[s.selectorPillTxt, isSel && s.selectorPillTxtActive]}>
                    {p.status === 'active' ? 'Current' : `Past · ${formatDateLabel(p.dueDate)}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 108 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Baby Kicks ── */}
        <View style={s.section}>
          <KicksCounter />
        </View>

        {/* ── Time Capsule ── */}
        <TouchableOpacity
          style={s.capsuleCard}
          onPress={() => setCapsuleVisible(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={s.capsuleIcon}>
            <Ionicons name="mail-outline" size={20} color="#C09A72" />
          </View>
          <View style={s.capsuleText}>
            <Text style={s.capsuleTitle}>Write a letter to your baby</Text>
            <Text style={s.capsuleSub}>A time capsule they'll read one day</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(160,140,118,0.65)" />
        </TouchableOpacity>
        <TimeCapsuleModal visible={capsuleVisible} onClose={() => setCapsuleVisible(false)} />

        {/* ── Your Moments ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View>
              <Text style={s.sectionLabel}>YOUR MOMENTS</Text>
              <Text style={s.sectionTitle}>Memories</Text>
            </View>
            <TouchableOpacity
              style={s.addBtn}
              onPress={() => router.push('/modal/add-moment')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#C09A72', '#A87E52']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={s.addBtnTxt}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {recentMoments.length === 0 ? (
            <View style={s.placeholderCard}>
              <LinearGradient
                colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Ionicons name="camera-outline" size={28} color="rgba(192,154,114,0.50)" style={{ marginBottom: 10 }} />
              <Text style={s.placeholderText}>Your story starts with{'\n'}the first moment you save.</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={recentMoments}
                keyExtractor={item => item.id}
                renderItem={renderMomentItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              />
              {manualMoments.length > 3 && (
                <TouchableOpacity
                  style={s.viewAllBtn}
                  onPress={() => router.push('/modal/all-moments')}
                  activeOpacity={0.75}
                >
                  <LinearGradient
                    colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Text style={s.viewAllTxt}>View All Moments</Text>
                  <Ionicons name="chevron-forward" size={14} color="#C09A72" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* ── Milestones ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>MILESTONES</Text>
          <Text style={s.sectionTitle}>Timeline</Text>
          <Text style={s.milestoneInfo}>
            Milestones are created automatically from your due date. Tap any to add photos or notes.
          </Text>
          {currentPregnancy && (
            <View style={s.milestoneContainer}>
              <LinearGradient
                colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <FlatList
                data={currentPregnancy.milestones.filter((m): m is Milestone => m.type === 'milestone')}
                keyExtractor={item => item.id}
                renderItem={renderMilestoneItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={s.milestoneHairline} />}
              />
            </View>
          )}
        </View>

        {/* ── Final card ── */}
        <View style={s.finalCard}>
          <LinearGradient
            colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={s.finalTitle}>Your story will grow with you</Text>
          <Text style={s.finalText}>
            Soon you'll be able to relive your journey as a beautiful timeline or video.
          </Text>
          <TouchableOpacity
            style={s.videoBtn}
            onPress={() => router.push('/video-wizard')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#C09A72', '#A87E52']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={s.videoBtnTxt}>Create Video</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E8D8C4' },

  /* ── Header ── */
  header: {
    alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 14,
  },
  headerTitle: { fontSize: 20, letterSpacing: -0.3 },
  headerTitleB: { color: '#2C211A', fontWeight: '700' },
  headerTitleL: { color: '#A09282', fontWeight: '300' },
  headerSub: {
    fontSize: 11, color: '#A08C76', letterSpacing: 0.8,
    marginTop: 2, fontFamily: 'Georgia', fontStyle: 'italic',
  },

  /* ── Pregnancy selector ── */
  selectorRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8, flexDirection: 'row' },
  selectorPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.30)',
    backgroundColor: 'rgba(255,255,255,0.50)',
  },
  selectorPillActive: {
    backgroundColor: 'rgba(192,154,114,0.22)',
    borderColor: 'rgba(168,126,82,0.45)',
  },
  selectorPillTxt:       { fontSize: 13, fontWeight: '500', color: '#9A8472' },
  selectorPillTxtActive: { color: '#7A5830', fontWeight: '700' },

  /* ── Scroll ── */
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  /* ── Section ── */
  section: { marginBottom: 28 },
  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2.0,
    color: '#A08C76', marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 22, fontWeight: '300', color: '#2C211A',
    letterSpacing: -0.5, fontFamily: 'Georgia',
  },
  milestoneInfo: {
    fontSize: 13, color: '#9A8472', lineHeight: 19,
    letterSpacing: 0.1, marginBottom: 14,
  },

  /* ── Add button ── */
  addBtn: {
    overflow: 'hidden', borderRadius: 20, position: 'relative',
    paddingHorizontal: 18, paddingVertical: 10,
  },
  addBtnTxt: { color: '#FFF8EF', fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },

  /* ── Time capsule card ── */
  capsuleCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, overflow: 'hidden',
    paddingHorizontal: 16, paddingVertical: 16,
    marginBottom: 28, position: 'relative',
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  capsuleIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(192,154,114,0.16)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  capsuleText: { flex: 1 },
  capsuleTitle: { fontSize: 15, fontWeight: '600', color: '#2C211A', marginBottom: 2 },
  capsuleSub:   { fontSize: 13, color: '#9A8472' },

  /* ── Placeholder card ── */
  placeholderCard: {
    borderRadius: 16, overflow: 'hidden', position: 'relative',
    paddingVertical: 40, paddingHorizontal: 24,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
  },
  placeholderText: {
    fontSize: 14, color: '#9A8472', textAlign: 'center',
    lineHeight: 22, fontFamily: 'Georgia', fontStyle: 'italic',
  },

  /* ── Moment card ── */
  momentCard: {
    borderRadius: 16, overflow: 'hidden', position: 'relative',
    paddingHorizontal: 16, paddingVertical: 16,
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  momentImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 14 },
  momentDate: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    color: '#A08C76', marginBottom: 6,
  },
  momentText: {
    fontSize: 16, fontWeight: '600', color: '#2C211A',
    lineHeight: 24, letterSpacing: -0.2,
  },

  /* ── View all button ── */
  viewAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 10, borderRadius: 14, overflow: 'hidden',
    paddingVertical: 14, position: 'relative',
    borderWidth: 1, borderColor: 'rgba(168,126,82,0.35)',
  },
  viewAllTxt: { fontSize: 14, fontWeight: '600', color: '#7A5830' },

  /* ── Milestone list ── */
  milestoneContainer: {
    borderRadius: 16, overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  milestoneEntry: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 16,
  },
  milestoneHairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120,90,60,0.18)', marginHorizontal: 16,
  },
  milestoneCircle: {
    width: 42, height: 42, borderRadius: 21,
    marginRight: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  milestoneContent: { flex: 1 },
  milestoneTitle: { fontSize: 15, fontWeight: '600', color: '#2C211A', marginBottom: 2 },
  milestoneDate: { fontSize: 12, color: '#9A8472', marginBottom: 1 },
  milestoneAdd:  { fontSize: 11, color: 'rgba(160,140,118,0.65)', fontStyle: 'italic' },

  /* ── Final card ── */
  finalCard: {
    borderRadius: 16, overflow: 'hidden', position: 'relative',
    paddingHorizontal: 20, paddingVertical: 28,
    marginBottom: 16, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  finalTitle: {
    fontSize: 20, fontWeight: '300', color: '#2C211A',
    fontFamily: 'Georgia', fontStyle: 'italic',
    letterSpacing: -0.3, marginBottom: 10, textAlign: 'center',
  },
  finalText: {
    fontSize: 14, color: '#9A8472', lineHeight: 22,
    textAlign: 'center', marginBottom: 22,
  },
  videoBtn: {
    overflow: 'hidden', borderRadius: 22, position: 'relative',
    paddingHorizontal: 28, paddingVertical: 12,
  },
  videoBtnTxt: { color: '#FFF8EF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
});
