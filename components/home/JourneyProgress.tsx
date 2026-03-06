import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useProfile } from '../../context/ProfileContext';
import { useDesign } from '../../context/DesignContext';
import { getJourneyProgress, formatDateLabel } from '../../utils/date';
import DatePickerModal from '../DatePickerModal';
import { RADIUS, SPACING, GLASS } from '../../constants/tokens';

export default function JourneyProgress() {
  const { profile, updateProfile } = useProfile();
  const { colors } = useDesign();
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
    if (editingDate === 'start') {
      updateProfile({ startDate: tempDate.toISOString() });
    } else if (editingDate === 'due') {
      updateProfile({ dueDate: tempDate.toISOString() });
    }
    setEditingDate(null);
  };

  const cancelPicker = () => {
    setEditingDate(null);
  };

  return (
    <>
      <View style={[styles.card]}>
        <View style={styles.headerRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>JOURNEY PROGRESS</Text>
          <Text style={[styles.percent, { color: colors.primary }]}>
            {countdownStarted ? `${percent}%` : '--%'}
          </Text>
        </View>

        {/* Progress track */}
        <View style={[styles.track, { backgroundColor: colors.accent }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: colors.primary,
                width: countdownStarted ? `${percent}%` : '0%',
              },
            ]}
          />
        </View>

        <View style={styles.dateRow}>
          {countdownStarted ? (
            <>
              <TouchableOpacity onPress={openStartPicker} activeOpacity={0.6}>
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  Start: {formatDateLabel(profile.startDate)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={openDuePicker} activeOpacity={0.6}>
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  Due: {formatDateLabel(profile.dueDate)}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.dateTextPlaceholder, { color: colors.textSecondary }]}>
                Start: --
              </Text>
              <Text style={[styles.dateTextPlaceholder, { color: colors.textSecondary }]}>
                Due: --
              </Text>
            </>
          )}
        </View>
      </View>

      <DatePickerModal
        visible={editingDate !== null}
        title={editingDate === 'start' ? 'Edit Start Date' : 'Edit Due Date'}
        value={tempDate}
        onChange={setTempDate}
        onConfirm={confirmDate}
        onCancel={cancelPicker}
        maximumDate={editingDate === 'start' ? new Date() : undefined}
        minimumDate={editingDate === 'due' ? new Date() : undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.screenH,
    marginTop: SPACING.cardGap,
    borderRadius: RADIUS.card,
    paddingVertical: 22,
    paddingHorizontal: SPACING.cardPad,
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.border,
    ...GLASS.shadow,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  percent: {
    fontSize: 15,
    fontWeight: '700',
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: 10,
    borderRadius: 5,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  dateTextPlaceholder: {
    fontSize: 12,
    fontWeight: '500',
  },
});
