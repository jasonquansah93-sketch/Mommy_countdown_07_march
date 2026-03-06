import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../context/ProfileContext';
import { usePregnancy } from '../../context/PregnancyContext';
import { useDesign } from '../../context/DesignContext';
import { formatDateShort } from '../../utils/date';
import GradientButton from './GradientButton';
import DatePickerModal from '../DatePickerModal';
import { RADIUS, SPACING, GLASS } from '../../constants/tokens';

interface Props {
  onCountdownStarted?: () => void;
}

export default function PregnancyDetailsCard({ onCountdownStarted }: Props) {
  const { profile, updateProfile } = useProfile();
  const { updateCurrentPregnancy } = usePregnancy();
  const { colors } = useDesign();
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

  const cancelPicker = () => {
    setEditingField(null);
  };

  const handleStartCountdown = () => {
    updateProfile({ countdownStarted: true });
    onCountdownStarted?.();
  };

  return (
    <>
      <View style={styles.container}>
        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Your Pregnancy Details
          </Text>
          <View style={[styles.headerLine, { backgroundColor: colors.accent }]} />
        </View>

        {/* Card */}
        <View style={[styles.card]}>
          {/* Start date */}
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            START DATE
            <Text style={styles.fieldHint}>(BEGINNING OF PREGNANCY)</Text>
          </Text>
          <TouchableOpacity
            style={[styles.fieldBox, { borderColor: colors.accent }]}
            onPress={openStartPicker}
            activeOpacity={0.7}
          >
            <Text style={[styles.fieldValue, { color: colors.text }]}>
              {formatDateShort(profile.startDate)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </TouchableOpacity>

          {/* Due date */}
          <Text style={[styles.fieldLabelPink, { color: colors.primary }]}>
            DUE DATE
            <Text style={[styles.fieldHint, { color: colors.textSecondary }]}>
              (ESTIMATED DUE DATE)
            </Text>
          </Text>
          <TouchableOpacity
            style={[styles.fieldBox, { borderColor: colors.primary }]}
            onPress={openDuePicker}
            activeOpacity={0.7}
          >
            <Text style={[styles.fieldValue, { color: colors.text }]}>
              {formatDateShort(profile.dueDate)}
            </Text>
            <Ionicons name="calendar" size={20} color={colors.primary} />
          </TouchableOpacity>

          {/* Start countdown button — only visible when not started */}
          {!countdownStarted && (
            <GradientButton
              title="START COUNTDOWN"
              onPress={handleStartCountdown}
              style={styles.button}
            />
          )}
        </View>
      </View>

      {/* Date picker modal - using robust component for real device compatibility */}
      <DatePickerModal
        visible={editingField !== null}
        title={editingField === 'start' ? 'Select Start Date' : 'Select Due Date'}
        value={tempDate}
        onChange={setTempDate}
        onConfirm={confirmDate}
        onCancel={cancelPicker}
        maximumDate={editingField === 'start' ? new Date() : undefined}
        minimumDate={editingField === 'due' ? new Date() : undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.cardGap,
    marginHorizontal: SPACING.screenH,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 12,
    letterSpacing: 0.2,
  },
  headerLine: {
    flex: 1,
    height: 1.5,
    borderRadius: 1,
  },
  card: {
    borderRadius: RADIUS.card,
    padding: SPACING.cardPad,
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.border,
    ...GLASS.shadow,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 4,
  },
  fieldLabelPink: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 18,
  },
  fieldHint: {
    fontWeight: '400',
    fontSize: 10,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: RADIUS.inner,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  fieldValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  button: {
    marginTop: 24,
  },
});
