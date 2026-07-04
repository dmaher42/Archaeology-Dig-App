import { PLAYER_ATTACK_COMBO_TIMINGS, PLAYER_ATTACK_TYPES, SCORPION_VENOM_ATTACK_PATTERN_TUNING, SCORPION_VENOM_SLOW_DURATION, SCORPION_VENOM_SLOW_MULTIPLIER, SCORPION_VENOM_SPIT_RANGE } from './journeyCombat.js';
import { BOSS_DOMAIN_ENEMY_FOCUS_PADDING, JOURNEY_EXTERIOR_SCENE_ID, SCARAB_QUEEN_ENEMY_FOCUS_PADDING, WORLD_WIDTH } from './journeyConstants';
import { BOSS_KEY_ITEMS, SCARAB_SEAL_TRIGGER } from './journeyDataRouter';
import { clamp } from './journeyUtils';
import { OPENING_PYRAMID_AIR_JUMP_ASSIST_ZONE } from './journeyChamberTriggers.js';

export const getPlayerAttackTiming = (sequenceIndex = 1) => {
  const timingIndex = Math.max(0, sequenceIndex - 1) % PLAYER_ATTACK_COMBO_TIMINGS.length;
  return PLAYER_ATTACK_COMBO_TIMINGS[timingIndex] || PLAYER_ATTACK_COMBO_TIMINGS[0];
};

export const resetPlayerCombo = (current) => {
  current.attackComboWindowTimer = 0;
  current.attackComboLanded = false;
  current.attackComboPreserved = false;
  current.attackComboStep = 0;
  current.attackComboFinisherActive = false;
  current.attackSequenceIndex = 0;
  current.attackQueuedType = PLAYER_ATTACK_TYPES.LIGHT;
  current.attackQueuedHeavyFollowupPrimed = false;
  current.attackType = PLAYER_ATTACK_TYPES.LIGHT;
  current.attackRange = 0;
  current.attackHeight = 0;
  current.attackBackReach = 0;
  current.attackYOffset = 0;
  current.attackDamage = null;
  current.heavyFollowupReadyTimer = 0;
  current.heavyFollowupCueTimer = 0;
};

export const DEFAULT_ENEMY_ATTACK_PATTERN = {
  id: 'strike',
  label: 'Strike',
  // Windups sit at ~0.55s+ so players can read the tell and choose an answer;
  // anything under ~0.45s reads as unreactable once cue-reading time is included.
  windup: 0.55,
  duration: 0.26,
  cooldown: 1.15,
  recovery: 0.38,
  vulnerableAfter: 0.42,
  speed: 110,
  range: 34,
  height: 24,
  protectedDuringAttack: true,
  color: '#fb923c',
};

export const ENEMY_ATTACK_PATTERNS = {
  scarab: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'charge',
    label: 'Charge',
    windup: 0.58,
    duration: 0.3,
    cooldown: 1.22,
    recovery: 0.56,
    vulnerableAfter: 0.62,
    speed: 185,
    range: 38,
    protectedDuringWindup: false,
  },
  scorpion: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'sting',
    label: 'Sting',
    windup: 0.6,
    duration: 0.3,
    cooldown: 1.15,
    recovery: 0.64,
    vulnerableAfter: 0.7,
    speed: 54,
    range: 28,
    height: 58,
    yOffset: -34,
    backReach: 38,
    damageScale: 1.45,
    color: '#d97706',
    protectedDuringWindup: false,
  },
  'sand-wisp': {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'sand-burst',
    label: 'Sand Burst',
    windup: 0.5,
    duration: 0.24,
    cooldown: 1.36,
    recovery: 0.58,
    vulnerableAfter: 0.64,
    speed: 150,
    range: 38,
    height: 30,
    color: '#facc15',
    protectedDuringWindup: false,
  },
  snake: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'lunge',
    label: 'Lunge',
    windup: 0.62,
    duration: 0.28,
    cooldown: 1.12,
    recovery: 0.6,
    vulnerableAfter: 0.68,
    speed: 166,
    range: 52,
    protectedDuringWindup: false,
  },
  bat: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'swoop',
    label: 'Swoop',
    windup: 0.5,
    duration: 0.32,
    cooldown: 0.92,
    recovery: 0.48,
    vulnerableAfter: 0.52,
    speed: 190,
    range: 38,
    height: 30,
  },
  guardian: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'slam',
    label: 'Heavy Slam',
    windup: 0.84,
    duration: 0.4,
    cooldown: 1.70,
    recovery: 0.9,
    vulnerableAfter: 0.95,
    speed: 52,
    range: 50,
    height: 32,
    shieldDuringWindup: true,
  },
  looter: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'dash',
    label: 'Dash',
    windup: 0.46,
    duration: 0.24,
    cooldown: 1.02,
    recovery: 0.34,
    vulnerableAfter: 0.38,
    speed: 165,
    range: 36,
  },
  bes: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'guardian-swipe',
    label: 'Guardian Swipe',
    windup: 0.64,
    duration: 0.34,
    cooldown: 1.46,
    recovery: 0.72,
    vulnerableAfter: 0.82,
    speed: 74,
    range: 50,
    height: 64,
    yOffset: -28,
    backReach: 28,
    damageScale: 1.28,
    shieldDuringWindup: true,
  },
  mummy: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'khopesh-sweep',
    label: 'Khopesh Sweep',
    windup: 0.76,
    duration: 0.34,
    cooldown: 1.28,
    recovery: 0.78,
    vulnerableAfter: 0.86,
    speed: 58,
    range: 44,
    height: 58,
    yOffset: -24,
    backReach: 24,
    damageScale: 1.25,
    shieldDuringWindup: true,
    color: '#d9a441',
  },
  statue: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'pulse-slam',
    label: 'Pulse Slam',
    windup: 0.92,
    duration: 0.42,
    cooldown: 1.77,
    recovery: 0.96,
    vulnerableAfter: 1,
    speed: 46,
    range: 52,
    height: 34,
    shieldDuringWindup: true,
  },
};

export const HEAVY_ATTACK_PATTERNS = {
  scarab: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'heavy-charge',
    label: 'Heavy Charge',
    windup: 0.82,
    duration: 0.38,
    cooldown: 2.1,
    recovery: 0.78,
    vulnerableAfter: 0.9,
    speed: 240,
    range: 44,
    damageScale: 1.6,
    shieldDuringWindup: true,
    protectedDuringWindup: true,
    color: '#b45309',
  },
  scorpion: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'power-sting',
    label: 'Power Sting',
    windup: 1.0,
    duration: 0.36,
    cooldown: 2.2,
    recovery: 0.88,
    vulnerableAfter: 0.96,
    speed: 48,
    range: 32,
    height: 68,
    yOffset: -38,
    backReach: 44,
    damageScale: 1.7,
    shieldDuringWindup: true,
    protectedDuringWindup: true,
    color: '#b45309',
  },
  snake: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'deep-lunge',
    label: 'Deep Lunge',
    windup: 0.9,
    duration: 0.32,
    cooldown: 2.0,
    recovery: 0.82,
    vulnerableAfter: 0.88,
    speed: 220,
    range: 72,
    damageScale: 1.6,
    shieldDuringWindup: false,
    protectedDuringWindup: false,
    color: '#b45309',
  },
  bat: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'dive-swoop',
    label: 'Dive Swoop',
    windup: 0.72,
    duration: 0.38,
    cooldown: 1.9,
    recovery: 0.68,
    vulnerableAfter: 0.76,
    speed: 260,
    range: 50,
    height: 40,
    damageScale: 1.5,
    shieldDuringWindup: false,
    protectedDuringWindup: false,
    color: '#b45309',
  },
  'sand-wisp': {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'sand-storm-burst',
    label: 'Sand Storm',
    windup: 0.86,
    duration: 0.3,
    cooldown: 2.1,
    recovery: 0.78,
    vulnerableAfter: 0.84,
    speed: 180,
    range: 56,
    height: 44,
    damageScale: 1.5,
    shieldDuringWindup: false,
    protectedDuringWindup: false,
    color: '#b45309',
  },
  guardian: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'heavy-slam',
    label: 'Heavy Slam',
    windup: 1.2,
    duration: 0.48,
    cooldown: 2.6,
    recovery: 1.2,
    vulnerableAfter: 1.3,
    speed: 44,
    range: 62,
    height: 40,
    damageScale: 1.7,
    shieldDuringWindup: true,
    protectedDuringWindup: true,
    color: '#92400e',
  },
  mummy: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'khopesh-cleave',
    label: 'Khopesh Cleave',
    windup: 1.1,
    duration: 0.44,
    cooldown: 2.5,
    recovery: 1.1,
    vulnerableAfter: 1.2,
    speed: 50,
    range: 58,
    height: 72,
    yOffset: -28,
    backReach: 32,
    damageScale: 1.7,
    shieldDuringWindup: true,
    protectedDuringWindup: true,
    color: '#92400e',
  },
  looter: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'ambush-dash',
    label: 'Ambush',
    windup: 0.22,
    duration: 0.28,
    cooldown: 1.8,
    recovery: 0.5,
    vulnerableAfter: 0.56,
    speed: 240,
    range: 48,
    damageScale: 1.5,
    shieldDuringWindup: false,
    protectedDuringWindup: false,
    color: '#b45309',
  },
  bes: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'bes-heavy-swipe',
    label: 'Heavy Swipe',
    windup: 1.1,
    duration: 0.42,
    cooldown: 2.4,
    recovery: 1.1,
    vulnerableAfter: 1.2,
    speed: 62,
    range: 64,
    height: 76,
    yOffset: -32,
    backReach: 34,
    damageScale: 1.8,
    shieldDuringWindup: true,
    protectedDuringWindup: true,
    color: '#92400e',
  },
  statue: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'pulse-slam-heavy',
    label: 'Curse Slam',
    windup: 1.3,
    duration: 0.52,
    cooldown: 2.8,
    recovery: 1.2,
    vulnerableAfter: 1.3,
    speed: 38,
    range: 64,
    height: 40,
    damageScale: 1.8,
    shieldDuringWindup: true,
    protectedDuringWindup: true,
    color: '#92400e',
  },
};

export const ENEMY_TYPE_STAKE_MESSAGES = {
  scorpion: 'Scorpion venom slows Asha. If a scarab is nearby, its charge gets faster.',
  'sand-wisp': 'Sand wisps tense before they burst. Wait for the opening.',
  snake: 'Snake lunges from mid-range. Watch the coil.',
  bat: 'Beware: Bats swoop across gaps. Watch their movement.',
  looter: 'Beware: Rival scouts dash quickly. Counter after they miss.',
  mummy: 'Warrior mummies guard the threshold. Wait for the sweep, then counter.',
  guardian: 'Stone guardians are slow blockers. Wait for the opening.',
  statue: 'Cursed statues slam hard. Move carefully.',
};

export const easeCinematicStep = (value) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

export const getScarabQueenEmergenceBeat = (introProgress) => {
  const sceneProgress = clamp(1 - introProgress, 0, 1);
  return {
    sceneProgress,
    buriedSealCrack: easeCinematicStep(clamp((sceneProgress - 0.12) / 0.24, 0, 1)),
    glyphGlow: easeCinematicStep(clamp((sceneProgress - 0.22) / 0.26, 0, 1)),
    sandEruption: easeCinematicStep(clamp((sceneProgress - 0.36) / 0.24, 0, 1)),
    queenRise: easeCinematicStep(clamp((sceneProgress - 0.48) / 0.34, 0, 1)),
    finalHold: easeCinematicStep(clamp((sceneProgress - 0.78) / 0.18, 0, 1)),
  };
};

export const SCORPION_VENOM_ATTACK_PATTERN = {
  ...DEFAULT_ENEMY_ATTACK_PATTERN,
  id: 'venom-spit',
  label: 'Venom Spit',
  ...SCORPION_VENOM_ATTACK_PATTERN_TUNING,
  speed: 0,
  range: SCORPION_VENOM_SPIT_RANGE,
  height: 44,
  yOffset: -28,
  backReach: 8,
  slowDuration: SCORPION_VENOM_SLOW_DURATION,
  slowMultiplier: SCORPION_VENOM_SLOW_MULTIPLIER,
  ranged: true,
  color: '#84cc16',
  protectedDuringAttack: false,
  protectedDuringWindup: false,
};

export const isNormalEnemyInsideBossFocus = (enemy, bossDomain) => {
  if (!enemy || !bossDomain) return false;
  const focusPadding = bossDomain.bossId === SCARAB_SEAL_TRIGGER.bossId
    ? SCARAB_QUEEN_ENEMY_FOCUS_PADDING
    : BOSS_DOMAIN_ENEMY_FOCUS_PADDING;
  const focusStart = (bossDomain.arenaStart ?? 0) - focusPadding;
  const focusEnd = (bossDomain.arenaEnd ?? WORLD_WIDTH) + focusPadding;
  const enemyCenter = enemy.x + enemy.width / 2;
  return enemyCenter >= focusStart && enemyCenter <= focusEnd;
};

export const JOURNEY_SCENE_IDS = Object.freeze({
  EXTERIOR: JOURNEY_EXTERIOR_SCENE_ID,
  TEMPLE_THRESHOLD_HALL: 'temple-threshold-hall',
  MUMMIFICATION_CHAMBER: 'mummification-chamber',
  FORGOTTEN_MURAL_CHAMBER: 'forgotten-mural-chamber',
  SCRIBE_LOCKED_CHAMBER: 'scribe-locked-chamber',
});

export const getJourneySceneId = (current) => current?.currentSceneId || JOURNEY_SCENE_IDS.EXTERIOR;
export const isTempleThresholdHallScene = (current) => getJourneySceneId(current) === JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL;
export const isMummificationChamberScene = (current) => getJourneySceneId(current) === JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER;
export const isForgottenMuralChamberScene = (current) => getJourneySceneId(current) === JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER;
export const isScribeLockedChamberScene = (current) => getJourneySceneId(current) === JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER;
export const isInteriorChamberScene = (current) => (
  isTempleThresholdHallScene(current)
  || isMummificationChamberScene(current)
  || isForgottenMuralChamberScene(current)
  || isScribeLockedChamberScene(current)
);
export const getEntitySceneId = (entity) => entity?.sceneId || JOURNEY_SCENE_IDS.EXTERIOR;
export const isEntityActiveInScene = (entity, current) => getEntitySceneId(entity) === getJourneySceneId(current);
export const isStoryPropRouteGateVisibilityMet = (prop, current) => {
  const openedRouteGateIds = current?.openedRouteGateIds;
  if (prop?.showWhenRouteGateOpenId && !openedRouteGateIds?.has?.(prop.showWhenRouteGateOpenId)) return false;
  if (prop?.hideWhenRouteGateOpenId && openedRouteGateIds?.has?.(prop.hideWhenRouteGateOpenId)) return false;
  return true;
};

export const isPlatformAvailable = (platform, current) => (
  isEntityActiveInScene(platform, current)
  && (!platform.requiresUpgrade || current.collectedUpgrades.has(platform.requiresUpgrade))
  && (!platform.requiresObjective || current.collectedObjectiveIds.has(platform.requiresObjective))
  && !current.collapsedPlatformIds?.has(platform.id || platform.label)
);

export const isOpeningPyramidAirJumpAssistAvailable = (current, player, targetCivilisation) => {
  if (targetCivilisation !== 'Ancient Egypt' || current.scarabSealActivated) return false;
  const footY = player.y + player.height;
  return player.x >= OPENING_PYRAMID_AIR_JUMP_ASSIST_ZONE.minX
    && player.x <= OPENING_PYRAMID_AIR_JUMP_ASSIST_ZONE.maxX
    && footY >= OPENING_PYRAMID_AIR_JUMP_ASSIST_ZONE.minFootY
    && footY <= OPENING_PYRAMID_AIR_JUMP_ASSIST_ZONE.maxFootY;
};

export const isHazardAvailable = (hazard, current) => (
  isEntityActiveInScene(hazard, current)
  && (!hazard.revealedByScarabSeal || current.scarabSealActivated)
);

export const ROME_GATE_HINTS = {
  objective: {
    'via-sacra': 'One Via Sacra evidence piece is still behind you on the Roman street.',
    'forum-ruins': 'One Forum record is still behind you among the ruined public buildings.',
    'subterranean-thermae': 'One thermae clue is still behind you near the steam channels.',
    'basilica-interior': 'One basilica archive clue is still behind you near the civic hall.',
    'sealed-vault': 'The vault will not open until the buried archive evidence is restored.',
  },
  shards: 'Search the Via Sacra route and Forum-side platforms for the next evidence shard.',
};

export const CHINA_BOSS_KEY_ITEM_COPY = {
  'brush-handle': { name: 'Survey Brush Handle', checklistLabel: 'Survey Brush Handle' },
  'trowel-blade': { name: 'Archive Trowel Blade', checklistLabel: 'Archive Trowel Blade' },
  'measuring-cord': { name: 'River Measuring Cord', checklistLabel: 'River Measuring Cord' },
  'field-notebook-clasp': { name: 'Field Notebook Clasp', checklistLabel: 'Field Notebook Clasp' },
  'camera-lens': { name: 'Survey Camera Lens', checklistLabel: 'Survey Camera Lens' },
  // Section One dynasty mandates
  'river-jade-token': { name: 'River Jade Token', checklistLabel: 'River Jade Token' },
  'shang-bronze-ladle': { name: 'Shang Bronze Ladle', checklistLabel: 'Shang Bronze Ladle' },
  'zhou-mandate-scroll': { name: 'Zhou Mandate Scroll', checklistLabel: 'Zhou Mandate Scroll' },
  'qin-imperial-mandate': { name: 'Qin Imperial Mandate', checklistLabel: 'Qin Imperial Mandate' },
  'han-invention-compass': { name: 'Han Invention Compass', checklistLabel: 'Han Invention Compass' },
};

export const getBossRewardProgress = (current) => {
  const recoveredCount = BOSS_KEY_ITEMS.filter(item => (
    current.collectedBossKeyIds?.has(item.id)
      || current.bossKeyItems?.some(keyItem => keyItem.id === item.id && keyItem.collected)
  )).length;

  return {
    recoveredCount,
    totalCount: BOSS_KEY_ITEMS.length,
    complete: recoveredCount >= BOSS_KEY_ITEMS.length,
  };
};

export const shuffleGuardianQuestionOptions = (question) => {
  const options = question.options.map((text, originalIndex) => ({
    id: `${question.id}-${originalIndex}`,
    text,
    originalIndex,
  }));

  for (let index = options.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
  }

  return {
    ...question,
    shuffledOptions: options,
  };
};

export const SECTION_MUSIC_CUES = {
  // Egypt
  'desert-entry':     'desert',
  'ruined-temple':    'temple',
  catacombs:          'catacombs',
  'escape-sequence':  'escape',
  'dig-site-entrance': 'baseCamp',
  // China — Section One frontier route
  'yellow-river-frontier': 'bamboo-forest',
  'rammed-earth-wall': 'rammed-earth-gate',
  'frontier-settlement': 'rammed-earth-gate',
  'hidden-archive': 'terracotta-tomb',
  'imperial-gate': 'terracotta-tomb',
  // Legacy China section ids (kept for compatibility)
  'bamboo-forest': 'bamboo-forest',
  'rammed-earth-gate': 'rammed-earth-gate',
  'terracotta-tomb': 'terracotta-tomb',
  // Rome
  'via-sacra':            'romanRoad',
  'forum-ruins':          'romanForum',
  'subterranean-thermae': 'romanThermae',
  'basilica-interior':    'romanBasilica',
  'sealed-vault':         'romanVaultBoss',
};

export const JOURNEY_POLISH_VERSION = 'journey-polish-2026-05-11';
export const CHINA_BACKGROUND_POLISH_VERSION = 'china-background-composited-art-2026-05-15';
export const EGYPT_AMBIENT_LIFE_VERSION = 'egypt-ambient-life-start-route-2026-05-15';

export const seededStepRandom = (seed = 1, cycle = 0, salt = 0) => {
  const value = Math.sin(seed * 12.9898 + cycle * 78.233 + salt * 37.719) * 43758.5453;
  return value - Math.floor(value);
};

export const updateHostileStepMultiplier = (hostile, dt, { boss = false } = {}) => {
  hostile.stepTimer = (hostile.stepTimer || 0) + dt;
  hostile.stepShiftTimer = Math.max(0, (hostile.stepShiftTimer || 0) - dt);
  hostile.stepPauseTimer = Math.max(0, (hostile.stepPauseTimer || 0) - dt);

  if (hostile.stepShiftTimer <= 0) {
    hostile.stepCycle = (hostile.stepCycle || 0) + 1;
    const speedRoll = seededStepRandom(hostile.stepSeed, hostile.stepCycle, 1);
    const durationRoll = seededStepRandom(hostile.stepSeed, hostile.stepCycle, 2);
    const pauseRoll = seededStepRandom(hostile.stepSeed, hostile.stepCycle, 3);
    hostile.stepSpeedMultiplier = boss
      ? 0.9 + speedRoll * 0.22
      : 0.8 + speedRoll * 0.34;
    hostile.stepShiftTimer = boss
      ? 0.85 + durationRoll * 1.15
      : 0.55 + durationRoll * 0.9;
    hostile.stepPauseTimer = pauseRoll > (boss ? 0.78 : 0.68)
      ? (boss ? 0.12 + pauseRoll * 0.1 : 0.14 + pauseRoll * 0.16)
      : 0;
  }

  const rhythm = 1 + Math.sin((hostile.stepCycle || 0) + hostile.stepSeed * 0.01 + hostile.stepTimer * (hostile.stepRhythm || 1.5)) * (boss ? 0.07 : 0.11);
  const pauseMultiplier = hostile.stepPauseTimer > 0 ? (boss ? 0.45 : 0.28) : 1;
  return Math.max(boss ? 0.7 : 0.55, (hostile.stepSpeedMultiplier || 1) * rhythm * pauseMultiplier);
};
export const COLLECTIBLE_SCALE_TUNING_VERSION = 'journey-collectible-shard-atlas-upgrade-2026-05-21';
export const RELIC_SHARD_SCALE = 1.08;
