import { CANVAS_HEIGHT, CANVAS_WIDTH, GROUND_Y } from './journeyConstants';
import { SCARAB_SEAL_TRIGGER, STAGE_ENTRANCE_FEATURES } from './journeyDataRouter';
import { clampCameraX, getCameraFollowTarget as getLayoutCameraFollowTarget, worldToScreenX } from './journeyLayout';
import { OPENING_ENTRANCE_STAGE, easeInOutCubic } from './journeyOpeningScenes';
import { PROP_EDITOR_HANDLE_HIT, PROP_EDITOR_ROTATE_OFFSET } from './journeyRenderPrimitives.js';
import { clamp, rectsOverlap } from './journeyUtils';
import { EGYPT_HAZARD_DECAL_PLACEMENT, EGYPT_HAZARD_DECAL_PLACEMENT_BY_HAZARD, FORGOTTEN_MURAL_CHAMBER_CAMERA_X, MUMMIFICATION_CHAMBER_CAMERA_X, OPENING_HAZARD_DECAL_BY_HAZARD, OPENING_TRAP_DECAL_BY_HAZARD, SCRIBE_CHAMBER_CAMERA_X, TEMPLE_THRESHOLD_HALL_CAMERA_X, isStageEntranceAvailableForState } from './journeyChamberTriggers.js';
import { RELIC_SHARD_SCALE, isForgottenMuralChamberScene, isInteriorChamberScene, isMummificationChamberScene, isScribeLockedChamberScene, isTempleThresholdHallScene } from './journeyGameplayHelpers.js';
import { FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_SRC, MUMMIFICATION_CHAMBER_EXTERIOR_SRC, OPENING_CAMERA_REVEAL_DURATION, OPENING_CAMERA_REVEAL_HOLD_SECONDS, OPENING_CAMERA_REVEAL_PAN_SECONDS, OPENING_PYRAMID_FACADE_SRC, SCRIBE_CHAMBER_EXTERIOR_SRC } from './journeySceneAssets.js';

export const FIELD_TOOL_SCALE = 0.86;
export const UPGRADE_SCALE = 0.86;
export const OBJECTIVE_MARKER_SCALE = 0.84;
export const LORE_TABLET_SCALE = 0.84;
export const PICKUP_GLOW_SCALE = 0.68;

export const COLLECTIBLE_VISUAL_BASE = {
  relicShard: {
    size: Math.round(32 * RELIC_SHARD_SCALE),
    ringSize: Math.round(54 * PICKUP_GLOW_SCALE),
    glowAlpha: 0.42,
    shadowAlpha: 0.24,
    bobAmplitude: 2.4,
    sparkleAlpha: 0.46,
    sparkleSize: 12,
    anchorYOffset: 18,
    nearGlowDistance: 170,
  },
  fieldTool: {
    size: Math.round(46 * FIELD_TOOL_SCALE),
    fieldGuideSize: Math.round(52 * FIELD_TOOL_SCALE),
    ringSize: 0,
    glowAlpha: 0,
    shadowAlpha: 0.18,
    bobAmplitude: 2.4,
    sparkleAlpha: 0.22,
    sparkleSize: 11,
    anchorYOffset: 22,
    nearGlowDistance: 125,
  },
  upgrade: {
    size: Math.round(46 * UPGRADE_SCALE),
    ringSize: 0,
    glowAlpha: 0,
    shadowAlpha: 0.16,
    bobAmplitude: 2.2,
    sparkleAlpha: 0.2,
    sparkleSize: 11,
    anchorYOffset: 22,
    nearGlowDistance: 120,
  },
  objective: {
    size: Math.round(42 * OBJECTIVE_MARKER_SCALE),
    mapTabletSize: Math.round(48 * OBJECTIVE_MARKER_SCALE),
    ringSize: 0,
    glowAlpha: 0,
    shadowAlpha: 0.17,
    bobAmplitude: 1.8,
    sparkleAlpha: 0.14,
    sparkleSize: 10,
    anchorYOffset: 22,
    nearGlowDistance: 150,
  },
  loreTablet: {
    size: Math.round(42 * LORE_TABLET_SCALE),
    ringSize: Math.round(54 * PICKUP_GLOW_SCALE),
    glowAlpha: 0.24,
    shadowAlpha: 0.15,
    bobAmplitude: 1.8,
    sparkleAlpha: 0.12,
    sparkleSize: 10,
    anchorYOffset: 22,
    nearGlowDistance: 130,
  },
};

export const GATE_HINTS = {
  objective: {
    'desert-entry': 'Turn back — the Lost Map Tablet is behind you in the desert. Read it to open this seal.',
    'ruined-temple': 'One switch is still behind you in the Ruined Temple.',
    catacombs: 'Search the catacomb floor for the remaining glyph fragment.',
    'escape-sequence': 'Reach the escape marker before the route seal will open.',
    'dig-site-entrance': 'The final guardian seal opens after the Ancient Construct falls.',
  },
  shards: 'Follow the visible necropolis path for the next relic shard; the old ravine bridge route is retired for this rebuild.',
  upgrade: 'Look back through this section for the missing upgrade route.',
};

export const HAZARD_VISUALS = {
  'thorn-bush': {
    icon: '!',
    label: 'Thorns',
    color: '#b91c1c',
    fill: 'rgba(127, 29, 29, 0.28)',
    accent: '#22c55e',
    message: 'Thorn bush scratched your legs.',
  },
  'sand-pit': {
    icon: '!',
    label: 'Soft Sand',
    color: '#92400e',
    fill: 'rgba(180, 83, 9, 0.26)',
    accent: '#facc15',
    message: 'Soft sand slowed you down.',
  },
  'spike-trap': {
    icon: '!',
    label: 'Trap',
    color: '#991b1b',
    fill: 'rgba(153, 27, 27, 0.24)',
    accent: '#f97316',
    message: 'Temple trap triggered.',
  },
  'rolling-stones': {
    icon: '!',
    label: 'Rolling Stones',
    color: '#7c2d12',
    fill: 'rgba(120, 53, 15, 0.24)',
    accent: '#fb923c',
    message: 'Rolling stones cost stamina.',
  },
  'dark-gap': {
    icon: '!',
    label: 'Dark Gap',
    color: '#111827',
    fill: 'rgba(15, 23, 42, 0.76)',
    accent: '#38bdf8',
    message: 'You stumbled in a dark gap.',
  },
  'bat-cloud': {
    icon: '!',
    label: 'Bat Cloud',
    color: '#581c87',
    fill: 'rgba(88, 28, 135, 0.28)',
    accent: '#c084fc',
    message: 'Bat cloud scattered the team.',
  },
  'falling-blocks': {
    icon: '!',
    label: 'Falling Blocks',
    color: '#7f1d1d',
    fill: 'rgba(127, 29, 29, 0.24)',
    accent: '#facc15',
    message: 'Falling rocks cost stamina.',
  },
  'dust-wave': {
    icon: '!',
    label: 'Dust Wave',
    color: '#92400e',
    fill: 'rgba(146, 64, 14, 0.22)',
    accent: '#fed7aa',
    message: 'Dust reduced visibility.',
  },
  'loose-slope': {
    icon: '!',
    label: 'Loose Slope',
    color: '#7c2d12',
    fill: 'rgba(120, 53, 15, 0.24)',
    accent: '#f59e0b',
    message: 'Loose stones made the climb harder.',
  },
  'entry-pressure-plate': {
    icon: '!',
    label: 'Pressure Plate',
    color: '#92400e',
    fill: 'rgba(202, 138, 4, 0.28)',
    accent: '#1d4ed8',
    message: 'Pressure plate triggered.',
  },
  'entry-cracked-floor-trap': {
    icon: '!',
    label: 'Cracked Floor',
    color: '#7c2d12',
    fill: 'rgba(120, 53, 15, 0.32)',
    accent: '#facc15',
    message: 'Cracked floor gave way.',
  },
  'opening-seal-reset-trap': {
    icon: '!',
    label: 'Seal Trap',
    color: '#0f766e',
    fill: 'rgba(14, 116, 144, 0.28)',
    accent: '#facc15',
    message: 'Seal trap pushed you back.',
  },
};

export const ENEMY_TACTICAL_PRESSURE = {
  scarab: { windup: 0.96, cooldown: 0.9, speed: 1.18, range: 1.08, recovery: 0.96, vulnerableAfter: 0.95, awareness: 1.70, chase: 2.05 },
  scorpion: { windup: 1, cooldown: 0.94, speed: 0.86, range: 0.88, recovery: 1.04, vulnerableAfter: 1.03, awareness: 1.60, chase: 1.85 },
  'sand-wisp': { windup: 0.92, cooldown: 0.9, speed: 1.16, range: 1.08, recovery: 0.96, vulnerableAfter: 0.96, awareness: 1.75, chase: 2 },
  snake: { windup: 0.98, cooldown: 0.92, speed: 1.14, range: 1.18, recovery: 1.02, vulnerableAfter: 1, awareness: 1.69, chase: 1.8 },
  bat: { windup: 0.9, cooldown: 0.84, speed: 1.14, range: 1.12, recovery: 0.92, vulnerableAfter: 0.9, awareness: 1.73, chase: 1.95 },
  looter: { windup: 0.88, cooldown: 0.8, speed: 1.16, range: 1.12, recovery: 0.9, vulnerableAfter: 0.88, awareness: 1.69, chase: 1.82, shieldDuringWindup: true },
  bes: { windup: 0.94, cooldown: 0.9, speed: 0.96, range: 1.14, recovery: 1, vulnerableAfter: 1, awareness: 1.65, chase: 1.62, shieldDuringWindup: true },
  mummy: { windup: 0.96, cooldown: 0.94, speed: 0.92, range: 1.08, recovery: 1.02, vulnerableAfter: 1, awareness: 1.57, chase: 1.56, shieldDuringWindup: true },
  guardian: { windup: 1, cooldown: 0.94, speed: 0.86, range: 1.08, recovery: 1.05, vulnerableAfter: 1.04, awareness: 1.51, chase: 1.48 },
  statue: { windup: 1, cooldown: 0.96, speed: 0.84, range: 1.08, recovery: 1.06, vulnerableAfter: 1.05, awareness: 1.47, chase: 1.42 },
  'river-crab': { windup: 0.94, cooldown: 0.86, speed: 1.1, range: 1.12, recovery: 0.94, vulnerableAfter: 0.92, awareness: 1.5, chase: 1.85 },
  'watchtower-sentry': { windup: 0.88, cooldown: 0.8, speed: 1.16, range: 1.12, recovery: 0.9, vulnerableAfter: 0.88, awareness: 1.54, chase: 1.82, shieldDuringWindup: true },
  'clay-guardian': { windup: 1, cooldown: 0.94, speed: 0.86, range: 1.08, recovery: 1.05, vulnerableAfter: 1.04, awareness: 1.36, chase: 1.48 },
};

export const SCARAB_POISONED_CHARGE_SPEED_MULTIPLIER = 1.28;
export const SCARAB_POISONED_CHARGE_START_BONUS = 110;

export const ENEMY_HIT_SFX_BY_TYPE = {
  scarab: 'scarabHit',
  scorpion: 'scorpionHit',
  snake: 'snakeHit',
  'sand-wisp': 'sandWispHit',
  bat: 'batHit',
  mummy: 'mummyHit',
  guardian: 'guardianHit',
  statue: 'statueHit',
};

export const getEnemyHitSfxKey = (enemy) => ENEMY_HIT_SFX_BY_TYPE[enemy?.type] || 'enemyHit';

export const AMBIENT_DRAMA_SFX_BY_SECTION = {
  'desert-entry': ['distantRockfall', 'distantMonsterCall', 'voidBassSwell', 'underworldHeartDrone'],
  'ruined-temple': ['templeStoneGroan', 'distantRuinCollapse', 'underworldHeartDrone', 'distantMonsterCall'],
  catacombs: ['distantMonsterCall', 'underworldHeartDrone', 'voidBassSwell'],
  'escape-sequence': ['structureRipping', 'majorCaveIn', 'realityTearRumble', 'distantRuinCollapse'],
  'dig-site-entrance': ['distantMonsterCall', 'voidBassSwell', 'realityTearRumble'],
};

export const getAmbientDramaSfxKey = (current, sectionId) => {
  const cues = AMBIENT_DRAMA_SFX_BY_SECTION[sectionId] || AMBIENT_DRAMA_SFX_BY_SECTION['desert-entry'];
  if (!cues?.length) return null;
  const pressure = current?.resources?.stamina <= 30 || sectionId === 'escape-sequence' || current?.bossDomain
    ? 1
    : 0;
  const index = Math.floor(Math.random() * cues.length + pressure) % cues.length;
  return cues[index];
};

export const SAND_TRAP_HAZARD_IDS = new Set([
  'sealed-sand',
  'sand-pit',
  'desert-low-ridge',
  'desert-soft-ridge',
  'sandfall-soft-pit',
  'sandfall-warning-dust',
  'escape-dust-pocket',
  'bat-cloud',
  'catacomb-bat-pocket',
]);

export const getHazardSfxKey = (hazard) => {
  if (hazard?.pushToStart) return 'trapReset';
  if (SAND_TRAP_HAZARD_IDS.has(hazard?.id)) return 'trapSandTrigger';
  return 'trapStoneTrigger';
};

export const HAZARD_GROUNDING = {
  'thorn-bush': {
    xPad: 4,
    yOffset: 4,
    widthPad: 8,
    heightPad: 8,
    shadow: 0.14,
    dustWidth: 0.74,
    filter: 'sepia(12%) saturate(68%) brightness(76%) contrast(92%) opacity(0.82)',
    warning: 'none',
  },
  'sand-pit': {
    xPad: 10,
    yOffset: 2,
    widthPad: 20,
    heightPad: -2,
    shadow: 0.08,
    dustWidth: 1.08,
    filter: 'sepia(12%) saturate(78%) brightness(94%)',
    warning: 'none',
  },
  'spike-trap': {
    xPad: 8,
    yOffset: 5,
    widthPad: 16,
    heightPad: 8,
    shadow: 0.18,
    dustWidth: 1.18,
    filter: 'sepia(18%) saturate(76%) brightness(86%) contrast(92%)',
    warning: 'none',
  },
  'rolling-stones': {
    xPad: 9,
    yOffset: 11,
    widthPad: 18,
    heightPad: 15,
    shadow: 0.26,
    dustWidth: 0.95,
    filter: 'sepia(8%) saturate(80%) brightness(88%)',
    warning: 'none',
  },
  'falling-blocks': {
    xPad: 10,
    yOffset: 10,
    widthPad: 20,
    heightPad: 14,
    shadow: 0.25,
    dustWidth: 0.94,
    filter: 'sepia(8%) saturate(78%) brightness(88%)',
    warning: 'none',
  },
  'dark-gap': {
    xPad: 8,
    yOffset: -1,
    widthPad: 16,
    heightPad: -2,
    shadow: 0.06,
    dustWidth: 1.04,
    filter: 'sepia(6%) saturate(70%) brightness(82%)',
    warning: 'none',
  },
  'dust-wave': {
    xPad: 8,
    yOffset: 1,
    widthPad: 16,
    heightPad: 6,
    shadow: 0.08,
    dustWidth: 1.08,
    filter: 'sepia(14%) saturate(72%) brightness(96%) opacity(0.78)',
    warning: 'none',
  },
  'bat-cloud': {
    xPad: 2,
    yOffset: 0,
    widthPad: 4,
    heightPad: 2,
    shadow: 0.02,
    dustWidth: 0,
    filter: 'saturate(72%) brightness(82%) opacity(0.74)',
    warning: 'none',
  },
  'sealed-sand': {
    xPad: 10,
    yOffset: 2,
    widthPad: 20,
    heightPad: 0,
    shadow: 0.1,
    dustWidth: 1.08,
    filter: 'sepia(10%) saturate(84%) brightness(96%)',
    warning: 'none',
  },
  'loose-temple-floor': {
    xPad: 10,
    yOffset: 5,
    widthPad: 20,
    heightPad: 6,
    shadow: 0.16,
    dustWidth: 1,
    filter: 'sepia(10%) saturate(82%) brightness(90%)',
    warning: 'none',
  },
  'glyph-tripwire': {
    xPad: 12,
    yOffset: 2,
    widthPad: 24,
    heightPad: 0,
    shadow: 0.1,
    dustWidth: 1.04,
    filter: 'sepia(6%) saturate(92%) brightness(96%)',
    warning: 'none',
  },
  'survey-rope': {
    xPad: 8,
    yOffset: 1,
    widthPad: 16,
    heightPad: 2,
    shadow: 0.1,
    dustWidth: 1.04,
    filter: 'sepia(8%) saturate(82%) brightness(94%)',
    warning: 'none',
  },
  'warning-rubble': {
    xPad: 8,
    yOffset: 3,
    widthPad: 16,
    heightPad: 4,
    shadow: 0.12,
    dustWidth: 1.02,
    filter: 'sepia(12%) saturate(76%) brightness(90%)',
    warning: 'none',
  },
  'loose-slope': {
    xPad: 9,
    yOffset: 3,
    widthPad: 18,
    heightPad: 4,
    shadow: 0.1,
    dustWidth: 1,
    filter: 'sepia(10%) saturate(74%) brightness(90%)',
    warning: 'none',
  },
  'entry-pressure-plate': {
    xPad: 12,
    yOffset: 4,
    widthPad: 24,
    heightPad: 2,
    shadow: 0.16,
    dustWidth: 1.08,
    filter: 'sepia(8%) saturate(96%) brightness(102%)',
    warning: 'ground',
  },
  'entry-cracked-floor-trap': {
    xPad: 10,
    yOffset: 6,
    widthPad: 20,
    heightPad: 7,
    shadow: 0.2,
    dustWidth: 1,
    filter: 'sepia(10%) saturate(86%) brightness(92%)',
    warning: 'ground',
  },
  'opening-seal-reset-trap': {
    xPad: 12,
    yOffset: 4,
    widthPad: 24,
    heightPad: 4,
    shadow: 0.18,
    dustWidth: 1.12,
    filter: 'sepia(6%) saturate(112%) brightness(102%)',
    warning: 'ground',
  },
};

export const HAZARD_VISUAL_ALIASES = {
  'collapsing-stone-floor': 'entry-cracked-floor-trap',
  'hidden-sand-pit': 'sand-pit',
  'dart-launcher': 'entry-pressure-plate',
  'desert-low-ridge': 'sand-pit',
  'desert-soft-ridge': 'sand-pit',
  'temple-loose-step': 'loose-temple-floor',
  'temple-floor-crack': 'entry-cracked-floor-trap',
  'temple-threshold-hairline-crack': 'entry-cracked-floor-trap',
  'broken-ruins-loose-stones': 'warning-rubble',
  'rolling-stones': 'warning-rubble',
  'sandfall-collapsing-stones': 'warning-rubble',
  'temple-falling-chip': 'falling-blocks',
  'catacomb-small-gap': 'dark-gap',
  'catacomb-gap-2': 'dark-gap',
  'catacomb-bat-pocket': 'bat-cloud',
  'escape-cracked-step': 'entry-cracked-floor-trap',
  'escape-falling-chip': 'falling-blocks',
  'escape-dust-pocket': 'dust-wave',
  'camp-low-rope': 'survey-rope',
  'dig-site-loose-rope': 'survey-rope',
  'dig-site-loose-slope-2': 'loose-slope',
};

export const getHazardVisualId = (hazard) => HAZARD_VISUAL_ALIASES[hazard.type] || HAZARD_VISUAL_ALIASES[hazard.id] || hazard.id;

export const getEgyptHazardDecalDescriptor = (hazard) => {
  const visualId = getHazardVisualId(hazard);
  const trapRegionKey = OPENING_TRAP_DECAL_BY_HAZARD[hazard.id] || OPENING_TRAP_DECAL_BY_HAZARD[visualId] || null;
  if (trapRegionKey) return { pack: 'trap', regionKey: trapRegionKey };
  const hazardRegionKey = OPENING_HAZARD_DECAL_BY_HAZARD[hazard.id] || OPENING_HAZARD_DECAL_BY_HAZARD[visualId] || null;
  if (hazardRegionKey) return { pack: 'hazard', regionKey: hazardRegionKey };
  return null;
};

export const getEgyptHazardDecalDest = (hazard, screenX, footY, regionKey) => {
  const placement = EGYPT_HAZARD_DECAL_PLACEMENT_BY_HAZARD[hazard.id] || EGYPT_HAZARD_DECAL_PLACEMENT[regionKey] || {};
  const width = Math.max(28, hazard.width + (placement.widthPad ?? 28));
  const height = Math.max(24, placement.height ?? hazard.height + 32);
  return {
    x: screenX - (placement.xPad ?? 14),
    y: footY - height + (placement.footInset ?? 0),
    width,
    height,
  };
};

export const getHazardVisualConfig = (hazard) => {
  const baseId = getHazardVisualId(hazard);
  return HAZARD_VISUALS[baseId] || {
    icon: '!',
    label: hazard.name,
    color: '#7f1d1d',
    fill: 'rgba(127, 29, 29, 0.24)',
    accent: '#facc15',
    message: hazard.message,
  };
};

export const getHazardGroundingConfig = (hazard) => {
  const baseId = getHazardVisualId(hazard);
  return HAZARD_GROUNDING[baseId] || HAZARD_GROUNDING['spike-trap'];
};

export const getHazardBurialAmount = (hazard = {}) => {
  if (Number.isFinite(hazard.burial)) return clamp(hazard.burial, 0, 0.85);
  return 0;
};

export const PROP_GROUNDING_CONFIG = {
  ruins: { width: 104, height: 94, yOffset: 92, alpha: 1, depth: 'background', tint: 'dust', shadow: 0.1, dust: 0.52 },
  camp: { width: 86, height: 58, yOffset: 18, alpha: 1, depth: 'background', tint: 'dust', shadow: 0.12, dust: 0.58 },
  column: { width: 96, height: 86, yOffset: 62, alpha: 1, depth: 'midground', tint: 'buried-stone', shadow: 0.18, dust: 0.86, bury: 0.3 },
  cart: { depth: 'midground' },
  door: { width: 118, height: 150, yOffset: 132, alpha: 1, depth: 'background', tint: 'dust', shadow: 0.12, dust: 0.58 },
  statue: { width: 70, height: 90, yOffset: 54, alpha: 1, depth: 'background', tint: 'stone', shadow: 0.12, dust: 0.58 },
  'jackal-statue': { width: 82, height: 122, yOffset: 88, alpha: 0.96, depth: 'midground', tint: 'stone', shadow: 0.28, dust: 0.9, bury: 0.14 },
  'damaged-jackal-statue': { width: 92, height: 118, yOffset: 88, alpha: 1, depth: 'midground', tint: 'stone', shadow: 0.26, dust: 0.9, bury: 0.18 },
  bridge: { width: 168, height: 62, yOffset: 20, alpha: 1, depth: 'midground', tint: 'warm', shadow: 0.2, dust: 0.72 },
  'survey-rope': { width: 118, height: 42, yOffset: 20, alpha: 1, depth: 'midground', tint: 'warm', shadow: 0.1, dust: 0.54, bury: 0.08 },
  lights: { width: 42, height: 62, yOffset: 18, alpha: 1, depth: 'background', tint: 'cool', shadow: 0.08, dust: 0.44 },
  banners: { width: 76, height: 48, yOffset: 28, alpha: 1, depth: 'background', tint: 'dust', shadow: 0.08, dust: 0.48 },
  'sacred-pedestal': { width: 84, height: 72, yOffset: 38, alpha: 1, depth: 'midground', tint: 'warm', shadow: 0.22, dust: 0.78 },
  'sacred-pedestal-activated': { width: 84, height: 72, yOffset: 38, alpha: 1, depth: 'midground', tint: 'warm', shadow: 0.28, dust: 0.84 },
  'guardian-seal': { width: 46, height: 46, yOffset: 8, alpha: 1, depth: 'midground', tint: 'warm', shadow: 0.12, dust: 0.42 },
  'guardian-seal-activated': { width: 52, height: 52, yOffset: 10, alpha: 1, depth: 'midground', tint: 'warm', shadow: 0.18, dust: 0.48 },
  'atmosphere-prop': { width: 96, height: 82, yOffset: 0, alpha: 1, depth: 'midground', shadow: 0.14, dust: 0.72, bury: 0.12 },
  mural: { depth: 'background' },
  glyphs: { depth: 'background' },
  eyes: { depth: 'background' },
  sign: { depth: 'midground' },
};

export const STORY_PROP_GROUNDING_OVERRIDES = {
  'early-scarab-seal-pedestal': {
    width: 54,
    height: 42,
    yOffset: 0,
    alpha: 0.98,
    depth: 'midground',
    tint: 'warm',
    shadow: 0.16,
    dust: 0.54,
  },
  'early-scarab-seal': {
    width: 38,
    height: 38,
    yOffset: 0,
    alpha: 1,
    depth: 'midground',
    tint: 'warm',
    shadow: 0.08,
    dust: 0.32,
  },
};

export const ATMOSPHERE_GROUND_LOCK_MARGIN = 5;
export const ATMOSPHERE_GROUND_LOCKED_ASSET_KEYS = new Set([
  'supplyJars',
  'fieldChest',
  'coinPile',
  'scrollCache',
  'rubbleScatter',
  'rubbleDustSmall',
  'fallenColumn',
  'pillarCaps',
]);

export const isGroundLockedAtmosphereProp = (prop) => (
  prop?.type === 'atmosphere-prop'
  && ATMOSPHERE_GROUND_LOCKED_ASSET_KEYS.has(prop.atmosphereAssetKey)
);

export const shouldGroundLockAtmosphereProp = (prop, propDepth) => (
  prop?.type === 'atmosphere-prop'
  && (propDepth === 'route-edge' || isGroundLockedAtmosphereProp(prop))
);

export const PROP_PLACEMENT_PRESETS = {
  desertEntryGroundedRuin: {
    depth: 'grounded',
    tint: 'buried-stone',
    sceneBlend: 'desert-entry-sand',
    groundPlaneOffset: -6,
    assetContactYRatio: 1,
    burialDepth: 0.24,
    shadowOpacity: 0.34,
    shadowHeight: 8,
    sandOverlapHeight: 14,
    sandMoundHeight: 10,
    groundPebbles: 3,
    alpha: 1,
  },
};

export const getStoryPropPlacementPreset = (prop) => (
  prop?.placementPreset ? PROP_PLACEMENT_PRESETS[prop.placementPreset] || null : null
);

export const getStoryPropExplicitGroundY = (propSize = {}) => {
  if (Number.isFinite(propSize.groundPlaneY)) return propSize.groundPlaneY;
  if (Number.isFinite(propSize.groundPlaneOffset)) return GROUND_Y + propSize.groundPlaneOffset;
  return null;
};

export const getStoryPropAnchorY = (prop, propSize, shouldGroundLock) => {
  const yOffset = Number.isFinite(propSize.yOffset) ? propSize.yOffset : 0;
  const rawAnchorY = prop.y + yOffset;
  const explicitGroundY = getStoryPropExplicitGroundY(propSize);
  if (Number.isFinite(explicitGroundY)) return explicitGroundY + yOffset;
  return shouldGroundLock
    ? Math.max(rawAnchorY, GROUND_Y - ATMOSPHERE_GROUND_LOCK_MARGIN)
    : rawAnchorY;
};

export const getStoryPropDepth = (prop) => {
  if (['background', 'midground', 'grounded', 'route-edge', 'foreground-occluder'].includes(prop.depth)) return prop.depth;
  const placementPreset = getStoryPropPlacementPreset(prop);
  if (placementPreset?.depth) return placementPreset.depth;
  if (isGroundLockedAtmosphereProp(prop)) return 'grounded';
  return STORY_PROP_GROUNDING_OVERRIDES[prop.id]?.depth
    || (PROP_GROUNDING_CONFIG[prop.type] || {}).depth
    || 'midground';
};

export const GENERATED_STORY_PROP_BOUNDS = {
  'generated-opening-pyramid-facade': { width: 1208, height: 664 },
  'generated-mummification-chamber-entrance': { width: 1500, height: 760 },
  'generated-climb-structure': { width: 1420, height: 690 },
  'generated-scribe-chamber-doorway': { width: 1120, height: 620 },
};
export const GENERATED_STORY_PROP_PREVIEW_SOURCES = {
  'generated-opening-pyramid-facade': {
    assetKey: 'Opening Pyramid facade',
    src: OPENING_PYRAMID_FACADE_SRC,
  },
  'generated-mummification-chamber-entrance': {
    assetKey: 'Mummification Chamber exterior',
    src: MUMMIFICATION_CHAMBER_EXTERIOR_SRC,
  },
  'generated-climb-structure': {
    assetKey: 'Forgotten Mural climb structure',
    src: FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_SRC,
  },
  'generated-scribe-chamber-doorway': {
    assetKey: 'Scribe Chamber exterior',
    src: SCRIBE_CHAMBER_EXTERIOR_SRC,
  },
};
export const GENERATED_STORY_PROP_TYPES = new Set(Object.keys(GENERATED_STORY_PROP_BOUNDS));
export const isGeneratedStoryStructureProp = (prop = {}) => GENERATED_STORY_PROP_TYPES.has(prop.type);

export const STORY_PROP_DEPTH_ORDER = {
  background: 0,
  midground: 1,
  grounded: 2,
  'route-edge': 3,
  'foreground-occluder': 4,
};
export const PROP_EDITOR_DEPTH_OPTIONS = ['background', 'midground', 'grounded', 'route-edge', 'foreground-occluder'];
// Named render layers a prop can be tagged with. Depth (above) drives stacking order;
// layer is the broader band the prop belongs to. Free-form in the data, but these are
// the values in active use — the editor appends any custom value so none is ever lost.
export const PROP_EDITOR_LAYER_OPTIONS = ['default', 'background', 'foreground', 'overlay', 'route-edge'];

// Turn a picked hex colour into HSL so the tint picker can build a colorize filter.
export const journeyHexToHsl = (hex) => {
  let value = String(hex || '').trim().replace(/^#/, '');
  if (value.length === 3) value = value.split('').map(ch => ch + ch).join('');
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
};

// Build a CSS colour-grade filter that tints a prop toward a picked colour at a given
// strength (0-1), reusing the existing colorGradeFilter render path (which works on every
// gradeable prop). sepia creates a colour base, hue-rotate aims it at the target hue, and
// saturate reaches the target chroma. Brightness stays a separate control.
export const buildJourneyTintGradeFilter = (hex, strength) => {
  const st = Math.max(0, Math.min(1, Number(strength) || 0));
  if (st <= 0) return '';
  const hsl = journeyHexToHsl(hex);
  if (!hsl) return '';
  const sepia = Math.round(st * 100);
  const hueRot = Math.round(hsl.h - 40);
  const saturate = Math.round((1 + st * (0.4 + hsl.s * 1.4)) * 100);
  return `sepia(${sepia}%) hue-rotate(${hueRot}deg) saturate(${saturate}%)`;
};

// True-colour "paint" tint. Unlike buildJourneyTintGradeFilter (a photo filter that
// can only shift existing colours, so vivid/clean targets come out muddy), this
// multiplies a solid colour onto the sprite — so picking blue gives blue while the
// art's light/shadow detail is preserved. Works only on image/atlas props (procedural
// props draw their own colours and ignore it). Done in cached offscreen buffers so
// the multiply is clipped to the sprite's silhouette and never bleeds onto the scene.
export const JOURNEY_PAINT_TINT_CACHE_LIMIT = 80;
export const journeyPaintTintBufferCache = new Map();
export const getJourneyPaintTintBuffer = (width, height, cacheKey, paintBuffer) => {
  if (typeof document === 'undefined') return null;
  const bufferWidth = Math.max(1, Math.ceil(width));
  const bufferHeight = Math.max(1, Math.ceil(height));
  const key = typeof cacheKey === 'string' && cacheKey ? cacheKey : '';
  if (key && journeyPaintTintBufferCache.has(key)) {
    const cached = journeyPaintTintBufferCache.get(key);
    journeyPaintTintBufferCache.delete(key);
    journeyPaintTintBufferCache.set(key, cached);
    return cached;
  }

  const buf = document.createElement('canvas');
  buf.width = bufferWidth;
  buf.height = bufferHeight;
  const ctx = buf.getContext('2d');
  if (!ctx) return null;
  const entry = { canvas: buf, ctx, width: bufferWidth, height: bufferHeight };
  if (typeof paintBuffer === 'function' && paintBuffer(ctx, entry) === false) return null;

  if (key) {
    journeyPaintTintBufferCache.set(key, entry);
    while (journeyPaintTintBufferCache.size > JOURNEY_PAINT_TINT_CACHE_LIMIT) {
      const oldestKey = journeyPaintTintBufferCache.keys().next().value;
      journeyPaintTintBufferCache.delete(oldestKey);
    }
  }
  return entry;
};

// Filter the prop palette by a free-text query, matching label, key, asset key, or
// group/category name (so e.g. "tomb" finds everything under Tomb Architecture).
export const filterJourneyPaletteBySearch = (items = [], query = '') => {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    const assetKey = item.preview?.assetKey || item.atmosphereAssetKey || item.type || '';
    return `${item.label || ''} ${item.key || ''} ${item.category || ''} ${assetKey}`.toLowerCase().includes(q);
  });
};

export const getStoryPropEditorSize = (prop = {}) => {
  const generated = GENERATED_STORY_PROP_BOUNDS[prop.type];
  if (generated) {
    const propSize = {
      ...generated,
      ...(Number.isFinite(prop.width) ? { width: prop.width } : {}),
      ...(Number.isFinite(prop.height) ? { height: prop.height } : {}),
      ...(Number.isFinite(prop.scale) ? { scale: prop.scale } : {}),
      yOffset: 0,
      depth: getStoryPropDepth(prop),
    };
    if (Number.isFinite(propSize.scale)) {
      propSize.width *= propSize.scale;
      propSize.height *= propSize.scale;
    }
    return propSize;
  }
  const placementPreset = getStoryPropPlacementPreset(prop) || {};
  const propSize = {
    ...(PROP_GROUNDING_CONFIG[prop.type] || { width: 72, height: 72, yOffset: 0, alpha: 0.78, depth: 'midground', tint: 'warm' }),
    ...(STORY_PROP_GROUNDING_OVERRIDES[prop.id] || {}),
    ...placementPreset,
    ...(Number.isFinite(prop.width) ? { width: prop.width } : {}),
    ...(Number.isFinite(prop.height) ? { height: prop.height } : {}),
    ...(Number.isFinite(prop.yOffset) ? { yOffset: prop.yOffset } : {}),
    ...(Number.isFinite(prop.scale) ? { scale: prop.scale } : {}),
    ...(prop.depth ? { depth: prop.depth } : {}),
  };
  if (Number.isFinite(propSize.scale)) {
    propSize.width *= propSize.scale;
    propSize.height *= propSize.scale;
  }
  return propSize;
};

export const getGeneratedStoryPropRenderProp = (prop = {}) => {
  const generated = GENERATED_STORY_PROP_BOUNDS[prop.type];
  if (!generated || !Number.isFinite(prop.scale)) return prop;
  const width = Number.isFinite(prop.width) ? prop.width : generated.width;
  const height = Number.isFinite(prop.height) ? prop.height : generated.height;
  return {
    ...prop,
    width: width * prop.scale,
    height: height * prop.scale,
  };
};

export const getStoryPropEditorBounds = (prop, cameraX, current) => {
  const propDepth = getStoryPropDepth(prop);
  const propSize = getStoryPropEditorSize(prop);
  const x = worldToScreenX(prop.x, cameraX);
  const verticalOffset = !isInteriorChamberScene(current) ? current.secretVerticalCameraOffset || 0 : 0;
  const insetTop = clamp(Number(prop.editorBoundsInsetTop) || 0, 0, propSize.height - 1);
  const insetRight = clamp(Number(prop.editorBoundsInsetRight) || 0, 0, propSize.width - 1);
  const insetBottom = clamp(Number(prop.editorBoundsInsetBottom) || 0, 0, propSize.height - 1);
  const insetLeft = clamp(Number(prop.editorBoundsInsetLeft) || 0, 0, propSize.width - 1);
  const trimmedWidth = Math.max(1, propSize.width - insetLeft - insetRight);
  const trimmedHeight = Math.max(1, propSize.height - insetTop - insetBottom);
  if (GENERATED_STORY_PROP_BOUNDS[prop.type]) {
    return {
      x: x - propSize.width / 2 + insetLeft,
      y: prop.y + verticalOffset + insetTop,
      width: trimmedWidth,
      height: trimmedHeight,
      depth: propDepth,
    };
  }
  const shouldGroundLock = shouldGroundLockAtmosphereProp(prop, propDepth);
  const propGrounding = resolvePropGroundingSettings({ ...propSize, x: prop.x });
  const anchorY = getStoryPropAnchorY(prop, propSize, shouldGroundLock);
  return {
    x: x - propSize.width / 2 + insetLeft,
    y: anchorY - propSize.height * propGrounding.contactRatio + verticalOffset + insetTop,
    width: trimmedWidth,
    height: trimmedHeight,
    depth: propDepth,
  };
};

export const getScaledDetailContactLayer = (prop = {}, detailSize = {}) => {
  const baseWidth = Math.max(1, Number(prop.width) || Number(detailSize.width) || 1);
  const baseHeight = Math.max(1, Number(prop.height) || Number(detailSize.height) || 1);
  const widthRatio = Math.max(0.01, (Number(detailSize.width) || baseWidth) / baseWidth);
  const heightRatio = Math.max(0.01, (Number(detailSize.height) || baseHeight) / baseHeight);
  return (prop.groundContactLayer || []).map(entry => ({
    ...entry,
    widthRatio: Number.isFinite(entry.widthRatio) ? entry.widthRatio * widthRatio : widthRatio,
    height: Number.isFinite(entry.height) ? entry.height * heightRatio : detailSize.height,
    yOffset: Number.isFinite(entry.yOffset) ? entry.yOffset * heightRatio : -detailSize.height,
  }));
};

// On-canvas transform handles for the selected story prop. Corner squares scale the
// prop (uniform, since the renderer fits art aspect-locked); the knob above the box
// rotates it. Sizes are imported from the primitive drawer so visuals match clicks.
export const hitTestPropTransformHandle = (px, py, bounds) => {
  const corners = [
    ['nw', bounds.x, bounds.y],
    ['ne', bounds.x + bounds.width, bounds.y],
    ['sw', bounds.x, bounds.y + bounds.height],
    ['se', bounds.x + bounds.width, bounds.y + bounds.height],
  ];
  for (const [name, hx, hy] of corners) {
    if (Math.abs(px - hx) <= PROP_EDITOR_HANDLE_HIT && Math.abs(py - hy) <= PROP_EDITOR_HANDLE_HIT) return name;
  }
  const cx = bounds.x + bounds.width / 2;
  const rotY = bounds.y - PROP_EDITOR_ROTATE_OFFSET;
  if (Math.hypot(px - cx, py - rotY) <= PROP_EDITOR_HANDLE_HIT) return 'rotate';
  return null;
};

export const finiteNumber = (value, fallback) => (Number.isFinite(value) ? value : fallback);

export const resolvePropGroundingSettings = (config = {}) => {
  const width = finiteNumber(config.width, 72);
  const height = finiteNumber(config.height, 72);
  const contactRatio = clamp(finiteNumber(config.assetContactYRatio, 1), 0.48, 1.08);
  const burialRatio = clamp(finiteNumber(config.burialDepth, finiteNumber(config.bury, 0.12)), 0, 0.72);
  const dustScale = finiteNumber(config.dust, 0.72);
  const defaultSandOverlap = Math.max(6, Math.min(height * 0.58, height * burialRatio));
  const sandOverlapHeight = clamp(
    finiteNumber(config.sandOverlapHeight, defaultSandOverlap),
    0,
    Math.max(8, height * 0.68),
  );
  const shadowWidth = finiteNumber(config.shadowWidth, width * (config.depth === 'background' ? 0.62 : 0.92));
  const shadowHeight = finiteNumber(config.shadowHeight, Math.max(5, shadowWidth / 12));
  const shadowOpacity = clamp(finiteNumber(config.shadowOpacity, finiteNumber(config.shadow, 0.22)), 0, 0.42);
  return {
    contactRatio,
    burialRatio,
    sandOverlapHeight,
    sandMoundWidth: finiteNumber(config.sandMoundWidth, width * Math.max(0.72, dustScale)),
    sandMoundHeight: finiteNumber(config.sandMoundHeight, Math.max(8, sandOverlapHeight * 0.72)),
    shadowWidth,
    shadowHeight,
    shadowOpacity,
    groundPebbles: finiteNumber(config.groundPebbles, config.depth === 'background' ? 1 : 3),
    seed: finiteNumber(config.sandSeed, finiteNumber(config.x, width)),
  };
};

export const DECORATIVE_PROP_LAYER_MODE = 'background-midground-grounded-depth-v3';
export const PROP_DEPTH_TUNING_VERSION = 'journey-grounded-placement-presets-2026-05-26';
export const PROP_GROUNDING_INTEGRATION_VERSION = 'prop-contact-shadow-local-sediment-occlusion-v4';
export const ROUTE_GROUND_VISUAL_MODE = 'desert-entry-painted-background-route-v1';
export const ROUTE_GROUND_HAZE_FIX_VERSION = 'necropolis-route-ground-world-locked-2026-06-25';
export const DESERT_ENTRY_VISUAL_GROUND_PLANE_OFFSET_Y = 0;
export const DESERT_ENTRY_VISUAL_GROUND_FOOT_TOLERANCE = 26;
// Grounded desert-entry enemies render with a per-family `groundOffset` (journeyEnemySprites.js)
// that sinks their sprite below the painted route after the background rebuild, while the player
// anchors flush at the floor. This lifts ONLY grounded desert-entry enemy sprites back onto the
// route. Scoped to enemies + desert-entry; the player, other acts, bridge-deck enemies, flyers, and
// the nest are excluded. Per-TYPE because each sprite's art has different empty padding under the
// feet: bump a type up if it still sits sunk, down if it floats. `default` covers any other type.
export const DESERT_ENTRY_ENEMY_FOOT_LIFT = {
  scorpion: 7,
  scarab: 7,
  snake: 14,
  default: 8,
};
export const FOREGROUND_DEPTH_LAYER_MODE = 'edge-framed-visual-only-no-collision';
export const ENABLE_FOREGROUND_DEPTH_LAYER = false;
export const DRAW_JOURNEY_FLAG_MARKERS = false;
export const JOURNEY_FLAG_VISUAL_MODE = 'flags-removed-stone-cairns-v1';
export const WORLD_CONTINUITY_VERSION = 'connected-expedition-world-2026-05-16';
export const REACTIVE_ENVIRONMENT_VERSION = 'reactive-expedition-world-2026-05-16';
export const DYNAMIC_WORLD_VERSION = 'dynamic-expedition-world-storytelling-2026-05-16';
export const DISCOVERY_ENTRANCE_REVEAL_SECONDS = 2.2;

export const SECTION_PARALLAX_LAYERS = {
  'ruined-temple': [
    { key: 'templeSky', y: 0, height: CANVAS_HEIGHT, parallax: 0, alpha: 1 },
  ],
  catacombs: [
    { key: 'undergroundAtmosphere', y: 0, height: CANVAS_HEIGHT, parallax: 0, alpha: 1 },
  ],
  'escape-sequence': [
    { key: 'dangerAtmosphere', y: 0, height: CANVAS_HEIGHT, parallax: 0, alpha: 1 },
  ],
  'dig-site-entrance': [
    { key: 'skyLayer', y: 0, height: CANVAS_HEIGHT, parallax: 0, alpha: 1 },
  ],
  'via-sacra': [
    { key: 'viaSacraSky', y: 0, height: CANVAS_HEIGHT, parallax: 0, alpha: 1 },
    { key: 'farAqueductArches', y: 0, height: CANVAS_HEIGHT, parallax: 0.08, alpha: 0.98 },
    { key: 'distantHillSide', y: 0, height: CANVAS_HEIGHT, parallax: 0.14, alpha: 0.94 },
    { key: 'midgroundRoadRuins', y: 0, height: CANVAS_HEIGHT, parallax: 0.25, alpha: 1 },
    // Foreground rubble: drawn at ~80% height, bottom-anchored, so the 3:1 art
    // doesn't render oversized vs the old 2.44:1 plate; full alpha keeps it solid.
    { key: 'foregroundDust', y: Math.round(CANVAS_HEIGHT * 0.2), height: Math.round(CANVAS_HEIGHT * 0.8), parallax: 0.48, alpha: 1 },
  ],
  'forum-ruins': [
    { key: 'forumSky', y: 0, height: CANVAS_HEIGHT, parallax: 0, alpha: 1 },
    { key: 'farTempleColonnades', y: 0, height: CANVAS_HEIGHT, parallax: 0.07, alpha: 0.8 },
    { key: 'distantForumRuins', y: 0, height: CANVAS_HEIGHT, parallax: 0.14, alpha: 0.92 },
    { key: 'midgroundForumFloor', y: 0, height: CANVAS_HEIGHT, parallax: 0.26, alpha: 0.96 },
    { key: 'foregroundColumnDust', y: 0, height: CANVAS_HEIGHT, parallax: 0.5, alpha: 0.72 },
  ],
  'subterranean-thermae': [
    { key: 'thermaeDeepAtmosphere', y: 0, height: CANVAS_HEIGHT, parallax: 0, alpha: 1 },
    { key: 'farHypocaustPillars', y: 0, height: CANVAS_HEIGHT, parallax: 0.08, alpha: 0.92 },
    { key: 'distantBarrelVaults', y: 0, height: CANVAS_HEIGHT, parallax: 0.14, alpha: 1 },
    { key: 'midgroundSteamChannels', y: 0, height: CANVAS_HEIGHT, parallax: 0.26, alpha: 1 },
    { key: 'foregroundSteamMist', y: 0, height: CANVAS_HEIGHT, parallax: 0.52, alpha: 0.78 },
  ],
  'basilica-interior': [
    { key: 'basilicaSky', y: 0, height: CANVAS_HEIGHT, parallax: 0, alpha: 1 },
    { key: 'farApseWall', y: 0, height: CANVAS_HEIGHT, parallax: 0.06, alpha: 0.96 },
    { key: 'distantNaveColumns', y: 0, height: CANVAS_HEIGHT, parallax: 0.13, alpha: 1 },
    { key: 'midgroundMarbleFloor', y: 0, height: CANVAS_HEIGHT, parallax: 0.27, alpha: 1 },
    { key: 'foregroundColumnShadow', y: 0, height: CANVAS_HEIGHT, parallax: 0.48, alpha: 0.86 },
  ],
  'sealed-vault': [
    { key: 'vaultDarkAtmosphere', y: 0, height: CANVAS_HEIGHT, parallax: 0, alpha: 1 },
    { key: 'farInscribedWalls', y: 0, height: CANVAS_HEIGHT, parallax: 0.08, alpha: 1 },
    { key: 'distantSealedArchways', y: 0, height: CANVAS_HEIGHT, parallax: 0.16, alpha: 1 },
    { key: 'midgroundVaultFloor', y: 0, height: CANVAS_HEIGHT, parallax: 0.28, alpha: 1 },
    { key: 'foregroundAshDrift', y: 0, height: CANVAS_HEIGHT, parallax: 0.5, alpha: 0.8 },
  ],
};

export const isJourneyFloorPlatform = (platform = {}) => {
  const platformKey = `${platform.id || ''} ${platform.label || ''}`.toLowerCase();
  return platformKey.includes('floor')
    || platformKey.includes('track')
    || platformKey.includes('path')
    || platformKey.includes('road')
    || platformKey.includes('rise');
};

export const isJourneyBlockerPlatform = (platform = {}) => platform.collision === 'blocker';

export const getJourneyBlockerLineX = (blocker, player) => {
  if (blocker.blockerShape !== 'left-slant' && blocker.blockerShape !== 'right-slant') return null;
  const blockerHeight = Math.max(1, Number(blocker.height) || 1);
  const centerY = clamp(
    player.y + player.height / 2,
    blocker.y,
    blocker.y + blockerHeight,
  );
  const yRatio = clamp((centerY - blocker.y) / blockerHeight, 0, 1);
  const width = Math.max(1, Number(blocker.width) || 1);
  if (blocker.blockerShape === 'left-slant') return blocker.x + width * (1 - yRatio);
  if (blocker.blockerShape === 'right-slant') return blocker.x + width * yRatio;
  return null;
};

export const resolveJourneyBlockerPlatformCollision = (player, previousPlayer, blocker) => {
  if (!isJourneyBlockerPlatform(blocker) || !rectsOverlap(player, blocker)) return false;
  const slantLineX = getJourneyBlockerLineX(blocker, player);
  if (Number.isFinite(slantLineX)) {
    const movedRight = player.x >= previousPlayer.x;
    player.x = movedRight
      ? slantLineX - player.width - 1
      : slantLineX + 1;
    player.vx = movedRight ? Math.min(0, player.vx) : Math.max(0, player.vx);
    return true;
  }
  const previousRight = previousPlayer.x + previousPlayer.width;
  const blockerRight = blocker.x + blocker.width;
  const crossedFromLeft = previousRight <= blocker.x + 2;
  const crossedFromRight = previousPlayer.x >= blockerRight - 2;
  const movedRight = crossedFromLeft || (!crossedFromRight && player.x >= previousPlayer.x);

  player.x = movedRight
    ? blocker.x - player.width - 1
    : blockerRight + 1;
  player.vx = movedRight ? Math.min(0, player.vx) : Math.max(0, player.vx);
  return true;
};

export const isJourneyEditorFormTarget = (target) => {
  const tagName = target?.tagName;
  return tagName === 'INPUT'
    || tagName === 'TEXTAREA'
    || tagName === 'SELECT'
    || target?.isContentEditable;
};

export const getDirectionFromPlayer = (playerX, targetX) => {
  if (targetX == null) return 'nearby';
  if (targetX < playerX - 35) return 'left';
  if (targetX > playerX + 35) return 'right';
  return 'nearby';
};

export const getDirectionText = (direction) => (
  direction === 'left' ? 'behind you' : direction === 'right' ? 'ahead' : 'nearby'
);

export const formatMissingSummary = (missing) => {
  if (missing.length === 0) return 'all route tasks are ready';
  if (missing.length === 1) return missing[0].shortMissing;
  if (missing.length === 2) return `${missing[0].shortMissing} and ${missing[1].shortMissing}`;
  return `${missing.slice(0, -1).map(item => item.shortMissing).join(', ')} and ${missing[missing.length - 1].shortMissing}`;
};

export const getCameraFollowTarget = (current) => {
  const playerCenterX = current.player.x + current.player.width / 2;
  if (isTempleThresholdHallScene(current)) {
    return {
      mode: 'fixed-scene',
      focusTarget: Math.round(playerCenterX),
      targetCameraX: TEMPLE_THRESHOLD_HALL_CAMERA_X,
    };
  }
  if (isMummificationChamberScene(current)) {
    return {
      mode: 'fixed-scene',
      focusTarget: Math.round(playerCenterX),
      targetCameraX: MUMMIFICATION_CHAMBER_CAMERA_X,
    };
  }
  if (isForgottenMuralChamberScene(current)) {
    return {
      mode: 'fixed-scene',
      focusTarget: Math.round(playerCenterX),
      targetCameraX: FORGOTTEN_MURAL_CHAMBER_CAMERA_X,
    };
  }
  if (isScribeLockedChamberScene(current)) {
    return {
      mode: 'fixed-scene',
      focusTarget: Math.round(playerCenterX),
      targetCameraX: SCRIBE_CHAMBER_CAMERA_X,
    };
  }

  if (current.openingThresholdScene?.lockMovement) {
    return {
      mode: 'opening-threshold',
      focusTarget: Math.round(current.openingThresholdScene.focusX || playerCenterX),
      targetCameraX: clampCameraX((current.openingThresholdScene.focusX || playerCenterX) - CANVAS_WIDTH * 0.54),
    };
  }

  if (current.arrivalThresholdActive) {
    return {
      mode: 'arrival-threshold',
      focusTarget: Math.round(playerCenterX),
      targetCameraX: 0,
    };
  }

  if (current.bossIntroTimer > 0 && current.bossIntro?.focusX) {
    if (Number.isFinite(current.bossIntro.cameraAnchorRatio)) {
      return {
        mode: 'boss-intro',
        focusTarget: Math.round(current.bossIntro.focusX),
        targetCameraX: clampCameraX(current.bossIntro.focusX - CANVAS_WIDTH * current.bossIntro.cameraAnchorRatio),
      };
    }
    return getLayoutCameraFollowTarget({
      playerCenterX,
      bossIntroFocusX: current.bossIntro.focusX,
    });
  }

  if (current.bossDomain && !current.defeatedMiniBosses?.has(current.bossDomain.bossId)) {
    const arenaStart = current.bossDomain.arenaStart ?? playerCenterX - CANVAS_WIDTH * 0.5;
    const arenaEnd = current.bossDomain.arenaEnd ?? playerCenterX + CANVAS_WIDTH * 0.5;
    return {
      mode: 'boss-domain',
      focusTarget: Math.round((arenaStart + arenaEnd) / 2),
      targetCameraX: clampCameraX(((arenaStart + arenaEnd) / 2) - CANVAS_WIDTH * 0.5),
    };
  }

  const nearbyBoss = current.miniBosses?.find(boss => (
    boss.awakened
    && !boss.defeated
    && Math.abs((boss.x + boss.width / 2) - playerCenterX) < 620
  ));
  if (nearbyBoss) {
    const bossCenterX = nearbyBoss.x + nearbyBoss.width / 2;
    const focusX = playerCenterX * 0.45 + bossCenterX * 0.55;
    return {
      mode: 'boss-focus',
      focusTarget: Math.round(bossCenterX),
      targetCameraX: clampCameraX(focusX - CANVAS_WIDTH * 0.5),
    };
  }

  const nearbyStageEntrance = STAGE_ENTRANCE_FEATURES.find((feature) => (
    isStageEntranceAvailableForState(feature, current)
    && Math.abs(feature.x - playerCenterX) < (feature.focusDistance || 520)
  ));
  if (nearbyStageEntrance) {
    return {
      mode: 'stage-entrance',
      focusTarget: Math.round(nearbyStageEntrance.x),
      targetCameraX: clampCameraX(nearbyStageEntrance.x - CANVAS_WIDTH * 0.5),
    };
  }

  return getLayoutCameraFollowTarget({ playerCenterX });
};

export const getOpeningCameraRevealTarget = (current) => {
  const timer = current.openingCameraRevealTimer || 0;
  if (timer <= 0) return null;

  const duration = current.openingCameraRevealDuration || OPENING_CAMERA_REVEAL_DURATION;
  const elapsed = clamp(duration - timer, 0, duration);
  const returnSeconds = Math.max(
    0.8,
    duration - OPENING_CAMERA_REVEAL_PAN_SECONDS - OPENING_CAMERA_REVEAL_HOLD_SECONDS,
  );
  const playerCenterX = current.player.x + current.player.width / 2;
  const startCameraX = getLayoutCameraFollowTarget({ playerCenterX }).targetCameraX;
  const entranceStageReveal = current.openingCameraRevealMode === 'entrance-stage';
  const revealFocusX = entranceStageReveal
    ? OPENING_ENTRANCE_STAGE.cameraFocusX
    : SCARAB_SEAL_TRIGGER.x + SCARAB_SEAL_TRIGGER.width / 2;
  const cameraAnchorRatio = entranceStageReveal
    ? OPENING_ENTRANCE_STAGE.cameraAnchorRatio
    : 0.64;
  const maxForwardPanRatio = entranceStageReveal
    ? OPENING_ENTRANCE_STAGE.maxForwardPanRatio
    : 0.18;
  const revealCameraX = Math.min(
    clampCameraX(revealFocusX - CANVAS_WIDTH * cameraAnchorRatio),
    clampCameraX(startCameraX + CANVAS_WIDTH * maxForwardPanRatio),
  );

  let revealWeight = 1;
  if (elapsed < OPENING_CAMERA_REVEAL_PAN_SECONDS) {
    revealWeight = easeInOutCubic(elapsed / OPENING_CAMERA_REVEAL_PAN_SECONDS);
  } else if (elapsed > OPENING_CAMERA_REVEAL_PAN_SECONDS + OPENING_CAMERA_REVEAL_HOLD_SECONDS) {
    const returnElapsed = elapsed - OPENING_CAMERA_REVEAL_PAN_SECONDS - OPENING_CAMERA_REVEAL_HOLD_SECONDS;
    revealWeight = 1 - easeInOutCubic(returnElapsed / returnSeconds);
  }

  return {
    mode: entranceStageReveal ? 'opening-entrance-stage' : 'opening-reveal',
    focusTarget: Math.round(revealFocusX),
    targetCameraX: clampCameraX(startCameraX + (revealCameraX - startCameraX) * revealWeight),
    progress: Number(revealWeight.toFixed(3)),
    secondsRemaining: Number(timer.toFixed(2)),
  };
};
