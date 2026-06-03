import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyJourneyPlacementOverrides,
  normalizeJourneyPlacementExportForOverrides,
} from './journeyPlacementOverrides.js';
import { PLATFORMS as BASE_PLATFORMS } from './journeyLevelData.js';
import {
  PLATFORMS as ROUTED_PLATFORMS,
  setExpeditionJourneyCiv,
} from './journeyDataRouter.js';

test('applyJourneyPlacementOverrides merges exported editor items by id without mutating base data', () => {
  const base = {
    props: [
      { id: 'prop-a', x: 10, y: 20, label: 'old prop', groundContactLayer: [{ assetKey: 'premium-base' }] },
      { id: 'prop-b', x: 30, y: 40, label: 'deleted prop' },
    ],
    hazards: [
      { id: 'trap-a', x: 100, y: 200, sectionId: 'desert-entry' },
    ],
    routeGates: [
      { id: 'gate-a', x: 300, y: 20 },
    ],
    miniBosses: [
      { id: 'scarab-queen', x: 400, arenaStart: 350, arenaEnd: 450 },
    ],
  };
  const overrides = {
    props: [
      { id: 'prop-a', x: 12, y: 24, label: 'moved prop', groundContactLayer: [{ assetKey: 'stale-export' }] },
      { id: 'prop-new', x: 44, y: 50, label: 'new prop' },
    ],
    deletedPropIds: ['prop-b'],
    hazards: [
      { id: 'trap-a', x: 112, y: 208, sectionId: 'desert-entry' },
    ],
    routeGates: [
      { id: 'gate-a', x: 330, y: 20 },
    ],
    miniBosses: [
      { id: 'scarab-queen', x: 420, arenaStart: 370, arenaEnd: 470 },
    ],
  };

  const merged = applyJourneyPlacementOverrides(base, overrides);

  assert.deepEqual(merged.props, [
    { id: 'prop-a', x: 12, y: 24, label: 'moved prop', groundContactLayer: [{ assetKey: 'premium-base' }] },
    { id: 'prop-new', x: 44, y: 50, label: 'new prop' },
  ]);
  assert.deepEqual(merged.hazards, [
    { id: 'trap-a', x: 112, y: 208, sectionId: 'desert-entry' },
  ]);
  assert.deepEqual(merged.routeGates, [
    { id: 'gate-a', x: 330, y: 20 },
  ]);
  assert.deepEqual(merged.miniBosses, [
    { id: 'scarab-queen', x: 420, arenaStart: 370, arenaEnd: 470 },
  ]);
  assert.deepEqual(base.props[0], {
    id: 'prop-a',
    x: 10,
    y: 20,
    label: 'old prop',
    groundContactLayer: [{ assetKey: 'premium-base' }],
  });
});

test('normalizeJourneyPlacementExportForOverrides keeps pasted trap exports in their editor room', () => {
  const normalized = normalizeJourneyPlacementExportForOverrides({
    room: 'desert-entry',
    hazards: [
      { id: 'entry-pressure-plate', sectionId: 'unknown-room', roomId: 'unknown-room', x: 4153 },
      { id: 'temple-trap', sectionId: 'ruined-temple', roomId: 'ruined-temple', x: 14400 },
    ],
  });

  assert.deepEqual(normalized.hazards, [
    { id: 'entry-pressure-plate', sectionId: 'desert-entry', x: 4153 },
    { id: 'temple-trap', sectionId: 'ruined-temple', roomId: 'ruined-temple', x: 14400 },
  ]);
});

test('normalizeJourneyPlacementExportForOverrides dedupes repeated editor item ids', () => {
  const normalized = normalizeJourneyPlacementExportForOverrides({
    room: 'desert-entry',
    platforms: [
      { id: 'platform-a', x: 10, y: 20, width: 80 },
      { id: 'platform-b', x: 30, y: 40, width: 90 },
      { id: 'platform-a', x: 14, y: 24, width: 84 },
    ],
    props: [
      { id: 'prop-a', x: 1 },
      { id: 'prop-a', x: 2 },
    ],
  });

  assert.deepEqual(normalized.platforms, [
    { id: 'platform-a', x: 14, y: 24, width: 84 },
    { id: 'platform-b', x: 30, y: 40, width: 90 },
  ]);
  assert.deepEqual(normalized.props, [
    { id: 'prop-a', x: 2 },
  ]);
});

test('journeyDataRouter exposes editor overrides while journeyLevelData keeps authored base placement', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const basePlatform = BASE_PLATFORMS.find(platform => platform.id === 'mummification-chamber-left-lower-terrace');
  const routedPlatform = ROUTED_PLATFORMS.find(platform => platform.id === 'mummification-chamber-left-lower-terrace');

  assert.equal(basePlatform.width, 311);
  assert.equal(routedPlatform.width, 233);
});
