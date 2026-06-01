import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyJourneyTrapPlacementEdit,
  createJourneyTrapFromPaletteItem,
  createJourneyTrapPalette,
  getJourneyTrapTriggerRect,
  normalizeJourneyTrap,
  updateJourneyTrapRuntime,
} from './journeyTraps.js';

test('normalizeJourneyTrap preserves reusable trap fields and defaults trigger area', () => {
  const trap = normalizeJourneyTrap({
    id: 'floor-a',
    sectionId: 'desert-entry',
    type: 'collapsing-stone-floor',
    x: 100,
    y: 420,
    width: 96,
    height: 24,
    damage: 7,
    reset: true,
    cooldown: 2.4,
    depth: 'foreground',
    linkedObjectIds: ['lower-passage'],
    editorVisible: false,
  });

  assert.equal(trap.id, 'floor-a');
  assert.equal(trap.roomId, 'desert-entry');
  assert.equal(trap.type, 'collapsing-stone-floor');
  assert.deepEqual(trap.triggerArea, { x: 0, y: 0, width: 96, height: 24 });
  assert.equal(trap.damage, 7);
  assert.equal(trap.reset, true);
  assert.equal(trap.cooldown, 2.4);
  assert.equal(trap.depth, 'foreground');
  assert.deepEqual(trap.linkedObjectIds, ['lower-passage']);
  assert.equal(trap.editorVisible, false);
});

test('getJourneyTrapTriggerRect converts relative trigger area to world coordinates', () => {
  const trigger = getJourneyTrapTriggerRect({
    x: 300,
    y: 410,
    width: 120,
    height: 30,
    triggerArea: { x: 12, y: -18, width: 88, height: 22 },
  });

  assert.deepEqual(trigger, { x: 312, y: 392, width: 88, height: 22 });
});

test('applyJourneyTrapPlacementEdit updates type, size, trigger area, damage, cooldown, and dart direction', () => {
  const trap = applyJourneyTrapPlacementEdit(
    { id: 'dart-a', type: 'hidden-sand-pit', x: 10, y: 20, width: 50, height: 16 },
    {
      type: 'dart-launcher',
      width: 96,
      height: 20,
      triggerArea: { x: -32, y: 0, width: 64, height: 18 },
      damage: 9,
      reset: true,
      cooldown: 1.75,
      depth: 'midground',
      linkedObjectIds: ['door-a', 'passage-b'],
      editorVisible: true,
      direction: 'left',
      launcherX: 412,
      launcherY: 286,
    },
  );

  assert.equal(trap.type, 'dart-launcher');
  assert.equal(trap.width, 96);
  assert.equal(trap.height, 20);
  assert.deepEqual(trap.triggerArea, { x: -32, y: 0, width: 64, height: 18 });
  assert.equal(trap.damage, 9);
  assert.equal(trap.reset, true);
  assert.equal(trap.cooldown, 1.75);
  assert.equal(trap.depth, 'midground');
  assert.deepEqual(trap.linkedObjectIds, ['door-a', 'passage-b']);
  assert.equal(trap.editorVisible, true);
  assert.equal(trap.direction, 'left');
  assert.equal(trap.launcherX, 412);
  assert.equal(trap.launcherY, 286);
});

test('createJourneyTrapFromPaletteItem creates a room-scoped editable trap', () => {
  const [floorItem] = createJourneyTrapPalette().filter(item => item.type === 'collapsing-stone-floor');
  const trap = createJourneyTrapFromPaletteItem({
    paletteItem: floorItem,
    roomId: 'mummification-chamber',
    x: 180.7,
    y: 402.2,
    existingIds: ['mummification-chamber-collapsing-stone-floor-1'],
  });

  assert.equal(trap.id, 'mummification-chamber-collapsing-stone-floor-2');
  assert.equal(trap.sceneId, 'mummification-chamber');
  assert.equal(trap.type, 'collapsing-stone-floor');
  assert.equal(trap.x, 181);
  assert.equal(trap.y, 402);
  assert.ok(trap.width > 0);
  assert.ok(trap.height > 0);
  assert.deepEqual(trap.triggerArea, { x: 0, y: 0, width: trap.width, height: trap.height });
});

test('updateJourneyTrapRuntime collapses non-resetting floors and fires darts on cooldown', () => {
  const floorRuntime = {};
  const floorTrap = normalizeJourneyTrap({
    id: 'floor-a',
    type: 'collapsing-stone-floor',
    x: 100,
    y: 420,
    width: 96,
    height: 24,
    reset: false,
  });

  let floorResult = updateJourneyTrapRuntime({
    trap: floorTrap,
    runtime: floorRuntime,
    triggered: true,
    dt: 0.1,
  });
  assert.equal(floorResult.phase, 'shaking');
  assert.equal(floorResult.collidable, true);

  floorResult = updateJourneyTrapRuntime({
    trap: floorTrap,
    runtime: floorRuntime,
    triggered: false,
    dt: 0.55,
  });
  assert.equal(floorResult.phase, 'collapsed');
  assert.equal(floorResult.collidable, false);

  const dartRuntime = {};
  const dartTrap = normalizeJourneyTrap({
    id: 'dart-a',
    type: 'dart-launcher',
    x: 500,
    y: 430,
    width: 64,
    height: 18,
    direction: 'right',
    launcherX: 480,
    launcherY: 360,
    cooldown: 1.2,
  });

  const dartResult = updateJourneyTrapRuntime({
    trap: dartTrap,
    runtime: dartRuntime,
    triggered: true,
    dt: 0.1,
  });
  assert.equal(dartResult.phase, 'armed');
  assert.equal(dartResult.projectile?.trapId, 'dart-a');
  assert.equal(dartResult.projectile.direction, 'right');

  const coolingResult = updateJourneyTrapRuntime({
    trap: dartTrap,
    runtime: dartRuntime,
    triggered: true,
    dt: 0.1,
  });
  assert.equal(coolingResult.projectile, null);
});
