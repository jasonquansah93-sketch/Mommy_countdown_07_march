import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

export default function JourneyScreen() {
  const router = useRouter();

  const hasMoments = false; // TODO: Connect to PregnancyContext

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.title}>Your Pregnancy Story</Text>
        <Text style={styles.subtitle}>
          Every moment, memory and milestone in one place.
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Your Moments</Text>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Your story starts with the first moment you save.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Create Video</Text>
        <Text style={styles.videoDescription}>
          Relive your journey as a beautiful video — create one anytime from your
          moments.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.videoButton,
            pressed && styles.videoButtonPressed,
          ]}
          onPress={() => router.push('/video-wizard')}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.videoButtonGradient}
          >
            <Ionicons name="videocam" size={22} color="#FFF" />
            <Text style={styles.videoButtonText}>Video erstellen</Text>
          </LinearGradient>
        </Pressable>
        <Text style={styles.helperText}>
          Photo, note or memory from today
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  placeholderCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  videoDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  videoButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoButtonPressed: { opacity: 0.9 },
  videoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  videoButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});
