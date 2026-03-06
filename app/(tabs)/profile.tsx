import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProfile } from '../../context/ProfileContext';
import { useDesign } from '../../context/DesignContext';
import { usePremium } from '../../context/PremiumContext';
import { getDaysRemaining, formatDateLabel } from '../../utils/date';
import { loadJSON, saveJSON } from '../../utils/storage';
import ScreenBackground from '../../components/shared/ScreenBackground';
import { SHADOW, RADIUS, GLASS } from '../../constants/tokens';

// ─── Reminders persistence ───────────────────────────────────────────────────
const REMINDERS_KEY = 'mommy_reminders';
interface RemindersState {
  weekly: boolean;
  milestones: boolean;
}

// ─── Premium feature list (copy-only, no new colors) ─────────────────────────
const PREMIUM_FEATURES = [
  {
    icon: 'water-outline',
    title: 'Remove watermark from all shared memories',
    subtitle: 'Share your precious moments beautifully',
  },
  {
    icon: 'image-outline',
    title: 'Export images in high-resolution quality',
    subtitle: 'Perfect for printing and preserving',
  },
  {
    icon: 'gift-outline',
    title: 'Exclusive memory stickers & frames',
    subtitle: 'Personalize your countdown journey',
  },
  {
    icon: 'sparkles-outline',
    title: 'Animated countdown cards',
    subtitle: 'Watch your journey come to life',
  },
  {
    icon: 'heart-outline',
    title: 'Unlimited memories & milestones',
    subtitle: 'Capture every special moment',
  },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ActiveRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  isLast: boolean;
  onPress: () => void;
}
function ActiveRow({ iconName, iconBg, iconColor, label, value, isLast, onPress }: ActiveRowProps) {
  const { colors } = useDesign();
  return (
    <TouchableOpacity
      style={[styles.listRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.accent }]}
      activeOpacity={0.6}
      onPress={onPress}
    >
      <View style={[styles.rowIconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={16} color={colors.accent} style={{ marginLeft: 4 }} />
      </View>
    </TouchableOpacity>
  );
}

interface DisabledRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  isLast: boolean;
}
function DisabledRow({ iconName, iconBg, iconColor, label, value, isLast }: DisabledRowProps) {
  const { colors } = useDesign();
  return (
    <View style={[styles.listRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.accent }]}>
      <View style={[styles.rowIconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={16} color={colors.accent} style={{ marginLeft: 4, opacity: 0.5 }} />
      </View>
    </View>
  );
}

interface ReminderRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: () => void;
  isLast: boolean;
  accentColor: string;
}
function ReminderRow({
  iconName, iconBg, iconColor,
  title, subtitle,
  value, onToggle, isLast,
  accentColor,
}: ReminderRowProps) {
  const { colors } = useDesign();
  return (
    <View style={[styles.listRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.accent }]}>
      <View style={[styles.rowIconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <View style={styles.reminderText}>
        <Text style={[styles.reminderTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.reminderSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.accent, true: accentColor }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.accent}
      />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { profile, updateProfile } = useProfile();
  const { colors } = useDesign();
  const { isPremium, togglePremium } = usePremium();
  const router = useRouter();

  // ── Reminders — persisted ──────────────────────────────────────────────────
  const [remindersWeekly, setRemindersWeekly] = useState(true);
  const [remindersMilestones, setRemindersMilestones] = useState(true);

  useEffect(() => {
    loadJSON<RemindersState>(REMINDERS_KEY).then((saved) => {
      if (saved) {
        setRemindersWeekly(saved.weekly);
        setRemindersMilestones(saved.milestones);
      }
    });
  }, []);

  const toggleWeekly = useCallback(() => {
    setRemindersWeekly((prev) => {
      const next = !prev;
      saveJSON<RemindersState>(REMINDERS_KEY, { weekly: next, milestones: remindersMilestones });
      return next;
    });
  }, [remindersMilestones]);

  const toggleMilestones = useCallback(() => {
    setRemindersMilestones((prev) => {
      const next = !prev;
      saveJSON<RemindersState>(REMINDERS_KEY, { weekly: remindersWeekly, milestones: next });
      return next;
    });
  }, [remindersWeekly]);

  // ── Baby name edit modal ───────────────────────────────────────────────────
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const openNameEdit = () => {
    setNameInput(profile.name || '');
    setIsEditingName(true);
  };

  const saveNameEdit = () => {
    const trimmed = nameInput.trim();
    if (trimmed) updateProfile({ name: trimmed });
    setIsEditingName(false);
  };

  // ── Derived values — same utilities as Countdown ──────────────────────────
  const daysLeft = getDaysRemaining(profile.dueDate);
  const babyName = profile.name || 'Baby';

  // Due date pill text: "DUE MAR 28, 2026" — read-only, derived from global dueDate
  const dueDatePillText = (() => {
    const d = new Date(profile.dueDate);
    if (isNaN(d.getTime())) return 'DUE DATE';
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return `DUE ${month} ${d.getDate()}, ${d.getFullYear()}`;
  })();

  // Due date row value: "Mar 28, 2026" — read-only
  const dueDateRow = formatDateLabel(profile.dueDate);

  // Gender stats
  const genderSymbol =
    profile.gender === 'boy' ? '♂' : profile.gender === 'girl' ? '♀' : '?';
  const genderLabel =
    profile.gender === 'boy' ? 'BOY' : profile.gender === 'girl' ? 'GIRL' : 'SURPRISE';
  // Gender icon color follows theme, not hardcoded
  const genderColor = colors.primary;

  // Row icon colors derived from theme
  const pillBg = colors.primary;
  const iconPrimary = colors.primary;
  const iconPrimaryBg = colors.background;

  return (
    <ScreenBackground>
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Your baby &amp; preferences</Text>
          </View>
          {/* Edit button — opens Baby Name edit only */}
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: colors.accent, backgroundColor: colors.surface }]}
            onPress={openNameEdit}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={17} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Profile Card ─────────────────────────────────────────────────── */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={openNameEdit} activeOpacity={0.7}>
            <Text style={[styles.profileName, { color: colors.text }]}>{babyName}</Text>
          </TouchableOpacity>
          <View style={[styles.duePill, { backgroundColor: pillBg }]}>
            <Ionicons name="calendar-outline" size={11} color="#FFFFFF" style={{ marginRight: 5 }} />
            <Text style={styles.duePillText}>{dueDatePillText}</Text>
          </View>
          <View style={[styles.cardDivider, { backgroundColor: colors.accent }]} />
          <View style={styles.statsRow}>
            {profile.gender != null ? (
              <>
                <View style={styles.statCol}>
                  <Text style={[styles.statSymbol, { color: genderColor }]}>{genderSymbol}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{genderLabel}</Text>
                </View>
                <View style={[styles.statSep, { backgroundColor: colors.accent }]} />
                <View style={styles.statCol}>
                  <Text style={[styles.statNumber, { color: colors.text }]}>{daysLeft}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>DAYS LEFT</Text>
                </View>
              </>
            ) : (
              <View style={styles.statCol}>
                <Text style={[styles.statNumber, { color: colors.text }]}>{daysLeft}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>DAYS LEFT</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Baby Details ─────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Baby Details</Text>
        <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
          <ActiveRow
            iconName="person-outline"
            iconBg={colors.accent}
            iconColor={colors.primary}
            label="Baby Name"
            value={babyName}
            isLast={false}
            onPress={openNameEdit}
          />
          <DisabledRow
            iconName="calendar-outline"
            iconBg={colors.accent}
            iconColor={colors.textSecondary}
            label="Due Date"
            value={dueDateRow}
            isLast={true}
          />
        </View>

        {/* ── Reminders ────────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reminders</Text>
        <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
          <ReminderRow
            iconName="notifications-outline"
            iconBg={iconPrimaryBg}
            iconColor={iconPrimary}
            title="Weekly Update"
            subtitle="New week notification"
            value={remindersWeekly}
            onToggle={toggleWeekly}
            isLast={false}
            accentColor={colors.primary}
          />
          <ReminderRow
            iconName="star-outline"
            iconBg={iconPrimaryBg}
            iconColor={iconPrimary}
            title="Milestones"
            subtitle="Special days &amp; moments"
            value={remindersMilestones}
            onToggle={toggleMilestones}
            isLast={true}
            accentColor={colors.primary}
          />
        </View>

        {/* ── Premium ──────────────────────────────────────────────────────── */}
        <View style={styles.premiumHeaderRow}>
          <Text style={styles.sectionTitle}>Premium</Text>
          <View style={[styles.plusBadge, { backgroundColor: isPremium ? '#34C759' : colors.primary }]}>
            <Text style={styles.plusBadgeText}>{isPremium ? 'ACTIVE' : 'PLUS'}</Text>
          </View>
        </View>

        {isPremium ? (
          <View style={[styles.premiumActiveCard, { backgroundColor: colors.surface }]}>
            <View style={styles.premiumTopRow}>
              <View style={[styles.premiumIconCircle, { backgroundColor: colors.accent }]}>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[styles.premiumCardTitle, { color: colors.text }]}>MommyCount Plus Active</Text>
                <Text style={[styles.premiumCardSubtitle, { color: colors.textSecondary }]}>All features unlocked</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.manageBtn, { borderColor: colors.accent }]}
              activeOpacity={0.7}
              onPress={togglePremium}
            >
              <Text style={[styles.manageBtnText, { color: colors.textSecondary }]}>
                Manage Subscription
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.premiumCard, { backgroundColor: colors.surface }]}>
            <View style={styles.premiumTopRow}>
              <View style={[styles.premiumIconCircle, { backgroundColor: colors.accent }]}>
                <Ionicons name="heart" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[styles.premiumCardTitle, { color: colors.text }]}>MommyCount Plus</Text>
                <Text style={[styles.premiumCardSubtitle, { color: colors.textSecondary }]}>Make every memory perfect</Text>
              </View>
            </View>

            {PREMIUM_FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={[styles.featureIconCircle, { backgroundColor: colors.accent }]}>
                  <Ionicons
                    name={f.icon as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>{f.title}</Text>
                  <Text style={[styles.featureSubtitle, { color: colors.textSecondary }]}>{f.subtitle}</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
              onPress={() => router.push('/modal/paywall')}
            >
              <Text style={styles.ctaText}>Unlock Perfect Memories</Text>
            </TouchableOpacity>
            <Text style={[styles.ctaNote, { color: colors.textSecondary }]}>$4.99 / year  •  Cancel anytime</Text>
          </View>
        )}

        {/* ── App Settings ─────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
        <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
          <ActiveRow
            iconName="globe-outline"
            iconBg={colors.accent}
            iconColor={colors.primary}
            label="Language"
            value="English"
            isLast={false}
            onPress={() => {}}
          />
          <ActiveRow
            iconName="moon-outline"
            iconBg={colors.accent}
            iconColor={colors.primary}
            label="Ambient Mode"
            value={isPremium ? '' : '✦ Plus'}
            isLast={false}
            onPress={() => {
              if (isPremium) {
                router.push('/modal/ambient');
              } else {
                router.push('/modal/paywall');
              }
            }}
          />
          <ActiveRow
            iconName="share-social-outline"
            iconBg={colors.accent}
            iconColor={colors.primary}
            label="Share App"
            value=""
            isLast={false}
            onPress={() => {}}
          />
          <ActiveRow
            iconName="star-outline"
            iconBg={colors.accent}
            iconColor={colors.primary}
            label="Rate Us"
            value=""
            isLast={true}
            onPress={() => {}}
          />
        </View>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colors.textSecondary }]}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={[styles.footerDot, { color: colors.accent }]}>  •  </Text>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colors.textSecondary }]}>Terms of Use</Text>
            </TouchableOpacity>
            <Text style={[styles.footerDot, { color: colors.accent }]}>  •  </Text>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colors.textSecondary }]}>Support</Text>
            </TouchableOpacity>
          </View>
          {!isPremium && (
            <TouchableOpacity
              onPress={() => router.push('/modal/paywall')}
              style={{ marginBottom: 6 }}
            >
              <Text style={styles.restoreLink}>Restore Purchase</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.footerVersion, { color: colors.textSecondary }]}>Version 2.4.0 • Made with ♡ for moms</Text>
        </View>
      </ScrollView>

      {/* ── Baby Name Edit Modal ──────────────────────────────────────────── */}
      <Modal visible={isEditingName} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsEditingName(false)}
          />
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Baby Name</Text>
            <TextInput
              style={[styles.nameInput, { borderColor: colors.accent, color: colors.text, backgroundColor: colors.background }]}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter baby name"
              placeholderTextColor={colors.textSecondary}
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={saveNameEdit}
              maxLength={40}
            />
            <TouchableOpacity
              style={[styles.modalDoneBtn, { backgroundColor: colors.primary }]}
              onPress={saveNameEdit}
              activeOpacity={0.85}
            >
              <Text style={styles.modalDoneBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
    </ScreenBackground>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const CARD_RADIUS = RADIUS.card;
const CARD_SHADOW = SHADOW.card;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS.surface,
    marginTop: 2,
    ...GLASS.shadowSubtle,
  },

  // Profile Card
  profileCard: {
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: CARD_RADIUS,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    ...GLASS.shadow,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  duePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  duePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statSep: {
    width: 1,
    height: 32,
    backgroundColor: '#EBEBEB',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    lineHeight: 34,
  },
  statSymbol: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#AAAAAA',
    letterSpacing: 0.8,
    marginTop: 2,
  },

  // Section title
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
  },

  // List card
  listCard: {
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: CARD_RADIUS,
    marginBottom: 24,
    overflow: 'hidden',
    ...GLASS.shadow,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  listRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F4',
  },
  rowIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 14,
    color: '#888888',
  },

  // Reminder rows
  reminderText: { flex: 1 },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reminderSubtitle: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 1,
  },

  // Premium
  premiumHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  plusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  plusBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  premiumCard: {
    borderRadius: CARD_RADIUS,
    padding: 18,
    marginBottom: 24,
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.border,
    ...GLASS.shadow,
  },
  premiumTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  premiumCardSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  featureIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 20,
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#AAAAAA',
    lineHeight: 17,
  },
  ctaButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ctaNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#AAAAAA',
  },
  premiumActiveCard: {
    borderRadius: CARD_RADIUS,
    padding: 18,
    marginBottom: 24,
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.border,
    ...GLASS.shadow,
  },
  manageBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  manageBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  restoreLink: {
    fontSize: 12,
    color: '#AAAAAA',
    fontWeight: '500',
    textDecorationLine: 'underline',
    marginBottom: 4,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerLink: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },
  footerDot: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  footerVersion: {
    fontSize: 12,
    color: '#BBBBBB',
  },

  // Name edit modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCard: {
    borderRadius: 20,
    padding: 24,
    width: '85%',
    backgroundColor: GLASS.surface,
    borderWidth: 1,
    borderColor: GLASS.borderStrong,
    ...GLASS.shadow,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDoneBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
