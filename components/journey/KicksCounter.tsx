/**
 * Baby Kicks Counter — tap to count kicks, daily reset at midnight.
 * Stores today's count in AsyncStorage. Haptic feedback on each tap.
 * On first tap: requests notification permission + schedules daily 20:00 reminder.
 * The reminder is cancelled once at least one kick has been logged today.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useDesign } from '../../context/DesignContext';
import { loadJSON, saveJSON } from '../../utils/storage';
import { RADIUS, GLASS } from '../../constants/tokens';
import KicksHistoryModal from './KicksHistoryModal';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const todayKey = () => `kicks_${new Date().toISOString().slice(0, 10)}`;
const NOTIF_ID_KEY = 'kicks_notification_id';
const NOTIF_SETUP_KEY = 'kicks_notif_setup_done';

interface KicksData {
  date: string;
  count: number;
}

async function cancelKicksNotification() {
  const id = await loadJSON<string>(NOTIF_ID_KEY);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await saveJSON(NOTIF_ID_KEY, null);
  }
}

async function scheduleDailyKicksReminder() {
  // Cancel any existing one first
  await cancelKicksNotification();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Baby Kicks 👶',
      body: "Haven't felt any kicks today? Take a moment and count.",
      sound: false,
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true,
    } as Notifications.DailyTriggerInput,
  });
  await saveJSON(NOTIF_ID_KEY, id);
}

export default function KicksCounter() {
  const { colors } = useDesign();
  const [count, setCount] = useState(0);
  const [historyVisible, setHistoryVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const key = todayKey();
    loadJSON<KicksData>(key).then((data) => {
      if (data?.count) setCount(data.count);
    });
  }, []);

  const requestAndSetupNotification = async () => {
    const alreadySetup = await loadJSON<boolean>(NOTIF_SETUP_KEY);
    if (alreadySetup) return;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      await scheduleDailyKicksReminder();
      await saveJSON(NOTIF_SETUP_KEY, true);
    }
  };

  const handleTap = async () => {
    const newCount = count + 1;
    setCount(newCount);
    await saveJSON<KicksData>(todayKey(), { date: new Date().toISOString(), count: newCount });

    // On very first tap ever: ask for notification permission
    if (newCount === 1) {
      requestAndSetupNotification();
    }

    // Cancel today's reminder as soon as a kick is logged
    if (newCount >= 1) {
      cancelKicksNotification();
    }

    // Haptic
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    // Bounce animation on the number
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.22,
        duration: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 10,
      }),
    ]).start();

    // Flash ring
    opacityAnim.setValue(1);
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const reset = async () => {
    setCount(0);
    await saveJSON<KicksData>(todayKey(), { date: new Date().toISOString(), count: 0 });
    // Re-schedule reminder since kicks were reset
    const setup = await loadJSON<boolean>(NOTIF_SETUP_KEY);
    if (setup) scheduleDailyKicksReminder();
  };

  const getMessage = () => {
    if (count === 0) return 'Tap every time you feel a kick';
    if (count < 5) return 'Keep going...';
    if (count < 10) return 'Baby is active today!';
    return 'What an active little one!';
  };

  return (
    <>
      <View style={[styles.card, { backgroundColor: GLASS.surface, borderColor: GLASS.border }, GLASS.shadow]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Baby Kicks</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setHistoryVisible(true)}
              activeOpacity={0.7}
              style={[styles.historyBtn, { backgroundColor: colors.primary + '15' }]}
            >
              <Text style={[styles.historyBtnText, { color: colors.primary }]}>History</Text>
            </TouchableOpacity>
            {count > 0 && (
              <TouchableOpacity onPress={reset} activeOpacity={0.6} style={styles.resetBtn}>
                <Text style={[styles.resetText, { color: colors.textSecondary }]}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tap Area */}
        <TouchableOpacity
          onPress={handleTap}
          activeOpacity={0.8}
          style={styles.tapArea}
        >
          {/* Flash ring */}
          <Animated.View
            style={[
              styles.flashRing,
              { borderColor: colors.primary, opacity: opacityAnim },
            ]}
          />

          {/* Count bubble */}
          <View style={[styles.bubble, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}>
            <Animated.Text style={[styles.countText, { color: colors.primary, transform: [{ scale: scaleAnim }] }]}>
              {count}
            </Animated.Text>
            <Text style={[styles.unitText, { color: colors.primary }]}>kicks today</Text>
          </View>
        </TouchableOpacity>

        {/* Message */}
        <Text style={[styles.message, { color: colors.textSecondary }]}>{getMessage()}</Text>

        {/* Date */}
        <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      <KicksHistoryModal visible={historyVisible} onClose={() => setHistoryVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  historyBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resetBtn: {},
  resetText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tapArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    position: 'relative',
  },
  flashRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
  },
  bubble: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 54,
    fontWeight: '300',
    lineHeight: 62,
    letterSpacing: -2,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: -4,
    opacity: 0.8,
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.6,
  },
});
