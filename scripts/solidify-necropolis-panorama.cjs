/**
 * solidify-necropolis-panorama.cjs
 * The v4 mid-necropolis panorama has NO fully opaque pixels — the whole
 * artwork body sits at ~alpha 150-250 (a generation/keying artifact). That was
 * invisible against the old muted sky, but the bright cracked-gold sky now
 * glows through every pixel and the ruins read as transparent.
 *
 * Bake the body solid with a linear alpha curve that preserves soft edges:
 *   a < 12   -> 0    (kill keying noise)
 *   12..149  -> stretched 0..255 (edge feathers keep their ramp)
 *   >= 150   -> 255  (artwork body becomes solid)
 * The untouched original is copied to scratch/asset-backups/ first.
 */
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const FILE = path.resolve(
  __dirname,
  '../public/assets/expedition/backgrounds/desert-entry/desert-entry-v4-hybrid-mid-necropolis-soft-depth-2026-07-02.png',
);
const BACKUP_DIR = path.resolve(__dirname, '../scratch/asset-backups');

async function main() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const backupPath = path.join(BACKUP_DIR, path.basename(FILE));
  if (!fs.existsSync(backupPath)) fs.copyFileSync(FILE, backupPath);

  const img = await loadImage(backupPath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height);
  const px = data.data;
  for (let i = 3; i < px.length; i += 4) {
    const a = px[i];
    px[i] = a < 12 ? 0 : a >= 150 ? 255 : Math.round(((a - 12) / 138) * 255);
  }
  ctx.putImageData(data, 0, 0);
  fs.writeFileSync(FILE, canvas.toBuffer('image/png'));
  console.log(`solidified: ${FILE}`);
  console.log(`backup:     ${backupPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
