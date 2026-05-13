export const BOSS_SPRITE_BASE_PATH = 'assets/expedition/bosses/';
export const BOSS_SPRITE_ATLAS_JSON = `${BOSS_SPRITE_BASE_PATH}scarab-queen-sprites.json`;
export const STONE_GUARDIAN_SPRITE_ATLAS_JSON = `${BOSS_SPRITE_BASE_PATH}stone-guardian-sprites.json`;
export const GIANT_SERPENT_SPRITE_ATLAS_JSON = `${BOSS_SPRITE_BASE_PATH}giant-serpent-sprites.json`;
export const ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON = `${BOSS_SPRITE_BASE_PATH}ancient-construct-sprites.json`;
export const BOSS_SPRITE_ATLAS_VERSION = 'boss-sprites-scarab-queen-stone-guardian-serpent-ancient-construct-2026-05-13';

export const SCARAB_QUEEN_SPRITE_KEYS = [
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
];

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

export const EXPECTED_BOSS_SPRITE_KEYS = [
  ...SCARAB_QUEEN_SPRITE_KEYS,
  ...STONE_GUARDIAN_SPRITE_KEYS,
  ...GIANT_SERPENT_SPRITE_KEYS,
  ...ANCIENT_CONSTRUCT_SPRITE_KEYS,
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

export const getMissingBossSpriteAssets = (assets) => {
  return Object.entries(BOSS_SPRITE_PACKS).flatMap(([bossId, packConfig]) => {
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

export const loadBossSpritePack = ({ baseUrl = '/', onUpdate }) => {
  let cancelled = false;

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
        image.src = `${baseUrl}${BOSS_SPRITE_BASE_PATH}${atlas.image}`;
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

  Promise.all(Object.entries(BOSS_SPRITE_PACKS).map(loadSinglePack)).then((packEntries) => {
    if (cancelled) return;
    const packs = Object.fromEntries(packEntries);
    const next = {
      ...createBossSpriteState(),
      packs,
      loaded: Object.values(packs).some(pack => pack.loaded),
      ready: Object.values(packs).every(pack => pack.ready && !pack.failed),
      failed: Object.values(packs).some(pack => pack.failed),
      error: Object.values(packs).filter(pack => pack.error).map(pack => pack.error).join(' | ') || null,
    };
    onUpdate?.(next);
  });

  return () => {
    cancelled = true;
  };
};

export const getScarabQueenSpriteFrame = (boss, combatMode, bossVisualState = {}, now = 0) => {
  if (boss?.id !== 'scarab-queen') return null;

  if (combatMode === 'defeated') return 'scarabQueenDefeated';
  if (boss.hitFlash > 0 || combatMode === 'stunned') return 'scarabQueenHit';
  if (bossVisualState.shielded) return 'scarabQueenShielded';
  if (bossVisualState.vulnerable) return 'scarabQueenCounterWindow';
  if (combatMode === 'windup') return 'scarabQueenWindup';
  if (combatMode === 'attacking') {
    return bossVisualState.attackKind === 'area' ? 'scarabQueenAreaAttack' : 'scarabQueenCharge';
  }
  if (!boss.awakened) return 'scarabQueenIntro';

  const frameToggle = Math.floor(now / 240) % 2;
  return frameToggle ? 'scarabQueenWalk2' : 'scarabQueenWalk1';
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

export const getScarabQueenDrawBox = (boss, screenX) => {
  const width = Math.max(124, boss.width * 2.45);
  const height = Math.max(90, boss.height * 2.2);
  return {
    x: screenX + boss.width / 2 - width / 2,
    y: boss.y + boss.height - height + boss.height * 0.1,
    width,
    height,
  };
};

export const getStoneGuardianDrawBox = (boss, screenX) => {
  const width = Math.max(118, boss.width * 2.18);
  const height = Math.max(116, boss.height * 2.05);
  return {
    x: screenX + boss.width / 2 - width / 2,
    y: boss.y + boss.height - height + boss.height * 0.06,
    width,
    height,
  };
};

export const getGiantSerpentDrawBox = (boss, screenX) => {
  const width = Math.max(190, boss.width * 2.75);
  const height = Math.max(124, boss.height * 2.25);
  return {
    x: screenX + boss.width / 2 - width / 2,
    y: boss.y + boss.height - height + boss.height * 0.04,
    width,
    height,
  };
};

export const getAncientConstructDrawBox = (boss, screenX) => {
  const width = Math.max(132, boss.width * 2.25);
  const height = Math.max(128, boss.height * 2.15);
  return {
    x: screenX + boss.width / 2 - width / 2,
    y: boss.y + boss.height - height + boss.height * 0.05,
    width,
    height,
  };
};
