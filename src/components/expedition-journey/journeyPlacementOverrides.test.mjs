import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import {
  applyJourneyPlacementOverrides,
  mergeJourneyPlacementOverrideExports,
  normalizeJourneyPlacementExportForOverrides,
} from './journeyPlacementOverrides.js';
import { PLATFORMS as BASE_PLATFORMS } from './journeyLevelData.js';
import {
  getJourneyMiniBosses,
  HAZARDS as ROUTED_HAZARDS,
  HIDDEN_ROUTES as ROUTED_HIDDEN_ROUTES,
  PLATFORMS as ROUTED_PLATFORMS,
  ROUTE_GATES as ROUTED_ROUTE_GATES,
  STAGE_ENTRANCE_FEATURES as ROUTED_STAGE_ENTRANCE_FEATURES,
  STORY_PROPS as ROUTED_STORY_PROPS,
  setExpeditionJourneyCiv,
} from './journeyDataRouter.js';

const JOURNEY_TEST_VIEWPORT_WIDTH = 1280;

const isHorizontallyVisibleForTest = (worldX, width, cameraX, margin = 0) => {
  const screenX = worldX - cameraX;
  return screenX + width >= -margin && screenX <= JOURNEY_TEST_VIEWPORT_WIDTH + margin;
};

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
    hiddenRoutes: [
      { id: 'route-a', x: 200, y: 20, width: 80, height: 50, name: 'Route A', civilisation: 'Ancient Egypt' },
    ],
    enemies: [
      { id: 'nest-a', x: 120, y: 220, widthScale: 1.85, yOffset: 0, health: 6 },
    ],
    miniBosses: [
      { id: 'scarab-queen', x: 400, arenaStart: 350, arenaEnd: 450 },
    ],
  };
  const overrides = {
    props: [
      {
        id: 'prop-a',
        x: 12,
        y: 24,
        label: 'moved prop',
        groundContactLayer: [{ layer: 'overlay', assetKey: 'premiumLongSandLip', xRatio: 0.42 }],
      },
      { id: 'prop-new', x: 44, y: 50, label: 'new prop' },
    ],
    deletedPropIds: ['prop-b'],
    hazards: [
      { id: 'trap-a', x: 112, y: 208, sectionId: 'desert-entry' },
    ],
    routeGates: [
      { id: 'gate-a', x: 330, y: 20 },
    ],
    hiddenRoutes: [
      { id: 'route-a', x: 240, width: 120 },
      { id: 'route-b', x: 360, y: 24, width: 90, height: 54, name: 'Route B', civilisation: 'Ancient Egypt' },
    ],
    enemies: [
      { id: 'nest-a', widthScale: 5.6, yOffset: 15, health: 999 },
    ],
    miniBosses: [
      { id: 'scarab-queen', x: 420, arenaStart: 370, arenaEnd: 470 },
    ],
  };

  const merged = applyJourneyPlacementOverrides(base, overrides);

  assert.deepEqual(merged.props, [
    {
      id: 'prop-a',
      x: 12,
      y: 24,
      label: 'moved prop',
      groundContactLayer: [{ layer: 'overlay', assetKey: 'premiumLongSandLip', xRatio: 0.42 }],
    },
    { id: 'prop-new', x: 44, y: 50, label: 'new prop' },
  ]);
  assert.deepEqual(merged.hazards, [
    { id: 'trap-a', x: 112, y: 208, sectionId: 'desert-entry' },
  ]);
  assert.deepEqual(merged.routeGates, [
    { id: 'gate-a', x: 330, y: 20 },
  ]);
  assert.deepEqual(merged.hiddenRoutes, [
    { id: 'route-a', x: 240, y: 20, width: 120, height: 50, name: 'Route A', civilisation: 'Ancient Egypt' },
    { id: 'route-b', x: 360, y: 24, width: 90, height: 54, name: 'Route B', civilisation: 'Ancient Egypt' },
  ]);
  assert.deepEqual(merged.enemies, [
    { id: 'nest-a', x: 120, y: 220, widthScale: 5.6, yOffset: 15, health: 6 },
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
    hiddenRoutes: [
      { id: 'route-a', x: 1 },
      { id: 'route-a', x: 2 },
    ],
  });

  assert.deepEqual(normalized.platforms, [
    { id: 'platform-a', x: 14, y: 24, width: 84 },
    { id: 'platform-b', x: 30, y: 40, width: 90 },
  ]);
  assert.deepEqual(normalized.props, [
    { id: 'prop-a', x: 2 },
  ]);
  assert.deepEqual(normalized.hiddenRoutes, [
    { id: 'route-a', x: 2 },
  ]);
});

test('mergeJourneyPlacementOverrideExports preserves existing generated placements while updating the current export', () => {
  const merged = mergeJourneyPlacementOverrideExports({
    room: 'desert-entry',
    props: [
      { id: 'entry-statue', sectionId: 'desert-entry', x: 100, y: 200 },
      { id: 'mural-door', sceneId: 'forgotten-mural', x: 900, y: 120 },
      { id: 'remove-me', sectionId: 'desert-entry', x: 160, y: 220 },
    ],
    enemies: [
      { id: 'desert-entry-scorpion-nest-1', sectionId: 'desert-entry', x: 2782, y: 333 },
    ],
    hiddenRoutes: [
      { id: 'mummification-chamber-route', sectionId: 'desert-entry', x: 4200, width: 500 },
    ],
    platforms: [
      { id: 'mural-floor', sceneId: 'forgotten-mural', x: 820, y: 500, width: 300 },
    ],
  }, {
    room: 'desert-entry',
    props: [
      { id: 'entry-statue', sectionId: 'desert-entry', x: 140, y: 210 },
    ],
    deletedPropIds: ['remove-me'],
    enemies: [
      { id: 'desert-entry-scorpion-nest-1', sectionId: 'desert-entry', x: 6605, y: 484, widthScale: 5.6 },
    ],
    hiddenRoutes: [
      { id: 'mummification-chamber-route', sectionId: 'desert-entry', x: 5000, width: 620 },
    ],
  });

  assert.deepEqual(merged.props, [
    { id: 'entry-statue', sectionId: 'desert-entry', x: 140, y: 210 },
    { id: 'mural-door', sceneId: 'forgotten-mural', x: 900, y: 120 },
  ]);
  assert.deepEqual(merged.enemies, [
    { id: 'desert-entry-scorpion-nest-1', sectionId: 'desert-entry', x: 6605, y: 484, widthScale: 5.6 },
  ]);
  assert.deepEqual(merged.hiddenRoutes, [
    { id: 'mummification-chamber-route', sectionId: 'desert-entry', x: 5000, width: 620 },
  ]);
  assert.deepEqual(merged.platforms, [
    { id: 'mural-floor', sceneId: 'forgotten-mural', x: 820, y: 500, width: 300 },
  ]);
  assert.deepEqual(merged.deletedPropIds, ['remove-me']);
});

test('mergeJourneyPlacementOverrideExports treats missing same-room editable items as deleted', () => {
  const merged = mergeJourneyPlacementOverrideExports({
    room: 'desert-entry',
    props: [
      { id: 'keep-entry-prop', sectionId: 'desert-entry', x: 100, y: 200 },
      { id: 'stale-entry-prop', sectionId: 'desert-entry', x: 160, y: 220 },
      { id: 'mural-door', sceneId: 'forgotten-mural', x: 900, y: 120 },
    ],
    platforms: [
      { id: 'keep-entry-platform', sectionId: 'desert-entry', x: 100, y: 520, width: 200 },
      { id: 'stale-entry-platform', sectionId: 'desert-entry', x: 180, y: 510, width: 140 },
      { id: 'mural-floor', sceneId: 'forgotten-mural', x: 820, y: 500, width: 300 },
    ],
    hazards: [
      { id: 'keep-entry-hazard', sectionId: 'desert-entry', x: 120, y: 540, width: 80 },
      { id: 'stale-entry-hazard', sectionId: 'desert-entry', x: 170, y: 540, width: 80 },
      { id: 'mural-hazard', sceneId: 'forgotten-mural', x: 850, y: 540, width: 80 },
    ],
  }, {
    room: 'desert-entry',
    props: [
      { id: 'keep-entry-prop', sectionId: 'desert-entry', x: 140, y: 210 },
    ],
    platforms: [
      { id: 'keep-entry-platform', sectionId: 'desert-entry', x: 120, y: 500, width: 220 },
    ],
    hazards: [
      { id: 'keep-entry-hazard', sectionId: 'desert-entry', x: 130, y: 540, width: 80 },
    ],
  });

  assert.deepEqual(merged.props, [
    { id: 'keep-entry-prop', sectionId: 'desert-entry', x: 140, y: 210 },
    { id: 'mural-door', sceneId: 'forgotten-mural', x: 900, y: 120 },
  ]);
  assert.deepEqual(merged.platforms, [
    { id: 'keep-entry-platform', sectionId: 'desert-entry', x: 120, y: 500, width: 220 },
    { id: 'mural-floor', sceneId: 'forgotten-mural', x: 820, y: 500, width: 300 },
  ]);
  assert.deepEqual(merged.hazards, [
    { id: 'keep-entry-hazard', sectionId: 'desert-entry', x: 130, y: 540, width: 80 },
    { id: 'mural-hazard', sceneId: 'forgotten-mural', x: 850, y: 540, width: 80 },
  ]);
  assert.deepEqual(merged.deletedPropIds, ['stale-entry-prop']);
  assert.deepEqual(merged.deletedPlatformIds, ['stale-entry-platform']);
  assert.deepEqual(merged.deletedHazardIds, ['stale-entry-hazard']);
});

test('journeyDataRouter exposes editor overrides while journeyLevelData keeps authored base placement', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const basePlatform = BASE_PLATFORMS.find(platform => platform.id === 'mummification-chamber-left-lower-terrace');
  const routedPlatform = ROUTED_PLATFORMS.find(platform => platform.id === 'mummification-chamber-left-lower-terrace');

  assert.equal(basePlatform.width, 311);
  assert.equal(routedPlatform.width, 233);
});

test('sacred exterior editor overrides stay aligned after horizontal scale changes', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const propById = (id) => ROUTED_STORY_PROPS.find(prop => prop.id === id);
  const platformById = (id) => ROUTED_PLATFORMS.find(platform => platform.id === id);
  const hazardById = (id) => ROUTED_HAZARDS.find(hazard => hazard.id === id);

  assert.equal(propById('forgotten-mural-climb-structure')?.x, 7465);
  assert.equal(platformById('forgotten-mural-upper-doorway-floor')?.x, 7528);
  assert.equal(platformById('forgotten-mural-upper-doorway-floor')?.y, 193);
  assert.equal(hazardById('desert-soft-ridge')?.x, 7034);
  assert.equal(hazardById('broken-ruins-loose-stones')?.x, 7797);

  assert.equal(propById('scribe-chamber-doorway-structure')?.x, 10876);
  assert.equal(platformById('scribe-chamber-doorway-threshold')?.x, 10871);
  assert.equal(platformById('scribe-chamber-doorway-threshold')?.y, 297);
});

test('sacred room entry triggers align with their visible Desert Entry exteriors', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const propById = (id) => ROUTED_STORY_PROPS.find(prop => prop.id === id);
  const routeById = (id) => ROUTED_HIDDEN_ROUTES.find(route => route.id === id);
  const generatedBounds = (prop) => {
    const width = (prop.width || 0) * (prop.scale || 1);
    return {
      left: prop.x - width / 2,
      right: prop.x + width / 2,
    };
  };
  const overlaps = (route, bounds) => (
    route.x < bounds.right && route.x + route.width > bounds.left
  );

  [
    ['mummification-chamber-route', 'desert-entry-mummification-exterior-arrival-background-1'],
    ['desert-upper-survey-route', 'forgotten-mural-climb-structure'],
    ['scribe-locked-chamber-route', 'scribe-chamber-doorway-structure'],
  ].forEach(([routeId, propId]) => {
    const route = routeById(routeId);
    const prop = propById(propId);
    assert.ok(route, `${routeId} should be available through routed Journey data`);
    assert.ok(prop, `${propId} should be available through routed Journey data`);
    assert.ok(
      overlaps(route, generatedBounds(prop)),
      `${routeId} trigger should overlap the visible ${propId} exterior`,
    );
  });
});

test('sacred room entry routes contain their physical doorway platforms', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const routeById = (id) => ROUTED_HIDDEN_ROUTES.find(route => route.id === id);
  const platformById = (id) => ROUTED_PLATFORMS.find(platform => platform.id === id);

  [
    ['mummification-chamber-route', 'mummification-chamber-doorway-floor'],
    ['desert-upper-survey-route', 'forgotten-mural-upper-doorway-floor'],
    ['scribe-locked-chamber-route', 'scribe-chamber-doorway-threshold'],
  ].forEach(([routeId, platformId]) => {
    const route = routeById(routeId);
    const platform = platformById(platformId);
    assert.ok(route, `${routeId} should be available through routed Journey data`);
    assert.ok(platform, `${platformId} should be available through routed Journey data`);
    assert.ok(
      platform.x >= route.x && platform.x + platform.width <= route.x + route.width,
      `${platformId} should sit inside ${routeId}`,
    );
  });
});

test('routed Desert Entry spine reaches the Queen, seal, and next section in order', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const routeById = (id) => ROUTED_HIDDEN_ROUTES.find(route => route.id === id);
  const gateById = (id) => ROUTED_ROUTE_GATES.find(gate => gate.id === id);
  const featureById = (id) => ROUTED_STAGE_ENTRANCE_FEATURES.find(feature => feature.id === id);
  const queen = getJourneyMiniBosses('Ancient Egypt').find(boss => boss.id === 'scarab-queen');
  const desertSeal = gateById('desert-seal');
  const ruinedTempleGate = featureById('ruined-temple-colossus-gate');

  const mummificationRoute = routeById('mummification-chamber-route');
  const muralRoute = routeById('desert-upper-survey-route');
  const scribeRoute = routeById('scribe-locked-chamber-route');

  assert.ok(mummificationRoute, 'Mummification route should exist in routed data');
  assert.ok(muralRoute, 'Mural route should exist in routed data');
  assert.ok(scribeRoute, 'Scribe route should exist in routed data');
  assert.ok(queen, 'Scarab Queen should exist in routed mini-boss data');
  assert.ok(desertSeal, 'Desert Seal should exist in routed gate data');
  assert.ok(ruinedTempleGate, 'Ruined Temple stage entrance should exist in routed data');

  assert.ok(mummificationRoute.x < muralRoute.x, 'Mummification should come before Mural');
  assert.ok(muralRoute.x < scribeRoute.x, 'Mural should come before Scribe');
  assert.ok(scribeRoute.x + scribeRoute.width < queen.arenaStart, 'Scribe should hand off before the Queen arena');
  assert.ok(queen.arenaStart < queen.x && queen.x < queen.arenaEnd, 'Queen should sit inside her arena');
  assert.ok(queen.arenaEnd < desertSeal.x, 'Desert Seal should come after the Queen arena');
  assert.ok(desertSeal.x < ruinedTempleGate.x, 'Ruined Temple gate should come after Desert Seal');
});

test('Desert Entry rebuild keeps visible scenery and walkable ground continuous through the Ruined Temple gateway', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const propById = (id) => ROUTED_STORY_PROPS.find(prop => prop.id === id);
  const platformById = (id) => ROUTED_PLATFORMS.find(platform => platform.id === id);
  const featureById = (id) => ROUTED_STAGE_ENTRANCE_FEATURES.find(feature => feature.id === id);
  const queen = getJourneyMiniBosses('Ancient Egypt').find(boss => boss.id === 'scarab-queen');
  const ruinedTempleGate = featureById('ruined-temple-colossus-gate');
  const desertFloor = platformById('desert-entry-floor');

  const rebuiltSequenceIds = [
    'desert-entry-mummification-exterior-arrival-background-1',
    'desert-entry-mummification-mural-record-wall-1',
    'forgotten-mural-climb-structure',
    'desert-entry-mural-scribe-record-wall-1',
    'scribe-chamber-doorway-structure',
    'desert-entry-scribe-queen-record-road-1',
    'desert-entry-queen-arena-scarab-carving-1',
    'desert-entry-desert-seal-return-stone-1',
    'desert-entry-seal-gateway-collapsed-road-1',
    'desert-entry-ruined-temple-gateway-dust-motes-1',
  ];

  const rebuiltProps = rebuiltSequenceIds.map((id) => {
    const prop = propById(id);
    assert.ok(prop, `${id} should exist in routed Desert Entry story props`);
    return prop;
  });

  rebuiltProps.reduce((previous, current) => {
    assert.ok(previous.x < current.x, `${previous.id} should appear before ${current.id}`);
    return current;
  });

  assert.ok(queen, 'Scarab Queen should exist in routed mini-boss data');
  assert.ok(ruinedTempleGate, 'Ruined Temple gateway should exist in routed stage entrance data');
  assert.ok(desertFloor, 'Desert Entry floor should exist in routed platform data');
  assert.ok(
    desertFloor.x + desertFloor.width >= ruinedTempleGate.x,
    'Desert Entry floor should remain walkable through the Ruined Temple gateway center',
  );
  assert.ok(
    propById('desert-entry-queen-arena-scarab-carving-1').x >= queen.arenaStart
      && propById('desert-entry-queen-arena-scarab-carving-1').x <= queen.arenaEnd,
    'Queen arena scarab carving should sit inside the Queen arena',
  );
  assert.ok(
    propById('desert-entry-seal-gateway-collapsed-road-1').x < ruinedTempleGate.x,
    'Collapsed road dressing should lead into the Ruined Temple gateway',
  );
});

test('Desert Entry opening rebuild carries the pyramid, ravine, and Mummification approach as one regenerated section', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const propById = (id) => ROUTED_STORY_PROPS.find(prop => prop.id === id);
  const openingPyramid = propById('opening-pyramid-facade-structure');
  const misplacedBridgePyramid = propById('desert-entry-generated-opening-pyramid-facade-1');
  const ravineOverlay = propById('desert-entry-lost-bridge-ravine-floor-deep-1');
  const laterMummificationPlate = propById('desert-entry-mummification-to-mural-background-1');
  const mummificationExterior = propById('desert-entry-generated-mummification-chamber-entrance-1');
  const openingRebuildIds = [
    'desert-entry-opening-pyramid-to-ravine-background-1',
    'desert-entry-ravine-bridge-background-1',
    'desert-entry-ravine-to-mummification-background-1',
    'desert-entry-mummification-exterior-arrival-background-1',
  ];
  const routeCheckpoints = [
    { id: 'desert-entry-opening-pyramid-to-ravine-background-1', targetX: 542 },
    { id: 'desert-entry-ravine-bridge-background-1', targetX: 3014 },
    { id: 'desert-entry-ravine-to-mummification-background-1', targetX: 4550 },
    { id: 'desert-entry-mummification-exterior-arrival-background-1', targetX: 5600 },
  ];
  const expectedBackgroundSizes = {
    'desert-entry-opening-pyramid-to-ravine-background-1': { width: 1672, height: 941 },
    'desert-entry-ravine-bridge-background-1': { width: 1672, height: 941 },
    'desert-entry-ravine-to-mummification-background-1': { width: 1774, height: 887 },
    'desert-entry-mummification-exterior-arrival-background-1': { width: 1672, height: 941 },
  };

  assert.ok(openingPyramid, 'the old editable opening pyramid record should remain available');
  assert.equal(
    openingPyramid.alpha,
    0,
    'the old generated opening pyramid should be visually retired behind the regenerated opening plate',
  );
  assert.ok(mummificationExterior, 'the Mummification exterior entrance should remain available as a visible room landmark');
  assert.equal(mummificationExterior.type, 'generated-mummification-chamber-entrance');
  assert.equal(mummificationExterior.depth, 'route-edge');
  assert.equal(mummificationExterior.layer, 'route-edge');
  assert.ok(
    mummificationExterior.alpha >= 0.82,
    'the Mummification exterior entrance should be visible over the rebuilt background plate',
  );
  assert.equal(
    misplacedBridgePyramid,
    undefined,
    'the duplicate pyramid facade should not sit in the ravine/Mummification handoff',
  );

  const backgrounds = openingRebuildIds.map((id) => {
    const prop = propById(id);
    assert.ok(prop, `${id} should exist in routed Desert Entry story props`);
    assert.equal(prop.sectionId, 'desert-entry');
    assert.equal(prop.type, 'image-prop');
    assert.equal(prop.depth, 'background');
    assert.equal(prop.layer, 'background');
    assert.equal(prop.width, expectedBackgroundSizes[id].width);
    assert.equal(prop.height, expectedBackgroundSizes[id].height);
    assert.equal(prop.alpha, 1, `${id} should draw at full placement opacity`);
    assert.ok(
      prop.assetPath?.startsWith('assets/expedition/backgrounds/desert-entry-opening-rebuild/'),
      `${id} should load from the regenerated opening rebuild background folder`,
    );
    assert.ok(existsSync(`public/${prop.assetPath}`), `${id} image file should exist on disk`);
    const checkpoint = routeCheckpoints.find(item => item.id === id);
    const cameraX = Math.max(0, checkpoint.targetX - JOURNEY_TEST_VIEWPORT_WIDTH * 0.42);
    const visibilityWidth = Math.max(440, prop.width);
    assert.ok(
      isHorizontallyVisibleForTest(prop.x - visibilityWidth / 2, visibilityWidth, cameraX),
      `${id} should overlap the renderer camera window at x=${checkpoint.targetX}`,
    );
    return prop;
  });

  backgrounds.reduce((previous, current) => {
    assert.ok(previous.x < current.x, `${previous.id} should appear before ${current.id}`);
    return current;
  });

  assert.ok(laterMummificationPlate, 'later Mummification-to-Mural background should still exist');
  assert.ok(
    backgrounds[3].x < laterMummificationPlate.x,
    'Mummification exterior arrival plate should hand off before the later Mural approach plate',
  );
  assert.equal(
    ravineOverlay?.assetPath,
    'assets/expedition/backgrounds/desert-entry-opening-rebuild/desert-entry-ravine-bridge-depth-overlay-2026-06-11.png',
    'retired ravine depth overlay should remain traceable but not visible over the rebuilt raw background',
  );
  assert.equal(ravineOverlay?.alpha, 0);
  assert.ok(existsSync(`public/${ravineOverlay.assetPath}`), 'ravine depth overlay image file should exist on disk');

  [
    'desert-entry-lost-bridge-mummification-transition-apron-1',
    'desert-entry-bridge-mummification-dust-veil-1',
    'desert-entry-bridge-mummification-slope-fill-1',
  ].forEach((id) => {
    const prop = propById(id);
    assert.ok(prop, `${id} should remain available as an editor record`);
    assert.equal(prop.alpha, 0, `${id} should be visually retired from the rebuilt opening route`);
  });
});

test('Desert Entry rebuild includes regenerated route background plates through the Ruined Temple gateway', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const propById = (id) => ROUTED_STORY_PROPS.find(prop => prop.id === id);
  const routeById = (id) => ROUTED_HIDDEN_ROUTES.find(route => route.id === id);
  const queen = getJourneyMiniBosses('Ancient Egypt').find(boss => boss.id === 'scarab-queen');
  const regeneratedBackgroundIds = [
    'desert-entry-mummification-to-mural-background-1',
    'desert-entry-mural-to-scribe-background-1',
    'desert-entry-scribe-to-queen-background-1',
    'desert-entry-queen-to-ruined-gateway-background-1',
  ];
  const routeCheckpoints = [
    { id: 'desert-entry-mummification-to-mural-background-1', targetX: 6400 },
    { id: 'desert-entry-mural-to-scribe-background-1', targetX: 9500 },
    { id: 'desert-entry-scribe-to-queen-background-1', targetX: 13520 },
    { id: 'desert-entry-queen-to-ruined-gateway-background-1', targetX: 16240 },
  ];

  const backgrounds = regeneratedBackgroundIds.map((id) => {
    const prop = propById(id);
    assert.ok(prop, `${id} should exist in routed Desert Entry story props`);
    assert.equal(prop.sectionId, 'desert-entry');
    assert.equal(prop.type, 'image-prop');
    assert.equal(prop.depth, 'background');
    assert.equal(prop.layer, 'background');
    assert.equal(prop.width, 1280);
    assert.equal(prop.height, 768);
    assert.equal(prop.alpha, 1, `${id} should draw at full placement opacity`);
    assert.ok(
      prop.assetPath?.startsWith('assets/expedition/backgrounds/desert-entry-regenerated/'),
      `${id} should load from the regenerated Desert Entry background folder`,
    );
    assert.ok(existsSync(`public/${prop.assetPath}`), `${id} image file should exist on disk`);
    const checkpoint = routeCheckpoints.find(item => item.id === id);
    const cameraX = Math.max(0, checkpoint.targetX - JOURNEY_TEST_VIEWPORT_WIDTH * 0.42);
    const visibilityWidth = Math.max(440, prop.width);
    assert.ok(
      isHorizontallyVisibleForTest(prop.x - visibilityWidth / 2, visibilityWidth, cameraX),
      `${id} should overlap the renderer camera window at x=${checkpoint.targetX}`,
    );
    return prop;
  });

  backgrounds.reduce((previous, current) => {
    assert.ok(previous.x < current.x, `${previous.id} should appear before ${current.id}`);
    return current;
  });

  const scribeRoute = routeById('scribe-locked-chamber-route');
  assert.ok(queen, 'Scarab Queen should exist in routed mini-boss data');
  assert.ok(scribeRoute, 'Scribe route should exist in routed hidden route data');
  assert.ok(
    backgrounds[2].x > scribeRoute.x + scribeRoute.width && backgrounds[2].x < queen.x,
    'Scribe-to-Queen background should sit between the Scribe room and Queen center',
  );
  assert.ok(
    backgrounds[3].x > queen.arenaEnd,
    'Queen-to-gateway background should sit after the Queen arena',
  );
});
