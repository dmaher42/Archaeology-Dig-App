import {
  GROUND_Y,
  INITIAL_JOURNEY_NOTICE,
  PLAYER_HEIGHT,
  PLAYER_SPRITE_FRAME_COUNT,
  PLAYER_SPRITE_SCALE,
  PLAYER_WIDTH,
} from './journeyConstants';
import { BOSS_KEY_ITEMS, CHECKPOINTS, ENEMIES, MINI_BOSSES, SECTIONS, SECTION_ATMOSPHERES } from './journeyLevelData';

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const rectsOverlap = (a, b) => (
  a.x < b.x + b.width
  && a.x + a.width > b.x
  && a.y < b.y + b.height
  && a.y + a.height > b.y
);

export const getSectionForX = (x) => (
  SECTIONS.find((section) => x >= section.start && x < section.end) || SECTIONS[SECTIONS.length - 1]
);

export const getPlayerAnimationState = (current) => {
  if (current.player.hitFeedbackTimer > 0 || current.player.knockbackTimer > 0) return 'hurt';
  if (current.attackWindupTimer > 0 || current.attackTimer > 0 || current.attackRecoilTimer > 0) return 'attack';
  if (!current.player.onGround) return 'jump';
  if (Math.abs(current.player.vx) > 8) return 'walk';
  return 'idle';
};

export const getPlayerAnimationFrame = (animationState, walkCycleDistance = 0) => {
  if (animationState === 'walk') {
    return Math.floor(walkCycleDistance / 22) % PLAYER_SPRITE_FRAME_COUNT;
  }
  if (animationState === 'jump' || animationState === 'attack') return 2;
  if (animationState === 'hurt') return 0;
  return 1;
};

export const updatePlayerAnimation = (current, dt) => {
  const animationState = getPlayerAnimationState(current);
  if (animationState === 'walk') {
    current.player.walkCycleDistance += Math.abs(current.player.vx) * dt;
  }
  current.player.animationState = animationState;
  current.player.animationFrame = getPlayerAnimationFrame(animationState, current.player.walkCycleDistance);
  current.player.spriteScale = PLAYER_SPRITE_SCALE;
};

export const makeEnemy = (enemy) => ({
  ...enemy,
  direction: 1,
  maxHealth: enemy.health,
  defeated: false,
  stunTimer: 0,
  hitFlash: 0,
  attackWindup: 0,
  attackTimer: 0,
  attackCooldown: 0.8,
  attackDirection: 1,
  attackHasHit: false,
  attackReady: false,
  attackRecovery: 0,
  attackPattern: 'patrol',
  attackPhaseLabel: 'Patrol',
  vulnerabilityTimer: 0,
  shieldTimer: 0,
  knockbackTimer: 0,
  knockbackDirection: 0,
});

export const makeMiniBoss = (boss) => ({
  ...boss,
  direction: 1,
  maxHealth: boss.health,
  defeated: false,
  awakened: false,
  stunTimer: 0,
  hitFlash: 0,
  attackWindup: 0,
  attackTimer: 0,
  attackCooldown: 1.2,
  attackDirection: 1,
  attackHasHit: false,
  attackReady: false,
  attackRecovery: 0,
  attackPattern: 'heavy',
  attackPhaseLabel: 'Heavy attack',
  attackKind: 'close',
  attackCycleIndex: 0,
  vulnerabilityTimer: 0,
  shieldTimer: 0,
  patternHistory: [],
  knockbackTimer: 0,
  knockbackDirection: 0,
});

export const makeBossKeyItem = (item) => ({
  ...item,
  x: 0,
  y: 0,
  dropped: false,
  collected: false,
});

export const makeInitialState = () => ({
  player: {
    x: 44,
    y: GROUND_Y - PLAYER_HEIGHT,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    direction: 1,
    onGround: true,
    airJumpsUsed: 0,
    invulnerable: 0,
    damageCooldownTimer: 0,
    hitFeedbackTimer: 0,
    lastDamage: 0,
    lastDamageSource: null,
    lastDamageTime: null,
    knockbackTimer: 0,
    knockbackDirection: 0,
    animationState: 'idle',
    animationFrame: 1,
    walkCycleDistance: 0,
    spriteScale: PLAYER_SPRITE_SCALE,
  },
  fieldKit: [],
  collectedToolIds: new Set(),
  collectedShardIds: new Set(),
  relicShardCount: 0,
  collectedUpgrades: new Set(),
  collectedTabletIds: new Set(),
  collectedObjectiveIds: new Set(),
  collectedBossKeyIds: new Set(),
  enemies: ENEMIES.map(makeEnemy),
  miniBosses: MINI_BOSSES.map(makeMiniBoss),
  bossKeyItems: BOSS_KEY_ITEMS.map(makeBossKeyItem),
  defeatedEnemies: new Set(),
  defeatedMiniBosses: new Set(),
  hiddenRoomsFound: new Set(),
  openedRouteGateIds: new Set(),
  completedObjectiveIds: new Set(),
  triggeredEnvironmentEventIds: new Set(),
  cinematicEvent: null,
  cinematicTimer: 0,
  bossIntro: null,
  bossIntroTimer: 0,
  bossIntroPauseTimer: 0,
  bossDomain: null,
  seenBossIntroIds: new Set(),
  activeGuardianChallenge: null,
  completedGuardianChallengeIds: new Set(),
  guardianChallengeResults: {},
  guardianBattleModifiers: {},
  environmentEvent: null,
  environmentEventTimer: 0,
  sectionTransition: {
    id: 'desert-entry',
    name: SECTIONS[0].name,
    message: SECTION_ATMOSPHERES[SECTIONS[0].id].title,
  },
  sectionTransitionTimer: 2.6,
  cameraX: 0,
  targetCameraX: 0,
  cameraMode: 'follow',
  cameraFocusTarget: null,
  cameraShakeTimer: 0,
  cameraShakeStrength: 0,
  lastSectionId: SECTIONS[0].id,
  activeCheckpoint: CHECKPOINTS[0],
  resources: {
    stamina: 100,
    time: 900,
  },
  notice: INITIAL_JOURNEY_NOTICE,
  hazardCooldown: 0,
  lastHazardHit: null,
  lastStaminaDelta: 0,
  lastStaminaLossReason: '',
  staminaFeedbackTimer: 0,
  enemyCooldown: 0,
  attackCooldown: 0,
  attackTimer: 0,
  attackWindupTimer: 0,
  attackRecoilTimer: 0,
  attackPhase: 'ready',
  attackQueued: false,
  attackHitIds: new Set(),
  attackRewarded: false,
  playerAttackStaminaCost: 0,
  lastAttackResult: 'ready',
  shieldedHitFeedback: '',
  playerAttackBox: null,
  hitStopTimer: 0,
  combatHitEffects: [],
  routeGateCooldown: 0,
  timeAccumulator: 0,
  failed: false,
  failureReason: '',
  completed: false,
});
