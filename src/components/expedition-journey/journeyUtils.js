import {
  GROUND_Y,
  INITIAL_JOURNEY_NOTICE,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
} from './journeyConstants';
import { CHECKPOINTS, ENEMIES, MINI_BOSSES, SECTIONS, SECTION_ATMOSPHERES } from './journeyLevelData';

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
    hitFeedbackTimer: 0,
    lastDamage: 0,
  },
  fieldKit: [],
  collectedToolIds: new Set(),
  collectedShardIds: new Set(),
  relicShardCount: 0,
  collectedUpgrades: new Set(),
  collectedTabletIds: new Set(),
  collectedObjectiveIds: new Set(),
  enemies: ENEMIES.map(makeEnemy),
  miniBosses: MINI_BOSSES.map(makeMiniBoss),
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
  environmentEvent: null,
  environmentEventTimer: 0,
  sectionTransition: {
    id: 'desert-entry',
    name: SECTIONS[0].name,
    message: SECTION_ATMOSPHERES[SECTIONS[0].id].title,
  },
  sectionTransitionTimer: 2.6,
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
  enemyCooldown: 0,
  attackCooldown: 0,
  attackTimer: 0,
  attackQueued: false,
  attackHitIds: new Set(),
  playerAttackBox: null,
  routeGateCooldown: 0,
  timeAccumulator: 0,
  failed: false,
  failureReason: '',
  completed: false,
});
