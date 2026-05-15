export const ENVIRONMENT_ATLAS_BASE_PATH = 'assets/expedition/environment/desert-temple/';
export const ENVIRONMENT_ATLAS_JSON = `${ENVIRONMENT_ATLAS_BASE_PATH}desert-temple-pack.json`;
export const CHINA_RIVER_VALLEY_ENVIRONMENT_ATLAS_BASE_PATH = 'assets/expedition/environment/china-river-valley/';
export const CHINA_RIVER_VALLEY_ENVIRONMENT_ATLAS_JSON = `${CHINA_RIVER_VALLEY_ENVIRONMENT_ATLAS_BASE_PATH}china-river-valley-environment-pack.json`;
export const ATLAS_TUNING_VERSION = 'environment-atlas-tuning-2026-05-10';
export const DESERT_VISUAL_TUNING_VERSION = 'desert-entry-final-visual-tuning-2026-05-10';
export const JOURNEY_ASSET_GROUNDING_VERSION = 'journey-asset-grounding-2026-05-11';

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

export const ENVIRONMENT_ASSET_PACK_IDS = {
  EGYPT_DESERT_TEMPLE: 'egypt-desert-temple',
  CHINA_RIVER_VALLEY: 'china-river-valley',
};

export const ENVIRONMENT_ASSET_PACKS = {
  [ENVIRONMENT_ASSET_PACK_IDS.EGYPT_DESERT_TEMPLE]: {
    id: ENVIRONMENT_ASSET_PACK_IDS.EGYPT_DESERT_TEMPLE,
    basePath: ENVIRONMENT_ATLAS_BASE_PATH,
    atlasPath: ENVIRONMENT_ATLAS_JSON,
    expectedKeys: EXPECTED_ENVIRONMENT_ASSET_KEYS,
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
    const drawY = y + (height - drawHeight) / 2;
    return drawRegionOnce(ctx, assets.image, region, region.x, region.y, region.w, region.h, drawX, drawY, drawWidth, drawHeight);
  }

  return drawRegionOnce(ctx, assets.image, region, region.x, region.y, region.w, region.h, x, y, width, height);
};

export const getEnvironmentAssetKeyForPlatform = (platform, sectionId, packId = DEFAULT_ENVIRONMENT_ASSET_PACK_ID) => {
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
    'spike-trap': 'spikeTrap',
    'temple-loose-step': 'spikeTrap',
    'temple-floor-crack': 'spikeTrap',
    'rolling-stones': 'fallingRocks',
    'dark-gap': 'darkPit',
    'catacomb-small-gap': 'darkPit',
    'catacomb-gap-2': 'darkPit',
    'falling-blocks': 'fallingRocks',
    'escape-cracked-step': 'fallingRocks',
    'temple-falling-chip': 'fallingRocks',
    'escape-falling-chip': 'fallingRocks',
    'dust-wave': 'softSand',
    'escape-dust-pocket': 'softSand',
    'catacomb-bat-pocket': 'darkPit',
    'loose-slope': 'collapsingFloor',
    'camp-low-rope': 'collapsingFloor',
    'dig-site-loose-rope': 'collapsingFloor',
    'dig-site-loose-slope-2': 'collapsingFloor',
  }[hazard.id] || 'collapsingFloor');
};

export const getEnvironmentAssetKeyForStoryProp = (prop, packId = DEFAULT_ENVIRONMENT_ASSET_PACK_ID) => {
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
    torch: 'torch',
    column: 'brokenColumn',
    bridge: 'brokenBridge',
    lights: 'lantern',
    banners: 'rope',
  }[prop.type] || null);
};
