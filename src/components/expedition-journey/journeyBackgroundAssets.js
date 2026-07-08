import { ROME_SECTION_BACKGROUND_PACKS } from './rome/romeBackgroundAssets.js';

export const DESERT_BACKGROUND_ATLAS_BASE_PATH = 'assets/expedition/backgrounds/desert-entry/';
export const DESERT_BACKGROUND_ATLAS_JSON = `${DESERT_BACKGROUND_ATLAS_BASE_PATH}desert-entry-parallax-pack.json`;
export const DESERT_ENTRY_V3_CANDIDATE_BACKGROUND_ATLAS_BASE_PATH = 'assets/expedition/backgrounds/desert-entry/_review-parallax-layers-2026-06-29/';
export const DESERT_ENTRY_V3_CANDIDATE_BACKGROUND_ATLAS_JSON = `${DESERT_ENTRY_V3_CANDIDATE_BACKGROUND_ATLAS_BASE_PATH}desert-entry-v3-production-parallax-pack.json`;
export const DESERT_ENTRY_V3_CANDIDATE_URL_PARAM = 'desertEntryBg';
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
  'skyLight',
  'farPyramids',
  'distantCliffs',
  'midNecropolisRuins',
  'groundBacking',
  'groundTransition',
  'groundLane',
  'foregroundRubble',
  'foregroundDepth',
];

export const EXPECTED_DESERT_ENTRY_REFRESH_BACKGROUND_KEYS = [
  ...EXPECTED_DESERT_BACKGROUND_KEYS,
  'dustHaze',
  'templeFoundationTransition',
  'desertSphinx',
];

export const DESERT_BACKGROUND_DEPTH_MODE = 'desert-entry-necropolis-layered-playable-route-v1';
export const JOURNEY_BACKGROUND_DEPTH_MODE = 'journey-section-parallax-v2';

export const EXPECTED_CHINA_RIVER_VALLEY_BACKGROUND_KEYS = [
  'skyLayer',
  'farMountains',
  'riverValley',
  'watchtowerRidge',
  'foregroundMist',
];

export const CHINA_RIVER_VALLEY_BACKGROUND_PACK = {
  id: 'china-river-valley',
  basePath: CHINA_RIVER_VALLEY_BACKGROUND_ATLAS_BASE_PATH,
  atlasPath: CHINA_RIVER_VALLEY_BACKGROUND_ATLAS_JSON,
  expectedKeys: EXPECTED_CHINA_RIVER_VALLEY_BACKGROUND_KEYS,
};

export const isDesertEntryV3CandidateEnabled = () => {
  if (!import.meta.env?.DEV || typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get(DESERT_ENTRY_V3_CANDIDATE_URL_PARAM) === 'v3';
};

export const getDesertEntryBackgroundPack = () => {
  if (!isDesertEntryV3CandidateEnabled()) {
    return {
      basePath: DESERT_BACKGROUND_ATLAS_BASE_PATH,
      atlasPath: DESERT_BACKGROUND_ATLAS_JSON,
      expectedKeys: EXPECTED_DESERT_ENTRY_REFRESH_BACKGROUND_KEYS,
    };
  }

  return {
    basePath: DESERT_ENTRY_V3_CANDIDATE_BACKGROUND_ATLAS_BASE_PATH,
    atlasPath: DESERT_ENTRY_V3_CANDIDATE_BACKGROUND_ATLAS_JSON,
    expectedKeys: EXPECTED_DESERT_BACKGROUND_KEYS,
    devCandidate: true,
  };
};

export const SECTION_BACKGROUND_PACKS = {
  'desert-entry': getDesertEntryBackgroundPack(),
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
        const optionalMaskEntries = Object.entries(atlas?.optionalMasks || {})
          .map(([maskKey, mask]) => [maskKey, mask?.image])
          .filter(([, imageName]) => Boolean(imageName));
        const imageNames = Array.from(new Set([
          atlas.image,
          ...Object.values(atlas?.regions || {}).map(region => region?.image).filter(Boolean),
          ...optionalMaskEntries.map(([, imageName]) => imageName),
        ].filter(Boolean)));
        const loadImage = (imageName) => new Promise((imageResolve) => {
          const image = new Image();
          image.onload = () => imageResolve([imageName, { image, failed: false }]);
          image.onerror = () => imageResolve([imageName, { image: null, failed: true }]);
          image.src = `${baseUrl}${packConfig.basePath}${imageName}`;
        });
        Promise.all(imageNames.map(loadImage)).then((imageEntries) => {
          const images = Object.fromEntries(imageEntries.map(([imageName, result]) => [imageName, result.image]));
          const optionalMaskImageNames = new Set(optionalMaskEntries.map(([, imageName]) => imageName));
          const failedImages = imageEntries
            .filter(([imageName, result]) => result.failed && !optionalMaskImageNames.has(imageName))
            .map(([imageName]) => imageName);
          const failedMaskImages = imageEntries
            .filter(([imageName, result]) => result.failed && optionalMaskImageNames.has(imageName))
            .map(([imageName]) => imageName);
          const maskImages = Object.fromEntries(optionalMaskEntries.map(([maskKey, imageName]) => [maskKey, images[imageName] || null]));
          if (failedMaskImages.length > 0) {
            console.warn(`[Journey background] Optional mask image missing for ${sectionId}: ${failedMaskImages.join(', ')}. Rendering with polygon fallback or normal scene.`);
          }
          resolve([
            sectionId,
            {
              image: images[atlas.image] || null,
              images,
              maskImages,
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

const createLayerGradeCanvas = (width, height) => {
  if (!width || !height) return null;
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  return null;
};

const hasLayerToneGrade = (grade = {}) => {
  const safeGrade = grade || {};
  return (
    (safeGrade.shadowLift ?? 0) > 0.001
    || (safeGrade.highlightClamp ?? 1) < 0.999
    || (safeGrade.dustHaze ?? 0) > 0.001
  );
};

const applyLayerToneGrade = (ctx, width, height, grade = {}) => {
  const safeGrade = grade || {};
  const shadowLift = Math.max(0, Math.min(0.35, safeGrade.shadowLift ?? 0));
  const highlightClamp = Math.max(0.6, Math.min(1, safeGrade.highlightClamp ?? 1));
  const dustHaze = Math.max(0, Math.min(0.25, safeGrade.dustHaze ?? 0));

  if (shadowLift > 0.001) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(178, 150, 103, ${shadowLift})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (highlightClamp < 0.999) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(118, 92, 58, ${(1 - highlightClamp) * 0.42})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (dustHaze > 0.001) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(219, 196, 151, ${dustHaze})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
};

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
    filter = null,
    compositeOperation = null,
    grade = null,
  } = options;
  const { y, height } = dest;
  if (!canvasWidth || height <= 0) return false;

  const sourceRatio = region.w / region.h;
  const drawHeight = height;
  const drawWidth = Math.max(canvasWidth + 2, drawHeight * sourceRatio);
  const scroll = ((cameraX * parallax) % drawWidth + drawWidth) % drawWidth;
  let x = -scroll;

  const layerCanvas = hasLayerToneGrade(grade) ? createLayerGradeCanvas(canvasWidth, ctx.canvas?.height || 720) : null;
  const targetCtx = layerCanvas?.getContext?.('2d') || ctx;

  targetCtx.save();
  targetCtx.globalAlpha = alpha;
  if (filter) targetCtx.filter = filter;
  if (!layerCanvas && compositeOperation) targetCtx.globalCompositeOperation = compositeOperation;
  while (x > 0) x -= drawWidth - 1;
  for (; x < canvasWidth; x += drawWidth - 1) {
    targetCtx.drawImage(image, region.x, region.y, region.w, region.h, x, y, drawWidth + 1, drawHeight);
  }
  targetCtx.restore();

  if (layerCanvas) {
    applyLayerToneGrade(targetCtx, layerCanvas.width, layerCanvas.height, grade);
    ctx.save();
    if (compositeOperation) ctx.globalCompositeOperation = compositeOperation;
    ctx.drawImage(layerCanvas, 0, 0);
    ctx.restore();
  }
  return true;
};
