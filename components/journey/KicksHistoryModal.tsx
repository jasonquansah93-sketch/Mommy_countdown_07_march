/**
 * KicksHistoryModal — bar chart showing kick counts over time.
 * Timeline toggle: Last 7 Days / Last 4 Weeks / Last 6 Months / Last 9 Months.
 * No external chart library — drawn with plain Views for zero overhead.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadJSON } from '../../utils/storage';

const { width: SCREEN_W } = Dimensions.get('window');

type Timeline = '7d' | '4w' | '6m' | '9m';

interface BarData  { label: string; count: number }
interface KicksData { date: string; count: number }

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

async function loadKicksForDates(dates: string[]): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  await Promise.all(
    dates.map(async dateStr => {
      const data = await loadJSON<KicksData>(`kicks_${dateStr}`);
      result[dateStr] = data?.count ?? 0;
    })
  );
  return result;
}

function buildDays7(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return isoDate(d);
  });
}
function buildWeeks4(): { label: string; dates: string[] }[] {
  return Array.from({ length: 4 }, (_, wi) => {
    const dates: string[] = [];
    const startOffset = (3 - wi) * 7;
    for (let d = 0; d < 7; d++) {
      const day = new Date(); day.setDate(day.getDate() - startOffset - (6 - d)); dates.push(isoDate(day));
    }
    const from = new Date(dates[0]);
    return { label: from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), dates };
  });
}
function buildMonths(n: number): { label: string; dates: string[] }[] {
  const today = new Date();
  return Array.from({ length: n }, (_, mi) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (n - 1 - mi), 1);
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) =>
      isoDate(new Date(d.getFullYear(), d.getMonth(), i + 1))
    );
    return { label: d.toLocaleDateString('en-US', { month: 'short' }), dates };
  });
}

interface Props { visible: boolean; onClose: () => void }

const TAB_LABELS: { id: Timeline; label: string }[] = [
  { id: '7d', label: '7 Days' },
  { id: '4w', label: '4 Weeks' },
  { id: '6m', label: '6 Months' },
  { id: '9m', label: '9 Months' },
];

export default function KicksHistoryModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [timeline, setTimeline] = useState<Timeline>('7d');
  const [bars,    setBars]    = useState<BarData[]>([]);
  const [total,   setTotal]   = useState(0);
  const [avg,     setAvg]     = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (visible) loadData(timeline); }, [visible, timeline]);

  const loadData = async (tl: Timeline) => {
    setLoading(true);
    let result: BarData[] = [];

    if (tl === '7d') {
      const dates  = buildDays7();
      const counts = await loadKicksForDates(dates);
      result = dates.map(d => ({
        label: new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
        count: counts[d],
      }));
    } else if (tl === '4w') {
      const weeks = buildWeeks4();
      const counts = await loadKicksForDates(weeks.flatMap(w => w.dates));
      result = weeks.map(w => ({
        label: w.label,
        count: w.dates.reduce((s, d) => s + (counts[d] ?? 0), 0),
      }));
    } else {
      const months = buildMonths(tl === '6m' ? 6 : 9);
      const counts = await loadKicksForDates(months.flatMap(m => m.dates));
      result = months.map(m => ({
        label: m.label,
        count: m.dates.reduce((s, d) => s + (counts[d] ?? 0), 0),
      }));
    }

    setBars(result);
    const t = result.reduce((s, b) => s + b.count, 0);
    setTotal(t);
    setAvg(Math.round(t / result.length));
    setLoading(false);
  };

  const maxCount = Math.max(...bars.map(b => b.count), 1);
  const chartH   = 140;
  const barW     = Math.floor((SCREEN_W - 80) / Math.max(bars.length, 1)) - 6;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.root}>

        {/* ── Header ── */}
        <View style={[s.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-down" size={24} color="#6B5C4D" />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Kick History</Text>
            <Text style={s.headerSub}>baby's daily patterns</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* ── Stats row ── */}
          <View style={s.statsRow}>
            {[
              { value: total, label: 'Total Kicks' },
              {
                value: avg,
                label: timeline === '7d' ? 'Avg / Day'
                  : timeline === '4w'    ? 'Avg / Week' : 'Avg / Month',
              },
            ].map((stat, i) => (
              <View key={i} style={s.statCard}>
                <LinearGradient
                  colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Timeline toggle ── */}
          <View style={s.toggleRow}>
            {TAB_LABELS.map(t => {
              const active = timeline === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[s.toggleBtn, active && s.toggleBtnActive]}
                  onPress={() => setTimeline(t.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.toggleBtnTxt, active && s.toggleBtnTxtActive]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Bar chart ── */}
          <View style={s.chartCard}>
            <LinearGradient
              colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {loading ? (
              <View style={{ height: chartH + 40, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={s.loadingTxt}>Loading…</Text>
              </View>
            ) : (
              <View style={[s.chartArea, { height: chartH + 40 }]}>
                {bars.map((bar, idx) => {
                  const barH  = bar.count === 0 ? 4 : Math.max(8, (bar.count / maxCount) * chartH);
                  const isToday = idx === bars.length - 1 && timeline === '7d';
                  return (
                    <View key={idx} style={[s.barColumn, { width: barW }]}>
                      {bar.count > 0 && (
                        <Text style={s.barValue}>{bar.count}</Text>
                      )}
                      <View
                        style={{
                          height: barH,
                          width: barW - 4,
                          borderRadius: 5,
                          backgroundColor: isToday
                            ? '#C09A72'
                            : 'rgba(192,154,114,0.45)',
                        }}
                      />
                      <Text style={s.barLabel}>{bar.label}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── Tip ── */}
          <Text style={s.tip}>
            Counting kicks daily helps you notice your baby's patterns and stay connected.
          </Text>

        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'rgba(240,232,220,1)' },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(120,90,60,0.20)',
  },
  closeBtn:    { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#2C211A', letterSpacing: -0.2 },
  headerSub:   { fontSize: 11, color: '#A08C76', fontFamily: 'Georgia', fontStyle: 'italic', marginTop: 1 },

  /* Content */
  content: { padding: 20, paddingBottom: 60 },

  /* Stats */
  statsRow:  { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1, borderRadius: 14, overflow: 'hidden', position: 'relative',
    padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statValue: {
    fontSize: 36, fontWeight: '300', letterSpacing: -1.5,
    lineHeight: 42, color: '#2C211A', fontFamily: 'Georgia',
  },
  statLabel: { fontSize: 11, fontWeight: '500', letterSpacing: 0.5, color: '#9A8472', marginTop: 2 },

  /* Toggle */
  toggleRow: {
    flexDirection: 'row', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.25)',
    backgroundColor: 'rgba(255,255,255,0.50)',
    padding: 4, marginBottom: 16, gap: 4,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 16, alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(192,154,114,0.22)',
    borderWidth: 1, borderColor: 'rgba(168,126,82,0.40)',
  },
  toggleBtnTxt:       { fontSize: 12, fontWeight: '600', color: '#9A8472' },
  toggleBtnTxtActive: { color: '#7A5830', fontWeight: '700' },

  /* Chart */
  chartCard: {
    borderRadius: 16, overflow: 'hidden', position: 'relative',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
    marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  loadingTxt: { color: '#9A8472', fontFamily: 'Georgia', fontStyle: 'italic' },
  chartArea: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between', paddingTop: 20,
  },
  barColumn: { alignItems: 'center', justifyContent: 'flex-end' },
  barValue:  { fontSize: 10, fontWeight: '700', color: '#A08C76', marginBottom: 3 },
  barLabel:  { fontSize: 10, fontWeight: '500', color: '#9A8472', marginTop: 5, textAlign: 'center' },

  /* Tip */
  tip: {
    fontSize: 13, lineHeight: 20, textAlign: 'center',
    color: '#9A8472', fontFamily: 'Georgia', fontStyle: 'italic',
  },
});
