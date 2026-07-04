import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getScarabQueenDrawBox,
  getScarabQueenSpriteFrame,
  SCARAB_QUEEN_DRAW_OFFSET_X,
  SCARAB_QUEEN_FOOT_SINK,
  shouldFlipBossSprite,
} from './journeyBossSprites.js';
import {
  EXPECTED_SAND_SNAKE_SPRITE_KEYS,
  getEnemyBodyLanguagePose,
  getEnemySpriteDebugAtlasState,
  SAND_SNAKE_SPRITE_ATLAS_JSON,
  getEnemySpriteDrawBox,
  getEnemySpriteFrame,
  shouldUseEnemySpritePack,
  shouldFlipEnemySprite,
} from './journeyEnemySprites.js';
import {
  ENEMY_DEFEATED_VISIBLE_SECONDS,
  isEnemyDefeatedVisible,
  PLAYER_ATTACK_BACK_REACH,
  PLAYER_ATTACK_HEIGHT,
  PLAYER_ATTACK_RANGE,
  updateEnemyDefeatedVisibility,
} from './journeyCombat.js';
import {
  getEnemyAttackHurtbox,
  rectsOverlap,
} from './journeyUtils.js';
import { journeyComponentSource, journeyRendererSource } from './journeySourceText.test-utils.mjs';
import { readFileSync } from 'node:fs';

const journeyUtilsSource = readFileSync(new URL('./journeyUtils.js', import.meta.url), 'utf8');
const journeyCombatSource = readFileSync(new URL('./journeyCombat.js', import.meta.url), 'utf8');
const journeyEnemySpritesSource = readFileSync(new URL('./journeyEnemySprites.js', import.meta.url), 'utf8');
const journeyBossSpritesSource = readFileSync(new URL('./journeyBossSprites.js', import.meta.url), 'utf8');
const useJourneyRendererSource = journeyRendererSource;
const useJourneySnapshotSource = readFileSync(new URL('./useJourneySnapshot.js', import.meta.url), 'utf8');
const enemySpriteGeneratorSource = readFileSync(new URL('../../../scripts/generate_enemy_sprite_sheets.py', import.meta.url), 'utf8');
const scarabQueenBuilderSource = readFileSync(new URL('../../../scripts/build_scarab_queen_atlas.py', import.meta.url), 'utf8');
const scarabQueenAtlas = JSON.parse(readFileSync(new URL('../../../public/assets/expedition/bosses/scarab-queen-sprites.json', import.meta.url), 'utf8'));
const journeyCombatContractSource = journeyCombatSource.replace(/\bexport const\b/g, 'const');
const journeyGameplayContractSource = [
  journeyComponentSource,
  journeyCombatContractSource,
].join('\n');

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
  assert.ok(drawBox.width <= 280, `scorpion draw width should stay readable, received ${drawBox.width}`);
  assert.ok(drawBox.height <= 190, `scorpion draw height should stay readable, received ${drawBox.height}`);
  assert.equal(drawBox.y + drawBox.height, scorpion.y + scorpion.height + 15, 'scorpion sprite should stay grounded to the sand');
});

test('scorpion sting is a high anti-jump attack that hits harder through existing pattern data', () => {
  assert.match(journeyComponentSource, /scorpion: \{[\s\S]*?height: 58,[\s\S]*?yOffset: -34,[\s\S]*?backReach: 38,[\s\S]*?damageScale: 1\.45,/);
  assert.match(journeyGameplayContractSource, /const SCORPION_ATTACK_RANGE_MULTIPLIER = 1\.4;/);
  assert.match(journeyComponentSource, /range: basePattern\.range \* SCORPION_ATTACK_RANGE_MULTIPLIER/);
  assert.match(journeyGameplayContractSource, /const SCORPION_CHASE_SPEED_MULTIPLIER = 1\.15;/);
  assert.match(journeyGameplayContractSource, /const ENEMY_VENOM_PRESSURE_CHASE_SPEED_MULTIPLIER = 1\.42/);
  assert.match(journeyGameplayContractSource, /const getEnemyVenomPressureTuning = \(enemy = \{\}, venomSlowTimer = 0\) => \{/);
  assert.match(journeyComponentSource, /const venomPressureTuning = getEnemyVenomPressureTuning\(e, player\.venomSlowTimer \|\| 0\)/);
  assert.match(journeyComponentSource, /venomPursuitBoost \* \(e\.type === 'scorpion' \? SCORPION_CHASE_SPEED_MULTIPLIER : 1\)/);
  assert.match(journeyComponentSource, /const meleeReachesPlayer = rectsOverlap\(/);
  assert.match(journeyGameplayContractSource, /const SCORPION_ANTI_AIR_ATTACK_PATTERN = \{[\s\S]*?id:\s*'anti-air-sting'[\s\S]*?height:\s*104[\s\S]*?airbornePunish:\s*true/);
  assert.match(journeyComponentSource, /const shouldUseScorpionAntiAir = shouldUseScorpionAntiAirSting\(\{/);
  assert.match(journeyGameplayContractSource, /const SCORPION_VENOM_ATTACK_PATTERN_TUNING = Object\.freeze\(\{[\s\S]*?windup:\s*0\.32[\s\S]*?cooldown:\s*1\.1[\s\S]*?staminaDamage:\s*SCORPION_VENOM_STAMINA_DAMAGE/);
  assert.match(journeyGameplayContractSource, /const shouldUseScorpionVenomSpit = \(\{[\s\S]*?venomSlowTimer[\s\S]*?SCORPION_VENOM_REFRESH_WINDOW/);
  assert.match(journeyComponentSource, /const shouldUseVenomSpit = shouldUseScorpionVenomSpit\(\{[\s\S]*?venomSlowTimer:\s*player\.venomSlowTimer \|\| 0/);
  assert.match(journeyComponentSource, /const enemyCanStartAttack = \(nearPlayer && meleeReachesPlayer\) \|\| shouldUseScorpionAntiAir \|\| shouldUseVenomSpit \|\| shouldUseWispDive \|\| shouldUseSnakeAmbush \|\| scarabPoisonChargeCanReach;/);
  assert.match(journeyComponentSource, /enemyCanStartAttack && e\.attackCooldown <= 0/);
  assert.match(journeyComponentSource, /const getAttackBox = useCallback\(\(attacker, range = 42, height = 28, direction = attacker\.direction \|\| 1, yOffset = 0, backReach = 0\) =>/);
  assert.match(journeyComponentSource, /const trailingReach = Math\.max\(0, backReach\);/);
  assert.match(journeyComponentSource, /y: attacker\.y \+ Math\.max\(4, \(attacker\.height - height\) \/ 2\) \+ yOffset,/);
  assert.match(journeyComponentSource, /width: range \+ trailingReach,/);
  assert.match(journeyComponentSource, /getAttackBox\(e, pattern\.range, pattern\.height, e\.attackDirection, pattern\.yOffset \|\| 0, pattern\.backReach \|\| 0\)/);
  assert.match(journeyComponentSource, /Math\.max\(e\.damage, Math\.round\(e\.damage \* \(pattern\.damageScale \|\| 1\)\)\)/);
});

test('scorpion denies stomps while body contact stays deliberately harmless', () => {
  assert.match(journeyUtilsSource, /scorpion:\s*\{[\s\S]*?stomp:\s*\{\s*disabled:\s*true\s*\}/);
  // Body contact is harmless by design (attacks and stomps are the only damage paths),
  // so no movement-blocker hitbox machinery should remain.
  assert.doesNotMatch(journeyUtilsSource, /getEnemyMovementBlockHitbox/);
  assert.match(journeyUtilsSource, /Body contact is deliberately harmless/);
  // Jump-overs are punished by the raised sting attack box, not by a body blocker.
  assert.match(journeyComponentSource, /scorpion:\s*\{[\s\S]*?height:\s*58,\s*yOffset:\s*-34/);
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
  assert.equal(drawBox.height, 108 * 1.46, 'warrior mummy draw height is fixed to the current enemy base scale and does not change with Asha\'s draw height');
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
  assert.match(journeyEnemySpritesSource, /enemy-sprite-packs-2026-06-03-scarab-attack-read/);
  assert.match(looterAtlas.source, /Final raster tomb looter atlas/);
  assert.equal(looterAtlas.productionReference, 'asha-final-production-spritesheet.json');
  assert.equal(looterAtlas.frameContract.length, 8);
  assert.ok(looterAtlas.regions.looterIdle.h > 200, 'looter frames should no longer use the tiny flat procedural silhouette');
});

test('looter captain and stone guardian use accepted premium enemy atlases', () => {
  const looterCaptainAtlas = JSON.parse(readFileSync(new URL('../../../public/assets/expedition/enemies/looter-captain-sprites-premium-2026-06-02.json', import.meta.url), 'utf8'));
  const stoneGuardianAtlas = JSON.parse(readFileSync(new URL('../../../public/assets/expedition/enemies/stone-guardian-enemy-sprites-premium-2026-06-02.json', import.meta.url), 'utf8'));

  assert.match(journeyEnemySpritesSource, /looter-captain-sprites-premium-2026-06-02\.json/);
  assert.match(journeyEnemySpritesSource, /stone-guardian-enemy-sprites-premium-2026-06-02\.json/);
  assert.match(looterCaptainAtlas.source, /Premium raster Egyptian looter captain atlas/);
  assert.match(stoneGuardianAtlas.source, /Premium raster Egyptian stone guardian enemy atlas/);
  assert.equal(looterCaptainAtlas.frameContract.length, 8);
  assert.equal(stoneGuardianAtlas.frameContract.length, 8);
  assert.ok(looterCaptainAtlas.regions.looterCaptainIdle.h > 300, 'looter captain should no longer use the tiny flat procedural silhouette');
  assert.ok(stoneGuardianAtlas.regions.stoneGuardianEnemyIdle.h > 300, 'stone guardian should no longer use the blocky placeholder silhouette');
  assert.equal(shouldUseEnemySpritePack({ type: 'guardian', name: 'Stone Guardian' }), true);
  assert.equal(shouldUseEnemySpritePack({ type: 'statue', name: 'Cursed Statue' }), false);
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
  assert.ok(Math.abs(drawBox.height - 85.728) < 0.001, `sand wisp should draw at the current cinematic-wing scale, received ${drawBox.height}`);
  assert.ok(drawBox.width >= drawBox.height * 1.9, `sand wisp should keep a wide upright-wing silhouette, received ${drawBox.width}x${drawBox.height}`);
  assert.match(journeyEnemySpritesSource, /sandWisp:\s*1\.52/);
  assert.match(journeyEnemySpritesSource, /enemy-sprite-packs-2026-06-03-scarab-attack-read/);
  assert.match(journeyEnemySpritesSource, /fetch\([^)]*versionQuery[^)]*\)/);
  assert.match(journeyEnemySpritesSource, /image\.src\s*=\s*`[^`]*getAtlasImagePath[^`]*versionQuery[^`]*`/);
  assert.match(enemySpriteGeneratorSource, /render_production_flying_scarab_cell/);
  assert.match(enemySpriteGeneratorSource, /SAND_WISP_CINEMATIC_SOURCE = ENEMY_DIR \/ "sand-wisp-cinematic-source-alpha\.png"/);
  assert.match(enemySpriteGeneratorSource, /get_sand_wisp_cinematic_frame/);
  assert.match(enemySpriteGeneratorSource, /ImageEnhance\.Sharpness\(sprite\)\.enhance\(1\.08\)/);
  assert.match(enemySpriteGeneratorSource, /"sandWisp": \{[\s\S]*?"render_cell": render_production_flying_scarab_cell,[\s\S]*?"source": "Cinematic turquoise and gold winged sand wisp/);
  assert.doesNotMatch(enemySpriteGeneratorSource, /flying-scarab-production-source-alpha\.png/);
});

test('live sand snake pack uses the promoted painted viper runtime atlas', () => {
  assert.equal(
    SAND_SNAKE_SPRITE_ATLAS_JSON,
    'assets/expedition/enemies/sand-viper-painted-sprites-2026-07-04.json',
  );

  const atlas = JSON.parse(readFileSync(new URL('../../../public/assets/expedition/enemies/sand-viper-painted-sprites-2026-07-04.json', import.meta.url), 'utf8'));
  assert.equal(atlas.image, 'sand-viper-painted-sprites-2026-07-04.png');
  assert.match(atlas.source, /Promoted painted Sand Viper runtime atlas/);
  assert.notEqual(atlas.status, 'candidate-unapproved');
  assert.equal(atlas.frameContract.length, 8);
  EXPECTED_SAND_SNAKE_SPRITE_KEYS.forEach((key) => {
    assert.ok(atlas.regions[key], `${key} should be present in the promoted painted snake atlas`);
  });
  assert.ok(atlas.regions.snakeAttack.w > atlas.regions.snakeWindup.w, 'lunge frame should read longer than the coiled windup');
  assert.ok(atlas.regions.snakeWindup.h > atlas.regions.snakeAttack.h, 'coiled windup should read taller than the low lunge');
});

test('debug sprite atlas state reports family-specific enemy packs', () => {
  const debugState = getEnemySpriteDebugAtlasState(
    {
      loaded: true,
      failed: false,
      atlasPath: 'assets/expedition/enemies/small-enemy-sprites.json',
      packs: {
        small: {
          loaded: true,
          ready: true,
          failed: false,
          atlasPath: 'assets/expedition/enemies/small-enemy-sprites.json',
        },
        snake: {
          loaded: true,
          ready: true,
          failed: false,
          atlasPath: 'assets/expedition/enemies/sand-viper-painted-sprites-2026-07-04.json',
        },
        scarab: {
          loaded: true,
          ready: true,
          failed: false,
          atlasPath: 'assets/expedition/enemies/desert-scarab-intimidating-sprites-heavy-windup-attack-2026-06-03.json',
        },
      },
    },
    ['snake', 'scarab'],
  );

  assert.equal(debugState.enemySpriteAtlasPath, 'assets/expedition/enemies/small-enemy-sprites.json');
  assert.equal(
    debugState.enemySpriteAtlasPaths.snake,
    'assets/expedition/enemies/sand-viper-painted-sprites-2026-07-04.json',
  );
  assert.equal(
    debugState.visibleEnemySpriteAtlasPaths.snake,
    'assets/expedition/enemies/sand-viper-painted-sprites-2026-07-04.json',
  );
  assert.equal(
    debugState.visibleEnemySpriteAtlasPaths.scarab,
    'assets/expedition/enemies/desert-scarab-intimidating-sprites-heavy-windup-attack-2026-06-03.json',
  );
  assert.equal(debugState.enemySpritePackStatus.snake.ready, true);
  assert.match(useJourneySnapshotSource, /getEnemySpriteDebugAtlasState/);
  assert.match(useJourneySnapshotSource, /\.\.\.enemySpriteDebugAtlasState/);
});

test('Scarab Queen keeps the left-facing atlas orientation while small scarabs use their own rules', () => {
  assert.equal(shouldFlipEnemySprite('scarab', 1), false, 'small scarab should not flip while facing right');
  assert.equal(shouldFlipEnemySprite('scarab', -1), true, 'small scarab should flip while facing left');
  assert.equal(shouldFlipBossSprite('scarab-queen', -1), false, 'Scarab Queen atlas already faces left toward Asha');
  assert.equal(shouldFlipBossSprite('scarab-queen', 1), true, 'Scarab Queen should only flip when moving or attacking right');
});

test('Scarab Queen attack frames are prioritized over passive shield and counter states', () => {
  assert.match(journeyBossSpritesSource, /sequenceFrame\('scarabQueenWindup', 6, 115\)/);
  assert.match(journeyBossSpritesSource, /sequenceFrame\('scarabQueenAcidSpit', 8, 95\)/);
  assert.match(journeyBossSpritesSource, /sequenceFrame\('scarabQueenRun', 8, 85\)/);
  assert.match(journeyBossSpritesSource, /if \(bossId === 'scarab-queen'\) return facing > 0;/);
  assert.equal(getScarabQueenSpriteFrame({ id: 'scarab-queen', hitFlash: 0 }, 'windup', { shielded: true }, 230), 'scarabQueenWindup3');
  assert.equal(getScarabQueenSpriteFrame({ id: 'scarab-queen', hitFlash: 0 }, 'attacking', { shielded: true, attackKind: 'close' }, 255), 'scarabQueenRun4');
  assert.equal(getScarabQueenSpriteFrame({ id: 'scarab-queen', hitFlash: 0 }, 'attacking', { shielded: true, attackKind: 'area' }, 285), 'scarabQueenAcidSpit4');
});

test('Scarab Queen atlas is wired from the supplied final animation sheets', () => {
  assert.match(journeyBossSpritesSource, /boss-sprites-scarab-queen-regenerated-v2-2026-05-26/);
  assert.match(scarabQueenBuilderSource, /SOURCE_DIR = BOSS_DIR \/ "source" \/ "scarab-queen-v2-generated"/);
  assert.match(scarabQueenBuilderSource, /"scarabQueenWalk": \("walk", 8\)/);
  assert.match(scarabQueenBuilderSource, /scarab-walk-regeneration-02-accepted-raw\.png/);
  assert.match(scarabQueenBuilderSource, /scarab-run-regeneration-03-accepted-raw\.png/);
  assert.match(scarabQueenBuilderSource, /scarab-death-regeneration-02-accepted-raw\.png/);
  assert.match(scarabQueenBuilderSource, /COMPONENT_SLICED_SHEETS: set\[str\] = set\(\)/);
  assert.doesNotMatch(scarabQueenBuilderSource, /\[clean_fallen_pose\(source_frames\["death"\]\[7\]\)\] \* 8/);
  assert.doesNotMatch(scarabQueenBuilderSource, /source_frames\["death"\] = \[clean_fallen_pose\(frame\) for frame in source_frames\["death"\]\]/);
  assert.match(journeyBossSpritesSource, /SCARAB_QUEEN_ANIMATED_SPRITE_KEYS/);
  assert.match(journeyBossSpritesSource, /numberedSpriteKeys\('scarabQueenWalk', 8\)/);
  assert.match(journeyBossSpritesSource, /numberedSpriteKeys\('scarabQueenDeath', 8\)/);
  assert.match(scarabQueenAtlas.source, /Accepted Scarab Queen regenerated raster animation sheets/);
  assert.equal(scarabQueenAtlas.productionReference, 'source/scarab-queen-v2-generated/');
  assert.equal(scarabQueenAtlas.acceptedRegenerations.walk, 'scarab-walk-regeneration-02-accepted-raw.png');
  assert.equal(scarabQueenAtlas.acceptedRegenerations.run, 'scarab-run-regeneration-03-accepted-raw.png');
  assert.equal(scarabQueenAtlas.acceptedRegenerations.death, 'scarab-death-regeneration-02-accepted-raw.png');
  assert.equal(scarabQueenAtlas.frameContract.length, 11);
  assert.equal(scarabQueenAtlas.sequences.walk.length, 8);
  assert.equal(scarabQueenAtlas.sequences.walk[0], 'scarabQueenWalk1');
  assert.equal(scarabQueenAtlas.sequences.charge.length, 8);
  assert.equal(scarabQueenAtlas.sequences.windup.length, 6);
  assert.equal(scarabQueenAtlas.sequences.areaAttack.length, 8);
  assert.equal(scarabQueenAtlas.sequences.acidProjectile.length, 6);
  assert.equal(scarabQueenAtlas.sequences.defeated.length, 8);
  assert.equal(scarabQueenAtlas.sequences.defeated[7], 'scarabQueenDeath8');
  [
    ...scarabQueenAtlas.sequences.walk,
    ...scarabQueenAtlas.sequences.charge,
    ...scarabQueenAtlas.sequences.windup,
    ...scarabQueenAtlas.sequences.areaAttack,
    ...scarabQueenAtlas.sequences.acidProjectile,
    ...scarabQueenAtlas.sequences.counterWindow,
    ...scarabQueenAtlas.sequences.defeated,
  ].forEach((key) => {
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
  assert.ok(Math.abs((drawBox.y + drawBox.height) - (boss.y + boss.height + SCARAB_QUEEN_FOOT_SINK)) < 0.001, 'Queen draw box should sink enough to compensate for transparent foot padding');
  assert.equal(
    drawBox.x,
    300 + boss.width / 2 - drawBox.width / 2 + SCARAB_QUEEN_DRAW_OFFSET_X,
    'Queen art should stay huge but sit farther into the arena so Asha remains readable',
  );
});

test('Scarab Queen combat hurtbox follows the oversized visible sprite', () => {
  const boss = {
    id: 'scarab-queen',
    x: 1395,
    y: 318,
    width: 58,
    height: 42,
  };

  const drawBox = getScarabQueenDrawBox(boss, boss.x);
  const hurtbox = getEnemyAttackHurtbox(boss, { boss: true });
  const player = {
    x: drawBox.x - 18,
    y: boss.y + boss.height - 42,
    width: 28,
    height: 42,
    direction: 1,
  };
  const attackBox = {
    x: player.x + player.width - PLAYER_ATTACK_BACK_REACH,
    y: player.y + Math.max(4, (player.height - PLAYER_ATTACK_HEIGHT) / 2),
    width: PLAYER_ATTACK_RANGE + PLAYER_ATTACK_BACK_REACH,
    height: PLAYER_ATTACK_HEIGHT,
  };

  assert.ok(hurtbox.x < boss.x, 'Queen hurtbox should extend left into her visible sprite, not stay on the tiny logic body');
  assert.ok(hurtbox.width > boss.width * 3, 'Queen hurtbox should match the large boss art scale');
  assert.ok(rectsOverlap(attackBox, hurtbox), 'Asha should be able to hit the visible left side of the Scarab Queen');
});

test('enemy attack tells use compact timing overlays without arcade labels', () => {
  assert.match(useJourneyRendererSource, /export function drawEnemyAttackTellFrame\(ctx, enemy/);
  assert.match(useJourneyRendererSource, /if \(boss \|\| enemy\.defeated\) return/);
  assert.match(journeyComponentSource, /attackTellActive/);
  assert.match(journeyComponentSource, /recoveryWindowActive/);
  assert.doesNotMatch(journeyComponentSource, /const drawChargeLane = \(\) => \{/);
  assert.doesNotMatch(journeyComponentSource, /const drawCounterWindow = \(\) => \{/);
  assert.doesNotMatch(journeyComponentSource, /enemyVisibilityAssistActive = true/);
});

test('Phase 5C early desert combat feedback uses compact color-coded visual cues', () => {
  assert.match(useJourneyRendererSource, /const pulse = 0\.72 \+ Math\.sin\(now \/ 90\) \* 0\.18/);
  assert.match(useJourneyRendererSource, /drawDeflectRing/);
  assert.match(useJourneyRendererSource, /recoveryGoldPulse/);
  assert.match(useJourneyRendererSource, /const telegraph = getEnemyAttackTelegraph\(enemy, HEAVY_ATTACK_PATTERNS\)/);
  assert.match(useJourneyRendererSource, /ctx\.fillStyle = telegraph\.color/);
  assert.match(useJourneyRendererSource, /const parryNow = telegraph\.parryable && enemy\.attackTimer <= PARRY_WINDOW_DURATION/);
  assert.match(useJourneyRendererSource, /ctx\.ellipse\(centerX, footY, enemy\.width \* 0\.78, 4\.5/);
  assert.match(journeyComponentSource, /enemy-guard-deflect/);
  assert.match(journeyComponentSource, /enemy-counter-window[\s\S]*?color:\s*'#d6b95c'/);
  assert.match(journeyComponentSource, /guardEffectType = 'enemy-guard-deflect'/);
  assert.match(journeyComponentSource, /effect\.type === 'enemy-guard-deflect'[\s\S]*?rgba\(214, 185, 92, 0\.78\)/);
  assert.doesNotMatch(journeyComponentSource, /text:\s*'WAIT'/);
  assert.doesNotMatch(journeyComponentSource, /text:\s*'COUNTER'/);
  assert.doesNotMatch(journeyComponentSource, /text:\s*'DEFLECT'/);
});

test('Phase 5C animation-led desert telegraphs use body language instead of larger overlays', () => {
  const scarabScout = {
    id: 'scarab-scout-1',
    name: 'Scarab Scout',
    type: 'scarab',
    x: 705,
    y: 334,
    width: 34,
    height: 26,
    direction: 1,
    attackDirection: 1,
  };
  const sealWarden = {
    id: 'scorpion-seal-path-1',
    name: 'Seal Warden Scorpion',
    type: 'scorpion',
    x: 1095,
    y: 328,
    width: 46,
    height: 30,
    direction: -1,
    attackDirection: -1,
  };

  assert.equal(getEnemySpriteFrame(scarabScout, 'cooldown', 0), 'scarabHit');
  assert.equal(getEnemySpriteFrame(sealWarden, 'cooldown', 0), 'scorpionHit');
  assert.equal(getEnemyBodyLanguagePose(scarabScout, 'windup').offsetX < 0, true, 'Scarab Scout should brace backward before charge');
  assert.equal(getEnemyBodyLanguagePose(scarabScout, 'attacking').offsetX > 0, true, 'Scarab Scout should commit forward during charge');
  assert.equal(getEnemyBodyLanguagePose(scarabScout, 'cooldown').offsetY > 0, true, 'Scarab Scout should dip/skid in recovery');
  assert.equal(getEnemyBodyLanguagePose(sealWarden, 'windup').offsetY < 0, true, 'Seal Warden should raise/lock posture during guarded windup');
  assert.equal(getEnemyBodyLanguagePose(sealWarden, 'cooldown').offsetY > 0, true, 'Seal Warden should look overextended in recovery');
  assert.match(journeyComponentSource, /getEnemyBodyLanguagePose\(enemy, combatMode\)/);
  assert.match(journeyComponentSource, /ctx\.rotate\(bodyPose\.rotation\)/);
  assert.match(journeyComponentSource, /sand-skid/);
  assert.doesNotMatch(useJourneyRendererSource, /drawDeflectRing\(16 \+ \(1 - progress\) \* 16/);
});

test('snake ambush body language reads as coil, lunge, then punish opening', () => {
  const snake = {
    id: 'sand-snake-ambush-1',
    name: 'Sand Snake',
    type: 'snake',
    x: 100,
    y: 430,
    width: 52,
    height: 24,
    direction: 1,
    attackDirection: 1,
  };

  assert.equal(getEnemySpriteFrame(snake, 'windup', 0), 'snakeWindup');
  assert.equal(getEnemySpriteFrame(snake, 'attacking', 0), 'snakeAttack');
  assert.equal(getEnemySpriteFrame(snake, 'cooldown', 0), 'snakeHit');
  assert.equal(getEnemyBodyLanguagePose(snake, 'windup').offsetX < 0, true, 'snake should coil back before the ambush lunge');
  assert.equal(getEnemyBodyLanguagePose(snake, 'attacking').offsetX > 0, true, 'snake should visibly commit forward during the lunge');
  assert.equal(getEnemyBodyLanguagePose(snake, 'cooldown').offsetY > 0, true, 'snake should slump low during the punish opening');
  assert.match(useJourneyRendererSource, /pattern\.lowLineThreat/);
});

test('Egypt heavy windups use dedicated premium atlas frames without changing normal windups', () => {
  const scarabScout = {
    id: 'scarab-scout-1',
    name: 'Scarab Scout',
    type: 'scarab',
    attackPattern: 'charge',
  };
  const heavyScarab = {
    ...scarabScout,
    attackPattern: 'heavy-charge',
  };
  const sealWarden = {
    id: 'scorpion-seal-path-1',
    name: 'Seal Warden Scorpion',
    type: 'scorpion',
    attackPattern: 'sting',
  };
  const heavyScorpion = {
    ...sealWarden,
    attackPattern: 'power-sting',
  };

  assert.equal(getEnemySpriteFrame(scarabScout, 'windup', 0), 'scarabWindup');
  assert.equal(getEnemySpriteFrame(sealWarden, 'windup', 0), 'scorpionWindup');
  assert.equal(getEnemySpriteFrame(heavyScarab, 'windup', 0), 'scarabHeavyWindup1');
  assert.equal(getEnemySpriteFrame(heavyScarab, 'windup', 180), 'scarabHeavyWindup2');
  assert.equal(getEnemySpriteFrame(heavyScorpion, 'windup', 0), 'scorpionHeavyWindup1');
  assert.equal(getEnemySpriteFrame(heavyScorpion, 'windup', 180), 'scorpionHeavyWindup2');
  assert.equal(getEnemySpriteFrame(heavyScarab, 'attacking', 0), 'scarabAttack');
  assert.match(journeyEnemySpritesSource, /scarabHeavyWindup1/);
  assert.match(journeyEnemySpritesSource, /scorpionHeavyWindup1/);
  assert.match(journeyEnemySpritesSource, /desert-scarab-intimidating-sprites-heavy-windup-attack-2026-06-03\.json/);
});

test('combat feedback avoids arcade text labels in the playfield', () => {
  assert.doesNotMatch(journeyComponentSource, /text:\s*'BOUNCE'/);
  assert.doesNotMatch(journeyComponentSource, /text:\s*'RESET'/);
  assert.doesNotMatch(journeyComponentSource, /text:\s*'WAIT'/);
  assert.doesNotMatch(journeyComponentSource, /text:\s*'HIT'/);
});

test('defeated enemies remain visible briefly then disappear from the playfield', () => {
  assert.equal(ENEMY_DEFEATED_VISIBLE_SECONDS, 3);
  const enemy = { defeated: true, defeatedVisibleTimer: ENEMY_DEFEATED_VISIBLE_SECONDS };

  assert.equal(isEnemyDefeatedVisible(enemy), true);
  assert.equal(updateEnemyDefeatedVisibility(enemy, 2.9), true);
  assert.equal(enemy.defeatedVisibleTimer > 0, true);
  assert.equal(isEnemyDefeatedVisible(enemy), true);
  assert.equal(updateEnemyDefeatedVisibility(enemy, 0.1), false);
  assert.equal(enemy.defeatedVisibleTimer, 0);
  assert.equal(isEnemyDefeatedVisible(enemy), false);

  assert.match(journeyUtilsSource, /defeatedVisibleTimer:\s*0/);
  assert.match(journeyComponentSource, /e\.defeatedVisibleTimer = ENEMY_DEFEATED_VISIBLE_SECONDS;/);
  assert.match(journeyComponentSource, /if \(e\.defeated\) \{[\s\S]*?updateEnemyDefeatedVisibility\(e, dt\);[\s\S]*?return;[\s\S]*?\}/);
  assert.match(journeyComponentSource, /if \(!isEnemyDefeatedVisible\(enemy\)\) return;/);
});

test('awakened boss health draws as a compact screen-top bar, not over the boss sprite', () => {
  assert.match(useJourneyRendererSource, /const healthCenterX = boss\.awakened \? CANVAS_WIDTH \/ 2 : visibleBox\.x \+ visibleBox\.width \/ 2;/);
  assert.match(useJourneyRendererSource, /const barWidth = boss\.awakened \? Math\.min\(390, CANVAS_WIDTH - 120\)/);
  assert.match(useJourneyRendererSource, /const barY = boss\.awakened \? 18 : Math\.max\(18, visibleBox\.y - 16\);/);
  assert.match(useJourneyRendererSource, /if \(boss\.id !== 'scarab-queen'\) \{[\s\S]*?drawContactShadow\(ctx, centerX, baseY \+ 3/);
});

test('player enemy hits trigger a small screen shake without changing gameplay state', () => {
  assert.match(journeyUtilsSource, /impactShakeTimer:\s*0/);
  assert.match(journeyGameplayContractSource, /const PLAYER_HIT_SCREEN_SHAKE_DURATION = 0\.22;/);
  assert.match(journeyGameplayContractSource, /const PLAYER_HIT_SCREEN_SHAKE_PIXELS = 2\.4;/);
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

test('combat boss debug start pins the snapshot to the boss section', () => {
  assert.match(journeyComponentSource, /if \(target === 'journey-boss-start'\) \{/);
  assert.match(journeyComponentSource, /current\.currentSectionId = boss\.sectionId;/);
  assert.match(journeyComponentSource, /current\.lastSectionId = boss\.sectionId;/);
  assert.match(journeyComponentSource, /const fallbackSection = getSectionForX\(current\.player\.x\);/);
  assert.match(journeyComponentSource, /const sectionId = current\.currentSectionId \|\| fallbackSection\.id;/);
  assert.match(journeyComponentSource, /const section = SECTIONS\.find\(item => item\.id === sectionId\) \|\| fallbackSection;/);
});
