import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  ATTACK_RECOIL_DURATION,
  COMBAT_DAMAGE_SCALE,
  PLAYER_SPRITE_DRAW_HEIGHT,
  PLAYER_SPRITE_FRAME_COUNT,
  PLAYER_SPRITE_FRAME_HEIGHT,
  PLAYER_SPRITE_FRAME_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_SPRITE_SCALE,
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
  JourneySidebarStatus,
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
import { useJourneyRenderer } from './expedition-journey/useJourneyRenderer.js';
export { JourneyControlsReference } from './expedition-journey/journeyControlsReference.jsx';
import {
  ARRIVAL_THRESHOLD_ASSET_VERSION,
  ARRIVAL_THRESHOLD_BACKGROUND_SRC,
  ARRIVAL_THRESHOLD_FORWARD_GATE_TRIGGER_X,
  ARRIVAL_THRESHOLD_GATE_OBJECTIVE_LINE,
  ARRIVAL_THRESHOLD_LEFT_BOUND,
  ARRIVAL_THRESHOLD_LEFT_INSPECT_X,
  ARRIVAL_THRESHOLD_LEFT_LINES,
  ARRIVAL_THRESHOLD_LEFT_OBJECTIVE_LINE,
  ARRIVAL_THRESHOLD_MARKING_LINES,
  ARRIVAL_THRESHOLD_MARKINGS_INSPECT_X,
  ARRIVAL_THRESHOLD_OBJECTIVE_LINE,
  ARRIVAL_THRESHOLD_RIGHT_BOUND,
  ARRIVAL_THRESHOLD_SPAWN_LINE,
  ARRIVAL_THRESHOLD_SPAWN_X,
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

const INITIAL_BOSS_SPRITE_LOAD_DELAY_MS = 9000;

const KNOWLEDGE_CHALLENGE_SIZE = 3;
const GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED = false;
const KNOWLEDGE_CHALLENGE_FEEDBACK = {
  correct: 'Correct. Your field knowledge strengthens you.',
  incorrect: 'Not quite. The guardian grows stronger.',
};
const LOW_STAMINA_WARNING = 'Endurance low — avoid another hit.';
const FIELD_RESCUE_MESSAGE = 'You were forced back to the last checkpoint. Recover and try again.';
const FIELD_RESCUE_STAMINA_REASON = 'Endurance overwhelmed.';
const EXHAUSTED_RECOVERY_RATE = 4; // Endurance per second while exhausted at zero
const EXHAUSTED_RECOVERY_CEILING = 15; // auto-recovery stops here; enough to dodge once
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
const LOST_BRIDGE_RAVINE_FALL_DEPTH = 88;
const LOST_BRIDGE_RAVINE_FALL_SIDE_PAD = 210;
const LOST_BRIDGE_RAVINE_BLEND_CLIP_TOP_OFFSET = 8;
const LOST_BRIDGE_RAVINE_BLEND_CLIP_PAD = 44;
const LOST_BRIDGE_RAVINE_THROAT_TOP_OFFSET = 86;
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
const DESERT_ENTRY_BURIED_CAUSEWAY_GROUND_SRC = 'assets/expedition/backgrounds/desert-entry/desert-entry-premium-causeway-lane.png';
const SACRED_RECORD_WAY_BACKGROUND_ASSETS = {
  'mummification-link': 'assets/expedition/environment/desert-temple/sacred-record-way-mummification-link.png',
  'mural-link': 'assets/expedition/environment/desert-temple/sacred-record-way-mural-link.png',
  'scribe-link': 'assets/expedition/environment/desert-temple/sacred-record-way-scribe-link.png',
};
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
const DESERT_ENTRY_BURIED_CAUSEWAY_GROUND_VERSION = 'png-premium-causeway-lane-2026-06-02';
const SACRED_RECORD_WAY_BACKGROUND_VERSION = 'imagegen-sacred-record-way-background-2026-05-29';
const OPENING_PYRAMID_FACADE_WORLD_LEFT_X = -82;
const DESERT_ENTRY_CONTINUOUS_BACKGROUND_START_X = DESERT_JOURNEY_SCENE_PANELS[0]?.worldStart ?? 0;
const DESERT_ENTRY_CONTINUOUS_BACKGROUND_END_X = DESERT_JOURNEY_SCENE_PANELS[DESERT_JOURNEY_SCENE_PANELS.length - 1]?.worldEnd ?? 17400;
const DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_IDS = Object.freeze([
  'desert-entry-opening-pyramid-to-ravine-background-1',
  'desert-entry-ravine-bridge-background-1',
  'desert-entry-ravine-to-mummification-background-1',
  'desert-entry-mummification-exterior-arrival-background-1',
  'desert-entry-mummification-to-mural-background-1',
  'desert-entry-mural-to-scribe-background-1',
  'desert-entry-scribe-to-queen-background-1',
  'desert-entry-queen-to-ruined-gateway-background-1',
]);
const DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_SEAM_MASKS = Object.freeze([
  { id: 'opening-png-to-ravine-png-dust', worldX: 2090, width: 620, mask: 'dust-haze' },
  { id: 'ravine-png-to-mummification-png-dust', worldX: 4160, width: 760, mask: 'dust-haze' },
  { id: 'mummification-approach-png-to-arrival-png-pillar', worldX: 5185, width: 620, mask: 'broken-pillar' },
  { id: 'arrival-png-to-record-way-png-doorway', worldX: 6500, width: 720, mask: 'temple-doorway' },
  { id: 'mural-png-to-scribe-png-arch', worldX: 10840, width: 620, mask: 'ruined-arch' },
  { id: 'scribe-png-to-queen-png-corridor', worldX: 14880, width: 720, mask: 'shadowed-corridor' },
]);
const DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_ID_SET = new Set(DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_IDS);
const OPENING_PYRAMID_GROUND_JUMP_MULTIPLIER = 1.32;
const OPENING_PYRAMID_AIR_JUMP_MULTIPLIER = 1.6;

const isDesertEntryRebuildBackgroundPlateProp = (prop = {}) => (
  DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_ID_SET.has(prop.id)
);

// When true, the desert opening shows the original bright photoreal sphinx backdrop
// at full brightness instead of the dimmer "opening rebuild" painted plates and dark
// sky wash (whose shaded mummification-temple side read as a dark shadow on the right).
// This forces the rebuild-sky coverage to 0 (so the backdrop is no longer faded out)
// and disables the scene panels + primary PNG plates that were layered over it.
const DESERT_ENTRY_RESTORE_ORIGINAL_BACKDROP = true;

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

const CHARACTER_LOADER_STORAGE_KEY = 'expedition-character-loader-choice';
const JOURNEY_PROP_EDITOR_STORAGE_KEY = 'expedition-journey-prop-editor-edits-v1';
const JOURNEY_PROP_EDITOR_SECTIONS_KEY = 'expedition-journey-prop-editor-collapsed-sections-v1';
const JOURNEY_PROP_EDITOR_PANEL_POS_KEY = 'expedition-journey-prop-editor-panel-pos-v1';
const CHARACTER_LOADER_VISIBILITY_STORAGE_KEY = 'expedition-character-loader-visible-v3';

const PARRY_WINDOW_DURATION = 0.12;
// Perfect dodge: a last-instant dodge (the blow lands while Asha is still in her
// dodge i-frames) deflects ANY attack — even red unblockables — and refunds some
// Endurance, turning evasion into the primary, readable parry.
const PERFECT_DODGE_ENDURANCE_REWARD = 6;
// How close an enemy's front edge must be to the player body before committing to a windup.
// Kept deliberately small so the freeze reads as "right on you" not "approaching from afar".
const ENEMY_ATTACK_TRIGGER_REACH = 16;

// Gap (in px) an enemy keeps between its body edge and Asha's body edge when
// pressing the attack. Larger than 0 so sprites never overlap/"share her space",
// but smaller than ENEMY_ATTACK_TRIGGER_REACH so melee still lands at standoff.
const ENEMY_COMBAT_STANDOFF_GAP = 6;
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

const BOSS_DOMAIN_ENEMY_FOCUS_PADDING = 96;
const SCARAB_QUEEN_ENEMY_FOCUS_PADDING = 220;
const SCARAB_QUEEN_INTRO_TRIGGER_DISTANCE = 220;
const SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS = 6.8;
const SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO = 0.72;

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
const SCORPION_VENOM_SPIT_VISUAL_TRAVEL_TIME = 0.48;

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
  EXTERIOR: 'egypt-exterior-route',
  MUMMIFICATION_CHAMBER: 'mummification-chamber',
  FORGOTTEN_MURAL_CHAMBER: 'forgotten-mural-chamber',
  SCRIBE_LOCKED_CHAMBER: 'scribe-locked-chamber',
});

const getJourneySceneId = (current) => current?.currentSceneId || JOURNEY_SCENE_IDS.EXTERIOR;
const isMummificationChamberScene = (current) => getJourneySceneId(current) === JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER;
const isForgottenMuralChamberScene = (current) => getJourneySceneId(current) === JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER;
const isScribeLockedChamberScene = (current) => getJourneySceneId(current) === JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER;
const isInteriorChamberScene = (current) => isMummificationChamberScene(current) || isForgottenMuralChamberScene(current) || isScribeLockedChamberScene(current);
const getEntitySceneId = (entity) => entity?.sceneId || JOURNEY_SCENE_IDS.EXTERIOR;
const isEntityActiveInScene = (entity, current) => getEntitySceneId(entity) === getJourneySceneId(current);

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
  // Egypt
  'desert-entry':     'desert',
  'ruined-temple':    'temple',
  catacombs:          'catacombs',
  'escape-sequence':  'escape',
  'dig-site-entrance': 'baseCamp',
  // China
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
  shards: 'Climb the ravine bridge route for the next relic shard; the drop below is not a safe path.',
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
const ROUTE_GROUND_VISUAL_MODE = 'buried-stone-causeway-under-windblown-sand-v1';
const DESERT_ENTRY_CAUSEWAY_DRAW_HEIGHT = 64;
const DESERT_ENTRY_CAUSEWAY_DRAW_Y_OFFSET = -28;
const ROUTE_GROUND_HAZE_FIX_VERSION = 'route-ground-buried-stone-causeway-2026-06-01';
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
      targetCameraX: clampCameraX(playerCenterX - CANVAS_WIDTH * 0.5),
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
  const [gameState, setGameState] = useState(() => makeInitialState({
    targetCivilisation,
    permanentUpgradeIds,
    permanentUpgradeEffects,
  }));
  const [briefingOpen, setBriefingOpen] = useState(true);
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
  const desertEntryBuriedCausewayGroundRef = useRef({
    image: null,
    loaded: false,
    failed: false,
    version: DESERT_ENTRY_BURIED_CAUSEWAY_GROUND_VERSION,
  });
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
  const sacredRecordWayBackgroundRef = useRef({ images: {}, loaded: false, failed: false, version: SACRED_RECORD_WAY_BACKGROUND_VERSION });
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
    return applyJourneyPropPlacementEdit(prop, editor.edits[prop.id] || {});
  }, []);

  const getRenderableStoryProps = useCallback((current = stateRef.current) => (
    getAllPropEditorStoryProps()
      .map(prop => getEditedStoryProp(prop))
      .filter(prop => prop && isEntityActiveInScene(prop, current))
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
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      arrivalThresholdBackgroundRef.current = {
        image,
        loaded: true,
        failed: false,
        version: ARRIVAL_THRESHOLD_ASSET_VERSION,
      };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      arrivalThresholdBackgroundRef.current = {
        image: null,
        loaded: false,
        failed: true,
        version: ARRIVAL_THRESHOLD_ASSET_VERSION,
      };
    };
    image.src = `${import.meta.env.BASE_URL}${ARRIVAL_THRESHOLD_BACKGROUND_SRC}?v=${ARRIVAL_THRESHOLD_ASSET_VERSION}`;
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
      desertEntryBuriedCausewayGroundRef.current = {
        image,
        loaded: true,
        failed: false,
        version: DESERT_ENTRY_BURIED_CAUSEWAY_GROUND_VERSION,
      };
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      desertEntryBuriedCausewayGroundRef.current = {
        image: null,
        loaded: false,
        failed: true,
        version: DESERT_ENTRY_BURIED_CAUSEWAY_GROUND_VERSION,
      };
    };
    image.src = `${import.meta.env.BASE_URL}${DESERT_ENTRY_BURIED_CAUSEWAY_GROUND_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => {
    let cancelled = false;
    const entries = Object.entries(SACRED_RECORD_WAY_BACKGROUND_ASSETS);
    const images = {};
    let loadedCount = 0;
    let failedCount = 0;
    const updateState = () => {
      if (cancelled) return;
      sacredRecordWayBackgroundRef.current = {
        images,
        loaded: loadedCount === entries.length,
        failed: failedCount > 0,
        version: SACRED_RECORD_WAY_BACKGROUND_VERSION,
      };
      syncHud();
    };
    entries.forEach(([key, src]) => {
      const image = new Image();
      image.onload = () => {
        images[key] = image;
        loadedCount += 1;
        updateState();
      };
      image.onerror = () => {
        failedCount += 1;
        updateState();
      };
      image.src = `${import.meta.env.BASE_URL}${src}`;
    });
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
      loadEgyptOnlyPacks: !isChinaJourney && !isRomeJourney,
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
    if (!gate.requires) return reqs;
    const enemiesDisabled = Boolean(current?.enemiesDisabled);
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

  const addCombatEffect = useCallback((current, effect) => {
    current.combatHitEffects.push({
      timer: 0.35,
      maxTimer: 0.35,
      ...effect,
    });
    if (current.combatHitEffects.length > 18) current.combatHitEffects.shift();
  }, []);

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
        color: guardColor || profile.sparkColor,
        timer: profile.guardTimer || 0.34,
        maxTimer: profile.guardTimer || 0.34,
      });
    } else {
      addCombatEffect(current, {
        type: defeated ? (targetKind === 'boss' ? 'boss-defeat' : 'defeat') : 'combat-impact',
        x: centerX,
        y: centerY,
        direction,
        color: color || (defeated ? defeatedProfile?.color : profile.color),
        timer: defeated ? defeatedProfile?.impactTimer || profile.impactTimer : profile.impactTimer,
        maxTimer: defeated ? defeatedProfile?.impactTimer || profile.impactTimer : profile.impactTimer,
      });
      addCombatEffect(current, {
        type: 'weapon-hit-spark',
        x: centerX - direction * 6,
        y: target.y + target.height * 0.42,
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
      desertJourneyBackgroundSystemVersion: renderStats.desertJourneyBackgroundSystemVersion || null,
      desertJourneyPanelIds: renderStats.desertJourneyPanelIds || [],
      desertJourneyLayerRoles: renderStats.desertJourneyLayerRoles || [],
      desertJourneyLayerDrawCount: renderStats.desertJourneyLayerDrawCount || 0,
      desertJourneyTransitionMasks: renderStats.desertJourneyTransitionMasks || [],
      desertEntryPrimaryBackgroundPlateIds: renderStats.desertEntryPrimaryBackgroundPlateIds || [],
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
        playerX: Math.round(current.player.x),
        objective: current.notice,
        backgroundLoaded: Boolean(arrivalThresholdBackgroundRef.current.loaded),
        backgroundSrc: ARRIVAL_THRESHOLD_BACKGROUND_SRC,
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
  }, [backgroundPackId, briefingOpen, getActiveHazardsNearPlayer, getActiveHiddenRoutes, getActiveSecretCollectibles, getBossVulnerabilityState, getCombatMode, getEnemyPatternConfig, getEntityCombatState, getGateGuidance, getObjectiveProgress, getPlayerAttackState, getRenderableHazards, getRouteAccessState, getSectionDisplayName, getSectionDisplayTitle, getStaminaWarningState, isRouteRewardAccessible, playerHeroSpriteConfig, targetCivilisation]);

  // --- Rendering Helpers ---
  const drawFieldNoteLabel = useCallback(() => {
    const current = stateRef.current;
    if (current.renderStats) current.renderStats.worldLabelsSuppressed = true;
  }, []);

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
  }, []);

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
  }, []);

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

  const drawOpeningPyramidFacade = useCallback((ctx, cameraX, _now = 0, prop = null) => {
    void _now;
    const facade = openingPyramidFacadeRef.current;
    if (!facade.loaded || !facade.image) return false;
    const renderProp = getGeneratedStoryPropRenderProp(prop || {});
    const width = Number.isFinite(renderProp.width) ? renderProp.width : 1208;
    const height = Number.isFinite(renderProp.height) ? renderProp.height : 664;
    const worldLeftX = Number.isFinite(renderProp.x)
      ? renderProp.x - width / 2
      : OPENING_PYRAMID_FACADE_WORLD_LEFT_X;
    const x = worldToScreenX(worldLeftX, cameraX);
    const y = Number.isFinite(renderProp.y) ? renderProp.y : -4;
    if (x > CANVAS_WIDTH + 80 || x + width < -80) return false;
    ctx.save();
    ctx.globalAlpha = Number.isFinite(renderProp.alpha) ? renderProp.alpha : 0.98;
    ctx.filter = 'sepia(4%) saturate(98%) brightness(91%) contrast(102%)';
    ctx.drawImage(facade.image, x, y, width, height);
    ctx.filter = 'none';
    const baseFade = ctx.createLinearGradient(0, GROUND_Y - 52, 0, GROUND_Y + 24);
    baseFade.addColorStop(0, 'rgba(171, 103, 42, 0)');
    baseFade.addColorStop(0.74, 'rgba(171, 103, 42, 0.24)');
    baseFade.addColorStop(1, 'rgba(91, 51, 21, 0.32)');
    ctx.fillStyle = baseFade;
    ctx.fillRect(Math.max(-40, x), GROUND_Y - 52, Math.min(width + 80, CANVAS_WIDTH + 80), 82);
    ctx.restore();
    return true;
  }, []);

  const drawOpeningPyramidMasonryBack = useCallback((ctx, cameraX, now = 0, current = stateRef.current) => {
    if (openingPyramidFacadeRef.current.loaded && openingPyramidFacadeRef.current.image) {
      const openingPyramidFacadeProp = getRenderableStoryProps(current).find(prop => prop.id === 'opening-pyramid-facade-structure');
      drawOpeningPyramidFacade(ctx, cameraX, now, openingPyramidFacadeProp);
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
  }, [drawOpeningPyramidAssetRegion, drawOpeningPyramidFacade, getRenderableStoryProps]);

  const drawLostBridgeRavineDepth = useCallback((ctx, platforms, cameraX, current) => {
    const editorPlacement = getLostBridgeRavineFloorPlacement(current);
    if (!editorPlacement) return false;
    const deckBounds = getLostBridgeDeckBounds(platforms || []);
    const bounds = deckBounds || {
      left: editorPlacement.drawWorldLeft + editorPlacement.width * 0.18,
      right: editorPlacement.drawWorldLeft + editorPlacement.width * 0.82,
      y: Math.max(0, editorPlacement.drawY + editorPlacement.height * 0.08),
      span: editorPlacement.width * 0.64,
    };
    const activeRavineAssetKey = editorPlacement.prop?.imageAssetKey || 'lostBridgeRavineFloor';
    const activeRavineAssetPath = editorPlacement.prop?.assetPath || LOST_BRIDGE_RAVINE_FLOOR_VARIANT_SRCS.lostBridgeRavineFloor;
    const blend = lostBridgeAssetsRef.current?.floorBlends?.[activeRavineAssetKey]
      || lostBridgeAssetsRef.current?.floorBlends?.[activeRavineAssetPath]
      || lostBridgeAssetsRef.current?.floorBlend;
    const drawWorldLeft = editorPlacement.drawWorldLeft;
    const drawW = editorPlacement.width;
    if (!isHorizontallyVisible(drawWorldLeft, drawW, cameraX, 180)) return false;

    ctx.save();
    const drawX = worldToScreenX(drawWorldLeft, cameraX);
    const ravineFallWorldLeft = bounds.left + LOST_BRIDGE_RAVINE_FALL_SIDE_PAD * 0.82;
    const ravineFallWorldRight = bounds.right - LOST_BRIDGE_RAVINE_FALL_SIDE_PAD * 0.72;
    const ravineFallWidth = Math.max(0, ravineFallWorldRight - ravineFallWorldLeft);
    const drawNonFloorRavineVoid = () => {
      if (ravineFallWidth <= 0) return;
      const throatX = worldToScreenX(ravineFallWorldLeft, cameraX);
      const throatTop = Math.max(0, bounds.y + 18);
      const throatBottom = Math.min(CANVAS_HEIGHT + 42, GROUND_Y + 68);
      const voidGradient = ctx.createLinearGradient(0, throatTop, 0, throatBottom);
      voidGradient.addColorStop(0, 'rgba(79, 45, 18, 0.08)');
      voidGradient.addColorStop(0.2, 'rgba(43, 25, 13, 0.48)');
      voidGradient.addColorStop(0.68, 'rgba(8, 9, 13, 0.92)');
      voidGradient.addColorStop(1, 'rgba(2, 4, 8, 0.72)');
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = voidGradient;
      ctx.beginPath();
      ctx.moveTo(throatX - 96, throatTop + 14);
      ctx.bezierCurveTo(throatX + ravineFallWidth * 0.08, throatTop + 50, throatX + ravineFallWidth * 0.26, throatTop + 32, throatX + ravineFallWidth * 0.42, throatTop + 62);
      ctx.bezierCurveTo(throatX + ravineFallWidth * 0.58, throatTop + 34, throatX + ravineFallWidth * 0.84, throatTop + 54, throatX + ravineFallWidth + 96, throatTop + 12);
      ctx.lineTo(throatX + ravineFallWidth + 148, throatBottom + 40);
      ctx.lineTo(throatX - 148, throatBottom + 40);
      ctx.closePath();
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      const depthGlow = ctx.createRadialGradient(
        throatX + ravineFallWidth * 0.5,
        throatTop + 132,
        Math.max(24, ravineFallWidth * 0.14),
        throatX + ravineFallWidth * 0.5,
        throatTop + 170,
        Math.max(220, ravineFallWidth * 0.72),
      );
      depthGlow.addColorStop(0, 'rgba(0, 3, 7, 0.64)');
      depthGlow.addColorStop(0.58, 'rgba(6, 7, 10, 0.36)');
      depthGlow.addColorStop(1, 'rgba(6, 7, 10, 0)');
      ctx.fillStyle = depthGlow;
      ctx.beginPath();
      ctx.ellipse(
        throatX + ravineFallWidth * 0.5,
        throatTop + 154,
        Math.max(210, ravineFallWidth * 0.64),
        170,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 218, 148, 0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(throatX - 84, throatTop + 14);
      ctx.bezierCurveTo(throatX + ravineFallWidth * 0.16, throatTop + 46, throatX + ravineFallWidth * 0.4, throatTop + 36, throatX + ravineFallWidth * 0.5, throatTop + 66);
      ctx.bezierCurveTo(throatX + ravineFallWidth * 0.66, throatTop + 36, throatX + ravineFallWidth * 0.84, throatTop + 50, throatX + ravineFallWidth + 84, throatTop + 14);
      ctx.stroke();
      ctx.restore();
    };

    if (blend?.naturalWidth && blend?.naturalHeight) {
      const drawH = editorPlacement.height;
      const drawY = editorPlacement.drawY;
      const visibleTop = Math.max(0, drawY + LOST_BRIDGE_RAVINE_BLEND_CLIP_TOP_OFFSET);
      ctx.beginPath();
      ctx.rect(
        drawX - LOST_BRIDGE_RAVINE_BLEND_CLIP_PAD,
        visibleTop,
        drawW + LOST_BRIDGE_RAVINE_BLEND_CLIP_PAD * 2,
        CANVAS_HEIGHT - visibleTop + 24,
      );
      ctx.clip();
      ctx.globalAlpha = 1;
      ctx.filter = 'sepia(4%) saturate(96%) brightness(88%) contrast(112%)';
      ctx.drawImage(blend, drawX, drawY, drawW, drawH);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      const throatX = worldToScreenX(ravineFallWorldLeft, cameraX);
      const throatTop = bounds.y + LOST_BRIDGE_RAVINE_THROAT_TOP_OFFSET;
      const throatBottom = Math.min(CANVAS_HEIGHT + 24, GROUND_Y + 58);
      const throatHeight = Math.max(120, throatBottom - throatTop);
      const throatGradient = ctx.createLinearGradient(0, throatTop, 0, throatBottom);
      throatGradient.addColorStop(0, 'rgba(35, 21, 12, 0)');
      throatGradient.addColorStop(0.24, 'rgba(22, 14, 9, 0.36)');
      throatGradient.addColorStop(0.7, 'rgba(6, 7, 10, 0.76)');
      throatGradient.addColorStop(1, 'rgba(6, 7, 10, 0.18)');
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = throatGradient;
      ctx.beginPath();
      ctx.ellipse(
        throatX + ravineFallWidth * 0.5,
        throatTop + throatHeight * 0.58,
        Math.max(120, ravineFallWidth * 0.54),
        Math.max(92, throatHeight * 0.5),
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
      drawNonFloorRavineVoid();
      if (current.renderStats) {
        current.renderStats.lostBridgeRavineDepth = {
          x: Math.round(ravineFallWorldLeft),
          width: Math.round(ravineFallWidth),
          fallDepth: LOST_BRIDGE_RAVINE_FALL_DEPTH,
          floorBlendVersion: LOST_BRIDGE_ASSET_VERSION,
          floorBlendAssetKey: activeRavineAssetKey,
          floorBlendAssetPath: activeRavineAssetPath,
          editorControlled: true,
          controllerPropId: editorPlacement.prop?.id || null,
          deckBoundsFallback: !deckBounds,
          visualMode: 'dark-non-floor-chasm-under-bridge',
        };
        current.renderStats.lostBridgeRavineStripBounds = {
          x: Math.round(drawWorldLeft),
          y: Math.round(drawY),
          width: Math.round(drawW),
          height: Math.round(drawH),
          clipTop: Math.round(visibleTop),
          layer: 'above-floor-below-bridge-platforms',
          editorControlled: true,
        };
        current.renderStats.lostBridgeRavineThroat = {
          x: Math.round(ravineFallWorldLeft),
          width: Math.round(ravineFallWidth),
          top: Math.round(throatTop),
          bottom: Math.round(throatBottom),
          layer: 'shadow-over-ravine-under-bridge-platforms',
        };
        current.renderStats.lostBridgeRavineFloorBlendLoaded = true;
      }
      ctx.restore();
      return true;
    }

    const fallbackCenterX = drawX + drawW * 0.5;
    const dust = ctx.createLinearGradient(0, GROUND_Y - 40, 0, GROUND_Y + 46);
    dust.addColorStop(0, 'rgba(224, 157, 78, 0)');
    dust.addColorStop(0.48, 'rgba(221, 155, 82, 0.18)');
    dust.addColorStop(1, 'rgba(221, 155, 82, 0)');
    ctx.fillStyle = dust;
    ctx.beginPath();
    ctx.ellipse(fallbackCenterX, GROUND_Y + 2, Math.max(180, drawW * 0.38), 48, 0, 0, Math.PI * 2);
    ctx.fill();
    drawNonFloorRavineVoid();
    ctx.restore();

    if (current.renderStats) {
      current.renderStats.lostBridgeRavineDepth = {
        x: Math.round(ravineFallWorldLeft),
        width: Math.round(ravineFallWidth),
        fallDepth: LOST_BRIDGE_RAVINE_FALL_DEPTH,
        floorBlendLoaded: false,
        floorBlendAssetKey: activeRavineAssetKey,
        floorBlendAssetPath: activeRavineAssetPath,
        visualMode: 'dark-non-floor-chasm-under-bridge',
      };
    }
    return true;
  }, [getLostBridgeRavineFloorPlacement]);

  const drawLostBridgeRavineForegroundVoid = useCallback((ctx, platforms, cameraX, current) => {
    const bounds = getLostBridgeDeckBounds(platforms || []);
    if (!bounds) return false;
    const voidWorldLeft = bounds.left - 520;
    const voidWorldRight = bounds.right + 720;
    if (!isHorizontallyVisible(voidWorldLeft, voidWorldRight - voidWorldLeft, cameraX, 120)) return false;
    const left = worldToScreenX(voidWorldLeft, cameraX);
    const right = worldToScreenX(voidWorldRight, cameraX);
    const width = right - left;
    const top = bounds.y + 82;
    const bottom = CANVAS_HEIGHT + 48;

    ctx.save();
    ctx.beginPath();
    ctx.rect(left - 80, top, width + 160, bottom - top);
    ctx.clip();

    const voidWash = ctx.createLinearGradient(0, top, 0, bottom);
    voidWash.addColorStop(0, 'rgba(43, 25, 13, 0)');
    voidWash.addColorStop(0.14, 'rgba(31, 20, 16, 0.54)');
    voidWash.addColorStop(0.52, 'rgba(7, 8, 12, 0.9)');
    voidWash.addColorStop(1, 'rgba(2, 3, 6, 0.96)');
    ctx.fillStyle = voidWash;
    ctx.fillRect(left - 80, top, width + 160, bottom - top);

    ctx.globalCompositeOperation = 'multiply';
    const core = ctx.createRadialGradient(
      left + width * 0.48,
      top + 118,
      Math.max(60, width * 0.12),
      left + width * 0.52,
      top + 190,
      Math.max(320, width * 0.55),
    );
    core.addColorStop(0, 'rgba(1, 2, 6, 0.92)');
    core.addColorStop(0.64, 'rgba(4, 5, 9, 0.62)');
    core.addColorStop(1, 'rgba(4, 5, 9, 0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.ellipse(left + width * 0.5, top + 152, Math.max(280, width * 0.48), 188, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    const dust = ctx.createLinearGradient(0, top - 18, 0, top + 96);
    dust.addColorStop(0, 'rgba(225, 167, 88, 0)');
    dust.addColorStop(0.5, 'rgba(207, 139, 67, 0.18)');
    dust.addColorStop(1, 'rgba(73, 44, 24, 0)');
    ctx.fillStyle = dust;
    ctx.fillRect(left - 80, top - 18, width + 160, 130);
    ctx.restore();

    if (current.renderStats) {
      current.renderStats.lostBridgeRavineForegroundVoid = {
        x: Math.round(voidWorldLeft),
        width: Math.round(voidWorldRight - voidWorldLeft),
        top: Math.round(top),
        visualMode: 'late-lower-chasm-occlusion',
      };
    }
    return true;
  }, []);

  const drawLostBridgeStructure = useCallback((ctx, platforms, cameraX, current) => {
    const structure = lostBridgeAssetsRef.current?.structure;
    if (!structure || !structure.naturalWidth) return false;
    const bounds = getLostBridgeDeckBounds(platforms || []);
    if (!bounds) return false;

    const drawWorldLeft = bounds.left - LOST_BRIDGE_STRUCTURE_SIDE_PAD;
    const drawW = bounds.span + LOST_BRIDGE_STRUCTURE_SIDE_PAD * 2;
    if (!isHorizontallyVisible(drawWorldLeft, drawW, cameraX, 160)) return false;

    const drawX = worldToScreenX(drawWorldLeft, cameraX);
    const drawH = drawW * (structure.naturalHeight / structure.naturalWidth);
    const drawY = bounds.y - drawH * LOST_BRIDGE_STRUCTURE_DECK_TOP_FRAC;

    ctx.save();
    const ravineY = bounds.y + 18;
    ctx.save();
    ctx.translate(drawX + drawW * 0.5, ravineY + 98);
    ctx.scale(Math.max(1, drawW * 0.38), 92);
    const ravineShadow = ctx.createRadialGradient(0, 0, 0.08, 0, 0, 1);
    ravineShadow.addColorStop(0, 'rgba(44, 24, 8, 0.18)');
    ravineShadow.addColorStop(0.58, 'rgba(44, 24, 8, 0.08)');
    ravineShadow.addColorStop(1, 'rgba(44, 24, 8, 0)');
    ctx.fillStyle = ravineShadow;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.filter = 'sepia(8%) saturate(94%) brightness(93%) contrast(106%)';
    ctx.drawImage(structure, drawX, drawY, drawW, drawH);
    ctx.filter = 'none';
    ctx.restore();

    if (current.renderStats) {
      current.renderStats.lostBridgeStructureVersion = LOST_BRIDGE_ASSET_VERSION;
      current.renderStats.lostBridgeStructureLoaded = true;
      current.renderStats.lostBridgeStructureBounds = {
        x: Math.round(drawWorldLeft),
        y: Math.round(drawY),
        width: Math.round(drawW),
        height: Math.round(drawH),
      };
    }
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

  const drawMummificationChamberExteriorAsset = useCallback((ctx, prop, x, section, now) => {
    const structureAsset = mummificationChamberExteriorRef.current;
    if (!structureAsset.loaded || !structureAsset.image) return false;

    const width = prop.width || 1500;
    const height = prop.height || 760;
    const drawX = x - width / 2;
    const drawY = prop.y;
    const left = drawX;
    const baseY = drawY + height;
    const groundY = Math.min(GROUND_Y - 2, baseY - 4);
    const pulse = 0.75 + Math.sin(now / 420) * 0.12;
    const visualAlpha = prop.alpha ?? 1;
    if (visualAlpha <= 0.01) return false;

    const underlayContact = drawEgyptStructureGroundContactLayer(ctx, prop.groundContactLayer, left, width, groundY, 'underlay');
    ctx.save();
    ctx.globalAlpha = 0.28 * visualAlpha;
    ctx.filter = 'brightness(0) sepia(30%) saturate(130%) blur(4px)';
    ctx.drawImage(structureAsset.image, drawX + width * 0.014, drawY + 10, width * 1.008, height * 1.006);
    ctx.restore();

    ctx.save();
    const baseShadow = ctx.createRadialGradient(x, groundY - 4, width * 0.08, x, groundY - 4, width * 0.52);
    baseShadow.addColorStop(0, `rgba(31, 18, 9, ${0.3 * visualAlpha})`);
    baseShadow.addColorStop(0.52, `rgba(39, 23, 12, ${0.18 * visualAlpha})`);
    baseShadow.addColorStop(1, 'rgba(39, 23, 12, 0)');
    ctx.fillStyle = baseShadow;
    ctx.beginPath();
    ctx.ellipse(x, groundY + 10, width * 0.5, 38, -0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.globalAlpha = visualAlpha;
    ctx.filter = `sepia(6%) saturate(108%) brightness(${98 + pulse * 3}%) contrast(106%)`;
    ctx.drawImage(structureAsset.image, drawX, drawY, width, height);
    ctx.filter = 'none';
    ctx.globalAlpha = 1;

    ctx.save();
    const doorwayX = left + width * 0.535;
    const doorwayY = drawY + height * 0.105;
    const doorwayW = width * 0.085;
    const doorwayH = height * 0.25;
    const doorwayDepth = ctx.createLinearGradient(0, doorwayY, 0, doorwayY + doorwayH);
    doorwayDepth.addColorStop(0, 'rgba(12, 7, 4, 0.08)');
    doorwayDepth.addColorStop(0.45, 'rgba(4, 3, 2, 0.24)');
    doorwayDepth.addColorStop(1, 'rgba(4, 3, 2, 0.1)');
    ctx.fillStyle = doorwayDepth;
    ctx.fillRect(doorwayX, doorwayY, doorwayW, doorwayH);
    ctx.restore();

    drawEgyptStructureWeatheringOverlay(ctx, left, width, groundY, { alpha: 0.74 });
    const overlayContact = drawEgyptStructureGroundContactLayer(ctx, prop.groundContactLayer, left, width, groundY, 'overlay');
    if (stateRef.current.renderStats) {
      stateRef.current.renderStats.mummificationChamberExteriorVersion = MUMMIFICATION_CHAMBER_EXTERIOR_VERSION;
      stateRef.current.renderStats.mummificationChamberExteriorLoaded = true;
      stateRef.current.renderStats.mummificationGroundBlendAssetKeys = Array.from(new Set([
        ...underlayContact.keys,
        ...overlayContact.keys,
      ]));
      stateRef.current.renderStats.mummificationGroundBlendElementCount = underlayContact.count + overlayContact.count;
    }
    return true;
  }, [drawEgyptStructureGroundContactLayer, drawEgyptStructureWeatheringOverlay]);

  const drawForgottenMuralGeneratedAsset = useCallback((ctx, prop, x) => {
    const structureAsset = forgottenMuralAlcoveStructureRef.current;
    if (!structureAsset.loaded || !structureAsset.image) return false;

    const width = prop.width || 1420;
    const height = prop.height || 690;
    const drawX = x - width / 2;
    const drawY = prop.y;
    const left = drawX;
    const baseY = drawY + height;
    const groundY = Math.min(GROUND_Y - 2, baseY - 6);

    const underlayContact = drawEgyptStructureGroundContactLayer(ctx, prop.groundContactLayer, left, width, groundY, 'underlay');
    ctx.globalAlpha = prop.alpha ?? 0.98;
    ctx.filter = 'sepia(2%) saturate(102%) brightness(98%) contrast(104%)';
    ctx.drawImage(structureAsset.image, drawX, drawY, width, height);
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
    drawEgyptStructureWeatheringOverlay(ctx, left, width, groundY, { alpha: 0.86 });
    const overlayContact = drawEgyptStructureGroundContactLayer(ctx, prop.groundContactLayer, left, width, groundY, 'overlay');
    if (stateRef.current.renderStats) {
      stateRef.current.renderStats.forgottenMuralGroundBlendAssetKeys = Array.from(new Set([
        ...underlayContact.keys,
        ...overlayContact.keys,
      ]));
      stateRef.current.renderStats.forgottenMuralGroundBlendElementCount = underlayContact.count + overlayContact.count;
    }
    return true;
  }, [drawEgyptStructureGroundContactLayer, drawEgyptStructureWeatheringOverlay]);

  const drawScribeChamberDoorwayStructure = useCallback((ctx, prop, x, section, now) => {
    const width = prop.width || 1120;
    const height = prop.height || 620;
    const left = x - width / 2;
    const top = prop.y;
    const baseY = top + height;
    const centerX = x;
    const pulse = 0.76 + Math.sin(now / 310) * 0.16;
    const lamp = 0.78 + Math.sin(now / 93) * 0.12;
    const current = stateRef.current;
    const discovered = Boolean(current.discoveredHiddenRouteIds?.has('scribe-locked-chamber-route'));
    const structureAsset = scribeChamberExteriorRef.current;

    if (structureAsset.loaded && structureAsset.image) {
      ctx.save();
      ctx.globalAlpha = prop.alpha ?? 1;
      const groundY = Math.min(GROUND_Y - 3, baseY - 8);
      const underlayContact = drawEgyptStructureGroundContactLayer(ctx, prop.groundContactLayer, left, width, groundY, 'underlay');
      ctx.filter = `sepia(4%) saturate(108%) brightness(${98 + pulse * 4}%) contrast(106%)`;
      ctx.drawImage(structureAsset.image, left, top, width, height);
      ctx.filter = 'none';

      drawEgyptStructureWeatheringOverlay(ctx, left, width, groundY, { alpha: 0.92 });
      const overlayContact = drawEgyptStructureGroundContactLayer(ctx, prop.groundContactLayer, left, width, groundY, 'overlay');
      const groundBlendCount = underlayContact.count + overlayContact.count;

      ctx.globalCompositeOperation = 'screen';
      const doorwayGlow = ctx.createRadialGradient(centerX, top + height * 0.38, 28, centerX, top + height * 0.38, width * 0.22);
      doorwayGlow.addColorStop(0, `rgba(250, 204, 21, ${0.14 * pulse})`);
      doorwayGlow.addColorStop(0.52, `rgba(180, 83, 9, ${0.08 * pulse})`);
      doorwayGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = doorwayGlow;
      ctx.fillRect(centerX - width * 0.28, top + height * 0.12, width * 0.56, height * 0.48);
      ctx.globalCompositeOperation = 'source-over';
      if (stateRef.current.renderStats) {
        stateRef.current.renderStats.scribeChamberExteriorVersion = SCRIBE_CHAMBER_EXTERIOR_VERSION;
        stateRef.current.renderStats.scribeChamberExteriorLoaded = true;
        stateRef.current.renderStats.scribeChamberGroundBlendAssetKeys = Array.from(new Set([
          ...underlayContact.keys,
          ...overlayContact.keys,
        ]));
        stateRef.current.renderStats.scribeChamberGroundBlendElementCount = groundBlendCount;
        stateRef.current.renderStats.visibleWorldLandmarks = Array.from(new Set([
          ...(stateRef.current.renderStats.visibleWorldLandmarks || []),
          prop.id,
        ])).slice(-12);
      }
      ctx.restore();
      return true;
    }

    ctx.save();
    ctx.globalAlpha = prop.alpha ?? 1;
    drawContactShadow(ctx, centerX, Math.min(GROUND_Y - 2, baseY - 3), width * 0.72, 0.18, 1.25);
    const glow = ctx.createRadialGradient(centerX, top + height * 0.44, 22, centerX, top + height * 0.44, width * 0.64);
    glow.addColorStop(0, `rgba(250, 204, 21, ${0.2 * pulse})`);
    glow.addColorStop(0.46, `rgba(180, 83, 9, ${0.12 * pulse})`);
    glow.addColorStop(1, 'rgba(69, 26, 3, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(left - 90, top - 42, width + 180, height + 80);

    const stone = ctx.createLinearGradient(left, top, left + width, top + height);
    stone.addColorStop(0, '#2a1e17');
    stone.addColorStop(0.48, '#5a3f2a');
    stone.addColorStop(1, '#1f1510');
    ctx.fillStyle = stone;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.26)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(left + 18, top + 34, width - 36, height - 52, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(17, 12, 8, 0.94)';
    ctx.beginPath();
    ctx.roundRect(centerX - 54, top + 94, 108, height - 118, 34);
    ctx.fill();
    ctx.strokeStyle = `rgba(250, 204, 21, ${discovered ? 0.72 : 0.46})`;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
    ctx.fillRect(centerX - 48, top + height - 122, 96, 11);
    ctx.fillRect(centerX - 6, top + 106, 12, height - 132);
    ctx.fillStyle = `rgba(255, 231, 143, ${0.62 * pulse})`;
    ctx.beginPath();
    ctx.arc(centerX, top + 158, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 231, 143, ${0.78 * pulse})`;
    ctx.fillStyle = `rgba(250, 204, 21, ${0.5 * pulse})`;
    ctx.shadowColor = 'rgba(250, 204, 21, 0.8)';
    ctx.shadowBlur = 13;
    ctx.lineWidth = 2;
    const glyphY = top + 72;
    [-105, -72, 78, 112].forEach((offset, index) => {
      const gx = centerX + offset;
      if (index % 2 === 0) {
        ctx.beginPath();
        ctx.arc(gx, glyphY + 4, 8, 0, Math.PI * 2);
        ctx.stroke();
        for (let ray = 0; ray < 8; ray += 1) {
          const angle = (Math.PI * 2 * ray) / 8;
          ctx.beginPath();
          ctx.moveTo(gx + Math.cos(angle) * 12, glyphY + 4 + Math.sin(angle) * 12);
          ctx.lineTo(gx + Math.cos(angle) * 18, glyphY + 4 + Math.sin(angle) * 18);
          ctx.stroke();
        }
      } else {
        for (let row = 0; row < 3; row += 1) {
          ctx.beginPath();
          ctx.moveTo(gx - 16, glyphY - 8 + row * 8);
          for (let i = -16; i <= 12; i += 8) ctx.quadraticCurveTo(gx + i + 4, glyphY - 13 + row * 8, gx + i + 8, glyphY - 8 + row * 8);
          ctx.stroke();
        }
      }
    });
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(36, 20, 12, 0.72)';
    ctx.lineWidth = 2;
    [left + 58, left + width - 64].forEach((crackX, index) => {
      ctx.beginPath();
      ctx.moveTo(crackX, top + 78);
      ctx.lineTo(crackX + (index ? -10 : 14), top + 118);
      ctx.lineTo(crackX + (index ? -3 : 8), top + 172);
      ctx.stroke();
    });

    [-1, 1].forEach((side) => {
      const torchX = centerX + side * 126;
      ctx.strokeStyle = '#4a2b17';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(torchX - side * 9, top + 164);
      ctx.lineTo(torchX + side * 22, top + 220);
      ctx.stroke();
      ctx.fillStyle = `rgba(245, 158, 11, ${0.76 * lamp})`;
      ctx.shadowColor = 'rgba(250, 204, 21, 0.9)';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.ellipse(torchX, top + 150, 9, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    for (let step = 0; step < 4; step += 1) {
      const stepWidth = width * (0.38 + step * 0.08);
      ctx.fillStyle = `rgba(93, 64, 42, ${0.74 - step * 0.06})`;
      ctx.fillRect(centerX - stepWidth / 2, baseY - 18 + step * 7, stepWidth, 6);
    }
    if (stateRef.current.renderStats) {
      stateRef.current.renderStats.visibleWorldLandmarks = Array.from(new Set([
        ...(stateRef.current.renderStats.visibleWorldLandmarks || []),
        prop.id,
      ])).slice(-12);
    }
    ctx.restore();
    return true;
  }, [drawEgyptStructureGroundContactLayer, drawEgyptStructureWeatheringOverlay]);

  const {
    drawAncientRouteGround,
    drawArrivalThresholdScene,
    drawForgottenMuralChamberTransition,
    drawOpeningCinematic,
    drawOpeningSphinxEncounter,
    drawOpeningThresholdScene,
    drawPlatform,
    drawPlayerSprite,
    drawStoryProp,
    drawTempleThresholdTransition,
  } = useJourneyRenderer({
    ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON,
    ARRIVAL_THRESHOLD_ASSET_VERSION,
    ARRIVAL_THRESHOLD_LEFT_BOUND,
    ARRIVAL_THRESHOLD_RIGHT_BOUND,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    DEFAULT_LEVEL_TRANSITION,
    DESERT_ENTRY_BURIED_CAUSEWAY_GROUND_VERSION,
    DESERT_ENTRY_CAUSEWAY_DRAW_HEIGHT,
    DESERT_ENTRY_CAUSEWAY_DRAW_Y_OFFSET,
    FORGOTTEN_MURAL_CHAMBER_FADE_IN_SECONDS,
    FORGOTTEN_MURAL_CHAMBER_FADE_OUT_SECONDS,
    FORGOTTEN_MURAL_CHAMBER_SWITCH_SECONDS,
    GROUND_Y,
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
    OPENING_THRESHOLD_FADE_SECONDS,
    OPENING_THRESHOLD_STAIR_REVEAL_SECONDS,
    OPENING_TOMB_STAIRWELL_VERSION,
    PLAYER_DODGE_DURATION,
    PLAYER_SPRITE_DRAW_HEIGHT,
    PLAYER_SPRITE_FRAME_COUNT,
    PLAYER_SPRITE_FRAME_HEIGHT,
    PLAYER_SPRITE_FRAME_WIDTH,
    PLATFORMS,
    ROUTE_GROUND_HAZE_FIX_VERSION,
    ROUTE_GROUND_VISUAL_MODE,
    SCARAB_SEAL_TRIGGER,
    TEMPLE_THRESHOLD_FADE_IN_SECONDS,
    TEMPLE_THRESHOLD_FADE_OUT_SECONDS,
    TEMPLE_THRESHOLD_SWITCH_SECONDS,
    arrivalThresholdBackgroundRef,
    bossSpriteAssetsRef,
    clamp,
    desertEntryBuriedCausewayGroundRef,
    drawDecorativeBaseBlend,
    drawAtlasRegion,
    drawContactShadow,
    drawForegroundSettlingDetails,
    drawGroundDustLip,
    drawOpeningPyramidAssetRegion,
    drawPlayerWeaponAtlasRegion,
    drawRouteGroundApron,
    environmentAssetsRef,
    getBossSpritePack,
    getEnvironmentAssetKeyForPlatform,
    getHeroSpriteFrameKey,
    getHeroSpriteFrameRowName,
    getHeroSpriteFrameScale,
    getHeroSpriteRowScale,
    getOpeningCinematicLine,
    getOpeningThresholdDialogueLine,
    getPlayerAttackState,
    getPlayerWeaponFrameKey,
    getRenderableCheckpoints,
    getSectionForX,
    isHorizontallyVisible,
    isLostBridgeStructureDeckPlatform,
    isPlatformAvailable,
    isPlayerAttackVisualPhase,
    openingSphinxApparitionRef,
    openingTombStairwellRef,
    lostBridgeAssetsRef,
    openingPyramidClimbPackRef,
    openingPyramidFacadeRef,
    playerSpriteRef,
    playerWeaponSpriteRef,
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
    getEnvironmentAssetKeyForStoryProp,
    getGeneratedStoryPropRenderProp,
    getJourneyPaintTintBuffer,
    getScaledDetailContactLayer,
    getStandaloneImagePropAsset,
    getStoryPropAnchorY,
    getStoryPropDepth,
    getStoryPropEditorBounds,
    getStoryPropEditorSize,
    getStoryPropPlacementPreset,
    isDesertEntryRebuildBackgroundPlateProp,
    isLostBridgeRavineSpecialRendererProp,
    JOURNEY_FLAG_VISUAL_MODE,
    markerSpriteAssetsRef,
    PROP_GROUNDING_CONFIG,
    PROP_GROUNDING_INTEGRATION_VERSION,
    propPlacementEditorRef,
    resolvePropGroundingSettings,
    ROUTE_GATE_STANDALONE_PROP_COLOR_GRADE_FILTER,
    shouldGroundLockAtmosphereProp,
    STORY_PROP_GROUNDING_OVERRIDES,
    shouldFlipBossSprite,
    stateRef,
    worldToScreenX,
  });

  const drawForgottenMuralChamberInterior = useCallback((ctx, current, now) => {
    if (!isForgottenMuralChamberScene(current)) return false;
    const chamberAsset = forgottenMuralChamberRef.current;
    const flicker = 0.78 + Math.sin(now / 260) * 0.12;

    ctx.save();
    ctx.globalAlpha = 0.98;
    ctx.fillStyle = 'rgba(8, 5, 4, 0.96)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (chamberAsset.loaded && chamberAsset.image) {
      ctx.drawImage(chamberAsset.image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      const wall = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      wall.addColorStop(0, '#1c1714');
      wall.addColorStop(0.58, '#2b211a');
      wall.addColorStop(1, '#0b0706');
      ctx.fillStyle = wall;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = 'rgba(45, 31, 23, 0.72)';
      ctx.fillRect(110, 92, CANVAS_WIDTH - 220, CANVAS_HEIGHT - 170);
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.26)';
      ctx.lineWidth = 5;
      ctx.strokeRect(386, 150, 348, 190);
    }

    ctx.globalCompositeOperation = 'screen';
    const glow = ctx.createRadialGradient(CANVAS_WIDTH * 0.52, CANVAS_HEIGHT * 0.42, 18, CANVAS_WIDTH * 0.52, CANVAS_HEIGHT * 0.42, 240);
    glow.addColorStop(0, `rgba(96, 165, 250, ${0.26 * flicker})`);
    glow.addColorStop(0.42, `rgba(250, 204, 21, ${0.14 * flicker})`);
    glow.addColorStop(1, 'rgba(8, 13, 24, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalCompositeOperation = 'source-over';

    if (current.forgottenMuralChamberRestored) {
      const revealAsset = forgottenMuralHiddenRevealRef.current;
      const revealPulse = current.cinematicEvent?.id === 'forgotten-mural-relic-slide-puzzle-solved'
        ? clamp(current.cinematicTimer / 4.2, 0, 1)
        : 0;
      const muralX = 390;
      const muralY = 78;
      const muralWidth = 420;
      const muralHeight = 420;
      const muralCenterX = muralX + muralWidth / 2;
      const muralCenterY = muralY + muralHeight / 2;
      const revealedGlow = 0.74 + Math.sin(now / 260) * 0.08 + revealPulse * 0.38;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const revealBacklight = ctx.createRadialGradient(muralCenterX, muralCenterY, 30, muralCenterX, muralCenterY, 350);
      revealBacklight.addColorStop(0, `rgba(250, 204, 21, ${0.3 * revealedGlow})`);
      revealBacklight.addColorStop(0.34, `rgba(37, 99, 235, ${0.16 * revealedGlow})`);
      revealBacklight.addColorStop(1, 'rgba(8, 13, 24, 0)');
      ctx.fillStyle = revealBacklight;
      ctx.fillRect(muralX - 130, muralY - 120, muralWidth + 260, muralHeight + 220);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.72 + revealPulse * 0.12;
      ctx.fillStyle = 'rgba(15, 10, 7, 0.72)';
      ctx.shadowColor = 'rgba(250, 204, 21, 0.52)';
      ctx.shadowBlur = 16 + revealPulse * 22;
      ctx.fillRect(muralX - 10, muralY - 10, muralWidth + 20, muralHeight + 20);
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.64 + revealPulse * 0.18})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(muralX - 10, muralY - 10, muralWidth + 20, muralHeight + 20);
      ctx.restore();

      if (revealAsset.loaded && revealAsset.image) {
        ctx.save();
        ctx.globalAlpha = 0.9 + revealPulse * 0.08;
        ctx.shadowColor = 'rgba(250, 204, 21, 0.5)';
        ctx.shadowBlur = 16 + revealPulse * 26;
        ctx.filter = `sepia(3%) saturate(108%) brightness(${100 + revealPulse * 6}%) contrast(106%)`;
        ctx.drawImage(revealAsset.image, muralX, muralY, muralWidth, muralHeight);
        ctx.filter = 'none';
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = 'rgba(250, 204, 21, 0.38)';
        ctx.fillRect(muralX, muralY, muralWidth, muralHeight);
        ctx.restore();
      }
    }

    ctx.globalAlpha = 0.36;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
    for (let i = 0; i < 14; i += 1) {
      const dustX = 180 + i * 68 + Math.sin(now / 720 + i) * 10;
      const dustY = 60 + ((now / 36 + i * 37) % 370);
      ctx.beginPath();
      ctx.ellipse(dustX, dustY, 1.6 + (i % 3), 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return true;
  }, []);

  const drawMummificationChamberInterior = useCallback((ctx, current, now) => {
    if (!isMummificationChamberScene(current)) return false;
    const chamberAsset = mummificationChamberInteriorRef.current;
    const atmosphere = getMummificationChamberAtmosphere(current);
    const flickerBase = 0.82 + Math.sin(now / 190) * 0.1 + Math.sin(now / 83) * 0.05;
    const flicker = clamp(flickerBase * atmosphere.candleFlickerBoost, 0.62, 1.2);
    const unlocked = Boolean(current.mummificationChamberExitUnlocked);

    ctx.save();
    ctx.fillStyle = 'rgba(8, 5, 4, 0.96)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (chamberAsset.loaded && chamberAsset.image) {
      ctx.globalAlpha = 0.98;
      ctx.drawImage(chamberAsset.image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      const wallGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      wallGradient.addColorStop(0, '#120b07');
      wallGradient.addColorStop(0.42, '#2c1b10');
      wallGradient.addColorStop(0.78, '#3b2614');
      wallGradient.addColorStop(1, '#090604');
      ctx.fillStyle = wallGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.globalAlpha = 0.32;
      ctx.strokeStyle = 'rgba(179, 128, 56, 0.5)';
      ctx.lineWidth = 1.4;
      for (let y = 74; y < CANVAS_HEIGHT - 70; y += 54) {
        ctx.beginPath();
        ctx.moveTo(70, y + Math.sin(now / 2200 + y) * 2);
        ctx.lineTo(CANVAS_WIDTH - 70, y + Math.cos(now / 2300 + y) * 2);
        ctx.stroke();
      }
      for (let x = 118; x < CANVAS_WIDTH - 90; x += 94) {
        ctx.beginPath();
        ctx.moveTo(x + Math.sin(now / 2600 + x) * 3, 42);
        ctx.lineTo(x + 34, CANVAS_HEIGHT - 68);
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(7, 4, 3, ${atmosphere.roomDimAlpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.globalCompositeOperation = 'screen';
    const roomLight = ctx.createRadialGradient(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.42, 20, CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.42, CANVAS_WIDTH * 0.58);
    roomLight.addColorStop(0, `rgba(255, 235, 179, ${atmosphere.roomLightAlpha * flicker})`);
    roomLight.addColorStop(0.36, `rgba(250, 204, 21, ${atmosphere.roomLightAlpha * 0.52})`);
    roomLight.addColorStop(1, 'rgba(69, 26, 3, 0)');
    ctx.fillStyle = roomLight;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const glyphAlpha = atmosphere.glyphGlowAlpha * flicker;
    [
      { x: 164, y: 72, width: 720, height: 72 },
      { x: 142, y: 158, width: 760, height: 48 },
      { x: 72, y: 236, width: 180, height: 184 },
      { x: 946, y: 198, width: 118, height: 236 },
    ].forEach((zone, index) => {
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.shadowColor = index % 2 === 0 ? 'rgba(250, 204, 21, 0.9)' : 'rgba(94, 234, 212, 0.62)';
      ctx.shadowBlur = 20 + atmosphere.wakeProgress * 18;
      ctx.fillStyle = index % 2 === 0
        ? `rgba(250, 204, 21, ${glyphAlpha * 0.32})`
        : `rgba(45, 212, 191, ${glyphAlpha * 0.2})`;
      ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
      ctx.restore();
    });

    const tableZone = MUMMIFICATION_CHAMBER_READABILITY.mummificationChamberPuzzleCenterpiece;
    const tableGlow = ctx.createRadialGradient(tableZone.x, tableZone.y, 20, tableZone.x, tableZone.y, tableZone.radiusX);
    tableGlow.addColorStop(0, `rgba(250, 204, 21, ${(0.16 + atmosphere.wakeProgress * 0.18) * flicker})`);
    tableGlow.addColorStop(0.5, `rgba(245, 158, 11, ${(0.08 + atmosphere.wakeProgress * 0.1) * flicker})`);
    tableGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = tableGlow;
    ctx.fillRect(tableZone.x - tableZone.radiusX, tableZone.y - tableZone.radiusY * 2, tableZone.radiusX * 2, tableZone.radiusY * 4);
    ctx.globalCompositeOperation = 'source-over';

    const candleGlow = (x, y, radius = 86) => {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const glow = ctx.createRadialGradient(x, y, 2, x, y, radius);
      glow.addColorStop(0, `rgba(255, 240, 180, ${(0.2 + atmosphere.wakeProgress * 0.26) * flicker})`);
      glow.addColorStop(0.35, `rgba(245, 158, 11, ${(0.1 + atmosphere.wakeProgress * 0.18) * flicker})`);
      glow.addColorStop(1, 'rgba(88, 28, 5, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      ctx.restore();
    };

    candleGlow(120, 255, 96);
    candleGlow(232, 336, 72);
    candleGlow(CANVAS_WIDTH - 128, 256, 102);
    candleGlow(CANVAS_WIDTH - 242, 332, 72);

    const torch = (x, y, direction = 1) => {
      ctx.save();
      const flame = ctx.createRadialGradient(x, y - 12, 2, x, y - 12, 112);
      flame.addColorStop(0, `rgba(255, 230, 151, ${0.74 * flicker})`);
      flame.addColorStop(0.32, `rgba(245, 158, 11, ${0.42 * flicker})`);
      flame.addColorStop(1, 'rgba(88, 28, 5, 0)');
      ctx.fillStyle = flame;
      ctx.fillRect(x - 132, y - 130, 264, 230);
      ctx.strokeStyle = '#4a2b17';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x - direction * 10, y + 18);
      ctx.lineTo(x + direction * 28, y + 82);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = 'rgba(250, 204, 21, 0.9)';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.ellipse(x, y - 12, 12 + Math.sin(now / 120) * 2, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff7ad';
      ctx.beginPath();
      ctx.ellipse(x + direction * 2, y - 18, 5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    if (!chamberAsset.loaded || !chamberAsset.image) {
      torch(132, 164, 1);
      torch(CANVAS_WIDTH - 132, 164, -1);
    }

    const tableX = CANVAS_WIDTH * 0.5;
    const tableY = GROUND_Y - 84;
    if (!chamberAsset.loaded || !chamberAsset.image) {
      const tableGradient = ctx.createLinearGradient(tableX - 250, tableY, tableX + 250, tableY + 90);
      tableGradient.addColorStop(0, '#4f351f');
      tableGradient.addColorStop(0.48, '#a16207');
      tableGradient.addColorStop(1, '#321b0d');
      ctx.globalAlpha = 0.96;
      ctx.fillStyle = tableGradient;
      ctx.beginPath();
      ctx.roundRect(tableX - 260, tableY, 520, 88, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.42)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = 'rgba(236, 201, 126, 0.9)';
      ctx.beginPath();
      ctx.roundRect(tableX - 150, tableY - 36, 300, 48, 22);
      ctx.fill();
      ctx.strokeStyle = 'rgba(92, 49, 18, 0.52)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(91, 52, 24, 0.54)';
      ctx.fillRect(tableX - 112, tableY - 19, 224, 8);

      const jarColors = ['#b45309', '#92400e', '#854d0e', '#a16207'];
      jarColors.forEach((color, index) => {
        const jarX = tableX - 198 + index * 132;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(jarX, tableY - 8, 24, 36, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(250, 204, 21, 0.36)';
        ctx.fillRect(jarX - 15, tableY - 42, 30, 10);
      });
    }

    const exitX = worldToScreenX(MUMMIFICATION_CHAMBER_EXIT_TRIGGER.minX + 24, current.cameraX);
    ctx.fillStyle = unlocked ? 'rgba(13, 49, 38, 0.84)' : 'rgba(24, 15, 10, 0.96)';
    ctx.beginPath();
    ctx.roundRect(exitX - 32, GROUND_Y - 176, 96, 176, 12);
    ctx.fill();
    ctx.strokeStyle = unlocked ? 'rgba(94, 234, 212, 0.72)' : 'rgba(250, 204, 21, 0.48)';
    ctx.lineWidth = 4;
    ctx.stroke();
    if (!unlocked) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
      ctx.fillRect(exitX - 24, GROUND_Y - 104, 80, 12);
      ctx.fillRect(exitX + 10, GROUND_Y - 162, 12, 144);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const sealPulse = 0.78 + Math.sin(now / 260) * 0.22;
    const sealGlow = ctx.createRadialGradient(exitX + 16, GROUND_Y - 92, 10, exitX + 16, GROUND_Y - 92, unlocked ? 150 : 108);
    sealGlow.addColorStop(0, unlocked
      ? `rgba(94, 234, 212, ${atmosphere.sealGlowAlpha * sealPulse})`
      : `rgba(250, 204, 21, ${atmosphere.sealGlowAlpha * sealPulse})`);
    sealGlow.addColorStop(0.42, unlocked
      ? `rgba(45, 212, 191, ${atmosphere.sealGlowAlpha * 0.36})`
      : `rgba(245, 158, 11, ${atmosphere.sealGlowAlpha * 0.24})`);
    sealGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sealGlow;
    ctx.fillRect(exitX - 142, GROUND_Y - 244, 316, 300);
    ctx.restore();

    const interactionAssets = mummificationInteractionAssetsRef.current;
    const inspectedObjectIds = current.mummificationChamberInspectedObjectIds || new Set();
    const chamberRitualStep = current.mummificationChamberRitualStep || 0;
    const currentStepInfo = MUMMIFICATION_CHAMBER_RITUAL_STEPS[chamberRitualStep];
    if (!unlocked && currentStepInfo) {
      const activeRiteDef = getMummificationRiteByIndex(chamberRitualStep);
      const actionHint = activeRiteDef?.actionHint;
      const panelX = CANVAS_WIDTH * 0.5 - 230;
      const panelY = 70;
      const panelH = actionHint ? 98 : 76;
      ctx.save();
      ctx.fillStyle = 'rgba(22, 13, 8, 0.78)';
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.44)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, 460, panelH, 10);
      ctx.fill();
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 13px Cinzel, serif';
      ctx.fillStyle = 'rgba(250, 204, 21, 0.9)';
      ctx.fillText(`Rite ${chamberRitualStep + 1}/${MUMMIFICATION_CHAMBER_RITUAL_STEPS.length}`, CANVAS_WIDTH * 0.5, panelY + 22);
      ctx.font = '800 15px Outfit, sans-serif';
      ctx.fillStyle = 'rgba(255, 247, 237, 0.9)';
      ctx.fillText(currentStepInfo.guideLabel, CANVAS_WIDTH * 0.5, panelY + 48);
      if (actionHint) {
        ctx.font = '600 12px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(94, 234, 212, 0.86)';
        ctx.fillText(actionHint, CANVAS_WIDTH * 0.5, panelY + 76);
      }
      ctx.restore();
    }
    MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS.forEach((item) => {
      // activated = ritual step completed for this item (drives glow/alpha); inspected = same (kept for label logic)
      const ritualIdx = MUMMIFICATION_CHAMBER_RITUAL_SEQUENCE.indexOf(item.id);
      const activated = item.exitSeal ? unlocked : (ritualIdx >= 0 && ritualIdx < chamberRitualStep);
      const isCurrentRitualStep = !unlocked && currentStepInfo?.id === item.id;
      const inspected = activated || inspectedObjectIds.has(item.id);
      const dest = {
        x: item.screen.x - item.screen.width / 2,
        y: item.screen.y - item.screen.height / 2,
        width: item.screen.width,
        height: item.screen.height,
      };
      if (item.assetKey === 'linenWrappings') {
        dest.x += Math.sin(now / 540) * atmosphere.linenMotion * 5;
        dest.y += Math.sin(now / 360) * atmosphere.linenMotion * 9;
      }
      ctx.save();
      ctx.globalAlpha = item.exitSeal
        ? (unlocked ? 0.94 : 0.74)
        : item.assetKey === 'linenWrappings'
          ? (inspected ? 0.62 : 0.82) + atmosphere.wakeProgress * 0.1
          : isCurrentRitualStep ? 0.96 : (inspected ? 0.62 : 0.86);
      ctx.filter = item.exitSeal
        ? `drop-shadow(0 0 ${unlocked ? 22 : 10 + atmosphere.wakeProgress * 8}px ${unlocked ? 'rgba(94, 234, 212, 0.72)' : 'rgba(250, 204, 21, 0.62)'})`
        : item.assetKey === 'linenWrappings'
          ? `drop-shadow(0 0 ${8 + atmosphere.wakeProgress * 14}px rgba(255, 244, 214, 0.38))`
          : isCurrentRitualStep
            ? 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.32))'
            : 'drop-shadow(0 8px 10px rgba(18, 10, 6, 0.42))';
      const drewAsset = drawAtlasRegion(ctx, interactionAssets, item.assetKey, dest, { mode: 'contain' });
      ctx.restore();

      if (!drewAsset) {
        ctx.save();
        ctx.globalAlpha = inspected ? 0.54 : 0.82;
        ctx.fillStyle = item.exitSeal ? 'rgba(250, 204, 21, 0.32)' : 'rgba(146, 64, 14, 0.44)';
        ctx.strokeStyle = item.exitSeal ? 'rgba(250, 204, 21, 0.72)' : 'rgba(253, 230, 138, 0.58)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(dest.x, dest.y, dest.width, dest.height, item.exitSeal ? 40 : 10);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      if (isCurrentRitualStep) {
        drawFieldNoteLabel(ctx, item.screen.x, dest.y - 8, `Next: ${currentStepInfo.shortLabel}`, '#5eead4');
      } else if (!inspected || (item.exitSeal && unlocked)) {
        const markerColor = item.exitSeal && unlocked ? '#5eead4' : '#facc15';
        drawFieldNoteLabel(ctx, item.screen.x, dest.y - 8, item.exitSeal && unlocked ? 'Exit open' : 'Inspect', markerColor);
      }
    });

    if (!chamberAsset.loaded || !chamberAsset.image) {
      const glyphPanelX = CANVAS_WIDTH * 0.5 - 230;
      const glyphPanelY = 74;
      ctx.fillStyle = 'rgba(22, 13, 8, 0.74)';
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.38 + flicker * 0.16})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(glyphPanelX, glyphPanelY, 460, 190, 12);
      ctx.fill();
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 18px Cinzel, serif';
      ctx.fillStyle = `rgba(255, 231, 143, ${0.88 * flicker})`;
      ctx.fillText('PREPARATION RITES', CANVAS_WIDTH * 0.5, glyphPanelY + 42);
      ctx.font = '700 13px Outfit, sans-serif';
      ctx.fillStyle = 'rgba(255, 247, 237, 0.74)';
      ctx.fillText('The jars, wrappings, and sealed door wait for the puzzle.', CANVAS_WIDTH * 0.5, glyphPanelY + 92);
      ctx.fillStyle = `rgba(250, 204, 21, ${0.44 * flicker})`;
      ['ANKH', 'JAR', 'LINEN', 'DOOR'].forEach((label, index) => {
        ctx.fillText(label, glyphPanelX + 85 + index * 96, glyphPanelY + 144);
      });
    }

    if (!unlocked) {
      drawFieldNoteLabel(ctx, exitX + 38, GROUND_Y - 192, 'Entrance sealed', '#facc15');
    }

    // --- Journey Room Interact: rite sub-objects, carried item, hold ring, prompt ---
    const interaction = current.mummificationChamberInteraction;
    if (interaction) {
      const carriedId = interaction.carriedItemId;
      const objStates = interaction.objectStates || {};
      const wrongFlash = interaction.wrongFlash || {};
      const activeRite = getMummificationRiteByIndex(chamberRitualStep);
      const flashPulse = 0.5 + Math.sin(now / 70) * 0.5;

      // The chamber "stirs" — a brief ember-coloured flush over the room when a
      // careless action disturbs it (reuses the atmosphere disturbance value).
      if (atmosphere.disturbance > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(214, 84, 32, ${atmosphere.disturbance * 0.18})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
      }

      MUMMIFICATION_CHAMBER_RITE_OBJECTS.forEach((object) => {
        const state = objStates[object.id] || JOURNEY_INTERACT_OBJECT_STATES.IDLE;
        const isActiveRite = activeRite && object.rite === activeRite.rite;
        const completed = state === JOURNEY_INTERACT_OBJECT_STATES.COMPLETED
          || state === JOURNEY_INTERACT_OBJECT_STATES.USED;
        // Future-rite objects aren't placed in the room yet; completed ones stay settled.
        if (!isActiveRite && !completed) return;
        if (carriedId === object.id) return; // carried items render on the player
        const sx = object.screen.x;
        const sy = object.screen.y;
        const w = object.screen.width;
        const h = object.screen.height;
        const sym = object.symbol ? MUMMIFICATION_JAR_SYMBOLS[object.symbol] : null;
        const mark = sym?.glyph || object.fragMark || null;
        const oilColor = object.oilTone === 'sacred' ? '#7fd6c0'
          : object.oilTone === 'bitter' ? '#6f5f33'
            : object.oilTone === 'thin' ? '#b9a06a' : null;
        const baseColor = sym?.color || oilColor || (object.id === 'linen-roll' ? '#e8ddc4' : '#caa86a');
        const isSlot = object.role === 'target' || object.role === 'restore';
        const flashStroke = wrongFlash[object.id]
          ? `rgba(248, 113, 113, ${0.4 + flashPulse * 0.5})`
          : null;
        ctx.save();
        // Subtle presence glow only — no "this is the correct one" highlight, so
        // matching the jar/fragment to its mark stays genuine inference.
        if (isActiveRite && !completed) {
          ctx.shadowColor = isSlot ? 'rgba(214, 176, 106, 0.38)' : 'rgba(250, 204, 21, 0.46)';
          ctx.shadowBlur = 8;
        }
        if (isSlot) {
          ctx.fillStyle = completed ? 'rgba(34, 28, 18, 0.95)' : 'rgba(54, 41, 24, 0.9)';
          ctx.strokeStyle = flashStroke || (completed ? 'rgba(94, 234, 212, 0.8)' : 'rgba(214, 176, 106, 0.5)');
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(sx - w / 2, sy - h / 2, w, h, 6);
          ctx.fill();
          ctx.stroke();
          if (mark) {
            ctx.fillStyle = completed ? 'rgba(94, 234, 212, 0.92)' : baseColor;
            ctx.font = '900 18px Cinzel, serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(mark, sx, sy - 2);
          }
          if (completed) {
            ctx.fillStyle = baseColor;
            ctx.beginPath();
            ctx.ellipse(sx, sy - h / 2 - 12, 13, 20, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (object.role === 'source') {
          ctx.globalAlpha = completed ? 0.35 : 1;
          ctx.fillStyle = baseColor;
          ctx.beginPath();
          ctx.ellipse(sx, sy, w / 2, h / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = flashStroke || 'rgba(20, 12, 6, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
          if (mark) {
            ctx.fillStyle = 'rgba(20, 12, 6, 0.82)';
            ctx.font = '900 14px Cinzel, serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(mark, sx, sy);
          }
        } else {
          // inspect / activate / apply / wrap markers
          ctx.strokeStyle = flashStroke
            || (completed ? 'rgba(94, 234, 212, 0.5)' : 'rgba(250, 204, 21, 0.42)');
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(w, h) / 2, 0, Math.PI * 2);
          ctx.stroke();
          if (object.role === 'activate') {
            ctx.fillStyle = completed ? 'rgba(94, 234, 212, 0.5)' : 'rgba(120, 170, 210, 0.55)';
            ctx.beginPath();
            ctx.ellipse(sx, sy + 5, w / 2 - 4, h / 3, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      });

      // Hold progress ring over the active apply/wrap target.
      if (interaction.holdItemId && interaction.holdProgress > 0 && interaction.holdDuration > 0) {
        const holdObj = MUMMIFICATION_CHAMBER_RITE_OBJECTS.find(o => o.id === interaction.holdItemId);
        if (holdObj) {
          const ratio = clamp(interaction.holdProgress / interaction.holdDuration, 0, 1);
          const cx = holdObj.screen.x;
          const cy = holdObj.screen.y - 36;
          const pulse = 0.85 + Math.sin(now / 90) * 0.15;
          ctx.save();
          ctx.lineWidth = 6;
          ctx.strokeStyle = 'rgba(18, 12, 8, 0.65)';
          ctx.beginPath();
          ctx.arc(cx, cy, 26, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowColor = 'rgba(94, 234, 212, 0.7)';
          ctx.shadowBlur = 12 * pulse;
          ctx.strokeStyle = `rgba(94, 234, 212, ${0.85 + ratio * 0.15})`;
          ctx.beginPath();
          ctx.arc(cx, cy, 26, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(224, 252, 247, 0.95)';
          ctx.font = '800 12px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(holdObj.holdKey === 'wrap' ? 'Wrapping…' : 'Applying…', cx, cy - 40);
          ctx.restore();
        }
      }

      // Carried item floating above Asha.
      if (carriedId) {
        const carriedObj = MUMMIFICATION_CHAMBER_RITE_OBJECTS.find(o => o.id === carriedId);
        const pcx = worldToScreenX(current.player.x + current.player.width / 2, current.cameraX);
        const pcy = current.player.y - 24;
        const sym = carriedObj?.symbol ? MUMMIFICATION_JAR_SYMBOLS[carriedObj.symbol] : null;
        const carriedMark = sym?.glyph || carriedObj?.fragMark || null;
        const carriedOilColor = carriedObj?.oilTone === 'sacred' ? '#7fd6c0'
          : carriedObj?.oilTone === 'bitter' ? '#6f5f33'
            : carriedObj?.oilTone === 'thin' ? '#b9a06a' : null;
        ctx.save();
        ctx.shadowColor = 'rgba(94, 234, 212, 0.7)';
        ctx.shadowBlur = 14;
        ctx.fillStyle = sym?.color || carriedOilColor || (carriedId === 'linen-roll' ? '#e8ddc4' : '#d8c08a');
        ctx.beginPath();
        ctx.ellipse(pcx, pcy, 13, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (carriedMark) {
          ctx.fillStyle = 'rgba(20, 12, 6, 0.85)';
          ctx.font = '900 13px Cinzel, serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(carriedMark, pcx, pcy);
        }
        ctx.font = '800 11px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(255, 247, 237, 0.92)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Carrying: ${carriedObj?.label || 'item'}`, pcx, pcy - 28);
        ctx.restore();
      }

      // Interact prompt pill near the active object — only when close enough to act.
      if (interaction.activePrompt && interaction.activePromptId) {
        const promptObj = MUMMIFICATION_CHAMBER_RITE_OBJECTS.find(o => o.id === interaction.activePromptId)
          || MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS.find(o => o.id === interaction.activePromptId);
        if (promptObj) {
          const label = interaction.activePrompt;
          const px = promptObj.screen.x;
          const ph = promptObj.screen.height || 60;
          const py = promptObj.screen.y - ph / 2 - 30;
          ctx.save();
          ctx.font = '800 13px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const pw = ctx.measureText(label).width + 24;
          ctx.fillStyle = 'rgba(15, 23, 24, 0.86)';
          ctx.strokeStyle = 'rgba(94, 234, 212, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(px - pw / 2, py - 13, pw, 26, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'rgba(224, 252, 247, 0.96)';
          ctx.fillText(label, px, py);
          ctx.restore();
        }
      }
    }

    const particleCount = atmosphere.particleCount;
    ctx.globalAlpha = 0.16 + atmosphere.wakeProgress * 0.26;
    ctx.fillStyle = unlocked ? 'rgba(94, 234, 212, 0.34)' : 'rgba(245, 158, 11, 0.25)';
    for (let i = 0; i < particleCount; i += 1) {
      const driftSpeed = 60 - atmosphere.wakeProgress * 24;
      const dustX = 112 + i * 38 + Math.sin(now / 620 + i) * (7 + atmosphere.wakeProgress * 9);
      const dustY = 50 + ((now / driftSpeed + i * 31) % 420);
      ctx.beginPath();
      ctx.ellipse(dustX, dustY, 1.1 + (i % 3) + atmosphere.wakeProgress * 0.8, 3 + atmosphere.wakeProgress * 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (current.renderStats) {
      current.renderStats.mummificationChamberInteriorVersion = MUMMIFICATION_CHAMBER_INTERIOR_VERSION;
      current.renderStats.mummificationChamberInteriorLoaded = Boolean(chamberAsset.loaded && chamberAsset.image);
      current.renderStats.mummificationChamberInteractionAssetVersion = MUMMIFICATION_CHAMBER_INTERACTIONS_ASSET_VERSION;
      current.renderStats.mummificationChamberInteractionAssetsLoaded = Boolean(interactionAssets.loaded && interactionAssets.image);
      current.renderStats.mummificationChamberRitualGuidanceVersion = MUMMIFICATION_CHAMBER_RITUAL_GUIDANCE_VERSION;
      current.renderStats.mummificationChamberCurrentRite = currentStepInfo?.rite || null;
      current.renderStats.mummificationChamberNextObjectId = currentStepInfo?.id || null;
      current.renderStats.mummificationChamberAtmosphereVersion = MUMMIFICATION_CHAMBER_ATMOSPHERE_VERSION;
      current.renderStats.mummificationChamberAtmosphereState = atmosphere.state;
      current.renderStats.mummificationChamberWakeProgress = Number(atmosphere.wakeProgress.toFixed(2));
      current.renderStats.mummificationChamberParticleCount = particleCount;
      current.renderStats.mummificationChamberGlyphGlowAlpha = Number(atmosphere.glyphGlowAlpha.toFixed(2));
      current.renderStats.visibleMummificationChamberInteractionObjects = MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS.map(item => item.id);
      current.renderStats.mummificationChamberInspectedObjects = Array.from(inspectedObjectIds);
      current.renderStats.mummificationChamberInteractVersion = MUMMIFICATION_ROOM_INTERACT_VERSION;
      current.renderStats.mummificationChamberCarriedItemId = current.mummificationChamberInteraction?.carriedItemId || null;
      current.renderStats.mummificationChamberActivePrompt = current.mummificationChamberInteraction?.activePrompt || null;
      current.renderStats.mummificationChamberHoldProgress = Number((current.mummificationChamberInteraction?.holdProgress || 0).toFixed(2));
      current.renderStats.mummificationChamberDisturbance = Number((atmosphere.disturbance || 0).toFixed(2));
      current.renderStats.mummificationChamberWrongCount = current.mummificationChamberWrongCount || 0;
    }
    ctx.restore();
    return true;
  }, [drawFieldNoteLabel]);

  const drawScribeLockedChamberInterior = useCallback((ctx, current, now) => {
    if (!isScribeLockedChamberScene(current)) return false;
    const chamberAsset = scribeChamberInteriorRef.current;
    const hasInteriorAsset = Boolean(chamberAsset.loaded && chamberAsset.image);
    const flicker = 0.82 + Math.sin(now / 220) * 0.1 + Math.sin(now / 91) * 0.04;
    const unlocked = Boolean(current.scribeChamberExitUnlocked);

    ctx.save();
    ctx.fillStyle = 'rgba(8, 5, 4, 0.96)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (hasInteriorAsset) {
      ctx.globalAlpha = 0.98;
      ctx.drawImage(chamberAsset.image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = 1;
      ctx.fillStyle = unlocked ? 'rgba(7, 4, 3, 0.1)' : 'rgba(7, 4, 3, 0.18)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const scribeRoomLight = ctx.createRadialGradient(CANVAS_WIDTH * 0.52, CANVAS_HEIGHT * 0.42, 30, CANVAS_WIDTH * 0.52, CANVAS_HEIGHT * 0.42, CANVAS_WIDTH * 0.56);
      scribeRoomLight.addColorStop(0, `rgba(255, 225, 154, ${0.14 * flicker})`);
      scribeRoomLight.addColorStop(0.44, `rgba(245, 158, 11, ${0.07 * flicker})`);
      scribeRoomLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = scribeRoomLight;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    } else {
    const wallGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    wallGradient.addColorStop(0, '#0b0806');
    wallGradient.addColorStop(0.38, '#21170f');
    wallGradient.addColorStop(0.72, '#2b1d12');
    wallGradient.addColorStop(1, '#070504');
    ctx.fillStyle = wallGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.globalAlpha = 0.34;
    ctx.strokeStyle = 'rgba(120, 87, 49, 0.5)';
    ctx.lineWidth = 1.5;
    for (let x = -40; x < CANVAS_WIDTH + 60; x += 96) {
      ctx.beginPath();
      ctx.moveTo(x + Math.sin(now / 3000 + x) * 4, 36);
      ctx.lineTo(x + 32, CANVAS_HEIGHT - 64);
      ctx.stroke();
    }
    for (let y = 80; y < CANVAS_HEIGHT - 70; y += 58) {
      ctx.beginPath();
      ctx.moveTo(60, y + Math.sin(now / 2400 + y) * 2);
      ctx.lineTo(CANVAS_WIDTH - 60, y + Math.cos(now / 2200 + y) * 2);
      ctx.stroke();
    }

    const torch = (x, y, direction = 1) => {
      ctx.save();
      const flame = ctx.createRadialGradient(x, y - 12, 2, x, y - 12, 90);
      flame.addColorStop(0, `rgba(255, 218, 117, ${0.72 * flicker})`);
      flame.addColorStop(0.32, `rgba(245, 158, 11, ${0.36 * flicker})`);
      flame.addColorStop(1, 'rgba(88, 28, 5, 0)');
      ctx.fillStyle = flame;
      ctx.fillRect(x - 110, y - 118, 220, 210);
      ctx.strokeStyle = '#4a2b17';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x - direction * 10, y + 18);
      ctx.lineTo(x + direction * 28, y + 82);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = 'rgba(250, 204, 21, 0.9)';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.ellipse(x, y - 12, 12 + Math.sin(now / 120) * 2, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff7ad';
      ctx.beginPath();
      ctx.ellipse(x + direction * 2, y - 18, 5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    torch(104, 154, 1);
    torch(CANVAS_WIDTH - 104, 154, -1);

    const wallX = 245;
    const wallY = 70;
    const wallW = 610;
    const wallH = 272;
    const wallPanel = ctx.createLinearGradient(wallX, wallY, wallX, wallY + wallH);
    wallPanel.addColorStop(0, '#201712');
    wallPanel.addColorStop(0.48, '#110d0b');
    wallPanel.addColorStop(1, '#2f2118');
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = wallPanel;
    ctx.beginPath();
    ctx.roundRect(wallX, wallY, wallW, wallH, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(180, 129, 57, 0.5)';
    ctx.lineWidth = 4;
    ctx.stroke();

    const drawMiniGlyph = (x, y, kind, damaged = false, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = damaged ? 0.58 : 0.86;
      ctx.strokeStyle = damaged ? 'rgba(217, 119, 6, 0.82)' : 'rgba(255, 231, 143, 0.95)';
      ctx.fillStyle = damaged ? 'rgba(217, 119, 6, 0.64)' : 'rgba(250, 204, 21, 0.86)';
      ctx.shadowColor = 'rgba(250, 204, 21, 0.7)';
      ctx.shadowBlur = damaged ? 5 : 13;
      ctx.lineWidth = 2.2;
      if (kind === 'sun') {
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.stroke();
        for (let ray = 0; ray < 8; ray += 1) {
          const angle = (Math.PI * 2 * ray) / 8;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 12, Math.sin(angle) * 12);
          ctx.lineTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
          ctx.stroke();
        }
      } else if (kind === 'water') {
        for (let row = -1; row <= 1; row += 1) {
          ctx.beginPath();
          ctx.moveTo(-17, row * 7);
          for (let i = -16; i <= 18; i += 8) ctx.quadraticCurveTo(i + 4, row * 7 - 5, i + 8, row * 7);
          ctx.stroke();
        }
      } else if (kind === 'ankh') {
        ctx.beginPath();
        ctx.ellipse(0, -10, 7, 10, 0, 0, Math.PI * 2);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 22);
        ctx.moveTo(-14, 8);
        ctx.lineTo(14, 8);
        ctx.stroke();
      } else if (kind === 'eye') {
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === 'feather') {
        ctx.beginPath();
        ctx.moveTo(-6, 18);
        ctx.quadraticCurveTo(5, -18, 14, -22);
        ctx.quadraticCurveTo(19, -4, -6, 18);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-4, 14);
        ctx.lineTo(12, -14);
        ctx.stroke();
      } else if (kind === 'reed') {
        ctx.beginPath();
        ctx.moveTo(0, 22);
        ctx.lineTo(0, -18);
        ctx.moveTo(0, -12);
        ctx.lineTo(12, -22);
        ctx.stroke();
      } else if (kind === 'bird') {
        ctx.beginPath();
        ctx.moveTo(-18, 8);
        ctx.quadraticCurveTo(-5, -16, 13, -4);
        ctx.quadraticCurveTo(3, 0, 17, 14);
        ctx.moveTo(-2, 10);
        ctx.lineTo(-8, 22);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(-10, -16, 20, 32, 3);
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();
      }
      if (damaged) {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(17, 12, 8, 0.88)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -17);
        ctx.lineTo(-2, 2);
        ctx.lineTo(-8, 19);
        ctx.stroke();
      }
      ctx.restore();
    };

    const miniGlyphTypes = ['sun', 'water', 'ankh', 'door', 'eye', 'feather', 'reed', 'bird'];
    for (let col = 0; col < 10; col += 1) {
      const x = wallX + 36 + col * 58;
      ctx.globalAlpha = 0.24;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 27, wallY + 18);
      ctx.lineTo(x + 27, wallY + wallH - 24);
      ctx.stroke();
      for (let row = 0; row < 6; row += 1) {
        drawMiniGlyph(x, wallY + 42 + row * 36, miniGlyphTypes[(col + row) % miniGlyphTypes.length], (col + row) % 7 === 0, 0.72);
      }
    }

    const glyphs = [
      ['sun', 'Sun', 344, 156, false],
      ['water', 'Water', 476, 156, false],
      ['ankh', 'Ankh', 608, 156, false],
      ['door', 'Door', 740, 156, false],
      ['eye', 'Eye', 392, 252, false],
      ['feather', 'Feather', 514, 252, true],
      ['reed', 'Reed', 636, 252, false],
      ['bird', 'Bird', 758, 252, true],
    ];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    glyphs.forEach(([kind, label, x, y, cracked], index) => {
      const pulse = flicker + Math.sin(now / 320 + index) * 0.08;
      ctx.save();
      ctx.globalAlpha = cracked ? 0.82 : 0.98;
      ctx.fillStyle = 'rgba(36, 25, 16, 0.92)';
      ctx.strokeStyle = cracked ? 'rgba(180, 83, 9, 0.65)' : 'rgba(250, 204, 21, 0.72)';
      ctx.lineWidth = 3;
      ctx.shadowColor = cracked ? 'rgba(245, 158, 11, 0.42)' : 'rgba(250, 204, 21, 0.74)';
      ctx.shadowBlur = cracked ? 12 : 22;
      ctx.beginPath();
      ctx.roundRect(x - 35, y - 38, 70, 76, 10);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      drawMiniGlyph(x, y - 4, kind, cracked, index < 4 ? 1.42 : 1.1);
      ctx.save();
      ctx.shadowColor = 'rgba(250, 204, 21, 0.55)';
      ctx.shadowBlur = cracked ? 4 : 10;
      ctx.font = '10px Cinzel, serif';
      ctx.fillStyle = cracked ? `rgba(217, 119, 6, ${0.66 * pulse})` : `rgba(255, 231, 143, ${0.92 * pulse})`;
      ctx.fillText(label.toUpperCase(), x, y + 32);
      ctx.restore();
    });

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const glyphGlow = ctx.createRadialGradient(552, 175, 30, 552, 175, 360);
    glyphGlow.addColorStop(0, `rgba(250, 204, 21, ${0.34 * flicker})`);
    glyphGlow.addColorStop(0.45, `rgba(245, 158, 11, ${0.16 * flicker})`);
    glyphGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glyphGlow;
    ctx.fillRect(160, 10, 790, 410);
    ctx.restore();
    }

    const pedestalX = worldToScreenX(SCRIBE_CHAMBER_TABLET_REGION.x + SCRIBE_CHAMBER_TABLET_REGION.width / 2, current.cameraX);
    const pedestalY = GROUND_Y - 70;
    ctx.fillStyle = '#4b3524';
    ctx.beginPath();
    ctx.roundRect(pedestalX - 42, pedestalY, 84, 82, 8);
    ctx.fill();
    ctx.fillStyle = '#7c5b38';
    ctx.beginPath();
    ctx.roundRect(pedestalX - 54, pedestalY - 12, 108, 22, 8);
    ctx.fill();
    ctx.fillStyle = current.scribeChamberTabletInspected ? '#fde68a' : '#d6b66b';
    ctx.shadowColor = 'rgba(250, 204, 21, 0.55)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(pedestalX - 34, pedestalY - 44, 68, 34, 5);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '10px Cinzel, serif';
    ctx.fillStyle = '#3b2614';
    ctx.fillText('SUN WATER ANKH DOOR', pedestalX, pedestalY - 27);

    const exitX = worldToScreenX(SCRIBE_CHAMBER_EXIT_TRIGGER.minX + 24, current.cameraX);
    ctx.fillStyle = unlocked ? 'rgba(13, 49, 38, 0.84)' : 'rgba(28, 18, 13, 0.94)';
    ctx.beginPath();
    ctx.roundRect(exitX - 30, GROUND_Y - 172, 92, 172, 12);
    ctx.fill();
    ctx.strokeStyle = unlocked ? 'rgba(94, 234, 212, 0.7)' : 'rgba(250, 204, 21, 0.48)';
    ctx.lineWidth = 4;
    ctx.stroke();
    if (!unlocked) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
      ctx.fillRect(exitX - 22, GROUND_Y - 100, 76, 12);
      ctx.fillRect(exitX + 10, GROUND_Y - 160, 12, 142);
    }

    ctx.globalAlpha = 0.36;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.26)';
    for (let i = 0; i < 22; i += 1) {
      const dustX = 120 + i * 42 + Math.sin(now / 760 + i) * 9;
      const dustY = 46 + ((now / 42 + i * 31) % 380);
      ctx.beginPath();
      ctx.ellipse(dustX, dustY, 1.2 + (i % 3), 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (current.scribeChamberTabletInspected) {
      drawFieldNoteLabel(ctx, pedestalX, pedestalY - 72, 'Translation tablet recorded', '#facc15');
    }
    if (current.scribeChamberWallInspected && !current.scribeChamberPuzzleSolved) {
      drawFieldNoteLabel(ctx, CANVAS_WIDTH * 0.52, 52, 'Decode the glowing wall', '#facc15');
    }
    if (current.renderStats) {
      current.renderStats.scribeChamberInteriorVersion = SCRIBE_CHAMBER_INTERIOR_VERSION;
      current.renderStats.scribeChamberInteriorLoaded = hasInteriorAsset;
    }
    ctx.restore();
    return true;
  }, [drawFieldNoteLabel]);

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
    const landmarkAlpha = Number.isFinite(landmark.alpha)
      ? landmark.alpha
      : landmark.type === 'excavation-camp'
        ? 0.58
        : landmark.layer === 'between-chambers'
          ? 0.62
          : 0.38;
    ctx.globalAlpha = landmarkAlpha;
    drawDecorativeBaseBlend(ctx, x, baseY, width * 0.78, section.id, 'background', 0.38);

    if (landmark.type === 'record-way-png') {
      const recordAsset = sacredRecordWayBackgroundRef.current.images?.[landmark.assetKey];
      if (recordAsset) {
        const drawWidth = width;
        const drawHeight = height;
        ctx.filter = 'sepia(8%) saturate(82%) brightness(86%) contrast(96%)';
        ctx.shadowColor = 'rgba(50, 30, 16, 0.22)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 3;
        ctx.drawImage(recordAsset, x - drawWidth / 2, baseY - drawHeight, drawWidth, drawHeight);
        ctx.filter = 'none';
        ctx.shadowColor = 'transparent';
      }
      ctx.restore();
      return true;
    }

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
    } else if (landmark.type === 'record-causeway') {
      ctx.fillStyle = 'rgba(44, 31, 22, 0.26)';
      ctx.beginPath();
      ctx.moveTo(x - width * 0.48, baseY - height * 0.18);
      ctx.lineTo(x - width * 0.34, baseY - height * 0.24);
      ctx.lineTo(x - width * 0.1, baseY - height * 0.21);
      ctx.lineTo(x + width * 0.18, baseY - height * 0.27);
      ctx.lineTo(x + width * 0.48, baseY - height * 0.2);
      ctx.lineTo(x + width * 0.42, baseY - height * 0.08);
      ctx.lineTo(x - width * 0.46, baseY - height * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 238, 180, 0.18)';
      ctx.lineWidth = 2;
      for (let column = 0; column < 7; column += 1) {
        const columnX = x - width * 0.39 + column * width * 0.13;
        ctx.fillStyle = column % 2 === 0 ? 'rgba(88, 57, 31, 0.36)' : 'rgba(59, 39, 24, 0.32)';
        ctx.beginPath();
        ctx.roundRect(columnX - 9, baseY - height * 0.58, 18, height * 0.42, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(columnX - 15, baseY - height * 0.6);
        ctx.lineTo(columnX + 15, baseY - height * 0.6);
        ctx.moveTo(columnX - 13, baseY - height * 0.17);
        ctx.lineTo(columnX + 13, baseY - height * 0.17);
        ctx.stroke();
      }
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.16 * pulse})`;
      ctx.lineWidth = 1.5;
      for (let row = 0; row < 3; row += 1) {
        const rowY = baseY - height * (0.5 - row * 0.1);
        ctx.beginPath();
        ctx.moveTo(x - width * 0.32, rowY);
        ctx.lineTo(x - width * 0.18, rowY + Math.sin(now / 1200 + row) * 1.5);
        ctx.moveTo(x + width * 0.02, rowY + 3);
        ctx.lineTo(x + width * 0.3, rowY + Math.sin(now / 1200 + row + 1) * 1.5);
        ctx.stroke();
      }
    } else if (landmark.type === 'record-frieze') {
      const slabGradient = ctx.createLinearGradient(x - width / 2, baseY - height, x + width / 2, baseY);
      slabGradient.addColorStop(0, 'rgba(92, 57, 28, 0.3)');
      slabGradient.addColorStop(0.48, 'rgba(171, 112, 55, 0.42)');
      slabGradient.addColorStop(1, 'rgba(65, 39, 22, 0.32)');
      ctx.fillStyle = slabGradient;
      ctx.beginPath();
      ctx.roundRect(x - width * 0.5, baseY - height * 0.86, width, height * 0.58, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = `rgba(250, 204, 21, ${0.16 * pulse})`;
      for (let mark = 0; mark < 5; mark += 1) {
        const markX = x - width * 0.35 + mark * width * 0.17;
        ctx.beginPath();
        ctx.ellipse(markX, baseY - height * 0.58, 9, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(markX - 2, baseY - height * 0.42, 4, 16);
      }
    } else if (landmark.type === 'record-image-wall') {
      ctx.fillStyle = 'rgba(75, 48, 28, 0.44)';
      ctx.beginPath();
      ctx.roundRect(x - width * 0.5, baseY - height * 0.9, width, height * 0.68, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 236, 179, 0.22)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = `rgba(96, 165, 250, ${0.14 * pulse})`;
      ctx.beginPath();
      ctx.arc(x - width * 0.12, baseY - height * 0.58, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.24)';
      ctx.lineWidth = 2;
      [-0.32, -0.12, 0.12, 0.32].forEach((offset, index) => {
        const glyphX = x + width * offset;
        ctx.beginPath();
        ctx.moveTo(glyphX - 12, baseY - height * (0.72 - index * 0.02));
        ctx.lineTo(glyphX + 12, baseY - height * (0.72 - index * 0.02));
        ctx.moveTo(glyphX, baseY - height * 0.78);
        ctx.lineTo(glyphX, baseY - height * 0.46);
        ctx.stroke();
      });
    } else if (landmark.type === 'record-script-panel') {
      ctx.fillStyle = 'rgba(52, 35, 24, 0.5)';
      ctx.beginPath();
      ctx.roundRect(x - width * 0.36, baseY - height * 0.9, width * 0.72, height * 0.82, 8);
      ctx.fill();
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.28 * pulse})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 236, 179, 0.3)';
      ctx.lineWidth = 1.5;
      for (let row = 0; row < 5; row += 1) {
        const rowY = baseY - height * 0.72 + row * height * 0.12;
        ctx.beginPath();
        ctx.moveTo(x - width * 0.22, rowY);
        ctx.lineTo(x + width * 0.22, rowY + Math.sin(now / 900 + row) * 2);
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
  }, []);

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
  }, []);

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
    const drawY = Math.min(0, CANVAS_HEIGHT - height) + (feature.yOffset || 0);
    const floorY = Math.min(GROUND_Y + 6, drawY + height - 26);
    const sectionId = feature.to || getSectionForX(feature.x).id;
    const pulse = 0.72 + Math.sin(now / 580 + feature.x * 0.006) * 0.08;
    const revealDistance = Math.abs(centerX - CANVAS_WIDTH * 0.5);
    const focus = clamp(1 - revealDistance / (CANVAS_WIDTH * 0.72), 0, 1);
    const current = stateRef.current;
    const routeGate = ROUTE_GATES.find(item => item.id === feature.routeGateId);
    const doorwayUnlocked = !routeGate || current.openedRouteGateIds?.has(routeGate.id) || areRouteGateRequirementsMetForState(routeGate, current);
    const permanentStructure = Boolean(feature.permanentStructure);
    const passageVisual = feature.passageVisual || {};
    const doorwayCenterX = drawX + width * (passageVisual.centerX ?? 0.5);
    const doorwayCenterY = drawY + height * (passageVisual.centerY ?? 0.54);
    const doorwayRadiusX = width * (passageVisual.radiusX ?? 0.14);
    const doorwayRadiusY = height * (passageVisual.radiusY ?? 0.25);

    ctx.save();
    drawRouteGroundApron(ctx, centerX, floorY - 2, width * 0.72, sectionId, 0.78, Math.round(feature.x));
    if (!permanentStructure) {
      drawContactShadow(ctx, centerX, floorY + 2, width * 0.62, 0.28, 1.22);
    }
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

    if (!permanentStructure) {
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
    }

    drawGroundDustLip(ctx, centerX, floorY, width * 0.72, 'rgba(216, 154, 82, 0.26)');
    const stats = stateRef.current.renderStats;
    if (stats) {
      stats.visibleStageEntranceFeatures = Array.from(new Set([...(stats.visibleStageEntranceFeatures || []), feature.id])).slice(-6);
    }
    ctx.restore();
    return true;
  }, []);

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
    const drawY = Math.min(0, CANVAS_HEIGHT - height) + (feature.yOffset || 0);
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

    if (!preview && event.id === 'scarab-queen-lair-dread-wind') {
      const envelope = Math.sin(clamp(reveal, 0, 1) * Math.PI);
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';

      // Directional vignette — amber pressing in from the right (lair's direction)
      const vg = ctx.createLinearGradient(CANVAS_WIDTH, 0, 0, 0);
      vg.addColorStop(0, `rgba(60, 20, 0, ${0.36 * envelope})`);
      vg.addColorStop(0.42, `rgba(40, 12, 0, ${0.14 * envelope})`);
      vg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const rg = ctx.createRadialGradient(CANVAS_WIDTH * 0.45, CANVAS_HEIGHT * 0.5, CANVAS_WIDTH * 0.18, CANVAS_WIDTH * 0.45, CANVAS_HEIGHT * 0.5, CANVAS_WIDTH * 0.86);
      rg.addColorStop(0, 'rgba(0,0,0,0)');
      rg.addColorStop(0.68, `rgba(20, 6, 0, ${0.09 * envelope})`);
      rg.addColorStop(1, `rgba(10, 3, 0, ${0.32 * envelope})`);
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Sand streaks flying right-to-left from the lair
      for (let i = 0; i < 26; i++) {
        const seed = i * 137.508;
        const yPos = CANVAS_HEIGHT * 0.04 + (seed % (CANVAS_HEIGHT * 0.92));
        const speed = 180 + (i * 29 % 170);
        const len = 44 + (i * 19 % 110);
        const stride = CANVAS_WIDTH + len;
        const t = (now * speed * 0.001 + (i / 26) * stride) % stride;
        const sx = CANVAS_WIDTH - t + len * 0.5;
        ctx.globalAlpha = (0.14 + (i % 5) * 0.07) * envelope;
        ctx.strokeStyle = i % 4 === 0 ? 'rgba(255, 215, 110, 0.9)' : 'rgba(220, 155, 65, 0.75)';
        ctx.lineWidth = 0.7 + (i % 4) * 0.55;
        ctx.beginPath();
        ctx.moveTo(sx, yPos);
        ctx.lineTo(sx + len, yPos + (i % 5) - 2);
        ctx.stroke();
      }

      ctx.restore();
    }

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

    if (event.type === 'looter-shadow') {
      const run = preview ? 0.32 + Math.sin(now / 520) * 0.08 : clamp(1 - progress, 0, 1);
      const looterX = x - 86 + run * 255;
      const looterY = GROUND_Y - 392 - Math.sin(run * Math.PI) * 14;
      ctx.globalAlpha = (preview ? 0.44 : 0.9) * visibility;
      ctx.fillStyle = 'rgba(10, 8, 7, 0.86)';
      ctx.beginPath();
      ctx.ellipse(looterX, looterY + 28, 13, 24, -0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(looterX + 2, looterY + 5, 10, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(10, 8, 7, 0.82)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(looterX - 4, looterY + 34);
      ctx.lineTo(looterX - 24 + Math.sin(run * 12) * 8, looterY + 53);
      ctx.moveTo(looterX + 8, looterY + 34);
      ctx.lineTo(looterX + 30 - Math.sin(run * 12) * 7, looterY + 52);
      ctx.stroke();
      ctx.globalCompositeOperation = 'screen';
      const glow = ctx.createRadialGradient(looterX + 28, looterY + 22, 4, looterX + 28, looterY + 22, 54);
      glow.addColorStop(0, 'rgba(96, 165, 250, 0.75)');
      glow.addColorStop(0.42, 'rgba(250, 204, 21, 0.28)');
      glow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(looterX - 34, looterY - 36, 124, 124);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = (preview ? 0.28 : 0.52) * visibility;
      ctx.fillStyle = 'rgba(217, 119, 6, 0.34)';
      ctx.beginPath();
      ctx.ellipse(x + 205, looterY + 62 + reveal * 10, 92 + reveal * 24, 12, -0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      recordVisibleEvent();
      return true;
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
  }, []);

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
    if (discovered) {
      ctx.restore();
      return;
    }
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
      if (stats) stats.ambientLifeMode = 'desert-clean-backdrop';
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
  }, [drawCollectibleSpriteGlow, recordCollectibleSprite]);

  const drawDesertEntryBackground = useCallback((ctx, section, cameraX) => {
    const isNearDesertEntry = section.id === 'desert-entry';
    const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'desert-entry');
    if (!isNearDesertEntry || !assets?.ready) return false;

    const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
    if (assets.atlas?.runtimeMode === 'single-composited-backdrop') {
      const openingRebuildCoverage = getDesertEntryOpeningRebuildViewportCoverage(cameraX);
      if (openingRebuildCoverage > 0) {
        const rebuildSky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        rebuildSky.addColorStop(0, '#171d2b');
        rebuildSky.addColorStop(0.36, '#2f2c29');
        rebuildSky.addColorStop(0.68, '#695532');
        rebuildSky.addColorStop(1, '#241d17');
        ctx.save();
        ctx.globalAlpha = openingRebuildCoverage;
        ctx.fillStyle = rebuildSky;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
      }
      const oldBackdropAlpha = 1 - openingRebuildCoverage;
      const backdropDrawn = drawDesertBackgroundLayer(
        ctx,
        assets,
        'sky',
        { y: 0, height: CANVAS_HEIGHT },
        { ...layerOptions, parallax: 0, alpha: oldBackdropAlpha },
      );
      const groundingOverlayDrawn = drawDesertBackgroundLayer(
        ctx,
        assets,
        'groundingOverlay',
        { y: 0, height: CANVAS_HEIGHT },
        { ...layerOptions, parallax: 0, alpha: oldBackdropAlpha },
      );
      return backdropDrawn && groundingOverlayDrawn;
    }

    const drawn = [
      drawDesertBackgroundLayer(ctx, assets, 'sky', { y: 0, height: CANVAS_HEIGHT }, { ...layerOptions, parallax: 0, alpha: 1 }),
      drawDesertBackgroundLayer(ctx, assets, 'farDunes', { y: 0, height: CANVAS_HEIGHT }, { ...layerOptions, parallax: 0.035, alpha: 0.78 }),
      drawDesertBackgroundLayer(ctx, assets, 'distantRuins', { y: 0, height: CANVAS_HEIGHT }, { ...layerOptions, parallax: 0.1, alpha: 0.68 }),
    ];
    return drawn.every(Boolean);
  }, []);

  const drawDesertJourneyPanelLayer = useCallback((ctx, panel, layer, cameraX, now) => {
    const clipLeft = Math.max(0, Math.floor(panel.worldStart - cameraX));
    const clipRight = Math.min(CANVAS_WIDTH, Math.ceil(panel.worldEnd - cameraX));
    if (clipRight <= clipLeft) return false;

    const panelIndex = DESERT_JOURNEY_SCENE_PANELS.findIndex(item => item.id === panel.id);
    const panelSpan = panel.worldEnd - panel.worldStart;
    const cameraDelta = cameraX - panel.worldStart;
    const layerOriginX = -cameraDelta * layer.parallax;
    const at = (relativeX) => layerOriginX + relativeX;
    const wave = Math.sin(now / 2600 + panelIndex * 0.9) * 1.8;

    const drawDuneBand = (baseY, amplitude, color, alpha, phase = 0) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(clipLeft - 120, CANVAS_HEIGHT + 40);
      for (let x = clipLeft - 120; x <= clipRight + 140; x += 56) {
        const worldWaveX = x + cameraX * layer.parallax + panelIndex * 180;
        const y = baseY
          + Math.sin(worldWaveX * 0.004 + phase) * amplitude
          + Math.cos(worldWaveX * 0.0017 + phase * 0.6) * amplitude * 0.52;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(clipRight + 140, CANVAS_HEIGHT + 40);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawPyramid = (x, y, width, height, color, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width / 2, y - height);
      ctx.lineTo(x + width, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 219, 144, 0.08)';
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y - height);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width * 0.62, y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawStoneBlock = (x, y, width, height, color, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(79, 49, 24, 0.16)';
      ctx.lineWidth = 1;
      for (let row = 1; row < 4; row += 1) {
        const lineY = y + (height / 4) * row;
        ctx.beginPath();
        ctx.moveTo(x + 8, lineY);
        ctx.lineTo(x + width - 8, lineY + Math.sin(row + panelIndex) * 2);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawBrokenColumn = (x, y, height, color, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x - 14, y - height, 28, height);
      ctx.fillRect(x - 24, y - height - 10, 48, 10);
      ctx.fillRect(x - 20, y, 40, 12);
      ctx.strokeStyle = 'rgba(68, 43, 23, 0.18)';
      ctx.beginPath();
      ctx.moveTo(x - 6, y - height + 8);
      ctx.lineTo(x - 10, y - 8);
      ctx.moveTo(x + 7, y - height + 18);
      ctx.lineTo(x + 4, y - 12);
      ctx.stroke();
      ctx.restore();
    };

    const drawArch = (x, y, width, height, color, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x - width / 2, y - height * 0.58, width, height * 0.58);
      ctx.beginPath();
      ctx.arc(x, y - height * 0.58, width / 2, Math.PI, 0);
      ctx.lineTo(x + width / 2, y);
      ctx.lineTo(x - width / 2, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(29, 23, 22, 0.72)';
      ctx.beginPath();
      ctx.arc(x, y - height * 0.5, width * 0.27, Math.PI, 0);
      ctx.lineTo(x + width * 0.27, y);
      ctx.lineTo(x - width * 0.27, y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    ctx.save();
    ctx.beginPath();
    ctx.rect(clipLeft, 0, clipRight - clipLeft, CANVAS_HEIGHT);
    ctx.clip();

    if (layer.role === 'sky') {
      const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      sky.addColorStop(0, '#172033');
      sky.addColorStop(0.28, '#5f5144');
      sky.addColorStop(0.56, '#c28d4d');
      sky.addColorStop(1, '#6d4b2b');
      ctx.fillStyle = sky;
      ctx.fillRect(clipLeft, 0, clipRight - clipLeft, CANVAS_HEIGHT);

      if (panel.id === 'opening' || panel.id === 'ravine-bridge') {
        const sunX = panel.id === 'opening' ? at(250) : at(170);
        const sunY = 102 + wave;
        const glow = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 250);
        glow.addColorStop(0, 'rgba(255, 226, 142, 0.72)');
        glow.addColorStop(0.2, 'rgba(247, 181, 82, 0.24)');
        glow.addColorStop(1, 'rgba(247, 181, 82, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(clipLeft, 0, clipRight - clipLeft, CANVAS_HEIGHT);
        ctx.fillStyle = 'rgba(255, 236, 169, 0.86)';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
        ctx.fill();
      }

      const haze = ctx.createLinearGradient(0, panel.horizonY - 70, 0, panel.horizonY + 90);
      haze.addColorStop(0, 'rgba(245, 196, 104, 0)');
      haze.addColorStop(0.45, 'rgba(245, 196, 104, 0.18)');
      haze.addColorStop(1, 'rgba(245, 196, 104, 0)');
      ctx.fillStyle = haze;
      ctx.fillRect(clipLeft, panel.horizonY - 80, clipRight - clipLeft, 180);
    } else if (layer.role === 'far') {
      drawDuneBand(322, 18, '#9a733f', 0.28, 0.5);
      drawDuneBand(365, 24, '#8b6236', 0.32, 1.3);
      const farBase = panel.horizonY + 102;
      [
        [at(120), farBase, 270, 135, 0.18],
        [at(panelSpan * 0.42), farBase + 6, 210, 96, 0.14],
        [at(panelSpan * 0.78), farBase + 2, 245, 112, 0.16],
      ].forEach(([x, y, width, height, alpha]) => {
        drawPyramid(x, y, width, height, '#d1a064', alpha);
      });
      if (panel.id === 'scribe-to-queen-gateway') {
        drawPyramid(at(panelSpan * 0.72), farBase + 18, 360, 164, '#bc874d', 0.2);
      }
    } else if (layer.role === 'mid') {
      drawDuneBand(448, 15, '#7c5731', 0.22, 2.2);
      const baseY = panel.groundY - 55;
      if (panel.id === 'opening') {
        drawPyramid(at(90), baseY + 4, 440, 250, '#b47a41', 0.62);
        drawStoneBlock(at(680), baseY - 64, 250, 94, '#9f7040', 0.48);
        drawStoneBlock(at(1010), baseY - 38, 190, 68, '#ad7b45', 0.42);
      } else if (panel.id === 'ravine-bridge') {
        const leftCliff = at(350);
        const rightCliff = at(panelSpan - 250);
        ctx.fillStyle = '#6d432a';
        ctx.beginPath();
        ctx.moveTo(leftCliff - 520, baseY - 12);
        ctx.lineTo(leftCliff + 250, baseY - 28);
        ctx.lineTo(leftCliff + 160, CANVAS_HEIGHT + 30);
        ctx.lineTo(leftCliff - 560, CANVAS_HEIGHT + 30);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#744a2d';
        ctx.beginPath();
        ctx.moveTo(rightCliff - 160, baseY - 36);
        ctx.lineTo(rightCliff + 620, baseY - 20);
        ctx.lineTo(rightCliff + 660, CANVAS_HEIGHT + 30);
        ctx.lineTo(rightCliff - 90, CANVAS_HEIGHT + 30);
        ctx.closePath();
        ctx.fill();
        drawStoneBlock(at(860), baseY - 132, 72, 160, '#8d6138', 0.6);
        drawStoneBlock(at(1280), baseY - 148, 86, 176, '#7d5434', 0.58);
      } else if (panel.id === 'ravine-to-mummification') {
        drawStoneBlock(at(180), baseY - 70, 230, 112, '#8b6038', 0.42);
        drawStoneBlock(at(520), baseY - 120, 380, 156, '#9e6e3d', 0.52);
        drawBrokenColumn(at(760), baseY + 10, 145, '#8e623a', 0.46);
      } else if (panel.id === 'mummification-arrival') {
        drawStoneBlock(at(210), baseY - 160, 520, 210, '#a3713d', 0.58);
        drawArch(at(460), baseY + 20, 180, 210, '#81562f', 0.48);
        drawBrokenColumn(at(780), baseY + 12, 185, '#9b6d3f', 0.5);
      } else if (panel.id === 'mummification-to-mural') {
        drawStoneBlock(at(150), baseY - 92, 330, 132, '#9c6b3d', 0.48);
        drawStoneBlock(at(560), baseY - 128, 510, 168, '#a57944', 0.48);
        drawBrokenColumn(at(1060), baseY + 10, 150, '#8f6239', 0.5);
      } else if (panel.id === 'mural-to-scribe') {
        drawStoneBlock(at(220), baseY - 126, 560, 170, '#98704a', 0.46);
        drawArch(at(980), baseY + 18, 220, 240, '#8e6139', 0.5);
        drawStoneBlock(at(1580), baseY - 150, 430, 198, '#a06f3e', 0.54);
        drawBrokenColumn(at(2040), baseY + 10, 168, '#8f653e', 0.48);
      } else if (panel.id === 'scribe-to-queen-gateway') {
        drawStoneBlock(at(240), baseY - 130, 460, 180, '#9a6d42', 0.46);
        drawArch(at(1240), baseY + 14, 260, 270, '#865634', 0.5);
        drawStoneBlock(at(2050), baseY - 176, 520, 230, '#a1723e', 0.55);
        drawArch(at(2580), baseY + 16, 360, 320, '#7c4d30', 0.58);
        drawStoneBlock(at(3140), baseY - 126, 360, 176, '#95663a', 0.44);
      }
    } else if (layer.role === 'ground') {
      const ground = ctx.createLinearGradient(0, panel.groundY - 126, 0, CANVAS_HEIGHT);
      ground.addColorStop(0, 'rgba(197, 131, 59, 0.18)');
      ground.addColorStop(0.42, '#a56b34');
      ground.addColorStop(1, '#5b3823');
      ctx.fillStyle = ground;
      ctx.fillRect(clipLeft, panel.groundY - 116, clipRight - clipLeft, CANVAS_HEIGHT - panel.groundY + 116);

      if (panel.id === 'ravine-bridge') {
        const gapLeft = at(650);
        const gapRight = at(1590);
        const chasm = ctx.createLinearGradient(0, panel.groundY - 72, 0, CANVAS_HEIGHT);
        chasm.addColorStop(0, 'rgba(58, 31, 23, 0.72)');
        chasm.addColorStop(0.46, 'rgba(21, 19, 22, 0.94)');
        chasm.addColorStop(1, 'rgba(6, 8, 12, 0.98)');
        ctx.fillStyle = chasm;
        ctx.beginPath();
        ctx.moveTo(gapLeft, panel.groundY - 54);
        ctx.lineTo(gapRight, panel.groundY - 58);
        ctx.lineTo(gapRight + 128, CANVAS_HEIGHT + 30);
        ctx.lineTo(gapLeft - 126, CANVAS_HEIGHT + 30);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(16, 14, 16, 0.5)';
        ctx.fillRect(gapLeft + 120, panel.groundY - 36, Math.max(80, gapRight - gapLeft - 240), 110);
      } else {
        drawDuneBand(panel.groundY - 48, 12, 'rgba(218, 151, 73, 0.38)', 1, 1.6);
      }

      ctx.strokeStyle = 'rgba(255, 218, 142, 0.08)';
      ctx.lineWidth = 1.1;
      for (let line = 0; line < 7; line += 1) {
        const y = panel.groundY - 84 + line * 24;
        ctx.beginPath();
        for (let x = clipLeft - 80; x <= clipRight + 80; x += 80) {
          const ripple = Math.sin((x + cameraX * 0.23) * 0.015 + line + panelIndex) * 5;
          if (x === clipLeft - 80) ctx.moveTo(x, y + ripple);
          else ctx.lineTo(x, y + ripple);
        }
        ctx.stroke();
      }
    } else if (layer.role === 'foreground') {
      const haze = ctx.createLinearGradient(0, panel.groundY - 74, 0, CANVAS_HEIGHT);
      haze.addColorStop(0, 'rgba(232, 165, 91, 0)');
      haze.addColorStop(0.55, 'rgba(232, 165, 91, 0.16)');
      haze.addColorStop(1, 'rgba(86, 50, 29, 0.24)');
      ctx.fillStyle = haze;
      ctx.fillRect(clipLeft, panel.groundY - 90, clipRight - clipLeft, CANVAS_HEIGHT - panel.groundY + 90);

      for (let i = 0; i < 18; i += 1) {
        const x = at((i * 173 + panelIndex * 91) % Math.max(panelSpan, 1));
        const y = panel.groundY - 22 + Math.sin(i * 1.7 + panelIndex) * 14;
        ctx.fillStyle = i % 4 === 0 ? 'rgba(66, 42, 27, 0.24)' : 'rgba(189, 119, 55, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y, 10 + (i % 5) * 3, 3 + (i % 3), -0.08 * i, 0, Math.PI * 2);
        ctx.fill();
      }

      if (panel.id === 'ravine-bridge') {
        const center = at(1120);
        const shadow = ctx.createRadialGradient(center, panel.groundY - 20, 40, center, panel.groundY + 40, 460);
        shadow.addColorStop(0, 'rgba(6, 7, 10, 0.72)');
        shadow.addColorStop(0.45, 'rgba(20, 16, 17, 0.44)');
        shadow.addColorStop(1, 'rgba(20, 16, 17, 0)');
        ctx.fillStyle = shadow;
        ctx.fillRect(center - 560, panel.groundY - 130, 1120, 300);
      }
    }

    ctx.restore();
    return true;
  }, []);

  const drawDesertJourneyTransitionMask = useCallback((ctx, transition, cameraX, now) => {
    const x = transition.worldX - cameraX;
    if (x + transition.width / 2 < -80 || x - transition.width / 2 > CANVAS_WIDTH + 80) return false;
    const w = transition.width;
    const left = x - w / 2;
    const shimmer = Math.sin(now / 1200 + transition.worldX * 0.002) * 5;

    ctx.save();
    if (transition.mask === 'dust-haze' || transition.mask === 'sandstorm-overlay') {
      const dust = ctx.createLinearGradient(left, 0, left + w, 0);
      dust.addColorStop(0, 'rgba(226, 159, 82, 0)');
      dust.addColorStop(0.4, 'rgba(226, 159, 82, 0.48)');
      dust.addColorStop(0.54, 'rgba(246, 204, 127, 0.42)');
      dust.addColorStop(0.68, 'rgba(245, 205, 128, 0.34)');
      dust.addColorStop(1, 'rgba(226, 159, 82, 0)');
      ctx.fillStyle = dust;
      ctx.fillRect(left, 0, w, CANVAS_HEIGHT);
    } else if (transition.mask === 'cliff-wall') {
      const rock = ctx.createLinearGradient(left, 0, left + w, 0);
      rock.addColorStop(0, 'rgba(55, 34, 25, 0)');
      rock.addColorStop(0.42, 'rgba(83, 50, 31, 0.78)');
      rock.addColorStop(0.58, 'rgba(121, 78, 42, 0.7)');
      rock.addColorStop(1, 'rgba(55, 34, 25, 0)');
      ctx.fillStyle = rock;
      ctx.beginPath();
      ctx.moveTo(x - w * 0.16, 270);
      ctx.lineTo(x + w * 0.12, 248 + shimmer);
      ctx.lineTo(x + w * 0.26, CANVAS_HEIGHT + 20);
      ctx.lineTo(x - w * 0.3, CANVAS_HEIGHT + 20);
      ctx.closePath();
      ctx.fill();
    } else if (transition.mask === 'broken-pillar') {
      ctx.fillStyle = 'rgba(96, 61, 35, 0.78)';
      ctx.fillRect(x - 32, 276 + shimmer, 64, 318);
      ctx.fillRect(x - 58, 264 + shimmer, 116, 20);
      ctx.fillStyle = 'rgba(176, 112, 55, 0.24)';
      ctx.fillRect(x - 18, 290 + shimmer, 12, 286);
      ctx.fillRect(x + 14, 286 + shimmer, 9, 292);
    } else if (transition.mask === 'temple-doorway') {
      const floorShadow = ctx.createRadialGradient(x, 556, 18, x, 558, 188);
      floorShadow.addColorStop(0, 'rgba(31, 22, 17, 0.28)');
      floorShadow.addColorStop(0.48, 'rgba(61, 40, 25, 0.14)');
      floorShadow.addColorStop(1, 'rgba(168, 102, 45, 0)');
      ctx.fillStyle = floorShadow;
      ctx.fillRect(x - 220, 478, 440, 132);

      const doorwayShade = ctx.createLinearGradient(x - 62, 0, x + 62, 0);
      doorwayShade.addColorStop(0, 'rgba(24, 18, 16, 0.06)');
      doorwayShade.addColorStop(0.5, 'rgba(18, 15, 14, 0.3)');
      doorwayShade.addColorStop(1, 'rgba(24, 18, 16, 0.06)');
      ctx.fillStyle = doorwayShade;
      ctx.fillRect(x - 62, 304, 124, 230);

      ctx.fillStyle = 'rgba(103, 67, 39, 0.52)';
      ctx.fillRect(x - 108, 268 + shimmer, 44, 292);
      ctx.fillRect(x + 64, 268 + shimmer, 44, 292);
      ctx.fillRect(x - 112, 250 + shimmer, 224, 30);
      ctx.fillStyle = 'rgba(197, 130, 62, 0.16)';
      ctx.fillRect(x - 94, 282 + shimmer, 8, 258);
      ctx.fillRect(x + 82, 282 + shimmer, 8, 258);
    } else if (transition.mask === 'ruined-arch') {
      ctx.strokeStyle = 'rgba(92, 59, 35, 0.78)';
      ctx.lineWidth = 42;
      ctx.beginPath();
      ctx.arc(x, 452, 138, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = 'rgba(84, 55, 35, 0.62)';
      ctx.fillRect(x - 168, 420, 56, 190);
      ctx.fillRect(x + 112, 420, 56, 190);
    } else if (transition.mask === 'shadowed-corridor') {
      const corridor = ctx.createLinearGradient(left, 0, left + w, 0);
      corridor.addColorStop(0, 'rgba(38, 27, 25, 0)');
      corridor.addColorStop(0.36, 'rgba(30, 22, 24, 0.5)');
      corridor.addColorStop(0.62, 'rgba(92, 60, 39, 0.4)');
      corridor.addColorStop(1, 'rgba(38, 27, 25, 0)');
      ctx.fillStyle = corridor;
      ctx.fillRect(left, 188, w, CANVAS_HEIGHT - 188);
      ctx.fillStyle = 'rgba(236, 181, 101, 0.18)';
      for (let i = 0; i < 14; i += 1) {
        const px = left + ((i * 71 + now * 0.012) % w);
        ctx.beginPath();
        ctx.ellipse(px, 310 + i * 19, 10 + (i % 3) * 4, 2.5, -0.18, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    return true;
  }, []);

  const drawDesertJourneyScenePanels = useCallback((ctx, current, cameraX, now) => {
    const panels = getDesertJourneyPanelsForViewport(cameraX, CANVAS_WIDTH, 160);
    if (panels.length === 0) return false;

    let layerDrawCount = 0;
    DESERT_JOURNEY_LAYER_ROLES.forEach((role) => {
      panels.forEach((panel) => {
        const layer = panel.layers.find(item => item.role === role);
        if (layer && drawDesertJourneyPanelLayer(ctx, panel, layer, cameraX, now)) {
          layerDrawCount += 1;
        }
      });
    });

    if (current.renderStats) {
      current.renderStats.desertJourneyBackgroundSystemVersion = DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION;
      current.renderStats.desertJourneyPanelIds = panels.map(panel => panel.id);
      current.renderStats.desertJourneyLayerRoles = DESERT_JOURNEY_LAYER_ROLES;
      current.renderStats.desertJourneyLayerDrawCount = layerDrawCount;
      current.renderStats.desertEntryPrimaryBackgroundPlateIds = DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_IDS;
    }

    return layerDrawCount > 0;
  }, [drawDesertJourneyPanelLayer]);

  const drawDesertJourneySceneMasks = useCallback((ctx, current, cameraX, now) => {
    const routeMasks = getDesertJourneyTransitionMasksForViewport(cameraX, CANVAS_WIDTH, 220);
    const plateMasks = DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_SEAM_MASKS.filter(mask => (
      isHorizontallyVisible(mask.worldX - mask.width / 2, mask.width, cameraX, 220)
    ));
    const masks = [...routeMasks, ...plateMasks];
    const drawnMasks = masks.filter(mask => drawDesertJourneyTransitionMask(ctx, mask, cameraX, now));

    if (current.renderStats) {
      current.renderStats.desertJourneyTransitionMasks = drawnMasks.map(mask => mask.mask);
      current.renderStats.desertEntryPrimaryBackgroundPlateSeamMasks = plateMasks.map(mask => mask.id);
    }

    return drawnMasks.length > 0;
  }, [drawDesertJourneyTransitionMask]);

  const drawDesertEntryPrimaryBackgroundPlates = useCallback((ctx, current, cameraX) => {
    const plates = getRenderableStoryProps(current)
      .filter(isDesertEntryRebuildBackgroundPlateProp)
      .filter(plate => !Number.isFinite(plate.alpha) || plate.alpha > 0)
      .sort((a, b) => {
        const indexA = DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_IDS.indexOf(a.id);
        const indexB = DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_IDS.indexOf(b.id);
        return (indexA - indexB) || ((a.x || 0) - (b.x || 0));
      });
    if (plates.length === 0) return false;

    const viewportCenterX = cameraX + CANVAS_WIDTH / 2;
    const plateEntries = plates.map((plate, index) => ({
      plate,
      index,
      centerX: Number.isFinite(plate.x) ? plate.x : 0,
      segmentLeft: index > 0
        ? (plates[index - 1].x + plate.x) / 2
        : DESERT_ENTRY_CONTINUOUS_BACKGROUND_START_X,
      segmentRight: index < plates.length - 1
        ? (plate.x + plates[index + 1].x) / 2
        : DESERT_ENTRY_CONTINUOUS_BACKGROUND_END_X,
      asset: getStandaloneImagePropAsset(plate),
    }));
    const pendingCount = plateEntries.filter(entry => !entry.asset?.loaded || !entry.asset.image).length;
    const activeEntry = plateEntries.find(entry => viewportCenterX >= entry.segmentLeft && viewportCenterX <= entry.segmentRight)
      || plateEntries.reduce((closest, entry) => {
        const closestDistance = Math.abs(viewportCenterX - closest.centerX);
        const entryDistance = Math.abs(viewportCenterX - entry.centerX);
        return entryDistance < closestDistance ? entry : closest;
      }, plateEntries[0]);

    const drawPlate = (entry) => {
      const { plate, asset, segmentLeft, segmentRight } = entry;
      if (!asset?.loaded || !asset.image) return false;
      const image = asset.image;
      const imageWidth = Number(image.naturalWidth || image.width) || Number(plate.width) || CANVAS_WIDTH;
      const imageHeight = Number(image.naturalHeight || image.height) || Number(plate.height) || CANVAS_HEIGHT;
      const scale = Math.max(CANVAS_WIDTH / imageWidth, CANVAS_HEIGHT / imageHeight);
      const drawWidth = imageWidth * scale;
      const drawHeight = imageHeight * scale;
      const segmentSpan = Math.max(1, segmentRight - segmentLeft);
      const panProgress = clamp((viewportCenterX - segmentLeft) / segmentSpan, 0, 1);
      const drawX = (CANVAS_WIDTH - drawWidth) * panProgress;
      const drawY = (CANVAS_HEIGHT - drawHeight) * 0.5;

      ctx.save();
      ctx.globalAlpha = 1;
      const colorGradeFilter = typeof plate.colorGradeFilter === 'string' ? plate.colorGradeFilter.trim() : '';
      const brightnessFilter = Number.isFinite(plate.brightness) && plate.brightness !== 1
        ? `brightness(${Math.round(clamp(plate.brightness, 0.4, 1.8) * 100)}%)`
        : '';
      const filter = [colorGradeFilter && colorGradeFilter !== 'none' ? colorGradeFilter : '', brightnessFilter]
        .filter(Boolean)
        .join(' ');
      if (filter) ctx.filter = filter;
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
      return true;
    };

    const drawn = drawPlate(activeEntry) ? 1 : 0;

    if (current.renderStats) {
      current.renderStats.desertEntryPrimaryBackgroundPlateMode = 'single-plate-camera-pan-primary-png-v3';
      current.renderStats.desertEntryPrimaryBackgroundPlateCount = drawn;
      current.renderStats.desertEntryPrimaryBackgroundPlatePendingCount = pendingCount;
      current.renderStats.desertEntryPrimaryBackgroundPlateActiveIds = drawn
        ? [activeEntry?.plate?.id].filter(Boolean)
        : [];
    }
    return drawn > 0;
  }, [getRenderableStoryProps, getStandaloneImagePropAsset]);

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
      drawDesertBackgroundLayer(ctx, assets, 'skyLayer', { y: 0, height: CANVAS_HEIGHT }, { ...layerOptions, parallax: 0.01, alpha: 1.0 }),
      // TODO: Uncomment when artists slice the China background properly
      // drawDesertBackgroundLayer(ctx, assets, 'farMountains', { y: 184, height: 228 }, { ...layerOptions, parallax: 0.06, alpha: 0.42 }),
      // drawDesertBackgroundLayer(ctx, assets, 'riverValley', { y: 258, height: 224 }, { ...layerOptions, parallax: 0.14, alpha: 0.46 }),
      // drawDesertBackgroundLayer(ctx, assets, 'watchtowerRidge', { y: 314, height: 236 }, { ...layerOptions, parallax: 0.24, alpha: 0.64 }),
    ];
    if (!drawn[0]) return false;

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
      return false;
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

  const drawForegroundDepthParticles = useCallback((ctx, now, cameraX) => {
    let particleCount = 0;
    ctx.save();
    for (let index = 0; index < 18; index += 1) {
      const drift = (now * (0.006 + (index % 5) * 0.0017) + cameraX * 0.035 + index * 91) % (CANVAS_WIDTH + 180);
      const x = drift - 90;
      const edgeWeight = Math.max(
        clamp(1 - x / 230, 0, 1),
        clamp((x - (CANVAS_WIDTH - 230)) / 230, 0, 1),
      );
      const y = GROUND_Y - 34 + (index % 4) * 11 + Math.sin(now / 900 + index) * 4;
      const alpha = (0.012 + edgeWeight * 0.014) * (index % 3 === 0 ? 1.15 : 1);
      ctx.fillStyle = `rgba(232, 205, 157, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 14 + (index % 4) * 6, 1.8 + (index % 3), -0.08, 0, Math.PI * 2);
      ctx.fill();
      particleCount += 1;
    }
    ctx.restore();
    return particleCount;
  }, []);

  const drawForegroundDepthLayer = useCallback((ctx, section, cameraX, now) => {
    if (backgroundPackId === 'china-river-valley' || section.id !== 'desert-entry') return false;
    const assets = foregroundDepthEnvironmentAssetsRef.current;
    let elementCount = 0;
    const drawRegion = (key, dest, alpha, options = {}) => {
      if (!assets?.loaded || assets.failed) return false;
      ctx.save();
      ctx.globalAlpha *= alpha;
      if (options.filter) ctx.filter = options.filter;
      const drawn = drawAtlasRegion(ctx, assets, key, dest, {
        mode: options.mode || 'contain',
        alignY: options.alignY || 'bottom',
      });
      ctx.restore();
      if (drawn) elementCount += 1;
      return drawn;
    };

    ctx.save();

    // ── Grounded ruin prop clusters scattered across the desert-entry world ──
    // Each cluster has a world-X position. We convert to screen-X and scale by
    // depth (smaller = further away) so clusters feel layered.  Only drawn when
    // they fall inside the visible viewport.
    const dustOffset = Math.sin(now / 1800 + cameraX * 0.002) * 18;
    drawRegion('lowDustVeil', {
      x: -72 + dustOffset,
      y: GROUND_Y - 34,
      width: CANVAS_WIDTH + 144,
      height: 72,
    }, 0.16, { mode: 'stretch' });
    drawRegion('softSandDrift', { x: -88, y: GROUND_Y - 24, width: 310, height: 58 }, 0.22, { mode: 'stretch' });
    drawRegion('softSandDrift', { x: CANVAS_WIDTH - 336, y: GROUND_Y - 28, width: 350, height: 62 }, 0.2, { mode: 'stretch' });
    drawRegion('rubbleClusterSmall', { x: -18, y: GROUND_Y - 34, width: 128, height: 54 }, 0.24);
    drawRegion('buriedCarvedHead', { x: -34, y: GROUND_Y - 62, width: 86, height: 72 }, 0.14);
    drawRegion('dryShrub', { x: CANVAS_WIDTH - 132, y: GROUND_Y - 68, width: 84, height: 76 }, 0.22);
    drawRegion('rubbleClusterLarge', { x: CANVAS_WIDTH - 250, y: GROUND_Y - 44, width: 214, height: 74 }, 0.26);
    drawRegion('edgePebbleScatter', { x: CANVAS_WIDTH - 370, y: GROUND_Y - 28, width: 318, height: 44 }, 0.24, { mode: 'stretch' });
    const particleCount = drawForegroundDepthParticles(ctx, now, cameraX);
    ctx.restore();

    if (stateRef.current.renderStats) {
      stateRef.current.renderStats.foregroundDepthLayerActive = elementCount > 0 || particleCount > 0;
      stateRef.current.renderStats.foregroundDepthLayerMode = FOREGROUND_DEPTH_LAYER_MODE;
      stateRef.current.renderStats.foregroundDepthAssetLoaded = Boolean(assets?.loaded);
      stateRef.current.renderStats.foregroundDepthElementCount = elementCount;
      stateRef.current.renderStats.foregroundDepthParticleCount = particleCount;
    }
    return elementCount > 0 || particleCount > 0;
  }, [backgroundPackId, drawForegroundDepthParticles]);

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

    ctx.restore();
  }, []);

  const drawRouteGate = useCallback((ctx, gate, screenX, current, complete, layer = 'base', doorway = null) => {
    if (gate.suppressRouteGateVisual) return;
    if (gate.hideArchVisual) {
      if (layer !== 'base' || complete) return;
      const cx = (doorway?.anchorX ? screenX : screenX + gate.width / 2);
      ctx.save();
      const sealedShadow = ctx.createRadialGradient(cx, GROUND_Y - 62, 12, cx, GROUND_Y - 62, 94);
      sealedShadow.addColorStop(0, 'rgba(70, 37, 13, 0.26)');
      sealedShadow.addColorStop(1, 'rgba(70, 37, 13, 0)');
      ctx.fillStyle = sealedShadow;
      ctx.beginPath();
      ctx.ellipse(cx, GROUND_Y - 58, 94, 62, 0, 0, Math.PI * 2);
      ctx.fill();
      const slabGradient = ctx.createLinearGradient(cx - 92, GROUND_Y - 288, cx + 92, GROUND_Y);
      slabGradient.addColorStop(0, '#d1a96b');
      slabGradient.addColorStop(0.56, '#927047');
      slabGradient.addColorStop(1, '#5f4327');
      ctx.fillStyle = slabGradient;
      ctx.strokeStyle = 'rgba(58, 35, 18, 0.62)';
      ctx.lineWidth = 2;
      ctx.fillRect(cx - 17, GROUND_Y - 274, 34, 274);
      ctx.strokeRect(cx - 17, GROUND_Y - 274, 34, 274);
      ctx.restore();
      return;
    }
    const gateCenter = doorway?.anchorX ? screenX : screenX + gate.width / 2;
    ctx.save();
    // Assets are 1024×682 (back/front) and 1024×637 (slab) — ratio ≈ 1.50:1.
    // Draw at natural aspect ratio to avoid squashing, and sink into ground by 20px
    // so the stone base sits flush rather than floating.
    const ASSET_RATIO = 1024 / 682; // ≈ 1.501
    const gateHeight = 340;
    const gateTop = placeGateOnGround(gateHeight) + 15; // +15 sinks base into ground line
    const backWidth = Math.round(gateHeight * ASSET_RATIO); // 510
    const frontWidth = Math.round((gateHeight + 20) * ASSET_RATIO); // 540
    const frontPillarPassageOffset = -Math.round(frontWidth * 0.37);
    const gateWidth = backWidth;

    const drawGateAsset = (ref, dest, options = {}) => {
      if (!ref.current.loaded || !ref.current.image) return false;
      ctx.save();
      ctx.globalAlpha *= options.alpha ?? 1;
      if (options.filter) ctx.filter = options.filter;
      if (options.flipX) {
        ctx.translate(dest.x + dest.width / 2, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(ref.current.image, -dest.width / 2, dest.y, dest.width, dest.height);
      } else {
        ctx.drawImage(ref.current.image, dest.x, dest.y, dest.width, dest.height);
      }
      ctx.restore();
      return true;
    };

    // 3/4 Perspective Layout — both assets are landscape (1024×682).
    // Back arch: left column + spanning lintel, centred on gateCenter.
    const backDest = {
      x: gateCenter - Math.round(backWidth / 2),
      y: gateTop,
      width: backWidth,   // 510
      height: gateHeight, // 340
    };
    // Front column: near foreground occluder, offset clear of the walk-through opening.
    const frontDest = {
      x: gateCenter - Math.round(frontWidth / 2) + frontPillarPassageOffset,
      y: gateTop - 8,     // slightly higher — closer to camera = taller
      width: frontWidth,  // 540
      height: gateHeight + 20, // 360
    };
    // Slab fills the arch opening when locked.
    const slabDest = doorway?.slab
      ? {
          x: gateCenter + doorway.slab.x,
          y: GROUND_Y + doorway.slab.y,
          width: doorway.slab.width,
          height: doorway.slab.height,
        }
      : {
          x: gateCenter - 105,
          y: gateTop + 52,
          width: 185,
          height: gateHeight - 42,
        };
    
    const drawFallbackArch = () => {
      const stone = ctx.createLinearGradient(gateCenter - gateWidth / 2, gateTop, gateCenter + gateWidth / 2, GROUND_Y);
      stone.addColorStop(0, complete ? '#d8c092' : '#b89768');
      stone.addColorStop(0.55, complete ? '#a98455' : '#806242');
      stone.addColorStop(1, '#4f3825');
      ctx.fillStyle = stone;
      ctx.strokeStyle = 'rgba(58, 35, 18, 0.76)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gateCenter - gateWidth * 0.42, GROUND_Y);
      ctx.lineTo(gateCenter - gateWidth * 0.42, gateTop + 54);
      ctx.quadraticCurveTo(gateCenter, gateTop - 14, gateCenter + gateWidth * 0.42, gateTop + 54);
      ctx.lineTo(gateCenter + gateWidth * 0.42, GROUND_Y);
      ctx.lineTo(gateCenter + gateWidth * 0.24, GROUND_Y);
      ctx.lineTo(gateCenter + gateWidth * 0.24, gateTop + 70);
      ctx.quadraticCurveTo(gateCenter, gateTop + 36, gateCenter - gateWidth * 0.24, gateTop + 70);
      ctx.lineTo(gateCenter - gateWidth * 0.24, GROUND_Y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    if (layer === 'foreground') {
      const archDrawn = drawGateAsset(routeGateFrontRef, frontDest, {
        alpha: 0.99,
        filter: 'sepia(2%) saturate(104%) brightness(108%) contrast(102%) drop-shadow(-8px 6px 12px rgba(46, 28, 12, 0.35))',
        flipX: true,
      });
      if (!archDrawn && complete) drawFallbackArch();
      ctx.restore();
      return;
    }

    drawContactShadow(ctx, gateCenter, GROUND_Y + 2, gateWidth * 0.9, complete ? 0.18 : 0.24, 1.15);
    drawDecorativeBaseBlend(ctx, gateCenter, GROUND_Y + 2, gateWidth * 0.86, getSectionForX(gate.x).id, 'midground', 0.74);

    if (complete) {
      const openGlow = ctx.createRadialGradient(gateCenter, GROUND_Y - 70, 8, gateCenter, GROUND_Y - 70, 104);
      openGlow.addColorStop(0, 'rgba(70, 217, 190, 0.2)');
      openGlow.addColorStop(0.42, 'rgba(250, 204, 21, 0.12)');
      openGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = openGlow;
      ctx.beginPath();
      ctx.ellipse(gateCenter, GROUND_Y - 70, 104, 74, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(26, 16, 9, 0.46)';
      ctx.beginPath();
      ctx.roundRect(gateCenter - 35, GROUND_Y - 115, 70, 108, 8);
      ctx.fill();
    } else {
      const sealedShadow = ctx.createRadialGradient(gateCenter, GROUND_Y - 62, 12, gateCenter, GROUND_Y - 62, 94);
      sealedShadow.addColorStop(0, 'rgba(70, 37, 13, 0.26)');
      sealedShadow.addColorStop(1, 'rgba(70, 37, 13, 0)');
      ctx.fillStyle = sealedShadow;
      ctx.beginPath();
      ctx.ellipse(gateCenter, GROUND_Y - 58, 94, 62, 0, 0, Math.PI * 2);
      ctx.fill();
      // Interior depth: dark recess behind/around the slab so it reads as set INTO
      // the arch rather than flush against a flat wall.
      const recess = ctx.createLinearGradient(slabDest.x, slabDest.y, slabDest.x + slabDest.width, slabDest.y);
      recess.addColorStop(0, 'rgba(20, 11, 5, 0.55)');
      recess.addColorStop(0.22, 'rgba(20, 11, 5, 0)');
      recess.addColorStop(0.78, 'rgba(20, 11, 5, 0)');
      recess.addColorStop(1, 'rgba(20, 11, 5, 0.55)');
      ctx.fillStyle = recess;
      ctx.fillRect(slabDest.x - 8, slabDest.y - 6, slabDest.width + 16, slabDest.height + 6);
      const slabDrawn = drawGateAsset(routeGateSlabRef, slabDest, {
        alpha: 0.98,
        filter: 'sepia(3%) saturate(96%) brightness(95%) contrast(104%)',
      });
      if (!slabDrawn) {
        const slabGradient = ctx.createLinearGradient(slabDest.x, slabDest.y, slabDest.x + slabDest.width, slabDest.y + slabDest.height);
        slabGradient.addColorStop(0, '#d1a96b');
        slabGradient.addColorStop(0.56, '#927047');
        slabGradient.addColorStop(1, '#5f4327');
        ctx.fillStyle = slabGradient;
        ctx.strokeStyle = 'rgba(58, 35, 18, 0.62)';
        ctx.lineWidth = 2;
        ctx.fillRect(slabDest.x, slabDest.y, slabDest.width, slabDest.height);
        ctx.strokeRect(slabDest.x, slabDest.y, slabDest.width, slabDest.height);
      }
      // Active-checkpoint signal: a warm sealed-energy light shaft rising from the
      // opening, gently pulsing so the gate reads as "break the seal", not set dressing.
      const seam = gateCenter;
      const pulse = Math.sin(performance.now() / 620) * 0.5 + 0.5; // 0..1
      const shaftTop = slabDest.y + 6;
      const shaftBottom = slabDest.y + slabDest.height;
      const shaft = ctx.createLinearGradient(seam, shaftBottom, seam, shaftTop);
      shaft.addColorStop(0, `rgba(250, 196, 84, ${0.12 + pulse * 0.16})`);
      shaft.addColorStop(0.5, `rgba(252, 211, 110, ${0.07 + pulse * 0.1})`);
      shaft.addColorStop(1, 'rgba(252, 211, 110, 0)');
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const shaftWidth = 30 + pulse * 8;
      ctx.fillStyle = shaft;
      ctx.fillRect(seam - shaftWidth / 2, shaftTop, shaftWidth, shaftBottom - shaftTop);
      const seamGlow = ctx.createRadialGradient(seam, shaftTop + 18, 4, seam, shaftTop + 18, 46 + pulse * 10);
      seamGlow.addColorStop(0, `rgba(255, 224, 140, ${0.22 + pulse * 0.18})`);
      seamGlow.addColorStop(1, 'rgba(255, 224, 140, 0)');
      ctx.fillStyle = seamGlow;
      ctx.beginPath();
      ctx.ellipse(seam, shaftTop + 18, 40 + pulse * 8, 56 + pulse * 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const archBackDrawn = drawGateAsset(routeGateBackRef, backDest, {
      alpha: 0.96,
      filter: 'sepia(5%) saturate(94%) brightness(94%) contrast(106%) drop-shadow(0 6px 8px rgba(46, 28, 12, 0.3))',
      flipX: true,
    });
    if (!archBackDrawn && !complete) drawFallbackArch();

    drawGroundDustLip(ctx, gateCenter, GROUND_Y + 1, gateWidth * 0.82, 'rgba(184, 116, 52, 0.22)');
    if (current.renderStats) current.renderStats.groundedPropCount += 1;
    ctx.restore();
  }, []);

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

  const drawHazardBurialCover = useCallback((ctx, centerX, footY, width, burial, sectionId) => {
    if (burial <= 0) return;
    const coverHeight = Math.max(5, width * (0.04 + burial * 0.08));
    const coverWidth = width * (0.92 + burial * 0.34);
    const isCatacombs = sectionId === 'catacombs';

    ctx.save();
    ctx.globalAlpha = 0.42 + burial * 0.32;
    const sand = ctx.createLinearGradient(0, footY - coverHeight * 1.6, 0, footY + coverHeight * 0.95);
    sand.addColorStop(0, isCatacombs ? 'rgba(110, 86, 56, 0)' : 'rgba(233, 181, 96, 0)');
    sand.addColorStop(0.46, isCatacombs ? 'rgba(107, 84, 57, 0.48)' : 'rgba(214, 149, 69, 0.54)');
    sand.addColorStop(1, isCatacombs ? 'rgba(52, 39, 28, 0.5)' : 'rgba(124, 70, 29, 0.5)');
    ctx.fillStyle = sand;
    ctx.beginPath();
    ctx.ellipse(centerX, footY - coverHeight * 0.18, coverWidth / 2, coverHeight, -0.03, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.3 + burial * 0.22;
    ctx.strokeStyle = isCatacombs ? 'rgba(170, 135, 86, 0.32)' : 'rgba(250, 203, 119, 0.36)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(centerX - coverWidth * 0.38, footY - coverHeight * 0.48);
    ctx.quadraticCurveTo(centerX - coverWidth * 0.08, footY + coverHeight * 0.14, centerX + coverWidth * 0.24, footY - coverHeight * 0.18);
    ctx.quadraticCurveTo(centerX + coverWidth * 0.36, footY - coverHeight * 0.36, centerX + coverWidth * 0.45, footY - coverHeight * 0.04);
    ctx.stroke();
    ctx.restore();
  }, []);

  const drawHazard = useCallback((ctx, hazard, cameraX, current, now) => {
    const hx = worldToScreenX(hazard.x, cameraX);
    if (!isHorizontallyVisible(hazard.x, hazard.width, cameraX, 50)) return;

    const trapRuntime = current.trapStates?.[hazard.id] || {};
    const reusableTrap = isReusableJourneyTrap(hazard) ? normalizeJourneyTrap(hazard) : null;
    const trapPhase = trapRuntime.phase || 'armed';
    const visualHazardId = reusableTrap?.type === 'hidden-sand-pit' && trapPhase === 'revealed'
      ? 'dark-gap'
      : getHazardVisualId(hazard);
    const visual = HAZARD_VISUALS[visualHazardId] || getHazardVisualConfig(hazard);
    const shakeY = reusableTrap?.type === 'collapsing-stone-floor' && trapPhase === 'shaking'
      ? Math.sin(now / 22) * 2
      : 0;
    const baseY = hazard.y + shakeY;
    const section = getSectionForX(hazard.x);
    const grounding = getHazardGroundingConfig(hazard);
    const centerX = hx + hazard.width / 2;
    const footY = baseY + hazard.height;
    const dustWidth = hazard.width * (grounding.dustWidth || 0.9);
    const burial = getHazardBurialAmount(hazard);
    const hazardAlpha = Number.isFinite(hazard.alpha) ? clamp(hazard.alpha, 0, 1) : 1;
    const hazardFilterBase = hazard.colorGradeFilter || grounding.filter || 'none';
    const hazardFilter = Number.isFinite(hazard.brightness) && hazard.brightness !== 1
      ? `${hazardFilterBase && hazardFilterBase !== 'none' ? `${hazardFilterBase} ` : ''}brightness(${Math.round(clamp(hazard.brightness, 0.4, 1.8) * 100)}%)`
      : hazardFilterBase;

    ctx.save();
    ctx.globalAlpha *= hazardAlpha;
    if (reusableTrap?.type === 'dart-launcher') {
      const launcherX = worldToScreenX(reusableTrap.launcherX, cameraX);
      const launcherY = reusableTrap.launcherY;
      ctx.save();
      ctx.fillStyle = 'rgba(37, 25, 17, 0.82)';
      ctx.strokeStyle = 'rgba(180, 137, 76, 0.72)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(launcherX - 16, launcherY - 13, 32, 26, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(8, 13, 22, 0.9)';
      ctx.beginPath();
      ctx.ellipse(launcherX, launcherY, reusableTrap.direction === 'up' || reusableTrap.direction === 'down' ? 5 : 10, reusableTrap.direction === 'up' || reusableTrap.direction === 'down' ? 10 : 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (reusableTrap?.type === 'collapsing-stone-floor' && trapPhase === 'collapsed') {
      ctx.globalAlpha = 0.9;
    }
    const hazardAssetKey = getEnvironmentAssetKeyForHazard(hazard, environmentAssetsRef.current.packId);
    const hazardDest = {
      x: hx - grounding.xPad,
      y: baseY - grounding.yOffset,
      width: hazard.width + grounding.widthPad,
      height: Math.max(12, hazard.height + grounding.heightPad),
    };
    const decalDescriptor = reusableTrap?.type === 'hidden-sand-pit' && trapPhase === 'revealed'
      ? null
      : getEgyptHazardDecalDescriptor(hazard);
    const decalDest = decalDescriptor
      ? getEgyptHazardDecalDest(hazard, hx, footY, decalDescriptor.regionKey)
      : hazardDest;
    if (visualHazardId === 'spike-trap' && current.lastHazardHit?.id === hazard.id && current.hazardCooldown > 0.4) {
      decalDest.y -= 18;
    }
    if (visualHazardId !== 'bat-cloud' && visualHazardId !== 'dust-wave') {
      drawContactShadow(ctx, centerX, footY + 3, hazard.width * 0.92, grounding.shadow, 0.9);
    }
    if (dustWidth > 0) {
      drawGroundDustLip(ctx, centerX, footY + 1, dustWidth, 'rgba(122, 78, 37, 0.16)');
    }
    if (decalDescriptor) {
      const decalDrawn = drawOpeningHazardDecalRegion(ctx, decalDescriptor, decalDest, {
        alpha: 0.94 * hazardAlpha,
        filter: hazardFilter,
        ...(visualHazardId === 'spike-trap' ? { cropBottomRatio: 0.56, alignY: 'bottom' } : {}),
      });
      if (decalDrawn) {
        if (dustWidth > 0) {
          const apronIntensity = visualHazardId === 'spike-trap'
            ? 1.08
            : visualHazardId === 'sand-pit' || visualHazardId === 'dark-gap'
              ? 1.2
              : 0.82;
          drawGroundDustLip(ctx, centerX, footY + 2, dustWidth * 0.9, visualHazardId === 'spike-trap' ? 'rgba(209, 143, 72, 0.32)' : 'rgba(209, 143, 72, 0.24)');
          drawHazardGroundApron(ctx, centerX, footY + 4, dustWidth, section.id, apronIntensity);
        }
        drawHazardBurialCover(ctx, centerX, footY, dustWidth, burial, section.id);
        ctx.restore();
        return;
      }
    }
    ctx.save();
    ctx.filter = hazardFilter;
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
        const apronIntensity = visualHazardId === 'spike-trap'
          ? 1.08
          : visualHazardId === 'sand-pit' || visualHazardId === 'dark-gap'
            ? 1.2
            : 0.82;
        drawGroundDustLip(ctx, centerX, footY + 2, dustWidth * 0.9, visualHazardId === 'spike-trap' ? 'rgba(209, 143, 72, 0.32)' : 'rgba(209, 143, 72, 0.24)');
        drawHazardGroundApron(ctx, centerX, footY + 4, dustWidth, section.id, apronIntensity);
      }
      drawHazardBurialCover(ctx, centerX, footY, dustWidth, burial, section.id);
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
      drawHazardBurialCover(ctx, centerX, footY, dustWidth, burial, section.id);
    }
    ctx.restore();
  }, [drawHazardBurialCover, drawOpeningHazardDecalRegion]);

  const drawTrapProjectile = useCallback((ctx, projectile, cameraX) => {
    const x = worldToScreenX(projectile.x, cameraX);
    if (x > CANVAS_WIDTH + 80 || x + projectile.width < -80) return;
    ctx.save();
    ctx.translate(x + projectile.width / 2, projectile.y + projectile.height / 2);
    if (projectile.direction === 'up') ctx.rotate(-Math.PI / 2);
    if (projectile.direction === 'down') ctx.rotate(Math.PI / 2);
    if (projectile.direction === 'left') ctx.rotate(Math.PI);
    ctx.fillStyle = '#4b3424';
    ctx.strokeStyle = 'rgba(250, 204, 142, 0.72)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-projectile.width / 2, -3);
    ctx.lineTo(projectile.width / 2, 0);
    ctx.lineTo(-projectile.width / 2, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }, []);

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
    const bodyPose = getEnemyBodyLanguagePose(enemy, combatMode);
    // sandWisp uses a fixed width from drawBox so frame aspect-ratio differences
    // don't cause visible size jumps between idle, windup, and attack frames.
    const atlasAdjustedWidth = (family === 'sandWisp' || family === 'vestibuleWisp')
      ? drawBox.width
      : Math.max(drawBox.width, drawBox.height * (atlasRegion.w / Math.max(1, atlasRegion.h)));
    const groundedDrawBox = atlasRegion
      ? {
        ...drawBox,
        x: centerX - atlasAdjustedWidth / 2,
        width: atlasAdjustedWidth,
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
      ctx.filter = 'brightness(1.1) saturate(0.62)';
    } else if (family === 'bat') {
      ctx.filter = 'brightness(1.12) contrast(1.08)';
    }

    if (shouldFlip) {
      ctx.translate(groundedDrawBox.x + groundedDrawBox.width / 2 + bodyPose.offsetX, groundedDrawBox.y + groundedDrawBox.height + bodyPose.offsetY);
      ctx.rotate(bodyPose.rotation);
      ctx.scale(-bodyPose.scaleX, bodyPose.scaleY);
    } else {
      ctx.translate(groundedDrawBox.x + groundedDrawBox.width / 2 + bodyPose.offsetX, groundedDrawBox.y + groundedDrawBox.height + bodyPose.offsetY);
      ctx.rotate(bodyPose.rotation);
      ctx.scale(bodyPose.scaleX, bodyPose.scaleY);
    }
    if (enemy.hitFlash > 0 && !enemy.defeated) {
      const hitT = Math.min(1, enemy.hitFlash / 0.18);
      ctx.scale(1 - hitT * 0.20, 1 + hitT * 0.16);
    }

    if (combatMode === 'cooldown' && (family === 'scarab' || family === 'scorpion')) {
      ctx.globalAlpha = 0.42;
      ctx.fillStyle = 'rgba(136, 82, 36, 0.24)';
      ctx.beginPath();
      ctx.ellipse(0, 4, groundedDrawBox.width * 0.22, 3.5, bodyPose.rotation * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const drawn = drawAtlasRegion(
      ctx,
      spritePack,
      frameKey,
      {
        x: -groundedDrawBox.width / 2,
        y: -groundedDrawBox.height,
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
  }, [getCombatMode]);

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
        ctx.strokeStyle = stunned ? 'rgba(210, 195, 172, 0.9)' : '#4a2b12';
        ctx.lineWidth = 2;
        const shell = ctx.createLinearGradient(centerX, bodyY - 16, centerX, bodyY + 11);
        shell.addColorStop(0, stunned ? '#c8a87a' : '#b77932');
        shell.addColorStop(0.48, stunned ? '#8a5e28' : '#7c3f16');
        shell.addColorStop(1, '#3f2411');
        ctx.fillStyle = shell;
        ctx.beginPath();
        ctx.ellipse(centerX, bodyY, enemy.width * 0.68, enemy.height * 0.42 + shellPulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = stunned ? 'rgba(220, 210, 190, 0.85)' : 'rgba(146, 64, 14, 0.9)';
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
        ctx.strokeStyle = stunned ? 'rgba(200, 188, 168, 0.88)' : '#4d7c0f';
        ctx.fillStyle = stunned ? '#4a6028' : '#365314';
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
        const bodyY = baseY - 13 + (defeated ? 6 : 0);
        const slowPulse = Math.sin(now / 360) * 0.5 + 0.5;
        const fastPulse = Math.sin(now / 110) * 0.5 + 0.5;
        const walkCycle = Math.sin(now / 165);
        const isWindup = combatMode === 'windup';
        const isAttacking = combatMode === 'attacking';
        const isCooldown = combatMode === 'cooldown';
        const isVenomAttack = enemy.attackPattern === 'venom-spit';

        drawContactShadow(ctx, centerX, baseY + 3, enemy.width * (defeated ? 0.55 : 0.78), defeated ? 0.08 : 0.18, 0.9);
        ctx.globalAlpha = defeated ? 0.52 : 0.96;

        // abdomen — scales with breath in idle, squashes during attack
        const abdomenSx = isAttacking ? 0.94 : isWindup ? 1.06 : 1 + slowPulse * 0.025;
        const abdomenSy = isAttacking ? 1.06 : isWindup ? 0.94 : 1;
        const bodyOffsetY = isWindup ? -2 : isAttacking ? 1 : isCooldown ? 3 : stunned ? 2 : 0;
        ctx.strokeStyle = stunned ? 'rgba(210, 190, 165, 0.88)' : '#7c2d12';
        ctx.fillStyle = stunned ? '#8a6535' : '#a16207';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(centerX, bodyY + bodyOffsetY, enemy.width * 0.38 * abdomenSx, enemy.height * 0.34 * abdomenSy, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // cephalothorax (head) — lunges forward on attack
        const headShift = isAttacking ? facing * 3 : isWindup ? -facing * 1 : 0;
        ctx.fillStyle = stunned ? '#6b4e28' : '#78350f';
        ctx.beginPath();
        ctx.ellipse(centerX + facing * enemy.width * 0.27 + headShift, bodyY - 2 + bodyOffsetY, enemy.width * 0.18, enemy.height * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // pincers — spread wider on attack
        const pinchSpread = isAttacking ? 7 : isWindup ? 5 : 3.5;
        const pinchBaseX = centerX + facing * enemy.width * 0.42 + headShift;
        ctx.strokeStyle = stunned ? 'rgba(160, 130, 90, 0.8)' : '#6b2d0e';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(pinchBaseX - facing * 2, bodyY - 4 + bodyOffsetY);
        ctx.lineTo(pinchBaseX + facing * 5, bodyY - 4 - pinchSpread * 0.55 + bodyOffsetY);
        ctx.moveTo(pinchBaseX - facing * 2, bodyY + bodyOffsetY);
        ctx.lineTo(pinchBaseX + facing * 5, bodyY + pinchSpread * 0.45 + bodyOffsetY);
        ctx.stroke();

        // legs — 3 pairs, curved, animate during walking; splay on windup, tuck on defeat
        ctx.strokeStyle = stunned ? 'rgba(160, 130, 90, 0.75)' : '#92400e';
        ctx.lineWidth = 1.3;
        const legSplay = isCooldown ? 1.18 : isWindup ? 1.08 : isAttacking ? 0.86 : defeated ? 0.7 : 1;
        const legLen = enemy.width * 0.38 * legSplay;
        const walkAnim = (isAttacking || isWindup || isCooldown || stunned || defeated) ? 0 : walkCycle * 3;
        for (let i = -1; i <= 1; i += 1) {
          const wave = i * walkAnim;
          const tipY = defeated ? bodyY + 10 : bodyY + i * 5.5 + 5 + bodyOffsetY;
          ctx.beginPath();
          ctx.moveTo(centerX - enemy.width * 0.08, bodyY + i * 3 + bodyOffsetY);
          ctx.quadraticCurveTo(centerX - enemy.width * 0.22, bodyY + i * 4 + 5 + bodyOffsetY, centerX - legLen, tipY + wave);
          ctx.moveTo(centerX + enemy.width * 0.08, bodyY + i * 3 + bodyOffsetY);
          ctx.quadraticCurveTo(centerX + enemy.width * 0.22, bodyY + i * 4 + 5 + bodyOffsetY, centerX + legLen, tipY - wave);
          ctx.stroke();
        }

        // tail — dramatically state-aware
        let tailCpX, tailCpY, tailTipX, tailTipY;
        const tailBaseX = centerX - facing * enemy.width * 0.22;
        const tailBaseY = bodyY - 8 + bodyOffsetY;
        if (defeated) {
          tailCpX = centerX - facing * enemy.width * 0.12; tailCpY = bodyY + 4;
          tailTipX = centerX - facing * enemy.width * 0.28; tailTipY = bodyY + 10;
        } else if (isWindup) {
          tailCpX = centerX - facing * enemy.width * 0.42; tailCpY = bodyY - 42;
          tailTipX = centerX - facing * enemy.width * 0.04; tailTipY = bodyY - 44 - fastPulse * 2;
        } else if (isAttacking) {
          tailCpX = centerX - facing * enemy.width * 0.08; tailCpY = bodyY - 16;
          tailTipX = centerX + facing * enemy.width * 0.24; tailTipY = bodyY - 20;
        } else if (isCooldown) {
          tailCpX = centerX - facing * enemy.width * 0.3; tailCpY = bodyY - 6;
          tailTipX = centerX - facing * enemy.width * 0.06; tailTipY = bodyY - 7 + slowPulse * 2;
        } else if (stunned) {
          tailCpX = centerX - facing * enemy.width * 0.22; tailCpY = bodyY - 10;
          tailTipX = centerX - facing * enemy.width * 0.04; tailTipY = bodyY - 12;
        } else {
          tailCpX = centerX - facing * enemy.width * 0.36; tailCpY = bodyY - 24;
          tailTipX = centerX - facing * enemy.width * 0.05; tailTipY = bodyY - 26 - slowPulse * 2.5;
        }
        ctx.strokeStyle = stunned ? 'rgba(175, 145, 105, 0.78)' : '#92400e';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tailBaseX, tailBaseY);
        ctx.quadraticCurveTo(tailCpX, tailCpY, tailTipX, tailTipY);
        ctx.stroke();

        // stinger — glows amber during venom windup/attack
        const stingerGlowing = (isWindup || isAttacking) && isVenomAttack;
        const stingerR = stingerGlowing ? 4.2 + fastPulse * 1.5 : defeated ? 2.2 : 3.2;
        if (stingerGlowing) {
          ctx.shadowColor = 'rgba(110, 52, 12, 0.75)';
          ctx.shadowBlur = 7 + fastPulse * 4;
        }
        ctx.fillStyle = stingerGlowing
          ? `rgba(${Math.round(175 + fastPulse * 35)}, 72, 18, 0.92)`
          : stunned ? '#7a5530' : '#c2410c';
        ctx.beginPath();
        ctx.arc(tailTipX, tailTipY, stingerR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        const floatY = centerX % 2 === 0 ? baseY - 33 - pulse * 5 : baseY - 31 - pulse * 5;
        drawContactShadow(ctx, centerX, baseY + 4, enemy.width * 0.66, defeated ? 0.06 : 0.12, 0.65);
        ctx.globalAlpha = defeated ? 0.42 : 0.86;
        const glow = ctx.createRadialGradient(centerX, floatY, 2, centerX, floatY, enemy.width * 0.55);
        glow.addColorStop(0, stunned ? 'rgba(235, 222, 200, 0.88)' : 'rgba(253, 224, 71, 0.9)');
        glow.addColorStop(0.55, 'rgba(251, 191, 36, 0.35)');
        glow.addColorStop(1, 'rgba(180, 83, 9, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(centerX, floatY, enemy.width * 0.58, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = stunned ? 'rgba(210, 198, 178, 0.88)' : '#facc15';
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
      if (enemy.hitFlash > 0 && !enemy.defeated) {
        const hitT = Math.min(1, enemy.hitFlash / 0.18);
        const pivotX = drawBox.x + drawBox.width / 2;
        const pivotY = drawBox.y + drawBox.height * 0.5;
        ctx.translate(pivotX, pivotY);
        ctx.scale(1 - hitT * 0.18, 1 + hitT * 0.14);
        ctx.translate(-pivotX, -pivotY);
      }
      if (enemy.defeated) ctx.globalAlpha = 0.82;
      if (enemy.hitFlash > 0) ctx.filter = 'brightness(1.1) saturate(0.62)';
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
  }, [getCombatMode]);

  const drawScarabQueenLairOpeningProp = useCallback((ctx, worldCenterX, cameraX, now, beat = null, placement = null) => {
    const screenX = worldToScreenX(worldCenterX, cameraX);
    if (screenX < -260 || screenX > CANVAS_WIDTH + 260) return false;

    const crack = beat?.buriedSealCrack || 0;
    const glowStrength = beat?.glyphGlow || 0;
    const eruption = beat?.sandEruption || 0;
    const rise = beat?.queenRise || 0;
    const asset = scarabQueenLairOpeningImageRef.current;
    const baseWidth = Math.max(1, Number(placement?.width) || 500);
    const width = baseWidth + crack * 64;
    const baseHeight = Math.max(1, Number(placement?.height) || baseWidth * (330 / 980));
    const height = baseHeight * (width / baseWidth);
    const groundY = Number.isFinite(placement?.y) ? placement.y : GROUND_Y + 6;
    const drawX = screenX - width / 2;
    const drawY = groundY - height;
    const pulse = 0.82 + Math.sin(now / 150) * 0.12;

    ctx.save();
    drawContactShadow(ctx, screenX, groundY - 2, width * 0.82, 0.2 + crack * 0.1, 1.1);
    if (glowStrength > 0) {
      const glow = ctx.createRadialGradient(screenX, groundY - 42, 10, screenX, groundY - 42, 132 + glowStrength * 112);
      glow.addColorStop(0, `rgba(45, 212, 191, ${0.2 + glowStrength * 0.2})`);
      glow.addColorStop(0.36, `rgba(250, 204, 21, ${0.1 + glowStrength * 0.22})`);
      glow.addColorStop(1, 'rgba(120, 53, 15, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(screenX, groundY - 42, (132 + glowStrength * 92) * pulse, (48 + glowStrength * 34) * pulse, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (asset.loaded && asset.image) {
      ctx.globalAlpha = 0.98;
      ctx.drawImage(asset.image, drawX, drawY, width, height);
    } else {
      ctx.fillStyle = '#b7793b';
      ctx.beginPath();
      ctx.ellipse(screenX, groundY - 24, width / 2, height * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d6a642';
      ctx.beginPath();
      ctx.ellipse(screenX, groundY - 38, width * 0.24, height * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (crack > 0) {
      ctx.strokeStyle = `rgba(255, 244, 196, ${0.18 + glowStrength * 0.42})`;
      ctx.lineWidth = 1.4 + crack * 1.2;
      [-1, 1, 0].forEach((side, index) => {
        ctx.beginPath();
        const startX = screenX + side * (18 + index * 12);
        ctx.moveTo(startX, groundY - 44);
        ctx.lineTo(startX + side * (24 + crack * 22), groundY - 31 + index * 5);
        ctx.lineTo(startX + side * (44 + crack * 34), groundY - 20 + index * 2);
        ctx.stroke();
      });
    }

    if (eruption > 0) {
      ctx.fillStyle = `rgba(202, 138, 62, ${0.22 + eruption * 0.32})`;
      for (let index = 0; index < 26; index += 1) {
        const side = index % 2 ? 1 : -1;
        const spread = 16 + (index % 7) * 13 + eruption * 64;
        const lift = (18 + (index % 5) * 11) * eruption + Math.sin(now / 95 + index) * 3;
        ctx.beginPath();
        ctx.arc(
          screenX + side * spread * (0.28 + eruption * 0.72),
          groundY - 14 - lift,
          1.8 + (index % 3) * 0.7 + eruption * 1.8,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      drawGroundDustLip(ctx, screenX, groundY - 5, width * (0.82 + eruption * 0.36), `rgba(202, 138, 62, ${0.2 + eruption * 0.34})`);
    }

    if (rise > 0 && rise < 0.96) {
      ctx.fillStyle = `rgba(12, 8, 6, ${0.38 * (1 - rise)})`;
      ctx.beginPath();
      ctx.ellipse(screenX, groundY - 40, width * (0.22 + rise * 0.12), 28 + rise * 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return true;
  }, []);

  const drawBossSprite = useCallback((ctx, boss, screenX, now, bossVisualState) => {
    const spriteBossId = boss.spriteBossId || boss.id;
    const isChinaGuardianBoss = isChinaGuardianBossSpriteId(spriteBossId);
    const isRomeGuardianBoss = isRomeBossSpriteId(spriteBossId);
    const supportedBoss = isRomeGuardianBoss
      || isChinaGuardianBoss
      || boss.id === 'scarab-queen'
      || boss.id === 'temple-guardian'
      || boss.id === 'giant-serpent'
      || boss.id === 'ancient-construct';
    if (!supportedBoss) return false;
    const combatMode = getCombatMode(boss);
    const frameKey = isRomeGuardianBoss
      ? getLegateRevenantSpriteFrame(boss, combatMode, bossVisualState, now)
      : isChinaGuardianBoss
        ? getClayGuardianSpriteFrame(boss, combatMode, bossVisualState, now)
        : boss.id === 'ancient-construct'
          ? getAncientConstructSpriteFrame(boss, combatMode, bossVisualState, now)
          : boss.id === 'temple-guardian'
            ? getStoneGuardianSpriteFrame(boss, combatMode, bossVisualState, now)
            : boss.id === 'giant-serpent'
              ? getGiantSerpentSpriteFrame(boss, combatMode, bossVisualState, now)
              : getScarabQueenSpriteFrame(boss, combatMode, bossVisualState, now);
    let drawBox = isRomeGuardianBoss
      ? getLegateRevenantDrawBox(boss, screenX)
      : isChinaGuardianBoss
        ? getClayGuardianDrawBox(boss, screenX)
        : boss.id === 'ancient-construct'
          ? getAncientConstructDrawBox(boss, screenX)
          : boss.id === 'temple-guardian'
            ? getStoneGuardianDrawBox(boss, screenX)
            : boss.id === 'giant-serpent'
              ? getGiantSerpentDrawBox(boss, screenX)
              : getScarabQueenDrawBox(boss, screenX);
    const pack = isRomeGuardianBoss
      ? getRomeBossSpritePack(bossSpriteAssetsRef.current, spriteBossId)
      : getBossSpritePack(bossSpriteAssetsRef.current, spriteBossId);
    if (!frameKey || !drawBox || !pack) return false;
    if (boss.id === 'scarab-queen') {
      const visibleX = clamp(drawBox.x, 18, CANVAS_WIDTH - drawBox.width - 118);
      drawBox = { ...drawBox, x: visibleX };
    }

    const facing = (boss.attackTimer > 0 || boss.attackWindup > 0)
      ? boss.attackDirection
      : boss.direction;
    const shouldFlip = shouldFlipBossSprite(spriteBossId, facing);
    const centerX = screenX + boss.width / 2;
    const baseY = boss.y + boss.height;
    if (boss.id === 'scarab-queen' && bossVisualState?.buriedSandEmergence && bossVisualState.cinematicBeat?.queenRise <= 0) return false;

    const cinematicReveal = boss.id === 'scarab-queen' && bossVisualState?.cinematicBeat
      ? bossVisualState.cinematicBeat.queenRise
      : 1;
    const cinematicLift = boss.id === 'scarab-queen' && bossVisualState?.buriedSandEmergence
      ? (1 - cinematicReveal) * 118
      : 0;
    const cinematicPulse = boss.id === 'scarab-queen' && bossVisualState?.cinematicBeat
      ? Math.sin(now / 78) * 0.035 * bossVisualState.cinematicBeat.finalHold
      : 0;
    const visualScale = (boss.visualScale || 1) * (boss.id === 'scarab-queen' && bossVisualState?.buriedSandEmergence
      ? 0.86 + cinematicReveal * 0.14 + cinematicPulse
      : 1);

    ctx.save();
    if (boss.id === 'scarab-queen' && bossVisualState?.buriedSandEmergence) {
      ctx.globalAlpha = clamp(0.35 + cinematicReveal * 0.65, 0.35, 1);
      ctx.translate(0, cinematicLift);
      if (cinematicReveal < 1) {
        ctx.filter = `brightness(${0.82 + cinematicReveal * 0.42}) saturate(${0.72 + cinematicReveal * 0.5})`;
      }
    }
    if (visualScale !== 1) {
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
  }, [getCombatMode]);

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
    const introActive = stateRef.current.bossIntro?.id === boss.id;
    const activeBossDomain = stateRef.current.bossDomain?.bossId === boss.id ? stateRef.current.bossDomain : null;
    const introProgress = introActive
      ? Math.min(1, stateRef.current.bossIntroTimer / (activeBossDomain?.introSeconds || 3.2))
      : 0;
    const buriedSandEmergenceActive = Boolean(activeBossDomain?.buriedSandEmergence && introActive);
    const bossVisualState = {
      ...getBossVulnerabilityState(boss),
      introActive,
      buriedSandEmergence: buriedSandEmergenceActive,
      cinematicBeat: buriedSandEmergenceActive ? getScarabQueenEmergenceBeat(introProgress) : null,
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

    if (introActive) {
      ctx.restore();
      return;
    }

    const visibleBox = getBossVisibleDrawBox(boss, screenX);
    const healthCenterX = boss.awakened ? CANVAS_WIDTH / 2 : visibleBox.x + visibleBox.width / 2;
    const barWidth = boss.awakened ? Math.min(390, CANVAS_WIDTH - 120) : Math.max(boss.width + 20, visibleBox.width * 0.55);
    const barHeight = boss.awakened ? 10 : 8;
    const barX = clamp(healthCenterX - barWidth / 2, 18, CANVAS_WIDTH - barWidth - 18);
    const barY = boss.awakened ? 18 : Math.max(18, visibleBox.y - 16);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 5);
    ctx.fill();
    ctx.fillStyle = boss.awakened ? '#dc2626' : '#b45309';
    ctx.beginPath();
    ctx.roundRect(barX, barY, (boss.health / boss.maxHealth) * barWidth, barHeight, 5);
    ctx.fill();

    ctx.restore();
  }, [drawBossSprite, drawSmallEnemySprite, getBossVisibleDrawBox, getBossVulnerabilityState]);

  const drawAttackArc = useCallback(() => {}, []);

  const drawEnemyAttackTell = useCallback((ctx, enemy, screenX, cameraX, now, boss = false) => {
    if (boss || enemy.defeated) return;
    const pattern = getEnemyPatternConfig(enemy);
    const direction = enemy.attackDirection || enemy.direction || 1;
    const attackBox = getAttackBox(
      enemy,
      pattern.range,
      pattern.height,
      direction,
      pattern.yOffset || 0,
      pattern.backReach || 0,
    );
    const tellActive = enemy.attackWindup > 0;
    const attackActive = enemy.attackTimer > 0;
    const recoveryActive = enemy.attackRecovery > 0 || enemy.vulnerabilityTimer > 0;
    if (!tellActive && !attackActive && !recoveryActive) return;

    const telegraph = getEnemyAttackTelegraph(enemy, HEAVY_ATTACK_PATTERNS);
    const boxX = attackBox.x - cameraX;
    const centerX = screenX + enemy.width / 2 - direction * 4;
    const footY = enemy.y + enemy.height + 4;
    const pulse = 0.72 + Math.sin(now / 90) * 0.18;
    const recoveryGoldPulse = 0.46 + Math.sin(now / 125) * 0.16;
    ctx.save();
    ctx.lineWidth = 1.5;
    if (recoveryActive) {
      // Gold punish-window cue: the enemy is open — strike now.
      ctx.globalAlpha = 0.18 + recoveryGoldPulse * 0.07;
      ctx.fillStyle = 'rgba(110, 68, 28, 0.28)';
      ctx.beginPath();
      ctx.ellipse(centerX, footY, enemy.width * 0.78, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (tellActive) {
      // Charging telegraph — the colour tells the player how to answer:
      // gold/orange = parry or dodge, red = unblockable, dodge only.
      const windupDuration = Math.max(0.001, pattern.windup || 0.4);
      const charge = clamp(1 - enemy.attackWindup / windupDuration, 0, 1);
      const isUnblockable = !telegraph.parryable;
      const ringR = enemy.width * 0.6;

      // Attack zone (where the blow will land) — readable fill that brightens as it charges.
      if (!pattern.ranged) {
        ctx.globalAlpha = (0.14 + charge * 0.2) * (isUnblockable ? 1.1 : 1);
        ctx.fillStyle = telegraph.color;
        ctx.beginPath();
        ctx.roundRect(boxX, attackBox.y, attackBox.width, attackBox.height, 6);
        ctx.fill();
        ctx.globalAlpha = 0.3 + charge * 0.4;
        ctx.lineWidth = 1.5 + charge;
        ctx.strokeStyle = telegraph.color;
        ctx.stroke();
      }

      // Ground ring under the enemy: a dim full circle plus a bright arc that
      // sweeps to full as the swing charges, flattened onto the floor plane.
      ctx.save();
      ctx.translate(centerX, footY);
      ctx.scale(1, 0.32);
      ctx.globalAlpha = 0.22 + pulse * 0.06;
      ctx.lineWidth = 2;
      ctx.strokeStyle = telegraph.color;
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.55 + pulse * 0.25;
      ctx.lineWidth = 3 + charge * 1.5;
      ctx.shadowColor = telegraph.glow;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, ringR, -Math.PI / 2, -Math.PI / 2 + charge * Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Unblockable: a pulsing red aura around the body so it reads "dodge, don't parry".
      if (isUnblockable) {
        const auraPulse = 0.5 + Math.sin(now / 130) * 0.5;
        ctx.globalAlpha = 0.3 + auraPulse * 0.45 + charge * 0.2;
        ctx.lineWidth = 2 + auraPulse * 2;
        ctx.strokeStyle = telegraph.color;
        ctx.shadowColor = telegraph.glow;
        ctx.shadowBlur = 8 + auraPulse * 10;
        ctx.beginPath();
        ctx.ellipse(screenX + enemy.width / 2, enemy.y + enemy.height * 0.5, enemy.width * 0.58, enemy.height * 0.52, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (attackActive) {
      // Strike flash; on parryable attacks a bright gold pulse marks the parry window.
      const parryNow = telegraph.parryable && enemy.attackTimer <= PARRY_WINDOW_DURATION;
      if (!pattern.ranged) {
        ctx.globalAlpha = parryNow ? 0.32 : 0.16;
        ctx.fillStyle = parryNow ? '#fff7cc' : telegraph.color;
        ctx.beginPath();
        ctx.roundRect(boxX, attackBox.y, attackBox.width, attackBox.height, 6);
        ctx.fill();
        if (parryNow) {
          ctx.globalAlpha = 0.82;
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#fff2b0';
          ctx.shadowColor = 'rgba(255, 240, 170, 0.7)';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(boxX, attackBox.y, attackBox.width, attackBox.height, 6);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }, [getAttackBox, getEnemyPatternConfig]);

  const drawCombatEffects = useCallback((ctx, effects, cameraX) => {
    effects.forEach((effect) => {
      const progress = effect.timer / (effect.maxTimer || 0.35);
      const x = effect.x - cameraX;
      const y = effect.y;
      const compactTypes = new Set([
        'enemy-counter-window',
        'boss-vulnerable',
        'enemy-shield',
        'enemy-guard-deflect',
        'boss-shield',
        'boss-telegraph',
        'attack-stamina',
      ]);
      ctx.save();
      ctx.globalAlpha = Math.max(0, progress);
      ctx.strokeStyle = effect.color || '#facc15';
      ctx.fillStyle = effect.color || '#facc15';
      ctx.lineWidth = 3;
      if (effect.type === 'combo-slash') {
        const slashState = playerComboSlashEffectRef.current;
        const direction = effect.direction || 1;
        const ease = 1 - Math.pow(1 - Math.max(0, Math.min(1, progress)), 2);
        if (slashState.loaded && slashState.image) {
          const drawWidth = effect.width || 138;
          const drawHeight = drawWidth * (slashState.image.height / slashState.image.width);
          const comboStepAlpha = effect.comboStep >= 2 ? 0.74 : 0.54;
          ctx.globalAlpha = Math.max(0, Math.min(1, ease * comboStepAlpha));
          ctx.globalCompositeOperation = 'lighter';
          ctx.translate(x, y);
          if (direction < 0) ctx.scale(-1, 1);
          ctx.rotate((effect.angle || -0.08) * direction);
          ctx.drawImage(
            slashState.image,
            -drawWidth * 0.46 - (1 - progress) * 8,
            -drawHeight * 0.54,
            drawWidth,
            drawHeight,
          );
        } else {
          ctx.globalAlpha = Math.max(0, progress * (effect.comboStep >= 2 ? 0.28 : 0.18));
          ctx.strokeStyle = 'rgba(226, 213, 192, 0.82)';
          ctx.lineWidth = effect.comboStep >= 2 ? 4 : 3;
          ctx.beginPath();
          ctx.ellipse(x + direction * 30, y, effect.comboStep >= 2 ? 56 : 42, effect.comboStep >= 2 ? 15 : 11, -0.18 * direction, 0, Math.PI * 1.28);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }
      if (effect.type === 'finisher-slash') {
        const slashState = playerFinisherSlashEffectRef.current;
        const direction = effect.direction || 1;
        const ease = 1 - Math.pow(1 - Math.max(0, Math.min(1, progress)), 2);
        if (slashState.loaded && slashState.image) {
          const drawWidth = effect.width || 220;
          const drawHeight = drawWidth * (slashState.image.height / slashState.image.width);
          ctx.globalAlpha = Math.max(0, Math.min(1, ease * 0.88));
          ctx.globalCompositeOperation = 'lighter';
          ctx.translate(x, y);
          if (direction < 0) ctx.scale(-1, 1);
          ctx.rotate((effect.angle || -0.05) * direction);
          ctx.drawImage(
            slashState.image,
            -drawWidth * 0.42 - (1 - progress) * 10,
            -drawHeight * 0.58,
            drawWidth,
            drawHeight,
          );
        } else {
          ctx.globalAlpha = Math.max(0, progress * 0.34);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.86)';
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.ellipse(x + direction * 40, y, 76, 22, -0.18 * direction, 0, Math.PI * 1.45);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }
      if (['movement-dust', 'landing-dust', 'jump-dust', 'knockback-dust', 'sand-skid'].includes(effect.type)) {
        const direction = effect.direction || 1;
        const dustWidth = effect.type === 'landing-dust' ? 44 : effect.type === 'jump-dust' ? 34 : effect.type === 'sand-skid' ? 38 : 28;
        ctx.globalAlpha = Math.max(0, progress * (effect.type === 'movement-dust' ? 0.38 : effect.type === 'sand-skid' ? 0.42 : 0.58));
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
      if (effect.type === 'near-miss-spacing') {
        const direction = effect.direction || 1;
        const pulse = 1 - progress;
        ctx.globalAlpha = Math.max(0, progress * 0.54);
        ctx.strokeStyle = effect.color || 'rgba(226, 213, 192, 0.78)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x - direction * (effect.gap || 24), y - 5);
        ctx.lineTo(x + direction * 10, y - 5);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = Math.max(0, progress * 0.34);
        ctx.fillStyle = 'rgba(159, 126, 80, 0.36)';
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.ellipse(
            x - direction * (4 + i * 8 + pulse * 8),
            y + 22 - i,
            9 + pulse * 5,
            3 + pulse * 2,
            -0.08 * direction,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.restore();
        return;
      }
      if (effect.type === 'heavy-ready-cue') {
        const direction = effect.direction || 1;
        const pulse = 1 - progress;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = Math.max(0, Math.min(1, progress * 0.82));
        ctx.strokeStyle = effect.color || '#f8e7b6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(x + direction * 10, y, 28 + pulse * 10, 8 + pulse * 4, -0.18 * direction, 0, Math.PI * 1.45);
        ctx.stroke();
        ctx.globalAlpha = Math.max(0, progress * 0.38);
        ctx.strokeStyle = 'rgba(255, 247, 221, 0.66)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x - direction * 8, y + 8);
        ctx.quadraticCurveTo(x + direction * 20, y - 12 - pulse * 5, x + direction * 54, y - 2);
        ctx.stroke();
        ctx.globalAlpha = Math.max(0, progress * 0.58);
        ctx.fillStyle = 'rgba(248, 231, 182, 0.62)';
        for (let i = 0; i < 4; i += 1) {
          ctx.beginPath();
          ctx.arc(x + direction * (12 + i * 8), y - 6 - i * 2 - pulse * 10, 1.4 + i * 0.18, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = Math.max(0, progress * 0.24);
        ctx.fillStyle = 'rgba(159, 126, 80, 0.36)';
        ctx.beginPath();
        ctx.ellipse(x + direction * 8, y + 26, 24 + pulse * 12, 5 + pulse * 2, -0.04 * direction, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }
      if (effect.type === 'venom-spit') {
        const targetX = (effect.targetX ?? effect.x) - cameraX;
        const targetY = effect.targetY ?? y;
        const arcH = effect.arcHeight || 42;
        const travel = 1 - progress;
        const spitX = x + (targetX - x) * travel;
        const arcLift = Math.sin(travel * Math.PI) * arcH;
        const spitY = y + (targetY - y) * travel - arcLift;

        // Motion-aware angle from arc tangent
        const sampleDt = 0.015;
        const t2 = Math.min(1, travel + sampleDt);
        const nx = x + (targetX - x) * t2;
        const ny = y + (targetY - y) * t2 - Math.sin(t2 * Math.PI) * arcH;
        const motionAngle = Math.atan2(ny - spitY, nx - spitX);
        const venomAsset = scorpionVenomSpitEffectRef.current;
        if (venomAsset.loaded && venomAsset.image) {
          const frameWidth = venomAsset.image.width / SCORPION_VENOM_SPIT_EFFECT_FRAMES;
          const frameHeight = venomAsset.image.height;
          const frameIndex = clamp(Math.floor(travel * SCORPION_VENOM_SPIT_EFFECT_FRAMES), 0, SCORPION_VENOM_SPIT_EFFECT_FRAMES - 1);
          const splashFrame = frameIndex >= SCORPION_VENOM_SPIT_EFFECT_FRAMES - 2;
          const drawWidth = (splashFrame ? 88 : 72) * (0.96 + Math.sin(travel * 9) * 0.035);
          const drawHeight = drawWidth * (frameHeight / frameWidth);
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = Math.max(0, Math.min(1, progress * (splashFrame ? 0.72 : 0.86)));
          ctx.shadowColor = 'rgba(160, 220, 36, 0.55)';
          ctx.shadowBlur = splashFrame ? 8 : 5;
          ctx.translate(spitX, spitY);
          ctx.rotate(motionAngle);
          ctx.drawImage(
            venomAsset.image,
            frameIndex * frameWidth,
            0,
            frameWidth,
            frameHeight,
            -drawWidth * 0.5,
            -drawHeight * 0.5,
            drawWidth,
            drawHeight,
          );
          ctx.restore();
          return;
        }

        // Organic pulse — blobs wobble as they fly
        const wobble = 1 + 0.09 * Math.sin(travel * 13);
        const blobAlpha = Math.min(1, Math.max(0, progress * 0.9 + 0.1));

        // Outer glow aura aligned to motion
        ctx.globalAlpha = Math.max(0, progress * 0.40);
        const aura = ctx.createRadialGradient(spitX, spitY, 2, spitX, spitY, 20);
        aura.addColorStop(0, 'rgba(210, 95, 18, 0.68)');
        aura.addColorStop(0.5, 'rgba(165, 62, 10, 0.28)');
        aura.addColorStop(1, 'rgba(120, 40, 5, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.ellipse(spitX, spitY, 20 * wobble, 12 * wobble, motionAngle, 0, Math.PI * 2);
        ctx.fill();

        // Dark outer shell — gives depth and edge definition
        ctx.globalAlpha = blobAlpha * 0.94;
        ctx.fillStyle = '#7a3008';
        ctx.shadowColor = 'rgba(215, 92, 15, 0.95)';
        ctx.shadowBlur = 11 + progress * 10;
        ctx.beginPath();
        ctx.ellipse(spitX, spitY, 13 * wobble, 7.2 * wobble, motionAngle, 0, Math.PI * 2);
        ctx.fill();

        // Mid amber body
        ctx.shadowBlur = 0;
        ctx.globalAlpha = blobAlpha;
        ctx.fillStyle = '#c45a14';
        ctx.beginPath();
        ctx.ellipse(spitX, spitY, 11 * wobble, 6 * wobble, motionAngle, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright layer
        const hOffX = Math.cos(motionAngle - Math.PI * 0.5) * 1.6;
        const hOffY = Math.sin(motionAngle - Math.PI * 0.5) * 1.6;
        ctx.globalAlpha = blobAlpha * 0.90;
        ctx.fillStyle = '#e8841c';
        ctx.beginPath();
        ctx.ellipse(
          spitX - Math.cos(motionAngle) * 2 + hOffX,
          spitY - Math.sin(motionAngle) * 2 + hOffY,
          5.8 * wobble, 3.2 * wobble, motionAngle, 0, Math.PI * 2,
        );
        ctx.fill();

        // Specular highlight — small bright spot at leading top edge
        ctx.globalAlpha = blobAlpha * 0.68;
        ctx.fillStyle = 'rgba(255, 216, 140, 0.92)';
        ctx.beginPath();
        ctx.ellipse(
          spitX - Math.cos(motionAngle) * 3.5 + hOffX * 1.6,
          spitY - Math.sin(motionAngle) * 3.5 + hOffY * 1.6,
          2.6 * wobble, 1.4 * wobble, motionAngle, 0, Math.PI * 2,
        );
        ctx.fill();

        // Trailing drops — offset along motion axis, slight downward sag
        for (let i = 0; i < 5; i += 1) {
          const trailDist = 13 + i * 10;
          const tX = spitX - Math.cos(motionAngle) * trailDist;
          const tY = spitY - Math.sin(motionAngle) * trailDist + i * 1.4;
          const trailAlpha = Math.max(0, progress * (0.56 - i * 0.09));
          const rx = Math.max(0.6, 5.2 - i * 0.88);
          ctx.globalAlpha = trailAlpha;
          ctx.fillStyle = i < 2 ? '#b05010' : '#7a3610';
          ctx.shadowColor = i < 2 ? 'rgba(185, 82, 16, 0.55)' : 'transparent';
          ctx.shadowBlur = i < 2 ? 4 : 0;
          ctx.beginPath();
          ctx.ellipse(tX, tY, rx, rx * 0.56, motionAngle, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
        return;
      }
      if (effect.type === 'venom-slow') {
        const burst = 1 - progress;
        const radius = effect.radius || 34;
        const footY = effect.footY ?? y + 28;
        const pulse = 0.68 + Math.sin(burst * Math.PI * 3) * 0.12;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = Math.max(0, progress * 0.25);
        const venomGlow = ctx.createRadialGradient(x, y + 14, 5, x, y + 14, radius * (1.2 + burst * 0.45));
        venomGlow.addColorStop(0, 'rgba(150, 230, 28, 0.32)');
        venomGlow.addColorStop(0.5, 'rgba(72, 158, 24, 0.13)');
        venomGlow.addColorStop(1, 'rgba(58, 120, 16, 0)');
        ctx.fillStyle = venomGlow;
        ctx.beginPath();
        ctx.ellipse(x - 4, y + 18, radius * 0.86, radius * 1.02, -0.16, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 7; i += 1) {
          const side = i % 2 === 0 ? -1 : 1;
          const drift = side * (10 + i * 3.4) * (0.45 + burst * 0.55);
          const wispX = x + drift + Math.sin(i * 1.3 + burst * 5) * 3;
          const wispY = y + 24 - i * 6 - burst * (10 + i * 2.5);
          const wispWidth = radius * (0.18 + i * 0.018) * (1 + burst * 0.4);
          const wispHeight = radius * (0.34 + i * 0.025);
          ctx.globalAlpha = Math.max(0, progress * (0.16 + i * 0.018));
          ctx.fillStyle = i % 3 === 0 ? 'rgba(185, 245, 36, 0.34)' : 'rgba(78, 174, 26, 0.24)';
          ctx.beginPath();
          ctx.ellipse(wispX, wispY, wispWidth, wispHeight, side * 0.28, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = Math.max(0, progress * 0.52);
        ctx.fillStyle = 'rgba(126, 218, 28, 0.38)';
        ctx.beginPath();
        ctx.ellipse(x - 5, footY, radius * (0.72 + burst * 0.22), 7 + burst * 6, -0.1, 0, Math.PI * 2);
        ctx.ellipse(x + 16, footY + 1, radius * (0.46 + burst * 0.18), 5 + burst * 4, 0.14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(197, 252, 48, 0.62)';
        for (let i = 0; i < 13; i += 1) {
          const side = i % 2 === 0 ? -1 : 1;
          const spread = 4 + i * 3.7;
          const bubbleX = x + side * spread * (0.5 + burst * 0.46) + Math.sin(i * 2.1) * 2;
          const bubbleY = footY - 3 - burst * (10 + i * 2.1) - Math.sin(i * 1.7 + burst * 5) * 3;
          const bubbleRadius = (1.1 + (i % 4) * 0.45) * pulse;
          ctx.globalAlpha = Math.max(0, progress * (0.42 + (i % 3) * 0.08));
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, bubbleRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
        return;
      }
      if (effect.type === 'parry-burst') {
        const radius = 8 + (1 - progress) * 28;
        ctx.globalAlpha = Math.max(0, progress * 0.76);
        ctx.strokeStyle = effect.color || '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(x, y + 2, radius, radius * 0.54, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = Math.max(0, progress * 0.44);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(x, y + 2, radius * 0.52, radius * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i += 1) {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
          const inner = 5 + (1 - progress) * 6;
          const outer = 13 + (1 - progress) * 20;
          ctx.globalAlpha = Math.max(0, progress * 0.68);
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner * 0.54 + 2);
          ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer * 0.54 + 2);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }
      if (effect.type === 'enemy-guard-deflect') {
        const drawDeflectRing = (radius, alpha, lineWidth = 2) => {
          ctx.globalAlpha = Math.max(0, progress * alpha);
          ctx.strokeStyle = effect.color || 'rgba(214, 185, 92, 0.7)';
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.ellipse(x, y + 2, radius * 1.05, radius * 0.58, 0, 0, Math.PI * 2);
          ctx.stroke();
        };
        drawDeflectRing(7 + (1 - progress) * 5, 0.34, 1.2);
        ctx.strokeStyle = 'rgba(214, 185, 92, 0.78)';
        ctx.globalAlpha = Math.max(0, progress * 0.52);
        for (let i = 0; i < 4; i += 1) {
          const angle = -0.75 + i * 0.5;
          const inner = 5 + (1 - progress) * 2;
          const outer = 11 + (1 - progress) * 5;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner * 0.75);
          ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer * 0.75);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(136, 82, 36, 0.28)';
        ctx.globalAlpha = Math.max(0, progress * 0.34);
        ctx.beginPath();
        ctx.ellipse(x, y + 16, 15 + (1 - progress) * 6, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
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
  }, [drawFieldNoteLabel]);

  const drawPremiumEgyptianChamberDoor = useCallback((ctx, door, cameraX, current, now) => {
    if (!door?.trigger || getJourneySceneId(current) !== JOURNEY_SCENE_IDS.EXTERIOR) return;
    const centerWorldX = (door.trigger.minX + door.trigger.maxX) / 2;
    const centerX = worldToScreenX(centerWorldX, cameraX);
    const width = door.width || 148;
    const height = door.height || 210;
    const baseY = door.trigger.footY + (door.yOffset || 0);
    const top = baseY - height;
    if (centerX + width < -80 || centerX - width > CANVAS_WIDTH + 80) return;

    const playerCenterX = current.player.x + current.player.width / 2;
    const playerFootY = current.player.y + current.player.height;
    const playerNear = Math.abs(playerCenterX - centerWorldX) < width * 0.72
      && Math.abs(playerFootY - door.trigger.footY) <= Math.max(door.trigger.footTolerance * 2.2, 58);
    const pulse = 0.72 + Math.sin(now / 360) * 0.18;
    const glowColor = door.glow || '#facc15';
    const accent = door.accent || '#facc15';

    ctx.save();
    drawContactShadow(ctx, centerX, baseY + 7, width * 0.86, 0.22, 1.25);

    const aura = ctx.createRadialGradient(centerX, top + height * 0.48, 12, centerX, top + height * 0.48, width * 0.9);
    aura.addColorStop(0, `rgba(250, 204, 21, ${0.1 + pulse * 0.06})`);
    aura.addColorStop(0.4, `rgba(94, 234, 212, ${playerNear ? 0.12 : 0.06})`);
    aura.addColorStop(1, 'rgba(94, 234, 212, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(centerX, top + height * 0.48, width * 0.7, height * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    const frameGradient = ctx.createLinearGradient(centerX - width / 2, top, centerX + width / 2, baseY);
    frameGradient.addColorStop(0, '#d7bd83');
    frameGradient.addColorStop(0.28, '#8f6c42');
    frameGradient.addColorStop(0.72, '#5c3d23');
    frameGradient.addColorStop(1, '#2d1b10');
    ctx.fillStyle = frameGradient;
    ctx.strokeStyle = 'rgba(38, 24, 13, 0.86)';
    ctx.lineWidth = 3;

    // Carved stone doorway frame.
    ctx.beginPath();
    ctx.roundRect(centerX - width * 0.5, top + height * 0.12, width, height * 0.86, 12);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(centerX - width * 0.34, top + height * 0.28, width * 0.68, height * 0.68, 30);
    ctx.fillStyle = 'rgba(17, 24, 39, 0.5)';
    ctx.fill();

    // Sealed slab, kept visual-only so transition triggers remain unchanged.
    const slabWidth = width * (door.slabInset || 0.5);
    const slabHeight = height * 0.58;
    const slabX = centerX - slabWidth / 2;
    const slabY = top + height * 0.34;
    const slabGradient = ctx.createLinearGradient(slabX, slabY, slabX + slabWidth, slabY + slabHeight);
    slabGradient.addColorStop(0, '#c7a66e');
    slabGradient.addColorStop(0.55, '#7c5832');
    slabGradient.addColorStop(1, '#3d2515');
    ctx.fillStyle = slabGradient;
    ctx.strokeStyle = 'rgba(246, 202, 108, 0.5)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(slabX, slabY, slabWidth, slabHeight, 10);
    ctx.fill();
    ctx.stroke();

    // Hieroglyphs are simple carved marks on the frame, not new assets.
    ctx.strokeStyle = 'rgba(36, 21, 12, 0.58)';
    ctx.lineWidth = 1.4;
    [-1, 1].forEach((side) => {
      const glyphX = centerX + side * width * 0.36;
      for (let i = 0; i < 5; i += 1) {
        const glyphY = top + height * (0.26 + i * 0.11);
        ctx.beginPath();
        if (i % 3 === 0) {
          ctx.moveTo(glyphX - 5, glyphY);
          ctx.lineTo(glyphX + 5, glyphY);
          ctx.lineTo(glyphX, glyphY + 8);
        } else if (i % 3 === 1) {
          ctx.ellipse(glyphX, glyphY + 4, 5, 7, 0, 0, Math.PI * 2);
        } else {
          ctx.moveTo(glyphX, glyphY - 2);
          ctx.lineTo(glyphX, glyphY + 10);
          ctx.moveTo(glyphX - 5, glyphY + 4);
          ctx.lineTo(glyphX + 5, glyphY + 4);
        }
        ctx.stroke();
      }
    });

    // Glowing ankh or scarab seal.
    const sealX = centerX;
    const sealY = slabY + slabHeight * 0.38;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const sealGlow = ctx.createRadialGradient(sealX, sealY, 3, sealX, sealY, 42 + pulse * 14);
    sealGlow.addColorStop(0, `rgba(255, 247, 203, ${0.5 + pulse * 0.22})`);
    sealGlow.addColorStop(0.52, `rgba(250, 204, 21, ${0.18 + pulse * 0.12})`);
    sealGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = sealGlow;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 42 + pulse * 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2.6;
    if (door.seal === 'scarab') {
      ctx.beginPath();
      ctx.ellipse(sealX, sealY, 15, 20, 0, 0, Math.PI * 2);
      ctx.moveTo(sealX, sealY - 20);
      ctx.lineTo(sealX, sealY + 20);
      ctx.moveTo(sealX - 21, sealY - 6);
      ctx.lineTo(sealX + 21, sealY - 6);
      ctx.moveTo(sealX - 18, sealY + 8);
      ctx.lineTo(sealX + 18, sealY + 8);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(sealX, sealY - 15, 8, 10, 0, 0, Math.PI * 2);
      ctx.moveTo(sealX, sealY - 4);
      ctx.lineTo(sealX, sealY + 24);
      ctx.moveTo(sealX - 15, sealY + 6);
      ctx.lineTo(sealX + 15, sealY + 6);
      ctx.moveTo(sealX - 9, sealY + 24);
      ctx.lineTo(sealX + 9, sealY + 24);
      ctx.stroke();
    }
    ctx.restore();

    // Subtle gold rim light around the active passage edge.
    ctx.strokeStyle = `rgba(250, 204, 21, ${playerNear ? 0.62 : 0.34})`;
    ctx.lineWidth = playerNear ? 3 : 2;
    ctx.beginPath();
    ctx.roundRect(slabX - 7, slabY - 8, slabWidth + 14, slabHeight + 16, 13);
    ctx.stroke();

    if (door.dust !== false) {
      ctx.fillStyle = `rgba(244, 196, 113, ${0.16 + pulse * 0.06})`;
      for (let i = 0; i < 6; i += 1) {
        const drift = Math.sin(now / (520 + i * 31) + i) * 5;
        ctx.beginPath();
        ctx.arc(centerX - width * 0.34 + i * width * 0.14 + drift, baseY - 18 - (i % 3) * 8, 1.7 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawGroundDustLip(ctx, centerX, baseY + 2, width * 0.76, 'rgba(198, 130, 55, 0.24)');
    if (playerNear) {
      const promptText = door.prompt || 'E Enter';
      drawFieldNoteLabel(ctx, centerX, top - 16, promptText, accent);
    }
    ctx.restore();
  }, [drawFieldNoteLabel]);

  const drawPropPlacementEditorOverlay = useCallback((ctx, current, cameraX) => {
    const editor = propPlacementEditorRef.current;
    if (!import.meta.env.DEV || !editor.enabled) return;
    // Preview mode: suppress all editor chrome (selection border, tinted overlay,
    // corner markers, labels, grid) so the object's real appearance is visible
    // without leaving the editor. A small badge reminds how to toggle back.
    if (editor.previewMode) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = 'rgba(8, 13, 22, 0.78)';
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(CANVAS_WIDTH - 150, 12, 138, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ecfeff';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('PREVIEW — press H', CANVAS_WIDTH - 140, 28);
      ctx.restore();
      return;
    }
    ctx.save();
    if (editor.gridSnap) {
      const gridSize = clamp(Number(editor.gridSize) || DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE, 2, 128);
      const startWorldX = Math.floor(cameraX / gridSize) * gridSize;
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      for (let worldX = startWorldX; worldX <= cameraX + CANVAS_WIDTH + gridSize; worldX += gridSize) {
        const screenX = Math.round(worldToScreenX(worldX, cameraX)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let screenY = 0; screenY <= CANVAS_HEIGHT; screenY += gridSize) {
        const y = Math.round(screenY) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
    }
    getRenderableStoryProps(current).forEach((prop) => {
      const bounds = getStoryPropEditorBounds(prop, cameraX, current);
      if (bounds.x + bounds.width < -80 || bounds.x > CANVAS_WIDTH + 80) return;
      const selected = prop.id === editor.selectedPropId;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 3;
      ctx.strokeStyle = selected ? 'rgba(72, 187, 205, 0.9)' : 'rgba(72, 187, 205, 0.5)';
      ctx.lineWidth = selected ? 3 : 1.5;
      ctx.setLineDash(selected ? [] : [6, 5]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.restore();
      if (selected) {
        drawEditorSelectionCorners(ctx, bounds, 'rgba(72, 187, 205, 0.92)');
      }
    });
    const selectedProp = getPropEditorSelectedProp(current);
    if (selectedProp) {
      // Pin the id/coords readout to a fixed clear spot (bottom-left, clear of the panel,
      // the top HUD bars and the bottom-right seal HUD) instead of floating it over the
      // asset, where the name was covering the very thing being positioned. Same info also
      // lives in the side panel.
      const labelX = 12;
      const labelY = CANVAS_HEIGHT - 30;
      const selectedScale = Number.isFinite(selectedProp.scale) ? selectedProp.scale : 1;
      const selectedRotation = Number.isFinite(selectedProp.rotation) ? selectedProp.rotation : 0;
      drawEditorSelectionLabel(
        ctx,
        labelX,
        labelY,
        `${selectedProp.id}  x:${Math.round(selectedProp.x)} y:${Math.round(selectedProp.y)} s:${selectedScale.toFixed(2)} r:${Math.round(selectedRotation)}`,
        'rgba(94, 234, 212, 0.74)',
      );
    }
    getRenderablePlatforms(current).forEach((platform) => {
      const platformId = platform.id || platform.label;
      const bounds = getPlatformEditorBounds(platform, cameraX, current);
      if (bounds.x + bounds.width < -80 || bounds.x > CANVAS_WIDTH + 80) return;
      const floor = isJourneyFloorPlatform(platform);
      const blocker = isJourneyBlockerPlatform(platform);
      const selected = platformId === editor.selectedPlatformId;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 3;
      ctx.strokeStyle = selected
        ? blocker ? 'rgba(56, 170, 156, 0.9)' : floor ? 'rgba(150, 130, 210, 0.9)' : 'rgba(130, 190, 80, 0.9)'
        : blocker ? 'rgba(56, 170, 156, 0.6)' : floor ? 'rgba(150, 130, 210, 0.58)' : 'rgba(130, 190, 80, 0.58)';
      ctx.fillStyle = selected
        ? blocker ? 'rgba(56, 170, 156, 0.16)' : floor ? 'rgba(150, 130, 210, 0.16)' : 'rgba(130, 190, 80, 0.16)'
        : blocker ? 'rgba(56, 170, 156, 0.1)' : floor ? 'rgba(150, 130, 210, 0.1)' : 'rgba(130, 190, 80, 0.1)';
      ctx.lineWidth = selected ? 3.5 : 2.25;
      ctx.setLineDash(selected ? [] : blocker ? [3, 3] : floor ? [14, 7] : [8, 5]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      if (blocker && (platform.blockerShape === 'left-slant' || platform.blockerShape === 'right-slant')) {
        ctx.setLineDash([]);
        ctx.strokeStyle = selected ? 'rgba(204, 251, 241, 0.98)' : 'rgba(204, 251, 241, 0.72)';
        ctx.lineWidth = selected ? 2.5 : 1.75;
        ctx.beginPath();
        if (platform.blockerShape === 'left-slant') {
          ctx.moveTo(bounds.x + bounds.width, bounds.y);
          ctx.lineTo(bounds.x, bounds.y + bounds.height);
        } else {
          ctx.moveTo(bounds.x, bounds.y);
          ctx.lineTo(bounds.x + bounds.width, bounds.y + bounds.height);
        }
        ctx.stroke();
      }
      ctx.restore();
      if (platform.invisible || floor || blocker) {
        ctx.fillStyle = blocker ? 'rgba(204, 251, 241, 0.98)' : floor ? 'rgba(255, 251, 235, 0.98)' : 'rgba(255, 237, 213, 0.96)';
        ctx.font = '800 10px Outfit, sans-serif';
        ctx.textAlign = 'left';
        const platformLabel = blocker && platform.blockerShape === 'left-slant'
          ? 'left slant'
          : blocker && platform.blockerShape === 'right-slant'
            ? 'right slant'
            : blocker ? 'blocker' : floor ? 'floor' : 'platform';
        ctx.fillText(platformLabel, bounds.x + 4, bounds.y + 11);
      }
    });
    getRenderableHazards(current).forEach((hazard) => {
      if (hazard.editorVisible === false && hazard.id !== editor.selectedHazardId) return;
      const bounds = getHazardEditorBounds(hazard, cameraX);
      if (bounds.x + bounds.width < -80 || bounds.x > CANVAS_WIDTH + 80) return;
      const selected = hazard.id === editor.selectedHazardId;
      if (editor.showTrapTriggers) {
        const trigger = getJourneyTrapTriggerRect(hazard);
        const triggerX = worldToScreenX(trigger.x, cameraX);
        ctx.strokeStyle = selected ? 'rgba(253, 224, 71, 0.95)' : 'rgba(253, 224, 71, 0.42)';
        ctx.fillStyle = selected ? 'rgba(253, 224, 71, 0.12)' : 'rgba(253, 224, 71, 0.05)';
        ctx.lineWidth = selected ? 2.5 : 1.25;
        ctx.setLineDash([2, 4]);
        ctx.strokeRect(triggerX, trigger.y, trigger.width, trigger.height);
        ctx.fillRect(triggerX, trigger.y, trigger.width, trigger.height);
      }
      ctx.strokeStyle = selected ? 'rgba(248, 113, 113, 0.98)' : 'rgba(248, 113, 113, 0.55)';
      ctx.fillStyle = selected ? 'rgba(248, 113, 113, 0.18)' : 'rgba(248, 113, 113, 0.08)';
      ctx.lineWidth = selected ? 3 : 1.5;
      ctx.setLineDash(selected ? [] : [4, 4]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillStyle = 'rgba(254, 226, 226, 0.92)';
      ctx.font = '800 10px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('trap', bounds.x + 4, bounds.y + 11);
    });
    getRenderableScarabLairs().forEach((boss) => {
      const bounds = getLairEditorBounds(boss, cameraX);
      if (bounds.x + bounds.width < -80 || bounds.x > CANVAS_WIDTH + 80) return;
      const selected = boss.id === editor.selectedLairId;
      ctx.strokeStyle = selected ? 'rgba(214, 132, 64, 0.9)' : 'rgba(214, 132, 64, 0.55)';
      ctx.fillStyle = selected ? 'rgba(214, 132, 64, 0.15)' : 'rgba(214, 132, 64, 0.07)';
      ctx.lineWidth = selected ? 3 : 1.5;
      ctx.setLineDash(selected ? [] : [3, 5]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillStyle = 'rgba(204, 251, 241, 0.94)';
      ctx.font = '800 10px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('scarab lair', bounds.x + 4, bounds.y + 11);
    });
    [
      ...getRenderableRouteGateDoorways().map(doorway => ({ ...doorway, editorKind: 'doorway', editorId: `doorway:${doorway.id}` })),
      ...getRenderableRouteGates().map(gate => ({ ...gate, editorKind: 'gate', editorId: `gate:${gate.id}` })),
    ].forEach((arch) => {
      const bounds = getArchEditorBounds(arch, cameraX);
      if (bounds.x + bounds.width < -80 || bounds.x > CANVAS_WIDTH + 80) return;
      const selected = arch.editorId === editor.selectedArchId;
      ctx.strokeStyle = selected ? 'rgba(129, 140, 248, 0.98)' : 'rgba(129, 140, 248, 0.5)';
      ctx.fillStyle = selected ? 'rgba(129, 140, 248, 0.16)' : 'rgba(129, 140, 248, 0.07)';
      ctx.lineWidth = selected ? 3 : 1.5;
      ctx.setLineDash(selected ? [] : [10, 5]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillStyle = 'rgba(224, 231, 255, 0.94)';
      ctx.font = '800 10px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('arch', bounds.x + 4, bounds.y + 11);
    });
    getRenderableCheckpoints().forEach((checkpoint) => {
      const bounds = getCheckpointEditorBounds(checkpoint, cameraX);
      if (bounds.x + bounds.width < -80 || bounds.x > CANVAS_WIDTH + 80) return;
      const selected = checkpoint.id === editor.selectedCheckpointId;
      ctx.strokeStyle = selected ? 'rgba(34, 197, 94, 0.98)' : 'rgba(34, 197, 94, 0.5)';
      ctx.fillStyle = selected ? 'rgba(34, 197, 94, 0.16)' : 'rgba(34, 197, 94, 0.07)';
      ctx.lineWidth = selected ? 3 : 1.5;
      ctx.setLineDash(selected ? [] : [5, 5]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillStyle = 'rgba(220, 252, 231, 0.94)';
      ctx.font = '800 10px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('checkpoint', bounds.x + 4, bounds.y + 11);
    });
    // Chamber entry trigger zones — teal boxes showing where Asha must stand to enter
    const chamberEntryTriggers = CHAMBER_DOOR_VISUALS.map(door => ({
      id: door.id,
      label: `entry: ${door.title}`,
      trigger: resolveChamberEntryTrigger(door),
    })).filter(entry => entry.trigger);
    chamberEntryTriggers.forEach(({ label, trigger }) => {
      const sx = worldToScreenX(trigger.minX, cameraX);
      const sw = worldToScreenX(trigger.maxX, cameraX) - sx;
      if (sx + sw < -80 || sx > CANVAS_WIDTH + 80) return;
      // Foot-Y target band (where player feet must be)
      const footTop = trigger.footY - trigger.footTolerance;
      const footBot = trigger.footY + trigger.footTolerance;
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.88)';
      ctx.fillStyle = 'rgba(45, 212, 191, 0.14)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(sx, footTop, sw, footBot - footTop);
      ctx.fillRect(sx, footTop, sw, footBot - footTop);
      // maxY ceiling line (player.y must be below this)
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.44)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(sx, trigger.maxY);
      ctx.lineTo(sx + sw, trigger.maxY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(204, 251, 241, 0.96)';
      ctx.font = '800 10px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, sx + 4, footTop - 4);
    });
    const selectedPlatform = getPropEditorSelectedPlatform(current);
    if (selectedPlatform) {
      const bounds = getPlatformEditorBounds(selectedPlatform, cameraX, current);
      const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - 300);
      const labelY = clamp(bounds.y - 28, 14, CANVAS_HEIGHT - 36);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(8, 13, 22, 0.86)';
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.74)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, 290, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff7ed';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${selectedPlatform.id || selectedPlatform.label}  x:${Math.round(selectedPlatform.x)} y:${Math.round(selectedPlatform.y)} w:${Math.round(selectedPlatform.width)} h:${Math.round(selectedPlatform.height)}`, labelX + 8, labelY + 16);
    }
    const selectedHazard = getPropEditorSelectedHazard(current);
    if (selectedHazard) {
      const bounds = getHazardEditorBounds(selectedHazard, cameraX);
      const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - 300);
      const labelY = clamp(bounds.y - 28, 14, CANVAS_HEIGHT - 36);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(8, 13, 22, 0.88)';
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.74)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, 290, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fee2e2';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${selectedHazard.id}  x:${Math.round(selectedHazard.x)} y:${Math.round(selectedHazard.y)} w:${Math.round(selectedHazard.width)} h:${Math.round(selectedHazard.height)}`, labelX + 8, labelY + 16);
    }
    const selectedLair = getPropEditorSelectedLair(current);
    if (selectedLair) {
      const placement = getScarabQueenLairPlacement(selectedLair);
      const bounds = getLairEditorBounds(selectedLair, cameraX);
      const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - 310);
      const labelY = clamp(bounds.y - 28, 14, CANVAS_HEIGHT - 36);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(8, 13, 22, 0.88)';
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.74)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, 300, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ccfbf1';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${selectedLair.id} lair  x:${Math.round(placement.x)} y:${Math.round(placement.y)} w:${Math.round(placement.width)} h:${Math.round(placement.height)}`, labelX + 8, labelY + 16);
    }
    const selectedNest = getPropEditorSelectedNest();
    if (selectedNest) {
      const params = getEditedNestParams(selectedNest);
      const bounds = getNestEditorBounds(selectedNest, cameraX);
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.restore();
      const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - 360);
      const labelY = clamp(bounds.y - 44, 14, CANVAS_HEIGHT - 52);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(8, 13, 22, 0.9)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.74)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, 352, 40, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef3c7';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${selectedNest.id}  x:${Math.round(params.x)} y:${Math.round(params.y)} size:${params.widthScale.toFixed(2)} anchor:${Math.round(params.yOffset)} glowY:${params.glowYFactor.toFixed(2)} glowS:${params.glowSize.toFixed(2)}`, labelX + 8, labelY + 15);
      ctx.fillStyle = 'rgba(254, 243, 199, 0.7)';
      ctx.font = '600 10px Outfit, sans-serif';
      ctx.fillText('drag=move  [ ]=size  ; \'=anchor  , .=glowY  9 0=glow size  \\=reset', labelX + 8, labelY + 31);
    }
    const selectedArch = getPropEditorSelectedArch(current);
    if (selectedArch) {
      const bounds = getArchEditorBounds(selectedArch, cameraX);
      const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - 300);
      const labelY = clamp(bounds.y - 28, 14, CANVAS_HEIGHT - 36);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(8, 13, 22, 0.88)';
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.74)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, 290, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e0e7ff';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      const archX = Number.isFinite(selectedArch.anchorX) ? selectedArch.anchorX : selectedArch.x;
      ctx.fillText(`${selectedArch.id}  x:${Math.round(archX)} y:${Math.round(selectedArch.y)} w:${Math.round(selectedArch.width)} h:${Math.round(selectedArch.height)}`, labelX + 8, labelY + 16);
    }
    const selectedCheckpoint = getPropEditorSelectedCheckpoint(current);
    if (selectedCheckpoint) {
      const bounds = getCheckpointEditorBounds(selectedCheckpoint, cameraX);
      const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - 300);
      const labelY = clamp(bounds.y - 28, 14, CANVAS_HEIGHT - 36);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(8, 13, 22, 0.88)';
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.74)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, 290, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#dcfce7';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${selectedCheckpoint.id}  x:${Math.round(selectedCheckpoint.x)} y:${Math.round(selectedCheckpoint.y)}`, labelX + 8, labelY + 16);
    }
    // Hover preview: outline + plain label of the entity a click would select, with a
    // Tab counter when several entities are stacked under the cursor.
    const hover = editor.hover;
    if (!editor.dragging && hover && hover.stack && hover.stack.length) {
      const descriptor = hover.stack[Math.min(hover.index, hover.stack.length - 1)];
      const bounds = getEditorEntityBounds(descriptor, cameraX, current);
      if (bounds) {
        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.lineWidth = 2;
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.restore();
        drawEditorSelectionCorners(ctx, bounds, 'rgba(255, 255, 255, 0.98)');
        if (editor.showHoverLabels !== false) {
        const cycleSuffix = hover.stack.length > 1 ? `   ⇥ ${hover.index + 1}/${hover.stack.length} · right-click for list` : '';
        // Long prop names sprawl over the asset you're positioning, so show a compact
        // name: drop the trailing " · <id>" and redundant " — prop", then cap the length.
        const HOVER_LABEL_MAX = 26;
        let compact = getEditorEntityLabel(descriptor)
          .replace(/\s·\s.*$/, '')
          .replace(/\s—\sprop$/, '');
        if (compact.length > HOVER_LABEL_MAX) compact = `${compact.slice(0, HOVER_LABEL_MAX - 1).trimEnd()}…`;
        const text = `${compact}${cycleSuffix}`;
        ctx.save();
        ctx.setLineDash([]);
        ctx.font = '800 12px Outfit, sans-serif';
        const textWidth = ctx.measureText(text).width;
        const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - (textWidth + 30));
        const labelY = clamp(bounds.y - 26, 14, CANVAS_HEIGHT - 34);
        ctx.fillStyle = 'rgba(8, 13, 22, 0.92)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(labelX, labelY, textWidth + 18, 22, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'left';
        ctx.fillText(text, labelX + 9, labelY + 15);
        ctx.restore();
        }
      }
    }
    ctx.restore();
  }, [getArchEditorBounds, getCheckpointEditorBounds, getEditedNestParams, getEditorEntityBounds, getEditorEntityLabel, getHazardEditorBounds, getLairEditorBounds, getNestEditorBounds, getPlatformEditorBounds, getPropEditorSelectedArch, getPropEditorSelectedCheckpoint, getPropEditorSelectedHazard, getPropEditorSelectedLair, getPropEditorSelectedNest, getPropEditorSelectedPlatform, getPropEditorSelectedProp, getRenderableCheckpoints, getRenderableHazards, getRenderablePlatforms, getRenderableRouteGateDoorways, getRenderableRouteGates, getRenderableScarabLairs, getRenderableStoryProps, getScarabQueenLairPlacement, resolveChamberEntryTrigger]);

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
      playerWeaponVisualMode: playerWeaponSpriteRef.current.loaded ? 'khopesh-sprite-atlas' : 'canvas-fallback',
      desertVisualTuningVersion: DESERT_VISUAL_TUNING_VERSION,
      desertEntryCausewayVisualMode: 'narrow-premium-causeway-with-modular-floor-kit',
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
      playerWeaponFrame: getPlayerWeaponFrameKey(getPlayerAttackState(current)),
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
    const chinaBackgroundDrawn = !arrivalThresholdDrawn && drawChinaRiverValleyBackground(ctx, cameraX);
    const desertBackgroundDrawn = !arrivalThresholdDrawn && !chinaBackgroundDrawn && drawDesertEntryBackground(ctx, section, cameraX);
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
    const desertJourneyScenePanelsDrawn = !DESERT_ENTRY_RESTORE_ORIGINAL_BACKDROP
      && !arrivalThresholdDrawn
      && !chamberSceneActive
      && section.id === 'desert-entry'
      && drawDesertJourneyScenePanels(ctx, current, cameraX, now);
    const desertEntryPrimaryBackgroundPlatesDrawn = desertJourneyScenePanelsDrawn
      && drawDesertEntryPrimaryBackgroundPlates(ctx, current, cameraX);
    if ((desertJourneyScenePanelsDrawn || desertEntryPrimaryBackgroundPlatesDrawn) && current.renderStats) {
      current.renderStats.activeBackgroundSection = 'desert-entry';
      current.renderStats.backgroundDepthMode = desertEntryPrimaryBackgroundPlatesDrawn
        ? 'desert-journey-continuous-panels-with-primary-png-plates-2026-06-14'
        : DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION;
    }

    // --- Ground & Props ---
    ctx.save();
    if (secretVerticalCameraOffset > 0.5) {
      ctx.translate(0, secretVerticalCameraOffset);
    }
    if (!parallaxBackgroundDrawn) drawTempleBackdrop(ctx, section, cameraX);
    if (!chamberSceneActive && !current.arrivalThresholdActive) {
      WORLD_CONTINUITY_LANDMARKS.forEach((landmark) => drawWorldContinuityLandmark(ctx, landmark, cameraX, now));
      WORLD_TRANSITION_STORY_MARKERS.forEach((marker) => drawWorldTransitionMarker(ctx, marker, cameraX, now));
      getZIndexSortedRenderableStoryProps(current).forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'background'));
      drawParticles(ctx, atmosphere, cameraX, now);
      if (desertJourneyScenePanelsDrawn) drawDesertJourneySceneMasks(ctx, current, cameraX, now);
    }

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
    if (!chamberSceneActive && !current.arrivalThresholdActive) {
      drawDesertForegroundAtmosphere(ctx, section, cameraX);
      drawSectionParallaxForeground(ctx, section, cameraX);
      drawOpeningPyramidMasonryBack(ctx, cameraX, now, current);
      getZIndexSortedRenderableStoryProps(current).forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'midground'));
      ENVIRONMENT_INTERACTIONS.forEach((item) => drawEnvironmentInteraction(ctx, item, cameraX, now, current));
      drawEgyptAmbientLife(ctx, section, cameraX, now);
      drawConnectedWorldAmbientLife(ctx, section, cameraX, now);
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
      drawAncientRouteGround(ctx, section, cameraX, now, current);
      getZIndexSortedRenderableStoryProps(current).forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'grounded'));
      CHAMBER_DOOR_VISUALS
        .map(door => ({ ...door, trigger: resolveChamberEntryTrigger(door) }))
        .filter(door => door.trigger)
        .forEach((door) => drawPremiumEgyptianChamberDoor(ctx, door, cameraX, current, now));
    }
    const renderablePlatforms = current.arrivalThresholdActive ? [] : getRenderablePlatforms(current);
    drawMummificationChamberInterior(ctx, current, now);
    drawForgottenMuralChamberInterior(ctx, current, now);
    drawScribeLockedChamberInterior(ctx, current, now);
    if (!chamberSceneActive && !current.arrivalThresholdActive) {
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
      if (!chamberSceneActive) drawLostBridgeRavineDepth(ctx, renderablePlatforms, cameraX, current);
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
        } else if (enemy.type === 'scorpion-nest') {
          // Placement + appearance are editor-tunable (Shift+E, click the nest); falls
          // back to SCORPION_NEST_EDITOR_DEFAULTS when no edit exists.
          const nestParams = getEditedNestParams(enemy);
          const nestCx = worldToScreenX(nestParams.x, cameraX) + enemy.width / 2 + shakeX;
          const nestBaseY = nestParams.y + enemy.height + nestParams.yOffset;
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

      // Unblockable windup aura is now drawn (in red) by drawEnemyAttackTell's
      // colour-coded telegraph, so the old pale-gold ellipse here was removed to
      // avoid a conflicting double ring.

      // Only show normal enemy health after damage so full bars do not read as platforms.
      if (!enemy.defeated && enemy.health > COMBAT_DAMAGE_SCALE && enemy.health < enemy.maxHealth) {
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

    if (!current.enemiesDisabled) current.miniBosses.forEach((boss) => {
      const editedBoss = getEditedMiniBoss(boss);
      const lairPlacement = getScarabQueenLairPlacement(editedBoss);
      if (!isEntityActiveInScene(boss, current)) return;
      if (boss.defeated) return;
      const bx = worldToScreenX(boss.x, cameraX);
      if (!isHorizontallyVisible(boss.x, boss.width, cameraX, 100)) return;
      const isBuriedScarabQueen = boss.id === SCARAB_SEAL_TRIGGER.bossId
        && backgroundPackId !== 'china-river-valley';
      const bossIntroActive = current.bossIntro?.id === boss.id;
      if (isBuriedScarabQueen && !boss.awakened && !bossIntroActive) {
        drawScarabQueenLairOpeningProp(ctx, lairPlacement.x, cameraX, now, null, lairPlacement);
        return;
      }
      if (isBuriedScarabQueen && current.bossDomain?.bossId === boss.id) {
        drawScarabQueenLairOpeningProp(ctx, lairPlacement.x || current.bossDomain.bossStartX || boss.x + boss.width / 2, cameraX, now, null, lairPlacement);
      }
      drawMiniBoss(ctx, boss, bx, now);
      if (!bossIntroActive) drawEnemyAttackTell(ctx, boss, bx, cameraX, now, true, true);
    });

    if (!chamberSceneActive && !current.arrivalThresholdActive) {
      drawLostBridgeRavineForegroundVoid(ctx, renderablePlatforms, cameraX, current);
    }

    (current.bossKeyItems || []).forEach((keyItem) => {
      if (chamberSceneActive) return;
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
    drawOpeningSphinxEncounter(ctx, current.openingSphinxEncounter, cameraX, now);
    drawCombatEffects(ctx, current.combatHitEffects, cameraX, now);
    const hasDedicatedDodgeRow = playerSpriteRef.current.mode === 'hero-atlas'
      && Boolean(getHeroSpriteRow(playerSpriteRef.current.atlas, 'dodge'));
    if (current.dodgeTrail?.length && !hasDedicatedDodgeRow) {
      current.dodgeTrail.forEach((ghost) => {
        ctx.save();
        ctx.globalAlpha = clamp(ghost.alpha, 0, 0.35);
        drawPlayerSprite(ctx, ghost.x - cameraX, ghost.y, player.width, player.height, ghost.dir, 0, now);
        ctx.restore();
      });
    }
    drawPlayerSprite(ctx, player.x - cameraX, player.y, player.width, player.height, player.direction, player.invulnerable, now);
    getZIndexSortedRenderableStoryProps(current).forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'foreground-occluder'));
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
    if (!chamberSceneActive && ENABLE_FOREGROUND_DEPTH_LAYER) drawForegroundDepthLayer(ctx, section, cameraX, now);
    drawOpeningThresholdScene(ctx, current.openingThresholdScene, cameraX, now);
    drawTempleThresholdTransition(ctx, current.templeThresholdTransition, now);
    drawForgottenMuralChamberTransition(ctx, current.forgottenMuralChamberTransition);
    drawOpeningCinematic(ctx, current.openingCinematic, now);
    ctx.restore();

    const staminaRatio = current.resources.stamina / Math.max(1, current.upgradeEffects?.maxStamina || 100);
    if (current.enduranceExhausted) {
      // Exhausted state: amber/teal desaturated pulse — distinct from the red low-stamina danger
      current.renderStats.dangerFeedbackActive = true;
      const pulse = 0.45 + Math.sin(now / 200) * 0.22;
      const alpha = clamp(0.28 + pulse * 0.12, 0.22, 0.42);
      ctx.save();
      const exhaustedGradient = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.15,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.72,
      );
      exhaustedGradient.addColorStop(0, 'rgba(40, 30, 15, 0)');
      exhaustedGradient.addColorStop(1, `rgba(80, 55, 20, ${alpha})`);
      ctx.fillStyle = exhaustedGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    } else if (staminaRatio <= 0.3) {
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

    if ((player.sandBlindTimer || 0) > 0) {
      const blindAlpha = Math.min(1, player.sandBlindTimer / 0.6) * 0.38;
      ctx.save();
      const sandGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      sandGrad.addColorStop(0, `rgba(180, 140, 80, ${blindAlpha * 0.6})`);
      sandGrad.addColorStop(0.4, `rgba(160, 118, 60, ${blindAlpha})`);
      sandGrad.addColorStop(0.7, `rgba(140, 100, 45, ${blindAlpha * 0.9})`);
      sandGrad.addColorStop(1, `rgba(120, 85, 35, ${blindAlpha * 0.5})`);
      ctx.fillStyle = sandGrad;
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
      const py = player.y + secretVerticalCameraOffset - 24 - player.hitFeedbackTimer * 8;
      ctx.fillText(`-${player.lastDamage} ENDURANCE`, px, py);
      ctx.strokeText(`-${player.lastDamage} ENDURANCE`, px, py);
      ctx.restore();
    }

    // DEBUG PLATFORM OVERLAY — drawn last so it appears on top of all building artwork
    const _dbgShow = window._pShow || [];
    if (_dbgShow.length > 0) {
      getRenderablePlatforms(current).forEach(p => {
        if (!p.id || !_dbgShow.some(pfx => p.id.startsWith(pfx))) return;
        const px = worldToScreenX(p.x, cameraX);
        if (!isHorizontallyVisible(p.x, p.width, cameraX, 50)) return;
        const _e = (window._pAdj || {})[p.id] || {};
        const ay = _e.y||0, ax = _e.x||0, aw = _e.w||0;
        const dy = p.y + ay, dx = px + ax, dw = p.width + aw;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,100,0,0.95)'; ctx.lineWidth = 2;
        ctx.strokeRect(dx, dy, dw, p.height);
        ctx.fillStyle = 'rgba(255,100,0,0.22)';
        ctx.fillRect(dx, dy, dw, p.height);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace';
        ctx.fillText(p.id + '  y=' + Math.round(dy) + '  x=' + Math.round(p.x+ax) + '  w=' + Math.round(dw), dx + 3, dy + 12);
        ctx.restore();
      });
    }

    drawPropPlacementEditorOverlay(ctx, current, cameraX);

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
      const messageText = featureCard.message || '';
      if (isGuardianCard && messageText) {
        const words = messageText.split(' ');
        const lines = words.reduce((nextLines, word) => {
          const currentLine = nextLines[nextLines.length - 1] || '';
          const candidate = currentLine ? `${currentLine} ${word}` : word;
          return ctx.measureText(candidate).width <= cardWidth - 62
            ? [...nextLines.slice(0, -1), candidate]
            : [...nextLines, word];
        }, ['']).filter(Boolean).slice(0, 2);
        lines.forEach((line, index) => {
          ctx.fillText(line, cardCenterX, cardY + 56 + index * 16);
        });
      } else {
        ctx.fillText(messageText, cardCenterX, cardY + (isSectionCard ? 42 : 54));
      }
      ctx.textAlign = 'start';
    }
  }, [backgroundPackId, drawAncientRouteGround, drawArrivalThresholdScene, drawAttackArc, drawCollectible, drawCombatEffects, drawConnectedWorldAmbientLife, drawChinaRiverValleyBackground, drawDesertEntryBackground, drawDesertEntryPrimaryBackgroundPlates, drawDesertForegroundAtmosphere, drawDesertJourneySceneMasks, drawDesertJourneyScenePanels, drawDiscoveryEntrance, drawDynamicEnvironmentEvent, drawEgyptAmbientLife, drawEnemyAttackTell, drawEnvironmentInteraction, drawForegroundDepthLayer, drawMummificationChamberInterior, drawForgottenMuralChamberInterior, drawForgottenMuralChamberTransition, drawHazard, drawHiddenRouteHint, drawLinkedEnemySprite, drawLostBridgeRavineDepth, drawLostBridgeRavineForegroundVoid, drawLostBridgeStructure, drawMiniBoss, drawMissingObjectiveMarker, drawOpeningCinematic, drawOpeningPyramidMasonryBack, drawOpeningSphinxEncounter, drawOpeningThresholdScene, drawParticles, drawPlatform, drawPremiumEgyptianChamberDoor, drawPropPlacementEditorOverlay, drawRouteGate, drawScarabQueenLairOpeningProp, drawScribeLockedChamberInterior, drawSectionParallaxBackground, drawSectionParallaxForeground, drawSectionTransitionBlend, drawSmallEnemySprite, drawStageEntranceFeature, drawStageEntranceForegroundOccluder, drawStoryProp, drawTempleBackdrop, drawTempleThresholdTransition, drawTrapProjectile, drawWorldContinuityLandmark, drawWorldTransitionMarker, getActiveHiddenRoutes, getActiveSecretCollectibles, getCombatMode, getDoorwayGateStatus, getEditedMiniBoss, getEditedNestParams, getGateGuidance, getPlayerAttackState, getRenderableCheckpoints, getRenderableHazards, getRenderablePlatforms, getZIndexSortedRenderableStoryProps, getRouteGateDoorwayEntries, getScarabQueenLairPlacement, isRouteRewardAccessible, resolveChamberEntryTrigger, drawPlayerSprite, drawFieldNoteLabel]);

  const startOpeningCinematic = useCallback(({ speechEnabled = true, fromArrivalThreshold = false } = {}) => {
    const current = stateRef.current;
    if (fromArrivalThreshold) {
      current.arrivalThresholdActive = false;
      current.arrivalThresholdGateTriggered = true;
    }
    audioControls?.unlockExpeditionSfx?.();
    const isRomeCinematic = typeof targetCivilisation === 'string' && targetCivilisation.toLowerCase().includes('rome');
    audioControls?.playExpeditionSfx?.(openingAtmosphereSfxKey);
    if (!isRomeCinematic) {
      audioControls?.playExpeditionSfx?.('anubisPresenceStinger', { volume: 0.82 });
    }
    spokenOpeningLineRef.current = null;
    const activeCinematicLines = getOpeningCinematicLines(targetCivilisation);
    current.openingCinematic = {
      id: isRomeCinematic ? 'asha-legate-opening-cinematic' : 'asha-anubis-opening-cinematic',
      title: isRomeCinematic ? 'The Vault Speaks First' : 'The First Seal Watches',
      duration: OPENING_CINEMATIC_DURATION,
      timer: OPENING_CINEMATIC_DURATION,
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
  }, [audioControls, openingAtmosphereSfxKey, syncHud, targetCivilisation]);

  const startJourneyWithoutOpeningScene = useCallback(() => {
    const current = stateRef.current;
    audioControls?.unlockExpeditionSfx?.();
    audioControls?.playExpeditionSfx?.(openingAtmosphereSfxKey);
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    spokenOpeningLineRef.current = null;
    current.openingCinematic = null;
    current.openingConfrontationSeen = true;
    current.player.vx = 0;
    current.player.vy = 0;
    current.notice = SCARAB_SEAL_TRIGGER.objectiveEchoLine;
    setBriefingOpen(false);
    syncHud();
  }, [audioControls, openingAtmosphereSfxKey, syncHud]);

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
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    current.openingCinematic = null;
    current.notice = OPENING_ARRIVAL_AFTERSHOCK_NOTICE;
    current.cinematicEvent = {
      id: 'opening-arrival-aftershock',
      name: 'Asha',
      message: OPENING_ARRIVAL_AFTERSHOCK_NOTICE,
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
    const dustBase = { type: 'movement-dust', y: player.y + player.height - 5, direction: -dodgeDirection, color: 'rgba(230, 173, 96, 0.72)', maxTimer: 0.28 };
    addCombatEffect(current, { ...dustBase, x: player.x + player.width / 2, timer: 0.28 });
    addCombatEffect(current, { ...dustBase, x: player.x + player.width / 2 - dodgeDirection * 14, timer: 0.22 });
    addCombatEffect(current, { ...dustBase, x: player.x + player.width / 2 - dodgeDirection * 26, timer: 0.16 });
    audioControls?.playExpeditionSfx?.('dodgeStep', { volume: 0.78 });
  }, [audioControls, briefingOpen, addCombatEffect]);

  const completeOpeningThresholdScene = useCallback((current) => {
    const openingCheckpoint = getRenderableCheckpoints().find(checkpoint => checkpoint.id === 'desert-entry');
    const openingSection = SECTIONS.find(section => section.id === 'desert-entry');
    if (openingCheckpoint) {
      current.player.vx = 0;
      current.player.vy = 0;
      current.player.direction = 1;
      current.player.x = ARRIVAL_THRESHOLD_SPAWN_X;
      current.player.y = GROUND_Y - current.player.height;
      current.player.onGround = true;
      current.activeCheckpoint = openingCheckpoint;
      current.cameraX = clampCameraX(ARRIVAL_THRESHOLD_SPAWN_X - CANVAS_WIDTH * 0.44);
      current.targetCameraX = current.cameraX;
    }
    current.openingThresholdScene = null;
    current.openingSphinxEncounter = null;
    current.arrivalThresholdActive = true;
    current.arrivalThresholdStarted = true;
    current.arrivalThresholdLeftInspected = false;
    current.arrivalThresholdMarkingsInspected = false;
    current.arrivalThresholdGateTriggered = false;
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
      cinematic.activeLineId = activeLine?.id || null;
      cinematic.activeLine = activeLine || null;
      current.notice = activeLine?.text || 'The first seal watches.';
      current.attackQueued = false;
      player.vx = 0;
      player.vy = 0;
      player.direction = 1;
      if (!cinematic.spellImpactTriggered && elapsed >= OPENING_CINEMATIC_SPELL_IMPACT_AT) {
        cinematic.spellImpactTriggered = true;
        cinematic.shieldShattered = true;
        current.player.x = 44;
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
        current.player.x = 44;
        current.player.y = GROUND_Y - current.player.height;
        current.cameraX = 0;
        current.targetCameraX = 0;
        current.notice = OPENING_ARRIVAL_AFTERSHOCK_NOTICE;
        current.cinematicEvent = {
          id: 'opening-arrival-aftershock',
          name: 'Asha',
          message: OPENING_ARRIVAL_AFTERSHOCK_NOTICE,
          temporary: true,
        };
        current.cinematicTimer = 3.4;
        audioControls?.playExpeditionSfx?.('lostSiteAirShift', { volume: 0.64 });
        current.openingCameraRevealTimer = Math.max(current.openingCameraRevealTimer, OPENING_CAMERA_REVEAL_DURATION);
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.24);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.12);
      } else if (Math.abs(elapsed - OPENING_CINEMATIC_SPELL_IMPACT_AT) < dt + 0.02) {
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
        const enteringMummificationChamber = transition.toSceneId === JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER;
        const enteringForgottenMuralChamber = transition.toSceneId === JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER;
        const enteringScribeChamber = transition.toSceneId === JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER;
        transition.phase = enteringMummificationChamber
          ? 'mummification-chamber-reveal'
          : enteringForgottenMuralChamber
            ? 'chamber-reveal'
            : enteringScribeChamber
            ? 'scribe-chamber-reveal'
            : 'exterior-return';
        current.previousSceneId = transition.fromSceneId || getJourneySceneId(current);
        current.currentSceneId = transition.toSceneId || JOURNEY_SCENE_IDS.EXTERIOR;
        current.mummificationChamberActive = enteringMummificationChamber;
        current.forgottenMuralChamberActive = enteringForgottenMuralChamber;
        current.scribeChamberActive = enteringScribeChamber;
        if (enteringMummificationChamber) {
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
            : current.forgottenMuralChamberRestored
              ? 'Asha returns to the exterior route with the warning preserved.'
              : current.mummificationChamberPuzzleSolved
              ? 'Asha leaves the Mummification Chamber with the sacred rite recorded.'
                : 'Asha returns to the exterior route.';
          current.mummificationChamberActive = false;
          current.scribeChamberActive = false;
        }
        player.vx = 0;
        player.vy = 0;
        player.onGround = true;
      }
      if (transition.timer <= 0) {
        const endedInMummificationChamber = getJourneySceneId(current) === JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER;
        const endedInForgottenMuralChamber = getJourneySceneId(current) === JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER;
        const endedInScribeChamber = getJourneySceneId(current) === JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER;
        current.sceneTransition = null;
        current.forgottenMuralChamberTransition = null;
        current.notice = endedInMummificationChamber
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
    if (isMummificationChamberScene(current)) {
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
      player.y = GROUND_Y - player.height;
      player.vy = 0;
      player.onGround = true;
      player.airJumpsUsed = 0;
      current.attackQueued = false;
      current.attackWindupTimer = 0;
      current.attackTimer = 0;
      current.attackRecoilTimer = 0;
      current.trapProjectiles = [];
      current.currentSectionId = 'desert-entry';
      current.lastSectionId = 'desert-entry';
      current.resources.stamina = Math.max(current.resources.stamina, Math.min(maxStamina, 35));
      current.arrivalThresholdNoticeTimer = Math.max(0, (current.arrivalThresholdNoticeTimer || 0) - dt);
      const arrivalCenterX = player.x + player.width / 2;
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
      if (!current.arrivalThresholdGateTriggered && arrivalCenterX >= ARRIVAL_THRESHOLD_FORWARD_GATE_TRIGGER_X) {
        current.arrivalThresholdGateTriggered = true;
        player.vx = 0;
        player.vy = 0;
        current.cinematicEvent = null;
        current.cinematicTimer = 0;
        current.notice = 'The forward gate answers.';
        audioControls?.playExpeditionSfx?.('openingThresholdFinalPulse', { volume: 0.82 });
        startOpeningCinematic({ speechEnabled: true, fromArrivalThreshold: true });
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
    const mummificationEntryDoor = CHAMBER_DOOR_VISUALS_BY_ID['mummification-chamber-entry-door'];
    const forgottenMuralEntryDoor = CHAMBER_DOOR_VISUALS_BY_ID['forgotten-mural-entry-door'];
    const scribeEntryDoor = CHAMBER_DOOR_VISUALS_BY_ID['scribe-chamber-entry-door'];
    const mummificationEntryTrigger = resolveChamberEntryTrigger(mummificationEntryDoor) || MUMMIFICATION_CHAMBER_ENTRY_TRIGGER;
    const forgottenMuralEntryTrigger = resolveChamberEntryTrigger(forgottenMuralEntryDoor) || FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER;
    const scribeEntryTrigger = resolveChamberEntryTrigger(scribeEntryDoor) || SCRIBE_CHAMBER_ENTRY_TRIGGER;
    const mummificationReturnPoint = (direction = 1) => resolveChamberReturnPoint(mummificationEntryDoor, direction);
    const forgottenMuralReturnPoint = (direction = 1) => resolveChamberReturnPoint(forgottenMuralEntryDoor, direction);
    const scribeReturnPoint = (direction = 1) => resolveChamberReturnPoint(scribeEntryDoor, direction);

    const mummificationChamberDoorwayActive = backgroundPackId !== 'china-river-valley'
      && currentSceneId === JOURNEY_SCENE_IDS.EXTERIOR
      && player.onGround
      && forgottenMuralPlayerCenterX >= mummificationEntryTrigger.minX
      && forgottenMuralPlayerCenterX <= mummificationEntryTrigger.maxX
      && player.y < mummificationEntryTrigger.maxY
      && Math.abs(forgottenMuralPlayerFootY - mummificationEntryTrigger.footY) <= mummificationEntryTrigger.footTolerance;
    const forgottenMuralDoorwayActive = backgroundPackId !== 'china-river-valley'
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

    const scribeDoorwayActive = backgroundPackId !== 'china-river-valley'
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

    if (!inInteriorChamberScene && backgroundPackId !== 'china-river-valley' && !current.scarabSealActivated) {
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
        const thresholdLines = [
          { speaker: 'Asha', text: ARRIVAL_THRESHOLD_SPAWN_LINE, at: 0.8 },
          { speaker: 'Asha', text: 'The world fell away.', at: 3.0 },
          { speaker: 'Asha', text: 'I have to find where the seal brought me.', at: 6.0 },
        ];
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
        current.cinematicEvent = null;
        current.cinematicTimer = 0;
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, SCARAB_SEAL_TRIGGER.duration * 0.45);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, SCARAB_SEAL_TRIGGER.shake);
        current.notice = '';
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
      && backgroundPackId !== 'china-river-valley'
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
        const shouldEchoOpeningFirstShard = backgroundPackId !== 'china-river-valley'
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
      const scarabSealRequired = backgroundPackId !== 'china-river-valley'
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
        const scarabQueenCinematic = b.id === SCARAB_SEAL_TRIGGER.bossId && backgroundPackId !== 'china-river-valley';
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

  }, [briefingOpen, audioControls, onComplete, triggerJourneyRescue, backgroundPackId, openingAtmosphereSfxKey, scopedJourneyAssetPacks.isChinaJourney, scopedJourneyAssetPacks.isRomeJourney, targetCivilisation, buildBossRewardMoment, completeOpeningThresholdScene, enterLevelFromThreshold, startLevelThresholdEncounter, startTempleThresholdTransition, getActiveHiddenRoutes, getActiveSecretCollectibles, getActiveShardGateProgress, getAttackBox, getAttackHurtbox, getPlayerAttackNearMissTarget, getBossPhaseConfig, getBossVulnerabilityState, getDoorwayGateStatus, getEnemyPatternConfig, getObjectiveProgress, getGateGuidance, getRenderableCheckpoints, getRenderableHazards, getRenderablePlatforms, getRenderableTrapPlatforms, getLiveScorpionNestBlockers, getRouteAccessState, getRouteGateDoorwayEntries, isRouteRewardAccessible, isLowStamina, addCombatEffect, applyCombatHitImpact, recordEnvironmentInteraction, getPlayerAttackState, getSectionDisplayName, getSectionDisplayTitle, resolveChamberEntryTrigger, resolveChamberReturnPoint, syncHud]);

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
          const scarabQueenCinematic = boss.id === SCARAB_SEAL_TRIGGER.bossId && backgroundPackId !== 'china-river-valley';
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
          current.player.x = clamp(arenaStart + 44, 0, WORLD_WIDTH - current.player.width);
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
  }, [addCombatEffect, backgroundPackId, buildBossRewardMoment, createJourneySnapshot, getRenderableCheckpoints, startTempleThresholdTransition, step, syncHud]);

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    const handlePropEditorKeyDown = (event) => {
      if (isJourneyEditorFormTarget(event.target)) return;
      const editor = propPlacementEditorRef.current;
      // Plain E is reserved for the in-world Journey Room interact system, so the
      // dev prop-editor toggle requires Shift+E.
      if (event.code === 'KeyE' && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        editor.enabled = !editor.enabled;
        if (editor.enabled) {
          applyDefaultEditorLocks(stateRef.current);
        } else {
          editor.selectedPropId = null;
          editor.selectedPlatformId = null;
          editor.selectedHazardId = null;
          editor.selectedArchId = null;
          editor.selectedCheckpointId = null;
          editor.selectedLairId = null;
          editor.selectedNestId = null;
          editor.dragging = null;
          editor.hover = null;
        }
        refreshPropEditorUi();
        return;
      }
      if (!editor.enabled) return;
      // Tab cycles through entities stacked under the cursor (the hover preview updates,
      // and the next click selects whatever is highlighted).
      if (event.code === 'Tab' && editor.hover && editor.hover.stack && editor.hover.stack.length > 1) {
        event.preventDefault();
        const count = editor.hover.stack.length;
        const step = event.shiftKey ? -1 : 1;
        editor.hover = {
          ...editor.hover,
          index: ((editor.hover.index + step) % count + count) % count,
        };
        draw();
        return;
      }
      // Scorpion-nest tuning: keys adjust the selected nest's size/anchor/glow.
      const selectedNestForKeys = getPropEditorSelectedNest();
      if (selectedNestForKeys && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const id = selectedNestForKeys.id;
        const cur = getEditedNestParams(selectedNestForKeys);
        const applyNest = (patch) => {
          editor.scorpionNestEdits[id] = { ...(editor.scorpionNestEdits[id] || {}), ...patch };
          refreshPropEditorUi();
        };
        switch (event.code) {
          case 'BracketLeft':
            event.preventDefault();
            applyNest({ widthScale: Math.max(0.3, Number((cur.widthScale - 0.05).toFixed(2))) });
            return;
          case 'BracketRight':
            event.preventDefault();
            applyNest({ widthScale: Number((cur.widthScale + 0.05).toFixed(2)) });
            return;
          case 'Semicolon':
            event.preventDefault();
            applyNest({ yOffset: cur.yOffset - 1 });
            return;
          case 'Quote':
            event.preventDefault();
            applyNest({ yOffset: cur.yOffset + 1 });
            return;
          case 'Comma':
            event.preventDefault();
            applyNest({ glowYFactor: Number((cur.glowYFactor - 0.02).toFixed(2)) });
            return;
          case 'Period':
            event.preventDefault();
            applyNest({ glowYFactor: Number((cur.glowYFactor + 0.02).toFixed(2)) });
            return;
          case 'Digit9':
            event.preventDefault();
            applyNest({ glowSize: Math.max(0.1, Number((cur.glowSize - 0.05).toFixed(2))) });
            return;
          case 'Digit0':
            event.preventDefault();
            applyNest({ glowSize: Number((cur.glowSize + 0.05).toFixed(2)) });
            return;
          case 'Backslash':
            event.preventDefault();
            delete editor.scorpionNestEdits[id];
            refreshPropEditorUi();
            return;
          default:
            break;
        }
      }
      if (event.code === 'KeyG' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        editor.gridSnap = !editor.gridSnap;
        refreshPropEditorUi();
        return;
      }
      if (event.code === 'KeyP' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        editor.paletteOpen = !editor.paletteOpen;
        if (!editor.paletteOpen) editor.selectedPaletteKey = null;
        refreshPropEditorUi();
        return;
      }
      // Escape is two-stage while the palette is open: first press disarms the held
      // item (back to select/move clicks), second press closes the palette.
      if (event.code === 'Escape' && editor.paletteOpen) {
        event.preventDefault();
        if (editor.selectedPaletteKey) editor.selectedPaletteKey = null;
        else editor.paletteOpen = false;
        refreshPropEditorUi();
        return;
      }
      if (event.code === 'KeyT' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        editor.showTrapTriggers = !editor.showTrapTriggers;
        refreshPropEditorUi();
        return;
      }
      if (event.code === 'KeyH' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        editor.previewMode = !editor.previewMode;
        refreshPropEditorUi();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyZ') {
        event.preventDefault();
        if (event.shiftKey) redoEditorChange();
        else undoEditorChange();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyY') {
        event.preventDefault();
        redoEditorChange();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
        event.preventDefault();
        savePropPlacementExport();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyD') {
        event.preventDefault();
        duplicateSelectedPropInEditor();
        return;
      }
      // Anchor nudge: ; lifts and ' drops the selected prop's vertical anchor (yOffset),
      // mirroring the scorpion-nest anchor keys so any asset can be placed exactly. Hold
      // Shift for a coarse 10px step. Negative yOffset lifts the art up off the ground line.
      if ((event.code === 'Semicolon' || event.code === 'Quote') && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          const step = event.shiftKey ? 10 : 1;
          const direction = event.code === 'Semicolon' ? -1 : 1;
          const currentYOffset = Number.isFinite(selectedProp.yOffset) ? selectedProp.yOffset : 0;
          updateSelectedPropEditorTransform({ yOffset: Math.round(currentYOffset + direction * step) });
        }
        return;
      }
      // Arrow keys fine-nudge the selected prop's position (Shift = 10px). A/D still walk
      // the camera, so deselect (or use WASD) to move around. preventDefault + the gameplay
      // guard below stop the player from also moving while a prop is selected.
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code) && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          event.preventDefault();
          const step = event.shiftKey ? 10 : 1;
          const dx = event.code === 'ArrowLeft' ? -step : event.code === 'ArrowRight' ? step : 0;
          const dy = event.code === 'ArrowUp' ? -step : event.code === 'ArrowDown' ? step : 0;
          const currentX = Number.isFinite(selectedProp.x) ? selectedProp.x : 0;
          const currentY = Number.isFinite(selectedProp.y) ? selectedProp.y : 0;
          updateSelectedPropEditorTransform({ x: Math.round(currentX + dx), y: Math.round(currentY + dy) });
          return;
        }
      }
      if (event.code === 'KeyQ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          updateSelectedPropEditorTransform({
            rotation: (Number.isFinite(selectedProp.rotation) ? selectedProp.rotation : 0) - DEFAULT_JOURNEY_PROP_EDITOR_ROTATION_STEP,
          });
        }
        return;
      }
      if (event.code === 'KeyR' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          updateSelectedPropEditorTransform({
            rotation: (Number.isFinite(selectedProp.rotation) ? selectedProp.rotation : 0) + DEFAULT_JOURNEY_PROP_EDITOR_ROTATION_STEP,
          });
        }
        return;
      }
      if (event.code === 'KeyF' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          updateSelectedPropEditorTransform({ mirrorX: !selectedProp.mirrorX });
        }
        return;
      }
      if (event.code === 'KeyV' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          updateSelectedPropEditorTransform({ mirrorY: !selectedProp.mirrorY });
        }
        return;
      }
      if ((['Equal', 'NumpadAdd', 'NumpadMultiply'].includes(event.code) || event.key === '+' || event.key === '*') && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          updateSelectedPropEditorTransform({
            scale: (Number.isFinite(selectedProp.scale) ? selectedProp.scale : 1) + DEFAULT_JOURNEY_PROP_EDITOR_SCALE_STEP,
          });
        }
        return;
      }
      if ((['Minus', 'NumpadSubtract', 'NumpadDivide'].includes(event.code) || event.key === '-' || event.key === '_') && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          updateSelectedPropEditorTransform({
            scale: Math.max(0.1, (Number.isFinite(selectedProp.scale) ? selectedProp.scale : 1) - DEFAULT_JOURNEY_PROP_EDITOR_SCALE_STEP),
          });
        }
        return;
      }
      if (event.code === 'Delete' || event.code === 'Backspace') {
        event.preventDefault();
        deleteSelectedPropFromEditor();
      }
    };
    window.addEventListener('keydown', handlePropEditorKeyDown);
    return () => window.removeEventListener('keydown', handlePropEditorKeyDown);
  }, [applyDefaultEditorLocks, deleteSelectedPropFromEditor, draw, duplicateSelectedPropInEditor, getEditedNestParams, getPropEditorSelectedNest, getPropEditorSelectedProp, redoEditorChange, refreshPropEditorUi, savePropPlacementExport, undoEditorChange, updateSelectedPropEditorTransform]);

  // Right-click over the canvas (and the stack-picker overlay) opens our own selection
  // list, so suppress the browser's native context menu there while the editor is on.
  // A document-level listener is needed because the stack-picker backdrop (fixed, full
  // viewport) becomes the contextmenu target the moment the picker opens, bypassing any
  // handler bound only to the canvas.
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    const handleContextMenu = (event) => {
      if (!propPlacementEditorRef.current.enabled) return;
      const target = event.target;
      const overPicker = target?.closest?.('.journey-prop-editor-stackpicker, .journey-prop-editor-stackpicker-backdrop');
      if (target === canvasRef.current || overPicker) event.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

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
  const openingSpellImpactActive = Boolean(
    gameState.openingCinematic
    && (gameState.openingCinematic.spellImpactTriggered
      || openingIntroProgress >= OPENING_CINEMATIC_SPELL_IMPACT_AT / OPENING_CINEMATIC_DURATION),
  );
  const openingShieldShattered = Boolean(gameState.openingCinematic?.shieldShattered || openingSpellImpactActive);
  const openingCinematicActive = Boolean(gameState.openingCinematic || gameState.openingThresholdScene || gameState.templeThresholdTransition);

  const handlePointerDown = (e) => {
    const editor = propPlacementEditorRef.current;
    if (import.meta.env.DEV && editor.enabled) {
      const pointer = getPropEditorPointer(e);
      if (!pointer) return;
      if (editor.selectedPaletteKey) {
        if (String(editor.selectedPaletteKey).startsWith('trap:') || editor.selectedPaletteCategory === 'trap') {
          createTrapFromEditorPalette(pointer);
        } else if (String(editor.selectedPaletteKey).startsWith('platform:') || editor.selectedPaletteCategory === 'platform') {
          createPlatformFromEditorPalette(pointer);
        } else {
          createPropFromEditorPalette(pointer);
        }
        editor.dragging = null;
        e.preventDefault();
        draw();
        return;
      }
      // Alt+click or right-click opens a clickable list of every entity stacked under
      // the cursor, so buried props can be selected without Tab-cycling through them.
      const wantsStackPicker = e.button === 2 || (e.button === 0 && e.altKey);
      if (wantsStackPicker) {
        const stack = buildEditorHoverStack(pointer.screenX, pointer.screenY);
        editor.stackPicker = stack.length ? {
          clientX: e.clientX,
          clientY: e.clientY,
          items: stack.map(d => ({
            kind: d.kind,
            id: d.id,
            label: getEditorEntityLabel(d),
            locked: isEditorLockKeyLocked(`${d.kind}:${d.id}`),
          })),
        } : null;
        e.preventDefault();
        refreshPropEditorUi();
        return;
      }
      // Any normal click dismisses an open stack picker before selecting.
      if (editor.stackPicker) editor.stackPicker = null;
      // Transform handles on the already-selected prop take priority over re-selecting:
      // corner squares scale, the knob above rotates. Only fires on a precise handle
      // hit, so normal click-to-select/move below is untouched.
      if (editor.selectedPropId) {
        const current = stateRef.current;
        const selectedForHandle = getPropEditorSelectedProp(current);
        if (selectedForHandle && !isEditorLockKeyLocked(`prop:${selectedForHandle.id}`)) {
          const handleBounds = getStoryPropEditorBounds(selectedForHandle, current.cameraX || 0, current);
          const handle = hitTestPropTransformHandle(pointer.screenX, pointer.screenY, handleBounds);
          if (handle) {
            const cx = handleBounds.x + handleBounds.width / 2;
            const cy = handleBounds.y + handleBounds.height / 2;
            if (handle === 'rotate') {
              editor.dragging = {
                kind: 'prop-rotate',
                propId: selectedForHandle.id,
                cx,
                cy,
                startRotation: Number.isFinite(selectedForHandle.rotation) ? selectedForHandle.rotation : 0,
                startAngle: Math.atan2(pointer.screenY - cy, pointer.screenX - cx) * 180 / Math.PI,
              };
            } else {
              editor.dragging = {
                kind: 'prop-scale',
                propId: selectedForHandle.id,
                cx,
                cy,
                startScale: Number.isFinite(selectedForHandle.scale) ? selectedForHandle.scale : 1,
                startDist: Math.max(1, Math.hypot(pointer.screenX - cx, pointer.screenY - cy)),
              };
            }
            e.currentTarget.setPointerCapture?.(e.pointerId);
            e.preventDefault();
            draw();
            refreshPropEditorUi();
            return;
          }
        }
      }
      // If the user has Tab-cycled to a buried entity at this point, select that one
      // (what the hover preview shows). index 0 falls through to the normal cascade so
      // default clicks behave exactly as before.
      const hover = editor.hover;
      if (hover && hover.index > 0 && hover.stack && hover.stack.length > hover.index) {
        const clickStack = buildEditorHoverStack(pointer.screenX, pointer.screenY);
        const signature = clickStack.map(d => `${d.kind}:${d.id}`).join('|');
        if (signature === hover.signature) {
          const descriptor = clickStack[hover.index];
          if (!isEditorLockKeyLocked(`${descriptor.kind}:${descriptor.id}`)) {
            editor.selectedPropId = null;
            editor.selectedPlatformId = null;
            editor.selectedHazardId = null;
            editor.selectedArchId = null;
            editor.selectedCheckpointId = null;
            editor.selectedLairId = null;
            editor.selectedNestId = null;
            const { kind, entity } = descriptor;
            if (kind === 'prop') {
              editor.selectedPropId = entity.id;
              editor.dragging = { kind: 'prop', propId: entity.id, offsetX: pointer.worldX - entity.x, offsetY: pointer.worldY - entity.y };
            } else if (kind === 'platform') {
              const platformId = entity.id || entity.label;
              editor.selectedPlatformId = platformId;
              editor.dragging = { kind: 'platform', platformId, offsetX: pointer.worldX - entity.x, offsetY: pointer.worldY - entity.y };
            } else if (kind === 'hazard') {
              editor.selectedHazardId = entity.id;
              editor.dragging = { kind: 'hazard', hazardId: entity.id, offsetX: pointer.worldX - entity.x, offsetY: pointer.screenY - entity.y };
            } else if (kind === 'arch') {
              editor.selectedArchId = entity.editorId;
              const archX = entity.editorKind === 'doorway'
                ? (Number.isFinite(entity.anchorX) ? entity.anchorX : entity.blockX)
                : entity.x;
              editor.dragging = { kind: 'arch', archId: entity.editorId, offsetX: pointer.worldX - archX, offsetY: pointer.screenY - entity.y };
            } else if (kind === 'checkpoint') {
              editor.selectedCheckpointId = entity.id;
              editor.dragging = { kind: 'checkpoint', checkpointId: entity.id, offsetX: pointer.worldX - entity.x, offsetY: pointer.screenY - entity.y };
            } else if (kind === 'lair') {
              editor.selectedLairId = entity.id;
              const placement = getScarabQueenLairPlacement(entity);
              editor.dragging = { kind: 'lair', lairId: entity.id, offsetX: pointer.worldX - placement.x, offsetY: pointer.screenY - placement.y };
            } else if (kind === 'nest') {
              editor.selectedNestId = entity.id;
              const params = getEditedNestParams(entity);
              editor.dragging = { kind: 'nest', nestId: entity.id, offsetX: pointer.worldX - params.x, offsetY: pointer.worldY - params.y };
            }
            e.currentTarget.setPointerCapture?.(e.pointerId);
          } else {
            editor.dragging = null;
          }
          e.preventDefault();
          draw();
          refreshPropEditorUi();
          return;
        }
      }
      const selectedForcedFloor = editor.floorPickMode
        ? findEditablePlatformAt(pointer.screenX, pointer.screenY, { floorOnly: true })
        : null;
      // Scorpion nest takes priority over the crowded selection chain (but not forced
      // floor-pick mode). Handled here with an early return so the tested hazard ->
      // platform -> prop ordering below stays byte-for-byte intact.
      const selectedNest = selectedForcedFloor ? null : findEditableNestAt(pointer.screenX, pointer.screenY);
      if (selectedNest && !isEditorLockKeyLocked(`nest:${selectedNest.id}`)) {
        editor.selectedPropId = null;
        editor.selectedPlatformId = null;
        editor.selectedHazardId = null;
        editor.selectedArchId = null;
        editor.selectedCheckpointId = null;
        editor.selectedLairId = null;
        editor.selectedNestId = selectedNest.id;
        const params = getEditedNestParams(selectedNest);
        editor.dragging = {
          kind: 'nest',
          nestId: selectedNest.id,
          offsetX: pointer.worldX - params.x,
          offsetY: pointer.worldY - params.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
        e.preventDefault();
        draw();
        refreshPropEditorUi();
        return;
      }
      const selectedHazard = selectedForcedFloor ? null : findEditableHazardAt(pointer.screenX, pointer.screenY);
      const selectedLair = selectedHazard || selectedForcedFloor ? null : findEditableScarabLairAt(pointer.screenX, pointer.screenY);
      const selectedCheckpoint = selectedHazard || selectedLair || selectedForcedFloor ? null : findEditableCheckpointAt(pointer.screenX, pointer.screenY);
      const selectedArch = selectedHazard || selectedLair || selectedCheckpoint || selectedForcedFloor ? null : findEditableArchAt(pointer.screenX, pointer.screenY);
      const selectedSolidPlatform = selectedHazard || selectedLair || selectedCheckpoint || selectedArch || selectedForcedFloor
        ? null
        : findEditablePlatformAt(pointer.screenX, pointer.screenY, { includeFloors: false });
      const selectedProp = selectedHazard || selectedLair || selectedCheckpoint || selectedArch || selectedForcedFloor || selectedSolidPlatform ? null : findEditableStoryPropAt(pointer.screenX, pointer.screenY);
      const selectedFallbackFloor = editor.floorPickMode || selectedHazard || selectedLair || selectedCheckpoint || selectedArch || selectedSolidPlatform || selectedProp
        ? null
        : findEditablePlatformAt(pointer.screenX, pointer.screenY, { floorOnly: true });
      const selectedPlatform = selectedForcedFloor || selectedSolidPlatform || selectedFallbackFloor;
      editor.selectedPropId = selectedProp?.id || null;
      editor.selectedPlatformId = selectedPlatform ? selectedPlatform.id || selectedPlatform.label : null;
      editor.selectedHazardId = selectedHazard?.id || null;
      editor.selectedArchId = selectedArch?.editorId || null;
      editor.selectedCheckpointId = selectedCheckpoint?.id || null;
      editor.selectedLairId = selectedLair?.id || null;
      editor.selectedNestId = null;
      const selectedLockKey = selectedProp
        ? `prop:${selectedProp.id}`
        : selectedPlatform
          ? `platform:${selectedPlatform.id || selectedPlatform.label}`
        : selectedHazard
          ? `hazard:${selectedHazard.id}`
        : selectedArch
          ? `arch:${selectedArch.editorId}`
        : selectedCheckpoint
          ? `checkpoint:${selectedCheckpoint.id}`
        : selectedLair
          ? `lair:${selectedLair.id}`
        : null;
      if (isEditorLockKeyLocked(selectedLockKey)) {
        editor.dragging = null;
        e.preventDefault();
        draw();
        refreshPropEditorUi();
        return;
      }
      if (selectedProp) {
        editor.dragging = {
          kind: 'prop',
          propId: selectedProp.id,
          offsetX: pointer.worldX - selectedProp.x,
          offsetY: pointer.worldY - selectedProp.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else if (selectedPlatform) {
        editor.dragging = {
          kind: 'platform',
          platformId: selectedPlatform.id || selectedPlatform.label,
          offsetX: pointer.worldX - selectedPlatform.x,
          offsetY: pointer.worldY - selectedPlatform.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else if (selectedHazard) {
        editor.dragging = {
          kind: 'hazard',
          hazardId: selectedHazard.id,
          offsetX: pointer.worldX - selectedHazard.x,
          offsetY: pointer.screenY - selectedHazard.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else if (selectedLair) {
        const placement = getScarabQueenLairPlacement(selectedLair);
        editor.dragging = {
          kind: 'lair',
          lairId: selectedLair.id,
          offsetX: pointer.worldX - placement.x,
          offsetY: pointer.screenY - placement.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else if (selectedArch) {
        const archX = selectedArch.editorKind === 'doorway'
          ? Number.isFinite(selectedArch.anchorX) ? selectedArch.anchorX : selectedArch.blockX
          : selectedArch.x;
        editor.dragging = {
          kind: 'arch',
          archId: selectedArch.editorId,
          offsetX: pointer.worldX - archX,
          offsetY: pointer.screenY - selectedArch.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else if (selectedCheckpoint) {
        editor.dragging = {
          kind: 'checkpoint',
          checkpointId: selectedCheckpoint.id,
          offsetX: pointer.worldX - selectedCheckpoint.x,
          offsetY: pointer.screenY - selectedCheckpoint.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else {
        editor.dragging = null;
      }
      e.preventDefault();
      draw();
      refreshPropEditorUi();
      return;
    }
    if (!window.__expeditionDebugOverlay) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pointer = getPropEditorPointer(e);
    if (!pointer) return;
    
    const worldX = pointer.worldX;
    const worldY = pointer.worldY - JOURNEY_VERTICAL_OFFSET;

    const platform = PLATFORMS.find(p => 
      worldX >= p.x && worldX <= p.x + p.width &&
      worldY >= p.y && worldY <= p.y + p.height
    );

    if (platform) {
      window.__draggedPlatform = platform;
      window.__dragOffsetX = worldX - platform.x;
      window.__dragOffsetY = worldY - platform.y;
    }
  };

  const handlePointerMove = (e) => {
    const editor = propPlacementEditorRef.current;
    if (import.meta.env.DEV && editor.enabled && !editor.dragging && !editor.selectedPaletteKey) {
      const pointer = getPropEditorPointer(e);
      if (pointer) {
        updateEditorHover(pointer.screenX, pointer.screenY);
        draw();
      }
      return;
    }
    if (import.meta.env.DEV && editor.enabled && editor.dragging) {
      const pointer = getPropEditorPointer(e);
      if (!pointer) return;
      if (editor.dragging.kind === 'lair') {
        const baseLair = getMiniBossEditorBaseBossById(editor.dragging.lairId);
        if (!baseLair) return;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.screenY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        editor.miniBossEdits[baseLair.id] = {
          ...(editor.miniBossEdits[baseLair.id] || {}),
          lairX: nextX,
          lairY: nextY,
        };
      } else if (editor.dragging.kind === 'nest') {
        const baseNest = getRenderableScorpionNests().find(enemy => enemy.id === editor.dragging.nestId);
        if (!baseNest) return;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.worldY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        editor.scorpionNestEdits[baseNest.id] = {
          ...(editor.scorpionNestEdits[baseNest.id] || {}),
          x: nextX,
          y: nextY,
        };
      } else if (editor.dragging.kind === 'arch') {
        const [, id] = editor.dragging.archId.split(':');
        const baseArch = editor.dragging.archId.startsWith('doorway:')
          ? getRouteGateEditorBaseDoorwayById(id)
          : getRouteGateEditorBaseGateById(id);
        if (!baseArch) return;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.screenY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        if (editor.dragging.archId.startsWith('doorway:')) {
          editor.routeGateDoorwayEdits[id] = {
            ...(editor.routeGateDoorwayEdits[id] || {}),
            x: nextX,
            y: nextY,
          };
        } else {
          editor.routeGateEdits[id] = {
            ...(editor.routeGateEdits[id] || {}),
            x: nextX,
            y: nextY,
          };
        }
      } else if (editor.dragging.kind === 'checkpoint') {
        const baseCheckpoint = getCheckpointEditorBaseCheckpointById(editor.dragging.checkpointId);
        if (!baseCheckpoint) return;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.screenY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        editor.checkpointEdits[baseCheckpoint.id] = {
          ...(editor.checkpointEdits[baseCheckpoint.id] || {}),
          x: nextX,
          y: nextY,
        };
      } else if (editor.dragging.kind === 'hazard') {
        const baseHazard = getHazardEditorBaseHazardById(editor.dragging.hazardId);
        if (!baseHazard) return;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.screenY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        editor.hazardEdits[baseHazard.id] = {
          ...(editor.hazardEdits[baseHazard.id] || {}),
          x: nextX,
          y: nextY,
        };
      } else if (editor.dragging.kind === 'platform') {
        const basePlatform = getPlatformEditorBasePlatformById(editor.dragging.platformId);
        if (!basePlatform) return;
        const platformId = basePlatform.id || basePlatform.label;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.worldY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        editor.platformEdits[platformId] = {
          ...(editor.platformEdits[platformId] || {}),
          x: nextX,
          y: nextY,
        };
      } else if (editor.dragging.kind === 'prop-scale') {
        const baseProp = getPropEditorBasePropById(editor.dragging.propId);
        if (!baseProp) return;
        const dist = Math.hypot(pointer.screenX - editor.dragging.cx, pointer.screenY - editor.dragging.cy);
        const ratio = dist / editor.dragging.startDist;
        const nextScale = Math.round(clamp(editor.dragging.startScale * ratio, 0.1, 12) * 100) / 100;
        editor.edits[baseProp.id] = {
          ...(editor.edits[baseProp.id] || {}),
          scale: nextScale,
        };
      } else if (editor.dragging.kind === 'prop-rotate') {
        const baseProp = getPropEditorBasePropById(editor.dragging.propId);
        if (!baseProp) return;
        const angle = Math.atan2(pointer.screenY - editor.dragging.cy, pointer.screenX - editor.dragging.cx) * 180 / Math.PI;
        let nextRotation = editor.dragging.startRotation + (angle - editor.dragging.startAngle);
        nextRotation = ((nextRotation + 180) % 360 + 360) % 360 - 180; // normalize to (-180, 180]
        if (editor.gridSnap) nextRotation = Math.round(nextRotation / 15) * 15; // snap to 15° with grid snap on
        nextRotation = Math.round(nextRotation * 10) / 10;
        editor.edits[baseProp.id] = {
          ...(editor.edits[baseProp.id] || {}),
          rotation: nextRotation,
        };
      } else {
        const baseProp = getPropEditorBasePropById(editor.dragging.propId);
        if (!baseProp) return;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.worldY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        const nextEdit = getGroundAwareStoryPropEditorEdit(getEditedStoryProp(baseProp) || baseProp, { x: nextX, y: nextY });
        editor.edits[baseProp.id] = {
          ...(editor.edits[baseProp.id] || {}),
          ...nextEdit,
        };
      }
      e.preventDefault();
      draw();
      refreshPropEditorUi();
      return;
    }
    if (!window.__draggedPlatform) return;
    const pointer = getPropEditorPointer(e);
    if (!pointer) return;
    
    const worldX = pointer.worldX;
    const worldY = pointer.worldY - JOURNEY_VERTICAL_OFFSET;

    window.__draggedPlatform.x = Math.round(worldX - window.__dragOffsetX);
    window.__draggedPlatform.y = Math.round(worldY - window.__dragOffsetY);
  };

  const handlePointerUp = (e) => {
    const editor = propPlacementEditorRef.current;
    if (import.meta.env.DEV && editor.dragging) {
      editor.dragging = null;
      e?.currentTarget?.releasePointerCapture?.(e.pointerId);
      refreshPropEditorUi();
      return;
    }
    if (window.__draggedPlatform) {
      console.log(`Platform ${window.__draggedPlatform.id} dragged to x: ${window.__draggedPlatform.x}, y: ${window.__draggedPlatform.y}`);
      window.__draggedPlatform = null;
    }
  };

  return (
    <section className={`expedition-journey-container ${openingCinematicActive ? 'is-opening-cinematic' : ''}`} id="expedition-journey">
      <div className="expedition-journey-grid">
        <JourneySidebarStatus
          JOURNEY_TOOLS={JOURNEY_TOOLS}
          gameState={gameState}
          getSectionDisplayName={getSectionDisplayName}
          RELIC_SHARDS={RELIC_SHARDS}
          UPGRADES={UPGRADES}
          getActiveHiddenRoutes={getActiveHiddenRoutes}
          getActiveSecretCollectibles={getActiveSecretCollectibles}
          restoredSacredRoomCount={restoredSacredRoomCount}
          sacredRoomEvidenceRows={sacredRoomEvidenceRows}
          BOSS_KEY_ITEMS={BOSS_KEY_ITEMS}
          activeHudGateGuidance={activeHudGateGuidance}
        />

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
                className={`opening-cinematic-overlay ${openingSpellImpactActive ? 'is-spell-impact' : ''} ${openingShieldShattered ? 'is-shield-shattered' : ''}`}
                role="dialog"
                aria-live="polite"
                aria-label="Asha and Anubis opening cut scene"
                style={{ '--opening-progress': openingIntroProgress }}
              >
                <div className="opening-cinematic-backdrop" aria-hidden="true">
                  <img
                    className="opening-cinematic-bg"
                    src="assets/expedition/backgrounds/desert-entry/desert-entry-photoreal-sphinx-backdrop.png"
                    alt=""
                  />
                  <div className="opening-cinematic-depth opening-cinematic-depth-left" />
                  <div className="opening-cinematic-depth opening-cinematic-depth-right" />
                  <img
                    className="opening-cinematic-seal"
                    src={`${import.meta.env.BASE_URL}${OPENING_JUDGEMENT_SEAL_IMAGE_SRC}`}
                    onError={(event) => {
                      const fallback = `${import.meta.env.BASE_URL}${OPENING_SCARAB_SEAL_IMAGE_SRC}`;
                      if (!event.currentTarget.src.endsWith(OPENING_SCARAB_SEAL_IMAGE_SRC)) {
                        event.currentTarget.src = fallback;
                      }
                    }}
                    alt=""
                  />
                  <img
                    className="opening-cinematic-anubis"
                    src={OPENING_SPHINX_APPARITION_SRC}
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
                  src={OPENING_ASHA_CUTSCENE_SRC}
                  alt=""
                />
                <div className="opening-cinematic-copy">
                  <div className="opening-cinematic-kicker">The First Seal</div>
                  <h2>The Gate Refuses</h2>
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
      />
    </section>
  );
}

ExpeditionJourney.tools = JOURNEY_TOOLS;
