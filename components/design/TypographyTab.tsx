import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesign } from '../../context/DesignContext';
import { PRIMARY_FONTS } from '../../constants/presets';
import { getResolvedFontFamily } from '../../constants/fonts';

const PREVIEW_TEXT = 'Meeting you in...';

export default function TypographyTab() {
  const { design, setFont, colors } = useDesign();

  const handleSelect = useCallback(
    (name: string) => {
      setFont(name);
    },
    [setFont]
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.introTitle, { color: colors.textSecondary }]}>TYPOGRAPHY</Text>
      <Text style={[styles.introDesc, { color: colors.textSecondary }]}>
        Tap a font to apply it. The preview above updates in real time.
      </Text>

      <View style={styles.fontList}>
        {PRIMARY_FONTS.map((font) => {
          const isSelected = design.fontFamily === font.name;
          const resolvedFont = getResolvedFontFamily(font.name);
          return (
            <TouchableOpacity
              key={font.name}
              style={[
                styles.fontRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? colors.primary : colors.accent,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => handleSelect(font.name)}
              activeOpacity={0.7}
            >
              <Text style={[styles.fontLabel, { color: colors.textSecondary }]}>{font.name}</Text>
              <Text
                style={[
                  styles.fontPreview,
                  { color: colors.text },
                  resolvedFont ? { fontFamily: resolvedFont } : undefined,
                ]}
                numberOfLines={1}
              >
                {PREVIEW_TEXT}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.checkIcon} />
              )}
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
  introTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  introDesc: {
    fontSize: 13,
    marginBottom: 20,
  },
  fontList: {
    gap: 12,
  },
  fontRow: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    position: 'relative',
  },
  fontLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fontPreview: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
});
