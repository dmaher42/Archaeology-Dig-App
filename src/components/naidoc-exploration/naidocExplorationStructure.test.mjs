import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const appSource = readFileSync(new URL('../../App.jsx', import.meta.url), 'utf8');
const mainSource = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
const modeComponentUrl = new URL('./NaidocExplorationMode.jsx', import.meta.url);
const modeStylesUrl = new URL('../../styles/naidoc-exploration.css', import.meta.url);

test('NAIDOC exploration code lives in its feature folder', () => {
  assert.equal(existsSync(modeComponentUrl), true, 'mode component should live beside its data and tests');
  assert.match(
    appSource,
    /import\('\.\/components\/naidoc-exploration\/NaidocExplorationMode'\)/,
    'App should lazy-load the feature-folder component',
  );
});

test('NAIDOC exploration styles live in their own imported stylesheet', () => {
  assert.equal(existsSync(modeStylesUrl), true, 'naidoc-exploration.css should exist');
  assert.match(
    mainSource,
    /import\s+['"]\.\/styles\/naidoc-exploration\.css['"]/,
    'main.jsx should import the extracted NAIDOC stylesheet',
  );
});
