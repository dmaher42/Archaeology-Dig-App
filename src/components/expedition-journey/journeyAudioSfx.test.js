import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const journeyDataSource = readFileSync(new URL('./journeyLevelData.js', import.meta.url), 'utf8');
const journeyComponentSource = readFileSync(new URL('../ExpeditionJourney.jsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../../App.jsx', import.meta.url), 'utf8');
const sfxGeneratorSource = readFileSync(new URL('../../../scripts/generate_expedition_sfx.py', import.meta.url), 'utf8');
const egyptAudioTracksUrl = new URL('./egyptAudioTracks.js', import.meta.url);
const egyptAudioTracksSource = existsSync(egyptAudioTracksUrl)
  ? readFileSync(egyptAudioTracksUrl, 'utf8')
  : '';

const requiredEventCues = [
  ['desert-distant-rockfall', 'distantRockfall'],
  ['temple-doors', 'templeDoorBoom'],
  ['temple-instability', 'templeStoneGroan'],
  ['sandfall-collapsing-stone-section', 'sandfallStoneCascade'],
  ['temple-distant-ruin-collapse', 'distantRuinCollapse'],
  ['torch-descent', 'catacombDeepBreath'],
  ['catacomb-moving-fog', 'catacombFogWhisper'],
  ['catacomb-warning', 'distantMonsterCall'],
  ['cave-in', 'majorCaveIn'],
  ['bridge-warning', 'bridgeStoneCrack'],
  ['escape-warning', 'structureRipping'],
  ['escape-unstable-excavation', 'unstableExcavationTremor'],
  ['final-boundary', 'finalGuardianDread'],
];

const requiredAmbientBassCues = [
  'voidBassSwell',
  'underworldHeartDrone',
  'realityTearRumble',
];

const requiredOpeningPresenceCues = [
  ['scarabTouchWhisper', 'scarab-touch-whisper.wav', 'scarab_touch_whisper'],
  ['thresholdRealityTear', 'threshold-reality-tear.wav', 'threshold_reality_tear'],
  ['anubisPresenceStinger', 'anubis-presence-stinger.wav', 'anubis_presence_stinger'],
  ['lostSiteAirShift', 'lost-site-air-shift.wav', 'lost_site_air_shift'],
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
    'templeDoorBoom',
    'templeStoneGroan',
    'sandfallStoneCascade',
    'distantRuinCollapse',
    'catacombDeepBreath',
    'catacombFogWhisper',
    'distantMonsterCall',
    'majorCaveIn',
    'bridgeStoneCrack',
    'structureRipping',
    'unstableExcavationTremor',
    'finalGuardianDread',
    'combatDangerHit',
    'ashaHurtBreath',
    ...requiredAmbientBassCues,
    ...requiredOpeningPresenceCues.map(([sfxKey]) => sfxKey),
  ].forEach((sfxKey) => {
    assert.match(egyptAudioTracksSource, new RegExp(`${sfxKey}:\\s*\\{`), `${sfxKey} should be configured`);
  });
});

test('opening scarab and Anubis presence cues have generated WAV assets', () => {
  requiredOpeningPresenceCues.forEach(([sfxKey, filename, generatorName]) => {
    assert.match(egyptAudioTracksSource, new RegExp(`${sfxKey}:\\s*\\{[\\s\\S]*?${filename}`), `${sfxKey} should use ${filename}`);
    assert.ok(
      existsSync(new URL(`../../../public/assets/expedition/sfx/generated/${filename}`, import.meta.url)),
      `${filename} should exist as a generated Expedition SFX asset`,
    );
    assert.match(sfxGeneratorSource, new RegExp(`def ${generatorName}\\(`), `${generatorName} should generate ${filename}`);
  });
});

test('Journey runtime plays event cue keys and schedules rare ambient threat sounds', () => {
  assert.match(journeyComponentSource, /if\s*\(ev\.sfxKey\)\s*\{/);
  assert.match(journeyComponentSource, /audioControls\?\.playExpeditionSfx\?\.\(ev\.sfxKey/);
  assert.match(journeyComponentSource, /current\.ambientDramaTimer/);
  assert.match(journeyComponentSource, /getAmbientDramaSfxKey/);
  assert.match(journeyComponentSource, /audioControls\?\.playExpeditionSfx\?\.\(ambientDramaSfxKey/);
  requiredAmbientBassCues.forEach((sfxKey) => {
    assert.match(journeyComponentSource, new RegExp(`AMBIENT_DRAMA_SFX_BY_SECTION[\\s\\S]*?'${sfxKey}'`), `${sfxKey} should be scheduled as ambient drama`);
  });
});

test('otherworldly ambience generator uses layered production-style sound design helpers', () => {
  ['soft_clip', 'cinematic_sub_stack', 'air_mass_texture', 'stone_stress_crackle'].forEach((helperName) => {
    assert.match(sfxGeneratorSource, new RegExp(`def ${helperName}\\(`), `${helperName} should exist`);
  });
  ['void_bass_swell', 'underworld_heart_drone', 'reality_tear_rumble'].forEach((fnName) => {
    const fnStart = sfxGeneratorSource.indexOf(`def ${fnName}(`);
    const nextFnStart = sfxGeneratorSource.indexOf('\ndef ', fnStart + 1);
    const fnBody = sfxGeneratorSource.slice(fnStart, nextFnStart === -1 ? undefined : nextFnStart);
    assert.match(fnBody, /cinematic_sub_stack\(/, `${fnName} should layer detuned sub weight`);
    assert.match(fnBody, /air_mass_texture\(/, `${fnName} should layer noisy air or room movement`);
    assert.match(fnBody, /soft_clip\(/, `${fnName} should saturate instead of sounding like raw tones`);
  });
});
