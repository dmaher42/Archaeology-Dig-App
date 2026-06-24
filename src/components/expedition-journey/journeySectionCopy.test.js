import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SECTION_COPY,
  setExpeditionJourneyCiv,
} from './journeyDataRouter.js';

test('section display copy is routed per civilisation', () => {
  setExpeditionJourneyCiv('Ancient Egypt');
  assert.equal(SECTION_COPY['desert-entry'].name, 'Desert Entry');
  assert.equal(SECTION_COPY['desert-entry'].title, 'Cross the corrupted threshold and restore the first seal.');

  setExpeditionJourneyCiv('Ancient China');
  assert.equal(SECTION_COPY['yellow-river-frontier'].name, 'Yellow River Frontier');
  assert.equal(SECTION_COPY['yellow-river-frontier'].title, 'The Yellow River Frontier');
  assert.equal(SECTION_COPY['desert-entry'], undefined);

  setExpeditionJourneyCiv('Ancient Rome');
  assert.equal(SECTION_COPY['via-sacra'].name, 'Via Sacra');
  assert.equal(SECTION_COPY['via-sacra'].title, 'The Sacred Road — cracked limestone, collapsed arches.');
  assert.equal(SECTION_COPY['desert-entry'], undefined);

  setExpeditionJourneyCiv('Ancient Egypt');
});
