// Single source of truth for the Ritual Chamber building's world rect and the
// climb platforms + entry door laid on it.
//
// The climb ledges are defined as FRACTIONS of the building rather than absolute
// world coordinates, so resizing the building (via the Layers dev panel /
// desertLayerTuning.ritualPyramid: height, widthScale, position, baseY) moves the
// whole climb -- ledges, tomb-door ledge, and entry trigger -- with it
// automatically. No more re-laying every platform by hand after a resize.
// See [[egypt-enterable-buildings]].
//
// CAVEAT: fractions keep the ledges glued to the ART, but Asha's jump is a fixed
// pixel distance, so a DRASTIC height change can still spread the rungs past her
// reach. Spacing below is tuned jumpable at the default size; re-check it if you
// change `height` a lot.

import { scaleJourneyX, GROUND_Y } from './journeyConstants.js';
import { DESERT_LAYER_TUNING } from './desertLayerTuning.js';

// The ritualPyramid atlas region in desert-entry-parallax-pack.json (1672x865).
// The renderer fits the building art to this aspect (useJourneyRenderer.js,
// drawDesertEntryBackgroundFrame ritualPyramid block); the climb math MUST use the
// same aspect so the ledges stay glued to the drawn terraces.
export const RITUAL_BUILDING_REGION_ASPECT = 1672 / 865;

// Desert-entry section span (mirrors SECTIONS 'desert-entry' in journeyLevelData).
const DESERT_ENTRY_SECTION_START = scaleJourneyX(0);
const DESERT_ENTRY_SECTION_END = scaleJourneyX(2360);

// Building world rect from its live tuning. Mirrors the draw math in
// useJourneyRenderer (ritualWorldX / ritualWidth / baseY - height). Kept in lockstep
// with that block -- change both together.
export const getRitualBuildingRect = (
  tuning = DESERT_LAYER_TUNING.ritualPyramid,
  sectionStart = DESERT_ENTRY_SECTION_START,
  sectionEnd = DESERT_ENTRY_SECTION_END,
  regionAspect = RITUAL_BUILDING_REGION_ASPECT,
) => {
  const sectionWidth = Math.max(1, sectionEnd - sectionStart);
  const centerX = sectionStart + sectionWidth * tuning.sectionFraction;
  const width = tuning.height * regionAspect * (tuning.widthScale ?? 1);
  const height = tuning.height;
  const top = tuning.baseY - height; // world Y of the building's top edge
  return { centerX, left: centerX - width / 2, top, width, height };
};

export const RITUAL_DOORWAY_LEDGE_ID = 'mummification-chamber-doorway-floor';
const RITUAL_LEDGE_HEIGHT = 18;

// The climb, as fractions of the building rect. fx/fy = the platform CENTRE as a
// fraction across (0 = left edge, 1 = right edge) / down (0 = top, 1 = base) the
// building; wf = width as a fraction of building width. The first 10 form the main
// ground -> tomb-door ladder; the rest are forgiving side ledges + optional roof.
export const RITUAL_CLIMB_LEDGE_LAYOUT = [
  // --- main ascending ladder (ground -> tomb door) ---
  { id: 'mummification-chamber-bottom-secret-threshold', fx: 0.26, fy: 0.90, wf: 0.12 },
  { id: 'mummification-chamber-left-lower-terrace', fx: 0.33, fy: 0.80, wf: 0.12 },
  { id: 'mummification-chamber-sand-buried-block', fx: 0.40, fy: 0.70, wf: 0.11 },
  { id: 'mummification-chamber-central-left-shelf', fx: 0.46, fy: 0.60, wf: 0.12 },
  { id: 'mummification-chamber-left-sandstone-shelf', fx: 0.52, fy: 0.50, wf: 0.11 },
  { id: 'mummification-chamber-right-stair-landing', fx: 0.58, fy: 0.41, wf: 0.11 },
  { id: 'mummification-chamber-carved-lower-ledge', fx: 0.65, fy: 0.32, wf: 0.12 },
  { id: 'mummification-chamber-right-low-landing', fx: 0.73, fy: 0.25, wf: 0.11 },
  { id: 'mummification-chamber-upper-rite-ledge', fx: 0.80, fy: 0.23, wf: 0.11 },
  { id: RITUAL_DOORWAY_LEDGE_ID, fx: 0.86, fy: 0.21, wf: 0.12 }, // tomb-door landing (entry)
  // --- secondary side ledges (forgiveness) + roof (optional shard route) ---
  { id: 'mummification-chamber-left-pedestal-top', fx: 0.43, fy: 0.66, wf: 0.10 },
  { id: 'mummification-chamber-left-column-cap', fx: 0.49, fy: 0.55, wf: 0.10 },
  { id: 'mummification-chamber-central-drop-slab', fx: 0.55, fy: 0.46, wf: 0.10 },
  { id: 'mummification-chamber-left-doorway-ledge', fx: 0.62, fy: 0.37, wf: 0.10 },
  { id: 'mummification-chamber-right-column-cap', fx: 0.91, fy: 0.25, wf: 0.10 },
  { id: 'mummification-chamber-upper-left-platform', fx: 0.70, fy: 0.15, wf: 0.10 },
  { id: 'mummification-chamber-upper-right-platform', fx: 0.82, fy: 0.13, wf: 0.10 },
];

// id -> { x, y, width } in world space for the current building rect.
export const computeRitualClimbLedges = (rect = getRitualBuildingRect()) => {
  const map = new Map();
  for (const ledge of RITUAL_CLIMB_LEDGE_LAYOUT) {
    const width = Math.round(ledge.wf * rect.width);
    const x = Math.round(rect.left + ledge.fx * rect.width - width / 2);
    const y = Math.round(rect.top + ledge.fy * rect.height);
    map.set(ledge.id, { x, y, width });
  }
  return map;
};

// Reposition the climb ledges onto the building, keeping every other field
// (secret/invisible/label/sceneId) intact. Non-climb platforms pass through.
export const applyRitualClimbLayout = (platforms) => {
  if (!Array.isArray(platforms)) return platforms;
  const coords = computeRitualClimbLedges();
  return platforms.map((platform) => {
    const next = platform && platform.id ? coords.get(platform.id) : null;
    return next
      ? { ...platform, x: next.x, y: next.y, width: next.width, height: RITUAL_LEDGE_HEIGHT }
      : platform;
  });
};

// The secret-route trigger zone, sized to enclose the whole climb (down to the
// ground), so it tracks the building too. The route's x/width drive both the
// "discover route" detection and the vertical climb-camera window (useJourneyDraw).
export const getRitualClimbRouteBounds = (rect = getRitualBuildingRect()) => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  for (const ledge of RITUAL_CLIMB_LEDGE_LAYOUT) {
    const width = ledge.wf * rect.width;
    const left = rect.left + ledge.fx * rect.width - width / 2;
    minX = Math.min(minX, left);
    maxX = Math.max(maxX, left + width);
    minY = Math.min(minY, rect.top + ledge.fy * rect.height);
  }
  const pad = 60;
  const x = Math.round(minX - pad);
  const y = Math.round(minY - pad);
  return { x, y, width: Math.round(maxX + pad - x), height: Math.round(GROUND_Y - y) };
};

export const applyRitualClimbRouteBounds = (hiddenRoutes) => {
  if (!Array.isArray(hiddenRoutes)) return hiddenRoutes;
  const bounds = getRitualClimbRouteBounds();
  return hiddenRoutes.map((route) => (
    route && route.id === 'mummification-chamber-route'
      ? { ...route, x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }
      : route
  ));
};

// Entry door + trigger geometry derived from the tomb-door ledge fraction, so the
// "E to enter" zone and the return point track the building too.
export const getRitualChamberEntryGeometry = (rect = getRitualBuildingRect()) => {
  const door = RITUAL_CLIMB_LEDGE_LAYOUT.find((ledge) => ledge.id === RITUAL_DOORWAY_LEDGE_ID);
  const doorCenterX = rect.left + door.fx * rect.width;
  const doorTopY = rect.top + door.fy * rect.height;
  const bandHalf = rect.width * 0.05;
  return {
    doorCenterX: Math.round(doorCenterX),
    doorTopY: Math.round(doorTopY),
    trigger: {
      minX: Math.round(doorCenterX - bandHalf),
      maxX: Math.round(doorCenterX + bandHalf),
      footY: Math.round(doorTopY),
    },
    returnX: Math.round(doorCenterX),
    returnY: Math.round(doorTopY - 2),
  };
};
