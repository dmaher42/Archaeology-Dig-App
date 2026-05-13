export const ENEMY_SPRITE_BASE_PATH = 'assets/expedition/enemies/';
export const ENEMY_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}small-enemy-sprites.json`;
export const LOOTER_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}looter-sprites.json`;
export const TEMPLE_BAT_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}temple-bat-sprites.json`;
export const ENEMY_SPRITE_ATLAS_VERSION = 'enemy-sprite-packs-2026-05-13-temple-bat';

export const EXPECTED_ENEMY_SPRITE_KEYS = [
  'scarabIdle',
  'scarabCrawl1',
  'scarabCrawl2',
  'scarabWindup',
  'scarabAttack',
  'scarabHit',
  'scarabDefeated',
  'snakeIdle',
  'snakeSlither1',
  'snakeSlither2',
  'snakeWindup',
  'snakeAttack',
  'snakeHit',
  'snakeDefeated',
  'batIdle',
  'batFlap1',
  'batFlap2',
  'batWindup',
  'batAttack',
  'batHit',
  'batDefeated',
];

export const EXPECTED_LOOTER_SPRITE_KEYS = [
  'looterIdle',
  'looterWalk1',
  'looterWalk2',
  'looterWindup',
  'looterAttack',
  'looterHit',
  'looterDefeated',
  'looterCaptainIdle',
];

export const EXPECTED_TEMPLE_BAT_SPRITE_KEYS = [
  'batIdle',
  'batFlap1',
  'batFlap2',
  'batWindup',
  'batAttack',
  'batHit',
  'batDefeated',
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
  bat: {
    atlasPath: TEMPLE_BAT_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_TEMPLE_BAT_SPRITE_KEYS,
  },
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
        image.src = `${baseUrl}${ENEMY_SPRITE_BASE_PATH}${atlas.image}`;
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
  if (family === 'bat') return assets?.packs?.bat || assets?.packs?.small || assets || null;
  return assets?.packs?.small || assets || null;
};

export const getEnemySpriteFamily = (enemy) => {
  if (!enemy) return null;
  const name = (enemy.name || '').toLowerCase();
  if (enemy.type === 'scarab' || name.includes('scarab') || name.includes('beetle')) return 'scarab';
  if (enemy.type === 'snake' || name.includes('snake') || name.includes('serpent')) return 'snake';
  if (enemy.type === 'bat' || name.includes('bat')) return 'bat';
  if (enemy.type === 'looter' || name.includes('looter')) return 'looter';
  return null;
};

export const getEnemySpriteFrame = (enemy, combatMode, now = 0) => {
  const family = getEnemySpriteFamily(enemy);
  if (!family) return null;

  const frameToggle = Math.floor(now / (family === 'bat' ? 150 : 230)) % 2;
  if (combatMode === 'defeated') return `${family}Defeated`;
  if (combatMode === 'stunned') return `${family}Hit`;
  if (combatMode === 'windup') return `${family}Windup`;
  if (combatMode === 'attacking') return `${family}Attack`;

  if (family === 'scarab') return frameToggle ? 'scarabCrawl2' : 'scarabCrawl1';
  if (family === 'snake') return frameToggle ? 'snakeSlither2' : 'snakeSlither1';
  if (family === 'bat') return frameToggle ? 'batFlap2' : 'batFlap1';
  if (family === 'looter') {
    if (enemy.id === 'looter-captain') return 'looterCaptainIdle';
    return frameToggle ? 'looterWalk2' : 'looterWalk1';
  }
  return `${family}Idle`;
};

export const getEnemySpriteDrawBox = (enemy, screenX, shakeX = 0, combatMode = null) => {
  const family = getEnemySpriteFamily(enemy);
  if (!family) return null;

  const defeated = combatMode === 'defeated' || enemy.defeated;
  const scale = {
    scarab: defeated ? 2.08 : 2,
    snake: defeated ? 2.02 : 1.96,
    bat: defeated ? 2.05 : 2.45,
    looter: defeated ? 1.32 : 1.72,
  }[family] || 1.8;

  const width = Math.max(enemy.width, enemy.width * scale);
  const height = Math.max(enemy.height, enemy.height * scale);
  const anchorLift = defeated
    ? (family === 'bat' ? -enemy.height * 0.04 : enemy.height * 0.02)
    : family === 'bat'
      ? -enemy.height * 0.24
      : family === 'looter'
        ? enemy.height * 0.02
      : enemy.height * 0.08;
  const x = screenX + enemy.width / 2 - width / 2 + shakeX;
  const y = enemy.y + enemy.height - height + anchorLift;

  return { x, y, width, height, family };
};
