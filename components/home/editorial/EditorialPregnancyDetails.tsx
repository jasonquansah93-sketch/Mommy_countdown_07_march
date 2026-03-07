/**
 * EditorialPregnancyDetails — weiche ValueCards, ruhige Anordnung.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../../context/ProfileContext';
import { usePregnancy } from '../../../context/PregnancyContext';
import { formatDateShort } from '../../../utils/date';
import DatePickerModal from '../../DatePickerModal';
import { EDITORIAL, EDITORIAL_RADIUS, EDITORIAL_SHADOW } from '../../../theme/editorialTheme';

interface Props {
  onCountdownStarted?: () => void;
}

export default function EditorialPregnancyDetails({ onCountdownStarted }: Props) {
  const { profile, updateProfile } = useProfile();
  const { updateCurrentPregnancy } = usePregnancy();
  const countdownStarted = profile.countdownStarted === true;

  const [editingField, setEditingField] = useState<'start' | 'due' | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  const openStartPicker = () => {
    setTempDate(new Date(profile.startDate));
    setEditingField('start');
  };

  const openDuePicker = () => {
    setTempDate(new Date(profile.dueDate));
    setEditingField('due');
  };

  const confirmDate = () => {
    const iso = tempDate.toISOString();
    if (editingField === 'start') {
      updateProfile({ startDate: iso });
      updateCurrentPregnancy({ startDate: iso });
    } else if (editingField === 'due') {
      updateProfile({ dueDate: iso });
      updateCurrentPregnancy({ dueDate: iso });
    }
    setEditingField(null);
  };

  const handleStartCountdown = () => {
    updateProfile({ countdownStarted: true });
    onCountdownStarted?.();
  };

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your pregnancy</Text>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Start date</Text>
          <TouchableOpacity style={styles.valueCard} onPress={openStartPicker} activeOpacity={0.7}>
            <Text style={styles.valueText}>{formatDateShort(profile.startDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color={EDITORIAL.primary} />
          </TouchableOpacity>

          <Text style={[styles.fieldLabel, styles.fieldLabelTop]}>Due date</Text>
          <TouchableOpacity style={styles.valueCard} onPress={openDuePicker} activeOpacity={0.7}>
            <Text style={styles.valueText}>{formatDateShort(profile.dueDate)}</Text>
            <Ionicons name="calendar" size={20} color={EDITORIAL.primary} />
          </TouchableOpacity>

          {!countdownStarted && (
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={handleStartCountdown}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaText}>Start countdown</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <DatePickerModal
        visible={editingField !== null}
        title={editingField === 'start' ? 'Select Start Date' : 'Select Due Date'}
        value={tempDate}
        onChange={setTempDate}
        onConfirm={confirmDate}
        onCancel={() => setEditingField(null)}
        maximumDate={editingField === 'start' ? new Date() : undefined}
        minimumDate={editingField === 'due' ? new Date() : undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 20,
    marginTop: 36,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: EDITORIAL.textSecondary,
    marginBottom: 16,
  },
  card: {
    padding: 24,
    backgroundColor: EDITORIAL.surfaceMuted,
    borderRadius: EDITORIAL_RADIUS.card,
    borderWidth: 0,
    ...EDITORIAL_SHADOW.subtle,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: EDITORIAL.textSecondary,
    marginBottom: 8,
  },
  fieldLabelTop: {
    marginTop: 20,
  },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: EDITORIAL_RADIUS.inner,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 0,
  },
  valueText: {
    fontSize: 17,
    fontWeight: '500',
    color: EDITORIAL.text,
  },
  ctaBtn: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: EDITORIAL_RADIUS.button,
    backgroundColor: EDITORIAL.primary,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
