import { GROUND_Y, JOURNEY_VERTICAL_OFFSET, WORLD_WIDTH, scaleJourneyX } from './journeyConstants';

const JY = (y) => y + JOURNEY_VERTICAL_OFFSET;
const X = scaleJourneyX;

export const JOURNEY_TOOLS = [
  { id: 'brush', name: 'Brush', emoji: '🖌️', icon: 'B' },
  { id: 'trowel', name: 'Trowel', emoji: '⛏️', icon: 'T' },
  { id: 'notebook', name: 'Notebook', emoji: '📓', icon: 'N' },
  { id: 'camera', name: 'Camera', emoji: '📷', icon: 'C' },
  { id: 'measuring-tape', name: 'Measuring Tape', emoji: '📏', icon: 'M' },
  { id: 'field-guide-page', name: 'Field Guide Page', emoji: '📜', icon: 'F' },
];

export const SECTIONS = [
  { id: 'desert-entry', name: 'Desert Entry', start: X(0), end: X(1500), color: '#f3e5ab', accent: '#b45309' },
  { id: 'ruined-temple', name: 'Ruined Temple', start: X(1500), end: X(3150), color: '#d1bfa7', accent: '#5c4033' },
  { id: 'catacombs', name: 'Catacombs', start: X(3150), end: X(5050), color: '#3d3d3d', accent: '#7c3aed' },
  { id: 'escape-sequence', name: 'Escape Sequence', start: X(5050), end: X(6500), color: '#a16207', accent: '#991b1b' },
  { id: 'dig-site-entrance', name: 'Dig Site Entrance', start: X(6500), end: WORLD_WIDTH, color: '#dcfce7', accent: '#166534' },
];

export const TOOL_LAYOUT = [
  { id: 'brush', x: X(220), y: JY(314) },
  { id: 'trowel', x: X(770), y: JY(320) },
  { id: 'notebook', x: X(1780), y: JY(320) },
  { id: 'camera', x: X(2860), y: JY(320) },
  { id: 'measuring-tape', x: X(4280), y: JY(260) },
  { id: 'field-guide-page', x: X(6210), y: JY(208) },
];

export const PLATFORMS = [
  { x: X(0), y: GROUND_Y, width: X(1500), height: 60, label: 'desert track' },
  { x: X(1500), y: GROUND_Y, width: X(1650), height: 60, label: 'temple floor' },
  { x: X(3150), y: GROUND_Y, width: X(1900), height: 60, label: 'catacomb path' },
  { x: X(5050), y: GROUND_Y, width: X(1450), height: 60, label: 'escape road' },
  { x: X(6500), y: GROUND_Y, width: WORLD_WIDTH - X(6500), height: 60, label: 'dig-site rise' },
  { x: X(360), y: JY(292), width: 175, height: 18, label: 'sun-baked ledge' },
  { x: X(690), y: JY(276), width: 165, height: 18, label: 'broken column' },
  { x: X(1180), y: JY(304), width: 150, height: 18, label: 'survey ridge' },
  { x: X(1345), y: JY(270), width: 120, height: 18, label: 'seal approach ledge' },
  { x: X(1640), y: JY(292), width: 180, height: 18, label: 'temple plinth' },
  { x: X(1940), y: JY(246), width: 150, height: 18, label: 'upper step' },
  { x: X(2225), y: JY(204), width: 160, height: 18, label: 'rope shelf', requiresUpgrade: 'rope-launcher' },
  { x: X(2500), y: JY(264), width: 210, height: 18, label: 'mural walkway' },
  { x: X(2715), y: JY(246), width: 145, height: 18, label: 'guardian approach' },
  { x: X(2790), y: JY(222), width: 185, height: 18, label: 'archive ledge' },
  { x: X(3310), y: JY(300), width: 180, height: 18, label: 'catacomb shelf' },
  { x: X(3600), y: JY(252), width: 160, height: 18, label: 'hidden stair', secret: true, requiresUpgrade: 'torch-upgrade' },
  { x: X(3890), y: JY(206), width: 160, height: 18, label: 'torch alcove', secret: true, requiresUpgrade: 'torch-upgrade' },
  { x: X(4200), y: JY(278), width: 210, height: 18, label: 'bone-dry bridge' },
  { x: X(4440), y: JY(252), width: 155, height: 18, label: 'serpent watch ledge' },
  { x: X(4590), y: JY(226), width: 170, height: 18, label: 'relic loft', secret: true, requiresUpgrade: 'historian-vision' },
  { x: X(5160), y: JY(300), width: 160, height: 18, label: 'falling stair' },
  { x: X(5440), y: JY(258), width: 155, height: 18, label: 'escape shelf' },
  { x: X(5740), y: JY(222), width: 155, height: 18, label: 'collapsed arch' },
  { x: X(5965), y: JY(246), width: 140, height: 18, label: 'route warning ledge' },
  { x: X(6045), y: JY(284), width: 180, height: 18, label: 'final run ledge' },
  { x: X(6660), y: JY(302), width: 170, height: 18, label: 'camp overlook' },
  { x: X(6950), y: JY(250), width: 160, height: 18, label: 'secret survey perch', secret: true, requiresUpgrade: 'ancient-compass' },
  { x: X(7075), y: JY(282), width: 145, height: 18, label: 'permit checkpoint' },
  { x: X(7240), y: JY(302), width: 170, height: 18, label: 'last ledge' },
];

export const HAZARDS = [
  { id: 'sealed-sand', name: 'sealed sand', emoji: '!', x: X(1280), y: JY(330), width: 62, height: 30, penalty: { time: 6 }, message: 'A marked patch of sealed sand slowed the approach.' },
  { id: 'loose-temple-floor', name: 'loose temple floor', emoji: '!', x: X(2660), y: JY(330), width: 72, height: 30, penalty: { stamina: 8 }, message: 'Loose temple stones made the guardian route harder.' },
  { id: 'glyph-tripwire', name: 'glyph tripwire', emoji: '!', x: X(4595), y: JY(330), width: 78, height: 30, penalty: { stamina: 8 }, message: 'A glyph tripwire flashed underfoot.' },
  { id: 'warning-rubble', name: 'warning rubble', emoji: '!', x: X(6140), y: JY(324), width: 80, height: 36, penalty: { stamina: 8 }, message: 'Warning rubble narrowed the route.' },
  { id: 'survey-rope', name: 'survey rope', emoji: '!', x: X(7135), y: JY(330), width: 76, height: 30, penalty: { time: 6 }, message: 'Survey ropes slowed the final site access path.' },
  { id: 'thorn-bush', name: 'thorn bush', emoji: '🌿', x: X(560), y: JY(329), width: 54, height: 31, penalty: { stamina: 8 }, message: 'Thorn scrub slowed the team. Stamina reduced.' },
  { id: 'sand-pit', name: 'soft sand', emoji: '⏳', x: X(1060), y: JY(330), width: 92, height: 30, penalty: { time: 10 }, message: 'Soft sand cost the team time.' },
  { id: 'spike-trap', name: 'temple trap', emoji: '🧱', x: X(2050), y: JY(330), width: 70, height: 30, penalty: { stamina: 12 }, message: 'A temple trap clipped your route. Stamina reduced.' },
  { id: 'rolling-stones', name: 'rolling stones', emoji: '🪨', x: X(2925), y: JY(318), width: 70, height: 42, penalty: { stamina: 12, time: 5 }, message: 'Rolling stones forced a scramble.' },
  { id: 'dark-gap', name: 'dark gap', emoji: '⬛', x: X(3460), y: JY(344), width: 90, height: 18, penalty: { stamina: 10 }, message: 'You stumbled in a dark gap.' },
  { id: 'bat-cloud', name: 'bat cloud', emoji: '🦇', x: X(4470), y: JY(244), width: 105, height: 78, penalty: { time: 9 }, message: 'A cloud of bats scattered the team.' },
  { id: 'falling-blocks', name: 'falling blocks', emoji: '🧱', x: X(5350), y: JY(318), width: 90, height: 42, penalty: { stamina: 14 }, message: 'Falling blocks made the escape tense.' },
  { id: 'dust-wave', name: 'dust wave', emoji: '💨', x: X(5960), y: JY(316), width: 130, height: 44, penalty: { time: 12 }, message: 'Dust reduced visibility. Time reduced.' },
  { id: 'loose-slope', name: 'loose slope', emoji: '📉', x: X(6910), y: JY(330), width: 110, height: 30, penalty: { stamina: 10 }, message: 'Loose stones made the final climb harder.' },
];

export const ENEMIES = [
  { id: 'scarab-1', name: 'Scarab', type: 'scarab', emoji: '🐞', x: X(890), y: JY(334), width: 34, height: 26, patrolMin: X(820), patrolMax: X(1040), speed: 80, health: 1, damage: 8, shards: 2 },
  { id: 'snake-1', name: 'Sand Snake', type: 'snake', emoji: '🐍', x: X(1245), y: JY(330), width: 42, height: 30, patrolMin: X(1185), patrolMax: X(1325), speed: 62, health: 1, damage: 10, shards: 2 },
  { id: 'guardian-1', name: 'Stone Guardian', type: 'guardian', emoji: '🗿', x: X(2350), y: JY(318), width: 36, height: 42, patrolMin: X(2240), patrolMax: X(2580), speed: 72, health: 2, damage: 12, shards: 4 },
  { id: 'looter-1', name: 'Rival Looter', type: 'looter', emoji: '👤', x: X(2685), y: JY(318), width: 34, height: 42, patrolMin: X(2600), patrolMax: X(2815), speed: 90, health: 2, damage: 12, shards: 4 },
  { id: 'bat-1', name: 'Temple Bat', type: 'bat', emoji: '🦇', x: X(3700), y: JY(304), width: 34, height: 28, patrolMin: X(3600), patrolMax: X(3870), speed: 118, health: 1, damage: 8, shards: 3, flying: true },
  { id: 'statue-1', name: 'Cursed Statue', type: 'statue', emoji: '🗽', x: X(4700), y: JY(318), width: 42, height: 42, patrolMin: X(4630), patrolMax: X(4860), speed: 56, health: 3, damage: 14, shards: 6 },
  { id: 'scarab-2', name: 'Scarab Swarm', type: 'scarab', emoji: '🐝', x: X(5240), y: JY(334), width: 44, height: 26, patrolMin: X(5140), patrolMax: X(5410), speed: 130, health: 2, damage: 10, shards: 4 },
  { id: 'looter-2', name: 'Rival Looter', type: 'looter', emoji: '👤', x: X(6150), y: JY(318), width: 34, height: 42, patrolMin: X(6070), patrolMax: X(6240), speed: 95, health: 2, damage: 12, shards: 4 },
  { id: 'guardian-2', name: 'Gate Guardian', type: 'guardian', emoji: '🗿', x: X(7180), y: JY(318), width: 38, height: 42, patrolMin: X(7060), patrolMax: X(7350), speed: 78, health: 3, damage: 15, shards: 8 },
];

export const RELIC_SHARDS = [
  310, 455, 620, 820, 980, 1240, 1430, 1660, 1840, 2020, 2265, 2440, 2600, 2835,
  3015, 3260, 3430, 3615, 3765, 3925, 4210, 4360, 4565, 4720, 4890, 5165, 5320,
  5490, 5660, 5835, 6060, 6220, 6400, 6610, 6780, 6965, 7130, 7280, 7425,
].map((x, index) => ({
  id: `shard-${index + 1}`,
  x: X(x),
  y: JY(index % 5 === 0 ? 244 : index % 3 === 0 ? 284 : 320),
  hidden: [17, 18, 19, 24, 25, 36].includes(index + 1),
}));

export const UPGRADES = [
  { id: 'reinforced-boots', name: 'Reinforced Boots', shortName: 'Boots', emoji: '🥾', x: X(1160), y: JY(320), effect: 'Higher jump for temple ledges.' },
  { id: 'rope-launcher', name: 'Rope Launcher', shortName: 'Rope', emoji: '🪝', x: X(2140), y: JY(232), effect: 'One extra mid-air jump to reach optional shelves.' },
  { id: 'torch-upgrade', name: 'Torch Upgrade', shortName: 'Torch', emoji: '🔦', x: X(3345), y: JY(320), effect: 'Reveals darker catacomb routes.' },
  { id: 'historian-vision', name: 'Historian Vision', shortName: 'Vision', emoji: '👁️', x: X(4620), y: JY(190), effect: 'Reveals hidden relic shard clusters.' },
  { id: 'ancient-compass', name: 'Ancient Compass', shortName: 'Compass', emoji: '🧭', x: X(6675), y: JY(320), effect: 'Marks secret rooms near the dig-site entrance.' },
];

export const CHECKPOINTS = [
  { id: 'desert-entry', name: 'Desert Entry', x: X(80), y: JY(282) },
  { id: 'ruined-temple', name: 'Ruined Temple', x: X(1560), y: JY(282) },
  { id: 'catacombs', name: 'Catacombs', x: X(3220), y: JY(282) },
  { id: 'escape-sequence', name: 'Escape Sequence', x: X(5120), y: JY(282) },
  { id: 'dig-site-entrance', name: 'Dig Site Entrance', x: X(6600), y: JY(282) },
];

export const ROUTE_GATES = [
  {
    id: 'desert-seal',
    name: 'Desert Map Seal',
    x: X(1480),
    y: JY(86),
    width: 34,
    height: 274,
    message: 'Complete the desert approach before entering the ruined temple.',
    requires: {
      objective: 'desert-entry',
      miniBoss: 'scarab-queen',
      keyItem: 'brush-handle',
      shards: 4,
    },
  },
  {
    id: 'temple-seal',
    name: 'Temple Route Seal',
    x: X(3090),
    y: JY(86),
    width: 34,
    height: 274,
    message: 'Secure the temple route before entering the catacombs.',
    requires: {
      objective: 'ruined-temple',
      miniBoss: 'temple-guardian',
      keyItem: 'trowel-blade',
      shards: 8,
      upgrades: ['reinforced-boots'],
    },
  },
  {
    id: 'catacomb-seal',
    name: 'Catacomb Route Seal',
    x: X(4985),
    y: JY(86),
    width: 34,
    height: 274,
    message: 'Light and survey the catacombs before the escape path opens.',
    requires: {
      objective: 'catacombs',
      miniBoss: 'giant-serpent',
      keyItem: 'measuring-cord',
      shards: 14,
      upgrades: ['torch-upgrade'],
    },
  },
  {
    id: 'escape-seal',
    name: 'Escape Route Seal',
    x: X(6460),
    y: JY(86),
    width: 34,
    height: 274,
    message: 'Complete the escape route challenge before the dig-site entrance.',
    requires: {
      objective: 'escape-sequence',
      miniBoss: 'looter-captain',
      keyItem: 'field-notebook-clasp',
      shards: 20,
    },
  },
  {
    id: 'basecamp-seal',
    name: 'Base Camp Survey Seal',
    x: X(7950),
    y: JY(86),
    width: 34,
    height: 274,
    message: 'Collect enough route evidence before reporting to Base Camp.',
    requires: {
      objective: 'dig-site-entrance',
      miniBoss: 'ancient-construct',
      keyItem: 'site-permit-seal',
      shards: 22,
      checkpoint: 'dig-site-entrance',
    },
  },
];

export const HIDDEN_ROOMS = [
  { id: 'mural-cache', name: 'Mural Cache', x: X(2220), y: JY(152), width: 260, height: 96, requiresUpgrade: 'rope-launcher' },
  { id: 'torch-alcove', name: 'Torch Alcove', x: X(3560), y: JY(154), width: 420, height: 112, requiresUpgrade: 'torch-upgrade' },
  { id: 'relic-loft', name: 'Relic Loft', x: X(4520), y: JY(154), width: 310, height: 110, requiresUpgrade: 'historian-vision' },
  { id: 'survey-perch', name: 'Survey Perch', x: X(6910), y: JY(198), width: 310, height: 96, requiresUpgrade: 'ancient-compass' },
];

export const LORE_TABLETS = [
  { id: 'tablet-1', x: X(1900), y: JY(214), text: 'Tablet found: temple builders used side passages to protect the site.' },
  { id: 'tablet-2', x: X(3840), y: JY(176), text: 'Tablet found: torchlight reveals careful records, not treasure maps.' },
  { id: 'tablet-3', x: X(7040), y: JY(218), text: 'Tablet found: Base Camp lies beyond the last guardian path.' },
];

export const SECTION_OBJECTIVES = {
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

export const OBJECTIVE_MARKERS = [
  { id: 'map-tablet', sectionId: 'desert-entry', type: 'map-tablet', label: 'Map Tablet', x: X(1185), y: JY(304), color: '#166534' },
  { id: 'switch-1', sectionId: 'ruined-temple', type: 'switch', label: 'Switch 1', x: X(1765), y: JY(320), color: '#92400e' },
  { id: 'switch-2', sectionId: 'ruined-temple', type: 'switch', label: 'Switch 2', x: X(2235), y: JY(320), color: '#92400e' },
  { id: 'switch-3', sectionId: 'ruined-temple', type: 'switch', label: 'Switch 3', x: X(2765), y: JY(320), color: '#92400e' },
  { id: 'glyph-1', sectionId: 'catacombs', type: 'glyph', label: 'Glyph 1', x: X(3445), y: JY(320), color: '#0f766e' },
  { id: 'glyph-2', sectionId: 'catacombs', type: 'glyph', label: 'Glyph 2', x: X(3925), y: JY(320), color: '#0f766e' },
  { id: 'glyph-3', sectionId: 'catacombs', type: 'glyph', label: 'Glyph 3', x: X(4565), y: JY(320), color: '#0f766e' },
  { id: 'escape-beacon', sectionId: 'escape-sequence', type: 'escape', label: 'Escape Marker', x: X(6340), y: JY(320), color: '#b91c1c' },
];

export const MINI_BOSSES = [
  { id: 'scarab-queen', sectionId: 'desert-entry', name: 'Scarab Queen', type: 'scarab', x: X(1395), y: JY(318), width: 58, height: 42, patrolMin: X(1335), patrolMax: X(1460), speed: 66, health: 2, damage: 6, shards: 6, intro: 'Guardian Encounter: Scarab Queen. You will not disturb what the desert has buried.', dialogue: 'You will not disturb what the desert has buried.', domainName: 'Desert Seal Domain', arenaStart: X(1265), arenaEnd: X(1480) },
  { id: 'temple-guardian', sectionId: 'ruined-temple', name: 'Stone Guardian', type: 'guardian', x: X(2960), y: JY(306), width: 54, height: 54, patrolMin: X(2860), patrolMax: X(3060), speed: 58, health: 2, damage: 6, shards: 8, intro: 'Guardian Encounter: Stone Guardian. Only careful investigators may pass this temple.', dialogue: 'Only careful investigators may pass this temple.', domainName: 'Temple Tool Domain', arenaStart: X(2785), arenaEnd: X(3090) },
  { id: 'giant-serpent', sectionId: 'catacombs', name: 'Giant Serpent', type: 'snake', x: X(4860), y: JY(308), width: 72, height: 52, patrolMin: X(4730), patrolMax: X(4965), speed: 70, health: 2, damage: 6, shards: 8, intro: 'Guardian Encounter: Giant Serpent. The catacombs protect their secrets.', dialogue: 'The catacombs protect their secrets.', domainName: 'Catacomb Care Domain', arenaStart: X(4625), arenaEnd: X(4985) },
  { id: 'looter-captain', sectionId: 'escape-sequence', name: 'Rival Looter Captain', type: 'looter', x: X(6330), y: JY(306), width: 54, height: 54, patrolMin: X(6200), patrolMax: X(6435), speed: 86, health: 2, damage: 6, shards: 8, intro: 'Guardian Encounter: Rival Looter Captain. Careful records matter more than speed through this site.', dialogue: 'Careful records matter more than speed through this site.', domainName: 'Field Records Domain', arenaStart: X(6110), arenaEnd: X(6460) },
  { id: 'ancient-construct', sectionId: 'dig-site-entrance', name: 'Ancient Construct', type: 'statue', x: X(7750), y: JY(300), width: 62, height: 60, patrolMin: X(7650), patrolMax: X(7935), speed: 54, health: 3, damage: 7, shards: 10, intro: 'Guardian Encounter: Ancient Construct. No excavation begins until the final seal is restored.', dialogue: 'No excavation begins until the final seal is restored.', domainName: 'Final Site Access Domain', arenaStart: X(7560), arenaEnd: X(7950) },
];

export const BOSS_KEY_ITEMS = [
  { id: 'brush-handle', bossId: 'scarab-queen', gateId: 'desert-seal', sectionId: 'desert-entry', name: 'Brush Handle', shortName: 'Brush', label: 'B', color: '#b45309', rewardDetail: 'This will help uncover fragile evidence during excavation.' },
  { id: 'trowel-blade', bossId: 'temple-guardian', gateId: 'temple-seal', sectionId: 'ruined-temple', name: 'Trowel Blade', shortName: 'Trowel', label: 'T', color: '#92400e', rewardDetail: 'This will help remove soil carefully at the dig site.' },
  { id: 'measuring-cord', bossId: 'giant-serpent', gateId: 'catacomb-seal', sectionId: 'catacombs', name: 'Measuring Cord', shortName: 'Measure', label: 'M', color: '#0f766e', rewardDetail: 'This will help record where evidence was found.' },
  { id: 'field-notebook-clasp', bossId: 'looter-captain', gateId: 'escape-seal', sectionId: 'escape-sequence', name: 'Field Notebook Clasp', shortName: 'Notebook', label: 'N', color: '#b91c1c', rewardDetail: 'This will help keep field records secure during excavation.' },
  { id: 'site-permit-seal', bossId: 'ancient-construct', gateId: 'basecamp-seal', sectionId: 'dig-site-entrance', name: 'Site Permit Seal', shortName: 'Permit', label: 'P', color: '#166534', rewardDetail: 'Base Camp can now open the excavation site.' },
];

export const GUARDIAN_KNOWLEDGE_QUESTIONS = [
  {
    id: 'artefact-meaning',
    question: 'What is an artefact?',
    options: ['A human-made object from the past', 'A modern machine', 'A natural disaster', 'A type of animal bone only'],
    correctIndex: 0,
  },
  {
    id: 'brush-care',
    question: 'Why do archaeologists use tools like brushes?',
    options: ['To uncover evidence carefully without damaging it', 'To make artefacts look newer', 'To move faster through ruins', 'To guess answers quickly'],
    correctIndex: 0,
  },
  {
    id: 'evidence-history',
    question: 'Why is evidence important in history?',
    options: ['It helps historians build explanations about the past', 'It replaces thinking', 'It is only used in science', 'It makes ruins more dangerous'],
    correctIndex: 0,
  },
  {
    id: 'human-remains',
    question: 'What can human remains help archaeologists understand?',
    options: ['Health, diet, age, injury, or burial practices', 'Only a person\'s name', 'The exact words a person spoke', 'Nothing useful'],
    correctIndex: 0,
  },
  {
    id: 'preservation',
    question: 'What does preservation mean?',
    options: ['Something from the past survives over time', 'Something is destroyed quickly', 'Something is copied from a book', 'Something is guessed without evidence'],
    correctIndex: 0,
  },
  {
    id: 'claim-evidence',
    question: 'What should historians do before making a claim?',
    options: ['Look at evidence carefully', 'Guess quickly', 'Ignore small clues', 'Only use one source'],
    correctIndex: 0,
  },
  {
    id: 'primary-source',
    question: 'What is a primary source?',
    options: ['Evidence from the time being studied', 'A modern textbook only', 'A random opinion', 'A made-up story'],
    correctIndex: 0,
  },
  {
    id: 'more-evidence',
    question: 'Why might one artefact not be enough evidence?',
    options: ['More evidence helps make a stronger explanation', 'One artefact is always wrong', 'Artefacts cannot teach us anything', 'Historians do not use artefacts'],
    correctIndex: 0,
  },
  {
    id: 'written-source',
    question: 'What can a written source help historians understand?',
    options: ['Records, beliefs, laws, stories, or messages', 'Only the weather', 'Only what people ate', 'Nothing about the past'],
    correctIndex: 0,
  },
  {
    id: 'excavation',
    question: 'What does excavation mean?',
    options: ['Carefully uncovering and recording remains or artefacts', 'Running through a site quickly', 'Building a new monument', 'Throwing old objects away'],
    correctIndex: 0,
  },
];

export const GUARDIAN_KNOWLEDGE_CHALLENGES = {
  'scarab-queen': ['artefact-meaning', 'brush-care', 'evidence-history'],
  'temple-guardian': ['preservation', 'claim-evidence', 'primary-source'],
  'giant-serpent': ['human-remains', 'more-evidence', 'excavation'],
  'looter-captain': ['written-source', 'claim-evidence', 'more-evidence'],
  'ancient-construct': ['primary-source', 'excavation', 'preservation'],
};

export const SECTION_ATMOSPHERES = {
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

export const STORY_PROPS = [
  { id: 'distant-ruins', sectionId: 'desert-entry', type: 'ruins', x: X(210), y: JY(236), label: 'distant ruins' },
  { id: 'abandoned-camp', sectionId: 'desert-entry', type: 'camp', x: X(970), y: JY(312), label: 'abandoned survey camp' },
  { id: 'temple-door', sectionId: 'ruined-temple', type: 'door', x: X(1518), y: JY(196), label: 'massive temple doors' },
  { id: 'broken-statue', sectionId: 'ruined-temple', type: 'statue', x: X(2380), y: JY(280), label: 'broken guardian statue' },
  { id: 'mural-wall', sectionId: 'ruined-temple', type: 'mural', x: X(2640), y: JY(228), label: 'ancient mural' },
  { id: 'glowing-eyes', sectionId: 'catacombs', type: 'eyes', x: X(3705), y: JY(190), label: 'hidden eyes' },
  { id: 'glyph-wall', sectionId: 'catacombs', type: 'glyphs', x: X(4250), y: JY(230), label: 'glowing glyph wall' },
  { id: 'cracked-bridge', sectionId: 'escape-sequence', type: 'bridge', x: X(5480), y: JY(300), label: 'collapsing bridge' },
  { id: 'warning-sign', sectionId: 'escape-sequence', type: 'sign', x: X(6030), y: JY(306), label: 'warning marker' },
  { id: 'camp-lights', sectionId: 'dig-site-entrance', type: 'lights', x: X(6700), y: JY(268), label: 'excavation lights' },
  { id: 'base-banners', sectionId: 'dig-site-entrance', type: 'banners', x: X(7910), y: JY(244), label: 'base camp banners' },
];

export const ENVIRONMENT_EVENTS = [
  { id: 'sand-gust', sectionId: 'desert-entry', x: X(520), name: 'Sand Gust', message: 'A sheet of sand sweeps across the entry route.', type: 'gust', duration: 2.4, shake: 0.4 },
  { id: 'temple-doors', sectionId: 'ruined-temple', x: X(1530), name: 'Temple Doors', message: 'Ancient doors groan open as the team enters.', type: 'doors', duration: 3.2, shake: 0.7 },
  { id: 'torch-descent', sectionId: 'catacombs', x: X(3240), name: 'Torch-lit Descent', message: 'Blue glyph light flickers deeper underground.', type: 'glyphs', duration: 3.4, shake: 0.35 },
  { id: 'cave-in', sectionId: 'escape-sequence', x: X(5240), name: 'Cave-in Escape', message: 'Rubble falls behind you. Keep moving.', type: 'collapse', duration: 3.6, shake: 1.1 },
  { id: 'camp-overlook', sectionId: 'dig-site-entrance', x: X(6680), name: 'Camp Overlook', message: 'Excavation lights appear beyond the final rise.', type: 'arrival', duration: 3.2, shake: 0.25 },
];

export const BOSS_INTROS = {
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

export const GATE = { x: X(8040), y: JY(282), width: 56, height: 78 };
