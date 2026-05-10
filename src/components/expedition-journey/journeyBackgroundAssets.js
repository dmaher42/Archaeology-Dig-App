export const DESERT_BACKGROUND_ATLAS_BASE_PATH = 'assets/expedition/backgrounds/desert-entry/';
export const DESERT_BACKGROUND_ATLAS_JSON = `${DESERT_BACKGROUND_ATLAS_BASE_PATH}desert-entry-parallax-pack.json`;

export const EXPECTED_DESERT_BACKGROUND_KEYS = [
  'sky',
  'farDunes',
  'distantRuins',
  'midgroundRuins',
  'foregroundAtmosphere',
];

export const DESERT_BACKGROUND_DEPTH_MODE = 'desert-entry-parallax-v1';

export const createDesertBackgroundAssetState = () => ({
  image: null,
  atlas: null,
  loaded: false,
  ready: false,
  failed: false,
  error: null,
  atlasPath: DESERT_BACKGROUND_ATLAS_JSON,
});

export const getMissingDesertBackgroundAssets = (assets) => {
  const regions = assets?.atlas?.regions || {};
  return EXPECTED_DESERT_BACKGROUND_KEYS.filter(key => !regions[key]);
};

export const loadDesertBackgroundAssetPack = ({ baseUrl = '/', onUpdate }) => {
  let cancelled = false;
  const atlasPath = `${baseUrl}${DESERT_BACKGROUND_ATLAS_JSON}`;

  const fail = (error) => {
    if (cancelled) return;
    onUpdate?.({
      ...createDesertBackgroundAssetState(),
      failed: true,
      error: error?.message || 'Desert background assets failed to load.',
      atlasPath: DESERT_BACKGROUND_ATLAS_JSON,
    });
  };

  fetch(atlasPath)
    .then((response) => {
      if (!response.ok) throw new Error(`Desert background atlas request failed: ${response.status}`);
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
          ready: getMissingDesertBackgroundAssets({ atlas }).length === 0,
          failed: false,
          error: null,
          atlasPath: DESERT_BACKGROUND_ATLAS_JSON,
        });
      };
      image.onerror = () => fail(new Error('Desert background image failed to load.'));
      image.src = `${baseUrl}${DESERT_BACKGROUND_ATLAS_BASE_PATH}${atlas.image}`;
    })
    .catch(fail);

  return () => {
    cancelled = true;
  };
};

const getRegion = (assets, key) => assets?.atlas?.regions?.[key] || null;

export const drawDesertBackgroundLayer = (ctx, assets, key, dest, options = {}) => {
  if (!assets?.loaded || !assets.image) return false;
  const region = getRegion(assets, key);
  if (!region) return false;

  const {
    canvasWidth,
    cameraX = 0,
    parallax = 0,
    alpha = 1,
  } = options;
  const { y, height } = dest;
  if (!canvasWidth || height <= 0) return false;

  const sourceRatio = region.w / region.h;
  const drawHeight = height;
  const drawWidth = Math.max(canvasWidth + 2, drawHeight * sourceRatio);
  const scroll = ((cameraX * parallax) % drawWidth + drawWidth) % drawWidth;
  let x = -scroll;

  ctx.save();
  ctx.globalAlpha = alpha;
  while (x > 0) x -= drawWidth - 1;
  for (; x < canvasWidth; x += drawWidth - 1) {
    ctx.drawImage(assets.image, region.x, region.y, region.w, region.h, x, y, drawWidth + 1, drawHeight);
  }
  ctx.restore();
  return true;
};
