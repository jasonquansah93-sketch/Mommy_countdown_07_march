import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDesign } from '../../context/DesignContext';
import { THEMES } from '../../constants/themes';
import type { TextColorMode } from '../../types';

const TEXT_COLOR_MODES: { id: TextColorMode; label: string }[] = [
  { id: 'auto',   label: 'Auto'   },
  { id: 'light',  label: 'Light'  },
  { id: 'dark',   label: 'Dark'   },
  { id: 'custom', label: 'Custom' },
];

const CUSTOM_TEXT_COLORS: { hex: string; label: string }[] = [
  { hex: '#000000', label: 'Black'        },
  { hex: '#333333', label: 'Dark Gray'    },
  { hex: '#FFFFFF', label: 'White'        },
  { hex: '#E91E8C', label: 'Rose'         },
  { hex: '#7C4DFF', label: 'Lavender'     },
  { hex: '#0298D1', label: 'Ocean'        },
  { hex: '#66BB6A', label: 'Sage'         },
  { hex: '#FF9800', label: 'Sunset'       },
  { hex: '#C4A77D', label: 'Beige'        },
  { hex: '#D4CFC8', label: 'Soft Neutral' },
];

function isLightSwatch(hex: string) {
  return ['#ffffff','#f5f5f5','#e0e0e0','#999999','#d4cfc8'].includes(hex.toLowerCase());
}

const PRESET_THEME_IDS = ['boy', 'girl', 'surprise', 'basic'];
const COLOR_THEME_IDS  = ['rose', 'lavender', 'ocean', 'sage', 'sunset'];

const COLOR_SHADES: Record<string, string[]> = {
  rose:     ['#FFB6D9','#FF8BBF','#E91E8C','#C91A76','#A01560','#FF6FB7','#FF9FCC'],
  lavender: ['#D1C4E9','#B388FF','#9575CD','#7C4DFF','#651FFF','#536DFE','#7E57C2'],
  ocean:    ['#B3E5FC','#81D4FA','#4FC3F7','#29B6F6','#0288D1','#039BE5','#03A9F4'],
  sage:     ['#C8E6C9','#A5D6A7','#81C784','#66BB6A','#4CAF50','#388E3C','#2E7D32'],
  sunset:   ['#FFE0B2','#FFCC80','#FFB74D','#FFA726','#FF9800','#FF6D00','#F57C00'],
  boy:      ['#BBDEFB','#90CAF9','#64B5F6','#42A5F5','#2196F3','#1E88E5','#1976D2'],
  girl:     ['#F8BBD9','#F48FB1','#F06292','#EC407A','#E91E63','#D81B60','#C2185B'],
  surprise: ['#E6D2B8','#D4BC96','#C4A77D','#B8956A','#A67C52','#8B7355','#6B5344'],
  basic:    ['#FFB6D9','#FF8BBF','#E91E8C','#C91A76','#A01560','#FF6FB7','#FF9FCC'],
};

interface ShadePickerProps {
  visible: boolean; themeName: string; shades: string[];
  currentColor: string; onSelect: (c: string) => void; onClose: () => void;
}
function ShadePicker({ visible, themeName, shades, currentColor, onSelect, onClose }: ShadePickerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <View style={s.shadeModal}>
          <Text style={s.shadeTitle}>Select a {themeName} shade</Text>
          <Text style={s.shadeHint}>Tap to apply to your countdown</Text>
          <View style={s.shadeRow}>
            {shades.map((shade, i) => {
              const sel = shade.toLowerCase() === currentColor.toLowerCase();
              return (
                <TouchableOpacity
                  key={i}
                  style={[s.shadeSwatch, { backgroundColor: shade }, sel && s.shadeSwatchSel]}
                  onPress={() => { onSelect(shade); onClose(); }}
                  activeOpacity={0.7}
                >
                  {sel && <Ionicons name="checkmark" size={20} color="#FFF" />}
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
  const { design, setTheme, setCustomColor, setTextColorMode, setCustomTextColor } = useDesign();
  const [shadeVisible, setShadeVisible]       = useState(false);
  const [selectedTheme, setSelectedTheme]     = useState<typeof THEMES[0] | null>(null);
  const [textExpanded, setTextExpanded]        = useState(false);

  const handleThemePress = (theme: typeof THEMES[0]) => {
    if (design.themeId === theme.id) { setSelectedTheme(theme); setShadeVisible(true); }
    else setTheme(theme.id);
  };

  const currentTextMode = design.textColorMode ?? 'auto';

  const presetThemes = THEMES.filter(t => PRESET_THEME_IDS.includes(t.id));
  const colorThemes  = THEMES.filter(t => COLOR_THEME_IDS.includes(t.id));

  const renderThemeCard = (theme: typeof THEMES[0]) => {
    const isSel   = design.themeId === theme.id;
    const shades  = COLOR_SHADES[theme.id] || [theme.colors.primary];
    return (
      <TouchableOpacity
        key={theme.id}
        style={[s.themeCard, isSel && s.themeCardSel]}
        onPress={() => handleThemePress(theme)}
        activeOpacity={0.75}
      >
        <LinearGradient
          colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={s.swatches}>
          {shades.slice(0, 5).map((shade, i) => (
            <View
              key={i}
              style={[
                s.swatch, { backgroundColor: shade },
                design.colors.primary === shade && s.swatchActive,
              ]}
            />
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.themeName}>{theme.name}</Text>
          {isSel && <Text style={s.tapHint}>Tap for more shades</Text>}
        </View>
        {isSel && <Ionicons name="chevron-forward" size={18} color="#C09A72" />}
      </TouchableOpacity>
    );
  };

  return (
    <View>

      {/* TEXT COLOR — collapsible */}
      <TouchableOpacity
        style={s.textColorHeader}
        onPress={() => setTextExpanded(e => !e)}
        activeOpacity={0.7}
      >
        <Text style={s.sectionLabel}>TEXT COLOR</Text>
        <Ionicons
          name={textExpanded ? 'chevron-up' : 'chevron-down'}
          size={18} color="#B0997E"
        />
      </TouchableOpacity>

      {textExpanded && (
        <View style={s.textExpanded}>
          <Text style={s.sectionDesc}>Auto adapts to background. Override for manual control.</Text>
          <View style={s.modeRow}>
            {TEXT_COLOR_MODES.map(m => {
              const isSel = currentTextMode === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[s.modePill, isSel && s.modePillActive]}
                  onPress={() => {
                    setTextColorMode(m.id);
                    if (m.id === 'custom') setTextExpanded(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[s.modePillTxt, isSel && s.modePillTxtActive]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {currentTextMode === 'custom' && (
            <View style={s.swatchPaletteRow}>
              {CUSTOM_TEXT_COLORS.map((c, i) => {
                const isSel = (design.customTextColor ?? '#1a1a1a').toLowerCase() === c.hex.toLowerCase();
                const light = isLightSwatch(c.hex);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      s.txtSwatch, { backgroundColor: c.hex },
                      isSel && s.txtSwatchSel,
                      light && s.txtSwatchLight,
                    ]}
                    onPress={() => setCustomTextColor(c.hex)}
                    activeOpacity={0.7}
                  >
                    {isSel && <Ionicons name="checkmark" size={16} color={light ? '#1a1a1a' : '#FFF'} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      <View style={s.hairline} />

      {/* COLOR THEMES */}
      <Text style={[s.sectionLabel, { marginTop: 16, marginBottom: 4 }]}>COLOR THEMES</Text>
      <Text style={s.sectionDesc}>Tap to apply, tap again to choose a shade</Text>
      {colorThemes.map(renderThemeCard)}

      <View style={s.hairline} />

      {/* PRESET THEMES */}
      <Text style={[s.sectionLabel, { marginTop: 16, marginBottom: 4 }]}>PRESET THEMES</Text>
      <Text style={s.sectionDesc}>One-tap looks — Boy, Girl, Surprise, Basic</Text>
      {presetThemes.map(renderThemeCard)}

      {selectedTheme && (
        <ShadePicker
          visible={shadeVisible}
          themeName={selectedTheme.name}
          shades={COLOR_SHADES[selectedTheme.id] || [selectedTheme.colors.primary]}
          currentColor={design.colors.primary}
          onSelect={color => setCustomColor('primary', color)}
          onClose={() => setShadeVisible(false)}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  sectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2.0, color: '#A08C76',
  },
  sectionDesc: {
    fontSize: 13, color: '#9A8472', lineHeight: 19, marginBottom: 14, letterSpacing: 0.1,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120,90,60,0.20)', marginVertical: 4,
  },

  /* Text color */
  textColorHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, marginBottom: 4,
  },
  textExpanded: { paddingBottom: 8 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  modePill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.30)',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  modePillActive: {
    backgroundColor: 'rgba(192,154,114,0.22)',
    borderColor: 'rgba(168,126,82,0.45)',
  },
  modePillTxt:       { fontSize: 13, fontWeight: '500', color: '#9A8472' },
  modePillTxtActive: { color: '#7A5830', fontWeight: '700' },

  swatchPaletteRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  txtSwatch: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)',
  },
  txtSwatchSel:   { borderWidth: 2.5, borderColor: '#7A5830' },
  txtSwatchLight: { borderColor: 'rgba(0,0,0,0.20)' },

  /* Theme cards */
  themeCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, overflow: 'hidden',
    paddingHorizontal: 14, paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  themeCardSel: {
    borderColor: 'rgba(168,126,82,0.45)', borderWidth: 1.5,
    shadowOpacity: 0.12,
  },
  swatches: { flexDirection: 'row', marginRight: 12, gap: 4 },
  swatch: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  swatchActive: { borderWidth: 2, borderColor: '#7A5830' },
  themeName: { fontSize: 15, fontWeight: '600', color: '#3A2A1C', letterSpacing: -0.1 },
  tapHint:   { fontSize: 11, color: '#B0997E', marginTop: 2 },

  /* Shade picker modal */
  overlay: {
    flex: 1, backgroundColor: 'rgba(44,33,26,0.50)',
    justifyContent: 'center', alignItems: 'center',
  },
  shadeModal: {
    backgroundColor: 'rgba(253,247,239,0.98)', borderRadius: 22,
    padding: 24, width: '85%', alignItems: 'center',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  shadeTitle: {
    fontSize: 18, fontWeight: '600', color: '#2C211A',
    fontFamily: 'Georgia', fontStyle: 'italic', marginBottom: 4,
  },
  shadeHint:  { fontSize: 12, color: '#9A8472', marginBottom: 20 },
  shadeRow:   { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  shadeSwatch: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)',
  },
  shadeSwatchSel: { borderWidth: 3, borderColor: '#7A5830' },
});
