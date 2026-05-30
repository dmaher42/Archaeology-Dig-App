/**
 * atlas-map.cjs
 * Renders the full foreground depth atlas at half-size with labelled boxes
 * showing where the three new ruin sprites sit.
 */
const { createCanvas, loadImage } = require('canvas');
const fs   = require('fs');
const path = require('path');

const DIR   = path.resolve(__dirname, '../public/assets/expedition/environment/egypt-foreground');
const ATLAS = path.join(DIR, 'egypt-foreground-depth-pack.png');
const OUT   = path.join(DIR, 'atlas-map-PREVIEW.jpg');

const SCALE = 0.28;  // display at 28% so it fits (2048 → ~574)

const NEW_REGIONS = [
  { key: 'ruinClusterWall',       x: 700,  y: 240, w: 380, h: 320, color: '#ff6b35' },
  { key: 'ruinClusterColumnPair', x: 1340, y: 418, w: 350, h: 440, color: '#4ec9b0' },
  { key: 'ruinDoorwayArch',       x: 1690, y: 418, w: 350, h: 440, color: '#c586c0' },
];

async function main() {
  const src    = await loadImage(ATLAS);
  const W      = Math.round(src.width  * SCALE);
  const H      = Math.round(src.height * SCALE);
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  // Draw atlas at half size
  ctx.drawImage(src, 0, 0, W, H);

  // Dark overlay so labels are readable
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(0, 0, W, H);

  // Draw labelled boxes for each new region
  ctx.lineWidth   = 2;
  ctx.font        = 'bold 11px sans-serif';
  ctx.textBaseline = 'top';
  for (const r of NEW_REGIONS) {
    const rx = Math.round(r.x * SCALE);
    const ry = Math.round(r.y * SCALE);
    const rw = Math.round(r.w * SCALE);
    const rh = Math.round(r.h * SCALE);

    // Coloured box
    ctx.strokeStyle = r.color;
    ctx.strokeRect(rx + 1, ry + 1, rw - 2, rh - 2);

    // Semi-transparent label background
    const labelW = ctx.measureText(r.key).width + 8;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(rx + 2, ry + 2, labelW, 16);

    // Label text
    ctx.fillStyle = r.color;
    ctx.fillText(r.key, rx + 6, ry + 4);

    // Corner coordinates
    ctx.font = '9px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`(${r.x},${r.y}) ${r.w}×${r.h}`, rx + 6, ry + 20);
    ctx.font = 'bold 11px sans-serif';
  }

  // Title
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, 22);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('egypt-foreground-depth-pack.png  (shown at 50%)  — new sprites highlighted', 8, 11);

  fs.writeFileSync(OUT, canvas.toBuffer('image/jpeg', { quality: 0.82 }));
  console.log(`✓ Atlas map: ${OUT}`);
}

main().catch(console.error);
