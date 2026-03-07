/**
 * EditorialButton — dezenter CTA, Sand/Bronze, nicht laut.
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { EDITORIAL, EDITORIAL_RADIUS } from '../../theme/editorialTheme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function EditorialButton({
  label,
  onPress,
  variant = 'primary',
  style,
  fullWidth,
}: Props) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isPrimary && styles.primary,
        !isPrimary && !isGhost && styles.secondary,
        isGhost && styles.ghost,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          isPrimary && styles.labelPrimary,
          !isPrimary && styles.labelSecondary,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: EDITORIAL_RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: EDITORIAL.primary,
  },
  secondary: {
    backgroundColor: EDITORIAL.surfaceMuted,
    borderWidth: 1,
    borderColor: EDITORIAL.borderStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelPrimary: {
    color: '#FFFFFF',
  },
  labelSecondary: {
    color: EDITORIAL.text,
  },
});
