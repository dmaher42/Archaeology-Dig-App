import { clamp } from './journeyUtils.js';

export const OPENING_THRESHOLD_SCENE_DURATION = 14;
export const OPENING_THRESHOLD_FADE_SECONDS = 1.2;
export const OPENING_THRESHOLD_STAIR_REVEAL_SECONDS = 3.8;
export const OPENING_THRESHOLD_FALL_DELAY_SECONDS = 0.45;
export const OPENING_THRESHOLD_FALL_DURATION_SECONDS = 1.6;
export const ARRIVAL_THRESHOLD_BACKGROUND_SRC = 'assets/expedition/backgrounds/arrival-threshold/arrival-threshold-full-scene-2026-06-08.png';
export const ARRIVAL_THRESHOLD_ASSET_VERSION = 'arrival-threshold-final-art-2026-06-08';

export const ARRIVAL_THRESHOLD_SPAWN_X = 440;
export const ARRIVAL_THRESHOLD_LEFT_BOUND = 120;
export const ARRIVAL_THRESHOLD_RIGHT_BOUND = 1120;
export const ARRIVAL_THRESHOLD_LEFT_INSPECT_X = 245;
export const ARRIVAL_THRESHOLD_MARKINGS_INSPECT_X = 880;
export const ARRIVAL_THRESHOLD_FORWARD_GATE_TRIGGER_X = 1040;
export const ARRIVAL_THRESHOLD_OBJECTIVE_LINE = 'Find where the seal brought you.';
export const ARRIVAL_THRESHOLD_LEFT_OBJECTIVE_LINE = 'Look for another path.';
export const ARRIVAL_THRESHOLD_GATE_OBJECTIVE_LINE = 'The way back is gone. Move forward.';
export const ARRIVAL_THRESHOLD_SPAWN_LINE = 'The pyramid... where is it?';
export const ARRIVAL_THRESHOLD_LEFT_LINES = [
  'I was outside. Wind. Sunlight. Open desert.',
  "Now there's no horizon. No sound.",
  'The way back is sealed.',
];
export const ARRIVAL_THRESHOLD_MARKING_LINES = [
  "These gates... these aren't part of the site.",
  'Funerary markings. Passage symbols.',
  "It's arranged like a journey for the dead.",
  "But I'm not dead.",
];
export const OPENING_SPHINX_DURATION = 14;
export const OPENING_SPHINX_EXIT_SECONDS = 2.35;
export const OPENING_SPHINX_ARRIVAL_SECONDS = 1.05;
export const OPENING_SPHINX_LINE_SECONDS = 2.15;
export const OPENING_CINEMATIC_ENABLED = true;
// The opening plays silent-with-subtitles. The robotic browser TTS made the
// pacing feel like a prototype, so it stays off until real per-line voiceover is
// recorded — flip this to true (or wire VO clips by line id) when that lands.
export const OPENING_CINEMATIC_VOICE_ENABLED = false;
export const OPENING_CINEMATIC_DURATION = 54;
export const OPENING_CINEMATIC_SPELL_IMPACT_AT = 49.4;
export const OPENING_ASHA_CUTSCENE_SRC = 'assets/expedition/player/asha-opening-reference-cutscene.png';
export const OPENING_ARRIVAL_AFTERSHOCK_NOTICE = 'The way back is gone. Anubis is still watching. The only path is forward, into judgement.';
export const OPENING_CINEMATIC_LINES = [
  {
    id: 'asha-not-the-site',
    at: 1.0,
    speaker: 'Asha',
    voice: 'asha',
    text: "This isn't the excavation site.",
  },
  {
    id: 'asha-reads-markings',
    at: 3.2,
    speaker: 'Asha',
    voice: 'asha',
    text: 'The gates... the funerary markings...',
  },
  {
    id: 'asha-not-field-of-reeds',
    at: 5.6,
    speaker: 'Asha',
    voice: 'asha',
    text: "This is not the Field of Reeds. It's too broken.",
  },
  {
    id: 'asha-shaped-like-journey',
    at: 8.0,
    speaker: 'Asha',
    voice: 'asha',
    text: "But it's shaped like the journey.",
  },
  {
    id: 'anubis-impossible',
    at: 10.2,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'Impossible.',
  },
  {
    id: 'anubis-mortal-beyond-seal',
    at: 11.6,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'A mortal stands beyond my seal.',
  },
  {
    id: 'anubis-one-road',
    at: 13.9,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'There is one road beyond life.',
  },
  {
    id: 'anubis-death',
    at: 16.0,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'Death.',
  },
  {
    id: 'asha-names-anubis',
    at: 17.6,
    speaker: 'Asha',
    voice: 'asha',
    text: 'Anubis...',
  },
  {
    id: 'anubis-name-no-passage',
    at: 19.4,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'Do not speak my name as if it gives you passage.',
  },
  {
    id: 'anubis-broke-tombs',
    at: 22.0,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'Your kind broke tombs.',
  },
  {
    id: 'anubis-broke-names',
    at: 23.8,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'Broke names.',
  },
  {
    id: 'anubis-broke-memory',
    at: 25.2,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'Broke memory.',
  },
  {
    id: 'anubis-broke-boundary',
    at: 26.8,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'And now you break the boundary itself.',
  },
  {
    id: 'asha-didnt-choose',
    at: 29.2,
    speaker: 'Asha',
    voice: 'asha',
    text: "I didn't choose to cross.",
  },
  {
    id: 'anubis-words-for-trespass',
    at: 31.2,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'Your kind always has words for trespass.',
  },
  {
    id: 'anubis-discovery',
    at: 33.6,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'Discovery.',
  },
  {
    id: 'anubis-study',
    at: 34.9,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'Study.',
  },
  {
    id: 'anubis-preservation',
    at: 36.2,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'Preservation.',
  },
  {
    id: 'anubis-hands-same',
    at: 37.9,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'The hands remain the same.',
  },
  {
    id: 'asha-not-here-to-steal',
    at: 40.0,
    speaker: 'Asha',
    voice: 'asha',
    text: "I'm not here to steal.",
  },
  {
    id: 'anubis-before-hand-closes',
    at: 42.0,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'That is what your kind says before the hand closes.',
  },
  {
    id: 'asha-way-back-gone',
    at: 44.6,
    speaker: 'Asha',
    voice: 'asha',
    text: 'The way back is gone.',
  },
  {
    id: 'asha-path-forward',
    at: 46.6,
    speaker: 'Asha',
    voice: 'asha',
    text: 'If this place follows the journey, then the path must go forward.',
  },
  {
    id: 'anubis-forward-judgement',
    at: OPENING_CINEMATIC_SPELL_IMPACT_AT,
    speaker: 'Anubis',
    voice: 'guardian',
    text: 'Forward is judgement.',
  },
  {
    id: 'asha-keep-moving',
    at: 51.8,
    speaker: 'Asha',
    voice: 'asha',
    text: 'Then I keep moving.',
  },
];
// Rome opening cinematic — Legate Revenant speaks as Asha descends the Via Sacra.
// Structure mirrors OPENING_CINEMATIC_LINES; activated when OPENING_CINEMATIC_ENABLED and Rome is active.
export const ROME_OPENING_CINEMATIC_LINES = [
  {
    id: 'legate-warning',
    at: 1.4,
    speaker: 'Legate Revenant',
    voice: 'guardian',
    text: 'You opened a door that an empire sealed with its own blood.',
  },
  {
    id: 'asha-reply',
    at: 5.8,
    speaker: 'Asha',
    voice: 'asha',
    text: 'The Senate is gone. The seal is mine to break. Whatever you were guarding, I need to see it.',
  },
  {
    id: 'legate-jurisdiction',
    at: 10.8,
    speaker: 'Legate Revenant',
    voice: 'guardian',
    text: 'My jurisdiction did not expire when the empire did.',
  },
  {
    id: 'asha-purpose',
    at: 16.6,
    speaker: 'Asha',
    voice: 'asha',
    text: 'Then defend it. I will record what I find either way.',
  },
  {
    id: 'legate-begin',
    at: 19.2,
    speaker: 'Legate Revenant',
    voice: 'guardian',
    text: 'The archive stays sealed. You will not leave with it.',
  },
];

// Returns the correct opening cinematic lines for the current civilisation.
export const getOpeningCinematicLines = (targetCivilisation) => {
  if (typeof targetCivilisation === 'string' && targetCivilisation.toLowerCase().includes('rome')) {
    return ROME_OPENING_CINEMATIC_LINES;
  }
  return OPENING_CINEMATIC_LINES;
};

export const easeInOutCubic = (value) => {
  const t = clamp(value, 0, 1);
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const getOpeningThresholdDialogueLine = (scene) => {
  if (!scene?.lines?.length) return null;
  const elapsed = clamp((scene.duration || 0) - (scene.timer || 0), 0, scene.duration || 0);
  const activeLine = [...scene.lines].reverse().find(line => elapsed >= line.at);
  return activeLine || scene.lines[0];
};

export const getOpeningCinematicLine = (cinematic) => {
  if (!cinematic?.lines?.length) return null;
  const elapsed = clamp((cinematic.duration || 0) - (cinematic.timer || 0), 0, cinematic.duration || 0);
  const activeLine = [...cinematic.lines].reverse().find(line => elapsed >= line.at);
  return activeLine || cinematic.lines[0];
};
