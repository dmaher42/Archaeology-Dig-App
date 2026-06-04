export const JOURNEY_TRAP_TYPES = Object.freeze({
  'collapsing-stone-floor': {
    label: 'Collapsing Stone Floor',
    width: 112,
    height: 24,
    damage: 8,
    cooldown: 0,
    reset: false,
    depth: 'grounded',
    message: 'Cracked stone gave way underfoot.',
  },
  'hidden-sand-pit': {
    label: 'Hidden Sand Pit',
    width: 132,
    height: 30,
    damage: 7,
    cooldown: 1.2,
    reset: false,
    depth: 'grounded',
    message: 'The disturbed sand gave way beneath Asha.',
  },
  'dart-launcher': {
    label: 'Dart Launcher',
    width: 76,
    height: 18,
    damage: 9,
    cooldown: 1.6,
    reset: true,
    depth: 'midground',
    direction: 'right',
    message: 'A wall dart snapped from a hidden launcher.',
  },
});

export const JOURNEY_TRAP_DIRECTIONS = Object.freeze(['left', 'right', 'up', 'down']);

const DEFAULT_TRAP_TYPE = 'hidden-sand-pit';
const COLLAPSE_SHAKE_SECONDS = 0.48;
const COLLAPSE_RESET_SECONDS = 2.2;
const DART_SPEED = 520;
const DART_SIZE = { width: 28, height: 6 };

const finiteNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const clampNumber = (value, min, max) => Math.max(min, Math.min(max, value));

const toWords = (value = '') => String(value)
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/[-_]+/g, ' ')
  .trim();

const toIdSegment = (value = '') => toWords(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'trap';

const makeUniqueId = (baseId, existingIds = []) => {
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

const normalizeTriggerArea = (trap, triggerArea = trap.triggerArea) => {
  const width = Math.max(1, Math.round(finiteNumber(triggerArea?.width, trap.width)));
  const height = Math.max(1, Math.round(finiteNumber(triggerArea?.height, trap.height)));
  return {
    x: Math.round(finiteNumber(triggerArea?.x, 0)),
    y: Math.round(finiteNumber(triggerArea?.y, 0)),
    width,
    height,
  };
};

export const normalizeJourneyTrap = (trap = {}) => {
  const type = JOURNEY_TRAP_TYPES[trap.type] ? trap.type : DEFAULT_TRAP_TYPE;
  const defaults = JOURNEY_TRAP_TYPES[type];
  const width = Math.max(1, Math.round(finiteNumber(trap.width, defaults.width)));
  const height = Math.max(1, Math.round(finiteNumber(trap.height, defaults.height)));
  const sectionId = trap.sectionId || (!trap.sceneId ? trap.roomId : undefined);
  const sceneId = trap.sceneId || (String(trap.roomId || '').includes('chamber') ? trap.roomId : undefined);
  const normalized = {
    ...trap,
    id: trap.id || `${toIdSegment(trap.roomId || trap.sectionId || trap.sceneId || 'room')}-${type}-1`,
    type,
    name: trap.name || defaults.label,
    ...(sectionId ? { sectionId } : {}),
    ...(sceneId ? { sceneId } : {}),
    roomId: trap.roomId || trap.sceneId || trap.sectionId || sectionId || sceneId || 'unknown-room',
    x: Math.round(finiteNumber(trap.x, 0)),
    y: Math.round(finiteNumber(trap.y, 0)),
    width,
    height,
    damage: Math.max(0, Math.round(finiteNumber(trap.damage, trap.penalty?.stamina ?? defaults.damage))),
    reset: typeof trap.reset === 'boolean' ? trap.reset : defaults.reset,
    cooldown: Math.max(0, finiteNumber(trap.cooldown, defaults.cooldown)),
    depth: trap.depth || defaults.depth,
    linkedObjectIds: Array.isArray(trap.linkedObjectIds) ? [...trap.linkedObjectIds] : [],
    editorVisible: trap.editorVisible !== false,
    message: trap.message || defaults.message,
  };
  normalized.triggerArea = normalizeTriggerArea(normalized, trap.triggerArea);
  if (type === 'dart-launcher') {
    normalized.direction = JOURNEY_TRAP_DIRECTIONS.includes(trap.direction) ? trap.direction : defaults.direction;
    normalized.launcherX = Math.round(finiteNumber(trap.launcherX, normalized.x + normalized.width / 2));
    normalized.launcherY = Math.round(finiteNumber(trap.launcherY, normalized.y - 44));
  }
  return normalized;
};

export const isReusableJourneyTrap = (trap = {}) => Boolean(JOURNEY_TRAP_TYPES[trap.type]);

export const getJourneyTrapTriggerRect = (trap = {}) => {
  const normalized = normalizeJourneyTrap(trap);
  const trigger = normalized.triggerArea;
  return {
    x: normalized.x + trigger.x,
    y: normalized.y + trigger.y,
    width: trigger.width,
    height: trigger.height,
  };
};

export const isJourneyTrapEditorVisible = (trap = {}) => normalizeJourneyTrap(trap).editorVisible !== false;

export const applyJourneyTrapPlacementEdit = (trap = {}, edit = {}) => {
  const wasLegacyHazard = !isReusableJourneyTrap(trap);
  const next = normalizeJourneyTrap({ ...trap });
  if (typeof edit.type === 'string' && JOURNEY_TRAP_TYPES[edit.type]) next.type = edit.type;
  if (Number.isFinite(edit.x)) next.x = Math.round(edit.x);
  if (Number.isFinite(edit.y)) next.y = Math.round(edit.y);
  if (Number.isFinite(edit.width)) next.width = Math.max(1, Math.round(edit.width));
  if (Number.isFinite(edit.height)) next.height = Math.max(1, Math.round(edit.height));
  if (Number.isFinite(edit.damage)) next.damage = Math.max(0, Math.round(edit.damage));
  if (typeof edit.reset === 'boolean') next.reset = edit.reset;
  if (Number.isFinite(edit.cooldown)) next.cooldown = Math.max(0, Math.round(edit.cooldown * 100) / 100);
  if (typeof edit.depth === 'string' && edit.depth.trim()) next.depth = edit.depth.trim();
  if (Array.isArray(edit.linkedObjectIds)) next.linkedObjectIds = edit.linkedObjectIds.map(String).filter(Boolean);
  if (typeof edit.editorVisible === 'boolean') next.editorVisible = edit.editorVisible;
  if (Number.isFinite(edit.burial)) next.burial = clampNumber(Math.round(edit.burial * 100) / 100, 0, 0.85);
  if (Number.isFinite(edit.brightness)) next.brightness = clampNumber(Math.round(edit.brightness * 100) / 100, 0.4, 1.8);
  if (Number.isFinite(edit.alpha)) next.alpha = clampNumber(Math.round(edit.alpha * 100) / 100, 0, 1);
  if (typeof edit.colorGradeFilter === 'string') next.colorGradeFilter = edit.colorGradeFilter;
  if (edit.triggerArea) next.triggerArea = normalizeTriggerArea(next, edit.triggerArea);
  if (JOURNEY_TRAP_DIRECTIONS.includes(edit.direction)) next.direction = edit.direction;
  if (Number.isFinite(edit.launcherX)) next.launcherX = Math.round(edit.launcherX);
  if (Number.isFinite(edit.launcherY)) next.launcherY = Math.round(edit.launcherY);

  const finalTrap = normalizeJourneyTrap(next);
  if (wasLegacyHazard && !edit.type) delete finalTrap.type;
  if (trap.penalty && !edit.penalty) finalTrap.penalty = { ...trap.penalty };
  if (edit.penalty) finalTrap.penalty = { ...edit.penalty };
  return finalTrap;
};

export const createJourneyTrapPalette = () => Object.entries(JOURNEY_TRAP_TYPES).map(([type, defaults]) => ({
  key: `trap:${type}`,
  category: 'Trap',
  label: defaults.label,
  type,
  template: {
    type,
    width: defaults.width,
    height: defaults.height,
    damage: defaults.damage,
    reset: defaults.reset,
    cooldown: defaults.cooldown,
    depth: defaults.depth,
    triggerArea: { x: 0, y: 0, width: defaults.width, height: defaults.height },
    ...(defaults.direction ? { direction: defaults.direction } : {}),
    message: defaults.message,
    editorVisible: true,
  },
}));

export const createJourneyTrapFromPaletteItem = ({
  paletteItem = {},
  roomId,
  x,
  y,
  existingIds = [],
} = {}) => {
  const template = { ...(paletteItem.template || paletteItem) };
  const type = JOURNEY_TRAP_TYPES[template.type] ? template.type : DEFAULT_TRAP_TYPE;
  const idBase = `${toIdSegment(roomId || 'room')}-${toIdSegment(type)}`;
  const roomKey = roomId || 'unknown-room';
  const trap = normalizeJourneyTrap({
    ...template,
    id: makeUniqueId(`${idBase}-1`, existingIds),
    roomId: roomKey,
    x: Math.round(finiteNumber(x, 0)),
    y: Math.round(finiteNumber(y, 0)),
    label: (paletteItem.label || JOURNEY_TRAP_TYPES[type].label).toLowerCase(),
  });
  if (roomKey && roomKey !== 'exterior' && roomKey.includes('chamber')) {
    delete trap.sectionId;
    trap.sceneId = roomKey;
  } else {
    trap.sectionId = roomKey;
    delete trap.sceneId;
  }
  trap.roomId = roomKey;
  trap.triggerArea = normalizeTriggerArea(trap, template.triggerArea);
  return trap;
};

const createDartProjectile = (trap) => {
  const horizontal = trap.direction === 'left' || trap.direction === 'right';
  const sign = trap.direction === 'left' || trap.direction === 'up' ? -1 : 1;
  const width = horizontal ? DART_SIZE.width : DART_SIZE.height;
  const height = horizontal ? DART_SIZE.height : DART_SIZE.width;
  return {
    id: `${trap.id}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    trapId: trap.id,
    x: trap.launcherX - width / 2,
    y: trap.launcherY - height / 2,
    width,
    height,
    vx: horizontal ? DART_SPEED * sign : 0,
    vy: horizontal ? 0 : DART_SPEED * sign,
    direction: trap.direction,
    damage: trap.damage,
    ttl: 2.4,
  };
};

export const updateJourneyTrapRuntime = ({
  trap,
  runtime = {},
  triggered = false,
  dt = 0,
} = {}) => {
  const normalized = normalizeJourneyTrap(trap);
  runtime.phase ??= 'armed';
  runtime.timer = Math.max(0, finiteNumber(runtime.timer, 0) - Math.max(0, dt));
  runtime.cooldown = Math.max(0, finiteNumber(runtime.cooldown, 0) - Math.max(0, dt));
  let projectile = null;

  if (normalized.type === 'collapsing-stone-floor') {
    if (runtime.phase === 'armed' && triggered) {
      runtime.phase = 'shaking';
      runtime.timer = COLLAPSE_SHAKE_SECONDS;
    } else if (runtime.phase === 'shaking' && runtime.timer <= 0) {
      runtime.phase = 'collapsed';
      runtime.timer = normalized.reset ? COLLAPSE_RESET_SECONDS : 0;
    } else if (runtime.phase === 'collapsed' && normalized.reset && runtime.timer <= 0) {
      runtime.phase = 'armed';
    }
    return {
      phase: runtime.phase,
      collidable: runtime.phase !== 'collapsed',
      projectile,
    };
  }

  if (normalized.type === 'hidden-sand-pit') {
    if (runtime.phase === 'armed' && triggered && runtime.cooldown <= 0) {
      runtime.phase = 'revealed';
      runtime.cooldown = normalized.cooldown;
      if (normalized.reset) runtime.timer = COLLAPSE_RESET_SECONDS;
    } else if (runtime.phase === 'revealed' && normalized.reset && runtime.timer <= 0) {
      runtime.phase = 'armed';
    }
    return {
      phase: runtime.phase,
      collidable: false,
      projectile,
    };
  }

  if (normalized.type === 'dart-launcher' && triggered && runtime.cooldown <= 0) {
    runtime.phase = 'armed';
    runtime.cooldown = normalized.cooldown;
    projectile = createDartProjectile(normalized);
  }

  return {
    phase: runtime.phase,
    collidable: false,
    projectile,
  };
};
