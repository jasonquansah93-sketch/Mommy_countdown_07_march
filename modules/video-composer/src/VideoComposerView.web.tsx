import * as React from 'react';

import { VideoComposerViewProps } from './VideoComposer.types';

export default function VideoComposerView(props: VideoComposerViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
