import { ROME_GROUND_Y, ROME_VERTICAL_OFFSET, ROME_WORLD_WIDTH, scaleRomeX, ROME_SECTION_IDS } from './romeConstants.js';

const JY = (y) => y + ROME_VERTICAL_OFFSET;
const X = scaleRomeX;

// Rome excavation tools — period-appropriate names
export const ROME_JOURNEY_TOOLS = [
  { id: 'brush',         name: 'Bristle Brush',    emoji: '🖌️', icon: 'B' },
  { id: 'trowel',        name: 'Iron Trowel',       emoji: '⛏️', icon: 'T' },
  { id: 'notebook',      name: 'Field Codex',       emoji: '📓', icon: 'J' },
  { id: 'camera',        name: 'Survey Lens',       emoji: '📷', icon: 'L' },
  { id: 'measuring-tape', name: 'Measuring Chain',  emoji: '📏', icon: 'M' },
  { id: 'field-guide-page', name: 'Wax Tablet',    emoji: '📜', icon: 'P' },
];

// Five acts: Via Sacra → Forum Ruins → Subterranean Thermae → Basilica Interior → Sealed Vault
export const ROME_SECTIONS = [
  {
    id: ROME_SECTION_IDS.VIA_SACRA,
    name: 'Via Sacra',
    start: X(0),
    end: X(2200),
    color: '#e8dcc8',
    accent: '#6b4c2a',
  },
  {
    id: ROME_SECTION_IDS.FORUM_RUINS,
    name: 'Forum Ruins',
    start: X(2200),
    end: X(4100),
    color: '#d4c9b8',
    accent: '#7c5c3a',
  },
  {
    id: ROME_SECTION_IDS.THERMAE,
    name: 'Subterranean Thermae',
    start: X(4100),
    end: X(5900),
    color: '#2e3030',
    accent: '#8b4513',
  },
  {
    id: ROME_SECTION_IDS.BASILICA,
    name: 'Basilica Interior',
    start: X(5900),
    end: X(7400),
    color: '#c8c0b4',
    accent: '#4a3728',
  },
  {
    id: ROME_SECTION_IDS.VAULT,
    name: 'Sealed Vault',
    start: X(7400),
    end: ROME_WORLD_WIDTH,
    color: '#d4e8d4',
    accent: '#1a4a1a',
  },
];

// Tool pickups scattered across the five sections
export const ROME_TOOL_LAYOUT = [
  { id: 'brush',            x: X(240),  y: JY(314) },
  { id: 'trowel',           x: X(680),  y: JY(320) },
  { id: 'notebook',         x: X(2600), y: JY(286) },
  { id: 'camera',           x: X(3700), y: JY(250) },
  { id: 'measuring-tape',   x: X(5100), y: JY(234) },
  { id: 'field-guide-page', x: X(6300), y: JY(230) },
];

// Main ground floors for each section + elevated platforms throughout
export const ROME_PLATFORMS = [
  // Ground floors
  { x: X(0),    y: ROME_GROUND_Y, width: X(2200), height: 60, label: 'via sacra stone road' },
  { x: X(2200), y: ROME_GROUND_Y, width: X(1900), height: 60, label: 'forum paving' },
  { x: X(4100), y: ROME_GROUND_Y, width: X(1800), height: 60, label: 'thermae passages' },
  { x: X(5900), y: ROME_GROUND_Y, width: X(1500), height: 60, label: 'basilica marble' },
  { x: X(7400), y: ROME_GROUND_Y, width: ROME_WORLD_WIDTH - X(7400), height: 60, label: 'vault approach' },

  // Via Sacra — aqueduct arch ledges
  { id: 'via-sacra-low-arch',     x: X(340),  y: JY(280), width: X(180), height: 18, label: 'low aqueduct arch ledge' },
  { id: 'via-sacra-mid-arch',     x: X(480),  y: JY(160), width: X(200), height: 18, label: 'mid aqueduct arch ledge' },
  { id: 'via-sacra-high-arch',    x: X(650),  y: JY(40),  width: X(200), height: 18, label: 'high aqueduct arch ledge' },
  { id: 'via-sacra-milestone',    x: X(900),  y: JY(290), width: X(120), height: 18, label: 'milestone plinth' },
  { id: 'via-sacra-ruin-step-1',  x: X(1200), y: JY(270), width: X(180), height: 18, label: 'collapsed portico step one' },
  { id: 'via-sacra-ruin-step-2',  x: X(1380), y: JY(200), width: X(160), height: 18, label: 'collapsed portico step two' },
  { id: 'via-sacra-gate-ledge',   x: X(1750), y: JY(260), width: X(220), height: 18, label: 'triumphal gate ledge' },

  // Forum Ruins — column stumps and fallen entablatures
  { id: 'forum-column-base-1',    x: X(2350), y: JY(295), width: X(140), height: 18, label: 'column base plinth' },
  { id: 'forum-fallen-column-1',  x: X(2550), y: JY(240), width: X(300), height: 18, label: 'fallen column drum' },
  { id: 'forum-entablature',      x: X(2800), y: JY(110), width: X(360), height: 18, label: 'fallen entablature slab' },
  { id: 'forum-column-base-2',    x: X(3100), y: JY(290), width: X(130), height: 18, label: 'second column base' },
  { id: 'forum-podium-step',      x: X(3300), y: JY(200), width: X(250), height: 18, label: 'forum podium step' },
  { id: 'forum-podium-top',       x: X(3480), y: JY(60),  width: X(300), height: 18, label: 'forum podium top' },
  { id: 'forum-rostrum-edge',     x: X(3750), y: JY(240), width: X(200), height: 18, label: 'rostrum speaking platform' },

  // Subterranean Thermae — narrow ledges over steam channels
  { id: 'thermae-channel-ledge-1', x: X(4200), y: JY(260), width: X(160), height: 18, label: 'steam channel ledge' },
  { id: 'thermae-arch-crown-1',   x: X(4420), y: JY(160), width: X(180), height: 18, label: 'hypocaust arch crown' },
  { id: 'thermae-pillar-cap-1',   x: X(4650), y: JY(280), width: X(100), height: 18, label: 'hypocaust pillar cap' },
  { id: 'thermae-pillar-cap-2',   x: X(4820), y: JY(200), width: X(100), height: 18, label: 'hypocaust pillar cap high' },
  { id: 'thermae-channel-ledge-2', x: X(5000), y: JY(270), width: X(160), height: 18, label: 'wide steam channel ledge' },
  { id: 'thermae-vault-crown',    x: X(5250), y: JY(80),  width: X(250), height: 18, label: 'barrel vault crown' },
  { id: 'thermae-drain-shelf',    x: X(5520), y: JY(260), width: X(180), height: 18, label: 'drain shelf' },

  // Basilica Interior — clerestory ledges and apse platform
  { id: 'basilica-nave-ledge-1',  x: X(6050), y: JY(240), width: X(200), height: 18, label: 'nave side ledge' },
  { id: 'basilica-clerestory-1',  x: X(6280), y: JY(100), width: X(240), height: 18, label: 'clerestory window ledge' },
  { id: 'basilica-nave-ledge-2',  x: X(6600), y: JY(250), width: X(200), height: 18, label: 'nave side ledge far' },
  { id: 'basilica-apse-step',     x: X(6880), y: JY(200), width: X(300), height: 18, label: 'apse approach step' },
  { id: 'basilica-apse-floor',    sceneId: 'basilica-apse', x: X(7050), y: JY(310), width: X(280), height: 18, label: 'apse floor', invisible: true },

  // Sealed Vault — broken staircase and descent ledges
  { id: 'vault-upper-stair-1',    x: X(7500), y: JY(260), width: X(180), height: 18, label: 'broken stair landing one' },
  { id: 'vault-upper-stair-2',    x: X(7720), y: JY(180), width: X(180), height: 18, label: 'broken stair landing two' },
  { id: 'vault-lintel-ledge',     x: X(7950), y: JY(100), width: X(240), height: 18, label: 'vault lintel ledge' },
  { id: 'vault-boss-platform',    sceneId: 'legate-vault', x: X(8400), y: JY(310), width: X(400), height: 18, label: 'legate boss arena floor', invisible: true },
];

// Gates — same concept as Egypt, using Rome-appropriate IDs
export const ROME_GATES = [
  {
    id: 'forum-gate',
    x: X(2150),
    y: JY(130),
    width: 60,
    height: 220,
    requiredKeys: 1,
    label: 'Forum arch gate',
    sectionId: ROME_SECTION_IDS.VIA_SACRA,
  },
  {
    id: 'thermae-gate',
    x: X(4050),
    y: JY(150),
    width: 60,
    height: 220,
    requiredKeys: 2,
    label: 'Thermae descent gate',
    sectionId: ROME_SECTION_IDS.FORUM_RUINS,
  },
  {
    id: 'basilica-gate',
    x: X(5850),
    y: JY(140),
    width: 60,
    height: 220,
    requiredKeys: 3,
    label: 'Basilica entrance gate',
    sectionId: ROME_SECTION_IDS.THERMAE,
  },
  {
    id: 'vault-gate',
    x: X(7350),
    y: JY(120),
    width: 60,
    height: 250,
    requiredKeys: 4,
    label: 'Sealed vault gate',
    sectionId: ROME_SECTION_IDS.BASILICA,
    timelinePuzzleRequired: true,
  },
];

// Evidence shards — collectible artefacts distributed across sections
export const ROME_SHARD_LAYOUT = [
  // Via Sacra
  {
    id: 'shard-milestone-inscription',
    x: X(920),
    y: JY(260),
    sectionId: ROME_SECTION_IDS.VIA_SACRA,
    spriteKey: 'romeSenateTablet',
    label: 'Senate road tablet',
    shortName: 'Senate tablet',
    timelineId: 'republic-founded',
    timelineOrder: 1,
    timelineNotice: 'Evidence: Rome began as a Republic, ruled through elected offices and Senate power.',
  },
  {
    id: 'shard-cobble-seal',
    x: X(1400),
    y: JY(170),
    sectionId: ROME_SECTION_IDS.VIA_SACRA,
    spriteKey: 'romeLawTablet',
    label: 'Law tablet fragment',
    shortName: 'Law tablet',
    timelineId: 'republic-founded',
    timelineOrder: 1,
    timelineNotice: 'Evidence: law and civic duty mattered before one emperor ruled Rome.',
  },
  // Forum Ruins
  {
    id: 'shard-coin-hoard',
    x: X(2580),
    y: JY(215),
    sectionId: ROME_SECTION_IDS.FORUM_RUINS,
    spriteKey: 'romeRomanCoin',
    label: 'Caesar coin hoard',
    shortName: 'Caesar coin',
    timelineId: 'caesar-dictator',
    timelineOrder: 2,
    timelineNotice: 'Evidence: Caesar gathered power as dictator, straining the Republic.',
  },
  {
    id: 'shard-votive-lamp',
    x: X(3100),
    y: JY(265),
    sectionId: ROME_SECTION_IDS.FORUM_RUINS,
    spriteKey: 'romeAugustusCoin',
    label: 'Augustus coin',
    shortName: 'Augustus coin',
    timelineId: 'augustus-emperor',
    timelineOrder: 3,
    timelineNotice: 'Evidence: Augustus became Rome\'s first emperor after civil wars.',
  },
  {
    id: 'shard-bronze-fibula',
    x: X(3500),
    y: JY(35),
    sectionId: ROME_SECTION_IDS.FORUM_RUINS,
    spriteKey: 'romeCaesarStatue',
    label: 'Broken Caesar statue',
    shortName: 'Caesar statue',
    timelineId: 'caesar-dictator',
    timelineOrder: 2,
    timelineNotice: 'Evidence: public statues helped powerful Romans claim loyalty.',
  },
  // Thermae
  {
    id: 'shard-lead-pipe-stamp',
    x: X(4450),
    y: JY(135),
    sectionId: ROME_SECTION_IDS.THERMAE,
    spriteKey: 'romeEmpireMap',
    label: 'Province map plate',
    shortName: 'Province map',
    timelineId: 'empire-expands',
    timelineOrder: 4,
    timelineNotice: 'Evidence: roads, armies and governors pushed Roman rule across provinces.',
  },
  {
    id: 'shard-strigil',
    x: X(5050),
    y: JY(245),
    sectionId: ROME_SECTION_IDS.THERMAE,
    spriteKey: 'romeMilitaryStandard',
    label: 'Legion standard fitting',
    shortName: 'Legion standard',
    timelineId: 'empire-expands',
    timelineOrder: 4,
    timelineNotice: 'Evidence: the army held the Empire together and helped it expand.',
  },
  // Basilica
  {
    id: 'shard-wax-tablet',
    x: X(6310),
    y: JY(75),
    sectionId: ROME_SECTION_IDS.BASILICA,
    spriteKey: 'romeWaxTablet',
    label: 'Wax succession tablet',
    shortName: 'Wax tablet',
    timelineId: 'augustus-emperor',
    timelineOrder: 3,
    timelineNotice: 'Evidence: emperors turned personal authority into an imperial system.',
  },
  {
    id: 'shard-senatorial-seal',
    x: X(6620),
    y: JY(225),
    sectionId: ROME_SECTION_IDS.BASILICA,
    spriteKey: 'romeSplitEmpireTablet',
    label: 'Split Empire tablet',
    shortName: 'Split tablet',
    timelineId: 'empire-splits',
    timelineOrder: 5,
    timelineNotice: 'Evidence: governing the whole Empire became too hard, and power split east and west.',
  },
  // Vault (final, plot-critical — connects to Egypt)
  {
    id: 'shard-egypt-import-record',
    x: X(8200),
    y: JY(285),
    sectionId: ROME_SECTION_IDS.VAULT,
    spriteKey: 'romeScrollBundle',
    label: 'Egypt import scroll',
    shortName: 'Import scroll',
    timelineId: 'empire-splits',
    timelineOrder: 5,
    timelineNotice: 'Evidence: Rome ruled distant provinces, including Egypt, but the system kept changing.',
    critical: true,
  },
];

// Key pickups that unlock gates
export const ROME_KEY_LAYOUT = [
  { id: 'key-via-sacra',   x: X(1820), y: JY(235), unlocksGateId: 'forum-gate' },
  { id: 'key-forum',       x: X(3800), y: JY(215), unlocksGateId: 'thermae-gate' },
  { id: 'key-thermae',     x: X(5560), y: JY(235), unlocksGateId: 'basilica-gate' },
  { id: 'key-basilica',    x: X(7100), y: JY(175), unlocksGateId: 'vault-gate' },
];

// Upgrade drops
export const ROME_UPGRADE_LAYOUT = [
  { id: 'upgrade-roman-sandal',     x: X(760),  y: JY(295), effect: 'movespeed' },
  { id: 'upgrade-gladiator-brace',  x: X(3480), y: JY(35),  effect: 'attack' },
  { id: 'upgrade-legion-shield',    x: X(5270), y: JY(55),  effect: 'defence' },
  { id: 'upgrade-senatorial-ring',  x: X(7150), y: JY(145), effect: 'shard-magnet' },
];

// Enemy spawn zones
export const ROME_ENEMY_SPAWN_ZONES = [
  // Via Sacra — light patrol presence
  { type: 'legionShade',       x: X(600),  y: ROME_GROUND_Y - 36, facing: 1 },
  { type: 'legionShade',       x: X(1100), y: ROME_GROUND_Y - 36, facing: -1 },
  { type: 'forumRat',          x: X(1600), y: ROME_GROUND_Y - 28, facing: 1 },
  { type: 'legionShade',       x: X(1850), y: ROME_GROUND_Y - 36, facing: -1 },

  // Forum Ruins — mixed resistance
  { type: 'legionShade',       x: X(2400), y: ROME_GROUND_Y - 36, facing: 1 },
  { type: 'gladiatorRevenant', x: X(2750), y: ROME_GROUND_Y - 40, facing: -1 },
  { type: 'forumRat',          x: X(2900), y: ROME_GROUND_Y - 28, facing: 1 },
  { type: 'vestibuleWisp',     x: X(3050), y: JY(80),             facing: 1  },
  { type: 'legionShade',       x: X(3350), y: ROME_GROUND_Y - 36, facing: -1 },
  { type: 'gladiatorRevenant', x: X(3700), y: ROME_GROUND_Y - 40, facing: 1  },

  // Subterranean Thermae — dark, tight corridors
  { type: 'forumRat',          x: X(4250), y: ROME_GROUND_Y - 28, facing: 1 },
  { type: 'legionShade',       x: X(4500), y: ROME_GROUND_Y - 36, facing: -1 },
  { type: 'vestibuleWisp',     x: X(4720), y: JY(100),            facing: -1 },
  { type: 'marbleGolem',       x: X(5000), y: ROME_GROUND_Y - 44, facing: 1  },
  { type: 'vestibuleWisp',     x: X(5250), y: JY(55),             facing: 1  },
  { type: 'gladiatorRevenant', x: X(5600), y: ROME_GROUND_Y - 40, facing: -1 },

  // Basilica Interior — heavy guard
  { type: 'gladiatorRevenant', x: X(6100), y: ROME_GROUND_Y - 40, facing: 1 },
  { type: 'marbleGolem',       x: X(6400), y: ROME_GROUND_Y - 44, facing: -1 },
  { type: 'legionShade',       x: X(6700), y: ROME_GROUND_Y - 36, facing: 1  },
  { type: 'gladiatorRevenant', x: X(7000), y: ROME_GROUND_Y - 40, facing: -1 },

  // Sealed Vault — boss antechamber guards
  { type: 'marbleGolem',       x: X(7600), y: ROME_GROUND_Y - 44, facing: 1 },
  { type: 'gladiatorRevenant', x: X(7900), y: ROME_GROUND_Y - 40, facing: -1 },
];

// Boss encounter
export const ROME_BOSS_SPAWN = {
  id: 'rome-legate-revenant',
  x: X(8500),
  y: ROME_GROUND_Y - 60,
  sectionId: ROME_SECTION_IDS.VAULT,
  label: 'Legate Revenant',
};

// Trap zones — marble pressure plates and collapsing columns
export const ROME_TRAP_ZONES = [
  { type: 'pressurePlate', x: X(1300), y: ROME_GROUND_Y - 8, width: X(120), triggersId: 'column-drop-1' },
  { type: 'collapsingColumn', id: 'column-drop-1', x: X(1380), y: JY(40), width: 28, height: 220 },
  { type: 'pressurePlate', x: X(4650), y: ROME_GROUND_Y - 8, width: X(100), triggersId: 'steam-burst-1' },
  { type: 'steamBurst', id: 'steam-burst-1', x: X(4700), y: JY(180), width: 48, height: 180 },
  { type: 'pressurePlate', x: X(7700), y: ROME_GROUND_Y - 8, width: X(120), triggersId: 'vault-trap-1' },
  { type: 'fallingBlock', id: 'vault-trap-1', x: X(7750), y: JY(-60), width: 80, height: 60 },
];

// Secret areas — hidden behind breakable walls or obscure jumps
export const ROME_SECRET_AREAS = [
  {
    id: 'hidden-cistern',
    label: 'Hidden cistern — mosaic floor evidence',
    triggerX: X(1950),
    triggerY: JY(310),
    sectionId: ROME_SECTION_IDS.VIA_SACRA,
    rewardShardId: 'shard-mosaic-tesserae',
  },
  {
    id: 'senator-cryptoporticus',
    label: "Senator's cryptoporticus passage",
    triggerX: X(6890),
    triggerY: JY(280),
    sectionId: ROME_SECTION_IDS.BASILICA,
    rewardShardId: 'shard-personal-seal-ring',
  },
];
