import assert from 'node:assert/strict';
import test from 'node:test';

import { getStoryPropVisibilityWidth } from './rendererProps.js';

const getScaledEditorSize = (prop) => ({
  width: prop.width * (Number.isFinite(prop.scale) ? prop.scale : 1),
  height: prop.height * (Number.isFinite(prop.scale) ? prop.scale : 1),
});

test('scaled background image props stay visible until their rendered width leaves the viewport', () => {
  const duatBreachWall = {
    id: 'opening-duat-breach-wall',
    type: 'image-prop',
    x: 418,
    width: 278,
    height: 154,
    scale: 3.85,
  };
  const cameraX = 820;

  const oldVisibilityWidth = Math.max(440, Number(duatBreachWall.width) || 0);
  const oldScreenRight = duatBreachWall.x - oldVisibilityWidth / 2 - cameraX + oldVisibilityWidth;

  const visibilityWidth = getStoryPropVisibilityWidth(duatBreachWall, getScaledEditorSize);
  const screenRight = duatBreachWall.x - visibilityWidth / 2 - cameraX + visibilityWidth;

  assert.ok(oldScreenRight < 0, 'old unscaled culling would hide the left ruin at this camera position');
  assert.equal(Math.round(visibilityWidth), 1070);
  assert.ok(screenRight > 0, 'scaled culling should keep the left ruin visible while its drawn pixels remain on screen');
});
