export const PROP_EDITOR_HANDLE_DRAW_SIZE = 9; // side length of the filled corner square
export const PROP_EDITOR_HANDLE_HIT = 11; // forgiving half hit radius
export const PROP_EDITOR_ROTATE_OFFSET = 26; // px above the box for the rotate knob

export const drawContactShadow = (ctx, x, y, width, intensity = 0.28, blur = 0, options = {}) => {
  const shadowHeight = options.height ?? Math.max(4, width / 16);
  const coreX = x + (options.coreOffsetX || 0);
  const coreY = y + (options.coreOffsetY || 0);
  const radius = Math.max(18, width / 2);
  const shadowGradient = ctx.createRadialGradient(coreX, coreY, 0, x, y, radius);
  const coreColor = options.coreColor || options.color || 'rgba(44, 24, 10, 0.78)';
  const midColor = options.color || 'rgba(67, 39, 18, 0.48)';
  const edgeColor = options.edgeColor || 'rgba(98, 60, 25, 0)';
  shadowGradient.addColorStop(0, coreColor);
  shadowGradient.addColorStop(0.48, midColor);
  shadowGradient.addColorStop(1, edgeColor);

  ctx.save();
  ctx.globalAlpha = intensity;
  if (blur > 0) ctx.filter = `blur(${blur}px)`;
  ctx.fillStyle = shadowGradient;
  ctx.beginPath();
  ctx.ellipse(x, y, radius, shadowHeight, options.rotation ?? -0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const drawGroundDustLip = (ctx, x, y, width, color = 'rgba(210, 160, 92, 0.28)') => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(18, width / 2.4), Math.max(3, width / 24), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const drawHazardGroundApron = (ctx, x, y, width, sectionId, intensity = 1) => {
  const sandColor = sectionId === 'catacombs'
    ? 'rgba(74, 58, 42, 0.34)'
    : sectionId === 'escape-sequence'
      ? 'rgba(123, 72, 34, 0.34)'
      : 'rgba(185, 119, 55, 0.34)';
  const highlight = sectionId === 'catacombs'
    ? 'rgba(156, 125, 86, 0.24)'
    : 'rgba(226, 162, 83, 0.28)';
  ctx.save();
  ctx.globalAlpha = 0.85 * intensity;
  ctx.fillStyle = sandColor;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(24, width / 2.05), Math.max(5, width / 18), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.7 * intensity;
  ctx.strokeStyle = highlight;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.36, y - 2);
  ctx.quadraticCurveTo(x - width * 0.08, y + 4, x + width * 0.22, y - 1);
  ctx.quadraticCurveTo(x + width * 0.34, y - 4, x + width * 0.44, y + 1);
  ctx.stroke();
  ctx.restore();
};

export const drawDecorativeBaseBlend = (ctx, x, y, width, sectionId, depth = 'background', intensity = 1) => {
  const base = sectionId === 'catacombs'
    ? 'rgba(46, 37, 30, 0.36)'
    : sectionId === 'escape-sequence'
      ? 'rgba(112, 66, 33, 0.3)'
      : sectionId === 'dig-site-entrance'
        ? 'rgba(177, 120, 61, 0.24)'
        : 'rgba(170, 111, 52, 0.28)';
  const highlight = depth === 'background'
    ? 'rgba(228, 171, 98, 0.12)'
    : 'rgba(235, 178, 94, 0.2)';
  ctx.save();
  ctx.globalAlpha = intensity;
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(18, width / 2.25), Math.max(4, width / 22), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha *= 0.82;
  ctx.strokeStyle = highlight;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.32, y - 1);
  ctx.quadraticCurveTo(x - width * 0.08, y + 3, x + width * 0.24, y);
  ctx.stroke();
  ctx.restore();
};

export const drawRouteGroundApron = (ctx, x, y, width, sectionId, intensity = 1, detailSeed = 0) => {
  const isCatacombs = sectionId === 'catacombs';
  const isEscape = sectionId === 'escape-sequence';
  const base = isCatacombs
    ? 'rgba(65, 51, 38, 0.38)'
    : isEscape
      ? 'rgba(138, 79, 36, 0.34)'
      : 'rgba(185, 119, 55, 0.34)';
  const warmEdge = isCatacombs
    ? 'rgba(143, 112, 76, 0.24)'
    : 'rgba(235, 174, 91, 0.28)';
  const shadow = isCatacombs
    ? 'rgba(24, 18, 13, 0.18)'
    : 'rgba(70, 38, 15, 0.15)';

  ctx.save();
  ctx.globalAlpha = 0.86 * intensity;
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.ellipse(x, y + 2, Math.max(34, width / 2), Math.max(8, width / 18), 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.58 * intensity;
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(x + width * 0.08, y + 7, Math.max(28, width / 2.6), Math.max(5, width / 28), -0.04, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.72 * intensity;
  ctx.strokeStyle = warmEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.42, y - 1);
  ctx.quadraticCurveTo(x - width * 0.18, y + 5, x + width * 0.1, y + 1);
  ctx.quadraticCurveTo(x + width * 0.28, y - 3, x + width * 0.44, y + 2);
  ctx.stroke();

  ctx.globalAlpha = 0.5 * intensity;
  ctx.fillStyle = isCatacombs ? 'rgba(100, 78, 55, 0.28)' : 'rgba(135, 82, 35, 0.22)';
  for (let i = 0; i < 4; i += 1) {
    const offset = ((detailSeed + i * 37) % 100) / 100;
    const rockX = x - width * 0.34 + width * 0.68 * offset;
    const rockY = y + 1 + ((detailSeed + i * 17) % 5);
    ctx.beginPath();
    ctx.ellipse(rockX, rockY, 4 + (i % 2) * 2, 2.2, 0.16 * (i - 1), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

export const drawEditorSelectionCorners = (ctx, bounds, color = 'rgba(34, 211, 238, 0.98)') => {
  const cornerLength = Math.min(18, Math.max(8, Math.min(bounds.width, bounds.height) * 0.2));
  ctx.save();
  // Dark halo so the bright handles stay legible over light desert/sky/stone.
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 4;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  [
    [bounds.x, bounds.y, 1, 1],
    [bounds.x + bounds.width, bounds.y, -1, 1],
    [bounds.x, bounds.y + bounds.height, 1, -1],
    [bounds.x + bounds.width, bounds.y + bounds.height, -1, -1],
  ].forEach(([x, y, xDir, yDir]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + yDir * cornerLength);
    ctx.lineTo(x, y);
    ctx.lineTo(x + xDir * cornerLength, y);
    ctx.stroke();
  });
  // Interactive grab targets: filled corner squares (scale) + a rotate knob above.
  const hs = PROP_EDITOR_HANDLE_DRAW_SIZE;
  ctx.fillStyle = color;
  [
    [bounds.x, bounds.y],
    [bounds.x + bounds.width, bounds.y],
    [bounds.x, bounds.y + bounds.height],
    [bounds.x + bounds.width, bounds.y + bounds.height],
  ].forEach(([hx, hy]) => {
    ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
  });
  const knobX = bounds.x + bounds.width / 2;
  const knobY = bounds.y - PROP_EDITOR_ROTATE_OFFSET;
  ctx.beginPath();
  ctx.moveTo(knobX, bounds.y);
  ctx.lineTo(knobX, knobY);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(knobX, knobY, hs / 2 + 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const drawEditorSelectionLabel = (ctx, x, y, text, strokeColor = 'rgba(94, 234, 212, 0.74)') => {
  ctx.save();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(8, 13, 22, 0.86)';
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, 270, 24, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ecfeff';
  ctx.font = '800 11px Outfit, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(text, x + 8, y + 16);
  ctx.restore();
};
