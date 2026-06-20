import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { scaleJourneyX } from './journeyConstants.js';

const moduleUrl = new URL('./journeyDesertBackgroundPanels.js', import.meta.url);

test('Desert Entry keeps old panel metadata but does not use procedural panels as runtime art', async () => {
  assert.ok(existsSync(moduleUrl), 'journeyDesertBackgroundPanels.js should keep the archived panel contract');

  const {
    DESERT_ENTRY_PROCEDURAL_PANEL_FALLBACK_ENABLED,
    DESERT_ENTRY_STORY_LOCKED_RECOVERY_VERSION,
    DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION,
    DESERT_JOURNEY_LAYER_ROLES,
    DESERT_JOURNEY_SCENE_PANELS,
    DESERT_JOURNEY_TRANSITION_MASKS,
    getDesertJourneyPanelsForViewport,
    getDesertJourneyTransitionMasksForViewport,
  } = await import(moduleUrl.href);

  assert.equal(DESERT_ENTRY_STORY_LOCKED_RECOVERY_VERSION, 'desert-entry-story-locked-recovery-2026-06-19');
  assert.equal(DESERT_ENTRY_PROCEDURAL_PANEL_FALLBACK_ENABLED, false);
  assert.equal(DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION, 'desert-journey-continuous-panels-2026-06-14-archived');
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
    assert.equal(panel.paletteId, 'golden-egypt-desert', `${panel.id} should keep the shared palette metadata`);
    assert.equal(panel.lightDirection, 'upper-left', `${panel.id} should keep the same lighting metadata`);
    assert.equal(panel.cameraAngle, 'side-on-2d', `${panel.id} should keep the same camera metadata`);
    assert.equal(panel.style, 'semi-realistic-egyptian-ruins', `${panel.id} should keep the old style metadata`);
    assert.equal(panel.horizonY, 252, `${panel.id} should keep the recorded horizon`);
    assert.equal(panel.groundY, 595, `${panel.id} should keep the recorded ground line`);
    assert.ok(panel.worldEnd > panel.worldStart, `${panel.id} should have positive world span`);
    assert.deepEqual(panel.layers.map(layer => layer.role), DESERT_JOURNEY_LAYER_ROLES);
    assert.doesNotMatch(JSON.stringify(panel), /"[^"]*(collision|platform|walkable)[^"]*"\s*:/i);
    if (index > 0) assert.equal(panel.worldStart, panels[index - 1].worldEnd);
  });

  assert.equal(DESERT_JOURNEY_SCENE_PANELS[0].worldStart, 0);
  assert.equal(DESERT_JOURNEY_SCENE_PANELS.at(-1).worldEnd, scaleJourneyX(2360));
  assert.equal(DESERT_JOURNEY_TRANSITION_MASKS.length, DESERT_JOURNEY_SCENE_PANELS.length - 1);

  const archivedTransitionMasks = new Set([
    'dust-haze',
    'cliff-wall',
    'broken-pillar',
    'ruined-arch',
    'temple-doorway',
    'shadowed-corridor',
    'sandstorm-overlay',
  ]);

  DESERT_JOURNEY_TRANSITION_MASKS.forEach((transition, index) => {
    const currentPanel = DESERT_JOURNEY_SCENE_PANELS[index];
    const nextPanel = DESERT_JOURNEY_SCENE_PANELS[index + 1];

    assert.equal(transition.from, currentPanel.id, `${transition.id} should start from its current panel`);
    assert.equal(transition.to, nextPanel.id, `${transition.id} should end at the next panel`);
    assert.equal(transition.worldX, currentPanel.worldEnd, `${transition.id} should sit at the panel seam`);
    assert.ok(archivedTransitionMasks.has(transition.mask), `${transition.id} should use an archived mask name`);
    assert.ok(transition.width >= 420, `${transition.id} should keep enough width to hide its seam`);
  });

  assert.deepEqual(getDesertJourneyPanelsForViewport(0, 1120), []);
  assert.deepEqual(getDesertJourneyPanelsForViewport(3350, 1120), []);
  assert.deepEqual(getDesertJourneyTransitionMasksForViewport(scaleJourneyX(1030), 1120), []);
});
