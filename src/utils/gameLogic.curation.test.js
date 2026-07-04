import assert from 'node:assert/strict';
import test from 'node:test';

import * as gameLogic from './gameLogic.js';

test('curation analysis summary exposes the correct lab answer for museum labels', () => {
  assert.equal(typeof gameLogic.getCurationAnalysisSummary, 'function');

  const artifact = {
    options: [
      'They believed organs needed to be protected for the afterlife.',
      'They used decorated jars mainly for cooking meals.',
    ],
    correct: 0,
  };
  const summary = gameLogic.getCurationAnalysisSummary(
    {
      answerText: 'They used decorated jars mainly for cooking meals.',
      labResultText: 'Animal-headed lid and stone container for organs.',
      answerIsCorrect: false,
      promptTitle: 'Beliefs',
      note: 'The canopic jar suggests burial beliefs mattered.',
    },
    artifact,
  );

  assert.deepEqual(summary, {
    correctAnswerText: 'They believed organs needed to be protected for the afterlife.',
    selectedAnswerText: 'They used decorated jars mainly for cooking meals.',
    labResultText: 'Animal-headed lid and stone container for organs.',
    answerIsCorrect: false,
    promptTitle: 'Beliefs',
    focusTitle: 'Beliefs',
    note: 'The canopic jar suggests burial beliefs mattered.',
  });
});

test('museum display label prompt asks students to explain what the find reveals about its civilisation', () => {
  assert.equal(typeof gameLogic.getMuseumDisplayLabelPrompt, 'function');

  const artifact = {
    id: 'rm_3',
    name: 'Samian Ware',
    type: 'objects',
  };

  assert.deepEqual(gameLogic.getMuseumDisplayLabelPrompt(artifact), {
    label: 'Museum Display Label',
    helper: 'Write a museum display label explaining what this find tells us about Romans. Use the lab result and correct answer as evidence.',
    placeholder: 'This find tells us that...',
  });
});

test('evidence image fallbacks use real raster museum images instead of old SVG placeholders', () => {
  [
    ['eg_missing', 'museum/egypt_canopic_jar.jpg'],
    ['mg_missing', 'museum/mungo_lake_overview.jpg'],
    ['ch_missing', 'museum/china_horse_skeletons.png'],
    ['rh_missing', 'museum/modern_coin.jpg'],
    ['unknown_missing', 'museum/modern_coin.jpg'],
  ].forEach(([id, expectedPath]) => {
    const resolved = gameLogic.getEvidenceImagePath({ id });

    assert.match(resolved, new RegExp(`${expectedPath}$`));
    assert.doesNotMatch(resolved, /\.svg$/);
  });
});
