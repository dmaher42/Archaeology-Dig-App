import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  applyJourneyPlacementOverrides,
  mergeJourneyPlacementOverrideExports,
  normalizeJourneyPlacementExportForOverrides,
} from './journeyPlacementOverrides.js';
import {
  PLATFORMS as BASE_PLATFORMS,
  SCARAB_SEAL_TRIGGER,
} from './journeyLevelData.js';
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
import {
  DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION,
  DESERT_JOURNEY_LAYER_ROLES,
  DESERT_JOURNEY_SCENE_PANELS,
  DESERT_JOURNEY_TRANSITION_MASKS,
} from './journeyDesertBackgroundPanels.js';
import journeyPlacementOverrides from './journeyPlacementOverrides.generated.js';
import { journeyComponentSource } from './journeySourceText.test-utils.mjs';

const JOURNEY_TEST_VIEWPORT_WIDTH = 1280;

const readPngInfo = (assetPath) => {
  const buffer = readFileSync(`public/${assetPath}`);
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG', `${assetPath} should be a PNG file`);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer[25],
  };
};

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

test('desert entry first spawn deletes old boot-level grounding overlays', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const groundingProps = ROUTED_STORY_PROPS.filter((prop) => prop.id?.startsWith('desert-entry-asha-grounding-'));
  const retiredGroundingIds = [
    'desert-entry-asha-grounding-rubble-crumbs-1',
    'desert-entry-asha-grounding-tile-chips-1',
    'desert-entry-asha-grounding-boot-dust-1',
    'desert-entry-asha-grounding-foreground-edge-1',
  ];

  assert.equal(groundingProps.length, 0);
  retiredGroundingIds.forEach((id) => {
    assert.ok(journeyPlacementOverrides.deletedPropIds.includes(id), `${id} should stay deleted so the panorama is not covered by prototype sand/detail overlays`);
  });
});

test('desert entry opening has a physical scarab threshold that explains the Anubis trigger', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const prop = ROUTED_STORY_PROPS.find(item => item.id === 'desert-entry-opening-scarab-threshold-physical-1');

  assert.ok(prop, 'opening Anubis trigger should have a visible physical scarab threshold prop');
  assert.equal(prop.sectionId, 'desert-entry');
  assert.equal(prop.type, 'image-prop');
  assert.equal(prop.depth, 'route-edge');
  assert.equal(prop.layer, 'route-edge');
  assert.equal(prop.collidable, false);
  assert.equal(prop.inspectable, true);
  assert.equal(prop.triggerId, SCARAB_SEAL_TRIGGER.id);
  assert.equal(prop.imageAssetKey, 'desertEntryOpeningScarabThresholdPhysical');
  assert.equal(
    prop.assetPath,
    'assets/expedition/environment/egypt-opening/desert-entry-production-2026-06-14/opening-scarab-threshold-2026-06-14.png',
  );
  assert.ok(existsSync(`public/${prop.assetPath}`), 'opening scarab threshold PNG should exist on disk');
  assert.ok(Math.abs(prop.x - SCARAB_SEAL_TRIGGER.x) <= 16, 'visible threshold should align with the actual Anubis trigger');
  assert.ok(prop.width >= 430 && prop.width <= 560, 'threshold should be large enough to read as a trigger object');
  assert.ok(prop.height >= 120 && prop.height <= 190, 'threshold should stay low and not read as a wall');
  assert.ok(prop.y >= 528 && prop.y <= 590, 'threshold should sit on the Desert Entry route surface');
  assert.ok(prop.alpha >= 0.95, 'threshold should render as a real object, not a faint hint');
  assert.equal(prop.sceneRole, 'opening-anubis-threshold');
  assert.equal(prop.transitionPurpose, 'physical-trigger');
  const png = readPngInfo(prop.assetPath);
  assert.equal(png.colorType, 6, 'opening scarab threshold should preserve transparency');
  assert.ok(png.width >= 1200 && png.height >= 800, 'opening scarab threshold should use a high-resolution generated PNG');
});

test('Desert Entry background rebuild uses clean physical transitions instead of full-screen PNG morphing', () => {
  assert.equal(DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION, 'desert-journey-continuous-panels-2026-06-14');
  assert.deepEqual(DESERT_JOURNEY_LAYER_ROLES, ['sky', 'far', 'mid', 'ground', 'foreground']);
  assert.equal(DESERT_JOURNEY_SCENE_PANELS.length, 7);
  assert.equal(DESERT_JOURNEY_TRANSITION_MASKS.length, 6);
  assert.deepEqual(
    DESERT_JOURNEY_SCENE_PANELS.map(panel => panel.id),
    [
      'opening',
      'ravine-bridge',
      'ravine-to-mummification',
      'mummification-arrival',
      'mummification-to-mural',
      'mural-to-scribe',
      'scribe-to-queen-gateway',
    ],
  );
  assert.match(journeyComponentSource, /drawDesertJourneyScenePanelsFrame/);
  assert.match(journeyComponentSource, /drawDesertJourneySceneMasksFrame/);
  assert.match(journeyComponentSource, /drawDesertEntryPrimaryBackgroundPlatesFrame/);
  assert.match(journeyComponentSource, /drawDesertJourneyPanelLayerFrame/);
  assert.match(journeyComponentSource, /drawDesertJourneyTransitionMaskFrame/);
  assert.match(journeyComponentSource, /DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_IDS/);
  assert.match(journeyComponentSource, /DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_SEAM_MASKS/);
  assert.match(journeyComponentSource, /desertEntryPrimaryBackgroundPlateIds/);
  assert.match(journeyComponentSource, /desertEntryPrimaryBackgroundPlateSeamMasks/);
  assert.match(journeyComponentSource, /single-plate-camera-pan-primary-png-v3/);
  assert.match(journeyComponentSource, /DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION/);
  assert.doesNotMatch(journeyComponentSource, /DESERT_ENTRY_PRIMARY_BACKGROUND_CROSSFADE_WIDTH/);
  assert.doesNotMatch(journeyComponentSource, /overlayAlpha/);
  assert.doesNotMatch(journeyComponentSource, /overlayIndex/);
  assert.doesNotMatch(journeyComponentSource, /full-canvas-route-crossfade-primary-png-v2/);
  assert.doesNotMatch(journeyComponentSource, /full-canvas-route-crossfade-background-v1/);
  assert.doesNotMatch(journeyComponentSource, /DESERT_ENTRY_REBUILD_BACKGROUND_CROSSFADE_WIDTH/);
  const templeDoorwayMaskSource = journeyComponentSource.slice(
    journeyComponentSource.indexOf("transition.mask === 'temple-doorway'"),
    journeyComponentSource.indexOf("transition.mask === 'ruined-arch'"),
  );
  assert.doesNotMatch(
    templeDoorwayMaskSource,
    /fillRect\(left,\s*130,\s*w,\s*CANVAS_HEIGHT - 130\)/,
    'temple doorway seam should not paint a broad full-height shadow over the ravine approach',
  );
  assert.doesNotMatch(
    templeDoorwayMaskSource,
    /w \* 0\.62/,
    'temple doorway seam should avoid a half-screen radial shadow wash',
  );
  assert.match(
    templeDoorwayMaskSource,
    /fillRect\(x - 62,\s*304,\s*124,\s*230\)/,
    'temple doorway seam should keep darkness localized inside the actual doorway opening',
  );
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

  assert.equal(propById('scribe-chamber-doorway-structure'), undefined);
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('scribe-chamber-doorway-structure'));
  assert.equal(platformById('scribe-chamber-doorway-threshold')?.x, 10871);
  assert.equal(platformById('scribe-chamber-doorway-threshold')?.y, 297);
});

test('sacred room entry triggers align with their retained route anchors', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const propById = (id) => ROUTED_STORY_PROPS.find(prop => prop.id === id);
  const routeById = (id) => ROUTED_HIDDEN_ROUTES.find(route => route.id === id);
  const platformById = (id) => ROUTED_PLATFORMS.find(platform => platform.id === id);
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
    ['mummification-chamber-route', 'desert-entry-ravine-mummification-doorway-transition-1'],
    ['desert-upper-survey-route', 'forgotten-mural-climb-structure'],
  ].forEach(([routeId, propId]) => {
    const route = routeById(routeId);
    const prop = propById(propId);
    assert.ok(route, `${routeId} should be available through routed Journey data`);
    assert.ok(prop, `${propId} should be available through routed Journey data`);
    assert.ok(
      overlaps(route, generatedBounds(prop)),
      `${routeId} trigger should overlap the visible ${propId} doorway/exterior`,
    );
  });
  const scribeRoute = routeById('scribe-locked-chamber-route');
  const scribePlatform = platformById('scribe-chamber-doorway-threshold');
  assert.ok(scribeRoute, 'scribe-locked-chamber-route should be available through routed Journey data');
  assert.ok(scribePlatform, 'scribe-chamber-doorway-threshold should stay as the physical route anchor');
  assert.ok(
    scribeRoute.x < scribePlatform.x + scribePlatform.width && scribeRoute.x + scribeRoute.width > scribePlatform.x,
    'scribe route trigger should still overlap the retained physical doorway platform',
  );
  assert.equal(propById('scribe-chamber-doorway-structure'), undefined);
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('scribe-chamber-doorway-structure'));
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

test('ravine crossing keeps the Mummification doorway data while retiring its close ruin art', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const prop = ROUTED_STORY_PROPS.find(item => item.id === 'desert-entry-ravine-mummification-doorway-transition-1');
  const retiredGateFront = ROUTED_STORY_PROPS.find(item => item.id === 'desert-entry-route-gate-front-1');
  const retiredGateBack = ROUTED_STORY_PROPS.find(item => item.id === 'desert-entry-route-gate-back-1');
  const guardianPrepSeal = ROUTED_ROUTE_GATES.find(item => item.id === 'guardian-prep-seal');
  const route = ROUTED_HIDDEN_ROUTES.find(item => item.id === 'mummification-chamber-route');
  const doorwayPlatform = ROUTED_PLATFORMS.find(item => item.id === 'mummification-chamber-doorway-floor');

  assert.ok(prop, 'ravine-to-Mummification handoff should keep the enterable doorway prop data');
  assert.equal(retiredGateFront, undefined, 'old foreground route-gate front art should be deleted from routed props');
  assert.equal(retiredGateBack, undefined, 'old foreground route-gate back art should be deleted from routed props');
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-route-gate-front-1'));
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-route-gate-back-1'));
  assert.equal(guardianPrepSeal?.suppressRouteGateVisual, true, 'the old abstract gate visual should not sit inside the physical Mummification doorway');
  assert.equal(guardianPrepSeal?.physicalDoorwayPropId, prop.id, 'the progression gate should be visually represented by the physical doorway prop');
  assert.ok(route, 'Mummification hidden route should exist');
  assert.ok(doorwayPlatform, 'Mummification doorway floor should exist');
  assert.equal(prop.sectionId, 'desert-entry');
  assert.equal(prop.type, 'image-prop');
  assert.equal(prop.depth, 'route-edge');
  assert.equal(prop.layer, 'route-edge');
  assert.equal(prop.collidable, false);
  assert.equal(prop.inspectable, true);
  assert.equal(prop.hiddenRouteId, 'mummification-chamber-route');
  assert.equal(prop.entryPlatformId, 'mummification-chamber-doorway-floor');
  assert.equal(prop.transitionPurpose, 'doorway-clean-cut');
  assert.equal(prop.sceneRole, 'ravine-to-mummification-entry');
  assert.equal(prop.imageAssetKey, 'desertEntryRavineMummificationDoorwayTransition');
  assert.equal(
    prop.assetPath,
    'assets/expedition/environment/egypt-opening/desert-entry-production-2026-06-14/ravine-mummification-doorway-clear-entry-no-shadow-2026-06-16.png',
  );
  assert.ok(prop.assetPath.includes('clear-entry'), 'doorway should use the cleaned transparent-entry PNG');
  assert.ok(prop.assetPath.includes('no-shadow'), 'doorway should use the no-shadow transparent-entry PNG');
  assert.equal(prop.assetPath.includes('deep-shadow'), false, 'doorway should not use the old baked black-shadow PNG');
  assert.ok(existsSync(`public/${prop.assetPath}`), 'ravine-to-Mummification doorway PNG should exist on disk');
  assert.ok(prop.x > route.x && prop.x < route.x + route.width, 'doorway should sit inside the Mummification route trigger');
  assert.ok(
    guardianPrepSeal.x > prop.x - prop.width / 2 && guardianPrepSeal.x < prop.x + prop.width / 2,
    'the old progression gate logic should remain covered by the physical doorway art',
  );
  assert.ok(prop.x > doorwayPlatform.x && prop.x < doorwayPlatform.x + doorwayPlatform.width, 'doorway art should align with the actual entry platform');
  assert.ok(prop.width >= 700 && prop.width <= 860, 'doorway should be large enough to read as enterable without casting across the ravine view');
  assert.ok(prop.height >= 560 && prop.height <= 700, 'doorway should cover the entry cleanly without becoming a giant black wall');
  assert.ok(prop.y >= 590 && prop.y <= 625, 'doorway base should sit on the desert route surface');
  assert.equal(prop.shadowOpacity, 0, 'doorway prop should not add an artificial black contact shadow over the ravine');
  assert.equal(prop.shadowWidth, 0, 'doorway prop should not carry a wide artificial shadow layer');
  assert.equal(prop.shadowHeight, 0, 'doorway prop should not carry a tall artificial shadow layer');
  assert.equal(prop.alpha, 0, 'doorway art should be visually retired with the close ruin row');
  const png = readPngInfo(prop.assetPath);
  assert.equal(png.colorType, 6, 'ravine-to-Mummification doorway should preserve transparency');
  assert.ok(png.width >= 1200 && png.height >= 1000, 'ravine-to-Mummification doorway should use a high-resolution generated PNG');
});

test('Mummification approach reads as a near climbable structure with a doorway ledge', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const propById = (id) => ROUTED_STORY_PROPS.find(prop => prop.id === id);
  const platformById = (id) => ROUTED_PLATFORMS.find(platform => platform.id === id);
  const route = ROUTED_HIDDEN_ROUTES.find(item => item.id === 'mummification-chamber-route');
  const exterior = propById('desert-entry-generated-mummification-chamber-entrance-1');
  const doorway = propById('desert-entry-ravine-mummification-doorway-transition-1');
  const climbPathIds = [
    'mummification-chamber-bottom-secret-threshold',
    'mummification-chamber-sand-buried-block',
    'mummification-chamber-left-lower-terrace',
    'mummification-chamber-central-drop-slab',
    'mummification-chamber-carved-lower-ledge',
    'mummification-chamber-upper-rite-ledge',
    'mummification-chamber-doorway-floor',
  ];

  assert.ok(exterior, 'retired oversized Mummification exterior should remain routed for editor history');
  assert.ok(doorway, 'Mummification doorway prop should be routed');
  assert.ok(route, 'Mummification room route should exist');
  assert.equal(exterior.depth, 'route-edge');
  assert.equal(exterior.layer, 'route-edge');
  assert.equal(exterior.alpha, 0, 'oversized generated exterior should be visually retired so it does not draw a ruin row behind the doorway');
  assert.ok(exterior.width >= 1400, 'retired structure should preserve editor sizing history');
  assert.ok(doorway.width >= 700, 'physical doorway should be large enough to read beside Asha');
  assert.ok(doorway.x >= route.x && doorway.x <= route.x + route.width, 'physical doorway should overlap the room route trigger');
  assert.equal(doorway.entryPlatformId, 'mummification-chamber-doorway-floor');
  assert.equal(doorway.hiddenRouteId, route.id);

  const climbPlatforms = climbPathIds.map((id) => {
    const platform = platformById(id);
    assert.ok(platform, `${id} should exist as a climbable ledge/platform`);
    assert.equal(platform.invisible, true, `${id} collision should be invisible but aligned to visible art`);
    assert.ok(platform.width >= 150, `${id} should be wide enough to be readable/playable`);
    return platform;
  });

  const doorwayFloor = climbPlatforms.at(-1);
  assert.ok(
    doorway.x >= doorwayFloor.x && doorway.x <= doorwayFloor.x + doorwayFloor.width,
    'doorway visual should sit over the final climbable doorway ledge',
  );
  assert.ok(
    route.x <= doorwayFloor.x && doorwayFloor.x + doorwayFloor.width <= route.x + route.width,
    'room route should contain the final doorway ledge horizontally',
  );
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

test('Desert Entry rebuild keeps walkable ground continuous while old scenery overlays stay deleted', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const propById = (id) => ROUTED_STORY_PROPS.find(prop => prop.id === id);
  const platformById = (id) => ROUTED_PLATFORMS.find(platform => platform.id === id);
  const featureById = (id) => ROUTED_STAGE_ENTRANCE_FEATURES.find(feature => feature.id === id);
  const queen = getJourneyMiniBosses('Ancient Egypt').find(boss => boss.id === 'scarab-queen');
  const ruinedTempleGate = featureById('ruined-temple-colossus-gate');
  const desertFloorBeforeRavine = platformById('desert-entry-floor-opening');
  const desertFloorAfterRavine = platformById('desert-entry-floor-after-ravine');

  assert.ok(queen, 'Scarab Queen should exist in routed mini-boss data');
  assert.ok(ruinedTempleGate, 'Ruined Temple gateway should exist in routed stage entrance data');
  assert.ok(desertFloorBeforeRavine, 'Desert Entry floor should exist before the ravine in routed platform data');
  assert.ok(desertFloorAfterRavine, 'Desert Entry floor should resume after the ravine in routed platform data');
  assert.ok(
    desertFloorBeforeRavine.x + desertFloorBeforeRavine.width < desertFloorAfterRavine.x,
    'Desert Entry floor should leave a real non-walkable ravine gap under the bridge',
  );
  assert.ok(
    desertFloorAfterRavine.x + desertFloorAfterRavine.width >= ruinedTempleGate.x,
    'Desert Entry floor should remain walkable after the ravine through the Ruined Temple gateway center',
  );
  assert.ok(
    journeyPlacementOverrides.deletedPropIds.includes('desert-entry-scribe-queen-record-road-1'),
    'old record-road scenery should stay deleted so the panorama remains coherent',
  );
  assert.ok(
    journeyPlacementOverrides.deletedPropIds.includes('desert-entry-queen-arena-dust-veil-1'),
    'old Queen arena dust veil should stay deleted so the panorama remains coherent',
  );
  assert.ok(
    journeyPlacementOverrides.deletedPropIds.includes('scribe-chamber-doorway-structure'),
    'old scribe exterior structure should stay deleted so the panorama remains coherent',
  );
  [
    'desert-entry-desert-seal-jackal-left-1',
    'desert-entry-desert-seal-return-stone-1',
    'desert-entry-desert-seal-glyph-panel-1',
    'desert-entry-desert-seal-jackal-right-1',
  ].forEach((id) => {
    assert.equal(propById(id), undefined, `${id} should not render as old seal scenery`);
    assert.ok(journeyPlacementOverrides.deletedPropIds.includes(id), `${id} should stay recorded as deleted`);
  });
  [
    'desert-entry-mural-scribe-record-wall-1',
    'desert-entry-seal-gateway-collapsed-road-1',
    'desert-entry-ruined-temple-gateway-dust-motes-1',
  ].forEach((id) => {
    assert.equal(propById(id), undefined, `${id} should be deleted with the obsolete midground ruin dressing`);
    assert.ok(journeyPlacementOverrides.deletedPropIds.includes(id), `${id} should stay recorded as deleted`);
  });
});

test('Desert Entry opening rebuild carries arrival, scarab seal, ravine, and Mummification doorway in one clean panorama', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const propById = (id) => ROUTED_STORY_PROPS.find(prop => prop.id === id);
  const openingPyramid = propById('opening-pyramid-facade-structure');
  const misplacedBridgePyramid = propById('desert-entry-generated-opening-pyramid-facade-1');
  const ravineOverlay = propById('desert-entry-lost-bridge-ravine-floor-deep-1');
  const laterMummificationPlate = propById('desert-entry-mummification-to-mural-background-1');
  const retiredMummificationExterior = propById('desert-entry-generated-mummification-chamber-entrance-1');
  const retiredMuralClimbStructure = propById('forgotten-mural-climb-structure');
  const mummificationDoorway = propById('desert-entry-ravine-mummification-doorway-transition-1');
  const panorama = propById('desert-entry-arrival-ravine-mummification-panorama-1');
  const retiredOpeningPlateIds = [
    'desert-entry-opening-pyramid-to-ravine-background-1',
    'desert-entry-ravine-bridge-background-1',
    'desert-entry-ravine-to-mummification-background-1',
    'desert-entry-mummification-exterior-arrival-background-1',
    'desert-entry-mummification-to-mural-background-1',
    'desert-entry-mural-to-scribe-background-1',
    'desert-entry-scribe-to-queen-background-1',
    'desert-entry-queen-to-ruined-gateway-background-1',
  ];
  const retiredEarlyBackgroundDressingIds = [
    'opening-rubble-left',
    'desert-entry-premium-carved-stone-edge-1',
    'desert-entry-premium-carved-stone-edge-2',
    'desert-entry-premium-carved-stone-edge-4',
    'desert-entry-premium-broken-masonry-footing-1',
    'desert-entry-cracked-stone-blocks-2',
    'desert-entry-desert-entry-relief-wall-fragment-1',
    'desert-entry-opening-pyramid-cracked-block-2',
    'desert-entry-opening-pyramid-cracked-block-2-copy-1',
    'desert-entry-opening-pyramid-cracked-block-2-copy-1-copy-1',
    'desert-entry-opening-pyramid-cracked-block-2-copy-2',
    'desert-entry-mummification-mural-record-wall-1',
    'desert-entry-mummification-mural-buried-causeway-1',
    'desert-entry-mummification-mural-sand-wisp-1',
    'desert-entry-mural-threshold-rubble-1',
    'desert-entry-mural-scribe-record-wall-1',
    'desert-entry-mural-scribe-causeway-slab-1',
    'desert-entry-scribe-threshold-rubble-1',
    'desert-entry-scribe-queen-causeway-slab-1',
    'desert-entry-scribe-queen-buried-column-1',
    'desert-entry-queen-arena-rubble-ring-1',
    'desert-entry-queen-arena-left-warning-column-1',
    'desert-entry-queen-arena-right-warning-column-1',
    'desert-entry-desert-seal-gate-back-1',
    'desert-entry-desert-seal-gate-front-1',
    'desert-entry-seal-gateway-collapsed-road-1',
    'desert-entry-seal-gateway-broken-endcap-1',
    'desert-entry-ruined-temple-gateway-collapsed-arch-1',
    'desert-entry-ruined-temple-gateway-rubble-1',
    'desert-entry-ruined-temple-gateway-dust-motes-1',
    'desert-entry-route-gate-front-1',
    'desert-entry-route-gate-back-1',
    'desert-entry-lost-bridge-mummification-transition-apron-1',
    'desert-entry-bridge-mummification-dust-veil-1',
    'desert-entry-bridge-mummification-span-left-1',
    'desert-entry-bridge-mummification-span-right-1',
    'desert-entry-bridge-mummification-broken-left-cap-1',
    'desert-entry-bridge-mummification-slope-fill-1',
    'desert-entry-bridge-mummification-threshold-shelf-1',
    'desert-entry-bridge-mummification-seam-support-pier-1',
    'desert-entry-broken-shrine-pieces-1',
  ];

  assert.match(
    journeyComponentSource,
    /const DESERT_ENTRY_RESTORE_ORIGINAL_BACKDROP = false;/,
    'the temporary original-backdrop restore switch should be off so the continuous route can render',
  );
  const primaryPlateListSource = journeyComponentSource.slice(
    journeyComponentSource.indexOf('const DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_IDS'),
    journeyComponentSource.indexOf('const DESERT_ENTRY_RETIRED_BACKGROUND_PROP_IDS'),
  );
  assert.match(journeyComponentSource, /'desert-entry-arrival-ravine-mummification-panorama-1'/);
  assert.doesNotMatch(primaryPlateListSource, /'desert-entry-opening-pyramid-to-ravine-background-1',\s*[\r\n]\s*'desert-entry-ravine-bridge-background-1'/);
  assert.doesNotMatch(journeyComponentSource, /opening-png-to-ravine-png-dust|ravine-png-to-mummification-png-dust|mummification-approach-png-to-arrival-png-pillar/);
  assert.equal(
    openingPyramid,
    undefined,
    'the old generated opening pyramid should stay removed behind the primary background plates',
  );
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('opening-pyramid-facade-structure'));
  assert.ok(panorama, 'the clean panoramic Desert Entry background should exist in routed story props');
  assert.equal(panorama.sectionId, 'desert-entry');
  assert.equal(panorama.type, 'image-prop');
  assert.equal(panorama.depth, 'background');
  assert.equal(panorama.layer, 'background');
  assert.equal(panorama.width, 2172);
  assert.equal(panorama.height, 724);
  assert.equal(panorama.alpha, 1, 'the clean panorama should be the visible early route background');
  assert.equal(panorama.colorGradeFilter, 'none', 'the approved panorama should not be flattened by the old beige color grade');
  assert.equal(panorama.panoramaCropBias, 0.24, 'the opening camera should frame the canyon depth of the clean panorama');
  assert.equal(panorama.brightness, 1);
  assert.equal(panorama.x, 3300);
  assert.equal(
    panorama.assetPath,
    'assets/expedition/backgrounds/desert-entry-opening-rebuild/desert-entry-clean-canyon-panorama-2026-06-18.png',
  );
  assert.ok(existsSync(`public/${panorama.assetPath}`), 'clean panorama image file should exist on disk');
  assert.ok(
    isHorizontallyVisibleForTest(panorama.x - panorama.width / 2, panorama.width, Math.max(0, 3100 - JOURNEY_TEST_VIEWPORT_WIDTH * 0.42)),
    'the clean panorama should cover the ravine/scarab route camera window',
  );
  retiredOpeningPlateIds.forEach((id) => {
    const prop = propById(id);
    assert.equal(
      journeyPlacementOverrides.deletedPropIds.includes(id),
      true,
      `${id} should be deleted from routed story props so old background plates cannot return`,
    );
    assert.equal(
      prop,
      undefined,
      `${id} should not remain in routed Desert Entry story props`,
    );
  });
  retiredEarlyBackgroundDressingIds.forEach((id) => {
    const prop = propById(id);
    assert.ok(journeyPlacementOverrides.deletedPropIds.includes(id), `${id} should be recorded as deleted`);
    assert.equal(
      prop,
      undefined,
      `${id} should be removed so the early route background is carried by the clean panorama only`,
    );
  });
  assert.deepEqual(
    ROUTED_STORY_PROPS
      .filter(prop => (
        prop.sectionId === 'desert-entry'
        && Number.isFinite(prop.x)
        && prop.x <= 7000
        && (prop.alpha ?? 1) > 0
        && (prop.depth === 'background' || prop.depth === 'midground' || prop.layer === 'background')
      ))
      .map(prop => prop.id),
    ['desert-entry-arrival-ravine-mummification-panorama-1'],
    'the clean panorama should be the only visible early Desert Entry background/midground layer',
  );
  assert.ok(retiredMummificationExterior, 'the oversized Mummification exterior should remain traceable for editor history');
  assert.equal(retiredMummificationExterior.type, 'generated-mummification-chamber-entrance');
  assert.equal(retiredMummificationExterior.depth, 'route-edge');
  assert.equal(retiredMummificationExterior.layer, 'route-edge');
  assert.equal(retiredMummificationExterior.alpha, 0, 'the oversized generated exterior should be visually retired so only the physical doorway reads as the room landmark');
  assert.ok(retiredMuralClimbStructure, 'the retired Forgotten Mural climb structure should remain traceable for editor history');
  assert.equal(
    retiredMuralClimbStructure.alpha,
    0,
    'the close Forgotten Mural ruin row should stay visually retired until a proper near-doorway approach replaces it',
  );
  assert.ok(mummificationDoorway, 'the Mummification approach should keep the physical doorway data for routing');
  assert.equal(mummificationDoorway.type, 'image-prop');
  assert.equal(mummificationDoorway.depth, 'route-edge');
  assert.equal(mummificationDoorway.layer, 'route-edge');
  assert.equal(
    mummificationDoorway.alpha,
    0,
    'the physical Mummification doorway art should be visually retired with the marked close ruins',
  );
  assert.equal(
    misplacedBridgePyramid,
    undefined,
    'the duplicate pyramid facade should not sit in the ravine/Mummification handoff',
  );

  assert.ok(
    journeyPlacementOverrides.deletedPropIds.includes('desert-entry-mummification-to-mural-background-1'),
    'retired Mummification-to-Mural background should be recorded as deleted',
  );
  assert.equal(
    laterMummificationPlate,
    undefined,
    'the busy Mummification-to-Mural background plate should be removed so close background ruins do not draw',
  );
  assert.equal(
    ravineOverlay,
    undefined,
    'retired ravine depth overlay should stay removed from routed editor props',
  );
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-lost-bridge-ravine-floor-deep-1'));

});

test('Desert Entry rebuild deletes regenerated route background plates through the Ruined Temple gateway', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const propById = (id) => ROUTED_STORY_PROPS.find(prop => prop.id === id);
  const routeById = (id) => ROUTED_HIDDEN_ROUTES.find(route => route.id === id);
  const queen = getJourneyMiniBosses('Ancient Egypt').find(boss => boss.id === 'scarab-queen');
  const regeneratedBackgroundIds = [
    'desert-entry-mural-to-scribe-background-1',
    'desert-entry-scribe-to-queen-background-1',
    'desert-entry-queen-to-ruined-gateway-background-1',
  ];
  assert.ok(
    journeyPlacementOverrides.deletedPropIds.includes('desert-entry-mummification-to-mural-background-1'),
    'retired close-ruin mural approach background should be deleted from routed props',
  );
  assert.equal(propById('desert-entry-mummification-to-mural-background-1'), undefined);

  regeneratedBackgroundIds.forEach((id) => {
    assert.equal(propById(id), undefined, `${id} should be deleted from routed Desert Entry story props`);
    assert.ok(journeyPlacementOverrides.deletedPropIds.includes(id), `${id} should stay recorded as deleted`);
  });

  const scribeRoute = routeById('scribe-locked-chamber-route');
  assert.ok(queen, 'Scarab Queen should exist in routed mini-boss data');
  assert.ok(scribeRoute, 'Scribe route should exist in routed hidden route data');
});
