/**
 * key-scarab-pylon-gateway.cjs
 * Keys the ChatGPT scarab-pylon gateway render (baked dark-vignette background)
 * to transparency so it can replace duat-breach-wall as the Desert Entry
 * spawn gateway.
 *
 * The background is a smooth gradient while the structure is high-texture, so
 * a border flood-fill that only spreads across low-difference neighbours eats
 * the vignette and stops at the structure's crisp silhouette. Afterwards the
 * alpha edge is defringed (1px erode) and feathered, and the soft dark band
 * under the rubble base is trimmed.
 */
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2];
const OUT = process.argv[3];
const SPREAD_DELTA = 11;   // max per-channel step for the fill to keep spreading
const BOTTOM_TRIM_FEATHER = 26;

async function main() {
  if (!SRC || !OUT) throw new Error('usage: node key-scarab-pylon-gateway.cjs <src> <out>');
  const img = await loadImage(SRC);
  const { width: W, height: H } = img;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, W, H);
  const px = data.data;

  const isBg = new Uint8Array(W * H);
  const queue = [];
  const push = (x, y) => {
    const i = y * W + x;
    if (!isBg[i]) { isBg[i] = 1; queue.push(i); }
  };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }

  while (queue.length) {
    const i = queue.pop();
    const x = i % W, y = (i / W) | 0;
    const o = i * 4;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const ni = ny * W + nx;
      if (isBg[ni]) continue;
      const no = ni * 4;
      const d = Math.max(
        Math.abs(px[no] - px[o]),
        Math.abs(px[no + 1] - px[o + 1]),
        Math.abs(px[no + 2] - px[o + 2]),
      );
      if (d <= SPREAD_DELTA) { isBg[ni] = 1; queue.push(ni); }
    }
  }

  // Clear background, then erode the keep-mask 1px to kill halo-contaminated
  // edge pixels, and give the new edge a 1px soft step.
  const keep = (i) => !isBg[i];
  const eroded = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!keep(i)) continue;
      let edge = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || isBg[ny * W + nx]) { edge = true; break; }
      }
      eroded[i] = edge ? 2 : 1; // 2 = soft edge ring, 1 = solid
    }
  }
  let bottomMost = 0;
  for (let i = 0; i < W * H; i++) {
    if (eroded[i] === 1) bottomMost = Math.max(bottomMost, (i / W) | 0);
    px[i * 4 + 3] = eroded[i] === 1 ? px[i * 4 + 3] : eroded[i] === 2 ? Math.round(px[i * 4 + 3] * 0.45) : 0;
  }
  // Feather the base line so the prop seats into the scene's sand.
  const featherTop = bottomMost - BOTTOM_TRIM_FEATHER;
  for (let y = Math.max(0, featherTop); y < H; y++) {
    const t = Math.max(0, 1 - (y - featherTop) / BOTTOM_TRIM_FEATHER);
    for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4 + 3;
      px[o] = Math.round(px[o] * t);
    }
  }

  ctx.putImageData(data, 0, 0);
  // Crop to content bounds so the placement box maps to visible pixels.
  let minX = W, maxX = 0, minY = H, maxY = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (px[(y * W + x) * 4 + 3] > 8) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  const out = createCanvas(cw, ch);
  out.getContext('2d').drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, out.toBuffer('image/png'));
  console.log(`keyed: ${OUT} (${cw}x${ch}, content from ${W}x${H})`);
}

main().catch((err) => { console.error(err); process.exit(1); });
