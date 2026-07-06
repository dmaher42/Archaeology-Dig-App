import assert from 'node:assert/strict';
import test from 'node:test';

import { drawContactShadow } from './journeyRenderPrimitives.js';

const createRecordingContext = () => {
  const calls = [];
  const gradients = [];
  const state = {
    globalAlpha: 1,
    filter: 'none',
    fillStyle: null,
  };

  return {
    calls,
    gradients,
    save: () => calls.push({ type: 'save' }),
    restore: () => calls.push({ type: 'restore' }),
    beginPath: () => calls.push({ type: 'beginPath' }),
    ellipse: (...args) => calls.push({ type: 'ellipse', args }),
    fill: () => calls.push({ type: 'fill', fillStyle: state.fillStyle, globalAlpha: state.globalAlpha }),
    createRadialGradient: (...args) => {
      const gradient = {
        args,
        stops: [],
        addColorStop: (offset, color) => gradient.stops.push({ offset, color }),
      };
      gradients.push(gradient);
      calls.push({ type: 'createRadialGradient', args, gradient });
      return gradient;
    },
    set globalAlpha(value) {
      state.globalAlpha = value;
      calls.push({ type: 'globalAlpha', value });
    },
    get globalAlpha() {
      return state.globalAlpha;
    },
    set filter(value) {
      state.filter = value;
      calls.push({ type: 'filter', value });
    },
    get filter() {
      return state.filter;
    },
    set fillStyle(value) {
      state.fillStyle = value;
      calls.push({ type: 'fillStyle', value });
    },
    get fillStyle() {
      return state.fillStyle;
    },
  };
};

test('contact shadows feather into the sand instead of drawing a solid artificial oval', () => {
  const ctx = createRecordingContext();

  drawContactShadow(ctx, 120, 560, 96, 0.28, 1, { coreOffsetX: 4 });

  assert.equal(ctx.gradients.length, 1, 'contact shadow should use one soft radial falloff');
  assert.deepEqual(ctx.gradients[0].args.slice(0, 2), [124, 560], 'shadow core should keep the directional contact offset');
  assert.ok(ctx.gradients[0].stops.length >= 3, 'shadow should have core, mid, and transparent edge stops');
  assert.match(
    ctx.gradients[0].stops.at(-1).color,
    /rgba\([^)]*,\s*0(?:\.0+)?\)/,
    'outer shadow edge should fade to transparent instead of ending as a hard dark oval',
  );
  assert.equal(ctx.calls.filter((call) => call.type === 'fill').length, 1, 'contact shadow should avoid stacking multiple hard ellipses');
});
