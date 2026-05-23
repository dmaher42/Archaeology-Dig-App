import {
  GROUND_Y,
  INITIAL_JOURNEY_NOTICE,
  PLAYER_HEIGHT,
  PLAYER_SPRITE_FRAME_COUNT,
  PLAYER_SPRITE_SCALE,
  PLAYER_WIDTH,
} from './journeyConstants.js';
import { BOSS_KEY_ITEMS, CHECKPOINTS, getJourneyEnemies, getJourneyMiniBosses, SECTIONS, SECTION_ATMOSPHERES } from './journeyLevelData.js';

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const rectsOverlap = (a, b) => (
  a.x < b.x + b.width
  && a.x + a.width > b.x
  && a.y < b.y + b.height
  && a.y + a.height > b.y
);

export const JOURNEY_HITBOX_TUNING = {
  // Player body trims the drawn sprite edges so unclear shoulder/backpack touches do not punish players.
  playerBody: { insetX: 4, topInset: 3, bottomInset: 1 },
  // Feet are a shallow strip used only for ground, platform, and stomp checks.
  playerFeet: { insetX: 3, height: 9, yPad: 2 },
  // Platform tops get a small ledge margin so visible landings do not slip through.
  platformLanding: { xPad: 10, topPad: 12, bottomPad: 8, previousFootTolerance: 14 },
  // Enemy side damage is smaller than the visible sprite, especially for low scarab bodies.
  enemyDamage: { insetXRatio: 0.2, topInsetRatio: 0.26, bottomInsetRatio: 0.22 },
  // Stomps use the enemy's top band and a small above-head buffer for reliable jump landings.
  enemyStomp: { insetXRatio: 0.08, yPad: 10, heightRatio: 0.36, previousFootTolerance: 12 },
  // Collectibles are intentionally generous because clear visual contact should be enough.
  collectible: { padX: 10, padY: 10 },
  // Hazards stay slightly inset so warning art can be touched at the edges without penalty.
  hazard: { insetX: 8, topInset: 5, bottomInset: 4 },
};

const getEnemyHitboxFamily = (enemy = {}) => {
  const name = (enemy.name || '').toLowerCase();
  if (enemy.type === 'sand-wisp' || name.includes('sand wisp') || name.includes('flying scarab')) return 'sandWisp';
  if (enemy.type === 'scarab' || name.includes('scarab') || name.includes('beetle')) return 'scarab';
  if (enemy.type === 'scorpion' || name.includes('scorpion')) return 'scorpion';
  if (enemy.type === 'snake' || name.includes('snake') || name.includes('serpent')) return 'snake';
  if (enemy.type === 'mummy' || name.includes('mummy')) return 'mummy';
  if (enemy.type === 'guardian' || enemy.type === 'statue' || name.includes('guardian') || name.includes('statue')) return 'guardian';
  if (enemy.type === 'looter' || enemy.type === 'watchtower-sentry' || name.includes('looter') || name.includes('sentry')) return 'humanoid';
  return 'default';
};

export const ENEMY_HITBOX_PROFILES = {
  scarab: {
    damage: { widthScale: 1.42, heightScale: 0.92, minWidth: 42, minHeight: 22, footInset: 1 },
    stomp: { widthScale: 1.34, heightScale: 0.44, minWidth: 38, minHeight: 12, topPad: 8 },
    hurt: { widthScale: 1.38, heightScale: 0.96, minWidth: 40, minHeight: 24, footInset: 0 },
  },
  scorpion: {
    damage: { widthScale: 1.74, heightScale: 6.8, minWidth: 66, minHeight: 190, footInset: -2 },
    blocker: { widthScale: 1.86, heightScale: 7.4, minWidth: 72, minHeight: 220, footInset: -2 },
    stomp: { disabled: true },
    hurt: { widthScale: 1.46, heightScale: 1.06, minWidth: 52, minHeight: 32, footInset: 0 },
  },
  snake: {
    damage: { widthScale: 1.48, heightScale: 0.82, minWidth: 48, minHeight: 20, footInset: 2 },
    stomp: { widthScale: 1.26, heightScale: 0.34, minWidth: 42, minHeight: 10, topPad: 7 },
    hurt: { widthScale: 1.48, heightScale: 0.84, minWidth: 48, minHeight: 22, footInset: 1 },
  },
  sandWisp: {
    damage: { widthScale: 1.86, heightScale: 1.34, minWidth: 62, minHeight: 40, centerYOffset: -0.08 },
    stomp: { widthScale: 1.42, heightScale: 0.5, minWidth: 48, minHeight: 16, centerYOffset: -0.18 },
    hurt: { widthScale: 1.78, heightScale: 1.26, minWidth: 58, minHeight: 38, centerYOffset: -0.08 },
  },
  mummy: {
    damage: { widthScale: 1.2, heightScale: 1.42, minWidth: 38, minHeight: 56, footInset: -2 },
    stomp: { widthScale: 1.02, heightScale: 0.28, minWidth: 32, minHeight: 13, topPad: 9 },
    hurt: { widthScale: 1.22, heightScale: 1.5, minWidth: 40, minHeight: 58, footInset: -2 },
  },
  guardian: {
    damage: { widthScale: 1.18, heightScale: 1.34, minWidth: 48, minHeight: 62, footInset: -2 },
    stomp: { widthScale: 0.95, heightScale: 0.24, minWidth: 38, minHeight: 13, topPad: 10 },
    hurt: { widthScale: 1.2, heightScale: 1.42, minWidth: 50, minHeight: 64, footInset: -2 },
  },
  humanoid: {
    damage: { widthScale: 1.12, heightScale: 1.22, minWidth: 34, minHeight: 48, footInset: 0 },
    stomp: { widthScale: 0.96, heightScale: 0.28, minWidth: 28, minHeight: 12, topPad: 8 },
    hurt: { widthScale: 1.14, heightScale: 1.28, minWidth: 34, minHeight: 50, footInset: 0 },
  },
};

const getEnemyHitboxProfile = (enemy) => ENEMY_HITBOX_PROFILES[getEnemyHitboxFamily(enemy)] || null;

const buildEnemyHitbox = (enemy, tuning = {}) => {
  const width = Math.max(tuning.minWidth || 1, enemy.width * (tuning.widthScale || 1));
  const height = Math.max(tuning.minHeight || 1, enemy.height * (tuning.heightScale || 1));
  const centerX = enemy.x + enemy.width / 2;

  if (Number.isFinite(tuning.centerYOffset)) {
    const centerY = enemy.y + enemy.height / 2 + enemy.height * tuning.centerYOffset;
    return {
      x: centerX - width / 2,
      y: centerY - height / 2,
      width,
      height,
    };
  }

  const footY = enemy.y + enemy.height - (tuning.footInset || 0);
  return {
    x: centerX - width / 2,
    y: footY - height,
    width,
    height,
  };
};

const insetRect = (rect, { x = 0, y = 0, bottom = y } = {}) => ({
  x: rect.x + x,
  y: rect.y + y,
  width: Math.max(1, rect.width - x * 2),
  height: Math.max(1, rect.height - y - bottom),
});

const expandRect = (rect, { x = 0, y = 0 } = {}) => ({
  x: rect.x - x,
  y: rect.y - y,
  width: rect.width + x * 2,
  height: rect.height + y * 2,
});

export const getPlayerBodyHitbox = (player) => insetRect(player, {
  x: JOURNEY_HITBOX_TUNING.playerBody.insetX,
  y: JOURNEY_HITBOX_TUNING.playerBody.topInset,
  bottom: JOURNEY_HITBOX_TUNING.playerBody.bottomInset,
});

export const getPlayerFeetHitbox = (player) => {
  const tuning = JOURNEY_HITBOX_TUNING.playerFeet;
  return {
    x: player.x + tuning.insetX,
    y: player.y + player.height - tuning.height - tuning.yPad,
    width: Math.max(1, player.width - tuning.insetX * 2),
    height: tuning.height + tuning.yPad,
  };
};

export const getPlatformLandingHitbox = (platform) => {
  const tuning = JOURNEY_HITBOX_TUNING.platformLanding;
  return {
    x: platform.x - tuning.xPad,
    y: platform.y - tuning.topPad,
    width: platform.width + tuning.xPad * 2,
    height: tuning.topPad + Math.min(platform.height, tuning.bottomPad),
  };
};

export const isLandingOnPlatform = (player, previousPlayer, platform) => {
  if (player.vy < 0) return false;
  const feet = getPlayerFeetHitbox(player);
  const previousFeetY = previousPlayer.y + previousPlayer.height;
  return rectsOverlap(feet, getPlatformLandingHitbox(platform))
    && previousFeetY <= platform.y + JOURNEY_HITBOX_TUNING.platformLanding.previousFootTolerance;
};

export const getEnemyDamageHitbox = (enemy) => {
  const profile = getEnemyHitboxProfile(enemy)?.damage;
  if (profile) return buildEnemyHitbox(enemy, profile);

  const tuning = JOURNEY_HITBOX_TUNING.enemyDamage;
  const insetX = Math.max(4, enemy.width * tuning.insetXRatio);
  const topInset = Math.max(3, enemy.height * tuning.topInsetRatio);
  const bottomInset = Math.max(3, enemy.height * tuning.bottomInsetRatio);
  return insetRect(enemy, { x: insetX, y: topInset, bottom: bottomInset });
};

export const getEnemyStompHitbox = (enemy) => {
  const profile = getEnemyHitboxProfile(enemy)?.stomp;
  if (profile?.disabled) {
    return {
      x: enemy.x + enemy.width / 2,
      y: enemy.y,
      width: 1,
      height: 1,
    };
  }
  if (profile) {
    const hitbox = buildEnemyHitbox(enemy, profile);
    if (Number.isFinite(profile.topPad)) {
      return {
        ...hitbox,
        y: enemy.y - profile.topPad,
      };
    }
    return hitbox;
  }

  const tuning = JOURNEY_HITBOX_TUNING.enemyStomp;
  const insetX = Math.max(3, enemy.width * tuning.insetXRatio);
  return {
    x: enemy.x + insetX,
    y: enemy.y - tuning.yPad,
    width: Math.max(1, enemy.width - insetX * 2),
    height: Math.max(8, enemy.height * tuning.heightRatio + tuning.yPad),
  };
};

export const getEnemyMovementBlockHitbox = (enemy) => {
  const profile = getEnemyHitboxProfile(enemy)?.blocker;
  if (!profile) return null;
  return buildEnemyHitbox(enemy, profile);
};

export const getEnemyAttackHurtbox = (enemy, { boss = false } = {}) => {
  if (boss) {
    const insetX = Math.max(6, enemy.width * 0.1);
    const topInset = Math.max(5, enemy.height * 0.08);
    const bottomInset = Math.max(4, enemy.height * 0.08);
    return insetRect(enemy, { x: insetX, y: topInset, bottom: bottomInset });
  }

  const profile = getEnemyHitboxProfile(enemy)?.hurt;
  if (profile) return buildEnemyHitbox(enemy, profile);

  const insetX = Math.max(5, enemy.width * 0.16);
  const topInset = Math.max(4, enemy.height * 0.12);
  const bottomInset = Math.max(3, enemy.height * 0.1);
  return insetRect(enemy, { x: insetX, y: topInset, bottom: bottomInset });
};

const hashEnemyIdentity = (enemy) => {
  const source = `${enemy.id || enemy.name || enemy.type || 'enemy'}:${enemy.x || 0}:${enemy.y || 0}`;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash) + source.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
};

const ENEMY_TOUGHNESS_BONUS = {
  scarab: 2,
  scorpion: 2,
  'sand-wisp': 2,
  snake: 2,
  bat: 2,
  looter: 3,
  mummy: 3,
  guardian: 3,
  statue: 3,
  'river-crab': 2,
  'watchtower-sentry': 3,
  'clay-guardian': 3,
};

const tuneEnemyHealth = (enemy) => {
  if (enemy.firstSealRouteRamp) return Math.max(1, enemy.health);
  if (enemy.openingRouteRamp) return Math.max(3, enemy.health);
  const bonus = ENEMY_TOUGHNESS_BONUS[enemy.type] ?? 1;
  return clamp(Math.max(enemy.health + bonus, Math.ceil(enemy.health * 1.55)), 3, 5);
};

const tuneEnemyDamage = (enemy) => {
  if (enemy.firstSealRouteRamp) return Math.max(1, enemy.damage);
  return enemy.openingRouteRamp
    ? Math.max(enemy.damage + 1, Math.ceil(enemy.damage * 1.25))
    : Math.max(enemy.damage + 4, Math.ceil(enemy.damage * 1.45));
};

const makeStepProfile = (entity, { boss = false } = {}) => {
  const seed = hashEnemyIdentity(entity);
  const seedRatio = (seed % 997) / 997;
  return {
    baseSpeed: entity.speed * (entity.openingRouteRamp ? 1.12 : 1.18),
    stepSeed: seed,
    stepTimer: 0,
    stepCycle: 0,
    stepShiftTimer: 0.45 + seedRatio * 0.8,
    stepSpeedMultiplier: boss ? 0.94 + seedRatio * 0.16 : 0.88 + seedRatio * 0.24,
    stepPauseTimer: 0,
    stepRhythm: boss ? 1.05 + seedRatio * 0.55 : 1.35 + seedRatio * 0.85,
  };
};

export const getCollectibleHitbox = (item, size = {}) => expandRect({
  x: item.x,
  y: item.y,
  width: size.width ?? item.width ?? 24,
  height: size.height ?? item.height ?? 24,
}, { x: JOURNEY_HITBOX_TUNING.collectible.padX, y: JOURNEY_HITBOX_TUNING.collectible.padY });

export const getHazardHitbox = (hazard) => insetRect(hazard, {
  x: Math.min(JOURNEY_HITBOX_TUNING.hazard.insetX, hazard.width / 4),
  y: Math.min(JOURNEY_HITBOX_TUNING.hazard.topInset, hazard.height / 3),
  bottom: Math.min(JOURNEY_HITBOX_TUNING.hazard.bottomInset, hazard.height / 3),
});

export const resolveEnemyContact = (player, previousPlayer, enemy) => {
  if (enemy.defeated) return { type: 'none' };
  const movementBlockHitbox = getEnemyMovementBlockHitbox(enemy);
  if (movementBlockHitbox && rectsOverlap(getPlayerBodyHitbox(player), movementBlockHitbox)) {
    return {
      type: 'damage',
      direction: (player.x + player.width / 2) >= (enemy.x + enemy.width / 2) ? 1 : -1,
      blocked: true,
    };
  }

  const playerFeet = getPlayerFeetHitbox(player);
  const previousFeetY = previousPlayer.y + previousPlayer.height;
  if (
    player.vy >= 0
    && previousFeetY <= enemy.y + JOURNEY_HITBOX_TUNING.enemyStomp.previousFootTolerance
    && rectsOverlap(playerFeet, getEnemyStompHitbox(enemy))
  ) {
    return { type: 'stomp' };
  }

  if (rectsOverlap(getPlayerBodyHitbox(player), getEnemyDamageHitbox(enemy))) {
    return {
      type: 'damage',
      direction: (player.x + player.width / 2) >= (enemy.x + enemy.width / 2) ? 1 : -1,
    };
  }

  return { type: 'none' };
};

export const getSectionForX = (x) => (
  SECTIONS.find((section) => x >= section.start && x < section.end) || SECTIONS[SECTIONS.length - 1]
);

export const getPlayerMovementVisualStyle = (player) => {
  const speed = Math.abs(player.vx || 0);
  if (speed <= 8) return 'none';
  if (speed < 95) return 'survey-walk';
  if (speed > 190) return 'run';
  return 'walk';
};

export const getPlayerAnimationState = (current) => {
  if (current.player.hitFeedbackTimer > 0 || current.player.knockbackTimer > 0) return 'hurt';
  if (current.attackWindupTimer > 0 || current.attackTimer > 0 || current.attackRecoilTimer > 0) return 'attack';
  if (!current.player.onGround) return current.player.vy > 40 ? 'fall' : 'jump';
  if (current.player.landingFeedbackTimer > 0) return 'land';
  const movementStyle = getPlayerMovementVisualStyle(current.player);
  if (movementStyle !== 'none') return movementStyle;
  return 'idle';
};

export const getPlayerAnimationFrame = (animationState, walkCycleDistance = 0, player = {}) => {
  if (animationState === 'survey-walk') {
    return Math.floor(walkCycleDistance / 34) % PLAYER_SPRITE_FRAME_COUNT;
  }
  if (animationState === 'walk') {
    return Math.floor(walkCycleDistance / 22) % PLAYER_SPRITE_FRAME_COUNT;
  }
  if (animationState === 'run') {
    return Math.floor(walkCycleDistance / 15) % PLAYER_SPRITE_FRAME_COUNT;
  }
  if (animationState === 'jump') {
    const vy = player.vy || 0;
    if (vy < -620) return 0;
    if (vy < -430) return 1;
    if (vy < -230) return 2;
    return 3;
  }
  if (animationState === 'fall') {
    const vy = player.vy || 0;
    if (vy < 160) return 3;
    if (vy < 320) return 4;
    if (vy < 520) return 5;
    if (vy < 700) return 6;
    return 7;
  }
  if (animationState === 'land') {
    const landingProgress = 1 - Math.max(0, Math.min(1, (player.landingFeedbackTimer || 0) / 0.22));
    return Math.min(3, Math.floor(landingProgress * 4));
  }
  if (animationState === 'attack') return 3;
  if (animationState === 'hurt') return 0;
  return 1;
};

export const updatePlayerAnimation = (current, dt) => {
  const animationState = getPlayerAnimationState(current);
  const visualWalkStyle = getPlayerMovementVisualStyle(current.player);
  if (['survey-walk', 'walk', 'run'].includes(animationState)) {
    current.player.walkCycleDistance += Math.abs(current.player.vx) * dt;
  }
  current.player.animationState = animationState;
  current.player.visualWalkStyle = visualWalkStyle;
  current.player.animationFrame = getPlayerAnimationFrame(animationState, current.player.walkCycleDistance, current.player);
  current.player.spriteScale = PLAYER_SPRITE_SCALE;
};

export const makeEnemy = (enemy) => ({
  ...enemy,
  direction: 1,
  health: tuneEnemyHealth(enemy),
  maxHealth: tuneEnemyHealth(enemy),
  damage: tuneEnemyDamage(enemy),
  defeated: false,
  stunTimer: 0,
  hitFlash: 0,
  attackWindup: 0,
  attackTimer: 0,
  attackCooldown: enemy.initialAttackCooldown ?? 0.8,
  attackDirection: 1,
  attackHasHit: false,
  attackReady: false,
  attackRecovery: 0,
  attackPattern: 'patrol',
  attackPhaseLabel: 'Patrol',
  aggroMemoryTimer: 0,
  vulnerabilityTimer: 0,
  shieldTimer: 0,
  knockbackTimer: 0,
  knockbackDirection: 0,
  ...makeStepProfile(enemy),
});

export const makeMiniBoss = (boss) => ({
  ...boss,
  direction: 1,
  health: Math.max(boss.health + 1, Math.ceil(boss.health * 1.35)),
  maxHealth: Math.max(boss.health + 1, Math.ceil(boss.health * 1.35)),
  damage: Math.max(boss.damage + 2, Math.ceil(boss.damage * 1.3)),
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
  ...makeStepProfile(boss, { boss: true }),
});

export const makeBossKeyItem = (item) => ({
  ...item,
  x: 0,
  y: 0,
  dropped: false,
  collected: false,
});

export const makeInitialState = ({ targetCivilisation, permanentUpgradeIds = [], permanentUpgradeEffects = {} } = {}) => ({
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
    impactShakeTimer: 0,
    lastDamage: 0,
    lastDamageSource: null,
    lastDamageTime: null,
    knockbackTimer: 0,
    knockbackMaxTimer: 0,
    knockbackDirection: 0,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    jumpCutFeedbackTimer: 0,
    landingFeedbackTimer: 0,
    movementDustTimer: 0,
    lastLandingImpact: 0,
    animationState: 'idle',
    animationFrame: 1,
    visualWalkStyle: 'none',
    walkCycleDistance: 0,
    spriteScale: PLAYER_SPRITE_SCALE,
  },
  fieldKit: [],
  collectedToolIds: new Set(),
  collectedShardIds: new Set(),
  relicShardCount: 0,
  permanentUpgrades: new Set(permanentUpgradeIds),
  upgradeEffects: {
    jumpMultiplier: 1,
    airControlMultiplier: 1,
    knockbackMultiplier: 1,
    maxStamina: 100,
    hazardStaminaMultiplier: 1,
    hiddenClueHighlights: false,
    hiddenRouteAccess: false,
    fragileWallAccess: false,
    ...permanentUpgradeEffects,
  },
  collectedUpgrades: new Set(permanentUpgradeIds),
  collectedTabletIds: new Set(),
  discoveredHiddenRouteIds: new Set(),
  collectedSecretIds: new Set(),
  collectedObjectiveIds: new Set(),
  collectedBossKeyIds: new Set(),
  enemies: getJourneyEnemies(targetCivilisation).map(makeEnemy),
  miniBosses: getJourneyMiniBosses(targetCivilisation).map(makeMiniBoss),
  bossKeyItems: BOSS_KEY_ITEMS.map(makeBossKeyItem),
  defeatedEnemies: new Set(),
  defeatedMiniBosses: new Set(),
  hiddenRoomsFound: new Set(),
  completedCollectionSetIds: new Set(),
  openedRouteGateIds: new Set(),
  completedObjectiveIds: new Set(),
  triggeredEnvironmentEventIds: new Set(),
  scarabSealActivated: false,
  openingConfrontationSeen: false,
  openingFirstShardEchoSeen: false,
  openingThresholdScene: null,
  templeThresholdTransition: null,
  openingCameraRevealTimer: 0,
  openingCameraRevealDuration: 1.55,
  brokenEnvironmentIds: new Set(),
  triggeredEnvironmentIds: new Set(),
  collapsedPlatformIds: new Set(),
  reactivePlatformTimers: {},
  activePlatformChallenge: null,
  recentEnvironmentInteractions: [],
  cinematicEvent: null,
  cinematicTimer: 0,
  postBossReward: null,
  postBossRewardTimer: 0,
  bossIntro: null,
  bossIntroTimer: 0,
  bossIntroPauseTimer: 0,
  bossDomain: null,
  seenBossIntroIds: new Set(),
  seenEnemyTypeNoticeIds: new Set(),
  activeGuardianChallenge: null,
  pendingGuardianChallenge: null,
  completedGuardianChallengeIds: new Set(),
  guardianChallengeResults: {},
  guardianBattleModifiers: {},
  environmentEvent: null,
  environmentEventTimer: 0,
  dynamicEnvironmentEvent: null,
  dynamicEnvironmentEventTimer: 0,
  discoveryEntranceActive: false,
  discoveryEntranceTimer: 0,
  discoveryEntranceHandoffStarted: false,
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
    stamina: permanentUpgradeEffects.maxStamina || 100,
    time: 900,
  },
  notice: INITIAL_JOURNEY_NOTICE,
  itemPurposeNoticeTimer: 0,
  damageNoticeTimer: 0,
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
  failureDetail: '',
  completed: false,
});
