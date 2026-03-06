import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePregnancy } from '../../context/PregnancyContext';
import { useDesign } from '../../context/DesignContext';
import { pickImage, takePhoto } from '../../utils/image';
import { formatDateLabel } from '../../utils/date';
import { Moment } from '../../types/pregnancy';

export default function MilestoneModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    currentPregnancy,
    updateMilestoneWithMoment,
    getMomentsByMilestoneId,
    linkMomentToMilestone,
    updateMoment,
    unlinkMomentFromMilestone,
  } = usePregnancy();
  const { colors } = useDesign();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<'add' | 'link'>('add');
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [editNote, setEditNote] = useState('');

  const milestone = currentPregnancy?.milestones.find((m) => m.id === id);
  const linkedMoments = id ? getMomentsByMilestoneId(id) : [];
  const milestoneDate = milestone?.milestoneDate ?? '';
  /** Only manual moments that can be linked; never milestone-origin (those stay in milestone). */
  const unlinkedMoments = (currentPregnancy?.moments ?? []).filter(
    (m) => m.type === 'moment' && m.origin === 'manual' && !m.linkedMilestoneId
  );

  if (!milestone) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Milestone not found</Text>
      </View>
    );
  }

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri !== null) setImageUri(uri);
  };

  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri !== null) setImageUri(uri);
  };

  const handleSave = () => {
    const content = note.trim() || (imageUri ? 'Photo memory' : 'Note');
    updateMilestoneWithMoment(id, {
      title: content,
      note: content,
      imageUri: imageUri ?? null,
      createdAt: new Date().toISOString(),
    });
    router.back();
  };

  const handleLinkMoment = (momentId: string) => {
    linkMomentToMilestone(momentId, id);
    router.back();
  };

  const showLinkedMomentOptions = (mom: Moment) => {
    const options = ['Cancel', 'Replace image', 'Edit note', 'Remove'];
    const cancelIdx = 0;
    const replaceIdx = 1;
    const editIdx = 2;
    const removeIdx = 3;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIdx },
        (buttonIndex) => {
          if (buttonIndex === replaceIdx) handleReplaceImage(mom);
          else if (buttonIndex === editIdx) {
            setEditingMoment(mom);
            setEditNote(mom.title ?? mom.note ?? '');
          } else if (buttonIndex === removeIdx) handleRemoveContent(mom);
        }
      );
    } else {
      Alert.alert('Edit memory', undefined, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace image', onPress: () => handleReplaceImage(mom) },
        { text: 'Edit note', onPress: () => { setEditingMoment(mom); setEditNote(mom.title ?? mom.note ?? ''); } },
        { text: 'Remove', style: 'destructive', onPress: () => handleRemoveContent(mom) },
      ]);
    }
  };

  const handleReplaceImage = async (mom: Moment) => {
    const uri = await pickImage();
    if (uri !== null) updateMoment(mom.id, { imageUri: uri });
  };

  const handleRemoveContent = (mom: Moment) => {
    Alert.alert(
      'Remove this memory from milestone?',
      'The memory will be unlinked. Content created for this milestone will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => unlinkMomentFromMilestone(mom.id, id) },
      ]
    );
  };

  const handleSaveEdit = () => {
    if (editingMoment) {
      const content = editNote.trim() || (editingMoment.imageUri ? 'Photo memory' : 'Note');
      updateMoment(editingMoment.id, { title: content, note: content });
      setEditingMoment(null);
      setEditNote('');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>{milestone.title}</Text>
      <Text style={[styles.date, { color: colors.textSecondary }]}>
        {formatDateLabel(milestoneDate)}
      </Text>

      {linkedMoments.length > 0 ? (
        <View style={styles.linkedList}>
          {linkedMoments.map((mom) => (
            <View
              key={mom.id}
              style={[styles.linkedCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}
            >
              <View style={styles.linkedCardTopRow}>
                <View style={{ flex: 1 }} />
                {!editingMoment && (
                  <TouchableOpacity
                    onPress={() => showLinkedMomentOptions(mom)}
                    style={[styles.linkedOptionsBtn, { backgroundColor: colors.accent }]}
                  >
                    <Text style={[styles.linkedOptionsText, { color: colors.text }]}>•••</Text>
                  </TouchableOpacity>
                )}
              </View>
              {mom.imageUri && (
                <Image source={{ uri: mom.imageUri }} style={styles.linkedImage} />
              )}
              {editingMoment?.id === mom.id ? (
                <>
                  <TextInput
                    style={[styles.editInput, { color: colors.text, borderColor: colors.accent }]}
                    value={editNote}
                    onChangeText={setEditNote}
                    placeholder="Edit note..."
                    placeholderTextColor={colors.textSecondary}
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity
                      style={[styles.saveEditBtn, { backgroundColor: colors.primary }]}
                      onPress={handleSaveEdit}
                    >
                      <Text style={styles.saveEditText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setEditingMoment(null); setEditNote(''); }}>
                      <Text style={[styles.cancelEdit, { color: colors.textSecondary }]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (mom.title ?? mom.note) ? (
                <Text style={[styles.linkedNote, { color: colors.text }]}>
                  {mom.title ?? mom.note}
                </Text>
              ) : null}
              <Text style={[styles.linkedDate, { color: colors.textSecondary }]}>
                {formatDateLabel(mom.createdAt)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.placeholder, { backgroundColor: colors.accent }]}>
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            No memories linked yet
          </Text>
        </View>
      )}

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'add' && { backgroundColor: colors.primary }]}
          onPress={() => setMode('add')}
        >
          <Text style={[styles.modeText, { color: mode === 'add' ? '#FFF' : colors.text }]}>
            Add memory
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'link' && { backgroundColor: colors.primary }]}
          onPress={() => setMode('link')}
        >
          <Text style={[styles.modeText, { color: mode === 'link' ? '#FFF' : colors.text }]}>
            Link existing moment
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'add' && (
        <>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <View style={[styles.addPlaceholder, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
              <Text style={{ color: colors.textSecondary }}>No photo</Text>
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
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </>
      )}

      {mode === 'link' && (
        <View style={styles.linkSection}>
          {unlinkedMoments.length === 0 ? (
            <Text style={[styles.emptyLink, { color: colors.textSecondary }]}>
              No unlinked moments. Add a moment first from the main Journey screen.
            </Text>
          ) : (
            <>
              {unlinkedMoments.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.linkCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}
                  onPress={() => handleLinkMoment(item.id)}
                  activeOpacity={0.7}
                >
                  {item.imageUri && (
                    <Image source={{ uri: item.imageUri }} style={styles.linkCardImage} />
                  )}
                  <View style={styles.linkCardContent}>
                    <Text style={[styles.linkCardNote, { color: colors.text }]} numberOfLines={2}>
                      {item.title ?? item.note ?? ''}
                    </Text>
                    <Text style={[styles.linkCardDate, { color: colors.textSecondary }]}>
                      {formatDateLabel(item.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  date: { fontSize: 14, marginBottom: 20 },
  linkedList: { marginBottom: 20 },
  linkedCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  linkedCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  linkedImage: { width: '100%', height: 160, borderRadius: 8, marginBottom: 10 },
  linkedOptionsBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  linkedOptionsText: { fontSize: 16, fontWeight: '700' },
  editInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  editButtons: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  saveEditBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  saveEditText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  cancelEdit: { fontSize: 15, paddingVertical: 10 },
  linkedNote: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  linkedDate: { fontSize: 12 },
  placeholder: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderText: { fontSize: 14 },
  modeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  modeBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  modeText: { fontSize: 14, fontWeight: '600' },
  preview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12 },
  addPlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  saveButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontWeight: '700', fontSize: 17 },
  linkSection: { marginTop: 8 },
  emptyLink: { fontSize: 14, paddingVertical: 16 },
  linkCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  linkCardImage: { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  linkCardContent: { flex: 1 },
  linkCardNote: { fontSize: 14, marginBottom: 4 },
  linkCardDate: { fontSize: 12 },
});
