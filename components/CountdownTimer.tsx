import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTimeUntilDue } from '../utils/date';
import { useDesign } from '../context/DesignContext';
import type { TimerDisplayMode } from '../types';

interface Props {
  dueDate: string;
  displayMode?: TimerDisplayMode;
}

interface TimeBlockProps {
  value: number;
  label: string;
  color: string;
  textColor: string;
  wide?: boolean;
}

function getBlocks(
  time: { days: number; hours: number; minutes: number; seconds: number },
  mode: TimerDisplayMode,
): { value: number; label: string; wide?: boolean }[] {
  const totalHours = time.days * 24 + time.hours;
  const totalMinutes = totalHours * 60 + time.minutes;
  const totalSeconds = totalMinutes * 60 + time.seconds;

  switch (mode) {
    case 'hours':
      return [
        { value: totalHours, label: 'Hours', wide: true },
        { value: time.minutes, label: 'Min' },
        { value: time.seconds, label: 'Sec' },
      ];
    case 'minutes':
      return [
        { value: totalMinutes, label: 'Min', wide: true },
        { value: time.seconds, label: 'Sec' },
      ];
    case 'seconds':
      return [{ value: totalSeconds, label: 'Sec', wide: true }];
    case 'milliseconds':
      return [{ value: totalSeconds, label: 'Sec', wide: true }];
    case 'days':
    default:
      return [
        { value: time.days, label: 'Days' },
        { value: time.hours, label: 'Hours' },
        { value: time.minutes, label: 'Min' },
        { value: time.seconds, label: 'Sec' },
      ];
  }
}

export default function CountdownTimer({ dueDate, displayMode = 'days' }: Props) {
  const { colors } = useDesign();
  const [time, setTime] = useState(getTimeUntilDue(dueDate));

  useEffect(() => {
    const ms = displayMode === 'milliseconds' ? 100 : 1000;
    const interval = setInterval(() => {
      setTime(getTimeUntilDue(dueDate));
    }, ms);
    return () => clearInterval(interval);
  }, [dueDate, displayMode]);

  const blocks = getBlocks(time, displayMode);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {blocks.map((block, i) => (
          <React.Fragment key={block.label}>
            {i > 0 ? (
              <Text style={[styles.separator, { color: colors.primary }]}>:</Text>
            ) : null}
            <TimeBlock
              value={block.value}
              label={block.label}
              color={colors.primary}
              textColor={colors.text}
              wide={block.wide === true}
            />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

function TimeBlock({ value, label, color, textColor, wide }: TimeBlockProps) {
  return (
    <View style={[styles.block, wide === true ? styles.blockWide : null]}>
      <Text style={[styles.value, { color }]}>
        {wide === true ? String(value) : String(value).padStart(2, '0')}
      </Text>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  block: {
    alignItems: 'center',
    minWidth: 54,
  },
  blockWide: {
    minWidth: 72,
  },
  value: {
    fontSize: 36,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  separator: {
    fontSize: 32,
    fontWeight: '700',
    marginHorizontal: 2,
    marginBottom: 16,
  },
});
