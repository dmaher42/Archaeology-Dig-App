import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  EXPECTED_CHINA_RIVER_VALLEY_BACKGROUND_KEYS,
  getMissingSectionBackgroundAssets,
} from './journeyBackgroundAssets.js';
import { expeditionJourneySource, indexCssSource, journeyRendererSource } from './journeySourceText.test-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
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
  }
};

test('China layered background pack is ready for the shared Journey background loader', async () => {
  const atlas = await readJson(
    'assets',
    'expedition',
    'backgrounds',
    'china-river-valley',
    'china-river-valley-parallax-pack.json',
  );

  assert.equal(atlas.runtimeMode, 'layered-parallax');
  assert.equal(atlas.image, 'china-bg-01-sky.png');
  assert.doesNotMatch(atlas.image, /layered-pack/, 'active gameplay background must not use the checkerboard-layered source image');
  assertPngAssetExists(`assets/expedition/backgrounds/china-river-valley/${atlas.image}`);
  assertRegions(atlas, EXPECTED_CHINA_RIVER_VALLEY_BACKGROUND_KEYS);
  assert.deepEqual(
    getMissingSectionBackgroundAssets({ packs: { 'china-river-valley': { atlas } } }, 'china-river-valley'),
    [],
    'China background readiness should match every layered-parallax manifest key',
  );
});

test('China background draw path receives active Journey pack ids', async () => {
  const journeySource = expeditionJourneySource;
  const rendererSource = journeyRendererSource;

  assert.match(journeySource, /useJourneyRenderer\(\{[\s\S]*backgroundPackId,[\s\S]*environmentPackId,/);
  assert.match(rendererSource, /const isChinaRiverValleyBackground = backgroundPackId === 'china-river-valley'[\s\S]*environmentPackId === ENVIRONMENT_ASSET_PACK_IDS\.CHINA_RIVER_VALLEY/);
});

test('China opening cinematic uses China route copy and real PNG assets instead of Egypt/Anubis defaults', async () => {
  const journeySource = expeditionJourneySource;
  const openingScenesSource = await readFile(path.join(repoRoot, 'src', 'components', 'expedition-journey', 'journeyOpeningScenes.js'), 'utf8');
  const cssSource = indexCssSource;

  assert.match(openingScenesSource, /export const CHINA_OPENING_CINEMATIC_LINES = \[/);
  assert.match(openingScenesSource, /Watchtower Sentry/);
  assert.match(openingScenesSource, /The river gate just locked behind me\./);
  assert.match(openingScenesSource, /export const CHINA_OPENING_ARRIVAL_NOTICE = 'The river gate shut behind me\. The watchtower has noticed\. The only path is through the valley\.'/);
  const chinaOpeningBlock = openingScenesSource.slice(
    openingScenesSource.indexOf('export const CHINA_OPENING_CINEMATIC_LINES'),
    openingScenesSource.indexOf('// Returns the correct opening cinematic lines'),
  );
  assert.doesNotMatch(chinaOpeningBlock, /Anubis|Duat|judgement|sphinx|scarab/i);

  const chinaOpeningAssets = {
    background: /const CHINA_OPENING_BACKGROUND_SRC = '([^']+)'/.exec(journeySource)?.[1],
    asha: /const CHINA_OPENING_ASHA_CUTSCENE_SRC = '([^']+)'/.exec(journeySource)?.[1],
    watchtower: /const CHINA_OPENING_WATCHTOWER_SRC = '([^']+)'/.exec(journeySource)?.[1],
    gate: /const CHINA_OPENING_GATE_SEAL_SRC = '([^']+)'/.exec(journeySource)?.[1],
  };
  for (const assetPath of Object.values(chinaOpeningAssets)) {
    assert.ok(assetPath, 'China opening asset path is declared');
    assertPngAssetExists(assetPath);
  }

  assert.match(journeySource, /const CHINA_OPENING_CINEMATIC_ID = 'asha-china-watchtower-opening-cinematic'/);
  assert.match(journeySource, /if \(!isRomeCinematic && !isChinaCinematic\) \{[\s\S]*'anubisPresenceStinger'/);
  assert.match(journeySource, /const isChinaOpeningCinematic = gameState\.openingCinematic\?\.id === CHINA_OPENING_CINEMATIC_ID/);
  assert.match(journeySource, /isChinaOpeningCinematic[\s\S]*CHINA_OPENING_BACKGROUND_SRC/);
  assert.match(journeySource, /isChinaOpeningCinematic[\s\S]*CHINA_OPENING_ASHA_CUTSCENE_SRC/);
  assert.match(journeySource, /isChinaOpeningCinematic[\s\S]*CHINA_OPENING_WATCHTOWER_SRC/);
  assert.match(journeySource, /isChinaOpeningCinematic[\s\S]*CHINA_OPENING_GATE_SEAL_SRC/);
  assert.match(cssSource, /\.opening-cinematic-overlay\.is-china/);
});
