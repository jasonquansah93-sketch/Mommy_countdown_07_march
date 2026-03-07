/**
 * EditorialSectionTitle — klare, ruhige Sektionsüberschriften.
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { EDITORIAL, EDITORIAL_TYPOGRAPHY } from '../../theme/editorialTheme';

interface Props {
  children: string;
}

export default function EditorialSectionTitle({ children }: Props) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    ...EDITORIAL_TYPOGRAPHY.sectionTitle,
    color: EDITORIAL.textSecondary,
    marginBottom: 12,
  },
});
