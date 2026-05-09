import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Backpack,
  ChevronLeft,
  Flag,
  Gauge,
  Gem,
  Map,
  ShieldAlert,
  Sparkles,
  Swords,
} from 'lucide-react';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 420;
const WORLD_WIDTH = 7600;
const GROUND_Y = 360;
const PLAYER_WIDTH = 28;
const PLAYER_HEIGHT = 42;
const GRAVITY = 1850;
const MOVE_SPEED = 245;
const JUMP_SPEED = 620;
const ATTACK_COOLDOWN = 0.38;
const ATTACK_DURATION = 0.16;
const INVULNERABLE_DURATION = 1.05;

const INITIAL_JOURNEY_NOTICE = 'Reach Base Camp. Collect tools, relic shards, and upgrades along the way.';

const JOURNEY_TOOLS = [
  { id: 'brush', name: 'Brush', emoji: '🖌️', icon: 'B' },
  { id: 'trowel', name: 'Trowel', emoji: '⛏️', icon: 'T' },
  { id: 'notebook', name: 'Notebook', emoji: '📓', icon: 'N' },
  { id: 'camera', name: 'Camera', emoji: '📷', icon: 'C' },
  { id: 'measuring-tape', name: 'Measuring Tape', emoji: '📏', icon: 'M' },
  { id: 'field-guide-page', name: 'Field Guide Page', emoji: '📜', icon: 'F' },
];

const SECTIONS = [
  { id: 'desert-entry', name: 'Desert Entry', start: 0, end: 1500, color: '#f3e5ab', accent: '#b45309' },
  { id: 'ruined-temple', name: 'Ruined Temple', start: 1500, end: 3150, color: '#d1bfa7', accent: '#5c4033' },
  { id: 'catacombs', name: 'Catacombs', start: 3150, end: 5050, color: '#3d3d3d', accent: '#7c3aed' },
  { id: 'escape-sequence', name: 'Escape Sequence', start: 5050, end: 6500, color: '#a16207', accent: '#991b1b' },
  { id: 'dig-site-entrance', name: 'Dig Site Entrance', start: 6500, end: WORLD_WIDTH, color: '#dcfce7', accent: '#166534' },
];

const TOOL_LAYOUT = [
  { id: 'brush', x: 220, y: 314 },
  { id: 'trowel', x: 770, y: 320 },
  { id: 'notebook', x: 1780, y: 320 },
  { id: 'camera', x: 2860, y: 320 },
  { id: 'measuring-tape', x: 4280, y: 260 },
  { id: 'field-guide-page', x: 6210, y: 208 },
];

const PLATFORMS = [
  { x: 0, y: GROUND_Y, width: 1500, height: 60, label: 'desert track' },
  { x: 1500, y: GROUND_Y, width: 1650, height: 60, label: 'temple floor' },
  { x: 3150, y: GROUND_Y, width: 1900, height: 60, label: 'catacomb path' },
  { x: 5050, y: GROUND_Y, width: 1450, height: 60, label: 'escape road' },
  { x: 6500, y: GROUND_Y, width: 1100, height: 60, label: 'dig-site rise' },
  { x: 360, y: 292, width: 175, height: 18, label: 'sun-baked ledge' },
  { x: 690, y: 276, width: 165, height: 18, label: 'broken column' },
  { x: 1180, y: 304, width: 150, height: 18, label: 'survey ridge' },
  { x: 1640, y: 292, width: 180, height: 18, label: 'temple plinth' },
  { x: 1940, y: 246, width: 150, height: 18, label: 'upper step' },
  { x: 2225, y: 204, width: 160, height: 18, label: 'rope shelf', requiresUpgrade: 'rope-launcher' },
  { x: 2500, y: 264, width: 210, height: 18, label: 'mural walkway' },
  { x: 2790, y: 222, width: 185, height: 18, label: 'archive ledge' },
  { x: 3310, y: 300, width: 180, height: 18, label: 'catacomb shelf' },
  { x: 3600, y: 252, width: 160, height: 18, label: 'hidden stair', secret: true, requiresUpgrade: 'torch-upgrade' },
  { x: 3890, y: 206, width: 160, height: 18, label: 'torch alcove', secret: true, requiresUpgrade: 'torch-upgrade' },
  { x: 4200, y: 278, width: 210, height: 18, label: 'bone-dry bridge' },
  { x: 4590, y: 226, width: 170, height: 18, label: 'relic loft', secret: true, requiresUpgrade: 'historian-vision' },
  { x: 5160, y: 300, width: 160, height: 18, label: 'falling stair' },
  { x: 5440, y: 258, width: 155, height: 18, label: 'escape shelf' },
  { x: 5740, y: 222, width: 155, height: 18, label: 'collapsed arch' },
  { x: 6045, y: 284, width: 180, height: 18, label: 'final run ledge' },
  { x: 6660, y: 302, width: 170, height: 18, label: 'camp overlook' },
  { x: 6950, y: 250, width: 160, height: 18, label: 'secret survey perch', secret: true, requiresUpgrade: 'ancient-compass' },
  { x: 7240, y: 302, width: 170, height: 18, label: 'last ledge' },
];

const HAZARDS = [
  { id: 'thorn-bush', name: 'thorn bush', emoji: '🌿', x: 560, y: 329, width: 54, height: 31, penalty: { stamina: 8 }, message: 'Thorn scrub slowed the team. Stamina reduced.' },
  { id: 'sand-pit', name: 'soft sand', emoji: '⏳', x: 1060, y: 330, width: 92, height: 30, penalty: { time: 10 }, message: 'Soft sand cost the team time.' },
  { id: 'spike-trap', name: 'temple trap', emoji: '🧱', x: 2050, y: 330, width: 70, height: 30, penalty: { stamina: 12 }, message: 'A temple trap clipped your route. Stamina reduced.' },
  { id: 'rolling-stones', name: 'rolling stones', emoji: '🪨', x: 2925, y: 318, width: 70, height: 42, penalty: { stamina: 12, time: 5 }, message: 'Rolling stones forced a scramble.' },
  { id: 'dark-gap', name: 'dark gap', emoji: '⬛', x: 3460, y: 344, width: 90, height: 18, penalty: { stamina: 10 }, message: 'You stumbled in a dark gap.' },
  { id: 'bat-cloud', name: 'bat cloud', emoji: '🦇', x: 4470, y: 244, width: 105, height: 78, penalty: { time: 9 }, message: 'A cloud of bats scattered the team.' },
  { id: 'falling-blocks', name: 'falling blocks', emoji: '🧱', x: 5350, y: 318, width: 90, height: 42, penalty: { stamina: 14 }, message: 'Falling blocks made the escape tense.' },
  { id: 'dust-wave', name: 'dust wave', emoji: '💨', x: 5960, y: 316, width: 130, height: 44, penalty: { time: 12 }, message: 'Dust reduced visibility. Time reduced.' },
  { id: 'loose-slope', name: 'loose slope', emoji: '📉', x: 6910, y: 330, width: 110, height: 30, penalty: { stamina: 10 }, message: 'Loose stones made the final climb harder.' },
];

const ENEMIES = [
  { id: 'scarab-1', name: 'Scarab', type: 'scarab', emoji: '🐞', x: 890, y: 334, width: 34, height: 26, patrolMin: 820, patrolMax: 1040, speed: 80, health: 1, damage: 8, shards: 2 },
  { id: 'snake-1', name: 'Sand Snake', type: 'snake', emoji: '🐍', x: 1390, y: 330, width: 42, height: 30, patrolMin: 1320, patrolMax: 1470, speed: 62, health: 1, damage: 10, shards: 2 },
  { id: 'guardian-1', name: 'Stone Guardian', type: 'guardian', emoji: '🗿', x: 2350, y: 318, width: 36, height: 42, patrolMin: 2240, patrolMax: 2580, speed: 72, health: 2, damage: 12, shards: 4 },
  { id: 'looter-1', name: 'Rival Looter', type: 'looter', emoji: '👤', x: 3040, y: 318, width: 34, height: 42, patrolMin: 2920, patrolMax: 3140, speed: 90, health: 2, damage: 12, shards: 4 },
  { id: 'bat-1', name: 'Temple Bat', type: 'bat', emoji: '🦇', x: 3700, y: 245, width: 34, height: 28, patrolMin: 3600, patrolMax: 3870, speed: 118, health: 1, damage: 8, shards: 3, flying: true },
  { id: 'statue-1', name: 'Cursed Statue', type: 'statue', emoji: '🗽', x: 4700, y: 318, width: 42, height: 42, patrolMin: 4630, patrolMax: 4860, speed: 56, health: 3, damage: 14, shards: 6 },
  { id: 'scarab-2', name: 'Scarab Swarm', type: 'scarab', emoji: '🐝', x: 5240, y: 334, width: 44, height: 26, patrolMin: 5140, patrolMax: 5410, speed: 130, health: 2, damage: 10, shards: 4 },
  { id: 'looter-2', name: 'Rival Looter', type: 'looter', emoji: '👤', x: 6330, y: 318, width: 34, height: 42, patrolMin: 6170, patrolMax: 6470, speed: 95, health: 2, damage: 12, shards: 4 },
  { id: 'guardian-2', name: 'Gate Guardian', type: 'guardian', emoji: '🗿', x: 7180, y: 318, width: 38, height: 42, patrolMin: 7060, patrolMax: 7350, speed: 78, health: 3, damage: 15, shards: 8 },
];

const RELIC_SHARDS = [
  310, 455, 620, 820, 980, 1240, 1430, 1660, 1840, 2020, 2265, 2440, 2600, 2835,
  3015, 3260, 3430, 3615, 3765, 3925, 4210, 4360, 4565, 4720, 4890, 5165, 5320,
  5490, 5660, 5835, 6060, 6220, 6400, 6610, 6780, 6965, 7130, 7280, 7425,
].map((x, index) => ({
  id: `shard-${index + 1}`,
  x,
  y: index % 5 === 0 ? 244 : index % 3 === 0 ? 284 : 320,
  hidden: [17, 18, 19, 24, 25, 36].includes(index + 1),
}));

const UPGRADES = [
  { id: 'reinforced-boots', name: 'Reinforced Boots', shortName: 'Boots', emoji: '🥾', x: 1160, y: 320, effect: 'Higher jump for temple ledges.' },
  { id: 'rope-launcher', name: 'Rope Launcher', shortName: 'Rope', emoji: '🪝', x: 2140, y: 232, effect: 'One extra mid-air jump to reach optional shelves.' },
  { id: 'torch-upgrade', name: 'Torch Upgrade', shortName: 'Torch', emoji: '🔦', x: 3345, y: 320, effect: 'Reveals darker catacomb routes.' },
  { id: 'historian-vision', name: 'Historian Vision', shortName: 'Vision', emoji: '👁️', x: 4620, y: 190, effect: 'Reveals hidden relic shard clusters.' },
  { id: 'ancient-compass', name: 'Ancient Compass', shortName: 'Compass', emoji: '🧭', x: 6675, y: 320, effect: 'Marks secret rooms near the dig-site entrance.' },
];

const CHECKPOINTS = [
  { id: 'desert-entry', name: 'Desert Entry', x: 80, y: 282 },
  { id: 'ruined-temple', name: 'Ruined Temple', x: 1560, y: 282 },
  { id: 'catacombs', name: 'Catacombs', x: 3220, y: 282 },
  { id: 'escape-sequence', name: 'Escape Sequence', x: 5120, y: 282 },
  { id: 'dig-site-entrance', name: 'Dig Site Entrance', x: 6600, y: 282 },
];

const ROUTE_GATES = [
  {
    id: 'desert-seal',
    name: 'Desert Map Seal',
    x: 1480,
    y: 86,
    width: 34,
    height: 274,
    message: 'Complete the desert approach before entering the ruined temple.',
    requires: {
      objective: 'desert-entry',
      miniBoss: 'scarab-queen',
      shards: 4,
    },
  },
  {
    id: 'temple-seal',
    name: 'Temple Route Seal',
    x: 3090,
    y: 86,
    width: 34,
    height: 274,
    message: 'Secure the temple route before entering the catacombs.',
    requires: {
      objective: 'ruined-temple',
      miniBoss: 'temple-guardian',
      shards: 8,
      upgrades: ['reinforced-boots'],
    },
  },
  {
    id: 'catacomb-seal',
    name: 'Catacomb Route Seal',
    x: 4985,
    y: 86,
    width: 34,
    height: 274,
    message: 'Light and survey the catacombs before the escape path opens.',
    requires: {
      objective: 'catacombs',
      miniBoss: 'giant-serpent',
      shards: 14,
      upgrades: ['torch-upgrade'],
    },
  },
  {
    id: 'escape-seal',
    name: 'Escape Route Seal',
    x: 6460,
    y: 86,
    width: 34,
    height: 274,
    message: 'Complete the escape route challenge before the dig-site entrance.',
    requires: {
      objective: 'escape-sequence',
      miniBoss: 'looter-captain',
      shards: 20,
    },
  },
  {
    id: 'basecamp-seal',
    name: 'Base Camp Survey Seal',
    x: 7405,
    y: 86,
    width: 34,
    height: 274,
    message: 'Collect enough route evidence before reporting to Base Camp.',
    requires: {
      objective: 'dig-site-entrance',
      miniBoss: 'ancient-construct',
      shards: 22,
      checkpoint: 'dig-site-entrance',
    },
  },
];

const HIDDEN_ROOMS = [
  { id: 'mural-cache', name: 'Mural Cache', x: 2220, y: 152, width: 260, height: 96, requiresUpgrade: 'rope-launcher' },
  { id: 'torch-alcove', name: 'Torch Alcove', x: 3560, y: 154, width: 420, height: 112, requiresUpgrade: 'torch-upgrade' },
  { id: 'relic-loft', name: 'Relic Loft', x: 4520, y: 154, width: 310, height: 110, requiresUpgrade: 'historian-vision' },
  { id: 'survey-perch', name: 'Survey Perch', x: 6910, y: 198, width: 310, height: 96, requiresUpgrade: 'ancient-compass' },
];

const LORE_TABLETS = [
  { id: 'tablet-1', x: 1900, y: 214, text: 'Tablet found: temple builders used side passages to protect the site.' },
  { id: 'tablet-2', x: 3840, y: 176, text: 'Tablet found: torchlight reveals careful records, not treasure maps.' },
  { id: 'tablet-3', x: 7040, y: 218, text: 'Tablet found: Base Camp lies beyond the last guardian path.' },
];

const SECTION_OBJECTIVES = {
  'desert-entry': {
    title: 'Recover the Lost Map Tablet',
    total: 1,
    itemLabel: 'map tablet',
  },
  'ruined-temple': {
    title: 'Activate 3 Ancient Switches',
    total: 3,
    itemLabel: 'switches',
  },
  catacombs: {
    title: 'Recover 3 Glyph Fragments',
    total: 3,
    itemLabel: 'glyph fragments',
  },
  'escape-sequence': {
    title: 'Escape Collapsing Ruins',
    total: 1,
    itemLabel: 'escape route',
  },
  'dig-site-entrance': {
    title: 'Defeat the Guardian and Unlock Base Camp',
    total: 1,
    itemLabel: 'guardian seal',
  },
};

const OBJECTIVE_MARKERS = [
  { id: 'map-tablet', sectionId: 'desert-entry', type: 'map-tablet', label: 'Map Tablet', x: 1185, y: 304, color: '#166534' },
  { id: 'switch-1', sectionId: 'ruined-temple', type: 'switch', label: 'Switch 1', x: 1765, y: 320, color: '#92400e' },
  { id: 'switch-2', sectionId: 'ruined-temple', type: 'switch', label: 'Switch 2', x: 2235, y: 320, color: '#92400e' },
  { id: 'switch-3', sectionId: 'ruined-temple', type: 'switch', label: 'Switch 3', x: 2765, y: 320, color: '#92400e' },
  { id: 'glyph-1', sectionId: 'catacombs', type: 'glyph', label: 'Glyph 1', x: 3445, y: 320, color: '#0f766e' },
  { id: 'glyph-2', sectionId: 'catacombs', type: 'glyph', label: 'Glyph 2', x: 3925, y: 320, color: '#0f766e' },
  { id: 'glyph-3', sectionId: 'catacombs', type: 'glyph', label: 'Glyph 3', x: 4565, y: 320, color: '#0f766e' },
  { id: 'escape-beacon', sectionId: 'escape-sequence', type: 'escape', label: 'Escape Marker', x: 6340, y: 320, color: '#b91c1c' },
];

const MINI_BOSSES = [
  { id: 'scarab-queen', sectionId: 'desert-entry', name: 'Scarab Queen', type: 'scarab', x: 1325, y: 318, width: 58, height: 42, patrolMin: 1250, patrolMax: 1430, speed: 66, health: 2, damage: 8, shards: 6, intro: 'Mini-boss: Scarab Queen guarding the desert map route.' },
  { id: 'temple-guardian', sectionId: 'ruined-temple', name: 'Stone Guardian', type: 'guardian', x: 2875, y: 306, width: 54, height: 54, patrolMin: 2760, patrolMax: 3040, speed: 58, health: 3, damage: 9, shards: 8, intro: 'Mini-boss: Stone Guardian awakened beside the temple seal.' },
  { id: 'giant-serpent', sectionId: 'catacombs', name: 'Giant Serpent', type: 'snake', x: 4750, y: 308, width: 72, height: 52, patrolMin: 4610, patrolMax: 4940, speed: 70, health: 3, damage: 9, shards: 8, intro: 'Mini-boss: Giant Serpent moving through the catacombs.' },
  { id: 'looter-captain', sectionId: 'escape-sequence', name: 'Rival Looter Captain', type: 'looter', x: 6230, y: 306, width: 54, height: 54, patrolMin: 6120, patrolMax: 6420, speed: 86, health: 3, damage: 9, shards: 8, intro: 'Mini-boss: Rival Looter Captain blocking the escape route.' },
  { id: 'ancient-construct', sectionId: 'dig-site-entrance', name: 'Ancient Construct', type: 'statue', x: 7250, y: 300, width: 62, height: 60, patrolMin: 7120, patrolMax: 7370, speed: 54, health: 3, damage: 10, shards: 10, intro: 'Final mini-boss: Ancient Construct guarding Base Camp.' },
];

const SECTION_ATMOSPHERES = {
  'desert-entry': {
    skyTop: '#ffda91',
    skyBottom: '#ffcc7d',
    haze: 'rgba(255, 243, 171, 0.25)',
    particle: 'sand',
    particleColor: 'rgba(255, 247, 212, 0.6)',
    fogColor: 'rgba(255, 248, 220, 0.2)',
    mood: 'sun-baked dunes, heat haze, ancient sand',
    title: 'The desert dunes stretch toward the lost temple.',
  },
  'ruined-temple': {
    skyTop: '#5c4d3c',
    skyBottom: '#8b6a47',
    haze: 'rgba(251, 191, 36, 0.15)',
    particle: 'embers',
    particleColor: 'rgba(251, 191, 36, 0.5)',
    fogColor: 'rgba(75, 50, 32, 0.22)',
    mood: 'flickering torches, shifting shadows, heavy stone',
    title: 'Deep within the temple, the stone begins to groan.',
  },
  'catacombs': {
    skyTop: '#111827',
    skyBottom: '#312e81',
    haze: 'rgba(129, 140, 248, 0.18)',
    particle: 'glyph motes',
    particleColor: 'rgba(165, 180, 252, 0.55)',
    fogColor: 'rgba(30, 27, 75, 0.3)',
    mood: 'pulsing glyphs, purple mist, forgotten depths',
    title: 'The catacombs reveal secrets written in light.',
  },
  'escape-sequence': {
    skyTop: '#7f1d1d',
    skyBottom: '#ef4444',
    haze: 'rgba(248, 113, 113, 0.25)',
    particle: 'dust and debris',
    particleColor: 'rgba(255, 228, 172, 0.65)',
    fogColor: 'rgba(153, 27, 27, 0.25)',
    mood: 'trembling ground, falling rubble, urgent heat',
    title: 'The ruins are collapsing! Find the exit now!',
  },
  'dig-site-entrance': {
    skyTop: '#064e3b',
    skyBottom: '#065f46',
    haze: 'rgba(167, 243, 208, 0.2)',
    particle: 'fireflies',
    particleColor: 'rgba(209, 250, 229, 0.6)',
    fogColor: 'rgba(6, 78, 59, 0.18)',
    mood: 'safe encampment, golden light, the site awaits',
    title: 'Base Camp is in sight. You have reached the dig.',
  },
};

const STORY_PROPS = [
  { id: 'distant-ruins', sectionId: 'desert-entry', type: 'ruins', x: 210, y: 236, label: 'distant ruins' },
  { id: 'abandoned-camp', sectionId: 'desert-entry', type: 'camp', x: 970, y: 312, label: 'abandoned survey camp' },
  { id: 'temple-door', sectionId: 'ruined-temple', type: 'door', x: 1518, y: 196, label: 'massive temple doors' },
  { id: 'broken-statue', sectionId: 'ruined-temple', type: 'statue', x: 2380, y: 280, label: 'broken guardian statue' },
  { id: 'mural-wall', sectionId: 'ruined-temple', type: 'mural', x: 2640, y: 228, label: 'ancient mural' },
  { id: 'glowing-eyes', sectionId: 'catacombs', type: 'eyes', x: 3705, y: 190, label: 'hidden eyes' },
  { id: 'glyph-wall', sectionId: 'catacombs', type: 'glyphs', x: 4250, y: 230, label: 'glowing glyph wall' },
  { id: 'cracked-bridge', sectionId: 'escape-sequence', type: 'bridge', x: 5480, y: 300, label: 'collapsing bridge' },
  { id: 'warning-sign', sectionId: 'escape-sequence', type: 'sign', x: 6030, y: 306, label: 'warning marker' },
  { id: 'camp-lights', sectionId: 'dig-site-entrance', type: 'lights', x: 6700, y: 268, label: 'excavation lights' },
  { id: 'base-banners', sectionId: 'dig-site-entrance', type: 'banners', x: 7310, y: 244, label: 'base camp banners' },
];

const ENVIRONMENT_EVENTS = [
  { id: 'sand-gust', sectionId: 'desert-entry', x: 520, name: 'Sand Gust', message: 'A sheet of sand sweeps across the entry route.', type: 'gust', duration: 2.4, shake: 0.4 },
  { id: 'temple-doors', sectionId: 'ruined-temple', x: 1530, name: 'Temple Doors', message: 'Ancient doors groan open as the team enters.', type: 'doors', duration: 3.2, shake: 0.7 },
  { id: 'torch-descent', sectionId: 'catacombs', x: 3240, name: 'Torch-lit Descent', message: 'Blue glyph light flickers deeper underground.', type: 'glyphs', duration: 3.4, shake: 0.35 },
  { id: 'cave-in', sectionId: 'escape-sequence', x: 5240, name: 'Cave-in Escape', message: 'Rubble falls behind you. Keep moving.', type: 'collapse', duration: 3.6, shake: 1.1 },
  { id: 'camp-overlook', sectionId: 'dig-site-entrance', x: 6680, name: 'Camp Overlook', message: 'Excavation lights appear beyond the final rise.', type: 'arrival', duration: 3.2, shake: 0.25 },
];

const BOSS_INTROS = {
  'scarab-queen': {
    title: 'Sand Eruption',
    message: 'A giant scarab bursts from the dunes.',
    effect: 'sand burst',
  },
  'temple-guardian': {
    title: 'Statue Awakens',
    message: 'Stone eyes flare as the guardian steps down.',
    effect: 'torch flare',
  },
  'giant-serpent': {
    title: 'Wall Break',
    message: 'A serpent crashes through the catacomb wall.',
    effect: 'glyph shock',
  },
  'looter-captain': {
    title: 'Rival Ambush',
    message: 'A rival captain blocks the escape path.',
    effect: 'dust standoff',
  },
  'ancient-construct': {
    title: 'Final Guardian',
    message: 'The ancient construct powers on before Base Camp.',
    effect: 'camp light surge',
  },
};

const GATE = { x: 7480, y: 282, width: 56, height: 78 };

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const rectsOverlap = (a, b) => (
  a.x < b.x + b.width
  && a.x + a.width > b.x
  && a.y < b.y + b.height
  && a.y + a.height > b.y
);

const getSectionForX = (x) => (
  SECTIONS.find((section) => x >= section.start && x < section.end) || SECTIONS[SECTIONS.length - 1]
);

const makeEnemy = (enemy) => ({
  ...enemy,
  direction: 1,
  maxHealth: enemy.health,
  defeated: false,
  stunTimer: 0,
  hitFlash: 0,
});

const makeMiniBoss = (boss) => ({
  ...boss,
  direction: 1,
  maxHealth: boss.health,
  defeated: false,
  awakened: false,
  stunTimer: 0,
  hitFlash: 0,
});

const makeInitialState = () => ({
  player: {
    x: 44,
    y: GROUND_Y - PLAYER_HEIGHT,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    direction: 1,
    onGround: true,
    airJumpsUsed: 0,
    invulnerable: 0,
  },
  fieldKit: [],
  collectedToolIds: new Set(),
  collectedShardIds: new Set(),
  relicShardCount: 0,
  collectedUpgrades: new Set(),
  collectedTabletIds: new Set(),
  collectedObjectiveIds: new Set(),
  enemies: ENEMIES.map(makeEnemy),
  miniBosses: MINI_BOSSES.map(makeMiniBoss),
  defeatedEnemies: new Set(),
  defeatedMiniBosses: new Set(),
  hiddenRoomsFound: new Set(),
  openedRouteGateIds: new Set(),
  completedObjectiveIds: new Set(),
  triggeredEnvironmentEventIds: new Set(),
  cinematicEvent: null,
  cinematicTimer: 0,
  bossIntro: null,
  bossIntroTimer: 0,
  environmentEvent: null,
  environmentEventTimer: 0,
  sectionTransition: {
    id: 'desert-entry',
    name: SECTIONS[0].name,
    message: SECTION_ATMOSPHERES[SECTIONS[0].id].title,
  },
  sectionTransitionTimer: 2.6,
  cameraShakeTimer: 0,
  cameraShakeStrength: 0,
  lastSectionId: SECTIONS[0].id,
  activeCheckpoint: CHECKPOINTS[0],
  resources: {
    stamina: 100,
    time: 900,
  },
  notice: INITIAL_JOURNEY_NOTICE,
  hazardCooldown: 0,
  enemyCooldown: 0,
  attackCooldown: 0,
  attackTimer: 0,
  attackQueued: false,
  attackHitIds: new Set(),
  routeGateCooldown: 0,
  timeAccumulator: 0,
  failed: false,
  failureReason: '',
  completed: false,
});

function ExpeditionJourney({ mission, onBackToMenu, onComplete, onSnapshotChange, audioControls }) {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const stateRef = useRef(makeInitialState());
  const lastFrameRef = useRef(0);
  const animationRef = useRef(0);
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [hud, setHud] = useState(() => ({
    fieldKit: [],
    resources: { stamina: 100, time: 900 },
    notice: INITIAL_JOURNEY_NOTICE,
    failed: false,
    failureReason: '',
    relicShardCount: 0,
    collectedUpgrades: [],
    activeCheckpoint: CHECKPOINTS[0].name,
    journeySection: SECTIONS[0].name,
    currentObjective: SECTION_OBJECTIVES[SECTIONS[0].id].title,
    objectiveProgress: { found: 0, required: SECTION_OBJECTIVES[SECTIONS[0].id].total, label: '0/1 map tablet' },
    defeatedEnemies: 0,
    defeatedMiniBosses: 0,
    hiddenRoomsFound: 0,
    loreTabletCount: 0,
    activeMiniBoss: null,
    cinematicEventState: null,
    cinematicState: null,
    bossIntroState: null,
    environmentEventState: null,
    sectionTransitionState: {
      id: 'desert-entry',
      name: SECTIONS[0].name,
      message: SECTION_ATMOSPHERES[SECTIONS[0].id].title,
      timeRemaining: 2.6,
    },
    activeParticles: SECTION_ATMOSPHERES[SECTIONS[0].id].particle,
    activeAtmosphere: SECTION_ATMOSPHERES[SECTIONS[0].id],
    secretObjectiveProgress: null,
    routeGateStatus: null,
    enemyWarning: '',
  }));

  const getObjectiveProgress = useCallback((sectionId, current = stateRef.current) => {
    const objective = SECTION_OBJECTIVES[sectionId] || SECTION_OBJECTIVES[SECTIONS[0].id];
    let found = 0;
    if (sectionId === 'desert-entry') {
      found = current.collectedObjectiveIds.has('map-tablet') ? 1 : 0;
    } else if (sectionId === 'ruined-temple') {
      found = ['switch-1', 'switch-2', 'switch-3'].filter((id) => current.collectedObjectiveIds.has(id)).length;
    } else if (sectionId === 'catacombs') {
      found = ['glyph-1', 'glyph-2', 'glyph-3'].filter((id) => current.collectedObjectiveIds.has(id)).length;
    } else if (sectionId === 'escape-sequence') {
      found = current.completedObjectiveIds.has('escape-sequence') ? 1 : 0;
    } else if (sectionId === 'dig-site-entrance') {
      found = current.defeatedMiniBosses.has('ancient-construct') ? 1 : 0;
    }

    return {
      id: sectionId,
      title: objective.title,
      found,
      required: objective.total,
      complete: found >= objective.total,
      label: `${found}/${objective.total} ${objective.itemLabel}`,
    };
  }, []);

  const getActiveMiniBoss = useCallback((current = stateRef.current) => (
    current.miniBosses
      .filter((boss) => !boss.defeated)
      .sort((a, b) => Math.abs(a.x - current.player.x) - Math.abs(b.x - current.player.x))
      .find((boss) => Math.abs(boss.x - current.player.x) < 560) || null
  ), []);

  const getSecretObjectiveProgress = useCallback((current = stateRef.current) => ({
    relicShards: { found: current.collectedShardIds.size, required: RELIC_SHARDS.length },
    loreTablets: { found: current.collectedTabletIds.size, required: LORE_TABLETS.length },
    hiddenRooms: { found: current.hiddenRoomsFound.size, required: HIDDEN_ROOMS.length },
    miniBosses: { found: current.defeatedMiniBosses.size, required: MINI_BOSSES.length },
  }), []);

  const getCinematicEventState = useCallback((current = stateRef.current) => {
    if (!current.cinematicEvent) return null;
    return {
      ...current.cinematicEvent,
      timeRemaining: Number(current.cinematicTimer.toFixed(1)),
    };
  }, []);

  const getActiveAtmosphere = useCallback((current = stateRef.current) => {
    const section = getSectionForX(current.player.x);
    const atmosphere = SECTION_ATMOSPHERES[section.id] || SECTION_ATMOSPHERES[SECTIONS[0].id];
    return {
      sectionId: section.id,
      sectionName: section.name,
      particle: atmosphere.particle,
      mood: atmosphere.mood,
      title: atmosphere.title,
    };
  }, []);

  const getBossIntroState = useCallback((current = stateRef.current) => {
    if (!current.bossIntro) return null;
    return {
      ...current.bossIntro,
      timeRemaining: Number(current.bossIntroTimer.toFixed(1)),
    };
  }, []);

  const getEnvironmentEventState = useCallback((current = stateRef.current) => {
    if (!current.environmentEvent) return null;
    return {
      ...current.environmentEvent,
      timeRemaining: Number(current.environmentEventTimer.toFixed(1)),
    };
  }, []);

  const getSectionTransitionState = useCallback((current = stateRef.current) => {
    if (!current.sectionTransition) return null;
    return {
      ...current.sectionTransition,
      timeRemaining: Number(current.sectionTransitionTimer.toFixed(1)),
    };
  }, []);

  const getGateRequirements = useCallback((gate, current = stateRef.current) => {
    if (!gate) return [];
    const requirements = [];
    const requires = gate.requires;
    if (requires.objective) {
      const objective = getObjectiveProgress(requires.objective, current);
      requirements.push({
        label: objective.title,
        met: objective.complete,
      });
    }
    if (requires.miniBoss) {
      const boss = MINI_BOSSES.find((item) => item.id === requires.miniBoss);
      requirements.push({
        label: `${boss?.name || requires.miniBoss} defeated`,
        met: current.defeatedMiniBosses.has(requires.miniBoss),
      });
    }
    if (requires.shards) {
      requirements.push({
        label: `${requires.shards} relic shards`,
        met: current.relicShardCount >= requires.shards,
      });
    }
    if (requires.defeatedEnemies) {
      requirements.push({
        label: `${requires.defeatedEnemies} ${requires.defeatedEnemies === 1 ? 'enemy' : 'enemies'} defeated`,
        met: current.defeatedEnemies.size >= requires.defeatedEnemies,
      });
    }
    if (requires.tools) {
      requirements.push({
        label: `${requires.tools} field tools packed`,
        met: current.fieldKit.length >= requires.tools,
      });
    }
    if (requires.checkpoint) {
      const checkpoint = CHECKPOINTS.find((item) => item.id === requires.checkpoint);
      requirements.push({
        label: `${checkpoint?.name || requires.checkpoint} checkpoint`,
        met: current.activeCheckpoint.id === requires.checkpoint,
      });
    }
    (requires.upgrades || []).forEach((upgradeId) => {
      const upgrade = UPGRADES.find((item) => item.id === upgradeId);
      requirements.push({
        label: upgrade?.name || upgradeId,
        met: current.collectedUpgrades.has(upgradeId),
      });
    });
    return requirements;
  }, [getObjectiveProgress]);

  const getNextRouteGateStatus = useCallback((current = stateRef.current) => {
    const nextGate = ROUTE_GATES.find((gate) => !current.openedRouteGateIds.has(gate.id));
    if (!nextGate) return null;
    const requirements = getGateRequirements(nextGate, current);
    const metCount = requirements.filter((requirement) => requirement.met).length;
    return {
      id: nextGate.id,
      name: nextGate.name,
      distance: Math.max(0, Math.round(nextGate.x - current.player.x)),
      requirements,
      complete: metCount === requirements.length,
      summary: `${metCount}/${requirements.length} ready`,
    };
  }, [getGateRequirements]);

  const makeSnapshot = useCallback(() => {
    const current = stateRef.current;
    const player = current.player;
    const section = getSectionForX(player.x);
    const objectiveProgress = getObjectiveProgress(section.id, current);
    const activeMiniBoss = getActiveMiniBoss(current);
    const activeAtmosphere = getActiveAtmosphere(current);
    const cinematicState = getCinematicEventState(current);
    const bossIntroState = getBossIntroState(current);
    const environmentEventState = getEnvironmentEventState(current);
    const sectionTransitionState = getSectionTransitionState(current);
    const nearbyEnemies = current.enemies
      .filter((enemy) => !enemy.defeated && Math.abs(enemy.x - player.x) < 420)
      .map((enemy) => ({
        id: enemy.id,
        name: enemy.name,
        x: Math.round(enemy.x),
        y: Math.round(enemy.y),
        health: enemy.health,
        stunned: enemy.stunTimer > 0,
      }));

    return {
      stage: 'journey',
      coordinateSystem: 'origin top-left, x right, y down',
      player: {
        x: Math.round(player.x),
        y: Math.round(player.y),
        vx: Math.round(player.vx),
        vy: Math.round(player.vy),
        onGround: player.onGround,
      },
      journeySection: section.name,
      worldProgressPercent: Math.round((player.x / (WORLD_WIDTH - PLAYER_WIDTH)) * 100),
      resources: { ...current.resources },
      fieldKit: [...current.fieldKit],
      remainingTools: JOURNEY_TOOLS
        .filter((tool) => !current.collectedToolIds.has(tool.id))
        .map((tool) => tool.name),
      relicShardCount: current.relicShardCount,
      totalRelicShards: RELIC_SHARDS.length,
      collectedUpgrades: [...current.collectedUpgrades],
      activeCheckpoint: current.activeCheckpoint.name,
      checkpointState: {
        id: current.activeCheckpoint.id,
        name: current.activeCheckpoint.name,
      },
      currentObjective: objectiveProgress.title,
      objectiveProgress,
      miniBossState: current.miniBosses.map((boss) => ({
        id: boss.id,
        name: boss.name,
        sectionId: boss.sectionId,
        health: boss.health,
        maxHealth: boss.maxHealth,
        defeated: boss.defeated,
        awakened: boss.awakened,
        x: Math.round(boss.x),
      })),
      activeMiniBoss: activeMiniBoss ? {
        id: activeMiniBoss.id,
        name: activeMiniBoss.name,
        health: activeMiniBoss.health,
        maxHealth: activeMiniBoss.maxHealth,
        defeated: activeMiniBoss.defeated,
        awakened: activeMiniBoss.awakened,
      } : null,
      defeatedEnemies: [...current.defeatedEnemies],
      defeatedMiniBosses: [...current.defeatedMiniBosses],
      hiddenRoomsFound: [...current.hiddenRoomsFound],
      loreTabletCount: current.collectedTabletIds.size,
      secretObjectiveProgress: getSecretObjectiveProgress(current),
      cinematicEventState: cinematicState,
      cinematicState,
      bossIntroState,
      environmentEventState,
      sectionTransitionState,
      activeParticles: activeAtmosphere.particle,
      activeAtmosphere,
      routeGateStatus: getNextRouteGateStatus(current),
      playerCombatState: {
        attacking: current.attackTimer > 0,
        attackCooldown: Number(current.attackCooldown.toFixed(2)),
        invulnerable: Number(player.invulnerable.toFixed(2)),
      },
      enemyStates: nearbyEnemies,
      hazards: HAZARDS.map((hazard) => hazard.name),
      endGateReached: current.completed,
      briefingOpen,
      failed: current.failed,
      failureReason: current.failureReason,
      notice: current.notice,
    };
  }, [briefingOpen, getActiveAtmosphere, getActiveMiniBoss, getBossIntroState, getCinematicEventState, getEnvironmentEventState, getNextRouteGateStatus, getObjectiveProgress, getSecretObjectiveProgress, getSectionTransitionState]);

  const syncHud = useCallback(() => {
    const current = stateRef.current;
    const section = getSectionForX(current.player.x);
    const objectiveProgress = getObjectiveProgress(section.id, current);
    const activeMiniBoss = getActiveMiniBoss(current);
    const activeAtmosphere = getActiveAtmosphere(current);
    const cinematicState = getCinematicEventState(current);
    const enemyWarning = current.enemies
      .filter((enemy) => !enemy.defeated)
      .sort((a, b) => Math.abs(a.x - current.player.x) - Math.abs(b.x - current.player.x))[0];
    setHud({
      fieldKit: [...current.fieldKit],
      resources: { ...current.resources },
      notice: current.notice,
      failed: current.failed,
      failureReason: current.failureReason,
      relicShardCount: current.relicShardCount,
      collectedUpgrades: [...current.collectedUpgrades],
      activeCheckpoint: current.activeCheckpoint.name,
      journeySection: section.name,
      currentObjective: objectiveProgress.title,
      objectiveProgress,
      defeatedEnemies: current.defeatedEnemies.size,
      defeatedMiniBosses: current.defeatedMiniBosses.size,
      hiddenRoomsFound: current.hiddenRoomsFound.size,
      loreTabletCount: current.collectedTabletIds.size,
      activeMiniBoss: activeMiniBoss ? {
        id: activeMiniBoss.id,
        name: activeMiniBoss.name,
        health: activeMiniBoss.health,
        maxHealth: activeMiniBoss.maxHealth,
      } : null,
      cinematicEventState: cinematicState,
      cinematicState,
      bossIntroState: getBossIntroState(current),
      environmentEventState: getEnvironmentEventState(current),
      sectionTransitionState: getSectionTransitionState(current),
      activeParticles: activeAtmosphere.particle,
      activeAtmosphere,
      secretObjectiveProgress: getSecretObjectiveProgress(current),
      routeGateStatus: getNextRouteGateStatus(current),
      enemyWarning: enemyWarning && Math.abs(enemyWarning.x - current.player.x) < 520
        ? `${enemyWarning.name} nearby`
        : '',
    });
    onSnapshotChange?.(makeSnapshot());
  }, [getActiveAtmosphere, getActiveMiniBoss, getBossIntroState, getCinematicEventState, getEnvironmentEventState, getNextRouteGateStatus, getObjectiveProgress, getSecretObjectiveProgress, getSectionTransitionState, makeSnapshot, onSnapshotChange]);

  const restartJourney = useCallback(() => {
    stateRef.current = makeInitialState();
    keysRef.current = {};
    setBriefingOpen(true);
    syncHud();
  }, [syncHud]);

  const triggerJourneyRescue = useCallback((reason) => {
    const current = stateRef.current;
    if (current.failed || current.completed) return;
    current.failed = true;
    current.failureReason = reason;
    current.notice = reason;
    keysRef.current = {};
    audioControls?.playError?.();
    syncHud();
  }, [audioControls, syncHud]);

  const respawnAtCheckpoint = useCallback((message) => {
    const current = stateRef.current;
    const checkpoint = current.activeCheckpoint;
    current.player.x = checkpoint.x + 22;
    current.player.y = GROUND_Y - PLAYER_HEIGHT;
    current.player.vx = 0;
    current.player.vy = 0;
    current.player.onGround = true;
    current.player.airJumpsUsed = 0;
    current.player.invulnerable = INVULNERABLE_DURATION;
    current.resources.stamina = Math.max(25, current.resources.stamina - 8);
    current.notice = message || `Returned to ${checkpoint.name}. Stamina restored enough to keep going.`;
    audioControls?.playError?.();
    if (current.resources.stamina <= 0) {
      triggerJourneyRescue('Field rescue needed: stamina reached zero. Restart the journey and use checkpoints carefully.');
    }
  }, [audioControls, triggerJourneyRescue]);

  const drawFieldNoteLabel = useCallback((ctx, x, y, text, color) => {
    ctx.save();
    ctx.font = '900 11px Cinzel, serif';
    const textWidth = ctx.measureText(text.toUpperCase()).width;
    const padding = 8;
    const w = textWidth + padding * 2;
    const h = 20;
    const r = 3;
    const lx = x - w / 2;
    const ly = y - h / 2;

    // Premium shadowed placard
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(lx, ly, w, h, r);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text.toUpperCase(), x, y + 4);
    ctx.restore();
  }, []);

  const drawPlatform = useCallback((ctx, platform, cameraX, current) => {
    if (platform.requiresUpgrade && !current.collectedUpgrades.has(platform.requiresUpgrade)) {
      if (!platform.secret) return;
      ctx.globalAlpha = 0.16;
    }
    const x = platform.x - cameraX;
    
    // Physical stone texture
    ctx.fillStyle = platform.secret ? '#7f643f' : platform.y === GROUND_Y ? '#b5865a' : '#6f5b45';
    ctx.fillRect(x, platform.y, platform.width, platform.height);
    
    // Top light edge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(x, platform.y, platform.width, 6);
    
    // Subtle cracks
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 1;
    for (let i = 25; i < platform.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(x + i, platform.y);
      ctx.lineTo(x + i + 4, platform.y + platform.height);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(37, 25, 14, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, platform.y, platform.width, platform.height);
    ctx.globalAlpha = 1;
  }, []);

  const drawCollectible = useCallback((ctx, x, y, cameraX, now, label, color, hidden = false, isShard = false) => {
    const screenX = x - cameraX;
    const floatY = Math.sin((now / 220) + x) * 8;
    ctx.save();
    ctx.globalAlpha = hidden ? 0.35 : 1;
    
    // Core glow
    const innerGlow = ctx.createRadialGradient(screenX, y + floatY, 0, screenX, y + floatY, 20);
    innerGlow.addColorStop(0, `${color}66`);
    innerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(screenX, y + floatY, 20, 0, Math.PI * 2);
    ctx.fill();

    if (isShard) {
      // Shimmer effect
      const shimmer = Math.sin(now / 150) * 0.2 + 0.8;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15 * shimmer;
      
      // Shard geometry (crystal fragment)
      ctx.fillStyle = '#fff9e5';
      ctx.beginPath();
      ctx.moveTo(screenX, y + floatY - 14);
      ctx.lineTo(screenX + 9, y + floatY - 4);
      ctx.lineTo(screenX + 6, y + floatY + 14);
      ctx.lineTo(screenX - 8, y + floatY + 8);
      ctx.lineTo(screenX - 10, y + floatY - 6);
      ctx.closePath();
      ctx.fill();

      // Highlights
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(screenX - 4, y + floatY - 8);
      ctx.lineTo(screenX, y + floatY - 12);
      ctx.stroke();
    } else {
      // Tool/Upgrade Placard
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#fffcf0';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      const r = 18;
      ctx.beginPath();
      ctx.roundRect(screenX - r, y + floatY - r, r * 2, r * 2, 6);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1e293b';
      ctx.font = '800 17px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, screenX, y + floatY + 6);
    }
    
    ctx.restore();
  }, []);

  const drawPlayerCharacter = useCallback((ctx, x, y, width, height, direction, invulnerable, now) => {
    ctx.save();
    
    const flicker = invulnerable > 0 && Math.floor(now / 80) % 2 === 0;
    if (flicker) ctx.globalAlpha = 0.4;

    // Body silhouette
    ctx.fillStyle = '#b45309'; // Tan/Brown jacket
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 10, width - 16, height - 12, 4);
    ctx.fill();

    // Backpack
    ctx.fillStyle = '#451a03';
    ctx.fillRect(direction >= 0 ? x + 4 : x + width - 12, y + 12, 8, 20);

    // Head
    ctx.fillStyle = '#fde68a'; // Skin tone
    ctx.beginPath();
    ctx.arc(x + width / 2, y + 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // Fedora Hat
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 4, y - 4, width - 8, 4); // Brim
    ctx.fillRect(x + 10, y - 12, width - 20, 8); // Crown

    // Tool/Flashlight
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    const handX = direction >= 0 ? x + width - 4 : x + 4;
    ctx.beginPath();
    ctx.moveTo(handX, y + 24);
    ctx.lineTo(handX + (direction * 12), y + 24);
    ctx.stroke();

    // Flashlight beam (subtle)
    const beamGrad = ctx.createLinearGradient(handX, y + 24, handX + (direction * 40), y + 24);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.3)');
    beamGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(handX, y + 24);
    ctx.lineTo(handX + (direction * 50), y + 8);
    ctx.lineTo(handX + (direction * 50), y + 40);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }, []);

  const drawStoryProp = useCallback((ctx, prop, cameraX, now) => {
    const x = prop.x - cameraX;
    if (x < -140 || x > CANVAS_WIDTH + 140) return;
    ctx.save();
    
    if (prop.type === 'ruins') {
      ctx.fillStyle = 'rgba(116, 70, 33, 0.4)';
      ctx.strokeStyle = 'rgba(62, 45, 29, 0.6)';
      ctx.lineWidth = 2;
      // Pillar base
      ctx.fillRect(x - 30, prop.y + 10, 60, 80);
      ctx.strokeRect(x - 30, prop.y + 10, 60, 80);
      // Top cap
      ctx.fillRect(x - 40, prop.y - 10, 80, 20);
      ctx.strokeRect(x - 40, prop.y - 10, 80, 20);
    } else if (prop.type === 'camp') {
      // Tent
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.moveTo(x - 50, prop.y + 60);
      ctx.lineTo(x, prop.y);
      ctx.lineTo(x + 50, prop.y + 60);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();
      // Campfire
      const fireGlow = Math.abs(Math.sin(now / 150)) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(249, 115, 22, ${0.4 * fireGlow})`;
      ctx.beginPath();
      ctx.arc(x + 20, prop.y + 60, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(x + 10, prop.y + 55, 20, 5);
    } else if (prop.type === 'door') {
      ctx.fillStyle = '#4b3a2c';
      ctx.fillRect(x - 40, prop.y, 80, 140);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 4;
      ctx.strokeRect(x - 32, prop.y + 10, 64, 120);
      // Door glyphs
      ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.font = '12px serif';
      ctx.fillText('𓀀𓀁𓀂', x - 20, prop.y + 50);
    } else if (prop.type === 'statue') {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x - 25, prop.y, 50, 100);
      ctx.fillStyle = '#475569';
      ctx.fillRect(x - 35, prop.y + 80, 70, 20);
      // Glowing eyes
      const eyeGlow = Math.abs(Math.sin(now / 400)) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(239, 68, 68, ${eyeGlow})`;
      ctx.beginPath(); ctx.arc(x - 10, prop.y + 25, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 10, prop.y + 25, 3, 0, Math.PI * 2); ctx.fill();
    } else if (prop.type === 'glyphs') {
      ctx.fillStyle = 'rgba(96, 165, 250, 0.15)';
      ctx.beginPath();
      ctx.roundRect(x - 80, prop.y - 40, 160, 80, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
      ctx.stroke();
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 24px serif';
      ctx.textAlign = 'center';
      const symbols = ['𓋹', '𓅃', '𓃻', '𓇳'];
      symbols.forEach((s, i) => {
        const offset = (i - 1.5) * 35;
        const bounce = Math.sin(now / 300 + i) * 6;
        ctx.fillText(s, x + offset, prop.y + bounce);
      });
    } else if (prop.type === 'lights') {
      // Industrial floodlight
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 5, prop.y + 20, 10, 60);
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(x, prop.y + 20, 15, 0, Math.PI * 2);
      ctx.fill();
      // Beam
      const beamGrad = ctx.createRadialGradient(x, prop.y + 20, 5, x, prop.y + 20, 120);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.arc(x, prop.y + 20, 120, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }, []);

  const drawParticles = useCallback((ctx, atmosphere, cameraX, now) => {
    ctx.save();
    ctx.fillStyle = atmosphere.particleColor;
    const count = atmosphere.particle === 'dust and debris' ? 45 : 34;
    for (let i = 0; i < count; i += 1) {
      const speedMult = atmosphere.particle === 'dust and debris' ? 2.5 : 1;
      const drift = (now / (35 / speedMult)) % 2000;
      const x = ((i * 137 + drift + cameraX * 0.1) % (CANVAS_WIDTH + 100)) - 50;
      const yBase = atmosphere.particle === 'glyph motes' ? 120 : atmosphere.particle === 'fireflies' ? 150 : 60;
      const yRange = atmosphere.particle === 'dust and debris' ? 300 : 200;
      const y = yBase + ((i * 71 + Math.sin(now / 500 + i) * 30) % yRange);
      
      if (atmosphere.particle === 'glyph motes') {
        ctx.globalAlpha = 0.35;
        ctx.font = 'bold 10px serif';
        ctx.fillText(['𓋹', '𓊽', '𓃻', '𓇳'][i % 4], x, y);
      } else {
        const size = atmosphere.particle === 'dust and debris' ? 2 + (i % 4) : 1.5 + (i % 2);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const current = stateRef.current;
    const player = current.player;
    const now = Date.now();
    const section = getSectionForX(player.x);
    const atmosphere = SECTION_ATMOSPHERES[section.id] || SECTION_ATMOSPHERES[SECTIONS[0].id];
    const focusX = current.bossIntroTimer > 0 && current.bossIntro?.focusX
      ? current.bossIntro.focusX * 0.72 + player.x * 0.28
      : player.x;
    const shake = current.cameraShakeTimer > 0
      ? Math.sin(now / 28) * current.cameraShakeStrength * 7
      : 0;
    const cameraX = clamp(focusX - 260 + shake, 0, WORLD_WIDTH - CANVAS_WIDTH);

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGradient.addColorStop(0, atmosphere.skyTop);
    skyGradient.addColorStop(1, atmosphere.skyBottom);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = atmosphere.haze;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = section.id === 'catacombs' ? 'rgba(0, 0, 0, 0.28)' : 'rgba(112, 73, 42, 0.16)';
    for (let hill = -160; hill < WORLD_WIDTH; hill += 240) {
      ctx.beginPath();
      ctx.ellipse(hill - cameraX * 0.34, 355, 180, 45, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = section.id === 'dig-site-entrance' ? 'rgba(34, 84, 61, 0.18)' : 'rgba(53, 40, 30, 0.14)';
    for (let ridge = -260; ridge < WORLD_WIDTH; ridge += 360) {
      ctx.beginPath();
      ctx.ellipse(ridge - cameraX * 0.18, 242, 220, 58, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    SECTIONS.forEach((area) => {
      if (area.end < cameraX || area.start > cameraX + CANVAS_WIDTH) return;
      ctx.fillStyle = area.id === section.id ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(area.start - cameraX, 0, area.end - area.start, CANVAS_HEIGHT);
    });

    // Platforms
    PLATFORMS.forEach((platform) => {
      const px = platform.x - cameraX;
      
      // Stony foundation style
      ctx.fillStyle = platform.y === GROUND_Y ? '#b5865a' : '#968471';
      ctx.fillRect(px, platform.y, platform.width, platform.height);
      
      // Highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(px, platform.y, platform.width, 4);
      
      // Cracks / texture for stone ledges
      if (platform.y !== GROUND_Y) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 20; i < platform.width; i += 40) {
          ctx.beginPath();
          ctx.moveTo(px + i, platform.y);
          ctx.lineTo(px + i, platform.y + platform.height);
          ctx.stroke();
        }
      }

      ctx.strokeStyle = 'rgba(50, 30, 10, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px, platform.y, platform.width, platform.height);
    });

    // --- Background Layers (Parallax) ---
    const drawParallax = (depth, color, heightMult) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT);
      for (let i = 0; i <= CANVAS_WIDTH; i += 40) {
        const worldX = i + cameraX * depth;
        const y = CANVAS_HEIGHT - 60 - heightMult * (20 + Math.sin(worldX * 0.002) * 30 + Math.cos(worldX * 0.005) * 15);
        ctx.lineTo(i, y);
      }
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fill();
    };
    
    drawParallax(0.08, `${atmosphere.skyBottom}66`, 1.3); // Far
    drawParallax(0.18, `${atmosphere.skyBottom}99`, 0.9); // Mid
    drawParallax(0.28, `${atmosphere.skyBottom}cc`, 0.5); // Close

    // --- Ground & Atmosphere ---
    ctx.fillStyle = atmosphere.haze;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    STORY_PROPS.forEach((prop) => drawStoryProp(ctx, prop, cameraX, now));
    drawParticles(ctx, atmosphere, cameraX, now);

    // --- Environment Events ---
    if (current.environmentEvent) {
      ctx.save();
      const alpha = Math.min(1, current.environmentEventTimer / 60);
      if (current.environmentEvent.type === 'collapse') {
        ctx.fillStyle = `rgba(127, 29, 29, ${0.12 * alpha})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // Falling dust chunks
        ctx.fillStyle = 'rgba(76, 45, 28, 0.5)';
        for (let i = 0; i < 15; i += 1) {
          const rx = (i * 123 + now / 8) % CANVAS_WIDTH;
          const ry = (i * 67 + now / 5) % CANVAS_HEIGHT;
          ctx.fillRect(rx, ry, 6, 6);
        }
      }
      ctx.restore();
    }

    // --- Hidden Rooms (Markers) ---
    HIDDEN_ROOMS.forEach((room) => {
      const visible = current.collectedUpgrades.has(room.requiresUpgrade);
      if (!visible && room.requiresUpgrade !== 'ancient-compass') return;
      if (room.x + room.width < cameraX || room.x > cameraX + CANVAS_WIDTH) return;
      
      const rx = room.x - cameraX;
      ctx.save();
      ctx.globalAlpha = visible ? 0.25 : 0.08;
      ctx.fillStyle = '#f5d56e';
      ctx.fillRect(rx, room.y, room.width, room.height);
      ctx.strokeStyle = '#f5d56e';
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(rx, room.y, room.width, room.height);
      ctx.restore();
    });

    // --- World Elements (Platforms, Hazards, Units) ---
    PLATFORMS.forEach((platform) => drawPlatform(ctx, platform, cameraX, current));

    // Hazards
    HAZARDS.forEach((hazard) => {
      const hx = hazard.x - cameraX;
      if (hx + hazard.width < -50 || hx > CANVAS_WIDTH + 50) return;
      
      // Shadow & Emoji
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.font = '34px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(hazard.emoji, hx + hazard.width / 2, hazard.y + hazard.height / 2 + 10);
      ctx.restore();

      // Field Note Label
      drawFieldNoteLabel(ctx, hx + hazard.width / 2, hazard.y - 12, hazard.name, '#7f1d1d');
    });

    // Checkpoints
    CHECKPOINTS.forEach((checkpoint) => {
      const cx = checkpoint.x - cameraX;
      if (cx < -80 || cx > CANVAS_WIDTH + 80) return;
      const active = current.activeCheckpoint.id === checkpoint.id;
      
      ctx.save();
      // Flagpole
      ctx.fillStyle = active ? '#166534' : '#451a03';
      ctx.fillRect(cx - 2, checkpoint.y, 4, 80);
      
      // Flag
      ctx.fillStyle = active ? '#22c55e' : '#b45309';
      ctx.beginPath();
      ctx.moveTo(cx + 2, checkpoint.y);
      ctx.lineTo(cx + 42, checkpoint.y + 15);
      ctx.lineTo(cx + 2, checkpoint.y + 30);
      ctx.closePath();
      ctx.fill();
      
      drawFieldNoteLabel(ctx, cx, checkpoint.y - 20, active ? 'CHECKPOINT (ACTIVE)' : checkpoint.name, active ? '#166534' : '#78350f');
      ctx.restore();
    });

    // Route Gates
    ROUTE_GATES.forEach((gate) => {
      if (current.openedRouteGateIds.has(gate.id)) return;
      const gx = gate.x - cameraX;
      if (gx + gate.width < -100 || gx > CANVAS_WIDTH + 100) return;
      
      const requirements = getGateRequirements(gate, current);
      const complete = requirements.every(r => r.met);
      
      ctx.save();
      // Gate structure
      ctx.fillStyle = complete ? 'rgba(34, 197, 94, 0.2)' : 'rgba(180, 83, 9, 0.2)';
      ctx.fillRect(gx, gate.y, gate.width, gate.height);
      
      // Gate border
      ctx.strokeStyle = complete ? '#22c55e' : '#b45309';
      ctx.lineWidth = 4;
      ctx.setLineDash(complete ? [] : [10, 5]);
      ctx.strokeRect(gx, gate.y, gate.width, gate.height);
      
      // Symbol
      ctx.font = '32px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(complete ? '🔓' : '🔒', gx + gate.width / 2, gate.y + gate.height / 2 + 10);
      
      drawFieldNoteLabel(ctx, gx + gate.width / 2, gate.y - 15, gate.name, complete ? '#166534' : '#78350f');
      ctx.restore();
    });

    // Enemies
    current.enemies.forEach((enemy) => {
      if (enemy.defeated) return;
      const ex = enemy.x - cameraX;
      if (ex + enemy.width < -50 || ex > CANVAS_WIDTH + 50) return;

      ctx.save();
      if (enemy.hitFlash > 0) ctx.globalAlpha = 0.6;
      
      // Floating emoji
      const floatY = Math.sin(now / 150 + enemy.x) * 3;
      ctx.font = '38px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(enemy.emoji, ex + enemy.width / 2, enemy.y + enemy.height / 2 + 12 + floatY);

      // Stun/Alert effect
      if (enemy.stunTimer > 0) {
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 20px Outfit, sans-serif';
        ctx.fillText('💫', ex + enemy.width / 2, enemy.y - 30);
      }

      // Small Health Bar
      const barW = enemy.width;
      const barH = 5;
      const barY = enemy.y + enemy.height + 10;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(ex, barY, barW, barH);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(ex, barY, barW * (enemy.health / enemy.maxHealth), barH);

      drawFieldNoteLabel(ctx, ex + enemy.width / 2, enemy.y - 10, enemy.name, '#1e293b');
      ctx.restore();
    });

    // Bosses
    current.miniBosses.forEach((boss) => {
      if (boss.defeated) return;
      const bx = boss.x - cameraX;
      if (bx + boss.width < -100 || bx > CANVAS_WIDTH + 100) return;

      ctx.save();
      const shakeX = boss.hitFlash > 0 ? (Math.random() - 0.5) * 10 : 0;
      
      // Giant Emoji / Icon
      ctx.font = '80px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(boss.emoji || '👾', bx + boss.width / 2 + shakeX, boss.y + boss.height / 2 + 25);

      // Boss Name (Premium Header)
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      ctx.font = '900 18px Cinzel, serif';
      ctx.fillText(boss.name.toUpperCase(), bx + boss.width / 2, boss.y - 25);
      
      // Boss Health Bar (Chunky)
      const bw = boss.width * 1.5;
      const bh = 8;
      const by = boss.y + boss.height + 20;
      const bl = bx + (boss.width - bw) / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(bl, by, bw, bh);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(bl, by, bw * (boss.health / boss.maxHealth), bh);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(bl, by, bw, bh);
      
      ctx.restore();
    });

    // --- Collectibles ---
    // Shards
    RELIC_SHARDS.forEach((shard) => {
      if (current.collectedShardIds.has(shard.id)) return;
      const visible = !shard.hidden || current.collectedUpgrades.has('historian-vision');
      if (!visible) return;
      drawCollectible(ctx, shard.x, shard.y, cameraX, now, '💎', '#b45309', shard.hidden, true);
    });

    // Upgrades
    UPGRADES.forEach((upgrade) => {
      if (current.collectedUpgrades.has(upgrade.id)) return;
      drawCollectible(ctx, upgrade.x, upgrade.y, cameraX, now, upgrade.emoji, '#2563eb');
      drawFieldNoteLabel(ctx, upgrade.x - cameraX, upgrade.y - 30, upgrade.name, '#2563eb');
    });

    // Tools
    TOOL_LAYOUT.forEach((toolPos) => {
      if (current.collectedToolIds.has(toolPos.id)) return;
      const tool = JOURNEY_TOOLS.find(t => t.id === toolPos.id);
      drawCollectible(ctx, toolPos.x, toolPos.y, cameraX, now, tool.emoji, '#d4af37');
      drawFieldNoteLabel(ctx, toolPos.x - cameraX, toolPos.y - 30, tool.name, '#b45309');
    });

    // Objective Markers
    OBJECTIVE_MARKERS.forEach((marker) => {
      if (current.collectedObjectiveIds.has(marker.id)) return;
      const mx = marker.x - cameraX;
      if (mx < -50 || mx > CANVAS_WIDTH + 50) return;

      const floatY = Math.sin(now / 150) * 5;
      const emoji = marker.type === 'switch' ? '⚙️' : marker.type === 'glyph' ? '📜' : marker.type === 'escape' ? '🏃' : '🚩';

      ctx.save();
      ctx.shadowColor = marker.color || '#d4af37';
      ctx.shadowBlur = 10 + Math.sin(now / 150) * 5;
      ctx.font = '32px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(emoji, mx + 15, marker.y + 15 + floatY);
      ctx.restore();

      drawFieldNoteLabel(ctx, mx + 15, marker.y - 15, marker.label, marker.color || '#b45309');
    });

    // Lore Tablets
    LORE_TABLETS.forEach((tablet, index) => {
      if (current.collectedTabletIds.has(tablet.id)) return;
      const tx = tablet.x - cameraX;
      if (tx < -50 || tx > CANVAS_WIDTH + 50) return;
      
      const floatY = Math.sin((now / 250) + index) * 4;
      
      ctx.save();
      ctx.font = '34px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🧱', tx, tablet.y + floatY);
      ctx.restore();

      drawFieldNoteLabel(ctx, tx, tablet.y - 25, 'Ancient Lore', '#3b2b1f');
    });

    // Final Gate
    const gateX = GATE.x - cameraX;
    if (gateX > -200 && gateX < CANVAS_WIDTH + 200) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#31543d';
      ctx.fillRect(gateX, GATE.y, GATE.width, GATE.height);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.strokeRect(gateX, GATE.y, GATE.width, GATE.height);
      
      ctx.font = '50px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⛺', gateX + GATE.width / 2, GATE.y + 45);
      
      ctx.fillStyle = '#fff';
      ctx.font = '900 14px Cinzel, serif';
      ctx.fillText('BASE CAMP', gateX + GATE.width / 2, GATE.y - 15);
      ctx.restore();
    }

    const playerScreenX = player.x - cameraX;
    drawPlayerCharacter(ctx, playerScreenX, player.y, player.width, player.height, player.direction, player.invulnerable, now);

    if (current.attackTimer > 0) {
      const attackX = player.direction >= 0
        ? player.x + player.width - cameraX
        : player.x - 38 - cameraX;
      ctx.save();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.beginPath();
      ctx.roundRect(attackX, player.y + 7, 42, 28, 4);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Notice Box (compacted and moved slightly higher if needed, but handled by React HUD now)

    const featureCard = current.bossIntro || current.sectionTransition || current.environmentEvent || current.cinematicEvent;
    if (featureCard) {
      const isBossIntro = Boolean(current.bossIntro);
      ctx.fillStyle = isBossIntro ? 'rgba(89, 22, 22, 0.9)' : 'rgba(47, 37, 29, 0.88)';
      ctx.fillRect(208, 84, 484, isBossIntro ? 92 : 72);
      ctx.strokeStyle = isBossIntro ? '#facc15' : '#f8d891';
      ctx.lineWidth = 3;
      ctx.strokeRect(208, 84, 484, isBossIntro ? 92 : 72);
      ctx.fillStyle = '#fff4d4';
      ctx.font = '900 17px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(featureCard.name || featureCard.title, 450, 114);
      ctx.font = '800 12px Outfit, sans-serif';
      ctx.fillText(featureCard.message || atmosphere.title, 450, 140);
      if (isBossIntro) {
        ctx.fillStyle = '#facc15';
        ctx.font = '900 11px Outfit, sans-serif';
        ctx.fillText(`WARNING: ${current.bossIntro.effect}`, 450, 160);
      }
      ctx.textAlign = 'start';
    }
  }, [drawCollectible, drawParticles, drawPlatform, drawStoryProp, getGateRequirements]);

  const availablePlatforms = useCallback((current) => PLATFORMS.filter((platform) => (
    !platform.requiresUpgrade || current.collectedUpgrades.has(platform.requiresUpgrade)
  )), []);

  const queueAttack = useCallback(() => {
    const current = stateRef.current;
    if (briefingOpen || current.failed || current.completed) return;
    if (current.attackCooldown > 0 || current.attackTimer > 0) return;
    current.attackQueued = true;
  }, [briefingOpen]);

  const update = useCallback((dt) => {
    const current = stateRef.current;
    if (briefingOpen || current.completed || current.failed) return;

    const player = current.player;
    const keys = keysRef.current;
    const left = keys.ArrowLeft || keys.KeyA;
    const right = keys.ArrowRight || keys.KeyD;
    const jump = keys.ArrowUp || keys.KeyW || keys.Space;

    current.cinematicTimer = Math.max(0, current.cinematicTimer - dt);
    if (current.cinematicTimer <= 0 && current.cinematicEvent?.temporary) {
      current.cinematicEvent = null;
    }
    current.bossIntroTimer = Math.max(0, current.bossIntroTimer - dt);
    if (current.bossIntroTimer <= 0 && current.bossIntro) {
      current.bossIntro = null;
    }
    current.environmentEventTimer = Math.max(0, current.environmentEventTimer - dt);
    if (current.environmentEventTimer <= 0 && current.environmentEvent) {
      current.environmentEvent = null;
    }
    current.sectionTransitionTimer = Math.max(0, current.sectionTransitionTimer - dt);
    if (current.sectionTransitionTimer <= 0 && current.sectionTransition) {
      current.sectionTransition = null;
    }
    current.cameraShakeTimer = Math.max(0, current.cameraShakeTimer - dt);
    if (current.cameraShakeTimer <= 0) {
      current.cameraShakeStrength = 0;
    }

    player.vx = 0;
    if (left) {
      player.vx -= MOVE_SPEED;
      player.direction = -1;
    }
    if (right) {
      player.vx += MOVE_SPEED;
      player.direction = 1;
    }
    if (current.collectedUpgrades.has('reinforced-boots')) {
      player.vx *= 1.04;
    }
    if (current.bossIntroTimer > 0) {
      player.vx *= 0.42;
    }

    if (jump && !keys.jumpHeld) {
      const jumpStrength = current.collectedUpgrades.has('reinforced-boots') ? JUMP_SPEED + 95 : JUMP_SPEED;
      if (player.onGround) {
        player.vy = -jumpStrength;
        player.onGround = false;
        player.airJumpsUsed = 0;
        audioControls?.playPlace?.();
      } else if (current.collectedUpgrades.has('rope-launcher') && player.airJumpsUsed < 1) {
        player.vy = -JUMP_SPEED * 0.86;
        player.airJumpsUsed += 1;
        current.notice = 'Rope Launcher used for a second jump.';
        audioControls?.playPlace?.();
      }
    }
    keys.jumpHeld = Boolean(jump);

    current.routeGateCooldown = Math.max(0, current.routeGateCooldown - dt);
    current.attackCooldown = Math.max(0, current.attackCooldown - dt);
    current.attackTimer = Math.max(0, current.attackTimer - dt);
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    if (current.attackQueued && current.attackCooldown <= 0) {
      current.attackQueued = false;
      current.attackTimer = ATTACK_DURATION;
      current.attackCooldown = ATTACK_COOLDOWN;
      current.attackHitIds = new Set();
      current.notice = 'Tool swing ready: close enemies can be stunned or defeated.';
      audioControls?.playPlace?.();
    }

    const previousX = player.x;
    const previousBottom = player.y + player.height;
    player.x = clamp(player.x + player.vx * dt, 0, WORLD_WIDTH - player.width);
    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;
    player.onGround = false;

    const activeSection = getSectionForX(player.x);
    if (activeSection.id !== current.lastSectionId) {
      current.lastSectionId = activeSection.id;
      const atmosphere = SECTION_ATMOSPHERES[activeSection.id] || SECTION_ATMOSPHERES[SECTIONS[0].id];
      current.sectionTransition = {
        id: activeSection.id,
        name: activeSection.name,
        message: atmosphere.title,
      };
      current.sectionTransitionTimer = 3;
      current.cinematicEvent = {
        id: `enter-${activeSection.id}`,
        name: activeSection.name,
        message: getObjectiveProgress(activeSection.id, current).title,
        temporary: true,
      };
      current.cinematicTimer = 2.4;
      current.notice = `${activeSection.name}: ${getObjectiveProgress(activeSection.id, current).title}`;
      audioControls?.playPlace?.();
    }

    ENVIRONMENT_EVENTS.forEach((event) => {
      if (current.triggeredEnvironmentEventIds.has(event.id)) return;
      if (player.x < event.x - 24 || player.x > event.x + 80) return;
      current.triggeredEnvironmentEventIds.add(event.id);
      current.environmentEvent = {
        id: event.id,
        sectionId: event.sectionId,
        name: event.name,
        message: event.message,
        type: event.type,
      };
      current.environmentEventTimer = event.duration;
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, Math.min(event.duration, 2));
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, event.shake);
      current.notice = `${event.name}: ${event.message}`;
      audioControls?.playError?.();
    });

    ROUTE_GATES.forEach((gate) => {
      if (current.openedRouteGateIds.has(gate.id)) return;
      const gateRect = { x: gate.x, y: gate.y, width: gate.width, height: gate.height };
      const reachedFromLeft = previousX < gate.x && player.x + player.width >= gate.x;
      const slippedPastGate = player.x > gate.x;
      const touchingGate = rectsOverlap(player, gateRect) || reachedFromLeft || slippedPastGate;
      if (!touchingGate) return;

      const requirements = getGateRequirements(gate, current);
      const complete = requirements.every((requirement) => requirement.met);
      if (complete) {
        current.openedRouteGateIds.add(gate.id);
        current.notice = `${gate.name} opened. Route secured.`;
        audioControls?.playSuccess?.();
        return;
      }

      player.x = gate.x - player.width - 1;
      player.vx = 0;
      if (current.routeGateCooldown <= 0) {
        const missing = requirements
          .filter((requirement) => !requirement.met)
          .map((requirement) => requirement.label)
          .join(', ');
        current.notice = `${gate.message} Still needed: ${missing}.`;
        current.routeGateCooldown = 1.2;
        audioControls?.playError?.();
      }
    });

    availablePlatforms(current).forEach((platform) => {
      const platformRect = {
        x: platform.x,
        y: platform.y,
        width: platform.width,
        height: platform.height,
      };
      if (
        rectsOverlap(player, platformRect)
        && previousBottom <= platform.y + 8
        && player.vy >= 0
      ) {
        player.y = platform.y - player.height;
        player.vy = 0;
        player.onGround = true;
        player.airJumpsUsed = 0;
      }
    });

    if (player.y > CANVAS_HEIGHT + 120) {
      respawnAtCheckpoint('You slipped off the route and returned to the latest checkpoint.');
    }

    CHECKPOINTS.forEach((checkpoint) => {
      if (checkpoint.x <= current.activeCheckpoint.x) return;
      const checkpointRect = { x: checkpoint.x - 12, y: checkpoint.y, width: 82, height: 80 };
      if (rectsOverlap(player, checkpointRect)) {
        current.activeCheckpoint = checkpoint;
        current.resources.stamina = Math.min(100, current.resources.stamina + 18);
        current.notice = `${checkpoint.name} checkpoint reached. Stamina topped up.`;
        current.cinematicEvent = {
          id: `checkpoint-${checkpoint.id}`,
          name: 'Checkpoint Reached',
          message: `${checkpoint.name} route secured.`,
          temporary: true,
        };
        current.cinematicTimer = 2;
        audioControls?.playSuccess?.();
      }
    });

    TOOL_LAYOUT.forEach((toolPosition) => {
      if (current.collectedToolIds.has(toolPosition.id)) return;
      const toolRect = { x: toolPosition.x - 16, y: toolPosition.y - 16, width: 32, height: 32 };
      if (rectsOverlap(player, toolRect)) {
        current.collectedToolIds.add(toolPosition.id);
        current.fieldKit.push(toolPosition.id);
        const tool = JOURNEY_TOOLS.find((item) => item.id === toolPosition.id);
        current.notice = `${tool.name} added to the field kit.`;
        audioControls?.playMatch?.();
      }
    });

    RELIC_SHARDS.forEach((shard) => {
      if (current.collectedShardIds.has(shard.id)) return;
      if (shard.hidden && !current.collectedUpgrades.has('historian-vision')) return;
      const shardRect = { x: shard.x - 14, y: shard.y - 14, width: 28, height: 28 };
      if (rectsOverlap(player, shardRect)) {
        current.collectedShardIds.add(shard.id);
        current.relicShardCount += 1;
        current.notice = `Relic shard collected. Shard score: ${current.relicShardCount}.`;
        if (current.relicShardCount > 0 && current.relicShardCount % 10 === 0) {
          current.cinematicEvent = {
            id: `shard-milestone-${current.relicShardCount}`,
            name: 'Relic Milestone',
            message: `${current.relicShardCount} shard score reached.`,
            temporary: true,
          };
          current.cinematicTimer = 1.8;
        }
        audioControls?.playMatch?.();
      }
    });

    UPGRADES.forEach((upgrade) => {
      if (current.collectedUpgrades.has(upgrade.id)) return;
      const upgradeRect = { x: upgrade.x - 42, y: upgrade.y - 64, width: 84, height: 108 };
      if (rectsOverlap(player, upgradeRect)) {
        current.collectedUpgrades.add(upgrade.id);
        current.notice = `${upgrade.name} unlocked: ${upgrade.effect}`;
        current.cinematicEvent = {
          id: `upgrade-${upgrade.id}`,
          name: 'Upgrade Unlocked',
          message: `${upgrade.name}: ${upgrade.effect}`,
          temporary: true,
        };
        current.cinematicTimer = 2.4;
        audioControls?.playSuccess?.();
      }
    });

    OBJECTIVE_MARKERS.forEach((marker) => {
      if (current.collectedObjectiveIds.has(marker.id)) return;
      const markerRect = { x: marker.x - 52, y: marker.y - 72, width: 104, height: 120 };
      if (rectsOverlap(player, markerRect)) {
        current.collectedObjectiveIds.add(marker.id);
        if (marker.type === 'escape') {
          current.completedObjectiveIds.add('escape-sequence');
        }
        const progress = getObjectiveProgress(marker.sectionId, current);
        if (progress.complete) {
          current.completedObjectiveIds.add(marker.sectionId);
          current.cinematicEvent = {
            id: `objective-${marker.sectionId}`,
            name: 'Objective Complete',
            message: progress.title,
            temporary: true,
          };
          current.cinematicTimer = 2.4;
          current.notice = `${progress.title} complete.`;
          audioControls?.playSuccess?.();
        } else {
          current.notice = `${marker.label} secured. Objective progress: ${progress.label}.`;
          audioControls?.playMatch?.();
        }
      }
    });

    LORE_TABLETS.forEach((tablet) => {
      if (current.collectedTabletIds.has(tablet.id)) return;
      const tabletRect = { x: tablet.x - 18, y: tablet.y - 20, width: 36, height: 40 };
      if (rectsOverlap(player, tabletRect)) {
        current.collectedTabletIds.add(tablet.id);
        current.notice = tablet.text;
        audioControls?.playMatch?.();
      }
    });

    HIDDEN_ROOMS.forEach((room) => {
      if (current.hiddenRoomsFound.has(room.id)) return;
      if (!current.collectedUpgrades.has(room.requiresUpgrade)) return;
      if (rectsOverlap(player, room)) {
        current.hiddenRoomsFound.add(room.id);
        current.resources.time = Math.min(900, current.resources.time + 20);
        current.notice = `Secret found: ${room.name}. Bonus time awarded.`;
        audioControls?.playSuccess?.();
      }
    });

    current.hazardCooldown = Math.max(0, current.hazardCooldown - dt);
    current.enemyCooldown = Math.max(0, current.enemyCooldown - dt);
    if (current.hazardCooldown <= 0) {
      const hitHazard = HAZARDS.find((hazard) => rectsOverlap(player, hazard));
      if (hitHazard) {
        if (hitHazard.penalty.stamina) {
          current.resources.stamina = Math.max(0, current.resources.stamina - hitHazard.penalty.stamina);
        }
        if (hitHazard.penalty.time) {
          current.resources.time = Math.max(0, current.resources.time - hitHazard.penalty.time);
        }
        current.notice = hitHazard.message;
        current.hazardCooldown = 1.35;
        player.invulnerable = Math.max(player.invulnerable, 0.5);
        audioControls?.playError?.();
        if (current.resources.stamina <= 0 || current.resources.time <= 0) {
          triggerJourneyRescue(`Field rescue needed after ${hitHazard.name}. Restart the journey and plan a safer route.`);
        }
      }
    }

    const attackRect = current.attackTimer > 0 ? {
      x: player.direction >= 0 ? player.x + player.width - 2 : player.x - 42,
      y: player.y + 6,
      width: 44,
      height: 30,
    } : null;

    current.enemies.forEach((enemy) => {
      if (enemy.defeated) return;
      enemy.stunTimer = Math.max(0, enemy.stunTimer - dt);
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);

      if (enemy.stunTimer <= 0) {
        enemy.x += enemy.direction * enemy.speed * dt;
        if (enemy.x <= enemy.patrolMin) {
          enemy.x = enemy.patrolMin;
          enemy.direction = 1;
        } else if (enemy.x >= enemy.patrolMax) {
          enemy.x = enemy.patrolMax;
          enemy.direction = -1;
        }
        if (enemy.flying) {
          enemy.y += Math.sin(Date.now() / 160) * 0.16;
        }
      }

      const enemyRect = { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
      if (attackRect && !current.attackHitIds.has(enemy.id) && rectsOverlap(attackRect, enemyRect)) {
        current.attackHitIds.add(enemy.id);
        enemy.health -= 1;
        enemy.stunTimer = 0.7;
        enemy.hitFlash = 0.18;
        const pushDirection = player.x + player.width / 2 < enemy.x + enemy.width / 2 ? 1 : -1;
        enemy.x = clamp(enemy.x + pushDirection * 34, enemy.patrolMin, enemy.patrolMax);
        if (enemy.health <= 0) {
          enemy.defeated = true;
          current.defeatedEnemies.add(enemy.id);
          current.relicShardCount += enemy.shards;
          current.notice = `${enemy.name} defeated. Bonus relic shards +${enemy.shards}.`;
          audioControls?.playSuccess?.();
        } else {
          current.notice = `${enemy.name} stunned. Keep moving or strike again.`;
          audioControls?.playMatch?.();
        }
      }

      if (current.enemyCooldown <= 0 && player.invulnerable <= 0 && rectsOverlap(player, enemyRect)) {
        current.resources.stamina = Math.max(0, current.resources.stamina - enemy.damage);
        const pushDirection = player.x + player.width / 2 < enemy.x + enemy.width / 2 ? -1 : 1;
        player.x = clamp(player.x + pushDirection * 84, 0, WORLD_WIDTH - player.width);
        player.vy = Math.min(player.vy, -170);
        player.invulnerable = INVULNERABLE_DURATION;
        current.enemyCooldown = 0.85;
        current.notice = `${enemy.name} bumped the team. Use J or K to stun enemies.`;
        audioControls?.playError?.();
        if (current.resources.stamina <= 0) {
          triggerJourneyRescue(`Field rescue needed after the ${enemy.name}. Restart from the journey briefing.`);
        }
      }
    });

    current.miniBosses.forEach((boss) => {
      if (boss.defeated) return;
      if (!boss.awakened && Math.abs(boss.x - player.x) < 430) {
        boss.awakened = true;
        const intro = BOSS_INTROS[boss.id] || { title: boss.name, message: boss.intro, effect: 'arcade warning' };
        current.bossIntro = {
          id: boss.id,
          name: intro.title,
          bossName: boss.name,
          message: intro.message,
          effect: intro.effect,
          focusX: boss.x,
        };
        current.bossIntroTimer = 3.4;
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 1.2);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, boss.type === 'statue' ? 1.1 : 0.8);
        current.cinematicEvent = {
          id: `boss-${boss.id}`,
          name: boss.name,
          message: boss.intro,
          temporary: true,
        };
        current.cinematicTimer = 2.7;
        current.notice = boss.intro;
        audioControls?.playError?.();
      }

      boss.stunTimer = Math.max(0, boss.stunTimer - dt);
      boss.hitFlash = Math.max(0, boss.hitFlash - dt);
      if (boss.awakened && boss.stunTimer <= 0) {
        boss.x += boss.direction * boss.speed * dt;
        if (boss.x <= boss.patrolMin) {
          boss.x = boss.patrolMin;
          boss.direction = 1;
        } else if (boss.x >= boss.patrolMax) {
          boss.x = boss.patrolMax;
          boss.direction = -1;
        }
      }

      const bossRect = { x: boss.x, y: boss.y, width: boss.width, height: boss.height };
      if (attackRect && !current.attackHitIds.has(boss.id) && rectsOverlap(attackRect, bossRect)) {
        current.attackHitIds.add(boss.id);
        boss.awakened = true;
        boss.health -= 1;
        boss.stunTimer = 0.55;
        boss.hitFlash = 0.18;
        const pushDirection = player.x + player.width / 2 < boss.x + boss.width / 2 ? 1 : -1;
        boss.x = clamp(boss.x + pushDirection * 24, boss.patrolMin, boss.patrolMax);
        if (boss.health <= 0) {
          boss.defeated = true;
          current.defeatedMiniBosses.add(boss.id);
          current.defeatedEnemies.add(boss.id);
          current.relicShardCount += boss.shards;
          if (boss.sectionId === 'dig-site-entrance') {
            current.completedObjectiveIds.add('dig-site-entrance');
          }
          current.cinematicEvent = {
            id: `defeated-${boss.id}`,
            name: 'Mini-boss Defeated',
            message: `${boss.name} defeated. Route progress unlocked.`,
            temporary: true,
          };
          current.cinematicTimer = 2.5;
          current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.9);
          current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.6);
          current.notice = `${boss.name} defeated. Bonus relic shards +${boss.shards}.`;
          audioControls?.playSuccess?.();
        } else {
          current.notice = `${boss.name} staggered. ${boss.health}/${boss.maxHealth} health left.`;
          audioControls?.playMatch?.();
        }
      }

      if (current.enemyCooldown <= 0 && player.invulnerable <= 0 && rectsOverlap(player, bossRect)) {
        current.resources.stamina = Math.max(0, current.resources.stamina - Math.ceil(boss.damage / 4));
        const pushDirection = player.x + player.width / 2 < boss.x + boss.width / 2 ? -1 : 1;
        player.x = clamp(player.x + pushDirection * 96, 0, WORLD_WIDTH - player.width);
        player.vy = Math.min(player.vy, -180);
        player.invulnerable = INVULNERABLE_DURATION;
        current.enemyCooldown = 0.95;
        current.notice = `${boss.name} pushed the team back. Strike, retreat, and try again.`;
        audioControls?.playError?.();
        if (current.resources.stamina <= 0) {
          triggerJourneyRescue(`Field rescue needed after the ${boss.name}. Restart from the journey briefing.`);
        }
      }
    });

    current.timeAccumulator += dt;
    if (current.timeAccumulator >= 1) {
      current.resources.time = Math.max(0, current.resources.time - Math.floor(current.timeAccumulator));
      current.timeAccumulator %= 1;
      if (current.resources.time <= 0) {
        triggerJourneyRescue('Field rescue needed: time ran out before reaching Base Camp. Restart the journey.');
      }
    }

    if (rectsOverlap(player, GATE)) {
      current.completed = true;
      current.notice = 'Dig site entrance reached. Report to Base Camp.';
      audioControls?.playSuccess?.();
      syncHud();
      onComplete?.([...current.fieldKit]);
    }
  }, [audioControls, availablePlatforms, briefingOpen, getGateRequirements, getObjectiveProgress, onComplete, respawnAtCheckpoint, syncHud, triggerJourneyRescue]);

  const step = useCallback((ms) => {
    const dt = Math.min(ms / 1000, 0.05);
    update(dt);
    draw();
    syncHud();
  }, [draw, syncHud, update]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW', 'KeyJ', 'KeyK'].includes(event.code)) {
        event.preventDefault();
      }
      if (briefingOpen) return;
      if (event.code === 'KeyJ' || event.code === 'KeyK') {
        queueAttack();
        return;
      }
      keysRef.current[event.code] = true;
    };
    const handleKeyUp = (event) => {
      keysRef.current[event.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.__advanceExpeditionJourney = (ms = 16) => step(ms);

    const frame = (timestamp) => {
      if (!lastFrameRef.current) lastFrameRef.current = timestamp;
      const elapsed = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;
      step(elapsed);
      animationRef.current = window.requestAnimationFrame(frame);
    };
    animationRef.current = window.requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.cancelAnimationFrame(animationRef.current);
        enemy.x += enemy.direction * enemy.speed * dt;
        if (enemy.x <= enemy.patrolMin) {
          enemy.x = enemy.patrolMin;
          enemy.direction = 1;
        } else if (enemy.x >= enemy.patrolMax) {
          enemy.x = enemy.patrolMax;
          enemy.direction = -1;
        }
        if (enemy.flying) {
          enemy.y += Math.sin(Date.now() / 160) * 0.16;
        }
      }

      const enemyRect = { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
      if (attackRect && !current.attackHitIds.has(enemy.id) && rectsOverlap(attackRect, enemyRect)) {
        current.attackHitIds.add(enemy.id);
        enemy.health -= 1;
        enemy.stunTimer = 0.7;
        enemy.hitFlash = 0.18;
        const pushDirection = player.x + player.width / 2 < enemy.x + enemy.width / 2 ? 1 : -1;
        enemy.x = clamp(enemy.x + pushDirection * 34, enemy.patrolMin, enemy.patrolMax);
        if (enemy.health <= 0) {
          enemy.defeated = true;
          current.defeatedEnemies.add(enemy.id);
          current.relicShardCount += enemy.shards;
          current.notice = `${enemy.name} defeated. Bonus relic shards +${enemy.shards}.`;
          audioControls?.playSuccess?.();
        } else {
          current.notice = `${enemy.name} stunned. Keep moving or strike again.`;
          audioControls?.playMatch?.();
        }
      }

      if (current.enemyCooldown <= 0 && player.invulnerable <= 0 && rectsOverlap(player, enemyRect)) {
        current.resources.stamina = Math.max(0, current.resources.stamina - enemy.damage);
        const pushDirection = player.x + player.width / 2 < enemy.x + enemy.width / 2 ? -1 : 1;
        player.x = clamp(player.x + pushDirection * 84, 0, WORLD_WIDTH - player.width);
        player.vy = Math.min(player.vy, -170);
        player.invulnerable = INVULNERABLE_DURATION;
        current.enemyCooldown = 0.85;
        current.notice = `${enemy.name} bumped the team. Use J or K to stun enemies.`;
        audioControls?.playError?.();
        if (current.resources.stamina <= 0) {
          triggerJourneyRescue(`Field rescue needed after the ${enemy.name}. Restart from the journey briefing.`);
        }
      }
    });

    current.miniBosses.forEach((boss) => {
      if (boss.defeated) return;
      if (!boss.awakened && Math.abs(boss.x - player.x) < 430) {
        boss.awakened = true;
        const intro = BOSS_INTROS[boss.id] || { title: boss.name, message: boss.intro, effect: 'arcade warning' };
        current.bossIntro = {
          id: boss.id,
          name: intro.title,
          bossName: boss.name,
          message: intro.message,
          effect: intro.effect,
          focusX: boss.x,
        };
        current.bossIntroTimer = 3.4;
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 1.2);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, boss.type === 'statue' ? 1.1 : 0.8);
        current.cinematicEvent = {
          id: `boss-${boss.id}`,
          name: boss.name,
          message: boss.intro,
          temporary: true,
        };
        current.cinematicTimer = 2.7;
        current.notice = boss.intro;
        audioControls?.playError?.();
      }

      boss.stunTimer = Math.max(0, boss.stunTimer - dt);
      boss.hitFlash = Math.max(0, boss.hitFlash - dt);
      if (boss.awakened && boss.stunTimer <= 0) {
        boss.x += boss.direction * boss.speed * dt;
        if (boss.x <= boss.patrolMin) {
          boss.x = boss.patrolMin;
          boss.direction = 1;
        } else if (boss.x >= boss.patrolMax) {
          boss.x = boss.patrolMax;
          boss.direction = -1;
        }
      }

      const bossRect = { x: boss.x, y: boss.y, width: boss.width, height: boss.height };
      if (attackRect && !current.attackHitIds.has(boss.id) && rectsOverlap(attackRect, bossRect)) {
        current.attackHitIds.add(boss.id);
        boss.awakened = true;
        boss.health -= 1;
        boss.stunTimer = 0.55;
        boss.hitFlash = 0.18;
        const pushDirection = player.x + player.width / 2 < boss.x + boss.width / 2 ? 1 : -1;
        boss.x = clamp(boss.x + pushDirection * 24, boss.patrolMin, boss.patrolMax);
        if (boss.health <= 0) {
          boss.defeated = true;
          current.defeatedMiniBosses.add(boss.id);
          current.defeatedEnemies.add(boss.id);
          current.relicShardCount += boss.shards;
          if (boss.sectionId === 'dig-site-entrance') {
            current.completedObjectiveIds.add('dig-site-entrance');
          }
          current.cinematicEvent = {
            id: `defeated-${boss.id}`,
            name: 'Mini-boss Defeated',
            message: `${boss.name} defeated. Route progress unlocked.`,
            temporary: true,
          };
          current.cinematicTimer = 2.5;
          current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.9);
          current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.6);
          current.notice = `${boss.name} defeated. Bonus relic shards +${boss.shards}.`;
          audioControls?.playSuccess?.();
        } else {
          current.notice = `${boss.name} staggered. ${boss.health}/${boss.maxHealth} health left.`;
          audioControls?.playMatch?.();
        }
      }

      if (current.enemyCooldown <= 0 && player.invulnerable <= 0 && rectsOverlap(player, bossRect)) {
        current.resources.stamina = Math.max(0, current.resources.stamina - Math.ceil(boss.damage / 4));
        const pushDirection = player.x + player.width / 2 < boss.x + boss.width / 2 ? -1 : 1;
        player.x = clamp(player.x + pushDirection * 96, 0, WORLD_WIDTH - player.width);
        player.vy = Math.min(player.vy, -180);
        player.invulnerable = INVULNERABLE_DURATION;
        current.enemyCooldown = 0.95;
        current.notice = `${boss.name} pushed the team back. Strike, retreat, and try again.`;
        audioControls?.playError?.();
        if (current.resources.stamina <= 0) {
          triggerJourneyRescue(`Field rescue needed after the ${boss.name}. Restart from the journey briefing.`);
        }
      }
    });

    current.timeAccumulator += dt;
    if (current.timeAccumulator >= 1) {
      current.resources.time = Math.max(0, current.resources.time - Math.floor(current.timeAccumulator));
      current.timeAccumulator %= 1;
      if (current.resources.time <= 0) {
        triggerJourneyRescue('Field rescue needed: time ran out before reaching Base Camp. Restart the journey.');
      }
    }

    if (rectsOverlap(player, GATE)) {
      current.completed = true;
      current.notice = 'Dig site entrance reached. Report to Base Camp.';
      audioControls?.playSuccess?.();
      syncHud();
      onComplete?.([...current.fieldKit]);
    }
  }, [audioControls, availablePlatforms, briefingOpen, getGateRequirements, getObjectiveProgress, onComplete, respawnAtCheckpoint, syncHud, triggerJourneyRescue]);

  const step = useCallback((ms) => {
    const dt = Math.min(ms / 1000, 0.05);
    update(dt);
    draw();
    syncHud();
  }, [draw, syncHud, update]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW', 'KeyJ', 'KeyK'].includes(event.code)) {
        event.preventDefault();
      }
      if (briefingOpen) return;
      if (event.code === 'KeyJ' || event.code === 'KeyK') {
        queueAttack();
        return;
      }
      keysRef.current[event.code] = true;
    };
    const handleKeyUp = (event) => {
      keysRef.current[event.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.__advanceExpeditionJourney = (ms = 16) => step(ms);

    const frame = (timestamp) => {
      if (!lastFrameRef.current) lastFrameRef.current = timestamp;
      const elapsed = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;
      step(elapsed);
      animationRef.current = window.requestAnimationFrame(frame);
    };
    animationRef.current = window.requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.cancelAnimationFrame(animationRef.current);
      if (window.__advanceExpeditionJourney) {
        delete window.__advanceExpeditionJourney;
      }
    };
  }, [briefingOpen, queueAttack, step]);
  return (
    <section className="expedition-journey-container" id="expedition-journey">
      <div className="expedition-journey-grid">
        {/* Sidebar HUD */}
        <div className="expedition-sidebar">
          <div className="expedition-panel dossier-info">
            <h2 className="cinzel-header">Expedition Log</h2>
            <p className="field-meta">Year 7 Archaeological Survey</p>
            
            <div className="expedition-stat-card">
              <div className="stat-label">
                <Gauge size={14} /> Team Stamina
              </div>
              <div className="expedition-stat-bar">
                <div 
                  className="expedition-stat-fill stamina-fill" 
                  style={{ width: `${gameState.resources.stamina}%` }}
                />
              </div>
            </div>

            <div className="expedition-stat-card">
              <div className="stat-label">
                <Sparkles size={14} /> Expedition Time
              </div>
              <div className="expedition-stat-bar">
                <div 
                  className="expedition-stat-fill time-fill" 
                  style={{ width: `${(gameState.resources.time / 120) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="expedition-panel inventory-panel">
            <h3 className="section-title"><Backpack size={16} /> Field Kit</h3>
            <ul className="expedition-tool-list">
              {JOURNEY_TOOLS.map(tool => (
                <li key={tool.id} className={gameState.collectedToolIds.has(tool.id) ? 'is-collected' : ''}>
                  <span className="tool-emoji">{tool.emoji}</span>
                  <span className="tool-name">{tool.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="expedition-panel objective-panel">
            <h3 className="section-title"><Map size={16} /> Objectives</h3>
            <div className="current-section-badge" style={{ backgroundColor: SECTIONS.find(s => s.id === gameState.currentSectionId)?.accent + '22', color: SECTIONS.find(s => s.id === gameState.currentSectionId)?.accent }}>
              {SECTIONS.find(s => s.id === gameState.currentSectionId)?.name}
            </div>
            <div className="objective-progress">
              <div className="progress-text">Shards: {gameState.collectedShardIds.size} / 12</div>
              <div className="progress-text">Upgrades: {gameState.collectedUpgrades.size} / 3</div>
            </div>
          </div>
        </div>

        {/* Main Gameplay Area */}
        <div className="expedition-main">
          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="expedition-canvas"
            />
            
            {gameState.notice && (
              <div className="expedition-journey-notice">
                {gameState.notice}
              </div>
            )}
          </div>
          
          <div className="controls-hint">
            <span>[Arrows/WASD] Move & Jump</span>
            <span>[J/K] Primary Action / Strike</span>
          </div>
        </div>
      </div>

      {/* Briefing Overlay */}
      {briefingOpen && (
        <div className="expedition-briefing-overlay">
          <div className="expedition-briefing-card">
            <h1 className="cinzel-header">Lost Site Expedition</h1>
            <div className="briefing-content">
              <p>Historian, the survey team has identified a potential site entrance. Your objective is to navigate the terrain and reach Base Camp.</p>
              
              <div className="expedition-briefing-mission">
                <strong>Current Mission:</strong> {mission || 'Secure the site entrance and recover any surface artifacts.'}
              </div>

              <div className="briefing-intel">
                <h3>Initial Reconnaissance:</h3>
                <ul>
                  <li>Collect <strong>Relic Shards</strong> to unlock secure route gates.</li>
                  <li>Recover <strong>Field Upgrades</strong> to access hidden survey areas.</li>
                  <li>Maintain <strong>Team Stamina</strong> by avoiding environmental hazards.</li>
                </ul>
              </div>
            </div>
            <button 
              className="expedition-begin-btn"
              onClick={() => setBriefingOpen(false)}
            >
              Begin Expedition
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

ExpeditionJourney.tools = JOURNEY_TOOLS;

export default ExpeditionJourney;
