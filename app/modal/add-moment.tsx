import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePregnancy } from '../../context/PregnancyContext';
import { useDesign } from '../../context/DesignContext';
import { usePremium, FREE_MOMENT_LIMIT } from '../../context/PremiumContext';
import { pickImage, takePhoto } from '../../utils/image';

export default function AddMomentModal() {
  const router = useRouter();
  const { addMoment, getManualMoments } = usePregnancy();
  const { colors } = useDesign();
  const { isPremium } = usePremium();

  // Gate: redirect to paywall if free limit reached
  useEffect(() => {
    if (!isPremium && getManualMoments().length >= FREE_MOMENT_LIMIT) {
      router.replace('/modal/paywall');
    }
  }, []);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [text, setText] = useState('');

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri !== null) setImageUri(uri);
  };

  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri !== null) setImageUri(uri);
  };

  const handleSave = () => {
    const note = text.trim() || (imageUri ? 'My moment' : 'Note');
    addMoment(
      {
        title: note,
        note,
        imageUri: imageUri ?? null,
        createdAt: new Date().toISOString(),
      },
      'manual'
    );
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Add a Moment</Text>

      {imageUri !== null ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: colors.accent }]}>
          <Text style={{ color: colors.textSecondary }}>No photo selected</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handlePickImage}
        >
          <Text style={styles.buttonText}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.secondary }]}
          onPress={handleTakePhoto}
        >
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.accent }]}
        value={text}
        onChangeText={setText}
        placeholder="Add a note or caption..."
        placeholderTextColor={colors.textSecondary}
      />

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save Moment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  preview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  placeholder: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
});
