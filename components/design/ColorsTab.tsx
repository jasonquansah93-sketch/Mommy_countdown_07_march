import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesign } from '../../context/DesignContext';
import { THEMES } from '../../constants/themes';
import type { TextColorMode } from '../../types';

const TEXT_COLOR_MODES: { id: TextColorMode; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'custom', label: 'Custom' },
];

// 10 colors: neutral + theme mid-tones (matches theme families)
const CUSTOM_TEXT_COLORS: { hex: string; label: string }[] = [
  { hex: '#000000', label: 'Black' },
  { hex: '#333333', label: 'Dark Gray' },
  { hex: '#FFFFFF', label: 'White' },
  { hex: '#E91E8C', label: 'Rose' },
  { hex: '#7C4DFF', label: 'Lavender' },
  { hex: '#0298D1', label: 'Ocean' },
  { hex: '#66BB6A', label: 'Sage' },
  { hex: '#FF9800', label: 'Sunset' },
  { hex: '#C4A77D', label: 'Beige' },
  { hex: '#D4CFC8', label: 'Soft Neutral' },
];

function isLightSwatch(hex: string): boolean {
  const h = hex.toLowerCase();
  return (
    h === '#ffffff' ||
    h === '#f5f5f5' ||
    h === '#e0e0e0' ||
    h === '#999999' ||
    h === '#d4cfc8'
  );
}

const PRESET_THEME_IDS = ['boy', 'girl', 'surprise', 'basic'];
const COLOR_THEME_IDS = ['rose', 'lavender', 'ocean', 'sage', 'sunset'];

// Color shades for each palette - represents the COLOR RANGE within each theme
const COLOR_SHADES: Record<string, string[]> = {
  rose: ['#FFB6D9', '#FF8BBF', '#E91E8C', '#C91A76', '#A01560', '#FF6FB7', '#FF9FCC'],
  lavender: ['#D1C4E9', '#B388FF', '#9575CD', '#7C4DFF', '#651FFF', '#536DFE', '#7E57C2'],
  ocean: ['#B3E5FC', '#81D4FA', '#4FC3F7', '#29B6F6', '#0288D1', '#039BE5', '#03A9F4'],
  sage: ['#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#388E3C', '#2E7D32'],
  sunset: ['#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FF6D00', '#F57C00'],
  boy: ['#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2'],
  girl: ['#F8BBD9', '#F48FB1', '#F06292', '#EC407A', '#E91E63', '#D81B60', '#C2185B'],
  surprise: ['#E6D2B8', '#D4BC96', '#C4A77D', '#B8956A', '#A67C52', '#8B7355', '#6B5344'],
  basic: ['#FFB6D9', '#FF8BBF', '#E91E8C', '#C91A76', '#A01560', '#FF6FB7', '#FF9FCC'],
};

interface ShadePickerProps {
  visible: boolean;
  themeName: string;
  shades: string[];
  currentColor: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

function TextColorSwatch({
  hex,
  isSelected,
  onPress,
}: {
  hex: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const needsDarkCheck = isLightSwatch(hex);
  return (
    <TouchableOpacity
      style={[
        styles.textColorSwatch,
        { backgroundColor: hex },
        isSelected && styles.textColorSwatchSelected,
        isLightSwatch(hex) && styles.textColorSwatchLightBorder,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isSelected && (
        <Ionicons
          name="checkmark"
          size={18}
          color={needsDarkCheck ? '#1a1a1a' : '#FFFFFF'}
        />
      )}
    </TouchableOpacity>
  );
}

function ShadePicker({ visible, themeName, shades, currentColor, onSelect, onClose }: ShadePickerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.shadeModal}>
          <Text style={styles.shadeTitle}>Select a {themeName} shade</Text>
          <Text style={styles.shadeSubtitle}>Tap to apply to your countdown</Text>
          <View style={styles.shadeRow}>
            {shades.map((shade, index) => {
              const isSelected = shade.toLowerCase() === currentColor.toLowerCase();
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.shadeSwatch,
                    { backgroundColor: shade },
                    isSelected && styles.shadeSwatchSelected,
                  ]}
                  onPress={() => {
                    onSelect(shade);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function ColorsTab() {
  const { design, setTheme, setCustomColor, setTextColorMode, setCustomTextColor, colors } = useDesign();
  const [shadePickerVisible, setShadePickerVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<typeof THEMES[0] | null>(null);
  const [textColorExpanded, setTextColorExpanded] = useState(false);

  const handleThemePress = (theme: typeof THEMES[0]) => {
    if (design.themeId === theme.id) {
      setSelectedTheme(theme);
      setShadePickerVisible(true);
    } else {
      setTheme(theme.id);
    }
  };

  const handleShadeSelect = (color: string) => {
    setCustomColor('primary', color);
  };

  const currentTextMode = design.textColorMode ?? 'auto';
  const handleTextColorModePress = (mode: TextColorMode) => {
    if (mode === 'custom') {
      setTextColorMode('custom');
      setTextColorExpanded(true);
    } else {
      setTextColorMode(mode);
    }
  };

  const handleCustomTextColorSelect = (hex: string) => {
    setCustomTextColor(hex);
  };

  const presetThemes = THEMES.filter((t) => PRESET_THEME_IDS.includes(t.id));
  const colorThemes = THEMES.filter((t) => COLOR_THEME_IDS.includes(t.id));

  const renderThemeCard = (theme: (typeof THEMES)[0]) => {
    const isSelected = design.themeId === theme.id;
    const shades = COLOR_SHADES[theme.id] || [theme.colors.primary];
    return (
      <TouchableOpacity
        key={theme.id}
        style={[
          styles.themeCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : colors.accent,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleThemePress(theme)}
        activeOpacity={0.7}
      >
        <View style={styles.swatches}>
          {shades.slice(0, 5).map((shade, idx) => (
            <View
              key={idx}
              style={[
                styles.swatch,
                { backgroundColor: shade },
                design.colors.primary === shade && styles.swatchActive,
              ]}
            />
          ))}
        </View>
        <View style={styles.themeInfo}>
          <Text style={[styles.themeName, { color: theme.colors.text }]}>{theme.name}</Text>
          {isSelected && (
            <Text style={[styles.tapHint, { color: theme.colors.textSecondary }]}>
              Tap for more shades
            </Text>
          )}
        </View>
        {isSelected ? (
          <Ionicons name="chevron-forward" size={22} color={theme.colors.primary} />
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. TEXT COLOR – collapsible, at top directly below tab nav */}
      <TouchableOpacity
        style={[styles.textColorHeader, { borderBottomColor: colors.accent }]}
        onPress={() => setTextColorExpanded((e) => !e)}
        activeOpacity={0.7}
      >
        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>TEXT COLOR</Text>
        <Ionicons
          name={textColorExpanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {textColorExpanded && (
        <View style={styles.textColorExpanded}>
          <Text style={[styles.textColorHint, { color: colors.textSecondary }]}>
            Auto adapts to background. Override for manual control.
          </Text>
          <View style={styles.textColorRow}>
            {TEXT_COLOR_MODES.map((m) => {
              const isSelected = currentTextMode === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.textColorPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.accent,
                    },
                  ]}
                  onPress={() => handleTextColorModePress(m.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.textColorPillText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {currentTextMode === 'custom' && (
            <View style={styles.customPaletteRow}>
              {CUSTOM_TEXT_COLORS.map((c, idx) => (
                <TextColorSwatch
                  key={idx}
                  hex={c.hex}
                  isSelected={
                    (design.customTextColor ?? '#1a1a1a').toLowerCase() === c.hex.toLowerCase()
                  }
                  onPress={() => handleCustomTextColorSelect(c.hex)}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* 2. COLOR THEMES */}
      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>COLOR THEMES</Text>
      <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
        Tap a theme to apply, tap again to customize shades
      </Text>
      {colorThemes.map(renderThemeCard)}

      {/* 3. PRESET THEMES */}
      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>PRESET THEMES</Text>
      <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
        One-tap looks (Boy, Girl, Surprise, Basic)
      </Text>
      {presetThemes.map(renderThemeCard)}

      {/* Shade picker modal */}
      {selectedTheme && (
        <ShadePicker
          visible={shadePickerVisible}
          themeName={selectedTheme.name}
          shades={COLOR_SHADES[selectedTheme.id] || [selectedTheme.colors.primary]}
          currentColor={design.colors.primary}
          onSelect={handleShadeSelect}
          onClose={() => setShadePickerVisible(false)}
        />
      )}
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
    color: '#2D2D2D',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    marginBottom: 16,
    color: '#888',
  },
  sectionTitleSpaced: {
    marginTop: 20,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  swatches: {
    flexDirection: 'row',
    marginRight: 14,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: '#2D2D2D',
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  tapHint: {
    fontSize: 11,
    marginTop: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadeModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  shadeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 4,
  },
  shadeSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 20,
  },
  shadeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  shadeSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  shadeSwatchSelected: {
    borderWidth: 3,
    borderColor: '#2D2D2D',
  },
  lightSwatchBorder: {
    borderColor: 'rgba(0,0,0,0.2)',
  },
  textColorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 0,
    marginBottom: 4,
    borderBottomWidth: 1,
  },
  textColorExpanded: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  textColorHint: {
    fontSize: 13,
    marginBottom: 12,
  },
  textColorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  textColorPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  textColorPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customPaletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  textColorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  textColorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#2D2D2D',
  },
  textColorSwatchLightBorder: {
    borderColor: 'rgba(0,0,0,0.2)',
  },
});
