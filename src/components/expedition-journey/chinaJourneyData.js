import { GROUND_Y, JOURNEY_VERTICAL_OFFSET, WORLD_WIDTH, scaleJourneyX } from './journeyConstants.js';

const JY = (y) => y + JOURNEY_VERTICAL_OFFSET;
const X = scaleJourneyX;

export const CHINA_SECTIONS = [
  { id: 'bamboo-forest', name: 'Bamboo Forest', start: X(0), end: X(2500), color: '#a3b18a', accent: '#344e41' },
  { id: 'rammed-earth-gate', name: 'Rammed Earth Gate', start: X(2500), end: X(4500), color: '#d4a373', accent: '#bc6c25' },
  { id: 'terracotta-tomb', name: 'Terracotta Tomb', start: X(4500), end: WORLD_WIDTH, color: '#3a5a40', accent: '#283618' },
];

export const CHINA_PLATFORMS = [
  { x: X(0), y: GROUND_Y, width: X(2500), height: 60, label: 'forest path' },
  { x: X(2500), y: GROUND_Y, width: X(2000), height: 60, label: 'earth gate floor' },
  { x: X(4500), y: GROUND_Y, width: WORLD_WIDTH - X(4500), height: 60, label: 'tomb tiles' },
  // Verticality in Bamboo Forest
  { x: X(500), y: JY(180), width: 140, height: 16, label: 'bamboo branch' },
  { x: X(750), y: JY(80), width: 120, height: 16, label: 'bamboo branch high' },
  { x: X(1050), y: JY(140), width: 160, height: 16, label: 'stone lantern top' },
  // Platforms leading up to Rammed Earth Gate
  { x: X(2200), y: JY(200), width: 180, height: 24, label: 'gate approach step 1' },
  { x: X(2380), y: JY(100), width: 180, height: 24, label: 'gate approach step 2' },
];

export const CHINA_HAZARDS = [
  { id: 'bamboo-spikes-1', type: 'spikes', x: X(1200), y: GROUND_Y - 24, width: 120, height: 24, damage: 1, respawnX: X(1050), respawnY: JY(140), penalty: { stamina: 10 }, message: 'Bamboo spikes jabbed through the path. Jump over them.' },
  { id: 'bamboo-spikes-2', type: 'spikes', x: X(1320), y: GROUND_Y - 24, width: 120, height: 24, damage: 1, respawnX: X(1050), respawnY: JY(140), penalty: { stamina: 10 }, message: 'Bamboo spikes blocked the route. Stamina reduced.' },
  { id: 'ancient-crossbow-1', type: 'arrow-trap', x: X(2450), y: JY(50), width: 32, height: 32, damage: 1, interval: 2.5, speed: -400, direction: -1, penalty: { stamina: 8, time: 3 }, message: 'An ancient crossbow bolt grazed the route. Time and stamina reduced.' },
];

export const CHINA_ROUTE_GATES = [
  {
    id: 'rammed-earth-seal',
    name: 'Rammed Earth Seal',
    x: X(4400),
    y: JY(86),
    width: 34,
    height: 274,
    message: 'The Rammed Earth Seal blocks your path.',
    readyHint: 'The earth trembles. Proceed.',
    openMessage: 'The ancient earth has parted.',
    requires: {
      shards: 4,
    },
  }
];

export const CHINA_ROUTE_GATE_DOORWAYS = [];

export const CHINA_SCARAB_SEAL_TRIGGER = {
  id: 'jade-seal-trigger',
  sectionId: 'bamboo-forest',
  bossId: 'terracotta-general',
  name: 'Ancestral Jade Seal',
  x: 925,
  y: JY(-117),
  width: 160,
  height: 90,
  eventName: 'Ancestral Spirit',
  eventType: 'shrine-glow',
  shake: 0.16,
  duration: 29.0,
  sealEmphasisMessage: 'The jade seal pulses with ancient energy. The Ancestral Spirit has noticed.',
  sealPulseLabel: 'ANCESTRAL SEAL',
  sealPulseRadius: 76,
  sealPulseDuration: 0.95,
  cameraRevealDuration: 1.8,
  objectiveEchoLine: 'The spirit demands respect. Restore the jade fragments.',
  firstShardEchoLine: 'First fragment restored.',
  messages: [
    'You walk where emperors sleep. You do not belong here.',
    'Another looter... or something else?',
    'Restore the shattered jade. Prove your worth.'
  ],
  dialogueSpeakers: [
    'Guardian Network',
    'Guardian Network',
    'Guardian Network',
  ],
  dialogueTiming: [0.8, 3.3, 6.3],
  stairwellRevealLine: 'The earth parts to reveal a hidden path.',
  bossIntroLine: 'The earth remembers. The clay awakens. Prepare yourself.',
  guideFollowUpLine: 'The guardian system is testing you. Survive the trial.',
};

export const CHINA_TOOL_LAYOUT = [
  { id: 'brush', x: X(300), y: JY(314) },
  { id: 'trowel', x: X(800), y: JY(320) },
  { id: 'notebook', x: X(1500), y: JY(286) },
];

export const CHINA_RELIC_SHARD_LAYOUT = [
  { x: 400, y: 320 }, { x: 600, y: 274 }, { x: 800, y: 226 },
];

export const CHINA_BOSS_KEY_ITEMS = [
  { id: 'jade-fragment-1', name: 'Shattered Jade Fragment', x: X(150), y: JY(80) },
  { id: 'jade-fragment-2', name: 'Shattered Jade Fragment', x: X(1400), y: JY(180) },
  { id: 'jade-fragment-3', name: 'Shattered Jade Fragment', x: X(2100), y: JY(20) },
  { id: 'jade-fragment-4', name: 'Shattered Jade Fragment', x: X(3400), y: JY(140) },
];

export const CHINA_STORY_PROPS = [
  {
    id: 'broken-terracotta-limb',
    x: X(500),
    y: GROUND_Y - 20,
    width: 64,
    height: 32,
    hitboxWidth: 80,
    hitboxHeight: 60,
    label: 'Broken Terracotta Limb',
    sprite: 'rubbleClusterSmall',
    messages: [
      'A shattered clay arm.',
      'The fracture is clean, as if sliced by something ancient.'
    ],
    speakers: ['Asha', 'Asha']
  },
  {
    id: 'faded-bamboo-scroll',
    x: X(1800),
    y: GROUND_Y - 20,
    width: 48,
    height: 24,
    hitboxWidth: 80,
    hitboxHeight: 60,
    label: 'Faded Bamboo Scroll',
    sprite: 'buriedCarvedHead',
    messages: [
      'The text is barely readable.',
      'It speaks of a "great network of gates" built beneath the earth.'
    ],
    speakers: ['Asha', 'Asha']
  },
  {
    id: 'ancient-kiln-ash',
    x: X(3800),
    y: GROUND_Y - 10,
    width: 120,
    height: 20,
    hitboxWidth: 140,
    hitboxHeight: 60,
    label: 'Ancient Kiln Ash',
    sprite: 'lowDustVeil',
    messages: [
      'This ash is still warm.',
      'Someone—or something—has been tending this fire recently.'
    ],
    speakers: ['Asha', 'Asha']
  }
];

export const CHINA_SECTION_ATMOSPHERES = {
  'bamboo-forest': { title: 'The Silent Bamboo', description: 'A thick, humid forest. Roots cling to ruins.', color: '#a3b18a' },
  'rammed-earth-gate': { title: 'The Ancient Gate', description: 'A massive earthen structure blocking the way.', color: '#d4a373' },
  'terracotta-tomb': { title: 'The Terracotta Tomb', description: 'The silent army stands guard.', color: '#3a5a40' }
};

export const CHINA_CHECKPOINTS = [];
export const CHINA_ENVIRONMENT_INTERACTIONS = [];
export const CHINA_HIDDEN_ROUTES = [];
export const CHINA_STAGE_ENTRANCE_FEATURES = [];
export const CHINA_ENVIRONMENT_EVENTS = [];
export const CHINA_SECTION_OBJECTIVES = {};
export const CHINA_OBJECTIVE_MARKERS = [];
export const CHINA_SECRET_COLLECTIBLES = [
  { id: 'jade-cicada', name: 'Jade Cicada', x: X(780), y: JY(50), value: 50, hint: 'High in the bamboo canopy.' },
  { id: 'bronze-coin', name: 'Ban Liang Coin', x: X(2400), y: JY(60), value: 25, hint: 'Above the gate approach.' },
];
export const CHINA_LORE_TABLETS = [
  { id: 'bamboo-scroll', name: 'Weathered Bamboo Scroll', x: X(1100), y: JY(110), text: 'The river floods each spring, burying the old foundations in silt. We build higher.' }
];
export const CHINA_GUARDIAN_KNOWLEDGE_CHALLENGES = {};
export const CHINA_GUARDIAN_KNOWLEDGE_QUESTIONS = [];
export const CHINA_WORLD_CONTINUITY_LANDMARKS = [];
export const CHINA_WORLD_TRANSITION_STORY_MARKERS = [];
