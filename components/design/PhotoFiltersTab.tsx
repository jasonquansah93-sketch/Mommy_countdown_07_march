import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesign } from '../../context/DesignContext';
import { pickImage } from '../../utils/image';
import Slider from '../../components/design/Slider';

export default function PhotoFiltersTab() {
  const { design, setBackgroundPhoto, updateDesign, colors } = useDesign();

  const handlePickPhoto = async () => {
    const uri = await pickImage();
    if (uri != null) {
      setBackgroundPhoto(uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background photo */}
      <Text style={styles.sectionTitle}>BACKGROUND PHOTO</Text>
      <TouchableOpacity
        style={[styles.photoBtn, { borderColor: colors.accent }]}
        onPress={handlePickPhoto}
        activeOpacity={0.7}
      >
        <Ionicons name="image-outline" size={22} color={colors.primary} />
        <Text style={[styles.photoBtnText, { color: colors.primary }]}>
          {design.backgroundPhoto != null ? 'Change Photo' : 'Choose Photo'}
        </Text>
      </TouchableOpacity>
      {design.backgroundPhoto != null ? (
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => setBackgroundPhoto(null)}
        >
          <Text style={[styles.removeBtnText, { color: colors.textSecondary }]}>Remove Photo</Text>
        </TouchableOpacity>
      ) : null}

      {/* Adjustments */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>ADJUSTMENTS</Text>

      <Slider
        label="Brightness"
        value={design.brightness}
        min={50}
        max={150}
        colors={colors}
        onChange={(v) => updateDesign({ brightness: v })}
      />
      <Slider
        label="Contrast"
        value={design.contrast}
        min={50}
        max={150}
        colors={colors}
        onChange={(v) => updateDesign({ contrast: v })}
      />
      <Slider
        label="Saturation"
        value={design.saturation}
        min={0}
        max={200}
        colors={colors}
        onChange={(v) => updateDesign({ saturation: v })}
      />
      <Slider
        label="Blur"
        value={design.blur}
        min={0}
        max={20}
        colors={colors}
        onChange={(v) => updateDesign({ blur: v })}
      />
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
    marginBottom: 10,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 16,
  },
  photoBtnText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  removeBtn: {
    alignItems: 'center',
    marginTop: 8,
  },
  removeBtnText: {
    fontSize: 13,
  },
});
