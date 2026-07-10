import assert from 'node:assert/strict';
import test from 'node:test';
import { journeyRendererSource } from '../journeySourceText.test-utils.mjs';

const getDesertEntryLayerCallSource = (layerKey) => {
  const layerNeedle = `assets,\n      '${layerKey}',`;
  const layerStart = journeyRendererSource.indexOf(layerNeedle);
  assert.notEqual(layerStart, -1, `${layerKey} draw call should exist`);
  const nextLayerStart = journeyRendererSource.indexOf('\n    );', layerStart);
  assert.notEqual(nextLayerStart, -1, `${layerKey} draw call should close`);
  return journeyRendererSource.slice(layerStart, nextLayerStart);
};

test('Desert Entry ground height tuning scales layers instead of cropping them', () => {
  const groundLayerStart = journeyRendererSource.indexOf('function drawDesertEntryGroundLayer(');
  const groundLayerEnd = journeyRendererSource.indexOf('function drawDesertEntryGroundLayerTileSeamBreakup(', groundLayerStart);
  const groundLayerSource = journeyRendererSource.slice(groundLayerStart, groundLayerEnd);

  assert.match(groundLayerSource, /const renderHeight = Math\.max\(1, height\);/);
  assert.match(groundLayerSource, /renderHeight \* sourceRatio/);
  assert.doesNotMatch(groundLayerSource, /clipToDestHeight/);
  assert.doesNotMatch(groundLayerSource, /sourceDrawOffsetY/);

  [
    'groundBacking',
    'templeFoundationTransition',
    'groundLane',
    'foregroundRubble',
  ].forEach((layerKey) => {
    const layerCallSource = getDesertEntryLayerCallSource(layerKey);
    assert.doesNotMatch(layerCallSource, /sourceDrawHeight:/);
    assert.doesNotMatch(layerCallSource, /sourceDrawOffsetY:/);
    assert.doesNotMatch(layerCallSource, /clipToDestHeight:\s*true/);
  });

  [
    'groundTransition',
  ].forEach((layerKey) => {
    const layerCallSource = getDesertEntryLayerCallSource(layerKey);
    assert.doesNotMatch(layerCallSource, /sourceDrawHeight:/);
    assert.doesNotMatch(layerCallSource, /clipToDestHeight:\s*true/);
  });
});
