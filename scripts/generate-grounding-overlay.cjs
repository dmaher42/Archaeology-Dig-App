/**
 * generate-grounding-overlay.js
 * Generates desert-entry-grounding-overlay.png — a transparent overlay that
 * grounds the floating ruins in the desert-entry-photoreal-sphinx-backdrop.webp.
 *
 * Technique:
 *   1. Contact shadow ellipses (dark) directly beneath each ruin cluster
 *   2. Sand burial mounds (warm tan) feathering up from the ground into the base
 *   3. A full-width dust haze band at the ground horizon line
 *   4. Foreground sand merge strip at the very bottom
 *
 * Image dimensions: 1672 × 941
 * Run: node scripts/generate-grounding-overlay.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 1672;
const H = 941;

// Approximate y-level where the stone bases should meet the sand in the backdrop
// (identified by inspecting the photoreal image)
const HORIZON_Y = 660; // top of the ground sand plane
const GROUND_Y  = 720; // main character-level ground line

// ─── helpers ────────────────────────────────────────────────────────────────

function radialGrad(ctx, cx, cy, r, stops) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  stops.forEach(([t, color]) => g.addColorStop(t, color));
  return g;
}

function ellipseGrad(ctx, cx, cy, rx, ry, stops) {
  // Draw a radial gradient scaled into an ellipse via transform
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  const g = radialGrad(ctx, 0, 0, 1, stops);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

function contactShadow(ctx, cx, cy, rx, ry, alpha) {
  ellipseGrad(ctx, cx, cy, rx, ry, [
    [0,   `rgba(20, 10, 3, ${alpha})`],
    [0.45, `rgba(20, 10, 3, ${alpha * 0.55})`],
    [0.75, `rgba(20, 10, 3, ${alpha * 0.18})`],
    [1,    'rgba(20, 10, 3, 0)'],
  ]);
}

function sandMound(ctx, cx, groundY, rx, ry, alpha, r=0, g=0, b=0) {
  // Warm tan mound: bottom-anchored, feathers upward
  const topY = groundY - ry;
  ellipseGrad(ctx, cx, groundY, rx, ry, [
    [0,    `rgba(${r}, ${g}, ${b}, ${alpha})`],
    [0.5,  `rgba(${r}, ${g}, ${b}, ${alpha * 0.55})`],
    [0.82, `rgba(${r}, ${g}, ${b}, ${alpha * 0.18})`],
    [1,    `rgba(${r}, ${g}, ${b}, 0)`],
  ]);
}

function dustStrip(ctx, y, height, alpha) {
  const g = ctx.createLinearGradient(0, y - height * 0.5, 0, y + height);
  g.addColorStop(0,    'rgba(210, 168, 100, 0)');
  g.addColorStop(0.35, `rgba(210, 168, 100, ${alpha * 0.4})`);
  g.addColorStop(0.6,  `rgba(195, 155, 88, ${alpha})`);
  g.addColorStop(0.85, `rgba(185, 145, 75, ${alpha * 0.7})`);
  g.addColorStop(1,    'rgba(175, 135, 65, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, y - height * 0.5, W, height * 1.5);
}

// ─── ruin clusters ───────────────────────────────────────────────────────────
// Each entry: { label, cx, baseY, shadowRx, shadowRy, moundRx, moundRy, shadowAlpha, moundAlpha }
// cx / baseY are the centre-x and the stone-base contact y in the 1672×941 image.

const RUINS = [
  // Far-left broken stone pillar / wall fragment
  {
    label: 'far-left pillar',
    cx: 52, baseY: 790,
    shadowRx: 100, shadowRy: 10, shadowAlpha: 0.50,
    moundRx: 110, moundRy: 42, moundAlpha: 0.65,
  },
  // Left cluster — distant short columns
  {
    label: 'left-mid columns',
    cx: 430, baseY: 672,
    shadowRx: 140, shadowRy: 9, shadowAlpha: 0.36,
    moundRx: 155, moundRy: 32, moundAlpha: 0.50,
  },
  // Centre-left temple wall cluster (the wide low wall row)
  {
    label: 'centre-left wall row',
    cx: 740, baseY: 710,
    shadowRx: 220, shadowRy: 11, shadowAlpha: 0.44,
    moundRx: 240, moundRy: 50, moundAlpha: 0.62,
  },
  // Central columns (the tallest freestanding cluster)
  {
    label: 'central columns',
    cx: 945, baseY: 702,
    shadowRx: 185, shadowRy: 12, shadowAlpha: 0.50,
    moundRx: 200, moundRy: 55, moundAlpha: 0.68,
  },
  // Sphinx base (large — needs wide, softer grounding)
  {
    label: 'sphinx base',
    cx: 1110, baseY: 752,
    shadowRx: 310, shadowRy: 16, shadowAlpha: 0.28,
    moundRx: 340, moundRy: 65, moundAlpha: 0.46,
  },
  // Right-side broken arch / columns
  {
    label: 'right arch columns',
    cx: 1390, baseY: 714,
    shadowRx: 185, shadowRy: 11, shadowAlpha: 0.44,
    moundRx: 200, moundRy: 48, moundAlpha: 0.60,
  },
  // Far-right column pair
  {
    label: 'far-right columns',
    cx: 1622, baseY: 722,
    shadowRx: 115, shadowRy: 10, shadowAlpha: 0.44,
    moundRx: 125, moundRy: 44, moundAlpha: 0.58,
  },
];

// ─── generate ────────────────────────────────────────────────────────────────

const canvas = createCanvas(W, H);
const ctx    = canvas.getContext('2d');

// Start fully transparent
ctx.clearRect(0, 0, W, H);

// 1. Full-width horizon dust haze (ties the backdrop ground plane to the game floor)
dustStrip(ctx, HORIZON_Y, 100, 0.38);

// 2. Per-cluster contact shadows + sand mounds
for (const r of RUINS) {
  console.log(`  painting: ${r.label}`);

  // Shadow sits just below the stone base
  contactShadow(ctx, r.cx, r.baseY + r.shadowRy * 0.35, r.shadowRx, r.shadowRy, r.shadowAlpha);

  // Sand mound rises from the ground up, overlapping the base
  sandMound(ctx, r.cx, r.baseY + r.moundRy * 0.1, r.moundRx, r.moundRy, r.moundAlpha,
    200, 162, 105); // warm desert sand colour
}

// 3. Foreground blend strip — merges the very bottom of the backdrop into the game ground colour
// (soft warm sand fill that fades in from the bottom)
{
  const g = ctx.createLinearGradient(0, H - 160, 0, H);
  g.addColorStop(0,    'rgba(195, 152, 90, 0)');
  g.addColorStop(0.55, 'rgba(195, 152, 90, 0.18)');
  g.addColorStop(1,    'rgba(190, 148, 85, 0.40)');
  ctx.fillStyle = g;
  ctx.fillRect(0, H - 160, W, 160);
}

// 4. Extra buried-base hints: dark fill at the very foot of the stone edges
// These narrow horizontal fills simulate soil/sediment staining at contact points
const BURIED_HINTS = [
  { cx: 52,   y: 792, w: 88,  h: 10, a: 0.30 },
  { cx: 430,  y: 674, w: 120, h: 8,  a: 0.24 },
  { cx: 740,  y: 712, w: 200, h: 10, a: 0.28 },
  { cx: 945,  y: 704, w: 170, h: 10, a: 0.30 },
  { cx: 1110, y: 754, w: 280, h: 12, a: 0.22 },
  { cx: 1390, y: 716, w: 170, h: 10, a: 0.28 },
  { cx: 1622, y: 724, w: 105, h: 9,  a: 0.27 },
];
for (const h of BURIED_HINTS) {
  const g = ctx.createLinearGradient(h.cx - h.w / 2, h.y, h.cx + h.w / 2, h.y + h.h);
  g.addColorStop(0,   `rgba(35, 18, 6, ${h.a})`);
  g.addColorStop(0.5, `rgba(40, 22, 8, ${h.a * 0.7})`);
  g.addColorStop(1,   'rgba(40, 22, 8, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(h.cx, h.y + h.h * 0.5, h.w / 2, h.h, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── write file ──────────────────────────────────────────────────────────────

const outPath = path.resolve(
  __dirname,
  '../public/assets/expedition/backgrounds/desert-entry/desert-entry-grounding-overlay.png'
);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buffer);
console.log(`\n✓ Overlay written: ${outPath}`);
console.log(`  Size: ${W} × ${H} px  (${(buffer.length / 1024).toFixed(1)} KB)`);
