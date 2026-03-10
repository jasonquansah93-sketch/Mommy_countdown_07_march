import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDesign } from '../../context/DesignContext';
import { pickImage } from '../../utils/image';

/* ── Warm editorial slider — no external Slider component needed ── */
interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}
function SliderRow({ label, value, min, max, onChange }: SliderRowProps) {
  const percent = Math.round(((value - min) / (max - min)) * 100);
  const range   = max - min;
  const step    = (dir: number) => {
    const inc  = Math.round(range / 10);
    onChange(Math.min(max, Math.max(min, value + dir * inc)));
  };

  return (
    <View style={s.sliderWrap}>
      <View style={s.sliderLabelRow}>
        <Text style={s.sliderLabel}>{label}</Text>
        <Text style={s.sliderValue}>{value}</Text>
      </View>
      <View style={s.sliderRow}>
        <TouchableOpacity style={s.sliderBtn} onPress={() => step(-1)} activeOpacity={0.7}>
          <Ionicons name="remove" size={16} color="#A08C76" />
        </TouchableOpacity>
        <View style={s.track}>
          <View style={[s.fill, { width: `${percent}%` as any }]} />
        </View>
        <TouchableOpacity style={s.sliderBtn} onPress={() => step(1)} activeOpacity={0.7}>
          <Ionicons name="add" size={16} color="#A08C76" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── Main tab ── */
export default function PhotoFiltersTab() {
  const { design, setBackgroundPhoto, updateDesign } = useDesign();

  const handlePickPhoto = async () => {
    const uri = await pickImage();
    if (uri != null) setBackgroundPhoto(uri);
  };

  return (
    <View>

      {/* ── BACKGROUND PHOTO ── */}
      <Text style={s.sectionLabel}>BACKGROUND PHOTO</Text>
      <Text style={s.sectionDesc}>
        Add a personal photo behind your countdown.
      </Text>

      <TouchableOpacity
        style={s.photoBtn}
        onPress={handlePickPhoto}
        activeOpacity={0.75}
      >
        <LinearGradient
          colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <Ionicons
          name={design.backgroundPhoto != null ? 'image' : 'image-outline'}
          size={22} color="#C09A72"
        />
        <Text style={s.photoBtnTxt}>
          {design.backgroundPhoto != null ? 'Change Photo' : 'Choose Photo'}
        </Text>
      </TouchableOpacity>

      {design.backgroundPhoto != null && (
        <TouchableOpacity
          style={s.removeBtn}
          onPress={() => setBackgroundPhoto(null)}
          activeOpacity={0.7}
        >
          <Text style={s.removeTxt}>Remove Photo</Text>
        </TouchableOpacity>
      )}

      <View style={s.hairline} />

      {/* ── ADJUSTMENTS ── */}
      <Text style={[s.sectionLabel, { marginTop: 16 }]}>ADJUSTMENTS</Text>
      <Text style={s.sectionDesc}>Fine-tune how your background looks.</Text>

      <View style={s.adjustCard}>
        <LinearGradient
          colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <SliderRow
          label="Brightness"
          value={design.brightness}
          min={50} max={150}
          onChange={v => updateDesign({ brightness: v })}
        />
        <SliderRow
          label="Contrast"
          value={design.contrast}
          min={50} max={150}
          onChange={v => updateDesign({ contrast: v })}
        />
        <SliderRow
          label="Saturation"
          value={design.saturation}
          min={0} max={200}
          onChange={v => updateDesign({ saturation: v })}
        />
        <View style={s.lastSlider}>
          <SliderRow
            label="Blur"
            value={design.blur}
            min={0} max={20}
            onChange={v => updateDesign({ blur: v })}
          />
        </View>
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
    marginBottom: 14, letterSpacing: 0.1,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120,90,60,0.20)', marginVertical: 4,
  },

  /* Photo button */
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 14, overflow: 'hidden',
    paddingVertical: 18,
    borderWidth: 1.5, borderStyle: 'dashed',
    borderColor: 'rgba(168,126,82,0.40)',
    marginBottom: 10,
    position: 'relative',
  },
  photoBtnTxt: {
    fontSize: 15, fontWeight: '600', color: '#7A5830', letterSpacing: 0.1,
  },
  removeBtn: {
    alignItems: 'center', paddingVertical: 6, marginBottom: 8,
  },
  removeTxt: {
    fontSize: 13, color: '#B0997E', textDecorationLine: 'underline',
  },

  /* Adjustments card */
  adjustCard: {
    borderRadius: 16, overflow: 'hidden',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4,
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    position: 'relative',
  },
  lastSlider: { marginBottom: 0 },

  /* Slider rows */
  sliderWrap:     { marginBottom: 16 },
  sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sliderLabel:    { fontSize: 13, fontWeight: '500', color: '#5C4030', letterSpacing: 0.1 },
  sliderValue:    { fontSize: 13, fontWeight: '600', color: '#C09A72' },
  sliderRow:      { flexDirection: 'row', alignItems: 'center' },
  sliderBtn: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(192,154,114,0.16)',
    borderWidth: 1, borderColor: 'rgba(168,126,82,0.20)',
  },
  track: {
    flex: 1, height: 5, borderRadius: 2.5,
    marginHorizontal: 10, overflow: 'hidden',
    backgroundColor: 'rgba(180,155,125,0.22)',
  },
  fill: {
    height: 5, borderRadius: 2.5,
    backgroundColor: '#C09A72',
  },
});
