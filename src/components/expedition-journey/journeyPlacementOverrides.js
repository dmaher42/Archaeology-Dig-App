const cloneEditableValue = (value) => {
  if (Array.isArray(value)) return value.map(cloneEditableValue);
  if (value && typeof value === 'object') return { ...value };
  return value;
};

const cloneItem = (item) => Object.fromEntries(
  Object.entries(item || {}).map(([key, value]) => [key, cloneEditableValue(value)])
);

const EDITABLE_FIELDS = Object.freeze({
  props: [
    'id', 'sectionId', 'sceneId', 'type', 'atmosphereAssetKey', 'imageAssetKey', 'assetPath', 'x', 'y', 'width',
    'height', 'editorBoundsInsetTop', 'editorBoundsInsetRight', 'editorBoundsInsetBottom', 'editorBoundsInsetLeft',
    'yOffset', 'alpha', 'depth', 'layer', 'zIndex', 'scale', 'rotation', 'mirrorX', 'mirrorY', 'brightness',
    'placementPreset', 'tint', 'colorGradeFilter', 'tintColor', 'tintStrength', 'paintColor', 'paintStrength', 'sceneBlend', 'shadow', 'shadowOpacity', 'shadowWidth',
    'shadowHeight', 'dust', 'bury', 'burialDepth', 'sandOverlapHeight', 'sandMoundWidth', 'sandMoundHeight',
    'groundPebbles', 'groundPlaneY', 'groundPlaneOffset', 'assetContactYRatio', 'sandSeed', 'groundContactLayer', 'label',
  ],
  platforms: ['id', 'sectionId', 'sceneId', 'x', 'y', 'width', 'height', 'layer', 'collision', 'blockerShape', 'zIndex', 'label'],
  hazards: [
    'id', 'sectionId', 'sceneId', 'type', 'x', 'y', 'width', 'height', 'triggerArea', 'damage',
    'reset', 'cooldown', 'depth', 'direction', 'launcherX', 'launcherY', 'linkedObjectIds',
    'editorVisible', 'burial', 'brightness', 'alpha', 'colorGradeFilter', 'penalty', 'message',
  ],
  routeGates: ['id', 'sectionId', 'sceneId', 'x', 'y', 'width', 'height', 'hideArchVisual', 'suppressRouteGateVisual'],
  routeGateDoorways: ['id', 'gateIds', 'anchorX', 'blockX', 'y', 'width', 'height', 'opening', 'slab', 'label'],
  hiddenRoutes: [
    'id', 'civilisation', 'sectionId', 'sceneId', 'name', 'x', 'y', 'width', 'height',
    'rewardHint', 'discoveryMessage', 'gateType', 'teaseVisible', 'storySummary',
    'storyArcSummary', 'rewardSummary', 'requiredUpgradeId', 'futureUpgradeHook', 'lockedMessage',
  ],
  checkpoints: ['id', 'name', 'x', 'markerX', 'y'],
  enemies: [
    'id', 'sectionId', 'sceneId', 'x', 'y', 'width', 'height', 'widthScale',
    'yOffset', 'glowYFactor', 'glowSize',
  ],
  miniBosses: [
    'id', 'sectionId', 'x', 'y', 'width', 'height', 'lairX', 'lairY', 'lairWidth',
    'lairHeight', 'patrolMin', 'patrolMax', 'arenaStart', 'arenaEnd',
  ],
});

const pickEditableFields = (item, editableFields = []) => Object.fromEntries(
  editableFields
    .filter(field => Object.prototype.hasOwnProperty.call(item, field))
    .map(field => [field, cloneEditableValue(item[field])])
);

const dedupeJourneyItemsById = (items = []) => {
  const deduped = [];
  const indexById = new Map();

  (Array.isArray(items) ? items : []).forEach((item) => {
    const nextItem = cloneItem(item);
    if (!nextItem?.id) {
      deduped.push(nextItem);
      return;
    }
    if (indexById.has(nextItem.id)) {
      deduped[indexById.get(nextItem.id)] = nextItem;
      return;
    }
    indexById.set(nextItem.id, deduped.length);
    deduped.push(nextItem);
  });

  return deduped;
};

const mergeJourneyItemsById = (baseItems = [], overrideItems = [], deletedIds = [], editableFields = []) => {
  const deleted = new Set(Array.isArray(deletedIds) ? deletedIds : []);
  const overridesById = new Map((Array.isArray(overrideItems) ? overrideItems : [])
    .filter(item => item?.id)
    .map(item => [item.id, cloneItem(item)]));
  const seen = new Set();
  const merged = [];

  (Array.isArray(baseItems) ? baseItems : []).forEach((item) => {
    if (!item?.id || deleted.has(item.id)) return;
    if (overridesById.has(item.id)) {
      merged.push({
        ...cloneItem(item),
        ...pickEditableFields(overridesById.get(item.id), editableFields),
      });
      seen.add(item.id);
      return;
    }
    merged.push(cloneItem(item));
    seen.add(item.id);
  });

  overridesById.forEach((item, itemId) => {
    if (deleted.has(itemId) || seen.has(itemId)) return;
    merged.push(cloneItem(item));
  });

  return merged;
};

const getExportRoomId = (exportData = {}) => {
  const roomId = typeof exportData?.room === 'string' ? exportData.room.trim() : '';
  return roomId || null;
};

const getOverrideItemRoomId = (item = {}) => {
  const getRoomField = value => (
    typeof value === 'string' && value.trim() && value !== 'unknown-room'
      ? value.trim()
      : null
  );

  return getRoomField(item.sceneId) || getRoomField(item.sectionId) || getRoomField(item.roomId);
};

const isOverrideItemInRoom = (item, roomId) => (
  Boolean(roomId && getOverrideItemRoomId(item) === roomId)
);

const getImplicitDeletedOverrideIds = (
  existingItems = [],
  incomingItems = [],
  deletedIds = [],
  roomId = null,
  pruneMissingRoomItems = false,
) => {
  if (!pruneMissingRoomItems || !roomId) return [];
  const deleted = new Set(Array.isArray(deletedIds) ? deletedIds : []);
  const incomingIds = new Set((Array.isArray(incomingItems) ? incomingItems : [])
    .map(item => item?.id)
    .filter(Boolean));

  return (Array.isArray(existingItems) ? existingItems : [])
    .filter(item => item?.id && isOverrideItemInRoom(item, roomId))
    .map(item => item.id)
    .filter(itemId => !incomingIds.has(itemId) && !deleted.has(itemId));
};

const mergeOverrideExportItemsById = (
  existingItems = [],
  incomingItems = [],
  deletedIds = [],
  roomId = null,
  pruneMissingRoomItems = false,
) => {
  const deleted = new Set(Array.isArray(deletedIds) ? deletedIds : []);
  const incomingById = new Map((Array.isArray(incomingItems) ? incomingItems : [])
    .filter(item => item?.id)
    .map(item => [item.id, cloneItem(item)]));
  const seen = new Set();
  const merged = [];

  (Array.isArray(existingItems) ? existingItems : []).forEach((item) => {
    if (!item?.id || deleted.has(item.id)) return;
    if (incomingById.has(item.id)) {
      merged.push(cloneItem(incomingById.get(item.id)));
      seen.add(item.id);
      return;
    }
    if (pruneMissingRoomItems && isOverrideItemInRoom(item, roomId)) return;
    merged.push(cloneItem(item));
    seen.add(item.id);
  });

  incomingById.forEach((item, itemId) => {
    if (deleted.has(itemId) || seen.has(itemId)) return;
    merged.push(cloneItem(item));
  });

  return merged;
};

const mergeDeletedIds = (...idLists) => (
  [...new Set(idLists.flatMap(ids => (Array.isArray(ids) ? ids : [])).filter(Boolean))]
);

export const getJourneyPlacementImplicitRoomDeletedIds = (existingExport = {}, incomingExport = {}) => {
  const existing = normalizeJourneyPlacementExportForOverrides(existingExport);
  const incoming = normalizeJourneyPlacementExportForOverrides(incomingExport);
  const roomId = getExportRoomId(incomingExport);

  return {
    props: getImplicitDeletedOverrideIds(
      existing.props,
      incoming.props,
      incoming.deletedPropIds,
      roomId,
      Array.isArray(incomingExport.props),
    ),
    platforms: getImplicitDeletedOverrideIds(
      existing.platforms,
      incoming.platforms,
      incoming.deletedPlatformIds,
      roomId,
      Array.isArray(incomingExport.platforms),
    ),
    hazards: getImplicitDeletedOverrideIds(
      existing.hazards,
      incoming.hazards,
      incoming.deletedHazardIds,
      roomId,
      Array.isArray(incomingExport.hazards),
    ),
  };
};

export const countJourneyPlacementImplicitRoomDeletions = (existingExport = {}, incomingExport = {}) => (
  Object.values(getJourneyPlacementImplicitRoomDeletedIds(existingExport, incomingExport))
    .reduce((sum, ids) => sum + ids.length, 0)
);

export const normalizeJourneyPlacementExportForOverrides = (exportData = {}) => {
  const roomId = exportData.room || 'unknown-room';
  const hazards = Array.isArray(exportData.hazards)
    ? exportData.hazards.map((hazard) => {
      const next = cloneItem(hazard);
      if (next.sectionId === 'unknown-room') next.sectionId = roomId;
      if (next.roomId === 'unknown-room') delete next.roomId;
      return next;
    })
    : [];

  return {
    ...exportData,
    props: dedupeJourneyItemsById(exportData.props),
    platforms: dedupeJourneyItemsById(exportData.platforms),
    hazards: dedupeJourneyItemsById(hazards),
    routeGates: dedupeJourneyItemsById(exportData.routeGates),
    routeGateDoorways: dedupeJourneyItemsById(exportData.routeGateDoorways),
    hiddenRoutes: dedupeJourneyItemsById(exportData.hiddenRoutes),
    checkpoints: dedupeJourneyItemsById(exportData.checkpoints),
    enemies: dedupeJourneyItemsById(exportData.enemies),
    miniBosses: dedupeJourneyItemsById(exportData.miniBosses),
  };
};

export const mergeJourneyPlacementOverrideExports = (existingExport = {}, incomingExport = {}) => {
  const existing = normalizeJourneyPlacementExportForOverrides(existingExport);
  const incoming = normalizeJourneyPlacementExportForOverrides(incomingExport);
  const roomId = getExportRoomId(incomingExport);
  const implicitDeletedIds = getJourneyPlacementImplicitRoomDeletedIds(existingExport, incomingExport);

  return {
    ...existing,
    ...incoming,
    props: mergeOverrideExportItemsById(
      existing.props,
      incoming.props,
      mergeDeletedIds(incoming.deletedPropIds, implicitDeletedIds.props),
      roomId,
      Array.isArray(incomingExport.props),
    ),
    platforms: mergeOverrideExportItemsById(
      existing.platforms,
      incoming.platforms,
      mergeDeletedIds(incoming.deletedPlatformIds, implicitDeletedIds.platforms),
      roomId,
      Array.isArray(incomingExport.platforms),
    ),
    hazards: mergeOverrideExportItemsById(
      existing.hazards,
      incoming.hazards,
      mergeDeletedIds(incoming.deletedHazardIds, implicitDeletedIds.hazards),
      roomId,
      Array.isArray(incomingExport.hazards),
    ),
    routeGates: mergeOverrideExportItemsById(existing.routeGates, incoming.routeGates),
    routeGateDoorways: mergeOverrideExportItemsById(existing.routeGateDoorways, incoming.routeGateDoorways),
    hiddenRoutes: mergeOverrideExportItemsById(existing.hiddenRoutes, incoming.hiddenRoutes),
    checkpoints: mergeOverrideExportItemsById(existing.checkpoints, incoming.checkpoints),
    enemies: mergeOverrideExportItemsById(existing.enemies, incoming.enemies),
    miniBosses: mergeOverrideExportItemsById(existing.miniBosses, incoming.miniBosses),
    deletedPropIds: mergeDeletedIds(existing.deletedPropIds, incoming.deletedPropIds, implicitDeletedIds.props),
    deletedPlatformIds: mergeDeletedIds(existing.deletedPlatformIds, incoming.deletedPlatformIds, implicitDeletedIds.platforms),
    deletedHazardIds: mergeDeletedIds(existing.deletedHazardIds, incoming.deletedHazardIds, implicitDeletedIds.hazards),
  };
};

export const applyJourneyPlacementOverrides = (baseData = {}, overrideData = {}) => {
  const overrides = normalizeJourneyPlacementExportForOverrides(overrideData);
  return {
    props: mergeJourneyItemsById(baseData.props, overrides.props, overrides.deletedPropIds, EDITABLE_FIELDS.props),
    platforms: mergeJourneyItemsById(baseData.platforms, overrides.platforms, overrides.deletedPlatformIds, EDITABLE_FIELDS.platforms),
    hazards: mergeJourneyItemsById(baseData.hazards, overrides.hazards, overrides.deletedHazardIds, EDITABLE_FIELDS.hazards),
    routeGates: mergeJourneyItemsById(baseData.routeGates, overrides.routeGates, [], EDITABLE_FIELDS.routeGates),
    routeGateDoorways: mergeJourneyItemsById(baseData.routeGateDoorways, overrides.routeGateDoorways, [], EDITABLE_FIELDS.routeGateDoorways),
    hiddenRoutes: mergeJourneyItemsById(baseData.hiddenRoutes, overrides.hiddenRoutes, [], EDITABLE_FIELDS.hiddenRoutes),
    checkpoints: mergeJourneyItemsById(baseData.checkpoints, overrides.checkpoints, [], EDITABLE_FIELDS.checkpoints),
    enemies: mergeJourneyItemsById(baseData.enemies, overrides.enemies, [], EDITABLE_FIELDS.enemies),
    miniBosses: mergeJourneyItemsById(baseData.miniBosses, overrides.miniBosses, [], EDITABLE_FIELDS.miniBosses),
  };
};
