import { clamp } from './journeyUtils.js';

export const OPENING_THRESHOLD_SCENE_DURATION = 14;
export const OPENING_THRESHOLD_FADE_SECONDS = 1.2;
export const OPENING_THRESHOLD_STAIR_REVEAL_SECONDS = 3.8;
export const OPENING_THRESHOLD_FALL_DELAY_SECONDS = 0.45;
export const OPENING_THRESHOLD_FALL_DURATION_SECONDS = 1.6;
export const ARRIVAL_THRESHOLD_BACKGROUND_SRC = 'assets/expedition/backgrounds/arrival-threshold/arrival-threshold-duat-night-dormant-2026-06-21.png';
export const ARRIVAL_THRESHOLD_DOORWAY_OCCLUDER_SRC = 'assets/expedition/backgrounds/arrival-threshold/arrival-threshold-duat-training-chamber-foreground-2026-06-21.png';
export const ARRIVAL_THRESHOLD_DOORWAY_GLOW_SRC = 'assets/expedition/backgrounds/arrival-threshold/arrival-threshold-duat-training-chamber-glow-2026-06-21.png';
export const ARRIVAL_THRESHOLD_SEAL_VEIL_SRC = 'assets/expedition/backgrounds/arrival-threshold/arrival-threshold-duat-seal-veil-2026-06-22.png';
export const ARRIVAL_THRESHOLD_DUAT_ECHO_SRC = 'assets/expedition/enemies/duat-echo-trial-sprites-2026-06-21.png';
export const ARRIVAL_THRESHOLD_ASSET_VERSION = 'arrival-threshold-duat-smoky-seal-2026-06-22';
// The room "wakes up": the dormant plate (BACKGROUND_SRC) stays as the base, and the
// light difference toward this awakened plate is additively revealed over WAKE_SECONDS
// once Asha reaches the breach — light is added, never cross-faded, so it ignites.
export const ARRIVAL_THRESHOLD_AWAKENED_SRC = 'assets/expedition/backgrounds/arrival-threshold/arrival-threshold-duat-night-awakened-2026-06-21.png';
export const ARRIVAL_THRESHOLD_WAKE_SECONDS = 2.6;

export const ARRIVAL_THRESHOLD_SPAWN_X = 905;
export const ARRIVAL_THRESHOLD_LEFT_BOUND = 96;
export const ARRIVAL_THRESHOLD_RIGHT_BOUND = 1100;
export const ARRIVAL_THRESHOLD_LEFT_INSPECT_X = 420;
export const ARRIVAL_THRESHOLD_MARKINGS_INSPECT_X = 745;
export const ARRIVAL_THRESHOLD_FORWARD_GATE_TRIGGER_X = 285;
export const ARRIVAL_THRESHOLD_EXIT_WALK_END_X = 128;
export const ARRIVAL_THRESHOLD_EXIT_WALK_SECONDS = 1.35;
export const ARRIVAL_THRESHOLD_FLOOR_Y = 470;
export const ARRIVAL_THRESHOLD_RAMP_START_X = 330;
export const ARRIVAL_THRESHOLD_RAMP_END_X = 155;
export const ARRIVAL_THRESHOLD_RAMP_RISE = 44;
export const ARRIVAL_THRESHOLD_OBJECTIVE_LINE = 'The portal behind me is sealed. The breach is the only path.';
export const ARRIVAL_THRESHOLD_LEFT_OBJECTIVE_LINE = 'The broken scarab breach leads onward.';
export const ARRIVAL_THRESHOLD_GATE_OBJECTIVE_LINE = 'That doorway brought me here. It will not take me back.';
export const ARRIVAL_THRESHOLD_SPAWN_LINE = 'That doorway brought me here... and now it is closing.';
export const ARRIVAL_THRESHOLD_LEFT_LINES = [
  'The scarab seal is broken open.',
  'Those steps are not part of the excavation.',
  'They lead into the Duat.',
];
export const ARRIVAL_THRESHOLD_MARKING_LINES = [
  'That gate brought me here.',
  'The passage symbols are fading.',
  'It is not a way back.',
];
export const ARRIVAL_THRESHOLD_TRIAL_STEPS = [
  {
    id: 'still-echo',
    name: 'Still Echo',
    objective: 'Strike the still echo.',
    ashaLine: 'It is not alive. It is a shape. A warning.',
    x: 665,
    yOffset: 0,
    width: 42,
    height: 70,
    movement: 'still',
  },
  {
    id: 'moving-echo',
    name: 'Moving Echo',
    objective: 'Track the moving echo.',
    ashaLine: 'The room is measuring how I move.',
    x: 610,
    patrolMin: 500,
    patrolMax: 780,
    width: 42,
    height: 70,
    speed: 78,
    movement: 'patrol',
  },
  {
    id: 'striking-echo',
    name: 'Striking Echo',
    objective: 'Dodge the striking echo.',
    ashaLine: 'Not a welcome. A test.',
    x: 640,
    width: 48,
    height: 74,
    speed: 120,
    movement: 'strike',
  },
];
export const ARRIVAL_THRESHOLD_TRIAL_COMPLETE_LINE = 'The breach opened. So the rules are real enough.';
export const ARRIVAL_THRESHOLD_TRIAL_EXIT_LOCKED_LINE = 'The breach waits. The threshold is still measuring Asha.';
export const ARRIVAL_THRESHOLD_ECHO_SPAWN_SECONDS = 0.85;
export const ARRIVAL_THRESHOLD_ECHO_INTRO_DRIFT_SECONDS = 0.9;
export const ARRIVAL_THRESHOLD_ANUBIS_TRIAL_LINES = [
  'The threshold measured you.',
  'It found motion. Not innocence.',
  'Do not mistake survival for passage.',
];

export const createArrivalThresholdTrialState = () => ({
  active: true,
  completed: false,
  stepIndex: 0,
  activeStepId: ARRIVAL_THRESHOLD_TRIAL_STEPS[0]?.id || null,
  echo: {
    ...ARRIVAL_THRESHOLD_TRIAL_STEPS[0],
    direction: -1,
    timer: 0,
    awakeTimer: 0,
    spawnTimer: ARRIVAL_THRESHOLD_ECHO_SPAWN_SECONDS,
    hitFlash: 0,
    attackCue: 0,
    cleared: false,
  },
  completedStepIds: [],
  lineShownForStepId: null,
  completionAnnounced: false,
});
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
export const OPENING_ENTRANCE_STAGE = Object.freeze({
  id: 'desert-entry-guardian-challenge',
  name: 'Anubis',
  duration: 4.2,
  cameraDuration: 3.15,
  noticeDuration: 4.2,
  cameraFocusX: 1320,
  cameraAnchorRatio: 0.58,
  maxForwardPanRatio: 0.26,
  notice: 'The lost site lies ahead. Gather field tools and relic fragments. Survive the guardians to open the excavation site.',
  message: 'Tools and fragments open the site. Guardians decide if Asha reaches it.',
});
export const createOpeningEntranceStageEvent = () => ({
  id: OPENING_ENTRANCE_STAGE.id,
  name: OPENING_ENTRANCE_STAGE.name,
  message: OPENING_ENTRANCE_STAGE.message,
  temporary: true,
});
export const CHINA_OPENING_ARRIVAL_NOTICE = 'The river gate shut behind me. The watchtower has noticed. The only path is through the valley.';
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

export const CHINA_OPENING_CINEMATIC_LINES = [
  {
    id: 'china-gate-shuts',
    at: 1.4,
    speaker: 'Asha',
    voice: 'asha',
    text: 'The river gate just locked behind me.',
  },
  {
    id: 'china-watchtower-wakes',
    at: 5.8,
    speaker: 'Watchtower Sentry',
    voice: 'guardian',
    text: 'No one crosses the valley without leaving a record.',
  },
  {
    id: 'china-asha-record',
    at: 10.6,
    speaker: 'Asha',
    voice: 'asha',
    text: 'Then I record what I find and keep moving.',
  },
  {
    id: 'china-sentry-test',
    at: 15.8,
    speaker: 'Watchtower Sentry',
    voice: 'guardian',
    text: 'The first timber seal will test your evidence.',
  },
  {
    id: 'china-asha-forward',
    at: 20.2,
    speaker: 'Asha',
    voice: 'asha',
    text: 'Forward through the valley, then.',
  },
];

// Returns the correct opening cinematic lines for the current civilisation.
export const getOpeningCinematicLines = (targetCivilisation) => {
  const civilisation = typeof targetCivilisation === 'string' ? targetCivilisation.toLowerCase() : '';
  if (civilisation.includes('rome')) {
    return ROME_OPENING_CINEMATIC_LINES;
  }
  if (civilisation.includes('china')) {
    return CHINA_OPENING_CINEMATIC_LINES;
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
