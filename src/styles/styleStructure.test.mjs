import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const mainSource = readFileSync(new URL('../main.jsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8');
const indexCss = readFileSync(new URL('../index.css', import.meta.url), 'utf8');
const digPhaseCssUrl = new URL('./dig-phase.css', import.meta.url);
const printCssUrl = new URL('./print.css', import.meta.url);

test('dig phase polish styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/dig-phase\.css['"]/,
    'main.jsx should import the extracted dig phase stylesheet after index.css',
  );
  assert.equal(existsSync(digPhaseCssUrl), true, 'dig-phase.css should exist');
  assert.equal(
    indexCss.includes('Premium game HUD pass: Phase 1 Emergency Excavation'),
    false,
    'the extracted dig phase section should not remain in index.css',
  );
});

test('print-only styles live in their own imported stylesheet', () => {
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/print\.css['"]/,
    'main.jsx should import the extracted print stylesheet after index.css',
  );
  assert.equal(existsSync(printCssUrl), true, 'print.css should exist');
  assert.equal(indexCss.includes('@media print'), false, 'print media blocks should not remain in index.css');
});

test('global styles are imported once from the app entry', () => {
  assert.match(mainSource, /import\s+['"]\.\/index\.css['"]/);
  assert.doesNotMatch(appSource, /import\s+['"]\.\/index\.css['"]/);
});

test('removed museum and clue panel placeholders do not linger in index.css', () => {
  [
    'Block removed',
    'Consolidated above',
    'Removed .museum-curation-main',
    'Legacy Inventory Tray',
    'Legacy Clue Panel',
    '.inventory-tray',
    '.clue-panel',
    '.clue-main-content',
    '.clue-content',
    'Redundant styles removed',
  ].forEach((oldMarker) => {
    assert.equal(indexCss.includes(oldMarker), false, `${oldMarker} should not remain in index.css`);
  });
});