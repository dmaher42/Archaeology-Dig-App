import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  getJourneyToolsForCivilisation,
  JOURNEY_TOOLS,
  ROUTE_GATES,
  SECTION_ATMOSPHERES,
  SECTION_COPY,
  SECTION_OBJECTIVES,
  setExpeditionJourneyCiv,
} from './journeyDataRouter.js';

const journeyHudOverlaysSource = readFileSync(new URL('./JourneyHudOverlays.jsx', import.meta.url), 'utf8');

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

test('China journey identity routes tools, gates and objectives away from Egypt data', () => {
  setExpeditionJourneyCiv('Ancient Egypt');
  assert.equal(getJourneyToolsForCivilisation('Ancient China').find(tool => tool.id === 'field-guide-page')?.name, 'Dynasty Field Guide');

  setExpeditionJourneyCiv('Ancient China');
  assert.equal(JOURNEY_TOOLS.find(tool => tool.id === 'field-guide-page')?.name, 'Dynasty Field Guide');
  assert.equal(SECTION_OBJECTIVES['desert-entry'], undefined);
  assert.equal(SECTION_OBJECTIVES['yellow-river-frontier'].label, 'Follow the river to the rammed-earth wall');

  const gateIds = ROUTE_GATES.map(gate => gate.id);
  assert.deepEqual(gateIds, ['wall-breach-seal', 'imperial-gate-seal']);
  assert.equal(gateIds.includes('desert-seal'), false);
  assert.equal(gateIds.includes('temple-seal'), false);

  setExpeditionJourneyCiv('Ancient Rome');
  assert.equal(JOURNEY_TOOLS.find(tool => tool.id === 'field-guide-page')?.name, 'Wax Tablet');
  assert.equal(SECTION_OBJECTIVES['desert-entry'], undefined);

  setExpeditionJourneyCiv('Ancient Egypt');
  assert.equal(JOURNEY_TOOLS.find(tool => tool.id === 'field-guide-page')?.name, 'Papyrus Guide');
});

test('China journey start briefing is not the Egypt Lost Map Tablet briefing', () => {
  assert.match(journeyHudOverlaysSource, /isChinaBriefing/);
  assert.match(journeyHudOverlaysSource, /Follow the Yellow River frontier/);
  assert.match(journeyHudOverlaysSource, /Restore the dynasty line at the Imperial Gate/);
});

test('Desert Entry keeps the sky clear of ambient particle dots', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  assert.equal(SECTION_ATMOSPHERES['desert-entry'].particle, null);
  assert.equal(SECTION_ATMOSPHERES['ruined-temple'].particle, 'embers');
});
