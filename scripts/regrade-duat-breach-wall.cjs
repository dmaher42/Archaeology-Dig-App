/**
 * regrade-duat-breach-wall.cjs
 * One-time asset fix for duat-breach-wall-2026-06-30.png (the ruined scarab
 * gateway at Desert Entry spawn). The source render is dark cocoa brown, which
 * reads as a pasted-in silhouette against the pale golden necropolis. The prop
 * paint pipeline multiplies (can only darken), so the lift has to be baked in:
 * brightness up, slight desaturate, and a warm gold bias — while leaving the
 * teal breach glow readable. The untouched original is copied to
 * scratch/asset-backups/ first.
 */
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const FILE = path.resolve(
  __dirname,
  '../public/assets/expedition/environment/egypt-atmosphere/props/desert-entry/duat-breach-wall-2026-06-30.png',
);
const BACKUP_DIR = path.resolve(__dirname, '../scratch/asset-backups');
const BRIGHTEN = 1.34;
const DESATURATE = 0.10;
const RED_BIAS = 1.04;   // warm gold push
const BLUE_BIAS = 0.94;

async function main() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const backupPath = path.join(BACKUP_DIR, path.basename(FILE));
  if (!fs.existsSync(backupPath)) fs.copyFileSync(FILE, backupPath);

  const img = await loadImage(fs.existsSync(backupPath) ? backupPath : FILE);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, img.width, img.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 0) continue;
    let r = px[i], g = px[i + 1], b = px[i + 2];
    // Teal glow guard: leave strongly blue-green pixels (the breach seams) alone.
    const isTeal = b > r * 1.15 && g > r * 1.05;
    if (isTeal) continue;
    const grey = 0.299 * r + 0.587 * g + 0.114 * b;
    r = (r + (grey - r) * DESATURATE) * BRIGHTEN * RED_BIAS;
    g = (g + (grey - g) * DESATURATE) * BRIGHTEN;
    b = (b + (grey - b) * DESATURATE) * BRIGHTEN * BLUE_BIAS;
    px[i] = Math.min(255, r);
    px[i + 1] = Math.min(255, g);
    px[i + 2] = Math.min(255, b);
  }
  ctx.putImageData(data, 0, 0);
  fs.writeFileSync(FILE, canvas.toBuffer('image/png'));
  console.log(`regraded: ${FILE}`);
  console.log(`backup:   ${backupPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
