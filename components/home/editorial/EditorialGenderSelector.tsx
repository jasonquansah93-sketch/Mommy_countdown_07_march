/**
 * EditorialGenderSelector — Icons über Labels, vertikale Karten, weiche Materialität.
 * Mock-up-fidel: Icon oben, Label darunter, gewählte Option mit subtil dunklerem Rahmen.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../../context/ProfileContext';
import { EDITORIAL, EDITORIAL_RADIUS } from '../../../theme/editorialTheme';

const GENDERS: { key: 'boy' | 'girl' | 'surprise'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'boy', label: 'Boy', icon: 'male' },
  { key: 'girl', label: 'Girl', icon: 'female' },
  { key: 'surprise', label: 'Surprise', icon: 'gift' },
];

export default function EditorialGenderSelector() {
  const { profile, updateProfile } = useProfile();
  const selected = profile.gender ?? 'surprise';

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>It's a...</Text>
      <View style={styles.row}>
        {GENDERS.map((g) => {
          const isSelected = selected === g.key;
          return (
            <TouchableOpacity
              key={g.key}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => updateProfile({ gender: g.key })}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={g.icon}
                  size={28}
                  color={isSelected ? EDITORIAL.primary : EDITORIAL.textMuted}
                />
              </View>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
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
  section: {
    marginHorizontal: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: EDITORIAL.textSecondary,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 12,
    borderRadius: EDITORIAL_RADIUS.card,
    backgroundColor: EDITORIAL.surfaceMuted,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(184,160,136,0.4)',
    borderWidth: 1.5,
  },
  iconWrap: {
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: EDITORIAL.textMuted,
  },
  optionLabelSelected: {
    color: EDITORIAL.primary,
  },
});
