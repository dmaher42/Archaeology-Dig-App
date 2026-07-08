import assert from 'node:assert/strict';
import test from 'node:test';
import { journeyRendererSource } from '../journeySourceText.test-utils.mjs';

test('Desert Entry ground-strip height tuning clips artwork instead of stretching it', () => {
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
    'groundLane',
    'foregroundRubble',
  ].forEach((layerKey) => {
    assert.match(
      journeyRendererSource,
      new RegExp(`sourceDrawHeight:\\s*DESERT_ENTRY_GROUND_LAYER_DRAW_HEIGHTS\\.${layerKey}`),
    );
  });
});
