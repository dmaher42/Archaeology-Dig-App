import assert from 'node:assert/strict';
import test from 'node:test';

import {
  RANDOM_EVENTS,
  SCENARIOS,
  createDefaultTrainingGridTiles,
  createSavePayload,
  rebuildSavedSession,
} from './gameLogic.js';

test('training save payload restores the current certification progress', () => {
  const scenario = SCENARIOS[0];
  const event = RANDOM_EVENTS[0];
  const activeArtifacts = scenario.evidence.slice(0, 2);
  const gridTiles = createDefaultTrainingGridTiles();
  gridTiles[0] = { ...gridTiles[0], isRevealed: true };
  gridTiles[10] = { ...gridTiles[10], isRevealed: true, isMarked: true };
  const trainingState = {
    currentStepIndex: 3,
    isSurveyed: true,
    isGridded: true,
    gridTiles,
    artifactExtracted: true,
    mappedCoordinate: 'C3',
    labHypothesis: null,
  };

  const payload = createSavePayload({
    mode: 'archaeology',
    phase: 'training',
    currentScenario: scenario,
    currentEvent: event,
    activeArtifacts,
    excavatedIds: new Set(),
    itemsLocation: {},
    hypotheses: {},
    siteName: scenario.name,
    finalConclusion: null,
    curatedItems: [],
    plaques: {},
    finalExhibitionStatement: '',
    trainingPlacements: [],
    trainingState,
    evidenceConditions: {},
    digRecoverySummary: null,
  });

  const restored = rebuildSavedSession(payload);

  assert.deepEqual(restored.trainingState, trainingState);
});
