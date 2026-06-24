import {
  ROME_JOURNEY_BOSS_SPRITE_PACK_IDS,
  ROME_LEGATE_REVENANT_BOSS_ID,
  ROME_LEGATE_REVENANT_SPRITE_ATLAS_JSON,
  ROME_LEGATE_REVENANT_SPRITE_KEYS,
} from './rome/romeBossSprites.js';

export const BOSS_SPRITE_BASE_PATH = 'assets/expedition/bosses/';
export const BOSS_SPRITE_ATLAS_JSON = `${BOSS_SPRITE_BASE_PATH}scarab-queen-sprites.json`;
export const STONE_GUARDIAN_SPRITE_ATLAS_JSON = `${BOSS_SPRITE_BASE_PATH}anubis-sprites.json`;
export const GIANT_SERPENT_SPRITE_ATLAS_JSON = `${BOSS_SPRITE_BASE_PATH}giant-serpent-sprites.json`;
export const ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON = `${BOSS_SPRITE_BASE_PATH}sphinx-sprites.json`;
export const CHINA_CLAY_RIVER_GUARDIAN_BOSS_ID = 'china-clay-river-guardian';
export const CHINA_BRONZE_GATE_WARDEN_BOSS_ID = 'china-bronze-gate-warden';
export const CHINA_JADE_SEAL_GUARDIAN_BOSS_ID = 'china-jade-seal-guardian';
export const CHINA_ARCHIVE_SENTRY_CAPTAIN_BOSS_ID = 'china-archive-sentry-captain';
export const CHINA_RAMMED_EARTH_SENTINEL_BOSS_ID = 'china-rammed-earth-sentinel';
export const CHINA_CLAY_GUARDIAN_BOSS_ID = CHINA_CLAY_RIVER_GUARDIAN_BOSS_ID;
export const CHINA_CLAY_RIVER_GUARDIAN_SPRITE_ATLAS_JSON = `${BOSS_SPRITE_BASE_PATH}china-clay-river-guardian-sprites.json`;
export const CHINA_BRONZE_GATE_WARDEN_SPRITE_ATLAS_JSON = `${BOSS_SPRITE_BASE_PATH}china-bronze-gate-warden-sprites.json`;
export const CHINA_JADE_SEAL_GUARDIAN_SPRITE_ATLAS_JSON = `${BOSS_SPRITE_BASE_PATH}china-jade-seal-guardian-sprites.json`;
export const CHINA_ARCHIVE_SENTRY_CAPTAIN_SPRITE_ATLAS_JSON = `${BOSS_SPRITE_BASE_PATH}china-archive-sentry-captain-sprites.json`;
export const CHINA_RAMMED_EARTH_SENTINEL_SPRITE_ATLAS_JSON = `${BOSS_SPRITE_BASE_PATH}china-rammed-earth-sentinel-sprites.json`;
export const CHINA_CLAY_GUARDIAN_SPRITE_ATLAS_JSON = CHINA_CLAY_RIVER_GUARDIAN_SPRITE_ATLAS_JSON;
export const BOSS_SPRITE_ATLAS_VERSION = 'boss-sprites-scarab-queen-regenerated-v2-2026-05-26';

export const MIN_BOSS_DRAW_HEIGHT = 176;
export const SCARAB_QUEEN_DRAW_OFFSET_X = 42;
export const SCARAB_QUEEN_FOOT_SINK = 16;
const getGroundedBossDrawBox = (boss, screenX, width, height, footSink = 4) => ({
  x: screenX + boss.width / 2 - width / 2,
  y: boss.y + boss.height - height + footSink,
  width,
  height,
});

const numberedSpriteKeys = (prefix, count) => (
  Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`)
);

export const SCARAB_QUEEN_ANIMATED_SPRITE_KEYS = [
  ...numberedSpriteKeys('scarabQueenWalk', 8),
  ...numberedSpriteKeys('scarabQueenRun', 8),
  ...numberedSpriteKeys('scarabQueenWindup', 6),
  ...numberedSpriteKeys('scarabQueenAcidSpit', 8),
  ...numberedSpriteKeys('scarabQueenAcid', 6),
  ...numberedSpriteKeys('scarabQueenStagger', 5),
  ...numberedSpriteKeys('scarabQueenDeath', 8),
];

export const SCARAB_QUEEN_SPRITE_KEYS = [...new Set([
  'scarabQueenIdle',
  'scarabQueenWalk1',
  'scarabQueenWalk2',
  'scarabQueenIntro',
  'scarabQueenWindup',
  'scarabQueenCharge',
  'scarabQueenAreaAttack',
  'scarabQueenShielded',
  'scarabQueenCounterWindow',
  'scarabQueenHit',
  'scarabQueenDefeated',
  ...SCARAB_QUEEN_ANIMATED_SPRITE_KEYS,
])];

export const STONE_GUARDIAN_SPRITE_KEYS = [
  'stoneGuardianIdle',
  'stoneGuardianWalk1',
  'stoneGuardianWalk2',
  'stoneGuardianAwakening',
  'stoneGuardianWindup',
  'stoneGuardianSlam',
  'stoneGuardianShockwave',
  'stoneGuardianShielded',
  'stoneGuardianCounterWindow',
  'stoneGuardianHit',
  'stoneGuardianDefeated',
];

export const GIANT_SERPENT_SPRITE_KEYS = [
  'giantSerpentIdle',
  'giantSerpentSlither1',
  'giantSerpentSlither2',
  'giantSerpentIntro',
  'giantSerpentWindup',
  'giantSerpentLunge',
  'giantSerpentVenom',
  'giantSerpentShielded',
  'giantSerpentCounterWindow',
  'giantSerpentHit',
  'giantSerpentDefeated',
];

export const ANCIENT_CONSTRUCT_SPRITE_KEYS = [
  'ancientConstructIdle',
  'ancientConstructWalk1',
  'ancientConstructWalk2',
  'ancientConstructIntro',
  'ancientConstructWindup',
  'ancientConstructSlam',
  'ancientConstructPulse',
  'ancientConstructShielded',
  'ancientConstructCounterWindow',
  'ancientConstructHit',
  'ancientConstructDefeated',
];

export const CLAY_GUARDIAN_SPRITE_KEYS = [
  'clayGuardianIdle',
  'clayGuardianWalk1',
  'clayGuardianWalk2',
  'clayGuardianIntro',
  'clayGuardianWindup',
  'clayGuardianSlam',
  'clayGuardianPulse',
  'clayGuardianShielded',
  'clayGuardianCounterWindow',
  'clayGuardianHit',
  'clayGuardianDefeated',
];

export const EXPECTED_BOSS_SPRITE_KEYS = [
  ...SCARAB_QUEEN_SPRITE_KEYS,
  ...STONE_GUARDIAN_SPRITE_KEYS,
  ...GIANT_SERPENT_SPRITE_KEYS,
  ...ANCIENT_CONSTRUCT_SPRITE_KEYS,
  ...CLAY_GUARDIAN_SPRITE_KEYS,
];

const BOSS_SPRITE_PACKS = {
  'scarab-queen': {
    atlasPath: BOSS_SPRITE_ATLAS_JSON,
    expectedKeys: SCARAB_QUEEN_SPRITE_KEYS,
  },
  'temple-guardian': {
    atlasPath: STONE_GUARDIAN_SPRITE_ATLAS_JSON,
    expectedKeys: STONE_GUARDIAN_SPRITE_KEYS,
  },
  'giant-serpent': {
    atlasPath: GIANT_SERPENT_SPRITE_ATLAS_JSON,
    expectedKeys: GIANT_SERPENT_SPRITE_KEYS,
  },
  'ancient-construct': {
    atlasPath: ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON,
    expectedKeys: ANCIENT_CONSTRUCT_SPRITE_KEYS,
  },
  [CHINA_CLAY_RIVER_GUARDIAN_BOSS_ID]: {
    atlasPath: CHINA_CLAY_RIVER_GUARDIAN_SPRITE_ATLAS_JSON,
    expectedKeys: CLAY_GUARDIAN_SPRITE_KEYS,
  },
  [CHINA_BRONZE_GATE_WARDEN_BOSS_ID]: {
    atlasPath: CHINA_BRONZE_GATE_WARDEN_SPRITE_ATLAS_JSON,
    expectedKeys: CLAY_GUARDIAN_SPRITE_KEYS,
  },
  [CHINA_JADE_SEAL_GUARDIAN_BOSS_ID]: {
    atlasPath: CHINA_JADE_SEAL_GUARDIAN_SPRITE_ATLAS_JSON,
    expectedKeys: CLAY_GUARDIAN_SPRITE_KEYS,
  },
  [CHINA_ARCHIVE_SENTRY_CAPTAIN_BOSS_ID]: {
    atlasPath: CHINA_ARCHIVE_SENTRY_CAPTAIN_SPRITE_ATLAS_JSON,
    expectedKeys: CLAY_GUARDIAN_SPRITE_KEYS,
  },
  [CHINA_RAMMED_EARTH_SENTINEL_BOSS_ID]: {
    atlasPath: CHINA_RAMMED_EARTH_SENTINEL_SPRITE_ATLAS_JSON,
    expectedKeys: CLAY_GUARDIAN_SPRITE_KEYS,
  },
  [ROME_LEGATE_REVENANT_BOSS_ID]: {
    atlasPath: ROME_LEGATE_REVENANT_SPRITE_ATLAS_JSON,
    expectedKeys: ROME_LEGATE_REVENANT_SPRITE_KEYS,
  },
};

export const EGYPT_JOURNEY_BOSS_SPRITE_PACK_IDS = [
  'scarab-queen',
  'temple-guardian',
  'giant-serpent',
  'ancient-construct',
];

export const CHINA_JOURNEY_BOSS_SPRITE_PACK_IDS = [
  CHINA_CLAY_RIVER_GUARDIAN_BOSS_ID,
  CHINA_BRONZE_GATE_WARDEN_BOSS_ID,
  CHINA_JADE_SEAL_GUARDIAN_BOSS_ID,
  CHINA_ARCHIVE_SENTRY_CAPTAIN_BOSS_ID,
  CHINA_RAMMED_EARTH_SENTINEL_BOSS_ID,
];

export { ROME_JOURNEY_BOSS_SPRITE_PACK_IDS };

export const CHINA_GUARDIAN_BOSS_IDS = [
  CHINA_CLAY_RIVER_GUARDIAN_BOSS_ID,
  CHINA_BRONZE_GATE_WARDEN_BOSS_ID,
  CHINA_JADE_SEAL_GUARDIAN_BOSS_ID,
  CHINA_ARCHIVE_SENTRY_CAPTAIN_BOSS_ID,
  CHINA_RAMMED_EARTH_SENTINEL_BOSS_ID,
];

export const isChinaGuardianBossSpriteId = (bossId) => CHINA_GUARDIAN_BOSS_IDS.includes(bossId);

const getAtlasImagePath = (atlasPath, imageName) => {
  if (!imageName) return null;
  if (imageName.startsWith('/') || imageName.startsWith('assets/')) return imageName;
  const atlasDir = atlasPath.includes('/') ? atlasPath.slice(0, atlasPath.lastIndexOf('/') + 1) : '';
  return `${atlasDir}${imageName}`;
};

export const createBossSpriteState = () => ({
  packs: {},
  loaded: false,
  ready: false,
  failed: false,
  error: null,
  atlasPath: BOSS_SPRITE_ATLAS_JSON,
  atlasPaths: Object.fromEntries(
    Object.entries(BOSS_SPRITE_PACKS).map(([bossId, pack]) => [bossId, pack.atlasPath]),
  ),
});

const getRequestedBossSpritePacks = (packIds = null) => {
  if (!Array.isArray(packIds) || packIds.length === 0) {
    return Object.entries(BOSS_SPRITE_PACKS);
  }
  const requested = new Set(packIds.filter(Boolean));
  return Object.entries(BOSS_SPRITE_PACKS).filter(([bossId]) => requested.has(bossId));
};

export const getMissingBossSpriteAssets = (assets) => {
  const packEntries = assets?.packs && Object.keys(assets.packs).length > 0
    ? Object.entries(BOSS_SPRITE_PACKS).filter(([bossId]) => assets.packs?.[bossId])
    : Object.entries(BOSS_SPRITE_PACKS);
  return packEntries.flatMap(([bossId, packConfig]) => {
    const pack = assets?.packs?.[bossId];
    const regions = pack?.atlas?.regions || {};
    return packConfig.expectedKeys
      .filter(key => !regions[key])
      .map(key => `${bossId}:${key}`);
  });
};

export const getBossSpritePack = (assets, bossId) => {
  const pack = assets?.packs?.[bossId];
  if (!pack?.loaded || pack.failed) return null;
  return pack;
};

export const loadBossSpritePack = ({ baseUrl = '/', onUpdate, packIds = null }) => {
  let cancelled = false;
  const packEntriesToLoad = getRequestedBossSpritePacks(packIds);

  const loadSinglePack = ([bossId, packConfig]) => {
    const atlasPath = `${baseUrl}${packConfig.atlasPath}`;
    return fetch(atlasPath)
      .then((response) => {
        if (!response.ok) throw new Error(`${bossId} boss sprite atlas request failed: ${response.status}`);
        return response.json();
      })
      .then((atlas) => new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          resolve([
            bossId,
            {
              image,
              atlas,
              loaded: true,
              ready: packConfig.expectedKeys.every(key => atlas?.regions?.[key]),
              failed: false,
              error: null,
              atlasPath: packConfig.atlasPath,
            },
          ]);
        };
        image.onerror = () => {
          resolve([
            bossId,
            {
              image: null,
              atlas,
              loaded: false,
              ready: false,
              failed: true,
              error: `${bossId} boss sprite image failed to load.`,
              atlasPath: packConfig.atlasPath,
            },
          ]);
        };
        image.src = `${baseUrl}${getAtlasImagePath(packConfig.atlasPath, atlas.image)}`;
      }))
      .catch((error) => [
        bossId,
        {
          image: null,
          atlas: null,
          loaded: false,
          ready: false,
          failed: true,
          error: error?.message || `${bossId} boss sprites failed to load.`,
          atlasPath: packConfig.atlasPath,
        },
      ]);
  };

  Promise.all(packEntriesToLoad.map(loadSinglePack)).then((packEntries) => {
    if (cancelled) return;
    const packs = Object.fromEntries(packEntries);
    const loadedPacks = Object.values(packs);
    const next = {
      ...createBossSpriteState(),
      packs,
      loaded: loadedPacks.some(pack => pack.loaded),
      ready: loadedPacks.length > 0 && loadedPacks.every(pack => pack.ready && !pack.failed),
      failed: loadedPacks.some(pack => pack.failed),
      error: loadedPacks.filter(pack => pack.error).map(pack => pack.error).join(' | ') || null,
    };
    onUpdate?.(next);
  });

  return () => {
    cancelled = true;
  };
};

export const getScarabQueenSpriteFrame = (boss, combatMode, bossVisualState = {}, now = 0) => {
  if (boss?.id !== 'scarab-queen') return null;

  const sequenceFrame = (prefix, count, frameMs) => `${prefix}${(Math.floor(now / frameMs) % count) + 1}`;
  if (boss.debugSpriteState) {
    if (boss.debugSpriteState === 'walk') return sequenceFrame('scarabQueenWalk', 8, 135);
    if (boss.debugSpriteState === 'windup') return sequenceFrame('scarabQueenWindup', 6, 115);
    if (boss.debugSpriteState === 'charge') return sequenceFrame('scarabQueenRun', 8, 85);
    if (boss.debugSpriteState === 'acid') return sequenceFrame('scarabQueenAcidSpit', 8, 95);
    if (boss.debugSpriteState === 'shielded') return 'scarabQueenShielded';
    if (boss.debugSpriteState === 'counter') return sequenceFrame('scarabQueenStagger', 5, 160);
    if (boss.debugSpriteState === 'hit') return sequenceFrame('scarabQueenStagger', 5, 130);
    if (boss.debugSpriteState === 'intro') return 'scarabQueenIntro';
    if (boss.debugSpriteState === 'defeated') return sequenceFrame('scarabQueenDeath', 8, 150);
  }
  if (boss.debugSpriteFrameKey) return boss.debugSpriteFrameKey;

  if (combatMode === 'defeated') return sequenceFrame('scarabQueenDeath', 8, 150);
  if (boss.hitFlash > 0 || combatMode === 'stunned') return sequenceFrame('scarabQueenStagger', 5, 130);
  if (combatMode === 'windup') return sequenceFrame('scarabQueenWindup', 6, 115);
  if (combatMode === 'attacking') {
    return bossVisualState.attackKind === 'area'
      ? sequenceFrame('scarabQueenAcidSpit', 8, 95)
      : sequenceFrame('scarabQueenRun', 8, 85);
  }
  if (bossVisualState.shielded) return 'scarabQueenShielded';
  if (bossVisualState.vulnerable) return sequenceFrame('scarabQueenStagger', 5, 160);
  if (!boss.awakened) return 'scarabQueenIntro';

  return sequenceFrame('scarabQueenWalk', 8, 135);
};

export const getStoneGuardianSpriteFrame = (boss, combatMode, bossVisualState = {}, now = 0) => {
  if (boss?.id !== 'temple-guardian') return null;

  if (combatMode === 'defeated') return 'stoneGuardianDefeated';
  if (boss.hitFlash > 0 || combatMode === 'stunned') return 'stoneGuardianHit';
  if (bossVisualState.shielded) return 'stoneGuardianShielded';
  if (bossVisualState.vulnerable) return 'stoneGuardianCounterWindow';
  if (combatMode === 'windup') return 'stoneGuardianWindup';
  if (combatMode === 'attacking') {
    return bossVisualState.attackKind === 'area' ? 'stoneGuardianShockwave' : 'stoneGuardianSlam';
  }
  if (!boss.awakened) return 'stoneGuardianAwakening';

  const frameToggle = Math.floor(now / 280) % 2;
  return frameToggle ? 'stoneGuardianWalk2' : 'stoneGuardianWalk1';
};

export const getGiantSerpentSpriteFrame = (boss, combatMode, bossVisualState = {}, now = 0) => {
  if (boss?.id !== 'giant-serpent') return null;

  if (combatMode === 'defeated') return 'giantSerpentDefeated';
  if (boss.hitFlash > 0 || combatMode === 'stunned') return 'giantSerpentHit';
  if (bossVisualState.shielded) return 'giantSerpentShielded';
  if (bossVisualState.vulnerable) return 'giantSerpentCounterWindow';
  if (combatMode === 'windup') return 'giantSerpentWindup';
  if (combatMode === 'attacking') {
    return bossVisualState.attackKind === 'area' || bossVisualState.attackKind === 'ranged'
      ? 'giantSerpentVenom'
      : 'giantSerpentLunge';
  }
  if (!boss.awakened) return 'giantSerpentIntro';

  const frameToggle = Math.floor(now / 260) % 2;
  return frameToggle ? 'giantSerpentSlither2' : 'giantSerpentSlither1';
};

export const getAncientConstructSpriteFrame = (boss, combatMode, bossVisualState = {}, now = 0) => {
  if (boss?.id !== 'ancient-construct') return null;

  if (combatMode === 'defeated') return 'ancientConstructDefeated';
  if (boss.hitFlash > 0 || combatMode === 'stunned') return 'ancientConstructHit';
  if (bossVisualState.shielded) return 'ancientConstructShielded';
  if (bossVisualState.vulnerable) return 'ancientConstructCounterWindow';
  if (combatMode === 'windup') return 'ancientConstructWindup';
  if (combatMode === 'attacking') {
    return bossVisualState.attackKind === 'area' ? 'ancientConstructPulse' : 'ancientConstructSlam';
  }
  if (!boss.awakened) return 'ancientConstructIntro';

  const frameToggle = Math.floor(now / 280) % 2;
  return frameToggle ? 'ancientConstructWalk2' : 'ancientConstructWalk1';
};

export const getClayGuardianSpriteFrame = (boss, combatMode, bossVisualState = {}, now = 0) => {
  if (!isChinaGuardianBossSpriteId(boss?.spriteBossId) && !isChinaGuardianBossSpriteId(boss?.id)) return null;

  if (combatMode === 'defeated') return 'clayGuardianDefeated';
  if (boss.hitFlash > 0 || combatMode === 'stunned') return 'clayGuardianHit';
  if (bossVisualState.shielded) return 'clayGuardianShielded';
  if (bossVisualState.vulnerable) return 'clayGuardianCounterWindow';
  if (combatMode === 'windup') return 'clayGuardianWindup';
  if (combatMode === 'attacking') {
    return bossVisualState.attackKind === 'area' || bossVisualState.attackKind === 'ranged'
      ? 'clayGuardianPulse'
      : 'clayGuardianSlam';
  }
  if (bossVisualState.introActive || !boss.awakened) return 'clayGuardianIntro';

  const frameToggle = Math.floor(now / 280) % 2;
  return frameToggle ? 'clayGuardianWalk2' : 'clayGuardianWalk1';
};

export const shouldFlipBossSprite = (bossId, facing = 1) => {
  if (bossId === 'scarab-queen') return facing > 0;
  return facing < 0;
};

export const getScarabQueenDrawBox = (boss, screenX) => {
  const height = Math.max(MIN_BOSS_DRAW_HEIGHT * 1.5, boss.height * 5.775);
  const width = Math.max(390, boss.width * 6.675);
  const box = getGroundedBossDrawBox(boss, screenX, width, height, SCARAB_QUEEN_FOOT_SINK);
  return {
    ...box,
    x: box.x + SCARAB_QUEEN_DRAW_OFFSET_X,
  };
};

export const getStoneGuardianDrawBox = (boss, screenX) => {
  const height = Math.max(188, boss.height * 3.34);
  const width = Math.max(176, boss.width * 3.08);
  return getGroundedBossDrawBox(boss, screenX, width, height, 4);
};

export const getGiantSerpentDrawBox = (boss, screenX) => {
  const height = Math.max(MIN_BOSS_DRAW_HEIGHT, boss.height * 3.15);
  const width = Math.max(252, boss.width * 3.55);
  return getGroundedBossDrawBox(boss, screenX, width, height, 5);
};

export const getAncientConstructDrawBox = (boss, screenX) => {
  const height = Math.max(220, boss.height * 3.6);
  const width = Math.max(272, boss.width * 4.35);
  return getGroundedBossDrawBox(boss, screenX, width, height, 5);
};

export const getClayGuardianDrawBox = (boss, screenX) => {
  const height = Math.max(190, boss.height * 3.18);
  const width = Math.max(190, boss.width * 3.05);
  return getGroundedBossDrawBox(boss, screenX, width, height, 4);
};
