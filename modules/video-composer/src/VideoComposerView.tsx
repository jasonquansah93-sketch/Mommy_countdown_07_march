import { requireNativeView } from 'expo';
import * as React from 'react';

import { VideoComposerViewProps } from './VideoComposer.types';

const NativeView: React.ComponentType<VideoComposerViewProps> =
  requireNativeView('VideoComposer');

export default function VideoComposerView(props: VideoComposerViewProps) {
  return <NativeView {...props} />;
}
