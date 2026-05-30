/**
 * add-ruin-sprites-to-atlas.cjs
 * Adds three new ruin prop sprites into the existing egypt-foreground-depth-pack.png
 * by painting into the free regions identified from the atlas JSON.
 *
 * New sprites (style matched to existing atlas art):
 *   ruinClusterWall       → x=700,  y=240, w=380, h=320
 *   ruinClusterColumnPair → x=1340, y=418, w=350, h=440
 *   ruinDoorwayArch       → x=1690, y=418, w=350, h=440
 *
 * Run: node scripts/add-ruin-sprites-to-atlas.cjs
 */

const { createCanvas, loadImage } = require('canvas');
const fs   = require('fs');
const path = require('path');

const ATLAS_DIR  = path.resolve(__dirname, '../public/assets/expedition/environment/egypt-foreground');
const ATLAS_PNG  = path.join(ATLAS_DIR, 'egypt-foreground-depth-pack.png');
const ATLAS_JSON = path.join(ATLAS_DIR, 'egypt-foreground-depth-pack.json');

// ─── colour palette (matches existing atlas art) ──────────────────────────────
const C = {
  stoneFace:   '#c8a86a',
  stoneMid:    '#b09050',
  stoneDark:   '#8a6c38',
  stoneShadow: '#5a3e1e',
  sandLight:   '#d4b87a',
  sandBase:    '#c0a060',
  shadowEllipse: 'rgba(40,24,8,',
};

// ─── shared helpers ───────────────────────────────────────────────────────────

function dropShadow(ctx, cx, y, rx, ry, alpha = 0.32) {
  ctx.save();
  ctx.translate(cx, y);
  ctx.scale(rx, ry);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0,    `${C.shadowEllipse}${alpha})`);
  g.addColorStop(0.55, `${C.shadowEllipse}${alpha * 0.45})`);
  g.addColorStop(1,    `${C.shadowEllipse}0)`);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

function sandBase(ctx, cx, groundY, w, h) {
  ctx.save();
  ctx.translate(cx, groundY);
  ctx.scale(w, h);
  const g = ctx.createRadialGradient(0, -0.15, 0, 0, -0.15, 1);
  g.addColorStop(0,    'rgba(212,184,122,0.88)');
  g.addColorStop(0.55, 'rgba(200,168,100,0.55)');
  g.addColorStop(1,    'rgba(192,160,90,0)');
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

function stoneBlock(ctx, x, y, w, h) {
  // Face
  const fg = ctx.createLinearGradient(x, y, x + w, y + h);
  fg.addColorStop(0,    '#d0aa6c');
  fg.addColorStop(0.35, '#c49858');
  fg.addColorStop(0.72, '#a87c40');
  fg.addColorStop(1,    '#7a5428');
  ctx.fillStyle = fg;
  ctx.fillRect(x, y, w, h);
  // Sun highlight on top edge
  ctx.fillStyle = 'rgba(255,220,140,0.28)';
  ctx.fillRect(x, y, w, 3);
  // Right shadow
  ctx.fillStyle = 'rgba(40,20,5,0.25)';
  ctx.fillRect(x + w - 4, y, 4, h);
  // Mortar
  ctx.fillStyle = 'rgba(50,28,8,0.18)';
  ctx.fillRect(x, y + h - 2, w, 2);
}

function column(ctx, cx, groundY, w, h) {
  const x   = cx - w / 2;
  const top = groundY - h;

  // Shaft — barrel shape
  const sg = ctx.createLinearGradient(x, top, x + w, top + h);
  sg.addColorStop(0,    '#d0a860');
  sg.addColorStop(0.2,  '#e2be84');
  sg.addColorStop(0.6,  '#b68c48');
  sg.addColorStop(1,    '#7a5228');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(x + 5, groundY - 16);
  ctx.bezierCurveTo(x, top + h * 0.55, x, top + h * 0.3, x + 4, top + 16);
  ctx.lineTo(x + w - 4, top + 16);
  ctx.bezierCurveTo(x + w, top + h * 0.3, x + w, top + h * 0.55, x + w - 5, groundY - 16);
  ctx.closePath();
  ctx.fill();

  // Drum lines
  ctx.strokeStyle = 'rgba(60,35,10,0.18)';
  ctx.lineWidth = 1;
  const drumCount = Math.floor((h - 32) / 22);
  for (let i = 1; i <= drumCount; i++) {
    const dy = top + 16 + i * 22;
    ctx.beginPath();
    ctx.moveTo(x + 3, dy);
    ctx.lineTo(x + w - 3, dy);
    ctx.stroke();
  }

  // Capital
  const capH = w * 0.52;
  const cg = ctx.createLinearGradient(x - 5, top, x + w + 5, top + capH);
  cg.addColorStop(0, '#dfc080');
  cg.addColorStop(1, '#8c6030');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.12, top + 16);
  ctx.lineTo(x - 5, top + capH);
  ctx.lineTo(x + w + 5, top + capH);
  ctx.lineTo(x + w - w * 0.12, top + 16);
  ctx.closePath();
  ctx.fill();

  // Abacus
  ctx.fillStyle = '#c49050';
  ctx.fillRect(x - 7, top, w + 14, 13);
  ctx.fillStyle = 'rgba(255,222,140,0.32)';
  ctx.fillRect(x - 7, top, w + 14, 3);

  // Plinth
  ctx.fillStyle = '#c29050';
  ctx.fillRect(x - 6, groundY - 16, w + 12, 16);
  ctx.fillStyle = 'rgba(255,210,120,0.22)';
  ctx.fillRect(x - 6, groundY - 16, w + 12, 3);
}

function brokenColumnTop(ctx, cx, groundY, w, h) {
  column(ctx, cx, groundY, w, h);
  // Jagged fracture at top
  const top = groundY - h;
  ctx.fillStyle = '#5a3818';
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + 2, top + 13);
  ctx.lineTo(cx - w * 0.08, top + 4);
  ctx.lineTo(cx + w * 0.18, top + 9);
  ctx.lineTo(cx + w * 0.04, top + 2);
  ctx.lineTo(cx + w / 2 - 2, top + 7);
  ctx.lineTo(cx + w / 2 - 2, top + 13);
  ctx.closePath();
  ctx.fill();
}

function rubblePiece(ctx, x, y, w, h, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const rg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  rg.addColorStop(0, '#c8a058');
  rg.addColorStop(1, '#7a5028');
  ctx.fillStyle = rg;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = 'rgba(255,210,120,0.22)';
  ctx.fillRect(-w / 2, -h / 2, w, 2);
  ctx.restore();
}

function fallenDrum(ctx, cx, y, rx, ry, angle) {
  ctx.save();
  ctx.translate(cx, y);
  ctx.rotate(angle);
  const dg = ctx.createLinearGradient(-rx, 0, rx, 0);
  dg.addColorStop(0,    '#a07838');
  dg.addColorStop(0.35, '#d4aa60');
  dg.addColorStop(0.7,  '#b08840');
  dg.addColorStop(1,    '#6a4820');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(50,28,8,0.30)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function glyphLines(ctx, x, y, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.strokeStyle = '#3c2008';
  ctx.lineWidth = 1;
  [[x+6,y+10,x+6,y+34],[x+2,y+20,x+13,y+20],
   [x+16,y+12,x+16,y+38],[x+12,y+22,x+24,y+22],[x+12,y+32,x+24,y+32],
   [x+28,y+8, x+28,y+28],[x+24,y+16,x+36,y+16]].forEach(([x1,y1,x2,y2])=>{
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  });
  ctx.restore();
}

// ─── SPRITE A: ruinClusterWall  (380 × 320) at atlas (700, 240) ───────────────

function drawRuinClusterWall(ctx, ox, oy) {
  const W = 380, H = 320;
  const gY = oy + H - 30;   // internal ground line (bottom area of sprite)

  // Drop shadow
  dropShadow(ctx, ox + W / 2, gY, 160, 18, 0.30);
  // Sand base
  sandBase(ctx, ox + W / 2, gY, 165, 38);

  // Left wall section — 3 courses high, 5 blocks wide
  const bW = 36, bH = 22;
  const wallX = ox + 28, wallRows = 3;
  for (let row = 0; row < wallRows; row++) {
    const offset = (row % 2) * (bW / 2);
    for (let col = 0; col < 5; col++) {
      const bx = wallX + col * bW + offset;
      const by = gY - (row + 1) * bH;
      if (bx + bW > ox + W - 50) break;
      stoneBlock(ctx, bx, by, bW - 1, bH - 1);
    }
  }
  // Ragged top row (partial, uneven)
  [0, 1, 3].forEach(col => {
    const bx = wallX + col * bW + bW / 2;
    const by = gY - (wallRows + 1) * bH;
    stoneBlock(ctx, bx, by, bW - 1, bH - 1);
  });

  // Glyph detail on left section
  glyphLines(ctx, wallX + 10, gY - wallRows * bH - 4, 50, wallRows * bH);

  // Gap (doorway-like break) then right stump
  const rStumpX = ox + 255;
  for (let row = 0; row < 2; row++) {
    const by = gY - (row + 1) * bH;
    stoneBlock(ctx, rStumpX, by, bW * 2 - 1, bH - 1);
  }
  stoneBlock(ctx, rStumpX + bW * 0.25, gY - 3 * bH, bW * 1.4, bH - 1);

  // Rubble pieces in the gap
  rubblePiece(ctx, ox + 210, gY - 10, 22, 9,  0.15);
  rubblePiece(ctx, ox + 230, gY - 5,  14, 7, -0.2);
  rubblePiece(ctx, ox + 248, gY - 12, 18, 8,  0.3);

  // Fallen stone slab (lintel) across gap, on ground
  ctx.save();
  ctx.translate(ox + 200, gY - 14);
  ctx.rotate(-0.06);
  const lg = ctx.createLinearGradient(0, 0, 70, 16);
  lg.addColorStop(0, '#c8a050'); lg.addColorStop(1, '#7a4e20');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, 68, 15);
  ctx.fillStyle = 'rgba(255,210,120,0.20)';
  ctx.fillRect(0, 0, 68, 3);
  ctx.restore();

  // Small rubble at base edges
  rubblePiece(ctx, ox + 50,  gY - 8,  18, 7,  0.2);
  rubblePiece(ctx, ox + 335, gY - 9,  16, 6, -0.1);
}

// ─── SPRITE B: ruinClusterColumnPair  (350 × 440) at atlas (1340, 418) ────────

function drawRuinClusterColumnPair(ctx, ox, oy) {
  const W = 350, H = 440;
  const gY = oy + H - 30;

  // Drop shadow
  dropShadow(ctx, ox + W / 2, gY, 148, 20, 0.32);
  sandBase(ctx, ox + W / 2, gY, 152, 44);

  // Left column — tall, intact
  column(ctx, ox + 80, gY, 38, 320);

  // Right column — broken
  brokenColumnTop(ctx, ox + 248, gY, 34, 255);

  // Low wall section between them
  const bH = 22;
  for (let row = 0; row < 2; row++) {
    const by = gY - (row + 1) * bH;
    const offset = (row % 2) * 18;
    stoneBlock(ctx, ox + 122 + offset, by, 100 - offset, bH - 1);
  }

  // Fallen drum from broken column
  fallenDrum(ctx, ox + 295, gY - 12, 30, 11, 0.25);

  // Rubble at bases
  rubblePiece(ctx, ox + 58,  gY - 10, 20, 8,  0.2);
  rubblePiece(ctx, ox + 280, gY - 8,  24, 8, -0.15);
  rubblePiece(ctx, ox + 140, gY - 7,  16, 6,  0.1);

  // Glyph on left column shaft
  glyphLines(ctx, ox + 60, gY - 200, 50, 80);
}

// ─── SPRITE C: ruinDoorwayArch  (350 × 440) at atlas (1690, 418) ─────────────

function drawRuinDoorwayArch(ctx, ox, oy) {
  const W = 350, H = 440;
  const gY = oy + H - 30;

  // Drop shadow
  dropShadow(ctx, ox + W / 2, gY, 148, 20, 0.30);
  sandBase(ctx, ox + W / 2, gY, 152, 44);

  const bW = 34, bH = 22;

  // Left pier — 5 blocks wide, 6 courses
  for (let row = 0; row < 6; row++) {
    const offset = (row % 2) * (bW / 2);
    for (let col = 0; col < 4; col++) {
      stoneBlock(ctx, ox + 18 + col * bW + offset, gY - (row + 1) * bH, bW - 1, bH - 1);
    }
  }

  // Right pier — slightly shorter (damaged top)
  for (let row = 0; row < 5; row++) {
    const offset = (row % 2) * (bW / 2);
    for (let col = 0; col < 4; col++) {
      stoneBlock(ctx, ox + 192 + col * bW + offset, gY - (row + 1) * bH, bW - 1, bH - 1);
    }
  }
  // Jagged damage on right pier top
  [0, 2].forEach(col => {
    stoneBlock(ctx, ox + 192 + col * bW + bW / 2, gY - 6 * bH, bW - 1, bH - 1);
  });

  // Lintel across the top of the doorway
  const lintelY = gY - 6 * bH - 18;
  const lintelG = ctx.createLinearGradient(ox + 18, lintelY, ox + 190, lintelY + 18);
  lintelG.addColorStop(0, '#d0aa60'); lintelG.addColorStop(1, '#7a4e20');
  ctx.fillStyle = lintelG;
  ctx.fillRect(ox + 18, lintelY, 172, 18);
  ctx.fillStyle = 'rgba(255,220,130,0.28)';
  ctx.fillRect(ox + 18, lintelY, 172, 3);

  // Dark doorway void
  ctx.fillStyle = 'rgba(20,10,4,0.72)';
  ctx.fillRect(ox + 20, gY - 6 * bH, 168, 6 * bH);
  // Subtle interior gradient (depth)
  const vg = ctx.createLinearGradient(ox + 20, 0, ox + 192, 0);
  vg.addColorStop(0,    'rgba(0,0,0,0.35)');
  vg.addColorStop(0.12, 'rgba(0,0,0,0)');
  vg.addColorStop(0.88, 'rgba(0,0,0,0)');
  vg.addColorStop(1,    'rgba(0,0,0,0.35)');
  ctx.fillStyle = vg;
  ctx.fillRect(ox + 20, gY - 6 * bH, 168, 6 * bH);

  // Glyph panel on left pier
  glyphLines(ctx, ox + 26, gY - 5 * bH + 10, 80, 5 * bH - 20);

  // Rubble at base
  rubblePiece(ctx, ox + 18,  gY - 10, 22, 8,  0.18);
  rubblePiece(ctx, ox + 316, gY - 9,  18, 7, -0.12);
  rubblePiece(ctx, ox + 100, gY - 7,  20, 7,  0.22);
  rubblePiece(ctx, ox + 240, gY - 8,  16, 6, -0.18);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const existing = await loadImage(ATLAS_PNG);
  const canvas = createCanvas(existing.width, existing.height);
  const ctx = canvas.getContext('2d');

  // Copy existing atlas
  ctx.drawImage(existing, 0, 0);

  // Paint new sprites into free regions
  console.log('  Painting ruinClusterWall        at (700, 240)');
  drawRuinClusterWall(ctx, 700, 240);

  console.log('  Painting ruinClusterColumnPair  at (1340, 418)');
  drawRuinClusterColumnPair(ctx, 1340, 418);

  console.log('  Painting ruinDoorwayArch        at (1690, 418)');
  drawRuinDoorwayArch(ctx, 1690, 418);

  // Write updated atlas
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(ATLAS_PNG, buf);
  console.log(`\n✓ Atlas updated: ${ATLAS_PNG}  (${(buf.length / 1024).toFixed(0)} KB)`);

  // Update JSON — add new regions
  const json = JSON.parse(fs.readFileSync(ATLAS_JSON, 'utf8'));
  json.regions.ruinClusterWall = {
    x: 700, y: 240, w: 380, h: 320,
    anchorY: 'bottom', groundContactRatio: 0.91,
  };
  json.regions.ruinClusterColumnPair = {
    x: 1340, y: 418, w: 350, h: 440,
    anchorY: 'bottom', groundContactRatio: 0.93,
  };
  json.regions.ruinDoorwayArch = {
    x: 1690, y: 418, w: 350, h: 440,
    anchorY: 'bottom', groundContactRatio: 0.93,
  };
  fs.writeFileSync(ATLAS_JSON, JSON.stringify(json, null, 2));
  console.log(`✓ JSON updated:  ${ATLAS_JSON}`);

  // Preview: composite new regions at 1:1 for inspection
  const previewW = 380 + 350 + 350 + 40;
  const previewH = 460;
  const preview = createCanvas(previewW, previewH);
  const pCtx = preview.getContext('2d');
  pCtx.fillStyle = '#e8d8b8';
  pCtx.fillRect(0, 0, previewW, previewH);
  // Draw each new sprite from the atlas at actual size
  pCtx.drawImage(canvas, 700, 240, 380, 320,   10, 70,  380, 320);
  pCtx.drawImage(canvas, 1340, 418, 350, 440,  400, 10,  350, 440);
  pCtx.drawImage(canvas, 1690, 418, 350, 440,  760, 10,  350, 440);
  // Labels
  pCtx.fillStyle = '#333';
  pCtx.font = 'bold 11px sans-serif';
  pCtx.fillText('ruinClusterWall', 10, 62);
  pCtx.fillText('ruinClusterColumnPair', 400, 6);
  pCtx.fillText('ruinDoorwayArch', 760, 6);

  const previewPath = path.resolve(__dirname, '../public/assets/expedition/environment/egypt-foreground/new-sprites-PREVIEW.png');
  fs.writeFileSync(previewPath, preview.toBuffer('image/png'));
  console.log(`✓ Preview:       ${previewPath}`);
}

main().catch(console.error);
