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
import { SCARAB_QUEEN_DRAW_OFFSET_X } from './journeyBossSprites.js';
import journeyPlacementOverrides from './journeyPlacementOverrides.generated.js';
import { journeyComponentSource } from './journeySourceText.test-utils.mjs';

const JOURNEY_TEST_VIEWPORT_WIDTH = 1280;
const journeyBackgroundAssetsSource = readFileSync('src/components/expedition-journey/journeyBackgroundAssets.js', 'utf8');

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

test('Scarab Queen routed placement starts the fight close enough for combat', () => {
  setExpeditionJourneyCiv('Ancient Egypt');
  const scarabQueen = getJourneyMiniBosses('Ancient Egypt').find(boss => boss.id === SCARAB_SEAL_TRIGGER.bossId);

  assert.ok(scarabQueen, 'Scarab Queen should exist in routed mini-boss data');
  const playerWidth = 28;
  const bossIntroPlayerStandoff = 65;
  const arenaStart = scarabQueen.arenaStart ?? scarabQueen.x - 160;
  const arenaEnd = scarabQueen.arenaEnd ?? scarabQueen.x + 180;
  const bossArenaMin = Math.max(arenaStart + 90, scarabQueen.patrolMin);
  const bossArenaMax = Math.max(
    bossArenaMin,
    Math.min(arenaEnd - scarabQueen.width - 24, scarabQueen.patrolMax),
  );
  const bossIntroX = Math.max(
    bossArenaMin,
    Math.min(
      scarabQueen.lairX - SCARAB_QUEEN_DRAW_OFFSET_X - scarabQueen.width / 2,
      bossArenaMax,
    ),
  );
  const bossIntroCenterX = bossIntroX + scarabQueen.width / 2;
  const bossVisualCenterX = bossIntroCenterX + SCARAB_QUEEN_DRAW_OFFSET_X;
  const playerStartX = Math.max(
    arenaStart + 44,
    Math.min(
      bossIntroX - playerWidth - bossIntroPlayerStandoff,
      Math.max(arenaStart + 44, arenaEnd - playerWidth - 44),
    ),
  );
  const openingDistance = Math.abs(bossIntroCenterX - (playerStartX + 14));

  assert.ok(
    openingDistance < 155,
    `Scarab Queen intro distance should begin inside her attack trigger, received ${openingDistance}`,
  );
  assert.ok(
    Math.abs(bossVisualCenterX - scarabQueen.lairX) <= 2,
    `Scarab Queen should emerge from the lair center, received offset ${Math.round(bossVisualCenterX - scarabQueen.lairX)}`,
  );
});

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

test('desert entry opening retires the pasted scarab threshold prop while keeping the Anubis trigger', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const prop = ROUTED_STORY_PROPS.find(item => item.id === 'desert-entry-opening-scarab-threshold-physical-1');

  assert.equal(prop, undefined, 'opening scarab threshold prop should stay deleted so it does not look pasted onto the new panorama');
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-opening-scarab-threshold-physical-1'));
  assert.equal(SCARAB_SEAL_TRIGGER.sectionId, 'desert-entry');
  assert.equal(SCARAB_SEAL_TRIGGER.id, 'scarab-seal-trigger');
});

test('Desert Entry keeps the archived clean physical transition metadata instead of full-screen PNG morphing', () => {
  assert.equal(DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION, 'desert-journey-continuous-panels-2026-06-14-archived');
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
  assert.doesNotMatch(journeyComponentSource, /drawDesertEntryPrimaryBackgroundPlatesFrame/);
  assert.match(journeyComponentSource, /drawDesertJourneyPanelLayerFrame/);
  assert.match(journeyComponentSource, /drawDesertJourneyTransitionMaskFrame/);
  assert.match(journeyComponentSource, /DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_IDS/);
  assert.match(journeyComponentSource, /DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_SEAM_MASKS/);
  assert.doesNotMatch(journeyComponentSource, /desertEntryPrimaryBackgroundPlateIds/);
  assert.match(journeyComponentSource, /desertEntryPrimaryBackgroundPlateSeamMasks/);
  assert.doesNotMatch(journeyComponentSource, /single-plate-camera-pan-primary-png-v3/);
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

  assert.equal(propById('forgotten-mural-climb-structure'), undefined);
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('forgotten-mural-climb-structure'));
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

  [
    ['mummification-chamber-route', 'mummification-chamber-doorway-floor'],
    ['desert-upper-survey-route', 'forgotten-mural-upper-doorway-floor'],
  ].forEach(([routeId, platformId]) => {
    const route = routeById(routeId);
    const platform = platformById(platformId);
    assert.ok(route, `${routeId} should be available through routed Journey data`);
    assert.ok(platform, `${platformId} should be available through routed Journey data`);
    assert.ok(
      route.x < platform.x + platform.width && route.x + route.width > platform.x,
      `${routeId} trigger should overlap the retained ${platformId} route anchor`,
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

  assert.equal(prop, undefined, 'ravine-to-Mummification close doorway art should stay deleted so the panorama carries the approach');
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-ravine-mummification-doorway-transition-1'));
  assert.equal(retiredGateFront, undefined, 'old foreground route-gate front art should be deleted from routed props');
  assert.equal(retiredGateBack, undefined, 'old foreground route-gate back art should be deleted from routed props');
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-route-gate-front-1'));
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-route-gate-back-1'));
  assert.equal(guardianPrepSeal?.suppressRouteGateVisual, true, 'the old abstract gate visual should not sit inside the physical Mummification doorway');
  assert.equal(guardianPrepSeal?.physicalDoorwayPropId, 'desert-entry-ravine-mummification-doorway-transition-1');
  assert.ok(route, 'Mummification hidden route should exist');
  assert.ok(doorwayPlatform, 'Mummification doorway floor should exist');
  assert.ok(
    doorwayPlatform.x >= route.x && doorwayPlatform.x + doorwayPlatform.width <= route.x + route.width,
    'Mummification doorway platform should stay inside the route trigger',
  );
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

  assert.equal(exterior, undefined, 'retired oversized Mummification exterior should stay deleted from routed props');
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-generated-mummification-chamber-entrance-1'));
  assert.equal(doorway, undefined, 'retired Mummification doorway prop should stay deleted from routed props');
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-ravine-mummification-doorway-transition-1'));
  assert.ok(route, 'Mummification room route should exist');

  const climbPlatforms = climbPathIds.map((id) => {
    const platform = platformById(id);
    assert.ok(platform, `${id} should exist as a climbable ledge/platform`);
    assert.equal(platform.invisible, true, `${id} collision should be invisible but aligned to visible art`);
    assert.ok(platform.width >= 150, `${id} should be wide enough to be readable/playable`);
    return platform;
  });

  const doorwayFloor = climbPlatforms.at(-1);
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

test('Desert Entry opening rebuild uses the layered necropolis atlas for arrival, ravine, and temple approach', () => {
  setExpeditionJourneyCiv('Ancient Egypt');

  const propById = (id) => ROUTED_STORY_PROPS.find(prop => prop.id === id);
  const openingPyramid = propById('opening-pyramid-facade-structure');
  const misplacedBridgePyramid = propById('desert-entry-generated-opening-pyramid-facade-1');
  const ravineOverlay = propById('desert-entry-lost-bridge-ravine-floor-deep-1');
  const laterMummificationPlate = propById('desert-entry-mummification-to-mural-background-1');
  const retiredMummificationExterior = propById('desert-entry-generated-mummification-chamber-entrance-1');
  const retiredMuralClimbStructure = propById('forgotten-mural-climb-structure');
  const mummificationDoorway = propById('desert-entry-ravine-mummification-doorway-transition-1');
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
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-arrival-ravine-mummification-panorama-1'));
  assert.doesNotMatch(primaryPlateListSource, /'desert-entry-opening-pyramid-to-ravine-background-1',\s*[\r\n]\s*'desert-entry-ravine-bridge-background-1'/);
  assert.doesNotMatch(journeyComponentSource, /opening-png-to-ravine-png-dust|ravine-png-to-mummification-png-dust|mummification-approach-png-to-arrival-png-pillar/);
  assert.equal(
    openingPyramid,
    undefined,
    'the old generated opening pyramid should stay removed behind the primary background plates',
  );
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('opening-pyramid-facade-structure'));
  assert.equal(propById('desert-entry-arrival-ravine-mummification-panorama-1'), undefined);
  assert.match(journeyBackgroundAssetsSource, /'skyLight'/);
  assert.match(journeyBackgroundAssetsSource, /'farPyramids'/);
  assert.match(journeyBackgroundAssetsSource, /'distantCliffs'/);
  assert.match(journeyBackgroundAssetsSource, /'midNecropolisRuins'/);
  assert.match(journeyBackgroundAssetsSource, /'groundLane'/);
  assert.match(journeyBackgroundAssetsSource, /'foregroundRubble'/);
  assert.match(journeyBackgroundAssetsSource, /'foregroundDepth'/);
  assert.ok(existsSync('public/assets/expedition/backgrounds/desert-entry/desert-entry-necropolis-ground-lane-2026-06-25.png'), 'necropolis playable path image file should exist on disk');
  const wallBackedClimb = propById('desert-entry-opening-wall-backed-climb-1');
  assert.equal(
    wallBackedClimb,
    undefined,
    'the old separate Temple Approach ramp overlay should stay retired behind the flat integrated background',
  );
  assert.ok(
    journeyPlacementOverrides.deletedPropIds.includes('desert-entry-opening-wall-backed-climb-1'),
    'the old separate Temple Approach ramp overlay should remain explicitly deleted',
  );
  assert.equal(
    propById('desert-entry-opening-temple-threshold-shelf-1'),
    undefined,
    'the temple approach should not add a pasted-on support shelf in front of the doorway',
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
    [],
    'the layered necropolis atlas should own the early Desert Entry background instead of a routed panorama prop',
  );
  assert.equal(
    retiredMummificationExterior,
    undefined,
    'the oversized Mummification exterior should stay deleted so it cannot draw over the clean panorama',
  );
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-generated-mummification-chamber-entrance-1'));
  assert.equal(
    retiredMuralClimbStructure,
    undefined,
    'the close Forgotten Mural ruin row should stay deleted until a proper near-doorway approach replaces it',
  );
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('forgotten-mural-climb-structure'));
  assert.equal(
    mummificationDoorway,
    undefined,
    'the close Mummification doorway art should stay deleted because the panorama carries the approach landmark',
  );
  assert.ok(journeyPlacementOverrides.deletedPropIds.includes('desert-entry-ravine-mummification-doorway-transition-1'));
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
  const templeApproachSeal = journeyPlacementOverrides.routeGates.find(gate => gate.id === 'temple-approach-seal');
  const routedTempleApproachSeal = ROUTED_ROUTE_GATES.find(gate => gate.id === 'temple-approach-seal');
  assert.equal(
    templeApproachSeal?.suppressRouteGateVisual,
    true,
    'the first seal should keep its rules but not draw a giant placeholder slab over the necropolis background',
  );
  assert.equal(
    routedTempleApproachSeal?.suppressRouteGateVisual,
    true,
    'route gate override flags should survive into the live routed Journey data',
  );

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
