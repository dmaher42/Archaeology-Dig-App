import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  DYNAMIC_WORLD_EFFECT_REGIONS,
  DYNAMIC_WORLD_EFFECTS_SRC,
  DYNAMIC_WORLD_EFFECTS_VERSION,
  usesPaintedDynamicWorldEffect,
} from './journeyDynamicWorldAssets.js';

const source = readFileSync(new URL('./journeyLevelData.js', import.meta.url), 'utf8');
const journeyUtilsSource = readFileSync(new URL('./journeyUtils.js', import.meta.url), 'utf8');
const journeyConstantsSource = readFileSync(new URL('./journeyConstants.js', import.meta.url), 'utf8');
const journeyEnemySpritesSource = readFileSync(new URL('./journeyEnemySprites.js', import.meta.url), 'utf8');
const journeyBossSpritesSource = readFileSync(new URL('./journeyBossSprites.js', import.meta.url), 'utf8');
const journeyMarkerSpritesSource = readFileSync(new URL('./journeyMarkerSprites.js', import.meta.url), 'utf8');
const journeyRenderAssetsSource = readFileSync(new URL('./journeyRenderAssets.js', import.meta.url), 'utf8');
const expeditionStagesSource = readFileSync(new URL('../expedition/expeditionStages.js', import.meta.url), 'utf8');
const devToolsSource = readFileSync(new URL('../DevTools.jsx', import.meta.url), 'utf8');
const expeditionModeSource = readFileSync(new URL('../ExpeditionMode.jsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../../App.jsx', import.meta.url), 'utf8');
const journeyComponentSource = readFileSync(new URL('../ExpeditionJourney.jsx', import.meta.url), 'utf8');
const egyptPlayerAtlas = JSON.parse(
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
const anubisBossAtlas = JSON.parse(
  readFileSync(new URL('../../../public/assets/expedition/bosses/anubis-sprites.json', import.meta.url), 'utf8'),
);
const egyptOpeningTrapDecalsPath = new URL('../../../public/assets/expedition/environment/egypt-opening/opening-trap-decals.png', import.meta.url);
const egyptOpeningHazardDecalsPath = new URL('../../../public/assets/expedition/environment/egypt-opening/opening-hazard-decals.png', import.meta.url);
const egyptOpeningTombStairwellPath = new URL('../../../public/assets/expedition/environment/egypt-opening/opening-tomb-stairwell.png', import.meta.url);
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
  assert.match(stageEntranceFeatures, /width:\s*1260/);
  assert.match(stageEntranceFeatures, /height:\s*630/);
  assert.match(stageEntranceFeatures, /focusDistance:\s*560/);
  assert.match(journeyComponentSource, /STAGE_ENTRANCE_DOORWAY_SRC = 'assets\/expedition\/environment\/stage-entrances\/egypt-tomb-doorway-transition\.png'/);
  assert.match(journeyComponentSource, /STAGE_ENTRANCE_DOORWAY_VERSION = 'imagegen-egypt-tomb-doorway-transition-2026-05-20'/);
  assert.match(journeyComponentSource, /stageEntranceDoorwayRef/);
  assert.match(journeyComponentSource, /ctx\.drawImage\(doorwayAsset\.image/);
  assert.match(journeyComponentSource, /mode:\s*'stage-entrance'/);
  assert.match(journeyComponentSource, /nearbyStageEntrance\.x - CANVAS_WIDTH \* 0\.5/);
  assert.match(journeyComponentSource, /drawStageEntranceFeature/);
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
  assert.match(storyProps, /opening-footprint-trail/);
  assert.match(storyProps, /opening-threshold-offering/);
  assert.doesNotMatch(storyProps, /upper-route-broken-stone-cue/);
  assert.doesNotMatch(storyProps, /distant-ruins/);
  assert.doesNotMatch(storyProps, /atmosphere-entry-distant-rubble/);
  assert.doesNotMatch(storyProps, /atmosphere-entry-far-door-frame/);
  assert.match(storyProps, /abandoned-camp/);
  assert.match(storyProps, /type:\s*'cart'/);
  assert.match(storyProps, /broken supply cart/);
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
  assert.match(storyProps, /id:\s*'opening-sacred-threshold-guardian'/);
  assert.match(storyProps, /sacred guardian threshold before Temple Approach Seal/);
  ['camp', 'ceremonial-offering', 'sacred-pedestal'].forEach((type) => {
    assert.match(storyProps, new RegExp(`type:\\s*'${type}'`));
  });

  assert.match(events, /id:\s*'opening-archaeologist-arrival'/);
  assert.match(events, /The archaeologist reaches the sealed site\./);
  assert.match(events, /id:\s*'opening-guardian-challenge'/);
  assert.match(events, /This is a protected place\. Move with care and earn the right to pass\./);
  assert.match(events, /id:\s*'opening-warrior-guide-entry'/);
  assert.match(events, /I will guide you\. Gather shards, recover tools, and treat the ancient site with respect\./);
  assert.match(events, /id:\s*'opening-guide-careful-tools'/);
  assert.match(events, /Good\. Evidence and tools open the path - not force\./);
  assert.match(events, /id:\s*'opening-sacred-threshold-watch'/);
  assert.match(events, /The guardian watches\. Prove you can move with care\./);
  assert.match(events, /card:\s*false/);
  assert.match(journeyComponentSource, /current\.cameraShakeTimer = ev\.duration \* 0\.4;/);
  assert.match(journeyComponentSource, /current\.cameraShakeStrength = ev\.shake;/);
  assert.match(journeyComponentSource, /cameraShakeActive: current\.cameraShakeTimer > 0/);

  assert.match(routeGates, /id:\s*'temple-approach-seal'[\s\S]*?requires:\s*\{\s*shards:\s*4/);
  assert.match(routeGates, /Collect relic shards with care to earn passage through the first temple approach\./);
  assert.match(routeGates, /id:\s*'guardian-prep-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry',\s*shards:\s*6/);
  assert.match(routeGates, /Recover the Map Tablet and 6 relic shards before waking the guardian\. Do not force the site open\./);
  assert.match(routeGates, /id:\s*'desert-seal'[\s\S]*?requires:\s*\{\s*objective:\s*'desert-entry',\s*miniBoss:\s*'scarab-queen',\s*keyItem:\s*'brush-handle',\s*shards:\s*10/);
  assert.match(routeGates, /Recover evidence, shards, and the Brush Handle to earn passage into the ruined temple\./);
  assert.match(routeGates, /Record what you found, then move into the ruined temple entry\./);
  assert.match(miniBosses, /id:\s*'scarab-queen'[\s\S]*?health:\s*1,\s*damage:\s*4/);
  assert.match(miniBosses, /The Scarab Queen rises from the sand\. Anubis has set the first trial\./);
  assert.match(bossKeyItems, /id:\s*'brush-handle'[\s\S]*?You passed the first guardian test\. Record what you found before moving deeper\. Desert Map Seal is open\./);
  assert.match(journeyComponentSource, /const GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED = false;/);
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
    'The Scarab Queen rises from the sand. Anubis has set the first trial.',
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
  assert.match(source, /bossId:\s*'scarab-queen'/);
  assert.match(source, /x:\s*925/);
  assert.match(source, /y:\s*JY\(-117\)/);
  assert.match(source, /width:\s*160/);
  assert.match(source, /height:\s*90/);
  assert.match(source, /So\.\.\./);
  assert.match(source, /Another seeker reaches the gate\./);
  assert.match(source, /I'm not here for treasure\./);
  assert.match(source, /They all said that\./);
  assert.match(source, /This isn't the real relic\./);
  assert.match(source, /\.\.\.few recognize the decoy\./);
  assert.match(source, /The ruins remember every careless step\./);
  assert.match(source, /eventName:\s*'Anubis'/);
  assert.doesNotMatch(source.slice(source.indexOf('export const SCARAB_SEAL_TRIGGER = {'), source.indexOf('export const HAZARDS = [')), /The Sphinx has sent its first guardian/);
  assert.match(source, /stairwellRevealLine:\s*'A hidden stairwell opens beneath the ruins\.'/);
  assert.match(platforms, /invisible marked lower pyramid ledge/i);
  assert.match(platforms, /invisible marked first pyramid terrace/i);
  assert.match(platforms, /invisible marked second pyramid terrace/i);
  assert.match(platforms, /invisible marked scarab artefact platform/i);
  assert.match(platforms, /id:\s*'opening-scarab-seal-summit'/);
  assert.match(platforms, /x:\s*258[\s\S]*?invisible marked lower pyramid ledge/);
  assert.doesNotMatch(platforms, /invisible lower pyramid stair ledge/i);
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
  assert.match(journeyComponentSource, /OPENING_THRESHOLD_SCENE_DURATION = 46/);
  assert.match(journeyComponentSource, /OPENING_THRESHOLD_FADE_SECONDS = 2/);
  assert.match(journeyComponentSource, /OPENING_THRESHOLD_STAIR_REVEAL_SECONDS = 13\.5/);
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
  assert.match(journeyComponentSource, /current\.openingSphinxEncounter = \{/);
  assert.match(journeyComponentSource, /const OPENING_SPHINX_DURATION = 46;/);
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
  assert.match(appSource, /opening-deep-rumble\.ogg/);
  assert.match(appSource, /opening-earth-shake\.flac/);
  assert.match(journeyComponentSource, /1\.6,\s*4\.2,\s*7\.3,\s*9\.9,\s*12\.8/);
  assert.match(journeyComponentSource, /40\.0,\s*42\.2,\s*43\.8/);
  assert.match(journeyComponentSource, /message:\s*SCARAB_SEAL_TRIGGER\.messages\.join\(' '\)/);
  assert.match(journeyComponentSource, /lines:\s*SCARAB_SEAL_TRIGGER\.messages/);
  assert.match(journeyComponentSource, /visibleLineCount/);
  assert.match(journeyComponentSource, /dynamicEnvironmentEvent[\s\S]*?message:\s*''/);
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
      { x: 258, y: 318, width: 162 },
      { x: 402, y: 166, width: 420 },
      { x: 594, y: 36, width: 390 },
      { x: 760, y: -101, width: 330 },
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

test('opening pyramid zone only contains the intentional first-screen stairway platforms', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const allowedOpeningLabels = new Set([
    'desert track',
    'invisible marked lower pyramid ledge',
    'invisible marked first pyramid terrace',
    'invisible marked second pyramid terrace',
    'invisible marked scarab artefact platform',
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

test('Egypt opening ambient life stays in the existing Journey renderer', () => {
  assert.match(journeyComponentSource, /drawEgyptAmbientLife/);
  assert.match(journeyComponentSource, /drawDistantExpeditionWorker/);
  assert.match(journeyComponentSource, /drawKneelingSurveyor/);
  assert.match(journeyComponentSource, /drawTentFlap/);
  assert.match(journeyComponentSource, /drawRopedDigActivity/);
  assert.match(journeyComponentSource, /desert-survey-camp-life/);
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
  assert.match(journeyConstantsSource, /asha-hooded-warrior-explorer-spritesheet\.json/);
  assert.match(journeyConstantsSource, /PLAYER_HERO_FALLBACK_SPRITE_ATLAS_JSON/);
  assert.match(journeyConstantsSource, /egypt-warrior-guide-spritesheet\.json/);
  assert.match(journeyComponentSource, /characterId:\s*'asha-egypt-warrior-explorer'/);
  assert.match(journeyComponentSource, /atlasPath:\s*PLAYER_HERO_SPRITE_ATLAS_JSON/);
  assert.match(journeyComponentSource, /version:\s*PLAYER_HERO_SPRITE_VERSION/);
  assert.match(journeyComponentSource, /fallbackAtlasPath:\s*PLAYER_HERO_FALLBACK_SPRITE_ATLAS_JSON/);
  assert.match(journeyComponentSource, /fallbackCharacterId:\s*'egypt-warrior-guide'/);
  assert.match(journeyComponentSource, /fallbackSrc:\s*PLAYER_LEGACY_SPRITE_SRC/);
  assert.match(journeyComponentSource, /if\s*\(!atlasPath\)\s*\{\s*loadLegacySprite\(\);/);
  assert.equal(egyptPlayerAtlas.draw.suppressExternalWeapon, true);
  assert.equal(egyptPlayerAtlas.draw.suppressRuntimeAttackArc, true);
  assert.equal(egyptPlayerAtlas.status, 'active-egypt-hooded-warrior-explorer-atlas-production-ready');
  assert.equal(egyptPlayerAtlas.productionReference, 'asha-hooded-warrior-explorer-reference.png');
  assert.equal(egyptPlayerAtlas.draw.height, 107);
  assert.equal(egyptPlayerAtlas.draw.sourceHeight, 224);
  assert.equal(egyptPlayerAtlas.frame.width, 256);
  assert.equal(egyptPlayerAtlas.frame.height, 256);
  assert.equal(
    egyptPlayerAtlas.source,
    'controlled-hybrid-production-asha-atlas-2026-05-20',
  );
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'idle')?.frameCount, 1);
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'walk')?.frameCount, 8);
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'run')?.frameCount, 8);
  assert.equal(egyptPlayerAtlas.rows.find(row => row.name === 'survey_walk')?.frameCount, 8);
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'walk')?.frames,
    Array.from({ length: 8 }, (_, index) => `walk_${String(index).padStart(2, '0')}`),
  );
  assert.deepEqual(
    egyptPlayerAtlas.rows.find(row => row.name === 'run')?.frames,
    Array.from({ length: 8 }, (_, index) => `run_${String(index).padStart(2, '0')}`),
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
  assert.equal(egyptPlayerAtlas.poseSources.run_00, 'production_sprint_source_col_0');
  assert.equal(egyptPlayerAtlas.poseSources.run_03, 'production_sprint_source_col_3');
  assert.equal(egyptPlayerAtlas.poseSources.walk_03, 'production_locomotion_source_row_0_col_3');
  assert.equal(egyptPlayerAtlas.poseSources.attack_pick_swing_00, 'attack_source_col_0');
  assert.equal(egyptPlayerAtlas.poseSources.attack_pick_swing_03, 'attack_source_col_3');
  assert.equal(egyptPlayerAtlas.poseSources.attack_pick_swing_07, 'attack_source_col_7');
  assert.equal(egyptPlayerAtlas.poseSources.jump_04, 'production_air_source_row_0_col_4');
  assert.equal(egyptPlayerAtlas.poseSources.fall_04, 'production_air_source_row_0_col_7');
  assert.equal(egyptPlayerAtlas.poseSources.land_02, 'production_air_source_row_1_col_2');
  assert.equal(egyptPlayerAtlas.rows.length, 12);
  assert.equal(Object.keys(egyptPlayerAtlas.regions).length, 96);
  assert.equal(Object.keys(egyptPlayerAtlas.poseSources).length, 96);
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
  assert.match(journeyComponentSource, /rowName === 'idle'\s*\?\s*0/);
  assert.match(journeyComponentSource, /firstSwingFrame/);
  assert.match(journeyComponentSource, /lastSwingFrame/);
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
  assert.match(source, /id:\s*'map-tablet'[\s\S]*?x:\s*X\(610\)/);
  assert.match(source, /id:\s*'opening-seal-reset-trap'[\s\S]*?x:\s*X\(250\)[\s\S]*?width:\s*87[\s\S]*?height:\s*16/);
  assert.doesNotMatch(source, /id:\s*'opening-spike-floor-trap'/);
  assert.doesNotMatch(source, /id:\s*'warrior-mummy-start-1'/);
  assert.doesNotMatch(source, /id:\s*'warrior-mummy-dune-1'/);
  assert.doesNotMatch(source, /id:\s*'warrior-mummy-ridge-1'/);
  assert.match(source, /id:\s*'scarab-scout-1'[\s\S]*?protectsRouteId:\s*'temple-approach-seal'/);
  assert.match(source, /protectsRouteId:\s*'desert-opening-shard-cache'/);
  assert.match(source, /protectsRouteId:\s*'desert-opening-map-tablet'/);
  assert.match(journeyComponentSource, /getActiveShardGateProgress/);
  assert.match(journeyComponentSource, /Relic Shard/);
  assert.match(journeyComponentSource, /Enemy dropped/);
  assert.match(journeyComponentSource, /ENEMY_TYPE_STAKE_MESSAGES/);
  assert.match(journeyComponentSource, /seenEnemyTypeNoticeIds/);
  assert.match(journeyComponentSource, /gateRequirementLabel/);
  assert.match(journeyComponentSource, /journey-floating-hud-gate/);
  assert.match(journeyComponentSource, /journey-collectible-shard-atlas-upgrade-2026-05-21/);
  assert.match(journeyComponentSource, /relicShard:\s*\{[\s\S]*?ringSize:\s*Math\.round\(54 \* PICKUP_GLOW_SCALE\)/);
  assert.match(journeyComponentSource, /key:\s*'relicShard'[\s\S]*?ringKey:\s*'availableGlowRing'/);
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

  assert.match(storyProps, /id:\s*'guardian-seal-pedestal-passive'[\s\S]*?sectionId:\s*'dig-site-entrance'[\s\S]*?type:\s*'sacred-pedestal'[\s\S]*?x:\s*X\(7330\)[\s\S]*?y:\s*JY\(306\)/);
  assert.match(storyProps, /id:\s*'guardian-seal-passive'[\s\S]*?sectionId:\s*'dig-site-entrance'[\s\S]*?type:\s*'guardian-seal'[\s\S]*?x:\s*X\(7330\)[\s\S]*?y:\s*JY\(286\)/);
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
  assert.match(source, /id:\s*'relic-shard-purpose-note'/);
  assert.match(source, /Relic shards unlock seals and fund Base Camp upgrades\. Collect them from ruins and enemies\./);
  assert.match(source, /id:\s*'basecamp-upgrade-voucher'[\s\S]*?shardCost:\s*2[\s\S]*?rewardShards:\s*6[\s\S]*?cacheReward:\s*true/);
  assert.match(source, /id:\s*'early-voucher-cache-marker'/);
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
  assert.match(shards, /\{\s*x:\s*1245,\s*y:\s*320\s*\}/);
  assert.doesNotMatch(storyProps, /broken-ruins-route-stones/);
  assert.match(storyProps, /Broken Ruins Route trail marker/);
  assert.match(storyProps, /survey rope beside half-buried structure/);
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

test('Temple Threshold Climb teaches the first switch route with fair existing systems', () => {
  const platforms = extractExportedArray('PLATFORMS');
  const hazards = extractExportedArray('HAZARDS');
  const shards = source.slice(source.indexOf('const RELIC_SHARD_LAYOUT = ['), source.indexOf('export const RELIC_SHARDS'));
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');
  const markers = extractExportedArray('OBJECTIVE_MARKERS');

  [
    'temple threshold safe plinth',
    'temple plinth',
    'switch teaching plinth',
  ].forEach((label) => {
    assert.match(platforms, new RegExp(label));
  });
  assert.match(hazards, /temple-threshold-hairline-crack/);
  assert.match(hazards, /penalty:\s*\{\s*time:\s*3\s*\}/);
  assert.match(hazards, /A hairline crack warned the team to step carefully\./);
  [
    /\{\s*x:\s*1548,\s*y:\s*306\s*\}/,
    /\{\s*x:\s*1638,\s*y:\s*274\s*\}/,
    /\{\s*x:\s*1748,\s*y:\s*294\s*\}/,
  ].forEach((rewardPoint) => {
    assert.match(shards, rewardPoint);
  });
  assert.match(storyProps, /temple-threshold-switch-trail/);
  assert.match(storyProps, /fine crack warning marks/);
  assert.match(events, /id:\s*'temple-threshold-climb'/);
  assert.match(events, /Relic shards mark the way toward the first switch\./);
  assert.match(markers, /id:\s*'switch-1'/);
  assert.match(markers, /x:\s*X\(1765\)/);
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

test('first mini-boss is gated by preparation and rewards the next route', () => {
  const routeGates = extractExportedArray('ROUTE_GATES');
  const storyProps = extractExportedArray('STORY_PROPS');
  const events = extractExportedArray('ENVIRONMENT_EVENTS');

  assert.match(routeGates, /id:\s*'guardian-prep-seal'/);
  assert.match(routeGates, /name:\s*'Guardian Prep Seal'/);
  assert.match(routeGates, /x:\s*X\(1018\)/);
  assert.match(routeGates, /requires:\s*\{\s*objective:\s*'desert-entry',\s*shards:\s*6/);
  assert.match(routeGates, /id:\s*'guardian-prep-seal'[\s\S]*?id:\s*'desert-seal'/);
  assert.match(routeGates, /readyHint:\s*'Desert Map Seal is open\. Record what you found, then move into the ruined temple entry\.'/);
  assert.match(source, /routeOpenMessage:\s*'You passed the first guardian test\. Record what you found before moving deeper\. Desert Map Seal is open\.'/);
  assert.match(source, /id:\s*'scarab-queen'[\s\S]*?arenaStart:\s*X\(1265\)/);
  assert.match(source, /id:\s*'scarab-queen'[\s\S]*?name:\s*'Scarab Queen'/);
  assert.match(storyProps, /Guardian Prep Seal: needs Map Tablet and 6 relic shards/);
  assert.match(events, /Guardian Seal: recover the Map Tablet and 6 relic shards before the Scarab Queen\./);
  assert.match(journeyComponentSource, /Collect the tool piece, then return to \$\{routeGateName \|\| 'the route gate'\}/);
  assert.match(journeyComponentSource, /current\.notice = `\$\{b\.name\} defeated\. \$\{rewardMoment\.title\} \$\{rewardMoment\.nextObjective\}`/);
  assert.match(journeyComponentSource, /current\.notice = `\$\{rewardMoment\.title\} \$\{rewardMoment\.nextObjective\}`/);
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
    'post-pyramid-guardian-prep-route',
    'temple-sandfall-climb',
    'catacomb-torch-climb',
    'final-site-permit-climb',
  ].forEach((challengeId) => {
    assert.match(platforms, new RegExp(`challengeId:\\s*'${challengeId}'|challengeComplete:\\s*'${challengeId}'`));
  });

  [
    'post-pyramid survey plinth',
    'field kit stepping stone',
    'guardian prep cracked ledge',
    'guardian prep safe marker',
    'collapsing column step',
    'sandfall recovery shelf',
    'archive reward step',
    'torch safe ledge',
    'bat dodge perch',
    'survey rope ledge',
  ].forEach((label) => {
    assert.match(platforms, new RegExp(label));
  });
  assert.match(platforms, /guardian-prep-cracked-ledge[\s\S]*reactive:\s*\{\s*type:\s*'unstable ledge'/);
  assert.match(platforms, /guardian-prep-safe-marker[\s\S]*challengeComplete:\s*'post-pyramid-guardian-prep-route'/);

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
  assert.match(journeyComponentSource, /const drawEnemyAttackTell = useCallback\(\(\) => \{\}, \[\]\)/);
  assert.match(journeyComponentSource, /const drawAttackArc = useCallback\(\(\) => \{\}, \[\]\)/);

  assert.match(upgrades, /id:\s*'basecamp-upgrade-voucher'[\s\S]*?x:\s*X\(925\)[\s\S]*?y:\s*JY\(320\)/);
  assert.match(upgrades, /id:\s*'reinforced-boots'[\s\S]*?x:\s*X\(1310\)[\s\S]*?y:\s*JY\(270\)/);
  assert.match(upgrades, /id:\s*'rope-launcher'[\s\S]*?x:\s*X\(2075\)[\s\S]*?y:\s*JY\(210\)/);
  assert.match(upgrades, /id:\s*'torch-upgrade'[\s\S]*?x:\s*X\(3545\)[\s\S]*?y:\s*JY\(252\)/);
  assert.match(upgrades, /id:\s*'ancient-compass'[\s\S]*?x:\s*X\(7045\)[\s\S]*?y:\s*JY\(220\)/);
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
    'damaged field equipment',
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
  assert.match(source, /Return to Base Camp to prepare the excavation\./);
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
  assert.match(egyptAtmosphereAtlas.source, /Gemini Assets curated atmosphere pass 2026-05-21/);
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
    'desert-entry-survey-chest-1',
    'scarab-seal-warning-glyph-1',
    'temple-approach-threshold-tablet-1',
    'temple-approach-obelisk-fragment-1',
    'ruined-temple-fallen-column-1',
    'catacomb-warning-urns-1',
    'escape-cracked-pillar-1',
    'dig-site-survey-grid-cache-1',
  ].forEach((propId) => {
    assert.match(storyProps, new RegExp(`id:\\s*'${propId}'`), `${propId} should be placed through STORY_PROPS`);
  });

  const atmospherePropMatches = [...storyProps.matchAll(/type:\s*'atmosphere-prop'/g)];
  assert.ok(atmospherePropMatches.length >= 38, 'atmosphere pass should add coherent non-colliding prop clusters');
  assert.doesNotMatch(storyProps, /id:\s*'(atmosphere-entry-coin-offering|scarab-seal-broken-offering-2|atmosphere-dig-coin-offering|ruined-temple-offering-table-1|catacomb-marker-flag-cache-1)'/);
  assert.doesNotMatch(storyProps, /type:\s*'atmosphere-prop'[\s\S]{0,220}damage:/);
  assert.doesNotMatch(storyProps, /type:\s*'atmosphere-prop'[\s\S]{0,220}collectible:/);
  assert.doesNotMatch(storyProps, /type:\s*'atmosphere-prop'[\s\S]{0,220}requiresObjective:/);
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
  assert.match(journeyComponentSource, /return 'grounded'/);
  assert.match(journeyComponentSource, /drawStoryProp\(ctx, prop, cameraX, now, 'grounded'\)/);
  assert.match(journeyComponentSource, /Math\.max\(rawAnchorY, GROUND_Y - ATMOSPHERE_GROUND_LOCK_MARGIN\)/);
  assert.match(journeyComponentSource, /groundLockedAtmospherePropCount/);
  assert.match(journeyComponentSource, /atmosphereGroundingMode:\s*'ground-locked-floor-assets'/);
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
  assert.match(allEnemies, /upper-route pressure/);
  assert.match(allEnemies, /watchtower pressure/);
  assert.match(allEnemies, /collapsing-bridge pressure/);
  assert.match(journeyUtilsSource, /scarab:\s*2/);
  assert.match(journeyUtilsSource, /looter:\s*3/);
  assert.match(journeyUtilsSource, /return clamp\(Math\.max\(enemy\.health \+ bonus, Math\.ceil\(enemy\.health \* 1\.55\)\), 3, 5\)/);
  assert.match(journeyUtilsSource, /Math\.ceil\(enemy\.health \* 1\.55\)/);
  assert.match(journeyUtilsSource, /enemy\.openingRouteRamp\s*\?\s*Math\.max\(enemy\.damage \+ 1, Math\.ceil\(enemy\.damage \* 1\.25\)\)/);
  assert.match(journeyUtilsSource, /Math\.ceil\(enemy\.damage \* 1\.45\)/);
  assert.match(journeyUtilsSource, /baseSpeed: entity\.speed \* \(entity\.openingRouteRamp \? 1\.12 : 1\.18\)/);
  assert.match(journeyComponentSource, /const ENEMY_TACTICAL_PRESSURE = \{/);
  assert.match(journeyComponentSource, /awarenessMultiplier/);
  assert.match(journeyComponentSource, /chaseMultiplier/);
  assert.match(journeyComponentSource, /shieldDuringWindup: basePattern\.shieldDuringWindup \|\| Boolean\(pressure\.shieldDuringWindup\)/);
  assert.match(journeyComponentSource, /if \(isPressingPlayer\) \{[\s\S]*?e\.direction = distanceToPlayer >= 0 \? 1 : -1;/);
});

test('Egypt opening combat ramps gently before the first route seal', () => {
  const egyptEnemies = extractExportedArray('ENEMIES');
  const openingRows = egyptEnemies
    .split('\n')
    .filter(row => /x:\s*X\((\d+)\)/.test(row))
    .filter((row) => Number(row.match(/x:\s*X\((\d+)\)/)?.[1] || 0) < 1480);

  const teachingRows = openingRows
    .filter((row) => Number(row.match(/x:\s*X\((\d+)\)/)?.[1] || 0) <= 705);
  const totalOpeningHealth = openingRows
    .reduce((total, row) => total + Number(row.match(/health:\s*(\d+)/)?.[1] || 0), 0);
  const totalOpeningDamage = openingRows
    .reduce((total, row) => total + Number(row.match(/damage:\s*(\d+)/)?.[1] || 0), 0);
  const highDamageOpeningRows = openingRows
    .filter((row) => Number(row.match(/damage:\s*(\d+)/)?.[1] || 0) > 8);

  assert.ok(teachingRows.length >= 4, 'opening route should teach smaller creature reads after the low trap replacement');
  assert.match(source, /id:\s*'opening-seal-reset-trap'[\s\S]*?penalty:\s*\{\s*stamina:\s*8\s*\}/);
  assert.equal(
    openingRows.every(row => /openingRouteRamp:\s*true/.test(row)),
    true,
    'Egypt enemies before the first seal should opt into the opening-route safety tuning',
  );
  assert.match(journeyUtilsSource, /if\s*\(enemy\.openingRouteRamp\)\s*return Math\.max\(3, enemy\.health\)/);
  assert.match(journeyUtilsSource, /enemy\.openingRouteRamp\s*\?\s*Math\.max\(enemy\.damage \+ 1, Math\.ceil\(enemy\.damage \* 1\.25\)\)/);
  assert.equal(
    teachingRows.every(row => Number(row.match(/health:\s*(\d+)/)?.[1] || 0) <= 2 && Number(row.match(/damage:\s*(\d+)/)?.[1] || 0) <= 5),
    true,
    'first teaching enemies should keep low authored damage while runtime tuning lifts them to three-hit fights',
  );
  assert.ok(totalOpeningHealth <= 24, 'first seal should not require too many regular enemy hits before the guardian');
  assert.ok(totalOpeningDamage <= 64, 'opening regular enemy damage budget should leave room for early-route mistakes');
  assert.equal(highDamageOpeningRows.length, 0, 'opening route should avoid high-damage regular enemies before the first seal');

  const checkpoints = extractExportedArray('CHECKPOINTS');
  assert.match(checkpoints, /id:\s*'desert-survey-marker'/);
  assert.match(checkpoints, /x:\s*X\(930\)/);
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
  assert.match(journeyComponentSource, /const chaseSpeedMultiplier = isAggroChasing \? tacticalPattern\.chaseMultiplier \|\| 1\.65 : 1/);
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
  assert.match(journeyComponentSource, /spikeTrap:\s*\{\s*xPad:\s*12,\s*widthPad:\s*24,\s*height:\s*46/);
  assert.match(egyptEnemies, /id:\s*'scorpion-start-1'[\s\S]*?width:\s*44[\s\S]*?height:\s*30[\s\S]*?attackPatternTuning:\s*\{[\s\S]*?windup:\s*0\.66[\s\S]*?duration:\s*0\.34[\s\S]*?range:\s*26[\s\S]*?height:\s*62[\s\S]*?yOffset:\s*-38[\s\S]*?backReach:\s*42[\s\S]*?damageScale:\s*1\.5/);
  assert.match(egyptEnemies, /id:\s*'scorpion-pottery-1'[\s\S]*?name:\s*'Pottery Scorpion'[\s\S]*?type:\s*'scorpion'[\s\S]*?protectsRouteId:\s*'desert-opening-shard-cache'/);
  assert.match(egyptEnemies, /id:\s*'scorpion-seal-path-1'[\s\S]*?name:\s*'Seal Path Scorpion'[\s\S]*?type:\s*'scorpion'[\s\S]*?protectsRouteId:\s*'temple-approach-seal'/);
  assert.match(egyptEnemies, /id:\s*'scorpion-guardian-path-1'[\s\S]*?name:\s*'Guardian Path Scorpion'[\s\S]*?type:\s*'scorpion'[\s\S]*?x:\s*X\(1375\)/);
  assert.match(egyptEnemies, /id:\s*'sand-wisp-start-1'[\s\S]*?damage:\s*4[\s\S]*?attackPatternTuning:\s*\{[\s\S]*?vulnerableAfter:\s*0\.72/);
  assert.match(egyptEnemies, /id:\s*'snake-1'[\s\S]*?attackPatternTuning:\s*\{[\s\S]*?windup:\s*0\.68[\s\S]*?range:\s*48/);
  assert.match(journeyComponentSource, /Scarab charges\. Move or jump, then strike\./);
  assert.match(journeyComponentSource, /Scorpion tails block the path\. Defeat them before moving forward\./);
  assert.match(journeyComponentSource, /Warrior mummies guard the threshold\. Wait for the sweep, then counter\./);
  assert.match(journeyComponentSource, /Snake lunges from mid-range\. Watch the coil\./);
});

test('jump contact only bounces enemies while attacks defeat them in three to five hits', () => {
  assert.match(journeyComponentSource, /const applyEnemyStomp = \(enemy\) => \{/);
  assert.doesNotMatch(journeyComponentSource, /const applyEnemyStomp = \(enemy\) => \{[\s\S]*?text:\s*'BOUNCE'/);
  assert.match(journeyComponentSource, /current\.notice = `\$\{enemy\.name\} bounced away\. Use J or K to defeat it\.`/);
  assert.doesNotMatch(journeyComponentSource, /const applyEnemyStomp = \(enemy\) => \{[\s\S]*?enemy\.health -= 1[\s\S]*?\};/);
  assert.doesNotMatch(journeyComponentSource, /const applyEnemyStomp = \(enemy\) => \{[\s\S]*?current\.defeatedEnemies\.add\(enemy\.id\)[\s\S]*?\};/);
  assert.match(journeyComponentSource, /if \(attackRect && !current\.attackHitIds\.has\(e\.id\) && rectsOverlap\(attackRect, getAttackHurtbox\(e\)\)\) \{[\s\S]*?e\.health -= 1/);
  assert.match(journeyUtilsSource, /if\s*\(enemy\.openingRouteRamp\)\s*return Math\.max\(3, enemy\.health\)/);
  assert.match(journeyUtilsSource, /return clamp\(Math\.max\(enemy\.health \+ bonus, Math\.ceil\(enemy\.health \* 1\.55\)\), 3, 5\)/);
});
