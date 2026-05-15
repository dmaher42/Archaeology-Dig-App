import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BASE_CAMP_SHOP_ITEMS,
  applyShopPurchase,
  createDefaultProgression,
  getActiveUpgradeEffects,
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

test('cosmetic purchases use the same relic shard bank', () => {
  const cosmetic = BASE_CAMP_SHOP_ITEMS.find(item => item.id === 'expedition-hat');
  const result = applyShopPurchase(createDefaultProgression({ relicShards: cosmetic.cost }), cosmetic.id);

  assert.equal(result.ok, true);
  assert.equal(result.progress.relicShards, 0);
  assert.deepEqual(result.progress.unlockedCosmetics, ['expedition-hat']);
});
