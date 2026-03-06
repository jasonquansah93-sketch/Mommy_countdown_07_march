import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesign } from '../../context/DesignContext';
import { useRouter } from 'expo-router';

export default function DesignHeader() {
  const { colors } = useDesign();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, { paddingTop: insets.top + 8 }]}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.center}>
        <Text style={styles.title}>Design Your Countdown</Text>
        <Text style={styles.subtitle}>Make it truly yours</Text>
      </View>
      <TouchableOpacity
        style={styles.infoBtn}
        onPress={() => Alert.alert(
          'Design Tips',
          'Customize your countdown with presets, colors, fonts, and photo filters. Changes apply instantly and are saved automatically.'
        )}
      >
        <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },
  infoBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
