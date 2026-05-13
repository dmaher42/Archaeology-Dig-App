import { drawAtlasRegion } from './journeyRenderAssets';

export const PLAYER_WEAPON_ATLAS_BASE_PATH = 'assets/expedition/player/';
export const PLAYER_WEAPON_ATLAS_JSON = `${PLAYER_WEAPON_ATLAS_BASE_PATH}khopesh-weapon-pack.json`;
export const PLAYER_WEAPON_ATLAS_VERSION = 'khopesh-weapon-pack-2026-05-12';

export const EXPECTED_PLAYER_WEAPON_ASSET_KEYS = [
  'khopeshIdle',
  'khopeshWindup',
  'khopeshSwing',
  'khopeshReady',
];

export const createPlayerWeaponSpriteState = () => ({
  image: null,
  atlas: null,
  loaded: false,
  ready: false,
  failed: false,
  error: null,
  atlasPath: PLAYER_WEAPON_ATLAS_JSON,
});

export const getMissingPlayerWeaponSpriteAssets = (assets) => {
  const regions = assets?.atlas?.regions || {};
  return EXPECTED_PLAYER_WEAPON_ASSET_KEYS.filter(key => !regions[key]);
};

export const loadPlayerWeaponSpritePack = ({ baseUrl = '/', onUpdate }) => {
  let cancelled = false;
  const atlasPath = `${baseUrl}${PLAYER_WEAPON_ATLAS_JSON}`;

  const fail = (error) => {
    if (cancelled) return;
    onUpdate?.({
      ...createPlayerWeaponSpriteState(),
      failed: true,
      error: error?.message || 'Player weapon sprite assets failed to load.',
      atlasPath: PLAYER_WEAPON_ATLAS_JSON,
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
          ready: getMissingPlayerWeaponSpriteAssets({ atlas }).length === 0,
          failed: false,
          error: null,
          atlasPath: PLAYER_WEAPON_ATLAS_JSON,
        };
        onUpdate?.(next);
      };
      image.onerror = () => fail(new Error('Player weapon image failed to load.'));
      image.src = `${baseUrl}${PLAYER_WEAPON_ATLAS_BASE_PATH}${atlas.image}`;
    })
    .catch(fail);

  return () => {
    cancelled = true;
  };
};

export const getPlayerWeaponFrameKey = (attackState) => {
  if (attackState === 'windup') return 'khopeshWindup';
  if (attackState === 'swing') return 'khopeshSwing';
  if (attackState === 'recoil') return 'khopeshReady';
  return 'khopeshIdle';
};

export const drawPlayerWeaponAtlasRegion = (ctx, assets, key, dest, options = {}) => (
  drawAtlasRegion(ctx, assets, key, dest, { mode: 'contain', ...options })
);
