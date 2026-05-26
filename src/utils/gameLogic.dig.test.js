import assert from 'node:assert/strict';
import test from 'node:test';

import { getDigBoardColumns } from './gameLogic.js';

test('dig board uses a wide three-row desktop layout for the full investigation deck', () => {
  assert.equal(getDigBoardColumns(24), 8);
});

test('dig board keeps smaller decks compact', () => {
  assert.equal(getDigBoardColumns(10), 5);
});
