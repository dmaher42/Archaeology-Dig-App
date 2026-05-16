import { drawAtlasRegion } from './journeyRenderAssets';

export const MARKER_SPRITE_BASE_PATH = 'assets/expedition/markers/';
export const MARKER_SPRITE_ATLAS_JSON = `${MARKER_SPRITE_BASE_PATH}egypt-checkpoint-flag-sprites.json`;
export const MARKER_SPRITE_VERSION = 'egypt-checkpoint-hieroglyphic-flag-sprites-2026-05-17';

export const EXPECTED_MARKER_SPRITE_KEYS = [
  'checkpoint_00',
  'checkpoint_01',
  'checkpoint_02',
  'checkpoint_03',
  'flag_00',
  'flag_01',
  'flag_02',
  'flag_03',
  'flag_04',
  'flag_05',
];

export const createMarkerSpriteState = () => ({
  image: null,
  atlas: null,
  loaded: false,
  ready: false,
  failed: false,
  error: null,
  atlasPath: MARKER_SPRITE_ATLAS_JSON,
});

export const getMissingMarkerSpriteAssets = (assets) => {
  const regions = assets?.atlas?.regions || {};
  return EXPECTED_MARKER_SPRITE_KEYS.filter(key => !regions[key]);
};

export const loadMarkerSpritePack = ({ baseUrl = '/', onUpdate }) => {
  let cancelled = false;
  const atlasPath = `${baseUrl}${MARKER_SPRITE_ATLAS_JSON}`;

  const fail = (error) => {
    if (cancelled) return;
    onUpdate?.({
      ...createMarkerSpriteState(),
      failed: true,
      error: error?.message || 'Marker sprite assets failed to load.',
      atlasPath: MARKER_SPRITE_ATLAS_JSON,
    });
  };

  fetch(atlasPath)
    .then((response) => {
      if (!response.ok) throw new Error(`Marker sprite atlas request failed: ${response.status}`);
      return response.json();
    })
    .then((atlas) => {
      if (cancelled) return;
      const image = new Image();
      image.onload = () => {
        if (cancelled) return;
        onUpdate?.({
          image,
          atlas,
          loaded: true,
          ready: getMissingMarkerSpriteAssets({ atlas }).length === 0,
          failed: false,
          error: null,
          atlasPath: MARKER_SPRITE_ATLAS_JSON,
        });
      };
      image.onerror = () => fail(new Error('Marker sprite image failed to load.'));
      image.src = `${baseUrl}${MARKER_SPRITE_BASE_PATH}${atlas.image}`;
    })
    .catch(fail);

  return () => {
    cancelled = true;
  };
};

export const getMarkerAnimationFrameKey = (assets, animationName, now = 0) => {
  const animation = assets?.atlas?.animations?.[animationName];
  const frames = animation?.frames || [];
  if (frames.length === 0) return null;
  const frameDurationMs = Math.max(1, Number(animation.frameDurationMs) || 180);
  return frames[Math.floor(now / frameDurationMs) % frames.length];
};

export const drawMarkerSprite = (ctx, assets, animationName, dest, now = 0, options = {}) => {
  const frameKey = getMarkerAnimationFrameKey(assets, animationName, now);
  if (!frameKey) return false;
  return drawAtlasRegion(ctx, assets, frameKey, dest, { mode: 'contain', ...options });
};
