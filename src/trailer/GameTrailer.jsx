import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Audio } from '@remotion/media';

const asset = (path) => staticFile(path);

const scenes = [
  {
    from: 0,
    duration: 135,
    background: 'assets/expedition/backgrounds/desert-entry/desert-entry-photoreal-sphinx-backdrop.png',
    foreground: 'assets/expedition/environment/egypt-opening/opening-pyramid-facade.png',
    character: 'assets/expedition/bosses/anubis-apparition.png',
    kicker: 'BENEATH THE SAND',
    title: 'THE GOLD WAS REAL',
    subtitle: 'So were the coffins, the carved symbols, and the warning cut into stone.',
    tone: '#f6c56f',
    motif: 'treasure',
  },
  {
    from: 135,
    duration: 135,
    background: 'assets/expedition/backgrounds/catacombs/catacombs-full-scene.png',
    foreground: 'assets/expedition/environment/egypt-opening/opening-tomb-stairwell.png',
    enemy: 'assets/expedition/enemies/warrior-mummy-sprites.png',
    kicker: 'THE FIRST DISCOVERY',
    title: 'WOKE THE DEAD',
    subtitle: 'Ancient bodies rest below the palace, but something down there is listening.',
    tone: '#f97316',
    motif: 'symbols',
  },
  {
    from: 270,
    duration: 135,
    background: 'assets/expedition/backgrounds/desert-entry/desert-entry-full-scene.png',
    character: 'assets/expedition/bosses/opening-sphinx-apparition.png',
    foreground: 'assets/expedition/environment/egypt-opening/scarab-seal-opening.png',
    kicker: 'AT THE EDGE OF THE RUINS',
    title: 'THE WATCHERS APPEAR',
    subtitle: 'Tall figures in dark suits stand where no tracks cross the sand.',
    tone: '#7dd3fc',
    motif: 'watchers',
  },
  {
    from: 405,
    duration: 135,
    background: 'assets/expedition/backgrounds/ruined-temple/ruined-temple-full-scene.png',
    character: 'assets/expedition/player/asha-option-a-source/poses/run_contact.png',
    foreground: 'assets/expedition/environment/egypt-opening/scarab-seal-ground-embedded.png',
    kicker: 'THE QUEST BEGINS',
    title: 'FIND THREE GEMSTONES',
    subtitle: 'Each stone opens a door. Each door pulls the explorer deeper.',
    tone: '#34d399',
    motif: 'gems',
  },
  {
    from: 540,
    duration: 135,
    background: 'assets/expedition/backgrounds/escape-sequence/escape-sequence-final-backdrop.png',
    foreground: 'assets/expedition/environment/egypt-opening/opening-tomb-stairwell.png',
    character: 'assets/expedition/player/asha-option-a-source/poses/attack_swing.png',
    kicker: 'BUT THE PALACE',
    title: 'WAS NEVER REAL',
    subtitle: 'The walls are a dream, and the trap is inside his own head.',
    tone: '#c084fc',
    motif: 'dream',
  },
  {
    from: 675,
    duration: 135,
    background: 'assets/expedition/backgrounds/dig-site-entrance/dig-site-entrance-final-backdrop.png',
    character: 'assets/expedition/player/asha-option-a-source/poses/attack_swing.png',
    foreground: 'assets/expedition/environment/egypt-opening/scarab-seal-opening.png',
    kicker: 'TO WAKE UP',
    title: 'HE MUST PROVE IT',
    subtitle: 'Recover the shards. Read the symbols. Survive the guardians.',
    tone: '#ef4444',
    motif: 'fracture',
  },
  {
    from: 810,
    duration: 135,
    background: 'assets/expedition/backgrounds/ruined-temple/ruined-temple-full-scene.png',
    character: 'assets/expedition/bosses/scarab-queen-sprites.png',
    enemy: 'assets/expedition/enemies/desert-scarab-sprites.png',
    accent: 'assets/expedition/player/khopesh-weapon-pack.png',
    kicker: 'THE FIRST SEAL',
    title: 'DOES NOT OPEN',
    subtitle: 'It tests anyone who mistakes treasure for truth.',
    tone: '#facc15',
    motif: 'scarab',
  },
  {
    from: 945,
    duration: 135,
    background: 'assets/expedition/backgrounds/desert-entry/desert-entry-full-scene.png',
    foreground: 'assets/expedition/environment/egypt-opening/pyramid-climb-pack.png',
    kicker: 'LONG BEFORE THE PHARAOHS',
    title: 'SOMETHING CAME HERE',
    subtitle: 'A forgotten rebellion left its mark on the pyramids.',
    tone: '#bae6fd',
    motif: 'visitors',
  },
  {
    from: 1080,
    duration: 135,
    background: 'assets/expedition/backgrounds/catacombs/catacombs-full-scene.png',
    foreground: 'assets/expedition/environment/egypt-opening/scarab-seal-opening.png',
    character: 'assets/expedition/bosses/anubis-apparition.png',
    kicker: 'THE SECRET',
    title: 'IS CARVED IN STONE',
    subtitle: 'Gold can be stolen. History must be protected.',
    tone: '#fb7185',
    motif: 'symbols',
  },
];

const baseText = {
  fontFamily: 'Cinzel, Georgia, serif',
  textShadow: '0 10px 34px rgba(0,0,0,0.8)',
  letterSpacing: 0,
};

const CinematicBars = () => (
  <>
    <div style={{
      position: 'absolute',
      inset: '0 0 auto',
      height: 118,
      background: 'linear-gradient(#050505, rgba(5,5,5,0.88), transparent)',
      zIndex: 30,
    }} />
    <div style={{
      position: 'absolute',
      inset: 'auto 0 0',
      height: 118,
      background: 'linear-gradient(transparent, rgba(5,5,5,0.88), #050505)',
      zIndex: 30,
    }} />
  </>
);

const Dust = ({ tone = '#f6c56f' }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: 'hidden', zIndex: 11 }}>
      {Array.from({ length: 34 }).map((_, index) => {
        const x = (index * 137) % 1920;
        const y = 160 + ((index * 79) % 780);
        const drift = interpolate(frame + index * 11, [0, 1500], [0, 340], { extrapolateRight: 'extend' });
        const opacity = 0.08 + ((index % 5) * 0.018);
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x + (drift % 260) - 130,
              top: y + Math.sin((frame + index * 17) / 36) * 18,
              width: 3 + (index % 5),
              height: 3 + (index % 5),
              borderRadius: '50%',
              background: tone,
              boxShadow: `0 0 ${16 + (index % 4) * 8}px ${tone}`,
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const SceneMotif = ({ motif, tone }) => {
  const frame = useCurrentFrame();
  const shimmer = interpolate(Math.sin(frame / 12), [-1, 1], [0.35, 0.88]);
  const pulse = interpolate(Math.sin(frame / 18), [-1, 1], [0.9, 1.08]);

  if (motif === 'treasure') {
    return (
      <div style={{
        position: 'absolute',
        right: 150,
        bottom: 104,
        display: 'flex',
        gap: 18,
        transform: `scale(${pulse})`,
        zIndex: 18,
      }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            style={{
              width: 74,
              height: 44,
              borderRadius: 6,
              background: 'linear-gradient(140deg, #fff7ad, #d99a28 48%, #7c4a03)',
              boxShadow: `0 0 ${24 + index * 4}px rgba(250,204,21,${0.35 + shimmer * 0.24})`,
              transform: `translateY(${(index % 2) * 18}px) rotate(${-8 + index * 4}deg)`,
              opacity: 0.72,
            }}
          />
        ))}
      </div>
    );
  }

  if (motif === 'symbols') {
    return (
      <div style={{
        position: 'absolute',
        right: 112,
        top: 122,
        width: 470,
        height: 330,
        border: `2px solid ${tone}55`,
        background: 'rgba(10,8,5,0.24)',
        boxShadow: `0 0 46px ${tone}33, inset 0 0 38px rgba(0,0,0,0.45)`,
        opacity: 0.54 + shimmer * 0.22,
        transform: `rotate(${interpolate(frame, [0, 1500], [-2, 2])}deg)`,
        zIndex: 17,
      }}>
        {['EYE', 'SUN', 'GATE', 'SEAL', 'DREAM', 'STONE'].map((word, index) => (
          <div
            key={word}
            style={{
              position: 'absolute',
              left: 34 + (index % 2) * 220,
              top: 34 + Math.floor(index / 2) * 88,
              color: index % 2 ? '#fff7ed' : tone,
              fontFamily: 'Cinzel, Georgia, serif',
              fontSize: 29,
              fontWeight: 900,
              textShadow: `0 0 20px ${tone}`,
              opacity: 0.62,
            }}
          >
            {word}
          </div>
        ))}
      </div>
    );
  }

  if (motif === 'watchers') {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 18 }}>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              right: 185 + index * 130,
              bottom: 112 + (index === 1 ? 34 : 0),
              width: 54,
              height: 260 + index * 18,
              borderRadius: '28px 28px 10px 10px',
              background: 'linear-gradient(90deg, rgba(0,0,0,0.35), #030303 42%, rgba(42,45,52,0.92))',
              boxShadow: `0 0 38px ${tone}44`,
              opacity: 0.72,
              transform: `translateY(${Math.sin((frame + index * 22) / 26) * 8}px)`,
            }}
          >
            <div style={{
              position: 'absolute',
              left: -4,
              top: -48,
              width: 62,
              height: 62,
              borderRadius: '50%',
              background: 'linear-gradient(#1f2937, #020617)',
              boxShadow: `0 0 24px ${tone}66`,
            }} />
          </div>
        ))}
      </div>
    );
  }

  if (motif === 'gems') {
    return (
      <div style={{
        position: 'absolute',
        right: 160,
        top: 178,
        display: 'flex',
        gap: 58,
        zIndex: 19,
      }}>
        {['#34d399', '#60a5fa', '#f472b6'].map((gemTone, index) => (
          <div
            key={gemTone}
            style={{
              width: 96,
              height: 96,
              background: `linear-gradient(135deg, #fff, ${gemTone} 42%, #082f49)`,
              clipPath: 'polygon(50% 0%, 92% 28%, 78% 100%, 22% 100%, 8% 28%)',
              boxShadow: `0 0 ${38 + shimmer * 28}px ${gemTone}`,
              opacity: 0.86,
              transform: `translateY(${Math.sin((frame + index * 18) / 20) * 18}px) rotate(${45 + index * 11}deg)`,
            }}
          />
        ))}
      </div>
    );
  }

  if (motif === 'dream') {
    return (
      <AbsoluteFill style={{
        zIndex: 16,
        opacity: 0.52,
        background: `repeating-radial-gradient(circle at ${55 + Math.sin(frame / 28) * 10}% ${45 + Math.cos(frame / 34) * 10}%, ${tone}55 0 2px, transparent 3px 38px)`,
        filter: 'blur(0.4px)',
      }} />
    );
  }

  if (motif === 'fracture') {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 17,
        opacity: 0.44 + shimmer * 0.18,
        background: `linear-gradient(112deg, transparent 0 49%, ${tone}88 49.2% 50%, transparent 50.3%), linear-gradient(72deg, transparent 0 58%, ${tone}66 58.2% 58.7%, transparent 59%)`,
      }} />
    );
  }

  if (motif === 'scarab') {
    return (
      <div style={{
        position: 'absolute',
        right: 180,
        top: 126,
        width: 280,
        height: 280,
        borderRadius: '50%',
        border: `4px solid ${tone}88`,
        boxShadow: `0 0 52px ${tone}66, inset 0 0 40px rgba(0,0,0,0.6)`,
        opacity: 0.5,
        transform: `scale(${pulse}) rotate(${frame * 0.12}deg)`,
        zIndex: 17,
      }} />
    );
  }

  if (motif === 'visitors') {
    return (
      <div style={{
        position: 'absolute',
        right: 138,
        top: 116,
        width: 520,
        height: 330,
        zIndex: 17,
        opacity: 0.66,
      }}>
        <div style={{
          position: 'absolute',
          left: 90,
          top: 54,
          width: 330,
          height: 118,
          borderRadius: '50%',
          border: `3px solid ${tone}aa`,
          boxShadow: `0 0 58px ${tone}66`,
          transform: `translateY(${Math.sin(frame / 18) * 10}px)`,
        }} />
        <div style={{
          position: 'absolute',
          left: 242,
          top: 158,
          width: 24,
          height: 150,
          background: `linear-gradient(${tone}99, transparent)`,
          filter: 'blur(8px)',
        }} />
      </div>
    );
  }

  return null;
};

const Scene = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - scene.from;
  const sceneEnd = scene.duration;
  const enter = spring({ frame: Math.max(0, local), fps, config: { damping: 18, stiffness: 70 } });
  const leave = interpolate(local, [sceneEnd - 24, sceneEnd], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = interpolate(local, [0, 18, sceneEnd - 18, sceneEnd], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const push = interpolate(local, [0, sceneEnd], [1.06, 1.18], { extrapolateRight: 'clamp' });
  const textRise = interpolate(enter, [0, 1], [42, 0]);
  const flash = Math.max(0, interpolate(local, [8, 14, 21], [0, 0.22, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  return (
    <Sequence from={scene.from} durationInFrames={scene.duration}>
      <AbsoluteFill style={{ background: '#050505', overflow: 'hidden', opacity }}>
        <Img
          src={asset(scene.background)}
          style={{
            position: 'absolute',
            inset: -36,
            width: 'calc(100% + 72px)',
            height: 'calc(100% + 72px)',
            objectFit: 'cover',
            transform: `scale(${push}) translateX(${interpolate(local, [0, sceneEnd], [-18, 18])}px)`,
            filter: 'contrast(1.14) saturate(1.06) brightness(0.72)',
          }}
        />
        <AbsoluteFill style={{
          background: `radial-gradient(circle at 62% 42%, ${scene.tone}44, transparent 30%), linear-gradient(90deg, rgba(0,0,0,0.92), transparent 44%, rgba(0,0,0,0.86))`,
          mixBlendMode: 'screen',
          opacity: 0.46,
        }} />
        <AbsoluteFill style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.82), transparent 42%, rgba(0,0,0,0.5))' }} />
        <Dust tone={scene.tone} />
        <SceneMotif motif={scene.motif} tone={scene.tone} />
        {scene.foreground && (
          <Img
            src={asset(scene.foreground)}
            style={{
              position: 'absolute',
              right: scene.from === 540 ? 90 : 0,
              bottom: scene.from === 540 ? -120 : -30,
              width: scene.from === 540 ? 610 : 760,
              opacity: 0.58,
              filter: 'drop-shadow(0 28px 60px rgba(0,0,0,0.75))',
              transform: `translateY(${interpolate(local, [0, sceneEnd], [24, -10])}px)`,
            }}
          />
        )}
        {scene.enemy && (
          <Img
            src={asset(scene.enemy)}
            style={{
              position: 'absolute',
              right: 115,
              bottom: scene.from === 405 ? 112 : 88,
              width: scene.from === 405 ? 620 : 520,
              opacity: 0.62,
              filter: 'drop-shadow(0 26px 48px rgba(0,0,0,0.78)) saturate(1.18)',
              transform: `translateX(${interpolate(enter, [0, 1], [120, 0])}px) scale(${scene.from === 405 ? 1.05 : 1})`,
            }}
          />
        )}
        {scene.character && (
          <Img
            src={asset(scene.character)}
            style={{
              position: 'absolute',
              right: scene.from === 135 ? 320 : scene.from === 270 ? 260 : 170,
              bottom: scene.from === 540 ? 86 : scene.from === 0 ? 62 : 72,
              width: scene.from === 135 || scene.from === 270 ? 360 : scene.from === 540 ? 480 : 590,
              opacity: scene.from === 0 || scene.from === 675 ? 0.72 : 0.86,
              filter: `drop-shadow(0 35px 70px rgba(0,0,0,0.86)) drop-shadow(0 0 34px ${scene.tone}55)`,
              transform: `translateY(${interpolate(enter, [0, 1], [48, 0])}px) scale(${interpolate(local, [0, sceneEnd], [0.98, 1.04])})`,
            }}
          />
        )}
        {scene.accent && (
          <Img
            src={asset(scene.accent)}
            style={{
              position: 'absolute',
              right: 140,
              top: 104,
              width: 260,
              opacity: 0.34,
              filter: `drop-shadow(0 0 38px ${scene.tone})`,
              transform: `rotate(${interpolate(local, [0, sceneEnd], [-9, 8])}deg)`,
            }}
          />
        )}
        <div style={{
          position: 'absolute',
          left: 118,
          bottom: 180,
          width: 960,
          transform: `translateY(${textRise}px)`,
          opacity: leave,
          zIndex: 20,
        }}>
          <div style={{
            ...baseText,
            color: scene.tone,
            fontSize: 34,
            fontWeight: 800,
            marginBottom: 22,
          }}>
            {scene.kicker}
          </div>
          <div style={{
            ...baseText,
            color: '#fff7ed',
            fontSize: 74,
            lineHeight: 0.96,
            fontWeight: 900,
            maxWidth: 1040,
          }}>
            {scene.title}
          </div>
          <div style={{
            color: '#f5f5f4',
            fontFamily: 'Georgia, serif',
            fontSize: 32,
            lineHeight: 1.18,
            fontWeight: 700,
            maxWidth: 900,
            marginTop: 26,
            textShadow: '0 8px 26px rgba(0,0,0,0.86)',
          }}>
            {scene.subtitle}
          </div>
          <div style={{
            marginTop: 28,
            width: interpolate(enter, [0, 1], [0, 430]),
            height: 4,
            background: `linear-gradient(90deg, ${scene.tone}, transparent)`,
            boxShadow: `0 0 26px ${scene.tone}`,
          }} />
        </div>
        <AbsoluteFill style={{ background: '#fff', opacity: flash, zIndex: 24 }} />
        <CinematicBars />
      </AbsoluteFill>
    </Sequence>
  );
};

const FinalCard = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - 1215;
  const reveal = spring({ frame: Math.max(0, local), fps, config: { damping: 20, stiffness: 58 } });
  const glow = interpolate(local, [0, 80, 120], [0.2, 0.7, 0.35], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <Sequence from={1215} durationInFrames={285}>
      <AbsoluteFill style={{ background: '#030303', overflow: 'hidden' }}>
        <Img
          src={asset('assets/expedition/backgrounds/dig-site-entrance/base-camp-parallax-pack.png')}
          style={{
            position: 'absolute',
            inset: -40,
            width: 'calc(100% + 80px)',
            height: 'calc(100% + 80px)',
            objectFit: 'cover',
            filter: 'brightness(0.52) contrast(1.18) saturate(0.92)',
            transform: `scale(${interpolate(local, [0, 285], [1.08, 1.16])})`,
          }}
        />
        <AbsoluteFill style={{
          background: `radial-gradient(circle at 50% 52%, rgba(246,197,111,${glow}), transparent 34%), linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.88))`,
        }} />
        <Dust tone="#f6c56f" />
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 265,
          textAlign: 'center',
          transform: `scale(${interpolate(reveal, [0, 1], [0.9, 1])})`,
          opacity: reveal,
        }}>
          <div style={{ ...baseText, color: '#f6c56f', fontSize: 38, fontWeight: 800, marginBottom: 30 }}>
            THE SITE OPENS ONLY TO THOSE WHO PROTECT
          </div>
          <div style={{ ...baseText, color: '#fff7ed', fontSize: 112, lineHeight: 0.9, fontWeight: 900 }}>
            LOST SITE
          </div>
          <div style={{ ...baseText, color: '#fff7ed', fontSize: 112, lineHeight: 0.9, fontWeight: 900 }}>
            EXPEDITION
          </div>
          <div style={{
            ...baseText,
            color: '#d6d3d1',
            fontSize: 32,
            fontWeight: 700,
            marginTop: 42,
            maxWidth: 1180,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.18,
          }}>
            Enter the ruins. Earn the truth. Protect the past.
          </div>
          <div style={{
            ...baseText,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 44,
            minWidth: 320,
            height: 72,
            padding: '0 42px',
            border: '2px solid rgba(246,197,111,0.74)',
            boxShadow: '0 0 34px rgba(246,197,111,0.28), inset 0 0 22px rgba(246,197,111,0.12)',
            color: '#fff7ed',
            fontSize: 28,
            fontWeight: 900,
            textTransform: 'uppercase',
          }}>
            Begin Expedition
          </div>
        </div>
        <CinematicBars />
      </AbsoluteFill>
    </Sequence>
  );
};

export const GameTrailer = () => (
  <AbsoluteFill style={{ background: '#050505' }}>
    <Audio
      src={asset('assets/expedition/audio/valley-of-the-stone-kings.mp3')}
      volume={(frame) => interpolate(frame, [0, 60, 1410, 1500], [0, 0.46, 0.46, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })}
    />
    <Sequence from={0}>
      <Audio src={asset('assets/expedition/sfx/opening/opening-deep-rumble.ogg')} volume={0.24} />
    </Sequence>
    <Sequence from={130}>
      <Audio src={asset('assets/expedition/sfx/generated/stone-gate-open.wav')} volume={0.36} />
    </Sequence>
    <Sequence from={405}>
      <Audio src={asset('assets/expedition/sfx/generated/boss-warning.wav')} volume={0.62} />
    </Sequence>
    <Sequence from={810}>
      <Audio src={asset('assets/expedition/sfx/generated/enemy-hit.wav')} volume={0.52} />
    </Sequence>
    <Sequence from={1080}>
      <Audio src={asset('assets/expedition/sfx/opening/opening-earth-shake.flac')} volume={0.36} />
    </Sequence>
    <Sequence from={675}>
      <Audio src={asset('assets/expedition/sfx/generated/relic-shard.wav')} volume={0.58} />
    </Sequence>
    <Sequence from={1215}>
      <Audio src={asset('assets/expedition/sfx/generated/stone-gate-open.wav')} volume={0.54} />
    </Sequence>
    {scenes.map((scene) => <Scene key={scene.from} scene={scene} />)}
    <FinalCard />
  </AbsoluteFill>
);
