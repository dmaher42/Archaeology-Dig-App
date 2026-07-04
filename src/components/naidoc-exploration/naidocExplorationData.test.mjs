import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NAIDOC_EXPLORATION_AREAS,
  NAIDOC_EXPLORATION_MARKERS,
  NAIDOC_EXPLORATION_QUIZ,
  getNaidocExplorationProgress,
} from './naidocExplorationData.js';

test('NAIDOC exploration uses the requested lesson areas', () => {
  assert.deepEqual(
    NAIDOC_EXPLORATION_AREAS.map((area) => area.title),
    [
      'Welcome: 50 Years of Deadly',
      'Ancient Australia & Archaeology',
      'Pondi and the River Story',
      'Culture, Country and Knowledge',
      'NAIDOC Milestones',
      'Final Reflection & Quiz',
    ],
  );
});

test('required interactions cover each learning area before the quiz', () => {
  const requiredMarkers = NAIDOC_EXPLORATION_MARKERS.filter((marker) => marker.required);

  assert.equal(requiredMarkers.length >= 14, true, 'lesson should include enough required stops for teacher pacing');

  for (const area of NAIDOC_EXPLORATION_AREAS.filter((area) => !area.finalArea)) {
    assert.ok(
      requiredMarkers.some((marker) => marker.areaId === area.id),
      `${area.title} should have at least one required marker`,
    );
  }
});

test('quiz has ten answerable questions based only on shown marker content', () => {
  assert.equal(NAIDOC_EXPLORATION_QUIZ.length, 10);

  const shownQuizSourceIds = new Set(NAIDOC_EXPLORATION_MARKERS.map((marker) => marker.id));

  for (const question of NAIDOC_EXPLORATION_QUIZ) {
    assert.equal(question.options.length, 4, `${question.id} should have four options`);
    assert.equal(Number.isInteger(question.correctIndex), true, `${question.id} should point to a correct option`);
    assert.ok(question.correctIndex >= 0 && question.correctIndex < question.options.length);
    assert.ok(shownQuizSourceIds.has(question.sourceMarkerId), `${question.id} should cite a visible marker`);
  }
});

test('progress helper unlocks the final area only after required markers are collected', () => {
  const requiredIds = NAIDOC_EXPLORATION_MARKERS.filter((marker) => marker.required).map((marker) => marker.id);
  const almostComplete = new Set(requiredIds.slice(0, -1));
  const complete = new Set(requiredIds);

  assert.deepEqual(getNaidocExplorationProgress(almostComplete), {
    requiredCollected: requiredIds.length - 1,
    requiredTotal: requiredIds.length,
    finalUnlocked: false,
  });

  assert.deepEqual(getNaidocExplorationProgress(complete), {
    requiredCollected: requiredIds.length,
    requiredTotal: requiredIds.length,
    finalUnlocked: true,
  });
});
