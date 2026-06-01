import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const STORY_PROPS_SOURCE = 'src/components/expedition-journey/journeyLevelData.js';
const STORY_PROPS_DECLARATION = 'export const STORY_PROPS = [';
const PLATFORMS_DECLARATION = 'export const PLATFORMS = [';
const HAZARDS_DECLARATION = 'export const HAZARDS = [';
const CHECKPOINTS_DECLARATION = 'export const CHECKPOINTS = [';
const ROUTE_GATES_DECLARATION = 'export const ROUTE_GATES = [';
const ROUTE_GATE_DOORWAYS_DECLARATION = 'export const ROUTE_GATE_DOORWAYS = [';
const MINI_BOSSES_DECLARATION = 'export const MINI_BOSSES = [';

const isCliRun = () => {
  const currentFile = fileURLToPath(import.meta.url);
  return process.argv[1] && resolve(process.argv[1]) === currentFile;
};

const findExportedArray = (source, declaration) => {
  const declarationIndex = source.indexOf(declaration);
  if (declarationIndex < 0) {
    throw new Error(`Could not find ${declaration.replace('export const ', '').replace(' = [', '')} export.`);
  }
  const arrayStart = source.indexOf('[', declarationIndex);
  let depth = 0;
  for (let index = arrayStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        return {
          declarationIndex,
          arrayStart,
          arrayEnd: index,
          bodyStart: arrayStart + 1,
          bodyEnd: index,
        };
      }
    }
  }
  throw new Error(`Could not find the end of ${declaration.replace('export const ', '').replace(' = [', '')}.`);
};

const findStoryPropsArray = (source) => findExportedArray(source, STORY_PROPS_DECLARATION);

const findPlatformsArray = (source) => findExportedArray(source, PLATFORMS_DECLARATION);

const findHazardsArray = (source) => findExportedArray(source, HAZARDS_DECLARATION);

const findCheckpointsArray = (source) => findExportedArray(source, CHECKPOINTS_DECLARATION);

const findRouteGatesArray = (source) => findExportedArray(source, ROUTE_GATES_DECLARATION);

const findRouteGateDoorwaysArray = (source) => findExportedArray(source, ROUTE_GATE_DOORWAYS_DECLARATION);

const findMiniBossesArray = (source) => findExportedArray(source, MINI_BOSSES_DECLARATION);

const getPropIdFromLine = (line) => {
  const match = line.match(/\bid:\s*(['"])(.*?)\1/);
  return match?.[2] || null;
};

const jsKey = (key) => (/^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key));

const jsValue = (value) => {
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '0';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value === null) return 'null';
  return JSON.stringify(value);
};

const PROP_FIELD_ORDER = [
  'id',
  'sectionId',
  'sceneId',
  'type',
  'atmosphereAssetKey',
  'x',
  'y',
  'width',
  'height',
  'yOffset',
  'alpha',
  'depth',
  'layer',
  'zIndex',
  'scale',
  'rotation',
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
  'tint',
  'shadow',
  'dust',
  'bury',
  'label',
];

const PLATFORM_FIELD_ORDER = [
  'id',
  'sectionId',
  'sceneId',
  'x',
  'y',
  'width',
  'height',
  'invisible',
  'challengeId',
  'challengeFailY',
  'challengeFailMessage',
  'challengeComplete',
  'reactive',
  'routeId',
  'layer',
  'zIndex',
  'label',
];

const HAZARD_FIELD_ORDER = [
  'id',
  'sectionId',
  'sceneId',
  'name',
  'emoji',
  'type',
  'x',
  'y',
  'width',
  'height',
  'triggerArea',
  'damage',
  'reset',
  'cooldown',
  'depth',
  'direction',
  'launcherX',
  'launcherY',
  'linkedObjectIds',
  'editorVisible',
  'burial',
  'penalty',
  'message',
  'pushToStart',
  'revealedByScarabSeal',
  'routeId',
  'label',
];

const CHECKPOINT_FIELD_ORDER = [
  'id',
  'name',
  'x',
  'markerX',
  'y',
];

const ROUTE_GATE_FIELD_ORDER = [
  'id',
  'sectionId',
  'sceneId',
  'name',
  'x',
  'y',
  'width',
  'height',
  'message',
  'readyHint',
  'openMessage',
  'requires',
];

const ROUTE_GATE_DOORWAY_FIELD_ORDER = [
  'id',
  'gateIds',
  'anchorX',
  'blockX',
  'y',
  'width',
  'height',
  'opening',
  'slab',
  'label',
];

const MINI_BOSS_FIELD_ORDER = [
  'id',
  'sectionId',
  'name',
  'type',
  'spriteBossId',
  'x',
  'y',
  'width',
  'height',
  'lairX',
  'lairY',
  'lairWidth',
  'lairHeight',
  'patrolMin',
  'patrolMax',
  'speed',
  'health',
  'damage',
  'shards',
  'intro',
  'dialogue',
  'domainName',
  'arenaStart',
  'arenaEnd',
];

const formatJourneyObject = (item, fieldOrder) => {
  const orderedKeys = [
    ...fieldOrder.filter(key => Object.prototype.hasOwnProperty.call(item, key)),
    ...Object.keys(item).filter(key => !fieldOrder.includes(key)),
  ];
  return `{ ${orderedKeys.map(key => `${jsKey(key)}: ${jsValue(item[key])}`).join(', ')} }`;
};

export const formatJourneyPropObject = (prop) => formatJourneyObject(prop, PROP_FIELD_ORDER);

export const formatJourneyPlatformObject = (platform) => formatJourneyObject(platform, PLATFORM_FIELD_ORDER);

export const formatJourneyHazardObject = (hazard) => formatJourneyObject(hazard, HAZARD_FIELD_ORDER);

export const formatJourneyCheckpointObject = (checkpoint) => formatJourneyObject(checkpoint, CHECKPOINT_FIELD_ORDER);

export const formatJourneyRouteGateObject = (gate) => formatJourneyObject(gate, ROUTE_GATE_FIELD_ORDER);

export const formatJourneyRouteGateDoorwayObject = (doorway) => formatJourneyObject(doorway, ROUTE_GATE_DOORWAY_FIELD_ORDER);

export const formatJourneyMiniBossObject = (boss) => formatJourneyObject(boss, MINI_BOSS_FIELD_ORDER);

const applyJourneyExportItemsToSource = ({
  source,
  exportItems,
  deletedIds,
  findArray,
  formatItem,
}) => {
  const exportedById = new Map(exportItems
    .filter(item => item?.id)
    .map(item => [item.id, item]));
  const seenIds = new Set();
  const bounds = findArray(source);
  const before = source.slice(0, bounds.bodyStart);
  const body = source.slice(bounds.bodyStart, bounds.bodyEnd);
  const after = source.slice(bounds.bodyEnd);
  const lines = body.split(/\r?\n/);
  const nextLines = [];

  lines.forEach((line) => {
    const propId = getPropIdFromLine(line);
    if (!propId) {
      nextLines.push(line);
      return;
    }
    if (deletedIds.has(propId)) return;
    if (exportedById.has(propId)) {
      nextLines.push(`  ${formatItem(exportedById.get(propId))},`);
      seenIds.add(propId);
      return;
    }
    nextLines.push(line);
    seenIds.add(propId);
  });

  const insertIndex = Math.max(0, nextLines.findLastIndex(line => line.trim().length > 0) + 1);
  const additions = exportItems
    .filter(item => item?.id && !deletedIds.has(item.id) && !seenIds.has(item.id))
    .map(item => `  ${formatItem(item)},`);

  if (additions.length) {
    nextLines.splice(insertIndex, 0, ...additions);
  }

  return `${before}${nextLines.join('\n')}${after}`;
};

export const applyJourneyPropExportToSource = (source, exportData) => {
  const exportedMiniBosses = Array.isArray(exportData?.miniBosses) ? exportData.miniBosses : [];
  const sourceWithMiniBosses = exportedMiniBosses.length
    ? applyJourneyExportItemsToSource({
      source,
      exportItems: exportedMiniBosses,
      deletedIds: new Set(),
      findArray: findMiniBossesArray,
      formatItem: formatJourneyMiniBossObject,
    })
    : source;

  const exportedCheckpoints = Array.isArray(exportData?.checkpoints) ? exportData.checkpoints : [];
  const sourceWithCheckpoints = exportedCheckpoints.length
    ? applyJourneyExportItemsToSource({
      source: sourceWithMiniBosses,
      exportItems: exportedCheckpoints,
      deletedIds: new Set(),
      findArray: findCheckpointsArray,
      formatItem: formatJourneyCheckpointObject,
    })
    : sourceWithMiniBosses;

  const exportedRouteGates = Array.isArray(exportData?.routeGates) ? exportData.routeGates : [];
  const sourceWithRouteGates = exportedRouteGates.length
    ? applyJourneyExportItemsToSource({
      source: sourceWithCheckpoints,
      exportItems: exportedRouteGates,
      deletedIds: new Set(),
      findArray: findRouteGatesArray,
      formatItem: formatJourneyRouteGateObject,
    })
    : sourceWithCheckpoints;

  const exportedRouteGateDoorways = Array.isArray(exportData?.routeGateDoorways) ? exportData.routeGateDoorways : [];
  const sourceWithRouteGateDoorways = exportedRouteGateDoorways.length
    ? applyJourneyExportItemsToSource({
      source: sourceWithRouteGates,
      exportItems: exportedRouteGateDoorways,
      deletedIds: new Set(),
      findArray: findRouteGateDoorwaysArray,
      formatItem: formatJourneyRouteGateDoorwayObject,
    })
    : sourceWithRouteGates;

  const exportedPlatforms = Array.isArray(exportData?.platforms) ? exportData.platforms : [];
  const deletedPlatformIds = new Set(Array.isArray(exportData?.deletedPlatformIds) ? exportData.deletedPlatformIds : []);
  const sourceWithPlatforms = exportedPlatforms.length || deletedPlatformIds.size
    ? applyJourneyExportItemsToSource({
      source: sourceWithRouteGateDoorways,
      exportItems: exportedPlatforms,
      deletedIds: deletedPlatformIds,
      findArray: findPlatformsArray,
      formatItem: formatJourneyPlatformObject,
    })
    : sourceWithRouteGateDoorways;

  const exportedHazards = Array.isArray(exportData?.hazards) ? exportData.hazards : [];
  const deletedHazardIds = new Set(Array.isArray(exportData?.deletedHazardIds) ? exportData.deletedHazardIds : []);
  const sourceWithHazards = exportedHazards.length || deletedHazardIds.size
    ? applyJourneyExportItemsToSource({
      source: sourceWithPlatforms,
      exportItems: exportedHazards,
      deletedIds: deletedHazardIds,
      findArray: findHazardsArray,
      formatItem: formatJourneyHazardObject,
    })
    : sourceWithPlatforms;

  const exportedProps = Array.isArray(exportData?.props) ? exportData.props : [];
  const deletedIds = new Set(Array.isArray(exportData?.deletedPropIds) ? exportData.deletedPropIds : []);
  return applyJourneyExportItemsToSource({
    source: sourceWithHazards,
    exportItems: exportedProps,
    deletedIds,
    findArray: findStoryPropsArray,
    formatItem: formatJourneyPropObject,
  });
};

const parseArgs = (argv) => {
  const args = {
    exportPath: null,
    sourcePath: STORY_PROPS_SOURCE,
    dryRun: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--source') {
      args.sourcePath = argv[index + 1] || args.sourcePath;
      index += 1;
    } else if (!args.exportPath) {
      args.exportPath = arg;
    }
  }
  return args;
};

export const runApplyJourneyPropExport = async (argv = process.argv.slice(2)) => {
  const args = parseArgs(argv);
  if (!args.exportPath) {
    throw new Error('Usage: node scripts/apply-journey-prop-export.mjs <export-json> [--source src/components/expedition-journey/journeyLevelData.js] [--dry-run]');
  }
  const exportPath = resolve(args.exportPath);
  const sourcePath = resolve(args.sourcePath);
  const exportData = JSON.parse(await readFile(exportPath, 'utf8'));
  const source = await readFile(sourcePath, 'utf8');
  const nextSource = applyJourneyPropExportToSource(source, exportData);
  if (!args.dryRun) {
    await writeFile(sourcePath, nextSource);
  }
  return {
    sourcePath,
    exportPath,
    dryRun: args.dryRun,
    propCount: Array.isArray(exportData.props) ? exportData.props.length : 0,
    deletedCount: Array.isArray(exportData.deletedPropIds) ? exportData.deletedPropIds.length : 0,
    platformCount: Array.isArray(exportData.platforms) ? exportData.platforms.length : 0,
    deletedPlatformCount: Array.isArray(exportData.deletedPlatformIds) ? exportData.deletedPlatformIds.length : 0,
    hazardCount: Array.isArray(exportData.hazards) ? exportData.hazards.length : 0,
    deletedHazardCount: Array.isArray(exportData.deletedHazardIds) ? exportData.deletedHazardIds.length : 0,
    routeGateCount: Array.isArray(exportData.routeGates) ? exportData.routeGates.length : 0,
    routeGateDoorwayCount: Array.isArray(exportData.routeGateDoorways) ? exportData.routeGateDoorways.length : 0,
    checkpointCount: Array.isArray(exportData.checkpoints) ? exportData.checkpoints.length : 0,
    miniBossCount: Array.isArray(exportData.miniBosses) ? exportData.miniBosses.length : 0,
  };
};

if (isCliRun()) {
  runApplyJourneyPropExport()
    .then(result => {
      console.log(`${result.dryRun ? 'Checked' : 'Applied'} ${result.propCount} exported prop(s), ${result.deletedCount} prop deletion(s), ${result.platformCount} platform(s), ${result.deletedPlatformCount} platform deletion(s), ${result.hazardCount} trap(s), ${result.deletedHazardCount} trap deletion(s), ${result.routeGateCount} arch gate(s), ${result.routeGateDoorwayCount} doorway arch(es), ${result.checkpointCount} checkpoint(s), ${result.miniBossCount} mini-boss/lair item(s).`);
      console.log(`Source: ${result.sourcePath}`);
    })
    .catch(error => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
