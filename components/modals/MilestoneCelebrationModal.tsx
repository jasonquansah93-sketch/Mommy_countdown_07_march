/**
 * Milestone Celebration Modal — appears once on the first app-open of a milestone day.
 * Triggered by the home screen. Uses a gentle editorial full-screen reveal.
 * Which milestones have been celebrated is tracked in AsyncStorage.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesign } from '../../context/DesignContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  milestoneTitle: string;
  daysLabel: string;
  onClose: () => void;
}

export default function MilestoneCelebrationModal({
  visible,
  milestoneTitle,
  daysLabel,
  onClose,
}: Props) {
  const { colors } = useDesign();
  const insets = useSafeAreaInsets();

  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
      ]).start();

      // Gentle float loop
      const floatLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      floatLoop.start();
      return () => floatLoop.stop();
    } else {
      scaleAnim.setValue(0.88);
      opacityAnim.setValue(0);
      floatAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.sheet,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[colors.primary + 'F0', colors.secondary + 'F0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { paddingTop: 48, paddingBottom: insets.bottom + 36 }]}
          >
            {/* Floating number */}
            <Animated.Text
              style={[
                styles.bigNumber,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              {daysLabel}
            </Animated.Text>

            <Text style={styles.subLabel}>days to go</Text>

            <View style={styles.divider} />

            <Text style={styles.title}>{milestoneTitle}</Text>
            <Text style={styles.subtitle}>
              You've reached a beautiful moment in your journey.{'\n'}Take a deep breath. You're doing wonderfully.
            </Text>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>Continue</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(44,40,37,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    width: width - 48,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 18,
  },
  card: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  bigNumber: {
    fontSize: 96,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -4,
    lineHeight: 104,
  },
  subLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
    marginTop: -4,
    marginBottom: 28,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 36,
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 44,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
