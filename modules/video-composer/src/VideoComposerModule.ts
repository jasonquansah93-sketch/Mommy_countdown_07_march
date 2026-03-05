import { requireNativeModule } from 'expo';

export type CreateVideoOptions = {
  imageUris: string[];
  aspectRatio?: '9:16' | '16:9';
  durations?: number[];
  filter?: 'none' | 'sepia' | 'bw' | 'vintage';
  transition?: 'fade' | 'wipe' | 'zoom';
  withWatermark?: boolean;
  watermarkText?: string;
  texts?: string[];
  cropModes?: string[];
  trimStartSeconds?: number;
  trimEndSeconds?: number;
};

export type CreateVideoResult = {
  success: boolean;
  path?: string;
  error?: string;
};

interface VideoComposerModuleInterface {
  createVideo(options: Record<string, unknown>): Promise<CreateVideoResult>;
}

const VideoComposerModule = requireNativeModule<VideoComposerModuleInterface>('VideoComposer');

export async function createVideo(options: CreateVideoOptions): Promise<CreateVideoResult> {
  const result = await VideoComposerModule.createVideo({
    imageUris: options.imageUris,
    aspectRatio: options.aspectRatio ?? '9:16',
    durations: options.durations ?? options.imageUris.map(() => 4),
    filter: options.filter ?? 'none',
    transition: options.transition ?? 'fade',
    withWatermark: options.withWatermark ?? true,
    watermarkText: options.watermarkText ?? 'Mommy Countdown',
    texts: options.texts ?? [],
    cropModes: options.cropModes ?? [],
    trimStartSeconds: options.trimStartSeconds ?? 0,
    trimEndSeconds: options.trimEndSeconds,
  });
  return result as CreateVideoResult;
}

export default VideoComposerModule;
