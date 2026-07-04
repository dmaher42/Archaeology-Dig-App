import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// useJourneyRenderer.js was split into themed modules under ./renderer/.
// Source-text assertions must scan all of them together.
export const JOURNEY_RENDERER_SOURCE_URLS = [
  new URL('./useJourneyRenderer.js', import.meta.url),
  new URL('./renderer/rendererOpeningScenes.js', import.meta.url),
  new URL('./renderer/rendererPlayer.js', import.meta.url),
  new URL('./renderer/rendererPlatforms.js', import.meta.url),
  new URL('./renderer/rendererProps.js', import.meta.url),
  new URL('./renderer/rendererBackgrounds.js', import.meta.url),
  new URL('./renderer/rendererEnemies.js', import.meta.url),
  new URL('./renderer/rendererEffectsOverlays.js', import.meta.url),
  new URL('./renderer/rendererWorldFeatures.js', import.meta.url),
];

// ExpeditionJourney.jsx's scene constants/helpers were split into these modules.
// Tests that scan the "journey component" source must scan them together.
export const EXPEDITION_JOURNEY_SOURCE_URLS = [
  new URL('../ExpeditionJourney.jsx', import.meta.url),
  new URL('./journeySceneAssets.js', import.meta.url),
  new URL('./journeyChamberTriggers.js', import.meta.url),
  new URL('./journeyGameplayHelpers.js', import.meta.url),
  new URL('./journeyWorldProps.js', import.meta.url),
];

export const JOURNEY_SOURCE_URLS = [
  ...EXPEDITION_JOURNEY_SOURCE_URLS,
  new URL('./journeyConstants.js', import.meta.url),
  new URL('./useJourneyEditorOutliner.js', import.meta.url),
  new URL('./useJourneyPlacementEditor.js', import.meta.url),
  new URL('./journeyCombatTelegraphs.js', import.meta.url),
  new URL('./journeyControlsReference.jsx', import.meta.url),
  new URL('./journeyPlayerVisuals.js', import.meta.url),
  new URL('./journeySacredRooms.js', import.meta.url),
  new URL('./journeyOpeningScenes.js', import.meta.url),
  new URL('./journeyExteriorStructureRenderers.js', import.meta.url),
  new URL('./JourneyPlacementEditorPanel.jsx', import.meta.url),
  new URL('./JourneyHudOverlays.jsx', import.meta.url),
  new URL('./journeyRenderPrimitives.js', import.meta.url),
  ...JOURNEY_RENDERER_SOURCE_URLS,
  new URL('./useJourneySimulation.js', import.meta.url),
  new URL('./useJourneyDraw.js', import.meta.url),
  new URL('./useJourneySnapshot.js', import.meta.url),
];

export const JOURNEY_BACKGROUND_ASSETS_SOURCE_URL = new URL('./journeyBackgroundAssets.js', import.meta.url);

export const INDEX_CSS_SOURCE_URLS = [
  new URL('../../index.css', import.meta.url),
  new URL('../../styles/index/01-base.css', import.meta.url),
  new URL('../../styles/index/02-training-bureau.css', import.meta.url),
  new URL('../../styles/index/03-layout-core.css', import.meta.url),
  new URL('../../styles/index/04-survey-lab.css', import.meta.url),
  new URL('../../styles/index/05-museum.css', import.meta.url),
  new URL('../../styles/index/06-sorting-artifacts.css', import.meta.url),
  new URL('../../styles/index/07-menu-dossier.css', import.meta.url),
  new URL('../../styles/index/08-expedition-map.css', import.meta.url),
  new URL('../../styles/index/09-expedition-dark.css', import.meta.url),
  new URL('../../styles/index/10-hud-combat.css', import.meta.url),
  new URL('../../styles/index/11-expedition-fullscreen.css', import.meta.url),
  new URL('../../styles/index/12-journey-controls.css', import.meta.url),
  new URL('../../styles/index/13-premium-training.css', import.meta.url),
  new URL('../../styles/lost-site-expedition.css', import.meta.url),
];

export const readJourneySourceText = (urls = JOURNEY_SOURCE_URLS) => urls
  .map((url) => {
    const path = fileURLToPath(url);
    return existsSync(path) ? readFileSync(path, 'utf8') : '';
  })
  .filter(Boolean)
  .join('\n\n/* ---- journey source boundary ---- */\n\n');

export const journeyComponentSource = readJourneySourceText();
export const journeyBackgroundAssetsSource = readJourneySourceText([JOURNEY_BACKGROUND_ASSETS_SOURCE_URL]);
export const journeyRendererSource = readJourneySourceText(JOURNEY_RENDERER_SOURCE_URLS);
export const expeditionJourneySource = readJourneySourceText(EXPEDITION_JOURNEY_SOURCE_URLS);
export const indexCssSource = readJourneySourceText(INDEX_CSS_SOURCE_URLS);
