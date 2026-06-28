// Rome boss sprite definitions — Legate Revenant and future Rome boss roster.

const ROME_BOSS_SPRITE_BASE_PATH = 'assets/expedition/bosses/rome/';

// --- Boss IDs ---
export const ROME_LEGATE_REVENANT_BOSS_ID   = 'rome-legate-revenant';
const ROME_VAULT_SENTINEL_BOSS_ID     = 'rome-vault-sentinel';     // future
const ROME_IRON_EAGLE_BOSS_ID         = 'rome-iron-eagle';          // future

// --- Section One atlas paths ---
export const ROME_LEGATE_REVENANT_SPRITE_ATLAS_JSON  = `${ROME_BOSS_SPRITE_BASE_PATH}rome-legate-revenant-sprites.json`;
const ROME_VAULT_SENTINEL_SPRITE_ATLAS_JSON    = `${ROME_BOSS_SPRITE_BASE_PATH}rome-vault-sentinel-sprites.json`;
const ROME_IRON_EAGLE_SPRITE_ATLAS_JSON        = `${ROME_BOSS_SPRITE_BASE_PATH}rome-iron-eagle-sprites.json`;

// Draw sizing
const ROME_MIN_BOSS_DRAW_HEIGHT = 176;
const ROME_LEGATE_REVENANT_DRAW_OFFSET_X = 16;
const ROME_LEGATE_REVENANT_FOOT_SINK = 10;

// --- Sprite key contracts ---
const ROME_LEGATE_REVENANT_ANIMATED_SPRITE_KEYS = [
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

const ROME_VAULT_SENTINEL_SPRITE_KEYS = simpleBossKeys('vaultSentinel');
const ROME_IRON_EAGLE_SPRITE_KEYS     = simpleBossKeys('ironEagle');

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

export const getRomeBossSpritePack = (assets, bossId) => {
  const pack = assets?.packs?.[bossId];
  if (!pack?.loaded || pack.failed) return null;
  return pack;
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
