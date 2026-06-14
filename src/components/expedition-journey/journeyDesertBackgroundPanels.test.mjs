import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { scaleJourneyX } from './journeyConstants.js';

const moduleUrl = new URL('./journeyDesertBackgroundPanels.js', import.meta.url);

test('continuous Desert Entry background panels define the full left-to-right journey spine', async () => {
  assert.ok(existsSync(moduleUrl), 'journeyDesertBackgroundPanels.js should exist as the canonical Desert Entry background contract');

  const {
    DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION,
    DESERT_JOURNEY_LAYER_ROLES,
    DESERT_JOURNEY_SCENE_PANELS,
    DESERT_JOURNEY_TRANSITION_MASKS,
    getDesertJourneyPanelsForViewport,
    getDesertJourneyTransitionMasksForViewport,
  } = await import(moduleUrl.href);

  assert.equal(DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION, 'desert-journey-continuous-panels-2026-06-14');
  assert.deepEqual(DESERT_JOURNEY_LAYER_ROLES, ['sky', 'far', 'mid', 'ground', 'foreground']);
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

  DESERT_JOURNEY_SCENE_PANELS.forEach((panel, index, panels) => {
    assert.equal(panel.paletteId, 'golden-egypt-desert', `${panel.id} should use the shared palette`);
    assert.equal(panel.lightDirection, 'upper-left', `${panel.id} should keep the same lighting direction`);
    assert.equal(panel.cameraAngle, 'side-on-2d', `${panel.id} should keep the same side-on camera angle`);
    assert.equal(panel.style, 'semi-realistic-egyptian-ruins', `${panel.id} should keep the same ruin style`);
    assert.equal(panel.horizonY, 252, `${panel.id} should keep the horizon aligned`);
    assert.equal(panel.groundY, 595, `${panel.id} should keep the walkable ground line aligned`);
    assert.ok(panel.worldEnd > panel.worldStart, `${panel.id} should have positive world span`);
    assert.deepEqual(panel.layers.map(layer => layer.role), DESERT_JOURNEY_LAYER_ROLES, `${panel.id} should expose every required visual layer`);
    assert.deepEqual(panel.layers.map(layer => layer.parallax), [0, 0.06, 0.18, 0.42, 0.78], `${panel.id} should use ordered multiplane parallax`);
    assert.doesNotMatch(JSON.stringify(panel), /collision|platformId|walkablePlatform/i, `${panel.id} should not redefine gameplay collision`);
    if (index > 0) {
      assert.equal(panel.worldStart, panels[index - 1].worldEnd, `${panel.id} should start exactly where the previous scene ends`);
    }
  });

  assert.equal(DESERT_JOURNEY_SCENE_PANELS[0].worldStart, 0);
  assert.equal(DESERT_JOURNEY_SCENE_PANELS.at(-1).worldEnd, scaleJourneyX(2360));

  assert.equal(DESERT_JOURNEY_TRANSITION_MASKS.length, DESERT_JOURNEY_SCENE_PANELS.length - 1);
  DESERT_JOURNEY_TRANSITION_MASKS.forEach((transition, index) => {
    const from = DESERT_JOURNEY_SCENE_PANELS[index];
    const to = DESERT_JOURNEY_SCENE_PANELS[index + 1];
    assert.equal(transition.from, from.id, `${transition.id} should start from ${from.id}`);
    assert.equal(transition.to, to.id, `${transition.id} should lead to ${to.id}`);
    assert.equal(transition.worldX, from.worldEnd, `${transition.id} should sit on the panel boundary`);
    assert.ok(['dust-haze', 'cliff-wall', 'broken-pillar', 'ruined-arch', 'temple-doorway', 'shadowed-corridor', 'sandstorm-overlay'].includes(transition.mask));
    assert.ok(transition.width >= 420, `${transition.id} should be wide enough to hide the seam naturally`);
  });

  const ravine = DESERT_JOURNEY_SCENE_PANELS.find(panel => panel.id === 'ravine-bridge');
  assert.equal(ravine.ravineBridge.deepGap, true);
  assert.equal(ravine.ravineBridge.bridgeOnlySafeCrossing, true);
  assert.equal(ravine.ravineBridge.darkCenterBelowBridge, true);
  assert.equal(ravine.ravineBridge.falsePlayableLedges, false);

  assert.deepEqual(
    getDesertJourneyPanelsForViewport(0, 1120).map(panel => panel.id),
    ['opening'],
  );
  assert.ok(
    getDesertJourneyPanelsForViewport(3350, 1120).some(panel => panel.id === 'ravine-bridge'),
    'ravine bridge panel should be active around the bridge camera window',
  );
  assert.ok(
    getDesertJourneyTransitionMasksForViewport(scaleJourneyX(1030), 1120).some(transition => transition.mask === 'temple-doorway'),
    'Mummification arrival should expose a doorway mask in the active camera window',
  );
});
