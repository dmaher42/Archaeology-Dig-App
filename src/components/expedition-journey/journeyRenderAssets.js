export const ENVIRONMENT_ATLAS_BASE_PATH = 'assets/expedition/environment/desert-temple/';
export const ENVIRONMENT_ATLAS_JSON = `${ENVIRONMENT_ATLAS_BASE_PATH}desert-temple-pack.json`;
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

export const createEnvironmentAssetState = () => ({
  image: null,
  atlas: null,
  loaded: false,
  ready: false,
  failed: false,
  error: null,
  atlasPath: ENVIRONMENT_ATLAS_JSON,
});

export const getMissingEnvironmentAssets = (assets) => {
  const regions = assets?.atlas?.regions || {};
  return EXPECTED_ENVIRONMENT_ASSET_KEYS.filter(key => !regions[key]);
};

export const loadEnvironmentAssetPack = ({ baseUrl = '/', onUpdate }) => {
  let cancelled = false;
  const atlasPath = `${baseUrl}${ENVIRONMENT_ATLAS_JSON}`;

  const fail = (error) => {
    if (cancelled) return;
    onUpdate?.({
      ...createEnvironmentAssetState(),
      failed: true,
      error: error?.message || 'Environment assets failed to load.',
      atlasPath: ENVIRONMENT_ATLAS_JSON,
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
          ready: getMissingEnvironmentAssets({ atlas }).length === 0,
          failed: false,
          error: null,
          atlasPath: ENVIRONMENT_ATLAS_JSON,
        };
        onUpdate?.(next);
      };
      image.onerror = () => fail(new Error('Environment atlas image failed to load.'));
      image.src = `${baseUrl}${ENVIRONMENT_ATLAS_BASE_PATH}${atlas.image}`;
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

export const getEnvironmentAssetKeyForPlatform = (platform, sectionId) => {
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

export const getEnvironmentAssetKeyForHazard = (hazard) => ({
  'thorn-bush': 'thornBush',
  'sand-pit': 'softSand',
  'spike-trap': 'spikeTrap',
  'rolling-stones': 'fallingRocks',
  'dark-gap': 'darkPit',
  'falling-blocks': 'fallingRocks',
  'dust-wave': 'softSand',
  'loose-slope': 'collapsingFloor',
}[hazard.id] || 'collapsingFloor');

export const getEnvironmentAssetKeyForStoryProp = (prop) => ({
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
