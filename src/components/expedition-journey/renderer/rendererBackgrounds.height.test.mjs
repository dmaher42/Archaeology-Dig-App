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

test('Desert Entry height tuning scales foundation layers and clips gameplay detail layers', () => {
  const groundLayerStart = journeyRendererSource.indexOf('function drawDesertEntryGroundLayer(');
  const groundLayerEnd = journeyRendererSource.indexOf('function drawDesertEntryGroundLayerTileSeamBreakup(', groundLayerStart);
  const groundLayerSource = journeyRendererSource.slice(groundLayerStart, groundLayerEnd);

  assert.match(
    groundLayerSource,
    /const renderHeight = Math\.max\([\s\S]*?sourceDrawHeight[\s\S]*?\);/,
  );
  assert.match(groundLayerSource, /renderHeight \* sourceRatio/);
  assert.match(
    groundLayerSource,
    /rect\(0, Math\.round\(y\), canvasWidth, Math\.round\(height\)\);[\s\S]*?clip\(\);/,
  );

  [
    'groundBacking',
    'templeFoundationTransition',
    'groundTransition',
  ].forEach((layerKey) => {
    const layerCallSource = getDesertEntryLayerCallSource(layerKey);
    assert.doesNotMatch(layerCallSource, /sourceDrawHeight:/);
    assert.doesNotMatch(layerCallSource, /clipToDestHeight:\s*true/);
  });

  [
    'groundLane',
    'foregroundRubble',
  ].forEach((layerKey) => {
    const layerCallSource = getDesertEntryLayerCallSource(layerKey);
    assert.match(
      layerCallSource,
      new RegExp(`sourceDrawHeight:\\s*DESERT_ENTRY_GROUND_LAYER_DRAW_HEIGHTS\\.${layerKey}`),
    );
    assert.match(layerCallSource, /clipToDestHeight:\s*true/);
  });
});
