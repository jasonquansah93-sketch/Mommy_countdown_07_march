/**
 * HomeScreenEditorial — Vollständiges Redesign des Home Screens.
 * Phase 1B: Eigene Editorial-Komponenten, visuell deutlich anders.
 */
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { useProfile } from '../../context/ProfileContext';
import { useDesign } from '../../context/DesignContext';
import { EditorialScreen, EditorialHeader } from '../editorial';
import {
  EditorialHeroCountdown,
  EditorialTimeRemaining,
  EditorialJourneyProgress,
  EditorialPregnancyDetails,
  EditorialGenderSelector,
  EditorialCustomizeCTA,
} from './editorial';
import { useSessionEntrance } from '../../utils/entrance';
import MilestoneCelebrationModal from '../modals/MilestoneCelebrationModal';
import { getDaysRemaining } from '../../utils/date';
import { loadJSON, saveJSON } from '../../utils/storage';
import { EDITORIAL_SPACING } from '../../theme/editorialTheme';

const CELEBRATION_DAYS = [200, 150, 100, 75, 50, 40, 30, 20, 14, 10, 7, 5, 3, 1];
const CELEBRATED_KEY = 'celebrated_milestones_v1';
const PREGNANCY_DETAILS_Y = 580;

function Section({ index, children }: { index: number; children: React.ReactNode }) {
  const { animStyle } = useSessionEntrance(index);
  return <Animated.View style={[animStyle, styles.section]}>{children}</Animated.View>;
}

export default function HomeScreenEditorial() {
  const { isLoaded, profile } = useProfile();
  const { colors } = useDesign();
  const scrollRef = useRef<ScrollView>(null);

  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationDay, setCelebrationDay] = useState(0);

  useEffect(() => {
    if (!profile?.dueDate || !profile.countdownStarted) return;
    const days = getDaysRemaining(profile.dueDate);
    if (!CELEBRATION_DAYS.includes(days)) return;

    loadJSON<number[]>(CELEBRATED_KEY).then((celebrated) => {
      const done = celebrated ?? [];
      if (!done.includes(days)) {
        setCelebrationDay(days);
        setCelebrationVisible(true);
        saveJSON(CELEBRATED_KEY, [...done, days]);
      }
    });
  }, [profile?.dueDate, profile?.countdownStarted]);

  const scrollToTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });
  const scrollToDetails = () => scrollRef.current?.scrollTo({ y: PREGNANCY_DETAILS_Y, animated: true });

  if (isLoaded === false) {
    return (
      <EditorialScreen>
        <EditorialHeader />
        <View style={styles.center}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      </EditorialScreen>
    );
  }

  const milestoneTitle = celebrationDay === 1 ? 'Just 1 day to go!' : `${celebrationDay} Days to Go`;

  return (
    <EditorialScreen>
      <MilestoneCelebrationModal
        visible={celebrationVisible}
        milestoneTitle={milestoneTitle}
        daysLabel={String(celebrationDay)}
        onClose={() => setCelebrationVisible(false)}
      />

      <Section index={0}>
        <EditorialHeader />
      </Section>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Section index={1}>
          <EditorialHeroCountdown onScrollToDetails={scrollToDetails} />
        </Section>

        <Section index={2}>
          <EditorialTimeRemaining />
        </Section>

        <Section index={3}>
          <EditorialJourneyProgress />
        </Section>

        <Section index={4}>
          <EditorialPregnancyDetails onCountdownStarted={scrollToTop} />
        </Section>

        <Section index={5}>
          <EditorialGenderSelector />
        </Section>

        <Section index={6}>
          <EditorialCustomizeCTA />
        </Section>
      </ScrollView>
    </EditorialScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: EDITORIAL_SPACING.sectionGap,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 15,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 120,
  },
});
