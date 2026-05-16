import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  DYNAMIC_WORLD_EFFECT_REGIONS,
  DYNAMIC_WORLD_EFFECTS_SRC,
  DYNAMIC_WORLD_EFFECTS_VERSION,
} from './journeyDynamicWorldAssets.js';

const source = readFileSync(new URL('./journeyLevelData.js', import.meta.url), 'utf8');
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
  assert.match(transitionMarkers, /camp lights and flags over the final rise/);
});

test('story props include recurring expedition markers across sections', () => {
  const storyProps = extractExportedArray('STORY_PROPS');

  assert.match(storyProps, /survey-flag-marker/);
  assert.match(storyProps, /abandoned-camp/);
  assert.match(storyProps, /type:\s*'cart'/);
  assert.match(storyProps, /broken supply cart/);
  assert.match(storyProps, /base camp supply cart/);
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
    'warning banners',
    'collapsed tower remains',
    'old field journal cache',
    'sealed blocked tunnel',
    'destroyed bridge remains',
    'broken excavation tools',
  ].forEach((label) => {
    assert.match(storyProps, new RegExp(label));
  });
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
});
