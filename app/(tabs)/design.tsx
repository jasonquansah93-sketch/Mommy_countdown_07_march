import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useDesign } from '../../context/DesignContext';
import DesignHeader from '../../components/design/DesignHeader';
import DesignPreview from '../../components/design/DesignPreview';
import PresetsTab from '../../components/design/PresetsTab';
import ColorsTab from '../../components/design/ColorsTab';
import TypographyTab from '../../components/design/TypographyTab';
import PhotoFiltersTab from '../../components/design/PhotoFiltersTab';
import ScreenBackground from '../../components/shared/ScreenBackground';

const TABS = ['Presets', 'Colors', 'Typography', 'Photo &\nFilters'] as const;

export default function DesignScreen() {
  const { colors } = useDesign();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <ScreenBackground>
      <DesignHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Sticky: preview + tab bar - stays visible when scrolling font/filter lists */}
        <View style={[styles.stickyHeader, { backgroundColor: colors.background }]}>
          <DesignPreview />
          <View style={[styles.tabBar, { backgroundColor: colors.background }]}>
          <View style={styles.tabBarInner}>
            {TABS.map((tab, i) => {
              const isActive = activeTab === i;
              return (
                <TouchableOpacity
                  key={tab}
                  style={styles.tab}
                  onPress={() => setActiveTab(i)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: isActive ? colors.primary : colors.textSecondary,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {tab}
                  </Text>
                  {isActive ? (
                    <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={[styles.tabDivider, { backgroundColor: colors.accent }]} />
          </View>
        </View>

        {/* Tab content */}
        {activeTab === 0 ? <PresetsTab /> : null}
        {activeTab === 1 ? <ColorsTab /> : null}
        {activeTab === 2 ? <TypographyTab /> : null}
        {activeTab === 3 ? <PhotoFiltersTab /> : null}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  stickyHeader: {
    paddingBottom: 0,
  },
  tabBar: {
    paddingTop: 12,
  },
  tabBarInner: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 10,
  },
  tabText: {
    fontSize: 13,
    textAlign: 'center',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2.5,
    borderRadius: 2,
  },
  tabDivider: {
    height: 1,
  },
});
