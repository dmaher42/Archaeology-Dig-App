export const ENEMY_SPRITE_BASE_PATH = 'assets/expedition/enemies/';
export const ENEMY_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}small-enemy-sprites.json`;
export const LOOTER_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}looter-sprites.json`;
export const LOOTER_CAPTAIN_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}looter-captain-sprites.json`;
export const TEMPLE_BAT_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}temple-bat-sprites.json`;
export const DESERT_SCARAB_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}desert-scarab-intimidating-sprites.json`;
export const SAND_SNAKE_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}sand-snake-sprites.json`;
export const SCORPION_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}scorpion-sprites.json`;
export const SAND_WISP_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}sand-wisp-sprites.json`;
export const CURSED_STATUE_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}cursed-statue-sprites.json`;
export const STONE_GUARDIAN_ENEMY_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}stone-guardian-enemy-sprites.json`;
export const WARRIOR_MUMMY_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}warrior-mummy-sprites.json`;
export const CHINA_ENEMY_GUARDIAN_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}china/china-enemy-guardian-sprites.json`;
export const CHINA_RIVER_CRAB_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}china/china-river-crab-sprites.json`;
export const CHINA_WATCHTOWER_SENTRY_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}china/china-watchtower-sentry-sprites.json`;
export const CHINA_CLAY_GUARDIAN_ENEMY_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}china/china-clay-guardian-enemy-sprites.json`;
export const ENEMY_SPRITE_ATLAS_VERSION = 'enemy-sprite-packs-2026-05-18-35-percent-larger';
export const ENEMY_SPRITE_GROUNDING_VERSION = 'enemy-sprite-grounding-2026-05-18';
export const MIN_ENEMY_DRAW_HEIGHT = 34;
export const ENEMY_VISUAL_SIZE_MULTIPLIER = 1.5;
const ENEMY_VISUAL_SIZE_MULTIPLIERS = {
  scarab: 2.7,
  snake: 1.42,
  bat: 1.48,
  scorpion: 2.7,
  sandWisp: 1.42,
  looter: 1.12,
  looterCaptain: 1.16,
  cursedStatue: 1.14,
  stoneGuardianEnemy: 1.16,
  mummy: 1.72,
  riverCrab: 1.42,
  watchtowerSentry: 1.12,
  clayGuardian: 1.16,
};
export const WITHHELD_EGYPT_CREATURE_SPRITE_FAMILIES = new Set([
  'cursedStatue',
  'stoneGuardianEnemy',
]);

export const EXPECTED_ENEMY_SPRITE_KEYS = [
  'scarabIdle',
  'scarabWalk1',
  'scarabWalk2',
  'scarabWalk3',
  'scarabWindup',
  'scarabAttack',
  'scarabHit',
  'scarabDefeated',
  'snakeIdle',
  'snakeWalk1',
  'snakeWalk2',
  'snakeWalk3',
  'snakeWindup',
  'snakeAttack',
  'snakeHit',
  'snakeDefeated',
  'batIdle',
  'batWalk1',
  'batWalk2',
  'batWalk3',
  'batWindup',
  'batAttack',
  'batHit',
  'batDefeated',
];

export const EXPECTED_LOOTER_SPRITE_KEYS = [
  'looterIdle',
  'looterWalk1',
  'looterWalk2',
  'looterWalk3',
  'looterWindup',
  'looterAttack',
  'looterHit',
  'looterDefeated',
];

export const EXPECTED_LOOTER_CAPTAIN_SPRITE_KEYS = [
  'looterCaptainIdle',
  'looterCaptainWalk1',
  'looterCaptainWalk2',
  'looterCaptainWalk3',
  'looterCaptainWindup',
  'looterCaptainAttack',
  'looterCaptainHit',
  'looterCaptainDefeated',
];

export const EXPECTED_TEMPLE_BAT_SPRITE_KEYS = [
  'batIdle',
  'batWalk1',
  'batWalk2',
  'batWalk3',
  'batWindup',
  'batAttack',
  'batHit',
  'batDefeated',
];

export const EXPECTED_DESERT_SCARAB_SPRITE_KEYS = [
  'scarabIdle',
  'scarabWalk1',
  'scarabWalk2',
  'scarabWalk3',
  'scarabWindup',
  'scarabAttack',
  'scarabHit',
  'scarabDefeated',
];

export const EXPECTED_SAND_SNAKE_SPRITE_KEYS = [
  'snakeIdle',
  'snakeWalk1',
  'snakeWalk2',
  'snakeWalk3',
  'snakeWindup',
  'snakeAttack',
  'snakeHit',
  'snakeDefeated',
];

export const EXPECTED_SCORPION_SPRITE_KEYS = [
  'scorpionIdle',
  'scorpionWalk1',
  'scorpionWalk2',
  'scorpionWalk3',
  'scorpionWindup',
  'scorpionAttack',
  'scorpionHit',
  'scorpionDefeated',
];

export const EXPECTED_SAND_WISP_SPRITE_KEYS = [
  'sandWispIdle',
  'sandWispWalk1',
  'sandWispWalk2',
  'sandWispWalk3',
  'sandWispWindup',
  'sandWispAttack',
  'sandWispHit',
  'sandWispDefeated',
];

export const EXPECTED_CURSED_STATUE_SPRITE_KEYS = [
  'cursedStatueIdle',
  'cursedStatueWalk1',
  'cursedStatueWalk2',
  'cursedStatueWalk3',
  'cursedStatueWindup',
  'cursedStatueAttack',
  'cursedStatueHit',
  'cursedStatueDefeated',
];

export const EXPECTED_STONE_GUARDIAN_ENEMY_SPRITE_KEYS = [
  'stoneGuardianEnemyIdle',
  'stoneGuardianEnemyWalk1',
  'stoneGuardianEnemyWalk2',
  'stoneGuardianEnemyWalk3',
  'stoneGuardianEnemyWindup',
  'stoneGuardianEnemyAttack',
  'stoneGuardianEnemyHit',
  'stoneGuardianEnemyDefeated',
];

export const EXPECTED_WARRIOR_MUMMY_SPRITE_KEYS = [
  'mummyIdle',
  'mummyWalk1',
  'mummyWalk2',
  'mummyWalk3',
  'mummyWindup',
  'mummyAttack',
  'mummyHit',
  'mummyDefeated',
];

export const EXPECTED_CHINA_ENEMY_GUARDIAN_SPRITE_KEYS = [
  'riverCrabIdle',
  'riverCrabWalk1',
  'riverCrabWalk2',
  'riverCrabWindup',
  'riverCrabAttack',
  'riverCrabHit',
  'riverCrabDefeated',
  'watchtowerSentryIdle',
  'watchtowerSentryWalk1',
  'watchtowerSentryWalk2',
  'watchtowerSentryWindup',
  'watchtowerSentryAttack',
  'watchtowerSentryHit',
  'watchtowerSentryDefeated',
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

export const EXPECTED_CHINA_RIVER_CRAB_SPRITE_KEYS = [
  'riverCrabIdle',
  'riverCrabWalk1',
  'riverCrabWalk2',
  'riverCrabWalk3',
  'riverCrabWindup',
  'riverCrabAttack',
  'riverCrabHit',
  'riverCrabDefeated',
];

export const EXPECTED_CHINA_WATCHTOWER_SENTRY_SPRITE_KEYS = [
  'watchtowerSentryIdle',
  'watchtowerSentryWalk1',
  'watchtowerSentryWalk2',
  'watchtowerSentryWalk3',
  'watchtowerSentryWindup',
  'watchtowerSentryAttack',
  'watchtowerSentryHit',
  'watchtowerSentryDefeated',
];

export const EXPECTED_CHINA_CLAY_GUARDIAN_ENEMY_SPRITE_KEYS = [
  'clayGuardianIdle',
  'clayGuardianWalk1',
  'clayGuardianWalk2',
  'clayGuardianWalk3',
  'clayGuardianWindup',
  'clayGuardianAttack',
  'clayGuardianHit',
  'clayGuardianDefeated',
];

const ENEMY_SPRITE_PACKS = {
  small: {
    atlasPath: ENEMY_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_ENEMY_SPRITE_KEYS,
  },
  looter: {
    atlasPath: LOOTER_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_LOOTER_SPRITE_KEYS,
  },
  looterCaptain: {
    atlasPath: LOOTER_CAPTAIN_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_LOOTER_CAPTAIN_SPRITE_KEYS,
  },
  bat: {
    atlasPath: TEMPLE_BAT_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_TEMPLE_BAT_SPRITE_KEYS,
  },
  scarab: {
    atlasPath: DESERT_SCARAB_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_DESERT_SCARAB_SPRITE_KEYS,
  },
  snake: {
    atlasPath: SAND_SNAKE_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_SAND_SNAKE_SPRITE_KEYS,
  },
  scorpion: {
    atlasPath: SCORPION_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_SCORPION_SPRITE_KEYS,
  },
  sandWisp: {
    atlasPath: SAND_WISP_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_SAND_WISP_SPRITE_KEYS,
  },
  cursedStatue: {
    atlasPath: CURSED_STATUE_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_CURSED_STATUE_SPRITE_KEYS,
  },
  stoneGuardianEnemy: {
    atlasPath: STONE_GUARDIAN_ENEMY_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_STONE_GUARDIAN_ENEMY_SPRITE_KEYS,
  },
  mummy: {
    atlasPath: WARRIOR_MUMMY_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_WARRIOR_MUMMY_SPRITE_KEYS,
  },
  chinaEnemyGuardian: {
    atlasPath: CHINA_ENEMY_GUARDIAN_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_CHINA_ENEMY_GUARDIAN_SPRITE_KEYS,
  },
  chinaRiverCrab: {
    atlasPath: CHINA_RIVER_CRAB_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_CHINA_RIVER_CRAB_SPRITE_KEYS,
  },
  chinaWatchtowerSentry: {
    atlasPath: CHINA_WATCHTOWER_SENTRY_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_CHINA_WATCHTOWER_SENTRY_SPRITE_KEYS,
  },
  chinaClayGuardianEnemy: {
    atlasPath: CHINA_CLAY_GUARDIAN_ENEMY_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_CHINA_CLAY_GUARDIAN_ENEMY_SPRITE_KEYS,
  },
};

const getAtlasImagePath = (atlasPath, imageName) => {
  if (!imageName) return null;
  if (imageName.startsWith('/') || imageName.startsWith('assets/')) return imageName;
  const atlasDir = atlasPath.includes('/') ? atlasPath.slice(0, atlasPath.lastIndexOf('/') + 1) : '';
  return `${atlasDir}${imageName}`;
};

export const createEnemySpriteState = () => ({
  image: null,
  atlas: null,
  packs: {},
  loaded: false,
  ready: false,
  failed: false,
  error: null,
  atlasPath: ENEMY_SPRITE_ATLAS_JSON,
});

export const getMissingEnemySpriteAssets = (assets) => {
  if (assets?.packs && Object.keys(assets.packs).length > 0) {
    return Object.entries(ENEMY_SPRITE_PACKS).flatMap(([packId, packConfig]) => {
      const regions = assets.packs?.[packId]?.atlas?.regions || {};
      return packConfig.expectedKeys
        .filter(key => !regions[key])
        .map(key => `${packId}:${key}`);
    });
  }
  const regions = assets?.atlas?.regions || {};
  return EXPECTED_ENEMY_SPRITE_KEYS.filter(key => !regions[key]);
};

export const loadEnemySpritePack = ({ baseUrl = '/', onUpdate }) => {
  let cancelled = false;

  const loadSinglePack = ([packId, packConfig]) => {
    const atlasPath = `${baseUrl}${packConfig.atlasPath}`;
    return fetch(atlasPath)
      .then((response) => {
        if (!response.ok) throw new Error(`${packId} enemy sprite atlas request failed: ${response.status}`);
        return response.json();
      })
      .then((atlas) => new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          resolve([
            packId,
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
            packId,
            {
              image: null,
              atlas,
              loaded: false,
              ready: false,
              failed: true,
              error: `${packId} enemy sprite image failed to load.`,
              atlasPath: packConfig.atlasPath,
            },
          ]);
        };
        image.src = `${baseUrl}${getAtlasImagePath(packConfig.atlasPath, atlas.image)}`;
      }))
      .catch((error) => [
        packId,
        {
          image: null,
          atlas: null,
          loaded: false,
          ready: false,
          failed: true,
          error: error?.message || `${packId} enemy sprites failed to load.`,
          atlasPath: packConfig.atlasPath,
        },
      ]);
  };

  Promise.all(Object.entries(ENEMY_SPRITE_PACKS).map(loadSinglePack)).then((packEntries) => {
    if (cancelled) return;
    const packs = Object.fromEntries(packEntries);
    const smallPack = packs.small;
    onUpdate?.({
      ...createEnemySpriteState(),
      image: smallPack?.image || null,
      atlas: smallPack?.atlas || null,
      packs,
      loaded: Object.values(packs).some(pack => pack.loaded),
      ready: Object.values(packs).every(pack => pack.ready && !pack.failed),
      failed: Object.values(packs).some(pack => pack.failed),
      error: Object.values(packs).filter(pack => pack.error).map(pack => pack.error).join(' | ') || null,
      atlasPath: ENEMY_SPRITE_ATLAS_JSON,
    });
  });

  return () => {
    cancelled = true;
  };
};

export const getEnemySpritePack = (assets, family) => {
  if (family === 'looter') return assets?.packs?.looter || null;
  if (family === 'looterCaptain') return assets?.packs?.looterCaptain || assets?.packs?.looter || null;
  if (family === 'bat') return assets?.packs?.bat || assets?.packs?.small || assets || null;
  if (family === 'scarab') return assets?.packs?.scarab || assets?.packs?.small || assets || null;
  if (family === 'snake') return assets?.packs?.snake || assets?.packs?.small || assets || null;
  if (family === 'scorpion') return assets?.packs?.scorpion || null;
  if (family === 'sandWisp') return assets?.packs?.sandWisp || null;
  if (family === 'cursedStatue') return assets?.packs?.cursedStatue || null;
  if (family === 'stoneGuardianEnemy') return assets?.packs?.stoneGuardianEnemy || null;
  if (family === 'mummy') return assets?.packs?.mummy || null;
  if (family === 'riverCrab') return assets?.packs?.chinaRiverCrab || assets?.packs?.chinaEnemyGuardian || null;
  if (family === 'watchtowerSentry') return assets?.packs?.chinaWatchtowerSentry || assets?.packs?.chinaEnemyGuardian || null;
  if (family === 'clayGuardian') return assets?.packs?.chinaClayGuardianEnemy || assets?.packs?.chinaEnemyGuardian || null;
  return assets?.packs?.small || assets || null;
};

export const getEnemySpriteFamily = (enemy) => {
  if (!enemy) return null;
  const name = (enemy.name || '').toLowerCase();
  if (enemy.type === 'scarab' || name.includes('scarab') || name.includes('beetle')) return 'scarab';
  if (enemy.type === 'snake' || name.includes('snake') || name.includes('serpent')) return 'snake';
  if (enemy.type === 'bat' || name.includes('bat')) return 'bat';
  if (enemy.type === 'scorpion' || name.includes('scorpion')) return 'scorpion';
  if (enemy.type === 'sand-wisp' || name.includes('sand wisp')) return 'sandWisp';
  if (enemy.id === 'looter-captain' || name.includes('captain')) return 'looterCaptain';
  if (enemy.type === 'river-crab' || name.includes('river crab') || name.includes('mudbank crab')) return 'riverCrab';
  if (enemy.type === 'watchtower-sentry' || name.includes('watchtower') || name.includes('sentry')) return 'watchtowerSentry';
  if (enemy.type === 'clay-guardian' || name.includes('clay guardian')) return 'clayGuardian';
  if (enemy.type === 'mummy' || name.includes('mummy')) return 'mummy';
  if (enemy.type === 'statue' || name.includes('statue')) return 'cursedStatue';
  if (enemy.type === 'guardian' || name.includes('guardian')) return 'stoneGuardianEnemy';
  if (enemy.type === 'looter' || name.includes('looter')) return 'looter';
  return null;
};

export const shouldUseEnemySpritePack = (enemy) => {
  const family = getEnemySpriteFamily(enemy);
  if (!family) return false;
  if (WITHHELD_EGYPT_CREATURE_SPRITE_FAMILIES.has(family)) return false;
  return true;
};

export const getEnemySpriteFrame = (enemy, combatMode, now = 0) => {
  const family = getEnemySpriteFamily(enemy);
  if (!family) return null;

  const restoredTwoPoseWalkFamilies = new Set(['scarab', 'snake', 'bat']);
  const walkPoseCount = restoredTwoPoseWalkFamilies.has(family) ? 2 : 3;
  const walkFrame = (Math.floor(now / (family === 'bat' || family === 'sandWisp' ? 135 : 180)) % walkPoseCount) + 1;
  if (combatMode === 'defeated') return `${family}Defeated`;
  if (combatMode === 'stunned') return `${family}Hit`;
  if (combatMode === 'windup') return `${family}Windup`;
  if (combatMode === 'attacking') return `${family}Attack`;

  if (family === 'scarab') return `scarabWalk${walkFrame}`;
  if (family === 'snake') return `snakeWalk${walkFrame}`;
  if (family === 'bat') return `batWalk${walkFrame}`;
  if (family === 'scorpion') return `scorpionWalk${walkFrame}`;
  if (family === 'sandWisp') return `sandWispWalk${walkFrame}`;
  if (family === 'looterCaptain') return `looterCaptainWalk${walkFrame}`;
  if (family === 'looter') return `looterWalk${walkFrame}`;
  if (family === 'cursedStatue') return `cursedStatueWalk${walkFrame}`;
  if (family === 'stoneGuardianEnemy') return `stoneGuardianEnemyWalk${walkFrame}`;
  if (family === 'mummy') return `mummyWalk${walkFrame}`;
  if (family === 'riverCrab') return `riverCrabWalk${walkFrame}`;
  if (family === 'watchtowerSentry') return `watchtowerSentryWalk${walkFrame}`;
  if (family === 'clayGuardian') return `clayGuardianWalk${walkFrame}`;
  return `${family}Idle`;
};

export const shouldFlipEnemySprite = (_family, facing = 1) => facing < 0;

export const getEnemySpriteDrawBox = (enemy, screenX, shakeX = 0, combatMode = null) => {
  const family = getEnemySpriteFamily(enemy);
  if (!family) return null;

  const defeated = combatMode === 'defeated' || enemy.defeated;
  const scale = {
    scarab: defeated ? 1.32 : 1.48,
    snake: defeated ? 1.38 : 1.55,
    bat: defeated ? 1.5 : 1.68,
    scorpion: defeated ? 1.5 : 1.82,
    sandWisp: defeated ? 1.46 : 1.78,
    looter: defeated ? 1.32 : 1.62,
    looterCaptain: defeated ? 1.38 : 1.72,
    cursedStatue: defeated ? 1.36 : 1.7,
    stoneGuardianEnemy: defeated ? 1.36 : 1.72,
    mummy: defeated ? 1.36 : 1.7,
    riverCrab: defeated ? 1.34 : 1.54,
    watchtowerSentry: defeated ? 1.34 : 1.62,
    clayGuardian: defeated ? 1.38 : 1.72,
  }[family] || 1.55;

  const minHeight = {
    scarab: 34,
    snake: 42,
    bat: 42,
    scorpion: 50,
    sandWisp: 48,
    looter: 76,
    looterCaptain: 82,
    cursedStatue: 78,
    stoneGuardianEnemy: 80,
    mummy: 78,
    riverCrab: 44,
    watchtowerSentry: 78,
    clayGuardian: 80,
  }[family] || MIN_ENEMY_DRAW_HEIGHT;
  const scaledWidth = Math.max(enemy.width, enemy.width * scale);
  const scaledHeight = Math.max(enemy.height, enemy.height * scale);
  const visualMultiplier = ENEMY_VISUAL_SIZE_MULTIPLIERS[family] || ENEMY_VISUAL_SIZE_MULTIPLIER;
  const height = Math.max(minHeight, scaledHeight) * visualMultiplier;
  const width = Math.max(scaledWidth, enemy.width * (height / Math.max(1, enemy.height)));
  const groundOffset = {
    scarab: defeated ? 16 : 14,
    snake: defeated ? 18 : 16,
    bat: defeated ? 4 : -8,
    scorpion: defeated ? 18 : 15,
    sandWisp: defeated ? 4 : -6,
    looter: defeated ? 19 : 14,
    looterCaptain: defeated ? 19 : 14,
    cursedStatue: defeated ? 19 : 14,
    stoneGuardianEnemy: defeated ? 19 : 14,
    mummy: defeated ? 20 : 15,
    riverCrab: defeated ? 18 : 15,
    watchtowerSentry: defeated ? 20 : 15,
    clayGuardian: defeated ? 19 : 14,
  }[family] ?? 8;
  const x = screenX + enemy.width / 2 - width / 2 + shakeX;
  const y = enemy.y + enemy.height - height + groundOffset;

  return { x, y, width, height, family };
};
