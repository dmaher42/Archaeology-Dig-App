import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BOSS_ATTACK_PHASES,
  COMBAT_HIT_IMPACT_PROFILES,
  DEFAULT_BOSS_ATTACK_PHASES,
  ENEMY_DEFEATED_VISIBLE_SECONDS,
  ENEMY_AGGRO_MEMORY_SECONDS,
  ENEMY_AGGRO_PATROL_PADDING,
  ENEMY_COMBAT_INTENTS,
  ENEMY_VENOM_PRESSURE_AGGRO_REACH_BONUS,
  ENEMY_VENOM_PRESSURE_CHASE_SPEED_MULTIPLIER,
  PLAYER_AIR_ATTACK_DAMAGE,
  PLAYER_AIR_ATTACK_HEIGHT,
  PLAYER_AIR_ATTACK_STAMINA_COST,
  PLAYER_AIR_ATTACK_TIMING,
  PLAYER_AIR_ATTACK_TYPE,
  PLAYER_AIR_ATTACK_Y_OFFSET,
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
  SCORPION_VENOM_ATTACK_PATTERN_TUNING,
  SCORPION_VENOM_REFRESH_WINDOW,
  SCORPION_VENOM_SLOW_MULTIPLIER,
  SCORPION_VENOM_STAMINA_DAMAGE,
  SNAKE_AMBUSH_LUNGE_PATTERN,
  WISP_DIVE_ATTACK_PATTERN,
  getScarabVaultOutcome,
  getEnemyCombatIntent,
  getEnemyIntentTuning,
  getEnemyVenomPressureTuning,
  isScarabArmorOpen,
  getPlayerAttackProfile,
  getEnemyFacingDirectionToPlayer,
  resolveEnemyCombatSide,
  shouldScarabFrontalArmorDeflect,
  shouldStunScarabChargeOnDodge,
  shouldVaultScarabCharge,
  shouldUseScorpionVenomSpit,
  shouldUseSnakeAmbushLunge,
  shouldUseWispDiveHarass,
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

test('airborne light attack gives jump a risky combat answer', () => {
  assert.equal(PLAYER_AIR_ATTACK_TYPE, 'air-light');
  assert.deepEqual(PLAYER_AIR_ATTACK_TIMING, {
    windup: 0.08,
    swing: 0.24,
    recoil: 0.22,
    cooldown: 0.32,
  });
  assert.equal(PLAYER_AIR_ATTACK_STAMINA_COST, 2);
  assert.equal(PLAYER_AIR_ATTACK_DAMAGE, 1 * COMBAT_DAMAGE_SCALE);
  assert.equal(PLAYER_AIR_ATTACK_HEIGHT, 66);
  assert.equal(PLAYER_AIR_ATTACK_Y_OFFSET, 12);

  const airborneProfile = getPlayerAttackProfile({
    queuedAttackType: PLAYER_ATTACK_TYPES.LIGHT,
    player: { onGround: false },
  });
  const groundedProfile = getPlayerAttackProfile({
    queuedAttackType: PLAYER_ATTACK_TYPES.LIGHT,
    player: { onGround: true },
  });
  const heavyProfile = getPlayerAttackProfile({
    queuedAttackType: PLAYER_ATTACK_TYPES.HEAVY,
    player: { onGround: false },
  });

  assert.equal(airborneProfile.attackType, PLAYER_AIR_ATTACK_TYPE);
  assert.equal(airborneProfile.timing, PLAYER_AIR_ATTACK_TIMING);
  assert.equal(airborneProfile.height, PLAYER_AIR_ATTACK_HEIGHT);
  assert.equal(airborneProfile.yOffset, PLAYER_AIR_ATTACK_Y_OFFSET);
  assert.equal(airborneProfile.staminaCost, PLAYER_AIR_ATTACK_STAMINA_COST);
  assert.equal(airborneProfile.damage, PLAYER_AIR_ATTACK_DAMAGE);
  assert.equal(airborneProfile.canPrimeHeavyFollowup, false);
  assert.equal(airborneProfile.downwardVelocity > 0, true);

  assert.equal(groundedProfile.attackType, PLAYER_ATTACK_TYPES.LIGHT);
  assert.equal(groundedProfile.canPrimeHeavyFollowup, true);
  assert.equal(heavyProfile.attackType, PLAYER_ATTACK_TYPES.HEAVY);
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

test('enemy combat intent resolver turns encounter data into battlefield jobs', () => {
  assert.equal(
    getEnemyCombatIntent({
      type: 'scorpion',
      encounterRole: 'route guardian enemy',
      protectsRouteId: 'mummification-chamber',
    }).id,
    ENEMY_COMBAT_INTENTS.ROUTE_DENY,
  );
  assert.equal(
    getEnemyCombatIntent({
      type: 'scorpion',
      pressureHint: 'Punishes careless jumps with venom pressure.',
    }).id,
    ENEMY_COMBAT_INTENTS.ANTI_AIR,
  );
  assert.equal(
    getEnemyCombatIntent({
      type: 'sand-wisp',
      flying: true,
      combatRole: 'ranged pressure enemy',
    }).id,
    ENEMY_COMBAT_INTENTS.RANGED_HARASS,
  );
  assert.equal(
    getEnemyCombatIntent({
      type: 'snake',
      encounterRole: 'ambush predator',
    }).id,
    ENEMY_COMBAT_INTENTS.AMBUSH,
  );
  assert.equal(
    getEnemyCombatIntent({
      type: 'scorpion-nest',
      combatRole: 'destructible spawner',
    }).id,
    ENEMY_COMBAT_INTENTS.SPAWNER,
  );
  assert.equal(getEnemyCombatIntent({ type: 'scarab' }).id, ENEMY_COMBAT_INTENTS.PATROL);
});

test('enemy combat intent tuning gives purposeful enemies stronger pursuit shape', () => {
  const routeDeny = getEnemyIntentTuning({
    type: 'scorpion',
    encounterRole: 'route guardian enemy',
    protectsRouteId: 'mummification-chamber',
  });
  assert.equal(routeDeny.pressureReachBonus, 52);
  assert.equal(routeDeny.pursuitPaddingBonus, 120);
  assert.equal(routeDeny.chaseMultiplier, 1.18);

  const antiAir = getEnemyIntentTuning({
    type: 'scorpion',
    pressureHint: 'Punishes careless jumps with venom pressure.',
  });
  assert.equal(antiAir.airborneAggro, true);
  assert.equal(antiAir.verticalAwareness, 168);

  const rangedHarass = getEnemyIntentTuning({ type: 'sand-wisp', flying: true });
  assert.equal(rangedHarass.standoffGapBonus, 28);
  assert.equal(rangedHarass.verticalAwareness, 178);

  assert.deepEqual(getEnemyIntentTuning({ type: 'scarab' }), {});
});

test('enemy facing updates when Asha crosses through its combat side', () => {
  const player = { x: 210, width: 38 };
  const enemy = {
    x: 160,
    width: 44,
    direction: -1,
  };

  assert.equal(getEnemyFacingDirectionToPlayer(enemy, player), 1);
  assert.equal(resolveEnemyCombatSide({ enemy, player, currentSide: 1 }), -1);
  assert.equal(resolveEnemyCombatSide({
    enemy: { ...enemy, x: 205, direction: 1 },
    player,
    currentSide: 1,
    crossingBuffer: 24,
  }), 1);
});

test('venom slow makes scarabs and scorpions more aggressive predators', () => {
  assert.equal(ENEMY_VENOM_PRESSURE_CHASE_SPEED_MULTIPLIER, 1.42);
  assert.equal(ENEMY_VENOM_PRESSURE_AGGRO_REACH_BONUS, 120);

  assert.deepEqual(getEnemyVenomPressureTuning({ type: 'scarab' }, 2.2), {
    active: true,
    chaseSpeedMultiplier: ENEMY_VENOM_PRESSURE_CHASE_SPEED_MULTIPLIER,
    aggroReachBonus: ENEMY_VENOM_PRESSURE_AGGRO_REACH_BONUS,
    aggroMemoryMultiplier: 1.22,
  });
  assert.deepEqual(getEnemyVenomPressureTuning({ type: 'scorpion' }, 1.1), {
    active: true,
    chaseSpeedMultiplier: ENEMY_VENOM_PRESSURE_CHASE_SPEED_MULTIPLIER,
    aggroReachBonus: ENEMY_VENOM_PRESSURE_AGGRO_REACH_BONUS,
    aggroMemoryMultiplier: 1.22,
  });
  assert.equal(getEnemyVenomPressureTuning({ type: 'snake' }, 2.2).active, false);
  assert.equal(getEnemyVenomPressureTuning({ type: 'scarab' }, 0).active, false);
});

test('scorpion venom pressure is quick enough to matter and can replace close sting pressure', () => {
  assert.equal(SCORPION_VENOM_ATTACK_PATTERN_TUNING.windup, 0.32);
  assert.ok(SCORPION_VENOM_ATTACK_PATTERN_TUNING.cooldown <= 1.15);
  assert.ok(SCORPION_VENOM_ATTACK_PATTERN_TUNING.recovery <= 0.46);
  assert.equal(SCORPION_VENOM_STAMINA_DAMAGE, 3);
  assert.equal(SCORPION_VENOM_REFRESH_WINDOW, 0.9);

  assert.equal(shouldUseScorpionVenomSpit({
    enemy: { type: 'scorpion' },
    scorpionVenomCanReach: true,
    venomSlowTimer: 0,
  }), true);
  assert.equal(shouldUseScorpionVenomSpit({
    enemy: { type: 'scorpion' },
    scorpionVenomCanReach: true,
    venomSlowTimer: 0.5,
  }), true);
  assert.equal(shouldUseScorpionVenomSpit({
    enemy: { type: 'scorpion' },
    scorpionVenomCanReach: true,
    venomSlowTimer: 2.4,
  }), false);
  assert.equal(shouldUseScorpionVenomSpit({
    enemy: { type: 'scorpion' },
    scorpionVenomCanReach: true,
    venomSlowTimer: 0,
  }), true);
  assert.equal(shouldUseScorpionVenomSpit({
    enemy: { type: 'scarab' },
    scorpionVenomCanReach: true,
    venomSlowTimer: 0,
  }), false);
});

test('sand wisps and bats dive harass Asha from above with a clean counter window', () => {
  assert.equal(WISP_DIVE_ATTACK_PATTERN.id, 'aerial-dive');
  assert.equal(WISP_DIVE_ATTACK_PATTERN.label, 'Aerial Dive');
  assert.equal(WISP_DIVE_ATTACK_PATTERN.airborneHarass, true);
  assert.equal(WISP_DIVE_ATTACK_PATTERN.protectedDuringWindup, false);
  assert.equal(WISP_DIVE_ATTACK_PATTERN.protectedDuringAttack, false);
  assert.ok(WISP_DIVE_ATTACK_PATTERN.windup <= 0.38);
  assert.ok(WISP_DIVE_ATTACK_PATTERN.height >= PLAYER_AIR_ATTACK_HEIGHT);
  assert.ok(WISP_DIVE_ATTACK_PATTERN.yOffset > 0);
  assert.ok(WISP_DIVE_ATTACK_PATTERN.vulnerableAfter >= 0.68);

  const playerBelow = {
    onGround: true,
    x: 160,
    y: 420,
    width: 38,
    height: 70,
  };
  const wispAbove = {
    type: 'sand-wisp',
    x: 110,
    y: 342,
    width: 58,
    height: 42,
    attackCooldown: 0,
    attackWindup: 0,
    attackTimer: 0,
    attackRecovery: 0,
    stunTimer: 0,
  };

  assert.equal(shouldUseWispDiveHarass({
    enemy: wispAbove,
    player: playerBelow,
    distanceToPlayer: 79,
    baseNearPlayerX: 240,
    awarenessMultiplier: 1,
    verticalAwareness: 178,
  }), true);
  assert.equal(shouldUseWispDiveHarass({
    enemy: { ...wispAbove, type: 'bat' },
    player: playerBelow,
    distanceToPlayer: 79,
    baseNearPlayerX: 240,
    awarenessMultiplier: 1,
    verticalAwareness: 178,
  }), true);
  assert.equal(shouldUseWispDiveHarass({
    enemy: { ...wispAbove, type: 'scarab' },
    player: playerBelow,
    distanceToPlayer: 79,
    baseNearPlayerX: 240,
    awarenessMultiplier: 1,
    verticalAwareness: 178,
  }), false);
  assert.equal(shouldUseWispDiveHarass({
    enemy: wispAbove,
    player: playerBelow,
    distanceToPlayer: 460,
    baseNearPlayerX: 240,
    awarenessMultiplier: 1,
    verticalAwareness: 178,
  }), false);
  assert.equal(shouldUseWispDiveHarass({
    enemy: wispAbove,
    player: { ...playerBelow, onGround: false, y: 268, vy: -120 },
    distanceToPlayer: 79,
    baseNearPlayerX: 240,
    awarenessMultiplier: 1,
    verticalAwareness: 178,
  }), false);
});

test('snake ambush lunge starts from mid-range and overshoots into a punish window', () => {
  assert.equal(SNAKE_AMBUSH_LUNGE_PATTERN.id, 'ambush-lunge');
  assert.equal(SNAKE_AMBUSH_LUNGE_PATTERN.label, 'Ambush Lunge');
  assert.equal(SNAKE_AMBUSH_LUNGE_PATTERN.lowLineThreat, true);
  assert.equal(SNAKE_AMBUSH_LUNGE_PATTERN.protectedDuringWindup, false);
  assert.equal(SNAKE_AMBUSH_LUNGE_PATTERN.protectedDuringAttack, false);
  assert.ok(SNAKE_AMBUSH_LUNGE_PATTERN.windup <= 0.5);
  assert.ok(SNAKE_AMBUSH_LUNGE_PATTERN.speed >= 230);
  assert.ok(SNAKE_AMBUSH_LUNGE_PATTERN.range >= 70);
  assert.ok(SNAKE_AMBUSH_LUNGE_PATTERN.height <= PLAYER_AIR_ATTACK_HEIGHT);
  assert.ok(SNAKE_AMBUSH_LUNGE_PATTERN.vulnerableAfter >= 0.82);

  const snake = {
    type: 'snake',
    x: 100,
    y: 430,
    width: 52,
    height: 24,
    attackCooldown: 0,
    attackWindup: 0,
    attackTimer: 0,
    attackRecovery: 0,
    stunTimer: 0,
  };
  const groundedPlayer = {
    onGround: true,
    x: 242,
    y: 386,
    width: 38,
    height: 70,
    vx: 120,
  };

  assert.equal(shouldUseSnakeAmbushLunge({
    enemy: snake,
    player: groundedPlayer,
    distanceToPlayer: 161,
    baseNearPlayerX: 210,
    awarenessMultiplier: 1,
    verticalAwareness: 142,
    meleeReachesPlayer: false,
  }), true);
  assert.equal(shouldUseSnakeAmbushLunge({
    enemy: snake,
    player: groundedPlayer,
    distanceToPlayer: 32,
    baseNearPlayerX: 210,
    awarenessMultiplier: 1,
    verticalAwareness: 142,
    meleeReachesPlayer: true,
  }), false);
  assert.equal(shouldUseSnakeAmbushLunge({
    enemy: snake,
    player: groundedPlayer,
    distanceToPlayer: 340,
    baseNearPlayerX: 210,
    awarenessMultiplier: 1,
    verticalAwareness: 142,
    meleeReachesPlayer: false,
  }), false);
  assert.equal(shouldUseSnakeAmbushLunge({
    enemy: snake,
    player: { ...groundedPlayer, onGround: false, y: 286, vy: -80 },
    distanceToPlayer: 161,
    baseNearPlayerX: 210,
    awarenessMultiplier: 1,
    verticalAwareness: 142,
    meleeReachesPlayer: false,
  }), false);
  assert.equal(shouldUseSnakeAmbushLunge({
    enemy: { ...snake, type: 'scarab' },
    player: groundedPlayer,
    distanceToPlayer: 161,
    baseNearPlayerX: 210,
    awarenessMultiplier: 1,
    verticalAwareness: 142,
    meleeReachesPlayer: false,
  }), false);
  assert.equal(shouldUseSnakeAmbushLunge({
    enemy: { ...snake, attackRecovery: 0.2 },
    player: groundedPlayer,
    distanceToPlayer: 161,
    baseNearPlayerX: 210,
    awarenessMultiplier: 1,
    verticalAwareness: 142,
    meleeReachesPlayer: false,
  }), false);
});

test('scarab vault only triggers when Asha stomps an active charge', () => {
  const chargingScarab = {
    type: 'scarab',
    attackPattern: 'charge',
    attackTimer: 0.18,
  };

  assert.equal(shouldVaultScarabCharge({
    enemy: chargingScarab,
    contact: { type: 'stomp' },
    pattern: { id: 'charge' },
  }), true);
  assert.equal(shouldVaultScarabCharge({
    enemy: { ...chargingScarab, attackPattern: 'heavy-charge' },
    contact: { type: 'stomp' },
    pattern: { id: 'heavy-charge' },
  }), true);
  assert.equal(shouldVaultScarabCharge({
    enemy: { ...chargingScarab, attackTimer: 0 },
    contact: { type: 'stomp' },
    pattern: { id: 'charge' },
  }), false);
  assert.equal(shouldVaultScarabCharge({
    enemy: { ...chargingScarab, type: 'scorpion' },
    contact: { type: 'stomp' },
    pattern: { id: 'venom-skitter' },
  }), false);
  assert.equal(shouldVaultScarabCharge({
    enemy: chargingScarab,
    contact: { type: 'damage' },
    pattern: { id: 'charge' },
  }), false);
});

test('scarab vault outcome bounces Asha and opens a punish window without stomp damage', () => {
  const outcome = getScarabVaultOutcome({ jumpSpeed: 520 });

  assert.equal(outcome.lastAttackResult, 'scarab-vault');
  assert.equal(outcome.playerVy, -322.4);
  assert.equal(outcome.enemyStunTimer, 0.9);
  assert.equal(outcome.attackRecovery, 0.95);
  assert.equal(outcome.vulnerabilityTimer, 1.05);
  assert.equal(outcome.attackCooldown, 1.05);
  assert.equal(outcome.damage, 0);
  assert.equal(outcome.notice, '');
});

test('scarab front armor only deflects while the shell is closed', () => {
  const playerInFront = { x: 154, width: 38 };
  const closedScarab = {
    type: 'scarab',
    x: 100,
    width: 44,
    direction: 1,
    stunTimer: 0,
    attackRecovery: 0,
    vulnerabilityTimer: 0,
  };

  assert.equal(isScarabArmorOpen(closedScarab), false);
  assert.equal(shouldScarabFrontalArmorDeflect({
    enemy: closedScarab,
    player: playerInFront,
  }), true);
  assert.equal(shouldScarabFrontalArmorDeflect({
    enemy: { ...closedScarab, stunTimer: 0.4 },
    player: playerInFront,
  }), false);
  assert.equal(shouldScarabFrontalArmorDeflect({
    enemy: { ...closedScarab, attackRecovery: 0.3 },
    player: playerInFront,
  }), false);
  assert.equal(shouldScarabFrontalArmorDeflect({
    enemy: { ...closedScarab, vulnerabilityTimer: 0.2 },
    player: playerInFront,
  }), false);
  assert.equal(shouldScarabFrontalArmorDeflect({
    enemy: closedScarab,
    player: { ...playerInFront, x: 36 },
  }), false);
});

test('dodging an active scarab charge should skid it into the stun opening', () => {
  const chargingScarab = {
    type: 'scarab',
    attackPattern: 'charge',
    attackTimer: 0.22,
  };

  assert.equal(shouldStunScarabChargeOnDodge({
    enemy: chargingScarab,
    pattern: { id: 'charge' },
  }), true);
  assert.equal(shouldStunScarabChargeOnDodge({
    enemy: { ...chargingScarab, attackPattern: 'heavy-charge' },
    pattern: { id: 'heavy-charge' },
  }), true);
  assert.equal(shouldStunScarabChargeOnDodge({
    enemy: { ...chargingScarab, attackTimer: 0 },
    pattern: { id: 'charge' },
  }), false);
  assert.equal(shouldStunScarabChargeOnDodge({
    enemy: { ...chargingScarab, type: 'snake' },
    pattern: { id: 'ambush-lunge' },
  }), false);
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
