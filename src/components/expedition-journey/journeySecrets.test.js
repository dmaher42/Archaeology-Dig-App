import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  DYNAMIC_WORLD_EFFECT_REGIONS,
  DYNAMIC_WORLD_EFFECTS_SRC,
  DYNAMIC_WORLD_EFFECTS_VERSION,
  usesPaintedDynamicWorldEffect,
} from './journeyDynamicWorldAssets.js';
import { makeEnemy } from './journeyUtils.js';
import { CHINA_ENEMIES, ENEMIES } from './journeyLevelData.js';

const source = readFileSync(new URL('./journeyLevelData.js', import.meta.url), 'utf8');
const journeyUtilsSource = readFileSync(new URL('./journeyUtils.js', import.meta.url), 'utf8');
const journeyConstantsSource = readFileSync(new URL('./journeyConstants.js', import.meta.url), 'utf8');
const journeyEnemySpritesSource = readFileSync(new URL('./journeyEnemySprites.js', import.meta.url), 'utf8');
const journeyBossSpritesSource = readFileSync(new URL('./journeyBossSprites.js', import.meta.url), 'utf8');
const journeyMarkerSpritesSource = readFileSync(new URL('./journeyMarkerSprites.js', import.meta.url), 'utf8');
const journeyBackgroundAssetsSource = readFileSync(new URL('./journeyBackgroundAssets.js', import.meta.url), 'utf8');
const journeyRenderAssetsSource = readFileSync(new URL('./journeyRenderAssets.js', import.meta.url), 'utf8');
const expeditionStagesSource = readFileSync(new URL('../expedition/expeditionStages.js', import.meta.url), 'utf8');
const devToolsSource = readFileSync(new URL('../DevTools.jsx', import.meta.url), 'utf8');
const expeditionModeSource = readFileSync(new URL('../ExpeditionMode.jsx', import.meta.url), 'utf8');
const menuSource = readFileSync(new URL('../Menu.jsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../../App.jsx', import.meta.url), 'utf8');
const journeyComponentSource = readFileSync(new URL('../ExpeditionJourney.jsx', import.meta.url), 'utf8');
const egyptPlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-final-production-spritesheet.json', import.meta.url), 'utf8'),
);
const ashaV5PlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-v5-spritesheet.json', import.meta.url), 'utf8'),
);
const ashaNewIdlePlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-new-idle-spritesheet.json', import.meta.url), 'utf8'),
);
const ashaReferenceWarriorPlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-reference-warrior-spritesheet.json', import.meta.url), 'utf8'),
);
const ashaV2PlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-v2-production-candidate-spritesheet.json', import.meta.url), 'utf8'),
);
const ashaV6HiresPlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-v6-hires-spritesheet.json', import.meta.url), 'utf8'),
);
const egyptPreviousPlayerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/asha-hooded-warrior-explorer-spritesheet.json', import.meta.url), 'utf8'),
);
const egyptPlayerFallbackAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/player/egypt-warrior-guide-spritesheet.json', import.meta.url), 'utf8'),
);
const egyptMarkerAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/markers/egypt-checkpoint-flag-sprites.json', import.meta.url), 'utf8'),
);
const egyptSacredTrapAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/environment/desert-temple/egypt-sacred-traps-pack.json', import.meta.url), 'utf8'),
);
const egyptAtmosphereAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/environment/egypt-atmosphere/egypt-atmosphere-pack.json', import.meta.url), 'utf8'),
);
const mummificationChamberInteractionAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/environment/desert-temple/mummification-chamber/mummification-chamber-interaction-atlas.json', import.meta.url), 'utf8'),
);
const desertEntryBackgroundAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/backgrounds/desert-entry/desert-entry-parallax-pack.json', import.meta.url), 'utf8'),
);
const anubisBossAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/bosses/anubis-sprites.json', import.meta.url), 'utf8'),
);
const besEnemyAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/enemies/bes-guardian-sprites.json', import.meta.url), 'utf8'),
);
const egyptOpeningTrapDecalsPath = new URL('../../../public/assets/expedition/environment/egypt-opening/opening-trap-decals.png', import.meta.url);
const egyptOpeningHazardDecalsPath = new URL('../../../public/assets/expedition/environment/egypt-opening/opening-hazard-decals.png', import.meta.url);
const egyptOpeningTombStairwellPath = new URL('../../../public/assets/expedition/environment/egypt-opening/opening-tomb-stairwell.png', import.meta.url);
const forgottenMuralAlcoveClimbStructurePath = new URL('../../../public/assets/expedition/environment/desert-temple/forgotten-mural-alcove-climb-structure.png', import.meta.url);
const forgottenMuralChamberSourcePath = new URL('../../../public/assets/expedition/environment/desert-temple/forgotten-mural-chamber-source.png', import.meta.url);
const forgottenMuralChamberPath = new URL('../../../public/assets/expedition/environment/desert-temple/forgotten-mural-chamber.png', import.meta.url);
const mummificationChamberExteriorPath = new URL('../../../public/assets/expedition/environment/desert-temple/mummification-chamber-exterior-climb-structure.png', import.meta.url);
const mummificationChamberInteriorPath = new URL('../../../public/assets/expedition/environment/desert-temple/mummification-chamber-interior.png', import.meta.url);
const scribeChamberExteriorPath = new URL('../../../public/assets/expedition/environment/desert-temple/scribe-locked-chamber-exterior-climb-structure.png', import.meta.url);
const mummificationChamberInteractionAtlasPath = new URL('../../../public/assets/expedition/environment/desert-temple/mummification-chamber/mummification-chamber-interaction-atlas.png', import.meta.url);
const desertEntryGroundingOverlayPath = new URL('../../../public/assets/expedition/backgrounds/desert-entry/desert-entry-grounding-overlay.png', import.meta.url);
const egyptForegroundDepthAtlasPath = new URL('../../../public/assets/expedition/environment/egypt-foreground/egypt-foreground-depth-pack.json', import.meta.url);
const egyptForegroundDepthPngPath = new URL('../../../public/assets/expedition/environment/egypt-foreground/egypt-foreground-depth-pack.png', import.meta.url);
const extractExportedArray = (name) => {
  const startToken = `export const ${name} = [`;
  const start = source.indexOf(startToken);
  assert.notEqual(start, -1, `${name} export should exist`);
  const bodyStart = start + startToken.length - 1;
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '[') depth += 1;
    if (char === ']') depth -= 1;
    if (depth === 0) return source.slice(bodyStart, index + 1);
  }
  throw new Error(`${name} export should close its array`);
};

const getDataRowById = (arraySource, id) => {
  const idPattern = new RegExp(`id:\\s*'${id}'`);
  const match = arraySource.match(idPattern);
  if (!match) return '';
  const idIndex = match.index;
  let startBracket = -1;
  for (let i = idIndex; i >= 0; i -= 1) {
    if (arraySource[i] === '{') {
      startBracket = i;
      break;
    }
  }
  if (startBracket === -1) return '';
  let depth = 0;
  for (let i = startBracket; i < arraySource.length; i += 1) {
    if (arraySource[i] === '{') depth += 1;
    if (arraySource[i] === '}') {
      depth -= 1;
      if (depth === 0) return arraySource.slice(startBracket, i + 1);
    }
  }
  return '';
};

test('opening cinematic remains wired while the current quick-start path is enabled', () => {
  assert.match(journeyComponentSource, /OPENING_CINEMATIC_DURATION = 24/);
  assert.match(journeyComponentSource, /OPENING_CINEMATIC_ENABLED = false/);
  assert.match(journeyComponentSource, /OPENING_CINEMATIC_LINES = \[/);
  assert.match(journeyComponentSource, /speaker:\s*'Anubis'[\s\S]*?voice:\s*'guardian'/);
  assert.match(journeyComponentSource, /speaker:\s*'Asha'[\s\S]*?voice:\s*'asha'/);
  assert.match(journeyComponentSource, /startOpeningCinematic/);
  assert.match(journeyComponentSource, /startJourneyWithoutOpeningScene/);
  assert.match(journeyComponentSource, /OPENING_CINEMATIC_ENABLED \? \(\) => startOpeningCinematic/);
  assert.match(journeyComponentSource, /openingCinematicState:\s*current\.openingCinematic/);
  assert.match(journeyComponentSource, /window\.speechSynthesis/);
  assert.match(journeyComponentSource, /drawOpeningCinematic/);
  assert.match(journeyComponentSource, /OPENING_CINEMATIC_SPELL_IMPACT_AT = 18\.6/);
  assert.match(journeyComponentSource, /spellImpactTriggered/);
  assert.match(journeyComponentSource, /shieldShattered/);
  assert.match(journeyComponentSource, /current\.player\.x = 44/);
  assert.match(journeyComponentSource, /opening-cinematic-lightning/);
  assert.match(journeyComponentSource, /opening-cinematic-impact/);
  assert.match(journeyComponentSource, /opening-cinematic-shield/);
  assert.match(journeyComponentSource, /opening-cinematic-shield-aura/);
  assert.match(journeyComponentSource, /opening-cinematic-shield-shards/);
  assert.match(journeyComponentSource, /opening-cinematic-banishment-ring/);
  assert.match(journeyComponentSource, /opening-cinematic-shockwave/);
  assert.match(journeyComponentSource, /asha-opening-cinematic\.png/);
  assert.match(journeyComponentSource, /My shield is gone/);
  assert.doesNotMatch(journeyComponentSource, /<video|opening-cinematic-video|createOpeningMovieMode/);
});

test('hidden routes are optional and never required for main progression', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');

  assert.ok((hiddenRoutes.match(/id:/g) || []).length >= 4);
  assert.match(hiddenRoutes, /civilisation:\s*'Ancient Egypt'/);
  assert.match(hiddenRoutes, /civilisation:\s*'Ancient China'/);
  assert.match(hiddenRoutes, /optional:\s*true/);
  assert.match(hiddenRoutes, /rewardHint:/);
  assert.match(hiddenRoutes, /discoveryMessage:/);
});

test('hidden routes define visible upgrade-gated exploration types', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');

  ['high ledge', 'cracked wall', 'unstable bridge', 'blocked excavation tunnel', 'narrow crawl route'].forEach((gateType) => {
    assert.match(hiddenRoutes, new RegExp(`gateType:\\s*'${gateType}'`));
  });
  ['rope-launcher', 'survey-goggles', 'excavation-hammer', 'climbing-gloves'].forEach((upgradeId) => {
    assert.match(hiddenRoutes, new RegExp(`requiredUpgradeId:\\s*'${upgradeId}'`));
  });
  assert.match(hiddenRoutes, /lockedMessage:/);
  assert.match(hiddenRoutes, /teaseVisible:\s*true/);
  assert.match(hiddenRoutes, /rewardSummary:/);
});

test('secret collectibles support Egypt and China discovery sets', () => {
  const secretCollectibles = extractExportedArray('SECRET_COLLECTIBLES');

  assert.ok((secretCollectibles.match(/id:/g) || []).length >= 6);
  assert.match(secretCollectibles, /setId:\s*'egypt-secrets'/);
  assert.match(secretCollectibles, /setId:\s*'china-secrets'/);
  assert.match(secretCollectibles, /routeId:/);
  assert.match(secretCollectibles, /discoveryMessage:/);
  assert.match(secretCollectibles, /x:\s*X\(/);
  assert.match(secretCollectibles, /y:\s*JY\(/);
});

test('first Egypt secret route rewards curiosity without changing main progression', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');
  const secretCollectibles = extractExportedArray('SECRET_COLLECTIBLES');
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const routeGates = extractExportedArray('ROUTE_GATES');
  const platforms = extractExportedArray('PLATFORMS');
  const shards = source.slice(source.indexOf('const RELIC_SHARD_LAYOUT = ['), source.indexOf('export const RELIC_SHARDS'));
  const firstSecretRoute = getDataRowById(hiddenRoutes, 'desert-upper-survey-route');
  const scarabFragment = getDataRowById(secretCollectibles, 'egypt-scarab-fragment-1');
  const scarabFragmentTwo = getDataRowById(secretCollectibles, 'egypt-scarab-fragment-2');
  const scarabFragmentThree = getDataRowById(secretCollectibles, 'egypt-scarab-fragment-3');

  assert.match(firstSecretRoute, /name:\s*'Forgotten Mural Alcove'/);
  assert.match(firstSecretRoute, /optional:\s*true/);
  assert.match(firstSecretRoute, /sectionId:\s*'desert-entry'/);
  assert.match(firstSecretRoute, /y:\s*JY\(-154\)/);
  assert.match(firstSecretRoute, /rewardHint:\s*'A shadow moves above the ruins\. A blue scarab glow vanishes into the upper doorway\.'/);
  assert.match(firstSecretRoute, /discoveryMessage:\s*'Forgotten Mural Chamber discovered\. The warning mural has been damaged\.'/);
  assert.match(firstSecretRoute, /gateType:\s*'faded mural seam'/);
  assert.match(firstSecretRoute, /teaseVisible:\s*true/);
  assert.match(firstSecretRoute, /storySummary:\s*'Broken pieces of a scarab seal lie across the floor\. Someone tried to erase this warning\.'/);
  assert.match(firstSecretRoute, /rewardSummary:\s*'Three scarab seal fragments restored, hidden shard cache, and field journal clue'/);
  assert.doesNotMatch(firstSecretRoute, /requiredUpgradeId:/);

  assert.match(scarabFragment, /routeId:\s*'desert-upper-survey-route'/);
  assert.match(scarabFragment, /name:\s*'Broken Scarab Fragment I'/);
  assert.match(scarabFragment, /restorationSetId:\s*'forgotten-mural-seal'/);
  assert.match(scarabFragmentTwo, /name:\s*'Broken Scarab Fragment II'/);
  assert.match(scarabFragmentTwo, /restorationSetId:\s*'forgotten-mural-seal'/);
  assert.match(scarabFragmentThree, /name:\s*'Broken Scarab Fragment III'/);
  assert.match(scarabFragmentThree, /restorationSetId:\s*'forgotten-mural-seal'/);
  assert.match(scarabFragmentThree, /restoresStoryFlag:\s*'forgotten-mural-restored'/);
  assert.match(scarabFragmentThree, /restoreMessage:\s*'Asha places the fragments back into the warning mural\. The scarab glow returns faintly\.'/);
  assert.match(scarabFragmentThree, /anubisReaction:\s*'You followed the thief, but did not steal\. You restored what they broke\. Do not mistake this for trust\.'/);
  assert.match(scarabFragmentThree, /discoveryMessage:\s*'Final broken scarab fragment recovered from the chamber floor\.'/);
  assert.equal((secretCollectibles.match(/restorationSetId:\s*'forgotten-mural-seal'/g) || []).length, 3);
  assert.match(platforms, /id:\s*'forgotten-mural-carved-wall-ledge'[\s\S]*?carved wall ledge in hidden priest passage/);
  assert.match(platforms, /id:\s*'forgotten-mural-alcove-floor'[\s\S]*?y:\s*JY\(318\)[\s\S]*?full Forgotten Mural Chamber floor/);
  assert.match(platforms, /id:\s*'forgotten-mural-forward-passage-step'[\s\S]*?forward stonework return from the hidden alcove/);
  assert.match(platforms, /id:\s*'forgotten-mural-alcove-floor'[\s\S]*?invisible:\s*true/);
  [
    ['forgotten-mural-carved-wall-ledge', 6101, 218, 230],
    ['forgotten-mural-broken-warning-step', 6286, 160, 240],
    ['forgotten-mural-priest-passage-shelf', 6471, 104, 260],
    ['forgotten-mural-column-shelf', 6666, 44, 230],
    ['forgotten-mural-upper-doorway-floor', 6850, -42, 250],
    ['forgotten-mural-alcove-floor', 5010, 318, 2600],
    ['forgotten-mural-forward-passage-step', 6908, -54, 220],
    ['forgotten-mural-return-masonry', 6885, 52, 235],
  ].forEach(([id, x, y, width]) => {
    const platformRow = getDataRowById(platforms, id);
    assert.match(platformRow, new RegExp(`x:\\s*${x}[\\s\\S]*?y:\\s*JY\\(${y}\\)[\\s\\S]*?width:\\s*${width}[\\s\\S]*?invisible:\\s*true`));
    assert.doesNotMatch(platformRow, /secretVisibility:\s*'visible'/);
  });
  assert.doesNotMatch(platforms, /id:\s*'forgotten-mural-lower-masonry'/);
  assert.doesNotMatch(platforms, /id:\s*'forgotten-mural-lower-return'/);
  assert.doesNotMatch(platforms, /forgotten-mural[\s\S]*?floating/i);
  assert.match(shards, /\{\s*x:\s*934,\s*y:\s*-120,\s*hidden:\s*true,\s*routeId:\s*'desert-upper-survey-route'\s*\}/);
  assert.doesNotMatch(storyProps, /id:\s*'upper-route-note-marker'/);
  assert.ok(existsSync(forgottenMuralAlcoveClimbStructurePath), 'Forgotten Mural Alcove generated PNG should exist in desert-temple assets');
  assert.ok(existsSync(forgottenMuralChamberSourcePath), 'Forgotten Mural Chamber source PNG should exist in desert-temple assets');
  assert.ok(existsSync(forgottenMuralChamberPath), 'Forgotten Mural Chamber production PNG should exist in desert-temple assets');
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_SRC = 'assets\/expedition\/environment\/desert-temple\/forgotten-mural-alcove-climb-structure\.png'/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_SRC = 'assets\/expedition\/environment\/desert-temple\/forgotten-mural-chamber\.png'/);
  assert.match(journeyComponentSource, /forgottenMuralAlcoveStructureRef/);
  assert.match(journeyComponentSource, /forgottenMuralChamberRef/);
  assert.match(storyProps, /id:\s*'forgotten-mural-climb-structure'[\s\S]*?type:\s*'generated-climb-structure'[\s\S]*?depth:\s*'route-edge'/);
  assert.doesNotMatch(storyProps, /id:\s*'forgotten-mural-alcove-panel'/);
  assert.match(journeyComponentSource, /prop\.type === 'generated-climb-structure'/);
  assert.match(journeyComponentSource, /drawForgottenMuralGeneratedAsset/);
  assert.match(journeyComponentSource, /const visibilityWidth = Math\.max\(440, Number\(prop\.width\) \|\| 0\)/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(structureAsset\.image/);
  assert.doesNotMatch(journeyComponentSource, /drawForgottenMuralStructure/);
  assert.doesNotMatch(journeyComponentSource, /drawForgottenMuralStair/);
  assert.match(events, /id:\s*'upper-route-choice'[\s\S]*?A faint scarab glow leaks from a cracked mural high above\./);
  assert.match(events, /id:\s*'forgotten-mural-looter-shadow'[\s\S]*?type:\s*'looter-shadow'/);
  assert.match(events, /A shadow moves above the ruins\. A blue scarab glow vanishes into the upper doorway\./);
  assert.match(journeyComponentSource, /event\.type === 'looter-shadow'/);
  assert.match(journeyComponentSource, /drawForgottenMuralChamberInterior/);
  assert.match(journeyComponentSource, /drawForgottenMuralChamberTransition/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION = 2\.15/);
  assert.match(journeyComponentSource, /phase:\s*'doorway-fade'/);
  assert.match(journeyComponentSource, /JOURNEY_SCENE_IDS = Object\.freeze/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER:\s*'forgotten-mural-chamber'/);
  assert.match(journeyComponentSource, /currentSceneId:\s*getJourneySceneId\(current\)/);
  assert.match(journeyComponentSource, /sceneTransitionState:/);
  assert.match(journeyComponentSource, /sceneReturn:/);
  assert.match(journeyComponentSource, /isEntityActiveInScene\(platform, current\)/);
  assert.match(journeyComponentSource, /isEntityActiveInScene\(hazard, current\)/);
  assert.match(journeyComponentSource, /isEntityActiveInScene\(secret, current\)/);
  assert.match(journeyComponentSource, /if \(!isEntityActiveInScene\(e, current\)\) return;/);
  assert.match(journeyComponentSource, /if \(!isEntityActiveInScene\(g, current\)\) return;/);
  assert.match(scarabFragment, /sceneId:\s*'forgotten-mural-chamber'/);
  assert.match(scarabFragmentTwo, /sceneId:\s*'forgotten-mural-chamber'/);
  assert.match(scarabFragmentThree, /sceneId:\s*'forgotten-mural-chamber'/);
  assert.match(platforms, /id:\s*'forgotten-mural-alcove-floor'[\s\S]*?sceneId:\s*'forgotten-mural-chamber'/);
  assert.match(journeyComponentSource, /lockMovement:\s*true/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_SWITCH_SECONDS/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN = \{/);
  assert.match(journeyComponentSource, /x:\s*scaleJourneyX\(918\)/);
  assert.match(journeyComponentSource, /y:\s*openingJourneyY\(318\)/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK = \{[\s\S]*?x:\s*scaleJourneyX\(1220\)[\s\S]*?y:\s*openingJourneyY\(318\)/);
  assert.doesNotMatch(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK = \{[\s\S]*?x:\s*scaleJourneyX\(1030\)/);
  assert.doesNotMatch(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK = \{[\s\S]*?x:\s*scaleJourneyX\(665\)/);
  assert.match(journeyComponentSource, /player\.x = FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN\.x - player\.width \/ 2/);
  assert.match(journeyComponentSource, /player\.y = FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN\.y - player\.height/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_CAMERA_X = scaleJourneyX\(880\)/);
  assert.match(journeyComponentSource, /mode:\s*'fixed-scene'/);
  assert.match(journeyComponentSource, /targetCameraX:\s*FORGOTTEN_MURAL_CHAMBER_CAMERA_X/);
  assert.match(journeyComponentSource, /player\.x = clamp\([\s\S]*?FORGOTTEN_MURAL_CHAMBER_BOUNDS\.minX[\s\S]*?FORGOTTEN_MURAL_CHAMBER_BOUNDS\.maxX - player\.width/);
  assert.match(journeyComponentSource, /id:\s*'forgotten-mural-chamber-exit'/);
  assert.match(journeyComponentSource, /toSceneId:\s*JOURNEY_SCENE_IDS\.EXTERIOR/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER = \{[\s\S]*?minX:\s*scaleJourneyX\(1213\)[\s\S]*?maxX:\s*scaleJourneyX\(1247\)/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER = \{[\s\S]*?footY:\s*openingJourneyY\(-42\)[\s\S]*?footTolerance:\s*18/);
  assert.match(platforms, /id:\s*'forgotten-mural-upper-doorway-floor'[\s\S]*?x:\s*6850[\s\S]*?y:\s*JY\(-42\)[\s\S]*?width:\s*250/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER = \{[\s\S]*?minX:\s*scaleJourneyX\(880\)[\s\S]*?maxX:\s*scaleJourneyX\(906\)[\s\S]*?maxY:\s*GROUND_Y - 20/);
  assert.match(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER = \{[\s\S]*?footY:\s*openingJourneyY\(318\)[\s\S]*?footTolerance:\s*20/);
  assert.doesNotMatch(journeyComponentSource, /FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER = \{[\s\S]*?maxX:\s*scaleJourneyX\(950\)/);
  assert.match(journeyComponentSource, /forgottenMuralChamberActive/);
  assert.match(journeyComponentSource, /forgottenMuralLooterSeen/);
  assert.match(journeyComponentSource, /forgottenMuralChamberRestored/);
  assert.match(journeyComponentSource, /forgottenMuralChamberTransitionState/);
  assert.match(journeyComponentSource, /forgottenMuralPlayerCenterX >= FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER\.minX/);
  assert.match(journeyComponentSource, /forgottenMuralPlayerCenterX <= FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER\.maxX/);
  assert.match(journeyComponentSource, /player\.y < FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER\.maxY/);
  assert.match(journeyComponentSource, /currentSceneId === JOURNEY_SCENE_IDS\.EXTERIOR[\s\S]*?&& player\.onGround[\s\S]*?FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER\.minX/);
  assert.match(journeyComponentSource, /Math\.abs\(forgottenMuralPlayerFootY - FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER\.footY\) <= FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER\.footTolerance/);
  assert.match(journeyComponentSource, /Math\.abs\(forgottenMuralPlayerFootY - FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER\.footY\) <= FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER\.footTolerance/);
  assert.match(journeyComponentSource, /const desiredSecretVerticalCameraOffset = !chamberSceneActive && inForgottenMuralVerticalWindow/);
  assert.match(journeyUtilsSource, /forgottenMuralChamberActive:\s*false/);
  assert.match(journeyUtilsSource, /forgottenMuralChamberTransition:\s*null/);
  assert.match(journeyUtilsSource, /currentSceneId:\s*'egypt-exterior-route'/);
  assert.match(journeyUtilsSource, /sceneTransition:\s*null/);
  assert.match(journeyUtilsSource, /sceneReturn:\s*null/);
  assert.match(journeyUtilsSource, /forgottenMuralLooterSeen:\s*false/);

  assert.match(routeGates, /id:\s*'temple-approach-seal'[\s\S]*?requires:\s*\{[\s\S]*?shards:\s*4/);
  assert.match(routeGates, /id:\s*'guardian-prep-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry'[\s\S]*?shards:\s*6/);
  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry',\s*miniBoss:\s*'scarab-queen',\s*keyItem:\s*'brush-handle',\s*shards:\s*10/);
  assert.match(journeyComponentSource, /forgottenMuralRestored:\s*Boolean\(current\.forgottenMuralChamberRestored/);
  assert.match(journeyComponentSource, /secret\.restorationSetId === 'forgotten-mural-seal'/);
  assert.match(journeyComponentSource, /forgottenMuralCameraFrameActive/);
  assert.match(journeyComponentSource, /secretVerticalCameraOffset/);
  assert.match(journeyComponentSource, /name:\s*restoredForgottenMural \? 'Anubis' : 'Secret Found'/);
  assert.match(journeyComponentSource, /You restored what others tried to erase\. I saw it\./);
  assert.match(journeyComponentSource, /You pass my seals, but I still see only an intruder\./);
  assert.doesNotMatch(journeyComponentSource, /class\s+SecretRoute|createSecretSystem|SecretRouteController|class\s+LooterAI|createRoomSystem|new\s+PlayerController/);
});

test('scribe locked chamber reuses the Journey scene and challenge systems for optional Egypt decoding', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');
  const platforms = extractExportedArray('PLATFORMS');
  const storyProps = extractExportedArray('STORY_PROPS');
  const scribeRoute = getDataRowById(hiddenRoutes, 'scribe-locked-chamber-route');
  const chamberFloor = getDataRowById(platforms, 'scribe-locked-chamber-floor');
  const scribeDoorway = getDataRowById(storyProps, 'scribe-chamber-doorway-structure');

  assert.match(scribeRoute, /name:\s*'The Scribe\\'s Locked Chamber'/);
  assert.match(scribeRoute, /civilisation:\s*'Ancient Egypt'/);
  assert.match(scribeRoute, /sectionId:\s*'desert-entry'/);
  assert.match(scribeRoute, /optional:\s*true/);
  assert.match(scribeRoute, /x:\s*X\(1684\)/);
  assert.match(scribeRoute, /y:\s*JY\(62\)/);
  assert.match(scribeRoute, /rewardHint:\s*'A raised scribe doorway glows above the ruined stairs\.'/);
  assert.match(scribeRoute, /gateType:\s*'sealed scribe doorway'/);
  assert.match(scribeRoute, /rewardSummary:\s*'Hieroglyphic translation puzzle and protected knowledge clue'/);
  assert.match(chamberFloor, /sceneId:\s*'scribe-locked-chamber'/);
  assert.match(storyProps, /id:\s*'scribe-chamber-doorway-structure'[\s\S]*?type:\s*'generated-scribe-chamber-doorway'[\s\S]*?depth:\s*'route-edge'/);
  assert.match(scribeDoorway, /sectionId:\s*'desert-entry'/);
  assert.match(scribeDoorway, /x:\s*X\(1685\)/);
  assert.match(scribeDoorway, /y:\s*JY\(-259\)/);
  assert.match(scribeDoorway, /width:\s*1120/);
  assert.match(scribeDoorway, /height:\s*620/);
  [
    ['scribe-chamber-collapsed-stair-slab', '1642', '238', '120'],
    ['scribe-chamber-middle-rubble-landing', '1668', '198', '235'],
    ['scribe-chamber-upper-carved-landing', '1678', '122', '210'],
    ['scribe-chamber-doorway-threshold', '1684', '62', '180'],
  ].forEach(([platformId, authoredX, authoredY, width]) => {
    const platform = getDataRowById(platforms, platformId);
    assert.match(platform, new RegExp(`x:\\s*X\\(${authoredX}\\)`));
    assert.match(platform, new RegExp(`y:\\s*JY\\(${authoredY}\\)`));
    assert.match(platform, new RegExp(`width:\\s*${width}`));
    assert.match(platform, /invisible:\s*true/);
  });
  assert.doesNotMatch(platforms, /id:\s*'scribe-chamber-buried-lower-block'/);
  assert.ok(hiddenRoutes.indexOf("id: 'desert-upper-survey-route'") < hiddenRoutes.indexOf("id: 'scribe-locked-chamber-route'"));
  assert.ok(hiddenRoutes.indexOf("id: 'scribe-locked-chamber-route'") < hiddenRoutes.indexOf("id: 'temple-cracked-wall-passage'"));
  assert.match(journeyUtilsSource, /scribeChamberEntered:\s*false/);
  assert.match(journeyUtilsSource, /scribeChamberDoorSealed:\s*false/);
  assert.match(journeyUtilsSource, /scribeChamberTabletInspected:\s*false/);
  assert.match(journeyUtilsSource, /scribeChamberWallInspected:\s*false/);
  assert.match(journeyUtilsSource, /scribeChamberExitUnlocked:\s*false/);
  assert.match(journeyUtilsSource, /scribeChamberPuzzleSolved:\s*false/);
  assert.match(journeyComponentSource, /SCRIBE_LOCKED_CHAMBER:\s*'scribe-locked-chamber'/);
  assert.ok(existsSync(scribeChamberExteriorPath), 'Scribe Chamber exterior production PNG should exist');
  assert.match(journeyComponentSource, /SCRIBE_CHAMBER_EXTERIOR_SRC = 'assets\/expedition\/environment\/desert-temple\/scribe-locked-chamber-exterior-climb-structure\.png'/);
  assert.match(journeyComponentSource, /SCRIBE_CHAMBER_EXTERIOR_VERSION = 'imagegen-scribe-locked-chamber-exterior-climb-structure-2026-05-28'/);
  assert.match(journeyComponentSource, /scribeChamberExteriorRef/);
  assert.match(journeyComponentSource, /drawScribeChamberDoorwayStructure/);
  assert.match(journeyComponentSource, /scribeChamberExteriorLoaded:\s*scribeChamberExteriorRef\.current\.loaded/);
  assert.match(journeyComponentSource, /prop\.type === 'generated-scribe-chamber-doorway'/);
  assert.match(journeyComponentSource, /drawScribeLockedChamberInterior/);
  assert.match(journeyComponentSource, /Scribe Chamber Decoding/);
  assert.match(journeyComponentSource, /Sun \+ Water \+ Ankh \+ Door/);
  assert.match(journeyComponentSource, /Follow the light, cross the river, protect life, and the door will open\./);
  assert.match(journeyComponentSource, /That does not match the message\. I need to look again\./);
  assert.match(journeyComponentSource, /Knowledge was the key\./);
  assert.match(journeyComponentSource, /scribeChamberExitUnlocked/);
  assert.match(journeyComponentSource, /activeGuardianChallenge\.type === 'scribe-chamber-puzzle'/);
  assert.match(journeyComponentSource, /SCRIBE_CHAMBER_RETURN_FALLBACK = \{[\s\S]*?x:\s*scaleJourneyX\(1684\)[\s\S]*?y:\s*openingJourneyY\(122\)/);
  assert.match(journeyComponentSource, /SCRIBE_CHAMBER_ENTRY_TRIGGER = \{[\s\S]*?minX:\s*scaleJourneyX\(1684\)[\s\S]*?maxX:\s*scaleJourneyX\(1714\)[\s\S]*?footY:\s*openingJourneyY\(62\)/);
  assert.match(journeyComponentSource, /scarabQueenRequiresScribe/);
  assert.match(journeyComponentSource, /!current\.scribeChamberPuzzleSolved/);
  assert.doesNotMatch(journeyComponentSource, /createScribeEscapeRoomMode|ScribeEscapeRoom\.jsx/);
});

test('Egypt chamber exteriors have a ten-second walking rhythm before the Queen', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');
  const routeGates = extractExportedArray('ROUTE_GATES');
  const miniBosses = extractExportedArray('MINI_BOSSES');
  const sections = extractExportedArray('SECTIONS');

  const mummificationDoorX = 770;
  const muralDoorX = 1230;
  const scribeDoorX = 1690;
  const queenX = 2150;
  const secondsAtAshaSpeed = (from, to) => ((to - from) * 5.65) / 260;

  [
    ['mummification-to-mural', mummificationDoorX, muralDoorX],
    ['mural-to-scribe', muralDoorX, scribeDoorX],
    ['scribe-to-queen', scribeDoorX, queenX],
  ].forEach(([, from, to]) => {
    assert.ok(secondsAtAshaSpeed(from, to) >= 9.9);
  });

  assert.match(sections, /id:\s*'desert-entry'[\s\S]*?end:\s*X\(2360\)/);
  assert.match(sections, /id:\s*'ruined-temple'[\s\S]*?start:\s*X\(2360\)/);
  assert.match(hiddenRoutes, /id:\s*'mummification-chamber-route'[\s\S]*?x:\s*X\(520\)/);
  assert.match(hiddenRoutes, /id:\s*'desert-upper-survey-route'[\s\S]*?x:\s*X\(1125\)/);
  assert.match(hiddenRoutes, /id:\s*'scribe-locked-chamber-route'[\s\S]*?x:\s*X\(1684\)/);
  assert.match(miniBosses, /id:\s*'scarab-queen'[\s\S]*?x:\s*X\(2150\)[\s\S]*?arenaStart:\s*X\(2020\)[\s\S]*?arenaEnd:\s*X\(2235\)/);
  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?x:\s*X\(2285\)/);
});

test('Egypt chamber interiors stay separate and exit back to their exterior artwork doorways', () => {
  assert.match(
    journeyComponentSource,
    /id:\s*'mummification-chamber-exit',\s*phase:\s*'doorway-fade',\s*fromSceneId:\s*JOURNEY_SCENE_IDS\.MUMMIFICATION_CHAMBER,\s*toSceneId:\s*JOURNEY_SCENE_IDS\.EXTERIOR,/,
  );
  assert.match(
    journeyComponentSource,
    /id:\s*'forgotten-mural-chamber-exit',\s*phase:\s*'doorway-fade',\s*fromSceneId:\s*JOURNEY_SCENE_IDS\.FORGOTTEN_MURAL_CHAMBER,\s*toSceneId:\s*JOURNEY_SCENE_IDS\.EXTERIOR,/,
  );
  assert.match(
    journeyComponentSource,
    /SCRIBE_CHAMBER_RETURN_FALLBACK = \{[\s\S]*?x:\s*scaleJourneyX\(1684\)[\s\S]*?y:\s*openingJourneyY\(122\)[\s\S]*?direction:\s*1/,
  );
});

test('Sacred Record Way worldbuilding connects Egypt evidence chambers through background landmarks', () => {
  const storyProps = extractExportedArray('STORY_PROPS');
  const landmarks = extractExportedArray('WORLD_CONTINUITY_LANDMARKS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const backgroundBeats = [
    ['sacred-record-way-mummification-link', 'mummification-link', 'body preparation records continue behind the route'],
    ['sacred-record-way-mural-link', 'mural-link', 'mural images turn into caption marks'],
    ['sacred-record-way-scribe-link', 'scribe-link', 'script panels point toward the Scribe Chamber'],
  ];

  backgroundBeats.forEach(([id, assetKey, storyText]) => {
    const landmark = getDataRowById(landmarks, id);
    assert.match(landmark, /sectionId:\s*'desert-entry'/);
    assert.match(landmark, /type:\s*'record-way-png'/);
    assert.match(landmark, new RegExp(`assetKey:\\s*'${assetKey}'`));
    assert.match(landmark, /parallax:\s*0\.[12]/);
    assert.match(landmark, /layer:\s*'between-chambers'/);
    assert.match(landmark, /PNG background art/);
    assert.match(landmark, new RegExp(storyText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  assert.ok(landmarks.indexOf("id: 'sacred-record-way-mummification-link'") < landmarks.indexOf("id: 'sacred-record-way-mural-link'"));
  assert.ok(landmarks.indexOf("id: 'sacred-record-way-mural-link'") < landmarks.indexOf("id: 'sacred-record-way-scribe-link'"));
  assert.doesNotMatch(storyProps, /id:\s*'sacred-record-way-/);

  [
    ['record-way-body-to-image', 'Sacred Record Way', 'body, image, writing, then the guardian'],
    ['record-way-images-become-symbols', 'Broken Image Field', 'The pictures become symbols here'],
    ['record-way-knowledge-under-guard', 'Knowledge Under Guard', 'The scribes protected knowledge'],
  ].forEach(([id, name, message]) => {
    const event = getDataRowById(events, id);
    assert.match(event, /sectionId:\s*'desert-entry'/);
    assert.match(event, new RegExp(`name:\\s*'${name}'`));
    assert.match(event, new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  [
    'sacred-record-way-mummification-link.png',
    'sacred-record-way-mural-link.png',
    'sacred-record-way-scribe-link.png',
  ].forEach((filename) => {
    assert.ok(
      existsSync(new URL(`../../../public/assets/expedition/environment/desert-temple/${filename}`, import.meta.url)),
      `${filename} should exist as a generated PNG background asset`,
    );
    assert.match(journeyComponentSource, new RegExp(filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
  assert.match(journeyComponentSource, /landmark\.type === 'record-way-png'/);
  assert.match(journeyComponentSource, /sacredRecordWayBackgroundRef/);
  assert.doesNotMatch(journeyComponentSource, /SacredRecordWaySystem|createWorldbuildingSystem|RecordWayController/);
});

test('Sacred Record Way polish does not add foreground inspection interactions or runtime state', () => {
  const interactions = extractExportedArray('ENVIRONMENT_INTERACTIONS');

  assert.doesNotMatch(interactions, /record-way-inspection/);
  assert.doesNotMatch(interactions, /record-way-[a-z-]+-inspection/);
  assert.doesNotMatch(journeyComponentSource, /recordWayInspectedIds/);
  assert.doesNotMatch(journeyComponentSource, /recordWayInspectionCount/);
  assert.doesNotMatch(journeyComponentSource, /interaction\.type === 'record-way-inspection'/);
  assert.doesNotMatch(journeyUtilsSource, /recordWayInspectedIds/);
});

test('mummification chamber exterior reuses Journey routes, ledges, assets, and entrance discovery before the mural room', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');
  const platforms = extractExportedArray('PLATFORMS');
  const storyProps = extractExportedArray('STORY_PROPS');
  const mummificationRoute = getDataRowById(hiddenRoutes, 'mummification-chamber-route');
  const muralRoute = getDataRowById(hiddenRoutes, 'desert-upper-survey-route');
  const exteriorStructure = getDataRowById(storyProps, 'mummification-chamber-exterior-structure');

  assert.ok(existsSync(mummificationChamberExteriorPath), 'Mummification Chamber exterior art should exist as a project asset');
  assert.match(mummificationRoute, /name:\s*'The Mummification Chamber'/);
  assert.match(mummificationRoute, /civilisation:\s*'Ancient Egypt'/);
  assert.match(mummificationRoute, /sectionId:\s*'desert-entry'/);
  assert.match(mummificationRoute, /optional:\s*true/);
  assert.match(mummificationRoute, /x:\s*X\(520\)/);
  assert.match(muralRoute, /x:\s*X\(1125\)/);
  assert.ok(hiddenRoutes.indexOf("id: 'mummification-chamber-route'") < hiddenRoutes.indexOf("id: 'desert-upper-survey-route'"));
  assert.match(mummificationRoute, /gateType:\s*'partly buried sacred doorway'/);
  assert.match(mummificationRoute, /first sacred mystery/i);
  assert.match(exteriorStructure, /type:\s*'generated-mummification-chamber-entrance'/);
  assert.match(exteriorStructure, /depth:\s*'route-edge'/);
  [
    ['mummification-chamber-bottom-secret-threshold', '638', '312', '176'],
    ['mummification-chamber-sand-buried-block', '647', '278', '176'],
    ['mummification-chamber-far-left-ground-shelf', '563', '230', '176'],
    ['mummification-chamber-left-lower-terrace', '586', '170', '311'],
    ['mummification-chamber-left-sandstone-shelf', '586', '30', '212'],
    ['mummification-chamber-left-column-cap', '606', '-8', '130'],
    ['mummification-chamber-central-left-shelf', '657', '203', '210'],
    ['mummification-chamber-central-drop-slab', '681', '110', '192'],
    ['mummification-chamber-carved-lower-ledge', '708', '55', '212'],
    ['mummification-chamber-right-low-landing', '724', '295', '197'],
    ['mummification-chamber-right-stair-landing', '701', '190', '155'],
    ['mummification-chamber-right-column-cap', '726', '25', '212'],
    ['mummification-chamber-upper-rite-ledge', '684', '-54', '218'],
    ['mummification-chamber-left-doorway-ledge', '659', '-101', '259'],
    ['mummification-chamber-upper-left-platform', '659', '-200', '238'],
    ['mummification-chamber-upper-right-platform', '745', '-101', '228'],
    ['mummification-chamber-doorway-floor', '708', '-167', '228'],
  ].forEach(([id, authoredX, authoredY, width]) => {
    const platform = getDataRowById(platforms, id);
    assert.match(platform, new RegExp(`x:\\s*X\\(${authoredX}\\)`));
    assert.match(platform, new RegExp(`y:\\s*JY\\(${authoredY}\\)`));
    assert.match(platform, new RegExp(`width:\\s*${width}`));
    assert.match(platform, /secret:\s*true/);
    assert.match(platform, /invisible:\s*true/);
  });
  assert.ok(platforms.indexOf("id: 'mummification-chamber-doorway-floor'") < platforms.indexOf("id: 'forgotten-mural-carved-wall-ledge'"));
  assert.match(journeyUtilsSource, /mummificationChamberEntranceDiscovered:\s*false/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_EXTERIOR_SRC = 'assets\/expedition\/environment\/desert-temple\/mummification-chamber-exterior-climb-structure\.png'/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_ENTRY_TRIGGER = \{[\s\S]*?minX:\s*scaleJourneyX\(720\)[\s\S]*?maxX:\s*scaleJourneyX\(748\)/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_ENTRY_TRIGGER = \{[\s\S]*?footY:\s*openingJourneyY\(-167\)[\s\S]*?footTolerance:\s*22/);
  assert.match(journeyComponentSource, /drawMummificationChamberExteriorAsset/);
  assert.match(journeyComponentSource, /prop\.type === 'generated-mummification-chamber-entrance'/);
  assert.match(journeyComponentSource, /discoveredHiddenRouteIds\?\.add\('mummification-chamber-route'\)/);
  assert.match(journeyComponentSource, /hiddenRoomsFound\?\.add\('mummification-chamber'\)/);
  assert.match(journeyComponentSource, /mummificationChamberEntranceDiscovered:\s*Boolean\(current\.mummificationChamberEntranceDiscovered\)/);
  assert.match(journeyComponentSource, /secretClimbRouteIds = \['mummification-chamber-route', 'desert-upper-survey-route'\]/);
  assert.doesNotMatch(journeyComponentSource, /createMummificationRoomSystem|MummificationChamber\.jsx|class\s+MummificationRoom/);
});

test('mummification chamber entrance uses the existing Journey chamber transition and sealed interior state', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const chamberFloor = getDataRowById(platforms, 'mummification-chamber-floor');

  assert.match(chamberFloor, /sceneId:\s*'mummification-chamber'/);
  assert.match(journeyUtilsSource, /mummificationChamberEntered:\s*false/);
  assert.match(journeyUtilsSource, /mummificationChamberActive:\s*false/);
  assert.match(journeyUtilsSource, /mummificationChamberDoorSealed:\s*false/);
  assert.match(journeyUtilsSource, /mummificationChamberExitUnlocked:\s*false/);
  assert.match(journeyUtilsSource, /mummificationChamberPuzzleSolved:\s*false/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER:\s*'mummification-chamber'/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_ENTRY_SPAWN = \{/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_RETURN_FALLBACK = \{/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_EXIT_TRIGGER = \{/);
  assert.match(journeyComponentSource, /isMummificationChamberScene/);
  assert.match(journeyComponentSource, /drawMummificationChamberInterior/);
  assert.match(journeyComponentSource, /enteringMummificationChamber/);
  assert.match(journeyComponentSource, /toSceneId:\s*JOURNEY_SCENE_IDS\.MUMMIFICATION_CHAMBER/);
  assert.match(journeyComponentSource, /current\.mummificationChamberDoorSealed = true/);
  assert.match(journeyComponentSource, /current\.mummificationChamberExitUnlocked = Boolean\(current\.mummificationChamberPuzzleSolved\)/);
  assert.match(journeyComponentSource, /This chamber still holds power/);
  assert.match(journeyComponentSource, /This is a mummification chamber/);
  assert.match(journeyComponentSource, /The entrance sealed behind me/);
  assert.match(journeyComponentSource, /The entrance is sealed\. I need to solve the chamber first\./);
  assert.match(journeyComponentSource, /mummificationChamberEntered:\s*Boolean\(current\.mummificationChamberEntered\)/);
  assert.match(journeyComponentSource, /mummificationChamberDoorSealed:\s*Boolean\(current\.mummificationChamberDoorSealed\)/);
  assert.doesNotMatch(journeyComponentSource, /createMummificationRoomSystem|MummificationChamber\.jsx|class\s+MummificationRoom/);
});

test('mummification chamber interior uses a project-bound game-ready environment asset with readable puzzle zones', () => {
  assert.ok(existsSync(mummificationChamberInteriorPath), 'Mummification Chamber interior art should exist as a project asset');
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_INTERIOR_SRC = 'assets\/expedition\/environment\/desert-temple\/mummification-chamber-interior\.png'/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_INTERIOR_VERSION = 'imagegen-mummification-chamber-interior-2026-05-27'/);
  assert.match(journeyComponentSource, /mummificationChamberInteriorRef/);
  assert.match(journeyComponentSource, /image\.src = `\$\{import\.meta\.env\.BASE_URL\}\$\{MUMMIFICATION_CHAMBER_INTERIOR_SRC\}`/);
  assert.match(journeyComponentSource, /const chamberAsset = mummificationChamberInteriorRef\.current/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(chamberAsset\.image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT\)/);
  assert.match(journeyComponentSource, /mummificationChamberInteriorLoaded:\s*mummificationChamberInteriorRef\.current\.loaded/);
  assert.match(journeyComponentSource, /mummificationChamberPuzzleCenterpiece/);
  assert.match(journeyComponentSource, /mummificationChamberReadableZones/);
  assert.match(journeyComponentSource, /massive embalming table, wrapped mummy, floating linen, canopic jars, oils, Anubis statue, glowing hieroglyphics/);
});

test('mummification chamber interaction objects reuse Journey asset packs and notice dialogue', () => {
  assert.ok(existsSync(mummificationChamberInteractionAtlasPath), 'Mummification Chamber interaction atlas should exist as a project asset');
  [
    'embalmingTableMarker',
    'linenWrappings',
    'canopicJars',
    'ritualTablet',
    'oilsResins',
    'exitSeal',
  ].forEach((key) => {
    assert.ok(mummificationChamberInteractionAtlas.regions[key], `${key} should be present in the interaction atlas`);
    assert.match(journeyRenderAssetsSource, new RegExp(`'${key}'`));
  });
  assert.match(journeyRenderAssetsSource, /MUMMIFICATION_CHAMBER_INTERACTIONS_ATLAS_JSON/);
  assert.match(journeyRenderAssetsSource, /MUMMIFICATION_CHAMBER_INTERACTIONS:\s*'mummification-chamber-interactions'/);
  assert.match(journeyComponentSource, /mummificationInteractionAssetsRef = useRef\(createEnvironmentAssetState\(ENVIRONMENT_ASSET_PACK_IDS\.MUMMIFICATION_CHAMBER_INTERACTIONS\)\)/);
  assert.match(journeyComponentSource, /loadEnvironmentAssetPack\(\{[\s\S]*?packId:\s*ENVIRONMENT_ASSET_PACK_IDS\.MUMMIFICATION_CHAMBER_INTERACTIONS/);
  assert.match(journeyUtilsSource, /mummificationChamberInspectedObjectIds:\s*new Set\(\)/);
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS = Object\.freeze/);
  [
    'This table was used for preservation.',
    'The wrappings protected the body.',
    'These jars protected important organs.',
    'A guide to the ritual.',
    'Oils and resins prepared the body for the journey beyond.',
    'The seal responds to the completed ritual.',
  ].forEach((line) => {
    assert.match(journeyComponentSource, new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
  assert.match(journeyComponentSource, /current\.mummificationChamberPuzzleSolved = true/);
  assert.match(journeyComponentSource, /current\.mummificationChamberExitUnlocked = true/);
  assert.match(journeyComponentSource, /drawAtlasRegion\(ctx, interactionAssets, item\.assetKey/);
  assert.doesNotMatch(journeyComponentSource, /createMummificationInteractionSystem|MummificationInteractionObjects\.jsx|class\s+MummificationInteraction/);
});

test('mummification chamber ritual-order puzzle reuses activeGuardianChallenge and safely unlocks the exit', () => {
  [
    'Cleanse the body',
    'Remove organs and dry the body',
    'Anoint with oils and resins',
    'Wrap body in linen',
    'Place in sarcophagus with amulets',
  ].forEach((step) => {
    assert.match(journeyComponentSource, new RegExp(step.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_PUZZLE = \{/);
  assert.match(journeyComponentSource, /type:\s*'mummification-ritual-order-puzzle'/);
  assert.match(journeyComponentSource, /The seal asks for the ritual order\./);
  assert.match(journeyComponentSource, /current\.activeGuardianChallenge = \{[\s\S]*?\.\.\.MUMMIFICATION_CHAMBER_PUZZLE/);
  assert.match(journeyComponentSource, /That order does not seem right\./);
  assert.match(journeyComponentSource, /The ritual is complete\./);
  assert.match(journeyComponentSource, /challenge\.selectedAnswerIndex = null;[\s\S]*?challenge\.feedback = null;[\s\S]*?The seal waits for the correct ritual order\./);
  assert.match(journeyComponentSource, /current\.mummificationChamberPuzzleSolved = true/);
  assert.match(journeyComponentSource, /current\.mummificationChamberExitUnlocked = true/);
  assert.match(journeyComponentSource, /activeGuardianChallenge\.type === 'mummification-ritual-order-puzzle'/);
  assert.match(journeyComponentSource, /Mummification Ritual Order/);
  assert.doesNotMatch(journeyComponentSource, /createMummificationPuzzleSystem|MummificationPuzzle\.jsx|class\s+MummificationPuzzle/);
});

test('mummification chamber atmosphere wakes from existing inspection and puzzle state', () => {
  assert.match(journeyComponentSource, /MUMMIFICATION_CHAMBER_ATMOSPHERE_VERSION = 'mummification-chamber-atmosphere-progression-2026-05-28'/);
  assert.match(journeyComponentSource, /getMummificationChamberAtmosphere = \(current\) => \{/);
  assert.match(journeyComponentSource, /mummificationChamberInspectedObjectIds/);
  assert.match(journeyComponentSource, /activeGuardianChallenge\?\.type === 'mummification-ritual-order-puzzle'/);
  assert.match(journeyComponentSource, /mummificationChamberPuzzleSolved \|\| current\.mummificationChamberExitUnlocked/);
  assert.match(journeyComponentSource, /particleCount:\s*Math\.min\(32,/);
  assert.match(journeyComponentSource, /wakeProgress/);
  assert.match(journeyComponentSource, /glyphGlowAlpha/);
  assert.match(journeyComponentSource, /linenMotion/);
  assert.match(journeyComponentSource, /mummificationChamberAtmosphereVersion/);
  assert.match(journeyComponentSource, /mummificationChamberWakeProgress/);
  assert.match(journeyComponentSource, /mummificationChamberParticleCount/);
  assert.doesNotMatch(journeyComponentSource, /createMummificationAtmosphereSystem|MummificationAtmosphere\.jsx|class\s+MummificationAtmosphere/);
});

test('world continuity landmarks foreshadow future expedition sections', () => {
  const worldLandmarks = extractExportedArray('WORLD_CONTINUITY_LANDMARKS');
  const transitionMarkers = extractExportedArray('WORLD_TRANSITION_STORY_MARKERS');
  const stageEntranceFeatures = extractExportedArray('STAGE_ENTRANCE_FEATURES');

  assert.ok((worldLandmarks.match(/id:/g) || []).length >= 8);
  ['tower', 'mountains', 'excavation-camp', 'guardian-ruin', 'bridge', 'gate'].forEach((type) => {
    assert.match(worldLandmarks, new RegExp(`type:\\s*'${type}'`));
  });
  ['ruined-temple', 'catacombs', 'escape-sequence', 'dig-site-entrance'].forEach((sectionId) => {
    assert.match(worldLandmarks, new RegExp(`foreshadows:\\s*'${sectionId}'`));
  });
  assert.match(worldLandmarks, /larger-expedition-world/);
  assert.ok((transitionMarkers.match(/id:/g) || []).length >= 4);
  assert.match(transitionMarkers, /collapsed road leading to the temple doors/);
  assert.match(transitionMarkers, /camp lamps and carved stone over the final rise/);

  assert.equal((stageEntranceFeatures.match(/^\s{4}id:/gm) || []).length, 4);
  [
    'ruined-temple-colossus-gate',
    'catacomb-descent-doorway',
    'escape-breach-gate',
    'dig-site-arrival-gate',
  ].forEach((id) => {
    assert.match(stageEntranceFeatures, new RegExp(`id:\\s*'${id}'`));
  });
  ['ruined-temple', 'catacombs', 'escape-sequence', 'dig-site-entrance'].forEach((sectionId) => {
    assert.match(stageEntranceFeatures, new RegExp(`to:\\s*'${sectionId}'`));
  });
  assert.match(stageEntranceFeatures, /type:\s*'tomb-doorway'/);
  assert.match(stageEntranceFeatures, /id:\s*'ruined-temple-colossus-gate'[\s\S]*?yOffset:\s*13/);
  assert.match(stageEntranceFeatures, /id:\s*'ruined-temple-colossus-gate'[\s\S]*?permanentStructure:\s*true/);
  assert.match(stageEntranceFeatures, /width:\s*1260/);
  assert.match(stageEntranceFeatures, /height:\s*630/);
  assert.match(stageEntranceFeatures, /focusDistance:\s*560/);
  assert.match(journeyComponentSource, /STAGE_ENTRANCE_DOORWAY_SRC = 'assets\/expedition\/environment\/stage-entrances\/egypt-tomb-doorway-transition\.png'/);
  assert.match(journeyComponentSource, /STAGE_ENTRANCE_DOORWAY_VERSION = 'imagegen-egypt-tomb-doorway-transition-2026-05-20'/);
  assert.match(journeyComponentSource, /DESERT_END_GATEWAY_VERSION = 'imagegen-desert-end-threshold-angled-blended-2026-05-23'/);
  assert.match(journeyComponentSource, /stageEntranceDoorwayRef/);
  assert.match(journeyComponentSource, /Math\.min\(0,\s*CANVAS_HEIGHT - height\) \+ \(feature\.yOffset \|\| 0\)/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(doorwayAsset\.image/);
  assert.match(journeyComponentSource, /const permanentStructure = Boolean\(feature\.permanentStructure\)/);
  assert.match(journeyComponentSource, /if \(!permanentStructure\) \{[\s\S]*?drawContactShadow\(ctx, centerX, floorY \+ 2, width \* 0\.62, 0\.28, 1\.22\)/);
  assert.match(journeyComponentSource, /if \(!permanentStructure\) \{[\s\S]*?const vignette = ctx\.createRadialGradient[\s\S]*?ctx\.ellipse\(doorwayCenterX, doorwayCenterY, doorwayRadiusX, doorwayRadiusY/);
  assert.match(journeyComponentSource, /mode:\s*'stage-entrance'/);
  assert.match(journeyComponentSource, /nearbyStageEntrance\.x - CANVAS_WIDTH \* 0\.5/);
  assert.match(journeyComponentSource, /drawStageEntranceFeature/);
  assert.match(journeyComponentSource, /isStageEntrancePastArrivalForState/);
  assert.match(journeyComponentSource, /shouldRenderStageEntranceFeatureForState/);
  assert.match(journeyComponentSource, /playerSectionId === feature\.to/);
  assert.match(journeyComponentSource, /STAGE_ENTRANCE_FEATURES\.forEach/);
});

test('developer tools can jump to the start of every journey section', () => {
  const sections = extractExportedArray('SECTIONS');

  assert.match(devToolsSource, /import\s+\{\s*SECTIONS\s*\}\s+from\s+'\.\/expedition-journey\/journeyLevelData'/);
  assert.match(devToolsSource, /JOURNEY_SECTION_DEV_JUMPS\s*=\s*SECTIONS\.map/);
  assert.match(devToolsSource, /jumpToExpeditionStage\('journey-section-start'/);
  assert.match(devToolsSource, /sectionId:\s*jump\.id/);
  assert.match(devToolsSource, /Journey Starts/);

  assert.match(expeditionModeSource, /event\.detail\?\.target === 'journey-section-start'/);
  assert.match(journeyComponentSource, /handleExpeditionDevJump/);
  assert.match(journeyComponentSource, /target !== 'journey-section-start'/);
  assert.match(journeyComponentSource, /SECTIONS\.find\(section => section\.id === sectionId\)/);
  assert.match(journeyComponentSource, /const sectionCheckpoint = CHECKPOINTS\.find\(checkpoint => checkpoint\.id === section\.id\)/);
  assert.match(journeyComponentSource, /const jumpX = sectionCheckpoint\?\.x \?\? section\.start \+ 24/);
  assert.match(journeyComponentSource, /current\.activeCheckpoint = sectionCheckpoint \|\| current\.activeCheckpoint/);
  assert.match(journeyComponentSource, /current\.completedObjectiveIds\.add\(item\.id\)/);
  assert.match(journeyComponentSource, /current\.openedRouteGateIds\.add\(gate\.id\)/);

  ['desert-entry', 'ruined-temple', 'catacombs', 'escape-sequence', 'dig-site-entrance'].forEach((sectionId) => {
    assert.match(sections, new RegExp(`id:\\s*'${sectionId}'`));
  });
});

test('story props include recurring expedition markers across sections', () => {
  const storyProps = extractExportedArray('STORY_PROPS');

  assert.doesNotMatch(storyProps, /survey-flag-marker/);
  assert.doesNotMatch(storyProps, /opening-footprint-trail/);
  assert.doesNotMatch(storyProps, /opening-threshold-offering/);
  assert.doesNotMatch(storyProps, /upper-route-broken-stone-cue/);
  assert.doesNotMatch(storyProps, /distant-ruins/);
  assert.doesNotMatch(storyProps, /atmosphere-entry-distant-rubble/);
  assert.doesNotMatch(storyProps, /atmosphere-entry-far-door-frame/);
  assert.doesNotMatch(storyProps, /abandoned-camp/);
  assert.match(storyProps, /type:\s*'cart'/);
  assert.match(storyProps, /generated premium carved fallen column in open sand after the pyramid/);
  assert.match(storyProps, /base camp supply cart/);
  assert.match(journeyComponentSource, /STORY_PROP_GROUNDING_OVERRIDES/);
  assert.doesNotMatch(journeyComponentSource, /'upper-route-broken-stone-cue':\s*\{/);
  assert.match(journeyComponentSource, /'jackal-statue':\s*\{[\s\S]*?alpha:\s*0\.96[\s\S]*?depth:\s*'midground'/);
  assert.match(journeyComponentSource, /STORY_PROP_GROUNDING_OVERRIDES\[prop\.id\]\?\.depth/);
  assert.match(journeyComponentSource, /propSize\.bury/);
  assert.match(journeyComponentSource, /useNaturalUpperRouteHint/);
  assert.match(journeyComponentSource, /route\.id === 'desert-upper-survey-route'/);
});

test('Ancient Egypt opening stages archaeologist arrival and warrior-guide story with existing Journey systems', () => {
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const routeGates = extractExportedArray('ROUTE_GATES');
  const miniBosses = extractExportedArray('MINI_BOSSES');
  const bossKeyItems = extractExportedArray('BOSS_KEY_ITEMS');

  assert.match(storyProps, /id:\s*'opening-archaeologist-field-kit'/);
  assert.match(storyProps, /id:\s*'opening-guardian-warning-plinth'/);
  assert.match(storyProps, /id:\s*'opening-warrior-guide-marker'/);
  assert.match(storyProps, /warrior-guide protective seal marker/);
  assert.doesNotMatch(storyProps, /id:\s*'opening-sacred-threshold-guardian'/);
  assert.match(storyProps, /id:\s*'desert-entry-premium-column-1'/);
  ['camp', 'ceremonial-offering', 'sacred-pedestal'].forEach((type) => {
    assert.match(storyProps, new RegExp(`type:\\s*'${type}'`));
  });

  assert.match(events, /id:\s*'opening-archaeologist-arrival'/);
  assert.match(events, /The expedition reaches a huge sealed Egyptian site\./);
  assert.match(events, /id:\s*'opening-guardian-challenge'/);
  assert.match(events, /Anubis watches from the seal\. The site will not open without proof\./);
  assert.match(events, /id:\s*'opening-warrior-guide-entry'/);
  assert.match(events, /Asha guards the route toward excavation\./);
  assert.match(events, /id:\s*'relic-shard-purpose-note-read'/);
  assert.match(events, /Restore the fragments the seal still recognises\. Pass the guardians\. The site will test you\./);
  assert.match(events, /id:\s*'opening-guide-careful-tools'/);
  assert.match(events, /Good\. Evidence and tools open the path - not force\./);
  assert.match(events, /id:\s*'opening-sacred-threshold-watch'/);
  assert.match(events, /The guardian watches\. Prove you can move with care\./);
  assert.match(events, /card:\s*false/);
  assert.match(journeyComponentSource, /current\.cameraShakeTimer = ev\.duration \* 0\.4;/);
  assert.match(journeyComponentSource, /current\.cameraShakeStrength = ev\.shake;/);
  assert.match(journeyComponentSource, /cameraShakeActive: current\.cameraShakeTimer > 0/);

  assert.match(routeGates, /id:\s*'temple-approach-seal'[\s\S]*?requires:\s*\{[\s\S]*?shards:\s*4/);
  assert.match(routeGates, /The Temple Approach Seal refuses easy entry\. The lost fragments must prove Asha came to protect\./);
  assert.match(routeGates, /readyHint:\s*'The seal answers\. Move through the threshold before the site closes again\.'/);
  assert.match(routeGates, /openMessage:\s*'The seal answers, but it does not trust you\.'/);
  assert.match(routeGates, /id:\s*'guardian-prep-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry'[\s\S]*?shards:\s*6/);
  assert.match(routeGates, /The ancient Map Tablet and 6 lost fragments must be restored before the path deeper wakes\./);
  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry',\s*miniBoss:\s*'scarab-queen',\s*keyItem:\s*'brush-handle',\s*shards:\s*10/);
  assert.match(routeGates, /The Desert Map Seal waits for the Map Tablet, the Brush Handle, the fall of the Scarab Queen, and 10 lost fragments\./);
  assert.match(routeGates, /Carry the record forward into the ruined temple\./);
  assert.match(miniBosses, /id:\s*'scarab-queen'[\s\S]*?health:\s*1,\s*damage:\s*4/);
  assert.match(miniBosses, /The buried scarab lair splits open beneath the sand\. The Scarab Queen rises as the first trial of Anubis\. The site will not yield easily\./);
  assert.match(bossKeyItems, /id:\s*'brush-handle'[\s\S]*?The Scarab Queen falls\. Asha has permission, not trust\. Brush Handle recovered\. The Desert Map Seal answers\./);
  assert.match(journeyComponentSource, /const GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED = false;/);
});

test('Expedition framing presents Journey, Base Camp, and excavation as in-world adventure systems', () => {
  [
    'The site refuses easy entry',
    'Restore the outer seal',
    'Recover relic shards',
    'Read the Map Tablet',
    'Survive the Guardian Prep route',
    'Defeat the Scarab Queen',
    'Reach Base Camp Outpost',
    'Relic shards',
  ].forEach((copy) => assert.match(journeyComponentSource, new RegExp(copy)));

  [
    'Opening objective',
    'Base Camp shards',
  ].forEach((copy) => assert.doesNotMatch(journeyComponentSource, new RegExp(copy)));

  [
    'The Temple Approach Seal refuses easy entry. The lost fragments must prove Asha came to protect.',
    'Restore the fragments the seal still recognises. Pass the guardians. The site will test you.',
    'The site tests Asha. Restore 4 fragments the seal still recognises.',
    'First fragment restored. Three more will answer the seal.',
    'Restore the fragments the seal still recognises. Pass the guardians. The site will test you.',
    'Seal Test',
  ].forEach((copy) => assert.match(source, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  [
    'First objective',
    'Opening Objective',
    'Base Camp shards',
  ].forEach((copy) => assert.doesNotMatch(source, new RegExp(copy)));

  [
    'Base Camp Outpost',
    'Safe Hub Reached',
    'Working Theory',
    'Expedition Plan',
    'Field Journal',
    'Survey the Site',
    'Mark the Grid',
    'Survey focus',
    'Tool Bench',
    'Relic Table',
    'Route Map',
    'Discovery Log',
  ].forEach((copy) => assert.match(expeditionModeSource, new RegExp(copy)));

  [
    'Base Camp Checklist',
    'Active Mission',
    'Inquiry Question',
    'Field Instructions',
    'Mission Target',
    'Survey Before Digging',
    'Grid Before Excavating',
    'Investigation points',
    'Antiquities Bureau - Lost Site Expedition',
    'Antiquities Bureau - Site Survey',
    'Antiquities Bureau - Excavation Grid',
    'Antiquities Bureau - Final Claim',
  ].forEach((copy) => assert.doesNotMatch(expeditionModeSource, new RegExp(copy)));

  assert.match(menuSource, /Standalone Adventure/);
  assert.match(menuSource, /Cross the sealed route, face the first guardian, then return to Base Camp Outpost for fieldwork\./);
});

test('Egypt Phase 1 boss identity changes preserve progression ids and China names', () => {
  const miniBosses = extractExportedArray('MINI_BOSSES');
  const chinaMiniBosses = extractExportedArray('CHINA_MINI_BOSSES');
  const bossKeyItems = extractExportedArray('BOSS_KEY_ITEMS');
  const routeGates = extractExportedArray('ROUTE_GATES');

  [
    /id:\s*'scarab-queen'[\s\S]*?name:\s*'Scarab Queen'[\s\S]*?health:\s*1,\s*damage:\s*4[\s\S]*?domainName:\s*'First Guardian Domain'/,
    /id:\s*'temple-guardian'[\s\S]*?name:\s*'Anubis'[\s\S]*?health:\s*2,\s*damage:\s*6[\s\S]*?domainName:\s*'Anubis Gate'/,
    /id:\s*'giant-serpent'[\s\S]*?name:\s*'The Uraeus'[\s\S]*?health:\s*2,\s*damage:\s*6[\s\S]*?domainName:\s*'Uraeus Seal Domain'/,
    /id:\s*'looter-captain'[\s\S]*?name:\s*'Bes'[\s\S]*?health:\s*2,\s*damage:\s*6[\s\S]*?domainName:\s*'Bes Trial'/,
    /id:\s*'ancient-construct'[\s\S]*?name:\s*'The Sphinx'[\s\S]*?health:\s*3,\s*damage:\s*7[\s\S]*?domainName:\s*'Sphinx Gate'/,
  ].forEach((pattern) => assert.match(miniBosses, pattern));

  [
    'The buried scarab lair splits open beneath the sand. The Scarab Queen rises as the first trial of Anubis. The site will not yield easily.',
    'Anubis stands at the temple path. Only those who move with respect may pass.',
    'The Uraeus coils around the sacred seal. The path forward is protected.',
    'Bes blocks the broken passage with a fierce grin. This place will not be rushed.',
    'The Sphinx rises before the expedition site. These artefacts are protected for a reason.',
  ].forEach((text) => assert.match(miniBosses, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  [
    /id:\s*'scarab-queen'[\s\S]*?name:\s*'Clay River Guardian'/,
    /id:\s*'temple-guardian'[\s\S]*?name:\s*'Bronze Gate Warden'/,
    /id:\s*'giant-serpent'[\s\S]*?name:\s*'Jade Seal Guardian'/,
    /id:\s*'looter-captain'[\s\S]*?name:\s*'Archive Sentry Captain'/,
    /id:\s*'ancient-construct'[\s\S]*?name:\s*'Rammed-Earth Sentinel'/,
  ].forEach((pattern) => assert.match(chinaMiniBosses, pattern));

  [
    /id:\s*'brush-handle'[\s\S]*?bossId:\s*'scarab-queen'[\s\S]*?gateId:\s*'desert-seal'/,
    /id:\s*'trowel-blade'[\s\S]*?bossId:\s*'temple-guardian'[\s\S]*?gateId:\s*'temple-seal'/,
    /id:\s*'measuring-cord'[\s\S]*?bossId:\s*'giant-serpent'[\s\S]*?gateId:\s*'catacomb-seal'/,
    /id:\s*'field-notebook-clasp'[\s\S]*?bossId:\s*'looter-captain'[\s\S]*?gateId:\s*'escape-seal'/,
    /id:\s*'site-permit-seal'[\s\S]*?bossId:\s*'ancient-construct'[\s\S]*?gateId:\s*'basecamp-seal'/,
  ].forEach((pattern) => assert.match(bossKeyItems, pattern));

  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry',\s*miniBoss:\s*'scarab-queen',\s*keyItem:\s*'brush-handle',\s*shards:\s*10/);
  assert.match(routeGates, /id:\s*'temple-seal'[\s\S]*?miniBoss:\s*'temple-guardian'[\s\S]*?keyItem:\s*'trowel-blade'/);
  assert.match(routeGates, /id:\s*'catacomb-seal'[\s\S]*?miniBoss:\s*'giant-serpent'[\s\S]*?keyItem:\s*'measuring-cord'/);
  assert.match(routeGates, /id:\s*'escape-seal'[\s\S]*?miniBoss:\s*'looter-captain'[\s\S]*?keyItem:\s*'field-notebook-clasp'/);
  assert.match(routeGates, /id:\s*'basecamp-seal'[\s\S]*?miniBoss:\s*'ancient-construct'[\s\S]*?keyItem:\s*'site-permit-seal'/);
});

test('Anubis boss uses the approved Anubis sprite atlas through the existing temple-guardian slot', () => {
  assert.match(
    journeyBossSpritesSource,
    /STONE_GUARDIAN_SPRITE_ATLAS_JSON\s*=\s*`\$\{BOSS_SPRITE_BASE_PATH\}anubis-sprites\.json`/,
  );
  assert.equal(anubisBossAtlas.image, 'anubis-sprites.png');
  assert.equal(anubisBossAtlas.status, 'approved-for-journey-wiring');
  [
    'stoneGuardianIdle',
    'stoneGuardianWalk1',
    'stoneGuardianWalk2',
    'stoneGuardianAwakening',
    'stoneGuardianWindup',
    'stoneGuardianSlam',
    'stoneGuardianShockwave',
    'stoneGuardianShielded',
    'stoneGuardianCounterWindow',
    'stoneGuardianHit',
    'stoneGuardianDefeated',
  ].forEach((key) => {
    const target = anubisBossAtlas.journeyAliasContract[key];
    assert.ok(target, `${key} should alias to an Anubis frame`);
    assert.deepEqual(anubisBossAtlas.regions[key], anubisBossAtlas.regions[target]);
  });
});

test('Bes uses a dedicated guardian sprite pack through the existing mini-boss slot', () => {
  const miniBosses = extractExportedArray('MINI_BOSSES');

  assert.match(miniBosses, /id:\s*'looter-captain'[\s\S]*?name:\s*'Bes'/);
  assert.match(miniBosses, /id:\s*'looter-captain'[\s\S]*?type:\s*'bes'/);
  assert.match(
    journeyEnemySpritesSource,
    /BES_GUARDIAN_SPRITE_ATLAS_JSON\s*=\s*`\$\{ENEMY_SPRITE_BASE_PATH\}bes-guardian-sprites\.json`/,
  );
  assert.match(journeyEnemySpritesSource, /besGuardian:\s*\{[\s\S]*?atlasPath:\s*BES_GUARDIAN_SPRITE_ATLAS_JSON/);
  assert.match(journeyEnemySpritesSource, /if \(enemy\.type === 'bes' \|\| name\.includes\('bes'\)\) return 'besGuardian';/);
  assert.match(journeyComponentSource, /boss\.type === 'looter' \|\| boss\.type === 'bes'/);
  assert.equal(besEnemyAtlas.image, 'bes-guardian-sprites.png');
  [
    'besGuardianIdle',
    'besGuardianWalk1',
    'besGuardianWalk2',
    'besGuardianWalk3',
    'besGuardianWindup',
    'besGuardianAttack',
    'besGuardianHit',
    'besGuardianDefeated',
  ].forEach((key) => {
    assert.ok(besEnemyAtlas.regions[key], `${key} should exist in the Bes atlas`);
  });
});

test('opening Scarab Seal becomes a restrained false-discovery threshold scene', () => {
  const storyProps = extractExportedArray('STORY_PROPS');
  const platforms = extractExportedArray('PLATFORMS');
  const routeGates = extractExportedArray('ROUTE_GATES');
  const miniBosses = extractExportedArray('MINI_BOSSES');
  const bossKeyItems = extractExportedArray('BOSS_KEY_ITEMS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const hazards = extractExportedArray('HAZARDS');

  assert.match(source, /export const SCARAB_SEAL_TRIGGER = \{/);
  assert.match(source, /id:\s*'scarab-seal-trigger'/);
  assert.match(source, /name:\s*'Sacred Scarab Seal'/);
  assert.doesNotMatch(platforms, /invisible lower pyramid roof ledge/i);
  assert.doesNotMatch(platforms, /invisible middle pyramid terrace ledge/i);
  assert.doesNotMatch(platforms, /invisible middle pyramid roof ledge/i);
  assert.doesNotMatch(platforms, /invisible upper pyramid terrace ledge/i);
  assert.doesNotMatch(platforms, /invisible scarab artefact ledge/i);
  assert.doesNotMatch(platforms, /lower pyramid stair tread/i);
  assert.doesNotMatch(platforms, /carved pressure stair slab/i);
  assert.doesNotMatch(platforms, /upper lower-stair tread/i);
  assert.doesNotMatch(platforms, /upper pyramid stair helper/i);
  assert.doesNotMatch(platforms, /cracked summit trap slab/i);
  assert.match(storyProps, /id:\s*'early-scarab-seal-pedestal'/);
  assert.match(storyProps, /id:\s*'early-scarab-seal'/);
  assert.match(storyProps, /id:\s*'early-scarab-seal-pedestal'[\s\S]*?x:\s*925[\s\S]*?y:\s*JY\(-137\)/);
  assert.match(storyProps, /id:\s*'early-scarab-seal'[\s\S]*?x:\s*925[\s\S]*?y:\s*JY\(-164\)/);
  assert.match(journeyComponentSource, /'early-scarab-seal-pedestal':\s*\{[\s\S]*?width:\s*54[\s\S]*?height:\s*42[\s\S]*?yOffset:\s*0/);
  assert.match(journeyComponentSource, /'early-scarab-seal':\s*\{[\s\S]*?width:\s*38[\s\S]*?height:\s*38[\s\S]*?yOffset:\s*0/);
  assert.match(journeyComponentSource, /OPENING_SCARAB_SEAL_IMAGE_SRC = 'assets\/expedition\/environment\/egypt-opening\/scarab-seal-ground-embedded\.png'/);
  assert.match(journeyComponentSource, /openingScarabSealImageRef/);
  assert.doesNotMatch(journeyComponentSource, /prop\.id === 'early-scarab-seal-pedestal' \|\| prop\.id === 'early-scarab-seal'/);
  assert.match(journeyComponentSource, /'opening-seal-reset-trap':\s*'spikeTrap'/);
  assert.doesNotMatch(journeyComponentSource, /ctx\.drawImage\(trapSealImage\.image/);
  assert.match(events, /id:\s*'opening-scarab-seal-climb'/);
  assert.match(events, /id:\s*'opening-scarab-seal-climb'[\s\S]*?x:\s*X\(95\)/);

  assert.match(journeyUtilsSource, /scarabSealActivated:\s*false/);
  assert.match(journeyComponentSource, /scarabSealState:/);
  assert.match(journeyComponentSource, /current\.scarabSealActivated = true/);
  assert.match(journeyComponentSource, /current\.openingConfrontationSeen = true/);
  assert.match(journeyComponentSource, /current\.openingThresholdScene = \{/);
  assert.match(journeyComponentSource, /phase:\s*'false-discovery'/);
  assert.match(journeyComponentSource, /lockMovement:\s*true/);
  assert.match(journeyComponentSource, /transitionTargetSectionId:\s*'desert-entry'/);
  assert.match(journeyComponentSource, /OPENING_THRESHOLD_SCENE_DURATION = 14/);
  assert.match(journeyComponentSource, /OPENING_THRESHOLD_FADE_SECONDS = 1\.2/);
  assert.match(journeyComponentSource, /OPENING_THRESHOLD_STAIR_REVEAL_SECONDS = 3\.8/);
  assert.match(journeyComponentSource, /drawOpeningThresholdScene/);
  assert.match(journeyComponentSource, /getOpeningThresholdDialogueLine/);
  assert.match(journeyComponentSource, /current\.openingThresholdScene\.timer/);
  assert.match(journeyComponentSource, /completeOpeningThresholdScene\(current\)/);
  assert.match(journeyComponentSource, /window\.__setExpeditionOpeningThresholdTimer/);
  assert.match(journeyComponentSource, /const openingCheckpoint = CHECKPOINTS\.find\(checkpoint => checkpoint\.id === 'desert-entry'\)/);
  assert.match(journeyComponentSource, /current\.activeCheckpoint = openingCheckpoint/);
  assert.match(journeyComponentSource, /current\.sectionTransition = null/);
  assert.match(journeyComponentSource, /current\.lastSectionId = openingSection\?\.id \|\| 'desert-entry'/);
  assert.doesNotMatch(journeyComponentSource, /current\.openedRouteGateIds\.add\('temple-approach-seal'\)/);
  assert.doesNotMatch(journeyComponentSource, /current\.seenBossIntroIds\.add\(SCARAB_SEAL_TRIGGER\.bossId\)/);
  assert.match(journeyComponentSource, /current\.collapsedPlatformIds\.add\('opening-scarab-seal-summit'\)/);
  assert.match(journeyComponentSource, /current\.triggeredEnvironmentEventIds\.add\(SCARAB_SEAL_TRIGGER\.id\)/);
  assert.match(journeyComponentSource, /message:\s*SCARAB_SEAL_TRIGGER\.sealEmphasisMessage/);
  assert.match(journeyComponentSource, /current\.openingCameraRevealDuration = SCARAB_SEAL_TRIGGER\.cameraRevealDuration/);
  assert.match(journeyComponentSource, /current\.openingCameraRevealTimer = Math\.max\(current\.openingCameraRevealTimer \|\| 0, SCARAB_SEAL_TRIGGER\.cameraRevealDuration\)/);
  assert.match(journeyComponentSource, /SCARAB_SEAL_TRIGGER\.sealPulseLabel/);
  assert.match(journeyComponentSource, /current\.notice = SCARAB_SEAL_TRIGGER\.objectiveEchoLine/);
  assert.match(journeyComponentSource, /id:\s*'opening-first-objective-echo'/);
  assert.match(journeyUtilsSource, /openingFirstShardEchoSeen:\s*false/);
  assert.match(journeyComponentSource, /current\.scarabSealActivated[\s\S]*?!current\.openingFirstShardEchoSeen[\s\S]*?current\.relicShardCount === 1/);
  assert.match(journeyComponentSource, /current\.openingFirstShardEchoSeen = true;/);
  assert.match(journeyComponentSource, /id:\s*'opening-first-shard-echo'/);
  assert.match(journeyComponentSource, /message:\s*SCARAB_SEAL_TRIGGER\.firstShardEchoLine/);
  assert.match(journeyComponentSource, /const openMessage = gate\.id === 'temple-approach-seal'/);
  assert.match(journeyComponentSource, /current\.notice = guidance\.openMessage/);
  assert.match(journeyComponentSource, /id:\s*`\$\{activeLevelGate\.id\}-opened`/);
  assert.match(journeyComponentSource, /id:\s*`\$\{g\.id\}-opened`/);
  assert.match(journeyComponentSource, /current\.itemPurposeNoticeTimer = Math\.max\(current\.itemPurposeNoticeTimer \|\| 0, 2\.2\)/);
  assert.match(journeyComponentSource, /addRewardPulse\('route-gate-open'/);
  assert.match(journeyComponentSource, /current\.openingSphinxEncounter = \{/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_DURATION = 14;/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_EXIT_SECONDS = 2\.35;/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_ARRIVAL_SECONDS = 1\.05;/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_LINE_SECONDS = 2\.15;/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_SPRITE_BOSS_ID = 'ancient-construct';/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_APPARITION_SRC = 'assets\/expedition\/bosses\/anubis-apparition\.png';/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_SPRITE_VERSION = 'opening-anubis-apparition-2026-05-21';/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_SCREEN_Y_OFFSET = 112;/);
  assert.match(journeyComponentSource, /silhouetteReveal:\s*true/);
  assert.match(journeyComponentSource, /projectionReveal/);
  assert.match(journeyComponentSource, /projectionBuild/);
  assert.match(journeyComponentSource, /eyeGlint/);
  assert.match(journeyComponentSource, /cueTimes = \[6\.2,\s*10\.8,\s*14\.8,\s*18\.6,\s*22\.8,\s*26\.5,\s*31\.5\]/);
  assert.match(journeyComponentSource, /fissureCues = \[11\.9,\s*18\.6,\s*26\.5,\s*29\.8\]/);
  assert.ok(existsSync(egyptOpeningTombStairwellPath), 'opening tomb stairwell asset should exist');
  assert.match(journeyComponentSource, /OPENING_TOMB_STAIRWELL_SRC = 'assets\/expedition\/environment\/egypt-opening\/opening-tomb-stairwell\.png'/);
  assert.match(journeyComponentSource, /OPENING_TOMB_STAIRWELL_VERSION = 'opening-tomb-stairwell-generated-2026-05-21'/);
  assert.match(journeyComponentSource, /openingTombStairwellRef/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(tombStairwellAsset\.image/);
  assert.match(journeyComponentSource, /openingTombStairwellAssetLoaded = true/);
  assert.doesNotMatch(journeyComponentSource, /const stoneRows = \[/);
  assert.doesNotMatch(journeyComponentSource, /summitCoverX/);
  assert.match(journeyComponentSource, /playExpeditionSfx\?\.\('openingThresholdAtmosphere'\)/);
  assert.match(journeyComponentSource, /playExpeditionSfx\?\.\('openingThresholdFall'\)/);
  assert.match(journeyComponentSource, /playExpeditionSfx\?\.\('openingThresholdStoneShift'\)/);
  assert.match(journeyComponentSource, /playExpeditionSfx\?\.\('openingThresholdFinalPulse'\)/);
  assert.match(journeyComponentSource, /fallSfxPlayed:\s*false/);
  assert.match(journeyComponentSource, /stoneShiftSfxPlayed:\s*false/);
  assert.match(journeyComponentSource, /finalPulseSfxPlayed:\s*false/);
  assert.match(journeyComponentSource, /fallSfxPlayed:\s*Boolean\(current\.openingThresholdScene\.fallSfxPlayed\)/);
  assert.match(journeyComponentSource, /stoneShiftSfxPlayed:\s*Boolean\(current\.openingThresholdScene\.stoneShiftSfxPlayed\)/);
  assert.match(journeyComponentSource, /finalPulseSfxPlayed:\s*Boolean\(current\.openingThresholdScene\.finalPulseSfxPlayed\)/);
  assert.match(appSource, /openingThresholdAtmosphere:\s*\{/);
  assert.match(appSource, /openingThresholdFall:\s*\{/);
  assert.match(appSource, /openingThresholdStoneShift:\s*\{/);
  assert.match(appSource, /openingThresholdFinalPulse:\s*\{/);
  assert.match(appSource, /opening-desert-wind\.ogg/);
  assert.match(appSource, /id:\s*'wind-bed'[\s\S]*?loop:\s*true/);
  assert.match(appSource, /id:\s*'wind-high-drift'[\s\S]*?delay:\s*7200[\s\S]*?playbackRate:\s*1\.08[\s\S]*?loop:\s*true/);
  assert.match(appSource, /id:\s*'wind-low-swell'[\s\S]*?delay:\s*16400[\s\S]*?playbackRate:\s*0\.72[\s\S]*?loop:\s*true/);
  assert.match(appSource, /\$\{sfxKey\}:\$\{clip\.id \|\| clip\.path\}/);
  assert.match(appSource, /opening-deep-rumble\.ogg/);
  assert.match(appSource, /opening-earth-shake\.flac/);
  assert.match(source, /dialogueTiming:\s*\[0\.8,\s*3\.2,\s*5\.8,\s*8\.4,\s*11\]/);
  assert.match(source, /dialogueSpeakers:\s*\['Anubis',\s*'Anubis',\s*'Anubis',\s*'Asha',\s*'Objective'\]/);
  assert.match(journeyComponentSource, /message:\s*SCARAB_SEAL_TRIGGER\.messages\.join\(' '\)/);
  assert.match(journeyComponentSource, /lines:\s*SCARAB_SEAL_TRIGGER\.messages/);
  assert.match(journeyComponentSource, /visibleLineCount/);
  assert.match(journeyComponentSource, /dynamicEnvironmentEvent[\s\S]*?message:\s*SCARAB_SEAL_TRIGGER\.sealEmphasisMessage/);
  assert.match(journeyComponentSource, /current\.hitStopTimer = Math\.max\(current\.hitStopTimer, 0\.12\)/);
  assert.match(journeyComponentSource, /drawOpeningSphinxEncounter/);
  assert.match(journeyComponentSource, /openingSphinxApparitionRef = useRef\(\{ image: null, loaded: false, failed: false \}\)/);
  assert.match(journeyComponentSource, /openingSphinxApparitionRef\.current = \{ image, loaded: true, failed: false \}/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(apparitionAsset\.image,\s*drawBox\.x,\s*drawBox\.y,\s*drawBox\.width,\s*drawBox\.height\)/);
  assert.match(journeyComponentSource, /openingSphinxSpriteModel = 'opening-anubis-apparition'/);
  assert.match(journeyComponentSource, /openingSphinxSpriteFrame = 'openingAnubisApparition'/);
  assert.match(journeyComponentSource, /getBossSpritePack\(bossSpriteAssetsRef\.current,\s*OPENING_SPHINX_SPRITE_BOSS_ID\)/);
  assert.match(journeyComponentSource, /drawAtlasRegion\([\s\S]*?spritePack[\s\S]*?frameKey[\s\S]*?\{\s*mode:\s*'contain',\s*alignY:\s*'bottom'\s*\}/);
  assert.match(journeyComponentSource, /shouldFlipBossSprite\(OPENING_SPHINX_SPRITE_BOSS_ID,\s*-1\)/);
  assert.match(journeyComponentSource, /openingSphinxSpriteFrame/);
  assert.match(journeyComponentSource, /openingSphinxEncounterState:/);
  assert.doesNotMatch(journeyComponentSource, /expedition-journey-notice/);
  assert.match(journeyComponentSource, /spriteAtlasPath:\s*renderStats\.openingSphinxSpriteAtlasPath\s*\|\|\s*ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON/);
  assert.match(journeyComponentSource, /spriteLoaded:\s*renderStats\.openingSphinxSpriteLoaded[\s\S]*?Boolean\(bossSpriteAssets\.packs\?\.\[OPENING_SPHINX_SPRITE_BOSS_ID\]\?\.loaded\)/);
  assert.match(journeyComponentSource, /openingSphinxEncounter\.timer[\s\S]*?OPENING_SPHINX_EXIT_SECONDS/);
  assert.match(journeyComponentSource, /openingSphinxEncounter\.playerX/);
  assert.match(journeyComponentSource, /drawOpeningSphinxDialogue/);
  assert.doesNotMatch(journeyComponentSource, /current\.environmentEvent = \{[\s\S]*?name:\s*SCARAB_SEAL_TRIGGER\.eventName[\s\S]*?message:\s*SCARAB_SEAL_TRIGGER\.messages\.slice\(1\)\.join\(' '\)/);
  assert.match(journeyComponentSource, /b\.id === SCARAB_SEAL_TRIGGER\.bossId[\s\S]*?!current\.scarabSealActivated/);
  assert.match(journeyComponentSource, /scarabSealRequired && current\.openingThresholdScene/);
  assert.match(journeyComponentSource, /target === 'journey-boss-start'/);
  assert.match(journeyComponentSource, /setBriefingOpen\(false\)/);
  assert.match(journeyComponentSource, /current\.scarabSealActivated = true[\s\S]*?Developer mode: \$\{boss\.name\} encounter ready\./);
  assert.match(journeyComponentSource, /current\.seenBossIntroIds\?\.add\(boss\.id\)/);
  assert.match(journeyComponentSource, /SCARAB_SEAL_TRIGGER\.bossIntroLine/);
  assert.match(journeyComponentSource, /SCARAB_SEAL_TRIGGER\.guideFollowUpLine/);
  assert.match(journeyComponentSource, /guardianSealActivated/);
  assert.match(hazards, /id:\s*'opening-seal-reset-trap'[\s\S]*?name:\s*'buried spike trap'[\s\S]*?x:\s*X\(250\)[\s\S]*?width:\s*87[\s\S]*?height:\s*16[\s\S]*?penalty:\s*\{\s*stamina:\s*8\s*\}/);
  assert.doesNotMatch(hazards, /id:\s*'opening-seal-reset-trap'[\s\S]*?pushToStart:\s*true/);
  assert.doesNotMatch(hazards, /id:\s*'opening-seal-reset-trap'[\s\S]*?revealedByScarabSeal:\s*true/);
  assert.match(hazards, /Buried spikes jabbed out of the sand\. Jump cleanly over them\./);
  assert.match(journeyComponentSource, /isHazardAvailable\(hazard, current\)/);
  assert.match(journeyComponentSource, /if \(h\.pushToStart\) \{/);
  assert.match(journeyComponentSource, /player\.x = startCheckpoint\.x/);
  assert.match(journeyRenderAssetsSource, /'opening-seal-reset-trap':\s*'spikeTrap'/);
  assert.doesNotMatch(journeyComponentSource, /visualHazardId === 'opening-seal-reset-trap'[\s\S]*?strokeStyle = 'rgba\(250, 204, 21/);
  assert.doesNotMatch(journeyComponentSource, /openingScarabConfrontationPending/);
  const openingSealRuntimeBlock = journeyComponentSource.slice(
    journeyComponentSource.indexOf("if (backgroundPackId !== 'china-river-valley' && !current.scarabSealActivated)"),
    journeyComponentSource.indexOf('getActiveHiddenRoutes().forEach'),
  );
  assert.doesNotMatch(openingSealRuntimeBlock, /player\.x = playerDomainStartX/);

  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?miniBoss:\s*'scarab-queen'[\s\S]*?keyItem:\s*'brush-handle'/);
  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry',\s*miniBoss:\s*'scarab-queen',\s*keyItem:\s*'brush-handle',\s*shards:\s*10/);
  assert.match(miniBosses, /id:\s*'scarab-queen'[\s\S]*?health:\s*1,\s*damage:\s*4/);
  assert.match(bossKeyItems, /id:\s*'brush-handle'[\s\S]*?bossId:\s*'scarab-queen'[\s\S]*?gateId:\s*'desert-seal'/);
  assert.doesNotMatch(journeyComponentSource, /current\.defeatedMiniBosses\.add\(SCARAB_SEAL_TRIGGER\.bossId\)/);
  assert.doesNotMatch(journeyComponentSource, /current\.collectedBossKeyIds\.add\('brush-handle'\)/);
  assert.match(source, /export const CHINA_MINI_BOSSES = \[/);
});

test('dev smoke helpers expose Scarab Queen payoff and Desert Map Seal readiness without changing route requirements', () => {
  const routeGates = extractExportedArray('ROUTE_GATES');
  const bossKeyItems = extractExportedArray('BOSS_KEY_ITEMS');
  assert.match(devToolsSource, /Smoke: Scarab Queen Payoff/);
  assert.match(devToolsSource, /journey-scarab-payoff/);
  assert.match(devToolsSource, /Smoke: Desert Map Seal Ready/);
  assert.match(devToolsSource, /journey-desert-map-seal-ready/);
  assert.match(expeditionModeSource, /event\.detail\?\.target === 'journey-scarab-payoff'/);
  assert.match(expeditionModeSource, /event\.detail\?\.target === 'journey-desert-map-seal-ready'/);
  assert.match(expeditionModeSource, /postBossReward:\s*journeySnapshot\.postBossReward \|\| null/);
  assert.match(expeditionModeSource, /postBossRewardVisible:\s*Boolean\(journeySnapshot\.postBossRewardVisible \|\| journeySnapshot\.postBossReward\)/);
  assert.match(journeyComponentSource, /target === 'journey-scarab-payoff' \|\| target === 'journey-desert-map-seal-ready'/);
  assert.match(journeyComponentSource, /current\.defeatedMiniBosses\.add\(boss\.id\)/);
  assert.match(journeyComponentSource, /current\.collectedObjectiveIds\.add\('map-tablet'\)/);
  assert.match(journeyComponentSource, /current\.completedObjectiveIds\.add\('desert-entry'\)/);
  assert.match(journeyComponentSource, /current\.collectedBossKeyIds\.add\(keyItem\.id\)/);
  assert.match(journeyComponentSource, /current\.relicShardCount = Math\.max\(current\.relicShardCount, 10\)/);
  assert.match(journeyComponentSource, /buildBossRewardMoment\(current, keyItem, recoverReward \? 'recovered' : 'revealed'\)/);
  assert.match(journeyComponentSource, /id:\s*recoverReward \? 'debug-desert-map-seal-ready' : 'debug-scarab-queen-payoff'/);
  assert.match(journeyComponentSource, /text:\s*recoverReward \? 'SEAL READY' : 'REWARD REVEALED'/);
  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry',\s*miniBoss:\s*'scarab-queen',\s*keyItem:\s*'brush-handle',\s*shards:\s*10/);
  assert.match(bossKeyItems, /id:\s*'brush-handle'[\s\S]*?routeOpenMessage:\s*'The Scarab Queen falls\. Asha has permission, not trust\. Brush Handle recovered\. The Desert Map Seal answers\.'/);
});

test('opening pyramid uses exactly four invisible platforms aligned to the marked ledges', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const sealTrigger = source.slice(source.indexOf('export const SCARAB_SEAL_TRIGGER = {'), source.indexOf('export const STORY_PROPS = ['));
  const getOpeningPlatform = (label) => {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = platforms.match(new RegExp(`\\{[^}]*x:\\s*(\\d+)[^}]*y:\\s*JY\\((-?\\d+)\\)[^}]*width:\\s*(\\d+)[^}]*label:\\s*'${escapedLabel}'[^}]*invisible:\\s*true`, 'i'));
    assert.ok(match, `${label} should exist`);
    return {
      label,
      x: Number(match[1]),
      y: Number(match[2]),
      width: Number(match[3]),
    };
  };
  const climbLabels = [
    'invisible marked lower pyramid ledge',
    'invisible marked first pyramid terrace',
    'invisible marked second pyramid terrace',
    'invisible marked scarab artefact platform',
  ];
  const route = climbLabels.map(getOpeningPlatform);

  assert.deepEqual(
    route.map(({ x, y, width }) => ({ x, y, width })),
    [
      { x: 0, y: 318, width: 430 },
      { x: 320, y: 166, width: 365 },
      { x: 420, y: 36, width: 395 },
      { x: 620, y: -101, width: 360 },
    ],
  );

  assert.match(sealTrigger, /x:\s*925/);
  assert.match(sealTrigger, /y:\s*JY\(-117\)/);
  assert.match(sealTrigger, /width:\s*160/);
  assert.match(sealTrigger, /height:\s*90/);
  assert.match(journeyComponentSource, /if \(platform\.invisible\) return;/);
});

test('opening pyramid marked ledges use a scoped double-jump assist instead of extra platforms', () => {
  const platforms = extractExportedArray('PLATFORMS');
  assert.match(journeyComponentSource, /OPENING_PYRAMID_AIR_JUMP_ASSIST_ZONE/);
  assert.match(journeyComponentSource, /OPENING_PYRAMID_GROUND_JUMP_MULTIPLIER\s*=\s*1\.32/);
  assert.match(journeyComponentSource, /OPENING_PYRAMID_AIR_JUMP_MULTIPLIER\s*=\s*1\.6/);
  assert.match(journeyComponentSource, /isOpeningPyramidAirJumpAssistAvailable/);
  assert.match(journeyComponentSource, /openingPyramidGroundJumpMultiplier/);
  assert.match(journeyComponentSource, /current\.openingPyramidAssistJumpAvailable/);
  assert.match(journeyComponentSource, /openingPyramidAssistJump/);
  assert.match(journeyComponentSource, /player\.vy = -JUMP_SPEED \* OPENING_PYRAMID_AIR_JUMP_MULTIPLIER/);
  assert.doesNotMatch(platforms, /pyramid stair/i);
  assert.doesNotMatch(platforms, /helper platform/i);
});

test('opening pyramid facade stays active as the opening gameplay landmark', () => {
  assert.match(journeyComponentSource, /OPENING_PYRAMID_FACADE_WORLD_LEFT_X\s*=\s*-82/);
  assert.match(
    journeyComponentSource,
    /if \(x > CANVAS_WIDTH \+ 80 \|\| x \+ width < -80\) return false;[\s\S]*?ctx\.globalAlpha = 0\.98;/,
  );
  assert.match(journeyComponentSource, /drawOpeningPyramidMasonryBack\(ctx, cameraX, now\)/);
  assert.doesNotMatch(journeyComponentSource, /clipRight/);
  assert.doesNotMatch(journeyComponentSource, /OPENING_PYRAMID_FACADE_MIN_VISIBLE_WIDTH/);
  assert.doesNotMatch(journeyComponentSource, /OPENING_PYRAMID_FACADE_FADE_START_X/);
  assert.doesNotMatch(journeyComponentSource, /OPENING_PYRAMID_FACADE_PLAYER_FADE_START_X/);
  assert.doesNotMatch(journeyComponentSource, /OPENING_PYRAMID_FACADE_HIDE_AFTER_X/);
  assert.doesNotMatch(journeyComponentSource, /OPENING_PYRAMID_FACADE_PLAYER_HIDE_AFTER_X/);
  assert.doesNotMatch(journeyComponentSource, /OPENING_PYRAMID_FACADE_WORLD_RIGHT_X/);
});

test('route props stay out of the opening pyramid facade and use the grounded ruin preset', () => {
  const storyProps = extractExportedArray('STORY_PROPS');

  [
    'desert-entry-premium-threshold-slab-1',
    'desert-entry-premium-column-1',
    'desert-entry-premium-pillar-caps-1',
  ].forEach((id) => {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const row = getDataRowById(storyProps, id);
    assert.match(row, /x:\s*(1[6-9]\d\d|2\d\d\d)/, `${id} should sit past Asha on the open route`);
    assert.match(row, /placementPreset:\s*'desertEntryGroundedRuin'/, `${id} should use the shared grounded placement preset`);
    assert.doesNotMatch(storyProps, new RegExp(`id:\\s*'${escapedId}'[^}]*?depth:\\s*'(background|midground)'`));
  });
  [
    'opening-ruin-climb-fallen-column',
    'opening-ruin-climb-glyph-slab',
    'false-relic-bait-seal-stones',
    'temple-upper-switch-glyph-slab',
    'temple-upper-switch-fallen-column',
    'desert-entry-warning-tablet-1',
    'temple-approach-threshold-tablet-1',
    'broken-ruins-survey-rope',
    'desert-broken-supply-cart',
    'desert-entry-field-chest-1',
    'early-voucher-cache-marker',
    'broken-seal-marker',
    'atmosphere-entry-broken-pillar',
  ].forEach((id) => {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.doesNotMatch(storyProps, new RegExp(`id:\\s*'${escapedId}'`));
  });
  assert.doesNotMatch(storyProps, /sectionId:\s*'desert-entry'[^}]*atmosphereAssetKey:\s*'stoneTablet'/);
  assert.doesNotMatch(storyProps, /sectionId:\s*'desert-entry'[^}]*type:\s*'survey-rope'/);
  assert.match(
    journeyComponentSource,
    /PLATFORMS[\s\S]*?\.forEach\(\(platform\) => drawPlatform\(ctx, platform, cameraX, current\)\);[\s\S]*?STORY_PROPS\.filter\(prop => isEntityActiveInScene\(prop, current\)\)\.forEach\(\(prop\) => drawStoryProp\(ctx, prop, cameraX, now, 'route-edge'\)\)/,
  );
  assert.match(journeyComponentSource, /if \(\['background', 'midground', 'grounded', 'route-edge'\]\.includes\(prop\.depth\)\) return prop\.depth;/);
  assert.match(journeyComponentSource, /if \(placementPreset\?\.depth\) return placementPreset\.depth;/);
});

test('opening pyramid zone only contains the intentional first-screen stairway platforms', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const allowedOpeningLabels = new Set([
    'desert track',
    'invisible marked lower pyramid ledge',
    'invisible marked first pyramid terrace',
    'invisible marked second pyramid terrace',
    'invisible marked scarab artefact platform',
    'facade-marked broken ruin lower climb',
    'facade-marked broken ruin middle climb',
    'facade-marked Map Tablet ledge',
  ]);
  const platformLines = platforms
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('{') && line.includes('label:'));
  const horizontalScale = Number(journeyConstantsSource.match(/JOURNEY_HORIZONTAL_SCALE\s*=\s*([\d.]+)/)?.[1] || NaN);
  assert.ok(Number.isFinite(horizontalScale), 'Journey horizontal scale should be parseable');
  const openingZonePlatforms = platformLines
    .map((line) => {
      const rawXMatch = line.match(/x:\s*(\d+)/);
      const scaledXMatch = line.match(/x:\s*X\((\d+)\)/);
      const labelMatch = line.match(/label:\s*'([^']+)'/);
      const rawX = rawXMatch ? Number(rawXMatch[1]) : null;
      const scaledX = scaledXMatch ? Number(scaledXMatch[1]) * horizontalScale : null;
      return {
        label: labelMatch?.[1] || 'unknown platform',
        x: rawX ?? scaledX ?? Number.POSITIVE_INFINITY,
      };
    })
    .filter((platform) => platform.x <= 1200);

  const unexpectedLabels = openingZonePlatforms
    .filter((platform) => !allowedOpeningLabels.has(platform.label))
    .map((platform) => platform.label);

  assert.deepEqual(unexpectedLabels, []);
  assert.equal(openingZonePlatforms.filter((platform) => platform.label !== 'desert track').length, 4);
});

test('obsolete Desert Entry challenge platforms do not crowd the opening pyramid', () => {
  const platforms = extractExportedArray('PLATFORMS');
  [
    'sealed scarab pyramid base',
    'visible lower pyramid step block',
    'visible second pyramid step block',
    'visible third pyramid step block',
    'visible upper pyramid step block',
    'middle recovery temple slab',
    'visible upper temple step block',
    'visible summit approach step block',
    'visible summit stair block',
    'visible capstone stair block',
    'visible seal pedestal step block',
    'scarab seal summit platform',
    'desert checkpoint launch',
    'desert high shard cracked step',
    'desert high shard landing',
    'desert high shard unstable ledge',
    'lower route rejoin',
    'upper shard path',
    'warning slab path',
    'survey ridge',
    'guardian lookout perch',
    'scarab seal climb capstone',
    'guardian warning step',
    'seal approach ledge',
    'broken ruins route entry',
    'half-buried lintel',
    'ruins recovery step',
  ].forEach((label) => {
    assert.doesNotMatch(platforms, new RegExp(label));
  });
  assert.doesNotMatch(platforms, /desert-high-shard-climb/);
});

test('Egypt opening ambient life no longer draws deprecated sketch scenery', () => {
  assert.match(journeyComponentSource, /drawEgyptAmbientLife/);
  assert.doesNotMatch(journeyComponentSource, /drawDistantExpeditionWorker/);
  assert.doesNotMatch(journeyComponentSource, /drawKneelingSurveyor/);
  assert.doesNotMatch(journeyComponentSource, /drawTentFlap/);
  assert.doesNotMatch(journeyComponentSource, /drawRopedDigActivity/);
  assert.doesNotMatch(journeyComponentSource, /desert-survey-camp-life/);
});

test('player polish extends the canonical Journey animation and weapon paths', () => {
  [
    'survey-walk',
    'walk',
    'run',
    'jump',
    'fall',
    'land',
    'attack',
    'hurt',
  ].forEach((state) => {
    assert.match(journeyUtilsSource, new RegExp(`'${state}'`));
  });
  assert.match(journeyUtilsSource, /getPlayerMovementVisualStyle/);
  assert.match(journeyUtilsSource, /visualWalkStyle/);
  assert.match(journeyConstantsSource, /ATTACK_DURATION = 0\.42/);
  assert.match(journeyConstantsSource, /ATTACK_WINDUP_DURATION = 0\.12/);
  assert.match(journeyConstantsSource, /ATTACK_RECOIL_DURATION = 0\.18/);
  assert.match(journeyComponentSource, /drawPlayerSprite/);
  assert.match(journeyComponentSource, /drawPlayerKhopesh/);
  assert.match(journeyComponentSource, /weapon-hit-spark/);
  assert.match(journeyComponentSource, /playerAttackBox/);
  assert.match(journeyComponentSource, /PLAYER_ATTACK_RANGE = 92/);
  assert.match(journeyComponentSource, /PLAYER_ATTACK_HEIGHT = 36/);
  assert.match(journeyComponentSource, /PLAYER_ATTACK_BACK_REACH = 10/);
  assert.doesNotMatch(journeyUtilsSource, /PLAYER_WIDTH\s*=/);
  assert.doesNotMatch(journeyUtilsSource, /PLAYER_HEIGHT\s*=/);
});

test('China Journey uses a unique female player atlas through the existing player renderer', () => {
  assert.match(journeyConstantsSource, /PLAYER_CHINA_HERO_SPRITE_ATLAS_JSON/);
  assert.match(journeyConstantsSource, /china-female-archaeologist-production-spritesheet\.json/);
  assert.match(journeyComponentSource, /china-female-archaeologist/);
  assert.match(journeyComponentSource, /backgroundPackId === 'china-river-valley'/);
  assert.match(journeyComponentSource, /playerHeroSpriteConfig/);
  assert.match(journeyComponentSource, /fallbackSrc/);
  assert.match(journeyComponentSource, /suppressExternalWeaponDuringAttack/);
  assert.match(journeyComponentSource, /suppressRuntimeAttackArc/);
  assert.match(journeyComponentSource, /groundLineY/);
});

test('Egypt Journey uses the Asha atlas through the existing player renderer', () => {
  assert.match(journeyConstantsSource, /PLAYER_HERO_SPRITE_ATLAS_JSON/);
  assert.match(journeyConstantsSource, /asha-reference-warrior-spritesheet\.json/);
  assert.doesNotMatch(journeyConstantsSource, /asha-v4-spritesheet\.json/);
  assert.match(journeyConstantsSource, /PLAYER_HERO_SPRITE_VERSION = 'asha-reference-warrior-full-motion-polish-2026-05-30'/);
  assert.match(journeyComponentSource, /characterId:\s*'asha-reference-warrior'/);
  assert.match(journeyComponentSource, /asha-final-production-spritesheet\.json/);
  assert.match(journeyConstantsSource, /PLAYER_HERO_PREVIOUS_SPRITE_ATLAS_JSON/);
  assert.match(journeyConstantsSource, /asha-hooded-warrior-explorer-spritesheet\.json/);
  assert.match(journeyConstantsSource, /PLAYER_HERO_FALLBACK_SPRITE_ATLAS_JSON/);
  assert.match(journeyConstantsSource, /egypt-warrior-guide-spritesheet\.json/);
  assert.match(journeyComponentSource, /characterId:\s*'asha-reference-warrior'/);
  assert.match(journeyComponentSource, /atlasPath:\s*PLAYER_HERO_SPRITE_ATLAS_JSON/);
  assert.match(journeyComponentSource, /version:\s*PLAYER_HERO_SPRITE_VERSION/);
  assert.match(journeyComponentSource, /fallbackAtlasPath:\s*'assets\/expedition\/player\/asha-final-production-spritesheet\.json'/);
  assert.match(journeyComponentSource, /fallbackCharacterId:\s*'asha-final-production'/);
  assert.match(journeyComponentSource, /characterId:\s*'asha-final-production'/);
  assert.match(journeyComponentSource, /label:\s*'Asha Final Production'/);
  assert.match(journeyComponentSource, /label:\s*'Asha Hooded Previous'/);
  assert.match(journeyComponentSource, /atlasPath:\s*'assets\/expedition\/player\/asha-final-production-spritesheet\.json'/);
  assert.match(journeyComponentSource, /version:\s*'asha-master-reference-motion-2026-05-23'/);
  assert.match(journeyComponentSource, /fallbackAtlasPath:\s*PLAYER_HERO_PREVIOUS_SPRITE_ATLAS_JSON/);
  assert.match(journeyComponentSource, /fallbackCharacterId:\s*'asha-egypt-warrior-explorer'/);
  assert.match(journeyComponentSource, /fallbackSrc:\s*PLAYER_LEGACY_SPRITE_SRC/);
  assert.match(journeyComponentSource, /if\s*\(!atlasPath\)\s*\{\s*loadLegacySprite\(\);/);
  assert.equal(egyptPlayerAtlas.draw.suppressExternalWeapon, true);
  assert.equal(egyptPlayerAtlas.draw.suppressRuntimeAttackArc, true);
  assert.equal(egyptPlayerAtlas.status, 'production-candidate-final-asha-master-reference-motion');
  assert.equal(egyptPlayerAtlas.productionReference, 'asha-final-production-reference.png');
  assert.equal(egyptPlayerAtlas.draw.height, 108);
  assert.ok(egyptPlayerAtlas.draw.height >= 80 && egyptPlayerAtlas.draw.height <= 110);
  assert.equal(egyptPlayerAtlas.draw.sourceHeight, 224);
  assert.equal(egyptPlayerAtlas.frame.width, 256);
  assert.equal(egyptPlayerAtlas.frame.height, 256);
  assert.equal(
    egyptPlayerAtlas.source,
    'imagegen-master-reference-asha-idle-jump-damage-run-2026-05-23',
  );
  assert.equal(egyptPreviousPlayerAtlas.status, 'active-egypt-hooded-warrior-explorer-atlas-production-ready');
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'idle')?.frameCount, 8);
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'walk')?.frameCount, 8);
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'run')?.frameCount, 10);
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'survey_walk')?.frameCount, 8);
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'idle')?.frames,
    Array.from({ length: 8 }, (_, index) => `idle_${String(index).padStart(2, '0')}`),
  );
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'walk')?.frames,
    Array.from({ length: 8 }, (_, index) => `walk_${String(index).padStart(2, '0')}`),
  );
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'run')?.frames,
    Array.from({ length: 10 }, (_, index) => `run_${String(index).padStart(2, '0')}`),
  );
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'survey_walk')?.frames,
    Array.from({ length: 8 }, (_, index) => `survey_walk_${String(index).padStart(2, '0')}`),
  );
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'jump')?.frames,
    Array.from({ length: 8 }, (_, index) => `jump_${String(index).padStart(2, '0')}`),
  );
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'fall')?.frames,
    Array.from({ length: 8 }, (_, index) => `fall_${String(index).padStart(2, '0')}`),
  );
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'land')?.frames,
    Array.from({ length: 8 }, (_, index) => `land_${String(index).padStart(2, '0')}`),
  );
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'hurt')?.frameCount, 5);
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'hurt')?.frames,
    Array.from({ length: 5 }, (_, index) => `hurt_${String(index).padStart(2, '0')}`),
  );
  assert.equal(egyptPlayerAtlas.poseSources.idle_00, 'asha-master-reference-idle-8frame-alpha.png:frame_00');
  assert.equal(egyptPlayerAtlas.poseSources.idle_07, 'asha-master-reference-idle-8frame-alpha.png:frame_07');
  assert.equal(egyptPlayerAtlas.poseSources.run_00, 'asha-master-reference-run-10frame-alpha.png:frame_00');
  assert.equal(egyptPlayerAtlas.poseSources.run_03, 'asha-master-reference-run-10frame-alpha.png:frame_03');
  assert.equal(egyptPlayerAtlas.poseSources.run_09, 'asha-master-reference-run-10frame-alpha.png:frame_09');
  assert.equal(egyptPlayerAtlas.poseSources.walk_03, 'asha-master-reference-run-10frame-alpha.png:frame_03');
  assert.equal(egyptPlayerAtlas.poseSources.attack_pick_swing_00, 'asha-final-polished-sword-attack-source.png:frame_00');
  assert.equal(egyptPlayerAtlas.poseSources.attack_pick_swing_03, 'asha-final-polished-sword-attack-source.png:frame_03');
  assert.equal(egyptPlayerAtlas.poseSources.attack_pick_swing_07, 'asha-final-polished-sword-attack-source.png:frame_07');
  assert.equal(egyptPlayerAtlas.poseSources.jump_04, 'asha-master-reference-jump-8frame-alpha.png:frame_03');
  assert.equal(egyptPlayerAtlas.poseSources.fall_04, 'asha-master-reference-jump-8frame-alpha.png:frame_05');
  assert.equal(egyptPlayerAtlas.poseSources.land_02, 'asha-master-reference-jump-8frame-alpha.png:frame_07');
  assert.equal(egyptPlayerAtlas.poseSources.hurt_04, 'asha-master-reference-damage-5frame-alpha.png:frame_04');
  assert.equal(egyptPlayerAtlas.rows.length, 12);
  assert.equal(Object.keys(egyptPlayerAtlas.regions).length, 95);
  assert.equal(Object.keys(egyptPlayerAtlas.poseSources).length, 95);
  assert.ok(egyptPlayerFallbackAtlas.regions.idle_00);
  assert.ok(egyptPlayerAtlas.regions.run_00.drawBounds);
  assert.match(journeyComponentSource, /heroRegion\?\.drawBounds/);
  assert.match(journeyComponentSource, /nominalFrameHeight/);
  assert.match(journeyComponentSource, /boundedGroundLineY/);
  assert.match(journeyUtilsSource, /if \(animationState === 'jump'\) \{/);
  assert.match(journeyUtilsSource, /if \(animationState === 'fall'\) \{/);
  assert.match(journeyUtilsSource, /if \(animationState === 'land'\) \{/);
  assert.match(journeyUtilsSource, /player\.landingFeedbackTimer/);
  assert.match(journeyComponentSource, /heroAtlas\?\.draw\?\.suppressExternalWeapon/);
  assert.match(journeyComponentSource, /rowName === 'idle'\s*\?\s*Math\.floor\(now \/ 150\) % frameCount/);
  assert.match(journeyComponentSource, /firstSwingFrame/);
  assert.match(journeyComponentSource, /lastSwingFrame/);
});

test('Asha V6 high-resolution atlas template is inactive and uses the existing renderer contract', () => {
  assert.equal(ashaV6HiresPlayerAtlas.status, 'inactive-template-no-runtime-png');
  assert.equal(ashaV6HiresPlayerAtlas.image, 'asha-v6-hires-spritesheet.png');
  assert.equal(ashaV6HiresPlayerAtlas.frame.width, 512);
  assert.equal(ashaV6HiresPlayerAtlas.frame.height, 512);
  assert.equal(ashaV6HiresPlayerAtlas.frame.groundLineY, 472);
  assert.equal(ashaV6HiresPlayerAtlas.frame.facing, 'right');
  assert.equal(ashaV6HiresPlayerAtlas.draw.height, 132);
  assert.equal(ashaV6HiresPlayerAtlas.draw.sourceHeight, 448);
  assert.equal(ashaV6HiresPlayerAtlas.layout.columns, 8);
  assert.equal(ashaV6HiresPlayerAtlas.layout.rows, 12);
  assert.equal(ashaV6HiresPlayerAtlas.layout.pngWidth, 4096);
  assert.equal(ashaV6HiresPlayerAtlas.layout.pngHeight, 6144);
  assert.deepEqual(
    ashaV6HiresPlayerAtlas.rows.map(row => row.name),
    ['idle', 'walk', 'run', 'survey_walk', 'jump', 'fall', 'land', 'attack_pick_swing', 'hurt', 'interact', 'climb', 'push_pull'],
  );
  assert.equal(Object.keys(ashaV6HiresPlayerAtlas.regions).length, 96);
  assert.equal(ashaV6HiresPlayerAtlas.regions.attack_pick_swing_07.x, 7 * 512);
  assert.equal(ashaV6HiresPlayerAtlas.regions.attack_pick_swing_07.y, 7 * 512);
  assert.match(journeyComponentSource, /heroAtlas\?\.draw\?\.height/);
  assert.match(journeyComponentSource, /heroAtlas\?\.draw\?\.sourceHeight/);
  assert.match(journeyComponentSource, /heroAtlas\?\.frame\?\.height/);
  assert.match(journeyComponentSource, /heroRegion\?\.drawBounds/);
  assert.match(journeyComponentSource, /heroRegion\?\.groundLineY/);
  assert.doesNotMatch(journeyConstantsSource, /asha-v6-hires-spritesheet\.json/);
  assert.doesNotMatch(journeyComponentSource, /atlasPath:\s*'assets\/expedition\/player\/asha-v6-hires-spritesheet\.json'/);
});

test('Asha Reference Warrior remains available as a separate character-loader atlas', () => {
  assert.match(journeyComponentSource, /id:\s*'asha-reference-warrior'/);
  assert.match(journeyComponentSource, /label:\s*'Asha Reference Warrior'/);
  assert.match(journeyComponentSource, /atlasPath:\s*PLAYER_HERO_SPRITE_ATLAS_JSON/);
  assert.match(journeyComponentSource, /assets\/expedition\/player\/asha-reference-warrior-reference\.png/);
  assert.equal(ashaReferenceWarriorPlayerAtlas.status, 'candidate-asha-reference-warrior-full-motion-polish');
  assert.equal(ashaReferenceWarriorPlayerAtlas.productionReference, 'asha-reference-warrior-reference.png');
  assert.equal(ashaReferenceWarriorPlayerAtlas.draw.height, 130);
  assert.equal(ashaReferenceWarriorPlayerAtlas.frame.width, 390);
  assert.equal(ashaReferenceWarriorPlayerAtlas.frame.height, 256);
  assert.equal(ashaReferenceWarriorPlayerAtlas.draw.suppressExternalWeapon, true);
  assert.equal(ashaReferenceWarriorPlayerAtlas.draw.suppressRuntimeAttackArc, true);
  assert.match(
    ashaReferenceWarriorPlayerAtlas.description,
    /three-hit pure-weapon attack chain/,
  );
  assert.deepEqual(ashaReferenceWarriorPlayerAtlas.draw.attackChainRows, [
    'attack_pick_swing',
    'attack_pick_swing_alt',
    'attack_pick_swing_sweep',
  ]);
  assert.match(journeyComponentSource, /attackChainRows/);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.length, 14);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'idle')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'run')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'jump')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'attack_pick_swing')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'attack_pick_swing_alt')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'attack_pick_swing_sweep')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'hurt')?.frameCount, 5);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'interact')?.frameCount, 6);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'climb')?.frameCount, 8);
  assert.equal(ashaReferenceWarriorPlayerAtlas.rows.find(row => row.name === 'push_pull')?.frameCount, 8);
  assert.equal(Object.keys(ashaReferenceWarriorPlayerAtlas.regions).length, 107);
  assert.equal(Object.keys(ashaReferenceWarriorPlayerAtlas.poseSources).length, 107);
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.idle_00,
    'asha-reference-warrior-idle-still-guard-pass1-normalized-4096x512-candidate-2026-05-30.png:frame_00',
  );
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.attack_pick_swing_07,
    'asha-reference-warrior-attack-chain-01-quick-cut-framebyframe-pass1-normalized-4096x512-candidate-2026-05-30.png:frame_07',
  );
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.attack_pick_swing_alt_07,
    'asha-reference-warrior-attack-chain-02-diagonal-framebyframe-pass1-normalized-4096x512-candidate-2026-05-30.png:frame_07',
  );
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.attack_pick_swing_sweep_07,
    'asha-reference-warrior-attack-chain-03-sweep-framebyframe-pass1c-normalized-4096x512-candidate-2026-05-30.png:frame_07',
  );
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.hurt_04,
    'asha-reference-warrior-hurt-framebyframe-pass1-normalized-2560x512-candidate-2026-05-30.png:frame_04',
  );
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.run_07,
    'asha-reference-warrior-run-framebyframe-pass1-normalized-4096x512-candidate-2026-05-30.png:frame_07',
  );
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.poseSources.jump_07,
    'asha-reference-warrior-jump-framebyframe-pass1-normalized-4096x512-candidate-2026-05-30.png:frame_07',
  );
  assert.ok(ashaReferenceWarriorPlayerAtlas.regions.idle_00.drawBounds.h >= 210);
  assert.ok(ashaReferenceWarriorPlayerAtlas.regions.idle_00.drawBounds.w >= 60);
  assert.ok(Math.max(
    ashaReferenceWarriorPlayerAtlas.regions.attack_pick_swing_03.drawBounds.w,
    ashaReferenceWarriorPlayerAtlas.regions.attack_pick_swing_04.drawBounds.w,
    ashaReferenceWarriorPlayerAtlas.regions.attack_pick_swing_alt_03.drawBounds.w,
    ashaReferenceWarriorPlayerAtlas.regions.attack_pick_swing_sweep_03.drawBounds.w,
  ) >= 170);
  assert.equal(
    ashaReferenceWarriorPlayerAtlas.source,
    'asha-reference-warrior-full-motion-polish-2026-05-30',
  );
});

test('Asha V5 is available as a separate character-loader atlas', () => {
  assert.match(journeyComponentSource, /id:\s*'asha-v5-candidate'/);
  assert.match(journeyComponentSource, /label:\s*'Asha V5'/);
  assert.match(journeyComponentSource, /characterId:\s*'asha-v5-candidate'/);
  assert.match(journeyComponentSource, /atlasPath:\s*'assets\/expedition\/player\/asha-v5-spritesheet\.json'/);
  assert.equal(ashaV5PlayerAtlas.status, 'production-candidate-asha-v5-alternative');
  assert.equal(ashaV5PlayerAtlas.productionReference, 'asha-v5-reference.png');
  assert.equal(ashaV5PlayerAtlas.draw.height, 119);
  assert.equal(ashaV5PlayerAtlas.draw.frameDistance.run, 26);
  assert.equal(ashaV5PlayerAtlas.draw.frameDistance.walk, 22);
  assert.equal(ashaV5PlayerAtlas.draw.frameDistance.survey_walk, 34);
  assert.equal(ashaV5PlayerAtlas.draw.fixedFrame.idle, 'idle_00');
  assert.ok(ashaV5PlayerAtlas.description.includes('10 percent larger'));
  assert.ok(ashaV5PlayerAtlas.description.includes('brightness, contrast'));
  assert.match(journeyComponentSource, /getHeroSpriteFrameDistance\(atlas, rowName\)/);
  assert.match(journeyComponentSource, /getHeroSpriteFixedFrame\(atlas, rowName, row\)/);
  assert.equal(ashaV5PlayerAtlas.draw.suppressExternalWeapon, true);
  assert.equal(ashaV5PlayerAtlas.draw.suppressRuntimeAttackArc, true);
  assert.equal(ashaV5PlayerAtlas.rows.find(row => row.name === 'idle')?.frameCount, 8);
  assert.equal(ashaV5PlayerAtlas.rows.find(row => row.name === 'run')?.frameCount, 10);
  assert.equal(ashaV5PlayerAtlas.rows.find(row => row.name === 'jump')?.frameCount, 8);
  assert.equal(ashaV5PlayerAtlas.rows.find(row => row.name === 'hurt')?.frameCount, 5);
  assert.equal(ashaV5PlayerAtlas.rows.find(row => row.name === 'interact')?.frameCount, 6);
  assert.equal(ashaV5PlayerAtlas.rows.find(row => row.name === 'climb')?.frameCount, 8);
  assert.equal(Object.keys(ashaV5PlayerAtlas.regions).length, 93);
  assert.equal(ashaV5PlayerAtlas.poseSources.run_09, 'asha-v5-run-source.png:frame_09');
  assert.equal(ashaV5PlayerAtlas.poseSources.hurt_04, 'asha-v5-damage-source.png:frame_04');
});

test('Asha New Idle is available as a separate character-loader atlas', () => {
  assert.match(journeyComponentSource, /id:\s*'asha-new-idle'/);
  assert.match(journeyComponentSource, /label:\s*'Asha New Idle'/);
  assert.match(journeyComponentSource, /characterId:\s*'asha-new-idle'/);
  assert.match(journeyComponentSource, /atlasPath:\s*'assets\/expedition\/player\/asha-new-idle-spritesheet\.json'/);
  assert.match(journeyComponentSource, /fallbackAtlasPath:\s*'assets\/expedition\/player\/asha-v5-spritesheet\.json'/);
  assert.match(journeyComponentSource, /attackSequenceIndex/);
  assert.match(journeyComponentSource, /attack_pick_swing_alt/);
  assert.equal(ashaNewIdlePlayerAtlas.status, 'production-candidate-asha-premium-identity');
  assert.equal(ashaNewIdlePlayerAtlas.productionReference, 'asha-new-idle-reference.png');
  assert.equal(ashaNewIdlePlayerAtlas.draw.height, 131);
  assert.equal(ashaNewIdlePlayerAtlas.draw.fixedFrame.idle, undefined);
  assert.equal(ashaNewIdlePlayerAtlas.rows.find(row => row.name === 'idle')?.frameCount, 8);
  assert.equal(ashaNewIdlePlayerAtlas.rows.find(row => row.name === 'attack_pick_swing_alt')?.frameCount, 8);
  assert.deepEqual(ashaNewIdlePlayerAtlas.draw.alternateAttackRows, ['attack_pick_swing', 'attack_pick_swing_alt']);
  assert.equal(Object.keys(ashaNewIdlePlayerAtlas.regions).length, 101);
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.idle_00,
    'asha-premium-idle-regeneration-02-reference-locked-raw.png:frame_00',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.idle_07,
    'asha-premium-idle-regeneration-02-reference-locked-raw.png:frame_07',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.walk_00,
    'asha-premium-run-regeneration-04-reference-locked-raw.png:frame_00',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.run_09,
    'asha-premium-run-regeneration-04-reference-locked-raw.png:frame_05',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.survey_walk_00,
    'asha-premium-run-regeneration-04-reference-locked-raw.png:frame_00',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.jump_00,
    'asha-premium-jump-regeneration-03-reference-locked-raw.png:frame_00',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.jump_07,
    'asha-premium-jump-regeneration-03-reference-locked-raw.png:frame_07',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.fall_00,
    'asha-premium-jump-regeneration-03-reference-locked-raw.png:frame_03',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.land_02,
    'asha-premium-jump-regeneration-03-reference-locked-raw.png:frame_07',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.attack_pick_swing_00,
    'asha-premium-attack-regeneration-03-reference-locked-raw.png:frame_00',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.attack_pick_swing_05,
    'asha-premium-attack-regeneration-03-reference-locked-raw.png:frame_05',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.attack_pick_swing_alt_00,
    'asha-premium-attack-alt-regeneration-04-reference-locked-raw.png:frame_00',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.attack_pick_swing_alt_07,
    'asha-premium-attack-alt-regeneration-04-reference-locked-raw.png:frame_07',
  );
  assert.equal(
    ashaNewIdlePlayerAtlas.poseSources.hurt_04,
    'asha-premium-hurt-regeneration-02-reference-locked-raw.png:frame_04',
  );
  assert.equal(ashaNewIdlePlayerAtlas.regions.run_00.drawBounds.h, 193);
  assert.equal(ashaNewIdlePlayerAtlas.regions.jump_01.drawBounds.h, 197);
  assert.equal(ashaNewIdlePlayerAtlas.regions.attack_pick_swing_00.drawBounds.h, 193);
  assert.equal(ashaNewIdlePlayerAtlas.regions.hurt_00.drawBounds.h, 220);
  assert.ok(ashaNewIdlePlayerAtlas.description.includes('secondary attack row'));
});

test('Asha V2 candidate exposes its full idle animation and cache-busts player atlas loads', () => {
  assert.match(journeyComponentSource, /id:\s*'asha-v2-candidate'/);
  assert.match(journeyComponentSource, /label:\s*'Asha V2 Candidate'/);
  assert.match(journeyComponentSource, /characterId:\s*'asha-v2-production-candidate'/);
  assert.match(journeyComponentSource, /atlasPath:\s*'assets\/expedition\/player\/asha-v2-production-candidate-spritesheet\.json'/);
  assert.match(journeyComponentSource, /version:\s*'asha-v2-production-candidate-idle-8frame-2026-05-28'/);
  assert.match(journeyComponentSource, /fetch\(`\$\{baseUrl\}\$\{heroAtlasPath\}\$\{versionQuery\}`\)/);
  assert.match(journeyComponentSource, /image\.src\s*=\s*`\$\{baseUrl\}\$\{getAtlasImagePath\(heroAtlasPath,\s*atlas\.image\)\}\$\{versionQuery\}`/);
  assert.equal(ashaV2PlayerAtlas.rows.find(row => row.name === 'idle')?.frameCount, 8);
  assert.deepEqual(
    ashaV2PlayerAtlas.rows.find(row => row.name === 'idle')?.frames,
    Array.from({ length: 8 }, (_, index) => `idle_${String(index).padStart(2, '0')}`),
  );
  assert.equal(ashaV2PlayerAtlas.poseSources.idle_00, 'asha-v2-locomotion-source.png:row_0:col_0');
  assert.equal(ashaV2PlayerAtlas.poseSources.idle_07, 'asha-v2-locomotion-source.png:row_0:col_7');
});

test('Egypt Journey keeps marker assets available but removes flag visuals from the route', () => {
  assert.match(journeyMarkerSpritesSource, /MARKER_SPRITE_ATLAS_JSON/);
  assert.match(journeyMarkerSpritesSource, /egypt-checkpoint-flag-sprites\.json/);
  assert.ok(egyptMarkerAtlas.regions.checkpoint_00);
  assert.ok(egyptMarkerAtlas.regions.flag_00);
  assert.match(journeyComponentSource, /loadMarkerSpritePack/);
  assert.match(journeyComponentSource, /DRAW_JOURNEY_FLAG_MARKERS = false/);
  assert.match(journeyComponentSource, /JOURNEY_FLAG_VISUAL_MODE = 'flags-removed-stone-cairns-v1'/);
  assert.match(journeyComponentSource, /if \(!DRAW_JOURNEY_FLAG_MARKERS\) \{[\s\S]*?removedRouteFlagCount \+= 1/);
  assert.match(journeyComponentSource, /const drawFlutterPennant = \(worldX, y, color = '#facc15'\) => \{[\s\S]*?if \(!DRAW_JOURNEY_FLAG_MARKERS\)/);
  assert.match(journeyComponentSource, /const checkpointDrawn = DRAW_JOURNEY_FLAG_MARKERS && drawMarkerSprite\(/);
  assert.match(journeyComponentSource, /journeyFlagVisualMode/);
  assert.match(journeyComponentSource, /removedRouteFlagCount/);
  assert.match(journeyComponentSource, /drawMarkerSprite\([\s\S]*?'flag'/);
  assert.match(journeyComponentSource, /fixedPoleRegion[\s\S]*?flag_00/);
  assert.doesNotMatch(journeyComponentSource, /fillText\('CHECKPOINT'/);
});

test('Egypt opening loop makes the first seal require enemies, shards, and the map objective', () => {
  assert.match(source, /id:\s*'temple-approach-seal'[\s\S]*?name:\s*'Temple Approach Seal'[\s\S]*?shards:\s*4/);
  assert.match(source, /id:\s*'temple-approach-seal'[\s\S]*?id:\s*'desert-seal'/);
  assert.match(source, /id:\s*'desert-seal'[\s\S]*?shards:\s*10/);
  assert.match(source, /id:\s*'map-tablet'[\s\S]*?x:\s*X\(625\)/);
  assert.match(source, /id:\s*'opening-seal-reset-trap'[\s\S]*?x:\s*X\(250\)[\s\S]*?width:\s*87[\s\S]*?height:\s*16/);
  assert.doesNotMatch(source, /id:\s*'opening-spike-floor-trap'/);
  assert.doesNotMatch(source, /id:\s*'warrior-mummy-start-1'/);
  assert.doesNotMatch(source, /id:\s*'warrior-mummy-dune-1'/);
  assert.doesNotMatch(source, /id:\s*'warrior-mummy-ridge-1'/);
  assert.match(source, /id:\s*'scarab-scout-1'[\s\S]*?protectsRouteId:\s*'temple-approach-seal'/);
  assert.match(source, /protectsRouteId:\s*'desert-opening-shard-cache'/);
  assert.match(source, /id:\s*'mummification-chamber-route'[\s\S]*?first sacred mystery/i);
  assert.match(journeyComponentSource, /getActiveShardGateProgress/);
  assert.match(journeyComponentSource, /Relic Shard/);
  assert.match(journeyComponentSource, /Enemy dropped/);
  assert.match(journeyComponentSource, /ENEMY_TYPE_STAKE_MESSAGES/);
  assert.match(journeyComponentSource, /seenEnemyTypeNoticeIds/);
  assert.match(journeyComponentSource, /journey-floating-hud-gate/);
  assert.match(journeyComponentSource, /route-gate-checklist/);
  assert.match(journeyComponentSource, /activeHudGateGuidance\.gateRequirements\.map/);
  assert.match(journeyComponentSource, /activeHudFirstMissing/);
  assert.doesNotMatch(journeyComponentSource, /gateRequirementLabel/);
  assert.match(journeyComponentSource, /journey-collectible-shard-atlas-upgrade-2026-05-21/);
  assert.match(journeyComponentSource, /relicShard:\s*\{[\s\S]*?ringSize:\s*Math\.round\(54 \* PICKUP_GLOW_SCALE\)/);
  assert.match(journeyComponentSource, /key:\s*'relicShard'[\s\S]*?ringKey:\s*'availableGlowRing'/);
});

test('Egypt opening scene uses the existing scarab seal path for a brief Anubis and Asha setup', () => {
  const scarabSealStart = source.indexOf('export const SCARAB_SEAL_TRIGGER = {');
  const scarabSealEnd = source.indexOf('export const HAZARDS = [');
  const scarabSealTrigger = source.slice(scarabSealStart, scarabSealEnd);

  assert.notEqual(scarabSealStart, -1);
  assert.notEqual(scarabSealEnd, -1);
  assert.match(scarabSealTrigger, /eventName:\s*'Anubis'/);
  assert.match(scarabSealTrigger, /'Turn back, explorer\. This site is sealed by judgement\.'/);
  assert.match(scarabSealTrigger, /'My guardians hold the shards and tools of passage\.'/);
  assert.match(scarabSealTrigger, /'Prove your purpose, or the excavation below will remain closed\.'/);
  assert.match(scarabSealTrigger, /'Then I will guide you\. These artefacts must not be lost\.'/);
  assert.match(scarabSealTrigger, /'Restore the fragments the seal still recognises\. Pass the guardians\. The site will test you\.'/);
  assert.match(scarabSealTrigger, /guideFollowUpLine:\s*'Restore the fragments the seal still recognises\. Pass the guardians\. The site will test you\.'/);
  assert.match(journeyComponentSource, /const OPENING_THRESHOLD_SCENE_DURATION = 14/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_DURATION = 14/);
  assert.match(journeyComponentSource, /speaker:\s*SCARAB_SEAL_TRIGGER\.dialogueSpeakers\?\.\[index\]/);
  assert.match(journeyComponentSource, /at:\s*SCARAB_SEAL_TRIGGER\.dialogueTiming\?\.\[index\]/);
});

test('Egypt sacred trap seal and pedestal pack is registered as a future asset only', () => {
  [
    'guardianSealIdle',
    'guardianSealActivated',
    'sacredPedestalIdle',
    'sacredPedestalActivated',
  ].forEach((key) => {
    assert.ok(egyptSacredTrapAtlas.regions[key], `${key} should exist in the sacred trap atlas`);
    assert.match(journeyRenderAssetsSource, new RegExp(`'${key}'`));
  });

  assert.equal(egyptSacredTrapAtlas.image, 'egypt-sacred-traps-pack.png');
  assert.equal(egyptSacredTrapAtlas.source, 'imagegen-egypt-barrier-atlas-2026-05-20');
  assert.match(journeyRenderAssetsSource, /EGYPT_SACRED_TRAPS:\s*'egypt-sacred-traps'/);
  assert.match(journeyRenderAssetsSource, /EGYPT_SACRED_TRAPS_ATLAS_JSON/);
  assert.match(journeyRenderAssetsSource, /EXPECTED_EGYPT_SACRED_TRAP_ASSET_KEYS/);
  assert.match(expeditionStagesSource, /EGYPT_EXPEDITION_FUTURE_ASSETS/);
  assert.match(expeditionStagesSource, /future-journey-sacred-defence/);
  assert.match(expeditionStagesSource, /egypt-sacred-traps-pack\.json/);
  assert.doesNotMatch(journeyComponentSource, /environmentPackId=['"]egypt-sacred-traps['"]/);
});

test('Guardian Seal passive placement uses existing story props and idle sacred defence atlas regions', () => {
  const storyProps = extractExportedArray('STORY_PROPS');

  assert.match(storyProps, /id:\s*'guardian-seal-pedestal-passive'[\s\S]*?sectionId:\s*'dig-site-entrance'[\s\S]*?type:\s*'sacred-pedestal'[\s\S]*?x:\s*X\(8190\)[\s\S]*?y:\s*JY\(306\)/);
  assert.match(storyProps, /id:\s*'guardian-seal-passive'[\s\S]*?sectionId:\s*'dig-site-entrance'[\s\S]*?type:\s*'guardian-seal'[\s\S]*?x:\s*X\(8190\)[\s\S]*?y:\s*JY\(286\)/);
  assert.match(journeyRenderAssetsSource, /'sacred-pedestal':\s*'sacredPedestalIdle'/);
  assert.match(journeyRenderAssetsSource, /'guardian-seal':\s*'guardianSealIdle'/);
  assert.match(journeyComponentSource, /sacredTrapEnvironmentAssetsRef/);
  assert.match(journeyComponentSource, /packId:\s*ENVIRONMENT_ASSET_PACK_IDS\.EGYPT_SACRED_TRAPS/);
  assert.match(journeyComponentSource, /getEnvironmentAssetKeyForStoryProp\(propForAsset,\s*ENVIRONMENT_ASSET_PACK_IDS\.EGYPT_SACRED_TRAPS\)/);
  assert.doesNotMatch(journeyComponentSource, /guardian-seal-trigger/);
  assert.doesNotMatch(journeyComponentSource, /guardian-seal-passive' && scarabSealActivated/);
  assert.doesNotMatch(journeyComponentSource, /guardian-seal-pedestal-passive' && scarabSealActivated/);
});

test('Egypt Journey explains shard purpose and adds an optional Base Camp voucher cache', () => {
  assert.doesNotMatch(extractExportedArray('STORY_PROPS'), /id:\s*'relic-shard-purpose-note'/);
  assert.match(source, /Restore the fragments the seal still recognises\. Pass the guardians\. The site will test you\./);
  assert.match(source, /id:\s*'basecamp-upgrade-voucher'[\s\S]*?shardCost:\s*2[\s\S]*?rewardShards:\s*6[\s\S]*?cacheReward:\s*true/);
  assert.match(source, /id:\s*'desert-entry-premium-column-1'/);
  assert.match(journeyComponentSource, /Cache opened! Upgrade Voucher earned/);
  assert.match(journeyComponentSource, /journey-floating-hud-gems/);
  assert.match(journeyComponentSource, /is-rewarding/);
});

test('Egypt Journey loads visible sprites for all default Egypt enemy families', () => {
  assert.match(journeyEnemySpritesSource, /WITHHELD_EGYPT_CREATURE_SPRITE_FAMILIES/);
  assert.match(journeyEnemySpritesSource, /WITHHELD_EGYPT_CREATURE_SPRITE_FAMILIES = new Set\(\[\s*'cursedStatue',\s*'stoneGuardianEnemy',\s*\]\)/);
  assert.match(journeyEnemySpritesSource, /DESERT_SCARAB_SPRITE_ATLAS_JSON/);
  assert.match(journeyEnemySpritesSource, /SAND_SNAKE_SPRITE_ATLAS_JSON/);
  assert.match(journeyEnemySpritesSource, /SCORPION_SPRITE_ATLAS_JSON/);
  assert.match(journeyEnemySpritesSource, /SAND_WISP_SPRITE_ATLAS_JSON/);
  assert.match(journeyEnemySpritesSource, /WARRIOR_MUMMY_SPRITE_ATLAS_JSON/);
  assert.match(journeyEnemySpritesSource, /EXPECTED_WARRIOR_MUMMY_SPRITE_KEYS/);
  assert.match(journeyEnemySpritesSource, /ENEMY_VISUAL_SIZE_MULTIPLIER = 1\.5/);
  assert.match(journeyEnemySpritesSource, /ENEMY_VISUAL_SIZE_MULTIPLIERS = \{/);
  assert.match(journeyEnemySpritesSource, /ENEMY_SPRITE_GROUNDING_VERSION = 'enemy-sprite-grounding-2026-05-18'/);
  assert.match(journeyEnemySpritesSource, /scarab:\s*defeated \? 16 : 14/);
  assert.match(journeyEnemySpritesSource, /scorpion:\s*defeated \? 18 : 15/);
  assert.match(journeyEnemySpritesSource, /restoredTwoPoseWalkFamilies/);
  assert.match(journeyEnemySpritesSource, /new Set\(\['scarab', 'snake', 'bat'\]\)/);
  assert.match(journeyEnemySpritesSource, /shouldUseEnemySpritePack/);
  assert.match(journeyComponentSource, /if\s*\(!shouldUseEnemySpritePack\(enemy\)\)\s*return false/);
  assert.match(journeyComponentSource, /enemy\.type === 'guardian' \|\| enemy\.type === 'statue'/);
  assert.match(journeyComponentSource, /getBossSpritePack\(bossSpriteAssetsRef\.current, bossId\)/);
  assert.match(journeyComponentSource, /enemy\.type === 'scarab'/);
  assert.match(journeyComponentSource, /enemy\.type === 'snake'/);
  assert.match(journeyComponentSource, /enemy\.type === 'scorpion'/);
  assert.match(journeyComponentSource, /enemy\.type === 'sand-wisp'/);
  assert.match(journeyEnemySpritesSource, /if \(enemy\.type === 'mummy' \|\| name\.includes\('mummy'\)\) return 'mummy'/);
});

test('guardian knowledge quizzes stay available but are no longer used by boss fights', () => {
  assert.match(source, /export const GUARDIAN_KNOWLEDGE_QUESTIONS = \[/);
  assert.match(source, /export const GUARDIAN_KNOWLEDGE_CHALLENGES = \{/);
  assert.match(source, /question:\s*'What is an artefact\?'/);
  assert.match(journeyComponentSource, /const GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED = false;/);
  assert.match(
    journeyComponentSource,
    /const guardianQuestions = GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED && !current\.completedGuardianChallengeIds\?\.has\(b\.id\)/,
  );
});

test('Broken Ruins Route extends the Egypt opening with existing platformer systems', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const hazards = extractExportedArray('HAZARDS');
  const shards = source.slice(source.indexOf('const RELIC_SHARD_LAYOUT = ['), source.indexOf('export const RELIC_SHARDS'));
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');

  [
    'broken ruins route entry',
    'half-buried lintel',
    'ruins recovery step',
  ].forEach((label) => {
    assert.doesNotMatch(platforms, new RegExp(label));
  });
  assert.match(hazards, /broken-ruins-loose-stones/);
  assert.match(hazards, /Loose ruin stones shifted underfoot/);
  assert.match(shards, /\{\s*x:\s*2365,\s*y:\s*320\s*\}/);
  assert.doesNotMatch(storyProps, /broken-ruins-route-stones/);
  assert.doesNotMatch(storyProps, /Broken Ruins Route trail marker/);
  assert.match(storyProps, /generated premium carved fallen column in open sand after the pyramid/);
  assert.doesNotMatch(storyProps, /survey rope beside half-buried structure/);
  assert.match(events, /id:\s*'broken-ruins-route'/);
  assert.match(events, /Collapsed stones mark a careful route deeper toward the tomb/);
  assert.doesNotMatch(hiddenRoutes, /broken-ruins-route/);
});

test('Sandfall Collapsing Stone section adds a fair hazard beat after Broken Ruins', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const hazards = extractExportedArray('HAZARDS');
  const shards = source.slice(source.indexOf('const RELIC_SHARD_LAYOUT = ['), source.indexOf('export const RELIC_SHARDS'));
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');

  [
    'sandfall warning slab',
    'collapsing column step',
    'buried recovery stair',
  ].forEach((label) => {
    assert.match(platforms, new RegExp(label));
  });
  assert.match(hazards, /sandfall-warning-dust/);
  assert.match(hazards, /falling sand warned that the stones ahead were unstable/i);
  assert.match(hazards, /sandfall-collapsing-stones/);
  assert.match(hazards, /penalty:\s*\{\s*stamina:\s*8,\s*time:\s*3\s*\}/);
  assert.match(hazards, /sandfall-soft-pit/);
  assert.match(shards, /\{\s*x:\s*2025,\s*y:\s*238\s*\}/);
  assert.match(storyProps, /sandfall-warning-marker/);
  assert.match(storyProps, /broken column shedding sand/);
  assert.match(storyProps, /survey rope around unstable stones/);
  assert.match(events, /id:\s*'sandfall-collapsing-stone-section'/);
  assert.match(events, /Falling sand marks unstable stones before the deeper temple route\./);
  assert.doesNotMatch(hiddenRoutes, /sandfall/);
});

test('Temple Threshold route keeps the first switch readable without clutter platforms', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const hazards = extractExportedArray('HAZARDS');
  const shards = source.slice(source.indexOf('const RELIC_SHARD_LAYOUT = ['), source.indexOf('export const RELIC_SHARDS'));
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const markers = extractExportedArray('OBJECTIVE_MARKERS');

  [
    'temple threshold safe plinth',
    'entry pause step',
    'temple plinth',
    'switch teaching plinth',
    'fallen block step',
    'carved seal step',
  ].forEach((label) => {
    assert.doesNotMatch(platforms, new RegExp(label));
  });
  assert.match(hazards, /temple-threshold-hairline-crack/);
  assert.match(hazards, /penalty:\s*\{\s*time:\s*3\s*\}/);
  assert.match(hazards, /A hairline crack warned the team to step carefully\./);
  [
    /\{\s*x:\s*1548,\s*y:\s*320\s*\}/,
    /\{\s*x:\s*1638,\s*y:\s*320\s*\}/,
    /\{\s*x:\s*1748,\s*y:\s*320\s*\}/,
  ].forEach((rewardPoint) => {
    assert.match(shards, rewardPoint);
  });
  assert.match(storyProps, /temple-threshold-switch-trail/);
  [
    'atmosphere-temple-entry-pillar',
    'temple-approach-obelisk-fragment-1',
    'temple-threshold-crack-cue',
    'atmosphere-temple-tablet',
    'ruined-temple-relief-slab-1',
    'temple-door',
    'carved-stone-clue',
    'mural-wall',
    'ruined-temple-mural-fragment-2',
  ].forEach((id) => {
    assert.doesNotMatch(storyProps, new RegExp(`id:\\s*'${id}'`));
  });
  assert.match(events, /id:\s*'temple-threshold-climb'/);
  assert.match(events, /Relic shards mark the way toward the first switch\./);
  assert.match(markers, /id:\s*'switch-1'/);
  assert.match(markers, /x:\s*X\(2625\)/);
});

test('Switch 1 creates a visible temple mechanism response through existing Journey systems', () => {
  const platforms = extractExportedArray('PLATFORMS');
  assert.match(platforms, /id:\s*'switch-1-raised-return-plinth'/);
  assert.match(platforms, /label:\s*'switch raised return plinth'/);
  assert.match(platforms, /requiresObjective:\s*'switch-1'/);
  assert.match(journeyComponentSource, /const isPlatformAvailable = \(platform, current\) =>/);
  assert.match(journeyComponentSource, /platform\.requiresObjective/);
  assert.match(journeyComponentSource, /current\.collectedObjectiveIds\.has\(platform\.requiresObjective\)/);
  assert.match(journeyComponentSource, /visibleMechanismPlatforms/);
  assert.match(journeyComponentSource, /Stone mechanism activated\. Switches 1\/3\. A return plinth rises\./);
  assert.match(journeyComponentSource, /switch-1-response/);
  assert.match(journeyComponentSource, /A return plinth rises ahead\./);
});

test('early route gates avoid filler enemy requirements while preserving enemy-clear support for later routes', () => {
  const routeGates = extractExportedArray('ROUTE_GATES');
  const enemies = extractExportedArray('ENEMIES');

  assert.doesNotMatch(routeGates, /id:\s*'temple-approach-seal'[\s\S]*?enemies:\s*\[\s*'scarab-scout-1'\s*\]/);
  assert.doesNotMatch(routeGates, /id:\s*'guardian-prep-seal'[\s\S]*?enemies:\s*\[\s*'sand-wisp-start-1',\s*'sand-wisp-ledge-1'\s*\]/);
  assert.doesNotMatch(routeGates, /id:\s*'temple-seal'[\s\S]*?enemies:\s*\[\s*'warrior-mummy-threshold-1'\s*\]/);
  assert.doesNotMatch(enemies, /id:\s*'scarab-survey-1'/);
  assert.match(enemies, /id:\s*'scarab-scout-1'[\s\S]*?protectsRouteId:\s*'temple-approach-seal'/);
  assert.match(enemies, /id:\s*'sand-wisp-start-1'[\s\S]*?protectsRouteId:\s*'desert-upper-survey-route'/);
  assert.match(enemies, /id:\s*'sand-wisp-ledge-1'[\s\S]*?protectsRouteId:\s*'guardian-prep-seal'/);
  assert.match(journeyComponentSource, /requirements\.enemies/);
  assert.match(journeyComponentSource, /current\.defeatedEnemies\?\.has\(enemyId\)/);
  assert.match(journeyComponentSource, /type:\s*'enemyClear'/);
});

test('early verticality keeps required Map Tablet progress grounded while optional chamber climbs stay invisible', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const markers = extractExportedArray('OBJECTIVE_MARKERS');
  const shards = source.slice(source.indexOf('const RELIC_SHARD_LAYOUT = ['), source.indexOf('export const RELIC_SHARDS ='));

  [
    'mummification-chamber-bottom-secret-threshold',
    'mummification-chamber-sand-buried-block',
    'mummification-chamber-far-left-ground-shelf',
    'mummification-chamber-left-lower-terrace',
    'mummification-chamber-left-sandstone-shelf',
    'mummification-chamber-left-column-cap',
    'mummification-chamber-central-left-shelf',
    'mummification-chamber-central-drop-slab',
    'mummification-chamber-carved-lower-ledge',
    'mummification-chamber-right-low-landing',
    'mummification-chamber-right-stair-landing',
    'mummification-chamber-right-column-cap',
    'mummification-chamber-upper-rite-ledge',
    'mummification-chamber-left-doorway-ledge',
    'mummification-chamber-upper-left-platform',
    'mummification-chamber-upper-right-platform',
    'mummification-chamber-doorway-floor',
  ].forEach((id) => {
    assert.match(platforms, new RegExp(`id:\\s*'${id}'[\\s\\S]*?invisible:\\s*true`));
    assert.doesNotMatch(getDataRowById(platforms, id), /assetKey:\s*'sandstoneBlock'/);
  });
  [
    'desert-broken-ruin-lower-climb',
    'desert-broken-ruin-middle-climb',
    'desert-broken-ruin-tablet-ledge',
    'desert-broken-ruin-upper-ledge',
    'desert-seal-warden-ledge',
    'desert-false-relic-lower-step',
    'desert-false-relic-middle-step',
    'desert-false-relic-high-step',
    'guardian-prep-warden-ledge',
    'temple-approach-switch-ledge',
  ].forEach((id) => {
    assert.doesNotMatch(platforms, new RegExp(`id:\\s*'${id}'`));
  });
  assert.match(getDataRowById(markers, 'map-tablet'), /y:\s*GROUND_Y - 46/);
  assert.match(getDataRowById(markers, 'map-tablet'), /groundedProp:\s*true/);
  assert.match(shards, /\{\s*x:\s*590,\s*y:\s*226\s*\}/);
});

test('first mini-boss is gated by preparation and rewards the next route', () => {
  const routeGates = extractExportedArray('ROUTE_GATES');
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');

  assert.match(routeGates, /id:\s*'guardian-prep-seal'/);
  assert.match(routeGates, /name:\s*'Guardian Prep Seal'/);
  assert.match(routeGates, /x:\s*X\(1495\)/);
  assert.match(routeGates, /requires:\s*\{\s*objective:\s*'desert-entry'[\s\S]*?shards:\s*6/);
  assert.match(routeGates, /id:\s*'guardian-prep-seal'[\s\S]*?id:\s*'desert-seal'/);
  assert.match(routeGates, /readyHint:\s*'The Desert Map Seal opens\. Carry the record forward into the ruined temple\.'/);
  assert.match(source, /routeOpenMessage:\s*'The Scarab Queen falls\. Asha has permission, not trust\. Brush Handle recovered\. The Desert Map Seal answers\.'/);
  assert.match(source, /id:\s*'scarab-queen'[\s\S]*?arenaStart:\s*X\(2020\)/);
  assert.match(source, /id:\s*'scarab-queen'[\s\S]*?name:\s*'Scarab Queen'/);
  assert.doesNotMatch(storyProps, /Guardian Prep Seal: read Map Tablet and restore 6 relic shards/);
  assert.match(storyProps, /generated premium pillar-cap ruins in open sand after the pyramid/);
  assert.match(events, /Guardian Seal: read the Map Tablet and restore 6 relic shards before the Scarab Queen\./);
  assert.match(journeyComponentSource, /Collect the tool piece, then return to \$\{routeGateName \|\| 'the route gate'\}/);
  assert.match(journeyComponentSource, /current\.notice = `\$\{b\.name\} defeated\. \$\{rewardMoment\.title\} \$\{rewardMoment\.nextObjective\}`/);
  assert.match(journeyComponentSource, /current\.notice = `\$\{rewardMoment\.title\} \$\{rewardMoment\.nextObjective\}`/);
});

test('active boss domains suppress normal enemy noise near the guardian arena', () => {
  assert.match(journeyComponentSource, /const BOSS_DOMAIN_ENEMY_FOCUS_PADDING = 96/);
  assert.match(journeyComponentSource, /const SCARAB_QUEEN_ENEMY_FOCUS_PADDING = 220/);
  assert.match(journeyComponentSource, /const isNormalEnemyInsideBossFocus = \(enemy, bossDomain\) =>/);
  assert.match(journeyComponentSource, /bossDomain\.bossId === SCARAB_SEAL_TRIGGER\.bossId[\s\S]*?\? SCARAB_QUEEN_ENEMY_FOCUS_PADDING[\s\S]*?: BOSS_DOMAIN_ENEMY_FOCUS_PADDING/);
  assert.match(journeyComponentSource, /current\.bossDomain[\s\S]*?!current\.defeatedMiniBosses\.has\(current\.bossDomain\.bossId\)[\s\S]*?isNormalEnemyInsideBossFocus\(e, activeBossDomain\)/);
  assert.match(journeyComponentSource, /e\.attackWindup = 0;[\s\S]*?e\.attackTimer = 0;[\s\S]*?e\.aggroMemoryTimer = 0;[\s\S]*?return;/);
  assert.match(journeyComponentSource, /current\.enemies\.forEach\(\(enemy\) => \{[\s\S]*?if \(!enemy\.defeated && isNormalEnemyInsideBossFocus\(enemy, activeBossDomain\)\) return;/);
});

test('Scarab Queen boss intro is staged as a buried-sand emergence cinematic', () => {
  const miniBosses = extractExportedArray('MINI_BOSSES');
  const lairOpeningProp = new URL('../../../public/assets/expedition/bosses/scarab-queen-buried-lair-opening.png', import.meta.url);

  assert.ok(existsSync(lairOpeningProp), 'buried scarab lair opening should exist as a transparent PNG runtime asset');
  assert.match(source, /bossIntroLine:\s*'The buried scarab lair splits open beneath the sand\. The Scarab Queen rises as the first trial of Anubis\. The site will not yield easily\.'/);
  assert.match(miniBosses, /id:\s*'scarab-queen'[\s\S]*?intro:\s*'Buried Lair: Scarab Queen\. The buried scarab lair splits open beneath the sand\. The Scarab Queen rises as the first trial of Anubis\. The site will not yield easily\.'/);
  assert.match(journeyComponentSource, /const SCARAB_QUEEN_INTRO_TRIGGER_DISTANCE = 220/);
  assert.match(journeyComponentSource, /const SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS = 6\.8/);
  assert.doesNotMatch(journeyComponentSource, /SCARAB_QUEEN_TRIGGER_LOOTER_OFFSET/);
  assert.match(journeyComponentSource, /const SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO = 0\.72/);
  assert.match(journeyComponentSource, /const SCARAB_QUEEN_LAIR_OPENING_IMAGE_SRC = 'assets\/expedition\/bosses\/scarab-queen-buried-lair-opening\.png'/);
  assert.match(journeyComponentSource, /const drawScarabQueenLairOpeningProp = useCallback/);
  assert.match(journeyComponentSource, /const width = 500 \+ crack \* 64/);
  assert.match(journeyComponentSource, /const getScarabQueenEmergenceBeat = \(introProgress\) =>/);
  assert.match(journeyComponentSource, /buriedSealCrack:/);
  assert.match(journeyComponentSource, /glyphGlow:/);
  assert.match(journeyComponentSource, /sandEruption:/);
  assert.match(journeyComponentSource, /queenRise:/);
  assert.match(journeyComponentSource, /buriedSandEmergence:\s*scarabQueenCinematic/);
  assert.match(journeyComponentSource, /introSeconds:\s*scarabQueenCinematic \? SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS : 3\.2/);
  assert.match(journeyComponentSource, /title:\s*scarabQueenCinematic \? `Buried Lair: \$\{b\.name\}` : `Guardian Encounter: \$\{b\.name\}`/);
  assert.match(journeyComponentSource, /triggerActor:\s*scarabQueenCinematic \? 'Buried Scarab Lair' : null/);
  assert.match(journeyComponentSource, /triggerLine:\s*scarabQueenCinematic \? 'The lair mouth splits open\. Something ancient is rising\.' : null/);
  assert.match(journeyComponentSource, /cameraAnchorRatio:\s*scarabQueenCinematic \? SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO : null/);
  assert.match(journeyComponentSource, /const bossIntroTriggerDistance = scarabSealRequired \? SCARAB_QUEEN_INTRO_TRIGGER_DISTANCE : 400/);
  assert.doesNotMatch(journeyComponentSource, /LAIR OPENS|QUEEN RISES|FIELD TEAM/);
  assert.match(journeyComponentSource, /const buriedSandEmergenceActive = Boolean\(activeBossDomain\?\.buriedSandEmergence && introActive\)/);
  assert.match(journeyComponentSource, /cinematicBeat:\s*buriedSandEmergenceActive \? getScarabQueenEmergenceBeat\(introProgress\) : null/);
  assert.doesNotMatch(journeyComponentSource, /id:\s*'scarab-queen-trigger-looter'[\s\S]*?type:\s*'looter'/);
  assert.match(journeyComponentSource, /if \(boss\.id === 'scarab-queen' && bossVisualState\?\.buriedSandEmergence && bossVisualState\.cinematicBeat\?\.queenRise <= 0\) return false;/);
  assert.match(journeyComponentSource, /if \(isBuriedScarabQueen && current\.bossDomain\?\.bossId === boss\.id\) \{[\s\S]*?drawScarabQueenLairOpeningProp\(ctx, current\.bossDomain\.bossStartX \|\| boss\.x \+ boss\.width \/ 2, cameraX, now\)/);
  assert.match(journeyComponentSource, /SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS[\s\S]*?current\.bossIntro = \{[\s\S]*?title:\s*`Buried Lair: \$\{boss\.name\}`/);
  assert.match(journeyComponentSource, /target === 'journey-boss-intro-progress'/);
  assert.match(journeyComponentSource, /const bossIntroActive = current\.bossIntro\?\.id === boss\.id;[\s\S]*?if \(!bossIntroActive\) drawEnemyAttackTell/);
  assert.match(journeyComponentSource, /ctx\.fillStyle = 'rgba\(0,0,0,0\.62\)';\s*ctx\.beginPath\(\);\s*ctx\.roundRect\(barX, barY, barWidth, barHeight, 5\);[\s\S]*?ctx\.fillStyle = boss\.awakened \? '#dc2626' : '#b45309';\s*ctx\.beginPath\(\);\s*ctx\.roundRect\(barX, barY, \(boss\.health \/ boss\.maxHealth\) \* barWidth, barHeight, 5\);/);
  assert.match(journeyComponentSource, /activeBossDomainForObjectiveMarkers[\s\S]*?gate\.x >= \(activeBossDomainForObjectiveMarkers\.arenaStart \?\? -Infinity\) - 24[\s\S]*?gate\.x <= \(activeBossDomainForObjectiveMarkers\.arenaEnd \?\? Infinity\) \+ 72/);
  assert.match(journeyComponentSource, /const bossDomainHudSuppressed = gameState\.bossDomain[\s\S]*?const activeHudGate = bossDomainHudSuppressed[\s\S]*?\? null[\s\S]*?: ROUTE_GATES\.find/);
  assert.match(journeyComponentSource, /const activeBossDomainForObjectiveMarkers = current\.bossDomain[\s\S]*?if \(!chamberSceneActive && !activeBossDomainForObjectiveMarkers\) drawMissingObjectiveMarker/);
});

test('Expedition map avoids artificial in-world canvas text labels', () => {
  const drawStart = expeditionModeSource.indexOf('const draw = useCallback(() => {');
  const drawEnd = expeditionModeSource.indexOf('const update = useCallback', drawStart);
  const expeditionMapDrawSource = expeditionModeSource.slice(drawStart, drawEnd);

  assert.notEqual(drawStart, -1, 'Expedition map draw callback should exist');
  assert.notEqual(drawEnd, -1, 'Expedition map update callback should follow draw callback');
  assert.match(expeditionMapDrawSource, /closedGateSlab/);
  assert.match(expeditionMapDrawSource, /exitArch/);
  assert.doesNotMatch(expeditionMapDrawSource, /ctx\.fillText\(/);
  assert.doesNotMatch(expeditionMapDrawSource, /pinnedFieldLabel|surveyTag/);
  assert.doesNotMatch(expeditionMapDrawSource, /Dig zone marked|Surveyed|Survey ready|Check needed/);
  assert.doesNotMatch(expeditionMapDrawSource, /'OPEN'|'LOCKED'|'YOU'/);
  assert.doesNotMatch(expeditionMapDrawSource, /lockedSealIcon|unlockedSealIcon/);
});

test('Journey progress gates use arch and slab assets instead of artificial padlock markers', () => {
  const drawStart = journeyComponentSource.indexOf('const drawRouteGate = useCallback');
  const drawEnd = journeyComponentSource.indexOf('const drawMissingObjectiveMarker = useCallback', drawStart);
  const routeGateDrawSource = journeyComponentSource.slice(drawStart, drawEnd);

  assert.notEqual(drawStart, -1, 'Journey route gate renderer should exist');
  assert.notEqual(drawEnd, -1, 'Missing-objective marker should follow route gate renderer');
  assert.match(journeyComponentSource, /ROUTE_GATE_BACK_SRC = 'assets\/expedition\/environment\/egypt-opening\/route-gate-back\.png'/);
  assert.match(journeyComponentSource, /ROUTE_GATE_FRONT_SRC = 'assets\/expedition\/environment\/egypt-opening\/route-gate-front\.png'/);
  assert.match(journeyComponentSource, /ROUTE_GATE_SLAB_SRC = 'assets\/expedition\/environment\/egypt-opening\/route-gate-slab\.png'/);
  assert.match(journeyComponentSource, /ROUTE_GATE_ASSET_VERSION = 'imagegen-egypt-route-gate-arch-column-slab-2026-05-31'/);
  assert.match(routeGateDrawSource, /drawGateAsset\(routeGateSlabRef/);
  assert.match(routeGateDrawSource, /drawGateAsset\(routeGateBackRef/);
  assert.match(routeGateDrawSource, /drawGateAsset\(routeGateFrontRef/);
  assert.match(routeGateDrawSource, /layer === 'foreground'[\s\S]*?if \(complete\)/);
  assert.match(journeyComponentSource, /current\.openedRouteGateIds\.has\(gate\.id\) \|\| requirements\.every\(r => r\.met\)/);
  assert.doesNotMatch(routeGateDrawSource, /drawFieldNoteLabel|gateRequirementLabel|gate\.name/);
  assert.doesNotMatch(routeGateDrawSource, /ctx\.arc\(gateCenter[\s\S]*?ctx\.fillRect\(gateCenter - 7/);
});

test('Scarab Queen approach builds dread before the lair emergence', () => {
  const egyptEnemies = extractExportedArray('ENEMIES');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');

  assert.match(egyptEnemies, /id:\s*'scorpion-warning-1'[\s\S]*?name:\s*'Lair Warden Scorpion'[\s\S]*?encounterRole:\s*'lair approach pressure'/);
  assert.match(egyptEnemies, /id:\s*'snake-1'[\s\S]*?name:\s*'Buried Lair Snake'[\s\S]*?encounterRole:\s*'lair approach pressure'/);
  assert.match(events, /id:\s*'scarab-queen-lair-dread-wind'[\s\S]*?message:\s*'A low wind pulls sand toward something buried ahead\.'/);
  assert.match(appSource, /scarabQueenApproachAtmosphere:\s*\{[\s\S]*?opening-desert-wind\.ogg[\s\S]*?opening-deep-rumble\.ogg/);
  assert.match(journeyComponentSource, /ev\.id === 'scarab-queen-lair-dread-wind'[\s\S]*?playExpeditionSfx\?\.\('scarabQueenApproachAtmosphere'\)/);
});

test('environment interactions include reactive foreground and movement elements', () => {
  const interactions = extractExportedArray('ENVIRONMENT_INTERACTIONS');
  const platforms = extractExportedArray('PLATFORMS');

  [
    'breakable-crate',
    'loose-rocks',
    'hanging-rope',
    'swinging-banner',
    'collapsing-bridge',
    'watchtower-section',
    'rippling-water',
    'blowing-grass',
  ].forEach((type) => {
    assert.match(interactions, new RegExp(`type:\\s*'${type}'`));
  });
  assert.match(platforms, /reactive:\s*\{/);
  assert.match(platforms, /unstable platform/);
  assert.match(platforms, /collapsing bridge piece/);
  assert.match(platforms, /respawn:/);
});

test('platform polish creates purposeful jump challenges with checkpoint rescue hooks', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const upgrades = extractExportedArray('UPGRADES');
  const hazards = extractExportedArray('HAZARDS');

  [
    'temple-sandfall-climb',
    'catacomb-torch-climb',
    'final-site-permit-climb',
  ].forEach((challengeId) => {
    assert.match(platforms, new RegExp(`challengeId:\\s*'${challengeId}'|challengeComplete:\\s*'${challengeId}'`));
  });

  [
    'collapsing column step',
    'sandfall recovery shelf',
    'archive reward step',
    'torch safe ledge',
    'bat dodge perch',
    'survey rope ledge',
  ].forEach((label) => {
    assert.match(platforms, new RegExp(label));
  });
  [
    'post-pyramid-guardian-prep-route',
    'post-pyramid survey plinth',
    'field kit stepping stone',
    'guardian prep cracked ledge',
    'guardian prep safe marker',
  ].forEach((removedPlatform) => {
    assert.doesNotMatch(platforms, new RegExp(removedPlatform));
  });

  assert.match(platforms, /challengeFailMessage:/);
  assert.match(journeyComponentSource, /current\.activePlatformChallenge/);
  assert.match(journeyComponentSource, /triggerJourneyRescue\('Missed platform jump\. Field rescue required\.'/);

  assert.match(hazards, /id:\s*'entry-pressure-plate'[\s\S]*?width:\s*126[\s\S]*?penalty:\s*\{\s*stamina:\s*8,\s*time:\s*3\s*\}/);
  assert.match(hazards, /id:\s*'entry-cracked-floor-trap'[\s\S]*?penalty:\s*\{\s*stamina:\s*9\s*\}/);
  assert.match(hazards, /id:\s*'sand-pit'[\s\S]*?width:\s*132[\s\S]*?penalty:\s*\{\s*time:\s*9\s*\}/);
  assert.match(hazards, /Step around it or jump cleanly/);
  assert.match(hazards, /Use the clear stone path around it/);
  assert.match(journeyRenderAssetsSource, /'entry-pressure-plate':\s*'groundCracked'/);
  assert.match(journeyRenderAssetsSource, /'entry-cracked-floor-trap':\s*'groundCracked'/);
  assert.match(journeyComponentSource, /'entry-pressure-plate':\s*\{[\s\S]*?warning:\s*'ground'/);
  assert.match(journeyComponentSource, /'entry-cracked-floor-trap':\s*\{[\s\S]*?warning:\s*'ground'/);
  assert.doesNotMatch(journeyComponentSource, /visualHazardId === 'entry-pressure-plate'[\s\S]*?ctx\.roundRect/);
  assert.doesNotMatch(journeyComponentSource, /visualHazardId === 'entry-cracked-floor-trap'[\s\S]*?ctx\.strokeRect/);
  assert.doesNotMatch(journeyComponentSource, /hazard\.id === 'sand-pit'[\s\S]*?ctx\.arc/);
  assert.match(journeyComponentSource, /const drawEnemyAttackTell = useCallback\(\(ctx, enemy/);
  assert.match(journeyComponentSource, /attackTellActive/);
  assert.match(journeyComponentSource, /recoveryWindowActive/);
  assert.match(journeyComponentSource, /const drawAttackArc = useCallback\(\(\) => \{\}, \[\]\)/);

  assert.match(upgrades, /id:\s*'basecamp-upgrade-voucher'[\s\S]*?x:\s*X\(925\)[\s\S]*?y:\s*JY\(320\)/);
  assert.match(upgrades, /id:\s*'reinforced-boots'[\s\S]*?x:\s*X\(1310\)[\s\S]*?y:\s*JY\(270\)/);
  assert.match(upgrades, /id:\s*'rope-launcher'[\s\S]*?x:\s*X\(2935\)[\s\S]*?y:\s*JY\(210\)/);
  assert.match(upgrades, /id:\s*'torch-upgrade'[\s\S]*?x:\s*X\(4405\)[\s\S]*?y:\s*JY\(252\)/);
  assert.match(upgrades, /id:\s*'ancient-compass'[\s\S]*?x:\s*X\(7905\)[\s\S]*?y:\s*JY\(220\)/);
});

test('Egypt hazard traps use painted decal assets with ground-aligned placement', () => {
  const hazards = extractExportedArray('HAZARDS');
  const hazardPurposes = source.slice(source.indexOf('export const HAZARD_PURPOSES = {'), source.indexOf('export const ENEMIES = ['));
  const hazardIds = [...hazards.matchAll(/id:\s*'([^']+)'/g)].map(match => match[1]);

  assert.ok(existsSync(egyptOpeningTrapDecalsPath), 'opening trap decal sheet should exist');
  assert.ok(existsSync(egyptOpeningHazardDecalsPath), 'opening hazard decal sheet should exist');
  assert.match(journeyComponentSource, /OPENING_TRAP_DECAL_PACK_SRC/);
  assert.match(journeyComponentSource, /OPENING_HAZARD_DECAL_PACK_SRC/);
  assert.match(journeyComponentSource, /painted-egypt-trap-decals-complete/);
  assert.match(journeyComponentSource, /getEgyptHazardDecalDest\(hazard,\s*hx,\s*footY,\s*decalDescriptor\.regionKey\)/);

  hazardIds.forEach((id) => {
    assert.match(
      hazardPurposes,
      new RegExp(`'${id}'`),
      `${id} should have a defined in-game trap purpose`,
    );
    assert.match(
      journeyComponentSource,
      new RegExp(`'${id}':\\s*'[^']+'`),
      `${id} should map to a painted Egypt hazard decal`,
    );
  });

  [
    'spikeTrap',
    'pressurePlate',
    'crackedFloor',
    'scarabSealTrap',
    'glyphTripwire',
    'fallingStoneWarning',
    'softSandPit',
    'thornScrub',
    'darkGap',
    'batCloud',
    'dustWave',
    'looseSlope',
    'surveyRope',
    'warningRubble',
  ].forEach((regionKey) => {
    assert.match(journeyComponentSource, new RegExp(`${regionKey}:\\s*\\{[\\s\\S]*?height:`));
  });

  assert.match(hazardPurposes, /buried-spike-floor[\s\S]*?teaches jump timing/);
  assert.match(hazardPurposes, /pressure-and-seal-trigger[\s\S]*?testing entry/);
  assert.match(hazardPurposes, /unstable-floor[\s\S]*?cracked temple floors/);
  assert.match(hazardPurposes, /survey-site-obstacles[\s\S]*?expedition activity becoming a hazard/);
  assert.match(journeyComponentSource, /'temple-loose-step':\s*'crackedFloor'/);
  assert.match(journeyComponentSource, /'temple-floor-crack':\s*'crackedFloor'/);
  assert.match(journeyComponentSource, /'escape-cracked-step':\s*'entry-cracked-floor-trap'/);
  assert.match(journeyComponentSource, /'camp-low-rope':\s*'survey-rope'/);
  assert.match(journeyComponentSource, /'dig-site-loose-rope':\s*'survey-rope'/);
  assert.match(journeyComponentSource, /'rolling-stones':\s*'warningRubble'/);
  assert.match(journeyComponentSource, /'sandfall-collapsing-stones':\s*'warningRubble'/);
  assert.match(journeyRenderAssetsSource, /'temple-loose-step':\s*'groundCracked'/);
  assert.match(journeyRenderAssetsSource, /'temple-floor-crack':\s*'groundCracked'/);
  assert.match(journeyRenderAssetsSource, /'escape-cracked-step':\s*'groundCracked'/);
  assert.match(journeyRenderAssetsSource, /'camp-low-rope':\s*'rope'/);
  assert.match(journeyRenderAssetsSource, /'dig-site-loose-rope':\s*'rope'/);
  assert.doesNotMatch(journeyRenderAssetsSource, /'temple-loose-step':\s*'spikeTrap'/);
  assert.doesNotMatch(journeyRenderAssetsSource, /'temple-floor-crack':\s*'spikeTrap'/);
});

test('dynamic world events add mystery and atmosphere without new level systems', () => {
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const landmarks = extractExportedArray('WORLD_CONTINUITY_LANDMARKS');
  const storyProps = extractExportedArray('STORY_PROPS');

  [
    'rockfall',
    'dust-gust',
    'birds-scatter',
    'moving-fog',
    'ruin-collapse',
    'shrine-glow',
    'unstable-excavation',
  ].forEach((type) => {
    assert.match(events, new RegExp(`type:\\s*'${type}'`));
  });
  assert.match(events, /dynamic:\s*true/);
  assert.match(events, /card:\s*false/);
  assert.match(events, /Ancient Shrine Discovered/);

  assert.match(landmarks, /hidden-watchtower-route/);
  assert.match(landmarks, /type:\s*'shrine'/);
  assert.match(landmarks, /type:\s*'blocked-tunnel'/);

  [
    'generated premium pillar-cap ruins in open sand after the pyramid',
    'paired ceremonial lamps',
    'collapsed tower remains',
    'old field journal cache',
    'sealed blocked tunnel',
    'destroyed bridge remains',
    'broken excavation tools',
  ].forEach((label) => {
    assert.match(storyProps, new RegExp(label));
  });
});

test('Discovery Entrance upgrades the final Journey handoff without replacing Base Camp', () => {
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const storyProps = extractExportedArray('STORY_PROPS');

  assert.match(source, /export const DISCOVERY_ENTRANCE = \{/);
  assert.match(source, /Discovery Entrance Found/);
  assert.match(source, /You have located a sealed archaeological site\./);
  assert.match(source, /Return to Base Camp Outpost to prepare the excavation\./);
  assert.match(events, /id:\s*'discovery-entrance-reveal'/);
  assert.match(events, /type:\s*'shrine-glow'/);
  assert.match(storyProps, /sealed entrance lamps/);
  assert.match(storyProps, /buried stairway marker/);

  assert.match(journeyComponentSource, /DISCOVERY_ENTRANCE_REVEAL_SECONDS/);
  assert.match(journeyComponentSource, /drawDiscoveryEntrance/);
  assert.match(journeyComponentSource, /discoveryEntranceActive/);
  assert.match(journeyComponentSource, /onComplete\?\.\(\[\.\.\.current\.fieldKit\]\)/);
});

test('dynamic world events use a project-bound painted asset sheet', () => {
  assert.match(DYNAMIC_WORLD_EFFECTS_VERSION, /painted-dynamic-world-effects/);
  assert.match(DYNAMIC_WORLD_EFFECTS_SRC, /assets\/expedition\/environment\/dynamic-world\/egypt-dynamic-world-effects\.png/);
  ['dustGust', 'birdsScatter', 'shrineGlow', 'rockfall'].forEach((key) => {
    assert.ok(DYNAMIC_WORLD_EFFECT_REGIONS[key], `${key} region should be mapped`);
    assert.ok(DYNAMIC_WORLD_EFFECT_REGIONS[key].w > 0);
    assert.ok(DYNAMIC_WORLD_EFFECT_REGIONS[key].h > 0);
  });
  assert.ok(
    existsSync(new URL('../../../public/assets/expedition/environment/dynamic-world/egypt-dynamic-world-effects.png', import.meta.url)),
    'painted dynamic world asset should exist in public assets',
  );
});

test('Egypt atmosphere prop pack is registered and drawn through existing story props', () => {
  const storyProps = extractExportedArray('STORY_PROPS');

  assert.equal(egyptAtmosphereAtlas.image, 'egypt-atmosphere-pack.png');
  assert.match(egyptAtmosphereAtlas.source, /Generated premium Desert Entry props plus curated atmosphere pass 2026-05-25/);
  [
    'supplyJars',
    'fieldChest',
    'scrollCache',
    'torchStand',
    'rubbleScatter',
    'standingPillar',
    'brokenPillarTall',
    'stoneDoorFrame',
    'ankhSealPanel',
  ].forEach((key) => {
    assert.ok(egyptAtmosphereAtlas.regions[key], `${key} should exist in the atmosphere atlas`);
    assert.match(journeyRenderAssetsSource, new RegExp(`'${key}'`));
    assert.match(storyProps, new RegExp(`atmosphereAssetKey:\\s*'${key}'`));
  });
  [
    'desertEntryPremiumFallenColumn',
    'desertEntryPremiumPillarCaps',
    'desertEntryPremiumFieldChest',
    'desertEntryPremiumStorageJars',
    'desertEntryPremiumThresholdSlab',
  ].forEach((key) => {
    assert.ok(egyptAtmosphereAtlas.regions[key], `${key} should exist in the generated premium prop atlas`);
    assert.match(journeyRenderAssetsSource, new RegExp(`'${key}'`));
  });
  [
    'desertEntryPremiumFallenColumn',
    'desertEntryPremiumPillarCaps',
    'desertEntryPremiumThresholdSlab',
  ].forEach((key) => {
    assert.match(storyProps, new RegExp(`atmosphereAssetKey:\\s*'${key}'`));
  });
  assert.ok(egyptAtmosphereAtlas.regions.coinPile, 'coinPile remains available in the atlas but should not be used in the curated Journey layout');
  assert.match(journeyRenderAssetsSource, /'coinPile'/);
  assert.doesNotMatch(storyProps, /atmosphereAssetKey:\s*'coinPile'/);

  assert.ok(
    existsSync(new URL('../../../public/assets/expedition/environment/egypt-atmosphere/egypt-atmosphere-pack.png', import.meta.url)),
    'curated atmosphere atlas image should exist in public assets',
  );
  assert.match(journeyRenderAssetsSource, /EGYPT_ATMOSPHERE:\s*'egypt-atmosphere'/);
  assert.match(journeyRenderAssetsSource, /EGYPT_ATMOSPHERE_ASSET_VERSION = 'gemini-egypt-atmosphere-props-2026-05-21'/);
  assert.match(journeyComponentSource, /atmosphereEnvironmentAssetsRef/);
  assert.match(journeyComponentSource, /packId:\s*ENVIRONMENT_ASSET_PACK_IDS\.EGYPT_ATMOSPHERE/);
  assert.match(journeyComponentSource, /atmospherePropCount/);
  assert.match(journeyComponentSource, /propForAsset\.atmosphereAssetKey/);
  assert.doesNotMatch(journeyComponentSource, /new Atmosphere|class Atmosphere|createAtmosphereSystem/);
});

test('Egypt atmosphere layout fills each Journey section without changing gameplay systems', () => {
  const storyProps = extractExportedArray('STORY_PROPS');

  [
    'desert-entry',
    'ruined-temple',
    'catacombs',
    'escape-sequence',
    'dig-site-entrance',
  ].forEach((sectionId) => {
    assert.match(
      storyProps,
      new RegExp(`sectionId:\\s*'${sectionId}'[\\s\\S]*?type:\\s*'atmosphere-prop'`),
      `${sectionId} should include decorative atmosphere props`,
    );
  });

  [
    'desert-entry-premium-threshold-slab-1',
    'desert-entry-premium-column-1',
    'desert-entry-premium-pillar-caps-1',
    'atmosphere-temple-fallen-stone',
    'ruined-temple-fallen-column-1',
    'catacomb-warning-urns-1',
    'escape-cracked-pillar-1',
    'dig-site-survey-grid-cache-1',
    'atmosphere-temple-scroll-cache',
    'catacomb-safe-ledge-evidence-2',
    'escape-shattered-bridge-blocks-2',
    'dig-site-rope-boundary-2',
    'dig-site-mapped-doorway-stones-2',
  ].forEach((propId) => {
    assert.match(storyProps, new RegExp(`id:\\s*'${propId}'`), `${propId} should be placed through STORY_PROPS`);
  });

  const atmospherePropMatches = [...storyProps.matchAll(/type:\s*'atmosphere-prop'/g)];
  assert.ok(atmospherePropMatches.length >= 38, 'atmosphere pass should keep coherent non-colliding prop clusters without ghost overlays');
  assert.match(storyProps, /catacomb-entry-urn-cluster-2[\s\S]*?catacomb-safe-ledge-evidence-2/);
  assert.match(storyProps, /dig-site-rope-boundary-2[\s\S]*?dig-site-rolled-canvas-2/);
  assert.doesNotMatch(storyProps, /desert-entry-visible-|opening-route-visible-|opening-pyramid-(?:ledge|terrace|upper)-/);
  assert.doesNotMatch(journeyComponentSource, /expedition-cache/);
  assert.doesNotMatch(storyProps, /id:\s*'(atmosphere-entry-coin-offering|scarab-seal-broken-offering-2|atmosphere-dig-coin-offering|ruined-temple-offering-table-1|catacomb-marker-flag-cache-1)'/);
  assert.doesNotMatch(storyProps, /id:\s*'(desert-entry-survey-rope-stakes-2|desert-entry-low-rubble-cluster-2|desert-entry-glyph-slab-low-2|scarab-seal-marker-left-2|scarab-seal-clean-pedestal-fragment-2|scarab-seal-marker-right-2|scarab-seal-shards-bait-line-2|temple-approach-seal-panel-1|temple-threshold-rubble-base-2|temple-threshold-fallen-cap-2|temple-warning-tablet-cluster-2)'/);
  assert.doesNotMatch(storyProps, /type:\s*'atmosphere-prop'[\s\S]{0,220}damage:/);
  assert.doesNotMatch(storyProps, /type:\s*'atmosphere-prop'[\s\S]{0,220}collectible:/);
  assert.doesNotMatch(storyProps, /type:\s*'atmosphere-prop'[\s\S]{0,220}requiresObjective:/);
  assert.doesNotMatch(
    extractExportedArray('STAGE_ENTRANCE_FEATURES'),
    /id:\s*'ruined-temple-colossus-gate'[\s\S]{0,420}visibleWhenLocked:\s*true/,
    'desert-to-temple doorway should not render as a ghosted locked-route overlay'
  );
});

test('desert entry single-backdrop mode uses only the clean backdrop and grounding overlay', () => {
  assert.equal(desertEntryBackgroundAtlas.runtimeMode, 'single-composited-backdrop');
  assert.deepEqual(Object.keys(desertEntryBackgroundAtlas.regions), ['sky', 'groundingOverlay']);
  assert.equal(desertEntryBackgroundAtlas.regions.sky.image, undefined);
  assert.equal(desertEntryBackgroundAtlas.regions.groundingOverlay.image, 'desert-entry-grounding-overlay.png');
  assert.match(journeyBackgroundAssetsSource, /'groundingOverlay'/);
  assert.match(journeyComponentSource, /'groundingOverlay'/);
  assert.doesNotMatch(journeyComponentSource, /'dustOverlay'/);
  assert.doesNotMatch(journeyComponentSource, /'foregroundParallax'/);
});

test('desert entry grounding overlay stays a transparent archaeological sediment layer', () => {
  const overlayBytes = readFileSync(desertEntryGroundingOverlayPath);
  assert.equal(overlayBytes.toString('ascii', 1, 4), 'PNG');
  assert.equal(overlayBytes.readUInt32BE(16), desertEntryBackgroundAtlas.imageWidth);
  assert.equal(overlayBytes.readUInt32BE(20), desertEntryBackgroundAtlas.imageHeight);
  assert.equal(overlayBytes[25], 6, 'grounding overlay should be RGBA so the clean background remains canonical');
  [
    /buried ruin shelf/i,
    /sand drifts/i,
    /rubble fields/i,
    /contact shadows/i,
    /desert sediment/i,
    /ground-level dust haze/i,
  ].forEach((pattern) => {
    assert.match(desertEntryBackgroundAtlas.notes, pattern);
  });
});

test('desert entry foreground depth pack stays transparent, visual-only, and edge-framed', () => {
  assert.equal(existsSync(egyptForegroundDepthAtlasPath), true, 'foreground depth atlas metadata should exist');
  assert.equal(existsSync(egyptForegroundDepthPngPath), true, 'foreground depth atlas PNG should exist');
  const foregroundAtlas = JSON.parse(readFileSync(egyptForegroundDepthAtlasPath, 'utf8'));
  const foregroundBytes = readFileSync(egyptForegroundDepthPngPath);

  assert.equal(foregroundAtlas.image, 'egypt-foreground-depth-pack.png');
  assert.equal(foregroundBytes.toString('ascii', 1, 4), 'PNG');
  assert.equal(foregroundBytes[25], 6, 'foreground depth pack should be RGBA so existing scene art remains canonical');
  [
    'leftBrokenColumn',
    'rightBrokenColumn',
    'rubbleClusterLarge',
    'rubbleClusterSmall',
    'softSandDrift',
    'buriedCarvedHead',
    'damagedWallFragment',
    'dryShrub',
    'deadPalmRemnant',
    'lowDustVeil',
  ].forEach((key) => {
    assert.ok(foregroundAtlas.regions[key], `${key} should be present in the foreground depth pack`);
  });
  assert.match(foregroundAtlas.mappingNote, /visual-only/i);
  assert.match(foregroundAtlas.mappingNote, /terrain-level framing/i);
  assert.match(foregroundAtlas.mappingNote, /no collision/i);
  assert.match(foregroundAtlas.mappingNote, /does not replace existing artwork/i);
  assert.match(foregroundAtlas.mappingNote, /avoid tall ghosted edge cutouts/i);
  assert.match(journeyRenderAssetsSource, /EGYPT_FOREGROUND_DEPTH_ASSET_VERSION/);
  assert.match(journeyRenderAssetsSource, /EGYPT_FOREGROUND_DEPTH/);
  assert.match(journeyComponentSource, /ENABLE_FOREGROUND_DEPTH_LAYER = false/);
  assert.match(journeyComponentSource, /drawForegroundDepthLayer/);
  assert.match(journeyComponentSource, /drawForegroundDepthParticles/);
  assert.doesNotMatch(journeyComponentSource, /drawRegion\('leftBrokenColumn'/);
  assert.doesNotMatch(journeyComponentSource, /drawRegion\('rightBrokenColumn'/);
  assert.doesNotMatch(journeyComponentSource, /FOREGROUND_DEPTH[\s\S]{0,240}PLATFORMS/);
});

test('desert entry no longer draws old procedural fallback scenery', () => {
  assert.doesNotMatch(journeyComponentSource, /Parallax Hills/);
  assert.doesNotMatch(journeyComponentSource, /Parallax Ridges/);
  assert.doesNotMatch(journeyComponentSource, /drawDistantExpeditionWorker/);
  assert.doesNotMatch(journeyComponentSource, /drawKneelingSurveyor/);
  assert.doesNotMatch(journeyComponentSource, /drawTentFlap/);
  assert.doesNotMatch(journeyComponentSource, /drawRopedDigActivity/);
  assert.doesNotMatch(journeyComponentSource, /desert-survey-camp-life/);
});

test('desert entry props use visible atlas art instead of weak placeholders', () => {
  const storyProps = extractExportedArray('STORY_PROPS');
  const deprecatedDesertPropIds = [
    'desert-entry-survey-chest-1',
    'opening-ruin-climb-fallen-column',
    'opening-ruin-climb-glyph-slab',
    'opening-footprint-trail',
    'half-buried-pottery-marker',
    'opening-threshold-offering',
    'atmosphere-entry-supply-jars',
    'desert-entry-buried-pottery-1',
    'scarab-seal-warning-glyph-1',
    'scarab-seal-broken-offering-1',
    'upper-route-note-marker',
    'starter-route-marker',
    'relic-shard-purpose-note',
    'opening-sacred-threshold-guardian',
    'forgotten-mural-alcove-panel',
    'abandoned-camp',
    'guardian-prep-warning-marker',
    'survey-note-cache-start',
    'desert-damaged-field-kit',
    'desert-evidence-flag',
    'broken-ruins-trail-marker',
    'scarab-warning-marker',
    'desert-entry-field-chest-1',
    'early-voucher-cache-marker',
    'broken-seal-marker',
    'atmosphere-entry-broken-pillar',
  ];

  deprecatedDesertPropIds.forEach((propId) => {
    assert.doesNotMatch(storyProps, new RegExp(`id:\\s*'${propId}'`), `${propId} should not render as Desert Entry clutter`);
  });

  [
    ['desert-entry-premium-threshold-slab-1', 'desertEntryPremiumThresholdSlab', /x:\s*(1[6-9]\d\d|2\d\d\d)/, 'should sit past Asha on the open route'],
    ['desert-entry-premium-column-1', 'desertEntryPremiumFallenColumn', /x:\s*(1[6-9]\d\d|2\d\d\d)/, 'should sit past Asha on the open route'],
    ['desert-entry-premium-pillar-caps-1', 'desertEntryPremiumPillarCaps', /x:\s*(1[6-9]\d\d|2\d\d\d)/, 'should sit past Asha on the open route'],
  ].forEach(([propId, assetKey, xPattern, xMessage]) => {
    const row = getDataRowById(storyProps, propId);
    assert.match(row, new RegExp(`atmosphereAssetKey:\\s*'${assetKey}'`), `${propId} should use atlas art`);
    assert.match(row, /placementPreset:\s*'desertEntryGroundedRuin'/, `${propId} should render through the grounded ruin preset`);
    assert.doesNotMatch(row, /alpha:\s*1\b/, `${propId} should not render at full cut-out opacity`);
    assert.match(row, xPattern, `${propId} ${xMessage}`);
  });

  assert.doesNotMatch(storyProps, /sectionId:\s*'desert-entry'[\s\S]{0,220}type:\s*'sign'/);
  assert.doesNotMatch(storyProps, /sectionId:\s*'desert-entry'[\s\S]{0,220}type:\s*'mural'/);
});

test('small atmosphere floor assets are permanently ground-locked instead of background-tuned', () => {
  [
    'supplyJars',
    'fieldChest',
    'coinPile',
    'scrollCache',
    'rubbleScatter',
    'rubbleDustSmall',
    'fallenColumn',
    'pillarCaps',
  ].forEach((key) => {
    assert.match(journeyComponentSource, new RegExp(`'${key}'`));
  });

  assert.match(journeyComponentSource, /ATMOSPHERE_GROUND_LOCKED_ASSET_KEYS = new Set/);
  assert.match(journeyComponentSource, /isGroundLockedAtmosphereProp\(prop\)/);
  assert.match(journeyComponentSource, /shouldGroundLockAtmosphereProp = \(prop, propDepth\)/);
  assert.match(journeyComponentSource, /propDepth === 'route-edge' \|\| isGroundLockedAtmosphereProp\(prop\)/);
  assert.match(journeyComponentSource, /return 'grounded'/);
  assert.match(journeyComponentSource, /drawStoryProp\(ctx, prop, cameraX, now, 'grounded'\)/);
  assert.match(journeyComponentSource, /drawStoryProp\(ctx, prop, cameraX, now, 'route-edge'\)/);
  assert.match(journeyComponentSource, /Math\.max\(rawAnchorY, GROUND_Y - ATMOSPHERE_GROUND_LOCK_MARGIN\)/);
  assert.match(journeyComponentSource, /groundLockedAtmospherePropCount/);
  assert.match(journeyComponentSource, /PROP_DEPTH_TUNING_VERSION = 'journey-grounded-placement-presets-2026-05-26'/);
  assert.match(journeyComponentSource, /atmosphereGroundingMode:\s*'ground-locked-floor-and-route-edge-assets'/);
  assert.doesNotMatch(journeyComponentSource, /groundLocked.*parallax/);
});

test('route ground uses a narrow floor edge instead of a full-width bottom haze', () => {
  assert.match(journeyComponentSource, /ROUTE_GROUND_VISUAL_MODE = 'edge-and-local-aprons-no-full-width-haze'/);
  assert.match(journeyComponentSource, /ROUTE_GROUND_HAZE_FIX_VERSION = 'route-ground-no-bottom-haze-2026-05-21'/);
  assert.match(journeyComponentSource, /const floorBandTop = GROUND_Y -/);
  assert.match(journeyComponentSource, /const floorBandBottom = GROUND_Y \+/);
  assert.match(journeyComponentSource, /ctx\.moveTo\(0, floorBandBottom\)/);
  assert.match(journeyComponentSource, /ctx\.lineTo\(CANVAS_WIDTH, floorBandBottom\)/);
  assert.match(journeyComponentSource, /routeGroundVisualMode: ROUTE_GROUND_VISUAL_MODE/);
  assert.match(journeyComponentSource, /routeGroundHazeFixVersion: ROUTE_GROUND_HAZE_FIX_VERSION/);
  assert.doesNotMatch(journeyComponentSource, /const pathBottom = CANVAS_HEIGHT/);
  assert.doesNotMatch(journeyComponentSource, /ctx\.lineTo\(CANVAS_WIDTH, pathBottom\)/);
  assert.doesNotMatch(journeyComponentSource, /routeGroundVisualMode = 'wide-sand-stone-apron'/);
});

test('painted dynamic effects stay limited to moments that read clearly as static art', () => {
  ['shrine-glow', 'rockfall', 'ruin-collapse'].forEach((type) => {
    assert.equal(usesPaintedDynamicWorldEffect(type), true, `${type} should use the painted effect sheet`);
  });
  ['dust-gust', 'birds-scatter', 'moving-fog', 'unstable-excavation'].forEach((type) => {
    assert.equal(usesPaintedDynamicWorldEffect(type), false, `${type} should use procedural motion cues`);
  });
});

test('combat pressure encounters guard optional rewards without blocking progression', () => {
  const egyptEnemies = extractExportedArray('ENEMIES');
  const chinaEnemies = extractExportedArray('CHINA_ENEMIES');
  const allEnemies = `${egyptEnemies}\n${chinaEnemies}`;

  assert.match(allEnemies, /encounterRole:/);
  assert.match(allEnemies, /pressureHint:/);
  [
    'desert-upper-survey-route',
    'temple-cracked-wall-passage',
    'escape-shortcut-arch',
    'china-cracked-wall-archive',
    'china-watchtower-rope-route',
    'china-unstable-bridge-cache',
  ].forEach((routeId) => {
    assert.match(allEnemies, new RegExp(`protectsRouteId:\\s*'${routeId}'`));
  });
  assert.match(allEnemies, /route pressure/);
  assert.match(allEnemies, /watchtower pressure/);
  assert.match(allEnemies, /collapsing-bridge pressure/);
  assert.match(journeyUtilsSource, /scarab:\s*2/);
  assert.match(journeyUtilsSource, /looter:\s*3/);
  assert.match(journeyUtilsSource, /return clamp\(Math\.max\(enemy\.health \+ bonus, Math\.ceil\(enemy\.health \* 1\.55\)\), 3, 5\)/);
  assert.match(journeyUtilsSource, /Math\.ceil\(enemy\.health \* 1\.55\)/);
  assert.match(journeyUtilsSource, /if\s*\(enemy\.firstSealRouteRamp\)\s*return Math\.max\(1, enemy\.damage\)/);
  assert.match(journeyUtilsSource, /Math\.ceil\(enemy\.damage \* 1\.45\)/);
  assert.match(journeyUtilsSource, /baseSpeed: entity\.speed \* \(entity\.openingRouteRamp \? 1\.12 : 1\.18\)/);
  assert.match(journeyComponentSource, /const ENEMY_TACTICAL_PRESSURE = \{/);
  assert.match(journeyComponentSource, /awarenessMultiplier/);
  assert.match(journeyComponentSource, /chaseMultiplier/);
  assert.match(journeyComponentSource, /shieldDuringWindup: tunedPattern\.shieldDuringWindup \|\| Boolean\(pressure\.shieldDuringWindup\)/);
  assert.match(journeyComponentSource, /if \(isPressingPlayer\) \{[\s\S]*?e\.direction = distanceToPlayer >= 0 \? 1 : -1;/);
});

test('Egypt opening combat ramps gently before the first route seal', () => {
  const egyptEnemies = extractExportedArray('ENEMIES');
  const readAuthoredX = (row) => {
    const scaled = row.match(/x:\s*X\((\d+)\)/);
    if (scaled) return Number(scaled[1]);
    return Number(row.match(/x:\s*(\d+)/)?.[1] || Number.POSITIVE_INFINITY);
  };
  const openingRows = egyptEnemies
    .split('\n')
    .filter(row => /x:\s*(?:X\()?(\d+)/.test(row))
    .filter((row) => readAuthoredX(row) < 1480);

  const teachingRows = openingRows
    .filter((row) => readAuthoredX(row) <= 705);
  const totalOpeningHealth = openingRows
    .reduce((total, row) => total + Number(row.match(/health:\s*(\d+)/)?.[1] || 0), 0);
  const totalOpeningDamage = openingRows
    .reduce((total, row) => total + Number(row.match(/damage:\s*(\d+)/)?.[1] || 0), 0);
  const highDamageOpeningRows = openingRows
    .filter((row) => Number(row.match(/damage:\s*(\d+)/)?.[1] || 0) > 8);

  assert.ok(teachingRows.length >= 3, 'opening route should teach smaller creature reads before the first seal');
  assert.match(source, /id:\s*'opening-seal-reset-trap'[\s\S]*?penalty:\s*\{\s*stamina:\s*8\s*\}/);
  assert.equal(
    openingRows.every(row => /openingRouteRamp:\s*true/.test(row)),
    true,
    'Egypt enemies before the first seal should opt into the opening-route safety tuning',
  );
  assert.equal(
    teachingRows.every(row => /firstSealRouteRamp:\s*true/.test(row)),
    true,
    'first-seal proof enemies should opt into the gentlest opening route tuning',
  );
  assert.match(journeyUtilsSource, /if\s*\(enemy\.firstSealRouteRamp\)\s*return Math\.max\(3, enemy\.health\)/);
  assert.match(journeyUtilsSource, /if\s*\(enemy\.firstSealRouteRamp\)\s*return Math\.max\(1, enemy\.damage\)/);
  assert.equal(
    teachingRows.every(row => Number(row.match(/health:\s*(\d+)/)?.[1] || 0) <= 2 && Number(row.match(/damage:\s*(\d+)/)?.[1] || 0) <= 5),
    true,
    'first teaching enemies should keep low authored health and low damage so the seal proof stays readable',
  );
  assert.ok(totalOpeningHealth <= 24, 'first seal should not require too many regular enemy hits before the guardian');
  assert.ok(totalOpeningDamage <= 64, 'opening regular enemy damage budget should leave room for early-route mistakes');
  assert.equal(highDamageOpeningRows.length, 0, 'opening route should avoid high-damage regular enemies before the first seal');

  const checkpoints = extractExportedArray('CHECKPOINTS');
  assert.match(checkpoints, /id:\s*'desert-survey-marker'/);
  assert.match(checkpoints, /x:\s*X\(930\)/);
});

test('normal enemies take at least three weapon hits at runtime', () => {
  const runtimeEnemies = [...ENEMIES, ...CHINA_ENEMIES].map(makeEnemy);
  const tooFragileEnemies = runtimeEnemies
    .filter(enemy => enemy.maxHealth < 3 || enemy.health < 3)
    .map(enemy => `${enemy.id}:${enemy.health}/${enemy.maxHealth}`);

  assert.deepEqual(tooFragileEnemies, []);
  assert.equal(
    runtimeEnemies
      .filter(enemy => enemy.firstSealRouteRamp)
      .every(enemy => enemy.health >= 3 && enemy.maxHealth >= 3),
    true,
    'first-seal teaching enemies should still take at least three weapon hits',
  );
});

test('regular enemy families use distinct combat role timings without a new AI system', () => {
  assert.match(journeyComponentSource, /const ENEMY_ATTACK_PATTERNS = \{/);
  assert.match(journeyComponentSource, /const ENEMY_AGGRO_MEMORY_SECONDS = 4\.6/);
  assert.match(journeyComponentSource, /const ENEMY_AGGRO_PATROL_PADDING = 320/);
  assert.match(journeyComponentSource, /scarab:\s*\{[\s\S]*?awareness:\s*1\.55[\s\S]*?chase:\s*2\.05/);
  assert.match(journeyComponentSource, /scorpion:\s*\{[\s\S]*?awareness:\s*1\.45[\s\S]*?chase:\s*1\.85/);
  assert.match(journeyComponentSource, /scarab:\s*\{[\s\S]*?id:\s*'charge'[\s\S]*?windup:\s*0\.42[\s\S]*?speed:\s*185[\s\S]*?range:\s*38/);
  assert.match(journeyComponentSource, /scorpion:\s*\{[\s\S]*?id:\s*'sting'[\s\S]*?windup:\s*0\.6[\s\S]*?duration:\s*0\.3[\s\S]*?speed:\s*54[\s\S]*?range:\s*28[\s\S]*?height:\s*58[\s\S]*?yOffset:\s*-34[\s\S]*?backReach:\s*38[\s\S]*?damageScale:\s*1\.45/);
  assert.match(journeyComponentSource, /snake:\s*\{[\s\S]*?id:\s*'lunge'[\s\S]*?windup:\s*0\.62[\s\S]*?speed:\s*166[\s\S]*?range:\s*52/);
  assert.match(journeyComponentSource, /'sand-wisp':\s*\{[\s\S]*?id:\s*'sand-burst'[\s\S]*?windup:\s*0\.5[\s\S]*?speed:\s*150/);
  assert.match(journeyComponentSource, /guardian:\s*\{[\s\S]*?id:\s*'slam'[\s\S]*?windup:\s*0\.84[\s\S]*?speed:\s*52[\s\S]*?shieldDuringWindup:\s*true/);
  assert.match(journeyComponentSource, /if \(e\.attackTimer > 0\) \{[\s\S]*?e\.x \+= e\.attackDirection \* pattern\.speed \* dt/);
  assert.match(journeyComponentSource, /e\.attackRecovery = pattern\.recovery;[\s\S]*?e\.vulnerabilityTimer = pattern\.vulnerableAfter;/);
  assert.match(journeyComponentSource, /e\.aggroMemoryTimer = Math\.max\(e\.aggroMemoryTimer \|\| 0, ENEMY_AGGRO_MEMORY_SECONDS \* \(tacticalPattern\.aggroMemoryMultiplier \|\| 1\)\)/);
  assert.match(journeyComponentSource, /const isAggroChasing = \(e\.aggroMemoryTimer \|\| 0\) > 0/);
  assert.match(journeyComponentSource, /const chaseSpeedMultiplier = isAggroChasing[\s\S]*?\? \(tacticalPattern\.chaseMultiplier \|\| 1\.65\) \* \(e\.type === 'scorpion' \? SCORPION_CHASE_SPEED_MULTIPLIER : 1\)[\s\S]*?: 1/);
  assert.match(journeyComponentSource, /const movementMin = isAggroChasing \? e\.patrolMin - ENEMY_AGGRO_PATROL_PADDING : e\.patrolMin/);
});

test('combat audio uses creature and deflection cues instead of gate sounds', () => {
  assert.match(appSource, /combatDeflect:\s*\{/);
  assert.match(appSource, /scarabHit:\s*\{/);
  assert.match(appSource, /scorpionHit:\s*\{/);
  assert.match(appSource, /snakeHit:\s*\{/);
  assert.match(appSource, /sandWispHit:\s*\{/);
  assert.match(appSource, /bossHit:\s*\{/);
  assert.match(appSource, /playerImpact/);
  assert.match(appSource, /scarabShellHit/);
  assert.match(appSource, /window\.__playExpeditionSfxDebug/);
  assert.match(appSource, /window\.__expeditionSfxLog/);
  assert.match(journeyComponentSource, /const ENEMY_HIT_SFX_BY_TYPE = \{/);
  assert.match(journeyComponentSource, /scarab:\s*'scarabHit'/);
  assert.match(journeyComponentSource, /scorpion:\s*'scorpionHit'/);
  assert.match(journeyComponentSource, /snake:\s*'snakeHit'/);
  assert.match(journeyComponentSource, /'sand-wisp':\s*'sandWispHit'/);
  assert.match(journeyComponentSource, /getEnemyHitSfxKey\(e\)/);
  assert.match(journeyComponentSource, /playExpeditionSfx\?\.\('combatDeflect'/);
  assert.match(journeyComponentSource, /playExpeditionSfx\?\.\('bossHit'/);
  assert.doesNotMatch(journeyComponentSource, /blocked the rushed hit[\s\S]{0,180}playExpeditionSfx\?\.\('gateBlocked'/);
});

test('hazards and traps use trap audio instead of door sounds', () => {
  assert.match(appSource, /trapReset:\s*\{/);
  assert.match(appSource, /trapStoneTrigger:\s*\{/);
  assert.match(appSource, /trapSandTrigger:\s*\{/);
  assert.match(appSource, /trapReset/);
  assert.match(appSource, /trapStoneTrigger/);
  assert.match(appSource, /trapSandTrigger/);
  assert.match(journeyComponentSource, /const SAND_TRAP_HAZARD_IDS = new Set/);
  assert.match(journeyComponentSource, /const getHazardSfxKey = \(hazard\) =>/);
  assert.match(journeyComponentSource, /hazard\?\.pushToStart\) return 'trapReset'/);
  assert.match(journeyComponentSource, /return 'trapStoneTrigger'/);
  assert.match(journeyComponentSource, /playExpeditionSfx\?\.\(getHazardSfxKey\(h\)/);
  assert.doesNotMatch(journeyComponentSource, /pushToStart[\s\S]{0,1600}playExpeditionSfx\?\.\('gateBlocked'/);
});

test('enemy hits land harder while player pushback stays short', () => {
  assert.match(journeyUtilsSource, /enemy\.openingRouteRamp\s*\?\s*Math\.max\(enemy\.damage \+ 1, Math\.ceil\(enemy\.damage \* 1\.25\)\)/);
  assert.match(journeyUtilsSource, /if\s*\(enemy\.firstSealRouteRamp\)\s*return Math\.max\(1, enemy\.damage\)/);
  assert.match(journeyUtilsSource, /Math\.max\(enemy\.damage \+ 4, Math\.ceil\(enemy\.damage \* 1\.45\)\)/);
  assert.match(journeyComponentSource, /player\.knockbackMaxTimer = Math\.max\(0\.06, 0\.12 \* effectiveKnockbackMultiplier\)/);
  assert.match(journeyComponentSource, /player\.vx = approach\(player\.vx, direction \* 95 \* effectiveKnockbackMultiplier, 160\)/);
  assert.match(journeyComponentSource, /player\.vx \+= player\.knockbackDirection \* \(55 \+ knockbackProgress \* 42\.5\) \* knockbackMultiplier/);
});

test('opening enemy role overrides preserve first-route fairness and readable counters', () => {
  const egyptEnemies = extractExportedArray('ENEMIES');
  assert.doesNotMatch(egyptEnemies, /id:\s*'warrior-mummy-(start|dune|ridge)-1'/);
  assert.match(egyptEnemies, /id:\s*'warrior-mummy-threshold-1'[\s\S]*?name:\s*'Threshold Warrior Mummy'[\s\S]*?type:\s*'mummy'[\s\S]*?attackPatternTuning:\s*\{[\s\S]*?id:\s*'snake-temple-step-1'/);
  assert.match(egyptEnemies, /id:\s*'warrior-mummy-relic-guard-1'[\s\S]*?type:\s*'mummy'[\s\S]*?protectsRouteId:\s*'temple-cracked-wall-passage'/);
  assert.match(egyptEnemies, /id:\s*'warrior-mummy-catacomb-1'[\s\S]*?name:\s*'Catacomb Warrior Mummy'[\s\S]*?type:\s*'mummy'/);
  assert.match(journeyComponentSource, /'opening-seal-reset-trap':\s*'spikeTrap'/);
  assert.match(journeyComponentSource, /'opening-seal-reset-trap':\s*\{\s*xPad:\s*18,\s*widthPad:\s*36,\s*height:\s*42,\s*footInset:\s*28\s*\}/);
  assert.doesNotMatch(journeyComponentSource, /warningAlpha/);
  assert.doesNotMatch(journeyComponentSource, /hitActive[\s\S]{0,240}strokeStyle = 'rgba\(248, 113, 113/);
  assert.doesNotMatch(journeyComponentSource, /text:\s*'BOUNCE'/);
  assert.doesNotMatch(journeyComponentSource, /text:\s*'RESET'/);
  assert.match(journeyComponentSource, /spikeTrap:\s*\{\s*xPad:\s*12,\s*widthPad:\s*24,\s*height:\s*44/);
  assert.match(egyptEnemies, /id:\s*'scorpion-start-1'[\s\S]*?width:\s*44[\s\S]*?height:\s*30[\s\S]*?attackPatternTuning:\s*\{[\s\S]*?windup:\s*0\.66[\s\S]*?duration:\s*0\.34[\s\S]*?range:\s*26[\s\S]*?height:\s*62[\s\S]*?yOffset:\s*-38[\s\S]*?backReach:\s*42[\s\S]*?damageScale:\s*1\.5[\s\S]*?protectedDuringWindup:\s*true/);
  assert.match(egyptEnemies, /id:\s*'scorpion-pottery-1'[\s\S]*?name:\s*'Pottery Scorpion'[\s\S]*?type:\s*'scorpion'[\s\S]*?protectsRouteId:\s*'desert-opening-shard-cache'/);
  assert.match(egyptEnemies, /id:\s*'scorpion-seal-path-1'[\s\S]*?name:\s*'Seal Warden Scorpion'[\s\S]*?type:\s*'scorpion'[\s\S]*?protectsRouteId:\s*'temple-approach-seal'/);
  assert.match(egyptEnemies, /id:\s*'scorpion-guardian-path-1'[\s\S]*?name:\s*'Guardian Path Scorpion'[\s\S]*?type:\s*'scorpion'[\s\S]*?x:\s*X\(2130\)/);
  assert.match(egyptEnemies, /id:\s*'sand-wisp-start-1'[\s\S]*?damage:\s*4[\s\S]*?attackPatternTuning:\s*\{[\s\S]*?vulnerableAfter:\s*0\.72/);
  assert.match(egyptEnemies, /id:\s*'snake-1'[\s\S]*?attackPatternTuning:\s*\{[\s\S]*?windup:\s*0\.68[\s\S]*?range:\s*48/);
  assert.match(journeyComponentSource, /Scarab charges\. Move or jump, then strike\./);
  assert.match(journeyComponentSource, /Scorpion tails block the path\. Defeat them before moving forward\./);
  assert.match(journeyComponentSource, /Warrior mummies guard the threshold\. Wait for the sweep, then counter\./);
  assert.match(journeyComponentSource, /Snake lunges from mid-range\. Watch the coil\./);
});

test('Phase 5A desert combat gives Scarab Scout and Seal Warden readable counter roles', () => {
  const egyptEnemies = extractExportedArray('ENEMIES');
  const scarabScout = getDataRowById(egyptEnemies, 'scarab-scout-1');
  const sealWarden = getDataRowById(egyptEnemies, 'scorpion-seal-path-1');

  assert.match(scarabScout, /name:\s*'Scarab Scout'/);
  assert.match(scarabScout, /encounterRole:\s*'basic timing scout'/);
  assert.match(scarabScout, /combatRole:\s*'basic timing enemy'/);
  assert.match(scarabScout, /pressureHint:\s*'Anubis\\'s scout patrols the temple approach\. The seal will not open while it remains\.'/);
  assert.match(scarabScout, /attackPatternTuning:\s*\{[\s\S]*?label:\s*'Scout Charge'[\s\S]*?windup:\s*0\.72[\s\S]*?duration:\s*0\.24[\s\S]*?recovery:\s*0\.82[\s\S]*?vulnerableAfter:\s*0\.9/);
  assert.doesNotMatch(scarabScout, /health:\s*[3-9]/);

  assert.match(sealWarden, /name:\s*'Seal Warden Scorpion'/);
  assert.match(sealWarden, /encounterRole:\s*'route guardian enemy'/);
  assert.match(sealWarden, /combatRole:\s*'route guardian enemy'/);
  assert.match(sealWarden, /Anubis\\'s warden protects the seal/);
  assert.match(sealWarden, /Blind strikes bounce off its guard; counter after the sting\./);
  assert.match(sealWarden, /attackPatternTuning:\s*\{[\s\S]*?label:\s*'Guarded Sting'[\s\S]*?windup:\s*0\.82[\s\S]*?duration:\s*0\.32[\s\S]*?recovery:\s*0\.9[\s\S]*?vulnerableAfter:\s*0\.98[\s\S]*?shieldDuringWindup:\s*true[\s\S]*?protectedDuringWindup:\s*true/);
  assert.doesNotMatch(sealWarden, /health:\s*[3-9]/);

  assert.match(journeyComponentSource, /protectedDuringWindup/);
  assert.match(journeyComponentSource, /attackWindup > 0 && pattern\.protectedDuringWindup/);
  assert.match(journeyComponentSource, /combatRole:\s*enemy\.combatRole \|\| enemy\.encounterRole \|\| null/);
  assert.match(journeyComponentSource, /attackTellActive:\s*entity\.attackWindup > 0/);
  assert.match(journeyComponentSource, /recoveryWindowActive:\s*entity\.attackRecovery > 0/);
  assert.match(journeyComponentSource, /counterWindowActive:\s*entity\.vulnerabilityTimer > 0 \|\| entity\.attackRecovery > 0/);
  assert.match(journeyComponentSource, /drawEnemyAttackTell = useCallback\(\(ctx, enemy/);
  assert.match(journeyComponentSource, /if \(boss \|\| enemy\.defeated\) return/);
  assert.match(journeyComponentSource, /pattern\.protectedDuringWindup/);
});

test('Phase 5B isolates the first Scarab Scout and Seal Warden teaching pockets', () => {
  const egyptEnemies = extractExportedArray('ENEMIES');
  const getRow = (id) => getDataRowById(egyptEnemies, id);
  const readAuthoredX = (row, field = 'x') => {
    const scaled = row.match(new RegExp(`${field}:\\s*X\\((\\d+)\\)`));
    if (scaled) return Number(scaled[1]);
    return Number(row.match(new RegExp(`${field}:\\s*(\\d+)`))?.[1] || Number.POSITIVE_INFINITY);
  };
  const readInitialCooldown = (row) => Number(row.match(/initialAttackCooldown:\s*(\d+(?:\.\d+)?)/)?.[1] || 0);

  const scarabScout = getRow('scarab-scout-1');
  const startWisp = getRow('sand-wisp-start-1');
  const regularScarab = getRow('scarab-1');
  const ledgeWisp = getRow('sand-wisp-ledge-1');
  const upperScarab = getRow('scarab-upper-route-1');
  const sealWarden = getRow('scorpion-seal-path-1');
  const warningScorpion = getRow('scorpion-warning-1');
  const sandSnake = getRow('snake-1');

  assert.ok(readAuthoredX(startWisp, 'patrolMin') >= readAuthoredX(scarabScout, 'patrolMax') + 60, 'Sand Wisp should not overlap the Scout patrol pocket');
  assert.ok(readAuthoredX(startWisp) - readAuthoredX(scarabScout) >= 120, 'Sand Wisp should sit far enough after the Scout to avoid becoming the primary lesson enemy');
  assert.ok(readInitialCooldown(startWisp) >= 2, 'Sand Wisp should wait before joining the Scout teaching moment');
  assert.ok(readInitialCooldown(regularScarab) >= 1.6, 'The next regular Scarab should not immediately stack on the Scout teaching moment');

  assert.ok(readAuthoredX(upperScarab) <= readAuthoredX(sealWarden) - 100, 'Upper Route Scarab should sit outside the Warden smoke pocket');
  assert.ok(readAuthoredX(ledgeWisp, 'patrolMax') <= readAuthoredX(sealWarden, 'patrolMin') - 60, 'Ledge Sand Wisp should not overlap the Warden patrol pocket');
  assert.ok(readAuthoredX(warningScorpion, 'patrolMin') >= readAuthoredX(sealWarden, 'patrolMax') + 80, 'Stone Scorpion should wait beyond the Warden patrol pocket');
  assert.ok(readAuthoredX(sandSnake, 'patrolMin') >= readAuthoredX(warningScorpion, 'patrolMax') + 40, 'Sand Snake should stay beyond the follow-up scorpion instead of stacking into the Warden lesson');
  [ledgeWisp, upperScarab, warningScorpion, sandSnake].forEach((row) => {
    assert.ok(readInitialCooldown(row) >= 1.8, `${row.match(/id:\s*'([^']+)'/)?.[1]} should delay its first attack near the Warden teaching pocket`);
  });

  assert.match(scarabScout, /attackPatternTuning:\s*\{[\s\S]*?label:\s*'Scout Charge'[\s\S]*?windup:\s*0\.72[\s\S]*?duration:\s*0\.24[\s\S]*?recovery:\s*0\.82[\s\S]*?vulnerableAfter:\s*0\.9/);
  assert.match(sealWarden, /attackPatternTuning:\s*\{[\s\S]*?label:\s*'Guarded Sting'[\s\S]*?windup:\s*0\.82[\s\S]*?duration:\s*0\.32[\s\S]*?recovery:\s*0\.9[\s\S]*?vulnerableAfter:\s*0\.98[\s\S]*?shieldDuringWindup:\s*true[\s\S]*?protectedDuringWindup:\s*true/);
});

test('jump contact only bounces enemies while attacks defeat them in three to five hits', () => {
  assert.match(journeyComponentSource, /const applyEnemyStomp = \(enemy\) => \{/);
  assert.doesNotMatch(journeyComponentSource, /const applyEnemyStomp = \(enemy\) => \{[\s\S]*?text:\s*'BOUNCE'/);
  assert.match(journeyComponentSource, /current\.notice = `\$\{enemy\.name\} bounced away\. Use J or K to defeat it\.`/);
  assert.doesNotMatch(journeyComponentSource, /const applyEnemyStomp = \(enemy\) => \{[\s\S]*?enemy\.health -= 1[\s\S]*?\};/);
  assert.doesNotMatch(journeyComponentSource, /const applyEnemyStomp = \(enemy\) => \{[\s\S]*?current\.defeatedEnemies\.add\(enemy\.id\)[\s\S]*?\};/);
  assert.match(journeyComponentSource, /if \(attackRect && !current\.attackHitIds\.has\(e\.id\) && rectsOverlap\(attackRect, getAttackHurtbox\(e\)\)\) \{[\s\S]*?e\.health -= 1/);
  assert.match(journeyUtilsSource, /if\s*\(enemy\.firstSealRouteRamp\)\s*return Math\.max\(3, enemy\.health\)/);
  assert.match(journeyUtilsSource, /return clamp\(Math\.max\(enemy\.health \+ bonus, Math\.ceil\(enemy\.health \* 1\.55\)\), 3, 5\)/);
});
