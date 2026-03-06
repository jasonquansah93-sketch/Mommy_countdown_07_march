/**
 * Heartbeat haptic — a gentle double-pulse on every app open.
 * Feels like a heartbeat: soft thump ... thump.
 * Respects devices without haptic support (silently no-ops).
 */
import * as Haptics from 'expo-haptics';

export async function heartbeatPulse(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise((r) => setTimeout(r, 180));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Device doesn't support haptics — silent no-op
  }
}
