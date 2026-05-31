// Rome journey data — all exports mirror the shape expected by journeyDataRouter.js.
// Imports level geometry from romeLevelData.js; does not touch any Egypt file.

import {
  ROME_SECTIONS,
  ROME_PLATFORMS,
  ROME_TOOL_LAYOUT,
  ROME_SHARD_LAYOUT,
  ROME_KEY_LAYOUT,
  ROME_GATES,
  ROME_UPGRADE_LAYOUT,
  ROME_ENEMY_SPAWN_ZONES,
  ROME_BOSS_SPAWN,
  ROME_TRAP_ZONES,
  ROME_SECRET_AREAS,
  ROME_JOURNEY_TOOLS,
} from './rome/romeLevelData.js';

export { ROME_SECTIONS as ROME_SECTIONS };

// --- Sections ---
export const ROME_JOURNEY_SECTIONS = ROME_SECTIONS;

// --- Platforms & geometry ---
export const ROME_JOURNEY_PLATFORMS = ROME_PLATFORMS;

// --- Hazards (trap zones as hazard format) ---
export const ROME_HAZARDS = ROME_TRAP_ZONES.map((trap) => ({
  id: trap.id || `${trap.type}-${trap.x}`,
  type: trap.type,
  x: trap.x,
  y: trap.y ?? 0,
  width: trap.width,
  height: trap.height ?? 60,
  triggersId: trap.triggersId ?? null,
  sectionId: trap.sectionId ?? null,
}));

// --- Route gates ---
export const ROME_ROUTE_GATES = ROME_GATES.map((gate) => ({
  id: gate.id,
  name: gate.label,
  x: gate.x,
  y: gate.y,
  width: gate.width,
  height: gate.height,
  label: gate.label,
  sectionId: gate.sectionId,
  requiredKeys: gate.requiredKeys ?? 1,
  message: `This gate is sealed. Recover ${gate.requiredKeys ?? 1} key ${gate.requiredKeys === 1 ? 'item' : 'items'} to continue.`,
  readyHint: 'The gate is ready to open.',
  openMessage: 'The gate yields.',
  requires: {
    shards: gate.requiredKeys ?? 1,
  },
}));

// --- Opening trigger (replaces scarab seal for Rome — the Legate's presence is felt) ---
export const ROME_OPENING_TRIGGER = {
  id: 'legate-presence-trigger',
  sectionId: 'via-sacra',
  bossId: 'rome-legate-revenant',
  name: 'The Legate\'s Mark',
  x: 925,
  y: 118,   // rough JY value — matches Via Sacra high-arch ledge
  width: 140,
  height: 80,
  eventName: 'Legate Revenant',
  eventType: 'stone-tremor',
  shake: 0.18,
  duration: 28.0,
  sealEmphasisMessage: 'A cold weight settles in the air. Something sealed here does not want to be found.',
  sealPulseLabel: 'SEALED VAULT',
  sealPulseRadius: 72,
  sealPulseDuration: 0.88,
  cameraRevealDuration: 1.6,
  objectiveEchoLine: 'Reach the vault beneath the Forum. Find what the Legate buried here.',
  firstShardEchoLine: 'First artefact recovered.',
  messages: [
    'You walk roads that the empire bled to build.',
    'The Senate sealed this chamber for a reason.',
    'Leave while the stone still lets you.',
  ],
  dialogueSpeakers: [
    'Legate Revenant',
    'Legate Revenant',
    'Legate Revenant',
  ],
  dialogueTiming: [0.9, 3.5, 6.8],
  stairwellRevealLine: 'The vault entrance grinds open. Cold air rushes out.',
  bossIntroLine: 'The Legate Revenant rises. He sealed this place with his life.',
  guideFollowUpLine: 'Recover the archive evidence and survive.',
};

// --- Tool layout ---
export const ROME_JOURNEY_TOOL_LAYOUT = ROME_TOOL_LAYOUT;

// --- Relic shards (evidence collectibles) ---
export const ROME_RELIC_SHARD_LAYOUT = ROME_SHARD_LAYOUT.map((shard) => ({
  id: shard.id,
  x: shard.x,
  y: shard.y,
  sectionId: shard.sectionId,
  critical: shard.critical ?? false,
}));

// --- Boss key items (keys that unlock gates) ---
export const ROME_BOSS_KEY_ITEMS = ROME_KEY_LAYOUT.map((key) => ({
  id: key.id,
  x: key.x,
  y: key.y,
  unlocksGateId: key.unlocksGateId,
  type: 'gate-key',
}));

// --- Story props (upgrade drops, decorative scene objects) ---
export const ROME_STORY_PROPS = ROME_UPGRADE_LAYOUT.map((upgrade) => ({
  id: upgrade.id,
  x: upgrade.x,
  y: upgrade.y,
  type: 'upgrade-drop',
  effect: upgrade.effect,
}));

// --- Section atmospheres ---
export const ROME_SECTION_ATMOSPHERES = {
  'via-sacra': {
    title: 'The Sacred Road',
    description: 'Cracked limestone and collapsed portico arches. The city feels recent, and very wrong.',
    color: '#e8dcc8',
  },
  'forum-ruins': {
    title: 'The Buried Forum',
    description: 'Column stumps and fallen entablatures rise from compacted ash. Rome\'s civic heart, silenced.',
    color: '#d4c9b8',
  },
  'subterranean-thermae': {
    title: 'Beneath the Baths',
    description: 'Hypocaust pillars vanish into steam. The heat system still runs, but no one fed it for two thousand years.',
    color: '#2e3030',
  },
  'basilica-interior': {
    title: 'The Darkened Basilica',
    description: 'Clerestory light cuts through settling dust. The apse mosaic stares back.',
    color: '#c8c0b4',
  },
  'sealed-vault': {
    title: 'The Legate\'s Vault',
    description: 'Sealed in 79 AD. The archive the Senate wanted buried. The Legate made sure of it.',
    color: '#d4e8d4',
  },
};

// --- Checkpoints ---
export const ROME_CHECKPOINTS = [
  { id: 'checkpoint-via-sacra',  x: 1800, sectionId: 'via-sacra' },
  { id: 'checkpoint-forum',      x: 3900, sectionId: 'forum-ruins' },
  { id: 'checkpoint-thermae',    x: 5700, sectionId: 'subterranean-thermae' },
  { id: 'checkpoint-basilica',   x: 7200, sectionId: 'basilica-interior' },
];

// --- Environment interactions (pressure plates, steam channels) ---
export const ROME_ENVIRONMENT_INTERACTIONS = ROME_TRAP_ZONES.map((trap) => ({
  id: trap.id || `interaction-${trap.type}-${trap.x}`,
  type: trap.type,
  x: trap.x,
  y: trap.y ?? 0,
  width: trap.width,
  triggersId: trap.triggersId ?? null,
}));

// --- Hidden routes (secret areas as hidden route entries) ---
export const ROME_HIDDEN_ROUTES = ROME_SECRET_AREAS.map((area) => ({
  id: area.id,
  label: area.label,
  triggerX: area.triggerX,
  triggerY: area.triggerY,
  sectionId: area.sectionId,
  rewardShardId: area.rewardShardId,
  civilisation: 'Ancient Rome',
}));

// --- Stage entrance features ---
export const ROME_STAGE_ENTRANCE_FEATURES = [
  {
    id: 'rome-opening-milestone',
    type: 'milestone-plinth',
    x: 300,
    y: 560,
    label: 'Roman milestone: distance marker carved in Latin',
    sectionId: 'via-sacra',
  },
];

// --- Environment events ---
export const ROME_ENVIRONMENT_EVENTS = [];

// --- Section objectives ---
export const ROME_SECTION_OBJECTIVES = {
  'via-sacra': {
    id: 'survive-via-sacra',
    label: 'Reach the Forum gate',
    type: 'reach-gate',
    gateId: 'forum-gate',
  },
  'forum-ruins': {
    id: 'survive-forum',
    label: 'Descend to the Thermae',
    type: 'reach-gate',
    gateId: 'thermae-gate',
  },
  'subterranean-thermae': {
    id: 'survive-thermae',
    label: 'Reach the Basilica entrance',
    type: 'reach-gate',
    gateId: 'basilica-gate',
  },
  'basilica-interior': {
    id: 'survive-basilica',
    label: 'Reach the Vault gate',
    type: 'reach-gate',
    gateId: 'vault-gate',
  },
  'sealed-vault': {
    id: 'defeat-legate',
    label: 'Defeat the Legate Revenant',
    type: 'defeat-boss',
    bossId: 'rome-legate-revenant',
  },
};

// --- Objective markers ---
export const ROME_OBJECTIVE_MARKERS = [
  { id: 'forum-gate-marker',    gateId: 'forum-gate',    label: 'Forum Gate' },
  { id: 'thermae-gate-marker',  gateId: 'thermae-gate',  label: 'Thermae Descent' },
  { id: 'basilica-gate-marker', gateId: 'basilica-gate', label: 'Basilica Entrance' },
  { id: 'vault-gate-marker',    gateId: 'vault-gate',    label: 'Sealed Vault' },
];

// --- Secret collectibles ---
export const ROME_SECRET_COLLECTIBLES = [
  {
    id: 'shard-mosaic-tesserae',
    civilisation: 'Ancient Rome',
    sectionId: 'via-sacra',
    secretAreaId: 'hidden-cistern',
    label: 'Mosaic tesserae fragment',
    x: 1950,
    y: 540,
  },
  {
    id: 'shard-personal-seal-ring',
    civilisation: 'Ancient Rome',
    sectionId: 'basilica-interior',
    secretAreaId: 'senator-cryptoporticus',
    label: 'Senator\'s personal seal ring',
    x: 6890,
    y: 500,
  },
];

// --- Lore tablets ---
export const ROME_LORE_TABLETS = [
  {
    id: 'tablet-via-sacra-inscription',
    x: 950,
    y: 520,
    sectionId: 'via-sacra',
    title: 'Milestone Inscription',
    text: 'From this stone: six hundred paces to the Forum gate. Built under the consul Gaius Aemilius.',
  },
  {
    id: 'tablet-forum-record',
    x: 2800,
    y: 470,
    sectionId: 'forum-ruins',
    title: 'Senate Record Fragment',
    text: 'The archive is to be sealed by order of the Senate. No record of its contents shall remain above ground.',
  },
  {
    id: 'tablet-thermae-lead-stamp',
    x: 4600,
    y: 490,
    sectionId: 'subterranean-thermae',
    title: 'Lead Pipe Stamp',
    text: 'Property of the Imperial Baths. Year of Nero. Pipe installer: M. Vettius Firma.',
  },
  {
    id: 'tablet-basilica-edict',
    x: 6300,
    y: 470,
    sectionId: 'basilica-interior',
    title: 'Posted Edict',
    text: 'By authority of the Legate: this chamber and all passages below are closed until further notice. Trespassers will be judged accordingly.',
  },
  {
    id: 'tablet-vault-import-record',
    x: 8200,
    y: 490,
    sectionId: 'sealed-vault',
    title: 'Import Record — Egypt Origin',
    text: 'Received: one sealed cedar chest, contents listed as \'ceremonial items from the eastern province.\'  Actual contents: correspondence between the Senate and an unknown Egyptian official. Date of seal: before the eruption. Reason: unknown.',
  },
];

// --- Guardian knowledge (Rome equivalent — not yet enabled) ---
export const ROME_GUARDIAN_KNOWLEDGE_CHALLENGES = {};
export const ROME_GUARDIAN_KNOWLEDGE_QUESTIONS   = [];

// --- World continuity landmarks ---
export const ROME_WORLD_CONTINUITY_LANDMARKS = [
  {
    id: 'rome-aqueduct-silhouette',
    x: 400,
    sectionId: 'via-sacra',
    label: 'Aqueduct arch silhouette on the horizon',
  },
  {
    id: 'rome-capitol-ridge',
    x: 1100,
    sectionId: 'via-sacra',
    label: 'Capitoline hill ridge, distant',
  },
];

// --- World transition story markers ---
export const ROME_WORLD_TRANSITION_STORY_MARKERS = [
  {
    id: 'rome-to-egypt-echo',
    x: 8600,
    sectionId: 'sealed-vault',
    speaker: 'Asha',
    text: 'This seal — I\'ve seen one like it before. Under the sand in Egypt. They were connected.',
  },
];

// --- Tools (same as Egypt / China — shared tool set) ---
export const ROME_TOOLS = ROME_JOURNEY_TOOLS;

// --- Upgrades (shared structure, Rome flavour names) ---
export const ROME_UPGRADES = ROME_UPGRADE_LAYOUT.map((u) => ({
  id: u.id,
  effect: u.effect,
  x: u.x,
  y: u.y,
}));

// --- Full enemy definitions (matches makeEnemy() expected shape in journeyUtils.js) ---
// Expanded from ROME_ENEMY_SPAWN_ZONES with combat tuning, hitbox sizes, patrol ranges.
const PATROL = 200; // default patrol half-width in world pixels

const romeEnemy = (id, name, type, spawn, overrides = {}) => ({
  id,
  name,
  type,
  emoji: overrides.emoji || '?',
  x: spawn.x,
  y: spawn.y,
  width: overrides.width ?? 34,
  height: overrides.height ?? 42,
  patrolMin: spawn.x - (overrides.patrol ?? PATROL),
  patrolMax: spawn.x + (overrides.patrol ?? PATROL),
  speed: overrides.speed ?? 80,
  health: overrides.health ?? 3,
  damage: overrides.damage ?? 6,
  shards: overrides.shards ?? 2,
  flying: overrides.flying ?? false,
  initialAttackCooldown: overrides.initialAttackCooldown ?? 0.9,
  attackPatternTuning: overrides.attackPatternTuning ?? null,
  encounterRole: overrides.encounterRole ?? null,
  pressureHint: overrides.pressureHint ?? null,
});

const S = ROME_ENEMY_SPAWN_ZONES; // shorthand

export const ROME_ENEMIES = [
  // Via Sacra — light patrol presence
  romeEnemy('legion-shade-via-1', 'Legion Shade', 'legion-shade', S[0],
    { emoji: 'L', speed: 82, health: 3, damage: 5, shards: 2, patrol: 180, encounterRole: 'via sacra patrol', pressureHint: 'Opens Rome with a readable pattern — windup visible, counter window clear.' }),
  romeEnemy('legion-shade-via-2', 'Legion Shade', 'legion-shade', S[1],
    { emoji: 'L', speed: 78, health: 3, damage: 5, shards: 2, patrol: 200, encounterRole: 'via sacra patrol' }),
  romeEnemy('forum-rat-via-1', 'Forum Rat', 'forum-rat', S[2],
    { emoji: 'R', width: 26, height: 22, speed: 160, health: 1, damage: 4, shards: 1, patrol: 150, encounterRole: 'swarm pest', pressureHint: 'Fast, low HP — forces rapid response before the next shade.' }),
  romeEnemy('legion-shade-via-3', 'Praetorian Shade', 'legion-shade', S[3],
    { emoji: 'L', speed: 86, health: 3, damage: 7, shards: 3, patrol: 180, encounterRole: 'gate approach guard' }),

  // Forum Ruins — mixed resistance
  romeEnemy('legion-shade-forum-1', 'Forum Shade', 'legion-shade', S[4],
    { emoji: 'L', speed: 80, health: 3, damage: 7, shards: 2, patrol: 200 }),
  romeEnemy('gladiator-revenant-forum-1', 'Gladiator Revenant', 'gladiator-revenant', S[5],
    { emoji: 'G', width: 36, height: 44, speed: 110, health: 5, damage: 10, shards: 4, patrol: 240,
      attackPatternTuning: { windup: 0.72, duration: 0.34, cooldown: 1.85, recovery: 0.76, vulnerableAfter: 0.82, speed: 120, range: 52, height: 56, yOffset: -18, backReach: 22, damageScale: 1.2 },
      encounterRole: 'forum centrepiece', pressureHint: 'First gladiator — lunge telegraphed clearly, quick punish window after recoil.' }),
  romeEnemy('forum-rat-forum-1', 'Marble Rat', 'forum-rat', S[6],
    { emoji: 'R', width: 26, height: 22, speed: 155, health: 1, damage: 4, shards: 1, patrol: 130 }),
  romeEnemy('vestibule-wisp-forum-1', 'Forum Wisp', 'vestibule-wisp', S[7],
    { emoji: 'W', width: 32, height: 28, speed: 95, health: 2, damage: 5, shards: 2, flying: true, patrol: 260,
      encounterRole: 'aerial forum pressure', pressureHint: 'Aerial enemy forces vertical awareness mid-column field.' }),
  romeEnemy('legion-shade-forum-2', 'Ruins Guard', 'legion-shade', S[8],
    { emoji: 'L', speed: 85, health: 3, damage: 8, shards: 3, patrol: 180 }),
  romeEnemy('gladiator-revenant-forum-2', 'Arena Revenant', 'gladiator-revenant', S[9],
    { emoji: 'G', width: 36, height: 44, speed: 112, health: 5, damage: 11, shards: 5, patrol: 220,
      attackPatternTuning: { windup: 0.68, duration: 0.32, cooldown: 1.78, recovery: 0.72, vulnerableAfter: 0.80, speed: 125, range: 54, height: 58, yOffset: -18, backReach: 24, damageScale: 1.25 },
      encounterRole: 'gate guardian', pressureHint: 'Guards the thermae gate — tighter patrol, faster lunge.' }),

  // Subterranean Thermae — dark corridors
  romeEnemy('forum-rat-thermae-1', 'Steam Rat', 'forum-rat', S[10],
    { emoji: 'R', width: 26, height: 22, speed: 165, health: 1, damage: 4, shards: 1, patrol: 140,
      encounterRole: 'dark corridor pest', pressureHint: 'Harder to read in low steam visibility.' }),
  romeEnemy('legion-shade-thermae-1', 'Bath Shade', 'legion-shade', S[11],
    { emoji: 'L', speed: 82, health: 4, damage: 8, shards: 3, patrol: 160 }),
  romeEnemy('vestibule-wisp-thermae-1', 'Hypocaust Wisp', 'vestibule-wisp', S[12],
    { emoji: 'W', width: 32, height: 28, speed: 98, health: 2, damage: 6, shards: 2, flying: true, patrol: 230,
      encounterRole: 'steam column aerial', pressureHint: 'Weaves through hypocaust pillars — difficult sightlines.' }),
  romeEnemy('marble-golem-thermae-1', 'Stone Pillar Golem', 'marble-golem', S[13],
    { emoji: 'M', width: 46, height: 50, speed: 52, health: 8, damage: 14, shards: 7, patrol: 150,
      attackPatternTuning: { windup: 1.0, duration: 0.44, cooldown: 2.2, recovery: 1.0, vulnerableAfter: 1.1, speed: 36, range: 60, height: 62, yOffset: -10, backReach: 16, damageScale: 1.5, shieldDuringWindup: true, protectedDuringWindup: true },
      encounterRole: 'thermae centrepiece', pressureHint: 'Slow but enormous attack — wait for shieldDuringWindup to drop.' }),
  romeEnemy('vestibule-wisp-thermae-2', 'Drain Wisp', 'vestibule-wisp', S[14],
    { emoji: 'W', width: 32, height: 28, speed: 96, health: 2, damage: 6, shards: 3, flying: true, patrol: 280 }),
  romeEnemy('gladiator-revenant-thermae-1', 'Vault Gladiator', 'gladiator-revenant', S[15],
    { emoji: 'G', width: 36, height: 44, speed: 115, health: 6, damage: 12, shards: 5, patrol: 200,
      attackPatternTuning: { windup: 0.65, duration: 0.30, cooldown: 1.72, recovery: 0.68, vulnerableAfter: 0.78, speed: 130, range: 56, height: 58, yOffset: -18, backReach: 24, damageScale: 1.3 },
      encounterRole: 'basilica gate guard', pressureHint: 'Faster lunge than earlier gladiators — shorter reaction window.' }),

  // Basilica Interior — heavy guard
  romeEnemy('gladiator-revenant-basilica-1', 'Nave Gladiator', 'gladiator-revenant', S[16],
    { emoji: 'G', width: 36, height: 44, speed: 110, health: 6, damage: 12, shards: 5, patrol: 220,
      encounterRole: 'nave entrance', pressureHint: 'Large space; gladiator has room to exploit its lunge range.' }),
  romeEnemy('marble-golem-basilica-1', 'Column Golem', 'marble-golem', S[17],
    { emoji: 'M', width: 46, height: 50, speed: 54, health: 9, damage: 15, shards: 8, patrol: 160,
      attackPatternTuning: { windup: 1.05, duration: 0.46, cooldown: 2.3, recovery: 1.05, vulnerableAfter: 1.15, speed: 34, range: 64, height: 66, yOffset: -12, backReach: 18, damageScale: 1.55, shieldDuringWindup: true, protectedDuringWindup: true },
      encounterRole: 'mid-basilica anchor', pressureHint: 'Blocks the clerestory route — forces a ground decision.' }),
  romeEnemy('legion-shade-basilica-1', 'Apse Guard', 'legion-shade', S[18],
    { emoji: 'L', speed: 88, health: 4, damage: 9, shards: 4, patrol: 180, encounterRole: 'apse approach' }),
  romeEnemy('gladiator-revenant-basilica-2', 'Vault Approach Revenant', 'gladiator-revenant', S[19],
    { emoji: 'G', width: 36, height: 44, speed: 118, health: 6, damage: 13, shards: 6, patrol: 200,
      attackPatternTuning: { windup: 0.62, duration: 0.28, cooldown: 1.68, recovery: 0.65, vulnerableAfter: 0.75, speed: 138, range: 58, height: 60, yOffset: -20, backReach: 26, damageScale: 1.35 },
      encounterRole: 'vault gate guardian', pressureHint: 'Final humanoid before the vault gate — most aggressive lunge timing.' }),

  // Sealed Vault — boss antechamber
  romeEnemy('marble-golem-vault-1', 'Vault Sentinel', 'marble-golem', S[20],
    { emoji: 'M', width: 46, height: 50, speed: 50, health: 10, damage: 16, shards: 10, patrol: 140,
      attackPatternTuning: { windup: 1.1, duration: 0.48, cooldown: 2.4, recovery: 1.1, vulnerableAfter: 1.2, speed: 32, range: 66, height: 68, yOffset: -12, backReach: 18, damageScale: 1.6, shieldDuringWindup: true, protectedDuringWindup: true },
      encounterRole: 'vault antechamber sentinel', pressureHint: 'Hardest golem — deliberately slow to reward patience over aggression.' }),
  romeEnemy('gladiator-revenant-vault-1', 'Legate\'s Champion', 'gladiator-revenant', S[21],
    { emoji: 'G', width: 36, height: 44, speed: 120, health: 7, damage: 14, shards: 8, patrol: 180,
      attackPatternTuning: { windup: 0.60, duration: 0.26, cooldown: 1.62, recovery: 0.62, vulnerableAfter: 0.72, speed: 145, range: 60, height: 62, yOffset: -20, backReach: 28, damageScale: 1.4 },
      encounterRole: 'pre-boss champion', pressureHint: 'Fights alongside the vault sentinel — pressure test before the Legate.' }),
];

// No mini-bosses in Rome Act 1 — the Legate Revenant is the sole boss
export const ROME_MINI_BOSSES = [];

export { ROME_BOSS_SPAWN };

// Gate position — end of the sealed vault section, world position
import { scaleRomeX, ROME_VERTICAL_OFFSET } from './rome/romeConstants.js';
const _RJY = (y) => y + ROME_VERTICAL_OFFSET;
export const ROME_GATE = {
  x: scaleRomeX(8820),
  y: _RJY(282),
  width: 56,
  height: 78,
};

// Discovery entrance — the sealed archive at the end of the vault
export const ROME_DISCOVERY_ENTRANCE = {
  id: 'rome-sealed-archive-entrance',
  sectionId: 'sealed-vault',
  name: 'Sealed Archive Located',
  title: 'The Senate\'s Buried Archive',
  message: 'You have reached the vault. The archive is inside.',
  handoffMessage: 'Return to the surface. Prepare the excavation team.',
  x: scaleRomeX(8750),
  y: _RJY(182),
  width: scaleRomeX(140),
  height: 178,
  glowColor: '#e8c87a',
  stoneColor: '#3d4a3a',
  accentColor: '#c8e8b0',
};
