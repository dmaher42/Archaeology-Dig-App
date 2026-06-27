import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DESERT_ENTRY_EXTERIOR_SPAWN_X,
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
  ATTACK_RECOIL_DURATION,
  COMBAT_DAMAGE_SCALE,
  LOW_STAMINA_WARNING,
  FIELD_RESCUE_MESSAGE,
  FIELD_RESCUE_STAMINA_REASON,
  EXHAUSTED_RECOVERY_RATE,
  EXHAUSTED_RECOVERY_CEILING,
  INITIAL_BOSS_SPRITE_LOAD_DELAY_MS,
  KNOWLEDGE_CHALLENGE_SIZE,
  GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED,
  KNOWLEDGE_CHALLENGE_FEEDBACK,
  OPENING_PYRAMID_GROUND_JUMP_MULTIPLIER,
  OPENING_PYRAMID_AIR_JUMP_MULTIPLIER,
  PERFECT_DODGE_ENDURANCE_REWARD,
  ENEMY_ATTACK_TRIGGER_REACH,
  ENEMY_COMBAT_STANDOFF_GAP,
  BOSS_INTRO_PLAYER_STANDOFF,
  CHARACTER_LOADER_STORAGE_KEY,
  JOURNEY_PROP_EDITOR_STORAGE_KEY,
  JOURNEY_PROP_EDITOR_SECTIONS_KEY,
  JOURNEY_PROP_EDITOR_PANEL_POS_KEY,
  CHARACTER_LOADER_VISIBILITY_STORAGE_KEY,
  BOSS_DOMAIN_ENEMY_FOCUS_PADDING,
  SCARAB_QUEEN_ENEMY_FOCUS_PADDING,
  SCARAB_QUEEN_INTRO_TRIGGER_DISTANCE,
  SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS,
  SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO,
  SCORPION_VENOM_SPIT_VISUAL_TRAVEL_TIME,
  PLAYER_SPRITE_DRAW_HEIGHT,
  PLAYER_SPRITE_FRAME_COUNT,
  PLAYER_SPRITE_FRAME_HEIGHT,
  PLAYER_SPRITE_FRAME_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_SPRITE_SCALE,
  JOURNEY_EXTERIOR_SCENE_ID,
  JOURNEY_VERTICAL_OFFSET,
  sacredMuralExteriorX,
  sacredScribeExteriorX,
  scaleJourneyX,
} from './expedition-journey/journeyConstants';

import {
  BOSS_KEY_ITEMS,
  CHECKPOINTS,
  ENVIRONMENT_INTERACTIONS,
  getJourneyMiniBosses,
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
  ROUTE_GATE_DOORWAYS,
  SCARAB_SEAL_TRIGGER,
  SECTIONS,
  SECTION_ATMOSPHERES,
  SECTION_COPY,
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
  setExpeditionJourneyCiv,
} from './expedition-journey/journeyDataRouter';
import lostSitePropRegistry from './expedition-journey/lostSitePropRegistry.json';
import {
  HEAVY_ATTACK_INTERVAL,
  getEnemyAttackTelegraph,
} from './expedition-journey/journeyCombatTelegraphs';
import {
  JourneyPlacementEditorPanel,
  JourneyPlacementEditorStackPicker,
} from './expedition-journey/JourneyPlacementEditorPanel.jsx';
import {
  JourneyBriefingOverlay,
  JourneyPlayerOverlays,
} from './expedition-journey/JourneyHudOverlays.jsx';
import {
  PROP_EDITOR_HANDLE_HIT,
  PROP_EDITOR_ROTATE_OFFSET,
  drawContactShadow,
  drawDecorativeBaseBlend,
  drawEditorSelectionCorners,
  drawEditorSelectionLabel,
  drawGroundDustLip,
  drawHazardGroundApron,
  drawRouteGroundApron,
} from './expedition-journey/journeyRenderPrimitives.js';
import {
  drawOpeningPyramidAssetRegionFrame,
  useJourneyRenderer,
} from './expedition-journey/useJourneyRenderer.js';
import { useJourneyExteriorStructureRenderers } from './expedition-journey/journeyExteriorStructureRenderers.js';
import { useJourneyInteriorRenderers } from './expedition-journey/journeyInteriorRenderers.js';
import { useJourneyPlacementEditorShortcuts } from './expedition-journey/useJourneyPlacementEditorShortcuts.js';
import { useJourneyPlacementEditorPointerHandlers } from './expedition-journey/useJourneyPlacementEditorPointerHandlers.js';
export { JourneyControlsReference } from './expedition-journey/journeyControlsReference.jsx';
import {
  ARRIVAL_THRESHOLD_ASSET_VERSION,
  ARRIVAL_THRESHOLD_ANUBIS_TRIAL_LINES,
  ARRIVAL_THRESHOLD_AWAKENED_SRC,
  ARRIVAL_THRESHOLD_WAKE_SECONDS,
  ARRIVAL_THRESHOLD_BACKGROUND_SRC,
  ARRIVAL_THRESHOLD_DUAT_ECHO_SRC,
  ARRIVAL_THRESHOLD_DOORWAY_GLOW_SRC,
  ARRIVAL_THRESHOLD_DOORWAY_OCCLUDER_SRC,
  ARRIVAL_THRESHOLD_ECHO_INTRO_DRIFT_SECONDS,
  ARRIVAL_THRESHOLD_ECHO_SPAWN_SECONDS,
  ARRIVAL_THRESHOLD_EXIT_WALK_END_X,
  ARRIVAL_THRESHOLD_EXIT_WALK_SECONDS,
  ARRIVAL_THRESHOLD_FLOOR_Y,
  ARRIVAL_THRESHOLD_FORWARD_GATE_TRIGGER_X,
  ARRIVAL_THRESHOLD_GATE_OBJECTIVE_LINE,
  ARRIVAL_THRESHOLD_LEFT_BOUND,
  ARRIVAL_THRESHOLD_LEFT_INSPECT_X,
  ARRIVAL_THRESHOLD_LEFT_LINES,
  ARRIVAL_THRESHOLD_LEFT_OBJECTIVE_LINE,
  ARRIVAL_THRESHOLD_MARKING_LINES,
  ARRIVAL_THRESHOLD_MARKINGS_INSPECT_X,
  ARRIVAL_THRESHOLD_OBJECTIVE_LINE,
  ARRIVAL_THRESHOLD_RAMP_END_X,
  ARRIVAL_THRESHOLD_RAMP_RISE,
  ARRIVAL_THRESHOLD_RAMP_START_X,
  ARRIVAL_THRESHOLD_RIGHT_BOUND,
  ARRIVAL_THRESHOLD_SEAL_VEIL_SRC,
  ARRIVAL_THRESHOLD_SPAWN_LINE,
  ARRIVAL_THRESHOLD_SPAWN_X,
  ARRIVAL_THRESHOLD_TRIAL_COMPLETE_LINE,
  ARRIVAL_THRESHOLD_TRIAL_EXIT_LOCKED_LINE,
  ARRIVAL_THRESHOLD_TRIAL_STEPS,
  CHINA_OPENING_ARRIVAL_NOTICE,
  OPENING_ARRIVAL_AFTERSHOCK_NOTICE,
  OPENING_ASHA_CUTSCENE_SRC,
  OPENING_CINEMATIC_DURATION,
  OPENING_CINEMATIC_ENABLED,
  OPENING_CINEMATIC_SPELL_IMPACT_AT,
  OPENING_CINEMATIC_VOICE_ENABLED,
  OPENING_SPHINX_ARRIVAL_SECONDS,
  OPENING_SPHINX_DURATION,
  OPENING_SPHINX_EXIT_SECONDS,
  OPENING_SPHINX_LINE_SECONDS,
  OPENING_THRESHOLD_FADE_SECONDS,
  OPENING_THRESHOLD_FALL_DELAY_SECONDS,
  OPENING_THRESHOLD_FALL_DURATION_SECONDS,
  OPENING_THRESHOLD_SCENE_DURATION,
  OPENING_THRESHOLD_STAIR_REVEAL_SECONDS,
  createArrivalThresholdTrialState,
  easeInOutCubic,
  getOpeningCinematicLine,
  getOpeningCinematicLines,
  getOpeningThresholdDialogueLine,
} from './expedition-journey/journeyOpeningScenes';
import {
  FORGOTTEN_MURAL_CHAMBER_RESTORATION_IDS,
  MUMMIFICATION_ANUBIS_WARNINGS,
  MUMMIFICATION_CHAMBER_ATMOSPHERE_VERSION,
  MUMMIFICATION_CHAMBER_DISTURBANCE_DURATION,
  MUMMIFICATION_CHAMBER_FEEDBACK,
  MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS,
  MUMMIFICATION_CHAMBER_PUZZLE,
  MUMMIFICATION_CHAMBER_RITE_OBJECTS,
  MUMMIFICATION_CHAMBER_RITUAL_GUIDANCE_VERSION,
  MUMMIFICATION_CHAMBER_RITUAL_SEQUENCE,
  MUMMIFICATION_CHAMBER_RITUAL_STEPS,
  MUMMIFICATION_HOLD_DURATIONS,
  MUMMIFICATION_JAR_SYMBOLS,
  MUMMIFICATION_ROOM_INTERACT_VERSION,
  SCRIBE_CHAMBER_DOOR_OPEN_LINE,
  SCRIBE_CHAMBER_FEEDBACK,
  SCRIBE_CHAMBER_PUZZLE,
  createChamberDoorVisuals,
  createChamberDoorVisualsById,
  getAnubisRestorationReaction,
  getMummificationChamberAtmosphere,
  getMummificationRiteByIndex,
  getRoomRestorationStatus,
  getSacredRoomEvidenceRows,
  getSacredRoomRestorationEvidence,
} from './expedition-journey/journeySacredRooms';
import {
  PLAYER_CHARACTER_PRESETS,
  getAtlasImagePath,
  getHeroSpriteFrameKey,
  getHeroSpriteFrameRowName,
  getHeroSpriteFrameScale,
  getHeroSpriteRow,
  getHeroSpriteRowScale,
  getPlayerCharacterPreset,
  getPlayerHeroSpriteConfig,
  isPlayerAttackVisualPhase,
} from './expedition-journey/journeyPlayerVisuals';

import {
  applyJourneyHazardPlacementEdit,
  applyJourneyCheckpointPlacementEdit,
  applyJourneyMiniBossPlacementEdit,
  applyJourneyPlatformPlacementEdit,
  applyJourneyPropPlacementEdit,
  applyJourneyRouteGateDoorwayPlacementEdit,
  applyJourneyRouteGatePlacementEdit,
  clamp,
  createJourneyForegroundDetailsPalette,
  createJourneyGroundDetailsPalette,
  createJourneyPlatformFromPaletteItem,
  createJourneyPlatformPalette,
  createJourneyPropFromPaletteItem,
  createJourneyPropPalette,
  createJourneyShardPropsPalette,
  createJourneyTrapFromPaletteItem,
  createJourneyTrapPalette,
  createForgottenMuralRelicSlidePuzzleTiles,
  createJourneyPlacementChangeSummary,
  createJourneyPlacementAiInstructions,
  createJourneyPropPlacementExport,
  serializeJourneyPropEditorState,
  restoreJourneyPropEditorState,
  parseColorGradeFilter,
  composeColorGradeFilter,
  JOURNEY_PROP_TINT_PRESETS,
  JOURNEY_PROP_SCENE_BLEND_RECIPE,
  DEFAULT_JOURNEY_PROP_EDITOR_ROTATION_STEP,
  DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE,
  DEFAULT_JOURNEY_PROP_EDITOR_SCALE_STEP,
  duplicateJourneyPropForEditor,
  FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_START_TILES,
  FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_TILE_LABELS,
  FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_VERSION,
  getForgottenMuralRelicSlideMove,
  getCollectibleHitbox,
  getEnemyAttackHurtbox,
  getHazardHitbox,
  getJourneyTrapTriggerRect,
  getNextJourneyRouteGate,
  getJourneyPropRoomId,
  getPlayerBodyHitbox,
  getSectionForX,
  isForgottenMuralRelicSlidePuzzleSolved,
  isLandingOnPlatform,
  isMummificationChamberComplete,
  isReusableJourneyTrap,
  createJourneyRoomInteractionState,
  journeyInteractHoldTick,
  journeyInteractInspect,
  journeyInteractPickUp,
  journeyInteractPlace,
  JOURNEY_INTERACT_OBJECT_STATES,
  JOURNEY_TRAP_DIRECTIONS,
  JOURNEY_TRAP_TYPES,
  makeEnemy,
  makeInitialState,
  normalizeJourneyTrap,
  rectsOverlap,
  resolveEnemyContact,
  resolveJourneyChamberEntryTrigger,
  resolveJourneyChamberReturnPoint,
  snapJourneyPropCoordinate,
  updateJourneyTrapRuntime,
  updatePlayerAnimation,
} from './expedition-journey/journeyUtils';
import {
  BOSS_ATTACK_PHASES,
  COMBAT_CHALLENGE_MODE,
  COMBAT_HIT_IMPACT_PROFILES,
  COMBAT_INTENSITY_VERSION,
  DEFAULT_BOSS_ATTACK_PHASES,
  ENEMY_AGGRO_MEMORY_SECONDS,
  ENEMY_AGGRO_PATROL_PADDING,
  ENEMY_DEFEATED_VISIBLE_SECONDS,
  isEnemyDefeatedVisible,
  MISSED_ATTACK_EXTRA_STAMINA_COST,
  PLAYER_ATTACK_BACK_REACH,
  PLAYER_ATTACK_COMBO_TIMINGS,
  PLAYER_ATTACK_FINISHER_DAMAGE,
  PLAYER_ATTACK_FINISHER_EXTRA_STAMINA_COST,
  PLAYER_ATTACK_HEIGHT,
  PLAYER_ATTACK_LIGHT_DAMAGE,
  PLAYER_ATTACK_NEAR_MISS_DISTANCE,
  PLAYER_ATTACK_NEAR_MISS_VERTICAL_TOLERANCE,
  PLAYER_ATTACK_PARRY_DAMAGE,
  PLAYER_ATTACK_RANGE,
  PLAYER_ATTACK_SHOVE_DAMAGE,
  PLAYER_ATTACK_STAMINA_COST,
  PLAYER_ATTACK_TYPES,
  PLAYER_BOSS_STAGGER_ENDURANCE_REWARD,
  PLAYER_COMBO_MAX_STEP,
  PLAYER_COMBO_PRESERVE_AFTER_DODGE_DURATION,
  PLAYER_COMBO_SLASH_EFFECT_SRC,
  PLAYER_COMBO_SLASH_EFFECT_VERSION,
  PLAYER_COMBO_WINDOW_DURATION,
  PLAYER_DEFEAT_ENDURANCE_REWARD,
  PLAYER_DODGE_DURATION,
  PLAYER_DODGE_INVULNERABLE_DURATION,
  PLAYER_DODGE_RECOVERY_DURATION,
  PLAYER_DODGE_SPEED,
  PLAYER_DODGE_STAMINA_COST,
  PLAYER_FINISHER_SLASH_EFFECT_SRC,
  PLAYER_FINISHER_SLASH_EFFECT_VERSION,
  PLAYER_HEAVY_FOLLOWUP_CUE_DURATION,
  PLAYER_HEAVY_FOLLOWUP_HIT_REFUND,
  PLAYER_HEAVY_FOLLOWUP_PROMPT_LABEL,
  PLAYER_HIT_SCREEN_SHAKE_DURATION,
  PLAYER_HIT_SCREEN_SHAKE_PIXELS,
  PROTECTED_HIT_EXTRA_STAMINA_COST,
  SCORPION_ATTACK_RANGE_MULTIPLIER,
  SCORPION_CHASE_SPEED_MULTIPLIER,
  SCORPION_VENOM_SLOW_DURATION,
  SCORPION_VENOM_SLOW_MULTIPLIER,
  SCORPION_VENOM_SPIT_RANGE,
  beginEnemyAttackWindup,
  beginEnemyAttackSwing,
  openEnemyCounterWindow,
  suppressEnemyForBossFocus,
  updateEnemyCombatTimers,
  updateEnemyDefeatedVisibility,
} from './expedition-journey/journeyCombat.js';

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
  EGYPT_FOREGROUND_DEPTH_ASSET_VERSION,
  EGYPT_PREMIUM_GROUND_CONTACT_ASSET_VERSION,
  ENVIRONMENT_ATLAS_JSON,
  ENVIRONMENT_ASSET_PACK_IDS,
  getEnvironmentAssetPackConfig,
  getEnvironmentAssetKeyForHazard,
  getEnvironmentAssetKeyForPlatform,
  getEnvironmentAssetKeyForStoryProp,
  getMissingEnvironmentAssets,
  JOURNEY_ASSET_GROUNDING_VERSION,
  loadEnvironmentAssetPack,
  MUMMIFICATION_CHAMBER_INTERACTIONS_ASSET_VERSION,
} from './expedition-journey/journeyRenderAssets';

import {
  CATACOMBS_BACKGROUND_ATLAS_JSON,
  CHINA_RIVER_VALLEY_BACKGROUND_ATLAS_JSON,
  createDesertBackgroundAssetState,
  DESERT_BACKGROUND_DEPTH_MODE,
  DIG_SITE_BACKGROUND_ATLAS_JSON,
  drawDesertBackgroundLayer,
  EGYPT_JOURNEY_BACKGROUND_SECTION_IDS,
  ESCAPE_BACKGROUND_ATLAS_JSON,
  getMissingSectionBackgroundAssets,
  getSectionBackgroundAssets,
  JOURNEY_BACKGROUND_DEPTH_MODE,
  loadDesertBackgroundAssetPack,
  RUINED_TEMPLE_BACKGROUND_ATLAS_JSON,
} from './expedition-journey/journeyBackgroundAssets';

import {
  DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION,
  DESERT_JOURNEY_LAYER_ROLES,
  DESERT_JOURNEY_SCENE_PANELS,
  getDesertJourneyPanelsForViewport,
  getDesertJourneyTransitionMasksForViewport,
} from './expedition-journey/journeyDesertBackgroundPanels';

import {
  ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON,
  BOSS_SPRITE_ATLAS_JSON,
  BOSS_SPRITE_ATLAS_VERSION,
  CHINA_CLAY_GUARDIAN_BOSS_ID,
  CHINA_CLAY_GUARDIAN_SPRITE_ATLAS_JSON,
  CHINA_JOURNEY_BOSS_SPRITE_PACK_IDS,
  createBossSpriteState,
  EGYPT_JOURNEY_BOSS_SPRITE_PACK_IDS,
  getAncientConstructDrawBox,
  getAncientConstructSpriteFrame,
  getBossSpritePack,
  getClayGuardianDrawBox,
  getClayGuardianSpriteFrame,
  getGiantSerpentDrawBox,
  getGiantSerpentSpriteFrame,
  getMissingBossSpriteAssets,
  SCARAB_QUEEN_DRAW_OFFSET_X,
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
  ROME_JOURNEY_BOSS_SPRITE_PACK_IDS,
  getLegateRevenantSpriteFrame,
  getLegateRevenantDrawBox,
  isRomeBossSpriteId,
  getRomeBossSpritePack,
} from './expedition-journey/rome/romeBossSprites';

import {
  CHINA_ENEMY_GUARDIAN_SPRITE_ATLAS_JSON,
  CHINA_JOURNEY_ENEMY_SPRITE_PACK_IDS,
  createEnemySpriteState,
  EGYPT_JOURNEY_ENEMY_SPRITE_PACK_IDS,
  ENEMY_SPRITE_ATLAS_JSON,
  ENEMY_SPRITE_ATLAS_VERSION,
  EXPECTED_CHINA_ENEMY_GUARDIAN_SPRITE_KEYS,
  getEnemyBodyLanguagePose,
  getEnemySpriteDrawBox,
  getEnemySpriteFamily,
  getEnemySpriteFrame,
  getEnemySpritePack,
  getMissingEnemySpriteAssets,
  loadEnemySpritePack,
  shouldFlipEnemySprite,
  shouldUseEnemySpritePack,
} from './expedition-journey/journeyEnemySprites';

import {
  ROME_ENEMY_SPRITE_PACK_IDS as ROME_JOURNEY_ENEMY_SPRITE_PACK_IDS,
} from './expedition-journey/rome/romeEnemySprites';

import { ROME_SECTION_BACKGROUND_PACKS } from './expedition-journey/rome/romeBackgroundAssets';

import {
  COLLECTIBLE_ATLAS_JSON,
  COLLECTIBLE_SPRITE_ATLAS_VERSION,
  createCollectibleSpriteState,
  drawCollectibleAtlasRegion,
  getMissingCollectibleSpriteAssets,
  getObjectiveSpriteKey,
  getRelicShardSpriteKey,
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

const getArrivalThresholdGroundY = (centerX) => {
  const rampProgress = clamp(
    (ARRIVAL_THRESHOLD_RAMP_START_X - centerX) / (ARRIVAL_THRESHOLD_RAMP_START_X - ARRIVAL_THRESHOLD_RAMP_END_X),
    0,
    1,
  );
  return ARRIVAL_THRESHOLD_FLOOR_Y - ARRIVAL_THRESHOLD_RAMP_RISE * rampProgress;
};

const getArrivalThresholdEchoHitbox = (echo) => {
  if (!echo) return null;
  const width = echo.width || 44;
  const height = echo.height || 70;
  const centerX = echo.x || 0;
  const groundY = getArrivalThresholdGroundY(centerX);
  return {
    x: centerX - width / 2,
    y: groundY - height,
    width,
    height,
  };
};

// Ravine Bridge painted art (chroma-keyed cutouts + transparent floor/ravine blend).
const LOST_BRIDGE_ASSET_VERSION = 'lost-bridge-art-2026-06-10f';
const LOST_BRIDGE_ASSET_DIR = 'assets/expedition/environment/egypt-opening/lost-bridge/';
const LOST_BRIDGE_STRUCTURE_SRC = `${LOST_BRIDGE_ASSET_DIR}lost-bridge-structure-cutout-2026-06-08.png`;
const LOST_BRIDGE_RAVINE_FLOOR_VARIANT_SRCS = {
  lostBridgeRavineFloor: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-ravine-drop-strip-clean-edge-2026-06-09.png`,
  lostBridgeRavineFloorWide: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-ravine-test-wide-2026-06-09.png`,
  lostBridgeRavineFloorDeep: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-ravine-test-deep-2026-06-09.png`,
  lostBridgeRavineFloorTallWide: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-ravine-test-tall-wide-2026-06-09.png`,
  lostBridgeRavineFinal: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-ravine-final-2026-06-10.png`,
  lostBridgeRavineCrevasse: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-ravine-crevasse-2026-06-10.png`,
  lostBridgeRavineTempleGapOption2: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-ravine-temple-gap-option2-2026-06-10.png`,
  lostBridgeRavineDepthInsertOption3: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-ravine-depth-insert-option3-2026-06-10.png`,
  lostBridgeRavineUnderBridgeInsert: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-ravine-under-bridge-insert-2026-06-10.png`,
};
const LOST_BRIDGE_RAVINE_FLOOR_ASSET_KEYS = new Set(Object.keys(LOST_BRIDGE_RAVINE_FLOOR_VARIANT_SRCS));
const LOST_BRIDGE_RAVINE_NORMAL_IMAGE_PROP_KEYS = new Set(['lostBridgeRavineUnderBridgeInsert']);
const LOST_BRIDGE_PIECE_SRCS = {
  slab: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-deck-slab-cutout-2026-06-08.png`,
  landing: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-end-landing-cutout-2026-06-08.png`,
  timber: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-timber-span-cutout-2026-06-08.png`,
  pillar: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-pillar-span-cutout-2026-06-08.png`,
};
// Per-piece alignment measured from the source art: horizontal padding fractions and the
// vertical fraction where the walkable deck surface sits, so the art lines up to the platform rect.
const LOST_BRIDGE_PIECE_TUNING = {
  slab: { padL: 0.0119, padR: 0.0119, deckTopFrac: 0.0497 },
  landing: { padL: 0.0117, padR: 0.0117, deckTopFrac: 0.0473 },
  timber: { padL: 0.0114, padR: 0.0114, deckTopFrac: 0.055 },
  pillar: { padL: 0.012, padR: 0.012, deckTopFrac: 0.0475 },
};
const LOST_BRIDGE_STRUCTURE_SIDE_PAD = 64;
const LOST_BRIDGE_STRUCTURE_DECK_TOP_FRAC = 0.34;
const LOST_BRIDGE_STRUCTURE_DECK_MAX_Y = 390;
const LOST_BRIDGE_STRUCTURE_DECK_IDS = new Set([
  'lost-bridge-near-landing',
  'lost-bridge-slab-1',
  'lost-bridge-slab-2',
  'lost-bridge-far-landing',
]);
const LOST_BRIDGE_EDITOR_DECK_IDS = new Set([
  'desert-entry-platform-9',
]);
const LOST_BRIDGE_RAVINE_FLOOR_PROP_ID = 'desert-entry-lost-bridge-ravine-floor-1';
const LOST_BRIDGE_OBSOLETE_RAVINE_FLOOR_PROP_IDS = new Set([
  'desert-entry-lost-bridge-ravine-floor-1-copy-1',
  'desert-entry-lost-bridge-ravine-floor-1-copy-1-copy-1',
]);
const isLostBridgeRavineFloorProp = (prop = {}) => (
  prop.id === LOST_BRIDGE_RAVINE_FLOOR_PROP_ID
  || LOST_BRIDGE_RAVINE_FLOOR_ASSET_KEYS.has(prop.imageAssetKey)
);
const isLostBridgeRavineNormalImageProp = (prop = {}) => (
  LOST_BRIDGE_RAVINE_NORMAL_IMAGE_PROP_KEYS.has(prop.imageAssetKey)
);
const isLostBridgeRavineSpecialRendererProp = (prop = {}) => (
  isLostBridgeRavineFloorProp(prop) && !isLostBridgeRavineNormalImageProp(prop)
);
const isObsoleteLostBridgeRavineFloorEditorProp = (prop = {}) => (
  LOST_BRIDGE_OBSOLETE_RAVINE_FLOOR_PROP_IDS.has(prop.id)
);
const pruneObsoleteLostBridgeRavineFloorEditorProps = (editor = {}) => {
  if (!Array.isArray(editor.createdProps)) return;
  editor.createdProps = editor.createdProps.filter(prop => !isObsoleteLostBridgeRavineFloorEditorProp(prop));
  LOST_BRIDGE_OBSOLETE_RAVINE_FLOOR_PROP_IDS.forEach((id) => {
    if (editor.edits) delete editor.edits[id];
    if (editor.deletedIds?.delete) editor.deletedIds.delete(id);
    if (editor.hiddenIds?.delete) editor.hiddenIds.delete(id);
  });
  if (LOST_BRIDGE_OBSOLETE_RAVINE_FLOOR_PROP_IDS.has(editor.selectedPropId)) {
    editor.selectedPropId = null;
  }
};
const pruneRetiredDesertEntryBackgroundEditorProps = (editor = {}) => {
  const idsToRemove = new Set(DESERT_ENTRY_RETIRED_BACKGROUND_PROP_IDS);
  if (Array.isArray(editor.createdProps)) {
    editor.createdProps = editor.createdProps.filter((prop) => {
      const retired = isRetiredDesertEntryBackgroundProp(prop);
      if (retired && prop?.id) idsToRemove.add(prop.id);
      return !retired;
    });
  }
  idsToRemove.forEach((id) => {
    if (editor.edits) delete editor.edits[id];
    if (editor.deletedIds?.delete) editor.deletedIds.delete(id);
    if (editor.hiddenIds?.delete) editor.hiddenIds.delete(id);
  });
  if (idsToRemove.has(editor.selectedPropId)) {
    editor.selectedPropId = null;
  }
};
const LOST_BRIDGE_RAVINE_FALL_DEPTH = 88;
const LOST_BRIDGE_RAVINE_FALL_SIDE_PAD = 210;
const LOST_BRIDGE_RAVINE_BLEND_CLIP_TOP_OFFSET = 8;
const LOST_BRIDGE_RAVINE_BLEND_CLIP_PAD = 44;
const LOST_BRIDGE_RAVINE_THROAT_TOP_OFFSET = 86;
const LOST_BRIDGE_RAVINE_FOREGROUND_VOID_SIDE_PAD = 180;
const LOST_BRIDGE_RAVINE_FOREGROUND_VOID_MIN_TOP_OFFSET = 310;
const LOST_BRIDGE_RAVINE_FOREGROUND_VOID_GROUND_CLEARANCE = 8;
const isLostBridgeStructureDeckPlatform = (platform = {}) => (
  (
    (platform.variant === 'lost-bridge' && LOST_BRIDGE_STRUCTURE_DECK_IDS.has(platform.id))
    || LOST_BRIDGE_EDITOR_DECK_IDS.has(platform.id)
  )
    && Number.isFinite(platform.y)
    && platform.y <= LOST_BRIDGE_STRUCTURE_DECK_MAX_Y
    && (platform.zIndex ?? 0) > -50
);
const getLostBridgeDeckBounds = (platforms = []) => {
  const deckPlatforms = platforms.filter(isLostBridgeStructureDeckPlatform);
  if (deckPlatforms.length === 0) return null;
  const left = Math.min(...deckPlatforms.map(platform => platform.x));
  const right = Math.max(...deckPlatforms.map(platform => platform.x + platform.width));
  const y = Math.min(...deckPlatforms.map(platform => platform.y));
  return { left, right, y, span: right - left };
};
const OPENING_SPHINX_SPRITE_BOSS_ID = 'ancient-construct';
const OPENING_SPHINX_APPARITION_SRC = 'assets/expedition/bosses/anubis-apparition.png';
const OPENING_SPHINX_SPRITE_VERSION = 'opening-anubis-apparition-2026-05-21';
const OPENING_SPHINX_SCREEN_Y_OFFSET = 112;
const OPENING_SPHINX_FOOT_Y = GROUND_Y - 10;
const ROME_OPENING_BACKGROUND_SRC = 'assets/expedition/backgrounds/rome-forum-ruins/rome-forum-ruins-main-2026-06-24.png';
const ROME_OPENING_ASHA_CUTSCENE_SRC = 'assets/expedition/player/asha-rome-cutscene-2026-06-24.png';
const ROME_OPENING_LEGATE_CUTSCENE_SRC = 'assets/expedition/bosses/rome/rome-legate-revenant-cutscene-2026-06-24.png';
const ROME_OPENING_VAULT_SIGIL_SRC = 'assets/expedition/environment/rome-section-one/rome-vault-sigil-cutscene-2026-06-24.png';
const ROME_OPENING_ARRIVAL_NOTICE = 'The way back is sealed. The Legate is watching. The only path is through the Forum.';
const CHINA_OPENING_BACKGROUND_SRC = 'assets/expedition/backgrounds/china-river-valley/china-river-valley-parallax-pack.png';
const CHINA_OPENING_ASHA_CUTSCENE_SRC = 'assets/expedition/player/china-asha-cutscene-2026-06-24.png';
const CHINA_OPENING_WATCHTOWER_SRC = 'assets/expedition/environment/china-river-valley/china-watchtower.png';
const CHINA_OPENING_GATE_SEAL_SRC = 'assets/expedition/environment/china-river-valley/china-imperial-gate-sealed.png';
const ROME_OPENING_CINEMATIC_ID = 'asha-legate-opening-cinematic';
const CHINA_OPENING_CINEMATIC_ID = 'asha-china-watchtower-opening-cinematic';
const EGYPT_OPENING_CINEMATIC_ID = 'asha-anubis-opening-cinematic';
const CHINA_OPENING_CINEMATIC_DURATION = 24;
const CHINA_OPENING_CINEMATIC_IMPACT_AT = 22.2;
const getOpeningArrivalNoticeForCinematicId = (cinematicId) => {
  if (cinematicId === ROME_OPENING_CINEMATIC_ID) return ROME_OPENING_ARRIVAL_NOTICE;
  if (cinematicId === CHINA_OPENING_CINEMATIC_ID) return CHINA_OPENING_ARRIVAL_NOTICE;
  return OPENING_ARRIVAL_AFTERSHOCK_NOTICE;
};
const TEMPLE_THRESHOLD_TRANSITION_DURATION = 8.4;
const TEMPLE_THRESHOLD_FADE_OUT_SECONDS = 0.95;
const TEMPLE_THRESHOLD_BLACK_HOLD_SECONDS = 0.55;
const TEMPLE_THRESHOLD_FADE_IN_SECONDS = 1.05;
const TEMPLE_THRESHOLD_SWITCH_SECONDS = TEMPLE_THRESHOLD_FADE_OUT_SECONDS + TEMPLE_THRESHOLD_BLACK_HOLD_SECONDS;
const TEMPLE_THRESHOLD_ANUBIS_START_SECONDS = TEMPLE_THRESHOLD_SWITCH_SECONDS + TEMPLE_THRESHOLD_FADE_IN_SECONDS + 0.25;
const FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION = 2.15;
const FORGOTTEN_MURAL_CHAMBER_FADE_OUT_SECONDS = 0.62;
const FORGOTTEN_MURAL_CHAMBER_BLACK_HOLD_SECONDS = 0.38;
const FORGOTTEN_MURAL_CHAMBER_SWITCH_SECONDS = FORGOTTEN_MURAL_CHAMBER_FADE_OUT_SECONDS + FORGOTTEN_MURAL_CHAMBER_BLACK_HOLD_SECONDS;
const FORGOTTEN_MURAL_CHAMBER_FADE_IN_SECONDS = 0.72;
const OPENING_SCARAB_SEAL_IMAGE_SRC = 'assets/expedition/environment/egypt-opening/scarab-seal-ground-embedded.png';
// Glowing Anubis judgement circle for the opening cut scene. Drop the generated
// PNG (bright teal+gold sigil on a transparent/black field) at this path; until
// then the cinematic falls back to the original embedded-seal art via onError.
const OPENING_JUDGEMENT_SEAL_IMAGE_SRC = 'assets/expedition/environment/egypt-opening/anubis-judgement-seal-2026-06-13.png';
const OPENING_PYRAMID_CLIMB_PACK_SRC = 'assets/expedition/environment/egypt-opening/pyramid-climb-pack.png';
const OPENING_PYRAMID_FACADE_SRC = 'assets/expedition/environment/egypt-opening/opening-pyramid-facade-no-stairs-v2.png';
const OPENING_TRAP_DECAL_PACK_SRC = 'assets/expedition/environment/egypt-opening/opening-trap-decals.png';
const OPENING_HAZARD_DECAL_PACK_SRC = 'assets/expedition/environment/egypt-opening/opening-hazard-decals.png';
const OPENING_TOMB_STAIRWELL_SRC = 'assets/expedition/environment/egypt-opening/opening-tomb-stairwell.png';
const ROUTE_GATE_FRONT_SRC = 'assets/expedition/environment/egypt-opening/route-gate-front.png';
const ROUTE_GATE_BACK_SRC = 'assets/expedition/environment/egypt-opening/route-gate-back.png';
const ROUTE_GATE_SLAB_SRC = 'assets/expedition/environment/egypt-opening/route-gate-slab.png';
const ROUTE_GATE_STANDALONE_PROP_COLOR_GRADE_FILTER = 'sepia(8%) saturate(100%) brightness(98%) contrast(106%)';
const MUMMIFICATION_CHAMBER_EXTERIOR_SRC = 'assets/expedition/environment/desert-temple/mummification-chamber-exterior-ledged-building-2026-06-12.png';
const MUMMIFICATION_CHAMBER_INTERIOR_SRC = 'assets/expedition/environment/desert-temple/mummification-chamber-interior-side-scroll-2026-05-31.png';
const FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_SRC = 'assets/expedition/environment/desert-temple/forgotten-mural-alcove-climb-structure.png';
const FORGOTTEN_MURAL_CHAMBER_SRC = 'assets/expedition/environment/desert-temple/forgotten-mural-chamber.png';
const FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_ART_SRC = 'assets/expedition/environment/desert-temple/forgotten-mural-relic-slide-puzzle-2026-06-01.png';
const FORGOTTEN_MURAL_HIDDEN_MEMORY_REVEAL_SRC = 'assets/expedition/environment/desert-temple/forgotten-mural-hidden-memory-reveal-2026-06-01.png';
const SCRIBE_CHAMBER_EXTERIOR_SRC = 'assets/expedition/environment/desert-temple/scribe-locked-chamber-exterior-climb-structure-v3.png';
const SCRIBE_CHAMBER_INTERIOR_SRC = 'assets/expedition/environment/desert-temple/scribe-locked-chamber-interior-2026-06-01.png';
const STAGE_ENTRANCE_DOORWAY_SRC = 'assets/expedition/environment/stage-entrances/egypt-tomb-doorway-transition.png';
const STAGE_ENTRANCE_DOORWAY_VERSION = 'imagegen-egypt-tomb-doorway-transition-2026-05-20';
const DESERT_END_GATEWAY_SRC = 'assets/expedition/environment/stage-entrances/desert-end-threshold-angled.png';
const DESERT_END_GATEWAY_VERSION = 'imagegen-desert-end-threshold-angled-blended-2026-05-23';
const SCARAB_QUEEN_LAIR_OPENING_IMAGE_SRC = 'assets/expedition/bosses/scarab-queen-buried-lair-opening.png';
const SCORPION_NEST_SRC = 'assets/expedition/enemies/scorpion-nest.png';
const SCORPION_NEST_VERSION = 'imagegen-scorpion-nest-2026-06-07';
const SCORPION_VENOM_SPIT_EFFECT_SRC = 'assets/expedition/effects/scorpion-venom-spit-strip-2026-06-09.png';
const SCORPION_VENOM_SPIT_EFFECT_VERSION = 'imagegen-scorpion-venom-spit-strip-2026-06-09';
const SCORPION_VENOM_SPIT_EFFECT_FRAMES = 6;
// Editor-tunable render defaults for the scorpion-nest art. widthScale multiplies the
// data box width to set the drawn footprint (height follows the PNG's native aspect);
// yOffset nudges the ground anchor up/down (negative lifts); glowYFactor places the amber
// glow above the base (× data height); glowSize scales the glow ellipse.
const SCORPION_NEST_EDITOR_DEFAULTS = { widthScale: 1.85, yOffset: 0, glowYFactor: 0.42, glowSize: 1 };
const OPENING_CAMERA_REVEAL_DURATION = 1.55;
const OPENING_CAMERA_REVEAL_PAN_SECONDS = 0.55;
const OPENING_CAMERA_REVEAL_HOLD_SECONDS = 0.18;
const OPENING_PYRAMID_ASSET_VERSION = 'opening-pyramid-climb-pack-2026-05-18';
const ROUTE_GATE_ASSET_VERSION = 'imagegen-egypt-route-gate-arch-column-slab-2026-05-31';
const OPENING_PYRAMID_FACADE_VERSION = 'opening-pyramid-facade-no-stairs-v2-2026-06-05';
const OPENING_TOMB_STAIRWELL_VERSION = 'opening-tomb-stairwell-generated-2026-05-21';
const MUMMIFICATION_CHAMBER_EXTERIOR_VERSION = 'imagegen-mummification-ledged-building-production-2026-06-12';
const MUMMIFICATION_CHAMBER_INTERIOR_VERSION = 'imagegen-mummification-chamber-side-scroll-puzzle-ready-2026-05-31';
const FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_VERSION = 'imagegen-forgotten-mural-alcove-climb-structure-2026-05-24';
const FORGOTTEN_MURAL_CHAMBER_VERSION = 'imagegen-forgotten-mural-chamber-2026-05-24';
const FORGOTTEN_MURAL_HIDDEN_MEMORY_REVEAL_VERSION = 'imagegen-forgotten-mural-hidden-memory-reveal-2026-06-01';
const SCRIBE_CHAMBER_EXTERIOR_VERSION = 'imagegen-scribe-locked-chamber-exterior-v3-2026-06-05';
const SCRIBE_CHAMBER_INTERIOR_VERSION = 'imagegen-scribe-locked-chamber-interior-2026-06-01';
const DESERT_ENTRY_BACKGROUND_ART_VERSION = 'necropolis-layered-playable-route-2026-06-25';
const DESERT_ENTRY_LAYERED_NECROPOLIS_OWNS_RAVINE_VISUALS = true;
const OPENING_PYRAMID_FACADE_WORLD_LEFT_X = -82;
const DESERT_ENTRY_CONTINUOUS_BACKGROUND_START_X = DESERT_JOURNEY_SCENE_PANELS[0]?.worldStart ?? 0;
const DESERT_ENTRY_CONTINUOUS_BACKGROUND_END_X = DESERT_JOURNEY_SCENE_PANELS[DESERT_JOURNEY_SCENE_PANELS.length - 1]?.worldEnd ?? 17400;
const DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_IDS = Object.freeze([]);
const DESERT_ENTRY_RETIRED_BACKGROUND_PROP_IDS = new Set([
  'desert-entry-asha-grounding-rubble-crumbs-1',
  'desert-entry-asha-grounding-tile-chips-1',
  'desert-entry-asha-grounding-boot-dust-1',
  'desert-entry-asha-grounding-foreground-edge-1',
  'desert-entry-brass-lanterns-1',
  'desert-entry-desert-entry-shade-canopy-camp-1',
  'desert-entry-damaged-jackal-statue-1',
  'desert-entry-opening-pyramid-to-ravine-background-1',
  'desert-entry-ravine-bridge-background-1',
  'desert-entry-ravine-to-mummification-background-1',
  'desert-entry-mummification-exterior-arrival-background-1',
  'desert-entry-mummification-to-mural-background-1',
  'desert-entry-mural-to-scribe-background-1',
  'desert-entry-mural-scribe-faded-murals-1',
  'desert-entry-mural-scribe-survey-flag-1',
  'desert-entry-scribe-queen-record-road-1',
  'desert-entry-scribe-queen-sand-wisp-1',
  'desert-entry-scribe-to-queen-background-1',
  'desert-entry-queen-arena-dust-veil-1',
  'desert-entry-queen-to-ruined-gateway-background-1',
  'scribe-chamber-doorway-structure',
  'desert-entry-generated-mummification-chamber-entrance-1',
  'desert-entry-ravine-mummification-doorway-transition-1',
  'desert-entry-lost-bridge-mummification-transition-apron-1',
  'desert-entry-bridge-mummification-dust-veil-1',
  'desert-entry-mummification-mural-record-wall-1',
  'desert-entry-mummification-mural-buried-causeway-1',
  'desert-entry-mummification-mural-sand-wisp-1',
  'desert-entry-mural-threshold-rubble-1',
  'desert-entry-mural-scribe-record-wall-1',
  'desert-entry-mural-scribe-causeway-slab-1',
  'desert-entry-scribe-threshold-rubble-1',
  'desert-entry-scribe-queen-causeway-slab-1',
  'desert-entry-scribe-queen-buried-column-1',
  'desert-entry-queen-arena-rubble-ring-1',
  'desert-entry-queen-arena-left-warning-column-1',
  'desert-entry-queen-arena-right-warning-column-1',
  'desert-entry-desert-seal-gate-back-1',
  'desert-entry-desert-seal-gate-front-1',
  'desert-entry-desert-seal-jackal-left-1',
  'desert-entry-desert-seal-return-stone-1',
  'desert-entry-desert-seal-glyph-panel-1',
  'desert-entry-desert-seal-jackal-right-1',
  'desert-entry-seal-gateway-collapsed-road-1',
  'desert-entry-seal-gateway-broken-endcap-1',
  'desert-entry-ruined-temple-gateway-collapsed-arch-1',
  'desert-entry-ruined-temple-gateway-rubble-1',
  'desert-entry-ruined-temple-gateway-dust-motes-1',
  'desert-entry-route-gate-front-1',
  'desert-entry-route-gate-back-1',
  'desert-entry-bridge-mummification-span-left-1',
  'desert-entry-bridge-mummification-span-right-1',
  'desert-entry-bridge-mummification-broken-left-cap-1',
  'desert-entry-bridge-mummification-slope-fill-1',
  'desert-entry-bridge-mummification-threshold-shelf-1',
  'desert-entry-bridge-mummification-seam-support-pier-1',
  'desert-entry-broken-shrine-pieces-1',
  'opening-rubble-left',
  'desert-entry-premium-threshold-slab-1',
  'desert-entry-premium-short-sand-lip-1',
  'desert-entry-premium-rubble-contact-shadow-1',
  'desert-entry-premium-rubble-contact-shadow-2',
  'desert-entry-premium-carved-stone-edge-1',
  'desert-entry-premium-carved-stone-edge-2',
  'desert-entry-premium-carved-stone-edge-4',
  'desert-entry-premium-small-stone-scatter-1',
  'desert-entry-premium-broken-masonry-footing-1',
  'desert-entry-hieroglyphic-tablets-1',
  'desert-entry-canvas-bags-1',
  'desert-entry-faded-murals-1',
  'desert-entry-cracked-stone-blocks-2',
  'desert-entry-desert-entry-relief-wall-fragment-1',
  'desert-entry-opening-pyramid-cracked-block-2',
  'desert-entry-opening-pyramid-cracked-block-2-copy-1',
  'desert-entry-opening-pyramid-cracked-block-2-copy-1-copy-1',
  'desert-entry-opening-pyramid-cracked-block-2-copy-2',
  'forgotten-mural-climb-structure',
]);
const DESERT_ENTRY_RETIRED_BACKGROUND_PROP_ID_PREFIXES = Object.freeze(
  [...DESERT_ENTRY_RETIRED_BACKGROUND_PROP_IDS].map(id => `${id}-copy-`),
);
const DESERT_ENTRY_RETIRED_BACKGROUND_ASSET_PATH_MARKERS = Object.freeze([
  'desert-entry-opening-pyramid-to-ravine-background-raw-2026-06-11.png',
  'desert-entry-ravine-bridge-background-raw-2026-06-11.png',
  'desert-entry-ravine-to-mummification-background-raw-2026-06-11.png',
  'desert-entry-mummification-exterior-arrival-background-raw-2026-06-11.png',
  'desert-entry-mummification-to-mural-background-raw-2026-06-11.png',
  'desert-entry-ravine-bridge-background-clean-2026-06-12.png',
  'desert-entry-mural-to-scribe-background-raw-2026-06-11.png',
  'desert-entry-scribe-to-queen-background-raw-2026-06-11.png',
  'desert-entry-queen-to-ruined-gateway-background-raw-2026-06-11.png',
  'mummification-chamber-exterior-ledged-building-2026-06-12.png',
  'ravine-mummification-doorway-clear-entry-no-shadow-2026-06-16.png',
  'desert-entry-relief-wall-fragment-2026-06-08.png',
]);
const DESERT_ENTRY_RETIRED_CHAMBER_DOOR_VISUAL_IDS = new Set([
  'mummification-chamber-entry-door',
]);
const isRetiredDesertEntryBackgroundProp = (prop = {}) => {
  const id = typeof prop.id === 'string' ? prop.id : '';
  if (DESERT_ENTRY_RETIRED_BACKGROUND_PROP_IDS.has(id)) return true;
  if (DESERT_ENTRY_RETIRED_BACKGROUND_PROP_ID_PREFIXES.some(prefix => id.startsWith(prefix))) return true;
  if (prop.sectionId === 'desert-entry' && prop.type === 'generated-mummification-chamber-entrance') return true;
  const assetPath = typeof prop.assetPath === 'string' ? prop.assetPath : '';
  return DESERT_ENTRY_RETIRED_BACKGROUND_ASSET_PATH_MARKERS.some(marker => assetPath.includes(marker));
};
const shouldRenderChamberDoorVisual = (door = {}) => (
  door.renderDoorVisual !== false
  && !DESERT_ENTRY_RETIRED_CHAMBER_DOOR_VISUAL_IDS.has(door.id)
);
const DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_SEAM_MASKS = Object.freeze([]);
const DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_ID_SET = new Set(DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_IDS);

const isDesertEntryRebuildBackgroundPlateProp = (prop = {}) => (
  DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_ID_SET.has(prop.id)
);

// When true, the desert opening shows the original bright photoreal sphinx backdrop
// at full brightness instead of the dimmer "opening rebuild" painted plates and dark
// sky wash (whose shaded mummification-temple side read as a dark shadow on the right).
// This forces the rebuild-sky coverage to 0 (so the backdrop is no longer faded out)
// and disables the scene panels + primary PNG plates that were layered over it.
const DESERT_ENTRY_RESTORE_ORIGINAL_BACKDROP = false;

const getDesertEntryOpeningRebuildViewportCoverage = (cameraX = 0) => {
  if (DESERT_ENTRY_RESTORE_ORIGINAL_BACKDROP) return 0;
  const viewportLeft = Number.isFinite(cameraX) ? cameraX : 0;
  const viewportRight = viewportLeft + CANVAS_WIDTH;
  const overlap = Math.min(viewportRight, DESERT_ENTRY_CONTINUOUS_BACKGROUND_END_X)
    - Math.max(viewportLeft, DESERT_ENTRY_CONTINUOUS_BACKGROUND_START_X);
  return Math.max(0, Math.min(1, overlap / CANVAS_WIDTH));
};

const DEFAULT_LEVEL_TRANSITION = {
  title: 'ROUTE COMPLETE',
  subtitle: 'Entering the next chamber',
  destinationNotice: 'Asha passes through the threshold.',
  finalNotice: 'The route ahead is open.',
  revealObjectiveLead: 200,
};

const STAGE_ENTRANCE_THEME_FILTERS = {
  'sunlit-desert-gateway': 'sepia(3%) saturate(104%) brightness(103%) contrast(101%)',
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

const getTimelineRequirementProgress = (sequence = [], current = {}) => {
  const requiredIds = sequence
    .map(item => (typeof item === 'string' ? item : item?.id))
    .filter(Boolean);
  const collectedIds = current.collectedTimelineEvidenceIds instanceof Set
    ? current.collectedTimelineEvidenceIds
    : new Set(Array.isArray(current.romeTimelineEvidenceOrder) ? current.romeTimelineEvidenceOrder : []);
  const foundIds = requiredIds.filter(id => collectedIds.has(id));
  const missingIds = requiredIds.filter(id => !collectedIds.has(id));
  return {
    requiredIds,
    foundIds,
    missingIds,
    found: foundIds.length,
    required: requiredIds.length,
    complete: requiredIds.length > 0 && missingIds.length === 0,
  };
};

const areRouteGateRequirementsMetForState = (gate, current) => {
  if (!gate?.requires) return true;
  const requirements = gate.requires;
  const enemiesDisabled = Boolean(current?.enemiesDisabled);
  if (requirements.objective && !current.completedObjectiveIds?.has(requirements.objective)) return false;
  if (!enemiesDisabled && requirements.miniBoss && !current.defeatedMiniBosses?.has(requirements.miniBoss)) return false;
  if (requirements.keyItem) {
    const collected = current.collectedBossKeyIds?.has(requirements.keyItem)
      || current.bossKeyItems?.some(item => item.id === requirements.keyItem && item.collected);
    if (!enemiesDisabled && !collected) return false;
  }
  if (!enemiesDisabled && requirements.enemies?.some(enemyId => !current.defeatedEnemies?.has(enemyId))) return false;
  if (Number.isFinite(requirements.shards) && (current.relicShardCount || 0) < requirements.shards) return false;
  if (requirements.timelineSequence?.length && !getTimelineRequirementProgress(requirements.timelineSequence, current).complete) return false;
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
// Route gate regions removed - using split assets directly.
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
  'lost-bridge-ravine-spikes': 'spikeTrap',
  'lost-bridge-ravine-sand': 'softSandPit',
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
  spikeTrap: { xPad: 12, widthPad: 24, height: 44, footInset: 34 },
  pressurePlate: { xPad: 14, widthPad: 28, height: 50, footInset: 18 },
  crackedFloor: { xPad: 16, widthPad: 32, height: 62, footInset: 14 },
  scarabSealTrap: { xPad: 22, widthPad: 44, height: 76, footInset: 22 },
  glyphTripwire: { xPad: 28, widthPad: 56, height: 48, footInset: 18 },
  fallingStoneWarning: { xPad: 24, widthPad: 48, height: 112, footInset: 0 },
  softSandPit: { xPad: 20, widthPad: 40, height: 46, footInset: 18 },
  thornScrub: { xPad: 10, widthPad: 20, height: 58, footInset: 18 },
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
const SACRED_MURAL_APPROACH_X = sacredMuralExteriorX;
const SACRED_SCRIBE_APPROACH_X = sacredScribeExteriorX;
const MUMMIFICATION_EXTERIOR_WORLD_OFFSET = scaleJourneyX(70);
const mummificationExteriorWorldX = (x) => scaleJourneyX(x) + MUMMIFICATION_EXTERIOR_WORLD_OFFSET;
const TEMPLE_APPROACH_RAMP_WALK_SURFACE = [
  { x: 245, y: GROUND_Y },
  { x: 935, y: GROUND_Y },
];
const TEMPLE_APPROACH_RAMP_ASSIST = {
  minX: 220,
  maxX: 946,
  maxSnapDown: 18,
  maxSnapUp: 18,
};
const TEMPLE_APPROACH_RAMP_LOWER_PATH_FOOT_Y = GROUND_Y;
const getTempleApproachRampSurfaceY = (centerX) => {
  const points = TEMPLE_APPROACH_RAMP_WALK_SURFACE;
  if (centerX <= points[0].x) return points[0].y;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    if (centerX <= current.x) {
      const progress = clamp((centerX - previous.x) / Math.max(1, current.x - previous.x), 0, 1);
      return previous.y + (current.y - previous.y) * progress;
    }
  }
  return points[points.length - 1].y;
};
const TEMPLE_THRESHOLD_HALL_ENTRY_SPAWN = {
  x: scaleJourneyX(150),
  y: openingJourneyY(318),
  cameraAnchorRatio: 0.38,
  direction: 1,
};
const TEMPLE_THRESHOLD_HALL_RETURN_FALLBACK = {
  x: 865,
  y: GROUND_Y,
  cameraAnchorRatio: 0.5,
  direction: -1,
};
const TEMPLE_THRESHOLD_HALL_ENTRY_TRIGGER = {
  minX: 805,
  maxX: 935,
  maxY: GROUND_Y + 10,
  footY: GROUND_Y,
  footTolerance: 36,
};
const TEMPLE_THRESHOLD_HALL_ENTRY_DISABLED_FOR_BUILD = true;
const TEMPLE_THRESHOLD_HALL_CAMERA_X = scaleJourneyX(80);
const TEMPLE_THRESHOLD_HALL_BOUNDS = {
  minX: scaleJourneyX(80),
  maxX: scaleJourneyX(290),
};
const TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER = {
  minX: scaleJourneyX(96),
  maxX: scaleJourneyX(126),
  maxY: GROUND_Y - 20,
  footY: openingJourneyY(318),
  footTolerance: 20,
};
const TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER = {
  minX: scaleJourneyX(210),
  maxX: scaleJourneyX(246),
  maxY: GROUND_Y - 20,
  footY: openingJourneyY(318),
  footTolerance: 24,
};
const MUMMIFICATION_CHAMBER_ENTRY_SPAWN = {
  x: scaleJourneyX(596),
  y: openingJourneyY(318),
  cameraAnchorRatio: 0.56,
  direction: 1,
};
const MUMMIFICATION_CHAMBER_RETURN_FALLBACK = {
  x: mummificationExteriorWorldX(710),
  y: openingJourneyY(-134),
  cameraAnchorRatio: 0.42,
  direction: 1,
};
const MUMMIFICATION_CHAMBER_ENTRY_TRIGGER = {
  minX: mummificationExteriorWorldX(688),
  maxX: mummificationExteriorWorldX(724),
  maxY: GROUND_Y - 50,
  footY: openingJourneyY(-135),
  footTolerance: 42,
};
const MUMMIFICATION_CHAMBER_CAMERA_X = scaleJourneyX(520);
const MUMMIFICATION_CHAMBER_BOUNDS = {
  minX: scaleJourneyX(520),
  maxX: scaleJourneyX(760),
};
const MUMMIFICATION_CHAMBER_EXIT_TRIGGER = {
  minX: scaleJourneyX(535),
  maxX: scaleJourneyX(565),
  maxY: GROUND_Y - 20,
  footY: openingJourneyY(318),
  footTolerance: 20,
};
const MUMMIFICATION_CHAMBER_INTERIOR_ASSET_DESCRIPTION = 'side-on mummification chamber, reachable mummy table, linen, canopic jars, oils, ritual tablet, Anubis statue, glowing exit seal';
const MUMMIFICATION_CHAMBER_READABILITY = Object.freeze({
  mummificationChamberPuzzleCenterpiece: { x: 565, y: 310, radiusX: 210, radiusY: 64 },
  mummificationChamberReadableZones: [
    { id: 'left-sealed-entrance', x: 154, y: 340, radiusX: 88, radiusY: 160 },
    { id: 'embalming-table', x: 565, y: 314, radiusX: 220, radiusY: 80 },
    { id: 'linen-and-oils', x: 350, y: 465, radiusX: 140, radiusY: 82 },
    { id: 'canopic-jars', x: 585, y: 438, radiusX: 185, radiusY: 92 },
    { id: 'ritual-tablet', x: 780, y: 475, radiusX: 80, radiusY: 90 },
  ],
});
const FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN = {
  x: scaleJourneyX(918),
  y: openingJourneyY(318),
  cameraAnchorRatio: 0.18,
  direction: 1,
};
const FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK = {
  x: SACRED_MURAL_APPROACH_X(1220),
  y: openingJourneyY(318),
  cameraAnchorRatio: 0.42,
  direction: 1,
};
const FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER = {
  minX: SACRED_MURAL_APPROACH_X(1213),
  maxX: SACRED_MURAL_APPROACH_X(1247),
  maxY: GROUND_Y - 170,
  footY: openingJourneyY(-42),
  footTolerance: 18,
};
const FORGOTTEN_MURAL_CHAMBER_CAMERA_X = scaleJourneyX(880);
const FORGOTTEN_MURAL_CHAMBER_BOUNDS = {
  minX: scaleJourneyX(880),
  maxX: scaleJourneyX(1074),
};
const FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER = {
  minX: scaleJourneyX(880),
  maxX: scaleJourneyX(906),
  maxY: GROUND_Y - 20,
  footY: openingJourneyY(318),
  footTolerance: 20,
};
const SCRIBE_CHAMBER_ENTRY_SPAWN = {
  x: scaleJourneyX(1210),
  y: openingJourneyY(318),
  cameraAnchorRatio: 0.16,
  direction: 1,
};
const SCRIBE_CHAMBER_RETURN_FALLBACK = {
  x: SACRED_SCRIBE_APPROACH_X(1684),
  y: openingJourneyY(122),
  cameraAnchorRatio: 0.42,
  direction: 1,
};
const SCRIBE_CHAMBER_ENTRY_TRIGGER = {
  minX: SACRED_SCRIBE_APPROACH_X(1684),
  maxX: SACRED_SCRIBE_APPROACH_X(1714),
  maxY: GROUND_Y - 250,
  footY: openingJourneyY(62),
  footTolerance: 24,
};
const SCRIBE_CHAMBER_CAMERA_X = scaleJourneyX(1180);
const SCRIBE_CHAMBER_BOUNDS = {
  minX: scaleJourneyX(1188),
  maxX: scaleJourneyX(1378),
};
const SCRIBE_CHAMBER_EXIT_TRIGGER = {
  minX: scaleJourneyX(1350),
  maxX: scaleJourneyX(1372),
  maxY: GROUND_Y - 20,
  footY: openingJourneyY(318),
  footTolerance: 20,
};
const CHAMBER_DOOR_VISUALS = createChamberDoorVisuals({
  TEMPLE_THRESHOLD_HALL_ENTRY_TRIGGER,
  TEMPLE_THRESHOLD_HALL_RETURN_FALLBACK,
  MUMMIFICATION_CHAMBER_ENTRY_TRIGGER,
  MUMMIFICATION_CHAMBER_RETURN_FALLBACK,
  FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER,
  FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK,
  SCRIBE_CHAMBER_ENTRY_TRIGGER,
  SCRIBE_CHAMBER_RETURN_FALLBACK,
});
const CHAMBER_DOOR_VISUALS_BY_ID = createChamberDoorVisualsById(CHAMBER_DOOR_VISUALS);
const SCRIBE_CHAMBER_TABLET_REGION = {
  x: scaleJourneyX(1254),
  y: openingJourneyY(240),
  width: 74,
  height: 90,
};
const SCRIBE_CHAMBER_WALL_REGION = {
  x: scaleJourneyX(1220),
  y: openingJourneyY(112),
  width: 760,
  height: 170,
};
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

const PARRY_WINDOW_DURATION = 0.12;
const getPlayerAttackTiming = (sequenceIndex = 1) => {
  const timingIndex = Math.max(0, sequenceIndex - 1) % PLAYER_ATTACK_COMBO_TIMINGS.length;
  return PLAYER_ATTACK_COMBO_TIMINGS[timingIndex] || PLAYER_ATTACK_COMBO_TIMINGS[0];
};

const resetPlayerCombo = (current) => {
  current.attackComboWindowTimer = 0;
  current.attackComboLanded = false;
  current.attackComboPreserved = false;
  current.attackComboStep = 0;
  current.attackComboFinisherActive = false;
  current.attackSequenceIndex = 0;
  current.attackQueuedType = PLAYER_ATTACK_TYPES.LIGHT;
  current.attackQueuedHeavyFollowupPrimed = false;
  current.attackType = PLAYER_ATTACK_TYPES.LIGHT;
  current.heavyFollowupReadyTimer = 0;
  current.heavyFollowupCueTimer = 0;
};

const DEFAULT_ENEMY_ATTACK_PATTERN = {
  id: 'strike',
  label: 'Strike',
  windup: 0.38,
  duration: 0.26,
  cooldown: 1.15,
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
    cooldown: 1.22,
    recovery: 0.56,
    vulnerableAfter: 0.62,
    speed: 185,
    range: 38,
    protectedDuringWindup: false,
  },
  scorpion: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'sting',
    label: 'Sting',
    windup: 0.6,
    duration: 0.3,
    cooldown: 1.15,
    recovery: 0.64,
    vulnerableAfter: 0.7,
    speed: 54,
    range: 28,
    height: 58,
    yOffset: -34,
    backReach: 38,
    damageScale: 1.45,
    color: '#d97706',
    protectedDuringWindup: false,
  },
  'sand-wisp': {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'sand-burst',
    label: 'Sand Burst',
    windup: 0.5,
    duration: 0.24,
    cooldown: 1.36,
    recovery: 0.58,
    vulnerableAfter: 0.64,
    speed: 150,
    range: 38,
    height: 30,
    color: '#facc15',
    protectedDuringWindup: false,
  },
  snake: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'lunge',
    label: 'Lunge',
    windup: 0.62,
    duration: 0.28,
    cooldown: 1.12,
    recovery: 0.6,
    vulnerableAfter: 0.68,
    speed: 166,
    range: 52,
    protectedDuringWindup: false,
  },
  bat: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'swoop',
    label: 'Swoop',
    windup: 0.36,
    duration: 0.32,
    cooldown: 0.92,
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
    cooldown: 1.70,
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
    cooldown: 1.02,
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
    cooldown: 1.46,
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
    cooldown: 1.28,
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
    cooldown: 1.77,
    recovery: 0.96,
    vulnerableAfter: 1,
    speed: 46,
    range: 52,
    height: 34,
    shieldDuringWindup: true,
  },
};

const HEAVY_ATTACK_PATTERNS = {
  scarab: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'heavy-charge',
    label: 'Heavy Charge',
    windup: 0.82,
    duration: 0.38,
    cooldown: 2.1,
    recovery: 0.78,
    vulnerableAfter: 0.9,
    speed: 240,
    range: 44,
    damageScale: 1.6,
    shieldDuringWindup: true,
    protectedDuringWindup: true,
    color: '#b45309',
  },
  scorpion: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'power-sting',
    label: 'Power Sting',
    windup: 1.0,
    duration: 0.36,
    cooldown: 2.2,
    recovery: 0.88,
    vulnerableAfter: 0.96,
    speed: 48,
    range: 32,
    height: 68,
    yOffset: -38,
    backReach: 44,
    damageScale: 1.7,
    shieldDuringWindup: true,
    protectedDuringWindup: true,
    color: '#b45309',
  },
  snake: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'deep-lunge',
    label: 'Deep Lunge',
    windup: 0.9,
    duration: 0.32,
    cooldown: 2.0,
    recovery: 0.82,
    vulnerableAfter: 0.88,
    speed: 220,
    range: 72,
    damageScale: 1.6,
    shieldDuringWindup: false,
    protectedDuringWindup: false,
    color: '#b45309',
  },
  bat: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'dive-swoop',
    label: 'Dive Swoop',
    windup: 0.72,
    duration: 0.38,
    cooldown: 1.9,
    recovery: 0.68,
    vulnerableAfter: 0.76,
    speed: 260,
    range: 50,
    height: 40,
    damageScale: 1.5,
    shieldDuringWindup: false,
    protectedDuringWindup: false,
    color: '#b45309',
  },
  'sand-wisp': {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'sand-storm-burst',
    label: 'Sand Storm',
    windup: 0.86,
    duration: 0.3,
    cooldown: 2.1,
    recovery: 0.78,
    vulnerableAfter: 0.84,
    speed: 180,
    range: 56,
    height: 44,
    damageScale: 1.5,
    shieldDuringWindup: false,
    protectedDuringWindup: false,
    color: '#b45309',
  },
  guardian: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'heavy-slam',
    label: 'Heavy Slam',
    windup: 1.2,
    duration: 0.48,
    cooldown: 2.6,
    recovery: 1.2,
    vulnerableAfter: 1.3,
    speed: 44,
    range: 62,
    height: 40,
    damageScale: 1.7,
    shieldDuringWindup: true,
    protectedDuringWindup: true,
    color: '#92400e',
  },
  mummy: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'khopesh-cleave',
    label: 'Khopesh Cleave',
    windup: 1.1,
    duration: 0.44,
    cooldown: 2.5,
    recovery: 1.1,
    vulnerableAfter: 1.2,
    speed: 50,
    range: 58,
    height: 72,
    yOffset: -28,
    backReach: 32,
    damageScale: 1.7,
    shieldDuringWindup: true,
    protectedDuringWindup: true,
    color: '#92400e',
  },
  looter: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'ambush-dash',
    label: 'Ambush',
    windup: 0.22,
    duration: 0.28,
    cooldown: 1.8,
    recovery: 0.5,
    vulnerableAfter: 0.56,
    speed: 240,
    range: 48,
    damageScale: 1.5,
    shieldDuringWindup: false,
    protectedDuringWindup: false,
    color: '#b45309',
  },
  bes: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'bes-heavy-swipe',
    label: 'Heavy Swipe',
    windup: 1.1,
    duration: 0.42,
    cooldown: 2.4,
    recovery: 1.1,
    vulnerableAfter: 1.2,
    speed: 62,
    range: 64,
    height: 76,
    yOffset: -32,
    backReach: 34,
    damageScale: 1.8,
    shieldDuringWindup: true,
    protectedDuringWindup: true,
    color: '#92400e',
  },
  statue: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'pulse-slam-heavy',
    label: 'Curse Slam',
    windup: 1.3,
    duration: 0.52,
    cooldown: 2.8,
    recovery: 1.2,
    vulnerableAfter: 1.3,
    speed: 38,
    range: 64,
    height: 40,
    damageScale: 1.8,
    shieldDuringWindup: true,
    protectedDuringWindup: true,
    color: '#92400e',
  },
};

const ENEMY_TYPE_STAKE_MESSAGES = {
  scarab: 'Scarab face armor blocks frontal hits. Let it charge past, then strike from behind.',
  scorpion: 'Scorpion venom slows Asha. If a scarab is nearby, its charge gets faster.',
  'sand-wisp': 'Sand wisps tense before they burst. Wait for the opening.',
  snake: 'Snake lunges from mid-range. Watch the coil.',
  bat: 'Beware: Bats swoop across gaps. Watch their movement.',
  looter: 'Beware: Rival scouts dash quickly. Counter after they miss.',
  mummy: 'Warrior mummies guard the threshold. Wait for the sweep, then counter.',
  guardian: 'Stone guardians are slow blockers. Wait for the opening.',
  statue: 'Cursed statues slam hard. Move carefully.',
};

const easeCinematicStep = (value) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

const getScarabQueenEmergenceBeat = (introProgress) => {
  const sceneProgress = clamp(1 - introProgress, 0, 1);
  return {
    sceneProgress,
    buriedSealCrack: easeCinematicStep(clamp((sceneProgress - 0.12) / 0.24, 0, 1)),
    glyphGlow: easeCinematicStep(clamp((sceneProgress - 0.22) / 0.26, 0, 1)),
    sandEruption: easeCinematicStep(clamp((sceneProgress - 0.36) / 0.24, 0, 1)),
    queenRise: easeCinematicStep(clamp((sceneProgress - 0.48) / 0.34, 0, 1)),
    finalHold: easeCinematicStep(clamp((sceneProgress - 0.78) / 0.18, 0, 1)),
  };
};

const SCORPION_VENOM_ATTACK_PATTERN = {
  ...DEFAULT_ENEMY_ATTACK_PATTERN,
  id: 'venom-spit',
  label: 'Venom Spit',
  windup: 0.72,
  duration: 0.36,
  cooldown: 2.15,
  recovery: 0.72,
  vulnerableAfter: 0.82,
  speed: 0,
  range: SCORPION_VENOM_SPIT_RANGE,
  height: 44,
  yOffset: -28,
  backReach: 8,
  damageScale: 0,
  slowDuration: SCORPION_VENOM_SLOW_DURATION,
  slowMultiplier: SCORPION_VENOM_SLOW_MULTIPLIER,
  ranged: true,
  color: '#84cc16',
  protectedDuringAttack: false,
  protectedDuringWindup: false,
};

const isNormalEnemyInsideBossFocus = (enemy, bossDomain) => {
  if (!enemy || !bossDomain) return false;
  const focusPadding = bossDomain.bossId === SCARAB_SEAL_TRIGGER.bossId
    ? SCARAB_QUEEN_ENEMY_FOCUS_PADDING
    : BOSS_DOMAIN_ENEMY_FOCUS_PADDING;
  const focusStart = (bossDomain.arenaStart ?? 0) - focusPadding;
  const focusEnd = (bossDomain.arenaEnd ?? WORLD_WIDTH) + focusPadding;
  const enemyCenter = enemy.x + enemy.width / 2;
  return enemyCenter >= focusStart && enemyCenter <= focusEnd;
};

const JOURNEY_SCENE_IDS = Object.freeze({
  EXTERIOR: JOURNEY_EXTERIOR_SCENE_ID,
  TEMPLE_THRESHOLD_HALL: 'temple-threshold-hall',
  MUMMIFICATION_CHAMBER: 'mummification-chamber',
  FORGOTTEN_MURAL_CHAMBER: 'forgotten-mural-chamber',
  SCRIBE_LOCKED_CHAMBER: 'scribe-locked-chamber',
});

const getJourneySceneId = (current) => current?.currentSceneId || JOURNEY_SCENE_IDS.EXTERIOR;
const isTempleThresholdHallScene = (current) => getJourneySceneId(current) === JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL;
const isMummificationChamberScene = (current) => getJourneySceneId(current) === JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER;
const isForgottenMuralChamberScene = (current) => getJourneySceneId(current) === JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER;
const isScribeLockedChamberScene = (current) => getJourneySceneId(current) === JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER;
const isInteriorChamberScene = (current) => (
  isTempleThresholdHallScene(current)
  || isMummificationChamberScene(current)
  || isForgottenMuralChamberScene(current)
  || isScribeLockedChamberScene(current)
);
const getEntitySceneId = (entity) => entity?.sceneId || JOURNEY_SCENE_IDS.EXTERIOR;
const isEntityActiveInScene = (entity, current) => getEntitySceneId(entity) === getJourneySceneId(current);
const isStoryPropRouteGateVisibilityMet = (prop, current) => {
  const openedRouteGateIds = current?.openedRouteGateIds;
  if (prop?.showWhenRouteGateOpenId && !openedRouteGateIds?.has?.(prop.showWhenRouteGateOpenId)) return false;
  if (prop?.hideWhenRouteGateOpenId && openedRouteGateIds?.has?.(prop.hideWhenRouteGateOpenId)) return false;
  return true;
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
  isEntityActiveInScene(platform, current)
  && (!platform.requiresUpgrade || current.collectedUpgrades.has(platform.requiresUpgrade))
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
  isEntityActiveInScene(hazard, current)
  && (!hazard.revealedByScarabSeal || current.scarabSealActivated)
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

const ROME_GATE_HINTS = {
  objective: {
    'via-sacra': 'One Via Sacra evidence piece is still behind you on the Roman street.',
    'forum-ruins': 'One Forum record is still behind you among the ruined public buildings.',
    'subterranean-thermae': 'One thermae clue is still behind you near the steam channels.',
    'basilica-interior': 'One basilica archive clue is still behind you near the civic hall.',
    'sealed-vault': 'The vault will not open until the buried archive evidence is restored.',
  },
  shards: 'Search the Via Sacra route and Forum-side platforms for the next evidence shard.',
};

const CHINA_BOSS_KEY_ITEM_COPY = {
  'brush-handle': { name: 'Survey Brush Handle', checklistLabel: 'Survey Brush Handle' },
  'trowel-blade': { name: 'Archive Trowel Blade', checklistLabel: 'Archive Trowel Blade' },
  'measuring-cord': { name: 'River Measuring Cord', checklistLabel: 'River Measuring Cord' },
  'field-notebook-clasp': { name: 'Field Notebook Clasp', checklistLabel: 'Field Notebook Clasp' },
  'camera-lens': { name: 'Survey Camera Lens', checklistLabel: 'Survey Camera Lens' },
  // Section One dynasty mandates
  'river-jade-token': { name: 'River Jade Token', checklistLabel: 'River Jade Token' },
  'shang-bronze-ladle': { name: 'Shang Bronze Ladle', checklistLabel: 'Shang Bronze Ladle' },
  'zhou-mandate-scroll': { name: 'Zhou Mandate Scroll', checklistLabel: 'Zhou Mandate Scroll' },
  'qin-imperial-mandate': { name: 'Qin Imperial Mandate', checklistLabel: 'Qin Imperial Mandate' },
  'han-invention-compass': { name: 'Han Invention Compass', checklistLabel: 'Han Invention Compass' },
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
  // Egypt
  'desert-entry':     'desert',
  'ruined-temple':    'temple',
  catacombs:          'catacombs',
  'escape-sequence':  'escape',
  'dig-site-entrance': 'baseCamp',
  // China — Section One frontier route
  'yellow-river-frontier': 'bamboo-forest',
  'rammed-earth-wall': 'rammed-earth-gate',
  'frontier-settlement': 'rammed-earth-gate',
  'hidden-archive': 'terracotta-tomb',
  'imperial-gate': 'terracotta-tomb',
  // Legacy China section ids (kept for compatibility)
  'bamboo-forest': 'bamboo-forest',
  'rammed-earth-gate': 'rammed-earth-gate',
  'terracotta-tomb': 'terracotta-tomb',
  // Rome
  'via-sacra':            'romanRoad',
  'forum-ruins':          'romanForum',
  'subterranean-thermae': 'romanThermae',
  'basilica-interior':    'romanBasilica',
  'sealed-vault':         'romanVaultBoss',
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
    'desert-entry': 'Turn back — the Lost Map Tablet is behind you in the desert. Read it to open this seal.',
    'ruined-temple': 'One switch is still behind you in the Ruined Temple.',
    catacombs: 'Search the catacomb floor for the remaining glyph fragment.',
    'escape-sequence': 'Reach the escape marker before the route seal will open.',
    'dig-site-entrance': 'The final guardian seal opens after the Ancient Construct falls.',
  },
  shards: 'Follow the visible necropolis path for the next relic shard; the old ravine bridge route is retired for this rebuild.',
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

const SCARAB_POISONED_CHARGE_SPEED_MULTIPLIER = 1.28;
const SCARAB_POISONED_CHARGE_START_BONUS = 110;

const ENEMY_HIT_SFX_BY_TYPE = {
  scarab: 'scarabHit',
  scorpion: 'scorpionHit',
  snake: 'snakeHit',
  'sand-wisp': 'sandWispHit',
  bat: 'batHit',
  mummy: 'mummyHit',
  guardian: 'guardianHit',
  statue: 'statueHit',
};

const getEnemyHitSfxKey = (enemy) => ENEMY_HIT_SFX_BY_TYPE[enemy?.type] || 'enemyHit';

const AMBIENT_DRAMA_SFX_BY_SECTION = {
  'desert-entry': ['distantRockfall', 'distantMonsterCall', 'voidBassSwell'],
  'ruined-temple': ['templeStoneGroan', 'distantRuinCollapse', 'underworldHeartDrone', 'distantMonsterCall'],
  catacombs: ['distantMonsterCall', 'underworldHeartDrone', 'voidBassSwell'],
  'escape-sequence': ['structureRipping', 'majorCaveIn', 'realityTearRumble', 'distantRuinCollapse'],
  'dig-site-entrance': ['distantMonsterCall', 'voidBassSwell', 'realityTearRumble'],
};

const getAmbientDramaSfxKey = (current, sectionId) => {
  const cues = AMBIENT_DRAMA_SFX_BY_SECTION[sectionId] || AMBIENT_DRAMA_SFX_BY_SECTION['desert-entry'];
  if (!cues?.length) return null;
  const pressure = current?.resources?.stamina <= 30 || sectionId === 'escape-sequence' || current?.bossDomain
    ? 1
    : 0;
  const index = Math.floor(Math.random() * cues.length + pressure) % cues.length;
  return cues[index];
};

const SAND_TRAP_HAZARD_IDS = new Set([
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

const getHazardSfxKey = (hazard) => {
  if (hazard?.pushToStart) return 'trapReset';
  if (SAND_TRAP_HAZARD_IDS.has(hazard?.id)) return 'trapSandTrigger';
  return 'trapStoneTrigger';
};

const HAZARD_GROUNDING = {
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

const HAZARD_VISUAL_ALIASES = {
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

const getHazardVisualId = (hazard) => HAZARD_VISUAL_ALIASES[hazard.type] || HAZARD_VISUAL_ALIASES[hazard.id] || hazard.id;

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

const getHazardBurialAmount = (hazard = {}) => {
  if (Number.isFinite(hazard.burial)) return clamp(hazard.burial, 0, 0.85);
  return 0;
};

const PROP_GROUNDING_CONFIG = {
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

const shouldGroundLockAtmosphereProp = (prop, propDepth) => (
  prop?.type === 'atmosphere-prop'
  && (propDepth === 'route-edge' || isGroundLockedAtmosphereProp(prop))
);

const PROP_PLACEMENT_PRESETS = {
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

const getStoryPropPlacementPreset = (prop) => (
  prop?.placementPreset ? PROP_PLACEMENT_PRESETS[prop.placementPreset] || null : null
);

const getStoryPropExplicitGroundY = (propSize = {}) => {
  if (Number.isFinite(propSize.groundPlaneY)) return propSize.groundPlaneY;
  if (Number.isFinite(propSize.groundPlaneOffset)) return GROUND_Y + propSize.groundPlaneOffset;
  return null;
};

const getStoryPropAnchorY = (prop, propSize, shouldGroundLock) => {
  const yOffset = Number.isFinite(propSize.yOffset) ? propSize.yOffset : 0;
  const rawAnchorY = prop.y + yOffset;
  const explicitGroundY = getStoryPropExplicitGroundY(propSize);
  if (Number.isFinite(explicitGroundY)) return explicitGroundY + yOffset;
  return shouldGroundLock
    ? Math.max(rawAnchorY, GROUND_Y - ATMOSPHERE_GROUND_LOCK_MARGIN)
    : rawAnchorY;
};

const getStoryPropDepth = (prop) => {
  if (['background', 'midground', 'grounded', 'route-edge', 'foreground-occluder'].includes(prop.depth)) return prop.depth;
  const placementPreset = getStoryPropPlacementPreset(prop);
  if (placementPreset?.depth) return placementPreset.depth;
  if (isGroundLockedAtmosphereProp(prop)) return 'grounded';
  return STORY_PROP_GROUNDING_OVERRIDES[prop.id]?.depth
    || (PROP_GROUNDING_CONFIG[prop.type] || {}).depth
    || 'midground';
};

const GENERATED_STORY_PROP_BOUNDS = {
  'generated-opening-pyramid-facade': { width: 1208, height: 664 },
  'generated-mummification-chamber-entrance': { width: 1500, height: 760 },
  'generated-climb-structure': { width: 1420, height: 690 },
  'generated-scribe-chamber-doorway': { width: 1120, height: 620 },
};
const GENERATED_STORY_PROP_PREVIEW_SOURCES = {
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
const GENERATED_STORY_PROP_TYPES = new Set(Object.keys(GENERATED_STORY_PROP_BOUNDS));
const isGeneratedStoryStructureProp = (prop = {}) => GENERATED_STORY_PROP_TYPES.has(prop.type);

const STORY_PROP_DEPTH_ORDER = {
  background: 0,
  midground: 1,
  grounded: 2,
  'route-edge': 3,
  'foreground-occluder': 4,
};
const PROP_EDITOR_DEPTH_OPTIONS = ['background', 'midground', 'grounded', 'route-edge', 'foreground-occluder'];
// Named render layers a prop can be tagged with. Depth (above) drives stacking order;
// layer is the broader band the prop belongs to. Free-form in the data, but these are
// the values in active use — the editor appends any custom value so none is ever lost.
const PROP_EDITOR_LAYER_OPTIONS = ['default', 'background', 'foreground', 'overlay', 'route-edge'];

// Turn a picked hex colour into HSL so the tint picker can build a colorize filter.
const journeyHexToHsl = (hex) => {
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
const buildJourneyTintGradeFilter = (hex, strength) => {
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
// props draw their own colours and ignore it). Done in an offscreen buffer so the
// multiply is clipped to the sprite's silhouette and never bleeds onto the scene.
let journeyPaintTintBuffer = null;
const getJourneyPaintTintBuffer = (width, height) => {
  if (typeof document === 'undefined') return null;
  if (!journeyPaintTintBuffer) {
    journeyPaintTintBuffer = document.createElement('canvas');
  }
  const buf = journeyPaintTintBuffer;
  if (buf.width < width || buf.height < height) {
    buf.width = Math.max(buf.width, width);
    buf.height = Math.max(buf.height, height);
  }
  const ctx = buf.getContext('2d');
  if (!ctx) return null;
  return { canvas: buf, ctx };
};

// Filter the prop palette by a free-text query, matching label, key, asset key, or
// group/category name (so e.g. "tomb" finds everything under Tomb Architecture).
const filterJourneyPaletteBySearch = (items = [], query = '') => {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    const assetKey = item.preview?.assetKey || item.atmosphereAssetKey || item.type || '';
    return `${item.label || ''} ${item.key || ''} ${item.category || ''} ${assetKey}`.toLowerCase().includes(q);
  });
};

const getStoryPropEditorSize = (prop = {}) => {
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

const getGeneratedStoryPropRenderProp = (prop = {}) => {
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

const getStoryPropEditorBounds = (prop, cameraX, current) => {
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

const getScaledDetailContactLayer = (prop = {}, detailSize = {}) => {
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
const hitTestPropTransformHandle = (px, py, bounds) => {
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

const finiteNumber = (value, fallback) => (Number.isFinite(value) ? value : fallback);

const resolvePropGroundingSettings = (config = {}) => {
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

const DECORATIVE_PROP_LAYER_MODE = 'background-midground-grounded-depth-v3';
const PROP_DEPTH_TUNING_VERSION = 'journey-grounded-placement-presets-2026-05-26';
const PROP_GROUNDING_INTEGRATION_VERSION = 'prop-contact-shadow-local-sediment-occlusion-v4';
const ROUTE_GROUND_VISUAL_MODE = 'desert-entry-painted-background-route-v1';
const ROUTE_GROUND_HAZE_FIX_VERSION = 'necropolis-route-ground-world-locked-2026-06-25';
const DESERT_ENTRY_VISUAL_GROUND_PLANE_OFFSET_Y = -42;
const DESERT_ENTRY_VISUAL_GROUND_FOOT_TOLERANCE = 26;
const FOREGROUND_DEPTH_LAYER_MODE = 'edge-framed-visual-only-no-collision';
const ENABLE_FOREGROUND_DEPTH_LAYER = false;
const DRAW_JOURNEY_FLAG_MARKERS = false;
const JOURNEY_FLAG_VISUAL_MODE = 'flags-removed-stone-cairns-v1';
const WORLD_CONTINUITY_VERSION = 'connected-expedition-world-2026-05-16';
const REACTIVE_ENVIRONMENT_VERSION = 'reactive-expedition-world-2026-05-16';
const DYNAMIC_WORLD_VERSION = 'dynamic-expedition-world-storytelling-2026-05-16';
const DISCOVERY_ENTRANCE_REVEAL_SECONDS = 2.2;



const SECTION_PARALLAX_LAYERS = {
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
    { key: 'foregroundDust', y: 0, height: CANVAS_HEIGHT, parallax: 0.48, alpha: 0.82 },
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

const isJourneyFloorPlatform = (platform = {}) => {
  const platformKey = `${platform.id || ''} ${platform.label || ''}`.toLowerCase();
  return platformKey.includes('floor')
    || platformKey.includes('track')
    || platformKey.includes('path')
    || platformKey.includes('road')
    || platformKey.includes('rise');
};

const isJourneyBlockerPlatform = (platform = {}) => platform.collision === 'blocker';

const getJourneyBlockerLineX = (blocker, player) => {
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

const resolveJourneyBlockerPlatformCollision = (player, previousPlayer, blocker) => {
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

const isJourneyEditorFormTarget = (target) => {
  const tagName = target?.tagName;
  return tagName === 'INPUT'
    || tagName === 'TEXTAREA'
    || tagName === 'SELECT'
    || target?.isContentEditable;
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
  onComplete,
  onSnapshotChange,
  audioControls,
  paused = false,
  targetCivilisation = 'Ancient Egypt',
  environmentPackId = ENVIRONMENT_ASSET_PACK_IDS.EGYPT_DESERT_TEMPLE,
  backgroundPackId = null,
  permanentUpgradeIds = [],
  permanentUpgradeEffects = {},
  openingStartMode = 'standard',
}) {
  const [selectedCharacterPresetId, setSelectedCharacterPresetId] = useState(() => {
    if (typeof window === 'undefined') return 'auto';
    const saved = window.localStorage.getItem(CHARACTER_LOADER_STORAGE_KEY);
    return PLAYER_CHARACTER_PRESETS.some(preset => preset.id === saved) ? saved : 'auto';
  });

  setExpeditionJourneyCiv(targetCivilisation);

  const [characterLoaderVisible, setCharacterLoaderVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(CHARACTER_LOADER_VISIBILITY_STORAGE_KEY) === 'true';
  });
  const playerHeroSpriteConfig = useMemo(() => getPlayerHeroSpriteConfig({
    targetCivilisation,
    backgroundPackId,
    characterPresetId: selectedCharacterPresetId,
  }), [backgroundPackId, selectedCharacterPresetId, targetCivilisation]);
  const propEditorPalette = useMemo(() => createJourneyPropPalette(STORY_PROPS, lostSitePropRegistry), []);
  const groundDetailsEditorPalette = useMemo(() => createJourneyGroundDetailsPalette(), []);
  const foregroundDetailsEditorPalette = useMemo(() => createJourneyForegroundDetailsPalette(), []);
  const shardPropsEditorPalette = useMemo(() => createJourneyShardPropsPalette(), []);
  const trapEditorPalette = useMemo(() => createJourneyTrapPalette(), []);
  const platformEditorPalette = useMemo(() => createJourneyPlatformPalette(), []);
  const selectedCharacterPreset = getPlayerCharacterPreset(selectedCharacterPresetId);
  const [gameState, setGameState] = useState(() => {
    const initial = makeInitialState({
      targetCivilisation,
      permanentUpgradeIds,
      permanentUpgradeEffects,
    });
    if (openingStartMode === 'arrival-threshold') {
      const openingCheckpoint = CHECKPOINTS.find(checkpoint => checkpoint.id === 'desert-entry');
      const openingSection = SECTIONS.find(section => section.id === 'desert-entry');
      initial.player.x = ARRIVAL_THRESHOLD_SPAWN_X;
      initial.player.y = getArrivalThresholdGroundY(ARRIVAL_THRESHOLD_SPAWN_X + initial.player.width / 2) - initial.player.height;
      initial.player.vx = 0;
      initial.player.vy = 0;
      initial.player.direction = -1;
      initial.player.onGround = true;
      initial.activeCheckpoint = openingCheckpoint || initial.activeCheckpoint;
      initial.cameraX = 0;
      initial.targetCameraX = 0;
      initial.cameraMode = 'arrival-threshold';
      initial.cameraFocusTarget = Math.round(ARRIVAL_THRESHOLD_SPAWN_X + initial.player.width / 2);
      initial.openingThresholdScene = null;
      initial.openingSphinxEncounter = null;
      initial.openingSphinxTimer = 0;
      initial.currentSectionId = 'arrival-threshold';
      initial.arrivalThresholdActive = true;
      initial.arrivalThresholdStarted = true;
      initial.arrivalThresholdLeftInspected = false;
      initial.arrivalThresholdMarkingsInspected = false;
      initial.arrivalThresholdGateTriggered = false;
      initial.arrivalThresholdTrial = null;
      initial.arrivalThresholdWakeProgress = 0;
      initial.arrivalThresholdNoticeTimer = 2.4;
      initial.dynamicEnvironmentEvent = null;
      initial.dynamicEnvironmentEventTimer = 0;
      initial.collapsedPlatformIds.delete('opening-scarab-seal-summit');
      initial.sectionTransition = null;
      initial.sectionTransitionTimer = 0;
      initial.cinematicEvent = {
        id: 'arrival-threshold-spawn',
        name: 'Asha',
        message: ARRIVAL_THRESHOLD_SPAWN_LINE,
        temporary: true,
      };
      initial.cinematicTimer = 2.8;
      initial.notice = ARRIVAL_THRESHOLD_SPAWN_LINE;
      initial.itemPurposeNoticeTimer = Math.max(initial.itemPurposeNoticeTimer || 0, 2.4);
      initial.cameraShakeTimer = Math.max(initial.cameraShakeTimer, 0.18);
      initial.cameraShakeStrength = Math.max(initial.cameraShakeStrength, 0.08);
      initial.lastSectionId = openingSection?.id || 'desert-entry';
    }
    return initial;
  });
  const [briefingOpen, setBriefingOpen] = useState(() => openingStartMode !== 'arrival-threshold');
  // Controls & combat reference now lives in the single Esc/"?" pause menu
  // (owned by ExpeditionMode), so there is no separate in-journey help state.
  const [guardianChallengeUi, setGuardianChallengeUi] = useState(null);
  const propPlacementEditorRef = useRef({
    enabled: false,
    selectedPropId: null,
    selectedPlatformId: null,
    selectedHazardId: null,
    selectedArchId: null,
    selectedCheckpointId: null,
    selectedLairId: null,
    selectedNestId: null,
    dragging: null,
    hover: null,
    stackPicker: null,
    outlinerSearch: '',
    gridSnap: false,
    gridSize: DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE,
    paletteOpen: false,
    selectedPaletteKey: null,
    selectedPaletteCategory: 'prop',
    recentPaletteKeys: [],
    stampMode: false,
    showTrapTriggers: true,
    showHoverLabels: true,
    previewMode: false,
    panelCollapsed: false,
    floorPickMode: false,
    createdProps: [],
    createdPlatforms: [],
    createdHazards: [],
    edits: {},
    platformEdits: {},
    hazardEdits: {},
    routeGateEdits: {},
    routeGateDoorwayEdits: {},
    checkpointEdits: {},
    miniBossEdits: {},
    scorpionNestEdits: {},
    lockedItems: new Set(),
    hiddenIds: new Set(),
    defaultLocksApplied: false,
    deletedIds: new Set(),
    deletedPlatformIds: new Set(),
    deletedHazardIds: new Set(),
    exportText: '',
    aiInstructions: '',
    exportVisible: false,
    savedAt: null,
    writeStatus: null,
  });
  const propEditorPersistTimeoutRef = useRef(null);
  const editorUndoStackRef = useRef([]);
  const editorRedoStackRef = useRef([]);
  const editorHistoryBaselineRef = useRef(null);
  const editorHistoryTimeoutRef = useRef(null);
  const editorPanelRef = useRef(null);
  const editorPanelPosRef = useRef(null);
  const editorPanelDragRef = useRef(null);
  const [propEditorUi, setPropEditorUi] = useState({
    enabled: false,
    selectedProp: null,
    selectedPlatform: null,
    selectedHazard: null,
    selectedArch: null,
    selectedCheckpoint: null,
    selectedLair: null,
    selectedNest: null,
    gridSnap: false,
    gridSize: DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE,
    paletteOpen: false,
    selectedPaletteKey: null,
    selectedPaletteCategory: 'prop',
    stampMode: false,
    showTrapTriggers: true,
    showHoverLabels: true,
    previewMode: false,
    panelCollapsed: false,
    floorPickMode: false,
    palette: [],
    selectedLockKey: null,
    selectedLocked: false,
    lockedCount: 0,
    unsavedChangeSummary: createJourneyPlacementChangeSummary(),
    exportText: '',
    aiInstructions: '',
    exportVisible: false,
    savedAt: null,
  });
  const [outlinerOpen, setOutlinerOpen] = useState(false);
  const [collapsedPanelSections, setCollapsedPanelSections] = useState(() => {
    let stored;
    try {
      stored = JSON.parse(window.localStorage.getItem(JOURNEY_PROP_EDITOR_SECTIONS_KEY)) || {};
    } catch {
      stored = {};
    }
    // The shortcuts legend is reference-only, so default it collapsed to keep the panel tidy.
    if (stored.shortcuts === undefined) stored.shortcuts = true;
    return stored;
  });
  const toggleEditorPanelSection = useCallback((key) => {
    setCollapsedPanelSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        window.localStorage.setItem(JOURNEY_PROP_EDITOR_SECTIONS_KEY, JSON.stringify(next));
      } catch {
        /* ignore persistence errors */
      }
      return next;
    });
  }, []);
  const renderEditorSectionHeader = (key, label) => {
    const isCollapsed = Boolean(collapsedPanelSections[key]);
    return (
      <button
        type="button"
        className={`journey-prop-editor-group-header${isCollapsed ? ' is-collapsed' : ''}`}
        aria-expanded={!isCollapsed}
        title={isCollapsed ? `Show ${label} controls` : `Hide ${label} controls`}
        onClick={() => toggleEditorPanelSection(key)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 8,
          width: '100%',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          color: 'inherit',
          font: 'inherit',
          textAlign: 'left',
          padding: 0,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '1.05em',
            color: '#facc15',
            fontSize: '0.92em',
            transform: isCollapsed ? 'none' : 'rotate(90deg)',
            transition: 'transform 120ms ease',
          }}
        >
          ▶
        </span>
        <span style={{ flex: 1 }}>{label}</span>
        <span aria-hidden="true" style={{ opacity: 0.75, fontSize: '0.62em', letterSpacing: '0.04em' }}>
          {isCollapsed ? 'SHOW' : 'HIDE'}
        </span>
      </button>
    );
  };
  const canvasRef = useRef(null);
  const stateRef = useRef(gameState);
  const keysRef = useRef({});
  const openingStartModeConsumedRef = useRef(false);
  const spokenOpeningLineRef = useRef(null);
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
  const mummificationInteractionAssetsRef = useRef(createEnvironmentAssetState(ENVIRONMENT_ASSET_PACK_IDS.MUMMIFICATION_CHAMBER_INTERACTIONS));
  const atmosphereEnvironmentAssetsRef = useRef(createEnvironmentAssetState(ENVIRONMENT_ASSET_PACK_IDS.EGYPT_ATMOSPHERE));
  const foregroundDepthEnvironmentAssetsRef = useRef(createEnvironmentAssetState(ENVIRONMENT_ASSET_PACK_IDS.EGYPT_FOREGROUND_DEPTH));
  const premiumGroundContactAssetsRef = useRef(createEnvironmentAssetState(ENVIRONMENT_ASSET_PACK_IDS.EGYPT_PREMIUM_GROUND_CONTACT));
  const desertBackgroundAssetsRef = useRef(createDesertBackgroundAssetState());
  const enemySpriteAssetsRef = useRef(createEnemySpriteState());
  const bossSpriteAssetsRef = useRef(createBossSpriteState());
  const collectibleSpriteAssetsRef = useRef(createCollectibleSpriteState());
  const playerWeaponSpriteRef = useRef(createPlayerWeaponSpriteState());
  const playerComboSlashEffectRef = useRef({ image: null, loaded: false, failed: false, version: PLAYER_COMBO_SLASH_EFFECT_VERSION });
  const playerFinisherSlashEffectRef = useRef({ image: null, loaded: false, failed: false, version: PLAYER_FINISHER_SLASH_EFFECT_VERSION });
  const dynamicWorldAssetsRef = useRef(createDynamicWorldAssetState());
  const markerSpriteAssetsRef = useRef(createMarkerSpriteState());
  const openingScarabSealImageRef = useRef({ image: null, loaded: false, failed: false });
  const scarabQueenLairOpeningImageRef = useRef({ image: null, loaded: false, failed: false });
  const scorpionNestRef = useRef({ image: null, loaded: false, failed: false, version: SCORPION_NEST_VERSION });
  const scorpionVenomSpitEffectRef = useRef({ image: null, loaded: false, failed: false, version: SCORPION_VENOM_SPIT_EFFECT_VERSION });
  const openingSphinxApparitionRef = useRef({ image: null, loaded: false, failed: false });
  const arrivalThresholdBackgroundRef = useRef({ image: null, loaded: false, failed: false, version: ARRIVAL_THRESHOLD_ASSET_VERSION });
  const arrivalThresholdDuatEchoRef = useRef({ image: null, loaded: false, failed: false, version: ARRIVAL_THRESHOLD_ASSET_VERSION });
  const arrivalThresholdDoorwayGlowRef = useRef({ image: null, loaded: false, failed: false, version: ARRIVAL_THRESHOLD_ASSET_VERSION });
  const arrivalThresholdDoorwayOccluderRef = useRef({ image: null, loaded: false, failed: false, version: ARRIVAL_THRESHOLD_ASSET_VERSION });
  const arrivalThresholdSealVeilRef = useRef({ image: null, loaded: false, failed: false, version: ARRIVAL_THRESHOLD_ASSET_VERSION });
  const arrivalThresholdAwakenedRef = useRef({ image: null, loaded: false, failed: false, version: ARRIVAL_THRESHOLD_ASSET_VERSION });
  const arrivalThresholdGlowCanvasRef = useRef(null);
  const lostBridgeAssetsRef = useRef({ images: {}, structure: null, floorBlend: null, floorBlends: {} });
  const openingPyramidClimbPackRef = useRef({ image: null, loaded: false, failed: false });
  const openingPyramidFacadeRef = useRef({ image: null, loaded: false, failed: false });
  // Generic lazy loader/cache for standalone image props (keyed by assetPath).
  // Any story prop carrying { imageAssetKey, assetPath } renders through this without
  // needing a dedicated ref + loader effect. The RAF render loop picks up the image
  // on the first frame after it decodes.
  // (Plain object cache keyed by assetPath — `Map` is shadowed in this module scope.)
  const standaloneImagePropCacheRef = useRef({});
  const routeGateFrontRef = useRef({ image: null, loaded: false, failed: false, version: ROUTE_GATE_ASSET_VERSION });
  const routeGateBackRef = useRef({ image: null, loaded: false, failed: false, version: ROUTE_GATE_ASSET_VERSION });
  const routeGateSlabRef = useRef({ image: null, loaded: false, failed: false, version: ROUTE_GATE_ASSET_VERSION });
  const openingTombStairwellRef = useRef({ image: null, loaded: false, failed: false, version: OPENING_TOMB_STAIRWELL_VERSION });
  const mummificationChamberExteriorRef = useRef({ image: null, loaded: false, failed: false, version: MUMMIFICATION_CHAMBER_EXTERIOR_VERSION });
  const mummificationChamberInteriorRef = useRef({ image: null, loaded: false, failed: false, version: MUMMIFICATION_CHAMBER_INTERIOR_VERSION });
  const forgottenMuralAlcoveStructureRef = useRef({ image: null, loaded: false, failed: false, version: FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_VERSION });
  const forgottenMuralChamberRef = useRef({ image: null, loaded: false, failed: false, version: FORGOTTEN_MURAL_CHAMBER_VERSION });
  const forgottenMuralHiddenRevealRef = useRef({ image: null, loaded: false, failed: false, version: FORGOTTEN_MURAL_HIDDEN_MEMORY_REVEAL_VERSION });
  const scribeChamberExteriorRef = useRef({ image: null, loaded: false, failed: false, version: SCRIBE_CHAMBER_EXTERIOR_VERSION });
  const scribeChamberInteriorRef = useRef({ image: null, loaded: false, failed: false, version: SCRIBE_CHAMBER_INTERIOR_VERSION });
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

  const getStandaloneImagePropAsset = useCallback((propForAsset = {}) => {
    if (propForAsset.imageAssetKey === 'routeGateFront') return routeGateFrontRef.current;
    if (propForAsset.imageAssetKey === 'routeGateBack') return routeGateBackRef.current;
    if (propForAsset.imageAssetKey === 'routeGateSlab') return routeGateSlabRef.current;
    if (propForAsset.imageAssetKey === 'openingPyramidClimbPack') return openingPyramidClimbPackRef.current;
    if (propForAsset.imageAssetKey && propForAsset.assetPath) {
      const cache = standaloneImagePropCacheRef.current;
      let entry = cache[propForAsset.assetPath];
      if (!entry) {
        const image = new Image();
        entry = { image, loaded: false, failed: false };
        image.onload = () => { entry.loaded = true; };
        image.onerror = () => { entry.failed = true; };
        image.src = `${import.meta.env.BASE_URL}${propForAsset.assetPath}`;
        cache[propForAsset.assetPath] = entry;
      }
      return entry;
    }
    return null;
  }, []);

  const toggleEnemyPlaytestAssist = useCallback(() => {
    const current = stateRef.current;
    const nextEnemiesDisabled = !current.enemiesDisabled;
    current.enemiesDisabled = nextEnemiesDisabled;
    current.attackHitIds?.clear?.();
    if (nextEnemiesDisabled) {
      current.enemyCooldown = 0;
      current.bossIntro = null;
      current.bossIntroTimer = 0;
      current.bossIntroPauseTimer = 0;
      current.bossDomain = null;
      current.cameraMode = 'follow';
      current.cameraFocusTarget = null;
      current.pendingGuardianChallenge = null;
      current.enemies?.forEach(enemy => {
        enemy.attackWindup = 0;
        enemy.attackTimer = 0;
        enemy.attackReady = false;
        enemy.attackRecovery = 0;
        enemy.vulnerabilityTimer = 0;
        enemy.shieldTimer = 0;
        enemy.knockbackTimer = 0;
        enemy.aggroMemoryTimer = 0;
        enemy.spawnTimer = enemy.spawnInitialDelay ?? enemy.spawnTimer ?? 0.9;
      });
      current.miniBosses?.forEach(boss => {
        boss.attackWindup = 0;
        boss.attackTimer = 0;
        boss.attackReady = false;
        boss.attackRecovery = 0;
        boss.vulnerabilityTimer = 0;
        boss.shieldTimer = 0;
        boss.knockbackTimer = 0;
        boss.aggroMemoryTimer = 0;
      });
      current.notice = 'Enemies disabled for play-testing.';
    } else {
      current.notice = 'Enemies enabled.';
    }
    current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.4);
    syncHud();
  }, [syncHud]);

  const getActivePropEditorRoomId = useCallback((current = stateRef.current) => {
    const sceneId = getJourneySceneId(current);
    if (sceneId !== JOURNEY_SCENE_IDS.EXTERIOR) return sceneId;
    return current.currentSectionId || getSectionForX(current.player.x + current.player.width / 2).id;
  }, []);

  const getPlatformEditorRoomId = useCallback((platform = {}, current = stateRef.current) => {
    if (platform.sceneId) return platform.sceneId;
    if (platform.sectionId) return platform.sectionId;
    const sceneId = getJourneySceneId(current);
    if (sceneId !== JOURNEY_SCENE_IDS.EXTERIOR) return sceneId;
    return getSectionForX((Number(platform.x) || 0) + (Number(platform.width) || 0) / 2)?.id
      || current.currentSectionId
      || sceneId;
  }, []);

  const getHazardEditorRoomId = useCallback((hazard = {}, current = stateRef.current) => {
    if (hazard.sceneId) return hazard.sceneId;
    if (hazard.sectionId) return hazard.sectionId;
    const sceneId = getJourneySceneId(current);
    if (sceneId !== JOURNEY_SCENE_IDS.EXTERIOR) return sceneId;
    return getSectionForX((Number(hazard.x) || 0) + (Number(hazard.width) || 0) / 2)?.id
      || current.currentSectionId
      || sceneId;
  }, []);

  const getAllPropEditorStoryProps = useCallback(() => {
    const sourceIds = new Set(STORY_PROPS.map(prop => prop?.id).filter(Boolean));
    return [
      ...STORY_PROPS,
      ...propPlacementEditorRef.current.createdProps.filter(prop => (
        prop?.id
        && !sourceIds.has(prop.id)
        && !isObsoleteLostBridgeRavineFloorEditorProp(prop)
        && !isRetiredDesertEntryBackgroundProp(prop)
      )),
    ];
  }, []);

  const getPropEditorBasePropById = useCallback((propId) => (
    STORY_PROPS.find(prop => prop.id === propId)
    || propPlacementEditorRef.current.createdProps.find(prop => prop.id === propId)
    || null
  ), []);

  const getEditedStoryProp = useCallback((prop) => {
    if (!prop?.id) return prop;
    const editor = propPlacementEditorRef.current;
    if (editor.deletedIds.has(prop.id)) return null;
    if (isRetiredDesertEntryBackgroundProp(prop)) return null;
    const editedProp = applyJourneyPropPlacementEdit(prop, editor.edits[prop.id] || {});
    return editedProp;
  }, []);

  const getRenderableStoryProps = useCallback((current = stateRef.current) => (
    getAllPropEditorStoryProps()
      .map(prop => getEditedStoryProp(prop))
      .filter(prop => prop && isEntityActiveInScene(prop, current) && isStoryPropRouteGateVisibilityMet(prop, current))
  ), [getAllPropEditorStoryProps, getEditedStoryProp]);

  const getLostBridgeRavineFloorPlacement = useCallback((current = stateRef.current) => {
    const editor = propPlacementEditorRef.current;
    const ravineProps = getRenderableStoryProps(current)
      .filter(prop => (
        isLostBridgeRavineSpecialRendererProp(prop)
        && !editor.hiddenIds.has(prop.id)
        && (!Number.isFinite(prop.alpha) || prop.alpha > 0)
      ));
    if (ravineProps.length === 0) return null;
    const selectedId = propPlacementEditorRef.current?.selectedPropId;
    const prop = ravineProps.find(item => item.id === selectedId) || ravineProps[ravineProps.length - 1];
    if (!prop) return null;
    const propDepth = getStoryPropDepth(prop);
    const propSize = getStoryPropEditorSize(prop);
    const shouldGroundLock = shouldGroundLockAtmosphereProp(prop, propDepth);
    const propGrounding = resolvePropGroundingSettings({ ...propSize, x: prop.x });
    const anchorY = getStoryPropAnchorY(prop, propSize, shouldGroundLock);
    return {
      prop,
      drawWorldLeft: prop.x - propSize.width / 2,
      drawY: anchorY - propSize.height * propGrounding.contactRatio,
      width: propSize.width,
      height: propSize.height,
    };
  }, [getRenderableStoryProps]);

  // Draw order within each depth pass: lower zIndex first (behind), higher last
  // (on top). Original array order is the stable tie-breaker for equal zIndex.
  const getZIndexSortedRenderableStoryProps = useCallback((current = stateRef.current) => (
    getRenderableStoryProps(current)
      .map((prop, index) => ({ prop, index }))
      .sort((a, b) => {
        const zDelta = (Number(a.prop.zIndex) || 0) - (Number(b.prop.zIndex) || 0);
        return zDelta !== 0 ? zDelta : a.index - b.index;
      })
      .map(entry => entry.prop)
  ), [getRenderableStoryProps]);

  const getAllPropEditorPlatforms = useCallback(() => ([
    ...PLATFORMS,
    ...propPlacementEditorRef.current.createdPlatforms,
  ]), []);

  const getPlatformEditorBasePlatformById = useCallback((platformId) => (
    propPlacementEditorRef.current.createdPlatforms.find(platform => (platform.id || platform.label) === platformId)
    || PLATFORMS.find(platform => (platform.id || platform.label) === platformId)
    || null
  ), []);

  const getEditedPlatform = useCallback((platform) => {
    if (!platform) return platform;
    const platformId = platform.id || platform.label;
    if (!platformId) return platform;
    const editor = propPlacementEditorRef.current;
    if (editor.deletedPlatformIds.has(platformId)) return null;
    return applyJourneyPlatformPlacementEdit(platform, editor.platformEdits[platformId] || {});
  }, []);

  const getRenderablePlatforms = useCallback((current = stateRef.current) => (
    getAllPropEditorPlatforms()
      .map(platform => getEditedPlatform(platform))
      .filter(platform => platform && isPlatformAvailable(platform, current))
  ), [getAllPropEditorPlatforms, getEditedPlatform]);

  const getAllPropEditorHazards = useCallback(() => ([
    ...HAZARDS,
    ...propPlacementEditorRef.current.createdHazards,
  ]), []);

  const getHazardEditorBaseHazardById = useCallback((hazardId) => (
    getAllPropEditorHazards().find(hazard => hazard.id === hazardId) || null
  ), [getAllPropEditorHazards]);

  const getEditedHazard = useCallback((hazard) => {
    if (!hazard?.id) return hazard;
    const editor = propPlacementEditorRef.current;
    if (editor.deletedHazardIds.has(hazard.id)) return null;
    return applyJourneyHazardPlacementEdit(hazard, editor.hazardEdits[hazard.id] || {});
  }, []);

  const getRenderableHazards = useCallback((current = stateRef.current) => (
    getAllPropEditorHazards()
      .map(hazard => getEditedHazard(hazard))
      .filter(hazard => hazard && isHazardAvailable(hazard, current))
  ), [getAllPropEditorHazards, getEditedHazard]);

  const getRenderableTrapPlatforms = useCallback((current = stateRef.current) => (
    getRenderableHazards(current)
      .filter((hazard) => {
        if (!isReusableJourneyTrap(hazard) || hazard.type !== 'collapsing-stone-floor') return false;
        const runtime = current.trapStates?.[hazard.id];
        return runtime?.phase !== 'collapsed';
      })
      .map(hazard => ({
        id: `${hazard.id}:trap-platform`,
        trapId: hazard.id,
        x: hazard.x,
        y: hazard.y,
        width: hazard.width,
        height: Math.max(8, hazard.height),
        label: hazard.name || hazard.id,
      }))
  ), [getRenderableHazards]);

  const getRouteGateEditorBaseGateById = useCallback((gateId) => (
    ROUTE_GATES.find(gate => gate.id === gateId) || null
  ), []);

  const getRouteGateEditorBaseDoorwayById = useCallback((doorwayId) => (
    ROUTE_GATE_DOORWAYS.find(doorway => doorway.id === doorwayId) || null
  ), []);

  const getCheckpointEditorBaseCheckpointById = useCallback((checkpointId) => (
    CHECKPOINTS.find(checkpoint => checkpoint.id === checkpointId) || null
  ), []);

  const getEditedRouteGate = useCallback((gate) => {
    if (!gate?.id) return gate;
    return applyJourneyRouteGatePlacementEdit(gate, propPlacementEditorRef.current.routeGateEdits[gate.id] || {});
  }, []);

  const getEditedRouteGateDoorway = useCallback((doorway) => {
    if (!doorway?.id) return doorway;
    return applyJourneyRouteGateDoorwayPlacementEdit(doorway, propPlacementEditorRef.current.routeGateDoorwayEdits[doorway.id] || {});
  }, []);

  const getEditedCheckpoint = useCallback((checkpoint) => {
    if (!checkpoint?.id) return checkpoint;
    return applyJourneyCheckpointPlacementEdit(checkpoint, propPlacementEditorRef.current.checkpointEdits[checkpoint.id] || {});
  }, []);

  const getRenderableRouteGates = useCallback(() => (
    ROUTE_GATES.map(gate => getEditedRouteGate(gate)).filter(Boolean)
  ), [getEditedRouteGate]);

  const getRenderableRouteGateDoorways = useCallback(() => (
    ROUTE_GATE_DOORWAYS.map(doorway => getEditedRouteGateDoorway(doorway)).filter(Boolean)
  ), [getEditedRouteGateDoorway]);

  const getRenderableCheckpoints = useCallback(() => (
    CHECKPOINTS.map(checkpoint => getEditedCheckpoint(checkpoint)).filter(Boolean)
  ), [getEditedCheckpoint]);

  const getMiniBossEditorBaseBossById = useCallback((bossId) => (
    getJourneyMiniBosses(targetCivilisation).find(boss => boss.id === bossId) || null
  ), [targetCivilisation]);

  const getEditedMiniBoss = useCallback((boss) => {
    if (!boss?.id) return boss;
    return applyJourneyMiniBossPlacementEdit(boss, propPlacementEditorRef.current.miniBossEdits[boss.id] || {});
  }, []);

  const getScarabQueenLairPlacement = useCallback((boss = {}) => {
    const baseWidth = Number.isFinite(boss.lairWidth) ? boss.lairWidth : 500;
    const width = Math.max(1, baseWidth);
    const height = Math.max(1, Number.isFinite(boss.lairHeight) ? boss.lairHeight : width * (330 / 980));
    const centerX = Number.isFinite(boss.lairX)
      ? boss.lairX
      : (Number(boss.x) || 0) + (Number(boss.width) || 0) / 2;
    const bottomY = Number.isFinite(boss.lairY) ? boss.lairY : GROUND_Y + 6;
    return {
      id: boss.id,
      x: centerX,
      y: bottomY,
      width,
      height,
      top: bottomY - height,
    };
  }, []);

  const getRenderableScarabLairs = useCallback(() => (
    getJourneyMiniBosses(targetCivilisation)
      .filter(boss => boss.id === SCARAB_SEAL_TRIGGER.bossId)
      .map(boss => getEditedMiniBoss(boss))
      .filter(Boolean)
  ), [getEditedMiniBoss, targetCivilisation]);

  const getPropEditorSelectedProp = useCallback((current = stateRef.current) => {
    const editor = propPlacementEditorRef.current;
    if (!editor.selectedPropId) return null;
    const baseProp = getPropEditorBasePropById(editor.selectedPropId);
    const prop = getEditedStoryProp(baseProp);
    if (!prop || !isEntityActiveInScene(prop, current)) return null;
    return prop;
  }, [getEditedStoryProp, getPropEditorBasePropById]);

  const getPropEditorSelectedPlatform = useCallback((current = stateRef.current) => {
    const editor = propPlacementEditorRef.current;
    if (!editor.selectedPlatformId) return null;
    const basePlatform = getPlatformEditorBasePlatformById(editor.selectedPlatformId);
    const platform = getEditedPlatform(basePlatform);
    if (!platform || !isPlatformAvailable(platform, current)) return null;
    return platform;
  }, [getEditedPlatform, getPlatformEditorBasePlatformById]);

  const getPropEditorSelectedHazard = useCallback((current = stateRef.current) => {
    const editor = propPlacementEditorRef.current;
    if (!editor.selectedHazardId) return null;
    const baseHazard = getHazardEditorBaseHazardById(editor.selectedHazardId);
    const hazard = getEditedHazard(baseHazard);
    if (!hazard || !isHazardAvailable(hazard, current)) return null;
    return hazard;
  }, [getEditedHazard, getHazardEditorBaseHazardById]);

  const getPropEditorSelectedArch = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    if (!editor.selectedArchId) return null;
    const [kind, id] = editor.selectedArchId.split(':');
    if (kind === 'doorway') {
      const doorway = getEditedRouteGateDoorway(getRouteGateEditorBaseDoorwayById(id));
      return doorway ? { ...doorway, editorKind: 'doorway', editorId: editor.selectedArchId } : null;
    }
    const gate = getEditedRouteGate(getRouteGateEditorBaseGateById(id));
    return gate ? { ...gate, editorKind: 'gate', editorId: editor.selectedArchId } : null;
  }, [getEditedRouteGate, getEditedRouteGateDoorway, getRouteGateEditorBaseDoorwayById, getRouteGateEditorBaseGateById]);

  const getPropEditorSelectedCheckpoint = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    if (!editor.selectedCheckpointId) return null;
    return getEditedCheckpoint(getCheckpointEditorBaseCheckpointById(editor.selectedCheckpointId));
  }, [getCheckpointEditorBaseCheckpointById, getEditedCheckpoint]);

  const getPropEditorSelectedLair = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    if (!editor.selectedLairId) return null;
    return getEditedMiniBoss(getMiniBossEditorBaseBossById(editor.selectedLairId));
  }, [getEditedMiniBoss, getMiniBossEditorBaseBossById]);

  const getSelectedEditorLockKey = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    if (editor.selectedPropId) return `prop:${editor.selectedPropId}`;
    if (editor.selectedPlatformId) return `platform:${editor.selectedPlatformId}`;
    if (editor.selectedHazardId) return `hazard:${editor.selectedHazardId}`;
    if (editor.selectedArchId) return `arch:${editor.selectedArchId}`;
    if (editor.selectedCheckpointId) return `checkpoint:${editor.selectedCheckpointId}`;
    if (editor.selectedLairId) return `lair:${editor.selectedLairId}`;
    return null;
  }, []);

  const isEditorLockKeyLocked = useCallback((lockKey) => (
    Boolean(lockKey && propPlacementEditorRef.current.lockedItems.has(lockKey))
  ), []);

  const isEditorEntityLocked = useCallback((kind, id) => (
    Boolean(kind && id && propPlacementEditorRef.current.lockedItems.has(`${kind}:${id}`))
  ), []);

  const applyDefaultEditorLocks = useCallback((current = stateRef.current) => {
    const editor = propPlacementEditorRef.current;
    if (editor.defaultLocksApplied) return;
    getRenderableStoryProps(current).forEach((prop) => {
      if (prop?.id) editor.lockedItems.add(`prop:${prop.id}`);
    });
    getRenderablePlatforms(current).forEach((platform) => {
      const id = platform?.id || platform?.label;
      if (id) editor.lockedItems.add(`platform:${id}`);
    });
    if (!current.arrivalThresholdActive) getRenderableHazards(current).forEach((hazard) => {
      if (hazard?.id) editor.lockedItems.add(`hazard:${hazard.id}`);
    });
    getRenderableRouteGateDoorways().forEach((doorway) => {
      if (doorway?.id) editor.lockedItems.add(`arch:doorway:${doorway.id}`);
    });
    getRenderableRouteGates().forEach((gate) => {
      if (gate?.id) editor.lockedItems.add(`arch:gate:${gate.id}`);
    });
    getRenderableCheckpoints().forEach((checkpoint) => {
      if (checkpoint?.id) editor.lockedItems.add(`checkpoint:${checkpoint.id}`);
    });
    getRenderableScarabLairs().forEach((lair) => {
      if (lair?.id) editor.lockedItems.add(`lair:${lair.id}`);
    });
    editor.defaultLocksApplied = true;
  }, [getRenderableCheckpoints, getRenderableHazards, getRenderablePlatforms, getRenderableRouteGateDoorways, getRenderableRouteGates, getRenderableScarabLairs, getRenderableStoryProps]);

  const getLairEditorBounds = useCallback((boss, cameraX) => {
    const placement = getScarabQueenLairPlacement(boss);
    return {
      x: worldToScreenX(placement.x, cameraX) - placement.width / 2,
      y: placement.top,
      width: placement.width,
      height: placement.height,
    };
  }, [getScarabQueenLairPlacement]);

  const findEditableScarabLairAt = useCallback((screenX, screenY) => {
    const cameraX = Number.isFinite(stateRef.current.cameraX) ? stateRef.current.cameraX : 0;
    return getRenderableScarabLairs()
      .map((boss, index) => ({ boss, index, bounds: getLairEditorBounds(boss, cameraX) }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => a.index - b.index)
      .at(-1)?.boss || null;
  }, [getLairEditorBounds, getRenderableScarabLairs]);

  // --- Scorpion-nest editor helpers (drag to place, keys to tune size/anchor/glow) ---
  const getRenderableScorpionNests = useCallback(() => (
    (stateRef.current.enemies || []).filter(enemy => enemy?.type === 'scorpion-nest')
  ), []);

  const getScorpionNestArtAspect = useCallback(() => {
    const image = scorpionNestRef.current.image;
    if (!image) return 1.5;
    const w = image.naturalWidth || image.width || 3;
    const h = image.naturalHeight || image.height || 2;
    return h > 0 ? w / h : 1.5;
  }, []);

  const getEditedNestParams = useCallback((enemy) => {
    const edit = propPlacementEditorRef.current.scorpionNestEdits[enemy?.id] || {};
    return {
      x: Number.isFinite(edit.x) ? edit.x : enemy.x,
      y: Number.isFinite(edit.y) ? edit.y : enemy.y,
      widthScale: Number.isFinite(edit.widthScale)
        ? edit.widthScale
        : Number.isFinite(enemy.widthScale) ? enemy.widthScale : SCORPION_NEST_EDITOR_DEFAULTS.widthScale,
      yOffset: Number.isFinite(edit.yOffset)
        ? edit.yOffset
        : Number.isFinite(enemy.yOffset) ? enemy.yOffset : SCORPION_NEST_EDITOR_DEFAULTS.yOffset,
      glowYFactor: Number.isFinite(edit.glowYFactor)
        ? edit.glowYFactor
        : Number.isFinite(enemy.glowYFactor) ? enemy.glowYFactor : SCORPION_NEST_EDITOR_DEFAULTS.glowYFactor,
      glowSize: Number.isFinite(edit.glowSize)
        ? edit.glowSize
        : Number.isFinite(enemy.glowSize) ? enemy.glowSize : SCORPION_NEST_EDITOR_DEFAULTS.glowSize,
    };
  }, []);

  const getNestEditorBounds = useCallback((enemy, cameraX) => {
    const params = getEditedNestParams(enemy);
    const drawWidth = enemy.width * params.widthScale;
    const drawHeight = drawWidth / getScorpionNestArtAspect();
    const baseY = params.y + enemy.height + params.yOffset;
    const centerScreenX = worldToScreenX(params.x, cameraX) + enemy.width / 2;
    return {
      x: centerScreenX - drawWidth / 2,
      y: baseY - drawHeight,
      width: drawWidth,
      height: drawHeight,
    };
  }, [getEditedNestParams, getScorpionNestArtAspect]);

  const getLiveScorpionNestBlockers = useCallback((current = stateRef.current) => {
    if (!current || current.enemiesDisabled) return [];
    return (current.enemies || [])
      .filter(enemy => (
        enemy.type === 'scorpion-nest'
        && !enemy.defeated
        && isEntityActiveInScene(enemy, current)
      ))
      .map((enemy) => {
        const params = getEditedNestParams(enemy);
        const widthScale = Number.isFinite(params.widthScale) ? params.widthScale : SCORPION_NEST_EDITOR_DEFAULTS.widthScale;
        const blockWidth = Math.max(enemy.width, enemy.width * widthScale);
        const baseY = params.y + enemy.height + params.yOffset;
        const blockHeight = Math.max(enemy.height + 36, 118);
        return {
          id: enemy.id,
          enemy,
          x: params.x + enemy.width / 2 - blockWidth / 2,
          y: Math.min(params.y, baseY - blockHeight),
          width: blockWidth,
          height: blockHeight,
        };
      });
  }, [getEditedNestParams]);

  const findEditableNestAt = useCallback((screenX, screenY) => {
    const cameraX = Number.isFinite(stateRef.current.cameraX) ? stateRef.current.cameraX : 0;
    return getRenderableScorpionNests()
      .map((enemy, index) => ({ enemy, index, bounds: getNestEditorBounds(enemy, cameraX) }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => a.index - b.index)
      .at(-1)?.enemy || null;
  }, [getNestEditorBounds, getRenderableScorpionNests]);

  const getPropEditorSelectedNest = useCallback(() => {
    const id = propPlacementEditorRef.current.selectedNestId;
    if (!id) return null;
    return getRenderableScorpionNests().find(enemy => enemy.id === id) || null;
  }, [getRenderableScorpionNests]);

  const getArchEditorBounds = useCallback((arch, cameraX) => {
    const worldX = arch.editorKind === 'doorway'
      ? Number.isFinite(arch.anchorX) ? arch.anchorX : arch.blockX
      : arch.x;
    const width = Math.max(Number(arch.width) || 48, 48);
    const height = Math.max(Number(arch.height) || 96, 48);
    return {
      x: worldToScreenX(worldX, cameraX) - width / 2,
      y: Number.isFinite(arch.y) ? arch.y : GATE.y,
      width,
      height,
    };
  }, []);

  const getCheckpointEditorBounds = useCallback((checkpoint, cameraX) => ({
    x: worldToScreenX(checkpoint.x, cameraX) - 24,
    y: checkpoint.y - 64,
    width: 48,
    height: 72,
  }), []);

  const findEditableArchAt = useCallback((screenX, screenY) => {
    const cameraX = Number.isFinite(stateRef.current.cameraX) ? stateRef.current.cameraX : 0;
    const doorwayTargets = getRenderableRouteGateDoorways().map(doorway => ({
      ...doorway,
      editorKind: 'doorway',
      editorId: `doorway:${doorway.id}`,
    }));
    const gateTargets = getRenderableRouteGates().map(gate => ({
      ...gate,
      editorKind: 'gate',
      editorId: `gate:${gate.id}`,
    }));
    return [...doorwayTargets, ...gateTargets]
      .map((arch, index) => ({ arch, index, bounds: getArchEditorBounds(arch, cameraX) }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => {
        const areaDelta = (b.bounds.width * b.bounds.height) - (a.bounds.width * a.bounds.height);
        if (areaDelta !== 0) return areaDelta;
        return a.index - b.index;
      })
      .at(-1)?.arch || null;
  }, [getArchEditorBounds, getRenderableRouteGateDoorways, getRenderableRouteGates]);

  const findEditableCheckpointAt = useCallback((screenX, screenY) => {
    const cameraX = Number.isFinite(stateRef.current.cameraX) ? stateRef.current.cameraX : 0;
    return getRenderableCheckpoints()
      .map((checkpoint, index) => ({ checkpoint, index, bounds: getCheckpointEditorBounds(checkpoint, cameraX) }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => a.index - b.index)
      .at(-1)?.checkpoint || null;
  }, [getCheckpointEditorBounds, getRenderableCheckpoints]);

  const getHazardEditorBounds = useCallback((hazard, cameraX) => {
    const editorWidth = Math.max(hazard.width, 38);
    const editorHeight = Math.max(hazard.height, 34);
    return {
      x: worldToScreenX(hazard.x, cameraX) - Math.max(0, (editorWidth - hazard.width) / 2),
      y: hazard.y - Math.max(0, (editorHeight - hazard.height) / 2),
      width: editorWidth,
      height: editorHeight,
    };
  }, []);

  const findEditableHazardAt = useCallback((screenX, screenY) => {
    const current = stateRef.current;
    const cameraX = Number.isFinite(current.cameraX) ? current.cameraX : 0;
    return getRenderableHazards(current)
      .filter(hazard => hazard.editorVisible !== false)
      .map((hazard, index) => ({
        hazard,
        index,
        bounds: getHazardEditorBounds(hazard, cameraX),
      }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => {
        const areaDelta = (b.bounds.width * b.bounds.height) - (a.bounds.width * a.bounds.height);
        if (areaDelta !== 0) return areaDelta;
        return a.index - b.index;
      })
      .at(-1)?.hazard || null;
  }, [getHazardEditorBounds, getRenderableHazards]);

  const getPlatformEditorBounds = useCallback((platform, cameraX, current) => {
    const isFloor = isJourneyFloorPlatform(platform);
    const isBlocker = isJourneyBlockerPlatform(platform);
    const editorHeight = isFloor ? Math.max(platform.height + 58, 96) : Math.max(platform.height, isBlocker ? 36 : 30);
    const verticalOffset = !isInteriorChamberScene(current) ? current.secretVerticalCameraOffset || 0 : 0;
    const y = platform.y + verticalOffset;
    return {
      x: worldToScreenX(platform.x, cameraX),
      y: isFloor ? y - 46 : isBlocker ? y : y - Math.max(0, (editorHeight - platform.height) / 2),
      width: platform.width,
      height: editorHeight,
    };
  }, []);

  const findEditablePlatformAt = useCallback((screenX, screenY, options = {}) => {
    const current = stateRef.current;
    const cameraX = Number.isFinite(current.cameraX) ? current.cameraX : 0;
    const { floorOnly = false, includeFloors = true } = options;
    return getRenderablePlatforms(current)
      .filter((platform) => {
        const isFloor = isJourneyFloorPlatform(platform);
        if (floorOnly) return isFloor;
        return includeFloors || !isFloor;
      })
      .map((platform, index) => ({
        platform,
        index,
        bounds: getPlatformEditorBounds(platform, cameraX, current),
      }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => {
        const yDelta = b.platform.y - a.platform.y;
        if (yDelta !== 0) return yDelta;
        return a.index - b.index;
      })
      .at(-1)?.platform || null;
  }, [getPlatformEditorBounds, getRenderablePlatforms]);

  const getPropPalettePreview = useCallback((paletteItem) => {
    const template = paletteItem?.template || paletteItem || {};
    if (paletteItem?.category === 'Trap' || String(paletteItem?.key || '').startsWith('trap:')) {
      const trapPreviewStyles = {
        'collapsing-stone-floor': {
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.2) 0 11%, transparent 12%), linear-gradient(88deg, transparent 0 42%, rgba(30, 18, 9, 0.82) 43% 47%, transparent 48%), linear-gradient(176deg, rgba(36, 22, 10, 0.72) 0 12%, transparent 13%), repeating-linear-gradient(0deg, rgba(56, 34, 16, 0.24) 0 2px, transparent 2px 12px), linear-gradient(180deg, #b99154 0%, #73502a 52%, #3f2a17 100%)',
          boxShadow: 'inset 0 -12px 18px rgba(26, 15, 8, 0.44), inset 0 7px 10px rgba(255, 220, 143, 0.2)',
        },
        'hidden-sand-pit': {
          background:
            'radial-gradient(circle at 50% 55%, rgba(35, 20, 9, 0.9) 0 9%, rgba(84, 50, 22, 0.7) 18%, rgba(175, 114, 49, 0.48) 36%, rgba(223, 166, 83, 0.86) 58%, rgba(126, 76, 31, 0.92) 100%), repeating-radial-gradient(circle at 47% 50%, rgba(255, 226, 147, 0.22) 0 2px, transparent 2px 7px)',
          borderRadius: '50%',
          boxShadow: 'inset 0 8px 12px rgba(255, 218, 129, 0.22), inset 0 -9px 16px rgba(45, 24, 10, 0.52)',
        },
        'dart-launcher': {
          background:
            'linear-gradient(90deg, transparent 0 48%, rgba(240, 205, 125, 0.95) 49% 75%, rgba(40, 24, 12, 0.95) 76% 81%, transparent 82%), radial-gradient(circle at 35% 48%, rgba(15, 10, 7, 0.95) 0 8%, rgba(84, 49, 23, 0.85) 9% 18%, transparent 19%), repeating-linear-gradient(90deg, rgba(42, 26, 13, 0.62) 0 6px, rgba(130, 82, 36, 0.5) 6px 13px), linear-gradient(180deg, #946033 0%, #4b321c 100%)',
          boxShadow: 'inset 0 0 0 2px rgba(229, 180, 92, 0.22), inset 0 -14px 18px rgba(17, 24, 39, 0.56)',
        },
      };
      const trapStyle = trapPreviewStyles[template.type] || trapPreviewStyles['hidden-sand-pit'];
      return {
        assetKey: template.type === 'dart-launcher'
          ? 'wall dart trap'
          : template.type === 'collapsing-stone-floor'
            ? 'cracked floor trap'
            : 'concealed sand pit',
        style: {
          ...trapStyle,
          width: '100%',
          height: '100%',
          borderRadius: trapStyle.borderRadius || '5px',
          backgroundBlendMode: 'normal',
        },
      };
    }
    if (paletteItem?.type === 'platform' || paletteItem?.type === 'floor' || String(paletteItem?.key || '').startsWith('platform:')) {
      const floor = paletteItem?.type === 'floor';
      const blocker = paletteItem?.type === 'blocker';
      const slantShape = template.blockerShape === 'left-slant'
        ? 'polygon(100% 0, 100% 100%, 0 100%)'
        : template.blockerShape === 'right-slant'
          ? 'polygon(0 0, 100% 100%, 0 100%)'
          : undefined;
      return {
        assetKey: blocker
          ? template.blockerShape === 'left-slant'
            ? 'left slant blocker'
            : template.blockerShape === 'right-slant'
              ? 'right slant blocker'
              : 'movement blocker'
          : floor ? 'collision floor' : 'collision platform',
        style: {
          background: blocker
            ? 'linear-gradient(90deg, rgba(45, 212, 191, 0.44), rgba(14, 165, 233, 0.22))'
            : floor
            ? 'linear-gradient(180deg, rgba(253, 224, 71, 0.38), rgba(245, 158, 11, 0.18))'
            : 'linear-gradient(180deg, rgba(251, 191, 36, 0.36), rgba(249, 115, 22, 0.2))',
          border: `2px solid ${blocker ? 'rgba(45, 212, 191, 0.95)' : floor ? 'rgba(253, 224, 71, 0.95)' : 'rgba(251, 146, 60, 0.95)'}`,
          borderRadius: floor ? '3px' : '5px',
          boxShadow: `0 0 12px ${blocker ? 'rgba(45, 212, 191, 0.28)' : 'rgba(253, 224, 71, 0.28)'}`,
          width: blocker ? '34%' : '100%',
          height: floor ? '70%' : blocker ? '92%' : '44%',
          margin: blocker ? '4% auto 0' : undefined,
          marginTop: blocker ? undefined : floor ? '15%' : '28%',
          clipPath: slantShape,
        },
      };
    }
    const generatedPreview = GENERATED_STORY_PROP_PREVIEW_SOURCES[template.type];
    if (generatedPreview) {
      return {
        assetKey: generatedPreview.assetKey,
        style: {
          backgroundImage: `url(${import.meta.env.BASE_URL}${generatedPreview.src})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          width: '100%',
          height: '100%',
        },
      };
    }
    if (template.imageAssetKey && template.assetPath) {
      return {
        assetKey: template.imageAssetKey,
        style: {
          backgroundImage: `url(${import.meta.env.BASE_URL}${template.assetPath})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          width: '100%',
          height: '100%',
        },
      };
    }
    if (template.collectibleSpriteKey) {
      return {
        assetKey: template.collectibleSpriteKey,
        style: {
          background: 'radial-gradient(circle at 50% 45%, rgba(250, 204, 21, 0.22), transparent 58%), linear-gradient(135deg, rgba(214, 173, 98, 0.95), rgba(77, 48, 24, 0.95))',
          clipPath: 'polygon(22% 12%, 86% 24%, 72% 86%, 20% 76%, 8% 38%)',
          boxShadow: 'inset 0 0 0 2px rgba(252, 211, 77, 0.42), 0 0 10px rgba(250, 204, 21, 0.25)',
          width: '76%',
          height: '76%',
          margin: '12%',
        },
      };
    }
    const candidates = [];
    if (template.atmosphereAssetKey) {
      candidates.push({
        assets: atmosphereEnvironmentAssetsRef.current,
        packId: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_ATMOSPHERE,
        assetKey: template.atmosphereAssetKey,
      });
    }
    if (template.foregroundDetailAssetKey) {
      candidates.push({
        assets: foregroundDepthEnvironmentAssetsRef.current,
        packId: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_FOREGROUND_DEPTH,
        assetKey: template.foregroundDetailAssetKey,
      });
    }
    if (template.groundDetailAssetKey) {
      candidates.push({
        assets: premiumGroundContactAssetsRef.current,
        packId: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_PREMIUM_GROUND_CONTACT,
        assetKey: template.groundDetailAssetKey,
      });
    }
    candidates.push({
      assets: environmentAssetsRef.current,
      packId: environmentAssetsRef.current.packId,
      assetKey: getEnvironmentAssetKeyForStoryProp(template, environmentAssetsRef.current.packId),
    });

    for (const candidate of candidates) {
      const region = candidate.assetKey ? candidate.assets?.atlas?.regions?.[candidate.assetKey] : null;
      const image = candidate.assets?.atlas?.image;
      const atlasSize = candidate.assets?.atlas?.size;
      if (!region || !image || !atlasSize?.w || !atlasSize?.h) continue;
      const packConfig = getEnvironmentAssetPackConfig(candidate.packId);
      const scale = Math.min(0.9, 46 / Math.max(region.w, region.h));
      return {
        assetKey: candidate.assetKey,
        style: {
          backgroundImage: `url(${import.meta.env.BASE_URL}${packConfig.basePath}${image})`,
          backgroundPosition: `${-region.x * scale}px ${-region.y * scale}px`,
          backgroundSize: `${atlasSize.w * scale}px ${atlasSize.h * scale}px`,
          width: `${Math.max(10, region.w * scale)}px`,
          height: `${Math.max(10, region.h * scale)}px`,
        },
      };
    }
    return null;
  }, []);

  const getPropEditorUiState = useCallback((current = stateRef.current) => {
    const editor = propPlacementEditorRef.current;
    const prop = getPropEditorSelectedProp(current);
    const hazard = !prop ? getPropEditorSelectedHazard(current) : null;
    const platform = !prop && !hazard ? getPropEditorSelectedPlatform(current) : null;
    const lair = !prop && !hazard && !platform ? getPropEditorSelectedLair(current) : null;
    const arch = !prop && !hazard && !platform && !lair ? getPropEditorSelectedArch(current) : null;
    const checkpoint = !prop && !hazard && !platform && !arch && !lair ? getPropEditorSelectedCheckpoint(current) : null;
    const nest = !prop && !hazard && !platform && !arch && !lair && !checkpoint ? getPropEditorSelectedNest() : null;
    const roomId = prop
      ? getJourneyPropRoomId(prop, getJourneySceneId(current), current.currentSectionId)
      : hazard
        ? getHazardEditorRoomId(hazard, current)
      : platform
        ? getPlatformEditorRoomId(platform, current)
      : lair
        ? lair.sectionId || getSectionForX(getScarabQueenLairPlacement(lair).x)?.id || getActivePropEditorRoomId(current)
      : arch
        ? getSectionForX((Number(arch.anchorX) || Number(arch.x) || 0))?.id || getActivePropEditorRoomId(current)
      : checkpoint
        ? checkpoint.id
      : getActivePropEditorRoomId(current);
    const paletteSource = editor.selectedPaletteCategory === 'trap'
      ? trapEditorPalette
      : editor.selectedPaletteCategory === 'platform'
        ? platformEditorPalette
        : editor.selectedPaletteCategory === 'ground-detail'
          ? groundDetailsEditorPalette
          : editor.selectedPaletteCategory === 'foreground-detail'
            ? foregroundDetailsEditorPalette
            : editor.selectedPaletteCategory === 'shard-prop'
              ? shardPropsEditorPalette
              : editor.selectedPaletteCategory === 'ledge'
                ? propEditorPalette.filter(item => item.category === 'Ledge Helpers')
                : propEditorPalette;
    const palette = paletteSource
      .map(item => ({ ...item, preview: getPropPalettePreview(item) }))
      .filter(item => item.preview);
    const paletteSourceForCategory = (category) => (
      category === 'trap' ? trapEditorPalette
      : category === 'platform' ? platformEditorPalette
      : category === 'ground-detail' ? groundDetailsEditorPalette
      : category === 'foreground-detail' ? foregroundDetailsEditorPalette
      : category === 'shard-prop' ? shardPropsEditorPalette
      : propEditorPalette
    );
    const recentPaletteItems = (editor.recentPaletteKeys || [])
      .map(({ key, category }) => {
        const item = paletteSourceForCategory(category).find(i => i.key === key);
        if (!item) return null;
        const preview = getPropPalettePreview(item);
        if (!preview) return null;
        return { key, category, label: item.label, preview };
      })
      .filter(Boolean);
    const selectedLockKey = prop
      ? `prop:${prop.id}`
      : platform
        ? `platform:${platform.id || platform.label}`
      : hazard
        ? `hazard:${hazard.id}`
      : arch
        ? `arch:${arch.editorId}`
      : checkpoint
        ? `checkpoint:${checkpoint.id}`
      : lair
        ? `lair:${lair.id}`
      : nest
        ? `nest:${nest.id}`
      : null;
    // Scene Outliner: every prop in the active room, grouped by depth band and sorted
    // by z within the band — the same ordering the renderer and z-order buttons use.
    const outlinerRoomId = getActivePropEditorRoomId(current);
    const outlinerQuery = (editor.outlinerSearch || '').trim().toLowerCase();
    const outlinerProps = getRenderableStoryProps(current)
      .filter(item => item?.id && getJourneyPropRoomId(item, getJourneySceneId(current), current.currentSectionId) === outlinerRoomId)
      .filter(item => !outlinerQuery || `${item.label || item.name || ''} ${item.id}`.toLowerCase().includes(outlinerQuery))
      .map(item => ({
        id: item.id,
        label: item.label || item.name || item.id,
        depth: getStoryPropDepth(item),
        zIndex: Number.isFinite(item.zIndex) ? item.zIndex : 0,
        x: Math.round(Number(item.x) || 0),
        locked: editor.lockedItems.has(`prop:${item.id}`),
        hidden: editor.hiddenIds.has(item.id),
        selected: editor.selectedPropId === item.id,
      }));
    const outlinerGroups = Object.entries(outlinerProps.reduce((groups, item) => {
      (groups[item.depth] ||= []).push(item);
      return groups;
    }, {}))
      .map(([depth, items]) => ({
        depth,
        order: STORY_PROP_DEPTH_ORDER[depth] ?? 99,
        items: items.sort((a, b) => (a.zIndex - b.zIndex) || (a.x - b.x)),
      }))
      .sort((a, b) => a.order - b.order);
    const outlinerRoomTotal = getRenderableStoryProps(current)
      .filter(item => item?.id && getJourneyPropRoomId(item, getJourneySceneId(current), current.currentSectionId) === outlinerRoomId)
      .length;
    const sceneOutliner = {
      roomId: outlinerRoomId,
      groups: outlinerGroups,
      total: outlinerProps.length,
      roomTotal: outlinerRoomTotal,
      search: editor.outlinerSearch || '',
      hiddenCount: editor.hiddenIds.size,
    };
    return {
      enabled: editor.enabled,
      selectedProp: prop ? {
        id: prop.id,
        category: isGeneratedStoryStructureProp(prop) ? 'Structure' : 'Prop',
        roomId,
        x: Math.round(prop.x),
        y: Math.round(prop.y),
        type: prop.type || 'prop',
        width: Math.round(getStoryPropEditorSize(prop).width),
        height: Math.round(getStoryPropEditorSize(prop).height),
        sourceWidth: Math.round(Number.isFinite(prop.width) ? prop.width : getStoryPropEditorSize(prop).width),
        sourceHeight: Math.round(Number.isFinite(prop.height) ? prop.height : getStoryPropEditorSize(prop).height),
        editorBoundsInsetTop: Math.round(Number.isFinite(prop.editorBoundsInsetTop) ? prop.editorBoundsInsetTop : 0),
        editorBoundsInsetRight: Math.round(Number.isFinite(prop.editorBoundsInsetRight) ? prop.editorBoundsInsetRight : 0),
        editorBoundsInsetBottom: Math.round(Number.isFinite(prop.editorBoundsInsetBottom) ? prop.editorBoundsInsetBottom : 0),
        editorBoundsInsetLeft: Math.round(Number.isFinite(prop.editorBoundsInsetLeft) ? prop.editorBoundsInsetLeft : 0),
        yOffset: Math.round(Number.isFinite(prop.yOffset) ? prop.yOffset : 0),
        scale: Number.isFinite(prop.scale) ? prop.scale : 1,
        rotation: Number.isFinite(prop.rotation) ? prop.rotation : 0,
        mirrorX: Boolean(prop.mirrorX),
        mirrorY: Boolean(prop.mirrorY),
        brightness: Number.isFinite(prop.brightness) ? prop.brightness : 1,
        colorGradeFilter: typeof prop.colorGradeFilter === 'string' ? prop.colorGradeFilter : '',
        tintColor: typeof prop.tintColor === 'string' && prop.tintColor ? prop.tintColor : '#b88a4a',
        tintStrength: Number.isFinite(prop.tintStrength) ? prop.tintStrength : 0,
        paintColor: typeof prop.paintColor === 'string' && prop.paintColor ? prop.paintColor : '#7c5a32',
        paintStrength: Number.isFinite(prop.paintStrength) ? prop.paintStrength : 0,
        depth: getStoryPropDepth(prop),
        layer: prop.layer || 'default',
        zIndex: Number.isFinite(prop.zIndex) ? prop.zIndex : 'auto',
        groundContactLayer: Array.isArray(prop.groundContactLayer)
          ? prop.groundContactLayer.map(entry => ({ ...entry }))
          : [],
      } : null,
      selectedPlatform: platform ? {
        id: platform.id || platform.label || 'platform',
        category: isJourneyBlockerPlatform(platform) ? 'Blocker' : isJourneyFloorPlatform(platform) ? 'Floor' : 'Platform',
        roomId,
        x: Math.round(platform.x),
        y: Math.round(platform.y),
        width: Math.round(platform.width),
        height: Math.round(platform.height),
        collision: platform.collision || 'landing',
        blockerShape: platform.blockerShape || 'box',
        depth: isJourneyBlockerPlatform(platform) ? 'blocker/collision' : isJourneyFloorPlatform(platform) ? 'floor/collision' : 'collision',
        layer: platform.layer || (isJourneyBlockerPlatform(platform) ? 'blocker' : isJourneyFloorPlatform(platform) ? 'floor' : 'platform'),
        zIndex: Number.isFinite(platform.zIndex) ? platform.zIndex : 'auto',
      } : null,
      selectedHazard: hazard ? {
        id: hazard.id,
        roomId,
        x: Math.round(hazard.x),
        y: Math.round(hazard.y),
        width: Math.round(hazard.width),
        height: Math.round(hazard.height),
        type: hazard.type || 'legacy-hazard',
        triggerArea: getJourneyTrapTriggerRect(hazard),
        triggerOffset: normalizeJourneyTrap(hazard).triggerArea,
        damage: Number.isFinite(hazard.damage) ? hazard.damage : hazard.penalty?.stamina || 0,
        reset: Boolean(hazard.reset),
        cooldown: Number.isFinite(hazard.cooldown) ? hazard.cooldown : 0,
        depth: hazard.depth || 'grounded',
        direction: hazard.direction || 'right',
        launcherX: Number.isFinite(hazard.launcherX) ? hazard.launcherX : Math.round(hazard.x + hazard.width / 2),
        launcherY: Number.isFinite(hazard.launcherY) ? hazard.launcherY : Math.round(hazard.y - 44),
        editorVisible: hazard.editorVisible !== false,
        linkedObjectIds: Array.isArray(hazard.linkedObjectIds) ? hazard.linkedObjectIds.join(', ') : '',
        burial: getHazardBurialAmount(hazard),
        brightness: Number.isFinite(hazard.brightness) ? hazard.brightness : 1,
        alpha: Number.isFinite(hazard.alpha) ? hazard.alpha : 1,
        colorGradeFilter: hazard.colorGradeFilter || '',
        name: hazard.name || hazard.id,
        penalty: hazard.penalty || {},
        layer: 'hazard',
      } : null,
      selectedArch: arch ? {
        id: arch.id,
        editorId: arch.editorId,
        kind: arch.editorKind === 'doorway' ? 'doorway arch' : 'route gate arch',
        roomId,
        x: Math.round(Number.isFinite(arch.anchorX) ? arch.anchorX : arch.x),
        y: Math.round(arch.y),
        width: Math.round(arch.width),
        height: Math.round(arch.height),
      } : null,
      selectedLair: lair ? {
        id: lair.id,
        name: lair.name || 'Scarab Lair',
        roomId,
        x: Math.round(getScarabQueenLairPlacement(lair).x),
        y: Math.round(getScarabQueenLairPlacement(lair).y),
        width: Math.round(getScarabQueenLairPlacement(lair).width),
        height: Math.round(getScarabQueenLairPlacement(lair).height),
        bossX: Math.round(lair.x),
        bossY: Math.round(lair.y),
        bossWidth: Number.isFinite(lair.width) ? Math.round(lair.width) : '',
        bossHeight: Number.isFinite(lair.height) ? Math.round(lair.height) : '',
        arenaStart: Math.round(lair.arenaStart),
        arenaEnd: Math.round(lair.arenaEnd),
        patrolMin: Number.isFinite(lair.patrolMin) ? Math.round(lair.patrolMin) : '',
        patrolMax: Number.isFinite(lair.patrolMax) ? Math.round(lair.patrolMax) : '',
      } : null,
      selectedCheckpoint: checkpoint ? {
        id: checkpoint.id,
        name: checkpoint.name || checkpoint.id,
        roomId,
        x: Math.round(checkpoint.x),
        y: Math.round(checkpoint.y),
      } : null,
      selectedNest: nest ? (() => {
        const params = getEditedNestParams(nest);
        return {
          id: nest.id,
          name: nest.name || 'Scorpion Nest',
          roomId,
          x: Math.round(params.x),
          y: Math.round(params.y),
          widthScale: Number(params.widthScale.toFixed(2)),
          yOffset: Math.round(params.yOffset),
          glowYFactor: Number(params.glowYFactor.toFixed(2)),
          glowSize: Number(params.glowSize.toFixed(2)),
        };
      })() : null,
      gridSnap: editor.gridSnap,
      gridSize: editor.gridSize,
      paletteOpen: editor.paletteOpen,
      collapsedPaletteGroups: editor.collapsedPaletteGroups || {},
      selectedPaletteKey: editor.selectedPaletteKey,
      selectedPaletteCategory: editor.selectedPaletteCategory,
      recentPaletteItems,
      stampMode: editor.stampMode === true,
      paletteSearch: editor.paletteSearch || '',
      showTrapTriggers: editor.showTrapTriggers,
      showHoverLabels: editor.showHoverLabels !== false,
      previewMode: editor.previewMode,
      panelCollapsed: editor.panelCollapsed,
      floorPickMode: editor.floorPickMode,
      palette,
      selectedLockKey,
      selectedLocked: Boolean(selectedLockKey && editor.lockedItems.has(selectedLockKey)),
      lockedCount: editor.lockedItems.size,
      hasCopiedLook: Boolean(editor.copiedLook),
      unsavedChangeSummary: createJourneyPlacementChangeSummary(editor),
      exportText: editor.exportText,
      aiInstructions: editor.aiInstructions,
      exportVisible: editor.exportVisible,
      savedAt: editor.savedAt,
      writeStatus: editor.writeStatus,
      sceneOutliner,
      stackPicker: editor.stackPicker,
      canUndo: editorUndoStackRef.current.length > 0,
      canRedo: editorRedoStackRef.current.length > 0,
    };
  }, [getActivePropEditorRoomId, getHazardEditorRoomId, getPlatformEditorRoomId, getPropEditorSelectedArch, getPropEditorSelectedCheckpoint, getPropEditorSelectedHazard, getPropEditorSelectedLair, getPropEditorSelectedNest, getEditedNestParams, getPropEditorSelectedPlatform, getPropEditorSelectedProp, getPropPalettePreview, getRenderableStoryProps, getScarabQueenLairPlacement, foregroundDetailsEditorPalette, groundDetailsEditorPalette, platformEditorPalette, propEditorPalette, shardPropsEditorPalette, trapEditorPalette]);

  const persistPropEditorState = useCallback(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;
    try {
      const serialized = serializeJourneyPropEditorState(propPlacementEditorRef.current);
      window.localStorage.setItem(JOURNEY_PROP_EDITOR_STORAGE_KEY, JSON.stringify(serialized));
    } catch {
      // Ignore storage failures (quota exceeded, private mode, disabled storage).
    }
  }, []);

  const schedulePropEditorPersist = useCallback(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;
    if (propEditorPersistTimeoutRef.current) {
      window.clearTimeout(propEditorPersistTimeoutRef.current);
    }
    // Debounce so dragging (which fires every frame) writes at most ~2x/second.
    propEditorPersistTimeoutRef.current = window.setTimeout(() => {
      propEditorPersistTimeoutRef.current = null;
      persistPropEditorState();
    }, 400);
  }, [persistPropEditorState]);

  // Snapshot of the editable layer as a JSON string, used as history entries.
  const snapshotEditorHistoryState = useCallback(() => (
    JSON.stringify(serializeJourneyPropEditorState(propPlacementEditorRef.current))
  ), []);

  // Commit the latest edit burst as one undo step. Pushes the PRE-change baseline
  // onto the undo stack only when the editable layer actually changed, so UI-only
  // actions (selecting, toggling grid) never create history noise.
  const commitEditorHistory = useCallback(() => {
    if (editorHistoryTimeoutRef.current) {
      window.clearTimeout(editorHistoryTimeoutRef.current);
      editorHistoryTimeoutRef.current = null;
    }
    const current = snapshotEditorHistoryState();
    const baseline = editorHistoryBaselineRef.current;
    if (baseline === null) {
      editorHistoryBaselineRef.current = current;
      return;
    }
    if (current === baseline) return;
    editorUndoStackRef.current.push(baseline);
    if (editorUndoStackRef.current.length > 60) editorUndoStackRef.current.shift();
    editorRedoStackRef.current = [];
    editorHistoryBaselineRef.current = current;
  }, [snapshotEditorHistoryState]);

  const scheduleEditorHistoryCommit = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (editorHistoryTimeoutRef.current) window.clearTimeout(editorHistoryTimeoutRef.current);
    // Debounce so a continuous drag coalesces into a single undo step.
    editorHistoryTimeoutRef.current = window.setTimeout(() => {
      editorHistoryTimeoutRef.current = null;
      commitEditorHistory();
    }, 450);
  }, [commitEditorHistory]);

  const refreshPropEditorUi = useCallback(() => {
    setPropEditorUi(getPropEditorUiState());
    schedulePropEditorPersist();
    scheduleEditorHistoryCommit();
  }, [getPropEditorUiState, schedulePropEditorPersist, scheduleEditorHistoryCommit]);

  const clearPropEditorDraftLayer = useCallback(({ clearSelection = true } = {}) => {
    const editor = propPlacementEditorRef.current;
    editor.edits = {};
    editor.platformEdits = {};
    editor.hazardEdits = {};
    editor.routeGateEdits = {};
    editor.routeGateDoorwayEdits = {};
    editor.checkpointEdits = {};
    editor.miniBossEdits = {};
    editor.scorpionNestEdits = {};
    editor.createdProps = [];
    editor.createdPlatforms = [];
    editor.createdHazards = [];
    editor.deletedIds = new Set();
    editor.deletedPlatformIds = new Set();
    editor.deletedHazardIds = new Set();
    if (clearSelection) {
      editor.selectedPropId = null;
      editor.selectedPlatformId = null;
      editor.selectedHazardId = null;
      editor.selectedArchId = null;
      editor.selectedCheckpointId = null;
      editor.selectedLairId = null;
      editor.selectedNestId = null;
    }
    editor.dragging = null;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(JOURNEY_PROP_EDITOR_STORAGE_KEY);
      } catch {
        // Ignore storage failures.
      }
    }
    if (editorHistoryTimeoutRef.current && typeof window !== 'undefined') {
      window.clearTimeout(editorHistoryTimeoutRef.current);
      editorHistoryTimeoutRef.current = null;
    }
    editorUndoStackRef.current = [];
    editorRedoStackRef.current = [];
    editorHistoryBaselineRef.current = JSON.stringify(serializeJourneyPropEditorState(editor));
  }, []);

  const clearSavedPropEditorState = useCallback(() => {
    clearPropEditorDraftLayer();
    refreshPropEditorUi();
  }, [clearPropEditorDraftLayer, refreshPropEditorUi]);

  const restoreEditorHistoryState = useCallback((serialized) => {
    const editor = propPlacementEditorRef.current;
    const restored = restoreJourneyPropEditorState(JSON.parse(serialized));
    Object.assign(editor, restored);
    pruneObsoleteLostBridgeRavineFloorEditorProps(editor);
    // A restored state may reference items that are no longer selected cleanly.
    editor.dragging = null;
    editorHistoryBaselineRef.current = serialized;
    refreshPropEditorUi();
    persistPropEditorState();
  }, [refreshPropEditorUi, persistPropEditorState]);

  const undoEditorChange = useCallback(() => {
    // Fold any in-progress edit into history first so it can be undone too.
    commitEditorHistory();
    if (editorUndoStackRef.current.length === 0) return;
    const current = snapshotEditorHistoryState();
    const previous = editorUndoStackRef.current.pop();
    editorRedoStackRef.current.push(current);
    restoreEditorHistoryState(previous);
  }, [commitEditorHistory, snapshotEditorHistoryState, restoreEditorHistoryState]);

  const redoEditorChange = useCallback(() => {
    commitEditorHistory();
    if (editorRedoStackRef.current.length === 0) return;
    const current = snapshotEditorHistoryState();
    const next = editorRedoStackRef.current.pop();
    editorUndoStackRef.current.push(current);
    restoreEditorHistoryState(next);
  }, [commitEditorHistory, snapshotEditorHistoryState, restoreEditorHistoryState]);

  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('clearJourneyEditorDraft') === '1') {
        window.localStorage.removeItem(JOURNEY_PROP_EDITOR_STORAGE_KEY);
      }
      const raw = window.localStorage.getItem(JOURNEY_PROP_EDITOR_STORAGE_KEY);
      if (raw) {
        const restored = restoreJourneyPropEditorState(JSON.parse(raw));
        // The game loop reads this ref every frame, so restored edits show up in the
        // live world immediately; the editor panel picks them up when opened (Shift+E).
        Object.assign(propPlacementEditorRef.current, restored);
        pruneObsoleteLostBridgeRavineFloorEditorProps(propPlacementEditorRef.current);
        pruneRetiredDesertEntryBackgroundEditorProps(propPlacementEditorRef.current);
      }
    } catch {
      // Ignore corrupt saved state — fall back to a clean editor.
    }
    // Seed the undo baseline with whatever we start from (saved edits or empty).
    editorHistoryBaselineRef.current = JSON.stringify(
      serializeJourneyPropEditorState(propPlacementEditorRef.current),
    );
  }, []);

  useEffect(() => () => {
    if (typeof window !== 'undefined') {
      if (propEditorPersistTimeoutRef.current) window.clearTimeout(propEditorPersistTimeoutRef.current);
      if (editorHistoryTimeoutRef.current) window.clearTimeout(editorHistoryTimeoutRef.current);
    }
  }, []);

  // Load the saved editor panel position so a dragged panel returns to where
  // you left it after a reload.
  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(JOURNEY_PROP_EDITOR_PANEL_POS_KEY);
      if (raw) {
        const pos = JSON.parse(raw);
        if (Number.isFinite(pos?.x) && Number.isFinite(pos?.y)) editorPanelPosRef.current = pos;
      }
    } catch {
      // Ignore corrupt saved position.
    }
  }, []);

  // Callback ref: when the panel mounts, apply any saved drag position.
  const setEditorPanelNode = useCallback((node) => {
    editorPanelRef.current = node;
    const pos = editorPanelPosRef.current;
    if (node && pos) {
      node.style.left = `${pos.x}px`;
      node.style.top = `${pos.y}px`;
      node.style.right = 'auto';
    }
  }, []);

  const resetEditorPanelPosition = useCallback(() => {
    const node = editorPanelRef.current;
    if (node) {
      node.style.left = '';
      node.style.top = '';
      node.style.right = '';
    }
    editorPanelPosRef.current = null;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(JOURNEY_PROP_EDITOR_PANEL_POS_KEY);
      } catch {
        // Ignore storage failures.
      }
    }
  }, []);

  const handleEditorPanelDragStart = useCallback((event) => {
    const node = editorPanelRef.current;
    if (!node || typeof window === 'undefined') return;
    // Let buttons / inputs inside the header behave normally.
    if (event.target.closest('button, input, select, textarea, a')) return;
    event.preventDefault();
    const rect = node.getBoundingClientRect();
    editorPanelDragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    node.style.right = 'auto';
    const handleMove = (moveEvent) => {
      const drag = editorPanelDragRef.current;
      if (!drag) return;
      const parentRect = node.offsetParent?.getBoundingClientRect?.()
        || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      const maxX = Math.max(0, parentRect.width - node.offsetWidth);
      const maxY = Math.max(0, parentRect.height - node.offsetHeight);
      const x = Math.max(0, Math.min(moveEvent.clientX - parentRect.left - drag.offsetX, maxX));
      const y = Math.max(0, Math.min(moveEvent.clientY - parentRect.top - drag.offsetY, maxY));
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      editorPanelPosRef.current = { x, y };
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      editorPanelDragRef.current = null;
      if (editorPanelPosRef.current) {
        try {
          window.localStorage.setItem(JOURNEY_PROP_EDITOR_PANEL_POS_KEY, JSON.stringify(editorPanelPosRef.current));
        } catch {
          // Ignore storage failures.
        }
      }
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV || !propPlacementEditorRef.current.enabled) return;
    applyDefaultEditorLocks(stateRef.current);
    refreshPropEditorUi();
  }, [applyDefaultEditorLocks, refreshPropEditorUi]);

  const toggleSelectedEditorLock = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    const lockKey = getSelectedEditorLockKey();
    if (!lockKey) return;
    if (editor.lockedItems.has(lockKey)) {
      editor.lockedItems.delete(lockKey);
    } else {
      editor.lockedItems.add(lockKey);
      editor.dragging = null;
    }
    refreshPropEditorUi();
  }, [getSelectedEditorLockKey, refreshPropEditorUi]);

  // --- Scene Outliner: select / hide / lock a prop straight from the layer list,
  // including props that are currently off-screen or buried behind others. ---
  const selectEditorPropFromOutliner = useCallback((propId) => {
    const editor = propPlacementEditorRef.current;
    const current = stateRef.current;
    editor.selectedPropId = propId;
    editor.selectedPlatformId = null;
    editor.selectedHazardId = null;
    editor.selectedArchId = null;
    editor.selectedCheckpointId = null;
    editor.selectedLairId = null;
    editor.selectedNestId = null;
    editor.dragging = null;
    // Recenter the camera so picking an off-screen prop brings it into view.
    const prop = getRenderableStoryProps(current).find(item => item.id === propId);
    if (prop && Number.isFinite(prop.x)) {
      const nextCameraX = clampCameraX(prop.x - CANVAS_WIDTH / 2);
      current.cameraX = nextCameraX;
      current.targetCameraX = nextCameraX;
    }
    refreshPropEditorUi();
  }, [getRenderableStoryProps, refreshPropEditorUi]);

  const toggleEditorPropHidden = useCallback((propId) => {
    const editor = propPlacementEditorRef.current;
    if (editor.hiddenIds.has(propId)) editor.hiddenIds.delete(propId);
    else editor.hiddenIds.add(propId);
    refreshPropEditorUi();
  }, [refreshPropEditorUi]);

  const showAllEditorProps = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    if (!editor.hiddenIds.size) return;
    editor.hiddenIds.clear();
    refreshPropEditorUi();
  }, [refreshPropEditorUi]);

  const toggleEditorPropLockFromOutliner = useCallback((propId) => {
    const editor = propPlacementEditorRef.current;
    const key = `prop:${propId}`;
    if (editor.lockedItems.has(key)) {
      editor.lockedItems.delete(key);
    } else {
      editor.lockedItems.add(key);
      if (editor.selectedPropId === propId) editor.dragging = null;
    }
    refreshPropEditorUi();
  }, [refreshPropEditorUi]);

  const setEditorOutlinerSearch = useCallback((value) => {
    propPlacementEditorRef.current.outlinerSearch = value;
    refreshPropEditorUi();
  }, [refreshPropEditorUi]);

  // Select an entity chosen from the on-canvas stack picker (Alt/right-click). Selection
  // only — no drag — since the user is choosing among overlapping items, not grabbing one.
  const selectEditorEntityFromStack = useCallback((kind, id) => {
    const editor = propPlacementEditorRef.current;
    if (isEditorLockKeyLocked(`${kind}:${id}`)) {
      editor.stackPicker = null;
      refreshPropEditorUi();
      return;
    }
    editor.selectedPropId = null;
    editor.selectedPlatformId = null;
    editor.selectedHazardId = null;
    editor.selectedArchId = null;
    editor.selectedCheckpointId = null;
    editor.selectedLairId = null;
    editor.selectedNestId = null;
    editor.dragging = null;
    if (kind === 'prop') editor.selectedPropId = id;
    else if (kind === 'platform') editor.selectedPlatformId = id;
    else if (kind === 'hazard') editor.selectedHazardId = id;
    else if (kind === 'arch') editor.selectedArchId = id;
    else if (kind === 'checkpoint') editor.selectedCheckpointId = id;
    else if (kind === 'lair') editor.selectedLairId = id;
    else if (kind === 'nest') editor.selectedNestId = id;
    editor.stackPicker = null;
    refreshPropEditorUi();
  }, [isEditorLockKeyLocked, refreshPropEditorUi]);

  const dismissEditorStackPicker = useCallback(() => {
    if (!propPlacementEditorRef.current.stackPicker) return;
    propPlacementEditorRef.current.stackPicker = null;
    refreshPropEditorUi();
  }, [refreshPropEditorUi]);

  const getPropEditorPointer = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const screenX = ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const screenY = ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    const current = stateRef.current;
    const verticalOffset = !isInteriorChamberScene(current) ? current.secretVerticalCameraOffset || 0 : 0;
    return {
      screenX,
      screenY,
      worldX: screenX + current.cameraX,
      worldY: screenY - verticalOffset,
    };
  }, []);

  const findEditableStoryPropAt = useCallback((screenX, screenY) => {
    const current = stateRef.current;
    const cameraX = Number.isFinite(current.cameraX) ? current.cameraX : 0;
    return getRenderableStoryProps(current)
      .map((prop, index) => ({
        prop,
        index,
        bounds: getStoryPropEditorBounds(prop, cameraX, current),
      }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => {
        const depthDelta = (STORY_PROP_DEPTH_ORDER[a.bounds.depth] || 0) - (STORY_PROP_DEPTH_ORDER[b.bounds.depth] || 0);
        if (depthDelta !== 0) return depthDelta;
        const zDelta = (Number(a.prop.zIndex) || 0) - (Number(b.prop.zIndex) || 0);
        if (zDelta !== 0) return zDelta;
        const areaDelta = (b.bounds.width * b.bounds.height) - (a.bounds.width * a.bounds.height);
        if (areaDelta !== 0) return areaDelta;
        return a.index - b.index;
      })
      .at(-1)?.prop || null;
  }, [getRenderableStoryProps]);

  // All props under the cursor, top-most first (so [0] matches the single-pick default
  // above). Lets Tab cycle through every stacked prop, not just the top one.
  const findAllEditableStoryPropsAt = useCallback((screenX, screenY) => {
    const current = stateRef.current;
    const cameraX = Number.isFinite(current.cameraX) ? current.cameraX : 0;
    return getRenderableStoryProps(current)
      .map((prop, index) => ({
        prop,
        index,
        bounds: getStoryPropEditorBounds(prop, cameraX, current),
      }))
      .filter(({ bounds }) => (
        screenX >= bounds.x
        && screenX <= bounds.x + bounds.width
        && screenY >= bounds.y
        && screenY <= bounds.y + bounds.height
      ))
      .sort((a, b) => {
        const depthDelta = (STORY_PROP_DEPTH_ORDER[a.bounds.depth] || 0) - (STORY_PROP_DEPTH_ORDER[b.bounds.depth] || 0);
        if (depthDelta !== 0) return depthDelta;
        const zDelta = (Number(a.prop.zIndex) || 0) - (Number(b.prop.zIndex) || 0);
        if (zDelta !== 0) return zDelta;
        const areaDelta = (b.bounds.width * b.bounds.height) - (a.bounds.width * a.bounds.height);
        if (areaDelta !== 0) return areaDelta;
        return a.index - b.index;
      })
      .reverse()
      .map(({ prop }) => prop);
  }, [getRenderableStoryProps]);

  // --- Editor hover: preview what a click will select (plain label) and let Tab cycle
  // through entities stacked under the cursor. Shared by the overlay + pointer/key handlers. ---
  const getEditorEntityBounds = useCallback((descriptor, cameraX, current) => {
    if (!descriptor) return null;
    const { kind, entity } = descriptor;
    switch (kind) {
      case 'hazard': return getHazardEditorBounds(entity, cameraX);
      case 'lair': return getLairEditorBounds(entity, cameraX);
      case 'nest': return getNestEditorBounds(entity, cameraX);
      case 'checkpoint': return getCheckpointEditorBounds(entity, cameraX);
      case 'arch': return getArchEditorBounds(entity, cameraX);
      case 'platform': return getPlatformEditorBounds(entity, cameraX, current);
      case 'prop': return getStoryPropEditorBounds(entity, cameraX, current);
      default: return null;
    }
  }, [getArchEditorBounds, getCheckpointEditorBounds, getHazardEditorBounds, getLairEditorBounds, getNestEditorBounds, getPlatformEditorBounds]);

  const getEditorEntityLabel = useCallback((descriptor) => {
    if (!descriptor) return '';
    const { kind, entity } = descriptor;
    switch (kind) {
      case 'hazard': return `${JOURNEY_TRAP_TYPES[entity.type]?.label || entity.name || 'Trap'} — trap`;
      case 'lair': return `${entity.name || 'Scarab Lair'} — boss lair`;
      case 'nest': return `${entity.name || 'Scorpion Nest'} — spawner`;
      case 'checkpoint': return `${entity.name || 'Checkpoint'} — checkpoint`;
      case 'arch': return entity.editorKind === 'doorway' ? 'Doorway — gate' : 'Route Gate — gate';
      case 'platform': return descriptor.floor ? 'Floor — collision' : `${entity.label || entity.id || 'Platform'} — platform`;
      case 'prop': return `${entity.name || entity.category || 'Prop'} — prop${entity.id ? ` · ${entity.id}` : ''}`;
      default: return '';
    }
  }, []);

  const buildEditorHoverStack = useCallback((screenX, screenY) => {
    const editor = propPlacementEditorRef.current;
    const stack = [];
    const push = (kind, entity, extra = {}) => {
      if (!entity) return;
      const id = entity.id || entity.editorId || entity.label || kind;
      stack.push({ kind, entity, id, ...extra });
    };
    if (editor.floorPickMode) {
      push('platform', findEditablePlatformAt(screenX, screenY, { floorOnly: true }), { floor: true });
      return stack;
    }
    // Same priority order as the click selection cascade so stack[0] === default pick.
    push('hazard', findEditableHazardAt(screenX, screenY));
    push('lair', findEditableScarabLairAt(screenX, screenY));
    push('nest', findEditableNestAt(screenX, screenY));
    push('checkpoint', findEditableCheckpointAt(screenX, screenY));
    push('arch', findEditableArchAt(screenX, screenY));
    push('platform', findEditablePlatformAt(screenX, screenY, { includeFloors: false }));
    // Every prop under the cursor (top-most first), so Tab reaches stacked props.
    findAllEditableStoryPropsAt(screenX, screenY).forEach(prop => push('prop', prop));
    push('platform', findEditablePlatformAt(screenX, screenY, { floorOnly: true }), { floor: true });
    return stack;
  }, [findAllEditableStoryPropsAt, findEditableArchAt, findEditableCheckpointAt, findEditableHazardAt, findEditableNestAt, findEditablePlatformAt, findEditableScarabLairAt]);

  const updateEditorHover = useCallback((screenX, screenY) => {
    const editor = propPlacementEditorRef.current;
    const stack = buildEditorHoverStack(screenX, screenY);
    const signature = stack.map(d => `${d.kind}:${d.id}`).join('|');
    const prev = editor.hover;
    // Keep the cycle index while the cursor stays over the same stack; reset otherwise.
    const index = prev && prev.signature === signature
      ? Math.min(prev.index, Math.max(0, stack.length - 1))
      : 0;
    editor.hover = stack.length ? { signature, stack, index, screenX, screenY } : null;
  }, [buildEditorHoverStack]);

  const savePropPlacementExport = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    const current = stateRef.current;
    const roomId = getActivePropEditorRoomId(current);
    const roomProps = getAllPropEditorStoryProps()
      .filter(prop => getJourneyPropRoomId(prop, getJourneySceneId(current), current.currentSectionId) === roomId)
      .map(prop => getEditedStoryProp(prop))
      .filter(Boolean);
    const roomPlatforms = getAllPropEditorPlatforms()
      .filter(platform => getPlatformEditorRoomId(platform, current) === roomId)
      .map(platform => getEditedPlatform(platform))
      .filter(platform => platform?.id);
    const roomHazards = getAllPropEditorHazards()
      .filter(hazard => getHazardEditorRoomId(hazard, current) === roomId)
      .map(hazard => getEditedHazard(hazard))
      .filter(hazard => hazard?.id);
    const roomRouteGates = getRenderableRouteGates()
      .filter(gate => getSectionForX(Number(gate.x) || 0)?.id === roomId);
    const roomRouteGateDoorways = getRenderableRouteGateDoorways()
      .filter(doorway => getSectionForX(Number.isFinite(doorway.anchorX) ? doorway.anchorX : doorway.blockX || 0)?.id === roomId);
    const roomCheckpoints = getRenderableCheckpoints()
      .filter(checkpoint => getSectionForX(Number(checkpoint.x) || 0)?.id === roomId);
    const roomEnemies = getRenderableScorpionNests()
      .map((enemy) => {
        const params = getEditedNestParams(enemy);
        return {
          id: enemy.id,
          sectionId: enemy.sectionId || getSectionForX(Number(params.x) || 0)?.id || roomId,
          x: Math.round(params.x),
          y: Math.round(params.y),
          width: Math.round(Number(enemy.width) || 1),
          height: Math.round(Number(enemy.height) || 1),
          widthScale: Number(params.widthScale.toFixed(2)),
          yOffset: Math.round(params.yOffset),
          glowYFactor: Number(params.glowYFactor.toFixed(2)),
          glowSize: Number(params.glowSize.toFixed(2)),
        };
      })
      .filter(enemy => enemy?.id && enemy.sectionId === roomId);
    const roomMiniBosses = getJourneyMiniBosses(targetCivilisation)
      .map(boss => getEditedMiniBoss(boss))
      .filter(boss => boss?.id && (boss.sectionId || getSectionForX(Number(boss.x) || 0)?.id) === roomId);
    editor.exportText = createJourneyPropPlacementExport({
      roomId,
      props: roomProps,
      deletedPropIds: [...editor.deletedIds].filter((propId) => {
        const prop = getPropEditorBasePropById(propId);
        return prop && getJourneyPropRoomId(prop, getJourneySceneId(current), current.currentSectionId) === roomId;
      }),
      platforms: roomPlatforms,
      deletedPlatformIds: [...editor.deletedPlatformIds].filter((platformId) => {
        const platform = getPlatformEditorBasePlatformById(platformId);
        return platform && getPlatformEditorRoomId(platform, current) === roomId;
      }),
      hazards: roomHazards,
      deletedHazardIds: [...editor.deletedHazardIds].filter((hazardId) => {
        const hazard = getHazardEditorBaseHazardById(hazardId);
        return hazard && getHazardEditorRoomId(hazard, current) === roomId;
      }),
      routeGates: roomRouteGates,
      routeGateDoorways: roomRouteGateDoorways,
      checkpoints: roomCheckpoints,
      enemies: roomEnemies,
      miniBosses: roomMiniBosses,
    });
    editor.aiInstructions = createJourneyPlacementAiInstructions(editor, { roomId });
    editor.exportVisible = true;
    editor.savedAt = new Date().toLocaleTimeString();
    refreshPropEditorUi();
  }, [getActivePropEditorRoomId, getAllPropEditorHazards, getAllPropEditorPlatforms, getAllPropEditorStoryProps, getEditedHazard, getEditedMiniBoss, getEditedNestParams, getEditedPlatform, getEditedStoryProp, getHazardEditorBaseHazardById, getHazardEditorRoomId, getPlatformEditorBasePlatformById, getPlatformEditorRoomId, getPropEditorBasePropById, getRenderableCheckpoints, getRenderableRouteGateDoorways, getRenderableRouteGates, getRenderableScorpionNests, refreshPropEditorUi, targetCivilisation]);

  // Closes the save loop: build the same per-room export, then POST it to the DEV-only
  // Vite endpoint that rewrites journeyPlacementOverrides.generated.js in place — no more
  // copy-JSON-then-run-npm step. No-op outside `npm run dev`.
  const writeJourneyOverridesToSource = useCallback(async () => {
    if (!import.meta.env.DEV) return;
    const editor = propPlacementEditorRef.current;
    savePropPlacementExport();
    const payload = editor.exportText;
    editor.writeStatus = { state: 'writing', message: 'Writing to source…' };
    refreshPropEditorUi();
    try {
      const response = await fetch('/__journey/write-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.ok) {
        const savedCounts = [
          result.props ? `${result.props} prop(s)` : null,
          result.enemies ? `${result.enemies} enemy(s)` : null,
        ].filter(Boolean).join(' + ') || '0 item(s)';
        editor.writeStatus = {
          state: 'ok',
          message: `Saved to source · ${savedCounts} · editor draft cleared`,
          at: new Date().toLocaleTimeString(),
        };
        clearPropEditorDraftLayer();
      } else {
        editor.writeStatus = {
          state: 'error',
          message: result.error || `Write failed (HTTP ${response.status})`,
          at: new Date().toLocaleTimeString(),
        };
      }
    } catch (error) {
      editor.writeStatus = {
        state: 'error',
        message: `Write failed: ${error.message}`,
        at: new Date().toLocaleTimeString(),
      };
    }
    refreshPropEditorUi();
  }, [clearPropEditorDraftLayer, refreshPropEditorUi, savePropPlacementExport]);

  const deleteSelectedPropFromEditor = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    if (isEditorLockKeyLocked(getSelectedEditorLockKey())) {
      editor.dragging = null;
      refreshPropEditorUi();
      return;
    }
    const selectedId = editor.selectedPropId;
    if (selectedId) {
      const selectedProp = getPropEditorSelectedProp();
      if (!selectedProp) return;
      const confirmed = window.confirm(`Delete prop "${selectedProp.id}" from ${getJourneyPropRoomId(selectedProp, getJourneySceneId(stateRef.current), stateRef.current.currentSectionId)}?`);
      if (!confirmed) return;
      const createdIndex = editor.createdProps.findIndex(prop => prop.id === selectedId);
      const sourcePropExists = STORY_PROPS.some(prop => prop.id === selectedId);
      if (createdIndex >= 0) {
        editor.createdProps.splice(createdIndex, 1);
      }
      if (sourcePropExists || createdIndex < 0) {
        editor.deletedIds.add(selectedId);
      }
      delete editor.edits[selectedId];
      editor.selectedPropId = null;
      editor.dragging = null;
      refreshPropEditorUi();
      return;
    }
    const selectedPlatform = getPropEditorSelectedPlatform();
    const platformId = selectedPlatform?.id || selectedPlatform?.label;
    if (platformId) {
      const confirmed = window.confirm(`Delete platform "${platformId}" from ${getPlatformEditorRoomId(selectedPlatform, stateRef.current)}?`);
      if (!confirmed) return;
      const createdIndex = editor.createdPlatforms.findIndex(platform => (platform.id || platform.label) === platformId);
      if (createdIndex >= 0) {
        editor.createdPlatforms.splice(createdIndex, 1);
      } else {
        editor.deletedPlatformIds.add(platformId);
      }
      delete editor.platformEdits[platformId];
      editor.selectedPlatformId = null;
      editor.dragging = null;
      refreshPropEditorUi();
      return;
    }
    const selectedHazard = getPropEditorSelectedHazard();
    if (selectedHazard?.id) {
      const confirmed = window.confirm(`Delete trap "${selectedHazard.id}" from ${getHazardEditorRoomId(selectedHazard, stateRef.current)}?`);
      if (!confirmed) return;
      const createdIndex = editor.createdHazards.findIndex(hazard => hazard.id === selectedHazard.id);
      if (createdIndex >= 0) {
        editor.createdHazards.splice(createdIndex, 1);
      } else {
        editor.deletedHazardIds.add(selectedHazard.id);
      }
      delete editor.hazardEdits[selectedHazard.id];
      editor.selectedHazardId = null;
      editor.dragging = null;
      refreshPropEditorUi();
    }
  }, [getHazardEditorRoomId, getPlatformEditorRoomId, getPropEditorSelectedHazard, getPropEditorSelectedPlatform, getPropEditorSelectedProp, getSelectedEditorLockKey, isEditorLockKeyLocked, refreshPropEditorUi]);

  const getPropEditorExistingIds = useCallback(() => getAllPropEditorStoryProps().map(prop => prop.id), [getAllPropEditorStoryProps]);

  const getHazardEditorExistingIds = useCallback(() => getAllPropEditorHazards().map(hazard => hazard.id), [getAllPropEditorHazards]);

  const getPlatformEditorExistingIds = useCallback(() => (
    getAllPropEditorPlatforms().map(platform => platform.id || platform.label).filter(Boolean)
  ), [getAllPropEditorPlatforms]);

  const getGroundAwareStoryPropEditorEdit = useCallback((prop, edit = {}) => {
    const nextEdit = { ...edit };
    if (!Number.isFinite(edit.y)) return nextEdit;
    const nextProp = { ...prop, ...edit };
    const nextSize = getStoryPropEditorSize(nextProp);
    const explicitGroundY = getStoryPropExplicitGroundY(nextSize);
    if (Number.isFinite(explicitGroundY)) {
      nextEdit.yOffset = Math.round(edit.y - explicitGroundY);
    }
    return nextEdit;
  }, []);

  const updateSelectedPropEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    if (isEditorEntityLocked('prop', selectedProp.id)) return;
    const nextEdit = getGroundAwareStoryPropEditorEdit(selectedProp, edit);
    editor.edits[selectedProp.id] = {
      ...(editor.edits[selectedProp.id] || {}),
      ...nextEdit,
    };
    refreshPropEditorUi();
  }, [getGroundAwareStoryPropEditorEdit, getPropEditorSelectedProp, isEditorEntityLocked, refreshPropEditorUi]);

  // Reorder the selected prop within its depth band. Props only stack against other
  // props in the SAME depth (background/midground/grounded/route-edge/foreground-occluder);
  // zIndex is the tie-breaker inside a band, so front/back compute against same-band siblings.
  const nudgeSelectedPropZOrder = useCallback((mode) => {
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    if (isEditorEntityLocked('prop', selectedProp.id)) return;
    const depth = getStoryPropDepth(selectedProp);
    const currentZ = Number.isFinite(Number(selectedProp.zIndex)) ? Number(selectedProp.zIndex) : 0;
    const siblingZ = getRenderableStoryProps()
      .filter(prop => prop.id !== selectedProp.id && getStoryPropDepth(prop) === depth)
      .map(prop => (Number.isFinite(Number(prop.zIndex)) ? Number(prop.zIndex) : 0));
    const maxZ = siblingZ.length ? Math.max(...siblingZ) : currentZ;
    const minZ = siblingZ.length ? Math.min(...siblingZ) : currentZ;
    const nextZ = mode === 'front' ? maxZ + 1
      : mode === 'back' ? minZ - 1
      : mode === 'forward' ? currentZ + 1
      : mode === 'backward' ? currentZ - 1
      : currentZ;
    updateSelectedPropEditorTransform({ zIndex: Math.round(nextZ) });
  }, [getPropEditorSelectedProp, getRenderableStoryProps, isEditorEntityLocked, updateSelectedPropEditorTransform]);

  // Copy the selected prop's colour look (grade + brightness) so it can be stamped
  // onto other props — speeds up keeping a whole scene's props tonally consistent.
  const copySelectedPropLook = useCallback(() => {
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    const editor = propPlacementEditorRef.current;
    editor.copiedLook = {
      colorGradeFilter: typeof selectedProp.colorGradeFilter === 'string' ? selectedProp.colorGradeFilter : '',
      brightness: Number.isFinite(selectedProp.brightness) ? selectedProp.brightness : 1,
      tintColor: typeof selectedProp.tintColor === 'string' ? selectedProp.tintColor : '',
      tintStrength: Number.isFinite(selectedProp.tintStrength) ? selectedProp.tintStrength : 0,
      paintColor: typeof selectedProp.paintColor === 'string' ? selectedProp.paintColor : '',
      paintStrength: Number.isFinite(selectedProp.paintStrength) ? selectedProp.paintStrength : 0,
    };
    refreshPropEditorUi();
  }, [getPropEditorSelectedProp, refreshPropEditorUi]);

  const pasteSelectedPropLook = useCallback(() => {
    const look = propPlacementEditorRef.current.copiedLook;
    if (!look) return;
    updateSelectedPropEditorTransform({
      colorGradeFilter: look.colorGradeFilter,
      brightness: look.brightness,
      ...(typeof look.tintColor === 'string' && look.tintColor ? { tintColor: look.tintColor } : {}),
      tintStrength: Number.isFinite(look.tintStrength) ? look.tintStrength : 0,
      ...(typeof look.paintColor === 'string' && look.paintColor ? { paintColor: look.paintColor } : {}),
      paintStrength: Number.isFinite(look.paintStrength) ? look.paintStrength : 0,
    });
  }, [updateSelectedPropEditorTransform]);

  // One-click golden-hour blend: applies the desaturate/warm/dim recipe + a soft
  // grounding shadow so a "pasted-looking" prop settles into the desert scene.
  const blendSelectedPropIntoScene = useCallback(() => {
    updateSelectedPropEditorTransform({ ...JOURNEY_PROP_SCENE_BLEND_RECIPE });
  }, [updateSelectedPropEditorTransform]);

  const updateSelectedPropEditorField = useCallback((field, value) => {
    const editor = propPlacementEditorRef.current;
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    editor.edits[selectedProp.id] = {
      ...(editor.edits[selectedProp.id] || {}),
      [field]: value,
    };
    // Controlled inputs (colour sliders) need the snapshot rebuilt so the new
    // value flows back to them; uncontrolled inputs are unaffected by the refresh.
    refreshPropEditorUi();
  }, [getPropEditorSelectedProp, refreshPropEditorUi]);

  const updateSelectedPropEditorNumberField = useCallback((field, value, {
    min = -Infinity,
    max = Infinity,
    round = false,
    decimals = null,
  } = {}) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;
    const clampedValue = clamp(numericValue, min, max);
    const nextValue = round
      ? Math.round(clampedValue)
      : decimals !== null
        ? Number(clampedValue.toFixed(decimals))
        : clampedValue;
    updateSelectedPropEditorField(field, nextValue);
  }, [updateSelectedPropEditorField]);

  const updateSelectedPropGroundContactLayer = useCallback((index, edit = {}) => {
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    const currentLayers = selectedProp.groundContactLayer || [];
    const nextLayers = [...currentLayers];
    if (index >= nextLayers.length) {
      nextLayers.push({
        assetKey: 'premiumSmallStoneScatter',
        layer: 'overlay',
        xRatio: 0.5,
        widthRatio: 0.24,
        height: 28,
        yOffset: -42,
        rotation: 0,
        alpha: 0.48,
        mirrorX: false,
        filter: 'sepia(0%) saturate(104%) brightness(96%) contrast(98%)',
      });
    }
    nextLayers[index] = { ...nextLayers[index], ...edit };
    updateSelectedPropEditorField('groundContactLayer', nextLayers);
    refreshPropEditorUi();
  }, [getPropEditorSelectedProp, refreshPropEditorUi, updateSelectedPropEditorField]);

  const removeSelectedPropGroundContactLayer = useCallback((index) => {
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    const currentLayers = selectedProp.groundContactLayer || [];
    const nextLayers = currentLayers.filter((_, i) => i !== index);
    updateSelectedPropEditorField('groundContactLayer', nextLayers);
    refreshPropEditorUi();
  }, [getPropEditorSelectedProp, refreshPropEditorUi, updateSelectedPropEditorField]);

  const updateSelectedPlatformEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedPlatform = getPropEditorSelectedPlatform();
    const platformId = selectedPlatform?.id || selectedPlatform?.label;
    if (!platformId) return;
    if (isEditorEntityLocked('platform', platformId)) return;
    editor.platformEdits[platformId] = {
      ...(editor.platformEdits[platformId] || {}),
      ...edit,
    };
    refreshPropEditorUi();
  }, [getPropEditorSelectedPlatform, isEditorEntityLocked, refreshPropEditorUi]);

  const updateSelectedHazardEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedHazard = getPropEditorSelectedHazard();
    if (!selectedHazard?.id) return;
    if (isEditorEntityLocked('hazard', selectedHazard.id)) return;
    editor.hazardEdits[selectedHazard.id] = {
      ...(editor.hazardEdits[selectedHazard.id] || {}),
      ...edit,
    };
    refreshPropEditorUi();
  }, [getPropEditorSelectedHazard, isEditorEntityLocked, refreshPropEditorUi]);

  const updateSelectedArchEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedArch = getPropEditorSelectedArch();
    if (!selectedArch?.id) return;
    if (isEditorEntityLocked('arch', selectedArch.editorId)) return;
    if (selectedArch.editorKind === 'doorway') {
      editor.routeGateDoorwayEdits[selectedArch.id] = {
        ...(editor.routeGateDoorwayEdits[selectedArch.id] || {}),
        ...edit,
      };
    } else {
      editor.routeGateEdits[selectedArch.id] = {
        ...(editor.routeGateEdits[selectedArch.id] || {}),
        ...edit,
      };
    }
    refreshPropEditorUi();
  }, [getPropEditorSelectedArch, isEditorEntityLocked, refreshPropEditorUi]);

  const updateSelectedCheckpointEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedCheckpoint = getPropEditorSelectedCheckpoint();
    if (!selectedCheckpoint?.id) return;
    if (isEditorEntityLocked('checkpoint', selectedCheckpoint.id)) return;
    editor.checkpointEdits[selectedCheckpoint.id] = {
      ...(editor.checkpointEdits[selectedCheckpoint.id] || {}),
      ...edit,
    };
    refreshPropEditorUi();
  }, [getPropEditorSelectedCheckpoint, isEditorEntityLocked, refreshPropEditorUi]);

  const updateSelectedLairEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedLair = getPropEditorSelectedLair();
    if (!selectedLair?.id) return;
    if (isEditorEntityLocked('lair', selectedLair.id)) return;
    editor.miniBossEdits[selectedLair.id] = {
      ...(editor.miniBossEdits[selectedLair.id] || {}),
      ...edit,
    };
    refreshPropEditorUi();
  }, [getPropEditorSelectedLair, isEditorEntityLocked, refreshPropEditorUi]);

  const updateSelectedNestEditorTransform = useCallback((edit) => {
    const editor = propPlacementEditorRef.current;
    const selectedNest = getPropEditorSelectedNest();
    if (!selectedNest?.id) return;
    if (isEditorEntityLocked('nest', selectedNest.id)) return;
    editor.scorpionNestEdits[selectedNest.id] = {
      ...(editor.scorpionNestEdits[selectedNest.id] || {}),
      ...edit,
    };
    refreshPropEditorUi();
  }, [getPropEditorSelectedNest, isEditorEntityLocked, refreshPropEditorUi]);

  const resetSelectedNestEditor = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    const selectedNest = getPropEditorSelectedNest();
    if (!selectedNest?.id) return;
    if (isEditorEntityLocked('nest', selectedNest.id)) return;
    delete editor.scorpionNestEdits[selectedNest.id];
    refreshPropEditorUi();
  }, [getPropEditorSelectedNest, isEditorEntityLocked, refreshPropEditorUi]);

  const duplicateSelectedPropInEditor = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    const selectedProp = getPropEditorSelectedProp();
    if (!selectedProp) return;
    if (isEditorEntityLocked('prop', selectedProp.id)) return;
    const duplicate = duplicateJourneyPropForEditor({
      prop: selectedProp,
      existingIds: getPropEditorExistingIds(),
    });
    editor.createdProps.push(duplicate);
    editor.selectedPropId = duplicate.id;
    editor.selectedPlatformId = null;
    editor.selectedHazardId = null;
    editor.selectedArchId = null;
    editor.selectedCheckpointId = null;
    editor.selectedLairId = null;
    editor.selectedNestId = null;
    editor.edits[duplicate.id] = {};
    editor.deletedIds.delete(duplicate.id);
    editor.paletteOpen = false;
    refreshPropEditorUi();
  }, [getPropEditorExistingIds, getPropEditorSelectedProp, isEditorEntityLocked, refreshPropEditorUi]);

  const createPropFromEditorPalette = useCallback((pointer) => {
    const editor = propPlacementEditorRef.current;
    const propPaletteSource = editor.selectedPaletteCategory === 'ground-detail'
      ? groundDetailsEditorPalette
      : editor.selectedPaletteCategory === 'foreground-detail'
        ? foregroundDetailsEditorPalette
      : editor.selectedPaletteCategory === 'shard-prop'
        ? shardPropsEditorPalette
      : propEditorPalette;
    const paletteItem = propPaletteSource.find(item => item.key === editor.selectedPaletteKey);
    if (!paletteItem) return null;
    const roomId = getActivePropEditorRoomId(stateRef.current);
    const nextProp = createJourneyPropFromPaletteItem({
      paletteItem,
      roomId,
      x: editor.gridSnap ? snapJourneyPropCoordinate(pointer.worldX, editor.gridSize) : Math.round(pointer.worldX),
      y: editor.gridSnap ? snapJourneyPropCoordinate(pointer.worldY, editor.gridSize) : Math.round(pointer.worldY),
      existingIds: getPropEditorExistingIds(),
    });
    Object.assign(nextProp, getGroundAwareStoryPropEditorEdit(nextProp, { y: nextProp.y }));
    editor.createdProps.push(nextProp);
    editor.selectedPropId = nextProp.id;
    editor.selectedPlatformId = null;
    editor.selectedHazardId = null;
    editor.selectedArchId = null;
    editor.selectedCheckpointId = null;
    editor.selectedLairId = null;
    editor.selectedNestId = null;
    editor.recentPaletteKeys = [
      { key: paletteItem.key, category: editor.selectedPaletteCategory },
      ...(editor.recentPaletteKeys || []).filter(r => r.key !== paletteItem.key),
    ].slice(0, 8);
    if (!editor.stampMode) {
      editor.selectedPaletteKey = null;
      editor.paletteOpen = false;
    }
    editor.deletedIds.delete(nextProp.id);
    refreshPropEditorUi();
    return nextProp;
  }, [getActivePropEditorRoomId, getGroundAwareStoryPropEditorEdit, getPropEditorExistingIds, foregroundDetailsEditorPalette, groundDetailsEditorPalette, propEditorPalette, refreshPropEditorUi, shardPropsEditorPalette]);

  const createTrapFromEditorPalette = useCallback((pointer) => {
    const editor = propPlacementEditorRef.current;
    const paletteItem = trapEditorPalette.find(item => item.key === editor.selectedPaletteKey);
    if (!paletteItem) return null;
    const roomId = getActivePropEditorRoomId(stateRef.current);
    const nextTrap = createJourneyTrapFromPaletteItem({
      paletteItem,
      roomId,
      x: editor.gridSnap ? snapJourneyPropCoordinate(pointer.worldX, editor.gridSize) : Math.round(pointer.worldX),
      y: editor.gridSnap ? snapJourneyPropCoordinate(pointer.worldY, editor.gridSize) : Math.round(pointer.worldY),
      existingIds: getHazardEditorExistingIds(),
    });
    editor.createdHazards.push(nextTrap);
    editor.selectedPropId = null;
    editor.selectedPlatformId = null;
    editor.selectedHazardId = nextTrap.id;
    editor.selectedArchId = null;
    editor.selectedCheckpointId = null;
    editor.selectedLairId = null;
    editor.selectedNestId = null;
    editor.recentPaletteKeys = [
      { key: paletteItem.key, category: 'trap' },
      ...(editor.recentPaletteKeys || []).filter(r => r.key !== paletteItem.key),
    ].slice(0, 8);
    if (!editor.stampMode) {
      editor.selectedPaletteKey = null;
      editor.paletteOpen = false;
    }
    editor.deletedHazardIds.delete(nextTrap.id);
    refreshPropEditorUi();
    return nextTrap;
  }, [getActivePropEditorRoomId, getHazardEditorExistingIds, refreshPropEditorUi, trapEditorPalette]);

  const createPlatformFromEditorPalette = useCallback((pointer) => {
    const editor = propPlacementEditorRef.current;
    const paletteItem = platformEditorPalette.find(item => item.key === editor.selectedPaletteKey);
    if (!paletteItem) return null;
    const roomId = getActivePropEditorRoomId(stateRef.current);
    const nextPlatform = createJourneyPlatformFromPaletteItem({
      paletteItem,
      roomId,
      x: editor.gridSnap ? snapJourneyPropCoordinate(pointer.worldX, editor.gridSize) : Math.round(pointer.worldX),
      y: editor.gridSnap ? snapJourneyPropCoordinate(pointer.worldY, editor.gridSize) : Math.round(pointer.worldY),
      existingIds: getPlatformEditorExistingIds(),
    });
    editor.createdPlatforms.push(nextPlatform);
    editor.selectedPropId = null;
    editor.selectedPlatformId = nextPlatform.id || nextPlatform.label;
    editor.selectedHazardId = null;
    editor.selectedArchId = null;
    editor.selectedCheckpointId = null;
    editor.selectedLairId = null;
    editor.selectedNestId = null;
    editor.recentPaletteKeys = [
      { key: paletteItem.key, category: 'platform' },
      ...(editor.recentPaletteKeys || []).filter(r => r.key !== paletteItem.key),
    ].slice(0, 8);
    if (!editor.stampMode) {
      editor.selectedPaletteKey = null;
      editor.paletteOpen = false;
    }
    editor.deletedPlatformIds.delete(nextPlatform.id || nextPlatform.label);
    refreshPropEditorUi();
    return nextPlatform;
  }, [getActivePropEditorRoomId, getPlatformEditorExistingIds, platformEditorPalette, refreshPropEditorUi]);

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
      playerComboSlashEffectRef.current = { image, loaded: true, failed: false, version: PLAYER_COMBO_SLASH_EFFECT_VERSION };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      playerComboSlashEffectRef.current = { image: null, loaded: false, failed: true, version: PLAYER_COMBO_SLASH_EFFECT_VERSION };
    };
    image.src = `${import.meta.env.BASE_URL}${PLAYER_COMBO_SLASH_EFFECT_SRC}?v=${PLAYER_COMBO_SLASH_EFFECT_VERSION}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      scorpionVenomSpitEffectRef.current = { image, loaded: true, failed: false, version: SCORPION_VENOM_SPIT_EFFECT_VERSION };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      scorpionVenomSpitEffectRef.current = { image: null, loaded: false, failed: true, version: SCORPION_VENOM_SPIT_EFFECT_VERSION };
    };
    image.src = `${import.meta.env.BASE_URL}${SCORPION_VENOM_SPIT_EFFECT_SRC}?v=${SCORPION_VENOM_SPIT_EFFECT_VERSION}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const loadArrivalThresholdImage = (src, ref) => {
      const image = new Image();
      image.onload = () => {
        if (cancelled) return;
        ref.current = {
          image,
          loaded: true,
          failed: false,
          version: ARRIVAL_THRESHOLD_ASSET_VERSION,
        };
        syncHud();
      };
      image.onerror = () => {
        if (cancelled) return;
        ref.current = {
          image: null,
          loaded: false,
          failed: true,
          version: ARRIVAL_THRESHOLD_ASSET_VERSION,
        };
      };
      image.src = `${import.meta.env.BASE_URL}${src}?v=${ARRIVAL_THRESHOLD_ASSET_VERSION}`;
    };
    loadArrivalThresholdImage(ARRIVAL_THRESHOLD_BACKGROUND_SRC, arrivalThresholdBackgroundRef);
    loadArrivalThresholdImage(ARRIVAL_THRESHOLD_DUAT_ECHO_SRC, arrivalThresholdDuatEchoRef);
    loadArrivalThresholdImage(ARRIVAL_THRESHOLD_DOORWAY_GLOW_SRC, arrivalThresholdDoorwayGlowRef);
    loadArrivalThresholdImage(ARRIVAL_THRESHOLD_DOORWAY_OCCLUDER_SRC, arrivalThresholdDoorwayOccluderRef);
    loadArrivalThresholdImage(ARRIVAL_THRESHOLD_SEAL_VEIL_SRC, arrivalThresholdSealVeilRef);
    loadArrivalThresholdImage(ARRIVAL_THRESHOLD_AWAKENED_SRC, arrivalThresholdAwakenedRef);
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const loadImage = (src) => {
      const img = new Image();
      img.src = `${import.meta.env.BASE_URL}${src}?v=${LOST_BRIDGE_ASSET_VERSION}`;
      return img;
    };
    Object.entries(LOST_BRIDGE_PIECE_SRCS).forEach(([key, src]) => {
      const img = loadImage(src);
      img.onload = () => { if (!cancelled) { lostBridgeAssetsRef.current.images[key] = img; syncHud(); } };
    });
    const structure = loadImage(LOST_BRIDGE_STRUCTURE_SRC);
    structure.onload = () => { if (!cancelled) { lostBridgeAssetsRef.current.structure = structure; syncHud(); } };
    Object.entries(LOST_BRIDGE_RAVINE_FLOOR_VARIANT_SRCS).forEach(([assetKey, src]) => {
      const floorBlend = loadImage(src);
      floorBlend.onload = () => {
        if (cancelled) return;
        lostBridgeAssetsRef.current.floorBlends[assetKey] = floorBlend;
        lostBridgeAssetsRef.current.floorBlends[src] = floorBlend;
        if (assetKey === 'lostBridgeRavineFloor') {
          lostBridgeAssetsRef.current.floorBlend = floorBlend;
        }
        syncHud();
      };
    });
    return () => { cancelled = true; };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      playerFinisherSlashEffectRef.current = { image, loaded: true, failed: false, version: PLAYER_FINISHER_SLASH_EFFECT_VERSION };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      playerFinisherSlashEffectRef.current = { image: null, loaded: false, failed: true, version: PLAYER_FINISHER_SLASH_EFFECT_VERSION };
    };
    image.src = `${import.meta.env.BASE_URL}${PLAYER_FINISHER_SLASH_EFFECT_SRC}?v=${PLAYER_FINISHER_SLASH_EFFECT_VERSION}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

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
      mummificationChamberInteriorRef.current = {
        image,
        loaded: true,
        failed: false,
        version: MUMMIFICATION_CHAMBER_INTERIOR_VERSION,
      };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      mummificationChamberInteriorRef.current = {
        image: null,
        loaded: false,
        failed: true,
        version: MUMMIFICATION_CHAMBER_INTERIOR_VERSION,
      };
    };
    image.src = `${import.meta.env.BASE_URL}${MUMMIFICATION_CHAMBER_INTERIOR_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      scribeChamberExteriorRef.current = {
        image,
        loaded: true,
        failed: false,
        version: SCRIBE_CHAMBER_EXTERIOR_VERSION,
      };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      scribeChamberExteriorRef.current = {
        image: null,
        loaded: false,
        failed: true,
        version: SCRIBE_CHAMBER_EXTERIOR_VERSION,
      };
    };
    image.src = `${import.meta.env.BASE_URL}${SCRIBE_CHAMBER_EXTERIOR_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      mummificationChamberExteriorRef.current = {
        image,
        loaded: true,
        failed: false,
        version: MUMMIFICATION_CHAMBER_EXTERIOR_VERSION,
      };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      mummificationChamberExteriorRef.current = {
        image: null,
        loaded: false,
        failed: true,
        version: MUMMIFICATION_CHAMBER_EXTERIOR_VERSION,
      };
    };
    image.src = `${import.meta.env.BASE_URL}${MUMMIFICATION_CHAMBER_EXTERIOR_SRC}?v=${MUMMIFICATION_CHAMBER_EXTERIOR_VERSION}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      scarabQueenLairOpeningImageRef.current = { image, loaded: true, failed: false };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      scarabQueenLairOpeningImageRef.current = { image: null, loaded: false, failed: true };
    };
    image.src = `${import.meta.env.BASE_URL}${SCARAB_QUEEN_LAIR_OPENING_IMAGE_SRC}`;
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
      scorpionNestRef.current = {
        image,
        loaded: true,
        failed: false,
        version: SCORPION_NEST_VERSION,
      };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      scorpionNestRef.current = {
        image: null,
        loaded: false,
        failed: true,
        version: SCORPION_NEST_VERSION,
      };
    };
    image.src = `${import.meta.env.BASE_URL}${SCORPION_NEST_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      forgottenMuralChamberRef.current = {
        image,
        loaded: true,
        failed: false,
        version: FORGOTTEN_MURAL_CHAMBER_VERSION,
      };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      forgottenMuralChamberRef.current = {
        image: null,
        loaded: false,
        failed: true,
        version: FORGOTTEN_MURAL_CHAMBER_VERSION,
      };
    };
    image.src = `${import.meta.env.BASE_URL}${FORGOTTEN_MURAL_CHAMBER_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      scribeChamberInteriorRef.current = {
        image,
        loaded: true,
        failed: false,
        version: SCRIBE_CHAMBER_INTERIOR_VERSION,
      };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      scribeChamberInteriorRef.current = {
        image: null,
        loaded: false,
        failed: true,
        version: SCRIBE_CHAMBER_INTERIOR_VERSION,
      };
    };
    image.src = `${import.meta.env.BASE_URL}${SCRIBE_CHAMBER_INTERIOR_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      forgottenMuralHiddenRevealRef.current = {
        image,
        loaded: true,
        failed: false,
        version: FORGOTTEN_MURAL_HIDDEN_MEMORY_REVEAL_VERSION,
      };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      forgottenMuralHiddenRevealRef.current = {
        image: null,
        loaded: false,
        failed: true,
        version: FORGOTTEN_MURAL_HIDDEN_MEMORY_REVEAL_VERSION,
      };
    };
    image.src = `${import.meta.env.BASE_URL}${FORGOTTEN_MURAL_HIDDEN_MEMORY_REVEAL_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      forgottenMuralAlcoveStructureRef.current = {
        image,
        loaded: true,
        failed: false,
        version: FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_VERSION,
      };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      forgottenMuralAlcoveStructureRef.current = {
        image: null,
        loaded: false,
        failed: true,
        version: FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_VERSION,
      };
    };
    image.src = `${import.meta.env.BASE_URL}${FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_SRC}`;
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
    const loadImg = (src, ref) => {
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        
        // Remove white background programmatically
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Remove solid black or solid white backgrounds
          if ((r < 15 && g < 15 && b < 15) || (r > 245 && g > 245 && b > 245)) {
            data[i + 3] = 0; // Set alpha to 0
          }
        }
        ctx.putImageData(imgData, 0, 0);

        ref.current = { image: canvas, loaded: true, failed: false, version: ROUTE_GATE_ASSET_VERSION };
        syncHud();
      };
      img.onerror = () => {
        if (cancelled) return;
        ref.current = { image: null, loaded: false, failed: true, version: ROUTE_GATE_ASSET_VERSION };
      };
      // Add a cache buster to force the browser to reload the new images
      img.src = `${import.meta.env.BASE_URL}${src}?v=${Date.now()}`;
    };
    loadImg(ROUTE_GATE_FRONT_SRC, routeGateFrontRef);
    loadImg(ROUTE_GATE_BACK_SRC, routeGateBackRef);
    loadImg(ROUTE_GATE_SLAB_SRC, routeGateSlabRef);
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

  const scopedJourneyAssetPacks = useMemo(() => {
    const civStr = String(targetCivilisation || '').toLowerCase();
    const isChinaJourney = civStr.includes('china')
      || environmentPackId === ENVIRONMENT_ASSET_PACK_IDS.CHINA_RIVER_VALLEY
      || backgroundPackId === 'china-river-valley';
    const isRomeJourney = civStr.includes('rome') || backgroundPackId === 'rome';
    const isEgyptJourney = !isChinaJourney && !isRomeJourney;
    return {
      backgroundSectionIds: isRomeJourney
        ? Object.keys(ROME_SECTION_BACKGROUND_PACKS)
        : isChinaJourney
          ? ['china-river-valley']
          : EGYPT_JOURNEY_BACKGROUND_SECTION_IDS,
      enemyPackIds: isRomeJourney
        ? ROME_JOURNEY_ENEMY_SPRITE_PACK_IDS
        : isChinaJourney
          ? CHINA_JOURNEY_ENEMY_SPRITE_PACK_IDS
          : EGYPT_JOURNEY_ENEMY_SPRITE_PACK_IDS,
      bossPackIds: isRomeJourney
        ? ROME_JOURNEY_BOSS_SPRITE_PACK_IDS
        : isChinaJourney
          ? CHINA_JOURNEY_BOSS_SPRITE_PACK_IDS
          : EGYPT_JOURNEY_BOSS_SPRITE_PACK_IDS,
      weaponPackId: isRomeJourney ? 'gladius' : 'khopesh',
      loadEgyptOnlyPacks: isEgyptJourney,
      isEgyptJourney,
      isRomeJourney,
      isChinaJourney,
    };
  }, [backgroundPackId, environmentPackId, targetCivilisation]);

  const currentMusicCue = (() => {
    const current = gameState;
    const section = getSectionForX(current.player.x);
    const activeMiniBoss = current.miniBosses.some(boss => (
      boss.awakened && !boss.defeated && Math.abs(boss.x - current.player.x) < 520
    ));
    if (activeMiniBoss) {
      return scopedJourneyAssetPacks.isChinaJourney ? 'china-boss' : 'boss';
    }
    return SECTION_MUSIC_CUES[section.id] || (scopedJourneyAssetPacks.isChinaJourney ? 'bamboo-forest' : 'desert');
  })();

  const getSectionDisplayName = useCallback((sectionId) => {
    if (sectionId === 'arrival-threshold') return 'Arrival Threshold';
    return SECTION_COPY[sectionId]?.name || SECTIONS.find(s => s.id === sectionId)?.name || sectionId;
  }, []);

  const getSectionDisplayTitle = useCallback((sectionId) => {
    return SECTION_COPY[sectionId]?.title || SECTION_ATMOSPHERES[sectionId]?.title || '';
  }, []);

  // Resolves to the correct opening atmosphere SFX key for the current expedition.
  const openingAtmosphereSfxKey = scopedJourneyAssetPacks.isRomeJourney
    ? 'openingRomeAtmosphere'
    : 'openingThresholdAtmosphere';

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

  // Opening cut-scene voice. Dormant while OPENING_CINEMATIC_VOICE_ENABLED is
  // false, so the intro plays silent-with-subtitles. This is the per-line
  // voiceover seam: each dialogue beat already carries a stable `id` + `at`
  // timestamp, so recorded VO can be triggered here by line id when it's ready
  // (or just flip the constant to re-enable browser TTS).
  useEffect(() => {
    const cinematic = gameState.openingCinematic;
    if (!OPENING_CINEMATIC_VOICE_ENABLED || !cinematic?.speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return undefined;
    const activeLine = getOpeningCinematicLine(cinematic);
    if (!activeLine || spokenOpeningLineRef.current === activeLine.id) return undefined;

    spokenOpeningLineRef.current = activeLine.id;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeLine.text);
    utterance.rate = activeLine.voice === 'guardian' ? 0.78 : 0.95;
    utterance.pitch = activeLine.voice === 'guardian' ? 0.62 : 1.02;
    utterance.volume = activeLine.voice === 'guardian' ? 0.95 : 0.9;
    window.speechSynthesis.speak(utterance);

    return () => window.speechSynthesis.cancel();
  }, [gameState.openingCinematic, gameState.openingCinematic?.activeLineId, gameState.openingCinematic?.speechEnabled]);

  useEffect(() => {
    let cancelled = false;
    const baseUrl = import.meta.env.BASE_URL;
    const {
      atlasPath,
      characterId,
      version,
      fallbackAtlasPath,
      fallbackAtlasVersion,
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

    const getHeroVersionQuery = (heroVersion) => (heroVersion
      ? `?v=${encodeURIComponent(heroVersion)}`
      : '');

    const loadHeroAtlas = (heroAtlasPath, heroCharacterId, heroVersion) => {
      const versionQuery = getHeroVersionQuery(heroVersion);
      return fetch(`${baseUrl}${heroAtlasPath}${versionQuery}`)
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
        image.src = `${baseUrl}${getAtlasImagePath(heroAtlasPath, atlas.image)}${versionQuery}`;
      }));
    };

    if (!atlasPath) {
      loadLegacySprite();
      return () => {
        cancelled = true;
      };
    }

    loadHeroAtlas(atlasPath, characterId, version)
      .catch(() => (fallbackAtlasPath
        ? loadHeroAtlas(fallbackAtlasPath, fallbackCharacterId || characterId, fallbackAtlasVersion)
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

  useEffect(() => {
    if (!scopedJourneyAssetPacks.loadEgyptOnlyPacks) {
      atmosphereEnvironmentAssetsRef.current = createEnvironmentAssetState(ENVIRONMENT_ASSET_PACK_IDS.EGYPT_ATMOSPHERE);
      return undefined;
    }
    return loadEnvironmentAssetPack({
      baseUrl: import.meta.env.BASE_URL,
      packId: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_ATMOSPHERE,
      onUpdate: (assets) => {
        atmosphereEnvironmentAssetsRef.current = assets;
        syncHud();
      },
    });
  }, [scopedJourneyAssetPacks.loadEgyptOnlyPacks, syncHud]);

  useEffect(() => {
    if (!scopedJourneyAssetPacks.loadEgyptOnlyPacks) {
      foregroundDepthEnvironmentAssetsRef.current = createEnvironmentAssetState(ENVIRONMENT_ASSET_PACK_IDS.EGYPT_FOREGROUND_DEPTH);
      return undefined;
    }
    return loadEnvironmentAssetPack({
      baseUrl: import.meta.env.BASE_URL,
      packId: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_FOREGROUND_DEPTH,
      onUpdate: (assets) => {
        foregroundDepthEnvironmentAssetsRef.current = assets;
        syncHud();
      },
    });
  }, [scopedJourneyAssetPacks.loadEgyptOnlyPacks, syncHud]);

  useEffect(() => {
    if (!scopedJourneyAssetPacks.loadEgyptOnlyPacks) {
      premiumGroundContactAssetsRef.current = createEnvironmentAssetState(ENVIRONMENT_ASSET_PACK_IDS.EGYPT_PREMIUM_GROUND_CONTACT);
      return undefined;
    }
    return loadEnvironmentAssetPack({
      baseUrl: import.meta.env.BASE_URL,
      packId: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_PREMIUM_GROUND_CONTACT,
      onUpdate: (assets) => {
        premiumGroundContactAssetsRef.current = assets;
        syncHud();
      },
    });
  }, [scopedJourneyAssetPacks.loadEgyptOnlyPacks, syncHud]);

  useEffect(() => {
    if (!scopedJourneyAssetPacks.loadEgyptOnlyPacks) {
      mummificationInteractionAssetsRef.current = createEnvironmentAssetState(ENVIRONMENT_ASSET_PACK_IDS.MUMMIFICATION_CHAMBER_INTERACTIONS);
      return undefined;
    }
    return loadEnvironmentAssetPack({
      baseUrl: import.meta.env.BASE_URL,
      packId: ENVIRONMENT_ASSET_PACK_IDS.MUMMIFICATION_CHAMBER_INTERACTIONS,
      onUpdate: (assets) => {
        mummificationInteractionAssetsRef.current = assets;
        syncHud();
      },
    });
  }, [scopedJourneyAssetPacks.loadEgyptOnlyPacks, syncHud]);

  useEffect(() => loadDesertBackgroundAssetPack({
    baseUrl: import.meta.env.BASE_URL,
    sectionIds: scopedJourneyAssetPacks.backgroundSectionIds,
    onUpdate: (assets) => {
      desertBackgroundAssetsRef.current = assets;
      syncHud();
    },
  }), [scopedJourneyAssetPacks.backgroundSectionIds, syncHud]);

  useEffect(() => loadDynamicWorldAssetPack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      dynamicWorldAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadEnemySpritePack({
    baseUrl: import.meta.env.BASE_URL,
    packIds: scopedJourneyAssetPacks.enemyPackIds,
    onUpdate: (assets) => {
      enemySpriteAssetsRef.current = assets;
      syncHud();
    },
  }), [scopedJourneyAssetPacks.enemyPackIds, syncHud]);

  useEffect(() => {
    let cleanup = null;
    const timer = window.setTimeout(() => {
      cleanup = loadBossSpritePack({
        baseUrl: import.meta.env.BASE_URL,
        packIds: scopedJourneyAssetPacks.bossPackIds,
        onUpdate: (assets) => {
          bossSpriteAssetsRef.current = assets;
          syncHud();
        },
      });
    }, INITIAL_BOSS_SPRITE_LOAD_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      cleanup?.();
    };
  }, [scopedJourneyAssetPacks.bossPackIds, syncHud]);

  useEffect(() => loadCollectibleSpritePack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      collectibleSpriteAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadPlayerWeaponSpritePack({
    baseUrl: import.meta.env.BASE_URL,
    weaponId: scopedJourneyAssetPacks.weaponPackId,
    onUpdate: (assets) => {
      playerWeaponSpriteRef.current = assets;
      syncHud();
    },
  }), [scopedJourneyAssetPacks.weaponPackId, syncHud]);

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
    current.resources.stamina = Math.max(current.resources.stamina, Math.min(current.upgradeEffects?.maxStamina || 100, 25));
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
    if (challenge.type === 'scribe-chamber-puzzle') {
      challenge.selectedAnswerIndex = answerIndex;
      challenge.feedback = {
        correct,
        message: correct ? SCRIBE_CHAMBER_FEEDBACK.correct : SCRIBE_CHAMBER_FEEDBACK.incorrect,
      };
      challenge.answers = [...(challenge.answers || []), {
        questionId: question.id,
        answerIndex,
        correct,
      }];
      challenge.correctCount = correct ? 1 : 0;
      if (correct) {
        challenge.completed = true;
        challenge.resultMessage = SCRIBE_CHAMBER_FEEDBACK.correct;
        current.scribeChamberPuzzleSolved = true;
        current.scribeChamberExitUnlocked = true;
        current.notice = SCRIBE_CHAMBER_DOOR_OPEN_LINE;
        current.cinematicEvent = {
          id: 'scribe-chamber-door-unlocked',
          name: 'Scribe Chamber Unlocked',
          message: SCRIBE_CHAMBER_DOOR_OPEN_LINE,
          temporary: true,
        };
        current.cinematicTimer = 2.4;
        audioControls?.playLevelUp?.();
      } else {
        current.notice = SCRIBE_CHAMBER_FEEDBACK.incorrect;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.8);
        audioControls?.playError?.();
      }
      syncHud();
      return;
    }
    if (challenge.type === MUMMIFICATION_CHAMBER_PUZZLE.type) {
      current.notice = MUMMIFICATION_CHAMBER_FEEDBACK.incorrect;
      current.activeGuardianChallenge = null;
      current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.6);
      audioControls?.playError?.();
      syncHud();
      return;
    }
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
    if (challenge.type === 'scribe-chamber-puzzle') {
      current.activeGuardianChallenge = null;
      current.notice = challenge.completed
        ? SCRIBE_CHAMBER_DOOR_OPEN_LINE
        : 'The wall is still locked. Compare the tablet and inscription again.';
      syncHud();
      return;
    }
    // mummification-ritual-order-puzzle is handled as an in-world sequence — no continue path needed.
    if (challenge.type === MUMMIFICATION_CHAMBER_PUZZLE.type) {
      current.activeGuardianChallenge = null;
      current.notice = MUMMIFICATION_CHAMBER_FEEDBACK.incorrect;
      syncHud();
      return;
    }
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

  const moveForgottenMuralRelicSlideTile = useCallback((tileIndex) => {
    const current = stateRef.current;
    if (!current.forgottenMuralRelicSlidePuzzleOpen || current.forgottenMuralRelicSlidePuzzleSolved) return;
    const nextTiles = getForgottenMuralRelicSlideMove(current.forgottenMuralRelicSlidePuzzleTiles || [], tileIndex);
    if (!nextTiles) {
      current.notice = 'That relic piece cannot slide from here.';
      current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.1);
      audioControls?.playError?.();
      syncHud();
      return;
    }

    current.forgottenMuralRelicSlidePuzzleTiles = nextTiles;
    current.forgottenMuralRelicSlidePuzzleMoves = (current.forgottenMuralRelicSlidePuzzleMoves || 0) + 1;
    if (isForgottenMuralRelicSlidePuzzleSolved(nextTiles)) {
      current.forgottenMuralRelicSlidePuzzleSolved = true;
      current.forgottenMuralRelicSlidePuzzleOpen = false;
      current.forgottenMuralChamberRestored = true;
      current.notice = 'The scarab settles into place. Something opens behind the wall.';
      current.cinematicEvent = {
        id: 'forgotten-mural-relic-slide-puzzle-solved',
        name: 'Hidden Mural',
        message: 'The Queen is not taking from the dead. She is gathering what remained. This does not show a theft. It shows a rescue.',
        temporary: true,
      };
      current.cinematicTimer = 4.2;
      current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 3.2);
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.05);
      audioControls?.playLevelUp?.();
    } else {
      current.notice = 'The pieces fit, but the story does not.';
      current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 0.85);
      audioControls?.playSuccess?.();
    }
    syncHud();
  }, [audioControls, syncHud]);

  const resetForgottenMuralRelicSlidePuzzle = useCallback(() => {
    const current = stateRef.current;
    if (!current.forgottenMuralRelicSlidePuzzleOpen || current.forgottenMuralRelicSlidePuzzleSolved) return;
    current.forgottenMuralRelicSlidePuzzleTiles = createForgottenMuralRelicSlidePuzzleTiles();
    current.forgottenMuralRelicSlidePuzzleMoves = 0;
    current.notice = 'Asha resets the broken relic pieces.';
    current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.1);
    audioControls?.playExpeditionSfx?.('gateBlocked');
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
    } else if (config.type === 'reach-gate' && config.gateId) {
      count = current.openedRouteGateIds?.has(config.gateId) ? 1 : 0;
    } else if (config.type === 'defeat-boss' && config.bossId) {
      count = current.defeatedMiniBosses?.has(config.bossId) ? 1 : 0;
    }

    const total = Number.isFinite(config.total) ? config.total : 1;
    const itemLabel = config.itemLabel
      || (config.type === 'defeat-boss' ? 'guardian' : 'route step');
    return {
      ...config,
      title: config.title || config.label,
      total,
      itemLabel,
      count,
    };
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
    if (!gate.requires) return reqs;
    const enemiesDisabled = Boolean(current?.enemiesDisabled);
    const isChinaJourney = backgroundPackId === 'china-river-valley';
    const isRomeJourney = backgroundPackId === 'rome'
      || current?.targetCivilisation === 'Ancient Rome'
      || current?.activeCivilisation === 'Ancient Rome';
    const gateHints = isRomeJourney ? ROME_GATE_HINTS : isChinaJourney ? CHINA_GATE_HINTS : GATE_HINTS;
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
        hint: (gateHints.objective[sectionId] || GATE_HINTS.objective[sectionId])
          || 'Search this section for the missing objective marker.',
        targetX: nearest?.x ?? gate.x - 220,
        nearestObjective: nearest,
      });
    }
    if (gate.requires.miniBoss) {
      const boss = current.miniBosses.find(item => item.id === gate.requires.miniBoss);
      const bossName = boss?.name || gate.requires.miniBoss;
      const direction = getDirectionFromPlayer(current.player.x, boss?.x);
      const miniBossMet = enemiesDisabled || current.defeatedMiniBosses.has(gate.requires.miniBoss);
      reqs.push({
        type: 'miniBoss',
        id: gate.requires.miniBoss,
        label: `${bossName}: ${enemiesDisabled ? 'bypassed' : miniBossMet ? 'defeated' : 'active'}`,
        checklistLabel: `${bossName} defeated`,
        shortMissing: enemiesDisabled ? 'enemies disabled for play-test' : `defeat ${bossName}`,
        met: miniBossMet,
        found: miniBossMet ? 1 : 0,
        required: 1,
        hint: enemiesDisabled
          ? 'Enemies are disabled for play-testing; this guardian requirement is bypassed.'
          : `${bossName} is still active ${getDirectionText(direction)}. Watch the warning tell, dodge, then counter.`,
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
      const keyItemMet = enemiesDisabled || collected;
      const targetX = keyItem?.dropped ? keyItem.x : boss?.x;
      const direction = getDirectionFromPlayer(current.player.x, targetX);
      const keyItemCopy = isChinaJourney ? CHINA_BOSS_KEY_ITEM_COPY[gate.requires.keyItem] : null;
      const keyItemName = keyItemCopy?.name || keyItem?.name || 'Key artefact';
      reqs.push({
        type: 'toolPiece',
        id: gate.requires.keyItem,
        label: `${keyItemName}: ${enemiesDisabled && !collected ? 'bypassed' : collected ? 'recovered' : 'needed'}`,
        checklistLabel: keyItemCopy?.checklistLabel || keyItem?.name || 'Tool piece',
        shortMissing: enemiesDisabled ? 'enemies disabled for play-test' : `recover ${keyItemName}`,
        met: keyItemMet,
        found: keyItemMet ? 1 : 0,
        required: 1,
        hint: enemiesDisabled
          ? 'Enemies are disabled for play-testing; this guardian reward requirement is bypassed.'
          : keyItem?.dropped
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
      const missingEnemies = enemiesDisabled
        ? []
        : requiredEnemies.filter(enemy => !current.defeatedEnemies?.has(enemy.id));
      const nearestEnemy = missingEnemies
        .sort((a, b) => Math.abs(a.x - current.player.x) - Math.abs(b.x - current.player.x))[0] || null;
      const direction = getDirectionFromPlayer(current.player.x, nearestEnemy?.x);
      const enemyClearFound = enemiesDisabled ? requiredEnemies.length : requiredEnemies.length - missingEnemies.length;
      reqs.push({
        type: 'enemyClear',
        id: `${gate.id}-route-guards`,
        label: `Route Guards: ${enemyClearFound}/${requiredEnemies.length}`,
        checklistLabel: 'Route Guards defeated',
        shortMissing: enemiesDisabled ? 'enemies disabled for play-test' : `defeat ${missingEnemies.length} route guard${missingEnemies.length === 1 ? '' : 's'}`,
        met: missingEnemies.length === 0,
        found: enemyClearFound,
        required: requiredEnemies.length,
        hint: enemiesDisabled
          ? 'Enemies are disabled for play-testing; route guards are bypassed.'
          : nearestEnemy
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
    if (gate.requires.timelineSequence?.length) {
      const timelineProgress = getTimelineRequirementProgress(gate.requires.timelineSequence, current);
      const missingTimelineIds = new Set(timelineProgress.missingIds);
      const nearestEvidence = RELIC_SHARDS
        .filter(item => (
          item.timelineId
          && missingTimelineIds.has(item.timelineId)
          && !current.collectedShardIds.has(item.id)
          && item.x < gate.x
          && (!item.routeId || current.discoveredHiddenRouteIds?.has(item.routeId))
        ))
        .sort((a, b) => Math.abs(a.x - current.player.x) - Math.abs(b.x - current.player.x))[0];
      const direction = getDirectionFromPlayer(current.player.x, nearestEvidence?.x);
      reqs.push({
        type: 'timeline',
        id: `${gate.id}-rome-timeline`,
        label: `Forum Archive: ${timelineProgress.found}/${timelineProgress.required}`,
        checklistLabel: 'Republic to Empire sequence',
        shortMissing: `restore ${timelineProgress.missingIds.length} more Rome evidence ${timelineProgress.missingIds.length === 1 ? 'piece' : 'pieces'}`,
        met: timelineProgress.complete,
        found: timelineProgress.found,
        required: timelineProgress.required,
        hint: nearestEvidence
          ? `${nearestEvidence.shortName || nearestEvidence.label || 'Evidence'} is ${getDirectionText(direction)}.`
          : 'Recover the missing Rome evidence before forcing the vault.',
        targetX: nearestEvidence?.x,
        nearestObjective: nearestEvidence ? {
          type: 'timeline',
          id: nearestEvidence.id,
          label: nearestEvidence.shortName || nearestEvidence.label || 'Rome evidence',
          x: nearestEvidence.x,
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
        hint: `${gateHints.shards} Look ${getDirectionText(direction)} for the closest shard.`,
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
    const forgottenMuralRestored = Boolean(
      current.forgottenMuralChamberRestored || current.collectedSecretIds?.has('egypt-scarab-fragment-3'),
    );
    const openMessage = gate.id === 'temple-approach-seal'
      ? forgottenMuralRestored
        ? 'You restored what others tried to erase. I saw it. Passage is allowed, not trust.'
        : 'You pass my seals, but I still see only an intruder.'
      : gate.openMessage || `${gateName} opened.`;
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
      openMessage,
      notice: missingRequirements.length > 0
        ? `${gateName} locked: ${formatMissingSummary(missingRequirements)}. ${hint}`
      : `${gateName} ready: all route tasks complete.`,
    };
  }, [backgroundPackId, getGateRequirements]);

  const getRouteGateDoorwayEntries = useCallback(() => {
    const coveredGateIds = new Set();
    const entries = [];
    const routeGates = getRenderableRouteGates();
    getRenderableRouteGateDoorways().forEach((doorway) => {
      const gates = (doorway.gateIds || [])
        .map(gateId => routeGates.find(gate => gate.id === gateId))
        .filter(Boolean);
      if (!gates.length) return;
      gates.forEach(gate => coveredGateIds.add(gate.id));
      entries.push({ id: doorway.id, doorway, gates });
    });
    routeGates.forEach((gate) => {
      if (coveredGateIds.has(gate.id)) return;
      entries.push({ id: gate.id, doorway: null, gates: [gate] });
    });
    return entries;
  }, [getRenderableRouteGateDoorways, getRenderableRouteGates]);

  const getDoorwayGateStatus = useCallback((entry, current) => {
    const gates = entry?.gates || [];
    const gateStates = gates.map(gate => ({
      gate,
      guidance: getGateGuidance(gate, current),
      opened: current.openedRouteGateIds.has(gate.id),
    }));
    const lockedState = gateStates.find(state => !state.opened && state.guidance?.activeGateLocked);
    const unopenedStates = gateStates.filter(state => !state.opened);
    const readyToOpen = gateStates.length > 0 && gateStates.every(state => (
      state.opened || !state.guidance?.activeGateLocked
    ));
    const activeState = lockedState || unopenedStates[unopenedStates.length - 1] || gateStates[gateStates.length - 1] || null;
    return {
      activeGate: activeState?.gate || null,
      guidance: activeState?.guidance || null,
      locked: Boolean(lockedState),
      complete: readyToOpen || gateStates.every(state => state.opened),
      gatesToOpen: readyToOpen ? unopenedStates.map(state => state.gate) : [],
    };
  }, [getGateGuidance]);

  const getActiveShardGateProgress = useCallback((current) => {
    const gate = getNextJourneyRouteGate(ROUTE_GATES, current);
    if (!gate || !Number.isFinite(gate.requires?.shards)) return null;
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

  const addCombatEffect = useCallback((current, effect) => {
    current.combatHitEffects.push({
      timer: 0.35,
      maxTimer: 0.35,
      ...effect,
    });
    if (current.combatHitEffects.length > 18) current.combatHitEffects.shift();
  }, []);

  const completeArrivalThresholdTrialStep = useCallback((current, trial, step, message = null) => {
    if (!trial || !step || trial.completed) return;
    if (!trial.completedStepIds.includes(step.id)) trial.completedStepIds.push(step.id);
    const nextIndex = trial.stepIndex + 1;
    const nextStep = ARRIVAL_THRESHOLD_TRIAL_STEPS[nextIndex];
    addCombatEffect(current, {
      type: 'parry-burst',
      x: step.x,
      y: getArrivalThresholdGroundY(step.x) - (step.height || 70) * 0.55,
      color: '#5eead4',
      timer: 0.46,
      maxTimer: 0.46,
    });
    if (!nextStep) {
      trial.defeatedEcho = {
        ...(trial.echo || step),
        defeatTimer: 0.55,
        hitFlash: 0,
        attackCue: 0,
      };
      trial.completed = true;
      trial.active = false;
      trial.echo = null;
      trial.activeStepId = null;
      trial.completionAnnounced = true;
      current.notice = ARRIVAL_THRESHOLD_TRIAL_COMPLETE_LINE;
      current.cinematicEvent = {
        id: 'arrival-threshold-duat-echo-trial-complete',
        name: 'Asha',
        message: ARRIVAL_THRESHOLD_TRIAL_COMPLETE_LINE,
        temporary: true,
      };
      current.cinematicTimer = 3.1;
      current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.0);
      audioControls?.playExpeditionSfx?.('gateUnlock', { volume: 0.72 });
      return;
    }
    trial.stepIndex = nextIndex;
    trial.activeStepId = nextStep.id;
    trial.echo = {
      ...nextStep,
      direction: -1,
      timer: 0,
      awakeTimer: 0,
      spawnTimer: ARRIVAL_THRESHOLD_ECHO_SPAWN_SECONDS,
      hitFlash: 0,
      attackCue: 0,
      cleared: false,
    };
    trial.lineShownForStepId = null;
    current.notice = message || nextStep.objective;
    current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.4);
    audioControls?.playExpeditionSfx?.('lostSiteAirShift', { volume: 0.44 });
  }, [addCombatEffect, audioControls]);

  const updateArrivalThresholdTrial = useCallback((current, player, dt) => {
    const trial = current.arrivalThresholdTrial;
    if (!trial) return;
    if (trial.defeatedEcho) {
      trial.defeatedEcho.defeatTimer = Math.max(0, (trial.defeatedEcho.defeatTimer || 0) - dt);
      if (trial.defeatedEcho.defeatTimer <= 0) trial.defeatedEcho = null;
    }
    if (trial.completed) return;
    const step = ARRIVAL_THRESHOLD_TRIAL_STEPS[trial.stepIndex];
    if (!step) {
      trial.completed = true;
      trial.active = false;
      trial.echo = null;
      return;
    }
    const echo = trial.echo || {
      ...step,
      direction: -1,
      timer: 0,
      awakeTimer: 0,
      spawnTimer: ARRIVAL_THRESHOLD_ECHO_SPAWN_SECONDS,
      hitFlash: 0,
      attackCue: 0,
      cleared: false,
    };
    trial.echo = echo;
    echo.timer = (echo.timer || 0) + dt;
    echo.spawnTimer = Math.max(0, (echo.spawnTimer || 0) - dt);
    echo.hitFlash = Math.max(0, (echo.hitFlash || 0) - dt);
    echo.attackCue = Math.max(0, (echo.attackCue || 0) - dt);
    if (trial.lineShownForStepId !== step.id) {
      trial.lineShownForStepId = step.id;
      current.notice = step.ashaLine;
      current.cinematicEvent = {
        id: `arrival-threshold-${step.id}`,
        name: 'Asha',
        message: `${step.ashaLine} ${step.objective}`,
        temporary: true,
      };
      current.cinematicTimer = 3.0;
      current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.6);
      audioControls?.playExpeditionSfx?.('lostSiteAirShift', { volume: 0.34 });
    }
    if ((echo.spawnTimer || 0) > 0) {
      return;
    }
    echo.awakeTimer = (echo.awakeTimer || 0) + dt;
    if (step.movement === 'still' && echo.awakeTimer < ARRIVAL_THRESHOLD_ECHO_INTRO_DRIFT_SECONDS) {
      echo.x += (echo.direction || -1) * 18 * dt;
    }
    if (step.movement === 'patrol') {
      const minX = step.patrolMin ?? step.x - 100;
      const maxX = step.patrolMax ?? step.x + 100;
      echo.x += (echo.direction || -1) * (step.speed || 70) * dt;
      if (echo.x <= minX) {
        echo.x = minX;
        echo.direction = 1;
      } else if (echo.x >= maxX) {
        echo.x = maxX;
        echo.direction = -1;
      }
    } else if (step.movement === 'strike') {
      const playerCenterX = player.x + player.width / 2;
      const echoCenterX = echo.x;
      const distance = playerCenterX - echoCenterX;
      echo.direction = distance >= 0 ? 1 : -1;
      if (Math.abs(distance) < 210) {
        echo.attackCue = Math.max(echo.attackCue || 0, 0.32);
        echo.x += Math.sign(distance || echo.direction || 1) * (step.speed || 110) * dt;
      }
      if (current.dodgeTimer > 0 && Math.abs(distance) < 180) {
        completeArrivalThresholdTrialStep(current, trial, step, 'The echo breaks when Asha moves with the strike.');
        return;
      }
    }
    const echoHitbox = getArrivalThresholdEchoHitbox(echo);
    if (current.attackQueued && current.attackCooldown <= 0 && current.attackWindupTimer <= 0 && current.attackTimer <= 0 && current.attackRecoilTimer <= 0) {
      current.attackQueued = false;
      current.attackCooldown = 0.34;
      current.attackTimer = 0.16;
      current.attackRecoilTimer = 0.12;
      current.attackHitIds.clear();
      const attackBox = getAttackBox(player, PLAYER_ATTACK_RANGE, PLAYER_ATTACK_HEIGHT, player.direction, 0, PLAYER_ATTACK_BACK_REACH);
      current.playerAttackBox = attackBox;
      audioControls?.playExpeditionSfx?.('attackSwing1', { volume: 0.76 });
      if (echoHitbox && rectsOverlap(attackBox, echoHitbox)) {
        echo.hitFlash = 0.22;
        completeArrivalThresholdTrialStep(current, trial, step, `${step.name} breaks into dust.`);
      } else {
        current.notice = `${step.name} is just out of reach. Step closer, then strike.`;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.1);
      }
    }
  }, [audioControls, completeArrivalThresholdTrialStep, getAttackBox]);

  const getAttackHurtbox = useCallback((hostile, { boss = false } = {}) => {
    return getEnemyAttackHurtbox(hostile, { boss });
  }, []);

  const getPlayerAttackNearMissTarget = useCallback((current, attackRect) => {
    if (!current || !attackRect || current.enemiesDisabled) return null;
    const direction = current.player?.direction >= 0 ? 1 : -1;
    const candidates = [
      ...(current.enemies || []).filter(enemy => !enemy.defeated).map(enemy => ({ target: enemy, boss: false })),
      ...(current.miniBosses || []).filter(boss => boss.awakened && !boss.defeated).map(boss => ({ target: boss, boss: true })),
    ];
    let best = null;
    candidates.forEach(({ target, boss }) => {
      const hurtbox = getAttackHurtbox(target, { boss });
      const verticalGap = Math.max(
        attackRect.y - (hurtbox.y + hurtbox.height),
        hurtbox.y - (attackRect.y + attackRect.height),
        0,
      );
      const gap = direction >= 0
        ? hurtbox.x - (attackRect.x + attackRect.width)
        : attackRect.x - (hurtbox.x + hurtbox.width);
      if (
        gap >= 0 && gap <= PLAYER_ATTACK_NEAR_MISS_DISTANCE
        && verticalGap <= PLAYER_ATTACK_NEAR_MISS_VERTICAL_TOLERANCE
        && (!best || gap < best.gap)
      ) {
        best = {
          target,
          boss,
          hurtbox,
          gap,
          direction,
        };
      }
    });
    return best;
  }, [getAttackHurtbox]);

  const applyCombatHitImpact = useCallback(({
    current,
    target,
    player,
    hitType = 'light',
    direction = player?.direction || 1,
    defeated = false,
    targetKind = 'enemy',
    color,
    sparkColor,
    sparkFill,
    sfxKey,
    sfxOptions = {},
    shieldEffectType = null,
    guardEffectType = 'enemy-guard-deflect',
    guardColor,
    suppressSlash = false,
  }) => {
    if (!current || !target || !player) return;
    const profile = COMBAT_HIT_IMPACT_PROFILES[hitType] || COMBAT_HIT_IMPACT_PROFILES.light;
    const defeatedProfile = defeated ? COMBAT_HIT_IMPACT_PROFILES.defeated : null;
    const impact = {
      hitStop: Math.max(profile.hitStop || 0, defeatedProfile?.hitStop || 0),
      cameraShakeTimer: Math.max(profile.cameraShakeTimer || 0, defeatedProfile?.cameraShakeTimer || 0),
      cameraShakeStrength: Math.max(profile.cameraShakeStrength || 0, defeatedProfile?.cameraShakeStrength || 0),
      cameraPunchTimer: Math.max(profile.cameraPunchTimer || 0, defeatedProfile?.cameraPunchTimer || 0),
      hitFlash: Math.max(profile.hitFlash || 0, defeatedProfile?.hitFlash || 0),
      targetKnockback: Math.max(profile.targetKnockback || 0, defeatedProfile?.targetKnockback || 0),
      targetShift: Math.max(profile.targetShift || 0, defeatedProfile?.targetShift || 0),
      playerRecoil: Math.max(profile.playerRecoil || 0, defeatedProfile?.playerRecoil || 0),
      dustTimer: Math.max(profile.dustTimer || 0, defeatedProfile?.dustTimer || 0),
      dustWidth: Math.max(profile.dustWidth || 0, defeatedProfile?.dustWidth || 0),
    };
    const centerX = target.x + target.width / 2;
    const centerY = target.y + target.height / 2;
    const targetFootY = target.y + target.height;
    const playerFootY = player.y + player.height;
    const targetImmovable = target.type === 'scorpion-nest';

    target.hitFlash = Math.max(target.hitFlash || 0, impact.hitFlash);
    if (!targetImmovable && impact.targetKnockback > 0) {
      target.knockbackTimer = Math.max(target.knockbackTimer || 0, impact.targetKnockback);
      target.knockbackDirection = direction;
    }
    if (!targetImmovable && impact.targetShift > 0) {
      target.x += direction * impact.targetShift;
    }
    current.hitStopTimer = Math.max(current.hitStopTimer, impact.hitStop);
    current.cameraShakeTimer = Math.max(current.cameraShakeTimer, impact.cameraShakeTimer);
    current.cameraShakeStrength = Math.max(current.cameraShakeStrength, impact.cameraShakeStrength);
    current.cameraPunchTimer = Math.max(current.cameraPunchTimer || 0, impact.cameraPunchTimer);
    current.cameraPunchDirection = direction;
    if (impact.playerRecoil > 0) {
      player.vx += -direction * impact.playerRecoil;
    }

    if (shieldEffectType) {
      addCombatEffect(current, {
        type: shieldEffectType,
        x: centerX,
        y: centerY,
        visualGroundFootY: targetFootY,
        color: profile.color || '#7dd3fc',
        timer: profile.guardTimer || 0.34,
        maxTimer: profile.guardTimer || 0.34,
      });
    }
    if (hitType === 'blocked') {
      addCombatEffect(current, {
        type: guardEffectType,
        x: centerX,
        y: centerY,
        visualGroundFootY: targetFootY,
        color: guardColor || profile.sparkColor,
        timer: profile.guardTimer || 0.34,
        maxTimer: profile.guardTimer || 0.34,
      });
    } else {
      addCombatEffect(current, {
        type: defeated ? (targetKind === 'boss' ? 'boss-defeat' : 'defeat') : 'combat-impact',
        x: centerX,
        y: centerY,
        visualGroundFootY: targetFootY,
        direction,
        color: color || (defeated ? defeatedProfile?.color : profile.color),
        timer: defeated ? defeatedProfile?.impactTimer || profile.impactTimer : profile.impactTimer,
        maxTimer: defeated ? defeatedProfile?.impactTimer || profile.impactTimer : profile.impactTimer,
      });
      addCombatEffect(current, {
        type: 'weapon-hit-spark',
        x: centerX - direction * 6,
        y: target.y + target.height * 0.42,
        visualGroundFootY: targetFootY,
        direction,
        color: sparkColor || profile.sparkColor,
        fill: sparkFill || profile.sparkFill,
        timer: profile.sparkTimer,
        maxTimer: profile.sparkTimer,
      });
    }
    if (profile.slashEffect && !suppressSlash) {
      addCombatEffect(current, {
        type: profile.slashEffect === 'finisher' ? 'finisher-slash' : 'combo-slash',
        x: player.x + player.width / 2 + direction * (profile.slashEffect === 'finisher' ? 70 : 56),
        y: player.y + player.height * (profile.slashEffect === 'finisher' ? 0.38 : 0.39),
        visualGroundFootY: playerFootY,
        direction,
        comboStep: hitType === 'combo2' ? 2 : 1,
        width: profile.slashWidth,
        angle: profile.slashEffect === 'finisher' ? -0.04 : (hitType === 'combo2' ? -0.06 : -0.09),
        timer: profile.slashTimer,
        maxTimer: profile.slashTimer,
      });
    }
    if (impact.dustTimer > 0) {
      addCombatEffect(current, {
        type: 'knockback-dust',
        x: centerX - direction * 8,
        y: target.y + target.height - 2,
        visualGroundFootY: targetFootY,
        direction,
        color: 'rgba(217, 161, 88, 0.62)',
        width: impact.dustWidth,
        timer: impact.dustTimer,
        maxTimer: impact.dustTimer,
      });
    }
    const resolvedSfxKey = sfxKey || (defeated && hitType !== 'finisher' ? defeatedProfile?.sfxKey : profile.sfxKey);
    if (resolvedSfxKey) {
      audioControls?.playExpeditionSfx?.(resolvedSfxKey, {
        volume: defeated && hitType !== 'finisher'
          ? defeatedProfile?.sfxVolume
          : profile.sfxVolume,
        ...sfxOptions,
      });
    }
  }, [addCombatEffect, audioControls]);

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
    if (entity.debugCombatMode) return entity.debugCombatMode;
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

  const getActiveHazardsNearPlayer = useCallback((current) => getRenderableHazards(current)
    .filter(hazard => Math.abs((hazard.x + hazard.width / 2) - (current.player.x + current.player.width / 2)) < 150)
    .map(hazard => ({
      id: hazard.id,
      name: hazard.name,
      distance: Math.round((hazard.x + hazard.width / 2) - (current.player.x + current.player.width / 2)),
      penalty: hazard.penalty,
    })), [getRenderableHazards]);

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

  const getPlatformById = useCallback((platformId) => (
    PLATFORMS.find(platform => platform.id === platformId) || null
  ), []);

  const getChamberDoorResolvedPlacement = useCallback((door) => ({
    door,
    route: door?.routeId ? getRouteById(door.routeId) : null,
    platform: door?.entryPlatformId ? getPlatformById(door.entryPlatformId) : null,
  }), [getPlatformById, getRouteById]);

  const resolveChamberReturnPoint = useCallback((door, direction = 1) => {
    const placement = getChamberDoorResolvedPlacement(door);
    return resolveJourneyChamberReturnPoint({
      ...placement,
      direction,
      exteriorSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
      canvasWidth: CANVAS_WIDTH,
      worldWidth: WORLD_WIDTH,
    });
  }, [getChamberDoorResolvedPlacement]);

  const resolveChamberEntryTrigger = useCallback((door) => (
    resolveJourneyChamberEntryTrigger(getChamberDoorResolvedPlacement(door))
  ), [getChamberDoorResolvedPlacement]);

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
    if (enemy.type === 'scorpion' && enemy.attackPattern === SCORPION_VENOM_ATTACK_PATTERN.id) {
      return SCORPION_VENOM_ATTACK_PATTERN;
    }
    // While a heavy attack is in flight (windup -> swing), resolve the heavy pattern so the
    // swing carries heavy damage, reach, speed, and duration. attackPattern keeps the last-used
    // id after the attack ends, so outside the attack lifecycle the normal pattern must drive
    // patrol/chase/awareness behaviour.
    const heavyPattern = HEAVY_ATTACK_PATTERNS[enemy.type];
    if (
      heavyPattern
      && enemy.attackPattern === heavyPattern.id
      && (enemy.attackWindup > 0 || enemy.attackTimer > 0 || enemy.attackReady)
    ) {
      return enemy.type === 'scorpion'
        ? { ...heavyPattern, range: heavyPattern.range * SCORPION_ATTACK_RANGE_MULTIPLIER }
        : heavyPattern;
    }
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
    attackTellActive: entity.attackWindup > 0,
    recoveryWindowActive: entity.attackRecovery > 0,
    counterWindowActive: entity.vulnerabilityTimer > 0 || entity.attackRecovery > 0,
    pattern: entity.attackPattern || null,
    patternLabel: entity.attackPhaseLabel || null,
  }), [getCombatMode]);

  const createJourneySnapshot = useCallback((current = stateRef.current) => {
    const fallbackSection = getSectionForX(current.player.x);
    const sectionId = current.currentSectionId || fallbackSection.id;
    const section = SECTIONS.find(item => item.id === sectionId) || fallbackSection;
    const objective = getObjectiveProgress(section.id, current);
    const enemiesDisabled = Boolean(current.enemiesDisabled);
    const activeMiniBoss = enemiesDisabled
      ? null
      : current.miniBosses.find(boss => boss.awakened && !boss.defeated && Math.abs(boss.x - current.player.x) < 520);
    const nearbyCombatEnemy = enemiesDisabled ? null : current.enemies
      .filter(enemy => !enemy.defeated && Math.abs(enemy.x - current.player.x) < 520)
      .sort((a, b) => Math.abs(a.x - current.player.x) - Math.abs(b.x - current.player.x))[0] || null;
    const activeEnemyCounterWindow = enemiesDisabled ? null : current.enemies.find(enemy => !enemy.defeated && (enemy.vulnerabilityTimer > 0 || enemy.attackRecovery > 0));
    const activeBossCounterWindow = enemiesDisabled ? null : current.miniBosses.find(boss => !boss.defeated && (boss.vulnerabilityTimer > 0 || boss.attackRecovery > 0));
    const activeHiddenRoutes = getActiveHiddenRoutes();
    const activeSecretCollectibles = getActiveSecretCollectibles();
    const environmentAssets = environmentAssetsRef.current;
    const missingEnvironmentAssets = getMissingEnvironmentAssets(environmentAssets);
    const environmentFallbackActive = !environmentAssets.loaded || environmentAssets.failed || missingEnvironmentAssets.length > 0;
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
    const missingChinaEnemyGuardianSpriteAssets = scopedJourneyAssetPacks.isChinaJourney
      ? EXPECTED_CHINA_ENEMY_GUARDIAN_SPRITE_KEYS
        .filter(key => !chinaEnemyGuardianPack?.atlas?.regions?.[key])
      : [];
    const chinaEnemyGuardianFallbackActive = scopedJourneyAssetPacks.isChinaJourney
      && (!chinaEnemyGuardianPack?.loaded
        || chinaEnemyGuardianPack.failed
        || missingChinaEnemyGuardianSpriteAssets.length > 0);
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
    const scopedBackgroundFallbackActive = scopedJourneyAssetPacks.backgroundSectionIds
      .some((backgroundSectionId) => {
        const sectionPack = getSectionBackgroundAssets(desertBackgroundAssets, backgroundSectionId);
        return !sectionPack?.ready
          || sectionPack.failed
          || getMissingSectionBackgroundAssets(desertBackgroundAssets, backgroundSectionId).length > 0;
      });
    const renderStats = current.renderStats || {};
    const playerAttackBox = current.playerAttackBox
      ? {
        x: Math.round(current.playerAttackBox.x),
        y: Math.round(current.playerAttackBox.y),
        width: current.playerAttackBox.width,
        height: current.playerAttackBox.height,
      }
      : null;
    const nextRouteGate = getNextJourneyRouteGate(ROUTE_GATES, current);

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
      atmosphereGroundingMode: renderStats.atmosphereGroundingMode || 'ground-locked-floor-and-route-edge-assets',
      foregroundDepthAssetVersion: EGYPT_FOREGROUND_DEPTH_ASSET_VERSION,
      foregroundDepthLayerMode: renderStats.foregroundDepthLayerMode || FOREGROUND_DEPTH_LAYER_MODE,
      foregroundDepthAssetLoaded: Boolean(foregroundDepthEnvironmentAssetsRef.current.loaded),
      premiumGroundContactAssetVersion: EGYPT_PREMIUM_GROUND_CONTACT_ASSET_VERSION,
      premiumGroundContactAssetLoaded: Boolean(premiumGroundContactAssetsRef.current.loaded),
      foregroundDepthElementCount: renderStats.foregroundDepthElementCount || 0,
      foregroundDepthParticleCount: renderStats.foregroundDepthParticleCount || 0,
      backgroundPropTintActive: Boolean(renderStats.backgroundPropTintActive),
      platformGroundingMode: renderStats.platformGroundingMode || 'contact-shadow-ledges',
      visibleElevatedPlatforms: renderStats.visibleElevatedPlatforms || [],
      propDrawOrderMode: renderStats.propDrawOrderMode || DECORATIVE_PROP_LAYER_MODE,
      decorativePropLayerMode: renderStats.decorativePropLayerMode || DECORATIVE_PROP_LAYER_MODE,
      propDepthTuningVersion: renderStats.propDepthTuningVersion || PROP_DEPTH_TUNING_VERSION,
      propGroundingIntegrationVersion: renderStats.propGroundingIntegrationVersion || PROP_GROUNDING_INTEGRATION_VERSION,
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
      chinaRiverValleyBackgroundFallbackActive: scopedJourneyAssetPacks.isChinaJourney && !chinaRiverValleyPack?.ready,
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
      playerWeaponAtlasVersion: playerWeaponAssets.version || PLAYER_WEAPON_ATLAS_VERSION,
      missingPlayerWeaponSpriteAssets,
      markerSpritesLoaded: Boolean(markerSpriteAssets.loaded),
      markerSpritesReady: Boolean(markerSpriteAssets.ready),
      markerSpriteFallbackActive,
      markerSpriteAtlasPath: markerSpriteAssets.atlasPath || MARKER_SPRITE_ATLAS_JSON,
      markerSpriteAtlasVersion: MARKER_SPRITE_VERSION,
      missingMarkerSpriteAssets,
      playerWeaponFrame: renderStats.playerWeaponFrame || getPlayerWeaponFrameKey(getPlayerAttackState(current), playerWeaponAssets.weaponId),
      playerWeaponVisualMode: renderStats.playerWeaponVisualMode || (playerWeaponAssets.loaded ? `${playerWeaponAssets.weaponId || 'khopesh'}-sprite-atlas` : 'canvas-fallback'),
      parallaxLayersActive: Boolean(renderStats.parallaxLayersActive),
      activeBackgroundSection: renderStats.activeBackgroundSection || null,
      backgroundDepthMode: renderStats.backgroundDepthMode || 'canvas-fallback',
      desertJourneyBackgroundSystemVersion: renderStats.desertJourneyBackgroundSystemVersion || null,
      desertJourneyPanelIds: renderStats.desertJourneyPanelIds || [],
      desertJourneyLayerRoles: renderStats.desertJourneyLayerRoles || [],
      desertJourneyLayerDrawCount: renderStats.desertJourneyLayerDrawCount || 0,
      desertJourneyTransitionMasks: renderStats.desertJourneyTransitionMasks || [],
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
      arrivalThresholdState: current.arrivalThresholdActive ? {
        active: true,
        started: Boolean(current.arrivalThresholdStarted),
        leftInspected: Boolean(current.arrivalThresholdLeftInspected),
        markingsInspected: Boolean(current.arrivalThresholdMarkingsInspected),
        gateTriggered: Boolean(current.arrivalThresholdGateTriggered),
        exitTransitionActive: Boolean(current.arrivalThresholdExitTransition),
        exitTransitionProgress: current.arrivalThresholdExitTransition
          ? Number(clamp(
            (current.arrivalThresholdExitTransition.timer || 0) / (current.arrivalThresholdExitTransition.duration || ARRIVAL_THRESHOLD_EXIT_WALK_SECONDS),
            0,
            1,
          ).toFixed(3))
          : 0,
        playerX: Math.round(current.player.x),
        objective: current.notice,
        backgroundLoaded: Boolean(arrivalThresholdBackgroundRef.current.loaded),
        doorwayGlowLoaded: Boolean(arrivalThresholdDoorwayGlowRef.current.loaded),
        doorwayOccluderLoaded: Boolean(arrivalThresholdDoorwayOccluderRef.current.loaded),
        duatEchoLoaded: Boolean(arrivalThresholdDuatEchoRef.current.loaded),
        backgroundSrc: ARRIVAL_THRESHOLD_BACKGROUND_SRC,
      } : null,
      arrivalThresholdTrialState: current.arrivalThresholdTrial ? {
        active: Boolean(current.arrivalThresholdTrial.active),
        completed: Boolean(current.arrivalThresholdTrial.completed),
        activeStepId: current.arrivalThresholdTrial.activeStepId || null,
        completedStepIds: current.arrivalThresholdTrial.completedStepIds || [],
        echoX: current.arrivalThresholdTrial.echo ? Math.round(current.arrivalThresholdTrial.echo.x || 0) : null,
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
      assetFallbackActive: environmentFallbackActive || enemySpriteFallbackActive || bossSpriteFallbackActive || collectibleSpriteFallbackActive || playerWeaponSpriteFallbackActive || scopedBackgroundFallbackActive,
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
        combatRole: nearbyCombatEnemy.combatRole || nearbyCombatEnemy.encounterRole || null,
        pressureHint: nearbyCombatEnemy.pressureHint || null,
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
      secretVerticalCameraOffset: Number((current.secretVerticalCameraOffset || 0).toFixed(2)),
      mummificationChamberExteriorVersion: MUMMIFICATION_CHAMBER_EXTERIOR_VERSION,
      mummificationChamberExteriorLoaded: Boolean(mummificationChamberExteriorRef.current.loaded),
      mummificationChamberInteriorVersion: MUMMIFICATION_CHAMBER_INTERIOR_VERSION,
      mummificationChamberInteriorLoaded: Boolean(mummificationChamberInteriorRef.current.loaded),
      mummificationChamberInteriorAssetDescription: MUMMIFICATION_CHAMBER_INTERIOR_ASSET_DESCRIPTION,
      mummificationChamberInteractionAssetVersion: MUMMIFICATION_CHAMBER_INTERACTIONS_ASSET_VERSION,
      mummificationChamberInteractionAssetsLoaded: Boolean(mummificationInteractionAssetsRef.current.loaded),
      mummificationChamberRitualGuidanceVersion: MUMMIFICATION_CHAMBER_RITUAL_GUIDANCE_VERSION,
      mummificationChamberCurrentRite: renderStats.mummificationChamberCurrentRite || null,
      mummificationChamberNextObjectId: renderStats.mummificationChamberNextObjectId || null,
      mummificationChamberAtmosphereVersion: renderStats.mummificationChamberAtmosphereVersion || MUMMIFICATION_CHAMBER_ATMOSPHERE_VERSION,
      mummificationChamberAtmosphereState: renderStats.mummificationChamberAtmosphereState || null,
      mummificationChamberWakeProgress: renderStats.mummificationChamberWakeProgress || 0,
      mummificationChamberParticleCount: renderStats.mummificationChamberParticleCount || 0,
      forgottenMuralCameraFrameActive: Boolean(renderStats.forgottenMuralCameraFrameActive),
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
        type: current.activeGuardianChallenge.type || 'guardian-knowledge',
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
      romeTimelineEvidenceOrder: Array.isArray(current.romeTimelineEvidenceOrder) ? current.romeTimelineEvidenceOrder : [],
      romeTimelineSolved: Boolean(current.romeTimelineSolved),
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
      enemiesDisabled,
      enemyPlaytestAssistActive: enemiesDisabled,
      activeEnemyCount: enemiesDisabled
        ? 0
        : current.enemies.filter(enemy => !enemy.defeated && isEntityActiveInScene(enemy, current)).length,
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
        storySummary: route.storySummary || null,
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
        sceneId: getEntitySceneId(item),
        activeInScene: isEntityActiveInScene(item, current),
        routeUnlocked: item.routeId ? isRouteRewardAccessible(item.routeId, current) : true,
        restorationSetId: item.restorationSetId || null,
        restoresStoryFlag: item.restoresStoryFlag || null,
        restoreMessage: item.restoreMessage || null,
        anubisReaction: item.anubisReaction || null,
        collected: current.collectedSecretIds?.has(item.id) || false,
      })),
      collectedSecretCollectibles: Array.from(current.collectedSecretIds || []),
      secretCollectibleCount: current.collectedSecretIds?.size || 0,
      sacredRoomRestorationEvidence: getSacredRoomRestorationEvidence(current),
      templeThresholdHallEntranceDiscovered: Boolean(current.templeThresholdHallEntranceDiscovered),
      templeThresholdHallEntered: Boolean(current.templeThresholdHallEntered),
      templeThresholdHallCleared: Boolean(current.templeThresholdHallCleared),
      mummificationChamberEntranceDiscovered: Boolean(current.mummificationChamberEntranceDiscovered),
      forgottenMuralLooterSeen: Boolean(current.forgottenMuralLooterSeen),
      forgottenMuralChamberEntered: Boolean(current.forgottenMuralChamberEntered),
      forgottenMuralChamberActive: Boolean(current.forgottenMuralChamberActive),
      currentSceneId: getJourneySceneId(current),
      previousSceneId: current.previousSceneId || null,
      sceneReturn: current.sceneReturn ? {
        sceneId: current.sceneReturn.sceneId || null,
        x: Math.round(current.sceneReturn.x || 0),
        y: Math.round(current.sceneReturn.y || 0),
      } : null,
      sceneTransitionState: (current.sceneTransition || current.forgottenMuralChamberTransition) ? {
        id: (current.sceneTransition || current.forgottenMuralChamberTransition).id,
        phase: (current.sceneTransition || current.forgottenMuralChamberTransition).phase,
        fromSceneId: (current.sceneTransition || current.forgottenMuralChamberTransition).fromSceneId || null,
        toSceneId: (current.sceneTransition || current.forgottenMuralChamberTransition).toSceneId || null,
        switched: Boolean((current.sceneTransition || current.forgottenMuralChamberTransition).switched),
        lockMovement: Boolean((current.sceneTransition || current.forgottenMuralChamberTransition).lockMovement),
        timer: Number((current.sceneTransition || current.forgottenMuralChamberTransition).timer.toFixed(2)),
        duration: (current.sceneTransition || current.forgottenMuralChamberTransition).duration,
      } : null,
      forgottenMuralChamberTransitionState: current.forgottenMuralChamberTransition ? {
        id: current.forgottenMuralChamberTransition.id,
        phase: current.forgottenMuralChamberTransition.phase,
        switched: Boolean(current.forgottenMuralChamberTransition.switched),
        lockMovement: Boolean(current.forgottenMuralChamberTransition.lockMovement),
        timer: Number(current.forgottenMuralChamberTransition.timer.toFixed(2)),
        duration: current.forgottenMuralChamberTransition.duration,
      } : null,
      forgottenMuralChamberRestored: Boolean(current.forgottenMuralChamberRestored),
      forgottenMuralFragmentsRecovered: FORGOTTEN_MURAL_CHAMBER_RESTORATION_IDS.filter(id => current.collectedSecretIds?.has(id)).length,
      forgottenMuralRestored: Boolean(current.forgottenMuralChamberRestored),
      forgottenMuralRelicSlidePuzzleVersion: FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_VERSION,
      forgottenMuralRelicSlidePuzzleOpen: Boolean(current.forgottenMuralRelicSlidePuzzleOpen),
      forgottenMuralRelicSlidePuzzleSolved: Boolean(current.forgottenMuralRelicSlidePuzzleSolved),
      forgottenMuralRelicSlidePuzzleTiles: [...(current.forgottenMuralRelicSlidePuzzleTiles || [])],
      forgottenMuralRelicSlidePuzzleMoves: current.forgottenMuralRelicSlidePuzzleMoves || 0,
      mummificationChamberEntered: Boolean(current.mummificationChamberEntered),
      mummificationChamberActive: Boolean(current.mummificationChamberActive),
      mummificationChamberDoorSealed: Boolean(current.mummificationChamberDoorSealed),
      mummificationChamberExitUnlocked: Boolean(current.mummificationChamberExitUnlocked),
      mummificationChamberPuzzleSolved: Boolean(current.mummificationChamberPuzzleSolved),
      mummificationChamberRestored: Boolean(current.mummificationChamberRestored),
      mummificationChamberRitualStep: current.mummificationChamberRitualStep || 0,
      mummificationChamberInspectedObjects: Array.from(current.mummificationChamberInspectedObjectIds || []),
      scribeChamberEntered: Boolean(current.scribeChamberEntered),
      scribeChamberActive: Boolean(current.scribeChamberActive),
      scribeChamberDoorSealed: Boolean(current.scribeChamberDoorSealed),
      scribeChamberTabletInspected: Boolean(current.scribeChamberTabletInspected),
      scribeChamberWallInspected: Boolean(current.scribeChamberWallInspected),
      scribeChamberExitUnlocked: Boolean(current.scribeChamberExitUnlocked),
      scribeChamberPuzzleSolved: Boolean(current.scribeChamberPuzzleSolved),
      scribeChamberRecordRestored: Boolean(current.scribeChamberRecordRestored),
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
        attackType: current.attackType || PLAYER_ATTACK_TYPES.LIGHT,
        heavyFollowupReady: (current.heavyFollowupReadyTimer || 0) > 0,
        heavyFollowupPromptActive: (current.heavyFollowupReadyTimer || 0) > 0,
        heavyFollowupReadyMs: Math.round((current.heavyFollowupReadyTimer || 0) * 1000),
        heavyFollowupCueMs: Math.round((current.heavyFollowupCueTimer || 0) * 1000),
        hitStop: Number(current.hitStopTimer.toFixed(2)),
        facing: current.player.direction >= 0 ? 'right' : 'left',
        animationState: current.player.animationState || 'idle',
        animationFrame: current.player.animationFrame ?? 1,
        visualWalkStyle: current.player.visualWalkStyle || 'none',
        invulnerable: Number(current.player.invulnerable.toFixed(2)),
        invulnerabilityRemainingMs: Math.round(current.player.invulnerable * 1000),
        damageCooldownRemainingMs: Math.round(current.player.damageCooldownTimer * 1000),
        venomSlowRemainingMs: Math.round((current.player.venomSlowTimer || 0) * 1000),
        venomSlowMultiplier: current.player.venomSlowTimer > 0 ? current.player.venomSlowMultiplier : 1,
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
      enemyStates: enemiesDisabled ? [] : current.enemies
        .filter(enemy => Math.abs(enemy.x - current.player.x) < 700 || current.defeatedEnemies.has(enemy.id))
        .map(enemy => ({
          id: enemy.id,
          name: enemy.name,
          type: enemy.type,
          health: enemy.health,
          maxHealth: enemy.maxHealth,
          x: Math.round(enemy.x),
          encounterRole: enemy.encounterRole || null,
          combatRole: enemy.combatRole || enemy.encounterRole || null,
          protectsRouteId: enemy.protectsRouteId || null,
          pressureHint: enemy.pressureHint || null,
          ...getEntityCombatState(enemy),
        })),
      enemyCombatStates: enemiesDisabled ? [] : current.enemies
        .filter(enemy => Math.abs(enemy.x - current.player.x) < 700 || current.defeatedEnemies.has(enemy.id))
        .map(enemy => ({
          id: enemy.id,
          name: enemy.name,
          type: enemy.type,
          pattern: enemy.attackPattern,
          label: enemy.attackPhaseLabel || getEnemyPatternConfig(enemy).label,
          state: getCombatMode(enemy),
          encounterRole: enemy.encounterRole || null,
          combatRole: enemy.combatRole || enemy.encounterRole || null,
          protectsRouteId: enemy.protectsRouteId || null,
          pressureHint: enemy.pressureHint || null,
          windup: Number((enemy.attackWindup || 0).toFixed(2)),
          attack: Number((enemy.attackTimer || 0).toFixed(2)),
          recovery: Number((enemy.attackRecovery || 0).toFixed(2)),
          counterWindow: Number((enemy.vulnerabilityTimer || 0).toFixed(2)),
          shielded: Boolean(enemy.shieldTimer > 0),
          attackTellActive: enemy.attackWindup > 0,
          recoveryWindowActive: enemy.attackRecovery > 0,
          counterWindowActive: enemy.vulnerabilityTimer > 0 || enemy.attackRecovery > 0,
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
      routeGateStatus: nextRouteGate ? (() => {
        const gate = nextRouteGate;
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
      openingCinematicState: current.openingCinematic
        ? {
          ...current.openingCinematic,
          activeLine: getOpeningCinematicLine(current.openingCinematic),
          progress: Number((1 - (current.openingCinematic.timer / current.openingCinematic.duration)).toFixed(3)),
        }
        : null,
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
      hazards: getRenderableHazards(current).map(hazard => hazard.name),
      endGateReached: current.completed || current.discoveryEntranceActive,
      briefingOpen,
      failed: current.failed,
      failureReason: current.failureReason,
      failureDetail: current.failureDetail,
      notice: current.notice,
    };
  }, [briefingOpen, getActiveHazardsNearPlayer, getActiveHiddenRoutes, getActiveSecretCollectibles, getBossVulnerabilityState, getCombatMode, getEnemyPatternConfig, getEntityCombatState, getGateGuidance, getObjectiveProgress, getPlayerAttackState, getRenderableHazards, getRouteAccessState, getSectionDisplayName, getSectionDisplayTitle, getStaminaWarningState, isRouteRewardAccessible, playerHeroSpriteConfig, scopedJourneyAssetPacks.backgroundSectionIds, scopedJourneyAssetPacks.isChinaJourney, targetCivilisation]);

  // --- Rendering Helpers ---
  const drawFieldNoteLabel = useCallback(() => {
    const current = stateRef.current;
    if (current.renderStats) current.renderStats.worldLabelsSuppressed = true;
  }, []);

  const drawOpeningPyramidAssetRegion = useCallback((ctx, regionKey, dest, options = {}) => {
    return drawOpeningPyramidAssetRegionFrame(ctx, regionKey, dest, options, {
      OPENING_PYRAMID_ASSET_REGIONS,
      openingPyramidClimbPackRef,
    });
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
    const cropBottomRatio = Math.max(0, Math.min(0.85, options.cropBottomRatio ?? 0));
    const sourceHeight = Math.max(1, region.h * (1 - cropBottomRatio));
    const destHeight = Math.max(1, dest.height * (1 - cropBottomRatio));
    const destY = options.alignY === 'bottom' ? dest.y + dest.height - destHeight : dest.y;
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (options.filter) ctx.filter = options.filter;
    ctx.drawImage(pack.image, region.x, region.y, region.w, sourceHeight, dest.x, destY, dest.width, destHeight);
    ctx.restore();
    return true;
  }, []);

  const drawEgyptStructureGroundContactLayer = useCallback((ctx, contactLayer, left, width, groundY, phase = 'overlay') => {
    const foregroundAssets = foregroundDepthEnvironmentAssetsRef.current;
    const premiumAssets = premiumGroundContactAssetsRef.current;
    if (!Array.isArray(contactLayer)) {
      return { count: 0, keys: [] };
    }

    let count = 0;
    const keys = [];
    contactLayer
      .filter((entry) => (entry.layer || 'overlay') === phase)
      .forEach((entry) => {
        const destWidth = Number.isFinite(entry.width)
          ? entry.width
          : width * (Number.isFinite(entry.widthRatio) ? entry.widthRatio : 0.5);
        const destHeight = Number.isFinite(entry.height) ? entry.height : 58;
        const centerX = left
          + width * (Number.isFinite(entry.xRatio) ? entry.xRatio : 0.5)
          + (Number.isFinite(entry.xOffset) ? entry.xOffset : 0);
        const destY = groundY
          + (Number.isFinite(entry.yOffset) ? entry.yOffset : -destHeight);

        ctx.save();
        const assets = premiumAssets?.atlas?.regions?.[entry.assetKey]
          ? premiumAssets
          : foregroundAssets;
        if (!assets?.loaded || assets.failed) {
          ctx.restore();
          return;
        }

        ctx.globalAlpha = Number.isFinite(entry.alpha) ? entry.alpha : 0.32;
        ctx.filter = entry.filter || 'sepia(10%) saturate(82%) brightness(88%) contrast(96%)';
        ctx.translate(centerX, destY + destHeight / 2);
        if (Number.isFinite(entry.rotation)) ctx.rotate((entry.rotation * Math.PI) / 180);
        if (entry.mirrorX || entry.mirrorY) ctx.scale(entry.mirrorX ? -1 : 1, entry.mirrorY ? -1 : 1);
        const drawn = drawAtlasRegion(ctx, assets, entry.assetKey, {
          x: -destWidth / 2,
          y: -destHeight / 2,
          width: destWidth,
          height: destHeight,
        }, {
          mode: entry.mode || 'contain',
          alignY: entry.alignY || 'bottom',
        });
        ctx.restore();

        if (drawn) {
          count += 1;
          keys.push(entry.assetKey);
        }
      });

    return { count, keys };
  }, []);

  const drawEgyptStructureWeatheringOverlay = useCallback((ctx, left, width, groundY, options = {}) => {
    const alpha = options.alpha ?? 1;
    const color = options.color || 'rgba(96, 58, 28, 0.22)';
    const sediment = options.sediment || 'rgba(217, 157, 82, 0.18)';
    ctx.save();
    [
      { xRatio: 0.22, widthRatio: 0.18, y: -18, h: 18 },
      { xRatio: 0.5, widthRatio: 0.26, y: -12, h: 14 },
      { xRatio: 0.78, widthRatio: 0.16, y: -20, h: 16 },
    ].forEach((patch, index) => {
      const patchWidth = width * patch.widthRatio;
      const patchX = left + width * patch.xRatio - patchWidth / 2;
      const gradient = ctx.createLinearGradient(0, groundY + patch.y, 0, groundY + patch.y + patch.h);
      gradient.addColorStop(0, color.replace(/0\.\d+\)/, `${0.04 * alpha})`));
      gradient.addColorStop(0.65, sediment.replace(/0\.\d+\)/, `${0.18 * alpha})`));
      gradient.addColorStop(1, 'rgba(217, 157, 82, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(patchX + patchWidth / 2, groundY + patch.y + patch.h / 2, patchWidth / 2, patch.h, (index - 1) * 0.05, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }, []);

  const {
    drawForgottenMuralGeneratedAsset,
    drawLostBridgeRavineDepth,
    drawLostBridgeRavineForegroundVoid,
    drawLostBridgeStructure,
    drawMummificationChamberExteriorAsset,
    drawOpeningPyramidMasonryBack,
    drawScribeChamberDoorwayStructure,
  } = useJourneyExteriorStructureRenderers({
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GROUND_Y,
    LOST_BRIDGE_ASSET_VERSION,
    LOST_BRIDGE_RAVINE_BLEND_CLIP_PAD,
    LOST_BRIDGE_RAVINE_BLEND_CLIP_TOP_OFFSET,
    LOST_BRIDGE_RAVINE_FALL_DEPTH,
    LOST_BRIDGE_RAVINE_FALL_SIDE_PAD,
    LOST_BRIDGE_RAVINE_FLOOR_VARIANT_SRCS,
    LOST_BRIDGE_RAVINE_FOREGROUND_VOID_GROUND_CLEARANCE,
    LOST_BRIDGE_RAVINE_FOREGROUND_VOID_MIN_TOP_OFFSET,
    LOST_BRIDGE_RAVINE_FOREGROUND_VOID_SIDE_PAD,
    LOST_BRIDGE_RAVINE_THROAT_TOP_OFFSET,
    LOST_BRIDGE_STRUCTURE_DECK_TOP_FRAC,
    LOST_BRIDGE_STRUCTURE_SIDE_PAD,
    MUMMIFICATION_CHAMBER_EXTERIOR_VERSION,
    OPENING_PYRAMID_FACADE_TIERS,
    OPENING_PYRAMID_FACADE_WORLD_LEFT_X,
    SCRIBE_CHAMBER_EXTERIOR_VERSION,
    drawContactShadow,
    drawEgyptStructureGroundContactLayer,
    drawEgyptStructureWeatheringOverlay,
    drawOpeningPyramidAssetRegion,
    forgottenMuralAlcoveStructureRef,
    getGeneratedStoryPropRenderProp,
    getLostBridgeDeckBounds,
    getLostBridgeRavineFloorPlacement,
    getRenderableStoryProps,
    isHorizontallyVisible,
    lostBridgeAssetsRef,
    mummificationChamberExteriorRef,
    openingJourneyY,
    openingPyramidFacadeRef,
    scaleJourneyX,
    scribeChamberExteriorRef,
    stateRef,
    worldToScreenX,
  });

  const getDesertEntryGroundContactActive = useCallback((worldX, footY, current = stateRef.current) => {
    if (!scopedJourneyAssetPacks.isEgyptJourney) return false;
    if (!current || current.arrivalThresholdActive || isInteriorChamberScene(current)) return false;
    if (!Number.isFinite(worldX) || !Number.isFinite(footY)) return false;
    if (getSectionForX(worldX).id !== 'desert-entry') return false;
    return Math.abs(footY - GROUND_Y) <= DESERT_ENTRY_VISUAL_GROUND_FOOT_TOLERANCE;
  }, [scopedJourneyAssetPacks.isEgyptJourney]);

  const getDesertEntryVisualGroundOffsetY = useCallback((worldX, footY, current = stateRef.current) => {
    if (!getDesertEntryGroundContactActive(worldX, footY, current)) return 0;
    return DESERT_ENTRY_VISUAL_GROUND_PLANE_OFFSET_Y;
  }, [getDesertEntryGroundContactActive]);

  const getGroundPlaneEntityRenderY = useCallback((entity, current = stateRef.current) => {
    if (!entity || !Number.isFinite(entity.x) || !Number.isFinite(entity.y)) return Number.NaN;
    const width = Number.isFinite(entity.width) ? entity.width : 0;
    const height = Number.isFinite(entity.height) ? entity.height : 0;
    return entity.y + getDesertEntryVisualGroundOffsetY(entity.x + width / 2, entity.y + height, current);
  }, [getDesertEntryVisualGroundOffsetY]);

  const {
    drawAncientRouteGround,
    drawArrivalThresholdDoorwayOccluder,
    drawArrivalThresholdScene,
    drawArrivalThresholdTrial,
    drawAttackArc,
    drawCinematicCards,
    drawCollectible,
    drawCombatEffects,
    drawChinaRiverValleyBackground,
    drawConnectedWorldAmbientLife,
    drawDesertEntryGroundMotionCues,
    drawDesertEntryBackground,
    drawDesertEntryGroundLane,
    drawDesertForegroundAtmosphere,
    drawDesertJourneySceneMasks,
    drawDesertJourneyScenePanels,
    drawDebugPlatformOverlay,
    drawEgyptAmbientLife,
    drawEnemyAttackTell,
    drawForegroundDepthLayer,
    drawForegroundOccluderProps,
    drawWorldContinuityLandmark,
    drawStageEntranceFeature,
    drawDynamicEnvironmentEvent,
    drawEnvironmentInteraction,
    drawRouteGate,
    drawHazard,
    drawDiscoveryEntrance,
    drawPremiumEgyptianChamberDoor,
    drawForgottenMuralChamberTransition,
    drawHiddenRouteHint,
    drawLinkedEnemySprite,
    drawMiniBoss,
    drawMissingObjectiveMarker,
    drawOpeningCinematic,
    drawOpeningSphinxEncounter,
    drawOpeningThresholdScene,
    drawParticles,
    drawPlatform,
    drawPlayerFeedbackOverlays,
    drawPlayerSprite,
    drawPropPlacementEditorOverlay,
    drawStoryProp,
    drawSectionParallaxBackground,
    drawSectionParallaxForeground,
    drawSectionTransitionBlend,
    drawScarabQueenLairOpeningProp,
    drawSmallEnemySprite,
    drawStageEntranceForegroundOccluder,
    drawTempleBackdrop,
    drawTempleThresholdTransition,
    drawTrapProjectile,
    drawWorldTransitionMarker,
  } = useJourneyRenderer({
    ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON,
    ARRIVAL_THRESHOLD_ASSET_VERSION,
    ARRIVAL_THRESHOLD_LEFT_BOUND,
    ARRIVAL_THRESHOLD_LEFT_INSPECT_X,
    ARRIVAL_THRESHOLD_RIGHT_BOUND,
    backgroundPackId,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    CHAMBER_DOOR_VISUALS,
    DEFAULT_LEVEL_TRANSITION,
    DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE,
    DESERT_ENTRY_BACKGROUND_ART_VERSION,
    DESERT_ENTRY_CONTINUOUS_BACKGROUND_END_X,
    DESERT_ENTRY_CONTINUOUS_BACKGROUND_START_X,
    DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_IDS,
    DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_SEAM_MASKS,
    DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION,
    DESERT_JOURNEY_LAYER_ROLES,
    DESERT_JOURNEY_SCENE_PANELS,
    EGYPT_AMBIENT_LIFE_VERSION,
    FORGOTTEN_MURAL_CHAMBER_FADE_IN_SECONDS,
    FORGOTTEN_MURAL_CHAMBER_FADE_OUT_SECONDS,
    FORGOTTEN_MURAL_CHAMBER_SWITCH_SECONDS,
    GROUND_Y,
    HEAVY_ATTACK_PATTERNS,
    JOURNEY_VERTICAL_OFFSET,
    JOURNEY_SCENE_IDS,
    LOST_BRIDGE_PIECE_TUNING,
    OPENING_SPHINX_APPARITION_SRC,
    OPENING_SPHINX_ARRIVAL_SECONDS,
    OPENING_SPHINX_EXIT_SECONDS,
    OPENING_SPHINX_LINE_SECONDS,
    OPENING_SPHINX_SCREEN_Y_OFFSET,
    OPENING_SPHINX_SPRITE_BOSS_ID,
    OPENING_SPHINX_SPRITE_VERSION,
    OPENING_PYRAMID_ASSET_REGIONS,
    OPENING_THRESHOLD_FADE_SECONDS,
    OPENING_THRESHOLD_STAIR_REVEAL_SECONDS,
    OPENING_TOMB_STAIRWELL_VERSION,
    PLAYER_DODGE_DURATION,
    PLAYER_SPRITE_DRAW_HEIGHT,
    PLAYER_SPRITE_FRAME_COUNT,
    PLAYER_SPRITE_FRAME_HEIGHT,
    PLAYER_SPRITE_FRAME_WIDTH,
    PARRY_WINDOW_DURATION,
    PLATFORMS,
    SCORPION_VENOM_SPIT_EFFECT_FRAMES,
    ROUTE_GROUND_HAZE_FIX_VERSION,
    ROUTE_GROUND_VISUAL_MODE,
    SCARAB_SEAL_TRIGGER,
    SECTIONS,
    SECTION_PARALLAX_LAYERS,
    STAGE_ENTRANCE_THEME_FILTERS,
    scarabQueenLairOpeningImageRef,
    TEMPLE_THRESHOLD_FADE_IN_SECONDS,
    TEMPLE_THRESHOLD_FADE_OUT_SECONDS,
    TEMPLE_THRESHOLD_SWITCH_SECONDS,
    ARRIVAL_THRESHOLD_ECHO_SPAWN_SECONDS,
    arrivalThresholdBackgroundRef,
    arrivalThresholdDuatEchoRef,
    arrivalThresholdDoorwayGlowRef,
    arrivalThresholdDoorwayOccluderRef,
    arrivalThresholdSealVeilRef,
    arrivalThresholdAwakenedRef,
    arrivalThresholdGlowCanvasRef,
    bossSpriteAssetsRef,
    clamp,
    desertBackgroundAssetsRef,
    desertEndGatewayRef,
    drawDesertBackgroundLayer,
    drawDecorativeBaseBlend,
    drawEditorSelectionCorners,
    drawEditorSelectionLabel,
    drawAtlasRegion,
    drawContactShadow,
    drawGroundDustLip,
    drawPlayerWeaponAtlasRegion,
    drawRouteGroundApron,
    environmentPackId,
    environmentAssetsRef,
    getAncientConstructDrawBox,
    getAncientConstructSpriteFrame,
    getAttackBox,
    getArchEditorBounds,
    getBossSpritePack,
    getBossVulnerabilityState,
    getCheckpointEditorBounds,
    getClayGuardianDrawBox,
    getClayGuardianSpriteFrame,
    getSectionBackgroundAssets,
    getArrivalThresholdEchoHitbox,
    getArrivalThresholdGroundY,
    getEnvironmentAssetKeyForPlatform,
    getDesertEntryOpeningRebuildViewportCoverage,
    getDesertJourneyPanelsForViewport,
    getDesertJourneyTransitionMasksForViewport,
    getCombatMode,
    getEditedNestParams,
    getEnemyAttackTelegraph,
    getEnemyBodyLanguagePose,
    getEnemyPatternConfig,
    getEnemySpriteDrawBox,
    getEnemySpriteFamily,
    getEnemySpriteFrame,
    getEnemySpritePack,
    getEditorEntityBounds,
    getEditorEntityLabel,
    getHazardEditorBounds,
    getHeroSpriteFrameKey,
    getHeroSpriteFrameRowName,
    getHeroSpriteFrameScale,
    getHeroSpriteRowScale,
    getGiantSerpentDrawBox,
    getGiantSerpentSpriteFrame,
    getLegateRevenantDrawBox,
    getLegateRevenantSpriteFrame,
    getOpeningCinematicLine,
    getOpeningThresholdDialogueLine,
    getJourneyTrapTriggerRect,
    getLairEditorBounds,
    getNestEditorBounds,
    getPlatformEditorBounds,
    getPlayerAttackState,
    getRouteAccessState,
    getPlayerWeaponFrameKey,
    getPropEditorSelectedArch,
    getPropEditorSelectedCheckpoint,
    getPropEditorSelectedHazard,
    getPropEditorSelectedLair,
    getPropEditorSelectedNest,
    getPropEditorSelectedPlatform,
    getPropEditorSelectedProp,
    getRenderableCheckpoints,
    getRenderableHazards,
    getRenderablePlatforms,
    getRenderableRouteGateDoorways,
    getRenderableRouteGates,
    getRenderableScarabLairs,
    getRenderableStoryProps,
    getRomeBossSpritePack,
    getScarabQueenDrawBox,
    getScarabQueenEmergenceBeat,
    getScarabQueenSpriteFrame,
    getSectionForX,
    areRouteGateRequirementsMetForState,
    DISCOVERY_ENTRANCE_REVEAL_SECONDS,
    drawFieldNoteLabel,
    drawHazardGroundApron,
    drawOpeningHazardDecalRegion,
    dynamicWorldAssetsRef,
    GATE,
    getDynamicWorldEffectRegion,
    getEgyptHazardDecalDescriptor,
    getEgyptHazardDecalDest,
    getEnvironmentAssetKeyForHazard,
    getHazardBurialAmount,
    getHazardGroundingConfig,
    getHazardVisualConfig,
    getHazardVisualId,
    getJourneySceneId,
    HAZARD_VISUALS,
    isReusableJourneyTrap,
    normalizeJourneyTrap,
    placeGateOnGround,
    ROUTE_GATES,
    routeGateBackRef,
    routeGateFrontRef,
    routeGateSlabRef,
    shouldRenderChamberDoorVisual,
    usesPaintedDynamicWorldEffect,
    getStoneGuardianDrawBox,
    getStoneGuardianSpriteFrame,
    isChinaGuardianBossSpriteId,
    isHorizontallyVisible,
    isJourneyBlockerPlatform,
    isJourneyFloorPlatform,
    isRomeBossSpriteId,
    isLostBridgeStructureDeckPlatform,
    isPlatformAvailable,
    isPlayerAttackVisualPhase,
    shouldFlipEnemySprite,
    shouldUseEnemySpritePack,
    openingSphinxApparitionRef,
    openingTombStairwellRef,
    lostBridgeAssetsRef,
    openingPyramidClimbPackRef,
    openingPyramidFacadeRef,
    playerComboSlashEffectRef,
    playerFinisherSlashEffectRef,
    playerSpriteRef,
    playerWeaponSpriteRef,
    scorpionVenomSpitEffectRef,
    atmosphereEnvironmentAssetsRef,
    collectibleSpriteAssetsRef,
    DRAW_JOURNEY_FLAG_MARKERS,
    drawCollectibleAtlasRegion,
    drawEgyptStructureGroundContactLayer,
    drawForgottenMuralGeneratedAsset,
    drawMarkerSprite,
    drawMummificationChamberExteriorAsset,
    drawScribeChamberDoorwayStructure,
    ENVIRONMENT_ASSET_PACK_IDS,
    enemySpriteAssetsRef,
    FOREGROUND_DEPTH_LAYER_MODE,
    getEnvironmentAssetKeyForStoryProp,
    getGeneratedStoryPropRenderProp,
    getDesertEntryGroundContactActive,
    getDesertEntryVisualGroundOffsetY,
    getJourneyPaintTintBuffer,
    getGroundPlaneEntityRenderY,
    getScaledDetailContactLayer,
    foregroundDepthEnvironmentAssetsRef,
    getStandaloneImagePropAsset,
    getStoryPropAnchorY,
    getStoryPropDepth,
    getStoryPropEditorBounds,
    getStoryPropEditorSize,
    getStoryPropPlacementPreset,
    getZIndexSortedRenderableStoryProps,
    isDesertEntryRebuildBackgroundPlateProp,
    isLostBridgeRavineSpecialRendererProp,
    JOURNEY_FLAG_VISUAL_MODE,
    markerSpriteAssetsRef,
    PROP_GROUNDING_CONFIG,
    PROP_GROUNDING_INTEGRATION_VERSION,
    propPlacementEditorRef,
    resolveChamberEntryTrigger,
    resolvePropGroundingSettings,
    ROUTE_GATE_STANDALONE_PROP_COLOR_GRADE_FILTER,
    shouldGroundLockAtmosphereProp,
    STORY_PROP_GROUNDING_OVERRIDES,
    shouldFlipBossSprite,
    stateRef,
    stageEntranceDoorwayRef,
    scaleJourneyX,
    worldToScreenX,
  });

  const {
    drawTempleThresholdHallInterior,
    drawMummificationChamberInterior,
    drawForgottenMuralChamberInterior,
    drawScribeLockedChamberInterior,
  } = useJourneyInteriorRenderers({
    ARRIVAL_THRESHOLD_ASSET_VERSION,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GROUND_Y,
    JOURNEY_INTERACT_OBJECT_STATES,
    MUMMIFICATION_CHAMBER_ATMOSPHERE_VERSION,
    MUMMIFICATION_CHAMBER_EXIT_TRIGGER,
    MUMMIFICATION_CHAMBER_INTERACTIONS_ASSET_VERSION,
    MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS,
    MUMMIFICATION_CHAMBER_INTERIOR_VERSION,
    MUMMIFICATION_CHAMBER_READABILITY,
    MUMMIFICATION_CHAMBER_RITUAL_GUIDANCE_VERSION,
    MUMMIFICATION_CHAMBER_RITUAL_SEQUENCE,
    MUMMIFICATION_CHAMBER_RITUAL_STEPS,
    MUMMIFICATION_CHAMBER_RITE_OBJECTS,
    MUMMIFICATION_JAR_SYMBOLS,
    MUMMIFICATION_ROOM_INTERACT_VERSION,
    SCRIBE_CHAMBER_EXIT_TRIGGER,
    SCRIBE_CHAMBER_INTERIOR_VERSION,
    SCRIBE_CHAMBER_TABLET_REGION,
    arrivalThresholdBackgroundRef,
    clamp,
    drawAtlasRegion,
    drawFieldNoteLabel,
    forgottenMuralChamberRef,
    forgottenMuralHiddenRevealRef,
    getMummificationChamberAtmosphere,
    getMummificationRiteByIndex,
    isForgottenMuralChamberScene,
    isMummificationChamberScene,
    isScribeLockedChamberScene,
    isTempleThresholdHallScene,
    mummificationChamberInteriorRef,
    mummificationInteractionAssetsRef,
    scribeChamberInteriorRef,
    worldToScreenX,
  });

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
    const isRomeJourney = scopedJourneyAssetPacks.isRomeJourney;
    const isChinaJourney = scopedJourneyAssetPacks.isChinaJourney;
    const isEgyptJourney = !isRomeJourney && !isChinaJourney;
    const shake = current.cameraShakeTimer > 0
      ? Math.sin(now / 28) * current.cameraShakeStrength * 7
      : 0;
    const cameraPunchX = (current.cameraPunchTimer || 0) > 0
      ? (current.cameraPunchDirection || 1) * 7 * clamp((current.cameraPunchTimer || 0) / 0.07, 0, 1)
      : 0;
    const cameraX = clampCameraX((Number.isFinite(current.cameraX) ? current.cameraX : 0) + shake + cameraPunchX);
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
    const chamberSceneActive = isInteriorChamberScene(current);
    const playerGroundPlaneRenderY = getGroundPlaneEntityRenderY(player, current);
    const activeRouteGate = chamberSceneActive ? null : getNextJourneyRouteGate(ROUTE_GATES, current);
    const activeGateGuidance = activeRouteGate ? getGateGuidance(activeRouteGate, current) : null;
    const playerCenterX = player.x + player.width / 2;
    const crowdedGateActive = Boolean(activeRouteGate && Math.abs((activeRouteGate.x + activeRouteGate.width / 2) - playerCenterX) < 360);
    const crowdedBossActive = current.miniBosses.some(boss => boss.awakened && !boss.defeated && Math.abs(boss.x - player.x) < 360);
    const labelSuppressionActive = crowdedGateActive || crowdedBossActive || current.bossIntroTimer > 0;
    const secretClimbRouteIds = ['mummification-chamber-route', 'desert-upper-survey-route'];
    const secretClimbRoute = getActiveHiddenRoutes().find(route => secretClimbRouteIds.includes(route.id)
      && playerCenterX >= route.x - scaleJourneyX(240)
      && playerCenterX <= route.x + route.width + scaleJourneyX(160));
    const playerIsElevated = player.y < GROUND_Y - 160;
    const openingPyramidVerticalWindow = current.currentSectionId === 'desert-entry'
      && playerCenterX >= -scaleJourneyX(80)
      && playerCenterX <= scaleJourneyX(980)
      && playerIsElevated;
    const inVerticalCameraWindow = (Boolean(secretClimbRoute) && playerIsElevated) || openingPyramidVerticalWindow;
    const desiredSecretVerticalCameraOffset = !chamberSceneActive && inVerticalCameraWindow
      ? clamp(CANVAS_HEIGHT * 0.46 - (player.y + player.height / 2), 0, openingPyramidVerticalWindow ? 320 : 420)
      : 0;
    const currentVertOffset = current.secretVerticalCameraOffset || 0;
    const movingUp = desiredSecretVerticalCameraOffset > currentVertOffset;
    const vertBlend = movingUp ? 0.52 : 0.14;
    current.secretVerticalCameraOffset = Number((
      currentVertOffset * (1 - vertBlend) + desiredSecretVerticalCameraOffset * vertBlend
    ).toFixed(2));
    const secretVerticalCameraOffset = current.secretVerticalCameraOffset || 0;
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
      playerWeaponVisualMode: playerWeaponSpriteRef.current.loaded ? `${playerWeaponSpriteRef.current.weaponId || 'khopesh'}-sprite-atlas` : 'canvas-fallback',
      desertVisualTuningVersion: DESERT_VISUAL_TUNING_VERSION,
      desertEntryCausewayVisualMode: ROUTE_GROUND_VISUAL_MODE,
      desertEntryPlayableGroundPlane: 'integrated-background-painted-route-v1',
      openingPyramidAssetVersion: OPENING_PYRAMID_ASSET_VERSION,
      openingPyramidAssetLoaded: openingPyramidClimbPackRef.current.loaded,
      openingPyramidFacadeVersion: OPENING_PYRAMID_FACADE_VERSION,
      openingPyramidFacadeLoaded: openingPyramidFacadeRef.current.loaded,
      mummificationChamberExteriorVersion: MUMMIFICATION_CHAMBER_EXTERIOR_VERSION,
      mummificationChamberExteriorLoaded: mummificationChamberExteriorRef.current.loaded,
      mummificationChamberInteriorVersion: MUMMIFICATION_CHAMBER_INTERIOR_VERSION,
      mummificationChamberInteriorLoaded: mummificationChamberInteriorRef.current.loaded,
      mummificationChamberInteractionAssetVersion: MUMMIFICATION_CHAMBER_INTERACTIONS_ASSET_VERSION,
      mummificationChamberInteractionAssetsLoaded: mummificationInteractionAssetsRef.current.loaded,
      mummificationChamberReadableZones: MUMMIFICATION_CHAMBER_READABILITY.mummificationChamberReadableZones.map(zone => zone.id),
      mummificationChamberPuzzleCenterpiece: MUMMIFICATION_CHAMBER_READABILITY.mummificationChamberPuzzleCenterpiece,
      forgottenMuralAlcoveClimbStructureVersion: FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_VERSION,
      forgottenMuralAlcoveClimbStructureLoaded: forgottenMuralAlcoveStructureRef.current.loaded,
      forgottenMuralChamberVersion: FORGOTTEN_MURAL_CHAMBER_VERSION,
      forgottenMuralChamberLoaded: forgottenMuralChamberRef.current.loaded,
      forgottenMuralHiddenRevealVersion: FORGOTTEN_MURAL_HIDDEN_MEMORY_REVEAL_VERSION,
      forgottenMuralHiddenRevealLoaded: forgottenMuralHiddenRevealRef.current.loaded,
      scribeChamberExteriorVersion: SCRIBE_CHAMBER_EXTERIOR_VERSION,
      scribeChamberExteriorLoaded: scribeChamberExteriorRef.current.loaded,
      scribeChamberInteriorVersion: SCRIBE_CHAMBER_INTERIOR_VERSION,
      scribeChamberInteriorLoaded: scribeChamberInteriorRef.current.loaded,
      templeThresholdHallActive: Boolean(current.templeThresholdHallActive),
      templeThresholdHallCleared: Boolean(current.templeThresholdHallCleared),
      forgottenMuralChamberActive: Boolean(current.forgottenMuralChamberActive),
      currentSceneId: getJourneySceneId(current),
      sceneTransitionActive: Boolean(current.sceneTransition || current.forgottenMuralChamberTransition),
      openingTrapDecalAssetVersion: OPENING_TRAP_DECAL_ASSET_VERSION,
      openingTrapDecalAssetLoaded: openingTrapDecalPackRef.current.loaded,
      openingHazardDecalAssetLoaded: openingHazardDecalPackRef.current.loaded,
      assetGroundingPassActive: true,
      groundedPropCount: 0,
      atmospherePropCount: 0,
      groundLockedAtmospherePropCount: 0,
      atmosphereAssetVersion: EGYPT_ATMOSPHERE_ASSET_VERSION,
      atmosphereAssetLoaded: atmosphereEnvironmentAssetsRef.current.loaded,
      atmosphereGroundingMode: 'ground-locked-floor-and-route-edge-assets',
      foregroundDepthAssetVersion: EGYPT_FOREGROUND_DEPTH_ASSET_VERSION,
      foregroundDepthLayerMode: FOREGROUND_DEPTH_LAYER_MODE,
      foregroundDepthLayerActive: false,
      foregroundDepthAssetLoaded: foregroundDepthEnvironmentAssetsRef.current.loaded,
      foregroundDepthElementCount: 0,
      foregroundDepthParticleCount: 0,
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
      playerWeaponFrame: getPlayerWeaponFrameKey(getPlayerAttackState(current), playerWeaponSpriteRef.current.weaponId),
      playerSpriteFrame: null,
      playerSpriteVisualMode: playerSpriteRef.current.mode || 'canvas-fallback',
      bossDomainActive: Boolean(current.bossDomain),
      playerHitScreenShakeActive: playerImpactShakeProgress > 0,
      secretVerticalCameraOffset: Number(secretVerticalCameraOffset.toFixed(2)),
      forgottenMuralCameraFrameActive: secretVerticalCameraOffset > 0.5,
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

    const arrivalThresholdDrawn = current.arrivalThresholdActive && drawArrivalThresholdScene(ctx, current, now);
    const chinaBackgroundDrawn = !arrivalThresholdDrawn && isChinaJourney && drawChinaRiverValleyBackground(ctx, cameraX);
    const desertBackgroundDrawn = !arrivalThresholdDrawn && !chinaBackgroundDrawn && isEgyptJourney && drawDesertEntryBackground(ctx, section, cameraX);
    const sectionParallaxDrawn = !arrivalThresholdDrawn && !chinaBackgroundDrawn && !desertBackgroundDrawn && drawSectionParallaxBackground(ctx, section, cameraX);
    if (arrivalThresholdDrawn) {
      current.renderStats.parallaxLayersActive = true;
      current.renderStats.activeBackgroundSection = 'arrival-threshold';
      current.renderStats.backgroundDepthMode = 'arrival-threshold-final-art-v1';
    } else if (chinaBackgroundDrawn) {
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
      // Sky — fall back to neutral dark if atmosphere colors are missing (e.g. new civ sections)
      const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      skyGradient.addColorStop(0, atmosphere.skyTop ?? '#1a1410');
      skyGradient.addColorStop(1, atmosphere.skyBottom ?? '#2a2018');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    }

    const parallaxBackgroundDrawn = arrivalThresholdDrawn || chinaBackgroundDrawn || desertBackgroundDrawn || sectionParallaxDrawn;
    const canDrawCleanDesertEntryBackground = !DESERT_ENTRY_RESTORE_ORIGINAL_BACKDROP
      && !arrivalThresholdDrawn
      && !desertBackgroundDrawn
      && !chamberSceneActive
      && section.id === 'desert-entry';
    const desertJourneyScenePanelsDrawn = canDrawCleanDesertEntryBackground
      && drawDesertJourneyScenePanels(ctx, current, cameraX, now);
    const cleanDesertEntryPanoramaActive = false;
    if (desertJourneyScenePanelsDrawn && current.renderStats) {
      current.renderStats.activeBackgroundSection = 'desert-entry';
      current.renderStats.backgroundDepthMode = DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION;
    }
    const routeBackgroundArtDrawn = parallaxBackgroundDrawn
      || desertJourneyScenePanelsDrawn;

    // --- Ground & Props ---
    ctx.save();
    if (secretVerticalCameraOffset > 0.5) {
      ctx.translate(0, secretVerticalCameraOffset);
    }
    if (!routeBackgroundArtDrawn) drawTempleBackdrop(ctx, section, cameraX);
    if (!chamberSceneActive && !current.arrivalThresholdActive) {
      WORLD_CONTINUITY_LANDMARKS.forEach((landmark) => drawWorldContinuityLandmark(ctx, landmark, cameraX, now));
      WORLD_TRANSITION_STORY_MARKERS.forEach((marker) => drawWorldTransitionMarker(ctx, marker, cameraX, now));
      getZIndexSortedRenderableStoryProps(current).forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'background'));
      if (!cleanDesertEntryPanoramaActive) drawParticles(ctx, atmosphere, cameraX, now);
      if (desertJourneyScenePanelsDrawn) drawDesertJourneySceneMasks(ctx, current, cameraX, now);
    }

    // --- Environment Layers (Parallax) ---
    if (!routeBackgroundArtDrawn && section.id !== 'ruined-temple') {
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
    if (!chamberSceneActive && !current.arrivalThresholdActive) {
      if (!cleanDesertEntryPanoramaActive) {
        if (isEgyptJourney) drawDesertForegroundAtmosphere(ctx, section, cameraX);
        drawSectionParallaxForeground(ctx, section, cameraX);
        if (isEgyptJourney) drawOpeningPyramidMasonryBack(ctx, cameraX, now, current);
      }
      getZIndexSortedRenderableStoryProps(current).forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'midground'));
      ENVIRONMENT_INTERACTIONS.forEach((item) => drawEnvironmentInteraction(ctx, item, cameraX, now, current));
      if (!cleanDesertEntryPanoramaActive) {
        if (isEgyptJourney) drawEgyptAmbientLife(ctx, section, cameraX, now);
        drawConnectedWorldAmbientLife(ctx, section, cameraX, now);
      }
      ENVIRONMENT_EVENTS
        .filter(event => event.dynamic && event.id !== current.dynamicEnvironmentEvent?.id)
        .forEach((event) => {
          const eventSection = getSectionForX(event.x);
          if (eventSection.id !== section.id) return;
          if (eventSection.id === 'desert-entry') return;
          if (!isHorizontallyVisible(event.x, 1, cameraX, 180)) return;
          drawDynamicEnvironmentEvent(ctx, { ...event, preview: true }, cameraX, now, (event.duration || 2.5) * 0.62);
        });
      drawDynamicEnvironmentEvent(ctx, current.dynamicEnvironmentEvent, cameraX, now, current.dynamicEnvironmentEventTimer);
      drawDesertEntryGroundLane(ctx, section, cameraX);
      drawAncientRouteGround(ctx, section, cameraX, now, current);
      getZIndexSortedRenderableStoryProps(current).forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'grounded'));
      if (isEgyptJourney) {
        CHAMBER_DOOR_VISUALS
          .map(door => ({ ...door, trigger: resolveChamberEntryTrigger(door) }))
          .filter(door => door.trigger)
          .forEach((door) => drawPremiumEgyptianChamberDoor(ctx, door, cameraX, current, now));
      }
    }
    const renderablePlatforms = current.arrivalThresholdActive ? [] : getRenderablePlatforms(current);
    drawTempleThresholdHallInterior(ctx, current, now);
    drawMummificationChamberInterior(ctx, current, now);
    drawForgottenMuralChamberInterior(ctx, current, now);
    drawScribeLockedChamberInterior(ctx, current, now);
    if (
      !chamberSceneActive
      && !current.arrivalThresholdActive
      && !DESERT_ENTRY_LAYERED_NECROPOLIS_OWNS_RAVINE_VISUALS
    ) {
      drawLostBridgeStructure(ctx, renderablePlatforms, cameraX, current);
    }

    const activeBossDomain = !chamberSceneActive && !current.arrivalThresholdActive && current.bossDomain
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
          ? Math.min(1, current.bossIntroTimer / (activeBossDomain.introSeconds || 3.2))
          : 0;
        ctx.save();
        const domainFocusWorldX = activeBossDomain.bossStartX
          || current.bossIntro?.focusX
          || ((activeBossDomain.arenaStart ?? 0) + (activeBossDomain.arenaEnd ?? WORLD_WIDTH)) / 2;
        const domainFocusX = worldToScreenX(domainFocusWorldX, cameraX);
        const domainRadius = Math.max(360, Math.min(CANVAS_WIDTH * 0.92, Math.abs(domainWidth) * 0.58));
        const domainAtmosphere = ctx.createRadialGradient(
          domainFocusX,
          GROUND_Y - 92,
          92,
          domainFocusX,
          GROUND_Y - 38,
          domainRadius,
        );
        domainAtmosphere.addColorStop(0, activeBossDomain.tint || 'rgba(67, 24, 24, 0.18)');
        domainAtmosphere.addColorStop(0.52, 'rgba(36, 22, 16, 0.12)');
        domainAtmosphere.addColorStop(1, 'rgba(36, 22, 16, 0)');
        ctx.fillStyle = domainAtmosphere;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        if (introProgress > 0) {
          const introAtmosphere = ctx.createRadialGradient(
            domainFocusX,
            GROUND_Y - 62,
            80,
            domainFocusX,
            GROUND_Y - 24,
            domainRadius * 0.82,
          );
          introAtmosphere.addColorStop(0, `rgba(12, 8, 5, ${0.16 + introProgress * 0.18})`);
          introAtmosphere.addColorStop(0.58, `rgba(12, 8, 5, ${0.06 + introProgress * 0.08})`);
          introAtmosphere.addColorStop(1, 'rgba(12, 8, 5, 0)');
          ctx.fillStyle = introAtmosphere;
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          if (activeBossDomain.buriedSandEmergence) {
            const beat = getScarabQueenEmergenceBeat(introProgress);
            const sealScreenX = worldToScreenX(activeBossDomain.bossStartX || current.bossIntro.focusX, cameraX);
            const sealPulse = Math.sin(now / 120) * (0.12 + beat.sandEruption * 0.18) + 0.9 + beat.sandEruption * 0.22;
          const revealProgress = beat.sceneProgress;
          if (sealScreenX > -120 && sealScreenX < CANVAS_WIDTH + 120) {
              const lairBoss = getEditedMiniBoss(current.miniBosses.find(boss => boss.id === activeBossDomain.bossId) || {});
              const lairPlacement = getScarabQueenLairPlacement(lairBoss);
              drawScarabQueenLairOpeningProp(ctx, lairPlacement.x || activeBossDomain.bossStartX || current.bossIntro.focusX, cameraX, now, beat, lairPlacement);
              const sealGlow = ctx.createRadialGradient(sealScreenX, GROUND_Y - 62, 12, sealScreenX, GROUND_Y - 62, 170 * sealPulse + beat.sandEruption * 90);
              sealGlow.addColorStop(0, `rgba(250, 204, 21, ${0.16 + beat.glyphGlow * 0.3 + beat.queenRise * 0.16})`);
              sealGlow.addColorStop(0.48, `rgba(45, 212, 191, ${0.08 + beat.sandEruption * 0.2})`);
              sealGlow.addColorStop(1, 'rgba(120, 53, 15, 0)');
              ctx.fillStyle = sealGlow;
              ctx.beginPath();
              ctx.ellipse(sealScreenX, GROUND_Y - 62, 156 * sealPulse, 72 * sealPulse, 0, 0, Math.PI * 2);
              ctx.fill();
              if (beat.sandEruption > 0) {
                ctx.strokeStyle = `rgba(253, 224, 71, ${0.62 * (1 - beat.sandEruption)})`;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(sealScreenX, GROUND_Y - 56, 26 + beat.sandEruption * 230, 0, Math.PI * 2);
                ctx.stroke();
              }
              ctx.strokeStyle = `rgba(250, 204, 21, ${0.45 + revealProgress * 0.25})`;
              ctx.lineWidth = 2;
              [0, 1, 2].forEach((ring) => {
                ctx.beginPath();
                ctx.ellipse(sealScreenX, GROUND_Y - 40, 48 + ring * 32 + revealProgress * 18, 12 + ring * 6, 0, 0, Math.PI * 2);
                ctx.stroke();
              });
              ctx.fillStyle = `rgba(217, 119, 6, ${0.16 + beat.sandEruption * 0.24})`;
              for (let index = 0; index < 18; index += 1) {
                const angle = (index / 18) * Math.PI * 2 + now / 900;
                const radius = 28 + beat.sandEruption * 132 + Math.sin(now / 80 + index) * 8;
                ctx.beginPath();
                ctx.arc(sealScreenX + Math.cos(angle) * radius, GROUND_Y - 30 + Math.sin(angle) * radius * 0.24, 2.2 + beat.sandEruption * 1.8, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
          const introMarkers = activeBossDomain.buriedSandEmergence
            ? [{ x: current.bossIntro.focusX }]
            : [
              { x: current.player.x + current.player.width / 2 },
              { x: current.bossIntro.focusX },
            ];
          introMarkers.forEach(marker => {
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
        });
        ctx.restore();
      }
    }

    // --- Entities ---
    if (!current.arrivalThresholdActive) {
      const bridgePlatforms = renderablePlatforms.filter(platform => platform.variant === 'lost-bridge');
      const nonBridgePlatforms = renderablePlatforms.filter(platform => platform.variant !== 'lost-bridge');
      nonBridgePlatforms.forEach((platform) => drawPlatform(ctx, platform, cameraX, current));
      if (!chamberSceneActive && !DESERT_ENTRY_LAYERED_NECROPOLIS_OWNS_RAVINE_VISUALS) {
        drawLostBridgeRavineDepth(ctx, renderablePlatforms, cameraX, current);
      }
      bridgePlatforms.forEach((platform) => drawPlatform(ctx, platform, cameraX, current));
      getZIndexSortedRenderableStoryProps(current).forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'route-edge'));
    }
    if (!chamberSceneActive && !current.arrivalThresholdActive) {
      getActiveHiddenRoutes().forEach(route => drawHiddenRouteHint(ctx, route, cameraX, current, now));
      drawSectionTransitionBlend(ctx, cameraX);
    }
    
    if (!current.arrivalThresholdActive) {
      getRenderableHazards(current).forEach((hazard) => drawHazard(ctx, hazard, cameraX, current, now));
      (current.trapProjectiles || []).forEach((projectile) => drawTrapProjectile(ctx, projectile, cameraX));
    }

    if (!chamberSceneActive && !current.arrivalThresholdActive) getRenderableCheckpoints().forEach((checkpoint) => {
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

    const activeBossDomainForObjectiveMarkers = current.bossDomain
      && !current.defeatedMiniBosses.has(current.bossDomain.bossId)
      ? current.bossDomain
      : null;
    if (!chamberSceneActive && !current.arrivalThresholdActive) getRouteGateDoorwayEntries().forEach((entry) => {
      const status = getDoorwayGateStatus(entry, current);
      const gate = status.activeGate;
      const doorway = entry.doorway;
      if (!gate) return;
      const doorwayAnchorX = doorway?.anchorX ?? gate.x;
      const doorwayWidth = doorway?.width ?? gate.width;
      const doorwayLeft = doorway ? doorwayAnchorX - doorwayWidth / 2 : gate.x;
      if (
        activeBossDomainForObjectiveMarkers
        && doorwayAnchorX >= (activeBossDomainForObjectiveMarkers.arenaStart ?? -Infinity) - 24
        && doorwayAnchorX <= (activeBossDomainForObjectiveMarkers.arenaEnd ?? Infinity) + 72
      ) return;
      const gx = worldToScreenX(doorway ? doorwayAnchorX : gate.x, cameraX);
      if (!isHorizontallyVisible(doorwayLeft, doorwayWidth, cameraX, 100)) return;
      drawRouteGate(ctx, gate, gx, current, status.complete, 'base', doorway);
    });
    if (!chamberSceneActive && !current.arrivalThresholdActive && !activeBossDomainForObjectiveMarkers) drawMissingObjectiveMarker(ctx, activeGateGuidance, cameraX, now);

    if (!chamberSceneActive && !current.arrivalThresholdActive) STAGE_ENTRANCE_FEATURES.forEach((feature) => {
      if (!shouldRenderStageEntranceFeatureForState(feature, current)) return;
      drawStageEntranceFeature(ctx, feature, cameraX, now);
    });

    if (!current.arrivalThresholdActive && !current.enemiesDisabled) current.enemies.forEach((enemy) => {
      if (!isEnemyDefeatedVisible(enemy)) return;
      if (!isEntityActiveInScene(enemy, current)) return;
      const activeBossDomain = current.bossDomain
        && !current.defeatedMiniBosses.has(current.bossDomain.bossId)
        ? current.bossDomain
        : null;
      if (!enemy.defeated && isNormalEnemyInsideBossFocus(enemy, activeBossDomain)) return;
      const ex = worldToScreenX(enemy.x, cameraX);
      if (!isHorizontallyVisible(enemy.x, enemy.width, cameraX, 50)) return;
      const enemyGroundPlaneRenderY = getGroundPlaneEntityRenderY(enemy, current);
      const renderEnemy = Number.isFinite(enemyGroundPlaneRenderY) && enemyGroundPlaneRenderY !== enemy.y
        ? { ...enemy, y: enemyGroundPlaneRenderY }
        : enemy;
      if (!enemy.defeated && enemy.encounterRole && current.renderStats) {
        current.renderStats.visibleCombatPressureEnemies = Array.from(new Set([
          ...(current.renderStats.visibleCombatPressureEnemies || []),
          enemy.id,
        ])).slice(-8);
      }
      
      ctx.save();
      const shakeX = enemy.hitFlash > 0 ? Math.sin(now / 20) * 5 : 0;
      if (!enemy.defeated) drawEnemyAttackTell(ctx, renderEnemy, ex, cameraX, now, false, true);

      // Main Visual
      const spriteDrawn = drawSmallEnemySprite(ctx, renderEnemy, ex, now, shakeX)
        || drawLinkedEnemySprite(ctx, renderEnemy, ex, now, shakeX);
      if (!spriteDrawn) {
        if (enemy.defeated) {
          drawContactShadow(ctx, ex + enemy.width / 2, renderEnemy.y + enemy.height + 3, enemy.width * 0.62, 0.12, 0.75);
          drawGroundDustLip(ctx, ex + enemy.width / 2, renderEnemy.y + enemy.height + 2, enemy.width * 0.68, 'rgba(95, 58, 27, 0.24)');
        } else if (enemy.type === 'scorpion-nest') {
          // Placement + appearance are editor-tunable (Shift+E, click the nest); falls
          // back to SCORPION_NEST_EDITOR_DEFAULTS when no edit exists.
          const nestParams = getEditedNestParams(enemy);
          const nestCx = worldToScreenX(nestParams.x, cameraX) + enemy.width / 2 + shakeX;
          const nestGroundPlaneOffsetY = getDesertEntryVisualGroundOffsetY(
            nestParams.x + enemy.width / 2,
            nestParams.y + enemy.height + nestParams.yOffset,
            current,
          );
          const nestBaseY = nestParams.y + enemy.height + nestParams.yOffset + nestGroundPlaneOffsetY;
          const nestAsset = scorpionNestRef.current;
          const nestGlow = 0.4 + Math.sin(now / 220) * 0.25;
          if (nestAsset.loaded && nestAsset.image) {
            // Real nest art: widen the footprint to the art's native aspect (~2.4:1
            // visible nest baked into the PNG) and anchor the flat burrow lip at the
            // ground line so it sits flush. Native aspect avoids horizontal stretch.
            const nestNativeAspect = (nestAsset.image.naturalWidth || nestAsset.image.width || 3)
              / (nestAsset.image.naturalHeight || nestAsset.image.height || 2);
            const nestDrawWidth = enemy.width * nestParams.widthScale;
            const nestDrawHeight = nestDrawWidth / nestNativeAspect;
            const nestDrawX = nestCx - nestDrawWidth / 2;
            const nestDrawY = nestBaseY - nestDrawHeight;
            drawContactShadow(ctx, nestCx, nestBaseY + 3, nestDrawWidth * 0.52, 0.26, 0.9);
            ctx.drawImage(nestAsset.image, nestDrawX, nestDrawY, nestDrawWidth, nestDrawHeight);
            // Pulsing amber glow over the burrow mouth (centered near the base).
            const glowY = nestBaseY - enemy.height * nestParams.glowYFactor;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const glowGrad = ctx.createRadialGradient(nestCx, glowY, 1, nestCx, glowY, 16 * nestParams.glowSize);
            glowGrad.addColorStop(0, `rgba(255, 168, 76, ${nestGlow})`);
            glowGrad.addColorStop(1, 'rgba(255, 168, 76, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.ellipse(nestCx, glowY, 18 * nestParams.glowSize, 11 * nestParams.glowSize, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            // Placeholder nest visual (final art not yet loaded): a sand mound with a
            // dark burrow opening and pulsing amber eyes.
            drawContactShadow(ctx, nestCx, nestBaseY + 3, enemy.width * 0.95, 0.26, 0.9);
            ctx.fillStyle = '#7a4a1f';
            ctx.strokeStyle = 'rgba(28, 16, 6, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(nestCx, nestBaseY - enemy.height * 0.32, enemy.width * 0.5, enemy.height * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#160d05';
            ctx.beginPath();
            ctx.ellipse(nestCx, nestBaseY - enemy.height * 0.34, enemy.width * 0.24, enemy.height * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(217, 119, 47, ${nestGlow})`;
            ctx.beginPath();
            ctx.ellipse(nestCx - 6, nestBaseY - enemy.height * 0.36, 2.4, 2.4, 0, 0, Math.PI * 2);
            ctx.ellipse(nestCx + 6, nestBaseY - enemy.height * 0.36, 2.4, 2.4, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          drawContactShadow(ctx, ex + enemy.width / 2, renderEnemy.y + enemy.height + 3, enemy.width * 0.72, 0.16, 0.75);
          ctx.fillStyle = enemy.type === 'guardian' || enemy.type === 'statue' ? '#6b7280' : '#78350f';
          ctx.strokeStyle = 'rgba(30, 18, 8, 0.45)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(ex + enemy.width / 2 + shakeX, renderEnemy.y + enemy.height * 0.55, enemy.width * 0.45, enemy.height * 0.43, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Unblockable windup aura is now drawn (in red) by drawEnemyAttackTell's
      // colour-coded telegraph, so the old pale-gold ellipse here was removed to
      // avoid a conflicting double ring.

      // Only show normal enemy health after damage so full bars do not read as platforms.
      if (!enemy.defeated && enemy.health > COMBAT_DAMAGE_SCALE && enemy.health < enemy.maxHealth) {
        const enemyDrawBox = getEnemySpriteDrawBox(renderEnemy, ex, 0, getCombatMode(enemy)) || {
          x: ex,
          y: renderEnemy.y,
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

    if (!current.enemiesDisabled) current.miniBosses.forEach((boss) => {
      const editedBoss = getEditedMiniBoss(boss);
      const lairPlacement = getScarabQueenLairPlacement(editedBoss);
      if (!isEntityActiveInScene(boss, current)) return;
      if (boss.defeated) return;
      const bx = worldToScreenX(boss.x, cameraX);
      if (!isHorizontallyVisible(boss.x, boss.width, cameraX, 100)) return;
      const bossGroundPlaneRenderY = getGroundPlaneEntityRenderY(boss, current);
      const renderBoss = Number.isFinite(bossGroundPlaneRenderY) && bossGroundPlaneRenderY !== boss.y
        ? { ...boss, y: bossGroundPlaneRenderY }
        : boss;
      const isBuriedScarabQueen = boss.id === SCARAB_SEAL_TRIGGER.bossId
        && isEgyptJourney;
      const bossIntroActive = current.bossIntro?.id === boss.id;
      const bossDomainActive = isBuriedScarabQueen && current.bossDomain?.bossId === boss.id;
      if (isBuriedScarabQueen && !boss.awakened && !bossIntroActive) {
        drawScarabQueenLairOpeningProp(ctx, lairPlacement.x, cameraX, now, null, lairPlacement);
        return;
      }
      if (bossDomainActive) {
        drawScarabQueenLairOpeningProp(ctx, lairPlacement.x || current.bossDomain.bossStartX || boss.x + boss.width / 2, cameraX, now, null, lairPlacement);
      }
      drawMiniBoss(ctx, renderBoss, bx, now);
      if (!bossIntroActive) drawEnemyAttackTell(ctx, renderBoss, bx, cameraX, now, true, true);
    });

    if (
      !chamberSceneActive
      && !current.arrivalThresholdActive
      && !DESERT_ENTRY_LAYERED_NECROPOLIS_OWNS_RAVINE_VISUALS
    ) {
      drawLostBridgeRavineForegroundVoid(ctx, renderablePlatforms, cameraX, current);
    }

    (current.bossKeyItems || []).forEach((keyItem) => {
      if (chamberSceneActive) return;
      if (!keyItem.dropped || keyItem.collected) return;
      drawCollectible(ctx, keyItem.x, keyItem.y, cameraX, now, keyItem.label || 'S', keyItem.color || '#b45309', false, false, {
        key: keyItem.spriteKey || 'loreTablet',
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
      const platform = getRenderablePlatforms(current)
        .filter(p => p.y !== GROUND_Y)
        .find(p => (
          shard.x >= p.x - 8
          && shard.x <= p.x + p.width + 8
          && Math.abs(shard.y - (p.y + p.height)) <= 34
        ));
      if (platform) return platform.y - 4;
      return shard.y + COLLECTIBLE_VISUAL_BASE.relicShard.anchorYOffset;
    };

    RELIC_SHARDS.forEach(shard => {
      if (chamberSceneActive) return;
      if (current.collectedShardIds.has(shard.id)) return;
      const routeRewardAccessible = isRouteRewardAccessible(shard.routeId, current);
      const visible = (!shard.hidden || current.collectedUpgrades.has('historian-vision') || routeRewardAccessible)
        && (!shard.routeId || routeRewardAccessible);
      if (visible) {
        drawCollectible(ctx, shard.x, shard.y, cameraX, now, '💎', '#f59e0b', shard.hidden, true, {
          key: getRelicShardSpriteKey(shard),
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
      if (!isEntityActiveInScene(secret, current)) return;
      if (current.collectedSecretIds?.has(secret.id)) return;
      const discoveredRoute = current.discoveredHiddenRouteIds?.has(secret.routeId);
      const routeRewardAccessible = isRouteRewardAccessible(secret.routeId, current);
      if (!routeRewardAccessible && Math.abs(secret.x - current.player.x) > 260) return;
      drawCollectible(ctx, secret.x, secret.y, cameraX, now, secret.shortName?.slice(0, 1) || 'S', secret.color || '#b45309', true, false, {
        key: secret.spriteKey || 'loreTablet',
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
      if (chamberSceneActive) return;
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
      if (chamberSceneActive) return;
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
      if (chamberSceneActive) return;
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
      if (chamberSceneActive) return;
      if (current.collectedObjectiveIds.has(marker.id)) return;
      const mx = worldToScreenX(marker.x, cameraX);
      if (!isHorizontallyVisible(marker.x, 1, cameraX, 50)) return;
      const emoji = marker.type === 'switch' ? '⚙️' : marker.type === 'glyph' ? '📜' : marker.type === 'escape' ? '🏃' : '🚩';
      const markerNeeded = activeGateGuidance?.nearestMissingObjective?.id === marker.id;
      const markerSize = marker.type === 'map-tablet'
        ? COLLECTIBLE_VISUAL_BASE.objective.mapTabletSize
        : COLLECTIBLE_VISUAL_BASE.objective.size;
      const markerBaseY = marker.visualBaseY ?? (marker.y + 12 + COLLECTIBLE_VISUAL_BASE.objective.anchorYOffset);
      ctx.save();
      drawCollectible(ctx, marker.x + 15, marker.y + 12, cameraX, now, emoji, marker.color || '#b45309', false, false, {
        key: getObjectiveSpriteKey(marker.type),
        kind: 'objective',
        size: markerSize,
        ringSize: COLLECTIBLE_VISUAL_BASE.objective.ringSize,
        glowAlpha: 0,
        shadowAlpha: marker.groundedProp ? 0.22 : COLLECTIBLE_VISUAL_BASE.objective.shadowAlpha,
        shadowWidth: marker.groundedProp ? markerSize * 0.82 : undefined,
        bobAmplitude: marker.groundedProp ? 0 : COLLECTIBLE_VISUAL_BASE.objective.bobAmplitude,
        sparkleAlpha: marker.groundedProp ? 0 : COLLECTIBLE_VISUAL_BASE.objective.sparkleAlpha,
        sparkleSize: marker.groundedProp ? 0 : COLLECTIBLE_VISUAL_BASE.objective.sparkleSize,
        anchorYOffset: COLLECTIBLE_VISUAL_BASE.objective.anchorYOffset,
        baseY: markerBaseY,
        nearGlowDistance: COLLECTIBLE_VISUAL_BASE.objective.nearGlowDistance,
        hideGlow: true,
      });
      if (showWorldLabel(marker.x, markerNeeded ? 170 : 120, markerNeeded ? 'critical' : 'normal')) {
        drawFieldNoteLabel(ctx, mx + 15, marker.groundedProp ? markerBaseY - markerSize - 10 : marker.y - 15, marker.label, marker.color || '#b45309');
      }
      ctx.restore();
    });

    if (!chamberSceneActive) drawDiscoveryEntrance(ctx, DISCOVERY_ENTRANCE, cameraX, current, now);

    const suppressRuntimeAttackArc = playerSpriteRef.current.mode === 'hero-atlas'
      && playerSpriteRef.current.atlas?.draw?.suppressRuntimeAttackArc;
    if (current.attackTimer > 0 && !suppressRuntimeAttackArc) {
      drawAttackArc(ctx, current.playerAttackBox, cameraX, player.direction, '#facc15', getPlayerAttackState(current));
    } else if (current.attackTimer > 0 && current.renderStats) {
      current.renderStats.playerAttackArcMode = 'integrated-hero-atlas';
    }
    drawArrivalThresholdTrial(ctx, current, now);
    drawOpeningSphinxEncounter(ctx, current.openingSphinxEncounter, cameraX, now);
    drawCombatEffects(ctx, current.combatHitEffects, cameraX, now);
    drawDesertEntryGroundMotionCues(ctx, player, cameraX, now);
    const playerRenderY = Number.isFinite(playerGroundPlaneRenderY) ? playerGroundPlaneRenderY : player.y;
    const hasDedicatedDodgeRow = playerSpriteRef.current.mode === 'hero-atlas'
      && Boolean(getHeroSpriteRow(playerSpriteRef.current.atlas, 'dodge'));
    if (current.dodgeTrail?.length && !hasDedicatedDodgeRow) {
      current.dodgeTrail.forEach((ghost) => {
        ctx.save();
        ctx.globalAlpha = clamp(ghost.alpha, 0, 0.35);
        const ghostGroundPlaneRenderY = getGroundPlaneEntityRenderY({
          x: ghost.x,
          y: ghost.y,
          width: player.width,
          height: player.height,
        }, current);
        const ghostRenderY = Number.isFinite(ghostGroundPlaneRenderY) ? ghostGroundPlaneRenderY : ghost.y;
        drawPlayerSprite(ctx, ghost.x - cameraX, ghostRenderY, player.width, player.height, ghost.dir, 0, now);
        ctx.restore();
      });
    }
    drawPlayerSprite(ctx, player.x - cameraX, playerRenderY, player.width, player.height, player.direction, player.invulnerable, now);
    if (!chamberSceneActive && !current.arrivalThresholdActive && section.id === 'desert-entry' && current.renderStats) {
      current.renderStats.desertEntryForegroundDepthLoaded = false;
      current.renderStats.desertEntryForegroundDepthMode = 'retired-integrated-background-carries-front-edge';
    }
    drawForegroundOccluderProps(ctx, current, cameraX, now);
    if (!chamberSceneActive) getRouteGateDoorwayEntries().forEach((entry) => {
      const status = getDoorwayGateStatus(entry, current);
      const gate = status.activeGate;
      const doorway = entry.doorway;
      if (!gate) return;
      const doorwayAnchorX = doorway?.anchorX ?? gate.x;
      const doorwayWidth = doorway?.width ?? gate.width;
      const doorwayLeft = doorway ? doorwayAnchorX - doorwayWidth / 2 : gate.x;
      if (
        activeBossDomainForObjectiveMarkers
        && doorwayAnchorX >= (activeBossDomainForObjectiveMarkers.arenaStart ?? -Infinity) - 24
        && doorwayAnchorX <= (activeBossDomainForObjectiveMarkers.arenaEnd ?? Infinity) + 72
      ) return;
      const gx = worldToScreenX(doorway ? doorwayAnchorX : gate.x, cameraX);
      if (!isHorizontallyVisible(doorwayLeft, doorwayWidth, cameraX, 100)) return;
      drawRouteGate(ctx, gate, gx, current, status.complete, 'foreground', doorway);
    });
    if (!chamberSceneActive) STAGE_ENTRANCE_FEATURES.forEach((feature) => {
      if (!shouldRenderStageEntranceFeatureForState(feature, current)) return;
      drawStageEntranceForegroundOccluder(ctx, feature, cameraX, now);
    });
    drawArrivalThresholdDoorwayOccluder(ctx, current, now);
    if (!chamberSceneActive && ENABLE_FOREGROUND_DEPTH_LAYER) {
      drawForegroundDepthLayer(ctx, section, cameraX, now);
    }
    drawOpeningThresholdScene(ctx, current.openingThresholdScene, cameraX, now);
    drawTempleThresholdTransition(ctx, current.templeThresholdTransition, now);
    drawForgottenMuralChamberTransition(ctx, current.forgottenMuralChamberTransition);
    drawOpeningCinematic(ctx, current.openingCinematic, now);
    ctx.restore();

    drawPlayerFeedbackOverlays(ctx, current, cameraX, secretVerticalCameraOffset, now);

    drawDebugPlatformOverlay(ctx, current, cameraX);

    drawPropPlacementEditorOverlay(ctx, current, cameraX);

    ctx.restore();

    drawCinematicCards(ctx, current);
  }, [backgroundPackId, drawAncientRouteGround, drawArrivalThresholdDoorwayOccluder, drawArrivalThresholdScene, drawArrivalThresholdTrial, drawAttackArc, drawCinematicCards, drawCollectible, drawCombatEffects, drawConnectedWorldAmbientLife, drawChinaRiverValleyBackground, drawDebugPlatformOverlay, drawDesertEntryGroundLane, drawDesertEntryGroundMotionCues, drawDesertEntryBackground, drawDesertForegroundAtmosphere, drawDesertJourneySceneMasks, drawDesertJourneyScenePanels, drawDiscoveryEntrance, drawDynamicEnvironmentEvent, drawEgyptAmbientLife, drawEnemyAttackTell, drawEnvironmentInteraction, drawForegroundDepthLayer, drawForegroundOccluderProps, drawTempleThresholdHallInterior, drawMummificationChamberInterior, drawForgottenMuralChamberInterior, drawForgottenMuralChamberTransition, drawHazard, drawHiddenRouteHint, drawLinkedEnemySprite, drawLostBridgeRavineDepth, drawLostBridgeRavineForegroundVoid, drawLostBridgeStructure, drawMiniBoss, drawMissingObjectiveMarker, drawOpeningCinematic, drawOpeningPyramidMasonryBack, drawOpeningSphinxEncounter, drawOpeningThresholdScene, drawParticles, drawPlatform, drawPlayerFeedbackOverlays, drawPremiumEgyptianChamberDoor, drawPropPlacementEditorOverlay, drawRouteGate, drawScarabQueenLairOpeningProp, drawScribeLockedChamberInterior, drawSectionParallaxBackground, drawSectionParallaxForeground, drawSectionTransitionBlend, drawSmallEnemySprite, drawStageEntranceFeature, drawStageEntranceForegroundOccluder, drawStoryProp, drawTempleBackdrop, drawTempleThresholdTransition, drawTrapProjectile, drawWorldContinuityLandmark, drawWorldTransitionMarker, getActiveHiddenRoutes, getActiveSecretCollectibles, getCombatMode, getDesertEntryVisualGroundOffsetY, getDoorwayGateStatus, getEditedMiniBoss, getEditedNestParams, getGateGuidance, getGroundPlaneEntityRenderY, getPlayerAttackState, getRenderableCheckpoints, getRenderableHazards, getRenderablePlatforms, getZIndexSortedRenderableStoryProps, getRouteGateDoorwayEntries, getScarabQueenLairPlacement, isRouteRewardAccessible, resolveChamberEntryTrigger, scopedJourneyAssetPacks.isChinaJourney, scopedJourneyAssetPacks.isRomeJourney, drawPlayerSprite, drawFieldNoteLabel]);

  const startOpeningCinematic = useCallback(({ speechEnabled = true, fromArrivalThreshold = false } = {}) => {
    const current = stateRef.current;
    const isRomeCinematic = scopedJourneyAssetPacks.isRomeJourney;
    const isChinaCinematic = scopedJourneyAssetPacks.isChinaJourney;
    const openingCinematicId = isRomeCinematic
      ? ROME_OPENING_CINEMATIC_ID
      : isChinaCinematic
        ? CHINA_OPENING_CINEMATIC_ID
        : EGYPT_OPENING_CINEMATIC_ID;
    const openingArrivalNotice = getOpeningArrivalNoticeForCinematicId(openingCinematicId);
    if (fromArrivalThreshold) {
      current.arrivalThresholdActive = false;
      current.arrivalThresholdGateTriggered = true;
    }
    if (current.openingConfrontationSeen) {
      current.openingCinematic = null;
      current.openingThresholdScene = null;
      current.openingSphinxEncounter = null;
      current.sectionTransition = null;
      current.sectionTransitionTimer = 0;
      current.environmentEvent = null;
      current.environmentEventTimer = 0;
      current.cinematicEvent = {
        id: 'opening-confrontation-replay-skipped',
        name: 'Asha',
        message: openingArrivalNotice,
        temporary: true,
      };
      current.cinematicTimer = 3.0;
      current.notice = openingArrivalNotice;
      current.player.x = DESERT_ENTRY_EXTERIOR_SPAWN_X;
      current.player.y = GROUND_Y - current.player.height;
      current.player.vx = 0;
      current.player.vy = 0;
      current.cameraX = 0;
      current.targetCameraX = 0;
      current.openingCameraRevealTimer = Math.max(current.openingCameraRevealTimer, OPENING_CAMERA_REVEAL_DURATION);
      setBriefingOpen(false);
      syncHud();
      return;
    }
    audioControls?.unlockExpeditionSfx?.();
    audioControls?.playExpeditionSfx?.(openingAtmosphereSfxKey);
    if (!isRomeCinematic && !isChinaCinematic) {
      audioControls?.playExpeditionSfx?.('anubisPresenceStinger', { volume: 0.82 });
    }
    spokenOpeningLineRef.current = null;
    const baseCinematicLines = getOpeningCinematicLines(targetCivilisation);
    const thresholdTrialReactionLines = fromArrivalThreshold && current.arrivalThresholdTrial?.completed
      ? ARRIVAL_THRESHOLD_ANUBIS_TRIAL_LINES.map((text, index) => ({
        id: `anubis-threshold-trial-${index + 1}`,
        at: 10.2 + index * 1.8,
        speaker: 'Anubis',
        voice: 'guardian',
        text,
      }))
      : [];
    const reactionTimeShift = thresholdTrialReactionLines.length * 1.8;
    const activeCinematicLines = thresholdTrialReactionLines.length
      ? [
        ...baseCinematicLines.slice(0, 4),
        ...thresholdTrialReactionLines,
        ...baseCinematicLines.slice(4).map(line => ({
          ...line,
          at: line.at + reactionTimeShift,
        })),
      ]
      : baseCinematicLines;
    const openingCinematicDuration = (isChinaCinematic ? CHINA_OPENING_CINEMATIC_DURATION : OPENING_CINEMATIC_DURATION)
      + reactionTimeShift;
    const openingCinematicImpactAt = (isChinaCinematic ? CHINA_OPENING_CINEMATIC_IMPACT_AT : OPENING_CINEMATIC_SPELL_IMPACT_AT)
      + reactionTimeShift;
    current.openingCinematic = {
      id: openingCinematicId,
      title: isRomeCinematic ? 'The Vault Speaks First' : isChinaCinematic ? 'The Watchtower Wakes' : 'The First Seal Watches',
      duration: openingCinematicDuration,
      timer: openingCinematicDuration,
      spellImpactAt: openingCinematicImpactAt,
      speechEnabled,
      lines: activeCinematicLines,
      activeLineId: activeCinematicLines[0].id,
      spellImpactTriggered: false,
      shieldShattered: false,
    };
    current.openingConfrontationSeen = true;
    current.sectionTransition = null;
    current.sectionTransitionTimer = 0;
    current.environmentEvent = null;
    current.environmentEventTimer = 0;
    current.cinematicEvent = null;
    current.cinematicTimer = 0;
    current.notice = activeCinematicLines[0].text;
    current.player.vx = 0;
    current.player.vy = 0;
    current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.32);
    current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.18);
    setBriefingOpen(false);
    syncHud();
  }, [audioControls, openingAtmosphereSfxKey, scopedJourneyAssetPacks.isChinaJourney, scopedJourneyAssetPacks.isRomeJourney, syncHud, targetCivilisation]);

  const completeOpeningThresholdScene = useCallback((current) => {
    const openingCheckpoint = getRenderableCheckpoints().find(checkpoint => checkpoint.id === 'desert-entry');
    const openingSection = SECTIONS.find(section => section.id === 'desert-entry');
    if (openingCheckpoint) {
      current.player.vx = 0;
      current.player.vy = 0;
      current.player.direction = -1;
      current.player.x = ARRIVAL_THRESHOLD_SPAWN_X;
      current.player.y = getArrivalThresholdGroundY(ARRIVAL_THRESHOLD_SPAWN_X + current.player.width / 2) - current.player.height;
      current.player.onGround = true;
      current.activeCheckpoint = openingCheckpoint;
      current.cameraX = 0;
      current.targetCameraX = current.cameraX;
    }
    current.openingThresholdScene = null;
    current.openingSphinxEncounter = null;
    current.currentSectionId = 'arrival-threshold';
    current.arrivalThresholdActive = true;
    current.arrivalThresholdStarted = true;
    current.arrivalThresholdLeftInspected = false;
    current.arrivalThresholdMarkingsInspected = false;
    current.arrivalThresholdGateTriggered = false;
    current.arrivalThresholdTrial = null;
    current.arrivalThresholdWakeProgress = 0;
    current.arrivalThresholdNoticeTimer = 2.4;
    current.dynamicEnvironmentEvent = null;
    current.dynamicEnvironmentEventTimer = 0;
    current.collapsedPlatformIds.delete('opening-scarab-seal-summit');
    current.sectionTransition = null;
    current.sectionTransitionTimer = 0;
    current.lastSectionId = openingSection?.id || 'desert-entry';
    current.notice = ARRIVAL_THRESHOLD_OBJECTIVE_LINE;
    current.cinematicEvent = {
      id: 'arrival-threshold-spawn',
      name: 'Asha',
      message: ARRIVAL_THRESHOLD_SPAWN_LINE,
      temporary: true,
    };
    current.cinematicTimer = 2.4;
    current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.4);
    current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.18);
    current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.08);
    syncHud();
  }, [getRenderableCheckpoints, syncHud]);

  const startJourneyWithoutOpeningScene = useCallback(() => {
    const current = stateRef.current;
    audioControls?.unlockExpeditionSfx?.();
    audioControls?.playExpeditionSfx?.(openingAtmosphereSfxKey);
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    spokenOpeningLineRef.current = null;
    const playTarget = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('play')
      : null;
    const startAtArrivalThreshold = openingStartMode === 'arrival-threshold' && playTarget !== 'exterior';
    if (startAtArrivalThreshold) {
      current.openingConfrontationSeen = false;
      completeOpeningThresholdScene(current);
      openingStartModeConsumedRef.current = true;
      setBriefingOpen(false);
      return;
    }
    current.openingCinematic = null;
    current.openingConfrontationSeen = true;
    current.player.vx = 0;
    current.player.vy = 0;
    current.notice = SCARAB_SEAL_TRIGGER.objectiveEchoLine;
    setBriefingOpen(false);
    syncHud();
  }, [audioControls, completeOpeningThresholdScene, openingAtmosphereSfxKey, openingStartMode, syncHud]);

  // Dev-only quick start (paired with the `?play` flag in App.jsx / ExpeditionMode):
  // once the journey mounts, skip its briefing + opening cinematic so a cold
  // `?play` load lands directly in playable gameplay. Fires once per session.
  const quickStartConsumedRef = useRef(false);
  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return undefined;
    if (quickStartConsumedRef.current) return undefined;
    if (!new URLSearchParams(window.location.search).has('play')) return undefined;
    quickStartConsumedRef.current = true;
    const timer = window.setTimeout(() => {
      startJourneyWithoutOpeningScene();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [startJourneyWithoutOpeningScene]);

  const skipOpeningCinematic = useCallback(() => {
    const current = stateRef.current;
    if (!current.openingCinematic) return;
    const openingArrivalNotice = getOpeningArrivalNoticeForCinematicId(current.openingCinematic.id);
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    current.openingCinematic = null;
    current.notice = openingArrivalNotice;
    current.cinematicEvent = {
      id: 'opening-arrival-aftershock',
      name: 'Asha',
      message: openingArrivalNotice,
      temporary: true,
    };
    current.cinematicTimer = 3.4;
    audioControls?.playExpeditionSfx?.('lostSiteAirShift', { volume: 0.54 });
    current.openingCameraRevealTimer = Math.max(current.openingCameraRevealTimer, OPENING_CAMERA_REVEAL_DURATION);
    syncHud();
  }, [audioControls, syncHud]);

  const queueAttack = useCallback((attackType = PLAYER_ATTACK_TYPES.LIGHT) => {
    const current = stateRef.current;
    if (briefingOpen || current.failed || current.completed || current.openingCinematic || current.openingCameraRevealTimer > 0 || current.openingThresholdScene?.lockMovement || current.templeThresholdTransition?.lockMovement) return;
    if (current.dodgeTimer > 0 || current.dodgeRecoveryTimer > 0) return;
    const canBufferHeavyFollowup = attackType === PLAYER_ATTACK_TYPES.HEAVY
      && current.attackComboWindowTimer > 0
      && current.attackComboLanded;
    if (current.attackCooldown > 0 || current.attackWindupTimer > 0 || current.attackTimer > 0 || current.attackRecoilTimer > 0) {
      if (!canBufferHeavyFollowup) return;
      current.attackQueued = true;
      current.attackQueuedType = PLAYER_ATTACK_TYPES.HEAVY;
      current.attackQueuedHeavyFollowupPrimed = true;
      current.heavyFollowupReadyTimer = Math.max(current.heavyFollowupReadyTimer || 0, current.attackComboWindowTimer || 0);
      return;
    }
    current.attackQueued = true;
    current.attackQueuedType = attackType === PLAYER_ATTACK_TYPES.HEAVY
      ? PLAYER_ATTACK_TYPES.HEAVY
      : PLAYER_ATTACK_TYPES.LIGHT;
    current.attackQueuedHeavyFollowupPrimed = attackType === PLAYER_ATTACK_TYPES.HEAVY && canBufferHeavyFollowup;
  }, [briefingOpen]);

  const queueDodge = useCallback(() => {
    const current = stateRef.current;
    const player = current.player;
    if (briefingOpen || current.failed || current.completed || current.openingCinematic || current.openingCameraRevealTimer > 0 || current.openingThresholdScene?.lockMovement || current.templeThresholdTransition?.lockMovement) return;
    if (!player?.onGround || current.dodgeTimer > 0 || current.dodgeRecoveryTimer > 0) return;
    if (player.hitFeedbackTimer > 0 || player.knockbackTimer > 0) return;
    if (current.enduranceExhausted) return; // exhausted — cannot dodge until Endurance recovers

    const keys = keysRef.current || {};
    const leftPressed = Boolean(keys.ArrowLeft || keys.KeyA);
    const rightPressed = Boolean(keys.ArrowRight || keys.KeyD);
    const dodgeDirection = rightPressed && !leftPressed
      ? 1
      : leftPressed && !rightPressed
        ? -1
        : -(player.direction || 1);
    const dodgeFacingDirection = -dodgeDirection;
    if (current.attackTimer > 0 && !current.attackComboLanded) resetPlayerCombo(current);
    if (current.attackComboLanded) current.attackComboWindowTimer = Math.max(current.attackComboWindowTimer || 0, PLAYER_COMBO_PRESERVE_AFTER_DODGE_DURATION);
    current.attackComboPreserved = Boolean(current.attackComboLanded);
    current.attackQueued = false;
    current.attackQueuedHeavyFollowupPrimed = false;
    current.attackWindupTimer = 0;
    current.attackTimer = 0;
    current.attackRecoilTimer = 0;
    current.attackPhase = 'ready';
    current.playerAttackBox = null;
    current.dodgeTimer = PLAYER_DODGE_DURATION;
    current.dodgeInvulnerableTimer = PLAYER_DODGE_INVULNERABLE_DURATION;
    current.dodgeRecoveryTimer = PLAYER_DODGE_DURATION + PLAYER_DODGE_RECOVERY_DURATION;
    current.dodgeDirection = dodgeDirection;
    current.dodgeFacingDirection = dodgeFacingDirection;
    current.lastDodgeResult = current.attackComboPreserved ? 'combo-preserved' : 'evade';
    current.resources.stamina = Math.max(1, current.resources.stamina - PLAYER_DODGE_STAMINA_COST);
    current.lastStaminaDelta = -PLAYER_DODGE_STAMINA_COST;
    current.lastStaminaLossReason = 'Dodge';
    current.staminaFeedbackTimer = Math.max(current.staminaFeedbackTimer || 0, 0.4);
    player.direction = dodgeFacingDirection;
    player.vx = dodgeDirection * PLAYER_DODGE_SPEED;
    player.jumpBufferTimer = 0;
    current.dodgeTrail = [];
    const dustBase = {
      type: 'movement-dust',
      y: player.y + player.height - 5,
      visualGroundFootY: player.y + player.height,
      direction: -dodgeDirection,
      color: 'rgba(230, 173, 96, 0.72)',
      maxTimer: 0.28,
    };
    addCombatEffect(current, { ...dustBase, x: player.x + player.width / 2, timer: 0.28 });
    addCombatEffect(current, { ...dustBase, x: player.x + player.width / 2 - dodgeDirection * 14, timer: 0.22 });
    addCombatEffect(current, { ...dustBase, x: player.x + player.width / 2 - dodgeDirection * 26, timer: 0.16 });
    audioControls?.playExpeditionSfx?.('dodgeStep', { volume: 0.78 });
  }, [audioControls, briefingOpen, addCombatEffect]);

  useEffect(() => {
    if (openingStartModeConsumedRef.current) return undefined;
    if (openingStartMode !== 'arrival-threshold') return undefined;
    const current = stateRef.current;
    current.openingConfrontationSeen = false;
    current.openingCinematic = null;
    current.openingThresholdScene = null;
    current.openingSphinxEncounter = null;
    completeOpeningThresholdScene(current);
    openingStartModeConsumedRef.current = true;
    return undefined;
  }, [completeOpeningThresholdScene, openingStartMode]);

  const enterLevelFromThreshold = useCallback((current, transition) => {
    const destinationSectionId = transition?.to || transition?.revealSectionId || 'ruined-temple';
    const transitionConfig = transition?.levelTransition || DEFAULT_LEVEL_TRANSITION;
    const destinationCheckpoint = getRenderableCheckpoints().find(checkpoint => checkpoint.id === destinationSectionId);
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
  }, [audioControls, getRenderableCheckpoints, syncHud]);

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
      duration: encounter.duration || OPENING_SPHINX_DURATION,
      timer: encounter.duration || OPENING_SPHINX_DURATION,
      silhouetteReveal: false,
      suppressDialogue: false,
      dialogueX: encounter.dialogueX,
      dialogueY: encounter.dialogueY,
    };
    current.notice = encounter.notice || `${encounter.name || 'A guardian'} blocks the path.`;
    current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.2);
    current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.14);
    audioControls?.playExpeditionSfx?.(openingAtmosphereSfxKey);
    syncHud();
    return true;
  }, [audioControls, openingAtmosphereSfxKey, syncHud]);

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
    const enemiesDisabled = Boolean(current.enemiesDisabled);
    if (current.openingCinematic) {
      const cinematic = current.openingCinematic;
      cinematic.timer = Math.max(0, cinematic.timer - dt);
      const elapsed = clamp(cinematic.duration - cinematic.timer, 0, cinematic.duration);
      const activeLine = getOpeningCinematicLine(cinematic);
      const isRomeOpeningCinematicActive = cinematic.id === ROME_OPENING_CINEMATIC_ID;
      const isChinaOpeningCinematicActive = cinematic.id === CHINA_OPENING_CINEMATIC_ID;
      const openingArrivalNotice = getOpeningArrivalNoticeForCinematicId(cinematic.id);
      const spellImpactAt = cinematic.spellImpactAt ?? OPENING_CINEMATIC_SPELL_IMPACT_AT;
      cinematic.activeLineId = activeLine?.id || null;
      cinematic.activeLine = activeLine || null;
      current.notice = activeLine?.text || (isRomeOpeningCinematicActive ? 'The vault is still watching.' : isChinaOpeningCinematicActive ? 'The watchtower is still watching.' : 'The first seal watches.');
      current.attackQueued = false;
      player.vx = 0;
      player.vy = 0;
      player.direction = 1;
      if (!cinematic.spellImpactTriggered && elapsed >= spellImpactAt) {
        cinematic.spellImpactTriggered = true;
        cinematic.shieldShattered = true;
        current.player.x = DESERT_ENTRY_EXTERIOR_SPAWN_X;
        current.player.y = GROUND_Y - current.player.height;
        current.player.vx = 0;
        current.player.vy = 0;
        current.cameraX = 0;
        current.targetCameraX = 0;
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.7);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.42);
        audioControls?.playExpeditionSfx?.('openingThresholdFinalPulse');
        audioControls?.playExpeditionSfx?.('thresholdRealityTear', { volume: 0.86 });
      }
      if (cinematic.timer <= 0) {
        current.openingCinematic = null;
        current.player.x = DESERT_ENTRY_EXTERIOR_SPAWN_X;
        current.player.y = GROUND_Y - current.player.height;
        current.cameraX = 0;
        current.targetCameraX = 0;
        current.notice = openingArrivalNotice;
        current.cinematicEvent = {
          id: 'opening-arrival-aftershock',
          name: 'Asha',
          message: openingArrivalNotice,
          temporary: true,
        };
        current.cinematicTimer = 3.4;
        audioControls?.playExpeditionSfx?.('lostSiteAirShift', { volume: 0.64 });
        current.openingCameraRevealTimer = Math.max(current.openingCameraRevealTimer, OPENING_CAMERA_REVEAL_DURATION);
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.24);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.12);
      } else if (Math.abs(elapsed - spellImpactAt) < dt + 0.02) {
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.42);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.22);
      }
      return;
    }

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
      current.resources.stamina = Math.max(0, current.resources.stamina - amount);
      if (current.resources.stamina === 0) current.enduranceExhausted = true;
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
        message: SCARAB_SEAL_TRIGGER.sealEmphasisMessage,
        duration: Math.min(SCARAB_SEAL_TRIGGER.duration, 1.4),
        shake: SCARAB_SEAL_TRIGGER.shake,
        card: false,
      };
      current.dynamicEnvironmentEventTimer = current.dynamicEnvironmentEvent.duration;
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.24);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, SCARAB_SEAL_TRIGGER.shake * 0.7);
      addRewardPulse('scarab-seal-awakening', SCARAB_SEAL_TRIGGER.x, SCARAB_SEAL_TRIGGER.y, SCARAB_SEAL_TRIGGER.sealPulseLabel, {
        color: '#b45309',
        fill: 'rgba(180, 83, 9, 0.12)',
        radius: SCARAB_SEAL_TRIGGER.sealPulseRadius,
        timer: SCARAB_SEAL_TRIGGER.sealPulseDuration,
      });
      audioControls?.playExpeditionSfx?.(openingAtmosphereSfxKey);
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
    const activeSceneTransition = current.sceneTransition || current.forgottenMuralChamberTransition;
    if (activeSceneTransition) {
      const transition = activeSceneTransition;
      transition.timer = Math.max(0, transition.timer - dt);
      const transitionElapsed = clamp((transition.duration || 0) - (transition.timer || 0), 0, transition.duration || 0);
      if (!transition.switched && transitionElapsed >= FORGOTTEN_MURAL_CHAMBER_SWITCH_SECONDS) {
        transition.switched = true;
        const enteringTempleThresholdHall = transition.toSceneId === JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL;
        const enteringMummificationChamber = transition.toSceneId === JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER;
        const enteringForgottenMuralChamber = transition.toSceneId === JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER;
        const enteringScribeChamber = transition.toSceneId === JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER;
        transition.phase = enteringTempleThresholdHall
          ? 'temple-threshold-hall-reveal'
          : enteringMummificationChamber
          ? 'mummification-chamber-reveal'
          : enteringForgottenMuralChamber
            ? 'chamber-reveal'
            : enteringScribeChamber
            ? 'scribe-chamber-reveal'
            : 'exterior-return';
        current.previousSceneId = transition.fromSceneId || getJourneySceneId(current);
        current.currentSceneId = transition.toSceneId || JOURNEY_SCENE_IDS.EXTERIOR;
        current.templeThresholdHallActive = enteringTempleThresholdHall;
        current.mummificationChamberActive = enteringMummificationChamber;
        current.forgottenMuralChamberActive = enteringForgottenMuralChamber;
        current.scribeChamberActive = enteringScribeChamber;
        if (enteringTempleThresholdHall) {
          current.templeThresholdHallEntered = true;
          current.hiddenRoomsFound?.add('temple-threshold-hall');
          current.discoveredHiddenRouteIds?.add('temple-threshold-hall-route');
          player.x = TEMPLE_THRESHOLD_HALL_ENTRY_SPAWN.x - player.width / 2;
          player.y = TEMPLE_THRESHOLD_HALL_ENTRY_SPAWN.y - player.height;
          player.direction = TEMPLE_THRESHOLD_HALL_ENTRY_SPAWN.direction;
          current.cameraX = TEMPLE_THRESHOLD_HALL_CAMERA_X;
          current.targetCameraX = current.cameraX;
          current.notice = 'The first hall is not abandoned. It is waiting.';
          current.cinematicEvent = {
            id: 'temple-threshold-hall-entered',
            name: 'Temple Approach',
            message: 'The first hall is not abandoned. It is waiting.',
            temporary: true,
          };
          current.cinematicTimer = 2.8;
        } else if (enteringMummificationChamber) {
          current.mummificationChamberEntered = true;
          current.mummificationChamberDoorSealed = true;
          current.mummificationChamberExitUnlocked = Boolean(current.mummificationChamberPuzzleSolved);
          current.hiddenRoomsFound?.add('mummification-chamber');
          current.discoveredHiddenRouteIds?.add('mummification-chamber-route');
          player.x = MUMMIFICATION_CHAMBER_ENTRY_SPAWN.x - player.width / 2;
          player.y = MUMMIFICATION_CHAMBER_ENTRY_SPAWN.y - player.height;
          player.direction = MUMMIFICATION_CHAMBER_ENTRY_SPAWN.direction;
          current.cameraX = MUMMIFICATION_CHAMBER_CAMERA_X;
          current.targetCameraX = current.cameraX;
          current.notice = 'This is a mummification chamber...';
          current.cinematicEvent = {
            id: 'mummification-chamber-entered',
            name: 'Asha',
            message: 'This is a mummification chamber...',
            temporary: true,
          };
          current.cinematicTimer = 2.8;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.0);
        } else if (enteringForgottenMuralChamber) {
          current.forgottenMuralChamberEntered = true;
          current.hiddenRoomsFound?.add('forgotten-mural-chamber');
          current.discoveredHiddenRouteIds?.add('desert-upper-survey-route');
          player.x = FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN.x - player.width / 2;
          player.y = FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN.y - player.height;
          player.direction = FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN.direction;
          current.cameraX = FORGOTTEN_MURAL_CHAMBER_CAMERA_X;
          current.targetCameraX = current.cameraX;
          current.notice = 'Forgotten Mural Chamber discovered. The warning mural has been damaged.';
          current.cinematicEvent = {
            id: 'forgotten-mural-chamber-entered',
            name: 'Forgotten Mural Chamber discovered',
            message: 'Broken pieces of a scarab seal lie across the floor. Someone tried to erase this warning.',
            temporary: true,
          };
          current.cinematicTimer = 2.8;
        } else if (enteringScribeChamber) {
          current.scribeChamberEntered = true;
          current.scribeChamberDoorSealed = true;
          current.scribeChamberExitUnlocked = Boolean(current.scribeChamberPuzzleSolved);
          current.hiddenRoomsFound?.add('scribe-locked-chamber');
          current.discoveredHiddenRouteIds?.add('scribe-locked-chamber-route');
          current.sceneReturn = resolveChamberReturnPoint(
            CHAMBER_DOOR_VISUALS_BY_ID['scribe-chamber-entry-door'],
            SCRIBE_CHAMBER_RETURN_FALLBACK.direction,
          );
          player.x = SCRIBE_CHAMBER_ENTRY_SPAWN.x - player.width / 2;
          player.y = SCRIBE_CHAMBER_ENTRY_SPAWN.y - player.height;
          player.direction = SCRIBE_CHAMBER_ENTRY_SPAWN.direction;
          current.cameraX = SCRIBE_CHAMBER_CAMERA_X;
          current.targetCameraX = current.cameraX;
          current.notice = 'A scribe\'s chamber... these walls are covered in symbols.';
          current.cinematicEvent = {
            id: 'scribe-chamber-door-sealed',
            name: 'The Scribe\'s Locked Chamber',
            message: 'I\'m trapped. Whoever built this room wanted this message protected.',
            temporary: true,
          };
          current.cinematicTimer = 3.2;
        } else {
          const returnPoint = current.sceneReturn || FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK;
          player.x = (returnPoint.x ?? FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK.x) - player.width / 2;
          player.y = (returnPoint.y ?? FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK.y) - player.height;
          player.direction = returnPoint.direction || FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK.direction;
          current.cameraX = Number.isFinite(returnPoint.cameraX)
            ? returnPoint.cameraX
            : clampCameraX(player.x - CANVAS_WIDTH * (returnPoint.cameraAnchorRatio ?? FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK.cameraAnchorRatio));
          current.targetCameraX = current.cameraX;
          current.notice = current.scribeChamberPuzzleSolved
            ? 'Asha leaves the Scribe\'s Chamber with the message recorded.'
            : current.templeThresholdHallCleared
              ? 'Asha returns to the temple approach with the threshold warning recorded.'
            : current.forgottenMuralChamberRestored
              ? 'Asha returns to the exterior route with the warning preserved.'
              : current.mummificationChamberPuzzleSolved
              ? 'Asha leaves the Mummification Chamber with the sacred rite recorded.'
                : 'Asha returns to the exterior route.';
          current.templeThresholdHallActive = false;
          current.mummificationChamberActive = false;
          current.scribeChamberActive = false;
        }
        player.vx = 0;
        player.vy = 0;
        player.onGround = true;
      }
      if (transition.timer <= 0) {
        const endedInTempleThresholdHall = getJourneySceneId(current) === JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL;
        const endedInMummificationChamber = getJourneySceneId(current) === JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER;
        const endedInForgottenMuralChamber = getJourneySceneId(current) === JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER;
        const endedInScribeChamber = getJourneySceneId(current) === JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER;
        current.sceneTransition = null;
        current.forgottenMuralChamberTransition = null;
        current.notice = endedInTempleThresholdHall
          ? 'The threshold hall listens for proof.'
          : endedInMummificationChamber
          ? 'The entrance sealed behind me.'
          : endedInForgottenMuralChamber
            ? 'The hidden chamber is quiet. Recover the broken scarab fragments.'
            : endedInScribeChamber
            ? 'I\'m trapped. Whoever built this room wanted this message protected.'
            : current.notice;
        if (endedInMummificationChamber) {
          current.cinematicEvent = {
            id: 'mummification-chamber-door-sealed',
            name: 'Asha',
            message: 'The entrance sealed behind me.',
            temporary: true,
          };
          current.cinematicTimer = 2.6;
        }
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
    current.cameraPunchTimer = Math.max(0, (current.cameraPunchTimer || 0) - dt);
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.damageCooldownTimer = Math.max(0, player.damageCooldownTimer - dt);
    player.venomSlowTimer = Math.max(0, (player.venomSlowTimer || 0) - dt);
    if (player.venomSlowTimer <= 0) player.venomSlowMultiplier = 1;
    if (player.poisonTimer > 0) {
      player.poisonTimer = Math.max(0, player.poisonTimer - dt);
      player.poisonTickTimer = Math.max(0, (player.poisonTickTimer || 0) - dt);
      if (player.poisonTickTimer <= 0 && player.poisonTimer > 0) {
        player.poisonTickTimer = 1.0;
        current.resources.stamina = Math.max(0, current.resources.stamina - 1);
        if (current.resources.stamina === 0) current.enduranceExhausted = true;
        addCombatEffect(current, {
          type: 'knockback-dust',
          x: player.x + player.width / 2,
          y: player.y + player.height - 4,
          direction: 0,
          color: 'rgba(70, 48, 20, 0.42)',
          timer: 0.28,
          maxTimer: 0.28,
        });
      }
    }
    player.sandBlindTimer = Math.max(0, (player.sandBlindTimer || 0) - dt);
    player.coyoteTimer = Math.max(0, (player.coyoteTimer || 0) - dt);
    player.jumpBufferTimer = Math.max(0, (player.jumpBufferTimer || 0) - dt);
    player.jumpCutFeedbackTimer = Math.max(0, (player.jumpCutFeedbackTimer || 0) - dt);
    player.impactShakeTimer = Math.max(0, (player.impactShakeTimer || 0) - dt);
    player.landingFeedbackTimer = Math.max(0, (player.landingFeedbackTimer || 0) - dt);
    player.movementDustTimer = Math.max(0, (player.movementDustTimer || 0) - dt);
    current.hazardCooldown = Math.max(0, current.hazardCooldown - dt);
    current.staminaFeedbackTimer = Math.max(0, current.staminaFeedbackTimer - dt);
    current.enemyCooldown = Math.max(0, current.enemyCooldown - dt);
    current.scorpionNestBlockNoticeCooldown = Math.max(0, (current.scorpionNestBlockNoticeCooldown || 0) - dt);
    current.attackCooldown = Math.max(0, current.attackCooldown - dt);
    const wasWindingUp = current.attackWindupTimer > 0;
    const wasSwinging = current.attackTimer > 0;
    const wasRecoiling = current.attackRecoilTimer > 0;
    current.attackWindupTimer = Math.max(0, current.attackWindupTimer - dt);
    current.attackTimer = Math.max(0, current.attackTimer - dt);
    current.attackRecoilTimer = Math.max(0, current.attackRecoilTimer - dt);
    current.attackComboWindowTimer = Math.max(0, (current.attackComboWindowTimer || 0) - dt);
    current.heavyFollowupReadyTimer = Math.max(0, (current.heavyFollowupReadyTimer || 0) - dt);
    current.heavyFollowupCueTimer = Math.max(0, (current.heavyFollowupCueTimer || 0) - dt);
    current.dodgeTimer = Math.max(0, (current.dodgeTimer || 0) - dt);
    current.dodgeInvulnerableTimer = Math.max(0, (current.dodgeInvulnerableTimer || 0) - dt);
    current.dodgeRecoveryTimer = Math.max(0, (current.dodgeRecoveryTimer || 0) - dt);
    if (current.dodgeInvulnerableTimer > 0) player.invulnerable = Math.max(player.invulnerable, current.dodgeInvulnerableTimer);
    const hasDedicatedDodgeRow = playerSpriteRef.current.mode === 'hero-atlas'
      && Boolean(getHeroSpriteRow(playerSpriteRef.current.atlas, 'dodge'));
    if (current.dodgeTimer > 0 && hasDedicatedDodgeRow) {
      current.dodgeTrail = [];
    } else if (current.dodgeTimer > 0) {
      if (!current.dodgeTrail) current.dodgeTrail = [];
      current.dodgeTrail.unshift({ x: player.x, y: player.y, dir: player.direction, alpha: 0.38 });
      if (current.dodgeTrail.length > 4) current.dodgeTrail.length = 4;
    } else if (current.dodgeTrail?.length) {
      current.dodgeTrail = current.dodgeTrail
        .map(g => ({ ...g, alpha: g.alpha - dt * 3.2 }))
        .filter(g => g.alpha > 0);
    }
    player.hitFeedbackTimer = Math.max(0, player.hitFeedbackTimer - dt);
    // Exhausted state: track when Endurance hits zero and apply last-chance slow recovery
    if (current.resources.stamina === 0) current.enduranceExhausted = true;
    if (current.enduranceExhausted && !current.failed && !current.completed) {
      current.resources.stamina += EXHAUSTED_RECOVERY_RATE * dt;
      if (current.resources.stamina >= EXHAUSTED_RECOVERY_CEILING) {
        current.enduranceExhausted = false;
      }
    }
    const expiredAttackBox = wasSwinging && current.attackTimer <= 0 ? current.playerAttackBox : null;
    if (current.attackTimer <= 0) current.playerAttackBox = null;
    if (wasWindingUp && current.attackWindupTimer <= 0) {
      current.attackTimer = current.attackSwingDuration || ATTACK_DURATION;
      current.attackHitIds.clear();
    }
    if (wasSwinging && current.attackTimer <= 0 && current.attackRecoilTimer <= 0) {
      if (current.attackHitIds.size === 0) {
        const nearMissTarget = getPlayerAttackNearMissTarget(current, expiredAttackBox);
        current.lastAttackResult = nearMissTarget ? 'near-miss' : 'missed';
        applyAttackStaminaCost(MISSED_ATTACK_EXTRA_STAMINA_COST, 'Missed attack', '-1');
        audioControls?.playExpeditionSfx?.('attackMiss', { volume: 0.72 });
        if (nearMissTarget) {
          addCombatEffect(current, {
            type: 'near-miss-spacing',
            x: nearMissTarget.direction >= 0 ? nearMissTarget.hurtbox.x : nearMissTarget.hurtbox.x + nearMissTarget.hurtbox.width,
            y: nearMissTarget.hurtbox.y + nearMissTarget.hurtbox.height * 0.56,
            direction: nearMissTarget.direction,
            gap: nearMissTarget.gap,
            color: 'rgba(226, 213, 192, 0.78)',
            timer: 0.28,
            maxTimer: 0.28,
          });
          current.notice = 'Close - step in and land J before K.';
        }
        resetPlayerCombo(current);
      }
      if (current.attackComboFinisherActive) resetPlayerCombo(current);
      current.attackRecoilTimer = current.attackRecoilDuration || ATTACK_RECOIL_DURATION;
    }
    if (wasRecoiling && current.attackRecoilTimer <= 0 && current.attackCooldown <= 0) {
      current.attackPhase = 'ready';
    } else {
      current.attackPhase = getPlayerAttackState(current);
    }
    if (current.attackComboWindowTimer <= 0 && current.attackSequenceIndex > 0 && current.attackPhase === 'ready') resetPlayerCombo(current);
    current.hitStopTimer = Math.max(0, current.hitStopTimer - dt);
    current.combatHitEffects = current.combatHitEffects
      .map(effect => ({ ...effect, timer: Math.max(0, effect.timer - dt) }))
      .filter(effect => effect.timer > 0);
    Object.entries(current.reactivePlatformTimers || {}).forEach(([platformId, timer]) => {
      if (platformId.endsWith(':respawn')) return;
      const nextTimer = timer - dt;
      const platform = getRenderablePlatforms(current).find(item => (item.id || item.label) === platformId)
        || PLATFORMS.find(item => (item.id || item.label) === platformId);
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
      const platform = getRenderablePlatforms(current).find(item => (item.id || item.label) === platformId)
        || PLATFORMS.find(item => (item.id || item.label) === platformId);
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
    if ((current.sceneTransition || current.forgottenMuralChamberTransition)?.lockMovement) {
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
    if (current.dodgeTimer > 0) {
      targetVx = (current.dodgeDirection || player.direction || 1) * PLAYER_DODGE_SPEED;
    } else {
      if (left) { targetVx -= MOVE_SPEED; player.direction = -1; }
      if (right) { targetVx += MOVE_SPEED; player.direction = 1; }
      if (player.venomSlowTimer > 0) targetVx *= player.venomSlowMultiplier || SCORPION_VENOM_SLOW_MULTIPLIER;
      if (current.resources.stamina > 0 && current.resources.stamina < 25) targetVx *= 0.8;
      if (!player.onGround) targetVx *= Math.max(1, upgradeEffects.airControlMultiplier || 1);
      if (current.attackWindupTimer > 0) targetVx *= 0.45;
    }
    const hasHorizontalInput = left || right;
    const acceleration = player.onGround
      ? (hasHorizontalInput ? MOVE_ACCELERATION : MOVE_DECELERATION)
      : (hasHorizontalInput ? AIR_ACCELERATION : AIR_DECELERATION);
    if (current.dodgeTimer > 0) {
      player.vx = targetVx;
    } else {
      player.vx = approach(player.vx, targetVx, acceleration * dt);
      if (current.attackRecoilTimer > 0) player.vx += -player.direction * 45 * dt * 12;
    }
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

    const previousPlayerX = player.x;
    player.vy += GRAVITY * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    updatePlayerAnimation(current, dt);

    // Bounds
    player.x = clamp(player.x, 0, WORLD_WIDTH - player.width);
    if (isTempleThresholdHallScene(current)) {
      player.x = clamp(
        player.x,
        TEMPLE_THRESHOLD_HALL_BOUNDS.minX,
        TEMPLE_THRESHOLD_HALL_BOUNDS.maxX - player.width,
      );
    } else if (isMummificationChamberScene(current)) {
      player.x = clamp(
        player.x,
        MUMMIFICATION_CHAMBER_BOUNDS.minX,
        MUMMIFICATION_CHAMBER_BOUNDS.maxX - player.width,
      );
    } else if (isForgottenMuralChamberScene(current)) {
      player.x = clamp(
        player.x,
        FORGOTTEN_MURAL_CHAMBER_BOUNDS.minX,
        FORGOTTEN_MURAL_CHAMBER_BOUNDS.maxX - player.width,
      );
    } else if (isScribeLockedChamberScene(current)) {
      player.x = clamp(
        player.x,
        SCRIBE_CHAMBER_BOUNDS.minX,
        SCRIBE_CHAMBER_BOUNDS.maxX - player.width,
      );
    }
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
    const movementBlocker = getRenderablePlatforms(current)
      .filter(isJourneyBlockerPlatform)
      .find(blocker => resolveJourneyBlockerPlatformCollision(player, previousPlayer, blocker));
    if (movementBlocker) {
      player.x = clamp(player.x, 0, WORLD_WIDTH - player.width);
    }
    const liveScorpionNestBlocker = getLiveScorpionNestBlockers(current)
      .find(blocker => rectsOverlap(player, blocker));
    if (liveScorpionNestBlocker) {
      const movedRight = player.x >= previousPlayerX;
      player.x = movedRight
        ? liveScorpionNestBlocker.x - player.width - 3
        : liveScorpionNestBlocker.x + liveScorpionNestBlocker.width + 3;
      player.x = clamp(player.x, 0, WORLD_WIDTH - player.width);
      player.vx = movedRight ? Math.min(0, player.vx) : Math.max(0, player.vx);
      current.notice = 'The scorpion nest blocks the route. Destroy it to clear the path.';
      current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.55);
      if ((current.scorpionNestBlockNoticeCooldown || 0) <= 0) {
        current.scorpionNestBlockNoticeCooldown = 0.85;
        audioControls?.playExpeditionSfx?.('gateBlocked');
      }
    }
    if (current.arrivalThresholdActive) {
      player.x = clamp(player.x, ARRIVAL_THRESHOLD_LEFT_BOUND, ARRIVAL_THRESHOLD_RIGHT_BOUND - player.width);
      const arrivalCenterX = player.x + player.width / 2;
      player.y = getArrivalThresholdGroundY(arrivalCenterX) - player.height;
      player.vy = 0;
      player.onGround = true;
      player.airJumpsUsed = 0;
      updateArrivalThresholdTrial(current, player, dt);
      // Room wakes up once Asha reaches the breach (the refusal beat) and stays awake.
      if (current.arrivalThresholdLeftInspected) {
        current.arrivalThresholdWakeProgress = clamp(
          (current.arrivalThresholdWakeProgress || 0) + dt / ARRIVAL_THRESHOLD_WAKE_SECONDS,
          0,
          1,
        );
      }
      current.trapProjectiles = [];
      current.currentSectionId = 'arrival-threshold';
      current.lastSectionId = 'desert-entry';
      current.resources.stamina = Math.max(current.resources.stamina, Math.min(maxStamina, 35));
      current.arrivalThresholdNoticeTimer = Math.max(0, (current.arrivalThresholdNoticeTimer || 0) - dt);
      if (current.arrivalThresholdExitTransition) {
        const transition = current.arrivalThresholdExitTransition;
        transition.timer = Math.min(transition.duration, (transition.timer || 0) + dt);
        const progress = clamp(transition.timer / transition.duration, 0, 1);
        const eased = 1 - ((1 - progress) * (1 - progress));
        player.x = clamp(
          transition.startX + (transition.endX - transition.startX) * eased,
          ARRIVAL_THRESHOLD_LEFT_BOUND,
          ARRIVAL_THRESHOLD_RIGHT_BOUND - player.width,
        );
        player.y = getArrivalThresholdGroundY(player.x + player.width / 2) - player.height;
        player.vx = 0;
        player.vy = 0;
        player.onGround = true;
        player.direction = -1;
        current.notice = 'Asha climbs through the broken scarab breach.';
        if (progress >= 1) {
          player.x = DESERT_ENTRY_EXTERIOR_SPAWN_X;
          player.y = GROUND_Y - player.height;
          player.direction = 1;
          current.arrivalThresholdActive = false;
          current.arrivalThresholdExitTransition = null;
          current.openingCinematic = null;
          current.openingThresholdScene = null;
          current.openingSphinxEncounter = null;
          current.sectionTransition = null;
          current.sectionTransitionTimer = 0;
          current.currentSectionId = 'desert-entry';
          current.lastSectionId = 'desert-entry';
          current.environmentEvent = null;
          current.environmentEventTimer = 0;
          current.dynamicEnvironmentEvent = null;
          current.dynamicEnvironmentEventTimer = 0;
          current.cinematicEvent = null;
          current.cinematicTimer = 0;
          current.cameraX = 0;
          current.targetCameraX = 0;
          if (!current.openingConfrontationSeen) {
            startOpeningCinematic({ speechEnabled: true, fromArrivalThreshold: true });
          } else {
            current.notice = OPENING_ARRIVAL_AFTERSHOCK_NOTICE;
            current.openingCameraRevealTimer = Math.max(current.openingCameraRevealTimer, OPENING_CAMERA_REVEAL_DURATION);
          }
        }
        syncHud();
        return;
      }
      if (!current.arrivalThresholdLeftInspected && arrivalCenterX <= ARRIVAL_THRESHOLD_LEFT_INSPECT_X) {
        current.arrivalThresholdLeftInspected = true;
        current.notice = ARRIVAL_THRESHOLD_LEFT_OBJECTIVE_LINE;
        current.cinematicEvent = {
          id: 'arrival-threshold-way-back',
          name: 'Asha',
          message: ARRIVAL_THRESHOLD_LEFT_LINES.join(' '),
          temporary: true,
        };
        current.cinematicTimer = 3.1;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.0);
        if (!current.arrivalThresholdTrial) {
          current.arrivalThresholdTrial = createArrivalThresholdTrialState();
        }
        audioControls?.playExpeditionSfx?.('gateBlocked', { volume: 0.58 });
      }
      if (!current.arrivalThresholdMarkingsInspected && arrivalCenterX >= ARRIVAL_THRESHOLD_MARKINGS_INSPECT_X) {
        current.arrivalThresholdMarkingsInspected = true;
        current.notice = ARRIVAL_THRESHOLD_GATE_OBJECTIVE_LINE;
        current.cinematicEvent = {
          id: 'arrival-threshold-funerary-markings',
          name: 'Asha',
          message: ARRIVAL_THRESHOLD_MARKING_LINES.join(' '),
          temporary: true,
        };
        current.cinematicTimer = 3.4;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.0);
        audioControls?.playExpeditionSfx?.('lostSiteAirShift', { volume: 0.46 });
      }
      if (!current.arrivalThresholdGateTriggered && arrivalCenterX <= ARRIVAL_THRESHOLD_FORWARD_GATE_TRIGGER_X) {
        if (!current.arrivalThresholdTrial?.completed) {
          current.notice = ARRIVAL_THRESHOLD_TRIAL_EXIT_LOCKED_LINE;
          current.cinematicEvent = {
            id: 'arrival-threshold-trial-incomplete',
            name: 'Asha',
            message: ARRIVAL_THRESHOLD_TRIAL_EXIT_LOCKED_LINE,
            temporary: true,
          };
          current.cinematicTimer = 2.2;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.6);
          player.vx = Math.max(player.vx, 80);
          audioControls?.playExpeditionSfx?.('gateBlocked', { volume: 0.58 });
          syncHud();
          return;
        }
        current.arrivalThresholdGateTriggered = true;
        player.vx = 0;
        player.vy = 0;
        current.arrivalThresholdExitTransition = {
          timer: 0,
          duration: ARRIVAL_THRESHOLD_EXIT_WALK_SECONDS,
          startX: player.x,
          endX: ARRIVAL_THRESHOLD_EXIT_WALK_END_X - player.width / 2,
        };
        current.cinematicEvent = {
          id: 'arrival-threshold-doorway-crossing',
          name: 'Asha',
          message: 'The broken scarab breach opens toward the Duat. Asha climbs through.',
          temporary: true,
        };
        current.cinematicTimer = ARRIVAL_THRESHOLD_EXIT_WALK_SECONDS;
        current.notice = 'Asha climbs through the broken scarab breach.';
        audioControls?.playExpeditionSfx?.('openingThresholdFinalPulse', { volume: 0.82 });
        syncHud();
        return;
      }
      const camera = getCameraFollowTarget(current);
      current.targetCameraX = camera.targetCameraX;
      current.cameraMode = camera.mode;
      current.cameraFocusTarget = camera.focusTarget;
      if (!Number.isFinite(current.cameraX)) current.cameraX = camera.targetCameraX;
      const cameraStep = clamp(
        (current.targetCameraX - current.cameraX) * 0.16,
        -JOURNEY_CAMERA.maxStep,
        JOURNEY_CAMERA.maxStep,
      );
      current.cameraX = clampCameraX(current.cameraX + cameraStep);
      syncHud();
      return;
    }
    if (player.y > JOURNEY_VIEWPORT.height + JOURNEY_WORLD_LAYOUT.rescueFallPadding) {
      triggerJourneyRescue('The team stumbled into a ravine. Field rescue required.');
    }

    current.trapStates ??= {};
    current.trapProjectiles = (current.trapProjectiles || [])
      .map(projectile => ({
        ...projectile,
        x: projectile.x + (projectile.vx || 0) * dt,
        y: projectile.y + (projectile.vy || 0) * dt,
        ttl: (projectile.ttl || 0) - dt,
      }))
      .filter(projectile => (
        projectile.ttl > 0
        && projectile.x > -120
        && projectile.x < WORLD_WIDTH + 120
        && projectile.y > -120
        && projectile.y < CANVAS_HEIGHT + 240
      ));
    getRenderableHazards(current).forEach((hazard) => {
      if (!isReusableJourneyTrap(hazard)) return;
      const runtime = current.trapStates[hazard.id] ||= {};
      updateJourneyTrapRuntime({
        trap: hazard,
        runtime,
        triggered: false,
        dt,
      });
    });

    // Platforms
    player.onGround = false;
    let landedThisFrame = false;
    const available = [
      ...getRenderablePlatforms(current),
      ...getRenderableTrapPlatforms(current),
    ];
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

    const playerCenterXForRamp = player.x + player.width / 2;
    const playerFootY = player.y + player.height;
    const templeApproachRampClimbRequested = jump || playerFootY < TEMPLE_APPROACH_RAMP_LOWER_PATH_FOOT_Y;
    if (
      getJourneySceneId(current) === JOURNEY_SCENE_IDS.EXTERIOR
      && playerCenterXForRamp >= TEMPLE_APPROACH_RAMP_ASSIST.minX
      && playerCenterXForRamp <= TEMPLE_APPROACH_RAMP_ASSIST.maxX
      && player.vy >= -25
      && templeApproachRampClimbRequested
    ) {
      const rampSurfaceY = getTempleApproachRampSurfaceY(playerCenterXForRamp);
      const snapDistance = playerFootY - rampSurfaceY;
      if (
        snapDistance >= -TEMPLE_APPROACH_RAMP_ASSIST.maxSnapUp
        && snapDistance <= TEMPLE_APPROACH_RAMP_ASSIST.maxSnapDown
      ) {
        player.y = rampSurfaceY - player.height;
        player.vy = 0;
        player.onGround = true;
        player.coyoteTimer = COYOTE_TIME;
        player.airJumpsUsed = 0;
        landedThisFrame = true;
      }
    }

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
    const lostBridgeDeckBounds = getLostBridgeDeckBounds(available);
    if (lostBridgeDeckBounds && !current.failed && !isInteriorChamberScene(current)) {
      const playerCenterX = player.x + player.width / 2;
      const playerFootY = player.y + player.height;
      const ravineFallLeft = lostBridgeDeckBounds.left + LOST_BRIDGE_RAVINE_FALL_SIDE_PAD;
      const ravineFallRight = lostBridgeDeckBounds.right - LOST_BRIDGE_RAVINE_FALL_SIDE_PAD * 0.74;
      const belowBridgeDeck = playerFootY >= lostBridgeDeckBounds.y + LOST_BRIDGE_RAVINE_FALL_DEPTH;
      if (playerCenterX >= ravineFallLeft && playerCenterX <= ravineFallRight && belowBridgeDeck) {
        current.activePlatformChallenge = null;
        addCombatEffect(current, {
          type: 'environment-dust',
          x: playerCenterX,
          y: Math.min(GROUND_Y + 16, playerFootY),
          text: 'RAVINE',
          color: 'rgba(120, 53, 15, 0.62)',
          timer: 0.42,
          maxTimer: 0.42,
        });
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.18);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.16);
        triggerJourneyRescue(
          'Asha fell into the ravine. Field rescue required.',
          'The bridge drops into a ravine here. Climb to the bridge deck before crossing.',
        );
      }
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

    const inInteriorChamberScene = isInteriorChamberScene(current);

    // Sections
    const section = getSectionForX(player.x);
    if (!inInteriorChamberScene && !current.arrivalThresholdActive && section.id !== current.lastSectionId) {
      const atmosphere = SECTION_ATMOSPHERES[section.id];
      const sectionTitle = getSectionDisplayTitle(section.id) || atmosphere.title;
      current.sectionTransition = { id: section.id, name: getSectionDisplayName(section.id), message: sectionTitle };
      current.sectionTransitionTimer = 2.6;
      current.lastSectionId = section.id;
      current.notice = sectionTitle;
      audioControls?.playLevelUp?.();
    }

    const reachedCheckpoint = !inInteriorChamberScene && !current.arrivalThresholdActive && getRenderableCheckpoints()
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
    if (!inInteriorChamberScene && !current.arrivalThresholdActive) ENVIRONMENT_EVENTS.forEach(ev => {
      const triggerRange = ev.dynamic ? 145 : 70;
      const crossedEvent = (previousPlayer.x <= ev.x && player.x >= ev.x) || (previousPlayer.x >= ev.x && player.x <= ev.x);
      if (!current.triggeredEnvironmentEventIds.has(ev.id) && (Math.abs(player.x - ev.x) < triggerRange || crossedEvent)) {
        current.triggeredEnvironmentEventIds.add(ev.id);
        if (ev.id === 'air-wrongness') {
          audioControls?.playExpeditionSfx?.('airWrongness');
          return;
        }
        if (ev.dynamic || ev.card === false) {
          current.dynamicEnvironmentEvent = ev;
          current.dynamicEnvironmentEventTimer = ev.duration;
        } else {
          current.environmentEvent = ev;
          current.environmentEventTimer = ev.duration;
        }
        if (ev.id === 'forgotten-mural-looter-shadow') {
          current.forgottenMuralLooterSeen = true;
        }
        current.cameraShakeTimer = ev.duration * 0.4;
        current.cameraShakeStrength = ev.shake;
        current.notice = ev.message;
        if (ev.sfxKey) {
          audioControls?.playExpeditionSfx?.(ev.sfxKey, { volume: ev.sfxVolume ?? 1 });
        } else if (ev.id === 'scarab-queen-lair-dread-wind') {
          audioControls?.playExpeditionSfx?.('scarabQueenApproachAtmosphere');
        } else if (ev.type === 'shrine-glow') {
          audioControls?.playExpeditionStinger?.('evidenceDiscovery');
        } else {
          audioControls?.playTransition?.();
        }
      }
    });

    // Recurring underground pressure pulse — active once player passes the pyramid into open desert
    // X(500) = Math.round(500 * 5.65) = 2825
    if (!inInteriorChamberScene && !current.arrivalThresholdActive && player.x > 2825) {
      if (current.pressurePulseTimer == null) {
        current.pressurePulseTimer = 20 + Math.random() * 25;
      }
      current.pressurePulseTimer -= dt;
      if (current.pressurePulseTimer <= 0) {
        audioControls?.playExpeditionSfx?.('earthPressurePulse');
        current.pressurePulseTimer = 45 + Math.random() * 45;
      }
    } else if (player.x <= 2825) {
      current.pressurePulseTimer = null;
    }

    if (!inInteriorChamberScene && !current.arrivalThresholdActive && !current.openingThresholdScene?.lockMovement) {
      current.ambientDramaTimer ??= 24 + Math.random() * 28;
      current.ambientDramaTimer -= dt;
      if (current.ambientDramaTimer <= 0) {
        const ambientDramaSfxKey = getAmbientDramaSfxKey(current, section.id);
        if (ambientDramaSfxKey) {
          audioControls?.playExpeditionSfx?.(ambientDramaSfxKey, { volume: section.id === 'escape-sequence' ? 0.72 : 0.46 });
        }
        current.ambientDramaTimer = section.id === 'escape-sequence'
          ? 18 + Math.random() * 22
          : 34 + Math.random() * 44;
      }
    } else {
      current.ambientDramaTimer = null;
    }

    const forgottenMuralPlayerCenterX = player.x + player.width / 2;
    const forgottenMuralPlayerFootY = player.y + player.height;
    const currentSceneId = getJourneySceneId(current);
    const mummificationInteractionResult = (() => {
      if (
        currentSceneId !== JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER
        || current.sceneTransition
        || current.forgottenMuralChamberTransition
      ) {
        return null;
      }

      const playerBody = getPlayerBodyHitbox(player);
      current.mummificationChamberInspectedObjectIds ??= new Set();
      current.mummificationChamberInteraction ??= createJourneyRoomInteractionState();
      let interaction = current.mummificationChamberInteraction;
      interaction.wrongFlash ??= {};
      const inspectedObjectIds = current.mummificationChamberInspectedObjectIds;
      const ritualStep = current.mummificationChamberRitualStep || 0;

      // Tick down any wrong-target flickers + the chamber disturbance pulse.
      Object.keys(interaction.wrongFlash).forEach((id) => {
        interaction.wrongFlash[id] = Math.max(0, (interaction.wrongFlash[id] || 0) - dt);
        if (interaction.wrongFlash[id] <= 0) delete interaction.wrongFlash[id];
      });
      current.mummificationChamberDisturbanceTimer = Math.max(0, (current.mummificationChamberDisturbanceTimer || 0) - dt);

      // The chamber reacts to careless hands using the existing atmosphere systems
      // (candle flare, room dim-flash, seal pulse) plus a small shake. Anubis, cold
      // and watching, only speaks when the player keeps disturbing the room.
      const stirChamber = (strength = 1) => {
        current.mummificationChamberDisturbanceTimer = Math.max(
          current.mummificationChamberDisturbanceTimer || 0,
          MUMMIFICATION_CHAMBER_DISTURBANCE_DURATION * strength,
        );
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength || 0, 0.06 + 0.05 * strength);
        current.mummificationChamberWrongCount = (current.mummificationChamberWrongCount || 0) + 1;
        // Sparingly: a cold Anubis judgement after repeated carelessness.
        if (current.mummificationChamberWrongCount % 3 === 0) {
          const line = MUMMIFICATION_ANUBIS_WARNINGS[
            (current.mummificationChamberWrongCount / 3 - 1) % MUMMIFICATION_ANUBIS_WARNINGS.length
          ];
          current.cinematicEvent = { id: 'mummification-anubis-warning', name: 'Anubis', message: line, temporary: true };
          current.cinematicTimer = Math.max(current.cinematicTimer || 0, 2.6);
        }
      };

      const interactDown = !!keys.KeyE;
      const interactPressed = interactDown && !interaction.interactHeldPrev;
      const moving = Math.abs(player.vx) > 0.1;
      interaction.interactHeldPrev = interactDown;
      // Render hints recomputed every frame.
      interaction.activePromptId = null;
      interaction.activePrompt = null;

      const overlaps = (item) => rectsOverlap(playerBody, {
        x: current.cameraX + item.hitbox.x,
        y: item.hitbox.y,
        width: item.hitbox.width,
        height: item.hitbox.height,
      });
      const setObjectState = (id, state) => { interaction.objectStates[id] = state; };
      const isDone = (state) => [
        JOURNEY_INTERACT_OBJECT_STATES.INSPECTED,
        JOURNEY_INTERACT_OBJECT_STATES.PLACED,
        JOURNEY_INTERACT_OBJECT_STATES.USED,
        JOURNEY_INTERACT_OBJECT_STATES.COMPLETED,
      ].includes(state);
      // Helpers clone the interaction state; commit() re-binds the live object so
      // later reads (e.g. rite-completion checks) see the freshly applied change.
      const commit = (result) => {
        interaction = result.interaction;
        current.mummificationChamberInteraction = interaction;
        return result;
      };

      // Exit seal: priority overlap that stays locked until every rite is done.
      const exitSealItem = MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS.find(item => item.exitSeal);
      if (exitSealItem && overlaps(exitSealItem)) {
        if (current.mummificationChamberExitUnlocked) {
          interaction.activePromptId = exitSealItem.id;
          interaction.activePrompt = 'Exit open';
          return { id: exitSealItem.id, alreadyUnlocked: true };
        }
        interaction.activePromptId = exitSealItem.id;
        interaction.activePrompt = 'Sealed';
        if (interactPressed && (current.itemPurposeNoticeTimer || 0) <= 0) {
          current.notice = 'The seal does not trust an unfinished rite.';
          current.itemPurposeNoticeTimer = 1.35;
          audioControls?.playExpeditionSfx?.('gateBlocked');
        }
        return { id: exitSealItem.id, blocked: true };
      }

      const riteDef = getMummificationRiteByIndex(ritualStep);
      if (!riteDef) return null; // all rites complete

      // Story beat: the first time a rite with an intro line becomes active and no
      // cinematic is playing, plant it (e.g. the name was scratched out by hand).
      if (riteDef.introLine) {
        current.mummificationChamberRiteIntrosShown ??= new Set();
        if (!current.mummificationChamberRiteIntrosShown.has(riteDef.rite) && (current.cinematicTimer || 0) <= 0) {
          current.mummificationChamberRiteIntrosShown.add(riteDef.rite);
          current.cinematicEvent = { id: `mummification-rite-intro-${riteDef.rite}`, name: 'Asha', message: riteDef.introLine, temporary: true };
          current.cinematicTimer = 2.6;
          current.notice = riteDef.introLine;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.6);
        }
      }

      const advanceRiteIfComplete = (item) => {
        const done = riteDef.requires.every(id => isDone(interaction.objectStates[id]));
        if (!done) return false;
        const stepInfo = MUMMIFICATION_CHAMBER_RITUAL_STEPS[ritualStep];
        const nextStep = ritualStep + 1;
        current.mummificationChamberRitualStep = nextStep;
        // Keep the atmosphere/guidance systems progressing on the canonical objects.
        if (stepInfo?.id) inspectedObjectIds.add(stepInfo.id);
        const isComplete = isMummificationChamberComplete(nextStep);
        current.notice = riteDef.completeNotice;
        current.cinematicEvent = {
          id: isComplete ? 'mummification-chamber-ritual-complete' : `mummification-rite-${riteDef.rite}`,
          name: 'Asha',
          message: riteDef.completeLine,
          temporary: true,
        };
        current.cinematicTimer = isComplete ? 3.2 : 2.1;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, isComplete ? 2.0 : 1.1);
        current.hitStopTimer = Math.max(current.hitStopTimer, isComplete ? 0.04 : 0.022);
        addRewardPulse(item.id, current.cameraX + item.screen.x, item.screen.y,
          isComplete ? 'RITE SEALED' : (stepInfo?.pulseText || 'RITE DONE'), {
            color: isComplete ? '#5eead4' : '#facc15',
            fill: isComplete ? 'rgba(94, 234, 212, 0.12)' : 'rgba(250, 204, 21, 0.12)',
            radius: isComplete ? 72 : 48,
            timer: isComplete ? 0.9 : 0.6,
          });
        if (isComplete) {
          current.mummificationChamberPuzzleSolved = true;
          current.mummificationChamberExitUnlocked = true;
          interaction.carriedItemId = null;
          audioControls?.playLevelUp?.();
          syncHud();
        } else {
          audioControls?.playSuccess?.();
        }
        return true;
      };

      const flashWrong = (item, message) => {
        interaction.wrongFlash[item.id] = 0.55;
        if ((current.itemPurposeNoticeTimer || 0) <= 0) {
          current.notice = message;
          current.itemPurposeNoticeTimer = 1.35;
          audioControls?.playExpeditionSfx?.('gateBlocked');
          current.hitStopTimer = Math.max(current.hitStopTimer, 0.016);
          stirChamber(1);
          addCombatEffect(current, {
            type: 'environment-dust',
            x: current.cameraX + item.screen.x,
            y: item.screen.y,
            color: 'rgba(245, 158, 11, 0.6)',
            timer: 0.4,
            maxTimer: 0.4,
          });
        }
      };

      const carried = interaction.carriedItemId;
      const overlappingObjects = riteDef.objects.filter(overlaps);
      const isHoldTarget = (object) => object.role === 'apply' || object.role === 'wrap';

      // Choose the object the player can act on right now: when carrying, prefer a
      // valid hold/place target; otherwise prefer a source/inspect/activate object.
      const target = carried
        ? (overlappingObjects.find(o => isHoldTarget(o) && o.acceptsItemId === carried)
          || overlappingObjects.find(o => o.role === 'target' || o.role === 'restore')
          || overlappingObjects.find(o => o.id === carried) // returning to its source
          || overlappingObjects.find(o => isHoldTarget(o)))
        : (overlappingObjects.find(o => o.role === 'source')
          || overlappingObjects.find(o => o.role === 'inspect' && !isDone(interaction.objectStates[o.id]))
          || overlappingObjects.find(o => o.role === 'activate' && !isDone(interaction.objectStates[o.id]))
          || overlappingObjects.find(o => o.role === 'inspect' || o.role === 'activate'));

      // Hold-to-use (apply / wrap): accumulate only while stationary and held.
      if (target && isHoldTarget(target) && carried === target.acceptsItemId) {
        const duration = MUMMIFICATION_HOLD_DURATIONS[target.holdKey] || 1.5;
        const hold = commit(journeyInteractHoldTick(interaction, {
          itemId: target.id, verb: target.verb, duration, dt,
          holding: interactDown, moving,
        }));
        interaction.activePromptId = target.id;
        interaction.activePrompt = target.prompt;
        if (hold.completed) {
          setObjectState(target.id, JOURNEY_INTERACT_OBJECT_STATES.COMPLETED);
          setObjectState(carried, JOURNEY_INTERACT_OBJECT_STATES.USED);
          interaction.carriedItemId = null;
          advanceRiteIfComplete(target);
        } else if (hold.cancelled && moving && riteDef.slipNotice && (current.itemPurposeNoticeTimer || 0) <= 0) {
          // Linen slip etc. — retry only this hold, nothing else resets.
          current.notice = riteDef.slipNotice;
          current.itemPurposeNoticeTimer = 1.2;
          stirChamber(0.6);
        }
        return { id: target.id, holding: hold.reason === 'holding' };
      }

      // Expose the current prompt for rendering even when the player isn't pressing.
      if (target) {
        if (carried && target.id === carried) {
          interaction.activePrompt = 'E Put back';
        } else {
          // Hold targets still prompt with the wrong item; pressing reveals the clue.
          interaction.activePrompt = target.prompt;
        }
        interaction.activePromptId = interaction.activePrompt ? target.id : null;
      }

      if (!interactPressed || !target) {
        return target ? { id: target.id } : null;
      }
      // Each press is edge-detected (one action per key-down), so taps stay
      // responsive — no notice-timer debounce needed here.

      // Tap actions.
      // Carrying the wrong item to a hold target (e.g. the wrong oil at the table):
      // give the carried item's own clue instead of failing silently.
      if (isHoldTarget(target) && carried && carried !== target.acceptsItemId) {
        const carriedObj = MUMMIFICATION_CHAMBER_RITE_OBJECTS.find(o => o.id === carried);
        flashWrong(target, carriedObj?.wrongMessage || riteDef.wrongTargetNotice || 'That is not what this rite needs.');
        return { id: target.id, wrongHoldItem: true };
      }
      if (target.role === 'inspect' || target.role === 'activate') {
        commit(journeyInteractInspect(interaction, target));
        current.notice = target.message || `${target.label} honoured.`;
        current.itemPurposeNoticeTimer = 1.0;
        audioControls?.playSuccess?.();
        addRewardPulse(target.id, current.cameraX + target.screen.x, target.screen.y, 'HONOURED', {
          color: '#facc15', radius: 40, timer: 0.5,
        });
        advanceRiteIfComplete(target);
        return { id: target.id, inspected: true };
      }

      if (target.role === 'source') {
        if (carried && carried === target.id) {
          // Put the carried item back where it came from.
          interaction.carriedItemId = null;
          setObjectState(target.id, JOURNEY_INTERACT_OBJECT_STATES.IDLE);
          current.notice = `${target.label} set back down.`;
          current.itemPurposeNoticeTimer = 0.8;
          audioControls?.playSuccess?.();
          return { id: target.id, returned: true };
        }
        const result = commit(journeyInteractPickUp(interaction, target));
        if (!result.ok) {
          current.notice = 'Both hands are full. Place what I carry first.';
          current.itemPurposeNoticeTimer = 1.1;
          audioControls?.playExpeditionSfx?.('gateBlocked');
          return { id: target.id, handsFull: true };
        }
        current.notice = `Carrying the ${target.label}.`;
        current.itemPurposeNoticeTimer = 0.6;
        audioControls?.playSuccess?.();
        return { id: target.id, pickedUp: true };
      }

      if (target.role === 'target' || target.role === 'restore') {
        const result = commit(journeyInteractPlace(interaction, target));
        if (!result.ok) {
          flashWrong(target, riteDef.wrongTargetNotice || 'That does not belong here.');
          return { id: target.id, wrongTarget: true };
        }
        current.notice = target.message || riteDef.completeNotice;
        current.itemPurposeNoticeTimer = 0.9;
        audioControls?.playSuccess?.();
        addRewardPulse(target.id, current.cameraX + target.screen.x, target.screen.y, 'PLACED', {
          color: '#5eead4', radius: 44, timer: 0.55,
        });
        advanceRiteIfComplete(target);
        return { id: target.id, placed: true };
      }

      return { id: target.id };
    })();
    const templeThresholdEntryDoor = CHAMBER_DOOR_VISUALS_BY_ID['temple-threshold-hall-entry-door'];
    const mummificationEntryDoor = CHAMBER_DOOR_VISUALS_BY_ID['mummification-chamber-entry-door'];
    const forgottenMuralEntryDoor = CHAMBER_DOOR_VISUALS_BY_ID['forgotten-mural-entry-door'];
    const scribeEntryDoor = CHAMBER_DOOR_VISUALS_BY_ID['scribe-chamber-entry-door'];
    const templeThresholdEntryTrigger = resolveChamberEntryTrigger(templeThresholdEntryDoor) || TEMPLE_THRESHOLD_HALL_ENTRY_TRIGGER;
    const mummificationEntryTrigger = resolveChamberEntryTrigger(mummificationEntryDoor) || MUMMIFICATION_CHAMBER_ENTRY_TRIGGER;
    const forgottenMuralEntryTrigger = resolveChamberEntryTrigger(forgottenMuralEntryDoor) || FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER;
    const scribeEntryTrigger = resolveChamberEntryTrigger(scribeEntryDoor) || SCRIBE_CHAMBER_ENTRY_TRIGGER;
    const templeThresholdReturnPoint = (direction = -1) => resolveChamberReturnPoint(templeThresholdEntryDoor, direction);
    const mummificationReturnPoint = (direction = 1) => resolveChamberReturnPoint(mummificationEntryDoor, direction);
    const forgottenMuralReturnPoint = (direction = 1) => resolveChamberReturnPoint(forgottenMuralEntryDoor, direction);
    const scribeReturnPoint = (direction = 1) => resolveChamberReturnPoint(scribeEntryDoor, direction);

    const templeThresholdDoorwayActive = !TEMPLE_THRESHOLD_HALL_ENTRY_DISABLED_FOR_BUILD
      && scopedJourneyAssetPacks.isEgyptJourney
      && currentSceneId === JOURNEY_SCENE_IDS.EXTERIOR
      && player.onGround
      && forgottenMuralPlayerCenterX >= templeThresholdEntryTrigger.minX
      && forgottenMuralPlayerCenterX <= templeThresholdEntryTrigger.maxX
      && player.y < templeThresholdEntryTrigger.maxY
      && Math.abs(forgottenMuralPlayerFootY - templeThresholdEntryTrigger.footY) <= templeThresholdEntryTrigger.footTolerance;
    const templeThresholdExitActive = currentSceneId === JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL
      && forgottenMuralPlayerCenterX >= TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER.minX
      && forgottenMuralPlayerCenterX <= TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER.maxX
      && player.y < TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER.maxY
      && Math.abs(forgottenMuralPlayerFootY - TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER.footY) <= TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER.footTolerance;
    const templeThresholdSealActive = currentSceneId === JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL
      && forgottenMuralPlayerCenterX >= TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER.minX
      && forgottenMuralPlayerCenterX <= TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER.maxX
      && player.y < TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER.maxY
      && Math.abs(forgottenMuralPlayerFootY - TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER.footY) <= TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER.footTolerance;
    if (templeThresholdDoorwayActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      current.templeThresholdHallEntranceDiscovered = true;
      current.hiddenRoomsFound?.add('temple-threshold-hall');
      current.discoveredHiddenRouteIds?.add('temple-threshold-hall-route');
      current.sceneReturn = templeThresholdReturnPoint(player.direction || -1);
      const transition = {
        id: 'temple-threshold-hall-doorway',
        phase: 'doorway-fade',
        fromSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
        toSceneId: JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL,
        lockMovement: true,
        switched: false,
        duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
      };
      current.sceneTransition = transition;
      current.forgottenMuralChamberTransition = transition;
      current.notice = 'Asha steps into the threshold hall.';
      current.cinematicEvent = {
        id: 'temple-threshold-hall-threshold',
        name: 'Temple Approach',
        type: 'temple-threshold-hall-threshold',
        x: (templeThresholdEntryTrigger.minX + templeThresholdEntryTrigger.maxX) / 2,
        y: templeThresholdEntryTrigger.footY - 92,
        duration: 2.6,
        timer: 2.6,
        message: 'The door opens into a guarded hall.',
      };
      current.cinematicTimer = Math.max(current.cinematicTimer || 0, 2.2);
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
      addRewardPulse('temple-threshold-hall-found', current.cinematicEvent.x, current.cinematicEvent.y, 'THRESHOLD', {
        color: '#facc15',
        radius: 82,
        timer: 0.72,
      });
      audioControls?.playExpeditionStinger?.('evidenceDiscovery');
    } else if (templeThresholdSealActive && !current.templeThresholdHallCleared && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      current.templeThresholdHallCleared = true;
      current.completedObjectiveIds.add('temple-threshold-hall');
      current.notice = 'The sealed door answers. This is only the first judgement.';
      current.cinematicEvent = {
        id: 'temple-threshold-hall-seal-warning',
        name: 'Threshold Seal',
        message: 'The sealed door answers. This is only the first judgement.',
        temporary: true,
      };
      current.cinematicTimer = 3.0;
      current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.0);
      audioControls?.playExpeditionSfx?.('openingThresholdFinalPulse');
    } else if (templeThresholdExitActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      current.sceneReturn = templeThresholdReturnPoint(TEMPLE_THRESHOLD_HALL_RETURN_FALLBACK.direction);
      const transition = {
        id: 'temple-threshold-hall-exit',
        phase: 'doorway-fade',
        fromSceneId: JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL,
        toSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
        lockMovement: true,
        switched: false,
        duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
      };
      current.sceneTransition = transition;
      current.forgottenMuralChamberTransition = transition;
      current.notice = 'Asha returns to the temple approach doorway.';
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
      audioControls?.playTransition?.();
    } else {
      current.templeThresholdHallActive = isTempleThresholdHallScene(current);
    }

    const mummificationChamberDoorwayActive = scopedJourneyAssetPacks.isEgyptJourney
      && currentSceneId === JOURNEY_SCENE_IDS.EXTERIOR
      && player.onGround
      && forgottenMuralPlayerCenterX >= mummificationEntryTrigger.minX
      && forgottenMuralPlayerCenterX <= mummificationEntryTrigger.maxX
      && player.y < mummificationEntryTrigger.maxY
      && Math.abs(forgottenMuralPlayerFootY - mummificationEntryTrigger.footY) <= mummificationEntryTrigger.footTolerance;
    const forgottenMuralDoorwayActive = scopedJourneyAssetPacks.isEgyptJourney
      && currentSceneId === JOURNEY_SCENE_IDS.EXTERIOR
      && player.onGround
      && forgottenMuralPlayerCenterX >= forgottenMuralEntryTrigger.minX
      && forgottenMuralPlayerCenterX <= forgottenMuralEntryTrigger.maxX
      && player.y < forgottenMuralEntryTrigger.maxY
      && Math.abs(forgottenMuralPlayerFootY - forgottenMuralEntryTrigger.footY) <= forgottenMuralEntryTrigger.footTolerance;
    const forgottenMuralChamberExitActive = currentSceneId === JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER
      && forgottenMuralPlayerCenterX >= FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER.minX
      && forgottenMuralPlayerCenterX <= FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER.maxX
      && player.y < FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER.maxY
      && Math.abs(forgottenMuralPlayerFootY - FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER.footY) <= FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER.footTolerance;
    const mummificationChamberExitActive = currentSceneId === JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER
      && forgottenMuralPlayerCenterX >= MUMMIFICATION_CHAMBER_EXIT_TRIGGER.minX
      && forgottenMuralPlayerCenterX <= MUMMIFICATION_CHAMBER_EXIT_TRIGGER.maxX
      && player.y < MUMMIFICATION_CHAMBER_EXIT_TRIGGER.maxY
      && Math.abs(forgottenMuralPlayerFootY - MUMMIFICATION_CHAMBER_EXIT_TRIGGER.footY) <= MUMMIFICATION_CHAMBER_EXIT_TRIGGER.footTolerance;
    if (mummificationChamberDoorwayActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      current.mummificationChamberEntranceDiscovered = true;
      current.hiddenRoomsFound?.add('mummification-chamber');
      current.discoveredHiddenRouteIds?.add('mummification-chamber-route');
      current.sceneReturn = mummificationReturnPoint(player.direction || 1);
      const transition = {
        id: 'mummification-chamber-doorway',
        phase: 'doorway-fade',
        fromSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
        toSceneId: JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER,
        lockMovement: true,
        switched: false,
        duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
      };
      current.sceneTransition = transition;
      current.forgottenMuralChamberTransition = transition;
      current.notice = 'This chamber still holds power...';
      current.cinematicEvent = {
        id: 'mummification-chamber-threshold',
        name: 'Asha',
        type: 'mummification-chamber-threshold',
        x: (mummificationEntryTrigger.minX + mummificationEntryTrigger.maxX) / 2,
        y: mummificationEntryTrigger.footY - 92,
        duration: 2.6,
        timer: 2.6,
        message: 'This chamber still holds power...',
      };
      current.cinematicTimer = Math.max(current.cinematicTimer || 0, 2.2);
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
      addRewardPulse('collection-complete', current.cinematicEvent.x, current.cinematicEvent.y, 'CHAMBER FOUND', {
        color: '#facc15',
        radius: 82,
        timer: 0.72,
      });
      audioControls?.playExpeditionStinger?.('evidenceDiscovery');
    } else if (mummificationChamberExitActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      if (!current.mummificationChamberExitUnlocked) {
        if ((current.itemPurposeNoticeTimer || 0) <= 0) {
          current.notice = 'The entrance is sealed. I need to solve the chamber first.';
          current.itemPurposeNoticeTimer = 1.6;
          audioControls?.playExpeditionSfx?.('gateBlocked');
        }
      } else if (!mummificationInteractionResult?.unlocked) {
        current.sceneReturn = mummificationReturnPoint(MUMMIFICATION_CHAMBER_RETURN_FALLBACK.direction);
        const transition = {
          id: 'mummification-chamber-exit',
          phase: 'doorway-fade',
          fromSceneId: JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER,
          toSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
          lockMovement: true,
          switched: false,
          duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
          timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        };
        current.sceneTransition = transition;
        current.forgottenMuralChamberTransition = transition;
        current.notice = 'Asha returns to the mummification chamber doorway.';
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
        audioControls?.playTransition?.();
      }
    } else if (forgottenMuralDoorwayActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      current.sceneReturn = forgottenMuralReturnPoint(player.direction || 1);
      const transition = {
        id: 'forgotten-mural-chamber-doorway',
        phase: 'doorway-fade',
        fromSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
        toSceneId: JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER,
        lockMovement: true,
        switched: false,
        duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
      };
      current.sceneTransition = transition;
      current.forgottenMuralChamberTransition = transition;
      current.notice = 'Asha steps through the hidden doorway.';
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
      audioControls?.playExpeditionStinger?.('evidenceDiscovery');
    } else if (forgottenMuralChamberExitActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      current.sceneReturn = forgottenMuralReturnPoint(FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK.direction);
      const transition = {
        id: 'forgotten-mural-chamber-exit',
        phase: 'doorway-fade',
        fromSceneId: JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER,
        toSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
        lockMovement: true,
        switched: false,
        duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
      };
      current.sceneTransition = transition;
      current.forgottenMuralChamberTransition = transition;
      current.notice = 'Asha returns to the mural chamber doorway.';
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
      audioControls?.playTransition?.();
    } else {
      current.forgottenMuralChamberActive = isForgottenMuralChamberScene(current);
    }

    const scribeDoorwayActive = scopedJourneyAssetPacks.isEgyptJourney
      && currentSceneId === JOURNEY_SCENE_IDS.EXTERIOR
      && player.onGround
      && forgottenMuralPlayerCenterX >= scribeEntryTrigger.minX
      && forgottenMuralPlayerCenterX <= scribeEntryTrigger.maxX
      && player.y < scribeEntryTrigger.maxY
      && Math.abs(forgottenMuralPlayerFootY - scribeEntryTrigger.footY) <= scribeEntryTrigger.footTolerance;
    const scribeChamberExitActive = currentSceneId === JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER
      && forgottenMuralPlayerCenterX >= SCRIBE_CHAMBER_EXIT_TRIGGER.minX
      && forgottenMuralPlayerCenterX <= SCRIBE_CHAMBER_EXIT_TRIGGER.maxX
      && player.y < SCRIBE_CHAMBER_EXIT_TRIGGER.maxY
      && Math.abs(forgottenMuralPlayerFootY - SCRIBE_CHAMBER_EXIT_TRIGGER.footY) <= SCRIBE_CHAMBER_EXIT_TRIGGER.footTolerance;
    if (scribeDoorwayActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      current.sceneReturn = scribeReturnPoint(player.direction || -1);
      current.sceneTransition = {
        id: 'scribe-locked-chamber-doorway',
        phase: 'doorway-fade',
        fromSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
        toSceneId: JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER,
        lockMovement: true,
        switched: false,
        duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
      };
      current.notice = 'Asha steps through the sealed scribe doorway.';
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
      audioControls?.playExpeditionStinger?.('evidenceDiscovery');
    } else if (scribeChamberExitActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      if (!current.scribeChamberExitUnlocked) {
        if ((current.itemPurposeNoticeTimer || 0) <= 0) {
          current.notice = current.scribeChamberTabletInspected
            ? 'The exit stays sealed. The glowing wall message still needs to be decoded.'
            : 'The exit stays sealed. I need to inspect the translation tablet first.';
          current.itemPurposeNoticeTimer = 1.6;
          audioControls?.playExpeditionSfx?.('gateBlocked');
        }
      } else {
        current.sceneReturn = scribeReturnPoint(SCRIBE_CHAMBER_RETURN_FALLBACK.direction);
        current.sceneTransition = {
          id: 'scribe-locked-chamber-exit',
          phase: 'doorway-fade',
          fromSceneId: JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER,
          toSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
          lockMovement: true,
          switched: false,
          duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
          timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        };
        current.notice = 'Asha steps through the opened scribe door.';
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
        audioControls?.playTransition?.();
      }
    } else {
      current.scribeChamberActive = isScribeLockedChamberScene(current);
    }

    if (currentSceneId === JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      const playerBody = getPlayerBodyHitbox(player);
      if (!current.scribeChamberTabletInspected && rectsOverlap(playerBody, SCRIBE_CHAMBER_TABLET_REGION)) {
        current.scribeChamberTabletInspected = true;
        current.notice = 'A translation tablet. Some symbols are damaged, but enough remains to help me.';
        current.cinematicEvent = {
          id: 'scribe-chamber-tablet',
          name: 'Translation Tablet',
          message: 'Sun = light, Water = river, Ankh = life, Door = passage.',
          temporary: true,
        };
        current.cinematicTimer = 3;
        addRewardPulse('scribe-tablet-pulse', SCRIBE_CHAMBER_TABLET_REGION.x + SCRIBE_CHAMBER_TABLET_REGION.width / 2, SCRIBE_CHAMBER_TABLET_REGION.y, 'TABLET READ', {
          color: '#facc15',
          fill: 'rgba(250, 204, 21, 0.12)',
          radius: 46,
          timer: 0.72,
        });
        audioControls?.playSuccess?.();
      }
      if (rectsOverlap(playerBody, SCRIBE_CHAMBER_WALL_REGION) && !current.scribeChamberPuzzleSolved && !current.activeGuardianChallenge) {
        if (!current.scribeChamberTabletInspected) {
          if ((current.itemPurposeNoticeTimer || 0) <= 0) {
            current.notice = 'These are not random pictures. They are writing. I need a translation clue first.';
            current.itemPurposeNoticeTimer = 1.6;
          }
        } else {
          current.scribeChamberWallInspected = true;
          current.notice = 'These are not random pictures. They are writing. If I can read the pattern, I can open the door.';
          current.activeGuardianChallenge = {
            ...SCRIBE_CHAMBER_PUZZLE,
            questions: SCRIBE_CHAMBER_PUZZLE.questions.map(question => ({ ...question })),
            currentIndex: 0,
            correctCount: 0,
            selectedAnswerIndex: null,
            feedback: null,
            answers: [],
            completed: false,
            modifier: null,
            resultMessage: null,
          };
          audioControls?.playTransition?.();
          syncHud();
          return;
        }
      }
    }

    if (!inInteriorChamberScene && scopedJourneyAssetPacks.isEgyptJourney && !current.scarabSealActivated) {
      const scarabSealHitbox = {
        x: SCARAB_SEAL_TRIGGER.x - SCARAB_SEAL_TRIGGER.width / 2,
        y: SCARAB_SEAL_TRIGGER.y - SCARAB_SEAL_TRIGGER.height / 2,
        width: SCARAB_SEAL_TRIGGER.width,
        height: SCARAB_SEAL_TRIGGER.height,
      };
      if (rectsOverlap(getPlayerBodyHitbox(player), scarabSealHitbox)) {
        const thresholdAlreadyIntroduced = Boolean(current.openingConfrontationSeen);
        current.scarabSealActivated = true;
        current.collapsedPlatformIds.add('opening-scarab-seal-summit');
        current.triggeredEnvironmentEventIds.add(SCARAB_SEAL_TRIGGER.id);
        const thresholdLines = [
          { speaker: 'Asha', text: ARRIVAL_THRESHOLD_SPAWN_LINE, at: 0.8 },
          { speaker: 'Asha', text: 'The world fell away.', at: 3.0 },
          { speaker: 'Asha', text: 'I have to find where the seal brought me.', at: 6.0 },
        ];
        if (!thresholdAlreadyIntroduced) {
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
        }
        if (thresholdAlreadyIntroduced) {
          current.openingConfrontationSeen = true;
        }
        current.openingSphinxEncounter = null;
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
          message: SCARAB_SEAL_TRIGGER.sealEmphasisMessage,
          duration: SCARAB_SEAL_TRIGGER.duration,
          shake: SCARAB_SEAL_TRIGGER.shake,
          card: false,
        };
        current.dynamicEnvironmentEventTimer = SCARAB_SEAL_TRIGGER.duration;
        current.openingCameraRevealDuration = SCARAB_SEAL_TRIGGER.cameraRevealDuration;
        current.openingCameraRevealTimer = Math.max(current.openingCameraRevealTimer || 0, SCARAB_SEAL_TRIGGER.cameraRevealDuration);
        current.cinematicEvent = thresholdAlreadyIntroduced ? {
          id: 'scarab-seal-anubis-warning',
          name: SCARAB_SEAL_TRIGGER.eventName,
          message: `${SCARAB_SEAL_TRIGGER.messages.slice(0, 8).join(' ')} ${SCARAB_SEAL_TRIGGER.objectiveEchoLine}`,
          temporary: true,
        } : null;
        current.cinematicTimer = thresholdAlreadyIntroduced ? 5.4 : 0;
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, SCARAB_SEAL_TRIGGER.duration * 0.45);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, SCARAB_SEAL_TRIGGER.shake);
        current.notice = thresholdAlreadyIntroduced ? SCARAB_SEAL_TRIGGER.objectiveEchoLine : '';
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.12);
        addRewardPulse('scarab-seal-awakening', SCARAB_SEAL_TRIGGER.x, SCARAB_SEAL_TRIGGER.y, SCARAB_SEAL_TRIGGER.sealPulseLabel, {
          color: '#38bdf8',
          fill: 'rgba(56, 189, 248, 0.14)',
          radius: SCARAB_SEAL_TRIGGER.sealPulseRadius,
          timer: SCARAB_SEAL_TRIGGER.sealPulseDuration,
        });
        audioControls?.playExpeditionSfx?.(openingAtmosphereSfxKey);
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
        const routeMomentName = route.name?.includes('Mural')
          ? 'Forgotten Mural Alcove discovered'
          : route.name?.includes('Shrine')
          ? 'Ancient Shrine Discovered'
          : route.name?.includes('Archive')
            ? 'Hidden Archive Found'
            : 'Secret Route Discovered';
        current.notice = route.discoveryMessage || `${routeMomentName}.`;
        current.cinematicEvent = {
          id: `${route.id}-discovered`,
          name: routeMomentName,
          message: route.storySummary || route.rewardHint,
          temporary: true,
        };
        current.dynamicEnvironmentEvent = {
          id: `${route.id}-atmosphere`,
          type: route.id === 'desert-upper-survey-route' || routeMomentName === 'Ancient Shrine Discovered' ? 'shrine-glow' : 'dust-gust',
          x: route.x + route.width / 2,
          name: routeMomentName,
          duration: 2.4,
          message: route.rewardHint,
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
    const activeLevelEntrance = !inInteriorChamberScene && STAGE_ENTRANCE_FEATURES.find(feature => (
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
      && scopedJourneyAssetPacks.isEgyptJourney
      && player.x + player.width / 2 >= getStageEntranceTriggerX(activeLevelEntrance)
    ) {
      const guidance = getGateGuidance(activeLevelGate, current);
      if (!guidance.activeGateLocked) {
        current.openedRouteGateIds.add(activeLevelGate.id);
        current.notice = guidance.openMessage;
        current.cinematicEvent = {
          id: `${activeLevelGate.id}-opened`,
          name: guidance.activeGateName,
          message: guidance.openMessage,
          temporary: true,
        };
        current.cinematicTimer = 2.4;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.2);
        addRewardPulse('route-gate-open', activeLevelGate.x + activeLevelGate.width / 2, activeLevelGate.y + 64, 'SEAL OPEN', {
          color: '#38bdf8',
          fill: 'rgba(56, 189, 248, 0.13)',
          radius: 66,
          timer: 0.78,
        });
        audioControls?.playExpeditionSfx?.('gateUnlock');
        audioControls?.playExpeditionStinger?.('gateUnlock');
        startTempleThresholdTransition(current, activeLevelGate, activeLevelEntrance);
        return;
      }
    }

    // Collectibles
    TOOL_LAYOUT.forEach(toolPos => {
      if (inInteriorChamberScene) return;
      if (!current.collectedToolIds.has(toolPos.id) && rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(toolPos, { width: 30, height: 30 }))) {
        current.collectedToolIds.add(toolPos.id);
        const tool = JOURNEY_TOOLS.find(t => t.id === toolPos.id);
        current.fieldKit.push(tool);
        current.notice = `Field tool added: ${tool.name}. This will help during excavation.`;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.8);
        audioControls?.playExpeditionSfx?.('pickupTool');
      }
    });

    RELIC_SHARDS.forEach(shard => {
      if (inInteriorChamberScene) return;
      if (shard.routeId && !isRouteRewardAccessible(shard.routeId, current)) return;
      if (!current.collectedShardIds.has(shard.id) && rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(shard, { width: 24, height: 24 }))) {
        current.collectedShardIds.add(shard.id);
        current.relicShardCount += 1;
        audioControls?.playExpeditionSfx?.('pickupShard');
        const shardGateProgress = getActiveShardGateProgress(current);
        addRewardPulse('shard-pickup', shard.x, shard.y, '+1 SHARD', {
          color: '#f59e0b',
          fill: 'rgba(245, 158, 11, 0.14)',
          radius: shard.hidden ? 32 : 24,
          timer: 0.46,
        });
        if (shard.timelineId) {
          if (!(current.collectedTimelineEvidenceIds instanceof Set)) current.collectedTimelineEvidenceIds = new Set();
          if (!Array.isArray(current.romeTimelineEvidenceOrder)) current.romeTimelineEvidenceOrder = [];
          if (!current.collectedTimelineEvidenceIds.has(shard.timelineId)) {
            current.collectedTimelineEvidenceIds.add(shard.timelineId);
            current.romeTimelineEvidenceOrder.push(shard.timelineId);
          }
          const timelineGate = ROUTE_GATES.find(gate => gate.requires?.timelineSequence?.length);
          const timelineProgress = timelineGate
            ? getTimelineRequirementProgress(timelineGate.requires.timelineSequence, current)
            : null;
          current.romeTimelineSolved = Boolean(timelineProgress?.complete);
          current.notice = timelineProgress?.complete
            ? 'The archive sequence locks into place: Republic, Caesar, Augustus, Empire, split.'
            : `${shard.timelineNotice || `${shard.shortName || shard.label || 'Rome evidence'} recovered.`} (${timelineProgress?.found ?? 1}/${timelineProgress?.required ?? 5})`;
          current.hitStopTimer = Math.max(current.hitStopTimer, 0.025);
        } else if (shard.hidden) {
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
        const shouldEchoOpeningFirstShard = scopedJourneyAssetPacks.isEgyptJourney
          && current.scarabSealActivated
          && !current.openingFirstShardEchoSeen
          && current.relicShardCount === 1
          && shardGateProgress?.gate?.id === 'temple-approach-seal';
        if (shouldEchoOpeningFirstShard) {
          current.openingFirstShardEchoSeen = true;
          current.notice = SCARAB_SEAL_TRIGGER.firstShardEchoLine;
          current.cinematicEvent = {
            id: 'opening-first-shard-echo',
            name: 'Asha',
            message: SCARAB_SEAL_TRIGGER.firstShardEchoLine,
            temporary: true,
          };
          current.cinematicTimer = 2.4;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.2);
        }
      }
    });

    getActiveSecretCollectibles().forEach(secret => {
      if (!isEntityActiveInScene(secret, current)) return;
      if (current.collectedSecretIds?.has(secret.id)) return;
      if (secret.routeId && !isRouteRewardAccessible(secret.routeId, current)) return;
      if (rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(secret, { width: 32, height: 32 }))) {
        current.collectedSecretIds.add(secret.id);
        const restorationStatus = getRoomRestorationStatus(secret, current);
        const forgottenMuralPuzzleReady = restorationStatus.puzzleReady;
        const restoredRoom = restorationStatus.roomRestored;
        const restoration = restorationStatus.restoration || secret;
        const restorationReaction = getAnubisRestorationReaction(restorationStatus, current);
        if (restoredRoom && restorationStatus.config?.restoredStateKey) {
          current[restorationStatus.config.restoredStateKey] = true;
        }
        if (forgottenMuralPuzzleReady) {
          current.forgottenMuralRelicSlidePuzzleOpen = true;
          current.forgottenMuralRelicSlidePuzzleTiles = createForgottenMuralRelicSlidePuzzleTiles();
          current.forgottenMuralRelicSlidePuzzleMoves = 0;
          keysRef.current = {};
        }
        current.notice = forgottenMuralPuzzleReady
          ? 'The scarab mural has been broken into pieces. Not destroyed. Rearranged.'
          : restoredRoom
          ? (restoration?.restoreMessage || restorationStatus.config?.fallbackRestoreMessage || 'Asha restores a sacred room fragment set.')
          : (secret.discoveryMessage || 'Collection Piece Recovered.');
        current.cinematicEvent = {
          id: forgottenMuralPuzzleReady ? 'forgotten-mural-relic-slide-puzzle-opened' : restoredRoom ? `${secret.id}-restored` : `${secret.id}-collected`,
          name: forgottenMuralPuzzleReady ? 'Asha' : restoredRoom ? 'Anubis' : 'Secret Found',
          message: forgottenMuralPuzzleReady
            ? 'If the image is wrong, the story is wrong.'
            : restoredRoom
            ? (restorationReaction || 'Do not mistake this for trust.')
            : `${secret.name} has been added to the field journal.`,
          temporary: true,
        };
        current.cinematicTimer = forgottenMuralPuzzleReady ? 2.8 : restoredRoom ? 3.2 : 2.8;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, forgottenMuralPuzzleReady ? 2.4 : restoredRoom ? 2.6 : 1.8);
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.04);
        addCombatEffect(current, {
          type: 'secret-found',
          x: secret.x,
          y: secret.y,
          text: forgottenMuralPuzzleReady ? 'RELIC READY' : restoredRoom ? (restorationStatus.config?.effectText || 'ROOM RESTORED') : 'SECRET FOUND',
          color: secret.color || '#facc15',
          fill: 'rgba(250, 204, 21, 0.12)',
          radius: 48,
          timer: 0.76,
          maxTimer: 0.76,
        });
        markSecretSetProgress(secret);
      }
    });

    LORE_TABLETS.forEach(tablet => {
      if (inInteriorChamberScene) return;
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
      }
    });

    UPGRADES.forEach(u => {
      if (inInteriorChamberScene) return;
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
        audioControls?.playExpeditionSfx?.('pickupUpgrade');
        current.notice = u.cacheReward
          ? `Cache opened! Upgrade Voucher earned: +${u.rewardShards} relic shards for Base Camp.`
          : `Expedition Upgrade Acquired: ${u.name}.`;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.1);
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
        addRewardPulse('upgrade-pulse', u.x, u.y, u.cacheReward ? 'VOUCHER' : 'UPGRADE', {
          color: '#2563eb',
          fill: 'rgba(37, 99, 235, 0.1)',
          radius: 48,
          timer: 0.7,
        });
      }
    });

    OBJECTIVE_MARKERS.forEach(m => {
      if (inInteriorChamberScene) return;
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
      }
    });

    (current.bossKeyItems || []).forEach((keyItem) => {
      if (inInteriorChamberScene) return;
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
      }
    });

    // Hazards
    if (current.hazardCooldown <= 0) {
      getRenderableHazards(current).forEach(h => {
        if (rectsOverlap(getPlayerBodyHitbox(player), getHazardHitbox(h))) {
          if (isReusableJourneyTrap(h)) {
            const trap = normalizeJourneyTrap(h);
            const runtime = current.trapStates[trap.id] ||= {};
            const previousPhase = runtime.phase || 'armed';
            const previousCooldown = runtime.cooldown || 0;
            const result = updateJourneyTrapRuntime({
              trap,
              runtime,
              triggered: true,
              dt: 0,
            });
            if (result.projectile) {
              current.trapProjectiles.push(result.projectile);
              current.notice = trap.message;
              current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.1);
              current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.08);
              current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.12);
              audioControls?.playExpeditionSfx?.('trapReset', { volume: 0.8 });
            }
            const activated = previousPhase === 'armed' && (trap.type !== 'dart-launcher' || previousCooldown <= 0);
            if (activated && trap.type !== 'dart-launcher') {
              const trapStaminaLoss = Math.ceil((trap.damage || 0) * (upgradeEffects.hazardStaminaMultiplier || 1));
              if (trapStaminaLoss) current.resources.stamina = Math.max(0, current.resources.stamina - trapStaminaLoss);
              current.hazardCooldown = Math.max(current.hazardCooldown, trap.cooldown || 0.9);
              current.lastHazardHit = {
                id: trap.id,
                name: trap.name,
                message: trap.message,
                staminaDelta: -trapStaminaLoss,
                timeDelta: 0,
              };
              current.lastStaminaDelta = -trapStaminaLoss;
              current.lastStaminaLossReason = trap.message;
              current.staminaFeedbackTimer = trapStaminaLoss ? 1.25 : 0.65;
              current.notice = `${trap.message}${trapStaminaLoss ? ` -${trapStaminaLoss} stamina.` : ''}`;
              current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.4);
              current.cameraShakeTimer = Math.max(current.cameraShakeTimer, trap.type === 'collapsing-stone-floor' ? 0.24 : 0.16);
              current.cameraShakeStrength = Math.max(current.cameraShakeStrength, trap.type === 'collapsing-stone-floor' ? 0.28 : 0.18);
              trap.linkedObjectIds.forEach(id => current.triggeredEnvironmentIds.add(id));
              addCombatEffect(current, {
                type: trap.type === 'collapsing-stone-floor' ? 'platform-crack' : 'environment-dust',
                x: trap.x + trap.width / 2,
                y: trap.y + trap.height,
                color: trap.type === 'hidden-sand-pit' ? 'rgba(203, 139, 68, 0.54)' : 'rgba(137, 104, 72, 0.5)',
                timer: 0.46,
                maxTimer: 0.46,
              });
              audioControls?.playExpeditionSfx?.(trap.type === 'hidden-sand-pit' ? 'trapSandTrigger' : 'trapReset', { volume: 0.9 });
              if (current.resources.stamina === 0) current.enduranceExhausted = true;
            }
            return;
          }
          const staminaLoss = Math.ceil((h.penalty?.stamina || 0) * (upgradeEffects.hazardStaminaMultiplier || 1));
          const timeLoss = h.penalty?.time || 0;
          const visual = HAZARD_VISUALS[h.id] || {};
          if (h.pushToStart) {
            const startCheckpoint = getRenderableCheckpoints()[0];
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
            const hazardSfx = h.type === 'arrow-trap' && scopedJourneyAssetPacks.isChinaJourney ? 'chinaCrossbowTrap' : getHazardSfxKey(h);
            audioControls?.playExpeditionSfx?.(hazardSfx, { volume: 1.04 });
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
          if (staminaLoss && current.resources.stamina === 0) current.enduranceExhausted = true;
          current.notice = `${visual.message || h.message}${staminaLoss ? ` -${staminaLoss} Endurance.` : timeLoss ? ` -${timeLoss} seconds.` : ''}${dangerWarning}`;
          current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.4);
          const hazardSfx = h.type === 'arrow-trap' && scopedJourneyAssetPacks.isChinaJourney ? 'chinaCrossbowTrap' : getHazardSfxKey(h);
          audioControls?.playExpeditionSfx?.(hazardSfx, {
            volume: staminaLoss ? 0.96 : 0.82,
          });
          audioControls?.playError?.();
          if (current.resources.stamina <= 0) triggerJourneyRescue(FIELD_RESCUE_STAMINA_REASON);
        }
      });
    }

    // Attacks
    let attackRect = null;
    const attackActionReady = current.attackCooldown <= 0
      && current.attackWindupTimer <= 0
      && current.attackTimer <= 0
      && current.attackRecoilTimer <= 0;
    if (current.attackQueued && attackActionReady) {
      const finisherAllowed = !current.enduranceExhausted;
      const queuedAttackType = current.attackQueuedType === PLAYER_ATTACK_TYPES.HEAVY
        ? PLAYER_ATTACK_TYPES.HEAVY
        : PLAYER_ATTACK_TYPES.LIGHT;
      const isHeavyAttack = queuedAttackType === PLAYER_ATTACK_TYPES.HEAVY;
      const heavyFollowupPrimed = isHeavyAttack && finisherAllowed && (current.attackQueuedHeavyFollowupPrimed || (current.attackComboWindowTimer > 0 && current.attackComboLanded));
      const nextAttackSequenceIndex = heavyFollowupPrimed
        ? PLAYER_COMBO_MAX_STEP
        : isHeavyAttack
          ? 2
          : 1;
      const isFinisher = nextAttackSequenceIndex === PLAYER_COMBO_MAX_STEP;
      const attackTiming = getPlayerAttackTiming(nextAttackSequenceIndex);
      current.attackQueued = false;
      current.attackQueuedType = PLAYER_ATTACK_TYPES.LIGHT;
      current.attackQueuedHeavyFollowupPrimed = false;
      current.attackType = queuedAttackType;
      current.attackWindupDuration = attackTiming.windup;
      current.attackSwingDuration = attackTiming.swing;
      current.attackRecoilDuration = attackTiming.recoil;
      current.attackWindupTimer = attackTiming.windup;
      current.attackTimer = 0;
      current.attackRecoilTimer = 0;
      current.attackPhase = 'windup';
      current.attackCooldown = attackTiming.cooldown;
      current.attackSequenceIndex = nextAttackSequenceIndex;
      current.attackComboStep = nextAttackSequenceIndex;
      current.attackComboLanded = false;
      current.attackComboPreserved = false;
      current.attackComboFinisherActive = heavyFollowupPrimed;
      current.heavyFollowupReadyTimer = 0;
      current.heavyFollowupCueTimer = 0;
      current.attackHitIds.clear();
      current.attackRewarded = false;
      current.lastAttackResult = 'started';
      current.shieldedHitFeedback = '';
      applyAttackStaminaCost(PLAYER_ATTACK_STAMINA_COST, 'Attack swing');
      if (isHeavyAttack && !heavyFollowupPrimed) applyAttackStaminaCost(PLAYER_ATTACK_FINISHER_EXTRA_STAMINA_COST, 'Heavy swing');
      if (isFinisher) applyAttackStaminaCost(PLAYER_ATTACK_FINISHER_EXTRA_STAMINA_COST, 'Finisher swing');
      addCombatEffect(current, {
        type: 'attack-burst',
        x: player.x + player.width / 2 + player.direction * 12,
        y: player.y + 23,
        direction: player.direction,
        color: isFinisher ? '#fbbf24' : '#fde68a',
        timer: isFinisher ? 0.32 : 0.22,
        maxTimer: isFinisher ? 0.32 : 0.22,
      });
      audioControls?.playExpeditionSfx?.(isFinisher ? 'attackFinisher' : isHeavyAttack ? 'attackSwing2' : 'attackSwing1');
      audioControls?.playAction?.();
    }
    if (current.attackTimer > 0) {
      attackRect = getAttackBox(
        player,
        PLAYER_ATTACK_RANGE,
        PLAYER_ATTACK_HEIGHT,
        player.direction,
        0,
        PLAYER_ATTACK_BACK_REACH,
      );
      current.playerAttackBox = attackRect;
    } else {
      current.playerAttackBox = null;
    }

    ENVIRONMENT_INTERACTIONS.forEach((interaction) => {
      if (inInteriorChamberScene) return;
      if (current.brokenEnvironmentIds?.has(interaction.id)) return;
      if (interaction.oneShot && current.triggeredEnvironmentIds?.has(interaction.id)) return;
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
      const newStamina = current.resources.stamina - amount;
      current.resources.stamina = Math.max(0, newStamina);
      if (current.resources.stamina === 0) current.enduranceExhausted = true;
      player.invulnerable = INVULNERABLE_DURATION;
      player.damageCooldownTimer = INVULNERABLE_DURATION + 0.34;
      player.hitFeedbackTimer = 0.75;
      player.impactShakeTimer = Math.max(player.impactShakeTimer || 0, PLAYER_HIT_SCREEN_SHAKE_DURATION);
      player.lastDamage = amount;
      player.lastDamageSource = source;
      player.lastDamageTime = Date.now();
      player.knockbackMaxTimer = Math.max(0.06, 0.12 * effectiveKnockbackMultiplier);
      player.knockbackTimer = player.knockbackMaxTimer;
      player.knockbackDirection = direction;
      player.vx = approach(player.vx, direction * 95 * effectiveKnockbackMultiplier, 160);
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.075);
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.2);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.4);
      current.notice = `${message} -${amount} Endurance.${isLowStamina(current, maxStamina) ? ` ${LOW_STAMINA_WARNING}` : ''}`;
      current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.4);
      current.lastAttackResult = 'player-hit';
      resetPlayerCombo(current);
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
      if (!scopedJourneyAssetPacks.isChinaJourney && !scopedJourneyAssetPacks.isRomeJourney) {
        audioControls?.playExpeditionSfx?.('combatDangerHit', { volume: Math.min(1.12, 0.78 + amount / 28) });
        audioControls?.playExpeditionSfx?.('ashaHurtBreath', { volume: amount >= 8 ? 0.72 : 0.5 });
      }
      audioControls?.playError?.();
      if (options.canOverwhelm && newStamina < 0) triggerJourneyRescue(FIELD_RESCUE_STAMINA_REASON);
    };

    current.trapProjectiles = (current.trapProjectiles || []).filter((projectile) => {
      if (!rectsOverlap(getPlayerBodyHitbox(player), projectile)) return true;
      const direction = projectile.direction === 'left' ? -1 : projectile.direction === 'right' ? 1 : player.direction >= 0 ? -1 : 1;
      applyPlayerDamage(projectile.damage || 6, 'Hidden dart trap struck Asha', direction, projectile.trapId || 'dart-launcher', {
        knockbackMultiplier: 0.7,
      });
      return false;
    });

    const applyPlayerVenomSlow = (sourceEnemy, pattern) => {
      player.venomSlowTimer = Math.max(player.venomSlowTimer || 0, pattern.slowDuration || SCORPION_VENOM_SLOW_DURATION);
      player.venomSlowMultiplier = pattern.slowMultiplier || SCORPION_VENOM_SLOW_MULTIPLIER;
      player.vx *= player.venomSlowMultiplier;
      current.notice = `${sourceEnemy.name} venom slowed Asha. Fight through it.`;
      current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.25);
      current.lastAttackResult = 'player-slowed';
      addCombatEffect(current, {
        type: 'venom-slow',
        x: player.x + player.width / 2,
        y: player.y + player.height * 0.42,
        footY: player.y + player.height + 5,
        radius: 34,
        timer: 0.92,
        maxTimer: 0.92,
      });
      audioControls?.playExpeditionSfx?.('enemyHit', { volume: 0.5, playbackRate: 0.72 });
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
      if (enemy.type === 'scorpion-nest') {
        enemy.knockbackTimer = 0;
        enemy.knockbackDirection = 0;
      } else {
        enemy.knockbackTimer = 0.18;
        enemy.knockbackDirection = player.direction;
      }
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
    if (enemiesDisabled) {
      current.enemies.forEach(e => {
        e.attackWindup = 0;
        e.attackTimer = 0;
        e.attackReady = false;
        e.attackRecovery = 0;
        e.vulnerabilityTimer = 0;
        e.shieldTimer = 0;
        e.knockbackTimer = 0;
        e.aggroMemoryTimer = 0;
        if (e.defeated) updateEnemyDefeatedVisibility(e, dt);
      });
    } else current.enemies.forEach(e => {
      if (e.defeated) {
        updateEnemyDefeatedVisibility(e, dt);
        return;
      }
      if (!isEntityActiveInScene(e, current)) return;
      const activeBossDomain = current.bossDomain
        && !current.defeatedMiniBosses.has(current.bossDomain.bossId)
        ? current.bossDomain
        : null;
      if (isNormalEnemyInsideBossFocus(e, activeBossDomain)) {
        suppressEnemyForBossFocus(e);
        return;
      }
      const wasEnemyAttacking = updateEnemyCombatTimers(e, dt);
      if (wasEnemyAttacking && e.attackTimer <= 0) {
        // The swing just ended, so the in-flight timers are already zero — resolve the
        // heavy pattern by id here so heavies open their longer counter windows.
        const endedHeavyPattern = HEAVY_ATTACK_PATTERNS[e.type];
        const pattern = endedHeavyPattern && e.attackPattern === endedHeavyPattern.id
          ? endedHeavyPattern
          : getEnemyPatternConfig(e);
        openEnemyCounterWindow(e, pattern);
        addCombatEffect(current, {
          type: 'enemy-counter-window',
          x: e.x + e.width / 2,
          y: e.y + e.height / 2,
          color: '#d6b95c',
        });
        addCombatEffect(current, {
          type: 'sand-skid',
          x: e.x + e.width / 2,
          y: e.y + e.height,
          direction: -(e.attackDirection || e.direction || 1),
          color: 'rgba(136, 82, 36, 0.42)',
          timer: 0.42,
          maxTimer: 0.42,
        });
      }

      const distanceToPlayer = (player.x + player.width / 2) - (e.x + e.width / 2);
      const tacticalPattern = getEnemyPatternConfig(e);
      const pressureReachBonus = e.encounterRole ? 26 : 0;
      const awarenessMultiplier = tacticalPattern.awarenessMultiplier || 1;
      const baseNearPlayerX = (e.type === 'bat' || e.flying ? 240 : 210) + pressureReachBonus;
      const nearPlayer = Math.abs(distanceToPlayer) < (baseNearPlayerX * awarenessMultiplier) && Math.abs(player.y - e.y) < 104 + (e.encounterRole ? 14 : 0);
      const scorpionVenomCanReach = e.type === 'scorpion'
        && Math.abs(distanceToPlayer) <= SCORPION_VENOM_SPIT_RANGE
        && Math.abs((player.y + player.height / 2) - (e.y + e.height / 2)) < 96;
      const attackDirectionToPlayer = distanceToPlayer >= 0 ? 1 : -1;
      const meleeReachesPlayer = rectsOverlap(
        getAttackBox(e, ENEMY_ATTACK_TRIGGER_REACH, tacticalPattern.height, attackDirectionToPlayer, tacticalPattern.yOffset || 0, 0),
        getPlayerBodyHitbox(player),
      );
      const playerIsVenomSlowed = (player.venomSlowTimer || 0) > 0;
      const shouldUseVenomSpit = e.type === 'scorpion' && !meleeReachesPlayer && scorpionVenomCanReach && !playerIsVenomSlowed;
      const scarabPoisonChargeCanReach = e.type === 'scarab'
        && playerIsVenomSlowed
        && nearPlayer
        && Math.abs(distanceToPlayer) <= (ENEMY_ATTACK_TRIGGER_REACH + SCARAB_POISONED_CHARGE_START_BONUS);
      const enemyCanStartAttack = (nearPlayer && meleeReachesPlayer) || shouldUseVenomSpit || scarabPoisonChargeCanReach;
      if (nearPlayer || shouldUseVenomSpit || scarabPoisonChargeCanReach || (e.type === 'scorpion' && playerIsVenomSlowed && scorpionVenomCanReach)) {
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

      if (e.stunTimer <= 0 && e.attackTimer <= 0 && e.attackWindup <= 0 && enemyCanStartAttack && e.attackCooldown <= 0) {
        e.attackCount = (e.attackCount || 0) + 1;
        const heavyInterval = HEAVY_ATTACK_INTERVAL[e.type];
        const isHeavyAttack = Boolean(
          HEAVY_ATTACK_PATTERNS[e.type]
          && heavyInterval
          && e.attackCount % heavyInterval === 0
          && !shouldUseVenomSpit,
        );
        const pattern = shouldUseVenomSpit
          ? SCORPION_VENOM_ATTACK_PATTERN
          : isHeavyAttack
            ? HEAVY_ATTACK_PATTERNS[e.type]
            : tacticalPattern;
        // Depth pressure: enemies deeper in the site attack more frequently
        const deepZone = e.x > scaleJourneyX(1480);
        const deepZoneCooldownMultiplier = deepZone
          ? (e.x > scaleJourneyX(4000) ? 0.78 : 0.85)
          : 1;
        // Wound state: below half health, enemies become more desperate
        const woundState = e.health < e.maxHealth * 0.5;
        const woundMultiplier = woundState ? 0.80 : 1;
        const attackCooldown = Math.max(0.55, pattern.cooldown * deepZoneCooldownMultiplier * woundMultiplier);
        beginEnemyAttackWindup(e, pattern, {
          attackDirection: attackDirectionToPlayer,
          attackCooldown,
        });
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
        if (pattern.id === SCORPION_VENOM_ATTACK_PATTERN.id) {
          const venomTravelTime = SCORPION_VENOM_SPIT_VISUAL_TRAVEL_TIME;
          const rawLead = (player.vx || 0) * venomTravelTime * 0.85;
          const velocityLead = Math.max(-160, Math.min(160, rawLead));
          addCombatEffect(current, {
            type: 'venom-spit',
            x: e.x + e.width / 2,
            y: e.y + e.height * 0.28,
            targetX: player.x + player.width / 2 + velocityLead,
            targetY: player.y + player.height * 0.42,
            color: '#84cc16',
            arcHeight: 42,
            timer: venomTravelTime,
            maxTimer: venomTravelTime,
          });
        }
        if (isHeavyAttack) {
          current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.14);
          current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.18);
        }
        const scarabPoisonedChargeNotice = e.type === 'scarab' && playerIsVenomSlowed;
        const isUnblockableAttack = isHeavyAttack && pattern.protectedDuringWindup;
        if (scarabPoisonedChargeNotice) {
          current.notice = 'Scarab charges faster while venom slows Asha. Dodge behind it.';
        } else if ((current.itemPurposeNoticeTimer || 0) <= 0 && (current.damageNoticeTimer || 0) <= 0) {
          if (isUnblockableAttack) {
            if (!current.redAttackHintShown) {
              // First red attack of the run — teach the colour language explicitly.
              current.redAttackHintShown = true;
              current.notice = `${e.name} glows RED — unblockable. You can't parry it; dodge (L)!`;
              current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 2.6);
            } else {
              current.notice = `${e.name} — red ${pattern.label}. Unblockable, dodge it!`;
            }
          } else {
            current.notice = isHeavyAttack
              ? `${e.name} — orange ${pattern.label}. Parry or dodge.`
              : `${e.name} winds up ${pattern.label}. Parry or dodge.`;
          }
        }
      }

      if (e.attackReady && e.attackWindup <= 0 && e.attackTimer <= 0) {
        beginEnemyAttackSwing(e, getEnemyPatternConfig(e));
      }

      if (e.attackTimer > 0) {
        const pattern = getEnemyPatternConfig(e);
        const scarabPoisonChargeBoost = e.type === 'scarab' && playerIsVenomSlowed ? SCARAB_POISONED_CHARGE_SPEED_MULTIPLIER : 1;
        e.x += e.attackDirection * pattern.speed * scarabPoisonChargeBoost * dt;
        const enemyAttackBox = getAttackBox(e, pattern.range, pattern.height, e.attackDirection, pattern.yOffset || 0, pattern.backReach || 0);
        const contact = resolveEnemyContact(player, previousPlayer, e);
        const playerBodyHitbox = getPlayerBodyHitbox(player);
        if (contact.type === 'stomp') {
          applyEnemyStomp(e);
          return;
        }
        if (!e.attackHasHit && rectsOverlap(enemyAttackBox, playerBodyHitbox)) {
          e.attackHasHit = true;
          // Perfect dodge takes precedence: if the blow lands while Asha is in her
          // dodge i-frames, she deflects it (any colour, including red) and the
          // enemy is left staggered for a punish.
          const playerIsPerfectDodging = current.dodgeInvulnerableTimer > 0;
          const playerIsParrying = attackRect
            && e.attackTimer <= PARRY_WINDOW_DURATION
            && !current.attackHitIds.has(e.id)
            && getEnemyAttackTelegraph(e, HEAVY_ATTACK_PATTERNS).parryable
            && rectsOverlap(attackRect, getAttackHurtbox(e));
          if (playerIsPerfectDodging) {
            e.attackTimer = 0;
            e.attackWindup = 0;
            e.attackReady = false;
            e.stunTimer = Math.max(e.stunTimer || 0, 1.3);
            e.attackCooldown = Math.max(e.attackCooldown || 0, 1.3);
            e.attackRecovery = 0.6;
            e.vulnerabilityTimer = Math.max(e.vulnerabilityTimer || 0, 0.6);
            current.resources.stamina = Math.min(maxStamina, current.resources.stamina + PERFECT_DODGE_ENDURANCE_REWARD);
            current.lastAttackResult = 'perfect-dodge';
            current.notice = `Perfect dodge! ${e.name} is staggered — strike now.`;
            current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.4);
            current.hitStopTimer = Math.max(current.hitStopTimer, 0.08);
            current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.18);
            current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.35);
            addCombatEffect(current, {
              type: 'parry-burst',
              x: player.x + player.width / 2,
              y: player.y + player.height * 0.42,
              color: '#7fe9ff',
              timer: 0.42,
              maxTimer: 0.42,
            });
            audioControls?.playExpeditionSfx?.('parryClash', { volume: 0.7 });
          } else if (playerIsParrying) {
            e.parried = true;
          } else if (pattern.slowDuration) {
            applyPlayerVenomSlow(e, pattern);
          } else {
            const damageDirection = contact.direction || e.attackDirection || ((player.x + player.width / 2) >= (e.x + e.width / 2) ? 1 : -1);
            const isHeavyHit = HEAVY_ATTACK_PATTERNS[e.type]?.id === pattern.id;
            const batKnockback = e.type === 'bat' ? (isHeavyHit ? 3.4 : 2.6) : (e.playerKnockbackMultiplier || 1);
            applyPlayerDamage(Math.max(e.damage, Math.round(e.damage * (pattern.damageScale || 1))), `${e.name} hit you`, damageDirection, e.name, {
              knockbackMultiplier: isHeavyHit ? (batKnockback * 1.4) : batKnockback,
              canOverwhelm: true,
            });
            if (isHeavyHit) {
              current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.36);
              current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.65);
              current.hitStopTimer = Math.max(current.hitStopTimer, 0.10);
            }
            if (e.type === 'snake' && !player.poisonTimer) {
              player.poisonTimer = 4.0;
              player.poisonTickTimer = 1.0;
              current.notice = 'Snake venom is in the wound. -1 stamina per second.';
              current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.4);
            }
            if (e.type === 'sand-wisp') {
              player.sandBlindTimer = Math.max(player.sandBlindTimer || 0, 2.2);
            }
          }
        }
      }

      if (e.knockbackTimer > 0 && e.type !== 'scorpion-nest') {
        e.x += e.knockbackDirection * 95 * dt;
      }

      if (e.stunTimer <= 0 && e.attackWindup <= 0 && e.attackTimer <= 0 && e.attackRecovery <= 0) {
        const isAggroChasing = (e.aggroMemoryTimer || 0) > 0;
        const sameCombatPlane = Math.abs(player.y - e.y) < 118 + (e.encounterRole ? 16 : 0);
        const isPressingPlayer = isAggroChasing
          || (
            Math.abs(distanceToPlayer) < (baseNearPlayerX * awarenessMultiplier * 1.55)
            && sameCombatPlane
          );
        const slowPursuitBoost = e.type === 'scorpion' && playerIsVenomSlowed ? 1.48 : 1;
        const chaseSpeedMultiplier = isAggroChasing
          ? (tacticalPattern.chaseMultiplier || 1.65) * (e.type === 'scorpion' ? SCORPION_CHASE_SPEED_MULTIPLIER * slowPursuitBoost : 1)
          : 1;
        const patrolSpeed = (e.baseSpeed || e.speed) * updateHostileStepMultiplier(e, dt) * chaseSpeedMultiplier;
        const movementMin = isAggroChasing ? e.patrolMin - ENEMY_AGGRO_PATROL_PADDING : e.patrolMin;
        const movementMax = isAggroChasing ? e.patrolMax + ENEMY_AGGRO_PATROL_PADDING : e.patrolMax;

        if (isPressingPlayer && sameCombatPlane) {
          // Hold a consistent standoff slot just in front of or behind Asha
          // instead of sharing her space. Commit to whichever side the enemy
          // approached from so the choice can't flip-flop frame to frame (that
          // flip-flop is what looked like the enemy spinning on top of her).
          const playerCenter = player.x + player.width / 2;
          const enemyCenter = e.x + e.width / 2;
          if (!e.combatSide) {
            const rawSide = enemyCenter - playerCenter;
            e.combatSide = Math.abs(rawSide) > 1 ? Math.sign(rawSide) : -(e.direction || 1);
          }
          const standoffDistance = e.width / 2 + player.width / 2 + ENEMY_COMBAT_STANDOFF_GAP;
          let targetX = playerCenter + e.combatSide * standoffDistance - e.width / 2;
          targetX = Math.min(movementMax, Math.max(movementMin, targetX));
          const step = patrolSpeed * dt;
          const toTarget = targetX - e.x;
          e.x += Math.abs(toTarget) <= step ? toTarget : Math.sign(toTarget) * step;
          // Always face Asha while holding the line.
          e.direction = e.combatSide >= 0 ? -1 : 1;
        } else {
          // Not locked into a combat slot: patrol/chase normally and release the
          // committed side so it is re-picked on the next approach.
          e.combatSide = 0;
          if (isPressingPlayer) {
            e.direction = distanceToPlayer >= 0 ? 1 : -1;
          }
          e.x += e.direction * patrolSpeed * dt;
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
          || (e.attackWindup > 0 && pattern.protectedDuringWindup)
          || (e.attackTimer > 0 && pattern.protectedDuringAttack && e.vulnerabilityTimer <= 0);
        if (protectedEnemy) {
          e.attackCooldown = Math.max(e.attackCooldown, 0.35);
          current.attackRecoilTimer = Math.max(current.attackRecoilTimer, 0.1);
          current.lastAttackResult = 'protected';
          resetPlayerCombo(current);
          current.shieldedHitFeedback = `${e.name} blocked the rushed hit.`;
          applyAttackStaminaCost(PROTECTED_HIT_EXTRA_STAMINA_COST, 'Protected enemy blocked attack', '-1');
          applyCombatHitImpact({
            current,
            target: e,
            player,
            hitType: 'blocked',
            direction: player.direction,
            shieldEffectType: 'enemy-shield',
            guardColor: 'rgba(214, 185, 92, 0.78)',
            sfxOptions: { volume: e.type === 'scarab' ? 0.92 : 0.78 },
          });
          current.notice = `${e.name} blocked the rushed hit. Wait for an opening.`;
          return;
        }
        const isScarabFrontalHit = e.type === 'scarab'
          && Math.sign((player.x + player.width / 2) - (e.x + e.width / 2)) === Math.sign(e.direction);
        if (isScarabFrontalHit) {
          current.lastAttackResult = 'shell-deflect';
          resetPlayerCombo(current);
          current.notice = 'Scarab shell absorbed the blow. Dodge behind it after the charge.';
          current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.1);
          applyCombatHitImpact({
            current,
            target: e,
            player,
            hitType: 'blocked',
            direction: player.direction,
            guardColor: 'rgba(170, 140, 90, 0.72)',
            sfxOptions: { volume: 0.68 },
          });
          return;
        }
        const isParry = getEnemyAttackTelegraph(e, HEAVY_ATTACK_PATTERNS).parryable
          && (e.parried || (e.attackTimer > 0 && e.attackTimer <= PARRY_WINDOW_DURATION));
        const isFinisher = current.attackComboFinisherActive;
        const isHeavyAttack = current.attackType === PLAYER_ATTACK_TYPES.HEAVY;
        e.parried = false;
        e.health -= isFinisher ? PLAYER_ATTACK_FINISHER_DAMAGE : (isParry ? PLAYER_ATTACK_PARRY_DAMAGE : (isHeavyAttack ? PLAYER_ATTACK_SHOVE_DAMAGE : PLAYER_ATTACK_LIGHT_DAMAGE));
        if (!current.attackRewarded) {
          const heavyFollowupRefund = isFinisher ? PLAYER_HEAVY_FOLLOWUP_HIT_REFUND : (isParry ? 8 : (isHeavyAttack ? 0 : 1));
          current.resources.stamina = Math.min(current.upgradeEffects?.maxStamina || 100, current.resources.stamina + heavyFollowupRefund);
          current.attackRewarded = true;
        }
        const primesHeavyFollowup = !isFinisher && !isHeavyAttack;
        current.attackComboLanded = primesHeavyFollowup;
        current.attackComboWindowTimer = primesHeavyFollowup ? PLAYER_COMBO_WINDOW_DURATION : 0;
        current.heavyFollowupReadyTimer = primesHeavyFollowup ? PLAYER_COMBO_WINDOW_DURATION : 0;
        current.heavyFollowupCueTimer = primesHeavyFollowup ? PLAYER_HEAVY_FOLLOWUP_CUE_DURATION : 0;
        current.attackComboStep = primesHeavyFollowup ? current.attackSequenceIndex : 0;
        current.lastAttackResult = isFinisher ? 'finisher' : (isParry ? 'parry' : (e.vulnerabilityTimer > 0 || e.attackRecovery > 0 ? 'counter-hit' : 'hit'));
        current.shieldedHitFeedback = '';
        if (primesHeavyFollowup) {
          addCombatEffect(current, {
            type: 'heavy-ready-cue',
            x: player.x + player.width / 2 + player.direction * 30,
            y: player.y + player.height * 0.28,
            direction: player.direction,
            color: '#f8e7b6',
            timer: Math.max(current.heavyFollowupReadyTimer || 0, current.heavyFollowupCueTimer || 0),
            maxTimer: Math.max(current.heavyFollowupReadyTimer || 0, current.heavyFollowupCueTimer || 0),
          });
        }
        const exhausted = current.resources.stamina > 0 && current.resources.stamina < 25;
        e.stunTimer = isFinisher ? 1.55 : (isParry ? 1.4 : (isHeavyAttack ? 1.1 : (exhausted ? 0.38 : 0.8)));
        e.attackWindup = 0;
        e.attackTimer = 0;
        e.attackReady = false;
        e.attackCooldown = Math.max(e.attackCooldown, isFinisher ? 1.55 : (isParry ? 1.4 : (isHeavyAttack ? 0.95 : (exhausted ? 0.32 : 0.6))));
        e.attackRecovery = isFinisher ? 0.72 : (isParry ? 0.6 : (isHeavyAttack ? 0.55 : (exhausted ? 0.22 : 0.45)));
        e.vulnerabilityTimer = isFinisher ? 0.62 : (isParry ? 0.55 : 0.35);
        e.shieldTimer = 0;
        const combatHitImpactType = isFinisher
          ? 'finisher'
            : e.health <= 0
              ? 'defeated'
            : isHeavyAttack
              ? 'shove'
              : 'light';
        if (isParry && e.health > 0) {
          addCombatEffect(current, {
            type: 'parry-burst',
            x: e.x + e.width / 2,
            y: e.y + e.height / 2,
            color: '#fbbf24',
            timer: 0.4,
            maxTimer: 0.4,
          });
        }
        applyCombatHitImpact({
          current,
          target: e,
          player,
          hitType: isParry ? 'combo2' : combatHitImpactType,
          defeated: e.health <= 0,
          direction: player.direction,
          targetKind: 'enemy',
          color: isFinisher ? '#fbbf24' : (e.health <= 0 ? '#b8943c' : (combatHitImpactType === 'shove' ? '#b8c4d0' : '#7dd3fc')),
          sparkColor: current.lastAttackResult === 'finisher' ? '#fbbf24' : (current.lastAttackResult === 'parry' ? '#fde68a' : (current.lastAttackResult === 'counter-hit' ? '#bbf7d0' : (combatHitImpactType === 'shove' ? '#cdd8e0' : '#e2d5c0'))),
          sparkFill: current.lastAttackResult === 'finisher' ? 'rgba(251, 191, 36, 0.38)' : (current.lastAttackResult === 'parry' ? 'rgba(251, 191, 36, 0.32)' : (current.lastAttackResult === 'counter-hit' ? 'rgba(34, 197, 94, 0.18)' : (combatHitImpactType === 'shove' ? 'rgba(176, 196, 214, 0.2)' : 'rgba(190, 168, 128, 0.18)'))),
          sfxKey: isParry ? 'parryClash' : (combatHitImpactType === 'light' ? getEnemyHitSfxKey(e) : undefined),
          sfxOptions: isParry
            ? { volume: 1.0 }
            : { volume: e.health <= 0 ? 1.12 : (current.lastAttackResult === 'counter-hit' ? 1.02 : 0.92) },
          suppressSlash: isParry,
        });
        if (e.health <= 0) {
          e.defeated = true;
          e.defeatedVisibleTimer = ENEMY_DEFEATED_VISIBLE_SECONDS;
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
          // Clean defeat refunds a little Endurance so chained fights stay sustainable.
          const enduranceBeforeDefeat = current.resources.stamina;
          current.resources.stamina = Math.min(current.upgradeEffects?.maxStamina || 100, enduranceBeforeDefeat + PLAYER_DEFEAT_ENDURANCE_REWARD);
          const defeatEnduranceGained = Math.round(current.resources.stamina - enduranceBeforeDefeat);
          if (defeatEnduranceGained > 0) current.notice = `${current.notice} +${defeatEnduranceGained} Endurance.`;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.8);
        } else {
          current.notice = isFinisher ? `${e.name} thrown back by Asha's finisher.` : (isParry ? 'Parried! Asha deflected the blow.' : (isHeavyAttack ? `${e.name} shoved back. Land J first for a heavy.` : `${e.name} stunned.`));
        }
      }
    });

    // --- Scorpion nest spawner: stationary nests spit scorpions until destroyed ---
    if (!enemiesDisabled) current.enemies.forEach(nest => {
      if (nest.type !== 'scorpion-nest' || nest.defeated) return;
      if (!isEntityActiveInScene(nest, current)) return;
      // Keep the nest inert — it never moves or attacks, it only spawns.
      nest.attackWindup = 0;
      nest.attackTimer = 0;
      nest.attackReady = false;
      nest.attackRecovery = 0;
      nest.vx = 0;
      // Only spawn while the player is engaged with the arena (nest roughly on-screen).
      const playerNearNest = Math.abs((player.x + player.width / 2) - (nest.x + nest.width / 2)) < CANVAS_WIDTH * 0.85;
      if (!playerNearNest) {
        nest.spawnTimer = nest.spawnInitialDelay ?? 0.9;
        return;
      }
      if (nest.spawnTimer == null) nest.spawnTimer = nest.spawnInitialDelay ?? 0.9;
      nest.spawnTimer -= dt;
      const aliveBrood = current.enemies.filter(other => other.nestParentId === nest.id && !other.defeated).length;
      const spawnCap = nest.spawnCap ?? 3;
      if (nest.spawnTimer <= 0 && aliveBrood < spawnCap) {
        nest.spawnTimer = nest.spawnInterval ?? 3.4;
        nest.broodCount = (nest.broodCount || 0) + 1;
        const spawnDir = (player.x + player.width / 2) >= (nest.x + nest.width / 2) ? 1 : -1;
        const broodHeight = 30;
        const nestBaseY = nest.y + nest.height + (
          Number.isFinite(nest.yOffset)
            ? nest.yOffset
            : SCORPION_NEST_EDITOR_DEFAULTS.yOffset
        );
        current.enemies.push(makeEnemy({
          id: `${nest.id}-spawn-${nest.broodCount}`,
          name: 'Nest Scorpion',
          type: 'scorpion',
          emoji: 'S',
          x: nest.x + nest.width / 2 - 23 + spawnDir * 18,
          y: nestBaseY - broodHeight - 2,
          width: 46,
          height: broodHeight,
          patrolMin: nest.x - 150,
          patrolMax: nest.x + nest.width + 150,
          speed: 64,
          health: 2,
          damage: 6,
          openingRouteRamp: true,
          attackPatternTuning: { windup: 0.62, duration: 0.32, cooldown: 1.68, recovery: 0.66, vulnerableAfter: 0.74, speed: 50, range: 28, height: 62, yOffset: -38, backReach: 42, damageScale: 1.4 },
          shards: 1,
          direction: spawnDir,
          nestParentId: nest.id,
          encounterRole: 'nest brood',
        }));
        addCombatEffect(current, {
          type: 'sand-skid',
          x: nest.x + nest.width / 2,
          y: nestBaseY,
          direction: spawnDir,
          color: 'rgba(136, 82, 36, 0.5)',
          timer: 0.4,
          maxTimer: 0.4,
        });
      }
    });

    // Bosses
    if (!enemiesDisabled) current.miniBosses.forEach(b => {
      if (!isEntityActiveInScene(b, current)) return;
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
        b.staggerRewarded = false; // a fresh opening — punishing it can earn the stagger reward again
        addCombatEffect(current, {
          type: 'boss-vulnerable',
          x: b.x + b.width / 2,
          y: b.y + b.height / 2,
          color: '#22c55e',
        });
      }
      if (!current.seenBossIntroIds) current.seenBossIntroIds = new Set();
      const scarabSealRequired = scopedJourneyAssetPacks.isEgyptJourney
        && b.id === SCARAB_SEAL_TRIGGER.bossId;
      if (scarabSealRequired && current.openingThresholdScene) return;
      const bossIntroTriggerDistance = scarabSealRequired ? SCARAB_QUEEN_INTRO_TRIGGER_DISTANCE : 400;
      const playerNearBossIntro = Math.abs(b.x - player.x) < bossIntroTriggerDistance;
      const scarabQueenRequiresScribe = scarabSealRequired && !current.scribeChamberPuzzleSolved;
      if (scarabQueenRequiresScribe) {
        if (playerNearBossIntro && (current.itemPurposeNoticeTimer || 0) <= 0) {
          current.notice = 'The Queen\'s lair stays sealed until Asha records the scribe\'s message.';
          current.itemPurposeNoticeTimer = 1.6;
        }
        return;
      }
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
        const scarabQueenCinematic = b.id === SCARAB_SEAL_TRIGGER.bossId && scopedJourneyAssetPacks.isEgyptJourney;
        const bossArenaMin = Math.max(arenaStart + 90, b.patrolMin);
        const bossArenaMax = Math.max(
          bossArenaMin,
          Math.min(arenaEnd - b.width - 24, b.patrolMax),
        );
        b.x = scarabQueenCinematic && Number.isFinite(b.lairX)
          ? clamp(b.lairX - SCARAB_QUEEN_DRAW_OFFSET_X - b.width / 2, bossArenaMin, bossArenaMax)
          : bossArenaMax;
        const playerDomainMinX = arenaStart + 44;
        const playerDomainMaxX = Math.max(playerDomainMinX, arenaEnd - player.width - 44);
        const playerDomainStartX = clamp(
          b.x - player.width - BOSS_INTRO_PLAYER_STANDOFF,
          playerDomainMinX,
          playerDomainMaxX,
        );
        player.x = playerDomainStartX;
        player.y = GROUND_Y - player.height;
        player.vx = 0;
        player.vy = 0;
        player.direction = 1;
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
              : scarabQueenCinematic
                ? 'rgba(92, 35, 15, 0.24)'
                : 'rgba(120, 53, 15, 0.14)',
          suppressVisuals: false,
          buriedSandEmergence: scarabQueenCinematic,
          introSeconds: scarabQueenCinematic ? SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS : 3.2,
        };
        current.bossIntro = {
          id: b.id,
          title: scarabQueenCinematic ? `Buried Lair: ${b.name}` : `Guardian Encounter: ${b.name}`,
          message: scarabSealBossIntroLine || (keyItem
            ? b.dialogue || `Defeat the guardian to recover the ${keyItem.name}.`
            : b.intro),
          focusX: b.x,
          triggerActor: scarabQueenCinematic ? 'Buried Scarab Lair' : null,
          triggerLine: scarabQueenCinematic ? 'The lair mouth splits open. Something ancient is rising.' : null,
          cameraAnchorRatio: scarabQueenCinematic ? SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO : null,
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
        current.bossIntroTimer = scarabQueenCinematic ? SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS : 3.2;
        current.bossIntroPauseTimer = scarabQueenCinematic ? SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS : 3.2;
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, scarabQueenCinematic ? 0.62 : 0.35);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, scarabQueenCinematic ? 0.42 : 0.32);
        const arenaCamera = scarabQueenCinematic
          ? clampCameraX(b.x - CANVAS_WIDTH * SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO)
          : clampCameraX(((arenaStart + arenaEnd) / 2) - (CANVAS_WIDTH / 2));
        current.cameraX = arenaCamera;
        current.targetCameraX = arenaCamera;
        current.cameraMode = 'boss-domain';
        current.cameraFocusTarget = Math.round(b.x);
        current.notice = current.bossIntro.message;
        audioControls?.playTransition?.();
      } else if (current.seenBossIntroIds.has(b.id) && Math.abs(b.x - player.x) < bossIntroTriggerDistance) {
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
        const warningSfx = scopedJourneyAssetPacks.isRomeJourney ? 'romeBossWarning' : scopedJourneyAssetPacks.isChinaJourney ? 'chinaBossWarning' : 'bossWarning';
        audioControls?.playExpeditionSfx?.(warningSfx);
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
        // Area attacks span the phase's authored range centred on the boss, so wider
        // rings (Core Pulse 140 vs Scarab Burst 118) actually differ in reach.
        const bossAttackBox = phase.kind === 'area'
          ? {
            x: b.x + b.width / 2 - phase.range / 2,
            y: b.y + b.height - 48,
            width: phase.range,
            height: 54,
          }
          : getAttackBox(b, phase.range, phase.height, b.attackDirection);
        if (!b.attackHasHit && rectsOverlap(bossAttackBox, getPlayerBodyHitbox(player))) {
          b.attackHasHit = true;
          applyPlayerDamage(Math.max(4, Math.round(b.damage * (phase.damageScale || 1) * (b.bossDamageMultiplier || 1))), `${b.name} ${phase.label} hit you. Dodge, then counter`, b.attackDirection, b.name, { canOverwhelm: true });
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
          b.attackCooldown = Math.max(b.attackCooldown, 0.35);
          current.attackRecoilTimer = Math.max(current.attackRecoilTimer, 0.12);
          current.lastAttackResult = 'protected';
          current.shieldedHitFeedback = `${b.name} protected itself.`;
          applyAttackStaminaCost(PROTECTED_HIT_EXTRA_STAMINA_COST, 'Protected boss blocked attack', '-1');
          applyCombatHitImpact({
            current,
            target: b,
            player,
            hitType: 'blocked',
            direction: player.direction,
            targetKind: 'boss',
            shieldEffectType: 'boss-shield',
            guardEffectType: 'boss-shield',
            sfxOptions: { volume: 1.04, playbackRate: 0.88 },
          });
          current.notice = `${b.name} blocked the rushed hit. Wait for the counter window.`;
          return;
        }
        const isFinisher = current.attackComboFinisherActive;
        const isHeavyAttack = current.attackType === PLAYER_ATTACK_TYPES.HEAVY;
        const bossWasVulnerable = b.vulnerabilityTimer > 0 || b.attackRecovery > 0;
        // Bosses take the same typed damage as regular enemies so finishers and the
        // light -> primed-heavy loop stay meaningful in boss fights.
        const bossHitDamage = isFinisher
          ? PLAYER_ATTACK_FINISHER_DAMAGE
          : isHeavyAttack
            ? PLAYER_ATTACK_SHOVE_DAMAGE
            : PLAYER_ATTACK_LIGHT_DAMAGE;
        b.health -= (b.playerDamageMultiplier || 1) * bossHitDamage;
        if (!current.attackRewarded) {
          const heavyFollowupRefund = isFinisher ? PLAYER_HEAVY_FOLLOWUP_HIT_REFUND : (isHeavyAttack ? 0 : 1);
          current.resources.stamina = Math.min(current.upgradeEffects?.maxStamina || 100, current.resources.stamina + heavyFollowupRefund);
          current.attackRewarded = true;
        }
        const primesHeavyFollowup = !isFinisher && !isHeavyAttack;
        current.attackComboLanded = primesHeavyFollowup;
        current.attackComboWindowTimer = primesHeavyFollowup ? PLAYER_COMBO_WINDOW_DURATION : 0;
        current.heavyFollowupReadyTimer = primesHeavyFollowup ? PLAYER_COMBO_WINDOW_DURATION : 0;
        current.heavyFollowupCueTimer = primesHeavyFollowup ? PLAYER_HEAVY_FOLLOWUP_CUE_DURATION : 0;
        current.attackComboStep = primesHeavyFollowup ? current.attackSequenceIndex : 0;
        current.lastAttackResult = isFinisher ? 'finisher' : (b.vulnerabilityTimer > 0 || b.attackRecovery > 0 ? 'counter-hit' : 'hit');
        current.shieldedHitFeedback = '';
        // Punishing the boss's vulnerable opening restores a chunk of Endurance — once per opening.
        let bossStaggerEnduranceGain = 0;
        if (bossWasVulnerable && !b.staggerRewarded) {
          const enduranceBeforeStagger = current.resources.stamina;
          current.resources.stamina = Math.min(current.upgradeEffects?.maxStamina || 100, enduranceBeforeStagger + PLAYER_BOSS_STAGGER_ENDURANCE_REWARD);
          bossStaggerEnduranceGain = Math.round(current.resources.stamina - enduranceBeforeStagger);
          b.staggerRewarded = true;
        }
        if (primesHeavyFollowup) {
          addCombatEffect(current, {
            type: 'heavy-ready-cue',
            x: player.x + player.width / 2 + player.direction * 30,
            y: player.y + player.height * 0.28,
            direction: player.direction,
            color: '#f8e7b6',
            timer: Math.max(current.heavyFollowupReadyTimer || 0, current.heavyFollowupCueTimer || 0),
            maxTimer: Math.max(current.heavyFollowupReadyTimer || 0, current.heavyFollowupCueTimer || 0),
          });
        }
        b.stunTimer = 0.75;
        b.attackWindup = 0;
        b.attackTimer = 0;
        b.attackReady = false;
        b.attackCooldown = Math.max(b.attackCooldown, 1.1);
        b.attackRecovery = 0.75;
        b.vulnerabilityTimer = 0.55;
        b.shieldTimer = 0;
        const hitSfx = scopedJourneyAssetPacks.isRomeJourney ? 'romeBossHit' : scopedJourneyAssetPacks.isChinaJourney ? 'chinaBossHit' : 'bossHit';
        const bossHitImpactType = current.attackComboFinisherActive
          ? 'finisher'
          : b.health <= 0
            ? 'defeated'
            : isHeavyAttack
              ? 'combo2'
              : 'light';
        applyCombatHitImpact({
          current,
          target: b,
          player,
          hitType: bossHitImpactType,
          defeated: b.health <= 0,
          direction: player.direction,
          targetKind: 'boss',
          color: b.health <= 0 ? '#facc15' : '#fb923c',
          sparkColor: current.lastAttackResult === 'counter-hit' ? '#bbf7d0' : '#fff7ad',
          sparkFill: current.lastAttackResult === 'counter-hit' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(251, 146, 60, 0.2)',
          sfxKey: bossHitImpactType === 'light' ? hitSfx : undefined,
          sfxOptions: { volume: b.health <= 0 ? 1.2 : 1 },
        });
        current.notice = bossStaggerEnduranceGain > 0 ? `${b.name} staggered. +${bossStaggerEnduranceGain} Endurance.` : `${b.name} staggered.`;
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
    getRouteGateDoorwayEntries().forEach((entry) => {
      const status = getDoorwayGateStatus(entry, current);
      const activeGate = status.activeGate;
      const doorway = entry.doorway;
      if (!activeGate || !isEntityActiveInScene(activeGate, current)) return;
      const blockX = doorway?.blockX ?? activeGate.x;
      const collisionWidth = doorway?.width ?? activeGate.width;
      const gateCollision = {
        x: blockX,
        y: activeGate.y,
        width: Math.max(activeGate.width, collisionWidth),
        height: activeGate.height,
      };
      const reachedGate = rectsOverlap(player, gateCollision)
        || (player.x + player.width > blockX && player.x < blockX + gateCollision.width + 18);
      if (status.gatesToOpen.length > 0 && reachedGate) {
        status.gatesToOpen.forEach(gateToOpen => current.openedRouteGateIds.add(gateToOpen.id));
        const guidance = status.guidance || getGateGuidance(activeGate, current);
        current.notice = guidance.openMessage;
        current.cinematicEvent = {
          id: `${entry.id}-opened`,
          name: guidance.activeGateName,
          message: guidance.openMessage,
          temporary: true,
        };
        current.cinematicTimer = 2.4;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.2);
        addRewardPulse('route-gate-open', blockX, activeGate.y + 64, 'SEAL OPEN', {
          color: '#38bdf8',
          fill: 'rgba(56, 189, 248, 0.13)',
          radius: 66,
          timer: 0.78,
        });
        audioControls?.playExpeditionSfx?.('gateUnlock');
        audioControls?.playExpeditionStinger?.('gateUnlock');
      } else if (!status.complete && reachedGate) {
        player.x = blockX - player.width - 5;
        current.notice = status.guidance?.notice || activeGate.message;
        audioControls?.playExpeditionSfx?.('gateBlocked');
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

  }, [briefingOpen, audioControls, onComplete, triggerJourneyRescue, openingAtmosphereSfxKey, scopedJourneyAssetPacks.isChinaJourney, scopedJourneyAssetPacks.isEgyptJourney, scopedJourneyAssetPacks.isRomeJourney, targetCivilisation, buildBossRewardMoment, completeOpeningThresholdScene, enterLevelFromThreshold, startOpeningCinematic, startLevelThresholdEncounter, startTempleThresholdTransition, getActiveHiddenRoutes, getActiveSecretCollectibles, getActiveShardGateProgress, getAttackBox, getAttackHurtbox, getPlayerAttackNearMissTarget, getBossPhaseConfig, getBossVulnerabilityState, getDoorwayGateStatus, getEnemyPatternConfig, getObjectiveProgress, getGateGuidance, getRenderableCheckpoints, getRenderableHazards, getRenderablePlatforms, getRenderableTrapPlatforms, getLiveScorpionNestBlockers, getRouteAccessState, getRouteGateDoorwayEntries, isRouteRewardAccessible, isLowStamina, addCombatEffect, applyCombatHitImpact, recordEnvironmentInteraction, getPlayerAttackState, getSectionDisplayName, getSectionDisplayTitle, resolveChamberEntryTrigger, resolveChamberReturnPoint, syncHud, updateArrivalThresholdTrial]);

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
        const nextY = y === null ? Number.NaN : Number(y);
        const playerWidth = PLAYER_WIDTH;
        const playerHeight = PLAYER_HEIGHT;
        const groundPlayerY = GROUND_Y - playerHeight;
        current.player.x = clamp(nextX, 0, WORLD_WIDTH - playerWidth);
        current.player.y = Number.isFinite(nextY)
          ? clamp(nextY, 0, groundPlayerY)
          : groundPlayerY;
        current.player.vx = 0;
        current.player.vy = 0;
        current.player.onGround = current.player.y >= groundPlayerY - 1;
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
        const {
          target,
          sectionId,
          bossId,
          gateId,
          ready = false,
          playerOffset = null,
        } = event.detail || {};
        setBriefingOpen(false);
        if (target === 'journey-route-gate') {
          const gate = ROUTE_GATES.find(item => item.id === (gateId || 'temple-approach-seal'));
          if (!gate) return;
          const current = stateRef.current;
          ROUTE_GATES
            .filter(item => item.x < gate.x)
            .forEach(item => current.openedRouteGateIds.add(item.id));
          current.openedRouteGateIds.delete(gate.id);
          if (ready) {
            if (gate.requires?.objective) current.completedObjectiveIds.add(gate.requires.objective);
            if (gate.requires?.miniBoss) current.defeatedMiniBosses.add(gate.requires.miniBoss);
            if (gate.requires?.keyItem) {
              current.collectedBossKeyIds.add(gate.requires.keyItem);
              const keyItem = current.bossKeyItems?.find(item => item.id === gate.requires.keyItem);
              if (keyItem) keyItem.collected = true;
            }
            gate.requires?.upgrades?.forEach(upgradeId => current.collectedUpgrades.add(upgradeId));
            if (gate.requires?.shards) current.relicShardCount = Math.max(current.relicShardCount, gate.requires.shards + 1);
            if (gate.requires?.timelineSequence?.length) {
              const timelineIds = gate.requires.timelineSequence
                .map(item => (typeof item === 'string' ? item : item?.id))
                .filter(Boolean);
              current.collectedTimelineEvidenceIds = new Set(timelineIds);
              current.romeTimelineEvidenceOrder = timelineIds;
              current.romeTimelineSolved = true;
            }
          } else {
            current.relicShardCount = 0;
          }
          current.postBossReward = null;
          current.postBossRewardTimer = 0;
          current.cinematicEvent = null;
          current.cinematicTimer = 0;
          const playerX = Number.isFinite(playerOffset)
            ? gate.x + playerOffset
            : gate.x - current.player.width - 180;
          current.player.x = clamp(playerX, 0, WORLD_WIDTH - current.player.width);
          current.player.y = GROUND_Y - current.player.height;
          current.player.vx = 0;
          current.player.vy = 0;
          current.player.onGround = true;
          current.cameraX = clampCameraX(gate.x - CANVAS_WIDTH * 0.58);
          current.targetCameraX = current.cameraX;
          current.notice = `Developer mode: ${gate.name} view.`;
          step(0);
          syncHud();
          return;
        }
        if (target === 'journey-scarab-payoff' || target === 'journey-desert-map-seal-ready') {
          const current = stateRef.current;
          const boss = current.miniBosses.find(item => item.id === SCARAB_SEAL_TRIGGER.bossId);
          const keyItem = current.bossKeyItems?.find(item => item.id === 'brush-handle') || BOSS_KEY_ITEMS.find(item => item.id === 'brush-handle');
          const routeGate = ROUTE_GATES.find(item => item.id === keyItem?.gateId);
          if (!boss || !keyItem) return;
          const recoverReward = target === 'journey-desert-map-seal-ready';
          current.scarabSealActivated = true;
          current.openingConfrontationSeen = true;
          current.collapsedPlatformIds.add('opening-scarab-seal-summit');
          current.triggeredEnvironmentEventIds.add(SCARAB_SEAL_TRIGGER.id);
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
          current.bossDomain = null;
          current.seenBossIntroIds?.add(boss.id);
          boss.defeated = true;
          boss.awakened = true;
          boss.health = 0;
          boss.hitFlash = 0;
          boss.attackWindup = 0;
          boss.attackTimer = 0;
          boss.attackReady = false;
          boss.attackRecovery = 0;
          boss.vulnerabilityTimer = 0;
          boss.shieldTimer = 0;
          current.defeatedMiniBosses.add(boss.id);
          keyItem.dropped = true;
          keyItem.x = clamp(boss.x + boss.width / 2, (boss.arenaStart ?? 0) + 24, (boss.arenaEnd ?? WORLD_WIDTH) - 48);
          keyItem.y = GROUND_Y - 24;
          keyItem.collected = recoverReward;
          if (recoverReward) {
            current.collectedObjectiveIds.add('map-tablet');
            current.completedObjectiveIds.add('desert-entry');
            current.collectedBossKeyIds.add(keyItem.id);
            current.relicShardCount = Math.max(current.relicShardCount, 10);
            if (routeGate) {
              ROUTE_GATES
                .filter(gate => gate.x < routeGate.x)
                .forEach(gate => current.openedRouteGateIds.add(gate.id));
              current.openedRouteGateIds.delete(routeGate.id);
              current.player.x = clamp(routeGate.x - current.player.width - 140, 0, WORLD_WIDTH - current.player.width);
              current.player.y = GROUND_Y - current.player.height;
              current.player.vx = 0;
              current.player.vy = 0;
              current.player.onGround = true;
              current.cameraX = clampCameraX(current.player.x - CANVAS_WIDTH * 0.42);
              current.targetCameraX = current.cameraX;
            }
          } else {
            current.collectedBossKeyIds.delete(keyItem.id);
          }
          const rewardMoment = buildBossRewardMoment(current, keyItem, recoverReward ? 'recovered' : 'revealed');
          current.postBossReward = rewardMoment;
          current.postBossRewardTimer = recoverReward ? 5.2 : 4.6;
          current.notice = recoverReward
            ? `Developer smoke: ${rewardMoment.title} ${rewardMoment.nextObjective}`
            : `Developer smoke: Scarab Queen defeated. ${rewardMoment.title} ${rewardMoment.nextObjective}`;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.2);
          current.cinematicEvent = {
            id: recoverReward ? 'debug-desert-map-seal-ready' : 'debug-scarab-queen-payoff',
            name: recoverReward ? 'Desert Map Seal Ready' : 'Boss Reward Revealed',
            message: rewardMoment.nextObjective,
            temporary: true,
          };
          current.cinematicTimer = 3.2;
          addCombatEffect(current, {
            type: 'boss-reward-pulse',
            x: recoverReward && routeGate ? routeGate.x : keyItem.x,
            y: recoverReward && routeGate ? routeGate.y + 96 : keyItem.y,
            text: recoverReward ? 'SEAL READY' : 'REWARD REVEALED',
            color: rewardMoment.color || '#b45309',
            fill: recoverReward ? 'rgba(56, 189, 248, 0.13)' : 'rgba(180, 83, 9, 0.12)',
            radius: recoverReward ? 74 : 70,
            timer: 0.9,
            maxTimer: 0.9,
          });
          step(0);
          syncHud();
          return;
        }
        if (target === 'journey-boss-start') {
          const current = stateRef.current;
          const boss = current.miniBosses.find(item => item.id === bossId);
          if (!boss) return;
          const arenaStart = boss.arenaStart ?? Math.max(0, boss.x - 160);
          const arenaEnd = boss.arenaEnd ?? Math.min(WORLD_WIDTH, boss.x + 180);
          const scarabQueenCinematic = boss.id === SCARAB_SEAL_TRIGGER.bossId && scopedJourneyAssetPacks.isEgyptJourney;
          const section = SECTIONS.find(item => item.id === boss.sectionId);
          const sectionCheckpoint = getRenderableCheckpoints().find(checkpoint => checkpoint.id === boss.sectionId);
          if (scarabQueenCinematic) {
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
          boss.debugCombatMode = null;
          boss.debugSpriteFrameKey = null;
          boss.debugSpriteState = null;
          boss.awakened = true;
          boss.health = boss.maxHealth || boss.health || 1;
          boss.x = scarabQueenCinematic && Number.isFinite(boss.lairX)
            ? clamp(
              boss.lairX - SCARAB_QUEEN_DRAW_OFFSET_X - boss.width / 2,
              Math.max(arenaStart + 90, boss.patrolMin),
              Math.min(arenaEnd - boss.width - 24, boss.patrolMax),
            )
            : Math.min(arenaEnd - boss.width - 24, Math.max(arenaStart + 90, boss.patrolMax));
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
          current.player.x = clamp(
            boss.x - current.player.width - BOSS_INTRO_PLAYER_STANDOFF,
            arenaStart + 44,
            Math.max(arenaStart + 44, arenaEnd - current.player.width - 44),
          );
          current.player.y = GROUND_Y - current.player.height;
          current.player.vx = 0;
          current.player.vy = 0;
          current.player.direction = 1;
          current.player.onGround = true;
          current.currentSectionId = boss.sectionId;
          current.lastSectionId = boss.sectionId;
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
            tint: scarabQueenCinematic ? 'rgba(92, 35, 15, 0.24)' : 'rgba(120, 53, 15, 0.14)',
            suppressVisuals: false,
            buriedSandEmergence: scarabQueenCinematic,
            introSeconds: scarabQueenCinematic ? SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS : 3.2,
          };
          if (scarabQueenCinematic) {
            current.bossIntro = {
              id: boss.id,
              title: `Buried Lair: ${boss.name}`,
              message: SCARAB_SEAL_TRIGGER.bossIntroLine,
              focusX: boss.x,
              triggerActor: 'Buried Scarab Lair',
              triggerLine: 'The lair mouth splits open. Something ancient is rising.',
              cameraAnchorRatio: SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO,
              dialogue: SCARAB_SEAL_TRIGGER.bossIntroLine,
              domainName: boss.domainName || `${boss.name} Domain`,
              rewardName: null,
            };
            current.bossIntroTimer = SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS;
            current.bossIntroPauseTimer = SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS;
            current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.62);
            current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.42);
          }
          current.cameraX = scarabQueenCinematic
            ? clampCameraX(boss.x - CANVAS_WIDTH * SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO)
            : clampCameraX(((arenaStart + arenaEnd) / 2) - (CANVAS_WIDTH / 2));
          current.targetCameraX = current.cameraX;
          current.notice = scarabQueenCinematic ? SCARAB_SEAL_TRIGGER.bossIntroLine : `Developer mode: ${boss.name} encounter ready.`;
          step(0);
          syncHud();
          return;
        }
        if (target === 'journey-boss-intro-progress') {
          const current = stateRef.current;
          if (!current.bossDomain || !current.bossIntro) return;
          const introSeconds = current.bossDomain.introSeconds || 3.2;
          const sampledProgress = clamp(Number(event.detail?.progress), 0, 1);
          current.bossIntroTimer = Math.max(0.01, (1 - sampledProgress) * introSeconds);
          current.bossIntroPauseTimer = Math.max(current.bossIntroTimer, 0.01);
          current.cameraShakeTimer = Math.max(current.cameraShakeTimer, sampledProgress > 0.32 && sampledProgress < 0.68 ? 0.42 : 0.08);
          current.cameraShakeStrength = Math.max(current.cameraShakeStrength, sampledProgress > 0.32 && sampledProgress < 0.68 ? 0.44 : 0.16);
          step(0);
          syncHud();
          return;
        }
        if (target === 'journey-boss-state') {
          const current = stateRef.current;
          const boss = current.miniBosses.find(item => item.id === bossId);
          if (!boss) return;
          current.bossIntro = null;
          current.bossIntroTimer = 0;
          current.bossIntroPauseTimer = 0;
          current.bossDomain = current.bossDomain?.bossId === boss.id
            ? current.bossDomain
            : {
              bossId: boss.id,
              name: boss.domainName || `${boss.name} Domain`,
              arenaStart: boss.arenaStart ?? Math.max(0, boss.x - 160),
              arenaEnd: boss.arenaEnd ?? Math.min(WORLD_WIDTH, boss.x + 180),
              playerStartX: Math.round(current.player.x),
              bossStartX: Math.round(boss.x),
              color: '#facc15',
              tint: 'rgba(92, 35, 15, 0.24)',
              suppressVisuals: false,
              buriedSandEmergence: false,
              introSeconds: 3.2,
            };
          const state = event.detail?.state || 'walk';
          const debugCombatModeByState = {
            walk: 'patrol',
            windup: 'windup',
            charge: 'attacking',
            acid: 'attacking',
            shielded: 'idle',
            counter: 'idle',
            hit: 'stunned',
            intro: 'idle',
            defeated: 'defeated',
          };
          boss.awakened = state !== 'intro';
          boss.defeated = false;
          boss.debugCombatMode = debugCombatModeByState[state] || null;
          boss.debugSpriteState = state;
          boss.debugSpriteFrameKey = state === 'shielded'
            ? 'scarabQueenShielded'
            : state === 'intro'
              ? 'scarabQueenIntro'
              : null;
          boss.hitFlash = state === 'hit' ? 99 : 0;
          boss.stunTimer = state === 'stagger' || state === 'hit' ? 99 : 0;
          boss.shieldTimer = state === 'shielded' ? 99 : 0;
          boss.vulnerabilityTimer = state === 'counter' ? 99 : 0;
          boss.attackKind = state === 'acid' ? 'area' : 'close';
          boss.attackWindup = state === 'windup' ? 99 : 0;
          boss.attackTimer = state === 'charge' || state === 'acid' ? 99 : 0;
          boss.attackRecovery = state === 'counter' ? 99 : 0;
          boss.attackCooldown = 0;
          boss.attackHasHit = true;
          boss.attackDirection = boss.direction || -1;
          boss.x = clamp(Number(event.detail?.x) || boss.x, 0, WORLD_WIDTH - boss.width);
          boss.y = GROUND_Y - boss.height;
          current.failed = false;
          current.failureReason = null;
          current.failureDetail = null;
          current.resources.stamina = current.upgradeEffects?.maxStamina || 100;
          current.player.x = clamp(boss.x - 82, 0, WORLD_WIDTH - current.player.width);
          current.player.y = GROUND_Y - current.player.height;
          current.player.vx = 0;
          current.player.vy = 0;
          current.player.invulnerable = 99;
          current.player.damageCooldownTimer = 99;
          current.player.onGround = true;
          current.cameraX = clampCameraX(boss.x - CANVAS_WIDTH * 0.58);
          current.targetCameraX = current.cameraX;
          current.notice = `Developer mode: ${boss.name} ${state}.`;
          step(0);
          syncHud();
          return;
        }
        if (target === 'journey-temple-approach-ramp') {
          const current = stateRef.current;
          current.openingThresholdScene = null;
          current.openingSphinxEncounter = null;
          current.openingSphinxTimer = 0;
          current.bossIntro = null;
          current.bossIntroTimer = 0;
          current.bossIntroPauseTimer = 0;
          current.bossDomain = null;
          current.cinematicEvent = null;
          current.cinematicTimer = 0;
          current.activeGuardianChallenge = null;
          current.arrivalThresholdActive = false;
          current.arrivalThresholdExitTransition = null;
          current.arrivalThresholdTrial = null;
          current.sceneTransition = null;
          current.forgottenMuralChamberTransition = null;
          current.templeThresholdHallActive = false;
          current.currentSceneId = JOURNEY_SCENE_IDS.EXTERIOR;
          current.currentSectionId = 'desert-entry';
          current.lastSectionId = 'desert-entry';
          current.player.x = clamp(DESERT_ENTRY_EXTERIOR_SPAWN_X, 0, WORLD_WIDTH - current.player.width);
          current.player.y = GROUND_Y - current.player.height;
          current.player.vx = 0;
          current.player.vy = 0;
          current.player.onGround = true;
          current.player.direction = 1;
          current.cameraX = 0;
          current.targetCameraX = 0;
          current.notice = 'Developer mode: Temple Approach ramp.';
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.0);
          step(0);
          syncHud();
          return;
        }
        if (target === 'journey-mummification-chamber') {
          const current = stateRef.current;
          current.openingThresholdScene = null;
          current.openingSphinxEncounter = null;
          current.openingSphinxTimer = 0;
          current.bossIntro = null;
          current.bossIntroTimer = 0;
          current.bossIntroPauseTimer = 0;
          current.bossDomain = null;
          current.cinematicEvent = null;
          current.cinematicTimer = 0;
          current.activeGuardianChallenge = null;
          current.sceneTransition = null;
          current.forgottenMuralChamberTransition = null;
          current.currentSceneId = JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER;
          current.mummificationChamberEntered = true;
          current.mummificationChamberActive = true;
          current.mummificationChamberDoorSealed = true;
          current.mummificationChamberExitUnlocked = Boolean(current.mummificationChamberPuzzleSolved);
          current.mummificationChamberInspectedObjectIds ??= new Set();
          current.player.x = MUMMIFICATION_CHAMBER_ENTRY_SPAWN.x - current.player.width / 2;
          current.player.y = MUMMIFICATION_CHAMBER_ENTRY_SPAWN.y - current.player.height;
          current.player.vx = 0;
          current.player.vy = 0;
          current.player.onGround = true;
          current.player.direction = MUMMIFICATION_CHAMBER_ENTRY_SPAWN.direction;
          current.cameraX = MUMMIFICATION_CHAMBER_CAMERA_X;
          current.targetCameraX = MUMMIFICATION_CHAMBER_CAMERA_X;
          current.notice = 'Developer mode: Mummification Chamber.';
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.0);
          step(0);
          syncHud();
          return;
        }
        if (target === 'journey-temple-threshold-hall') {
          const current = stateRef.current;
          current.openingThresholdScene = null;
          current.openingSphinxEncounter = null;
          current.openingSphinxTimer = 0;
          current.bossIntro = null;
          current.bossIntroTimer = 0;
          current.bossIntroPauseTimer = 0;
          current.bossDomain = null;
          current.cinematicEvent = null;
          current.cinematicTimer = 0;
          current.activeGuardianChallenge = null;
          current.sceneTransition = null;
          current.forgottenMuralChamberTransition = null;
          current.currentSceneId = JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL;
          current.templeThresholdHallEntered = true;
          current.templeThresholdHallActive = true;
          current.hiddenRoomsFound?.add('temple-threshold-hall');
          current.discoveredHiddenRouteIds?.add('temple-threshold-hall-route');
          current.player.x = TEMPLE_THRESHOLD_HALL_ENTRY_SPAWN.x - current.player.width / 2;
          current.player.y = TEMPLE_THRESHOLD_HALL_ENTRY_SPAWN.y - current.player.height;
          current.player.vx = 0;
          current.player.vy = 0;
          current.player.onGround = true;
          current.player.direction = TEMPLE_THRESHOLD_HALL_ENTRY_SPAWN.direction;
          current.cameraX = TEMPLE_THRESHOLD_HALL_CAMERA_X;
          current.targetCameraX = TEMPLE_THRESHOLD_HALL_CAMERA_X;
          current.notice = 'Developer mode: Temple Threshold Hall.';
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.0);
          step(0);
          syncHud();
          return;
        }
        if (target === 'journey-forgotten-mural-puzzle') {
          const current = stateRef.current;
          current.openingThresholdScene = null;
          current.openingSphinxEncounter = null;
          current.openingSphinxTimer = 0;
          current.bossIntro = null;
          current.bossIntroTimer = 0;
          current.bossIntroPauseTimer = 0;
          current.bossDomain = null;
          current.cinematicEvent = null;
          current.cinematicTimer = 0;
          current.activeGuardianChallenge = null;
          current.sceneTransition = null;
          current.forgottenMuralChamberTransition = null;
          current.currentSceneId = JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER;
          current.forgottenMuralChamberEntered = true;
          current.forgottenMuralChamberActive = true;
          current.hiddenRoomsFound?.add('forgotten-mural-chamber');
          FORGOTTEN_MURAL_CHAMBER_RESTORATION_IDS.forEach(id => current.collectedSecretIds?.add(id));
          current.forgottenMuralRelicSlidePuzzleOpen = true;
          current.forgottenMuralRelicSlidePuzzleSolved = false;
          current.forgottenMuralRelicSlidePuzzleTiles = createForgottenMuralRelicSlidePuzzleTiles();
          current.forgottenMuralRelicSlidePuzzleMoves = 0;
          current.forgottenMuralChamberRestored = false;
          current.player.x = FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN.x - current.player.width / 2;
          current.player.y = FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN.y - current.player.height;
          current.player.vx = 0;
          current.player.vy = 0;
          current.player.onGround = true;
          current.player.direction = FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN.direction;
          current.cameraX = FORGOTTEN_MURAL_CHAMBER_CAMERA_X;
          current.targetCameraX = FORGOTTEN_MURAL_CHAMBER_CAMERA_X;
          current.notice = 'Developer mode: Mural slide puzzle opened.';
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.0);
          keysRef.current = {};
          step(0);
          syncHud();
          return;
        }
        if (target !== 'journey-section-start') return;
        const section = SECTIONS.find(section => section.id === sectionId);
        if (!section) return;
        const current = stateRef.current;
        const sectionCheckpoint = getRenderableCheckpoints().find(checkpoint => checkpoint.id === section.id);
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
  }, [addCombatEffect, backgroundPackId, buildBossRewardMoment, createJourneySnapshot, getRenderableCheckpoints, scopedJourneyAssetPacks.isEgyptJourney, startTempleThresholdTransition, step, syncHud]);

  useJourneyPlacementEditorShortcuts({
    DEFAULT_JOURNEY_PROP_EDITOR_ROTATION_STEP,
    DEFAULT_JOURNEY_PROP_EDITOR_SCALE_STEP,
    applyDefaultEditorLocks,
    deleteSelectedPropFromEditor,
    draw,
    duplicateSelectedPropInEditor,
    getEditedNestParams,
    getPropEditorSelectedNest,
    getPropEditorSelectedProp,
    isJourneyEditorFormTarget,
    propPlacementEditorRef,
    redoEditorChange,
    refreshPropEditorUi,
    savePropPlacementExport,
    stateRef,
    undoEditorChange,
    updateSelectedPropEditorTransform,
  });

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useJourneyPlacementEditorPointerHandlers({
    JOURNEY_VERTICAL_OFFSET,
    PLATFORMS,
    buildEditorHoverStack,
    canvasRef,
    clamp,
    createPlatformFromEditorPalette,
    createPropFromEditorPalette,
    createTrapFromEditorPalette,
    draw,
    findEditableArchAt,
    findEditableCheckpointAt,
    findEditableHazardAt,
    findEditableNestAt,
    findEditablePlatformAt,
    findEditableScarabLairAt,
    findEditableStoryPropAt,
    getCheckpointEditorBaseCheckpointById,
    getEditedNestParams,
    getEditedStoryProp,
    getEditorEntityLabel,
    getGroundAwareStoryPropEditorEdit,
    getHazardEditorBaseHazardById,
    getMiniBossEditorBaseBossById,
    getPlatformEditorBasePlatformById,
    getPropEditorBasePropById,
    getPropEditorPointer,
    getPropEditorSelectedProp,
    getRenderableScorpionNests,
    getRouteGateEditorBaseDoorwayById,
    getRouteGateEditorBaseGateById,
    getScarabQueenLairPlacement,
    getStoryPropEditorBounds,
    hitTestPropTransformHandle,
    isEditorLockKeyLocked,
    propPlacementEditorRef,
    refreshPropEditorUi,
    snapJourneyPropCoordinate,
    stateRef,
    updateEditorHover,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isJourneyEditorFormTarget(e.target)) return;
      if (paused || briefingOpen || stateRef.current.activeGuardianChallenge || stateRef.current.forgottenMuralRelicSlidePuzzleOpen) return;
      // While the prop editor has a prop selected, arrow keys nudge that prop (handled in the
      // editor keydown effect), so don't also walk the player. A/D/W still move the camera.
      if (propPlacementEditorRef.current?.enabled && propPlacementEditorRef.current?.selectedPropId
          && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW', 'KeyJ', 'KeyK', 'KeyL'].includes(e.code)) e.preventDefault();
      audioControls?.unlockExpeditionSfx?.();
      if (e.code === 'KeyJ') { queueAttack(PLAYER_ATTACK_TYPES.LIGHT); return; }
      if (e.code === 'KeyK') { queueAttack(PLAYER_ATTACK_TYPES.HEAVY); return; }
      if (e.code === 'KeyL') { queueDodge(); return; }
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e) => {
      if (isJourneyEditorFormTarget(e.target)) return;
      keysRef.current[e.code] = false;
    };

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
  }, [audioControls, briefingOpen, paused, queueAttack, queueDodge, step]);

  useEffect(() => {
    if (paused) {
      keysRef.current = {};
    }
  }, [paused]);

  useEffect(() => {
    if (gameState.forgottenMuralRelicSlidePuzzleOpen) {
      keysRef.current = {};
    }
  }, [gameState.forgottenMuralRelicSlidePuzzleOpen]);

  const bossDomainHudSuppressed = gameState.bossDomain
    && !gameState.enemiesDisabled
    && !gameState.defeatedMiniBosses?.has(gameState.bossDomain.bossId);
  const activeHudGate = bossDomainHudSuppressed
    ? null
    : getNextJourneyRouteGate(ROUTE_GATES, gameState);
  const activeHudGateGuidance = activeHudGate ? getGateGuidance(activeHudGate, gameState) : null;
  const activeHudShardRequirement = activeHudGateGuidance?.gateRequirements.find(req => req.type === 'shards') || null;
  const activeHudFirstMissing = activeHudGateGuidance?.gateMissingRequirements?.[0] || null;
  const sacredRoomEvidenceRows = getSacredRoomEvidenceRows(gameState);
  const restoredSacredRoomCount = sacredRoomEvidenceRows.filter(row => row.restored).length;
  const activeSacredRoomEvidence = sacredRoomEvidenceRows.find(row => !row.restored) || sacredRoomEvidenceRows[sacredRoomEvidenceRows.length - 1];
  const staminaWarningState = getStaminaWarningState(gameState);
  const staminaPercent = Math.min(100, Math.round((gameState.resources.stamina / (gameState.upgradeEffects?.maxStamina || 100)) * 100));
  const timePercent = Math.min(100, Math.max(0, Math.round((gameState.resources.time / 900) * 100)));
  const timeWarningState = gameState.resources.time <= 0
    ? 'empty'
    : gameState.resources.time <= 120
      ? 'low'
      : gameState.staminaFeedbackTimer > 0 && gameState.lastStaminaDelta === 0
        ? 'recent-loss'
        : 'stable';
  const heavyFollowupPromptActive = Boolean(gameState.playerCombatState?.heavyFollowupReady);
  const activeGuardianChallenge = guardianChallengeUi || gameState.activeGuardianChallenge;
  const activeGuardianQuestion = activeGuardianChallenge?.questions?.[activeGuardianChallenge.currentIndex] || null;
  const forgottenMuralRelicSlidePuzzleTiles = gameState.forgottenMuralRelicSlidePuzzleTiles?.length
    ? gameState.forgottenMuralRelicSlidePuzzleTiles
    : FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_START_TILES;
  const activeOpeningCinematicLine = getOpeningCinematicLine(gameState.openingCinematic);
  const openingIntroProgress = gameState.openingCinematic
    ? clamp(1 - (gameState.openingCinematic.timer / gameState.openingCinematic.duration), 0, 1)
    : 0;
  const openingSpellImpactAt = gameState.openingCinematic?.spellImpactAt ?? OPENING_CINEMATIC_SPELL_IMPACT_AT;
  const openingSpellImpactActive = Boolean(
    gameState.openingCinematic
    && (gameState.openingCinematic.spellImpactTriggered
      || openingIntroProgress >= openingSpellImpactAt / (gameState.openingCinematic.duration || OPENING_CINEMATIC_DURATION)),
  );
  const openingShieldShattered = Boolean(gameState.openingCinematic?.shieldShattered || openingSpellImpactActive);
  const openingCinematicActive = Boolean(gameState.openingCinematic || gameState.openingThresholdScene || gameState.templeThresholdTransition);
  const isRomeOpeningCinematic = gameState.openingCinematic?.id === ROME_OPENING_CINEMATIC_ID;
  const isChinaOpeningCinematic = gameState.openingCinematic?.id === CHINA_OPENING_CINEMATIC_ID;
  const openingCinematicClassName = [
    'opening-cinematic-overlay',
    isRomeOpeningCinematic ? 'is-rome' : isChinaOpeningCinematic ? 'is-china' : 'is-egypt',
    openingSpellImpactActive ? 'is-spell-impact' : '',
    openingShieldShattered ? 'is-shield-shattered' : '',
  ].filter(Boolean).join(' ');
  const openingCinematicBackgroundSrc = isRomeOpeningCinematic
    ? `${import.meta.env.BASE_URL}${ROME_OPENING_BACKGROUND_SRC}`
    : isChinaOpeningCinematic
      ? `${import.meta.env.BASE_URL}${CHINA_OPENING_BACKGROUND_SRC}`
      : 'assets/expedition/backgrounds/desert-entry/desert-entry-photoreal-sphinx-backdrop.png';
  const openingCinematicAshaSrc = isRomeOpeningCinematic
    ? `${import.meta.env.BASE_URL}${ROME_OPENING_ASHA_CUTSCENE_SRC}`
    : isChinaOpeningCinematic
      ? `${import.meta.env.BASE_URL}${CHINA_OPENING_ASHA_CUTSCENE_SRC}`
      : OPENING_ASHA_CUTSCENE_SRC;
  const openingCinematicGuardianSrc = isRomeOpeningCinematic
    ? `${import.meta.env.BASE_URL}${ROME_OPENING_LEGATE_CUTSCENE_SRC}`
    : isChinaOpeningCinematic
      ? `${import.meta.env.BASE_URL}${CHINA_OPENING_WATCHTOWER_SRC}`
      : OPENING_SPHINX_APPARITION_SRC;
  const openingCinematicSealSrc = isRomeOpeningCinematic
    ? `${import.meta.env.BASE_URL}${ROME_OPENING_VAULT_SIGIL_SRC}`
    : isChinaOpeningCinematic
      ? `${import.meta.env.BASE_URL}${CHINA_OPENING_GATE_SEAL_SRC}`
      : `${import.meta.env.BASE_URL}${OPENING_JUDGEMENT_SEAL_IMAGE_SRC}`;
  const openingCinematicTitle = isRomeOpeningCinematic
    ? (gameState.openingCinematic?.title || 'The Vault Speaks First')
    : isChinaOpeningCinematic
      ? (gameState.openingCinematic?.title || 'The Watchtower Wakes')
      : 'The Gate Refuses';
  const openingCinematicKicker = isRomeOpeningCinematic ? 'The First Archive' : isChinaOpeningCinematic ? 'River Valley Seal' : 'The First Seal';
  const openingCinematicAriaLabel = isRomeOpeningCinematic
    ? 'Asha and the Legate opening cut scene'
    : isChinaOpeningCinematic
      ? 'Asha and the China watchtower opening cut scene'
      : 'Asha and Anubis opening cut scene';

  return (
    <section className={`expedition-journey-container ${openingCinematicActive ? 'is-opening-cinematic' : ''}`} id="expedition-journey">
      <div className="expedition-journey-grid">
        <div className="expedition-main">
          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={JOURNEY_RENDER_TARGET.nativeWidth}
              height={JOURNEY_RENDER_TARGET.nativeHeight}
              className="expedition-canvas"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onContextMenu={(event) => {
                if (import.meta.env.DEV && propPlacementEditorRef.current.enabled) event.preventDefault();
              }}
            />

            {import.meta.env.DEV && propEditorUi.enabled && (
              <>
                <JourneyPlacementEditorStackPicker
                  stackPicker={propEditorUi.stackPicker}
                  onDismiss={dismissEditorStackPicker}
                  onSelectEntity={selectEditorEntityFromStack}
                />
                <JourneyPlacementEditorPanel
                  propEditorUi={propEditorUi}
                  collapsedPanelSections={collapsedPanelSections}
                  outlinerOpen={outlinerOpen}
                  setOutlinerOpen={setOutlinerOpen}
                  setEditorPanelNode={setEditorPanelNode}
                  handleEditorPanelDragStart={handleEditorPanelDragStart}
                  resetEditorPanelPosition={resetEditorPanelPosition}
                  renderEditorSectionHeader={renderEditorSectionHeader}
                  refreshPropEditorUi={refreshPropEditorUi}
                  propPlacementEditorRef={propPlacementEditorRef}
                  undoEditorChange={undoEditorChange}
                  redoEditorChange={redoEditorChange}
                  savePropPlacementExport={savePropPlacementExport}
                  writeJourneyOverridesToSource={writeJourneyOverridesToSource}
                  showAllEditorProps={showAllEditorProps}
                  updateSelectedPropEditorTransform={updateSelectedPropEditorTransform}
                  updateSelectedPropEditorField={updateSelectedPropEditorField}
                  updateSelectedPropEditorNumberField={updateSelectedPropEditorNumberField}
                  updateSelectedPropGroundContactLayer={updateSelectedPropGroundContactLayer}
                  removeSelectedPropGroundContactLayer={removeSelectedPropGroundContactLayer}
                  updateSelectedPlatformEditorTransform={updateSelectedPlatformEditorTransform}
                  updateSelectedHazardEditorTransform={updateSelectedHazardEditorTransform}
                  updateSelectedArchEditorTransform={updateSelectedArchEditorTransform}
                  updateSelectedCheckpointEditorTransform={updateSelectedCheckpointEditorTransform}
                  updateSelectedLairEditorTransform={updateSelectedLairEditorTransform}
                  updateSelectedNestEditorTransform={updateSelectedNestEditorTransform}
                  resetSelectedNestEditor={resetSelectedNestEditor}
                  toggleSelectedEditorLock={toggleSelectedEditorLock}
                  selectEditorPropFromOutliner={selectEditorPropFromOutliner}
                  toggleEditorPropHidden={toggleEditorPropHidden}
                  toggleEditorPropLockFromOutliner={toggleEditorPropLockFromOutliner}
                  setEditorOutlinerSearch={setEditorOutlinerSearch}
                  copySelectedPropLook={copySelectedPropLook}
                  pasteSelectedPropLook={pasteSelectedPropLook}
                  blendSelectedPropIntoScene={blendSelectedPropIntoScene}
                  nudgeSelectedPropZOrder={nudgeSelectedPropZOrder}
                  clearSavedPropEditorState={clearSavedPropEditorState}
                  filterJourneyPaletteBySearch={filterJourneyPaletteBySearch}
                  buildJourneyTintGradeFilter={buildJourneyTintGradeFilter}
                  clamp={clamp}
                  DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE={DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE}
                  PROP_EDITOR_DEPTH_OPTIONS={PROP_EDITOR_DEPTH_OPTIONS}
                  PROP_EDITOR_LAYER_OPTIONS={PROP_EDITOR_LAYER_OPTIONS}
                  JOURNEY_PROP_TINT_PRESETS={JOURNEY_PROP_TINT_PRESETS}
                  JOURNEY_TRAP_DIRECTIONS={JOURNEY_TRAP_DIRECTIONS}
                  JOURNEY_TRAP_TYPES={JOURNEY_TRAP_TYPES}
                  parseColorGradeFilter={parseColorGradeFilter}
                  composeColorGradeFilter={composeColorGradeFilter}
                />
              </>
            )}

            {gameState.openingCinematic && (
              <div
                className={openingCinematicClassName}
                role="dialog"
                aria-live="polite"
                aria-label={openingCinematicAriaLabel}
                style={{ '--opening-progress': openingIntroProgress }}
              >
                <div className="opening-cinematic-backdrop" aria-hidden="true">
                  <img
                    className="opening-cinematic-bg"
                    src={openingCinematicBackgroundSrc}
                    alt=""
                  />
                  <div className="opening-cinematic-depth opening-cinematic-depth-left" />
                  <div className="opening-cinematic-depth opening-cinematic-depth-right" />
                  <img
                    className="opening-cinematic-seal"
                    src={openingCinematicSealSrc}
                    onError={(event) => {
                      if (isRomeOpeningCinematic) return;
                      const fallback = `${import.meta.env.BASE_URL}${OPENING_SCARAB_SEAL_IMAGE_SRC}`;
                      if (!event.currentTarget.src.endsWith(OPENING_SCARAB_SEAL_IMAGE_SRC)) {
                        event.currentTarget.src = fallback;
                      }
                    }}
                    alt=""
                  />
                  <img
                    className="opening-cinematic-anubis"
                    src={openingCinematicGuardianSrc}
                    alt=""
                  />
                  <div className="opening-cinematic-memory-runes">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="opening-cinematic-banishment-ring">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="opening-cinematic-shield" />
                  <div className="opening-cinematic-shield-aura">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="opening-cinematic-shield-shards">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="opening-cinematic-charge" />
                  <div className="opening-cinematic-lightning" />
                  <div className="opening-cinematic-impact" />
                  <div className="opening-cinematic-shockwave" />
                  <div className="opening-cinematic-dust" />
                </div>
                {/* Asha renders ABOVE the backdrop's grain/vignette so nothing veils
                    her — she reads as the solid living figure. Anubis stays inside
                    the backdrop layer so the film grain keeps him spectral. */}
                <img
                  className="opening-cinematic-asha"
                  src={openingCinematicAshaSrc}
                  alt=""
                />
                <div className="opening-cinematic-copy">
                  <div className="opening-cinematic-kicker">{openingCinematicKicker}</div>
                  <h2>{openingCinematicTitle}</h2>
                </div>
                {activeOpeningCinematicLine && (
                  <div
                    key={activeOpeningCinematicLine.id}
                    className={`opening-cinematic-dialogue ${activeOpeningCinematicLine.voice === 'guardian' ? 'is-guardian' : 'is-asha'}`}
                  >
                    <span>{activeOpeningCinematicLine.speaker}</span>
                    <p>{activeOpeningCinematicLine.text}</p>
                  </div>
                )}
                <div className="opening-cinematic-progress" aria-hidden="true">
                  <span style={{ width: `${Math.round(openingIntroProgress * 100)}%` }} />
                </div>
                <button type="button" className="opening-cinematic-skip" onClick={skipOpeningCinematic}>
                  Skip Intro
                </button>
              </div>
            )}

            <JourneyPlayerOverlays
              openingCinematicActive={openingCinematicActive}
              gameState={gameState}
              restoredSacredRoomCount={restoredSacredRoomCount}
              sacredRoomEvidenceRows={sacredRoomEvidenceRows}
              activeSacredRoomEvidence={activeSacredRoomEvidence}
              getSectionDisplayName={getSectionDisplayName}
              toggleEnemyPlaytestAssist={toggleEnemyPlaytestAssist}
              staminaWarningState={staminaWarningState}
              staminaPercent={staminaPercent}
              timeWarningState={timeWarningState}
              timePercent={timePercent}
              heavyFollowupPromptActive={heavyFollowupPromptActive}
              PLAYER_HEAVY_FOLLOWUP_PROMPT_LABEL={PLAYER_HEAVY_FOLLOWUP_PROMPT_LABEL}
              bossDomainHudSuppressed={bossDomainHudSuppressed}
              activeHudGateGuidance={activeHudGateGuidance}
              activeHudShardRequirement={activeHudShardRequirement}
              activeHudFirstMissing={activeHudFirstMissing}
              RELIC_SHARDS={RELIC_SHARDS}
              characterLoaderVisible={characterLoaderVisible}
              selectedCharacterPresetId={selectedCharacterPresetId}
              setSelectedCharacterPresetId={setSelectedCharacterPresetId}
              PLAYER_CHARACTER_PRESETS={PLAYER_CHARACTER_PRESETS}
              selectedCharacterPreset={selectedCharacterPreset}
              FORGOTTEN_MURAL_CHAMBER_RESTORATION_IDS={FORGOTTEN_MURAL_CHAMBER_RESTORATION_IDS}
              FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_ART_SRC={FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_ART_SRC}
              forgottenMuralRelicSlidePuzzleTiles={forgottenMuralRelicSlidePuzzleTiles}
              getForgottenMuralRelicSlideMove={getForgottenMuralRelicSlideMove}
              FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_TILE_LABELS={FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_TILE_LABELS}
              moveForgottenMuralRelicSlideTile={moveForgottenMuralRelicSlideTile}
              resetForgottenMuralRelicSlidePuzzle={resetForgottenMuralRelicSlidePuzzle}
              activeGuardianChallenge={activeGuardianChallenge}
              activeGuardianQuestion={activeGuardianQuestion}
              answerGuardianChallenge={answerGuardianChallenge}
              continueGuardianChallenge={continueGuardianChallenge}
              FIELD_RESCUE_MESSAGE={FIELD_RESCUE_MESSAGE}
              respawnAtCheckpoint={respawnAtCheckpoint}
            />
          </div>
        </div>
      </div>

      <JourneyBriefingOverlay
        briefingOpen={briefingOpen}
        OPENING_CINEMATIC_ENABLED={OPENING_CINEMATIC_ENABLED}
        startOpeningCinematic={startOpeningCinematic}
        startJourneyWithoutOpeningScene={startJourneyWithoutOpeningScene}
        targetCivilisation={targetCivilisation}
      />
    </section>
  );
}

ExpeditionJourney.tools = JOURNEY_TOOLS;
