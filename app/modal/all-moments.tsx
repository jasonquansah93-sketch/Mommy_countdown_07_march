import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePregnancy } from '../../context/PregnancyContext';
import { useDesign } from '../../context/DesignContext';
import { Moment } from '../../types/pregnancy';
import { formatDateLabel } from '../../utils/date';

export default function AllMomentsModal() {
  const router = useRouter();
  const { getManualMoments } = usePregnancy();
  const { colors } = useDesign();
  /** RENDER FIREWALL: Only manual moments. Never milestones or milestone-origin. */
  const moments = [...getManualMoments()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const renderItem = ({ item }: { item: Moment }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => router.push(`/modal/moment-detail?id=${item.id}`)}
      activeOpacity={0.8}
    >
      {item.imageUri && (
        <Image source={{ uri: item.imageUri }} style={styles.image} />
      )}
      <View style={styles.content}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDateLabel(item.createdAt)}
        </Text>
        <Text style={[styles.text, { color: colors.text }]} numberOfLines={2}>
          {item.title ?? item.note ?? ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={moments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            No moments yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  content: { flex: 1 },
  date: { fontSize: 12, marginBottom: 4 },
  text: { fontSize: 14 },
  empty: { padding: 20, textAlign: 'center' },
});
