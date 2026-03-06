import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDesign } from '../context/DesignContext';

interface Props {
  percent: number;
  currentWeek: number;
}

export default function ProgressBar({ percent, currentWeek }: Props) {
  const { colors } = useDesign();
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <View style={styles.container}>
      <Text style={[styles.weekText, { color: colors.primary }]}>
        {currentWeek} weeks
      </Text>
      <Text style={[styles.percentText, { color: colors.textSecondary }]}>
        {Math.round(clampedPercent)}% complete
      </Text>
      <View style={[styles.trackOuter, { backgroundColor: colors.accent }]}>
        <View
          style={[
            styles.trackFill,
            {
              backgroundColor: colors.primary,
              width: `${clampedPercent}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 2,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 14,
  },
  trackOuter: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  trackFill: {
    height: 10,
    borderRadius: 5,
  },
});
