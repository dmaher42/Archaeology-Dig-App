// Rome excavation map asset loading — mirrors expeditionMapAssets.js pattern, Rome-only.

export const ROME_EXCAVATION_MAP_ATLAS_BASE_PATH = 'assets/expedition/excavation/rome/';

export const ROME_EXCAVATION_ASSET_PACKS = {
  romeRoomMap: {
    atlasPath: `${ROME_EXCAVATION_MAP_ATLAS_BASE_PATH}rome-room-map-pack.json`,
    expectedKeys: [
      // Zone terrain tiles
      'romeSacraRoadTerrain',
      'romeForumPitTerrain',
      'romeThermaeShaftTerrain',
      'romeBasilicaFloorTerrain',
      'romeCivicWingTerrain',
      'romeNeutralExcavationTerrain',
      // Path connectors
      'pathHorizontal',
      'pathVertical',
      'pathCorner',
      'doorwayThreshold',
      'stoneGateThreshold',
      'passageConnector',
      // Survey & boundary
      'ropeBoundary',
      'excavationBoundaryLine',
      'gridOverlay',
      'surveyStringHorizontal',
      'surveyStringVertical',
      'surveyPeg',
      'surveyFlag',
      'mapSquareOverlay',
      // Rome-specific scatter details
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
    atlasPath: `${ROME_EXCAVATION_MAP_ATLAS_BASE_PATH}rome-zone-challenge-ui-pack.json`,
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
};

export const ROME_EXCAVATION_VISUAL_MODE = 'rome-room-map-stage-1';

export const createRomeExcavationMapAssetState = () =>
  Object.fromEntries(
    Object.keys(ROME_EXCAVATION_ASSET_PACKS).map((packId) => [
      packId,
      { image: null, atlas: null, loaded: false, ready: false, failed: false, error: null },
    ]),
  );

export const getMissingRomeExcavationMapAssets = (assets) =>
  Object.entries(ROME_EXCAVATION_ASSET_PACKS).flatMap(([packId, packConfig]) => {
    const regions = assets?.[packId]?.atlas?.regions || {};
    return packConfig.expectedKeys
      .filter((key) => !regions[key])
      .map((key) => `${packId}:${key}`);
  });

const getAtlasImagePath = (atlasPath, imageName) => {
  if (!imageName) return null;
  if (imageName.startsWith('/') || imageName.startsWith('assets/')) return imageName;
  const dir = atlasPath.includes('/') ? atlasPath.slice(0, atlasPath.lastIndexOf('/') + 1) : '';
  return `${dir}${imageName}`;
};

export const loadRomeExcavationMapAssetPack = ({ baseUrl = '/', onUpdate, packId }) => {
  let cancelled = false;
  const packConfig = ROME_EXCAVATION_ASSET_PACKS[packId];
  if (!packConfig) return () => {};

  const atlasUrl = `${baseUrl}${packConfig.atlasPath}`;

  const fail = (error) => {
    if (cancelled) return;
    onUpdate?.({ [packId]: { image: null, atlas: null, loaded: false, ready: false, failed: true, error: error?.message || `${packId} failed.` } });
  };

  fetch(atlasUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`${packId} atlas failed: ${res.status}`);
      return res.json();
    })
    .then((atlas) => {
      if (cancelled) return;
      const image = new Image();
      image.onload = () => {
        if (cancelled) return;
        onUpdate?.({
          [packId]: {
            image,
            atlas,
            loaded: true,
            ready: packConfig.expectedKeys.every((k) => atlas?.regions?.[k]),
            failed: false,
            error: null,
          },
        });
      };
      image.onerror = () => fail(new Error(`${packId} image failed.`));
      image.src = `${baseUrl}${getAtlasImagePath(packConfig.atlasPath, atlas.image)}`;
    })
    .catch(fail);

  return () => { cancelled = true; };
};
