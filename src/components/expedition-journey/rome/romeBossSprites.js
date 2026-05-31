// Rome boss sprite definitions — Legate Revenant and future Rome boss roster.

export const ROME_BOSS_SPRITE_BASE_PATH = 'assets/expedition/bosses/rome/';

// --- Boss IDs ---
export const ROME_LEGATE_REVENANT_BOSS_ID   = 'rome-legate-revenant';
export const ROME_VAULT_SENTINEL_BOSS_ID     = 'rome-vault-sentinel';     // future
export const ROME_IRON_EAGLE_BOSS_ID         = 'rome-iron-eagle';          // future

// --- Atlas paths (placeholder until art is delivered) ---
export const ROME_LEGATE_REVENANT_SPRITE_ATLAS_JSON  = `${ROME_BOSS_SPRITE_BASE_PATH}rome-legate-revenant-sprites.json`;
export const ROME_VAULT_SENTINEL_SPRITE_ATLAS_JSON    = `${ROME_BOSS_SPRITE_BASE_PATH}rome-vault-sentinel-sprites.json`;
export const ROME_IRON_EAGLE_SPRITE_ATLAS_JSON        = `${ROME_BOSS_SPRITE_BASE_PATH}rome-iron-eagle-sprites.json`;

export const ROME_BOSS_SPRITE_ATLAS_VERSION = 'rome-boss-sprites-placeholder-2026-05-31';

// Draw sizing
export const ROME_MIN_BOSS_DRAW_HEIGHT = 176;
export const ROME_LEGATE_REVENANT_DRAW_OFFSET_X = 16;
export const ROME_LEGATE_REVENANT_FOOT_SINK = 10;

// --- Sprite key contracts ---
export const ROME_LEGATE_REVENANT_ANIMATED_SPRITE_KEYS = [
  ...Array.from({ length: 6 }, (_, i) => `legateRevenantWalk${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `legateRevenantCharge${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `legateRevenantWindup${i + 1}`),
  ...Array.from({ length: 7 }, (_, i) => `legateRevenantShieldBash${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `legateRevenantStagger${i + 1}`),
  ...Array.from({ length: 8 }, (_, i) => `legateRevenantDeath${i + 1}`),
];

export const ROME_LEGATE_REVENANT_SPRITE_KEYS = [...new Set([
  'legateRevenantIdle',
  'legateRevenantIntro',
  'legateRevenantWindup',
  'legateRevenantCharge',
  'legateRevenantShieldBash',
  'legateRevenantShielded',
  'legateRevenantCounterWindow',
  'legateRevenantHit',
  'legateRevenantDefeated',
  ...ROME_LEGATE_REVENANT_ANIMATED_SPRITE_KEYS,
])];

// Future bosses share this simpler key contract until they get unique animations
const simpleBossKeys = (prefix) => [
  `${prefix}Idle`,
  `${prefix}Walk1`, `${prefix}Walk2`,
  `${prefix}Intro`,
  `${prefix}Windup`,
  `${prefix}Slam`,
  `${prefix}Pulse`,
  `${prefix}Shielded`,
  `${prefix}CounterWindow`,
  `${prefix}Hit`,
  `${prefix}Defeated`,
];

export const ROME_VAULT_SENTINEL_SPRITE_KEYS = simpleBossKeys('vaultSentinel');
export const ROME_IRON_EAGLE_SPRITE_KEYS     = simpleBossKeys('ironEagle');

const ROME_BOSS_SPRITE_PACKS = {
  [ROME_LEGATE_REVENANT_BOSS_ID]: {
    atlasPath: ROME_LEGATE_REVENANT_SPRITE_ATLAS_JSON,
    expectedKeys: ROME_LEGATE_REVENANT_SPRITE_KEYS,
  },
  [ROME_VAULT_SENTINEL_BOSS_ID]: {
    atlasPath: ROME_VAULT_SENTINEL_SPRITE_ATLAS_JSON,
    expectedKeys: ROME_VAULT_SENTINEL_SPRITE_KEYS,
  },
  [ROME_IRON_EAGLE_BOSS_ID]: {
    atlasPath: ROME_IRON_EAGLE_SPRITE_ATLAS_JSON,
    expectedKeys: ROME_IRON_EAGLE_SPRITE_KEYS,
  },
};

export const ROME_JOURNEY_BOSS_SPRITE_PACK_IDS = [ROME_LEGATE_REVENANT_BOSS_ID];

export const isRomeBossSpriteId = (bossId) => Object.hasOwn(ROME_BOSS_SPRITE_PACKS, bossId);

const getAtlasImagePath = (atlasPath, imageName) => {
  if (!imageName) return null;
  if (imageName.startsWith('/') || imageName.startsWith('assets/')) return imageName;
  const dir = atlasPath.includes('/') ? atlasPath.slice(0, atlasPath.lastIndexOf('/') + 1) : '';
  return `${dir}${imageName}`;
};

export const createRomeBossSpriteState = () => ({
  packs: {},
  loaded: false,
  ready: false,
  failed: false,
  error: null,
});

export const getMissingRomeBossSpriteAssets = (assets) => (
  Object.entries(ROME_BOSS_SPRITE_PACKS).flatMap(([bossId, packConfig]) => {
    const regions = assets?.packs?.[bossId]?.atlas?.regions || {};
    return packConfig.expectedKeys.filter((k) => !regions[k]).map((k) => `${bossId}:${k}`);
  })
);

export const getRomeBossSpritePack = (assets, bossId) => {
  const pack = assets?.packs?.[bossId];
  if (!pack?.loaded || pack.failed) return null;
  return pack;
};

export const loadRomeBossSpritePack = ({ baseUrl = '/', onUpdate, packIds = null }) => {
  let cancelled = false;
  const requested = packIds ? new Set(packIds) : null;
  const entries = Object.entries(ROME_BOSS_SPRITE_PACKS)
    .filter(([id]) => !requested || requested.has(id));

  const loadOne = ([bossId, packConfig]) => {
    const atlasUrl = `${baseUrl}${packConfig.atlasPath}`;
    return fetch(atlasUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`${bossId} boss atlas failed: ${res.status}`);
        return res.json();
      })
      .then((atlas) => new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve([bossId, { image, atlas, loaded: true, ready: packConfig.expectedKeys.every((k) => atlas?.regions?.[k]), failed: false, error: null, atlasPath: packConfig.atlasPath }]);
        image.onerror = () => resolve([bossId, { image: null, atlas, loaded: false, ready: false, failed: true, error: `${bossId} image failed.`, atlasPath: packConfig.atlasPath }]);
        image.src = `${baseUrl}${getAtlasImagePath(packConfig.atlasPath, atlas.image)}`;
      }))
      .catch((err) => [bossId, { image: null, atlas: null, loaded: false, ready: false, failed: true, error: err?.message || `${bossId} failed.`, atlasPath: packConfig.atlasPath }]);
  };

  Promise.all(entries.map(loadOne)).then((results) => {
    if (cancelled) return;
    const packs = Object.fromEntries(results);
    const vals = Object.values(packs);
    onUpdate?.({
      ...createRomeBossSpriteState(),
      packs,
      loaded: vals.some((p) => p.loaded),
      ready: vals.length > 0 && vals.every((p) => p.ready && !p.failed),
      failed: vals.some((p) => p.failed),
      error: vals.filter((p) => p.error).map((p) => p.error).join(' | ') || null,
    });
  });

  return () => { cancelled = true; };
};

// --- Sprite frame selectors ---

export const getLegateRevenantSpriteFrame = (boss, combatMode, bossVisualState = {}, now = 0) => {
  if (boss?.id !== ROME_LEGATE_REVENANT_BOSS_ID) return null;

  const seq = (prefix, count, frameMs) => `${prefix}${(Math.floor(now / frameMs) % count) + 1}`;

  if (combatMode === 'defeated')  return seq('legateRevenantDeath', 8, 150);
  if (boss.hitFlash > 0 || combatMode === 'stunned') return seq('legateRevenantStagger', 5, 130);
  if (bossVisualState.shielded)   return 'legateRevenantShielded';
  if (bossVisualState.vulnerable) return seq('legateRevenantStagger', 5, 160);
  if (combatMode === 'windup')    return seq('legateRevenantWindup', 5, 120);
  if (combatMode === 'attacking') {
    return bossVisualState.attackKind === 'area'
      ? seq('legateRevenantShieldBash', 7, 90)
      : seq('legateRevenantCharge', 6, 85);
  }
  if (!boss.awakened) return 'legateRevenantIntro';
  return seq('legateRevenantWalk', 6, 140);
};

export const shouldFlipRomeBossSprite = (bossId, facing = 1) => facing < 0;

// --- Draw boxes ---

const groundedBox = (boss, screenX, width, height, footSink = 4) => ({
  x: screenX + boss.width / 2 - width / 2,
  y: boss.y + boss.height - height + footSink,
  width,
  height,
});

export const getLegateRevenantDrawBox = (boss, screenX) => {
  const height = Math.max(ROME_MIN_BOSS_DRAW_HEIGHT * 1.3, boss.height * 4.8);
  const width  = Math.max(300, boss.width * 5.2);
  const box = groundedBox(boss, screenX, width, height, ROME_LEGATE_REVENANT_FOOT_SINK);
  return { ...box, x: box.x + ROME_LEGATE_REVENANT_DRAW_OFFSET_X };
};
