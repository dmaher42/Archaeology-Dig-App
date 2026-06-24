import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const JOURNEY_SOURCE_URLS = [
  new URL('../ExpeditionJourney.jsx', import.meta.url),
  new URL('./journeyCombatTelegraphs.js', import.meta.url),
  new URL('./journeyControlsReference.jsx', import.meta.url),
  new URL('./journeyPlayerVisuals.js', import.meta.url),
  new URL('./journeySacredRooms.js', import.meta.url),
  new URL('./journeyOpeningScenes.js', import.meta.url),
  new URL('./journeyExteriorStructureRenderers.js', import.meta.url),
  new URL('./JourneyPlacementEditorPanel.jsx', import.meta.url),
  new URL('./JourneyHudOverlays.jsx', import.meta.url),
  new URL('./journeyRenderPrimitives.js', import.meta.url),
  new URL('./useJourneyRenderer.js', import.meta.url),
  new URL('./useJourneySimulation.js', import.meta.url),
];

export const JOURNEY_BACKGROUND_ASSETS_SOURCE_URL = new URL('./journeyBackgroundAssets.js', import.meta.url);

export const readJourneySourceText = (urls = JOURNEY_SOURCE_URLS) => urls
  .map((url) => {
    const path = fileURLToPath(url);
    return existsSync(path) ? readFileSync(path, 'utf8') : '';
  })
  .filter(Boolean)
  .join('\n\n/* ---- journey source boundary ---- */\n\n');

export const journeyComponentSource = readJourneySourceText();
export const journeyBackgroundAssetsSource = readJourneySourceText([JOURNEY_BACKGROUND_ASSETS_SOURCE_URL]);
