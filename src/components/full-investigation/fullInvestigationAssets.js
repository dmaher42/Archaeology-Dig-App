import { useEffect, useState } from 'react';
import { resolveAssetPath } from '../../utils/gameLogic';

export const FULL_INVESTIGATION_ATLAS_BASE_PATH = 'assets/full-investigation/shared/';
export const FULL_INVESTIGATION_ATLAS_JSON = `${FULL_INVESTIGATION_ATLAS_BASE_PATH}full-investigation-ui-pack.json`;

export const EXPECTED_FULL_INVESTIGATION_ASSET_KEYS = [
  'parchmentPanel',
  'darkWoodPanel',
  'dossierTab',
  'neutralEvidenceSlip',
  'paperclip',
  'archiveStamp',
  'brassCorner',
  'magnifyingGlass',
  'mapPin',
  'compass',
  'excavationTray',
  'cardBack',
  'recoveredFindSlot',
  'closedEvidenceFolder',
  'openEvidenceFolder',
  'pendingEvidenceCard',
  'categoryFolderBackground',
  'labBenchCard',
  'analysisNoteCard',
  'magnifierOverlay',
  'sampleTray',
  'displayPlinth',
  'exhibitFrame',
  'museumWallPanel',
  'plaqueCard',
  'finalDossierCover',
  'reportPage',
  'evidenceSummaryCard',
  'approvalStamp',
];

const createFullInvestigationAssetState = () => ({
  image: null,
  imageUrl: '',
  atlas: null,
  loaded: false,
  ready: false,
  failed: false,
  error: null,
  atlasPath: FULL_INVESTIGATION_ATLAS_JSON,
});

let cachedState = createFullInvestigationAssetState();
let loadPromise = null;
const subscribers = new Set();

const publish = (nextState) => {
  cachedState = nextState;
  subscribers.forEach(listener => listener(cachedState));
};

export const getMissingFullInvestigationAssets = (assets) => {
  const regions = assets?.atlas?.regions || {};
  return EXPECTED_FULL_INVESTIGATION_ASSET_KEYS.filter(key => !regions[key]);
};

const loadFullInvestigationAssetPack = () => {
  if (loadPromise) return loadPromise;

  const atlasUrl = resolveAssetPath(FULL_INVESTIGATION_ATLAS_JSON);

  loadPromise = fetch(atlasUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Full Investigation atlas request failed: ${response.status}`);
      return response.json();
    })
    .then((atlas) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({
        image,
        imageUrl: resolveAssetPath(`${FULL_INVESTIGATION_ATLAS_BASE_PATH}${atlas.image}`),
        atlas,
        loaded: true,
        ready: getMissingFullInvestigationAssets({ atlas }).length === 0,
        failed: false,
        error: null,
        atlasPath: FULL_INVESTIGATION_ATLAS_JSON,
      });
      image.onerror = () => reject(new Error('Full Investigation atlas image failed to load.'));
      image.src = resolveAssetPath(`${FULL_INVESTIGATION_ATLAS_BASE_PATH}${atlas.image}`);
    }))
    .then((state) => {
      publish(state);
      return state;
    })
    .catch((error) => {
      const failedState = {
        ...createFullInvestigationAssetState(),
        failed: true,
        error: error?.message || 'Full Investigation assets failed to load.',
      };
      publish(failedState);
      return failedState;
    });

  return loadPromise;
};

export const useFullInvestigationAssets = () => {
  const [assets, setAssets] = useState(cachedState);

  useEffect(() => {
    subscribers.add(setAssets);
    loadFullInvestigationAssetPack();
    return () => subscribers.delete(setAssets);
  }, []);

  return assets;
};

const percent = (value) => `${Number.isFinite(value) ? value : 0}%`;

export const getAtlasRegionStyle = (assets, key) => {
  const region = assets?.atlas?.regions?.[key];
  const atlasWidth = assets?.atlas?.width || assets?.image?.naturalWidth;
  const atlasHeight = assets?.atlas?.height || assets?.image?.naturalHeight;
  if (!assets?.ready || !assets.imageUrl || !region || !atlasWidth || !atlasHeight) return undefined;

  const xDenominator = Math.max(1, atlasWidth - region.w);
  const yDenominator = Math.max(1, atlasHeight - region.h);

  return {
    backgroundImage: `url("${assets.imageUrl}")`,
    backgroundSize: `${(atlasWidth / region.w) * 100}% ${(atlasHeight / region.h) * 100}%`,
    backgroundPosition: `${percent((region.x / xDenominator) * 100)} ${percent((region.y / yDenominator) * 100)}`,
    backgroundRepeat: 'no-repeat',
  };
};
