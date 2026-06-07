import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COMBAT_HIT_IMPACT_PROFILES,
  ENEMY_DEFEATED_VISIBLE_SECONDS,
  ENEMY_AGGRO_MEMORY_SECONDS,
  ENEMY_AGGRO_PATROL_PADDING,
  PLAYER_ATTACK_LIGHT_DAMAGE,
  PLAYER_ATTACK_PARRY_DAMAGE,
  PLAYER_ATTACK_FINISHER_DAMAGE,
  PLAYER_ATTACK_SHOVE_DAMAGE,
  PLAYER_ATTACK_TYPES,
  PLAYER_COMBO_MAX_STEP,
  PLAYER_COMBO_WINDOW_DURATION,
  PLAYER_DODGE_FRAME_SEQUENCE,
  PLAYER_HEAVY_FOLLOWUP_PROMPT_LABEL,
  SCORPION_CHASE_SPEED_MULTIPLIER,
  SCORPION_VENOM_SLOW_MULTIPLIER,
  isEnemyDefeatedVisible,
  updateEnemyDefeatedVisibility,
} from './journeyCombat.js';
import { COMBAT_DAMAGE_SCALE } from './journeyConstants.js';

test('defeated enemy visibility expires after the combat defeat delay', () => {
  assert.equal(ENEMY_DEFEATED_VISIBLE_SECONDS, 3);
  const enemy = { defeated: true, defeatedVisibleTimer: ENEMY_DEFEATED_VISIBLE_SECONDS };

  assert.equal(isEnemyDefeatedVisible(enemy), true);
  assert.equal(updateEnemyDefeatedVisibility(enemy, 2.9), true);
  assert.equal(enemy.defeatedVisibleTimer > 0, true);
  assert.equal(isEnemyDefeatedVisible(enemy), true);
  assert.equal(updateEnemyDefeatedVisibility(enemy, 0.1), false);
  assert.equal(enemy.defeatedVisibleTimer, 0);
  assert.equal(isEnemyDefeatedVisible(enemy), false);
});

test('active enemies remain drawable through the combat visibility predicate', () => {
  assert.equal(isEnemyDefeatedVisible({ defeated: false, defeatedVisibleTimer: 0 }), true);
  assert.equal(isEnemyDefeatedVisible(null), true);
});

test('combat constants expose the stable player and enemy tuning contract', () => {
  assert.deepEqual(PLAYER_ATTACK_TYPES, Object.freeze({ LIGHT: 'light', HEAVY: 'heavy' }));
  assert.equal(PLAYER_COMBO_MAX_STEP, 3);
  assert.equal(PLAYER_COMBO_WINDOW_DURATION, 0.72);
  assert.equal(PLAYER_HEAVY_FOLLOWUP_PROMPT_LABEL, 'K');
  assert.deepEqual(PLAYER_DODGE_FRAME_SEQUENCE, [0, 1, 2, 2, 2, 3, 3, 4, 5, 6, 7]);

  assert.equal(PLAYER_ATTACK_LIGHT_DAMAGE, 1 * COMBAT_DAMAGE_SCALE);
  assert.equal(PLAYER_ATTACK_PARRY_DAMAGE, 2 * COMBAT_DAMAGE_SCALE);
  assert.equal(PLAYER_ATTACK_FINISHER_DAMAGE, 3 * COMBAT_DAMAGE_SCALE);
  assert.equal(PLAYER_ATTACK_SHOVE_DAMAGE, Math.round(0.3 * COMBAT_DAMAGE_SCALE));

  assert.equal(SCORPION_CHASE_SPEED_MULTIPLIER, 1.15);
  assert.equal(SCORPION_VENOM_SLOW_MULTIPLIER, 0.48);
  assert.equal(ENEMY_AGGRO_MEMORY_SECONDS, 7.5);
  assert.equal(ENEMY_AGGRO_PATROL_PADDING, 320);
});

test('combat hit impact profiles preserve the expected effect keys', () => {
  assert.deepEqual(Object.keys(COMBAT_HIT_IMPACT_PROFILES), [
    'light',
    'combo2',
    'shove',
    'finisher',
    'blocked',
    'defeated',
  ]);
  assert.equal(COMBAT_HIT_IMPACT_PROFILES.light.slashEffect, 'combo');
  assert.equal(COMBAT_HIT_IMPACT_PROFILES.shove.sfxKey, 'combatHitCombo2');
  assert.equal(COMBAT_HIT_IMPACT_PROFILES.finisher.slashEffect, 'finisher');
  assert.equal(COMBAT_HIT_IMPACT_PROFILES.blocked.sfxKey, 'combatDeflect');
  assert.equal(COMBAT_HIT_IMPACT_PROFILES.defeated.sfxKey, 'enemyDefeated');
  assert.equal(COMBAT_HIT_IMPACT_PROFILES.defeated.sfxVolume, 1.08);
});
