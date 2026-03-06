import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDesign } from '../../context/DesignContext';
import { DESIGN_PRESETS } from '../../constants/presets';
import { THEMES } from '../../constants/themes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePremium } from '../../context/PremiumContext';

export default function PresetsTab() {
  const { design, setPreset, colors } = useDesign();
  const { isPremium } = usePremium();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PRESETS</Text>
      <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
        Complete looks with one tap. You can still customize colors, fonts, and filters manually.
      </Text>

      <View style={styles.grid}>
        {DESIGN_PRESETS.map((preset) => {
          const isSelected = design.presetId === preset.id;
          const isLocked = preset.premium && !isPremium;
          const theme = THEMES.find((t) => t.id === preset.themeId);
          const swatchColors = theme ? [theme.colors.primary, theme.colors.secondary, theme.colors.accent] : [];
          return (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.presetCard,
                {
                  borderColor: isSelected ? colors.primary : colors.accent,
                  borderWidth: isSelected ? 2 : 1.5,
                  backgroundColor: colors.surface,
                  opacity: isLocked ? 0.7 : 1,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => {
                if (isLocked) {
                  router.push('/modal/paywall');
                  return;
                }
                setPreset(preset.id, preset.themeId, preset.fontFamily, preset.filter, preset.hideGenderLabel);
              }}
            >
              <View style={styles.presetContent}>
                <View style={styles.swatchRow}>
                  {swatchColors.map((hex, i) => (
                    <View key={i} style={[styles.swatchDot, { backgroundColor: hex }]} />
                  ))}
                </View>
                <Text style={[styles.presetName, { color: colors.text }]} numberOfLines={1}>
                  {preset.name}
                </Text>
              </View>
              {isLocked ? (
                <Ionicons name="lock-closed" size={16} color={colors.textSecondary} style={styles.checkIcon} />
              ) : isSelected ? (
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.checkIcon} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetCard: {
    width: '48%',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    minHeight: 80,
    position: 'relative',
  },
  presetContent: {
    flex: 1,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  swatchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  presetName: {
    fontSize: 15,
    fontWeight: '700',
  },
  checkIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
