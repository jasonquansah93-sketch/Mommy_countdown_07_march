import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Milestone } from '../types';
import { useDesign } from '../context/DesignContext';

interface Props {
  milestone: Milestone;
  isReached: boolean;
}

export default function MilestoneCard({ milestone, isReached }: Props) {
  const { colors } = useDesign();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, opacity: isReached ? 1 : 0.5 }]}>
      <View style={[styles.iconCircle, { backgroundColor: isReached ? colors.primary : colors.accent }]}>
        <Ionicons
          name={milestone.icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={isReached ? '#FFFFFF' : colors.textSecondary}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{milestone.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{milestone.description}</Text>
        <Text style={[styles.week, { color: colors.primary }]}>Week {milestone.week}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    marginTop: 2,
  },
  week: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
