import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesign } from '../../context/DesignContext';
import { usePremium } from '../../context/PremiumContext';
import { PRIMARY_FONTS, SCRIPT_FONTS, ELEGANT_FONTS } from '../../constants/presets';
import { useRouter } from 'expo-router';

interface FontDef {
  name: string;
  premium: boolean;
}

interface FontSectionProps {
  title: string;
  fonts: FontDef[];
  designFont: string;
  onSelect: (name: string, premium: boolean) => void;
  colors: { primary: string; text: string; textSecondary: string };
  isPremium: boolean;
  defaultExpanded?: boolean;
}

function FontSection({
  title,
  fonts,
  designFont,
  onSelect,
  colors,
  isPremium,
  defaultExpanded = true,
}: FontSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={[styles.section, { borderBottomColor: colors.textSecondary + '30' }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.7}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.pillRow}>
          {fonts.map((f) => {
            const isSelected = designFont === f.name;
            const isLocked = f.premium && !isPremium;
            return (
              <TouchableOpacity
                key={f.name}
                style={[
                  styles.pill,
                  isSelected
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0' },
                ]}
                onPress={() => onSelect(f.name, f.premium)}
                activeOpacity={0.7}
                disabled={isLocked}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {f.name}
                </Text>
                {isLocked ? (
                  <Ionicons
                    name="lock-closed"
                    size={12}
                    color={isSelected ? '#FFF' : '#AAA'}
                    style={styles.lockIcon}
                  />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function TypographyTab() {
  const { design, setFont, colors } = useDesign();
  const { isPremium } = usePremium();
  const router = useRouter();

  const handleSelect = useCallback(
    (name: string, premium: boolean) => {
      if (premium && !isPremium) {
        router.push('/modal/paywall');
        return;
      }
      setFont(name);
    },
    [setFont, isPremium, router]
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.introTitle, { color: colors.textSecondary }]}>TYPOGRAPHY</Text>
      <Text style={[styles.introDesc, { color: colors.textSecondary }]}>
        Tap a font to apply it instantly. The preview above updates in real time.
      </Text>

      <FontSection
        title="Sans Serif"
        fonts={PRIMARY_FONTS.map((f) => ({ name: f.name, premium: f.premium }))}
        designFont={design.fontFamily}
        onSelect={handleSelect}
        colors={colors}
        isPremium={isPremium ?? false}
        defaultExpanded={true}
      />

      <FontSection
        title="Script"
        fonts={SCRIPT_FONTS.map((f) => ({ name: f.name, premium: f.premium }))}
        designFont={design.fontFamily}
        onSelect={handleSelect}
        colors={colors}
        isPremium={isPremium ?? false}
        defaultExpanded={false}
      />

      <FontSection
        title="Elegant Serif"
        fonts={ELEGANT_FONTS.map((f) => ({ name: f.name, premium: f.premium }))}
        designFont={design.fontFamily}
        onSelect={handleSelect}
        colors={colors}
        isPremium={isPremium ?? false}
        defaultExpanded={false}
      />
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
  section: {
    borderBottomWidth: 1,
    paddingBottom: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  lockIcon: {
    marginLeft: 6,
  },
});
