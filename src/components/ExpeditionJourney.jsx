import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Backpack,
  CheckCircle2,
  Flag,
  Gauge,
  Gem,
  Map,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GROUND_Y,
  INVULNERABLE_DURATION,
  JUMP_SPEED,
  JUMP_CUT_MULTIPLIER,
  JUMP_CUT_FEEDBACK_TIME,
  MOVE_SPEED,
  MOVE_ACCELERATION,
  MOVE_DECELERATION,
  AIR_ACCELERATION,
  AIR_DECELERATION,
  COYOTE_TIME,
  JUMP_BUFFER_TIME,
  WORLD_WIDTH,
  GRAVITY,
  ATTACK_DURATION,
  ATTACK_COOLDOWN,
  ATTACK_RECOIL_DURATION,
  ATTACK_WINDUP_DURATION,
  PLAYER_SPRITE_DRAW_HEIGHT,
  PLAYER_SPRITE_FRAME_COUNT,
  PLAYER_SPRITE_FRAME_HEIGHT,
  PLAYER_SPRITE_FRAME_WIDTH,
  PLAYER_CHINA_HERO_SPRITE_ATLAS_JSON,
  PLAYER_CHINA_HERO_SPRITE_VERSION,
  PLAYER_HERO_FALLBACK_SPRITE_ATLAS_JSON,
  PLAYER_HERO_FALLBACK_SPRITE_VERSION,
  PLAYER_HERO_PREVIOUS_SPRITE_ATLAS_JSON,
  PLAYER_HERO_PREVIOUS_SPRITE_VERSION,
  PLAYER_HERO_SPRITE_ATLAS_JSON,
  PLAYER_HERO_SPRITE_VERSION,
  PLAYER_LEGACY_SPRITE_SRC,
  PLAYER_SPRITE_SCALE,
  PLAYER_SPRITE_SRC,
  JOURNEY_VERTICAL_OFFSET,
  scaleJourneyX,
} from './expedition-journey/journeyConstants';

import {
  BOSS_KEY_ITEMS,
  CHECKPOINTS,
  ENVIRONMENT_INTERACTIONS,
  HAZARDS,
  HIDDEN_ROUTES,
  GUARDIAN_KNOWLEDGE_CHALLENGES,
  GUARDIAN_KNOWLEDGE_QUESTIONS,
  JOURNEY_TOOLS,
  LORE_TABLETS,
  OBJECTIVE_MARKERS,
  PLATFORMS,
  RELIC_SHARDS,
  ROUTE_GATES,
  SCARAB_SEAL_TRIGGER,
  SECTIONS,
  SECTION_ATMOSPHERES,
  SECRET_COLLECTIBLES,
  STAGE_ENTRANCE_FEATURES,
  STORY_PROPS,
  TOOL_LAYOUT,
  UPGRADES,
  WORLD_CONTINUITY_LANDMARKS,
  WORLD_TRANSITION_STORY_MARKERS,
  GATE,
  DISCOVERY_ENTRANCE,
  ENVIRONMENT_EVENTS,
  SECTION_OBJECTIVES,
} from './expedition-journey/journeyLevelData';

import {
  clamp,
  getCollectibleHitbox,
  getEnemyAttackHurtbox,
  getHazardHitbox,
  getPlayerBodyHitbox,
  getSectionForX,
  isLandingOnPlatform,
  makeInitialState,
  rectsOverlap,
  resolveEnemyContact,
  updatePlayerAnimation,
} from './expedition-journey/journeyUtils';

import {
  clampCameraX,
  getCameraFollowTarget as getLayoutCameraFollowTarget,
  getCanvasScaleState,
  isHorizontallyVisible,
  JOURNEY_CAMERA,
  JOURNEY_HUD_SAFE_AREA,
  JOURNEY_RENDER_TARGET,
  JOURNEY_VIEWPORT,
  JOURNEY_WORLD_LAYOUT,
  placeGateOnGround,
  worldToScreenX,
} from './expedition-journey/journeyLayout';

import {
  ATLAS_TUNING_VERSION,
  createEnvironmentAssetState,
  DESERT_VISUAL_TUNING_VERSION,
  drawAtlasRegion,
  EGYPT_ATMOSPHERE_ASSET_VERSION,
  ENVIRONMENT_ATLAS_JSON,
  ENVIRONMENT_ASSET_PACK_IDS,
  getEnvironmentAssetKeyForHazard,
  getEnvironmentAssetKeyForPlatform,
  getEnvironmentAssetKeyForStoryProp,
  getMissingEnvironmentAssets,
  JOURNEY_ASSET_GROUNDING_VERSION,
  loadEnvironmentAssetPack,
} from './expedition-journey/journeyRenderAssets';

import {
  CATACOMBS_BACKGROUND_ATLAS_JSON,
  CHINA_RIVER_VALLEY_BACKGROUND_ATLAS_JSON,
  createDesertBackgroundAssetState,
  DESERT_BACKGROUND_DEPTH_MODE,
  DIG_SITE_BACKGROUND_ATLAS_JSON,
  drawDesertBackgroundLayer,
  ESCAPE_BACKGROUND_ATLAS_JSON,
  getMissingSectionBackgroundAssets,
  getSectionBackgroundAssets,
  JOURNEY_BACKGROUND_DEPTH_MODE,
  loadDesertBackgroundAssetPack,
  RUINED_TEMPLE_BACKGROUND_ATLAS_JSON,
} from './expedition-journey/journeyBackgroundAssets';

import {
  ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON,
  BOSS_SPRITE_ATLAS_JSON,
  BOSS_SPRITE_ATLAS_VERSION,
  CHINA_CLAY_GUARDIAN_BOSS_ID,
  CHINA_CLAY_GUARDIAN_SPRITE_ATLAS_JSON,
  createBossSpriteState,
  getAncientConstructDrawBox,
  getAncientConstructSpriteFrame,
  getBossSpritePack,
  getClayGuardianDrawBox,
  getClayGuardianSpriteFrame,
  getGiantSerpentDrawBox,
  getGiantSerpentSpriteFrame,
  getMissingBossSpriteAssets,
  getScarabQueenDrawBox,
  getScarabQueenSpriteFrame,
  getStoneGuardianDrawBox,
  getStoneGuardianSpriteFrame,
  isChinaGuardianBossSpriteId,
  loadBossSpritePack,
  shouldFlipBossSprite,
  STONE_GUARDIAN_SPRITE_ATLAS_JSON,
} from './expedition-journey/journeyBossSprites';

import {
  CHINA_ENEMY_GUARDIAN_SPRITE_ATLAS_JSON,
  createEnemySpriteState,
  ENEMY_SPRITE_ATLAS_JSON,
  ENEMY_SPRITE_ATLAS_VERSION,
  EXPECTED_CHINA_ENEMY_GUARDIAN_SPRITE_KEYS,
  getEnemySpriteDrawBox,
  getEnemySpriteFamily,
  getEnemySpriteFrame,
  getEnemySpritePack,
  getMissingEnemySpriteAssets,
  loadEnemySpritePack,
  shouldFlipEnemySprite,
  shouldUseEnemySpritePack,
} from './expedition-journey/journeyEnemySprites';
import { getShopItemDisplayName } from './expedition/baseCampShop';

import {
  COLLECTIBLE_ATLAS_JSON,
  COLLECTIBLE_SPRITE_ATLAS_VERSION,
  createCollectibleSpriteState,
  drawCollectibleAtlasRegion,
  getMissingCollectibleSpriteAssets,
  getObjectiveSpriteKey,
  getToolSpriteKey,
  getUpgradeSpriteKey,
  loadCollectibleSpritePack,
} from './expedition-journey/journeyCollectibleSprites';

import {
  createPlayerWeaponSpriteState,
  drawPlayerWeaponAtlasRegion,
  getMissingPlayerWeaponSpriteAssets,
  getPlayerWeaponFrameKey,
  loadPlayerWeaponSpritePack,
  PLAYER_WEAPON_ATLAS_JSON,
  PLAYER_WEAPON_ATLAS_VERSION,
} from './expedition-journey/journeyPlayerWeaponSprites';

import {
  createDynamicWorldAssetState,
  DYNAMIC_WORLD_EFFECTS_VERSION,
  getDynamicWorldEffectRegion,
  loadDynamicWorldAssetPack,
  usesPaintedDynamicWorldEffect,
} from './expedition-journey/journeyDynamicWorldAssets';

import {
  createMarkerSpriteState,
  drawMarkerSprite,
  getMissingMarkerSpriteAssets,
  loadMarkerSpritePack,
  MARKER_SPRITE_ATLAS_JSON,
  MARKER_SPRITE_VERSION,
} from './expedition-journey/journeyMarkerSprites';

const DEFAULT_BOSS_ATTACK_PHASES = [
  {
    id: 'heavy-swipe',
    label: 'Heavy Swipe',
    kind: 'close',
    windup: 0.72,
    duration: 0.34,
    cooldown: 1.85,
    recovery: 0.78,
    vulnerableAfter: 0.85,
    range: 58,
    height: 40,
    speed: 72,
    color: '#fb923c',
  },
  {
    id: 'pulse-ring',
    label: 'Pulse Ring',
    kind: 'area',
    windup: 0.92,
    duration: 0.36,
    cooldown: 2.15,
    recovery: 0.88,
    vulnerableAfter: 1,
    range: 118,
    height: 54,
    damageScale: 0.85,
    shieldDuringWindup: true,
    color: '#facc15',
  },
];

const CHINA_SECTION_COPY = {
  'desert-entry': {
    name: 'River Valley',
    title: 'The river valley opens toward an ancient settlement.',
  },
  'ruined-temple': {
    name: 'Bronze Workshop',
    title: 'Workshop ruins show traces of skilled bronze and timber work.',
  },
  catacombs: {
    name: 'Oracle Archive',
    title: 'Stored records and broken vessels mark the archive path.',
  },
  'escape-sequence': {
    name: 'Rammed Earth Works',
    title: 'Loose earth and old construction lines make the route unstable.',
  },
  'dig-site-entrance': {
    name: 'Excavation Approach',
    title: 'The Ancient China excavation site is in sight.',
  },
};

const BOSS_ATTACK_PHASES = {
  'scarab-queen': [
    { ...DEFAULT_BOSS_ATTACK_PHASES[0], id: 'queen-charge', label: 'Sand Charge', speed: 118, cooldown: 1.85, vulnerableAfter: 1.05 },
    { ...DEFAULT_BOSS_ATTACK_PHASES[1], id: 'scarab-burst', label: 'Scarab Burst', kind: 'area', cooldown: 2.2, vulnerableAfter: 1.15, damageScale: 0.65 },
  ],
  'temple-guardian': [
    { ...DEFAULT_BOSS_ATTACK_PHASES[0], id: 'stone-swipe', label: 'Stone Swipe', windup: 0.9, duration: 0.42, speed: 58 },
    { ...DEFAULT_BOSS_ATTACK_PHASES[1], id: 'shockwave-slam', label: 'Shockwave Slam', windup: 1.05, range: 132, damageScale: 0.8 },
  ],
  'giant-serpent': [
    { ...DEFAULT_BOSS_ATTACK_PHASES[0], id: 'wall-lunge', label: 'Wall Lunge', speed: 120, cooldown: 1.75 },
    { ...DEFAULT_BOSS_ATTACK_PHASES[1], id: 'venom-line', label: 'Venom Line', kind: 'ranged', windup: 0.8, range: 126, height: 30, cooldown: 2, damageScale: 0.75 },
  ],
  'looter-captain': [
    { ...DEFAULT_BOSS_ATTACK_PHASES[0], id: 'dash-shove', label: 'Dash Shove', windup: 0.58, duration: 0.28, speed: 145, cooldown: 1.45 },
    { ...DEFAULT_BOSS_ATTACK_PHASES[1], id: 'sand-throw', label: 'Sand Throw', kind: 'ranged', windup: 0.76, range: 112, height: 28, cooldown: 1.85, damageScale: 0.7 },
  ],
  'ancient-construct': [
    { ...DEFAULT_BOSS_ATTACK_PHASES[0], id: 'construct-slam', label: 'Construct Slam', windup: 1, duration: 0.44, speed: 54, cooldown: 2 },
    { ...DEFAULT_BOSS_ATTACK_PHASES[1], id: 'core-pulse', label: 'Core Pulse', windup: 1.1, range: 140, cooldown: 2.25, damageScale: 0.85 },
  ],
};

const COMBAT_CHALLENGE_MODE = 'skill-windows-v1';
const COMBAT_INTENSITY_VERSION = 'combat-impact-pressure-2026-05-16';
const PLAYER_ATTACK_STAMINA_COST = 1;
const MISSED_ATTACK_EXTRA_STAMINA_COST = 1;
const PROTECTED_HIT_EXTRA_STAMINA_COST = 1;
const PLAYER_HIT_SCREEN_SHAKE_DURATION = 0.22;
const PLAYER_HIT_SCREEN_SHAKE_PIXELS = 2.4;
const SCORPION_ATTACK_RANGE_MULTIPLIER = 1.4;
const SCORPION_CHASE_SPEED_MULTIPLIER = 1.15;
const ENEMY_AGGRO_MEMORY_SECONDS = 4.6;
const ENEMY_AGGRO_PATROL_PADDING = 320;

const KNOWLEDGE_CHALLENGE_SIZE = 3;
const GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED = false;
const KNOWLEDGE_CHALLENGE_FEEDBACK = {
  correct: 'Correct. Your field knowledge strengthens you.',
  incorrect: 'Not quite. The guardian grows stronger.',
};

const LOW_STAMINA_WARNING = 'Stamina low - avoid another hit.';
const FIELD_RESCUE_MESSAGE = 'You were forced back to the last checkpoint. Recover and try again.';
const FIELD_RESCUE_STAMINA_REASON = 'Stamina hit zero.';
const OPENING_THRESHOLD_SCENE_DURATION = 46;
const OPENING_THRESHOLD_FADE_SECONDS = 2;
const OPENING_THRESHOLD_STAIR_REVEAL_SECONDS = 13.5;
const OPENING_THRESHOLD_FALL_DELAY_SECONDS = 0.45;
const OPENING_THRESHOLD_FALL_DURATION_SECONDS = 4.4;
const OPENING_SPHINX_DURATION = 46;
const OPENING_SPHINX_EXIT_SECONDS = 2.35;
const OPENING_SPHINX_ARRIVAL_SECONDS = 1.05;
const OPENING_SPHINX_LINE_SECONDS = 2.15;
const OPENING_SPHINX_SPRITE_BOSS_ID = 'ancient-construct';
const OPENING_SPHINX_APPARITION_SRC = 'assets/expedition/bosses/anubis-apparition.png';
const OPENING_SPHINX_SPRITE_VERSION = 'opening-anubis-apparition-2026-05-21';
const OPENING_SPHINX_SCREEN_Y_OFFSET = 112;
const OPENING_SPHINX_FOOT_Y = GROUND_Y - 10;
const TEMPLE_THRESHOLD_TRANSITION_DURATION = 8.4;
const TEMPLE_THRESHOLD_FADE_OUT_SECONDS = 0.95;
const TEMPLE_THRESHOLD_BLACK_HOLD_SECONDS = 0.55;
const TEMPLE_THRESHOLD_FADE_IN_SECONDS = 1.05;
const TEMPLE_THRESHOLD_SWITCH_SECONDS = TEMPLE_THRESHOLD_FADE_OUT_SECONDS + TEMPLE_THRESHOLD_BLACK_HOLD_SECONDS;
const TEMPLE_THRESHOLD_ANUBIS_START_SECONDS = TEMPLE_THRESHOLD_SWITCH_SECONDS + TEMPLE_THRESHOLD_FADE_IN_SECONDS + 0.25;
const OPENING_SCARAB_SEAL_IMAGE_SRC = 'assets/expedition/environment/egypt-opening/scarab-seal-ground-embedded.png';
const OPENING_PYRAMID_CLIMB_PACK_SRC = 'assets/expedition/environment/egypt-opening/pyramid-climb-pack.png';
const OPENING_PYRAMID_FACADE_SRC = 'assets/expedition/environment/egypt-opening/opening-pyramid-facade.png';
const OPENING_TRAP_DECAL_PACK_SRC = 'assets/expedition/environment/egypt-opening/opening-trap-decals.png';
const OPENING_HAZARD_DECAL_PACK_SRC = 'assets/expedition/environment/egypt-opening/opening-hazard-decals.png';
const OPENING_TOMB_STAIRWELL_SRC = 'assets/expedition/environment/egypt-opening/opening-tomb-stairwell.png';
const STAGE_ENTRANCE_DOORWAY_SRC = 'assets/expedition/environment/stage-entrances/egypt-tomb-doorway-transition.png';
const STAGE_ENTRANCE_DOORWAY_VERSION = 'imagegen-egypt-tomb-doorway-transition-2026-05-20';
const DESERT_END_GATEWAY_SRC = 'assets/expedition/environment/stage-entrances/desert-end-threshold-angled.png';
const DESERT_END_GATEWAY_VERSION = 'imagegen-desert-end-threshold-angled-2026-05-22';
const OPENING_CAMERA_REVEAL_DURATION = 1.55;
const OPENING_CAMERA_REVEAL_PAN_SECONDS = 0.55;
const OPENING_CAMERA_REVEAL_HOLD_SECONDS = 0.18;
const OPENING_PYRAMID_ASSET_VERSION = 'opening-pyramid-climb-pack-2026-05-18';
const OPENING_PYRAMID_FACADE_VERSION = 'opening-pyramid-facade-2026-05-19';
const OPENING_TOMB_STAIRWELL_VERSION = 'opening-tomb-stairwell-generated-2026-05-21';
const OPENING_PYRAMID_FACADE_WORLD_LEFT_X = -82;
const OPENING_PYRAMID_GROUND_JUMP_MULTIPLIER = 1.32;
const OPENING_PYRAMID_AIR_JUMP_MULTIPLIER = 1.6;

const DEFAULT_LEVEL_TRANSITION = {
  title: 'ROUTE COMPLETE',
  subtitle: 'Entering the next chamber',
  destinationNotice: 'Asha passes through the threshold.',
  finalNotice: 'The route ahead is open.',
  revealObjectiveLead: 200,
};

const STAGE_ENTRANCE_THEME_FILTERS = {
  'sunlit-desert-gateway': 'sepia(3%) saturate(98%) brightness(96%) contrast(103%) drop-shadow(0 16px 16px rgba(34, 18, 8, 0.24))',
  'cool-catacomb-descent': 'sepia(8%) saturate(88%) hue-rotate(162deg) brightness(72%) contrast(116%) drop-shadow(0 18px 20px rgba(0, 8, 18, 0.42))',
  'collapsed-breach': 'sepia(22%) saturate(125%) hue-rotate(-8deg) brightness(86%) contrast(118%) drop-shadow(0 18px 18px rgba(46, 21, 8, 0.38))',
  'open-dig-site-threshold': 'sepia(10%) saturate(112%) hue-rotate(20deg) brightness(104%) contrast(98%) drop-shadow(0 12px 18px rgba(35, 25, 10, 0.22))',
};

const getStageEntranceForGate = (gate) => (
  STAGE_ENTRANCE_FEATURES.find(feature => feature.routeGateId === gate?.id && feature.levelTransition)
);

const getStageEntranceTriggerX = (feature) => {
  if (!feature) return Number.NaN;
  const width = feature.width || CANVAS_WIDTH * 1.12;
  const passageVisual = feature.passageVisual || {};
  return feature.x - width / 2 + width * (feature.walkThroughTriggerX ?? passageVisual.centerX ?? 0.5);
};

const areRouteGateRequirementsMetForState = (gate, current) => {
  if (!gate?.requires) return true;
  const requirements = gate.requires;
  if (requirements.objective && !current.completedObjectiveIds?.has(requirements.objective)) return false;
  if (requirements.miniBoss && !current.defeatedMiniBosses?.has(requirements.miniBoss)) return false;
  if (requirements.keyItem) {
    const collected = current.collectedBossKeyIds?.has(requirements.keyItem)
      || current.bossKeyItems?.some(item => item.id === requirements.keyItem && item.collected);
    if (!collected) return false;
  }
  if (requirements.enemies?.some(enemyId => !current.defeatedEnemies?.has(enemyId))) return false;
  if (Number.isFinite(requirements.shards) && (current.relicShardCount || 0) < requirements.shards) return false;
  if (requirements.upgrades?.some(upgradeId => !current.permanentUpgradeIds?.has(upgradeId))) return false;
  if (requirements.checkpoint && current.activeCheckpoint?.id !== requirements.checkpoint) return false;
  return true;
};

const isStageEntranceAvailableForState = (feature, current) => {
  if (!feature?.routeGateId) return true;
  if (current.templeThresholdTransition?.featureId === feature.id) return true;
  const gate = ROUTE_GATES.find(item => item.id === feature.routeGateId);
  if (!gate) return true;
  return current.openedRouteGateIds?.has(gate.id) || areRouteGateRequirementsMetForState(gate, current);
};

const isStageEntranceVisibleForState = (feature, current) => (
  Boolean(feature?.visibleWhenLocked) || isStageEntranceAvailableForState(feature, current)
);

const isStageEntrancePastArrivalForState = (feature, current) => {
  if (!feature?.to || !current?.player) return false;
  if (current.templeThresholdTransition?.featureId === feature.id) return false;
  const playerCenterX = current.player.x + current.player.width / 2;
  const playerSectionId = getSectionForX(playerCenterX).id;
  return playerSectionId === feature.to && playerCenterX > feature.x + scaleJourneyX(96);
};

const shouldRenderStageEntranceFeatureForState = (feature, current) => (
  isStageEntranceVisibleForState(feature, current) && !isStageEntrancePastArrivalForState(feature, current)
);

const OPENING_PYRAMID_AIR_JUMP_ASSIST_ZONE = {
  minX: 126,
  maxX: 1138,
  minFootY: 90,
  maxFootY: 570,
};
const OPENING_TRAP_DECAL_ASSET_VERSION = 'egypt-trap-hazard-generated-packs-2026-05-21';
const OPENING_PYRAMID_ASSET_REGIONS = {
  leftStairFace: { x: 24, y: 419, w: 430, h: 160 },
  rightStairFace: { x: 486, y: 418, w: 402, h: 164 },
  terraceWall: { x: 807, y: 259, w: 320, h: 130 },
  trapSlab: { x: 1258, y: 432, w: 315, h: 72 },
  crackedBlock: { x: 1255, y: 538, w: 325, h: 82 },
  carvedColumn: { x: 1022, y: 424, w: 76, h: 164 },
  paintedColumn: { x: 1109, y: 423, w: 74, h: 166 },
  pedestal: { x: 1160, y: 91, w: 148, h: 128 },
  seal: { x: 1332, y: 26, w: 178, h: 178 },
  rubble: { x: 1005, y: 667, w: 128, h: 58 },
  dust: { x: 953, y: 884, w: 250, h: 60 },
};
const OPENING_TRAP_DECAL_REGIONS = {
  spikeTrap: { x: 36, y: 78, w: 430, h: 196 },
  pressurePlate: { x: 54, y: 300, w: 382, h: 132 },
  crackedFloor: { x: 558, y: 130, w: 376, h: 286 },
  scarabSealTrap: { x: 1012, y: 118, w: 438, h: 316 },
  glyphTripwire: { x: 44, y: 640, w: 466, h: 186 },
  fallingStoneWarning: { x: 610, y: 514, w: 342, h: 364 },
  softSandPit: { x: 1040, y: 542, w: 434, h: 346 },
};
const OPENING_HAZARD_DECAL_REGIONS = {
  thornScrub: { x: 42, y: 174, w: 332, h: 254 },
  darkGap: { x: 410, y: 174, w: 344, h: 270 },
  batCloud: { x: 760, y: 166, w: 340, h: 286 },
  dustWave: { x: 1116, y: 166, w: 340, h: 278 },
  looseSlope: { x: 30, y: 582, w: 348, h: 250 },
  surveyRope: { x: 430, y: 604, w: 330, h: 214 },
  warningRubble: { x: 812, y: 598, w: 326, h: 230 },
  fallingStoneWarning: { x: 1172, y: 532, w: 320, h: 334 },
};
const OPENING_TRAP_DECAL_BY_HAZARD = {
  'sealed-sand': 'scarabSealTrap',
  'loose-temple-floor': 'crackedFloor',
  'glyph-tripwire': 'glyphTripwire',
  'entry-pressure-plate': 'pressurePlate',
  'entry-cracked-floor-trap': 'crackedFloor',
  'opening-seal-reset-trap': 'spikeTrap',
  'temple-threshold-hairline-crack': 'crackedFloor',
  'temple-floor-crack': 'crackedFloor',
  'spike-trap': 'spikeTrap',
  'temple-loose-step': 'crackedFloor',
  'sand-pit': 'softSandPit',
  'desert-low-ridge': 'softSandPit',
  'desert-soft-ridge': 'softSandPit',
  'sandfall-soft-pit': 'softSandPit',
};
const OPENING_HAZARD_DECAL_BY_HAZARD = {
  'thorn-bush': 'thornScrub',
  'dark-gap': 'darkGap',
  'catacomb-small-gap': 'darkGap',
  'catacomb-gap-2': 'darkGap',
  'bat-cloud': 'batCloud',
  'catacomb-bat-pocket': 'batCloud',
  'dust-wave': 'dustWave',
  'escape-dust-pocket': 'dustWave',
  'loose-slope': 'looseSlope',
  'dig-site-loose-slope-2': 'looseSlope',
  'survey-rope': 'surveyRope',
  'camp-low-rope': 'surveyRope',
  'dig-site-loose-rope': 'surveyRope',
  'warning-rubble': 'warningRubble',
  'broken-ruins-loose-stones': 'warningRubble',
  'rolling-stones': 'warningRubble',
  'sandfall-collapsing-stones': 'warningRubble',
  'falling-blocks': 'fallingStoneWarning',
  'sandfall-warning-dust': 'fallingStoneWarning',
  'temple-falling-chip': 'fallingStoneWarning',
  'escape-falling-chip': 'fallingStoneWarning',
};
const EGYPT_HAZARD_DECAL_PLACEMENT = {
  spikeTrap: { xPad: 12, widthPad: 24, height: 46, footInset: 18 },
  pressurePlate: { xPad: 14, widthPad: 28, height: 50, footInset: 18 },
  crackedFloor: { xPad: 16, widthPad: 32, height: 62, footInset: 14 },
  scarabSealTrap: { xPad: 22, widthPad: 44, height: 76, footInset: 22 },
  glyphTripwire: { xPad: 28, widthPad: 56, height: 48, footInset: 18 },
  fallingStoneWarning: { xPad: 24, widthPad: 48, height: 112, footInset: 0 },
  softSandPit: { xPad: 20, widthPad: 40, height: 46, footInset: 18 },
  thornScrub: { xPad: 22, widthPad: 44, height: 88, footInset: 1 },
  darkGap: { xPad: 20, widthPad: 40, height: 46, footInset: 18 },
  batCloud: { xPad: 24, widthPad: 48, height: 96, footInset: 2 },
  dustWave: { xPad: 28, widthPad: 56, height: 90, footInset: 1 },
  looseSlope: { xPad: 24, widthPad: 52, height: 52, footInset: 18 },
  surveyRope: { xPad: 24, widthPad: 48, height: 42, footInset: 18 },
  warningRubble: { xPad: 20, widthPad: 46, height: 52, footInset: 18 },
};
const EGYPT_HAZARD_DECAL_PLACEMENT_BY_HAZARD = {
  'opening-seal-reset-trap': { xPad: 18, widthPad: 36, height: 42, footInset: 28 },
  'falling-blocks': { xPad: 24, widthPad: 48, height: 112, footInset: 2 },
  'temple-falling-chip': { xPad: 22, widthPad: 44, height: 96, footInset: 0 },
  'escape-falling-chip': { xPad: 22, widthPad: 44, height: 96, footInset: 0 },
  'bat-cloud': { xPad: 24, widthPad: 48, height: 96, footInset: 2 },
  'catacomb-bat-pocket': { xPad: 20, widthPad: 40, height: 84, footInset: 2 },
  'dust-wave': { xPad: 28, widthPad: 56, height: 90, footInset: 1 },
  'escape-dust-pocket': { xPad: 26, widthPad: 52, height: 78, footInset: 1 },
};
const openingJourneyY = (y) => y + JOURNEY_VERTICAL_OFFSET;
const OPENING_PYRAMID_FACADE_TIERS = [
  { x: 128, y: openingJourneyY(312), width: 1560, height: 92, inset: 116, alpha: 0.9 },
  { x: 230, y: openingJourneyY(270), width: 1370, height: 98, inset: 132, alpha: 0.92 },
  { x: 350, y: openingJourneyY(228), width: 1150, height: 106, inset: 144, alpha: 0.94 },
  { x: 490, y: openingJourneyY(186), width: 910, height: 112, inset: 142, alpha: 0.95 },
  { x: 650, y: openingJourneyY(144), width: 650, height: 118, inset: 126, alpha: 0.94 },
  { x: 830, y: openingJourneyY(102), width: 390, height: 132, inset: 96, alpha: 0.95 },
];

const getGuardianChallengeQuestions = (bossId) => {
  const questionIds = GUARDIAN_KNOWLEDGE_CHALLENGES[bossId] || [];
  const selected = questionIds
    .map(id => GUARDIAN_KNOWLEDGE_QUESTIONS.find(question => question.id === id))
    .filter(Boolean);
  return selected.slice(0, KNOWLEDGE_CHALLENGE_SIZE);
};

const getGuardianBattleModifier = (correctCount) => {
  if (correctCount >= 3) {
    return {
      id: 'field-mastery',
      correctCount: 3,
      playerDamageMultiplier: 1.25,
      bossHealthMultiplier: 0.85,
      bossDamageMultiplier: 1,
      playerVisualScale: 1.08,
      bossVisualScale: 1,
      resultMessage: 'Your field knowledge strengthens you. The guardian weakens.',
      label: 'Field knowledge advantage',
    };
  }
  if (correctCount === 2) {
    return {
      id: 'field-advantage',
      correctCount,
      playerDamageMultiplier: 1.15,
      bossHealthMultiplier: 1,
      bossDamageMultiplier: 1,
      playerVisualScale: 1.04,
      bossVisualScale: 1,
      resultMessage: 'Your field knowledge gives you an advantage.',
      label: 'Small player boost',
    };
  }
  if (correctCount === 1) {
    return {
      id: 'guardian-strength',
      correctCount,
      playerDamageMultiplier: 1,
      bossHealthMultiplier: 1.1,
      bossDamageMultiplier: 1,
      playerVisualScale: 1,
      bossVisualScale: 1.05,
      resultMessage: 'The guardian has gained strength. Stay careful.',
      label: 'Guardian health boost',
    };
  }
  return {
    id: 'guardian-empowered',
    correctCount: 0,
    playerDamageMultiplier: 1,
    bossHealthMultiplier: 1.2,
    bossDamageMultiplier: 1.1,
    playerVisualScale: 1,
    bossVisualScale: 1.1,
    resultMessage: 'The guardian is empowered. Prepare carefully.',
    label: 'Guardian empowered',
  };
};

const getAtlasImagePath = (atlasPath, imageName) => {
  if (!imageName) return null;
  if (imageName.startsWith('/') || imageName.startsWith('assets/') || imageName.startsWith('sprites/')) return imageName;
  const atlasDir = atlasPath.includes('/') ? atlasPath.slice(0, atlasPath.lastIndexOf('/') + 1) : '';
  return `${atlasDir}${imageName}`;
};

const getHeroSpriteRow = (atlas, rowName) => atlas?.rows?.find(row => row.name === rowName) || null;

const isPlayerAttackVisualPhase = (attackState) => (
  attackState === 'windup' || attackState === 'swing' || attackState === 'recoil'
);

const CHARACTER_LOADER_STORAGE_KEY = 'expedition-character-loader-choice';
const CHARACTER_LOADER_VISIBILITY_STORAGE_KEY = 'expedition-character-loader-visible-v2';
const PLAYER_CHARACTER_PRESETS = [
  {
    id: 'auto',
    label: 'Auto',
    description: 'Use the character chosen by the current expedition.',
  },
  {
    id: 'asha-production',
    label: 'Asha Final Production',
    description: 'Final playable Asha with warrior sword combat.',
    characterId: 'asha-final-production',
    atlasPath: 'assets/expedition/player/asha-final-production-spritesheet.json',
    version: 'asha-master-reference-motion-2026-05-23',
    fallbackAtlasPath: PLAYER_HERO_PREVIOUS_SPRITE_ATLAS_JSON,
    fallbackAtlasVersion: PLAYER_HERO_PREVIOUS_SPRITE_VERSION,
    fallbackCharacterId: 'asha-egypt-warrior-explorer',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'asha-v5-candidate',
    label: 'Asha V5',
    description: 'User-provided Asha V5 atlas for in-game review.',
    characterId: 'asha-v5-candidate',
    atlasPath: 'assets/expedition/player/asha-v5-spritesheet.json',
    version: 'asha-v5-candidate-2026-05-23',
    fallbackAtlasPath: 'assets/expedition/player/asha-final-production-spritesheet.json',
    fallbackAtlasVersion: 'asha-master-reference-motion-2026-05-23',
    fallbackCharacterId: 'asha-final-production',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'asha-hooded-production',
    label: 'Asha Hooded Previous',
    description: 'Previous hooded Egypt Asha atlas for comparison.',
    characterId: 'asha-egypt-warrior-explorer',
    atlasPath: PLAYER_HERO_PREVIOUS_SPRITE_ATLAS_JSON,
    version: PLAYER_HERO_PREVIOUS_SPRITE_VERSION,
    fallbackAtlasPath: PLAYER_HERO_FALLBACK_SPRITE_ATLAS_JSON,
    fallbackAtlasVersion: PLAYER_HERO_FALLBACK_SPRITE_VERSION,
    fallbackCharacterId: 'egypt-warrior-guide',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'asha-v2-candidate',
    label: 'Asha V2 Candidate',
    description: 'New semi-realistic Asha V2 atlas for in-game review.',
    characterId: 'asha-v2-production-candidate',
    atlasPath: 'assets/expedition/player/asha-v2-production-candidate-spritesheet.json',
    version: 'asha-v2-production-candidate-2026-05-21',
    fallbackAtlasPath: PLAYER_HERO_SPRITE_ATLAS_JSON,
    fallbackAtlasVersion: PLAYER_HERO_SPRITE_VERSION,
    fallbackCharacterId: 'asha-egypt-warrior-explorer',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'asha-v3-gemini-candidate',
    label: 'Asha V3 Gemini Candidate',
    description: 'Gemini-inspired Asha V3 atlas for visual comparison.',
    characterId: 'asha-v3-gemini-candidate',
    atlasPath: 'assets/expedition/player/asha-v3-production-candidate-spritesheet.json',
    version: 'asha-v3-gemini-candidate-2026-05-21',
    fallbackAtlasPath: PLAYER_HERO_SPRITE_ATLAS_JSON,
    fallbackAtlasVersion: PLAYER_HERO_SPRITE_VERSION,
    fallbackCharacterId: 'asha-egypt-warrior-explorer',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'egypt-warrior-guide',
    label: 'Egypt Guide Test',
    description: 'Older playable Egypt warrior-guide atlas.',
    characterId: 'egypt-warrior-guide',
    atlasPath: PLAYER_HERO_FALLBACK_SPRITE_ATLAS_JSON,
    version: PLAYER_HERO_FALLBACK_SPRITE_VERSION,
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'china-archaeologist',
    label: 'China Archaeologist',
    description: 'Playable China archaeologist atlas for comparison.',
    characterId: 'china-female-archaeologist',
    atlasPath: PLAYER_CHINA_HERO_SPRITE_ATLAS_JSON,
    version: PLAYER_CHINA_HERO_SPRITE_VERSION,
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'legacy-strip',
    label: 'Legacy Strip',
    description: 'Original fallback strip, useful as a scale check.',
    characterId: 'legacy-archaeologist-strip',
    atlasPath: null,
    version: 'legacy-archaeologist-walk-cycle',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
];

const getPlayerCharacterPreset = (presetId) => (
  PLAYER_CHARACTER_PRESETS.find(preset => preset.id === presetId) || PLAYER_CHARACTER_PRESETS[0]
);

const getPlayerHeroSpriteConfig = ({ targetCivilisation, backgroundPackId, characterPresetId = 'auto' }) => {
  const selectedPreset = getPlayerCharacterPreset(characterPresetId);
  if (selectedPreset.id !== 'auto') {
    return selectedPreset;
  }
  const isChinaJourney = backgroundPackId === 'china-river-valley'
    || String(targetCivilisation || '').toLowerCase().includes('china');
  if (isChinaJourney) {
    return {
      id: 'auto',
      characterId: 'china-female-archaeologist',
      atlasPath: PLAYER_CHINA_HERO_SPRITE_ATLAS_JSON,
      version: PLAYER_CHINA_HERO_SPRITE_VERSION,
      fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
    };
  }
  return {
    id: 'auto',
    characterId: 'asha-final-production',
    atlasPath: PLAYER_HERO_SPRITE_ATLAS_JSON,
    version: PLAYER_HERO_SPRITE_VERSION,
    fallbackAtlasPath: PLAYER_HERO_PREVIOUS_SPRITE_ATLAS_JSON,
    fallbackAtlasVersion: PLAYER_HERO_PREVIOUS_SPRITE_VERSION,
    fallbackCharacterId: 'asha-egypt-warrior-explorer',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  };
};

const getHeroSpriteFrameKey = (current, atlas, now) => {
  const animationState = current.player.animationState || 'idle';
  const walkCycleDistance = current.player.walkCycleDistance || 0;
  const attackState = current.attackPhase
    || (current.attackWindupTimer > 0 ? 'windup'
      : current.attackTimer > 0 ? 'swing'
        : current.attackRecoilTimer > 0 ? 'recoil'
          : current.attackCooldown > 0 ? 'cooldown'
            : 'ready');

  if (animationState === 'hurt') {
    const row = getHeroSpriteRow(atlas, 'hurt');
    return row?.frames?.[Math.floor(now / 90) % Math.max(1, row.frameCount)] || 'hurt_00';
  }

  if (animationState === 'attack' || isPlayerAttackVisualPhase(attackState)) {
    const row = getHeroSpriteRow(atlas, 'attack_pick_swing');
    if (!row) return null;
    const frameCount = Math.max(1, row.frameCount || row.frames?.length || 1);
    if (attackState === 'windup') return row.frames?.[0] || 'attack_pick_swing_00';
    if (attackState === 'recoil') return row.frames?.[frameCount - 1] || `attack_pick_swing_${String(frameCount - 1).padStart(2, '0')}`;
    const progress = clamp((ATTACK_DURATION - Math.max(0, current.attackTimer || 0)) / ATTACK_DURATION, 0, 1);
    const firstSwingFrame = Math.min(1, frameCount - 1);
    const lastSwingFrame = Math.max(firstSwingFrame, frameCount - 2);
    const swingFrameCount = Math.max(1, lastSwingFrame - firstSwingFrame + 1);
    const swingFrameIndex = firstSwingFrame + Math.min(swingFrameCount - 1, Math.floor(progress * swingFrameCount));
    return row.frames?.[swingFrameIndex] || null;
  }

  const rowName = animationState === 'survey-walk' ? 'survey_walk' : animationState;
  const row = getHeroSpriteRow(atlas, rowName) || getHeroSpriteRow(atlas, 'idle');
  if (!row) return null;
  const frameCount = Math.max(1, row.frameCount || row.frames?.length || 1);
  if (row.loop) {
    const frame = rowName === 'idle'
      ? Math.floor(now / 150) % frameCount
      : Math.floor(walkCycleDistance / (rowName === 'run' ? 15 : rowName === 'survey_walk' ? 34 : 22)) % frameCount;
    return row.frames?.[frame] || null;
  }
  const frame = Math.min(frameCount - 1, current.player.animationFrame ?? 0);
  return row.frames?.[frame] || null;
};

const DEFAULT_ENEMY_ATTACK_PATTERN = {
  id: 'strike',
  label: 'Strike',
  windup: 0.38,
  duration: 0.26,
  cooldown: 1.35,
  recovery: 0.38,
  vulnerableAfter: 0.42,
  speed: 110,
  range: 34,
  height: 24,
  protectedDuringAttack: true,
  color: '#fb923c',
};

const ENEMY_ATTACK_PATTERNS = {
  scarab: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'charge',
    label: 'Charge',
    windup: 0.42,
    duration: 0.3,
    cooldown: 1.45,
    recovery: 0.56,
    vulnerableAfter: 0.62,
    speed: 185,
    range: 38,
  },
  scorpion: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'sting',
    label: 'Sting',
    windup: 0.6,
    duration: 0.3,
    cooldown: 1.65,
    recovery: 0.64,
    vulnerableAfter: 0.7,
    speed: 54,
    range: 28,
    height: 58,
    yOffset: -34,
    backReach: 38,
    damageScale: 1.45,
    color: '#d97706',
  },
  'sand-wisp': {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'sand-burst',
    label: 'Sand Burst',
    windup: 0.5,
    duration: 0.24,
    cooldown: 1.6,
    recovery: 0.58,
    vulnerableAfter: 0.64,
    speed: 150,
    range: 38,
    height: 30,
    color: '#facc15',
  },
  snake: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'lunge',
    label: 'Lunge',
    windup: 0.62,
    duration: 0.28,
    cooldown: 1.62,
    recovery: 0.6,
    vulnerableAfter: 0.68,
    speed: 166,
    range: 52,
  },
  bat: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'swoop',
    label: 'Swoop',
    windup: 0.36,
    duration: 0.32,
    cooldown: 1.42,
    recovery: 0.48,
    vulnerableAfter: 0.52,
    speed: 190,
    range: 38,
    height: 30,
  },
  guardian: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'slam',
    label: 'Heavy Slam',
    windup: 0.84,
    duration: 0.4,
    cooldown: 2,
    recovery: 0.9,
    vulnerableAfter: 0.95,
    speed: 52,
    range: 50,
    height: 32,
    shieldDuringWindup: true,
  },
  looter: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'dash',
    label: 'Dash',
    windup: 0.3,
    duration: 0.24,
    cooldown: 1.2,
    recovery: 0.34,
    vulnerableAfter: 0.38,
    speed: 165,
    range: 36,
  },
  bes: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'guardian-swipe',
    label: 'Guardian Swipe',
    windup: 0.64,
    duration: 0.34,
    cooldown: 1.72,
    recovery: 0.72,
    vulnerableAfter: 0.82,
    speed: 74,
    range: 50,
    height: 64,
    yOffset: -28,
    backReach: 28,
    damageScale: 1.28,
    shieldDuringWindup: true,
  },
  mummy: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'khopesh-sweep',
    label: 'Khopesh Sweep',
    windup: 0.76,
    duration: 0.34,
    cooldown: 1.85,
    recovery: 0.78,
    vulnerableAfter: 0.86,
    speed: 58,
    range: 44,
    height: 58,
    yOffset: -24,
    backReach: 24,
    damageScale: 1.25,
    shieldDuringWindup: true,
    color: '#d9a441',
  },
  statue: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'pulse-slam',
    label: 'Pulse Slam',
    windup: 0.92,
    duration: 0.42,
    cooldown: 2.08,
    recovery: 0.96,
    vulnerableAfter: 1,
    speed: 46,
    range: 52,
    height: 34,
    shieldDuringWindup: true,
  },
};

const ENEMY_TYPE_STAKE_MESSAGES = {
  scarab: 'Scarab charges. Move or jump, then strike.',
  scorpion: 'Scorpion tails block the path. Defeat them before moving forward.',
  'sand-wisp': 'Sand wisps tense before they burst. Wait for the opening.',
  snake: 'Snake lunges from mid-range. Watch the coil.',
  bat: 'Beware: Bats swoop across gaps. Watch their movement.',
  looter: 'Beware: Rival scouts dash quickly. Counter after they miss.',
  mummy: 'Warrior mummies guard the threshold. Wait for the sweep, then counter.',
  guardian: 'Stone guardians are slow blockers. Wait for the opening.',
  statue: 'Cursed statues slam hard. Move carefully.',
};

const BOSS_DOMAIN_ENEMY_FOCUS_PADDING = 96;

const isNormalEnemyInsideBossFocus = (enemy, bossDomain) => {
  if (!enemy || !bossDomain) return false;
  const focusStart = (bossDomain.arenaStart ?? 0) - BOSS_DOMAIN_ENEMY_FOCUS_PADDING;
  const focusEnd = (bossDomain.arenaEnd ?? WORLD_WIDTH) + BOSS_DOMAIN_ENEMY_FOCUS_PADDING;
  const enemyCenter = enemy.x + enemy.width / 2;
  return enemyCenter >= focusStart && enemyCenter <= focusEnd;
};

const OBJECTIVE_MARKER_IDS_BY_SECTION = {
  'desert-entry': ['map-tablet'],
  'ruined-temple': ['switch-1', 'switch-2', 'switch-3'],
  catacombs: ['glyph-1', 'glyph-2', 'glyph-3'],
  'escape-sequence': ['escape-beacon'],
};

const OBJECTIVE_LABELS = {
  'desert-entry': 'Map Tablet',
  'ruined-temple': 'Switches',
  catacombs: 'Glyph Fragments',
  'escape-sequence': 'Escape Route',
  'dig-site-entrance': 'Guardian Seal',
};

const OBJECTIVE_SINGULAR_LABELS = {
  'desert-entry': 'map tablet',
  'ruined-temple': 'switch',
  catacombs: 'glyph fragment',
  'escape-sequence': 'escape marker',
  'dig-site-entrance': 'guardian seal',
};

const CHINA_OBJECTIVE_LABELS = {
  'desert-entry': 'River Survey Tablet',
  'ruined-temple': 'Archive Switches',
  catacombs: 'Oracle Fragments',
  'escape-sequence': 'Safe Route',
  'dig-site-entrance': 'Rammed-Earth Seal',
};

const CHINA_OBJECTIVE_SINGULAR_LABELS = {
  'desert-entry': 'river survey tablet',
  'ruined-temple': 'archive switch',
  catacombs: 'oracle fragment',
  'escape-sequence': 'safe route marker',
  'dig-site-entrance': 'rammed-earth seal',
};

const CHINA_GATE_NAMES = {
  'guardian-prep-seal': 'Guardian Prep Seal',
  'desert-seal': 'River Valley Seal',
  'temple-seal': 'Bronze Archive Seal',
  'catacomb-seal': 'Jade Archive Seal',
  'escape-seal': 'Field Records Seal',
  'final-gate': 'Rammed-Earth Site Gate',
};

const isPlatformAvailable = (platform, current) => (
  (!platform.requiresUpgrade || current.collectedUpgrades.has(platform.requiresUpgrade))
  && (!platform.requiresObjective || current.collectedObjectiveIds.has(platform.requiresObjective))
  && !current.collapsedPlatformIds?.has(platform.id || platform.label)
);

const isOpeningPyramidAirJumpAssistAvailable = (current, player, targetCivilisation) => {
  if (targetCivilisation !== 'Ancient Egypt' || current.scarabSealActivated) return false;
  const footY = player.y + player.height;
  return player.x >= OPENING_PYRAMID_AIR_JUMP_ASSIST_ZONE.minX
    && player.x <= OPENING_PYRAMID_AIR_JUMP_ASSIST_ZONE.maxX
    && footY >= OPENING_PYRAMID_AIR_JUMP_ASSIST_ZONE.minFootY
    && footY <= OPENING_PYRAMID_AIR_JUMP_ASSIST_ZONE.maxFootY;
};

const isHazardAvailable = (hazard, current) => (
  !hazard.revealedByScarabSeal || current.scarabSealActivated
);

const CHINA_GATE_HINTS = {
  objective: {
    'desert-entry': 'The river survey tablet is still behind you on the valley route.',
    'ruined-temple': 'One archive switch is still behind you near the timber gate.',
    catacombs: 'Search the archive floor for the remaining oracle fragment.',
    'escape-sequence': 'Reach the safe route marker before the seal will open.',
    'dig-site-entrance': 'The final rammed-earth seal opens after the guardian falls.',
  },
  shards: 'Search the nearby platforms and lower route for more relic shards.',
};

const CHINA_BOSS_KEY_ITEM_COPY = {
  'brush-handle': { name: 'Survey Brush Handle', checklistLabel: 'Survey Brush Handle' },
  'trowel-blade': { name: 'Archive Trowel Blade', checklistLabel: 'Archive Trowel Blade' },
  'measuring-cord': { name: 'River Measuring Cord', checklistLabel: 'River Measuring Cord' },
  'field-notebook-clasp': { name: 'Field Notebook Clasp', checklistLabel: 'Field Notebook Clasp' },
  'camera-lens': { name: 'Survey Camera Lens', checklistLabel: 'Survey Camera Lens' },
};

const getBossRewardProgress = (current) => {
  const recoveredCount = BOSS_KEY_ITEMS.filter(item => (
    current.collectedBossKeyIds?.has(item.id)
      || current.bossKeyItems?.some(keyItem => keyItem.id === item.id && keyItem.collected)
  )).length;

  return {
    recoveredCount,
    totalCount: BOSS_KEY_ITEMS.length,
    complete: recoveredCount >= BOSS_KEY_ITEMS.length,
  };
};

const shuffleGuardianQuestionOptions = (question) => {
  const options = question.options.map((text, originalIndex) => ({
    id: `${question.id}-${originalIndex}`,
    text,
    originalIndex,
  }));

  for (let index = options.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
  }

  return {
    ...question,
    shuffledOptions: options,
  };
};

const SECTION_MUSIC_CUES = {
  'desert-entry': 'desert',
  'ruined-temple': 'temple',
  catacombs: 'catacombs',
  'escape-sequence': 'escape',
  'dig-site-entrance': 'baseCamp',
};

const JOURNEY_POLISH_VERSION = 'journey-polish-2026-05-11';
const CHINA_BACKGROUND_POLISH_VERSION = 'china-background-composited-art-2026-05-15';
const EGYPT_AMBIENT_LIFE_VERSION = 'egypt-ambient-life-start-route-2026-05-15';

const seededStepRandom = (seed = 1, cycle = 0, salt = 0) => {
  const value = Math.sin(seed * 12.9898 + cycle * 78.233 + salt * 37.719) * 43758.5453;
  return value - Math.floor(value);
};

const updateHostileStepMultiplier = (hostile, dt, { boss = false } = {}) => {
  hostile.stepTimer = (hostile.stepTimer || 0) + dt;
  hostile.stepShiftTimer = Math.max(0, (hostile.stepShiftTimer || 0) - dt);
  hostile.stepPauseTimer = Math.max(0, (hostile.stepPauseTimer || 0) - dt);

  if (hostile.stepShiftTimer <= 0) {
    hostile.stepCycle = (hostile.stepCycle || 0) + 1;
    const speedRoll = seededStepRandom(hostile.stepSeed, hostile.stepCycle, 1);
    const durationRoll = seededStepRandom(hostile.stepSeed, hostile.stepCycle, 2);
    const pauseRoll = seededStepRandom(hostile.stepSeed, hostile.stepCycle, 3);
    hostile.stepSpeedMultiplier = boss
      ? 0.9 + speedRoll * 0.22
      : 0.8 + speedRoll * 0.34;
    hostile.stepShiftTimer = boss
      ? 0.85 + durationRoll * 1.15
      : 0.55 + durationRoll * 0.9;
    hostile.stepPauseTimer = pauseRoll > (boss ? 0.78 : 0.68)
      ? (boss ? 0.12 + pauseRoll * 0.1 : 0.14 + pauseRoll * 0.16)
      : 0;
  }

  const rhythm = 1 + Math.sin((hostile.stepCycle || 0) + hostile.stepSeed * 0.01 + hostile.stepTimer * (hostile.stepRhythm || 1.5)) * (boss ? 0.07 : 0.11);
  const pauseMultiplier = hostile.stepPauseTimer > 0 ? (boss ? 0.45 : 0.28) : 1;
  return Math.max(boss ? 0.7 : 0.55, (hostile.stepSpeedMultiplier || 1) * rhythm * pauseMultiplier);
};
const COLLECTIBLE_SCALE_TUNING_VERSION = 'journey-collectible-shard-atlas-upgrade-2026-05-21';
const RELIC_SHARD_SCALE = 1.08;
const FIELD_TOOL_SCALE = 0.86;
const UPGRADE_SCALE = 0.86;
const OBJECTIVE_MARKER_SCALE = 0.84;
const LORE_TABLET_SCALE = 0.84;
const PICKUP_GLOW_SCALE = 0.68;

const COLLECTIBLE_VISUAL_BASE = {
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

const GATE_HINTS = {
  objective: {
    'desert-entry': 'The map tablet is still behind you in the desert route.',
    'ruined-temple': 'One switch is still behind you in the Ruined Temple.',
    catacombs: 'Search the catacomb floor for the remaining glyph fragment.',
    'escape-sequence': 'Reach the escape marker before the route seal will open.',
    'dig-site-entrance': 'The final guardian seal opens after the Ancient Construct falls.',
  },
  shards: 'Search the nearby platforms and lower route for more relic shards.',
  upgrade: 'Look back through this section for the missing upgrade route.',
};

const HAZARD_VISUALS = {
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

const ENEMY_TACTICAL_PRESSURE = {
  scarab: { windup: 0.96, cooldown: 0.9, speed: 1.18, range: 1.08, recovery: 0.96, vulnerableAfter: 0.95, awareness: 1.55, chase: 2.05 },
  scorpion: { windup: 1, cooldown: 0.94, speed: 0.86, range: 0.88, recovery: 1.04, vulnerableAfter: 1.03, awareness: 1.45, chase: 1.85 },
  'sand-wisp': { windup: 0.92, cooldown: 0.9, speed: 1.16, range: 1.08, recovery: 0.96, vulnerableAfter: 0.96, awareness: 1.6, chase: 2 },
  snake: { windup: 0.98, cooldown: 0.92, speed: 1.14, range: 1.18, recovery: 1.02, vulnerableAfter: 1, awareness: 1.54, chase: 1.8 },
  bat: { windup: 0.9, cooldown: 0.84, speed: 1.14, range: 1.12, recovery: 0.92, vulnerableAfter: 0.9, awareness: 1.58, chase: 1.95 },
  looter: { windup: 0.88, cooldown: 0.8, speed: 1.16, range: 1.12, recovery: 0.9, vulnerableAfter: 0.88, awareness: 1.54, chase: 1.82, shieldDuringWindup: true },
  bes: { windup: 0.94, cooldown: 0.9, speed: 0.96, range: 1.14, recovery: 1, vulnerableAfter: 1, awareness: 1.5, chase: 1.62, shieldDuringWindup: true },
  mummy: { windup: 0.96, cooldown: 0.94, speed: 0.92, range: 1.08, recovery: 1.02, vulnerableAfter: 1, awareness: 1.42, chase: 1.56, shieldDuringWindup: true },
  guardian: { windup: 1, cooldown: 0.94, speed: 0.86, range: 1.08, recovery: 1.05, vulnerableAfter: 1.04, awareness: 1.36, chase: 1.48 },
  statue: { windup: 1, cooldown: 0.96, speed: 0.84, range: 1.08, recovery: 1.06, vulnerableAfter: 1.05, awareness: 1.32, chase: 1.42 },
  'river-crab': { windup: 0.94, cooldown: 0.86, speed: 1.1, range: 1.12, recovery: 0.94, vulnerableAfter: 0.92, awareness: 1.5, chase: 1.85 },
  'watchtower-sentry': { windup: 0.88, cooldown: 0.8, speed: 1.16, range: 1.12, recovery: 0.9, vulnerableAfter: 0.88, awareness: 1.54, chase: 1.82, shieldDuringWindup: true },
  'clay-guardian': { windup: 1, cooldown: 0.94, speed: 0.86, range: 1.08, recovery: 1.05, vulnerableAfter: 1.04, awareness: 1.36, chase: 1.48 },
};

const ENEMY_HIT_SFX_BY_TYPE = {
  scarab: 'scarabHit',
  scorpion: 'scorpionHit',
  snake: 'snakeHit',
  'sand-wisp': 'sandWispHit',
};

const getEnemyHitSfxKey = (enemy) => ENEMY_HIT_SFX_BY_TYPE[enemy?.type] || 'enemyHit';

const SAND_TRAP_HAZARD_IDS = new Set([
  'sealed-sand',
  'sand-pit',
  'desert-low-ridge',
  'desert-soft-ridge',
  'sandfall-soft-pit',
  'sandfall-warning-dust',
  'escape-dust-pocket',
]);

const getHazardSfxKey = (hazard) => {
  if (hazard?.pushToStart) return 'trapReset';
  if (SAND_TRAP_HAZARD_IDS.has(hazard?.id)) return 'trapSandTrigger';
  return 'trapStoneTrigger';
};

const HAZARD_GROUNDING = {
  'thorn-bush': {
    xPad: 6,
    yOffset: 12,
    widthPad: 12,
    heightPad: 20,
    shadow: 0.2,
    dustWidth: 0.88,
    filter: 'sepia(8%) saturate(84%) brightness(90%)',
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
    yOffset: 8,
    widthPad: 16,
    heightPad: 14,
    shadow: 0.24,
    dustWidth: 0.9,
    filter: 'sepia(10%) saturate(82%) brightness(88%)',
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

const HAZARD_VISUAL_ALIASES = {
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

const getHazardVisualId = (hazard) => HAZARD_VISUAL_ALIASES[hazard.id] || hazard.id;

const getEgyptHazardDecalDescriptor = (hazard) => {
  const visualId = getHazardVisualId(hazard);
  const trapRegionKey = OPENING_TRAP_DECAL_BY_HAZARD[hazard.id] || OPENING_TRAP_DECAL_BY_HAZARD[visualId] || null;
  if (trapRegionKey) return { pack: 'trap', regionKey: trapRegionKey };
  const hazardRegionKey = OPENING_HAZARD_DECAL_BY_HAZARD[hazard.id] || OPENING_HAZARD_DECAL_BY_HAZARD[visualId] || null;
  if (hazardRegionKey) return { pack: 'hazard', regionKey: hazardRegionKey };
  return null;
};

const getEgyptHazardDecalDest = (hazard, screenX, footY, regionKey) => {
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

const getHazardVisualConfig = (hazard) => {
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

const getHazardGroundingConfig = (hazard) => {
  const baseId = getHazardVisualId(hazard);
  return HAZARD_GROUNDING[baseId] || HAZARD_GROUNDING['spike-trap'];
};

const PROP_GROUNDING_CONFIG = {
  ruins: { width: 104, height: 94, yOffset: 92, alpha: 0.42, depth: 'background', tint: 'dust', shadow: 0.1, dust: 0.52 },
  camp: { width: 86, height: 58, yOffset: 18, alpha: 0.64, depth: 'background', tint: 'dust', shadow: 0.12, dust: 0.58 },
  column: { width: 96, height: 86, yOffset: 62, alpha: 0.62, depth: 'midground', tint: 'buried-stone', shadow: 0.18, dust: 0.86, bury: 0.3 },
  cart: { depth: 'midground' },
  door: { width: 118, height: 150, yOffset: 132, alpha: 0.48, depth: 'background', tint: 'dust', shadow: 0.12, dust: 0.58 },
  statue: { width: 70, height: 90, yOffset: 54, alpha: 0.58, depth: 'background', tint: 'stone', shadow: 0.12, dust: 0.58 },
  'jackal-statue': { width: 82, height: 122, yOffset: 88, alpha: 0.96, depth: 'midground', tint: 'stone', shadow: 0.28, dust: 0.9, bury: 0.14 },
  'damaged-jackal-statue': { width: 92, height: 118, yOffset: 88, alpha: 0.9, depth: 'midground', tint: 'stone', shadow: 0.26, dust: 0.9, bury: 0.18 },
  bridge: { width: 168, height: 62, yOffset: 20, alpha: 0.62, depth: 'midground', tint: 'warm', shadow: 0.2, dust: 0.72 },
  lights: { width: 42, height: 62, yOffset: 18, alpha: 0.48, depth: 'background', tint: 'cool', shadow: 0.08, dust: 0.44 },
  banners: { width: 76, height: 48, yOffset: 28, alpha: 0.5, depth: 'background', tint: 'dust', shadow: 0.08, dust: 0.48 },
  'sacred-pedestal': { width: 84, height: 72, yOffset: 38, alpha: 0.88, depth: 'midground', tint: 'warm', shadow: 0.22, dust: 0.78 },
  'sacred-pedestal-activated': { width: 84, height: 72, yOffset: 38, alpha: 1, depth: 'midground', tint: 'warm', shadow: 0.28, dust: 0.84 },
  'guardian-seal': { width: 46, height: 46, yOffset: 8, alpha: 0.92, depth: 'midground', tint: 'warm', shadow: 0.12, dust: 0.42 },
  'guardian-seal-activated': { width: 52, height: 52, yOffset: 10, alpha: 1, depth: 'midground', tint: 'warm', shadow: 0.18, dust: 0.48 },
  'atmosphere-prop': { width: 96, height: 82, yOffset: 0, alpha: 0.82, depth: 'midground', tint: 'dust', shadow: 0.14, dust: 0.72, bury: 0.12 },
  mural: { depth: 'background' },
  glyphs: { depth: 'background' },
  eyes: { depth: 'background' },
  sign: { depth: 'midground' },
};

const STORY_PROP_GROUNDING_OVERRIDES = {
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

const SACRED_DEFENCE_STORY_PROP_IDS = new Set([
  'guardian-seal-pedestal-passive',
  'guardian-seal-passive',
]);

const ATMOSPHERE_GROUND_LOCK_MARGIN = 5;
const ATMOSPHERE_GROUND_LOCKED_ASSET_KEYS = new Set([
  'supplyJars',
  'fieldChest',
  'coinPile',
  'scrollCache',
  'rubbleScatter',
  'rubbleDustSmall',
  'fallenColumn',
  'pillarCaps',
]);

const isGroundLockedAtmosphereProp = (prop) => (
  prop?.type === 'atmosphere-prop'
  && ATMOSPHERE_GROUND_LOCKED_ASSET_KEYS.has(prop.atmosphereAssetKey)
);

const getStoryPropDepth = (prop) => {
  if (prop.depth === 'route-edge') return 'route-edge';
  if (isGroundLockedAtmosphereProp(prop)) return 'grounded';
  return STORY_PROP_GROUNDING_OVERRIDES[prop.id]?.depth
    || (PROP_GROUNDING_CONFIG[prop.type] || {}).depth
    || 'midground';
};

const DECORATIVE_PROP_LAYER_MODE = 'background-midground-grounded-depth-v3';
const PROP_DEPTH_TUNING_VERSION = 'journey-ground-locked-atmosphere-props-2026-05-21';
const ROUTE_GROUND_VISUAL_MODE = 'edge-and-local-aprons-no-full-width-haze';
const ROUTE_GROUND_HAZE_FIX_VERSION = 'route-ground-no-bottom-haze-2026-05-21';
const DRAW_JOURNEY_FLAG_MARKERS = false;
const JOURNEY_FLAG_VISUAL_MODE = 'flags-removed-stone-cairns-v1';
const WORLD_CONTINUITY_VERSION = 'connected-expedition-world-2026-05-16';
const REACTIVE_ENVIRONMENT_VERSION = 'reactive-expedition-world-2026-05-16';
const DYNAMIC_WORLD_VERSION = 'dynamic-expedition-world-storytelling-2026-05-16';
const DISCOVERY_ENTRANCE_REVEAL_SECONDS = 2.2;

const SECTION_PARALLAX_LAYERS = {
  'desert-entry': [
    { key: 'foregroundParallax', y: 0, height: CANVAS_HEIGHT, parallax: 0.1, alpha: 0.78, foreground: true },
  ],
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
};

const getDirectionFromPlayer = (playerX, targetX) => {
  if (targetX == null) return 'nearby';
  if (targetX < playerX - 35) return 'left';
  if (targetX > playerX + 35) return 'right';
  return 'nearby';
};

const getDirectionText = (direction) => (
  direction === 'left' ? 'behind you' : direction === 'right' ? 'ahead' : 'nearby'
);

const formatMissingSummary = (missing) => {
  if (missing.length === 0) return 'all route tasks are ready';
  if (missing.length === 1) return missing[0].shortMissing;
  if (missing.length === 2) return `${missing[0].shortMissing} and ${missing[1].shortMissing}`;
  return `${missing.slice(0, -1).map(item => item.shortMissing).join(', ')} and ${missing[missing.length - 1].shortMissing}`;
};

const getCameraFollowTarget = (current) => {
  const playerCenterX = current.player.x + current.player.width / 2;
  if (current.openingThresholdScene?.lockMovement) {
    return {
      mode: 'opening-threshold',
      focusTarget: Math.round(current.openingThresholdScene.focusX || playerCenterX),
      targetCameraX: clampCameraX((current.openingThresholdScene.focusX || playerCenterX) - CANVAS_WIDTH * 0.54),
    };
  }

  if (current.bossIntroTimer > 0 && current.bossIntro?.focusX) {
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

const easeInOutCubic = (value) => {
  const t = clamp(value, 0, 1);
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const getOpeningThresholdDialogueLine = (scene) => {
  if (!scene?.lines?.length) return null;
  const elapsed = clamp((scene.duration || 0) - (scene.timer || 0), 0, scene.duration || 0);
  const activeLine = [...scene.lines].reverse().find(line => elapsed >= line.at);
  return activeLine || scene.lines[0];
};

const getOpeningCameraRevealTarget = (current) => {
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
  const sealFocusX = SCARAB_SEAL_TRIGGER.x + SCARAB_SEAL_TRIGGER.width / 2;
  const sealCameraX = Math.min(
    clampCameraX(sealFocusX - CANVAS_WIDTH * 0.64),
    clampCameraX(startCameraX + CANVAS_WIDTH * 0.18),
  );

  let revealWeight = 1;
  if (elapsed < OPENING_CAMERA_REVEAL_PAN_SECONDS) {
    revealWeight = easeInOutCubic(elapsed / OPENING_CAMERA_REVEAL_PAN_SECONDS);
  } else if (elapsed > OPENING_CAMERA_REVEAL_PAN_SECONDS + OPENING_CAMERA_REVEAL_HOLD_SECONDS) {
    const returnElapsed = elapsed - OPENING_CAMERA_REVEAL_PAN_SECONDS - OPENING_CAMERA_REVEAL_HOLD_SECONDS;
    revealWeight = 1 - easeInOutCubic(returnElapsed / returnSeconds);
  }

  return {
    mode: 'opening-reveal',
    focusTarget: Math.round(sealFocusX),
    targetCameraX: clampCameraX(startCameraX + (sealCameraX - startCameraX) * revealWeight),
    progress: Number(revealWeight.toFixed(3)),
    secondsRemaining: Number(timer.toFixed(2)),
  };
};

export default function ExpeditionJourney({
  mission,
  onComplete,
  onSnapshotChange,
  audioControls,
  paused = false,
  targetCivilisation = 'Ancient Egypt',
  environmentPackId = ENVIRONMENT_ASSET_PACK_IDS.EGYPT_DESERT_TEMPLE,
  backgroundPackId = null,
  permanentUpgradeIds = [],
  permanentUpgradeEffects = {},
}) {
  const [selectedCharacterPresetId, setSelectedCharacterPresetId] = useState(() => {
    if (typeof window === 'undefined') return 'auto';
    const saved = window.localStorage.getItem(CHARACTER_LOADER_STORAGE_KEY);
    return PLAYER_CHARACTER_PRESETS.some(preset => preset.id === saved) ? saved : 'auto';
  });
  const [characterLoaderVisible, setCharacterLoaderVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(CHARACTER_LOADER_VISIBILITY_STORAGE_KEY) === 'true';
  });
  const playerHeroSpriteConfig = useMemo(() => getPlayerHeroSpriteConfig({
    targetCivilisation,
    backgroundPackId,
    characterPresetId: selectedCharacterPresetId,
  }), [backgroundPackId, selectedCharacterPresetId, targetCivilisation]);
  const selectedCharacterPreset = getPlayerCharacterPreset(selectedCharacterPresetId);
  const [gameState, setGameState] = useState(() => makeInitialState({
    targetCivilisation,
    permanentUpgradeIds,
    permanentUpgradeEffects,
  }));
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [guardianChallengeUi, setGuardianChallengeUi] = useState(null);
  const canvasRef = useRef(null);
  const stateRef = useRef(gameState);
  const keysRef = useRef({});
  const lastFrameRef = useRef(0);
  const animationRef = useRef(null);
  const playerSpriteRef = useRef({
    image: null,
    atlas: null,
    legacyImage: null,
    loaded: false,
    heroLoaded: false,
    legacyLoaded: false,
    failed: false,
    mode: 'loading',
    atlasPath: playerHeroSpriteConfig.atlasPath,
    characterId: playerHeroSpriteConfig.characterId,
    fallbackSrc: playerHeroSpriteConfig.fallbackSrc,
  });
  const environmentAssetsRef = useRef(createEnvironmentAssetState(environmentPackId));
  const sacredTrapEnvironmentAssetsRef = useRef(createEnvironmentAssetState(ENVIRONMENT_ASSET_PACK_IDS.EGYPT_SACRED_TRAPS));
  const atmosphereEnvironmentAssetsRef = useRef(createEnvironmentAssetState(ENVIRONMENT_ASSET_PACK_IDS.EGYPT_ATMOSPHERE));
  const desertBackgroundAssetsRef = useRef(createDesertBackgroundAssetState());
  const enemySpriteAssetsRef = useRef(createEnemySpriteState());
  const bossSpriteAssetsRef = useRef(createBossSpriteState());
  const collectibleSpriteAssetsRef = useRef(createCollectibleSpriteState());
  const playerWeaponSpriteRef = useRef(createPlayerWeaponSpriteState());
  const dynamicWorldAssetsRef = useRef(createDynamicWorldAssetState());
  const markerSpriteAssetsRef = useRef(createMarkerSpriteState());
  const openingScarabSealImageRef = useRef({ image: null, loaded: false, failed: false });
  const openingSphinxApparitionRef = useRef({ image: null, loaded: false, failed: false });
  const openingPyramidClimbPackRef = useRef({ image: null, loaded: false, failed: false });
  const openingPyramidFacadeRef = useRef({ image: null, loaded: false, failed: false });
  const openingTombStairwellRef = useRef({ image: null, loaded: false, failed: false, version: OPENING_TOMB_STAIRWELL_VERSION });
  const openingTrapDecalPackRef = useRef({ image: null, loaded: false, failed: false });
  const openingHazardDecalPackRef = useRef({ image: null, loaded: false, failed: false });
  const stageEntranceDoorwayRef = useRef({ image: null, loaded: false, failed: false, version: STAGE_ENTRANCE_DOORWAY_VERSION });
  const desertEndGatewayRef = useRef({ image: null, loaded: false, failed: false, version: DESERT_END_GATEWAY_VERSION });
  const footstepTimerRef = useRef(0);
  const wasGroundedRef = useRef(false);

  const syncHud = useCallback(() => {
    const nextState = { ...stateRef.current };
    setGameState(nextState);
    setGuardianChallengeUi(nextState.activeGuardianChallenge
      ? {
        ...nextState.activeGuardianChallenge,
        questions: [...nextState.activeGuardianChallenge.questions],
      }
      : null);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CHARACTER_LOADER_STORAGE_KEY, selectedCharacterPresetId);
  }, [selectedCharacterPresetId]);

  useEffect(() => {
    window.localStorage.setItem(CHARACTER_LOADER_VISIBILITY_STORAGE_KEY, characterLoaderVisible ? 'true' : 'false');
  }, [characterLoaderVisible]);

  useEffect(() => {
    const handleCharacterLoaderHotkey = (event) => {
      if (!event.ctrlKey || !event.altKey || event.code !== 'KeyC') return;
      event.preventDefault();
      setCharacterLoaderVisible(visible => !visible);
    };
    window.addEventListener('keydown', handleCharacterLoaderHotkey);
    return () => window.removeEventListener('keydown', handleCharacterLoaderHotkey);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      openingScarabSealImageRef.current = { image, loaded: true, failed: false };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      openingScarabSealImageRef.current = { image: null, loaded: false, failed: true };
    };
    image.src = `${import.meta.env.BASE_URL}${OPENING_SCARAB_SEAL_IMAGE_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      desertEndGatewayRef.current = { image, loaded: true, failed: false, version: DESERT_END_GATEWAY_VERSION };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      desertEndGatewayRef.current = { image: null, loaded: false, failed: true, version: DESERT_END_GATEWAY_VERSION };
    };
    image.src = `${import.meta.env.BASE_URL}${DESERT_END_GATEWAY_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      openingTombStairwellRef.current = {
        image,
        loaded: true,
        failed: false,
        version: OPENING_TOMB_STAIRWELL_VERSION,
      };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      openingTombStairwellRef.current = {
        image: null,
        loaded: false,
        failed: true,
        version: OPENING_TOMB_STAIRWELL_VERSION,
      };
    };
    image.src = `${import.meta.env.BASE_URL}${OPENING_TOMB_STAIRWELL_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      stageEntranceDoorwayRef.current = { image, loaded: true, failed: false, version: STAGE_ENTRANCE_DOORWAY_VERSION };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      stageEntranceDoorwayRef.current = { image: null, loaded: false, failed: true, version: STAGE_ENTRANCE_DOORWAY_VERSION };
    };
    image.src = `${import.meta.env.BASE_URL}${STAGE_ENTRANCE_DOORWAY_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      openingSphinxApparitionRef.current = { image, loaded: true, failed: false };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      openingSphinxApparitionRef.current = { image: null, loaded: false, failed: true };
    };
    image.src = `${import.meta.env.BASE_URL}${OPENING_SPHINX_APPARITION_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      openingHazardDecalPackRef.current = { image, loaded: true, failed: false };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      openingHazardDecalPackRef.current = { image: null, loaded: false, failed: true };
    };
    image.src = `${import.meta.env.BASE_URL}${OPENING_HAZARD_DECAL_PACK_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      openingTrapDecalPackRef.current = { image, loaded: true, failed: false };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      openingTrapDecalPackRef.current = { image: null, loaded: false, failed: true };
    };
    image.src = `${import.meta.env.BASE_URL}${OPENING_TRAP_DECAL_PACK_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      openingPyramidClimbPackRef.current = { image, loaded: true, failed: false };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      openingPyramidClimbPackRef.current = { image: null, loaded: false, failed: true };
    };
    image.src = `${import.meta.env.BASE_URL}${OPENING_PYRAMID_CLIMB_PACK_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      openingPyramidFacadeRef.current = { image, loaded: true, failed: false };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      openingPyramidFacadeRef.current = { image: null, loaded: false, failed: true };
    };
    image.src = `${import.meta.env.BASE_URL}${OPENING_PYRAMID_FACADE_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  const currentMusicCue = (() => {
    const current = gameState;
    const section = getSectionForX(current.player.x);
    const activeMiniBoss = current.miniBosses.some(boss => (
      boss.awakened && !boss.defeated && Math.abs(boss.x - current.player.x) < 520
    ));
    if (activeMiniBoss) return 'boss';
    return SECTION_MUSIC_CUES[section.id] || 'desert';
  })();

  const getSectionDisplayName = useCallback((sectionId) => (
    backgroundPackId === 'china-river-valley'
      ? CHINA_SECTION_COPY[sectionId]?.name || SECTIONS.find(section => section.id === sectionId)?.name || sectionId
      : SECTIONS.find(section => section.id === sectionId)?.name || sectionId
  ), [backgroundPackId]);

  const getSectionDisplayTitle = useCallback((sectionId) => (
    backgroundPackId === 'china-river-valley'
      ? CHINA_SECTION_COPY[sectionId]?.title || SECTION_ATMOSPHERES[sectionId]?.title || ''
      : SECTION_ATMOSPHERES[sectionId]?.title || ''
  ), [backgroundPackId]);

  useEffect(() => {
    const current = stateRef.current;
    if (!current.sectionTransition) return;
    current.sectionTransition = {
      ...current.sectionTransition,
      name: getSectionDisplayName(current.sectionTransition.id),
      message: getSectionDisplayTitle(current.sectionTransition.id),
    };
    current.notice = getSectionDisplayTitle(current.currentSectionId || current.sectionTransition.id) || current.notice;
    syncHud();
  }, [getSectionDisplayName, getSectionDisplayTitle, syncHud]);

  useEffect(() => {
    if (briefingOpen) return;
    audioControls?.playExpeditionMusic?.(currentMusicCue);
  }, [audioControls, briefingOpen, currentMusicCue]);

  useEffect(() => {
    let cancelled = false;
    const baseUrl = import.meta.env.BASE_URL;
    const {
      atlasPath,
      characterId,
      fallbackAtlasPath,
      fallbackCharacterId,
      fallbackSrc,
    } = playerHeroSpriteConfig;
    const loadLegacySprite = (heroState = {}) => {
      const legacyImage = new Image();
      legacyImage.onload = () => {
        if (cancelled) return;
        const useHero = Boolean(heroState.image && heroState.atlas);
        playerSpriteRef.current = {
          image: useHero ? heroState.image : legacyImage,
          atlas: heroState.atlas || null,
          legacyImage,
          loaded: true,
          heroLoaded: useHero,
          legacyLoaded: true,
          failed: false,
          mode: useHero ? 'hero-atlas' : 'legacy-strip',
          atlasPath: heroState.atlasPath || atlasPath,
          characterId: heroState.characterId || characterId,
          fallbackSrc,
        };
        stateRef.current.playerSpriteLoaded = true;
        syncHud();
      };
      legacyImage.onerror = () => {
        if (cancelled) return;
        const useHero = Boolean(heroState.image && heroState.atlas);
        playerSpriteRef.current = {
          image: heroState.image || null,
          atlas: heroState.atlas || null,
          legacyImage: null,
          loaded: useHero,
          heroLoaded: useHero,
          legacyLoaded: false,
          failed: !useHero,
          mode: useHero ? 'hero-atlas' : 'canvas-fallback',
          atlasPath: heroState.atlasPath || atlasPath,
          characterId: heroState.characterId || characterId,
          fallbackSrc,
        };
        stateRef.current.playerSpriteLoaded = useHero;
        syncHud();
      };
      legacyImage.src = `${baseUrl}${fallbackSrc}`;
    };

    const loadHeroAtlas = (heroAtlasPath, heroCharacterId) => fetch(`${baseUrl}${heroAtlasPath}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Player hero atlas request failed: ${response.status}`);
        return response.json();
      })
      .then((atlas) => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({
          image,
          atlas,
          atlasPath: heroAtlasPath,
          characterId: heroCharacterId,
        });
        image.onerror = () => reject(new Error(`Player hero image request failed: ${atlas.image}`));
        image.src = `${baseUrl}${getAtlasImagePath(heroAtlasPath, atlas.image)}`;
      }));

    if (!atlasPath) {
      loadLegacySprite();
      return () => {
        cancelled = true;
      };
    }

    loadHeroAtlas(atlasPath, characterId)
      .catch(() => (fallbackAtlasPath
        ? loadHeroAtlas(fallbackAtlasPath, fallbackCharacterId || characterId)
        : null))
      .then((heroState) => loadLegacySprite(heroState || {}))
      .catch(() => loadLegacySprite());
    return () => {
      cancelled = true;
    };
  }, [playerHeroSpriteConfig, syncHud]);

  useEffect(() => loadEnvironmentAssetPack({
    baseUrl: import.meta.env.BASE_URL,
    packId: environmentPackId,
    onUpdate: (assets) => {
      environmentAssetsRef.current = assets;
      syncHud();
    },
  }), [environmentPackId, syncHud]);

  useEffect(() => loadEnvironmentAssetPack({
    baseUrl: import.meta.env.BASE_URL,
    packId: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_SACRED_TRAPS,
    onUpdate: (assets) => {
      sacredTrapEnvironmentAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadEnvironmentAssetPack({
    baseUrl: import.meta.env.BASE_URL,
    packId: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_ATMOSPHERE,
    onUpdate: (assets) => {
      atmosphereEnvironmentAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadDesertBackgroundAssetPack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      desertBackgroundAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadDynamicWorldAssetPack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      dynamicWorldAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadEnemySpritePack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      enemySpriteAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadBossSpritePack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      bossSpriteAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadCollectibleSpritePack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      collectibleSpriteAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadPlayerWeaponSpritePack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      playerWeaponSpriteRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadMarkerSpritePack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      markerSpriteAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  const triggerJourneyRescue = useCallback((reason = FIELD_RESCUE_STAMINA_REASON, detail = FIELD_RESCUE_MESSAGE) => {
    const current = stateRef.current;
    current.failed = true;
    current.failureReason = reason;
    current.failureDetail = detail;
    current.notice = detail;
    audioControls?.playError?.();
    syncHud();
  }, [audioControls, syncHud]);

  const respawnAtCheckpoint = useCallback(() => {
    const current = stateRef.current;
    const cp = current.activeCheckpoint;
    current.player.x = cp.x;
    current.player.y = cp.y - current.player.height;
    current.player.vx = 0;
    current.player.vy = 0;
    current.resources.stamina = Math.max(current.resources.stamina, Math.min(current.upgradeEffects?.maxStamina || 100, 40));
    const camera = getCameraFollowTarget(current);
    current.cameraX = camera.targetCameraX;
    current.targetCameraX = camera.targetCameraX;
    current.cameraMode = camera.mode;
    current.cameraFocusTarget = camera.focusTarget;
    current.failed = false;
    current.failureReason = '';
    current.failureDetail = '';
    current.notice = `Retrying from ${cp.name}. Recover and try again.`;
    syncHud();
  }, [syncHud]);

  const answerGuardianChallenge = useCallback((answerIndex) => {
    const current = stateRef.current;
    const challenge = current.activeGuardianChallenge;
    if (!challenge || challenge.selectedAnswerIndex !== null || challenge.completed) return;
    const question = challenge.questions[challenge.currentIndex];
    if (!question) return;
    const correct = answerIndex === question.correctIndex;
    challenge.selectedAnswerIndex = answerIndex;
    challenge.feedback = {
      correct,
      message: correct ? KNOWLEDGE_CHALLENGE_FEEDBACK.correct : KNOWLEDGE_CHALLENGE_FEEDBACK.incorrect,
    };
    challenge.answers = [...(challenge.answers || []), {
      questionId: question.id,
      answerIndex,
      correct,
    }];
    challenge.correctCount += correct ? 1 : 0;

    const isFinalQuestion = challenge.currentIndex >= challenge.questions.length - 1;
    if (isFinalQuestion) {
      const modifier = getGuardianBattleModifier(challenge.correctCount);
      const boss = current.miniBosses.find(item => item.id === challenge.bossId);
      challenge.completed = true;
      challenge.modifier = modifier;
      challenge.resultMessage = modifier.resultMessage;
      current.guardianChallengeResults = {
        ...(current.guardianChallengeResults || {}),
        [challenge.bossId]: {
          bossId: challenge.bossId,
          bossName: challenge.bossName,
          correctCount: challenge.correctCount,
          totalQuestions: challenge.questions.length,
          modifierId: modifier.id,
          modifierLabel: modifier.label,
          resultMessage: modifier.resultMessage,
        },
      };
      current.guardianBattleModifiers = {
        ...(current.guardianBattleModifiers || {}),
        [challenge.bossId]: modifier,
      };
      if (boss) {
        boss.knowledgeModifierId = modifier.id;
        boss.playerDamageMultiplier = modifier.playerDamageMultiplier;
        boss.bossDamageMultiplier = modifier.bossDamageMultiplier;
        boss.visualScale = modifier.bossVisualScale;
        boss.maxHealth = Math.max(1, Number((boss.maxHealth * modifier.bossHealthMultiplier).toFixed(2)));
        boss.health = Math.min(boss.maxHealth, Math.max(1, Number((boss.health * modifier.bossHealthMultiplier).toFixed(2))));
        boss.attackCooldown = Math.max(boss.attackCooldown, 1.2);
      }
      current.player.knowledgeVisualScale = modifier.playerVisualScale;
      current.notice = modifier.resultMessage;
      current.cinematicEvent = {
        id: `${challenge.bossId}-knowledge-result`,
        name: 'Knowledge Challenge Complete',
        message: modifier.resultMessage,
        temporary: true,
      };
      current.cinematicTimer = 2.4;
      audioControls?.playLevelUp?.();
    } else {
      audioControls?.[correct ? 'playSuccess' : 'playError']?.();
    }
    syncHud();
  }, [audioControls, syncHud]);

  const continueGuardianChallenge = useCallback(() => {
    const current = stateRef.current;
    const challenge = current.activeGuardianChallenge;
    if (!challenge || challenge.selectedAnswerIndex === null) return;
    if (challenge.completed) {
      current.completedGuardianChallengeIds.add(challenge.bossId);
      current.activeGuardianChallenge = null;
      current.bossIntroPauseTimer = 0;
      current.notice = challenge.resultMessage || 'The guardian battle begins.';
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.18);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.18);
      audioControls?.playTransition?.();
      syncHud();
      return;
    }
    challenge.currentIndex += 1;
    challenge.selectedAnswerIndex = null;
    challenge.feedback = null;
    syncHud();
  }, [audioControls, syncHud]);

  const getObjectiveProgress = useCallback((sectionId, current) => {
    const config = SECTION_OBJECTIVES[sectionId];
    if (!config) return null;

    let count = 0;
    if (sectionId === 'desert-entry') {
      count = current.collectedObjectiveIds.has('map-tablet') ? 1 : 0;
    } else if (sectionId === 'ruined-temple') {
      count = ['switch-1', 'switch-2', 'switch-3'].filter(id => current.collectedObjectiveIds.has(id)).length;
    } else if (sectionId === 'catacombs') {
      count = ['glyph-1', 'glyph-2', 'glyph-3'].filter(id => current.collectedObjectiveIds.has(id)).length;
    } else if (sectionId === 'escape-sequence') {
      count = current.collectedObjectiveIds.has('escape-beacon') ? 1 : 0;
    } else if (sectionId === 'dig-site-entrance') {
      count = current.defeatedMiniBosses.has('ancient-construct') ? 1 : 0;
    }

    return { ...config, count };
  }, []);

  const getNearestUnmetObjective = useCallback((sectionId, current) => {
    const markerIds = OBJECTIVE_MARKER_IDS_BY_SECTION[sectionId] || [];
    const marker = OBJECTIVE_MARKERS.find(item => (
      markerIds.includes(item.id) && !current.collectedObjectiveIds.has(item.id)
    ));
    return marker ? {
      type: 'objective',
      id: marker.id,
      label: backgroundPackId === 'china-river-valley'
        ? CHINA_OBJECTIVE_LABELS[sectionId] || marker.label
        : marker.label,
      x: marker.x,
      direction: getDirectionFromPlayer(current.player.x, marker.x),
    } : null;
  }, [backgroundPackId]);

  const getGateRequirements = useCallback((gate, current) => {
    const reqs = [];
    const isChinaJourney = backgroundPackId === 'china-river-valley';
    const objectiveLabels = isChinaJourney ? CHINA_OBJECTIVE_LABELS : OBJECTIVE_LABELS;
    const objectiveSingularLabels = isChinaJourney ? CHINA_OBJECTIVE_SINGULAR_LABELS : OBJECTIVE_SINGULAR_LABELS;
    const sectionId = gate.requires.objective;
    if (sectionId) {
      const objective = getObjectiveProgress(sectionId, current);
      const nearest = getNearestUnmetObjective(sectionId, current);
      const missingCount = objective ? Math.max(0, objective.total - objective.count) : 1;
      const objectiveLabel = objectiveLabels[sectionId] || 'Objective';
      const objectiveSingularLabel = objectiveSingularLabels[sectionId] || 'objective';
      reqs.push({
        type: 'objective',
        id: sectionId,
        label: `${objectiveLabel}: ${objective?.count ?? 0}/${objective?.total ?? 1}`,
        checklistLabel: objectiveLabel,
        shortMissing: missingCount === 1
          ? `complete 1 more ${objectiveSingularLabel}`
          : `complete ${missingCount} more ${objective?.itemLabel || 'objectives'}`,
        met: current.completedObjectiveIds.has(sectionId) || Boolean(objective && objective.count >= objective.total),
        found: objective?.count ?? 0,
        required: objective?.total ?? 1,
        hint: (isChinaJourney ? CHINA_GATE_HINTS.objective[sectionId] : GATE_HINTS.objective[sectionId])
          || 'Search this section for the missing objective marker.',
        targetX: nearest?.x ?? gate.x - 220,
        nearestObjective: nearest,
      });
    }
    if (gate.requires.miniBoss) {
      const boss = current.miniBosses.find(item => item.id === gate.requires.miniBoss);
      const bossName = boss?.name || gate.requires.miniBoss;
      const direction = getDirectionFromPlayer(current.player.x, boss?.x);
      reqs.push({
        type: 'miniBoss',
        id: gate.requires.miniBoss,
        label: `${bossName}: ${current.defeatedMiniBosses.has(gate.requires.miniBoss) ? 'defeated' : 'active'}`,
        checklistLabel: `${bossName} defeated`,
        shortMissing: `defeat ${bossName}`,
        met: current.defeatedMiniBosses.has(gate.requires.miniBoss),
        found: current.defeatedMiniBosses.has(gate.requires.miniBoss) ? 1 : 0,
        required: 1,
        hint: `${bossName} is still active ${getDirectionText(direction)}. Watch the warning tell, dodge, then counter.`,
        targetX: boss?.x,
        nearestObjective: boss ? {
          type: 'miniBoss',
          id: boss.id,
          label: boss.name,
          x: boss.x,
          direction,
        } : null,
      });
    }
    if (gate.requires.keyItem) {
      const keyItem = current.bossKeyItems?.find(item => item.id === gate.requires.keyItem)
        || BOSS_KEY_ITEMS.find(item => item.id === gate.requires.keyItem);
      const boss = current.miniBosses.find(item => item.id === keyItem?.bossId);
      const collected = current.collectedBossKeyIds?.has(gate.requires.keyItem) || Boolean(keyItem?.collected);
      const targetX = keyItem?.dropped ? keyItem.x : boss?.x;
      const direction = getDirectionFromPlayer(current.player.x, targetX);
      const keyItemCopy = isChinaJourney ? CHINA_BOSS_KEY_ITEM_COPY[gate.requires.keyItem] : null;
      const keyItemName = keyItemCopy?.name || keyItem?.name || 'Key artefact';
      reqs.push({
        type: 'toolPiece',
        id: gate.requires.keyItem,
        label: `${keyItemName}: ${collected ? 'recovered' : 'needed'}`,
        checklistLabel: keyItemCopy?.checklistLabel || keyItem?.name || 'Tool piece',
        shortMissing: `recover ${keyItemName}`,
        met: collected,
        found: collected ? 1 : 0,
        required: 1,
        hint: keyItem?.dropped
          ? `${keyItemName} is waiting ${getDirectionText(direction)}. Collect it to prepare the excavation kit.`
          : `Defeat ${boss?.name || 'the guardian'} to reveal ${keyItemName}.`,
        targetX,
        nearestObjective: targetX ? {
          type: 'toolPiece',
          id: keyItem?.id || gate.requires.keyItem,
          label: keyItemName,
          x: targetX,
          direction,
        } : null,
      });
    }
    if (gate.requires.enemies?.length) {
      const requiredEnemies = gate.requires.enemies
        .map(enemyId => current.enemies.find(enemy => enemy.id === enemyId))
        .filter(Boolean);
      const missingEnemies = requiredEnemies.filter(enemy => !current.defeatedEnemies?.has(enemy.id));
      const nearestEnemy = missingEnemies
        .sort((a, b) => Math.abs(a.x - current.player.x) - Math.abs(b.x - current.player.x))[0] || null;
      const direction = getDirectionFromPlayer(current.player.x, nearestEnemy?.x);
      reqs.push({
        type: 'enemyClear',
        id: `${gate.id}-route-guards`,
        label: `Route Guards: ${requiredEnemies.length - missingEnemies.length}/${requiredEnemies.length}`,
        checklistLabel: 'Route Guards defeated',
        shortMissing: `defeat ${missingEnemies.length} route guard${missingEnemies.length === 1 ? '' : 's'}`,
        met: missingEnemies.length === 0,
        found: requiredEnemies.length - missingEnemies.length,
        required: requiredEnemies.length,
        hint: nearestEnemy
          ? `${nearestEnemy.name} still guards the seal route ${getDirectionText(direction)}. Clear it before forcing the seal.`
          : 'Clear the route guards before forcing the seal.',
        targetX: nearestEnemy?.x,
        nearestObjective: nearestEnemy ? {
          type: 'enemyClear',
          id: nearestEnemy.id,
          label: nearestEnemy.name,
          x: nearestEnemy.x,
          direction,
        } : null,
      });
    }
    if (gate.requires.shards) {
      const missing = Math.max(0, gate.requires.shards - current.relicShardCount);
      const shard = RELIC_SHARDS
        .filter(item => (
          !current.collectedShardIds.has(item.id)
          && item.x < gate.x
          && (!item.routeId || current.discoveredHiddenRouteIds?.has(item.routeId))
        ))
        .sort((a, b) => Math.abs(a.x - current.player.x) - Math.abs(b.x - current.player.x))[0];
      const direction = getDirectionFromPlayer(current.player.x, shard?.x);
      reqs.push({
        type: 'shards',
        id: 'relic-shards',
        label: `Relic Shards: ${current.relicShardCount}/${gate.requires.shards}`,
        checklistLabel: 'Relic Shards',
        shortMissing: `collect ${missing} more relic shard${missing === 1 ? '' : 's'}`,
        met: current.relicShardCount >= gate.requires.shards,
        found: current.relicShardCount,
        required: gate.requires.shards,
        hint: `${isChinaJourney ? CHINA_GATE_HINTS.shards : GATE_HINTS.shards} Look ${getDirectionText(direction)} for the closest shard.`,
        targetX: shard?.x,
        nearestObjective: shard ? {
          type: 'shards',
          id: shard.id,
          label: 'Relic Shard',
          x: shard.x,
          direction,
        } : null,
      });
    }
    if (gate.requires.upgrades) {
      gate.requires.upgrades.forEach(uId => {
        const upgrade = UPGRADES.find(item => item.id === uId);
        const direction = getDirectionFromPlayer(current.player.x, upgrade?.x);
        reqs.push({
          type: 'upgrade',
          id: uId,
          label: `${upgrade?.name || 'Upgrade'}: ${current.collectedUpgrades.has(uId) ? 'packed' : 'missing'}`,
          checklistLabel: upgrade?.name || 'Upgrade',
          shortMissing: `find ${upgrade?.name || 'the missing upgrade'}`,
          met: current.collectedUpgrades.has(uId),
          found: current.collectedUpgrades.has(uId) ? 1 : 0,
          required: 1,
          hint: `${GATE_HINTS.upgrade} ${upgrade?.name || 'The upgrade'} is ${getDirectionText(direction)}.`,
          targetX: upgrade?.x,
          nearestObjective: upgrade ? {
            type: 'upgrade',
            id: upgrade.id,
            label: upgrade.name,
            x: upgrade.x,
            direction,
          } : null,
        });
      });
    }
    return reqs;
  }, [backgroundPackId, getNearestUnmetObjective, getObjectiveProgress]);

  const getGateGuidance = useCallback((gate, current) => {
    if (!gate) return null;
    const requirements = getGateRequirements(gate, current);
    const missingRequirements = requirements.filter(req => !req.met);
    const nearestMissingObjective = missingRequirements
      .map(req => req.nearestObjective)
      .filter(Boolean)
      .sort((a, b) => Math.abs(a.x - current.player.x) - Math.abs(b.x - current.player.x))[0] || null;
    const missingObjectiveDirection = nearestMissingObjective?.direction || null;
    const gateName = backgroundPackId === 'china-river-valley'
      ? CHINA_GATE_NAMES[gate.id] || gate.name
      : gate.name;
    const hint = missingRequirements[0]?.hint || gate.readyHint || `${gateName} is ready. Move through the open seal.`;
    return {
      activeGateName: gateName,
      activeGateLocked: missingRequirements.length > 0,
      gateRequirements: requirements,
      gateMissingRequirements: missingRequirements,
      gateHint: hint,
      nearestMissingObjective,
      missingObjectiveDirection,
      gateChecklistText: requirements.map(req => `${req.met ? '✓' : '○'} ${req.label}`).join(' | '),
      missingSummary: formatMissingSummary(missingRequirements),
      notice: missingRequirements.length > 0
        ? `${gateName} locked: ${formatMissingSummary(missingRequirements)}. ${hint}`
      : `${gateName} ready: all route tasks complete.`,
    };
  }, [backgroundPackId, getGateRequirements]);

  const getActiveShardGateProgress = useCallback((current) => {
    const gate = ROUTE_GATES.find(item => (
      !current.openedRouteGateIds.has(item.id) && Number.isFinite(item.requires?.shards)
    ));
    if (!gate) return null;
    const gateName = backgroundPackId === 'china-river-valley'
      ? CHINA_GATE_NAMES[gate.id] || gate.name
      : gate.name;
    return {
      gate,
      gateName,
      found: current.relicShardCount,
      required: gate.requires.shards,
      complete: current.relicShardCount >= gate.requires.shards,
    };
  }, [backgroundPackId]);

  const buildBossRewardMoment = useCallback((current, keyItem, phase = 'recovered') => {
    const progress = getBossRewardProgress(current);
    const routeGate = ROUTE_GATES.find(gate => gate.id === keyItem.gateId);
    const gateReady = routeGate
      ? getGateRequirements(routeGate, current).every(req => req.met)
      : false;
    const keyItemName = backgroundPackId === 'china-river-valley'
      ? CHINA_BOSS_KEY_ITEM_COPY[keyItem.id]?.name || keyItem.name
      : keyItem.name;
    const title = phase === 'revealed'
      ? `${keyItemName} revealed.`
      : `${keyItemName} recovered.`;
    const routeGateName = routeGate
      ? (backgroundPackId === 'china-river-valley'
        ? CHINA_GATE_NAMES[routeGate.id] || routeGate.name
        : routeGate.name)
      : null;
    const detail = phase === 'revealed'
      ? `Collect it to add this piece to the excavation kit. ${routeGateName ? `${routeGateName} needs it.` : ''} ${keyItem.rewardDetail || ''}`.trim()
      : `${keyItemName} is required for the excavation kit. ${routeGateName ? `${routeGateName} can read this discovery.` : ''} ${keyItem.rewardDetail || ''}`.trim();
    const nextObjective = progress.complete
      ? 'Excavation Kit complete. Base Camp can now open the excavation site.'
      : gateReady
        ? keyItem.routeOpenMessage || 'The next expedition route is now open.'
        : phase === 'revealed'
          ? `Collect the tool piece, then return to ${routeGateName || 'the route gate'}.`
          : `Return to ${routeGateName || 'the route gate'}. This piece helps prepare the excavation kit.`;

    return {
      id: `${keyItem.id}-${phase}-${Date.now()}`,
      phase,
      itemId: keyItem.id,
      itemName: keyItemName,
      itemLabel: keyItem.label,
      color: keyItem.color || '#b45309',
      title,
      detail,
      nextObjective,
      progressText: `Excavation Kit pieces: ${progress.recoveredCount} / ${progress.totalCount} recovered`,
      kitComplete: progress.complete,
      gateReady,
    };
  }, [backgroundPackId, getGateRequirements]);

  const getAttackBox = useCallback((attacker, range = 42, height = 28, direction = attacker.direction || 1, yOffset = 0, backReach = 0) => {
    const trailingReach = Math.max(0, backReach);
    return {
      x: direction >= 0 ? attacker.x + attacker.width - trailingReach : attacker.x - range,
      y: attacker.y + Math.max(4, (attacker.height - height) / 2) + yOffset,
      width: range + trailingReach,
      height,
    };
  }, []);

  const getAttackHurtbox = useCallback((hostile, { boss = false } = {}) => {
    return getEnemyAttackHurtbox(hostile, { boss });
  }, []);

  const addCombatEffect = useCallback((current, effect) => {
    current.combatHitEffects.push({
      timer: 0.35,
      maxTimer: 0.35,
      ...effect,
    });
    if (current.combatHitEffects.length > 18) current.combatHitEffects.shift();
  }, []);

  const recordEnvironmentInteraction = useCallback((current, interaction, reason = 'touched') => {
    current.triggeredEnvironmentIds?.add(interaction.id);
    current.recentEnvironmentInteractions = [
      {
        id: interaction.id,
        type: interaction.type,
        reason,
        message: interaction.message,
      },
      ...(current.recentEnvironmentInteractions || []),
    ].slice(0, 6);
  }, []);

  const getCombatMode = useCallback((entity) => {
    if (entity.defeated) return 'defeated';
    if (entity.stunTimer > 0) return 'stunned';
    if (entity.attackWindup > 0) return 'windup';
    if (entity.attackTimer > 0) return 'attacking';
    if (entity.attackRecovery > 0 || entity.attackCooldown > 0) return 'cooldown';
    return Math.abs(entity.speed || 0) > 0 ? 'patrol' : 'idle';
  }, []);

  const getPlayerAttackState = useCallback((current) => {
    if (current.attackWindupTimer > 0) return 'windup';
    if (current.attackTimer > 0) return 'swing';
    if (current.attackRecoilTimer > 0) return 'recoil';
    if (current.attackCooldown > 0) return 'cooldown';
    return 'ready';
  }, []);

  const getActiveHazardsNearPlayer = useCallback((current) => HAZARDS
    .filter(hazard => isHazardAvailable(hazard, current))
    .filter(hazard => Math.abs((hazard.x + hazard.width / 2) - (current.player.x + current.player.width / 2)) < 150)
    .map(hazard => ({
      id: hazard.id,
      name: hazard.name,
      distance: Math.round((hazard.x + hazard.width / 2) - (current.player.x + current.player.width / 2)),
      penalty: hazard.penalty,
    })), []);

  const getStaminaWarningState = useCallback((current) => {
    if (current.resources.stamina <= 0) return 'empty';
    if (current.resources.stamina < 30) return 'low';
    if (current.staminaFeedbackTimer > 0) return 'recent-loss';
    return 'stable';
  }, []);

  const isLowStamina = useCallback((current, maxValue = current.upgradeEffects?.maxStamina || 100) => (
    current.resources.stamina > 0 && current.resources.stamina <= Math.round(maxValue * 0.3)
  ), []);

  const getActiveHiddenRoutes = useCallback(() => (
    HIDDEN_ROUTES.filter(route => route.civilisation === targetCivilisation)
  ), [targetCivilisation]);

  const getActiveSecretCollectibles = useCallback(() => (
    SECRET_COLLECTIBLES.filter(item => item.civilisation === targetCivilisation)
  ), [targetCivilisation]);

  const getRouteAccessState = useCallback((route, current) => {
    const requiredUpgradeId = route?.requiredUpgradeId || route?.futureUpgradeHook || null;
    const unlocked = !requiredUpgradeId || current.collectedUpgrades?.has(requiredUpgradeId) || current.permanentUpgrades?.has(requiredUpgradeId);
    return {
      requiredUpgradeId,
      unlocked,
      locked: Boolean(requiredUpgradeId && !unlocked),
    };
  }, []);

  const getRouteById = useCallback((routeId) => (
    getActiveHiddenRoutes().find(route => route.id === routeId) || null
  ), [getActiveHiddenRoutes]);

  const isRouteRewardAccessible = useCallback((routeId, current) => {
    if (!routeId) return true;
    const route = getRouteById(routeId);
    if (!route) return true;
    const access = getRouteAccessState(route, current);
    return access.unlocked && current.discoveredHiddenRouteIds?.has(route.id);
  }, [getRouteAccessState, getRouteById]);

  const getBossPhaseConfig = useCallback((boss) => {
    const phases = BOSS_ATTACK_PHASES[boss.id] || DEFAULT_BOSS_ATTACK_PHASES;
    return phases.find(phase => phase.id === boss.attackPattern) || phases[boss.attackCycleIndex % phases.length] || phases[0];
  }, []);

  const getEnemyPatternConfig = useCallback((enemy) => {
    const basePattern = {
      ...(ENEMY_ATTACK_PATTERNS[enemy.type] || DEFAULT_ENEMY_ATTACK_PATTERN),
      ...(enemy.attackPatternTuning || {}),
    };
    const tunedPattern = enemy.type === 'scorpion'
      ? {
        ...basePattern,
        range: basePattern.range * SCORPION_ATTACK_RANGE_MULTIPLIER,
      }
      : basePattern;
    const pressure = ENEMY_TACTICAL_PRESSURE[enemy.type] || null;
    if (enemy.openingRouteRamp) {
      return {
        ...tunedPattern,
        awarenessMultiplier: tunedPattern.awarenessMultiplier ?? 1.28,
        chaseMultiplier: tunedPattern.chaseMultiplier ?? 1.28,
        aggroMemoryMultiplier: 0.88,
      };
    }
    if (!pressure) return tunedPattern;
    return {
      ...tunedPattern,
      windup: Math.max(0.24, tunedPattern.windup * (pressure.windup ?? 1)),
      duration: Math.max(0.2, tunedPattern.duration * (pressure.duration ?? 1)),
      cooldown: Math.max(0.82, tunedPattern.cooldown * (pressure.cooldown ?? 1)),
      recovery: Math.max(0.28, tunedPattern.recovery * (pressure.recovery ?? 1)),
      vulnerableAfter: Math.max(0.32, tunedPattern.vulnerableAfter * (pressure.vulnerableAfter ?? 1)),
      speed: tunedPattern.speed * (pressure.speed ?? 1),
      range: tunedPattern.range * (pressure.range ?? 1),
      height: tunedPattern.height * (pressure.height ?? 1),
      yOffset: tunedPattern.yOffset ?? 0,
      backReach: tunedPattern.backReach ?? 0,
      damageScale: tunedPattern.damageScale ?? 1,
      shieldDuringWindup: tunedPattern.shieldDuringWindup || Boolean(pressure.shieldDuringWindup),
      awarenessMultiplier: pressure.awareness ?? 1,
      chaseMultiplier: pressure.chase ?? 1,
      aggroMemoryMultiplier: pressure.aggroMemory ?? 1,
    };
  }, []);

  const getBossVulnerabilityState = useCallback((boss) => {
    const phase = getBossPhaseConfig(boss);
    const shielded = boss.shieldTimer > 0 || (boss.attackWindup > 0 && phase?.shieldDuringWindup);
    const vulnerable = !shielded && (boss.vulnerabilityTimer > 0 || boss.attackRecovery > 0 || boss.stunTimer > 0);
    return {
      phaseId: boss.attackPattern || phase?.id || 'heavy',
      phaseLabel: boss.attackPhaseLabel || phase?.label || 'Heavy attack',
      attackKind: boss.attackKind || phase?.kind || 'close',
      shielded,
      vulnerable,
      vulnerabilityTimer: Number((boss.vulnerabilityTimer || 0).toFixed(2)),
      shieldTimer: Number((boss.shieldTimer || 0).toFixed(2)),
      patternHistory: boss.patternHistory || [],
    };
  }, [getBossPhaseConfig]);

  const getEntityCombatState = useCallback((entity) => ({
    state: getCombatMode(entity),
    idle: getCombatMode(entity) === 'idle',
    patrol: getCombatMode(entity) === 'patrol',
    attacking: entity.attackTimer > 0,
    windup: entity.attackWindup > 0,
    cooldown: entity.attackRecovery > 0 || entity.attackCooldown > 0,
    stunned: entity.stunTimer > 0,
    defeated: Boolean(entity.defeated),
    recovery: Number((entity.attackRecovery || 0).toFixed(2)),
    vulnerable: Boolean(entity.vulnerabilityTimer > 0 || entity.attackRecovery > 0 || entity.stunTimer > 0),
    shielded: Boolean(entity.shieldTimer > 0),
    counterWindow: Number((entity.vulnerabilityTimer || 0).toFixed(2)),
    pattern: entity.attackPattern || null,
    patternLabel: entity.attackPhaseLabel || null,
  }), [getCombatMode]);

  const createJourneySnapshot = useCallback((current = stateRef.current) => {
    const section = getSectionForX(current.player.x);
    const objective = getObjectiveProgress(section.id, current);
    const activeMiniBoss = current.miniBosses.find(boss => boss.awakened && !boss.defeated && Math.abs(boss.x - current.player.x) < 520);
    const nearbyCombatEnemy = current.enemies
      .filter(enemy => !enemy.defeated && Math.abs(enemy.x - current.player.x) < 520)
      .sort((a, b) => Math.abs(a.x - current.player.x) - Math.abs(b.x - current.player.x))[0] || null;
    const activeEnemyCounterWindow = current.enemies.find(enemy => !enemy.defeated && (enemy.vulnerabilityTimer > 0 || enemy.attackRecovery > 0));
    const activeBossCounterWindow = current.miniBosses.find(boss => !boss.defeated && (boss.vulnerabilityTimer > 0 || boss.attackRecovery > 0));
    const activeHiddenRoutes = getActiveHiddenRoutes();
    const activeSecretCollectibles = getActiveSecretCollectibles();
    const environmentAssets = environmentAssetsRef.current;
    const missingEnvironmentAssets = getMissingEnvironmentAssets(environmentAssets);
    const environmentFallbackActive = !environmentAssets.loaded || environmentAssets.failed || missingEnvironmentAssets.length > 0;
    const sacredTrapEnvironmentAssets = sacredTrapEnvironmentAssetsRef.current;
    const missingSacredTrapEnvironmentAssets = getMissingEnvironmentAssets(sacredTrapEnvironmentAssets);
    const atmosphereEnvironmentAssets = atmosphereEnvironmentAssetsRef.current;
    const missingAtmosphereEnvironmentAssets = getMissingEnvironmentAssets(atmosphereEnvironmentAssets);
    const desertBackgroundAssets = desertBackgroundAssetsRef.current;
    const desertPack = getSectionBackgroundAssets(desertBackgroundAssets, 'desert-entry');
    const chinaRiverValleyPack = getSectionBackgroundAssets(desertBackgroundAssets, 'china-river-valley');
    const ruinedTemplePack = getSectionBackgroundAssets(desertBackgroundAssets, 'ruined-temple');
    const catacombsPack = getSectionBackgroundAssets(desertBackgroundAssets, 'catacombs');
    const escapePack = getSectionBackgroundAssets(desertBackgroundAssets, 'escape-sequence');
    const digSitePack = getSectionBackgroundAssets(desertBackgroundAssets, 'dig-site-entrance');
    const missingDesertBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'desert-entry');
    const missingRuinedTempleBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'ruined-temple');
    const missingCatacombsBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'catacombs');
    const missingEscapeBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'escape-sequence');
    const missingDigSiteBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'dig-site-entrance');
    const desertBackgroundFallbackActive = !desertPack?.loaded
      || desertPack.failed
      || missingDesertBackgroundAssets.length > 0;
    const ruinedTempleBackgroundFallbackActive = !ruinedTemplePack?.loaded
      || ruinedTemplePack.failed
      || missingRuinedTempleBackgroundAssets.length > 0;
    const catacombsBackgroundFallbackActive = !catacombsPack?.loaded
      || catacombsPack.failed
      || missingCatacombsBackgroundAssets.length > 0;
    const escapeBackgroundFallbackActive = !escapePack?.loaded
      || escapePack.failed
      || missingEscapeBackgroundAssets.length > 0;
    const digSiteBackgroundFallbackActive = !digSitePack?.loaded
      || digSitePack.failed
      || missingDigSiteBackgroundAssets.length > 0;
    const enemySpriteAssets = enemySpriteAssetsRef.current;
    const missingEnemySpriteAssets = getMissingEnemySpriteAssets(enemySpriteAssets);
    const chinaEnemyGuardianPack = enemySpriteAssets.packs?.chinaEnemyGuardian || null;
    const missingChinaEnemyGuardianSpriteAssets = EXPECTED_CHINA_ENEMY_GUARDIAN_SPRITE_KEYS
      .filter(key => !chinaEnemyGuardianPack?.atlas?.regions?.[key]);
    const chinaEnemyGuardianFallbackActive = !chinaEnemyGuardianPack?.loaded
      || chinaEnemyGuardianPack.failed
      || missingChinaEnemyGuardianSpriteAssets.length > 0;
    const enemySpriteFallbackActive = !enemySpriteAssets.loaded || enemySpriteAssets.failed || missingEnemySpriteAssets.length > 0;
    const bossSpriteAssets = bossSpriteAssetsRef.current;
    const missingBossSpriteAssets = getMissingBossSpriteAssets(bossSpriteAssets);
    const chinaClayGuardianBossPack = bossSpriteAssets.packs?.[CHINA_CLAY_GUARDIAN_BOSS_ID] || null;
    const bossSpriteFallbackActive = !bossSpriteAssets.loaded || bossSpriteAssets.failed || missingBossSpriteAssets.length > 0;
    const collectibleSpriteAssets = collectibleSpriteAssetsRef.current;
    const missingCollectibleSpriteAssets = getMissingCollectibleSpriteAssets(collectibleSpriteAssets);
    const collectibleSpriteFallbackActive = !collectibleSpriteAssets.loaded
      || collectibleSpriteAssets.failed
      || missingCollectibleSpriteAssets.length > 0;
    const playerWeaponAssets = playerWeaponSpriteRef.current;
    const missingPlayerWeaponSpriteAssets = getMissingPlayerWeaponSpriteAssets(playerWeaponAssets);
    const playerWeaponSpriteFallbackActive = !playerWeaponAssets.loaded
      || playerWeaponAssets.failed
      || missingPlayerWeaponSpriteAssets.length > 0;
    const markerSpriteAssets = markerSpriteAssetsRef.current;
    const missingMarkerSpriteAssets = getMissingMarkerSpriteAssets(markerSpriteAssets);
    const markerSpriteFallbackActive = !markerSpriteAssets.loaded
      || markerSpriteAssets.failed
      || missingMarkerSpriteAssets.length > 0;
    const dynamicWorldAssets = dynamicWorldAssetsRef.current;
    const renderStats = current.renderStats || {};
    const playerAttackBox = current.playerAttackBox
      ? {
        x: Math.round(current.playerAttackBox.x),
        y: Math.round(current.playerAttackBox.y),
        width: current.playerAttackBox.width,
        height: current.playerAttackBox.height,
      }
      : null;

    return {
      stage: 'journey',
      targetCivilisation,
      activeCivilisation: targetCivilisation,
      coordinateSystem: 'origin top-left, x right, y down',
      viewport: JOURNEY_VIEWPORT,
      renderTarget: JOURNEY_RENDER_TARGET,
      worldLayout: JOURNEY_WORLD_LAYOUT,
      cameraLayout: JOURNEY_CAMERA,
      hudSafeArea: JOURNEY_HUD_SAFE_AREA,
      canvasScaleState: getCanvasScaleState(canvasRef.current),
      player: {
        x: Math.round(current.player.x),
        y: Math.round(current.player.y),
        vx: Math.round(current.player.vx),
        vy: Math.round(current.player.vy),
        onGround: current.player.onGround,
        coyoteTimer: Number((current.player.coyoteTimer || 0).toFixed(2)),
        jumpBufferTimer: Number((current.player.jumpBufferTimer || 0).toFixed(2)),
        jumpCutFeedbackTimer: Number((current.player.jumpCutFeedbackTimer || 0).toFixed(2)),
      },
      playerFacing: current.player.direction >= 0 ? 'right' : 'left',
      playerSpriteLoaded: Boolean(playerSpriteRef.current.loaded),
      playerHeroSpriteLoaded: Boolean(playerSpriteRef.current.heroLoaded),
      playerLegacySpriteLoaded: Boolean(playerSpriteRef.current.legacyLoaded),
      playerSpriteCharacterId: playerSpriteRef.current.characterId || playerHeroSpriteConfig.characterId,
      playerSpriteAtlasPath: playerSpriteRef.current.atlasPath || playerHeroSpriteConfig.atlasPath,
      playerSpriteVersion: playerHeroSpriteConfig.version,
      playerSpriteVisualMode: renderStats.playerSpriteVisualMode || playerSpriteRef.current.mode || 'canvas-fallback',
      playerSpriteFrame: renderStats.playerSpriteFrame || null,
      playerSpriteFallbackSrc: playerSpriteRef.current.fallbackSrc || playerHeroSpriteConfig.fallbackSrc,
      playerAnimationState: current.player.animationState || 'idle',
      playerAnimationFrame: current.player.animationFrame ?? 1,
      playerSpriteScale: Number((current.player.spriteScale || PLAYER_SPRITE_SCALE).toFixed(3)),
      environmentAssetsLoaded: Boolean(environmentAssets.loaded),
      environmentAssetsReady: Boolean(environmentAssets.ready),
      environmentPackId: environmentAssets.packId,
      environmentAtlasPath: environmentAssets.atlasPath || ENVIRONMENT_ATLAS_JSON,
      missingEnvironmentAssets,
      environmentFallbackActive,
      sacredTrapEnvironmentAssetsLoaded: Boolean(sacredTrapEnvironmentAssets.loaded),
      sacredTrapEnvironmentAssetsReady: Boolean(sacredTrapEnvironmentAssets.ready),
      sacredTrapEnvironmentPackId: sacredTrapEnvironmentAssets.packId,
      sacredTrapEnvironmentAtlasPath: sacredTrapEnvironmentAssets.atlasPath || null,
      missingSacredTrapEnvironmentAssets,
      atmosphereEnvironmentAssetsLoaded: Boolean(atmosphereEnvironmentAssets.loaded),
      atmosphereEnvironmentAssetsReady: Boolean(atmosphereEnvironmentAssets.ready),
      atmosphereEnvironmentPackId: atmosphereEnvironmentAssets.packId,
      atmosphereEnvironmentAtlasPath: atmosphereEnvironmentAssets.atlasPath || null,
      missingAtmosphereEnvironmentAssets,
      platformArtMode: environmentAssets.loaded ? 'atlas' : 'canvas-fallback',
      hazardArtMode: environmentAssets.loaded ? 'atlas' : 'canvas-fallback',
      gateArtMode: environmentAssets.loaded ? 'atlas' : 'canvas-fallback',
      assetGroundingPassActive: true,
      assetGroundingVersion: JOURNEY_ASSET_GROUNDING_VERSION,
      groundedPropCount: renderStats.groundedPropCount || 0,
      atmospherePropCount: renderStats.atmospherePropCount || 0,
      groundLockedAtmospherePropCount: renderStats.groundLockedAtmospherePropCount || 0,
      atmosphereAssetVersion: EGYPT_ATMOSPHERE_ASSET_VERSION,
      atmosphereGroundingMode: renderStats.atmosphereGroundingMode || 'ground-locked-floor-assets',
      backgroundPropTintActive: Boolean(renderStats.backgroundPropTintActive),
      platformGroundingMode: renderStats.platformGroundingMode || 'contact-shadow-ledges',
      visibleElevatedPlatforms: renderStats.visibleElevatedPlatforms || [],
      propDrawOrderMode: renderStats.propDrawOrderMode || DECORATIVE_PROP_LAYER_MODE,
      decorativePropLayerMode: renderStats.decorativePropLayerMode || DECORATIVE_PROP_LAYER_MODE,
      propDepthTuningVersion: renderStats.propDepthTuningVersion || PROP_DEPTH_TUNING_VERSION,
      routeGroundVisualMode: renderStats.routeGroundVisualMode || ROUTE_GROUND_VISUAL_MODE,
      routeGroundHazeFixVersion: renderStats.routeGroundHazeFixVersion || ROUTE_GROUND_HAZE_FIX_VERSION,
      journeyFlagVisualMode: renderStats.journeyFlagVisualMode || JOURNEY_FLAG_VISUAL_MODE,
      removedRouteFlagCount: renderStats.removedRouteFlagCount || 0,
      floatingAssetWarnings: renderStats.floatingAssetWarnings || [],
      desertBackgroundAssetsLoaded: Boolean(desertPack?.loaded),
      desertBackgroundAssetsReady: Boolean(desertPack?.ready),
      desertBackgroundFallbackActive,
      ruinedTempleBackgroundAssetsLoaded: Boolean(ruinedTemplePack?.loaded),
      ruinedTempleBackgroundAssetsReady: Boolean(ruinedTemplePack?.ready),
      ruinedTempleBackgroundFallbackActive,
      ruinedTempleBackgroundAtlasPath: RUINED_TEMPLE_BACKGROUND_ATLAS_JSON,
      catacombsBackgroundAssetsLoaded: Boolean(catacombsPack?.loaded),
      catacombsBackgroundAssetsReady: Boolean(catacombsPack?.ready),
      catacombsBackgroundFallbackActive,
      catacombsBackgroundAtlasPath: CATACOMBS_BACKGROUND_ATLAS_JSON,
      escapeBackgroundAssetsLoaded: Boolean(escapePack?.loaded),
      escapeBackgroundAssetsReady: Boolean(escapePack?.ready),
      escapeBackgroundFallbackActive,
      escapeBackgroundAtlasPath: ESCAPE_BACKGROUND_ATLAS_JSON,
      digSiteBackgroundAssetsLoaded: Boolean(digSitePack?.loaded),
      digSiteBackgroundAssetsReady: Boolean(digSitePack?.ready),
      digSiteBackgroundFallbackActive,
      digSiteBackgroundAtlasPath: DIG_SITE_BACKGROUND_ATLAS_JSON,
      baseCampBackgroundAssetsLoaded: Boolean(digSitePack?.loaded),
      baseCampBackgroundAssetsReady: Boolean(digSitePack?.ready),
      baseCampBackgroundFallbackActive: digSiteBackgroundFallbackActive,
      chinaRiverValleyBackgroundAssetsLoaded: Boolean(chinaRiverValleyPack?.loaded),
      chinaRiverValleyBackgroundAssetsReady: Boolean(chinaRiverValleyPack?.ready),
      chinaRiverValleyBackgroundFallbackActive: backgroundPackId === 'china-river-valley' && !chinaRiverValleyPack?.ready,
      chinaRiverValleyBackgroundAtlasPath: CHINA_RIVER_VALLEY_BACKGROUND_ATLAS_JSON,
      enemySpritesLoaded: enemySpriteAssets.loaded,
      enemySpriteFallbackActive,
      enemySpriteAtlasPath: ENEMY_SPRITE_ATLAS_JSON,
      enemySpriteAtlasVersion: ENEMY_SPRITE_ATLAS_VERSION,
      missingEnemySpriteAssets,
      chinaEnemyGuardianSpriteAtlasPath: CHINA_ENEMY_GUARDIAN_SPRITE_ATLAS_JSON,
      chinaEnemyGuardianSpritesLoaded: Boolean(chinaEnemyGuardianPack?.loaded),
      chinaEnemyGuardianSpriteFallbackActive: chinaEnemyGuardianFallbackActive,
      missingChinaEnemyGuardianSpriteAssets,
      visibleEnemySpriteFamilies: renderStats.visibleEnemySpriteFamilies || [],
      enemySpriteFrameStates: renderStats.enemySpriteFrameStates || [],
      enemyVisibilityAssistActive: Boolean(renderStats.enemyVisibilityAssistActive),
      bossSpritesLoaded: bossSpriteAssets.loaded,
      bossSpriteFallbackActive,
      bossSpriteAtlasPath: BOSS_SPRITE_ATLAS_JSON,
      bossSpriteAtlasVersion: BOSS_SPRITE_ATLAS_VERSION,
      missingBossSpriteAssets,
      activeBossSprite: renderStats.activeBossSprite || null,
      activeBossSpriteFrame: renderStats.activeBossSpriteFrame || null,
      activeBossAnimationState: renderStats.activeBossAnimationState || null,
      chinaClayGuardianSpriteLoaded: Boolean(chinaClayGuardianBossPack?.loaded),
      chinaClayGuardianSpriteFrame: renderStats.chinaClayGuardianSpriteFrame || null,
      chinaClayGuardianSpriteAtlasPath: CHINA_CLAY_GUARDIAN_SPRITE_ATLAS_JSON,
      stoneGuardianSpriteLoaded: Boolean(bossSpriteAssets.packs?.['temple-guardian']?.loaded),
      stoneGuardianSpriteFrame: renderStats.stoneGuardianSpriteFrame || null,
      stoneGuardianSpriteAtlasPath: STONE_GUARDIAN_SPRITE_ATLAS_JSON,
      ancientConstructSpriteLoaded: Boolean(bossSpriteAssets.packs?.['ancient-construct']?.loaded),
      ancientConstructSpriteFrame: renderStats.ancientConstructSpriteFrame || null,
      ancientConstructSpriteAtlasPath: ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON,
      collectibleSpritesLoaded: Boolean(collectibleSpriteAssets.loaded),
      collectibleSpritesReady: Boolean(collectibleSpriteAssets.ready),
      collectibleSpriteFallbackActive,
      collectibleSpriteAtlasPath: collectibleSpriteAssets.atlasPath || COLLECTIBLE_ATLAS_JSON,
      collectibleSpriteAtlasVersion: COLLECTIBLE_SPRITE_ATLAS_VERSION,
      missingCollectibleSpriteAssets,
      visibleToolSprites: renderStats.visibleToolSprites || [],
      visibleShardSprites: renderStats.visibleShardSprites || [],
      visibleUpgradeSprites: renderStats.visibleUpgradeSprites || [],
      visibleObjectiveSprites: renderStats.visibleObjectiveSprites || [],
      visibleCollectibleCount: renderStats.visibleCollectibleCount || 0,
      collectibleScaleTuningVersion: COLLECTIBLE_SCALE_TUNING_VERSION,
      relicShardScale: RELIC_SHARD_SCALE,
      fieldToolScale: FIELD_TOOL_SCALE,
      upgradeScale: UPGRADE_SCALE,
      objectiveMarkerScale: OBJECTIVE_MARKER_SCALE,
      loreTabletScale: LORE_TABLET_SCALE,
      pickupGlowScale: PICKUP_GLOW_SCALE,
      collectibleVisualMode: renderStats.collectibleVisualMode || (collectibleSpriteAssets.loaded ? 'sprite-atlas-with-fallback' : 'canvas-fallback'),
      playerWeaponSpriteLoaded: Boolean(playerWeaponAssets.loaded),
      playerWeaponSpriteReady: Boolean(playerWeaponAssets.ready),
      playerWeaponSpriteFallbackActive,
      playerWeaponAtlasPath: playerWeaponAssets.atlasPath || PLAYER_WEAPON_ATLAS_JSON,
      playerWeaponAtlasVersion: PLAYER_WEAPON_ATLAS_VERSION,
      missingPlayerWeaponSpriteAssets,
      markerSpritesLoaded: Boolean(markerSpriteAssets.loaded),
      markerSpritesReady: Boolean(markerSpriteAssets.ready),
      markerSpriteFallbackActive,
      markerSpriteAtlasPath: markerSpriteAssets.atlasPath || MARKER_SPRITE_ATLAS_JSON,
      markerSpriteAtlasVersion: MARKER_SPRITE_VERSION,
      missingMarkerSpriteAssets,
      playerWeaponFrame: renderStats.playerWeaponFrame || getPlayerWeaponFrameKey(getPlayerAttackState(current)),
      playerWeaponVisualMode: renderStats.playerWeaponVisualMode || (playerWeaponAssets.loaded ? 'khopesh-sprite-atlas' : 'canvas-fallback'),
      parallaxLayersActive: Boolean(renderStats.parallaxLayersActive),
      activeBackgroundSection: renderStats.activeBackgroundSection || null,
      backgroundDepthMode: renderStats.backgroundDepthMode || 'canvas-fallback',
      visibleLabelCount: renderStats.visibleLabelCount || 0,
      labelSuppressionActive: Boolean(renderStats.labelSuppressionActive),
      platformVisualTuningActive: Boolean(renderStats.platformVisualTuningActive),
      journeyPolishPassActive: Boolean(renderStats.journeyPolishPassActive),
      journeyPolishVersion: renderStats.journeyPolishVersion || JOURNEY_POLISH_VERSION,
      worldContinuityPassActive: Boolean(renderStats.worldContinuityPassActive),
      worldContinuityVersion: renderStats.worldContinuityVersion || WORLD_CONTINUITY_VERSION,
      visibleWorldLandmarks: renderStats.visibleWorldLandmarks || [],
      visibleTransitionStoryMarkers: renderStats.visibleTransitionStoryMarkers || [],
      connectedWorldAmbientDetails: renderStats.connectedWorldAmbientDetails || 0,
      dynamicWorldPassActive: Boolean(renderStats.dynamicWorldPassActive),
      dynamicWorldVersion: renderStats.dynamicWorldVersion || DYNAMIC_WORLD_VERSION,
      dynamicWorldAssetVersion: dynamicWorldAssets.version || DYNAMIC_WORLD_EFFECTS_VERSION,
      dynamicWorldAssetsLoaded: Boolean(dynamicWorldAssets.loaded),
      dynamicWorldAssetMode: dynamicWorldAssets.loaded ? 'painted-raster-effects' : 'canvas-fallback',
      dynamicWorldAssetSrc: dynamicWorldAssets.src,
      visibleDynamicWorldEvents: renderStats.visibleDynamicWorldEvents || [],
      activeDynamicWorldEvent: current.dynamicEnvironmentEvent ? {
        id: current.dynamicEnvironmentEvent.id,
        type: current.dynamicEnvironmentEvent.type,
        name: current.dynamicEnvironmentEvent.name,
        timer: Number((current.dynamicEnvironmentEventTimer || 0).toFixed(2)),
      } : null,
      scarabSealState: {
        id: SCARAB_SEAL_TRIGGER.id,
        name: SCARAB_SEAL_TRIGGER.name,
        activated: Boolean(current.scarabSealActivated),
        bossId: SCARAB_SEAL_TRIGGER.bossId,
        x: Math.round(SCARAB_SEAL_TRIGGER.x),
        y: Math.round(SCARAB_SEAL_TRIGGER.y),
        visualRegionKey: current.scarabSealActivated ? 'guardianSealActivated' : 'guardianSealIdle',
        confrontationSeen: Boolean(current.openingConfrontationSeen),
        bossIntroLine: SCARAB_SEAL_TRIGGER.bossIntroLine,
        guideFollowUpLine: SCARAB_SEAL_TRIGGER.guideFollowUpLine,
        messages: SCARAB_SEAL_TRIGGER.messages,
      },
      openingSphinxEncounterState: current.openingSphinxEncounter ? {
        active: true,
        name: current.openingSphinxEncounter.name,
        message: current.openingSphinxEncounter.message,
        playerX: Math.round(current.openingSphinxEncounter.playerX),
        x: Math.round(current.openingSphinxEncounter.x),
        y: Math.round(current.openingSphinxEncounter.y),
        timer: Number(current.openingSphinxEncounter.timer.toFixed(2)),
        spriteModel: renderStats.openingSphinxSpriteModel || OPENING_SPHINX_SPRITE_BOSS_ID,
        spriteFrame: renderStats.openingSphinxSpriteFrame || null,
        spriteAtlasPath: renderStats.openingSphinxSpriteAtlasPath || ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON,
        spriteLoaded: renderStats.openingSphinxSpriteLoaded
          ?? Boolean(bossSpriteAssets.packs?.[OPENING_SPHINX_SPRITE_BOSS_ID]?.loaded),
      } : null,
      openingThresholdSceneState: current.openingThresholdScene ? {
        id: current.openingThresholdScene.id,
        phase: current.openingThresholdScene.phase,
        lockMovement: Boolean(current.openingThresholdScene.lockMovement),
        activeLine: getOpeningThresholdDialogueLine(current.openingThresholdScene),
        timer: Number(current.openingThresholdScene.timer.toFixed(2)),
        duration: current.openingThresholdScene.duration,
        stairwellRevealActive: current.openingThresholdScene.timer <= OPENING_THRESHOLD_STAIR_REVEAL_SECONDS,
        fallProgress: Number(clamp(
          ((current.openingThresholdScene.duration || 0) - (current.openingThresholdScene.timer || 0) - (current.openingThresholdScene.playerFallDelay ?? OPENING_THRESHOLD_FALL_DELAY_SECONDS))
          / (current.openingThresholdScene.playerFallDuration ?? OPENING_THRESHOLD_FALL_DURATION_SECONDS),
          0,
          1,
        ).toFixed(2)),
        fallSfxPlayed: Boolean(current.openingThresholdScene.fallSfxPlayed),
        stoneShiftSfxPlayed: Boolean(current.openingThresholdScene.stoneShiftSfxPlayed),
        finalPulseSfxPlayed: Boolean(current.openingThresholdScene.finalPulseSfxPlayed),
        fading: current.openingThresholdScene.timer <= OPENING_THRESHOLD_FADE_SECONDS,
        transitionTargetSectionId: current.openingThresholdScene.transitionTargetSectionId,
      } : null,
      templeThresholdTransitionState: current.templeThresholdTransition ? {
        id: current.templeThresholdTransition.id,
        phase: current.templeThresholdTransition.phase,
        switched: Boolean(current.templeThresholdTransition.switched),
        anubisStarted: Boolean(current.templeThresholdTransition.anubisStarted),
        lockMovement: Boolean(current.templeThresholdTransition.lockMovement),
        timer: Number(current.templeThresholdTransition.timer.toFixed(2)),
        duration: current.templeThresholdTransition.duration,
        from: current.templeThresholdTransition.from,
        to: current.templeThresholdTransition.to,
      } : null,
      reactiveEnvironmentPassActive: Boolean(renderStats.reactiveEnvironmentPassActive),
      reactiveEnvironmentVersion: renderStats.reactiveEnvironmentVersion || REACTIVE_ENVIRONMENT_VERSION,
      visibleEnvironmentInteractions: renderStats.visibleEnvironmentInteractions || [],
      brokenEnvironmentInteractions: Array.from(current.brokenEnvironmentIds || []),
      triggeredEnvironmentInteractions: Array.from(current.triggeredEnvironmentIds || []),
      collapsedPlatformIds: Array.from(current.collapsedPlatformIds || []),
      visibleMechanismPlatforms: PLATFORMS
        .filter(platform => platform.requiresObjective && isPlatformAvailable(platform, current))
        .map(platform => platform.id || platform.label),
      activeReactivePlatformTimers: Object.entries(current.reactivePlatformTimers || {}).map(([id, timer]) => ({
        id,
        timer: Number(timer.toFixed(2)),
      })),
      recentEnvironmentInteractions: current.recentEnvironmentInteractions || [],
      ambientLifePassActive: Boolean(renderStats.ambientLifePassActive),
      ambientLifeVersion: renderStats.ambientLifeVersion || null,
      ambientLifeMode: renderStats.ambientLifeMode || null,
      ambientLifeDetailCount: renderStats.ambientLifeDetailCount || 0,
      hazardReadabilityMode: renderStats.hazardReadabilityMode || 'soft-warning-cues',
      openingTrapDecalAssetLoaded: Boolean(openingTrapDecalPackRef.current.loaded),
      openingHazardDecalAssetLoaded: Boolean(openingHazardDecalPackRef.current.loaded),
      openingTrapDecalAssetVersion: OPENING_TRAP_DECAL_ASSET_VERSION,
      enemyVisualMode: renderStats.enemyVisualMode || 'sprite-atlas-with-grounding',
      bossVisualMode: renderStats.bossVisualMode || 'multi-boss-atlas-fallback-safe',
      assetFallbackActive: environmentFallbackActive || enemySpriteFallbackActive || bossSpriteFallbackActive || collectibleSpriteFallbackActive || playerWeaponSpriteFallbackActive || (backgroundPackId === 'china-river-valley' ? !chinaRiverValleyPack?.ready : (desertBackgroundFallbackActive || ruinedTempleBackgroundFallbackActive || catacombsBackgroundFallbackActive || escapeBackgroundFallbackActive || digSiteBackgroundFallbackActive)),
      desertVisualTuningVersion: DESERT_VISUAL_TUNING_VERSION,
      atlasTuningVersion: ATLAS_TUNING_VERSION,
      activeAtlasRegionIssues: missingEnvironmentAssets,
      playerAttackBox,
      combatChallengeMode: COMBAT_CHALLENGE_MODE,
      combatIntensityPassActive: Boolean(renderStats.combatIntensityPassActive),
      combatIntensityVersion: renderStats.combatIntensityVersion || COMBAT_INTENSITY_VERSION,
      combatReadabilityMode: renderStats.combatReadabilityMode || 'windup-vulnerable-pressure-v1',
      visibleCombatPressureEnemies: renderStats.visibleCombatPressureEnemies || [],
      dangerFeedbackActive: Boolean(renderStats.dangerFeedbackActive) || current.resources.stamina <= Math.round((current.upgradeEffects?.maxStamina || 100) * 0.3),
      playerAttackStaminaCost: current.playerAttackStaminaCost || 0,
      lastAttackResult: current.lastAttackResult || 'ready',
      shieldedHitFeedback: current.shieldedHitFeedback || '',
      activeEnemyCounterWindow: activeEnemyCounterWindow ? {
        id: activeEnemyCounterWindow.id,
        name: activeEnemyCounterWindow.name,
        pattern: activeEnemyCounterWindow.attackPattern,
        time: Number(Math.max(activeEnemyCounterWindow.vulnerabilityTimer || 0, activeEnemyCounterWindow.attackRecovery || 0).toFixed(2)),
      } : null,
      activeBossCounterWindow: activeBossCounterWindow ? {
        id: activeBossCounterWindow.id,
        name: activeBossCounterWindow.name,
        pattern: activeBossCounterWindow.attackPattern,
        time: Number(Math.max(activeBossCounterWindow.vulnerabilityTimer || 0, activeBossCounterWindow.attackRecovery || 0).toFixed(2)),
      } : null,
      currentEnemyPattern: nearbyCombatEnemy ? {
        id: nearbyCombatEnemy.id,
        name: nearbyCombatEnemy.name,
        type: nearbyCombatEnemy.type,
        pattern: nearbyCombatEnemy.attackPattern,
        label: nearbyCombatEnemy.attackPhaseLabel || getEnemyPatternConfig(nearbyCombatEnemy).label,
        state: getCombatMode(nearbyCombatEnemy),
      } : null,
      playerInvulnerable: Number(current.player.invulnerable.toFixed(2)),
      invulnerabilityRemainingMs: Math.round(current.player.invulnerable * 1000),
      damageCooldownRemainingMs: Math.round(current.player.damageCooldownTimer * 1000),
      playerFlashActive: current.player.invulnerable > 0,
      playerHitScreenShakeActive: (current.player.impactShakeTimer || 0) > 0,
      lastDamageSource: current.player.lastDamageSource,
      lastDamageTime: current.player.lastDamageTime,
      playerAttackState: getPlayerAttackState(current),
      journeySection: getSectionDisplayName(section.id),
      worldProgressPercent: Math.round((current.player.x / WORLD_WIDTH) * 100),
      resources: current.resources,
      playerStamina: current.resources.stamina,
      maxStamina: current.upgradeEffects?.maxStamina || 100,
      permanentUpgrades: Array.from(current.permanentUpgrades || []),
      permanentUpgradeEffects: current.upgradeEffects || {},
      cameraX: Math.round(current.cameraX),
      targetCameraX: Math.round(current.targetCameraX),
      playerWorldX: Math.round(current.player.x),
      playerScreenX: Math.round(current.player.x - current.cameraX),
      openingCameraRevealState: current.openingCameraRevealTimer > 0 ? {
        active: true,
        mode: current.cameraMode,
        focusTarget: current.cameraFocusTarget,
        secondsRemaining: Number(current.openingCameraRevealTimer.toFixed(2)),
      } : null,
      playerGroundedState: {
        onGround: current.player.onGround,
        expectedGroundY: JOURNEY_WORLD_LAYOUT.groundY,
        playerFootY: Math.round(current.player.y + current.player.height),
      },
      activePlatformChallenge: current.activePlatformChallenge ? {
        id: current.activePlatformChallenge.id,
        failY: Math.round(current.activePlatformChallenge.failY),
      } : null,
      currentSection: getSectionDisplayName(section.id),
      cameraMode: current.cameraMode,
      cameraFocusTarget: current.cameraFocusTarget,
      cameraBounds: {
        min: 0,
        max: WORLD_WIDTH - CANVAS_WIDTH,
      },
      cameraShakeActive: current.cameraShakeTimer > 0,
      activeHazardsNearPlayer: getActiveHazardsNearPlayer(current),
      lastHazardHit: current.lastHazardHit,
      lastStaminaDelta: current.lastStaminaDelta,
      lastStaminaLossReason: current.lastStaminaLossReason,
      staminaFeedbackActive: current.staminaFeedbackTimer > 0,
      staminaWarningState: getStaminaWarningState(current),
      hazardFeedbackCooldown: Number(current.hazardCooldown.toFixed(2)),
      fieldKit: current.fieldKit.map(tool => tool.name),
      remainingTools: JOURNEY_TOOLS.filter(tool => !current.collectedToolIds.has(tool.id)).map(tool => tool.name),
      relicShardCount: current.relicShardCount,
      totalRelicShards: RELIC_SHARDS.length,
      bossKeyItems: (current.bossKeyItems || []).map(item => ({
        id: item.id,
        name: item.name,
        bossId: item.bossId,
        gateId: item.gateId,
        dropped: Boolean(item.dropped),
        collected: current.collectedBossKeyIds?.has(item.id) || Boolean(item.collected),
        x: Math.round(item.x || 0),
      })),
      collectedBossKeyItems: Array.from(current.collectedBossKeyIds || []),
      bossToolPieces: (current.bossKeyItems || []).map(item => ({
        id: item.id,
        name: item.name,
        bossId: item.bossId,
        gateId: item.gateId,
        dropped: Boolean(item.dropped),
        collected: current.collectedBossKeyIds?.has(item.id) || Boolean(item.collected),
        x: Math.round(item.x || 0),
      })),
      collectedBossToolPieces: Array.from(current.collectedBossKeyIds || []),
      bossDomainState: current.bossDomain,
      bossIntroPaused: current.bossIntroPauseTimer > 0,
      postBossReward: current.postBossReward,
      postBossRewardVisible: Boolean(current.postBossReward),
      postBossRewardTimer: Number((current.postBossRewardTimer || 0).toFixed(2)),
      guardianKnowledgeChallenge: current.activeGuardianChallenge ? {
        bossId: current.activeGuardianChallenge.bossId,
        bossName: current.activeGuardianChallenge.bossName,
        title: current.activeGuardianChallenge.title,
        currentIndex: current.activeGuardianChallenge.currentIndex,
        totalQuestions: current.activeGuardianChallenge.questions.length,
        correctCount: current.activeGuardianChallenge.correctCount,
        selectedAnswerIndex: current.activeGuardianChallenge.selectedAnswerIndex,
        feedback: current.activeGuardianChallenge.feedback,
        completed: Boolean(current.activeGuardianChallenge.completed),
        resultMessage: current.activeGuardianChallenge.resultMessage || null,
        modifier: current.activeGuardianChallenge.modifier || null,
        question: current.activeGuardianChallenge.questions[current.activeGuardianChallenge.currentIndex]?.question || null,
        optionOrder: current.activeGuardianChallenge.questions[current.activeGuardianChallenge.currentIndex]?.shuffledOptions?.map(option => option.originalIndex) || null,
      } : null,
      completedGuardianKnowledgeChallenges: Array.from(current.completedGuardianChallengeIds || []),
      guardianKnowledgeResults: current.guardianChallengeResults || {},
      guardianBattleModifiers: current.guardianBattleModifiers || {},
      collectedUpgrades: Array.from(current.collectedUpgrades),
      activeCheckpoint: current.activeCheckpoint?.name,
      checkpointState: current.activeCheckpoint ? { id: current.activeCheckpoint.id, name: current.activeCheckpoint.name } : null,
      currentObjective: objective?.title || null,
      objectiveProgress: objective ? {
        id: section.id,
        title: objective.title,
        found: objective.count,
        required: objective.total,
        complete: objective.count >= objective.total,
        label: `${objective.count}/${objective.total} ${objective.itemLabel}`,
      } : null,
      miniBossState: current.miniBosses.map(boss => ({
        id: boss.id,
        name: boss.name,
        sectionId: boss.sectionId,
        health: boss.health,
        maxHealth: boss.maxHealth,
        awakened: boss.awakened,
        x: Math.round(boss.x),
        knowledgeModifierId: boss.knowledgeModifierId || null,
        playerDamageMultiplier: boss.playerDamageMultiplier || 1,
        bossDamageMultiplier: boss.bossDamageMultiplier || 1,
        visualScale: boss.visualScale || 1,
        ...getEntityCombatState(boss),
      })),
      activeMiniBoss: activeMiniBoss?.name || null,
      activeMiniBossState: activeMiniBoss ? {
        id: activeMiniBoss.id,
        name: activeMiniBoss.name,
        health: activeMiniBoss.health,
        maxHealth: activeMiniBoss.maxHealth,
        x: Math.round(activeMiniBoss.x),
        knowledgeModifierId: activeMiniBoss.knowledgeModifierId || null,
        playerDamageMultiplier: activeMiniBoss.playerDamageMultiplier || 1,
        bossDamageMultiplier: activeMiniBoss.bossDamageMultiplier || 1,
        visualScale: activeMiniBoss.visualScale || 1,
        ...getEntityCombatState(activeMiniBoss),
        ...getBossVulnerabilityState(activeMiniBoss),
      } : null,
      defeatedEnemies: Array.from(current.defeatedEnemies),
      seenEnemyTypeNoticeIds: Array.from(current.seenEnemyTypeNoticeIds || []),
      defeatedMiniBosses: Array.from(current.defeatedMiniBosses),
      hiddenRoomsFound: Array.from(current.hiddenRoomsFound),
      discoveredHiddenRoutes: Array.from(current.discoveredHiddenRouteIds || []),
      hiddenRoutesAvailable: activeHiddenRoutes.map(route => ({
        id: route.id,
        name: route.name,
        sectionId: route.sectionId,
        optional: route.optional,
        discovered: current.discoveredHiddenRouteIds?.has(route.id) || false,
        gateType: route.gateType || null,
        requiredUpgradeId: route.requiredUpgradeId || null,
        lockedMessage: route.lockedMessage || null,
        rewardSummary: route.rewardSummary || null,
        teaseVisible: route.teaseVisible !== false,
        unlocked: getRouteAccessState(route, current).unlocked,
        futureUpgradeHook: route.futureUpgradeHook || null,
      })),
      secretCollectibles: activeSecretCollectibles.map(item => ({
        id: item.id,
        name: item.name,
        setId: item.setId,
        routeId: item.routeId,
        routeUnlocked: item.routeId ? isRouteRewardAccessible(item.routeId, current) : true,
        collected: current.collectedSecretIds?.has(item.id) || false,
      })),
      collectedSecretCollectibles: Array.from(current.collectedSecretIds || []),
      secretCollectibleCount: current.collectedSecretIds?.size || 0,
      completedCollectionSets: Array.from(current.completedCollectionSetIds || []),
      loreTablets: LORE_TABLETS.map(tablet => ({
        id: tablet.id,
        collected: current.collectedTabletIds.has(tablet.id),
      })),
      loreTabletCount: current.collectedTabletIds.size,
      playerCombatState: {
        attacking: current.attackTimer > 0,
        attackCooldown: Number(current.attackCooldown.toFixed(2)),
        attackTimer: Number(current.attackTimer.toFixed(2)),
        attackWindup: Number(current.attackWindupTimer.toFixed(2)),
        attackRecoil: Number(current.attackRecoilTimer.toFixed(2)),
        attackState: getPlayerAttackState(current),
        hitStop: Number(current.hitStopTimer.toFixed(2)),
        facing: current.player.direction >= 0 ? 'right' : 'left',
        animationState: current.player.animationState || 'idle',
        animationFrame: current.player.animationFrame ?? 1,
        visualWalkStyle: current.player.visualWalkStyle || 'none',
        invulnerable: Number(current.player.invulnerable.toFixed(2)),
        invulnerabilityRemainingMs: Math.round(current.player.invulnerable * 1000),
        damageCooldownRemainingMs: Math.round(current.player.damageCooldownTimer * 1000),
        flashActive: current.player.invulnerable > 0,
        lastDamage: current.player.lastDamage || 0,
        lastDamageSource: current.player.lastDamageSource,
        lastDamageTime: current.player.lastDamageTime,
        lastAttackResult: current.lastAttackResult || 'ready',
        attackStaminaCost: current.playerAttackStaminaCost || 0,
      },
      combatHitEffects: current.combatHitEffects.map(effect => ({
        type: effect.type,
        x: Math.round(effect.x),
        y: Math.round(effect.y),
        timer: Number(effect.timer.toFixed(2)),
        text: effect.text || null,
      })),
      rewardFeedbackEffects: current.combatHitEffects
        .filter(effect => ['reward-pulse', 'shard-pickup', 'secret-found', 'checkpoint-pulse', 'collection-complete', 'boss-reward-pulse', 'upgrade-pulse'].includes(effect.type))
        .map(effect => ({
          type: effect.type,
          text: effect.text || null,
          timer: Number(effect.timer.toFixed(2)),
        })),
      knockbackState: {
        playerKnockback: current.player.knockbackTimer > 0,
        playerDirection: current.player.knockbackDirection,
        playerTimer: Number((current.player.knockbackTimer || 0).toFixed(2)),
        enemies: current.enemies
          .filter(enemy => enemy.knockbackTimer > 0)
          .map(enemy => ({ id: enemy.id, direction: enemy.knockbackDirection, timer: Number(enemy.knockbackTimer.toFixed(2)) })),
        bosses: current.miniBosses
          .filter(boss => boss.knockbackTimer > 0)
          .map(boss => ({ id: boss.id, direction: boss.knockbackDirection, timer: Number(boss.knockbackTimer.toFixed(2)) })),
      },
      movementFeelState: {
        coyoteTimeSeconds: COYOTE_TIME,
        jumpBufferSeconds: JUMP_BUFFER_TIME,
        jumpCutMultiplier: JUMP_CUT_MULTIPLIER,
        openingPyramidAssistJumpAvailable: Boolean(current.openingPyramidAssistJumpAvailable),
        openingPyramidAirJumpMultiplier: OPENING_PYRAMID_AIR_JUMP_MULTIPLIER,
        jumpCutFeedback: Number((current.player.jumpCutFeedbackTimer || 0).toFixed(2)),
        landingFeedback: Number((current.player.landingFeedbackTimer || 0).toFixed(2)),
        movementDustTimer: Number((current.player.movementDustTimer || 0).toFixed(2)),
        activeJuiceEffects: current.combatHitEffects
          .filter(effect => ['movement-dust', 'landing-dust', 'jump-dust', 'attack-burst', 'knockback-dust'].includes(effect.type))
          .map(effect => effect.type),
      },
      enemyStates: current.enemies
        .filter(enemy => Math.abs(enemy.x - current.player.x) < 700 || current.defeatedEnemies.has(enemy.id))
        .map(enemy => ({
          id: enemy.id,
          name: enemy.name,
          type: enemy.type,
          health: enemy.health,
          maxHealth: enemy.maxHealth,
          x: Math.round(enemy.x),
          encounterRole: enemy.encounterRole || null,
          protectsRouteId: enemy.protectsRouteId || null,
          pressureHint: enemy.pressureHint || null,
          ...getEntityCombatState(enemy),
        })),
      enemyCombatStates: current.enemies
        .filter(enemy => Math.abs(enemy.x - current.player.x) < 700 || current.defeatedEnemies.has(enemy.id))
        .map(enemy => ({
          id: enemy.id,
          name: enemy.name,
          type: enemy.type,
          pattern: enemy.attackPattern,
          label: enemy.attackPhaseLabel || getEnemyPatternConfig(enemy).label,
          state: getCombatMode(enemy),
          encounterRole: enemy.encounterRole || null,
          protectsRouteId: enemy.protectsRouteId || null,
          windup: Number((enemy.attackWindup || 0).toFixed(2)),
          attack: Number((enemy.attackTimer || 0).toFixed(2)),
          recovery: Number((enemy.attackRecovery || 0).toFixed(2)),
          counterWindow: Number((enemy.vulnerabilityTimer || 0).toFixed(2)),
          shielded: Boolean(enemy.shieldTimer > 0),
        })),
      miniBossStates: current.miniBosses.map(boss => ({
        id: boss.id,
        name: boss.name,
        sectionId: boss.sectionId,
        health: boss.health,
        maxHealth: boss.maxHealth,
        awakened: boss.awakened,
        x: Math.round(boss.x),
        knowledgeModifierId: boss.knowledgeModifierId || null,
        playerDamageMultiplier: boss.playerDamageMultiplier || 1,
        bossDamageMultiplier: boss.bossDamageMultiplier || 1,
        visualScale: boss.visualScale || 1,
        ...getEntityCombatState(boss),
      })),
      routeGateStatus: ROUTE_GATES.find(gate => !current.openedRouteGateIds.has(gate.id)) ? (() => {
        const gate = ROUTE_GATES.find(item => !current.openedRouteGateIds.has(item.id));
        const guidance = getGateGuidance(gate, current);
        const requirements = guidance.gateRequirements;
        return {
          id: gate.id,
          name: guidance.activeGateName,
          distance: Math.round(gate.x - current.player.x),
          gateGroundedState: {
            expectedGroundY: JOURNEY_WORLD_LAYOUT.groundY,
            visualFootY: JOURNEY_WORLD_LAYOUT.groundY,
            authoredY: Math.round(gate.y),
          },
          requirements,
          complete: requirements.every(req => req.met),
          summary: `${requirements.filter(req => req.met).length}/${requirements.length} ready`,
          activeGateName: guidance.activeGateName,
          activeGateLocked: guidance.activeGateLocked,
          gateRequirements: guidance.gateRequirements,
          gateMissingRequirements: guidance.gateMissingRequirements,
          gateHint: guidance.gateHint,
          nearestMissingObjective: guidance.nearestMissingObjective,
          missingObjectiveDirection: guidance.missingObjectiveDirection,
          gateChecklistText: guidance.gateChecklistText,
        };
      })() : null,
      cinematicEventState: current.cinematicEvent,
      cinematicState: current.cinematicEvent,
      bossIntroState: current.bossIntro,
      environmentEventState: current.environmentEvent,
      dynamicEnvironmentEventState: current.dynamicEnvironmentEvent,
      discoveryEntranceState: {
        id: DISCOVERY_ENTRANCE.id,
        title: DISCOVERY_ENTRANCE.name,
        siteType: DISCOVERY_ENTRANCE.title,
        message: DISCOVERY_ENTRANCE.message,
        handoffMessage: DISCOVERY_ENTRANCE.handoffMessage,
        active: Boolean(current.discoveryEntranceActive),
        reached: Boolean(current.discoveryEntranceActive || current.discoveryEntranceHandoffStarted || current.completed),
        timer: Number((current.discoveryEntranceTimer || 0).toFixed(2)),
      },
      discoveryEntranceFound: Boolean(current.discoveryEntranceActive || current.discoveryEntranceHandoffStarted || current.completed),
      sectionTransitionState: current.sectionTransition,
      activeParticles: SECTION_ATMOSPHERES[section.id]?.particle || null,
      activeAtmosphere: {
        sectionId: section.id,
        sectionName: getSectionDisplayName(section.id),
        particle: SECTION_ATMOSPHERES[section.id]?.particle || null,
        mood: SECTION_ATMOSPHERES[section.id]?.mood || null,
        title: getSectionDisplayTitle(section.id) || null,
      },
      hazards: HAZARDS.filter(hazard => isHazardAvailable(hazard, current)).map(hazard => hazard.name),
      endGateReached: current.completed || current.discoveryEntranceActive,
      briefingOpen,
      failed: current.failed,
      failureReason: current.failureReason,
      failureDetail: current.failureDetail,
      notice: current.notice,
    };
  }, [backgroundPackId, briefingOpen, getActiveHazardsNearPlayer, getActiveHiddenRoutes, getActiveSecretCollectibles, getBossVulnerabilityState, getCombatMode, getEnemyPatternConfig, getEntityCombatState, getGateGuidance, getObjectiveProgress, getPlayerAttackState, getRouteAccessState, getSectionDisplayName, getSectionDisplayTitle, getStaminaWarningState, isRouteRewardAccessible, playerHeroSpriteConfig, targetCivilisation]);

  // --- Rendering Helpers ---
  const drawFieldNoteLabel = useCallback((ctx, x, y, text, color) => {
    const current = stateRef.current;
    if (current.renderStats) current.renderStats.visibleLabelCount += 1;
    ctx.save();
    ctx.font = '800 8px Outfit, sans-serif';
    const metrics = ctx.measureText(text.toUpperCase());
    const padding = 4;
    
    ctx.fillStyle = 'rgba(255, 252, 235, 0.78)';
    ctx.fillRect(x - metrics.width / 2 - padding, y - 8, metrics.width + padding * 2, 12);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - metrics.width / 2 - padding, y - 8, metrics.width + padding * 2, 12);
    
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text.toUpperCase(), x, y);
    ctx.restore();
  }, []);

  const drawOpeningSphinxDialogue = useCallback((ctx, encounter, screenX, screenY, alpha) => {
    const boxWidth = 360;
    const lines = encounter.lines || [
      'These artefacts are protected.',
      'You will never reach the expedition site.',
      'Only those who prove themselves may pass.',
    ];
    const elapsed = encounter.duration - encounter.timer;
    const lineStart = Math.max(0, elapsed - OPENING_SPHINX_ARRIVAL_SECONDS);
    const visibleLineCount = clamp(
      Math.floor(lineStart / OPENING_SPHINX_LINE_SECONDS) + 1,
      1,
      lines.length,
    );
    const visibleLines = lines.slice(Math.max(0, visibleLineCount - 1), visibleLineCount);
    const boxHeight = 54 + visibleLines.length * 20;
    const placeLeftOfSphinx = screenX > CANVAS_WIDTH * 0.55;
    const usesPinnedDialogue = Number.isFinite(encounter.dialogueX);
    const boxX = usesPinnedDialogue
      ? clamp(encounter.dialogueX, 26, CANVAS_WIDTH - boxWidth - 26)
      : placeLeftOfSphinx
        ? clamp(screenX - boxWidth - 56, 26, CANVAS_WIDTH - boxWidth - 26)
        : clamp(screenX + 56, 26, CANVAS_WIDTH - boxWidth - 26);
    const boxY = Number.isFinite(encounter.dialogueY)
      ? clamp(encounter.dialogueY, 130, CANVAS_HEIGHT - boxHeight - 28)
      : clamp(screenY + 58, 152, CANVAS_HEIGHT - boxHeight - 28);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.38)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    const bubbleGradient = ctx.createLinearGradient(boxX, boxY, boxX + boxWidth, boxY + boxHeight);
    bubbleGradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
    bubbleGradient.addColorStop(1, 'rgba(69, 45, 21, 0.9)');
    ctx.fillStyle = bubbleGradient;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 12);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.font = '900 15px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(encounter.name || SCARAB_SEAL_TRIGGER.eventName, boxX + 18, boxY + 25);
    ctx.fillStyle = '#fff4d4';
    ctx.font = '800 12px Outfit, sans-serif';
    visibleLines.forEach((line, index) => {
      ctx.fillText(line, boxX + 18, boxY + 50 + index * 18);
    });
    if (!usesPinnedDialogue) {
      ctx.beginPath();
      if (placeLeftOfSphinx) {
        ctx.moveTo(boxX + boxWidth - 74, boxY + 12);
        ctx.lineTo(screenX - 36, screenY + 34);
        ctx.lineTo(boxX + boxWidth - 30, boxY + 12);
      } else {
        ctx.moveTo(boxX + 30, boxY + 12);
        ctx.lineTo(screenX + 36, screenY + 34);
        ctx.lineTo(boxX + 74, boxY + 12);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(42, 31, 24, 0.9)';
      ctx.fill();
    }
    ctx.restore();
  }, []);

  const drawContactShadow = useCallback((ctx, x, y, width, intensity = 0.28, blur = 0) => {
    ctx.save();
    ctx.globalAlpha = intensity;
    ctx.fillStyle = '#1f1308';
    if (blur > 0) ctx.filter = `blur(${blur}px)`;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(16, width / 2), Math.max(4, width / 16), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

  const getOpeningSphinxSpriteFrame = useCallback((encounter, now) => {
    if (!encounter) return 'ancientConstructIdle';
    const elapsed = encounter.duration - encounter.timer;
    const reveal = clamp(elapsed / OPENING_SPHINX_ARRIVAL_SECONDS, 0, 1);
    const exitProgress = clamp((OPENING_SPHINX_EXIT_SECONDS - encounter.timer) / OPENING_SPHINX_EXIT_SECONDS, 0, 1);
    if (exitProgress > 0.08) {
      return Math.floor(now / 180) % 2 === 0 ? 'ancientConstructWalk1' : 'ancientConstructWalk2';
    }
    if (reveal < 0.8) return 'ancientConstructIntro';
    const lineIndex = Math.floor(elapsed / OPENING_SPHINX_LINE_SECONDS);
    if (lineIndex === 1 || lineIndex === 2) return 'ancientConstructPulse';
    return 'ancientConstructIdle';
  }, []);

  const drawOpeningSphinxEncounter = useCallback((ctx, encounter, cameraX, now) => {
    if (!encounter || encounter.timer <= 0) return;
    const elapsed = encounter.duration - encounter.timer;
    const reveal = clamp(elapsed / OPENING_SPHINX_ARRIVAL_SECONDS, 0, 1);
    const exitProgress = clamp((OPENING_SPHINX_EXIT_SECONDS - encounter.timer) / OPENING_SPHINX_EXIT_SECONDS, 0, 1);
    const alpha = clamp(reveal * (1 - exitProgress * 0.72), 0, 1);
    if (alpha <= 0.02) return;

    const baseScreenX = worldToScreenX(encounter.x, cameraX);
    const easedReveal = 1 - Math.pow(1 - reveal, 3);
    const arrivalLift = (1 - easedReveal) * 46;
    const sx = baseScreenX + exitProgress * 220;
    const sy = encounter.y + OPENING_SPHINX_SCREEN_Y_OFFSET + arrivalLift + Math.sin(now / 260) * 4 - exitProgress * 190;
    if (sx < -220 || sx > CANVAS_WIDTH + 220) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    drawContactShadow(ctx, sx, sy + 124, 158, 0.22 * (1 - exitProgress), 1.2);
    if (reveal < 1 && exitProgress <= 0) {
      ctx.save();
      ctx.globalAlpha = alpha * (1 - reveal) * 0.75;
      ctx.fillStyle = 'rgba(210, 160, 92, 0.34)';
      ctx.beginPath();
      ctx.ellipse(sx, sy + 124, 110 + reveal * 32, 16 + reveal * 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const apparitionAsset = openingSphinxApparitionRef.current;
    const spritePack = getBossSpritePack(bossSpriteAssetsRef.current, OPENING_SPHINX_SPRITE_BOSS_ID);
    const frameKey = getOpeningSphinxSpriteFrame(encounter, now);
    const apparitionHeight = 318;
    const apparitionWidth = apparitionAsset.loaded && apparitionAsset.image
      ? apparitionHeight * (apparitionAsset.image.naturalWidth / apparitionAsset.image.naturalHeight)
      : 246;
    let drawBox = {
      x: sx - apparitionWidth / 2,
      y: sy + 126 - apparitionHeight,
      width: apparitionWidth,
      height: apparitionHeight,
    };
    let sphinxSpriteDrawn = false;

    if (apparitionAsset.loaded && apparitionAsset.image) {
      const projectionReveal = encounter.silhouetteReveal
        ? clamp((elapsed - 2.4) / 4.2, 0, 1)
        : 1;
      const apparitionAlpha = encounter.silhouetteReveal
        ? 0.3 + projectionReveal * 0.58
        : 1;
      const projectionClipHeight = encounter.silhouetteReveal
        ? drawBox.height * (0.62 + projectionReveal * 0.38)
        : drawBox.height;
      ctx.save();
      ctx.globalAlpha *= apparitionAlpha;
      ctx.shadowColor = 'rgba(70, 214, 235, 0.2)';
      ctx.shadowBlur = 12 + reveal * 8;
      if (projectionClipHeight < drawBox.height) {
        ctx.beginPath();
        ctx.rect(drawBox.x, drawBox.y, drawBox.width, projectionClipHeight);
        ctx.clip();
      }
      ctx.drawImage(apparitionAsset.image, drawBox.x, drawBox.y, drawBox.width, drawBox.height);
      ctx.restore();
      if (encounter.silhouetteReveal && projectionReveal < 0.35) {
        ctx.save();
        ctx.globalAlpha = alpha * (0.55 - projectionReveal * 0.35);
        ctx.shadowColor = 'rgba(125, 211, 252, 0.75)';
        ctx.shadowBlur = 16;
        ctx.fillStyle = 'rgba(147, 197, 253, 0.72)';
        ctx.beginPath();
        ctx.ellipse(sx - 15, drawBox.y + 74, 5.5, 3.2, 0, 0, Math.PI * 2);
        ctx.ellipse(sx + 18, drawBox.y + 74, 5.5, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      sphinxSpriteDrawn = true;
      if (stateRef.current.renderStats) {
        stateRef.current.renderStats.openingSphinxSpriteLoaded = true;
        stateRef.current.renderStats.openingSphinxSpriteVersion = OPENING_SPHINX_SPRITE_VERSION;
        stateRef.current.renderStats.openingSphinxSpriteModel = 'opening-anubis-apparition';
        stateRef.current.renderStats.openingSphinxSpriteFrame = 'openingAnubisApparition';
        stateRef.current.renderStats.openingSphinxSpriteAtlasPath = OPENING_SPHINX_APPARITION_SRC;
      }
    } else if (spritePack) {
      const spriteHeight = 226;
      const spriteWidth = 278;
      drawBox = {
        x: sx - spriteWidth / 2,
        y: sy + 126 - spriteHeight,
        width: spriteWidth,
        height: spriteHeight,
      };
      const shouldFlip = shouldFlipBossSprite(OPENING_SPHINX_SPRITE_BOSS_ID, -1);
      ctx.save();
      if (shouldFlip) {
        ctx.translate(drawBox.x + drawBox.width / 2, 0);
        ctx.scale(-1, 1);
      }
      sphinxSpriteDrawn = drawAtlasRegion(
        ctx,
        spritePack,
        frameKey,
        {
          x: shouldFlip ? -drawBox.width / 2 : drawBox.x,
          y: drawBox.y,
          width: drawBox.width,
          height: drawBox.height,
        },
        { mode: 'contain', alignY: 'bottom' },
      );
      ctx.restore();
    }

    if (sphinxSpriteDrawn && !apparitionAsset.loaded && stateRef.current.renderStats) {
      stateRef.current.renderStats.openingSphinxSpriteLoaded = true;
      stateRef.current.renderStats.openingSphinxSpriteVersion = OPENING_SPHINX_SPRITE_VERSION;
      stateRef.current.renderStats.openingSphinxSpriteModel = OPENING_SPHINX_SPRITE_BOSS_ID;
      stateRef.current.renderStats.openingSphinxSpriteFrame = frameKey;
      stateRef.current.renderStats.openingSphinxSpriteAtlasPath = ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON;
    }

    if (!sphinxSpriteDrawn) {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(1.08, 1.08);
      ctx.strokeStyle = 'rgba(44, 27, 12, 0.78)';
      ctx.lineWidth = 3;
      ctx.fillStyle = '#b7792e';
      ctx.beginPath();
      ctx.ellipse(-10, 52, 82, 36, -0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#d6a354';
      ctx.beginPath();
      ctx.ellipse(48, 30, 34, 26, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f2c86b';
      ctx.beginPath();
      ctx.roundRect(24, -4, 42, 34, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#654321';
      [-48, -12, 24, 58].forEach((legX) => {
        ctx.beginPath();
        ctx.roundRect(legX, 72, 12, 42, 5);
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    }
    ctx.restore();

    if (!encounter.suppressDialogue) {
      drawOpeningSphinxDialogue(ctx, encounter, sx, sy, alpha);
    }
  }, [drawContactShadow, drawOpeningSphinxDialogue, getOpeningSphinxSpriteFrame]);

  const drawOpeningThresholdScene = useCallback((ctx, scene, cameraX, now) => {
    if (!scene || scene.timer <= 0) return;
    const elapsed = clamp(scene.duration - scene.timer, 0, scene.duration);
    const sealX = worldToScreenX(SCARAB_SEAL_TRIGGER.x, cameraX);
    const reveal = clamp((OPENING_THRESHOLD_STAIR_REVEAL_SECONDS - scene.timer) / OPENING_THRESHOLD_STAIR_REVEAL_SECONDS, 0, 1);
    const fade = clamp((OPENING_THRESHOLD_FADE_SECONDS - scene.timer) / OPENING_THRESHOLD_FADE_SECONDS, 0, 1);
    const activeLine = getOpeningThresholdDialogueLine(scene);

    ctx.save();
    const vignette = ctx.createRadialGradient(sealX, CANVAS_HEIGHT * 0.62, 80, sealX, CANVAS_HEIGHT * 0.62, CANVAS_WIDTH * 0.82);
    vignette.addColorStop(0, `rgba(15, 23, 42, ${0.05 + reveal * 0.08})`);
    vignette.addColorStop(0.52, 'rgba(15, 23, 42, 0.08)');
    vignette.addColorStop(1, `rgba(3, 7, 18, ${0.28 + reveal * 0.18 + fade * 0.36})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const projectionBuild = clamp((elapsed - 1.15) / 8.5, 0, 1) * (1 - fade * 0.45);
    if (projectionBuild > 0) {
      const drift = Math.sin(now / 620) * 10;
      const projectionTopY = 112;
      const projectionBaseY = GROUND_Y - 42;
      const beam = ctx.createLinearGradient(sealX, projectionTopY, sealX, projectionBaseY);
      beam.addColorStop(0, `rgba(125, 211, 252, ${0.02 * projectionBuild})`);
      beam.addColorStop(0.42, `rgba(56, 189, 248, ${0.1 * projectionBuild})`);
      beam.addColorStop(1, `rgba(250, 204, 21, ${0.06 * projectionBuild})`);
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(sealX - 20 - projectionBuild * 48 + drift * 0.2, projectionBaseY);
      ctx.quadraticCurveTo(sealX - 78 + drift, 320, sealX - 34, projectionTopY);
      ctx.lineTo(sealX + 54, projectionTopY + 22);
      ctx.quadraticCurveTo(sealX + 76 - drift, 328, sealX + 28 + projectionBuild * 50 + drift * 0.18, projectionBaseY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(125, 211, 252, ${0.18 * projectionBuild})`;
      ctx.lineWidth = 1.2;
      [0, 1, 2].forEach((line) => {
        const lineOffset = (line - 1) * 38 + Math.sin(now / 520 + line) * 5;
        ctx.beginPath();
        ctx.moveTo(sealX + lineOffset * 0.34, projectionBaseY - 8);
        ctx.quadraticCurveTo(sealX + lineOffset, 330, sealX + lineOffset * 0.4, projectionTopY + 24);
        ctx.stroke();
      });
      ctx.restore();
    }

    const eyeGlint = clamp((elapsed - 0.45) / 0.8, 0, 1) * (1 - clamp((elapsed - 5.6) / 1.4, 0, 1));
    if (eyeGlint > 0) {
      const glintPulse = 0.72 + Math.sin(now / 180) * 0.18;
      const eyeX = sealX + 338;
      const eyeY = 188;
      ctx.save();
      ctx.globalAlpha = eyeGlint * glintPulse;
      ctx.shadowColor = 'rgba(125, 211, 252, 0.78)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(147, 197, 253, 0.76)';
      ctx.beginPath();
      ctx.ellipse(eyeX - 15, eyeY, 4.8, 2.4, -0.08, 0, Math.PI * 2);
      ctx.ellipse(eyeX + 15, eyeY, 4.8, 2.4, 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const cueTimes = [6.2, 10.8, 14.8, 18.6, 22.8, 26.5, 31.5];
    cueTimes.forEach((cueTime, index) => {
      const cue = 1 - clamp(Math.abs(elapsed - cueTime) / 1.35, 0, 1);
      if (cue <= 0) return;
      const side = index % 2 === 0 ? -1 : 1;
      const cueX = sealX + side * (92 + index * 9);
      const cueY = GROUND_Y - 244 + (index % 3) * 36;
      ctx.save();
      ctx.globalAlpha = cue * 0.52;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.58)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cueX - 16, cueY);
      ctx.lineTo(cueX + 18, cueY + Math.sin(now / 180 + index) * 4);
      ctx.stroke();
      ctx.fillStyle = 'rgba(125, 211, 252, 0.45)';
      for (let mote = 0; mote < 4; mote += 1) {
        const fall = ((now / 38 + mote * 17 + index * 23) % 48) * cue;
        ctx.beginPath();
        ctx.arc(cueX + mote * 9 - 12, cueY + fall, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    const fissureCues = [11.9, 18.6, 26.5, 29.8];
    fissureCues.forEach((cueTime, index) => {
      const cue = 1 - clamp(Math.abs(elapsed - cueTime) / 1.1, 0, 1);
      if (cue <= 0) return;
      const width = 86 + index * 38;
      const y = GROUND_Y - 20 + Math.sin(now / 190 + index) * 2;
      ctx.save();
      ctx.globalAlpha = cue * 0.62;
      ctx.strokeStyle = index === fissureCues.length - 1 ? 'rgba(125, 211, 252, 0.72)' : 'rgba(250, 204, 21, 0.48)';
      ctx.lineWidth = 1.6 + cue * 1.4;
      ctx.shadowColor = index === fissureCues.length - 1 ? 'rgba(56, 189, 248, 0.42)' : 'rgba(245, 158, 11, 0.28)';
      ctx.shadowBlur = 8 + cue * 12;
      ctx.beginPath();
      ctx.moveTo(sealX - width, y);
      for (let step = 0; step <= 6; step += 1) {
        const x = sealX - width + (width * 2 * step) / 6;
        const jag = Math.sin(now / 130 + step * 1.7 + index) * 4 + (step % 2 === 0 ? -4 : 4) * cue;
        ctx.lineTo(x, y + jag);
      }
      ctx.stroke();
      ctx.restore();
    });

    if (elapsed > 2.4) {
      const rumble = Math.sin(now / 84) * 2.5;
      const revealEase = reveal * reveal * (3 - 2 * reveal);
      const stairX = sealX - 10;
      const mouthY = GROUND_Y - 22;
      const shaftTopY = GROUND_Y - 126 - revealEase * 18;
      const halfMouthWidth = 94 + revealEase * 50;
      const tombStairwellAsset = openingTombStairwellRef.current;
      const stairGlow = ctx.createRadialGradient(stairX, GROUND_Y - 58 + rumble, 8, stairX, GROUND_Y - 58 + rumble, 226);
      stairGlow.addColorStop(0, 'rgba(125, 211, 252, 0.72)');
      stairGlow.addColorStop(0.45, 'rgba(14, 165, 233, 0.22)');
      stairGlow.addColorStop(1, 'rgba(14, 116, 144, 0)');
      ctx.globalAlpha = 0.18 + revealEase * 0.34;
      ctx.fillStyle = stairGlow;
      ctx.fillRect(stairX - 252, GROUND_Y - 270, 504, 306);

      const tombAssetDrawn = Boolean(tombStairwellAsset.loaded && tombStairwellAsset.image);
      if (tombAssetDrawn) {
        const assetWidth = 332 + revealEase * 92;
        const assetHeight = assetWidth * (tombStairwellAsset.image.height / tombStairwellAsset.image.width);
        const assetX = stairX - assetWidth / 2;
        const assetY = mouthY + 44 - assetHeight;
        ctx.save();
        ctx.globalAlpha = 0.68 + revealEase * 0.32;
        ctx.filter = 'sepia(5%) saturate(98%) brightness(94%) contrast(104%) drop-shadow(0 14px 18px rgba(4, 12, 20, 0.34))';
        ctx.drawImage(tombStairwellAsset.image, assetX, assetY, assetWidth, assetHeight);
        ctx.restore();
        if (stateRef.current.renderStats) {
          stateRef.current.renderStats.openingTombStairwellAssetVersion = OPENING_TOMB_STAIRWELL_VERSION;
          stateRef.current.renderStats.openingTombStairwellAssetLoaded = true;
        }
      } else {
        ctx.globalAlpha = 0.2 + revealEase * 0.46;
        const shaftGradient = ctx.createLinearGradient(stairX, shaftTopY, stairX, mouthY + 18);
        shaftGradient.addColorStop(0, 'rgba(14, 116, 144, 0.5)');
        shaftGradient.addColorStop(0.46, 'rgba(8, 47, 73, 0.72)');
        shaftGradient.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
        ctx.fillStyle = shaftGradient;
        ctx.beginPath();
        ctx.moveTo(stairX - 50 - revealEase * 36, shaftTopY);
        ctx.lineTo(stairX + 50 + revealEase * 36, shaftTopY);
        ctx.lineTo(stairX + halfMouthWidth, mouthY + 9);
        ctx.lineTo(stairX - halfMouthWidth, mouthY + 9);
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 0.46 + revealEase * 0.32;
        ctx.fillStyle = 'rgba(5, 18, 28, 0.72)';
        ctx.beginPath();
        ctx.ellipse(stairX, mouthY, halfMouthWidth, 23 + revealEase * 9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.52 + revealEase * 0.26;
        ctx.strokeStyle = 'rgba(211, 170, 98, 0.62)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(stairX, mouthY - 2, halfMouthWidth + 12, 28 + revealEase * 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.24 + revealEase * 0.28;
        ctx.strokeStyle = 'rgba(255, 236, 179, 0.54)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(stairX, mouthY - 6, halfMouthWidth + 22, 34 + revealEase * 8, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 0.32 + revealEase * 0.42;
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.72)';
        ctx.lineWidth = 2.4;
        for (let index = 0; index < 7; index += 1) {
          const stepDepth = index / 6;
          const y = mouthY - 18 - index * (14 + revealEase * 2.5);
          const stepHalfWidth = 52 + stepDepth * 68 + revealEase * 14;
          ctx.beginPath();
          ctx.moveTo(stairX - stepHalfWidth, y + Math.sin(now / 180 + index) * 0.8);
          ctx.lineTo(stairX + stepHalfWidth, y + Math.sin(now / 180 + index) * 0.8);
          ctx.stroke();
          ctx.globalAlpha *= 0.94;
        }

        [-1, 1].forEach((side) => {
          const torchX = stairX + side * (82 + revealEase * 18);
          const flameY = mouthY - 64 + Math.sin(now / 170 + side) * 2;
          ctx.globalAlpha = (0.16 + revealEase * 0.34) * (0.82 + Math.sin(now / 120 + side) * 0.12);
          ctx.fillStyle = 'rgba(96, 165, 250, 0.78)';
          ctx.beginPath();
          ctx.ellipse(torchX, flameY, 7 + revealEase * 3, 24, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(250, 204, 21, 0.42)';
          ctx.beginPath();
          ctx.ellipse(torchX, flameY + 4, 3.5, 12, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (scene.playerX != null && scene.playerY != null) {
        const playerScreenX = worldToScreenX(scene.playerX + 18, cameraX);
        const playerScreenY = scene.playerFallEndY ?? scene.playerY;
        const clarityGradient = ctx.createRadialGradient(
          playerScreenX,
          playerScreenY + 42,
          16,
          playerScreenX,
          playerScreenY + 42,
          78,
        );
        clarityGradient.addColorStop(0, 'rgba(252, 211, 77, 0.16)');
        clarityGradient.addColorStop(0.55, 'rgba(252, 211, 77, 0.06)');
        clarityGradient.addColorStop(1, 'rgba(252, 211, 77, 0)');
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = clarityGradient;
        ctx.fillRect(playerScreenX - 86, playerScreenY - 18, 172, 138);
      }
      ctx.globalAlpha = 1;
    }

    if (activeLine) {
      const guardianSpeaker = activeLine.speaker === 'Anubis' || activeLine.speaker === 'Sphinx';
      const boxWidth = guardianSpeaker ? 430 : 390;
      const textMaxWidth = boxWidth - 36;
      ctx.font = '900 18px Georgia, serif';
      const words = activeLine.text.split(' ');
      const wrappedLines = words.reduce((lines, word) => {
        const currentLine = lines[lines.length - 1] || '';
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        return ctx.measureText(candidate).width <= textMaxWidth
          ? [...lines.slice(0, -1), candidate]
          : [...lines, word];
      }, ['']).filter(Boolean);
      const dialogueBoxHeight = 54 + Math.max(1, wrappedLines.length) * 24;
      const boxX = guardianSpeaker ? 42 : 54;
      const boxY = 112;
      ctx.globalAlpha = clamp((elapsed - activeLine.at) * 1.8, 0, 1);
      ctx.fillStyle = guardianSpeaker
        ? 'rgba(15, 23, 42, 0.84)'
        : 'rgba(255, 248, 225, 0.86)';
      ctx.strokeStyle = guardianSpeaker
        ? 'rgba(125, 211, 252, 0.62)'
        : 'rgba(146, 64, 14, 0.38)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, dialogueBoxHeight, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = guardianSpeaker ? '#93c5fd' : '#92400e';
      ctx.font = '900 12px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(activeLine.speaker.toUpperCase(), boxX + 18, boxY + 24);
      ctx.fillStyle = guardianSpeaker ? '#fff7ed' : '#3f2a18';
      ctx.font = '900 18px Georgia, serif';
      wrappedLines.forEach((line, index) => {
        ctx.fillText(line, boxX + 18, boxY + 52 + index * 23);
      });
      ctx.globalAlpha = 1;
    }

    if (fade > 0) {
      ctx.globalAlpha = fade;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }, []);

  const drawTempleThresholdTransition = useCallback((ctx, scene, now) => {
    if (!scene || scene.timer <= 0) return;
    const elapsed = clamp(scene.duration - scene.timer, 0, scene.duration);
    const fadeOut = clamp(elapsed / TEMPLE_THRESHOLD_FADE_OUT_SECONDS, 0, 1);
    const fadeInStart = TEMPLE_THRESHOLD_SWITCH_SECONDS;
    const fadeIn = clamp((elapsed - fadeInStart) / TEMPLE_THRESHOLD_FADE_IN_SECONDS, 0, 1);
    const fadeAlpha = elapsed < fadeInStart
      ? fadeOut
      : Math.max(0, 1 - fadeIn);
    const letterbox = clamp(Math.min(elapsed, scene.duration - elapsed) / 0.7, 0, 1);

    ctx.save();
    if (letterbox > 0) {
      ctx.globalAlpha = 0.88 * letterbox;
      ctx.fillStyle = '#020617';
      const barHeight = 48;
      ctx.fillRect(0, 0, CANVAS_WIDTH, barHeight);
      ctx.fillRect(0, CANVAS_HEIGHT - barHeight, CANVAS_WIDTH, barHeight);
    }

    if (elapsed < fadeInStart && fadeAlpha < 0.98) {
      const doorPulse = 0.48 + Math.sin(now / 190) * 0.12;
      ctx.globalAlpha = (1 - fadeAlpha) * doorPulse;
      const doorGlow = ctx.createRadialGradient(
        CANVAS_WIDTH * 0.52,
        CANVAS_HEIGHT * 0.52,
        18,
        CANVAS_WIDTH * 0.52,
        CANVAS_HEIGHT * 0.52,
        CANVAS_WIDTH * 0.46,
      );
      doorGlow.addColorStop(0, 'rgba(15, 23, 42, 0.62)');
      doorGlow.addColorStop(0.44, 'rgba(88, 56, 28, 0.24)');
      doorGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = doorGlow;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    if (fadeAlpha > 0) {
      ctx.globalAlpha = clamp(fadeAlpha, 0, 1);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    if (fadeAlpha > 0.72) {
      const titleAlpha = clamp((fadeAlpha - 0.72) / 0.28, 0, 1);
      ctx.globalAlpha = titleAlpha;
      ctx.textAlign = 'center';
      ctx.fillStyle = scene.accent || '#facc15';
      ctx.font = '900 18px Outfit, sans-serif';
      ctx.fillText(scene.title || DEFAULT_LEVEL_TRANSITION.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 12);
      ctx.fillStyle = 'rgba(255, 247, 237, 0.86)';
      ctx.font = '800 13px Outfit, sans-serif';
      ctx.fillText(scene.subtitle || DEFAULT_LEVEL_TRANSITION.subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 18);
    }
    ctx.restore();
  }, []);

  const drawGroundDustLip = useCallback((ctx, x, y, width, color = 'rgba(210, 160, 92, 0.28)') => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(18, width / 2.4), Math.max(3, width / 24), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

  const drawHazardGroundApron = useCallback((ctx, x, y, width, sectionId, intensity = 1) => {
    const sandColor = sectionId === 'catacombs'
      ? 'rgba(74, 58, 42, 0.34)'
      : sectionId === 'escape-sequence'
        ? 'rgba(123, 72, 34, 0.34)'
        : 'rgba(185, 119, 55, 0.34)';
    const highlight = sectionId === 'catacombs'
      ? 'rgba(156, 125, 86, 0.24)'
      : 'rgba(226, 162, 83, 0.28)';
    ctx.save();
    ctx.globalAlpha = 0.85 * intensity;
    ctx.fillStyle = sandColor;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(24, width / 2.05), Math.max(5, width / 18), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.7 * intensity;
    ctx.strokeStyle = highlight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - width * 0.36, y - 2);
    ctx.quadraticCurveTo(x - width * 0.08, y + 4, x + width * 0.22, y - 1);
    ctx.quadraticCurveTo(x + width * 0.34, y - 4, x + width * 0.44, y + 1);
    ctx.stroke();
    ctx.restore();
  }, []);

  const drawDecorativeBaseBlend = useCallback((ctx, x, y, width, sectionId, depth = 'background', intensity = 1) => {
    const base = sectionId === 'catacombs'
      ? 'rgba(46, 37, 30, 0.36)'
      : sectionId === 'escape-sequence'
        ? 'rgba(112, 66, 33, 0.3)'
        : sectionId === 'dig-site-entrance'
          ? 'rgba(177, 120, 61, 0.24)'
          : 'rgba(170, 111, 52, 0.28)';
    const highlight = depth === 'background'
      ? 'rgba(228, 171, 98, 0.12)'
      : 'rgba(235, 178, 94, 0.2)';
    ctx.save();
    ctx.globalAlpha = intensity;
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(18, width / 2.25), Math.max(4, width / 22), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha *= 0.82;
    ctx.strokeStyle = highlight;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - width * 0.32, y - 1);
    ctx.quadraticCurveTo(x - width * 0.08, y + 3, x + width * 0.24, y);
    ctx.stroke();
    ctx.restore();
  }, []);

  const drawRouteGroundApron = useCallback((ctx, x, y, width, sectionId, intensity = 1, detailSeed = 0) => {
    const isCatacombs = sectionId === 'catacombs';
    const isEscape = sectionId === 'escape-sequence';
    const base = isCatacombs
      ? 'rgba(65, 51, 38, 0.38)'
      : isEscape
        ? 'rgba(138, 79, 36, 0.34)'
        : 'rgba(185, 119, 55, 0.34)';
    const warmEdge = isCatacombs
      ? 'rgba(143, 112, 76, 0.24)'
      : 'rgba(235, 174, 91, 0.28)';
    const shadow = isCatacombs
      ? 'rgba(24, 18, 13, 0.18)'
      : 'rgba(70, 38, 15, 0.15)';

    ctx.save();
    ctx.globalAlpha = 0.86 * intensity;
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(x, y + 2, Math.max(34, width / 2), Math.max(8, width / 18), 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.58 * intensity;
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.ellipse(x + width * 0.08, y + 7, Math.max(28, width / 2.6), Math.max(5, width / 28), -0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.72 * intensity;
    ctx.strokeStyle = warmEdge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - width * 0.42, y - 1);
    ctx.quadraticCurveTo(x - width * 0.18, y + 5, x + width * 0.1, y + 1);
    ctx.quadraticCurveTo(x + width * 0.28, y - 3, x + width * 0.44, y + 2);
    ctx.stroke();

    ctx.globalAlpha = 0.5 * intensity;
    ctx.fillStyle = isCatacombs ? 'rgba(100, 78, 55, 0.28)' : 'rgba(135, 82, 35, 0.22)';
    for (let i = 0; i < 4; i += 1) {
      const offset = ((detailSeed + i * 37) % 100) / 100;
      const rockX = x - width * 0.34 + width * 0.68 * offset;
      const rockY = y + 1 + ((detailSeed + i * 17) % 5);
      ctx.beginPath();
      ctx.ellipse(rockX, rockY, 4 + (i % 2) * 2, 2.2, 0.16 * (i - 1), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }, []);

  const drawAncientRouteGround = useCallback((ctx, section, cameraX, now, current) => {
    const isCatacombs = section.id === 'catacombs';
    const isEscape = section.id === 'escape-sequence';
    const floorBandTop = GROUND_Y - (isCatacombs ? 18 : 20);
    const floorBandBottom = GROUND_Y + (isCatacombs ? 16 : 18);
    const routeGradient = ctx.createLinearGradient(0, floorBandTop - 8, 0, floorBandBottom);
    if (isCatacombs) {
      routeGradient.addColorStop(0, 'rgba(78, 60, 42, 0)');
      routeGradient.addColorStop(0.36, 'rgba(78, 60, 42, 0.2)');
      routeGradient.addColorStop(1, 'rgba(39, 28, 20, 0.34)');
    } else if (isEscape) {
      routeGradient.addColorStop(0, 'rgba(174, 96, 39, 0)');
      routeGradient.addColorStop(0.34, 'rgba(174, 96, 39, 0.18)');
      routeGradient.addColorStop(1, 'rgba(91, 50, 25, 0.3)');
    } else {
      routeGradient.addColorStop(0, 'rgba(214, 145, 66, 0)');
      routeGradient.addColorStop(0.34, 'rgba(214, 145, 66, 0.16)');
      routeGradient.addColorStop(1, 'rgba(121, 69, 30, 0.28)');
    }

    ctx.save();
    ctx.fillStyle = routeGradient;
    ctx.beginPath();
    ctx.moveTo(0, floorBandBottom);
    ctx.lineTo(0, floorBandTop + Math.sin(cameraX * 0.006) * 2);
    for (let sx = 0; sx <= CANVAS_WIDTH + 32; sx += 32) {
      const worldX = cameraX + sx;
      const wave = Math.sin(worldX * 0.009) * 3 + Math.cos(worldX * 0.004) * 4;
      ctx.lineTo(sx, floorBandTop + wave);
    }
    ctx.lineTo(CANVAS_WIDTH, floorBandBottom);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 0.46;
    ctx.strokeStyle = isCatacombs ? 'rgba(160, 128, 86, 0.22)' : 'rgba(255, 205, 123, 0.24)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let sx = -12; sx <= CANVAS_WIDTH + 12; sx += 36) {
      const worldX = cameraX + sx;
      const y = floorBandTop + 5 + Math.sin(worldX * 0.01) * 2;
      if (sx === -12) ctx.moveTo(sx, y);
      else ctx.lineTo(sx, y);
    }
    ctx.stroke();

    const sectionStart = Math.max(section.start, cameraX - 160);
    const sectionEnd = Math.min(section.end, cameraX + CANVAS_WIDTH + 160);
    const firstStone = Math.floor(sectionStart / 96) * 96;
    for (let worldX = firstStone; worldX <= sectionEnd; worldX += 96) {
      const sx = worldToScreenX(worldX, cameraX);
      const seed = Math.abs(Math.sin(worldX * 0.037)) * 100;
      const stoneY = GROUND_Y - 13 + Math.sin(worldX * 0.017 + now / 2800) * 2;
      const stoneWidth = 28 + (seed % 18);
      ctx.globalAlpha = 0.12 + (seed % 4) * 0.018;
      ctx.fillStyle = isCatacombs ? '#8a6b49' : '#b77a3a';
      ctx.beginPath();
      ctx.roundRect(sx - stoneWidth / 2, stoneY, stoneWidth, 6 + (seed % 5), 3);
      ctx.fill();
    }

    const blendPoints = [
      ...CHECKPOINTS.map((checkpoint) => ({ x: checkpoint.x, width: 210, kind: 'checkpoint' })),
      ...PLATFORMS
        .filter((platform) => platform.y !== GROUND_Y && isPlatformAvailable(platform, current))
        .map((platform) => ({ x: platform.x + platform.width / 2, width: Math.min(220, platform.width * 1.35), kind: 'platform' })),
    ];
    blendPoints.forEach((item) => {
      if (!isHorizontallyVisible(item.x - item.width / 2, item.width, cameraX, 80)) return;
      const sx = worldToScreenX(item.x, cameraX);
      drawRouteGroundApron(ctx, sx, GROUND_Y - 3, item.width, section.id, item.kind === 'checkpoint' ? 0.82 : 0.56, Math.round(item.x));
    });

    if (current.renderStats) {
      current.renderStats.routeGroundVisualMode = ROUTE_GROUND_VISUAL_MODE;
      current.renderStats.routeGroundHazeFixVersion = ROUTE_GROUND_HAZE_FIX_VERSION;
    }
    ctx.restore();
  }, [drawRouteGroundApron]);

  const drawForegroundSettlingDetails = useCallback((ctx, x, y, width, sectionId, options = {}) => {
    const intensity = options.intensity ?? 1;
    const seed = options.seed ?? 0;
    const isCatacombs = sectionId === 'catacombs';
    const stoneColor = isCatacombs ? 'rgba(105, 82, 56, 0.42)' : 'rgba(126, 77, 34, 0.36)';
    const highlight = isCatacombs ? 'rgba(178, 145, 96, 0.2)' : 'rgba(238, 184, 101, 0.24)';

    ctx.save();
    drawRouteGroundApron(ctx, x, y, width, sectionId, 0.56 * intensity, seed);

    ctx.globalAlpha = 0.64 * intensity;
    ctx.fillStyle = stoneColor;
    const stoneCount = options.stones ?? 5;
    for (let i = 0; i < stoneCount; i += 1) {
      const t = stoneCount <= 1 ? 0.5 : i / (stoneCount - 1);
      const jitter = Math.sin(seed * 0.07 + i * 1.9);
      const stoneX = x - width * 0.42 + width * 0.84 * t + jitter * 8;
      const stoneY = y + 4 + Math.cos(seed * 0.05 + i) * 3;
      ctx.beginPath();
      ctx.roundRect(stoneX - 6, stoneY - 3, 10 + (i % 3) * 3, 5 + (i % 2) * 2, 2);
      ctx.fill();
    }

    ctx.globalAlpha = 0.72 * intensity;
    ctx.strokeStyle = highlight;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x - width * 0.32, y + 1);
    ctx.quadraticCurveTo(x - width * 0.08, y + 7, x + width * 0.24, y + 3);
    ctx.stroke();
    ctx.restore();
  }, [drawRouteGroundApron]);

  const drawSectionTransitionBlend = useCallback((ctx, cameraX) => {
    SECTIONS.slice(1).forEach((section) => {
      const x = section.start - cameraX;
      if (x < -140 || x > CANVAS_WIDTH + 140) return;
      const previousSection = getSectionForX(section.start - 1);
      const fromColor = previousSection.id === 'catacombs'
        ? 'rgba(55, 42, 30, 0.34)'
        : previousSection.id === 'escape-sequence'
          ? 'rgba(126, 74, 35, 0.3)'
          : 'rgba(177, 115, 54, 0.24)';
      const toColor = section.id === 'catacombs'
        ? 'rgba(55, 42, 30, 0.34)'
        : section.id === 'escape-sequence'
          ? 'rgba(126, 74, 35, 0.3)'
          : 'rgba(177, 115, 54, 0.24)';
      const gradient = ctx.createLinearGradient(x - 92, 0, x + 92, 0);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.35, fromColor);
      gradient.addColorStop(0.65, toColor);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.fillRect(x - 96, GROUND_Y - 18, 192, CANVAS_HEIGHT - GROUND_Y + 28);
      drawGroundDustLip(ctx, x, GROUND_Y + 2, 150, 'rgba(216, 154, 82, 0.22)');
      ctx.globalAlpha = 0.42;
      ctx.fillStyle = section.id === 'catacombs' ? '#5b4630' : '#b87835';
      ctx.beginPath();
      ctx.ellipse(x - 28, GROUND_Y + 3, 34, 5, -0.12, 0, Math.PI * 2);
      ctx.ellipse(x + 36, GROUND_Y + 4, 42, 6, 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, [drawGroundDustLip]);

  const drawPlayerWeaponFallback = useCallback((ctx, attackState, direction, scale = 1) => {
    const attacking = attackState === 'swing';
    const reach = attackState === 'windup' ? 11 : attacking ? 32 : attackState === 'recoil' ? 14 : 18;
    const lift = attacking ? -10 : attackState === 'windup' ? 4 : -2;
    ctx.save();
    if (attackState === 'windup' || attacking || attackState === 'recoil') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = attacking ? 0.52 : attackState === 'windup' ? 0.26 : 0.18;
      ctx.strokeStyle = attacking ? 'rgba(255, 247, 173, 0.92)' : 'rgba(250, 204, 21, 0.62)';
      ctx.lineWidth = (attacking ? 6 : 3) * scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(direction * 12 * scale, -8 * scale, 28 * scale, direction > 0 ? -1.38 : Math.PI + 1.38, direction > 0 ? 0.34 : Math.PI - 0.34, direction < 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = (attacking ? 5 : 3) * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(direction * reach * scale, lift * scale);
    ctx.stroke();
    ctx.fillStyle = '#fff7ad';
    ctx.beginPath();
    ctx.arc(direction * (reach + 2) * scale, lift * scale, (attacking ? 4 : 3) * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

  const drawPlayerKhopesh = useCallback((ctx, anchorX, anchorY, attackState, direction = 1, scale = 1) => {
    const assets = playerWeaponSpriteRef.current;
    const frameKey = getPlayerWeaponFrameKey(attackState);
    const ready = assets.loaded && assets.image && assets.atlas?.regions?.[frameKey];

    if (!ready) {
      drawPlayerWeaponFallback(ctx, attackState, direction, scale);
      return false;
    }

    const frameConfig = {
      khopeshIdle: { x: -5, y: -22, width: 14, height: 40, rotate: -0.1, alpha: 0.92 },
      khopeshWindup: { x: -7, y: -28, width: 30, height: 42, rotate: -0.72, alpha: 1 },
      khopeshSwing: { x: 2, y: -39, width: 64, height: 48, rotate: 0.08, alpha: 0.94 },
      khopeshReady: { x: -5, y: -20, width: 14, height: 40, rotate: 0.2, alpha: 0.9 },
    }[frameKey] || { x: 0, y: -24, width: 17, height: 48, rotate: 0, alpha: 1 };

    ctx.save();
    ctx.translate(anchorX, anchorY);
    if (direction < 0) ctx.scale(-1, 1);
    if (attackState === 'windup' || attackState === 'swing' || attackState === 'recoil') {
      const trailAlpha = attackState === 'swing' ? 0.58 : attackState === 'windup' ? 0.28 : 0.18;
      const trailWidth = attackState === 'swing' ? 9 : 5;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = trailAlpha;
      ctx.strokeStyle = attackState === 'swing' ? 'rgba(255, 247, 173, 0.92)' : 'rgba(250, 204, 21, 0.68)';
      ctx.lineWidth = trailWidth * scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (attackState === 'windup') {
        ctx.arc(8 * scale, -16 * scale, 26 * scale, -2.15, -0.62);
      } else if (attackState === 'recoil') {
        ctx.arc(16 * scale, -14 * scale, 24 * scale, -0.12, 0.82);
      } else {
        ctx.arc(22 * scale, -18 * scale, 38 * scale, -1.28, 0.55);
      }
      ctx.stroke();
      ctx.lineWidth = Math.max(1.5, trailWidth * 0.28) * scale;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.86)';
      ctx.stroke();
      ctx.restore();
    }
    ctx.rotate(frameConfig.rotate);
    ctx.globalAlpha *= frameConfig.alpha;
    ctx.shadowColor = attackState === 'swing' ? 'rgba(250, 204, 21, 0.72)' : 'rgba(0, 0, 0, 0.28)';
    ctx.shadowBlur = attackState === 'swing' ? 12 : 4;
    const drawn = drawPlayerWeaponAtlasRegion(
      ctx,
      assets,
      frameKey,
      {
        x: frameConfig.x * scale,
        y: frameConfig.y * scale,
        width: frameConfig.width * scale,
        height: frameConfig.height * scale,
      },
    );
    ctx.restore();

    if (drawn && stateRef.current.renderStats) {
      stateRef.current.renderStats.playerWeaponFrame = frameKey;
      stateRef.current.renderStats.playerWeaponVisualMode = 'khopesh-sprite-atlas';
    }
    return drawn;
  }, [drawPlayerWeaponFallback]);

  const drawPlayerFallbackCharacter = useCallback((ctx, x, y, w, h, direction, invuln, now) => {
    ctx.save();
    if (invuln > 0 && Math.floor(now / 100) % 2 === 0) ctx.globalAlpha = 0.3;
    
    const current = stateRef.current;
    const walkStyle = current.player.visualWalkStyle || 'none';
    const animationState = current.player.animationState || 'idle';
    const walkTempo = walkStyle === 'run' ? 72 : walkStyle === 'survey-walk' ? 180 : 105;
    const bob = animationState === 'land'
      ? 2
      : Math.sin(now / walkTempo) * (walkStyle === 'run' ? 3 : walkStyle === 'survey-walk' ? 1 : 2);
    const legSwing = Math.sin(now / Math.max(54, walkTempo * 0.72)) * (walkStyle === 'run' ? 11 : walkStyle === 'survey-walk' ? 5 : 8);
    const attackState = getPlayerAttackState(current);
    const movementLean = walkStyle === 'run' ? direction * 2 : walkStyle === 'survey-walk' ? -direction * 1.2 : 0;
    const attackLean = attackState === 'windup'
      ? -direction * 3
      : attackState === 'swing'
        ? direction * 7
        : attackState === 'recoil'
          ? -direction * 4
          : 0;
    const totalLean = attackLean + movementLean;

    // Readability shadow and outline
    ctx.fillStyle = 'rgba(0,0,0,0.36)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h + 2, w * 0.9, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fff7d6';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.roundRect(x + 3 + totalLean, y + 5 + bob, 24, 28, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + w / 2 + totalLean, y + 4 + bob, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Body
    ctx.fillStyle = '#1f4f5f';
    ctx.beginPath();
    ctx.roundRect(x + 2 + totalLean, y + 8 + bob, 26, 25, 7);
    ctx.fill();
    ctx.strokeStyle = '#05111f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f2c36b';
    ctx.beginPath();
    ctx.arc(x + w / 2 + totalLean, y + 18 + bob, 5, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#d69a5f';
    ctx.beginPath();
    ctx.arc(x + w / 2 + totalLean, y + 1 + bob, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a2416';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Satchel Strap
    ctx.strokeStyle = '#3a2416';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + totalLean + (direction > 0 ? 8 : 22), y + 11 + bob);
    ctx.lineTo(x + totalLean + (direction > 0 ? 22 : 8), y + 29 + bob);
    ctx.stroke();

    // Hat
    ctx.fillStyle = '#4b2f1c';
    ctx.strokeStyle = '#fff7d6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + totalLean + (direction > 0 ? -6 : 0), y - 5 + bob, 36, 5, 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(x + totalLean + (direction > 0 ? 4 : 8), y - 13 + bob, 20, 10, 3);
    ctx.fill();
    ctx.stroke();

    // Backpack and satchel
    ctx.fillStyle = '#7c3f18';
    ctx.beginPath();
    ctx.roundRect(x + totalLean + (direction > 0 ? -2 : 21), y + 13 + bob, 9, 16, 3);
    ctx.fill();
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(x + totalLean + (direction > 0 ? 20 : 0), y + 18 + bob, 10, 8, 2);
    ctx.fill();

    // Weapon in hand
    const handX = x + totalLean + (direction > 0 ? 24 : 4);
    drawPlayerKhopesh(ctx, handX, y + 19 + bob, attackState, direction, 0.9);

    // Legs and boots
    const moving = Math.abs(current.player.vx) > 0.1;
    const leftLegX = x + 7 + (moving ? (direction > 0 ? legSwing : -legSwing) * 0.25 : 0);
    const rightLegX = x + 17 + (moving ? (direction > 0 ? -legSwing : legSwing) * 0.25 : 0);
    ctx.fillStyle = '#10233b';
    ctx.fillRect(leftLegX, y + 31, 6, 12);
    ctx.fillRect(rightLegX, y + 31, 6, 12);
    ctx.fillStyle = '#241407';
    ctx.fillRect(leftLegX - 1, y + 41, 9, 4);
    ctx.fillRect(rightLegX - 1, y + 41, 9, 4);

    // Interaction Prompt
    if (stateRef.current.notice && stateRef.current.notice.includes('near')) {
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('!', x + w/2, y - 15 + bob);
    }
    
    ctx.restore();
  }, [drawPlayerKhopesh, getPlayerAttackState]);

  const drawPlayerSprite = useCallback((ctx, x, y, w, h, direction, invuln, now) => {
    const sprite = playerSpriteRef.current;
    if (!sprite.loaded || !sprite.image) {
      drawPlayerFallbackCharacter(ctx, x, y, w, h, direction, invuln, now);
      return;
    }

    const current = stateRef.current;
    const heroAtlas = sprite.mode === 'hero-atlas' ? sprite.atlas : null;
    const heroFrameKey = heroAtlas ? getHeroSpriteFrameKey(current, heroAtlas, now) : null;
    const heroRegion = heroFrameKey ? heroAtlas?.regions?.[heroFrameKey] : null;
    const frame = clamp(current.player.animationFrame ?? 1, 0, PLAYER_SPRITE_FRAME_COUNT - 1);
    const heroDrawBounds = heroRegion?.drawBounds || null;
    const sourceX = (heroRegion?.x ?? frame * PLAYER_SPRITE_FRAME_WIDTH) + (heroDrawBounds?.x || 0);
    const sourceY = (heroRegion?.y ?? 0) + (heroDrawBounds?.y || 0);
    const frameWidth = heroDrawBounds?.w || heroRegion?.w || PLAYER_SPRITE_FRAME_WIDTH;
    const frameHeight = heroDrawBounds?.h || heroRegion?.h || PLAYER_SPRITE_FRAME_HEIGHT;
    const heroDrawHeight = Number(heroAtlas?.draw?.height) || PLAYER_SPRITE_DRAW_HEIGHT;
    const nominalFrameHeight = heroRegion
      ? Number(heroAtlas?.draw?.sourceHeight) || Number(heroAtlas?.frame?.height) || heroRegion.h || frameHeight
      : frameHeight;
    const drawScale = heroDrawHeight / nominalFrameHeight;
    const drawWidth = frameWidth * drawScale;
    const renderedHeight = frameHeight * drawScale;
    const footX = x + w / 2;
    const footY = y + h + 1;
    const drawX = -drawWidth / 2;
    const regionGroundLineY = Number(heroRegion?.groundLineY);
    const boundedGroundLineY = Number.isFinite(regionGroundLineY)
      ? regionGroundLineY - (heroDrawBounds?.y || 0)
      : null;
    const drawY = heroRegion && Number.isFinite(boundedGroundLineY)
      ? -boundedGroundLineY * drawScale
      : -renderedHeight;
    const attackState = getPlayerAttackState(current);
    const attackLean = attackState === 'windup'
      ? -direction * 3
      : attackState === 'swing'
        ? direction * 6
        : attackState === 'recoil'
          ? -direction * 4
          : 0;
    const animationState = current.player.animationState || 'idle';
    const walkStyle = current.player.visualWalkStyle || 'none';
    const movementLean = walkStyle === 'run' ? direction * 2.5 : walkStyle === 'survey-walk' ? -direction * 1.25 : 0;
    const jumpLift = animationState === 'jump' ? -3 : animationState === 'fall' ? 1 : animationState === 'land' ? 2 : 0;
    const hurtShake = animationState === 'hurt' ? Math.sin(now / 24) * 2 : 0;
    const landingPulse = clamp((current.player.landingFeedbackTimer || 0) / 0.16, 0, 1);
    const squashX = 1 + landingPulse * 0.045;
    const squashY = 1 - landingPulse * 0.035;
    const knowledgeScale = current.player.knowledgeVisualScale || 1;

    ctx.save();
    if (invuln > 0 && Math.floor(now / 100) % 2 === 0) ctx.globalAlpha = 0.34;

    ctx.fillStyle = 'rgba(0,0,0,0.34)';
    ctx.beginPath();
    ctx.ellipse(footX, footY + 1, w * 1.05, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(footX + attackLean + movementLean + hurtShake, footY + jumpLift);
    if (knowledgeScale > 1) {
      ctx.shadowColor = 'rgba(250, 204, 21, 0.54)';
      ctx.shadowBlur = 18;
      ctx.scale(knowledgeScale, knowledgeScale);
    }
    ctx.scale(squashX, squashY);
    if (direction < 0) ctx.scale(-1, 1);
    ctx.imageSmoothingEnabled = true;
    if (heroAtlas?.draw?.imageSmoothingQuality) {
      ctx.imageSmoothingQuality = heroAtlas.draw.imageSmoothingQuality;
    }
    ctx.drawImage(
      sprite.image,
      sourceX,
      sourceY,
      frameWidth,
      frameHeight,
      drawX,
      drawY,
      drawWidth,
      renderedHeight,
    );
    if (current.renderStats && heroFrameKey) {
      current.renderStats.playerSpriteFrame = heroFrameKey;
      current.renderStats.playerSpriteVisualMode = 'hero-atlas';
    }

    const suppressExternalWeapon = heroAtlas?.draw?.suppressExternalWeapon
      || (heroAtlas?.draw?.suppressExternalWeaponDuringAttack
        && isPlayerAttackVisualPhase(attackState));
    if (!suppressExternalWeapon) {
      drawPlayerKhopesh(ctx, drawWidth * 0.34, -renderedHeight * 0.54, attackState, 1, 0.9);
    } else if (current.renderStats) {
      current.renderStats.playerWeaponVisualMode = 'integrated-hero-atlas';
    }

    ctx.restore();

    if (stateRef.current.notice && stateRef.current.notice.includes('near')) {
      ctx.save();
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('!', x + w / 2, y - 18);
      ctx.restore();
    }
  }, [drawPlayerFallbackCharacter, drawPlayerKhopesh, getPlayerAttackState]);

  const drawOpeningPyramidAssetRegion = useCallback((ctx, regionKey, dest, options = {}) => {
    const pack = openingPyramidClimbPackRef.current;
    const region = OPENING_PYRAMID_ASSET_REGIONS[regionKey];
    if (!pack.loaded || !pack.image || !region) return false;
    const alpha = options.alpha ?? 1;
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (options.filter) ctx.filter = options.filter;
    if (options.flipX) {
      ctx.translate(dest.x + dest.width / 2, dest.y + dest.height / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(pack.image, region.x, region.y, region.w, region.h, -dest.width / 2, -dest.height / 2, dest.width, dest.height);
    } else {
      ctx.drawImage(pack.image, region.x, region.y, region.w, region.h, dest.x, dest.y, dest.width, dest.height);
    }
    ctx.restore();
    return true;
  }, []);

  const drawOpeningHazardDecalRegion = useCallback((ctx, descriptor, dest, options = {}) => {
    if (!descriptor) return false;
    const pack = descriptor.pack === 'hazard'
      ? openingHazardDecalPackRef.current
      : openingTrapDecalPackRef.current;
    const regions = descriptor.pack === 'hazard'
      ? OPENING_HAZARD_DECAL_REGIONS
      : OPENING_TRAP_DECAL_REGIONS;
    const region = regions[descriptor.regionKey];
    if (!pack.loaded || !pack.image || !region) return false;
    const alpha = options.alpha ?? 1;
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (options.filter) ctx.filter = options.filter;
    ctx.drawImage(pack.image, region.x, region.y, region.w, region.h, dest.x, dest.y, dest.width, dest.height);
    ctx.restore();
    return true;
  }, []);

  const drawOpeningPyramidFacade = useCallback((ctx, cameraX, now = 0) => {
    const facade = openingPyramidFacadeRef.current;
    if (!facade.loaded || !facade.image) return false;
    const x = worldToScreenX(OPENING_PYRAMID_FACADE_WORLD_LEFT_X, cameraX);
    const y = -4;
    const width = 1208;
    const height = 664;
    if (x > CANVAS_WIDTH + 80 || x + width < -80) return false;
    ctx.save();
    ctx.globalAlpha = 0.98;
    ctx.filter = 'sepia(4%) saturate(98%) brightness(91%) contrast(102%)';
    ctx.drawImage(facade.image, x, y, width, height);
    ctx.filter = 'none';
    const scarabSealX = worldToScreenX(SCARAB_SEAL_TRIGGER.x, cameraX);
    if (scarabSealX > -120 && scarabSealX < CANVAS_WIDTH + 120) {
      const beaconY = SCARAB_SEAL_TRIGGER.y - 44;
      const activated = Boolean(stateRef.current.scarabSealActivated);
      const lurePulse = activated ? 0 : 0.5 + Math.sin(now / 360) * 0.5;
      const lureBreath = activated ? 0 : 0.55 + Math.sin(now / 620) * 0.45;
      const glow = ctx.createRadialGradient(scarabSealX, beaconY, 10, scarabSealX, beaconY, 78);
      glow.addColorStop(0, activated ? 'rgba(56, 189, 248, 0.42)' : `rgba(250, 204, 21, ${0.4 + lurePulse * 0.2})`);
      glow.addColorStop(0.36, activated ? 'rgba(56, 189, 248, 0.24)' : `rgba(250, 204, 21, ${0.2 + lurePulse * 0.13})`);
      glow.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.save();
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(scarabSealX, beaconY, 78 + lureBreath * 18, 80 + lureBreath * 16, 0, 0, Math.PI * 2);
      ctx.fill();
      if (!activated) {
        ctx.strokeStyle = `rgba(253, 224, 71, ${0.3 + lurePulse * 0.28})`;
        ctx.lineWidth = 2.4;
        [0, 1, 2].forEach((ring) => {
          const ringProgress = (lurePulse + ring * 0.34) % 1;
          ctx.globalAlpha = 1 - ringProgress * 0.72;
          ctx.beginPath();
          ctx.ellipse(scarabSealX, beaconY, 42 + ringProgress * 58, 26 + ringProgress * 42, 0, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      drawOpeningPyramidAssetRegion(ctx, 'pedestal', {
        x: scarabSealX - 43,
        y: beaconY + 10,
        width: 86,
        height: 68,
      }, { alpha: 0.74, filter: 'sepia(8%) saturate(88%) brightness(84%) contrast(98%)' });
      drawOpeningPyramidAssetRegion(ctx, 'seal', {
        x: scarabSealX - 27,
        y: beaconY - 30,
        width: 54,
        height: 54,
      }, {
        alpha: activated ? 1 : 0.94 + lurePulse * 0.06,
        filter: activated
          ? 'saturate(118%) brightness(112%) contrast(104%) drop-shadow(0 0 12px rgba(56,189,248,0.5))'
          : `saturate(122%) brightness(${112 + lurePulse * 12}%) contrast(106%) drop-shadow(0 0 ${12 + lurePulse * 12}px rgba(250,204,21,0.68))`,
      });
    }
    const baseFade = ctx.createLinearGradient(0, GROUND_Y - 52, 0, GROUND_Y + 24);
    baseFade.addColorStop(0, 'rgba(171, 103, 42, 0)');
    baseFade.addColorStop(0.74, 'rgba(171, 103, 42, 0.24)');
    baseFade.addColorStop(1, 'rgba(91, 51, 21, 0.32)');
    ctx.fillStyle = baseFade;
    ctx.fillRect(Math.max(-40, x), GROUND_Y - 52, Math.min(width + 80, CANVAS_WIDTH + 80), 82);
    ctx.restore();
    return true;
  }, [drawOpeningPyramidAssetRegion]);

  const drawOpeningPyramidMasonryBack = useCallback((ctx, cameraX, now = 0) => {
    if (openingPyramidFacadeRef.current.loaded && openingPyramidFacadeRef.current.image) {
      drawOpeningPyramidFacade(ctx, cameraX, now);
      return;
    }
    const facadeStartX = 80;
    const facadeEndX = 1760;
    if (!isHorizontallyVisible(facadeStartX, facadeEndX - facadeStartX, cameraX, 180)) return;
    const baseY = GROUND_Y + 12;
    ctx.save();

    OPENING_PYRAMID_FACADE_TIERS.forEach((tier, index) => {
      const sx = worldToScreenX(tier.x, cameraX);
      const topY = tier.y;
      const tierBottom = Math.min(baseY, tier.y + tier.height);
      const height = tierBottom - topY;
      if (sx > CANVAS_WIDTH + 160 || sx + tier.width < -160 || height <= 0) return;

      ctx.save();
      ctx.globalAlpha = tier.alpha;
      ctx.beginPath();
      ctx.moveTo(sx + tier.inset, topY);
      ctx.lineTo(sx + tier.width - tier.inset * 0.3, topY);
      ctx.lineTo(sx + tier.width, tierBottom);
      ctx.lineTo(sx, tierBottom);
      ctx.closePath();
      ctx.clip();

      const faceGradient = ctx.createLinearGradient(0, topY, 0, tierBottom);
      faceGradient.addColorStop(0, 'rgb(183, 117, 49)');
      faceGradient.addColorStop(0.5, 'rgb(110, 63, 27)');
      faceGradient.addColorStop(1, 'rgb(58, 34, 16)');
      ctx.fillStyle = faceGradient;
      ctx.fillRect(sx, topY, tier.width, height);

      const region = index < 3 ? 'leftStairFace' : index < 5 ? 'rightStairFace' : 'terraceWall';
      drawOpeningPyramidAssetRegion(ctx, region, {
        x: sx - 10,
        y: topY - 5,
        width: tier.width + 20,
        height: height + 18,
      }, {
        alpha: 0.58,
        filter: 'sepia(10%) saturate(88%) brightness(70%) contrast(112%)',
      });

      ctx.globalAlpha = tier.alpha * 0.86;
      ctx.strokeStyle = 'rgba(48, 27, 12, 0.42)';
      ctx.lineWidth = 1.2;
      for (let rowY = topY + 13; rowY < tierBottom - 8; rowY += 16) {
        ctx.beginPath();
        ctx.moveTo(sx + 18, rowY);
        ctx.lineTo(sx + tier.width - 18, rowY + Math.sin(rowY * 0.09 + index) * 1.4);
        ctx.stroke();
        for (let jointX = sx + 42 + ((index * 23 + rowY) % 58); jointX < sx + tier.width - 36; jointX += 72) {
          ctx.beginPath();
          ctx.moveTo(jointX, rowY - 13);
          ctx.lineTo(jointX + Math.sin(jointX * 0.04) * 5, rowY - 2);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = tier.alpha * 0.34;
      ctx.fillStyle = 'rgba(255, 220, 142, 0.9)';
      ctx.fillRect(sx + tier.inset * 0.7, topY, tier.width - tier.inset, 6);
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = tier.alpha * 0.2;
      ctx.fillStyle = 'rgba(41, 23, 9, 0.95)';
      ctx.fillRect(sx + tier.width * 0.42, topY + 8, tier.width * 0.58, Math.max(12, height - 10));
      ctx.restore();
    });

    const summitX = worldToScreenX(scaleJourneyX(488), cameraX);
    drawOpeningPyramidAssetRegion(ctx, 'terraceWall', {
      x: summitX - 84,
      y: openingJourneyY(98),
      width: 246,
      height: 86,
    }, { alpha: 0.82, filter: 'sepia(8%) saturate(92%) brightness(82%) contrast(102%)' });
    drawOpeningPyramidAssetRegion(ctx, 'carvedColumn', {
      x: summitX - 58,
      y: openingJourneyY(129),
      width: 54,
      height: 118,
    }, { alpha: 0.64, filter: 'sepia(8%) saturate(86%) brightness(80%) contrast(96%)' });
    drawOpeningPyramidAssetRegion(ctx, 'paintedColumn', {
      x: summitX + 84,
      y: openingJourneyY(128),
      width: 54,
      height: 120,
    }, { alpha: 0.6, filter: 'sepia(8%) saturate(86%) brightness(80%) contrast(96%)' });

    const lowerX = worldToScreenX(scaleJourneyX(110), cameraX);
    drawOpeningPyramidAssetRegion(ctx, 'carvedColumn', {
      x: lowerX + 20,
      y: openingJourneyY(270),
      width: 58,
      height: 118,
    }, { alpha: 0.48, filter: 'sepia(8%) saturate(84%) brightness(78%) contrast(96%)' });
    drawOpeningPyramidAssetRegion(ctx, 'paintedColumn', {
      x: lowerX + 318,
      y: openingJourneyY(226),
      width: 58,
      height: 122,
    }, { alpha: 0.48, filter: 'sepia(8%) saturate(84%) brightness(78%) contrast(96%)' });

    const x = worldToScreenX(scaleJourneyX(84), cameraX);
    drawOpeningPyramidAssetRegion(ctx, 'rubble', {
      x: x + 510,
      y: GROUND_Y - 64,
      width: 128,
      height: 58,
    }, { alpha: 0.74 });
    drawOpeningPyramidAssetRegion(ctx, 'dust', {
      x: x + 80,
      y: GROUND_Y - 42,
      width: 520,
      height: 58,
    }, { alpha: 0.3 });
    ctx.restore();
  }, [drawOpeningPyramidAssetRegion, drawOpeningPyramidFacade]);

  const drawDesertEntryPlatformSupport = useCallback((ctx, platform, screenX, visualY, visualHeight, reactiveActive = false) => {
    const topY = visualY + visualHeight - 4;
    if (topY >= GROUND_Y - 10) return;

    const centerX = screenX + platform.width / 2;
    const openingSetPiece = platform.x < scaleJourneyX(720);
    const compactOpeningSupport = openingSetPiece && (
      platform.width <= 170
      || platform.label?.includes('return')
      || platform.label?.includes('recovery')
    );
    const floatingOpeningSupport = openingSetPiece && topY < GROUND_Y - 150;
    const supportBottom = openingSetPiece
      ? Math.min(GROUND_Y - 8, topY + (floatingOpeningSupport ? 82 : 118))
      : GROUND_Y - 4;
    const supportHeight = Math.max(28, supportBottom - topY);
    const columnCount = compactOpeningSupport ? 1 : platform.width >= 250 ? 3 : platform.width >= 160 ? 2 : 1;
    const columnWidth = compactOpeningSupport ? 26 : openingSetPiece ? 38 : 30;
    const baseAlpha = compactOpeningSupport ? 0.42 : openingSetPiece ? 0.58 : 0.62;
    const blockHeight = compactOpeningSupport ? 16 : openingSetPiece ? 18 : 14;

    ctx.save();
    ctx.globalAlpha = baseAlpha;
    drawDecorativeBaseBlend(ctx, centerX, supportBottom + 6, platform.width * 0.88, 'desert-entry', 'midground', openingSetPiece ? 0.28 : 0.52);

    if (openingSetPiece && openingPyramidClimbPackRef.current.loaded) {
      drawGroundDustLip(ctx, centerX, Math.min(GROUND_Y - 6, supportBottom + 1), platform.width * 0.58, 'rgba(171, 103, 42, 0.12)');
      ctx.restore();
      return;
    }

    if (!openingSetPiece) {
      const backShadow = ctx.createLinearGradient(0, topY, 0, supportBottom);
      backShadow.addColorStop(0, 'rgba(55, 31, 14, 0.44)');
      backShadow.addColorStop(0.72, 'rgba(95, 55, 24, 0.24)');
      backShadow.addColorStop(1, 'rgba(95, 55, 24, 0)');
      ctx.fillStyle = backShadow;
      ctx.beginPath();
      ctx.moveTo(screenX + platform.width * 0.08, topY + 2);
      ctx.lineTo(screenX + platform.width * 0.92, topY + 2);
      ctx.lineTo(screenX + platform.width * 0.72, supportBottom + 8);
      ctx.lineTo(screenX + platform.width * 0.24, supportBottom + 8);
      ctx.closePath();
      ctx.fill();
    }

    for (let index = 0; index < columnCount; index += 1) {
      const t = columnCount === 1 ? 0.5 : index / (columnCount - 1);
      const columnX = screenX + platform.width * (0.18 + t * 0.64);
      const lean = Math.sin(platform.x * 0.01 + index) * 4;
      const columnTop = topY + (compactOpeningSupport ? 12 : openingSetPiece ? 8 : 4) + (index % 2) * 5;
      const columnBottom = supportBottom;
      const columnHeight = Math.max(22, columnBottom - columnTop);
      if (openingSetPiece && openingPyramidClimbPackRef.current.loaded) {
        const columnRegion = index % 2 ? 'paintedColumn' : 'carvedColumn';
        drawOpeningPyramidAssetRegion(ctx, columnRegion, {
          x: columnX - columnWidth / 2 + lean - 12,
          y: columnTop - 9,
          width: columnWidth + 24,
          height: columnHeight + 15,
        }, { alpha: compactOpeningSupport ? 0.34 : 0.46, filter: 'sepia(8%) saturate(84%) brightness(84%) contrast(92%)' });
        continue;
      }
      const columnGradient = ctx.createLinearGradient(0, columnTop, 0, columnBottom);
      columnGradient.addColorStop(0, openingSetPiece ? 'rgb(184, 118, 57)' : 'rgb(157, 98, 46)');
      columnGradient.addColorStop(0.48, openingSetPiece ? 'rgb(126, 74, 34)' : 'rgb(113, 67, 31)');
      columnGradient.addColorStop(1, openingSetPiece ? 'rgb(70, 39, 17)' : 'rgb(74, 42, 19)');

      ctx.fillStyle = columnGradient;
      ctx.strokeStyle = openingSetPiece ? 'rgba(42, 24, 10, 0.62)' : 'rgba(51, 30, 14, 0.44)';
      ctx.lineWidth = openingSetPiece ? 2 : 1.5;
      ctx.beginPath();
      const left = columnX - columnWidth / 2 + lean;
      if (openingSetPiece) {
        ctx.moveTo(left + 5, columnTop);
        ctx.lineTo(left + columnWidth - 5, columnTop);
        ctx.lineTo(left + columnWidth - 1, columnBottom);
        ctx.lineTo(left + 1, columnBottom);
        ctx.closePath();
      } else {
        ctx.roundRect(left, columnTop, columnWidth, columnHeight, 5);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = compactOpeningSupport ? 'rgba(238, 171, 86, 0.46)' : openingSetPiece ? 'rgba(238, 171, 86, 0.82)' : 'rgba(229, 158, 75, 0.62)';
      ctx.fillRect(left - 10, columnTop - 7, columnWidth + 20, compactOpeningSupport ? 8 : openingSetPiece ? 12 : 9);
      ctx.fillStyle = openingSetPiece ? 'rgba(92, 52, 22, 0.72)' : 'rgba(57, 31, 13, 0.42)';
      ctx.fillRect(left - 12, columnBottom - 8, columnWidth + 24, compactOpeningSupport ? 7 : openingSetPiece ? 10 : 8);
      ctx.fillStyle = openingSetPiece ? 'rgba(37, 21, 9, 0.28)' : 'rgba(38, 22, 10, 0.2)';
      ctx.fillRect(left + columnWidth * 0.58, columnTop + 4, columnWidth * 0.35, Math.max(18, columnHeight - 10));
      ctx.strokeStyle = openingSetPiece ? 'rgba(255, 216, 139, 0.22)' : 'rgba(255, 207, 128, 0.14)';
      ctx.beginPath();
      ctx.moveTo(left + 7, columnTop + 7);
      ctx.lineTo(left + 7, columnBottom - 10);
      ctx.stroke();

      if (openingSetPiece && !compactOpeningSupport) {
        ctx.fillStyle = 'rgba(22, 118, 126, 0.2)';
        ctx.fillRect(left + 5, columnTop + 17, columnWidth - 10, 5);
        ctx.fillStyle = 'rgba(183, 73, 39, 0.16)';
        ctx.fillRect(left + 6, columnTop + 26, columnWidth - 12, 4);
      }

      ctx.strokeStyle = openingSetPiece ? 'rgba(246, 197, 115, 0.28)' : 'rgba(238, 183, 101, 0.22)';
      ctx.lineWidth = 1;
      for (let y = columnTop + blockHeight; y < columnBottom - 8; y += blockHeight) {
        ctx.beginPath();
        ctx.moveTo(left + 5, y);
        ctx.lineTo(left + columnWidth - 5, y + Math.sin(y * 0.08 + index) * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(left + columnWidth * (index % 2 ? 0.42 : 0.58), y - blockHeight + 4);
        ctx.lineTo(left + columnWidth * (index % 2 ? 0.36 : 0.64), y - 4);
        ctx.stroke();
      }
    }

    if (platform.width >= 180 && !openingSetPiece) {
      const wallTop = Math.min(supportBottom - 42, topY + supportHeight * 0.52);
      const wallHeight = Math.max(28, supportBottom - wallTop - 2);
      const wallWidth = platform.width * 0.52;
      const wallX = centerX - wallWidth / 2 + Math.sin(platform.x * 0.004) * 14;
      ctx.globalAlpha = baseAlpha * 0.82;
      const wallGradient = ctx.createLinearGradient(0, wallTop, 0, supportBottom);
      wallGradient.addColorStop(0, 'rgba(131, 78, 35, 0.82)');
      wallGradient.addColorStop(1, 'rgba(64, 36, 16, 0.7)');
      ctx.fillStyle = wallGradient;
      ctx.beginPath();
      ctx.roundRect(wallX, wallTop, wallWidth, wallHeight, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(43, 24, 10, 0.48)';
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 185, 87, 0.14)';
      ctx.fillRect(wallX + 5, wallTop + 4, wallWidth * 0.42, 3);
      ctx.globalAlpha = baseAlpha * 0.62;
      ctx.strokeStyle = 'rgba(226, 162, 83, 0.24)';
      for (let rowY = wallTop + 12; rowY < wallTop + wallHeight - 4; rowY += 13) {
        ctx.beginPath();
        ctx.moveTo(wallX + 5, rowY);
        ctx.lineTo(wallX + wallWidth - 5, rowY + Math.sin(rowY * 0.09) * 1.5);
        ctx.stroke();
        ctx.beginPath();
        const jointX = wallX + wallWidth * (0.32 + 0.2 * Math.sin(rowY * 0.13));
        ctx.moveTo(jointX, rowY - 10);
        ctx.lineTo(jointX + Math.sin(rowY * 0.21) * 6, rowY - 1);
        ctx.stroke();
      }
    }

    if (reactiveActive) {
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = 'rgba(137, 104, 72, 0.34)';
      ctx.beginPath();
      ctx.ellipse(centerX, topY + 18, platform.width * 0.42, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawGroundDustLip(ctx, centerX, supportBottom + 1, platform.width * 0.72, 'rgba(171, 103, 42, 0.16)');
    ctx.restore();
  }, [drawDecorativeBaseBlend, drawGroundDustLip, drawOpeningPyramidAssetRegion]);

  const drawDesertOpeningPlatformFace = useCallback((ctx, platform, x, visualY, visualHeight, reactiveActive = false) => {
    const isOpeningPlatform = platform.x < scaleJourneyX(720);
    if (!isOpeningPlatform) return;

    const topY = visualY;
    const bottomY = visualY + visualHeight;
    const capHeight = Math.min(16, Math.max(9, visualHeight * 0.52));
    const blockCount = Math.max(3, Math.round(platform.width / 58));
    const blockWidth = platform.width / blockCount;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    if (openingPyramidFacadeRef.current.loaded) {
      const hiddenFacadeTread = /stair tread|stair helper|pressure stair slab|cracked summit trap slab/i.test(platform.label || '');
      if (hiddenFacadeTread) {
        ctx.restore();
        return;
      }
      ctx.globalAlpha = reactiveActive ? 0.62 : 0.16;
      const edgeGradient = ctx.createLinearGradient(0, topY - 3, 0, topY + 9);
      edgeGradient.addColorStop(0, 'rgba(255, 225, 145, 0.38)');
      edgeGradient.addColorStop(0.55, 'rgba(159, 92, 35, 0.16)');
      edgeGradient.addColorStop(1, 'rgba(53, 30, 12, 0)');
      ctx.fillStyle = edgeGradient;
      ctx.fillRect(x + 12, topY - 2, platform.width - 24, 8);
      ctx.strokeStyle = reactiveActive ? 'rgba(255, 202, 138, 0.58)' : 'rgba(255, 222, 154, 0.18)';
      ctx.lineWidth = reactiveActive ? 2 : 1.4;
      if (reactiveActive) ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.moveTo(x + 18, topY + 1);
      ctx.lineTo(x + platform.width - 18, topY + 1);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }

    const sourceKey = platform.reactive
      ? 'trapSlab'
      : platform.label?.includes('summit')
        ? 'terraceWall'
        : platform.label?.includes('base')
          ? 'crackedBlock'
          : 'terraceWall';
    if (openingPyramidClimbPackRef.current.loaded) {
      const embeddedAlpha = platform.label?.includes('summit')
        ? 0.94
        : platform.reactive
          ? 0.88
          : 0.78;
      drawOpeningPyramidAssetRegion(ctx, sourceKey, {
        x: x - 4,
        y: topY - 7,
        width: platform.width + 8,
        height: Math.max(36, visualHeight + 13),
      }, {
        alpha: reactiveActive ? Math.min(1, embeddedAlpha + 0.08) : embeddedAlpha,
        filter: reactiveActive ? 'saturate(112%) brightness(108%)' : 'sepia(6%) saturate(96%) brightness(94%) contrast(98%)',
      });
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(99, 55, 24, 0.18)';
      ctx.fillRect(x, topY + 8, platform.width, Math.max(9, visualHeight - 7));
      ctx.restore();
      if (reactiveActive) {
        ctx.strokeStyle = 'rgba(255, 202, 138, 0.46)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 7]);
        ctx.beginPath();
        ctx.moveTo(x + 12, topY + 18);
        ctx.lineTo(x + platform.width - 12, topY + 24);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
      return;
    }

    const faceGradient = ctx.createLinearGradient(0, topY, 0, bottomY);
    faceGradient.addColorStop(0, 'rgba(205, 141, 69, 0.24)');
    faceGradient.addColorStop(0.42, 'rgba(104, 60, 27, 0.22)');
    faceGradient.addColorStop(1, 'rgba(37, 22, 10, 0.42)');
    ctx.fillStyle = faceGradient;
    ctx.fillRect(x - 2, topY, platform.width + 4, visualHeight);

    const capGradient = ctx.createLinearGradient(0, topY - 3, 0, topY + capHeight);
    capGradient.addColorStop(0, 'rgba(255, 222, 150, 0.52)');
    capGradient.addColorStop(0.5, 'rgba(196, 125, 55, 0.32)');
    capGradient.addColorStop(1, 'rgba(85, 49, 22, 0.22)');
    ctx.fillStyle = capGradient;
    ctx.fillRect(x - 4, topY - 1, platform.width + 8, capHeight);

    ctx.strokeStyle = 'rgba(45, 25, 10, 0.46)';
    ctx.lineWidth = 1.4;
    for (let index = 1; index < blockCount; index += 1) {
      const jointX = x + index * blockWidth + Math.sin(platform.x * 0.04 + index) * 4;
      ctx.beginPath();
      ctx.moveTo(jointX, topY + 3);
      ctx.lineTo(jointX + Math.sin(index) * 4, bottomY - 5);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(247, 199, 118, 0.22)';
    ctx.lineWidth = 1;
    for (let rowY = topY + capHeight + 7; rowY < bottomY - 4; rowY += 11) {
      ctx.beginPath();
      ctx.moveTo(x + 8, rowY);
      ctx.lineTo(x + platform.width - 8, rowY + Math.sin(rowY * 0.08 + platform.x) * 1.4);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(27, 16, 7, 0.36)';
    ctx.fillRect(x + 5, bottomY - 7, platform.width - 10, 7);
    ctx.strokeStyle = 'rgba(255, 226, 156, 0.34)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 8, topY + 2);
    ctx.lineTo(x + platform.width - 8, topY + 2);
    ctx.stroke();

    if (reactiveActive) {
      ctx.strokeStyle = 'rgba(255, 202, 138, 0.46)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.moveTo(x + 12, topY + capHeight + 5);
      ctx.lineTo(x + platform.width - 12, topY + capHeight + 9);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [drawOpeningPyramidAssetRegion]);

  const drawPlatform = useCallback((ctx, platform, cameraX, current) => {
    const x = worldToScreenX(platform.x, cameraX);
    if (!isHorizontallyVisible(platform.x, platform.width, cameraX, 50)) return;
    if (platform.invisible) return;

    ctx.save();
    if (platform.secret && !current.collectedUpgrades.has('ancient-compass')) {
      ctx.globalAlpha = 0.15;
    }

    const isGround = platform.y === GROUND_Y;
    const section = getSectionForX(platform.x);
    if (!isGround && current.renderStats) {
      current.renderStats.visibleElevatedPlatforms = [
        ...(current.renderStats.visibleElevatedPlatforms || []),
        {
          id: platform.id || platform.label,
          label: platform.label,
          x: Math.round(platform.x),
          y: Math.round(platform.y),
          width: Math.round(platform.width),
          assetKey: getEnvironmentAssetKeyForPlatform(platform, section.id, environmentAssetsRef.current.packId),
          sectionId: section.id,
        },
      ].slice(-18);
    }
    const platformId = platform.id || platform.label;
    const reactiveTimer = platform.reactive ? current.reactivePlatformTimers?.[platformId] : null;
    const reactiveActive = Number.isFinite(reactiveTimer);
    const reactivePulse = reactiveActive ? 0.58 + Math.sin(Date.now() / 110) * 0.12 : 0;
    const unstableShift = reactiveActive ? Math.sin(Date.now() / 36 + platform.x * 0.01) * Math.min(3, 1.5 + (platform.reactive?.delay || 1) - reactiveTimer) : 0;
    const assetKey = getEnvironmentAssetKeyForPlatform(platform, section.id, environmentAssetsRef.current.packId);
    const visualHeight = isGround ? platform.height : Math.max(platform.height + 10, 28);
    const visualY = platform.y + unstableShift;
    const platformX = x - 2;
    const platformWidth = platform.width + 4;
    const desertSetPiecePlatform = section.id === 'desert-entry' && !isGround;
    const embeddedOpeningPyramidPlatform = desertSetPiecePlatform
      && !platform.assetKey
      && platform.x < scaleJourneyX(720)
      && (openingPyramidFacadeRef.current.loaded || openingPyramidClimbPackRef.current.loaded);
    const facadeIntegratedOpeningPlatform = desertSetPiecePlatform
      && !platform.assetKey
      && platform.x < scaleJourneyX(720)
      && openingPyramidFacadeRef.current.loaded;
    if (facadeIntegratedOpeningPlatform) {
      const hiddenFacadeTread = /stair tread|stair helper|pressure stair slab|cracked summit trap slab/i.test(platform.label || '');
      drawDesertOpeningPlatformFace(ctx, platform, x, visualY, visualHeight, reactiveActive);
      if (reactiveActive && !hiddenFacadeTread) {
        ctx.save();
        ctx.fillStyle = `rgba(137, 104, 72, ${0.12 + reactivePulse * 0.08})`;
        ctx.fillRect(x + 10, platform.y - 2, platform.width - 20, 4);
        ctx.restore();
      }
      ctx.restore();
      return;
    }
    ctx.fillStyle = isGround
      ? section.id === 'catacombs'
        ? '#2b211a'
        : '#9b7140'
      : '#5f4229';
    if (!isGround) {
      if (desertSetPiecePlatform) {
        drawDesertEntryPlatformSupport(ctx, platform, x, visualY, visualHeight, reactiveActive);
      }
      drawForegroundSettlingDetails(ctx, x + platform.width / 2, platform.y + visualHeight + 4, platform.width * 1.28, section.id, {
        intensity: 0.74,
        seed: Math.round(platform.x),
        stones: 6,
      });
      drawContactShadow(ctx, x + platform.width / 2, platform.y + visualHeight + 5, platform.width * 0.94, 0.32, 1.5);
      ctx.fillStyle = 'rgba(30, 18, 8, 0.34)';
      ctx.fillRect(platformX, visualY + visualHeight - 8, platformWidth, 8);
    }
    ctx.fillStyle = isGround ? '#9b7140' : '#5f4229';
    if (embeddedOpeningPyramidPlatform) {
      ctx.globalAlpha *= facadeIntegratedOpeningPlatform ? 0.18 : 0.62;
    }
    ctx.fillRect(platformX, visualY, platformWidth, visualHeight);
    if (desertSetPiecePlatform) {
      ctx.filter = 'sepia(16%) saturate(78%) brightness(84%) contrast(96%)';
    }
    const assetDrawn = drawAtlasRegion(
      ctx,
      environmentAssetsRef.current,
      assetKey,
      { x: platformX, y: visualY, width: platformWidth, height: visualHeight },
      {
        mode: 'tileX',
        sourceInset: isGround ? 30 : 22,
        sourceInsetY: isGround ? 5 : 4,
        overlap: isGround ? 4 : 3,
        tileScale: isGround ? 1.55 : 1.35,
      },
    );
    ctx.filter = 'none';

    if (assetDrawn) {
      if (desertSetPiecePlatform) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = platform.x < scaleJourneyX(720) ? 'rgba(142, 78, 31, 0.18)' : 'rgba(167, 101, 42, 0.22)';
        ctx.fillRect(platformX, visualY, platformWidth, visualHeight);
        ctx.restore();
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = platform.x < scaleJourneyX(720) ? 'rgba(255, 220, 146, 0.14)' : 'rgba(255, 205, 130, 0.08)';
        ctx.fillRect(platformX, visualY, platformWidth, Math.max(5, visualHeight * 0.24));
        ctx.restore();
        drawDesertOpeningPlatformFace(ctx, platform, x, visualY, visualHeight, reactiveActive);
      }
      if (isGround) {
        const edgeGradient = ctx.createLinearGradient(0, platform.y - 10, 0, platform.y + 10);
        edgeGradient.addColorStop(0, 'rgba(230, 171, 88, 0)');
        edgeGradient.addColorStop(0.42, 'rgba(230, 171, 88, 0.2)');
        edgeGradient.addColorStop(1, 'rgba(97, 55, 24, 0.08)');
        ctx.fillStyle = edgeGradient;
        ctx.fillRect(x, platform.y - 8, platform.width, 18);
        ctx.fillStyle = 'rgba(238, 183, 101, 0.16)';
        for (let sx = x - 8; sx < x + platform.width + 12; sx += 34) {
          const wave = Math.sin((sx + cameraX) * 0.035) * 2;
          ctx.beginPath();
          ctx.ellipse(sx + 12, platform.y - 2 + wave, 18, 3.2, -0.05, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = desertSetPiecePlatform ? 'rgba(255, 224, 159, 0.1)' : 'rgba(255, 247, 212, 0.2)';
        ctx.fillRect(x, platform.y, platform.width, 4);
      }
      if (reactiveActive) {
        ctx.fillStyle = `rgba(137, 104, 72, ${0.12 + reactivePulse * 0.08})`;
        ctx.fillRect(x, platform.y - 2, platform.width, 5);
        ctx.strokeStyle = 'rgba(180, 139, 90, 0.34)';
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(x + 8, platform.y + visualHeight * 0.5);
        ctx.lineTo(x + platform.width - 8, platform.y + visualHeight * 0.5 + unstableShift);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (!isGround) {
        ctx.fillStyle = desertSetPiecePlatform ? (platform.x < scaleJourneyX(720) ? 'rgba(23, 13, 6, 0.48)' : 'rgba(30, 18, 9, 0.4)') : 'rgba(30, 18, 9, 0.3)';
        ctx.fillRect(x, platform.y + visualHeight - 7, platform.width, 7);
        if (platform.requiresObjective) {
          const glow = 0.26 + Math.sin(Date.now() / 180) * 0.08;
          ctx.fillStyle = `rgba(250, 204, 21, ${glow})`;
          ctx.fillRect(x + 6, platform.y - 3, platform.width - 12, 5);
        }
        const supportSpacing = Math.max(42, Math.min(72, platform.width / 3));
        ctx.fillStyle = 'rgba(37, 25, 14, 0.28)';
        for (let supportX = x + 14; supportX < x + platform.width - 10; supportX += supportSpacing) {
          ctx.beginPath();
          ctx.moveTo(supportX - 5, platform.y + visualHeight - 2);
          ctx.lineTo(supportX + 5, platform.y + visualHeight - 2);
          ctx.lineTo(supportX + 1, platform.y + visualHeight + 12);
          ctx.lineTo(supportX - 1, platform.y + visualHeight + 12);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(92, 57, 23, 0.26)';
        ctx.fillRect(x + 5, platform.y + visualHeight - 2, platform.width - 10, 3);
        const sandLip = ctx.createLinearGradient(0, platform.y + visualHeight - 10, 0, platform.y + visualHeight + 10);
        sandLip.addColorStop(0, 'rgba(218, 152, 73, 0)');
        sandLip.addColorStop(0.48, 'rgba(205, 135, 58, 0.44)');
        sandLip.addColorStop(1, 'rgba(122, 71, 31, 0.56)');
        ctx.fillStyle = sandLip;
        ctx.beginPath();
        ctx.ellipse(x + platform.width / 2, platform.y + visualHeight + 1, platform.width * 0.5, 8, -0.02, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 247, 212, 0.2)';
        ctx.beginPath();
        ctx.moveTo(x + 4, platform.y + 2);
        ctx.lineTo(x + platform.width - 4, platform.y + 2);
        ctx.stroke();
        drawGroundDustLip(ctx, x + platform.width / 2, platform.y + visualHeight + 2, platform.width * 0.72, 'rgba(178, 117, 54, 0.2)');
      }
      if (!isGround) {
        ctx.strokeStyle = 'rgba(37, 25, 14, 0.34)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, platform.y + 1);
        ctx.lineTo(x + platform.width, platform.y + 1);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    
    // Platform Base
    ctx.fillStyle = platform.secret ? '#5c4d3c' : isGround ? '#8b6a47' : '#4a3720';
    ctx.fillRect(x, visualY, platform.width, platform.height);
    
    // Depth Side
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x, visualY + platform.height - 4, platform.width, 4);

    // Top Surface
    ctx.fillStyle = isGround ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(x, visualY, platform.width, 6);
    
    // Texture / Cracks
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 40; i < platform.width; i += 80) {
      ctx.beginPath();
      ctx.moveTo(x + i, visualY + 6);
      ctx.lineTo(x + i + 5, visualY + platform.height - 4);
      ctx.stroke();
    }
    if (reactiveActive) {
      ctx.fillStyle = `rgba(137, 104, 72, ${0.12 + reactivePulse * 0.08})`;
      ctx.fillRect(x, visualY - 2, platform.width, 5);
    }

    // Border
    ctx.strokeStyle = 'rgba(37, 25, 14, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, visualY, platform.width, platform.height);
    ctx.restore();
  }, [drawContactShadow, drawDesertEntryPlatformSupport, drawDesertOpeningPlatformFace, drawForegroundSettlingDetails, drawGroundDustLip]);

  const drawStoryProp = useCallback((ctx, prop, cameraX, now, requestedDepth = null) => {
    const propDepth = getStoryPropDepth(prop);
    if (requestedDepth && propDepth !== requestedDepth) return;
    const x = worldToScreenX(prop.x, cameraX);
    if (!isHorizontallyVisible(prop.x - 220, 440, cameraX)) return;

    ctx.save();
    const section = getSectionForX(prop.x);
    if (prop.id === 'opening-warrior-guide-marker') {
      ctx.restore();
      return;
    }
    const propForAsset = prop;
    const sacredTrapPropAssetKey = SACRED_DEFENCE_STORY_PROP_IDS.has(prop.id)
      ? getEnvironmentAssetKeyForStoryProp(propForAsset, ENVIRONMENT_ASSET_PACK_IDS.EGYPT_SACRED_TRAPS)
      : null;
    const atmospherePropAssetKey = propForAsset.atmosphereAssetKey
      ? getEnvironmentAssetKeyForStoryProp(propForAsset, ENVIRONMENT_ASSET_PACK_IDS.EGYPT_ATMOSPHERE)
      : null;
    const propAssetKey = sacredTrapPropAssetKey
      || atmospherePropAssetKey
      || getEnvironmentAssetKeyForStoryProp(propForAsset, environmentAssetsRef.current.packId);
    if (propAssetKey) {
      const propSize = {
        ...(PROP_GROUNDING_CONFIG[propForAsset.type] || { width: 72, height: 72, yOffset: 0, alpha: 0.78, depth: 'midground', tint: 'warm' }),
        ...(STORY_PROP_GROUNDING_OVERRIDES[prop.id] || {}),
        ...(Number.isFinite(propForAsset.width) ? { width: propForAsset.width } : {}),
        ...(Number.isFinite(propForAsset.height) ? { height: propForAsset.height } : {}),
        ...(Number.isFinite(propForAsset.yOffset) ? { yOffset: propForAsset.yOffset } : {}),
        ...(Number.isFinite(propForAsset.alpha) ? { alpha: propForAsset.alpha } : {}),
        ...(Number.isFinite(propForAsset.shadow) ? { shadow: propForAsset.shadow } : {}),
        ...(Number.isFinite(propForAsset.dust) ? { dust: propForAsset.dust } : {}),
        ...(Number.isFinite(propForAsset.bury) ? { bury: propForAsset.bury } : {}),
        ...(propForAsset.depth ? { depth: propForAsset.depth } : {}),
        ...(propForAsset.tint ? { tint: propForAsset.tint } : {}),
      };
      if (propDepth === 'grounded') {
        propSize.depth = 'grounded';
        propSize.alpha = Math.max(propSize.alpha ?? 0.82, 0.86);
        propSize.shadow = Math.max(propSize.shadow ?? 0.14, 0.2);
        propSize.dust = Math.max(propSize.dust ?? 0.72, 0.84);
        propSize.bury = Math.max(propSize.bury ?? 0.12, 0.2);
      }
      const propAssets = sacredTrapPropAssetKey
        ? sacredTrapEnvironmentAssetsRef.current
        : atmospherePropAssetKey
          ? atmosphereEnvironmentAssetsRef.current
          : environmentAssetsRef.current;
      const drawX = x - propSize.width / 2;
      const rawAnchorY = prop.y + (propSize.yOffset || 0);
      const anchorY = propDepth === 'grounded'
        ? Math.max(rawAnchorY, GROUND_Y - ATMOSPHERE_GROUND_LOCK_MARGIN)
        : rawAnchorY;
      const drawY = anchorY - propSize.height;
      const dustWidth = propSize.width * (propSize.dust ?? 0.62);
      drawContactShadow(ctx, x, anchorY + 2, propSize.width * (propSize.depth === 'background' ? 0.62 : 0.86), propSize.shadow ?? (propSize.depth === 'background' ? 0.1 : 0.22), 1.4);
      drawDecorativeBaseBlend(ctx, x, anchorY + 2, dustWidth, section.id, propSize.depth, propSize.depth === 'background' ? 0.72 : 0.9);
      ctx.globalAlpha = propSize.alpha ?? 0.82;
      if (propSize.depth === 'route-edge') {
        ctx.filter = 'sepia(2%) saturate(122%) brightness(112%) contrast(116%)';
        ctx.shadowColor = 'rgba(35, 21, 10, 0.62)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
      } else if (propSize.tint === 'stone') {
        ctx.filter = propSize.depth === 'background'
          ? 'sepia(14%) saturate(62%) brightness(82%) contrast(92%)'
          : 'sepia(8%) saturate(78%) brightness(90%)';
      } else if (propSize.tint === 'cool') {
        ctx.filter = 'saturate(62%) brightness(78%) contrast(90%)';
      } else if (propSize.tint === 'dust') {
        ctx.filter = 'sepia(20%) saturate(58%) brightness(84%) contrast(88%)';
      } else if (propSize.tint === 'buried-stone') {
        ctx.filter = 'sepia(28%) saturate(72%) brightness(78%) contrast(88%)';
      } else {
        ctx.filter = propSize.depth === 'background'
          ? 'sepia(18%) saturate(62%) brightness(84%) contrast(92%)'
          : 'sepia(10%) saturate(86%) brightness(92%)';
      }
      const drawn = drawAtlasRegion(
        ctx,
        propAssets,
        propAssetKey,
        {
          x: drawX,
          y: drawY,
          width: propSize.width,
          height: propSize.height,
        },
        { mode: 'contain' },
      );
      if (drawn) {
        ctx.filter = 'none';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = 1;
        drawDecorativeBaseBlend(ctx, x, anchorY + 1, dustWidth, section.id, propSize.depth, propSize.depth === 'background' ? 0.6 : 0.86);
        drawGroundDustLip(ctx, x, anchorY + 1, dustWidth, propSize.depth === 'background' ? 'rgba(187, 128, 64, 0.12)' : 'rgba(187, 128, 64, 0.22)');
        if (propSize.bury) {
          const buryHeight = Math.max(8, propSize.height * propSize.bury);
          const sand = ctx.createLinearGradient(0, anchorY - buryHeight, 0, anchorY + 8);
          sand.addColorStop(0, 'rgba(218, 155, 75, 0)');
          sand.addColorStop(0.42, 'rgba(205, 139, 61, 0.54)');
          sand.addColorStop(1, 'rgba(134, 82, 35, 0.72)');
          ctx.fillStyle = sand;
          ctx.beginPath();
          ctx.ellipse(x, anchorY - buryHeight * 0.22, dustWidth * 0.54, buryHeight * 0.38, -0.04, 0, Math.PI * 2);
          ctx.fill();
          drawGroundDustLip(ctx, x, anchorY - buryHeight * 0.52, dustWidth * 0.68, 'rgba(231, 172, 91, 0.34)');
        }
        if (stateRef.current.renderStats) stateRef.current.renderStats.groundedPropCount += 1;
        if (atmospherePropAssetKey && stateRef.current.renderStats) {
          stateRef.current.renderStats.atmospherePropCount += 1;
          if (propDepth === 'grounded') stateRef.current.renderStats.groundLockedAtmospherePropCount += 1;
        }
        ctx.restore();
        return;
      }
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha *= propDepth === 'background' ? 0.5 : 0.78;
    if (prop.type === 'ruins') {
      drawContactShadow(ctx, x, prop.y + 66, 108, 0.12, 1.4);
      drawDecorativeBaseBlend(ctx, x, prop.y + 66, 86, section.id, propDepth, 0.7);
      ctx.fillStyle = 'rgba(92, 64, 51, 0.32)';
      ctx.fillRect(x - 52, prop.y + 18, 104, 48);
      ctx.fillStyle = 'rgba(48, 31, 21, 0.28)';
      [-34, -12, 12, 34].forEach(offset => ctx.fillRect(x + offset, prop.y - 16, 14, 82));
      ctx.strokeStyle = 'rgba(255, 244, 212, 0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 60, prop.y - 18);
      ctx.lineTo(x, prop.y - 48);
      ctx.lineTo(x + 60, prop.y - 18);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (prop.type === 'door') {
      drawContactShadow(ctx, x, prop.y + 160, 128, 0.12, 1.4);
      drawDecorativeBaseBlend(ctx, x, prop.y + 160, 92, section.id, propDepth, 0.7);
      ctx.fillStyle = 'rgba(42, 28, 20, 0.62)';
      ctx.fillRect(x - 62, prop.y, 124, 158);
      ctx.fillStyle = 'rgba(140, 98, 54, 0.68)';
      ctx.fillRect(x - 76, prop.y - 18, 152, 24);
      [-54, 54].forEach(offset => {
        ctx.fillStyle = 'rgba(92, 64, 51, 0.8)';
        ctx.fillRect(x + offset - 14, prop.y, 28, 160);
        ctx.strokeStyle = 'rgba(255, 236, 180, 0.22)';
        ctx.strokeRect(x + offset - 10, prop.y + 12, 20, 42);
        ctx.strokeRect(x + offset - 10, prop.y + 66, 20, 42);
      });
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.28)';
      ctx.lineWidth = 4;
      ctx.strokeRect(x - 36, prop.y + 24, 72, 112);
      ctx.restore();
      return;
    }
    if (prop.type === 'statue') {
      drawContactShadow(ctx, x, prop.y + 84, 86, 0.14, 1.4);
      drawDecorativeBaseBlend(ctx, x, prop.y + 84, 68, section.id, propDepth, 0.7);
      ctx.fillStyle = 'rgba(71, 85, 105, 0.62)';
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(x - 24, prop.y - 28, 48, 32, 8);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(x - 34, prop.y + 2, 68, 70, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(20, 184, 166, 0.55)';
      ctx.fillRect(x - 8, prop.y + 24, 16, 16);
      ctx.fillStyle = 'rgba(71, 85, 105, 0.62)';
      ctx.fillRect(x - 48, prop.y + 68, 96, 14);
      ctx.restore();
      return;
    }
    if (prop.type === 'mural') {
      drawDecorativeBaseBlend(ctx, x, prop.y + 64, 140, section.id, propDepth, 0.46);
      ctx.fillStyle = 'rgba(49, 32, 21, 0.55)';
      ctx.fillRect(x - 88, prop.y - 26, 176, 92);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.34)';
      ctx.lineWidth = 2;
      for (let i = -64; i <= 64; i += 32) {
        ctx.strokeRect(x + i - 10, prop.y - 4, 20, 28);
        ctx.beginPath();
        ctx.moveTo(x + i - 14, prop.y + 42);
        ctx.lineTo(x + i + 14, prop.y + 32);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.22)';
      ctx.strokeRect(x - 78, prop.y - 18, 156, 76);
      ctx.restore();
      return;
    }
    if (prop.type === 'camp') {
      drawContactShadow(ctx, x, prop.y + 38, 88, 0.14, 1.4);
      drawDecorativeBaseBlend(ctx, x, prop.y + 38, 66, section.id, propDepth, 0.72);
      ctx.fillStyle = 'rgba(120, 53, 15, 0.45)';
      ctx.fillRect(x - 38, prop.y + 18, 76, 18);
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.55)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 46, prop.y + 18);
      ctx.lineTo(x - 18, prop.y - 18);
      ctx.lineTo(x + 12, prop.y + 18);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (prop.type === 'cart') {
      drawContactShadow(ctx, x, prop.y + 20, 92, 0.14, 1.3);
      drawDecorativeBaseBlend(ctx, x, prop.y + 22, 78, section.id, propDepth, 0.66);
      ctx.fillStyle = 'rgba(120, 53, 15, 0.46)';
      ctx.fillRect(x - 42, prop.y - 8, 72, 22);
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.56)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 48, prop.y - 14);
      ctx.lineTo(x + 38, prop.y + 10);
      ctx.stroke();
      [-24, 24].forEach((offset) => {
        ctx.fillStyle = 'rgba(41, 24, 12, 0.58)';
        ctx.beginPath();
        ctx.arc(x + offset, prop.y + 20, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.18)';
        ctx.stroke();
      });
      ctx.fillStyle = 'rgba(245, 158, 11, 0.42)';
      ctx.fillRect(x - 18, prop.y - 20, 30, 12);
      ctx.restore();
      return;
    }
    if (prop.type === 'glyphs') {
      drawDecorativeBaseBlend(ctx, x, prop.y + 62, 140, section.id, propDepth, 0.42);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.52)';
      ctx.fillRect(x - 82, prop.y - 30, 164, 90);
      ctx.strokeStyle = `rgba(125, 211, 252, ${0.38 + Math.sin(now / 350) * 0.12})`;
      ctx.lineWidth = 2;
      for (let i = -54; i <= 54; i += 36) {
        ctx.beginPath();
        ctx.arc(x + i, prop.y + 6, 12, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.strokeRect(x + i - 8, prop.y + 30, 16, 16);
      }
      ctx.restore();
      return;
    }
    if (prop.type === 'eyes') {
      ctx.fillStyle = `rgba(125, 211, 252, ${0.28 + Math.sin(now / 280) * 0.12})`;
      [-16, 16].forEach(offset => {
        ctx.beginPath();
        ctx.ellipse(x + offset, prop.y, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      return;
    }
    if (prop.type === 'bridge') {
      drawContactShadow(ctx, x, prop.y + 50, 164, 0.18, 1.2);
      drawDecorativeBaseBlend(ctx, x, prop.y + 50, 128, section.id, propDepth, 0.76);
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.62)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x - 90, prop.y + 34);
      ctx.lineTo(x + 90, prop.y + 22);
      ctx.stroke();
      ctx.lineWidth = 3;
      for (let i = -70; i <= 70; i += 28) {
        ctx.beginPath();
        ctx.moveTo(x + i, prop.y + 16);
        ctx.lineTo(x + i + 10, prop.y + 44);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    if (prop.type === 'sign') {
      if (!DRAW_JOURNEY_FLAG_MARKERS) {
        if (stateRef.current.renderStats) {
          stateRef.current.renderStats.journeyFlagVisualMode = JOURNEY_FLAG_VISUAL_MODE;
          stateRef.current.renderStats.removedRouteFlagCount += 1;
        }
        ctx.restore();
        return;
      }
      const flagHeight = 104;
      const flagWidth = 96;
      const flagBaseY = prop.y + 42;
      drawForegroundSettlingDetails(ctx, x, flagBaseY + 1, 74, section.id, {
        intensity: propDepth === 'background' ? 0.52 : 0.78,
        seed: Math.round(prop.x),
        stones: 4,
      });
      drawContactShadow(ctx, x, flagBaseY + 1, 52, 0.15, 1);
      const flagDest = {
        x: x - flagWidth / 2,
        y: flagBaseY - flagHeight,
        width: flagWidth,
        height: flagHeight,
      };
      const flagDrawn = drawMarkerSprite(
        ctx,
        markerSpriteAssetsRef.current,
        'flag',
        flagDest,
        0,
      );
      if (flagDrawn) {
        const assets = markerSpriteAssetsRef.current;
        const fixedPoleRegion = assets?.atlas?.regions?.flag_00;
        if (assets?.image && fixedPoleRegion) {
          const containScale = Math.min(flagDest.width / fixedPoleRegion.w, flagDest.height / fixedPoleRegion.h);
          const renderedWidth = fixedPoleRegion.w * containScale;
          const renderedHeight = fixedPoleRegion.h * containScale;
          const renderX = flagDest.x + (flagDest.width - renderedWidth) / 2;
          const renderY = flagDest.y + (flagDest.height - renderedHeight) / 2;
          const poleSourceWidth = fixedPoleRegion.w * 0.38;
          ctx.drawImage(
            assets.image,
            fixedPoleRegion.x,
            fixedPoleRegion.y,
            poleSourceWidth,
            fixedPoleRegion.h,
            renderX,
            renderY,
            poleSourceWidth * containScale,
            renderedHeight,
          );
        }
        ctx.fillStyle = 'rgba(92, 49, 18, 0.34)';
        ctx.beginPath();
        ctx.roundRect(x - 10, flagBaseY - 4, 20, 10, 4);
        ctx.fill();
        ctx.fillStyle = 'rgba(180, 116, 52, 0.34)';
        ctx.beginPath();
        ctx.ellipse(x - 15, flagBaseY + 1, 8, 4, -0.2, 0, Math.PI * 2);
        ctx.ellipse(x + 14, flagBaseY + 2, 9, 4, 0.15, 0, Math.PI * 2);
        ctx.fill();
        drawDecorativeBaseBlend(ctx, x, flagBaseY + 2, 66, section.id, propDepth, 0.62);
        drawGroundDustLip(ctx, x, flagBaseY + 1, 54, 'rgba(187, 128, 64, 0.22)');
        if (stateRef.current.renderStats) stateRef.current.renderStats.groundedPropCount += 1;
        ctx.restore();
        return;
      }
      drawDecorativeBaseBlend(ctx, x, prop.y + 36, 64, section.id, propDepth, 0.6);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x - 3, prop.y - 20, 6, 56);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(x - 22, prop.y - 18);
      ctx.lineTo(x + 22, prop.y - 18);
      ctx.lineTo(x, prop.y + 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(x - 3, prop.y - 8, 6, 14);
      ctx.restore();
      return;
    }
    if (prop.type === 'footprints') {
      drawDecorativeBaseBlend(ctx, x, prop.y + 10, 150, section.id, propDepth, 0.42);
      ctx.fillStyle = 'rgba(92, 64, 51, 0.18)';
      for (let i = 0; i < 7; i += 1) {
        const offsetX = i * 18 - 60;
        const offsetY = (i % 2) * 8;
        ctx.beginPath();
        ctx.ellipse(x + offsetX, prop.y + offsetY, 7, 3.2, -0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + offsetX + 8, prop.y + offsetY + 4, 6, 3, -0.08, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }
    if (prop.type === 'survey-rope') {
      drawDecorativeBaseBlend(ctx, x, prop.y + 20, 128, section.id, propDepth, 0.5);
      const sag = Math.sin(now / 520 + prop.x * 0.01) * 2;
      ctx.strokeStyle = 'rgba(92, 49, 18, 0.5)';
      ctx.lineWidth = 3;
      [-56, 56].forEach(offset => {
        ctx.fillStyle = 'rgba(69, 26, 3, 0.48)';
        ctx.fillRect(x + offset - 2, prop.y - 20, 4, 44);
      });
      ctx.beginPath();
      ctx.moveTo(x - 56, prop.y - 8);
      ctx.quadraticCurveTo(x, prop.y + 4 + sag, x + 56, prop.y - 8);
      ctx.stroke();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      [-56, 56].forEach(offset => {
        ctx.beginPath();
        ctx.moveTo(x + offset + 2, prop.y - 20);
        ctx.lineTo(x + offset + 24, prop.y - 15 + sag);
        ctx.lineTo(x + offset + 2, prop.y - 8);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();
      return;
    }
    if (prop.type === 'banners') {
      drawDecorativeBaseBlend(ctx, x, prop.y + 58, 76, section.id, propDepth, 0.52);
      [-24, 24].forEach(offset => {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x + offset, prop.y - 38, 4, 96);
        ctx.fillStyle = offset < 0 ? '#0f766e' : '#b45309';
        ctx.fillRect(x + offset + 4, prop.y - 34, 26, 44);
      });
      ctx.restore();
      return;
    }
    if (prop.type === 'ruins' || prop.type === 'statue') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.font = 'bold 80px serif';
      ctx.fillText(prop.type === 'ruins' ? '🏛️' : '🗿', x, prop.y + 40);
    } else if (prop.type === 'lights') {
      const pulse = Math.sin(now / 400) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(254, 240, 138, ${0.4 * pulse})`;
      ctx.beginPath();
      ctx.arc(x, prop.y + 20, 120, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }, [drawContactShadow, drawDecorativeBaseBlend, drawForegroundSettlingDetails, drawGroundDustLip]);

  const drawWorldContinuityLandmark = useCallback((ctx, landmark, cameraX, now) => {
    const parallax = landmark.parallax ?? 0.2;
    const section = getSectionForX(landmark.x);
    const viewSection = getSectionForX(cameraX + CANVAS_WIDTH / 2);
    if (section.id !== viewSection.id) return false;
    if (section.id === 'desert-entry' && ['gate', 'tower'].includes(landmark.type)) return false;

    const width = landmark.width || 120;
    const height = landmark.height || 100;
    const sectionWidth = Math.max(1, section.end - section.start);
    const sectionProgress = clamp((cameraX - section.start) / Math.max(1, sectionWidth - CANVAS_WIDTH), 0, 1);
    const localAnchor = ((landmark.x - section.start) / sectionWidth) * CANVAS_WIDTH;
    const x = 120 + localAnchor - sectionProgress * CANVAS_WIDTH * parallax;
    if (x < -width || x > CANVAS_WIDTH + width) return false;

    const baseY = landmark.y + height;
    const pulse = 0.78 + Math.sin(now / 900 + landmark.x * 0.002) * 0.08;

    ctx.save();
    ctx.globalAlpha = landmark.type === 'excavation-camp' ? 0.58 : 0.38;
    drawDecorativeBaseBlend(ctx, x, baseY, width * 0.78, section.id, 'background', 0.38);

    if (landmark.type === 'mountains') {
      ctx.fillStyle = 'rgba(37, 62, 79, 0.34)';
      ctx.beginPath();
      ctx.moveTo(x - width * 0.58, baseY - height * 0.06);
      ctx.lineTo(x - width * 0.32, baseY - height * 0.92);
      ctx.lineTo(x - width * 0.08, baseY - height * 0.24);
      ctx.lineTo(x + width * 0.18, baseY - height);
      ctx.lineTo(x + width * 0.52, baseY - height * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.16)';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (landmark.type === 'tower') {
      ctx.fillStyle = 'rgba(61, 45, 31, 0.54)';
      ctx.fillRect(x - width * 0.18, baseY - height, width * 0.36, height);
      ctx.fillRect(x - width * 0.32, baseY - height * 0.28, width * 0.64, height * 0.28);
      ctx.strokeStyle = 'rgba(255, 236, 179, 0.18)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - width * 0.36, baseY - height);
      ctx.lineTo(x, baseY - height * 1.16);
      ctx.lineTo(x + width * 0.36, baseY - height);
      ctx.stroke();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.18)';
      ctx.fillRect(x - 8, baseY - height * 0.72, 16, 22);
    } else if (landmark.type === 'gate') {
      const ruinGradient = ctx.createLinearGradient(x, baseY - height, x, baseY);
      ruinGradient.addColorStop(0, 'rgba(123, 82, 42, 0.2)');
      ruinGradient.addColorStop(1, 'rgba(86, 55, 31, 0.34)');
      ctx.fillStyle = ruinGradient;
      [
        { left: -0.39, right: -0.22, lean: -0.04 },
        { left: 0.22, right: 0.39, lean: 0.035 },
      ].forEach((pillar) => {
        ctx.beginPath();
        ctx.moveTo(x + width * (pillar.left + pillar.lean), baseY - height * 0.82);
        ctx.lineTo(x + width * (pillar.right + pillar.lean), baseY - height * 0.8);
        ctx.lineTo(x + width * pillar.right, baseY - height * 0.08);
        ctx.lineTo(x + width * pillar.left, baseY - height * 0.04);
        ctx.closePath();
        ctx.fill();
      });
      ctx.fillStyle = 'rgba(139, 92, 45, 0.24)';
      ctx.beginPath();
      ctx.moveTo(x - width * 0.5, baseY - height * 0.86);
      ctx.lineTo(x - width * 0.18, baseY - height * 0.96);
      ctx.lineTo(x + width * 0.47, baseY - height * 0.85);
      ctx.lineTo(x + width * 0.4, baseY - height * 0.74);
      ctx.lineTo(x - width * 0.48, baseY - height * 0.72);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(111, 78, 42, 0.28)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, baseY - height * 0.22, width * 0.25, Math.PI, 0);
      ctx.stroke();
    } else if (landmark.type === 'bridge') {
      ctx.strokeStyle = 'rgba(80, 43, 24, 0.5)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x - width * 0.5, baseY - height * 0.48);
      ctx.lineTo(x - width * 0.12, baseY - height * 0.62);
      ctx.moveTo(x + width * 0.04, baseY - height * 0.66);
      ctx.lineTo(x + width * 0.52, baseY - height * 0.5);
      ctx.stroke();
      ctx.lineWidth = 2;
      for (let i = -4; i <= 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x + i * 22, baseY - height * 0.7);
        ctx.lineTo(x + i * 22 + 8, baseY - height * 0.38);
        ctx.stroke();
      }
    } else if (landmark.type === 'guardian-ruin') {
      ctx.fillStyle = 'rgba(98, 74, 48, 0.3)';
      ctx.beginPath();
      ctx.moveTo(x - width * 0.3, baseY - height * 0.1);
      ctx.lineTo(x - width * 0.24, baseY - height * 0.62);
      ctx.lineTo(x + width * 0.04, baseY - height * 0.72);
      ctx.lineTo(x + width * 0.3, baseY - height * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x - width * 0.2, baseY - height * 0.92, width * 0.4, height * 0.22, 8);
      ctx.fill();
      ctx.fillStyle = `rgba(45, 212, 191, ${0.14 * pulse})`;
      ctx.beginPath();
      ctx.ellipse(x, baseY - height * 0.46, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.16)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - width * 0.32, baseY - height * 0.11);
      ctx.lineTo(x + width * 0.32, baseY - height * 0.14);
      ctx.stroke();
    } else if (landmark.type === 'excavation-camp') {
      ctx.fillStyle = `rgba(254, 240, 138, ${0.18 * pulse})`;
      ctx.beginPath();
      ctx.arc(x, baseY - height * 0.5, width * 0.52, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.48)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - width * 0.34, baseY - height * 0.15);
      ctx.lineTo(x - width * 0.08, baseY - height * 0.62);
      ctx.lineTo(x + width * 0.22, baseY - height * 0.15);
      ctx.stroke();
      [-34, 8, 44].forEach((offset) => {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.58)';
        ctx.beginPath();
        ctx.arc(x + offset, baseY - height * 0.42, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (landmark.type === 'shrine') {
      ctx.fillStyle = `rgba(45, 212, 191, ${0.16 * pulse})`;
      ctx.beginPath();
      ctx.arc(x, baseY - height * 0.46, width * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(31, 41, 55, 0.48)';
      ctx.beginPath();
      ctx.roundRect(x - width * 0.24, baseY - height * 0.78, width * 0.48, height * 0.68, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(204, 251, 241, 0.24)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - width * 0.34, baseY - height * 0.78);
      ctx.lineTo(x, baseY - height);
      ctx.lineTo(x + width * 0.34, baseY - height * 0.78);
      ctx.stroke();
      ctx.fillStyle = `rgba(250, 204, 21, ${0.2 * pulse})`;
      ctx.fillRect(x - 7, baseY - height * 0.56, 14, 20);
    } else if (landmark.type === 'blocked-tunnel') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.44)';
      ctx.beginPath();
      ctx.ellipse(x, baseY - height * 0.26, width * 0.48, height * 0.4, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.22)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, baseY - height * 0.26, width * 0.34, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
      for (let i = 0; i < 7; i += 1) {
        ctx.beginPath();
        ctx.ellipse(x - width * 0.32 + i * width * 0.1, baseY - height * 0.18 + (i % 2) * 6, 8, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const stats = stateRef.current.renderStats;
    if (stats) {
      stats.visibleWorldLandmarks = Array.from(new Set([...(stats.visibleWorldLandmarks || []), landmark.id])).slice(-12);
    }
    ctx.restore();
    return true;
  }, [drawDecorativeBaseBlend]);

  const drawWorldTransitionMarker = useCallback((ctx, marker, cameraX, now) => {
    const x = worldToScreenX(marker.x, cameraX);
    if (x < -90 || x > CANVAS_WIDTH + 90) return false;
    const pulse = 0.7 + Math.sin(now / 420 + marker.x * 0.01) * 0.12;
    const baseY = GROUND_Y - 26;
    ctx.save();
    ctx.globalAlpha = 0.48;
    ctx.strokeStyle = 'rgba(255, 247, 212, 0.38)';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(x, 88);
    ctx.lineTo(x, baseY);
    ctx.stroke();
    ctx.setLineDash([]);
    drawContactShadow(ctx, x, baseY + 28, 96, 0.12, 1.2);
    ctx.fillStyle = `rgba(250, 204, 21, ${0.18 * pulse})`;
    ctx.beginPath();
    ctx.arc(x, baseY - 32, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 26, baseY - 2);
    ctx.lineTo(x - 4, baseY - 62);
    ctx.lineTo(x + 28, baseY - 2);
    ctx.stroke();
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x - 34, baseY - 6, 68, 10);
    const stats = stateRef.current.renderStats;
    if (stats) {
      stats.visibleTransitionStoryMarkers = Array.from(new Set([...(stats.visibleTransitionStoryMarkers || []), marker.id])).slice(-8);
    }
    ctx.restore();
    return true;
  }, [drawContactShadow]);

  const drawStageEntranceFeature = useCallback((ctx, feature, cameraX, now) => {
    const centerX = worldToScreenX(feature.x, cameraX);
    const width = feature.width || CANVAS_WIDTH * 1.12;
    const height = feature.height || CANVAS_HEIGHT;
    if (centerX < -width * 0.58 || centerX > CANVAS_WIDTH + width * 0.58) return false;

    const doorwayAsset = feature.assetKey === 'desertEndGateway'
      ? desertEndGatewayRef.current
      : stageEntranceDoorwayRef.current;
    if (!doorwayAsset.loaded || !doorwayAsset.image) return false;

    const drawX = centerX - width / 2;
    const drawY = Math.min(0, CANVAS_HEIGHT - height);
    const floorY = Math.min(GROUND_Y + 6, drawY + height - 26);
    const sectionId = feature.to || getSectionForX(feature.x).id;
    const pulse = 0.72 + Math.sin(now / 580 + feature.x * 0.006) * 0.08;
    const revealDistance = Math.abs(centerX - CANVAS_WIDTH * 0.5);
    const focus = clamp(1 - revealDistance / (CANVAS_WIDTH * 0.72), 0, 1);
    const current = stateRef.current;
    const routeGate = ROUTE_GATES.find(item => item.id === feature.routeGateId);
    const doorwayUnlocked = !routeGate || current.openedRouteGateIds?.has(routeGate.id) || areRouteGateRequirementsMetForState(routeGate, current);
    const passageVisual = feature.passageVisual || {};
    const doorwayCenterX = drawX + width * (passageVisual.centerX ?? 0.5);
    const doorwayCenterY = drawY + height * (passageVisual.centerY ?? 0.54);
    const doorwayRadiusX = width * (passageVisual.radiusX ?? 0.14);
    const doorwayRadiusY = height * (passageVisual.radiusY ?? 0.25);

    ctx.save();
    drawRouteGroundApron(ctx, centerX, floorY - 2, width * 0.72, sectionId, 0.78, Math.round(feature.x));
    drawContactShadow(ctx, centerX, floorY + 2, width * 0.62, 0.28, 1.22);
    ctx.save();
    ctx.filter = STAGE_ENTRANCE_THEME_FILTERS[feature.structureTheme] || 'drop-shadow(0 16px 16px rgba(34, 18, 8, 0.24))';
    ctx.drawImage(doorwayAsset.image, drawX, drawY, width, height);
    ctx.restore();

    if (feature.structureTheme === 'cool-catacomb-descent') {
      ctx.globalAlpha = 0.18 + focus * 0.1;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.fillRect(drawX + width * 0.38, drawY + height * 0.18, width * 0.24, height * 0.7);
      ctx.globalAlpha = 1;
    } else if (feature.structureTheme === 'collapsed-breach') {
      ctx.globalAlpha = 0.2 + focus * 0.14;
      ctx.fillStyle = 'rgba(249, 115, 22, 0.2)';
      ctx.beginPath();
      ctx.moveTo(centerX - width * 0.18, drawY + height * 0.2);
      ctx.lineTo(centerX + width * 0.2, drawY + height * 0.48);
      ctx.lineTo(centerX - width * 0.08, drawY + height * 0.78);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (feature.structureTheme === 'open-dig-site-threshold') {
      ctx.globalAlpha = 0.14 + focus * 0.1;
      ctx.fillStyle = 'rgba(134, 239, 172, 0.18)';
      ctx.fillRect(drawX + width * 0.32, drawY + height * 0.2, width * 0.36, height * 0.68);
      ctx.globalAlpha = 1;
    }

    const vignette = ctx.createRadialGradient(doorwayCenterX, doorwayCenterY, width * 0.08, doorwayCenterX, doorwayCenterY, width * 0.5);
    vignette.addColorStop(0, `rgba(20, 184, 166, ${doorwayUnlocked ? 0.08 + focus * 0.1 : 0.03})`);
    vignette.addColorStop(0.5, 'rgba(20, 10, 5, 0)');
    vignette.addColorStop(1, `rgba(18, 10, 6, ${0.08 + focus * 0.18})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(drawX, drawY, width, height);

    ctx.globalAlpha = doorwayUnlocked ? 0.18 + focus * 0.16 + pulse * 0.04 : 0.32 + focus * 0.08;
    ctx.fillStyle = doorwayUnlocked ? 'rgba(8, 18, 24, 0.72)' : 'rgba(18, 13, 9, 0.82)';
    ctx.beginPath();
    ctx.ellipse(doorwayCenterX, doorwayCenterY, doorwayRadiusX, doorwayRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (!doorwayUnlocked) {
      const lockPulse = 0.7 + Math.sin(now / 260) * 0.12;
      ctx.globalAlpha = 0.78;
      ctx.fillStyle = 'rgba(30, 19, 10, 0.72)';
      ctx.beginPath();
      ctx.roundRect(doorwayCenterX - 38, doorwayCenterY - 34, 76, 76, 12);
      ctx.fill();
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.48 + lockPulse * 0.24})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = `rgba(250, 204, 21, ${0.34 + lockPulse * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(doorwayCenterX, doorwayCenterY + 2, 22, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    drawGroundDustLip(ctx, centerX, floorY, width * 0.72, 'rgba(216, 154, 82, 0.26)');
    const stats = stateRef.current.renderStats;
    if (stats) {
      stats.visibleStageEntranceFeatures = Array.from(new Set([...(stats.visibleStageEntranceFeatures || []), feature.id])).slice(-6);
    }
    ctx.restore();
    return true;
  }, [drawContactShadow, drawGroundDustLip, drawRouteGroundApron]);

  const drawStageEntranceForegroundOccluder = useCallback((ctx, feature, cameraX) => {
    const occluders = feature.foregroundOccluders || (feature.foregroundOccluder ? [feature.foregroundOccluder] : []);
    if (!occluders.length) return false;
    const doorwayAsset = feature.assetKey === 'desertEndGateway'
      ? desertEndGatewayRef.current
      : stageEntranceDoorwayRef.current;
    if (!doorwayAsset.loaded || !doorwayAsset.image) return false;
    const centerX = worldToScreenX(feature.x, cameraX);
    const width = feature.width || CANVAS_WIDTH * 1.12;
    const height = feature.height || CANVAS_HEIGHT;
    if (centerX < -width * 0.58 || centerX > CANVAS_WIDTH + width * 0.58) return false;

    const drawX = centerX - width / 2;
    const drawY = Math.min(0, CANVAS_HEIGHT - height);
    const current = stateRef.current;
    const playerCenterX = current.player.x + current.player.width / 2;
    const passageVisual = feature.passageVisual || {};
    const doorwayCenterX = drawX + width * (passageVisual.centerX ?? 0.5);
    let drewLayer = false;

    occluders.forEach((occluder) => {
      const sourceX = doorwayAsset.image.width * occluder.sourceX;
      const sourceY = doorwayAsset.image.height * occluder.sourceY;
      const sourceWidth = doorwayAsset.image.width * occluder.sourceWidth;
      const sourceHeight = doorwayAsset.image.height * occluder.sourceHeight;
      const destX = drawX + width * occluder.destX;
      const destY = drawY + height * occluder.destY;
      const destWidth = width * occluder.destWidth;
      const destHeight = height * occluder.destHeight;
      const nearRadius = occluder.nearRadius ?? width * 0.18;
      const playerNearAmount = clamp(1 - Math.abs(worldToScreenX(playerCenterX, cameraX) - doorwayCenterX) / nearRadius, 0, 1);
      const layerAlpha = (occluder.alpha ?? 1) * (occluder.onlyWhenPlayerNear ? playerNearAmount : 1);

      if (layerAlpha <= 0.02) return;
      ctx.save();
      ctx.globalAlpha = layerAlpha;
      ctx.filter = STAGE_ENTRANCE_THEME_FILTERS[feature.structureTheme] || 'drop-shadow(0 16px 16px rgba(34, 18, 8, 0.24))';
      ctx.drawImage(
        doorwayAsset.image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destX,
        destY,
        destWidth,
        destHeight,
      );
      ctx.restore();
      drewLayer = true;
    });
    return drewLayer;
  }, []);

  const drawConnectedWorldAmbientLife = useCallback((ctx, section, cameraX, now) => {
    const stats = stateRef.current.renderStats;
    let details = 0;
    const time = now / 1000;
    const addDetail = () => {
      details += 1;
    };

    ctx.save();
    if (section.id !== 'catacombs') {
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.32)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i += 1) {
        const x = ((i * 230 + time * 18 + cameraX * 0.05) % (CANVAS_WIDTH + 160)) - 80;
        const y = 80 + i * 18 + Math.sin(time * 0.8 + i) * 8;
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x, y - 4);
        ctx.lineTo(x + 8, y);
        ctx.stroke();
        addDetail();
      }
    }

    const markerXs = section.id === 'desert-entry'
      ? [520, 1260]
      : section.id === 'ruined-temple'
        ? [1605, 2890]
        : section.id === 'catacombs'
          ? [3440, 4250]
          : section.id === 'escape-sequence'
            ? [5315, 6260]
            : [6700, 7505];
    markerXs.forEach((baseWorldX, index) => {
      const worldX = scaleJourneyX(baseWorldX);
      const x = worldToScreenX(worldX, cameraX);
      if (x < -70 || x > CANVAS_WIDTH + 70) return;
      addDetail();
      const drift = Math.sin(time * 1.6 + index + baseWorldX * 0.01) * 9;
      ctx.fillStyle = section.id === 'catacombs'
        ? 'rgba(125, 211, 252, 0.13)'
        : 'rgba(244, 202, 134, 0.12)';
      ctx.beginPath();
      ctx.ellipse(x + drift, GROUND_Y - 58 - index * 10, 44, 5, -0.12, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    if (details > 0 && stats) {
      stats.connectedWorldAmbientDetails = details;
    }
    return details;
  }, []);

  const drawDynamicEnvironmentEvent = useCallback((ctx, event, cameraX, now, timer = 0) => {
    if (!event || timer <= 0) return false;
    const x = worldToScreenX(event.x, cameraX);
    if (x < -220 || x > CANVAS_WIDTH + 220) return false;
    const preview = Boolean(event.preview);
    const progress = preview
      ? 0.62 + Math.sin(now / 520 + event.x * 0.003) * 0.1
      : clamp(timer / Math.max(0.1, event.duration || 1), 0, 1);
    const reveal = preview ? 0.46 + Math.sin(now / 620 + event.x * 0.004) * 0.18 : 1 - progress;
    const visibility = preview ? 0.62 : 1;
    const pulse = 0.75 + Math.sin(now / 220 + event.x * 0.01) * 0.18;
    const baseY = GROUND_Y - 46;
    const recordVisibleEvent = () => {
      const stats = stateRef.current.renderStats;
      if (stats) {
        stats.visibleDynamicWorldEvents = Array.from(new Set([...(stats.visibleDynamicWorldEvents || []), event.id])).slice(-8);
      }
    };

    ctx.save();
    const effectAssets = dynamicWorldAssetsRef.current;
    const effectRegion = getDynamicWorldEffectRegion(event.type);
    if (usesPaintedDynamicWorldEffect(event.type) && effectAssets.loaded && effectAssets.image && effectRegion) {
      const assetAlpha = (preview ? 0.82 : 1) * (0.82 + pulse * 0.12);
      const drawEffect = (width, height, offsetX, offsetY, options = {}) => {
        ctx.save();
        ctx.globalAlpha = clamp(assetAlpha * (options.alpha ?? 1), 0, 1);
        if (options.flipX) {
          ctx.translate(x + offsetX + width / 2, baseY + offsetY + height / 2);
          ctx.scale(-1, 1);
          ctx.drawImage(
            effectAssets.image,
            effectRegion.x,
            effectRegion.y,
            effectRegion.w,
            effectRegion.h,
            -width / 2,
            -height / 2,
            width,
            height,
          );
        } else {
          ctx.drawImage(
            effectAssets.image,
            effectRegion.x,
            effectRegion.y,
            effectRegion.w,
            effectRegion.h,
            x + offsetX,
            baseY + offsetY,
            width,
            height,
          );
        }
        ctx.restore();
      };

      if (event.type === 'dust-gust' || event.type === 'moving-fog' || event.type === 'unstable-excavation') {
        drawEffect(360 + pulse * 16, 230 + pulse * 8, -180 + reveal * 34, -205, { alpha: event.type === 'moving-fog' ? 0.72 : 0.96 });
        ctx.restore();
        recordVisibleEvent();
        return true;
      }
      if (event.type === 'birds-scatter') {
        drawEffect(290 + reveal * 34, 190 + reveal * 12, -120 + reveal * 48, -370 - reveal * 28, { alpha: 0.98 });
        ctx.restore();
        recordVisibleEvent();
        return true;
      }
      if (event.type === 'shrine-glow') {
        ctx.globalCompositeOperation = 'screen';
        drawEffect(250 + pulse * 28, 280 + pulse * 24, -126, -330, { alpha: 0.86 });
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
        recordVisibleEvent();
        return true;
      }
      if (event.type === 'rockfall' || event.type === 'ruin-collapse') {
        drawEffect(300 + reveal * 20, 320 + reveal * 16, -146, -322 + reveal * 10, { alpha: 0.95 });
        ctx.restore();
        recordVisibleEvent();
        return true;
      }
    }

    if (event.type === 'rockfall') {
      ctx.globalAlpha = 0.58 * progress * visibility;
      ctx.fillStyle = 'rgba(100, 76, 52, 0.66)';
      for (let i = 0; i < 7; i += 1) {
        const fall = reveal * (50 + i * 18);
        ctx.beginPath();
        ctx.ellipse(x + i * 18 - 54, baseY - 150 + fall, 4 + (i % 3), 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(217, 161, 88, 0.26)';
      ctx.beginPath();
      ctx.ellipse(x, baseY - 16, 128 + reveal * 44, 13, -0.08, 0, Math.PI * 2);
      ctx.fill();
    } else if (event.type === 'dust-gust' || event.type === 'moving-fog') {
      const fog = event.type === 'moving-fog';
      ctx.globalAlpha = (fog ? 0.42 : 0.66) * progress * visibility;
      ctx.fillStyle = fog ? 'rgba(191, 219, 254, 0.28)' : 'rgba(245, 158, 11, 0.32)';
      for (let i = 0; i < 6; i += 1) {
        const drift = reveal * (110 + i * 26);
        ctx.beginPath();
        ctx.ellipse(x - 120 + drift + i * 38, fog ? GROUND_Y - 170 + i * 16 : GROUND_Y - 108 + i * 12, 112 - i * 6, fog ? 14 : 10, -0.08, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!fog) {
        ctx.strokeStyle = 'rgba(255, 247, 212, 0.38)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i += 1) {
          const drift = reveal * (90 + i * 24);
          ctx.beginPath();
          ctx.moveTo(x - 150 + drift, GROUND_Y - 130 + i * 17);
          ctx.quadraticCurveTo(x - 45 + drift, GROUND_Y - 146 + i * 10, x + 92 + drift, GROUND_Y - 118 + i * 12);
          ctx.stroke();
        }
      }
    } else if (event.type === 'birds-scatter') {
      ctx.globalAlpha = 0.78 * progress * visibility;
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.58)';
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 6; i += 1) {
        const bx = x + reveal * (70 + i * 16) + i * 16;
        const by = GROUND_Y - 270 - reveal * (50 + i * 5) + Math.sin(now / 120 + i) * 6;
        ctx.beginPath();
        ctx.moveTo(bx - 10, by);
        ctx.lineTo(bx, by - 4);
        ctx.lineTo(bx + 10, by);
        ctx.stroke();
      }
    } else if (event.type === 'ruin-collapse') {
      ctx.globalAlpha = 0.5 * progress * visibility;
      ctx.fillStyle = 'rgba(61, 45, 31, 0.58)';
      ctx.fillRect(x - 30, baseY - 170 + reveal * 18, 24, 132);
      ctx.fillRect(x + 14, baseY - 138 + reveal * 26, 22, 98);
      ctx.fillStyle = 'rgba(190, 119, 62, 0.32)';
      for (let i = 0; i < 8; i += 1) {
        ctx.beginPath();
        ctx.ellipse(x - 60 + i * 18, baseY - 32 + reveal * i * 5, 5, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (event.type === 'shrine-glow') {
      ctx.globalAlpha = 0.92 * progress * visibility;
      const glow = ctx.createRadialGradient(x, baseY - 126, 8, x, baseY - 126, 92 * pulse);
      glow.addColorStop(0, 'rgba(250, 204, 21, 0.46)');
      glow.addColorStop(0.42, 'rgba(45, 212, 191, 0.24)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, baseY - 126, 92 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(204, 251, 241, 0.34)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, baseY - 126, 28 + reveal * 18, 0, Math.PI * 2);
      ctx.stroke();
    } else if (event.type === 'unstable-excavation') {
      ctx.globalAlpha = 0.64 * progress * visibility;
      ctx.strokeStyle = 'rgba(137, 104, 72, 0.36)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x - 80 + i * 34, baseY - 8);
        ctx.lineTo(x - 62 + i * 34 + Math.sin(now / 80 + i) * 5, baseY + 14);
        ctx.lineTo(x - 42 + i * 34, baseY + 6);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(217, 161, 88, 0.16)';
      ctx.beginPath();
      ctx.ellipse(x, baseY + 10, 118, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.restore();
      return false;
    }
    ctx.restore();

    recordVisibleEvent();
    return true;
  }, []);

  const drawEnvironmentInteraction = useCallback((ctx, item, cameraX, now, current) => {
    if (current.brokenEnvironmentIds?.has(item.id)) return;
    if (!isHorizontallyVisible(item.x, item.width, cameraX, 90)) return;
    const x = worldToScreenX(item.x, cameraX);
    const section = getSectionForX(item.x);
    const wobble = Math.sin(now / 420 + item.x * 0.01);
    const touched = current.triggeredEnvironmentIds?.has(item.id);

    ctx.save();
    ctx.globalAlpha = touched ? 0.9 : 0.78;
    if (item.type === 'breakable-crate') {
      drawContactShadow(ctx, x + item.width / 2, item.y + item.height + 4, item.width * 0.9, 0.16, 1.2);
      drawDecorativeBaseBlend(ctx, x + item.width / 2, item.y + item.height + 4, item.width * 0.8, section.id, 'midground', 0.66);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x, item.y, item.width, item.height);
      ctx.strokeStyle = touched ? '#fde68a' : '#451a03';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 3, item.y + 3, item.width - 6, item.height - 6);
      ctx.beginPath();
      ctx.moveTo(x + 6, item.y + item.height - 6);
      ctx.lineTo(x + item.width - 6, item.y + 6);
      ctx.stroke();
    } else if (item.type === 'loose-rocks') {
      drawDecorativeBaseBlend(ctx, x + item.width / 2, item.y + item.height, item.width, section.id, 'midground', 0.58);
      ctx.fillStyle = touched ? 'rgba(148, 163, 184, 0.72)' : 'rgba(100, 76, 52, 0.62)';
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.ellipse(x + 8 + i * 14, item.y + 15 + (i % 2) * 5, 8 + (i % 2) * 2, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (item.type === 'hanging-rope') {
      const sway = wobble * 10;
      ctx.strokeStyle = 'rgba(92, 49, 18, 0.68)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + item.width / 2, item.y);
      ctx.quadraticCurveTo(x + item.width / 2 + sway, item.y + item.height * 0.48, x + item.width / 2 - sway * 0.3, item.y + item.height);
      ctx.stroke();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
      ctx.beginPath();
      ctx.arc(x + item.width / 2 - sway * 0.3, item.y + item.height, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === 'swinging-banner') {
      const sway = wobble * 8;
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + item.width / 2 - 2, item.y, 4, item.height);
      ctx.fillStyle = touched ? '#f59e0b' : '#b45309';
      ctx.beginPath();
      ctx.moveTo(x + item.width / 2 + 4, item.y + 8);
      ctx.quadraticCurveTo(x + item.width + sway, item.y + 26, x + item.width / 2 + 6, item.y + 62);
      ctx.closePath();
      ctx.fill();
    } else if (item.type === 'collapsing-bridge') {
      drawContactShadow(ctx, x + item.width / 2, item.y + item.height + 4, item.width, 0.18, 1.2);
      ctx.strokeStyle = touched ? 'rgba(137, 104, 72, 0.72)' : 'rgba(69, 26, 3, 0.66)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x, item.y + 16 + wobble * 2);
      ctx.lineTo(x + item.width * 0.38, item.y + 8);
      ctx.moveTo(x + item.width * 0.48, item.y + 10);
      ctx.lineTo(x + item.width, item.y + 22 - wobble * 2);
      ctx.stroke();
    } else if (item.type === 'watchtower-section') {
      drawContactShadow(ctx, x + item.width / 2, item.y + item.height + 4, item.width * 0.8, 0.12, 1.2);
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.62)';
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 14, item.y, item.width - 28, item.height);
      ctx.lineWidth = 2;
      for (let rung = 18; rung < item.height - 8; rung += 20) {
        ctx.beginPath();
        ctx.moveTo(x + 14, item.y + rung);
        ctx.lineTo(x + item.width - 14, item.y + rung + wobble * 1.2);
        ctx.stroke();
      }
    } else if (item.type === 'rippling-water') {
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.42)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.ellipse(x + item.width / 2 + wobble * 10, item.y + 5 + i * 6, item.width * (0.26 + i * 0.09), 3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (item.type === 'blowing-grass') {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.46)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i += 1) {
        const bladeX = x + i * 10;
        ctx.beginPath();
        ctx.moveTo(bladeX, item.y + item.height);
        ctx.quadraticCurveTo(bladeX + wobble * 7, item.y + item.height * 0.44, bladeX + 3 + wobble * 9, item.y + 2);
        ctx.stroke();
      }
    }

    const stats = stateRef.current.renderStats;
    if (stats) {
      stats.visibleEnvironmentInteractions = Array.from(new Set([...(stats.visibleEnvironmentInteractions || []), item.id])).slice(-12);
    }
    ctx.restore();
  }, [drawContactShadow, drawDecorativeBaseBlend]);

  const drawHiddenRouteHint = useCallback((ctx, route, cameraX, current, now) => {
    if (!isHorizontallyVisible(route.x, route.width, cameraX, 80)) return;
    const x = worldToScreenX(route.x, cameraX);
    const discovered = current.discoveredHiddenRouteIds?.has(route.id);
    const access = getRouteAccessState(route, current);
    const locked = access.locked;
    const routeCenterX = x + route.width * 0.5;
    const labelX = clamp(routeCenterX, 130, CANVAS_WIDTH - 130);
    const pulse = 0.78 + Math.sin(now / 360 + route.x * 0.002) * 0.18;
    const useNaturalUpperRouteHint = route.id === 'desert-upper-survey-route';
    ctx.save();
    if (useNaturalUpperRouteHint) {
      const baseY = route.y + route.height - 5;
      const sandTrail = ctx.createLinearGradient(x, baseY - 38, x, baseY + 8);
      sandTrail.addColorStop(0, 'rgba(226, 167, 91, 0)');
      sandTrail.addColorStop(0.55, discovered ? 'rgba(226, 172, 84, 0.2)' : 'rgba(206, 143, 69, 0.16)');
      sandTrail.addColorStop(1, 'rgba(130, 79, 36, 0.22)');
      ctx.globalAlpha = discovered ? 0.84 : locked ? 0.66 : 0.58;
      ctx.fillStyle = sandTrail;
      ctx.beginPath();
      ctx.ellipse(routeCenterX, baseY - 7, Math.min(210, route.width * 0.32), 22, -0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = discovered
        ? `rgba(250, 204, 21, ${0.13 * pulse})`
        : `rgba(166, 105, 48, ${0.12 * pulse})`;
      ctx.beginPath();
      ctx.ellipse(routeCenterX + 26, baseY - 15, Math.min(120, route.width * 0.18), 9, -0.05, 0, Math.PI * 2);
      ctx.fill();
      const stoneColor = discovered ? 'rgba(142, 91, 45, 0.34)' : 'rgba(119, 76, 42, 0.26)';
      [-210, -132, -54, 38, 128, 214].forEach((offset, index) => {
        const stoneX = routeCenterX + offset;
        if (stoneX < -30 || stoneX > CANVAS_WIDTH + 30) return;
        ctx.fillStyle = stoneColor;
        ctx.beginPath();
        ctx.ellipse(stoneX, baseY - 10 + (index % 2) * 4, 18 - (index % 3) * 3, 6, 0.08, 0, Math.PI * 2);
        ctx.fill();
      });
      if (!discovered && !locked) {
        ctx.restore();
        return;
      }
    } else {
      ctx.globalAlpha = discovered ? 0.78 : locked ? 0.5 : 0.42;
      ctx.fillStyle = discovered
        ? 'rgba(250, 204, 21, 0.08)'
        : locked
          ? 'rgba(14, 116, 144, 0.08)'
          : 'rgba(15, 23, 42, 0.08)';
      ctx.strokeStyle = discovered
        ? 'rgba(250, 204, 21, 0.74)'
        : locked
          ? 'rgba(125, 211, 252, 0.48)'
          : 'rgba(255, 247, 212, 0.34)';
      ctx.lineWidth = discovered ? 2.5 : locked ? 2 : 1.5;
      ctx.setLineDash(discovered ? [] : locked ? [12, 7, 3, 7] : [8, 9]);
      ctx.beginPath();
      ctx.roundRect(x, route.y, route.width, route.height, 14);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = discovered
        ? `rgba(250, 204, 21, ${0.2 * pulse})`
        : locked
          ? `rgba(125, 211, 252, ${0.16 * pulse})`
          : `rgba(255, 247, 212, ${0.13 * pulse})`;
      ctx.beginPath();
      ctx.ellipse(x + route.width * 0.5, route.y + route.height - 10, Math.min(120, route.width * 0.34), 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (discovered || locked) {
      const routeLabel = discovered ? 'Hidden route mapped' : `Needs ${getShopItemDisplayName(access.requiredUpgradeId)}`;
      ctx.font = '800 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      const labelWidth = Math.min(250, ctx.measureText(routeLabel).width + 26);
      const labelY = route.y - 28;
      ctx.globalAlpha = discovered ? 0.92 : 0.88;
      ctx.fillStyle = discovered ? 'rgba(63, 47, 10, 0.74)' : 'rgba(8, 26, 39, 0.76)';
      ctx.beginPath();
      ctx.roundRect(labelX - labelWidth / 2, labelY, labelWidth, 24, 8);
      ctx.fill();
      ctx.strokeStyle = discovered ? 'rgba(250, 204, 21, 0.62)' : 'rgba(186, 230, 253, 0.58)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 247, 212, 0.88)';
      ctx.fillText(routeLabel, labelX, labelY + 16);
      if (locked && Math.abs(current.player.x - (route.x + route.width * 0.5)) < 260 && route.gateType) {
        ctx.font = '700 10px Inter, sans-serif';
        const hintText = `${route.gateType} - optional reward`;
        const hintWidth = Math.min(240, ctx.measureText(hintText).width + 20);
        const hintY = route.y + route.height + 6;
        ctx.fillStyle = 'rgba(8, 26, 39, 0.62)';
        ctx.beginPath();
        ctx.roundRect(labelX - hintWidth / 2, hintY, hintWidth, 20, 7);
        ctx.fill();
        ctx.fillStyle = 'rgba(186, 230, 253, 0.9)';
        ctx.fillText(hintText, labelX, hintY + 14);
      }
    }
    if (locked) {
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.62)';
      ctx.beginPath();
      ctx.roundRect(labelX - 14, route.y + 10, 28, 24, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(labelX, route.y + 21, 6, Math.PI, 0);
      ctx.stroke();
      ctx.strokeRect(labelX - 7, route.y + 19, 14, 9);
    }
    ctx.restore();
  }, [getRouteAccessState]);

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

  const drawEgyptAmbientLife = useCallback((ctx, section, cameraX, now) => {
    if (backgroundPackId === 'china-river-valley') return 0;
    let activeDetails = 0;
    const stats = stateRef.current.renderStats;
    const time = now / 1000;
    const baseX = (x) => scaleJourneyX(x);
    const baseY = (y) => y + JOURNEY_VERTICAL_OFFSET;
    const parallaxX = (x, factor = 0.22) => scaleJourneyX(x) - cameraX * factor;
    const drawSoftDust = (worldX, baseY, width, alpha = 0.18, speed = 1) => {
      const x = worldToScreenX(worldX, cameraX);
      if (x < -width || x > CANVAS_WIDTH + width) return;
      activeDetails += 1;
      ctx.save();
      ctx.fillStyle = `rgba(244, 202, 134, ${alpha})`;
      for (let i = 0; i < 4; i += 1) {
        const drift = ((time * 22 * speed + i * 41 + worldX * 0.01) % width) - width / 2;
        const y = baseY - 8 - i * 4 + Math.sin(time * 1.4 + i + worldX * 0.004) * 4;
        ctx.beginPath();
        ctx.ellipse(x + drift, y, 18 + i * 5, 3.2, -0.08, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };
    const drawDistantExpeditionWorker = (authoredX, y, options = {}) => {
      const x = parallaxX(authoredX, options.parallax ?? 0.18);
      if (x < -80 || x > CANVAS_WIDTH + 80) return;
      activeDetails += 1;
      const scale = options.scale ?? 0.62;
      const walk = Math.sin(time * (options.speed ?? 1.1) + authoredX * 0.02);
      const bodyY = baseY(y);
      ctx.save();
      ctx.globalAlpha = options.alpha ?? 0.42;
      ctx.translate(x, bodyY);
      ctx.scale(scale, scale);
      ctx.strokeStyle = 'rgba(69, 42, 18, 0.62)';
      ctx.fillStyle = 'rgba(49, 32, 21, 0.56)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -28, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = options.hatColor || 'rgba(250, 204, 21, 0.5)';
      ctx.fillRect(-10, -36, 20, 4);
      ctx.strokeStyle = options.clothColor || 'rgba(120, 53, 15, 0.56)';
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, -14);
      ctx.lineTo(8, -8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-7 + walk * 3, 16);
      ctx.moveTo(0, 0);
      ctx.lineTo(8 - walk * 3, 16);
      ctx.stroke();
      if (options.carryingCrate) {
        ctx.fillStyle = 'rgba(120, 53, 15, 0.45)';
        ctx.fillRect(8, -18, 18, 13);
        ctx.strokeStyle = 'rgba(69, 26, 3, 0.42)';
        ctx.strokeRect(8, -18, 18, 13);
      }
      ctx.restore();
    };
    const drawKneelingSurveyor = (authoredX, y) => {
      const x = parallaxX(authoredX, 0.2);
      if (x < -80 || x > CANVAS_WIDTH + 80) return;
      activeDetails += 1;
      const hand = Math.sin(time * 2.2 + authoredX * 0.01) * 3;
      ctx.save();
      ctx.globalAlpha = 0.46;
      ctx.translate(x, baseY(y));
      ctx.scale(0.58, 0.58);
      ctx.fillStyle = 'rgba(49, 32, 21, 0.58)';
      ctx.beginPath();
      ctx.arc(0, -24, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.48)';
      ctx.fillRect(-10, -32, 20, 4);
      ctx.strokeStyle = 'rgba(69, 42, 18, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(-10, -2);
      ctx.lineTo(8, 4);
      ctx.moveTo(-5, -8);
      ctx.lineTo(16 + hand, -3);
      ctx.stroke();
      ctx.fillStyle = 'rgba(22, 101, 52, 0.36)';
      ctx.fillRect(18, -5, 13, 4);
      ctx.restore();
    };
    const drawTentFlap = (authoredX, y, width = 72) => {
      const x = parallaxX(authoredX, 0.16);
      if (x < -120 || x > CANVAS_WIDTH + 120) return;
      activeDetails += 1;
      const flap = Math.sin(time * 2.8 + authoredX * 0.02) * 6;
      ctx.save();
      ctx.globalAlpha = 0.34;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
      ctx.strokeStyle = 'rgba(92, 49, 18, 0.28)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - width / 2, baseY(y));
      ctx.lineTo(x, baseY(y - 42));
      ctx.lineTo(x + width / 2, baseY(y));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 247, 212, 0.18)';
      ctx.beginPath();
      ctx.moveTo(x - 4, baseY(y - 34));
      ctx.quadraticCurveTo(x + 16 + flap, baseY(y - 18), x + 4, baseY(y));
      ctx.lineTo(x - 5, baseY(y));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    const drawRopedDigActivity = (authoredX, y) => {
      const x = parallaxX(authoredX, 0.21);
      if (x < -120 || x > CANVAS_WIDTH + 120) return;
      activeDetails += 1;
      const brush = Math.sin(time * 3.4 + authoredX * 0.01) * 5;
      ctx.save();
      ctx.globalAlpha = 0.36;
      ctx.strokeStyle = 'rgba(92, 49, 18, 0.42)';
      ctx.lineWidth = 2;
      [-38, 38].forEach(offset => {
        ctx.fillStyle = 'rgba(69, 26, 3, 0.38)';
        ctx.fillRect(x + offset - 2, baseY(y - 24), 4, 30);
      });
      ctx.beginPath();
      ctx.moveTo(x - 38, baseY(y - 18));
      ctx.quadraticCurveTo(x, baseY(y - 9), x + 38, baseY(y - 18));
      ctx.stroke();
      ctx.fillStyle = 'rgba(92, 64, 51, 0.26)';
      ctx.beginPath();
      ctx.ellipse(x, baseY(y + 6), 32, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(69, 42, 18, 0.52)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x - 12, baseY(y - 30), 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 12, baseY(y - 24));
      ctx.lineTo(x - 20, baseY(y - 8));
      ctx.moveTo(x - 16, baseY(y - 14));
      ctx.lineTo(x + 2 + brush, baseY(y - 4));
      ctx.stroke();
      ctx.restore();
    };
    const drawFlutterPennant = (worldX, y, color = '#facc15') => {
      if (!DRAW_JOURNEY_FLAG_MARKERS) {
        if (stats) {
          stats.journeyFlagVisualMode = JOURNEY_FLAG_VISUAL_MODE;
          stats.removedRouteFlagCount += 1;
        }
        return;
      }
      const x = worldToScreenX(worldX, cameraX);
      if (x < -80 || x > CANVAS_WIDTH + 80) return;
      activeDetails += 1;
      const flutter = Math.sin(time * 5.4 + worldX * 0.02) * 5;
      ctx.save();
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.52)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 26);
      ctx.lineTo(x, y + 22);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + 2, y - 24);
      ctx.quadraticCurveTo(x + 28, y - 28 + flutter, x + 44, y - 18);
      ctx.quadraticCurveTo(x + 22, y - 14 - flutter * 0.3, x + 2, y - 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    const drawTinyRubble = (worldX, y, color = 'rgba(136, 90, 48, 0.42)') => {
      const x = worldToScreenX(worldX, cameraX);
      if (x < -80 || x > CANVAS_WIDTH + 80) return;
      activeDetails += 1;
      ctx.save();
      ctx.fillStyle = color;
      for (let i = 0; i < 5; i += 1) {
        const fall = (time * 34 + i * 23 + worldX * 0.015) % 72;
        ctx.beginPath();
        ctx.ellipse(x + i * 15 - 30, y + fall, 3 + (i % 2), 2.2, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };
    const drawGlowPulse = (worldX, y, color, radius = 72) => {
      const x = worldToScreenX(worldX, cameraX);
      if (x < -radius || x > CANVAS_WIDTH + radius) return;
      activeDetails += 1;
      const pulse = 0.72 + Math.sin(time * 3 + worldX * 0.01) * 0.18;
      const glow = ctx.createRadialGradient(x, y, 4, x, y, radius * pulse);
      glow.addColorStop(0, color);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.save();
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    if (section.id === 'desert-entry') {
      drawTentFlap(128, 154, 92);
      drawTentFlap(182, 160, 74);
      drawDistantExpeditionWorker(150, 188, { carryingCrate: true, scale: 0.5, parallax: 0.18, speed: 0.72 });
      drawKneelingSurveyor(206, 190);
      drawRopedDigActivity(245, 206);
      drawDistantExpeditionWorker(320, 198, { scale: 0.44, parallax: 0.14, alpha: 0.32, clothColor: 'rgba(15, 118, 110, 0.44)' });
      [250, 360, 640, 790, 960, 1260].forEach((x, index) => drawSoftDust(baseX(x), GROUND_Y - 6, 118 + index * 8, index < 2 ? 0.1 : 0.14, index < 2 ? 0.55 : 0.75));
      [250, 520, 650, 885, 1260, 1360].forEach((x, index) => drawFlutterPennant(baseX(x), baseY(306), index % 2 ? '#f59e0b' : '#facc15'));
      if (stats) stats.ambientLifeMode = 'desert-survey-camp-life';
    } else if (section.id === 'ruined-temple') {
      [1605, 2145, 2890].forEach((x, index) => drawFlutterPennant(baseX(x), baseY(306), index === 2 ? '#dc2626' : '#d97706'));
      [1860, 2640].forEach(x => drawGlowPulse(baseX(x), baseY(232), 'rgba(250, 204, 21, 0.16)', 84));
      [1715, 2380, 2925].forEach(x => drawTinyRubble(baseX(x), baseY(236), 'rgba(164, 113, 61, 0.34)'));
      if (stats) stats.ambientLifeMode = 'temple-torch-and-stone-motion';
    } else if (section.id === 'catacombs') {
      [3440, 4020, 4250].forEach(x => drawGlowPulse(baseX(x), baseY(232), 'rgba(125, 211, 252, 0.18)', 92));
      [3195, 3985, 4740].forEach((x, index) => drawFlutterPennant(baseX(x), baseY(306), index === 2 ? '#dc2626' : '#38bdf8'));
      [3705, 4310].forEach(x => drawSoftDust(baseX(x), baseY(326), 100, 0.1, 0.45));
      if (stats) stats.ambientLifeMode = 'catacomb-glyph-and-torch-motion';
    } else if (section.id === 'escape-sequence') {
      [5200, 5315, 5600, 6030, 6260].forEach((x, index) => {
        if (index % 2 === 0) drawTinyRubble(baseX(x), baseY(220), 'rgba(190, 119, 62, 0.42)');
        drawSoftDust(baseX(x), GROUND_Y - 6, 150, 0.18, 1.25);
      });
      [5315, 5600, 6260].forEach(x => drawFlutterPennant(baseX(x), baseY(306), '#dc2626'));
      if (stats) stats.ambientLifeMode = 'escape-dust-and-warning-motion';
    } else if (section.id === 'dig-site-entrance') {
      [6700, 7505].forEach(x => drawGlowPulse(baseX(x), baseY(288), 'rgba(254, 240, 138, 0.2)', 120));
      [6750, 6870, 7040, 7330].forEach((x, index) => drawFlutterPennant(baseX(x), baseY(306), index === 3 ? '#dc2626' : '#22c55e'));
      [6680, 6870, 7330].forEach(x => drawSoftDust(baseX(x), GROUND_Y - 5, 130, 0.12, 0.55));
      if (stats) stats.ambientLifeMode = 'base-camp-survey-activity';
    }

    if (activeDetails > 0 && stats) {
      stats.ambientLifePassActive = true;
      stats.ambientLifeVersion = EGYPT_AMBIENT_LIFE_VERSION;
      stats.ambientLifeDetailCount = activeDetails;
    }
    return activeDetails;
  }, [backgroundPackId]);

  const drawCollectibleSpriteGlow = useCallback((ctx, screenX, centerY, now, color, options = {}) => {
    const pulse = Math.sin(now / (options.pulseSpeed || 340)) * 0.22 + 0.78;
    const ringKey = options.ringKey || 'availableGlowRing';
    const ringSize = options.ringSize || 46;
    ctx.save();
    ctx.globalAlpha = options.alpha ?? 0.68;
    ctx.shadowColor = color;
    ctx.shadowBlur = options.shadowBlur || 14;
    const drawnRing = drawCollectibleAtlasRegion(
      ctx,
      collectibleSpriteAssetsRef.current,
      ringKey,
      {
        x: screenX - ringSize / 2,
        y: centerY - ringSize / 2,
        width: ringSize,
        height: ringSize,
      },
    );
    if (!drawnRing) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenX, centerY, (ringSize / 2 - 4) * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  const recordCollectibleSprite = useCallback((kind, key) => {
    const stats = stateRef.current.renderStats;
    if (!stats || !key) return;
    const field = {
      tool: 'visibleToolSprites',
      shard: 'visibleShardSprites',
      upgrade: 'visibleUpgradeSprites',
      objective: 'visibleObjectiveSprites',
    }[kind];
    if (!field) return;
    stats[field] = Array.from(new Set([...(stats[field] || []), key])).slice(-16);
  }, []);

  const drawCollectible = useCallback((ctx, x, y, cameraX, now, label, color, hidden = false, isShard = false, sprite = {}) => {
    const screenX = worldToScreenX(x, cameraX);
    if (!isHorizontallyVisible(x, 1, cameraX, 80)) return;
    const spriteKey = sprite.key || null;
    const spriteKind = sprite.kind || (isShard ? 'shard' : null);
    const spriteSize = sprite.size || (isShard ? 34 : 42);
    const bobAmplitude = sprite.bobAmplitude ?? (isShard ? 2 : 3);
    const floatY = Math.sin((now / 260) + x) * bobAmplitude;
    const baseY = sprite.baseY ?? (y + (sprite.anchorYOffset ?? (isShard ? 18 : 22)));
    const centerY = sprite.anchor === 'center'
      ? y + floatY
      : baseY - spriteSize / 2 + floatY;
    const current = stateRef.current;
    const playerCenterX = current.player.x + current.player.width / 2;
    const nearPlayer = Math.abs(playerCenterX - x) < (sprite.nearGlowDistance ?? 130);
    const glowAlpha = hidden
      ? 0.12
      : nearPlayer
        ? (sprite.glowAlpha ?? 0.28)
        : (sprite.glowAlpha ?? 0.28) * 0.45;
    if (current.renderStats) current.renderStats.visibleCollectibleCount += 1;
    ctx.save();
    ctx.globalAlpha = hidden ? 0.25 : 1;

    if (spriteKey && collectibleSpriteAssetsRef.current.loaded) {
      drawContactShadow(ctx, screenX, baseY + 1, sprite.shadowWidth || spriteSize * 0.72, hidden ? 0.06 : (sprite.shadowAlpha ?? 0.15), 0.85);
      if (!sprite.hideGlow && (sprite.ringSize ?? spriteSize + 8) > 0 && glowAlpha > 0) {
        drawCollectibleSpriteGlow(ctx, screenX, centerY + (sprite.glowYOffset || 0), now, color, {
          ringKey: sprite.ringKey || (spriteKind === 'objective' ? 'objectiveHighlightRing' : 'availableGlowRing'),
          ringSize: sprite.ringSize || spriteSize + 8,
          alpha: glowAlpha,
          shadowBlur: sprite.shadowBlur ?? (isShard ? 5 : 8),
        });
      }

      if (spriteKind !== 'objective' && (nearPlayer || !isShard)) {
        const sparkleSize = sprite.sparkleSize ?? (isShard ? 9 : 11);
        const sparkleOffset = Math.sin(now / 310 + x) * 1.5;
        ctx.globalAlpha = hidden ? 0.08 : (sprite.sparkleAlpha ?? 0.18);
        drawCollectibleAtlasRegion(
          ctx,
          collectibleSpriteAssetsRef.current,
          'pickupSparkle',
          {
            x: screenX + spriteSize * 0.22,
            y: centerY - spriteSize * 0.72 + sparkleOffset,
            width: sparkleSize,
            height: sparkleSize,
          },
        );
        ctx.globalAlpha = hidden ? 0.25 : 1;
      }

      const drawn = drawCollectibleAtlasRegion(
        ctx,
        collectibleSpriteAssetsRef.current,
        spriteKey,
        {
          x: screenX - spriteSize / 2,
          y: centerY - spriteSize / 2,
          width: spriteSize,
          height: spriteSize,
        },
      );

      if (drawn) {
        recordCollectibleSprite(spriteKind, spriteKey);
        ctx.restore();
        return;
      }
    }

    // Core glow (Dynamic)
    const pulse = Math.sin(now / 300) * 0.3 + 0.7;
    const innerGlow = ctx.createRadialGradient(screenX, centerY, 0, screenX, centerY, 25 * pulse);
    innerGlow.addColorStop(0, `${color}88`);
    innerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(screenX, centerY, 25 * pulse, 0, Math.PI * 2);
    ctx.fill();

    if (spriteKind === 'objective') {
      drawContactShadow(ctx, screenX, baseY + 1, 34, 0.12, 0.8);
      ctx.shadowColor = 'rgba(69, 26, 3, 0.36)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#b89768';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(screenX - 14, centerY - 12, 28, 24, 4);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.56)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(screenX - 8, centerY - 3);
      ctx.lineTo(screenX + 8, centerY - 6);
      ctx.moveTo(screenX - 7, centerY + 5);
      ctx.lineTo(screenX + 6, centerY + 4);
      ctx.stroke();
    } else if (isShard) {
      // Amber archaeology shard with carved glyph lines.
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12 * pulse;
      
      const shardColor = ctx.createLinearGradient(screenX - 12, centerY - 14, screenX + 12, centerY + 16);
      shardColor.addColorStop(0, '#fff7ad');
      shardColor.addColorStop(0.45, '#f59e0b');
      shardColor.addColorStop(1, '#78350f');
      
      ctx.fillStyle = shardColor;
      ctx.beginPath();
      ctx.moveTo(screenX - 2, centerY - 16);
      ctx.lineTo(screenX + 13, centerY - 4);
      ctx.lineTo(screenX + 7, centerY + 15);
      ctx.lineTo(screenX - 12, centerY + 8);
      ctx.lineTo(screenX - 9, centerY - 8);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.82)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(screenX - 3, centerY - 8);
      ctx.lineTo(screenX + 5, centerY - 2);
      ctx.moveTo(screenX - 5, centerY + 4);
      ctx.lineTo(screenX + 4, centerY + 8);
      ctx.stroke();
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 12;
      
      // Premium Token
      const tokenGrad = ctx.createRadialGradient(screenX, centerY, 5, screenX, centerY, 20);
      tokenGrad.addColorStop(0, '#fffcf0');
      tokenGrad.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = tokenGrad;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(screenX - 18, centerY - 18, 36, 36, 8);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = '800 20px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(label, screenX, centerY + 7);
    }
    ctx.restore();
  }, [drawCollectibleSpriteGlow, drawContactShadow, recordCollectibleSprite]);

  const drawDesertEntryBackground = useCallback((ctx, section, cameraX) => {
    const isNearDesertEntry = section.id === 'desert-entry';
    const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'desert-entry');
    if (!isNearDesertEntry || !assets?.ready) return false;

    const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
    if (assets.atlas?.runtimeMode === 'single-composited-backdrop') {
      const backdropDrawn = drawDesertBackgroundLayer(
        ctx,
        assets,
        'sky',
        { y: 0, height: CANVAS_HEIGHT },
        { ...layerOptions, parallax: 0, alpha: 1 },
      );
      return backdropDrawn;
    }

    const drawn = [
      drawDesertBackgroundLayer(ctx, assets, 'sky', { y: 0, height: CANVAS_HEIGHT }, { ...layerOptions, parallax: 0, alpha: 1 }),
      drawDesertBackgroundLayer(ctx, assets, 'farDunes', { y: 0, height: CANVAS_HEIGHT }, { ...layerOptions, parallax: 0.035, alpha: 0.78 }),
      drawDesertBackgroundLayer(ctx, assets, 'distantRuins', { y: 0, height: CANVAS_HEIGHT }, { ...layerOptions, parallax: 0.1, alpha: 0.68 }),
    ];
    return drawn.every(Boolean);
  }, []);

  const drawChinaRiverValleyBackground = useCallback((ctx, cameraX) => {
    if (backgroundPackId !== 'china-river-valley') return false;
    const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'china-river-valley');
    if (!assets?.ready) return false;
    const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
    if (assets.atlas?.runtimeMode === 'single-composited-backdrop') {
      const backdropDrawn = drawDesertBackgroundLayer(
        ctx,
        assets,
        'skyLayer',
        { y: 0, height: CANVAS_HEIGHT },
        { ...layerOptions, parallax: 0, alpha: 1 },
      );
      if (!backdropDrawn) return false;

      ctx.save();
      const depthWash = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      depthWash.addColorStop(0, 'rgba(226, 238, 232, 0.03)');
      depthWash.addColorStop(0.45, 'rgba(218, 210, 181, 0.05)');
      depthWash.addColorStop(0.74, 'rgba(122, 94, 57, 0.08)');
      depthWash.addColorStop(1, 'rgba(40, 30, 20, 0.16)');
      ctx.fillStyle = depthWash;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const playableMist = ctx.createLinearGradient(0, 342, 0, 520);
      playableMist.addColorStop(0, 'rgba(226, 224, 203, 0)');
      playableMist.addColorStop(0.34, 'rgba(226, 224, 203, 0.1)');
      playableMist.addColorStop(0.72, 'rgba(172, 145, 103, 0.08)');
      playableMist.addColorStop(1, 'rgba(172, 145, 103, 0)');
      ctx.fillStyle = playableMist;
      ctx.fillRect(0, 338, CANVAS_WIDTH, 190);

      ctx.strokeStyle = 'rgba(76, 57, 32, 0.1)';
      ctx.lineWidth = 1.1;
      [514, 548, 580].forEach((y, index) => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= CANVAS_WIDTH; x += 78) {
          ctx.lineTo(x, y + Math.sin((x + cameraX * 0.12 + index * 76) * 0.014) * 3);
        }
        ctx.stroke();
      });
      ctx.restore();

      return true;
    }
    const drawn = [
      drawDesertBackgroundLayer(ctx, assets, 'skyLayer', { y: 0, height: CANVAS_HEIGHT }, { ...layerOptions, parallax: 0.01, alpha: 0.98 }),
      drawDesertBackgroundLayer(ctx, assets, 'farMountains', { y: 184, height: 228 }, { ...layerOptions, parallax: 0.06, alpha: 0.42 }),
      drawDesertBackgroundLayer(ctx, assets, 'riverValley', { y: 258, height: 224 }, { ...layerOptions, parallax: 0.14, alpha: 0.46 }),
      drawDesertBackgroundLayer(ctx, assets, 'watchtowerRidge', { y: 314, height: 236 }, { ...layerOptions, parallax: 0.24, alpha: 0.64 }),
    ];
    if (!drawn.every(Boolean)) return false;

    ctx.save();
    const skyWash = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyWash.addColorStop(0, 'rgba(225, 242, 230, 0.14)');
    skyWash.addColorStop(0.36, 'rgba(197, 211, 183, 0.08)');
    skyWash.addColorStop(0.66, 'rgba(181, 155, 105, 0.08)');
    skyWash.addColorStop(1, 'rgba(57, 43, 25, 0.16)');
    ctx.fillStyle = skyWash;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const sunX = CANVAS_WIDTH * 0.68 - (cameraX * 0.015) % 90;
    const morningGlow = ctx.createRadialGradient(sunX, 132, 8, sunX, 132, 280);
    morningGlow.addColorStop(0, 'rgba(255, 232, 178, 0.24)');
    morningGlow.addColorStop(0.46, 'rgba(244, 194, 112, 0.1)');
    morningGlow.addColorStop(1, 'rgba(244, 194, 112, 0)');
    ctx.fillStyle = morningGlow;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 330);

    const horizonBlend = ctx.createLinearGradient(0, 186, 0, 430);
    horizonBlend.addColorStop(0, 'rgba(229, 232, 211, 0)');
    horizonBlend.addColorStop(0.22, 'rgba(229, 232, 211, 0.16)');
    horizonBlend.addColorStop(0.48, 'rgba(214, 207, 177, 0.2)');
    horizonBlend.addColorStop(1, 'rgba(214, 207, 177, 0)');
    ctx.fillStyle = horizonBlend;
    ctx.fillRect(0, 180, CANVAS_WIDTH, 270);

    const valleyDust = ctx.createLinearGradient(0, 292, 0, 540);
    valleyDust.addColorStop(0, 'rgba(229, 225, 201, 0)');
    valleyDust.addColorStop(0.38, 'rgba(218, 207, 176, 0.18)');
    valleyDust.addColorStop(0.78, 'rgba(189, 165, 119, 0.2)');
    valleyDust.addColorStop(1, 'rgba(189, 165, 119, 0)');
    ctx.fillStyle = valleyDust;
    ctx.fillRect(0, 286, CANVAS_WIDTH, 270);

    const riverSheen = ctx.createLinearGradient(0, 292, 0, 410);
    riverSheen.addColorStop(0, 'rgba(174, 225, 205, 0)');
    riverSheen.addColorStop(0.46, 'rgba(174, 225, 205, 0.12)');
    riverSheen.addColorStop(1, 'rgba(48, 78, 62, 0)');
    ctx.fillStyle = riverSheen;
    ctx.fillRect(0, 286, CANVAS_WIDTH, 126);

    ctx.fillStyle = 'rgba(248, 246, 221, 0.045)';
    for (let ripple = -80; ripple < CANVAS_WIDTH + 120; ripple += 94) {
      const x = ripple - ((cameraX * 0.22) % 94);
      ctx.beginPath();
      ctx.ellipse(x, 344 + Math.sin((ripple + cameraX) * 0.018) * 5, 42, 3.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const sitePlain = ctx.createLinearGradient(0, 402, 0, CANVAS_HEIGHT);
    sitePlain.addColorStop(0, 'rgba(204, 187, 143, 0)');
    sitePlain.addColorStop(0.34, 'rgba(205, 188, 145, 0.22)');
    sitePlain.addColorStop(0.72, 'rgba(180, 151, 103, 0.34)');
    sitePlain.addColorStop(1, 'rgba(75, 52, 30, 0.16)');
    ctx.fillStyle = sitePlain;
    ctx.fillRect(0, 396, CANVAS_WIDTH, CANVAS_HEIGHT - 396);

    ctx.strokeStyle = 'rgba(103, 81, 46, 0.12)';
    ctx.lineWidth = 1.2;
    [438, 472, 508].forEach((y, index) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= CANVAS_WIDTH; x += 80) {
        ctx.lineTo(x, y + Math.sin((x + cameraX * 0.12 + index * 90) * 0.012) * 3);
      }
      ctx.stroke();
    });

    const floorVignette = ctx.createLinearGradient(0, 390, 0, CANVAS_HEIGHT);
    floorVignette.addColorStop(0, 'rgba(23, 34, 25, 0)');
    floorVignette.addColorStop(1, 'rgba(23, 22, 16, 0.18)');
    ctx.fillStyle = floorVignette;
    ctx.fillRect(0, 340, CANVAS_WIDTH, CANVAS_HEIGHT - 340);
    ctx.restore();

    return true;
  }, [backgroundPackId]);

  const drawSectionParallaxBackground = useCallback((ctx, section, cameraX) => {
    const layers = SECTION_PARALLAX_LAYERS[section.id];
    if (!layers) return false;
    const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, section.id);
    if (!assets?.ready) return false;

    const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
    const drawn = layers
      .filter(layer => !layer.foreground)
      .map(layer => drawDesertBackgroundLayer(
        ctx,
        assets,
        layer.key,
        { y: layer.y, height: layer.height },
        {
          ...layerOptions,
          parallax: layer.parallax,
          alpha: layer.alpha,
        },
      ));
    return drawn.every(Boolean);
  }, []);

  const drawSectionParallaxForeground = useCallback((ctx, section, cameraX) => {
    const layers = SECTION_PARALLAX_LAYERS[section.id]?.filter(layer => layer.foreground);
    if (!layers?.length) return false;
    const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, section.id);
    if (!assets?.ready) return false;

    const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
    const drawn = layers.map(layer => drawDesertBackgroundLayer(
      ctx,
      assets,
      layer.key,
      { y: layer.y, height: layer.height },
      {
        ...layerOptions,
        parallax: layer.parallax,
        alpha: layer.alpha,
      },
    ));
    return drawn.every(Boolean);
  }, []);

  const drawDesertForegroundAtmosphere = useCallback((ctx, section, cameraX) => {
    if (backgroundPackId === 'china-river-valley') {
      const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'china-river-valley');
      if (!assets?.ready) return false;
      if (assets.atlas?.runtimeMode === 'single-composited-backdrop') {
        ctx.save();
        const mist = ctx.createLinearGradient(0, 270, 0, 480);
        mist.addColorStop(0, 'rgba(229, 232, 211, 0)');
        mist.addColorStop(0.36, 'rgba(229, 232, 211, 0.09)');
        mist.addColorStop(0.76, 'rgba(187, 171, 132, 0.07)');
        mist.addColorStop(1, 'rgba(187, 171, 132, 0)');
        ctx.fillStyle = mist;
        ctx.fillRect(0, 270, CANVAS_WIDTH, 220);
        ctx.restore();
        return true;
      }
      const mistDrawn = [
        drawDesertBackgroundLayer(
          ctx,
          assets,
          'foregroundMist',
          { y: 260, height: 190 },
          { canvasWidth: CANVAS_WIDTH, cameraX, parallax: 0.34, alpha: 0.1 },
        ),
        drawDesertBackgroundLayer(
          ctx,
          assets,
          'foregroundMist',
          { y: 374, height: 130 },
          { canvasWidth: CANVAS_WIDTH, cameraX, parallax: 0.48, alpha: 0.08 },
        ),
      ];
      return mistDrawn.some(Boolean);
    }
    const isNearDesertEntry = section.id === 'desert-entry';
    const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'desert-entry');
    if (!isNearDesertEntry || !assets?.ready) return false;
    if (assets.atlas?.runtimeMode === 'single-composited-backdrop') {
      return drawDesertBackgroundLayer(
        ctx,
        assets,
        'dustOverlay',
        { y: 0, height: CANVAS_HEIGHT },
        { canvasWidth: CANVAS_WIDTH, cameraX, parallax: 0.14, alpha: 0.16 },
      );
    }
    const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
    const dustDrawn = drawDesertBackgroundLayer(
      ctx,
      assets,
      'foregroundAtmosphere',
      { y: 0, height: CANVAS_HEIGHT },
      { ...layerOptions, parallax: 0.38, alpha: 0.32 },
    );
    return dustDrawn;
  }, [backgroundPackId]);

  const drawTempleBackdrop = useCallback((ctx, section, cameraX) => {
    if (section.id !== 'ruined-temple') return;

    ctx.save();
    const wallGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    wallGradient.addColorStop(0, 'rgba(77, 58, 40, 0.88)');
    wallGradient.addColorStop(0.38, 'rgba(94, 70, 45, 0.9)');
    wallGradient.addColorStop(0.78, 'rgba(122, 86, 49, 0.52)');
    wallGradient.addColorStop(1, 'rgba(157, 106, 55, 0.18)');
    ctx.fillStyle = wallGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = 'rgba(20, 14, 10, 0.28)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 96);

    ctx.fillStyle = 'rgba(245, 200, 120, 0.08)';
    for (let worldX = section.start + 120; worldX < section.end; worldX += 340) {
      const x = worldX - cameraX * 0.42;
      if (x < -260 || x > CANVAS_WIDTH + 260) continue;
      ctx.beginPath();
      ctx.ellipse(x, 214, 190, 74, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(39, 25, 16, 0.42)';
    for (let worldX = section.start + 100; worldX < section.end; worldX += 210) {
      const x = worldX - cameraX;
      if (x < -120 || x > CANVAS_WIDTH + 120) continue;
      ctx.fillRect(x - 24, 100, 48, 238);
      ctx.fillStyle = 'rgba(255, 220, 142, 0.11)';
      ctx.fillRect(x - 16, 122, 32, 17);
      ctx.fillRect(x - 16, 172, 32, 17);
      ctx.fillRect(x - 16, 222, 32, 17);
      ctx.fillStyle = 'rgba(22, 15, 11, 0.38)';
      ctx.fillRect(x - 18, 266, 36, 72);
      ctx.fillStyle = 'rgba(39, 25, 16, 0.42)';
    }

    ctx.strokeStyle = 'rgba(255, 226, 160, 0.2)';
    ctx.lineWidth = 2;
    for (let worldX = section.start + 42; worldX < section.end; worldX += 120) {
      const x = worldX - cameraX;
      if (x < -80 || x > CANVAS_WIDTH + 80) continue;
      ctx.strokeRect(x, 154, 54, 28);
      ctx.beginPath();
      ctx.moveTo(x + 8, 238);
      ctx.lineTo(x + 37, 212);
      ctx.lineTo(x + 52, 240);
      ctx.stroke();
    }

    for (let worldX = section.start + 155; worldX < section.end; worldX += 360) {
      const x = worldX - cameraX;
      if (x < -140 || x > CANVAS_WIDTH + 140) continue;
      const glow = ctx.createRadialGradient(x, 248, 0, x, 248, 78);
      glow.addColorStop(0, 'rgba(251, 191, 36, 0.24)');
      glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, 248, 78, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 212, 112, 0.78)';
      ctx.fillRect(x - 3, 240, 6, 16);
    }

    ctx.fillStyle = 'rgba(63, 39, 20, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, 365);
    for (let i = 0; i <= CANVAS_WIDTH; i += 48) {
      const worldX = i + cameraX * 0.22;
      ctx.lineTo(i, 356 + Math.sin(worldX * 0.005) * 7 + Math.cos(worldX * 0.002) * 10);
    }
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, []);

  const drawRouteGate = useCallback((ctx, gate, screenX, current, complete) => {
    const gateCenter = screenX + gate.width / 2;
    const glowColor = complete ? '#22c55e' : '#f59e0b';
    const gateRequirementLabel = gate.requires?.shards
      ? `${current.relicShardCount}/${gate.requires.shards} relic shards`
      : complete ? 'Ready' : 'Locked';
    const drawGateLabel = (labelY) => {
      drawFieldNoteLabel(
        ctx,
        gateCenter,
        labelY,
        `${gate.name}: ${gateRequirementLabel}`,
        complete ? '#166534' : '#92400e',
      );
    };

    ctx.save();
    const gateHeight = 116;
    const gateWidth = 70;
    const gateTop = placeGateOnGround(gateHeight);
    drawContactShadow(ctx, gateCenter, GROUND_Y + 2, gateWidth * 0.9, complete ? 0.18 : 0.24, 1.15);
    drawDecorativeBaseBlend(ctx, gateCenter, GROUND_Y + 2, gateWidth * 0.86, getSectionForX(gate.x).id, 'midground', 0.74);

    const stone = ctx.createLinearGradient(gateCenter - gateWidth / 2, gateTop, gateCenter + gateWidth / 2, GROUND_Y);
    stone.addColorStop(0, complete ? '#d8c092' : '#b89768');
    stone.addColorStop(0.55, complete ? '#a98455' : '#806242');
    stone.addColorStop(1, '#4f3825');
    ctx.fillStyle = stone;
    ctx.strokeStyle = 'rgba(58, 35, 18, 0.76)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gateCenter - gateWidth * 0.36, GROUND_Y);
    ctx.lineTo(gateCenter - gateWidth * 0.3, gateTop + 28);
    ctx.quadraticCurveTo(gateCenter, gateTop - 8, gateCenter + gateWidth * 0.3, gateTop + 28);
    ctx.lineTo(gateCenter + gateWidth * 0.36, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = complete ? 18 : 9;
    ctx.fillStyle = complete ? 'rgba(187, 247, 208, 0.88)' : 'rgba(254, 243, 199, 0.82)';
    ctx.beginPath();
    ctx.ellipse(gateCenter, gateTop + 58, 18, 23, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(69, 26, 3, 0.62)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gateCenter - 18, gateTop + 32);
    ctx.lineTo(gateCenter + 18, gateTop + 32);
    ctx.moveTo(gateCenter - 20, gateTop + 86);
    ctx.lineTo(gateCenter + 20, gateTop + 86);
    ctx.stroke();

    ctx.fillStyle = 'rgba(69, 26, 3, 0.72)';
    ctx.beginPath();
    ctx.arc(gateCenter, gateTop + 55, 6, Math.PI, 0);
    ctx.stroke();
    ctx.fillRect(gateCenter - 7, gateTop + 55, 14, 10);
    drawGroundDustLip(ctx, gateCenter, GROUND_Y + 1, gateWidth * 0.82, 'rgba(184, 116, 52, 0.22)');
    drawGateLabel(gateTop - 18);
    if (current.renderStats) current.renderStats.groundedPropCount += 1;
    ctx.restore();
  }, [drawContactShadow, drawDecorativeBaseBlend, drawFieldNoteLabel, drawGroundDustLip]);

  const drawMissingObjectiveMarker = useCallback((ctx, guidance, cameraX, now) => {
    if (!guidance?.activeGateLocked || !guidance.nearestMissingObjective) return;
    const target = guidance.nearestMissingObjective;
    const isShardTarget = target.type === 'shards' || String(target.id || '').startsWith('shard-');
    if (isShardTarget) return;
    const targetScreenX = worldToScreenX(target.x, cameraX);
    const pulse = Math.sin(now / 140) * 0.25 + 0.75;
    ctx.save();
    ctx.strokeStyle = `rgba(251, 191, 36, ${pulse})`;
    ctx.fillStyle = '#78350f';
    ctx.lineWidth = 3;
    if (targetScreenX > 24 && targetScreenX < CANVAS_WIDTH - 24) {
      ctx.beginPath();
      ctx.arc(targetScreenX, 292, 20 + pulse * 6, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const arrowX = targetScreenX < 0 ? 30 : CANVAS_WIDTH - 30;
      const direction = targetScreenX < 0 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(arrowX + direction * 13, 112);
      ctx.lineTo(arrowX - direction * 13, 98);
      ctx.lineTo(arrowX - direction * 13, 126);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }, []);

  const drawHazard = useCallback((ctx, hazard, cameraX, current, now) => {
    const hx = worldToScreenX(hazard.x, cameraX);
    if (!isHorizontallyVisible(hazard.x, hazard.width, cameraX, 50)) return;

    const visualHazardId = getHazardVisualId(hazard);
    const visual = getHazardVisualConfig(hazard);
    const baseY = hazard.y;
    const section = getSectionForX(hazard.x);
    const grounding = getHazardGroundingConfig(hazard);
    const centerX = hx + hazard.width / 2;
    const footY = baseY + hazard.height;
    const dustWidth = hazard.width * (grounding.dustWidth || 0.9);

    ctx.save();
    const hazardAssetKey = getEnvironmentAssetKeyForHazard(hazard, environmentAssetsRef.current.packId);
    const hazardDest = {
      x: hx - grounding.xPad,
      y: baseY - grounding.yOffset,
      width: hazard.width + grounding.widthPad,
      height: Math.max(12, hazard.height + grounding.heightPad),
    };
    const decalDescriptor = getEgyptHazardDecalDescriptor(hazard);
    const decalDest = decalDescriptor
      ? getEgyptHazardDecalDest(hazard, hx, footY, decalDescriptor.regionKey)
      : hazardDest;
    if (visualHazardId !== 'bat-cloud' && visualHazardId !== 'dust-wave') {
      drawContactShadow(ctx, centerX, footY + 3, hazard.width * 0.92, grounding.shadow, 0.9);
    }
    if (dustWidth > 0) {
      drawGroundDustLip(ctx, centerX, footY + 1, dustWidth, 'rgba(122, 78, 37, 0.16)');
    }
    if (decalDescriptor) {
      const decalDrawn = drawOpeningHazardDecalRegion(ctx, decalDescriptor, decalDest, {
        alpha: 0.94,
        filter: grounding.filter,
      });
      if (decalDrawn) {
        if (dustWidth > 0) {
          drawGroundDustLip(ctx, centerX, footY + 2, dustWidth * 0.82, 'rgba(209, 143, 72, 0.24)');
          drawHazardGroundApron(ctx, centerX, footY + 4, dustWidth, section.id, visualHazardId === 'sand-pit' || visualHazardId === 'dark-gap' ? 1.2 : 0.82);
        }
        ctx.restore();
        return;
      }
    }
    ctx.save();
    ctx.filter = grounding.filter;
    const hazardDrawn = drawAtlasRegion(
      ctx,
      environmentAssetsRef.current,
      hazardAssetKey,
      hazardDest,
      { mode: 'contain' },
    );
    ctx.restore();
    if (hazardDrawn) {
      if (dustWidth > 0) {
        drawGroundDustLip(ctx, centerX, footY + 2, dustWidth * 0.82, 'rgba(209, 143, 72, 0.24)');
        drawHazardGroundApron(ctx, centerX, footY + 4, dustWidth, section.id, visualHazardId === 'sand-pit' || visualHazardId === 'dark-gap' ? 1.2 : 0.82);
      }
      ctx.restore();
      return;
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = visual.color;
    ctx.fillStyle = visual.fill;
    ctx.globalAlpha = 0.88;

    if (visualHazardId === 'dark-gap') {
      const gradient = ctx.createRadialGradient(hx + hazard.width / 2, baseY + hazard.height / 2, 6, hx + hazard.width / 2, baseY + hazard.height / 2, hazard.width / 1.5);
      gradient.addColorStop(0, '#020617');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.72)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(hx + hazard.width / 2, baseY + hazard.height / 2, hazard.width / 2, Math.max(12, hazard.height), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.fillRect(hx + 8, baseY + 3, hazard.width - 16, 2);
    } else if (visualHazardId === 'thorn-bush') {
      ctx.beginPath();
      ctx.roundRect(hx, baseY + 8, hazard.width, hazard.height - 4, 8);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = visual.accent;
      for (let i = 8; i < hazard.width; i += 12) {
        ctx.beginPath();
        ctx.moveTo(hx + i, baseY + hazard.height + 2);
        ctx.lineTo(hx + i + 6, baseY + 5);
        ctx.lineTo(hx + i + 12, baseY + hazard.height + 2);
        ctx.stroke();
      }
    } else if (visualHazardId === 'sand-pit') {
      ctx.beginPath();
      ctx.ellipse(hx + hazard.width / 2, baseY + hazard.height / 2, hazard.width / 2, hazard.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = visual.accent;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.arc(hx + 18 + i * 18, baseY + 15 + Math.sin(now / 220 + i) * 3, 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (visualHazardId === 'spike-trap') {
      ctx.fillRect(hx, baseY + 10, hazard.width, hazard.height - 8);
      ctx.strokeRect(hx, baseY + 10, hazard.width, hazard.height - 8);
      ctx.fillStyle = visual.accent;
      for (let i = 4; i < hazard.width - 4; i += 14) {
        ctx.beginPath();
        ctx.moveTo(hx + i, baseY + 10);
        ctx.lineTo(hx + i + 7, baseY - 8);
        ctx.lineTo(hx + i + 14, baseY + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (visualHazardId === 'rolling-stones' || visualHazardId === 'falling-blocks') {
      ctx.fillRect(hx, baseY + 10, hazard.width, hazard.height - 8);
      ctx.strokeRect(hx, baseY + 10, hazard.width, hazard.height - 8);
      ctx.strokeStyle = visual.accent;
      ctx.beginPath();
      ctx.moveTo(hx + 8, baseY + 18);
      ctx.lineTo(hx + hazard.width * 0.45, baseY + 8);
      ctx.lineTo(hx + hazard.width - 10, baseY + 22);
      ctx.stroke();
      ctx.fillStyle = visual.color;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(hx + 18 + i * 22, baseY + 6 + Math.sin(now / 160 + i) * 4, 5 + i, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (visualHazardId === 'bat-cloud' || visualHazardId === 'dust-wave') {
      ctx.beginPath();
      ctx.roundRect(hx, baseY, hazard.width, hazard.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = visual.accent;
      for (let i = 0; i < 7; i += 1) {
        ctx.globalAlpha = 0.42;
        ctx.beginPath();
        ctx.arc(hx + 14 + i * 15, baseY + 18 + Math.sin(now / 130 + i) * 14, 3 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.beginPath();
      ctx.moveTo(hx, baseY + hazard.height);
      ctx.lineTo(hx + hazard.width * 0.35, baseY + 8);
      ctx.lineTo(hx + hazard.width, baseY + hazard.height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = visual.accent;
      ctx.beginPath();
      ctx.moveTo(hx + 12, baseY + hazard.height - 8);
      ctx.lineTo(hx + hazard.width - 10, baseY + 12);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.82;
    if (visualHazardId !== 'bat-cloud' && visualHazardId !== 'dust-wave') {
      drawGroundDustLip(ctx, centerX, footY + 2, dustWidth * 0.82, 'rgba(185, 110, 45, 0.2)');
      drawHazardGroundApron(ctx, centerX, footY + 4, dustWidth, section.id, visualHazardId === 'sand-pit' || visualHazardId === 'dark-gap' ? 1.2 : 0.82);
    }
    ctx.restore();
  }, [drawContactShadow, drawGroundDustLip, drawHazardGroundApron, drawOpeningHazardDecalRegion]);

  const drawSmallEnemySprite = useCallback((ctx, enemy, screenX, now, shakeX = 0) => {
    const family = getEnemySpriteFamily(enemy);
    if (!family) return false;
    if (!shouldUseEnemySpritePack(enemy)) return false;
    const combatMode = getCombatMode(enemy);
    const frameKey = getEnemySpriteFrame(enemy, combatMode, now);
    const stableShakeX = enemy.defeated ? 0 : shakeX;
    const drawBox = getEnemySpriteDrawBox(enemy, screenX, stableShakeX, combatMode);
    if (!frameKey || !drawBox) return false;

    const assets = enemySpriteAssetsRef.current;
    const spritePack = getEnemySpritePack(assets, family);
    if (!spritePack?.loaded || spritePack.failed) return false;
    const atlasRegion = spritePack.atlas?.regions?.[frameKey] || null;

    const centerX = screenX + enemy.width / 2 + stableShakeX;
    const baseY = enemy.y + enemy.height;
    const groundedDrawBox = atlasRegion
      ? {
        ...drawBox,
        x: centerX - Math.max(drawBox.width, drawBox.height * (atlasRegion.w / Math.max(1, atlasRegion.h))) / 2,
        width: Math.max(drawBox.width, drawBox.height * (atlasRegion.w / Math.max(1, atlasRegion.h))),
      }
      : drawBox;
    const facing = (enemy.attackTimer > 0 || enemy.attackWindup > 0)
      ? enemy.attackDirection
      : enemy.direction;
    const shouldFlip = shouldFlipEnemySprite(family, facing);

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'none';
    const shadowWidth = family === 'bat' ? groundedDrawBox.width * 0.72 : groundedDrawBox.width * 0.78;
    drawContactShadow(ctx, centerX, baseY + (family === 'bat' ? 10 : 3), shadowWidth, family === 'bat' ? 0.16 : 0.24, 1);
    if (family !== 'bat' && !enemy.defeated) {
      drawGroundDustLip(ctx, centerX, baseY + 2, groundedDrawBox.width * 0.64, 'rgba(95, 58, 27, 0.22)');
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    if (enemy.defeated) {
      ctx.globalAlpha = family === 'bat' ? 0.78 : 0.84;
      ctx.filter = 'saturate(0.86) brightness(0.92)';
    } else if (enemy.hitFlash > 0) {
      ctx.filter = 'brightness(1.35) saturate(1.15)';
    } else if (family === 'bat') {
      ctx.filter = 'brightness(1.12) contrast(1.08)';
    }

    if (shouldFlip) {
      ctx.translate(groundedDrawBox.x + groundedDrawBox.width / 2, 0);
      ctx.scale(-1, 1);
    }

    const drawn = drawAtlasRegion(
      ctx,
      spritePack,
      frameKey,
      {
        x: shouldFlip ? -groundedDrawBox.width / 2 : groundedDrawBox.x,
        y: groundedDrawBox.y,
        width: groundedDrawBox.width,
        height: groundedDrawBox.height,
      },
      { mode: 'contain', alignY: 'bottom' },
    );
    ctx.restore();

    if (drawn && stateRef.current.renderStats) {
      const stats = stateRef.current.renderStats;
      stats.visibleEnemySpriteFamilies = Array.from(new Set([...(stats.visibleEnemySpriteFamilies || []), family]));
      const frameState = `${enemy.id}:${family}:${combatMode}:${frameKey}`;
      stats.enemySpriteFrameStates = [...(stats.enemySpriteFrameStates || []), frameState].slice(-12);
      stats.enemyVisibilityAssistActive = false;
    }

    return drawn;
  }, [drawContactShadow, drawGroundDustLip, getCombatMode]);

  const drawLinkedEnemySprite = useCallback((ctx, enemy, screenX, now, shakeX = 0) => {
    const combatMode = getCombatMode(enemy);
    const stableShakeX = enemy.defeated ? 0 : shakeX;
    const centerX = screenX + enemy.width / 2 + stableShakeX;
    const baseY = enemy.y + enemy.height;
    const facing = (enemy.attackTimer > 0 || enemy.attackWindup > 0)
      ? enemy.attackDirection
      : enemy.direction;

    if (enemy.type === 'scarab' || enemy.type === 'snake' || enemy.type === 'scorpion' || enemy.type === 'sand-wisp') {
      const pulse = Math.sin(now / 140) * 0.5 + 0.5;
      const defeated = combatMode === 'defeated';
      const stunned = enemy.hitFlash > 0 || combatMode === 'stunned';
      const frameKey = `${enemy.type}-${combatMode}-${Math.floor(now / 220) % 2}`;
      ctx.save();
      if (enemy.type === 'scarab') {
        const bodyY = baseY - 11 + (defeated ? 5 : 0);
        const shellPulse = defeated ? 0 : Math.sin(now / 190) * 0.8;
        drawContactShadow(ctx, centerX, baseY + 3, enemy.width * 0.82, defeated ? 0.1 : 0.2, 0.9);
        ctx.globalAlpha = defeated ? 0.5 : 0.96;
        ctx.strokeStyle = stunned ? '#fde68a' : '#4a2b12';
        ctx.lineWidth = 2;
        const shell = ctx.createLinearGradient(centerX, bodyY - 16, centerX, bodyY + 11);
        shell.addColorStop(0, stunned ? '#fbbf24' : '#b77932');
        shell.addColorStop(0.48, stunned ? '#d97706' : '#7c3f16');
        shell.addColorStop(1, '#3f2411');
        ctx.fillStyle = shell;
        ctx.beginPath();
        ctx.ellipse(centerX, bodyY, enemy.width * 0.68, enemy.height * 0.42 + shellPulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = stunned ? '#fef3c7' : 'rgba(146, 64, 14, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX, bodyY - enemy.height * 0.34);
        ctx.lineTo(centerX, bodyY + enemy.height * 0.34);
        ctx.moveTo(centerX - enemy.width * 0.42, bodyY - 1);
        ctx.quadraticCurveTo(centerX - enemy.width * 0.18, bodyY + 5, centerX, bodyY + 4);
        ctx.quadraticCurveTo(centerX + enemy.width * 0.18, bodyY + 5, centerX + enemy.width * 0.42, bodyY - 1);
        ctx.stroke();
        ctx.strokeStyle = '#5b3516';
        ctx.lineWidth = 2;
        for (let i = -1; i <= 1; i += 1) {
          ctx.beginPath();
          ctx.moveTo(centerX - enemy.width * 0.18, bodyY + i * 4);
          ctx.lineTo(centerX - enemy.width * 0.5, bodyY + i * 6 + 5);
          ctx.moveTo(centerX + enemy.width * 0.18, bodyY + i * 4);
          ctx.lineTo(centerX + enemy.width * 0.5, bodyY + i * 6 + 5);
          ctx.stroke();
        }
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(centerX + facing * enemy.width * 0.22, bodyY - 5, 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (enemy.type === 'snake') {
        const bodyY = baseY - 13 + (defeated ? 6 : 0);
        drawContactShadow(ctx, centerX, baseY + 3, enemy.width * 0.76, defeated ? 0.08 : 0.16, 0.8);
        ctx.globalAlpha = defeated ? 0.48 : 0.94;
        ctx.strokeStyle = stunned ? '#fde68a' : '#4d7c0f';
        ctx.fillStyle = stunned ? '#a3e635' : '#365314';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i += 1) {
          const segmentX = centerX - facing * (enemy.width * 0.26 - i * enemy.width * 0.17);
          const segmentY = bodyY + Math.sin(now / 180 + i) * 2;
          ctx.beginPath();
          ctx.ellipse(segmentX, segmentY, enemy.width * (i === 3 ? 0.2 : 0.24), enemy.height * 0.26, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.ellipse(centerX + facing * enemy.width * 0.34, bodyY - 3, enemy.width * 0.22, enemy.height * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(centerX + facing * enemy.width * 0.4, bodyY - 5, 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (enemy.type === 'scorpion') {
        const bodyY = baseY - 13 + (defeated ? 5 : 0);
        drawContactShadow(ctx, centerX, baseY + 3, enemy.width * 0.78, defeated ? 0.1 : 0.18, 0.9);
        ctx.globalAlpha = defeated ? 0.58 : 0.96;
        ctx.strokeStyle = stunned ? '#fed7aa' : '#7c2d12';
        ctx.fillStyle = stunned ? '#fbbf24' : '#a16207';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, bodyY, enemy.width * 0.38, enemy.height * 0.34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(centerX + facing * enemy.width * 0.27, bodyY - 2, enemy.width * 0.18, enemy.height * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#92400e';
        for (let i = -1; i <= 1; i += 1) {
          ctx.beginPath();
          ctx.moveTo(centerX - enemy.width * 0.08, bodyY + i * 3);
          ctx.lineTo(centerX - enemy.width * 0.38, bodyY + i * 5 + 4);
          ctx.moveTo(centerX + enemy.width * 0.08, bodyY + i * 3);
          ctx.lineTo(centerX + enemy.width * 0.38, bodyY + i * 5 + 4);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(centerX - facing * enemy.width * 0.22, bodyY - 8);
        ctx.quadraticCurveTo(centerX - facing * enemy.width * 0.36, bodyY - 25, centerX - facing * enemy.width * 0.05, bodyY - 25 - pulse * 2);
        ctx.stroke();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(centerX - facing * enemy.width * 0.03, bodyY - 25 - pulse * 2, 3.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const floatY = centerX % 2 === 0 ? baseY - 33 - pulse * 5 : baseY - 31 - pulse * 5;
        drawContactShadow(ctx, centerX, baseY + 4, enemy.width * 0.66, defeated ? 0.06 : 0.12, 0.65);
        ctx.globalAlpha = defeated ? 0.42 : 0.86;
        const glow = ctx.createRadialGradient(centerX, floatY, 2, centerX, floatY, enemy.width * 0.55);
        glow.addColorStop(0, stunned ? 'rgba(254, 240, 138, 0.95)' : 'rgba(253, 224, 71, 0.9)');
        glow.addColorStop(0.55, 'rgba(251, 191, 36, 0.35)');
        glow.addColorStop(1, 'rgba(180, 83, 9, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(centerX, floatY, enemy.width * 0.58, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = stunned ? '#fff7ed' : '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, floatY, enemy.width * 0.28 + pulse * 2, Math.PI * 0.1, Math.PI * 1.55);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX + 3, floatY + 2, enemy.width * 0.17, Math.PI * 1.1, Math.PI * 2.1);
        ctx.stroke();
      }
      ctx.restore();
      if (stateRef.current.renderStats) {
        const stats = stateRef.current.renderStats;
        stats.visibleEnemySpriteFamilies = Array.from(new Set([...(stats.visibleEnemySpriteFamilies || []), enemy.type]));
        const frameState = `${enemy.id}:${enemy.type}:${combatMode}:${frameKey}`;
        stats.enemySpriteFrameStates = [...(stats.enemySpriteFrameStates || []), frameState].slice(-12);
      }
      return true;
    }

    if (enemy.type === 'guardian' || enemy.type === 'statue') {
      const bossId = enemy.type === 'statue' ? 'ancient-construct' : 'temple-guardian';
      const pack = getBossSpritePack(bossSpriteAssetsRef.current, bossId);
      if (!pack) return false;
      const frameKey = enemy.type === 'statue'
        ? (combatMode === 'defeated' ? 'ancientConstructDefeated' : enemy.hitFlash > 0 || combatMode === 'stunned' ? 'ancientConstructHit' : combatMode === 'windup' ? 'ancientConstructWindup' : combatMode === 'attacking' ? 'ancientConstructSlam' : 'ancientConstructWalk1')
        : (combatMode === 'defeated' ? 'stoneGuardianDefeated' : enemy.hitFlash > 0 || combatMode === 'stunned' ? 'stoneGuardianHit' : combatMode === 'windup' ? 'stoneGuardianWindup' : combatMode === 'attacking' ? 'stoneGuardianSlam' : 'stoneGuardianWalk1');
      const width = enemy.type === 'statue' ? 82 : 76;
      const height = enemy.type === 'statue' ? 82 : 78;
      const drawBox = {
        x: centerX - width / 2,
        y: baseY - height + 4,
        width,
        height,
      };
      const shouldFlip = shouldFlipBossSprite(bossId, facing);
      ctx.save();
      drawContactShadow(ctx, centerX, baseY + 3, width * 0.74, enemy.defeated ? 0.12 : 0.24, 1);
      if (enemy.defeated) ctx.globalAlpha = 0.82;
      if (enemy.hitFlash > 0) ctx.filter = 'brightness(1.26) saturate(1.08)';
      if (shouldFlip) {
        ctx.translate(drawBox.x + drawBox.width / 2, 0);
        ctx.scale(-1, 1);
      }
      const drawn = drawAtlasRegion(
        ctx,
        pack,
        frameKey,
        {
          x: shouldFlip ? -drawBox.width / 2 : drawBox.x,
          y: drawBox.y,
          width: drawBox.width,
          height: drawBox.height,
        },
        { mode: 'contain' },
      );
      ctx.restore();
      if (drawn && stateRef.current.renderStats) {
        const stats = stateRef.current.renderStats;
        stats.visibleEnemySpriteFamilies = Array.from(new Set([...(stats.visibleEnemySpriteFamilies || []), enemy.type]));
        const frameState = `${enemy.id}:${enemy.type}:${combatMode}:${frameKey}`;
        stats.enemySpriteFrameStates = [...(stats.enemySpriteFrameStates || []), frameState].slice(-12);
      }
      return drawn;
    }

    if (enemy.type === 'looter' && playerSpriteRef.current.loaded && playerSpriteRef.current.image) {
      const frame = combatMode === 'defeated'
        ? 1
        : Math.floor(now / 180) % PLAYER_SPRITE_FRAME_COUNT;
      const drawHeight = enemy.defeated ? 46 : 72;
      const drawWidth = PLAYER_SPRITE_FRAME_WIDTH * (drawHeight / PLAYER_SPRITE_FRAME_HEIGHT);
      const drawX = centerX - drawWidth / 2;
      const drawY = baseY - drawHeight + (enemy.defeated ? 8 : 0);
      const shouldFlip = shouldFlipEnemySprite('looter', facing);
      ctx.save();
      drawContactShadow(ctx, centerX, baseY + 3, drawWidth * 0.56, enemy.defeated ? 0.11 : 0.2, 1);
      ctx.filter = enemy.hitFlash > 0
        ? 'brightness(1.22) sepia(40%) saturate(0.8)'
        : 'sepia(38%) saturate(0.72) brightness(0.78)';
      ctx.globalAlpha = enemy.defeated ? 0.72 : 0.92;
      if (shouldFlip) {
        ctx.translate(drawX + drawWidth / 2, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(
        playerSpriteRef.current.image,
        frame * PLAYER_SPRITE_FRAME_WIDTH,
        0,
        PLAYER_SPRITE_FRAME_WIDTH,
        PLAYER_SPRITE_FRAME_HEIGHT,
        shouldFlip ? -drawWidth / 2 : drawX,
        drawY,
        drawWidth,
        drawHeight,
      );
      ctx.restore();
      if (stateRef.current.renderStats) {
        const stats = stateRef.current.renderStats;
        stats.visibleEnemySpriteFamilies = Array.from(new Set([...(stats.visibleEnemySpriteFamilies || []), 'looter']));
        const frameState = `${enemy.id}:looter:${combatMode}:playerFrame${frame}`;
        stats.enemySpriteFrameStates = [...(stats.enemySpriteFrameStates || []), frameState].slice(-12);
      }
      return true;
    }

    return false;
  }, [drawContactShadow, getCombatMode]);

  const drawBossSprite = useCallback((ctx, boss, screenX, now, bossVisualState) => {
    const spriteBossId = boss.spriteBossId || boss.id;
    const isChinaGuardianBoss = isChinaGuardianBossSpriteId(spriteBossId);
    const supportedBoss = isChinaGuardianBoss
      || boss.id === 'scarab-queen'
      || boss.id === 'temple-guardian'
      || boss.id === 'giant-serpent'
      || boss.id === 'ancient-construct';
    if (!supportedBoss) return false;
    const combatMode = getCombatMode(boss);
    const frameKey = isChinaGuardianBoss
      ? getClayGuardianSpriteFrame(boss, combatMode, bossVisualState, now)
      : boss.id === 'ancient-construct'
      ? getAncientConstructSpriteFrame(boss, combatMode, bossVisualState, now)
      : boss.id === 'temple-guardian'
        ? getStoneGuardianSpriteFrame(boss, combatMode, bossVisualState, now)
        : boss.id === 'giant-serpent'
          ? getGiantSerpentSpriteFrame(boss, combatMode, bossVisualState, now)
          : getScarabQueenSpriteFrame(boss, combatMode, bossVisualState, now);
    const drawBox = isChinaGuardianBoss
      ? getClayGuardianDrawBox(boss, screenX)
      : boss.id === 'ancient-construct'
      ? getAncientConstructDrawBox(boss, screenX)
      : boss.id === 'temple-guardian'
        ? getStoneGuardianDrawBox(boss, screenX)
        : boss.id === 'giant-serpent'
          ? getGiantSerpentDrawBox(boss, screenX)
          : getScarabQueenDrawBox(boss, screenX);
    const pack = getBossSpritePack(bossSpriteAssetsRef.current, spriteBossId);
    if (!frameKey || !drawBox || !pack) return false;

    const facing = (boss.attackTimer > 0 || boss.attackWindup > 0)
      ? boss.attackDirection
      : boss.direction;
    const shouldFlip = shouldFlipBossSprite(spriteBossId, facing);
    const centerX = screenX + boss.width / 2;
    const baseY = boss.y + boss.height;
    const visualScale = boss.visualScale || 1;

    ctx.save();
    if (visualScale > 1) {
      ctx.translate(centerX, baseY);
      ctx.scale(visualScale, visualScale);
      ctx.translate(-centerX, -baseY);
    }
    const isStoneBoss = isChinaGuardianBoss || boss.id === 'temple-guardian' || boss.id === 'ancient-construct';
    if (boss.id !== 'scarab-queen') {
      drawContactShadow(ctx, centerX, baseY + 3, drawBox.width * (isStoneBoss ? 0.86 : 0.78), isStoneBoss ? 0.34 : 0.28, 1.5);
    }
    if (isStoneBoss && (combatMode === 'attacking' || combatMode === 'windup')) {
      drawGroundDustLip(ctx, centerX, baseY + 2, drawBox.width * 0.72, 'rgba(197, 148, 72, 0.28)');
    }
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    if (boss.hitFlash > 0 || combatMode === 'stunned') {
      ctx.filter = 'brightness(1.28) saturate(1.12)';
    }
    if (shouldFlip) {
      ctx.translate(drawBox.x + drawBox.width / 2, 0);
      ctx.scale(-1, 1);
    }
    const drawn = drawAtlasRegion(
      ctx,
      pack,
      frameKey,
      {
        x: shouldFlip ? -drawBox.width / 2 : drawBox.x,
        y: drawBox.y,
        width: drawBox.width,
        height: drawBox.height,
      },
      { mode: 'contain', alignY: 'bottom' },
    );
    ctx.restore();

    if (drawn && stateRef.current.renderStats) {
      stateRef.current.renderStats.activeBossSprite = spriteBossId;
      stateRef.current.renderStats.activeBossSpriteFrame = frameKey;
      stateRef.current.renderStats.activeBossAnimationState = combatMode;
      if (isChinaGuardianBoss) {
        stateRef.current.renderStats.chinaClayGuardianSpriteFrame = frameKey;
      }
      if (boss.id === 'temple-guardian') {
        stateRef.current.renderStats.stoneGuardianSpriteFrame = frameKey;
      }
      if (boss.id === 'ancient-construct') {
        stateRef.current.renderStats.ancientConstructSpriteFrame = frameKey;
      }
      if (boss.id === 'giant-serpent') {
        stateRef.current.renderStats.giantSerpentSpriteFrame = frameKey;
      }
    }

    return drawn;
  }, [drawContactShadow, drawGroundDustLip, getCombatMode]);

  const getBossVisibleDrawBox = useCallback((boss, screenX) => {
    if (isChinaGuardianBossSpriteId(boss.spriteBossId)) return getClayGuardianDrawBox(boss, screenX);
    if (boss.id === 'ancient-construct') return getAncientConstructDrawBox(boss, screenX);
    if (boss.id === 'temple-guardian') return getStoneGuardianDrawBox(boss, screenX);
    if (boss.id === 'giant-serpent') return getGiantSerpentDrawBox(boss, screenX);
    if (boss.id === 'scarab-queen') return getScarabQueenDrawBox(boss, screenX);
    return {
      x: screenX,
      y: boss.y,
      width: boss.width,
      height: boss.height,
    };
  }, []);

  const drawMiniBoss = useCallback((ctx, boss, screenX, now) => {
    const cx = screenX + boss.width / 2;
    const cy = boss.y + boss.height / 2;
    const introActive = stateRef.current.bossIntroTimer > 0 && stateRef.current.bossIntro?.id === boss.id;
    const bossVisualState = {
      ...getBossVulnerabilityState(boss),
      introActive,
    };

    ctx.save();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;

    const bossSpriteDrawn = boss.type === 'looter' || boss.type === 'bes'
      ? drawSmallEnemySprite(ctx, boss, screenX, now)
      : drawBossSprite(ctx, boss, screenX, now, bossVisualState);

    if (bossSpriteDrawn) {
      // Sprite atlas handles supported boss body art; shared health/status UI below remains unchanged.
    } else if (boss.type === 'guardian' || boss.type === 'statue') {
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(screenX + 10, boss.y + 10, boss.width - 20, 22, 8);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(screenX + 5, boss.y + 30, boss.width - 10, boss.height - 28, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.fillRect(screenX - 8, boss.y + 36, 14, 34);
      ctx.fillRect(screenX + boss.width - 6, boss.y + 36, 14, 34);
      ctx.fillRect(screenX + 8, boss.y + boss.height - 4, boss.width - 16, 12);
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(cx - 8, boss.y + 22, 3, 0, Math.PI * 2);
      ctx.arc(cx + 8, boss.y + 22, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx, boss.y + 50, 9 + Math.sin(now / 220) * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.34)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 14, boss.y + 38, boss.width - 28, 24);
    } else if (boss.type === 'snake') {
      ctx.fillStyle = '#166534';
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        const cy = boss.y + boss.height / 2;
        ctx.ellipse(screenX + 12 + i * 14, cy + Math.sin(now / 180 + i) * 5, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(screenX + boss.width - 10, cy - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.type === 'looter') {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(screenX + 14, boss.y + 18, boss.width - 28, boss.height - 14, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(screenX + 7, boss.y + 9, boss.width - 14, 6);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(screenX + boss.width - 18, boss.y + 36, 12, 18);
    } else {
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.ellipse(cx, cy, boss.width / 2, boss.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(cx, boss.y + 8);
      ctx.lineTo(cx + 18, cy);
      ctx.lineTo(cx, boss.y + boss.height - 6);
      ctx.lineTo(cx - 18, cy);
      ctx.closePath();
      ctx.fill();
    }

    const visibleBox = getBossVisibleDrawBox(boss, screenX);
    const healthCenterX = boss.awakened ? CANVAS_WIDTH / 2 : visibleBox.x + visibleBox.width / 2;
    const barWidth = boss.awakened ? Math.min(390, CANVAS_WIDTH - 120) : Math.max(boss.width + 20, visibleBox.width * 0.55);
    const barHeight = boss.awakened ? 10 : 8;
    const barX = clamp(healthCenterX - barWidth / 2, 18, CANVAS_WIDTH - barWidth - 18);
    const barY = boss.awakened ? 18 : Math.max(18, visibleBox.y - 16);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.roundRect(barX, barY, barWidth, barHeight, 5);
    ctx.fill();
    ctx.fillStyle = boss.awakened ? '#dc2626' : '#b45309';
    ctx.roundRect(barX, barY, (boss.health / boss.maxHealth) * barWidth, barHeight, 5);
    ctx.fill();

    ctx.restore();
  }, [drawBossSprite, drawSmallEnemySprite, getBossVisibleDrawBox, getBossVulnerabilityState]);

  const drawAttackArc = useCallback(() => {}, []);

  const drawEnemyAttackTell = useCallback(() => {}, []);

  const drawCombatEffects = useCallback((ctx, effects, cameraX) => {
    effects.forEach((effect) => {
      const progress = effect.timer / (effect.maxTimer || 0.35);
      const x = effect.x - cameraX;
      const y = effect.y;
      const compactTypes = new Set([
        'enemy-counter-window',
        'boss-vulnerable',
        'enemy-shield',
        'boss-shield',
        'boss-telegraph',
        'attack-stamina',
      ]);
      ctx.save();
      ctx.globalAlpha = Math.max(0, progress);
      ctx.strokeStyle = effect.color || '#facc15';
      ctx.fillStyle = effect.color || '#facc15';
      ctx.lineWidth = 3;
      if (['movement-dust', 'landing-dust', 'jump-dust', 'knockback-dust'].includes(effect.type)) {
        const direction = effect.direction || 1;
        const dustWidth = effect.type === 'landing-dust' ? 44 : effect.type === 'jump-dust' ? 34 : 28;
        ctx.globalAlpha = Math.max(0, progress * (effect.type === 'movement-dust' ? 0.38 : 0.58));
        ctx.fillStyle = effect.color || 'rgba(217, 161, 88, 0.62)';
        for (let i = 0; i < 4; i += 1) {
          const offset = (i - 1.5) * 9 * direction + (1 - progress) * direction * (8 + i * 4);
          ctx.beginPath();
          ctx.ellipse(
            x - direction * 10 + offset,
            y + 16 - i * 2,
            (dustWidth / 4) * (0.8 + i * 0.16) * (1.15 - progress * 0.25),
            4 + (1 - progress) * 4,
            -0.08 * direction,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.restore();
        return;
      }
      if (['environment-debris', 'environment-dust', 'platform-crack'].includes(effect.type)) {
        ctx.globalAlpha = Math.max(0, progress * 0.62);
        ctx.fillStyle = effect.color || 'rgba(203, 139, 68, 0.58)';
        const count = effect.type === 'platform-crack' ? 6 : 8;
        for (let i = 0; i < count; i += 1) {
          const spread = (1 - progress) * (14 + i * 4);
          const angle = -Math.PI * 0.9 + i * (Math.PI / Math.max(1, count - 1));
          ctx.beginPath();
          ctx.ellipse(
            x + Math.cos(angle) * spread,
            y + Math.sin(angle) * spread + i * 0.8,
            3 + (i % 3),
            2,
            angle,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.restore();
        return;
      }
      if (['reward-pulse', 'shard-pickup', 'secret-found', 'checkpoint-pulse', 'collection-complete', 'boss-reward-pulse', 'upgrade-pulse'].includes(effect.type)) {
        ctx.restore();
        return;
      }
      if (effect.type === 'attack-burst') {
        ctx.restore();
        return;
      }
      if (effect.type === 'weapon-hit-spark') {
        const direction = effect.direction || 1;
        ctx.globalAlpha = Math.max(0, progress * 0.62);
        ctx.strokeStyle = effect.color || '#fff7ad';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i += 1) {
          const angle = -0.5 + i * 0.25 + (direction < 0 ? Math.PI : 0);
          const length = 8 + i * 1.5 + (1 - progress) * 10;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }
      if (['combat-impact', 'enemy-pressure', 'stamina-danger'].includes(effect.type)) {
        ctx.restore();
        return;
      }
      if (compactTypes.has(effect.type)) {
        ctx.restore();
        return;
      }
      ctx.restore();
      return;
    });
  }, []);

  const drawDiscoveryEntrance = useCallback((ctx, entrance, cameraX, current, now) => {
    const screenX = entrance.x - cameraX;
    const centerX = screenX + entrance.width / 2;
    const footY = GATE.y + GATE.height;
    if (screenX > CANVAS_WIDTH + 260 || screenX + entrance.width < -260) return;

    const revealProgress = current.discoveryEntranceActive
      ? 1 - clamp((current.discoveryEntranceTimer || 0) / DISCOVERY_ENTRANCE_REVEAL_SECONDS, 0, 1)
      : 0;
    const pulse = 0.5 + Math.sin(now / 210) * 0.5;
    const glowAlpha = 0.16 + pulse * 0.08 + revealProgress * 0.2;
    const lampFlicker = 0.82 + Math.sin(now / 95) * 0.1;

    ctx.save();
    drawContactShadow(ctx, centerX, footY + 4, entrance.width * 0.9, 0.34, 1.2);

    const aura = ctx.createRadialGradient(centerX, entrance.y + 82, 18, centerX, entrance.y + 82, entrance.width * 0.84);
    aura.addColorStop(0, `rgba(250, 204, 21, ${glowAlpha})`);
    aura.addColorStop(0.48, `rgba(187, 247, 208, ${0.12 + revealProgress * 0.12})`);
    aura.addColorStop(1, 'rgba(6, 78, 59, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(centerX, entrance.y + 82, entrance.width * 0.72, entrance.height * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.beginPath();
    ctx.ellipse(centerX + 12, footY + 13, entrance.width * 0.56, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    const leftPillarX = screenX + 18;
    const rightPillarX = screenX + entrance.width - 46;
    const pillarGradient = ctx.createLinearGradient(screenX, entrance.y, screenX + entrance.width, entrance.y);
    pillarGradient.addColorStop(0, '#1f3f2e');
    pillarGradient.addColorStop(0.45, entrance.stoneColor);
    pillarGradient.addColorStop(1, '#163425');
    ctx.fillStyle = pillarGradient;
    ctx.strokeStyle = 'rgba(187, 247, 208, 0.34)';
    ctx.lineWidth = 2;
    [leftPillarX, rightPillarX].forEach((pillarX) => {
      ctx.beginPath();
      ctx.roundRect(pillarX, entrance.y + 30, 28, entrance.height - 26, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.18)';
      ctx.fillRect(pillarX + 6, entrance.y + 52, 16, entrance.height - 84);
      ctx.fillStyle = pillarGradient;
    });

    ctx.beginPath();
    ctx.moveTo(screenX + 18, entrance.y + 56);
    ctx.quadraticCurveTo(centerX, entrance.y - 8, screenX + entrance.width - 18, entrance.y + 56);
    ctx.lineTo(screenX + entrance.width - 6, entrance.y + 86);
    ctx.quadraticCurveTo(centerX, entrance.y + 22, screenX + 6, entrance.y + 86);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const doorGradient = ctx.createLinearGradient(centerX, entrance.y + 40, centerX, footY);
    doorGradient.addColorStop(0, 'rgba(6, 78, 59, 0.9)');
    doorGradient.addColorStop(0.58, '#10291f');
    doorGradient.addColorStop(1, '#07150f');
    ctx.fillStyle = doorGradient;
    ctx.beginPath();
    ctx.roundRect(centerX - 31, entrance.y + 54, 62, entrance.height - 42, 24);
    ctx.fill();
    ctx.strokeStyle = `rgba(250, 204, 21, ${0.38 + revealProgress * 0.24})`;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = `rgba(250, 204, 21, ${0.38 + revealProgress * 0.28})`;
    ctx.beginPath();
    ctx.arc(centerX, entrance.y + 104, 12 + revealProgress * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 247, 237, 0.52)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (let index = 0; index < 5; index += 1) {
      const stairY = footY - 2 + index * 8;
      const stairWidth = entrance.width * (0.52 + index * 0.08);
      ctx.fillStyle = `rgba(49, 84, 61, ${0.86 - index * 0.06})`;
      ctx.fillRect(centerX - stairWidth / 2, stairY, stairWidth, 5);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.08)';
      ctx.fillRect(centerX - stairWidth / 2, stairY, stairWidth, 1);
    }

    [-1, 1].forEach((side) => {
      const torchX = centerX + side * 54;
      ctx.fillStyle = '#5c4033';
      ctx.fillRect(torchX - 3, entrance.y + 82, 6, 28);
      ctx.fillStyle = `rgba(250, 204, 21, ${0.74 * lampFlicker})`;
      ctx.beginPath();
      ctx.ellipse(torchX, entrance.y + 76, 7 + revealProgress * 2, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 247, 237, ${0.38 * lampFlicker})`;
      ctx.beginPath();
      ctx.ellipse(torchX, entrance.y + 78, 3, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = 'rgba(187, 247, 208, 0.28)';
    ctx.lineWidth = 1;
    for (let index = 0; index < 6; index += 1) {
      const crackX = screenX + 34 + index * 18;
      ctx.beginPath();
      ctx.moveTo(crackX, entrance.y + 46 + (index % 2) * 12);
      ctx.lineTo(crackX + 7, entrance.y + 72 + (index % 3) * 8);
      ctx.lineTo(crackX + 3, entrance.y + 102 + (index % 2) * 10);
      ctx.stroke();
    }

    drawGroundDustLip(ctx, centerX, footY + 3, entrance.width * 0.78, 'rgba(250, 204, 21, 0.2)');
    if (Math.abs((current.player.x + current.player.width / 2) - (entrance.x + entrance.width / 2)) < 240) {
      drawFieldNoteLabel(ctx, centerX, entrance.y - 16, entrance.title, entrance.glowColor);
    }
    ctx.restore();
  }, [drawContactShadow, drawFieldNoteLabel, drawGroundDustLip]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const current = stateRef.current;
    ctx.setTransform(
      JOURNEY_RENDER_TARGET.virtualToNativeScaleX,
      0,
      0,
      JOURNEY_RENDER_TARGET.virtualToNativeScaleY,
      0,
      0,
    );
    const player = current.player;
    const now = Date.now();
    const section = getSectionForX(player.x);
    const atmosphere = SECTION_ATMOSPHERES[section.id] || SECTION_ATMOSPHERES[SECTIONS[0].id];
    const shake = current.cameraShakeTimer > 0
      ? Math.sin(now / 28) * current.cameraShakeStrength * 7
      : 0;
    const cameraX = clampCameraX((Number.isFinite(current.cameraX) ? current.cameraX : 0) + shake);
    const playerImpactShakeProgress = player.impactShakeTimer > 0
      ? clamp(player.impactShakeTimer / PLAYER_HIT_SCREEN_SHAKE_DURATION, 0, 1)
      : 0;
    const playerImpactShakeDirection = player.knockbackDirection || -player.direction || 1;
    const playerImpactShakeX = playerImpactShakeProgress > 0
      ? Math.sin(now / 17) * PLAYER_HIT_SCREEN_SHAKE_PIXELS * playerImpactShakeProgress * playerImpactShakeDirection
      : 0;
    const playerImpactShakeY = playerImpactShakeProgress > 0
      ? Math.cos(now / 23) * PLAYER_HIT_SCREEN_SHAKE_PIXELS * 0.38 * playerImpactShakeProgress
      : 0;
    const isPlayerNear = (worldX, distance = 240) => Math.abs((player.x + player.width / 2) - worldX) < distance;
    const activeRouteGate = ROUTE_GATES.find(gate => !current.openedRouteGateIds.has(gate.id));
    const activeGateGuidance = activeRouteGate ? getGateGuidance(activeRouteGate, current) : null;
    const playerCenterX = player.x + player.width / 2;
    const crowdedGateActive = Boolean(activeRouteGate && Math.abs((activeRouteGate.x + activeRouteGate.width / 2) - playerCenterX) < 360);
    const crowdedBossActive = current.miniBosses.some(boss => boss.awakened && !boss.defeated && Math.abs(boss.x - player.x) < 360);
    const labelSuppressionActive = crowdedGateActive || crowdedBossActive || current.bossIntroTimer > 0;
    current.renderStats = {
      visibleLabelCount: 0,
      labelSuppressionActive,
      atlasTuningVersion: ATLAS_TUNING_VERSION,
      activeAtlasRegionIssues: getMissingEnvironmentAssets(environmentAssetsRef.current),
      parallaxLayersActive: false,
      activeBackgroundSection: null,
      backgroundDepthMode: 'canvas-fallback',
      platformVisualTuningActive: true,
      journeyPolishPassActive: true,
      journeyPolishVersion: JOURNEY_POLISH_VERSION,
      worldContinuityPassActive: true,
      worldContinuityVersion: WORLD_CONTINUITY_VERSION,
      visibleWorldLandmarks: [],
      visibleTransitionStoryMarkers: [],
      connectedWorldAmbientDetails: 0,
      dynamicWorldPassActive: true,
      dynamicWorldVersion: DYNAMIC_WORLD_VERSION,
      visibleDynamicWorldEvents: [],
      reactiveEnvironmentPassActive: true,
      reactiveEnvironmentVersion: REACTIVE_ENVIRONMENT_VERSION,
      visibleEnvironmentInteractions: [],
      chinaBackgroundPolishVersion: backgroundPackId === 'china-river-valley' ? CHINA_BACKGROUND_POLISH_VERSION : null,
      ambientLifePassActive: false,
      ambientLifeVersion: null,
      ambientLifeMode: null,
      ambientLifeDetailCount: 0,
      hazardReadabilityMode: openingTrapDecalPackRef.current.loaded && openingHazardDecalPackRef.current.loaded
        ? 'painted-egypt-trap-decals-complete'
        : 'soft-warning-cues',
      combatIntensityPassActive: true,
      combatIntensityVersion: COMBAT_INTENSITY_VERSION,
      combatReadabilityMode: 'windup-vulnerable-pressure-v1',
      visibleCombatPressureEnemies: [],
      dangerFeedbackActive: current.resources.stamina <= Math.round((current.upgradeEffects?.maxStamina || 100) * 0.3),
      enemyVisualMode: enemySpriteAssetsRef.current.loaded ? 'sprite-atlas-with-grounding' : 'canvas-fallback',
      bossVisualMode: bossSpriteAssetsRef.current.loaded ? 'multi-boss-atlas-fallback-safe' : 'canvas-fallback',
      collectibleVisualMode: collectibleSpriteAssetsRef.current.loaded ? 'sprite-atlas-with-fallback' : 'canvas-fallback',
      playerWeaponVisualMode: playerWeaponSpriteRef.current.loaded ? 'khopesh-sprite-atlas' : 'canvas-fallback',
      desertVisualTuningVersion: DESERT_VISUAL_TUNING_VERSION,
      openingPyramidAssetVersion: OPENING_PYRAMID_ASSET_VERSION,
      openingPyramidAssetLoaded: openingPyramidClimbPackRef.current.loaded,
      openingPyramidFacadeVersion: OPENING_PYRAMID_FACADE_VERSION,
      openingPyramidFacadeLoaded: openingPyramidFacadeRef.current.loaded,
      openingTrapDecalAssetVersion: OPENING_TRAP_DECAL_ASSET_VERSION,
      openingTrapDecalAssetLoaded: openingTrapDecalPackRef.current.loaded,
      openingHazardDecalAssetLoaded: openingHazardDecalPackRef.current.loaded,
      assetGroundingPassActive: true,
      groundedPropCount: 0,
      atmospherePropCount: 0,
      groundLockedAtmospherePropCount: 0,
      atmosphereAssetVersion: EGYPT_ATMOSPHERE_ASSET_VERSION,
      atmosphereAssetLoaded: atmosphereEnvironmentAssetsRef.current.loaded,
      atmosphereGroundingMode: 'ground-locked-floor-assets',
      backgroundPropTintActive: true,
      platformGroundingMode: 'contact-shadow-ledges',
      visibleElevatedPlatforms: [],
      propDrawOrderMode: DECORATIVE_PROP_LAYER_MODE,
      decorativePropLayerMode: DECORATIVE_PROP_LAYER_MODE,
      propDepthTuningVersion: PROP_DEPTH_TUNING_VERSION,
      routeGroundVisualMode: ROUTE_GROUND_VISUAL_MODE,
      routeGroundHazeFixVersion: ROUTE_GROUND_HAZE_FIX_VERSION,
      journeyFlagVisualMode: JOURNEY_FLAG_VISUAL_MODE,
      removedRouteFlagCount: 0,
      floatingAssetWarnings: [],
      assetGroundingVersion: JOURNEY_ASSET_GROUNDING_VERSION,
      visibleEnemySpriteFamilies: [],
      enemySpriteFrameStates: [],
      activeBossSprite: null,
      activeBossSpriteFrame: null,
      activeBossAnimationState: null,
      stoneGuardianSpriteFrame: null,
      ancientConstructSpriteFrame: null,
      visibleToolSprites: [],
      visibleShardSprites: [],
      visibleUpgradeSprites: [],
      visibleObjectiveSprites: [],
      visibleCollectibleCount: 0,
      playerWeaponFrame: getPlayerWeaponFrameKey(getPlayerAttackState(current)),
      playerSpriteFrame: null,
      playerSpriteVisualMode: playerSpriteRef.current.mode || 'canvas-fallback',
      bossDomainActive: Boolean(current.bossDomain),
      playerHitScreenShakeActive: playerImpactShakeProgress > 0,
    };
    const showWorldLabel = (worldX, distance = 150, priority = 'normal') => {
      const near = isPlayerNear(worldX, distance);
      if (priority === 'critical') return near && !labelSuppressionActive && Math.abs(worldX - playerCenterX) < distance;
      if (priority === 'combat') return near && !labelSuppressionActive;
      return near && !labelSuppressionActive;
    };

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    if (playerImpactShakeProgress > 0) {
      ctx.translate(playerImpactShakeX, playerImpactShakeY);
    }

    const chinaBackgroundDrawn = drawChinaRiverValleyBackground(ctx, cameraX);
    const desertBackgroundDrawn = !chinaBackgroundDrawn && drawDesertEntryBackground(ctx, section, cameraX);
    const sectionParallaxDrawn = !chinaBackgroundDrawn && !desertBackgroundDrawn && drawSectionParallaxBackground(ctx, section, cameraX);
    if (chinaBackgroundDrawn) {
      current.renderStats.parallaxLayersActive = true;
      current.renderStats.activeBackgroundSection = 'china-river-valley';
      current.renderStats.backgroundDepthMode = 'china-river-valley-parallax-v3-seam-reduced';
    } else if (desertBackgroundDrawn) {
      current.renderStats.parallaxLayersActive = true;
      current.renderStats.activeBackgroundSection = 'desert-entry';
      current.renderStats.backgroundDepthMode = DESERT_BACKGROUND_DEPTH_MODE;
    } else if (sectionParallaxDrawn) {
      current.renderStats.parallaxLayersActive = true;
      current.renderStats.activeBackgroundSection = section.id;
      current.renderStats.backgroundDepthMode = JOURNEY_BACKGROUND_DEPTH_MODE;
    } else {
      // Sky
      const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      skyGradient.addColorStop(0, atmosphere.skyTop);
      skyGradient.addColorStop(1, atmosphere.skyBottom);
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Parallax Hills
      ctx.fillStyle = section.id === 'catacombs' ? 'rgba(0, 0, 0, 0.28)' : 'rgba(112, 73, 42, 0.16)';
      for (let hill = -160; hill < WORLD_WIDTH; hill += 240) {
        ctx.beginPath();
        ctx.ellipse(hill - cameraX * 0.34, 355, 180, 45, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Parallax Ridges
      ctx.fillStyle = section.id === 'dig-site-entrance' ? 'rgba(34, 84, 61, 0.18)' : 'rgba(53, 40, 30, 0.14)';
      for (let ridge = -260; ridge < WORLD_WIDTH; ridge += 360) {
        ctx.beginPath();
        ctx.ellipse(ridge - cameraX * 0.18, 242, 220, 58, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const parallaxBackgroundDrawn = chinaBackgroundDrawn || desertBackgroundDrawn || sectionParallaxDrawn;

    // --- Ground & Props ---
    if (!parallaxBackgroundDrawn) drawTempleBackdrop(ctx, section, cameraX);
    WORLD_CONTINUITY_LANDMARKS.forEach((landmark) => drawWorldContinuityLandmark(ctx, landmark, cameraX, now));
    WORLD_TRANSITION_STORY_MARKERS.forEach((marker) => drawWorldTransitionMarker(ctx, marker, cameraX, now));
    STORY_PROPS.forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'background'));
    drawParticles(ctx, atmosphere, cameraX, now);

    // --- Environment Layers (Parallax) ---
    if (!parallaxBackgroundDrawn && section.id !== 'ruined-temple') {
      const renderParallaxLayer = (depth, color, heightMult) => {
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
      renderParallaxLayer(0.08, `${atmosphere.skyBottom}66`, 1.3);
      renderParallaxLayer(0.18, `${atmosphere.skyBottom}99`, 0.9);
      renderParallaxLayer(0.28, `${atmosphere.skyBottom}cc`, 0.5);
    }
    drawDesertForegroundAtmosphere(ctx, section, cameraX);
    drawSectionParallaxForeground(ctx, section, cameraX);
    drawOpeningPyramidMasonryBack(ctx, cameraX, now);
    STORY_PROPS.forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'midground'));
    ENVIRONMENT_INTERACTIONS.forEach((item) => drawEnvironmentInteraction(ctx, item, cameraX, now, current));
    drawEgyptAmbientLife(ctx, section, cameraX, now);
    drawConnectedWorldAmbientLife(ctx, section, cameraX, now);
    ENVIRONMENT_EVENTS
      .filter(event => event.dynamic && event.id !== current.dynamicEnvironmentEvent?.id)
      .forEach((event) => {
        const eventSection = getSectionForX(event.x);
        if (eventSection.id !== section.id) return;
        if (!isHorizontallyVisible(event.x, 1, cameraX, 180)) return;
        drawDynamicEnvironmentEvent(ctx, { ...event, preview: true }, cameraX, now, (event.duration || 2.5) * 0.62);
      });
    drawDynamicEnvironmentEvent(ctx, current.dynamicEnvironmentEvent, cameraX, now, current.dynamicEnvironmentEventTimer);
    drawAncientRouteGround(ctx, section, cameraX, now, current);
    STORY_PROPS.forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'grounded'));

    const activeBossDomain = current.bossDomain
      && !current.defeatedMiniBosses.has(current.bossDomain.bossId)
      && !current.bossDomain.suppressVisuals
      ? current.bossDomain
      : null;
    if (activeBossDomain) {
      const domainStartX = worldToScreenX(activeBossDomain.arenaStart, cameraX);
      const domainEndX = worldToScreenX(activeBossDomain.arenaEnd, cameraX);
      const domainWidth = domainEndX - domainStartX;
      if (domainEndX > -80 && domainStartX < CANVAS_WIDTH + 80) {
        const introProgress = current.bossIntroTimer > 0 && current.bossIntro?.id === activeBossDomain.bossId
          ? Math.min(1, current.bossIntroTimer / 3.2)
          : 0;
        ctx.save();
        ctx.fillStyle = activeBossDomain.tint || 'rgba(67, 24, 24, 0.16)';
        ctx.fillRect(Math.max(0, domainStartX), 0, Math.min(CANVAS_WIDTH, domainWidth), CANVAS_HEIGHT);
        if (introProgress > 0) {
          ctx.fillStyle = `rgba(12, 8, 5, ${0.22 + introProgress * 0.2})`;
          ctx.fillRect(Math.max(0, domainStartX), 0, Math.min(CANVAS_WIDTH, domainWidth), CANVAS_HEIGHT);
          [
            { x: current.player.x + current.player.width / 2, label: 'FIELD TEAM' },
            { x: current.bossIntro.focusX, label: 'GUARDIAN' },
          ].forEach(marker => {
            const markerX = worldToScreenX(marker.x, cameraX);
            if (markerX < -80 || markerX > CANVAS_WIDTH + 80) return;
            const pulse = Math.sin(now / 180) * 0.12 + 0.88;
            const glow = ctx.createRadialGradient(markerX, GROUND_Y - 58, 10, markerX, GROUND_Y - 58, 92 * pulse);
            glow.addColorStop(0, `${activeBossDomain.color || '#facc15'}66`);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(markerX, GROUND_Y - 58, 92 * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
            ctx.roundRect(markerX - 48, GROUND_Y - 126, 96, 20, 6);
            ctx.fill();
            ctx.fillStyle = '#fff4d4';
            ctx.font = '900 9px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(marker.label, markerX, GROUND_Y - 112);
          });
        }
        ctx.strokeStyle = activeBossDomain.color || 'rgba(250, 204, 21, 0.72)';
        ctx.lineWidth = 3;
        [domainStartX, domainEndX].forEach((x) => {
          if (x < -20 || x > CANVAS_WIDTH + 20) return;
          ctx.beginPath();
          ctx.moveTo(x, 92);
          ctx.lineTo(x, GROUND_Y + 10);
          ctx.stroke();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
          ctx.fillRect(x - 18, GROUND_Y - 74, 36, 44);
          ctx.fillStyle = '#fef3c7';
          ctx.font = '900 12px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('!', x, GROUND_Y - 46);
        });
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.roundRect(Math.max(20, domainStartX + 20), 102, 230, 34, 8);
        ctx.fill();
        ctx.fillStyle = '#fff4d4';
        ctx.font = '900 11px Outfit, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText((activeBossDomain.name || 'Guardian Domain').toUpperCase(), Math.max(36, domainStartX + 36), 124);
        ctx.restore();
      }
    }

    // --- Entities ---
    PLATFORMS
      .filter(platform => isPlatformAvailable(platform, current))
      .forEach((platform) => drawPlatform(ctx, platform, cameraX, current));
    STORY_PROPS.forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'route-edge'));
    getActiveHiddenRoutes().forEach(route => drawHiddenRouteHint(ctx, route, cameraX, current, now));
    drawSectionTransitionBlend(ctx, cameraX);
    
    HAZARDS.filter(hazard => isHazardAvailable(hazard, current)).forEach((hazard) => drawHazard(ctx, hazard, cameraX, current, now));

    CHECKPOINTS.forEach((checkpoint) => {
      const markerX = checkpoint.markerX ?? checkpoint.x;
      const cx = worldToScreenX(markerX, cameraX);
      if (!isHorizontallyVisible(markerX, 1, cameraX, 130)) return;
      const active = current.activeCheckpoint.id === checkpoint.id;
      const openingCheckpointMarker = checkpoint.id === 'desert-entry';
      ctx.save();
      const checkpointSection = getSectionForX(markerX);
      const checkpointHeight = openingCheckpointMarker ? 154 : active ? 160 : 148;
      const checkpointWidth = checkpointHeight * (openingCheckpointMarker ? 1.36 : 1.48);
      if (openingCheckpointMarker) {
        drawRouteGroundApron(ctx, cx, GROUND_Y - 1, checkpointWidth * 0.52, checkpointSection.id, 0.42, Math.round(markerX));
        drawGroundDustLip(ctx, cx, GROUND_Y + 2, checkpointWidth * 0.44, 'rgba(226, 151, 56, 0.18)');
        ctx.restore();
        return;
      }
      const checkpointDrawn = DRAW_JOURNEY_FLAG_MARKERS && drawMarkerSprite(
          ctx,
          markerSpriteAssetsRef.current,
          'checkpoint',
          {
            x: cx - checkpointWidth / 2,
            y: GROUND_Y - checkpointHeight + (openingCheckpointMarker ? 20 : 10),
            width: checkpointWidth,
            height: checkpointHeight,
          },
          0,
        );
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      if (checkpointDrawn) {
        drawRouteGroundApron(ctx, cx, GROUND_Y - 1, checkpointWidth * (openingCheckpointMarker ? 0.84 : 0.9), checkpointSection.id, openingCheckpointMarker ? 0.78 : active ? 0.96 : 0.8, Math.round(markerX));
        drawContactShadow(ctx, cx, GROUND_Y + 2, checkpointWidth * (openingCheckpointMarker ? 0.72 : 0.76), openingCheckpointMarker ? 0.24 : active ? 0.22 : 0.16, 1.1);
        drawGroundDustLip(ctx, cx, GROUND_Y + 2, checkpointWidth * (openingCheckpointMarker ? 0.68 : 0.72), openingCheckpointMarker ? 'rgba(226, 151, 56, 0.28)' : 'rgba(116, 72, 36, 0.24)');
        ctx.restore();
        return;
      }
      drawRouteGroundApron(ctx, cx, GROUND_Y - 1, 92, checkpointSection.id, active ? 0.86 : 0.7, Math.round(markerX));
      drawContactShadow(ctx, cx, GROUND_Y + 1, 76, active ? 0.22 : 0.14, 1);
      drawGroundDustLip(ctx, cx, GROUND_Y + 1, 70, 'rgba(116, 72, 36, 0.24)');
      ctx.fillStyle = active ? '#d2b277' : '#9f7646';
      ctx.strokeStyle = active ? 'rgba(22, 101, 52, 0.86)' : 'rgba(69, 26, 3, 0.62)';
      ctx.lineWidth = active ? 2.25 : 1.75;
      [
        { x: -22, y: -13, w: 26, h: 13 },
        { x: 1, y: -17, w: 24, h: 17 },
        { x: -11, y: -33, w: 22, h: 17 },
      ].forEach((stone, index) => {
        ctx.beginPath();
        ctx.roundRect(cx + stone.x, GROUND_Y + stone.y, stone.w, stone.h, 3);
        ctx.globalAlpha = active ? 1 : 0.9 - index * 0.04;
        ctx.fill();
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      if (active) {
        ctx.strokeStyle = 'rgba(22, 101, 52, 0.74)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, GROUND_Y - 31, 20 + Math.sin(now / 280) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(22, 101, 52, 0.62)';
        ctx.beginPath();
        ctx.ellipse(cx, GROUND_Y - 28, 8 + Math.sin(now / 260), 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!openingCheckpointMarker && (active || showWorldLabel(markerX, 130))) {
        drawFieldNoteLabel(ctx, cx, checkpoint.y - 20, active ? 'Checkpoint' : checkpoint.name, active ? '#166534' : '#78350f');
      }
      ctx.restore();
    });

    ROUTE_GATES.forEach((gate) => {
      if (current.openedRouteGateIds.has(gate.id)) return;
      const gx = worldToScreenX(gate.x, cameraX);
      if (!isHorizontallyVisible(gate.x, gate.width, cameraX, 100)) return;
      const requirements = getGateRequirements(gate, current);
      const complete = requirements.every(r => r.met);
      drawRouteGate(ctx, gate, gx, current, complete);
    });
    drawMissingObjectiveMarker(ctx, activeGateGuidance, cameraX, now);

    STAGE_ENTRANCE_FEATURES.forEach((feature) => {
      if (!shouldRenderStageEntranceFeatureForState(feature, current)) return;
      drawStageEntranceFeature(ctx, feature, cameraX, now);
    });

    current.enemies.forEach((enemy) => {
      const ex = worldToScreenX(enemy.x, cameraX);
      if (!isHorizontallyVisible(enemy.x, enemy.width, cameraX, 50)) return;
      if (!enemy.defeated && enemy.encounterRole && current.renderStats) {
        current.renderStats.visibleCombatPressureEnemies = Array.from(new Set([
          ...(current.renderStats.visibleCombatPressureEnemies || []),
          enemy.id,
        ])).slice(-8);
      }
      
      ctx.save();
      const shakeX = enemy.hitFlash > 0 ? Math.sin(now / 20) * 5 : 0;
      if (!enemy.defeated) drawEnemyAttackTell(ctx, enemy, ex, cameraX, now, false, true);

      // Main Visual
      const spriteDrawn = drawSmallEnemySprite(ctx, enemy, ex, now, shakeX)
        || drawLinkedEnemySprite(ctx, enemy, ex, now, shakeX);
      if (!spriteDrawn) {
        if (enemy.defeated) {
          drawContactShadow(ctx, ex + enemy.width / 2, enemy.y + enemy.height + 3, enemy.width * 0.62, 0.12, 0.75);
          drawGroundDustLip(ctx, ex + enemy.width / 2, enemy.y + enemy.height + 2, enemy.width * 0.68, 'rgba(95, 58, 27, 0.24)');
        } else {
          drawContactShadow(ctx, ex + enemy.width / 2, enemy.y + enemy.height + 3, enemy.width * 0.72, 0.16, 0.75);
          ctx.fillStyle = enemy.type === 'guardian' || enemy.type === 'statue' ? '#6b7280' : '#78350f';
          ctx.strokeStyle = 'rgba(30, 18, 8, 0.45)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(ex + enemy.width / 2 + shakeX, enemy.y + enemy.height * 0.55, enemy.width * 0.45, enemy.height * 0.43, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
      
      // Health Bar (Small)
      if (!enemy.defeated && enemy.health > 1) {
        const enemyDrawBox = getEnemySpriteDrawBox(enemy, ex, 0, getCombatMode(enemy)) || {
          x: ex,
          y: enemy.y,
          width: enemy.width,
          height: enemy.height,
        };
        const enemyBarWidth = Math.max(34, enemyDrawBox.width * 0.56);
        const enemyBarX = clamp(enemyDrawBox.x + enemyDrawBox.width / 2 - enemyBarWidth / 2, 10, CANVAS_WIDTH - enemyBarWidth - 10);
        const enemyBarY = Math.max(18, enemyDrawBox.y - 9);
        const enemyHealthRatio = clamp(enemy.health / enemy.maxHealth, 0, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(enemyBarX, enemyBarY, enemyBarWidth, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(enemyBarX, enemyBarY, enemyHealthRatio * enemyBarWidth, 4);
      }

      ctx.restore();
    });

    current.miniBosses.forEach((boss) => {
      if (boss.defeated) return;
      const bx = worldToScreenX(boss.x, cameraX);
      if (!isHorizontallyVisible(boss.x, boss.width, cameraX, 100)) return;
      drawMiniBoss(ctx, boss, bx, now);
      drawEnemyAttackTell(ctx, boss, bx, cameraX, now, true, true);
    });

    (current.bossKeyItems || []).forEach((keyItem) => {
      if (!keyItem.dropped || keyItem.collected) return;
      drawCollectible(ctx, keyItem.x, keyItem.y, cameraX, now, keyItem.label || 'S', keyItem.color || '#b45309', false, false, {
        key: 'loreTablet',
        kind: 'objective',
        size: 44,
        ringSize: 54,
        glowAlpha: 0.42,
        shadowAlpha: 0.2,
        bobAmplitude: 2,
        anchor: 'center',
        nearGlowDistance: 170,
        ringKey: 'objectiveHighlightRing',
      });
      if (showWorldLabel(keyItem.x, 180, 'critical')) {
        drawFieldNoteLabel(ctx, keyItem.x - cameraX, keyItem.y - 34, keyItem.name, keyItem.color || '#b45309');
      }
    });

    const getShardVisualBaseY = (shard) => {
      const platform = PLATFORMS
        .filter(p => p.y !== GROUND_Y && isPlatformAvailable(p, current))
        .find(p => (
          shard.x >= p.x - 8
          && shard.x <= p.x + p.width + 8
          && Math.abs(shard.y - (p.y + p.height)) <= 34
        ));
      if (platform) return platform.y - 4;
      return shard.y + COLLECTIBLE_VISUAL_BASE.relicShard.anchorYOffset;
    };

    RELIC_SHARDS.forEach(shard => {
      if (current.collectedShardIds.has(shard.id)) return;
      const routeRewardAccessible = isRouteRewardAccessible(shard.routeId, current);
      const visible = (!shard.hidden || current.collectedUpgrades.has('historian-vision') || routeRewardAccessible)
        && (!shard.routeId || routeRewardAccessible);
      if (visible) {
        drawCollectible(ctx, shard.x, shard.y, cameraX, now, '💎', '#f59e0b', shard.hidden, true, {
          key: 'relicShard',
          kind: 'shard',
          size: COLLECTIBLE_VISUAL_BASE.relicShard.size,
          ringSize: COLLECTIBLE_VISUAL_BASE.relicShard.ringSize,
          glowAlpha: COLLECTIBLE_VISUAL_BASE.relicShard.glowAlpha,
          shadowAlpha: COLLECTIBLE_VISUAL_BASE.relicShard.shadowAlpha,
          bobAmplitude: COLLECTIBLE_VISUAL_BASE.relicShard.bobAmplitude,
          sparkleAlpha: COLLECTIBLE_VISUAL_BASE.relicShard.sparkleAlpha,
          sparkleSize: COLLECTIBLE_VISUAL_BASE.relicShard.sparkleSize,
          anchorYOffset: COLLECTIBLE_VISUAL_BASE.relicShard.anchorYOffset,
          nearGlowDistance: COLLECTIBLE_VISUAL_BASE.relicShard.nearGlowDistance,
          baseY: getShardVisualBaseY(shard),
          ringKey: 'availableGlowRing',
          shadowBlur: 8,
        });
      }
    });

    getActiveSecretCollectibles().forEach(secret => {
      if (current.collectedSecretIds?.has(secret.id)) return;
      const discoveredRoute = current.discoveredHiddenRouteIds?.has(secret.routeId);
      const routeRewardAccessible = isRouteRewardAccessible(secret.routeId, current);
      if (!routeRewardAccessible && Math.abs(secret.x - current.player.x) > 260) return;
      drawCollectible(ctx, secret.x, secret.y, cameraX, now, secret.shortName?.slice(0, 1) || 'S', secret.color || '#b45309', true, false, {
        key: 'loreTablet',
        kind: 'objective',
        size: 34,
        ringSize: 48,
        glowAlpha: discoveredRoute ? 0.42 : 0.22,
        shadowAlpha: 0.18,
        bobAmplitude: 2,
        sparkleAlpha: 0.55,
        sparkleSize: 2.5,
        anchor: 'center',
        nearGlowDistance: 190,
        ringKey: 'objectiveHighlightRing',
      });
      if (showWorldLabel(secret.x, 120, 'critical')) {
        drawFieldNoteLabel(ctx, secret.x - cameraX, secret.y - 30, secret.shortName || secret.name, secret.color || '#b45309');
      }
    });

    LORE_TABLETS.forEach(tablet => {
      if (current.collectedTabletIds?.has(tablet.id)) return;
      if (tablet.routeId && !isRouteRewardAccessible(tablet.routeId, current)) return;
      drawCollectible(ctx, tablet.x, tablet.y, cameraX, now, 'T', '#facc15', true, false, {
        key: 'loreTablet',
        kind: 'objective',
        size: 30,
        ringSize: 42,
        glowAlpha: 0.28,
        shadowAlpha: 0.14,
        bobAmplitude: 1.6,
        sparkleAlpha: 0.42,
        sparkleSize: 2,
        anchor: 'center',
        nearGlowDistance: 150,
        ringKey: 'objectiveHighlightRing',
      });
    });

    UPGRADES.forEach(upgrade => {
      if (!current.collectedUpgrades.has(upgrade.id)) {
        drawCollectible(ctx, upgrade.x, upgrade.y, cameraX, now, upgrade.emoji, '#2563eb', false, false, {
          key: getUpgradeSpriteKey(upgrade.id),
          kind: 'upgrade',
          size: COLLECTIBLE_VISUAL_BASE.upgrade.size,
          ringSize: COLLECTIBLE_VISUAL_BASE.upgrade.ringSize,
          glowAlpha: COLLECTIBLE_VISUAL_BASE.upgrade.glowAlpha,
          shadowAlpha: COLLECTIBLE_VISUAL_BASE.upgrade.shadowAlpha,
          bobAmplitude: COLLECTIBLE_VISUAL_BASE.upgrade.bobAmplitude,
          sparkleAlpha: COLLECTIBLE_VISUAL_BASE.upgrade.sparkleAlpha,
          sparkleSize: COLLECTIBLE_VISUAL_BASE.upgrade.sparkleSize,
          anchorYOffset: COLLECTIBLE_VISUAL_BASE.upgrade.anchorYOffset,
          nearGlowDistance: COLLECTIBLE_VISUAL_BASE.upgrade.nearGlowDistance,
          hideGlow: true,
        });
        if (showWorldLabel(upgrade.x, 135, 'critical')) {
          drawFieldNoteLabel(ctx, upgrade.x - cameraX, upgrade.y - 30, upgrade.name, '#2563eb');
        }
      }
    });

    TOOL_LAYOUT.forEach(toolPos => {
      if (!current.collectedToolIds.has(toolPos.id)) {
        const tool = JOURNEY_TOOLS.find(t => t.id === toolPos.id);
        drawCollectible(ctx, toolPos.x, toolPos.y, cameraX, now, tool.emoji, '#d4af37', false, false, {
          key: getToolSpriteKey(toolPos.id),
          kind: 'tool',
          size: toolPos.id === 'field-guide-page'
            ? COLLECTIBLE_VISUAL_BASE.fieldTool.fieldGuideSize
            : COLLECTIBLE_VISUAL_BASE.fieldTool.size,
          ringSize: COLLECTIBLE_VISUAL_BASE.fieldTool.ringSize,
          glowAlpha: COLLECTIBLE_VISUAL_BASE.fieldTool.glowAlpha,
          shadowAlpha: COLLECTIBLE_VISUAL_BASE.fieldTool.shadowAlpha,
          bobAmplitude: COLLECTIBLE_VISUAL_BASE.fieldTool.bobAmplitude,
          sparkleAlpha: COLLECTIBLE_VISUAL_BASE.fieldTool.sparkleAlpha,
          sparkleSize: COLLECTIBLE_VISUAL_BASE.fieldTool.sparkleSize,
          anchorYOffset: COLLECTIBLE_VISUAL_BASE.fieldTool.anchorYOffset,
          nearGlowDistance: COLLECTIBLE_VISUAL_BASE.fieldTool.nearGlowDistance,
          hideGlow: true,
        });
        if (showWorldLabel(toolPos.x, 125)) {
          drawFieldNoteLabel(ctx, toolPos.x - cameraX, toolPos.y - 30, tool.name, '#b45309');
        }
      }
    });

    OBJECTIVE_MARKERS.forEach(marker => {
      if (current.collectedObjectiveIds.has(marker.id)) return;
      const mx = worldToScreenX(marker.x, cameraX);
      if (!isHorizontallyVisible(marker.x, 1, cameraX, 50)) return;
      const emoji = marker.type === 'switch' ? '⚙️' : marker.type === 'glyph' ? '📜' : marker.type === 'escape' ? '🏃' : '🚩';
      const markerNeeded = activeGateGuidance?.nearestMissingObjective?.id === marker.id;
      ctx.save();
      drawCollectible(ctx, marker.x + 15, marker.y + 12, cameraX, now, emoji, marker.color || '#b45309', false, false, {
        key: getObjectiveSpriteKey(marker.type),
        kind: 'objective',
        size: marker.type === 'map-tablet'
          ? COLLECTIBLE_VISUAL_BASE.objective.mapTabletSize
          : COLLECTIBLE_VISUAL_BASE.objective.size,
        ringSize: COLLECTIBLE_VISUAL_BASE.objective.ringSize,
        glowAlpha: 0,
        shadowAlpha: COLLECTIBLE_VISUAL_BASE.objective.shadowAlpha,
        bobAmplitude: COLLECTIBLE_VISUAL_BASE.objective.bobAmplitude,
        sparkleAlpha: COLLECTIBLE_VISUAL_BASE.objective.sparkleAlpha,
        sparkleSize: COLLECTIBLE_VISUAL_BASE.objective.sparkleSize,
        anchorYOffset: COLLECTIBLE_VISUAL_BASE.objective.anchorYOffset,
        nearGlowDistance: COLLECTIBLE_VISUAL_BASE.objective.nearGlowDistance,
        hideGlow: true,
      });
      if (showWorldLabel(marker.x, markerNeeded ? 170 : 120, markerNeeded ? 'critical' : 'normal')) {
        drawFieldNoteLabel(ctx, mx + 15, marker.y - 15, marker.label, marker.color || '#b45309');
      }
      ctx.restore();
    });

    drawDiscoveryEntrance(ctx, DISCOVERY_ENTRANCE, cameraX, current, now);

    const suppressRuntimeAttackArc = playerSpriteRef.current.mode === 'hero-atlas'
      && playerSpriteRef.current.atlas?.draw?.suppressRuntimeAttackArc;
    if (current.attackTimer > 0 && !suppressRuntimeAttackArc) {
      drawAttackArc(ctx, current.playerAttackBox, cameraX, player.direction, '#facc15', getPlayerAttackState(current));
    } else if (current.attackTimer > 0 && current.renderStats) {
      current.renderStats.playerAttackArcMode = 'integrated-hero-atlas';
    }
    drawOpeningSphinxEncounter(ctx, current.openingSphinxEncounter, cameraX, now);
    drawCombatEffects(ctx, current.combatHitEffects, cameraX, now);
    drawPlayerSprite(ctx, player.x - cameraX, player.y, player.width, player.height, player.direction, player.invulnerable, now);
    STAGE_ENTRANCE_FEATURES.forEach((feature) => {
      if (!shouldRenderStageEntranceFeatureForState(feature, current)) return;
      drawStageEntranceForegroundOccluder(ctx, feature, cameraX, now);
    });
    drawOpeningThresholdScene(ctx, current.openingThresholdScene, cameraX, now);
    drawTempleThresholdTransition(ctx, current.templeThresholdTransition, now);

    const staminaRatio = current.resources.stamina / Math.max(1, current.upgradeEffects?.maxStamina || 100);
    if (staminaRatio <= 0.3) {
      current.renderStats.dangerFeedbackActive = true;
      const pulse = 0.55 + Math.sin(now / 130) * 0.18;
      const alpha = clamp((0.3 - staminaRatio) / 0.3, 0.18, 0.42) * pulse;
      ctx.save();
      const dangerGradient = ctx.createRadialGradient(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        CANVAS_WIDTH * 0.2,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        CANVAS_WIDTH * 0.68,
      );
      dangerGradient.addColorStop(0, 'rgba(127, 29, 29, 0)');
      dangerGradient.addColorStop(1, `rgba(127, 29, 29, ${alpha})`);
      ctx.fillStyle = dangerGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    }

    if (player.hitFeedbackTimer > 0) {
      ctx.save();
      ctx.fillStyle = '#fecaca';
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 2;
      ctx.font = '900 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      const px = player.x - cameraX + player.width / 2;
      ctx.fillText(`-${player.lastDamage} STAMINA`, px, player.y - 24 - player.hitFeedbackTimer * 8);
      ctx.strokeText(`-${player.lastDamage} STAMINA`, px, player.y - 24 - player.hitFeedbackTimer * 8);
      ctx.restore();
    }

    ctx.restore();

    // CINEMATIC CARDS
    const featureCard = current.bossIntro || current.environmentEvent || current.cinematicEvent;
    if (featureCard) {
      const isGuardianCard = Boolean(current.bossIntro);
      const isSectionCard = Boolean(current.sectionTransition);
      const cardWidth = isGuardianCard ? 520 : isSectionCard ? 430 : 500;
      const cardHeight = isGuardianCard ? 90 : isSectionCard ? 58 : 70;
      const cardX = (CANVAS_WIDTH - cardWidth) / 2;
      const cardY = isSectionCard ? 86 : 78;
      const cardCenterX = cardX + cardWidth / 2;
      const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
      if (isGuardianCard) {
        cardGradient.addColorStop(0, 'rgba(15, 23, 42, 0.92)');
        cardGradient.addColorStop(1, 'rgba(48, 35, 22, 0.92)');
      } else {
        cardGradient.addColorStop(0, 'rgba(42, 31, 24, 0.78)');
        cardGradient.addColorStop(1, 'rgba(81, 55, 34, 0.78)');
      }
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.34)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = cardGradient;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, isGuardianCard ? 12 : 10);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = isGuardianCard ? 'rgba(250, 204, 21, 0.72)' : 'rgba(255, 241, 198, 0.24)';
      ctx.lineWidth = isGuardianCard ? 3 : 1.5;
      ctx.beginPath();
      ctx.roundRect(cardX + 3, cardY + 3, cardWidth - 6, cardHeight - 6, isGuardianCard ? 10 : 8);
      ctx.stroke();
      if (isGuardianCard) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.18)';
        ctx.beginPath();
        ctx.arc(cardX + 40, cardY + cardHeight / 2, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fff4d4';
      ctx.font = isGuardianCard ? '900 20px Outfit' : isSectionCard ? '900 16px Outfit' : '900 17px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(featureCard.name || featureCard.title, cardCenterX, cardY + (isSectionCard ? 22 : 30));
      ctx.font = isSectionCard ? '800 11px Outfit' : '800 12px Outfit';
      ctx.fillStyle = isSectionCard ? 'rgba(255, 247, 226, 0.88)' : '#fff4d4';
      ctx.fillText(featureCard.message || '', cardCenterX, cardY + (isGuardianCard ? 60 : isSectionCard ? 42 : 54));
      ctx.textAlign = 'start';
    }
  }, [backgroundPackId, drawAncientRouteGround, drawAttackArc, drawCollectible, drawCombatEffects, drawConnectedWorldAmbientLife, drawContactShadow, drawChinaRiverValleyBackground, drawDesertEntryBackground, drawDesertForegroundAtmosphere, drawDiscoveryEntrance, drawDynamicEnvironmentEvent, drawEgyptAmbientLife, drawEnemyAttackTell, drawEnvironmentInteraction, drawGroundDustLip, drawHazard, drawHiddenRouteHint, drawLinkedEnemySprite, drawMiniBoss, drawMissingObjectiveMarker, drawOpeningPyramidMasonryBack, drawOpeningSphinxEncounter, drawOpeningThresholdScene, drawParticles, drawPlatform, drawRouteGate, drawRouteGroundApron, drawSectionParallaxBackground, drawSectionParallaxForeground, drawSectionTransitionBlend, drawSmallEnemySprite, drawStageEntranceFeature, drawStageEntranceForegroundOccluder, drawStoryProp, drawTempleBackdrop, drawTempleThresholdTransition, drawWorldContinuityLandmark, drawWorldTransitionMarker, getActiveHiddenRoutes, getActiveSecretCollectibles, getCombatMode, getGateGuidance, getGateRequirements, getPlayerAttackState, isRouteRewardAccessible, drawPlayerSprite, drawFieldNoteLabel]);

  const queueAttack = useCallback(() => {
    const current = stateRef.current;
    if (briefingOpen || current.failed || current.completed || current.openingCameraRevealTimer > 0 || current.openingThresholdScene?.lockMovement || current.templeThresholdTransition?.lockMovement) return;
    if (current.attackCooldown > 0 || current.attackWindupTimer > 0 || current.attackTimer > 0 || current.attackRecoilTimer > 0) return;
    current.attackQueued = true;
  }, [briefingOpen]);

  const completeOpeningThresholdScene = useCallback((current) => {
    const openingCheckpoint = CHECKPOINTS.find(checkpoint => checkpoint.id === 'desert-entry');
    const openingSection = SECTIONS.find(section => section.id === 'desert-entry');
    if (openingCheckpoint) {
      current.player.vx = 0;
      current.player.vy = 0;
      current.player.direction = 1;
      current.player.y = current.openingThresholdScene?.playerFallEndY ?? current.player.y;
      current.player.onGround = true;
      current.activeCheckpoint = openingCheckpoint;
      current.cameraX = clampCameraX(current.player.x - CANVAS_WIDTH * 0.42);
      current.targetCameraX = current.cameraX;
    }
    current.openingThresholdScene = null;
    current.openingSphinxEncounter = null;
    current.dynamicEnvironmentEvent = null;
    current.dynamicEnvironmentEventTimer = 0;
    current.collapsedPlatformIds.delete('opening-scarab-seal-summit');
    current.sectionTransition = null;
    current.sectionTransitionTimer = 0;
    current.lastSectionId = openingSection?.id || 'desert-entry';
    current.notice = SCARAB_SEAL_TRIGGER.guideFollowUpLine;
    current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.18);
    current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.08);
    syncHud();
  }, [syncHud]);

  const enterLevelFromThreshold = useCallback((current, transition) => {
    const destinationSectionId = transition?.to || transition?.revealSectionId || 'ruined-temple';
    const transitionConfig = transition?.levelTransition || DEFAULT_LEVEL_TRANSITION;
    const destinationCheckpoint = CHECKPOINTS.find(checkpoint => checkpoint.id === destinationSectionId);
    const destinationSection = SECTIONS.find(section => section.id === destinationSectionId);
    const firstDestinationObjective = OBJECTIVE_MARKERS.find(marker => marker.sectionId === destinationSectionId);
    const player = current.player;
    const cinematicEntryX = Math.max(
      destinationCheckpoint?.x ?? 0,
      (destinationSection?.start ?? 1500) + CANVAS_WIDTH * 1.25,
    );
    const objectiveLead = transitionConfig.revealObjectiveLead ?? DEFAULT_LEVEL_TRANSITION.revealObjectiveLead;
    const destinationX = firstDestinationObjective
      ? Math.min(cinematicEntryX, firstDestinationObjective.x - player.width - objectiveLead)
      : cinematicEntryX;
    player.x = clamp(destinationX, 0, WORLD_WIDTH - player.width);
    player.y = (destinationCheckpoint?.y ?? GROUND_Y) - player.height;
    player.vx = 0;
    player.vy = 0;
    player.direction = 1;
    player.onGround = true;
    player.jumpBufferTimer = 0;
    player.coyoteTimer = 0;
    current.activeCheckpoint = destinationCheckpoint || current.activeCheckpoint;
    current.lastSectionId = destinationSection?.id || destinationSectionId;
    if (transition?.from) current.completedObjectiveIds.add(transition.from);
    current.cameraX = clampCameraX(player.x - CANVAS_WIDTH * 0.42);
    current.targetCameraX = current.cameraX;
    current.sectionTransition = null;
    current.sectionTransitionTimer = 0;
    current.environmentEvent = null;
    current.environmentEventTimer = 0;
    current.dynamicEnvironmentEvent = null;
    current.dynamicEnvironmentEventTimer = 0;
    current.notice = transitionConfig.destinationNotice || DEFAULT_LEVEL_TRANSITION.destinationNotice;
    current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.28);
    current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.18);
    audioControls?.playTransition?.();
    syncHud();
  }, [audioControls, syncHud]);

  const startLevelThresholdEncounter = useCallback((current, transition) => {
    const encounter = transition?.levelTransition?.encounter;
    if (!encounter) return false;
    const player = current.player;
    current.openingSphinxEncounter = {
      id: encounter.id || `${transition.id}-encounter`,
      name: encounter.name || 'Guardian',
      playerX: player.x,
      x: player.x + (encounter.xOffset ?? 330),
      y: OPENING_SPHINX_FOOT_Y - OPENING_SPHINX_SCREEN_Y_OFFSET - 126,
      lines: encounter.lines || [],
      message: (encounter.lines || []).join(' '),
      duration: encounter.duration || 5.3,
      timer: encounter.duration || 5.3,
      silhouetteReveal: false,
      suppressDialogue: false,
      dialogueX: encounter.dialogueX,
      dialogueY: encounter.dialogueY,
    };
    current.notice = encounter.notice || `${encounter.name || 'A guardian'} blocks the path.`;
    current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.2);
    current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.14);
    audioControls?.playExpeditionSfx?.('openingThresholdAtmosphere');
    syncHud();
    return true;
  }, [audioControls, syncHud]);

  const startTempleThresholdTransition = useCallback((current, gate, feature = getStageEntranceForGate(gate)) => {
    if (!feature?.levelTransition) return false;
    const transitionConfig = feature.levelTransition || DEFAULT_LEVEL_TRANSITION;
    const player = current.player;
    current.templeThresholdTransition = {
      id: `${feature.from}-to-${feature.to}-threshold`,
      featureId: feature.id,
      from: feature.from,
      to: feature.to,
      revealSectionId: transitionConfig.revealSectionId || feature.to,
      phase: 'doorway-fade',
      lockMovement: true,
      gateId: gate.id,
      gateX: feature.x ?? gate.x,
      playerX: player.x,
      playerY: player.y,
      switched: false,
      levelTransition: transitionConfig,
      title: transitionConfig.title || DEFAULT_LEVEL_TRANSITION.title,
      subtitle: transitionConfig.subtitle || DEFAULT_LEVEL_TRANSITION.subtitle,
      accent: feature.glow || feature.accent,
      duration: TEMPLE_THRESHOLD_TRANSITION_DURATION,
      timer: TEMPLE_THRESHOLD_TRANSITION_DURATION,
    };
    current.attackQueued = false;
    current.sectionTransition = null;
    current.sectionTransitionTimer = 0;
    current.environmentEvent = null;
    current.environmentEventTimer = 0;
    current.dynamicEnvironmentEvent = null;
    current.dynamicEnvironmentEventTimer = 0;
    current.notice = 'Asha steps through the temple doorway.';
    player.vx = 0;
    player.vy = 0;
    player.direction = 1;
    audioControls?.playExpeditionSfx?.('openingThresholdFinalPulse');
    return true;
  }, [audioControls]);

  const update = useCallback((dt) => {
    const current = stateRef.current;
    if (briefingOpen || current.completed || current.failed) return;

    const player = current.player;
    const upgradeEffects = current.upgradeEffects || {};
    const maxStamina = upgradeEffects.maxStamina || 100;
    const knockbackMultiplier = upgradeEffects.knockbackMultiplier || 1;
    const keys = keysRef.current;
    const left = keys.ArrowLeft || keys.KeyA;
    const right = keys.ArrowRight || keys.KeyD;
    const jump = keys.ArrowUp || keys.KeyW || keys.Space;
    const approach = (value, target, amount) => {
      if (value < target) return Math.min(value + amount, target);
      if (value > target) return Math.max(value - amount, target);
      return value;
    };

    const applyAttackStaminaCost = (amount, reason) => {
      if (!amount) return;
      current.resources.stamina = Math.max(1, current.resources.stamina - amount);
      current.playerAttackStaminaCost = amount;
      current.lastStaminaDelta = -amount;
      current.lastStaminaLossReason = reason;
      current.staminaFeedbackTimer = Math.max(current.staminaFeedbackTimer, 0.65);
    };
    const addRewardPulse = (type, x, y, text, options = {}) => {
      addCombatEffect(current, {
        type,
        x,
        y,
        text,
        color: options.color || '#facc15',
        fill: options.fill,
        radius: options.radius,
        alpha: options.alpha,
        timer: options.timer || 0.58,
        maxTimer: options.maxTimer || options.timer || 0.58,
      });
    };
    const activateScarabSealForQueenEncounter = () => {
      current.scarabSealActivated = true;
      current.openingConfrontationSeen = true;
      current.collapsedPlatformIds.add('opening-scarab-seal-summit');
      current.triggeredEnvironmentEventIds.add(SCARAB_SEAL_TRIGGER.id);
      current.dynamicEnvironmentEvent = {
        id: SCARAB_SEAL_TRIGGER.id,
        sectionId: SCARAB_SEAL_TRIGGER.sectionId,
        type: SCARAB_SEAL_TRIGGER.eventType,
        x: SCARAB_SEAL_TRIGGER.x,
        name: SCARAB_SEAL_TRIGGER.eventName,
        message: '',
        duration: Math.min(SCARAB_SEAL_TRIGGER.duration, 1.4),
        shake: SCARAB_SEAL_TRIGGER.shake,
        card: false,
      };
      current.dynamicEnvironmentEventTimer = current.dynamicEnvironmentEvent.duration;
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.24);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, SCARAB_SEAL_TRIGGER.shake * 0.7);
      addRewardPulse('scarab-seal-awakening', SCARAB_SEAL_TRIGGER.x, SCARAB_SEAL_TRIGGER.y, 'SEAL AWAKENS', {
        color: '#b45309',
        fill: 'rgba(180, 83, 9, 0.12)',
        radius: 58,
        timer: 0.72,
      });
      audioControls?.playExpeditionSfx?.('openingThresholdAtmosphere');
    };
    const markSecretSetProgress = (secret) => {
      if (!secret?.setId || current.completedCollectionSetIds?.has(secret.setId)) return;
      const setItems = getActiveSecretCollectibles().filter(item => item.setId === secret.setId);
      if (setItems.length > 0 && setItems.every(item => current.collectedSecretIds?.has(item.id))) {
        current.completedCollectionSetIds.add(secret.setId);
        current.notice = `Collection Complete: ${secret.setId === 'china-secrets' ? 'Ancient China secret finds' : 'Ancient Egypt secret finds'}.`;
        current.cinematicEvent = {
          id: `${secret.setId}-complete`,
          name: 'Collection Complete',
          message: 'The field journal now holds a complete set of hidden discoveries.',
          temporary: true,
        };
        current.cinematicTimer = 2.9;
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.045);
        addRewardPulse('collection-complete', secret.x, secret.y, 'COLLECTION COMPLETE', {
          color: '#22c55e',
          fill: 'rgba(34, 197, 94, 0.11)',
          radius: 64,
          timer: 0.82,
        });
        audioControls?.playLevelUp?.();
      }
    };

    // Timers
    current.cinematicTimer = Math.max(0, current.cinematicTimer - dt);
    if (current.cinematicTimer <= 0 && current.cinematicEvent?.temporary) current.cinematicEvent = null;
    current.postBossRewardTimer = Math.max(0, (current.postBossRewardTimer || 0) - dt);
    if (current.postBossRewardTimer <= 0 && current.postBossReward) current.postBossReward = null;
    current.itemPurposeNoticeTimer = Math.max(0, (current.itemPurposeNoticeTimer || 0) - dt);
    current.damageNoticeTimer = Math.max(0, (current.damageNoticeTimer || 0) - dt);
    current.openingCameraRevealTimer = Math.max(0, (current.openingCameraRevealTimer || 0) - dt);
    current.bossIntroTimer = Math.max(0, current.bossIntroTimer - dt);
    if (current.bossIntroTimer <= 0) {
      if (current.bossIntro) current.bossIntro = null;
      if (current.pendingGuardianChallenge && !current.activeGuardianChallenge) {
        current.activeGuardianChallenge = current.pendingGuardianChallenge;
        current.pendingGuardianChallenge = null;
      }
    }
    current.environmentEventTimer = Math.max(0, current.environmentEventTimer - dt);
    if (current.environmentEventTimer <= 0 && current.environmentEvent) current.environmentEvent = null;
    if (current.openingSphinxEncounter) {
      current.openingSphinxEncounter.timer = Math.max(0, current.openingSphinxEncounter.timer - dt);
      if (current.openingSphinxEncounter.timer <= 0) current.openingSphinxEncounter = null;
    }
    if (current.openingThresholdScene) {
      current.openingThresholdScene.timer = Math.max(0, current.openingThresholdScene.timer - dt);
      current.openingThresholdScene.activeLine = getOpeningThresholdDialogueLine(current.openingThresholdScene);
      const thresholdElapsed = clamp(
        (current.openingThresholdScene.duration || 0) - (current.openingThresholdScene.timer || 0),
        0,
        current.openingThresholdScene.duration || 0,
      );
      const fallDelay = current.openingThresholdScene.playerFallDelay ?? OPENING_THRESHOLD_FALL_DELAY_SECONDS;
      const fallDuration = current.openingThresholdScene.playerFallDuration ?? OPENING_THRESHOLD_FALL_DURATION_SECONDS;
      const thresholdFallProgress = clamp((thresholdElapsed - fallDelay) / fallDuration, 0, 1);
      if (thresholdFallProgress > 0 && !current.openingThresholdScene.fallSfxPlayed) {
        current.openingThresholdScene.fallSfxPlayed = true;
        audioControls?.playExpeditionSfx?.('openingThresholdFall');
      }
      current.openingThresholdScene.stairwellRevealActive = current.openingThresholdScene.timer <= OPENING_THRESHOLD_STAIR_REVEAL_SECONDS;
      if (current.openingThresholdScene.stairwellRevealActive && !current.openingThresholdScene.stoneShiftSfxPlayed) {
        current.openingThresholdScene.stoneShiftSfxPlayed = true;
        audioControls?.playExpeditionSfx?.('openingThresholdStoneShift');
      }
      if (current.openingThresholdScene.timer <= 4.5 && !current.openingThresholdScene.finalPulseSfxPlayed) {
        current.openingThresholdScene.finalPulseSfxPlayed = true;
        audioControls?.playExpeditionSfx?.('openingThresholdFinalPulse');
      }
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, current.openingThresholdScene.stairwellRevealActive ? 0.08 : 0);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, current.openingThresholdScene.stairwellRevealActive ? 0.06 : 0);
      if (current.openingThresholdScene.timer <= 0) {
        completeOpeningThresholdScene(current);
      }
    }
    if (current.templeThresholdTransition) {
      const transition = current.templeThresholdTransition;
      transition.timer = Math.max(0, transition.timer - dt);
      const transitionElapsed = clamp((transition.duration || 0) - (transition.timer || 0), 0, transition.duration || 0);
      if (!transition.switched && transitionElapsed >= TEMPLE_THRESHOLD_SWITCH_SECONDS) {
        transition.switched = true;
        transition.phase = 'destination-reveal';
        enterLevelFromThreshold(current, transition);
      }
      if (transition.switched && !transition.encounterChecked && transitionElapsed >= TEMPLE_THRESHOLD_ANUBIS_START_SECONDS) {
        transition.encounterChecked = true;
        transition.anubisStarted = startLevelThresholdEncounter(current, transition);
      }
      if (transition.timer <= 0) {
        current.templeThresholdTransition = null;
        current.notice = transition.levelTransition?.finalNotice || DEFAULT_LEVEL_TRANSITION.finalNotice;
        syncHud();
      }
    }
    current.dynamicEnvironmentEventTimer = Math.max(0, (current.dynamicEnvironmentEventTimer || 0) - dt);
    if (current.dynamicEnvironmentEventTimer <= 0 && current.dynamicEnvironmentEvent) current.dynamicEnvironmentEvent = null;
    current.discoveryEntranceTimer = Math.max(0, (current.discoveryEntranceTimer || 0) - dt);
    current.sectionTransitionTimer = Math.max(0, current.sectionTransitionTimer - dt);
    if (current.sectionTransitionTimer <= 0 && current.sectionTransition) current.sectionTransition = null;
    current.cameraShakeTimer = Math.max(0, current.cameraShakeTimer - dt);
    if (current.cameraShakeTimer <= 0) current.cameraShakeStrength = 0;
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.damageCooldownTimer = Math.max(0, player.damageCooldownTimer - dt);
    player.coyoteTimer = Math.max(0, (player.coyoteTimer || 0) - dt);
    player.jumpBufferTimer = Math.max(0, (player.jumpBufferTimer || 0) - dt);
    player.jumpCutFeedbackTimer = Math.max(0, (player.jumpCutFeedbackTimer || 0) - dt);
    player.impactShakeTimer = Math.max(0, (player.impactShakeTimer || 0) - dt);
    player.landingFeedbackTimer = Math.max(0, (player.landingFeedbackTimer || 0) - dt);
    player.movementDustTimer = Math.max(0, (player.movementDustTimer || 0) - dt);
    current.hazardCooldown = Math.max(0, current.hazardCooldown - dt);
    current.staminaFeedbackTimer = Math.max(0, current.staminaFeedbackTimer - dt);
    current.enemyCooldown = Math.max(0, current.enemyCooldown - dt);
    current.attackCooldown = Math.max(0, current.attackCooldown - dt);
    const wasWindingUp = current.attackWindupTimer > 0;
    const wasSwinging = current.attackTimer > 0;
    const wasRecoiling = current.attackRecoilTimer > 0;
    current.attackWindupTimer = Math.max(0, current.attackWindupTimer - dt);
    current.attackTimer = Math.max(0, current.attackTimer - dt);
    current.attackRecoilTimer = Math.max(0, current.attackRecoilTimer - dt);
    player.hitFeedbackTimer = Math.max(0, player.hitFeedbackTimer - dt);
    if (current.attackTimer <= 0) current.playerAttackBox = null;
    if (wasWindingUp && current.attackWindupTimer <= 0) {
      current.attackTimer = ATTACK_DURATION;
      current.attackHitIds.clear();
    }
    if (wasSwinging && current.attackTimer <= 0 && current.attackRecoilTimer <= 0) {
      if (current.attackHitIds.size === 0) {
        current.lastAttackResult = 'missed';
        applyAttackStaminaCost(MISSED_ATTACK_EXTRA_STAMINA_COST, 'Missed attack', '-1');
      }
      current.attackRecoilTimer = ATTACK_RECOIL_DURATION;
    }
    if (wasRecoiling && current.attackRecoilTimer <= 0 && current.attackCooldown <= 0) {
      current.attackPhase = 'ready';
    } else {
      current.attackPhase = getPlayerAttackState(current);
    }
    current.hitStopTimer = Math.max(0, current.hitStopTimer - dt);
    current.combatHitEffects = current.combatHitEffects
      .map(effect => ({ ...effect, timer: Math.max(0, effect.timer - dt) }))
      .filter(effect => effect.timer > 0);
    Object.entries(current.reactivePlatformTimers || {}).forEach(([platformId, timer]) => {
      if (platformId.endsWith(':respawn')) return;
      const nextTimer = timer - dt;
      const platform = PLATFORMS.find(item => (item.id || item.label) === platformId);
      if (nextTimer <= 0) {
        delete current.reactivePlatformTimers[platformId];
        current.collapsedPlatformIds.add(platformId);
        current.reactivePlatformTimers[`${platformId}:respawn`] = platform?.reactive?.respawn || 3.2;
        addCombatEffect(current, {
          type: 'platform-crack',
          x: platform?.x || player.x,
          y: (platform?.y || player.y) + 8,
          color: 'rgba(137, 104, 72, 0.42)',
          timer: 0.52,
          maxTimer: 0.52,
        });
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.18);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.18);
      } else {
        current.reactivePlatformTimers[platformId] = nextTimer;
      }
    });
    Array.from(current.collapsedPlatformIds || []).forEach((platformId) => {
      const platform = PLATFORMS.find(item => (item.id || item.label) === platformId);
      const respawnKey = `${platformId}:respawn`;
      const nextTimer = (current.reactivePlatformTimers[respawnKey] ?? platform?.reactive?.respawn ?? 3.2) - dt;
      if (nextTimer <= 0) {
        current.collapsedPlatformIds.delete(platformId);
        delete current.reactivePlatformTimers[respawnKey];
        addCombatEffect(current, {
          type: 'environment-dust',
          x: platform?.x || player.x,
          y: (platform?.y || player.y) + 8,
          color: 'rgba(203, 139, 68, 0.42)',
          timer: 0.42,
          maxTimer: 0.42,
        });
      } else {
        current.reactivePlatformTimers[respawnKey] = nextTimer;
      }
    });
    current.routeGateCooldown = Math.max(0, current.routeGateCooldown - dt);
    if (current.discoveryEntranceActive) {
      current.attackQueued = false;
      player.vx = 0;
      player.vy = 0;
      updatePlayerAnimation(current, dt);
      if (current.discoveryEntranceTimer <= 0 && !current.discoveryEntranceHandoffStarted) {
        current.discoveryEntranceHandoffStarted = true;
        current.discoveryEntranceActive = false;
        current.completed = true;
        current.notice = DISCOVERY_ENTRANCE.handoffMessage;
        syncHud();
        onComplete?.([...current.fieldKit]);
      }
      return;
    }
    if (current.openingThresholdScene?.lockMovement) {
      const scene = current.openingThresholdScene;
      const sceneElapsed = clamp((scene.duration || 0) - (scene.timer || 0), 0, scene.duration || 0);
      const fallDelay = scene.playerFallDelay ?? OPENING_THRESHOLD_FALL_DELAY_SECONDS;
      const fallDuration = scene.playerFallDuration ?? OPENING_THRESHOLD_FALL_DURATION_SECONDS;
      const fallProgress = clamp((sceneElapsed - fallDelay) / fallDuration, 0, 1);
      const easedFall = fallProgress < 0.5
        ? 4 * fallProgress * fallProgress * fallProgress
        : 1 - Math.pow(-2 * fallProgress + 2, 3) / 2;
      const startY = scene.playerStartY ?? scene.playerY ?? player.y;
      const endY = scene.playerFallEndY ?? (GROUND_Y - player.height);
      current.attackQueued = false;
      player.vx = 0;
      player.vy = 0;
      player.x = scene.playerX ?? player.x;
      player.y = startY + (endY - startY) * easedFall;
      player.onGround = fallProgress >= 1;
      updatePlayerAnimation(current, dt);
      return;
    }
    if (current.templeThresholdTransition?.lockMovement) {
      current.attackQueued = false;
      player.vx = 0;
      player.vy = 0;
      player.onGround = true;
      player.jumpBufferTimer = 0;
      updatePlayerAnimation(current, dt);
      return;
    }
    current.bossIntroPauseTimer = Math.max(0, (current.bossIntroPauseTimer || 0) - dt);
    if (current.activeGuardianChallenge || current.pendingGuardianChallenge || current.bossIntroPauseTimer > 0) {
      current.attackQueued = false;
      player.vx = 0;
      player.vy = 0;
      updatePlayerAnimation(current, dt);
      return;
    }

    // Movement
    const previousPlayer = { ...player };
    const wasGrounded = player.onGround;
    if (wasGrounded) player.coyoteTimer = COYOTE_TIME;

    let targetVx = 0;
    if (left) { targetVx -= MOVE_SPEED; player.direction = -1; }
    if (right) { targetVx += MOVE_SPEED; player.direction = 1; }
    if (!player.onGround) targetVx *= Math.max(1, upgradeEffects.airControlMultiplier || 1);
    if (current.attackWindupTimer > 0) targetVx *= 0.45;
    const hasHorizontalInput = left || right;
    const acceleration = player.onGround
      ? (hasHorizontalInput ? MOVE_ACCELERATION : MOVE_DECELERATION)
      : (hasHorizontalInput ? AIR_ACCELERATION : AIR_DECELERATION);
    player.vx = approach(player.vx, targetVx, acceleration * dt);
    if (current.attackRecoilTimer > 0) player.vx += -player.direction * 45 * dt * 12;
    if (player.knockbackTimer > 0) {
      player.knockbackTimer = Math.max(0, player.knockbackTimer - dt);
      const knockbackProgress = player.knockbackTimer / Math.max(0.01, player.knockbackMaxTimer || 0.22);
      player.vx += player.knockbackDirection * (55 + knockbackProgress * 42.5) * knockbackMultiplier;
    }

    const jumpPressed = jump && !keys.jumpHeld;
    if (jumpPressed) player.jumpBufferTimer = JUMP_BUFFER_TIME;
    const canGroundJump = player.jumpBufferTimer > 0 && (player.onGround || player.coyoteTimer > 0);
    const openingPyramidGroundJumpMultiplier = canGroundJump
      && !current.collectedUpgrades.has('rope-launcher')
      && isOpeningPyramidAirJumpAssistAvailable(current, player, targetCivilisation)
      ? OPENING_PYRAMID_GROUND_JUMP_MULTIPLIER
      : 1;
    const openingPyramidAssistJump = player.jumpBufferTimer > 0
      && !canGroundJump
      && !current.collectedUpgrades.has('rope-launcher')
      && player.airJumpsUsed < 1
      && isOpeningPyramidAirJumpAssistAvailable(current, player, targetCivilisation);
    current.openingPyramidAssistJumpAvailable = openingPyramidAssistJump;
    const canRopeJump = player.jumpBufferTimer > 0 && !canGroundJump && current.collectedUpgrades.has('rope-launcher') && player.airJumpsUsed < 1;
    if (canGroundJump) {
      player.vy = -JUMP_SPEED * (upgradeEffects.jumpMultiplier || 1) * openingPyramidGroundJumpMultiplier;
      player.onGround = false;
      player.coyoteTimer = 0;
      player.jumpBufferTimer = 0;
      player.airJumpsUsed = 0;
      addCombatEffect(current, {
        type: 'jump-dust',
        x: player.x + player.width / 2,
        y: player.y + player.height - 6,
        direction: -player.direction,
        color: 'rgba(230, 173, 96, 0.68)',
        timer: 0.28,
        maxTimer: 0.28,
      });
      audioControls?.playExpeditionSfx?.('jump');
      audioControls?.playJump?.();
    } else if (openingPyramidAssistJump) {
      player.vy = -JUMP_SPEED * OPENING_PYRAMID_AIR_JUMP_MULTIPLIER;
      player.jumpBufferTimer = 0;
      player.airJumpsUsed += 1;
      addCombatEffect(current, {
        type: 'jump-dust',
        x: player.x + player.width / 2,
        y: player.y + player.height - 4,
        direction: -player.direction,
        color: 'rgba(251, 191, 36, 0.5)',
        timer: 0.25,
        maxTimer: 0.25,
      });
      audioControls?.playExpeditionSfx?.('jump', { volume: 0.76, playbackRate: 1.1 });
      audioControls?.playJump?.();
    } else if (canRopeJump) {
      player.vy = -JUMP_SPEED * 0.85 * (upgradeEffects.jumpMultiplier || 1);
      player.jumpBufferTimer = 0;
      player.airJumpsUsed += 1;
      addCombatEffect(current, {
        type: 'jump-dust',
        x: player.x + player.width / 2,
        y: player.y + player.height - 4,
        direction: -player.direction,
        color: 'rgba(125, 211, 252, 0.58)',
        timer: 0.25,
        maxTimer: 0.25,
      });
      audioControls?.playExpeditionSfx?.('jump', { volume: 0.8, playbackRate: 1.08 });
      audioControls?.playJump?.();
    }
    if (!jump && keys.jumpHeld && player.vy < 0) {
      player.vy *= JUMP_CUT_MULTIPLIER;
      player.jumpCutFeedbackTimer = JUMP_CUT_FEEDBACK_TIME;
    }
    keys.jumpHeld = jump;

    player.vy += GRAVITY * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    updatePlayerAnimation(current, dt);

    // Bounds
    player.x = clamp(player.x, 0, WORLD_WIDTH - player.width);
    const activeBossDomainBounds = current.bossDomain
      && !current.defeatedMiniBosses.has(current.bossDomain.bossId)
      ? current.bossDomain
      : null;
    if (activeBossDomainBounds) {
      player.x = clamp(
        player.x,
        (activeBossDomainBounds.arenaStart ?? 0) + 16,
        Math.max(
          (activeBossDomainBounds.arenaStart ?? 0) + 16,
          (activeBossDomainBounds.arenaEnd ?? WORLD_WIDTH) - player.width - 16,
        ),
      );
    }
    if (player.y > JOURNEY_VIEWPORT.height + JOURNEY_WORLD_LAYOUT.rescueFallPadding) {
      triggerJourneyRescue('The team stumbled into a ravine. Field rescue required.');
    }

    // Platforms
    player.onGround = false;
    let landedThisFrame = false;
    const available = PLATFORMS.filter(p => isPlatformAvailable(p, current));
    available.forEach(p => {
      if (isLandingOnPlatform(player, previousPlayer, p)) {
        const landingImpact = Math.max(0, previousPlayer.vy || player.vy || 0);
        player.y = p.y - player.height;
        player.vy = 0;
        player.onGround = true;
        player.coyoteTimer = COYOTE_TIME;
        player.airJumpsUsed = 0;
        landedThisFrame = true;
        player.lastLandingImpact = landingImpact;
        if (p.challengeId) {
          current.activePlatformChallenge = {
            id: p.challengeId,
            failY: p.challengeFailY || (GROUND_Y - 18),
            message: p.challengeFailMessage || 'You missed the platform route. Retry from the checkpoint.',
          };
        }
        if (p.challengeComplete && current.activePlatformChallenge?.id === p.challengeComplete) {
          current.activePlatformChallenge = null;
          addCombatEffect(current, {
            type: 'environment-dust',
            x: player.x + player.width / 2,
            y: p.y + 5,
            text: 'SAFE',
            color: 'rgba(56, 189, 248, 0.62)',
            timer: 0.36,
            maxTimer: 0.36,
          });
        }
        if (p.reactive) {
          const platformId = p.id || p.label;
          if (!current.reactivePlatformTimers[platformId]) {
            current.reactivePlatformTimers[platformId] = p.reactive.delay || 1.4;
            current.triggeredEnvironmentIds.add(platformId);
            current.recentEnvironmentInteractions = [
              {
                id: platformId,
                type: p.reactive.type,
                reason: 'platform pressure',
                message: `${p.label} is shifting.`,
              },
              ...(current.recentEnvironmentInteractions || []),
            ].slice(0, 6);
          }
          addCombatEffect(current, {
            type: 'platform-crack',
            x: player.x + player.width / 2,
            y: p.y + 6,
            color: 'rgba(137, 104, 72, 0.36)',
            timer: 0.24,
            maxTimer: 0.24,
          });
          current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.05);
          current.cameraShakeStrength = Math.max(current.cameraShakeStrength, p.reactive.shake || 0.1);
        }
      }
    });

    if (landedThisFrame && !wasGroundedRef.current) {
      player.landingFeedbackTimer = Math.min(0.22, 0.1 + (player.lastLandingImpact || 0) / 9000);
      addCombatEffect(current, {
        type: 'landing-dust',
        x: player.x + player.width / 2,
        y: player.y + player.height - 5,
        direction: player.direction,
        color: 'rgba(210, 150, 78, 0.62)',
        timer: 0.34,
        maxTimer: 0.34,
      });
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.05);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, Math.min(0.12, (player.lastLandingImpact || 0) / 5200));
      audioControls?.playExpeditionSfx?.('land');
    }
    if (
      current.activePlatformChallenge
      && !current.failed
      && player.vy >= 0
      && player.y + player.height >= current.activePlatformChallenge.failY
    ) {
      const challengeMessage = current.activePlatformChallenge.message;
      current.activePlatformChallenge = null;
      triggerJourneyRescue('Missed platform jump. Field rescue required.', challengeMessage);
    }
    if (player.onGround && Math.abs(player.vx) > 20) {
      const groundSpeed = Math.abs(player.vx);
      const isRunFeedback = groundSpeed > 190;
      footstepTimerRef.current -= dt;
      if (footstepTimerRef.current <= 0) {
        audioControls?.playExpeditionSfx?.('footstepSand');
        footstepTimerRef.current = isRunFeedback ? 0.36 : 0.44;
      }
      player.movementDustTimer -= dt;
      if (player.movementDustTimer <= 0 && groundSpeed > 90) {
        addCombatEffect(current, {
          type: 'movement-dust',
          x: player.x + player.width / 2,
          y: player.y + player.height - 4,
          direction: player.vx >= 0 ? -1 : 1,
          color: 'rgba(203, 139, 68, 0.5)',
          timer: 0.28,
          maxTimer: 0.28,
        });
        player.movementDustTimer = isRunFeedback ? 0.16 : 0.22;
      }
    } else {
      footstepTimerRef.current = 0;
    }
    wasGroundedRef.current = player.onGround;

    // Sections
    const section = getSectionForX(player.x);
    if (section.id !== current.lastSectionId) {
      const atmosphere = SECTION_ATMOSPHERES[section.id];
      const sectionTitle = getSectionDisplayTitle(section.id) || atmosphere.title;
      current.sectionTransition = { id: section.id, name: getSectionDisplayName(section.id), message: sectionTitle };
      current.sectionTransitionTimer = 2.6;
      current.lastSectionId = section.id;
      current.notice = sectionTitle;
      audioControls?.playLevelUp?.();
    }

    const reachedCheckpoint = CHECKPOINTS
      .filter(checkpoint => player.x + player.width / 2 >= checkpoint.x)
      .at(-1);
    if (reachedCheckpoint && current.activeCheckpoint.id !== reachedCheckpoint.id) {
      current.activeCheckpoint = reachedCheckpoint;
      current.resources.stamina = Math.max(current.resources.stamina, Math.min(maxStamina, 85));
      current.notice = `Checkpoint reached: ${reachedCheckpoint.name}.`;
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.025);
      addRewardPulse('checkpoint-pulse', reachedCheckpoint.x, reachedCheckpoint.y || (GROUND_Y - 46), 'Checkpoint reached', {
        color: '#38bdf8',
        fill: 'rgba(56, 189, 248, 0.1)',
        radius: 52,
        timer: 0.62,
      });
      audioControls?.playSuccess?.();
    }

    // Events
    ENVIRONMENT_EVENTS.forEach(ev => {
      const triggerRange = ev.dynamic ? 145 : 70;
      const crossedEvent = (previousPlayer.x <= ev.x && player.x >= ev.x) || (previousPlayer.x >= ev.x && player.x <= ev.x);
      if (!current.triggeredEnvironmentEventIds.has(ev.id) && (Math.abs(player.x - ev.x) < triggerRange || crossedEvent)) {
        current.triggeredEnvironmentEventIds.add(ev.id);
        if (ev.dynamic || ev.card === false) {
          current.dynamicEnvironmentEvent = ev;
          current.dynamicEnvironmentEventTimer = ev.duration;
        } else {
          current.environmentEvent = ev;
          current.environmentEventTimer = ev.duration;
        }
        current.cameraShakeTimer = ev.duration * 0.4;
        current.cameraShakeStrength = ev.shake;
        current.notice = ev.message;
        if (ev.type === 'shrine-glow') {
          audioControls?.playExpeditionStinger?.('evidenceDiscovery');
        } else {
          audioControls?.playTransition?.();
        }
      }
    });

    if (backgroundPackId !== 'china-river-valley' && !current.scarabSealActivated) {
      const scarabSealHitbox = {
        x: SCARAB_SEAL_TRIGGER.x - SCARAB_SEAL_TRIGGER.width / 2,
        y: SCARAB_SEAL_TRIGGER.y - SCARAB_SEAL_TRIGGER.height / 2,
        width: SCARAB_SEAL_TRIGGER.width,
        height: SCARAB_SEAL_TRIGGER.height,
      };
      if (rectsOverlap(getPlayerBodyHitbox(player), scarabSealHitbox)) {
        current.scarabSealActivated = true;
        current.openingConfrontationSeen = true;
        current.collapsedPlatformIds.add('opening-scarab-seal-summit');
        current.triggeredEnvironmentEventIds.add(SCARAB_SEAL_TRIGGER.id);
        const sphinxX = Math.min(player.x + 360, SCARAB_SEAL_TRIGGER.x + 430);
        const thresholdLines = SCARAB_SEAL_TRIGGER.messages.map((text, index) => ({
          speaker: [
            'Anubis', 'Anubis', 'Asha', 'Anubis', 'Asha', 'Anubis', 'Asha', 'Asha', 'Anubis',
            'Asha', 'Anubis', 'Anubis', 'Asha', 'Anubis', 'Anubis', 'Anubis', 'Anubis',
          ][index] || 'Anubis',
          text,
          at: [
            1.6, 4.2, 7.3, 9.9, 12.8, 15.6, 18.5, 21.0, 23.5,
            25.9, 29.0, 31.9, 34.6, 37.4, 40.0, 42.2, 43.8,
          ][index] || index * 1.9,
        }));
        current.openingThresholdScene = {
          id: 'opening-false-scarab-threshold',
          phase: 'false-discovery',
          lockMovement: true,
          playerX: player.x,
          playerY: player.y,
          playerStartY: player.y,
          playerFallEndY: GROUND_Y - player.height,
          playerFallDelay: OPENING_THRESHOLD_FALL_DELAY_SECONDS,
          playerFallDuration: OPENING_THRESHOLD_FALL_DURATION_SECONDS,
          playerOnGround: false,
          focusX: SCARAB_SEAL_TRIGGER.x,
          transitionTargetSectionId: 'desert-entry',
          stairwellRevealLine: SCARAB_SEAL_TRIGGER.stairwellRevealLine,
          lines: thresholdLines,
          duration: OPENING_THRESHOLD_SCENE_DURATION,
          timer: OPENING_THRESHOLD_SCENE_DURATION,
          fallSfxPlayed: false,
          stoneShiftSfxPlayed: false,
          finalPulseSfxPlayed: false,
        };
        current.openingSphinxEncounter = {
          id: 'opening-sphinx-encounter',
          name: SCARAB_SEAL_TRIGGER.eventName,
          playerX: player.x,
          x: sphinxX,
          y: OPENING_SPHINX_FOOT_Y - OPENING_SPHINX_SCREEN_Y_OFFSET - 126,
          lines: SCARAB_SEAL_TRIGGER.messages,
          message: SCARAB_SEAL_TRIGGER.messages.join(' '),
          guideFollowUpLine: SCARAB_SEAL_TRIGGER.guideFollowUpLine,
          duration: OPENING_SPHINX_DURATION,
          timer: OPENING_SPHINX_DURATION,
          silhouetteReveal: true,
          suppressDialogue: true,
        };
        current.sectionTransition = null;
        current.sectionTransitionTimer = 0;
        current.environmentEvent = null;
        current.environmentEventTimer = 0;
        current.dynamicEnvironmentEvent = {
          id: SCARAB_SEAL_TRIGGER.id,
          sectionId: SCARAB_SEAL_TRIGGER.sectionId,
          type: SCARAB_SEAL_TRIGGER.eventType,
          x: SCARAB_SEAL_TRIGGER.x,
          name: SCARAB_SEAL_TRIGGER.eventName,
          message: '',
          duration: SCARAB_SEAL_TRIGGER.duration,
          shake: SCARAB_SEAL_TRIGGER.shake,
          card: false,
        };
        current.dynamicEnvironmentEventTimer = SCARAB_SEAL_TRIGGER.duration;
        current.cinematicEvent = null;
        current.cinematicTimer = 0;
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, SCARAB_SEAL_TRIGGER.duration * 0.45);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, SCARAB_SEAL_TRIGGER.shake);
        current.notice = '';
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.12);
        addRewardPulse('scarab-seal-awakening', SCARAB_SEAL_TRIGGER.x, SCARAB_SEAL_TRIGGER.y, 'SEAL AWAKENS', {
          color: '#38bdf8',
          fill: 'rgba(56, 189, 248, 0.14)',
          radius: 58,
          timer: 0.78,
        });
        audioControls?.playExpeditionSfx?.('openingThresholdAtmosphere');
      }
    }

    getActiveHiddenRoutes().forEach(route => {
      if (current.discoveredHiddenRouteIds?.has(route.id)) return;
      if (rectsOverlap(getPlayerBodyHitbox(player), route)) {
        const access = getRouteAccessState(route, current);
        if (access.locked) {
          current.notice = route.lockedMessage || 'This hidden route needs better expedition equipment.';
          current.hazardFeedbackCooldown = Math.max(current.hazardFeedbackCooldown, 0.12);
          return;
        }
        current.discoveredHiddenRouteIds.add(route.id);
        const routeMomentName = route.name?.includes('Shrine')
          ? 'Ancient Shrine Discovered'
          : route.name?.includes('Archive')
            ? 'Hidden Archive Found'
            : 'Secret Route Discovered';
        current.notice = `${routeMomentName}.`;
        current.cinematicEvent = {
          id: `${route.id}-discovered`,
          name: routeMomentName,
          message: route.rewardHint,
          temporary: true,
        };
        current.dynamicEnvironmentEvent = {
          id: `${route.id}-atmosphere`,
          type: routeMomentName === 'Ancient Shrine Discovered' ? 'shrine-glow' : 'dust-gust',
          x: route.x + route.width / 2,
          name: routeMomentName,
          duration: 2.4,
        };
        current.dynamicEnvironmentEventTimer = 2.4;
        current.cinematicTimer = 2.6;
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.08);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.14);
        addCombatEffect(current, {
          type: 'secret-found',
          x: route.x + route.width / 2,
          y: route.y + Math.min(42, route.height / 2),
          text: 'SECRET ROUTE',
          color: '#facc15',
          fill: 'rgba(250, 204, 21, 0.12)',
          radius: 58,
          timer: 0.72,
          maxTimer: 0.72,
        });
        audioControls?.playExpeditionStinger?.('evidenceDiscovery');
        audioControls?.playSuccess?.();
      }
    });

    const currentSectionId = getSectionForX(player.x).id;
    const activeLevelEntrance = STAGE_ENTRANCE_FEATURES.find(feature => (
      feature.levelTransition
      && feature.from === currentSectionId
      && !current.templeThresholdTransition
      && isStageEntranceAvailableForState(feature, current)
    ));
    const activeLevelGate = activeLevelEntrance
      ? ROUTE_GATES.find(gate => gate.id === activeLevelEntrance.routeGateId)
      : null;
    if (
      activeLevelEntrance
      && activeLevelGate
      && Number.isFinite(activeLevelEntrance.x)
      && backgroundPackId !== 'china-river-valley'
      && player.x + player.width / 2 >= getStageEntranceTriggerX(activeLevelEntrance)
    ) {
      const guidance = getGateGuidance(activeLevelGate, current);
      if (!guidance.activeGateLocked) {
        current.openedRouteGateIds.add(activeLevelGate.id);
        current.notice = `${guidance.activeGateName} opened.`;
        audioControls?.playExpeditionSfx?.('gateUnlock');
        audioControls?.playExpeditionStinger?.('gateUnlock');
        startTempleThresholdTransition(current, activeLevelGate, activeLevelEntrance);
        return;
      }
    }

    // Collectibles
    TOOL_LAYOUT.forEach(toolPos => {
      if (!current.collectedToolIds.has(toolPos.id) && rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(toolPos, { width: 30, height: 30 }))) {
        current.collectedToolIds.add(toolPos.id);
        const tool = JOURNEY_TOOLS.find(t => t.id === toolPos.id);
        current.fieldKit.push(tool);
        current.notice = `Field tool added: ${tool.name}. This will help during excavation.`;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.8);
        audioControls?.playExpeditionSfx?.('pickupTool');
        audioControls?.playExpeditionStinger?.('evidenceDiscovery');
        audioControls?.playMatch?.();
      }
    });

    RELIC_SHARDS.forEach(shard => {
      if (shard.routeId && !isRouteRewardAccessible(shard.routeId, current)) return;
      if (!current.collectedShardIds.has(shard.id) && rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(shard, { width: 24, height: 24 }))) {
        current.collectedShardIds.add(shard.id);
        current.relicShardCount += 1;
        const shardGateProgress = getActiveShardGateProgress(current);
        addRewardPulse('shard-pickup', shard.x, shard.y, '+1 SHARD', {
          color: '#f59e0b',
          fill: 'rgba(245, 158, 11, 0.14)',
          radius: shard.hidden ? 32 : 24,
          timer: 0.46,
        });
        if (shard.hidden) {
          current.notice = shardGateProgress
            ? `Hidden Relic Shard ${Math.min(current.relicShardCount, shardGateProgress.required)}/${shardGateProgress.required}: needed for ${shardGateProgress.gateName}.`
            : 'Hidden relic shard recovered. Spend these at Base Camp.';
          current.hitStopTimer = Math.max(current.hitStopTimer, 0.025);
        } else {
          current.notice = shardGateProgress
            ? `Relic Shard ${Math.min(current.relicShardCount, shardGateProgress.required)}/${shardGateProgress.required}: needed for ${shardGateProgress.gateName}.`
            : 'Relic shard recovered. Spend these at Base Camp.';
        }
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.8);
        audioControls?.playExpeditionSfx?.('pickupShard');
        audioControls?.playSuccess?.();
      }
    });

    getActiveSecretCollectibles().forEach(secret => {
      if (current.collectedSecretIds?.has(secret.id)) return;
      if (secret.routeId && !isRouteRewardAccessible(secret.routeId, current)) return;
      if (rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(secret, { width: 32, height: 32 }))) {
        current.collectedSecretIds.add(secret.id);
        current.notice = 'Collection Piece Recovered.';
        current.cinematicEvent = {
          id: `${secret.id}-collected`,
          name: 'Secret Found',
          message: `${secret.name} has been added to the field journal.`,
          temporary: true,
        };
        current.cinematicTimer = 2.8;
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.04);
        addCombatEffect(current, {
          type: 'secret-found',
          x: secret.x,
          y: secret.y,
          text: 'SECRET FOUND',
          color: secret.color || '#facc15',
          fill: 'rgba(250, 204, 21, 0.12)',
          radius: 48,
          timer: 0.76,
          maxTimer: 0.76,
        });
        markSecretSetProgress(secret);
        audioControls?.playExpeditionStinger?.('evidenceDiscovery');
        audioControls?.playSuccess?.();
      }
    });

    LORE_TABLETS.forEach(tablet => {
      if (current.collectedTabletIds?.has(tablet.id)) return;
      if (tablet.routeId && !isRouteRewardAccessible(tablet.routeId, current)) return;
      if (rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(tablet, { width: 30, height: 30 }))) {
        current.collectedTabletIds.add(tablet.id);
        const loreMessage = tablet.text.replace(/^Tablet found:\s*/i, '');
        current.notice = tablet.text;
        current.cinematicEvent = {
          id: `${tablet.id}-lore`,
          name: 'Lore found',
          message: loreMessage,
          temporary: true,
        };
        current.cinematicTimer = 2.6;
        addCombatEffect(current, {
          type: 'secret-found',
          x: tablet.x,
          y: tablet.y,
          text: 'LORE RECOVERED',
          color: '#facc15',
          radius: 42,
          timer: 0.62,
          maxTimer: 0.62,
        });
        audioControls?.playExpeditionStinger?.('evidenceDiscovery');
        audioControls?.playSuccess?.();
      }
    });

    UPGRADES.forEach(u => {
      if (!current.collectedUpgrades.has(u.id) && rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(u, { width: 36, height: 36 }))) {
        if (u.shardCost && current.relicShardCount < u.shardCost) {
          current.notice = `${u.name}: need ${u.shardCost} relic shards to open this optional cache.`;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.8);
          return;
        }
        if (u.shardCost) {
          current.relicShardCount = Math.max(0, current.relicShardCount - u.shardCost);
        }
        if (u.rewardShards) {
          current.relicShardCount += u.rewardShards;
        }
        current.collectedUpgrades.add(u.id);
        current.notice = u.cacheReward
          ? `Cache opened! Upgrade Voucher earned: +${u.rewardShards} Base Camp shards.`
          : `Expedition Upgrade Acquired: ${u.name}.`;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.1);
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
        addRewardPulse('upgrade-pulse', u.x, u.y, u.cacheReward ? 'VOUCHER' : 'UPGRADE', {
          color: '#2563eb',
          fill: 'rgba(37, 99, 235, 0.1)',
          radius: 48,
          timer: 0.7,
        });
        audioControls?.playExpeditionSfx?.('pickupUpgrade');
        audioControls?.playLevelUp?.();
      }
    });

    OBJECTIVE_MARKERS.forEach(m => {
      if (!current.collectedObjectiveIds.has(m.id) && rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(m, { width: 30, height: 30 }))) {
        current.collectedObjectiveIds.add(m.id);
        const progress = getObjectiveProgress(m.sectionId, current);
        if (m.id === 'switch-1') {
          current.notice = 'Stone mechanism activated. Switches 1/3. A return plinth rises.';
          current.cinematicEvent = {
            id: 'switch-1-raised-return-plinth',
            name: 'Stone Mechanism',
            message: 'A return plinth rises ahead.',
            temporary: true,
          };
          current.cinematicTimer = 2.2;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.1);
          current.hitStopTimer = Math.max(current.hitStopTimer, 0.045);
          addRewardPulse('switch-1-response', m.x, m.y, 'MECHANISM', {
            color: m.color || '#92400e',
            fill: 'rgba(146, 64, 14, 0.12)',
            radius: 58,
            timer: 0.7,
          });
          addCombatEffect(current, {
            type: 'environment-dust',
            x: m.x + 96,
            y: m.y - 6,
            text: 'RISE',
            color: 'rgba(203, 139, 68, 0.64)',
            timer: 0.78,
            maxTimer: 0.78,
          });
        } else if (progress.count >= progress.total) {
          current.completedObjectiveIds.add(m.sectionId);
          current.notice = `Objective Complete: ${progress.title}`;
          current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
          addRewardPulse('collection-complete', m.x, m.y, 'OBJECTIVE COMPLETE', {
            color: '#22c55e',
            fill: 'rgba(34, 197, 94, 0.1)',
            radius: 54,
            timer: 0.68,
          });
        } else {
          current.notice = `Objective Progress: ${progress.count}/${progress.total} ${progress.itemLabel}.`;
          addRewardPulse('reward-pulse', m.x, m.y, 'RECORDED', {
            color: m.color || '#b45309',
            radius: 36,
            timer: 0.46,
          });
        }
        audioControls?.playExpeditionStinger?.('evidenceDiscovery');
        audioControls?.playSuccess?.();
      }
    });

    (current.bossKeyItems || []).forEach((keyItem) => {
      if (!keyItem.dropped || keyItem.collected) return;
      if (rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox({ x: keyItem.x - 16, y: keyItem.y - 18 }, { width: 32, height: 36 }))) {
        keyItem.collected = true;
        current.collectedBossKeyIds.add(keyItem.id);
        const rewardMoment = buildBossRewardMoment(current, keyItem, 'recovered');
        current.postBossReward = rewardMoment;
        current.postBossRewardTimer = 5.2;
        current.notice = `${rewardMoment.title} ${rewardMoment.nextObjective}`;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.2);
        current.cinematicEvent = {
          id: `${keyItem.id}-recovered`,
          name: 'Boss Reward Recovered',
          message: rewardMoment.nextObjective,
          temporary: true,
        };
        current.cinematicTimer = 3.2;
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.045);
        addRewardPulse('boss-reward-pulse', keyItem.x, keyItem.y, 'REWARD SECURED', {
          color: keyItem.color || '#b45309',
          fill: 'rgba(180, 83, 9, 0.12)',
          radius: 68,
          timer: 0.86,
        });
        audioControls?.playExpeditionStinger?.('gateUnlock');
        audioControls?.playSuccess?.();
      }
    });

    // Hazards
    if (current.hazardCooldown <= 0) {
      HAZARDS.filter(hazard => isHazardAvailable(hazard, current)).forEach(h => {
        if (rectsOverlap(getPlayerBodyHitbox(player), getHazardHitbox(h))) {
          const staminaLoss = Math.ceil((h.penalty.stamina || 0) * (upgradeEffects.hazardStaminaMultiplier || 1));
          const timeLoss = h.penalty.time || 0;
          const visual = HAZARD_VISUALS[h.id] || {};
          if (h.pushToStart) {
            const startCheckpoint = CHECKPOINTS[0];
            player.x = startCheckpoint.x;
            player.y = startCheckpoint.y - player.height;
            player.vx = 0;
            player.vy = 0;
            player.onGround = true;
            current.cameraX = clampCameraX(player.x - CANVAS_WIDTH * 0.42);
            current.targetCameraX = current.cameraX;
            current.hazardCooldown = 1.4;
            current.lastHazardHit = {
              id: h.id,
              name: h.name,
              message: h.message,
              staminaDelta: 0,
              timeDelta: -timeLoss,
            };
            if (timeLoss) current.resources.time = Math.max(0, current.resources.time - timeLoss);
            current.lastStaminaDelta = 0;
            current.lastStaminaLossReason = h.message;
            current.staminaFeedbackTimer = 0.9;
            current.notice = h.message;
            current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.28);
            current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.26);
            audioControls?.playExpeditionSfx?.(getHazardSfxKey(h), { volume: 1.04 });
            return;
          }
          if (staminaLoss) current.resources.stamina = Math.max(0, current.resources.stamina - staminaLoss);
          if (timeLoss) current.resources.time = Math.max(0, current.resources.time - timeLoss);
          current.hazardCooldown = 1.2;
          current.lastHazardHit = {
            id: h.id,
            name: h.name,
            message: visual.message || h.message,
            staminaDelta: -staminaLoss,
            timeDelta: -timeLoss,
          };
          current.lastStaminaDelta = -staminaLoss;
          current.lastStaminaLossReason = staminaLoss ? (visual.message || h.message) : '';
          current.staminaFeedbackTimer = staminaLoss ? 1.25 : 0.65;
          if (staminaLoss) {
            player.hitFeedbackTimer = 0.85;
            player.lastDamage = staminaLoss;
            player.knockbackTimer = Math.max(player.knockbackTimer, 0.12 * knockbackMultiplier);
            player.knockbackDirection = player.direction >= 0 ? -1 : 1;
          }
          current.cameraShakeTimer = Math.max(current.cameraShakeTimer, staminaLoss ? 0.16 : 0.08);
          current.cameraShakeStrength = Math.max(current.cameraShakeStrength, staminaLoss ? 0.28 : 0.16);
          const dangerWarning = staminaLoss && isLowStamina(current, maxStamina)
            ? ` ${LOW_STAMINA_WARNING}`
            : '';
          current.notice = `${visual.message || h.message}${staminaLoss ? ` -${staminaLoss} stamina.` : timeLoss ? ` -${timeLoss} seconds.` : ''}${dangerWarning}`;
          current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.4);
          audioControls?.playExpeditionSfx?.(getHazardSfxKey(h), {
            volume: staminaLoss ? 0.96 : 0.82,
          });
          audioControls?.playError?.();
          if (current.resources.stamina <= 0) triggerJourneyRescue(FIELD_RESCUE_STAMINA_REASON);
        }
      });
    }

    // Attacks
    let attackRect = null;
    if (current.attackQueued) {
      current.attackQueued = false;
      current.attackWindupTimer = ATTACK_WINDUP_DURATION;
      current.attackTimer = 0;
      current.attackRecoilTimer = 0;
      current.attackPhase = 'windup';
      current.attackCooldown = ATTACK_COOLDOWN;
      current.attackHitIds.clear();
      current.attackRewarded = false;
      current.lastAttackResult = 'started';
      current.shieldedHitFeedback = '';
      applyAttackStaminaCost(PLAYER_ATTACK_STAMINA_COST, 'Attack swing');
      addCombatEffect(current, {
        type: 'attack-burst',
        x: player.x + player.width / 2 + player.direction * 12,
        y: player.y + 23,
        direction: player.direction,
        color: '#fde68a',
        timer: 0.22,
        maxTimer: 0.22,
      });
      audioControls?.playExpeditionSfx?.('attackSwing');
      audioControls?.playAction?.();
    }
    if (current.attackTimer > 0) {
      attackRect = getAttackBox(player, 48, 30, player.direction);
      current.playerAttackBox = attackRect;
    } else {
      current.playerAttackBox = null;
    }

    ENVIRONMENT_INTERACTIONS.forEach((interaction) => {
      if (current.brokenEnvironmentIds?.has(interaction.id)) return;
      const interactionBox = {
        x: interaction.x,
        y: interaction.y,
        width: interaction.width,
        height: interaction.height,
      };
      const touching = rectsOverlap(getPlayerBodyHitbox(player), interactionBox);
      const struck = attackRect && rectsOverlap(attackRect, interactionBox);
      if (!touching && !struck) return;

      if (!current.triggeredEnvironmentIds.has(interaction.id)) {
        recordEnvironmentInteraction(current, interaction, struck ? 'struck' : 'touched');
        current.notice = interaction.message;
        addCombatEffect(current, {
          type: interaction.type === 'breakable-crate' ? 'environment-debris' : 'environment-dust',
          x: interaction.x + interaction.width / 2,
          y: interaction.y + interaction.height / 2,
          color: interaction.type === 'breakable-crate' ? 'rgba(245, 158, 11, 0.62)' : 'rgba(203, 139, 68, 0.48)',
          timer: 0.42,
          maxTimer: 0.42,
        });
      }
      if (interaction.type === 'breakable-crate' && struck) {
        current.brokenEnvironmentIds.add(interaction.id);
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.06);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.1);
        audioControls?.playExpeditionSfx?.('enemyHit', { volume: 0.55, playbackRate: 1.25 });
      } else if (['loose-rocks', 'collapsing-bridge'].includes(interaction.type)) {
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.06);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, interaction.type === 'collapsing-bridge' ? 0.14 : 0.08);
      }
    });

    const applyPlayerDamage = (amount, message, direction = 1, source = 'enemy', options = {}) => {
      if (player.invulnerable > 0 || player.damageCooldownTimer > 0) return;
      const sourceKnockbackMultiplier = options.knockbackMultiplier ?? 1;
      const effectiveKnockbackMultiplier = knockbackMultiplier * sourceKnockbackMultiplier;
      current.resources.stamina = Math.max(0, current.resources.stamina - amount);
      player.invulnerable = INVULNERABLE_DURATION;
      player.damageCooldownTimer = INVULNERABLE_DURATION + 0.65;
      player.hitFeedbackTimer = 0.75;
      player.impactShakeTimer = Math.max(player.impactShakeTimer || 0, PLAYER_HIT_SCREEN_SHAKE_DURATION);
      player.lastDamage = amount;
      player.lastDamageSource = source;
      player.lastDamageTime = Date.now();
      player.knockbackMaxTimer = Math.max(0.06, 0.12 * effectiveKnockbackMultiplier);
      player.knockbackTimer = player.knockbackMaxTimer;
      player.knockbackDirection = direction;
      player.vx = approach(player.vx, direction * 95 * effectiveKnockbackMultiplier, 160);
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.055);
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.2);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.4);
      current.notice = `${message} -${amount} stamina.${isLowStamina(current, maxStamina) ? ` ${LOW_STAMINA_WARNING}` : ''}`;
      current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.4);
      current.lastAttackResult = 'player-hit';
      addCombatEffect(current, {
        type: 'player-hit',
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        direction,
        color: '#f87171',
      });
      addCombatEffect(current, {
        type: 'knockback-dust',
        x: player.x + player.width / 2,
        y: player.y + player.height - 4,
        direction: -direction,
        color: 'rgba(137, 104, 72, 0.38)',
        timer: 0.32,
        maxTimer: 0.32,
      });
      audioControls?.playExpeditionSfx?.('playerHit');
      audioControls?.playError?.();
      if (current.resources.stamina <= 0) triggerJourneyRescue(FIELD_RESCUE_STAMINA_REASON);
    };

    const applyEnemyStomp = (enemy) => {
      enemy.stunTimer = 0.55;
      enemy.hitFlash = 0.18;
      enemy.attackWindup = 0;
      enemy.attackTimer = 0;
      enemy.attackReady = false;
      enemy.attackCooldown = Math.max(enemy.attackCooldown, 0.45);
      enemy.attackRecovery = 0.35;
      enemy.vulnerabilityTimer = Math.max(enemy.vulnerabilityTimer || 0, 0.25);
      enemy.shieldTimer = 0;
      enemy.knockbackTimer = 0.18;
      enemy.knockbackDirection = player.direction;
      player.vy = -JUMP_SPEED * 0.42;
      player.onGround = false;
      player.coyoteTimer = 0;
      player.jumpBufferTimer = 0;
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.045);
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.05);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.08);
      addCombatEffect(current, {
        type: 'combat-impact',
        x: enemy.x + enemy.width / 2,
        y: enemy.y,
        direction: player.direction,
        color: '#7dd3fc',
      });
      audioControls?.playExpeditionSfx?.('jump', { volume: 0.75, playbackRate: 1.08 });
      current.notice = `${enemy.name} bounced away. Use J or K to defeat it.`;
    };

    // Enemies
    current.enemies.forEach(e => {
      if (e.defeated) return;
      const activeBossDomain = current.bossDomain
        && !current.defeatedMiniBosses.has(current.bossDomain.bossId)
        ? current.bossDomain
        : null;
      if (isNormalEnemyInsideBossFocus(e, activeBossDomain)) {
        e.attackWindup = 0;
        e.attackTimer = 0;
        e.attackReady = false;
        e.attackRecovery = 0;
        e.vulnerabilityTimer = 0;
        e.shieldTimer = 0;
        e.aggroMemoryTimer = 0;
        e.attackCooldown = Math.max(e.attackCooldown || 0, 0.45);
        return;
      }
      const wasEnemyAttacking = e.attackTimer > 0;
      e.hitFlash = Math.max(0, e.hitFlash - dt);
      e.stunTimer = Math.max(0, e.stunTimer - dt);
      e.attackWindup = Math.max(0, e.attackWindup - dt);
      e.attackTimer = Math.max(0, e.attackTimer - dt);
      e.attackCooldown = Math.max(0, e.attackCooldown - dt);
      e.attackRecovery = Math.max(0, e.attackRecovery - dt);
      e.aggroMemoryTimer = Math.max(0, (e.aggroMemoryTimer || 0) - dt);
      e.vulnerabilityTimer = Math.max(0, (e.vulnerabilityTimer || 0) - dt);
      e.shieldTimer = Math.max(0, (e.shieldTimer || 0) - dt);
      e.knockbackTimer = Math.max(0, e.knockbackTimer - dt);
      if (wasEnemyAttacking && e.attackTimer <= 0) {
        const pattern = getEnemyPatternConfig(e);
        e.attackRecovery = pattern.recovery;
        e.vulnerabilityTimer = pattern.vulnerableAfter;
        addCombatEffect(current, {
          type: 'enemy-counter-window',
          x: e.x + e.width / 2,
          y: e.y + e.height / 2,
          color: '#22c55e',
        });
      }

      const distanceToPlayer = (player.x + player.width / 2) - (e.x + e.width / 2);
      const tacticalPattern = getEnemyPatternConfig(e);
      const pressureReachBonus = e.encounterRole ? 26 : 0;
      const awarenessMultiplier = tacticalPattern.awarenessMultiplier || 1;
      const baseNearPlayerX = (e.type === 'bat' || e.flying ? 220 : 180) + pressureReachBonus;
      const nearPlayer = Math.abs(distanceToPlayer) < (baseNearPlayerX * awarenessMultiplier) && Math.abs(player.y - e.y) < 104 + (e.encounterRole ? 14 : 0);
      const attackDirectionToPlayer = distanceToPlayer >= 0 ? 1 : -1;
      const scorpionStingCanReach = e.type !== 'scorpion' || rectsOverlap(
        getAttackBox(e, tacticalPattern.range, tacticalPattern.height, attackDirectionToPlayer, tacticalPattern.yOffset || 0, tacticalPattern.backReach || 0),
        getPlayerBodyHitbox(player),
      );
      if (nearPlayer) {
        e.aggroMemoryTimer = Math.max(e.aggroMemoryTimer || 0, ENEMY_AGGRO_MEMORY_SECONDS * (tacticalPattern.aggroMemoryMultiplier || 1));
      }
      if (!current.seenEnemyTypeNoticeIds) current.seenEnemyTypeNoticeIds = new Set();
      const stakeMessage = ENEMY_TYPE_STAKE_MESSAGES[e.type];
      if (
        stakeMessage
        && !current.seenEnemyTypeNoticeIds.has(e.type)
        && (current.itemPurposeNoticeTimer || 0) <= 0
        && Math.abs(distanceToPlayer) < (e.flying ? 260 : 220)
        && Math.abs(player.y - e.y) < 118
      ) {
        current.seenEnemyTypeNoticeIds.add(e.type);
        current.notice = stakeMessage;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.9);
      }

      if (e.stunTimer <= 0 && e.attackTimer <= 0 && e.attackWindup <= 0 && nearPlayer && scorpionStingCanReach && e.attackCooldown <= 0) {
        const pattern = tacticalPattern;
        e.attackWindup = pattern.windup;
        e.attackDirection = attackDirectionToPlayer;
        e.attackHasHit = false;
        e.attackReady = true;
        e.attackPattern = pattern.id;
        e.attackPhaseLabel = pattern.label;
        e.attackCooldown = pattern.cooldown;
        e.vulnerabilityTimer = 0;
        e.shieldTimer = pattern.shieldDuringWindup ? Math.min(0.45, pattern.windup * 0.7) : 0;
        if (e.encounterRole) {
          addCombatEffect(current, {
            type: 'enemy-pressure',
            x: e.x + e.width / 2,
            y: e.y + e.height / 2,
            color: 'rgba(137, 104, 72, 0.42)',
            timer: 0.38,
            maxTimer: 0.38,
          });
        }
        if ((current.itemPurposeNoticeTimer || 0) <= 0 && (current.damageNoticeTimer || 0) <= 0) {
          current.notice = `${e.name} winds up ${pattern.label}. Dodge, then counter.`;
        }
      }

      if (e.attackReady && e.attackWindup <= 0 && e.attackTimer <= 0) {
        e.attackTimer = getEnemyPatternConfig(e).duration;
        e.attackReady = false;
      }

      if (e.attackTimer > 0) {
        const pattern = getEnemyPatternConfig(e);
        e.x += e.attackDirection * pattern.speed * dt;
        const enemyAttackBox = getAttackBox(e, pattern.range, pattern.height, e.attackDirection, pattern.yOffset || 0, pattern.backReach || 0);
        const contact = resolveEnemyContact(player, previousPlayer, e);
        const playerBodyHitbox = getPlayerBodyHitbox(player);
        if (contact.type === 'stomp') {
          applyEnemyStomp(e);
          return;
        }
        if (!e.attackHasHit && rectsOverlap(enemyAttackBox, playerBodyHitbox)) {
          e.attackHasHit = true;
          const damageDirection = contact.direction || e.attackDirection || ((player.x + player.width / 2) >= (e.x + e.width / 2) ? 1 : -1);
          applyPlayerDamage(Math.max(e.damage, Math.round(e.damage * (pattern.damageScale || 1))), `${e.name} hit you`, damageDirection, e.name, {
            knockbackMultiplier: e.playerKnockbackMultiplier,
          });
        }
      }

      if (e.knockbackTimer > 0) {
        e.x += e.knockbackDirection * 95 * dt;
      }

      if (e.stunTimer <= 0 && e.attackWindup <= 0 && e.attackTimer <= 0 && e.attackRecovery <= 0) {
        const isAggroChasing = (e.aggroMemoryTimer || 0) > 0;
        const isPressingPlayer = isAggroChasing
          || (
            Math.abs(distanceToPlayer) < (baseNearPlayerX * awarenessMultiplier * 1.55)
            && Math.abs(player.y - e.y) < 118 + (e.encounterRole ? 16 : 0)
          );
        if (isPressingPlayer) {
          e.direction = distanceToPlayer >= 0 ? 1 : -1;
        }
        const chaseSpeedMultiplier = isAggroChasing
          ? (tacticalPattern.chaseMultiplier || 1.65) * (e.type === 'scorpion' ? SCORPION_CHASE_SPEED_MULTIPLIER : 1)
          : 1;
        const patrolSpeed = (e.baseSpeed || e.speed) * updateHostileStepMultiplier(e, dt) * chaseSpeedMultiplier;
        e.x += e.direction * patrolSpeed * dt;
        const movementMin = isAggroChasing ? e.patrolMin - ENEMY_AGGRO_PATROL_PADDING : e.patrolMin;
        const movementMax = isAggroChasing ? e.patrolMax + ENEMY_AGGRO_PATROL_PADDING : e.patrolMax;
        if (e.x <= movementMin) {
          e.x = movementMin;
          e.direction = 1;
          e.stepShiftTimer = 0;
        } else if (e.x >= movementMax) {
          e.x = movementMax;
          e.direction = -1;
          e.stepShiftTimer = 0;
        }
      }
      const contact = resolveEnemyContact(player, previousPlayer, e);
      if (contact.type === 'stomp') {
        applyEnemyStomp(e);
        return;
      }
      if (attackRect && !current.attackHitIds.has(e.id) && rectsOverlap(attackRect, getAttackHurtbox(e))) {
        current.attackHitIds.add(e.id);
        const pattern = getEnemyPatternConfig(e);
        const protectedEnemy = (e.shieldTimer > 0)
          || (e.attackTimer > 0 && pattern.protectedDuringAttack && e.vulnerabilityTimer <= 0);
        if (protectedEnemy) {
          e.hitFlash = 0.14;
          e.attackCooldown = Math.max(e.attackCooldown, 0.35);
          current.attackRecoilTimer = Math.max(current.attackRecoilTimer, 0.1);
          current.lastAttackResult = 'protected';
          current.shieldedHitFeedback = `${e.name} blocked the rushed hit.`;
          player.vx += -player.direction * 45;
          applyAttackStaminaCost(PROTECTED_HIT_EXTRA_STAMINA_COST, 'Protected enemy blocked attack', '-1');
          addCombatEffect(current, {
            type: 'enemy-shield',
            x: e.x + e.width / 2,
            y: e.y + e.height / 2,
            color: '#7dd3fc',
          });
          current.notice = `${e.name} blocked the rushed hit. Wait for an opening.`;
          audioControls?.playExpeditionSfx?.('combatDeflect', { volume: e.type === 'scarab' ? 0.92 : 0.78 });
          return;
        }
        e.health -= 1;
        if (!current.attackRewarded) {
          current.resources.stamina = Math.min(current.upgradeEffects?.maxStamina || 100, current.resources.stamina + 1);
          current.attackRewarded = true;
        }
        current.lastAttackResult = e.vulnerabilityTimer > 0 || e.attackRecovery > 0 ? 'counter-hit' : 'hit';
        current.shieldedHitFeedback = '';
        e.stunTimer = 0.8;
        e.hitFlash = 0.34;
        e.attackWindup = 0;
        e.attackTimer = 0;
        e.attackReady = false;
        e.attackCooldown = Math.max(e.attackCooldown, 0.6);
        e.attackRecovery = 0.45;
        e.vulnerabilityTimer = 0.35;
        e.shieldTimer = 0;
        e.knockbackTimer = 0.32;
        e.knockbackDirection = player.direction;
        e.x += player.direction * 32;
        current.hitStopTimer = Math.max(current.hitStopTimer, e.health <= 0 ? 0.1 : 0.075);
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.09);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, e.health <= 0 ? 0.22 : 0.15);
        addCombatEffect(current, {
          type: e.health <= 0 ? 'defeat' : 'combat-impact',
          x: e.x + e.width / 2,
          y: e.y + e.height / 2,
          direction: player.direction,
          color: e.health <= 0 ? '#facc15' : '#7dd3fc',
        });
        addCombatEffect(current, {
          type: 'weapon-hit-spark',
          x: e.x + e.width / 2 - player.direction * 6,
          y: e.y + e.height * 0.42,
          direction: player.direction,
          color: current.lastAttackResult === 'counter-hit' ? '#bbf7d0' : '#fff7ad',
          fill: current.lastAttackResult === 'counter-hit' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(250, 204, 21, 0.2)',
          timer: 0.24,
          maxTimer: 0.24,
        });
        audioControls?.playExpeditionSfx?.(getEnemyHitSfxKey(e), {
          volume: e.health <= 0 ? 1.12 : current.lastAttackResult === 'counter-hit' ? 1.02 : 0.92,
        });
        if (e.health <= 0) {
          e.defeated = true;
          e.hitFlash = 0;
          e.stunTimer = 0;
          e.attackWindup = 0;
          e.attackTimer = 0;
          e.attackReady = false;
          e.attackRecovery = 0;
          e.vulnerabilityTimer = 0;
          e.shieldTimer = 0;
          e.knockbackTimer = 0;
          e.knockbackDirection = 0;
          current.defeatedEnemies.add(e.id);
          current.relicShardCount += e.shards;
          const shardGateProgress = getActiveShardGateProgress(current);
          current.notice = shardGateProgress
            ? `Enemy dropped ${e.shards} relic shard${e.shards === 1 ? '' : 's'}: ${Math.min(current.relicShardCount, shardGateProgress.required)}/${shardGateProgress.required} for ${shardGateProgress.gateName}.`
            : `Enemy dropped ${e.shards} relic shard${e.shards === 1 ? '' : 's'}. Spend these at Base Camp.`;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.8);
        } else {
          current.notice = `${e.name} stunned.`;
        }
      }
    });

    // Bosses
    current.miniBosses.forEach(b => {
      if (b.defeated) return;
      const wasBossAttacking = b.attackTimer > 0;
      b.hitFlash = Math.max(0, b.hitFlash - dt);
      b.stunTimer = Math.max(0, b.stunTimer - dt);
      b.attackWindup = Math.max(0, b.attackWindup - dt);
      b.attackTimer = Math.max(0, b.attackTimer - dt);
      b.attackCooldown = Math.max(0, b.attackCooldown - dt);
      b.attackRecovery = Math.max(0, b.attackRecovery - dt);
      b.knockbackTimer = Math.max(0, b.knockbackTimer - dt);
      b.vulnerabilityTimer = Math.max(0, (b.vulnerabilityTimer || 0) - dt);
      b.shieldTimer = Math.max(0, (b.shieldTimer || 0) - dt);
      if (wasBossAttacking && b.attackTimer <= 0) {
        const phase = getBossPhaseConfig(b);
        b.attackRecovery = phase.recovery;
        b.vulnerabilityTimer = phase.vulnerableAfter;
        addCombatEffect(current, {
          type: 'boss-vulnerable',
          x: b.x + b.width / 2,
          y: b.y + b.height / 2,
          color: '#22c55e',
        });
      }
      if (!current.seenBossIntroIds) current.seenBossIntroIds = new Set();
      const scarabSealRequired = backgroundPackId !== 'china-river-valley'
        && b.id === SCARAB_SEAL_TRIGGER.bossId;
      if (scarabSealRequired && current.openingThresholdScene) return;
      const playerNearBossIntro = Math.abs(b.x - player.x) < 400;
      if (scarabSealRequired && !current.scarabSealActivated) {
        if (!playerNearBossIntro) return;
        activateScarabSealForQueenEncounter();
      }
      if (!current.seenBossIntroIds.has(b.id) && playerNearBossIntro) {
        b.awakened = true;
        current.seenBossIntroIds.add(b.id);
        const keyItem = current.bossKeyItems?.find(item => item.bossId === b.id);
        const scarabSealBossIntroLine = b.id === SCARAB_SEAL_TRIGGER.bossId && current.scarabSealActivated
          ? SCARAB_SEAL_TRIGGER.bossIntroLine
          : null;
        const arenaStart = b.arenaStart ?? Math.max(0, b.x - 160);
        const arenaEnd = b.arenaEnd ?? Math.min(WORLD_WIDTH, b.x + 180);
        const playerDomainStartX = arenaStart + 44;
        player.x = playerDomainStartX;
        player.y = GROUND_Y - player.height;
        player.vx = 0;
        player.vy = 0;
        player.direction = 1;
        const bossArenaMin = Math.max(arenaStart + 90, b.patrolMin);
        const bossArenaMax = Math.max(
          bossArenaMin,
          Math.min(arenaEnd - b.width - 24, b.patrolMax),
        );
        b.x = bossArenaMax;
        b.direction = -1;
        b.patrolMin = bossArenaMin;
        b.patrolMax = bossArenaMax;
        b.attackWindup = 0;
        b.attackTimer = 0;
        b.attackReady = false;
        b.attackCooldown = Math.max(b.attackCooldown, 1.4);
        const guardianQuestions = GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED && !current.completedGuardianChallengeIds?.has(b.id)
          ? getGuardianChallengeQuestions(b.id).map(shuffleGuardianQuestionOptions)
          : [];
        current.bossDomain = {
          bossId: b.id,
          name: b.domainName || `${b.name} Domain`,
          arenaStart,
          arenaEnd,
          playerStartX: Math.round(player.x),
          bossStartX: Math.round(b.x),
          color: keyItem?.color || '#facc15',
          tint: b.sectionId === 'catacombs'
            ? 'rgba(49, 46, 129, 0.16)'
            : b.sectionId === 'escape-sequence'
              ? 'rgba(127, 29, 29, 0.14)'
              : 'rgba(120, 53, 15, 0.14)',
          suppressVisuals: b.id === SCARAB_SEAL_TRIGGER.bossId,
        };
        current.bossIntro = {
          id: b.id,
          title: `Guardian Encounter: ${b.name}`,
          message: scarabSealBossIntroLine || (keyItem
            ? b.dialogue || `Defeat the guardian to recover the ${keyItem.name}.`
            : b.intro),
          focusX: b.x,
          dialogue: scarabSealBossIntroLine || b.dialogue || null,
          domainName: b.domainName || `${b.name} Domain`,
          rewardName: keyItem?.name || null,
        };
        if (!current.completedGuardianChallengeIds?.has(b.id)) {
          if (guardianQuestions.length) {
            current.pendingGuardianChallenge = {
              bossId: b.id,
              bossName: b.name,
              title: 'Guardian Knowledge Challenge',
              intro: 'Answer carefully. Your knowledge will decide the strength of the battle.',
              questions: guardianQuestions,
              currentIndex: 0,
              correctCount: 0,
              selectedAnswerIndex: null,
              feedback: null,
              answers: [],
              completed: false,
              modifier: null,
              resultMessage: null,
            };
          }
        }
        current.bossIntroTimer = 3.2;
        current.bossIntroPauseTimer = 3.2;
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.35);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.32);
        const arenaCamera = clampCameraX(((arenaStart + arenaEnd) / 2) - (CANVAS_WIDTH / 2));
        current.cameraX = arenaCamera;
        current.targetCameraX = arenaCamera;
        current.cameraMode = 'boss-domain';
        current.cameraFocusTarget = Math.round(b.x);
        current.notice = current.bossIntro.message;
        audioControls?.playTransition?.();
      } else if (current.seenBossIntroIds.has(b.id) && Math.abs(b.x - player.x) < 400) {
        b.awakened = true;
      }

      const distanceToPlayer = (player.x + player.width / 2) - (b.x + b.width / 2);
      const bossNearPlayer = Math.abs(distanceToPlayer) < 155 && Math.abs(player.y - b.y) < 90;

      if (b.awakened && b.stunTimer <= 0 && b.attackTimer <= 0 && b.attackWindup <= 0 && bossNearPlayer && b.attackCooldown <= 0) {
        const phases = BOSS_ATTACK_PHASES[b.id] || DEFAULT_BOSS_ATTACK_PHASES;
        const phase = phases[b.attackCycleIndex % phases.length];
        b.attackPattern = phase.id;
        b.attackPhaseLabel = phase.label;
        b.attackKind = phase.kind;
        b.attackWindup = phase.windup;
        b.attackDirection = distanceToPlayer >= 0 ? 1 : -1;
        b.attackHasHit = false;
        b.attackReady = true;
        b.attackCooldown = phase.cooldown;
        b.shieldTimer = phase.shieldDuringWindup ? Math.min(0.55, phase.windup * 0.7) : 0;
        b.vulnerabilityTimer = 0;
        b.attackCycleIndex += 1;
        b.patternHistory = [...(b.patternHistory || []), phase.id].slice(-6);
        addCombatEffect(current, {
          type: 'boss-telegraph',
          x: b.x + b.width / 2,
          y: b.y + b.height / 2,
          color: phase.color || '#fb923c',
        });
        audioControls?.playExpeditionSfx?.('bossWarning');
        audioControls?.playAction?.();
        current.notice = `${b.name} telegraphs ${phase.label}. Watch, dodge, then counter.`;
      }

      if (b.attackReady && b.attackWindup <= 0 && b.attackTimer <= 0) {
        const phase = getBossPhaseConfig(b);
        b.attackTimer = phase.duration;
        b.attackReady = false;
      }

      if (b.attackTimer > 0) {
        const phase = getBossPhaseConfig(b);
        if (phase.kind === 'close') {
          b.x += b.attackDirection * phase.speed * dt;
        }
        const bossAttackBox = phase.kind === 'area'
          ? {
            x: b.x - 36,
            y: b.y + b.height - 48,
            width: b.width + 72,
            height: 54,
          }
          : getAttackBox(b, phase.range, phase.height, b.attackDirection);
        if (!b.attackHasHit && rectsOverlap(bossAttackBox, getPlayerBodyHitbox(player))) {
          b.attackHasHit = true;
          applyPlayerDamage(Math.max(4, Math.round(b.damage * (phase.damageScale || 1) * (b.bossDamageMultiplier || 1))), `${b.name} ${phase.label} hit you. Dodge, then counter`, b.attackDirection, b.name);
        }
      }

      if (b.knockbackTimer > 0) {
        b.x += b.knockbackDirection * 65 * dt;
      }

      if (b.awakened && b.stunTimer <= 0 && b.attackWindup <= 0 && b.attackTimer <= 0 && b.attackRecovery <= 0) {
        const patrolSpeed = (b.baseSpeed || b.speed) * updateHostileStepMultiplier(b, dt, { boss: true });
        b.x += b.direction * patrolSpeed * dt;
        if (b.x <= b.patrolMin) {
          b.x = b.patrolMin;
          b.direction = 1;
          b.stepShiftTimer = 0;
        } else if (b.x >= b.patrolMax) {
          b.x = b.patrolMax;
          b.direction = -1;
          b.stepShiftTimer = 0;
        }
      }
      if (attackRect && !current.attackHitIds.has(b.id) && rectsOverlap(attackRect, getAttackHurtbox(b, { boss: true }))) {
        current.attackHitIds.add(b.id);
        const { shielded, vulnerable } = getBossVulnerabilityState(b);
        const protectedBoss = shielded || ((b.attackWindup > 0 || b.attackTimer > 0) && !vulnerable);
        if (protectedBoss) {
          b.hitFlash = 0.16;
          b.attackCooldown = Math.max(b.attackCooldown, 0.35);
          current.attackRecoilTimer = Math.max(current.attackRecoilTimer, 0.12);
          current.lastAttackResult = 'protected';
          current.shieldedHitFeedback = `${b.name} protected itself.`;
          player.vx += -player.direction * 55;
          applyAttackStaminaCost(PROTECTED_HIT_EXTRA_STAMINA_COST, 'Protected boss blocked attack', '-1');
          addCombatEffect(current, {
            type: 'boss-shield',
            x: b.x + b.width / 2,
            y: b.y + b.height / 2,
            color: '#7dd3fc',
          });
          current.notice = `${b.name} blocked the rushed hit. Wait for the counter window.`;
          audioControls?.playExpeditionSfx?.('combatDeflect', { volume: 1.04, playbackRate: 0.88 });
          return;
        }
        b.health -= (b.playerDamageMultiplier || 1);
        if (!current.attackRewarded) {
          current.resources.stamina = Math.min(current.upgradeEffects?.maxStamina || 100, current.resources.stamina + 1);
          current.attackRewarded = true;
        }
        current.lastAttackResult = b.vulnerabilityTimer > 0 || b.attackRecovery > 0 ? 'counter-hit' : 'hit';
        current.shieldedHitFeedback = '';
        b.hitFlash = 0.36;
        b.stunTimer = 0.75;
        b.attackWindup = 0;
        b.attackTimer = 0;
        b.attackReady = false;
        b.attackCooldown = Math.max(b.attackCooldown, 1.1);
        b.attackRecovery = 0.75;
        b.vulnerabilityTimer = 0.55;
        b.shieldTimer = 0;
        b.knockbackTimer = 0.28;
        b.knockbackDirection = player.direction;
        b.x += player.direction * 22;
        current.hitStopTimer = Math.max(current.hitStopTimer, b.health <= 0 ? 0.11 : 0.085);
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.1);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, b.health <= 0 ? 0.28 : 0.18);
        addCombatEffect(current, {
          type: b.health <= 0 ? 'boss-defeat' : 'combat-impact',
          x: b.x + b.width / 2,
          y: b.y + b.height / 2,
          direction: player.direction,
          color: b.health <= 0 ? '#facc15' : '#fb923c',
        });
        addCombatEffect(current, {
          type: 'weapon-hit-spark',
          x: b.x + b.width / 2 - player.direction * 8,
          y: b.y + b.height * 0.42,
          direction: player.direction,
          color: current.lastAttackResult === 'counter-hit' ? '#bbf7d0' : '#fff7ad',
          fill: current.lastAttackResult === 'counter-hit' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(251, 146, 60, 0.2)',
          timer: 0.26,
          maxTimer: 0.26,
        });
        audioControls?.playExpeditionSfx?.('bossHit', { volume: b.health <= 0 ? 1.2 : 1 });
        current.notice = `${b.name} staggered.`;
        if (b.health <= 0) {
          b.defeated = true;
          b.hitFlash = 0;
          b.stunTimer = 0;
          b.attackWindup = 0;
          b.attackTimer = 0;
          b.attackReady = false;
          b.attackRecovery = 0;
          b.vulnerabilityTimer = 0;
          b.shieldTimer = 0;
          b.knockbackTimer = 0;
          b.knockbackDirection = 0;
          current.defeatedMiniBosses.add(b.id);
          if (current.guardianBattleModifiers?.[b.id]) {
            current.guardianBattleModifiers = { ...current.guardianBattleModifiers };
            delete current.guardianBattleModifiers[b.id];
          }
          current.player.knowledgeVisualScale = 1;
          if (b.sectionId === 'dig-site-entrance') {
            current.completedObjectiveIds.add(b.sectionId);
          }
          current.relicShardCount += b.shards;
          const keyItem = current.bossKeyItems?.find(item => item.bossId === b.id);
          if (keyItem && !keyItem.collected) {
            keyItem.dropped = true;
            keyItem.x = clamp(
              b.x + b.width / 2,
              (b.arenaStart ?? 0) + 24,
              (b.arenaEnd ?? WORLD_WIDTH) - 48,
            );
            keyItem.y = GROUND_Y - 24;
            const rewardMoment = buildBossRewardMoment(current, keyItem, 'revealed');
            current.postBossReward = rewardMoment;
            current.postBossRewardTimer = 4.6;
            current.bossIntroPauseTimer = Math.max(current.bossIntroPauseTimer || 0, 1.05);
            current.notice = `${b.name} defeated. ${rewardMoment.title} ${rewardMoment.nextObjective}`;
            current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.2);
            current.cinematicEvent = {
              id: `${b.id}-tool-piece-drop`,
              name: 'Boss Reward Revealed',
              message: rewardMoment.nextObjective,
              temporary: true,
            };
            current.cinematicTimer = 3.2;
            addRewardPulse('boss-reward-pulse', keyItem.x, keyItem.y, 'REWARD REVEALED', {
              color: keyItem.color || '#b45309',
              fill: 'rgba(180, 83, 9, 0.12)',
              radius: 70,
              timer: 0.9,
            });
          } else {
            current.notice = `${b.name} defeated. Path secured.`;
          }
          if (current.bossDomain?.bossId === b.id) {
            current.bossDomain = null;
          }
        }
      }
    });

    // Gates
    ROUTE_GATES.forEach(g => {
      const reachedGate = rectsOverlap(player, g)
        || (player.x + player.width > g.x && player.x < g.x + g.width + 18);
      if (!current.openedRouteGateIds.has(g.id) && reachedGate) {
        const guidance = getGateGuidance(g, current);
        if (!guidance.activeGateLocked) {
          current.openedRouteGateIds.add(g.id);
          current.notice = `${guidance.activeGateName} opened.`;
          audioControls?.playExpeditionSfx?.('gateUnlock');
          audioControls?.playExpeditionStinger?.('gateUnlock');
        } else {
          player.x = g.x - player.width - 5;
          current.notice = guidance.notice;
          audioControls?.playExpeditionSfx?.('gateBlocked');
        }
      }
    });

    // Final Goal
    if (rectsOverlap(player, GATE) && !current.discoveryEntranceActive && !current.discoveryEntranceHandoffStarted) {
      current.discoveryEntranceActive = true;
      current.discoveryEntranceTimer = DISCOVERY_ENTRANCE_REVEAL_SECONDS;
      current.notice = `${DISCOVERY_ENTRANCE.name}. ${DISCOVERY_ENTRANCE.handoffMessage}`;
      current.cinematicEvent = {
        id: DISCOVERY_ENTRANCE.id,
        name: DISCOVERY_ENTRANCE.name,
        message: DISCOVERY_ENTRANCE.message,
        temporary: false,
      };
      current.cinematicTimer = DISCOVERY_ENTRANCE_REVEAL_SECONDS;
      current.dynamicEnvironmentEvent = {
        id: 'discovery-entrance-reveal',
        type: 'shrine-glow',
        x: GATE.x + GATE.width / 2,
        name: DISCOVERY_ENTRANCE.name,
        duration: DISCOVERY_ENTRANCE_REVEAL_SECONDS,
      };
      current.dynamicEnvironmentEventTimer = DISCOVERY_ENTRANCE_REVEAL_SECONDS;
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.05);
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.16);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.16);
      addRewardPulse('collection-complete', GATE.x + GATE.width / 2, GATE.y + 18, 'DISCOVERY FOUND', {
        color: DISCOVERY_ENTRANCE.glowColor,
        fill: 'rgba(250, 204, 21, 0.14)',
        radius: 82,
        timer: 0.92,
      });
      audioControls?.playExpeditionStinger?.('evidenceDiscovery');
      audioControls?.playSuccess?.();
      syncHud();
    }

    // Camera
    const openingCameraReveal = getOpeningCameraRevealTarget(current);
    const camera = openingCameraReveal || getCameraFollowTarget(current);
    current.targetCameraX = camera.targetCameraX;
    current.cameraMode = camera.mode;
    current.cameraFocusTarget = camera.focusTarget;
    if (!Number.isFinite(current.cameraX)) current.cameraX = camera.targetCameraX;
    const smoothing = camera.mode === 'opening-reveal' || camera.mode === 'opening-threshold'
      ? 0.18
      : camera.mode === 'boss-intro'
        ? JOURNEY_CAMERA.bossIntroSmoothing
        : camera.mode === 'stage-entrance'
          ? 0.16
        : JOURNEY_CAMERA.followSmoothing;
    const cameraStep = clamp(
      (current.targetCameraX - current.cameraX) * smoothing,
      camera.mode === 'opening-reveal' || camera.mode === 'opening-threshold' || camera.mode === 'stage-entrance' ? -42 : -JOURNEY_CAMERA.maxStep,
      camera.mode === 'opening-reveal' || camera.mode === 'opening-threshold' || camera.mode === 'stage-entrance' ? 42 : JOURNEY_CAMERA.maxStep,
    );
    current.cameraX = clampCameraX(current.cameraX + cameraStep);

    // Time
    current.timeAccumulator += dt;
    if (current.timeAccumulator >= 1) {
      current.resources.time -= 1;
      current.timeAccumulator = 0;
      if (current.resources.time <= 0) triggerJourneyRescue('Time expired. Field team rescued.');
    }

  }, [briefingOpen, audioControls, onComplete, triggerJourneyRescue, backgroundPackId, targetCivilisation, buildBossRewardMoment, completeOpeningThresholdScene, enterLevelFromThreshold, startLevelThresholdEncounter, startTempleThresholdTransition, getActiveHiddenRoutes, getActiveSecretCollectibles, getActiveShardGateProgress, getAttackBox, getAttackHurtbox, getBossPhaseConfig, getBossVulnerabilityState, getEnemyPatternConfig, getObjectiveProgress, getGateGuidance, getRouteAccessState, isRouteRewardAccessible, isLowStamina, addCombatEffect, recordEnvironmentInteraction, getPlayerAttackState, getSectionDisplayName, getSectionDisplayTitle, syncHud]);

  const step = useCallback((ms) => {
    const dt = Math.min(ms / 1000, 0.05);
    const hadGuardianChallenge = Boolean(stateRef.current.activeGuardianChallenge);
    update(dt);
    draw();
    onSnapshotChange?.(createJourneySnapshot());
    if (!stateRef.current.activeGuardianChallenge || !hadGuardianChallenge) {
      syncHud();
    }
  }, [createJourneySnapshot, draw, onSnapshotChange, syncHud, update]);

  useEffect(() => {
    window.__advanceExpeditionJourney = step;
    window.__renderExpeditionJourneyState = () => createJourneySnapshot();
    let handleExpeditionDevJump = null;
    if (import.meta.env.DEV) {
      window.__setExpeditionJourneyDebugPosition = (x, y = null) => {
        const current = stateRef.current;
        const nextX = Number(x);
        if (!Number.isFinite(nextX)) return createJourneySnapshot(current);
        const nextY = Number(y);
        current.player.x = clamp(nextX, 0, WORLD_WIDTH - current.player.width);
        current.player.y = Number.isFinite(nextY)
          ? clamp(nextY, 0, GROUND_Y - current.player.height)
          : GROUND_Y - current.player.height;
        current.player.vx = 0;
        current.player.vy = 0;
        current.player.onGround = current.player.y >= GROUND_Y - current.player.height - 1;
        current.cameraX = clampCameraX(current.player.x - CANVAS_WIDTH * 0.42);
        current.targetCameraX = current.cameraX;
        step(0);
        syncHud();
        return createJourneySnapshot(current);
      };
      window.__setExpeditionOpeningThresholdTimer = (seconds) => {
        const current = stateRef.current;
        if (!current.openingThresholdScene) return createJourneySnapshot(current);
        const nextSeconds = Number(seconds);
        if (!Number.isFinite(nextSeconds)) return createJourneySnapshot(current);
        current.openingThresholdScene.timer = clamp(nextSeconds, 0, current.openingThresholdScene.duration || OPENING_THRESHOLD_SCENE_DURATION);
        step(0);
        syncHud();
        return createJourneySnapshot(current);
      };
      window.__triggerExpeditionTempleThresholdTransition = (gateId = 'desert-seal') => {
        const current = stateRef.current;
        const gate = ROUTE_GATES.find(item => item.id === gateId);
        const feature = getStageEntranceForGate(gate);
        if (!gate || !feature) return createJourneySnapshot(current);
        current.openedRouteGateIds.add(gate.id);
        const triggerX = getStageEntranceTriggerX(feature);
        current.player.x = Math.max(0, (Number.isFinite(triggerX) ? triggerX : (feature.x ?? gate.x)) - current.player.width / 2);
        current.player.y = GROUND_Y - current.player.height;
        current.player.vx = 0;
        current.player.vy = 0;
        current.player.onGround = true;
        current.lastSectionId = feature.from;
        current.cameraX = clampCameraX(current.player.x - CANVAS_WIDTH * 0.42);
        current.targetCameraX = current.cameraX;
        startTempleThresholdTransition(current, gate, feature);
        step(0);
        syncHud();
        return createJourneySnapshot(current);
      };
      handleExpeditionDevJump = (event) => {
        const { target, sectionId, bossId } = event.detail || {};
        setBriefingOpen(false);
        if (target === 'journey-boss-start') {
          const current = stateRef.current;
          const boss = current.miniBosses.find(item => item.id === bossId);
          if (!boss) return;
          const arenaStart = boss.arenaStart ?? Math.max(0, boss.x - 160);
          const arenaEnd = boss.arenaEnd ?? Math.min(WORLD_WIDTH, boss.x + 180);
          const section = SECTIONS.find(item => item.id === boss.sectionId);
          const sectionCheckpoint = CHECKPOINTS.find(checkpoint => checkpoint.id === boss.sectionId);
          if (boss.id === SCARAB_SEAL_TRIGGER.bossId && backgroundPackId !== 'china-river-valley') {
            current.scarabSealActivated = true;
            current.openingConfrontationSeen = true;
            current.collapsedPlatformIds.add('opening-scarab-seal-summit');
            current.triggeredEnvironmentEventIds.add(SCARAB_SEAL_TRIGGER.id);
          }
          current.openingThresholdScene = null;
          current.openingSphinxEncounter = null;
          current.openingSphinxTimer = 0;
          current.dynamicEnvironmentEvent = null;
          current.dynamicEnvironmentEventTimer = 0;
          current.environmentEvent = null;
          current.environmentEventTimer = 0;
          current.bossIntro = null;
          current.bossIntroTimer = 0;
          current.bossIntroPauseTimer = 0;
          current.seenBossIntroIds?.add(boss.id);
          current.defeatedMiniBosses.delete(boss.id);
          current.bossKeyItems
            ?.filter(item => item.bossId === boss.id)
            .forEach((item) => {
              item.dropped = false;
              item.collected = false;
            });
          boss.defeated = false;
          boss.awakened = true;
          boss.health = boss.maxHealth || boss.health || 1;
          boss.x = Math.min(arenaEnd - boss.width - 24, Math.max(arenaStart + 90, boss.patrolMax));
          boss.y = GROUND_Y - boss.height;
          boss.direction = -1;
          boss.attackWindup = 0;
          boss.attackTimer = 0;
          boss.attackReady = false;
          boss.attackCooldown = 0.2;
          boss.attackRecovery = 0;
          boss.vulnerabilityTimer = 0;
          boss.shieldTimer = 0;
          boss.stunTimer = 0;
          boss.hitFlash = 0;
          boss.attackCycleIndex = 0;
          boss.patternHistory = [];
          current.player.x = clamp(boss.x - 92, 0, WORLD_WIDTH - current.player.width);
          current.player.y = GROUND_Y - current.player.height;
          current.player.vx = 0;
          current.player.vy = 0;
          current.player.direction = 1;
          current.player.onGround = true;
          current.activeCheckpoint = sectionCheckpoint || current.activeCheckpoint;
          if (section) {
            SECTIONS
              .filter(item => item.end <= section.start)
              .forEach(item => current.completedObjectiveIds.add(item.id));
          }
          ROUTE_GATES
            .filter(gate => gate.x < arenaStart)
            .forEach(gate => current.openedRouteGateIds.add(gate.id));
          current.bossDomain = {
            bossId: boss.id,
            name: boss.domainName || `${boss.name} Domain`,
            arenaStart,
            arenaEnd,
            playerStartX: Math.round(current.player.x),
            bossStartX: Math.round(boss.x),
            color: '#facc15',
            tint: 'rgba(120, 53, 15, 0.14)',
          };
          current.cameraX = clampCameraX(((arenaStart + arenaEnd) / 2) - (CANVAS_WIDTH / 2));
          current.targetCameraX = current.cameraX;
          current.notice = `Developer mode: ${boss.name} encounter ready.`;
          step(0);
          syncHud();
          return;
        }
        if (target !== 'journey-section-start') return;
        const section = SECTIONS.find(section => section.id === sectionId);
        if (!section) return;
        const current = stateRef.current;
        const sectionCheckpoint = CHECKPOINTS.find(checkpoint => checkpoint.id === section.id);
        const jumpX = sectionCheckpoint?.x ?? section.start + 24;
        current.player.x = clamp(jumpX, 0, WORLD_WIDTH - current.player.width);
        current.player.y = GROUND_Y - current.player.height;
        current.player.vx = 0;
        current.player.vy = 0;
        current.player.onGround = true;
        current.cameraX = clampCameraX(current.player.x - CANVAS_WIDTH * 0.42);
        current.targetCameraX = current.cameraX;
        current.activeCheckpoint = sectionCheckpoint || current.activeCheckpoint;
        SECTIONS
          .filter(item => item.end <= section.start)
          .forEach(item => current.completedObjectiveIds.add(item.id));
        ROUTE_GATES
          .filter(gate => gate.x < section.start)
          .forEach(gate => current.openedRouteGateIds.add(gate.id));
        current.notice = `Developer mode: ${section.name} start.`;
        step(0);
        syncHud();
      };
      window.addEventListener('expedition-dev-jump', handleExpeditionDevJump);
      window.__triggerExpeditionRewardDebug = (kind = 'boss-reward') => {
        const current = stateRef.current;
        const player = current.player;
        if (kind === 'boss-reward') {
          const keyItem = current.bossKeyItems?.[0] || BOSS_KEY_ITEMS[0];
          const rewardMoment = buildBossRewardMoment(current, keyItem, 'revealed');
          current.postBossReward = rewardMoment;
          current.postBossRewardTimer = 4.6;
          current.cinematicEvent = {
            id: 'debug-boss-reward',
            name: 'Boss Reward Revealed',
            message: rewardMoment.nextObjective,
            temporary: true,
          };
          current.cinematicTimer = 2.8;
          addCombatEffect(current, {
            type: 'boss-reward-pulse',
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            text: 'REWARD REVEALED',
            color: rewardMoment.color || '#b45309',
            fill: 'rgba(180, 83, 9, 0.12)',
            radius: 70,
            timer: 0.9,
            maxTimer: 0.9,
          });
        }
        if (kind === 'collection-complete') {
          addCombatEffect(current, {
            type: 'collection-complete',
            x: player.x + player.width / 2,
            y: player.y,
            text: 'COLLECTION COMPLETE',
            color: '#22c55e',
            fill: 'rgba(34, 197, 94, 0.11)',
            radius: 64,
            timer: 0.82,
            maxTimer: 0.82,
          });
        }
        step(0);
        syncHud();
        return createJourneySnapshot(current);
      };
    }
    return () => {
      delete window.__advanceExpeditionJourney;
      delete window.__renderExpeditionJourneyState;
      delete window.__setExpeditionJourneyDebugPosition;
      delete window.__setExpeditionOpeningThresholdTimer;
      delete window.__triggerExpeditionTempleThresholdTransition;
      delete window.__triggerExpeditionRewardDebug;
      if (handleExpeditionDevJump) {
        window.removeEventListener('expedition-dev-jump', handleExpeditionDevJump);
      }
    };
  }, [addCombatEffect, backgroundPackId, buildBossRewardMoment, createJourneySnapshot, startTempleThresholdTransition, step, syncHud]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (paused || briefingOpen || stateRef.current.activeGuardianChallenge) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW', 'KeyJ', 'KeyK'].includes(e.code)) e.preventDefault();
      audioControls?.unlockExpeditionSfx?.();
      if (e.code === 'KeyJ' || e.code === 'KeyK') { queueAttack(); return; }
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e) => keysRef.current[e.code] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const frame = (t) => {
      if (!lastFrameRef.current) lastFrameRef.current = t;
      if (!document.hidden && !paused) {
        step(t - lastFrameRef.current);
      }
      lastFrameRef.current = t;
      animationRef.current = requestAnimationFrame(frame);
    };
    animationRef.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, [audioControls, briefingOpen, paused, queueAttack, step]);

  useEffect(() => {
    if (paused) {
      keysRef.current = {};
    }
  }, [paused]);

  const activeHudGate = ROUTE_GATES.find(gate => !gameState.openedRouteGateIds.has(gate.id));
  const activeHudGateGuidance = activeHudGate ? getGateGuidance(activeHudGate, gameState) : null;
  const activeHudShardRequirement = activeHudGateGuidance?.gateRequirements.find(req => req.type === 'shards') || null;
  const activeHudFirstMissing = activeHudGateGuidance?.gateMissingRequirements?.[0] || null;
  const staminaWarningState = getStaminaWarningState(gameState);
  const staminaPercent = Math.min(100, Math.round((gameState.resources.stamina / (gameState.upgradeEffects?.maxStamina || 100)) * 100));
  const activeGuardianChallenge = guardianChallengeUi || gameState.activeGuardianChallenge;
  const activeGuardianQuestion = activeGuardianChallenge?.questions?.[activeGuardianChallenge.currentIndex] || null;
  const openingCinematicActive = Boolean(gameState.openingThresholdScene || gameState.templeThresholdTransition);

  return (
    <section className={`expedition-journey-container ${openingCinematicActive ? 'is-opening-cinematic' : ''}`} id="expedition-journey">
      <div className="expedition-journey-grid">
        <div className="expedition-sidebar">
          <div className="expedition-panel inventory-panel">
            <h3 className="section-title"><Backpack size={16} /> Field Kit: Excavation Prep</h3>
            <ul className="expedition-tool-list">
              {JOURNEY_TOOLS.map(t => (
                <li key={t.id} className={gameState.collectedToolIds.has(t.id) ? 'is-collected' : ''}>
                  <span>{t.emoji} {t.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="expedition-panel objective-panel">
            <h3 className="section-title"><Map size={16} /> Status</h3>
            <div className="current-section-badge">
              {getSectionDisplayName(gameState.currentSectionId) || 'Surveying'}
            </div>
            <div className="objective-progress">
              <div>Relic Shards for Base Camp: {gameState.relicShardCount} / {RELIC_SHARDS.length}</div>
              <div>Upgrades: {gameState.collectedUpgrades.size} / {UPGRADES.length}</div>
              <div>Hidden Routes: {gameState.discoveredHiddenRouteIds?.size || 0} / {getActiveHiddenRoutes().length}</div>
              <div>Secrets: {gameState.collectedSecretIds?.size || 0} / {getActiveSecretCollectibles().length}</div>
            </div>
            <div className="journey-key-items" aria-label="Recovered excavation kit pieces">
              <div className="journey-key-items-title">Excavation Kit Pieces</div>
              {BOSS_KEY_ITEMS.map(item => {
                const recovered = gameState.collectedBossKeyIds?.has(item.id)
                  || gameState.bossKeyItems?.some(keyItem => keyItem.id === item.id && keyItem.collected);
                return (
                  <div key={item.id} className={`journey-key-item ${recovered ? 'is-collected' : ''}`}>
                    <span className="journey-key-mark">{item.label}</span>
                    <span>{item.name}</span>
                  </div>
                );
              })}
            </div>
            {activeHudGateGuidance && (
              <div className={`route-gate-hud ${activeHudGateGuidance.activeGateLocked ? 'is-locked' : 'is-ready'}`}>
                <div className="route-gate-hud-title">
                  {activeHudGateGuidance.activeGateName}
                </div>
                <ul className="route-gate-checklist">
                  {activeHudGateGuidance.gateRequirements.map(req => (
                    <li key={`${req.type}-${req.id}`} className={req.met ? 'is-met' : 'is-missing'}>
                      <span aria-hidden="true">{req.met ? '✓' : '○'}</span>
                      <span>{req.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="route-gate-hint">
                  {activeHudGateGuidance.gateHint}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="expedition-main">
          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={JOURNEY_RENDER_TARGET.nativeWidth}
              height={JOURNEY_RENDER_TARGET.nativeHeight}
              className="expedition-canvas"
            />

            {!openingCinematicActive && (
            <div className="journey-floating-hud" aria-label="Expedition status">
              <div className="journey-floating-hud-cluster">
                <div className={`journey-floating-hud-gems ${gameState.itemPurposeNoticeTimer > 0 ? 'is-rewarding' : ''}`}>
                  <Gem size={18} />
                  <strong>{gameState.relicShardCount}</strong>
                  <span>Base Camp shards</span>
                </div>
                <div className="journey-floating-hud-status">
                  {getSectionDisplayName(gameState.currentSectionId) || 'Surveying'}
                </div>
              </div>

              <div className="journey-floating-hud-cluster journey-floating-hud-meters">
                <div className={`journey-floating-hud-meter ${staminaWarningState !== 'stable' ? 'stamina-alert' : ''}`}>
                  <div className="journey-floating-hud-meter-label">
                    <Gauge size={15} />
                    <span>Stamina</span>
                  </div>
                  <div className="journey-floating-hud-bar">
                    <div className="journey-floating-hud-fill stamina-fill" style={{ width: `${staminaPercent}%` }} />
                    {gameState.staminaFeedbackTimer > 0 && gameState.lastStaminaDelta < 0 && (
                      <span className="stamina-delta">-{Math.abs(gameState.lastStaminaDelta)}</span>
                    )}
                  </div>
                  {staminaWarningState === 'low' && (
                    <div className="stamina-warning-text">{LOW_STAMINA_WARNING}</div>
                  )}
                </div>

                <div className="journey-floating-hud-meter">
                  <div className="journey-floating-hud-meter-label">
                    <Sparkles size={15} />
                    <span>Time</span>
                  </div>
                  <div className="journey-floating-hud-bar">
                    <div className="journey-floating-hud-fill time-fill" style={{ width: `${(gameState.resources.time / 900) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="journey-floating-hud-cluster journey-floating-hud-count journey-floating-hud-gate">
                <span>Next seal</span>
                <strong>{activeHudGateGuidance?.activeGateName || 'Route Seal'}</strong>
                <em>
                  {activeHudShardRequirement
                    ? `${activeHudShardRequirement.found}/${activeHudShardRequirement.required} shards`
                    : `${gameState.relicShardCount}/${RELIC_SHARDS.length} shards`}
                  {activeHudFirstMissing && activeHudFirstMissing.type !== 'shards'
                    ? ` + ${activeHudFirstMissing.checklistLabel}`
                    : ''}
                </em>
              </div>
            </div>
            )}

            {characterLoaderVisible && (
              <div className="journey-character-loader" aria-label="Character loader">
                <label htmlFor="journey-character-loader-select">Character Loader</label>
                <select
                  id="journey-character-loader-select"
                  value={selectedCharacterPresetId}
                  onChange={(event) => setSelectedCharacterPresetId(event.target.value)}
                >
                  {PLAYER_CHARACTER_PRESETS.map(preset => (
                    <option key={preset.id} value={preset.id}>{preset.label}</option>
                  ))}
                </select>
                <p>{selectedCharacterPreset.description}</p>
                <small>
                  Ctrl+Alt+C hides or shows this loader. Concept sheets need a sprite atlas first.
                </small>
              </div>
            )}
            
            {gameState.postBossReward && (
              <div
                className={`journey-boss-reward-banner ${gameState.postBossReward.kitComplete ? 'is-complete' : ''}`}
                style={{ '--reward-accent': gameState.postBossReward.color }}
                role="status"
                aria-live="polite"
              >
                <div className="journey-boss-reward-badge" aria-hidden="true">
                  {gameState.postBossReward.itemLabel || 'K'}
                </div>
                <div className="journey-boss-reward-copy">
                  <div className="journey-boss-reward-kicker">
                    {gameState.postBossReward.phase === 'revealed' ? 'Tool piece revealed' : 'Tool piece recovered'}
                  </div>
                  <strong>{gameState.postBossReward.title}</strong>
                  <span>{gameState.postBossReward.detail}</span>
                  <em>{gameState.postBossReward.nextObjective}</em>
                </div>
                <div className="journey-boss-reward-progress">
                  {gameState.postBossReward.progressText}
                </div>
              </div>
            )}

            {activeGuardianChallenge && activeGuardianQuestion && (
              <div className="guardian-challenge-overlay" role="dialog" aria-modal="true" aria-label="Guardian Knowledge Challenge">
                <div className="guardian-challenge-card">
                  <div className="guardian-challenge-kicker">Guardian Knowledge Challenge</div>
                  <h2>{activeGuardianChallenge.bossName}</h2>
                  <p className="guardian-challenge-intro">
                    {activeGuardianChallenge.intro}
                  </p>
                  <div className="guardian-challenge-progress">
                    Question {activeGuardianChallenge.currentIndex + 1} of {activeGuardianChallenge.questions.length}
                    <span>{activeGuardianChallenge.correctCount} correct</span>
                  </div>
                  <div className="guardian-challenge-question">
                    {activeGuardianQuestion.question}
                  </div>
                  <div className="guardian-challenge-options">
                    {(activeGuardianQuestion.shuffledOptions || activeGuardianQuestion.options.map((text, index) => ({
                      id: `${activeGuardianQuestion.id}-${index}`,
                      text,
                      originalIndex: index,
                    }))).map((option, index) => {
                      const selected = activeGuardianChallenge.selectedAnswerIndex === option.originalIndex;
                      const correct = activeGuardianQuestion.correctIndex === option.originalIndex;
                      const locked = activeGuardianChallenge.selectedAnswerIndex !== null;
                      return (
                        <button
                          type="button"
                          key={option.id}
                          className={[
                            'guardian-challenge-option',
                            selected ? 'is-selected' : '',
                            locked && correct ? 'is-correct' : '',
                            locked && selected && !correct ? 'is-incorrect' : '',
                          ].filter(Boolean).join(' ')}
                          onClick={() => answerGuardianChallenge(option.originalIndex)}
                          disabled={locked}
                        >
                          <strong>{String.fromCharCode(65 + index)}</strong>
                          <span>{option.text}</span>
                        </button>
                      );
                    })}
                  </div>
                  {activeGuardianChallenge.feedback && (
                    <div className={`guardian-challenge-feedback ${activeGuardianChallenge.feedback.correct ? 'is-correct' : 'is-incorrect'}`}>
                      {activeGuardianChallenge.feedback.message}
                    </div>
                  )}
                  {activeGuardianChallenge.completed && (
                    <div className="guardian-challenge-result">
                      {activeGuardianChallenge.resultMessage}
                    </div>
                  )}
                  <div className="guardian-challenge-actions">
                    <button
                      type="button"
                      className="expedition-begin-btn"
                      onClick={continueGuardianChallenge}
                      disabled={activeGuardianChallenge.selectedAnswerIndex === null}
                    >
                      {activeGuardianChallenge.completed ? 'Begin Guardian Fight' : 'Next Question'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {gameState.failed && (
              <div className="expedition-failure-overlay">
                <div className="expedition-panel failure-card">
                  <ShieldAlert size={48} className="text-red-600 mb-4" />
                  <h3 className="cinzel-header">Field Rescue Required</h3>
                  <p>{gameState.failureDetail || FIELD_RESCUE_MESSAGE}</p>
                  {gameState.failureReason && (
                    <span className="failure-reason">{gameState.failureReason}</span>
                  )}
                  <button className="expedition-begin-btn" onClick={respawnAtCheckpoint}>
                    Retry from Checkpoint
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {briefingOpen && (
        <div className="expedition-briefing-overlay">
          <div className="expedition-briefing-card animate-slide-up">
            <div className="briefing-header">
              <div className="briefing-header-copy">
                <div className="briefing-kicker">
                  <Flag size={16} />
                  Field Mission Dossier
                </div>
                <h1 className="cinzel-header">Lost Site Expedition</h1>
                <p>Navigate the route, collect your field kit, and reach Base Camp.</p>
              </div>
              <div className="briefing-hero-mark" aria-hidden="true">
                <span className="briefing-sun" />
                <span
                  className="briefing-hero-sprite"
                  style={{ backgroundImage: `url(${PLAYER_SPRITE_SRC})` }}
                />
              </div>
            </div>
            <div className="briefing-content">
              <div className="mission-dossier expedition-start-dossier">
                <div className="dossier-tag">ACTIVE MISSION</div>
                <h2 className="mission-title">{mission.title}</h2>
                <p className="mission-desc">
                  {mission.instruction || `Search for evidence that supports ${targetCivilisation}.`}
                </p>
              </div>
              <div className="briefing-task-panel">
                <div className="briefing-task-heading">
                  <Map size={18} />
                  <h2>Your task</h2>
                </div>
                <ul className="briefing-task-list">
                  {[
                    'Collect field tools',
                    'Avoid hazards and conserve stamina',
                    'Reach Base Camp',
                    'Survey the site',
                    'Find 3 pieces of structural evidence',
                    'Make a claim using evidence',
                  ].map(task => (
                    <li key={task}>
                      <CheckCircle2 size={16} />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="briefing-actions">
              <button type="button" className="expedition-begin-btn" onClick={() => setBriefingOpen(false)}>
                Begin Expedition
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

ExpeditionJourney.tools = JOURNEY_TOOLS;
