import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getNextJourneyRouteGate,
  isJourneyProgressRouteGate,
} from './journeyUtils.js';
import {
  ROUTE_GATES,
  setExpeditionJourneyCiv,
} from './journeyDataRouter.js';

const routeGates = [
  { id: 'temple-approach-seal', name: 'Temple Approach Seal', x: 7174, width: 34, requires: { shards: 4 } },
  { id: 'guardian-prep-seal', name: 'Guardian Prep Seal', x: 5765, width: 34, requires: { objective: 'desert-entry', shards: 6 } },
  { id: 'desert-seal', name: 'Desert Map Seal', x: 15492, width: 34, requires: { objective: 'desert-entry', miniBoss: 'scarab-queen', keyItem: 'brush-handle', shards: 10 } },
  { id: 'desert-entry-scorpion-nest-gate', x: 3244 },
];

const makeState = (x, openedRouteGateIds = []) => ({
  player: { x, width: 32 },
  openedRouteGateIds: new Set(openedRouteGateIds),
});

test('progress gate selection preserves authored first seal and ignores editor-only route markers', () => {
  assert.equal(isJourneyProgressRouteGate(routeGates[3]), false);
  assert.equal(
    getNextJourneyRouteGate(routeGates, makeState(0))?.id,
    'temple-approach-seal',
  );
});

test('progress gate selection skips unopened gates behind Asha after the Desert Entry rebuild', () => {
  assert.equal(
    getNextJourneyRouteGate(routeGates, makeState(7200, ['temple-approach-seal']))?.id,
    'desert-seal',
  );
  assert.equal(
    getNextJourneyRouteGate(routeGates, makeState(17180))?.id,
    'desert-seal',
  );
});

test('real Egypt route guidance hands Queen payoff to Desert Seal then Ruined Temple route', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  assert.equal(
    getNextJourneyRouteGate(
      ROUTE_GATES,
      makeState(15320, ['temple-approach-seal', 'guardian-prep-seal']),
    )?.id,
    'desert-seal',
  );
  assert.equal(
    getNextJourneyRouteGate(
      ROUTE_GATES,
      makeState(17380, ['temple-approach-seal', 'guardian-prep-seal', 'desert-seal']),
    )?.id,
    'temple-seal',
  );
});
