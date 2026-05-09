import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Backpack,
  Flag,
  Gauge,
  Gem,
  Map,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GROUND_Y,
  INVULNERABLE_DURATION,
  JUMP_SPEED,
  MOVE_SPEED,
  WORLD_WIDTH,
  GRAVITY,
  ATTACK_DURATION,
  ATTACK_COOLDOWN,
  ATTACK_RECOIL_DURATION,
  ATTACK_WINDUP_DURATION,
} from './expedition-journey/journeyConstants';

import {
  CHECKPOINTS,
  HAZARDS,
  JOURNEY_TOOLS,
  OBJECTIVE_MARKERS,
  PLATFORMS,
  RELIC_SHARDS,
  ROUTE_GATES,
  SECTIONS,
  SECTION_ATMOSPHERES,
  STORY_PROPS,
  TOOL_LAYOUT,
  UPGRADES,
  GATE,
  ENVIRONMENT_EVENTS,
  SECTION_OBJECTIVES,
} from './expedition-journey/journeyLevelData';

import {
  clamp,
  getSectionForX,
  makeInitialState,
  rectsOverlap,
} from './expedition-journey/journeyUtils';

const DEFAULT_BOSS_ATTACK_PHASES = [
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

const BOSS_ATTACK_PHASES = {
  'scarab-queen': [
    { ...DEFAULT_BOSS_ATTACK_PHASES[0], id: 'queen-charge', label: 'Sand Charge', speed: 145, cooldown: 1.65 },
    { ...DEFAULT_BOSS_ATTACK_PHASES[1], id: 'scarab-burst', label: 'Scarab Burst', kind: 'area', cooldown: 2, damageScale: 0.75 },
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
};

const OBJECTIVE_MARKER_IDS_BY_SECTION = {
  'desert-entry': ['map-tablet'],
  'ruined-temple': ['switch-1', 'switch-2', 'switch-3'],
  catacombs: ['glyph-1', 'glyph-2', 'glyph-3'],
  'escape-sequence': ['escape-beacon'],
};

const OBJECTIVE_LABELS = {
  'desert-entry': 'Map Tablet',
  'ruined-temple': 'Switches',
  catacombs: 'Glyph Fragments',
  'escape-sequence': 'Escape Route',
  'dig-site-entrance': 'Guardian Seal',
};

const OBJECTIVE_SINGULAR_LABELS = {
  'desert-entry': 'map tablet',
  'ruined-temple': 'switch',
  catacombs: 'glyph fragment',
  'escape-sequence': 'escape marker',
  'dig-site-entrance': 'guardian seal',
};

const GATE_HINTS = {
  objective: {
    'desert-entry': 'The map tablet is still behind you in the desert route.',
    'ruined-temple': 'One switch is still behind you in the Ruined Temple.',
    catacombs: 'Search the catacomb floor for the remaining glyph fragment.',
    'escape-sequence': 'Reach the escape marker before the route seal will open.',
    'dig-site-entrance': 'The final guardian seal opens after the Ancient Construct falls.',
  },
  shards: 'Search the nearby platforms and lower route for more relic shards.',
  upgrade: 'Look back through this section for the missing upgrade route.',
};

const HAZARD_VISUALS = {
  'thorn-bush': {
    icon: '!',
    label: 'Thorns',
    color: '#b91c1c',
    fill: 'rgba(127, 29, 29, 0.28)',
    accent: '#22c55e',
    message: 'Thorn bush scratched your legs.',
  },
  'sand-pit': {
    icon: '!',
    label: 'Soft Sand',
    color: '#92400e',
    fill: 'rgba(180, 83, 9, 0.26)',
    accent: '#facc15',
    message: 'Soft sand slowed you down.',
  },
  'spike-trap': {
    icon: '!',
    label: 'Trap',
    color: '#991b1b',
    fill: 'rgba(153, 27, 27, 0.24)',
    accent: '#f97316',
    message: 'Temple trap triggered.',
  },
  'rolling-stones': {
    icon: '!',
    label: 'Rolling Stones',
    color: '#7c2d12',
    fill: 'rgba(120, 53, 15, 0.24)',
    accent: '#fb923c',
    message: 'Rolling stones cost stamina.',
  },
  'dark-gap': {
    icon: '!',
    label: 'Dark Gap',
    color: '#111827',
    fill: 'rgba(15, 23, 42, 0.76)',
    accent: '#38bdf8',
    message: 'You stumbled in a dark gap.',
  },
  'bat-cloud': {
    icon: '!',
    label: 'Bat Cloud',
    color: '#581c87',
    fill: 'rgba(88, 28, 135, 0.28)',
    accent: '#c084fc',
    message: 'Bat cloud scattered the team.',
  },
  'falling-blocks': {
    icon: '!',
    label: 'Falling Blocks',
    color: '#7f1d1d',
    fill: 'rgba(127, 29, 29, 0.24)',
    accent: '#facc15',
    message: 'Falling rocks cost stamina.',
  },
  'dust-wave': {
    icon: '!',
    label: 'Dust Wave',
    color: '#92400e',
    fill: 'rgba(146, 64, 14, 0.22)',
    accent: '#fed7aa',
    message: 'Dust reduced visibility.',
  },
  'loose-slope': {
    icon: '!',
    label: 'Loose Slope',
    color: '#7c2d12',
    fill: 'rgba(120, 53, 15, 0.24)',
    accent: '#f59e0b',
    message: 'Loose stones made the climb harder.',
  },
};

const getDirectionFromPlayer = (playerX, targetX) => {
  if (targetX == null) return 'nearby';
  if (targetX < playerX - 35) return 'left';
  if (targetX > playerX + 35) return 'right';
  return 'nearby';
};

const getDirectionText = (direction) => (
  direction === 'left' ? 'behind you' : direction === 'right' ? 'ahead' : 'nearby'
);

const formatMissingSummary = (missing) => {
  if (missing.length === 0) return 'all route tasks are ready';
  if (missing.length === 1) return missing[0].shortMissing;
  if (missing.length === 2) return `${missing[0].shortMissing} and ${missing[1].shortMissing}`;
  return `${missing.slice(0, -1).map(item => item.shortMissing).join(', ')} and ${missing[missing.length - 1].shortMissing}`;
};

export default function ExpeditionJourney({ mission, onComplete, onSnapshotChange, audioControls }) {
  const [gameState, setGameState] = useState(makeInitialState());
  const [briefingOpen, setBriefingOpen] = useState(true);
  const canvasRef = useRef(null);
  const stateRef = useRef(gameState);
  const keysRef = useRef({});
  const lastFrameRef = useRef(0);
  const animationRef = useRef(null);

  // Sync ref for the physics loop
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  const syncHud = useCallback(() => {
    setGameState({ ...stateRef.current });
  }, []);

  const triggerJourneyRescue = useCallback((reason) => {
    const current = stateRef.current;
    current.failed = true;
    current.failureReason = reason;
    current.notice = reason;
    audioControls?.playError?.();
    syncHud();
  }, [audioControls, syncHud]);

  const respawnAtCheckpoint = useCallback(() => {
    const current = stateRef.current;
    const cp = current.activeCheckpoint;
    current.player.x = cp.x;
    current.player.y = cp.y - current.player.height;
    current.player.vx = 0;
    current.player.vy = 0;
    current.resources.stamina = Math.max(current.resources.stamina, 40);
    current.failed = false;
    current.notice = `Returned to ${cp.name}. Expedition continues.`;
    syncHud();
  }, [syncHud]);

  const getObjectiveProgress = useCallback((sectionId, current) => {
    const config = SECTION_OBJECTIVES[sectionId];
    if (!config) return null;

    let count = 0;
    if (sectionId === 'desert-entry') {
      count = current.collectedObjectiveIds.has('map-tablet') ? 1 : 0;
    } else if (sectionId === 'ruined-temple') {
      count = ['switch-1', 'switch-2', 'switch-3'].filter(id => current.collectedObjectiveIds.has(id)).length;
    } else if (sectionId === 'catacombs') {
      count = ['glyph-1', 'glyph-2', 'glyph-3'].filter(id => current.collectedObjectiveIds.has(id)).length;
    } else if (sectionId === 'escape-sequence') {
      count = current.collectedObjectiveIds.has('escape-beacon') ? 1 : 0;
    } else if (sectionId === 'dig-site-entrance') {
      count = current.defeatedMiniBosses.has('ancient-construct') ? 1 : 0;
    }

    return { ...config, count };
  }, []);

  const getNearestUnmetObjective = useCallback((sectionId, current) => {
    const markerIds = OBJECTIVE_MARKER_IDS_BY_SECTION[sectionId] || [];
    const marker = OBJECTIVE_MARKERS.find(item => (
      markerIds.includes(item.id) && !current.collectedObjectiveIds.has(item.id)
    ));
    return marker ? {
      type: 'objective',
      id: marker.id,
      label: marker.label,
      x: marker.x,
      direction: getDirectionFromPlayer(current.player.x, marker.x),
    } : null;
  }, []);

  const getGateRequirements = useCallback((gate, current) => {
    const reqs = [];
    const sectionId = gate.requires.objective;
    if (sectionId) {
      const objective = getObjectiveProgress(sectionId, current);
      const nearest = getNearestUnmetObjective(sectionId, current);
      const missingCount = objective ? Math.max(0, objective.total - objective.count) : 1;
      reqs.push({
        type: 'objective',
        id: sectionId,
        label: `${OBJECTIVE_LABELS[sectionId] || 'Objective'}: ${objective?.count ?? 0}/${objective?.total ?? 1}`,
        checklistLabel: OBJECTIVE_LABELS[sectionId] || 'Objective',
        shortMissing: missingCount === 1
          ? `complete 1 more ${OBJECTIVE_SINGULAR_LABELS[sectionId] || 'objective'}`
          : `complete ${missingCount} more ${objective?.itemLabel || 'objectives'}`,
        met: current.completedObjectiveIds.has(sectionId) || Boolean(objective && objective.count >= objective.total),
        found: objective?.count ?? 0,
        required: objective?.total ?? 1,
        hint: GATE_HINTS.objective[sectionId] || 'Search this section for the missing objective marker.',
        targetX: nearest?.x ?? gate.x - 220,
        nearestObjective: nearest,
      });
    }
    if (gate.requires.miniBoss) {
      const boss = current.miniBosses.find(item => item.id === gate.requires.miniBoss);
      const bossName = boss?.name || gate.requires.miniBoss;
      const direction = getDirectionFromPlayer(current.player.x, boss?.x);
      reqs.push({
        type: 'miniBoss',
        id: gate.requires.miniBoss,
        label: `${bossName}: ${current.defeatedMiniBosses.has(gate.requires.miniBoss) ? 'defeated' : 'active'}`,
        checklistLabel: `${bossName} defeated`,
        shortMissing: `defeat ${bossName}`,
        met: current.defeatedMiniBosses.has(gate.requires.miniBoss),
        found: current.defeatedMiniBosses.has(gate.requires.miniBoss) ? 1 : 0,
        required: 1,
        hint: `${bossName} is still active ${getDirectionText(direction)}. Watch the warning tell, dodge, then counter.`,
        targetX: boss?.x,
        nearestObjective: boss ? {
          type: 'miniBoss',
          id: boss.id,
          label: boss.name,
          x: boss.x,
          direction,
        } : null,
      });
    }
    if (gate.requires.shards) {
      const missing = Math.max(0, gate.requires.shards - current.relicShardCount);
      const shard = RELIC_SHARDS.find(item => !current.collectedShardIds.has(item.id) && item.x < gate.x);
      const direction = getDirectionFromPlayer(current.player.x, shard?.x);
      reqs.push({
        type: 'shards',
        id: 'relic-shards',
        label: `Relic Shards: ${current.relicShardCount}/${gate.requires.shards}`,
        checklistLabel: 'Relic Shards',
        shortMissing: `collect ${missing} more relic shard${missing === 1 ? '' : 's'}`,
        met: current.relicShardCount >= gate.requires.shards,
        found: current.relicShardCount,
        required: gate.requires.shards,
        hint: `${GATE_HINTS.shards} Look ${getDirectionText(direction)} for the closest shard.`,
        targetX: shard?.x,
        nearestObjective: shard ? {
          type: 'shards',
          id: shard.id,
          label: 'Relic Shard',
          x: shard.x,
          direction,
        } : null,
      });
    }
    if (gate.requires.upgrades) {
      gate.requires.upgrades.forEach(uId => {
        const upgrade = UPGRADES.find(item => item.id === uId);
        const direction = getDirectionFromPlayer(current.player.x, upgrade?.x);
        reqs.push({
          type: 'upgrade',
          id: uId,
          label: `${upgrade?.name || 'Upgrade'}: ${current.collectedUpgrades.has(uId) ? 'packed' : 'missing'}`,
          checklistLabel: upgrade?.name || 'Upgrade',
          shortMissing: `find ${upgrade?.name || 'the missing upgrade'}`,
          met: current.collectedUpgrades.has(uId),
          found: current.collectedUpgrades.has(uId) ? 1 : 0,
          required: 1,
          hint: `${GATE_HINTS.upgrade} ${upgrade?.name || 'The upgrade'} is ${getDirectionText(direction)}.`,
          targetX: upgrade?.x,
          nearestObjective: upgrade ? {
            type: 'upgrade',
            id: upgrade.id,
            label: upgrade.name,
            x: upgrade.x,
            direction,
          } : null,
        });
      });
    }
    return reqs;
  }, [getNearestUnmetObjective, getObjectiveProgress]);

  const getGateGuidance = useCallback((gate, current) => {
    if (!gate) return null;
    const requirements = getGateRequirements(gate, current);
    const missingRequirements = requirements.filter(req => !req.met);
    const nearestMissingObjective = missingRequirements
      .map(req => req.nearestObjective)
      .filter(Boolean)
      .sort((a, b) => Math.abs(a.x - current.player.x) - Math.abs(b.x - current.player.x))[0] || null;
    const missingObjectiveDirection = nearestMissingObjective?.direction || null;
    const hint = missingRequirements[0]?.hint || `${gate.name} is ready. Move through the open seal.`;
    return {
      activeGateName: gate.name,
      activeGateLocked: missingRequirements.length > 0,
      gateRequirements: requirements,
      gateMissingRequirements: missingRequirements,
      gateHint: hint,
      nearestMissingObjective,
      missingObjectiveDirection,
      gateChecklistText: requirements.map(req => `${req.met ? '✓' : '○'} ${req.label}`).join(' | '),
      missingSummary: formatMissingSummary(missingRequirements),
      notice: missingRequirements.length > 0
        ? `${gate.name} locked: ${formatMissingSummary(missingRequirements)}. ${hint}`
        : `${gate.name} ready: all route tasks complete.`,
    };
  }, [getGateRequirements]);

  const getAttackBox = useCallback((attacker, range = 42, height = 28, direction = attacker.direction || 1) => ({
    x: direction >= 0 ? attacker.x + attacker.width : attacker.x - range,
    y: attacker.y + Math.max(4, (attacker.height - height) / 2),
    width: range,
    height,
  }), []);

  const addCombatEffect = useCallback((current, effect) => {
    current.combatHitEffects.push({
      timer: 0.35,
      maxTimer: 0.35,
      ...effect,
    });
    if (current.combatHitEffects.length > 12) current.combatHitEffects.shift();
  }, []);

  const getCombatMode = useCallback((entity) => {
    if (entity.defeated) return 'defeated';
    if (entity.stunTimer > 0) return 'stunned';
    if (entity.attackWindup > 0) return 'windup';
    if (entity.attackTimer > 0) return 'attacking';
    if (entity.attackRecovery > 0 || entity.attackCooldown > 0) return 'cooldown';
    return Math.abs(entity.speed || 0) > 0 ? 'patrol' : 'idle';
  }, []);

  const getPlayerAttackState = useCallback((current) => {
    if (current.attackWindupTimer > 0) return 'windup';
    if (current.attackTimer > 0) return 'swing';
    if (current.attackRecoilTimer > 0) return 'recoil';
    if (current.attackCooldown > 0) return 'cooldown';
    return 'ready';
  }, []);

  const getActiveHazardsNearPlayer = useCallback((current) => HAZARDS
    .filter(hazard => Math.abs((hazard.x + hazard.width / 2) - (current.player.x + current.player.width / 2)) < 150)
    .map(hazard => ({
      id: hazard.id,
      name: hazard.name,
      distance: Math.round((hazard.x + hazard.width / 2) - (current.player.x + current.player.width / 2)),
      penalty: hazard.penalty,
    })), []);

  const getStaminaWarningState = useCallback((current) => {
    if (current.resources.stamina <= 0) return 'empty';
    if (current.resources.stamina < 30) return 'low';
    if (current.staminaFeedbackTimer > 0) return 'recent-loss';
    return 'stable';
  }, []);

  const getBossPhaseConfig = useCallback((boss) => {
    const phases = BOSS_ATTACK_PHASES[boss.id] || DEFAULT_BOSS_ATTACK_PHASES;
    return phases.find(phase => phase.id === boss.attackPattern) || phases[boss.attackCycleIndex % phases.length] || phases[0];
  }, []);

  const getBossVulnerabilityState = useCallback((boss) => {
    const phase = getBossPhaseConfig(boss);
    const shielded = boss.shieldTimer > 0 || (boss.attackWindup > 0 && phase?.shieldDuringWindup);
    const vulnerable = !shielded && (boss.vulnerabilityTimer > 0 || boss.attackRecovery > 0 || boss.stunTimer > 0);
    return {
      phaseId: boss.attackPattern || phase?.id || 'heavy',
      phaseLabel: boss.attackPhaseLabel || phase?.label || 'Heavy attack',
      attackKind: boss.attackKind || phase?.kind || 'close',
      shielded,
      vulnerable,
      vulnerabilityTimer: Number((boss.vulnerabilityTimer || 0).toFixed(2)),
      shieldTimer: Number((boss.shieldTimer || 0).toFixed(2)),
      patternHistory: boss.patternHistory || [],
    };
  }, [getBossPhaseConfig]);

  const getEntityCombatState = useCallback((entity) => ({
    state: getCombatMode(entity),
    idle: getCombatMode(entity) === 'idle',
    patrol: getCombatMode(entity) === 'patrol',
    attacking: entity.attackTimer > 0,
    windup: entity.attackWindup > 0,
    cooldown: entity.attackRecovery > 0 || entity.attackCooldown > 0,
    stunned: entity.stunTimer > 0,
    defeated: Boolean(entity.defeated),
    recovery: Number((entity.attackRecovery || 0).toFixed(2)),
    pattern: entity.attackPattern || null,
  }), [getCombatMode]);

  const createJourneySnapshot = useCallback((current = stateRef.current) => {
    const section = getSectionForX(current.player.x);
    const objective = getObjectiveProgress(section.id, current);
    const activeMiniBoss = current.miniBosses.find(boss => boss.awakened && !boss.defeated && Math.abs(boss.x - current.player.x) < 520);
    const playerAttackBox = current.playerAttackBox
      ? {
        x: Math.round(current.playerAttackBox.x),
        y: Math.round(current.playerAttackBox.y),
        width: current.playerAttackBox.width,
        height: current.playerAttackBox.height,
      }
      : null;

    return {
      stage: 'journey',
      coordinateSystem: 'origin top-left, x right, y down',
      player: {
        x: Math.round(current.player.x),
        y: Math.round(current.player.y),
        vx: Math.round(current.player.vx),
        vy: Math.round(current.player.vy),
        onGround: current.player.onGround,
      },
      playerFacing: current.player.direction >= 0 ? 'right' : 'left',
      playerAttackBox,
      playerInvulnerable: Number(current.player.invulnerable.toFixed(2)),
      playerAttackState: getPlayerAttackState(current),
      journeySection: section.name,
      worldProgressPercent: Math.round((current.player.x / WORLD_WIDTH) * 100),
      resources: current.resources,
      playerStamina: current.resources.stamina,
      activeHazardsNearPlayer: getActiveHazardsNearPlayer(current),
      lastHazardHit: current.lastHazardHit,
      lastStaminaDelta: current.lastStaminaDelta,
      lastStaminaLossReason: current.lastStaminaLossReason,
      staminaFeedbackActive: current.staminaFeedbackTimer > 0,
      staminaWarningState: getStaminaWarningState(current),
      hazardFeedbackCooldown: Number(current.hazardCooldown.toFixed(2)),
      fieldKit: current.fieldKit.map(tool => tool.name),
      remainingTools: JOURNEY_TOOLS.filter(tool => !current.collectedToolIds.has(tool.id)).map(tool => tool.name),
      relicShardCount: current.relicShardCount,
      totalRelicShards: RELIC_SHARDS.length,
      collectedUpgrades: Array.from(current.collectedUpgrades),
      activeCheckpoint: current.activeCheckpoint?.name,
      checkpointState: current.activeCheckpoint ? { id: current.activeCheckpoint.id, name: current.activeCheckpoint.name } : null,
      currentObjective: objective?.title || null,
      objectiveProgress: objective ? {
        id: section.id,
        title: objective.title,
        found: objective.count,
        required: objective.total,
        complete: objective.count >= objective.total,
        label: `${objective.count}/${objective.total} ${objective.itemLabel}`,
      } : null,
      miniBossState: current.miniBosses.map(boss => ({
        id: boss.id,
        name: boss.name,
        sectionId: boss.sectionId,
        health: boss.health,
        maxHealth: boss.maxHealth,
        awakened: boss.awakened,
        x: Math.round(boss.x),
        ...getEntityCombatState(boss),
      })),
      activeMiniBoss: activeMiniBoss?.name || null,
      activeMiniBossState: activeMiniBoss ? {
        id: activeMiniBoss.id,
        name: activeMiniBoss.name,
        health: activeMiniBoss.health,
        maxHealth: activeMiniBoss.maxHealth,
        x: Math.round(activeMiniBoss.x),
        ...getEntityCombatState(activeMiniBoss),
        ...getBossVulnerabilityState(activeMiniBoss),
      } : null,
      defeatedEnemies: Array.from(current.defeatedEnemies),
      defeatedMiniBosses: Array.from(current.defeatedMiniBosses),
      hiddenRoomsFound: Array.from(current.hiddenRoomsFound),
      loreTabletCount: current.collectedTabletIds.size,
      playerCombatState: {
        attacking: current.attackTimer > 0,
        attackCooldown: Number(current.attackCooldown.toFixed(2)),
        attackTimer: Number(current.attackTimer.toFixed(2)),
        attackWindup: Number(current.attackWindupTimer.toFixed(2)),
        attackRecoil: Number(current.attackRecoilTimer.toFixed(2)),
        attackState: getPlayerAttackState(current),
        hitStop: Number(current.hitStopTimer.toFixed(2)),
        facing: current.player.direction >= 0 ? 'right' : 'left',
        invulnerable: Number(current.player.invulnerable.toFixed(2)),
        lastDamage: current.player.lastDamage || 0,
      },
      combatHitEffects: current.combatHitEffects.map(effect => ({
        type: effect.type,
        x: Math.round(effect.x),
        y: Math.round(effect.y),
        timer: Number(effect.timer.toFixed(2)),
        text: effect.text || null,
      })),
      knockbackState: {
        playerKnockback: current.player.knockbackTimer > 0,
        playerDirection: current.player.knockbackDirection,
        enemies: current.enemies
          .filter(enemy => enemy.knockbackTimer > 0)
          .map(enemy => ({ id: enemy.id, direction: enemy.knockbackDirection, timer: Number(enemy.knockbackTimer.toFixed(2)) })),
        bosses: current.miniBosses
          .filter(boss => boss.knockbackTimer > 0)
          .map(boss => ({ id: boss.id, direction: boss.knockbackDirection, timer: Number(boss.knockbackTimer.toFixed(2)) })),
      },
      enemyStates: current.enemies
        .filter(enemy => Math.abs(enemy.x - current.player.x) < 700 || current.defeatedEnemies.has(enemy.id))
        .map(enemy => ({
          id: enemy.id,
          name: enemy.name,
          type: enemy.type,
          health: enemy.health,
          maxHealth: enemy.maxHealth,
          x: Math.round(enemy.x),
          ...getEntityCombatState(enemy),
        })),
      miniBossStates: current.miniBosses.map(boss => ({
        id: boss.id,
        name: boss.name,
        sectionId: boss.sectionId,
        health: boss.health,
        maxHealth: boss.maxHealth,
        awakened: boss.awakened,
        x: Math.round(boss.x),
        ...getEntityCombatState(boss),
      })),
      routeGateStatus: ROUTE_GATES.find(gate => !current.openedRouteGateIds.has(gate.id)) ? (() => {
        const gate = ROUTE_GATES.find(item => !current.openedRouteGateIds.has(item.id));
        const guidance = getGateGuidance(gate, current);
        const requirements = guidance.gateRequirements;
        return {
          id: gate.id,
          name: gate.name,
          distance: Math.round(gate.x - current.player.x),
          requirements,
          complete: requirements.every(req => req.met),
          summary: `${requirements.filter(req => req.met).length}/${requirements.length} ready`,
          activeGateName: guidance.activeGateName,
          activeGateLocked: guidance.activeGateLocked,
          gateRequirements: guidance.gateRequirements,
          gateMissingRequirements: guidance.gateMissingRequirements,
          gateHint: guidance.gateHint,
          nearestMissingObjective: guidance.nearestMissingObjective,
          missingObjectiveDirection: guidance.missingObjectiveDirection,
          gateChecklistText: guidance.gateChecklistText,
        };
      })() : null,
      cinematicEventState: current.cinematicEvent,
      cinematicState: current.cinematicEvent,
      bossIntroState: current.bossIntro,
      environmentEventState: current.environmentEvent,
      sectionTransitionState: current.sectionTransition,
      activeParticles: SECTION_ATMOSPHERES[section.id]?.particle || null,
      activeAtmosphere: {
        sectionId: section.id,
        sectionName: section.name,
        particle: SECTION_ATMOSPHERES[section.id]?.particle || null,
        mood: SECTION_ATMOSPHERES[section.id]?.mood || null,
        title: SECTION_ATMOSPHERES[section.id]?.title || null,
      },
      hazards: HAZARDS.map(hazard => hazard.name),
      endGateReached: current.completed,
      briefingOpen,
      failed: current.failed,
      failureReason: current.failureReason,
      notice: current.notice,
    };
  }, [briefingOpen, getActiveHazardsNearPlayer, getBossVulnerabilityState, getEntityCombatState, getGateGuidance, getObjectiveProgress, getPlayerAttackState, getStaminaWarningState]);

  // --- Rendering Helpers ---
  const drawFieldNoteLabel = useCallback((ctx, x, y, text, color) => {
    ctx.save();
    ctx.font = '800 9px Outfit, sans-serif';
    const metrics = ctx.measureText(text.toUpperCase());
    const padding = 5;
    
    ctx.fillStyle = 'rgba(255, 252, 235, 0.86)';
    ctx.fillRect(x - metrics.width / 2 - padding, y - 9, metrics.width + padding * 2, 14);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - metrics.width / 2 - padding, y - 9, metrics.width + padding * 2, 14);
    
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text.toUpperCase(), x, y + 1);
    ctx.restore();
  }, []);

  const drawPlayerCharacter = useCallback((ctx, x, y, w, h, direction, invuln, now) => {
    ctx.save();
    if (invuln > 0 && Math.floor(now / 100) % 2 === 0) ctx.globalAlpha = 0.3;
    
    const bob = Math.sin(now / 150) * 2;
    const legSwing = Math.sin(now / 100) * 8;
    const attackState = getPlayerAttackState(stateRef.current);
    const attacking = attackState === 'swing';
    const attackLean = attackState === 'windup'
      ? -direction * 3
      : attackState === 'swing'
        ? direction * 7
        : attackState === 'recoil'
          ? -direction * 4
          : 0;

    // Readability shadow and outline
    ctx.fillStyle = 'rgba(0,0,0,0.36)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h + 2, w * 0.9, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fff7d6';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.roundRect(x + 3 + attackLean, y + 5 + bob, 24, 28, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + w / 2 + attackLean, y + 4 + bob, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Body
    ctx.fillStyle = '#1f4f5f';
    ctx.beginPath();
    ctx.roundRect(x + 2 + attackLean, y + 8 + bob, 26, 25, 7);
    ctx.fill();
    ctx.strokeStyle = '#05111f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f2c36b';
    ctx.beginPath();
    ctx.arc(x + w / 2 + attackLean, y + 18 + bob, 5, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#d69a5f';
    ctx.beginPath();
    ctx.arc(x + w / 2 + attackLean, y + 1 + bob, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a2416';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Satchel Strap
    ctx.strokeStyle = '#3a2416';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + attackLean + (direction > 0 ? 8 : 22), y + 11 + bob);
    ctx.lineTo(x + attackLean + (direction > 0 ? 22 : 8), y + 29 + bob);
    ctx.stroke();

    // Hat
    ctx.fillStyle = '#4b2f1c';
    ctx.strokeStyle = '#fff7d6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + attackLean + (direction > 0 ? -6 : 0), y - 5 + bob, 36, 5, 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(x + attackLean + (direction > 0 ? 4 : 8), y - 13 + bob, 20, 10, 3);
    ctx.fill();
    ctx.stroke();

    // Backpack and satchel
    ctx.fillStyle = '#7c3f18';
    ctx.beginPath();
    ctx.roundRect(x + attackLean + (direction > 0 ? -2 : 21), y + 13 + bob, 9, 16, 3);
    ctx.fill();
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(x + attackLean + (direction > 0 ? 20 : 0), y + 18 + bob, 10, 8, 2);
    ctx.fill();

    // Field tool in hand
    const handX = x + attackLean + (direction > 0 ? 27 : 3);
    const reach = attackState === 'windup' ? 8 : attacking ? 28 : attackState === 'recoil' ? 10 : 12;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = attacking ? 5 : 3;
    ctx.beginPath();
    ctx.moveTo(handX, y + 17 + bob);
    ctx.lineTo(handX + direction * reach, y + (attacking ? 6 : attackState === 'windup' ? 20 : 12) + bob);
    ctx.stroke();
    ctx.fillStyle = '#fff7ad';
    ctx.beginPath();
    ctx.arc(handX + direction * (reach + 2), y + (attacking ? 6 : 11) + bob, attacking ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();

    // Legs and boots
    const moving = Math.abs(stateRef.current.player.vx) > 0.1;
    const leftLegX = x + 7 + (moving ? (direction > 0 ? legSwing : -legSwing) * 0.25 : 0);
    const rightLegX = x + 17 + (moving ? (direction > 0 ? -legSwing : legSwing) * 0.25 : 0);
    ctx.fillStyle = '#10233b';
    ctx.fillRect(leftLegX, y + 31, 6, 12);
    ctx.fillRect(rightLegX, y + 31, 6, 12);
    ctx.fillStyle = '#241407';
    ctx.fillRect(leftLegX - 1, y + 41, 9, 4);
    ctx.fillRect(rightLegX - 1, y + 41, 9, 4);

    // Interaction Prompt
    if (stateRef.current.notice && stateRef.current.notice.includes('near')) {
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('!', x + w/2, y - 15 + bob);
    }
    
    ctx.restore();
  }, [getPlayerAttackState]);

  const drawPlatform = useCallback((ctx, platform, cameraX, current) => {
    const x = platform.x - cameraX;
    if (x + platform.width < -50 || x > CANVAS_WIDTH + 50) return;

    if (platform.secret && !current.collectedUpgrades.has('ancient-compass')) {
      ctx.globalAlpha = 0.15;
    }

    const isGround = platform.y === GROUND_Y;
    
    // Platform Base
    ctx.fillStyle = platform.secret ? '#5c4d3c' : isGround ? '#8b6a47' : '#4a3720';
    ctx.fillRect(x, platform.y, platform.width, platform.height);
    
    // Depth Side
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x, platform.y + platform.height - 4, platform.width, 4);

    // Top Surface
    ctx.fillStyle = isGround ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(x, platform.y, platform.width, 6);
    
    // Texture / Cracks
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 40; i < platform.width; i += 80) {
      ctx.beginPath();
      ctx.moveTo(x + i, platform.y + 6);
      ctx.lineTo(x + i + 5, platform.y + platform.height - 4);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = 'rgba(37, 25, 14, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, platform.y, platform.width, platform.height);
    ctx.globalAlpha = 1;
  }, []);

  const drawStoryProp = useCallback((ctx, prop, cameraX, now) => {
    const x = prop.x - cameraX;
    if (x + 200 < 0 || x - 200 > CANVAS_WIDTH) return;

    ctx.save();
    if (prop.type === 'ruins') {
      ctx.fillStyle = 'rgba(92, 64, 51, 0.32)';
      ctx.fillRect(x - 52, prop.y + 18, 104, 48);
      ctx.fillStyle = 'rgba(48, 31, 21, 0.28)';
      [-34, -12, 12, 34].forEach(offset => ctx.fillRect(x + offset, prop.y - 16, 14, 82));
      ctx.strokeStyle = 'rgba(255, 244, 212, 0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 60, prop.y - 18);
      ctx.lineTo(x, prop.y - 48);
      ctx.lineTo(x + 60, prop.y - 18);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (prop.type === 'door') {
      ctx.fillStyle = 'rgba(42, 28, 20, 0.62)';
      ctx.fillRect(x - 62, prop.y, 124, 158);
      ctx.fillStyle = 'rgba(140, 98, 54, 0.68)';
      ctx.fillRect(x - 76, prop.y - 18, 152, 24);
      [-54, 54].forEach(offset => {
        ctx.fillStyle = 'rgba(92, 64, 51, 0.8)';
        ctx.fillRect(x + offset - 14, prop.y, 28, 160);
        ctx.strokeStyle = 'rgba(255, 236, 180, 0.22)';
        ctx.strokeRect(x + offset - 10, prop.y + 12, 20, 42);
        ctx.strokeRect(x + offset - 10, prop.y + 66, 20, 42);
      });
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.28)';
      ctx.lineWidth = 4;
      ctx.strokeRect(x - 36, prop.y + 24, 72, 112);
      ctx.restore();
      return;
    }
    if (prop.type === 'statue') {
      ctx.fillStyle = 'rgba(71, 85, 105, 0.62)';
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(x - 24, prop.y - 28, 48, 32, 8);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(x - 34, prop.y + 2, 68, 70, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(20, 184, 166, 0.55)';
      ctx.fillRect(x - 8, prop.y + 24, 16, 16);
      ctx.fillStyle = 'rgba(71, 85, 105, 0.62)';
      ctx.fillRect(x - 48, prop.y + 68, 96, 14);
      ctx.restore();
      return;
    }
    if (prop.type === 'mural') {
      ctx.fillStyle = 'rgba(49, 32, 21, 0.55)';
      ctx.fillRect(x - 88, prop.y - 26, 176, 92);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.34)';
      ctx.lineWidth = 2;
      for (let i = -64; i <= 64; i += 32) {
        ctx.strokeRect(x + i - 10, prop.y - 4, 20, 28);
        ctx.beginPath();
        ctx.moveTo(x + i - 14, prop.y + 42);
        ctx.lineTo(x + i + 14, prop.y + 32);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.22)';
      ctx.strokeRect(x - 78, prop.y - 18, 156, 76);
      ctx.restore();
      return;
    }
    if (prop.type === 'camp') {
      ctx.fillStyle = 'rgba(120, 53, 15, 0.45)';
      ctx.fillRect(x - 38, prop.y + 18, 76, 18);
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.55)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 46, prop.y + 18);
      ctx.lineTo(x - 18, prop.y - 18);
      ctx.lineTo(x + 12, prop.y + 18);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (prop.type === 'glyphs') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.52)';
      ctx.fillRect(x - 82, prop.y - 30, 164, 90);
      ctx.strokeStyle = `rgba(125, 211, 252, ${0.38 + Math.sin(now / 350) * 0.12})`;
      ctx.lineWidth = 2;
      for (let i = -54; i <= 54; i += 36) {
        ctx.beginPath();
        ctx.arc(x + i, prop.y + 6, 12, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.strokeRect(x + i - 8, prop.y + 30, 16, 16);
      }
      ctx.restore();
      return;
    }
    if (prop.type === 'eyes') {
      ctx.fillStyle = `rgba(125, 211, 252, ${0.28 + Math.sin(now / 280) * 0.12})`;
      [-16, 16].forEach(offset => {
        ctx.beginPath();
        ctx.ellipse(x + offset, prop.y, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      return;
    }
    if (prop.type === 'bridge') {
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.62)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x - 90, prop.y + 34);
      ctx.lineTo(x + 90, prop.y + 22);
      ctx.stroke();
      ctx.lineWidth = 3;
      for (let i = -70; i <= 70; i += 28) {
        ctx.beginPath();
        ctx.moveTo(x + i, prop.y + 16);
        ctx.lineTo(x + i + 10, prop.y + 44);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    if (prop.type === 'sign') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x - 3, prop.y - 20, 6, 56);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(x - 22, prop.y - 18);
      ctx.lineTo(x + 22, prop.y - 18);
      ctx.lineTo(x, prop.y + 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(x - 3, prop.y - 8, 6, 14);
      ctx.restore();
      return;
    }
    if (prop.type === 'banners') {
      [-24, 24].forEach(offset => {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x + offset, prop.y - 38, 4, 96);
        ctx.fillStyle = offset < 0 ? '#0f766e' : '#b45309';
        ctx.fillRect(x + offset + 4, prop.y - 34, 26, 44);
      });
      ctx.restore();
      return;
    }
    if (prop.type === 'ruins' || prop.type === 'statue') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.font = 'bold 80px serif';
      ctx.fillText(prop.type === 'ruins' ? '🏛️' : '🗿', x, prop.y + 40);
    } else if (prop.type === 'lights') {
      const pulse = Math.sin(now / 400) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(254, 240, 138, ${0.4 * pulse})`;
      ctx.beginPath();
      ctx.arc(x, prop.y + 20, 120, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }, []);

  const drawParticles = useCallback((ctx, atmosphere, cameraX, now) => {
    ctx.save();
    ctx.fillStyle = atmosphere.particleColor;
    const count = atmosphere.particle === 'dust and debris' ? 45 : 34;
    for (let i = 0; i < count; i += 1) {
      const speedMult = atmosphere.particle === 'dust and debris' ? 2.5 : 1;
      const drift = (now / (35 / speedMult)) % 2000;
      const x = ((i * 137 + drift + cameraX * 0.1) % (CANVAS_WIDTH + 100)) - 50;
      const yBase = atmosphere.particle === 'glyph motes' ? 120 : atmosphere.particle === 'fireflies' ? 150 : 60;
      const yRange = atmosphere.particle === 'dust and debris' ? 300 : 200;
      const y = yBase + ((i * 71 + Math.sin(now / 500 + i) * 30) % yRange);
      
      if (atmosphere.particle === 'glyph motes') {
        ctx.globalAlpha = 0.35;
        ctx.font = 'bold 10px serif';
        ctx.fillText(['𓋹', '𓊽', '𓃻', '𓇳'][i % 4], x, y);
      } else {
        const size = atmosphere.particle === 'dust and debris' ? 2 + (i % 4) : 1.5 + (i % 2);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }, []);

  const drawCollectible = useCallback((ctx, x, y, cameraX, now, label, color, hidden = false, isShard = false) => {
    const screenX = x - cameraX;
    const floatY = Math.sin((now / 220) + x) * 8;
    ctx.save();
    ctx.globalAlpha = hidden ? 0.25 : 1;
    
    // Core glow (Dynamic)
    const pulse = Math.sin(now / 300) * 0.3 + 0.7;
    const innerGlow = ctx.createRadialGradient(screenX, y + floatY, 0, screenX, y + floatY, 25 * pulse);
    innerGlow.addColorStop(0, `${color}88`);
    innerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(screenX, y + floatY, 25 * pulse, 0, Math.PI * 2);
    ctx.fill();

    if (isShard) {
      // Amber archaeology shard with carved glyph lines.
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12 * pulse;
      
      const shardColor = ctx.createLinearGradient(screenX - 12, y + floatY - 14, screenX + 12, y + floatY + 16);
      shardColor.addColorStop(0, '#fff7ad');
      shardColor.addColorStop(0.45, '#f59e0b');
      shardColor.addColorStop(1, '#78350f');
      
      ctx.fillStyle = shardColor;
      ctx.beginPath();
      ctx.moveTo(screenX - 2, y + floatY - 16);
      ctx.lineTo(screenX + 13, y + floatY - 4);
      ctx.lineTo(screenX + 7, y + floatY + 15);
      ctx.lineTo(screenX - 12, y + floatY + 8);
      ctx.lineTo(screenX - 9, y + floatY - 8);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.82)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(screenX - 3, y + floatY - 8);
      ctx.lineTo(screenX + 5, y + floatY - 2);
      ctx.moveTo(screenX - 5, y + floatY + 4);
      ctx.lineTo(screenX + 4, y + floatY + 8);
      ctx.stroke();
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 12;
      
      // Premium Token
      const tokenGrad = ctx.createRadialGradient(screenX, y + floatY, 5, screenX, y + floatY, 20);
      tokenGrad.addColorStop(0, '#fffcf0');
      tokenGrad.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = tokenGrad;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(screenX - 18, y + floatY - 18, 36, 36, 8);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = '800 20px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(label, screenX, y + floatY + 7);
    }
    ctx.restore();
  }, []);

  const drawTempleBackdrop = useCallback((ctx, section, cameraX) => {
    if (section.id !== 'ruined-temple') return;

    ctx.save();
    ctx.fillStyle = 'rgba(34, 24, 18, 0.22)';
    for (let worldX = section.start + 90; worldX < section.end; worldX += 180) {
      const x = worldX - cameraX;
      if (x < -120 || x > CANVAS_WIDTH + 120) continue;
      ctx.fillRect(x - 18, 116, 36, 242);
      ctx.fillStyle = 'rgba(255, 236, 180, 0.1)';
      ctx.fillRect(x - 13, 126, 26, 18);
      ctx.fillRect(x - 13, 176, 26, 18);
      ctx.fillRect(x - 13, 226, 26, 18);
      ctx.fillStyle = 'rgba(34, 24, 18, 0.22)';
    }

    ctx.strokeStyle = 'rgba(255, 236, 180, 0.18)';
    ctx.lineWidth = 2;
    for (let worldX = section.start + 30; worldX < section.end; worldX += 90) {
      const x = worldX - cameraX;
      if (x < -80 || x > CANVAS_WIDTH + 80) continue;
      ctx.strokeRect(x, 156, 42, 24);
      ctx.beginPath();
      ctx.moveTo(x + 8, 226);
      ctx.lineTo(x + 35, 206);
      ctx.lineTo(x + 47, 232);
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  const drawRouteGate = useCallback((ctx, gate, screenX, current, complete) => {
    const gateCenter = screenX + gate.width / 2;
    const top = gate.y - 22;
    const height = gate.height + 22;
    const glowColor = complete ? '#22c55e' : '#f59e0b';

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = complete ? 14 : 8;
    ctx.fillStyle = complete ? 'rgba(22, 101, 52, 0.28)' : 'rgba(69, 26, 3, 0.36)';
    ctx.beginPath();
    ctx.roundRect(screenX - 14, top, gate.width + 28, height, 8);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#5f4938';
    ctx.fillRect(screenX - 22, top + 4, 20, height - 4);
    ctx.fillRect(screenX + gate.width + 2, top + 4, 20, height - 4);
    ctx.fillStyle = '#7a5b3d';
    ctx.fillRect(screenX - 26, top - 8, gate.width + 52, 18);
    ctx.fillStyle = '#3b2b22';
    ctx.fillRect(screenX, top + 16, gate.width, height - 28);

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(screenX + 4, top + 24, gate.width - 8, height - 44);
    ctx.strokeStyle = 'rgba(255, 236, 180, 0.25)';
    ctx.lineWidth = 1;
    for (let y = top + 38; y < top + height - 22; y += 22) {
      ctx.beginPath();
      ctx.moveTo(screenX + 8, y);
      ctx.lineTo(screenX + gate.width - 8, y + 5);
      ctx.stroke();
    }

    ctx.fillStyle = complete ? '#bbf7d0' : '#fef3c7';
    ctx.beginPath();
    ctx.arc(gateCenter, gate.y + gate.height / 2, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = '#3b2b22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(gateCenter, gate.y + gate.height / 2 - 2, 8, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#3b2b22';
    ctx.fillRect(gateCenter - 9, gate.y + gate.height / 2 - 2, 18, 13);

    const guidance = getGateGuidance(gate, current);
    const displayReqs = guidance.gateRequirements.slice(0, 4);
    drawFieldNoteLabel(ctx, gateCenter, top - 10, complete ? 'SEAL READY' : 'SEALED GATE', complete ? '#166534' : '#78350f');
    if (!complete && displayReqs.length > 0) {
      ctx.fillStyle = 'rgba(255, 252, 235, 0.84)';
      ctx.fillRect(gateCenter - 74, top + height + 4, 148, 52);
      ctx.strokeStyle = '#78350f';
      ctx.strokeRect(gateCenter - 74, top + height + 4, 148, 52);
      ctx.fillStyle = '#78350f';
      ctx.font = '800 8px Outfit, sans-serif';
      ctx.textAlign = 'left';
      displayReqs.forEach((req, index) => {
        const mark = req.met ? '✓' : '○';
        ctx.fillText(`${mark} ${req.label}`.toUpperCase(), gateCenter - 66, top + height + 16 + index * 10);
      });
    }
    ctx.restore();
  }, [drawFieldNoteLabel, getGateGuidance]);

  const drawMissingObjectiveMarker = useCallback((ctx, guidance, cameraX, now) => {
    if (!guidance?.activeGateLocked || !guidance.nearestMissingObjective) return;
    const target = guidance.nearestMissingObjective;
    const targetScreenX = target.x - cameraX;
    const pulse = Math.sin(now / 140) * 0.25 + 0.75;
    ctx.save();
    ctx.strokeStyle = `rgba(251, 191, 36, ${pulse})`;
    ctx.fillStyle = '#78350f';
    ctx.lineWidth = 3;
    if (targetScreenX > 24 && targetScreenX < CANVAS_WIDTH - 24) {
      ctx.beginPath();
      ctx.arc(targetScreenX, 292, 24 + pulse * 8, 0, Math.PI * 2);
      ctx.stroke();
      drawFieldNoteLabel(ctx, targetScreenX, 258, `Needed: ${target.label}`, '#78350f');
    } else {
      const arrowX = targetScreenX < 0 ? 30 : CANVAS_WIDTH - 30;
      const direction = targetScreenX < 0 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(arrowX + direction * 13, 112);
      ctx.lineTo(arrowX - direction * 13, 98);
      ctx.lineTo(arrowX - direction * 13, 126);
      ctx.closePath();
      ctx.fill();
      drawFieldNoteLabel(ctx, arrowX + direction * 60, 92, `Need: ${target.label}`, '#78350f');
    }
    ctx.restore();
  }, [drawFieldNoteLabel]);

  const drawHazard = useCallback((ctx, hazard, cameraX, current, now) => {
    const hx = hazard.x - cameraX;
    if (hx + hazard.width < -50 || hx > CANVAS_WIDTH + 50) return;

    const visual = HAZARD_VISUALS[hazard.id] || {
      icon: '!',
      label: hazard.name,
      color: '#7f1d1d',
      fill: 'rgba(127, 29, 29, 0.24)',
      accent: '#facc15',
      message: hazard.message,
    };
    const nearPlayer = Math.abs((current.player.x + current.player.width / 2) - (hazard.x + hazard.width / 2)) < 210;
    const pulse = Math.sin(now / 180 + hazard.x * 0.01) * 0.25 + 0.75;
    const hitActive = current.lastHazardHit?.id === hazard.id && current.staminaFeedbackTimer > 0;
    const baseY = hazard.y;

    ctx.save();
    ctx.lineWidth = hitActive ? 4 : 2;
    ctx.strokeStyle = hitActive ? '#ef4444' : visual.color;
    ctx.fillStyle = visual.fill;
    ctx.globalAlpha = hitActive ? 0.98 : 0.88;

    if (hazard.id === 'dark-gap') {
      const gradient = ctx.createRadialGradient(hx + hazard.width / 2, baseY + hazard.height / 2, 6, hx + hazard.width / 2, baseY + hazard.height / 2, hazard.width / 1.5);
      gradient.addColorStop(0, '#020617');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.72)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(hx + hazard.width / 2, baseY + hazard.height / 2, hazard.width / 2, Math.max(12, hazard.height), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.fillRect(hx + 8, baseY + 3, hazard.width - 16, 2);
    } else if (hazard.id === 'thorn-bush') {
      ctx.beginPath();
      ctx.roundRect(hx, baseY + 8, hazard.width, hazard.height - 4, 8);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = visual.accent;
      for (let i = 8; i < hazard.width; i += 12) {
        ctx.beginPath();
        ctx.moveTo(hx + i, baseY + hazard.height + 2);
        ctx.lineTo(hx + i + 6, baseY + 5);
        ctx.lineTo(hx + i + 12, baseY + hazard.height + 2);
        ctx.stroke();
      }
    } else if (hazard.id === 'sand-pit') {
      ctx.beginPath();
      ctx.ellipse(hx + hazard.width / 2, baseY + hazard.height / 2, hazard.width / 2, hazard.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = visual.accent;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.arc(hx + 18 + i * 18, baseY + 15 + Math.sin(now / 220 + i) * 3, 5 + pulse * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (hazard.id === 'spike-trap') {
      ctx.fillRect(hx, baseY + 10, hazard.width, hazard.height - 8);
      ctx.strokeRect(hx, baseY + 10, hazard.width, hazard.height - 8);
      ctx.fillStyle = visual.accent;
      for (let i = 4; i < hazard.width - 4; i += 14) {
        ctx.beginPath();
        ctx.moveTo(hx + i, baseY + 10);
        ctx.lineTo(hx + i + 7, baseY - 8 - pulse * 3);
        ctx.lineTo(hx + i + 14, baseY + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (hazard.id === 'rolling-stones' || hazard.id === 'falling-blocks') {
      ctx.fillRect(hx, baseY + 10, hazard.width, hazard.height - 8);
      ctx.strokeRect(hx, baseY + 10, hazard.width, hazard.height - 8);
      ctx.strokeStyle = visual.accent;
      ctx.beginPath();
      ctx.moveTo(hx + 8, baseY + 18);
      ctx.lineTo(hx + hazard.width * 0.45, baseY + 8);
      ctx.lineTo(hx + hazard.width - 10, baseY + 22);
      ctx.stroke();
      ctx.fillStyle = visual.color;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(hx + 18 + i * 22, baseY + 6 + Math.sin(now / 160 + i) * 4, 5 + i, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (hazard.id === 'bat-cloud' || hazard.id === 'dust-wave') {
      ctx.beginPath();
      ctx.roundRect(hx, baseY, hazard.width, hazard.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = visual.accent;
      for (let i = 0; i < 7; i += 1) {
        ctx.globalAlpha = 0.35 + pulse * 0.35;
        ctx.beginPath();
        ctx.arc(hx + 14 + i * 15, baseY + 18 + Math.sin(now / 130 + i) * 14, 3 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.beginPath();
      ctx.moveTo(hx, baseY + hazard.height);
      ctx.lineTo(hx + hazard.width * 0.35, baseY + 8);
      ctx.lineTo(hx + hazard.width, baseY + hazard.height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = visual.accent;
      ctx.beginPath();
      ctx.moveTo(hx + 12, baseY + hazard.height - 8);
      ctx.lineTo(hx + hazard.width - 10, baseY + 12);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.75 + pulse * 0.25;
    ctx.strokeStyle = visual.accent;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(hx - 5, baseY - 7, hazard.width + 10, hazard.height + 14);
    ctx.setLineDash([]);

    ctx.fillStyle = visual.color;
    ctx.beginPath();
    ctx.moveTo(hx + hazard.width / 2, baseY - 25);
    ctx.lineTo(hx + hazard.width / 2 - 10, baseY - 7);
    ctx.lineTo(hx + hazard.width / 2 + 10, baseY - 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff7ed';
    ctx.font = '900 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(visual.icon, hx + hazard.width / 2, baseY - 11);

    if (nearPlayer || hitActive) {
      drawFieldNoteLabel(ctx, hx + hazard.width / 2, baseY - 34, visual.label, visual.color);
    }
    ctx.restore();
  }, [drawFieldNoteLabel]);

  const drawMiniBoss = useCallback((ctx, boss, screenX, now) => {
    const pulse = Math.sin(now / 400) * 0.12 + 0.88;
    const cx = screenX + boss.width / 2;
    const cy = boss.y + boss.height / 2;

    ctx.save();
    const bossAura = ctx.createRadialGradient(cx, cy, 18, cx, cy, 78 * pulse);
    bossAura.addColorStop(0, 'rgba(20, 184, 166, 0.24)');
    bossAura.addColorStop(1, 'transparent');
    ctx.fillStyle = bossAura;
    ctx.beginPath();
    ctx.arc(cx, cy, 78 * pulse, 0, Math.PI * 2);
    ctx.fill();
    if (boss.hitFlash > 0 || boss.stunTimer > 0) {
      ctx.strokeStyle = boss.hitFlash > 0 ? '#fff7ad' : '#7dd3fc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 40 + Math.sin(now / 60) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.shadowColor = 'rgba(15, 23, 42, 0.55)';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;

    if (boss.type === 'guardian' || boss.type === 'statue') {
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(screenX + 10, boss.y + 10, boss.width - 20, 22, 8);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(screenX + 5, boss.y + 30, boss.width - 10, boss.height - 28, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.fillRect(screenX - 8, boss.y + 36, 14, 34);
      ctx.fillRect(screenX + boss.width - 6, boss.y + 36, 14, 34);
      ctx.fillRect(screenX + 8, boss.y + boss.height - 4, boss.width - 16, 12);
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(cx - 8, boss.y + 22, 3, 0, Math.PI * 2);
      ctx.arc(cx + 8, boss.y + 22, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx, boss.y + 50, 9 + Math.sin(now / 220) * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.34)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 14, boss.y + 38, boss.width - 28, 24);
    } else if (boss.type === 'snake') {
      ctx.fillStyle = '#166534';
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.ellipse(screenX + 12 + i * 14, cy + Math.sin(now / 180 + i) * 5, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(screenX + boss.width - 10, cy - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.type === 'looter') {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(screenX + 14, boss.y + 18, boss.width - 28, boss.height - 14, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(screenX + 7, boss.y + 9, boss.width - 14, 6);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(screenX + boss.width - 18, boss.y + 36, 12, 18);
    } else {
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.ellipse(cx, cy, boss.width / 2, boss.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(cx, boss.y + 8);
      ctx.lineTo(cx + 18, cy);
      ctx.lineTo(cx, boss.y + boss.height - 6);
      ctx.lineTo(cx - 18, cy);
      ctx.closePath();
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.roundRect(screenX - 10, boss.y - 25, boss.width + 20, 8, 4);
    ctx.fill();
    ctx.fillStyle = '#14b8a6';
    ctx.roundRect(screenX - 10, boss.y - 25, (boss.health / boss.maxHealth) * (boss.width + 20), 8, 4);
    ctx.fill();

    if (boss.shieldTimer > 0) {
      ctx.fillStyle = '#dbeafe';
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 28 + Math.sin(now / 80) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '900 9px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SHIELD', cx, boss.y - 28);
    } else if (boss.vulnerabilityTimer > 0) {
      ctx.fillStyle = '#bbf7d0';
      ctx.font = '900 9px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OPEN!', cx, boss.y - 28);
    }

    drawFieldNoteLabel(ctx, cx, boss.y - 40, boss.name, '#0f766e');
    ctx.restore();
  }, [drawFieldNoteLabel]);

  const drawAttackArc = useCallback((ctx, box, cameraX, direction, color = '#facc15', label = 'STUN') => {
    if (!box) return;
    const x = box.x - cameraX;
    const cx = direction >= 0 ? x + 6 : x + box.width - 6;
    const cy = box.y + box.height / 2;

    ctx.save();
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = `${color}22`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, box.width * 0.58, box.height * 0.78, direction >= 0 ? -0.2 : 0.2, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
    ctx.fillRect(x, box.y, box.width, box.height);
    ctx.fillStyle = '#fff7ad';
    ctx.beginPath();
    ctx.arc(direction >= 0 ? x + box.width : x, box.y + 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = '800 8px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + box.width / 2, box.y - 4);
    ctx.restore();
  }, []);

  const drawEnemyAttackTell = useCallback((ctx, entity, screenX, cameraX, now, isBoss = false) => {
    const cx = screenX + entity.width / 2;
    const cy = entity.y + entity.height / 2;
    const warning = entity.attackWindup > 0;
    const attacking = entity.attackTimer > 0;
    const shielded = isBoss && entity.shieldTimer > 0;
    const vulnerable = isBoss && entity.vulnerabilityTimer > 0;
    if (!warning && !attacking && !shielded && !vulnerable) return;

    ctx.save();
    if (shielded) {
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.85)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 54 + Math.sin(now / 70) * 4, 0, Math.PI * 2);
      ctx.stroke();
      drawFieldNoteLabel(ctx, cx, entity.y - 58, 'SHIELDED', '#0369a1');
    } else if (vulnerable) {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.82)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 50 + Math.sin(now / 90) * 5, 0, Math.PI * 2);
      ctx.stroke();
      drawFieldNoteLabel(ctx, cx, entity.y - 58, 'COUNTER WINDOW', '#166534');
    }
    if (warning) {
      const pulse = Math.sin(now / 80) * 0.25 + 0.75;
      ctx.strokeStyle = `rgba(248, 113, 113, ${pulse})`;
      ctx.lineWidth = isBoss ? 5 : 3;
      ctx.beginPath();
      ctx.arc(cx, cy, (isBoss ? 46 : 30) + pulse * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fee2e2';
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, entity.y - 18, isBoss ? 12 : 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7f1d1d';
      ctx.font = `900 ${isBoss ? 15 : 12}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('!', cx, entity.y - (isBoss ? 13 : 14));
      if (isBoss && entity.attackPhaseLabel) {
        drawFieldNoteLabel(ctx, cx, entity.y - 36, entity.attackPhaseLabel, '#b45309');
      }
    }

    if (attacking) {
      const isArea = isBoss && entity.attackKind === 'area';
      const isRanged = isBoss && entity.attackKind === 'ranged';
      const box = isArea
        ? {
          x: entity.x - 36,
          y: entity.y + entity.height - 48,
          width: entity.width + 72,
          height: 54,
        }
        : getAttackBox(entity, isRanged ? 122 : isBoss ? 58 : 36, isBoss ? 40 : 24, entity.attackDirection);
      drawAttackArc(ctx, box, cameraX, entity.attackDirection, isBoss ? (isRanged ? '#7dd3fc' : isArea ? '#facc15' : '#fb923c') : '#f87171', isBoss ? (entity.attackPhaseLabel || 'BOSS ATTACK') : 'ATTACK');
    }
    ctx.restore();
  }, [drawAttackArc, drawFieldNoteLabel, getAttackBox]);

  const drawCombatEffects = useCallback((ctx, effects, cameraX, now) => {
    effects.forEach((effect) => {
      const progress = effect.timer / (effect.maxTimer || 0.35);
      const x = effect.x - cameraX;
      const y = effect.y;
      ctx.save();
      ctx.globalAlpha = Math.max(0, progress);
      ctx.strokeStyle = effect.color || '#facc15';
      ctx.fillStyle = effect.color || '#facc15';
      ctx.lineWidth = 3;
      const burst = 18 + (1 - progress) * 22;
      ctx.beginPath();
      ctx.arc(x, y, burst * 0.45, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 5; i += 1) {
        const angle = now / 180 + i * ((Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * burst, y + Math.sin(angle) * burst * 0.65);
        ctx.stroke();
      }
      if (effect.type?.includes('defeat')) {
        ctx.font = '900 10px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SHARDS!', x, y - 18 - (1 - progress) * 10);
      }
      if (effect.text) {
        ctx.font = '900 13px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeText(effect.text, x, y - 24 - (1 - progress) * 16);
        ctx.fillText(effect.text, x, y - 24 - (1 - progress) * 16);
      }
      ctx.restore();
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const current = stateRef.current;
    const player = current.player;
    const now = Date.now();
    const section = getSectionForX(player.x);
    const atmosphere = SECTION_ATMOSPHERES[section.id] || SECTION_ATMOSPHERES[SECTIONS[0].id];
    const focusX = current.bossIntroTimer > 0 && current.bossIntro?.focusX
      ? current.bossIntro.focusX * 0.72 + player.x * 0.28
      : player.x;
    const shake = current.cameraShakeTimer > 0
      ? Math.sin(now / 28) * current.cameraShakeStrength * 7
      : 0;
    const cameraX = clamp(focusX - 260 + shake, 0, WORLD_WIDTH - CANVAS_WIDTH);
    const isPlayerNear = (worldX, distance = 240) => Math.abs((player.x + player.width / 2) - worldX) < distance;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGradient.addColorStop(0, atmosphere.skyTop);
    skyGradient.addColorStop(1, atmosphere.skyBottom);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Parallax Hills
    ctx.fillStyle = section.id === 'catacombs' ? 'rgba(0, 0, 0, 0.28)' : 'rgba(112, 73, 42, 0.16)';
    for (let hill = -160; hill < WORLD_WIDTH; hill += 240) {
      ctx.beginPath();
      ctx.ellipse(hill - cameraX * 0.34, 355, 180, 45, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Parallax Ridges
    ctx.fillStyle = section.id === 'dig-site-entrance' ? 'rgba(34, 84, 61, 0.18)' : 'rgba(53, 40, 30, 0.14)';
    for (let ridge = -260; ridge < WORLD_WIDTH; ridge += 360) {
      ctx.beginPath();
      ctx.ellipse(ridge - cameraX * 0.18, 242, 220, 58, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Ground & Props ---
    drawTempleBackdrop(ctx, section, cameraX);
    STORY_PROPS.forEach((prop) => drawStoryProp(ctx, prop, cameraX, now));
    drawParticles(ctx, atmosphere, cameraX, now);

    // --- Environment Layers (Parallax) ---
    const renderParallaxLayer = (depth, color, heightMult) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT);
      for (let i = 0; i <= CANVAS_WIDTH; i += 40) {
        const worldX = i + cameraX * depth;
        const y = CANVAS_HEIGHT - 60 - heightMult * (20 + Math.sin(worldX * 0.002) * 30 + Math.cos(worldX * 0.005) * 15);
        ctx.lineTo(i, y);
      }
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fill();
    };
    renderParallaxLayer(0.08, `${atmosphere.skyBottom}66`, 1.3);
    renderParallaxLayer(0.18, `${atmosphere.skyBottom}99`, 0.9);
    renderParallaxLayer(0.28, `${atmosphere.skyBottom}cc`, 0.5);

    // --- Entities ---
    PLATFORMS.forEach((platform) => drawPlatform(ctx, platform, cameraX, current));
    
    HAZARDS.forEach((hazard) => drawHazard(ctx, hazard, cameraX, current, now));

    CHECKPOINTS.forEach((checkpoint) => {
      const cx = checkpoint.x - cameraX;
      if (cx < -80 || cx > CANVAS_WIDTH + 80) return;
      const active = current.activeCheckpoint.id === checkpoint.id;
      ctx.save();
      ctx.fillStyle = active ? '#166534' : '#451a03';
      ctx.fillRect(cx - 2, checkpoint.y, 4, 80);
      if (active || isPlayerNear(checkpoint.x, 230)) {
        drawFieldNoteLabel(ctx, cx, checkpoint.y - 20, active ? 'CHECKPOINT' : checkpoint.name, active ? '#166534' : '#78350f');
      }
      ctx.restore();
    });

    const activeRouteGate = ROUTE_GATES.find(gate => !current.openedRouteGateIds.has(gate.id));
    const activeGateGuidance = activeRouteGate ? getGateGuidance(activeRouteGate, current) : null;

    ROUTE_GATES.forEach((gate) => {
      if (current.openedRouteGateIds.has(gate.id)) return;
      const gx = gate.x - cameraX;
      if (gx + gate.width < -100 || gx > CANVAS_WIDTH + 100) return;
      const requirements = getGateRequirements(gate, current);
      const complete = requirements.every(r => r.met);
      drawRouteGate(ctx, gate, gx, current, complete);
    });
    drawMissingObjectiveMarker(ctx, activeGateGuidance, cameraX, now);

    current.enemies.forEach((enemy) => {
      if (enemy.defeated) return;
      const ex = enemy.x - cameraX;
      if (ex + enemy.width < -50 || ex > CANVAS_WIDTH + 50) return;
      
      ctx.save();
      const shakeX = enemy.hitFlash > 0 ? Math.sin(now / 20) * 5 : 0;
      drawEnemyAttackTell(ctx, enemy, ex, cameraX, now);
      
      // Enemy Aura
      const aura = ctx.createRadialGradient(ex + enemy.width/2, enemy.y + enemy.height/2, 5, ex + enemy.width/2, enemy.y + enemy.height/2, 30);
      aura.addColorStop(0, 'rgba(30, 41, 59, 0.2)');
      aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(ex + enemy.width/2, enemy.y + enemy.height/2, 30, 0, Math.PI * 2);
      ctx.fill();

      // Main Visual
      ctx.font = '42px Outfit';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.fillText(enemy.emoji, ex + enemy.width / 2 + shakeX, enemy.y + enemy.height / 2 + 14);
      
      // Health Bar (Small)
      if (enemy.health > 1) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(ex, enemy.y - 12, enemy.width, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(ex, enemy.y - 12, (enemy.health / 2) * enemy.width, 4);
      }

      if (isPlayerNear(enemy.x + enemy.width / 2, 170) || enemy.hitFlash > 0 || enemy.stunTimer > 0) {
        drawFieldNoteLabel(ctx, ex + enemy.width / 2, enemy.y - 20, enemy.name, '#1e293b');
      }
      ctx.restore();
    });

    current.miniBosses.forEach((boss) => {
      if (boss.defeated) return;
      const bx = boss.x - cameraX;
      if (bx + boss.width < -100 || bx > CANVAS_WIDTH + 100) return;
      drawMiniBoss(ctx, boss, bx, now);
      drawEnemyAttackTell(ctx, boss, bx, cameraX, now, true);
    });

    RELIC_SHARDS.forEach(shard => {
      if (current.collectedShardIds.has(shard.id)) return;
      const visible = !shard.hidden || current.collectedUpgrades.has('historian-vision');
      if (visible) drawCollectible(ctx, shard.x, shard.y, cameraX, now, '💎', '#b45309', shard.hidden, true);
    });

    UPGRADES.forEach(upgrade => {
      if (!current.collectedUpgrades.has(upgrade.id)) {
        drawCollectible(ctx, upgrade.x, upgrade.y, cameraX, now, upgrade.emoji, '#2563eb');
        if (isPlayerNear(upgrade.x, 260)) {
          drawFieldNoteLabel(ctx, upgrade.x - cameraX, upgrade.y - 30, upgrade.name, '#2563eb');
        }
      }
    });

    TOOL_LAYOUT.forEach(toolPos => {
      if (!current.collectedToolIds.has(toolPos.id)) {
        const tool = JOURNEY_TOOLS.find(t => t.id === toolPos.id);
        drawCollectible(ctx, toolPos.x, toolPos.y, cameraX, now, tool.emoji, '#d4af37');
        if (isPlayerNear(toolPos.x, 240)) {
          drawFieldNoteLabel(ctx, toolPos.x - cameraX, toolPos.y - 30, tool.name, '#b45309');
        }
      }
    });

    OBJECTIVE_MARKERS.forEach(marker => {
      if (current.collectedObjectiveIds.has(marker.id)) return;
      const mx = marker.x - cameraX;
      if (mx < -50 || mx > CANVAS_WIDTH + 50) return;
      const emoji = marker.type === 'switch' ? '⚙️' : marker.type === 'glyph' ? '📜' : marker.type === 'escape' ? '🏃' : '🚩';
      ctx.save();
      ctx.font = '32px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(emoji, mx + 15, marker.y + 15);
      if (isPlayerNear(marker.x, 260)) {
        drawFieldNoteLabel(ctx, mx + 15, marker.y - 15, marker.label, marker.color || '#b45309');
      }
      ctx.restore();
    });

    const gateX = GATE.x - cameraX;
    if (gateX > -200 && gateX < CANVAS_WIDTH + 200) {
      ctx.save();
      ctx.fillStyle = '#31543d';
      ctx.fillRect(gateX - 18, GATE.y - 20, GATE.width + 36, GATE.height + 20);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(gateX - 28, GATE.y - 28, GATE.width + 56, 10);
      ctx.fillStyle = '#1f3f2e';
      ctx.fillRect(gateX + 8, GATE.y + 12, GATE.width - 16, GATE.height - 12);
      ctx.strokeStyle = '#bbf7d0';
      ctx.lineWidth = 3;
      ctx.strokeRect(gateX + 10, GATE.y + 18, GATE.width - 20, GATE.height - 24);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.32)';
      ctx.beginPath();
      ctx.arc(gateX + GATE.width / 2, GATE.y + 18, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (current.attackTimer > 0) {
      drawAttackArc(ctx, current.playerAttackBox, cameraX, player.direction, '#facc15', 'TOOL SWING');
    }
    drawPlayerCharacter(ctx, player.x - cameraX, player.y, player.width, player.height, player.direction, player.invulnerable, now);
    drawCombatEffects(ctx, current.combatHitEffects, cameraX, now);

    if (player.hitFeedbackTimer > 0) {
      ctx.save();
      ctx.fillStyle = '#fecaca';
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 2;
      ctx.font = '900 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      const px = player.x - cameraX + player.width / 2;
      ctx.fillText(`-${player.lastDamage} STAMINA`, px, player.y - 24 - player.hitFeedbackTimer * 8);
      ctx.strokeText(`-${player.lastDamage} STAMINA`, px, player.y - 24 - player.hitFeedbackTimer * 8);
      ctx.restore();
    }

    // CINEMATIC CARDS
    const featureCard = current.bossIntro || current.sectionTransition || current.environmentEvent || current.cinematicEvent;
    if (featureCard) {
      ctx.fillStyle = 'rgba(47, 37, 29, 0.9)';
      ctx.fillRect(200, 80, 500, 80);
      ctx.fillStyle = '#fff4d4';
      ctx.font = '900 18px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(featureCard.name || featureCard.title, 450, 110);
      ctx.font = '800 12px Outfit';
      ctx.fillText(featureCard.message || '', 450, 135);
      ctx.textAlign = 'start';
    }
  }, [drawAttackArc, drawCollectible, drawCombatEffects, drawEnemyAttackTell, drawHazard, drawMiniBoss, drawMissingObjectiveMarker, drawParticles, drawPlatform, drawRouteGate, drawStoryProp, drawTempleBackdrop, getGateGuidance, getGateRequirements, drawPlayerCharacter, drawFieldNoteLabel]);

  const queueAttack = useCallback(() => {
    const current = stateRef.current;
    if (briefingOpen || current.failed || current.completed) return;
    if (current.attackCooldown > 0 || current.attackWindupTimer > 0 || current.attackTimer > 0 || current.attackRecoilTimer > 0) return;
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

    // Timers
    current.cinematicTimer = Math.max(0, current.cinematicTimer - dt);
    if (current.cinematicTimer <= 0 && current.cinematicEvent?.temporary) current.cinematicEvent = null;
    current.bossIntroTimer = Math.max(0, current.bossIntroTimer - dt);
    if (current.bossIntroTimer <= 0 && current.bossIntro) current.bossIntro = null;
    current.environmentEventTimer = Math.max(0, current.environmentEventTimer - dt);
    if (current.environmentEventTimer <= 0 && current.environmentEvent) current.environmentEvent = null;
    current.sectionTransitionTimer = Math.max(0, current.sectionTransitionTimer - dt);
    if (current.sectionTransitionTimer <= 0 && current.sectionTransition) current.sectionTransition = null;
    current.cameraShakeTimer = Math.max(0, current.cameraShakeTimer - dt);
    if (current.cameraShakeTimer <= 0) current.cameraShakeStrength = 0;
    current.invulnerable = Math.max(0, current.invulnerable - dt);
    current.hazardCooldown = Math.max(0, current.hazardCooldown - dt);
    current.staminaFeedbackTimer = Math.max(0, current.staminaFeedbackTimer - dt);
    current.enemyCooldown = Math.max(0, current.enemyCooldown - dt);
    current.attackCooldown = Math.max(0, current.attackCooldown - dt);
    const wasWindingUp = current.attackWindupTimer > 0;
    const wasSwinging = current.attackTimer > 0;
    const wasRecoiling = current.attackRecoilTimer > 0;
    current.attackWindupTimer = Math.max(0, current.attackWindupTimer - dt);
    current.attackTimer = Math.max(0, current.attackTimer - dt);
    current.attackRecoilTimer = Math.max(0, current.attackRecoilTimer - dt);
    player.hitFeedbackTimer = Math.max(0, player.hitFeedbackTimer - dt);
    if (current.attackTimer <= 0) current.playerAttackBox = null;
    if (wasWindingUp && current.attackWindupTimer <= 0) {
      current.attackTimer = ATTACK_DURATION;
      current.attackHitIds.clear();
    }
    if (wasSwinging && current.attackTimer <= 0 && current.attackRecoilTimer <= 0) {
      current.attackRecoilTimer = ATTACK_RECOIL_DURATION;
    }
    if (wasRecoiling && current.attackRecoilTimer <= 0 && current.attackCooldown <= 0) {
      current.attackPhase = 'ready';
    } else {
      current.attackPhase = getPlayerAttackState(current);
    }
    current.hitStopTimer = Math.max(0, current.hitStopTimer - dt);
    current.combatHitEffects = current.combatHitEffects
      .map(effect => ({ ...effect, timer: Math.max(0, effect.timer - dt) }))
      .filter(effect => effect.timer > 0);
    current.routeGateCooldown = Math.max(0, current.routeGateCooldown - dt);

    // Movement
    player.vx = 0;
    if (left) { player.vx -= MOVE_SPEED; player.direction = -1; }
    if (right) { player.vx += MOVE_SPEED; player.direction = 1; }
    if (current.collectedUpgrades.has('reinforced-boots')) player.vx *= 1.05;
    if (current.attackWindupTimer > 0) player.vx *= 0.45;
    if (current.attackRecoilTimer > 0) player.vx += -player.direction * 55;
    if (player.knockbackTimer > 0) {
      player.knockbackTimer = Math.max(0, player.knockbackTimer - dt);
      player.vx += player.knockbackDirection * 150;
    }

    if (jump && !keys.jumpHeld) {
      if (player.onGround) {
        player.vy = -JUMP_SPEED;
        player.onGround = false;
        player.airJumpsUsed = 0;
        audioControls?.playJump?.();
      } else if (current.collectedUpgrades.has('rope-launcher') && player.airJumpsUsed < 1) {
        player.vy = -JUMP_SPEED * 0.85;
        player.airJumpsUsed += 1;
        audioControls?.playJump?.();
      }
    }
    keys.jumpHeld = jump;

    player.vy += GRAVITY * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Bounds
    player.x = clamp(player.x, 0, WORLD_WIDTH - player.width);
    if (player.y > CANVAS_HEIGHT + 100) {
      triggerJourneyRescue('The team stumbled into a ravine. Field rescue required.');
    }

    // Platforms
    player.onGround = false;
    const available = PLATFORMS.filter(p => !p.requiresUpgrade || current.collectedUpgrades.has(p.requiresUpgrade));
    available.forEach(p => {
      if (player.vy >= 0 && rectsOverlap(player, p) && player.y + player.height - player.vy * dt <= p.y + 6) {
        player.y = p.y - player.height;
        player.vy = 0;
        player.onGround = true;
      }
    });

    // Sections
    const section = getSectionForX(player.x);
    if (section.id !== current.lastSectionId) {
      const atmosphere = SECTION_ATMOSPHERES[section.id];
      current.sectionTransition = { id: section.id, name: section.name, message: atmosphere.title };
      current.sectionTransitionTimer = 2.6;
      current.lastSectionId = section.id;
      current.notice = atmosphere.title;
      audioControls?.playLevelUp?.();
    }

    const reachedCheckpoint = CHECKPOINTS
      .filter(checkpoint => player.x + player.width / 2 >= checkpoint.x)
      .at(-1);
    if (reachedCheckpoint && current.activeCheckpoint.id !== reachedCheckpoint.id) {
      current.activeCheckpoint = reachedCheckpoint;
      current.resources.stamina = Math.max(current.resources.stamina, 85);
      current.notice = `Checkpoint reached: ${reachedCheckpoint.name}.`;
      audioControls?.playSuccess?.();
    }

    // Events
    ENVIRONMENT_EVENTS.forEach(ev => {
      if (!current.triggeredEnvironmentEventIds.has(ev.id) && Math.abs(player.x - ev.x) < 50) {
        current.triggeredEnvironmentEventIds.add(ev.id);
        current.environmentEvent = ev;
        current.environmentEventTimer = ev.duration;
        current.cameraShakeTimer = ev.duration * 0.4;
        current.cameraShakeStrength = ev.shake;
        current.notice = ev.message;
        audioControls?.playTransition?.();
      }
    });

    // Collectibles
    TOOL_LAYOUT.forEach(toolPos => {
      if (!current.collectedToolIds.has(toolPos.id) && rectsOverlap(player, { ...toolPos, width: 30, height: 30 })) {
        current.collectedToolIds.add(toolPos.id);
        const tool = JOURNEY_TOOLS.find(t => t.id === toolPos.id);
        current.fieldKit.push(tool);
        current.notice = `Field tool recovered: ${tool.name}. Report to Base Camp for registration.`;
        audioControls?.playMatch?.();
      }
    });

    RELIC_SHARDS.forEach(shard => {
      if (!current.collectedShardIds.has(shard.id) && rectsOverlap(player, { ...shard, width: 24, height: 24 })) {
        current.collectedShardIds.add(shard.id);
        current.relicShardCount += 1;
        audioControls?.playSuccess?.();
      }
    });

    UPGRADES.forEach(u => {
      if (!current.collectedUpgrades.has(u.id) && rectsOverlap(player, { ...u, width: 36, height: 36 })) {
        current.collectedUpgrades.add(u.id);
        current.notice = `Field Upgrade: ${u.name}. ${u.effect}`;
        audioControls?.playLevelUp?.();
      }
    });

    OBJECTIVE_MARKERS.forEach(m => {
      if (!current.collectedObjectiveIds.has(m.id) && rectsOverlap(player, { ...m, width: 30, height: 30 })) {
        current.collectedObjectiveIds.add(m.id);
        const progress = getObjectiveProgress(m.sectionId, current);
        if (progress.count >= progress.total) {
          current.completedObjectiveIds.add(m.sectionId);
          current.notice = `Objective Complete: ${progress.title}`;
        } else {
          current.notice = `Objective Progress: ${progress.count}/${progress.total} ${progress.itemLabel}.`;
        }
        audioControls?.playSuccess?.();
      }
    });

    // Hazards
    if (current.hazardCooldown <= 0) {
      HAZARDS.forEach(h => {
        if (rectsOverlap(player, h)) {
          const staminaLoss = h.penalty.stamina || 0;
          const timeLoss = h.penalty.time || 0;
          const visual = HAZARD_VISUALS[h.id] || {};
          if (staminaLoss) current.resources.stamina = Math.max(0, current.resources.stamina - staminaLoss);
          if (timeLoss) current.resources.time = Math.max(0, current.resources.time - timeLoss);
          current.hazardCooldown = 1.2;
          current.lastHazardHit = {
            id: h.id,
            name: h.name,
            message: visual.message || h.message,
            staminaDelta: -staminaLoss,
            timeDelta: -timeLoss,
          };
          current.lastStaminaDelta = -staminaLoss;
          current.lastStaminaLossReason = staminaLoss ? (visual.message || h.message) : '';
          current.staminaFeedbackTimer = staminaLoss ? 1.25 : 0.65;
          if (staminaLoss) {
            player.hitFeedbackTimer = 0.85;
            player.lastDamage = staminaLoss;
            player.knockbackTimer = Math.max(player.knockbackTimer, 0.12);
            player.knockbackDirection = player.direction >= 0 ? -1 : 1;
          }
          current.cameraShakeTimer = Math.max(current.cameraShakeTimer, staminaLoss ? 0.16 : 0.08);
          current.cameraShakeStrength = Math.max(current.cameraShakeStrength, staminaLoss ? 0.28 : 0.16);
          addCombatEffect(current, {
            type: staminaLoss ? 'hazard-stamina' : 'hazard-warning',
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            text: staminaLoss ? `-${staminaLoss}` : timeLoss ? `-${timeLoss}s` : '!',
            color: staminaLoss ? '#ef4444' : '#f59e0b',
          });
          current.notice = `${visual.message || h.message}${staminaLoss ? ` -${staminaLoss} stamina.` : timeLoss ? ` -${timeLoss} seconds.` : ''}`;
          audioControls?.playError?.();
          if (current.resources.stamina <= 0) triggerJourneyRescue('Team stamina exhausted. Rescue dispatched.');
        }
      });
    }

    // Attacks
    let attackRect = null;
    if (current.attackQueued) {
      current.attackQueued = false;
      current.attackWindupTimer = ATTACK_WINDUP_DURATION;
      current.attackTimer = 0;
      current.attackRecoilTimer = 0;
      current.attackPhase = 'windup';
      current.attackCooldown = ATTACK_COOLDOWN;
      current.attackHitIds.clear();
      audioControls?.playAction?.();
    }
    if (current.attackTimer > 0) {
      attackRect = getAttackBox(player, 48, 30, player.direction);
      current.playerAttackBox = attackRect;
    } else {
      current.playerAttackBox = null;
    }

    const applyPlayerDamage = (amount, message, direction = 1) => {
      if (player.invulnerable > 0) return;
      current.resources.stamina = Math.max(0, current.resources.stamina - amount);
      player.invulnerable = INVULNERABLE_DURATION;
      player.hitFeedbackTimer = 0.75;
      player.lastDamage = amount;
      player.knockbackTimer = 0.22;
      player.knockbackDirection = direction;
      player.vx += direction * 115;
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.18);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.35);
      current.notice = message;
      addCombatEffect(current, {
        type: 'player-hit',
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        direction,
        color: '#f87171',
      });
      audioControls?.playError?.();
      if (current.resources.stamina <= 0) triggerJourneyRescue(message);
    };

    // Enemies
    current.enemies.forEach(e => {
      if (e.defeated) return;
      const wasEnemyAttacking = e.attackTimer > 0;
      e.hitFlash = Math.max(0, e.hitFlash - dt);
      e.stunTimer = Math.max(0, e.stunTimer - dt);
      e.attackWindup = Math.max(0, e.attackWindup - dt);
      e.attackTimer = Math.max(0, e.attackTimer - dt);
      e.attackCooldown = Math.max(0, e.attackCooldown - dt);
      e.attackRecovery = Math.max(0, e.attackRecovery - dt);
      e.knockbackTimer = Math.max(0, e.knockbackTimer - dt);
      if (wasEnemyAttacking && e.attackTimer <= 0) {
        e.attackRecovery = e.type === 'guardian' || e.type === 'statue' ? 0.42 : 0.28;
      }

      const distanceToPlayer = (player.x + player.width / 2) - (e.x + e.width / 2);
      const nearPlayer = Math.abs(distanceToPlayer) < (e.type === 'bat' ? 145 : 110) && Math.abs(player.y - e.y) < 70;

      if (e.stunTimer <= 0 && e.attackTimer <= 0 && e.attackWindup <= 0 && nearPlayer && e.attackCooldown <= 0) {
        e.attackWindup = e.type === 'guardian' || e.type === 'statue' ? 0.55 : 0.34;
        e.attackDirection = distanceToPlayer >= 0 ? 1 : -1;
        e.attackHasHit = false;
        e.attackReady = true;
        e.attackPattern = e.type === 'scarab'
          ? 'charge'
          : e.type === 'snake'
            ? 'lunge'
            : e.type === 'bat'
              ? 'swoop'
              : e.type === 'looter'
                ? 'shove'
                : 'slam';
        e.attackCooldown = e.type === 'scarab' ? 1.15 : e.type === 'bat' ? 1.35 : 1.45;
        current.notice = `${e.name} is winding up. Move or stun it.`;
      }

      if (e.attackReady && e.attackWindup <= 0 && e.attackTimer <= 0) {
        e.attackTimer = e.type === 'guardian' || e.type === 'statue' ? 0.38 : 0.25;
        e.attackReady = false;
      }

      if (e.attackTimer > 0) {
        const attackSpeed = e.type === 'scarab'
          ? 160
          : e.type === 'bat'
            ? 185
            : e.type === 'snake'
              ? 130
              : e.type === 'looter'
                ? 150
                : 70;
        e.x += e.attackDirection * attackSpeed * dt;
        const enemyAttackBox = getAttackBox(e, e.type === 'guardian' || e.type === 'statue' ? 44 : 34, e.type === 'bat' ? 30 : 24, e.attackDirection);
        if (!e.attackHasHit && rectsOverlap(enemyAttackBox, player)) {
          e.attackHasHit = true;
          applyPlayerDamage(e.damage, `${e.name} attack connected. Stamina lost.`, e.attackDirection);
        }
      }

      if (e.knockbackTimer > 0) {
        e.x += e.knockbackDirection * 95 * dt;
      }

      if (e.stunTimer <= 0 && e.attackWindup <= 0 && e.attackTimer <= 0 && e.attackRecovery <= 0) {
        e.x += e.direction * e.speed * dt;
        if (e.x <= e.patrolMin || e.x >= e.patrolMax) e.direction *= -1;
      }
      if (attackRect && !current.attackHitIds.has(e.id) && rectsOverlap(attackRect, e)) {
        current.attackHitIds.add(e.id);
        e.health -= 1;
        e.stunTimer = 0.8;
        e.hitFlash = 0.25;
        e.attackWindup = 0;
        e.attackTimer = 0;
        e.attackReady = false;
        e.attackCooldown = Math.max(e.attackCooldown, 0.6);
        e.attackRecovery = 0.45;
        e.knockbackTimer = 0.22;
        e.knockbackDirection = player.direction;
        e.x += player.direction * 18;
        current.hitStopTimer = 0.05;
        addCombatEffect(current, {
          type: e.health <= 0 ? 'defeat' : 'enemy-hit',
          x: e.x + e.width / 2,
          y: e.y + e.height / 2,
          direction: player.direction,
          color: e.health <= 0 ? '#facc15' : '#7dd3fc',
        });
        if (e.health <= 0) {
          e.defeated = true;
          current.defeatedEnemies.add(e.id);
          current.relicShardCount += e.shards;
          current.notice = `${e.name} defeated. +${e.shards} shards.`;
        } else {
          current.notice = `${e.name} stunned.`;
        }
      }
    });

    // Bosses
    current.miniBosses.forEach(b => {
      if (b.defeated) return;
      const wasBossAttacking = b.attackTimer > 0;
      b.hitFlash = Math.max(0, b.hitFlash - dt);
      b.stunTimer = Math.max(0, b.stunTimer - dt);
      b.attackWindup = Math.max(0, b.attackWindup - dt);
      b.attackTimer = Math.max(0, b.attackTimer - dt);
      b.attackCooldown = Math.max(0, b.attackCooldown - dt);
      b.attackRecovery = Math.max(0, b.attackRecovery - dt);
      b.knockbackTimer = Math.max(0, b.knockbackTimer - dt);
      b.vulnerabilityTimer = Math.max(0, (b.vulnerabilityTimer || 0) - dt);
      b.shieldTimer = Math.max(0, (b.shieldTimer || 0) - dt);
      if (wasBossAttacking && b.attackTimer <= 0) {
        const phase = getBossPhaseConfig(b);
        b.attackRecovery = phase.recovery;
        b.vulnerabilityTimer = phase.vulnerableAfter;
        addCombatEffect(current, {
          type: 'boss-vulnerable',
          x: b.x + b.width / 2,
          y: b.y + b.height / 2,
          color: '#22c55e',
        });
      }
      if (!b.awakened && Math.abs(b.x - player.x) < 400) {
        b.awakened = true;
        current.bossIntro = { id: b.id, title: b.name, message: b.intro, focusX: b.x };
        current.bossIntroTimer = 3;
      }

      const distanceToPlayer = (player.x + player.width / 2) - (b.x + b.width / 2);
      const bossNearPlayer = Math.abs(distanceToPlayer) < 155 && Math.abs(player.y - b.y) < 90;

      if (b.awakened && b.stunTimer <= 0 && b.attackTimer <= 0 && b.attackWindup <= 0 && bossNearPlayer && b.attackCooldown <= 0) {
        const phases = BOSS_ATTACK_PHASES[b.id] || DEFAULT_BOSS_ATTACK_PHASES;
        const phase = phases[b.attackCycleIndex % phases.length];
        b.attackPattern = phase.id;
        b.attackPhaseLabel = phase.label;
        b.attackKind = phase.kind;
        b.attackWindup = phase.windup;
        b.attackDirection = distanceToPlayer >= 0 ? 1 : -1;
        b.attackHasHit = false;
        b.attackReady = true;
        b.attackCooldown = phase.cooldown;
        b.shieldTimer = phase.shieldDuringWindup ? Math.min(0.55, phase.windup * 0.7) : 0;
        b.vulnerabilityTimer = 0;
        b.attackCycleIndex += 1;
        b.patternHistory = [...(b.patternHistory || []), phase.id].slice(-6);
        addCombatEffect(current, {
          type: 'boss-telegraph',
          x: b.x + b.width / 2,
          y: b.y + b.height / 2,
          color: phase.color || '#fb923c',
        });
        audioControls?.playAction?.();
        current.notice = `${b.name} telegraphs ${phase.label}. Watch, dodge, then counter.`;
      }

      if (b.attackReady && b.attackWindup <= 0 && b.attackTimer <= 0) {
        const phase = getBossPhaseConfig(b);
        b.attackTimer = phase.duration;
        b.attackReady = false;
      }

      if (b.attackTimer > 0) {
        const phase = getBossPhaseConfig(b);
        if (phase.kind === 'close') {
          b.x += b.attackDirection * phase.speed * dt;
        }
        const bossAttackBox = phase.kind === 'area'
          ? {
            x: b.x - 36,
            y: b.y + b.height - 48,
            width: b.width + 72,
            height: 54,
          }
          : getAttackBox(b, phase.range, phase.height, b.attackDirection);
        if (!b.attackHasHit && rectsOverlap(bossAttackBox, player)) {
          b.attackHasHit = true;
          applyPlayerDamage(Math.max(4, Math.round(b.damage * (phase.damageScale || 1))), `${b.name} ${phase.label} landed. Dodge the tell, then counter.`, b.attackDirection);
        }
      }

      if (b.knockbackTimer > 0) {
        b.x += b.knockbackDirection * 65 * dt;
      }

      if (b.awakened && b.stunTimer <= 0 && b.attackWindup <= 0 && b.attackTimer <= 0 && b.attackRecovery <= 0) {
        b.x += b.direction * b.speed * dt;
        if (b.x <= b.patrolMin || b.x >= b.patrolMax) b.direction *= -1;
      }
      if (attackRect && !current.attackHitIds.has(b.id) && rectsOverlap(attackRect, b)) {
        current.attackHitIds.add(b.id);
        const { shielded } = getBossVulnerabilityState(b);
        if (shielded) {
          b.hitFlash = 0.16;
          b.attackCooldown = Math.max(b.attackCooldown, 0.35);
          addCombatEffect(current, {
            type: 'boss-shield',
            x: b.x + b.width / 2,
            y: b.y + b.height / 2,
            color: '#7dd3fc',
          });
          current.notice = `${b.name}'s shield blocked the hit. Wait for the counter window.`;
          return;
        }
        b.health -= 1;
        b.hitFlash = 0.28;
        b.stunTimer = 0.75;
        b.attackWindup = 0;
        b.attackTimer = 0;
        b.attackReady = false;
        b.attackCooldown = Math.max(b.attackCooldown, 1.1);
        b.attackRecovery = 0.75;
        b.vulnerabilityTimer = 0.55;
        b.shieldTimer = 0;
        b.knockbackTimer = 0.18;
        b.knockbackDirection = player.direction;
        b.x += player.direction * 12;
        current.hitStopTimer = 0.06;
        addCombatEffect(current, {
          type: b.health <= 0 ? 'boss-defeat' : 'boss-hit',
          x: b.x + b.width / 2,
          y: b.y + b.height / 2,
          direction: player.direction,
          color: b.health <= 0 ? '#facc15' : '#fb923c',
        });
        current.notice = `${b.name} staggered.`;
        if (b.health <= 0) {
          b.defeated = true;
          current.defeatedMiniBosses.add(b.id);
          if (b.sectionId === 'dig-site-entrance') {
            current.completedObjectiveIds.add(b.sectionId);
          }
          current.relicShardCount += b.shards;
          current.notice = `${b.name} defeated. Path secured.`;
        }
      }
    });

    // Gates
    ROUTE_GATES.forEach(g => {
      if (!current.openedRouteGateIds.has(g.id) && rectsOverlap(player, g)) {
        const guidance = getGateGuidance(g, current);
        if (!guidance.activeGateLocked) {
          current.openedRouteGateIds.add(g.id);
          current.notice = `${g.name} opened.`;
        } else {
          player.x = g.x - player.width - 5;
          current.notice = guidance.notice;
        }
      }
    });

    // Final Goal
    if (rectsOverlap(player, GATE)) {
      current.completed = true;
      current.notice = 'Site Entrance reached. Report to Base Camp.';
      syncHud();
      onComplete?.([...current.fieldKit]);
    }

    // Time
    current.timeAccumulator += dt;
    if (current.timeAccumulator >= 1) {
      current.resources.time -= 1;
      current.timeAccumulator = 0;
      if (current.resources.time <= 0) triggerJourneyRescue('Time expired. Field team rescued.');
    }

  }, [briefingOpen, audioControls, onComplete, triggerJourneyRescue, getAttackBox, getBossPhaseConfig, getBossVulnerabilityState, getObjectiveProgress, getGateGuidance, addCombatEffect, getPlayerAttackState, syncHud]);

  const step = useCallback((ms) => {
    const dt = Math.min(ms / 1000, 0.05);
    update(dt);
    draw();
    onSnapshotChange?.(createJourneySnapshot());
    syncHud();
  }, [createJourneySnapshot, draw, onSnapshotChange, syncHud, update]);

  useEffect(() => {
    window.__advanceExpeditionJourney = step;
    window.__renderExpeditionJourneyState = () => createJourneySnapshot();
    return () => {
      delete window.__advanceExpeditionJourney;
      delete window.__renderExpeditionJourneyState;
    };
  }, [createJourneySnapshot, step]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (briefingOpen) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW', 'KeyJ', 'KeyK'].includes(e.code)) e.preventDefault();
      if (e.code === 'KeyJ' || e.code === 'KeyK') { queueAttack(); return; }
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e) => keysRef.current[e.code] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const frame = (t) => {
      if (!lastFrameRef.current) lastFrameRef.current = t;
      step(t - lastFrameRef.current);
      lastFrameRef.current = t;
      animationRef.current = requestAnimationFrame(frame);
    };
    animationRef.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, [briefingOpen, queueAttack, step]);

  const activeHudGate = ROUTE_GATES.find(gate => !gameState.openedRouteGateIds.has(gate.id));
  const activeHudGateGuidance = activeHudGate ? getGateGuidance(activeHudGate, gameState) : null;
  const staminaWarningState = getStaminaWarningState(gameState);

  return (
    <section className="expedition-journey-container" id="expedition-journey">
      <div className="expedition-journey-grid">
        <div className="expedition-sidebar">
          <div className="expedition-panel dossier-info">
            <h2 className="cinzel-header">Expedition Log</h2>
            <div className="expedition-stat-card">
              <div className="stat-label"><Gauge size={14} /> Stamina</div>
              <div className={`expedition-stat-bar ${staminaWarningState !== 'stable' ? 'stamina-alert' : ''}`}>
                <div className="expedition-stat-fill stamina-fill" style={{ width: `${gameState.resources.stamina}%` }} />
                {gameState.staminaFeedbackTimer > 0 && gameState.lastStaminaDelta < 0 && (
                  <span className="stamina-delta">-{Math.abs(gameState.lastStaminaDelta)}</span>
                )}
              </div>
              {staminaWarningState === 'low' && (
                <div className="stamina-warning-text">Low stamina</div>
              )}
            </div>
            <div className="expedition-stat-card">
              <div className="stat-label"><Sparkles size={14} /> Time</div>
              <div className="expedition-stat-bar">
                <div className="expedition-stat-fill time-fill" style={{ width: `${(gameState.resources.time / 900) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="expedition-panel inventory-panel">
            <h3 className="section-title"><Backpack size={16} /> Field Kit</h3>
            <ul className="expedition-tool-list">
              {JOURNEY_TOOLS.map(t => (
                <li key={t.id} className={gameState.collectedToolIds.has(t.id) ? 'is-collected' : ''}>
                  <span>{t.emoji} {t.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="expedition-panel objective-panel">
            <h3 className="section-title"><Map size={16} /> Status</h3>
            <div className="current-section-badge">
              {SECTIONS.find(s => s.id === gameState.currentSectionId)?.name || 'Surveying'}
            </div>
            <div className="objective-progress">
              <div>Shards: {gameState.relicShardCount} / 22</div>
              <div>Upgrades: {gameState.collectedUpgrades.size} / {UPGRADES.length}</div>
            </div>
            {activeHudGateGuidance && (
              <div className={`route-gate-hud ${activeHudGateGuidance.activeGateLocked ? 'is-locked' : 'is-ready'}`}>
                <div className="route-gate-hud-title">
                  {activeHudGateGuidance.activeGateName}
                </div>
                <ul className="route-gate-checklist">
                  {activeHudGateGuidance.gateRequirements.map(req => (
                    <li key={`${req.type}-${req.id}`} className={req.met ? 'is-met' : 'is-missing'}>
                      <span aria-hidden="true">{req.met ? '✓' : '○'}</span>
                      <span>{req.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="route-gate-hint">
                  {activeHudGateGuidance.activeGateLocked
                    ? activeHudGateGuidance.gateHint
                    : 'All route tasks are complete. Move through the seal.'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="expedition-main">
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="expedition-canvas" />
            
            <div className="journey-hud-overlay">
              <div className="hud-shards">
                <Gem size={18} className="text-amber-500" />
                <span>{gameState.relicShardCount}</span>
              </div>
              <div className={`hud-stamina ${staminaWarningState !== 'stable' ? 'stamina-alert' : ''}`}>
                <Gauge size={18} className="text-red-500" />
                <div className="hud-bar-bg">
                  <div className="hud-bar-fill stamina" style={{ width: `${gameState.resources.stamina}%` }} />
                </div>
                {gameState.staminaFeedbackTimer > 0 && gameState.lastStaminaDelta < 0 && (
                  <span className="hud-stamina-delta">-{Math.abs(gameState.lastStaminaDelta)}</span>
                )}
              </div>
            </div>

            {gameState.notice && (
              <div className="expedition-journey-notice animate-fade-in">
                <Sparkles size={16} />
                <span>{gameState.notice}</span>
              </div>
            )}
            
            {gameState.failed && (
              <div className="expedition-failure-overlay">
                <div className="expedition-panel failure-card">
                  <ShieldAlert size={48} className="text-red-600 mb-4" />
                  <h3 className="cinzel-header">Field Rescue Required</h3>
                  <p>{gameState.failureReason}</p>
                  <button className="expedition-begin-btn" onClick={respawnAtCheckpoint}>
                    Restart from Checkpoint
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="controls-hint">
            <kbd>W/A/S/D</kbd> Move & Jump • <kbd>J/K</kbd> Use Tool
          </div>
        </div>
      </div>

      {briefingOpen && (
        <div className="expedition-briefing-overlay">
          <div className="expedition-briefing-card animate-slide-up">
            <div className="briefing-header">
              <Flag className="text-amber-600" size={32} />
              <h1 className="cinzel-header">Lost Site Expedition</h1>
            </div>
            <div className="briefing-content">
              <p className="instruction-text">Navigate the ruins, recover relics, and secure the entrance to the dig site.</p>
              <div className="mission-dossier">
                <div className="dossier-tag">ACTIVE MISSION</div>
                <h2 className="mission-title">{mission.title}</h2>
                <p className="mission-desc">{mission.instruction}</p>
              </div>
            </div>
            <button className="expedition-begin-btn" onClick={() => setBriefingOpen(false)}>
              Initialize Expedition
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

ExpeditionJourney.tools = JOURNEY_TOOLS;
