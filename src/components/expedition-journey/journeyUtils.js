import {
  COMBAT_DAMAGE_SCALE,
  GROUND_Y,
  INITIAL_JOURNEY_NOTICE,
  PLAYER_HEIGHT,
  PLAYER_SPRITE_FRAME_COUNT,
  PLAYER_SPRITE_SCALE,
  PLAYER_WIDTH,
} from './journeyConstants.js';
import { BOSS_KEY_ITEMS, CHECKPOINTS, getJourneyEnemies, getJourneyMiniBosses, SECTIONS, SECTION_ATMOSPHERES } from './journeyDataRouter.js';
import {
  applyJourneyTrapPlacementEdit,
  getJourneyTrapTriggerRect,
  isReusableJourneyTrap,
} from './journeyTraps.js';
import { RELIC_SHARD_FRAGMENT_SPRITE_KEYS } from './journeyCollectibleSprites.js';

export {
  createJourneyTrapFromPaletteItem,
  createJourneyTrapPalette,
  getJourneyTrapTriggerRect,
  isReusableJourneyTrap,
  JOURNEY_TRAP_DIRECTIONS,
  JOURNEY_TRAP_TYPES,
  normalizeJourneyTrap,
  updateJourneyTrapRuntime,
} from './journeyTraps.js';

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const isJourneyProgressRouteGate = (gate = {}) => (
  Boolean(gate?.id)
  && Number.isFinite(gate.x)
  && Boolean(gate.requires)
  && Object.keys(gate.requires).length > 0
);

const getRouteGateRightEdge = gate => (
  gate.x + Math.max(1, Number.isFinite(gate.width) ? gate.width : 0)
);

const getRouteGateCenterX = gate => (
  gate.x + Math.max(1, Number.isFinite(gate.width) ? gate.width : 0) / 2
);

export const getNextJourneyRouteGate = (routeGates = [], current = {}) => {
  const openedRouteGateIds = current?.openedRouteGateIds;
  const playerX = Number.isFinite(current?.player?.x) ? current.player.x : -Infinity;
  const playerWidth = Number.isFinite(current?.player?.width) ? current.player.width : 0;
  const playerCenterX = playerX + playerWidth / 2;
  const candidates = Array.from(routeGates || [])
    .filter(isJourneyProgressRouteGate)
    .filter(gate => !openedRouteGateIds?.has?.(gate.id));

  const aheadGate = candidates.find(gate => (
    getRouteGateRightEdge(gate) >= playerCenterX - 12
  ));
  if (aheadGate) return aheadGate;

  return candidates
    .slice()
    .sort((a, b) => (
      Math.abs(getRouteGateCenterX(a) - playerCenterX) - Math.abs(getRouteGateCenterX(b) - playerCenterX)
    ))[0] || null;
};

export const getJourneyCameraXForWorldX = (worldX, cameraAnchorRatio = 0.42, canvasWidth = 960, worldWidth = Infinity) => {
  const maxCameraX = Number.isFinite(worldWidth) && Number.isFinite(canvasWidth)
    ? Math.max(0, worldWidth - canvasWidth)
    : Infinity;
  return clamp(worldX - canvasWidth * cameraAnchorRatio, 0, maxCameraX);
};

export const resolveJourneyChamberEntryTrigger = ({
  door = {},
  route = null,
  platform = null,
} = {}) => {
  const fallback = door?.trigger;
  if (!fallback) return null;
  if (!route && !platform) return fallback;

  const fallbackWidth = Math.max(1, (fallback.maxX || 0) - (fallback.minX || 0));
  const routeLeft = Number.isFinite(route?.x) ? route.x : -Infinity;
  const routeRight = Number.isFinite(route?.x) && Number.isFinite(route?.width)
    ? route.x + route.width
    : Infinity;
  const platformLeft = Number.isFinite(platform?.x) ? platform.x : null;
  const platformRight = platformLeft !== null && Number.isFinite(platform?.width)
    ? platform.x + platform.width
    : null;
  const sourceLeft = platformLeft ?? (Number.isFinite(route?.x) ? route.x : fallback.minX);
  const sourceRight = platformRight ?? (
    Number.isFinite(route?.x) && Number.isFinite(route?.width)
      ? route.x + route.width
      : fallback.maxX
  );
  const padding = Math.max(24, Math.min(52, fallbackWidth * 0.18));
  let minX = sourceLeft - padding;
  let maxX = sourceRight + padding;
  if (route) {
    minX = Math.max(minX, routeLeft);
    maxX = Math.min(maxX, routeRight);
  }
  if (!(maxX > minX)) {
    minX = fallback.minX;
    maxX = fallback.maxX;
  }

  return {
    ...fallback,
    minX,
    maxX,
    footY: Number.isFinite(platform?.y) ? platform.y : fallback.footY,
    footTolerance: Math.max(fallback.footTolerance || 0, Number.isFinite(platform?.height) ? platform.height + 6 : 0),
    routeId: door.routeId || null,
    entryPlatformId: door.entryPlatformId || null,
  };
};

export const resolveJourneyChamberReturnPoint = ({
  door = {},
  route = null,
  platform = null,
  direction = 1,
  exteriorSceneId = 'egypt-exterior-route',
  canvasWidth = 960,
  worldWidth = Infinity,
} = {}) => {
  const fallback = door?.returnFallback || {};
  const trigger = resolveJourneyChamberEntryTrigger({ door, route, platform });
  const x = trigger
    ? (trigger.minX + trigger.maxX) / 2
    : fallback.x;
  const y = Number.isFinite(trigger?.footY) ? trigger.footY : fallback.y;
  const cameraAnchorRatio = fallback.cameraAnchorRatio;

  return {
    sceneId: exteriorSceneId,
    x,
    y,
    direction: direction || fallback.direction || 1,
    cameraAnchorRatio,
    cameraX: getJourneyCameraXForWorldX(x, cameraAnchorRatio ?? 0.42, canvasWidth, worldWidth),
  };
};

export const DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE = 16;
export const DEFAULT_JOURNEY_PROP_EDITOR_SCALE_STEP = 0.1;
export const DEFAULT_JOURNEY_PROP_EDITOR_ROTATION_STEP = 5;
const STORY_PROP_EXPORT_SOURCE = 'src/components/expedition-journey/journeyLevelData.js::STORY_PROPS';
const PLATFORM_EXPORT_SOURCE = 'src/components/expedition-journey/journeyLevelData.js::PLATFORMS';
const HAZARD_EXPORT_SOURCE = 'src/components/expedition-journey/journeyLevelData.js::HAZARDS';
const ROUTE_GATE_EXPORT_SOURCE = 'src/components/expedition-journey/journeyLevelData.js::ROUTE_GATES';
const ROUTE_GATE_DOORWAY_EXPORT_SOURCE = 'src/components/expedition-journey/journeyLevelData.js::ROUTE_GATE_DOORWAYS';
const CHECKPOINT_EXPORT_SOURCE = 'src/components/expedition-journey/journeyLevelData.js::CHECKPOINTS';
const ENEMY_EXPORT_SOURCE = 'src/components/expedition-journey/journeyLevelData.js::ENEMIES';
const MINI_BOSS_EXPORT_SOURCE = 'src/components/expedition-journey/journeyLevelData.js::MINI_BOSSES';

export const snapJourneyPropCoordinate = (value, gridSize = DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE) => {
  const numericValue = Number(value);
  const numericGridSize = Number(gridSize);
  if (!Number.isFinite(numericValue)) return value;
  if (!Number.isFinite(numericGridSize) || numericGridSize <= 1) return Math.round(numericValue);
  return Math.round(numericValue / numericGridSize) * numericGridSize;
};

export const getJourneyPropRoomId = (prop = {}, currentSceneId = null, currentSectionId = null) => (
  prop.sceneId || prop.sectionId || currentSectionId || currentSceneId || 'unknown-room'
);

const finiteGroundContactNumber = (value, { round = false, min = -Infinity, max = Infinity } = {}) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return undefined;
  const bounded = Math.min(max, Math.max(min, numericValue));
  return round ? Math.round(bounded) : Math.round(bounded * 1000) / 1000;
};

const normalizeJourneyGroundContactLayer = (contactLayer = []) => (
  (Array.isArray(contactLayer) ? contactLayer : [])
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const assetKey = typeof entry.assetKey === 'string' ? entry.assetKey.trim() : '';
      if (!assetKey) return null;
      const normalized = { assetKey };
      ['layer', 'filter', 'mode', 'alignY'].forEach((field) => {
        if (typeof entry[field] === 'string' && entry[field].trim()) normalized[field] = entry[field].trim();
      });
      [
        ['xRatio', {}],
        ['widthRatio', { min: 0 }],
        ['xOffset', { round: true }],
        ['yOffset', { round: true }],
        ['width', { round: true, min: 1 }],
        ['height', { round: true, min: 1 }],
        ['rotation', {}],
        ['alpha', { min: 0, max: 1 }],
      ].forEach(([field, options]) => {
        const normalizedValue = finiteGroundContactNumber(entry[field], options);
        if (normalizedValue !== undefined) normalized[field] = normalizedValue;
      });
      if (entry.mirrorX === true) normalized.mirrorX = true;
      return normalized;
    })
    .filter(Boolean)
);

export const applyJourneyPropPlacementEdit = (prop = {}, edit = {}) => {
  const next = { ...prop };
  if (Number.isFinite(edit.x)) next.x = edit.x;
  if (Number.isFinite(edit.y)) next.y = edit.y;
  if (Number.isFinite(edit.yOffset)) next.yOffset = Math.round(edit.yOffset);
  if (Number.isFinite(edit.width)) next.width = Math.max(1, Math.round(edit.width));
  if (Number.isFinite(edit.height)) next.height = Math.max(1, Math.round(edit.height));
  if (Number.isFinite(edit.editorBoundsInsetTop)) next.editorBoundsInsetTop = Math.max(0, Math.round(edit.editorBoundsInsetTop));
  if (Number.isFinite(edit.editorBoundsInsetRight)) next.editorBoundsInsetRight = Math.max(0, Math.round(edit.editorBoundsInsetRight));
  if (Number.isFinite(edit.editorBoundsInsetBottom)) next.editorBoundsInsetBottom = Math.max(0, Math.round(edit.editorBoundsInsetBottom));
  if (Number.isFinite(edit.editorBoundsInsetLeft)) next.editorBoundsInsetLeft = Math.max(0, Math.round(edit.editorBoundsInsetLeft));
  if (Number.isFinite(edit.scale)) next.scale = Math.max(0.1, Math.round(edit.scale * 100) / 100);
  if (Number.isFinite(edit.widthScale)) next.widthScale = clamp(Math.round(edit.widthScale * 100) / 100, 0.2, 3);
  if (Number.isFinite(edit.rotation)) next.rotation = Math.round(edit.rotation * 10) / 10;
  if (typeof edit.mirrorX === 'boolean') next.mirrorX = edit.mirrorX;
  if (typeof edit.mirrorY === 'boolean') next.mirrorY = edit.mirrorY;
  if (Number.isFinite(edit.brightness)) next.brightness = Math.max(0.4, Math.min(1.8, Math.round(edit.brightness * 100) / 100));
  if (typeof edit.depth === 'string' && edit.depth.trim()) next.depth = edit.depth;
  if (typeof edit.layer === 'string' && edit.layer.trim()) next.layer = edit.layer;
  if (Number.isFinite(edit.zIndex)) next.zIndex = edit.zIndex;
  if (Number.isFinite(edit.shadowOpacity)) next.shadowOpacity = Math.max(0, Math.min(0.42, Math.round(edit.shadowOpacity * 100) / 100));
  if (Number.isFinite(edit.shadowWidth)) next.shadowWidth = Math.max(0, Math.round(edit.shadowWidth));
  if (Number.isFinite(edit.shadowHeight)) next.shadowHeight = Math.max(0, Math.round(edit.shadowHeight));
  if (Number.isFinite(edit.sandOverlapHeight)) next.sandOverlapHeight = Math.max(0, Math.round(edit.sandOverlapHeight));
  if (Number.isFinite(edit.sandMoundWidth)) next.sandMoundWidth = Math.max(0, Math.round(edit.sandMoundWidth));
  if (Number.isFinite(edit.sandMoundHeight)) next.sandMoundHeight = Math.max(0, Math.round(edit.sandMoundHeight));
  if (Number.isFinite(edit.groundPebbles)) next.groundPebbles = Math.max(0, Math.round(edit.groundPebbles));
  if (typeof edit.colorGradeFilter === 'string') next.colorGradeFilter = edit.colorGradeFilter;
  if (typeof edit.tintColor === 'string') next.tintColor = edit.tintColor;
  if (Number.isFinite(edit.tintStrength)) next.tintStrength = Math.max(0, Math.min(1, Math.round(edit.tintStrength * 100) / 100));
  // Paint tint: a solid colour multiplied onto the sprite (reaches true target
  // colours, unlike the photo-filter colorGradeFilter). Independent of tintColor.
  if (typeof edit.paintColor === 'string') next.paintColor = edit.paintColor;
  if (Number.isFinite(edit.paintStrength)) next.paintStrength = Math.max(0, Math.min(1, Math.round(edit.paintStrength * 100) / 100));
  if (Array.isArray(edit.groundContactLayer)) next.groundContactLayer = normalizeJourneyGroundContactLayer(edit.groundContactLayer);
  return next;
};

export const applyJourneyPlatformPlacementEdit = (platform = {}, edit = {}) => {
  const next = { ...platform };
  if (Number.isFinite(edit.x)) next.x = edit.x;
  if (Number.isFinite(edit.y)) next.y = edit.y;
  if (Number.isFinite(edit.width)) next.width = Math.max(1, Math.round(edit.width));
  if (Number.isFinite(edit.height)) next.height = Math.max(1, Math.round(edit.height));
  if (typeof edit.layer === 'string' && edit.layer.trim()) next.layer = edit.layer;
  if (typeof edit.collision === 'string') next.collision = edit.collision;
  if (typeof edit.blockerShape === 'string') next.blockerShape = edit.blockerShape;
  if (Number.isFinite(edit.zIndex)) next.zIndex = edit.zIndex;
  return next;
};

export const applyJourneyHazardPlacementEdit = (hazard = {}, edit = {}) => {
  const trapSpecificEdit = Boolean(
    edit.type
    || edit.triggerArea
    || Number.isFinite(edit.damage)
    || typeof edit.reset === 'boolean'
    || Number.isFinite(edit.cooldown)
    || edit.depth
    || edit.direction
    || Number.isFinite(edit.launcherX)
    || Number.isFinite(edit.launcherY)
    || Array.isArray(edit.linkedObjectIds)
    || typeof edit.editorVisible === 'boolean',
  );
  if (!isReusableJourneyTrap(hazard) && !trapSpecificEdit) {
    const next = { ...hazard };
    if (Number.isFinite(edit.x)) next.x = edit.x;
    if (Number.isFinite(edit.y)) next.y = edit.y;
    if (Number.isFinite(edit.width)) next.width = Math.max(1, Math.round(edit.width));
    if (Number.isFinite(edit.height)) next.height = Math.max(1, Math.round(edit.height));
    if (Number.isFinite(edit.burial)) next.burial = Math.max(0, Math.min(0.85, Math.round(edit.burial * 100) / 100));
    if (Number.isFinite(edit.brightness)) next.brightness = Math.max(0.4, Math.min(1.8, Math.round(edit.brightness * 100) / 100));
    if (Number.isFinite(edit.alpha)) next.alpha = Math.max(0, Math.min(1, Math.round(edit.alpha * 100) / 100));
    if (typeof edit.colorGradeFilter === 'string') next.colorGradeFilter = edit.colorGradeFilter;
    return next;
  }
  return applyJourneyTrapPlacementEdit(hazard, edit);
};

export const applyJourneyRouteGatePlacementEdit = (gate = {}, edit = {}) => {
  const next = { ...gate };
  if (Number.isFinite(edit.x)) next.x = edit.x;
  if (Number.isFinite(edit.y)) next.y = edit.y;
  if (Number.isFinite(edit.width)) next.width = Math.max(1, Math.round(edit.width));
  if (Number.isFinite(edit.height)) next.height = Math.max(1, Math.round(edit.height));
  return next;
};

export const applyJourneyRouteGateDoorwayPlacementEdit = (doorway = {}, edit = {}) => {
  const next = { ...doorway };
  if (Number.isFinite(edit.x)) {
    const previousAnchorX = Number.isFinite(next.anchorX) ? next.anchorX : Number.isFinite(next.blockX) ? next.blockX : edit.x;
    const deltaX = edit.x - previousAnchorX;
    next.anchorX = edit.x;
    next.blockX = Number.isFinite(next.blockX) ? Math.round(next.blockX + deltaX) : edit.x;
  }
  if (Number.isFinite(edit.y)) next.y = edit.y;
  if (Number.isFinite(edit.width)) next.width = Math.max(1, Math.round(edit.width));
  if (Number.isFinite(edit.height)) next.height = Math.max(1, Math.round(edit.height));
  return next;
};

export const applyJourneyCheckpointPlacementEdit = (checkpoint = {}, edit = {}) => {
  const next = { ...checkpoint };
  if (Number.isFinite(edit.x)) {
    const previousX = Number.isFinite(next.x) ? next.x : edit.x;
    const deltaX = edit.x - previousX;
    next.x = edit.x;
    if (Number.isFinite(next.markerX)) next.markerX = Math.round(next.markerX + deltaX);
  }
  if (Number.isFinite(edit.y)) next.y = edit.y;
  return next;
};

export const applyJourneyMiniBossPlacementEdit = (boss = {}, edit = {}) => {
  const next = { ...boss };
  if (Number.isFinite(edit.x)) next.x = edit.x;
  if (Number.isFinite(edit.y)) next.y = edit.y;
  if (Number.isFinite(edit.width)) next.width = Math.max(1, Math.round(edit.width));
  if (Number.isFinite(edit.height)) next.height = Math.max(1, Math.round(edit.height));
  if (Number.isFinite(edit.arenaStart)) next.arenaStart = edit.arenaStart;
  if (Number.isFinite(edit.arenaEnd)) next.arenaEnd = edit.arenaEnd;
  if (Number.isFinite(edit.lairX)) next.lairX = edit.lairX;
  if (Number.isFinite(edit.lairY)) next.lairY = edit.lairY;
  if (Number.isFinite(edit.lairWidth)) next.lairWidth = Math.max(1, Math.round(edit.lairWidth));
  if (Number.isFinite(edit.lairHeight)) next.lairHeight = Math.max(1, Math.round(edit.lairHeight));
  if (Number.isFinite(edit.patrolMin)) next.patrolMin = edit.patrolMin;
  if (Number.isFinite(edit.patrolMax)) next.patrolMax = edit.patrolMax;
  return next;
};

const PROP_TEMPLATE_FIELDS = [
  'type',
  'atmosphereAssetKey',
  'imageAssetKey',
  'groundDetailAssetKey',
  'foregroundDetailAssetKey',
  'collectibleSpriteKey',
  'assetPath',
  'width',
  'height',
  'editorBoundsInsetTop',
  'editorBoundsInsetRight',
  'editorBoundsInsetBottom',
  'editorBoundsInsetLeft',
  'yOffset',
  'alpha',
  'depth',
  'layer',
  'zIndex',
  'collidable',
  'tint',
  'colorGradeFilter',
  'shadow',
  'dust',
  'bury',
  'placementPreset',
  'sceneBlend',
  'groundPlaneOffset',
  'assetContactYRatio',
  'burialDepth',
  'shadowWidth',
  'shadowHeight',
  'shadowOpacity',
  'sandOverlapHeight',
  'sandMoundWidth',
  'sandMoundHeight',
  'groundPebbles',
  'scale',
  'widthScale',
  'rotation',
  'mirrorX',
  'mirrorY',
  'brightness',
  'groundContactLayer',
];

const JOURNEY_GROUND_DETAIL_PALETTE_ITEMS = [
  { assetKey: 'premiumLongSandLip', label: 'Long Sand Lip', width: 320, height: 58, alpha: 0.54 },
  { assetKey: 'premiumShortSandLip', label: 'Short Sand Lip', width: 176, height: 48, alpha: 0.58 },
  { assetKey: 'premiumDoorThresholdBuildup', label: 'Door Threshold Buildup', width: 220, height: 58, alpha: 0.62 },
  { assetKey: 'premiumBrokenMasonryFooting', label: 'Broken Masonry Footing', width: 168, height: 64, alpha: 0.66 },
  { assetKey: 'premiumRubbleContactShadow', label: 'Rubble Contact Shadow', width: 184, height: 52, alpha: 0.46 },
  { assetKey: 'premiumHalfBuriedStairSupport', label: 'Half Buried Stair Support', width: 154, height: 62, alpha: 0.66 },
  { assetKey: 'premiumCarvedStoneEdge', label: 'Carved Stone Edge', width: 172, height: 56, alpha: 0.64 },
  { assetKey: 'premiumSmallStoneScatter', label: 'Small Stone Scatter', width: 132, height: 55, alpha: 0.64 },
  { assetKey: 'premiumLowSedimentRibbon', label: 'Low Sediment Ribbon', width: 214, height: 42, alpha: 0.48 },
  { assetKey: 'premiumRubbleMoundBlend', label: 'Rubble Mound Blend', width: 260, height: 70, alpha: 0.6 },
];

const JOURNEY_FOREGROUND_DETAIL_PALETTE_ITEMS = [
  { assetKey: 'leftBrokenColumn', label: 'Left Broken Column', width: 112, height: 188, alpha: 0.82 },
  { assetKey: 'rightBrokenColumn', label: 'Right Broken Column', width: 118, height: 188, alpha: 0.82 },
  { assetKey: 'rubbleClusterLarge', label: 'Rubble Cluster Large', width: 180, height: 114, alpha: 0.84 },
  { assetKey: 'rubbleClusterSmall', label: 'Rubble Cluster Small', width: 132, height: 86, alpha: 0.84 },
  { assetKey: 'softSandDrift', label: 'Soft Sand Drift', width: 214, height: 72, alpha: 0.62, mode: 'stretch' },
  { assetKey: 'buriedCarvedHead', label: 'Buried Carved Head', width: 128, height: 118, alpha: 0.88 },
  { assetKey: 'damagedWallFragment', label: 'Damaged Wall Fragment', width: 162, height: 112, alpha: 0.84 },
  { assetKey: 'dryShrub', label: 'Dry Shrub', width: 92, height: 86, alpha: 0.74 },
  { assetKey: 'deadPalmRemnant', label: 'Dead Palm Remnant', width: 156, height: 120, alpha: 0.74 },
  { assetKey: 'edgePebbleScatter', label: 'Edge Pebble Scatter', width: 182, height: 72, alpha: 0.72, mode: 'stretch' },
  { assetKey: 'egyptBaseSandDrift', label: 'Base Sand Drift', width: 220, height: 70, alpha: 0.58, mode: 'stretch' },
  { assetKey: 'egyptRubbleContactShadow', label: 'Rubble Contact Edge', width: 184, height: 76, alpha: 0.58, mode: 'stretch' },
  { assetKey: 'egyptBuriedStoneEdge', label: 'Buried Stone Edge', width: 166, height: 112, alpha: 0.72 },
  { assetKey: 'egyptStructureBaseRubble', label: 'Structure Base Rubble', width: 174, height: 108, alpha: 0.74 },
];

const JOURNEY_SHARD_PROP_PALETTE_ITEMS = [
  { collectibleSpriteKey: 'linenMemoryFragment', label: 'Linen Memory Fragment' },
  { collectibleSpriteKey: 'resinRiteFragment', label: 'Resin Rite Fragment' },
  { collectibleSpriteKey: 'canopicNameFragment', label: 'Canopic Name Fragment' },
  { collectibleSpriteKey: 'scarabWingFragment', label: 'Scarab Wing Fragment' },
  { collectibleSpriteKey: 'muralFaienceFragment', label: 'Mural Faience Fragment' },
  { collectibleSpriteKey: 'muralPlasterFragment', label: 'Mural Plaster Fragment' },
  { collectibleSpriteKey: 'inkNameFragment', label: 'Ink Name Fragment' },
  { collectibleSpriteKey: 'witnessLineFragment', label: 'Witness Line Fragment' },
  { collectibleSpriteKey: 'royalRecordFragment', label: 'Royal Record Fragment' },
].filter(item => RELIC_SHARD_FRAGMENT_SPRITE_KEYS.includes(item.collectibleSpriteKey));

const toJourneyPropWords = (value = '') => String(value)
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/[-_]+/g, ' ')
  .trim();

const toJourneyPropTitle = (value = '') => {
  const words = toJourneyPropWords(value);
  if (!words) return 'Prop';
  return words
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const toJourneyPropIdSegment = (value = '') => toJourneyPropWords(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'prop';

const getJourneyPropTemplateKey = (prop = {}) => (
  prop.imageAssetKey
    ? `${prop.type || 'image-prop'}:${prop.imageAssetKey}`
    : prop.type === 'atmosphere-prop' && prop.atmosphereAssetKey
    ? `${prop.type}:${prop.atmosphereAssetKey}`
    : prop.type || 'prop'
);

const getJourneyPropTemplateLabel = (prop = {}) => (
  prop.imageAssetKey
    ? toJourneyPropTitle(prop.imageAssetKey)
    : prop.type === 'atmosphere-prop' && prop.atmosphereAssetKey
    ? toJourneyPropTitle(prop.atmosphereAssetKey)
    : toJourneyPropTitle(prop.type || prop.label || prop.id)
);

const copyJourneyPropTemplateFields = (prop = {}) => {
  const template = {};
  PROP_TEMPLATE_FIELDS.forEach((field) => {
    if (prop[field] !== undefined) template[field] = prop[field];
  });
  return template;
};

const getJourneyPropRegistryTemplate = (entry = {}) => {
  if (!entry.id) return null;
  const isStandaloneImage = Boolean(entry.imageAssetKey || entry.defaultImageAssetKey);
  const template = {
    type: entry.defaultType || (isStandaloneImage ? 'image-prop' : 'atmosphere-prop'),
  };
  if (isStandaloneImage) {
    template.imageAssetKey = entry.imageAssetKey || entry.defaultImageAssetKey;
    if (entry.assetPath) template.assetPath = entry.assetPath;
  } else {
    template.atmosphereAssetKey = entry.id;
  }
  if (Number.isFinite(entry.defaultWidth)) template.width = entry.defaultWidth;
  if (Number.isFinite(entry.defaultHeight)) template.height = entry.defaultHeight;
  if (Number.isFinite(entry.defaultScale)) template.scale = entry.defaultScale;
  if (entry.defaultLayer) template.layer = entry.defaultLayer;
  if (entry.defaultDepth) template.depth = entry.defaultDepth;
  if (Number.isFinite(entry.defaultZIndex)) template.zIndex = entry.defaultZIndex;
  if (typeof entry.collidable === 'boolean') template.collidable = entry.collidable;
  if (entry.defaultPlacementPreset) template.placementPreset = entry.defaultPlacementPreset;
  if (entry.defaultSceneBlend) template.sceneBlend = entry.defaultSceneBlend;
  if (entry.defaultTint) template.tint = entry.defaultTint;
  if (entry.defaultColorGradeFilter) template.colorGradeFilter = entry.defaultColorGradeFilter;
  if (Number.isFinite(entry.defaultAlpha)) template.alpha = entry.defaultAlpha;
  if (Number.isFinite(entry.defaultShadowWidth)) template.shadowWidth = entry.defaultShadowWidth;
  if (Number.isFinite(entry.defaultShadowHeight)) template.shadowHeight = entry.defaultShadowHeight;
  if (Number.isFinite(entry.defaultShadowOpacity)) template.shadowOpacity = entry.defaultShadowOpacity;
  if (Number.isFinite(entry.defaultSandOverlapHeight)) template.sandOverlapHeight = entry.defaultSandOverlapHeight;
  if (Number.isFinite(entry.defaultSandMoundWidth)) template.sandMoundWidth = entry.defaultSandMoundWidth;
  if (Number.isFinite(entry.defaultSandMoundHeight)) template.sandMoundHeight = entry.defaultSandMoundHeight;
  if (Number.isFinite(entry.defaultGroundPebbles)) template.groundPebbles = entry.defaultGroundPebbles;
  if (Number.isFinite(entry.defaultAssetContactYRatio)) template.assetContactYRatio = entry.defaultAssetContactYRatio;
  if (Number.isFinite(entry.defaultWidthScale)) template.widthScale = entry.defaultWidthScale;
  if (typeof entry.defaultMirrorX === 'boolean') template.mirrorX = entry.defaultMirrorX;
  if (Number.isFinite(entry.defaultBrightness)) template.brightness = entry.defaultBrightness;
  return template;
};

const makeUniqueJourneyPropId = (baseId, existingIds = []) => {
  const used = new Set(existingIds.filter(Boolean));
  if (!used.has(baseId)) return baseId;
  const numbered = String(baseId).match(/^(.*)-(\d+)$/);
  if (numbered) {
    const prefix = numbered[1];
    let index = Number(numbered[2]) + 1;
    while (used.has(`${prefix}-${index}`)) index += 1;
    return `${prefix}-${index}`;
  }
  let index = 1;
  while (used.has(`${baseId}-${index}`)) index += 1;
  return `${baseId}-${index}`;
};

export const createJourneyPlatformPalette = () => [
  {
    key: 'platform:solid',
    label: 'Platform',
    type: 'platform',
    template: {
      width: 192,
      height: 18,
      label: 'editable platform',
      invisible: true,
      layer: 'platform',
    },
  },
  {
    key: 'platform:floor',
    label: 'Floor',
    type: 'floor',
    template: {
      width: 320,
      height: 60,
      label: 'editable floor',
      invisible: true,
      layer: 'floor',
    },
  },
  {
    key: 'platform:blocker',
    label: 'Blocker',
    type: 'blocker',
    template: {
      width: 36,
      height: 96,
      label: 'editable movement blocker',
      invisible: true,
      layer: 'blocker',
      collision: 'blocker',
    },
  },
  {
    key: 'platform:blocker-left-slant',
    label: 'Left Slant Blocker',
    type: 'blocker',
    template: {
      width: 84,
      height: 96,
      label: 'editable left slant movement blocker',
      invisible: true,
      layer: 'blocker',
      collision: 'blocker',
      blockerShape: 'left-slant',
    },
  },
  {
    key: 'platform:blocker-right-slant',
    label: 'Right Slant Blocker',
    type: 'blocker',
    template: {
      width: 84,
      height: 96,
      label: 'editable right slant movement blocker',
      invisible: true,
      layer: 'blocker',
      collision: 'blocker',
      blockerShape: 'right-slant',
    },
  },
];

export const createJourneyPlatformFromPaletteItem = ({
  paletteItem = {},
  roomId,
  x,
  y,
  existingIds = [],
} = {}) => {
  const template = { ...(paletteItem.template || paletteItem) };
  const type = paletteItem.type || template.type || 'platform';
  const roomKey = roomId || 'unknown-room';
  const idBase = `${toJourneyPropIdSegment(roomKey)}-${toJourneyPropIdSegment(type)}`;
  const next = {
    id: makeUniqueJourneyPropId(`${idBase}-1`, existingIds),
    sectionId: roomKey,
    ...template,
    x: Math.round(Number(x) || 0),
    y: Math.round(Number(y) || 0),
    label: template.label || `editable ${type}`,
    invisible: template.invisible !== false,
  };
  if (roomKey && roomKey !== 'exterior' && roomKey.includes('chamber')) {
    delete next.sectionId;
    next.sceneId = roomKey;
  }
  return next;
};

export const createJourneyPropPalette = (props = [], registryEntries = []) => {
  const entries = new Map();
  props.forEach((prop) => {
    const key = getJourneyPropTemplateKey(prop);
    if (!key || entries.has(key)) return;
    const template = copyJourneyPropTemplateFields(prop);
    entries.set(key, {
      key,
      label: getJourneyPropTemplateLabel(prop),
      type: template.type || prop.type || 'prop',
      ...(template.atmosphereAssetKey ? { atmosphereAssetKey: template.atmosphereAssetKey } : {}),
      template,
    });
  });
  registryEntries.forEach((entry) => {
    const template = getJourneyPropRegistryTemplate(entry);
    if (!template) return;
    const key = getJourneyPropTemplateKey(template);
    if (!key || entries.has(key)) return;
    entries.set(key, {
      key,
      label: entry.displayName || getJourneyPropTemplateLabel(template),
      type: template.type,
      ...(template.atmosphereAssetKey ? { atmosphereAssetKey: template.atmosphereAssetKey } : {}),
      ...(template.imageAssetKey ? { imageAssetKey: template.imageAssetKey } : {}),
      ...(entry.category ? { category: entry.category } : {}),
      ...(entry.assetPath ? { assetPath: entry.assetPath } : {}),
      template,
    });
  });
  return [...entries.values()];
};

export const createJourneyGroundDetailsPalette = () => JOURNEY_GROUND_DETAIL_PALETTE_ITEMS.map((item) => ({
  key: `ground-detail:${item.assetKey}`,
  label: item.label,
  type: 'ground-contact-detail-prop',
  category: 'Ground Details',
  assetKey: item.assetKey,
  template: {
    type: 'ground-contact-detail-prop',
    groundDetailAssetKey: item.assetKey,
    width: item.width,
    height: item.height,
    depth: 'route-edge',
    layer: 'route-edge',
    shadowOpacity: 0,
    sandOverlapHeight: 0,
    groundPebbles: 0,
    brightness: 1,
    colorGradeFilter: '',
    groundContactLayer: [
      {
        assetKey: item.assetKey,
        layer: 'overlay',
        xRatio: 0.5,
        widthRatio: 1,
        height: item.height,
        yOffset: -item.height,
        alpha: item.alpha,
        mode: 'stretch',
        alignY: 'bottom',
      },
    ],
  },
}));

export const createJourneyForegroundDetailsPalette = () => JOURNEY_FOREGROUND_DETAIL_PALETTE_ITEMS.map((item) => ({
  key: `foreground-detail:${item.assetKey}`,
  label: item.label,
  type: 'foreground-depth-detail-prop',
  category: 'Foreground Details',
  assetKey: item.assetKey,
  template: {
    type: 'foreground-depth-detail-prop',
    foregroundDetailAssetKey: item.assetKey,
    width: item.width,
    height: item.height,
    depth: 'route-edge',
    layer: 'route-edge',
    shadowOpacity: 0,
    sandOverlapHeight: 0,
    groundPebbles: 0,
    brightness: 1,
    colorGradeFilter: '',
    groundContactLayer: [
      {
        assetKey: item.assetKey,
        layer: 'overlay',
        xRatio: 0.5,
        widthRatio: 1,
        height: item.height,
        yOffset: -item.height,
        alpha: item.alpha,
        mode: item.mode || 'contain',
        alignY: 'bottom',
      },
    ],
  },
}));

export const createJourneyShardPropsPalette = () => JOURNEY_SHARD_PROP_PALETTE_ITEMS.map((item) => ({
  key: `shard-prop:${item.collectibleSpriteKey}`,
  label: item.label,
  type: 'collectible-shard-prop',
  category: 'Shards',
  collectibleSpriteKey: item.collectibleSpriteKey,
  template: {
    type: 'collectible-shard-prop',
    collectibleSpriteKey: item.collectibleSpriteKey,
    width: 42,
    height: 42,
    depth: 'foreground',
    layer: 'foreground',
    alpha: 1,
    brightness: 1,
    colorGradeFilter: '',
    shadowOpacity: 0.18,
  },
}));

export const createJourneyPropFromPaletteItem = ({
  paletteItem = {},
  roomId,
  x,
  y,
  existingIds = [],
} = {}) => {
  const template = { ...(paletteItem.template || paletteItem) };
  const type = template.type || paletteItem.type || 'prop';
  const assetSegment = template.collectibleSpriteKey || template.foregroundDetailAssetKey || template.groundDetailAssetKey || template.imageAssetKey || template.atmosphereAssetKey || type;
  const idBase = `${toJourneyPropIdSegment(roomId || 'room')}-${toJourneyPropIdSegment(assetSegment)}`;
  const id = makeUniqueJourneyPropId(`${idBase}-1`, existingIds);
  const roomKey = roomId || 'unknown-room';
  const next = {
    id,
    sectionId: roomKey,
    ...template,
    type,
    x: Math.round(Number(x) || 0),
    y: Math.round(Number(y) || 0),
    label: (paletteItem.label || getJourneyPropTemplateLabel({ ...template, type })).toLowerCase(),
  };
  if (roomKey && roomKey !== 'exterior' && roomKey.includes('chamber')) {
    delete next.sectionId;
    next.sceneId = roomKey;
  }
  return next;
};

export const duplicateJourneyPropForEditor = ({
  prop = {},
  existingIds = [],
  offsetX = 32,
  offsetY = -32,
} = {}) => {
  const baseId = `${prop.id || 'prop'}-copy`;
  return {
    ...prop,
    id: makeUniqueJourneyPropId(`${baseId}-1`, existingIds),
    x: Math.round((Number(prop.x) || 0) + offsetX),
    y: Math.round((Number(prop.y) || 0) + offsetY),
  };
};

const cloneJourneyPlacementExportItem = (item = {}) => ({
  ...item,
  ...(Array.isArray(item.groundContactLayer)
    ? { groundContactLayer: item.groundContactLayer.map(entry => ({ ...entry })) }
    : {}),
});

export const createJourneyPropPlacementExport = ({
  source = STORY_PROP_EXPORT_SOURCE,
  platformSource = PLATFORM_EXPORT_SOURCE,
  hazardSource = HAZARD_EXPORT_SOURCE,
  routeGateSource = ROUTE_GATE_EXPORT_SOURCE,
  routeGateDoorwaySource = ROUTE_GATE_DOORWAY_EXPORT_SOURCE,
  checkpointSource = CHECKPOINT_EXPORT_SOURCE,
  enemySource = ENEMY_EXPORT_SOURCE,
  miniBossSource = MINI_BOSS_EXPORT_SOURCE,
  roomId,
  props = [],
  deletedPropIds = [],
  platforms = [],
  deletedPlatformIds = [],
  hazards = [],
  deletedHazardIds = [],
  routeGates = [],
  routeGateDoorways = [],
  checkpoints = [],
  enemies = [],
  miniBosses = [],
} = {}) => JSON.stringify({
  source,
  platformSource,
  hazardSource,
  routeGateSource,
  routeGateDoorwaySource,
  checkpointSource,
  enemySource,
  miniBossSource,
  room: roomId || 'unknown-room',
  props: props.map(cloneJourneyPlacementExportItem),
  deletedPropIds: [...deletedPropIds],
  platforms: platforms.map(platform => ({ ...platform })),
  deletedPlatformIds: [...deletedPlatformIds],
  hazards: hazards.map(hazard => ({ ...hazard })),
  deletedHazardIds: [...deletedHazardIds],
  routeGates: routeGates.map(gate => ({ ...gate })),
  routeGateDoorways: routeGateDoorways.map(doorway => ({ ...doorway })),
  checkpoints: checkpoints.map(checkpoint => ({ ...checkpoint })),
  enemies: enemies.map(enemy => ({ ...enemy })),
  miniBosses: miniBosses.map(boss => ({ ...boss })),
}, null, 2);

const toJourneyEditorIdList = (value) => {
  if (!value) return [];
  if (value instanceof Set) return [...value].filter(Boolean);
  if (Array.isArray(value)) return value.filter(Boolean);
  return [];
};

const getJourneyEditorChangedObjectIds = (edits = {}) => Object.entries(edits)
  .filter(([, edit]) => edit && Object.keys(edit).length > 0)
  .map(([id]) => id)
  .filter(Boolean);

const getJourneyEditorCreatedIds = (items = []) => (Array.isArray(items) ? items : [])
  .map(item => item?.id)
  .filter(Boolean);

const addJourneyEditorChangeEntries = (changes, label, action, ids = []) => {
  ids.forEach((id) => {
    changes.push({
      key: `${label.toLowerCase()}:${action}:${id}`,
      label: `${label} ${id} ${action}`,
    });
  });
};

export const createJourneyPlacementChangeSummary = (editor = {}, { limit = 8 } = {}) => {
  const changes = [];

  addJourneyEditorChangeEntries(changes, 'Prop', 'edited', getJourneyEditorChangedObjectIds(editor.edits));
  addJourneyEditorChangeEntries(changes, 'Prop', 'added', getJourneyEditorCreatedIds(editor.createdProps));
  addJourneyEditorChangeEntries(changes, 'Prop', 'deleted', toJourneyEditorIdList(editor.deletedIds));
  addJourneyEditorChangeEntries(changes, 'Platform', 'edited', getJourneyEditorChangedObjectIds(editor.platformEdits));
  addJourneyEditorChangeEntries(changes, 'Platform', 'added', getJourneyEditorCreatedIds(editor.createdPlatforms));
  addJourneyEditorChangeEntries(changes, 'Platform', 'deleted', toJourneyEditorIdList(editor.deletedPlatformIds));
  addJourneyEditorChangeEntries(changes, 'Trap', 'edited', getJourneyEditorChangedObjectIds(editor.hazardEdits));
  addJourneyEditorChangeEntries(changes, 'Trap', 'added', getJourneyEditorCreatedIds(editor.createdHazards));
  addJourneyEditorChangeEntries(changes, 'Trap', 'deleted', toJourneyEditorIdList(editor.deletedHazardIds));
  addJourneyEditorChangeEntries(changes, 'Route gate', 'edited', getJourneyEditorChangedObjectIds(editor.routeGateEdits));
  addJourneyEditorChangeEntries(changes, 'Doorway arch', 'edited', getJourneyEditorChangedObjectIds(editor.routeGateDoorwayEdits));
  addJourneyEditorChangeEntries(changes, 'Checkpoint', 'edited', getJourneyEditorChangedObjectIds(editor.checkpointEdits));
  addJourneyEditorChangeEntries(changes, 'Enemy', 'edited', getJourneyEditorChangedObjectIds(editor.scorpionNestEdits));
  addJourneyEditorChangeEntries(changes, 'Lair', 'edited', getJourneyEditorChangedObjectIds(editor.miniBossEdits));

  const totalCount = changes.length;
  const visibleLimit = Math.max(0, Number.isFinite(limit) ? Math.round(limit) : 8);
  const entries = changes.slice(0, visibleLimit);
  return {
    totalCount,
    hiddenCount: Math.max(0, totalCount - entries.length),
    entries,
    hasChanges: totalCount > 0,
  };
};

const PLACEMENT_OVERRIDES_FILE = 'src/components/expedition-journey/journeyPlacementOverrides.generated.js';

const formatJourneyPlacementAiValue = (value) => {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
  }
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return String(value);
  if (value === null || value === undefined) return 'null';
  return JSON.stringify(value);
};

const formatJourneyPlacementFieldList = (item = {}, { skipKeys = ['id'] } = {}) => Object.entries(item)
  .filter(([key, value]) => !skipKeys.includes(key) && value !== undefined)
  .map(([key, value]) => `${key} = ${formatJourneyPlacementAiValue(value)}`)
  .join(', ');

const addJourneyPlacementAiEditLines = (lines, kind, edits = {}) => {
  Object.entries(edits || {}).forEach(([id, edit]) => {
    const fields = formatJourneyPlacementFieldList(edit, { skipKeys: [] });
    if (!fields) return;
    lines.push(`- ${kind} "${id}": set ${fields}`);
  });
};

const addJourneyPlacementAiAddLines = (lines, kind, createdItems = []) => {
  (Array.isArray(createdItems) ? createdItems : []).forEach((item) => {
    if (!item?.id) return;
    const fields = formatJourneyPlacementFieldList(item);
    lines.push(`- ADD ${kind} "${item.id}"${fields ? ` with ${fields}` : ''}`);
  });
};

const addJourneyPlacementAiDeleteLines = (lines, kind, ids = []) => {
  toJourneyEditorIdList(ids).forEach((id) => {
    lines.push(`- DELETE ${kind} "${id}"`);
  });
};

// Produces a plain-English instruction block you can paste straight into an AI
// chat. It describes only what changed in the editor, keyed by id, so the AI can
// edit the single generated overrides file without being handed any source code.
export const createJourneyPlacementAiInstructions = (editor = {}, { roomId } = {}) => {
  const lines = [];

  addJourneyPlacementAiEditLines(lines, 'prop', editor.edits);
  addJourneyPlacementAiAddLines(lines, 'prop', editor.createdProps);
  addJourneyPlacementAiDeleteLines(lines, 'prop', editor.deletedIds);
  addJourneyPlacementAiEditLines(lines, 'platform', editor.platformEdits);
  addJourneyPlacementAiAddLines(lines, 'platform', editor.createdPlatforms);
  addJourneyPlacementAiDeleteLines(lines, 'platform', editor.deletedPlatformIds);
  addJourneyPlacementAiEditLines(lines, 'trap', editor.hazardEdits);
  addJourneyPlacementAiAddLines(lines, 'trap', editor.createdHazards);
  addJourneyPlacementAiDeleteLines(lines, 'trap', editor.deletedHazardIds);
  addJourneyPlacementAiEditLines(lines, 'route gate', editor.routeGateEdits);
  addJourneyPlacementAiEditLines(lines, 'doorway arch', editor.routeGateDoorwayEdits);
  addJourneyPlacementAiEditLines(lines, 'checkpoint', editor.checkpointEdits);
  addJourneyPlacementAiEditLines(lines, 'enemy', editor.scorpionNestEdits);
  addJourneyPlacementAiEditLines(lines, 'lair', editor.miniBossEdits);

  if (lines.length === 0) {
    return 'No changes yet — move, add, or delete something in the editor first, then copy this text.';
  }

  const header = [
    `Edit only this file: ${PLACEMENT_OVERRIDES_FILE}`,
    roomId ? `Room: ${roomId}` : null,
    'Match each item by its "id". Change only the fields listed and leave every other field untouched.',
    'If an item id is not already in the file, add it to the matching array (props / platforms / hazards / etc).',
    'Do not edit any other file.',
    '',
    'Changes:',
  ].filter(line => line !== null).join('\n');

  return `${header}\n${lines.join('\n')}`;
};

// Keys of the prop-editor ref that hold real placement work (everything else is
// transient UI state like the current selection or whether the palette is open).
const JOURNEY_PROP_EDITOR_OBJECT_KEYS = [
  'edits', 'platformEdits', 'hazardEdits', 'routeGateEdits',
  'routeGateDoorwayEdits', 'checkpointEdits', 'scorpionNestEdits', 'miniBossEdits',
];
const JOURNEY_PROP_EDITOR_ARRAY_KEYS = ['createdProps', 'createdPlatforms', 'createdHazards'];
const JOURNEY_PROP_EDITOR_SET_KEYS = ['deletedIds', 'deletedPlatformIds', 'deletedHazardIds', 'lockedItems'];

// Convert the editor's live edit layer into a plain JSON-safe object so it can be
// written to localStorage. Sets are flattened to arrays.
export const serializeJourneyPropEditorState = (editor = {}) => {
  const result = { version: 1 };
  JOURNEY_PROP_EDITOR_OBJECT_KEYS.forEach((key) => {
    result[key] = { ...(editor[key] || {}) };
  });
  JOURNEY_PROP_EDITOR_ARRAY_KEYS.forEach((key) => {
    result[key] = Array.isArray(editor[key]) ? editor[key].map(item => ({ ...item })) : [];
  });
  JOURNEY_PROP_EDITOR_SET_KEYS.forEach((key) => {
    if (editor[key] instanceof Set) result[key] = [...editor[key]];
    else if (Array.isArray(editor[key])) result[key] = [...editor[key]];
    else result[key] = [];
  });
  return result;
};

// Rebuild the editable slice of editor state from a previously serialized object.
// Returns only the keys present in the saved payload so it can be Object.assign'd
// onto the live ref without clobbering transient UI fields.
export const restoreJourneyPropEditorState = (saved = {}) => {
  const result = {};
  if (!saved || typeof saved !== 'object') return result;
  JOURNEY_PROP_EDITOR_OBJECT_KEYS.forEach((key) => {
    if (saved[key] && typeof saved[key] === 'object') result[key] = { ...saved[key] };
  });
  JOURNEY_PROP_EDITOR_ARRAY_KEYS.forEach((key) => {
    if (Array.isArray(saved[key])) result[key] = saved[key].map(item => ({ ...item }));
  });
  JOURNEY_PROP_EDITOR_SET_KEYS.forEach((key) => {
    if (Array.isArray(saved[key])) result[key] = new Set(saved[key]);
  });
  return result;
};

// One-click colour looks for the prop editor. Each writes a clean colorGradeFilter
// string (no brightness() — brightness stays a separate control) so the slider
// parser can round-trip them.
export const JOURNEY_PROP_TINT_PRESETS = Object.freeze([
  { key: 'warm', label: 'Warm', filter: 'saturate(96%) sepia(18%) contrast(98%)' },
  { key: 'stone', label: 'Stone', filter: 'saturate(78%) sepia(8%) contrast(96%)' },
  { key: 'cool', label: 'Cool', filter: 'saturate(62%) contrast(96%) hue-rotate(8deg)' },
  { key: 'dust', label: 'Dust', filter: 'saturate(64%) sepia(24%) contrast(92%)' },
  { key: 'buried', label: 'Buried', filter: 'saturate(72%) sepia(30%) contrast(94%)' },
]);

// One-click "blend into scene" recipe for the Egypt golden-hour desert: desaturate
// (kills painted blue/gold pop), warm sepia, lower contrast (matches atmospheric haze),
// dim brightness, and a soft grounding shadow so the prop reads grounded, not pasted.
// Applied as a unit by the editor's "Blend into scene" button.
export const JOURNEY_PROP_SCENE_BLEND_RECIPE = Object.freeze({
  colorGradeFilter: 'saturate(70%) sepia(24%) contrast(92%)',
  brightness: 0.74,
  shadowOpacity: 0.22,
});

// Identity values for each colour channel (the look when no grade is applied).
export const JOURNEY_COLOR_GRADE_DEFAULTS = Object.freeze({ saturate: 100, sepia: 0, contrast: 100, hue: 0 });

// Pull the saturate/sepia/contrast/hue values out of a CSS filter string so the
// editor sliders can show the prop's current look. brightness() is intentionally
// ignored — it is driven by the separate Brightness control.
export const parseColorGradeFilter = (value = '') => {
  const str = typeof value === 'string' ? value : '';
  const readNumber = (regex, fallback) => {
    const match = str.match(regex);
    return match ? Number(match[1]) : fallback;
  };
  return {
    saturate: readNumber(/saturate\((-?\d+(?:\.\d+)?)%\)/, JOURNEY_COLOR_GRADE_DEFAULTS.saturate),
    sepia: readNumber(/sepia\((-?\d+(?:\.\d+)?)%\)/, JOURNEY_COLOR_GRADE_DEFAULTS.sepia),
    contrast: readNumber(/contrast\((-?\d+(?:\.\d+)?)%\)/, JOURNEY_COLOR_GRADE_DEFAULTS.contrast),
    hue: readNumber(/hue-rotate\((-?\d+(?:\.\d+)?)deg\)/, JOURNEY_COLOR_GRADE_DEFAULTS.hue),
  };
};

// Build a tidy CSS filter string from slider values, omitting any channel that is
// at its identity so unedited props keep an empty grade (and fall back to tint).
export const composeColorGradeFilter = ({ saturate = 100, sepia = 0, contrast = 100, hue = 0 } = {}) => {
  const parts = [];
  if (Math.round(saturate) !== JOURNEY_COLOR_GRADE_DEFAULTS.saturate) parts.push(`saturate(${Math.round(saturate)}%)`);
  if (Math.round(sepia) !== JOURNEY_COLOR_GRADE_DEFAULTS.sepia) parts.push(`sepia(${Math.round(sepia)}%)`);
  if (Math.round(contrast) !== JOURNEY_COLOR_GRADE_DEFAULTS.contrast) parts.push(`contrast(${Math.round(contrast)}%)`);
  if (Math.round(hue) !== JOURNEY_COLOR_GRADE_DEFAULTS.hue) parts.push(`hue-rotate(${Math.round(hue)}deg)`);
  return parts.join(' ');
};

export const applyJourneyPropPlacementExportToProps = ({
  existingProps = [],
  exportData = {},
} = {}) => {
  const deletedIds = new Set(Array.isArray(exportData.deletedPropIds) ? exportData.deletedPropIds : []);
  const exportedProps = Array.isArray(exportData.props) ? exportData.props : [];
  const exportedById = new Map(exportedProps
    .filter(prop => prop?.id)
    .map(prop => [prop.id, { ...prop }]));
  const seenIds = new Set();
  const merged = [];

  existingProps.forEach((prop) => {
    if (!prop?.id || deletedIds.has(prop.id)) return;
    if (exportedById.has(prop.id)) {
      merged.push({ ...exportedById.get(prop.id) });
      seenIds.add(prop.id);
      return;
    }
    merged.push({ ...prop });
    seenIds.add(prop.id);
  });

  exportedProps.forEach((prop) => {
    if (!prop?.id || deletedIds.has(prop.id) || seenIds.has(prop.id)) return;
    merged.push({ ...prop });
    seenIds.add(prop.id);
  });

  return merged;
};

export const applyJourneyPlatformPlacementExportToPlatforms = ({
  existingPlatforms = [],
  exportData = {},
} = {}) => {
  const deletedIds = new Set(Array.isArray(exportData.deletedPlatformIds) ? exportData.deletedPlatformIds : []);
  const exportedPlatforms = Array.isArray(exportData.platforms) ? exportData.platforms : [];
  const exportedById = new Map(exportedPlatforms
    .filter(platform => platform?.id)
    .map(platform => [platform.id, { ...platform }]));
  const seenIds = new Set();
  const merged = [];

  existingPlatforms.forEach((platform) => {
    if (!platform?.id || deletedIds.has(platform.id)) return;
    if (exportedById.has(platform.id)) {
      merged.push({ ...exportedById.get(platform.id) });
      seenIds.add(platform.id);
      return;
    }
    merged.push({ ...platform });
    seenIds.add(platform.id);
  });

  exportedPlatforms.forEach((platform) => {
    if (!platform?.id || deletedIds.has(platform.id) || seenIds.has(platform.id)) return;
    merged.push({ ...platform });
    seenIds.add(platform.id);
  });

  return merged;
};

export const applyJourneyHazardPlacementExportToHazards = ({
  existingHazards = [],
  exportData = {},
} = {}) => {
  const deletedIds = new Set(Array.isArray(exportData.deletedHazardIds) ? exportData.deletedHazardIds : []);
  const exportedHazards = Array.isArray(exportData.hazards) ? exportData.hazards : [];
  const exportedById = new Map(exportedHazards
    .filter(hazard => hazard?.id)
    .map(hazard => [hazard.id, { ...hazard }]));
  const seenIds = new Set();
  const merged = [];

  existingHazards.forEach((hazard) => {
    if (!hazard?.id || deletedIds.has(hazard.id)) return;
    if (exportedById.has(hazard.id)) {
      merged.push({ ...exportedById.get(hazard.id) });
      seenIds.add(hazard.id);
      return;
    }
    merged.push({ ...hazard });
    seenIds.add(hazard.id);
  });

  exportedHazards.forEach((hazard) => {
    if (!hazard?.id || deletedIds.has(hazard.id) || seenIds.has(hazard.id)) return;
    merged.push({ ...hazard });
    seenIds.add(hazard.id);
  });

  return merged;
};

export const FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_VERSION = 'forgotten-mural-relic-slide-puzzle-2026-06-01-harder';
export const FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_START_TILES = Object.freeze([2, null, 6, 1, 5, 0, 3, 7, 4]);
export const FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_SOLVED_TILES = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, null]);
export const FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_TILE_LABELS = Object.freeze([
  'Left wing',
  'Sun disk',
  'Right wing',
  'Upper body',
  'Scarab heart',
  'Lower body',
  'Left talon',
  'Right talon',
]);
export const createForgottenMuralRelicSlidePuzzleTiles = () => [...FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_START_TILES];
export const isForgottenMuralRelicSlidePuzzleSolved = (tiles = []) => (
  tiles.length === FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_SOLVED_TILES.length
  && tiles.every((tile, index) => tile === FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_SOLVED_TILES[index])
);
export const getForgottenMuralRelicSlideMove = (tiles = [], tileIndex) => {
  const emptyIndex = tiles.indexOf(null);
  if (emptyIndex < 0 || tileIndex < 0) return null;
  const emptyRow = Math.floor(emptyIndex / 3);
  const emptyCol = emptyIndex % 3;
  const tileRow = Math.floor(tileIndex / 3);
  const tileCol = tileIndex % 3;
  const adjacent = Math.abs(emptyRow - tileRow) + Math.abs(emptyCol - tileCol) === 1;
  if (!adjacent) return null;
  const nextTiles = [...tiles];
  nextTiles[emptyIndex] = nextTiles[tileIndex];
  nextTiles[tileIndex] = null;
  return nextTiles;
};

export const rectsOverlap = (a, b) => (
  a.x < b.x + b.width
  && a.x + a.width > b.x
  && a.y < b.y + b.height
  && a.y + a.height > b.y
);

export const JOURNEY_HITBOX_TUNING = {
  // Player body trims the drawn sprite edges so unclear shoulder/backpack touches do not punish players.
  playerBody: { insetX: 4, topInset: 3, bottomInset: 1 },
  // Feet are a shallow strip used only for ground, platform, and stomp checks.
  playerFeet: { insetX: 3, height: 9, yPad: 2 },
  // Platform tops get a small ledge margin so visible landings do not slip through.
  platformLanding: { xPad: 10, topPad: 12, bottomPad: 8, previousFootTolerance: 14 },
  // Enemy side damage is smaller than the visible sprite, especially for low scarab bodies.
  enemyDamage: { insetXRatio: 0.2, topInsetRatio: 0.26, bottomInsetRatio: 0.22 },
  // Stomps use the enemy's top band and a small above-head buffer for reliable jump landings.
  enemyStomp: { insetXRatio: 0.08, yPad: 10, heightRatio: 0.36, previousFootTolerance: 12 },
  // Collectibles are intentionally generous because clear visual contact should be enough.
  collectible: { padX: 10, padY: 10 },
  // Hazards stay slightly inset so warning art can be touched at the edges without penalty.
  hazard: { insetX: 8, topInset: 5, bottomInset: 4 },
};

const getEnemyHitboxFamily = (enemy = {}) => {
  const name = (enemy.name || '').toLowerCase();
  // Rome types — checked first so they don't fall through to generic matches
  if (enemy.type === 'legion-shade'       || name.includes('legion shade') || name.includes('praetorian shade') || name.includes('bath shade') || name.includes('forum shade') || name.includes('ruins guard') || name.includes('apse guard')) return 'humanoid';
  if (enemy.type === 'gladiator-revenant' || name.includes('gladiator revenant') || name.includes('arena revenant') || name.includes('vault gladiator') || name.includes('nave gladiator') || name.includes("legate's champion")) return 'humanoid';
  if (enemy.type === 'forum-rat'          || name.includes('forum rat') || name.includes('marble rat') || name.includes('steam rat')) return 'scarab'; // small/low profile
  if (enemy.type === 'vestibule-wisp'     || name.includes('vestibule wisp') || name.includes('forum wisp') || name.includes('hypocaust wisp') || name.includes('drain wisp')) return 'sandWisp'; // aerial profile
  if (enemy.type === 'marble-golem'       || name.includes('marble golem') || name.includes('stone pillar golem') || name.includes('column golem') || name.includes('vault sentinel')) return 'guardian'; // heavy profile
  // Egypt / China types
  if (enemy.type === 'sand-wisp' || name.includes('sand wisp') || name.includes('flying scarab')) return 'sandWisp';
  if (enemy.type === 'scarab' || name.includes('scarab') || name.includes('beetle')) return 'scarab';
  if (enemy.type === 'scorpion' || name.includes('scorpion')) return 'scorpion';
  if (enemy.type === 'snake' || name.includes('snake') || name.includes('serpent')) return 'snake';
  if (enemy.type === 'mummy' || name.includes('mummy')) return 'mummy';
  if (enemy.type === 'guardian' || enemy.type === 'statue' || name.includes('guardian') || name.includes('statue')) return 'guardian';
  if (enemy.type === 'looter' || enemy.type === 'watchtower-sentry' || name.includes('looter') || name.includes('sentry')) return 'humanoid';
  return 'default';
};

export const ENEMY_HITBOX_PROFILES = {
  scarab: {
    damage: { widthScale: 1.42, heightScale: 0.92, minWidth: 42, minHeight: 22, footInset: 1 },
    stomp: { widthScale: 1.34, heightScale: 0.44, minWidth: 38, minHeight: 12, topPad: 8 },
    hurt: { widthScale: 1.38, heightScale: 0.96, minWidth: 40, minHeight: 24, footInset: 0 },
  },
  scorpion: {
    damage: { widthScale: 1.6, heightScale: 1.1, minWidth: 56, minHeight: 34, footInset: -2 },
    stomp: { disabled: true },
    hurt: { widthScale: 1.46, heightScale: 1.06, minWidth: 52, minHeight: 32, footInset: 0 },
  },
  snake: {
    damage: { widthScale: 1.48, heightScale: 0.82, minWidth: 48, minHeight: 20, footInset: 2 },
    stomp: { widthScale: 1.26, heightScale: 0.34, minWidth: 42, minHeight: 10, topPad: 7 },
    hurt: { widthScale: 1.48, heightScale: 0.84, minWidth: 48, minHeight: 22, footInset: 1 },
  },
  sandWisp: {
    damage: { widthScale: 1.86, heightScale: 1.34, minWidth: 62, minHeight: 40, centerYOffset: -0.08 },
    stomp: { widthScale: 1.42, heightScale: 0.5, minWidth: 48, minHeight: 16, centerYOffset: -0.18 },
    hurt: { widthScale: 1.78, heightScale: 1.26, minWidth: 58, minHeight: 38, centerYOffset: -0.08 },
  },
  mummy: {
    damage: { widthScale: 1.2, heightScale: 1.42, minWidth: 38, minHeight: 56, footInset: -2 },
    stomp: { widthScale: 1.02, heightScale: 0.28, minWidth: 32, minHeight: 13, topPad: 9 },
    hurt: { widthScale: 1.22, heightScale: 1.5, minWidth: 40, minHeight: 58, footInset: -2 },
  },
  guardian: {
    damage: { widthScale: 1.18, heightScale: 1.34, minWidth: 48, minHeight: 62, footInset: -2 },
    stomp: { widthScale: 0.95, heightScale: 0.24, minWidth: 38, minHeight: 13, topPad: 10 },
    hurt: { widthScale: 1.2, heightScale: 1.42, minWidth: 50, minHeight: 64, footInset: -2 },
  },
  humanoid: {
    damage: { widthScale: 1.12, heightScale: 1.22, minWidth: 34, minHeight: 48, footInset: 0 },
    stomp: { widthScale: 0.96, heightScale: 0.28, minWidth: 28, minHeight: 12, topPad: 8 },
    hurt: { widthScale: 1.14, heightScale: 1.28, minWidth: 34, minHeight: 50, footInset: 0 },
  },
};

const getEnemyHitboxProfile = (enemy) => ENEMY_HITBOX_PROFILES[getEnemyHitboxFamily(enemy)] || null;

const buildEnemyHitbox = (enemy, tuning = {}) => {
  const width = Math.max(tuning.minWidth || 1, enemy.width * (tuning.widthScale || 1));
  const height = Math.max(tuning.minHeight || 1, enemy.height * (tuning.heightScale || 1));
  const centerX = enemy.x + enemy.width / 2;

  if (Number.isFinite(tuning.centerYOffset)) {
    const centerY = enemy.y + enemy.height / 2 + enemy.height * tuning.centerYOffset;
    return {
      x: centerX - width / 2,
      y: centerY - height / 2,
      width,
      height,
    };
  }

  const footY = enemy.y + enemy.height - (tuning.footInset || 0);
  return {
    x: centerX - width / 2,
    y: footY - height,
    width,
    height,
  };
};

const insetRect = (rect, { x = 0, y = 0, bottom = y } = {}) => ({
  x: rect.x + x,
  y: rect.y + y,
  width: Math.max(1, rect.width - x * 2),
  height: Math.max(1, rect.height - y - bottom),
});

const expandRect = (rect, { x = 0, y = 0 } = {}) => ({
  x: rect.x - x,
  y: rect.y - y,
  width: rect.width + x * 2,
  height: rect.height + y * 2,
});

export const getPlayerBodyHitbox = (player) => insetRect(player, {
  x: JOURNEY_HITBOX_TUNING.playerBody.insetX,
  y: JOURNEY_HITBOX_TUNING.playerBody.topInset,
  bottom: JOURNEY_HITBOX_TUNING.playerBody.bottomInset,
});

export const getPlayerFeetHitbox = (player) => {
  const tuning = JOURNEY_HITBOX_TUNING.playerFeet;
  return {
    x: player.x + tuning.insetX,
    y: player.y + player.height - tuning.height - tuning.yPad,
    width: Math.max(1, player.width - tuning.insetX * 2),
    height: tuning.height + tuning.yPad,
  };
};

export const getPlatformLandingHitbox = (platform) => {
  const tuning = JOURNEY_HITBOX_TUNING.platformLanding;
  return {
    x: platform.x - tuning.xPad,
    y: platform.y - tuning.topPad,
    width: platform.width + tuning.xPad * 2,
    height: tuning.topPad + Math.min(platform.height, tuning.bottomPad),
  };
};

export const isLandingOnPlatform = (player, previousPlayer, platform) => {
  if (platform?.collision === 'blocker') return false;
  if (player.vy < 0) return false;
  const feet = getPlayerFeetHitbox(player);
  const previousFeetY = previousPlayer.y + previousPlayer.height;
  return rectsOverlap(feet, getPlatformLandingHitbox(platform))
    && previousFeetY <= platform.y + JOURNEY_HITBOX_TUNING.platformLanding.previousFootTolerance;
};

export const getEnemyDamageHitbox = (enemy) => {
  const profile = getEnemyHitboxProfile(enemy)?.damage;
  if (profile) return buildEnemyHitbox(enemy, profile);

  const tuning = JOURNEY_HITBOX_TUNING.enemyDamage;
  const insetX = Math.max(4, enemy.width * tuning.insetXRatio);
  const topInset = Math.max(3, enemy.height * tuning.topInsetRatio);
  const bottomInset = Math.max(3, enemy.height * tuning.bottomInsetRatio);
  return insetRect(enemy, { x: insetX, y: topInset, bottom: bottomInset });
};

export const getEnemyStompHitbox = (enemy) => {
  const profile = getEnemyHitboxProfile(enemy)?.stomp;
  if (profile?.disabled) {
    return {
      x: enemy.x + enemy.width / 2,
      y: enemy.y,
      width: 1,
      height: 1,
    };
  }
  if (profile) {
    const hitbox = buildEnemyHitbox(enemy, profile);
    if (Number.isFinite(profile.topPad)) {
      return {
        ...hitbox,
        y: enemy.y - profile.topPad,
      };
    }
    return hitbox;
  }

  const tuning = JOURNEY_HITBOX_TUNING.enemyStomp;
  const insetX = Math.max(3, enemy.width * tuning.insetXRatio);
  return {
    x: enemy.x + insetX,
    y: enemy.y - tuning.yPad,
    width: Math.max(1, enemy.width - insetX * 2),
    height: Math.max(8, enemy.height * tuning.heightRatio + tuning.yPad),
  };
};

export const getEnemyAttackHurtbox = (enemy, { boss = false } = {}) => {
  if (boss) {
    const insetX = Math.max(6, enemy.width * 0.1);
    const topInset = Math.max(5, enemy.height * 0.08);
    const bottomInset = Math.max(4, enemy.height * 0.08);
    return insetRect(enemy, { x: insetX, y: topInset, bottom: bottomInset });
  }

  const profile = getEnemyHitboxProfile(enemy)?.hurt;
  if (profile) return buildEnemyHitbox(enemy, profile);

  const insetX = Math.max(5, enemy.width * 0.16);
  const topInset = Math.max(4, enemy.height * 0.12);
  const bottomInset = Math.max(3, enemy.height * 0.1);
  return insetRect(enemy, { x: insetX, y: topInset, bottom: bottomInset });
};

const hashEnemyIdentity = (enemy) => {
  const source = `${enemy.id || enemy.name || enemy.type || 'enemy'}:${enemy.x || 0}:${enemy.y || 0}`;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash) + source.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
};

const ENEMY_TOUGHNESS_BONUS = {
  scarab: 2,
  scorpion: 2,
  'sand-wisp': 2,
  snake: 2,
  bat: 2,
  looter: 3,
  mummy: 3,
  guardian: 3,
  statue: 3,
  'river-crab': 2,
  'watchtower-sentry': 3,
  'clay-guardian': 3,
};

const tuneEnemyHealth = (enemy) => {
  // Returns effective runtime HP in light-hit units (3-5 hits), then scales to the
  // combat damage resolution. Authored enemy.health stays small; the scale lives here.
  if (enemy.firstSealRouteRamp) {
    const tunedHealth = Math.max(3, enemy.health) * COMBAT_DAMAGE_SCALE;
    return enemy.type === 'scorpion' ? Math.ceil(tunedHealth * 1.5) : tunedHealth;
  }
  if (enemy.openingRouteRamp) {
    const tunedHealth = Math.max(3, enemy.health) * COMBAT_DAMAGE_SCALE;
    return enemy.type === 'scorpion' ? Math.ceil(tunedHealth * 1.5) : tunedHealth;
  }
  // Authored health of 4+ is an explicit light-hit count (Rome's gladiators run 5-7 and
  // golems 8-10); the small-enemy clamp below would flatten all of them to 5 hits.
  if (enemy.health >= 4) {
    const tunedHealth = Math.min(10, enemy.health) * COMBAT_DAMAGE_SCALE;
    return enemy.type === 'scorpion' ? Math.ceil(tunedHealth * 1.5) : tunedHealth;
  }
  const bonus = ENEMY_TOUGHNESS_BONUS[enemy.type] ?? 1;
  const tunedHealth = clamp(Math.max(enemy.health + bonus, Math.ceil(enemy.health * 1.55)), 3, 5) * COMBAT_DAMAGE_SCALE;
  if (enemy.type === 'scorpion') return Math.ceil(tunedHealth * 1.5);
  return tunedHealth;
};

const tuneEnemyDamage = (enemy) => {
  if (enemy.firstSealRouteRamp) return Math.max(1, enemy.damage);
  // Late-game inflation is deliberately mild: with heavy attacks now resolving at their
  // 1.5-1.8x damage scales, normal hits should land ~19-33 of the 100 Endurance pool and
  // heavies top out near half the bar instead of one-shotting it.
  return enemy.openingRouteRamp
    ? Math.max(enemy.damage + 1, Math.ceil(enemy.damage * 1.3))
    : Math.max(enemy.damage + 3, Math.ceil(enemy.damage * 1.35));
};

const makeStepProfile = (entity, { boss = false } = {}) => {
  const seed = hashEnemyIdentity(entity);
  const seedRatio = (seed % 997) / 997;
  return {
    baseSpeed: entity.speed * (entity.openingRouteRamp ? 1.12 : 1.32),
    stepSeed: seed,
    stepTimer: 0,
    stepCycle: 0,
    stepShiftTimer: 0.45 + seedRatio * 0.8,
    stepSpeedMultiplier: boss ? 0.94 + seedRatio * 0.16 : 0.88 + seedRatio * 0.24,
    stepPauseTimer: 0,
    stepRhythm: boss ? 1.05 + seedRatio * 0.55 : 1.35 + seedRatio * 0.85,
  };
};

export const getCollectibleHitbox = (item, size = {}) => expandRect({
  x: item.x,
  y: item.y,
  width: size.width ?? item.width ?? 24,
  height: size.height ?? item.height ?? 24,
}, { x: JOURNEY_HITBOX_TUNING.collectible.padX, y: JOURNEY_HITBOX_TUNING.collectible.padY });

export const getHazardHitbox = (hazard) => insetRect(getJourneyTrapTriggerRect(hazard), {
  x: Math.min(JOURNEY_HITBOX_TUNING.hazard.insetX, hazard.width / 4),
  y: Math.min(JOURNEY_HITBOX_TUNING.hazard.topInset, hazard.height / 3),
  bottom: Math.min(JOURNEY_HITBOX_TUNING.hazard.bottomInset, hazard.height / 3),
});

// Body contact is deliberately harmless (attacks and stomps are the only ways enemies and
// the player hurt each other); the 'damage' result here only supplies the knockback
// direction when an attack swing lands while the bodies overlap.
export const resolveEnemyContact = (player, previousPlayer, enemy) => {
  if (enemy.defeated) return { type: 'none' };
  const playerFeet = getPlayerFeetHitbox(player);
  const previousFeetY = previousPlayer.y + previousPlayer.height;
  if (
    player.vy >= 0
    && previousFeetY <= enemy.y + JOURNEY_HITBOX_TUNING.enemyStomp.previousFootTolerance
    && rectsOverlap(playerFeet, getEnemyStompHitbox(enemy))
  ) {
    return { type: 'stomp' };
  }

  if (rectsOverlap(getPlayerBodyHitbox(player), getEnemyDamageHitbox(enemy))) {
    return {
      type: 'damage',
      direction: (player.x + player.width / 2) >= (enemy.x + enemy.width / 2) ? 1 : -1,
    };
  }

  return { type: 'none' };
};

export const getSectionForX = (x) => (
  SECTIONS.find((section) => x >= section.start && x < section.end) || SECTIONS[SECTIONS.length - 1]
);

export const getPlayerMovementVisualStyle = (player) => {
  const speed = Math.abs(player.vx || 0);
  if (speed <= 8) return 'none';
  if (speed < 95) return 'survey-walk';
  if (speed > 190) return 'run';
  return 'walk';
};

export const getPlayerAnimationState = (current) => {
  if (current.player.hitFeedbackTimer > 0 || current.player.knockbackTimer > 0) return 'hurt';
  if (current.dodgeTimer > 0) return 'dodge';
  if (current.attackWindupTimer > 0 || current.attackTimer > 0 || current.attackRecoilTimer > 0) return 'attack';
  if (!current.player.onGround) return current.player.vy > 40 ? 'fall' : 'jump';
  if (current.player.landingFeedbackTimer > 0) return 'land';
  const movementStyle = getPlayerMovementVisualStyle(current.player);
  if (movementStyle !== 'none') return movementStyle;
  return 'idle';
};

export const getPlayerAnimationFrame = (animationState, walkCycleDistance = 0, player = {}) => {
  if (animationState === 'survey-walk') {
    return Math.floor(walkCycleDistance / 34) % PLAYER_SPRITE_FRAME_COUNT;
  }
  if (animationState === 'walk') {
    return Math.floor(walkCycleDistance / 22) % PLAYER_SPRITE_FRAME_COUNT;
  }
  if (animationState === 'run') {
    return Math.floor(walkCycleDistance / 15) % PLAYER_SPRITE_FRAME_COUNT;
  }
  if (animationState === 'jump') {
    const vy = player.vy || 0;
    if (vy < -620) return 0;
    if (vy < -430) return 1;
    if (vy < -230) return 2;
    return 3;
  }
  if (animationState === 'fall') {
    const vy = player.vy || 0;
    if (vy < 160) return 3;
    if (vy < 320) return 4;
    if (vy < 520) return 5;
    if (vy < 700) return 6;
    return 7;
  }
  if (animationState === 'land') {
    const landingProgress = 1 - Math.max(0, Math.min(1, (player.landingFeedbackTimer || 0) / 0.22));
    return Math.min(3, Math.floor(landingProgress * 4));
  }
  if (animationState === 'dodge') return 3;
  if (animationState === 'attack') return 3;
  if (animationState === 'hurt') return 0;
  return 1;
};

export const updatePlayerAnimation = (current, dt) => {
  const animationState = getPlayerAnimationState(current);
  const visualWalkStyle = getPlayerMovementVisualStyle(current.player);
  if (['survey-walk', 'walk', 'run'].includes(animationState)) {
    current.player.walkCycleDistance += Math.abs(current.player.vx) * dt;
  }
  current.player.animationState = animationState;
  current.player.visualWalkStyle = visualWalkStyle;
  current.player.animationFrame = getPlayerAnimationFrame(animationState, current.player.walkCycleDistance, current.player);
  current.player.spriteScale = PLAYER_SPRITE_SCALE;
};

export const makeEnemy = (enemy) => ({
  ...enemy,
  // Stationary spawners (scorpion nests) never walk, so their patrol bounds must stay
  // pinned to their placed x. Otherwise the patrol-boundary clamp in the movement loop
  // snaps an editor-moved or override-relocated nest back to the original patrol range
  // every frame (e.g. an x override is ignored because patrolMin/Max weren't moved too).
  ...(enemy.type === 'scorpion-nest' && Number.isFinite(enemy.x)
    ? { patrolMin: enemy.x, patrolMax: enemy.x }
    : {}),
  direction: 1,
  health: tuneEnemyHealth(enemy),
  maxHealth: tuneEnemyHealth(enemy),
  damage: tuneEnemyDamage(enemy),
  defeated: false,
  defeatedVisibleTimer: 0,
  stunTimer: 0,
  hitFlash: 0,
  attackWindup: 0,
  attackTimer: 0,
  attackCooldown: enemy.initialAttackCooldown ?? 0.8,
  attackDirection: 1,
  attackHasHit: false,
  attackReady: false,
  attackRecovery: 0,
  attackPattern: 'patrol',
  attackPhaseLabel: 'Patrol',
  aggroMemoryTimer: 0,
  vulnerabilityTimer: 0,
  shieldTimer: 0,
  knockbackTimer: 0,
  knockbackDirection: 0,
  ...makeStepProfile(enemy),
});

export const makeMiniBoss = (boss) => ({
  ...boss,
  direction: 1,
  // Bosses take typed player damage (light 10 / finisher 30), so HP runs deeper than the
  // old flat-10-per-hit pool: authored 1-3 health maps to 40-60 effective HP.
  health: Math.max(boss.health + 2, Math.ceil(boss.health * 1.8)) * COMBAT_DAMAGE_SCALE,
  maxHealth: Math.max(boss.health + 2, Math.ceil(boss.health * 1.8)) * COMBAT_DAMAGE_SCALE,
  damage: Math.max(boss.damage + 2, Math.ceil(boss.damage * 1.3)),
  defeated: false,
  awakened: false,
  staggerRewarded: false,
  stunTimer: 0,
  hitFlash: 0,
  attackWindup: 0,
  attackTimer: 0,
  attackCooldown: 1.2,
  attackDirection: 1,
  attackHasHit: false,
  attackReady: false,
  attackRecovery: 0,
  attackPattern: 'heavy',
  attackPhaseLabel: 'Heavy attack',
  attackKind: 'close',
  attackCycleIndex: 0,
  vulnerabilityTimer: 0,
  shieldTimer: 0,
  patternHistory: [],
  knockbackTimer: 0,
  knockbackDirection: 0,
  ...makeStepProfile(boss, { boss: true }),
});

export const makeBossKeyItem = (item) => ({
  ...item,
  x: 0,
  y: 0,
  dropped: false,
  collected: false,
});

// ---------------------------------------------------------------------------
// Reusable Journey Room Interact System
// ---------------------------------------------------------------------------
// A lightweight, pure (no React / no canvas) model for in-world interaction in
// Journey rooms. The Mummification Chamber is the first consumer; the same
// primitives are intended for later rooms (Scribe Chamber, Queen Chamber).
// Verbs describe what the player is about to do; object states describe how an
// object should read/render. The transition helpers are pure: they clone the
// interaction state and return { ok, interaction, reason } so they can be unit
// tested and reused without dragging gameplay side effects along.
export const JOURNEY_INTERACT_VERBS = Object.freeze({
  INSPECT: 'inspect',
  PICK_UP: 'pick-up',
  CARRY: 'carry',
  PLACE: 'place',
  HOLD_APPLY: 'hold-apply',
  HOLD_WRAP: 'hold-wrap',
  RESTORE: 'restore',
});

export const JOURNEY_INTERACT_OBJECT_STATES = Object.freeze({
  IDLE: 'idle',
  INSPECTED: 'inspected',
  HELD: 'held',
  PLACED: 'placed',
  USED: 'used',
  COMPLETED: 'completed',
  LOCKED: 'locked',
});

export const JOURNEY_INTERACT_PROMPTS = Object.freeze({
  [JOURNEY_INTERACT_VERBS.INSPECT]: 'E Inspect',
  [JOURNEY_INTERACT_VERBS.PICK_UP]: 'E Pick up',
  [JOURNEY_INTERACT_VERBS.CARRY]: 'E Carry',
  [JOURNEY_INTERACT_VERBS.PLACE]: 'E Place',
  [JOURNEY_INTERACT_VERBS.HOLD_APPLY]: 'Hold E Apply',
  [JOURNEY_INTERACT_VERBS.HOLD_WRAP]: 'Hold E Wrap',
  [JOURNEY_INTERACT_VERBS.RESTORE]: 'E Restore',
});

export const getJourneyInteractPrompt = (verb) => JOURNEY_INTERACT_PROMPTS[verb] || 'E Interact';

// One carried item at a time, per-object states, and a single live hold action.
export const createJourneyRoomInteractionState = () => ({
  carriedItemId: null,
  objectStates: {},
  holdItemId: null,
  holdVerb: null,
  holdProgress: 0,
  holdDuration: 0,
  interactHeldPrev: false,
  feedback: null,
});

export const getJourneyInteractObjectState = (interaction, id) =>
  interaction?.objectStates?.[id] || JOURNEY_INTERACT_OBJECT_STATES.IDLE;

const cloneJourneyInteraction = (interaction) => {
  const base = interaction || createJourneyRoomInteractionState();
  return {
    ...base,
    objectStates: { ...(base.objectStates || {}) },
  };
};

export const journeyInteractInspect = (interaction, item) => {
  const next = cloneJourneyInteraction(interaction);
  const id = item?.id;
  if (!id) return { ok: false, interaction: next, reason: 'no-item' };
  // Don't downgrade an object that already advanced past inspection.
  const existing = next.objectStates[id];
  if (!existing || existing === JOURNEY_INTERACT_OBJECT_STATES.IDLE) {
    next.objectStates[id] = JOURNEY_INTERACT_OBJECT_STATES.INSPECTED;
  }
  next.feedback = { type: 'inspected', id };
  return { ok: true, interaction: next, reason: null };
};

export const journeyInteractPickUp = (interaction, item) => {
  const next = cloneJourneyInteraction(interaction);
  const id = item?.id;
  if (!id) return { ok: false, interaction: next, reason: 'no-item' };
  if (next.carriedItemId) {
    // Hands are already full — enforce one carried item at a time.
    next.feedback = { type: 'hands-full', id };
    return { ok: false, interaction: next, reason: 'hands-full' };
  }
  next.carriedItemId = id;
  next.objectStates[id] = JOURNEY_INTERACT_OBJECT_STATES.HELD;
  next.feedback = { type: 'picked-up', id };
  return { ok: true, interaction: next, reason: null };
};

// Places the carried item only at a valid target (target.acceptsItemId matches).
// A wrong target keeps the carried item AND all prior progress — nothing resets.
export const journeyInteractPlace = (interaction, target) => {
  const next = cloneJourneyInteraction(interaction);
  const carried = next.carriedItemId;
  if (!carried) return { ok: false, interaction: next, reason: 'empty-handed' };
  if (!target?.id) return { ok: false, interaction: next, reason: 'no-target' };
  if (target.acceptsItemId !== carried) {
    // Wrong placement: feedback only, carried item retained, no reset.
    next.feedback = { type: 'wrong-target', id: target.id, itemId: carried };
    return { ok: false, interaction: next, reason: 'wrong-target' };
  }
  next.carriedItemId = null;
  next.objectStates[carried] = JOURNEY_INTERACT_OBJECT_STATES.COMPLETED;
  next.objectStates[target.id] = JOURNEY_INTERACT_OBJECT_STATES.COMPLETED;
  next.feedback = { type: 'placed', id: target.id, itemId: carried };
  return { ok: true, interaction: next, reason: null };
};

// Advances a hold-to-use action. Releasing the key or moving cancels ONLY the
// current hold (progress resets to 0); it never touches other rite progress.
export const journeyInteractHoldTick = (
  interaction,
  { itemId = null, verb = null, duration = 1, dt = 0, holding = false, moving = false } = {},
) => {
  const next = cloneJourneyInteraction(interaction);
  if (!holding || moving) {
    const cancelled = next.holdProgress > 0;
    next.holdItemId = null;
    next.holdVerb = null;
    next.holdProgress = 0;
    next.holdDuration = 0;
    if (cancelled) next.feedback = { type: 'hold-cancelled', id: itemId, moving: Boolean(moving) };
    return { ok: false, interaction: next, reason: moving ? 'moved' : 'released', cancelled, completed: false };
  }
  // Restart accumulation if the hold target changed.
  if (next.holdItemId !== itemId || next.holdVerb !== verb) {
    next.holdItemId = itemId;
    next.holdVerb = verb;
    next.holdProgress = 0;
  }
  next.holdDuration = duration;
  next.holdProgress = Math.min(duration, next.holdProgress + Math.max(0, dt));
  const completed = next.holdProgress >= duration;
  if (completed) {
    next.holdItemId = null;
    next.holdVerb = null;
    next.holdProgress = 0;
    next.holdDuration = 0;
    next.feedback = { type: 'hold-complete', id: itemId, verb };
  }
  return { ok: completed, interaction: next, reason: completed ? 'completed' : 'holding', cancelled: false, completed };
};

// Mummification rite order — exported so tests can drive the five-rite flow and
// confirm the exit seal stays locked until every rite is complete.
export const MUMMIFICATION_RITE_SEQUENCE = Object.freeze([
  'cleanse',
  'jars',
  'oils',
  'linen',
  'name',
]);

export const isMummificationChamberComplete = (ritualStep) =>
  (ritualStep || 0) >= MUMMIFICATION_RITE_SEQUENCE.length;

export const makeInitialState = ({ targetCivilisation, permanentUpgradeIds = [], permanentUpgradeEffects = {} } = {}) => ({
  player: {
    x: 44,
    y: GROUND_Y - PLAYER_HEIGHT,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    direction: 1,
    onGround: true,
    airJumpsUsed: 0,
    invulnerable: 0,
    damageCooldownTimer: 0,
    venomSlowTimer: 0,
    venomSlowMultiplier: 1,
    hitFeedbackTimer: 0,
    impactShakeTimer: 0,
    lastDamage: 0,
    lastDamageSource: null,
    lastDamageTime: null,
    knockbackTimer: 0,
    knockbackMaxTimer: 0,
    knockbackDirection: 0,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    jumpCutFeedbackTimer: 0,
    landingFeedbackTimer: 0,
    movementDustTimer: 0,
    lastLandingImpact: 0,
    animationState: 'idle',
    animationFrame: 1,
    visualWalkStyle: 'none',
    walkCycleDistance: 0,
    spriteScale: PLAYER_SPRITE_SCALE,
  },
  fieldKit: [],
  collectedToolIds: new Set(),
  collectedShardIds: new Set(),
  relicShardCount: 0,
  permanentUpgrades: new Set(permanentUpgradeIds),
  upgradeEffects: {
    jumpMultiplier: 1,
    airControlMultiplier: 1,
    knockbackMultiplier: 1,
    maxStamina: 100,
    hazardStaminaMultiplier: 1,
    hiddenClueHighlights: false,
    hiddenRouteAccess: false,
    fragileWallAccess: false,
    ...permanentUpgradeEffects,
  },
  collectedUpgrades: new Set(permanentUpgradeIds),
  collectedTabletIds: new Set(),
  discoveredHiddenRouteIds: new Set(),
  collectedSecretIds: new Set(),
  collectedObjectiveIds: new Set(),
  collectedBossKeyIds: new Set(),
  enemies: getJourneyEnemies(targetCivilisation).map(makeEnemy),
  enemiesDisabled: false,
  scorpionNestBlockNoticeCooldown: 0,
  miniBosses: getJourneyMiniBosses(targetCivilisation).map(makeMiniBoss),
  bossKeyItems: BOSS_KEY_ITEMS.map(makeBossKeyItem),
  defeatedEnemies: new Set(),
  defeatedMiniBosses: new Set(),
  hiddenRoomsFound: new Set(),
  completedCollectionSetIds: new Set(),
  openedRouteGateIds: new Set(),
  completedObjectiveIds: new Set(),
  triggeredEnvironmentEventIds: new Set(),
  scarabSealActivated: false,
  openingConfrontationSeen: false,
  openingFirstShardEchoSeen: false,
  templeThresholdHallEntranceDiscovered: false,
  templeThresholdHallEntered: false,
  templeThresholdHallActive: false,
  templeThresholdHallCleared: false,
  mummificationChamberEntranceDiscovered: false,
  mummificationChamberEntered: false,
  mummificationChamberActive: false,
  mummificationChamberDoorSealed: false,
  mummificationChamberExitUnlocked: false,
  mummificationChamberPuzzleSolved: false,
  mummificationChamberRestored: false,
  mummificationChamberRitualStep: 0,
  mummificationChamberInspectedObjectIds: new Set(),
  mummificationChamberInteraction: createJourneyRoomInteractionState(),
  mummificationChamberDisturbanceTimer: 0,
  mummificationChamberWrongCount: 0,
  forgottenMuralLooterSeen: false,
  forgottenMuralChamberEntered: false,
  forgottenMuralChamberActive: false,
  forgottenMuralChamberTransition: null,
  forgottenMuralRelicSlidePuzzleOpen: false,
  forgottenMuralRelicSlidePuzzleSolved: false,
  forgottenMuralRelicSlidePuzzleTiles: [],
  forgottenMuralRelicSlidePuzzleMoves: 0,
  scribeChamberEntered: false,
  scribeChamberActive: false,
  scribeChamberDoorSealed: false,
  scribeChamberTabletInspected: false,
  scribeChamberWallInspected: false,
  scribeChamberExitUnlocked: false,
  scribeChamberPuzzleSolved: false,
  scribeChamberRecordRestored: false,
  currentSceneId: 'egypt-exterior-route',
  previousSceneId: null,
  sceneTransition: null,
  sceneReturn: null,
  forgottenMuralChamberRestored: false,
  arrivalThresholdActive: false,
  arrivalThresholdStarted: false,
  arrivalThresholdLeftInspected: false,
  arrivalThresholdMarkingsInspected: false,
  arrivalThresholdGateTriggered: false,
  arrivalThresholdNoticeTimer: 0,
  openingThresholdScene: null,
  openingCinematic: null,
  templeThresholdTransition: null,
  openingCameraRevealTimer: 0,
  openingCameraRevealDuration: 1.55,
  brokenEnvironmentIds: new Set(),
  triggeredEnvironmentIds: new Set(),
  collapsedPlatformIds: new Set(),
  reactivePlatformTimers: {},
  activePlatformChallenge: null,
  recentEnvironmentInteractions: [],
  cinematicEvent: null,
  cinematicTimer: 0,
  postBossReward: null,
  postBossRewardTimer: 0,
  bossIntro: null,
  bossIntroTimer: 0,
  bossIntroPauseTimer: 0,
  bossDomain: null,
  seenBossIntroIds: new Set(),
  seenEnemyTypeNoticeIds: new Set(),
  activeGuardianChallenge: null,
  pendingGuardianChallenge: null,
  completedGuardianChallengeIds: new Set(),
  guardianChallengeResults: {},
  guardianBattleModifiers: {},
  environmentEvent: null,
  environmentEventTimer: 0,
  dynamicEnvironmentEvent: null,
  dynamicEnvironmentEventTimer: 0,
  discoveryEntranceActive: false,
  discoveryEntranceTimer: 0,
  discoveryEntranceHandoffStarted: false,
  sectionTransition: {
    id: 'desert-entry',
    name: SECTIONS[0].name,
    message: SECTION_ATMOSPHERES[SECTIONS[0].id].title,
  },
  sectionTransitionTimer: 2.6,
  cameraX: 0,
  targetCameraX: 0,
  cameraMode: 'follow',
  cameraFocusTarget: null,
  cameraShakeTimer: 0,
  cameraShakeStrength: 0,
  lastSectionId: SECTIONS[0].id,
  activeCheckpoint: CHECKPOINTS[0],
  resources: {
    stamina: permanentUpgradeEffects.maxStamina || 100,
    time: 900,
  },
  notice: INITIAL_JOURNEY_NOTICE,
  itemPurposeNoticeTimer: 0,
  damageNoticeTimer: 0,
  hazardCooldown: 0,
  trapStates: {},
  trapProjectiles: [],
  lastHazardHit: null,
  lastStaminaDelta: 0,
  lastStaminaLossReason: '',
  staminaFeedbackTimer: 0,
  enemyCooldown: 0,
  attackCooldown: 0,
  attackTimer: 0,
  attackWindupTimer: 0,
  attackRecoilTimer: 0,
  attackWindupDuration: 0,
  attackSwingDuration: 0,
  attackRecoilDuration: 0,
  attackPhase: 'ready',
  attackQueued: false,
  attackQueuedType: 'light',
  attackQueuedHeavyFollowupPrimed: false,
  attackType: 'light',
  attackSequenceIndex: 0,
  attackComboWindowTimer: 0,
  attackComboLanded: false,
  attackComboPreserved: false,
  attackComboStep: 0,
  attackComboFinisherActive: false,
  heavyFollowupReadyTimer: 0,
  heavyFollowupCueTimer: 0,
  attackHitIds: new Set(),
  attackRewarded: false,
  playerAttackStaminaCost: 0,
  lastAttackResult: 'ready',
  shieldedHitFeedback: '',
  playerAttackBox: null,
  dodgeTimer: 0,
  dodgeInvulnerableTimer: 0,
  dodgeRecoveryTimer: 0,
  dodgeDirection: 0,
  dodgeFacingDirection: 0,
  dodgeTrail: [],
  lastDodgeResult: 'ready',
  enduranceExhausted: false,
  hitStopTimer: 0,
  combatHitEffects: [],
  routeGateCooldown: 0,
  timeAccumulator: 0,
  failed: false,
  failureReason: '',
  failureDetail: '',
  completed: false,
});
