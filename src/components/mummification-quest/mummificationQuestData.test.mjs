import { existsSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MUMMIFICATION_QUEST_ARCHAEOLOGIST_FIELDS,
  MUMMIFICATION_QUEST_DESIGN_FIELDS,
  MUMMIFICATION_QUEST_EVIDENCE_CARDS,
  MUMMIFICATION_QUEST_EVIDENCE_CATEGORIES,
  MUMMIFICATION_QUEST_OBSERVATION_FIELDS,
  MUMMIFICATION_QUEST_GLOSSARY,
  MUMMIFICATION_QUEST_STORAGE_KEY,
  MUMMIFICATION_QUEST_SUCCESS_CRITERIA,
  MUMMIFICATION_QUEST_TEACHER_NOTES,
  MUMMIFICATION_QUEST_REPORT_SECTIONS,
  MUMMIFICATION_QUEST_STAGE_IMAGES,
  MUMMIFICATION_QUEST_STAGES,
} from './mummificationQuestData.js';

const repositoryRoot = new URL('../../..', import.meta.url);

test('Mummification Lab uses the requested classroom stages', () => {
  assert.deepEqual(
    MUMMIFICATION_QUEST_STAGES.map((stage) => stage.title),
    [
      'Briefing',
      'Evidence Sort',
      'Orange Practical Checklist',
      'Observation Log',
      'Sarcophagus Design Studio',
      'Future Archaeologist Mode',
      'Field Report',
    ],
  );
});

test('Evidence Sort uses the requested categories and core evidence cards', () => {
  assert.deepEqual(
    MUMMIFICATION_QUEST_EVIDENCE_CATEGORIES.map((category) => category.label),
    ['preservation', 'ritual/belief', 'archaeological evidence', 'causes decay'],
  );

  const cardById = new Map(MUMMIFICATION_QUEST_EVIDENCE_CARDS.map((card) => [card.id, card]));

  assert.equal(cardById.get('natron')?.correctCategoryId, 'preservation');
  assert.equal(cardById.get('linen-bandages')?.correctCategoryId, 'preservation');
  assert.equal(cardById.get('canopic-jars')?.correctCategoryId, 'ritual-belief');
  assert.equal(cardById.get('ct-scan')?.correctCategoryId, 'archaeological-evidence');
  assert.ok(
    MUMMIFICATION_QUEST_EVIDENCE_CARDS.some((card) => card.correctCategoryId === 'causes-decay'),
    'at least one card should help students identify causes of decay',
  );
});

test('Classroom response fields match the MVP brief', () => {
  assert.deepEqual(
    MUMMIFICATION_QUEST_OBSERVATION_FIELDS.map((field) => field.label),
    [
      'I predict the orange will change because...',
      'Day 0 observation',
      'Week 1 observation',
      'Week 2 observation',
      'Final observation',
    ],
  );

  assert.deepEqual(
    MUMMIFICATION_QUEST_DESIGN_FIELDS.map((field) => field.label),
    [
      'mummy name',
      'identity or role',
      'colours',
      'symbols',
      'burial goods',
      'inscription',
      'explanation of design choices',
    ],
  );

  assert.deepEqual(
    MUMMIFICATION_QUEST_ARCHAEOLOGIST_FIELDS.map((field) => field.label),
    [
      'What the evidence suggests',
      'What could be misunderstood',
      'What we are still unsure about',
    ],
  );

  assert.deepEqual(
    MUMMIFICATION_QUEST_REPORT_SECTIONS.map((section) => section.title),
    [
      'My prediction',
      'What we did',
      'What changed over time',
      'How this models preservation',
      'What the orange model does not show',
      'How my sarcophagus shows identity, belief and protection',
      'What a future archaeologist might infer',
      'My thinking changed because...',
    ],
  );
});

test('Available Mummification Lab images are wired from the feature asset folder', () => {
  const cardsWithTrackedAssets = MUMMIFICATION_QUEST_EVIDENCE_CARDS;

  assert.equal(cardsWithTrackedAssets.length, 6);

  for (const card of cardsWithTrackedAssets) {
    assert.ok(card.imageCandidates.length > 0, `${card.title} should include an image candidate`);
    const primaryCandidate = card.imageCandidates[0];
    assert.match(primaryCandidate, /^\/assets\/mummification-quest\//);
    assert.equal(
      existsSync(new URL(`public${primaryCandidate}`, repositoryRoot)),
      true,
      `${primaryCandidate} should exist in public assets`,
    );
  }

  for (const stageImage of Object.values(MUMMIFICATION_QUEST_STAGE_IMAGES)) {
    assert.ok(stageImage.imageCandidates.length > 0, `${stageImage.title} should include an image candidate`);
    const primaryCandidate = stageImage.imageCandidates[0];
    assert.match(primaryCandidate, /^\/assets\/mummification-quest\//);
    assert.equal(
      existsSync(new URL(`public${primaryCandidate}`, repositoryRoot)),
      true,
      `${primaryCandidate} should exist in public assets`,
    );
  }
});

test('Mummification Lab persistence uses the requested versioned localStorage key', () => {
  assert.equal(MUMMIFICATION_QUEST_STORAGE_KEY, 'archaeologyDigApp:mummificationQuest:v1');
});

test('Mummification Lab support panels include glossary, success criteria and teacher notes', () => {
  assert.deepEqual(
    MUMMIFICATION_QUEST_GLOSSARY.map((entry) => entry.term),
    [
      'artefact',
      'preservation',
      'mummification',
      'sarcophagus',
      'ritual',
      'afterlife',
      'evidence',
      'interpretation',
      'contestability',
    ],
  );

  assert.deepEqual(
    MUMMIFICATION_QUEST_SUCCESS_CRITERIA,
    [
      'I can explain why Ancient Egyptians mummified bodies.',
      'I can describe how the orange model shows preservation.',
      'I can design a sarcophagus that shows identity, belief and protection.',
      'I can explain what a future archaeologist might infer.',
      'I can identify what could be misunderstood.',
      'I can reflect on how my thinking changed.',
    ],
  );

  assert.deepEqual(
    MUMMIFICATION_QUEST_TEACHER_NOTES,
    [
      'adult handles cutting the orange',
      'wash hands after the practical',
      'dispose of mouldy oranges safely',
      'use respectful language when discussing death and human remains',
    ],
  );
});
