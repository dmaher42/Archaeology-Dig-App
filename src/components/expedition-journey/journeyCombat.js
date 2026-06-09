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
export const PLAYER_DODGE_STAMINA_COST = 8;
export const PLAYER_DODGE_SPEED = 320;
export const PLAYER_DODGE_DURATION = 0.34;
export const PLAYER_DODGE_INVULNERABLE_DURATION = 0.18;
export const PLAYER_DODGE_RECOVERY_DURATION = 0.1;
export const PLAYER_DODGE_FRAME_SEQUENCE = [0, 1, 2, 2, 2, 3, 3, 4, 5, 6, 7];
export const PLAYER_COMBO_WINDOW_DURATION = 0.72;
export const PLAYER_COMBO_PRESERVE_AFTER_DODGE_DURATION = 0.62;
export const PLAYER_COMBO_MAX_STEP = 3;
export const PLAYER_ATTACK_TYPES = Object.freeze({
  LIGHT: 'light',
  HEAVY: 'heavy',
});
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
export const PLAYER_ATTACK_NEAR_MISS_DISTANCE = 44;
export const PLAYER_ATTACK_NEAR_MISS_VERTICAL_TOLERANCE = 34;
export const PLAYER_ATTACK_FINISHER_ROW = 'attack_pick_swing_sweep';
export const PLAYER_COMBO_SLASH_EFFECT_SRC = 'assets/expedition/player/asha-combo-slash-effect-2026-06-06.png';
export const PLAYER_COMBO_SLASH_EFFECT_VERSION = 'asha-combo-slash-effect-2026-06-06';
export const PLAYER_FINISHER_SLASH_EFFECT_SRC = 'assets/expedition/player/asha-finisher-slash-effect-2026-06-06.png';
export const PLAYER_FINISHER_SLASH_EFFECT_VERSION = 'asha-finisher-slash-effect-2026-06-06';
export const PLAYER_ATTACK_COMBO_TIMINGS = [
  { windup: ATTACK_WINDUP_DURATION, swing: ATTACK_DURATION, recoil: ATTACK_RECOIL_DURATION, cooldown: ATTACK_COOLDOWN },
  { windup: ATTACK_WINDUP_DURATION, swing: ATTACK_DURATION, recoil: ATTACK_RECOIL_DURATION, cooldown: ATTACK_COOLDOWN },
  { windup: 0.18, swing: 0.52, recoil: 0.28, cooldown: 0.5 },
];
export const PLAYER_HIT_SCREEN_SHAKE_DURATION = 0.22;
export const PLAYER_HIT_SCREEN_SHAKE_PIXELS = 2.4;
export const SCORPION_ATTACK_RANGE_MULTIPLIER = 1.4;
export const SCORPION_CHASE_SPEED_MULTIPLIER = 1.15;
export const SCORPION_VENOM_SPIT_RANGE = CANVAS_WIDTH * 0.5;
export const SCORPION_VENOM_SLOW_DURATION = 3.6;
export const SCORPION_VENOM_SLOW_MULTIPLIER = 0.48;
export const ENEMY_AGGRO_MEMORY_SECONDS = 7.5;
export const ENEMY_AGGRO_PATROL_PADDING = 320;
export const ENEMY_DEFEATED_VISIBLE_SECONDS = 3;

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
    targetKnockback: 0.32,
    targetShift: 44,
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
