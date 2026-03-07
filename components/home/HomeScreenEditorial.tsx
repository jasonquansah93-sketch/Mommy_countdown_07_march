/**
 * HomeScreenEditorial — Redesign des Home Screens im Editorial-Stil.
 * Phase 1: Gleicher Inhalt, neue visuelle Sprache.
 * Warm, clean, editorial, mehr Luft.
 */
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { useProfile } from '../../context/ProfileContext';
import { useDesign } from '../../context/DesignContext';
import { EditorialScreen, EditorialHeader } from '../editorial';
import HeroCountdownCard from './HeroCountdownCard';
import TimeRemainingCard from './TimeRemainingCard';
import JourneyProgress from './JourneyProgress';
import PregnancyDetailsCard from './PregnancyDetailsCard';
import GenderSelector from './GenderSelector';
import CustomizeCTA from './CustomizeCTA';
import { useSessionEntrance } from '../../utils/entrance';
import MilestoneCelebrationModal from '../modals/MilestoneCelebrationModal';
import { getDaysRemaining } from '../../utils/date';
import { loadJSON, saveJSON } from '../../utils/storage';
import { EDITORIAL_SPACING } from '../../theme/editorialTheme';

const CELEBRATION_DAYS = [200, 150, 100, 75, 50, 40, 30, 20, 14, 10, 7, 5, 3, 1];
const CELEBRATED_KEY = 'celebrated_milestones_v1';
const PREGNANCY_DETAILS_Y = 520;

function Section({ index, children }: { index: number; children: React.ReactNode }) {
  const { animStyle } = useSessionEntrance(index);
  return (
    <Animated.View style={[animStyle, styles.section]}>
      {children}
    </Animated.View>
  );
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

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollToDetails = () => {
    scrollRef.current?.scrollTo({ y: PREGNANCY_DETAILS_Y, animated: true });
  };

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

  const milestoneTitle =
    celebrationDay === 1 ? 'Just 1 day to go!' : `${celebrationDay} Days to Go`;

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
          <HeroCountdownCard onScrollToDetails={scrollToDetails} />
        </Section>

        <Section index={2}>
          <TimeRemainingCard />
        </Section>

        <Section index={3}>
          <JourneyProgress />
        </Section>

        <Section index={4}>
          <PregnancyDetailsCard onCountdownStarted={scrollToTop} />
        </Section>

        <Section index={5}>
          <GenderSelector />
        </Section>

        <Section index={6}>
          <CustomizeCTA />
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
    paddingTop: 8,
    paddingBottom: 120,
  },
});
