/**
 * Journey Video — on-device slideshow from moment photos.
 * Uses native AVFoundation (VideoComposer module) – no FFmpeg.
 */
import { Platform } from 'react-native';

export type CreateVideoOptions = {
  imageUris: string[];
  aspectRatio?: '9:16' | '16:9';
  durations?: number[];
  filter?: 'none' | 'sepia' | 'bw' | 'vintage';
  transition?: 'fade' | 'wipe' | 'zoom';
  withWatermark?: boolean;
  texts?: string[];
  cropModes?: ('letterbox' | 'crop')[];
  trimStartSeconds?: number;
  trimEndSeconds?: number;
};

export type CreateVideoResult = { success: true; path: string } | { success: false; error: string };

const MODULE_MISSING_MESSAGE =
  'Video erstellen funktioniert nur in der App „Mommy Countdown“. ' +
  'Öffne die App direkt über das App-Icon (nicht über den QR-Code oder Expo Go).';

const FULL_VERSION_MESSAGE =
  'Video-Erstellung fehlgeschlagen. Bitte App neu starten.';

/** Create a slideshow video from image URIs. withWatermark = true for free tier. */
export async function createJourneyVideo(
  imageUris: string[],
  withWatermark: boolean,
  options?: Partial<CreateVideoOptions>
): Promise<CreateVideoResult> {
  if (imageUris.length === 0) {
    return { success: false, error: 'Mindestens ein Foto nötig.' };
  }

  // Keine Expo-Go-Prüfung mehr – wir versuchen es immer und fangen Fehler ab

  // Resolve file paths for native (file:///path -> /path)
  const resolvedUris = imageUris.map((uri) => {
    if (uri.startsWith('file://')) {
      return uri.replace(/^file:\/\//, '');
    }
    return uri;
  });

  if (Platform.OS !== 'ios') {
    return { success: false, error: 'Video-Erstellung ist derzeit nur auf iOS verfügbar.' };
  }

  try {
    const { createVideo } = await import('../modules/video-composer');
    const result = await createVideo({
      imageUris: resolvedUris,
      aspectRatio: options?.aspectRatio ?? '9:16',
      durations: options?.durations ?? resolvedUris.map(() => 4),
      filter: options?.filter ?? 'none',
      transition: options?.transition ?? 'fade',
      withWatermark,
      watermarkText: 'Mommy Countdown',
      texts: options?.texts,
      cropModes: options?.cropModes,
      trimStartSeconds: options?.trimStartSeconds ?? 0,
      trimEndSeconds: options?.trimEndSeconds,
    });

    if (result.success && result.path) {
      return { success: true, path: result.path };
    }
    return {
      success: false,
      error: result.error ?? FULL_VERSION_MESSAGE,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // Native-Modul nicht gefunden (z.B. in Expo Go) → verständliche Meldung
    if (
      message.includes('VideoComposer') ||
      message.includes('native module') ||
      message.includes('Cannot find')
    ) {
      return { success: false, error: MODULE_MISSING_MESSAGE };
    }
    return { success: false, error: message || FULL_VERSION_MESSAGE };
  }
}
