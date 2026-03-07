/**
 * EditorialScreen — Basis-Container für Editorial-Design-Screens.
 * Warm creme Background, mehr Luft.
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { EDITORIAL } from '../../theme/editorialTheme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function EditorialScreen({ children, style }: Props) {
  return <View style={[styles.root, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: EDITORIAL.background,
  },
});
