import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePremium } from '../context/PremiumContext';
import { useDesign } from '../context/DesignContext';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

export default function PremiumGate({ children, fallbackMessage }: Props) {
  const { isPremium } = usePremium();
  const { colors } = useDesign();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.accent }]}>
      <Ionicons name="lock-closed" size={24} color={colors.primary} />
      <Text style={[styles.text, { color: colors.text }]}>
        {fallbackMessage || 'This feature requires Premium'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
