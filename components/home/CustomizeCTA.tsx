import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDesign } from '../../context/DesignContext';
import GradientButton from './GradientButton';
import { RADIUS, SPACING, GLASS } from '../../constants/tokens';

export default function CustomizeCTA() {
  const { colors } = useDesign();
  const router = useRouter();

  return (
    <View style={[styles.card]}>
      <Text style={[styles.title, { color: colors.text }]}>MAKE IT TRULY YOURS</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Personalize your countdown with fonts, colors, and photos
      </Text>
      <GradientButton
        title="CUSTOMIZE DESIGN"
        icon="pencil"
        onPress={() => router.push('/(tabs)/design')}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.screenH,
    marginTop: SPACING.cardGap,
    marginBottom: 100,
    borderRadius: RADIUS.card,
    padding: SPACING.cardPad,
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.border,
    ...GLASS.shadow,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 22,
  },
  button: {
    width: '100%',
  },
});
