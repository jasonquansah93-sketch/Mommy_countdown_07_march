import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DesignPreview from '../../components/design/DesignPreview';
import PresetsTab from '../../components/design/PresetsTab';
import ColorsTab from '../../components/design/ColorsTab';
import TypographyTab from '../../components/design/TypographyTab';
import PhotoFiltersTab from '../../components/design/PhotoFiltersTab';

const TABS = ['Presets', 'Colors', 'Typography', 'Photo'] as const;

export default function DesignScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={s.screen}>

      {/* ── Botanical background — same as Home ── */}
      <Image
        source={require('../../assets/images/floral-bg.png')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={s.hBack} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={18} color="#6B5C4D" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>
            <Text style={s.headerTitleB}>Design</Text>
            <Text style={s.headerTitleL}> Studio</Text>
          </Text>
          <Text style={s.headerSub}>Make it truly yours</Text>
        </View>
        <View style={s.hBack} />
      </View>

      <ScrollView
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 108 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* ── Sticky: Preview + Tab Bar ── */}
        <View style={s.stickyBlock}>

          {/* Mini preview card */}
          <View style={s.previewWrap}>
            <DesignPreview />
          </View>

          {/* Tab bar — warm editorial pills */}
          <View style={s.tabBar}>
            {TABS.map((tab, i) => {
              const active = activeTab === i;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[s.tab, active && s.tabActive]}
                  onPress={() => setActiveTab(i)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.tabTxt, active && s.tabTxtActive]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={s.tabHairline} />
        </View>

        {/* ── Tab Content ── */}
        <View style={s.content}>
          {activeTab === 0 && <PresetsTab />}
          {activeTab === 1 && <ColorsTab />}
          {activeTab === 2 && <TypographyTab />}
          {activeTab === 3 && <PhotoFiltersTab />}
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E8D8C4' },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  hBack: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, letterSpacing: -0.3 },
  headerTitleB: { color: '#2C211A', fontWeight: '700' },
  headerTitleL: { color: '#A09282', fontWeight: '300' },
  headerSub: {
    fontSize: 11, color: '#A08C76', letterSpacing: 0.8,
    marginTop: 1, fontFamily: 'Georgia', fontStyle: 'italic',
  },

  /* Sticky block */
  stickyBlock: {
    backgroundColor: 'rgba(240,232,220,0.96)',
  },
  previewWrap: { paddingTop: 4 },

  /* Tab bar */
  tabBar: {
    flexDirection: 'row', paddingHorizontal: 16,
    paddingTop: 12, paddingBottom: 2, gap: 8,
  },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.50)',
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
  },
  tabActive: {
    backgroundColor: 'rgba(192,154,114,0.18)',
    borderColor: 'rgba(168,126,82,0.40)',
  },
  tabTxt: {
    fontSize: 12, fontWeight: '500',
    color: '#A09080', letterSpacing: 0.2,
  },
  tabTxtActive: {
    color: '#7A5830', fontWeight: '700',
  },
  tabHairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120,90,60,0.20)',
    marginTop: 10,
  },

  /* Content */
  content: { paddingHorizontal: 16, paddingTop: 16 },
});
