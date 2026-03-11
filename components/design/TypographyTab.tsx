import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDesign } from '../../context/DesignContext';
import { usePremium } from '../../context/PremiumContext';
import { useRouter } from 'expo-router';
import { TYPOGRAPHY_FONTS } from '../../constants/presets';
import { getResolvedFontFamily } from '../../constants/fonts';

const PREVIEW = 'Meeting you in...';

interface FontRowProps {
  fontName: string;
  isSelected: boolean;
  isPremiumLocked: boolean;
  onPress: () => void;
}

function FontRow({ fontName, isSelected, isPremiumLocked, onPress }: FontRowProps) {
  const resolved = getResolvedFontFamily(fontName);
  return (
    <TouchableOpacity
      style={[s.row, isSelected && s.rowActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <LinearGradient
        colors={['rgba(253,247,239,0.97)', 'rgba(244,236,224,0.93)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Text style={s.fontName}>{fontName}</Text>
      <Text
        style={[s.fontPreview, resolved ? { fontFamily: resolved } : undefined]}
        numberOfLines={1}
      >
        {PREVIEW}
      </Text>

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

export default function TypographyTab() {
  const { design, setFont } = useDesign();
  const { isPremium } = usePremium();
  const router = useRouter();

  const freeFonts    = TYPOGRAPHY_FONTS.filter((f) => !f.premium);
  const premiumFonts = TYPOGRAPHY_FONTS.filter((f) => f.premium);

  const handlePress = useCallback((font: typeof TYPOGRAPHY_FONTS[0]) => {
    if (font.premium && !isPremium) {
      router.push('/modal/paywall');
      return;
    }
    setFont(font.name);
  }, [isPremium, router, setFont]);

  return (
    <View>

      {/* ── Free fonts ── */}
      <Text style={s.sectionLabel}>TYPOGRAPHY</Text>
      <Text style={s.sectionDesc}>
        Tap a font to apply it. The preview above updates instantly.
      </Text>

      <View style={s.list}>
        {freeFonts.map((font) => (
          <FontRow
            key={font.name}
            fontName={font.name}
            isSelected={design.fontFamily === font.name}
            isPremiumLocked={false}
            onPress={() => handlePress(font)}
          />
        ))}
      </View>

      <View style={s.hairline} />

      {/* ── Signature Typography (Premium) ── */}
      <View style={s.plusHead}>
        <View style={{ flex: 1 }}>
          <Text style={s.sectionLabel}>SIGNATURE TYPOGRAPHY</Text>
          <Text style={s.plusSubtitle}>Editorial and script fonts for a truly personal look</Text>
        </View>
        <View style={s.plusBadge}>
          <Text style={s.plusBadgeTxt}>✦ Plus</Text>
        </View>
      </View>

      <View style={s.list}>
        {premiumFonts.map((font) => (
          <FontRow
            key={font.name}
            fontName={font.name}
            isSelected={design.fontFamily === font.name}
            isPremiumLocked={!isPremium}
            onPress={() => handlePress(font)}
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
            Unlock all Signature fonts with Plus  →
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

  list: { gap: 10 },

  row: {
    borderRadius: 14, overflow: 'hidden',
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.22)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    position: 'relative',
  },
  rowActive: {
    borderColor: 'rgba(168,126,82,0.50)',
    borderWidth: 1.5,
    shadowOpacity: 0.13,
  },
  fontName: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    color: '#A08C76', marginBottom: 8,
  },
  fontPreview: {
    fontSize: 20, fontWeight: '400', color: '#2C211A', textAlign: 'center',
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
