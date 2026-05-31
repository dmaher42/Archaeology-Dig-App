import { Composition } from 'remotion';
import { GameTrailer } from './GameTrailer.jsx';
import { OpeningPrologueRender } from './OpeningPrologueRender.jsx';

export const TrailerRoot = () => (
  <>
    <Composition
      id="GameTrailer"
      component={GameTrailer}
      durationInFrames={1500}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="OpeningPrologue"
      component={OpeningPrologueRender}
      durationInFrames={720}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
