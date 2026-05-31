export const EXCAVATION_MAP_ATLAS_BASE_PATH = 'assets/expedition/excavation/';
export const EXCAVATION_MAP_ATLAS_JSON = `${EXCAVATION_MAP_ATLAS_BASE_PATH}excavation-map-ui-pack.json`;

export const EXCAVATION_ASSET_PACKS = {
  legacy: {
    atlasPath: EXCAVATION_MAP_ATLAS_JSON,
    expectedKeys: [
      'riverbankTerrain',
      'burialTerrain',
      'archiveTerrain',
      'marketTerrain',
      'ruinedWallTerrain',
      'neutralGridTerrain',
      'sealedExitGate',
      'unlockedExitGate',
    ],
  },
  roomMap: {
    atlasPath: `${EXCAVATION_MAP_ATLAS_BASE_PATH}egypt-room-map-pack.json`,
    expectedKeys: [
      'riverbankTerrain',
      'burialTerrain',
      'archiveTerrain',
      'marketTerrain',
      'ruinedWallTerrain',
      'neutralExcavationTerrain',
      'pathHorizontal',
      'pathVertical',
      'pathCorner',
      'doorwayThreshold',
      'ropeBoundary',
      'gridOverlay',
      'mapSquareOverlay',
      'roomShadowOverlay',
    ],
  },
  chinaRoomMap: {
    atlasPath: `${EXCAVATION_MAP_ATLAS_BASE_PATH}china-room-map-pack.json`,
    expectedKeys: [
      'riverbankTerrain',
      'rammedEarthWallTerrain',
      'archiveTerrain',
      'workshopTerrain',
      'tombEdgeTerrain',
      'neutralExcavationTerrain',
      'pathHorizontal',
      'pathVertical',
      'pathCorner',
      'doorwayThreshold',
      'timberGateThreshold',
      'passageConnector',
      'ropeBoundary',
      'excavationBoundaryLine',
      'gridOverlay',
      'surveyStringHorizontal',
      'surveyStringVertical',
      'surveyPeg',
      'surveyFlag',
      'mapSquareOverlay',
      'potteryFragments',
      'bronzeFragmentPile',
      'oracleBoneFragments',
      'jadeChipScatter',
      'trenchEdge',
      'siltMound',
      'shadedArchiveAlcove',
      'roomShadowOverlay',
    ],
  },
  challengeUi: {
    atlasPath: `${EXCAVATION_MAP_ATLAS_BASE_PATH}egypt-zone-challenge-ui-pack.json`,
    expectedKeys: [
      'challengeCard',
      'fieldNotebookPage',
      'questionPanel',
      'answerChoiceNormal',
      'answerChoiceCorrect',
      'answerChoiceIncorrect',
      'feedbackPanel',
      'challengeCompleteStamp',
      'challengeRetryStamp',
    ],
  },
  chinaChallengeUi: {
    atlasPath: `${EXCAVATION_MAP_ATLAS_BASE_PATH}china-zone-challenge-ui-pack.json`,
    expectedKeys: [
      'challengeCard',
      'fieldNotebookPage',
      'challengeHeaderStrip',
      'questionPanel',
      'answerChoiceNormal',
      'answerChoiceSelected',
      'answerChoiceCorrect',
      'answerChoiceIncorrect',
      'feedbackPanel',
      'challengeCompleteStamp',
      'challengeRetryStamp',
      'warningTag',
      'successTag',
      'neutralHintTag',
      'riverbankChallengeIcon',
      'rammedEarthChallengeIcon',
      'archiveChallengeIcon',
      'workshopChallengeIcon',
      'tombChallengeIcon',
      'exitGateChallengeIcon',
      'paperclip',
      'bronzeCornerClip',
      'jadeAccentMark',
      'mapPin',
      'compassAccent',
      'tornPaperDivider',
      'blankLabelRibbon',
    ],
  },
  romeRoomMap: {
    atlasPath: `${EXCAVATION_MAP_ATLAS_BASE_PATH}rome/rome-room-map-pack.json`,
    expectedKeys: [
      'romeSacraRoadTerrain',
      'romeForumPitTerrain',
      'romeThermaeShaftTerrain',
      'romeBasilicaFloorTerrain',
      'romeCivicWingTerrain',
      'romeNeutralExcavationTerrain',
      'pathHorizontal',
      'pathVertical',
      'pathCorner',
      'doorwayThreshold',
      'stoneGateThreshold',
      'passageConnector',
      'ropeBoundary',
      'excavationBoundaryLine',
      'gridOverlay',
      'surveyStringHorizontal',
      'surveyStringVertical',
      'surveyPeg',
      'surveyFlag',
      'mapSquareOverlay',
      'coinScatter',
      'potterySherds',
      'leadPipeFragment',
      'marbleChipPile',
      'ashLayerDeposit',
      'trenchEdge',
      'siltMound',
      'roomShadowOverlay',
    ],
  },
  romeChallengeUi: {
    atlasPath: `${EXCAVATION_MAP_ATLAS_BASE_PATH}rome/rome-zone-challenge-ui-pack.json`,
    expectedKeys: [
      'challengeCard',
      'fieldNotebookPage',
      'questionPanel',
      'answerChoiceNormal',
      'answerChoiceCorrect',
      'answerChoiceIncorrect',
      'feedbackPanel',
      'challengeCompleteStamp',
      'toolSelectPanel',
      'evidenceTagLabel',
    ],
  },
  surveyMarkers: {
    atlasPath: `${EXCAVATION_MAP_ATLAS_BASE_PATH}egypt-survey-marker-pack.json`,
    expectedKeys: [
      'explorerToken',
      'heroPortraitMarker',
      'playerLocationRing',
      'playerShadow',
      'challengeRequiredMarker',
      'challengeCompleteMarker',
      'surveyReadyMarker',
      'surveyedMarker',
      'activeRoomMarker',
      'pinnedFieldTag',
    ],
  },
  gateway: {
    atlasPath: `${EXCAVATION_MAP_ATLAS_BASE_PATH}egypt-gateway-pack.json`,
    expectedKeys: [
      'openRoomDoorway',
      'sealedRoomDoorway',
      'brokenArchPassage',
      'ropeMarkedEntrance',
      'exitArch',
      'closedGateSlab',
      'sealedExitGate',
      'unlockedExitGate',
      'lockedSealIcon',
      'unlockedSealIcon',
      'sandstoneWallSegment',
      'crackedStoneWallSegment',
    ],
  },
  chinaSurveyGateway: {
    atlasPath: `${EXCAVATION_MAP_ATLAS_BASE_PATH}china-survey-marker-gateway-pack.json`,
    expectedKeys: [
      'explorerToken',
      'heroPortraitMarker',
      'playerLocationRing',
      'playerShadow',
      'playerGlow',
      'lockedRoomMarker',
      'challengeRequiredMarker',
      'challengeCompleteMarker',
      'surveyReadyMarker',
      'surveyedMarker',
      'activeRoomMarker',
      'completedRoomMarker',
      'surveyPin',
      'surveyFlag',
      'surveyPeg',
      'pinnedFieldTag',
      'pinnedFieldLabel',
      'blankRoomLabel',
      'highlightedSelectedZoneBorder',
      'pulsingRing',
      'neutralQuestionIcon',
      'neutralWarningIcon',
      'neutralCheckIcon',
      'neutralRetryIcon',
      'neutralEvidenceCheckIcon',
      'neutralLockIcon',
      'neutralUnlockIcon',
      'openRoomDoorway',
      'sealedRoomDoorway',
      'timberGatePassage',
      'ropeMarkedEntrance',
      'narrowPassageConnector',
      'sealedExitGate',
      'unlockedExitGate',
      'bronzeSealIcon',
      'jadeUnlockedSealIcon',
      'rammedEarthWallSegment',
      'crackedEarthWallSegment',
      'buriedFoundation',
      'carvedThreshold',
      'fallenTimberLintel',
      'rubblePile',
      'gateBaseDustShadow',
      'sandstormPatch',
      'fallingRocksPatch',
      'unstableFloorCrack',
      'guardianShadowMarker',
      'dustCloudOverlay',
      'cautionIcon',
      'stoneWallSegment',
      'brokenPillarTop',
      'buriedFoundationStones',
      'surveyTag',
      'mapPin',
      'selectedZoneHighlight',
      'completedSurveyStamp',
      'lockedSealIcon',
      'unlockedSealIcon',
    ],
  },
};

export const EXPECTED_EXCAVATION_MAP_KEYS = [
  'riverbankTerrain',
  'burialTerrain',
  'archiveTerrain',
  'marketTerrain',
  'ruinedWallTerrain',
  'neutralGridTerrain',
  'surveyStringHorizontal',
  'surveyStringVertical',
  'surveyPeg',
  'surveyFlag',
  'parchmentGridOverlay',
  'sandstormPatch',
  'fallingRocksPatch',
  'unstableFloorCrack',
  'guardianShadowMarker',
  'dustCloudOverlay',
  'cautionIcon',
  'sealedExitGate',
  'unlockedExitGate',
  'stoneWallSegment',
  'brokenPillarTop',
  'buriedFoundationStones',
  'doorwayThreshold',
  'surveyTag',
  'pinnedFieldLabel',
  'mapPin',
  'selectedZoneHighlight',
  'completedSurveyStamp',
  'lockedSealIcon',
  'explorerToken',
  'heroPortraitMarker',
  'playerLocationRing',
  'playerShadow',
];

export const createExcavationMapAssetState = () => ({
  image: null,
  atlas: null,
  packs: {},
  loaded: false,
  ready: false,
  failed: false,
  error: null,
  atlasPath: EXCAVATION_MAP_ATLAS_JSON,
  atlasPaths: Object.fromEntries(
    Object.entries(EXCAVATION_ASSET_PACKS).map(([packId, pack]) => [packId, pack.atlasPath]),
  ),
});

const getRequestedExcavationPacks = (packIds = null) => {
  if (!Array.isArray(packIds) || packIds.length === 0) {
    return Object.entries(EXCAVATION_ASSET_PACKS);
  }
  const requested = new Set(packIds.filter(Boolean));
  return Object.entries(EXCAVATION_ASSET_PACKS).filter(([packId]) => requested.has(packId));
};

export const getMissingExcavationMapAssets = (assets) => {
  if (assets?.packs && Object.keys(assets.packs).length > 0) {
    return Object.entries(EXCAVATION_ASSET_PACKS)
      .filter(([packId]) => assets.packs?.[packId])
      .flatMap(([packId, packConfig]) => {
      const regions = assets.packs?.[packId]?.atlas?.regions || {};
      return packConfig.expectedKeys
        .filter(key => !regions[key])
        .map(key => `${packId}:${key}`);
    });
  }
  const regions = assets?.atlas?.regions || {};
  return EXPECTED_EXCAVATION_MAP_KEYS.filter(key => !regions[key]);
};

export const loadExcavationMapAssetPack = ({ baseUrl = '/', onUpdate, packIds = null }) => {
  let cancelled = false;
  const packEntriesToLoad = getRequestedExcavationPacks(packIds);

  const loadPack = ([packId, packConfig]) => fetch(`${baseUrl}${packConfig.atlasPath}`)
    .then((response) => {
      if (!response.ok) throw new Error(`${packId} excavation atlas request failed: ${response.status}`);
      return response.json();
    })
    .then((atlas) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        resolve([packId, {
          image,
          atlas,
          loaded: true,
          ready: packConfig.expectedKeys.every(key => atlas?.regions?.[key]),
          failed: false,
          error: null,
          atlasPath: packConfig.atlasPath,
        }]);
      };
      image.onerror = () => {
        resolve([packId, {
          image: null,
          atlas,
          loaded: false,
          ready: false,
          failed: true,
          error: `${packId} excavation image failed to load.`,
          atlasPath: packConfig.atlasPath,
        }]);
      };
      image.src = `${baseUrl}${EXCAVATION_MAP_ATLAS_BASE_PATH}${atlas.image}`;
    }))
    .catch((error) => [packId, {
      image: null,
      atlas: null,
      loaded: false,
      ready: false,
      failed: true,
      error: error?.message || `${packId} excavation assets failed to load.`,
      atlasPath: packConfig.atlasPath,
    }]);

  Promise.all(packEntriesToLoad.map(loadPack)).then((packEntries) => {
      if (cancelled) return;
      const packs = Object.fromEntries(packEntries);
      const legacy = packs.legacy || {};
      const loadedPacks = Object.values(packs);
      onUpdate?.({
        ...createExcavationMapAssetState(),
        image: legacy.image || null,
        atlas: legacy.atlas || null,
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

const getRegionEntry = (assets, key) => {
  const [maybePackId, maybeRegionKey] = key.includes(':') ? key.split(':') : [null, key];
  if (maybePackId && assets?.packs?.[maybePackId]) {
    return { pack: assets.packs[maybePackId], region: assets.packs[maybePackId]?.atlas?.regions?.[maybeRegionKey] || null };
  }
  const packMatch = Object.values(assets?.packs || {}).find(pack => pack?.atlas?.regions?.[key]);
  if (packMatch) return { pack: packMatch, region: packMatch.atlas.regions[key] };
  return { pack: assets, region: assets?.atlas?.regions?.[key] || null };
};

export const drawExcavationMapRegion = (ctx, assets, key, dest, options = {}) => {
  const { pack, region } = getRegionEntry(assets, key);
  if (!pack?.loaded || !pack.image) return false;
  if (!region || !dest?.w || !dest?.h) return false;

  const {
    alpha = 1,
    fit = 'cover',
    rotation = 0,
  } = options;
  const sourceRatio = region.w / region.h;
  const destRatio = dest.w / dest.h;
  let sx = region.x;
  let sy = region.y;
  let sw = region.w;
  let sh = region.h;

  if (fit === 'cover' && Math.abs(sourceRatio - destRatio) > 0.01) {
    if (sourceRatio > destRatio) {
      sw = region.h * destRatio;
      sx = region.x + (region.w - sw) / 2;
    } else {
      sh = region.w / destRatio;
      sy = region.y + (region.h - sh) / 2;
    }
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  if (rotation) {
    ctx.translate(dest.x + dest.w / 2, dest.y + dest.h / 2);
    ctx.rotate(rotation);
    ctx.drawImage(pack.image, sx, sy, sw, sh, -dest.w / 2, -dest.h / 2, dest.w, dest.h);
  } else {
    ctx.drawImage(pack.image, sx, sy, sw, sh, dest.x, dest.y, dest.w, dest.h);
  }
  ctx.restore();
  return true;
};
