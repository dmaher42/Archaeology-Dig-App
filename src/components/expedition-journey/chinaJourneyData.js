// Ancient China — Section One journey data.
//
// This module mirrors the export shape consumed by journeyDataRouter.js (the same
// contract Egypt and Rome use). China shares the base journey constants
// (scaleJourneyX / GROUND_Y / JOURNEY_VERTICAL_OFFSET) rather than defining its own,
// so all coordinates below are authored in the shared base-unit space and scaled with X().
//
// Design: a frontier settlement on the edge of an early Great Wall, where the memory of
// Ancient China has fractured and the dynasties (Shang, Zhou, Qin, Han) have scattered
// out of order. Asha gathers the dynasty evidence, opens the hidden archive, claims the
// Imperial Mandate from the archive guardian, and unlocks the sealed Imperial Gate.
//
// Section flow (left -> right):
//   1. yellow-river-frontier  — river-valley entrance, first patrols, first evidence
//   2. rammed-earth-wall      — Great Wall construction, watchtowers, broken wall, Shang bronze
//   3. frontier-settlement    — carts/jars/kilns, Zhou philosophy, hidden archive entrance
//   4. hidden-archive         — the treasure room: Qin + Han evidence, the timeline pedestal
//   5. imperial-gate          — the sealed gate, final guardian, handoff to Imperial China

import { GROUND_Y, JOURNEY_VERTICAL_OFFSET, WORLD_WIDTH, scaleJourneyX } from './journeyConstants.js';

const JY = (y) => y + JOURNEY_VERTICAL_OFFSET;
const X = scaleJourneyX;

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
const CHINA_SECTION_IDS = {
  FRONTIER: 'yellow-river-frontier',
  WALL: 'rammed-earth-wall',
  SETTLEMENT: 'frontier-settlement',
  ARCHIVE: 'hidden-archive',
  GATE: 'imperial-gate',
};

export const CHINA_SECTIONS = [
  { id: CHINA_SECTION_IDS.FRONTIER,   name: 'Yellow River Frontier', start: X(0),    end: X(2300), color: '#d8c197', accent: '#7a5a32' },
  { id: CHINA_SECTION_IDS.WALL,       name: 'Rammed-Earth Wall',     start: X(2300), end: X(4200), color: '#caa06a', accent: '#8a5a28' },
  { id: CHINA_SECTION_IDS.SETTLEMENT, name: 'Frontier Settlement',   start: X(4200), end: X(6000), color: '#bb945c', accent: '#6e4a26' },
  { id: CHINA_SECTION_IDS.ARCHIVE,    name: 'Hidden Archive',        start: X(6000), end: X(7600), color: '#566b60', accent: '#22332b' },
  { id: CHINA_SECTION_IDS.GATE,       name: 'Sealed Imperial Gate',  start: X(7600), end: WORLD_WIDTH, color: '#86603c', accent: '#3a2616' },
];

// ---------------------------------------------------------------------------
// Section atmospheres (full Rome-parity shape so the parallax / haze / particle
// system has everything it needs; `color`/`title`/`description` drive UI copy).
// ---------------------------------------------------------------------------
export const CHINA_SECTION_ATMOSPHERES = {
  [CHINA_SECTION_IDS.FRONTIER]: {
    skyTop:        '#bcd0d0',
    skyBottom:     '#e8dcb8',
    haze:          'rgba(214, 198, 150, 0.20)',
    fogColor:      'rgba(180, 165, 120, 0.16)',
    mood:          'broad Yellow River valley, terraced farmland, soft loess dust',
    color:         '#e6d8b4',
    title:         'The Yellow River Frontier',
    description:   'The river that cradled a civilisation. Terraced fields, a frontier path — and a sealed gate on the far ridge.',
  },
  [CHINA_SECTION_IDS.WALL]: {
    skyTop:        '#c4ad84',
    skyBottom:     '#e0c79a',
    haze:          'rgba(200, 170, 120, 0.22)',
    fogColor:      'rgba(150, 120, 80, 0.20)',
    mood:          'half-built rammed-earth wall, timber scaffolds, watchtower silhouettes',
    color:         '#d8bd90',
    title:         'The Rammed-Earth Wall',
    description:   'A defence against the northern threat, raised one packed layer at a time. The wall does not yet hold.',
  },
  [CHINA_SECTION_IDS.SETTLEMENT]: {
    skyTop:        '#b89868',
    skyBottom:     '#d8b07e',
    haze:          'rgba(190, 150, 100, 0.22)',
    fogColor:      'rgba(120, 90, 60, 0.22)',
    mood:          'frontier market, carts and clay jars, bronze workshop, dusk light',
    color:         '#c8a472',
    title:         'The Frontier Settlement',
    description:   'Carts, kilns and woven baskets. People lived here — and a scholar left ideas behind in the dust.',
  },
  [CHINA_SECTION_IDS.ARCHIVE]: {
    skyTop:        '#1c241f',
    skyBottom:     '#2a352c',
    haze:          'rgba(90, 130, 110, 0.18)',
    fogColor:      'rgba(20, 36, 28, 0.30)',
    mood:          'sealed underground archive, bronze vessels and bamboo slips, lantern glow',
    color:         '#bcd0c4',
    title:         'The Hidden Archive',
    description:   'A buried record room. Bronze, oracle bone, bamboo and coin — the dynasties kept their proof down here.',
  },
  [CHINA_SECTION_IDS.GATE]: {
    skyTop:        '#3a2a1c',
    skyBottom:     '#5c4026',
    haze:          'rgba(200, 160, 110, 0.18)',
    fogColor:      'rgba(40, 26, 14, 0.30)',
    mood:          'great sealed gate, imperial banners, the road into a unified empire',
    color:         '#d8b890',
    title:         'The Sealed Imperial Gate',
    description:   'One emperor, one law, one road. The mandate opens the gate — and the way deeper into Imperial China.',
  },
};

export const CHINA_SECTION_COPY = Object.fromEntries(CHINA_SECTIONS.map((section) => [
  section.id,
  {
    name: section.name,
    title: CHINA_SECTION_ATMOSPHERES[section.id]?.title || section.name,
  },
]));

// ---------------------------------------------------------------------------
// Platforms — ground floors per section + readable elevated routes
// (watchtower ledges, wall steps, scaffolds, archive shelves).
// ---------------------------------------------------------------------------
export const CHINA_PLATFORMS = [
  // Ground floors (one continuous walkable strip, broken into section spans)
  { x: X(0),    y: GROUND_Y, width: X(2300),              height: 60, label: 'river frontier path' },
  { x: X(2300), y: GROUND_Y, width: X(1900),              height: 60, label: 'rammed-earth wall base' },
  { x: X(4200), y: GROUND_Y, width: X(1800),              height: 60, label: 'settlement ground' },
  { x: X(6000), y: GROUND_Y, width: X(1600),              height: 60, label: 'archive floor' },
  { x: X(7600), y: GROUND_Y, width: WORLD_WIDTH - X(7600), height: 60, label: 'imperial approach' },

  // Yellow River Frontier — gentle river-stone terraces (teach jump/route early)
  { id: 'frontier-terrace-1', x: X(420),  y: JY(300), width: X(160), height: 18, label: 'river terrace' },
  { id: 'frontier-terrace-2', x: X(620),  y: JY(230), width: X(150), height: 18, label: 'river terrace high' },
  { id: 'frontier-stone-1',   x: X(820),  y: JY(160), width: X(140), height: 18, label: 'stepping terrace' },
  { id: 'frontier-shrine',    x: X(1040), y: JY(232), width: X(150), height: 18, label: 'river shrine ledge' },
  { id: 'frontier-bank-1',    x: X(1380), y: JY(290), width: X(170), height: 18, label: 'far bank ledge' },
  { id: 'frontier-bank-2',    x: X(1600), y: JY(210), width: X(160), height: 18, label: 'far bank perch' },
  { id: 'frontier-gate-view', x: X(1900), y: JY(150), width: X(180), height: 18, label: 'ridge lookout (imperial gate visible)' },

  // Rammed-Earth Wall — construction steps, scaffolds, broken wall, watchtower
  { id: 'wall-step-1',        x: X(2380), y: JY(300), width: X(160), height: 18, label: 'rammed-earth course one' },
  { id: 'wall-step-2',        x: X(2560), y: JY(220), width: X(150), height: 18, label: 'rammed-earth course two' },
  { id: 'wall-scaffold-1',    x: X(2760), y: JY(130), width: X(170), height: 18, label: 'timber scaffold' },
  { id: 'wall-broken-top',    x: X(3000), y: JY(70),  width: X(220), height: 18, label: 'broken wall crest' },
  { id: 'wall-watchtower',    x: X(3260), y: JY(150), width: X(150), height: 18, label: 'watchtower deck' },
  { id: 'wall-rope-route',    x: X(3520), y: JY(90),  width: X(150), height: 18, label: 'watchtower rope route', hidden: true },
  { id: 'wall-step-3',        x: X(3760), y: JY(250), width: X(170), height: 18, label: 'rammed-earth course three' },
  { id: 'wall-breach-ledge',  x: X(4000), y: JY(180), width: X(180), height: 18, label: 'breach ledge' },

  // Frontier Settlement — cart stacks, kiln roofs, market awnings
  { id: 'settle-cart-1',      x: X(4360), y: JY(300), width: X(150), height: 18, label: 'cart stack' },
  { id: 'settle-roof-1',      x: X(4560), y: JY(210), width: X(170), height: 18, label: 'kiln roof' },
  { id: 'settle-awning-1',    x: X(4800), y: JY(140), width: X(160), height: 18, label: 'market awning' },
  { id: 'settle-scholar',     x: X(5040), y: JY(220), width: X(160), height: 18, label: 'scholar terrace (Zhou)' },
  { id: 'settle-bridge-1',    x: X(5320), y: JY(290), width: X(150), height: 18, label: 'plank bridge' },
  { id: 'settle-bridge-2',    x: X(5560), y: JY(210), width: X(150), height: 18, label: 'plank bridge high' },
  { id: 'settle-archive-lip', x: X(5820), y: JY(300), width: X(180), height: 18, label: 'archive shaft lip' },

  // Hidden Archive — descending shelves and lantern ledges (interior feel)
  { id: 'archive-shelf-1',    sceneId: 'china-archive', x: X(6120), y: JY(260), width: X(180), height: 18, label: 'archive shelf' },
  { id: 'archive-shelf-2',    sceneId: 'china-archive', x: X(6340), y: JY(180), width: X(170), height: 18, label: 'archive shelf high' },
  { id: 'archive-vessel-ledge', sceneId: 'china-archive', x: X(6560), y: JY(250), width: X(160), height: 18, label: 'bronze vessel ledge' },
  { id: 'archive-slip-ledge', sceneId: 'china-archive', x: X(6780), y: JY(160), width: X(170), height: 18, label: 'bamboo slip ledge' },
  { id: 'archive-pedestal',   sceneId: 'china-archive', x: X(7020), y: JY(260), width: X(220), height: 18, label: 'dynasty timeline pedestal' },
  { id: 'archive-coin-ledge', sceneId: 'china-archive', x: X(7280), y: JY(170), width: X(160), height: 18, label: 'Qin coin ledge' },

  // Imperial Gate — banner platforms and the final approach
  { id: 'gate-banner-1',      x: X(7700), y: JY(250), width: X(170), height: 18, label: 'banner platform' },
  { id: 'gate-banner-2',      x: X(7960), y: JY(160), width: X(170), height: 18, label: 'banner platform high' },
  { id: 'gate-final-approach', x: X(8240), y: JY(240), width: X(220), height: 18, label: 'final approach ledge' },
  { id: 'gate-sentinel-floor', sceneId: 'china-gate', x: X(8520), y: JY(310), width: X(360), height: 18, label: 'sentinel arena floor', invisible: true },
];

// ---------------------------------------------------------------------------
// Hazards — readable, themed obstacles (no unfair placement; all clear of the
// main floor line so the safe ground route always exists).
// ---------------------------------------------------------------------------
export const CHINA_HAZARDS = [
  // Frontier — a single early spike pit to teach jumping (with a safe ledge route)
  { id: 'frontier-stake-pit', type: 'spikes', x: X(1180), y: GROUND_Y - 24, width: 120, height: 24, damage: 1,
    respawnX: X(1040), respawnY: JY(232), penalty: { stamina: 8 },
    message: 'Sharpened defence stakes line the riverbank. Jump the pit or take the terrace.' },

  // Rammed-Earth Wall — ancient crossbow (auto-firing trap) covering the scaffold gap
  { id: 'wall-crossbow-1', type: 'arrow-trap', x: X(2900), y: JY(60), width: 32, height: 32, damage: 1,
    interval: 2.6, speed: -420, direction: -1, penalty: { stamina: 8, time: 3 },
    message: 'A wall-mounted crossbow snaps a bolt across the breach. Time your crossing.' },
  // Rammed-Earth Wall — falling construction debris near the broken crest
  { id: 'wall-debris-1', type: 'spikes', x: X(3140), y: GROUND_Y - 24, width: 130, height: 24, damage: 1,
    respawnX: X(3000), respawnY: JY(70), penalty: { stamina: 10 },
    message: 'Loose rammed-earth blocks have shattered across the path. Mind the rubble.' },

  // Settlement — a second crossbow guarding the bronze workshop approach
  { id: 'settle-crossbow-1', type: 'arrow-trap', x: X(4720), y: JY(70), width: 32, height: 32, damage: 1,
    interval: 2.4, speed: -440, direction: -1, penalty: { stamina: 8, time: 3 },
    message: 'A frontier crossbow guards the workshop. Slip past between shots.' },

  // Archive — narrow stake gap on the descent (rewards careful platforming)
  { id: 'archive-stake-1', type: 'spikes', x: X(6660), y: GROUND_Y - 24, width: 120, height: 24, damage: 1,
    respawnX: X(6560), respawnY: JY(250), penalty: { stamina: 10 },
    message: 'A collapsed archive trap. Use the shelves above to cross.' },
];

// ---------------------------------------------------------------------------
// Route gates — the wall breach (paced) and the sealed Imperial Gate (climax).
// ---------------------------------------------------------------------------
export const CHINA_ROUTE_GATES = [
  {
    id: 'wall-breach-seal',
    name: 'Wall Breach Seal',
    x: X(4160),
    y: JY(86),
    width: 34,
    height: 274,
    message: 'The breach in the rammed-earth wall is sealed by drifting memory. Recover 6 relic fragments to steady it.',
    readyHint: 'The breach steadies. Cross into the settlement.',
    openMessage: 'The wall remembers its builders. The breach opens.',
    requires: {
      shards: 6,
    },
  },
  {
    id: 'imperial-gate-seal',
    name: 'Sealed Imperial Gate',
    x: X(7560),
    y: JY(70),
    width: 40,
    height: 290,
    message: 'The Sealed Imperial Gate will not yield. Claim the Imperial Mandate from the Archive Sentry Captain and gather 10 fragments.',
    readyHint: 'The mandate answers. The great gate grinds open.',
    openMessage: 'One emperor. One law. One road. The Imperial Gate opens.',
    requires: {
      keyItem: 'qin-imperial-mandate',
      shards: 10,
    },
  },
];

export const CHINA_ROUTE_GATE_DOORWAYS = [];

// ---------------------------------------------------------------------------
// Opening trigger — the awakening of the frontier guardian network
// (mirrors Egypt's scarab-seal / Rome's presence trigger shape exactly).
// bossId references a real China boss sprite so the encounter renders.
// ---------------------------------------------------------------------------
export const CHINA_SCARAB_SEAL_TRIGGER = {
  id: 'frontier-mandate-trigger',
  sectionId: CHINA_SECTION_IDS.FRONTIER,
  // Mini-boss id (matches CHINA_MINI_BOSSES[0] — the China-skinned Clay River Guardian).
  bossId: 'scarab-queen',
  name: 'The Frontier Mandate',
  x: X(125),
  y: JY(-117),
  width: 160,
  height: 90,
  eventName: 'Clay River Guardian',
  eventType: 'shrine-glow',
  shake: 0.16,
  duration: 29.0,
  sealEmphasisMessage: 'The frontier guardian network stirs. The memory of China is awake — and watching.',
  sealPulseLabel: 'FRONTIER MANDATE',
  sealPulseRadius: 76,
  sealPulseDuration: 0.95,
  cameraRevealDuration: 1.8,
  objectiveEchoLine: 'The dynasties have fallen out of order. Gather their evidence and restore the line.',
  firstShardEchoLine: 'First fragment of the record restored.',
  messages: [
    'You walk the river that raised an empire. The dynasties are scattered.',
    'Shang, Zhou, Qin, Han — out of order, and the gate will not open.',
    'Gather the proof. Restore the line. Earn the mandate.',
  ],
  dialogueSpeakers: [
    'Guardian Network',
    'Guardian Network',
    'Guardian Network',
  ],
  dialogueTiming: [0.8, 3.3, 6.3],
  stairwellRevealLine: 'The riverbank parts to reveal the path along the wall.',
  bossIntroLine: 'The clay remembers the river. The guardian awakens. Prove your worth.',
  guideFollowUpLine: 'Recover the dynasty evidence and survive the frontier.',
};

// ---------------------------------------------------------------------------
// Tools — archaeology kit pickups (ids must exist in the shared JOURNEY_TOOLS set).
// ---------------------------------------------------------------------------
export const CHINA_JOURNEY_TOOLS = [
  { id: 'brush', name: 'Soft Bamboo Brush', emoji: 'B', icon: 'B' },
  { id: 'trowel', name: 'Rammed-Earth Trowel', emoji: 'T', icon: 'T' },
  { id: 'notebook', name: 'Bamboo Field Notes', emoji: 'J', icon: 'J' },
  { id: 'camera', name: 'Survey Lens', emoji: 'L', icon: 'L' },
  { id: 'measuring-tape', name: 'River Measuring Cord', emoji: 'M', icon: 'M' },
  { id: 'field-guide-page', name: 'Dynasty Field Guide', emoji: 'D', icon: 'D' },
];

export const CHINA_TOOL_LAYOUT = [
  { id: 'brush',    x: X(320),  y: JY(314) },
  { id: 'trowel',   x: X(900),  y: JY(320) },
  { id: 'notebook', x: X(2480), y: JY(300) },
];

// ---------------------------------------------------------------------------
// Relic shards — collectible evidence fragments distributed across the run.
// Final shape (id/x/y/hidden/routeId) so the router can use them directly.
// ---------------------------------------------------------------------------
const CHINA_SHARD_LAYOUT = [
  // Frontier
  { x: 240,  y: 320 }, { x: 470, y: 296 }, { x: 660, y: 226 }, { x: 880, y: 156 },
  { x: 1120, y: 320 }, { x: 1420, y: 286 }, { x: 1640, y: 206 },
  // Rammed-Earth Wall
  { x: 2420, y: 296 }, { x: 2620, y: 216 }, { x: 2820, y: 126 }, { x: 3060, y: 66 },
  { x: 3320, y: 146 }, { x: 3560, y: 86, hidden: true, routeId: 'china-watchtower-rope-route' },
  { x: 3820, y: 246 }, { x: 4040, y: 176 },
  // Settlement
  { x: 4420, y: 296 }, { x: 4620, y: 206 }, { x: 4860, y: 136 }, { x: 5100, y: 216 },
  { x: 5380, y: 286 }, { x: 5600, y: 206 },
  // Hidden Archive
  { x: 6180, y: 256 }, { x: 6400, y: 176 }, { x: 6620, y: 246 }, { x: 6840, y: 156 },
  { x: 7080, y: 256, hidden: true, routeId: 'china-cracked-wall-archive' }, { x: 7320, y: 166 },
  // Imperial Gate approach
  { x: 7760, y: 246 }, { x: 8020, y: 156 }, { x: 8300, y: 236 },
  { x: 8460, y: 206, hidden: true, routeId: 'china-hidden-scroll-perch' },
];

export const CHINA_RELIC_SHARD_LAYOUT = CHINA_SHARD_LAYOUT.map((entry, index) => ({
  id: `china-shard-${index + 1}`,
  x: X(entry.x),
  y: JY(entry.y),
  hidden: Boolean(entry.hidden),
  routeId: entry.routeId || null,
}));

// ---------------------------------------------------------------------------
// Boss key items — dynasty mandates, one per guardian (mirrors Egypt's 5-key
// boss-drop structure). The Qin Imperial Mandate opens the Imperial Gate.
// ---------------------------------------------------------------------------
export const CHINA_BOSS_KEY_ITEMS = [
  {
    id: 'river-jade-token', bossId: 'scarab-queen', gateId: null, sectionId: CHINA_SECTION_IDS.FRONTIER,
    name: 'River Jade Token', shortName: 'Jade', label: 'J', color: '#3a7d6e',
    rewardDetail: 'Proof the Yellow River valley cradled the first Chinese settlements.',
  },
  {
    id: 'shang-bronze-ladle', bossId: 'temple-guardian', gateId: null, sectionId: CHINA_SECTION_IDS.WALL,
    name: 'Shang Bronze Ladle', shortName: 'Bronze', label: 'B', color: '#9a6b2f',
    rewardDetail: 'Shang bronze-casting skill — and the earliest Chinese writing on the handle.',
  },
  {
    id: 'zhou-mandate-scroll', bossId: 'giant-serpent', gateId: null, sectionId: CHINA_SECTION_IDS.SETTLEMENT,
    name: 'Zhou Mandate Scroll', shortName: 'Scroll', label: 'Z', color: '#7a5230',
    rewardDetail: 'Zhou ideas — Confucian order and the Taoist way — written on silk.',
  },
  {
    id: 'qin-imperial-mandate', bossId: 'looter-captain', gateId: 'imperial-gate-seal', sectionId: CHINA_SECTION_IDS.ARCHIVE,
    name: 'Qin Imperial Mandate', shortName: 'Mandate', label: 'Q', color: '#b8860b',
    rewardDetail: 'Qin Shi Huang\'s mandate: one law, one script, one coin. This opens the Imperial Gate.',
    routeOpenMessage: 'The Archive Sentry Captain falls. The Qin Imperial Mandate is yours. The sealed gate answers.',
  },
  {
    id: 'han-invention-compass', bossId: 'ancient-construct', gateId: null, sectionId: CHINA_SECTION_IDS.GATE,
    name: 'Han Invention Compass', shortName: 'Compass', label: 'H', color: '#1f6f5c',
    rewardDetail: 'Han ingenuity — the south-pointing compass, paper, steel and porcelain.',
  },
];

// ---------------------------------------------------------------------------
// Dynasty evidence + timeline puzzle data.
// These four pieces are the heart of the embedded learning: the player gathers
// them through the level, then restores Shang -> Zhou -> Qin -> Han order at the
// climax (DynastyTimelinePuzzle). `order` is the correct chronological index.
// ---------------------------------------------------------------------------
export const CHINA_DYNASTY_TIMELINE = [
  {
    id: 'shang',
    order: 0,
    dynasty: 'Shang Dynasty',
    period: 'c. 1600–1046 BCE',
    evidenceName: 'Bronze Ritual Vessel & Oracle Bone',
    icon: 'bronze',
    sectionId: CHINA_SECTION_IDS.WALL,
    clue: 'Cast bronze and the earliest Chinese writing, scratched onto an oracle bone.',
    teach: 'The Shang are known for bronze-working and the first Chinese writing.',
  },
  {
    id: 'zhou',
    order: 1,
    dynasty: 'Zhou Dynasty',
    period: 'c. 1046–256 BCE',
    evidenceName: 'Philosophy Scroll',
    icon: 'scroll',
    sectionId: CHINA_SECTION_IDS.SETTLEMENT,
    clue: 'A silk scroll of Confucian order and the Taoist way of nature.',
    teach: 'The Zhou era gave China its great philosophies — Confucianism and Taoism.',
  },
  {
    id: 'qin',
    order: 2,
    dynasty: 'Qin Dynasty',
    period: '221–206 BCE',
    evidenceName: 'Ban Liang Coin & Law Tablet',
    icon: 'coin',
    sectionId: CHINA_SECTION_IDS.ARCHIVE,
    clue: 'One round coin and one law tablet — the same across the whole empire.',
    teach: 'Qin Shi Huang unified China with one law, one script and one currency.',
  },
  {
    id: 'han',
    order: 3,
    dynasty: 'Han Dynasty',
    period: '206 BCE–220 CE',
    evidenceName: 'Compass, Paper & Porcelain',
    icon: 'compass',
    sectionId: CHINA_SECTION_IDS.GATE,
    clue: 'Inventions that outlived the empire: paper, the compass, steel, porcelain.',
    teach: 'The Han built lasting Chinese identity through inventions and long rule.',
  },
];

// ---------------------------------------------------------------------------
// Story props — inspectable, dynasty-evidence anchors with short discoveries.
// The main dynasty evidence now uses standalone China artefact PNGs from the
// asset manifest while preserving the existing inspect text and hitboxes.
// ---------------------------------------------------------------------------
export const CHINA_STORY_PROPS = [
  {
    id: 'china-frontier-path-strip-river',
    x: X(520), y: GROUND_Y + 48, width: 512, height: 140, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Yellow River loess path strip', type: 'image-prop',
    imageAssetKey: 'chinaFrontierPathStripRiver',
    assetPath: 'assets/expedition/environment/china-river-valley/china-frontier-path-strip.png',
    depth: 'route-edge', layer: 'route-edge', assetContactYRatio: 1, groundPlaneY: GROUND_Y + 48,
    colorGradeFilter: 'none', shadowOpacity: 0, sandOverlapHeight: 0, zIndex: -80,
  },
  {
    id: 'china-frontier-path-strip-bank',
    x: X(1500), y: GROUND_Y + 48, width: 512, height: 140, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Yellow River bank path strip', type: 'image-prop',
    imageAssetKey: 'chinaFrontierPathStripBank',
    assetPath: 'assets/expedition/environment/china-river-valley/china-frontier-path-strip.png',
    depth: 'route-edge', layer: 'route-edge', assetContactYRatio: 1, groundPlaneY: GROUND_Y + 48,
    colorGradeFilter: 'none', shadowOpacity: 0, sandOverlapHeight: 0, zIndex: -80,
  },
  {
    id: 'frontier-river-marker',
    x: X(360), y: GROUND_Y - 20, width: 64, height: 32, hitboxWidth: 84, hitboxHeight: 64,
    label: 'Yellow River Boundary Stone', sprite: 'buriedCarvedHead',
    messages: [
      'A boundary stone, carved where the Yellow River floods each spring.',
      'The silt it leaves is gold for farmers. This is where China began.',
    ],
    speakers: ['Asha', 'Asha'],
  },
  {
    id: 'china-interaction-marker-river-stone',
    x: X(360), y: GROUND_Y - 70, width: 74, height: 74, hitboxWidth: 0, hitboxHeight: 0,
    label: 'China interaction marker - river stone', type: 'image-prop',
    imageAssetKey: 'chinaInteractionMarkerRiverStone',
    assetPath: 'assets/expedition/ui/china/china-interaction-marker.png',
    depth: 'midground', layer: 'midground', assetContactYRatio: 0.5,
    colorGradeFilter: 'none', shadowOpacity: 0, alpha: 0.62, zIndex: 18,
  },
  {
    id: 'china-frontier-path-strip-wall',
    x: X(2760), y: GROUND_Y + 48, width: 512, height: 140, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Rammed-earth wall path strip', type: 'image-prop',
    imageAssetKey: 'chinaFrontierPathStripWall',
    assetPath: 'assets/expedition/environment/china-river-valley/china-frontier-path-strip.png',
    depth: 'route-edge', layer: 'route-edge', assetContactYRatio: 1, groundPlaneY: GROUND_Y + 48,
    colorGradeFilter: 'none', shadowOpacity: 0, sandOverlapHeight: 0, zIndex: -80,
  },
  {
    id: 'china-watchtower-landmark',
    x: X(3340), y: GROUND_Y, width: 270, height: 405, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Rammed-earth watchtower landmark', type: 'image-prop',
    imageAssetKey: 'chinaWatchtower',
    assetPath: 'assets/expedition/environment/china-river-valley/china-watchtower.png',
    depth: 'midground', layer: 'midground', assetContactYRatio: 1, groundPlaneY: GROUND_Y,
    colorGradeFilter: 'none', shadowOpacity: 0.2, sandOverlapHeight: 6, sandMoundWidth: 160, zIndex: -24,
  },
  {
    id: 'china-crossbow-trap-wall-art',
    x: X(2900), y: JY(78), width: 86, height: 86, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Wall-mounted crossbow trap art', type: 'image-prop',
    imageAssetKey: 'chinaCrossbowTrapWall',
    assetPath: 'assets/expedition/environment/china-river-valley/china-crossbow-trap.png',
    depth: 'midground', layer: 'midground', assetContactYRatio: 0.5,
    colorGradeFilter: 'none', shadowOpacity: 0, zIndex: 12,
  },
  {
    id: 'china-falling-debris-wall-art',
    x: X(3150), y: GROUND_Y - 8, width: 92, height: 92, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Falling rammed-earth debris art', type: 'image-prop',
    imageAssetKey: 'chinaFallingDebrisWall',
    assetPath: 'assets/expedition/environment/china-river-valley/china-falling-debris.png',
    depth: 'grounded', layer: 'grounded', assetContactYRatio: 1, groundPlaneY: GROUND_Y - 8,
    colorGradeFilter: 'none', shadowOpacity: 0.1, sandOverlapHeight: 5, sandMoundWidth: 78, zIndex: 14,
  },
  {
    id: 'wall-shang-bronze',
    x: X(2700), y: GROUND_Y - 22, width: 78, height: 78, hitboxWidth: 90, hitboxHeight: 70,
    label: 'Shang Bronze Ritual Vessel', type: 'image-prop',
    imageAssetKey: 'chinaShangBronzeVessel',
    assetPath: 'assets/expedition/artefacts/china/china-artefact-shang-bronze-vessel.png',
    depth: 'grounded', layer: 'grounded', assetContactYRatio: 1, groundPlaneY: GROUND_Y,
    colorGradeFilter: 'none', shadowOpacity: 0.14, sandOverlapHeight: 4, sandMoundWidth: 72,
    dynastyId: 'shang',
    messages: [
      'A bronze ritual vessel — Shang work, over three thousand years old.',
      'Tiny marks ring the rim: some of the earliest Chinese writing.',
    ],
    speakers: ['Asha', 'Asha'],
  },
  {
    id: 'china-interaction-marker-shang',
    x: X(2700), y: GROUND_Y - 88, width: 78, height: 78, hitboxWidth: 0, hitboxHeight: 0,
    label: 'China interaction marker - Shang bronze', type: 'image-prop',
    imageAssetKey: 'chinaInteractionMarkerShang',
    assetPath: 'assets/expedition/ui/china/china-interaction-marker.png',
    depth: 'midground', layer: 'midground', assetContactYRatio: 0.5,
    colorGradeFilter: 'none', shadowOpacity: 0, alpha: 0.58, zIndex: 18,
  },
  {
    id: 'wall-oracle-bone',
    x: X(3300), y: GROUND_Y - 16, width: 68, height: 52, hitboxWidth: 80, hitboxHeight: 60,
    label: 'Cracked Oracle Bone', type: 'image-prop',
    imageAssetKey: 'chinaOracleBone',
    assetPath: 'assets/expedition/artefacts/china/china-artefact-oracle-bone.png',
    depth: 'grounded', layer: 'grounded', assetContactYRatio: 1, groundPlaneY: GROUND_Y,
    colorGradeFilter: 'none', shadowOpacity: 0.11, sandOverlapHeight: 3, sandMoundWidth: 62,
    dynastyId: 'shang',
    messages: [
      'A cracked ox bone. Heat split it, and a Shang diviner read the answer in the cracks.',
      'The scratched symbols are ancestors of the characters still written today.',
    ],
    speakers: ['Asha', 'Asha'],
  },
  {
    id: 'china-broken-wall-breach-art',
    x: X(4160), y: GROUND_Y + 2, width: 520, height: 346, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Broken rammed-earth breach art', type: 'image-prop',
    imageAssetKey: 'chinaBrokenWallBreach',
    assetPath: 'assets/expedition/environment/china-river-valley/china-broken-wall.png',
    depth: 'midground', layer: 'midground', assetContactYRatio: 1, groundPlaneY: GROUND_Y + 2,
    colorGradeFilter: 'none', shadowOpacity: 0.12, sandOverlapHeight: 7, sandMoundWidth: 260, zIndex: -18,
  },
  {
    id: 'china-frontier-path-strip-settlement',
    x: X(4560), y: GROUND_Y + 48, width: 512, height: 140, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Frontier settlement path strip', type: 'image-prop',
    imageAssetKey: 'chinaFrontierPathStripSettlement',
    assetPath: 'assets/expedition/environment/china-river-valley/china-frontier-path-strip.png',
    depth: 'route-edge', layer: 'route-edge', assetContactYRatio: 1, groundPlaneY: GROUND_Y + 48,
    colorGradeFilter: 'none', shadowOpacity: 0, sandOverlapHeight: 0, zIndex: -80,
  },
  {
    id: 'china-crossbow-trap-settlement-art',
    x: X(4720), y: JY(88), width: 84, height: 84, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Settlement crossbow trap art', type: 'image-prop',
    imageAssetKey: 'chinaCrossbowTrapSettlement',
    assetPath: 'assets/expedition/environment/china-river-valley/china-crossbow-trap.png',
    depth: 'midground', layer: 'midground', assetContactYRatio: 0.5,
    colorGradeFilter: 'none', shadowOpacity: 0, zIndex: 12,
  },
  {
    id: 'settle-zhou-scroll',
    x: X(5040), y: GROUND_Y - 18, width: 74, height: 60, hitboxWidth: 84, hitboxHeight: 64,
    label: 'Zhou Philosophy Scroll', type: 'image-prop',
    imageAssetKey: 'chinaZhouScroll',
    assetPath: 'assets/expedition/artefacts/china/china-artefact-zhou-scroll.png',
    depth: 'grounded', layer: 'grounded', assetContactYRatio: 1, groundPlaneY: GROUND_Y,
    colorGradeFilter: 'none', shadowOpacity: 0.11, sandOverlapHeight: 3, sandMoundWidth: 64,
    dynastyId: 'zhou',
    messages: [
      'A scholar\'s scroll from the Zhou age.',
      'One side teaches Confucian respect and order; the other, the Taoist way of nature.',
    ],
    speakers: ['Asha', 'Asha'],
  },
  {
    id: 'china-interaction-marker-zhou',
    x: X(5040), y: GROUND_Y - 82, width: 76, height: 76, hitboxWidth: 0, hitboxHeight: 0,
    label: 'China interaction marker - Zhou scroll', type: 'image-prop',
    imageAssetKey: 'chinaInteractionMarkerZhou',
    assetPath: 'assets/expedition/ui/china/china-interaction-marker.png',
    depth: 'midground', layer: 'midground', assetContactYRatio: 0.5,
    colorGradeFilter: 'none', shadowOpacity: 0, alpha: 0.58, zIndex: 18,
  },
  {
    id: 'china-frontier-path-strip-archive-entry',
    x: X(5900), y: GROUND_Y + 48, width: 512, height: 140, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Archive entry path strip', type: 'image-prop',
    imageAssetKey: 'chinaFrontierPathStripArchiveEntry',
    assetPath: 'assets/expedition/environment/china-river-valley/china-frontier-path-strip.png',
    depth: 'route-edge', layer: 'route-edge', assetContactYRatio: 1, groundPlaneY: GROUND_Y + 48,
    colorGradeFilter: 'none', shadowOpacity: 0, sandOverlapHeight: 0, zIndex: -80,
  },
  {
    id: 'china-archive-interior-backdrop',
    x: X(6800), y: GROUND_Y + 16, width: 1600, height: 562, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Hidden archive interior backdrop', type: 'image-prop',
    imageAssetKey: 'chinaArchiveInterior',
    assetPath: 'assets/expedition/backgrounds/china-archive/china-archive-interior.png',
    depth: 'background', layer: 'background', assetContactYRatio: 1, groundPlaneY: GROUND_Y + 16,
    colorGradeFilter: 'none', shadowOpacity: 0, sandOverlapHeight: 0, alpha: 0.92, zIndex: -120,
  },
  {
    id: 'china-archive-foreground-props-art',
    x: X(6810), y: GROUND_Y + 12, width: 680, height: 510, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Hidden archive foreground props', type: 'image-prop',
    imageAssetKey: 'chinaArchiveForegroundProps',
    assetPath: 'assets/expedition/environment/china-archive/china-archive-foreground-props.png',
    depth: 'midground', layer: 'midground', assetContactYRatio: 1, groundPlaneY: GROUND_Y + 12,
    colorGradeFilter: 'none', shadowOpacity: 0.08, sandOverlapHeight: 3, sandMoundWidth: 220, alpha: 0.82, zIndex: -16,
  },
  {
    id: 'archive-record-chest',
    x: X(6325), y: GROUND_Y - 14, width: 98, height: 78, hitboxWidth: 90, hitboxHeight: 58,
    label: 'Archive Record Chest', type: 'image-prop',
    imageAssetKey: 'chinaArchiveChest',
    assetPath: 'assets/expedition/artefacts/china/china-archive-chest.png',
    depth: 'grounded', layer: 'grounded', assetContactYRatio: 1, groundPlaneY: GROUND_Y,
    colorGradeFilter: 'none', shadowOpacity: 0.12, sandOverlapHeight: 3, sandMoundWidth: 78,
    messages: [
      'A lacquered archive chest, still closed after centuries underground.',
      'Someone wanted these records protected, not displayed.',
    ],
    speakers: ['Asha', 'Asha'],
  },
  {
    id: 'archive-bamboo-slips',
    x: X(6780), y: GROUND_Y - 16, width: 78, height: 78, hitboxWidth: 80, hitboxHeight: 58,
    label: 'Bamboo Writing Slips', type: 'image-prop',
    imageAssetKey: 'chinaBambooSlips',
    assetPath: 'assets/expedition/artefacts/china/china-artefact-bamboo-slips.png',
    depth: 'grounded', layer: 'grounded', assetContactYRatio: 1, groundPlaneY: GROUND_Y,
    colorGradeFilter: 'none', shadowOpacity: 0.1, sandOverlapHeight: 3, sandMoundWidth: 64,
    messages: [
      'A bundle of bamboo slips, tied with cord.',
      'Before paper was common, records could travel as strips of wood and bamboo.',
    ],
    speakers: ['Asha', 'Asha'],
  },
  {
    id: 'archive-timeline-pedestal-art',
    x: X(7035), y: GROUND_Y - 10, width: 126, height: 104, hitboxWidth: 112, hitboxHeight: 72,
    label: 'Dynasty Timeline Pedestal', type: 'image-prop',
    imageAssetKey: 'chinaPuzzlePedestal',
    assetPath: 'assets/expedition/artefacts/china/china-puzzle-pedestal.png',
    depth: 'grounded', layer: 'grounded', assetContactYRatio: 1, groundPlaneY: GROUND_Y,
    colorGradeFilter: 'none', shadowOpacity: 0.12, sandOverlapHeight: 4, sandMoundWidth: 96,
    messages: [
      'Four empty slots wait on the pedestal.',
      'The archive wants the dynasties restored in their true order.',
    ],
    speakers: ['Asha', 'Asha'],
  },
  {
    id: 'archive-qin-coin',
    x: X(6560), y: GROUND_Y - 16, width: 78, height: 78, hitboxWidth: 78, hitboxHeight: 58,
    label: 'Qin Ban Liang Coin & Law Tablet', type: 'image-prop',
    imageAssetKey: 'chinaQinLawTablet',
    assetPath: 'assets/expedition/artefacts/china/china-artefact-qin-law-tablet.png',
    depth: 'grounded', layer: 'grounded', assetContactYRatio: 1, groundPlaneY: GROUND_Y,
    colorGradeFilter: 'none', shadowOpacity: 0.12, sandOverlapHeight: 4, sandMoundWidth: 70,
    dynastyId: 'qin',
    messages: [
      'A round coin with a square hole — the Qin standard, used across the whole empire.',
      'Beside it, a law tablet. One coin, one law, one script: this is how Qin unified China.',
    ],
    speakers: ['Asha', 'Asha'],
  },
  {
    id: 'archive-qin-coin-loose',
    x: X(7278), y: GROUND_Y - 13, width: 48, height: 48, hitboxWidth: 56, hitboxHeight: 46,
    label: 'Loose Qin Ban Liang Coin', type: 'image-prop',
    imageAssetKey: 'chinaQinCoinLoose',
    assetPath: 'assets/expedition/artefacts/china/china-artefact-qin-coin.png',
    depth: 'grounded', layer: 'grounded', assetContactYRatio: 1, groundPlaneY: GROUND_Y,
    colorGradeFilter: 'none', shadowOpacity: 0.08, sandOverlapHeight: 2, sandMoundWidth: 44,
    messages: [
      'A single Qin coin: round outside, square at the centre.',
      'Standard money helped hold a newly unified empire together.',
    ],
    speakers: ['Asha', 'Asha'],
  },
  {
    id: 'china-interaction-marker-qin',
    x: X(6560), y: GROUND_Y - 88, width: 78, height: 78, hitboxWidth: 0, hitboxHeight: 0,
    label: 'China interaction marker - Qin tablet', type: 'image-prop',
    imageAssetKey: 'chinaInteractionMarkerQin',
    assetPath: 'assets/expedition/ui/china/china-interaction-marker.png',
    depth: 'midground', layer: 'midground', assetContactYRatio: 0.5,
    colorGradeFilter: 'none', shadowOpacity: 0, alpha: 0.58, zIndex: 18,
  },
  {
    id: 'archive-han-invention',
    x: X(7280), y: GROUND_Y - 18, width: 92, height: 74, hitboxWidth: 88, hitboxHeight: 66,
    label: 'Han Invention Set', type: 'image-prop',
    imageAssetKey: 'chinaHanInventions',
    assetPath: 'assets/expedition/artefacts/china/china-artefact-han-inventions.png',
    depth: 'grounded', layer: 'grounded', assetContactYRatio: 1, groundPlaneY: GROUND_Y,
    colorGradeFilter: 'none', shadowOpacity: 0.12, sandOverlapHeight: 4, sandMoundWidth: 78,
    dynastyId: 'han',
    messages: [
      'A south-pointing compass, a sheet of true paper, a porcelain shard.',
      'Han inventions — they outlived the dynasty and shaped China for centuries.',
    ],
    speakers: ['Asha', 'Asha'],
  },
  {
    id: 'china-interaction-marker-han',
    x: X(7280), y: GROUND_Y - 88, width: 80, height: 80, hitboxWidth: 0, hitboxHeight: 0,
    label: 'China interaction marker - Han inventions', type: 'image-prop',
    imageAssetKey: 'chinaInteractionMarkerHan',
    assetPath: 'assets/expedition/ui/china/china-interaction-marker.png',
    depth: 'midground', layer: 'midground', assetContactYRatio: 0.5,
    colorGradeFilter: 'none', shadowOpacity: 0, alpha: 0.58, zIndex: 18,
  },
  {
    id: 'china-frontier-path-strip-gate',
    x: X(7860), y: GROUND_Y + 48, width: 512, height: 140, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Imperial gate approach path strip', type: 'image-prop',
    imageAssetKey: 'chinaFrontierPathStripGate',
    assetPath: 'assets/expedition/environment/china-river-valley/china-frontier-path-strip.png',
    depth: 'route-edge', layer: 'route-edge', assetContactYRatio: 1, groundPlaneY: GROUND_Y + 48,
    colorGradeFilter: 'none', shadowOpacity: 0, sandOverlapHeight: 0, zIndex: -80,
  },
  {
    id: 'china-imperial-gate-sealed-art',
    x: X(7560), y: GROUND_Y + 2, width: 410, height: 480, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Sealed Imperial Gate art', type: 'image-prop',
    imageAssetKey: 'chinaImperialGateSealed',
    assetPath: 'assets/expedition/environment/china-river-valley/china-imperial-gate-sealed.png',
    depth: 'midground', layer: 'midground', assetContactYRatio: 1, groundPlaneY: GROUND_Y + 2,
    colorGradeFilter: 'none', shadowOpacity: 0.2, sandOverlapHeight: 8, sandMoundWidth: 210,
    hideWhenRouteGateOpenId: 'imperial-gate-seal', zIndex: -20,
  },
  {
    id: 'china-imperial-gate-unlocked-art',
    x: X(7560), y: GROUND_Y + 2, width: 410, height: 480, hitboxWidth: 0, hitboxHeight: 0,
    label: 'Unlocked Imperial Gate overlay art', type: 'image-prop',
    imageAssetKey: 'chinaImperialGateUnlockedOverlay',
    assetPath: 'assets/expedition/environment/china-river-valley/china-imperial-gate-unlocked-overlay.png',
    depth: 'midground', layer: 'midground', assetContactYRatio: 1, groundPlaneY: GROUND_Y + 2,
    colorGradeFilter: 'none', shadowOpacity: 0.08, sandOverlapHeight: 6, sandMoundWidth: 210,
    showWhenRouteGateOpenId: 'imperial-gate-seal', zIndex: -19,
  },
  {
    id: 'gate-imperial-banner',
    x: X(7860), y: GROUND_Y - 26, width: 50, height: 60, hitboxWidth: 80, hitboxHeight: 90,
    label: 'Imperial Banner', sprite: 'buriedCarvedHead',
    messages: [
      'An imperial banner hangs over the sealed gate.',
      'Beyond it runs the great road — into a China unified under one emperor.',
    ],
    speakers: ['Asha', 'Asha'],
  },
];

// ---------------------------------------------------------------------------
// Checkpoints — respawn anchors at each section start.
// ---------------------------------------------------------------------------
export const CHINA_CHECKPOINTS = [
  { id: 'frontier-entry',   name: 'River Frontier',     x: X(80),   markerX: X(24), y: JY(282) },
  { id: 'wall-checkpoint',  name: 'Rammed-Earth Wall',  x: X(2360), y: JY(282) },
  { id: 'settle-checkpoint', name: 'Frontier Settlement', x: X(4260), y: JY(282) },
  { id: 'archive-checkpoint', name: 'Hidden Archive',   x: X(6060), y: JY(282) },
  { id: 'gate-checkpoint',  name: 'Imperial Gate',      x: X(7660), y: JY(282) },
];

// ---------------------------------------------------------------------------
// Environment interactions — none beyond the hazards/props for Section One.
// ---------------------------------------------------------------------------
export const CHINA_ENVIRONMENT_INTERACTIONS = [];

// ---------------------------------------------------------------------------
// Hidden routes — optional reward pockets. The cracked-wall archive is the
// "treasure room" entrance. Route ids match the enemy protectsRouteId links so
// the guardian-protects-route system resolves.
// ---------------------------------------------------------------------------
export const CHINA_HIDDEN_ROUTES = [
  {
    id: 'china-watchtower-rope-route',
    label: 'Watchtower rope route — survey the wall from above',
    triggerX: X(3520), triggerY: JY(90),
    sectionId: CHINA_SECTION_IDS.WALL,
    rewardShardId: 'china-shard-13',
    civilisation: 'Ancient China',
  },
  {
    id: 'china-cracked-wall-archive',
    label: 'Cracked-wall archive — the hidden record room',
    triggerX: X(7080), triggerY: JY(256),
    sectionId: CHINA_SECTION_IDS.ARCHIVE,
    rewardShardId: 'china-shard-27',
    civilisation: 'Ancient China',
  },
  {
    id: 'china-unstable-bridge-cache',
    label: 'Unstable plank-bridge cache',
    triggerX: X(5560), triggerY: JY(210),
    sectionId: CHINA_SECTION_IDS.SETTLEMENT,
    rewardShardId: 'china-shard-21',
    civilisation: 'Ancient China',
  },
  {
    id: 'china-hidden-scroll-perch',
    label: 'Hidden scroll perch above the imperial road',
    triggerX: X(8460), triggerY: JY(206),
    sectionId: CHINA_SECTION_IDS.GATE,
    rewardShardId: 'china-shard-32',
    civilisation: 'Ancient China',
  },
];

// ---------------------------------------------------------------------------
// Stage entrance features — the sealed Imperial Gate, visible from the start.
// ---------------------------------------------------------------------------
export const CHINA_STAGE_ENTRANCE_FEATURES = [
  {
    id: 'china-opening-river-stele',
    type: 'milestone-plinth',
    x: X(300),
    y: 560,
    label: 'River stele: the frontier boundary of the early dynasties',
    sectionId: CHINA_SECTION_IDS.FRONTIER,
  },
];

export const CHINA_ENVIRONMENT_EVENTS = [];

// ---------------------------------------------------------------------------
// Section objectives + markers — drive the on-screen objective tracker.
// ---------------------------------------------------------------------------
export const CHINA_SECTION_OBJECTIVES = {
  [CHINA_SECTION_IDS.FRONTIER]: {
    id: 'reach-the-wall',
    label: 'Follow the river to the rammed-earth wall',
    type: 'reach-gate',
    gateId: 'wall-breach-seal',
  },
  [CHINA_SECTION_IDS.WALL]: {
    id: 'cross-the-breach',
    label: 'Recover fragments and steady the wall breach',
    type: 'reach-gate',
    gateId: 'wall-breach-seal',
  },
  [CHINA_SECTION_IDS.SETTLEMENT]: {
    id: 'find-the-archive',
    label: 'Find the hidden archive entrance',
    type: 'reach-gate',
    gateId: 'imperial-gate-seal',
  },
  [CHINA_SECTION_IDS.ARCHIVE]: {
    id: 'claim-the-mandate',
    label: 'Gather the dynasty evidence and claim the Imperial Mandate',
    type: 'defeat-boss',
    bossId: 'looter-captain',
  },
  [CHINA_SECTION_IDS.GATE]: {
    id: 'open-the-gate',
    label: 'Open the Sealed Imperial Gate',
    type: 'reach-gate',
    gateId: 'imperial-gate-seal',
  },
};

export const CHINA_OBJECTIVE_MARKERS = [
  { id: 'wall-breach-marker',  gateId: 'wall-breach-seal',  label: 'Wall Breach' },
  { id: 'imperial-gate-marker', gateId: 'imperial-gate-seal', label: 'Imperial Gate' },
];

// ---------------------------------------------------------------------------
// Secret collectibles — the dynasty-secret discovery set ("china-secrets").
// ---------------------------------------------------------------------------
export const CHINA_SECRET_COLLECTIBLES = [
  {
    id: 'china-secret-jade-cicada',
    setId: 'china-secrets',
    civilisation: 'Ancient China',
    sectionId: CHINA_SECTION_IDS.FRONTIER,
    secretAreaId: 'china-watchtower-rope-route',
    label: 'Jade cicada — a symbol of rebirth',
    x: X(880), y: JY(150),
  },
  {
    id: 'china-secret-tiger-tally',
    setId: 'china-secrets',
    civilisation: 'Ancient China',
    sectionId: CHINA_SECTION_IDS.WALL,
    secretAreaId: 'china-watchtower-rope-route',
    label: 'Bronze tiger tally — a general\'s order to move troops',
    x: X(3560), y: JY(80),
  },
  {
    id: 'china-secret-spirit-vessel',
    setId: 'china-secrets',
    civilisation: 'Ancient China',
    sectionId: CHINA_SECTION_IDS.ARCHIVE,
    secretAreaId: 'china-cracked-wall-archive',
    label: 'Painted spirit vessel from a frontier tomb',
    x: X(7080), y: JY(250),
  },
];

// ---------------------------------------------------------------------------
// Lore tablets — short, readable, in-world learning beats (no quiz popups).
// ---------------------------------------------------------------------------
export const CHINA_LORE_TABLETS = [
  {
    id: 'tablet-river-cradle',
    x: X(1040), y: JY(214),
    sectionId: CHINA_SECTION_IDS.FRONTIER,
    title: 'The Yellow River',
    text: 'The Yellow River floods and leaves rich yellow silt. Farmers settled its banks, and from those villages grew one of the world\'s oldest continuous civilisations.',
  },
  {
    id: 'tablet-dynasty-meaning',
    x: X(1900), y: JY(134),
    sectionId: CHINA_SECTION_IDS.FRONTIER,
    title: 'What is a Dynasty?',
    text: 'A dynasty is a line of rulers from the same family. China\'s story runs from dynasty to dynasty: Shang, then Zhou, then Qin, then Han.',
  },
  {
    id: 'tablet-shang-writing',
    x: X(2820), y: JY(110),
    sectionId: CHINA_SECTION_IDS.WALL,
    title: 'The Shang Dynasty',
    text: 'The Shang cast bronze vessels for ritual and war, and carved the first Chinese writing onto oracle bones to ask the ancestors for answers.',
  },
  {
    id: 'tablet-great-wall',
    x: X(3260), y: JY(134),
    sectionId: CHINA_SECTION_IDS.WALL,
    title: 'The Wall',
    text: 'Rammed earth, packed layer by layer, raised against raiders from the north. Later emperors joined these frontier walls into the Great Wall.',
  },
  {
    id: 'tablet-zhou-philosophy',
    x: X(5040), y: JY(204),
    sectionId: CHINA_SECTION_IDS.SETTLEMENT,
    title: 'The Zhou Dynasty',
    text: 'Under the long Zhou age, thinkers offered ways to live: Confucius taught respect and order; the Taoists taught harmony with nature. These ideas still shape China.',
  },
  {
    id: 'tablet-qin-unification',
    x: X(7020), y: JY(244),
    sectionId: CHINA_SECTION_IDS.ARCHIVE,
    title: 'Qin Shi Huang',
    text: 'The first emperor, Qin Shi Huang, unified the warring states. He set one law, one written script and one coin across all of China — the start of Imperial China.',
  },
  {
    id: 'tablet-han-invention',
    x: X(8020), y: JY(140),
    sectionId: CHINA_SECTION_IDS.GATE,
    title: 'The Han Dynasty',
    text: 'The Han ruled for four centuries and gave the world paper, the compass, strong steel and porcelain. So much of Chinese identity traces back to the Han.',
  },
];

// Guardian-knowledge quizzes intentionally disabled — learning is embedded in
// world, evidence and the timeline puzzle, not classroom popups.
export const CHINA_GUARDIAN_KNOWLEDGE_CHALLENGES = {};
export const CHINA_GUARDIAN_KNOWLEDGE_QUESTIONS = [];

// ---------------------------------------------------------------------------
// World continuity landmarks — distant silhouettes for depth/orientation.
// ---------------------------------------------------------------------------
export const CHINA_WORLD_CONTINUITY_LANDMARKS = [
  { id: 'china-far-watchtower', x: X(600),  sectionId: CHINA_SECTION_IDS.FRONTIER, label: 'Distant watchtower on the wall ridge' },
  { id: 'china-river-bend',     x: X(1500), sectionId: CHINA_SECTION_IDS.FRONTIER, label: 'The great bend of the Yellow River' },
  { id: 'china-imperial-gate-skyline', x: X(2000), sectionId: CHINA_SECTION_IDS.FRONTIER, label: 'The sealed Imperial Gate, far ahead' },
];

// ---------------------------------------------------------------------------
// World transition story markers — the handoff toward the next China area.
// ---------------------------------------------------------------------------
export const CHINA_WORLD_TRANSITION_STORY_MARKERS = [
  {
    id: 'china-to-imperial-echo',
    x: X(8700),
    sectionId: CHINA_SECTION_IDS.GATE,
    speaker: 'Asha',
    text: 'The line is restored — Shang, Zhou, Qin, Han. The gate is open. Beyond it, the road runs deeper into Imperial China.',
  },
];

// ---------------------------------------------------------------------------
// Civ-specific gate + discovery entrance (router extends its proxies to use
// these for China; falls back to Egypt's if absent).
// ---------------------------------------------------------------------------
export const CHINA_GATE = { x: X(8900), y: JY(282), width: 56, height: 78 };

export const CHINA_DISCOVERY_ENTRANCE = {
  id: 'china-imperial-road-entrance',
  sectionId: CHINA_SECTION_IDS.GATE,
  name: 'Imperial Road Located',
  title: 'The Road into Imperial China',
  message: 'You have restored the dynasty line and opened the Imperial Gate.',
  handoffMessage: 'Record the evidence and prepare to journey deeper into Imperial China.',
  x: X(8800),
  y: JY(182),
  width: X(140),
  height: 178,
  glowColor: '#e8c87a',
  stoneColor: '#5a3f28',
  accentColor: '#f0d8a0',
};

// ---------------------------------------------------------------------------
// Upgrades — China-flavoured names but the SAME canonical ids as Egypt, so the
// movement/vision effects and hidden-route gating continue to work unchanged.
// ---------------------------------------------------------------------------
export const CHINA_UPGRADES = [
  { id: 'basecamp-upgrade-voucher', name: 'Tribute Cache Voucher', shortName: 'Voucher', emoji: 'V', x: X(925), y: JY(320), effect: 'Spend 2 shards to open a cache of 6 relic fragments for Base Camp.', shardCost: 2, rewardShards: 6, cacheReward: true },
  { id: 'reinforced-boots', name: 'Soldier\'s Straw Sandals', shortName: 'Sandals', emoji: '🥾', x: X(1310), y: JY(270), effect: 'Higher jump for the wall scaffolds.' },
  { id: 'rope-launcher', name: 'Watchtower Grapple', shortName: 'Grapple', emoji: '🪝', x: X(2935), y: JY(210), effect: 'One extra mid-air jump to reach the watchtower routes.' },
  { id: 'torch-upgrade', name: 'Bronze Oil Lamp', shortName: 'Lamp', emoji: '🪔', x: X(4405), y: JY(252), effect: 'Lights the darker archive passages.' },
  { id: 'historian-vision', name: 'Scholar\'s Eye', shortName: 'Vision', emoji: '👁️', x: X(5480), y: JY(190), effect: 'Reveals hidden relic-fragment clusters.' },
  { id: 'ancient-compass', name: 'Han South-Pointer', shortName: 'Compass', emoji: '🧭', x: X(7905), y: JY(220), effect: 'Marks hidden archive rooms near the imperial road.' },
];
