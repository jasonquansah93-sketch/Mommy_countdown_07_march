/**
 * Baby Kicks Counter — tap to count kicks, daily reset at midnight.
 * Stores today's count in AsyncStorage. Haptic feedback on each tap.
 * On first tap: requests notification permission + schedules daily 20:00 reminder.
 * The reminder is cancelled once at least one kick has been logged today.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { loadJSON, saveJSON } from '../../utils/storage';
import KicksHistoryModal from './KicksHistoryModal';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const todayKey    = () => `kicks_${new Date().toISOString().slice(0, 10)}`;
const NOTIF_ID_KEY    = 'kicks_notification_id';
const NOTIF_SETUP_KEY = 'kicks_notif_setup_done';

interface KicksData { date: string; count: number }

async function cancelKicksNotification() {
  const id = await loadJSON<string>(NOTIF_ID_KEY);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await saveJSON(NOTIF_ID_KEY, null);
  }
}

async function scheduleDailyKicksReminder() {
  await cancelKicksNotification();
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Baby Kicks 👶',
      body: "Haven't felt any kicks today? Take a moment and count.",
      sound: false,
    },
    trigger: {
      hour: 20, minute: 0, repeats: true,
    } as Notifications.DailyTriggerInput,
  });
  await saveJSON(NOTIF_ID_KEY, id);
}

export default function KicksCounter() {
  const [count, setCount]               = useState(0);
  const [historyVisible, setHistoryVisible] = useState(false);
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadJSON<KicksData>(todayKey()).then(data => { if (data?.count) setCount(data.count); });
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
    if (newCount === 1) requestAndSetupNotification();
    if (newCount >= 1) cancelKicksNotification();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.22, duration: 80,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 10 }),
    ]).start();

    opacityAnim.setValue(1);
    Animated.timing(opacityAnim, {
      toValue: 0, duration: 600,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  };

  const reset = async () => {
    setCount(0);
    await saveJSON<KicksData>(todayKey(), { date: new Date().toISOString(), count: 0 });
    const setup = await loadJSON<boolean>(NOTIF_SETUP_KEY);
    if (setup) scheduleDailyKicksReminder();
  };

  const getMessage = () => {
    if (count === 0)  return 'Tap every time you feel a kick';
    if (count < 5)    return 'Keep going…';
    if (count < 10)   return 'Baby is active today!';
    return 'What an active little one!';
  };

  return (
    <>
      <View style={s.card}>
        <LinearGradient
          colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* ── Header row ── */}
        <View style={s.cardHeader}>
          <Text style={s.cardLabel}>BABY KICKS</Text>
          <View style={s.headerRight}>
            <TouchableOpacity
              style={s.historyBtn}
              onPress={() => setHistoryVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={s.historyBtnTxt}>History</Text>
            </TouchableOpacity>
            {count > 0 && (
              <TouchableOpacity onPress={reset} activeOpacity={0.6}>
                <Text style={s.resetTxt}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Tap area ── */}
        <TouchableOpacity onPress={handleTap} activeOpacity={0.85} style={s.tapArea}>
          {/* Flash ring */}
          <Animated.View
            style={[s.flashRing, { opacity: opacityAnim }]}
          />
          {/* Count bubble */}
          <View style={s.bubble}>
            <Animated.Text
              style={[s.countTxt, { transform: [{ scale: scaleAnim }] }]}
            >
              {count}
            </Animated.Text>
            <Text style={s.unitTxt}>kicks today</Text>
          </View>
        </TouchableOpacity>

        {/* ── Message & date ── */}
        <Text style={s.message}>{getMessage()}</Text>
        <Text style={s.dateLabel}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      <KicksHistoryModal visible={historyVisible} onClose={() => setHistoryVisible(false)} />
    </>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20, overflow: 'hidden', position: 'relative',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 22,
    alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },

  /* Header */
  cardHeader: {
    width: '100%', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 22,
  },
  cardLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2.0, color: '#A08C76',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  historyBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14,
    backgroundColor: 'rgba(192,154,114,0.16)',
    borderWidth: 1, borderColor: 'rgba(168,126,82,0.20)',
  },
  historyBtnTxt: { fontSize: 12, fontWeight: '600', color: '#7A5830' },
  resetTxt: { fontSize: 12, fontWeight: '500', color: '#B0997E' },

  /* Tap area */
  tapArea: {
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18, position: 'relative',
  },
  flashRing: {
    position: 'absolute',
    width: 152, height: 152, borderRadius: 76,
    borderWidth: 2, borderColor: 'rgba(192,154,114,0.70)',
  },
  bubble: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(192,154,114,0.12)',
    borderWidth: 2, borderColor: 'rgba(168,126,82,0.35)',
  },
  countTxt: {
    fontSize: 54, fontWeight: '300', lineHeight: 62,
    letterSpacing: -2, color: '#2C211A',
    fontFamily: 'Georgia',
  },
  unitTxt: {
    fontSize: 11, fontWeight: '500', letterSpacing: 0.5,
    color: '#9A8472', marginTop: -4,
  },

  /* Footer text */
  message: {
    fontSize: 14, color: '#9A8472', textAlign: 'center',
    fontFamily: 'Georgia', fontStyle: 'italic', marginBottom: 6,
  },
  dateLabel: {
    fontSize: 11, color: 'rgba(160,140,118,0.70)', textAlign: 'center',
  },
});
