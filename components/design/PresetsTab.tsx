import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDesign } from '../../context/DesignContext';
import { DESIGN_PRESETS } from '../../constants/presets';
import { THEMES } from '../../constants/themes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePremium } from '../../context/PremiumContext';

export default function PresetsTab() {
  const { design, setPreset } = useDesign();
  const { isPremium } = usePremium();
  const router = useRouter();

  return (
    <View>
      <Text style={s.sectionLabel}>PRESETS</Text>
      <Text style={s.sectionDesc}>
        Complete looks with one tap. Customize further via Colors or Typography.
      </Text>

      <View style={s.grid}>
        {DESIGN_PRESETS.map((preset) => {
          const isSelected = design.presetId === preset.id;
          const isLocked  = preset.premium && !isPremium;
          const theme     = THEMES.find((t) => t.id === preset.themeId);
          const swatches  = theme
            ? [theme.colors.primary, theme.colors.secondary, theme.colors.accent]
            : [];

          return (
            <TouchableOpacity
              key={preset.id}
              style={[s.card, isSelected && s.cardActive, isLocked && s.cardLocked]}
              activeOpacity={0.75}
              onPress={() => {
                if (isLocked) { router.push('/modal/paywall'); return; }
                setPreset(preset.id, preset.themeId, preset.fontFamily, preset.filter, preset.hideGenderLabel);
              }}
            >
              <LinearGradient
                colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />

              {/* Colour swatches */}
              <View style={s.swatchRow}>
                {swatches.map((hex, i) => (
                  <View key={i} style={[s.swatch, { backgroundColor: hex }]} />
                ))}
              </View>

              <Text style={s.presetName}>{preset.name}</Text>

              {isLocked ? (
                <Ionicons name="lock-closed" size={14} color="#B0997E" style={s.badge} />
              ) : isSelected ? (
                <View style={s.checkBadge}>
                  <Ionicons name="checkmark" size={11} color="#FFF8EF" />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  sectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2.0,
    color: '#A08C76', marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13, color: '#9A8472', lineHeight: 19,
    marginBottom: 16, letterSpacing: 0.1,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', gap: 10,
  },
  card: {
    width: '48%', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 14,
    minHeight: 82, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    position: 'relative',
  },
  cardActive: {
    borderColor: 'rgba(168,126,82,0.45)',
    borderWidth: 1.5,
    shadowOpacity: 0.12,
  },
  cardLocked: { opacity: 0.65 },

  swatchRow: { flexDirection: 'row', gap: 5, marginBottom: 10 },
  swatch: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  presetName: {
    fontSize: 14, fontWeight: '600', color: '#3A2A1C', letterSpacing: -0.1,
  },
  badge: { position: 'absolute', top: 10, right: 10 },
  checkBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#C09A72',
    alignItems: 'center', justifyContent: 'center',
  },
});
