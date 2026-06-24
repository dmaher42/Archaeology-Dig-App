import { ROME_SECTION_BACKGROUND_PACKS } from './rome/romeBackgroundAssets.js';

export const DESERT_BACKGROUND_ATLAS_BASE_PATH = 'assets/expedition/backgrounds/desert-entry/';
export const DESERT_BACKGROUND_ATLAS_JSON = `${DESERT_BACKGROUND_ATLAS_BASE_PATH}desert-entry-parallax-pack.json`;
export const CATACOMBS_BACKGROUND_ATLAS_BASE_PATH = 'assets/expedition/backgrounds/catacombs/';
export const CATACOMBS_BACKGROUND_ATLAS_JSON = `${CATACOMBS_BACKGROUND_ATLAS_BASE_PATH}catacombs-parallax-pack.json`;
export const RUINED_TEMPLE_BACKGROUND_ATLAS_BASE_PATH = 'assets/expedition/backgrounds/ruined-temple/';
export const RUINED_TEMPLE_BACKGROUND_ATLAS_JSON = `${RUINED_TEMPLE_BACKGROUND_ATLAS_BASE_PATH}ruined-temple-parallax-pack.json`;
export const ESCAPE_BACKGROUND_ATLAS_BASE_PATH = 'assets/expedition/backgrounds/escape-sequence/';
export const ESCAPE_BACKGROUND_ATLAS_JSON = `${ESCAPE_BACKGROUND_ATLAS_BASE_PATH}escape-sequence-parallax-pack.json`;
export const DIG_SITE_BACKGROUND_ATLAS_BASE_PATH = 'assets/expedition/backgrounds/dig-site-entrance/';
export const DIG_SITE_BACKGROUND_ATLAS_JSON = `${DIG_SITE_BACKGROUND_ATLAS_BASE_PATH}base-camp-parallax-pack.json`;
export const CHINA_RIVER_VALLEY_BACKGROUND_ATLAS_BASE_PATH = 'assets/expedition/backgrounds/china-river-valley/';
export const CHINA_RIVER_VALLEY_BACKGROUND_ATLAS_JSON = `${CHINA_RIVER_VALLEY_BACKGROUND_ATLAS_BASE_PATH}china-river-valley-parallax-pack.json`;

export const EXPECTED_DESERT_BACKGROUND_KEYS = [
  'underworldSky',
  'floatingPyramids',
  'corruptedTempleRuins',
  'groundLane',
  'foregroundCorruption',
];

export const DESERT_BACKGROUND_DEPTH_MODE = 'desert-entry-underworld-layered-playable-route-v1';
export const JOURNEY_BACKGROUND_DEPTH_MODE = 'journey-section-parallax-v2';

export const EXPECTED_CHINA_RIVER_VALLEY_BACKGROUND_KEYS = [
  'skyLayer',
];

export const CHINA_RIVER_VALLEY_BACKGROUND_PACK = {
  id: 'china-river-valley',
  basePath: CHINA_RIVER_VALLEY_BACKGROUND_ATLAS_BASE_PATH,
  atlasPath: CHINA_RIVER_VALLEY_BACKGROUND_ATLAS_JSON,
  expectedKeys: EXPECTED_CHINA_RIVER_VALLEY_BACKGROUND_KEYS,
};

export const SECTION_BACKGROUND_PACKS = {
  'desert-entry': {
    basePath: DESERT_BACKGROUND_ATLAS_BASE_PATH,
    atlasPath: DESERT_BACKGROUND_ATLAS_JSON,
    expectedKeys: EXPECTED_DESERT_BACKGROUND_KEYS,
  },
  'ruined-temple': {
    basePath: RUINED_TEMPLE_BACKGROUND_ATLAS_BASE_PATH,
    atlasPath: RUINED_TEMPLE_BACKGROUND_ATLAS_JSON,
    expectedKeys: [
      'templeSky',
      'farTempleWalls',
      'distantTempleRuins',
      'midgroundTempleDoors',
      'foregroundTempleDust',
    ],
  },
  catacombs: {
    basePath: CATACOMBS_BACKGROUND_ATLAS_BASE_PATH,
    atlasPath: CATACOMBS_BACKGROUND_ATLAS_JSON,
    expectedKeys: [
      'undergroundAtmosphere',
      'farTunnelWalls',
      'distantCatacombs',
      'midgroundGlyphWalls',
      'foregroundMist',
    ],
  },
  'escape-sequence': {
    basePath: ESCAPE_BACKGROUND_ATLAS_BASE_PATH,
    atlasPath: ESCAPE_BACKGROUND_ATLAS_JSON,
    expectedKeys: [
      'dangerAtmosphere',
      'farCollapsingWalls',
      'distantRuinsDebris',
      'midgroundEscapeRuins',
      'foregroundDust',
    ],
  },
  'dig-site-entrance': {
    basePath: DIG_SITE_BACKGROUND_ATLAS_BASE_PATH,
    atlasPath: DIG_SITE_BACKGROUND_ATLAS_JSON,
    expectedKeys: [
      'skyLayer',
      'farBackground',
      'midBackground',
      'nearBaseCamp',
      'foregroundLayer',
    ],
  },
  'china-river-valley': CHINA_RIVER_VALLEY_BACKGROUND_PACK,
  ...ROME_SECTION_BACKGROUND_PACKS,
};

export const FUTURE_JOURNEY_BACKGROUND_PACKS = {
  'china-river-valley': CHINA_RIVER_VALLEY_BACKGROUND_PACK,
  ...ROME_SECTION_BACKGROUND_PACKS,
};

export const EGYPT_JOURNEY_BACKGROUND_SECTION_IDS = [
  'desert-entry',
  'ruined-temple',
  'catacombs',
  'escape-sequence',
  'dig-site-entrance',
];

export const createDesertBackgroundAssetState = () => ({
  packs: {},
  loaded: false,
  ready: false,
  failed: false,
  error: null,
  atlasPath: DESERT_BACKGROUND_ATLAS_JSON,
  atlasPaths: Object.fromEntries(
    Object.entries(SECTION_BACKGROUND_PACKS).map(([sectionId, pack]) => [sectionId, pack.atlasPath]),
  ),
});

const getRequestedBackgroundPacks = (sectionIds = null) => {
  if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
    return Object.entries(SECTION_BACKGROUND_PACKS);
  }
  const requested = new Set(sectionIds.filter(Boolean));
  return Object.entries(SECTION_BACKGROUND_PACKS).filter(([sectionId]) => requested.has(sectionId));
};

export const getMissingDesertBackgroundAssets = (assets) => {
  const packEntries = assets?.packs && Object.keys(assets.packs).length > 0
    ? Object.entries(SECTION_BACKGROUND_PACKS).filter(([sectionId]) => assets.packs?.[sectionId])
    : Object.entries(SECTION_BACKGROUND_PACKS);
  return packEntries.flatMap(([sectionId, packConfig]) => {
    const pack = assets?.packs?.[sectionId];
    const regions = pack?.atlas?.regions || {};
    return packConfig.expectedKeys
      .filter(key => !regions[key])
      .map(key => `${sectionId}:${key}`);
  });
};

export const getSectionBackgroundAssets = (assets, sectionId) => {
  const pack = assets?.packs?.[sectionId];
  if (!pack?.loaded || pack.failed) return null;
  return pack;
};

export const getMissingSectionBackgroundAssets = (assets, sectionId) => {
  const packConfig = SECTION_BACKGROUND_PACKS[sectionId];
  if (!packConfig) return [];
  const pack = assets?.packs?.[sectionId];
  const regions = pack?.atlas?.regions || {};
  return packConfig.expectedKeys.filter(key => !regions[key]);
};

export const loadDesertBackgroundAssetPack = ({ baseUrl = '/', onUpdate, sectionIds = null }) => {
  let cancelled = false;
  const packEntriesToLoad = getRequestedBackgroundPacks(sectionIds);

  const loadSinglePack = ([sectionId, packConfig]) => {
    const atlasPath = `${baseUrl}${packConfig.atlasPath}`;
    return fetch(atlasPath)
      .then((response) => {
        if (!response.ok) throw new Error(`${sectionId} background atlas request failed: ${response.status}`);
        return response.json();
      })
      .then((atlas) => new Promise((resolve) => {
        const imageNames = Array.from(new Set([
          atlas.image,
          ...Object.values(atlas?.regions || {}).map(region => region?.image).filter(Boolean),
        ].filter(Boolean)));
        const loadImage = (imageName) => new Promise((imageResolve) => {
          const image = new Image();
          image.onload = () => imageResolve([imageName, { image, failed: false }]);
          image.onerror = () => imageResolve([imageName, { image: null, failed: true }]);
          image.src = `${baseUrl}${packConfig.basePath}${imageName}`;
        });
        Promise.all(imageNames.map(loadImage)).then((imageEntries) => {
          const images = Object.fromEntries(imageEntries.map(([imageName, result]) => [imageName, result.image]));
          const failedImages = imageEntries.filter(([, result]) => result.failed).map(([imageName]) => imageName);
          resolve([
            sectionId,
            {
              image: images[atlas.image] || null,
              images,
              atlas,
              loaded: failedImages.length === 0,
              ready: failedImages.length === 0 && packConfig.expectedKeys.every(key => atlas?.regions?.[key]),
              failed: failedImages.length > 0,
              error: failedImages.length
                ? `${sectionId} background image failed to load: ${failedImages.join(', ')}.`
                : null,
              atlasPath: packConfig.atlasPath,
            },
          ]);
        });
      }))
      .catch((error) => [
        sectionId,
        {
          image: null,
          atlas: null,
          loaded: false,
          ready: false,
          failed: true,
          error: error?.message || `${sectionId} background assets failed to load.`,
          atlasPath: packConfig.atlasPath,
        },
      ]);
  };

  Promise.all(packEntriesToLoad.map(loadSinglePack)).then((packEntries) => {
    if (cancelled) return;
    const packs = Object.fromEntries(packEntries);
    const loadedPacks = Object.values(packs);
    onUpdate?.({
      ...createDesertBackgroundAssetState(),
      packs,
      loaded: loadedPacks.some(pack => pack.loaded),
      ready: loadedPacks.length > 0 && loadedPacks.every(pack => pack.ready && !pack.failed),
      failed: loadedPacks.some(pack => pack.failed),
      error: loadedPacks.filter(pack => pack.error).map(pack => pack.error).join(' | ') || null,
    });
  });

  return () => {
    cancelled = true;
  };
};

const getRegion = (assets, key) => assets?.atlas?.regions?.[key] || null;

export const drawDesertBackgroundLayer = (ctx, assets, key, dest, options = {}) => {
  if (!assets?.loaded) return false;
  const region = getRegion(assets, key);
  if (!region) return false;
  const image = region.image ? assets.images?.[region.image] : assets.image;
  if (!image) return false;

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
    ctx.drawImage(image, region.x, region.y, region.w, region.h, x, y, drawWidth + 1, drawHeight);
  }
  ctx.restore();
  return true;
};
