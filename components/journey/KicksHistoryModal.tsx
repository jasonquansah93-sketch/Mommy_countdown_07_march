/**
 * KicksHistoryModal — bar chart showing kick counts over time.
 * Timeline toggle: Last 7 Days / Last 4 Weeks / Last 6 Months / Last 9 Months.
 * No external chart library — drawn with plain Views for zero overhead.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesign } from '../../context/DesignContext';
import { loadJSON } from '../../utils/storage';
import { RADIUS, GLASS } from '../../constants/tokens';

const { width: SCREEN_W } = Dimensions.get('window');

type Timeline = '7d' | '4w' | '6m' | '9m';

interface BarData {
  label: string;
  count: number;
}

interface KicksData {
  date: string;
  count: number;
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

async function loadKicksForDates(dates: string[]): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  await Promise.all(
    dates.map(async (dateStr) => {
      const data = await loadJSON<KicksData>(`kicks_${dateStr}`);
      result[dateStr] = data?.count ?? 0;
    })
  );
  return result;
}

function buildDays7(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return isoDate(d);
  });
}

function buildWeeks4(): { label: string; dates: string[] }[] {
  return Array.from({ length: 4 }, (_, wi) => {
    const dates: string[] = [];
    const startOffset = (3 - wi) * 7;
    for (let d = 0; d < 7; d++) {
      const day = new Date();
      day.setDate(day.getDate() - startOffset - (6 - d));
      dates.push(isoDate(day));
    }
    const from = new Date(dates[0]);
    const label = `${from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    return { label, dates };
  });
}

function buildMonths6(): { label: string; dates: string[] }[] {
  const today = new Date();
  return Array.from({ length: 6 }, (_, mi) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (5 - mi), 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) =>
      isoDate(new Date(year, month, i + 1))
    );
    return {
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      dates,
    };
  });
}

function buildMonths9(): { label: string; dates: string[] }[] {
  const today = new Date();
  return Array.from({ length: 9 }, (_, mi) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (8 - mi), 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) =>
      isoDate(new Date(year, month, i + 1))
    );
    return {
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      dates,
    };
  });
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function KicksHistoryModal({ visible, onClose }: Props) {
  const { colors } = useDesign();
  const insets = useSafeAreaInsets();
  const [timeline, setTimeline] = useState<Timeline>('7d');
  const [bars, setBars] = useState<BarData[]>([]);
  const [total, setTotal] = useState(0);
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    loadData(timeline);
  }, [visible, timeline]);

  const loadData = async (tl: Timeline) => {
    setLoading(true);
    let result: BarData[] = [];

    if (tl === '7d') {
      const dates = buildDays7();
      const counts = await loadKicksForDates(dates);
      result = dates.map((d) => ({
        label: new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
        count: counts[d],
      }));
    } else if (tl === '4w') {
      const weeks = buildWeeks4();
      const allDates = weeks.flatMap((w) => w.dates);
      const counts = await loadKicksForDates(allDates);
      result = weeks.map((w) => ({
        label: w.label,
        count: w.dates.reduce((sum, d) => sum + (counts[d] ?? 0), 0),
      }));
    } else if (tl === '6m') {
      const months = buildMonths6();
      const allDates = months.flatMap((m) => m.dates);
      const counts = await loadKicksForDates(allDates);
      result = months.map((m) => ({
        label: m.label,
        count: m.dates.reduce((sum, d) => sum + (counts[d] ?? 0), 0),
      }));
    } else {
      const months = buildMonths9();
      const allDates = months.flatMap((m) => m.dates);
      const counts = await loadKicksForDates(allDates);
      result = months.map((m) => ({
        label: m.label,
        count: m.dates.reduce((sum, d) => sum + (counts[d] ?? 0), 0),
      }));
    }

    setBars(result);
    const t = result.reduce((s, b) => s + b.count, 0);
    setTotal(t);
    setAvg(Math.round(t / result.length));
    setLoading(false);
  };

  const maxCount = Math.max(...bars.map((b) => b.count), 1);
  const chartH = 140;
  const barW = Math.floor((SCREEN_W - 80) / Math.max(bars.length, 1)) - 6;

  const TAB_LABELS: { id: Timeline; label: string }[] = [
    { id: '7d', label: '7 Days' },
    { id: '4w', label: '4 Weeks' },
    { id: '6m', label: '6 Months' },
    { id: '9m', label: '9 Months' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.root, { backgroundColor: '#F8F4EE' }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-down" size={24} color="#6B5D4F" />
          </TouchableOpacity>
          <Text style={styles.headerLabel}>Previous Kicks</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: GLASS.surface, borderColor: GLASS.border }, GLASS.shadowSubtle]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{total}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Kicks</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: GLASS.surface, borderColor: GLASS.border }, GLASS.shadowSubtle]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{avg}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {timeline === '7d' ? 'Avg / Day' : timeline === '4w' ? 'Avg / Week' : 'Avg / Month'}
              </Text>
            </View>
          </View>

          {/* Timeline Toggle */}
          <View style={[styles.toggleRow, { backgroundColor: GLASS.surface, borderColor: GLASS.border }, GLASS.shadowSubtle]}>
            {TAB_LABELS.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.toggleBtn, timeline === t.id && { backgroundColor: colors.primary }]}
                onPress={() => setTimeline(t.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    { color: timeline === t.id ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bar Chart */}
          <View style={[styles.chartCard, { backgroundColor: GLASS.surface, borderColor: GLASS.border }, GLASS.shadow]}>
            {loading ? (
              <View style={{ height: chartH, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary }}>Loading...</Text>
              </View>
            ) : (
              <View style={styles.chartArea}>
                {bars.map((bar, idx) => {
                  const barH = bar.count === 0 ? 4 : Math.max(8, (bar.count / maxCount) * chartH);
                  const isToday = idx === bars.length - 1 && timeline === '7d';
                  return (
                    <View key={idx} style={[styles.barColumn, { width: barW }]}>
                      {bar.count > 0 && (
                        <Text style={[styles.barValue, { color: colors.primary }]}>{bar.count}</Text>
                      )}
                      <View
                        style={[
                          styles.bar,
                          {
                            height: barH,
                            backgroundColor: isToday ? colors.primary : colors.primary + '55',
                            width: barW - 4,
                            borderRadius: 6,
                          },
                        ]}
                      />
                      <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{bar.label}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Tip */}
          <Text style={[styles.tip, { color: colors.textSecondary }]}>
            Counting kicks daily helps you notice your baby's patterns and stay connected.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2825',
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: RADIUS.inner,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -1,
    lineHeight: 38,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
    paddingTop: 24,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 3,
  },
  bar: {},
  barLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 5,
    textAlign: 'center',
  },
  tip: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
