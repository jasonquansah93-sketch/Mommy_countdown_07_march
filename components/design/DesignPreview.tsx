import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useProfile } from '../../context/ProfileContext';
import { useDesign } from '../../context/DesignContext';
import { getWeeksAndDays, getTimeUntilDue } from '../../utils/date';
import { getResolvedFontFamily } from '../../constants/fonts';
import { getContrastingTextColor, getBadgeTextColor, isLightBackground } from '../../utils/contrast';
import { Ionicons } from '@expo/vector-icons';
import CountdownCardBackground from '../shared/CountdownCardBackground';

export default function DesignPreview() {
  const { profile } = useProfile();
  const { colors, design, setHeadlineText } = useDesign();
  const { weeks, days } = getWeeksAndDays(profile.dueDate);
  const time = getTimeUntilDue(profile.dueDate);

  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(design.headlineText || 'Meeting you in...');

  const genderLabel =
    profile.gender === 'boy'
      ? "IT'S A BOY"
      : profile.gender === 'girl'
        ? "IT'S A GIRL"
        : "IT'S A SURPRISE";

  const displayFont = getResolvedFontFamily(design.fontFamily);
  const showGenderBadge = !design.hideGenderLabel;

  const mode = design.textColorMode ?? 'auto';
  const customColor = design.customTextColor;
  const badgeBg = colors.surface;
  const badgeTextColor = getBadgeTextColor(badgeBg);
  const contentTextColor = getContrastingTextColor(colors.background, mode, customColor);
  const isLightText = isLightBackground(contentTextColor);

  const handleEditStart = () => {
    setTempText(design.headlineText || 'Meeting you in...');
    setIsEditing(true);
  };

  const handleEditDone = () => {
    setHeadlineText(tempText);
    setIsEditing(false);
  };

  return (
    <>
      <CountdownCardBackground
        design={design}
        isLightText={isLightText}
        cardBgColor={colors.surface}
        cardStyle={styles.cardMargin}
      >
        <View style={styles.inner}>
          {/* Gender badge */}
          {showGenderBadge && (
            <View style={[styles.genderBadge, { backgroundColor: colors.surface }]}>
              <Text style={[styles.genderText, { color: badgeTextColor, fontFamily: displayFont }]}>
                {genderLabel}
              </Text>
            </View>
          )}

          {/* Editable headline — same string that HeroCountdownCard uses */}
          <TouchableOpacity onPress={handleEditStart} activeOpacity={0.7}>
            <View style={[styles.headlineRow, !showGenderBadge && { marginTop: 0 }]}>
              <Text style={[styles.subtitle, { color: contentTextColor, fontFamily: displayFont }]}>
                {design.headlineText || 'Tap to edit...'}
              </Text>
              <Ionicons name="pencil" size={14} color={contentTextColor} style={[styles.editIcon, { opacity: 0.8 }]} />
            </View>
          </TouchableOpacity>

          {/* Countdown numbers — WEEKS | DAYS | HOURS */}
          <View style={styles.countdownRow}>
            <View style={styles.unit}>
              <Text style={[styles.number, { color: contentTextColor }]}>{String(weeks).padStart(2, '0')}</Text>
              <Text style={[styles.label, { color: contentTextColor }]}>WEEKS</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.accent }]} />
            <View style={styles.unit}>
              <Text style={[styles.number, { color: contentTextColor }]}>{String(days).padStart(2, '0')}</Text>
              <Text style={[styles.label, { color: contentTextColor }]}>DAYS</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.accent }]} />
            <View style={styles.unit}>
              <Text style={[styles.number, { color: contentTextColor }]}>
                {String(time.hours).padStart(2, '0')}
              </Text>
              <Text style={[styles.label, { color: contentTextColor }]}>HOURS</Text>
            </View>
          </View>
        </View>
      </CountdownCardBackground>

      {/* Inline headline edit modal */}
      <Modal visible={isEditing} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleEditDone}
          />
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Headline</Text>
            <TextInput
              style={[styles.textInput, { fontFamily: displayFont, color: colors.text, borderColor: colors.accent, backgroundColor: colors.background }]}
              value={tempText}
              onChangeText={setTempText}
              placeholder="Enter headline text..."
              placeholderTextColor={colors.textSecondary}
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={handleEditDone}
            />
            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: colors.primary }]} onPress={handleEditDone}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardMargin: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  inner: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  genderBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  editIcon: {
    marginLeft: 8,
    opacity: 0.6,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unit: {
    alignItems: 'center',
    minWidth: 70,
  },
  number: {
    fontSize: 48,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#888',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 48,
    marginHorizontal: 16,
  },
  // Modal
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2D2D2D',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#2D2D2D',
    marginBottom: 16,
    textAlign: 'center',
  },
  doneBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
