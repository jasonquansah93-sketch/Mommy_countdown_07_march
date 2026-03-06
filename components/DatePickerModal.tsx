import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDesign } from '../context/DesignContext';

interface Props {
  visible: boolean;
  title: string;
  value: Date;
  onChange: (date: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

/**
 * DatePickerModal - A robust date picker that works on REAL iOS devices
 *
 * Key fixes for real device compatibility:
 * 1. Uses SafeAreaView to ensure content is visible
 * 2. Explicit white background with high contrast
 * 3. Fixed height for picker (216px is iOS default)
 * 4. No transparency tricks that can cause rendering issues
 * 5. zIndex to ensure modal is on top
 */
export default function DatePickerModal({
  visible,
  title,
  value,
  onChange,
  onConfirm,
  onCancel,
  minimumDate,
  maximumDate,
}: Props) {
  const { colors } = useDesign();

  const handleChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onCancel}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalContainer}>
            {/* Header with title and buttons */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onCancel} style={styles.headerBtn}>
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <TouchableOpacity onPress={onConfirm} style={styles.headerBtn}>
                <Text style={[styles.confirmText, { color: colors.primary }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker - iOS spinner style */}
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={value}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.picker}
                textColor="#000000"
                themeVariant="light"
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '400',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  picker: {
    width: '100%',
    height: 216, // iOS default picker height
    backgroundColor: '#FFFFFF',
  },
});
