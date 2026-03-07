/**
 * EditorialCustomizeCTA — ruhiger CTA, weniger laut.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EDITORIAL, EDITORIAL_RADIUS, EDITORIAL_SHADOW } from '../../../theme/editorialTheme';

export default function EditorialCustomizeCTA() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Make it truly yours</Text>
      <Text style={styles.subtitle}>
        Personalize your countdown with fonts, colors, and photos
      </Text>
      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => router.push('/(tabs)/design')}
        activeOpacity={0.8}
      >
        <Ionicons name="pencil" size={18} color="#FFFFFF" />
        <Text style={styles.ctaText}>Customize design</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 100,
    padding: 28,
    backgroundColor: EDITORIAL.surfaceMuted,
    borderRadius: EDITORIAL_RADIUS.card,
    borderWidth: 0,
    ...EDITORIAL_SHADOW.subtle,
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    color: EDITORIAL.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: EDITORIAL.textSecondary,
    marginBottom: 24,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: EDITORIAL_RADIUS.button,
    backgroundColor: EDITORIAL.primary,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
