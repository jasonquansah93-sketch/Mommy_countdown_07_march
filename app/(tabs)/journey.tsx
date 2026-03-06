import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDesign } from '../../context/DesignContext';
// LinearGradient kept for moment CTA button only
import { useRouter } from 'expo-router';
import { usePregnancy } from '../../context/PregnancyContext';
import { useProfile } from '../../context/ProfileContext';
import { usePremium } from '../../context/PremiumContext';
import { Moment, Milestone } from '../../types/pregnancy';
import { formatDateLabel, getDaysRemaining, getMilestoneDateState } from '../../utils/date';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadJSON, saveJSON } from '../../utils/storage';
import ScreenBackground from '../../components/shared/ScreenBackground';
import { RADIUS, SPACING, GLASS } from '../../constants/tokens';
import KicksCounter from '../../components/journey/KicksCounter';
import TimeCapsuleModal from '../../components/modals/TimeCapsuleModal';

const PAYWALL_100_KEY = 'mommy_paywall_100shown';

export default function JourneyScreen() {
  const { colors } = useDesign();
  const router = useRouter();
  const [capsuleVisible, setCapsuleVisible] = useState(false);
  const {
    pregnancies,
    currentPregnancy,
    selectedPregnancyId,
    setSelectedPregnancyId,
    isLoaded,
    archiveCurrentPregnancy,
    createNewPregnancy,
    getManualMoments,
  } = usePregnancy();
  const { profile, updateProfile } = useProfile();
  const { isPremium } = usePremium();
  const insets = useSafeAreaInsets();
  const paywall100Triggered = useRef(false);

  const hasMultiplePregnancies = pregnancies.length > 1;
  const activePregnancy = pregnancies.find((p) => p.status === 'active');
  const daysRemaining = currentPregnancy ? getDaysRemaining(currentPregnancy.dueDate) : 999;

  useEffect(() => {
    if (
      activePregnancy &&
      daysRemaining <= 0 &&
      profile.countdownStarted
    ) {
      archiveCurrentPregnancy();
    }
  }, [daysRemaining, activePregnancy, profile.countdownStarted, archiveCurrentPregnancy]);

  // 100-days-to-go paywall trigger — fires once per user lifetime
  useEffect(() => {
    if (isPremium || paywall100Triggered.current) return;
    if (daysRemaining !== 100) return;
    loadJSON<boolean>(PAYWALL_100_KEY).then((shown) => {
      if (!shown) {
        paywall100Triggered.current = true;
        saveJSON(PAYWALL_100_KEY, true);
        router.push('/modal/paywall');
      }
    });
  }, [daysRemaining, isPremium]);

  /** RENDER FIREWALL: Your Moments = ONLY manual entries. Never milestones, never milestone-origin moments. */
  const manualMoments = getManualMoments();
  const allMomentsOnly = manualMoments;
  const recentMoments = [...allMomentsOnly]
    .sort((a, b) => {
        const da = new Date(a.createdAt).getTime();
        const db = new Date(b.createdAt).getTime();
      return db - da;
    })
    .slice(0, 3);

  const handleMomentPress = (id: string) => {
    router.push(`/modal/moment-detail?id=${id}`);
  };

  const handleMilestonePress = (id: string) => {
    router.push(`/modal/milestone?id=${id}`);
  };

  const renderMomentItem = useCallback(
    ({ item }: { item: Moment }) => (
      <TouchableOpacity
        style={[styles.momentCard]}
        onPress={() => handleMomentPress(item.id)}
        activeOpacity={0.8}
      >
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.momentImage} />
        )}
        <Text style={[styles.momentDate, { color: colors.textSecondary }]}>
          {formatDateLabel(item.createdAt)}
        </Text>
        <Text
          style={[styles.momentText, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title ?? item.note ?? ''}
        </Text>
      </TouchableOpacity>
    ),
    [colors]
  );

  /** Emphasis level for final countdown milestones (by title). */
  const getMilestoneEmphasis = useCallback((title: string): 'normal' | 'subtle' | 'strong' | 'celebratory' | 'due-date' => {
    if (title.includes('Due Date')) return 'due-date';
    if (title.includes('1 Day to Go')) return 'celebratory';
    if (title.includes('5 Days to Go')) return 'strong';
    if (title.includes('10 Days to Go')) return 'subtle';
    return 'normal';
  }, []);

  const renderMilestoneItem = useCallback(
    ({ item }: { item: Milestone }) => {
      const hasLinked =
        (item.linkedMomentIds?.length ?? 0) > 0 ||
        (currentPregnancy?.moments.some((mom) => mom.type === 'moment' && mom.linkedMilestoneId === item.id) ?? false);
      const dateState = getMilestoneDateState(item.milestoneDate);
      const emphasis = getMilestoneEmphasis(item.title);

      const isCompleted = dateState === 'past';
      const isToday = dateState === 'today';

      let entryStyle = { borderBottomColor: colors.accent };
      let circleBg = hasLinked ? colors.primary : colors.textSecondary;
      let titleStyle = { color: colors.text };
      let bgStyle = undefined;

      if (isCompleted) {
        entryStyle = { ...entryStyle, opacity: 0.7 };
        titleStyle = { ...titleStyle, opacity: 0.85 };
      } else if (isToday) {
        bgStyle = { backgroundColor: colors.primary + '15' };
        titleStyle = { ...titleStyle, fontWeight: '800' as const };
      }

      if (emphasis === 'subtle' && !isCompleted) {
        titleStyle = { ...titleStyle, fontWeight: '700' as const };
      } else if (emphasis === 'strong' && !isCompleted) {
        entryStyle = { ...entryStyle, borderLeftWidth: 4, borderLeftColor: colors.primary };
        titleStyle = { ...titleStyle, fontWeight: '800' as const };
      } else if (emphasis === 'celebratory' && !isCompleted) {
        entryStyle = { ...entryStyle, borderLeftWidth: 4, borderLeftColor: colors.accent };
        titleStyle = { ...titleStyle, fontWeight: '800' as const, color: colors.primary };
        bgStyle = bgStyle ?? { backgroundColor: colors.primary + '12' };
      } else if (emphasis === 'due-date' && !isCompleted) {
        circleBg = colors.accent;
        titleStyle = { ...titleStyle, fontWeight: '800' as const, color: colors.accent };
        bgStyle = bgStyle ?? { backgroundColor: colors.accent + '18' };
      }

      return (
        <TouchableOpacity
          style={[
            styles.milestoneEntry,
            entryStyle,
            bgStyle,
          ]}
          onPress={() => handleMilestonePress(item.id)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.milestoneCircle,
              { backgroundColor: circleBg },
              emphasis === 'due-date' && !isCompleted && { justifyContent: 'center', alignItems: 'center' },
            ]}
          >
            {emphasis === 'due-date' && !isCompleted && (
              <Ionicons name="balloon" size={24} color="#FFFFFF" />
            )}
          </View>
          <View style={styles.milestoneContent}>
            <Text style={[styles.milestoneTitle, titleStyle]}>
              {item.title}
            </Text>
            <Text style={[styles.milestoneDate, { color: colors.textSecondary }]}>
              {formatDateLabel(item.milestoneDate)}
            </Text>
            <Text style={[styles.milestoneAdd, { color: colors.textSecondary }]}>
              Add a memory
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [colors, currentPregnancy, getMilestoneEmphasis]
  );

  if (!isLoaded) {
    return (
      <ScreenBackground>
        <Text style={{ color: colors.textSecondary, padding: 20 }}>Loading...</Text>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={[styles.headerWrapper, { paddingTop: insets.top + 28, paddingHorizontal: SPACING.screenH, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.accent }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Your Journey</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Every moment, memory and milestone in one place.
          </Text>

        {(hasMultiplePregnancies || !activePregnancy) && (
          <View style={styles.dropdownWrapper}>
            <Text style={styles.dropdownLabel}>Select journey:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {!activePregnancy && (
                <TouchableOpacity
                  style={[styles.dropdownItem, styles.dropdownItemSelected]}
                  onPress={() => {
                    const defaultDue = new Date();
                    defaultDue.setMonth(defaultDue.getMonth() + 6);
                    const defaultStart = new Date(defaultDue);
                    defaultStart.setDate(defaultStart.getDate() - 280);
                    const dueIso = defaultDue.toISOString();
                    const startIso = defaultStart.toISOString();
                    updateProfile({
                      dueDate: dueIso,
                      startDate: startIso,
                      countdownStarted: true,
                    });
                    createNewPregnancy({
                      ...profile,
                      dueDate: dueIso,
                      startDate: startIso,
                    });
                  }}
                >
                  <Text style={[styles.dropdownItemText, styles.dropdownItemTextSelected]}>
                    + Create New Pregnancy
                  </Text>
                </TouchableOpacity>
              )}
              {pregnancies.map((p) => {
                const isActive = p.status === 'active';
                const isSelected = p.id === selectedPregnancyId;
                const label = isActive
                  ? 'Current Pregnancy'
                  : `Previous (${formatDateLabel(p.dueDate)})`;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemSelected,
                    ]}
                    onPress={() => setSelectedPregnancyId(p.id)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Baby Kicks Counter */}
        <View style={styles.section}>
          <KicksCounter />
        </View>

        {/* Time Capsule */}
        <TouchableOpacity
          style={[styles.capsuleRow, { backgroundColor: GLASS.surface, borderColor: GLASS.border }, GLASS.shadowSubtle]}
          onPress={() => setCapsuleVisible(true)}
          activeOpacity={0.8}
        >
          <View style={[styles.capsuleIconWrap, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.capsuleTextWrap}>
            <Text style={[styles.capsuleTitle, { color: colors.text }]}>Write a letter to your baby</Text>
            <Text style={[styles.capsuleSubtitle, { color: colors.textSecondary }]}>A time capsule they'll read one day</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TimeCapsuleModal visible={capsuleVisible} onClose={() => setCapsuleVisible(false)} />

        <View style={styles.section}>
          <View style={styles.momentsSectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Moments
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/modal/add-moment')}
              activeOpacity={0.8}
              style={[
                styles.addMomentInlineBtn,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  elevation: 6,
                },
              ]}
            >
              <Text style={styles.addMomentInlineBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {recentMoments.length === 0 ? (
            <View style={[styles.placeholderCard]}>
              <Text
                style={[styles.placeholderText, { color: colors.textSecondary }]}
              >
                Your story starts with the first moment you save.
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={recentMoments}
                keyExtractor={(item) => item.id}
                renderItem={renderMomentItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              />
              {allMomentsOnly.length > 3 && (
                <TouchableOpacity
                  style={[styles.viewAllBtn, { borderColor: colors.primary }]}
                  onPress={() => router.push('/modal/all-moments')}
                >
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>
                    View All Moments
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Milestones
          </Text>
          <View style={[styles.infoBox]}>
            <Text style={[styles.infoBoxText, { color: colors.text }]}>
              Milestones are created automatically based on your due date. All
              milestones (past, current, and future) are shown here. You can add
              photos or memories to any milestone, even if it already passed.
            </Text>
          </View>

          {currentPregnancy && (
            <View style={[styles.milestoneContainer]}>
              <FlatList
                data={currentPregnancy.milestones.filter((m): m is Milestone => m.type === 'milestone')}
                keyExtractor={(item) => item.id}
                renderItem={renderMilestoneItem}
                scrollEnabled={false}
                ItemSeparatorComponent={null}
              />
            </View>
          )}
        </View>

        <View style={[styles.lowerInfoBox]}>
          <Text style={[styles.lowerInfoText, { color: colors.text }]}>
            All milestones and moments will later come together in a beautiful
            pregnancy timeline or video.
          </Text>
        </View>

        <View style={styles.finalSection}>
          <Text style={[styles.finalTitle, { color: colors.text }]}>
            Your story will grow with you
          </Text>
          <Text style={[styles.finalText, { color: colors.textSecondary }]}>
            Soon you'll be able to relive your journey as a beautiful timeline or
            video.
          </Text>
          <TouchableOpacity
            style={[styles.videoButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/video-wizard')}
            activeOpacity={0.8}
          >
            <Text style={styles.videoButtonText}>Video erstellen</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  dropdownWrapper: {
    marginTop: 16,
  },
  dropdownLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginBottom: 6,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dropdownItemText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  dropdownItemTextSelected: {
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenH,
  },
  ctaSection: {
    marginTop: 28,
    marginBottom: 36,
  },
  momentsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  addMomentInlineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addMomentInlineBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ctaButtonWrapper: {
    marginBottom: 10,
    // Primary-colored glow applied dynamically via inline style
  },
  ctaButton: {
    borderRadius: RADIUS.button,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ctaHelper: {
    fontSize: 13,
    textAlign: 'center',
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  placeholderCard: {
    borderRadius: RADIUS.card,
    paddingVertical: 56,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.border,
    ...GLASS.shadow,
  },
  placeholderText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  momentCard: {
    borderRadius: RADIUS.card,
    padding: 16,
    paddingBottom: 20,
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.border,
    ...GLASS.shadow,
  },
  momentImage: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.inner,
    marginBottom: 14,
  },
  momentDate: {
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  momentText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  viewAllBtn: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: RADIUS.inner,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoBox: {
    borderRadius: RADIUS.inner,
    padding: 18,
    marginBottom: 16,
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.border,
    ...GLASS.shadowSubtle,
  },
  infoBoxText: {
    fontSize: 14,
    lineHeight: 22,
  },
  milestoneContainer: {
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.border,
    ...GLASS.shadow,
  },
  milestoneEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  milestoneCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  milestoneDate: {
    fontSize: 13,
    marginBottom: 2,
  },
  milestoneAdd: {
    fontSize: 12,
  },
  lowerInfoBox: {
    borderRadius: RADIUS.inner,
    padding: 18,
    marginBottom: 40,
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.border,
    ...GLASS.shadowSubtle,
  },
  lowerInfoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  finalSection: {
    marginBottom: 24,
  },
  finalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  finalText: {
    fontSize: 15,
    lineHeight: 26,
    fontWeight: '400',
  },
  videoButton: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: RADIUS.card,
    alignItems: 'center',
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  bottomSpacer: {
    height: 100,
  },
  capsuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 16,
    marginBottom: 36,
  },
  capsuleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  capsuleTextWrap: {
    flex: 1,
  },
  capsuleTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  capsuleSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
});
