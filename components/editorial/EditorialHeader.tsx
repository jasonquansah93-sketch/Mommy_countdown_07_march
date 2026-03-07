/**
 * EditorialHeader — ruhiger Header mit Brand, ohne harte Linien.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EDITORIAL } from '../../theme/editorialTheme';
import { useRouter } from 'expo-router';

interface Props {
  showSettings?: boolean;
}

export default function EditorialHeader({ showSettings = true }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.left}>
        <View style={styles.heartDot}>
          <Ionicons name="heart" size={14} color={EDITORIAL.primary} />
        </View>
        <Text style={styles.brand}>
          <Text style={styles.brandBold}>Mommy</Text>
          <Text style={styles.brandAccent}>Count</Text>
        </Text>
      </View>
      {showSettings && (
        <TouchableOpacity
          style={styles.gearBtn}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={18} color={EDITORIAL.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heartDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: EDITORIAL.primary + '20',
    borderWidth: 1,
    borderColor: EDITORIAL.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 22,
    letterSpacing: -0.3,
    color: EDITORIAL.text,
  },
  brandBold: {
    fontWeight: '700',
  },
  brandAccent: {
    fontWeight: '300',
    color: EDITORIAL.primary,
  },
  gearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: EDITORIAL.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
