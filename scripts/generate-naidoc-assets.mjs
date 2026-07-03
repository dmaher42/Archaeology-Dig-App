import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createCanvas } from 'canvas';

const root = resolve('public/assets/naidoc-exploration');

const saveCanvas = (canvas, relativePath) => {
  const outPath = resolve(root, relativePath);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, canvas.toBuffer('image/png'));
  return outPath;
};

const roundedRect = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const drawLeaf = (ctx, x, y, scale, rotation, color) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.bezierCurveTo(24, -16, 24, 16, 0, 30);
  ctx.bezierCurveTo(-24, 16, -24, -16, 0, -28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.32)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(0, 22);
  ctx.stroke();
  ctx.restore();
};

const makePlayer = () => {
  const canvas = createCanvas(384, 192);
  const ctx = canvas.getContext('2d');
  const frames = [
    { arm: -0.2, leg: 0.2 },
    { arm: 0.3, leg: -0.3 },
    { arm: -0.32, leg: 0.32 },
    { arm: 0.16, leg: -0.16 },
  ];

  frames.forEach((frame, index) => {
    const ox = index * 96;
    ctx.save();
    ctx.translate(ox + 48, 20);

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 150, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#174c48';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, 94);
    ctx.lineTo(-18 + frame.leg * 18, 139);
    ctx.moveTo(10, 94);
    ctx.lineTo(18 - frame.leg * 18, 139);
    ctx.stroke();

    ctx.strokeStyle = '#1f6f67';
    ctx.beginPath();
    ctx.moveTo(-22, 64);
    ctx.lineTo(-30 + frame.arm * 16, 104);
    ctx.moveTo(22, 64);
    ctx.lineTo(30 - frame.arm * 16, 104);
    ctx.stroke();

    ctx.fillStyle = '#1f6f67';
    roundedRect(ctx, -24, 42, 48, 70, 16);
    ctx.fill();

    ctx.fillStyle = '#2a9d8f';
    roundedRect(ctx, -24, 42, 48, 18, 16);
    ctx.fill();

    ctx.fillStyle = '#f3c99a';
    ctx.beginPath();
    ctx.arc(0, 24, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2c1f18';
    ctx.beginPath();
    ctx.arc(-7, 23, 2.5, 0, Math.PI * 2);
    ctx.arc(8, 23, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#8a4b16';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 16, 23, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();

    ctx.restore();
  });

  return saveCanvas(canvas, 'player/student-explorer-sprite-strip-384x192.png');
};

const makeMarkers = () => {
  const canvas = createCanvas(512, 128);
  const ctx = canvas.getContext('2d');
  const markerColors = ['#9a3412', '#0f766e', '#e9c46a', '#2a9d8f'];
  const glyphs = ['?', '', '!', 'i'];

  markerColors.forEach((color, index) => {
    const ox = index * 128;
    const gradient = ctx.createRadialGradient(ox + 64, 64, 4, ox + 64, 64, 58);
    gradient.addColorStop(0, 'rgba(255,247,219,0.95)');
    gradient.addColorStop(0.45, `${color}aa`);
    gradient.addColorStop(1, `${color}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ox + 64, 64, 58, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    roundedRect(ctx, ox + 40, 24, 48, 76, 10);
    ctx.fill();
    ctx.fillStyle = '#fff8e8';
    ctx.font = '900 34px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (index === 1) {
      ctx.strokeStyle = '#fff8e8';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(ox + 48, 64);
      ctx.lineTo(ox + 60, 78);
      ctx.lineTo(ox + 82, 48);
      ctx.stroke();
    } else {
      ctx.fillText(glyphs[index], ox + 64, 63);
    }
  });

  return saveCanvas(canvas, 'markers/knowledge-marker-sheet-512x128.png');
};

const makeProps = () => {
  const canvas = createCanvas(1024, 256);
  const ctx = canvas.getContext('2d');

  const drawTileBackdrop = (x, color) => {
    ctx.fillStyle = 'rgba(255,248,232,0.04)';
    ctx.fillRect(x, 0, 256, 256);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.18;
    roundedRect(ctx, x + 18, 22, 220, 212, 18);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  drawTileBackdrop(0, '#0f766e');
  ctx.fillStyle = '#8a4b16';
  roundedRect(ctx, 72, 128, 118, 40, 8);
  ctx.fill();
  ctx.fillStyle = '#c08457';
  roundedRect(ctx, 92, 92, 76, 42, 12);
  ctx.fill();
  ctx.strokeStyle = '#fff8e8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(104, 108);
  ctx.lineTo(156, 108);
  ctx.moveTo(104, 122);
  ctx.lineTo(144, 122);
  ctx.stroke();

  drawTileBackdrop(256, '#2a9d8f');
  ctx.strokeStyle = '#2a9d8f';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(290, 154);
  ctx.bezierCurveTo(350, 86, 430, 218, 490, 112);
  ctx.stroke();
  drawLeaf(ctx, 346, 92, 0.72, -0.55, '#6b8f55');
  drawLeaf(ctx, 438, 168, 0.62, 0.8, '#88a96d');

  drawTileBackdrop(512, '#e9c46a');
  ctx.fillStyle = '#f4d27a';
  roundedRect(ctx, 552, 70, 176, 116, 14);
  ctx.fill();
  ctx.fillStyle = '#9a3412';
  roundedRect(ctx, 572, 92, 136, 18, 6);
  roundedRect(ctx, 572, 126, 108, 18, 6);
  roundedRect(ctx, 572, 160, 128, 18, 6);
  ctx.fill();

  drawTileBackdrop(768, '#17342e');
  ctx.fillStyle = '#17342e';
  ctx.beginPath();
  ctx.arc(896, 126, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff8e8';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(896, 126, 48, Math.PI * 0.12, Math.PI * 1.86);
  ctx.stroke();
  ctx.fillStyle = '#e9c46a';
  ctx.beginPath();
  ctx.arc(896, 126, 8, 0, Math.PI * 2);
  ctx.fill();

  return saveCanvas(canvas, 'props/naidoc-classroom-props-sheet-1024x256.png');
};

const outputs = [makePlayer(), makeMarkers(), makeProps()];
console.log(outputs.join('\n'));
