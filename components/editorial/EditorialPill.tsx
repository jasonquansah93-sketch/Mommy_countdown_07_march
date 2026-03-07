/**
 * EditorialPill — dezentes Tag/Badge (z.B. "IT'S A BOY").
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EDITORIAL, EDITORIAL_RADIUS } from '../../theme/editorialTheme';

interface Props {
  label: string;
  variant?: 'default' | 'muted';
}

export default function EditorialPill({ label, variant = 'default' }: Props) {
  return (
    <View style={[styles.pill, variant === 'muted' && styles.pillMuted]}>
      <Text style={[styles.label, variant === 'muted' && styles.labelMuted]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: EDITORIAL_RADIUS.pill,
    backgroundColor: EDITORIAL.surface,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: EDITORIAL.border,
  },
  pillMuted: {
    backgroundColor: EDITORIAL.surfaceMuted,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: EDITORIAL.text,
  },
  labelMuted: {
    color: EDITORIAL.textSecondary,
  },
});
