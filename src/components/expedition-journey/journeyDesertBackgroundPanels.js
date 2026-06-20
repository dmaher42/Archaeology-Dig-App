import { scaleJourneyX } from './journeyConstants.js';

export const DESERT_ENTRY_STORY_LOCKED_RECOVERY_VERSION = 'desert-entry-story-locked-recovery-2026-06-19';
export const DESERT_ENTRY_PROCEDURAL_PANEL_FALLBACK_ENABLED = false;
export const DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION = 'desert-journey-continuous-panels-2026-06-14-archived';

export const DESERT_JOURNEY_LAYER_ROLES = Object.freeze([
  'sky',
  'far',
  'mid',
  'ground',
  'foreground',
]);

const SHARED_PANEL_CONTRACT = Object.freeze({
  paletteId: 'golden-egypt-desert',
  lightDirection: 'upper-left',
  cameraAngle: 'side-on-2d',
  style: 'semi-realistic-egyptian-ruins',
  horizonY: 252,
  groundY: 595,
});

const makeLayers = (features) => Object.freeze([
  Object.freeze({
    role: 'sky',
    parallax: 0,
    ...features.sky,
  }),
  Object.freeze({
    role: 'far',
    parallax: 0.06,
    ...features.far,
  }),
  Object.freeze({
    role: 'mid',
    parallax: 0.18,
    ...features.mid,
  }),
  Object.freeze({
    role: 'ground',
    parallax: 0.42,
    ...features.ground,
  }),
  Object.freeze({
    role: 'foreground',
    parallax: 0.78,
    ...features.foreground,
  }),
]);

const makePanel = ({
  id,
  label,
  worldStart,
  worldEnd,
  features,
  ravineBridge = null,
}) => Object.freeze({
  ...SHARED_PANEL_CONTRACT,
  id,
  label,
  worldStart,
  worldEnd,
  layers: makeLayers(features),
  ...(ravineBridge ? { ravineBridge: Object.freeze(ravineBridge) } : {}),
});

const ROUTE_X = Object.freeze({
  openingStart: scaleJourneyX(0),
  ravineBridgeStart: scaleJourneyX(380),
  ravineBridgeEnd: scaleJourneyX(735),
  mummificationApproachEnd: scaleJourneyX(940),
  mummificationArrivalEnd: scaleJourneyX(1120),
  muralApproachEnd: scaleJourneyX(1320),
  scribeApproachEnd: scaleJourneyX(1835),
  queenGatewayEnd: scaleJourneyX(2360),
});

export const DESERT_JOURNEY_SCENE_PANELS = Object.freeze([
  makePanel({
    id: 'opening',
    label: 'Opening pyramid approach',
    worldStart: ROUTE_X.openingStart,
    worldEnd: ROUTE_X.ravineBridgeStart,
    features: {
      sky: { sun: 'high-left', haze: 'warm dawn wash' },
      far: { silhouettes: ['low pyramids', 'distant dunes', 'soft limestone ridge'] },
      mid: { structures: ['pyramid shoulder', 'buried sphinx mass', 'scattered survey ruins'] },
      ground: { terrain: 'smooth wind-cut sand track with shallow stone causeway hints' },
      foreground: { occluders: ['low rubble', 'boot dust', 'half-buried chips'] },
    },
  }),
  makePanel({
    id: 'ravine-bridge',
    label: 'Deep ravine bridge crossing',
    worldStart: ROUTE_X.ravineBridgeStart,
    worldEnd: ROUTE_X.ravineBridgeEnd,
    features: {
      sky: { sun: 'high-left', haze: 'slightly darker ravine dust' },
      far: { silhouettes: ['cut desert ridge', 'distant pyramids', 'sand-soft mountains'] },
      mid: { structures: ['ravine walls', 'broken stone piers', 'bridge silhouette'] },
      ground: { terrain: 'split cliff lips with a dark non-floor drop below the bridge' },
      foreground: { occluders: ['ravine throat shadow', 'broken bridge caps', 'falling dust'] },
    },
    ravineBridge: {
      deepGap: true,
      bridgeOnlySafeCrossing: true,
      darkCenterBelowBridge: true,
      falsePlayableLedges: false,
    },
  }),
  makePanel({
    id: 'ravine-to-mummification',
    label: 'Ravine exit toward mummification building',
    worldStart: ROUTE_X.ravineBridgeEnd,
    worldEnd: ROUTE_X.mummificationApproachEnd,
    features: {
      sky: { sun: 'high-left', haze: 'settling ochre dust' },
      far: { silhouettes: ['lower ridge', 'faded pyramid points', 'heat-haze hills'] },
      mid: { structures: ['cliff shoulder', 'distant mastaba wall', 'sand-cut temple edge'] },
      ground: { terrain: 'rising sand apron from ravine lip to sacred exterior' },
      foreground: { occluders: ['cliff wall edge', 'windblown rubble', 'thin dust veil'] },
    },
  }),
  makePanel({
    id: 'mummification-arrival',
    label: 'Mummification building arrival',
    worldStart: ROUTE_X.mummificationApproachEnd,
    worldEnd: ROUTE_X.mummificationArrivalEnd,
    features: {
      sky: { sun: 'high-left', haze: 'gold stone bounce light' },
      far: { silhouettes: ['quiet dunes', 'low pyramid backs', 'ritual ridge'] },
      mid: { structures: ['mummification facade mass', 'sealed doorway shadow', 'carved pylons'] },
      ground: { terrain: 'level ceremonial sand with buried masonry footings' },
      foreground: { occluders: ['temple threshold shadow', 'rubble lip', 'doorway dust'] },
    },
  }),
  makePanel({
    id: 'mummification-to-mural',
    label: 'Mummification exterior to mural wall',
    worldStart: ROUTE_X.mummificationArrivalEnd,
    worldEnd: ROUTE_X.muralApproachEnd,
    features: {
      sky: { sun: 'high-left', haze: 'continuous honey desert light' },
      far: { silhouettes: ['flat desert ridge', 'small pyramid teeth', 'heat shimmer'] },
      mid: { structures: ['record wall fragments', 'broken columns', 'buried mural approach'] },
      ground: { terrain: 'same-height sand track with stone record slabs emerging from it' },
      foreground: { occluders: ['broken pillar mask', 'plaster chips', 'mural dust'] },
    },
  }),
  makePanel({
    id: 'mural-to-scribe',
    label: 'Mural approach to scribe chamber',
    worldStart: ROUTE_X.muralApproachEnd,
    worldEnd: ROUTE_X.scribeApproachEnd,
    features: {
      sky: { sun: 'high-left', haze: 'slightly enclosed corridor glow' },
      far: { silhouettes: ['long desert ridge', 'soft mountain backs', 'distant ruin line'] },
      mid: { structures: ['mural ruin wall', 'archive column row', 'scribe doorway mass'] },
      ground: { terrain: 'continuous sacred record way with buried archive stones' },
      foreground: { occluders: ['ruined arch mask', 'sand-caught slabs', 'soft shadow bands'] },
    },
  }),
  makePanel({
    id: 'scribe-to-queen-gateway',
    label: 'Scribe chamber to Queen gateway',
    worldStart: ROUTE_X.scribeApproachEnd,
    worldEnd: ROUTE_X.queenGatewayEnd,
    features: {
      sky: { sun: 'high-left', haze: 'queen gateway sandstorm glow' },
      far: { silhouettes: ['dune wall', 'far pyramid crowns', 'storm-softened mountains'] },
      mid: { structures: ['scribe threshold ruins', 'scarab gateway pylons', 'queen arena silhouettes'] },
      ground: { terrain: 'same-height desert causeway leading into the queen gateway' },
      foreground: { occluders: ['shadowed corridor edge', 'scarab rubble', 'sandstorm overlay'] },
    },
  }),
]);

export const DESERT_JOURNEY_TRANSITION_MASKS = Object.freeze([
  Object.freeze({
    id: 'opening-to-ravine-dust-haze',
    from: 'opening',
    to: 'ravine-bridge',
    worldX: ROUTE_X.ravineBridgeStart,
    width: 560,
    mask: 'dust-haze',
    label: 'windblown dust haze hides the opening-to-ravine seam',
  }),
  Object.freeze({
    id: 'ravine-bridge-to-exit-cliff-wall',
    from: 'ravine-bridge',
    to: 'ravine-to-mummification',
    worldX: ROUTE_X.ravineBridgeEnd,
    width: 520,
    mask: 'cliff-wall',
    label: 'near cliff wall hides the bridge-to-ravine-exit seam',
  }),
  Object.freeze({
    id: 'ravine-exit-to-mummification-broken-pillar',
    from: 'ravine-to-mummification',
    to: 'mummification-arrival',
    worldX: ROUTE_X.mummificationApproachEnd,
    width: 500,
    mask: 'broken-pillar',
    label: 'broken pillar and rubble hide the mummification-arrival seam',
  }),
  Object.freeze({
    id: 'mummification-to-record-way-doorway',
    from: 'mummification-arrival',
    to: 'mummification-to-mural',
    worldX: ROUTE_X.mummificationArrivalEnd,
    width: 620,
    mask: 'temple-doorway',
    label: 'temple doorway shadow hides the mummification-to-mural seam',
  }),
  Object.freeze({
    id: 'record-way-to-mural-scribe-ruined-arch',
    from: 'mummification-to-mural',
    to: 'mural-to-scribe',
    worldX: ROUTE_X.muralApproachEnd,
    width: 540,
    mask: 'ruined-arch',
    label: 'ruined arch hides the mural-to-scribe seam',
  }),
  Object.freeze({
    id: 'scribe-to-queen-shadowed-corridor',
    from: 'mural-to-scribe',
    to: 'scribe-to-queen-gateway',
    worldX: ROUTE_X.scribeApproachEnd,
    width: 680,
    mask: 'shadowed-corridor',
    label: 'shadowed corridor and sand haze hide the queen-gateway seam',
  }),
]);

const getViewportBounds = (cameraX = 0, viewportWidth = 1120, margin = 0) => {
  const safeCameraX = Number.isFinite(cameraX) ? cameraX : 0;
  const safeWidth = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 1120;
  const safeMargin = Number.isFinite(margin) && margin > 0 ? margin : 0;
  return {
    left: safeCameraX - safeMargin,
    right: safeCameraX + safeWidth + safeMargin,
  };
};

export const getDesertJourneyPanelsForViewport = (cameraX = 0, viewportWidth = 1120, margin = 0) => {
  if (!DESERT_ENTRY_PROCEDURAL_PANEL_FALLBACK_ENABLED) return [];
  const viewport = getViewportBounds(cameraX, viewportWidth, margin);
  return DESERT_JOURNEY_SCENE_PANELS.filter(panel => (
    panel.worldStart < viewport.right && panel.worldEnd > viewport.left
  ));
};

export const getDesertJourneyTransitionMasksForViewport = (cameraX = 0, viewportWidth = 1120, margin = 0) => {
  if (!DESERT_ENTRY_PROCEDURAL_PANEL_FALLBACK_ENABLED) return [];
  const viewport = getViewportBounds(cameraX, viewportWidth, margin);
  return DESERT_JOURNEY_TRANSITION_MASKS.filter(transition => (
    transition.worldX + transition.width / 2 >= viewport.left
    && transition.worldX - transition.width / 2 <= viewport.right
  ));
};
