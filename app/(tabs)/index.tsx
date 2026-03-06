import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { useProfile } from '../../context/ProfileContext';
import { useDesign } from '../../context/DesignContext';
import GradientHeader from '../../components/home/GradientHeader';
import HeroCountdownCard from '../../components/home/HeroCountdownCard';
import TimeRemainingCard from '../../components/home/TimeRemainingCard';
import JourneyProgress from '../../components/home/JourneyProgress';
import PregnancyDetailsCard from '../../components/home/PregnancyDetailsCard';
import GenderSelector from '../../components/home/GenderSelector';
import CustomizeCTA from '../../components/home/CustomizeCTA';
import ScreenBackground from '../../components/shared/ScreenBackground';
import { useSessionEntrance } from '../../utils/entrance';
import MilestoneCelebrationModal from '../../components/modals/MilestoneCelebrationModal';
import { getDaysRemaining } from '../../utils/date';
import { loadJSON, saveJSON } from '../../utils/storage';

// Days-to-go that trigger a milestone celebration
const CELEBRATION_DAYS = [200, 150, 100, 75, 50, 40, 30, 20, 14, 10, 7, 5, 3, 1];
const CELEBRATED_KEY = 'celebrated_milestones_v1';

// Approximate Y position for scrolling to details section
const PREGNANCY_DETAILS_Y = 480;

// ─── Animated section wrappers ─────────────────────────────────────────────
// Each section gets its own stagger index so they cascade beautifully on first open.
function Section({ index, children }: { index: number; children: React.ReactNode }) {
  const { animStyle } = useSessionEntrance(index);
  return <Animated.View style={animStyle}>{children}</Animated.View>;
}

export default function HomeScreen() {
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
      <ScreenBackground>
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      </ScreenBackground>
    );
  }

  const milestoneTitle =
    celebrationDay === 1
      ? 'Just 1 day to go!'
      : `${celebrationDay} Days to Go`;

  return (
    <ScreenBackground>
      <MilestoneCelebrationModal
        visible={celebrationVisible}
        milestoneTitle={milestoneTitle}
        daysLabel={String(celebrationDay)}
        onClose={() => setCelebrationVisible(false)}
      />

      {/* Section 0: Header — arrives first */}
      <Section index={0}>
        <GradientHeader />
      </Section>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Hero Countdown Card */}
        <Section index={1}>
          <HeroCountdownCard onScrollToDetails={scrollToDetails} />
        </Section>

        {/* Section 2: Time Remaining — the big floating number */}
        <Section index={2}>
          <TimeRemainingCard />
        </Section>

        {/* Section 3: Journey Progress */}
        <Section index={3}>
          <JourneyProgress />
        </Section>

        {/* Section 4: Pregnancy Details */}
        <Section index={4}>
          <PregnancyDetailsCard onCountdownStarted={scrollToTop} />
        </Section>

        {/* Section 5: Gender Selector */}
        <Section index={5}>
          <GenderSelector />
        </Section>

        {/* Section 6: Customize CTA */}
        <Section index={6}>
          <CustomizeCTA />
        </Section>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 120,
  },
});
