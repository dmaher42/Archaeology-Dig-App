import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Backpack,
  ChevronLeft,
  Flag,
  Gauge,
  Gem,
  Map,
  ShieldAlert,
  Sparkles,
  Swords,
} from 'lucide-react';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 420;
const WORLD_WIDTH = 7600;
const GROUND_Y = 360;
const PLAYER_WIDTH = 28;
const PLAYER_HEIGHT = 42;
const GRAVITY = 1850;
const MOVE_SPEED = 245;
const JUMP_SPEED = 620;
const ATTACK_COOLDOWN = 0.38;
const ATTACK_DURATION = 0.16;
const INVULNERABLE_DURATION = 1.05;

const INITIAL_JOURNEY_NOTICE = 'Reach Base Camp. Collect tools, relic shards, and upgrades along the way.';

const JOURNEY_TOOLS = [
  { id: 'brush', name: 'Brush', icon: 'B' },
  { id: 'trowel', name: 'Trowel', icon: 'T' },
  { id: 'notebook', name: 'Notebook', icon: 'N' },
  { id: 'camera', name: 'Camera', icon: 'C' },
  { id: 'measuring-tape', name: 'Measuring Tape', icon: 'M' },
  { id: 'field-guide-page', name: 'Field Guide Page', icon: 'F' },
];

const SECTIONS = [
  { id: 'desert-entry', name: 'Desert Entry', start: 0, end: 1500, color: '#e8c179', accent: '#b66d34' },
  { id: 'ruined-temple', name: 'Ruined Temple', start: 1500, end: 3150, color: '#c9ad82', accent: '#6f5b45' },
  { id: 'catacombs', name: 'Catacombs', start: 3150, end: 5050, color: '#4f4a46', accent: '#b99b5b' },
  { id: 'escape-sequence', name: 'Escape Sequence', start: 5050, end: 6500, color: '#9f6b4b', accent: '#5b2c20' },
  { id: 'dig-site-entrance', name: 'Dig Site Entrance', start: 6500, end: WORLD_WIDTH, color: '#8f9f7a', accent: '#31543d' },
];

const TOOL_LAYOUT = [
  { id: 'brush', x: 220, y: 314 },
  { id: 'trowel', x: 770, y: 320 },
  { id: 'notebook', x: 1780, y: 320 },
  { id: 'camera', x: 2860, y: 320 },
  { id: 'measuring-tape', x: 4280, y: 260 },
  { id: 'field-guide-page', x: 6210, y: 208 },
];

const PLATFORMS = [
  { x: 0, y: GROUND_Y, width: 1500, height: 60, label: 'desert track' },
  { x: 1500, y: GROUND_Y, width: 1650, height: 60, label: 'temple floor' },
  { x: 3150, y: GROUND_Y, width: 1900, height: 60, label: 'catacomb path' },
  { x: 5050, y: GROUND_Y, width: 1450, height: 60, label: 'escape road' },
  { x: 6500, y: GROUND_Y, width: 1100, height: 60, label: 'dig-site rise' },
  { x: 360, y: 292, width: 175, height: 18, label: 'sun-baked ledge' },
  { x: 690, y: 276, width: 165, height: 18, label: 'broken column' },
  { x: 1180, y: 304, width: 150, height: 18, label: 'survey ridge' },
  { x: 1640, y: 292, width: 180, height: 18, label: 'temple plinth' },
  { x: 1940, y: 246, width: 150, height: 18, label: 'upper step' },
  { x: 2225, y: 204, width: 160, height: 18, label: 'rope shelf', requiresUpgrade: 'rope-launcher' },
  { x: 2500, y: 264, width: 210, height: 18, label: 'mural walkway' },
  { x: 2790, y: 222, width: 185, height: 18, label: 'archive ledge' },
  { x: 3310, y: 300, width: 180, height: 18, label: 'catacomb shelf' },
  { x: 3600, y: 252, width: 160, height: 18, label: 'hidden stair', secret: true, requiresUpgrade: 'torch-upgrade' },
  { x: 3890, y: 206, width: 160, height: 18, label: 'torch alcove', secret: true, requiresUpgrade: 'torch-upgrade' },
  { x: 4200, y: 278, width: 210, height: 18, label: 'bone-dry bridge' },
  { x: 4590, y: 226, width: 170, height: 18, label: 'relic loft', secret: true, requiresUpgrade: 'historian-vision' },
  { x: 5160, y: 300, width: 160, height: 18, label: 'falling stair' },
  { x: 5440, y: 258, width: 155, height: 18, label: 'escape shelf' },
  { x: 5740, y: 222, width: 155, height: 18, label: 'collapsed arch' },
  { x: 6045, y: 284, width: 180, height: 18, label: 'final run ledge' },
  { x: 6660, y: 302, width: 170, height: 18, label: 'camp overlook' },
  { x: 6950, y: 250, width: 160, height: 18, label: 'secret survey perch', secret: true, requiresUpgrade: 'ancient-compass' },
  { x: 7240, y: 302, width: 170, height: 18, label: 'last ledge' },
];

const HAZARDS = [
  { id: 'thorn-bush', name: 'thorn bush', x: 560, y: 329, width: 54, height: 31, penalty: { stamina: 8 }, message: 'Thorn scrub slowed the team. Stamina reduced.' },
  { id: 'sand-pit', name: 'soft sand', x: 1060, y: 330, width: 92, height: 30, penalty: { time: 10 }, message: 'Soft sand cost the team time.' },
  { id: 'spike-trap', name: 'temple trap', x: 2050, y: 330, width: 70, height: 30, penalty: { stamina: 12 }, message: 'A temple trap clipped your route. Stamina reduced.' },
  { id: 'rolling-stones', name: 'rolling stones', x: 2925, y: 318, width: 70, height: 42, penalty: { stamina: 12, time: 5 }, message: 'Rolling stones forced a scramble.' },
  { id: 'dark-gap', name: 'dark gap', x: 3460, y: 344, width: 90, height: 18, penalty: { stamina: 10 }, message: 'You stumbled in a dark gap.' },
  { id: 'bat-cloud', name: 'bat cloud', x: 4470, y: 244, width: 105, height: 78, penalty: { time: 9 }, message: 'A cloud of bats scattered the team.' },
  { id: 'falling-blocks', name: 'falling blocks', x: 5350, y: 318, width: 90, height: 42, penalty: { stamina: 14 }, message: 'Falling blocks made the escape tense.' },
  { id: 'dust-wave', name: 'dust wave', x: 5960, y: 316, width: 130, height: 44, penalty: { time: 12 }, message: 'Dust reduced visibility. Time reduced.' },
  { id: 'loose-slope', name: 'loose slope', x: 6910, y: 330, width: 110, height: 30, penalty: { stamina: 10 }, message: 'Loose stones made the final climb harder.' },
];

const ENEMIES = [
  { id: 'scarab-1', name: 'Scarab', type: 'scarab', x: 890, y: 334, width: 34, height: 26, patrolMin: 820, patrolMax: 1040, speed: 80, health: 1, damage: 8, shards: 2 },
  { id: 'snake-1', name: 'Sand Snake', type: 'snake', x: 1390, y: 330, width: 42, height: 30, patrolMin: 1320, patrolMax: 1470, speed: 62, health: 1, damage: 10, shards: 2 },
  { id: 'guardian-1', name: 'Stone Guardian', type: 'guardian', x: 2350, y: 318, width: 36, height: 42, patrolMin: 2240, patrolMax: 2580, speed: 72, health: 2, damage: 12, shards: 4 },
  { id: 'looter-1', name: 'Rival Looter', type: 'looter', x: 3040, y: 318, width: 34, height: 42, patrolMin: 2920, patrolMax: 3140, speed: 90, health: 2, damage: 12, shards: 4 },
  { id: 'bat-1', name: 'Temple Bat', type: 'bat', x: 3700, y: 245, width: 34, height: 28, patrolMin: 3600, patrolMax: 3870, speed: 118, health: 1, damage: 8, shards: 3, flying: true },
  { id: 'statue-1', name: 'Cursed Statue', type: 'statue', x: 4700, y: 318, width: 42, height: 42, patrolMin: 4630, patrolMax: 4860, speed: 56, health: 3, damage: 14, shards: 6 },
  { id: 'scarab-2', name: 'Scarab Swarm', type: 'scarab', x: 5240, y: 334, width: 44, height: 26, patrolMin: 5140, patrolMax: 5410, speed: 130, health: 2, damage: 10, shards: 4 },
  { id: 'looter-2', name: 'Rival Looter', type: 'looter', x: 6330, y: 318, width: 34, height: 42, patrolMin: 6170, patrolMax: 6470, speed: 95, health: 2, damage: 12, shards: 4 },
  { id: 'guardian-2', name: 'Gate Guardian', type: 'guardian', x: 7180, y: 318, width: 38, height: 42, patrolMin: 7060, patrolMax: 7350, speed: 78, health: 3, damage: 15, shards: 8 },
];

const RELIC_SHARDS = [
  310, 455, 620, 820, 980, 1240, 1430, 1660, 1840, 2020, 2265, 2440, 2600, 2835,
  3015, 3260, 3430, 3615, 3765, 3925, 4210, 4360, 4565, 4720, 4890, 5165, 5320,
  5490, 5660, 5835, 6060, 6220, 6400, 6610, 6780, 6965, 7130, 7280, 7425,
].map((x, index) => ({
  id: `shard-${index + 1}`,
  x,
  y: index % 5 === 0 ? 244 : index % 3 === 0 ? 284 : 320,
  hidden: [17, 18, 19, 24, 25, 36].includes(index + 1),
}));

const UPGRADES = [
  { id: 'reinforced-boots', name: 'Reinforced Boots', shortName: 'Boots', x: 1160, y: 320, effect: 'Higher jump for temple ledges.' },
  { id: 'rope-launcher', name: 'Rope Launcher', shortName: 'Rope', x: 2140, y: 232, effect: 'One extra mid-air jump to reach optional shelves.' },
  { id: 'torch-upgrade', name: 'Torch Upgrade', shortName: 'Torch', x: 3345, y: 320, effect: 'Reveals darker catacomb routes.' },
  { id: 'historian-vision', name: 'Historian Vision', shortName: 'Vision', x: 4620, y: 190, effect: 'Reveals hidden relic shard clusters.' },
  { id: 'ancient-compass', name: 'Ancient Compass', shortName: 'Compass', x: 6675, y: 320, effect: 'Marks secret rooms near the dig-site entrance.' },
];

const CHECKPOINTS = [
  { id: 'desert-entry', name: 'Desert Entry', x: 80, y: 282 },
  { id: 'ruined-temple', name: 'Ruined Temple', x: 1560, y: 282 },
  { id: 'catacombs', name: 'Catacombs', x: 3220, y: 282 },
  { id: 'escape-sequence', name: 'Escape Sequence', x: 5120, y: 282 },
  { id: 'dig-site-entrance', name: 'Dig Site Entrance', x: 6600, y: 282 },
];

const ROUTE_GATES = [
  {
    id: 'temple-seal',
    name: 'Temple Route Seal',
    x: 3090,
    y: 86,
    width: 34,
    height: 274,
    message: 'Secure the temple route before entering the catacombs.',
    requires: {
      shards: 8,
      defeatedEnemies: 1,
      upgrades: ['reinforced-boots'],
    },
  },
  {
    id: 'catacomb-seal',
    name: 'Catacomb Route Seal',
    x: 4985,
    y: 86,
    width: 34,
    height: 274,
    message: 'Light and survey the catacombs before the escape path opens.',
    requires: {
      shards: 14,
      upgrades: ['torch-upgrade'],
    },
  },
  {
    id: 'escape-seal',
    name: 'Escape Route Seal',
    x: 6460,
    y: 86,
    width: 34,
    height: 274,
    message: 'Complete the escape route challenge before the dig-site entrance.',
    requires: {
      shards: 20,
      defeatedEnemies: 2,
    },
  },
  {
    id: 'basecamp-seal',
    name: 'Base Camp Survey Seal',
    x: 7405,
    y: 86,
    width: 34,
    height: 274,
    message: 'Collect enough route evidence before reporting to Base Camp.',
    requires: {
      shards: 22,
      checkpoint: 'dig-site-entrance',
    },
  },
];

const HIDDEN_ROOMS = [
  { id: 'mural-cache', name: 'Mural Cache', x: 2220, y: 152, width: 260, height: 96, requiresUpgrade: 'rope-launcher' },
  { id: 'torch-alcove', name: 'Torch Alcove', x: 3560, y: 154, width: 420, height: 112, requiresUpgrade: 'torch-upgrade' },
  { id: 'relic-loft', name: 'Relic Loft', x: 4520, y: 154, width: 310, height: 110, requiresUpgrade: 'historian-vision' },
  { id: 'survey-perch', name: 'Survey Perch', x: 6910, y: 198, width: 310, height: 96, requiresUpgrade: 'ancient-compass' },
];

const LORE_TABLETS = [
  { id: 'tablet-1', x: 1900, y: 214, text: 'Tablet found: temple builders used side passages to protect the site.' },
  { id: 'tablet-2', x: 3840, y: 176, text: 'Tablet found: torchlight reveals careful records, not treasure maps.' },
  { id: 'tablet-3', x: 7040, y: 218, text: 'Tablet found: Base Camp lies beyond the last guardian path.' },
];

const GATE = { x: 7480, y: 282, width: 56, height: 78 };

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const rectsOverlap = (a, b) => (
  a.x < b.x + b.width
  && a.x + a.width > b.x
  && a.y < b.y + b.height
  && a.y + a.height > b.y
);

const getSectionForX = (x) => (
  SECTIONS.find((section) => x >= section.start && x < section.end) || SECTIONS[SECTIONS.length - 1]
);

const makeEnemy = (enemy) => ({
  ...enemy,
  direction: 1,
  maxHealth: enemy.health,
  defeated: false,
  stunTimer: 0,
  hitFlash: 0,
});

const makeInitialState = () => ({
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
  },
  fieldKit: [],
  collectedToolIds: new Set(),
  collectedShardIds: new Set(),
  relicShardCount: 0,
  collectedUpgrades: new Set(),
  collectedTabletIds: new Set(),
  enemies: ENEMIES.map(makeEnemy),
  defeatedEnemies: new Set(),
  hiddenRoomsFound: new Set(),
  openedRouteGateIds: new Set(),
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
  routeGateCooldown: 0,
  timeAccumulator: 0,
  failed: false,
  failureReason: '',
  completed: false,
});

function ExpeditionJourney({ mission, onBackToMenu, onComplete, onSnapshotChange, audioControls }) {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const stateRef = useRef(makeInitialState());
  const lastFrameRef = useRef(0);
  const animationRef = useRef(0);
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [hud, setHud] = useState(() => ({
    fieldKit: [],
    resources: { stamina: 100, time: 900 },
    notice: INITIAL_JOURNEY_NOTICE,
    failed: false,
    failureReason: '',
    relicShardCount: 0,
    collectedUpgrades: [],
    activeCheckpoint: CHECKPOINTS[0].name,
    journeySection: SECTIONS[0].name,
    defeatedEnemies: 0,
    hiddenRoomsFound: 0,
    routeGateStatus: null,
    enemyWarning: '',
  }));

  const getGateRequirements = useCallback((gate, current = stateRef.current) => {
    if (!gate) return [];
    const requirements = [];
    const requires = gate.requires;
    if (requires.shards) {
      requirements.push({
        label: `${requires.shards} relic shards`,
        met: current.relicShardCount >= requires.shards,
      });
    }
    if (requires.defeatedEnemies) {
      requirements.push({
        label: `${requires.defeatedEnemies} ${requires.defeatedEnemies === 1 ? 'enemy' : 'enemies'} defeated`,
        met: current.defeatedEnemies.size >= requires.defeatedEnemies,
      });
    }
    if (requires.tools) {
      requirements.push({
        label: `${requires.tools} field tools packed`,
        met: current.fieldKit.length >= requires.tools,
      });
    }
    if (requires.checkpoint) {
      const checkpoint = CHECKPOINTS.find((item) => item.id === requires.checkpoint);
      requirements.push({
        label: `${checkpoint?.name || requires.checkpoint} checkpoint`,
        met: current.activeCheckpoint.id === requires.checkpoint,
      });
    }
    (requires.upgrades || []).forEach((upgradeId) => {
      const upgrade = UPGRADES.find((item) => item.id === upgradeId);
      requirements.push({
        label: upgrade?.name || upgradeId,
        met: current.collectedUpgrades.has(upgradeId),
      });
    });
    return requirements;
  }, []);

  const getNextRouteGateStatus = useCallback((current = stateRef.current) => {
    const nextGate = ROUTE_GATES.find((gate) => !current.openedRouteGateIds.has(gate.id) && gate.x > current.player.x - 12);
    if (!nextGate) return null;
    const requirements = getGateRequirements(nextGate, current);
    const metCount = requirements.filter((requirement) => requirement.met).length;
    return {
      id: nextGate.id,
      name: nextGate.name,
      distance: Math.max(0, Math.round(nextGate.x - current.player.x)),
      requirements,
      complete: metCount === requirements.length,
      summary: `${metCount}/${requirements.length} ready`,
    };
  }, [getGateRequirements]);

  const makeSnapshot = useCallback(() => {
    const current = stateRef.current;
    const player = current.player;
    const section = getSectionForX(player.x);
    const nearbyEnemies = current.enemies
      .filter((enemy) => !enemy.defeated && Math.abs(enemy.x - player.x) < 420)
      .map((enemy) => ({
        id: enemy.id,
        name: enemy.name,
        x: Math.round(enemy.x),
        y: Math.round(enemy.y),
        health: enemy.health,
        stunned: enemy.stunTimer > 0,
      }));

    return {
      stage: 'journey',
      coordinateSystem: 'origin top-left, x right, y down',
      player: {
        x: Math.round(player.x),
        y: Math.round(player.y),
        vx: Math.round(player.vx),
        vy: Math.round(player.vy),
        onGround: player.onGround,
      },
      journeySection: section.name,
      worldProgressPercent: Math.round((player.x / (WORLD_WIDTH - PLAYER_WIDTH)) * 100),
      resources: { ...current.resources },
      fieldKit: [...current.fieldKit],
      remainingTools: JOURNEY_TOOLS
        .filter((tool) => !current.collectedToolIds.has(tool.id))
        .map((tool) => tool.name),
      relicShardCount: current.relicShardCount,
      totalRelicShards: RELIC_SHARDS.length,
      collectedUpgrades: [...current.collectedUpgrades],
      activeCheckpoint: current.activeCheckpoint.name,
      defeatedEnemies: [...current.defeatedEnemies],
      hiddenRoomsFound: [...current.hiddenRoomsFound],
      routeGateStatus: getNextRouteGateStatus(current),
      playerCombatState: {
        attacking: current.attackTimer > 0,
        attackCooldown: Number(current.attackCooldown.toFixed(2)),
        invulnerable: Number(player.invulnerable.toFixed(2)),
      },
      enemyStates: nearbyEnemies,
      hazards: HAZARDS.map((hazard) => hazard.name),
      endGateReached: current.completed,
      briefingOpen,
      failed: current.failed,
      failureReason: current.failureReason,
      notice: current.notice,
    };
  }, [briefingOpen, getNextRouteGateStatus]);

  const syncHud = useCallback(() => {
    const current = stateRef.current;
    const section = getSectionForX(current.player.x);
    const enemyWarning = current.enemies
      .filter((enemy) => !enemy.defeated)
      .sort((a, b) => Math.abs(a.x - current.player.x) - Math.abs(b.x - current.player.x))[0];
    setHud({
      fieldKit: [...current.fieldKit],
      resources: { ...current.resources },
      notice: current.notice,
      failed: current.failed,
      failureReason: current.failureReason,
      relicShardCount: current.relicShardCount,
      collectedUpgrades: [...current.collectedUpgrades],
      activeCheckpoint: current.activeCheckpoint.name,
      journeySection: section.name,
      defeatedEnemies: current.defeatedEnemies.size,
      hiddenRoomsFound: current.hiddenRoomsFound.size,
      routeGateStatus: getNextRouteGateStatus(current),
      enemyWarning: enemyWarning && Math.abs(enemyWarning.x - current.player.x) < 520
        ? `${enemyWarning.name} nearby`
        : '',
    });
    onSnapshotChange?.(makeSnapshot());
  }, [getNextRouteGateStatus, makeSnapshot, onSnapshotChange]);

  const restartJourney = useCallback(() => {
    stateRef.current = makeInitialState();
    keysRef.current = {};
    setBriefingOpen(true);
    syncHud();
  }, [syncHud]);

  const triggerJourneyRescue = useCallback((reason) => {
    const current = stateRef.current;
    if (current.failed || current.completed) return;
    current.failed = true;
    current.failureReason = reason;
    current.notice = reason;
    keysRef.current = {};
    audioControls?.playError?.();
    syncHud();
  }, [audioControls, syncHud]);

  const respawnAtCheckpoint = useCallback((message) => {
    const current = stateRef.current;
    const checkpoint = current.activeCheckpoint;
    current.player.x = checkpoint.x + 22;
    current.player.y = GROUND_Y - PLAYER_HEIGHT;
    current.player.vx = 0;
    current.player.vy = 0;
    current.player.onGround = true;
    current.player.airJumpsUsed = 0;
    current.player.invulnerable = INVULNERABLE_DURATION;
    current.resources.stamina = Math.max(25, current.resources.stamina - 8);
    current.notice = message || `Returned to ${checkpoint.name}. Stamina restored enough to keep going.`;
    audioControls?.playError?.();
    if (current.resources.stamina <= 0) {
      triggerJourneyRescue('Field rescue needed: stamina reached zero. Restart the journey and use checkpoints carefully.');
    }
  }, [audioControls, triggerJourneyRescue]);

  const drawPlatform = useCallback((ctx, platform, cameraX, current) => {
    if (platform.requiresUpgrade && !current.collectedUpgrades.has(platform.requiresUpgrade)) {
      if (!platform.secret) return;
      ctx.globalAlpha = 0.16;
    }
    const x = platform.x - cameraX;
    ctx.fillStyle = platform.secret ? '#7f643f' : platform.y === GROUND_Y ? '#8b6a47' : '#6f5b45';
    ctx.fillRect(x, platform.y, platform.width, platform.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.fillRect(x, platform.y, platform.width, 5);
    ctx.strokeStyle = 'rgba(37, 25, 14, 0.36)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, platform.y, platform.width, platform.height);
    ctx.globalAlpha = 1;
  }, []);

  const drawCollectible = useCallback((ctx, x, y, cameraX, now, label, color, hidden = false) => {
    const screenX = x - cameraX;
    const floatY = Math.sin((now / 220) + x) * 4;
    ctx.save();
    ctx.globalAlpha = hidden ? 0.42 : 1;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#fff8d7';
    ctx.beginPath();
    ctx.arc(screenX, y + floatY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = '800 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, screenX, y + floatY + 4);
    ctx.restore();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const current = stateRef.current;
    const player = current.player;
    const cameraX = clamp(player.x - 260, 0, WORLD_WIDTH - CANVAS_WIDTH);
    const now = Date.now();
    const section = getSectionForX(player.x);

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGradient.addColorStop(0, section.id === 'catacombs' ? '#262b33' : '#f2dca5');
    skyGradient.addColorStop(1, section.color);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = section.id === 'catacombs' ? 'rgba(0, 0, 0, 0.28)' : 'rgba(112, 73, 42, 0.16)';
    for (let hill = -160; hill < WORLD_WIDTH; hill += 240) {
      ctx.beginPath();
      ctx.ellipse(hill - cameraX, 355, 180, 45, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    SECTIONS.forEach((area) => {
      if (area.end < cameraX || area.start > cameraX + CANVAS_WIDTH) return;
      ctx.fillStyle = area.id === section.id ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(area.start - cameraX, 0, area.end - area.start, CANVAS_HEIGHT);
      ctx.fillStyle = area.accent;
      ctx.font = '800 16px Outfit, sans-serif';
      ctx.fillText(area.name, area.start - cameraX + 24, 84);
    });

    HIDDEN_ROOMS.forEach((room) => {
      const visible = current.collectedUpgrades.has(room.requiresUpgrade);
      if (!visible && room.requiresUpgrade !== 'ancient-compass') return;
      if (room.x + room.width < cameraX || room.x > cameraX + CANVAS_WIDTH) return;
      ctx.save();
      ctx.globalAlpha = visible ? 0.28 : 0.1;
      ctx.fillStyle = '#f5d56e';
      ctx.fillRect(room.x - cameraX, room.y, room.width, room.height);
      ctx.strokeStyle = '#f5d56e';
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(room.x - cameraX, room.y, room.width, room.height);
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      if (visible) {
        ctx.fillStyle = '#fff8d7';
        ctx.font = '700 12px Outfit, sans-serif';
        ctx.fillText(room.name, room.x - cameraX + 12, room.y + 22);
      }
      ctx.restore();
    });

    PLATFORMS.forEach((platform) => drawPlatform(ctx, platform, cameraX, current));

    const pulse = (Math.sin(now / 200) + 1) / 2;
    HAZARDS.forEach((hazard) => {
      const x = hazard.x - cameraX;
      if (x + hazard.width < -80 || x > CANVAS_WIDTH + 80) return;
      ctx.fillStyle = 'rgba(155, 52, 36, 0.22)';
      ctx.fillRect(x, hazard.y, hazard.width, hazard.height);
      ctx.strokeStyle = `rgba(155, 52, 36, ${0.45 + pulse * 0.35})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = -now / 30;
      ctx.strokeRect(x, hazard.y, hazard.width, hazard.height);
      ctx.setLineDash([]);
      ctx.fillStyle = '#682b1c';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(hazard.name, x + hazard.width / 2, hazard.y - 7);
      ctx.textAlign = 'start';
    });

    CHECKPOINTS.forEach((checkpoint) => {
      const x = checkpoint.x - cameraX;
      if (x < -80 || x > CANVAS_WIDTH + 80) return;
      const active = current.activeCheckpoint.id === checkpoint.id;
      ctx.fillStyle = active ? '#2d5a27' : '#7c4a21';
      ctx.fillRect(x, checkpoint.y, 12, 78);
      ctx.fillStyle = active ? '#d9f99d' : '#fee2b3';
      ctx.beginPath();
      ctx.moveTo(x + 12, checkpoint.y + 6);
      ctx.lineTo(x + 64, checkpoint.y + 22);
      ctx.lineTo(x + 12, checkpoint.y + 38);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2f251d';
      ctx.font = '700 11px Outfit, sans-serif';
      ctx.fillText(active ? 'Checkpoint' : checkpoint.name, x - 8, checkpoint.y - 8);
    });

    ROUTE_GATES.forEach((gate) => {
      if (current.openedRouteGateIds.has(gate.id)) return;
      const x = gate.x - cameraX;
      if (x + gate.width < -80 || x > CANVAS_WIDTH + 80) return;
      const requirements = getGateRequirements(gate, current);
      const complete = requirements.every((requirement) => requirement.met);
      ctx.save();
      ctx.fillStyle = complete ? 'rgba(45, 90, 39, 0.72)' : 'rgba(91, 43, 22, 0.82)';
      ctx.fillRect(x, gate.y, gate.width, gate.height);
      ctx.strokeStyle = complete ? '#d9f99d' : '#facc15';
      ctx.lineWidth = 3;
      ctx.setLineDash(complete ? [] : [7, 6]);
      ctx.strokeRect(x, gate.y, gate.width, gate.height);
      ctx.setLineDash([]);
      ctx.fillStyle = '#fff8d7';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(complete ? 'OPEN' : 'LOCK', x + gate.width / 2, gate.y - 10);
      ctx.translate(x + gate.width / 2, gate.y + gate.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(gate.name, 0, 4);
      ctx.restore();
    });

    current.enemies.forEach((enemy) => {
      if (enemy.defeated) return;
      const x = enemy.x - cameraX;
      if (x + enemy.width < -80 || x > CANVAS_WIDTH + 80) return;
      ctx.save();
      if (enemy.hitFlash > 0) ctx.globalAlpha = 0.55;
      ctx.fillStyle = enemy.type === 'guardian' || enemy.type === 'statue' ? '#5b4b3a' : '#6d3f25';
      if (enemy.type === 'bat') ctx.fillStyle = '#2f3542';
      if (enemy.type === 'looter') ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(x, enemy.y, enemy.width, enemy.height);
      ctx.strokeStyle = enemy.stunTimer > 0 ? '#facc15' : '#1f1610';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, enemy.y, enemy.width, enemy.height);
      ctx.fillStyle = '#fff4d4';
      ctx.font = '800 10px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(enemy.name, x + enemy.width / 2, enemy.y - 8);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x, enemy.y + enemy.height + 5, enemy.width, 4);
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(x, enemy.y + enemy.height + 5, enemy.width * (enemy.health / enemy.maxHealth), 4);
      ctx.restore();
      ctx.textAlign = 'start';
    });

    RELIC_SHARDS.forEach((shard) => {
      if (current.collectedShardIds.has(shard.id)) return;
      if (shard.hidden && !current.collectedUpgrades.has('historian-vision')) return;
      drawCollectible(ctx, shard.x, shard.y, cameraX, now, 'R', '#b45309', shard.hidden);
    });

    UPGRADES.forEach((upgrade) => {
      if (current.collectedUpgrades.has(upgrade.id)) return;
      drawCollectible(ctx, upgrade.x, upgrade.y, cameraX, now, 'U', '#2563eb');
      ctx.fillStyle = '#1e293b';
      ctx.font = '700 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(upgrade.shortName, upgrade.x - cameraX, upgrade.y - 23);
      ctx.textAlign = 'start';
    });

    TOOL_LAYOUT.forEach((toolPosition) => {
      if (current.collectedToolIds.has(toolPosition.id)) return;
      const tool = JOURNEY_TOOLS.find((item) => item.id === toolPosition.id);
      drawCollectible(ctx, toolPosition.x, toolPosition.y, cameraX, now, tool.icon, '#d4af37');
      ctx.fillStyle = '#3b2b1f';
      ctx.font = '700 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tool.name, toolPosition.x - cameraX, toolPosition.y - 23);
      ctx.textAlign = 'start';
    });

    LORE_TABLETS.forEach((tablet) => {
      if (current.collectedTabletIds.has(tablet.id)) return;
      const x = tablet.x - cameraX;
      if (x < -60 || x > CANVAS_WIDTH + 60) return;
      ctx.fillStyle = '#8b6a47';
      ctx.fillRect(x - 13, tablet.y - 17, 26, 34);
      ctx.strokeStyle = '#3b2b1f';
      ctx.strokeRect(x - 13, tablet.y - 17, 26, 34);
      ctx.fillStyle = '#fff4d4';
      ctx.font = '800 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('L', x, tablet.y + 4);
      ctx.textAlign = 'start';
    });

    const gateX = GATE.x - cameraX;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#31543d';
    ctx.fillRect(gateX, GATE.y, GATE.width, GATE.height);
    ctx.strokeStyle = '#213729';
    ctx.lineWidth = 4;
    ctx.strokeRect(gateX, GATE.y, GATE.width, GATE.height);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#fff4d4';
    ctx.font = '800 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Base', gateX + GATE.width / 2, GATE.y + 32);
    ctx.fillText('Camp', gateX + GATE.width / 2, GATE.y + 50);
    ctx.textAlign = 'start';

    const playerScreenX = player.x - cameraX;
    const flicker = player.invulnerable > 0 && Math.floor(now / 80) % 2 === 0;
    if (!flicker) {
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(playerScreenX, player.y, player.width, player.height);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.strokeRect(playerScreenX, player.y, player.width, player.height);
      ctx.shadowColor = 'transparent';
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = '#fff';
      ctx.font = '800 14px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('A', playerScreenX + player.width / 2, player.y + 26);
      ctx.textAlign = 'start';
    }

    if (current.attackTimer > 0) {
      const attackX = player.direction >= 0
        ? player.x + player.width - cameraX
        : player.x - 38 - cameraX;
      ctx.fillStyle = 'rgba(250, 204, 21, 0.36)';
      ctx.fillRect(attackX, player.y + 7, 42, 28);
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(attackX, player.y + 7, 42, 28);
    }

    ctx.fillStyle = 'rgba(48, 35, 24, 0.88)';
    ctx.fillRect(16, 16, 340, 64);
    ctx.strokeStyle = '#b5865a';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, 340, 64);
    ctx.fillStyle = '#fff4d4';
    ctx.font = '800 14px Outfit, sans-serif';
    ctx.fillText(`${section.name} - ${Math.round((player.x / (WORLD_WIDTH - PLAYER_WIDTH)) * 100)}%`, 30, 40);
    ctx.font = '700 12px Outfit, sans-serif';
    ctx.fillText(`Kit ${current.fieldKit.length}/${JOURNEY_TOOLS.length}  Relics ${current.relicShardCount}/${RELIC_SHARDS.length}  Checkpoint: ${current.activeCheckpoint.name}`, 30, 62);
  }, [drawCollectible, drawPlatform, getGateRequirements]);

  const availablePlatforms = useCallback((current) => PLATFORMS.filter((platform) => (
    !platform.requiresUpgrade || current.collectedUpgrades.has(platform.requiresUpgrade)
  )), []);

  const queueAttack = useCallback(() => {
    const current = stateRef.current;
    if (briefingOpen || current.failed || current.completed) return;
    if (current.attackCooldown > 0 || current.attackTimer > 0) return;
    current.attackQueued = true;
  }, [briefingOpen]);

  const update = useCallback((dt) => {
    const current = stateRef.current;
    if (briefingOpen || current.completed || current.failed) return;

    const player = current.player;
    const keys = keysRef.current;
    const left = keys.ArrowLeft || keys.KeyA;
    const right = keys.ArrowRight || keys.KeyD;
    const jump = keys.ArrowUp || keys.KeyW || keys.Space;

    player.vx = 0;
    if (left) {
      player.vx -= MOVE_SPEED;
      player.direction = -1;
    }
    if (right) {
      player.vx += MOVE_SPEED;
      player.direction = 1;
    }
    if (current.collectedUpgrades.has('reinforced-boots')) {
      player.vx *= 1.04;
    }

    if (jump && !keys.jumpHeld) {
      const jumpStrength = current.collectedUpgrades.has('reinforced-boots') ? JUMP_SPEED + 95 : JUMP_SPEED;
      if (player.onGround) {
        player.vy = -jumpStrength;
        player.onGround = false;
        player.airJumpsUsed = 0;
        audioControls?.playPlace?.();
      } else if (current.collectedUpgrades.has('rope-launcher') && player.airJumpsUsed < 1) {
        player.vy = -JUMP_SPEED * 0.86;
        player.airJumpsUsed += 1;
        current.notice = 'Rope Launcher used for a second jump.';
        audioControls?.playPlace?.();
      }
    }
    keys.jumpHeld = Boolean(jump);

    current.routeGateCooldown = Math.max(0, current.routeGateCooldown - dt);
    current.attackCooldown = Math.max(0, current.attackCooldown - dt);
    current.attackTimer = Math.max(0, current.attackTimer - dt);
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    if (current.attackQueued && current.attackCooldown <= 0) {
      current.attackQueued = false;
      current.attackTimer = ATTACK_DURATION;
      current.attackCooldown = ATTACK_COOLDOWN;
      current.attackHitIds = new Set();
      current.notice = 'Tool swing ready: close enemies can be stunned or defeated.';
      audioControls?.playPlace?.();
    }

    const previousX = player.x;
    const previousBottom = player.y + player.height;
    player.x = clamp(player.x + player.vx * dt, 0, WORLD_WIDTH - player.width);
    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;
    player.onGround = false;

    ROUTE_GATES.forEach((gate) => {
      if (current.openedRouteGateIds.has(gate.id)) return;
      const gateRect = { x: gate.x, y: gate.y, width: gate.width, height: gate.height };
      const reachedFromLeft = previousX < gate.x && player.x + player.width >= gate.x;
      const slippedPastGate = player.x > gate.x && player.x < gate.x + 360;
      const touchingGate = rectsOverlap(player, gateRect) || reachedFromLeft || slippedPastGate;
      if (!touchingGate) return;

      const requirements = getGateRequirements(gate, current);
      const complete = requirements.every((requirement) => requirement.met);
      if (complete) {
        current.openedRouteGateIds.add(gate.id);
        current.notice = `${gate.name} opened. Route secured.`;
        audioControls?.playSuccess?.();
        return;
      }

      player.x = gate.x - player.width - 1;
      player.vx = 0;
      if (current.routeGateCooldown <= 0) {
        const missing = requirements
          .filter((requirement) => !requirement.met)
          .map((requirement) => requirement.label)
          .join(', ');
        current.notice = `${gate.message} Still needed: ${missing}.`;
        current.routeGateCooldown = 1.2;
        audioControls?.playError?.();
      }
    });

    availablePlatforms(current).forEach((platform) => {
      const platformRect = {
        x: platform.x,
        y: platform.y,
        width: platform.width,
        height: platform.height,
      };
      if (
        rectsOverlap(player, platformRect)
        && previousBottom <= platform.y + 8
        && player.vy >= 0
      ) {
        player.y = platform.y - player.height;
        player.vy = 0;
        player.onGround = true;
        player.airJumpsUsed = 0;
      }
    });

    if (player.y > CANVAS_HEIGHT + 120) {
      respawnAtCheckpoint('You slipped off the route and returned to the latest checkpoint.');
    }

    CHECKPOINTS.forEach((checkpoint) => {
      if (checkpoint.x <= current.activeCheckpoint.x) return;
      const checkpointRect = { x: checkpoint.x - 12, y: checkpoint.y, width: 82, height: 80 };
      if (rectsOverlap(player, checkpointRect)) {
        current.activeCheckpoint = checkpoint;
        current.resources.stamina = Math.min(100, current.resources.stamina + 18);
        current.notice = `${checkpoint.name} checkpoint reached. Stamina topped up.`;
        audioControls?.playSuccess?.();
      }
    });

    TOOL_LAYOUT.forEach((toolPosition) => {
      if (current.collectedToolIds.has(toolPosition.id)) return;
      const toolRect = { x: toolPosition.x - 16, y: toolPosition.y - 16, width: 32, height: 32 };
      if (rectsOverlap(player, toolRect)) {
        current.collectedToolIds.add(toolPosition.id);
        current.fieldKit.push(toolPosition.id);
        const tool = JOURNEY_TOOLS.find((item) => item.id === toolPosition.id);
        current.notice = `${tool.name} added to the field kit.`;
        audioControls?.playMatch?.();
      }
    });

    RELIC_SHARDS.forEach((shard) => {
      if (current.collectedShardIds.has(shard.id)) return;
      if (shard.hidden && !current.collectedUpgrades.has('historian-vision')) return;
      const shardRect = { x: shard.x - 14, y: shard.y - 14, width: 28, height: 28 };
      if (rectsOverlap(player, shardRect)) {
        current.collectedShardIds.add(shard.id);
        current.relicShardCount += 1;
        current.notice = `Relic shard collected. Total: ${current.relicShardCount}/${RELIC_SHARDS.length}.`;
        audioControls?.playMatch?.();
      }
    });

    UPGRADES.forEach((upgrade) => {
      if (current.collectedUpgrades.has(upgrade.id)) return;
      const upgradeRect = { x: upgrade.x - 16, y: upgrade.y - 16, width: 32, height: 32 };
      if (rectsOverlap(player, upgradeRect)) {
        current.collectedUpgrades.add(upgrade.id);
        current.notice = `${upgrade.name} unlocked: ${upgrade.effect}`;
        audioControls?.playSuccess?.();
      }
    });

    LORE_TABLETS.forEach((tablet) => {
      if (current.collectedTabletIds.has(tablet.id)) return;
      const tabletRect = { x: tablet.x - 18, y: tablet.y - 20, width: 36, height: 40 };
      if (rectsOverlap(player, tabletRect)) {
        current.collectedTabletIds.add(tablet.id);
        current.notice = tablet.text;
        audioControls?.playMatch?.();
      }
    });

    HIDDEN_ROOMS.forEach((room) => {
      if (current.hiddenRoomsFound.has(room.id)) return;
      if (!current.collectedUpgrades.has(room.requiresUpgrade)) return;
      if (rectsOverlap(player, room)) {
        current.hiddenRoomsFound.add(room.id);
        current.resources.time = Math.min(900, current.resources.time + 20);
        current.notice = `Secret found: ${room.name}. Bonus time awarded.`;
        audioControls?.playSuccess?.();
      }
    });

    current.hazardCooldown = Math.max(0, current.hazardCooldown - dt);
    current.enemyCooldown = Math.max(0, current.enemyCooldown - dt);
    if (current.hazardCooldown <= 0) {
      const hitHazard = HAZARDS.find((hazard) => rectsOverlap(player, hazard));
      if (hitHazard) {
        if (hitHazard.penalty.stamina) {
          current.resources.stamina = Math.max(0, current.resources.stamina - hitHazard.penalty.stamina);
        }
        if (hitHazard.penalty.time) {
          current.resources.time = Math.max(0, current.resources.time - hitHazard.penalty.time);
        }
        current.notice = hitHazard.message;
        current.hazardCooldown = 1.35;
        player.invulnerable = Math.max(player.invulnerable, 0.5);
        audioControls?.playError?.();
        if (current.resources.stamina <= 0 || current.resources.time <= 0) {
          triggerJourneyRescue(`Field rescue needed after ${hitHazard.name}. Restart the journey and plan a safer route.`);
        }
      }
    }

    const attackRect = current.attackTimer > 0 ? {
      x: player.direction >= 0 ? player.x + player.width - 2 : player.x - 42,
      y: player.y + 6,
      width: 44,
      height: 30,
    } : null;

    current.enemies.forEach((enemy) => {
      if (enemy.defeated) return;
      enemy.stunTimer = Math.max(0, enemy.stunTimer - dt);
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);

      if (enemy.stunTimer <= 0) {
        enemy.x += enemy.direction * enemy.speed * dt;
        if (enemy.x <= enemy.patrolMin) {
          enemy.x = enemy.patrolMin;
          enemy.direction = 1;
        } else if (enemy.x >= enemy.patrolMax) {
          enemy.x = enemy.patrolMax;
          enemy.direction = -1;
        }
        if (enemy.flying) {
          enemy.y += Math.sin(Date.now() / 160) * 0.16;
        }
      }

      const enemyRect = { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
      if (attackRect && !current.attackHitIds.has(enemy.id) && rectsOverlap(attackRect, enemyRect)) {
        current.attackHitIds.add(enemy.id);
        enemy.health -= 1;
        enemy.stunTimer = 0.7;
        enemy.hitFlash = 0.18;
        const pushDirection = player.x + player.width / 2 < enemy.x + enemy.width / 2 ? 1 : -1;
        enemy.x = clamp(enemy.x + pushDirection * 34, enemy.patrolMin, enemy.patrolMax);
        if (enemy.health <= 0) {
          enemy.defeated = true;
          current.defeatedEnemies.add(enemy.id);
          current.relicShardCount += enemy.shards;
          current.notice = `${enemy.name} defeated. Bonus relic shards +${enemy.shards}.`;
          audioControls?.playSuccess?.();
        } else {
          current.notice = `${enemy.name} stunned. Keep moving or strike again.`;
          audioControls?.playMatch?.();
        }
      }

      if (current.enemyCooldown <= 0 && player.invulnerable <= 0 && rectsOverlap(player, enemyRect)) {
        current.resources.stamina = Math.max(0, current.resources.stamina - enemy.damage);
        const pushDirection = player.x + player.width / 2 < enemy.x + enemy.width / 2 ? -1 : 1;
        player.x = clamp(player.x + pushDirection * 84, 0, WORLD_WIDTH - player.width);
        player.vy = Math.min(player.vy, -170);
        player.invulnerable = INVULNERABLE_DURATION;
        current.enemyCooldown = 0.85;
        current.notice = `${enemy.name} bumped the team. Use J or K to stun enemies.`;
        audioControls?.playError?.();
        if (current.resources.stamina <= 0) {
          triggerJourneyRescue(`Field rescue needed after the ${enemy.name}. Restart from the journey briefing.`);
        }
      }
    });

    current.timeAccumulator += dt;
    if (current.timeAccumulator >= 1) {
      current.resources.time = Math.max(0, current.resources.time - Math.floor(current.timeAccumulator));
      current.timeAccumulator %= 1;
      if (current.resources.time <= 0) {
        triggerJourneyRescue('Field rescue needed: time ran out before reaching Base Camp. Restart the journey.');
      }
    }

    if (rectsOverlap(player, GATE)) {
      current.completed = true;
      current.notice = 'Dig site entrance reached. Report to Base Camp.';
      audioControls?.playSuccess?.();
      syncHud();
      onComplete?.([...current.fieldKit]);
    }
  }, [audioControls, availablePlatforms, briefingOpen, getGateRequirements, onComplete, respawnAtCheckpoint, syncHud, triggerJourneyRescue]);

  const step = useCallback((ms) => {
    const dt = Math.min(ms / 1000, 0.05);
    update(dt);
    draw();
    syncHud();
  }, [draw, syncHud, update]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW', 'KeyJ', 'KeyK'].includes(event.code)) {
        event.preventDefault();
      }
      if (briefingOpen) return;
      if (event.code === 'KeyJ' || event.code === 'KeyK') {
        queueAttack();
        return;
      }
      keysRef.current[event.code] = true;
    };
    const handleKeyUp = (event) => {
      keysRef.current[event.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.__advanceExpeditionJourney = (ms = 16) => step(ms);

    const frame = (timestamp) => {
      if (!lastFrameRef.current) lastFrameRef.current = timestamp;
      const elapsed = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;
      step(elapsed);
      animationRef.current = window.requestAnimationFrame(frame);
    };
    animationRef.current = window.requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.cancelAnimationFrame(animationRef.current);
      if (window.__advanceExpeditionJourney) {
        delete window.__advanceExpeditionJourney;
      }
    };
  }, [briefingOpen, queueAttack, step]);

  const collectedToolNames = hud.fieldKit
    .map((id) => JOURNEY_TOOLS.find((tool) => tool.id === id)?.name)
    .filter(Boolean);

  const upgradeNames = hud.collectedUpgrades
    .map((id) => UPGRADES.find((upgrade) => upgrade.id === id)?.shortName)
    .filter(Boolean);

  return (
    <section className="phase-container bureau-phase expedition-phase">
      <div className="expedition-shell expedition-journey-shell">
        <header className="expedition-topbar">
          <button type="button" className="bureau-hint-btn" onClick={onBackToMenu}>
            <ChevronLeft size={16} aria-hidden="true" />
            Back to Menu
          </button>
          <div className="expedition-title">
            <p className="phase-kicker">Lost Site Expedition</p>
            <h2>Journey to the Dig Site</h2>
            <p>
              Explore the route, collect relic shards and field kit, and reach Base Camp.
            </p>
          </div>
          <div className="expedition-gate-badge">
            <Flag size={16} aria-hidden="true" />
            <span>{hud.journeySection}</span>
            <small>Checkpoint: {hud.activeCheckpoint}</small>
          </div>
        </header>

        <div className="expedition-journey-grid">
          <div className="expedition-journey-canvas-card">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              aria-label="Side-scroller journey to the dig site"
            />
            <div className="expedition-journey-notice" role="status">
              {hud.notice}
            </div>
          </div>

          <aside className="expedition-panel-stack">
            <section className="expedition-panel expedition-journey-status-panel">
              <h3>
                <Map size={18} aria-hidden="true" />
                Route Status
              </h3>
              <div className="expedition-resource">
                <span>Section</span>
                <strong>{hud.journeySection}</strong>
              </div>
              <div className="expedition-resource">
                <span>Checkpoint</span>
                <strong>{hud.activeCheckpoint}</strong>
              </div>
              {hud.routeGateStatus && (
                <div className="expedition-route-gate-status">
                  <strong>{hud.routeGateStatus.name}</strong>
                  <span>{hud.routeGateStatus.summary} - {hud.routeGateStatus.distance}px ahead</span>
                  <ul>
                    {hud.routeGateStatus.requirements.map((requirement) => (
                      <li key={requirement.label} className={requirement.met ? 'is-met' : ''}>
                        {requirement.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hud.enemyWarning && (
                <p className="expedition-small-note expedition-warning-note">{hud.enemyWarning}</p>
              )}
            </section>

            <section className="expedition-panel">
              <h3>
                <Flag size={18} aria-hidden="true" />
                Bureau Mission
              </h3>
              <strong>{mission?.title || 'Evidence Hunt'}</strong>
              <p>{mission?.instruction || 'Prepare for the excavation mission.'}</p>
            </section>

            <section className="expedition-panel">
              <h3>
                <Backpack size={18} aria-hidden="true" />
                Field Kit
              </h3>
              <p>{hud.fieldKit.length}/{JOURNEY_TOOLS.length} tools collected</p>
              <ul className="expedition-tool-list">
                {JOURNEY_TOOLS.map((tool) => (
                  <li key={tool.id} className={hud.fieldKit.includes(tool.id) ? 'is-collected' : ''}>
                    <span>{tool.name}</span>
                    <strong>{hud.fieldKit.includes(tool.id) ? 'Packed' : 'Missing'}</strong>
                  </li>
                ))}
              </ul>
            </section>

            <section className="expedition-panel">
              <h3>
                <Gem size={18} aria-hidden="true" />
                Relics and Upgrades
              </h3>
              <div className="expedition-resource">
                <span>Relic Shards</span>
                <strong>{hud.relicShardCount}</strong>
              </div>
              <div className="expedition-resource">
                <span>Upgrades</span>
                <strong>{upgradeNames.length ? upgradeNames.join(', ') : 'None'}</strong>
              </div>
              <div className="expedition-resource">
                <span>Secrets</span>
                <strong>{hud.hiddenRoomsFound}/{HIDDEN_ROOMS.length}</strong>
              </div>
            </section>

            <section className="expedition-panel">
              <h3>
                <Gauge size={18} aria-hidden="true" />
                Journey Resources
              </h3>
              <div className="expedition-resource">
                <span>Stamina</span>
                <strong>{hud.resources.stamina}</strong>
              </div>
              <div className="expedition-resource">
                <span>Time</span>
                <strong>{hud.resources.time}s</strong>
              </div>
            </section>

            <section className="expedition-panel">
              <h3>
                <Swords size={18} aria-hidden="true" />
                Encounters
              </h3>
              <div className="expedition-resource">
                <span>Enemies defeated</span>
                <strong>{hud.defeatedEnemies}/{ENEMIES.length}</strong>
              </div>
              <p className="expedition-small-note">J or K swings your field tool to stun nearby enemies.</p>
            </section>

            <section className="expedition-panel">
              <h3>
                <ShieldAlert size={18} aria-hidden="true" />
                Hazards
              </h3>
              <ul className="expedition-hazard-list">
                <li>Main route is safer.</li>
                <li>Optional high routes hide shards, lore and upgrades.</li>
                <li>Checkpoints preserve collected tools, shards and upgrades.</li>
              </ul>
            </section>

            <section className="expedition-panel">
              <h3>
                <Sparkles size={18} aria-hidden="true" />
                Controls
              </h3>
              <p>A/D or Arrow keys move. W, ArrowUp or Space jumps. J or K attacks.</p>
              {collectedToolNames.length > 0 && (
                <p className="expedition-small-note">
                  Packed: {collectedToolNames.join(', ')}
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>

      {hud.failed && (
        <div className="bureau-briefing-overlay">
          <div className="bureau-briefing-modal expedition-rescue-modal">
            <div className="training-kicker">Field Rescue</div>
            <h2>Restart Needed</h2>
            <p>{hud.failureReason}</p>
            <p>
              Checkpoints reduce frustration, but stamina and time still matter.
              Use jumps, routes, and tool swings to keep the expedition moving.
            </p>
            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn" onClick={restartJourney}>
                Restart Journey
              </button>
              <button type="button" className="btn" onClick={onBackToMenu}>
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {briefingOpen && (
        <div className="bureau-briefing-overlay expedition-briefing-overlay">
          <div className="bureau-briefing-modal expedition-mission-briefing-modal">
            <div className="expedition-briefing-stamp">Top Secret</div>
            <h2>{mission?.title || 'Evidence Hunt Mission'}</h2>
            <p>
              The Bureau has assigned an inquiry before you reach the excavation site.
              Collect field tools, relic shards and upgrades, then use evidence carefully at the dig.
            </p>
            <div className="expedition-mission-card expedition-briefing-mission">
              <strong>Mission Brief</strong>
              {mission?.inquiryQuestion && (
                <p><strong>Inquiry question:</strong> {mission.inquiryQuestion}</p>
              )}
              <p><strong>Evidence type:</strong> {mission?.targetCategoryTitle || 'Mission evidence'}</p>
              <p><strong>Needed:</strong> {mission?.requiredTargetCount || 3} correct evidence items</p>
              <p>{mission?.instruction || 'Prepare for the excavation mission.'}</p>
              <p><strong>Journey controls:</strong> Move with A/D or arrows, jump with W/ArrowUp/Space, attack with J or K.</p>
            </div>
            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn expedition-begin-btn" onClick={() => setBriefingOpen(false)}>
                Begin Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

ExpeditionJourney.tools = JOURNEY_TOOLS;

export default ExpeditionJourney;
