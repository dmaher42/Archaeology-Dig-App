import { drawAtlasRegion } from './journeyRenderAssets';
import {
  ROME_EXPECTED_PLAYER_WEAPON_ASSET_KEYS,
  ROME_PLAYER_WEAPON_ATLAS_JSON,
  ROME_PLAYER_WEAPON_ATLAS_VERSION,
} from './rome/romeConstants.js';

export const PLAYER_WEAPON_ATLAS_BASE_PATH = 'assets/expedition/player/';
export const PLAYER_WEAPON_ATLAS_JSON = `${PLAYER_WEAPON_ATLAS_BASE_PATH}khopesh-weapon-pack.json`;
export const PLAYER_WEAPON_ATLAS_VERSION = 'khopesh-weapon-pack-2026-05-12';

export const EXPECTED_PLAYER_WEAPON_ASSET_KEYS = [
  'khopeshIdle',
  'khopeshWindup',
  'khopeshSwing',
  'khopeshReady',
];

export const PLAYER_WEAPON_PACKS = {
  khopesh: {
    atlasPath: PLAYER_WEAPON_ATLAS_JSON,
    version: PLAYER_WEAPON_ATLAS_VERSION,
    expectedKeys: EXPECTED_PLAYER_WEAPON_ASSET_KEYS,
  },
  gladius: {
    atlasPath: ROME_PLAYER_WEAPON_ATLAS_JSON,
    version: ROME_PLAYER_WEAPON_ATLAS_VERSION,
    expectedKeys: ROME_EXPECTED_PLAYER_WEAPON_ASSET_KEYS,
  },
};

const getPlayerWeaponPackConfig = (weaponId = 'khopesh') => PLAYER_WEAPON_PACKS[weaponId] || PLAYER_WEAPON_PACKS.khopesh;

const getAtlasImagePath = (atlasPath, imageName) => {
  if (!imageName) return null;
  if (imageName.startsWith('/') || imageName.startsWith('assets/')) return imageName;
  const atlasDir = atlasPath.includes('/') ? atlasPath.slice(0, atlasPath.lastIndexOf('/') + 1) : PLAYER_WEAPON_ATLAS_BASE_PATH;
  return `${atlasDir}${imageName}`;
};

export const createPlayerWeaponSpriteState = (weaponId = 'khopesh') => ({
  image: null,
  atlas: null,
  loaded: false,
  ready: false,
  failed: false,
  error: null,
  weaponId,
  atlasPath: getPlayerWeaponPackConfig(weaponId).atlasPath,
  version: getPlayerWeaponPackConfig(weaponId).version,
  expectedKeys: getPlayerWeaponPackConfig(weaponId).expectedKeys,
});

export const getMissingPlayerWeaponSpriteAssets = (assets) => {
  const regions = assets?.atlas?.regions || {};
  const expectedKeys = assets?.expectedKeys || EXPECTED_PLAYER_WEAPON_ASSET_KEYS;
  return expectedKeys.filter(key => !regions[key]);
};

export const loadPlayerWeaponSpritePack = ({ baseUrl = '/', onUpdate, weaponId = 'khopesh' }) => {
  let cancelled = false;
  const packConfig = getPlayerWeaponPackConfig(weaponId);
  const atlasPath = `${baseUrl}${packConfig.atlasPath}`;

  const fail = (error) => {
    if (cancelled) return;
    onUpdate?.({
      ...createPlayerWeaponSpriteState(weaponId),
      failed: true,
      error: error?.message || 'Player weapon sprite assets failed to load.',
      atlasPath: packConfig.atlasPath,
    });
  };

  fetch(atlasPath)
    .then((response) => {
      if (!response.ok) throw new Error(`Player weapon atlas request failed: ${response.status}`);
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
          ready: getMissingPlayerWeaponSpriteAssets({ atlas, expectedKeys: packConfig.expectedKeys }).length === 0,
          failed: false,
          error: null,
          weaponId,
          atlasPath: packConfig.atlasPath,
          version: packConfig.version,
          expectedKeys: packConfig.expectedKeys,
        };
        onUpdate?.(next);
      };
      image.onerror = () => fail(new Error('Player weapon image failed to load.'));
      image.src = `${baseUrl}${getAtlasImagePath(packConfig.atlasPath, atlas.image)}`;
    })
    .catch(fail);

  return () => {
    cancelled = true;
  };
};

export const getPlayerWeaponFrameKey = (attackState, weaponId = 'khopesh') => {
  if (weaponId === 'gladius') {
    if (attackState === 'windup') return 'gladiusWindup';
    if (attackState === 'swing') return 'gladiusSwing';
    if (attackState === 'recoil') return 'gladiusReady';
    return 'gladiusIdle';
  }
  if (attackState === 'windup') return 'khopeshWindup';
  if (attackState === 'swing') return 'khopeshSwing';
  if (attackState === 'recoil') return 'khopeshReady';
  return 'khopeshIdle';
};

export const drawPlayerWeaponAtlasRegion = (ctx, assets, key, dest, options = {}) => (
  drawAtlasRegion(ctx, assets, key, dest, { mode: 'contain', ...options })
);
