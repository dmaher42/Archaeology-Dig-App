// ENEMY_BASE_HEIGHT is intentionally separate from PLAYER_SPRITE_DRAW_HEIGHT so that
// enemy sizes stay fixed when Asha's draw height is tuned.
import {
  EXPECTED_ROME_FORUM_RAT_SPRITE_KEYS,
  EXPECTED_ROME_GLADIATOR_REVENANT_SPRITE_KEYS,
  EXPECTED_ROME_LEGION_SHADE_SPRITE_KEYS,
  EXPECTED_ROME_MARBLE_GOLEM_SPRITE_KEYS,
  EXPECTED_ROME_VESTIBULE_WISP_SPRITE_KEYS,
  ROME_FORUM_RAT_SPRITE_ATLAS_JSON,
  ROME_GLADIATOR_REVENANT_SPRITE_ATLAS_JSON,
  ROME_LEGION_SHADE_SPRITE_ATLAS_JSON,
  ROME_MARBLE_GOLEM_SPRITE_ATLAS_JSON,
  ROME_VESTIBULE_WISP_SPRITE_ATLAS_JSON,
} from './rome/romeEnemySprites.js';

const ENEMY_BASE_HEIGHT = 108;

export const ENEMY_SPRITE_BASE_PATH = 'assets/expedition/enemies/';
export const ENEMY_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}small-enemy-sprites.json`;
export const LOOTER_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}looter-sprites.json`;
export const LOOTER_CAPTAIN_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}looter-captain-sprites-premium-2026-06-02.json`;
export const TEMPLE_BAT_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}temple-bat-sprites.json`;
export const DESERT_SCARAB_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}desert-scarab-intimidating-sprites-heavy-windup-attack-2026-06-03.json`;
export const SAND_SNAKE_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}sand-snake-sprites.json`;
export const SCORPION_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}scorpion-sprites-heavy-windup-2026-06-02.json`;
export const SAND_WISP_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}sand-wisp-sprites.json`;
export const CURSED_STATUE_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}cursed-statue-sprites.json`;
export const STONE_GUARDIAN_ENEMY_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}stone-guardian-enemy-sprites-premium-2026-06-02.json`;
export const WARRIOR_MUMMY_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}warrior-mummy-sprites.json`;
export const BES_GUARDIAN_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}bes-guardian-sprites.json`;
export const CHINA_ENEMY_GUARDIAN_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}china/china-enemy-guardian-sprites.json`;
export const CHINA_RIVER_CRAB_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}china/china-river-crab-sprites.json`;
export const CHINA_WATCHTOWER_SENTRY_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}china/china-watchtower-sentry-sprites.json`;
export const CHINA_CLAY_GUARDIAN_ENEMY_SPRITE_ATLAS_JSON = `${ENEMY_SPRITE_BASE_PATH}china/china-clay-guardian-enemy-sprites.json`;
export const ENEMY_SPRITE_ATLAS_VERSION = 'enemy-sprite-packs-2026-06-03-scarab-attack-read';
export const ENEMY_SPRITE_GROUNDING_VERSION = 'enemy-sprite-grounding-2026-05-18';
export const MIN_ENEMY_DRAW_HEIGHT = 34;
export const ENEMY_VISUAL_SIZE_MULTIPLIER = 1.5;
export const MUMMY_ASHA_SIZE_MULTIPLIER = 1.46; // mummy visibly taller than Asha (~158px vs 130px)
const ENEMY_VISUAL_SIZE_MULTIPLIERS = {
  scarab: 2.97,         // +10%
  snake: 1.68,
  bat: 1.72,
  scorpion: 2.97,       // +10%
  sandWisp: 1.52,       // was 1.32 — wisp has more presence
  looter: 1.32,         // was 1.12 — human enemies near Asha's height
  looterCaptain: 1.38,  // was 1.16
  cursedStatue: 1.44,   // was 1.14 — statues now tower over Asha
  stoneGuardianEnemy: 1.44, // was 1.16 — guardians clearly larger than Asha
  mummy: 1.72,          // keep — handled by MUMMY_ASHA_SIZE_MULTIPLIER separately
  besGuardian: 1.82,    // keep — already imposing
  riverCrab: 1.42,      // keep
  watchtowerSentry: 1.32, // was 1.12
  clayGuardian: 1.38,   // was 1.16
  // Rome families
  legionShade:       1.28,  // was 1.14
  gladiatorRevenant: 1.38,  // was 1.22
  forumRat:          0.72,
  vestibuleWisp:     1.80,
  marbleGolem:       1.85,
};
const HEAVY_WINDUP_FRAME_KEYS = {
  scarab: {
    patternId: 'heavy-charge',
    frames: ['scarabHeavyWindup1', 'scarabHeavyWindup2'],
  },
  scorpion: {
    patternId: 'power-sting',
    frames: ['scorpionHeavyWindup1', 'scorpionHeavyWindup2'],
  },
};
const SCORPION_VENOM_ATTACK_PATTERN_ID = 'venom-spit';
export const WITHHELD_EGYPT_CREATURE_SPRITE_FAMILIES = new Set([
  'cursedStatue',
]);

export const EXPECTED_ENEMY_SPRITE_KEYS = [
  'scarabIdle',
  'scarabWalk1',
  'scarabWalk2',
  'scarabWalk3',
  'scarabWindup',
  'scarabHeavyWindup1',
  'scarabHeavyWindup2',
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
  'scarabHeavyWindup1',
  'scarabHeavyWindup2',
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
  'scorpionHeavyWindup1',
  'scorpionHeavyWindup2',
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

export const EXPECTED_BES_GUARDIAN_SPRITE_KEYS = [
  'besGuardianIdle',
  'besGuardianWalk1',
  'besGuardianWalk2',
  'besGuardianWalk3',
  'besGuardianWindup',
  'besGuardianAttack',
  'besGuardianHit',
  'besGuardianDefeated',
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
  besGuardian: {
    atlasPath: BES_GUARDIAN_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_BES_GUARDIAN_SPRITE_KEYS,
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

export const EGYPT_JOURNEY_ENEMY_SPRITE_PACK_IDS = [
  'small',
  'looter',
  'looterCaptain',
  'bat',
  'scarab',
  'snake',
  'scorpion',
  'sandWisp',
  'cursedStatue',
  'stoneGuardianEnemy',
  'mummy',
  'besGuardian',
];

export const CHINA_JOURNEY_ENEMY_SPRITE_PACK_IDS = [
  'chinaEnemyGuardian',
  'chinaRiverCrab',
  'chinaWatchtowerSentry',
  'chinaClayGuardianEnemy',
];

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

const getRequestedEnemySpritePacks = (packIds = null) => {
  if (!Array.isArray(packIds) || packIds.length === 0) {
    return Object.entries(ENEMY_SPRITE_PACKS);
  }
  const requested = new Set(packIds.filter(Boolean));
  return Object.entries(ENEMY_SPRITE_PACKS).filter(([packId]) => requested.has(packId));
};

export const getMissingEnemySpriteAssets = (assets) => {
  if (assets?.packs && Object.keys(assets.packs).length > 0) {
    return Object.entries(ENEMY_SPRITE_PACKS)
      .filter(([packId]) => assets.packs?.[packId])
      .flatMap(([packId, packConfig]) => {
      const regions = assets.packs?.[packId]?.atlas?.regions || {};
      return packConfig.expectedKeys
        .filter(key => !regions[key])
        .map(key => `${packId}:${key}`);
    });
  }
  const regions = assets?.atlas?.regions || {};
  return EXPECTED_ENEMY_SPRITE_KEYS.filter(key => !regions[key]);
};

export const loadEnemySpritePack = ({ baseUrl = '/', onUpdate, packIds = null }) => {
  let cancelled = false;
  const versionQuery = `v=${encodeURIComponent(ENEMY_SPRITE_ATLAS_VERSION)}`;
  const packEntriesToLoad = getRequestedEnemySpritePacks(packIds);

  const loadSinglePack = ([packId, packConfig]) => {
    const atlasPath = `${baseUrl}${packConfig.atlasPath}`;
    return fetch(`${atlasPath}?${versionQuery}`)
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
        image.src = `${baseUrl}${getAtlasImagePath(packConfig.atlasPath, atlas.image)}?${versionQuery}`;
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

  Promise.all(packEntriesToLoad.map(loadSinglePack)).then((packEntries) => {
    if (cancelled) return;
    const packs = Object.fromEntries(packEntries);
    const smallPack = packs.small;
    const loadedPacks = Object.values(packs);
    onUpdate?.({
      ...createEnemySpriteState(),
      image: smallPack?.image || null,
      atlas: smallPack?.atlas || null,
      packs,
      loaded: loadedPacks.some(pack => pack.loaded),
      ready: loadedPacks.length > 0 && loadedPacks.every(pack => pack.ready && !pack.failed),
      failed: loadedPacks.some(pack => pack.failed),
      error: loadedPacks.filter(pack => pack.error).map(pack => pack.error).join(' | ') || null,
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
  if (family === 'besGuardian') return assets?.packs?.besGuardian || null;
  if (family === 'riverCrab') return assets?.packs?.chinaRiverCrab || assets?.packs?.chinaEnemyGuardian || null;
  if (family === 'watchtowerSentry') return assets?.packs?.chinaWatchtowerSentry || assets?.packs?.chinaEnemyGuardian || null;
  if (family === 'clayGuardian') return assets?.packs?.chinaClayGuardianEnemy || assets?.packs?.chinaEnemyGuardian || null;
  if (family === 'legionShade') return assets?.packs?.legionShade || null;
  if (family === 'gladiatorRevenant') return assets?.packs?.gladiatorRevenant || null;
  if (family === 'forumRat') return assets?.packs?.forumRat || null;
  if (family === 'vestibuleWisp') return assets?.packs?.vestibuleWisp || null;
  if (family === 'marbleGolem') return assets?.packs?.marbleGolem || null;
  return assets?.packs?.small || assets || null;
};

export const getEnemySpriteFamily = (enemy) => {
  if (!enemy) return null;
  // The scorpion nest is a stationary destructible spawner with its own placeholder
  // render — it must NOT resolve to the scorpion sprite (its name contains "scorpion").
  if (enemy.type === 'scorpion-nest') return null;
  const name = (enemy.name || '').toLowerCase();
  // Rome enemy types
  if (enemy.type === 'legion-shade'       || name.includes('legion shade') || name.includes('praetorian shade') || name.includes('bath shade') || name.includes('forum shade') || name.includes('ruins guard') || name.includes('apse guard')) return 'legionShade';
  if (enemy.type === 'gladiator-revenant' || name.includes('gladiator revenant') || name.includes('arena revenant') || name.includes('vault gladiator') || name.includes('nave gladiator') || name.includes("legate's champion")) return 'gladiatorRevenant';
  if (enemy.type === 'forum-rat'          || name.includes('forum rat') || name.includes('marble rat') || name.includes('steam rat')) return 'forumRat';
  if (enemy.type === 'vestibule-wisp'     || name.includes('vestibule wisp') || name.includes('forum wisp') || name.includes('hypocaust wisp') || name.includes('drain wisp')) return 'vestibuleWisp';
  if (enemy.type === 'marble-golem'       || name.includes('marble golem') || name.includes('stone pillar golem') || name.includes('column golem') || name.includes('vault sentinel')) return 'marbleGolem';
  // Egypt / China enemy types
  if (enemy.type === 'bes' || name.includes('bes')) return 'besGuardian';
  if (enemy.type === 'sand-wisp' || name.includes('sand wisp')) return 'sandWisp';
  if (enemy.type === 'scarab' || name.includes('scarab') || name.includes('beetle')) return 'scarab';
  if (enemy.type === 'snake' || name.includes('snake') || name.includes('serpent')) return 'snake';
  if (enemy.type === 'bat' || name.includes('bat')) return 'bat';
  if (enemy.type === 'scorpion' || name.includes('scorpion')) return 'scorpion';
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
  const isScorpionVenomSpit = family === 'scorpion' && enemy?.attackPattern === SCORPION_VENOM_ATTACK_PATTERN_ID;

  // Rome families use 3-pose walk cycles
  const ROME_FAMILIES = new Set(['legionShade', 'gladiatorRevenant', 'forumRat', 'vestibuleWisp', 'marbleGolem']);
  const restoredTwoPoseWalkFamilies = new Set(['scarab', 'snake', 'bat']);
  const walkPoseCount = restoredTwoPoseWalkFamilies.has(family) ? 2 : 3;
  const walkFrameMs = (family === 'bat' || family === 'sandWisp' || family === 'vestibuleWisp') ? 135 : 180;
  const walkFrame = (Math.floor(now / walkFrameMs) % walkPoseCount) + 1;

  if (ROME_FAMILIES.has(family)) {
    if (combatMode === 'defeated') return `${family}Defeated`;
    if (combatMode === 'stunned')  return `${family}Hit`;
    if (combatMode === 'windup')   return `${family}Windup`;
    if (combatMode === 'attacking') return `${family}Attack`;
    return `${family}Walk${walkFrame}`;
  }

  if (combatMode === 'defeated') return `${family}Defeated`;
  if (combatMode === 'stunned') return `${family}Hit`;
  if (combatMode === 'windup') {
    const heavyWindup = HEAVY_WINDUP_FRAME_KEYS[family];
    if (heavyWindup && enemy.attackPattern === heavyWindup.patternId) {
      return heavyWindup.frames[Math.floor(now / 160) % heavyWindup.frames.length];
    }
    return `${family}Windup`;
  }
  if (combatMode === 'attacking') return isScorpionVenomSpit ? 'scorpionWindup' : `${family}Attack`;
  if (combatMode === 'cooldown' && (family === 'scarab' || family === 'scorpion')) return `${family}Hit`;

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
  if (family === 'besGuardian') return `besGuardianWalk${walkFrame}`;
  if (family === 'riverCrab') return `riverCrabWalk${walkFrame}`;
  if (family === 'watchtowerSentry') return `watchtowerSentryWalk${walkFrame}`;
  if (family === 'clayGuardian') return `clayGuardianWalk${walkFrame}`;
  return `${family}Idle`;
};

export const shouldFlipEnemySprite = (_family, facing = 1) => facing < 0;

export const getEnemyBodyLanguagePose = (enemy, combatMode) => {
  const family = getEnemySpriteFamily(enemy);
  const direction = enemy?.attackDirection || enemy?.direction || 1;
  const base = { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1, rotation: 0 };

  if (family === 'scarab') {
    if (combatMode === 'windup') {
      return { offsetX: -direction * 5, offsetY: 1, scaleX: 0.94, scaleY: 1.08, rotation: -direction * 0.055 };
    }
    if (combatMode === 'attacking') {
      return { offsetX: direction * 7, offsetY: 0, scaleX: 1.08, scaleY: 0.94, rotation: direction * 0.035 };
    }
    if (combatMode === 'cooldown') {
      return { offsetX: -direction * 3, offsetY: 3, scaleX: 0.98, scaleY: 0.9, rotation: direction * 0.085 };
    }
    if (combatMode === 'stunned') {
      return { offsetX: -direction * 4, offsetY: 2, scaleX: 0.98, scaleY: 0.92, rotation: direction * 0.11 };
    }
  }

  if (family === 'scorpion') {
    const isVenomSpit = enemy?.attackPattern === SCORPION_VENOM_ATTACK_PATTERN_ID;
    if (combatMode === 'windup') {
      return { offsetX: -direction * 2, offsetY: -3, scaleX: 0.98, scaleY: 1.07, rotation: -direction * 0.035 };
    }
    if (combatMode === 'attacking') {
      if (isVenomSpit) {
        return { offsetX: -direction * 1, offsetY: -3, scaleX: 0.99, scaleY: 1.05, rotation: -direction * 0.03 };
      }
      return { offsetX: direction * 5, offsetY: -1, scaleX: 1.05, scaleY: 0.98, rotation: direction * 0.025 };
    }
    if (combatMode === 'cooldown') {
      return { offsetX: -direction * 2, offsetY: 4, scaleX: 0.98, scaleY: 0.93, rotation: direction * 0.065 };
    }
    if (combatMode === 'stunned') {
      return { offsetX: -direction * 3, offsetY: 2, scaleX: 0.98, scaleY: 0.94, rotation: direction * 0.085 };
    }
  }

  return base;
};

export const getEnemySpriteDrawBox = (enemy, screenX, shakeX = 0, combatMode = null) => {
  const family = getEnemySpriteFamily(enemy);
  if (!family) return null;

  const defeated = combatMode === 'defeated' || enemy.defeated;
  const scale = {
    scarab: defeated ? 1.45 : 1.63,     // +10%
    snake: defeated ? 1.52 : 1.72,
    bat: defeated ? 1.62 : 1.82,
    scorpion: defeated ? 1.65 : 2.00,  // +10%
    sandWisp: defeated ? 1.52 : 1.88,   // was 1.46/1.78
    looter: defeated ? 1.44 : 1.76,     // was 1.32/1.62
    looterCaptain: defeated ? 1.50 : 1.86, // was 1.38/1.72
    cursedStatue: defeated ? 1.48 : 1.88,  // was 1.36/1.7
    stoneGuardianEnemy: defeated ? 1.48 : 1.90, // was 1.36/1.72
    mummy: defeated ? 1.48 : 1.86,      // was 1.36/1.7
    besGuardian: defeated ? 1.48 : 1.92, // was 1.36/1.76
    riverCrab: defeated ? 1.34 : 1.54,
    watchtowerSentry: defeated ? 1.44 : 1.76, // was 1.34/1.62
    clayGuardian: defeated ? 1.48 : 1.86, // was 1.38/1.72
  }[family] || 1.55;

  const minHeight = {
    scarab: 38,          // +10%
    snake: 52,
    bat: 52,
    scorpion: 55,        // +10%
    sandWisp: 56,        // was 48
    looter: 88,          // was 76
    looterCaptain: 94,   // was 82
    cursedStatue: 92,    // was 78
    stoneGuardianEnemy: 96, // was 80
    mummy: 86,           // was 78
    besGuardian: 90,     // was 82
    riverCrab: 44,
    watchtowerSentry: 86, // was 78
    clayGuardian: 88,    // was 80
  }[family] || MIN_ENEMY_DRAW_HEIGHT;
  const scaledWidth = Math.max(enemy.width, enemy.width * scale);
  const scaledHeight = Math.max(enemy.height, enemy.height * scale);
  const visualMultiplier = ENEMY_VISUAL_SIZE_MULTIPLIERS[family] || ENEMY_VISUAL_SIZE_MULTIPLIER;
  const height = family === 'mummy' && !defeated
    ? ENEMY_BASE_HEIGHT * MUMMY_ASHA_SIZE_MULTIPLIER
    : Math.max(minHeight, scaledHeight) * visualMultiplier;
  const width = family === 'sandWisp'
    ? Math.max(scaledWidth, height * (defeated ? 1.7 : 1.95))
    : Math.max(scaledWidth, enemy.width * (height / Math.max(1, enemy.height)));
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
    besGuardian: defeated ? 21 : 15,
    riverCrab: defeated ? 18 : 15,
    watchtowerSentry: defeated ? 20 : 15,
    clayGuardian: defeated ? 19 : 14,
  }[family] ?? 8;
  const x = screenX + enemy.width / 2 - width / 2 + shakeX;
  const y = enemy.y + enemy.height - height + groundOffset;

  return { x, y, width, height, family };
};
