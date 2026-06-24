import { drawAtlasRegion } from './journeyRenderAssets.js';

export const COLLECTIBLE_ATLAS_BASE_PATH = 'assets/expedition/collectibles/';
export const COLLECTIBLE_ATLAS_JSON = `${COLLECTIBLE_ATLAS_BASE_PATH}journey-collectibles-pack.json`;
export const COLLECTIBLE_SPRITE_ATLAS_VERSION = 'journey-collectibles-rome-section-one-2026-06-24';

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
  'linenMemoryFragment',
  'resinRiteFragment',
  'canopicNameFragment',
  'scarabWingFragment',
  'muralFaienceFragment',
  'muralPlasterFragment',
  'inkNameFragment',
  'witnessLineFragment',
  'royalRecordFragment',
  'romeSenateTablet',
  'romeLawTablet',
  'romeCaesarStatue',
  'romeAugustusCoin',
  'romeMilitaryStandard',
  'romeEmpireMap',
  'romeSplitEmpireTablet',
  'romeWaxTablet',
  'romeRomanCoin',
  'romeScrollBundle',
  'romeSandal',
  'romeGladiatorBrace',
  'romeLegionShield',
  'romeSenatorialRing',
  'romeArchiveKey',
  'romeTimelineSeal',
];

export const RELIC_SHARD_FRAGMENT_SPRITE_KEYS = [
  'linenMemoryFragment',
  'resinRiteFragment',
  'canopicNameFragment',
  'scarabWingFragment',
  'muralFaienceFragment',
  'muralPlasterFragment',
  'inkNameFragment',
  'witnessLineFragment',
  'royalRecordFragment',
  'romeSenateTablet',
  'romeLawTablet',
  'romeCaesarStatue',
  'romeAugustusCoin',
  'romeMilitaryStandard',
  'romeEmpireMap',
  'romeSplitEmpireTablet',
  'romeWaxTablet',
  'romeRomanCoin',
  'romeScrollBundle',
];

export const getRelicShardSpriteKey = (shard) => {
  if (RELIC_SHARD_FRAGMENT_SPRITE_KEYS.includes(shard?.spriteKey)) {
    return shard.spriteKey;
  }

  const seed = `${shard?.id || ''}:${Math.round(shard?.x || 0)}:${Math.round(shard?.y || 0)}`;
  const hash = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);
  return RELIC_SHARD_FRAGMENT_SPRITE_KEYS[hash % RELIC_SHARD_FRAGMENT_SPRITE_KEYS.length];
};

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
  'upgrade-roman-sandal': 'romeSandal',
  'upgrade-gladiator-brace': 'romeGladiatorBrace',
  'upgrade-legion-shield': 'romeLegionShield',
  'upgrade-senatorial-ring': 'romeSenatorialRing',
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
