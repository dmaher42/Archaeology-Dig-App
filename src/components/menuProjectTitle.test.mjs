import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const menuSource = readFileSync(new URL('./Menu.jsx', import.meta.url), 'utf8');

test('main menu uses Antiquities Bureau as the whole-project title', () => {
  assert.match(menuSource, /<div className="training-kicker">Archaeology Challenge<\/div>/);
  assert.match(menuSource, /<h2[^>]*>\s*The Antiquities Bureau\s*<\/h2>/);
  assert.match(menuSource, /<h3>Lost Site Expedition<\/h3>/);
});
