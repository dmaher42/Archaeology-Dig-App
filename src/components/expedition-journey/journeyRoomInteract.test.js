import assert from 'node:assert/strict';
import test from 'node:test';

import { JOURNEY_EXTERIOR_SCENE_ID } from './journeyConstants.js';
import {
  createJourneyRoomInteractionState,
  getJourneyInteractObjectState,
  getJourneyInteractPrompt,
  isMummificationChamberComplete,
  journeyInteractHoldTick,
  journeyInteractInspect,
  journeyInteractPickUp,
  journeyInteractPlace,
  JOURNEY_INTERACT_OBJECT_STATES,
  JOURNEY_INTERACT_PROMPTS,
  JOURNEY_INTERACT_VERBS,
  MUMMIFICATION_RITE_SEQUENCE,
  resolveJourneyChamberEntryTrigger,
  resolveJourneyChamberReturnPoint,
} from './journeyUtils.js';

test('prompts cover every interact verb with "E" / "Hold E" labels', () => {
  assert.equal(getJourneyInteractPrompt(JOURNEY_INTERACT_VERBS.INSPECT), 'E Inspect');
  assert.equal(getJourneyInteractPrompt(JOURNEY_INTERACT_VERBS.PICK_UP), 'E Pick up');
  assert.equal(getJourneyInteractPrompt(JOURNEY_INTERACT_VERBS.PLACE), 'E Place');
  assert.equal(getJourneyInteractPrompt(JOURNEY_INTERACT_VERBS.HOLD_APPLY), 'Hold E Apply');
  assert.equal(getJourneyInteractPrompt(JOURNEY_INTERACT_VERBS.HOLD_WRAP), 'Hold E Wrap');
  assert.equal(getJourneyInteractPrompt(JOURNEY_INTERACT_VERBS.RESTORE), 'E Restore');
  Object.values(JOURNEY_INTERACT_VERBS).forEach((verb) => {
    assert.ok(JOURNEY_INTERACT_PROMPTS[verb], `prompt for ${verb} exists`);
  });
});

test('player can inspect an object', () => {
  const start = createJourneyRoomInteractionState();
  const { ok, interaction } = journeyInteractInspect(start, { id: 'cleanse-table' });
  assert.equal(ok, true);
  assert.equal(getJourneyInteractObjectState(interaction, 'cleanse-table'), JOURNEY_INTERACT_OBJECT_STATES.INSPECTED);
  // Pure: the original state is untouched.
  assert.equal(getJourneyInteractObjectState(start, 'cleanse-table'), JOURNEY_INTERACT_OBJECT_STATES.IDLE);
});

test('player can only carry one item at a time', () => {
  const first = journeyInteractPickUp(createJourneyRoomInteractionState(), { id: 'jar-imsety' });
  assert.equal(first.ok, true);
  assert.equal(first.interaction.carriedItemId, 'jar-imsety');
  assert.equal(getJourneyInteractObjectState(first.interaction, 'jar-imsety'), JOURNEY_INTERACT_OBJECT_STATES.HELD);

  const second = journeyInteractPickUp(first.interaction, { id: 'jar-hapi' });
  assert.equal(second.ok, false);
  assert.equal(second.reason, 'hands-full');
  // Still carrying the first item, second item not held.
  assert.equal(second.interaction.carriedItemId, 'jar-imsety');
  assert.equal(getJourneyInteractObjectState(second.interaction, 'jar-hapi'), JOURNEY_INTERACT_OBJECT_STATES.IDLE);
});

test('a carried item can only be placed at a valid target', () => {
  const held = journeyInteractPickUp(createJourneyRoomInteractionState(), { id: 'jar-duamutef' }).interaction;
  const placed = journeyInteractPlace(held, { id: 'plinth-a', acceptsItemId: 'jar-duamutef' });
  assert.equal(placed.ok, true);
  assert.equal(placed.interaction.carriedItemId, null);
  assert.equal(getJourneyInteractObjectState(placed.interaction, 'plinth-a'), JOURNEY_INTERACT_OBJECT_STATES.COMPLETED);
  assert.equal(getJourneyInteractObjectState(placed.interaction, 'jar-duamutef'), JOURNEY_INTERACT_OBJECT_STATES.COMPLETED);
});

test('wrong placement gives feedback and does not reset completed progress', () => {
  // Complete one plinth first.
  let state = journeyInteractPickUp(createJourneyRoomInteractionState(), { id: 'jar-duamutef' }).interaction;
  state = journeyInteractPlace(state, { id: 'plinth-a', acceptsItemId: 'jar-duamutef' }).interaction;
  // Now carry a second jar and place it on the WRONG plinth.
  state = journeyInteractPickUp(state, { id: 'jar-imsety' }).interaction;
  const wrong = journeyInteractPlace(state, { id: 'plinth-c', acceptsItemId: 'jar-qebehsenuef' });
  assert.equal(wrong.ok, false);
  assert.equal(wrong.reason, 'wrong-target');
  assert.deepEqual(wrong.interaction.feedback, { type: 'wrong-target', id: 'plinth-c', itemId: 'jar-imsety' });
  // Carried item retained, the earlier completed plinth is untouched.
  assert.equal(wrong.interaction.carriedItemId, 'jar-imsety');
  assert.equal(getJourneyInteractObjectState(wrong.interaction, 'plinth-a'), JOURNEY_INTERACT_OBJECT_STATES.COMPLETED);
  assert.equal(getJourneyInteractObjectState(wrong.interaction, 'plinth-c'), JOURNEY_INTERACT_OBJECT_STATES.IDLE);
});

test('hold interaction completes only after the required duration', () => {
  const opts = { itemId: 'oils-apply-table', verb: JOURNEY_INTERACT_VERBS.HOLD_APPLY, duration: 1.5, holding: true, moving: false };
  let state = createJourneyRoomInteractionState();
  let res = journeyInteractHoldTick(state, { ...opts, dt: 0.5 });
  assert.equal(res.completed, false);
  assert.ok(res.interaction.holdProgress > 0 && res.interaction.holdProgress < 1.5);
  res = journeyInteractHoldTick(res.interaction, { ...opts, dt: 0.5 });
  assert.equal(res.completed, false);
  res = journeyInteractHoldTick(res.interaction, { ...opts, dt: 0.6 });
  assert.equal(res.completed, true);
  assert.equal(res.ok, true);
  // After completion the live hold is cleared.
  assert.equal(res.interaction.holdProgress, 0);
  assert.equal(res.interaction.holdItemId, null);
});

test('moving or releasing mid-hold cancels only the current hold', () => {
  const opts = { itemId: 'linen-wrap-table', verb: JOURNEY_INTERACT_VERBS.HOLD_WRAP, duration: 1.8 };
  // Pre-existing progress on an unrelated object stays intact.
  let state = journeyInteractPickUp(createJourneyRoomInteractionState(), { id: 'linen-roll' }).interaction;
  state = journeyInteractInspect(state, { id: 'cleanse-table' }).interaction;
  let res = journeyInteractHoldTick(state, { ...opts, dt: 0.9, holding: true, moving: false });
  assert.ok(res.interaction.holdProgress > 0);

  // Moving cancels the hold progress but not the carried item or prior inspection.
  const movedAway = journeyInteractHoldTick(res.interaction, { ...opts, dt: 0.2, holding: true, moving: true });
  assert.equal(movedAway.completed, false);
  assert.equal(movedAway.cancelled, true);
  assert.equal(movedAway.reason, 'moved');
  assert.equal(movedAway.interaction.holdProgress, 0);
  assert.equal(movedAway.interaction.carriedItemId, 'linen-roll');
  assert.equal(getJourneyInteractObjectState(movedAway.interaction, 'cleanse-table'), JOURNEY_INTERACT_OBJECT_STATES.INSPECTED);

  // Releasing the key (not holding) also cancels.
  res = journeyInteractHoldTick(state, { ...opts, dt: 0.9, holding: true, moving: false });
  const released = journeyInteractHoldTick(res.interaction, { ...opts, dt: 0.2, holding: false, moving: false });
  assert.equal(released.cancelled, true);
  assert.equal(released.reason, 'released');
  assert.equal(released.interaction.holdProgress, 0);
});

test('exit seal stays locked until all five rites complete, then unlocks', () => {
  assert.equal(MUMMIFICATION_RITE_SEQUENCE.length, 5);
  for (let step = 0; step < MUMMIFICATION_RITE_SEQUENCE.length; step += 1) {
    assert.equal(isMummificationChamberComplete(step), false, `step ${step} should keep the seal locked`);
  }
  assert.equal(isMummificationChamberComplete(MUMMIFICATION_RITE_SEQUENCE.length), true);
});

test('chamber entry trigger resolves to the physical doorway platform within its hidden route', () => {
  const trigger = resolveJourneyChamberEntryTrigger({
    door: {
      routeId: 'scribe-locked-chamber-route',
      entryPlatformId: 'scribe-chamber-doorway-threshold',
      trigger: { minX: 100, maxX: 180, maxY: 600, footY: 520, footTolerance: 8 },
    },
    route: { id: 'scribe-locked-chamber-route', x: 10650, y: 297, width: 540, height: 104 },
    platform: { id: 'scribe-chamber-doorway-threshold', x: 10871, y: 297, width: 180, height: 18 },
  });

  assert.equal(trigger.minX, 10847);
  assert.equal(trigger.maxX, 11075);
  assert.equal(trigger.footY, 297);
  assert.equal(trigger.footTolerance, 24);
  assert.equal(trigger.routeId, 'scribe-locked-chamber-route');
  assert.equal(trigger.entryPlatformId, 'scribe-chamber-doorway-threshold');
});

test('chamber return point centers Asha on the resolved exterior doorway', () => {
  const returnPoint = resolveJourneyChamberReturnPoint({
    door: {
      routeId: 'desert-upper-survey-route',
      entryPlatformId: 'forgotten-mural-upper-doorway-floor',
      trigger: { minX: 7050, maxX: 7150, maxY: 620, footY: 545, footTolerance: 10 },
      returnFallback: { x: 7400, y: 500, direction: -1, cameraAnchorRatio: 0.4 },
    },
    route: { id: 'desert-upper-survey-route', x: 7100, y: 81, width: 980, height: 124 },
    platform: { id: 'forgotten-mural-upper-doorway-floor', x: 7528, y: 193, width: 250, height: 18 },
    exteriorSceneId: JOURNEY_EXTERIOR_SCENE_ID,
    direction: 1,
    canvasWidth: 960,
    worldWidth: 20000,
  });

  assert.deepEqual(returnPoint, {
    sceneId: JOURNEY_EXTERIOR_SCENE_ID,
    x: 7653,
    y: 193,
    direction: 1,
    cameraAnchorRatio: 0.4,
    cameraX: 7269,
  });
});
