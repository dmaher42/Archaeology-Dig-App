import assert from 'node:assert/strict';
import test from 'node:test';

import {
  RANDOM_EVENTS,
  SCENARIOS,
  TRAINING_SURVEY_ZONES,
  createTrainingGridTiles,
  createSavePayload,
  getTrainingSurveyScore,
  rebuildSavedSession,
} from './gameLogic.js';

test('training survey zones provide clues without revealing exact find squares', () => {
  assert.equal(TRAINING_SURVEY_ZONES.length, 3);

  for (const zone of TRAINING_SURVEY_ZONES) {
    assert.equal(typeof zone.id, 'string');
    assert.equal(typeof zone.title, 'string');
    assert.equal(typeof zone.clue, 'string');
    assert.equal(typeof zone.fieldNote, 'string');
    assert.ok(zone.surveyScore >= 0 && zone.surveyScore <= 100);
    assert.equal(Object.hasOwn(zone, 'artifactIndexes'), false);
  }
});

test('selected survey area preserves classic board size and creates a safe starter probe', () => {
  const selectedSurveyZoneId = TRAINING_SURVEY_ZONES[0].id;
  const gridTiles = createTrainingGridTiles('beginner', { selectedSurveyZoneId });
  const starterProbe = gridTiles.find(tile => tile.isStarterProbe);

  assert.equal(gridTiles.length, 81);
  assert.equal(gridTiles.filter(tile => tile.isArtifact).length, 10);
  assert.ok(starterProbe);
  assert.equal(starterProbe.isArtifact, false);
  assert.equal(starterProbe.adjacentCount, 0);
});

test('training survey score rewards inspection and the selected excavation area', () => {
  const [strongZone, partialZone] = TRAINING_SURVEY_ZONES;

  assert.equal(
    getTrainingSurveyScore({
      inspectedZoneIds: TRAINING_SURVEY_ZONES.map(zone => zone.id),
      selectedSurveyZoneId: strongZone.id,
    }),
    100,
  );

  assert.ok(
    getTrainingSurveyScore({
      inspectedZoneIds: [partialZone.id],
      selectedSurveyZoneId: partialZone.id,
    }) < 100,
  );
});

test('training save payload restores the current certification progress', () => {
  const scenario = SCENARIOS[0];
  const event = RANDOM_EVENTS[0];
  const activeArtifacts = scenario.evidence.slice(0, 2);
  const gridTiles = createTrainingGridTiles('intermediate', { selectedSurveyZoneId: 'central-depression' });
  gridTiles[0] = { ...gridTiles[0], isRevealed: true };
  gridTiles[10] = { ...gridTiles[10], isRevealed: true, isMarked: true };
  const trainingState = {
    currentStepIndex: 3,
    difficultyId: 'intermediate',
    isSurveyed: true,
    isGridded: true,
    inspectedSurveyZoneIds: ['central-depression', 'ridge-scatter'],
    selectedSurveyZoneId: 'central-depression',
    surveyQuality: 85,
    gridAccuracy: null,
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
