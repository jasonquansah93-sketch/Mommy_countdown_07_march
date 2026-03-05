import type { CreateVideoOptions, CreateVideoResult } from './VideoComposerModule';

export async function createVideo(_options: CreateVideoOptions): Promise<CreateVideoResult> {
  return {
    success: false,
    error: 'Video-Erstellung ist nur in der nativen App (iOS) verfügbar.',
  };
}

export default { createVideo };
