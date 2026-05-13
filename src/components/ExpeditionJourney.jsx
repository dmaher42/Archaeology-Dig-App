import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Backpack,
  CheckCircle2,
  ChevronDown,
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
  PLAYER_SPRITE_DRAW_HEIGHT,
  PLAYER_SPRITE_FRAME_COUNT,
  PLAYER_SPRITE_FRAME_HEIGHT,
  PLAYER_SPRITE_FRAME_WIDTH,
  PLAYER_SPRITE_SCALE,
  PLAYER_SPRITE_SRC,
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
  updatePlayerAnimation,
} from './expedition-journey/journeyUtils';

import {
  clampCameraX,
  getCameraFollowTarget as getLayoutCameraFollowTarget,
  getCanvasScaleState,
  isHorizontallyVisible,
  JOURNEY_CAMERA,
  JOURNEY_HUD_SAFE_AREA,
  JOURNEY_RENDER_TARGET,
  JOURNEY_VIEWPORT,
  JOURNEY_WORLD_LAYOUT,
  placeGateOnGround,
  worldToScreenX,
} from './expedition-journey/journeyLayout';

import {
  ATLAS_TUNING_VERSION,
  createEnvironmentAssetState,
  DESERT_VISUAL_TUNING_VERSION,
  drawAtlasRegion,
  ENVIRONMENT_ATLAS_JSON,
  getEnvironmentAssetKeyForHazard,
  getEnvironmentAssetKeyForPlatform,
  getEnvironmentAssetKeyForStoryProp,
  getMissingEnvironmentAssets,
  JOURNEY_ASSET_GROUNDING_VERSION,
  loadEnvironmentAssetPack,
} from './expedition-journey/journeyRenderAssets';

import {
  CATACOMBS_BACKGROUND_ATLAS_JSON,
  createDesertBackgroundAssetState,
  DESERT_BACKGROUND_DEPTH_MODE,
  DIG_SITE_BACKGROUND_ATLAS_JSON,
  drawDesertBackgroundLayer,
  ESCAPE_BACKGROUND_ATLAS_JSON,
  getMissingSectionBackgroundAssets,
  getSectionBackgroundAssets,
  JOURNEY_BACKGROUND_DEPTH_MODE,
  loadDesertBackgroundAssetPack,
  RUINED_TEMPLE_BACKGROUND_ATLAS_JSON,
} from './expedition-journey/journeyBackgroundAssets';

import {
  ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON,
  BOSS_SPRITE_ATLAS_JSON,
  BOSS_SPRITE_ATLAS_VERSION,
  createBossSpriteState,
  getAncientConstructDrawBox,
  getAncientConstructSpriteFrame,
  getBossSpritePack,
  getMissingBossSpriteAssets,
  getScarabQueenDrawBox,
  getScarabQueenSpriteFrame,
  getStoneGuardianDrawBox,
  getStoneGuardianSpriteFrame,
  loadBossSpritePack,
  STONE_GUARDIAN_SPRITE_ATLAS_JSON,
} from './expedition-journey/journeyBossSprites';

import {
  createEnemySpriteState,
  ENEMY_SPRITE_ATLAS_JSON,
  ENEMY_SPRITE_ATLAS_VERSION,
  getEnemySpriteDrawBox,
  getEnemySpriteFamily,
  getEnemySpriteFrame,
  getMissingEnemySpriteAssets,
  loadEnemySpritePack,
} from './expedition-journey/journeyEnemySprites';

import {
  COLLECTIBLE_ATLAS_JSON,
  COLLECTIBLE_SPRITE_ATLAS_VERSION,
  createCollectibleSpriteState,
  drawCollectibleAtlasRegion,
  getMissingCollectibleSpriteAssets,
  getObjectiveSpriteKey,
  getToolSpriteKey,
  getUpgradeSpriteKey,
  loadCollectibleSpritePack,
} from './expedition-journey/journeyCollectibleSprites';

import {
  createPlayerWeaponSpriteState,
  drawPlayerWeaponAtlasRegion,
  getMissingPlayerWeaponSpriteAssets,
  getPlayerWeaponFrameKey,
  loadPlayerWeaponSpritePack,
  PLAYER_WEAPON_ATLAS_JSON,
  PLAYER_WEAPON_ATLAS_VERSION,
} from './expedition-journey/journeyPlayerWeaponSprites';

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

const COMBAT_CHALLENGE_MODE = 'skill-windows-v1';
const PLAYER_ATTACK_STAMINA_COST = 1;
const MISSED_ATTACK_EXTRA_STAMINA_COST = 1;
const PROTECTED_HIT_EXTRA_STAMINA_COST = 1;

const DEFAULT_ENEMY_ATTACK_PATTERN = {
  id: 'strike',
  label: 'Strike',
  windup: 0.38,
  duration: 0.26,
  cooldown: 1.35,
  recovery: 0.38,
  vulnerableAfter: 0.42,
  speed: 110,
  range: 34,
  height: 24,
  protectedDuringAttack: true,
  color: '#fb923c',
};

const ENEMY_ATTACK_PATTERNS = {
  scarab: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'charge',
    label: 'Charge',
    windup: 0.3,
    duration: 0.24,
    cooldown: 1.25,
    recovery: 0.34,
    vulnerableAfter: 0.42,
    speed: 170,
  },
  snake: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'lunge',
    label: 'Lunge',
    windup: 0.46,
    duration: 0.3,
    cooldown: 1.45,
    recovery: 0.46,
    vulnerableAfter: 0.5,
    speed: 138,
  },
  bat: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'swoop',
    label: 'Swoop',
    windup: 0.36,
    duration: 0.32,
    cooldown: 1.42,
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
    windup: 0.72,
    duration: 0.4,
    cooldown: 1.7,
    recovery: 0.72,
    vulnerableAfter: 0.78,
    speed: 68,
    range: 46,
    height: 32,
    shieldDuringWindup: true,
  },
  looter: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'dash',
    label: 'Dash',
    windup: 0.3,
    duration: 0.24,
    cooldown: 1.2,
    recovery: 0.34,
    vulnerableAfter: 0.38,
    speed: 165,
    range: 36,
  },
  statue: {
    ...DEFAULT_ENEMY_ATTACK_PATTERN,
    id: 'pulse-slam',
    label: 'Pulse Slam',
    windup: 0.82,
    duration: 0.42,
    cooldown: 1.85,
    recovery: 0.82,
    vulnerableAfter: 0.88,
    speed: 56,
    range: 48,
    height: 34,
    shieldDuringWindup: true,
  },
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

const SECTION_MUSIC_CUES = {
  'desert-entry': 'desert',
  'ruined-temple': 'temple',
  catacombs: 'catacombs',
  'escape-sequence': 'escape',
  'dig-site-entrance': 'baseCamp',
};

const JOURNEY_POLISH_VERSION = 'journey-polish-2026-05-11';
const COLLECTIBLE_SCALE_TUNING_VERSION = 'journey-collectible-scale-tuning-2026-05-12';
const RELIC_SHARD_SCALE = 0.52;
const FIELD_TOOL_SCALE = 0.72;
const UPGRADE_SCALE = 0.76;
const OBJECTIVE_MARKER_SCALE = 0.78;
const LORE_TABLET_SCALE = 0.78;
const PICKUP_GLOW_SCALE = 0.62;

const COLLECTIBLE_VISUAL_BASE = {
  relicShard: {
    size: Math.round(32 * RELIC_SHARD_SCALE),
    ringSize: 0,
    glowAlpha: 0,
    shadowAlpha: 0.09,
    bobAmplitude: 2,
    sparkleAlpha: 0.1,
    sparkleSize: 7,
    anchorYOffset: 18,
    nearGlowDistance: 90,
  },
  fieldTool: {
    size: Math.round(46 * FIELD_TOOL_SCALE),
    fieldGuideSize: Math.round(52 * FIELD_TOOL_SCALE),
    ringSize: 0,
    glowAlpha: 0,
    shadowAlpha: 0.18,
    bobAmplitude: 2.4,
    sparkleAlpha: 0.22,
    sparkleSize: 11,
    anchorYOffset: 22,
    nearGlowDistance: 125,
  },
  upgrade: {
    size: Math.round(46 * UPGRADE_SCALE),
    ringSize: 0,
    glowAlpha: 0,
    shadowAlpha: 0.16,
    bobAmplitude: 2.2,
    sparkleAlpha: 0.2,
    sparkleSize: 11,
    anchorYOffset: 22,
    nearGlowDistance: 120,
  },
  objective: {
    size: Math.round(42 * OBJECTIVE_MARKER_SCALE),
    mapTabletSize: Math.round(48 * OBJECTIVE_MARKER_SCALE),
    ringSize: 0,
    glowAlpha: 0,
    shadowAlpha: 0.17,
    bobAmplitude: 1.8,
    sparkleAlpha: 0.14,
    sparkleSize: 10,
    anchorYOffset: 22,
    nearGlowDistance: 150,
  },
  loreTablet: {
    size: Math.round(42 * LORE_TABLET_SCALE),
    ringSize: Math.round(54 * PICKUP_GLOW_SCALE),
    glowAlpha: 0.24,
    shadowAlpha: 0.15,
    bobAmplitude: 1.8,
    sparkleAlpha: 0.12,
    sparkleSize: 10,
    anchorYOffset: 22,
    nearGlowDistance: 130,
  },
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

const HAZARD_GROUNDING = {
  'thorn-bush': {
    xPad: 6,
    yOffset: 12,
    widthPad: 12,
    heightPad: 20,
    shadow: 0.2,
    dustWidth: 0.88,
    filter: 'sepia(8%) saturate(84%) brightness(90%)',
    warning: 'none',
  },
  'sand-pit': {
    xPad: 10,
    yOffset: 2,
    widthPad: 20,
    heightPad: -2,
    shadow: 0.08,
    dustWidth: 1.08,
    filter: 'sepia(12%) saturate(78%) brightness(94%)',
    warning: 'none',
  },
  'spike-trap': {
    xPad: 8,
    yOffset: 8,
    widthPad: 16,
    heightPad: 14,
    shadow: 0.24,
    dustWidth: 0.9,
    filter: 'sepia(10%) saturate(82%) brightness(88%)',
    warning: 'none',
  },
  'rolling-stones': {
    xPad: 9,
    yOffset: 11,
    widthPad: 18,
    heightPad: 15,
    shadow: 0.26,
    dustWidth: 0.95,
    filter: 'sepia(8%) saturate(80%) brightness(88%)',
    warning: 'none',
  },
  'falling-blocks': {
    xPad: 10,
    yOffset: 10,
    widthPad: 20,
    heightPad: 14,
    shadow: 0.25,
    dustWidth: 0.94,
    filter: 'sepia(8%) saturate(78%) brightness(88%)',
    warning: 'none',
  },
  'dark-gap': {
    xPad: 8,
    yOffset: -1,
    widthPad: 16,
    heightPad: -2,
    shadow: 0.06,
    dustWidth: 1.04,
    filter: 'sepia(6%) saturate(70%) brightness(82%)',
    warning: 'none',
  },
  'dust-wave': {
    xPad: 8,
    yOffset: 1,
    widthPad: 16,
    heightPad: 6,
    shadow: 0.08,
    dustWidth: 1.08,
    filter: 'sepia(14%) saturate(72%) brightness(96%) opacity(0.78)',
    warning: 'none',
  },
  'bat-cloud': {
    xPad: 2,
    yOffset: 0,
    widthPad: 4,
    heightPad: 2,
    shadow: 0.02,
    dustWidth: 0,
    filter: 'saturate(72%) brightness(82%) opacity(0.74)',
    warning: 'none',
  },
  'loose-slope': {
    xPad: 9,
    yOffset: 3,
    widthPad: 18,
    heightPad: 4,
    shadow: 0.1,
    dustWidth: 1,
    filter: 'sepia(10%) saturate(74%) brightness(90%)',
    warning: 'none',
  },
};

const PROP_GROUNDING_CONFIG = {
  ruins: { width: 104, height: 94, yOffset: 92, alpha: 0.42, depth: 'background', tint: 'dust', shadow: 0.1, dust: 0.52 },
  camp: { width: 86, height: 58, yOffset: 18, alpha: 0.64, depth: 'background', tint: 'dust', shadow: 0.12, dust: 0.58 },
  door: { width: 118, height: 150, yOffset: 132, alpha: 0.48, depth: 'background', tint: 'dust', shadow: 0.12, dust: 0.58 },
  statue: { width: 70, height: 90, yOffset: 54, alpha: 0.58, depth: 'background', tint: 'stone', shadow: 0.12, dust: 0.58 },
  bridge: { width: 168, height: 62, yOffset: 20, alpha: 0.62, depth: 'midground', tint: 'warm', shadow: 0.2, dust: 0.72 },
  lights: { width: 42, height: 62, yOffset: 18, alpha: 0.48, depth: 'background', tint: 'cool', shadow: 0.08, dust: 0.44 },
  banners: { width: 76, height: 48, yOffset: 28, alpha: 0.5, depth: 'background', tint: 'dust', shadow: 0.08, dust: 0.48 },
  mural: { depth: 'background' },
  glyphs: { depth: 'background' },
  eyes: { depth: 'background' },
  sign: { depth: 'midground' },
};

const getStoryPropDepth = (prop) => (
  (PROP_GROUNDING_CONFIG[prop.type] || {}).depth || 'midground'
);

const DECORATIVE_PROP_LAYER_MODE = 'background-midground-depth-v2';
const PROP_DEPTH_TUNING_VERSION = 'journey-decorative-depth-2026-05-12';

const SECTION_PARALLAX_LAYERS = {
  'ruined-temple': [
    { key: 'templeSky', y: 0, height: CANVAS_HEIGHT, parallax: 0, alpha: 1 },
  ],
  catacombs: [
    { key: 'undergroundAtmosphere', y: 0, height: CANVAS_HEIGHT, parallax: 0, alpha: 1 },
  ],
  'escape-sequence': [
    { key: 'dangerAtmosphere', y: 0, height: CANVAS_HEIGHT, parallax: 0, alpha: 1 },
  ],
  'dig-site-entrance': [
    { key: 'skyLayer', y: 0, height: CANVAS_HEIGHT, parallax: 0, alpha: 1 },
  ],
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

const getCameraFollowTarget = (current) => {
  const playerCenterX = current.player.x + current.player.width / 2;
  if (current.bossIntroTimer > 0 && current.bossIntro?.focusX) {
    return getLayoutCameraFollowTarget({
      playerCenterX,
      bossIntroFocusX: current.bossIntro.focusX,
    });
  }

  const nearbyBoss = current.miniBosses?.find(boss => (
    boss.awakened
    && !boss.defeated
    && Math.abs((boss.x + boss.width / 2) - playerCenterX) < 620
  ));
  if (nearbyBoss) {
    const bossCenterX = nearbyBoss.x + nearbyBoss.width / 2;
    const focusX = playerCenterX * 0.45 + bossCenterX * 0.55;
    return {
      mode: 'boss-focus',
      focusTarget: Math.round(bossCenterX),
      targetCameraX: clampCameraX(focusX - CANVAS_WIDTH * 0.5),
    };
  }

  return getLayoutCameraFollowTarget({ playerCenterX });
};

export default function ExpeditionJourney({ mission, onComplete, onSnapshotChange, audioControls }) {
  const [gameState, setGameState] = useState(makeInitialState());
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [controlsOpen, setControlsOpen] = useState(false);
  const canvasRef = useRef(null);
  const stateRef = useRef(gameState);
  const keysRef = useRef({});
  const lastFrameRef = useRef(0);
  const animationRef = useRef(null);
  const playerSpriteRef = useRef({ image: null, loaded: false, failed: false });
  const environmentAssetsRef = useRef(createEnvironmentAssetState());
  const desertBackgroundAssetsRef = useRef(createDesertBackgroundAssetState());
  const enemySpriteAssetsRef = useRef(createEnemySpriteState());
  const bossSpriteAssetsRef = useRef(createBossSpriteState());
  const collectibleSpriteAssetsRef = useRef(createCollectibleSpriteState());
  const playerWeaponSpriteRef = useRef(createPlayerWeaponSpriteState());

  // Sync ref for the physics loop
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  const syncHud = useCallback(() => {
    setGameState({ ...stateRef.current });
  }, []);

  const currentMusicCue = (() => {
    const current = gameState;
    const section = getSectionForX(current.player.x);
    const activeMiniBoss = current.miniBosses.some(boss => (
      boss.awakened && !boss.defeated && Math.abs(boss.x - current.player.x) < 520
    ));
    if (activeMiniBoss) return 'boss';
    return SECTION_MUSIC_CUES[section.id] || 'desert';
  })();

  useEffect(() => {
    if (briefingOpen) return;
    audioControls?.playExpeditionMusic?.(currentMusicCue);
  }, [audioControls, briefingOpen, currentMusicCue]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      playerSpriteRef.current = { image, loaded: true, failed: false };
      stateRef.current.playerSpriteLoaded = true;
      syncHud();
    };
    image.onerror = () => {
      if (cancelled) return;
      playerSpriteRef.current = { image: null, loaded: false, failed: true };
      stateRef.current.playerSpriteLoaded = false;
      syncHud();
    };
    image.src = `${import.meta.env.BASE_URL}${PLAYER_SPRITE_SRC}`;
    return () => {
      cancelled = true;
    };
  }, [syncHud]);

  useEffect(() => loadEnvironmentAssetPack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      environmentAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadDesertBackgroundAssetPack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      desertBackgroundAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadEnemySpritePack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      enemySpriteAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadBossSpritePack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      bossSpriteAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadCollectibleSpritePack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      collectibleSpriteAssetsRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

  useEffect(() => loadPlayerWeaponSpritePack({
    baseUrl: import.meta.env.BASE_URL,
    onUpdate: (assets) => {
      playerWeaponSpriteRef.current = assets;
      syncHud();
    },
  }), [syncHud]);

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
    const camera = getCameraFollowTarget(current);
    current.cameraX = camera.targetCameraX;
    current.targetCameraX = camera.targetCameraX;
    current.cameraMode = camera.mode;
    current.cameraFocusTarget = camera.focusTarget;
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

  const getEnemyPatternConfig = useCallback((enemy) => (
    ENEMY_ATTACK_PATTERNS[enemy.type] || DEFAULT_ENEMY_ATTACK_PATTERN
  ), []);

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
    vulnerable: Boolean(entity.vulnerabilityTimer > 0 || entity.attackRecovery > 0 || entity.stunTimer > 0),
    shielded: Boolean(entity.shieldTimer > 0),
    counterWindow: Number((entity.vulnerabilityTimer || 0).toFixed(2)),
    pattern: entity.attackPattern || null,
    patternLabel: entity.attackPhaseLabel || null,
  }), [getCombatMode]);

  const createJourneySnapshot = useCallback((current = stateRef.current) => {
    const section = getSectionForX(current.player.x);
    const objective = getObjectiveProgress(section.id, current);
    const activeMiniBoss = current.miniBosses.find(boss => boss.awakened && !boss.defeated && Math.abs(boss.x - current.player.x) < 520);
    const nearbyCombatEnemy = current.enemies
      .filter(enemy => !enemy.defeated && Math.abs(enemy.x - current.player.x) < 520)
      .sort((a, b) => Math.abs(a.x - current.player.x) - Math.abs(b.x - current.player.x))[0] || null;
    const activeEnemyCounterWindow = current.enemies.find(enemy => !enemy.defeated && (enemy.vulnerabilityTimer > 0 || enemy.attackRecovery > 0));
    const activeBossCounterWindow = current.miniBosses.find(boss => !boss.defeated && (boss.vulnerabilityTimer > 0 || boss.attackRecovery > 0));
    const environmentAssets = environmentAssetsRef.current;
    const missingEnvironmentAssets = getMissingEnvironmentAssets(environmentAssets);
    const environmentFallbackActive = !environmentAssets.loaded || environmentAssets.failed || missingEnvironmentAssets.length > 0;
    const desertBackgroundAssets = desertBackgroundAssetsRef.current;
    const desertPack = getSectionBackgroundAssets(desertBackgroundAssets, 'desert-entry');
    const ruinedTemplePack = getSectionBackgroundAssets(desertBackgroundAssets, 'ruined-temple');
    const catacombsPack = getSectionBackgroundAssets(desertBackgroundAssets, 'catacombs');
    const escapePack = getSectionBackgroundAssets(desertBackgroundAssets, 'escape-sequence');
    const digSitePack = getSectionBackgroundAssets(desertBackgroundAssets, 'dig-site-entrance');
    const missingDesertBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'desert-entry');
    const missingRuinedTempleBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'ruined-temple');
    const missingCatacombsBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'catacombs');
    const missingEscapeBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'escape-sequence');
    const missingDigSiteBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'dig-site-entrance');
    const desertBackgroundFallbackActive = !desertPack?.loaded
      || desertPack.failed
      || missingDesertBackgroundAssets.length > 0;
    const ruinedTempleBackgroundFallbackActive = !ruinedTemplePack?.loaded
      || ruinedTemplePack.failed
      || missingRuinedTempleBackgroundAssets.length > 0;
    const catacombsBackgroundFallbackActive = !catacombsPack?.loaded
      || catacombsPack.failed
      || missingCatacombsBackgroundAssets.length > 0;
    const escapeBackgroundFallbackActive = !escapePack?.loaded
      || escapePack.failed
      || missingEscapeBackgroundAssets.length > 0;
    const digSiteBackgroundFallbackActive = !digSitePack?.loaded
      || digSitePack.failed
      || missingDigSiteBackgroundAssets.length > 0;
    const enemySpriteAssets = enemySpriteAssetsRef.current;
    const missingEnemySpriteAssets = getMissingEnemySpriteAssets(enemySpriteAssets);
    const enemySpriteFallbackActive = !enemySpriteAssets.loaded || enemySpriteAssets.failed || missingEnemySpriteAssets.length > 0;
    const bossSpriteAssets = bossSpriteAssetsRef.current;
    const missingBossSpriteAssets = getMissingBossSpriteAssets(bossSpriteAssets);
    const bossSpriteFallbackActive = !bossSpriteAssets.loaded || bossSpriteAssets.failed || missingBossSpriteAssets.length > 0;
    const collectibleSpriteAssets = collectibleSpriteAssetsRef.current;
    const missingCollectibleSpriteAssets = getMissingCollectibleSpriteAssets(collectibleSpriteAssets);
    const collectibleSpriteFallbackActive = !collectibleSpriteAssets.loaded
      || collectibleSpriteAssets.failed
      || missingCollectibleSpriteAssets.length > 0;
    const playerWeaponAssets = playerWeaponSpriteRef.current;
    const missingPlayerWeaponSpriteAssets = getMissingPlayerWeaponSpriteAssets(playerWeaponAssets);
    const playerWeaponSpriteFallbackActive = !playerWeaponAssets.loaded
      || playerWeaponAssets.failed
      || missingPlayerWeaponSpriteAssets.length > 0;
    const renderStats = current.renderStats || {};
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
      viewport: JOURNEY_VIEWPORT,
      renderTarget: JOURNEY_RENDER_TARGET,
      worldLayout: JOURNEY_WORLD_LAYOUT,
      cameraLayout: JOURNEY_CAMERA,
      hudSafeArea: JOURNEY_HUD_SAFE_AREA,
      canvasScaleState: getCanvasScaleState(canvasRef.current),
      player: {
        x: Math.round(current.player.x),
        y: Math.round(current.player.y),
        vx: Math.round(current.player.vx),
        vy: Math.round(current.player.vy),
        onGround: current.player.onGround,
      },
      playerFacing: current.player.direction >= 0 ? 'right' : 'left',
      playerSpriteLoaded: Boolean(playerSpriteRef.current.loaded),
      playerAnimationState: current.player.animationState || 'idle',
      playerAnimationFrame: current.player.animationFrame ?? 1,
      playerSpriteScale: Number((current.player.spriteScale || PLAYER_SPRITE_SCALE).toFixed(3)),
      environmentAssetsLoaded: Boolean(environmentAssets.loaded),
      environmentAssetsReady: Boolean(environmentAssets.ready),
      environmentAtlasPath: environmentAssets.atlasPath || ENVIRONMENT_ATLAS_JSON,
      missingEnvironmentAssets,
      environmentFallbackActive,
      platformArtMode: environmentAssets.loaded ? 'atlas' : 'canvas-fallback',
      hazardArtMode: environmentAssets.loaded ? 'atlas' : 'canvas-fallback',
      gateArtMode: environmentAssets.loaded ? 'atlas' : 'canvas-fallback',
      assetGroundingPassActive: true,
      assetGroundingVersion: JOURNEY_ASSET_GROUNDING_VERSION,
      groundedPropCount: renderStats.groundedPropCount || 0,
      backgroundPropTintActive: Boolean(renderStats.backgroundPropTintActive),
      platformGroundingMode: renderStats.platformGroundingMode || 'contact-shadow-ledges',
      propDrawOrderMode: renderStats.propDrawOrderMode || DECORATIVE_PROP_LAYER_MODE,
      decorativePropLayerMode: renderStats.decorativePropLayerMode || DECORATIVE_PROP_LAYER_MODE,
      propDepthTuningVersion: renderStats.propDepthTuningVersion || PROP_DEPTH_TUNING_VERSION,
      floatingAssetWarnings: renderStats.floatingAssetWarnings || [],
      desertBackgroundAssetsLoaded: Boolean(desertPack?.loaded),
      desertBackgroundAssetsReady: Boolean(desertPack?.ready),
      desertBackgroundFallbackActive,
      ruinedTempleBackgroundAssetsLoaded: Boolean(ruinedTemplePack?.loaded),
      ruinedTempleBackgroundAssetsReady: Boolean(ruinedTemplePack?.ready),
      ruinedTempleBackgroundFallbackActive,
      ruinedTempleBackgroundAtlasPath: RUINED_TEMPLE_BACKGROUND_ATLAS_JSON,
      catacombsBackgroundAssetsLoaded: Boolean(catacombsPack?.loaded),
      catacombsBackgroundAssetsReady: Boolean(catacombsPack?.ready),
      catacombsBackgroundFallbackActive,
      catacombsBackgroundAtlasPath: CATACOMBS_BACKGROUND_ATLAS_JSON,
      escapeBackgroundAssetsLoaded: Boolean(escapePack?.loaded),
      escapeBackgroundAssetsReady: Boolean(escapePack?.ready),
      escapeBackgroundFallbackActive,
      escapeBackgroundAtlasPath: ESCAPE_BACKGROUND_ATLAS_JSON,
      digSiteBackgroundAssetsLoaded: Boolean(digSitePack?.loaded),
      digSiteBackgroundAssetsReady: Boolean(digSitePack?.ready),
      digSiteBackgroundFallbackActive,
      digSiteBackgroundAtlasPath: DIG_SITE_BACKGROUND_ATLAS_JSON,
      baseCampBackgroundAssetsLoaded: Boolean(digSitePack?.loaded),
      baseCampBackgroundAssetsReady: Boolean(digSitePack?.ready),
      baseCampBackgroundFallbackActive: digSiteBackgroundFallbackActive,
      enemySpritesLoaded: enemySpriteAssets.loaded,
      enemySpriteFallbackActive,
      enemySpriteAtlasPath: ENEMY_SPRITE_ATLAS_JSON,
      enemySpriteAtlasVersion: ENEMY_SPRITE_ATLAS_VERSION,
      missingEnemySpriteAssets,
      visibleEnemySpriteFamilies: renderStats.visibleEnemySpriteFamilies || [],
      enemySpriteFrameStates: renderStats.enemySpriteFrameStates || [],
      bossSpritesLoaded: bossSpriteAssets.loaded,
      bossSpriteFallbackActive,
      bossSpriteAtlasPath: BOSS_SPRITE_ATLAS_JSON,
      bossSpriteAtlasVersion: BOSS_SPRITE_ATLAS_VERSION,
      missingBossSpriteAssets,
      activeBossSprite: renderStats.activeBossSprite || null,
      activeBossSpriteFrame: renderStats.activeBossSpriteFrame || null,
      activeBossAnimationState: renderStats.activeBossAnimationState || null,
      stoneGuardianSpriteLoaded: Boolean(bossSpriteAssets.packs?.['temple-guardian']?.loaded),
      stoneGuardianSpriteFrame: renderStats.stoneGuardianSpriteFrame || null,
      stoneGuardianSpriteAtlasPath: STONE_GUARDIAN_SPRITE_ATLAS_JSON,
      ancientConstructSpriteLoaded: Boolean(bossSpriteAssets.packs?.['ancient-construct']?.loaded),
      ancientConstructSpriteFrame: renderStats.ancientConstructSpriteFrame || null,
      ancientConstructSpriteAtlasPath: ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON,
      collectibleSpritesLoaded: Boolean(collectibleSpriteAssets.loaded),
      collectibleSpritesReady: Boolean(collectibleSpriteAssets.ready),
      collectibleSpriteFallbackActive,
      collectibleSpriteAtlasPath: collectibleSpriteAssets.atlasPath || COLLECTIBLE_ATLAS_JSON,
      collectibleSpriteAtlasVersion: COLLECTIBLE_SPRITE_ATLAS_VERSION,
      missingCollectibleSpriteAssets,
      visibleToolSprites: renderStats.visibleToolSprites || [],
      visibleShardSprites: renderStats.visibleShardSprites || [],
      visibleUpgradeSprites: renderStats.visibleUpgradeSprites || [],
      visibleObjectiveSprites: renderStats.visibleObjectiveSprites || [],
      visibleCollectibleCount: renderStats.visibleCollectibleCount || 0,
      collectibleScaleTuningVersion: COLLECTIBLE_SCALE_TUNING_VERSION,
      relicShardScale: RELIC_SHARD_SCALE,
      fieldToolScale: FIELD_TOOL_SCALE,
      upgradeScale: UPGRADE_SCALE,
      objectiveMarkerScale: OBJECTIVE_MARKER_SCALE,
      loreTabletScale: LORE_TABLET_SCALE,
      pickupGlowScale: PICKUP_GLOW_SCALE,
      collectibleVisualMode: renderStats.collectibleVisualMode || (collectibleSpriteAssets.loaded ? 'sprite-atlas-with-fallback' : 'canvas-fallback'),
      playerWeaponSpriteLoaded: Boolean(playerWeaponAssets.loaded),
      playerWeaponSpriteReady: Boolean(playerWeaponAssets.ready),
      playerWeaponSpriteFallbackActive,
      playerWeaponAtlasPath: playerWeaponAssets.atlasPath || PLAYER_WEAPON_ATLAS_JSON,
      playerWeaponAtlasVersion: PLAYER_WEAPON_ATLAS_VERSION,
      missingPlayerWeaponSpriteAssets,
      playerWeaponFrame: renderStats.playerWeaponFrame || getPlayerWeaponFrameKey(getPlayerAttackState(current)),
      playerWeaponVisualMode: renderStats.playerWeaponVisualMode || (playerWeaponAssets.loaded ? 'khopesh-sprite-atlas' : 'canvas-fallback'),
      parallaxLayersActive: Boolean(renderStats.parallaxLayersActive),
      activeBackgroundSection: renderStats.activeBackgroundSection || null,
      backgroundDepthMode: renderStats.backgroundDepthMode || 'canvas-fallback',
      visibleLabelCount: renderStats.visibleLabelCount || 0,
      labelSuppressionActive: Boolean(renderStats.labelSuppressionActive),
      platformVisualTuningActive: Boolean(renderStats.platformVisualTuningActive),
      journeyPolishPassActive: Boolean(renderStats.journeyPolishPassActive),
      journeyPolishVersion: renderStats.journeyPolishVersion || JOURNEY_POLISH_VERSION,
      hazardReadabilityMode: renderStats.hazardReadabilityMode || 'soft-warning-cues',
      enemyVisualMode: renderStats.enemyVisualMode || 'sprite-atlas-with-grounding',
      bossVisualMode: renderStats.bossVisualMode || 'multi-boss-atlas-fallback-safe',
      assetFallbackActive: environmentFallbackActive || enemySpriteFallbackActive || bossSpriteFallbackActive || collectibleSpriteFallbackActive || playerWeaponSpriteFallbackActive || desertBackgroundFallbackActive || ruinedTempleBackgroundFallbackActive || catacombsBackgroundFallbackActive || escapeBackgroundFallbackActive || digSiteBackgroundFallbackActive,
      desertVisualTuningVersion: DESERT_VISUAL_TUNING_VERSION,
      atlasTuningVersion: ATLAS_TUNING_VERSION,
      activeAtlasRegionIssues: missingEnvironmentAssets,
      playerAttackBox,
      combatChallengeMode: COMBAT_CHALLENGE_MODE,
      playerAttackStaminaCost: current.playerAttackStaminaCost || 0,
      lastAttackResult: current.lastAttackResult || 'ready',
      shieldedHitFeedback: current.shieldedHitFeedback || '',
      activeEnemyCounterWindow: activeEnemyCounterWindow ? {
        id: activeEnemyCounterWindow.id,
        name: activeEnemyCounterWindow.name,
        pattern: activeEnemyCounterWindow.attackPattern,
        time: Number(Math.max(activeEnemyCounterWindow.vulnerabilityTimer || 0, activeEnemyCounterWindow.attackRecovery || 0).toFixed(2)),
      } : null,
      activeBossCounterWindow: activeBossCounterWindow ? {
        id: activeBossCounterWindow.id,
        name: activeBossCounterWindow.name,
        pattern: activeBossCounterWindow.attackPattern,
        time: Number(Math.max(activeBossCounterWindow.vulnerabilityTimer || 0, activeBossCounterWindow.attackRecovery || 0).toFixed(2)),
      } : null,
      currentEnemyPattern: nearbyCombatEnemy ? {
        id: nearbyCombatEnemy.id,
        name: nearbyCombatEnemy.name,
        type: nearbyCombatEnemy.type,
        pattern: nearbyCombatEnemy.attackPattern,
        label: nearbyCombatEnemy.attackPhaseLabel || getEnemyPatternConfig(nearbyCombatEnemy).label,
        state: getCombatMode(nearbyCombatEnemy),
      } : null,
      playerInvulnerable: Number(current.player.invulnerable.toFixed(2)),
      invulnerabilityRemainingMs: Math.round(current.player.invulnerable * 1000),
      damageCooldownRemainingMs: Math.round(current.player.damageCooldownTimer * 1000),
      playerFlashActive: current.player.invulnerable > 0,
      lastDamageSource: current.player.lastDamageSource,
      lastDamageTime: current.player.lastDamageTime,
      playerAttackState: getPlayerAttackState(current),
      journeySection: section.name,
      worldProgressPercent: Math.round((current.player.x / WORLD_WIDTH) * 100),
      resources: current.resources,
      playerStamina: current.resources.stamina,
      cameraX: Math.round(current.cameraX),
      targetCameraX: Math.round(current.targetCameraX),
      playerWorldX: Math.round(current.player.x),
      playerScreenX: Math.round(current.player.x - current.cameraX),
      playerGroundedState: {
        onGround: current.player.onGround,
        expectedGroundY: JOURNEY_WORLD_LAYOUT.groundY,
        playerFootY: Math.round(current.player.y + current.player.height),
      },
      currentSection: section.name,
      cameraMode: current.cameraMode,
      cameraFocusTarget: current.cameraFocusTarget,
      cameraBounds: {
        min: 0,
        max: WORLD_WIDTH - CANVAS_WIDTH,
      },
      cameraShakeActive: current.cameraShakeTimer > 0,
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
        animationState: current.player.animationState || 'idle',
        animationFrame: current.player.animationFrame ?? 1,
        invulnerable: Number(current.player.invulnerable.toFixed(2)),
        invulnerabilityRemainingMs: Math.round(current.player.invulnerable * 1000),
        damageCooldownRemainingMs: Math.round(current.player.damageCooldownTimer * 1000),
        flashActive: current.player.invulnerable > 0,
        lastDamage: current.player.lastDamage || 0,
        lastDamageSource: current.player.lastDamageSource,
        lastDamageTime: current.player.lastDamageTime,
        lastAttackResult: current.lastAttackResult || 'ready',
        attackStaminaCost: current.playerAttackStaminaCost || 0,
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
      enemyCombatStates: current.enemies
        .filter(enemy => Math.abs(enemy.x - current.player.x) < 700 || current.defeatedEnemies.has(enemy.id))
        .map(enemy => ({
          id: enemy.id,
          name: enemy.name,
          type: enemy.type,
          pattern: enemy.attackPattern,
          label: enemy.attackPhaseLabel || getEnemyPatternConfig(enemy).label,
          state: getCombatMode(enemy),
          windup: Number((enemy.attackWindup || 0).toFixed(2)),
          attack: Number((enemy.attackTimer || 0).toFixed(2)),
          recovery: Number((enemy.attackRecovery || 0).toFixed(2)),
          counterWindow: Number((enemy.vulnerabilityTimer || 0).toFixed(2)),
          shielded: Boolean(enemy.shieldTimer > 0),
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
          gateGroundedState: {
            expectedGroundY: JOURNEY_WORLD_LAYOUT.groundY,
            visualFootY: JOURNEY_WORLD_LAYOUT.groundY,
            authoredY: Math.round(gate.y),
          },
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
  }, [briefingOpen, getActiveHazardsNearPlayer, getBossVulnerabilityState, getCombatMode, getEnemyPatternConfig, getEntityCombatState, getGateGuidance, getObjectiveProgress, getPlayerAttackState, getStaminaWarningState]);

  // --- Rendering Helpers ---
  const drawFieldNoteLabel = useCallback((ctx, x, y, text, color) => {
    const current = stateRef.current;
    if (current.renderStats) current.renderStats.visibleLabelCount += 1;
    ctx.save();
    ctx.font = '800 8px Outfit, sans-serif';
    const metrics = ctx.measureText(text.toUpperCase());
    const padding = 4;
    
    ctx.fillStyle = 'rgba(255, 252, 235, 0.78)';
    ctx.fillRect(x - metrics.width / 2 - padding, y - 8, metrics.width + padding * 2, 12);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - metrics.width / 2 - padding, y - 8, metrics.width + padding * 2, 12);
    
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text.toUpperCase(), x, y);
    ctx.restore();
  }, []);

  const drawContactShadow = useCallback((ctx, x, y, width, intensity = 0.28, blur = 0) => {
    ctx.save();
    ctx.globalAlpha = intensity;
    ctx.fillStyle = '#1f1308';
    if (blur > 0) ctx.filter = `blur(${blur}px)`;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(16, width / 2), Math.max(4, width / 16), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

  const drawGroundDustLip = useCallback((ctx, x, y, width, color = 'rgba(210, 160, 92, 0.28)') => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(18, width / 2.4), Math.max(3, width / 24), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

  const drawHazardGroundApron = useCallback((ctx, x, y, width, sectionId, intensity = 1) => {
    const sandColor = sectionId === 'catacombs'
      ? 'rgba(74, 58, 42, 0.34)'
      : sectionId === 'escape-sequence'
        ? 'rgba(123, 72, 34, 0.34)'
        : 'rgba(185, 119, 55, 0.34)';
    const highlight = sectionId === 'catacombs'
      ? 'rgba(156, 125, 86, 0.24)'
      : 'rgba(226, 162, 83, 0.28)';
    ctx.save();
    ctx.globalAlpha = 0.85 * intensity;
    ctx.fillStyle = sandColor;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(24, width / 2.05), Math.max(5, width / 18), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.7 * intensity;
    ctx.strokeStyle = highlight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - width * 0.36, y - 2);
    ctx.quadraticCurveTo(x - width * 0.08, y + 4, x + width * 0.22, y - 1);
    ctx.quadraticCurveTo(x + width * 0.34, y - 4, x + width * 0.44, y + 1);
    ctx.stroke();
    ctx.restore();
  }, []);

  const drawDecorativeBaseBlend = useCallback((ctx, x, y, width, sectionId, depth = 'background', intensity = 1) => {
    const base = sectionId === 'catacombs'
      ? 'rgba(46, 37, 30, 0.36)'
      : sectionId === 'escape-sequence'
        ? 'rgba(112, 66, 33, 0.3)'
        : sectionId === 'dig-site-entrance'
          ? 'rgba(177, 120, 61, 0.24)'
          : 'rgba(170, 111, 52, 0.28)';
    const highlight = depth === 'background'
      ? 'rgba(228, 171, 98, 0.12)'
      : 'rgba(235, 178, 94, 0.2)';
    ctx.save();
    ctx.globalAlpha = intensity;
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(18, width / 2.25), Math.max(4, width / 22), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha *= 0.82;
    ctx.strokeStyle = highlight;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - width * 0.32, y - 1);
    ctx.quadraticCurveTo(x - width * 0.08, y + 3, x + width * 0.24, y);
    ctx.stroke();
    ctx.restore();
  }, []);

  const drawSectionTransitionBlend = useCallback((ctx, cameraX) => {
    SECTIONS.slice(1).forEach((section) => {
      const x = section.start - cameraX;
      if (x < -140 || x > CANVAS_WIDTH + 140) return;
      const previousSection = getSectionForX(section.start - 1);
      const fromColor = previousSection.id === 'catacombs'
        ? 'rgba(55, 42, 30, 0.34)'
        : previousSection.id === 'escape-sequence'
          ? 'rgba(126, 74, 35, 0.3)'
          : 'rgba(177, 115, 54, 0.24)';
      const toColor = section.id === 'catacombs'
        ? 'rgba(55, 42, 30, 0.34)'
        : section.id === 'escape-sequence'
          ? 'rgba(126, 74, 35, 0.3)'
          : 'rgba(177, 115, 54, 0.24)';
      const gradient = ctx.createLinearGradient(x - 92, 0, x + 92, 0);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.35, fromColor);
      gradient.addColorStop(0.65, toColor);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.fillRect(x - 96, GROUND_Y - 18, 192, CANVAS_HEIGHT - GROUND_Y + 28);
      drawGroundDustLip(ctx, x, GROUND_Y + 2, 150, 'rgba(216, 154, 82, 0.22)');
      ctx.globalAlpha = 0.42;
      ctx.fillStyle = section.id === 'catacombs' ? '#5b4630' : '#b87835';
      ctx.beginPath();
      ctx.ellipse(x - 28, GROUND_Y + 3, 34, 5, -0.12, 0, Math.PI * 2);
      ctx.ellipse(x + 36, GROUND_Y + 4, 42, 6, 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, [drawGroundDustLip]);

  const drawPlayerWeaponFallback = useCallback((ctx, attackState, direction, scale = 1) => {
    const attacking = attackState === 'swing';
    const reach = attackState === 'windup' ? 11 : attacking ? 32 : attackState === 'recoil' ? 14 : 18;
    const lift = attacking ? -10 : attackState === 'windup' ? 4 : -2;
    ctx.save();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = (attacking ? 5 : 3) * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(direction * reach * scale, lift * scale);
    ctx.stroke();
    ctx.fillStyle = '#fff7ad';
    ctx.beginPath();
    ctx.arc(direction * (reach + 2) * scale, lift * scale, (attacking ? 4 : 3) * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

  const drawPlayerKhopesh = useCallback((ctx, anchorX, anchorY, attackState, direction = 1, scale = 1) => {
    const assets = playerWeaponSpriteRef.current;
    const frameKey = getPlayerWeaponFrameKey(attackState);
    const ready = assets.loaded && assets.image && assets.atlas?.regions?.[frameKey];

    if (!ready) {
      drawPlayerWeaponFallback(ctx, attackState, direction, scale);
      return false;
    }

    const frameConfig = {
      khopeshIdle: { x: -5, y: -22, width: 14, height: 40, rotate: -0.1, alpha: 0.92 },
      khopeshWindup: { x: -7, y: -28, width: 30, height: 42, rotate: -0.72, alpha: 1 },
      khopeshSwing: { x: 2, y: -39, width: 64, height: 48, rotate: 0.08, alpha: 0.94 },
      khopeshReady: { x: -5, y: -20, width: 14, height: 40, rotate: 0.2, alpha: 0.9 },
    }[frameKey] || { x: 0, y: -24, width: 17, height: 48, rotate: 0, alpha: 1 };

    ctx.save();
    ctx.translate(anchorX, anchorY);
    if (direction < 0) ctx.scale(-1, 1);
    ctx.rotate(frameConfig.rotate);
    ctx.globalAlpha *= frameConfig.alpha;
    ctx.shadowColor = attackState === 'swing' ? 'rgba(250, 204, 21, 0.72)' : 'rgba(0, 0, 0, 0.28)';
    ctx.shadowBlur = attackState === 'swing' ? 12 : 4;
    const drawn = drawPlayerWeaponAtlasRegion(
      ctx,
      assets,
      frameKey,
      {
        x: frameConfig.x * scale,
        y: frameConfig.y * scale,
        width: frameConfig.width * scale,
        height: frameConfig.height * scale,
      },
    );
    ctx.restore();

    if (drawn && stateRef.current.renderStats) {
      stateRef.current.renderStats.playerWeaponFrame = frameKey;
      stateRef.current.renderStats.playerWeaponVisualMode = 'khopesh-sprite-atlas';
    }
    return drawn;
  }, [drawPlayerWeaponFallback]);

  const drawPlayerFallbackCharacter = useCallback((ctx, x, y, w, h, direction, invuln, now) => {
    ctx.save();
    if (invuln > 0 && Math.floor(now / 100) % 2 === 0) ctx.globalAlpha = 0.3;
    
    const bob = Math.sin(now / 150) * 2;
    const legSwing = Math.sin(now / 100) * 8;
    const attackState = getPlayerAttackState(stateRef.current);
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

    // Weapon in hand
    const handX = x + attackLean + (direction > 0 ? 24 : 4);
    drawPlayerKhopesh(ctx, handX, y + 19 + bob, attackState, direction, 0.9);

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
  }, [drawPlayerKhopesh, getPlayerAttackState]);

  const drawPlayerSprite = useCallback((ctx, x, y, w, h, direction, invuln, now) => {
    const sprite = playerSpriteRef.current;
    if (!sprite.loaded || !sprite.image) {
      drawPlayerFallbackCharacter(ctx, x, y, w, h, direction, invuln, now);
      return;
    }

    const current = stateRef.current;
    const frame = clamp(current.player.animationFrame ?? 1, 0, PLAYER_SPRITE_FRAME_COUNT - 1);
    const drawHeight = PLAYER_SPRITE_DRAW_HEIGHT;
    const drawWidth = PLAYER_SPRITE_FRAME_WIDTH * PLAYER_SPRITE_SCALE;
    const footX = x + w / 2;
    const footY = y + h + 1;
    const drawX = -drawWidth / 2;
    const drawY = -drawHeight;
    const attackState = getPlayerAttackState(current);
    const attackLean = attackState === 'windup'
      ? -direction * 3
      : attackState === 'swing'
        ? direction * 6
        : attackState === 'recoil'
          ? -direction * 4
          : 0;
    const jumpLift = current.player.animationState === 'jump' ? -2 : 0;
    const hurtShake = current.player.animationState === 'hurt' ? Math.sin(now / 24) * 2 : 0;

    ctx.save();
    if (invuln > 0 && Math.floor(now / 100) % 2 === 0) ctx.globalAlpha = 0.34;

    ctx.fillStyle = 'rgba(0,0,0,0.34)';
    ctx.beginPath();
    ctx.ellipse(footX, footY + 1, w * 1.05, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(footX + attackLean + hurtShake, footY + jumpLift);
    if (direction < 0) ctx.scale(-1, 1);
    ctx.drawImage(
      sprite.image,
      frame * PLAYER_SPRITE_FRAME_WIDTH,
      0,
      PLAYER_SPRITE_FRAME_WIDTH,
      PLAYER_SPRITE_FRAME_HEIGHT,
      drawX,
      drawY,
      drawWidth,
      drawHeight,
    );

    drawPlayerKhopesh(ctx, drawWidth * 0.34, -drawHeight * 0.54, attackState, 1, 0.9);

    ctx.restore();

    if (stateRef.current.notice && stateRef.current.notice.includes('near')) {
      ctx.save();
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('!', x + w / 2, y - 18);
      ctx.restore();
    }
  }, [drawPlayerFallbackCharacter, drawPlayerKhopesh, getPlayerAttackState]);

  const drawPlatform = useCallback((ctx, platform, cameraX, current) => {
    const x = worldToScreenX(platform.x, cameraX);
    if (!isHorizontallyVisible(platform.x, platform.width, cameraX, 50)) return;

    ctx.save();
    if (platform.secret && !current.collectedUpgrades.has('ancient-compass')) {
      ctx.globalAlpha = 0.15;
    }

    const isGround = platform.y === GROUND_Y;
    const section = getSectionForX(platform.x);
    const assetKey = getEnvironmentAssetKeyForPlatform(platform, section.id);
    const visualHeight = isGround ? platform.height : Math.max(platform.height + 10, 28);
    const visualY = platform.y;
    const platformX = x - 2;
    const platformWidth = platform.width + 4;
    ctx.fillStyle = isGround
      ? section.id === 'catacombs'
        ? '#2b211a'
        : '#9b7140'
      : '#5f4229';
    if (!isGround) {
      drawContactShadow(ctx, x + platform.width / 2, platform.y + visualHeight + 5, platform.width * 0.94, 0.32, 1.5);
      ctx.fillStyle = 'rgba(30, 18, 8, 0.34)';
      ctx.fillRect(platformX, visualY + visualHeight - 8, platformWidth, 8);
    }
    ctx.fillStyle = isGround ? '#9b7140' : '#5f4229';
    ctx.fillRect(platformX, visualY, platformWidth, visualHeight);
    const assetDrawn = drawAtlasRegion(
      ctx,
      environmentAssetsRef.current,
      assetKey,
      { x: platformX, y: visualY, width: platformWidth, height: visualHeight },
      {
        mode: 'tileX',
        sourceInset: isGround ? 30 : 22,
        sourceInsetY: isGround ? 5 : 4,
        overlap: isGround ? 4 : 3,
        tileScale: isGround ? 1.55 : 1.35,
      },
    );

    if (assetDrawn) {
      ctx.fillStyle = isGround ? 'rgba(69, 26, 3, 0.06)' : 'rgba(255, 247, 212, 0.2)';
      ctx.fillRect(x, platform.y, platform.width, isGround ? 3 : 4);
      if (!isGround) {
        ctx.fillStyle = 'rgba(30, 18, 9, 0.3)';
        ctx.fillRect(x, platform.y + visualHeight - 7, platform.width, 7);
        const supportSpacing = Math.max(42, Math.min(72, platform.width / 3));
        ctx.fillStyle = 'rgba(37, 25, 14, 0.28)';
        for (let supportX = x + 14; supportX < x + platform.width - 10; supportX += supportSpacing) {
          ctx.beginPath();
          ctx.moveTo(supportX - 5, platform.y + visualHeight - 2);
          ctx.lineTo(supportX + 5, platform.y + visualHeight - 2);
          ctx.lineTo(supportX + 1, platform.y + visualHeight + 12);
          ctx.lineTo(supportX - 1, platform.y + visualHeight + 12);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(92, 57, 23, 0.26)';
        ctx.fillRect(x + 5, platform.y + visualHeight - 2, platform.width - 10, 3);
        ctx.strokeStyle = 'rgba(255, 247, 212, 0.2)';
        ctx.beginPath();
        ctx.moveTo(x + 4, platform.y + 2);
        ctx.lineTo(x + platform.width - 4, platform.y + 2);
        ctx.stroke();
        drawGroundDustLip(ctx, x + platform.width / 2, platform.y + visualHeight + 2, platform.width * 0.72, 'rgba(178, 117, 54, 0.2)');
      }
      ctx.strokeStyle = isGround ? 'rgba(37, 25, 14, 0.18)' : 'rgba(37, 25, 14, 0.34)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, platform.y + 1);
      ctx.lineTo(x + platform.width, platform.y + 1);
      ctx.stroke();
      ctx.restore();
      return;
    }
    
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
    ctx.restore();
  }, [drawContactShadow, drawGroundDustLip]);

  const drawStoryProp = useCallback((ctx, prop, cameraX, now, requestedDepth = null) => {
    const propDepth = getStoryPropDepth(prop);
    if (requestedDepth && propDepth !== requestedDepth) return;
    const x = worldToScreenX(prop.x, cameraX);
    if (!isHorizontallyVisible(prop.x - 220, 440, cameraX)) return;

    ctx.save();
    const section = getSectionForX(prop.x);
    const propAssetKey = getEnvironmentAssetKeyForStoryProp(prop);
    if (propAssetKey) {
      const propSize = PROP_GROUNDING_CONFIG[prop.type] || { width: 72, height: 72, yOffset: 0, alpha: 0.78, depth: 'midground', tint: 'warm' };
      const drawX = x - propSize.width / 2;
      const drawY = prop.y - propSize.height + propSize.yOffset;
      const anchorY = drawY + propSize.height;
      const dustWidth = propSize.width * (propSize.dust ?? 0.62);
      drawContactShadow(ctx, x, anchorY + 2, propSize.width * (propSize.depth === 'background' ? 0.62 : 0.86), propSize.shadow ?? (propSize.depth === 'background' ? 0.1 : 0.22), 1.4);
      drawDecorativeBaseBlend(ctx, x, anchorY + 2, dustWidth, section.id, propSize.depth, propSize.depth === 'background' ? 0.72 : 0.9);
      ctx.globalAlpha = propSize.alpha ?? 0.82;
      if (propSize.tint === 'stone') {
        ctx.filter = propSize.depth === 'background'
          ? 'sepia(14%) saturate(62%) brightness(82%) contrast(92%)'
          : 'sepia(8%) saturate(78%) brightness(90%)';
      } else if (propSize.tint === 'cool') {
        ctx.filter = 'saturate(62%) brightness(78%) contrast(90%)';
      } else if (propSize.tint === 'dust') {
        ctx.filter = 'sepia(20%) saturate(58%) brightness(84%) contrast(88%)';
      } else {
        ctx.filter = propSize.depth === 'background'
          ? 'sepia(18%) saturate(62%) brightness(84%) contrast(92%)'
          : 'sepia(10%) saturate(86%) brightness(92%)';
      }
      const drawn = drawAtlasRegion(
        ctx,
        environmentAssetsRef.current,
        propAssetKey,
        {
          x: drawX,
          y: drawY,
          width: propSize.width,
          height: propSize.height,
        },
        { mode: 'contain' },
      );
      if (drawn) {
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
        drawDecorativeBaseBlend(ctx, x, anchorY + 1, dustWidth, section.id, propSize.depth, propSize.depth === 'background' ? 0.6 : 0.86);
        drawGroundDustLip(ctx, x, anchorY + 1, dustWidth, propSize.depth === 'background' ? 'rgba(187, 128, 64, 0.12)' : 'rgba(187, 128, 64, 0.22)');
        if (stateRef.current.renderStats) stateRef.current.renderStats.groundedPropCount += 1;
        ctx.restore();
        return;
      }
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha *= propDepth === 'background' ? 0.5 : 0.78;
    if (prop.type === 'ruins') {
      drawContactShadow(ctx, x, prop.y + 66, 108, 0.12, 1.4);
      drawDecorativeBaseBlend(ctx, x, prop.y + 66, 86, section.id, propDepth, 0.7);
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
      drawContactShadow(ctx, x, prop.y + 160, 128, 0.12, 1.4);
      drawDecorativeBaseBlend(ctx, x, prop.y + 160, 92, section.id, propDepth, 0.7);
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
      drawContactShadow(ctx, x, prop.y + 84, 86, 0.14, 1.4);
      drawDecorativeBaseBlend(ctx, x, prop.y + 84, 68, section.id, propDepth, 0.7);
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
      drawDecorativeBaseBlend(ctx, x, prop.y + 64, 140, section.id, propDepth, 0.46);
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
      drawContactShadow(ctx, x, prop.y + 38, 88, 0.14, 1.4);
      drawDecorativeBaseBlend(ctx, x, prop.y + 38, 66, section.id, propDepth, 0.72);
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
      drawDecorativeBaseBlend(ctx, x, prop.y + 62, 140, section.id, propDepth, 0.42);
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
      drawContactShadow(ctx, x, prop.y + 50, 164, 0.18, 1.2);
      drawDecorativeBaseBlend(ctx, x, prop.y + 50, 128, section.id, propDepth, 0.76);
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
      drawDecorativeBaseBlend(ctx, x, prop.y + 36, 52, section.id, propDepth, 0.6);
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
      drawDecorativeBaseBlend(ctx, x, prop.y + 58, 76, section.id, propDepth, 0.52);
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
  }, [drawContactShadow, drawDecorativeBaseBlend, drawGroundDustLip]);

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

  const drawCollectibleSpriteGlow = useCallback((ctx, screenX, centerY, now, color, options = {}) => {
    const pulse = Math.sin(now / (options.pulseSpeed || 340)) * 0.22 + 0.78;
    const ringKey = options.ringKey || 'availableGlowRing';
    const ringSize = options.ringSize || 46;
    ctx.save();
    ctx.globalAlpha = options.alpha ?? 0.68;
    ctx.shadowColor = color;
    ctx.shadowBlur = options.shadowBlur || 14;
    const drawnRing = drawCollectibleAtlasRegion(
      ctx,
      collectibleSpriteAssetsRef.current,
      ringKey,
      {
        x: screenX - ringSize / 2,
        y: centerY - ringSize / 2,
        width: ringSize,
        height: ringSize,
      },
    );
    if (!drawnRing) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenX, centerY, (ringSize / 2 - 4) * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  const recordCollectibleSprite = useCallback((kind, key) => {
    const stats = stateRef.current.renderStats;
    if (!stats || !key) return;
    const field = {
      tool: 'visibleToolSprites',
      shard: 'visibleShardSprites',
      upgrade: 'visibleUpgradeSprites',
      objective: 'visibleObjectiveSprites',
    }[kind];
    if (!field) return;
    stats[field] = Array.from(new Set([...(stats[field] || []), key])).slice(-16);
  }, []);

  const drawCollectible = useCallback((ctx, x, y, cameraX, now, label, color, hidden = false, isShard = false, sprite = {}) => {
    const screenX = worldToScreenX(x, cameraX);
    if (!isHorizontallyVisible(x, 1, cameraX, 80)) return;
    const spriteKey = sprite.key || null;
    const spriteKind = sprite.kind || (isShard ? 'shard' : null);
    const spriteSize = sprite.size || (isShard ? 34 : 42);
    const bobAmplitude = sprite.bobAmplitude ?? (isShard ? 2 : 3);
    const floatY = Math.sin((now / 260) + x) * bobAmplitude;
    const baseY = sprite.baseY ?? (y + (sprite.anchorYOffset ?? (isShard ? 18 : 22)));
    const centerY = sprite.anchor === 'center'
      ? y + floatY
      : baseY - spriteSize / 2 + floatY;
    const current = stateRef.current;
    const playerCenterX = current.player.x + current.player.width / 2;
    const nearPlayer = Math.abs(playerCenterX - x) < (sprite.nearGlowDistance ?? 130);
    const glowAlpha = hidden
      ? 0.12
      : nearPlayer
        ? (sprite.glowAlpha ?? 0.28)
        : (sprite.glowAlpha ?? 0.28) * 0.45;
    if (current.renderStats) current.renderStats.visibleCollectibleCount += 1;
    ctx.save();
    ctx.globalAlpha = hidden ? 0.25 : 1;

    if (spriteKey && collectibleSpriteAssetsRef.current.loaded) {
      drawContactShadow(ctx, screenX, baseY + 1, sprite.shadowWidth || spriteSize * 0.72, hidden ? 0.06 : (sprite.shadowAlpha ?? 0.15), 0.85);
      if (!sprite.hideGlow && (sprite.ringSize ?? spriteSize + 8) > 0 && glowAlpha > 0) {
        drawCollectibleSpriteGlow(ctx, screenX, centerY + (sprite.glowYOffset || 0), now, color, {
          ringKey: sprite.ringKey || (spriteKind === 'objective' ? 'objectiveHighlightRing' : 'availableGlowRing'),
          ringSize: sprite.ringSize || spriteSize + 8,
          alpha: glowAlpha,
          shadowBlur: sprite.shadowBlur ?? (isShard ? 5 : 8),
        });
      }

      if (spriteKind !== 'objective' && (nearPlayer || !isShard)) {
        const sparkleSize = sprite.sparkleSize ?? (isShard ? 9 : 11);
        const sparkleOffset = Math.sin(now / 310 + x) * 1.5;
        ctx.globalAlpha = hidden ? 0.08 : (sprite.sparkleAlpha ?? 0.18);
        drawCollectibleAtlasRegion(
          ctx,
          collectibleSpriteAssetsRef.current,
          'pickupSparkle',
          {
            x: screenX + spriteSize * 0.22,
            y: centerY - spriteSize * 0.72 + sparkleOffset,
            width: sparkleSize,
            height: sparkleSize,
          },
        );
        ctx.globalAlpha = hidden ? 0.25 : 1;
      }

      const drawn = drawCollectibleAtlasRegion(
        ctx,
        collectibleSpriteAssetsRef.current,
        spriteKey,
        {
          x: screenX - spriteSize / 2,
          y: centerY - spriteSize / 2,
          width: spriteSize,
          height: spriteSize,
        },
      );

      if (drawn) {
        recordCollectibleSprite(spriteKind, spriteKey);
        ctx.restore();
        return;
      }
    }

    // Core glow (Dynamic)
    const pulse = Math.sin(now / 300) * 0.3 + 0.7;
    const innerGlow = ctx.createRadialGradient(screenX, centerY, 0, screenX, centerY, 25 * pulse);
    innerGlow.addColorStop(0, `${color}88`);
    innerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(screenX, centerY, 25 * pulse, 0, Math.PI * 2);
    ctx.fill();

    if (isShard) {
      // Amber archaeology shard with carved glyph lines.
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12 * pulse;
      
      const shardColor = ctx.createLinearGradient(screenX - 12, centerY - 14, screenX + 12, centerY + 16);
      shardColor.addColorStop(0, '#fff7ad');
      shardColor.addColorStop(0.45, '#f59e0b');
      shardColor.addColorStop(1, '#78350f');
      
      ctx.fillStyle = shardColor;
      ctx.beginPath();
      ctx.moveTo(screenX - 2, centerY - 16);
      ctx.lineTo(screenX + 13, centerY - 4);
      ctx.lineTo(screenX + 7, centerY + 15);
      ctx.lineTo(screenX - 12, centerY + 8);
      ctx.lineTo(screenX - 9, centerY - 8);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.82)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(screenX - 3, centerY - 8);
      ctx.lineTo(screenX + 5, centerY - 2);
      ctx.moveTo(screenX - 5, centerY + 4);
      ctx.lineTo(screenX + 4, centerY + 8);
      ctx.stroke();
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 12;
      
      // Premium Token
      const tokenGrad = ctx.createRadialGradient(screenX, centerY, 5, screenX, centerY, 20);
      tokenGrad.addColorStop(0, '#fffcf0');
      tokenGrad.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = tokenGrad;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(screenX - 18, centerY - 18, 36, 36, 8);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = '800 20px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(label, screenX, centerY + 7);
    }
    ctx.restore();
  }, [drawCollectibleSpriteGlow, drawContactShadow, recordCollectibleSprite]);

  const drawDesertEntryBackground = useCallback((ctx, section, cameraX) => {
    const isNearDesertEntry = section.id === 'desert-entry';
    const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'desert-entry');
    if (!isNearDesertEntry || !assets?.ready) return false;

    const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
    if (assets.atlas?.runtimeMode === 'single-composited-backdrop') {
      return drawDesertBackgroundLayer(
        ctx,
        assets,
        'sky',
        { y: 0, height: CANVAS_HEIGHT },
        { ...layerOptions, parallax: 0, alpha: 1 },
      );
    }

    const drawn = [
      drawDesertBackgroundLayer(ctx, assets, 'sky', { y: 0, height: 375 }, { ...layerOptions, parallax: 0.03, alpha: 0.94 }),
      drawDesertBackgroundLayer(ctx, assets, 'farDunes', { y: 288, height: 116 }, { ...layerOptions, parallax: 0.12, alpha: 0.48 }),
      drawDesertBackgroundLayer(ctx, assets, 'distantRuins', { y: 326, height: 110 }, { ...layerOptions, parallax: 0.22, alpha: 0.42 }),
      drawDesertBackgroundLayer(ctx, assets, 'midgroundRuins', { y: 360, height: 112 }, { ...layerOptions, parallax: 0.35, alpha: 0.46 }),
    ];
    return drawn.every(Boolean);
  }, []);

  const drawSectionParallaxBackground = useCallback((ctx, section, cameraX) => {
    const layers = SECTION_PARALLAX_LAYERS[section.id];
    if (!layers) return false;
    const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, section.id);
    if (!assets?.ready) return false;

    const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
    const drawn = layers
      .filter(layer => !layer.foreground)
      .map(layer => drawDesertBackgroundLayer(
        ctx,
        assets,
        layer.key,
        { y: layer.y, height: layer.height },
        {
          ...layerOptions,
          parallax: layer.parallax,
          alpha: layer.alpha,
        },
      ));
    return drawn.every(Boolean);
  }, []);

  const drawSectionParallaxForeground = useCallback((ctx, section, cameraX) => {
    const layers = SECTION_PARALLAX_LAYERS[section.id]?.filter(layer => layer.foreground);
    if (!layers?.length) return false;
    const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, section.id);
    if (!assets?.ready) return false;

    const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
    const drawn = layers.map(layer => drawDesertBackgroundLayer(
      ctx,
      assets,
      layer.key,
      { y: layer.y, height: layer.height },
      {
        ...layerOptions,
        parallax: layer.parallax,
        alpha: layer.alpha,
      },
    ));
    return drawn.every(Boolean);
  }, []);

  const drawDesertForegroundAtmosphere = useCallback((ctx, section, cameraX) => {
    const isNearDesertEntry = section.id === 'desert-entry';
    const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'desert-entry');
    if (!isNearDesertEntry || !assets?.ready) return false;
    return drawDesertBackgroundLayer(
      ctx,
      assets,
      'foregroundAtmosphere',
      { y: 318, height: 84 },
      { canvasWidth: CANVAS_WIDTH, cameraX, parallax: 0.45, alpha: 0.18 },
    );
  }, []);

  const drawTempleBackdrop = useCallback((ctx, section, cameraX) => {
    if (section.id !== 'ruined-temple') return;

    ctx.save();
    const wallGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    wallGradient.addColorStop(0, 'rgba(77, 58, 40, 0.88)');
    wallGradient.addColorStop(0.38, 'rgba(94, 70, 45, 0.9)');
    wallGradient.addColorStop(0.78, 'rgba(122, 86, 49, 0.52)');
    wallGradient.addColorStop(1, 'rgba(157, 106, 55, 0.18)');
    ctx.fillStyle = wallGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = 'rgba(20, 14, 10, 0.28)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 96);

    ctx.fillStyle = 'rgba(245, 200, 120, 0.08)';
    for (let worldX = section.start + 120; worldX < section.end; worldX += 340) {
      const x = worldX - cameraX * 0.42;
      if (x < -260 || x > CANVAS_WIDTH + 260) continue;
      ctx.beginPath();
      ctx.ellipse(x, 214, 190, 74, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(39, 25, 16, 0.42)';
    for (let worldX = section.start + 100; worldX < section.end; worldX += 210) {
      const x = worldX - cameraX;
      if (x < -120 || x > CANVAS_WIDTH + 120) continue;
      ctx.fillRect(x - 24, 100, 48, 238);
      ctx.fillStyle = 'rgba(255, 220, 142, 0.11)';
      ctx.fillRect(x - 16, 122, 32, 17);
      ctx.fillRect(x - 16, 172, 32, 17);
      ctx.fillRect(x - 16, 222, 32, 17);
      ctx.fillStyle = 'rgba(22, 15, 11, 0.38)';
      ctx.fillRect(x - 18, 266, 36, 72);
      ctx.fillStyle = 'rgba(39, 25, 16, 0.42)';
    }

    ctx.strokeStyle = 'rgba(255, 226, 160, 0.2)';
    ctx.lineWidth = 2;
    for (let worldX = section.start + 42; worldX < section.end; worldX += 120) {
      const x = worldX - cameraX;
      if (x < -80 || x > CANVAS_WIDTH + 80) continue;
      ctx.strokeRect(x, 154, 54, 28);
      ctx.beginPath();
      ctx.moveTo(x + 8, 238);
      ctx.lineTo(x + 37, 212);
      ctx.lineTo(x + 52, 240);
      ctx.stroke();
    }

    for (let worldX = section.start + 155; worldX < section.end; worldX += 360) {
      const x = worldX - cameraX;
      if (x < -140 || x > CANVAS_WIDTH + 140) continue;
      const glow = ctx.createRadialGradient(x, 248, 0, x, 248, 78);
      glow.addColorStop(0, 'rgba(251, 191, 36, 0.24)');
      glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, 248, 78, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 212, 112, 0.78)';
      ctx.fillRect(x - 3, 240, 6, 16);
    }

    ctx.fillStyle = 'rgba(63, 39, 20, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, 365);
    for (let i = 0; i <= CANVAS_WIDTH; i += 48) {
      const worldX = i + cameraX * 0.22;
      ctx.lineTo(i, 356 + Math.sin(worldX * 0.005) * 7 + Math.cos(worldX * 0.002) * 10);
    }
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, []);

  const drawRouteGate = useCallback((ctx, gate, screenX, current, complete) => {
    const gateCenter = screenX + gate.width / 2;
    const fallbackHeight = 146;
    const fallbackTop = placeGateOnGround(fallbackHeight);
    const glowColor = complete ? '#22c55e' : '#f59e0b';

    ctx.save();
    const gateHeight = 142;
    const gateWidth = Math.max(104, gate.width + 78);
    const gateVisual = {
      x: gateCenter - gateWidth / 2,
      y: placeGateOnGround(gateHeight),
      width: gateWidth,
      height: gateHeight,
    };
    drawContactShadow(ctx, gateCenter, GROUND_Y + 2, gateVisual.width * 0.82, complete ? 0.22 : 0.3, 1.4);
    const gateDrawn = drawAtlasRegion(
      ctx,
      environmentAssetsRef.current,
      complete ? 'routeDoor' : 'sealedGate',
      gateVisual,
      { mode: 'stretch' },
    );
    if (gateDrawn) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = complete ? 18 : 10;
      ctx.globalAlpha = complete ? 0.72 : 0.92;
      drawAtlasRegion(
        ctx,
        environmentAssetsRef.current,
        'ancientSeal',
        { x: gateCenter - 22, y: gateVisual.y + gateVisual.height * 0.52, width: 44, height: 44 },
        { mode: 'contain' },
      );
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      drawGroundDustLip(ctx, gateCenter, GROUND_Y + 1, gateVisual.width * 0.7, 'rgba(184, 116, 52, 0.24)');
      drawDecorativeBaseBlend(ctx, gateCenter, GROUND_Y + 2, gateVisual.width * 0.76, getSectionForX(gate.x).id, 'midground', 0.86);
      if (current.renderStats) current.renderStats.groundedPropCount += 1;
      ctx.restore();
      return;
    }

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = complete ? 14 : 8;
    ctx.fillStyle = complete ? 'rgba(22, 101, 52, 0.28)' : 'rgba(69, 26, 3, 0.36)';
    ctx.beginPath();
    ctx.roundRect(screenX - 14, fallbackTop, gate.width + 28, fallbackHeight, 8);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#5f4938';
    ctx.fillRect(screenX - 22, fallbackTop + 4, 20, fallbackHeight - 4);
    ctx.fillRect(screenX + gate.width + 2, fallbackTop + 4, 20, fallbackHeight - 4);
    ctx.fillStyle = '#7a5b3d';
    ctx.fillRect(screenX - 26, fallbackTop - 8, gate.width + 52, 18);
    ctx.fillStyle = '#3b2b22';
    ctx.fillRect(screenX, fallbackTop + 16, gate.width, fallbackHeight - 28);

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(screenX + 4, fallbackTop + 24, gate.width - 8, fallbackHeight - 44);
    ctx.strokeStyle = 'rgba(255, 236, 180, 0.25)';
    ctx.lineWidth = 1;
    for (let y = fallbackTop + 38; y < fallbackTop + fallbackHeight - 22; y += 22) {
      ctx.beginPath();
      ctx.moveTo(screenX + 8, y);
      ctx.lineTo(screenX + gate.width - 8, y + 5);
      ctx.stroke();
    }

    ctx.fillStyle = complete ? '#bbf7d0' : '#fef3c7';
    ctx.beginPath();
    ctx.arc(gateCenter, fallbackTop + fallbackHeight * 0.56, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = '#3b2b22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(gateCenter, fallbackTop + fallbackHeight * 0.56 - 2, 8, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#3b2b22';
    ctx.fillRect(gateCenter - 9, fallbackTop + fallbackHeight * 0.56 - 2, 18, 13);
    drawGroundDustLip(ctx, gateCenter, GROUND_Y + 1, gate.width + 54, 'rgba(184, 116, 52, 0.22)');
    ctx.restore();
  }, [drawContactShadow, drawDecorativeBaseBlend, drawGroundDustLip]);

  const drawMissingObjectiveMarker = useCallback((ctx, guidance, cameraX, now) => {
    if (!guidance?.activeGateLocked || !guidance.nearestMissingObjective) return;
    const target = guidance.nearestMissingObjective;
    const isShardTarget = target.type === 'shards' || String(target.id || '').startsWith('shard-');
    if (isShardTarget) return;
    const targetScreenX = worldToScreenX(target.x, cameraX);
    const pulse = Math.sin(now / 140) * 0.25 + 0.75;
    ctx.save();
    ctx.strokeStyle = `rgba(251, 191, 36, ${pulse})`;
    ctx.fillStyle = '#78350f';
    ctx.lineWidth = 3;
    if (targetScreenX > 24 && targetScreenX < CANVAS_WIDTH - 24) {
      ctx.beginPath();
      ctx.arc(targetScreenX, 292, 20 + pulse * 6, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const arrowX = targetScreenX < 0 ? 30 : CANVAS_WIDTH - 30;
      const direction = targetScreenX < 0 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(arrowX + direction * 13, 112);
      ctx.lineTo(arrowX - direction * 13, 98);
      ctx.lineTo(arrowX - direction * 13, 126);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }, []);

  const drawHazard = useCallback((ctx, hazard, cameraX, current, now) => {
    const hx = worldToScreenX(hazard.x, cameraX);
    if (!isHorizontallyVisible(hazard.x, hazard.width, cameraX, 50)) return;

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
    const section = getSectionForX(hazard.x);
    const grounding = HAZARD_GROUNDING[hazard.id] || HAZARD_GROUNDING['spike-trap'];
    const centerX = hx + hazard.width / 2;
    const footY = baseY + hazard.height;
    const dustWidth = hazard.width * (grounding.dustWidth || 0.9);

    ctx.save();
    const hazardAssetKey = getEnvironmentAssetKeyForHazard(hazard);
    const hazardDest = {
      x: hx - grounding.xPad,
      y: baseY - grounding.yOffset,
      width: hazard.width + grounding.widthPad,
      height: Math.max(12, hazard.height + grounding.heightPad),
    };
    if (hazard.id !== 'bat-cloud' && hazard.id !== 'dust-wave') {
      drawContactShadow(ctx, centerX, footY + 3, hazard.width * 0.92, grounding.shadow, 0.9);
    }
    if (dustWidth > 0) {
      drawGroundDustLip(ctx, centerX, footY + 1, dustWidth, 'rgba(122, 78, 37, 0.16)');
    }
    ctx.save();
    ctx.filter = grounding.filter;
    const hazardDrawn = drawAtlasRegion(
      ctx,
      environmentAssetsRef.current,
      hazardAssetKey,
      hazardDest,
      { mode: 'contain' },
    );
    ctx.restore();
    if (hazardDrawn) {
      if (dustWidth > 0) {
        drawGroundDustLip(ctx, centerX, footY + 2, dustWidth * 0.82, 'rgba(209, 143, 72, 0.24)');
        drawHazardGroundApron(ctx, centerX, footY + 4, dustWidth, section.id, hazard.id === 'sand-pit' || hazard.id === 'dark-gap' ? 1.2 : 0.82);
      }
      if (hitActive) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.62)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(hx + 10, footY + 4);
        ctx.lineTo(hx + hazard.width - 10, footY + 4);
        ctx.stroke();
      }
      if (grounding.warning === 'ground' && nearPlayer && current.hazardCooldown <= 0) {
        ctx.globalAlpha = 0.68 + pulse * 0.16;
        ctx.fillStyle = visual.color;
        ctx.beginPath();
        ctx.moveTo(hx + 8, footY - 4);
        ctx.lineTo(hx + 16, footY - 18);
        ctx.lineTo(hx + 24, footY - 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fff7ed';
        ctx.font = '900 9px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(visual.icon, hx + 16, footY - 7);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      return;
    }

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
    if (hazard.id !== 'bat-cloud' && hazard.id !== 'dust-wave') {
      drawGroundDustLip(ctx, centerX, footY + 2, dustWidth * 0.82, 'rgba(185, 110, 45, 0.2)');
      drawHazardGroundApron(ctx, centerX, footY + 4, dustWidth, section.id, hazard.id === 'sand-pit' || hazard.id === 'dark-gap' ? 1.2 : 0.82);
    }
    if (hitActive) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.62)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(hx + 10, footY + 4);
      ctx.lineTo(hx + hazard.width - 10, footY + 4);
      ctx.stroke();
    }

    if (grounding.warning === 'ground' && nearPlayer && current.hazardCooldown <= 0) {
      ctx.fillStyle = visual.color;
      ctx.beginPath();
      ctx.moveTo(hx + 8, footY - 4);
      ctx.lineTo(hx + 16, footY - 18);
      ctx.lineTo(hx + 24, footY - 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff7ed';
      ctx.font = '900 9px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(visual.icon, hx + 16, footY - 7);
    }
    ctx.restore();
  }, [drawContactShadow, drawGroundDustLip, drawHazardGroundApron]);

  const drawSmallEnemySprite = useCallback((ctx, enemy, screenX, now, shakeX = 0) => {
    const family = getEnemySpriteFamily(enemy);
    if (!family) return false;
    const combatMode = getCombatMode(enemy);
    const frameKey = getEnemySpriteFrame(enemy, combatMode, now);
    const drawBox = getEnemySpriteDrawBox(enemy, screenX, shakeX, combatMode);
    if (!frameKey || !drawBox) return false;

    const assets = enemySpriteAssetsRef.current;
    if (!assets.loaded || assets.failed) return false;

    const centerX = screenX + enemy.width / 2 + shakeX;
    const baseY = enemy.y + enemy.height;
    const facing = (enemy.attackTimer > 0 || enemy.attackWindup > 0)
      ? enemy.attackDirection
      : enemy.direction;
    const shouldFlip = family === 'bat' ? facing < 0 : facing > 0;

    ctx.save();
    const shadowWidth = family === 'bat' ? drawBox.width * 0.72 : drawBox.width * 0.78;
    drawContactShadow(ctx, centerX, baseY + (family === 'bat' ? 10 : 3), shadowWidth, family === 'bat' ? 0.16 : 0.24, 1);

    ctx.shadowColor = family === 'bat'
      ? 'rgba(250, 204, 21, 0.38)'
      : 'rgba(15, 23, 42, 0.52)';
    ctx.shadowBlur = family === 'bat' ? 12 : 8;
    if (enemy.defeated) {
      ctx.globalAlpha = family === 'bat' ? 0.78 : 0.84;
      ctx.filter = 'saturate(0.86) brightness(0.92)';
    } else if (enemy.hitFlash > 0) {
      ctx.filter = 'brightness(1.35) saturate(1.15)';
    } else if (family === 'bat') {
      ctx.filter = 'brightness(1.12) contrast(1.08)';
    }

    if (shouldFlip) {
      ctx.translate(drawBox.x + drawBox.width / 2, 0);
      ctx.scale(-1, 1);
    }

    const drawn = drawAtlasRegion(
      ctx,
      assets,
      frameKey,
      {
        x: shouldFlip ? -drawBox.width / 2 : drawBox.x,
        y: drawBox.y,
        width: drawBox.width,
        height: drawBox.height,
      },
      { mode: 'contain' },
    );
    ctx.restore();

    if (drawn && stateRef.current.renderStats) {
      const stats = stateRef.current.renderStats;
      stats.visibleEnemySpriteFamilies = Array.from(new Set([...(stats.visibleEnemySpriteFamilies || []), family]));
      const frameState = `${enemy.id}:${family}:${combatMode}:${frameKey}`;
      stats.enemySpriteFrameStates = [...(stats.enemySpriteFrameStates || []), frameState].slice(-12);
    }

    return drawn;
  }, [drawContactShadow, getCombatMode]);

  const drawLinkedEnemySprite = useCallback((ctx, enemy, screenX, now, shakeX = 0) => {
    const combatMode = getCombatMode(enemy);
    const centerX = screenX + enemy.width / 2 + shakeX;
    const baseY = enemy.y + enemy.height;
    const facing = (enemy.attackTimer > 0 || enemy.attackWindup > 0)
      ? enemy.attackDirection
      : enemy.direction;

    if (enemy.type === 'guardian' || enemy.type === 'statue') {
      const bossId = enemy.type === 'statue' ? 'ancient-construct' : 'temple-guardian';
      const pack = getBossSpritePack(bossSpriteAssetsRef.current, bossId);
      if (!pack) return false;
      const frameKey = enemy.type === 'statue'
        ? (combatMode === 'defeated' ? 'ancientConstructDefeated' : enemy.hitFlash > 0 || combatMode === 'stunned' ? 'ancientConstructHit' : combatMode === 'windup' ? 'ancientConstructWindup' : combatMode === 'attacking' ? 'ancientConstructSlam' : 'ancientConstructWalk1')
        : (combatMode === 'defeated' ? 'stoneGuardianDefeated' : enemy.hitFlash > 0 || combatMode === 'stunned' ? 'stoneGuardianHit' : combatMode === 'windup' ? 'stoneGuardianWindup' : combatMode === 'attacking' ? 'stoneGuardianSlam' : 'stoneGuardianWalk1');
      const width = enemy.type === 'statue' ? 82 : 76;
      const height = enemy.type === 'statue' ? 82 : 78;
      const drawBox = {
        x: centerX - width / 2,
        y: baseY - height + 4,
        width,
        height,
      };
      const shouldFlip = facing > 0;
      ctx.save();
      drawContactShadow(ctx, centerX, baseY + 3, width * 0.74, enemy.defeated ? 0.12 : 0.24, 1);
      if (enemy.defeated) ctx.globalAlpha = 0.82;
      if (enemy.hitFlash > 0) ctx.filter = 'brightness(1.26) saturate(1.08)';
      if (shouldFlip) {
        ctx.translate(drawBox.x + drawBox.width / 2, 0);
        ctx.scale(-1, 1);
      }
      const drawn = drawAtlasRegion(
        ctx,
        pack,
        frameKey,
        {
          x: shouldFlip ? -drawBox.width / 2 : drawBox.x,
          y: drawBox.y,
          width: drawBox.width,
          height: drawBox.height,
        },
        { mode: 'contain' },
      );
      ctx.restore();
      if (drawn && stateRef.current.renderStats) {
        const stats = stateRef.current.renderStats;
        stats.visibleEnemySpriteFamilies = Array.from(new Set([...(stats.visibleEnemySpriteFamilies || []), enemy.type]));
        const frameState = `${enemy.id}:${enemy.type}:${combatMode}:${frameKey}`;
        stats.enemySpriteFrameStates = [...(stats.enemySpriteFrameStates || []), frameState].slice(-12);
      }
      return drawn;
    }

    if (enemy.type === 'looter' && playerSpriteRef.current.loaded && playerSpriteRef.current.image) {
      const frame = combatMode === 'defeated'
        ? 1
        : Math.floor(now / 180) % PLAYER_SPRITE_FRAME_COUNT;
      const drawHeight = enemy.defeated ? 46 : 72;
      const drawWidth = PLAYER_SPRITE_FRAME_WIDTH * (drawHeight / PLAYER_SPRITE_FRAME_HEIGHT);
      const drawX = centerX - drawWidth / 2;
      const drawY = baseY - drawHeight + (enemy.defeated ? 8 : 0);
      const shouldFlip = facing > 0;
      ctx.save();
      drawContactShadow(ctx, centerX, baseY + 3, drawWidth * 0.56, enemy.defeated ? 0.11 : 0.2, 1);
      ctx.filter = enemy.hitFlash > 0
        ? 'brightness(1.22) sepia(40%) saturate(0.8)'
        : 'sepia(38%) saturate(0.72) brightness(0.78)';
      ctx.globalAlpha = enemy.defeated ? 0.72 : 0.92;
      if (shouldFlip) {
        ctx.translate(drawX + drawWidth / 2, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(
        playerSpriteRef.current.image,
        frame * PLAYER_SPRITE_FRAME_WIDTH,
        0,
        PLAYER_SPRITE_FRAME_WIDTH,
        PLAYER_SPRITE_FRAME_HEIGHT,
        shouldFlip ? -drawWidth / 2 : drawX,
        drawY,
        drawWidth,
        drawHeight,
      );
      ctx.restore();
      if (stateRef.current.renderStats) {
        const stats = stateRef.current.renderStats;
        stats.visibleEnemySpriteFamilies = Array.from(new Set([...(stats.visibleEnemySpriteFamilies || []), 'looter']));
        const frameState = `${enemy.id}:looter:${combatMode}:playerFrame${frame}`;
        stats.enemySpriteFrameStates = [...(stats.enemySpriteFrameStates || []), frameState].slice(-12);
      }
      return true;
    }

    return false;
  }, [drawContactShadow, getCombatMode]);

  const drawBossSprite = useCallback((ctx, boss, screenX, now, bossVisualState) => {
    const supportedBoss = boss.id === 'scarab-queen'
      || boss.id === 'temple-guardian'
      || boss.id === 'ancient-construct';
    if (!supportedBoss) return false;
    const combatMode = getCombatMode(boss);
    const frameKey = boss.id === 'ancient-construct'
      ? getAncientConstructSpriteFrame(boss, combatMode, bossVisualState, now)
      : boss.id === 'temple-guardian'
        ? getStoneGuardianSpriteFrame(boss, combatMode, bossVisualState, now)
        : getScarabQueenSpriteFrame(boss, combatMode, bossVisualState, now);
    const drawBox = boss.id === 'ancient-construct'
      ? getAncientConstructDrawBox(boss, screenX)
      : boss.id === 'temple-guardian'
        ? getStoneGuardianDrawBox(boss, screenX)
        : getScarabQueenDrawBox(boss, screenX);
    const pack = getBossSpritePack(bossSpriteAssetsRef.current, boss.id);
    if (!frameKey || !drawBox || !pack) return false;

    const facing = (boss.attackTimer > 0 || boss.attackWindup > 0)
      ? boss.attackDirection
      : boss.direction;
    const shouldFlip = facing > 0;
    const centerX = screenX + boss.width / 2;
    const baseY = boss.y + boss.height;

    ctx.save();
    const isStoneBoss = boss.id === 'temple-guardian' || boss.id === 'ancient-construct';
    drawContactShadow(ctx, centerX, baseY + 3, drawBox.width * (isStoneBoss ? 0.86 : 0.78), isStoneBoss ? 0.34 : 0.28, 1.5);
    if (isStoneBoss && (combatMode === 'attacking' || combatMode === 'windup')) {
      drawGroundDustLip(ctx, centerX, baseY + 2, drawBox.width * 0.72, 'rgba(197, 148, 72, 0.28)');
    }
    ctx.shadowColor = bossVisualState?.shielded
      ? 'rgba(125, 211, 252, 0.45)'
      : bossVisualState?.vulnerable
        ? 'rgba(74, 222, 128, 0.44)'
        : 'rgba(15, 23, 42, 0.55)';
    ctx.shadowBlur = bossVisualState?.shielded || bossVisualState?.vulnerable ? 16 : isStoneBoss ? 12 : 10;
    if (boss.hitFlash > 0 || combatMode === 'stunned') {
      ctx.filter = 'brightness(1.28) saturate(1.12)';
    }
    if (shouldFlip) {
      ctx.translate(drawBox.x + drawBox.width / 2, 0);
      ctx.scale(-1, 1);
    }
    const drawn = drawAtlasRegion(
      ctx,
      pack,
      frameKey,
      {
        x: shouldFlip ? -drawBox.width / 2 : drawBox.x,
        y: drawBox.y,
        width: drawBox.width,
        height: drawBox.height,
      },
      { mode: 'contain' },
    );
    ctx.restore();

    if (drawn && stateRef.current.renderStats) {
      stateRef.current.renderStats.activeBossSprite = boss.id;
      stateRef.current.renderStats.activeBossSpriteFrame = frameKey;
      stateRef.current.renderStats.activeBossAnimationState = combatMode;
      if (boss.id === 'temple-guardian') {
        stateRef.current.renderStats.stoneGuardianSpriteFrame = frameKey;
      }
      if (boss.id === 'ancient-construct') {
        stateRef.current.renderStats.ancientConstructSpriteFrame = frameKey;
      }
    }

    return drawn;
  }, [drawContactShadow, drawGroundDustLip, getCombatMode]);

  const drawMiniBoss = useCallback((ctx, boss, screenX, now) => {
    const pulse = Math.sin(now / 400) * 0.12 + 0.88;
    const cx = screenX + boss.width / 2;
    const cy = boss.y + boss.height / 2;
    const bossVisualState = getBossVulnerabilityState(boss);

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

    const bossSpriteDrawn = drawBossSprite(ctx, boss, screenX, now, bossVisualState);

    if (bossSpriteDrawn) {
      // Sprite atlas handles supported boss body art; shared health/status UI below remains unchanged.
    } else if (boss.type === 'guardian' || boss.type === 'statue') {
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
    } else if (boss.vulnerabilityTimer > 0) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 34 + Math.sin(now / 90) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }, [drawBossSprite, getBossVulnerabilityState]);

  const drawAttackArc = useCallback((ctx, box, cameraX, direction, color = '#facc15') => {
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
    ctx.restore();
  }, []);

  const drawEnemyAttackTell = useCallback((ctx, entity, screenX, cameraX, now, isBoss = false, suppressLabels = false) => {
    const cx = screenX + entity.width / 2;
    const cy = entity.y + entity.height / 2;
    const feetY = entity.y + entity.height + 3;
    const warning = entity.attackWindup > 0;
    const attacking = entity.attackTimer > 0;
    const shielded = isBoss && entity.shieldTimer > 0;
    const vulnerable = isBoss && entity.vulnerabilityTimer > 0;
    if (!warning && !attacking && !shielded && !vulnerable) return;

    ctx.save();
    if (shielded) {
      const glow = 0.55 + Math.sin(now / 90) * 0.18;
      ctx.fillStyle = `rgba(125, 211, 252, ${glow})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 22);
      ctx.lineTo(cx + 14, cy - 8);
      ctx.lineTo(cx + 8, cy + 12);
      ctx.lineTo(cx - 8, cy + 12);
      ctx.lineTo(cx - 14, cy - 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(3, 105, 161, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (!suppressLabels) {
        drawFieldNoteLabel(ctx, cx, entity.y - 48, 'WAIT', '#0369a1');
      }
    } else if (vulnerable) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.24)';
      ctx.beginPath();
      ctx.ellipse(cx, feetY, isBoss ? 48 : 30, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(22, 101, 52, 0.72)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - (isBoss ? 32 : 20), feetY - 3);
      ctx.lineTo(cx + (isBoss ? 32 : 20), feetY - 3);
      ctx.stroke();
      if (!suppressLabels) {
        drawFieldNoteLabel(ctx, cx, entity.y - 48, 'OPEN', '#166534');
      }
    }
    if (warning) {
      const pulse = Math.sin(now / 80) * 0.25 + 0.75;
      const reach = isBoss ? 44 : 28;
      const dir = entity.attackDirection || entity.direction || 1;
      ctx.fillStyle = `rgba(248, 113, 113, ${0.16 + pulse * 0.14})`;
      ctx.beginPath();
      ctx.ellipse(cx + dir * reach * 0.62, feetY, reach, isBoss ? 9 : 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(127, 29, 29, ${0.45 + pulse * 0.25})`;
      ctx.lineWidth = isBoss ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(cx, feetY - 4);
      ctx.lineTo(cx + dir * reach, feetY - 4);
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
      if (isBoss && entity.attackPhaseLabel && !suppressLabels) {
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
      const dir = entity.attackDirection || 1;
      const boxX = box.x - cameraX;
      const attackColor = isBoss ? (isRanged ? 'rgba(125, 211, 252, 0.34)' : isArea ? 'rgba(250, 204, 21, 0.34)' : 'rgba(251, 146, 60, 0.34)') : 'rgba(248, 113, 113, 0.3)';
      ctx.fillStyle = attackColor;
      ctx.beginPath();
      if (isArea) {
        ctx.ellipse(boxX + box.width / 2, box.y + box.height - 4, box.width / 2, 9, 0, 0, Math.PI * 2);
      } else {
        ctx.moveTo(dir >= 0 ? boxX : boxX + box.width, box.y + box.height * 0.15);
        ctx.lineTo(dir >= 0 ? boxX + box.width : boxX, box.y + box.height * 0.5);
        ctx.lineTo(dir >= 0 ? boxX : boxX + box.width, box.y + box.height * 0.85);
        ctx.closePath();
      }
      ctx.fill();
      ctx.strokeStyle = isBoss ? 'rgba(120, 53, 15, 0.62)' : 'rgba(127, 29, 29, 0.58)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (isBoss && entity.attackPhaseLabel && !suppressLabels) {
        drawFieldNoteLabel(ctx, cx, entity.y - 36, entity.attackPhaseLabel, '#b45309');
      }
    }
    ctx.restore();
  }, [drawFieldNoteLabel, getAttackBox]);

  const drawCombatEffects = useCallback((ctx, effects, cameraX, now) => {
    effects.forEach((effect) => {
      const progress = effect.timer / (effect.maxTimer || 0.35);
      const x = effect.x - cameraX;
      const y = effect.y;
      const compactTypes = new Set([
        'enemy-counter-window',
        'boss-vulnerable',
        'enemy-shield',
        'boss-shield',
        'boss-telegraph',
        'attack-stamina',
      ]);
      ctx.save();
      ctx.globalAlpha = Math.max(0, progress);
      ctx.strokeStyle = effect.color || '#facc15';
      ctx.fillStyle = effect.color || '#facc15';
      ctx.lineWidth = 3;
      if (compactTypes.has(effect.type)) {
        ctx.globalAlpha = Math.max(0, progress * 0.9);
        ctx.beginPath();
        ctx.ellipse(x, y + 14, 28 + (1 - progress) * 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        if (effect.text) {
          ctx.font = '900 12px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.82)';
          ctx.strokeText(effect.text, x, y - 18 - (1 - progress) * 10);
          ctx.fillText(effect.text, x, y - 18 - (1 - progress) * 10);
        }
        ctx.restore();
        return;
      }
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
    ctx.setTransform(
      JOURNEY_RENDER_TARGET.virtualToNativeScaleX,
      0,
      0,
      JOURNEY_RENDER_TARGET.virtualToNativeScaleY,
      0,
      0,
    );
    const player = current.player;
    const now = Date.now();
    const section = getSectionForX(player.x);
    const atmosphere = SECTION_ATMOSPHERES[section.id] || SECTION_ATMOSPHERES[SECTIONS[0].id];
    const shake = current.cameraShakeTimer > 0
      ? Math.sin(now / 28) * current.cameraShakeStrength * 7
      : 0;
    const cameraX = clampCameraX((Number.isFinite(current.cameraX) ? current.cameraX : 0) + shake);
    const isPlayerNear = (worldX, distance = 240) => Math.abs((player.x + player.width / 2) - worldX) < distance;
    const activeRouteGate = ROUTE_GATES.find(gate => !current.openedRouteGateIds.has(gate.id));
    const activeGateGuidance = activeRouteGate ? getGateGuidance(activeRouteGate, current) : null;
    const playerCenterX = player.x + player.width / 2;
    const crowdedGateActive = Boolean(activeRouteGate && Math.abs((activeRouteGate.x + activeRouteGate.width / 2) - playerCenterX) < 360);
    const crowdedBossActive = current.miniBosses.some(boss => boss.awakened && !boss.defeated && Math.abs(boss.x - player.x) < 360);
    const labelSuppressionActive = crowdedGateActive || crowdedBossActive || current.bossIntroTimer > 0;
    current.renderStats = {
      visibleLabelCount: 0,
      labelSuppressionActive,
      atlasTuningVersion: ATLAS_TUNING_VERSION,
      activeAtlasRegionIssues: getMissingEnvironmentAssets(environmentAssetsRef.current),
      parallaxLayersActive: false,
      activeBackgroundSection: null,
      backgroundDepthMode: 'canvas-fallback',
      platformVisualTuningActive: true,
      journeyPolishPassActive: true,
      journeyPolishVersion: JOURNEY_POLISH_VERSION,
      hazardReadabilityMode: 'soft-warning-cues',
      enemyVisualMode: enemySpriteAssetsRef.current.loaded ? 'sprite-atlas-with-grounding' : 'canvas-fallback',
      bossVisualMode: bossSpriteAssetsRef.current.loaded ? 'multi-boss-atlas-fallback-safe' : 'canvas-fallback',
      collectibleVisualMode: collectibleSpriteAssetsRef.current.loaded ? 'sprite-atlas-with-fallback' : 'canvas-fallback',
      playerWeaponVisualMode: playerWeaponSpriteRef.current.loaded ? 'khopesh-sprite-atlas' : 'canvas-fallback',
      desertVisualTuningVersion: DESERT_VISUAL_TUNING_VERSION,
      assetGroundingPassActive: true,
      groundedPropCount: 0,
      backgroundPropTintActive: true,
      platformGroundingMode: 'contact-shadow-ledges',
      propDrawOrderMode: DECORATIVE_PROP_LAYER_MODE,
      decorativePropLayerMode: DECORATIVE_PROP_LAYER_MODE,
      propDepthTuningVersion: PROP_DEPTH_TUNING_VERSION,
      floatingAssetWarnings: [],
      assetGroundingVersion: JOURNEY_ASSET_GROUNDING_VERSION,
      visibleEnemySpriteFamilies: [],
      enemySpriteFrameStates: [],
      activeBossSprite: null,
      activeBossSpriteFrame: null,
      activeBossAnimationState: null,
      stoneGuardianSpriteFrame: null,
      ancientConstructSpriteFrame: null,
      visibleToolSprites: [],
      visibleShardSprites: [],
      visibleUpgradeSprites: [],
      visibleObjectiveSprites: [],
      visibleCollectibleCount: 0,
      playerWeaponFrame: getPlayerWeaponFrameKey(getPlayerAttackState(current)),
    };
    const showWorldLabel = (worldX, distance = 150, priority = 'normal') => {
      const near = isPlayerNear(worldX, distance);
      if (priority === 'critical') return near && !labelSuppressionActive && Math.abs(worldX - playerCenterX) < distance;
      if (priority === 'combat') return near && !labelSuppressionActive;
      return near && !labelSuppressionActive;
    };

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const desertBackgroundDrawn = drawDesertEntryBackground(ctx, section, cameraX);
    const sectionParallaxDrawn = !desertBackgroundDrawn && drawSectionParallaxBackground(ctx, section, cameraX);
    if (desertBackgroundDrawn) {
      current.renderStats.parallaxLayersActive = true;
      current.renderStats.activeBackgroundSection = 'desert-entry';
      current.renderStats.backgroundDepthMode = DESERT_BACKGROUND_DEPTH_MODE;
    } else if (sectionParallaxDrawn) {
      current.renderStats.parallaxLayersActive = true;
      current.renderStats.activeBackgroundSection = section.id;
      current.renderStats.backgroundDepthMode = JOURNEY_BACKGROUND_DEPTH_MODE;
    } else {
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
    }

    const parallaxBackgroundDrawn = desertBackgroundDrawn || sectionParallaxDrawn;

    // --- Ground & Props ---
    if (!parallaxBackgroundDrawn) drawTempleBackdrop(ctx, section, cameraX);
    STORY_PROPS.forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'background'));
    drawParticles(ctx, atmosphere, cameraX, now);

    // --- Environment Layers (Parallax) ---
    if (!parallaxBackgroundDrawn && section.id !== 'ruined-temple') {
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
    }
    drawDesertForegroundAtmosphere(ctx, section, cameraX);
    STORY_PROPS.forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'midground'));

    // --- Entities ---
    PLATFORMS.forEach((platform) => drawPlatform(ctx, platform, cameraX, current));
    drawSectionTransitionBlend(ctx, cameraX);
    
    HAZARDS.forEach((hazard) => drawHazard(ctx, hazard, cameraX, current, now));

    CHECKPOINTS.forEach((checkpoint) => {
      const cx = worldToScreenX(checkpoint.x, cameraX);
      if (!isHorizontallyVisible(checkpoint.x, 1, cameraX, 80)) return;
      const active = current.activeCheckpoint.id === checkpoint.id;
      ctx.save();
      ctx.fillStyle = active ? '#166534' : '#451a03';
      ctx.fillRect(cx - 2, checkpoint.y, 4, 80);
      if (active || showWorldLabel(checkpoint.x, 130)) {
        drawFieldNoteLabel(ctx, cx, checkpoint.y - 20, active ? 'CHECKPOINT' : checkpoint.name, active ? '#166534' : '#78350f');
      }
      ctx.restore();
    });

    ROUTE_GATES.forEach((gate) => {
      if (current.openedRouteGateIds.has(gate.id)) return;
      const gx = worldToScreenX(gate.x, cameraX);
      if (!isHorizontallyVisible(gate.x, gate.width, cameraX, 100)) return;
      const requirements = getGateRequirements(gate, current);
      const complete = requirements.every(r => r.met);
      drawRouteGate(ctx, gate, gx, current, complete);
    });
    drawMissingObjectiveMarker(ctx, activeGateGuidance, cameraX, now);

    current.enemies.forEach((enemy) => {
      const ex = worldToScreenX(enemy.x, cameraX);
      if (!isHorizontallyVisible(enemy.x, enemy.width, cameraX, 50)) return;
      
      ctx.save();
      const shakeX = enemy.hitFlash > 0 ? Math.sin(now / 20) * 5 : 0;
      if (!enemy.defeated) drawEnemyAttackTell(ctx, enemy, ex, cameraX, now, false, true);

      // Main Visual
      const spriteDrawn = drawSmallEnemySprite(ctx, enemy, ex, now, shakeX)
        || drawLinkedEnemySprite(ctx, enemy, ex, now, shakeX);
      if (!spriteDrawn) {
        if (enemy.defeated) {
          drawContactShadow(ctx, ex + enemy.width / 2, enemy.y + enemy.height + 3, enemy.width * 0.62, 0.12, 0.75);
          drawGroundDustLip(ctx, ex + enemy.width / 2, enemy.y + enemy.height + 2, enemy.width * 0.68, 'rgba(95, 58, 27, 0.24)');
        } else {
          drawContactShadow(ctx, ex + enemy.width / 2, enemy.y + enemy.height + 3, enemy.width * 0.72, 0.16, 0.75);
          ctx.fillStyle = enemy.type === 'guardian' || enemy.type === 'statue' ? '#6b7280' : '#78350f';
          ctx.strokeStyle = 'rgba(30, 18, 8, 0.45)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(ex + enemy.width / 2 + shakeX, enemy.y + enemy.height * 0.55, enemy.width * 0.45, enemy.height * 0.43, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
      
      // Health Bar (Small)
      if (!enemy.defeated && enemy.health > 1) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(ex, enemy.y - 12, enemy.width, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(ex, enemy.y - 12, (enemy.health / 2) * enemy.width, 4);
      }

      ctx.restore();
    });

    current.miniBosses.forEach((boss) => {
      if (boss.defeated) return;
      const bx = worldToScreenX(boss.x, cameraX);
      if (!isHorizontallyVisible(boss.x, boss.width, cameraX, 100)) return;
      drawMiniBoss(ctx, boss, bx, now);
      drawEnemyAttackTell(ctx, boss, bx, cameraX, now, true, crowdedGateActive);
    });

    const getShardVisualBaseY = (shard) => {
      const platform = PLATFORMS
        .filter(p => p.y !== GROUND_Y)
        .find(p => (
          shard.x >= p.x - 8
          && shard.x <= p.x + p.width + 8
          && Math.abs(shard.y - (p.y + p.height)) <= 34
        ));
      if (platform) return platform.y - 4;
      return shard.y + COLLECTIBLE_VISUAL_BASE.relicShard.anchorYOffset;
    };

    RELIC_SHARDS.forEach(shard => {
      if (current.collectedShardIds.has(shard.id)) return;
      const visible = !shard.hidden || current.collectedUpgrades.has('historian-vision');
      if (visible) {
        drawCollectible(ctx, shard.x, shard.y, cameraX, now, '💎', '#f59e0b', shard.hidden, true, {
          key: 'relicShard',
          kind: 'shard',
          size: COLLECTIBLE_VISUAL_BASE.relicShard.size,
          ringSize: COLLECTIBLE_VISUAL_BASE.relicShard.ringSize,
          glowAlpha: COLLECTIBLE_VISUAL_BASE.relicShard.glowAlpha,
          shadowAlpha: COLLECTIBLE_VISUAL_BASE.relicShard.shadowAlpha,
          bobAmplitude: COLLECTIBLE_VISUAL_BASE.relicShard.bobAmplitude,
          sparkleAlpha: COLLECTIBLE_VISUAL_BASE.relicShard.sparkleAlpha,
          sparkleSize: COLLECTIBLE_VISUAL_BASE.relicShard.sparkleSize,
          anchorYOffset: COLLECTIBLE_VISUAL_BASE.relicShard.anchorYOffset,
          nearGlowDistance: COLLECTIBLE_VISUAL_BASE.relicShard.nearGlowDistance,
          baseY: getShardVisualBaseY(shard),
          hideGlow: true,
        });
      }
    });

    UPGRADES.forEach(upgrade => {
      if (!current.collectedUpgrades.has(upgrade.id)) {
        drawCollectible(ctx, upgrade.x, upgrade.y, cameraX, now, upgrade.emoji, '#2563eb', false, false, {
          key: getUpgradeSpriteKey(upgrade.id),
          kind: 'upgrade',
          size: COLLECTIBLE_VISUAL_BASE.upgrade.size,
          ringSize: COLLECTIBLE_VISUAL_BASE.upgrade.ringSize,
          glowAlpha: COLLECTIBLE_VISUAL_BASE.upgrade.glowAlpha,
          shadowAlpha: COLLECTIBLE_VISUAL_BASE.upgrade.shadowAlpha,
          bobAmplitude: COLLECTIBLE_VISUAL_BASE.upgrade.bobAmplitude,
          sparkleAlpha: COLLECTIBLE_VISUAL_BASE.upgrade.sparkleAlpha,
          sparkleSize: COLLECTIBLE_VISUAL_BASE.upgrade.sparkleSize,
          anchorYOffset: COLLECTIBLE_VISUAL_BASE.upgrade.anchorYOffset,
          nearGlowDistance: COLLECTIBLE_VISUAL_BASE.upgrade.nearGlowDistance,
          hideGlow: true,
        });
        if (showWorldLabel(upgrade.x, 135, 'critical')) {
          drawFieldNoteLabel(ctx, upgrade.x - cameraX, upgrade.y - 30, upgrade.name, '#2563eb');
        }
      }
    });

    TOOL_LAYOUT.forEach(toolPos => {
      if (!current.collectedToolIds.has(toolPos.id)) {
        const tool = JOURNEY_TOOLS.find(t => t.id === toolPos.id);
        drawCollectible(ctx, toolPos.x, toolPos.y, cameraX, now, tool.emoji, '#d4af37', false, false, {
          key: getToolSpriteKey(toolPos.id),
          kind: 'tool',
          size: toolPos.id === 'field-guide-page'
            ? COLLECTIBLE_VISUAL_BASE.fieldTool.fieldGuideSize
            : COLLECTIBLE_VISUAL_BASE.fieldTool.size,
          ringSize: COLLECTIBLE_VISUAL_BASE.fieldTool.ringSize,
          glowAlpha: COLLECTIBLE_VISUAL_BASE.fieldTool.glowAlpha,
          shadowAlpha: COLLECTIBLE_VISUAL_BASE.fieldTool.shadowAlpha,
          bobAmplitude: COLLECTIBLE_VISUAL_BASE.fieldTool.bobAmplitude,
          sparkleAlpha: COLLECTIBLE_VISUAL_BASE.fieldTool.sparkleAlpha,
          sparkleSize: COLLECTIBLE_VISUAL_BASE.fieldTool.sparkleSize,
          anchorYOffset: COLLECTIBLE_VISUAL_BASE.fieldTool.anchorYOffset,
          nearGlowDistance: COLLECTIBLE_VISUAL_BASE.fieldTool.nearGlowDistance,
          hideGlow: true,
        });
        if (showWorldLabel(toolPos.x, 125)) {
          drawFieldNoteLabel(ctx, toolPos.x - cameraX, toolPos.y - 30, tool.name, '#b45309');
        }
      }
    });

    OBJECTIVE_MARKERS.forEach(marker => {
      if (current.collectedObjectiveIds.has(marker.id)) return;
      const mx = worldToScreenX(marker.x, cameraX);
      if (!isHorizontallyVisible(marker.x, 1, cameraX, 50)) return;
      const emoji = marker.type === 'switch' ? '⚙️' : marker.type === 'glyph' ? '📜' : marker.type === 'escape' ? '🏃' : '🚩';
      const markerNeeded = activeGateGuidance?.nearestMissingObjective?.id === marker.id;
      ctx.save();
      drawCollectible(ctx, marker.x + 15, marker.y + 12, cameraX, now, emoji, marker.color || '#b45309', false, false, {
        key: getObjectiveSpriteKey(marker.type),
        kind: 'objective',
        size: marker.type === 'map-tablet'
          ? COLLECTIBLE_VISUAL_BASE.objective.mapTabletSize
          : COLLECTIBLE_VISUAL_BASE.objective.size,
        ringSize: COLLECTIBLE_VISUAL_BASE.objective.ringSize,
        glowAlpha: 0,
        shadowAlpha: COLLECTIBLE_VISUAL_BASE.objective.shadowAlpha,
        bobAmplitude: COLLECTIBLE_VISUAL_BASE.objective.bobAmplitude,
        sparkleAlpha: COLLECTIBLE_VISUAL_BASE.objective.sparkleAlpha,
        sparkleSize: COLLECTIBLE_VISUAL_BASE.objective.sparkleSize,
        anchorYOffset: COLLECTIBLE_VISUAL_BASE.objective.anchorYOffset,
        nearGlowDistance: COLLECTIBLE_VISUAL_BASE.objective.nearGlowDistance,
        hideGlow: true,
      });
      if (showWorldLabel(marker.x, markerNeeded ? 170 : 120, markerNeeded ? 'critical' : 'normal')) {
        drawFieldNoteLabel(ctx, mx + 15, marker.y - 15, marker.label, marker.color || '#b45309');
      }
      ctx.restore();
    });

    const gateX = GATE.x - cameraX;
    if (gateX > -200 && gateX < CANVAS_WIDTH + 200) {
      ctx.save();
      drawContactShadow(ctx, gateX + GATE.width / 2, GATE.y + GATE.height + 2, GATE.width + 58, 0.28, 1.2);
      ctx.fillStyle = '#31543d';
      ctx.fillRect(gateX - 18, GATE.y - 20, GATE.width + 36, GATE.height + 20);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(gateX - 28, GATE.y - 28, GATE.width + 56, 10);
      ctx.fillStyle = '#1f3f2e';
      ctx.fillRect(gateX + 8, GATE.y + 12, GATE.width - 16, GATE.height - 12);
      ctx.strokeStyle = '#bbf7d0';
      ctx.lineWidth = 3;
      ctx.strokeRect(gateX + 10, GATE.y + 18, GATE.width - 20, GATE.height - 24);
      drawGroundDustLip(ctx, gateX + GATE.width / 2, GATE.y + GATE.height + 1, GATE.width + 42, 'rgba(74, 130, 82, 0.18)');
      ctx.fillStyle = 'rgba(250, 204, 21, 0.32)';
      ctx.beginPath();
      ctx.arc(gateX + GATE.width / 2, GATE.y + 18, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (current.attackTimer > 0) {
      drawAttackArc(ctx, current.playerAttackBox, cameraX, player.direction, '#facc15', 'SWING');
    }
    drawPlayerSprite(ctx, player.x - cameraX, player.y, player.width, player.height, player.direction, player.invulnerable, now);
    drawCombatEffects(ctx, current.combatHitEffects, cameraX, now);
    drawSectionParallaxForeground(ctx, section, cameraX);

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
  }, [drawAttackArc, drawCollectible, drawCombatEffects, drawContactShadow, drawDesertEntryBackground, drawDesertForegroundAtmosphere, drawEnemyAttackTell, drawGroundDustLip, drawHazard, drawLinkedEnemySprite, drawMiniBoss, drawMissingObjectiveMarker, drawParticles, drawPlatform, drawRouteGate, drawSectionParallaxBackground, drawSectionParallaxForeground, drawSectionTransitionBlend, drawSmallEnemySprite, drawStoryProp, drawTempleBackdrop, getGateGuidance, getGateRequirements, getPlayerAttackState, drawPlayerSprite, drawFieldNoteLabel]);

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

    const applyAttackStaminaCost = (amount, reason, text = null) => {
      if (!amount) return;
      current.resources.stamina = Math.max(1, current.resources.stamina - amount);
      current.playerAttackStaminaCost = amount;
      current.lastStaminaDelta = -amount;
      current.lastStaminaLossReason = reason;
      current.staminaFeedbackTimer = Math.max(current.staminaFeedbackTimer, 0.65);
      if (text) {
        addCombatEffect(current, {
          type: 'attack-stamina',
          x: player.x + player.width / 2,
          y: player.y + 8,
          text,
          color: '#f59e0b',
        });
      }
    };

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
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.damageCooldownTimer = Math.max(0, player.damageCooldownTimer - dt);
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
      if (current.attackHitIds.size === 0) {
        current.lastAttackResult = 'missed';
        applyAttackStaminaCost(MISSED_ATTACK_EXTRA_STAMINA_COST, 'Missed attack', '-1');
      }
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
    updatePlayerAnimation(current, dt);

    // Bounds
    player.x = clamp(player.x, 0, WORLD_WIDTH - player.width);
    if (player.y > JOURNEY_VIEWPORT.height + JOURNEY_WORLD_LAYOUT.rescueFallPadding) {
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
        audioControls?.playExpeditionStinger?.('evidenceDiscovery');
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
        audioControls?.playExpeditionStinger?.('evidenceDiscovery');
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
      current.attackRewarded = false;
      current.lastAttackResult = 'started';
      current.shieldedHitFeedback = '';
      applyAttackStaminaCost(PLAYER_ATTACK_STAMINA_COST, 'Attack swing');
      audioControls?.playAction?.();
    }
    if (current.attackTimer > 0) {
      attackRect = getAttackBox(player, 48, 30, player.direction);
      current.playerAttackBox = attackRect;
    } else {
      current.playerAttackBox = null;
    }

    const applyPlayerDamage = (amount, message, direction = 1, source = 'enemy') => {
      if (player.invulnerable > 0 || player.damageCooldownTimer > 0) return;
      current.resources.stamina = Math.max(0, current.resources.stamina - amount);
      player.invulnerable = INVULNERABLE_DURATION;
      player.damageCooldownTimer = INVULNERABLE_DURATION + 0.65;
      player.hitFeedbackTimer = 0.75;
      player.lastDamage = amount;
      player.lastDamageSource = source;
      player.lastDamageTime = Date.now();
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
      e.vulnerabilityTimer = Math.max(0, (e.vulnerabilityTimer || 0) - dt);
      e.shieldTimer = Math.max(0, (e.shieldTimer || 0) - dt);
      e.knockbackTimer = Math.max(0, e.knockbackTimer - dt);
      if (wasEnemyAttacking && e.attackTimer <= 0) {
        const pattern = getEnemyPatternConfig(e);
        e.attackRecovery = pattern.recovery;
        e.vulnerabilityTimer = pattern.vulnerableAfter;
        addCombatEffect(current, {
          type: 'enemy-counter-window',
          x: e.x + e.width / 2,
          y: e.y + e.height / 2,
          color: '#22c55e',
        });
      }

      const distanceToPlayer = (player.x + player.width / 2) - (e.x + e.width / 2);
      const nearPlayer = Math.abs(distanceToPlayer) < (e.type === 'bat' ? 145 : 110) && Math.abs(player.y - e.y) < 70;

      if (e.stunTimer <= 0 && e.attackTimer <= 0 && e.attackWindup <= 0 && nearPlayer && e.attackCooldown <= 0) {
        const pattern = getEnemyPatternConfig(e);
        e.attackWindup = pattern.windup;
        e.attackDirection = distanceToPlayer >= 0 ? 1 : -1;
        e.attackHasHit = false;
        e.attackReady = true;
        e.attackPattern = pattern.id;
        e.attackPhaseLabel = pattern.label;
        e.attackCooldown = pattern.cooldown;
        e.vulnerabilityTimer = 0;
        e.shieldTimer = pattern.shieldDuringWindup ? Math.min(0.45, pattern.windup * 0.7) : 0;
        current.notice = `${e.name} winds up ${pattern.label}. Dodge, then counter.`;
      }

      if (e.attackReady && e.attackWindup <= 0 && e.attackTimer <= 0) {
        e.attackTimer = getEnemyPatternConfig(e).duration;
        e.attackReady = false;
      }

      if (e.attackTimer > 0) {
        const pattern = getEnemyPatternConfig(e);
        e.x += e.attackDirection * pattern.speed * dt;
        const enemyAttackBox = getAttackBox(e, pattern.range, pattern.height, e.attackDirection);
        if (!e.attackHasHit && rectsOverlap(enemyAttackBox, player)) {
          e.attackHasHit = true;
          applyPlayerDamage(e.damage, `${e.name} attack connected. Stamina lost.`, e.attackDirection, e.name);
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
        const pattern = getEnemyPatternConfig(e);
        const protectedEnemy = (e.shieldTimer > 0)
          || (e.attackTimer > 0 && pattern.protectedDuringAttack && e.vulnerabilityTimer <= 0);
        if (protectedEnemy) {
          e.hitFlash = 0.14;
          e.attackCooldown = Math.max(e.attackCooldown, 0.35);
          current.attackRecoilTimer = Math.max(current.attackRecoilTimer, 0.1);
          current.lastAttackResult = 'protected';
          current.shieldedHitFeedback = `${e.name} blocked the rushed hit.`;
          player.vx += -player.direction * 45;
          applyAttackStaminaCost(PROTECTED_HIT_EXTRA_STAMINA_COST, 'Protected enemy blocked attack', '-1');
          addCombatEffect(current, {
            type: 'enemy-shield',
            x: e.x + e.width / 2,
            y: e.y + e.height / 2,
            text: 'WAIT',
            color: '#7dd3fc',
          });
          current.notice = `${e.name} blocked the rushed hit. Wait for an opening.`;
          return;
        }
        e.health -= 1;
        if (!current.attackRewarded) {
          current.resources.stamina = Math.min(100, current.resources.stamina + 1);
          current.attackRewarded = true;
        }
        current.lastAttackResult = e.vulnerabilityTimer > 0 || e.attackRecovery > 0 ? 'counter-hit' : 'hit';
        current.shieldedHitFeedback = '';
        e.stunTimer = 0.8;
        e.hitFlash = 0.25;
        e.attackWindup = 0;
        e.attackTimer = 0;
        e.attackReady = false;
        e.attackCooldown = Math.max(e.attackCooldown, 0.6);
        e.attackRecovery = 0.45;
        e.vulnerabilityTimer = 0.35;
        e.shieldTimer = 0;
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
      if (!current.seenBossIntroIds) current.seenBossIntroIds = new Set();
      if (!current.seenBossIntroIds.has(b.id) && Math.abs(b.x - player.x) < 400) {
        b.awakened = true;
        current.seenBossIntroIds.add(b.id);
        current.bossIntro = { id: b.id, title: b.name, message: b.intro, focusX: b.x };
        current.bossIntroTimer = 3;
      } else if (current.seenBossIntroIds.has(b.id) && Math.abs(b.x - player.x) < 400) {
        b.awakened = true;
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
          applyPlayerDamage(Math.max(4, Math.round(b.damage * (phase.damageScale || 1))), `${b.name} ${phase.label} landed. Dodge the tell, then counter.`, b.attackDirection, b.name);
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
        const { shielded, vulnerable } = getBossVulnerabilityState(b);
        const protectedBoss = shielded || ((b.attackWindup > 0 || b.attackTimer > 0) && !vulnerable);
        if (protectedBoss) {
          b.hitFlash = 0.16;
          b.attackCooldown = Math.max(b.attackCooldown, 0.35);
          current.attackRecoilTimer = Math.max(current.attackRecoilTimer, 0.12);
          current.lastAttackResult = 'protected';
          current.shieldedHitFeedback = `${b.name} protected itself.`;
          player.vx += -player.direction * 55;
          applyAttackStaminaCost(PROTECTED_HIT_EXTRA_STAMINA_COST, 'Protected boss blocked attack', '-1');
          addCombatEffect(current, {
            type: 'boss-shield',
            x: b.x + b.width / 2,
            y: b.y + b.height / 2,
            text: 'WAIT',
            color: '#7dd3fc',
          });
          current.notice = `${b.name} blocked the rushed hit. Wait for the counter window.`;
          return;
        }
        b.health -= 1;
        if (!current.attackRewarded) {
          current.resources.stamina = Math.min(100, current.resources.stamina + 1);
          current.attackRewarded = true;
        }
        current.lastAttackResult = b.vulnerabilityTimer > 0 || b.attackRecovery > 0 ? 'counter-hit' : 'hit';
        current.shieldedHitFeedback = '';
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
          audioControls?.playExpeditionStinger?.('gateUnlock');
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

    // Camera
    const camera = getCameraFollowTarget(current);
    current.targetCameraX = camera.targetCameraX;
    current.cameraMode = camera.mode;
    current.cameraFocusTarget = camera.focusTarget;
    if (!Number.isFinite(current.cameraX)) current.cameraX = camera.targetCameraX;
    const smoothing = camera.mode === 'boss-intro' ? JOURNEY_CAMERA.bossIntroSmoothing : JOURNEY_CAMERA.followSmoothing;
    const cameraStep = clamp(
      (current.targetCameraX - current.cameraX) * smoothing,
      -JOURNEY_CAMERA.maxStep,
      JOURNEY_CAMERA.maxStep,
    );
    current.cameraX = clampCameraX(current.cameraX + cameraStep);

    // Time
    current.timeAccumulator += dt;
    if (current.timeAccumulator >= 1) {
      current.resources.time -= 1;
      current.timeAccumulator = 0;
      if (current.resources.time <= 0) triggerJourneyRescue('Time expired. Field team rescued.');
    }

  }, [briefingOpen, audioControls, onComplete, triggerJourneyRescue, getAttackBox, getBossPhaseConfig, getBossVulnerabilityState, getEnemyPatternConfig, getObjectiveProgress, getGateGuidance, addCombatEffect, getPlayerAttackState, syncHud]);

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
    if (import.meta.env.DEV) {
      window.__setExpeditionJourneyDebugPosition = (x) => {
        const current = stateRef.current;
        const nextX = Number(x);
        if (!Number.isFinite(nextX)) return createJourneySnapshot(current);
        current.player.x = clamp(nextX, 0, WORLD_WIDTH - current.player.width);
        current.player.y = GROUND_Y - current.player.height;
        current.player.vx = 0;
        current.player.vy = 0;
        current.player.onGround = true;
        current.cameraX = clampCameraX(current.player.x - CANVAS_WIDTH * 0.42);
        current.targetCameraX = current.cameraX;
        step(0);
        return createJourneySnapshot(current);
      };
    }
    return () => {
      delete window.__advanceExpeditionJourney;
      delete window.__renderExpeditionJourneyState;
      delete window.__setExpeditionJourneyDebugPosition;
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
            <button
              type="button"
              className="journey-sidebar-toggle"
              onClick={() => setControlsOpen(open => !open)}
              aria-expanded={controlsOpen}
            >
              <ChevronDown size={14} />
              Controls
            </button>
            {controlsOpen && (
              <div className="journey-sidebar-controls" role="note" aria-label="Journey controls">
                <div><kbd>W/A/S/D</kbd><span>Move and jump</span></div>
                <div><kbd>J/K</kbd><span>Use tool</span></div>
              </div>
            )}
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
            <canvas
              ref={canvasRef}
              width={JOURNEY_RENDER_TARGET.nativeWidth}
              height={JOURNEY_RENDER_TARGET.nativeHeight}
              className="expedition-canvas"
            />
            
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
        </div>
      </div>

      {briefingOpen && (
        <div className="expedition-briefing-overlay">
          <div className="expedition-briefing-card animate-slide-up">
            <div className="briefing-header">
              <div className="briefing-header-copy">
                <div className="briefing-kicker">
                  <Flag size={16} />
                  Field Mission Dossier
                </div>
                <h1 className="cinzel-header">Lost Site Expedition</h1>
                <p>Navigate the ruins, collect your field kit, and reach Base Camp.</p>
              </div>
              <div className="briefing-hero-mark" aria-hidden="true">
                <span className="briefing-sun" />
                <span
                  className="briefing-hero-sprite"
                  style={{ backgroundImage: `url(${PLAYER_SPRITE_SRC})` }}
                />
              </div>
            </div>
            <div className="briefing-content">
              <div className="mission-dossier expedition-start-dossier">
                <div className="dossier-tag">ACTIVE MISSION</div>
                <h2 className="mission-title">{mission.title}</h2>
                <p className="mission-desc">
                  Search for evidence that shows Ancient Egypt had advanced engineering and organised construction.
                </p>
              </div>
              <div className="briefing-task-panel">
                <div className="briefing-task-heading">
                  <Map size={18} />
                  <h2>Your task</h2>
                </div>
                <ul className="briefing-task-list">
                  {[
                    'Collect field tools',
                    'Avoid hazards and conserve stamina',
                    'Reach Base Camp',
                    'Survey the site',
                    'Find 3 pieces of structural evidence',
                    'Make a claim using evidence',
                  ].map(task => (
                    <li key={task}>
                      <CheckCircle2 size={16} />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="briefing-actions">
              <button type="button" className="expedition-begin-btn" onClick={() => setBriefingOpen(false)}>
                Begin Expedition
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

ExpeditionJourney.tools = JOURNEY_TOOLS;
