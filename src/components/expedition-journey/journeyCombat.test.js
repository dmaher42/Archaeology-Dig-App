import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BOSS_ATTACK_PHASES,
  COMBAT_HIT_IMPACT_PROFILES,
  DEFAULT_BOSS_ATTACK_PHASES,
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
  beginEnemyAttackWindup,
  beginEnemyAttackSwing,
  openEnemyCounterWindow,
  suppressEnemyForBossFocus,
  updateEnemyCombatTimers,
  isEnemyDefeatedVisible,
  updateEnemyDefeatedVisibility,
} from './journeyCombat.js';
import { COMBAT_DAMAGE_SCALE } from './journeyConstants.js';
import { ROME_LEGATE_REVENANT_BOSS_ID } from './rome/romeBossSprites.js';

const assertClose = (actual, expected) => {
  assert.ok(Math.abs(actual - expected) < 0.000001, `expected ${actual} to be close to ${expected}`);
};

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

test('enemy combat timers tick down without crossing below zero', () => {
  const enemy = {
    hitFlash: 0.5,
    stunTimer: 0.3,
    attackWindup: 0.1,
    attackTimer: 0.2,
    attackCooldown: 0.4,
    attackRecovery: 0.6,
    aggroMemoryTimer: 0.8,
    vulnerabilityTimer: 0.05,
    shieldTimer: 0.9,
    knockbackTimer: 0.7,
  };

  const wasAttacking = updateEnemyCombatTimers(enemy, 0.25);

  assert.equal(wasAttacking, true);
  assertClose(enemy.hitFlash, 0.25);
  assertClose(enemy.stunTimer, 0.05);
  assert.equal(enemy.attackWindup, 0);
  assert.equal(enemy.attackTimer, 0);
  assertClose(enemy.attackCooldown, 0.15);
  assertClose(enemy.attackRecovery, 0.35);
  assertClose(enemy.aggroMemoryTimer, 0.55);
  assert.equal(enemy.vulnerabilityTimer, 0);
  assertClose(enemy.shieldTimer, 0.65);
  assertClose(enemy.knockbackTimer, 0.45);
});

test('boss focus suppression clears normal enemy runtime pressure', () => {
  const enemy = {
    attackWindup: 0.5,
    attackTimer: 0.4,
    attackReady: true,
    attackRecovery: 0.3,
    vulnerabilityTimer: 0.2,
    shieldTimer: 0.1,
    aggroMemoryTimer: 1.5,
    attackCooldown: 0.1,
  };

  suppressEnemyForBossFocus(enemy);

  assert.equal(enemy.attackWindup, 0);
  assert.equal(enemy.attackTimer, 0);
  assert.equal(enemy.attackReady, false);
  assert.equal(enemy.attackRecovery, 0);
  assert.equal(enemy.vulnerabilityTimer, 0);
  assert.equal(enemy.shieldTimer, 0);
  assert.equal(enemy.aggroMemoryTimer, 0);
  assert.equal(enemy.attackCooldown, 0.45);
});

test('enemy counter window opens from the finished attack pattern', () => {
  const enemy = {
    attackRecovery: 0,
    vulnerabilityTimer: 0,
  };
  const pattern = {
    recovery: 0.62,
    vulnerableAfter: 0.34,
  };

  openEnemyCounterWindow(enemy, pattern);

  assert.equal(enemy.attackRecovery, 0.62);
  assert.equal(enemy.vulnerabilityTimer, 0.34);
});

test('enemy attack swing begins from the ready windup state', () => {
  const enemy = {
    attackReady: true,
    attackTimer: 0,
  };
  const pattern = {
    duration: 0.48,
  };

  beginEnemyAttackSwing(enemy, pattern);

  assert.equal(enemy.attackTimer, 0.48);
  assert.equal(enemy.attackReady, false);
});

test('enemy attack windup stores the selected pattern and combat state', () => {
  const enemy = {
    attackWindup: 0,
    attackDirection: 0,
    attackHasHit: true,
    attackReady: false,
    attackPattern: null,
    attackPhaseLabel: null,
    attackCooldown: 0,
    vulnerabilityTimer: 0.4,
    shieldTimer: 0,
  };
  const pattern = {
    id: 'tail-lash',
    label: 'tail lash',
    windup: 0.31,
    shieldDuringWindup: true,
  };

  beginEnemyAttackWindup(enemy, pattern, {
    attackDirection: -1,
    attackCooldown: 0.82,
  });

  assert.equal(enemy.attackWindup, 0.31);
  assert.equal(enemy.attackDirection, -1);
  assert.equal(enemy.attackHasHit, false);
  assert.equal(enemy.attackReady, true);
  assert.equal(enemy.attackPattern, 'tail-lash');
  assert.equal(enemy.attackPhaseLabel, 'tail lash');
  assert.equal(enemy.attackCooldown, 0.82);
  assert.equal(enemy.vulnerabilityTimer, 0);
  assertClose(enemy.shieldTimer, 0.217);
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

test('boss attack phase data lives with combat contracts', () => {
  assert.deepEqual(DEFAULT_BOSS_ATTACK_PHASES.map(phase => phase.id), ['heavy-swipe', 'pulse-ring']);
  assert.equal(DEFAULT_BOSS_ATTACK_PHASES[0].label, 'Heavy Swipe');
  assert.equal(DEFAULT_BOSS_ATTACK_PHASES[1].shieldDuringWindup, true);

  assert.deepEqual(Object.keys(BOSS_ATTACK_PHASES), [
    'scarab-queen',
    'temple-guardian',
    'giant-serpent',
    'looter-captain',
    'ancient-construct',
    ROME_LEGATE_REVENANT_BOSS_ID,
  ]);
  assert.equal(BOSS_ATTACK_PHASES['scarab-queen'][0].id, 'queen-charge');
  assert.equal(BOSS_ATTACK_PHASES['ancient-construct'][1].label, 'Core Pulse');
  assert.equal(BOSS_ATTACK_PHASES[ROME_LEGATE_REVENANT_BOSS_ID][1].shieldDuringWindup, true);
});
