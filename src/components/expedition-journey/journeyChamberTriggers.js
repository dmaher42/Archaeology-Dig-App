import {
  CANVAS_WIDTH,
  GROUND_Y,
  JOURNEY_VERTICAL_OFFSET,
  KNOWLEDGE_CHALLENGE_SIZE,
  SCRIBE_CHAMBER_EXTERIOR_APPROACH_X,
  SCRIBE_CHAMBER_EXTERIOR_DOORWAY_X,
  sacredMuralExteriorX,
  sacredScribeExteriorX,
  scaleJourneyX,
} from './journeyConstants';
import { GUARDIAN_KNOWLEDGE_CHALLENGES, GUARDIAN_KNOWLEDGE_QUESTIONS, ROUTE_GATES, STAGE_ENTRANCE_FEATURES } from './journeyDataRouter';
import { createChamberDoorVisuals, createChamberDoorVisualsById } from './journeySacredRooms';
import { clamp, getSectionForX } from './journeyUtils';
import { getRitualChamberEntryGeometry } from './ritualBuildingClimb';

export const OPENING_PYRAMID_FACADE_WORLD_LEFT_X = -82;
export const DESERT_ENTRY_RETIRED_BACKGROUND_PROP_IDS = new Set([
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
export const DESERT_ENTRY_RETIRED_BACKGROUND_PROP_ID_PREFIXES = Object.freeze(
  [...DESERT_ENTRY_RETIRED_BACKGROUND_PROP_IDS].map(id => `${id}-copy-`),
);
export const DESERT_ENTRY_RETIRED_BACKGROUND_ASSET_PATH_MARKERS = Object.freeze([
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
export const DESERT_ENTRY_RETIRED_CHAMBER_DOOR_VISUAL_IDS = new Set([
  'mummification-chamber-entry-door',
]);
export const isRetiredDesertEntryBackgroundProp = (prop = {}) => {
  const id = typeof prop.id === 'string' ? prop.id : '';
  if (DESERT_ENTRY_RETIRED_BACKGROUND_PROP_IDS.has(id)) return true;
  if (DESERT_ENTRY_RETIRED_BACKGROUND_PROP_ID_PREFIXES.some(prefix => id.startsWith(prefix))) return true;
  if (prop.sectionId === 'desert-entry' && prop.type === 'generated-mummification-chamber-entrance') return true;
  const assetPath = typeof prop.assetPath === 'string' ? prop.assetPath : '';
  return DESERT_ENTRY_RETIRED_BACKGROUND_ASSET_PATH_MARKERS.some(marker => assetPath.includes(marker));
};
export const shouldRenderChamberDoorVisual = (door = {}) => (
  door.renderDoorVisual !== false
  && !DESERT_ENTRY_RETIRED_CHAMBER_DOOR_VISUAL_IDS.has(door.id)
);

export const DEFAULT_LEVEL_TRANSITION = {
  title: 'ROUTE COMPLETE',
  subtitle: 'Entering the next chamber',
  destinationNotice: 'Asha passes through the threshold.',
  finalNotice: 'The route ahead is open.',
  revealObjectiveLead: 200,
};

export const STAGE_ENTRANCE_THEME_FILTERS = {
  'sunlit-desert-gateway': 'sepia(3%) saturate(104%) brightness(103%) contrast(101%)',
  'cool-catacomb-descent': 'sepia(8%) saturate(88%) hue-rotate(162deg) brightness(72%) contrast(116%) drop-shadow(0 18px 20px rgba(0, 8, 18, 0.42))',
  'collapsed-breach': 'sepia(22%) saturate(125%) hue-rotate(-8deg) brightness(86%) contrast(118%) drop-shadow(0 18px 18px rgba(46, 21, 8, 0.38))',
  'open-dig-site-threshold': 'sepia(10%) saturate(112%) hue-rotate(20deg) brightness(104%) contrast(98%) drop-shadow(0 12px 18px rgba(35, 25, 10, 0.22))',
};

export const getStageEntranceForGate = (gate) => (
  STAGE_ENTRANCE_FEATURES.find(feature => feature.routeGateId === gate?.id && feature.levelTransition)
);

export const getStageEntranceTriggerX = (feature) => {
  if (!feature) return Number.NaN;
  const width = feature.width || CANVAS_WIDTH * 1.12;
  const passageVisual = feature.passageVisual || {};
  return feature.x - width / 2 + width * (feature.walkThroughTriggerX ?? passageVisual.centerX ?? 0.5);
};

export const getTimelineRequirementProgress = (sequence = [], current = {}) => {
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

export const areRouteGateRequirementsMetForState = (gate, current) => {
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

export const isStageEntranceAvailableForState = (feature, current) => {
  if (!feature?.routeGateId) return true;
  if (current.templeThresholdTransition?.featureId === feature.id) return true;
  const gate = ROUTE_GATES.find(item => item.id === feature.routeGateId);
  if (!gate) return true;
  return current.openedRouteGateIds?.has(gate.id) || areRouteGateRequirementsMetForState(gate, current);
};

export const isStageEntranceVisibleForState = (feature, current) => (
  Boolean(feature?.visibleWhenLocked) || isStageEntranceAvailableForState(feature, current)
);

export const isStageEntrancePastArrivalForState = (feature, current) => {
  if (!feature?.to || !current?.player) return false;
  if (current.templeThresholdTransition?.featureId === feature.id) return false;
  const playerCenterX = current.player.x + current.player.width / 2;
  const playerSectionId = getSectionForX(playerCenterX).id;
  return playerSectionId === feature.to && playerCenterX > feature.x + scaleJourneyX(96);
};

export const shouldRenderStageEntranceFeatureForState = (feature, current) => (
  isStageEntranceVisibleForState(feature, current) && !isStageEntrancePastArrivalForState(feature, current)
);

export const OPENING_PYRAMID_AIR_JUMP_ASSIST_ZONE = {
  minX: 126,
  maxX: 1138,
  minFootY: 90,
  maxFootY: 570,
};
export const OPENING_TRAP_DECAL_ASSET_VERSION = 'egypt-trap-hazard-generated-packs-2026-05-21';
export const OPENING_PYRAMID_ASSET_REGIONS = {
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
export const OPENING_TRAP_DECAL_REGIONS = {
  spikeTrap: { x: 36, y: 78, w: 430, h: 196 },
  pressurePlate: { x: 54, y: 300, w: 382, h: 132 },
  crackedFloor: { x: 558, y: 130, w: 376, h: 286 },
  scarabSealTrap: { x: 1012, y: 118, w: 438, h: 316 },
  glyphTripwire: { x: 44, y: 640, w: 466, h: 186 },
  fallingStoneWarning: { x: 610, y: 514, w: 342, h: 364 },
  softSandPit: { x: 1040, y: 542, w: 434, h: 346 },
};
export const OPENING_HAZARD_DECAL_REGIONS = {
  thornScrub: { x: 42, y: 174, w: 332, h: 254 },
  darkGap: { x: 410, y: 174, w: 344, h: 270 },
  batCloud: { x: 760, y: 166, w: 340, h: 286 },
  dustWave: { x: 1116, y: 166, w: 340, h: 278 },
  looseSlope: { x: 30, y: 582, w: 348, h: 250 },
  surveyRope: { x: 430, y: 604, w: 330, h: 214 },
  warningRubble: { x: 812, y: 598, w: 326, h: 230 },
  fallingStoneWarning: { x: 1172, y: 532, w: 320, h: 334 },
};
export const OPENING_TRAP_DECAL_BY_HAZARD = {
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
export const OPENING_HAZARD_DECAL_BY_HAZARD = {
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
export const EGYPT_HAZARD_DECAL_PLACEMENT = {
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
export const EGYPT_HAZARD_DECAL_PLACEMENT_BY_HAZARD = {
  'opening-seal-reset-trap': { xPad: 18, widthPad: 36, height: 42, footInset: 28 },
  'falling-blocks': { xPad: 24, widthPad: 48, height: 112, footInset: 2 },
  'temple-falling-chip': { xPad: 22, widthPad: 44, height: 96, footInset: 0 },
  'escape-falling-chip': { xPad: 22, widthPad: 44, height: 96, footInset: 0 },
  'bat-cloud': { xPad: 24, widthPad: 48, height: 96, footInset: 2 },
  'catacomb-bat-pocket': { xPad: 20, widthPad: 40, height: 84, footInset: 2 },
  'dust-wave': { xPad: 28, widthPad: 56, height: 90, footInset: 1 },
  'escape-dust-pocket': { xPad: 26, widthPad: 52, height: 78, footInset: 1 },
};
export const openingJourneyY = (y) => y + JOURNEY_VERTICAL_OFFSET;
export const SACRED_MURAL_APPROACH_X = sacredMuralExteriorX;
export const SACRED_SCRIBE_APPROACH_X = sacredScribeExteriorX;
export const TEMPLE_APPROACH_RAMP_WALK_SURFACE = [
  { x: 245, y: GROUND_Y },
  { x: 935, y: GROUND_Y },
];
export const TEMPLE_APPROACH_RAMP_ASSIST = {
  minX: 220,
  maxX: 946,
  maxSnapDown: 18,
  maxSnapUp: 18,
};
export const TEMPLE_APPROACH_RAMP_LOWER_PATH_FOOT_Y = GROUND_Y;
export const getTempleApproachRampSurfaceY = (centerX) => {
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
export const TEMPLE_THRESHOLD_HALL_ENTRY_SPAWN = {
  x: scaleJourneyX(150),
  y: openingJourneyY(318),
  cameraAnchorRatio: 0.38,
  direction: 1,
};
export const TEMPLE_THRESHOLD_HALL_RETURN_FALLBACK = {
  x: 865,
  y: GROUND_Y,
  cameraAnchorRatio: 0.5,
  direction: -1,
};
export const TEMPLE_THRESHOLD_HALL_ENTRY_TRIGGER = {
  minX: 805,
  maxX: 935,
  maxY: GROUND_Y + 10,
  footY: GROUND_Y,
  footTolerance: 36,
};
export const TEMPLE_THRESHOLD_HALL_ENTRY_DISABLED_FOR_BUILD = true;
export const TEMPLE_THRESHOLD_HALL_CAMERA_X = scaleJourneyX(80);
export const TEMPLE_THRESHOLD_HALL_BOUNDS = {
  minX: scaleJourneyX(80),
  maxX: scaleJourneyX(290),
};
export const TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER = {
  minX: scaleJourneyX(96),
  maxX: scaleJourneyX(126),
  maxY: GROUND_Y - 20,
  footY: openingJourneyY(318),
  footTolerance: 20,
};
export const TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER = {
  minX: scaleJourneyX(210),
  maxX: scaleJourneyX(246),
  maxY: GROUND_Y - 20,
  footY: openingJourneyY(318),
  footTolerance: 24,
};
export const MUMMIFICATION_CHAMBER_ENTRY_SPAWN = {
  x: scaleJourneyX(596),
  y: openingJourneyY(318),
  cameraAnchorRatio: 0.56,
  direction: 1,
};
// Entry door / trigger / return point derive from the Ritual Chamber building's
// tomb-door ledge fraction, so they track the building when it is resized in the
// Layers panel (see ritualBuildingClimb.js).
export const RITUAL_CHAMBER_ENTRY_GEOMETRY = getRitualChamberEntryGeometry();
export const MUMMIFICATION_CHAMBER_RETURN_FALLBACK = {
  x: RITUAL_CHAMBER_ENTRY_GEOMETRY.returnX,
  y: RITUAL_CHAMBER_ENTRY_GEOMETRY.returnY,
  cameraAnchorRatio: 0.42,
  direction: 1,
};
export const MUMMIFICATION_CHAMBER_ENTRY_TRIGGER = {
  minX: RITUAL_CHAMBER_ENTRY_GEOMETRY.trigger.minX,
  maxX: RITUAL_CHAMBER_ENTRY_GEOMETRY.trigger.maxX,
  maxY: GROUND_Y - 50,
  footY: RITUAL_CHAMBER_ENTRY_GEOMETRY.trigger.footY,
  footTolerance: 42,
};
export const MUMMIFICATION_CHAMBER_CAMERA_X = scaleJourneyX(520);
export const MUMMIFICATION_CHAMBER_BOUNDS = {
  minX: scaleJourneyX(520),
  maxX: scaleJourneyX(760),
};
export const MUMMIFICATION_CHAMBER_EXIT_TRIGGER = {
  minX: scaleJourneyX(535),
  maxX: scaleJourneyX(565),
  maxY: GROUND_Y - 20,
  footY: openingJourneyY(318),
  footTolerance: 20,
};
export const MUMMIFICATION_CHAMBER_INTERIOR_ASSET_DESCRIPTION = 'side-on mummification chamber, reachable mummy table, linen, canopic jars, oils, ritual tablet, Anubis statue, glowing exit seal';
export const MUMMIFICATION_CHAMBER_READABILITY = Object.freeze({
  mummificationChamberPuzzleCenterpiece: { x: 565, y: 310, radiusX: 210, radiusY: 64 },
  mummificationChamberReadableZones: [
    { id: 'left-sealed-entrance', x: 154, y: 340, radiusX: 88, radiusY: 160 },
    { id: 'embalming-table', x: 565, y: 314, radiusX: 220, radiusY: 80 },
    { id: 'linen-and-oils', x: 350, y: 465, radiusX: 140, radiusY: 82 },
    { id: 'canopic-jars', x: 585, y: 438, radiusX: 185, radiusY: 92 },
    { id: 'ritual-tablet', x: 780, y: 475, radiusX: 80, radiusY: 90 },
  ],
});
export const FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN = {
  x: scaleJourneyX(918),
  y: openingJourneyY(318),
  cameraAnchorRatio: 0.18,
  direction: 1,
};
export const FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK = {
  x: SACRED_MURAL_APPROACH_X(1220),
  y: openingJourneyY(318),
  cameraAnchorRatio: 0.42,
  direction: 1,
};
export const FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER = {
  minX: SACRED_MURAL_APPROACH_X(1213),
  maxX: SACRED_MURAL_APPROACH_X(1247),
  maxY: GROUND_Y - 170,
  footY: openingJourneyY(-42),
  footTolerance: 18,
};
export const FORGOTTEN_MURAL_CHAMBER_CAMERA_X = scaleJourneyX(880);
export const FORGOTTEN_MURAL_CHAMBER_BOUNDS = {
  minX: scaleJourneyX(880),
  maxX: scaleJourneyX(1074),
};
export const FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER = {
  minX: scaleJourneyX(880),
  maxX: scaleJourneyX(906),
  maxY: GROUND_Y - 20,
  footY: openingJourneyY(318),
  footTolerance: 20,
};
export const SCRIBE_CHAMBER_ENTRY_SPAWN = {
  x: scaleJourneyX(1210),
  y: openingJourneyY(318),
  cameraAnchorRatio: 0.16,
  direction: 1,
};
export const SCRIBE_CHAMBER_RETURN_FALLBACK = {
  x: SCRIBE_CHAMBER_EXTERIOR_APPROACH_X,
  y: GROUND_Y,
  cameraAnchorRatio: 0.42,
  direction: 1,
};
export const SCRIBE_CHAMBER_ENTRY_TRIGGER = {
  minX: SCRIBE_CHAMBER_EXTERIOR_DOORWAY_X - 42,
  maxX: SCRIBE_CHAMBER_EXTERIOR_DOORWAY_X + 54,
  maxY: GROUND_Y + 10,
  footY: GROUND_Y,
  footTolerance: 34,
};
export const SCRIBE_CHAMBER_CAMERA_X = scaleJourneyX(1180);
export const SCRIBE_CHAMBER_BOUNDS = {
  minX: scaleJourneyX(1188),
  maxX: scaleJourneyX(1378),
};
export const SCRIBE_CHAMBER_EXIT_TRIGGER = {
  minX: scaleJourneyX(1350),
  maxX: scaleJourneyX(1372),
  maxY: GROUND_Y - 20,
  footY: openingJourneyY(318),
  footTolerance: 20,
};
export const CHAMBER_DOOR_VISUALS = createChamberDoorVisuals({
  TEMPLE_THRESHOLD_HALL_ENTRY_TRIGGER,
  TEMPLE_THRESHOLD_HALL_RETURN_FALLBACK,
  MUMMIFICATION_CHAMBER_ENTRY_TRIGGER,
  MUMMIFICATION_CHAMBER_RETURN_FALLBACK,
  FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER,
  FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK,
  SCRIBE_CHAMBER_ENTRY_TRIGGER,
  SCRIBE_CHAMBER_RETURN_FALLBACK,
});
export const CHAMBER_DOOR_VISUALS_BY_ID = createChamberDoorVisualsById(CHAMBER_DOOR_VISUALS);
export const SCRIBE_CHAMBER_TABLET_REGION = {
  x: scaleJourneyX(1254),
  y: openingJourneyY(240),
  width: 74,
  height: 90,
};
export const SCRIBE_CHAMBER_WALL_REGION = {
  x: scaleJourneyX(1220),
  y: openingJourneyY(112),
  width: 760,
  height: 170,
};
export const OPENING_PYRAMID_FACADE_TIERS = [
  { x: 128, y: openingJourneyY(312), width: 1560, height: 92, inset: 116, alpha: 0.9 },
  { x: 230, y: openingJourneyY(270), width: 1370, height: 98, inset: 132, alpha: 0.92 },
  { x: 350, y: openingJourneyY(228), width: 1150, height: 106, inset: 144, alpha: 0.94 },
  { x: 490, y: openingJourneyY(186), width: 910, height: 112, inset: 142, alpha: 0.95 },
  { x: 650, y: openingJourneyY(144), width: 650, height: 118, inset: 126, alpha: 0.94 },
  { x: 830, y: openingJourneyY(102), width: 390, height: 132, inset: 96, alpha: 0.95 },
];

export const getGuardianChallengeQuestions = (bossId) => {
  const questionIds = GUARDIAN_KNOWLEDGE_CHALLENGES[bossId] || [];
  const selected = questionIds
    .map(id => GUARDIAN_KNOWLEDGE_QUESTIONS.find(question => question.id === id))
    .filter(Boolean);
  return selected.slice(0, KNOWLEDGE_CHALLENGE_SIZE);
};

export const getGuardianBattleModifier = (correctCount) => {
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

// 0.12s was fighting-game-expert territory; 0.2s keeps parries skilled but human.
export const PARRY_WINDOW_DURATION = 0.2;
