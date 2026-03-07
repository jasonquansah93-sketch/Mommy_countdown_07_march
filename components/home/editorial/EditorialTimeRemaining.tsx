/**
 * EditorialTimeRemaining — stark vereinfacht, typografisch, schwebend.
 * Keine große Card: nur "Time remaining", "Tap for weeks", große Zahl + Einheit.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useProfile } from '../../../context/ProfileContext';
import { getTimeUntilDueMs } from '../../../utils/date';
import { loadJSON, saveJSON } from '../../../utils/storage';
import { EDITORIAL } from '../../../theme/editorialTheme';

type TimeMode = 'days' | 'weeks' | 'hours' | 'minutes' | 'seconds';
const MODES: TimeMode[] = ['days', 'weeks', 'hours', 'minutes', 'seconds'];
const MODE_KEY = 'time_remaining_mode';

const MODE_CONFIG: Record<
  TimeMode,
  { unit: string; getValue: (t: ReturnType<typeof getTimeUntilDueMs>) => string }
> = {
  days: { unit: 'days', getValue: (t) => String(t.days) },
  weeks: { unit: 'weeks', getValue: (t) => String(Math.floor(t.days / 7)) },
  hours: {
    unit: 'hours',
    getValue: (t) => String(t.days * 24 + t.hours).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
  },
  minutes: {
    unit: 'min',
    getValue: (t) => String(t.totalMinutes).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
  },
  seconds: {
    unit: 'sec',
    getValue: (t) =>
      String(
        Math.floor(t.days * 86400 + t.hours * 3600 + t.minutes * 60 + t.seconds)
      ).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
  },
};

export default function EditorialTimeRemaining() {
  const { profile } = useProfile();
  const countdownStarted = profile.countdownStarted === true;

  const [mode, setMode] = useState<TimeMode>('days');
  const [timeData, setTimeData] = useState(() => getTimeUntilDueMs(profile.dueDate));

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

  useEffect(() => {
    if (!countdownStarted) return;
    setTimeData(getTimeUntilDueMs(profile.dueDate));
    const interval = setInterval(
      () => setTimeData(getTimeUntilDueMs(profile.dueDate)),
      1000
    );
    return () => clearInterval(interval);
  }, [profile.dueDate, countdownStarted]);

  const cfg = MODE_CONFIG[mode];
  const nextMode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
  const remainderDays = timeData.days % 7;

  return (
    <TouchableOpacity
      onPress={countdownStarted ? cycleMode : undefined}
      activeOpacity={countdownStarted ? 0.8 : 1}
      style={styles.container}
    >
      <Text style={styles.label}>Time remaining</Text>
      {countdownStarted && (
        <Text style={styles.tapHint}>Tap for {nextMode}</Text>
      )}

      {countdownStarted ? (
        <View style={styles.statRow}>
          <Text style={styles.number}>{cfg.getValue(timeData)}</Text>
          <Text style={styles.unit}>{cfg.unit}</Text>
          {mode === 'weeks' && remainderDays > 0 && (
            <Text style={styles.remainder}>+{remainderDays} days</Text>
          )}
        </View>
      ) : (
        <View style={styles.statRow}>
          <Text style={styles.muted}>—</Text>
          <Text style={styles.mutedSub}>Start countdown to see</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 48,
    paddingVertical: 20,
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: EDITORIAL.textSecondary,
    marginBottom: 4,
  },
  tapHint: {
    fontSize: 11,
    fontWeight: '500',
    color: EDITORIAL.textSecondary,
    marginBottom: 20,
    opacity: 0.75,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  number: {
    fontSize: 56,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
    color: EDITORIAL.text,
  },
  unit: {
    fontSize: 22,
    fontWeight: '300',
    color: EDITORIAL.textSecondary,
    marginBottom: 4,
  },
  remainder: {
    fontSize: 14,
    fontWeight: '400',
    color: EDITORIAL.textSecondary,
    marginBottom: 6,
    opacity: 0.85,
  },
  muted: {
    fontSize: 56,
    fontWeight: '200',
    color: EDITORIAL.textMuted,
  },
  mutedSub: {
    fontSize: 14,
    fontWeight: '400',
    color: EDITORIAL.textSecondary,
    marginBottom: 6,
    maxWidth: 160,
  },
});
