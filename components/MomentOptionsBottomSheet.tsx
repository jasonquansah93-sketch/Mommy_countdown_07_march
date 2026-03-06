import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesign } from '../context/DesignContext';
import { useReducedMotion } from '../utils/motion';

const BORDER_COLOR = '#E5E5E5';
const CORNER_RADIUS = 12;
const BUTTON_PADDING = 16;

interface MomentOptionsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MomentOptionsBottomSheet({
  visible,
  onClose,
  onEdit,
  onDelete,
}: MomentOptionsBottomSheetProps) {
  const { colors } = useDesign();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  // When reduced motion is on, skip slide animation and go straight to final value
  const slideAnim = React.useRef(new Animated.Value(reducedMotion ? 0 : 300)).current;
  const backdropAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (reducedMotion) {
        slideAnim.setValue(0);
        backdropAnim.setValue(1);
        return;
      }
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      if (reducedMotion) {
        slideAnim.setValue(300);
        backdropAnim.setValue(0);
        return;
      }
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim, reducedMotion]);

  const backdropOpacity = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          pointerEvents="auto"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              paddingBottom: Math.max(insets.bottom, 24),
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.handleBar, { backgroundColor: colors.textSecondary }]} />
          <Text style={[styles.title, { color: colors.text }]}>Moment Options</Text>
          <View style={styles.optionsContent}>
            <TouchableOpacity
              style={[styles.optionBtn, { backgroundColor: '#FFFFFF', borderColor: BORDER_COLOR }]}
              onPress={() => {
                onClose();
                onEdit();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>Edit Moment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionBtn, { backgroundColor: '#FFFFFF', borderColor: BORDER_COLOR }]}
              onPress={() => {
                onClose();
                onDelete();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, styles.optionDestructiveText]}>Delete Moment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionBtn, styles.goBackBtn, { backgroundColor: '#FFFFFF', borderColor: BORDER_COLOR }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  optionsContent: {
    paddingHorizontal: 20,
  },
  optionBtn: {
    width: '100%',
    paddingVertical: BUTTON_PADDING,
    paddingHorizontal: 24,
    borderRadius: CORNER_RADIUS,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  goBackBtn: {
    marginTop: 8,
    marginBottom: 0,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
  },
  optionDestructiveText: {
    color: '#E53935',
  },
});
