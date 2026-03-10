import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Modal, TextInput, KeyboardAvoidingView,
  Platform, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useProfile } from '../../context/ProfileContext';
import { usePremium } from '../../context/PremiumContext';
import { getDaysRemaining, formatDateLabel } from '../../utils/date';
import { loadJSON, saveJSON } from '../../utils/storage';

// ─── Reminders ───────────────────────────────────────────────────────────────
const REMINDERS_KEY = 'mommy_reminders';
interface RemindersState { weekly: boolean; milestones: boolean }

// ─── Premium features list ────────────────────────────────────────────────────
const PREMIUM_FEATURES = [
  { icon: 'water-outline',    title: 'Remove watermark from shared memories',   sub: 'Share your precious moments beautifully' },
  { icon: 'image-outline',    title: 'Export images in high-resolution quality', sub: 'Perfect for printing and preserving' },
  { icon: 'gift-outline',     title: 'Exclusive memory stickers & frames',       sub: 'Personalise your countdown journey' },
  { icon: 'sparkles-outline', title: 'Animated countdown cards',                 sub: 'Watch your journey come to life' },
  { icon: 'heart-outline',    title: 'Unlimited memories & milestones',          sub: 'Capture every special moment' },
] as const;

// ─── Shared row sub-components ────────────────────────────────────────────────
interface ActiveRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string; value?: string; isLast: boolean; onPress: () => void;
}
function ActiveRow({ iconName, label, value, isLast, onPress }: ActiveRowProps) {
  return (
    <TouchableOpacity
      style={[s.listRow, !isLast && s.listRowBorder]}
      activeOpacity={0.6}
      onPress={onPress}
    >
      <View style={s.rowIcon}>
        <Ionicons name={iconName} size={17} color="#C09A72" />
      </View>
      <Text style={s.rowLabel}>{label}</Text>
      <View style={s.rowRight}>
        {value ? <Text style={s.rowValue}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={15} color="rgba(160,140,118,0.55)" style={{ marginLeft: 4 }} />
      </View>
    </TouchableOpacity>
  );
}

interface DisabledRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string; value?: string; isLast: boolean;
}
function DisabledRow({ iconName, label, value, isLast }: DisabledRowProps) {
  return (
    <View style={[s.listRow, !isLast && s.listRowBorder]}>
      <View style={s.rowIcon}>
        <Ionicons name={iconName} size={17} color="rgba(192,154,114,0.55)" />
      </View>
      <Text style={[s.rowLabel, { opacity: 0.55 }]}>{label}</Text>
      <View style={s.rowRight}>
        {value ? <Text style={[s.rowValue, { opacity: 0.55 }]}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={15} color="rgba(160,140,118,0.28)" style={{ marginLeft: 4 }} />
      </View>
    </View>
  );
}

interface ReminderRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string; subtitle: string;
  value: boolean; onToggle: () => void; isLast: boolean;
}
function ReminderRow({ iconName, title, subtitle, value, onToggle, isLast }: ReminderRowProps) {
  return (
    <View style={[s.listRow, !isLast && s.listRowBorder]}>
      <View style={s.rowIcon}>
        <Ionicons name={iconName} size={17} color="#C09A72" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowLabel}>{title}</Text>
        <Text style={s.reminderSub}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: 'rgba(180,155,125,0.25)', true: 'rgba(192,154,114,0.70)' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="rgba(180,155,125,0.25)"
      />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { profile, updateProfile } = useProfile();
  const { isPremium, togglePremium } = usePremium();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  // ── Reminders ──────────────────────────────────────────────────────────────
  const [remindersWeekly,     setRemindersWeekly]     = useState(true);
  const [remindersMilestones, setRemindersMilestones] = useState(true);

  useEffect(() => {
    loadJSON<RemindersState>(REMINDERS_KEY).then(saved => {
      if (saved) { setRemindersWeekly(saved.weekly); setRemindersMilestones(saved.milestones); }
    });
  }, []);

  const toggleWeekly = useCallback(() => {
    setRemindersWeekly(prev => {
      const next = !prev;
      saveJSON<RemindersState>(REMINDERS_KEY, { weekly: next, milestones: remindersMilestones });
      return next;
    });
  }, [remindersMilestones]);

  const toggleMilestones = useCallback(() => {
    setRemindersMilestones(prev => {
      const next = !prev;
      saveJSON<RemindersState>(REMINDERS_KEY, { weekly: remindersWeekly, milestones: next });
      return next;
    });
  }, [remindersWeekly]);

  // ── Baby name edit ─────────────────────────────────────────────────────────
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput,     setNameInput]     = useState('');

  const openNameEdit = () => { setNameInput(profile.name || ''); setIsEditingName(true); };
  const saveNameEdit = () => {
    const trimmed = nameInput.trim();
    if (trimmed) updateProfile({ name: trimmed });
    setIsEditingName(false);
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const daysLeft = getDaysRemaining(profile.dueDate);
  const babyName = profile.name || 'Baby';

  const dueDatePillText = (() => {
    const d = new Date(profile.dueDate);
    if (isNaN(d.getTime())) return 'DUE DATE';
    return `DUE ${d.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${d.getDate()}, ${d.getFullYear()}`;
  })();

  const dueDateRow = formatDateLabel(profile.dueDate);

  const genderSymbol = profile.gender === 'boy' ? '♂' : profile.gender === 'girl' ? '♀' : '?';
  const genderLabel  = profile.gender === 'boy' ? 'BOY' : profile.gender === 'girl' ? 'GIRL' : 'SURPRISE';

  return (
    <View style={s.screen}>
      {/* ── Botanical background ── */}
      <Image
        source={require('../../assets/images/floral-bg.png')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <View style={s.hSpacer} />
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>
            <Text style={s.headerTitleL}>My</Text>
            <Text style={s.headerTitleB}> Profile</Text>
          </Text>
          <Text style={s.headerSub}>Your baby & preferences</Text>
        </View>
        <TouchableOpacity style={s.hBtn} onPress={openNameEdit} activeOpacity={0.8}>
          <Ionicons name="pencil" size={16} color="#6B5C4D" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 108 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Profile card ── */}
        <View style={s.profileCard}>
          <LinearGradient
            colors={['rgba(253,247,239,0.97)', 'rgba(244,236,224,0.94)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <TouchableOpacity onPress={openNameEdit} activeOpacity={0.7}>
            <Text style={s.profileName}>{babyName}</Text>
          </TouchableOpacity>
          <View style={s.duePill}>
            <Ionicons name="calendar-outline" size={11} color="#FFF8EF" style={{ marginRight: 5 }} />
            <Text style={s.duePillTxt}>{dueDatePillText}</Text>
          </View>
          <View style={s.cardHairline} />
          <View style={s.statsRow}>
            {profile.gender != null && (
              <>
                <View style={s.statCol}>
                  <Text style={s.statSymbol}>{genderSymbol}</Text>
                  <Text style={s.statLabel}>{genderLabel}</Text>
                </View>
                <View style={s.statSep} />
              </>
            )}
            <View style={s.statCol}>
              <Text style={s.statNumber}>{daysLeft}</Text>
              <Text style={s.statLabel}>DAYS LEFT</Text>
            </View>
          </View>
        </View>

        {/* ── Baby Details ── */}
        <Text style={s.sectionLabel}>BABY DETAILS</Text>
        <View style={s.listCard}>
          <LinearGradient
            colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <ActiveRow   iconName="person-outline"   label="Baby Name" value={babyName}    isLast={false} onPress={openNameEdit} />
          <DisabledRow iconName="calendar-outline" label="Due Date"  value={dueDateRow}  isLast={true} />
        </View>

        {/* ── Reminders ── */}
        <Text style={s.sectionLabel}>REMINDERS</Text>
        <View style={s.listCard}>
          <LinearGradient
            colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <ReminderRow
            iconName="notifications-outline"
            title="Weekly Update" subtitle="New week notification"
            value={remindersWeekly} onToggle={toggleWeekly} isLast={false}
          />
          <ReminderRow
            iconName="star-outline"
            title="Milestones" subtitle="Special days & moments"
            value={remindersMilestones} onToggle={toggleMilestones} isLast={true}
          />
        </View>

        {/* ── Premium ── */}
        <View style={s.premiumHeaderRow}>
          <Text style={s.sectionLabel}>PREMIUM</Text>
          <View style={[s.plusBadge, { backgroundColor: isPremium ? '#6BAA8A' : '#C09A72' }]}>
            <Text style={s.plusBadgeTxt}>{isPremium ? 'ACTIVE' : 'PLUS'}</Text>
          </View>
        </View>

        {isPremium ? (
          <View style={s.listCard}>
            <LinearGradient
              colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={s.premiumTopRow}>
              <View style={[s.premiumIconCircle, { backgroundColor: 'rgba(107,170,138,0.16)' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#6BAA8A" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.premiumCardTitle}>MommyCount Plus Active</Text>
                <Text style={s.premiumCardSub}>All features unlocked</Text>
              </View>
            </View>
            <TouchableOpacity
              style={s.manageBtn}
              activeOpacity={0.7}
              onPress={togglePremium}
            >
              <Text style={s.manageBtnTxt}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.listCard}>
            <LinearGradient
              colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={s.premiumTopRow}>
              <View style={s.premiumIconCircle}>
                <Ionicons name="heart" size={22} color="#C09A72" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.premiumCardTitle}>MommyCount Plus</Text>
                <Text style={s.premiumCardSub}>Make every memory perfect</Text>
              </View>
            </View>

            {PREMIUM_FEATURES.map((f, i) => (
              <View key={i} style={s.featureRow}>
                <View style={s.featureIconCircle}>
                  <Ionicons name={f.icon as keyof typeof Ionicons.glyphMap} size={15} color="#C09A72" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.featureTitle}>{f.title}</Text>
                  <Text style={s.featureSub}>{f.sub}</Text>
                </View>
              </View>
            ))}

            <View style={s.ctaWrap}>
              <LinearGradient
                colors={['#C09A72', '#A87E52']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
              <TouchableOpacity
                style={s.ctaInner}
                onPress={() => router.push('/modal/paywall')}
                activeOpacity={0.85}
              >
                <Text style={s.ctaTxt}>Unlock Perfect Memories</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.ctaNote}>$4.99 / year  •  Cancel anytime</Text>
          </View>
        )}

        {/* ── App Settings ── */}
        <Text style={s.sectionLabel}>APP SETTINGS</Text>
        <View style={s.listCard}>
          <LinearGradient
            colors={['rgba(253,247,239,0.96)', 'rgba(244,236,224,0.92)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <ActiveRow iconName="globe-outline"        label="Language"     value="English"                    isLast={false} onPress={() => {}} />
          <ActiveRow iconName="moon-outline"          label="Ambient Mode" value={isPremium ? '' : '✦ Plus'}  isLast={false}
            onPress={() => router.push(isPremium ? '/modal/ambient' : '/modal/paywall')} />
          <ActiveRow iconName="share-social-outline"  label="Share App"    value=""                           isLast={false} onPress={() => {}} />
          <ActiveRow iconName="star-outline"          label="Rate Us"      value=""                           isLast={true}  onPress={() => {}} />
        </View>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <View style={s.footerLinks}>
            <TouchableOpacity><Text style={s.footerLink}>Privacy Policy</Text></TouchableOpacity>
            <Text style={s.footerDot}>  ·  </Text>
            <TouchableOpacity><Text style={s.footerLink}>Terms of Use</Text></TouchableOpacity>
            <Text style={s.footerDot}>  ·  </Text>
            <TouchableOpacity><Text style={s.footerLink}>Support</Text></TouchableOpacity>
          </View>
          {!isPremium && (
            <TouchableOpacity onPress={() => router.push('/modal/paywall')} style={{ marginBottom: 6 }}>
              <Text style={s.restoreLink}>Restore Purchase</Text>
            </TouchableOpacity>
          )}
          <Text style={s.footerVersion}>Version 2.4.0  •  Made with ♡ for moms</Text>
        </View>

      </ScrollView>

      {/* ── Baby Name Edit Modal ── */}
      <Modal visible={isEditingName} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.modalOverlay}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setIsEditingName(false)}
          >
            <View style={[StyleSheet.absoluteFillObject, s.modalBackdrop]} />
          </TouchableOpacity>

          <View style={s.modalCard}>
            <LinearGradient
              colors={['rgba(253,247,239,0.99)', 'rgba(244,236,224,0.98)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={s.modalTitle}>Baby's Name</Text>
            <TextInput
              style={s.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter baby name"
              placeholderTextColor="rgba(160,140,118,0.60)"
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={saveNameEdit}
              maxLength={40}
            />
            <View style={s.modalBtnWrap}>
              <LinearGradient
                colors={['#C09A72', '#A87E52']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
              <TouchableOpacity style={s.modalBtnInner} onPress={saveNameEdit} activeOpacity={0.85}>
                <Text style={s.modalBtnTxt}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E8D8C4' },

  /* ── Header ── */
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 14,
  },
  hSpacer: { width: 36, height: 36 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, letterSpacing: -0.3 },
  headerTitleL: { color: '#A09282', fontWeight: '300' },
  headerTitleB: { color: '#2C211A', fontWeight: '700' },
  headerSub: {
    fontSize: 11, color: '#A08C76', letterSpacing: 0.8,
    marginTop: 2, fontFamily: 'Georgia', fontStyle: 'italic',
  },
  hBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* ── Scroll ── */
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  /* ── Section label ── */
  sectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2.0,
    color: '#A08C76', marginBottom: 10, marginTop: 4,
  },

  /* ── Profile card ── */
  profileCard: {
    borderRadius: 20, overflow: 'hidden', position: 'relative',
    alignItems: 'center',
    paddingTop: 28, paddingBottom: 22, paddingHorizontal: 16,
    marginBottom: 28,
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09, shadowRadius: 10, elevation: 3,
  },
  profileName: {
    fontSize: 28, fontWeight: '300', color: '#2C211A',
    fontFamily: 'Georgia', fontStyle: 'italic',
    letterSpacing: -0.5, marginBottom: 10,
  },
  duePill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#C09A72',
    marginBottom: 18,
  },
  duePillTxt: { color: '#FFF8EF', fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  cardHairline: {
    width: '100%', height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120,90,60,0.20)', marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row', width: '100%',
    alignItems: 'center', justifyContent: 'center',
  },
  statCol: { flex: 1, alignItems: 'center' },
  statSep: {
    width: StyleSheet.hairlineWidth, height: 36,
    backgroundColor: 'rgba(120,90,60,0.22)',
  },
  statNumber: {
    fontSize: 34, fontWeight: '300', color: '#2C211A',
    fontFamily: 'Georgia', letterSpacing: -1, lineHeight: 40,
  },
  statSymbol: {
    fontSize: 30, fontWeight: '300', color: '#C09A72',
    fontFamily: 'Georgia', lineHeight: 38,
  },
  statLabel: {
    fontSize: 10, fontWeight: '700', color: '#A08C76',
    letterSpacing: 1.4, marginTop: 2,
  },

  /* ── List card ── */
  listCard: {
    borderRadius: 16, overflow: 'hidden', position: 'relative',
    marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(180,155,125,0.20)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  listRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 15,
  },
  listRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(120,90,60,0.18)',
  },
  rowIcon: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(192,154,114,0.14)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#2C211A' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontSize: 14, color: '#9A8472' },
  reminderSub: { fontSize: 12, color: '#9A8472', marginTop: 1 },

  /* ── Premium header row ── */
  premiumHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 10, marginTop: 4,
  },
  plusBadge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
  },
  plusBadgeTxt: { color: '#FFF8EF', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },

  /* ── Premium card internals ── */
  premiumTopRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 18, marginBottom: 16,
  },
  premiumIconCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(192,154,114,0.16)',
    alignItems: 'center', justifyContent: 'center',
  },
  premiumCardTitle: { fontSize: 16, fontWeight: '700', color: '#2C211A' },
  premiumCardSub:   { fontSize: 13, color: '#9A8472', marginTop: 2 },

  featureRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, marginBottom: 14,
  },
  featureIconCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(192,154,114,0.14)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  featureTitle: { fontSize: 14, fontWeight: '600', color: '#2C211A', lineHeight: 20 },
  featureSub:   { fontSize: 12, color: '#9A8472', lineHeight: 17 },

  ctaWrap: {
    overflow: 'hidden', borderRadius: 14, position: 'relative',
    marginHorizontal: 16, marginTop: 4, marginBottom: 10,
  },
  ctaInner: { paddingVertical: 16, alignItems: 'center' },
  ctaTxt:   { color: '#FFF8EF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  ctaNote:  {
    textAlign: 'center', fontSize: 12, color: '#9A8472',
    paddingBottom: 18,
  },

  manageBtn: {
    marginHorizontal: 16, marginTop: 4, marginBottom: 18,
    paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(168,126,82,0.30)',
    alignItems: 'center',
  },
  manageBtnTxt: { fontSize: 14, fontWeight: '500', color: '#9A8472' },

  /* ── Footer ── */
  footer: { alignItems: 'center', paddingVertical: 16 },
  footerLinks: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  footerLink:    { fontSize: 12, color: '#9A8472', fontWeight: '500' },
  footerDot:     { fontSize: 12, color: 'rgba(160,140,118,0.55)' },
  restoreLink: {
    fontSize: 12, color: '#B0997E',
    textDecorationLine: 'underline', marginBottom: 6,
  },
  footerVersion: {
    fontSize: 11, color: 'rgba(160,140,118,0.65)',
    fontFamily: 'Georgia', fontStyle: 'italic',
  },

  /* ── Name edit modal ── */
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { backgroundColor: 'rgba(44,33,26,0.50)' },
  modalCard: {
    borderRadius: 22, overflow: 'hidden', position: 'relative',
    padding: 24, width: '85%',
    borderWidth: 1, borderColor: 'rgba(168,126,82,0.25)',
    shadowColor: '#7A5E3C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '600', color: '#2C211A',
    fontFamily: 'Georgia', fontStyle: 'italic',
    textAlign: 'center', marginBottom: 16,
  },
  nameInput: {
    borderWidth: 1.5, borderRadius: 12, borderColor: 'rgba(168,126,82,0.35)',
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 17, color: '#2C211A',
    backgroundColor: 'rgba(255,255,255,0.60)',
    marginBottom: 16, textAlign: 'center',
  },
  modalBtnWrap: {
    overflow: 'hidden', borderRadius: 12, position: 'relative',
  },
  modalBtnInner: { paddingVertical: 14, alignItems: 'center' },
  modalBtnTxt:   { color: '#FFF8EF', fontSize: 16, fontWeight: '700' },
});
