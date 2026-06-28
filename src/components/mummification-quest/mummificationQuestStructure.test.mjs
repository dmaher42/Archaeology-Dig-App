import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const appSource = readFileSync(new URL('../../App.jsx', import.meta.url), 'utf8');
const mainSource = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
const indexCss = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

const modeComponentUrl = new URL('./MummificationQuestMode.jsx', import.meta.url);
const modeStylesUrl = new URL('../../styles/mummification-quest.css', import.meta.url);

test('Mummification Lab code lives in its feature folder', () => {
  assert.equal(existsSync(modeComponentUrl), true, 'mode component should live beside its data and tests');
  assert.match(
    appSource,
    /import\('\.\/components\/mummification-quest\/MummificationQuestMode'\)/,
    'App should lazy-load the feature-folder component',
  );
});

test('Mummification Lab styles live in their own imported stylesheet', () => {
  assert.equal(existsSync(modeStylesUrl), true, 'mummification-quest.css should exist');
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/mummification-quest\.css['"]/,
    'main.jsx should import the extracted Mummification Lab stylesheet after index.css',
  );
  assert.equal(
    indexCss.includes('/* Mummification Lab classroom MVP */'),
    false,
    'Mummification Lab styles should not remain in index.css',
  );
});
