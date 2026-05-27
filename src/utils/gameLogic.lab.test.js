import assert from 'node:assert/strict';
import test from 'node:test';

import { getLabAnswerFeedback, getLabFocusFeedback } from './gameLogic.js';

const artifact = {
  clue: 'A stone jar with a lid shaped like an animal head.',
  options: [
    'They believed organs needed to be protected for the afterlife.',
    'They used decorated jars mainly for cooking meals.',
  ],
  correct: 0,
  rationale: 'The canopic jar is evidence of burial beliefs.',
};

test('lab answer feedback points students back to the clue when the answer is incorrect', () => {
  assert.deepEqual(getLabAnswerFeedback(artifact, 1), {
    isCorrect: false,
    title: 'Check the clue again',
    message: 'The clue says: "A stone jar with a lid shaped like an animal head." Choose the answer that best explains that evidence.',
  });
});

test('lab answer feedback explains why the correct answer works', () => {
  assert.deepEqual(getLabAnswerFeedback(artifact, 0), {
    isCorrect: true,
    title: 'Meaning confirmed',
    message: 'The canopic jar is evidence of burial beliefs.',
  });
});

test('lab focus feedback marks the matching historical focus as correct', () => {
  assert.deepEqual(getLabFocusFeedback(artifact, 'beliefs'), {
    correctFocusId: 'beliefs',
    isCorrect: true,
    title: 'Focus confirmed',
    message: 'Beliefs is the strongest focus for this evidence.',
  });
});

test('lab focus feedback marks a mismatched historical focus as incorrect', () => {
  assert.deepEqual(getLabFocusFeedback(artifact, 'technology'), {
    correctFocusId: 'beliefs',
    isCorrect: false,
    title: 'Try another focus',
    message: 'Look again at the clue and the meaning you selected. Choose the focus that best explains what historians can learn from this evidence.',
  });
});
