import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDesign } from '../../context/DesignContext';
import { DESIGN_PRESETS } from '../../constants/presets';
import { THEMES } from '../../constants/themes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePremium } from '../../context/PremiumContext';

/* ── Shared card renderer ── */
interface PresetCardProps {
  preset: typeof DESIGN_PRESETS[0];
  isSelected: boolean;
  isPremiumLocked: boolean;
  onPress: () => void;
}

function PresetCard({ preset, isSelected, isPremiumLocked, onPress }: PresetCardProps) {
  const theme    = THEMES.find((t) => t.id === preset.themeId);
  const swatches = theme
    ? [theme.colors.primary, theme.colors.secondary, theme.colors.accent]
    : [];

  return (
    <TouchableOpacity
      style={[s.card, isSelected && s.cardActive]}
      activeOpacity={0.75}
      onPress={onPress}
    >
      <LinearGradient
        colors={['rgba(253,247,239,0.97)', 'rgba(244,236,224,0.93)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={s.swatchRow}>
        {swatches.map((hex, i) => (
          <View key={i} style={[s.swatch, { backgroundColor: hex }]} />
        ))}
      </View>

      <Text style={s.presetName}>{preset.name}</Text>
      <Text style={s.presetDesc} numberOfLines={1}>{preset.description}</Text>

      {isSelected ? (
        <View style={s.checkBadge}>
          <Ionicons name="checkmark" size={11} color="#FFF8EF" />
        </View>
      ) : isPremiumLocked ? (
        <Text style={s.sparkle}>✦</Text>
      ) : null}
    </TouchableOpacity>
  );
}

function PlusSectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={s.plusHead}>
      <View style={{ flex: 1 }}>
        <Text style={s.sectionLabel}>{title}</Text>
        <Text style={s.plusSubtitle}>{subtitle}</Text>
      </View>
      <View style={s.plusBadge}>
        <Text style={s.plusBadgeTxt}>✦ Plus</Text>
      </View>
    </View>
  );
}

export default function PresetsTab() {
  const { design, setPreset } = useDesign();
  const { isPremium } = usePremium();
  const router = useRouter();

  const freePresets    = DESIGN_PRESETS.filter((p) => !p.premium);
  const premiumPresets = DESIGN_PRESETS.filter((p) => p.premium);

  const handlePress = (preset: typeof DESIGN_PRESETS[0]) => {
    if (preset.premium && !isPremium) {
      router.push('/modal/paywall');
      return;
    }
    setPreset(
      preset.id,
      preset.themeId,
      preset.fontFamily,
      preset.filter,
      preset.hideGenderLabel,
    );
  };

  return (
    <View>
      <Text style={s.sectionLabel}>PRESETS</Text>
      <Text style={s.sectionDesc}>
        Complete looks with one tap. Customise further via Colors or Typography.
      </Text>

      <View style={s.grid}>
        {freePresets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isSelected={design.presetId === preset.id}
            isPremiumLocked={false}
            onPress={() => handlePress(preset)}
          />
        ))}
      </View>

      <View style={s.hairline} />

      <PlusSectionHeader
        title="SIGNATURE COLLECTION"
        subtitle="Curated looks for moments worth remembering"
      />

      <View style={s.grid}>
        {premiumPresets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isSelected={design.presetId === preset.id}
            isPremiumLocked={!isPremium}
            onPress={() => handlePress(preset)}
          />
        ))}
      </View>

      {!isPremium && (
        <TouchableOpacity
          style={s.upgradeRow}
          onPress={() => router.push('/modal/paywall')}
          activeOpacity={0.7}
        >
          <Text style={s.upgradeTxt}>
            Unlock the full Signature Collection with Plus  →
          </Text>
        </TouchableOpacity>
      )}
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
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120,90,60,0.20)',
    marginVertical: 20,
  },

  plusHead: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: 14,
  },
  plusSubtitle: {
    fontSize: 12, color: '#B0997E', marginTop: 3,
    fontFamily: 'Georgia', fontStyle: 'italic',
  },
  plusBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, marginTop: 2,
    backgroundColor: 'rgba(192,154,114,0.13)',
    borderWidth: 0.5, borderColor: 'rgba(168,126,82,0.32)',
  },
  plusBadgeTxt: {
    fontSize: 11, fontWeight: '700',
    color: '#9A7850', letterSpacing: 0.4,
  },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', gap: 10,
  },

  card: {
    width: '48%', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 14,
    minHeight: 92, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.22)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    position: 'relative',
  },
  cardActive: {
    borderColor: 'rgba(168,126,82,0.50)',
    borderWidth: 1.5,
    shadowOpacity: 0.13,
  },

  swatchRow: { flexDirection: 'row', gap: 5, marginBottom: 9 },
  swatch: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  presetName: {
    fontSize: 14, fontWeight: '600', color: '#3A2A1C',
    letterSpacing: -0.1, marginBottom: 2,
  },
  presetDesc: {
    fontSize: 11, color: '#B0997E', lineHeight: 15,
    fontFamily: 'Georgia', fontStyle: 'italic',
  },

  checkBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#C09A72',
    alignItems: 'center', justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute', top: 8, right: 10,
    fontSize: 14, color: '#C09A72',
  },

  upgradeRow: { alignItems: 'center', marginTop: 18, marginBottom: 4 },
  upgradeTxt: {
    fontSize: 12, color: '#B0997E',
    fontFamily: 'Georgia', fontStyle: 'italic', letterSpacing: 0.1,
  },
});
