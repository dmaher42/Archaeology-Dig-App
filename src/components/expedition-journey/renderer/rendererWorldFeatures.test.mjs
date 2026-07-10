import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getHazardBurialCoverFootY,
  getHazardBurialSinkOffset,
} from './rendererWorldFeatures.js';

test('hazard burial cover anchors to the painted trap decal bottom when available', () => {
  const logicalFootY = 581;
  const openingSpikeTrapDecalDest = {
    x: -18,
    y: 567,
    width: 184,
    height: 42,
  };

  assert.equal(
    getHazardBurialCoverFootY(logicalFootY, openingSpikeTrapDecalDest),
    609,
  );
});

test('desert entry spike trap burial sinks the visible art into the path', () => {
  assert.equal(getHazardBurialSinkOffset(0.7, 'desert-entry', 'spike-trap'), 10);
  assert.equal(getHazardBurialSinkOffset(0.7, 'desert-entry', 'sand-pit'), 0);
  assert.equal(getHazardBurialSinkOffset(0.7, 'catacombs', 'spike-trap'), 0);
});
