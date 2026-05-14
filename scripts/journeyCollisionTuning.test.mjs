import assert from 'node:assert/strict';

import {
  getCollectibleHitbox,
  getEnemyDamageHitbox,
  getEnemyStompHitbox,
  getHazardHitbox,
  getPlatformLandingHitbox,
  getPlayerBodyHitbox,
  getPlayerFeetHitbox,
  isLandingOnPlatform,
  resolveEnemyContact,
} from '../src/components/expedition-journey/journeyUtils.js';

const player = { x: 100, y: 200, width: 28, height: 42, vy: 260 };
const previousPlayer = { ...player, y: 187 };
const enemy = { id: 'scarab-1', type: 'scarab', x: 114, y: 226, width: 34, height: 26, health: 1 };
const collectible = { x: 132, y: 204, width: 24, height: 24 };
const platform = { x: 86, y: 243, width: 58, height: 18 };
const hazard = { x: 110, y: 230, width: 62, height: 30 };

assert.equal(getPlayerBodyHitbox(player).width < player.width, true, 'player body should be narrower than visual sprite');
assert.equal(getPlayerFeetHitbox(player).height < player.height / 3, true, 'feet check should only cover the landing edge');

const enemyDamage = getEnemyDamageHitbox(enemy);
assert.equal(enemyDamage.width < enemy.width, true, 'enemy damage should be smaller than visible enemy width');
assert.equal(enemyDamage.height < enemy.height, true, 'enemy damage should be smaller than visible enemy height');

const enemyStomp = getEnemyStompHitbox(enemy);
assert.equal(enemyStomp.y < enemy.y + enemy.height / 2, true, 'stomp zone should sit on the enemy top half');

const pickupBox = getCollectibleHitbox(collectible, { width: 24, height: 24 });
assert.equal(pickupBox.width > collectible.width, true, 'collectible pickup should be larger than visible item');

const landingBox = getPlatformLandingHitbox(platform);
assert.equal(landingBox.x < platform.x, true, 'landing zone should allow a small ledge margin');
assert.equal(
  isLandingOnPlatform({ ...player, y: 204, vy: 260 }, previousPlayer, platform),
  true,
  'falling player should land when feet visibly touch the platform top'
);

assert.equal(getHazardHitbox(hazard).width < hazard.width, true, 'hazard damage zone should be slightly inset');

const contact = resolveEnemyContact({ ...player, y: 194, vy: 360 }, previousPlayer, enemy);
assert.equal(contact.type, 'stomp', 'falling onto enemy top should resolve as stomp, not damage');
