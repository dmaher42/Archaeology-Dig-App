import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MUMMIFICATION_QUEST_STAGES,
  MUMMIFICATION_QUEST_SAFETY_NOTE,
  MUMMIFICATION_QUEST_RESPECT_NOTE,
} from './mummificationQuestData.js';

const REQUIRED_STAGE_IDS = [
  'briefing',
  'evidence-sort',
  'orange-practical',
  'observation-log',
  'sarcophagus-design',
  'future-archaeologist',
  'field-report',
];

test('Mummification Lab MVP includes the required classroom stages in order', () => {
  assert.deepEqual(
    MUMMIFICATION_QUEST_STAGES.map((stage) => stage.id),
    REQUIRED_STAGE_IDS,
  );
  assert.equal(MUMMIFICATION_QUEST_STAGES.at(-1).title, 'Field Report');
});

test('Mummification Lab content keeps the orange practical safe and respectful', () => {
  const allText = JSON.stringify({
    stages: MUMMIFICATION_QUEST_STAGES,
    safety: MUMMIFICATION_QUEST_SAFETY_NOTE,
    respect: MUMMIFICATION_QUEST_RESPECT_NOTE,
  });

  assert.match(allText, /sarcophagus/i);
  assert.match(allText, /teacher/i);
  assert.match(allText, /safety/i);
  assert.match(allText, /human remains/i);
  assert.match(allText, /My thinking changed because/i);
});
