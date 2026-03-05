import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import { colors } from '../constants/colors';
import { createJourneyVideo } from '../utils/journeyVideo';

const STEPS = [
  'Seitenverhältnis',
  'Bilder',
  'Pro Bild',
  'Filter',
  'Übergang',
  'Trimmen',
  'Erzeugen',
  'Export',
];

const ASPECT_RATIOS = [
  { id: '9:16', label: '9:16 (Reels, Stories)', icon: 'phone-portrait-outline' },
  { id: '16:9', label: '16:9 (Landscape)', icon: 'tv-outline' },
];

const FILTERS = [
  { id: 'none', label: 'Keiner' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'bw', label: 'Schwarz-Weiß' },
  { id: 'vintage', label: 'Vintage' },
];

const TRANSITIONS = [
  { id: 'fade', label: 'Fade' },
  { id: 'wipe', label: 'Wischen' },
  { id: 'zoom', label: 'Zoom' },
];

export default function VideoWizardScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [durations, setDurations] = useState<number[]>([]);
  const [texts, setTexts] = useState<string[]>([]);
  const [cropModes, setCropModes] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('none');
  const [transition, setTransition] = useState<string>('fade');
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState<number | null>(null);
  const [withWatermark] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportDone, setExportDone] = useState(false);

  const totalDuration = useMemo(
    () => durations.reduce((a, b) => a + (b ?? 4), 0),
    [durations]
  );

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung', 'Zugriff auf Fotos erforderlich.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((a) => ({ uri: a.uri }));
      setImages((prev) => [...prev, ...newImages]);
      setDurations((prev) => [...prev, ...new Array(result.assets.length).fill(4)]);
      setTexts((prev) => [...prev, ...new Array(result.assets.length).fill('')]);
      setCropModes((prev) => [...prev, ...new Array(result.assets.length).fill('letterbox')]);
    }
  };

  const updateDuration = (index: number, value: number) => {
    const v = Math.max(2, Math.min(10, value));
    setDurations((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
  };

  const updateText = (index: number, value: string) => {
    setTexts((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const toggleCropMode = (index: number) => {
    setCropModes((prev) => {
      const next = [...prev];
      next[index] = next[index] === 'crop' ? 'letterbox' : 'crop';
      return next;
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setDurations((prev) => prev.filter((_, i) => i !== index));
    setTexts((prev) => prev.filter((_, i) => i !== index));
    setCropModes((prev) => prev.filter((_, i) => i !== index));
  };

  const createVideo = async () => {
    if (images.length === 0) {
      setError('Mindestens ein Foto nötig.');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const result = await createJourneyVideo(
        images.map((i) => i.uri),
        withWatermark,
        {
          aspectRatio,
          durations,
          filter: filter as 'none' | 'sepia' | 'bw' | 'vintage',
          transition: transition as 'fade' | 'wipe' | 'zoom',
          texts: texts.length ? texts : undefined,
          cropModes: cropModes.length ? (cropModes as ('letterbox' | 'crop')[]) : undefined,
          trimStartSeconds: trimStart,
          trimEndSeconds: trimEnd ?? undefined,
        }
      );
      if (result.success) {
        setExportDone(true);
        setStep(8);
      } else {
        setError(result.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Seitenverhältnis wählen</Text>
            <Text style={styles.stepSubtitle}>9:16 für Reels, Stories, TikTok</Text>
            {ASPECT_RATIOS.map((r) => (
              <Pressable
                key={r.id}
                style={[styles.optionCard, aspectRatio === r.id && styles.optionCardSelected]}
                onPress={() => setAspectRatio(r.id as '9:16' | '16:9')}
              >
                <Ionicons
                  name={r.icon as any}
                  size={28}
                  color={aspectRatio === r.id ? colors.primary : colors.text}
                />
                <Text style={[styles.optionLabel, aspectRatio === r.id && styles.optionLabelSelected]}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Bilder auswählen</Text>
            <Text style={styles.stepSubtitle}>Moments oder aus der Galerie</Text>
            <Pressable style={styles.addButton} onPress={pickImages}>
              <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
              <Text style={styles.addButtonText}>Aus Galerie hinzufügen</Text>
            </Pressable>
            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
                {images.map((img, i) => (
                  <View key={i} style={styles.imageItem}>
                    <Image source={{ uri: img.uri }} style={styles.thumb} />
                    <Pressable style={styles.removeBtn} onPress={() => removeImage(i)}>
                      <Ionicons name="close-circle" size={24} color={colors.error} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Pro Bild anpassen</Text>
            <Text style={styles.stepSubtitle}>Text, Dauer und Zuschnitt</Text>
            {images.map((_, i) => (
              <View key={i} style={styles.imageEditCard}>
                <View style={styles.imageEditHeader}>
                  <Text style={styles.imageEditLabel}>Bild {i + 1}</Text>
                  <View style={styles.durationControls}>
                    <Pressable onPress={() => updateDuration(i, (durations[i] ?? 4) - 1)}>
                      <Ionicons name="remove-circle-outline" size={28} color={colors.primary} />
                    </Pressable>
                    <Text style={styles.durationValue}>{durations[i] ?? 4}s</Text>
                    <Pressable onPress={() => updateDuration(i, (durations[i] ?? 4) + 1)}>
                      <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
                    </Pressable>
                  </View>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Text auf Bild (optional)"
                  placeholderTextColor={colors.textMuted}
                  value={texts[i] ?? ''}
                  onChangeText={(v) => updateText(i, v)}
                />
                <Pressable
                  style={styles.cropToggle}
                  onPress={() => toggleCropMode(i)}
                >
                  <Ionicons
                    name={cropModes[i] === 'crop' ? 'crop' : 'resize-outline'}
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.cropToggleText}>
                    {cropModes[i] === 'crop' ? 'Manuell zuschneiden' : 'Automatisch (Letterbox)'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Filter</Text>
            {FILTERS.map((f) => (
              <Pressable
                key={f.id}
                style={[styles.optionCard, filter === f.id && styles.optionCardSelected]}
                onPress={() => setFilter(f.id)}
              >
                <Text style={[styles.optionLabel, filter === f.id && styles.optionLabelSelected]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Übergang</Text>
            {TRANSITIONS.map((t) => (
              <Pressable
                key={t.id}
                style={[styles.optionCard, transition === t.id && styles.optionCardSelected]}
                onPress={() => setTransition(t.id)}
              >
                <Text style={[styles.optionLabel, transition === t.id && styles.optionLabelSelected]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        );
      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Trimmen</Text>
            <Text style={styles.stepSubtitle}>
              Video kürzen (Anfang/Ende). Gesamtlänge: {totalDuration.toFixed(1)}s
            </Text>
            {totalDuration > 1 && (
              <>
                <View style={styles.trimRow}>
                  <Text style={styles.trimLabel}>Start (s)</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={Math.max(0.1, totalDuration - 1)}
                    value={trimStart}
                    onValueChange={setTrimStart}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                  />
                  <Text style={styles.trimValue}>{trimStart.toFixed(1)}</Text>
                </View>
                <View style={styles.trimRow}>
                  <Text style={styles.trimLabel}>Ende (s)</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={Math.max(trimStart + 0.5, 0)}
                    maximumValue={totalDuration}
                    value={trimEnd ?? totalDuration}
                    onValueChange={(v) => setTrimEnd(v)}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                  />
                  <Text style={styles.trimValue}>{(trimEnd ?? totalDuration).toFixed(1)}</Text>
                </View>
              </>
            )}
            {totalDuration <= 1 && (
              <Text style={styles.stepSubtitle}>Füge mehr Bilder hinzu, um zu trimmen.</Text>
            )}
          </View>
        );
      case 7:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Video erzeugen</Text>
            {withWatermark && (
              <View style={styles.watermarkNote}>
                <Ionicons name="information-circle" size={20} color={colors.textSecondary} />
                <Text style={styles.watermarkText}>
                  Mit Wasserzeichen „Mommy Countdown" (Free)
                </Text>
              </View>
            )}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            {isCreating ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <Pressable
                style={styles.createButton}
                onPress={createVideo}
                disabled={images.length === 0}
              >
                <Text style={styles.createButtonText}>Jetzt erstellen</Text>
              </Pressable>
            )}
          </View>
        );
      case 8:
        return (
          <View style={styles.stepContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>Fertig!</Text>
            <Text style={styles.successText}>
              Das Video wurde in deiner Fotos-App gespeichert.
            </Text>
            <Pressable style={styles.createButton} onPress={() => router.back()}>
              <Text style={styles.createButtonText}>Schließen</Text>
            </Pressable>
          </View>
        );
      default:
        return null;
    }
  };

  const maxStep = exportDone ? 8 : 7;
  const showFooter = step < 8 && !(step === 7 && isCreating);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Video erstellen</Text>
        <View style={styles.progress}>
          <Text style={styles.progressText}>
            {step} / {STEPS.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {showFooter && (
        <View style={styles.footer}>
          {step > 1 && step !== 8 && (
            <Pressable style={styles.footerBtn} onPress={() => setStep((s) => s - 1)}>
              <Text style={styles.footerBtnText}>Zurück</Text>
            </Pressable>
          )}
          {step < 7 && (
            <Pressable
              style={[styles.footerBtn, styles.footerBtnPrimary]}
              onPress={() => setStep((s) => s + 1)}
            >
              <Text style={[styles.footerBtnText, styles.footerBtnTextPrimary]}>Weiter</Text>
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  progress: {},
  progressText: { fontSize: 14, color: colors.textMuted },
  body: { flex: 1 },
  bodyContent: { padding: 20, paddingBottom: 24 },
  stepContent: {},
  stepTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 8 },
  stepSubtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: 24 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 12,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  optionLabel: { fontSize: 16, color: colors.text },
  optionLabelSelected: { fontWeight: '600', color: colors.primary },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addButtonText: { fontSize: 16, color: colors.primary, fontWeight: '500' },
  imageList: { marginBottom: 24 },
  imageItem: { marginRight: 12 },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  removeBtn: { position: 'absolute', top: -4, right: -4 },
  imageEditCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageEditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageEditLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  durationControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  durationValue: { fontSize: 16, fontWeight: '600', minWidth: 36, textAlign: 'center' },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  cropToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cropToggleText: { fontSize: 14, color: colors.primary },
  trimRow: { marginBottom: 16 },
  trimLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  slider: { flex: 1, height: 40 },
  trimValue: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  watermarkNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 16,
  },
  watermarkText: { fontSize: 14, color: colors.textSecondary },
  errorBox: {
    padding: 12,
    backgroundColor: `${colors.error}15`,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: { fontSize: 14, color: colors.error },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  successIcon: { alignItems: 'center', marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
  successText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  footerBtnPrimary: { backgroundColor: colors.primary },
  footerBtnText: { fontSize: 16, fontWeight: '600', color: colors.text },
  footerBtnTextPrimary: { color: '#FFF' },
});
