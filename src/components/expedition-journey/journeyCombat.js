import {
  ATTACK_COOLDOWN,
  ATTACK_DURATION,
  ATTACK_RECOIL_DURATION,
  ATTACK_WINDUP_DURATION,
  CANVAS_WIDTH,
  COMBAT_DAMAGE_SCALE,
} from './journeyConstants.js';
import { ROME_LEGATE_REVENANT_BOSS_ID } from './rome/romeBossSprites.js';

export const COMBAT_CHALLENGE_MODE = 'skill-windows-v1';
export const COMBAT_INTENSITY_VERSION = 'combat-impact-pressure-2026-05-16';
export const PLAYER_ATTACK_STAMINA_COST = 1;
export const MISSED_ATTACK_EXTRA_STAMINA_COST = 1;
export const PROTECTED_HIT_EXTRA_STAMINA_COST = 1;
// Dodge must stay cheaper than eating a hit (enemy hits cost ~6-10 Endurance),
// otherwise the game teaches players that dodging is not worth the cost.
export const PLAYER_DODGE_STAMINA_COST = 4;
export const PLAYER_DODGE_SPEED = 320;
export const PLAYER_DODGE_DURATION = 0.34;
export const PLAYER_DODGE_INVULNERABLE_DURATION = 0.22;
export const PLAYER_DODGE_RECOVERY_DURATION = 0.1;
export const PLAYER_DODGE_FRAME_SEQUENCE = [0, 1, 2, 2, 2, 3, 3, 4, 5, 6, 7];
export const PLAYER_COMBO_WINDOW_DURATION = 0.72;
export const PLAYER_COMBO_PRESERVE_AFTER_DODGE_DURATION = 0.62;
export const PLAYER_COMBO_MAX_STEP = 3;
export const PLAYER_ATTACK_TYPES = Object.freeze({
  LIGHT: 'light',
  HEAVY: 'heavy',
});
export const PLAYER_AIR_ATTACK_TYPE = 'air-light';
export const PLAYER_HEAVY_FOLLOWUP_PROMPT_LABEL = 'K';
export const PLAYER_HEAVY_FOLLOWUP_CUE_DURATION = 0.42;
export const PLAYER_ATTACK_LIGHT_DAMAGE = 1 * COMBAT_DAMAGE_SCALE;
export const PLAYER_ATTACK_PARRY_DAMAGE = 2 * COMBAT_DAMAGE_SCALE;
export const PLAYER_ATTACK_FINISHER_DAMAGE = 3 * COMBAT_DAMAGE_SCALE;
export const PLAYER_ATTACK_SHOVE_DAMAGE = Math.round(0.3 * COMBAT_DAMAGE_SCALE);
export const PLAYER_ATTACK_FINISHER_EXTRA_STAMINA_COST = 2;
export const PLAYER_HEAVY_FOLLOWUP_HIT_REFUND = 6;
export const PLAYER_DEFEAT_ENDURANCE_REWARD = 4;
export const PLAYER_BOSS_STAGGER_ENDURANCE_REWARD = 10;
export const PLAYER_ATTACK_RANGE = 92;
export const PLAYER_ATTACK_HEIGHT = 36;
export const PLAYER_ATTACK_BACK_REACH = 10;
export const PLAYER_AIR_ATTACK_DAMAGE = 1 * COMBAT_DAMAGE_SCALE;
export const PLAYER_AIR_ATTACK_STAMINA_COST = 2;
export const PLAYER_AIR_ATTACK_RANGE = 84;
export const PLAYER_AIR_ATTACK_HEIGHT = 66;
export const PLAYER_AIR_ATTACK_BACK_REACH = 8;
export const PLAYER_AIR_ATTACK_Y_OFFSET = 12;
export const PLAYER_AIR_ATTACK_DOWNWARD_VELOCITY = 120;
export const PLAYER_AIR_ATTACK_FORWARD_BOOST = 48;
export const PLAYER_ATTACK_NEAR_MISS_DISTANCE = 44;
export const PLAYER_ATTACK_NEAR_MISS_VERTICAL_TOLERANCE = 34;
export const PLAYER_ATTACK_FINISHER_ROW = 'attack_pick_swing_sweep';
export const PLAYER_COMBO_SLASH_EFFECT_SRC = 'assets/expedition/player/asha-combo-slash-effect-2026-06-06.png';
export const PLAYER_COMBO_SLASH_EFFECT_VERSION = 'asha-combo-slash-effect-2026-06-06';
export const PLAYER_FINISHER_SLASH_EFFECT_SRC = 'assets/expedition/player/asha-finisher-slash-effect-2026-06-06.png';
export const PLAYER_FINISHER_SLASH_EFFECT_VERSION = 'asha-finisher-slash-effect-2026-06-06';
// How long a J/K press made while Asha is still mid-attack stays remembered.
// Keeps combat responsive instead of eating inputs pressed a beat early.
export const PLAYER_ATTACK_INPUT_BUFFER_DURATION = 0.3;
export const PLAYER_ATTACK_COMBO_TIMINGS = [
  // Opening light hit is deliberately snappier than the shared defaults so J feels
  // quick and decisive; heavies and the finisher keep their weight below.
  { windup: 0.1, swing: 0.3, recoil: 0.14, cooldown: 0.3 },
  { windup: ATTACK_WINDUP_DURATION, swing: ATTACK_DURATION, recoil: ATTACK_RECOIL_DURATION, cooldown: ATTACK_COOLDOWN },
  { windup: 0.18, swing: 0.52, recoil: 0.28, cooldown: 0.5 },
];
export const PLAYER_AIR_ATTACK_TIMING = Object.freeze({
  windup: 0.08,
  swing: 0.24,
  recoil: 0.22,
  cooldown: 0.32,
});
export const getPlayerComboAttackTiming = (sequenceIndex = 1) => {
  const timingIndex = Math.max(0, sequenceIndex - 1) % PLAYER_ATTACK_COMBO_TIMINGS.length;
  return PLAYER_ATTACK_COMBO_TIMINGS[timingIndex] || PLAYER_ATTACK_COMBO_TIMINGS[0];
};
export const getPlayerAttackProfile = ({
  queuedAttackType = PLAYER_ATTACK_TYPES.LIGHT,
  player = {},
  heavyFollowupPrimed = false,
} = {}) => {
  const isHeavyAttack = queuedAttackType === PLAYER_ATTACK_TYPES.HEAVY;
  const isAirLightAttack = queuedAttackType === PLAYER_ATTACK_TYPES.LIGHT && !player.onGround;
  if (isAirLightAttack) {
    return {
      attackType: PLAYER_AIR_ATTACK_TYPE,
      sequenceIndex: 1,
      timing: PLAYER_AIR_ATTACK_TIMING,
      range: PLAYER_AIR_ATTACK_RANGE,
      height: PLAYER_AIR_ATTACK_HEIGHT,
      backReach: PLAYER_AIR_ATTACK_BACK_REACH,
      yOffset: PLAYER_AIR_ATTACK_Y_OFFSET,
      damage: PLAYER_AIR_ATTACK_DAMAGE,
      staminaCost: PLAYER_AIR_ATTACK_STAMINA_COST,
      canPrimeHeavyFollowup: false,
      downwardVelocity: PLAYER_AIR_ATTACK_DOWNWARD_VELOCITY,
      forwardBoost: PLAYER_AIR_ATTACK_FORWARD_BOOST,
    };
  }

  const sequenceIndex = heavyFollowupPrimed
    ? PLAYER_COMBO_MAX_STEP
    : isHeavyAttack
      ? 2
      : 1;
  return {
    attackType: isHeavyAttack ? PLAYER_ATTACK_TYPES.HEAVY : PLAYER_ATTACK_TYPES.LIGHT,
    sequenceIndex,
    timing: getPlayerComboAttackTiming(sequenceIndex),
    range: PLAYER_ATTACK_RANGE,
    height: PLAYER_ATTACK_HEIGHT,
    backReach: PLAYER_ATTACK_BACK_REACH,
    yOffset: 0,
    damage: null,
    staminaCost: PLAYER_ATTACK_STAMINA_COST,
    canPrimeHeavyFollowup: !isHeavyAttack && !heavyFollowupPrimed,
    downwardVelocity: 0,
    forwardBoost: 0,
  };
};
export const PLAYER_HIT_SCREEN_SHAKE_DURATION = 0.22;
export const PLAYER_HIT_SCREEN_SHAKE_PIXELS = 2.4;
export const SCORPION_ATTACK_RANGE_MULTIPLIER = 1.4;
export const SCORPION_CHASE_SPEED_MULTIPLIER = 1.15;
export const SCORPION_VENOM_SPIT_RANGE = CANVAS_WIDTH * 0.5;
export const SCORPION_VENOM_SLOW_DURATION = 3.6;
export const SCORPION_VENOM_SLOW_MULTIPLIER = 0.48;
export const SCORPION_VENOM_REFRESH_WINDOW = 0.9;
export const SCORPION_VENOM_STAMINA_DAMAGE = 3;
export const SCORPION_VENOM_ATTACK_PATTERN_TUNING = Object.freeze({
  windup: 0.32,
  duration: 0.42,
  cooldown: 1.1,
  recovery: 0.42,
  vulnerableAfter: 0.54,
  damageScale: 0.55,
  staminaDamage: SCORPION_VENOM_STAMINA_DAMAGE,
});
export const ENEMY_AGGRO_MEMORY_SECONDS = 7.5;
export const ENEMY_AGGRO_PATROL_PADDING = 320;
export const ENEMY_DEFEATED_VISIBLE_SECONDS = 3;
export const ENEMY_VENOM_PRESSURE_CHASE_SPEED_MULTIPLIER = 1.42;
export const ENEMY_VENOM_PRESSURE_AGGRO_REACH_BONUS = 120;
export const ENEMY_VENOM_PRESSURE_AGGRO_MEMORY_MULTIPLIER = 1.22;
const ENEMY_VENOM_PRESSURE_TYPES = new Set(['scarab', 'scorpion']);
export const SCORPION_ANTI_AIR_ATTACK_PATTERN = {
  id: 'anti-air-sting',
  label: 'Tail Raise',
  windup: 0.54,
  duration: 0.32,
  cooldown: 1.75,
  recovery: 0.82,
  vulnerableAfter: 0.9,
  speed: 22,
  range: 38,
  height: 104,
  yOffset: -82,
  backReach: 34,
  damageScale: 1.35,
  airbornePunish: true,
  shieldDuringWindup: false,
  protectedDuringWindup: false,
  protectedDuringAttack: false,
  color: '#f59e0b',
};
const WISP_DIVE_ENEMY_TYPES = new Set(['sand-wisp', 'bat']);
export const WISP_DIVE_HARASS_RANGE = CANVAS_WIDTH * 0.42;
export const WISP_DIVE_ATTACK_PATTERN = {
  id: 'aerial-dive',
  label: 'Aerial Dive',
  windup: 0.34,
  duration: 0.32,
  cooldown: 1.32,
  recovery: 0.58,
  vulnerableAfter: 0.72,
  speed: 226,
  range: 54,
  height: 82,
  yOffset: 24,
  backReach: 20,
  damageScale: 1.1,
  airborneHarass: true,
  shieldDuringWindup: false,
  protectedDuringWindup: false,
  protectedDuringAttack: false,
  color: '#38bdf8',
};
export const SNAKE_AMBUSH_LUNGE_START_RANGE = CANVAS_WIDTH * 0.32;
export const SNAKE_AMBUSH_LUNGE_PATTERN = {
  id: 'ambush-lunge',
  label: 'Ambush Lunge',
  windup: 0.58,
  duration: 0.3,
  cooldown: 1.62,
  recovery: 0.94,
  vulnerableAfter: 1.12,
  speed: 214,
  range: 82,
  height: 32,
  yOffset: 4,
  backReach: 8,
  damageScale: 1.18,
  lowLineThreat: true,
  overshootsOnMiss: true,
  shieldDuringWindup: false,
  protectedDuringWindup: false,
  protectedDuringAttack: false,
  color: '#b45309',
};
const SCARAB_CHARGE_PATTERN_IDS = new Set(['charge', 'heavy-charge']);
export const SCARAB_VAULT_OUTCOME = Object.freeze({
  bounceMultiplier: 0.62,
  enemyStunTimer: 0.9,
  attackRecovery: 0.95,
  vulnerabilityTimer: 1.05,
  attackCooldown: 1.05,
  hitStopTimer: 0.06,
  cameraShakeTimer: 0.09,
  cameraShakeStrength: 0.16,
  lastAttackResult: 'scarab-vault',
  damage: 0,
  notice: '',
});
export const ENEMY_COMBAT_INTENTS = Object.freeze({
  PATROL: 'patrol',
  PRESSURE: 'pressure',
  ROUTE_DENY: 'route-deny',
  ANTI_AIR: 'anti-air',
  RANGED_HARASS: 'ranged-harass',
  AMBUSH: 'ambush',
  DUELIST: 'duelist',
  SPAWNER: 'spawner',
});

const getEnemyIntentText = (enemy = {}) => ([
  enemy.id,
  enemy.name,
  enemy.type,
  enemy.combatPurpose,
  enemy.encounterRole,
  enemy.combatRole,
  enemy.pressureHint,
  enemy.protectsRouteId,
].filter(Boolean).join(' ').toLowerCase());

const enemyIntentTextIncludes = (enemy, terms) => {
  const text = getEnemyIntentText(enemy);
  return terms.some(term => text.includes(term));
};

export const getEnemyCombatIntent = (enemy = {}) => {
  if (enemy.type === 'scorpion-nest' || enemyIntentTextIncludes(enemy, ['spawner', 'spawn', 'nest'])) {
    return {
      id: ENEMY_COMBAT_INTENTS.SPAWNER,
      label: 'Spawner',
      reason: 'Creates pressure until Asha chooses to destroy it.',
    };
  }
  if (
    enemy.protectsRouteId
    || enemy.routeBlocker === true
    || enemyIntentTextIncludes(enemy, ['route guardian', 'seal warden', 'protects the seal', 'protects route', 'objective-defense'])
  ) {
    return {
      id: ENEMY_COMBAT_INTENTS.ROUTE_DENY,
      label: 'Route Denial',
      reason: 'Guards a path or reward and should actively hold that line.',
    };
  }
  if (
    enemy.type === 'scorpion'
    && (
      enemy.openingRouteRamp
      || enemy.firstSealRouteRamp
      || enemyIntentTextIncludes(enemy, ['jump', 'air', 'anti-air', 'high sting', 'vertical'])
    )
  ) {
    return {
      id: ENEMY_COMBAT_INTENTS.ANTI_AIR,
      label: 'Anti-Air',
      reason: 'Pressures careless jumps and keeps Asha thinking about vertical space.',
    };
  }
  if (enemy.type === 'sand-wisp' || enemy.type === 'bat' || enemy.flying || enemyIntentTextIncludes(enemy, ['ranged', 'harass', 'blind'])) {
    return {
      id: ENEMY_COMBAT_INTENTS.RANGED_HARASS,
      label: 'Ranged Harass',
      reason: 'Pressures from a loose distance instead of body-blocking the route.',
    };
  }
  if (enemy.type === 'snake' || enemyIntentTextIncludes(enemy, ['ambush', 'lunge', 'predator'])) {
    return {
      id: ENEMY_COMBAT_INTENTS.AMBUSH,
      label: 'Ambush',
      reason: 'Waits for over-extension, then commits to a punishable lunge.',
    };
  }
  if (enemyIntentTextIncludes(enemy, ['duelist', 'guardian', 'mummy', 'warden', 'warrior', 'statue'])) {
    return {
      id: ENEMY_COMBAT_INTENTS.DUELIST,
      label: 'Duelist',
      reason: 'Fights face-to-face with clearer counter windows.',
    };
  }
  if (enemy.combatPurpose || enemy.encounterRole || enemy.combatRole || enemy.pressureHint) {
    return {
      id: ENEMY_COMBAT_INTENTS.PRESSURE,
      label: 'Pressure',
      reason: 'Has encounter purpose and should stay engaged with Asha.',
    };
  }
  return {
    id: ENEMY_COMBAT_INTENTS.PATROL,
    label: 'Patrol',
    reason: 'Basic roaming enemy with no special encounter job.',
  };
};

export const getEnemyIntentTuning = (enemy = {}, intent = getEnemyCombatIntent(enemy)) => {
  switch (intent?.id) {
    case ENEMY_COMBAT_INTENTS.ROUTE_DENY:
      return {
        pressureReachBonus: 52,
        pursuitPaddingBonus: 120,
        chaseMultiplier: 1.18,
        awarenessMultiplier: 1.1,
        verticalAwareness: 148,
        standoffGapBonus: 8,
      };
    case ENEMY_COMBAT_INTENTS.ANTI_AIR:
      return {
        pressureReachBonus: 38,
        pursuitPaddingBonus: 70,
        chaseMultiplier: 1.1,
        awarenessMultiplier: 1.08,
        verticalAwareness: 168,
        airborneAggro: true,
      };
    case ENEMY_COMBAT_INTENTS.RANGED_HARASS:
      return {
        pressureReachBonus: 46,
        pursuitPaddingBonus: 90,
        chaseMultiplier: 1.08,
        awarenessMultiplier: 1.12,
        verticalAwareness: 178,
        standoffGapBonus: 28,
      };
    case ENEMY_COMBAT_INTENTS.AMBUSH:
      return {
        pressureReachBonus: 34,
        pursuitPaddingBonus: 60,
        chaseMultiplier: 1.12,
        awarenessMultiplier: 1.06,
        verticalAwareness: 142,
      };
    case ENEMY_COMBAT_INTENTS.DUELIST:
      return {
        pressureReachBonus: 30,
        pursuitPaddingBonus: 72,
        chaseMultiplier: 1.1,
        awarenessMultiplier: 1.04,
        verticalAwareness: 146,
        standoffGapBonus: 6,
      };
    case ENEMY_COMBAT_INTENTS.PRESSURE:
      return {
        pressureReachBonus: 26,
        pursuitPaddingBonus: 48,
        chaseMultiplier: 1.06,
        awarenessMultiplier: 1.02,
        verticalAwareness: 132,
      };
    default:
      return {};
  }
};

export const getEnemyVenomPressureTuning = (enemy = {}, venomSlowTimer = 0) => {
  const active = ENEMY_VENOM_PRESSURE_TYPES.has(enemy?.type) && (venomSlowTimer || 0) > 0;
  if (!active) {
    return {
      active: false,
      chaseSpeedMultiplier: 1,
      aggroReachBonus: 0,
      aggroMemoryMultiplier: 1,
    };
  }
  return {
    active: true,
    chaseSpeedMultiplier: ENEMY_VENOM_PRESSURE_CHASE_SPEED_MULTIPLIER,
    aggroReachBonus: ENEMY_VENOM_PRESSURE_AGGRO_REACH_BONUS,
    aggroMemoryMultiplier: ENEMY_VENOM_PRESSURE_AGGRO_MEMORY_MULTIPLIER,
  };
};

export const getEnemyFacingDirectionToPlayer = (enemy = {}, player = {}, fallbackDirection = enemy.direction || 1) => {
  const enemyCenter = (enemy.x || 0) + (enemy.width || 0) / 2;
  const playerCenter = (player.x || 0) + (player.width || 0) / 2;
  const distanceToPlayer = playerCenter - enemyCenter;
  if (Math.abs(distanceToPlayer) <= 1) return fallbackDirection >= 0 ? 1 : -1;
  return distanceToPlayer >= 0 ? 1 : -1;
};

export const resolveEnemyCombatSide = ({
  enemy = {},
  player = {},
  currentSide = 0,
  crossingBuffer = 6,
} = {}) => {
  const enemyCenter = (enemy.x || 0) + (enemy.width || 0) / 2;
  const playerCenter = (player.x || 0) + (player.width || 0) / 2;
  const rawSide = enemyCenter - playerCenter;
  if (Math.abs(rawSide) <= crossingBuffer && currentSide) return currentSide >= 0 ? 1 : -1;
  if (Math.abs(rawSide) > 1) return Math.sign(rawSide);
  const fallback = currentSide || -(enemy.direction || 1);
  return fallback >= 0 ? 1 : -1;
};

export const isScarabArmorOpen = (enemy = {}) => (
  enemy?.type === 'scarab'
  && (
    (enemy.stunTimer || 0) > 0
    || (enemy.attackRecovery || 0) > 0
    || (enemy.vulnerabilityTimer || 0) > 0
  )
);

export const shouldScarabFrontalArmorDeflect = ({
  enemy,
  player,
} = {}) => {
  if (enemy?.type !== 'scarab' || !player || isScarabArmorOpen(enemy)) return false;

  const enemyCenter = (enemy.x ?? 0) + (enemy.width ?? 0) / 2;
  const playerCenter = (player.x ?? 0) + (player.width ?? 0) / 2;
  const playerSide = Math.sign(playerCenter - enemyCenter);
  if (playerSide === 0) return false;

  const enemyFacing = (enemy.direction || 1) >= 0 ? 1 : -1;
  return playerSide === enemyFacing;
};

export const shouldStunScarabChargeOnDodge = ({
  enemy,
  pattern,
} = {}) => (
  enemy?.type === 'scarab'
  && (enemy.attackTimer || 0) > 0
  && SCARAB_CHARGE_PATTERN_IDS.has(enemy.attackPattern || pattern?.id)
);

export const shouldUseScorpionAntiAirSting = ({
  enemy,
  player,
  distanceToPlayer = 0,
  baseNearPlayerX = 0,
  awarenessMultiplier = 1,
  verticalAwareness = 168,
} = {}) => {
  if (enemy?.type !== 'scorpion' || !player || player.onGround) return false;
  const enemyCenterY = (enemy.y || 0) + (enemy.height || 0) / 2;
  const playerCenterY = (player.y || 0) + (player.height || 0) / 2;
  const playerFootY = (player.y || 0) + (player.height || 0);
  const enemyLowThreatLine = (enemy.y || 0) + (enemy.height || 0) + 42;
  const horizontalThreat = Math.max(
    SCORPION_ANTI_AIR_ATTACK_PATTERN.range + SCORPION_ANTI_AIR_ATTACK_PATTERN.backReach,
    baseNearPlayerX * awarenessMultiplier * 0.72,
  );
  return (
    Math.abs(distanceToPlayer) <= horizontalThreat
    && Math.abs(playerCenterY - enemyCenterY) <= verticalAwareness + 28
    && playerFootY <= enemyLowThreatLine
  );
};

export const shouldUseScorpionVenomSpit = ({
  enemy,
  meleeReachesPlayer = false,
  scorpionVenomCanReach = false,
  shouldUseScorpionAntiAir = false,
  venomSlowTimer = 0,
} = {}) => (
  enemy?.type === 'scorpion'
  && !shouldUseScorpionAntiAir
  && !meleeReachesPlayer
  && scorpionVenomCanReach
  && (venomSlowTimer || 0) <= SCORPION_VENOM_REFRESH_WINDOW
);

export const shouldUseWispDiveHarass = ({
  enemy,
  player,
  distanceToPlayer = 0,
  baseNearPlayerX = 0,
  awarenessMultiplier = 1,
  verticalAwareness = 178,
  meleeReachesPlayer = false,
} = {}) => {
  if (!WISP_DIVE_ENEMY_TYPES.has(enemy?.type) || !player) return false;
  if (
    enemy.defeated
    || (enemy.stunTimer || 0) > 0
    || (enemy.attackCooldown || 0) > 0
    || (enemy.attackWindup || 0) > 0
    || (enemy.attackTimer || 0) > 0
    || (enemy.attackRecovery || 0) > 0
  ) {
    return false;
  }

  const enemyCenterY = (enemy.y || 0) + (enemy.height || 0) / 2;
  const playerCenterY = (player.y || 0) + (player.height || 0) / 2;
  const verticalDeltaToPlayer = playerCenterY - enemyCenterY;
  const tunedHorizontalAwareness = baseNearPlayerX > 0
    ? baseNearPlayerX * awarenessMultiplier * 1.12
    : WISP_DIVE_HARASS_RANGE;
  const horizontalThreat = Math.max(
    WISP_DIVE_ATTACK_PATTERN.range + WISP_DIVE_ATTACK_PATTERN.backReach + 36,
    Math.min(WISP_DIVE_HARASS_RANGE, tunedHorizontalAwareness),
  );
  const verticalThreat = Math.max(verticalAwareness, WISP_DIVE_ATTACK_PATTERN.height + 86);
  const playerIsAboveDiveLine = verticalDeltaToPlayer < -28;
  const playerIsEscapingUpward = !player.onGround && (player.vy || 0) < -80 && playerIsAboveDiveLine;

  return (
    !playerIsEscapingUpward
    && Math.abs(distanceToPlayer) <= horizontalThreat
    && verticalDeltaToPlayer >= -28
    && verticalDeltaToPlayer <= verticalThreat + 34
    && (player.onGround || (player.vy || 0) >= -50 || meleeReachesPlayer)
  );
};

export const shouldUseSnakeAmbushLunge = ({
  enemy,
  player,
  distanceToPlayer = 0,
  baseNearPlayerX = 0,
  awarenessMultiplier = 1,
  verticalAwareness = 142,
  meleeReachesPlayer = false,
} = {}) => {
  if (enemy?.type !== 'snake' || !player || meleeReachesPlayer) return false;
  if (
    enemy.defeated
    || (enemy.stunTimer || 0) > 0
    || (enemy.attackCooldown || 0) > 0
    || (enemy.attackWindup || 0) > 0
    || (enemy.attackTimer || 0) > 0
    || (enemy.attackRecovery || 0) > 0
  ) {
    return false;
  }

  const enemyCenterY = (enemy.y || 0) + (enemy.height || 0) / 2;
  const playerCenterY = (player.y || 0) + (player.height || 0) / 2;
  const verticalDeltaToPlayer = playerCenterY - enemyCenterY;
  const tunedHorizontalAwareness = baseNearPlayerX > 0
    ? baseNearPlayerX * awarenessMultiplier * 1.22
    : SNAKE_AMBUSH_LUNGE_START_RANGE;
  const horizontalThreat = Math.max(
    SNAKE_AMBUSH_LUNGE_PATTERN.range + 72,
    Math.min(SNAKE_AMBUSH_LUNGE_START_RANGE, tunedHorizontalAwareness),
  );
  const minimumCommitRange = SNAKE_AMBUSH_LUNGE_PATTERN.range + 18;
  const playerAboveLowLine = !player.onGround && verticalDeltaToPlayer < -42;

  return (
    !playerAboveLowLine
    && Math.abs(distanceToPlayer) >= minimumCommitRange
    && Math.abs(distanceToPlayer) <= horizontalThreat
    && Math.abs(verticalDeltaToPlayer) <= verticalAwareness
  );
};

export const shouldVaultScarabCharge = ({
  enemy,
  contact,
  pattern,
} = {}) => (
  contact?.type === 'stomp'
  && shouldStunScarabChargeOnDodge({ enemy, pattern })
);

export const getScarabVaultOutcome = ({ jumpSpeed = 0 } = {}) => ({
  ...SCARAB_VAULT_OUTCOME,
  playerVy: -jumpSpeed * SCARAB_VAULT_OUTCOME.bounceMultiplier,
});

export const DEFAULT_BOSS_ATTACK_PHASES = [
  {
    id: 'heavy-swipe',
    label: 'Heavy Swipe',
    kind: 'close',
    windup: 0.72,
    duration: 0.34,
    cooldown: 1.85,
    recovery: 0.78,
    vulnerableAfter: 0.85,
    range: 58,
    height: 40,
    speed: 72,
    color: '#fb923c',
  },
  {
    id: 'pulse-ring',
    label: 'Pulse Ring',
    kind: 'area',
    windup: 0.92,
    duration: 0.36,
    cooldown: 2.15,
    recovery: 0.88,
    vulnerableAfter: 1,
    range: 118,
    height: 54,
    damageScale: 0.85,
    shieldDuringWindup: true,
    color: '#facc15',
  },
];

export const BOSS_ATTACK_PHASES = {
  'scarab-queen': [
    { ...DEFAULT_BOSS_ATTACK_PHASES[0], id: 'queen-charge', label: 'Sand Charge', speed: 118, cooldown: 1.85, vulnerableAfter: 1.05 },
    { ...DEFAULT_BOSS_ATTACK_PHASES[1], id: 'scarab-burst', label: 'Scarab Burst', kind: 'area', cooldown: 2.2, vulnerableAfter: 1.15, damageScale: 0.65 },
  ],
  'temple-guardian': [
    { ...DEFAULT_BOSS_ATTACK_PHASES[0], id: 'stone-swipe', label: 'Stone Swipe', windup: 0.9, duration: 0.42, speed: 58 },
    { ...DEFAULT_BOSS_ATTACK_PHASES[1], id: 'shockwave-slam', label: 'Shockwave Slam', windup: 1.05, range: 132, damageScale: 0.8 },
  ],
  'giant-serpent': [
    { ...DEFAULT_BOSS_ATTACK_PHASES[0], id: 'wall-lunge', label: 'Wall Lunge', speed: 120, cooldown: 1.75 },
    { ...DEFAULT_BOSS_ATTACK_PHASES[1], id: 'venom-line', label: 'Venom Line', kind: 'ranged', windup: 0.8, range: 126, height: 30, cooldown: 2, damageScale: 0.75 },
  ],
  'looter-captain': [
    { ...DEFAULT_BOSS_ATTACK_PHASES[0], id: 'dash-shove', label: 'Dash Shove', windup: 0.58, duration: 0.28, speed: 145, cooldown: 1.45 },
    { ...DEFAULT_BOSS_ATTACK_PHASES[1], id: 'sand-throw', label: 'Sand Throw', kind: 'ranged', windup: 0.76, range: 112, height: 28, cooldown: 1.85, damageScale: 0.7 },
  ],
  'ancient-construct': [
    { ...DEFAULT_BOSS_ATTACK_PHASES[0], id: 'construct-slam', label: 'Construct Slam', windup: 1, duration: 0.44, speed: 54, cooldown: 2 },
    { ...DEFAULT_BOSS_ATTACK_PHASES[1], id: 'core-pulse', label: 'Core Pulse', windup: 1.1, range: 140, cooldown: 2.25, damageScale: 0.85 },
  ],
  [ROME_LEGATE_REVENANT_BOSS_ID]: [
    { ...DEFAULT_BOSS_ATTACK_PHASES[0], id: 'legate-charge', label: 'Gladius Charge', speed: 130, cooldown: 1.75, vulnerableAfter: 1.05 },
    { ...DEFAULT_BOSS_ATTACK_PHASES[1], id: 'legate-shield-bash', label: 'Shield Bash Wave', kind: 'area', windup: 1.0, range: 128, cooldown: 2.3, vulnerableAfter: 1.2, damageScale: 0.75, shieldDuringWindup: true },
  ],
};

export const COMBAT_HIT_IMPACT_PROFILES = {
  light: {
    hitStop: 0.085,
    cameraShakeTimer: 0.1,
    cameraShakeStrength: 0.16,
    cameraPunchTimer: 0.055,
    hitFlash: 0.3,
    // Light hits no longer knock the enemy back, so combos stay in range.
    targetKnockback: 0,
    targetShift: 0,
    playerRecoil: 30,
    impactTimer: 0.28,
    sparkTimer: 0.22,
    slashEffect: 'combo',
    slashWidth: 138,
    slashTimer: 0.2,
    dustTimer: 0.16,
    dustWidth: 30,
    color: '#7dd3fc',
    sparkColor: '#e2d5c0',
    sparkFill: 'rgba(190, 168, 128, 0.18)',
  },
  combo2: {
    hitStop: 0.115,
    cameraShakeTimer: 0.14,
    cameraShakeStrength: 0.26,
    cameraPunchTimer: 0.085,
    hitFlash: 0.4,
    targetKnockback: 0.44,
    targetShift: 66,
    playerRecoil: 42,
    impactTimer: 0.32,
    sparkTimer: 0.26,
    slashEffect: 'combo',
    slashWidth: 178,
    slashTimer: 0.24,
    dustTimer: 0.22,
    dustWidth: 38,
    color: '#93c5fd',
    sparkColor: '#f8e7b6',
    sparkFill: 'rgba(224, 190, 112, 0.22)',
    sfxKey: 'combatHitCombo2',
    sfxVolume: 1.02,
  },
  shove: {
    hitStop: 0.1,
    cameraShakeTimer: 0.16,
    cameraShakeStrength: 0.3,
    cameraPunchTimer: 0.09,
    hitFlash: 0.32,
    targetKnockback: 0.6,
    targetShift: 96,
    playerRecoil: 40,
    impactTimer: 0.32,
    sparkTimer: 0.24,
    slashEffect: 'combo',
    slashWidth: 150,
    slashTimer: 0.2,
    dustTimer: 0.3,
    dustWidth: 50,
    color: '#b8c4d0',
    sparkColor: '#cdd8e0',
    sparkFill: 'rgba(176, 196, 214, 0.2)',
    sfxKey: 'combatHitCombo2',
    sfxVolume: 1.0,
  },
  finisher: {
    hitStop: 0.18,
    cameraShakeTimer: 0.24,
    cameraShakeStrength: 0.48,
    cameraPunchTimer: 0.14,
    hitFlash: 0.58,
    targetKnockback: 0.66,
    targetShift: 104,
    playerRecoil: 66,
    impactTimer: 0.36,
    sparkTimer: 0.34,
    slashEffect: 'finisher',
    slashWidth: 260,
    slashTimer: 0.34,
    dustTimer: 0.34,
    dustWidth: 58,
    color: '#fbbf24',
    sparkColor: '#fbbf24',
    sparkFill: 'rgba(251, 191, 36, 0.42)',
    sfxKey: 'finisherHit',
    sfxVolume: 1.06,
  },
  blocked: {
    hitStop: 0.052,
    cameraShakeTimer: 0.08,
    cameraShakeStrength: 0.13,
    cameraPunchTimer: 0.045,
    hitFlash: 0.14,
    targetKnockback: 0,
    targetShift: 0,
    playerRecoil: 48,
    sparkTimer: 0.34,
    guardTimer: 0.34,
    color: '#7dd3fc',
    sparkColor: 'rgba(214, 185, 92, 0.78)',
    sfxKey: 'combatDeflect',
    sfxVolume: 0.78,
  },
  defeated: {
    hitStop: 0.14,
    cameraShakeTimer: 0.17,
    cameraShakeStrength: 0.3,
    cameraPunchTimer: 0.1,
    hitFlash: 0.24,
    targetKnockback: 0.42,
    targetShift: 60,
    playerRecoil: 44,
    impactTimer: 0.38,
    sparkTimer: 0.28,
    dustTimer: 0.38,
    dustWidth: 52,
    color: '#b8943c',
    sparkColor: '#f7d28a',
    sparkFill: 'rgba(214, 185, 92, 0.28)',
    sfxKey: 'enemyDefeated',
    sfxVolume: 1.08,
  },
};

export const updateEnemyDefeatedVisibility = (enemy, dt, visibleSeconds = ENEMY_DEFEATED_VISIBLE_SECONDS) => {
  if (!enemy?.defeated) return false;
  const nextTimer = Math.max(0, (enemy.defeatedVisibleTimer ?? visibleSeconds) - dt);
  enemy.defeatedVisibleTimer = nextTimer <= 0.001 ? 0 : nextTimer;
  return enemy.defeatedVisibleTimer > 0;
};

export const isEnemyDefeatedVisible = (enemy, visibleSeconds = ENEMY_DEFEATED_VISIBLE_SECONDS) => (
  !enemy?.defeated || (enemy.defeatedVisibleTimer ?? visibleSeconds) > 0
);

export const updateEnemyCombatTimers = (enemy, dt) => {
  const wasAttacking = enemy.attackTimer > 0;
  enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
  enemy.stunTimer = Math.max(0, enemy.stunTimer - dt);
  enemy.attackWindup = Math.max(0, enemy.attackWindup - dt);
  enemy.attackTimer = Math.max(0, enemy.attackTimer - dt);
  enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
  enemy.attackRecovery = Math.max(0, enemy.attackRecovery - dt);
  enemy.aggroMemoryTimer = Math.max(0, (enemy.aggroMemoryTimer || 0) - dt);
  enemy.vulnerabilityTimer = Math.max(0, (enemy.vulnerabilityTimer || 0) - dt);
  enemy.shieldTimer = Math.max(0, (enemy.shieldTimer || 0) - dt);
  enemy.knockbackTimer = Math.max(0, enemy.knockbackTimer - dt);
  return wasAttacking;
};

export const suppressEnemyForBossFocus = (enemy) => {
  enemy.attackWindup = 0;
  enemy.attackTimer = 0;
  enemy.attackReady = false;
  enemy.attackRecovery = 0;
  enemy.vulnerabilityTimer = 0;
  enemy.shieldTimer = 0;
  enemy.aggroMemoryTimer = 0;
  enemy.attackCooldown = Math.max(enemy.attackCooldown || 0, 0.45);
};

export const openEnemyCounterWindow = (enemy, pattern) => {
  enemy.attackRecovery = pattern.recovery;
  enemy.vulnerabilityTimer = pattern.vulnerableAfter;
};

export const beginEnemyAttackSwing = (enemy, pattern) => {
  enemy.attackTimer = pattern.duration;
  enemy.attackReady = false;
};

export const beginEnemyAttackWindup = (enemy, pattern, { attackDirection, attackCooldown }) => {
  enemy.attackWindup = pattern.windup;
  enemy.attackDirection = attackDirection;
  enemy.attackHasHit = false;
  enemy.attackReady = true;
  enemy.attackPattern = pattern.id;
  enemy.attackPhaseLabel = pattern.label;
  enemy.attackCooldown = attackCooldown;
  enemy.vulnerabilityTimer = 0;
  enemy.shieldTimer = pattern.shieldDuringWindup ? Math.min(0.45, pattern.windup * 0.7) : 0;
};
