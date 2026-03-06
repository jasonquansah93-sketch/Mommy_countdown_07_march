import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePregnancy } from '../../context/PregnancyContext';
import { useDesign } from '../../context/DesignContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { formatDateLabel } from '../../utils/date';
import { pickImage, takePhoto } from '../../utils/image';
import MomentOptionsBottomSheet from '../../components/MomentOptionsBottomSheet';
import DatePickerModal from '../../components/DatePickerModal';

export default function MomentDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getMomentById, removeMoment, restoreMoment, updateMoment } = usePregnancy();
  const { showSnackbar } = useSnackbar();
  const { colors } = useDesign();
  const moment = id ? getMomentById(id) : null;
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editImageUri, setEditImageUri] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const handleOptionsPress = () => {
    setBottomSheetVisible(true);
  };

  const handleEditPress = () => {
    if (!moment) return;
    setEditImageUri(moment.imageUri ?? null);
    setEditTitle(moment.title ?? moment.note ?? '');
    setEditNote(moment.note ?? moment.title ?? '');
    setEditDate(new Date(moment.createdAt));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!moment) return;
    const title = editTitle.trim() || editNote.trim() || (editImageUri ? 'Photo memory' : 'Note');
    const note = editNote.trim() || title;
    updateMoment(moment.id, {
      title,
      note,
      imageUri: editImageUri,
      createdAt: editDate.toISOString(),
    });
    setIsEditing(false);
  };

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri !== null) setEditImageUri(uri);
  };

  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri !== null) setEditImageUri(uri);
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete this moment?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (!moment) return;
            const deleted = { ...moment };
            removeMoment(moment.id);
            showSnackbar('Moment deleted', () => restoreMoment(deleted));
            router.back();
          },
        },
      ]
    );
  };

  if (!moment) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Moment not found</Text>
      </View>
    );
  }

  if (isEditing) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.editContent}
      >
        <Text style={[styles.editTitle, { color: colors.text }]}>Edit Moment</Text>
        {editImageUri ? (
          <Image source={{ uri: editImageUri }} style={styles.editPreview} />
        ) : (
          <View style={[styles.editPlaceholder, { backgroundColor: colors.accent }]}>
            <Text style={{ color: colors.textSecondary }}>No photo selected</Text>
          </View>
        )}
        <View style={styles.editButtonRow}>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={handlePickImage}
          >
            <Text style={styles.editButtonText}>Library</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.secondary }]}
            onPress={handleTakePhoto}
          >
            <Text style={styles.editButtonText}>Camera</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.editInput, { color: colors.text, borderColor: colors.accent }]}
          value={editTitle}
          onChangeText={setEditTitle}
          placeholder="Title..."
          placeholderTextColor={colors.textSecondary}
        />
        <TextInput
          style={[styles.editInput, styles.editNoteInput, { color: colors.text, borderColor: colors.accent }]}
          value={editNote}
          onChangeText={setEditNote}
          placeholder="Note or caption..."
          placeholderTextColor={colors.textSecondary}
          multiline
        />
        <TouchableOpacity
          style={[styles.dateRow, { backgroundColor: colors.surface, borderColor: colors.accent }]}
          onPress={() => setDatePickerVisible(true)}
        >
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Date</Text>
          <Text style={[styles.dateValue, { color: colors.text }]}>
            {formatDateLabel(editDate.toISOString())}
          </Text>
        </TouchableOpacity>
        <DatePickerModal
          visible={datePickerVisible}
          title="Select date"
          value={editDate}
          onChange={(d) => setEditDate(d)}
          onConfirm={() => setDatePickerVisible(false)}
          onCancel={() => setDatePickerVisible(false)}
        />
        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSaveEdit}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.accent }]}
            onPress={() => setIsEditing(false)}
          >
            <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          onPress={handleOptionsPress}
          style={[styles.optionsBtn, { backgroundColor: colors.surface }]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={[styles.optionsText, { color: colors.text }]}>•••</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.date, { color: colors.textSecondary }]}>
        {formatDateLabel(moment.createdAt)}
      </Text>
      {moment.imageUri && (
        <Image source={{ uri: moment.imageUri }} style={styles.image} />
      )}
      <Text style={[styles.text, { color: colors.text }]}>
        {moment.title ?? moment.note ?? ''}
      </Text>

      <MomentOptionsBottomSheet
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        onEdit={handleEditPress}
        onDelete={handleDeletePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 },
  headerSpacer: { flex: 1 },
  optionsBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  optionsText: { fontSize: 18, fontWeight: '700' },
  date: { fontSize: 14, marginBottom: 12 },
  image: { width: '100%', height: 300, borderRadius: 12, marginBottom: 16 },
  text: { fontSize: 16, lineHeight: 24 },
  editContent: { padding: 20, paddingBottom: 40 },
  editTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  editPreview: { width: '100%', height: 250, borderRadius: 12, marginBottom: 16 },
  editPlaceholder: { width: '100%', height: 250, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  editButtonRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  editButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  editButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  editInput: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 12 },
  editNoteInput: { minHeight: 80, textAlignVertical: 'top' },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 20 },
  dateLabel: { fontSize: 15 },
  dateValue: { fontSize: 15, fontWeight: '600' },
  editActions: { gap: 12 },
  saveBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 17 },
  cancelBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1.5 },
  cancelBtnText: { fontSize: 17, fontWeight: '600' },
});
