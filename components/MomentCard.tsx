import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Moment } from '../types';
import { useDesign } from '../context/DesignContext';

interface Props {
  moment: Moment;
  onDelete?: (id: string) => void;
}

export default function MomentCard({ moment, onDelete }: Props) {
  const { colors } = useDesign();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Image source={{ uri: moment.photoUri }} style={styles.photo} />
      <View style={styles.info}>
        <Text style={[styles.caption, { color: colors.text }]}>{moment.caption}</Text>
        <Text style={[styles.week, { color: colors.primary }]}>Week {moment.week}</Text>
      </View>
      {onDelete && (
        <TouchableOpacity onPress={() => onDelete(moment.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  photo: {
    width: 64,
    height: 80,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  caption: {
    fontSize: 15,
    fontWeight: '500',
  },
  week: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
});
