/**
 * EditorialCard — weiche, ruhige Card mit subtilen Rändern.
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { EDITORIAL, EDITORIAL_RADIUS, EDITORIAL_SHADOW } from '../../theme/editorialTheme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export default function EditorialCard({ children, style, padded = true }: Props) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: EDITORIAL.surface,
    borderRadius: EDITORIAL_RADIUS.card,
    borderWidth: 1,
    borderColor: EDITORIAL.border,
    ...EDITORIAL_SHADOW.card,
  },
  padded: {
    padding: 24,
  },
});
