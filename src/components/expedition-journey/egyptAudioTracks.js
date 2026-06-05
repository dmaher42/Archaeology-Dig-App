// Ancient Egypt Journey audio cue definitions.
// The core audio engine lives in App.jsx; this file only declares Egypt-specific SFX.

export const EGYPT_AUDIO_TRACKS = {
  sfx: {
    distantRockfall: {
      cooldownMs: 9000,
      clips: [
        { path: 'assets/expedition/sfx/generated/distant-rockfall.wav', volume: 0.42, playbackRate: 0.92 },
        { path: 'assets/expedition/sfx/opening/opening-deep-rumble.ogg', volume: 0.12, delay: 220, playbackRate: 0.48 },
      ],
    },
    templeDoorBoom: {
      cooldownMs: 10000,
      clips: [
        { path: 'assets/expedition/sfx/generated/temple-door-boom.wav', volume: 0.56, playbackRate: 0.84 },
        { path: 'assets/expedition/sfx/generated/bass-impact.wav', volume: 0.18, delay: 110, playbackRate: 0.62 },
      ],
    },
    templeStoneGroan: {
      cooldownMs: 10000,
      clips: [
        { path: 'assets/expedition/sfx/generated/temple-stone-groan.wav', volume: 0.44, playbackRate: 0.9 },
        { path: 'assets/expedition/sfx/generated/bass-impact.wav', volume: 0.2, delay: 620, playbackRate: 0.7 },
      ],
    },
    sandfallStoneCascade: {
      cooldownMs: 9000,
      clips: [
        { path: 'assets/expedition/sfx/generated/sandfall-stone-cascade.wav', volume: 0.48, playbackRate: 0.94 },
        { path: 'assets/expedition/sfx/generated/distant-rockfall.wav', volume: 0.18, delay: 520, playbackRate: 1.16 },
      ],
    },
    distantRuinCollapse: {
      cooldownMs: 12000,
      clips: [
        { path: 'assets/expedition/sfx/generated/distant-ruin-collapse.wav', volume: 0.5, playbackRate: 0.86 },
        { path: 'assets/expedition/sfx/opening/opening-earth-shake.flac', volume: 0.16, delay: 360, playbackRate: 0.72 },
      ],
    },
    catacombDeepBreath: {
      cooldownMs: 14000,
      clips: [
        { path: 'assets/expedition/sfx/generated/catacomb-deep-breath.wav', volume: 0.42, playbackRate: 0.82 },
        { path: 'assets/expedition/sfx/opening/opening-deep-rumble.ogg', volume: 0.1, delay: 180, playbackRate: 0.34 },
      ],
    },
    catacombFogWhisper: {
      cooldownMs: 12000,
      clips: [
        { path: 'assets/expedition/sfx/generated/catacomb-fog-whisper.wav', volume: 0.34, playbackRate: 0.9 },
      ],
    },
    distantMonsterCall: {
      cooldownMs: 16000,
      clips: [
        { path: 'assets/expedition/sfx/generated/distant-monster-call.wav', volume: 0.34, playbackRate: 0.78 },
        { path: 'assets/expedition/sfx/opening/opening-deep-rumble.ogg', volume: 0.08, delay: 160, playbackRate: 0.36 },
      ],
    },
    majorCaveIn: {
      cooldownMs: 14000,
      clips: [
        { path: 'assets/expedition/sfx/generated/major-cave-in.wav', volume: 0.62, playbackRate: 0.82 },
        { path: 'assets/expedition/sfx/opening/opening-earth-shake.flac', volume: 0.22, delay: 140, playbackRate: 0.6 },
      ],
    },
    bridgeStoneCrack: {
      cooldownMs: 9000,
      clips: [
        { path: 'assets/expedition/sfx/generated/bridge-stone-crack.wav', volume: 0.54, playbackRate: 0.88 },
        { path: 'assets/expedition/sfx/generated/bass-impact.wav', volume: 0.16, delay: 90, playbackRate: 0.64 },
      ],
    },
    structureRipping: {
      cooldownMs: 11000,
      clips: [
        { path: 'assets/expedition/sfx/generated/structure-ripping.wav', volume: 0.52, playbackRate: 0.86 },
        { path: 'assets/expedition/sfx/generated/distant-rockfall.wav', volume: 0.2, delay: 760, playbackRate: 1.08 },
      ],
    },
    unstableExcavationTremor: {
      cooldownMs: 11000,
      clips: [
        { path: 'assets/expedition/sfx/generated/unstable-excavation-tremor.wav', volume: 0.46, playbackRate: 0.86 },
        { path: 'assets/expedition/sfx/generated/distant-rockfall.wav', volume: 0.14, delay: 420, playbackRate: 0.78 },
      ],
    },
    finalGuardianDread: {
      cooldownMs: 15000,
      clips: [
        { path: 'assets/expedition/sfx/generated/final-guardian-dread.wav', volume: 0.48, playbackRate: 0.82 },
        { path: 'assets/expedition/sfx/generated/distant-monster-call.wav', volume: 0.16, delay: 600, playbackRate: 0.64 },
      ],
    },
    combatDangerHit: {
      cooldownMs: 200,
      clips: [
        { path: 'assets/expedition/sfx/generated/combat-danger-hit.wav', volume: 0.48, playbackRate: 0.88 },
        { path: 'assets/expedition/sfx/kenney_impact-sounds/Audio/impactPunch_heavy_003.ogg', volume: 0.18, delay: 20, playbackRate: 0.76 },
      ],
    },
    ashaHurtBreath: {
      cooldownMs: 700,
      clips: [
        { path: 'assets/expedition/sfx/generated/asha-hurt-breath.wav', volume: 0.32, playbackRate: 0.94 },
      ],
    },
  },
};
