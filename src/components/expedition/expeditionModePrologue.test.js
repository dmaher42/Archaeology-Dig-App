import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const expeditionModeSource = readFileSync(new URL('../ExpeditionMode.jsx', import.meta.url), 'utf8');
const expeditionJourneySource = readFileSync(new URL('../ExpeditionJourney.jsx', import.meta.url), 'utf8');
const journeyLevelDataSource = readFileSync(new URL('../expedition-journey/journeyLevelData.js', import.meta.url), 'utf8');

test('Egypt archive prologue keeps the required grounded story sequence before Journey', () => {
  assert.match(expeditionModeSource, /EGYPT_ARCHIVE_PROLOGUE_ITEMS/);
  assert.match(expeditionModeSource, /Heritage Research\s*-\s*Cairo/);
  assert.match(expeditionModeSource, /Review the evidence/);
  assert.match(expeditionModeSource, /Site Update/);
  assert.match(expeditionModeSource, /Archive Photograph/);
  assert.match(expeditionModeSource, /Asha['\u2019]s Field Notes/);
  assert.match(expeditionModeSource, /Inspect each record before Asha visits the site\./);
  assert.match(expeditionModeSource, /The records are enough to justify a site check\./);
  assert.match(expeditionModeSource, /Travel to Pyramid/);
  assert.match(expeditionModeSource, /prologueCinematicStep/);
  assert.match(expeditionModeSource, /Pyramid Site/);
  assert.match(expeditionModeSource, /Scarab\s*-\s*Site Comparison/);
  assert.match(expeditionModeSource, /Review all evidence first\./);
  assert.match(expeditionModeSource, /Examine the scarab/);
  assert.match(expeditionModeSource, /Then the pyramid drops away\./);
  assert.match(expeditionModeSource, /The world below is not the site Asha climbed\./);
  assert.match(expeditionModeSource, /setExpeditionStage\('journey'\)/);
});

test('Egypt and Rome archive prologues are scoped to ExpeditionMode without retuning the scarab seal Journey trigger', () => {
  assert.match(expeditionModeSource, /stage\.id === EXPEDITION_STAGE_IDS\.EGYPT/);
  assert.match(expeditionModeSource, /stage\.id === EXPEDITION_STAGE_IDS\.ROME/);
  assert.match(expeditionModeSource, /const hasPrologue = isEgypt \|\| isRome;/);
  assert.match(expeditionModeSource, /hasPrologue \? 'archive-prologue' : 'journey'/);
  assert.match(expeditionModeSource, /const isRomeArchivePrologue = selectedStageId === EXPEDITION_STAGE_IDS\.ROME && expeditionStage === 'archive-prologue';/);
  assert.match(expeditionModeSource, /const renderRomeArchivePrologue = \(\) => \{/);
  assert.match(journeyLevelDataSource, /export const SCARAB_SEAL_TRIGGER = \{/);
  assert.doesNotMatch(expeditionJourneySource, /archive-prologue/);
});
