import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createJourneyPlatformFromPaletteItem,
  createJourneyPlatformPalette,
  createJourneyPlacementChangeSummary,
  getPlatformSurfaceYAtX,
  isLandingOnPlatform,
} from './journeyUtils.js';
import { PLATFORMS } from './journeyLevelData.js';

test('createJourneyPlatformFromPaletteItem creates a room-scoped editable platform', () => {
  const [platformItem] = createJourneyPlatformPalette().filter(item => item.type === 'platform');
  const platform = createJourneyPlatformFromPaletteItem({
    paletteItem: platformItem,
    roomId: 'mummification-chamber',
    x: 180.7,
    y: 402.2,
    existingIds: ['mummification-chamber-platform-1'],
  });

  assert.equal(platform.id, 'mummification-chamber-platform-2');
  assert.equal(platform.sceneId, 'mummification-chamber');
  assert.equal(platform.label, 'editable platform');
  assert.equal(platform.x, 181);
  assert.equal(platform.y, 402);
  assert.equal(platform.width, 192);
  assert.equal(platform.height, 18);
  assert.equal(platform.invisible, true);
});

test('createJourneyPlacementChangeSummary reports added platforms', () => {
  const summary = createJourneyPlacementChangeSummary({
    createdPlatforms: [
      { id: 'desert-entry-platform-1' },
    ],
  });

  assert.equal(summary.hasChanges, true);
  assert.deepEqual(summary.entries.map(entry => entry.label), [
    'Platform desert-entry-platform-1 added',
  ]);
});

test('sloping platforms expose a real walkable landing surface', () => {
  const slope = PLATFORMS.find(platform => platform.id === 'lost-bridge-approach-slope');

  assert.ok(slope, 'expected the ravine bridge approach slope to exist');
  assert.equal(getPlatformSurfaceYAtX(slope, slope.x), slope.slopeStartY);
  assert.equal(getPlatformSurfaceYAtX(slope, slope.x + slope.width), slope.slopeEndY);

  const centerSurfaceY = getPlatformSurfaceYAtX(slope, slope.x + slope.width / 2);
  const player = {
    x: slope.x + slope.width / 2 - 12,
    y: centerSurfaceY - 45,
    width: 24,
    height: 46,
    vy: 120,
  };
  const previousPlayer = {
    ...player,
    y: player.y - 8,
  };

  assert.equal(isLandingOnPlatform(player, previousPlayer, slope), true);
});
