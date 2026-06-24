// Rome enemy sprite definitions for the playable Section One route.

export const ROME_ENEMY_SPRITE_BASE_PATH = 'assets/expedition/enemies/rome/';

export const ROME_LEGION_SHADE_SPRITE_ATLAS_JSON = `${ROME_ENEMY_SPRITE_BASE_PATH}rome-legion-shade-sprites.json`;
export const ROME_GLADIATOR_REVENANT_SPRITE_ATLAS_JSON = `${ROME_ENEMY_SPRITE_BASE_PATH}rome-gladiator-revenant-sprites.json`;
export const ROME_FORUM_RAT_SPRITE_ATLAS_JSON = `${ROME_ENEMY_SPRITE_BASE_PATH}rome-forum-rat-sprites.json`;
export const ROME_VESTIBULE_WISP_SPRITE_ATLAS_JSON = `${ROME_ENEMY_SPRITE_BASE_PATH}rome-vestibule-wisp-sprites.json`;
export const ROME_MARBLE_GOLEM_SPRITE_ATLAS_JSON = `${ROME_ENEMY_SPRITE_BASE_PATH}rome-marble-golem-sprites.json`;

export const ROME_ENEMY_SPRITE_ATLAS_VERSION = 'rome-enemy-sprites-production-2026-06-24';

// Size multipliers relative to Asha draw height
export const ROME_ENEMY_VISUAL_SIZE_MULTIPLIERS = {
  legionShade:       1.14,  // legionnaire — close to Asha height
  gladiatorRevenant: 1.22,  // larger, armoured
  forumRat:          0.72,  // small fast creature
  vestibuleWisp:     1.80,  // aerial, wide sprite
  marbleGolem:       1.85,  // heavy, imposing
};

// Standard 8-key animation contract (idle, walk1-3, windup, attack, hit, defeated)
const standardKeys = (prefix) => [
  `${prefix}Idle`,
  `${prefix}Walk1`,
  `${prefix}Walk2`,
  `${prefix}Walk3`,
  `${prefix}Windup`,
  `${prefix}Attack`,
  `${prefix}Hit`,
  `${prefix}Defeated`,
];

export const EXPECTED_ROME_LEGION_SHADE_SPRITE_KEYS = standardKeys('legionShade');
export const EXPECTED_ROME_GLADIATOR_REVENANT_SPRITE_KEYS = standardKeys('gladiatorRevenant');
export const EXPECTED_ROME_FORUM_RAT_SPRITE_KEYS = standardKeys('forumRat');
export const EXPECTED_ROME_VESTIBULE_WISP_SPRITE_KEYS = standardKeys('vestibuleWisp');
export const EXPECTED_ROME_MARBLE_GOLEM_SPRITE_KEYS = standardKeys('marbleGolem');

const ROME_ENEMY_SPRITE_PACKS = {
  legionShade: {
    atlasPath: ROME_LEGION_SHADE_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_ROME_LEGION_SHADE_SPRITE_KEYS,
  },
  gladiatorRevenant: {
    atlasPath: ROME_GLADIATOR_REVENANT_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_ROME_GLADIATOR_REVENANT_SPRITE_KEYS,
  },
  forumRat: {
    atlasPath: ROME_FORUM_RAT_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_ROME_FORUM_RAT_SPRITE_KEYS,
  },
  vestibuleWisp: {
    atlasPath: ROME_VESTIBULE_WISP_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_ROME_VESTIBULE_WISP_SPRITE_KEYS,
  },
  marbleGolem: {
    atlasPath: ROME_MARBLE_GOLEM_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_ROME_MARBLE_GOLEM_SPRITE_KEYS,
  },
};

export const ROME_ENEMY_SPRITE_PACK_IDS = Object.keys(ROME_ENEMY_SPRITE_PACKS);

export const createRomeEnemySpriteState = () => ({
  packs: {},
  loaded: false,
  ready: false,
  failed: false,
  error: null,
});

export const getMissingRomeEnemySpriteAssets = (assets) => (
  Object.entries(ROME_ENEMY_SPRITE_PACKS).flatMap(([enemyType, packConfig]) => {
    const regions = assets?.packs?.[enemyType]?.atlas?.regions || {};
    return packConfig.expectedKeys
      .filter((key) => !regions[key])
      .map((key) => `${enemyType}:${key}`);
  })
);

const getAtlasImagePath = (atlasPath, imageName) => {
  if (!imageName) return null;
  if (imageName.startsWith('/') || imageName.startsWith('assets/')) return imageName;
  const dir = atlasPath.includes('/') ? atlasPath.slice(0, atlasPath.lastIndexOf('/') + 1) : '';
  return `${dir}${imageName}`;
};

export const loadRomeEnemySpritePacks = ({ baseUrl = '/', onUpdate, packIds = null }) => {
  let cancelled = false;
  const requested = packIds ? new Set(packIds) : null;
  const entries = Object.entries(ROME_ENEMY_SPRITE_PACKS)
    .filter(([id]) => !requested || requested.has(id));

  const loadOne = ([enemyType, packConfig]) => {
    const atlasUrl = `${baseUrl}${packConfig.atlasPath}`;
    return fetch(atlasUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`${enemyType} atlas failed: ${res.status}`);
        return res.json();
      })
      .then((atlas) => new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve([enemyType, { image, atlas, loaded: true, ready: packConfig.expectedKeys.every((k) => atlas?.regions?.[k]), failed: false, error: null }]);
        image.onerror = () => resolve([enemyType, { image: null, atlas, loaded: false, ready: false, failed: true, error: `${enemyType} image failed.` }]);
        image.src = `${baseUrl}${getAtlasImagePath(packConfig.atlasPath, atlas.image)}`;
      }))
      .catch((err) => [enemyType, { image: null, atlas: null, loaded: false, ready: false, failed: true, error: err?.message || `${enemyType} failed.` }]);
  };

  Promise.all(entries.map(loadOne)).then((results) => {
    if (cancelled) return;
    const packs = Object.fromEntries(results);
    const vals = Object.values(packs);
    onUpdate?.({
      ...createRomeEnemySpriteState(),
      packs,
      loaded: vals.some((p) => p.loaded),
      ready: vals.length > 0 && vals.every((p) => p.ready && !p.failed),
      failed: vals.some((p) => p.failed),
      error: vals.filter((p) => p.error).map((p) => p.error).join(' | ') || null,
    });
  });

  return () => { cancelled = true; };
};

export const getRomeEnemySpritePack = (assets, enemyType) => {
  const pack = assets?.packs?.[enemyType];
  if (!pack?.loaded || pack.failed) return null;
  return pack;
};

// Behaviour profiles — drives AI in the game loop
export const ROME_ENEMY_PROFILES = {
  legionShade: {
    hp: 3,
    moveSpeed: 80,
    attackDamage: 1,
    attackRange: 42,
    aggroRange: 320,
    aerial: false,
    sfxHit: 'romeEnemyHit',
  },
  gladiatorRevenant: {
    hp: 5,
    moveSpeed: 110,
    attackDamage: 2,
    attackRange: 52,
    aggroRange: 360,
    aerial: false,
    sfxHit: 'romeGladiatorHit',
  },
  forumRat: {
    hp: 1,
    moveSpeed: 160,
    attackDamage: 1,
    attackRange: 26,
    aggroRange: 200,
    aerial: false,
    sfxHit: 'romeRatHit',
  },
  vestibuleWisp: {
    hp: 2,
    moveSpeed: 95,
    attackDamage: 1,
    attackRange: 36,
    aggroRange: 380,
    aerial: true,
    sfxHit: 'romeWispHit',
  },
  marbleGolem: {
    hp: 8,
    moveSpeed: 52,
    attackDamage: 3,
    attackRange: 60,
    aggroRange: 280,
    aerial: false,
    sfxHit: 'romeGolemHit',
  },
};
