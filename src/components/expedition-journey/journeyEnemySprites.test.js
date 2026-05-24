import assert from 'node:assert/strict';
import test from 'node:test';

import { getScarabQueenDrawBox, getScarabQueenSpriteFrame, shouldFlipBossSprite } from './journeyBossSprites.js';
import { getEnemySpriteDrawBox, shouldFlipEnemySprite } from './journeyEnemySprites.js';
import { PLAYER_SPRITE_DRAW_HEIGHT } from './journeyConstants.js';
import { readFileSync } from 'node:fs';

const journeyComponentSource = readFileSync(new URL('../ExpeditionJourney.jsx', import.meta.url), 'utf8');
const journeyUtilsSource = readFileSync(new URL('./journeyUtils.js', import.meta.url), 'utf8');
const journeyEnemySpritesSource = readFileSync(new URL('./journeyEnemySprites.js', import.meta.url), 'utf8');
const journeyBossSpritesSource = readFileSync(new URL('./journeyBossSprites.js', import.meta.url), 'utf8');
const enemySpriteGeneratorSource = readFileSync(new URL('../../../scripts/generate_enemy_sprite_sheets.py', import.meta.url), 'utf8');
const scarabQueenAtlas = JSON.parse(readFileSync(new URL('../../../public/assets/expedition/bosses/scarab-queen-sprites.json', import.meta.url), 'utf8'));

test('regular enemy sprite draw boxes stay close to gameplay hitbox scale', () => {
  const scarab = {
    id: 'scarab-start-1',
    name: 'Start Path Scarab',
    type: 'scarab',
    x: 255,
    y: 334,
    width: 30,
    height: 24,
    defeated: false,
  };

  const drawBox = getEnemySpriteDrawBox(scarab, 255, 0, 'patrol');

  assert.ok(drawBox, 'scarab draw box should resolve');
  assert.ok(drawBox.width >= 82, `scarab draw width should keep its deliberately large threat silhouette, received ${drawBox.width}`);
  assert.ok(drawBox.height >= 68, `scarab draw height should keep its deliberately large threat silhouette, received ${drawBox.height}`);
  assert.ok(drawBox.width <= 180, `scarab draw width should stay readable, received ${drawBox.width}`);
  assert.ok(drawBox.height <= 126, `scarab draw height should stay readable, received ${drawBox.height}`);
  assert.equal(drawBox.y + drawBox.height, scarab.y + scarab.height + 14, 'scarab sprite should be lowered enough that the visible PNG feet touch the sand');
  assert.equal(scarab.width, 30, 'visual size boost should not mutate the combat width');
  assert.equal(scarab.height, 24, 'visual size boost should not mutate the combat height');
});

test('scorpion sprites read larger than before while staying grounded', () => {
  const scorpion = {
    id: 'scorpion-start-1',
    name: 'Sand Scorpion',
    type: 'scorpion',
    x: 2853,
    y: 563,
    width: 44,
    height: 30,
    defeated: false,
  };

  const drawBox = getEnemySpriteDrawBox(scorpion, 320, 0, 'windup');

  assert.ok(drawBox, 'scorpion draw box should resolve');
  assert.ok(drawBox.width >= 96, `scorpion draw width should keep its deliberately large anti-jump silhouette, received ${drawBox.width}`);
  assert.ok(drawBox.height >= 80, `scorpion draw height should keep its deliberately large anti-jump silhouette, received ${drawBox.height}`);
  assert.ok(drawBox.width <= 230, `scorpion draw width should stay readable, received ${drawBox.width}`);
  assert.ok(drawBox.height <= 155, `scorpion draw height should stay readable, received ${drawBox.height}`);
  assert.equal(drawBox.y + drawBox.height, scorpion.y + scorpion.height + 15, 'scorpion sprite should stay grounded to the sand');
});

test('scorpion sting is a high anti-jump attack that hits harder through existing pattern data', () => {
  assert.match(journeyComponentSource, /scorpion: \{[\s\S]*?height: 58,[\s\S]*?yOffset: -34,[\s\S]*?backReach: 38,[\s\S]*?damageScale: 1\.45,/);
  assert.match(journeyComponentSource, /const SCORPION_ATTACK_RANGE_MULTIPLIER = 1\.4;/);
  assert.match(journeyComponentSource, /range: basePattern\.range \* SCORPION_ATTACK_RANGE_MULTIPLIER/);
  assert.match(journeyComponentSource, /const SCORPION_CHASE_SPEED_MULTIPLIER = 1\.15;/);
  assert.match(journeyComponentSource, /\(e\.type === 'scorpion' \? SCORPION_CHASE_SPEED_MULTIPLIER : 1\)/);
  assert.match(journeyComponentSource, /const scorpionStingCanReach = e\.type !== 'scorpion' \|\| rectsOverlap\(/);
  assert.match(journeyComponentSource, /nearPlayer && scorpionStingCanReach && e\.attackCooldown <= 0/);
  assert.match(journeyComponentSource, /const getAttackBox = useCallback\(\(attacker, range = 42, height = 28, direction = attacker\.direction \|\| 1, yOffset = 0, backReach = 0\) =>/);
  assert.match(journeyComponentSource, /const trailingReach = Math\.max\(0, backReach\);/);
  assert.match(journeyComponentSource, /y: attacker\.y \+ Math\.max\(4, \(attacker\.height - height\) \/ 2\) \+ yOffset,/);
  assert.match(journeyComponentSource, /width: range \+ trailingReach,/);
  assert.match(journeyComponentSource, /getAttackBox\(e, pattern\.range, pattern\.height, e\.attackDirection, pattern\.yOffset \|\| 0, pattern\.backReach \|\| 0\)/);
  assert.match(journeyComponentSource, /Math\.max\(e\.damage, Math\.round\(e\.damage \* \(pattern\.damageScale \|\| 1\)\)\)/);
});

test('scorpion tail blocks movement until defeated instead of allowing stomp bypass', () => {
  assert.match(journeyUtilsSource, /scorpion:\s*\{[\s\S]*?blocker:\s*\{[\s\S]*?minHeight:\s*220/);
  assert.match(journeyUtilsSource, /scorpion:\s*\{[\s\S]*?stomp:\s*\{\s*disabled:\s*true\s*\}/);
  assert.match(journeyUtilsSource, /export const getEnemyMovementBlockHitbox = \(enemy\) =>/);
  assert.match(journeyUtilsSource, /if \(enemy\.defeated\) return \{ type: 'none' \};[\s\S]*?const movementBlockHitbox = getEnemyMovementBlockHitbox\(enemy\);/);
  assert.match(journeyUtilsSource, /movementBlockHitbox && rectsOverlap\(getPlayerBodyHitbox\(player\), movementBlockHitbox\)/);
  assert.match(journeyUtilsSource, /blocked:\s*true/);
});

test('warrior mummy sprite draw box resolves as a grounded humanoid enemy', () => {
  const mummy = {
    id: 'warrior-mummy-start-1',
    name: 'Warrior Mummy',
    type: 'mummy',
    x: 292,
    y: 318,
    width: 34,
    height: 42,
  };

  const drawBox = getEnemySpriteDrawBox(mummy, 292, 0, 'patrol');

  assert.ok(drawBox, 'warrior mummy draw box should resolve');
  assert.equal(drawBox.family, 'mummy');
  assert.equal(drawBox.height, PLAYER_SPRITE_DRAW_HEIGHT * 1.265, 'warrior mummy should draw 15% larger than its previous Asha-relative scale');
  assert.equal(drawBox.y + drawBox.height, mummy.y + mummy.height + 15, 'warrior mummy sprite should stay grounded');
});

test('warrior mummy atlas is generated from the production sprite sheet source', () => {
  assert.match(enemySpriteGeneratorSource, /warrior-mummy-production-source-alpha\.png/);
  assert.match(enemySpriteGeneratorSource, /render_production_mummy_cell/);
  assert.doesNotMatch(enemySpriteGeneratorSource, /Mummy Warrior3\.jpg/);
  assert.doesNotMatch(enemySpriteGeneratorSource, /PROJECT_MUMMY_SOURCE = ROOT \/ "public" \/ "museum" \/ "egypt_mummy\.png"/);
});

test('looter atlas is a final raster sheet generated from the production motion source', () => {
  const looterAtlas = JSON.parse(readFileSync(new URL('../../../public/assets/expedition/enemies/looter-sprites.json', import.meta.url), 'utf8'));
  assert.match(enemySpriteGeneratorSource, /render_production_looter_cell/);
  assert.match(enemySpriteGeneratorSource, /asha-final-production-spritesheet\.json/);
  assert.match(journeyEnemySpritesSource, /enemy-sprite-packs-2026-05-23-final-looter/);
  assert.match(looterAtlas.source, /Final raster tomb looter atlas/);
  assert.equal(looterAtlas.productionReference, 'asha-final-production-spritesheet.json');
  assert.equal(looterAtlas.frameContract.length, 8);
  assert.ok(looterAtlas.regions.looterIdle.h > 200, 'looter frames should no longer use the tiny flat procedural silhouette');
});

test('sand-wisp flying enemy renders as the larger cinematic winged wisp', () => {
  const flyingScarab = {
    id: 'sand-wisp-start-1',
    name: 'Sand Wisp',
    type: 'sand-wisp',
    x: 760,
    y: 304,
    width: 32,
    height: 30,
    flying: true,
  };

  const drawBox = getEnemySpriteDrawBox(flyingScarab, 760, 0, 'patrol');

  assert.ok(drawBox, 'sand wisp draw box should resolve through the existing sand-wisp enemy family');
  assert.equal(drawBox.family, 'sandWisp');
  assert.ok(Math.abs(drawBox.height - 108.9894) < 0.001, `sand wisp should draw 25% larger than the last pass, received ${drawBox.height}`);
  assert.ok(drawBox.width >= drawBox.height * 1.9, `sand wisp should keep a wide upright-wing silhouette, received ${drawBox.width}x${drawBox.height}`);
  assert.match(journeyEnemySpritesSource, /sandWisp:\s*2\.041/);
  assert.match(journeyEnemySpritesSource, /enemy-sprite-packs-2026-05-23-final-looter/);
  assert.match(journeyEnemySpritesSource, /fetch\([^)]*versionQuery[^)]*\)/);
  assert.match(journeyEnemySpritesSource, /image\.src\s*=\s*`[^`]*getAtlasImagePath[^`]*versionQuery[^`]*`/);
  assert.match(enemySpriteGeneratorSource, /render_production_flying_scarab_cell/);
  assert.match(enemySpriteGeneratorSource, /SAND_WISP_CINEMATIC_SOURCE = ENEMY_DIR \/ "sand-wisp-cinematic-source-alpha\.png"/);
  assert.match(enemySpriteGeneratorSource, /get_sand_wisp_cinematic_frame/);
  assert.match(enemySpriteGeneratorSource, /ImageEnhance\.Sharpness\(sprite\)\.enhance\(1\.08\)/);
  assert.match(enemySpriteGeneratorSource, /"sandWisp": \{[\s\S]*?"render_cell": render_production_flying_scarab_cell,[\s\S]*?"source": "Cinematic turquoise and gold winged sand wisp/);
  assert.doesNotMatch(enemySpriteGeneratorSource, /flying-scarab-production-source-alpha\.png/);
});

test('scarabs use the same right-facing sprite orientation rules', () => {
  assert.equal(shouldFlipEnemySprite('scarab', 1), false, 'small scarab should not flip while facing right');
  assert.equal(shouldFlipEnemySprite('scarab', -1), true, 'small scarab should flip while facing left');
  assert.equal(shouldFlipBossSprite('scarab-queen', 1), false, 'new Scarab Queen sheets are wired to face the encounter without the old intro flip');
  assert.equal(shouldFlipBossSprite('scarab-queen', -1), true, 'new Scarab Queen sheets only flip for the opposite patrol direction');
});

test('Scarab Queen attack frames are prioritized over passive shield and counter states', () => {
  assert.match(journeyBossSpritesSource, /sequenceFrame\('scarabQueenWindup', 6, 115\)/);
  assert.match(journeyBossSpritesSource, /sequenceFrame\('scarabQueenAcidSpit', 8, 95\)/);
  assert.match(journeyBossSpritesSource, /sequenceFrame\('scarabQueenRun', 8, 85\)/);
  assert.match(journeyBossSpritesSource, /if \(bossId === 'scarab-queen'\) return facing < 0;/);
  assert.equal(getScarabQueenSpriteFrame({ id: 'scarab-queen', hitFlash: 0 }, 'windup', { shielded: true }, 230), 'scarabQueenWindup3');
  assert.equal(getScarabQueenSpriteFrame({ id: 'scarab-queen', hitFlash: 0 }, 'attacking', { shielded: true, attackKind: 'close' }, 255), 'scarabQueenRun4');
  assert.equal(getScarabQueenSpriteFrame({ id: 'scarab-queen', hitFlash: 0 }, 'attacking', { shielded: true, attackKind: 'area' }, 285), 'scarabQueenAcidSpit4');
});

test('Scarab Queen atlas is wired from the supplied final animation sheets', () => {
  assert.match(journeyBossSpritesSource, /boss-sprites-scarab-queen-user-sheets-2026-05-23/);
  assert.match(scarabQueenAtlas.source, /User-provided Scarab Queen raster animation sheets/);
  assert.equal(scarabQueenAtlas.productionReference, 'source/scarab-queen-2026-05-23/');
  assert.equal(scarabQueenAtlas.frameContract.length, 11);
  assert.equal(scarabQueenAtlas.sequences.walk.length, 8);
  assert.equal(scarabQueenAtlas.sequences.charge.length, 8);
  assert.equal(scarabQueenAtlas.sequences.windup.length, 6);
  assert.equal(scarabQueenAtlas.sequences.areaAttack.length, 8);
  assert.equal(scarabQueenAtlas.sequences.acidProjectile.length, 6);
  assert.equal(scarabQueenAtlas.sequences.defeated.length, 8);
  ['scarabQueenIdle', 'scarabQueenWalk1', 'scarabQueenAreaAttack', 'scarabQueenAcidSpit8', 'scarabQueenDeath8'].forEach((key) => {
    assert.ok(scarabQueenAtlas.regions[key], `${key} should be present in the final boss atlas`);
  });
});

test('Scarab Queen draw box matches the fixed atlas ratio closely enough to stay grounded', () => {
  const boss = {
    id: 'scarab-queen',
    x: 1395,
    y: 318,
    width: 58,
    height: 42,
  };

  const drawBox = getScarabQueenDrawBox(boss, 300);
  const atlasRatio = 560 / 390;
  const drawRatio = drawBox.width / drawBox.height;

  assert.ok(drawBox.width >= 390, `Queen draw width should be 50% larger and intimidating, received ${drawBox.width}`);
  assert.ok(drawBox.height >= 264, `Queen draw height should be 50% larger and intimidating, received ${drawBox.height}`);
  assert.ok(drawBox.width >= drawBox.height * atlasRatio * 0.95, `Queen draw box should be wide enough for fixed-cell atlas, received ratio ${drawRatio}`);
  assert.ok(Math.abs((drawBox.y + drawBox.height) - (boss.y + boss.height + 4)) < 0.001, 'Queen draw box should stay grounded to boss feet');
});

test('enemy attack tells use compact timing overlays without arcade labels', () => {
  assert.match(journeyComponentSource, /const drawEnemyAttackTell = useCallback\(\(ctx, enemy/);
  assert.match(journeyComponentSource, /if \(boss \|\| enemy\.defeated\) return/);
  assert.match(journeyComponentSource, /attackTellActive/);
  assert.match(journeyComponentSource, /recoveryWindowActive/);
  assert.doesNotMatch(journeyComponentSource, /const drawChargeLane = \(\) => \{/);
  assert.doesNotMatch(journeyComponentSource, /const drawCounterWindow = \(\) => \{/);
  assert.doesNotMatch(journeyComponentSource, /enemyVisibilityAssistActive = true/);
});

test('combat feedback avoids arcade text labels in the playfield', () => {
  assert.doesNotMatch(journeyComponentSource, /text:\s*'BOUNCE'/);
  assert.doesNotMatch(journeyComponentSource, /text:\s*'RESET'/);
  assert.doesNotMatch(journeyComponentSource, /text:\s*'WAIT'/);
  assert.doesNotMatch(journeyComponentSource, /text:\s*'HIT'/);
});

test('awakened boss health draws as a compact screen-top bar, not over the boss sprite', () => {
  assert.match(journeyComponentSource, /const healthCenterX = boss\.awakened \? CANVAS_WIDTH \/ 2 : visibleBox\.x \+ visibleBox\.width \/ 2;/);
  assert.match(journeyComponentSource, /const barWidth = boss\.awakened \? Math\.min\(390, CANVAS_WIDTH - 120\)/);
  assert.match(journeyComponentSource, /const barY = boss\.awakened \? 18 : Math\.max\(18, visibleBox\.y - 16\);/);
  assert.match(journeyComponentSource, /if \(boss\.id !== 'scarab-queen'\) \{[\s\S]*?drawContactShadow\(ctx, centerX, baseY \+ 3/);
});

test('player enemy hits trigger a small screen shake without changing gameplay state', () => {
  assert.match(journeyUtilsSource, /impactShakeTimer:\s*0/);
  assert.match(journeyComponentSource, /const PLAYER_HIT_SCREEN_SHAKE_DURATION = 0\.22;/);
  assert.match(journeyComponentSource, /const PLAYER_HIT_SCREEN_SHAKE_PIXELS = 2\.4;/);
  assert.match(journeyComponentSource, /player\.impactShakeTimer = Math\.max\(player\.impactShakeTimer \|\| 0, PLAYER_HIT_SCREEN_SHAKE_DURATION\);/);
  assert.match(journeyComponentSource, /playerImpactShakeProgress/);
  assert.match(journeyComponentSource, /ctx\.translate\(playerImpactShakeX, playerImpactShakeY\);/);
  assert.match(journeyComponentSource, /player\.impactShakeTimer = Math\.max\(0, \(player\.impactShakeTimer \|\| 0\) - dt\);/);
  assert.match(journeyComponentSource, /playerHitScreenShakeActive: \(current\.player\.impactShakeTimer \|\| 0\) > 0/);
});

test('active attack damage checks use the player body hitbox rather than the full sprite rectangle', () => {
  assert.match(journeyComponentSource, /const playerBodyHitbox = getPlayerBodyHitbox\(player\);/);
  assert.match(journeyComponentSource, /if \(!e\.attackHasHit && rectsOverlap\(enemyAttackBox, playerBodyHitbox\)\) \{/);
  assert.match(journeyComponentSource, /if \(!b\.attackHasHit && rectsOverlap\(bossAttackBox, getPlayerBodyHitbox\(player\)\)\) \{/);
  assert.doesNotMatch(journeyComponentSource, /contact\.type === 'damage' && rectsOverlap\(enemyAttackBox, getPlayerBodyHitbox\(player\)\)/);
});

test('collision boxes use type-aware tuning for the updated Asha and enemy sprites', () => {
  assert.match(journeyUtilsSource, /playerBody:\s*\{\s*insetX:\s*4,\s*topInset:\s*3,\s*bottomInset:\s*1\s*\}/);
  assert.match(journeyUtilsSource, /export const ENEMY_HITBOX_PROFILES = \{/);
  assert.match(journeyUtilsSource, /scarab:\s*\{[\s\S]*?damage:\s*\{[\s\S]*?widthScale:\s*1\.42[\s\S]*?stomp:\s*\{[\s\S]*?widthScale:\s*1\.34/);
  assert.match(journeyUtilsSource, /sandWisp:\s*\{[\s\S]*?damage:\s*\{[\s\S]*?widthScale:\s*1\.86[\s\S]*?minWidth:\s*62[\s\S]*?hurt:\s*\{[\s\S]*?minHeight:\s*38/);
  assert.match(journeyUtilsSource, /mummy:\s*\{[\s\S]*?damage:\s*\{[\s\S]*?heightScale:\s*1\.42[\s\S]*?hurt:\s*\{[\s\S]*?minHeight:\s*58/);
  assert.match(journeyUtilsSource, /export const getEnemyAttackHurtbox = \(enemy, \{ boss = false \} = \{\}\) => \{/);
  assert.match(journeyComponentSource, /getEnemyAttackHurtbox/);
  assert.match(journeyComponentSource, /return getEnemyAttackHurtbox\(hostile, \{ boss \}\);/);
});
