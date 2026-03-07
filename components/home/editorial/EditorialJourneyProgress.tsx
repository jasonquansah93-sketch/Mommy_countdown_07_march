/**
 * EditorialJourneyProgress — weicher Fortschrittsbalken, ruhige Typografie.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useProfile } from '../../../context/ProfileContext';
import { getJourneyProgress, formatDateLabel } from '../../../utils/date';
import DatePickerModal from '../../DatePickerModal';
import { EDITORIAL, EDITORIAL_RADIUS, EDITORIAL_SHADOW } from '../../../theme/editorialTheme';

export default function EditorialJourneyProgress() {
  const { profile, updateProfile } = useProfile();
  const countdownStarted = profile.countdownStarted === true;
  const percent = getJourneyProgress(profile.startDate, profile.dueDate);

  const [editingDate, setEditingDate] = useState<'start' | 'due' | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  const openStartPicker = () => {
    setTempDate(new Date(profile.startDate));
    setEditingDate('start');
  };

  const openDuePicker = () => {
    setTempDate(new Date(profile.dueDate));
    setEditingDate('due');
  };

  const confirmDate = () => {
    if (editingDate === 'start') updateProfile({ startDate: tempDate.toISOString() });
    else if (editingDate === 'due') updateProfile({ dueDate: tempDate.toISOString() });
    setEditingDate(null);
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.label}>Journey progress</Text>
          <Text style={styles.percent}>{countdownStarted ? `${percent}%` : '—'}</Text>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: countdownStarted ? `${percent}%` : '0%' }]} />
        </View>

        <View style={styles.dateRow}>
          <TouchableOpacity onPress={openStartPicker} activeOpacity={0.7}>
            <Text style={styles.dateText}>
              Start {countdownStarted ? formatDateLabel(profile.startDate) : '—'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openDuePicker} activeOpacity={0.7}>
            <Text style={styles.dateText}>
              Due {countdownStarted ? formatDateLabel(profile.dueDate) : '—'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <DatePickerModal
        visible={editingDate !== null}
        title={editingDate === 'start' ? 'Select Start Date' : 'Select Due Date'}
        value={tempDate}
        onChange={setTempDate}
        onConfirm={confirmDate}
        onCancel={() => setEditingDate(null)}
        maximumDate={editingDate === 'start' ? new Date() : undefined}
        minimumDate={editingDate === 'due' ? new Date() : undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 0,
    padding: 28,
    backgroundColor: EDITORIAL.surfaceMuted,
    borderRadius: EDITORIAL_RADIUS.card,
    borderWidth: 0,
    ...EDITORIAL_SHADOW.subtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: EDITORIAL.textSecondary,
  },
  percent: {
    fontSize: 18,
    fontWeight: '300',
    color: EDITORIAL.primary,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: EDITORIAL.primary,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: EDITORIAL.textSecondary,
  },
});
