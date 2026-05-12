export const ENEMY_SPRITE_BASE_PATH = 'assets/expedition/enemies/';
export const ENEMY_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}small-enemy-sprites.json`;
export const ENEMY_SPRITE_ATLAS_VERSION = 'small-enemy-sprites-2026-05-11';

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

export const createEnemySpriteState = () => ({
  image: null,
  atlas: null,
  loaded: false,
  ready: false,
  failed: false,
  error: null,
  atlasPath: ENEMY_SPRITE_ATLAS_JSON,
});

export const getMissingEnemySpriteAssets = (assets) => {
  const regions = assets?.atlas?.regions || {};
  return EXPECTED_ENEMY_SPRITE_KEYS.filter(key => !regions[key]);
};

export const loadEnemySpritePack = ({ baseUrl = '/', onUpdate }) => {
  let cancelled = false;
  const atlasPath = `${baseUrl}${ENEMY_SPRITE_ATLAS_JSON}`;

  const fail = (error) => {
    if (cancelled) return;
    onUpdate?.({
      ...createEnemySpriteState(),
      failed: true,
      error: error?.message || 'Enemy sprites failed to load.',
      atlasPath: ENEMY_SPRITE_ATLAS_JSON,
    });
  };

  fetch(atlasPath)
    .then((response) => {
      if (!response.ok) throw new Error(`Enemy sprite atlas request failed: ${response.status}`);
      return response.json();
    })
    .then((atlas) => {
      if (cancelled) return;
      const image = new Image();
      image.onload = () => {
        if (cancelled) return;
        const next = {
          image,
          atlas,
          loaded: true,
          ready: getMissingEnemySpriteAssets({ atlas }).length === 0,
          failed: false,
          error: null,
          atlasPath: ENEMY_SPRITE_ATLAS_JSON,
        };
        onUpdate?.(next);
      };
      image.onerror = () => fail(new Error('Enemy sprite image failed to load.'));
      image.src = `${baseUrl}${ENEMY_SPRITE_BASE_PATH}${atlas.image}`;
    })
    .catch(fail);

  return () => {
    cancelled = true;
  };
};

export const getEnemySpriteFamily = (enemy) => {
  if (!enemy) return null;
  const name = (enemy.name || '').toLowerCase();
  if (enemy.type === 'scarab' || name.includes('scarab') || name.includes('beetle')) return 'scarab';
  if (enemy.type === 'snake' || name.includes('snake') || name.includes('serpent')) return 'snake';
  if (enemy.type === 'bat' || name.includes('bat')) return 'bat';
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
  return `${family}Idle`;
};

export const getEnemySpriteDrawBox = (enemy, screenX, shakeX = 0, combatMode = null) => {
  const family = getEnemySpriteFamily(enemy);
  if (!family) return null;

  const defeated = combatMode === 'defeated' || enemy.defeated;
  const scale = {
    scarab: defeated ? 2.08 : 2,
    snake: defeated ? 2.02 : 1.96,
    bat: defeated ? 2.05 : 2.18,
  }[family] || 1.8;

  const width = Math.max(enemy.width, enemy.width * scale);
  const height = Math.max(enemy.height, enemy.height * scale);
  const anchorLift = defeated
    ? (family === 'bat' ? -enemy.height * 0.04 : enemy.height * 0.02)
    : family === 'bat'
      ? enemy.height * 0.42
      : enemy.height * 0.08;
  const x = screenX + enemy.width / 2 - width / 2 + shakeX;
  const y = enemy.y + enemy.height - height + anchorLift;

  return { x, y, width, height, family };
};
