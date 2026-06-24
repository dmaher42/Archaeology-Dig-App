import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  getMissingSectionBackgroundAssets,
} from '../journeyBackgroundAssets.js';
import {
  getMissingEnemySpriteAssets,
} from '../journeyEnemySprites.js';
import {
  getMissingBossSpriteAssets,
} from '../journeyBossSprites.js';
import {
  ENVIRONMENT_ASSET_PACK_IDS,
  EXPECTED_ROME_SECTION_ONE_ENVIRONMENT_KEYS,
  getEnvironmentAssetKeyForHazard,
  getEnvironmentAssetKeyForPlatform,
  getMissingEnvironmentAssets,
} from '../journeyRenderAssets.js';
import * as RomeData from '../romeJourneyData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../..');
const publicAsset = (...segments) => path.join(repoRoot, 'public', ...segments);

const readJson = async (...segments) => JSON.parse(await readFile(publicAsset(...segments), 'utf8'));
const assertPngAssetExists = (assetPath) => {
  assert.match(assetPath, /\.png$/);
  const fullPath = publicAsset(...assetPath.split('/'));
  assert.ok(existsSync(fullPath), `${assetPath} exists`);
  assert.ok(statSync(fullPath).size > 1024, `${assetPath} is not an empty placeholder file`);
};

const assertRegions = (atlas, expectedKeys) => {
  for (const key of expectedKeys) {
    const region = atlas.regions?.[key];
    assert.ok(region, `missing atlas region ${key}`);
    assert.ok(Number.isFinite(region.x), `${key} has x`);
    assert.ok(Number.isFinite(region.y), `${key} has y`);
    assert.ok(region.w > 0, `${key} has width`);
    assert.ok(region.h > 0, `${key} has height`);
    if (atlas.size?.w && atlas.size?.h) {
      assert.ok(region.x + region.w <= atlas.size.w, `${key} fits atlas width`);
      assert.ok(region.y + region.h <= atlas.size.h, `${key} fits atlas height`);
    }
  }
};

test('Rome section backgrounds are real PNG packs registered with the shared Journey background loader', async () => {
  const sections = [
    ['rome-via-sacra', 'rome-via-sacra-parallax-pack.json', ['viaSacraSky', 'farAqueductArches', 'distantHillSide', 'midgroundRoadRuins', 'foregroundDust']],
    ['rome-forum-ruins', 'rome-forum-ruins-parallax-pack.json', ['forumSky', 'farTempleColonnades', 'distantForumRuins', 'midgroundForumFloor', 'foregroundColumnDust']],
    ['rome-subterranean-thermae', 'rome-thermae-parallax-pack.json', ['thermaeDeepAtmosphere', 'farHypocaustPillars', 'distantBarrelVaults', 'midgroundSteamChannels', 'foregroundSteamMist']],
    ['rome-basilica-interior', 'rome-basilica-parallax-pack.json', ['basilicaSky', 'farApseWall', 'distantNaveColumns', 'midgroundMarbleFloor', 'foregroundColumnShadow']],
    ['rome-sealed-vault', 'rome-vault-parallax-pack.json', ['vaultDarkAtmosphere', 'farInscribedWalls', 'distantSealedArchways', 'midgroundVaultFloor', 'foregroundAshDrift']],
  ];

  for (const [folder, manifestName, expectedKeys] of sections) {
    const missingFromLoader = getMissingSectionBackgroundAssets({ packs: { [RomeData.ROME_SECTION_ID_BY_BACKGROUND_FOLDER[folder]]: { atlas: { regions: {} } } } }, RomeData.ROME_SECTION_ID_BY_BACKGROUND_FOLDER[folder]);
    assert.deepEqual(missingFromLoader.sort(), expectedKeys.sort(), `${folder} is registered with expected layer keys`);

    const atlas = await readJson('assets', 'expedition', 'backgrounds', folder, manifestName);
    assert.equal(typeof atlas.image, 'string');
    assert.ok(existsSync(publicAsset('assets', 'expedition', 'backgrounds', folder, atlas.image)), `${folder} PNG exists`);
    assertRegions(atlas, expectedKeys);
    if (folder === 'rome-via-sacra') {
      assert.match(atlas.source, /no-temple Roman street source/i);
      assert.ok(
        existsSync(publicAsset('assets', 'expedition', 'backgrounds', folder, 'rome-via-sacra-source-no-temple-2026-06-24.png')),
        'Via Sacra keeps its no-temple street source PNG',
      );
    }
  }
});

test('Rome enemy and boss sprite packs are real transparent PNG atlases known to the shared combat sprite loaders', async () => {
  const enemyPacks = [
    ['legionShade', 'rome-legion-shade-sprites.json', ['legionShadeIdle', 'legionShadeWalk1', 'legionShadeWalk2', 'legionShadeWalk3', 'legionShadeWindup', 'legionShadeAttack', 'legionShadeHit', 'legionShadeDefeated']],
    ['gladiatorRevenant', 'rome-gladiator-revenant-sprites.json', ['gladiatorRevenantIdle', 'gladiatorRevenantWalk1', 'gladiatorRevenantWalk2', 'gladiatorRevenantWalk3', 'gladiatorRevenantWindup', 'gladiatorRevenantAttack', 'gladiatorRevenantHit', 'gladiatorRevenantDefeated']],
    ['forumRat', 'rome-forum-rat-sprites.json', ['forumRatIdle', 'forumRatWalk1', 'forumRatWalk2', 'forumRatWalk3', 'forumRatWindup', 'forumRatAttack', 'forumRatHit', 'forumRatDefeated']],
    ['vestibuleWisp', 'rome-vestibule-wisp-sprites.json', ['vestibuleWispIdle', 'vestibuleWispWalk1', 'vestibuleWispWalk2', 'vestibuleWispWalk3', 'vestibuleWispWindup', 'vestibuleWispAttack', 'vestibuleWispHit', 'vestibuleWispDefeated']],
    ['marbleGolem', 'rome-marble-golem-sprites.json', ['marbleGolemIdle', 'marbleGolemWalk1', 'marbleGolemWalk2', 'marbleGolemWalk3', 'marbleGolemWindup', 'marbleGolemAttack', 'marbleGolemHit', 'marbleGolemDefeated']],
  ];

  for (const [packId, manifestName, expectedKeys] of enemyPacks) {
    const missingFromLoader = getMissingEnemySpriteAssets({ packs: { [packId]: { atlas: { regions: {} } } } });
    assert.deepEqual(missingFromLoader.sort(), expectedKeys.map(key => `${packId}:${key}`).sort(), `${packId} is registered with expected combat frames`);

    const atlas = await readJson('assets', 'expedition', 'enemies', 'rome', manifestName);
    assert.ok(existsSync(publicAsset('assets', 'expedition', 'enemies', 'rome', atlas.image)), `${packId} PNG exists`);
    assertRegions(atlas, expectedKeys);
  }

  const bossMissing = getMissingBossSpriteAssets({ packs: { 'rome-legate-revenant': { atlas: { regions: {} } } } });
  assert.ok(bossMissing.includes('rome-legate-revenant:legateRevenantIdle'));
  assert.ok(bossMissing.includes('rome-legate-revenant:legateRevenantDeath8'));

  const bossAtlas = await readJson('assets', 'expedition', 'bosses', 'rome', 'rome-legate-revenant-sprites.json');
  assert.ok(existsSync(publicAsset('assets', 'expedition', 'bosses', 'rome', bossAtlas.image)), 'Legate Revenant PNG exists');
  assert.ok(bossAtlas.regions.legateRevenantIdle);
  assert.ok(bossAtlas.regions.legateRevenantDeath8);
});

test('Rome Section One has a playable Forum-to-archive learning spine instead of generic shard collection only', () => {
  assert.equal(RomeData.ROME_SECTION_ONE_QUESTION, 'How did Rome change from a Republic into an Empire?');
  assert.deepEqual(
    RomeData.ROME_TIMELINE_SEQUENCE.map(item => item.id),
    ['republic-founded', 'caesar-dictator', 'augustus-emperor', 'empire-expands', 'empire-splits'],
  );
  assert.ok(RomeData.ROME_TIMELINE_SEQUENCE.every(item => item.shortText.length <= 96));
  assert.ok(RomeData.ROME_FORUM_ARCHIVE_ROOM?.entryX > 0);
  assert.ok(RomeData.ROME_FORUM_ARCHIVE_ROOM?.exitX > RomeData.ROME_FORUM_ARCHIVE_ROOM.entryX);
  assert.ok(RomeData.ROME_RELIC_SHARD_LAYOUT.every(shard => shard.spriteKey), 'every Rome evidence pickup has a PNG sprite key');
  assert.ok(RomeData.ROME_ROUTE_GATES.some(gate => gate.timelinePuzzleRequired), 'a Rome gate is locked by the timeline puzzle');
  assert.equal(RomeData.ROME_STAGE_ENTRANCE_FEATURES.length, 0, 'Rome does not send unsupported milestones through the Egypt doorway renderer');
});

test('Rome and China do not inherit Egypt-only rooms or Scarab runtime gates', async () => {
  const journeySource = await readFile(path.join(repoRoot, 'src', 'components', 'ExpeditionJourney.jsx'), 'utf8');
  const journeyUtilsSource = await readFile(path.join(repoRoot, 'src', 'components', 'expedition-journey', 'journeyUtils.js'), 'utf8');

  assert.match(journeySource, /const isEgyptJourney = !isChinaJourney && !isRomeJourney/);
  assert.match(journeySource, /EXTERIOR:\s*JOURNEY_EXTERIOR_SCENE_ID/);
  assert.match(journeyUtilsSource, /currentSceneId:\s*JOURNEY_EXTERIOR_SCENE_ID/);
  assert.match(journeySource, /loadEgyptOnlyPacks:\s*isEgyptJourney/);
  assert.match(journeySource, /const templeThresholdDoorwayActive = scopedJourneyAssetPacks\.isEgyptJourney/);
  assert.match(journeySource, /const mummificationChamberDoorwayActive = scopedJourneyAssetPacks\.isEgyptJourney/);
  assert.match(journeySource, /const forgottenMuralDoorwayActive = scopedJourneyAssetPacks\.isEgyptJourney/);
  assert.match(journeySource, /const scribeDoorwayActive = scopedJourneyAssetPacks\.isEgyptJourney/);
  assert.match(journeySource, /if \(!inInteriorChamberScene && scopedJourneyAssetPacks\.isEgyptJourney && !current\.scarabSealActivated\)/);
  assert.match(journeySource, /const shouldEchoOpeningFirstShard = scopedJourneyAssetPacks\.isEgyptJourney/);
  assert.match(journeySource, /const scarabSealRequired = scopedJourneyAssetPacks\.isEgyptJourney/);
  assert.match(journeySource, /const missingChinaEnemyGuardianSpriteAssets = scopedJourneyAssetPacks\.isChinaJourney/);
  assert.match(journeySource, /assetFallbackActive:[\s\S]*scopedBackgroundFallbackActive/);
  assert.doesNotMatch(journeySource, /backgroundPackId !== 'china-river-valley'/);
  assert.doesNotMatch(journeySource, /egypt-exterior-route/);
  assert.doesNotMatch(journeyUtilsSource, /egypt-exterior-route/);
});

test('Rome gameplay surfaces and route gates use Rome and China environment packs instead of Egypt gate art', async () => {
  const atlas = await readJson('assets', 'expedition', 'environment', 'rome-section-one', 'rome-section-one-environment-pack.json');
  assertPngAssetExists(`assets/expedition/environment/rome-section-one/${atlas.image}`);
  assertRegions(atlas, EXPECTED_ROME_SECTION_ONE_ENVIRONMENT_KEYS);
  assert.deepEqual(
    getMissingEnvironmentAssets({ atlas, expectedKeys: EXPECTED_ROME_SECTION_ONE_ENVIRONMENT_KEYS }),
    [],
    'Rome environment atlas has every required runtime surface key',
  );

  assert.equal(
    getEnvironmentAssetKeyForPlatform({ label: 'via sacra stone road', y: 595 }, 'via-sacra', ENVIRONMENT_ASSET_PACK_IDS.ROME_SECTION_ONE),
    'romanRoadGround',
  );
  assert.equal(
    getEnvironmentAssetKeyForPlatform({ label: 'fallen entablature slab', y: 345 }, 'forum-ruins', ENVIRONMENT_ASSET_PACK_IDS.ROME_SECTION_ONE),
    'romanEntablature',
  );
  assert.equal(
    getEnvironmentAssetKeyForHazard({ type: 'steamBurst', id: 'steam-burst-1' }, ENVIRONMENT_ASSET_PACK_IDS.ROME_SECTION_ONE),
    'romanSteamBurst',
  );

  const modeSource = await readFile(path.join(repoRoot, 'src', 'components', 'ExpeditionMode.jsx'), 'utf8');
  assert.match(modeSource, /journeyEnvironmentPackId:\s*'rome-section-one'/);
  assert.match(modeSource, /routeMusicCue:\s*'bamboo-forest'/);
  assert.match(modeSource, /routeMusicCue:\s*'romanRoad'/);

  const rendererSource = await readFile(path.join(repoRoot, 'src', 'components', 'expedition-journey', 'useJourneyRenderer.js'), 'utf8');
  assert.match(rendererSource, /isChinaGate[\s\S]*sealedTimberGate/);
  assert.match(rendererSource, /isRomeGate[\s\S]*romanSealedGate/);
  assert.match(rendererSource, /const atlasKey = complete \? 'routeDoor'/);
});

test('Rome player, weapon, props, evidence icons, and cinematic art are connected to real PNG assets', async () => {
  const playerAtlas = await readJson('assets', 'expedition', 'player', 'asha-rome-variant-spritesheet.json');
  assertPngAssetExists(`assets/expedition/player/${playerAtlas.image}`);
  assert.ok(playerAtlas.regions.idle_07, 'Rome Asha cutscene source frame exists');

  const weaponAtlas = await readJson('assets', 'expedition', 'player', 'gladius-weapon-pack.json');
  assertPngAssetExists(`assets/expedition/player/${weaponAtlas.image}`);
  assertRegions(weaponAtlas, ['gladiusIdle', 'gladiusWindup', 'gladiusSwing', 'gladiusReady']);

  const propAssetPaths = new Set(RomeData.ROME_SCENE_PROPS.map(prop => prop.assetPath));
  assert.ok(propAssetPaths.size >= 10, 'Rome scene has a production prop set');
  for (const assetPath of propAssetPaths) {
    assertPngAssetExists(assetPath);
  }

  const collectibleAtlas = await readJson('assets', 'expedition', 'collectibles', 'journey-collectibles-pack.json');
  assertPngAssetExists(`assets/expedition/collectibles/${collectibleAtlas.image}`);
  const evidenceSpriteKeys = new Set([
    ...RomeData.ROME_RELIC_SHARD_LAYOUT.map(shard => shard.spriteKey),
    ...RomeData.ROME_BOSS_KEY_ITEMS.map(key => key.spriteKey),
    'romeSandal',
    'romeGladiatorBrace',
    'romeLegionShield',
    'romeSenatorialRing',
    'romeTimelineSeal',
  ]);
  assertRegions(collectibleAtlas, evidenceSpriteKeys);

  [
    'assets/expedition/player/asha-rome-cutscene-2026-06-24.png',
    'assets/expedition/bosses/rome/rome-legate-revenant-cutscene-2026-06-24.png',
    'assets/expedition/environment/rome-section-one/rome-vault-sigil-cutscene-2026-06-24.png',
  ].forEach(assertPngAssetExists);

  const journeySource = await readFile(path.join(repoRoot, 'src', 'components', 'ExpeditionJourney.jsx'), 'utf8');
  assert.match(journeySource, /ROME_OPENING_BACKGROUND_SRC/);
  assert.match(journeySource, /ROME_OPENING_ASHA_CUTSCENE_SRC/);
  assert.match(journeySource, /ROME_OPENING_LEGATE_CUTSCENE_SRC/);
  assert.match(journeySource, /ROME_OPENING_VAULT_SIGIL_SRC/);
  assert.match(journeySource, /ROME_OPENING_ARRIVAL_NOTICE/);
  assert.match(journeySource, /isRomeOpeningCinematic/);
  assert.match(journeySource, /const ROME_GATE_HINTS = \{/);
  assert.match(journeySource, /Search the Via Sacra route and Forum-side platforms/);
  assert.match(journeySource, /const gateHints = isRomeJourney \? ROME_GATE_HINTS/);

  const hudOverlaySource = await readFile(path.join(repoRoot, 'src', 'components', 'expedition-journey', 'JourneyHudOverlays.jsx'), 'utf8');
  assert.match(hudOverlaySource, /Forum Breach/);
  assert.match(hudOverlaySource, /Push through the Via Sacra/);
  assert.match(hudOverlaySource, /Restore the Republic-to-Empire sequence/);
  assert.match(hudOverlaySource, /asha-rome-cutscene-2026-06-24\.png/);
});
