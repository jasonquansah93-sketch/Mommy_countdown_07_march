import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesign } from '../context/DesignContext';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'hourglass',
  journey: 'footsteps',
  design: 'color-palette',
  profile: 'person',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  journey: 'Journey',
  design: 'Design',
  profile: 'Profile',
};

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useDesign();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.accent }]}>
      {state.routes.map((route) => {
        const isFocused = state.index === state.routes.indexOf(route);
        const iconName = TAB_ICONS[route.name] || 'ellipse';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={TAB_LABELS[route.name]}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
          >
            <Ionicons
              name={isFocused ? iconName : (`${iconName}-outline` as keyof typeof Ionicons.glyphMap)}
              size={24}
              color={isFocused ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
});
