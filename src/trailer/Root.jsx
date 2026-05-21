import { Composition } from 'remotion';
import { GameTrailer } from './GameTrailer.jsx';

export const TrailerRoot = () => (
  <Composition
    id="GameTrailer"
    component={GameTrailer}
    durationInFrames={1080}
    fps={30}
    width={1920}
    height={1080}
  />
);
