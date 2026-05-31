import { lazy, Suspense, useState, useEffect, useMemo, useReducer } from 'react';
import { ROME_AUDIO_TRACKS } from './components/expedition-journey/rome/romeAudioTracks';
import { CHINA_AUDIO_TRACKS } from './components/expedition-journey/chinaAudioTracks';
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
    // Egypt tracks
    desert: 'assets/expedition/audio/valley-of-the-stone-kings.mp3',
    temple: 'assets/expedition/audio/egypt-temple-ambience.mp3',
    catacombs: 'assets/expedition/audio/egypt-catacombs-ambience.mp3',
    escape: 'assets/expedition/audio/egypt-escape-tension.mp3',
    baseCamp: 'assets/expedition/audio/egypt-base-camp.mp3',
    boss: 'assets/expedition/audio/egypt-boss-ambience.mp3',
    fallback: 'assets/expedition/audio/first-light-over-stone.mp3',
    // Rome tracks (placeholder paths — drop files here when composed)
    ...ROME_AUDIO_TRACKS.music,
    ...CHINA_AUDIO_TRACKS.music,
  },
  stingers: {
    evidenceDiscovery: 'assets/expedition/audio/evidence-discovery-stinger.mp3',
    gateUnlock: 'assets/expedition/audio/gate-unlock-stinger.mp3',
    // Rome stingers use distinct keys to avoid overriding Egypt
    romeEvidenceDiscovery: ROME_AUDIO_TRACKS.stingers.evidenceDiscovery,
    romeGateUnlock:        ROME_AUDIO_TRACKS.stingers.gateUnlock,
    chinaEvidenceDiscovery: CHINA_AUDIO_TRACKS.stingers.chinaEvidenceDiscovery,
    chinaGateUnlock:        CHINA_AUDIO_TRACKS.stingers.chinaGateUnlock,
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
    batHit: {
      synth: 'batHit',
      synthVolume: 1.1,
      cooldownMs: 100,
      clips: [
        { path: 'assets/expedition/sfx/generated/enemy-hit.wav', volume: 0.13, playbackRate: 1.52 },
      ],
    },
    mummyHit: {
      synth: 'mummyHit',
      synthVolume: 1.06,
      cooldownMs: 130,
      clips: [
        { path: 'assets/expedition/sfx/generated/enemy-hit.wav', volume: 0.18, playbackRate: 0.72 },
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
    // Expansion SFX
    ...ROME_AUDIO_TRACKS.sfx,
    ...CHINA_AUDIO_TRACKS.sfx,
  },
};

const EXPEDITION_STINGER_DURATIONS = {
  evidenceDiscovery: 3200,
  gateUnlock: 4600,
  romeEvidenceDiscovery: 3000,
  romeGateUnlock: 4400,
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
    // Sharp metal edge crack on contact
    makeNoiseBurst({ duration: 0.06, frequency: 3600, endFrequency: 1900, q: 2.8, gain: 0.098 });
    // Metal ring — the characteristic singing tone of a deflected blade
    makeToneHit({ frequency: 680, endFrequency: 420, gain: 0.034, duration: 0.22, wave: 'sine' });
    // Weapon slide/scrape off the block
    makeNoiseBurst({ duration: 0.14, frequency: 1050, endFrequency: 620, q: 1.3, gain: 0.052, delay: 0.014 });
    // High edge sparkle — metal tip detail
    makeNoiseBurst({ duration: 0.04, frequency: 5800, endFrequency: 3200, q: 2.0, gain: 0.026, delay: 0.009 });
    return;
  }

  if (type === 'creatureHit') {
    // Flesh/cloth impact — mid-freq body hit
    makeNoiseBurst({ duration: 0.12, frequency: 1100, endFrequency: 580, q: 1.1, gain: 0.095 });
    // Low body thud — mass of the creature
    makeToneHit({ frequency: 168, endFrequency: 78, gain: 0.044, duration: 0.15 });
    // Surface contact detail — brief high scatter
    makeNoiseBurst({ duration: 0.05, frequency: 3400, endFrequency: 1900, q: 1.7, gain: 0.032, delay: 0.012 });
    return;
  }

  if (type === 'scarabShellHit') {
    // Chitin snap — very hard, fast, brittle crack
    makeNoiseBurst({ duration: 0.05, frequency: 4400, endFrequency: 2600, q: 3.6, gain: 0.088 });
    // Shell resonance body — carapace ringing after impact
    makeNoiseBurst({ duration: 0.11, frequency: 1250, endFrequency: 720, q: 2.0, gain: 0.065, delay: 0.014 });
    // Shell ring tone — hollow dome resonance
    makeToneHit({ frequency: 620, endFrequency: 320, gain: 0.028, duration: 0.12, wave: 'sine' });
    // Low carapace body — the mass underneath the shell
    makeToneHit({ frequency: 235, endFrequency: 108, gain: 0.026, duration: 0.09, wave: 'square', delay: 0.008 });
    return;
  }

  if (type === 'scorpionHit') {
    // Hard exoskeleton impact — armour-plate quality
    makeNoiseBurst({ duration: 0.07, frequency: 3800, endFrequency: 2200, q: 3.0, gain: 0.080 });
    // Exo body — the mass behind the shell
    makeNoiseBurst({ duration: 0.13, frequency: 1200, endFrequency: 680, q: 1.6, gain: 0.062, delay: 0.012 });
    // Low body thud
    makeToneHit({ frequency: 188, endFrequency: 84, gain: 0.038, duration: 0.13 });
    // Claw/tail click — brief metallic tick after impact
    makeNoiseBurst({ duration: 0.03, frequency: 5400, endFrequency: 3200, q: 2.4, gain: 0.028, delay: 0.024 });
    return;
  }

  if (type === 'snakeHit') {
    // Scale scatter — dry, rustling surface contact
    makeNoiseBurst({ duration: 0.10, frequency: 3200, endFrequency: 1100, q: 0.85, gain: 0.068 });
    // Muscular body thud — snakes are dense muscle, low and meaty
    makeToneHit({ frequency: 148, endFrequency: 62, gain: 0.042, duration: 0.14 });
    // Hiss exhale — brief high-frequency air released on impact
    makeNoiseBurst({ duration: 0.18, frequency: 5200, endFrequency: 1800, q: 0.55, gain: 0.034, delay: 0.016 });
    return;
  }

  if (type === 'sandWispHit') {
    // Sand burst dispersing outward — wide, airy
    makeNoiseBurst({ duration: 0.24, frequency: 2400, endFrequency: 420, q: 0.7, gain: 0.085 });
    // Ethereal dissolve tone — pitch falls as the wisp destabilises
    makeToneHit({ frequency: 720, endFrequency: 185, gain: 0.028, duration: 0.20, wave: 'sine' });
    // Grain scatter detail — fine sand particles
    makeNoiseBurst({ duration: 0.14, frequency: 3800, endFrequency: 1200, q: 1.0, gain: 0.038, delay: 0.022 });
    return;
  }

  if (type === 'bossHit') {
    // Massive carapace impact — queen-scale force
    makeNoiseBurst({ duration: 0.17, frequency: 900, endFrequency: 440, q: 1.0, gain: 0.118 });
    // Sub-bass body resonance — enormous mass, slow decay
    makeToneHit({ frequency: 76, endFrequency: 32, gain: 0.080, duration: 0.26 });
    // High shell scatter — chitin fragments rattling
    makeNoiseBurst({ duration: 0.11, frequency: 3600, endFrequency: 1900, q: 2.2, gain: 0.058, delay: 0.020 });
    // Shell ring tail — hollow resonance of a large dome
    makeToneHit({ frequency: 520, endFrequency: 300, gain: 0.024, duration: 0.22, wave: 'sine', delay: 0.025 });
    return;
  }

  if (type === 'playerImpact') {
    // Leather/cloth muffled hit — equipment absorbs some force
    makeNoiseBurst({ duration: 0.14, frequency: 640, endFrequency: 320, q: 0.82, gain: 0.098 });
    // Body thud — the hit lands on flesh
    makeToneHit({ frequency: 94, endFrequency: 46, gain: 0.068, duration: 0.18 });
    // Gear rattle — belt, tools, satchel jostle on impact
    makeNoiseBurst({ duration: 0.08, frequency: 2400, endFrequency: 960, q: 1.5, gain: 0.036, delay: 0.018 });
    return;
  }

  if (type === 'trapReset') {
    // Heavy stone mechanism grinding back into place
    makeNoiseBurst({ duration: 0.26, frequency: 480, endFrequency: 210, q: 0.68, gain: 0.115 });
    // Stone-on-stone scrape as it seats
    makeNoiseBurst({ duration: 0.18, frequency: 1400, endFrequency: 580, q: 1.2, gain: 0.052, delay: 0.028 });
    // Low resonance of settled stone
    makeToneHit({ frequency: 82, endFrequency: 38, gain: 0.075, duration: 0.28 });
    // Dust settle — brief high scatter after the reset
    makeNoiseBurst({ duration: 0.10, frequency: 3200, endFrequency: 1100, q: 0.9, gain: 0.030, delay: 0.055 });
    return;
  }

  if (type === 'trapStoneTrigger') {
    // Stone pressure plate activating — sharp crack
    makeNoiseBurst({ duration: 0.10, frequency: 1100, endFrequency: 480, q: 1.3, gain: 0.088 });
    // Low stone grind — the mechanism shifting
    makeToneHit({ frequency: 124, endFrequency: 58, gain: 0.052, duration: 0.16 });
    // Surface chip scatter — stone fragments
    makeNoiseBurst({ duration: 0.07, frequency: 3200, endFrequency: 1600, q: 2.2, gain: 0.042, delay: 0.016 });
    // Brief resonance tail
    makeNoiseBurst({ duration: 0.12, frequency: 640, endFrequency: 280, q: 0.8, gain: 0.035, delay: 0.030 });
    return;
  }

  if (type === 'trapSandTrigger') {
    // Sand rush — granular mass shifting suddenly
    makeNoiseBurst({ duration: 0.28, frequency: 820, endFrequency: 220, q: 0.58, gain: 0.102 });
    // Fine grain scatter — top layer dispersing
    makeNoiseBurst({ duration: 0.18, frequency: 2800, endFrequency: 680, q: 0.75, gain: 0.044, delay: 0.020 });
    // Soft impact — feet sinking into sand
    makeToneHit({ frequency: 72, endFrequency: 35, gain: 0.042, duration: 0.22, delay: 0.010 });
    return;
  }

  // ─── Rome synths ─────────────────────────────────────────────────────────────
  // Marble footstep — harder click than dustStep, with a brief high-frequency ring
  if (type === 'romeMarbleStep') {
    const duration = 0.11;
    const buffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * duration), audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const fade = Math.max(0, 1 - (i / data.length) * 3);
      data[i] = (Math.random() * 2 - 1) * fade;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800 + variation * 60, now);
    filter.Q.value = 0.6;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.068 * volume, now + 0.006);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);
    noise.stop(now + duration);
    // Brief ring — marble resonance
    const ring = audioCtx.createOscillator();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(480 + variation * 12, now);
    ring.frequency.exponentialRampToValueAtTime(320 + variation * 8, now + 0.07);
    const ringGain = audioCtx.createGain();
    ringGain.gain.setValueAtTime(0.0001, now);
    ringGain.gain.linearRampToValueAtTime(0.022 * volume, now + 0.005);
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    ring.connect(ringGain);
    ringGain.connect(audioCtx.destination);
    ring.start(now);
    ring.stop(now + 0.1);
    return;
  }

  // Gladius swing — short, fast, higher-pitched than softSwing
  if (type === 'romeGladiusSwing') {
    const duration = 0.16;
    const buffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * duration), audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const attack = Math.min(1, i / (data.length * 0.14));
      const decay = 1 - (i / data.length);
      data[i] = (Math.random() * 2 - 1) * attack * decay;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600 + variation * 55, now);
    filter.frequency.linearRampToValueAtTime(680 + variation * 22, now + duration);
    filter.Q.value = 1.1;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.09 * volume, now + 0.028);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);
    noise.stop(now + duration);
    // Metal harmonic
    const metal = audioCtx.createOscillator();
    metal.type = 'sawtooth';
    metal.frequency.setValueAtTime(310 + variation * 6, now + 0.018);
    metal.frequency.exponentialRampToValueAtTime(210 + variation * 4, now + 0.12);
    const metalGain = audioCtx.createGain();
    metalGain.gain.setValueAtTime(0.0001, now + 0.015);
    metalGain.gain.linearRampToValueAtTime(0.022 * volume, now + 0.032);
    metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    metal.connect(metalGain);
    metalGain.connect(audioCtx.destination);
    metal.start(now + 0.015);
    metal.stop(now + 0.14);
    return;
  }

  // Shield deflect — sharp metal-on-metal crack with ring
  if (type === 'romeShieldDeflect') {
    makeNoiseBurst({ duration: 0.07, frequency: 3200, endFrequency: 1600, q: 2.8, gain: 0.11 });
    makeNoiseBurst({ duration: 0.10, frequency: 1100, endFrequency: 700,  q: 1.6, gain: 0.06, delay: 0.016 });
    makeToneHit({ frequency: 560, endFrequency: 380, gain: 0.028, duration: 0.14, wave: 'square' });
    return;
  }

  // Legion shade hit — armoured but spectral, medium-hard impact
  if (type === 'romeEnemyImpact') {
    makeNoiseBurst({ duration: 0.10, frequency: 1400, endFrequency: 860, q: 1.3, gain: 0.088 });
    makeToneHit({ frequency: 165, endFrequency: 78, gain: 0.036, duration: 0.11 });
    return;
  }

  // Gladiator revenant hit — heavier, more presence
  if (type === 'romeGladiatorImpact') {
    makeNoiseBurst({ duration: 0.13, frequency: 1050, endFrequency: 620, q: 1.2, gain: 0.10 });
    makeToneHit({ frequency: 140, endFrequency: 66, gain: 0.048, duration: 0.15 });
    makeNoiseBurst({ duration: 0.07, frequency: 2800, endFrequency: 1500, q: 2.0, gain: 0.042, delay: 0.022 });
    return;
  }

  // Forum rat hit — fast, light tap
  if (type === 'romeSmallImpact') {
    makeNoiseBurst({ duration: 0.06, frequency: 3400, endFrequency: 1800, q: 1.8, gain: 0.065 });
    makeToneHit({ frequency: 290, endFrequency: 160, gain: 0.022, duration: 0.07, wave: 'square' });
    return;
  }

  // Vestibule wisp hit — ethereal, airy, slightly resonant
  if (type === 'romeWispImpact') {
    makeNoiseBurst({ duration: 0.18, frequency: 2100, endFrequency: 620, q: 0.76, gain: 0.072 });
    makeToneHit({ frequency: 620, endFrequency: 780, gain: 0.020, duration: 0.15, wave: 'sine' });
    return;
  }

  // Marble golem hit — deep, resonant stone crack
  if (type === 'romeGolemImpact') {
    makeNoiseBurst({ duration: 0.16, frequency: 740,  endFrequency: 380, q: 1.0, gain: 0.115 });
    makeToneHit({ frequency: 88,  endFrequency: 42, gain: 0.068, duration: 0.20 });
    makeNoiseBurst({ duration: 0.10, frequency: 2100, endFrequency: 1200, q: 1.9, gain: 0.048, delay: 0.028 });
    return;
  }

  // Legate Revenant boss hit — signature: deep body + ringing armour crack
  if (type === 'romeLegateImpact') {
    makeNoiseBurst({ duration: 0.15, frequency: 920,  endFrequency: 500, q: 1.15, gain: 0.112 });
    makeToneHit({ frequency: 105, endFrequency: 52,  gain: 0.065, duration: 0.19 });
    makeNoiseBurst({ duration: 0.09, frequency: 2600, endFrequency: 1600, q: 2.2, gain: 0.058, delay: 0.026 });
    // Armour ring characteristic
    makeToneHit({ frequency: 860, endFrequency: 640, gain: 0.018, duration: 0.22, delay: 0.02, wave: 'sine' });
    return;
  }

  // Rome player impact — similar to Egypt but slightly harder (marble floor)
  if (type === 'romePlayerImpact') {
    makeNoiseBurst({ duration: 0.12, frequency: 800, endFrequency: 480, q: 1.0, gain: 0.092 });
    makeToneHit({ frequency: 95, endFrequency: 50, gain: 0.062, duration: 0.16 });
    return;
  }

  // Pressure plate — stone scrape, short and deliberate
  if (type === 'romePresurePlate') {
    makeNoiseBurst({ duration: 0.18, frequency: 560, endFrequency: 240, q: 0.75, gain: 0.10 });
    makeToneHit({ frequency: 78, endFrequency: 38, gain: 0.058, duration: 0.20 });
    makeNoiseBurst({ duration: 0.10, frequency: 1600, endFrequency: 700, q: 1.3, gain: 0.038, delay: 0.022 });
    return;
  }

  // Steam burst — hissing pressure release
  if (type === 'romeSteamBurst') {
    const duration = 0.28;
    const buffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * duration), audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const progress = i / data.length;
      const env = progress < 0.15
        ? progress / 0.15
        : Math.max(0, 1 - ((progress - 0.15) / 0.85));
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200 + variation * 80, now);
    filter.frequency.linearRampToValueAtTime(1800 + variation * 40, now + duration);
    filter.Q.value = 0.55;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.10 * volume, now + 0.038);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);
    noise.stop(now + duration);
    return;
  }

  // ─── Egypt-specific enemy hit synths ─────────────────────────────────────────
  // Bat hit — membrane snap + interrupted squeak + flutter tail + hollow body thump
  if (type === 'batHit') {
    // Wing membrane snap — very fast, sharp crack
    makeNoiseBurst({ duration: 0.05, frequency: 3800, endFrequency: 1600, q: 2.2, gain: 0.085 });
    // Interrupted squeak — high pitch drops fast, like a bat cut off mid-cry
    makeToneHit({ frequency: 1400, endFrequency: 320, gain: 0.028, duration: 0.055, wave: 'sawtooth' });
    // Wing flutter tail — softer scatter as the wings fold
    makeNoiseBurst({ duration: 0.14, frequency: 2100, endFrequency: 750, q: 1.0, gain: 0.042, delay: 0.02 });
    // Hollow body thump — tiny mass, very light
    makeToneHit({ frequency: 185, endFrequency: 98, gain: 0.016, duration: 0.09, wave: 'triangle', delay: 0.008 });
    return;
  }

  // Mummy hit — muffled cloth thud + deep bone resonance + dry linen crinkle + ancient creak
  if (type === 'mummyHit') {
    // Muffled cloth thud — lowpass filtered so wrappings absorb the hit
    makeNoiseBurst({ duration: 0.20, frequency: 480, endFrequency: 200, q: 0.6, gain: 0.105, type: 'lowpass' });
    // Deep bone resonance — low and slow
    makeToneHit({ frequency: 88, endFrequency: 38, gain: 0.058, duration: 0.20 });
    // Dry linen crinkle — brittle high-freq scatter from the bandages
    makeNoiseBurst({ duration: 0.07, frequency: 2900, endFrequency: 1100, q: 1.5, gain: 0.048, delay: 0.010 });
    // Ancient wooden creak — dried wrapping material settling
    makeToneHit({ frequency: 290, endFrequency: 155, gain: 0.018, duration: 0.14, wave: 'sawtooth', delay: 0.022 });
    return;
  }

  // Falling stone block — heavy impact with low thud + debris scatter
  if (type === 'romeStoneFall') {
    makeNoiseBurst({ duration: 0.24, frequency: 480, endFrequency: 200, q: 0.65, gain: 0.12 });
    makeToneHit({ frequency: 68, endFrequency: 32, gain: 0.075, duration: 0.26 });
    makeNoiseBurst({ duration: 0.18, frequency: 1800, endFrequency: 640, q: 1.1, gain: 0.052, delay: 0.032 });
    makeNoiseBurst({ duration: 0.12, frequency: 3200, endFrequency: 1200, q: 1.8, gain: 0.030, delay: 0.055 });
    return;
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
              onSendToLab={(collectedEvidence, fieldNotes, scenarioId = 'egypt') => {
                const playedScenario = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS.find(s => s.id === 'egypt');
                if (!playedScenario) return;

                // Hydrate collected evidence into full activeArtifacts
                const activeArtifacts = collectedEvidence.map(item => {
                  const fullArtifact = playedScenario.evidence.find(e => e.id === item.id);
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
                setCurrentScenario(playedScenario);
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
