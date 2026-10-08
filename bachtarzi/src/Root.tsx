import {Composition} from 'remotion';
import {Film} from './Film';
import TL from './timeline.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Bachtarzi"
    component={Film}
    durationInFrames={TL.duration * TL.fps}
    fps={TL.fps}
    width={TL.width}
    height={TL.height}
  />
);
