/**
 * preview-composite.cjs
 * Composites the grounding overlay on top of the backdrop so we can
 * visually verify the result without launching the game.
 */
const { createCanvas, loadImage } = require('canvas');
const fs   = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, '../public/assets/expedition/backgrounds/desert-entry');

async function main() {
  const backdrop = await loadImage(path.join(DIR, 'desert-entry-photoreal-sphinx-backdrop.png'));
  const overlay  = await loadImage(path.join(DIR, 'desert-entry-grounding-overlay.png'));

  const canvas = createCanvas(backdrop.width, backdrop.height);
  const ctx    = canvas.getContext('2d');

  ctx.drawImage(backdrop, 0, 0);
  ctx.drawImage(overlay,  0, 0);

  const out = path.join(DIR, 'desert-entry-grounding-PREVIEW.png');
  fs.writeFileSync(out, canvas.toBuffer('image/png'));
  console.log(`✓ Preview written: ${out}`);
}

main().catch(console.error);
