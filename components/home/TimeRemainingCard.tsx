/**
 * TimeRemainingCard — live-updating tap-to-switch stat with floating animation.
 *
 * Tap anywhere to cycle: days → weeks → hours → minutes → seconds → days
 *
 * All modes update in real-time via setInterval:
 *   seconds  → every 1000ms  (counts down like a clock)
 *   minutes  → every 1000ms  (updates the moment a new minute passes)
 *   hours    → every 1000ms  (stays accurate)
 *   days     → every 60000ms (daily resolution, light interval)
 *   weeks    → every 60000ms
 *
 * Values are derived from getTimeUntilDueMs() — the same source as the Hero card.
 * Selected mode persists across app restarts.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { useProfile } from '../../context/ProfileContext';
import { useDesign } from '../../context/DesignContext';
import { getTimeUntilDueMs } from '../../utils/date';
import { SPACING } from '../../constants/tokens';
import { useReducedMotion } from '../../utils/motion';
import { loadJSON, saveJSON } from '../../utils/storage';

// ─── Mode config ─────────────────────────────────────────────────────────────

type TimeMode = 'days' | 'weeks' | 'hours' | 'minutes' | 'seconds';
const MODES: TimeMode[] = ['days', 'weeks', 'hours', 'minutes', 'seconds'];
const MODE_KEY = 'time_remaining_mode';

/** Interval frequency per mode (ms). Seconds/minutes/hours all use 1000ms for accuracy. */
const MODE_INTERVAL: Record<TimeMode, number> = {
  seconds: 1000,
  minutes: 1000,
  hours:   1000,
  days:    60000,
  weeks:   60000,
};

interface ModeConfig {
  unit: string;
  fontSize: number;
  getValue: (t: ReturnType<typeof getTimeUntilDueMs>) => string;
}

/** All values come from getTimeUntilDueMs() for consistency with the Hero card. */
const MODE_CONFIG: Record<TimeMode, ModeConfig> = {
  days: {
    unit: 'days',
    fontSize: 96,
    getValue: (t) => String(t.days),
  },
  weeks: {
    unit: 'weeks',
    fontSize: 96,
    // Whole weeks only; remainder shown as sub-unit
    getValue: (t) => String(Math.floor(t.days / 7)),
  },
  hours: {
    unit: 'hours',
    fontSize: 64,
    // Total hours remaining
    getValue: (t) => formatLarge(t.days * 24 + t.hours),
  },
  minutes: {
    unit: 'min',
    fontSize: 48,
    getValue: (t) => formatLarge(t.totalMinutes),
  },
  seconds: {
    unit: 'sec',
    fontSize: 36,
    // Total seconds remaining
    getValue: (t) => formatLarge(t.days * 86400 + t.hours * 3600 + t.minutes * 60 + t.seconds),
  },
};

function formatLarge(n: number): string {
  return String(Math.max(0, n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ─── Float animation constants ────────────────────────────────────────────────
const FLOAT_AMPLITUDE = 8;
const FLOAT_DURATION  = 2200;

// ─── Component ───────────────────────────────────────────────────────────────

export default function TimeRemainingCard() {
  const { profile } = useProfile();
  const { colors } = useDesign();
  const reducedMotion = useReducedMotion();
  const countdownStarted = profile.countdownStarted === true;

  const [mode, setMode] = useState<TimeMode>('days');
  const [timeData, setTimeData] = useState(() => getTimeUntilDueMs(profile.dueDate));

  // ── Persist mode ────────────────────────────────────────────────────────
  useEffect(() => {
    loadJSON<TimeMode>(MODE_KEY).then((saved) => {
      if (saved && MODES.includes(saved)) setMode(saved);
    });
  }, []);

  const cycleMode = useCallback(() => {
    setMode((prev) => {
      const next = MODES[(MODES.indexOf(prev) + 1) % MODES.length];
      saveJSON(MODE_KEY, next);
      return next;
    });
  }, []);

  // ── Live interval — updates based on mode granularity ───────────────────
  useEffect(() => {
    if (!countdownStarted) return;

    // Tick immediately on mode change so the value snaps to correct unit at once
    setTimeData(getTimeUntilDueMs(profile.dueDate));

    const interval = setInterval(() => {
      setTimeData(getTimeUntilDueMs(profile.dueDate));
    }, MODE_INTERVAL[mode]);

    return () => clearInterval(interval);
  }, [mode, profile.dueDate, countdownStarted]);

  // ── Floating animation ───────────────────────────────────────────────────
  const floatY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -FLOAT_AMPLITUDE,
          duration: FLOAT_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: FLOAT_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reducedMotion]);

  const cfg = MODE_CONFIG[mode];
  const nextMode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
  const remainderDays = timeData.days % 7;

  return (
    <TouchableOpacity
      onPress={countdownStarted ? cycleMode : undefined}
      activeOpacity={countdownStarted ? 0.75 : 1}
      style={[styles.container, { borderTopColor: colors.accent }]}
    >
      {/* Overline label + tap hint */}
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          TIME REMAINING
        </Text>
        {countdownStarted && (
          <Text style={[styles.tapHint, { color: colors.primary }]}>
            tap · {nextMode}
          </Text>
        )}
      </View>

      {countdownStarted ? (
        <Animated.View
          style={[styles.statRow, { transform: [{ translateY: floatY }] }]}
        >
          <Text
            style={[
              styles.number,
              { color: colors.text, fontSize: cfg.fontSize, lineHeight: cfg.fontSize + 4 },
            ]}
          >
            {cfg.getValue(timeData)}
          </Text>
          <Text style={[styles.unit, { color: colors.primary }]}>
            {cfg.unit}
          </Text>
          {/* weeks: show remainder days */}
          {mode === 'weeks' && remainderDays > 0 && (
            <Text style={[styles.weekRemainder, { color: colors.textSecondary }]}>
              +{remainderDays}d
            </Text>
          )}
        </Animated.View>
      ) : (
        <View style={styles.statRow}>
          <Text style={[styles.numberMuted, { color: colors.accent }]}>—</Text>
          <Text style={[styles.unitMuted, { color: colors.textSecondary }]}>
            Start countdown to see
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.screenH,
    marginTop: 32,
    paddingTop: 24,
    paddingBottom: FLOAT_AMPLITUDE + 12,
    borderTopWidth: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  tapHint: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'lowercase',
    opacity: 0.8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  number: {
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  unit: {
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'lowercase',
  },
  weekRemainder: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 12,
  },
  numberMuted: {
    fontSize: 96,
    fontWeight: '200',
    lineHeight: 100,
  },
  unitMuted: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 14,
    maxWidth: 140,
    lineHeight: 20,
  },
});
