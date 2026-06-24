import assert from 'node:assert/strict';
import test from 'node:test';

import { drawChinaRiverValleyBackgroundFrame } from './useJourneyRenderer.js';

const createMockContext = () => {
  const calls = [];
  const gradient = {
    addColorStop: (...args) => calls.push(['addColorStop', ...args]),
  };
  return {
    calls,
    save: () => calls.push(['save']),
    restore: () => calls.push(['restore']),
    createLinearGradient: (...args) => {
      calls.push(['createLinearGradient', ...args]);
      return gradient;
    },
    fillRect: (...args) => calls.push(['fillRect', ...args]),
    set fillStyle(value) {
      calls.push(['fillStyle', value]);
    },
  };
};

test('China background owns the frame while PNG pack is still loading', () => {
  const ctx = createMockContext();
  let layerDraws = 0;

  const drawn = drawChinaRiverValleyBackgroundFrame(ctx, 0, {
    CANVAS_HEIGHT: 720,
    CANVAS_WIDTH: 1280,
    ENVIRONMENT_ASSET_PACK_IDS: { CHINA_RIVER_VALLEY: 'china-river-valley' },
    backgroundPackId: 'china-river-valley',
    desertBackgroundAssetsRef: { current: { packs: {} } },
    drawDesertBackgroundLayer: () => {
      layerDraws += 1;
      return true;
    },
    environmentPackId: null,
    getSectionBackgroundAssets: () => null,
  });

  assert.equal(drawn, true);
  assert.equal(layerDraws, 0);
  assert.ok(ctx.calls.some(call => call[0] === 'fillRect' && call[1] === 0 && call[2] === 0 && call[3] === 1280 && call[4] === 720));
});
