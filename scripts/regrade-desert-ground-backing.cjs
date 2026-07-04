/**
 * regrade-desert-ground-backing.cjs
 * One-time asset fix for desert-entry-warm-detailed-ground-backing-2026-07-04.png:
 *  1. Feather the top edge to transparent so the plate stops cutting a hard
 *     horizontal band across the necropolis panorama (and the temple bases in it).
 *  2. Pull the vivid orange cracked-mud grade toward the pale golden sandstone
 *     of the panorama so the two layers read as one piece of ground.
 * The untouched original is copied to scratch/asset-backups/ first.
 */
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const FILE = path.resolve(
  __dirname,
  '../public/assets/expedition/backgrounds/desert-entry/desert-entry-warm-detailed-ground-backing-2026-07-04.png',
);
const BACKUP_DIR = path.resolve(__dirname, '../scratch/asset-backups');
const FEATHER_PX = 80;       // alpha ramp depth from the top edge
const DESATURATE = 0.30;     // 0..1 pull toward grey
const BRIGHTEN = 1.05;       // value lift
const RED_TAME = 0.94;       // pull the hot orange back toward sandstone
const BLUE_LIFT = 1.10;      // cracked mud is blue-starved vs the pale panorama stone

async function main() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const backupPath = path.join(BACKUP_DIR, path.basename(FILE));
  if (!fs.existsSync(backupPath)) fs.copyFileSync(FILE, backupPath);

  const img = await loadImage(FILE);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, img.width, img.height);
  const px = data.data;
  for (let y = 0; y < img.height; y++) {
    const featherAlpha = y >= FEATHER_PX ? 1 : y / FEATHER_PX;
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4;
      let r = px[i], g = px[i + 1], b = px[i + 2];
      const grey = 0.299 * r + 0.587 * g + 0.114 * b;
      r = (r + (grey - r) * DESATURATE) * BRIGHTEN * RED_TAME;
      g = (g + (grey - g) * DESATURATE) * BRIGHTEN;
      b = (b + (grey - b) * DESATURATE) * BRIGHTEN * BLUE_LIFT;
      px[i] = Math.min(255, r);
      px[i + 1] = Math.min(255, g);
      px[i + 2] = Math.min(255, b);
      px[i + 3] = Math.round(px[i + 3] * featherAlpha);
    }
  }
  ctx.putImageData(data, 0, 0);
  fs.writeFileSync(FILE, canvas.toBuffer('image/png'));
  console.log(`regraded + feathered: ${FILE}`);
  console.log(`pristine backup:      ${backupPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
