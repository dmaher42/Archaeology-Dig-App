import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const journeyDataSource = readFileSync(new URL('./journeyLevelData.js', import.meta.url), 'utf8');
const journeyComponentSource = readFileSync(new URL('../ExpeditionJourney.jsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../../App.jsx', import.meta.url), 'utf8');
const egyptAudioTracksUrl = new URL('./egyptAudioTracks.js', import.meta.url);
const egyptAudioTracksSource = existsSync(egyptAudioTracksUrl)
  ? readFileSync(egyptAudioTracksUrl, 'utf8')
  : '';

const requiredEventCues = [
  ['desert-distant-rockfall', 'distantRockfall'],
  ['temple-instability', 'templeStoneGroan'],
  ['temple-distant-ruin-collapse', 'distantRuinCollapse'],
  ['catacomb-warning', 'distantMonsterCall'],
  ['cave-in', 'majorCaveIn'],
  ['escape-warning', 'structureRipping'],
];

test('Egypt Journey dramatic events declare explicit SFX cue keys', () => {
  requiredEventCues.forEach(([eventId, sfxKey]) => {
    const eventPattern = new RegExp(`id:\\s*'${eventId}'[\\s\\S]*?sfxKey:\\s*'${sfxKey}'`);
    assert.match(journeyDataSource, eventPattern, `${eventId} should play ${sfxKey}`);
  });
});

test('Egypt SFX catalog registers the dramatic cue keys without crowding App.jsx', () => {
  assert.ok(egyptAudioTracksSource, 'egyptAudioTracks.js should hold Egypt-specific SFX definitions');
  assert.match(appSource, /import\s+\{\s*EGYPT_AUDIO_TRACKS\s*\}\s+from\s+'\.\/components\/expedition-journey\/egyptAudioTracks';/);
  assert.match(appSource, /\.\.\.EGYPT_AUDIO_TRACKS\.sfx/);

  [
    'distantRockfall',
    'templeStoneGroan',
    'distantRuinCollapse',
    'distantMonsterCall',
    'majorCaveIn',
    'structureRipping',
    'combatDangerHit',
    'ashaHurtBreath',
  ].forEach((sfxKey) => {
    assert.match(egyptAudioTracksSource, new RegExp(`${sfxKey}:\\s*\\{`), `${sfxKey} should be configured`);
  });
});

test('Journey runtime plays event cue keys and schedules rare ambient threat sounds', () => {
  assert.match(journeyComponentSource, /if\s*\(ev\.sfxKey\)\s*\{/);
  assert.match(journeyComponentSource, /audioControls\?\.playExpeditionSfx\?\.\(ev\.sfxKey/);
  assert.match(journeyComponentSource, /current\.ambientDramaTimer/);
  assert.match(journeyComponentSource, /getAmbientDramaSfxKey/);
  assert.match(journeyComponentSource, /audioControls\?\.playExpeditionSfx\?\.\(ambientDramaSfxKey/);
});
