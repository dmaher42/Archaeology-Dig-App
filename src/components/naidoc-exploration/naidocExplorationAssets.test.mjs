import { existsSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Image } from 'canvas';
import { readFileSync } from 'node:fs';
import { NAIDOC_EXPLORATION_ASSETS } from './naidocExplorationAssets.js';

const repositoryRoot = new URL('../../..', import.meta.url);

const loadImageSize = (assetPath) => {
  const image = new Image();
  image.src = readFileSync(new URL(`public/${assetPath}`, repositoryRoot));
  return { width: image.width, height: image.height };
};

test('NAIDOC exploration asset manifest points at real PNG files', () => {
  for (const asset of Object.values(NAIDOC_EXPLORATION_ASSETS)) {
    assert.match(asset.src, /^assets\/naidoc-exploration\/.+\.png$/);
    assert.equal(existsSync(new URL(`public/${asset.src}`, repositoryRoot)), true, `${asset.src} should exist`);
  }
});

test('NAIDOC exploration PNG dimensions match the runtime contract', () => {
  for (const asset of Object.values(NAIDOC_EXPLORATION_ASSETS)) {
    const size = loadImageSize(asset.src);
    assert.equal(size.width, asset.width, `${asset.src} width should match manifest`);
    assert.equal(size.height, asset.height, `${asset.src} height should match manifest`);
  }

  assert.equal(NAIDOC_EXPLORATION_ASSETS.player.frameCount, 4);
  assert.deepEqual(NAIDOC_EXPLORATION_ASSETS.markers.states, ['available', 'collected', 'locked', 'info']);
  assert.deepEqual(NAIDOC_EXPLORATION_ASSETS.props.frames, ['archaeology', 'river', 'milestone', 'reflection']);
});
