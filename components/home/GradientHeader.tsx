/**
 * Cinematic header — transparent over the dark ScreenBackground gradient.
 * No separate background fill; the header floats on top of the canvas.
 * Brand name in theme text color with primary-colored accent on "Count".
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesign } from '../../context/DesignContext';
import { useRouter } from 'expo-router';

export default function GradientHeader() {
  const { colors } = useDesign();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 12,
          borderBottomColor: colors.accent,
        },
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.heartDot, { backgroundColor: colors.primary + '30', borderColor: colors.primary + '60' }]}>
          <Ionicons name="heart" size={14} color={colors.primary} />
        </View>
        <Text style={[styles.brand, { color: colors.text }]}>
          <Text style={styles.brandBold}>Mommy</Text>
          <Text style={[styles.brandAccent, { color: colors.primary }]}>Count</Text>
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.gearBtn, { borderColor: colors.accent, backgroundColor: colors.surface + '80' }]}
        onPress={() => router.push('/(tabs)/profile')}
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heartDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 22,
    letterSpacing: -0.3,
  },
  brandBold: {
    fontWeight: '800',
  },
  brandAccent: {
    fontWeight: '300',
  },
  gearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
