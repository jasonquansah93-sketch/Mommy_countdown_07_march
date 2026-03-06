import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../types';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  colors: ThemeColors;
  onChange: (value: number) => void;
}

export default function Slider({ label, value, min, max, colors, onChange }: Props) {
  const percent = Math.round(((value - min) / (max - min)) * 100);

  const step = (direction: number) => {
    const range = max - min;
    const increment = Math.round(range / 10);
    const next = Math.min(max, Math.max(min, value + direction * increment));
    onChange(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.primary }]}>{value}</Text>
      </View>
      <View style={styles.sliderRow}>
        <TouchableOpacity onPress={() => step(-1)} style={styles.btn}>
          <Ionicons name="remove" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={[styles.track, { backgroundColor: colors.accent }]}>
          <View style={[styles.fill, { backgroundColor: colors.primary, width: `${percent}%` }]} />
        </View>
        <TouchableOpacity onPress={() => step(1)} style={styles.btn}>
          <Ionicons name="add" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
});
