import {Composition} from 'remotion';
import {Film, TOTAL} from './Film';

export const Root = () => (
  <Composition id="Bachtarzi" component={Film} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
);
