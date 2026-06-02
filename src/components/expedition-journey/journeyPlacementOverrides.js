const cloneItem = (item) => ({ ...item });

const EDITABLE_FIELDS = Object.freeze({
  props: [
    'id', 'sectionId', 'sceneId', 'type', 'atmosphereAssetKey', 'x', 'y', 'width', 'height', 'yOffset',
    'alpha', 'depth', 'layer', 'zIndex', 'scale', 'rotation', 'mirrorX', 'brightness', 'placementPreset', 'label',
  ],
  platforms: ['id', 'sectionId', 'sceneId', 'x', 'y', 'width', 'height', 'layer', 'zIndex', 'label'],
  hazards: [
    'id', 'sectionId', 'sceneId', 'type', 'x', 'y', 'width', 'height', 'triggerArea', 'damage',
    'reset', 'cooldown', 'depth', 'direction', 'launcherX', 'launcherY', 'linkedObjectIds',
    'editorVisible', 'burial', 'penalty', 'message',
  ],
  routeGates: ['id', 'sectionId', 'sceneId', 'x', 'y', 'width', 'height'],
  routeGateDoorways: ['id', 'gateIds', 'anchorX', 'blockX', 'y', 'width', 'height', 'opening', 'slab', 'label'],
  checkpoints: ['id', 'name', 'x', 'markerX', 'y'],
  miniBosses: [
    'id', 'sectionId', 'x', 'y', 'width', 'height', 'lairX', 'lairY', 'lairWidth',
    'lairHeight', 'patrolMin', 'patrolMax', 'arenaStart', 'arenaEnd',
  ],
});

const pickEditableFields = (item, editableFields = []) => Object.fromEntries(
  editableFields
    .filter(field => Object.prototype.hasOwnProperty.call(item, field))
    .map(field => [field, item[field]])
);

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
    hazards,
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
    checkpoints: mergeJourneyItemsById(baseData.checkpoints, overrides.checkpoints, [], EDITABLE_FIELDS.checkpoints),
    miniBosses: mergeJourneyItemsById(baseData.miniBosses, overrides.miniBosses, [], EDITABLE_FIELDS.miniBosses),
  };
};
