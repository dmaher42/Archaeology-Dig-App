import assert from 'node:assert/strict';
import test from 'node:test';

import { getEnemySpriteDrawBox } from './journeyEnemySprites.js';

test('regular enemy sprite draw boxes stay close to gameplay hitbox scale', () => {
  const scarab = {
    id: 'scarab-start-1',
    name: 'Start Path Scarab',
    type: 'scarab',
    x: 255,
    y: 334,
    width: 30,
    height: 24,
    defeated: false,
  };

  const drawBox = getEnemySpriteDrawBox(scarab, 255, 0, 'patrol');

  assert.ok(drawBox, 'scarab draw box should resolve');
  assert.ok(drawBox.width >= 82, `scarab draw width should show the larger visual size boost, received ${drawBox.width}`);
  assert.ok(drawBox.height >= 68, `scarab draw height should show the larger visual size boost, received ${drawBox.height}`);
  assert.ok(drawBox.width <= 180, `scarab draw width should stay readable, received ${drawBox.width}`);
  assert.ok(drawBox.height <= 126, `scarab draw height should stay readable, received ${drawBox.height}`);
  assert.equal(scarab.width, 30, 'visual size boost should not mutate the combat width');
  assert.equal(scarab.height, 24, 'visual size boost should not mutate the combat height');
});
