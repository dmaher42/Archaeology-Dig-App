import { GROUND_Y } from './journeyConstants';
import { ARRIVAL_THRESHOLD_FLOOR_Y, ARRIVAL_THRESHOLD_RAMP_END_X, ARRIVAL_THRESHOLD_RAMP_RISE, ARRIVAL_THRESHOLD_RAMP_START_X, CHINA_OPENING_ARRIVAL_NOTICE, OPENING_ARRIVAL_AFTERSHOCK_NOTICE } from './journeyOpeningScenes';
import { clamp } from './journeyUtils';
import { DESERT_ENTRY_RETIRED_BACKGROUND_PROP_IDS, isRetiredDesertEntryBackgroundProp } from './journeyChamberTriggers.js';

export const getArrivalThresholdGroundY = (centerX) => {
  const rampProgress = clamp(
    (ARRIVAL_THRESHOLD_RAMP_START_X - centerX) / (ARRIVAL_THRESHOLD_RAMP_START_X - ARRIVAL_THRESHOLD_RAMP_END_X),
    0,
    1,
  );
  return ARRIVAL_THRESHOLD_FLOOR_Y - ARRIVAL_THRESHOLD_RAMP_RISE * rampProgress;
};

export const getArrivalThresholdEchoHitbox = (echo) => {
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
export const LOST_BRIDGE_ASSET_VERSION = 'lost-bridge-art-2026-06-10f';
export const LOST_BRIDGE_ASSET_DIR = 'assets/expedition/environment/egypt-opening/lost-bridge/';
export const LOST_BRIDGE_STRUCTURE_SRC = `${LOST_BRIDGE_ASSET_DIR}lost-bridge-structure-cutout-2026-06-08.png`;
export const LOST_BRIDGE_RAVINE_FLOOR_VARIANT_SRCS = {
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
export const LOST_BRIDGE_RAVINE_FLOOR_ASSET_KEYS = new Set(Object.keys(LOST_BRIDGE_RAVINE_FLOOR_VARIANT_SRCS));
export const LOST_BRIDGE_RAVINE_NORMAL_IMAGE_PROP_KEYS = new Set(['lostBridgeRavineUnderBridgeInsert']);
export const LOST_BRIDGE_PIECE_SRCS = {
  slab: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-deck-slab-cutout-2026-06-08.png`,
  landing: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-end-landing-cutout-2026-06-08.png`,
  timber: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-timber-span-cutout-2026-06-08.png`,
  pillar: `${LOST_BRIDGE_ASSET_DIR}lost-bridge-pillar-span-cutout-2026-06-08.png`,
};
// Per-piece alignment measured from the source art: horizontal padding fractions and the
// vertical fraction where the walkable deck surface sits, so the art lines up to the platform rect.
export const LOST_BRIDGE_PIECE_TUNING = {
  slab: { padL: 0.0119, padR: 0.0119, deckTopFrac: 0.0497 },
  landing: { padL: 0.0117, padR: 0.0117, deckTopFrac: 0.0473 },
  timber: { padL: 0.0114, padR: 0.0114, deckTopFrac: 0.055 },
  pillar: { padL: 0.012, padR: 0.012, deckTopFrac: 0.0475 },
};
export const LOST_BRIDGE_STRUCTURE_SIDE_PAD = 64;
export const LOST_BRIDGE_STRUCTURE_DECK_TOP_FRAC = 0.34;
export const LOST_BRIDGE_STRUCTURE_DECK_MAX_Y = 390;
export const LOST_BRIDGE_STRUCTURE_DECK_IDS = new Set([
  'lost-bridge-near-landing',
  'lost-bridge-slab-1',
  'lost-bridge-slab-2',
  'lost-bridge-far-landing',
]);
export const LOST_BRIDGE_EDITOR_DECK_IDS = new Set([
  'desert-entry-platform-9',
]);
export const LOST_BRIDGE_RAVINE_FLOOR_PROP_ID = 'desert-entry-lost-bridge-ravine-floor-1';
export const LOST_BRIDGE_OBSOLETE_RAVINE_FLOOR_PROP_IDS = new Set([
  'desert-entry-lost-bridge-ravine-floor-1-copy-1',
  'desert-entry-lost-bridge-ravine-floor-1-copy-1-copy-1',
]);
export const isLostBridgeRavineFloorProp = (prop = {}) => (
  prop.id === LOST_BRIDGE_RAVINE_FLOOR_PROP_ID
  || LOST_BRIDGE_RAVINE_FLOOR_ASSET_KEYS.has(prop.imageAssetKey)
);
export const isLostBridgeRavineNormalImageProp = (prop = {}) => (
  LOST_BRIDGE_RAVINE_NORMAL_IMAGE_PROP_KEYS.has(prop.imageAssetKey)
);
export const isLostBridgeRavineSpecialRendererProp = (prop = {}) => (
  isLostBridgeRavineFloorProp(prop) && !isLostBridgeRavineNormalImageProp(prop)
);
export const isObsoleteLostBridgeRavineFloorEditorProp = (prop = {}) => (
  LOST_BRIDGE_OBSOLETE_RAVINE_FLOOR_PROP_IDS.has(prop.id)
);
export const pruneObsoleteLostBridgeRavineFloorEditorProps = (editor = {}) => {
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
export const pruneRetiredDesertEntryBackgroundEditorProps = (editor = {}) => {
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
export const LOST_BRIDGE_RAVINE_FALL_DEPTH = 88;
export const LOST_BRIDGE_RAVINE_FALL_SIDE_PAD = 210;
export const LOST_BRIDGE_RAVINE_BLEND_CLIP_TOP_OFFSET = 8;
export const LOST_BRIDGE_RAVINE_BLEND_CLIP_PAD = 44;
export const LOST_BRIDGE_RAVINE_THROAT_TOP_OFFSET = 86;
export const LOST_BRIDGE_RAVINE_FOREGROUND_VOID_SIDE_PAD = 180;
export const LOST_BRIDGE_RAVINE_FOREGROUND_VOID_MIN_TOP_OFFSET = 310;
export const LOST_BRIDGE_RAVINE_FOREGROUND_VOID_GROUND_CLEARANCE = 8;
export const isLostBridgeStructureDeckPlatform = (platform = {}) => (
  (
    (platform.variant === 'lost-bridge' && LOST_BRIDGE_STRUCTURE_DECK_IDS.has(platform.id))
    || LOST_BRIDGE_EDITOR_DECK_IDS.has(platform.id)
  )
    && Number.isFinite(platform.y)
    && platform.y <= LOST_BRIDGE_STRUCTURE_DECK_MAX_Y
    && (platform.zIndex ?? 0) > -50
);
export const getLostBridgeDeckBounds = (platforms = []) => {
  const deckPlatforms = platforms.filter(isLostBridgeStructureDeckPlatform);
  if (deckPlatforms.length === 0) return null;
  const left = Math.min(...deckPlatforms.map(platform => platform.x));
  const right = Math.max(...deckPlatforms.map(platform => platform.x + platform.width));
  const y = Math.min(...deckPlatforms.map(platform => platform.y));
  return { left, right, y, span: right - left };
};
export const OPENING_SPHINX_SPRITE_BOSS_ID = 'ancient-construct';
export const OPENING_SPHINX_APPARITION_SRC = 'assets/expedition/bosses/anubis-apparition.png';
export const OPENING_SPHINX_SPRITE_VERSION = 'opening-anubis-apparition-2026-05-21';
export const OPENING_SPHINX_SCREEN_Y_OFFSET = 112;
export const OPENING_SPHINX_FOOT_Y = GROUND_Y - 10;
export const ROME_OPENING_BACKGROUND_SRC = 'assets/expedition/backgrounds/rome-forum-ruins/rome-forum-ruins-main-2026-06-24.png';
export const ROME_OPENING_ASHA_CUTSCENE_SRC = 'assets/expedition/player/asha-rome-cutscene-2026-06-24.png';
export const ROME_OPENING_LEGATE_CUTSCENE_SRC = 'assets/expedition/bosses/rome/rome-legate-revenant-cutscene-2026-06-24.png';
export const ROME_OPENING_VAULT_SIGIL_SRC = 'assets/expedition/environment/rome-section-one/rome-vault-sigil-cutscene-2026-06-24.png';
export const ROME_OPENING_ARRIVAL_NOTICE = 'The way back is sealed. The Legate is watching. The only path is through the Forum.';
export const CHINA_OPENING_BACKGROUND_SRC = 'assets/expedition/backgrounds/china-river-valley/china-river-valley-parallax-pack.png';
export const CHINA_OPENING_ASHA_CUTSCENE_SRC = 'assets/expedition/player/china-asha-cutscene-2026-06-24.png';
export const CHINA_OPENING_WATCHTOWER_SRC = 'assets/expedition/environment/china-river-valley/china-watchtower.png';
export const CHINA_OPENING_GATE_SEAL_SRC = 'assets/expedition/environment/china-river-valley/china-imperial-gate-sealed.png';
export const ROME_OPENING_CINEMATIC_ID = 'asha-legate-opening-cinematic';
export const CHINA_OPENING_CINEMATIC_ID = 'asha-china-watchtower-opening-cinematic';
export const EGYPT_OPENING_CINEMATIC_ID = 'asha-anubis-opening-cinematic';
export const CHINA_OPENING_CINEMATIC_DURATION = 24;
export const CHINA_OPENING_CINEMATIC_IMPACT_AT = 22.2;
export const getOpeningArrivalNoticeForCinematicId = (cinematicId) => {
  if (cinematicId === ROME_OPENING_CINEMATIC_ID) return ROME_OPENING_ARRIVAL_NOTICE;
  if (cinematicId === CHINA_OPENING_CINEMATIC_ID) return CHINA_OPENING_ARRIVAL_NOTICE;
  return OPENING_ARRIVAL_AFTERSHOCK_NOTICE;
};
export const TEMPLE_THRESHOLD_TRANSITION_DURATION = 8.4;
export const TEMPLE_THRESHOLD_FADE_OUT_SECONDS = 0.95;
export const TEMPLE_THRESHOLD_BLACK_HOLD_SECONDS = 0.55;
export const TEMPLE_THRESHOLD_FADE_IN_SECONDS = 1.05;
export const TEMPLE_THRESHOLD_SWITCH_SECONDS = TEMPLE_THRESHOLD_FADE_OUT_SECONDS + TEMPLE_THRESHOLD_BLACK_HOLD_SECONDS;
export const TEMPLE_THRESHOLD_ANUBIS_START_SECONDS = TEMPLE_THRESHOLD_SWITCH_SECONDS + TEMPLE_THRESHOLD_FADE_IN_SECONDS + 0.25;
export const FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION = 2.15;
export const FORGOTTEN_MURAL_CHAMBER_FADE_OUT_SECONDS = 0.62;
export const FORGOTTEN_MURAL_CHAMBER_BLACK_HOLD_SECONDS = 0.38;
export const FORGOTTEN_MURAL_CHAMBER_SWITCH_SECONDS = FORGOTTEN_MURAL_CHAMBER_FADE_OUT_SECONDS + FORGOTTEN_MURAL_CHAMBER_BLACK_HOLD_SECONDS;
export const FORGOTTEN_MURAL_CHAMBER_FADE_IN_SECONDS = 0.72;
export const OPENING_SCARAB_SEAL_IMAGE_SRC = 'assets/expedition/environment/egypt-opening/scarab-seal-ground-embedded.png';
// Glowing Anubis judgement circle for the opening cut scene. Drop the generated
// PNG (bright teal+gold sigil on a transparent/black field) at this path; until
// then the cinematic falls back to the original embedded-seal art via onError.
export const OPENING_JUDGEMENT_SEAL_IMAGE_SRC = 'assets/expedition/environment/egypt-opening/anubis-judgement-seal-2026-06-13.png';
export const OPENING_PYRAMID_CLIMB_PACK_SRC = 'assets/expedition/environment/egypt-opening/pyramid-climb-pack.png';
export const OPENING_PYRAMID_FACADE_SRC = 'assets/expedition/environment/egypt-opening/opening-pyramid-facade-no-stairs-v2.png';
export const OPENING_TRAP_DECAL_PACK_SRC = 'assets/expedition/environment/egypt-opening/opening-trap-decals.png';
export const OPENING_HAZARD_DECAL_PACK_SRC = 'assets/expedition/environment/egypt-opening/opening-hazard-decals.png';
export const OPENING_TOMB_STAIRWELL_SRC = 'assets/expedition/environment/egypt-opening/opening-tomb-stairwell.png';
export const ROUTE_GATE_FRONT_SRC = 'assets/expedition/environment/egypt-opening/route-gate-front.png';
export const ROUTE_GATE_BACK_SRC = 'assets/expedition/environment/egypt-opening/route-gate-back.png';
export const ROUTE_GATE_SLAB_SRC = 'assets/expedition/environment/egypt-opening/route-gate-slab.png';
export const ROUTE_GATE_STANDALONE_PROP_COLOR_GRADE_FILTER = 'sepia(8%) saturate(100%) brightness(98%) contrast(106%)';
export const MUMMIFICATION_CHAMBER_EXTERIOR_SRC = 'assets/expedition/environment/desert-temple/mummification-chamber-exterior-ledged-building-2026-06-12.png';
export const MUMMIFICATION_CHAMBER_INTERIOR_SRC = 'assets/expedition/environment/desert-temple/mummification-chamber-interior-side-scroll-2026-05-31.png';
export const FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_SRC = 'assets/expedition/environment/desert-temple/forgotten-mural-alcove-climb-structure.png';
export const FORGOTTEN_MURAL_CHAMBER_SRC = 'assets/expedition/environment/desert-temple/forgotten-mural-chamber.png';
export const FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_ART_SRC = 'assets/expedition/environment/desert-temple/forgotten-mural-relic-slide-puzzle-2026-06-01.png';
export const FORGOTTEN_MURAL_HIDDEN_MEMORY_REVEAL_SRC = 'assets/expedition/environment/desert-temple/forgotten-mural-hidden-memory-reveal-2026-06-01.png';
export const SCRIBE_CHAMBER_EXTERIOR_SRC = 'assets/expedition/environment/desert-temple/scribe-locked-chamber-exterior-climb-structure-v3.png';
export const SCRIBE_CHAMBER_INTERIOR_SRC = 'assets/expedition/environment/desert-temple/scribe-locked-chamber-interior-2026-06-01.png';
export const STAGE_ENTRANCE_DOORWAY_SRC = 'assets/expedition/environment/stage-entrances/egypt-tomb-doorway-transition.png';
export const STAGE_ENTRANCE_DOORWAY_VERSION = 'imagegen-egypt-tomb-doorway-transition-2026-05-20';
export const DESERT_END_GATEWAY_SRC = 'assets/expedition/environment/stage-entrances/desert-end-threshold-angled.png';
export const DESERT_END_GATEWAY_VERSION = 'imagegen-desert-end-threshold-angled-blended-2026-05-23';
export const SCARAB_QUEEN_LAIR_OPENING_IMAGE_SRC = 'assets/expedition/bosses/scarab-queen-buried-lair-opening.png';
export const SCORPION_NEST_SRC = 'assets/expedition/enemies/scorpion-nest.png';
export const SCORPION_NEST_VERSION = 'imagegen-scorpion-nest-2026-06-07';
export const SCORPION_VENOM_SPIT_EFFECT_SRC = 'assets/expedition/effects/scorpion-venom-spit-strip-2026-06-09.png';
export const SCORPION_VENOM_SPIT_EFFECT_VERSION = 'imagegen-scorpion-venom-spit-strip-2026-06-09';
export const SCORPION_VENOM_SPIT_EFFECT_FRAMES = 6;
// Editor-tunable render defaults for the scorpion-nest art. widthScale multiplies the
// data box width to set the drawn footprint (height follows the PNG's native aspect);
// yOffset nudges the ground anchor up/down (negative lifts); glowYFactor places the amber
// glow above the base (× data height); glowSize scales the glow ellipse.
export const SCORPION_NEST_EDITOR_DEFAULTS = { widthScale: 1.85, yOffset: 0, glowYFactor: 0.42, glowSize: 1 };
export const OPENING_CAMERA_REVEAL_DURATION = 1.55;
export const OPENING_CAMERA_REVEAL_PAN_SECONDS = 0.55;
export const OPENING_CAMERA_REVEAL_HOLD_SECONDS = 0.18;
export const OPENING_PYRAMID_ASSET_VERSION = 'opening-pyramid-climb-pack-2026-05-18';
export const ROUTE_GATE_ASSET_VERSION = 'imagegen-egypt-route-gate-arch-column-slab-2026-05-31';
export const OPENING_PYRAMID_FACADE_VERSION = 'opening-pyramid-facade-no-stairs-v2-2026-06-05';
export const OPENING_TOMB_STAIRWELL_VERSION = 'opening-tomb-stairwell-generated-2026-05-21';
export const MUMMIFICATION_CHAMBER_EXTERIOR_VERSION = 'imagegen-mummification-ledged-building-production-2026-06-12';
export const MUMMIFICATION_CHAMBER_INTERIOR_VERSION = 'imagegen-mummification-chamber-side-scroll-puzzle-ready-2026-05-31';
export const FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_VERSION = 'imagegen-forgotten-mural-alcove-climb-structure-2026-05-24';
export const FORGOTTEN_MURAL_CHAMBER_VERSION = 'imagegen-forgotten-mural-chamber-2026-05-24';
export const FORGOTTEN_MURAL_HIDDEN_MEMORY_REVEAL_VERSION = 'imagegen-forgotten-mural-hidden-memory-reveal-2026-06-01';
export const SCRIBE_CHAMBER_EXTERIOR_VERSION = 'imagegen-scribe-locked-chamber-exterior-v3-2026-06-05';
export const SCRIBE_CHAMBER_INTERIOR_VERSION = 'imagegen-scribe-locked-chamber-interior-2026-06-01';
export const DESERT_ENTRY_BACKGROUND_ART_VERSION = 'egypt-true-separated-parallax-route-2026-06-27';
export const DESERT_ENTRY_LAYERED_NECROPOLIS_OWNS_RAVINE_VISUALS = true;
