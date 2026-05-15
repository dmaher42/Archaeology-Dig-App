import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./journeyLevelData.js', import.meta.url), 'utf8');
const extractExportedArray = (name) => {
  const startToken = `export const ${name} = [`;
  const start = source.indexOf(startToken);
  assert.notEqual(start, -1, `${name} export should exist`);
  const bodyStart = start + startToken.length - 1;
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '[') depth += 1;
    if (char === ']') depth -= 1;
    if (depth === 0) return source.slice(bodyStart, index + 1);
  }
  throw new Error(`${name} export should close its array`);
};

test('hidden routes are optional and never required for main progression', () => {
  const hiddenRoutes = extractExportedArray('HIDDEN_ROUTES');

  assert.ok((hiddenRoutes.match(/id:/g) || []).length >= 4);
  assert.match(hiddenRoutes, /civilisation:\s*'Ancient Egypt'/);
  assert.match(hiddenRoutes, /civilisation:\s*'Ancient China'/);
  assert.match(hiddenRoutes, /optional:\s*true/);
  assert.match(hiddenRoutes, /rewardHint:/);
  assert.match(hiddenRoutes, /discoveryMessage:/);
});

test('secret collectibles support Egypt and China discovery sets', () => {
  const secretCollectibles = extractExportedArray('SECRET_COLLECTIBLES');

  assert.ok((secretCollectibles.match(/id:/g) || []).length >= 6);
  assert.match(secretCollectibles, /setId:\s*'egypt-secrets'/);
  assert.match(secretCollectibles, /setId:\s*'china-secrets'/);
  assert.match(secretCollectibles, /routeId:/);
  assert.match(secretCollectibles, /discoveryMessage:/);
  assert.match(secretCollectibles, /x:\s*X\(/);
  assert.match(secretCollectibles, /y:\s*JY\(/);
});
