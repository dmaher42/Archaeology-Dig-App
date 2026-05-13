import { drawAtlasRegion } from './journeyRenderAssets';

export const COLLECTIBLE_ATLAS_BASE_PATH = 'assets/expedition/collectibles/';
export const COLLECTIBLE_ATLAS_JSON = `${COLLECTIBLE_ATLAS_BASE_PATH}journey-collectibles-pack.json`;
export const COLLECTIBLE_SPRITE_ATLAS_VERSION = 'journey-collectibles-pack-2026-05-12';

export const EXPECTED_COLLECTIBLE_ASSET_KEYS = [
  'brush',
  'trowel',
  'notebook',
  'camera',
  'measuringTape',
  'fieldGuidePage',
  'relicShard',
  'mapTablet',
  'ancientSwitch',
  'glyphFragment',
  'escapeMarker',
  'loreTablet',
  'reinforcedBoots',
  'ropeLauncher',
  'torchUpgrade',
  'historianVision',
  'ancientCompass',
  'pickupSparkle',
  'collectedFlashRing',
  'lockedDimOverlay',
  'availableGlowRing',
  'objectiveHighlightRing',
];

export const createCollectibleSpriteState = () => ({
  image: null,
  atlas: null,
  loaded: false,
  ready: false,
  failed: false,
  error: null,
  atlasPath: COLLECTIBLE_ATLAS_JSON,
});

export const getMissingCollectibleSpriteAssets = (assets) => {
  const regions = assets?.atlas?.regions || {};
  return EXPECTED_COLLECTIBLE_ASSET_KEYS.filter(key => !regions[key]);
};

export const loadCollectibleSpritePack = ({ baseUrl = '/', onUpdate }) => {
  let cancelled = false;
  const atlasPath = `${baseUrl}${COLLECTIBLE_ATLAS_JSON}`;

  const fail = (error) => {
    if (cancelled) return;
    onUpdate?.({
      ...createCollectibleSpriteState(),
      failed: true,
      error: error?.message || 'Collectible sprite assets failed to load.',
      atlasPath: COLLECTIBLE_ATLAS_JSON,
    });
  };

  fetch(atlasPath)
    .then((response) => {
      if (!response.ok) throw new Error(`Collectible sprite atlas request failed: ${response.status}`);
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
          ready: getMissingCollectibleSpriteAssets({ atlas }).length === 0,
          failed: false,
          error: null,
          atlasPath: COLLECTIBLE_ATLAS_JSON,
        };
        onUpdate?.(next);
      };
      image.onerror = () => fail(new Error('Collectible sprite image failed to load.'));
      image.src = `${baseUrl}${COLLECTIBLE_ATLAS_BASE_PATH}${atlas.image}`;
    })
    .catch(fail);

  return () => {
    cancelled = true;
  };
};

export const getToolSpriteKey = (toolId) => ({
  brush: 'brush',
  trowel: 'trowel',
  notebook: 'notebook',
  camera: 'camera',
  'measuring-tape': 'measuringTape',
  'field-guide-page': 'fieldGuidePage',
}[toolId] || null);

export const getUpgradeSpriteKey = (upgradeId) => ({
  'reinforced-boots': 'reinforcedBoots',
  'rope-launcher': 'ropeLauncher',
  'torch-upgrade': 'torchUpgrade',
  'historian-vision': 'historianVision',
  'ancient-compass': 'ancientCompass',
}[upgradeId] || null);

export const getObjectiveSpriteKey = (markerType) => ({
  'map-tablet': 'mapTablet',
  switch: 'ancientSwitch',
  glyph: 'glyphFragment',
  escape: 'escapeMarker',
}[markerType] || null);

export const drawCollectibleAtlasRegion = (ctx, assets, key, dest, options = {}) => (
  drawAtlasRegion(ctx, assets, key, dest, { mode: 'contain', ...options })
);
