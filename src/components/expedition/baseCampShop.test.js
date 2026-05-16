import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BASE_CAMP_SHOP_ITEMS,
  applyShopPurchase,
  createDefaultProgression,
  getActiveUpgradeEffects,
  getShopItemDisplayName,
} from './baseCampShop.js';

test('applyShopPurchase spends relic shards and records a permanent upgrade', () => {
  const progress = createDefaultProgression({ relicShards: 18 });

  const result = applyShopPurchase(progress, 'reinforced-boots');

  assert.equal(result.ok, true);
  assert.equal(result.progress.relicShards, 3);
  assert.deepEqual(result.progress.purchasedUpgrades, ['reinforced-boots']);
  assert.equal(result.item.name, 'Reinforced Boots');
});

test('applyShopPurchase does not charge twice for the same item', () => {
  const progress = createDefaultProgression({
    relicShards: 25,
    purchasedUpgrades: ['reinforced-boots'],
  });

  const result = applyShopPurchase(progress, 'reinforced-boots');

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'owned');
  assert.equal(result.progress.relicShards, 25);
  assert.deepEqual(result.progress.purchasedUpgrades, ['reinforced-boots']);
});

test('getActiveUpgradeEffects returns small balanced movement and survival bonuses', () => {
  const effects = getActiveUpgradeEffects(['reinforced-boots', 'climbing-gloves', 'reinforced-backpack']);

  assert.equal(effects.jumpMultiplier, 1.06);
  assert.equal(effects.airControlMultiplier, 1.08);
  assert.equal(effects.maxStamina, 112);
  assert.ok(effects.knockbackMultiplier < 1);
});

test('route exploration upgrades can be purchased from Base Camp', () => {
  const routeUpgradeIds = ['rope-launcher', 'survey-goggles', 'excavation-hammer', 'climbing-gloves'];
  routeUpgradeIds.forEach((upgradeId) => {
    const item = BASE_CAMP_SHOP_ITEMS.find(shopItem => shopItem.id === upgradeId);
    assert.ok(item, `${upgradeId} should be in the Base Camp shop`);
    assert.equal(item.type, 'upgrade');
    assert.equal(item.locked, undefined);
    assert.match(item.shortEffect, /route|clue|bridge/i);
    assert.equal(item.routeUse, 'Unlocks optional route');
    assert.ok(item.activeSummary);
  });

  const progress = createDefaultProgression({ relicShards: 100 });
  const result = applyShopPurchase(progress, 'excavation-hammer');

  assert.equal(result.ok, true);
  assert.deepEqual(result.progress.purchasedUpgrades, ['excavation-hammer']);
});

test('route exploration upgrades expose route access effects', () => {
  const effects = getActiveUpgradeEffects(['rope-launcher', 'survey-goggles', 'excavation-hammer']);

  assert.equal(effects.hiddenRouteAccess, true);
  assert.equal(effects.hiddenClueHighlights, true);
  assert.equal(effects.fragileWallAccess, true);
});

test('shop item display names keep Journey route labels classroom-readable', () => {
  assert.equal(getShopItemDisplayName('rope-launcher'), 'Rope Launcher');
  assert.equal(getShopItemDisplayName('survey-goggles'), 'Survey Goggles');
  assert.equal(getShopItemDisplayName('future-field-kit'), 'Future Field Kit');
});

test('cosmetic purchases use the same relic shard bank', () => {
  const cosmetic = BASE_CAMP_SHOP_ITEMS.find(item => item.id === 'expedition-hat');
  const result = applyShopPurchase(createDefaultProgression({ relicShards: cosmetic.cost }), cosmetic.id);

  assert.equal(result.ok, true);
  assert.equal(result.progress.relicShards, 0);
  assert.deepEqual(result.progress.unlockedCosmetics, ['expedition-hat']);
});
