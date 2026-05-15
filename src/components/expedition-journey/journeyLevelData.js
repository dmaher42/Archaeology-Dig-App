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
  { x: X(500), y: JY(306), width: 128, height: 18, label: 'survey marker step' },
  { x: X(360), y: JY(292), width: 175, height: 18, label: 'sun-baked ledge' },
  { x: X(690), y: JY(276), width: 165, height: 18, label: 'broken column' },
  { x: X(800), y: JY(310), width: 112, height: 18, label: 'pottery rest step' },
  { x: X(930), y: JY(286), width: 150, height: 18, label: 'pottery clue ledge' },
  { x: X(1085), y: JY(252), width: 125, height: 18, label: 'upper shard path' },
  { x: X(1180), y: JY(304), width: 150, height: 18, label: 'survey ridge' },
  { x: X(1265), y: JY(286), width: 104, height: 18, label: 'guardian warning step' },
  { x: X(1345), y: JY(270), width: 120, height: 18, label: 'seal approach ledge' },
  { x: X(1555), y: JY(310), width: 118, height: 18, label: 'entry pause step' },
  { x: X(1640), y: JY(292), width: 180, height: 18, label: 'temple plinth' },
  { x: X(1715), y: JY(314), width: 118, height: 18, label: 'fallen block step' },
  { x: X(1815), y: JY(278), width: 150, height: 18, label: 'carved seal step' },
  { x: X(1940), y: JY(246), width: 150, height: 18, label: 'upper step' },
  { x: X(2075), y: JY(226), width: 145, height: 18, label: 'trap bypass ledge' },
  { x: X(2225), y: JY(204), width: 160, height: 18, label: 'rope shelf', requiresUpgrade: 'rope-launcher' },
  { x: X(2310), y: JY(288), width: 118, height: 18, label: 'field note step' },
  { x: X(2445), y: JY(292), width: 155, height: 18, label: 'broken wall step' },
  { x: X(2500), y: JY(264), width: 210, height: 18, label: 'mural walkway' },
  { x: X(2585), y: JY(238), width: 135, height: 18, label: 'upper mural clue' },
  { x: X(2715), y: JY(246), width: 145, height: 18, label: 'guardian approach' },
  { x: X(2840), y: JY(292), width: 122, height: 18, label: 'guardian rest step' },
  { x: X(2790), y: JY(222), width: 185, height: 18, label: 'archive ledge' },
  { x: X(3185), y: JY(312), width: 128, height: 18, label: 'torch entry step' },
  { x: X(3310), y: JY(300), width: 180, height: 18, label: 'catacomb shelf' },
  { x: X(3435), y: JY(286), width: 145, height: 18, label: 'torch safe ledge' },
  { x: X(3545), y: JY(270), width: 118, height: 18, label: 'glyph timing step' },
  { x: X(3600), y: JY(252), width: 160, height: 18, label: 'hidden stair', secret: true, requiresUpgrade: 'torch-upgrade' },
  { x: X(3745), y: JY(236), width: 140, height: 18, label: 'bat bypass shelf' },
  { x: X(3890), y: JY(206), width: 160, height: 18, label: 'torch alcove', secret: true, requiresUpgrade: 'torch-upgrade' },
  { x: X(3990), y: JY(304), width: 120, height: 18, label: 'evidence pause step' },
  { x: X(4060), y: JY(292), width: 160, height: 18, label: 'glyph clue ledge' },
  { x: X(4200), y: JY(278), width: 210, height: 18, label: 'bone-dry bridge' },
  { x: X(4385), y: JY(238), width: 140, height: 18, label: 'serpent warning shelf' },
  { x: X(4440), y: JY(252), width: 155, height: 18, label: 'serpent watch ledge' },
  { x: X(4590), y: JY(226), width: 170, height: 18, label: 'relic loft', secret: true, requiresUpgrade: 'historian-vision' },
  { x: X(4710), y: JY(292), width: 120, height: 18, label: 'guardian boundary step' },
  { x: X(5160), y: JY(300), width: 160, height: 18, label: 'falling stair' },
  { x: X(5205), y: JY(282), width: 155, height: 18, label: 'rubble timing step' },
  { x: X(5315), y: JY(288), width: 118, height: 18, label: 'broken bridge step' },
  { x: X(5440), y: JY(258), width: 155, height: 18, label: 'escape shelf' },
  { x: X(5520), y: JY(238), width: 145, height: 18, label: 'upper escape shard' },
  { x: X(5655), y: JY(276), width: 122, height: 18, label: 'dust timing step' },
  { x: X(5740), y: JY(222), width: 155, height: 18, label: 'collapsed arch' },
  { x: X(5855), y: JY(286), width: 160, height: 18, label: 'dust wave bypass' },
  { x: X(5965), y: JY(246), width: 140, height: 18, label: 'route warning ledge' },
  { x: X(6045), y: JY(284), width: 180, height: 18, label: 'final run ledge' },
  { x: X(6245), y: JY(302), width: 116, height: 18, label: 'rival warning rest' },
  { x: X(6560), y: JY(314), width: 116, height: 18, label: 'base camp entry step' },
  { x: X(6660), y: JY(302), width: 170, height: 18, label: 'camp overlook' },
  { x: X(6760), y: JY(286), width: 155, height: 18, label: 'site boundary rise' },
  { x: X(6865), y: JY(270), width: 118, height: 18, label: 'survey rope ledge' },
  { x: X(6950), y: JY(250), width: 160, height: 18, label: 'secret survey perch', secret: true, requiresUpgrade: 'ancient-compass' },
  { x: X(7045), y: JY(238), width: 145, height: 18, label: 'permit marker perch' },
  { x: X(7075), y: JY(282), width: 145, height: 18, label: 'permit checkpoint' },
  { x: X(7240), y: JY(302), width: 170, height: 18, label: 'last ledge' },
  { x: X(7365), y: JY(268), width: 118, height: 18, label: 'final evidence step' },
  { x: X(7445), y: JY(292), width: 170, height: 18, label: 'guardian approach rest' },
];

export const HAZARDS = [
  { id: 'sealed-sand', name: 'sealed sand', emoji: '!', x: X(1280), y: JY(330), width: 62, height: 30, penalty: { time: 6 }, message: 'A marked patch of sealed sand slowed the approach.' },
  { id: 'loose-temple-floor', name: 'loose temple floor', emoji: '!', x: X(2660), y: JY(330), width: 72, height: 30, penalty: { stamina: 8 }, message: 'Loose temple stones made the guardian route harder.' },
  { id: 'glyph-tripwire', name: 'glyph tripwire', emoji: '!', x: X(4595), y: JY(330), width: 78, height: 30, penalty: { stamina: 8 }, message: 'A glyph tripwire flashed underfoot.' },
  { id: 'warning-rubble', name: 'warning rubble', emoji: '!', x: X(6140), y: JY(324), width: 80, height: 36, penalty: { stamina: 8 }, message: 'Warning rubble narrowed the route.' },
  { id: 'survey-rope', name: 'survey rope', emoji: '!', x: X(7135), y: JY(330), width: 76, height: 30, penalty: { time: 6 }, message: 'Survey ropes slowed the final site access path.' },
  { id: 'desert-low-ridge', name: 'low sand ridge', emoji: '!', x: X(430), y: JY(330), width: 64, height: 30, penalty: { time: 4 }, message: 'A low sand ridge slowed the survey line.' },
  { id: 'thorn-bush', name: 'thorn bush', emoji: '🌿', x: X(560), y: JY(329), width: 54, height: 31, penalty: { stamina: 8 }, message: 'Thorn scrub slowed the team. Stamina reduced.' },
  { id: 'sand-pit', name: 'soft sand', emoji: '⏳', x: X(1060), y: JY(330), width: 92, height: 30, penalty: { time: 10 }, message: 'Soft sand cost the team time.' },
  { id: 'spike-trap', name: 'temple trap', emoji: '🧱', x: X(2050), y: JY(330), width: 70, height: 30, penalty: { stamina: 12 }, message: 'A temple trap clipped your route. Stamina reduced.' },
  { id: 'temple-loose-step', name: 'loose stone step', emoji: '!', x: X(1715), y: JY(330), width: 62, height: 30, penalty: { stamina: 5 }, message: 'A loose stone shifted underfoot.' },
  { id: 'rolling-stones', name: 'rolling stones', emoji: '🪨', x: X(2925), y: JY(318), width: 70, height: 42, penalty: { stamina: 12, time: 5 }, message: 'Rolling stones forced a scramble.' },
  { id: 'dark-gap', name: 'dark gap', emoji: '⬛', x: X(3460), y: JY(344), width: 90, height: 18, penalty: { stamina: 10 }, message: 'You stumbled in a dark gap.' },
  { id: 'catacomb-small-gap', name: 'small dark gap', emoji: '!', x: X(3385), y: JY(344), width: 68, height: 18, penalty: { stamina: 5 }, message: 'A small dark gap broke the safe path.' },
  { id: 'bat-cloud', name: 'bat cloud', emoji: '🦇', x: X(4470), y: JY(244), width: 105, height: 78, penalty: { time: 9 }, message: 'A cloud of bats scattered the team.' },
  { id: 'falling-blocks', name: 'falling blocks', emoji: '🧱', x: X(5350), y: JY(318), width: 90, height: 42, penalty: { stamina: 14 }, message: 'Falling blocks made the escape tense.' },
  { id: 'escape-cracked-step', name: 'cracked bridge step', emoji: '!', x: X(5295), y: JY(326), width: 74, height: 34, penalty: { stamina: 5 }, message: 'A cracked bridge step shifted.' },
  { id: 'dust-wave', name: 'dust wave', emoji: '💨', x: X(5960), y: JY(316), width: 130, height: 44, penalty: { time: 12 }, message: 'Dust reduced visibility. Time reduced.' },
  { id: 'camp-low-rope', name: 'low survey rope', emoji: '!', x: X(6715), y: JY(330), width: 62, height: 30, penalty: { time: 4 }, message: 'A low survey rope slowed the final approach.' },
  { id: 'loose-slope', name: 'loose slope', emoji: '📉', x: X(6910), y: JY(330), width: 110, height: 30, penalty: { stamina: 10 }, message: 'Loose stones made the final climb harder.' },
  { id: 'desert-soft-ridge', name: 'soft sand ridge', emoji: '!', x: X(1125), y: JY(330), width: 86, height: 30, penalty: { time: 6 }, message: 'A soft sand ridge slowed the upper route.' },
  { id: 'temple-floor-crack', name: 'floor crack', emoji: '!', x: X(1885), y: JY(330), width: 70, height: 30, penalty: { stamina: 8 }, message: 'Cracked floor stones shifted underfoot.' },
  { id: 'temple-falling-chip', name: 'falling stone chip', emoji: '!', x: X(2465), y: JY(318), width: 70, height: 42, penalty: { stamina: 8, time: 3 }, message: 'Small stones fell from the temple wall.' },
  { id: 'catacomb-gap-2', name: 'narrow dark gap', emoji: '!', x: X(3665), y: JY(344), width: 90, height: 18, penalty: { stamina: 8 }, message: 'A narrow gap interrupted the catacomb path.' },
  { id: 'catacomb-bat-pocket', name: 'bat pocket', emoji: '!', x: X(4140), y: JY(244), width: 96, height: 76, penalty: { time: 6 }, message: 'A small bat pocket broke the team rhythm.' },
  { id: 'escape-falling-chip', name: 'falling stone chip', emoji: '!', x: X(5610), y: JY(318), width: 86, height: 42, penalty: { stamina: 10 }, message: 'Loose ceiling stones fell near the escape path.' },
  { id: 'escape-dust-pocket', name: 'dust pocket', emoji: '!', x: X(5895), y: JY(316), width: 118, height: 44, penalty: { time: 8 }, message: 'Dust swept across the broken route.' },
  { id: 'dig-site-loose-rope', name: 'loose survey rope', emoji: '!', x: X(6825), y: JY(330), width: 76, height: 30, penalty: { time: 5 }, message: 'Loose survey rope slowed the final approach.' },
  { id: 'dig-site-loose-slope-2', name: 'loose final slope', emoji: '!', x: X(7335), y: JY(330), width: 105, height: 30, penalty: { stamina: 8 }, message: 'Loose stones shifted before the final guardian path.' },
];

export const ENEMIES = [
  { id: 'scarab-dune-1', name: 'Dune Scarab', type: 'scarab', emoji: '🐞', x: X(365), y: JY(334), width: 30, height: 24, patrolMin: X(320), patrolMax: X(435), speed: 52, health: 1, damage: 4, shards: 1 },
  { id: 'scarab-pottery-1', name: 'Pottery Scarab', type: 'scarab', emoji: '🐞', x: X(535), y: JY(334), width: 32, height: 24, patrolMin: X(485), patrolMax: X(620), speed: 58, health: 1, damage: 5, shards: 1 },
  { id: 'scarab-survey-1', name: 'Survey Scarab', type: 'scarab', emoji: '🐞', x: X(625), y: JY(334), width: 30, height: 24, patrolMin: X(585), patrolMax: X(680), speed: 54, health: 1, damage: 4, shards: 1 },
  { id: 'scarab-scout-1', name: 'Scarab Scout', type: 'scarab', emoji: '🐞', x: X(705), y: JY(334), width: 34, height: 26, patrolMin: X(650), patrolMax: X(815), speed: 74, health: 1, damage: 7, shards: 2 },
  { id: 'scarab-1', name: 'Scarab', type: 'scarab', emoji: '🐞', x: X(890), y: JY(334), width: 34, height: 26, patrolMin: X(820), patrolMax: X(1040), speed: 80, health: 1, damage: 8, shards: 2 },
  { id: 'scarab-seal-path-1', name: 'Seal Path Scarab', type: 'scarab', emoji: '🐞', x: X(1095), y: JY(334), width: 32, height: 24, patrolMin: X(1050), patrolMax: X(1160), speed: 56, health: 1, damage: 5, shards: 1 },
  { id: 'snake-1', name: 'Sand Snake', type: 'snake', emoji: '🐍', x: X(1245), y: JY(330), width: 42, height: 30, patrolMin: X(1185), patrolMax: X(1325), speed: 62, health: 1, damage: 10, shards: 2 },
  { id: 'snake-temple-step-1', name: 'Temple Step Snake', type: 'snake', emoji: '🐍', x: X(1705), y: JY(330), width: 40, height: 28, patrolMin: X(1645), patrolMax: X(1785), speed: 56, health: 1, damage: 7, shards: 2 },
  { id: 'snake-temple-1', name: 'Temple Snake', type: 'snake', emoji: '🐍', x: X(1860), y: JY(330), width: 42, height: 30, patrolMin: X(1780), patrolMax: X(1965), speed: 60, health: 1, damage: 9, shards: 2 },
  { id: 'looter-temple-2', name: 'Rival Scout', type: 'looter', emoji: '👤', x: X(2145), y: JY(318), width: 34, height: 42, patrolMin: X(2070), patrolMax: X(2290), speed: 82, health: 2, damage: 10, shards: 3 },
  { id: 'guardian-1', name: 'Stone Guardian', type: 'guardian', emoji: '🗿', x: X(2350), y: JY(318), width: 36, height: 42, patrolMin: X(2240), patrolMax: X(2580), speed: 72, health: 2, damage: 12, shards: 4 },
  { id: 'looter-field-note-1', name: 'Rival Scout', type: 'looter', emoji: '👤', x: X(2440), y: JY(318), width: 34, height: 42, patrolMin: X(2375), patrolMax: X(2525), speed: 70, health: 1, damage: 8, shards: 2 },
  { id: 'looter-1', name: 'Rival Looter', type: 'looter', emoji: '👤', x: X(2685), y: JY(318), width: 34, height: 42, patrolMin: X(2600), patrolMax: X(2815), speed: 90, health: 2, damage: 12, shards: 4 },
  { id: 'bat-torch-entry-1', name: 'Torch Bat', type: 'bat', emoji: '🦇', x: X(3375), y: JY(306), width: 32, height: 26, patrolMin: X(3295), patrolMax: X(3485), speed: 96, health: 1, damage: 6, shards: 2, flying: true },
  { id: 'bat-1', name: 'Temple Bat', type: 'bat', emoji: '🦇', x: X(3700), y: JY(304), width: 34, height: 28, patrolMin: X(3600), patrolMax: X(3870), speed: 118, health: 1, damage: 8, shards: 3, flying: true },
  { id: 'bat-2', name: 'Temple Bat', type: 'bat', emoji: '🦇', x: X(4025), y: JY(304), width: 34, height: 28, patrolMin: X(3930), patrolMax: X(4150), speed: 104, health: 1, damage: 8, shards: 3, flying: true },
  { id: 'snake-catacomb-2', name: 'Catacomb Snake', type: 'snake', emoji: '🐍', x: X(4320), y: JY(330), width: 42, height: 30, patrolMin: X(4240), patrolMax: X(4440), speed: 66, health: 1, damage: 10, shards: 3 },
  { id: 'statue-1', name: 'Cursed Statue', type: 'statue', emoji: '🗽', x: X(4700), y: JY(318), width: 42, height: 42, patrolMin: X(4630), patrolMax: X(4860), speed: 56, health: 3, damage: 14, shards: 6 },
  { id: 'scarab-2', name: 'Scarab Swarm', type: 'scarab', emoji: '🐝', x: X(5240), y: JY(334), width: 44, height: 26, patrolMin: X(5140), patrolMax: X(5410), speed: 130, health: 2, damage: 10, shards: 4 },
  { id: 'scarab-escape-3', name: 'Scarab Swarm', type: 'scarab', emoji: '🐝', x: X(5540), y: JY(334), width: 44, height: 26, patrolMin: X(5455), patrolMax: X(5665), speed: 112, health: 2, damage: 10, shards: 4 },
  { id: 'scarab-dust-1', name: 'Dust Scarab', type: 'scarab', emoji: '🐞', x: X(5790), y: JY(334), width: 34, height: 26, patrolMin: X(5710), patrolMax: X(5895), speed: 86, health: 1, damage: 7, shards: 2 },
  { id: 'looter-2', name: 'Rival Looter', type: 'looter', emoji: '👤', x: X(6150), y: JY(318), width: 34, height: 42, patrolMin: X(6070), patrolMax: X(6240), speed: 95, health: 2, damage: 12, shards: 4 },
  { id: 'looter-camp-lookout-1', name: 'Rival Lookout', type: 'looter', emoji: '👤', x: X(6675), y: JY(318), width: 34, height: 42, patrolMin: X(6605), patrolMax: X(6755), speed: 66, health: 1, damage: 8, shards: 2 },
  { id: 'looter-dig-3', name: 'Rival Surveyor', type: 'looter', emoji: '👤', x: X(6845), y: JY(318), width: 34, height: 42, patrolMin: X(6760), patrolMax: X(6960), speed: 80, health: 2, damage: 10, shards: 4 },
  { id: 'guardian-2', name: 'Gate Guardian', type: 'guardian', emoji: '🗿', x: X(7180), y: JY(318), width: 38, height: 42, patrolMin: X(7060), patrolMax: X(7350), speed: 78, health: 3, damage: 15, shards: 8 },
];

export const CHINA_ENEMIES = [
  { id: 'scarab-scout-1', name: 'River Crab Scout', type: 'river-crab', emoji: 'C', x: X(705), y: JY(334), width: 36, height: 26, patrolMin: X(650), patrolMax: X(815), speed: 74, health: 1, damage: 7, shards: 2 },
  { id: 'scarab-1', name: 'River Crab', type: 'river-crab', emoji: 'C', x: X(890), y: JY(334), width: 36, height: 26, patrolMin: X(820), patrolMax: X(1040), speed: 80, health: 1, damage: 8, shards: 2 },
  { id: 'snake-1', name: 'Mudbank Crab', type: 'river-crab', emoji: 'C', x: X(1245), y: JY(334), width: 38, height: 28, patrolMin: X(1185), patrolMax: X(1325), speed: 62, health: 1, damage: 10, shards: 2 },
  { id: 'snake-temple-1', name: 'Riverbank Crab', type: 'river-crab', emoji: 'C', x: X(1860), y: JY(334), width: 38, height: 28, patrolMin: X(1780), patrolMax: X(1965), speed: 60, health: 1, damage: 9, shards: 2 },
  { id: 'looter-temple-2', name: 'Watchtower Sentry', type: 'watchtower-sentry', emoji: 'S', x: X(2145), y: JY(318), width: 34, height: 42, patrolMin: X(2070), patrolMax: X(2290), speed: 82, health: 2, damage: 10, shards: 3 },
  { id: 'guardian-1', name: 'Bronze Post Guardian', type: 'clay-guardian', emoji: 'G', x: X(2350), y: JY(314), width: 40, height: 46, patrolMin: X(2240), patrolMax: X(2580), speed: 68, health: 2, damage: 12, shards: 4 },
  { id: 'looter-1', name: 'Archive Sentry', type: 'watchtower-sentry', emoji: 'S', x: X(2685), y: JY(318), width: 34, height: 42, patrolMin: X(2600), patrolMax: X(2815), speed: 90, health: 2, damage: 12, shards: 4 },
  { id: 'bat-1', name: 'Watchtower Sentry', type: 'watchtower-sentry', emoji: 'S', x: X(3700), y: JY(318), width: 34, height: 42, patrolMin: X(3600), patrolMax: X(3870), speed: 118, health: 1, damage: 8, shards: 3 },
  { id: 'bat-2', name: 'River Patrol Sentry', type: 'watchtower-sentry', emoji: 'S', x: X(4025), y: JY(318), width: 34, height: 42, patrolMin: X(3930), patrolMax: X(4150), speed: 104, health: 1, damage: 8, shards: 3 },
  { id: 'snake-catacomb-2', name: 'Mudbank Crab', type: 'river-crab', emoji: 'C', x: X(4320), y: JY(334), width: 38, height: 28, patrolMin: X(4240), patrolMax: X(4440), speed: 66, health: 1, damage: 10, shards: 3 },
  { id: 'statue-1', name: 'Clay Guardian Sentry', type: 'clay-guardian', emoji: 'G', x: X(4700), y: JY(312), width: 44, height: 48, patrolMin: X(4630), patrolMax: X(4860), speed: 56, health: 3, damage: 14, shards: 6 },
  { id: 'scarab-2', name: 'River Crab Cluster', type: 'river-crab', emoji: 'C', x: X(5240), y: JY(334), width: 44, height: 26, patrolMin: X(5140), patrolMax: X(5410), speed: 130, health: 2, damage: 10, shards: 4 },
  { id: 'scarab-escape-3', name: 'River Crab Cluster', type: 'river-crab', emoji: 'C', x: X(5540), y: JY(334), width: 44, height: 26, patrolMin: X(5455), patrolMax: X(5665), speed: 112, health: 2, damage: 10, shards: 4 },
  { id: 'looter-2', name: 'Watchtower Sentry', type: 'watchtower-sentry', emoji: 'S', x: X(6150), y: JY(318), width: 34, height: 42, patrolMin: X(6070), patrolMax: X(6240), speed: 95, health: 2, damage: 12, shards: 4 },
  { id: 'looter-dig-3', name: 'Survey Sentry', type: 'watchtower-sentry', emoji: 'S', x: X(6845), y: JY(318), width: 34, height: 42, patrolMin: X(6760), patrolMax: X(6960), speed: 80, health: 2, damage: 10, shards: 4 },
  { id: 'guardian-2', name: 'Rammed-Earth Guardian', type: 'clay-guardian', emoji: 'G', x: X(7180), y: JY(312), width: 44, height: 48, patrolMin: X(7060), patrolMax: X(7350), speed: 70, health: 3, damage: 15, shards: 8 },
];

export const RELIC_SHARDS = [
  310, 455, 520, 620, 820, 980, 1240, 1315, 1430, 1660, 1760, 1840, 2020, 2265, 2360, 2440, 2600, 2835,
  3015, 3260, 3430, 3615, 3765, 3925, 4210, 4360, 4565, 4720, 4890, 5165, 5320,
  5490, 5660, 5710, 5835, 6060, 6220, 6400, 6610, 6780, 6900, 6965, 7130, 7280, 7425,
  935, 1105, 1885, 2090, 2465, 2588, 3450, 3755, 4068, 4395, 5215, 5530, 5865,
  6770, 7055, 7455,
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

export const CHINA_MINI_BOSSES = [
  { id: 'scarab-queen', sectionId: 'desert-entry', name: 'Clay Guardian', type: 'china-guardian', spriteBossId: 'china-clay-guardian', x: X(1395), y: JY(306), width: 58, height: 54, patrolMin: X(1335), patrolMax: X(1460), speed: 66, health: 2, damage: 6, shards: 6, intro: 'Guardian Encounter: Clay Guardian. The river valley path opens only to careful investigators.', dialogue: 'The river valley path opens only to careful investigators.', domainName: 'River Valley Seal Domain', arenaStart: X(1265), arenaEnd: X(1480) },
  { id: 'temple-guardian', sectionId: 'ruined-temple', name: 'Bronze Gate Warden', type: 'china-guardian', spriteBossId: 'china-clay-guardian', x: X(2960), y: JY(306), width: 54, height: 54, patrolMin: X(2860), patrolMax: X(3060), speed: 58, health: 2, damage: 6, shards: 8, intro: 'Guardian Encounter: Bronze Gate Warden. Record the evidence before the archive gate opens.', dialogue: 'Record the evidence before the archive gate opens.', domainName: 'Bronze Gate Domain', arenaStart: X(2785), arenaEnd: X(3090) },
  { id: 'giant-serpent', sectionId: 'catacombs', name: 'Jade Seal Guardian', type: 'china-guardian', spriteBossId: 'china-clay-guardian', x: X(4860), y: JY(306), width: 72, height: 54, patrolMin: X(4730), patrolMax: X(4965), speed: 70, health: 2, damage: 6, shards: 8, intro: 'Guardian Encounter: Jade Seal Guardian. The archive chamber protects its sources.', dialogue: 'The archive chamber protects its sources.', domainName: 'Jade Archive Domain', arenaStart: X(4625), arenaEnd: X(4985) },
  { id: 'looter-captain', sectionId: 'escape-sequence', name: 'Archive Sentry Captain', type: 'china-guardian', spriteBossId: 'china-clay-guardian', x: X(6330), y: JY(306), width: 54, height: 54, patrolMin: X(6200), patrolMax: X(6435), speed: 86, health: 2, damage: 6, shards: 8, intro: 'Guardian Encounter: Archive Sentry Captain. Careful records matter more than rushing the route.', dialogue: 'Careful records matter more than rushing the route.', domainName: 'Field Records Domain', arenaStart: X(6110), arenaEnd: X(6460) },
  { id: 'ancient-construct', sectionId: 'dig-site-entrance', name: 'Rammed-Earth Sentinel', type: 'china-guardian', spriteBossId: 'china-clay-guardian', x: X(7750), y: JY(300), width: 62, height: 60, patrolMin: X(7650), patrolMax: X(7935), speed: 54, health: 3, damage: 7, shards: 10, intro: 'Guardian Encounter: Rammed-Earth Sentinel. Base Camp opens after the final seal is restored.', dialogue: 'Base Camp opens after the final seal is restored.', domainName: 'Final Site Access Domain', arenaStart: X(7560), arenaEnd: X(7950) },
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
  { id: 'half-buried-pottery-marker', sectionId: 'desert-entry', type: 'camp', x: X(420), y: JY(312), label: 'half-buried pottery marker' },
  { id: 'survey-flag-marker', sectionId: 'desert-entry', type: 'sign', x: X(520), y: JY(306), label: 'expedition flag' },
  { id: 'desert-boundary-marker', sectionId: 'desert-entry', type: 'sign', x: X(650), y: JY(306), label: 'ancient boundary marker' },
  { id: 'abandoned-camp', sectionId: 'desert-entry', type: 'camp', x: X(970), y: JY(312), label: 'abandoned survey camp' },
  { id: 'broken-seal-marker', sectionId: 'desert-entry', type: 'statue', x: X(1120), y: JY(286), label: 'broken seal marker' },
  { id: 'desert-evidence-flag', sectionId: 'desert-entry', type: 'sign', x: X(1260), y: JY(306), label: 'look for evidence marker' },
  { id: 'scarab-warning-marker', sectionId: 'desert-entry', type: 'sign', x: X(1360), y: JY(306), label: 'guardian warning marker' },
  { id: 'temple-door', sectionId: 'ruined-temple', type: 'door', x: X(1518), y: JY(196), label: 'massive temple doors' },
  { id: 'temple-entry-flag', sectionId: 'ruined-temple', type: 'sign', x: X(1605), y: JY(306), label: 'entry survey marker' },
  { id: 'carved-stone-clue', sectionId: 'ruined-temple', type: 'mural', x: X(1860), y: JY(238), label: 'carved stone clue' },
  { id: 'temple-pottery-clue', sectionId: 'ruined-temple', type: 'camp', x: X(2295), y: JY(312), label: 'field note cache' },
  { id: 'field-note-marker', sectionId: 'ruined-temple', type: 'sign', x: X(2145), y: JY(306), label: 'field note marker' },
  { id: 'broken-statue', sectionId: 'ruined-temple', type: 'statue', x: X(2380), y: JY(280), label: 'broken guardian statue' },
  { id: 'mural-wall', sectionId: 'ruined-temple', type: 'mural', x: X(2640), y: JY(228), label: 'ancient mural' },
  { id: 'temple-guardian-marker', sectionId: 'ruined-temple', type: 'sign', x: X(2890), y: JY(306), label: 'guardian ahead marker' },
  { id: 'catacomb-entry-marker', sectionId: 'catacombs', type: 'sign', x: X(3195), y: JY(306), label: 'torch path marker' },
  { id: 'torch-clue-marker', sectionId: 'catacombs', type: 'glyphs', x: X(3440), y: JY(230), label: 'torch clue marker' },
  { id: 'glowing-eyes', sectionId: 'catacombs', type: 'eyes', x: X(3705), y: JY(190), label: 'hidden eyes' },
  { id: 'catacomb-pause-marker', sectionId: 'catacombs', type: 'sign', x: X(3985), y: JY(306), label: 'evidence before moving marker' },
  { id: 'catacomb-evidence-marker', sectionId: 'catacombs', type: 'sign', x: X(4020), y: JY(306), label: 'evidence marker' },
  { id: 'glyph-wall', sectionId: 'catacombs', type: 'glyphs', x: X(4250), y: JY(230), label: 'glowing glyph wall' },
  { id: 'serpent-boundary-marker', sectionId: 'catacombs', type: 'sign', x: X(4740), y: JY(306), label: 'guardian territory marker' },
  { id: 'escape-rubble-marker', sectionId: 'escape-sequence', type: 'ruins', x: X(5200), y: JY(236), label: 'fresh rubble fall' },
  { id: 'bridge-survey-flag', sectionId: 'escape-sequence', type: 'sign', x: X(5315), y: JY(306), label: 'bridge survey marker' },
  { id: 'cracked-bridge', sectionId: 'escape-sequence', type: 'bridge', x: X(5480), y: JY(300), label: 'collapsing bridge' },
  { id: 'unstable-route-marker', sectionId: 'escape-sequence', type: 'sign', x: X(5600), y: JY(306), label: 'unstable route marker' },
  { id: 'warning-sign', sectionId: 'escape-sequence', type: 'sign', x: X(6030), y: JY(306), label: 'warning marker' },
  { id: 'captain-warning-marker', sectionId: 'escape-sequence', type: 'sign', x: X(6260), y: JY(306), label: 'rival warning marker' },
  { id: 'camp-lights', sectionId: 'dig-site-entrance', type: 'lights', x: X(6700), y: JY(268), label: 'excavation lights' },
  { id: 'site-boundary-marker', sectionId: 'dig-site-entrance', type: 'sign', x: X(6750), y: JY(306), label: 'site boundary marker' },
  { id: 'safe-survey-pause-marker', sectionId: 'dig-site-entrance', type: 'sign', x: X(6870), y: JY(306), label: 'safe survey pause marker' },
  { id: 'permit-clue-marker', sectionId: 'dig-site-entrance', type: 'banners', x: X(7040), y: JY(252), label: 'permit clue marker' },
  { id: 'construct-warning-marker', sectionId: 'dig-site-entrance', type: 'sign', x: X(7330), y: JY(306), label: 'guardian approach marker' },
  { id: 'final-survey-lights', sectionId: 'dig-site-entrance', type: 'lights', x: X(7505), y: JY(268), label: 'final survey lights' },
  { id: 'base-banners', sectionId: 'dig-site-entrance', type: 'banners', x: X(7910), y: JY(244), label: 'base camp banners' },
];

export const ENVIRONMENT_EVENTS = [
  { id: 'desert-pottery-clue', sectionId: 'desert-entry', x: X(410), name: 'Pottery Marker', message: 'Look for evidence before moving on.', type: 'arrival', duration: 2.2, shake: 0.15 },
  { id: 'sand-gust', sectionId: 'desert-entry', x: X(520), name: 'Sand Gust', message: 'A sheet of sand sweeps across the entry route.', type: 'gust', duration: 2.4, shake: 0.4 },
  { id: 'desert-marker', sectionId: 'desert-entry', x: X(700), name: 'Ancient Marker', message: 'Ancient marks ahead.', type: 'arrival', duration: 2.2, shake: 0.2 },
  { id: 'temple-doors', sectionId: 'ruined-temple', x: X(1530), name: 'Temple Doors', message: 'Ancient doors groan open as the team enters.', type: 'doors', duration: 3.2, shake: 0.7 },
  { id: 'temple-instability', sectionId: 'ruined-temple', x: X(1890), name: 'Temple Instability', message: 'The site is becoming unstable.', type: 'collapse', duration: 2.8, shake: 0.5 },
  { id: 'temple-field-note', sectionId: 'ruined-temple', x: X(2295), name: 'Field Note Cache', message: 'Ancient marks ahead.', type: 'arrival', duration: 2.2, shake: 0.15 },
  { id: 'torch-descent', sectionId: 'catacombs', x: X(3240), name: 'Torch-lit Descent', message: 'Blue glyph light flickers deeper underground.', type: 'glyphs', duration: 3.4, shake: 0.35 },
  { id: 'catacomb-field-note', sectionId: 'catacombs', x: X(3985), name: 'Evidence Marker', message: 'Look for evidence before moving on.', type: 'glyphs', duration: 2.4, shake: 0.2 },
  { id: 'catacomb-warning', sectionId: 'catacombs', x: X(4310), name: 'Guardian Boundary', message: 'Guardian territory begins.', type: 'glyphs', duration: 2.6, shake: 0.35 },
  { id: 'cave-in', sectionId: 'escape-sequence', x: X(5240), name: 'Cave-in Escape', message: 'Rubble falls behind you. Keep moving.', type: 'collapse', duration: 3.6, shake: 1.1 },
  { id: 'bridge-warning', sectionId: 'escape-sequence', x: X(5315), name: 'Broken Bridge', message: 'The site is becoming unstable.', type: 'collapse', duration: 2.4, shake: 0.45 },
  { id: 'escape-warning', sectionId: 'escape-sequence', x: X(5610), name: 'Breaking Route', message: 'The route is breaking apart.', type: 'collapse', duration: 2.8, shake: 0.75 },
  { id: 'camp-overlook', sectionId: 'dig-site-entrance', x: X(6680), name: 'Camp Overlook', message: 'Excavation lights appear beyond the final rise.', type: 'arrival', duration: 3.2, shake: 0.25 },
  { id: 'site-boundary-pause', sectionId: 'dig-site-entrance', x: X(6870), name: 'Site Boundary', message: 'Look for evidence before moving on.', type: 'arrival', duration: 2.2, shake: 0.15 },
  { id: 'final-boundary', sectionId: 'dig-site-entrance', x: X(7330), name: 'Evidence Marker', message: 'Look for evidence before moving on.', type: 'arrival', duration: 2.6, shake: 0.25 },
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

export const isChinaJourneyCivilisation = (targetCivilisation = '') => (
  String(targetCivilisation).toLowerCase().includes('china')
);

export const getJourneyEnemies = (targetCivilisation) => (
  isChinaJourneyCivilisation(targetCivilisation) ? CHINA_ENEMIES : ENEMIES
);

export const getJourneyMiniBosses = (targetCivilisation) => (
  isChinaJourneyCivilisation(targetCivilisation) ? CHINA_MINI_BOSSES : MINI_BOSSES
);

export const GATE = { x: X(8040), y: JY(282), width: 56, height: 78 };
