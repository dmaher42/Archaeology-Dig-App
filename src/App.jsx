import { lazy, Suspense, useState, useEffect, useMemo, useReducer } from 'react';
import './index.css';

// Components
import { ActivityMenu } from './components/Menu';
import { TrainingPhase } from './components/TrainingPhase';
import { SortPhase } from './components/SortPhase';
import { LabPhase } from './components/LabPhase';
import { MuseumPhase } from './components/MuseumPhase';
import { ReportPhase } from './components/ReportPhase';
import { DevTools } from './components/DevTools';

const DigPhase = lazy(() => import('./components/DigPhase').then((module) => ({
  default: module.DigPhase,
})));

const BureauMode = lazy(() => import('./components/BureauMode').then((module) => ({
  default: module.BureauMode,
})));

const ExpeditionMode = lazy(() => import('./components/ExpeditionMode').then((module) => ({
  default: module.ExpeditionMode,
})));

// Utilities & Data
import { 
  AUTOSAVE_KEY,
  TRAINING_STAGES,
  createNewGameSession,
  createNewBureauSession,
  rebuildSavedSession,
  createSavePayload,
  SCENARIOS,
  RANDOM_EVENTS,
} from './utils/gameLogic';

// --- Advanced Audio Synthesis ---
let audioCtx = null;
let expeditionMusic = null;
let expeditionMusicKey = null;
let expeditionMusicFade = null;
let expeditionSfxUnlocked = false;
const expeditionSfxLastPlayedAt = new Map();
const expeditionLoopingSfx = new Map();
const expeditionSyntheticSfxVariants = new Map();

const EXPEDITION_AUDIO_TRACKS = {
  music: {
    desert: 'assets/expedition/audio/valley-of-the-stone-kings.mp3',
    temple: 'assets/expedition/audio/egypt-temple-ambience.mp3',
    catacombs: 'assets/expedition/audio/egypt-catacombs-ambience.mp3',
    escape: 'assets/expedition/audio/egypt-escape-tension.mp3',
    baseCamp: 'assets/expedition/audio/egypt-base-camp.mp3',
    boss: 'assets/expedition/audio/egypt-boss-ambience.mp3',
    fallback: 'assets/expedition/audio/first-light-over-stone.mp3',
  },
  stingers: {
    evidenceDiscovery: 'assets/expedition/audio/evidence-discovery-stinger.mp3',
    gateUnlock: 'assets/expedition/audio/gate-unlock-stinger.mp3',
  },
  sfx: {
    footstepSand: {
      synth: 'dustStep',
      synthVolume: 1.22,
      randomize: true,
      cooldownMs: 360,
      clips: [
        { path: 'assets/expedition/sfx/generated/land-soft.wav', volume: 0.13, playbackRate: 0.88 },
        { path: 'assets/expedition/sfx/generated/satchel-leather.wav', volume: 0.1, playbackRate: 0.9 },
      ],
    },
    jump: { path: 'assets/expedition/sfx/generated/land-soft.wav', volume: 0.3, playbackRate: 1.28 },
    land: { path: 'assets/expedition/sfx/generated/land-soft.wav', volume: 0.4 },
    pickupTool: [
      { path: 'assets/expedition/sfx/generated/satchel-leather.wav', volume: 0.4 },
      { path: 'assets/expedition/sfx/generated/satchel-buckle.wav', volume: 0.3, delay: 55 },
      { path: 'assets/expedition/sfx/generated/metal-click.wav', volume: 0.34, delay: 95, playbackRate: 1.08 },
    ],
    pickupShard: {
      cooldownMs: 120,
      clips: [
        { path: 'assets/expedition/sfx/generated/relic-shard.wav', volume: 0.28, playbackRate: 0.96 },
        { path: 'assets/expedition/sfx/generated/metal-click.wav', volume: 0.16, delay: 70, playbackRate: 1.18 },
        { path: 'assets/expedition/sfx/generated/relic-shard.wav', volume: 0.14, delay: 125, playbackRate: 1.28 },
      ],
    },
    pickupUpgrade: { path: 'assets/expedition/sfx/generated/metal-click.wav', volume: 0.42, playbackRate: 0.92 },
    gateUnlock: { path: 'assets/expedition/sfx/generated/stone-gate-open.wav', volume: 0.52 },
    gateBlocked: { path: 'assets/expedition/sfx/generated/stone-gate-blocked.wav', volume: 0.44 },
    attackSwing: {
      synth: 'softSwing',
      synthVolume: 1.3,
      cooldownMs: 260,
      clips: [
        { path: 'assets/expedition/sfx/generated/satchel-leather.wav', volume: 0.12, delay: 32, playbackRate: 0.96 },
      ],
    },
    combatDeflect: {
      synth: 'combatDeflect',
      synthVolume: 1.18,
      cooldownMs: 180,
      clips: [
        { path: 'assets/expedition/sfx/generated/metal-click.wav', volume: 0.16, playbackRate: 1.28 },
      ],
    },
    enemyHit: {
      synth: 'creatureHit',
      synthVolume: 1.08,
      cooldownMs: 120,
      clips: [
        { path: 'assets/expedition/sfx/generated/enemy-hit.wav', volume: 0.2, playbackRate: 1.12 },
      ],
    },
    scarabHit: {
      synth: 'scarabShellHit',
      synthVolume: 1.22,
      cooldownMs: 120,
      clips: [
        { path: 'assets/expedition/sfx/generated/enemy-hit.wav', volume: 0.16, playbackRate: 1.38 },
      ],
    },
    scorpionHit: {
      synth: 'scorpionHit',
      synthVolume: 1.12,
      cooldownMs: 120,
      clips: [
        { path: 'assets/expedition/sfx/generated/enemy-hit.wav', volume: 0.14, playbackRate: 1.52 },
      ],
    },
    snakeHit: {
      synth: 'snakeHit',
      synthVolume: 1.04,
      cooldownMs: 120,
      clips: [
        { path: 'assets/expedition/sfx/generated/enemy-hit.wav', volume: 0.12, playbackRate: 1.62 },
      ],
    },
    sandWispHit: {
      synth: 'sandWispHit',
      synthVolume: 1.12,
      cooldownMs: 120,
      clips: [
        { path: 'assets/expedition/sfx/generated/enemy-hit.wav', volume: 0.1, playbackRate: 0.88 },
      ],
    },
    bossHit: {
      synth: 'bossHit',
      synthVolume: 1.18,
      cooldownMs: 160,
      clips: [
        { path: 'assets/expedition/sfx/generated/enemy-hit.wav', volume: 0.22, playbackRate: 0.82 },
      ],
    },
    playerHit: {
      synth: 'playerImpact',
      synthVolume: 1.16,
      cooldownMs: 220,
      clips: [
        { path: 'assets/expedition/sfx/generated/player-hit.wav', volume: 0.22, playbackRate: 0.96 },
      ],
    },
    trapReset: {
      synth: 'trapReset',
      synthVolume: 1.16,
      cooldownMs: 360,
      clips: [
        { path: 'assets/expedition/sfx/generated/land-soft.wav', volume: 0.18, playbackRate: 0.7 },
      ],
    },
    trapStoneTrigger: {
      synth: 'trapStoneTrigger',
      synthVolume: 1.1,
      cooldownMs: 260,
      clips: [
        { path: 'assets/expedition/sfx/generated/land-soft.wav', volume: 0.13, playbackRate: 0.76 },
      ],
    },
    trapSandTrigger: {
      synth: 'trapSandTrigger',
      synthVolume: 1.08,
      cooldownMs: 260,
      clips: [
        { path: 'assets/expedition/sfx/generated/land-soft.wav', volume: 0.12, playbackRate: 0.9 },
      ],
    },
    bossWarning: { path: 'assets/expedition/sfx/generated/boss-warning.wav', volume: 0.38 },
    openingThresholdAtmosphere: {
      cooldownMs: 36000,
      clips: [
        { id: 'wind-bed', path: 'assets/expedition/sfx/opening/opening-desert-wind.ogg', volume: 0.2, playbackRate: 0.88, loop: true },
        { id: 'wind-high-drift', path: 'assets/expedition/sfx/opening/opening-desert-wind.ogg', volume: 0.11, delay: 12000, playbackRate: 1.08, loop: true },
        { id: 'wind-low-swell', path: 'assets/expedition/sfx/opening/opening-desert-wind.ogg', volume: 0.14, delay: 24000, playbackRate: 0.72, loop: true },
        { path: 'assets/expedition/sfx/opening/opening-deep-rumble.ogg', volume: 0.2, delay: 350, playbackRate: 0.68 },
        { path: 'assets/expedition/sfx/opening/opening-deep-rumble.ogg', volume: 0.14, delay: 8800, playbackRate: 0.58 },
        { path: 'assets/expedition/sfx/opening/opening-deep-rumble.ogg', volume: 0.16, delay: 18600, playbackRate: 0.52 },
        { path: 'assets/expedition/sfx/opening/opening-earth-shake.flac', volume: 0.18, delay: 21300, playbackRate: 0.82 },
      ],
    },
    scarabQueenApproachAtmosphere: {
      cooldownMs: 30000,
      clips: [
        { path: 'assets/expedition/sfx/opening/opening-desert-wind.ogg', volume: 0.16, playbackRate: 0.62 },
        { path: 'assets/expedition/sfx/opening/opening-deep-rumble.ogg', volume: 0.18, delay: 650, playbackRate: 0.44 },
        { path: 'assets/expedition/sfx/opening/opening-deep-rumble.ogg', volume: 0.13, delay: 4800, playbackRate: 0.38 },
        { path: 'assets/expedition/sfx/opening/opening-deep-rumble.ogg', volume: 0.11, delay: 9800, playbackRate: 0.34 },
      ],
    },
    openingThresholdFall: {
      cooldownMs: 12000,
      clips: [
        { path: 'assets/expedition/sfx/opening/opening-deep-rumble.ogg', volume: 0.22, playbackRate: 0.62 },
        { path: 'assets/expedition/sfx/opening/opening-earth-shake.flac', volume: 0.18, delay: 4050, playbackRate: 0.82 },
      ],
    },
    openingThresholdStoneShift: {
      cooldownMs: 24000,
      clips: [
        { path: 'assets/expedition/sfx/opening/opening-earth-shake.flac', volume: 0.3, playbackRate: 0.64 },
        { path: 'assets/expedition/sfx/opening/opening-deep-rumble.ogg', volume: 0.24, delay: 450, playbackRate: 0.48 },
        { path: 'assets/expedition/sfx/opening/opening-earth-shake.flac', volume: 0.16, delay: 1350, playbackRate: 0.82 },
      ],
    },
    openingThresholdFinalPulse: {
      cooldownMs: 12000,
      clips: [
        { path: 'assets/expedition/sfx/opening/opening-deep-rumble.ogg', volume: 0.18, playbackRate: 0.45 },
      ],
    },
  },
};

const EXPEDITION_STINGER_DURATIONS = {
  evidenceDiscovery: 3200,
  gateUnlock: 4600,
};

const getAudioSrc = (path) => `${import.meta.env.BASE_URL}${path}`;

const initAudio = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
};

const getExpeditionMusic = () => {
  if (!expeditionMusic) {
    expeditionMusic = new Audio();
    expeditionMusic.loop = true;
    expeditionMusic.volume = 0;
    expeditionMusic.preload = 'auto';
  }
  return expeditionMusic;
};

const fadeExpeditionMusicTo = (targetVolume, duration = 550) => {
  const music = getExpeditionMusic();
  if (expeditionMusicFade) window.clearInterval(expeditionMusicFade);
  const startVolume = music.volume;
  const startedAt = performance.now();
  expeditionMusicFade = window.setInterval(() => {
    const progress = Math.min(1, (performance.now() - startedAt) / duration);
    music.volume = startVolume + ((targetVolume - startVolume) * progress);
    if (progress >= 1) {
      window.clearInterval(expeditionMusicFade);
      expeditionMusicFade = null;
    }
  }, 30);
};

const playExpeditionMusic = (trackKey = 'desert') => {
  const nextKey = EXPEDITION_AUDIO_TRACKS.music[trackKey] ? trackKey : 'fallback';
  const music = getExpeditionMusic();
  if (expeditionMusicKey !== nextKey) {
    expeditionMusicKey = nextKey;
    music.src = getAudioSrc(EXPEDITION_AUDIO_TRACKS.music[nextKey]);
    music.currentTime = 0;
  }
  music.play().then(() => {
    fadeExpeditionMusicTo(0.34);
  }).catch((error) => {
    console.warn('Expedition music could not start', error);
  });
};

const stopExpeditionMusic = () => {
  if (!expeditionMusic) return;
  if (expeditionMusicFade) {
    window.clearInterval(expeditionMusicFade);
    expeditionMusicFade = null;
  }
  expeditionMusic.pause();
  expeditionMusic.currentTime = 0;
  expeditionMusic.volume = 0;
  expeditionMusicKey = null;
};

const EXPEDITION_BACKGROUND_MUSIC_ENABLED = false;

const stopExpeditionLoopingSfx = (sfxKey = null) => {
  expeditionLoopingSfx.forEach((sound, key) => {
    if (sfxKey && !key.startsWith(`${sfxKey}:`)) return;
    sound.pause();
    sound.currentTime = 0;
    expeditionLoopingSfx.delete(key);
  });
};

const playExpeditionStinger = (stingerKey) => {
  const path = EXPEDITION_AUDIO_TRACKS.stingers[stingerKey];
  if (!path) return;
  const stinger = new Audio(getAudioSrc(path));
  stinger.volume = 0.42;
  stinger.loop = false;
  stinger.play().catch((error) => {
    console.warn('Expedition stinger could not start', error);
  });
  window.setTimeout(() => {
    stinger.pause();
    stinger.currentTime = 0;
  }, EXPEDITION_STINGER_DURATIONS[stingerKey] || 3500);
};

const unlockExpeditionSfx = () => {
  initAudio();
  if (expeditionSfxUnlocked) return;
  const primer = new Audio(getAudioSrc('assets/expedition/sfx/generated/metal-click.wav'));
  primer.volume = 0.02;
  primer.play().then(() => {
    primer.pause();
    primer.currentTime = 0;
    expeditionSfxUnlocked = true;
  }).catch((error) => {
    console.warn('Expedition SFX unlock could not start', error);
  });
};

const playExpeditionSyntheticSfx = (type, options = {}) => {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const volume = options.volume ?? 1;
  const variant = expeditionSyntheticSfxVariants.get(type) || 0;
  expeditionSyntheticSfxVariants.set(type, variant + 1);
  const variation = (variant % 4) - 1.5;
  const makeNoiseBurst = ({
    duration = 0.12,
    frequency = 1200,
    endFrequency = frequency,
    q = 1,
    gain = 0.08,
    delay = 0,
    type: filterType = 'bandpass',
  }) => {
    const start = now + delay;
    const buffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * duration), audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const progress = i / data.length;
      const attack = Math.min(1, progress / 0.12);
      const decay = Math.max(0, 1 - progress);
      data[i] = (Math.random() * 2 - 1) * attack * decay * decay;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency + variation * 26, start);
    filter.frequency.linearRampToValueAtTime(endFrequency + variation * 18, start + duration);
    filter.Q.value = q;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, start);
    noiseGain.gain.linearRampToValueAtTime(gain * volume, start + Math.min(0.025, duration * 0.24));
    noiseGain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(start);
    noise.stop(start + duration);
  };
  const makeToneHit = ({
    frequency = 180,
    endFrequency = frequency * 0.55,
    gain = 0.045,
    duration = 0.12,
    delay = 0,
    wave = 'triangle',
  }) => {
    const start = now + delay;
    const tone = audioCtx.createOscillator();
    tone.type = wave;
    tone.frequency.setValueAtTime(frequency + variation * 4, start);
    tone.frequency.exponentialRampToValueAtTime(Math.max(28, endFrequency + variation * 2), start + duration);
    const toneGain = audioCtx.createGain();
    toneGain.gain.setValueAtTime(0.0001, start);
    toneGain.gain.linearRampToValueAtTime(gain * volume, start + Math.min(0.018, duration * 0.2));
    toneGain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    tone.connect(toneGain);
    toneGain.connect(audioCtx.destination);
    tone.start(start);
    tone.stop(start + duration);
  };

  if (type === 'dustStep') {
    const duration = 0.16;
    const buffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * duration), audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const progress = i / data.length;
      const fade = Math.max(0, 1 - progress);
      data[i] = (Math.random() * 2 - 1) * fade * fade;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(430 + variation * 28, now);
    filter.frequency.linearRampToValueAtTime(620 + variation * 18, now + duration);
    filter.Q.value = 0.82;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.082 * volume, now + 0.018);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);
    noise.stop(now + duration);

    const thump = audioCtx.createOscillator();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(96 + variation * 4, now);
    thump.frequency.exponentialRampToValueAtTime(58 + variation * 2, now + 0.09);
    const thumpGain = audioCtx.createGain();
    thumpGain.gain.setValueAtTime(0.0001, now);
    thumpGain.gain.linearRampToValueAtTime(0.042 * volume, now + 0.008);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    thump.connect(thumpGain);
    thumpGain.connect(audioCtx.destination);
    thump.start(now);
    thump.stop(now + 0.12);
    return;
  }

  if (type === 'softSwing') {
    const duration = 0.22;
    const buffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * duration), audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const attack = Math.min(1, i / (data.length * 0.22));
      const decay = 1 - (i / data.length);
      data[i] = (Math.random() * 2 - 1) * attack * decay;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1080 + variation * 45, now);
    filter.frequency.linearRampToValueAtTime(390 + variation * 18, now + duration);
    filter.Q.value = 0.9;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.105 * volume, now + 0.045);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);
    noise.stop(now + duration);

    const body = audioCtx.createOscillator();
    body.type = 'triangle';
    body.frequency.setValueAtTime(176 + variation * 5, now + 0.025);
    body.frequency.exponentialRampToValueAtTime(124 + variation * 3, now + 0.15);
    const bodyGain = audioCtx.createGain();
    bodyGain.gain.setValueAtTime(0.0001, now + 0.02);
    bodyGain.gain.linearRampToValueAtTime(0.035 * volume, now + 0.05);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    body.connect(bodyGain);
    bodyGain.connect(audioCtx.destination);
    body.start(now + 0.02);
    body.stop(now + 0.18);
    return;
  }

  if (type === 'combatDeflect') {
    makeNoiseBurst({ duration: 0.09, frequency: 2400, endFrequency: 1250, q: 2.2, gain: 0.105 });
    makeNoiseBurst({ duration: 0.12, frequency: 980, endFrequency: 680, q: 1.4, gain: 0.055, delay: 0.018 });
    makeToneHit({ frequency: 420, endFrequency: 210, gain: 0.032, duration: 0.11, wave: 'square' });
    return;
  }

  if (type === 'creatureHit') {
    makeNoiseBurst({ duration: 0.11, frequency: 1320, endFrequency: 820, q: 1.25, gain: 0.09 });
    makeToneHit({ frequency: 176, endFrequency: 82, gain: 0.038, duration: 0.12 });
    return;
  }

  if (type === 'scarabShellHit') {
    makeNoiseBurst({ duration: 0.07, frequency: 3150, endFrequency: 1850, q: 2.8, gain: 0.095 });
    makeNoiseBurst({ duration: 0.1, frequency: 1180, endFrequency: 740, q: 1.8, gain: 0.07, delay: 0.018 });
    makeToneHit({ frequency: 260, endFrequency: 120, gain: 0.03, duration: 0.09, wave: 'square' });
    return;
  }

  if (type === 'scorpionHit') {
    makeNoiseBurst({ duration: 0.08, frequency: 3600, endFrequency: 2300, q: 3.2, gain: 0.075 });
    makeNoiseBurst({ duration: 0.12, frequency: 1450, endFrequency: 1020, q: 1.8, gain: 0.06, delay: 0.015 });
    return;
  }

  if (type === 'snakeHit') {
    makeNoiseBurst({ duration: 0.12, frequency: 4200, endFrequency: 1900, q: 1.05, gain: 0.065 });
    makeToneHit({ frequency: 230, endFrequency: 115, gain: 0.026, duration: 0.08, wave: 'sawtooth' });
    return;
  }

  if (type === 'sandWispHit') {
    makeNoiseBurst({ duration: 0.19, frequency: 1900, endFrequency: 540, q: 0.82, gain: 0.078 });
    makeToneHit({ frequency: 540, endFrequency: 720, gain: 0.024, duration: 0.16, wave: 'sine' });
    return;
  }

  if (type === 'bossHit') {
    makeNoiseBurst({ duration: 0.14, frequency: 980, endFrequency: 540, q: 1.1, gain: 0.105 });
    makeToneHit({ frequency: 112, endFrequency: 54, gain: 0.062, duration: 0.18 });
    makeNoiseBurst({ duration: 0.08, frequency: 2500, endFrequency: 1500, q: 2.1, gain: 0.055, delay: 0.025 });
    return;
  }

  if (type === 'playerImpact') {
    makeNoiseBurst({ duration: 0.12, frequency: 760, endFrequency: 460, q: 1, gain: 0.09 });
    makeToneHit({ frequency: 92, endFrequency: 48, gain: 0.06, duration: 0.16 });
    return;
  }

  if (type === 'trapReset') {
    makeNoiseBurst({ duration: 0.2, frequency: 520, endFrequency: 230, q: 0.72, gain: 0.11 });
    makeNoiseBurst({ duration: 0.16, frequency: 1550, endFrequency: 680, q: 1.25, gain: 0.05, delay: 0.025 });
    makeToneHit({ frequency: 86, endFrequency: 42, gain: 0.07, duration: 0.22 });
    return;
  }

  if (type === 'trapStoneTrigger') {
    makeNoiseBurst({ duration: 0.12, frequency: 980, endFrequency: 420, q: 1.2, gain: 0.08 });
    makeNoiseBurst({ duration: 0.08, frequency: 2600, endFrequency: 1300, q: 2.4, gain: 0.045, delay: 0.018 });
    makeToneHit({ frequency: 132, endFrequency: 64, gain: 0.046, duration: 0.14 });
    return;
  }

  if (type === 'trapSandTrigger') {
    makeNoiseBurst({ duration: 0.22, frequency: 680, endFrequency: 260, q: 0.68, gain: 0.095 });
    makeNoiseBurst({ duration: 0.14, frequency: 1450, endFrequency: 540, q: 0.9, gain: 0.038, delay: 0.025 });
  }
};

const playExpeditionSfx = (sfxKey, options = {}) => {
  initAudio();
  const config = EXPEDITION_AUDIO_TRACKS.sfx[sfxKey];
  if (!config) return;
  const cooldownMs = options.cooldownMs ?? config.cooldownMs ?? 0;
  if (cooldownMs > 0) {
    const now = performance.now();
    const lastPlayedAt = expeditionSfxLastPlayedAt.get(sfxKey) || 0;
    if (now - lastPlayedAt < cooldownMs) return;
    expeditionSfxLastPlayedAt.set(sfxKey, now);
  }
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    window.__expeditionSfxLog = [
      ...(window.__expeditionSfxLog || []),
      {
        key: sfxKey,
        synth: Array.isArray(config) ? null : config.synth || null,
        at: Math.round(performance.now()),
      },
    ].slice(-40);
  }
  const clips = Array.isArray(config)
    ? config
    : Array.isArray(config.clips)
      ? config.clips
      : [config];
  const selectedClips = config.randomize || sfxKey === 'footstepSand'
    ? [clips[Math.floor(Math.random() * clips.length)]]
    : clips;

  if (!Array.isArray(config) && config.synth) {
    playExpeditionSyntheticSfx(config.synth, {
      ...options,
      volume: (options.volume ?? 1) * (config.synthVolume ?? 1),
    });
  }

  selectedClips.forEach((clip) => {
    const playClip = () => {
      const sound = new Audio(getAudioSrc(clip.path));
      sound.volume = Math.min(1, (clip.volume ?? 0.3) * (options.volume ?? 1));
      sound.playbackRate = (clip.playbackRate ?? 1) * (options.playbackRate ?? 1);
      if (clip.loop || options.loop) {
        const loopKey = `${sfxKey}:${clip.id || clip.path}`;
        if (expeditionLoopingSfx.has(loopKey)) return;
        sound.loop = true;
        expeditionLoopingSfx.set(loopKey, sound);
      }
      sound.play().catch((error) => {
        if (clip.loop || options.loop) expeditionLoopingSfx.delete(`${sfxKey}:${clip.id || clip.path}`);
        console.warn('Expedition SFX could not start', error);
      });
    };

    if (clip.delay) {
      window.setTimeout(playClip, clip.delay);
    } else {
      playClip();
    }
  });
};

const playFlip = () => {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.15; 
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.8;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  noiseSource.start();
};

const playMatch = () => {
  if (!audioCtx) return;
  const playBell = (freq, startTime, vol) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.6);
  };
  const now = audioCtx.currentTime;
  playBell(523.25, now, 0.2); 
  playBell(659.25, now + 0.1, 0.2); 
  playBell(783.99, now + 0.2, 0.3); 
};

const playError = () => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
};

const playWin = () => {
  if (!audioCtx) return;
  const playBell = (freq, startTime, duration) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };
  const now = audioCtx.currentTime;
  playBell(523.25, now, 0.8);
  playBell(659.25, now + 0.15, 0.8);
  playBell(783.99, now + 0.3, 0.8);
  playBell(1046.50, now + 0.45, 1.2);
};

const playTone = (freq, type = 'sine', duration = 0.5, vol = 0.2) => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

const baseAudioControls = { initAudio, playFlip, playMatch, playError, playWin, playTone, playExpeditionMusic, stopExpeditionMusic, stopExpeditionLoopingSfx, playExpeditionStinger, playExpeditionSfx, unlockExpeditionSfx };

function ModeLoadingFallback({ label = 'Loading activity...' }) {
  return (
    <section className="phase-container mode-loading-phase">
      <div className="mode-loading-card glass-card">
        <div className="mode-loading-kicker">Preparing</div>
        <div className="mode-loading-title">{label}</div>
      </div>
    </section>
  );
}

function loadAutosave() {
  try {
    const raw = window.localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return { archaeology: null, bureau: null };
    const parsed = JSON.parse(raw);
    
    // Check if it's the new multi-mode format
    if (parsed.archaeology !== undefined || parsed.bureau !== undefined) {
      return {
        archaeology: parsed.archaeology ? rebuildSavedSession(parsed.archaeology) : null,
        bureau: parsed.bureau ? rebuildSavedSession(parsed.bureau) : null
      };
    }
    
    // Migration: if it's the old format, determine its mode and put it in the right slot
    const rebuilt = rebuildSavedSession(parsed);
    if (rebuilt.mode === 'bureau') {
      return { archaeology: null, bureau: rebuilt };
    } else {
      return { archaeology: rebuilt, bureau: null };
    }
  } catch (e) {
    console.warn('Failed to load autosave', e);
    return { archaeology: null, bureau: null };
  }
}

export default function App() {
  console.log('App: initializing savedGames');
  const [savedGames, setSavedGames] = useReducer((state, action) => {
    if (action.type === 'UPDATE') {
      return { ...state, [action.mode]: action.payload };
    }
    if (action.type === 'SET_ALL') {
      return action.payload;
    }
    return state;
  }, { archaeology: null, bureau: null }, loadAutosave);

  console.log('App: creating initialGame');
  const initialGame = useMemo(() => createNewGameSession('archaeology', 'menu'), []);
  const initialBureauGame = useMemo(() => createNewBureauSession('bureauBriefing'), []);

  // State Management
  const [phase, setPhase] = useState(initialGame.phase);
  const [currentScenario, setCurrentScenario] = useState(initialGame.currentScenario || null);
  const [activeArtifacts, setActiveArtifacts] = useState(initialGame.activeArtifacts || []);
  const [excavatedIds, setExcavatedIds] = useState(initialGame.excavatedIds || new Set());
  const [itemsLocation, setItemsLocation] = useState(initialGame.itemsLocation || {});
  const [hypotheses, setHypotheses] = useState(initialGame.hypotheses || {});
  const [siteName, setSiteName] = useState(initialGame.siteName || "Unknown Dig Site");
  const [finalConclusion, setFinalConclusion] = useState(initialGame.finalConclusion || null);
  const [currentEvent, setCurrentEvent] = useState(initialGame.currentEvent || null);
  const [curatedItems, setCuratedItems] = useState(initialGame.curatedItems || []);
  const [plaques, setPlaques] = useState(initialGame.plaques || {});
  const [finalExhibitionStatement, setFinalExhibitionStatement] = useState(initialGame.finalExhibitionStatement || '');
  const [evidenceConditions, setEvidenceConditions] = useState(initialGame.evidenceConditions || {});
  const [digRecoverySummary, setDigRecoverySummary] = useState(initialGame.digRecoverySummary || null);
  const [trainingPlacements, setTrainingPlacements] = useState(initialGame.trainingPlacements || Array(TRAINING_STAGES.length).fill(null));
  const [trainingState, setTrainingState] = useState(initialGame.trainingState || null);
  const [bureauState, setBureauState] = useState(initialBureauGame);
  const [showDevTools, setShowDevTools] = useState(false);
  const [isSiteSelectionActive, setIsSiteSelectionActive] = useState(false);
  const [expeditionMusicEnabled, setExpeditionMusicEnabled] = useState(false);
  const [expeditionSfxEnabled, setExpeditionSfxEnabled] = useState(true);
  const isMenuLanding = phase === 'menu' && !isSiteSelectionActive;
  const audioControls = useMemo(() => ({
    ...baseAudioControls,
    playExpeditionMusic: (trackKey) => {
      if (!EXPEDITION_BACKGROUND_MUSIC_ENABLED || !expeditionMusicEnabled) {
        baseAudioControls.stopExpeditionMusic?.();
        return;
      }
      baseAudioControls.playExpeditionMusic?.(trackKey);
    },
    playExpeditionSfx: (sfxKey, options) => {
      if (!expeditionSfxEnabled) return;
      baseAudioControls.playExpeditionSfx?.(sfxKey, options);
    },
    stopExpeditionLoopingSfx: (sfxKey) => {
      baseAudioControls.stopExpeditionLoopingSfx?.(sfxKey);
    },
    playExpeditionStinger: (stingerKey) => {
      if (!expeditionSfxEnabled) return;
      baseAudioControls.playExpeditionStinger?.(stingerKey);
    },
    unlockExpeditionSfx: () => {
      if (!expeditionSfxEnabled) return;
      baseAudioControls.unlockExpeditionSfx?.();
    },
    expeditionSfxEnabled,
    toggleExpeditionSfx: () => {
      setExpeditionSfxEnabled((enabled) => {
        const nextEnabled = !enabled;
        if (nextEnabled) baseAudioControls.unlockExpeditionSfx?.();
        return nextEnabled;
      });
    },
  }), [expeditionMusicEnabled, expeditionSfxEnabled]);

  useEffect(() => {
    if (!EXPEDITION_BACKGROUND_MUSIC_ENABLED) baseAudioControls.stopExpeditionMusic?.();
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return undefined;
    window.__playExpeditionSfxDebug = (sfxKey, options) => {
      baseAudioControls.unlockExpeditionSfx?.();
      baseAudioControls.playExpeditionSfx?.(sfxKey, options);
      return window.__expeditionSfxLog || [];
    };
    return () => {
      delete window.__playExpeditionSfxDebug;
    };
  }, []);

  // Autosave Logic
  useEffect(() => {
    if (phase === 'menu' || phase === 'expedition') return;
    try {
      const isBureau = phase.startsWith('bureau');
      const payload = isBureau
        ? createSavePayload({ mode: 'bureau', phase, bureauState })
        : createSavePayload({
            mode: 'archaeology', phase, currentScenario, currentEvent, activeArtifacts,
            excavatedIds, itemsLocation, hypotheses, siteName, finalConclusion,
            curatedItems, plaques, finalExhibitionStatement, trainingPlacements,
            trainingState, evidenceConditions, digRecoverySummary
          });
      
      const currentFullSave = JSON.parse(window.localStorage.getItem(AUTOSAVE_KEY) || '{"archaeology": null, "bureau": null}');
      const modeKey = isBureau ? 'bureau' : 'archaeology';
      
      // If the save format is old, we need to restructure it first
      const normalizedSave = (currentFullSave.archaeology !== undefined || currentFullSave.bureau !== undefined)
        ? currentFullSave
        : (currentFullSave.mode === 'bureau' ? { archaeology: null, bureau: currentFullSave } : { archaeology: currentFullSave, bureau: null });

      const updatedSave = { ...normalizedSave, [modeKey]: payload };
      window.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(updatedSave));
      
      setSavedGames({ type: 'UPDATE', mode: modeKey, payload: rebuildSavedSession(payload) });
    } catch (error) {
      console.warn('Autosave failed', error);
    }
  }, [
    activeArtifacts, currentEvent, currentScenario, curatedItems, excavatedIds,
    digRecoverySummary, evidenceConditions, finalConclusion, finalExhibitionStatement, hypotheses, itemsLocation,
    bureauState, phase, plaques, siteName, trainingPlacements, trainingState
  ]);

  // DevTools Hotkey
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'D') {
        e.preventDefault();
        setShowDevTools(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persistence Actions
  const applySavedSession = (session) => {
    if (!session) return;
    setIsSiteSelectionActive(false);
    setPhase(session.phase);
    if (session.mode === 'bureau') {
      setBureauState(session.bureauState);
    } else {
      setCurrentScenario(session.currentScenario);
      setCurrentEvent(session.currentEvent);
      setActiveArtifacts(session.activeArtifacts);
      setExcavatedIds(session.excavatedIds);
      setItemsLocation(session.itemsLocation);
      setHypotheses(session.hypotheses);
      setSiteName(session.siteName);
      setFinalConclusion(session.finalConclusion);
      setCuratedItems(session.curatedItems);
      setPlaques(session.plaques);
      setFinalExhibitionStatement(session.finalExhibitionStatement);
      setEvidenceConditions(session.evidenceConditions || {});
      setDigRecoverySummary(session.digRecoverySummary || null);
      setTrainingPlacements(session.trainingPlacements);
      setTrainingState(session.trainingState || null);
    }
  };

  const handleRetry = () => {
    const next = createNewGameSession('archaeology', 'dig');
    applySavedSession(next);
  };

  const handleStartInvestigation = (scenarioId = null) => {
    const next = createNewGameSession('archaeology', 'dig', scenarioId);
    applySavedSession(next);
  };

  const handleStartTraining = () => {
    const next = createNewGameSession('archaeology', 'training');
    applySavedSession(next);
  };

  const handleStartBureau = () => {
    const next = createNewBureauSession('bureauBriefing');
    setIsSiteSelectionActive(false);
    setBureauState(next);
    setPhase(next.phase);
  };

  const handleStartExpedition = () => {
    if (expeditionSfxEnabled) baseAudioControls.unlockExpeditionSfx?.();
    baseAudioControls.stopExpeditionMusic?.();
    setIsSiteSelectionActive(false);
    setPhase('expedition');
  };

  const handleExpeditionMusicToggle = () => {
    setExpeditionMusicEnabled((enabled) => {
      if (enabled) baseAudioControls.stopExpeditionMusic?.();
      return EXPEDITION_BACKGROUND_MUSIC_ENABLED ? !enabled : false;
    });
  };

  const handleExpeditionSfxToggle = () => {
    setExpeditionSfxEnabled((enabled) => {
      const nextEnabled = !enabled;
      if (nextEnabled) baseAudioControls.unlockExpeditionSfx?.();
      return nextEnabled;
    });
  };

  const handleExpeditionSoundTest = () => {
    if (!expeditionSfxEnabled) {
      setExpeditionSfxEnabled(true);
      baseAudioControls.unlockExpeditionSfx?.();
    }
    baseAudioControls.playExpeditionSfx?.('openingThresholdAtmosphere', { volume: 1 });
  };

  const handleBackToMenu = () => {
    audioControls.stopExpeditionMusic?.();
    audioControls.stopExpeditionLoopingSfx?.();
    setPhase('menu');
  };

  return (
    <div className={`app-wrapper app-wrapper--${phase} app-wrapper--no-global-header ${showDevTools ? 'app-wrapper--dev-tools' : ''} ${isMenuLanding ? 'app-wrapper--menu-header' : ''} ${isSiteSelectionActive ? 'app-wrapper--site-selection' : ''}`}>
      <main className="main-content">


        {phase === 'menu' && (
          <ActivityMenu
            onStartInvestigation={handleStartInvestigation}
            onStartTraining={handleStartTraining}
            onStartBureau={handleStartBureau}
            onStartExpedition={handleStartExpedition}
            savedGames={savedGames}
            onResumeInvestigation={() => applySavedSession(savedGames.archaeology)}
            onResumeBureau={() => applySavedSession(savedGames.bureau)}
            onSiteSelectionChange={setIsSiteSelectionActive}
            expeditionMusicEnabled={expeditionMusicEnabled}
            expeditionSfxEnabled={expeditionSfxEnabled}
            onExpeditionMusicToggle={handleExpeditionMusicToggle}
            onExpeditionSfxToggle={handleExpeditionSfxToggle}
            onExpeditionSoundTest={handleExpeditionSoundTest}
          />
        )}

        {phase === 'training' && (
          <TrainingPhase 
            initialTrainingState={trainingState}
            onTrainingStateChange={setTrainingState}
            onBackToMenu={() => setPhase('menu')} 
            onBeginExpedition={handleStartExpedition}
          />
        )}

        {phase === 'dig' && currentEvent && (
          <Suspense fallback={<ModeLoadingFallback label="Loading dig site..." />}>
            <DigPhase
              activeArtifacts={activeArtifacts}
              excavatedIds={excavatedIds}
              setExcavatedIds={setExcavatedIds}
              onComplete={(recoveredArtifacts, recoveryConditions = {}, recoverySummary = null) => {
                setActiveArtifacts(recoveredArtifacts);
                setEvidenceConditions(recoveryConditions);
                setDigRecoverySummary(recoverySummary);
                setItemsLocation(recoveredArtifacts.reduce((acc, a) => ({ ...acc, [a.id]: 'inventory' }), {}));
                setPhase('sort');
              }}
              currentEvent={currentEvent}
              onBackToMenu={() => setPhase('menu')}
              audioControls={audioControls}
            />
          </Suspense>
        )}

        {phase === 'sort' && (
          <SortPhase 
            activeArtifacts={activeArtifacts} 
            itemsLocation={itemsLocation} 
            setItemsLocation={setItemsLocation} 
            onComplete={() => setPhase('lab')} 
            onBackToMenu={() => setPhase('menu')} 
            currentScenario={currentScenario}
            evidenceConditions={evidenceConditions}
          />
        )}

        {phase === 'lab' && (
          <LabPhase 
            activeArtifacts={activeArtifacts} 
            itemsLocation={itemsLocation} 
            hypotheses={hypotheses} 
            setHypotheses={setHypotheses} 
            currentScenario={currentScenario} 
            evidenceConditions={evidenceConditions}
            onComplete={(name, civId) => {
              setSiteName(name);
              setFinalConclusion(civId);
              setPhase('museum');
            }} 
            onBackToMenu={() => setPhase('menu')} 
          />
        )}

        {phase === 'museum' && (
          <MuseumPhase 
            activeArtifacts={activeArtifacts} 
            hypotheses={hypotheses} 
            curatedItems={curatedItems} 
            setCuratedItems={setCuratedItems} 
            plaques={plaques} 
            setPlaques={setPlaques} 
            finalExhibitionStatement={finalExhibitionStatement} 
            setFinalExhibitionStatement={setFinalExhibitionStatement} 
            evidenceConditions={evidenceConditions}
            onComplete={() => setPhase('report')} 
            onBackToMenu={() => setPhase('menu')} 
          />
        )}

        {phase === 'report' && currentScenario && currentEvent && (
          <ReportPhase 
            activeArtifacts={activeArtifacts} 
            itemsLocation={itemsLocation} 
            hypotheses={hypotheses} 
            siteName={siteName} 
            currentScenario={currentScenario} 
            onBack={() => setPhase('lab')} 
            onRetry={handleRetry} 
            currentEvent={currentEvent} 
            curatedItems={curatedItems} 
            plaques={plaques} 
            finalExhibitionStatement={finalExhibitionStatement} 
            evidenceConditions={evidenceConditions}
            digRecoverySummary={digRecoverySummary}
            onBackToMenu={() => setPhase('menu')} 
          />
        )}

        {phase === 'expedition' && (
          <Suspense fallback={<ModeLoadingFallback label="Loading expedition..." />}>
            <ExpeditionMode
              onBackToMenu={handleBackToMenu}
              audioControls={audioControls}
              onSendToLab={(collectedEvidence, fieldNotes) => {
                const egyptScenario = SCENARIOS.find(s => s.id === 'egypt');
                if (!egyptScenario) return;

                // Hydrate collected evidence into full activeArtifacts
                const activeArtifacts = collectedEvidence.map(item => {
                  const fullArtifact = egyptScenario.evidence.find(e => e.id === item.id);
                  return fullArtifact ? { ...fullArtifact } : { ...item };
                });

                // Populate itemsLocation (everything starts in inventory)
                const itemsLocation = activeArtifacts.reduce((acc, a) => ({ ...acc, [a.id]: 'inventory' }), {});

                // Populate evidenceConditions with detailed notes compiled from the excavation
                const evidenceConditions = {};
                collectedEvidence.forEach(item => {
                  const methodNote = fieldNotes.find(fn => fn.evidenceId === item.id && fn.reason === 'excavation-method');
                  const mappingNote = fieldNotes.find(fn => fn.evidenceId === item.id && fn.reason === 'mapping');

                  let note = '';
                  if (methodNote) note += methodNote.note;
                  if (mappingNote) note += (note ? ' ' : '') + mappingNote.note;
                  if (!note) {
                    note = `${item.name} was excavated from the ${item.mappedZone || 'tomb'} (Grid ${item.mappedGridSquare || 'unknown'}).`;
                  }

                  evidenceConditions[item.id] = {
                    condition: item.evidenceQuality || 'good',
                    note: note
                  };
                });

                // Calculate digRecoverySummary (clean vs disturbed)
                const cleanCount = collectedEvidence.filter(item => item.evidenceQuality !== 'damaged').length;
                const disturbedCount = collectedEvidence.filter(item => item.evidenceQuality === 'damaged').length;
                const digRecoverySummary = {
                  cleanRecoveryCount: cleanCount,
                  disturbedRecoveryCount: disturbedCount
                };

                // Hydrate App state for the laboratory phase
                setCurrentScenario(egyptScenario);
                setCurrentEvent(RANDOM_EVENTS[0]); // default storm/flood event
                setActiveArtifacts(activeArtifacts);
                setItemsLocation(itemsLocation);
                setEvidenceConditions(evidenceConditions);
                setDigRecoverySummary(digRecoverySummary);
                setHypotheses({}); // clear out previous hypotheses
                setPhase('lab');
              }}
            />
          </Suspense>
        )}

        {phase.startsWith('bureau') && (
          <Suspense fallback={<ModeLoadingFallback label="Loading bureau case..." />}>
            <BureauMode
              bureauState={bureauState}
              setBureauState={setBureauState}
              onBackToMenu={() => setPhase('menu')}
              audioControls={audioControls}
            />
          </Suspense>
        )}
      </main>

      {showDevTools && (
        <DevTools 
          currentPhase={phase} setPhase={setPhase} setBureauState={setBureauState}
          setExcavatedIds={setExcavatedIds} setActiveArtifacts={setActiveArtifacts}
          setItemsLocation={setItemsLocation} setHypotheses={setHypotheses}
          setCurrentScenario={setCurrentScenario} setCurrentEvent={setCurrentEvent}
          setSiteName={setSiteName} setFinalConclusion={setFinalConclusion}
          setCuratedItems={setCuratedItems} setPlaques={setPlaques}
          setEvidenceConditions={setEvidenceConditions} setDigRecoverySummary={setDigRecoverySummary}
          currentScenario={currentScenario}
          activeArtifacts={activeArtifacts}
          currentEvent={currentEvent}
        />
      )}
    </div>
  );
}
