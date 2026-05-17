import assert from 'node:assert/strict';
import test from 'node:test';

import { getScarabQueenDrawBox, shouldFlipBossSprite } from './journeyBossSprites.js';
import { getEnemySpriteDrawBox, shouldFlipEnemySprite } from './journeyEnemySprites.js';
import { readFileSync } from 'node:fs';

const journeyComponentSource = readFileSync(new URL('../ExpeditionJourney.jsx', import.meta.url), 'utf8');

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

test('scarabs use the same right-facing sprite orientation rules', () => {
  assert.equal(shouldFlipEnemySprite('scarab', 1), false, 'small scarab should not flip while facing right');
  assert.equal(shouldFlipEnemySprite('scarab', -1), true, 'small scarab should flip while facing left');
  assert.equal(shouldFlipBossSprite('scarab-queen', 1), false, 'Scarab Queen should not flip while facing right');
  assert.equal(shouldFlipBossSprite('scarab-queen', -1), true, 'Scarab Queen should flip while facing left');
});

test('Scarab Queen draw box matches the fixed atlas ratio closely enough to stay grounded', () => {
  const boss = {
    id: 'scarab-queen',
    x: 1395,
    y: 318,
    width: 58,
    height: 42,
  };

  const drawBox = getScarabQueenDrawBox(boss, 300);
  const atlasRatio = 560 / 390;
  const drawRatio = drawBox.width / drawBox.height;

  assert.ok(drawBox.width >= drawBox.height * atlasRatio * 0.95, `Queen draw box should be wide enough for fixed-cell atlas, received ratio ${drawRatio}`);
  assert.ok(Math.abs((drawBox.y + drawBox.height) - (boss.y + boss.height + 4)) < 0.001, 'Queen draw box should stay grounded to boss feet');
});

test('scarabs rely on their PNG art instead of the generic visibility-assist oval', () => {
  assert.match(journeyComponentSource, /!\['riverCrab', 'scarab'\]\.includes\(family\)/);
});
