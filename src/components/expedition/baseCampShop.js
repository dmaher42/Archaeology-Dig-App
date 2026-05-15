export const BASE_CAMP_PROGRESSION_STORAGE_KEY = 'archaeology-dig-app:lost-site-expedition:base-camp-progression:v1';

export const BASE_CAMP_SHOP_ITEMS = [
  {
    id: 'reinforced-boots',
    section: 'Field Gear',
    type: 'upgrade',
    name: 'Reinforced Boots',
    cost: 15,
    shortEffect: 'Slightly stronger jumps',
    description: 'Field boots with firmer soles for careful jumps across broken ground.',
  },
  {
    id: 'climbing-gloves',
    section: 'Field Gear',
    type: 'upgrade',
    name: 'Climbing Gloves',
    cost: 20,
    shortEffect: 'Slightly better air control',
    description: 'Grip gloves that help the archaeologist adjust safely after a jump.',
  },
  {
    id: 'reinforced-backpack',
    section: 'Expedition Upgrades',
    type: 'upgrade',
    name: 'Reinforced Backpack',
    cost: 25,
    shortEffect: 'More stamina for long routes',
    description: 'A balanced field pack that lets the team carry supplies with less strain.',
  },
  {
    id: 'expedition-hat',
    section: 'Cosmetics',
    type: 'cosmetic',
    name: 'Expedition Hat',
    cost: 10,
    shortEffect: 'Cosmetic unlock',
    description: 'A classic expedition hat unlocked for future character visual options.',
  },
  {
    id: 'curator-journal-cover',
    section: 'Cosmetics',
    type: 'cosmetic',
    name: 'Curator Journal Cover',
    cost: 15,
    shortEffect: 'Cosmetic unlock',
    description: 'A museum-style journal cover for future field-note presentation.',
  },
  {
    id: 'bronze-backpack',
    section: 'Cosmetics',
    type: 'cosmetic',
    name: 'Bronze Backpack',
    cost: 20,
    shortEffect: 'Cosmetic unlock',
    description: 'A bronze-trim field pack cosmetic for future player visuals.',
  },
  {
    id: 'survey-goggles',
    section: 'Journal Unlocks',
    type: 'journal',
    name: 'Survey Goggles Notes',
    cost: 30,
    shortEffect: 'Future clue support',
    description: 'Research notes for a future safe hidden-clue highlight upgrade.',
    locked: true,
  },
  {
    id: 'rope-launcher',
    section: 'Expedition Upgrades',
    type: 'upgrade',
    name: 'Rope Launcher',
    cost: 35,
    shortEffect: 'Future hidden-route support',
    description: 'A planned route tool for later hidden paths. Not installed yet.',
    locked: true,
  },
];

export const BASE_CAMP_SHOP_SECTIONS = ['Field Gear', 'Expedition Upgrades', 'Cosmetics', 'Journal Unlocks'];

const DEFAULT_EFFECTS = {
  jumpMultiplier: 1,
  airControlMultiplier: 1,
  knockbackMultiplier: 1,
  maxStamina: 100,
  hazardStaminaMultiplier: 1,
  hiddenClueHighlights: false,
  hiddenRouteAccess: false,
};

const UPGRADE_EFFECTS = {
  'reinforced-boots': {
    jumpMultiplier: 1.06,
    knockbackMultiplier: 0.96,
  },
  'climbing-gloves': {
    airControlMultiplier: 1.08,
  },
  'reinforced-backpack': {
    maxStamina: 112,
  },
  'expedition-harness': {
    knockbackMultiplier: 0.86,
  },
  'dust-mask': {
    hazardStaminaMultiplier: 0.85,
  },
  'survey-goggles': {
    hiddenClueHighlights: true,
  },
  'rope-launcher': {
    hiddenRouteAccess: true,
  },
};

const unique = (items = []) => [...new Set(items.filter(Boolean))];

export const createDefaultProgression = (overrides = {}) => ({
  relicShards: Math.max(0, Number(overrides.relicShards) || 0),
  depositedJourneyRuns: unique(overrides.depositedJourneyRuns),
  purchasedUpgrades: unique(overrides.purchasedUpgrades),
  unlockedCosmetics: unique(overrides.unlockedCosmetics),
  journalUnlocks: unique(overrides.journalUnlocks),
  lastPurchasedItemId: overrides.lastPurchasedItemId || null,
});

export const normalizeBaseCampProgression = (value) => {
  if (!value || typeof value !== 'object') return createDefaultProgression();
  return createDefaultProgression(value);
};

export const getShopItemById = (itemId) => BASE_CAMP_SHOP_ITEMS.find(item => item.id === itemId) || null;

export const getOwnedItemIds = (progression) => {
  const progress = normalizeBaseCampProgression(progression);
  return new Set([
    ...progress.purchasedUpgrades,
    ...progress.unlockedCosmetics,
    ...progress.journalUnlocks,
  ]);
};

export const applyJourneyShardDeposit = (progression, { runId, shardCount }) => {
  const progress = normalizeBaseCampProgression(progression);
  const safeRunId = runId || `journey-run-${progress.depositedJourneyRuns.length + 1}`;
  const safeShardCount = Math.max(0, Number(shardCount) || 0);

  if (progress.depositedJourneyRuns.includes(safeRunId) || safeShardCount <= 0) {
    return {
      deposited: false,
      amount: 0,
      progress,
    };
  }

  return {
    deposited: true,
    amount: safeShardCount,
    progress: {
      ...progress,
      relicShards: progress.relicShards + safeShardCount,
      depositedJourneyRuns: [...progress.depositedJourneyRuns, safeRunId],
    },
  };
};

export const applyShopPurchase = (progression, itemId) => {
  const progress = normalizeBaseCampProgression(progression);
  const item = getShopItemById(itemId);

  if (!item) {
    return { ok: false, reason: 'missing', progress, item: null };
  }
  if (item.locked) {
    return { ok: false, reason: 'locked', progress, item };
  }

  const ownedItemIds = getOwnedItemIds(progress);
  if (ownedItemIds.has(item.id)) {
    return { ok: false, reason: 'owned', progress, item };
  }
  if (progress.relicShards < item.cost) {
    return { ok: false, reason: 'shards', progress, item };
  }

  const nextProgress = {
    ...progress,
    relicShards: progress.relicShards - item.cost,
    lastPurchasedItemId: item.id,
  };

  if (item.type === 'upgrade') {
    nextProgress.purchasedUpgrades = [...progress.purchasedUpgrades, item.id];
  } else if (item.type === 'cosmetic') {
    nextProgress.unlockedCosmetics = [...progress.unlockedCosmetics, item.id];
  } else {
    nextProgress.journalUnlocks = [...progress.journalUnlocks, item.id];
  }

  return { ok: true, reason: 'purchased', progress: nextProgress, item };
};

export const getActiveUpgradeEffects = (upgradeIds = []) => (
  unique(upgradeIds).reduce((effects, upgradeId) => {
    const upgrade = UPGRADE_EFFECTS[upgradeId];
    if (!upgrade) return effects;
    return {
      ...effects,
      jumpMultiplier: Math.max(effects.jumpMultiplier, upgrade.jumpMultiplier || DEFAULT_EFFECTS.jumpMultiplier),
      airControlMultiplier: Math.max(effects.airControlMultiplier, upgrade.airControlMultiplier || DEFAULT_EFFECTS.airControlMultiplier),
      knockbackMultiplier: Math.min(effects.knockbackMultiplier, upgrade.knockbackMultiplier || DEFAULT_EFFECTS.knockbackMultiplier),
      maxStamina: Math.max(effects.maxStamina, upgrade.maxStamina || DEFAULT_EFFECTS.maxStamina),
      hazardStaminaMultiplier: Math.min(effects.hazardStaminaMultiplier, upgrade.hazardStaminaMultiplier || DEFAULT_EFFECTS.hazardStaminaMultiplier),
      hiddenClueHighlights: effects.hiddenClueHighlights || Boolean(upgrade.hiddenClueHighlights),
      hiddenRouteAccess: effects.hiddenRouteAccess || Boolean(upgrade.hiddenRouteAccess),
    };
  }, DEFAULT_EFFECTS)
);
