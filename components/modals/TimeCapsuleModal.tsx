/**
 * Time Capsule Letter — write a heartfelt letter to your baby.
 * Stored locally, persisted across sessions.
 * Opens as a full-screen modal with an editorial, warm feel.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesign } from '../../context/DesignContext';
import { useProfile } from '../../context/ProfileContext';
import { loadJSON, saveJSON } from '../../utils/storage';
import { RADIUS, SHADOW } from '../../constants/tokens';

const LETTER_KEY = 'baby_time_capsule_letter';

interface LetterData {
  salutation: string;
  body: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

const DEFAULT_SALUTATION = 'Dear little one,';

function getDefaultSalutation(babyName: string | undefined): string {
  const name = babyName?.trim();
  return name ? `Dear ${name},` : DEFAULT_SALUTATION;
}

export default function TimeCapsuleModal({ visible, onClose }: Props) {
  const { colors } = useDesign();
  const { profile } = useProfile();
  const insets = useSafeAreaInsets();
  const [salutation, setSalutation] = useState(DEFAULT_SALUTATION);
  const [letter, setLetter] = useState('');
  const [saved, setSaved] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      loadJSON<LetterData>(LETTER_KEY).then((stored) => {
        if (stored?.body) setLetter(stored.body);
        if (stored?.salutation) {
          setSalutation(stored.salutation);
        } else {
          setSalutation(getDefaultSalutation(profile.name));
        }
      });
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      setSaved(false);
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, profile.name]);

  const handleSave = async () => {
    await saveJSON<LetterData>(LETTER_KEY, { salutation, body: letter });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: '#F8F4EE' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-down" size={24} color="#6B5D4F" />
          </TouchableOpacity>
          <Text style={styles.headerLabel}>Time Capsule</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn} activeOpacity={0.7}>
            <Text style={[styles.saveBtnText, { color: saved ? '#4CAF50' : colors.primary }]}>
              {saved ? 'Saved ✓' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Intro */}
            <View style={styles.introSection}>
              <View style={styles.salutationRow}>
                <TextInput
                  style={styles.introTitle}
                  value={salutation}
                  onChangeText={setSalutation}
                  autoCorrect={false}
                  autoCapitalize="words"
                  returnKeyType="done"
                  maxLength={40}
                  selectTextOnFocus
                />
                <Ionicons name="pencil" size={14} color="#C4906A" style={styles.salutationEditIcon} />
              </View>
              <Text style={styles.introDate}>{today}</Text>
              <Text style={styles.introSubtitle}>
                Write what's in your heart right now. Your baby will read this one day.
              </Text>
            </View>

            {/* Letter Input */}
            <View style={[styles.letterCard, SHADOW.card]}>
              <TextInput
                style={styles.letterInput}
                multiline
                placeholder="Today I'm thinking about you and..."
                placeholderTextColor="rgba(107,93,79,0.4)"
                value={letter}
                onChangeText={setLetter}
                textAlignVertical="top"
                autoCorrect
                autoCapitalize="sentences"
              />
            </View>

            {/* Prompt suggestions */}
            {!letter && (
              <View style={styles.promptSection}>
                <Text style={styles.promptLabel}>Need inspiration?</Text>
                {[
                  'What you dream for them...',
                  'What today feels like for me...',
                  'What I already love about you...',
                  'Our family story so far...',
                ].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={styles.promptPill}
                    activeOpacity={0.7}
                    onPress={() => setLetter(p + ' ')}
                  >
                    <Text style={[styles.promptPillText, { color: colors.primary }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Footer note */}
            <Text style={styles.footerNote}>
              This letter is saved privately on your device. It's just for you and your baby.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveBtn: {
    width: 60,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 60,
    paddingTop: 32,
  },
  introSection: {
    marginBottom: 28,
  },
  salutationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  introTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#2C2825',
    letterSpacing: -0.5,
    flex: 1,
    padding: 0,
  },
  salutationEditIcon: {
    marginLeft: 6,
    marginTop: 4,
    opacity: 0.6,
  },
  introDate: {
    fontSize: 13,
    color: '#9B8F85',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  introSubtitle: {
    fontSize: 15,
    color: '#6B5D4F',
    lineHeight: 22,
    fontWeight: '400',
  },
  letterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    padding: 20,
    minHeight: 260,
  },
  letterInput: {
    fontSize: 17,
    color: '#2C2825',
    lineHeight: 27,
    fontWeight: '400',
    minHeight: 240,
  },
  promptSection: {
    marginTop: 28,
  },
  promptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9B8F85',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  promptPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(196,144,106,0.10)',
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  promptPillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerNote: {
    marginTop: 32,
    fontSize: 13,
    color: '#9B8F85',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
