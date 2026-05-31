import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const asset = (path) => staticFile(path);

const evidenceItems = [
  {
    label: 'Site Update',
    title: 'Museum Report',
    lines: [
      'A newly exposed scarab carving has been recorded near the summit.',
      'Earlier surveys do not show the marking.',
      'Cause of exposure unknown.',
    ],
  },
  {
    label: 'Archive Photograph',
    title: 'Excavation Photo',
    lines: [
      'Asha has seen this scarab shape before.',
      'No matching scarab had ever been recorded at this pyramid.',
    ],
  },
  {
    label: "Asha's Field Notes",
    title: "Asha's Notes",
    lines: [
      'The records do not match.',
      'Either way, it needs to be checked.',
    ],
  },
];

const scenes = [
  {
    from: 0,
    duration: 120,
    kicker: 'Heritage Research - Cairo',
    title: 'The archive points to one scarab.',
    subtitle: 'Asha reviews the records before visiting the pyramid site.',
    background: 'archive',
  },
  {
    from: 120,
    duration: 90,
    kicker: 'Travel to Pyramid',
    title: 'The records are enough.',
    subtitle: 'The site check is authorised.',
    background: 'assets/expedition/backgrounds/desert-entry/desert-entry-photoreal-sphinx-backdrop.png',
    foreground: 'assets/expedition/environment/egypt-opening/opening-pyramid-facade.png',
  },
  {
    from: 210,
    duration: 120,
    kicker: 'Pyramid Site',
    title: 'The climb is familiar.',
    subtitle: 'Sun on stone. Wind across the sand. A routine site check.',
    background: 'assets/expedition/backgrounds/desert-entry/desert-entry-full-scene.png',
    foreground: 'assets/expedition/environment/egypt-opening/opening-pyramid-facade.png',
    character: 'assets/expedition/player/asha-final-production-reference.png',
  },
  {
    from: 330,
    duration: 120,
    kicker: 'Scarab - Floor Carving',
    title: 'Plain stone. Easy to miss.',
    subtitle: 'Old stone. A symbol worn almost smooth. No glow. No sound.',
    background: 'assets/expedition/backgrounds/desert-entry/desert-entry-full-scene.png',
    foreground: 'assets/expedition/environment/egypt-opening/scarab-seal-ground-embedded.png',
  },
  {
    from: 450,
    duration: 150,
    kicker: 'Threshold Opened',
    title: 'Then the stone beneath her moves.',
    subtitle: 'The scarab was not decoration. It was a seal.',
    background: 'assets/expedition/backgrounds/desert-entry/desert-entry-full-scene.png',
    foreground: 'assets/expedition/environment/egypt-opening/scarab-seal-opening.png',
    stairwell: 'assets/expedition/environment/egypt-opening/opening-tomb-stairwell.png',
  },
  {
    from: 600,
    duration: 120,
    kicker: 'Enter the Lost Site',
    title: 'The world below is not the site Asha climbed.',
    subtitle: 'The existing Lost Site Expedition begins.',
    background: 'assets/expedition/environment/egypt-opening/opening-tomb-stairwell.png',
  },
];

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const fade = (frame, from, duration) => interpolate(
  frame,
  [from, from + 18, from + duration - 18, from + duration],
  [0, 1, 1, 0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease },
);

const Dust = ({ tone = '#d7aa5c' }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: 'hidden', zIndex: 9 }}>
      {Array.from({ length: 42 }).map((_, index) => {
        const drift = interpolate(frame + index * 7, [0, 720], [0, 280], {
          extrapolateRight: 'extend',
        });
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: ((index * 149) % 1920) + (drift % 220) - 120,
              top: 110 + ((index * 83) % 780) + Math.sin((frame + index * 19) / 34) * 18,
              width: 3 + (index % 4),
              height: 3 + (index % 4),
              borderRadius: '50%',
              background: tone,
              boxShadow: `0 0 ${14 + (index % 5) * 6}px ${tone}`,
              opacity: 0.06 + (index % 5) * 0.018,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const EvidenceArchive = ({ opacity }) => {
  const frame = useCurrentFrame();
  const cardReveal = (index) => interpolate(frame, [20 + index * 15, 48 + index * 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  return (
    <AbsoluteFill style={{ opacity, background: 'radial-gradient(circle at 50% 8%, #362411, #120d09 58%, #070605)' }}>
      <Dust tone="#caa86e" />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, rgba(0,0,0,0.9), transparent 48%, rgba(0,0,0,0.72))',
      }} />
      <div style={{
        position: 'absolute',
        right: 130,
        top: 155,
        width: 640,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 22,
      }}>
        {evidenceItems.map((item, index) => {
          const reveal = cardReveal(index);
          return (
            <div
              key={item.label}
              style={{
                padding: '22px 26px',
                borderRadius: 8,
                border: '1px solid rgba(202,168,110,0.28)',
                borderLeft: '5px solid #caa86e',
                background: 'rgba(18,13,9,0.82)',
                boxShadow: '0 22px 52px rgba(0,0,0,0.34)',
                opacity: reveal,
                transform: `translateY(${interpolate(reveal, [0, 1], [34, 0])}px)`,
              }}
            >
              <div style={{ color: '#caa86e', fontSize: 18, fontWeight: 900, textTransform: 'uppercase' }}>{item.label}</div>
              <div style={{ color: '#fff3dd', fontFamily: 'Cinzel, Georgia, serif', fontSize: 30, fontWeight: 800, marginTop: 8 }}>{item.title}</div>
              {item.lines.map((line) => (
                <div key={line} style={{ color: '#d8c49c', fontSize: 20, lineHeight: 1.25, marginTop: 8 }}>{line}</div>
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Scene = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - scene.from;
  const opacity = fade(frame, scene.from, scene.duration);
  const textIn = interpolate(local, [0, 1.1 * fps], [52, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const slowPush = interpolate(local, [0, scene.duration], [1.05, 1.16], {
    extrapolateRight: 'clamp',
  });
  const sealPulse = interpolate(Math.sin(frame / 10), [-1, 1], [0.32, 0.68]);

  if (scene.background === 'archive') {
    return (
      <Sequence from={scene.from} durationInFrames={scene.duration}>
        <EvidenceArchive opacity={opacity} />
        <TextBlock scene={scene} opacity={opacity} offsetY={textIn} />
      </Sequence>
    );
  }

  return (
    <Sequence from={scene.from} durationInFrames={scene.duration}>
      <AbsoluteFill style={{ background: '#050403', opacity, overflow: 'hidden' }}>
        <Img
          src={asset(scene.background)}
          style={{
            position: 'absolute',
            inset: -42,
            width: 'calc(100% + 84px)',
            height: 'calc(100% + 84px)',
            objectFit: 'cover',
            transform: `scale(${slowPush}) translateX(${interpolate(local, [0, scene.duration], [-18, 18])}px)`,
            filter: scene.stairwell ? 'contrast(1.18) saturate(0.9) brightness(0.68)' : 'contrast(1.08) saturate(1.05) brightness(0.76)',
          }}
        />
        <AbsoluteFill style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.92), rgba(0,0,0,0.15) 52%, rgba(0,0,0,0.74)), radial-gradient(circle at 68% 44%, rgba(214,170,92,0.30), transparent 30%)',
        }} />
        <Dust tone={scene.stairwell ? '#f2d28c' : '#d7aa5c'} />
        {scene.foreground && (
          <Img
            src={asset(scene.foreground)}
            style={{
              position: 'absolute',
              right: scene.kicker === 'Scarab - Floor Carving' ? 110 : -12,
              bottom: scene.kicker === 'Scarab - Floor Carving' ? 82 : -30,
              width: scene.kicker === 'Scarab - Floor Carving' ? 560 : 790,
              opacity: scene.kicker === 'Threshold Opened' ? 0.78 : 0.62,
              filter: `drop-shadow(0 30px 70px rgba(0,0,0,0.82)) drop-shadow(0 0 ${scene.kicker === 'Threshold Opened' ? 42 : 12}px rgba(242,210,140,${sealPulse}))`,
              transform: `translateY(${interpolate(local, [0, scene.duration], [22, -12])}px) scale(${scene.kicker === 'Threshold Opened' ? 1 + sealPulse * 0.04 : 1})`,
            }}
          />
        )}
        {scene.stairwell && (
          <Img
            src={asset(scene.stairwell)}
            style={{
              position: 'absolute',
              right: 320,
              bottom: -160,
              width: 660,
              opacity: interpolate(local, [44, 92], [0, 0.76], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: ease,
              }),
              filter: 'drop-shadow(0 30px 76px rgba(0,0,0,0.9))',
              transform: `translateY(${interpolate(local, [44, scene.duration], [90, -24])}px)`,
            }}
          />
        )}
        {scene.character && (
          <Img
            src={asset(scene.character)}
            style={{
              position: 'absolute',
              right: 112,
              bottom: 42,
              width: 420,
              opacity: 0.88,
              filter: 'drop-shadow(0 28px 62px rgba(0,0,0,0.86))',
              transform: `translateY(${interpolate(local, [0, scene.duration], [32, -8])}px)`,
            }}
          />
        )}
        <TextBlock scene={scene} opacity={1} offsetY={textIn} />
      </AbsoluteFill>
    </Sequence>
  );
};

const TextBlock = ({ scene, opacity, offsetY }) => (
  <div style={{
    position: 'absolute',
    left: 118,
    bottom: 156,
    width: 1040,
    opacity,
    transform: `translateY(${offsetY}px)`,
    zIndex: 20,
  }}>
    <div style={{
      color: '#caa86e',
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: 32,
      fontWeight: 900,
      textTransform: 'uppercase',
      textShadow: '0 10px 34px rgba(0,0,0,0.8)',
    }}>
      {scene.kicker}
    </div>
    <div style={{
      color: '#fff7ed',
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: 68,
      lineHeight: 0.98,
      fontWeight: 900,
      marginTop: 18,
      textShadow: '0 18px 42px rgba(0,0,0,0.9)',
      letterSpacing: 0,
    }}>
      {scene.title}
    </div>
    <div style={{
      color: '#f4e6c8',
      fontFamily: 'Georgia, serif',
      fontSize: 30,
      lineHeight: 1.18,
      marginTop: 20,
      maxWidth: 860,
      textShadow: '0 12px 32px rgba(0,0,0,0.88)',
    }}>
      {scene.subtitle}
    </div>
  </div>
);

const CinematicBars = () => (
  <>
    <div style={{
      position: 'absolute',
      inset: '0 0 auto',
      height: 116,
      background: 'linear-gradient(#050403, rgba(5,4,3,0.86), transparent)',
      zIndex: 30,
    }} />
    <div style={{
      position: 'absolute',
      inset: 'auto 0 0',
      height: 116,
      background: 'linear-gradient(transparent, rgba(5,4,3,0.86), #050403)',
      zIndex: 30,
    }} />
  </>
);

export const OpeningPrologueRender = () => (
  <AbsoluteFill style={{ background: '#050403', overflow: 'hidden' }}>
    {scenes.map((scene) => (
      <Scene key={scene.kicker} scene={scene} />
    ))}
    <CinematicBars />
  </AbsoluteFill>
);
