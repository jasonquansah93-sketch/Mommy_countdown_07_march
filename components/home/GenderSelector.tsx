import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../context/ProfileContext';
import { useDesign } from '../../context/DesignContext';
import { RADIUS, SPACING, GLASS } from '../../constants/tokens';

const GENDERS: {
  key: 'boy' | 'girl' | 'surprise';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selectedBorder: string;
}[] = [
  { key: 'boy', label: 'BOY', icon: 'male', selectedBorder: '#4FC3F7' },
  { key: 'girl', label: 'GIRL', icon: 'female', selectedBorder: '#E07090' },
  { key: 'surprise', label: 'SURPRISE', icon: 'gift', selectedBorder: '#E07090' },
];

export default function GenderSelector() {
  const { profile, updateProfile } = useProfile();
  const { colors } = useDesign();
  const selected = profile.gender ?? 'surprise';

  return (
    <View style={[styles.card]}>
      <Text style={[styles.title, { color: colors.text }]}>IT'S A...</Text>
      <View style={styles.row}>
        {GENDERS.map((g) => {
          const isSelected = selected === g.key;
          return (
            <TouchableOpacity
              key={g.key}
              style={[
                styles.option,
                {
                  borderColor: isSelected ? g.selectedBorder : colors.accent,
                  backgroundColor: isSelected ? g.selectedBorder + '18' : GLASS.surface,
                  borderWidth: isSelected ? 2 : 1,
                },
                isSelected && {
                  shadowColor: g.selectedBorder,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  elevation: 5,
                },
              ]}
              onPress={() => updateProfile({ gender: g.key })}
              activeOpacity={0.7}
            >
              <Ionicons
                name={g.icon}
                size={30}
                color={isSelected ? g.selectedBorder : colors.textSecondary}
              />
              <Text
                style={[
                  styles.optionLabel,
                  { color: isSelected ? g.selectedBorder : colors.textSecondary },
                ]}
              >
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.screenH,
    marginTop: SPACING.cardGap,
    borderRadius: RADIUS.card,
    padding: SPACING.cardPad,
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.border,
    ...GLASS.shadow,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: RADIUS.inner,
    marginHorizontal: 4,
  },
  optionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 8,
  },
});
