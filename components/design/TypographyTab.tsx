import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDesign } from '../../context/DesignContext';
import { TYPOGRAPHY_FONTS } from '../../constants/presets';
import { getResolvedFontFamily } from '../../constants/fonts';

const PREVIEW = 'Meeting you in...';

export default function TypographyTab() {
  const { design, setFont } = useDesign();

  const handleSelect = useCallback((name: string) => setFont(name), [setFont]);

  return (
    <View>
      <Text style={s.sectionLabel}>TYPOGRAPHY</Text>
      <Text style={s.sectionDesc}>
        Tap a font to apply it. The preview above updates instantly.
      </Text>

      <View style={s.list}>
        {TYPOGRAPHY_FONTS.map((font) => {
          const isSel      = design.fontFamily === font.name;
          const resolved   = getResolvedFontFamily(font.name);
          return (
            <TouchableOpacity
              key={font.name}
              style={[s.row, isSel && s.rowActive]}
              onPress={() => handleSelect(font.name)}
              activeOpacity={0.75}
            >
              <LinearGradient
                colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />

              <Text style={s.fontName}>{font.name}</Text>
              <Text
                style={[s.fontPreview, resolved ? { fontFamily: resolved } : undefined]}
                numberOfLines={1}
              >
                {PREVIEW}
              </Text>

              {isSel && (
                <View style={s.checkBadge}>
                  <Ionicons name="checkmark" size={11} color="#FFF8EF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  sectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2.0, color: '#A08C76', marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13, color: '#9A8472', lineHeight: 19, marginBottom: 16, letterSpacing: 0.1,
  },
  list: { gap: 10 },
  row: {
    borderRadius: 14, overflow: 'hidden',
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    position: 'relative',
  },
  rowActive: {
    borderColor: 'rgba(168,126,82,0.45)', borderWidth: 1.5,
    shadowOpacity: 0.12,
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
});
