import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DESERT_ENTRY_EXTERIOR_SPAWN_X,
  GROUND_Y,
  WORLD_WIDTH,
  FIELD_RESCUE_MESSAGE,
  FIELD_RESCUE_STAMINA_REASON,
  INITIAL_BOSS_SPRITE_LOAD_DELAY_MS,
  KNOWLEDGE_CHALLENGE_SIZE,
  KNOWLEDGE_CHALLENGE_FEEDBACK,
  BOSS_INTRO_PLAYER_STANDOFF,
  CHARACTER_LOADER_STORAGE_KEY,
  JOURNEY_PROP_EDITOR_SECTIONS_KEY,
  CHARACTER_LOADER_VISIBILITY_STORAGE_KEY,
  BOSS_DOMAIN_ENEMY_FOCUS_PADDING,
  SCARAB_QUEEN_ENEMY_FOCUS_PADDING,
  SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS,
  SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO,
  OBJECTIVE_MARKER_IDS_BY_SECTION,
  OBJECTIVE_LABELS,
  OBJECTIVE_SINGULAR_LABELS,
  CHINA_OBJECTIVE_LABELS,
  CHINA_OBJECTIVE_SINGULAR_LABELS,
  CHINA_GATE_NAMES,
  CHINA_GATE_HINTS,
  PLAYER_SPRITE_DRAW_HEIGHT,
  PLAYER_SPRITE_FRAME_COUNT,
  PLAYER_SPRITE_FRAME_HEIGHT,
  PLAYER_SPRITE_FRAME_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  JOURNEY_EXTERIOR_SCENE_ID,
  JOURNEY_VERTICAL_OFFSET,
  sacredMuralExteriorX,
  sacredScribeExteriorX,
  scaleJourneyX,
} from './expedition-journey/journeyConstants';

import {
  BOSS_KEY_ITEMS,
  CHECKPOINTS,
  getJourneyMiniBosses,
  HAZARDS,
  HIDDEN_ROUTES,
  GUARDIAN_KNOWLEDGE_CHALLENGES,
  GUARDIAN_KNOWLEDGE_QUESTIONS,
  JOURNEY_TOOLS,
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
  UPGRADES,
  GATE,
  SECTION_OBJECTIVES,
  setExpeditionJourneyCiv,
} from './expedition-journey/journeyDataRouter';
import { getRitualChamberEntryGeometry } from './expedition-journey/ritualBuildingClimb';
import {
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
import { useJourneyEditorPanelPosition } from './expedition-journey/useJourneyEditorPanelPosition.js';
import { useJourneyEditorOutliner } from './expedition-journey/useJourneyEditorOutliner.js';
import { useJourneyPlacementEditor } from './expedition-journey/useJourneyPlacementEditor.js';
import { useJourneySimulation } from './expedition-journey/useJourneySimulation.js';
import { useJourneyDraw } from './expedition-journey/useJourneyDraw.js';
import { useJourneySnapshot } from './expedition-journey/useJourneySnapshot.js';
import DesertLayerTuningPanel from './expedition-journey/DesertLayerTuningPanel.jsx';
export { JourneyControlsReference } from './expedition-journey/journeyControlsReference.jsx';
import {
  ARRIVAL_THRESHOLD_ASSET_VERSION,
  ARRIVAL_THRESHOLD_ANUBIS_TRIAL_LINES,
  ARRIVAL_THRESHOLD_AWAKENED_SRC,
  ARRIVAL_THRESHOLD_BACKGROUND_SRC,
  ARRIVAL_THRESHOLD_DUAT_ECHO_SRC,
  ARRIVAL_THRESHOLD_DOORWAY_GLOW_SRC,
  ARRIVAL_THRESHOLD_DOORWAY_OCCLUDER_SRC,
  ARRIVAL_THRESHOLD_ECHO_INTRO_DRIFT_SECONDS,
  ARRIVAL_THRESHOLD_ECHO_SPAWN_SECONDS,
  ARRIVAL_THRESHOLD_FLOOR_Y,
  ARRIVAL_THRESHOLD_LEFT_BOUND,
  ARRIVAL_THRESHOLD_LEFT_INSPECT_X,
  ARRIVAL_THRESHOLD_OBJECTIVE_LINE,
  ARRIVAL_THRESHOLD_RAMP_END_X,
  ARRIVAL_THRESHOLD_RAMP_RISE,
  ARRIVAL_THRESHOLD_RAMP_START_X,
  ARRIVAL_THRESHOLD_RIGHT_BOUND,
  ARRIVAL_THRESHOLD_SEAL_VEIL_SRC,
  ARRIVAL_THRESHOLD_SPAWN_LINE,
  ARRIVAL_THRESHOLD_SPAWN_X,
  ARRIVAL_THRESHOLD_TRIAL_COMPLETE_LINE,
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
  OPENING_THRESHOLD_SCENE_DURATION,
  OPENING_THRESHOLD_STAIR_REVEAL_SECONDS,
  easeInOutCubic,
  getOpeningCinematicLine,
  getOpeningCinematicLines,
  getOpeningThresholdDialogueLine,
} from './expedition-journey/journeyOpeningScenes';
import {
  FORGOTTEN_MURAL_CHAMBER_RESTORATION_IDS,
  MUMMIFICATION_CHAMBER_ATMOSPHERE_VERSION,
  MUMMIFICATION_CHAMBER_FEEDBACK,
  MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS,
  MUMMIFICATION_CHAMBER_PUZZLE,
  MUMMIFICATION_CHAMBER_RITE_OBJECTS,
  MUMMIFICATION_CHAMBER_RITUAL_GUIDANCE_VERSION,
  MUMMIFICATION_CHAMBER_RITUAL_SEQUENCE,
  MUMMIFICATION_CHAMBER_RITUAL_STEPS,
  MUMMIFICATION_JAR_SYMBOLS,
  MUMMIFICATION_ROOM_INTERACT_VERSION,
  SCRIBE_CHAMBER_DOOR_OPEN_LINE,
  SCRIBE_CHAMBER_FEEDBACK,
  createChamberDoorVisuals,
  createChamberDoorVisualsById,
  getMummificationChamberAtmosphere,
  getMummificationRiteByIndex,
  getSacredRoomEvidenceRows,
} from './expedition-journey/journeySacredRooms';
import {
  PLAYER_CHARACTER_PRESETS,
  getAtlasImagePath,
  getHeroSpriteFrameKey,
  getHeroSpriteFrameRowName,
  getHeroSpriteFrameScale,
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
  createForgottenMuralRelicSlidePuzzleTiles,
  parseColorGradeFilter,
  composeColorGradeFilter,
  JOURNEY_PROP_TINT_PRESETS,
  DEFAULT_JOURNEY_PROP_EDITOR_ROTATION_STEP,
  DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE,
  DEFAULT_JOURNEY_PROP_EDITOR_SCALE_STEP,
  FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_START_TILES,
  FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_TILE_LABELS,
  getForgottenMuralRelicSlideMove,
  getEnemyAttackHurtbox,
  getJourneyTrapTriggerRect,
  getNextJourneyRouteGate,
  getSectionForX,
  isForgottenMuralRelicSlidePuzzleSolved,
  isReusableJourneyTrap,
  JOURNEY_INTERACT_OBJECT_STATES,
  JOURNEY_TRAP_DIRECTIONS,
  JOURNEY_TRAP_TYPES,
  makeInitialState,
  normalizeJourneyTrap,
  rectsOverlap,
  resolveJourneyChamberEntryTrigger,
  resolveJourneyChamberReturnPoint,
  snapJourneyPropCoordinate,
} from './expedition-journey/journeyUtils';
import {
  BOSS_ATTACK_PHASES,
  COMBAT_HIT_IMPACT_PROFILES,
  DEFAULT_BOSS_ATTACK_PHASES,
  PLAYER_ATTACK_BACK_REACH,
  PLAYER_ATTACK_COMBO_TIMINGS,
  PLAYER_ATTACK_HEIGHT,
  PLAYER_ATTACK_INPUT_BUFFER_DURATION,
  PLAYER_ATTACK_NEAR_MISS_DISTANCE,
  PLAYER_ATTACK_NEAR_MISS_VERTICAL_TOLERANCE,
  PLAYER_ATTACK_RANGE,
  PLAYER_ATTACK_TYPES,
  PLAYER_COMBO_PRESERVE_AFTER_DODGE_DURATION,
  PLAYER_COMBO_SLASH_EFFECT_SRC,
  PLAYER_COMBO_SLASH_EFFECT_VERSION,
  PLAYER_DODGE_DURATION,
  PLAYER_DODGE_INVULNERABLE_DURATION,
  PLAYER_DODGE_RECOVERY_DURATION,
  PLAYER_DODGE_SPEED,
  PLAYER_DODGE_STAMINA_COST,
  PLAYER_FINISHER_SLASH_EFFECT_SRC,
  PLAYER_FINISHER_SLASH_EFFECT_VERSION,
  PLAYER_HEAVY_FOLLOWUP_PROMPT_LABEL,
  SCORPION_VENOM_ATTACK_PATTERN_TUNING,
  SCORPION_VENOM_SLOW_DURATION,
  SCORPION_VENOM_SLOW_MULTIPLIER,
  SCORPION_VENOM_SPIT_RANGE,
  SNAKE_AMBUSH_LUNGE_PATTERN,
  WISP_DIVE_ATTACK_PATTERN,
} from './expedition-journey/journeyCombat.js';

import {
  clampCameraX,
  getCameraFollowTarget as getLayoutCameraFollowTarget,
  isHorizontallyVisible,
  JOURNEY_RENDER_TARGET,
  placeGateOnGround,
  worldToScreenX,
} from './expedition-journey/journeyLayout';

import {
  createEnvironmentAssetState,
  drawAtlasRegion,
  ENVIRONMENT_ASSET_PACK_IDS,
  getEnvironmentAssetKeyForHazard,
  getEnvironmentAssetKeyForPlatform,
  getEnvironmentAssetKeyForStoryProp,
  loadEnvironmentAssetPack,
  MUMMIFICATION_CHAMBER_INTERACTIONS_ASSET_VERSION,
} from './expedition-journey/journeyRenderAssets';

import {
  createDesertBackgroundAssetState,
  drawDesertBackgroundLayer,
  EGYPT_JOURNEY_BACKGROUND_SECTION_IDS,
  getSectionBackgroundAssets,
  loadDesertBackgroundAssetPack,
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
  SCARAB_QUEEN_DRAW_OFFSET_X,
  getScarabQueenDrawBox,
  getScarabQueenSpriteFrame,
  getStoneGuardianDrawBox,
  getStoneGuardianSpriteFrame,
  isChinaGuardianBossSpriteId,
  loadBossSpritePack,
  shouldFlipBossSprite,
} from './expedition-journey/journeyBossSprites';

import {
  ROME_JOURNEY_BOSS_SPRITE_PACK_IDS,
  getLegateRevenantSpriteFrame,
  getLegateRevenantDrawBox,
  isRomeBossSpriteId,
  getRomeBossSpritePack,
} from './expedition-journey/rome/romeBossSprites';

import {
  CHINA_JOURNEY_ENEMY_SPRITE_PACK_IDS,
  createEnemySpriteState,
  EGYPT_JOURNEY_ENEMY_SPRITE_PACK_IDS,
  getEnemyBodyLanguagePose,
  getEnemySpriteDrawBox,
  getEnemySpriteFamily,
  getEnemySpriteFrame,
  getEnemySpritePack,
  loadEnemySpritePack,
  shouldFlipEnemySprite,
  shouldUseEnemySpritePack,
} from './expedition-journey/journeyEnemySprites';

import {
  ROME_ENEMY_SPRITE_PACK_IDS as ROME_JOURNEY_ENEMY_SPRITE_PACK_IDS,
} from './expedition-journey/rome/romeEnemySprites';

import { ROME_SECTION_BACKGROUND_PACKS } from './expedition-journey/rome/romeBackgroundAssets';

import {
  createCollectibleSpriteState,
  drawCollectibleAtlasRegion,
  loadCollectibleSpritePack,
} from './expedition-journey/journeyCollectibleSprites';

import {
  createPlayerWeaponSpriteState,
  drawPlayerWeaponAtlasRegion,
  getPlayerWeaponFrameKey,
  loadPlayerWeaponSpritePack,
} from './expedition-journey/journeyPlayerWeaponSprites';

import {
  createDynamicWorldAssetState,
  getDynamicWorldEffectRegion,
  loadDynamicWorldAssetPack,
  usesPaintedDynamicWorldEffect,
} from './expedition-journey/journeyDynamicWorldAssets';

import {
  createMarkerSpriteState,
  drawMarkerSprite,
  loadMarkerSpritePack,
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
const DESERT_ENTRY_BACKGROUND_ART_VERSION = 'egypt-true-separated-parallax-route-2026-06-27';
const DESERT_ENTRY_LAYERED_NECROPOLIS_OWNS_RAVINE_VISUALS = true;
const OPENING_PYRAMID_FACADE_WORLD_LEFT_X = -82;
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
// Entry door / trigger / return point derive from the Ritual Chamber building's
// tomb-door ledge fraction, so they track the building when it is resized in the
// Layers panel (see ritualBuildingClimb.js).
const RITUAL_CHAMBER_ENTRY_GEOMETRY = getRitualChamberEntryGeometry();
const MUMMIFICATION_CHAMBER_RETURN_FALLBACK = {
  x: RITUAL_CHAMBER_ENTRY_GEOMETRY.returnX,
  y: RITUAL_CHAMBER_ENTRY_GEOMETRY.returnY,
  cameraAnchorRatio: 0.42,
  direction: 1,
};
const MUMMIFICATION_CHAMBER_ENTRY_TRIGGER = {
  minX: RITUAL_CHAMBER_ENTRY_GEOMETRY.trigger.minX,
  maxX: RITUAL_CHAMBER_ENTRY_GEOMETRY.trigger.maxX,
  maxY: GROUND_Y - 50,
  footY: RITUAL_CHAMBER_ENTRY_GEOMETRY.trigger.footY,
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
  current.attackRange = 0;
  current.attackHeight = 0;
  current.attackBackReach = 0;
  current.attackYOffset = 0;
  current.attackDamage = null;
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
    id: 'venom-skitter',
    label: 'Venom Skitter',
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
  ...SCORPION_VENOM_ATTACK_PATTERN_TUNING,
  speed: 54,
  range: SCORPION_VENOM_SPIT_RANGE,
  height: 44,
  yOffset: -28,
  backReach: 8,
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
  'desert-entry': ['distantRockfall', 'distantMonsterCall', 'voidBassSwell', 'underworldHeartDrone'],
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
// props draw their own colours and ignore it). Done in cached offscreen buffers so
// the multiply is clipped to the sprite's silhouette and never bleeds onto the scene.
const JOURNEY_PAINT_TINT_CACHE_LIMIT = 80;
const journeyPaintTintBufferCache = new Map();
const getJourneyPaintTintBuffer = (width, height, cacheKey, paintBuffer) => {
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
const DESERT_ENTRY_VISUAL_GROUND_PLANE_OFFSET_Y = 0;
const DESERT_ENTRY_VISUAL_GROUND_FOOT_TOLERANCE = 26;
// Grounded desert-entry enemies render with a per-family `groundOffset` (journeyEnemySprites.js)
// that sinks their sprite below the painted route after the background rebuild, while the player
// anchors flush at the floor. This lifts ONLY grounded desert-entry enemy sprites back onto the
// route. Scoped to enemies + desert-entry; the player, other acts, bridge-deck enemies, flyers, and
// the nest are excluded. Per-TYPE because each sprite's art has different empty padding under the
// feet: bump a type up if it still sits sunk, down if it floats. `default` covers any other type.
const DESERT_ENTRY_ENEMY_FOOT_LIFT = {
  scorpion: 7,
  scarab: 7,
  snake: 14,
  default: 8,
};
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
    selectedPaletteCategory: 'arch-prop',
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
  const {
    setEditorPanelNode,
    resetEditorPanelPosition,
    handleEditorPanelDragStart,
  } = useJourneyEditorPanelPosition();
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

  // --- Scorpion-nest editor helpers (drag to place, keys to tune size/anchor/glow) ---
  const getRenderableScorpionNests = useCallback(() => (
    (stateRef.current.enemies || []).filter(enemy => enemy?.type === 'scorpion-nest')
  ), []);

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

  const getLiveScorpionNestBlockers = useCallback((current = stateRef.current) => {
    if (!current || current.enemiesDisabled) return [];
    return (current.enemies || [])
      .filter(enemy => (
        enemy.type === 'scorpion-nest'
        && enemy.routeBlocker !== false
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

  // DEV-only prop-placement editor tooling (drag-to-place, transform/colour edits,
  // undo/redo, per-room export, Scene Outliner snapshot). Extracted into its own hook;
  // the shared placement state + gameplay resolvers above are passed in as deps.
  const {
    propEditorUi,
    toggleEditorPanelSection,
    getPropEditorSelectedProp,
    getPropEditorSelectedPlatform,
    getPropEditorSelectedHazard,
    getPropEditorSelectedArch,
    getPropEditorSelectedCheckpoint,
    getPropEditorSelectedLair,
    getPropEditorSelectedNest,
    isEditorLockKeyLocked,
    applyDefaultEditorLocks,
    toggleSelectedEditorLock,
    getLairEditorBounds,
    getNestEditorBounds,
    getArchEditorBounds,
    getCheckpointEditorBounds,
    getHazardEditorBounds,
    getPlatformEditorBounds,
    findEditableScarabLairAt,
    findEditableNestAt,
    findEditableArchAt,
    findEditableCheckpointAt,
    findEditableHazardAt,
    findEditablePlatformAt,
    findEditableStoryPropAt,
    getEditorEntityBounds,
    getEditorEntityLabel,
    buildEditorHoverStack,
    updateEditorHover,
    getPropEditorPointer,
    undoEditorChange,
    redoEditorChange,
    clearSavedPropEditorState,
    refreshPropEditorUi,
    getGroundAwareStoryPropEditorEdit,
    updateSelectedPropEditorTransform,
    updateSelectedPropEditorField,
    updateSelectedPropEditorNumberField,
    updateSelectedPropGroundContactLayer,
    removeSelectedPropGroundContactLayer,
    updateSelectedPlatformEditorTransform,
    updateSelectedHazardEditorTransform,
    updateSelectedArchEditorTransform,
    updateSelectedCheckpointEditorTransform,
    updateSelectedLairEditorTransform,
    updateSelectedNestEditorTransform,
    resetSelectedNestEditor,
    nudgeSelectedPropZOrder,
    copySelectedPropLook,
    pasteSelectedPropLook,
    blendSelectedPropIntoScene,
    duplicateSelectedPropInEditor,
    deleteSelectedPropFromEditor,
    createPropFromEditorPalette,
    createTrapFromEditorPalette,
    createPlatformFromEditorPalette,
    savePropPlacementExport,
    writeJourneyOverridesToSource,
  } = useJourneyPlacementEditor({
    propPlacementEditorRef,
    stateRef,
    canvasRef,
    scorpionNestRef,
    environmentAssetsRef,
    atmosphereEnvironmentAssetsRef,
    foregroundDepthEnvironmentAssetsRef,
    premiumGroundContactAssetsRef,
    setCollapsedPanelSections,
    targetCivilisation,
    GATE,
    STORY_PROPS,
    STORY_PROP_DEPTH_ORDER,
    GENERATED_STORY_PROP_PREVIEW_SOURCES,
    getJourneySceneId,
    isInteriorChamberScene,
    isEntityActiveInScene,
    isPlatformAvailable,
    isHazardAvailable,
    isJourneyFloorPlatform,
    isJourneyBlockerPlatform,
    isGeneratedStoryStructureProp,
    pruneObsoleteLostBridgeRavineFloorEditorProps,
    pruneRetiredDesertEntryBackgroundEditorProps,
    getStoryPropDepth,
    getStoryPropEditorSize,
    getStoryPropEditorBounds,
    getStoryPropExplicitGroundY,
    getHazardBurialAmount,
    getJourneyMiniBosses,
    getRenderableStoryProps,
    getRenderablePlatforms,
    getRenderableHazards,
    getRenderableRouteGates,
    getRenderableRouteGateDoorways,
    getRenderableCheckpoints,
    getRenderableScarabLairs,
    getRenderableScorpionNests,
    getEditedStoryProp,
    getEditedPlatform,
    getEditedHazard,
    getEditedRouteGate,
    getEditedRouteGateDoorway,
    getEditedCheckpoint,
    getEditedMiniBoss,
    getEditedNestParams,
    getAllPropEditorStoryProps,
    getAllPropEditorPlatforms,
    getAllPropEditorHazards,
    getPropEditorBasePropById,
    getPlatformEditorBasePlatformById,
    getHazardEditorBaseHazardById,
    getRouteGateEditorBaseGateById,
    getRouteGateEditorBaseDoorwayById,
    getCheckpointEditorBaseCheckpointById,
    getMiniBossEditorBaseBossById,
    getActivePropEditorRoomId,
    getPlatformEditorRoomId,
    getHazardEditorRoomId,
    getScarabQueenLairPlacement,
  });

  // --- Scene Outliner: select / hide / lock a prop straight from the layer list,
  // including props that are currently off-screen or buried behind others. ---
  const {
    selectEditorPropFromOutliner,
    toggleEditorPropHidden,
    showAllEditorProps,
    toggleEditorPropLockFromOutliner,
    setEditorOutlinerSearch,
    selectEditorEntityFromStack,
    dismissEditorStackPicker,
  } = useJourneyEditorOutliner({
    propPlacementEditorRef,
    stateRef,
    getRenderableStoryProps,
    refreshPropEditorUi,
    isEditorLockKeyLocked,
  });

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

  // Size the canvas backing store to its displayed device-pixel resolution so the game
  // renders crisply instead of stretching a fixed 1280x720 buffer up to the screen.
  // The draw loop reads canvas.width/height to build its virtual->backing-store transform,
  // so growing the buffer here automatically supersamples every layer (Asha included).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    // Cap the longest side so 4K/HiDPI displays stay sharp without an unbounded fill cost.
    const MAX_BACKING_WIDTH = 2560;
    const syncCanvasResolution = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = window.devicePixelRatio || 1;
      let targetWidth = Math.round(rect.width * dpr);
      let targetHeight = Math.round(rect.height * dpr);
      if (targetWidth > MAX_BACKING_WIDTH) {
        const ratio = MAX_BACKING_WIDTH / targetWidth;
        targetWidth = MAX_BACKING_WIDTH;
        targetHeight = Math.round(targetHeight * ratio);
      }
      // Never drop below the original render target; assigning width/height resets the
      // context, so only touch it when the size actually changes.
      targetWidth = Math.max(targetWidth, JOURNEY_RENDER_TARGET.nativeWidth);
      targetHeight = Math.max(targetHeight, JOURNEY_RENDER_TARGET.nativeHeight);
      if (canvas.width !== targetWidth) canvas.width = targetWidth;
      if (canvas.height !== targetHeight) canvas.height = targetHeight;
    };
    syncCanvasResolution();
    window.addEventListener('resize', syncCanvasResolution);
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(syncCanvasResolution)
      : null;
    observer?.observe(canvas);
    return () => {
      window.removeEventListener('resize', syncCanvasResolution);
      observer?.disconnect();
    };
  }, []);

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

  // DEV-only: teleport the player to a section start so backgrounds/layouts can
  // be eyeballed without playing through. Bypasses gates (view-only) and resets
  // camera/velocity; the per-frame section resolver picks up the new position.
  const jumpToDevSection = useCallback((section) => {
    if (!import.meta.env.DEV || !section) return;
    const current = stateRef.current;
    if (!current?.player) return;
    const targetX = Math.max(0, (Number(section.start) || 0) + 80);
    current.player.x = targetX;
    current.player.y = GROUND_Y - current.player.height;
    current.player.vx = 0;
    current.player.vy = 0;
    current.currentSectionId = section.id;
    current.failed = false;
    current.failureReason = '';
    current.failureDetail = '';
    const camera = getCameraFollowTarget(current);
    current.cameraX = camera.targetCameraX;
    current.targetCameraX = camera.targetCameraX;
    current.cameraMode = camera.mode;
    current.cameraFocusTarget = camera.focusTarget;
    current.notice = `Jumped to ${section.name || section.id}.`;
    syncHud();
  }, [syncHud]);

  // DEV: teleport to an arbitrary world X (used to jump straight to the
  // enterable buildings, which sit mid-section, for in-game eyeballing).
  const jumpToDevWorldX = useCallback((worldX, label) => {
    if (!import.meta.env.DEV || !Number.isFinite(worldX)) return;
    const current = stateRef.current;
    if (!current?.player) return;
    const targetX = Math.max(0, worldX);
    current.player.x = targetX;
    current.player.y = GROUND_Y - current.player.height;
    current.player.vx = 0;
    current.player.vy = 0;
    const section = getSectionForX(targetX);
    if (section) current.currentSectionId = section.id;
    current.failed = false;
    current.failureReason = '';
    current.failureDetail = '';
    const camera = getCameraFollowTarget(current);
    current.cameraX = camera.targetCameraX;
    current.targetCameraX = camera.targetCameraX;
    current.cameraMode = camera.mode;
    current.cameraFocusTarget = camera.focusTarget;
    current.notice = `Jumped to ${label || 'world position'}.`;
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
    if (
      (enemy.type === 'sand-wisp' || enemy.type === 'bat') && enemy.attackPattern === WISP_DIVE_ATTACK_PATTERN.id
      && (enemy.attackWindup > 0 || enemy.attackTimer > 0 || enemy.attackReady)
    ) {
      return WISP_DIVE_ATTACK_PATTERN;
    }
    if (
      enemy.type === 'snake' && enemy.attackPattern === SNAKE_AMBUSH_LUNGE_PATTERN.id
      && (enemy.attackWindup > 0 || enemy.attackTimer > 0 || enemy.attackReady)
    ) {
      return SNAKE_AMBUSH_LUNGE_PATTERN;
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
      return heavyPattern;
    }
    const basePattern = {
      ...(ENEMY_ATTACK_PATTERNS[enemy.type] || DEFAULT_ENEMY_ATTACK_PATTERN),
      ...(enemy.attackPatternTuning || {}),
    };
    const tunedPattern = basePattern;
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

  const { createJourneySnapshot } = useJourneySnapshot({
    COLLECTIBLE_SCALE_TUNING_VERSION,
    DECORATIVE_PROP_LAYER_MODE,
    DYNAMIC_WORLD_VERSION,
    FIELD_TOOL_SCALE,
    FOREGROUND_DEPTH_LAYER_MODE,
    JOURNEY_FLAG_VISUAL_MODE,
    JOURNEY_POLISH_VERSION,
    LORE_TABLET_SCALE,
    MUMMIFICATION_CHAMBER_EXTERIOR_VERSION,
    MUMMIFICATION_CHAMBER_INTERIOR_ASSET_DESCRIPTION,
    MUMMIFICATION_CHAMBER_INTERIOR_VERSION,
    OBJECTIVE_MARKER_SCALE,
    OPENING_SPHINX_SPRITE_BOSS_ID,
    OPENING_TRAP_DECAL_ASSET_VERSION,
    PICKUP_GLOW_SCALE,
    PROP_DEPTH_TUNING_VERSION,
    PROP_GROUNDING_INTEGRATION_VERSION,
    REACTIVE_ENVIRONMENT_VERSION,
    RELIC_SHARD_SCALE,
    ROUTE_GROUND_HAZE_FIX_VERSION,
    ROUTE_GROUND_VISUAL_MODE,
    UPGRADE_SCALE,
    WORLD_CONTINUITY_VERSION,
    getEntitySceneId,
    getJourneySceneId,
    isEntityActiveInScene,
    isPlatformAvailable,
    arrivalThresholdBackgroundRef,
    arrivalThresholdDoorwayGlowRef,
    arrivalThresholdDoorwayOccluderRef,
    arrivalThresholdDuatEchoRef,
    atmosphereEnvironmentAssetsRef,
    bossSpriteAssetsRef,
    canvasRef,
    collectibleSpriteAssetsRef,
    desertBackgroundAssetsRef,
    dynamicWorldAssetsRef,
    enemySpriteAssetsRef,
    environmentAssetsRef,
    foregroundDepthEnvironmentAssetsRef,
    markerSpriteAssetsRef,
    mummificationChamberExteriorRef,
    mummificationChamberInteriorRef,
    mummificationInteractionAssetsRef,
    openingHazardDecalPackRef,
    openingTrapDecalPackRef,
    playerSpriteRef,
    playerWeaponSpriteRef,
    premiumGroundContactAssetsRef,
    stateRef,
    briefingOpen,
    playerHeroSpriteConfig,
    scopedJourneyAssetPacks,
    targetCivilisation,
    getActiveHazardsNearPlayer,
    getActiveHiddenRoutes,
    getActiveSecretCollectibles,
    getBossVulnerabilityState,
    getCombatMode,
    getEnemyPatternConfig,
    getEntityCombatState,
    getGateGuidance,
    getObjectiveProgress,
    getPlayerAttackState,
    getRenderableHazards,
    getRouteAccessState,
    getSectionDisplayName,
    getSectionDisplayTitle,
    getStaminaWarningState,
    isRouteRewardAccessible,
  });

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

  // Enemy-only, desert-entry-only foot correction (see DESERT_ENTRY_ENEMY_FOOT_LIFT). Returns the
  // pixels to lift a grounded desert-entry enemy sprite so its feet meet the painted route. Excludes
  // the nest (custom render) and flyers; bridge-deck enemies fall outside the floor-contact tolerance.
  const getDesertEntryEnemyFootLift = useCallback((entity, current = stateRef.current) => {
    if (!entity || entity.type === 'scorpion-nest' || entity.flying) return 0;
    const width = Number.isFinite(entity.width) ? entity.width : 0;
    const height = Number.isFinite(entity.height) ? entity.height : 0;
    if (!getDesertEntryGroundContactActive(entity.x + width / 2, entity.y + height, current)) return 0;
    return DESERT_ENTRY_ENEMY_FOOT_LIFT[entity.type] ?? DESERT_ENTRY_ENEMY_FOOT_LIFT.default;
  }, [getDesertEntryGroundContactActive]);

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

  const { draw } = useJourneyDraw({
    CHAMBER_DOOR_VISUALS,
    CHINA_BACKGROUND_POLISH_VERSION,
    COLLECTIBLE_VISUAL_BASE,
    DECORATIVE_PROP_LAYER_MODE,
    DESERT_ENTRY_LAYERED_NECROPOLIS_OWNS_RAVINE_VISUALS,
    DRAW_JOURNEY_FLAG_MARKERS,
    DYNAMIC_WORLD_VERSION,
    ENABLE_FOREGROUND_DEPTH_LAYER,
    FOREGROUND_DEPTH_LAYER_MODE,
    FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_VERSION,
    FORGOTTEN_MURAL_CHAMBER_VERSION,
    FORGOTTEN_MURAL_HIDDEN_MEMORY_REVEAL_VERSION,
    JOURNEY_FLAG_VISUAL_MODE,
    JOURNEY_POLISH_VERSION,
    MUMMIFICATION_CHAMBER_EXTERIOR_VERSION,
    MUMMIFICATION_CHAMBER_INTERIOR_VERSION,
    MUMMIFICATION_CHAMBER_READABILITY,
    OPENING_PYRAMID_ASSET_VERSION,
    OPENING_PYRAMID_FACADE_VERSION,
    OPENING_TRAP_DECAL_ASSET_VERSION,
    PROP_DEPTH_TUNING_VERSION,
    REACTIVE_ENVIRONMENT_VERSION,
    ROUTE_GROUND_HAZE_FIX_VERSION,
    ROUTE_GROUND_VISUAL_MODE,
    SCRIBE_CHAMBER_EXTERIOR_VERSION,
    SCRIBE_CHAMBER_INTERIOR_VERSION,
    WORLD_CONTINUITY_VERSION,
    atmosphereEnvironmentAssetsRef,
    backgroundPackId,
    bossSpriteAssetsRef,
    canvasRef,
    collectibleSpriteAssetsRef,
    drawAncientRouteGround,
    drawArrivalThresholdDoorwayOccluder,
    drawArrivalThresholdScene,
    drawArrivalThresholdTrial,
    drawAttackArc,
    drawChinaRiverValleyBackground,
    drawCinematicCards,
    drawCollectible,
    drawCombatEffects,
    drawConnectedWorldAmbientLife,
    drawDebugPlatformOverlay,
    drawDesertEntryBackground,
    drawDesertEntryGroundLane,
    drawDesertEntryGroundMotionCues,
    drawDesertForegroundAtmosphere,
    drawDesertJourneySceneMasks,
    drawDesertJourneyScenePanels,
    drawDiscoveryEntrance,
    drawDynamicEnvironmentEvent,
    drawEgyptAmbientLife,
    drawEnemyAttackTell,
    drawEnvironmentInteraction,
    drawFieldNoteLabel,
    drawForegroundDepthLayer,
    drawForegroundOccluderProps,
    drawForgottenMuralChamberInterior,
    drawForgottenMuralChamberTransition,
    drawHazard,
    drawHiddenRouteHint,
    drawLinkedEnemySprite,
    drawLostBridgeRavineDepth,
    drawLostBridgeRavineForegroundVoid,
    drawLostBridgeStructure,
    drawMiniBoss,
    drawMissingObjectiveMarker,
    drawMummificationChamberInterior,
    drawOpeningCinematic,
    drawOpeningPyramidMasonryBack,
    drawOpeningSphinxEncounter,
    drawOpeningThresholdScene,
    drawPlatform,
    drawPlayerFeedbackOverlays,
    drawPlayerSprite,
    drawPremiumEgyptianChamberDoor,
    drawPropPlacementEditorOverlay,
    drawRouteGate,
    drawScarabQueenLairOpeningProp,
    drawScribeLockedChamberInterior,
    drawSectionParallaxBackground,
    drawSectionParallaxForeground,
    drawSectionTransitionBlend,
    drawSmallEnemySprite,
    drawStageEntranceFeature,
    drawStageEntranceForegroundOccluder,
    drawStoryProp,
    drawTempleBackdrop,
    drawTempleThresholdHallInterior,
    drawTempleThresholdTransition,
    drawTrapProjectile,
    drawWorldContinuityLandmark,
    drawWorldTransitionMarker,
    enemySpriteAssetsRef,
    environmentAssetsRef,
    foregroundDepthEnvironmentAssetsRef,
    forgottenMuralAlcoveStructureRef,
    forgottenMuralChamberRef,
    forgottenMuralHiddenRevealRef,
    getActiveHiddenRoutes,
    getActiveSecretCollectibles,
    getCombatMode,
    getDesertEntryEnemyFootLift,
    getDesertEntryVisualGroundOffsetY,
    getDoorwayGateStatus,
    getEditedMiniBoss,
    getEditedNestParams,
    getGateGuidance,
    getGroundPlaneEntityRenderY,
    getJourneySceneId,
    getPlayerAttackState,
    getRenderableCheckpoints,
    getRenderableHazards,
    getRenderablePlatforms,
    getRouteGateDoorwayEntries,
    getScarabQueenEmergenceBeat,
    getScarabQueenLairPlacement,
    getZIndexSortedRenderableStoryProps,
    isEntityActiveInScene,
    isInteriorChamberScene,
    isNormalEnemyInsideBossFocus,
    isRouteRewardAccessible,
    markerSpriteAssetsRef,
    mummificationChamberExteriorRef,
    mummificationChamberInteriorRef,
    mummificationInteractionAssetsRef,
    openingHazardDecalPackRef,
    openingPyramidClimbPackRef,
    openingPyramidFacadeRef,
    openingTrapDecalPackRef,
    playerSpriteRef,
    playerWeaponSpriteRef,
    resolveChamberEntryTrigger,
    scopedJourneyAssetPacks,
    scorpionNestRef,
    scribeChamberExteriorRef,
    scribeChamberInteriorRef,
    shouldRenderStageEntranceFeatureForState,
    stateRef,
  });

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
      if (canBufferHeavyFollowup) {
        current.attackQueued = true;
        current.attackQueuedType = PLAYER_ATTACK_TYPES.HEAVY;
        current.attackQueuedHeavyFollowupPrimed = true;
        current.heavyFollowupReadyTimer = Math.max(current.heavyFollowupReadyTimer || 0, current.attackComboWindowTimer || 0);
        return;
      }
      // Buffer the press briefly so an attack tapped just before Asha recovers
      // still fires instead of being silently dropped.
      current.attackQueued = true;
      current.attackQueuedType = attackType === PLAYER_ATTACK_TYPES.HEAVY
        ? PLAYER_ATTACK_TYPES.HEAVY
        : PLAYER_ATTACK_TYPES.LIGHT;
      current.attackQueuedHeavyFollowupPrimed = false;
      current.attackQueuedBufferTimer = PLAYER_ATTACK_INPUT_BUFFER_DURATION;
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

  const { update } = useJourneySimulation({
    CHAMBER_DOOR_VISUALS_BY_ID,
    CHINA_OPENING_CINEMATIC_ID,
    DEFAULT_LEVEL_TRANSITION,
    DISCOVERY_ENTRANCE_REVEAL_SECONDS,
    ENEMY_TYPE_STAKE_MESSAGES,
    FORGOTTEN_MURAL_CHAMBER_BOUNDS,
    FORGOTTEN_MURAL_CHAMBER_CAMERA_X,
    FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN,
    FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER,
    FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER,
    FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK,
    FORGOTTEN_MURAL_CHAMBER_SWITCH_SECONDS,
    FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
    HAZARD_VISUALS,
    HEAVY_ATTACK_PATTERNS,
    JOURNEY_SCENE_IDS,
    LOST_BRIDGE_RAVINE_FALL_DEPTH,
    LOST_BRIDGE_RAVINE_FALL_SIDE_PAD,
    MUMMIFICATION_CHAMBER_BOUNDS,
    MUMMIFICATION_CHAMBER_CAMERA_X,
    MUMMIFICATION_CHAMBER_ENTRY_SPAWN,
    MUMMIFICATION_CHAMBER_ENTRY_TRIGGER,
    MUMMIFICATION_CHAMBER_EXIT_TRIGGER,
    MUMMIFICATION_CHAMBER_RETURN_FALLBACK,
    OPENING_CAMERA_REVEAL_DURATION,
    PARRY_WINDOW_DURATION,
    ROME_OPENING_CINEMATIC_ID,
    SCARAB_POISONED_CHARGE_SPEED_MULTIPLIER,
    SCARAB_POISONED_CHARGE_START_BONUS,
    SCORPION_NEST_EDITOR_DEFAULTS,
    SCORPION_VENOM_ATTACK_PATTERN,
    SCRIBE_CHAMBER_BOUNDS,
    SCRIBE_CHAMBER_CAMERA_X,
    SCRIBE_CHAMBER_ENTRY_SPAWN,
    SCRIBE_CHAMBER_ENTRY_TRIGGER,
    SCRIBE_CHAMBER_EXIT_TRIGGER,
    SCRIBE_CHAMBER_RETURN_FALLBACK,
    SCRIBE_CHAMBER_TABLET_REGION,
    SCRIBE_CHAMBER_WALL_REGION,
    TEMPLE_APPROACH_RAMP_ASSIST,
    TEMPLE_APPROACH_RAMP_LOWER_PATH_FOOT_Y,
    TEMPLE_THRESHOLD_ANUBIS_START_SECONDS,
    TEMPLE_THRESHOLD_HALL_BOUNDS,
    TEMPLE_THRESHOLD_HALL_CAMERA_X,
    TEMPLE_THRESHOLD_HALL_ENTRY_DISABLED_FOR_BUILD,
    TEMPLE_THRESHOLD_HALL_ENTRY_SPAWN,
    TEMPLE_THRESHOLD_HALL_ENTRY_TRIGGER,
    TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER,
    TEMPLE_THRESHOLD_HALL_RETURN_FALLBACK,
    TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER,
    TEMPLE_THRESHOLD_SWITCH_SECONDS,
    addCombatEffect,
    applyCombatHitImpact,
    audioControls,
    briefingOpen,
    buildBossRewardMoment,
    completeOpeningThresholdScene,
    enterLevelFromThreshold,
    footstepTimerRef,
    getActiveHiddenRoutes,
    getActiveSecretCollectibles,
    getActiveShardGateProgress,
    getAmbientDramaSfxKey,
    getArrivalThresholdGroundY,
    getAttackBox,
    getAttackHurtbox,
    getBossPhaseConfig,
    getBossVulnerabilityState,
    getCameraFollowTarget,
    getDoorwayGateStatus,
    getEnemyHitSfxKey,
    getEnemyPatternConfig,
    getGateGuidance,
    getGuardianChallengeQuestions,
    getHazardSfxKey,
    getJourneySceneId,
    getLiveScorpionNestBlockers,
    getLostBridgeDeckBounds,
    getObjectiveProgress,
    getOpeningArrivalNoticeForCinematicId,
    getOpeningCameraRevealTarget,
    getPlayerAttackNearMissTarget,
    getPlayerAttackState,
    getPlayerAttackTiming,
    getRenderableCheckpoints,
    getRenderableHazards,
    getRenderablePlatforms,
    getRenderableTrapPlatforms,
    getRouteAccessState,
    getRouteGateDoorwayEntries,
    getSectionDisplayName,
    getSectionDisplayTitle,
    getStageEntranceTriggerX,
    getTempleApproachRampSurfaceY,
    getTimelineRequirementProgress,
    isEntityActiveInScene,
    isForgottenMuralChamberScene,
    isInteriorChamberScene,
    isJourneyBlockerPlatform,
    isLowStamina,
    isMummificationChamberScene,
    isNormalEnemyInsideBossFocus,
    isOpeningPyramidAirJumpAssistAvailable,
    isRouteRewardAccessible,
    isScribeLockedChamberScene,
    isStageEntranceAvailableForState,
    isTempleThresholdHallScene,
    keysRef,
    onComplete,
    openingAtmosphereSfxKey,
    playerSpriteRef,
    recordEnvironmentInteraction,
    resetPlayerCombo,
    resolveChamberEntryTrigger,
    resolveChamberReturnPoint,
    resolveJourneyBlockerPlatformCollision,
    scopedJourneyAssetPacks,
    shuffleGuardianQuestionOptions,
    startLevelThresholdEncounter,
    startOpeningCinematic,
    startTempleThresholdTransition,
    stateRef,
    syncHud,
    targetCivilisation,
    triggerJourneyRescue,
    updateArrivalThresholdTrial,
    updateHostileStepMultiplier,
    wasGroundedRef,
  });

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
        current.arrivalThresholdActive = false;
        current.arrivalThresholdExitTransition = null;
        current.arrivalThresholdTrial = null;
        current.arrivalThresholdNoticeTimer = 0;
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

            {import.meta.env.DEV && (
              <div
                className="journey-dev-section-jump"
                style={{
                  position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap',
                  maxWidth: '92%', justifyContent: 'center',
                  padding: '4px 8px', borderRadius: 6, zIndex: 40, pointerEvents: 'auto',
                  background: 'rgba(15,12,10,0.72)', border: '1px solid rgba(212,184,120,0.35)',
                  font: '11px/1.2 system-ui, sans-serif', color: '#e8dcc4',
                }}
              >
                <span style={{ opacity: 0.7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Dev · Jump
                </span>
                {SECTIONS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    title={s.id}
                    onClick={(event) => { jumpToDevSection(s); event.currentTarget.blur(); }}
                    style={{
                      cursor: 'pointer', padding: '2px 7px', borderRadius: 4, font: 'inherit',
                      background: 'rgba(212,184,120,0.14)', border: '1px solid rgba(212,184,120,0.4)',
                      color: '#f0e6d2',
                    }}
                  >
                    {i + 1}. {s.name || s.id}
                  </button>
                ))}
                <span style={{ opacity: 0.45, padding: '0 2px' }}>|</span>
                {[
                  { id: 'mummification-chamber-exterior-structure', label: 'Mummif. (hidden)' },
                  { id: 'forgotten-mural-climb-structure', label: 'Mural' },
                  { id: 'scribe-chamber-doorway-structure', label: 'Scribe' },
                ].map(({ id, label }) => {
                  const buildingProp = STORY_PROPS.find((prop) => prop.id === id);
                  if (!buildingProp) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      title={`${id} @ x≈${Math.round(buildingProp.x)}`}
                      onClick={(event) => { jumpToDevWorldX(buildingProp.x, label); event.currentTarget.blur(); }}
                      style={{
                        cursor: 'pointer', padding: '2px 7px', borderRadius: 4, font: 'inherit',
                        background: 'rgba(120,170,212,0.16)', border: '1px solid rgba(120,170,212,0.45)',
                        color: '#dce9f5',
                      }}
                    >
                      🏛 {label}
                    </button>
                  );
                })}
              </div>
            )}

            {import.meta.env.DEV && <DesertLayerTuningPanel />}

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
