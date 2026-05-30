/**
 * mockup-prop-ruins.cjs  (v2 — photorealistic stone rendering)
 * Mockup showing Option 3: backdrop ruins softened + new foreground ruin props
 * drawn with gradients and organic shapes, rooted at GROUND_Y = 595.
 *
 * Run: node scripts/mockup-prop-ruins.cjs
 */

const { createCanvas, loadImage } = require('canvas');
const fs   = require('fs');
const path = require('path');

const CW = 1120;
const CH = 630;
const GROUND_Y = 595;

const DIR = path.resolve(__dirname, '../public/assets/expedition/backgrounds/desert-entry');

// ─── stone colour helpers ─────────────────────────────────────────────────────

function stoneGrad(ctx, x, y, w, h, lightAngle = 'top-left') {
  const g = ctx.createLinearGradient(
    x, y,
    lightAngle === 'top-left' ? x + w * 0.7 : x,
    y + h
  );
  g.addColorStop(0,    '#d4aa6e');
  g.addColorStop(0.25, '#c49458');
  g.addColorStop(0.6,  '#a87840');
  g.addColorStop(1,    '#7a5228');
  return g;
}

function contactShadow(ctx, cx, groundY, rx, ry, alpha) {
  ctx.save();
  ctx.translate(cx, groundY);
  ctx.scale(rx, ry);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0,    `rgba(18,8,2,${alpha})`);
  g.addColorStop(0.45, `rgba(18,8,2,${alpha * 0.5})`);
  g.addColorStop(0.8,  `rgba(18,8,2,${alpha * 0.1})`);
  g.addColorStop(1,    'rgba(18,8,2,0)');
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

function sandDrift(ctx, cx, groundY, w, h, alpha) {
  ctx.save();
  ctx.translate(cx, groundY);
  ctx.scale(w, h);
  const g = ctx.createRadialGradient(0, -0.1, 0, 0, -0.1, 1);
  g.addColorStop(0,    `rgba(210,172,100,${alpha})`);
  g.addColorStop(0.5,  `rgba(210,172,100,${alpha * 0.5})`);
  g.addColorStop(0.85, `rgba(210,172,100,${alpha * 0.1})`);
  g.addColorStop(1,    'rgba(210,172,100,0)');
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

// ─── column ───────────────────────────────────────────────────────────────────
// Draws a single Egyptian column (capital + shaft + base) rooted at groundY.

function drawColumn(ctx, cx, groundY, w, h) {
  const x = cx - w / 2;
  const top = groundY - h;

  // Shaft gradient
  const sg = ctx.createLinearGradient(x, top, x + w, top);
  sg.addColorStop(0,    '#c8a05a');
  sg.addColorStop(0.18, '#e0be82');
  sg.addColorStop(0.55, '#b88c48');
  sg.addColorStop(0.82, '#9a7030');
  sg.addColorStop(1,    '#7a5228');
  ctx.fillStyle = sg;

  // Slight barrel shape with bezier
  ctx.beginPath();
  ctx.moveTo(x + 4, groundY - 18);
  ctx.bezierCurveTo(x - 1, top + h * 0.5, x - 1, top + h * 0.3, x + 3, top + 18);
  ctx.lineTo(x + w - 3, top + 18);
  ctx.bezierCurveTo(x + w + 1, top + h * 0.3, x + w + 1, top + h * 0.5, x + w - 4, groundY - 18);
  ctx.closePath();
  ctx.fill();

  // Horizontal drum lines
  ctx.save();
  ctx.strokeStyle = 'rgba(60,35,10,0.20)';
  ctx.lineWidth = 1;
  const drums = Math.floor((h - 36) / 22);
  for (let i = 1; i <= drums; i++) {
    const dy = top + 18 + i * 22;
    ctx.beginPath();
    ctx.moveTo(x + 2, dy); ctx.lineTo(x + w - 2, dy);
    ctx.stroke();
  }
  ctx.restore();

  // Capital (top)
  const capH = Math.max(14, w * 0.55);
  const cg = ctx.createLinearGradient(x - 5, top, x - 5 + w + 10, top + capH);
  cg.addColorStop(0,   '#dfc080');
  cg.addColorStop(0.5, '#c4a050');
  cg.addColorStop(1,   '#8c6430');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.1, top + 18);
  ctx.lineTo(x - 5, top + capH);
  ctx.lineTo(x + w + 5, top + capH);
  ctx.lineTo(x + w - w * 0.1, top + 18);
  ctx.closePath();
  ctx.fill();
  // Abacus slab on top
  ctx.fillStyle = '#c49050';
  ctx.fillRect(x - 7, top, w + 14, 14);
  ctx.fillStyle = 'rgba(255,220,140,0.35)';
  ctx.fillRect(x - 7, top, w + 14, 3);  // highlight

  // Base plinth
  const pg = ctx.createLinearGradient(x - 5, groundY - 18, x + w + 5, groundY);
  pg.addColorStop(0,   '#c8a050');
  pg.addColorStop(1,   '#7a5020');
  ctx.fillStyle = pg;
  ctx.fillRect(x - 6, groundY - 18, w + 12, 18);
  ctx.fillStyle = 'rgba(255,210,120,0.25)';
  ctx.fillRect(x - 6, groundY - 18, w + 12, 3);

  // Subtle vertical crack on shaft
  ctx.save();
  ctx.strokeStyle = 'rgba(50,28,8,0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.15, top + 20);
  ctx.lineTo(cx + w * 0.18, top + h * 0.4);
  ctx.lineTo(cx + w * 0.14, top + h * 0.7);
  ctx.stroke();
  ctx.restore();
}

// ─── broken column ────────────────────────────────────────────────────────────

function drawBrokenColumn(ctx, cx, groundY, w, fullH, breakRatio = 0.6) {
  const standH = fullH * breakRatio;
  drawColumn(ctx, cx, groundY, w, standH);

  // Jagged break at top — dark fracture edge
  const top = groundY - standH;
  ctx.save();
  ctx.fillStyle = '#5a3818';
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + 2, top + 14);
  ctx.lineTo(cx - w * 0.1, top + 5);
  ctx.lineTo(cx + w * 0.2, top + 10);
  ctx.lineTo(cx + w * 0.05, top + 2);
  ctx.lineTo(cx + w / 2 - 2, top + 8);
  ctx.lineTo(cx + w / 2 - 2, top + 14);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Fallen drum on ground beside it
  const drumRx = w * 0.65;
  const drumRy = w * 0.28;
  const drumX  = cx + w * 1.1;
  const drumY  = groundY - drumRy * 0.5;
  ctx.save();
  ctx.translate(drumX, drumY);
  ctx.rotate(0.22);
  const dg = ctx.createLinearGradient(-drumRx, 0, drumRx, 0);
  dg.addColorStop(0,    '#a07838');
  dg.addColorStop(0.35, '#d4aa60');
  dg.addColorStop(0.7,  '#b08840');
  dg.addColorStop(1,    '#6a4820');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.ellipse(0, 0, drumRx, drumRy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(50,28,8,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// ─── ruined wall ──────────────────────────────────────────────────────────────

function drawRuinedWall(ctx, cx, groundY, totalW, maxH, seed = 0) {
  const blockH = 24;
  const blockW = 38;

  // Build a ragged top profile
  const cols = Math.ceil(totalW / blockW);
  const heights = Array.from({ length: cols }, (_, i) => {
    const n = Math.sin(i * 2.3 + seed) * 0.5 + 0.5;
    return Math.floor(maxH * (0.45 + n * 0.55) / blockH) * blockH;
  });
  const maxRows = Math.ceil(maxH / blockH);

  ctx.save();
  const x0 = cx - totalW / 2;
  for (let col = 0; col < cols; col++) {
    const colH  = heights[col];
    const colX  = x0 + col * blockW;
    const rows  = Math.ceil(colH / blockH);
    const offsetX = (col % 2) * (blockW * 0.5);

    for (let row = 0; row < rows; row++) {
      const by = groundY - (row + 1) * blockH;
      const bx = colX - (col % 2 === 0 ? 0 : blockW * 0.5);
      if (bx + blockW < x0 || bx > x0 + totalW) continue;
      const bw = Math.min(blockW - 2, (x0 + totalW) - bx, bx + blockW - x0) - 1;
      if (bw < 6) continue;

      // Block face gradient — sun from top-left
      const bg = ctx.createLinearGradient(bx, by, bx + bw, by + blockH);
      bg.addColorStop(0,    '#d4aa68');
      bg.addColorStop(0.3,  '#c09050');
      bg.addColorStop(0.7,  '#a07838');
      bg.addColorStop(1,    '#7a5428');
      ctx.fillStyle = bg;
      ctx.fillRect(bx, by, bw, blockH - 2);

      // Top-face highlight (top of block catches sun)
      if (row === rows - 1) {
        ctx.fillStyle = 'rgba(255,218,130,0.30)';
        ctx.fillRect(bx, by, bw, 4);
      }
      // Mortar lines
      ctx.fillStyle = 'rgba(50,28,8,0.20)';
      ctx.fillRect(bx, by + blockH - 3, bw, 2);
      ctx.fillRect(bx + bw, by, 2, blockH - 2);
    }
  }
  ctx.restore();

  // Hieroglyph hint — thin incised lines on the tallest section
  const tallCol = heights.indexOf(Math.max(...heights));
  const hx = x0 + tallCol * blockW + 4;
  const hh = heights[tallCol];
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = '#3c2008';
  ctx.lineWidth = 1;
  [[hx+6, groundY-hh+12, hx+6, groundY-hh+36],
   [hx+2, groundY-hh+22, hx+12, groundY-hh+22],
   [hx+16, groundY-hh+14, hx+16, groundY-hh+40],
   [hx+12, groundY-hh+24, hx+22, groundY-hh+24],
   [hx+12, groundY-hh+32, hx+22, groundY-hh+32],
  ].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  });
  ctx.restore();
}

// ─── rubble scatter ───────────────────────────────────────────────────────────

function drawRubble(ctx, cx, groundY, spread, count, seed = 0) {
  for (let i = 0; i < count; i++) {
    const t  = (i / count) * Math.PI * 2 + seed;
    const rx = Math.cos(t * 1.7 + seed) * spread * (0.4 + (i % 3) * 0.2);
    const ry = Math.abs(Math.sin(t * 2.1)) * -6;
    const rw = 8 + (i % 5) * 5;
    const rh = 4 + (i % 3) * 3;
    const rg = ctx.createLinearGradient(cx + rx, groundY + ry, cx + rx + rw, groundY + ry + rh);
    rg.addColorStop(0, '#c49050');
    rg.addColorStop(1, '#7a4e20');
    ctx.fillStyle = rg;
    ctx.save();
    ctx.translate(cx + rx, groundY + ry);
    ctx.rotate(t * 0.6);
    ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
    ctx.restore();
  }
}

// ─── complete ruin clusters ───────────────────────────────────────────────────

function drawCluster(ctx, cx, groundY, scale, variant) {
  ctx.save();
  ctx.translate(cx, 0);
  ctx.scale(scale, scale);
  const gY = groundY / scale;

  if (variant === 0) {
    // Two columns + low ruined wall between them
    drawBrokenColumn(ctx, -62, gY, 30, 240, 0.68);
    drawRuinedWall(ctx,   -5, gY, 80, 90, 1);
    drawColumn(ctx,        50, gY, 26, 200);
    drawRubble(ctx,        -8, gY, 55, 7, 0.8);
  } else if (variant === 1) {
    // Single tall column + broken stump
    drawColumn(ctx,        0, gY, 34, 290);
    drawBrokenColumn(ctx,  55, gY, 24, 170, 0.52);
    drawRubble(ctx,        20, gY, 45, 5, 1.5);
  } else if (variant === 2) {
    // Wide wall section with a doorway gap and lintel
    drawRuinedWall(ctx,  -80, gY, 75, 145, 2);
    // Lintel across the gap
    const lg = ctx.createLinearGradient(-35, gY - 95, 35, gY - 80);
    lg.addColorStop(0, '#c8a050'); lg.addColorStop(1, '#7a4e20');
    ctx.fillStyle = lg;
    ctx.fillRect(-32, gY - 95, 64, 20);
    ctx.fillStyle = 'rgba(255,210,120,0.25)';
    ctx.fillRect(-32, gY - 95, 64, 3);
    drawRuinedWall(ctx,   38, gY, 60, 118, 3);
    drawBrokenColumn(ctx, 90, gY, 22, 150, 0.78);
    drawRubble(ctx,        0, gY, 70, 9, 0.4);
  } else if (variant === 3) {
    // Short rubble cluster + two short stumps
    drawRuinedWall(ctx,   0, gY, 105, 65, 4);
    drawBrokenColumn(ctx, -56, gY, 22, 130, 0.55);
    drawBrokenColumn(ctx,  56, gY, 20, 115, 0.6);
    drawRubble(ctx,         0, gY, 55, 8, 2.2);
  }

  ctx.restore();
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const canvas = createCanvas(CW, CH);
  const ctx    = canvas.getContext('2d');

  // 1. Backdrop
  const backdrop = await loadImage(path.join(DIR, 'desert-entry-photoreal-sphinx-backdrop.png'));
  ctx.drawImage(backdrop, 0, 0, CW, CH);

  // 2. Haze to suppress the baked-in floating backdrop ruins
  {
    const haze = ctx.createLinearGradient(0, CH * 0.56, 0, CH * 0.86);
    haze.addColorStop(0,    'rgba(195,155,78,0)');
    haze.addColorStop(0.30, 'rgba(195,155,78,0.45)');
    haze.addColorStop(0.60, 'rgba(188,148,68,0.72)');
    haze.addColorStop(1,    'rgba(182,142,62,0.88)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, CH * 0.56, CW, CH * 0.44);
  }

  // 3. Foreground ground plane
  {
    const sand = ctx.createLinearGradient(0, GROUND_Y - 8, 0, CH);
    sand.addColorStop(0,   '#c8974a');
    sand.addColorStop(0.08, '#c49048');
    sand.addColorStop(0.5,  '#b88040');
    sand.addColorStop(1,    '#a86e30');
    ctx.fillStyle = sand;
    ctx.fillRect(0, GROUND_Y - 8, CW, CH - GROUND_Y + 8);
  }

  // 4. Subtle sand texture
  ctx.save();
  ctx.globalAlpha = 0.07;
  for (let y = GROUND_Y + 10; y < CH; y += 14) {
    ctx.fillStyle = y % 28 === 0 ? 'rgba(70,42,14,0.8)' : 'rgba(255,200,90,0.7)';
    ctx.fillRect(0, y, CW, 1);
  }
  ctx.restore();

  // 5. Cluster positions — smaller scale = further away (creates depth)
  const clusters = [
    { cx: 100,  scale: 0.68, variant: 1 },
    { cx: 345,  scale: 0.82, variant: 0 },
    { cx: 655,  scale: 1.00, variant: 2 },
    { cx: 890,  scale: 0.86, variant: 3 },
    { cx: 1050, scale: 0.68, variant: 1 },
  ];

  // Draw contact shadows + sand drifts first (under the props)
  for (const { cx, scale } of clusters) {
    contactShadow(ctx, cx, GROUND_Y + 5, 110 * scale, 14 * scale, 0.60);
    sandDrift(ctx, cx, GROUND_Y - 8, 125 * scale, 40 * scale, 0.78);
  }

  // Draw the clusters
  for (const { cx, scale, variant } of clusters) {
    drawCluster(ctx, cx, GROUND_Y, scale, variant);
  }

  // 6. Ground-line highlight
  {
    const line = ctx.createLinearGradient(0, 0, CW, 0);
    line.addColorStop(0,   'rgba(240,200,120,0)');
    line.addColorStop(0.08,'rgba(240,200,120,0.60)');
    line.addColorStop(0.92,'rgba(240,200,120,0.60)');
    line.addColorStop(1,   'rgba(240,200,120,0)');
    ctx.fillStyle = line;
    ctx.fillRect(0, GROUND_Y - 3, CW, 4);
  }

  // 7. Title bar
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.60)';
  ctx.fillRect(0, 0, CW, 44);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('MOCKUP — Option 3: Ground-Anchored Ruin Prop Sprites (GROUND_Y = 595)', 16, 28);
  ctx.restore();

  // ─── write ────────────────────────────────────────────────────────────────────
  const out = path.join(DIR, 'desert-entry-prop-ruins-MOCKUP.png');
  fs.writeFileSync(out, canvas.toBuffer('image/png'));
  console.log(`✓ Mockup written: ${out}`);
}

main().catch(console.error);
