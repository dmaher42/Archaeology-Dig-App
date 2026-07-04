import assert from 'node:assert/strict';
import test from 'node:test';
import { ENEMIES } from './journeyLevelData.js';

const DESERT_ENTRY_SAND_WISP_IDS = [
  'sand-wisp-arena-1',
  'sand-wisp-mural-1',
  'sand-wisp-start-1',
  'sand-wisp-ledge-1',
  'sand-wisp-stretch-1',
];

test('Desert Entry sand wisps are 25 percent larger than the original body size', () => {
  const enemiesById = new Map(ENEMIES.map(enemy => [enemy.id, enemy]));

  DESERT_ENTRY_SAND_WISP_IDS.forEach((id) => {
    const wisp = enemiesById.get(id);

    assert.equal(wisp?.type, 'sand-wisp', `${id} should stay authored as a sand wisp`);
    assert.equal(wisp.width, 40, `${id} width should be 25 percent larger than 32`);
    assert.equal(wisp.height, 37.5, `${id} height should be 25 percent larger than 30`);
  });
});
