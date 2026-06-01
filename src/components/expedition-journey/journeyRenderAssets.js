export const ENVIRONMENT_ATLAS_BASE_PATH = 'assets/expedition/environment/desert-temple/';
export const ENVIRONMENT_ATLAS_JSON = `${ENVIRONMENT_ATLAS_BASE_PATH}desert-temple-pack.json`;
export const EGYPT_SACRED_TRAPS_ATLAS_JSON = `${ENVIRONMENT_ATLAS_BASE_PATH}egypt-sacred-traps-pack.json`;
export const MUMMIFICATION_CHAMBER_INTERACTIONS_ATLAS_BASE_PATH = 'assets/expedition/environment/desert-temple/mummification-chamber/';
export const MUMMIFICATION_CHAMBER_INTERACTIONS_ATLAS_JSON = `${MUMMIFICATION_CHAMBER_INTERACTIONS_ATLAS_BASE_PATH}mummification-chamber-interaction-atlas.json`;
export const EGYPT_ATMOSPHERE_ATLAS_BASE_PATH = 'assets/expedition/environment/egypt-atmosphere/';
export const EGYPT_ATMOSPHERE_ATLAS_JSON = `${EGYPT_ATMOSPHERE_ATLAS_BASE_PATH}egypt-atmosphere-pack.json`;
export const EGYPT_FOREGROUND_DEPTH_ATLAS_BASE_PATH = 'assets/expedition/environment/egypt-foreground/';
export const EGYPT_FOREGROUND_DEPTH_ATLAS_JSON = `${EGYPT_FOREGROUND_DEPTH_ATLAS_BASE_PATH}egypt-foreground-depth-pack.json`;
export const EGYPT_PREMIUM_GROUND_CONTACT_ATLAS_JSON = `${EGYPT_FOREGROUND_DEPTH_ATLAS_BASE_PATH}egypt-ground-contact-premium-kit-2026-06-02.json`;
export const CHINA_RIVER_VALLEY_ENVIRONMENT_ATLAS_BASE_PATH = 'assets/expedition/environment/china-river-valley/';
export const CHINA_RIVER_VALLEY_ENVIRONMENT_ATLAS_JSON = `${CHINA_RIVER_VALLEY_ENVIRONMENT_ATLAS_BASE_PATH}china-river-valley-environment-pack.json`;
export const ATLAS_TUNING_VERSION = 'environment-atlas-tuning-2026-05-10';
export const DESERT_VISUAL_TUNING_VERSION = 'desert-entry-final-visual-tuning-2026-05-10';
export const JOURNEY_ASSET_GROUNDING_VERSION = 'journey-asset-grounding-2026-05-11';
export const EGYPT_ATMOSPHERE_ASSET_VERSION = 'gemini-egypt-atmosphere-props-2026-05-21';
export const EGYPT_FOREGROUND_DEPTH_ASSET_VERSION = 'lost-site-foreground-depth-contact-pack-2026-06-01';
export const EGYPT_PREMIUM_GROUND_CONTACT_ASSET_VERSION = 'imagegen-premium-ground-contact-kit-2026-06-02';
export const MUMMIFICATION_CHAMBER_INTERACTIONS_ASSET_VERSION = 'imagegen-mummification-chamber-interaction-atlas-2026-05-28';

export const EXPECTED_ENVIRONMENT_ASSET_KEYS = [
  'groundSand',
  'groundCracked',
  'layeredSand',
  'templeFloor',
  'catacombFloor',
  'sandstoneBlock',
  'templeBlock',
  'woodenPlatform',
  'brokenBridge',
  'thornBush',
  'spikeTrap',
  'fallingRocks',
  'softSand',
  'collapsingFloor',
  'darkPit',
  'brokenColumn',
  'torch',
  'pottery',
  'rope',
  'lantern',
  'catStatue',
  'lionStatue',
  'sealedGate',
  'ancientSeal',
  'routeDoor',
];

export const EXPECTED_CHINA_RIVER_VALLEY_ENVIRONMENT_KEYS = [
  'riverbankGround',
  'rammedEarthGround',
  'packedClayGround',
  'stonePathFloor',
  'archiveFloor',
  'rammedEarthBlock',
  'timberPlatform',
  'bambooBridge',
  'brokenBridge',
  'reedPatch',
  'mudPit',
  'fallingRoofTiles',
  'looseEarth',
  'collapsingFloor',
  'darkPit',
  'watchtowerPost',
  'bronzeLamp',
  'jadeMarker',
  'oracleBoneShard',
  'archiveJar',
  'sealedTimberGate',
  'bronzeSeal',
  'routeDoor',
];

export const EXPECTED_EGYPT_SACRED_TRAP_ASSET_KEYS = [
  'guardianSealIdle',
  'guardianSealActivated',
  'sacredPedestalIdle',
  'sacredPedestalActivated',
];

export const EXPECTED_LOST_SITE_PROP_ASSET_KEYS = [
  'cracked_stone_blocks',
  'carved_wall_fragment',
  'broken_column',
  'fallen_lintel',
  'ruined_arch_piece',
  'stone_steps',
  'loose_floor_tiles',
  'collapsed_doorway_pieces',
  'numbered_evidence_markers',
  'wooden_crates',
  'excavation_brushes',
  'field_notebooks',
  'brass_lanterns',
  'coiled_ropes',
  'measuring_poles',
  'canvas_bags',
  'cataloguing_tags',
  'small_anubis_statue',
  'scarab_carving',
  'ram_statue_fragment',
  'canopic_jars',
  'shabti_figures',
  'offering_bowls',
  'incense_stands',
  'broken_shrine_pieces',
  'hieroglyphic_tablets',
  'scattered_bones',
  'broken_pottery',
  'torn_cloth',
  'old_baskets',
  'dried_reeds',
  'sand_piles',
  'rubble_mounds',
  'faded_murals',
  'cracked_warning_carvings',
  'cracked_floor_tile',
  'pressure_plate',
  'wall_dart_holes',
  'suspicious_sand_patch',
  'ceiling_crack',
  'rope_mechanism',
  'stone_counterweight',
  'scorpion_nest',
];

export const EXPECTED_MUMMIFICATION_CHAMBER_INTERACTION_ASSET_KEYS = [
  'embalmingTableMarker',
  'linenWrappings',
  'canopicJars',
  'ritualTablet',
  'oilsResins',
  'exitSeal',
];

export const EXPECTED_EGYPT_ATMOSPHERE_ASSET_KEYS = [
  'supplyJars',
  'fieldChest',
  'coinPile',
  'scrollCache',
  'torchStand',
  'stoneTablet',
  'rubbleScatter',
  'standingPillar',
  'brokenPillarTall',
  'fallenColumn',
  'pillarCaps',
  'desertEntryPremiumFallenColumn',
  'desertEntryPremiumPillarCaps',
  'desertEntryPremiumFieldChest',
  'desertEntryPremiumStorageJars',
  'desertEntryPremiumThresholdSlab',
  'rubbleDustSmall',
  'rubbleDustBurst',
  'fallingDebris',
  'stoneDoorFrame',
  'sealedWallPanel',
  'ankhSealPanel',
  ...EXPECTED_LOST_SITE_PROP_ASSET_KEYS,
];

export const EXPECTED_EGYPT_FOREGROUND_DEPTH_ASSET_KEYS = [
  'leftBrokenColumn',
  'rightBrokenColumn',
  'rubbleClusterLarge',
  'rubbleClusterSmall',
  'softSandDrift',
  'buriedCarvedHead',
  'damagedWallFragment',
  'dryShrub',
  'deadPalmRemnant',
  'edgePebbleScatter',
  'lowDustVeil',
  'ruinClusterWall',
  'ruinClusterColumnPair',
  'ruinDoorwayArch',
  'egyptGroundSkirtLong',
  'egyptGroundSkirtShort',
  'egyptBaseSandDrift',
  'egyptRubbleContactShadow',
  'egyptBuriedStoneEdge',
  'egyptStructureBaseRubble',
];

export const EXPECTED_EGYPT_PREMIUM_GROUND_CONTACT_ASSET_KEYS = [
  'premiumLongSandLip',
  'premiumShortSandLip',
  'premiumDoorThresholdBuildup',
  'premiumBrokenMasonryFooting',
  'premiumRubbleContactShadow',
  'premiumHalfBuriedStairSupport',
  'premiumCarvedStoneEdge',
  'premiumSmallStoneScatter',
  'premiumLowSedimentRibbon',
  'premiumRubbleMoundBlend',
];

export const ENVIRONMENT_ASSET_PACK_IDS = {
  EGYPT_DESERT_TEMPLE: 'egypt-desert-temple',
  EGYPT_SACRED_TRAPS: 'egypt-sacred-traps',
  MUMMIFICATION_CHAMBER_INTERACTIONS: 'mummification-chamber-interactions',
  EGYPT_ATMOSPHERE: 'egypt-atmosphere',
  EGYPT_FOREGROUND_DEPTH: 'egypt-foreground-depth',
  EGYPT_PREMIUM_GROUND_CONTACT: 'egypt-premium-ground-contact',
  CHINA_RIVER_VALLEY: 'china-river-valley',
};

export const ENVIRONMENT_ASSET_PACKS = {
  [ENVIRONMENT_ASSET_PACK_IDS.EGYPT_DESERT_TEMPLE]: {
    id: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_DESERT_TEMPLE,
    basePath: ENVIRONMENT_ATLAS_BASE_PATH,
    atlasPath: ENVIRONMENT_ATLAS_JSON,
    expectedKeys: EXPECTED_ENVIRONMENT_ASSET_KEYS,
  },
  [ENVIRONMENT_ASSET_PACK_IDS.EGYPT_SACRED_TRAPS]: {
    id: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_SACRED_TRAPS,
    basePath: ENVIRONMENT_ATLAS_BASE_PATH,
    atlasPath: EGYPT_SACRED_TRAPS_ATLAS_JSON,
    expectedKeys: EXPECTED_EGYPT_SACRED_TRAP_ASSET_KEYS,
  },
  [ENVIRONMENT_ASSET_PACK_IDS.MUMMIFICATION_CHAMBER_INTERACTIONS]: {
    id: ENVIRONMENT_ASSET_PACK_IDS.MUMMIFICATION_CHAMBER_INTERACTIONS,
    basePath: MUMMIFICATION_CHAMBER_INTERACTIONS_ATLAS_BASE_PATH,
    atlasPath: MUMMIFICATION_CHAMBER_INTERACTIONS_ATLAS_JSON,
    expectedKeys: EXPECTED_MUMMIFICATION_CHAMBER_INTERACTION_ASSET_KEYS,
  },
  [ENVIRONMENT_ASSET_PACK_IDS.EGYPT_ATMOSPHERE]: {
    id: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_ATMOSPHERE,
    basePath: EGYPT_ATMOSPHERE_ATLAS_BASE_PATH,
    atlasPath: EGYPT_ATMOSPHERE_ATLAS_JSON,
    expectedKeys: EXPECTED_EGYPT_ATMOSPHERE_ASSET_KEYS,
  },
  [ENVIRONMENT_ASSET_PACK_IDS.EGYPT_FOREGROUND_DEPTH]: {
    id: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_FOREGROUND_DEPTH,
    basePath: EGYPT_FOREGROUND_DEPTH_ATLAS_BASE_PATH,
    atlasPath: EGYPT_FOREGROUND_DEPTH_ATLAS_JSON,
    expectedKeys: EXPECTED_EGYPT_FOREGROUND_DEPTH_ASSET_KEYS,
  },
  [ENVIRONMENT_ASSET_PACK_IDS.EGYPT_PREMIUM_GROUND_CONTACT]: {
    id: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_PREMIUM_GROUND_CONTACT,
    basePath: EGYPT_FOREGROUND_DEPTH_ATLAS_BASE_PATH,
    atlasPath: EGYPT_PREMIUM_GROUND_CONTACT_ATLAS_JSON,
    expectedKeys: EXPECTED_EGYPT_PREMIUM_GROUND_CONTACT_ASSET_KEYS,
  },
  [ENVIRONMENT_ASSET_PACK_IDS.CHINA_RIVER_VALLEY]: {
    id: ENVIRONMENT_ASSET_PACK_IDS.CHINA_RIVER_VALLEY,
    basePath: CHINA_RIVER_VALLEY_ENVIRONMENT_ATLAS_BASE_PATH,
    atlasPath: CHINA_RIVER_VALLEY_ENVIRONMENT_ATLAS_JSON,
    expectedKeys: EXPECTED_CHINA_RIVER_VALLEY_ENVIRONMENT_KEYS,
  },
};

export const DEFAULT_ENVIRONMENT_ASSET_PACK_ID = ENVIRONMENT_ASSET_PACK_IDS.EGYPT_DESERT_TEMPLE;

export const getEnvironmentAssetPackConfig = (packId = DEFAULT_ENVIRONMENT_ASSET_PACK_ID) => (
  ENVIRONMENT_ASSET_PACKS[packId] || ENVIRONMENT_ASSET_PACKS[DEFAULT_ENVIRONMENT_ASSET_PACK_ID]
);

export const createEnvironmentAssetState = (packId = DEFAULT_ENVIRONMENT_ASSET_PACK_ID) => {
  const packConfig = getEnvironmentAssetPackConfig(packId);
  return {
    image: null,
    atlas: null,
    loaded: false,
    ready: false,
    failed: false,
    error: null,
    packId: packConfig.id,
    expectedKeys: packConfig.expectedKeys,
    atlasPath: packConfig.atlasPath,
  };
};

export const getMissingEnvironmentAssets = (assets) => {
  const regions = assets?.atlas?.regions || {};
  const expectedKeys = assets?.expectedKeys
    || getEnvironmentAssetPackConfig(assets?.packId).expectedKeys
    || EXPECTED_ENVIRONMENT_ASSET_KEYS;
  return expectedKeys.filter(key => !regions[key]);
};

export const loadEnvironmentAssetPack = ({ baseUrl = '/', onUpdate, packId = DEFAULT_ENVIRONMENT_ASSET_PACK_ID }) => {
  let cancelled = false;
  const packConfig = getEnvironmentAssetPackConfig(packId);
  const atlasPath = `${baseUrl}${packConfig.atlasPath}`;

  const fail = (error) => {
    if (cancelled) return;
    onUpdate?.({
      ...createEnvironmentAssetState(packConfig.id),
      failed: true,
      error: error?.message || 'Environment assets failed to load.',
      atlasPath: packConfig.atlasPath,
    });
  };

  fetch(atlasPath)
    .then((response) => {
      if (!response.ok) throw new Error(`Environment atlas request failed: ${response.status}`);
      return response.json();
    })
    .then((atlas) => {
      if (cancelled) return;
      const image = new Image();
      image.onload = () => {
        if (cancelled) return;
        const next = {
          image,
          atlas,
          loaded: true,
          ready: getMissingEnvironmentAssets({ atlas, expectedKeys: packConfig.expectedKeys }).length === 0,
          failed: false,
          error: null,
          packId: packConfig.id,
          expectedKeys: packConfig.expectedKeys,
          atlasPath: packConfig.atlasPath,
        };
        onUpdate?.(next);
      };
      image.onerror = () => fail(new Error('Environment atlas image failed to load.'));
      image.src = `${baseUrl}${packConfig.basePath}${atlas.image}`;
    })
    .catch(fail);

  return () => {
    cancelled = true;
  };
};

const getRegion = (assets, key) => assets?.atlas?.regions?.[key] || null;

const drawRegionOnce = (ctx, image, region, sx, sy, sw, sh, dx, dy, dw, dh) => {
  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
  return true;
};

export const drawAtlasRegion = (ctx, assets, key, dest, options = {}) => {
  if (!assets?.loaded || !assets.image) return false;
  const region = getRegion(assets, key);
  if (!region) return false;

  const { x, y, width, height } = dest;
  const mode = options.mode || 'stretch';
  if (width <= 0 || height <= 0) return false;

  if (mode === 'tileX') {
    const inset = options.sourceInset ?? 8;
    const overlap = options.overlap ?? 1.5;
    const sourceX = region.x + inset;
    const sourceY = region.y + (options.sourceInsetY ?? 0);
    const sourceWidthBase = Math.max(12, region.w - inset * 2);
    const sourceHeight = Math.max(12, region.h - (options.sourceInsetY ?? 0));
    const tileWidth = Math.max(16, Math.round(height * (sourceWidthBase / sourceHeight) * (options.tileScale ?? 1)));
    for (let dx = x; dx < x + width; dx += tileWidth - overlap) {
      const visibleWidth = Math.min(tileWidth, x + width - dx);
      const sourceWidth = sourceWidthBase * (visibleWidth / tileWidth);
      drawRegionOnce(ctx, assets.image, region, sourceX, sourceY, sourceWidth, sourceHeight, dx, y, visibleWidth + overlap, height);
    }
    return true;
  }

  if (mode === 'contain' || mode === 'cover') {
    const sourceRatio = region.w / region.h;
    const destRatio = width / height;
    const useWidth = mode === 'contain'
      ? destRatio < sourceRatio
      : destRatio > sourceRatio;
    const drawWidth = useWidth ? width : height * sourceRatio;
    const drawHeight = useWidth ? width / sourceRatio : height;
    const drawX = x + (width - drawWidth) / 2;
    const drawY = options.alignY === 'bottom'
      ? y + height - drawHeight
      : y + (height - drawHeight) / 2;
    return drawRegionOnce(ctx, assets.image, region, region.x, region.y, region.w, region.h, drawX, drawY, drawWidth, drawHeight);
  }

  return drawRegionOnce(ctx, assets.image, region, region.x, region.y, region.w, region.h, x, y, width, height);
};

export const getEnvironmentAssetKeyForPlatform = (platform, sectionId, packId = DEFAULT_ENVIRONMENT_ASSET_PACK_ID) => {
  if (platform.assetKey) return platform.assetKey;
  if (packId === ENVIRONMENT_ASSET_PACK_IDS.CHINA_RIVER_VALLEY) {
    if (platform.label?.includes('bridge')) return 'bambooBridge';
    if (platform.label?.includes('archive')) return 'archiveFloor';
    if (platform.label?.includes('plinth') || platform.label?.includes('step')) return 'rammedEarthBlock';
    if (platform.label?.includes('ledge') || platform.label?.includes('shelf')) return 'timberPlatform';
    if (sectionId === 'catacombs') return 'packedClayGround';
    if (sectionId === 'ruined-temple') return platform.y >= 350 ? 'stonePathFloor' : 'rammedEarthBlock';
    if (sectionId === 'escape-sequence') return platform.y >= 350 ? 'rammedEarthGround' : 'collapsingFloor';
    if (sectionId === 'dig-site-entrance') return platform.y >= 350 ? 'rammedEarthGround' : 'stonePathFloor';
    return platform.y >= 350 ? 'riverbankGround' : 'timberPlatform';
  }
  if (platform.label?.includes('bridge')) return 'brokenBridge';
  if (sectionId === 'desert-entry' && platform.y < 350) return 'sandstoneBlock';
  if (platform.label?.includes('ledge') || platform.label?.includes('shelf')) return 'woodenPlatform';
  if (platform.label?.includes('plinth') || platform.label?.includes('step')) return 'sandstoneBlock';
  if (sectionId === 'catacombs') return 'catacombFloor';
  if (sectionId === 'ruined-temple') return platform.y >= 350 ? 'templeFloor' : 'templeBlock';
  if (sectionId === 'escape-sequence') return platform.y >= 350 ? 'groundCracked' : 'collapsingFloor';
  if (sectionId === 'dig-site-entrance') return platform.y >= 350 ? 'sandstoneBlock' : 'templeFloor';
  return platform.y >= 350 ? 'groundSand' : 'sandstoneBlock';
};

export const getEnvironmentAssetKeyForHazard = (hazard, packId = DEFAULT_ENVIRONMENT_ASSET_PACK_ID) => {
  if (packId === ENVIRONMENT_ASSET_PACK_IDS.CHINA_RIVER_VALLEY) {
    return ({
      'thorn-bush': 'reedPatch',
      'desert-low-thorns': 'reedPatch',
      'sand-pit': 'mudPit',
      'desert-low-ridge': 'looseEarth',
      'desert-soft-ridge': 'looseEarth',
      'opening-seal-reset-trap': 'mudPit',
      'entry-pressure-plate': 'mudPit',
      'entry-cracked-floor-trap': 'looseEarth',
      'broken-ruins-loose-stones': 'fallingRoofTiles',
      'sandfall-warning-dust': 'looseEarth',
      'sandfall-collapsing-stones': 'fallingRoofTiles',
      'sandfall-soft-pit': 'mudPit',
      'temple-threshold-hairline-crack': 'looseEarth',
      'spike-trap': 'looseEarth',
      'temple-loose-step': 'looseEarth',
      'temple-floor-crack': 'looseEarth',
      'rolling-stones': 'fallingRoofTiles',
      'dark-gap': 'darkPit',
      'catacomb-small-gap': 'darkPit',
      'catacomb-gap-2': 'darkPit',
      'falling-blocks': 'fallingRoofTiles',
      'escape-cracked-step': 'fallingRoofTiles',
      'temple-falling-chip': 'fallingRoofTiles',
      'escape-falling-chip': 'fallingRoofTiles',
      'dust-wave': 'looseEarth',
      'escape-dust-pocket': 'looseEarth',
      'catacomb-bat-pocket': 'darkPit',
      'loose-slope': 'collapsingFloor',
      'camp-low-rope': 'collapsingFloor',
      'dig-site-loose-rope': 'collapsingFloor',
      'dig-site-loose-slope-2': 'collapsingFloor',
    }[hazard.id] || 'collapsingFloor');
  }
  return ({
  'thorn-bush': 'thornBush',
  'sand-pit': 'softSand',
    'desert-low-ridge': 'softSand',
    'desert-soft-ridge': 'softSand',
    'opening-seal-reset-trap': 'spikeTrap',
    'entry-pressure-plate': 'groundCracked',
    'entry-cracked-floor-trap': 'groundCracked',
    'broken-ruins-loose-stones': 'fallingRocks',
    'sandfall-warning-dust': 'softSand',
    'sandfall-collapsing-stones': 'fallingRocks',
    'sandfall-soft-pit': 'softSand',
    'temple-threshold-hairline-crack': 'groundCracked',
    'spike-trap': 'spikeTrap',
    'temple-loose-step': 'groundCracked',
    'temple-floor-crack': 'groundCracked',
    'rolling-stones': 'fallingRocks',
    'dark-gap': 'darkPit',
    'catacomb-small-gap': 'darkPit',
    'catacomb-gap-2': 'darkPit',
    'falling-blocks': 'fallingRocks',
    'escape-cracked-step': 'groundCracked',
    'temple-falling-chip': 'fallingRocks',
    'escape-falling-chip': 'fallingRocks',
    'dust-wave': 'softSand',
    'escape-dust-pocket': 'softSand',
    'catacomb-bat-pocket': 'darkPit',
    'loose-slope': 'collapsingFloor',
    'camp-low-rope': 'rope',
    'dig-site-loose-rope': 'rope',
    'dig-site-loose-slope-2': 'collapsingFloor',
  }[hazard.id] || 'collapsingFloor');
};

export const getEnvironmentAssetKeyForStoryProp = (prop, packId = DEFAULT_ENVIRONMENT_ASSET_PACK_ID) => {
  if (packId === ENVIRONMENT_ASSET_PACK_IDS.EGYPT_ATMOSPHERE) {
    return prop.atmosphereAssetKey || null;
  }
  if (packId === ENVIRONMENT_ASSET_PACK_IDS.EGYPT_SACRED_TRAPS) {
    return ({
      'sacred-pedestal': 'sacredPedestalIdle',
      'sacred-pedestal-activated': 'sacredPedestalActivated',
      'guardian-seal': 'guardianSealIdle',
      'guardian-seal-activated': 'guardianSealActivated',
    }[prop.type] || null);
  }
  if (packId === ENVIRONMENT_ASSET_PACK_IDS.CHINA_RIVER_VALLEY) {
    return ({
      ruins: 'watchtowerPost',
      camp: 'archiveJar',
      door: 'routeDoor',
      statue: 'jadeMarker',
      torch: 'bronzeLamp',
      glyphs: 'oracleBoneShard',
      column: 'watchtowerPost',
      bridge: 'bambooBridge',
      lights: 'bronzeLamp',
      banners: 'jadeMarker',
      sign: 'oracleBoneShard',
      mural: 'oracleBoneShard',
    }[prop.type] || null);
  }
  return ({
    ruins: 'brokenColumn',
    camp: 'pottery',
    door: 'routeDoor',
    statue: 'catStatue',
    'jackal-statue': 'lionStatue',
    'damaged-jackal-statue': 'lionStatue',
    torch: 'torch',
    column: 'brokenColumn',
    bridge: 'brokenBridge',
    lights: 'lantern',
    banners: 'rope',
    'survey-rope': 'rope',
  }[prop.type] || null);
};
