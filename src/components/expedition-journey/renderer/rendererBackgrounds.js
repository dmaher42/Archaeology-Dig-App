import { DESERT_LAYER_TUNING } from '../desertLayerTuning.js';

export function drawSectionParallaxBackgroundFrame(ctx, section, cameraX, deps) {
  const {
    CANVAS_WIDTH,
    SECTION_PARALLAX_LAYERS,
    desertBackgroundAssetsRef,
    drawDesertBackgroundLayer,
    getSectionBackgroundAssets,
  } = deps;
  const layers = SECTION_PARALLAX_LAYERS[section.id];
  if (!layers) return false;
  const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, section.id);
  if (!assets?.ready) return false;

  const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
  const drawn = layers
    .filter(layer => !layer.foreground)
    .map(layer => drawDesertBackgroundLayer(
      ctx,
      assets,
      layer.key,
      { y: layer.y, height: layer.height },
      {
        ...layerOptions,
        parallax: layer.parallax,
        alpha: layer.alpha,
      },
    ));
  return drawn.every(Boolean);
}

export function drawSectionParallaxForegroundFrame(ctx, section, cameraX, deps) {
  const {
    CANVAS_WIDTH,
    SECTION_PARALLAX_LAYERS,
    desertBackgroundAssetsRef,
    drawDesertBackgroundLayer,
    getSectionBackgroundAssets,
  } = deps;
  const layers = SECTION_PARALLAX_LAYERS[section.id]?.filter(layer => layer.foreground);
  if (!layers?.length) return false;
  const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, section.id);
  if (!assets?.ready) return false;

  const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
  const drawn = layers.map(layer => drawDesertBackgroundLayer(
    ctx,
    assets,
    layer.key,
    { y: layer.y, height: layer.height },
    {
      ...layerOptions,
      parallax: layer.parallax,
      alpha: layer.alpha,
    },
  ));
  return drawn.every(Boolean);
}

export function drawDesertForegroundAtmosphereFrame(ctx, section, cameraX, deps) {
  const {
    CANVAS_WIDTH,
    backgroundPackId,
    desertBackgroundAssetsRef,
    drawDesertBackgroundLayer,
    getSectionBackgroundAssets,
  } = deps;
  if (backgroundPackId === 'china-river-valley') {
    const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'china-river-valley');
    if (!assets?.ready) return false;
    if (assets.atlas?.runtimeMode === 'single-composited-backdrop') {
      ctx.save();
      const mist = ctx.createLinearGradient(0, 270, 0, 480);
      mist.addColorStop(0, 'rgba(229, 232, 211, 0)');
      mist.addColorStop(0.36, 'rgba(229, 232, 211, 0.09)');
      mist.addColorStop(0.76, 'rgba(187, 171, 132, 0.07)');
      mist.addColorStop(1, 'rgba(187, 171, 132, 0)');
      ctx.fillStyle = mist;
      ctx.fillRect(0, 270, CANVAS_WIDTH, 220);
      ctx.restore();
      return true;
    }
    const mistDrawn = [
      drawDesertBackgroundLayer(
        ctx,
        assets,
        'foregroundMist',
        { y: 260, height: 190 },
        { canvasWidth: CANVAS_WIDTH, cameraX, parallax: 0.34, alpha: 0.1 },
      ),
      drawDesertBackgroundLayer(
        ctx,
        assets,
        'foregroundMist',
        { y: 374, height: 130 },
        { canvasWidth: CANVAS_WIDTH, cameraX, parallax: 0.48, alpha: 0.08 },
      ),
    ];
    return mistDrawn.some(Boolean);
  }
  const isNearDesertEntry = section.id === 'desert-entry';
  const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'desert-entry');
  if (!isNearDesertEntry || !assets?.ready) return false;
  const runtimeMode = assets.atlas?.runtimeMode;
  if (runtimeMode !== 'layered-necropolis-playable-route') {
    return false;
  }
  const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
  const foregroundDrawn = [
    drawDesertBackgroundLayer(
      ctx,
      assets,
      'foregroundDepth',
      { y: DESERT_LAYER_TUNING.foregroundDepth.y, height: DESERT_LAYER_TUNING.foregroundDepth.height },
      { ...layerOptions, parallax: DESERT_LAYER_TUNING.foregroundDepth.parallax, alpha: DESERT_LAYER_TUNING.foregroundDepth.alpha },
    ),
  ];
  return foregroundDrawn.some(Boolean);
}

export function drawForegroundDepthParticlesFrame(ctx, now, cameraX, deps) {
  const {
    CANVAS_WIDTH,
    GROUND_Y,
    clamp,
  } = deps;
  let particleCount = 0;
  ctx.save();
  for (let index = 0; index < 18; index += 1) {
    const drift = (now * (0.006 + (index % 5) * 0.0017) + cameraX * 0.035 + index * 91) % (CANVAS_WIDTH + 180);
    const x = drift - 90;
    const edgeWeight = Math.max(
      clamp(1 - x / 230, 0, 1),
      clamp((x - (CANVAS_WIDTH - 230)) / 230, 0, 1),
    );
    const y = GROUND_Y - 34 + (index % 4) * 11 + Math.sin(now / 900 + index) * 4;
    const alpha = (0.012 + edgeWeight * 0.014) * (index % 3 === 0 ? 1.15 : 1);
    ctx.fillStyle = `rgba(232, 205, 157, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 14 + (index % 4) * 6, 1.8 + (index % 3), -0.08, 0, Math.PI * 2);
    ctx.fill();
    particleCount += 1;
  }
  ctx.restore();
  return particleCount;
}

export function drawForegroundDepthLayerFrame(ctx, section, cameraX, now, deps) {
  const {
    CANVAS_WIDTH,
    FOREGROUND_DEPTH_LAYER_MODE,
    GROUND_Y,
    backgroundPackId,
    drawAtlasRegion,
    foregroundDepthEnvironmentAssetsRef,
    stateRef,
  } = deps;
  const drawForegroundDepthParticles = (innerCtx, innerNow, innerCameraX) => (
    drawForegroundDepthParticlesFrame(innerCtx, innerNow, innerCameraX, deps)
  );
  if (backgroundPackId === 'china-river-valley' || section.id !== 'desert-entry') return false;
  const assets = foregroundDepthEnvironmentAssetsRef.current;
  let elementCount = 0;
  const drawRegion = (key, dest, alpha, options = {}) => {
    if (!assets?.loaded || assets.failed) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (options.filter) ctx.filter = options.filter;
    const drawn = drawAtlasRegion(ctx, assets, key, dest, {
      mode: options.mode || 'contain',
      alignY: options.alignY || 'bottom',
    });
    ctx.restore();
    if (drawn) elementCount += 1;
    return drawn;
  };

  ctx.save();

  // ── Grounded ruin prop clusters scattered across the desert-entry world ──
  // Each cluster has a world-X position. We convert to screen-X and scale by
  // depth (smaller = further away) so clusters feel layered.  Only drawn when
  // they fall inside the visible viewport.
  drawRegion('rubbleClusterSmall', { x: -18, y: GROUND_Y - 34, width: 128, height: 54 }, 0.24);
  drawRegion('buriedCarvedHead', { x: -34, y: GROUND_Y - 62, width: 86, height: 72 }, 0.14);
  drawRegion('dryShrub', { x: CANVAS_WIDTH - 132, y: GROUND_Y - 68, width: 84, height: 76 }, 0.22);
  drawRegion('rubbleClusterLarge', { x: CANVAS_WIDTH - 250, y: GROUND_Y - 44, width: 214, height: 74 }, 0.26);
  drawRegion('edgePebbleScatter', { x: CANVAS_WIDTH - 370, y: GROUND_Y - 28, width: 318, height: 44 }, 0.24, { mode: 'stretch' });
  const particleCount = drawForegroundDepthParticles(ctx, now, cameraX);
  ctx.restore();

  if (stateRef.current.renderStats) {
    stateRef.current.renderStats.foregroundDepthLayerActive = elementCount > 0 || particleCount > 0;
    stateRef.current.renderStats.foregroundDepthLayerMode = FOREGROUND_DEPTH_LAYER_MODE;
    stateRef.current.renderStats.foregroundDepthAssetLoaded = Boolean(assets?.loaded);
    stateRef.current.renderStats.foregroundDepthElementCount = elementCount;
    stateRef.current.renderStats.foregroundDepthParticleCount = particleCount;
  }
  return elementCount > 0 || particleCount > 0;
}

export function drawDesertEntryForegroundDepthFrame(ctx, section, cameraX, now, deps) {
  const {
    stateRef,
  } = deps;
  if (section.id !== 'desert-entry') return false;
  void ctx;
  void cameraX;
  void now;
  if (stateRef.current.renderStats) {
    stateRef.current.renderStats.desertEntryForegroundDepthLoaded = false;
    stateRef.current.renderStats.desertEntryForegroundDepthMode = 'retired-integrated-background-carries-front-edge';
  }
  return false;
}

export function drawTempleBackdropFrame(ctx, section, cameraX, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
  } = deps;
  if (section.id !== 'ruined-temple') return;

  ctx.save();
  const wallGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  wallGradient.addColorStop(0, 'rgba(77, 58, 40, 0.88)');
  wallGradient.addColorStop(0.38, 'rgba(94, 70, 45, 0.9)');
  wallGradient.addColorStop(0.78, 'rgba(122, 86, 49, 0.52)');
  wallGradient.addColorStop(1, 'rgba(157, 106, 55, 0.18)');
  ctx.fillStyle = wallGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = 'rgba(20, 14, 10, 0.28)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 96);

  ctx.fillStyle = 'rgba(245, 200, 120, 0.08)';
  for (let worldX = section.start + 120; worldX < section.end; worldX += 340) {
    const x = worldX - cameraX * 0.42;
    if (x < -260 || x > CANVAS_WIDTH + 260) continue;
    ctx.beginPath();
    ctx.ellipse(x, 214, 190, 74, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(39, 25, 16, 0.42)';
  for (let worldX = section.start + 100; worldX < section.end; worldX += 210) {
    const x = worldX - cameraX;
    if (x < -120 || x > CANVAS_WIDTH + 120) continue;
    ctx.fillRect(x - 24, 100, 48, 238);
    ctx.fillStyle = 'rgba(255, 220, 142, 0.11)';
    ctx.fillRect(x - 16, 122, 32, 17);
    ctx.fillRect(x - 16, 172, 32, 17);
    ctx.fillRect(x - 16, 222, 32, 17);
    ctx.fillStyle = 'rgba(22, 15, 11, 0.38)';
    ctx.fillRect(x - 18, 266, 36, 72);
    ctx.fillStyle = 'rgba(39, 25, 16, 0.42)';
  }

  ctx.strokeStyle = 'rgba(255, 226, 160, 0.2)';
  ctx.lineWidth = 2;
  for (let worldX = section.start + 42; worldX < section.end; worldX += 120) {
    const x = worldX - cameraX;
    if (x < -80 || x > CANVAS_WIDTH + 80) continue;
    ctx.strokeRect(x, 154, 54, 28);
    ctx.beginPath();
    ctx.moveTo(x + 8, 238);
    ctx.lineTo(x + 37, 212);
    ctx.lineTo(x + 52, 240);
    ctx.stroke();
  }

  for (let worldX = section.start + 155; worldX < section.end; worldX += 360) {
    const x = worldX - cameraX;
    if (x < -140 || x > CANVAS_WIDTH + 140) continue;
    const glow = ctx.createRadialGradient(x, 248, 0, x, 248, 78);
    glow.addColorStop(0, 'rgba(251, 191, 36, 0.24)');
    glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, 248, 78, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 212, 112, 0.78)';
    ctx.fillRect(x - 3, 240, 6, 16);
  }

  ctx.restore();
}

const getBackgroundRegionImage = (assets, key) => {
  const region = assets?.atlas?.regions?.[key] || null;
  const image = region?.image ? assets?.images?.[region.image] : assets?.image;
  if (!region || !image) return null;
  return { region, image };
};

const getDesertGroundLayerFilter = (config = {}) => {
  const brightness = config.brightness ?? 1;
  const saturate = config.saturate ?? 1;
  const contrast = config.contrast ?? 1;
  return `sepia(4%) brightness(${brightness}) saturate(${saturate}) contrast(${contrast})`;
};

function drawSinglePanoramaLayer(ctx, assets, key, dest, options = {}) {
  const layer = getBackgroundRegionImage(assets, key);
  if (!layer) return false;

  const {
    canvasWidth,
    cameraX = 0,
    parallax = 0,
    alpha = 1,
    alignY = 0.5,
  } = options;
  const { region, image } = layer;
  if (!canvasWidth || dest.height <= 0) return false;

  const sourceRatio = region.w / region.h;
  const drawWidth = Math.max(canvasWidth, dest.height * sourceRatio);
  const drawHeight = drawWidth / sourceRatio;
  const overflowX = Math.max(0, drawWidth - canvasWidth);
  const driftX = overflowX > 0 ? Math.max(-overflowX, Math.min(0, -cameraX * parallax)) : 0;
  const drawY = dest.y + (dest.height - drawHeight) * alignY;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    image,
    region.x, region.y, region.w, region.h,
    Math.round(driftX), Math.round(drawY), Math.round(drawWidth), Math.round(drawHeight),
  );
  ctx.restore();
  return true;
}

function drawSingleGroundLayer(ctx, assets, key, dest, options = {}) {
  const layer = getBackgroundRegionImage(assets, key);
  if (!layer) return false;

  const {
    canvasWidth,
    cameraX = 0,
    parallax = 1,
    alpha = 1,
    filter = null,
  } = options;
  const { region, image } = layer;
  if (!canvasWidth) return false;

  const sourceRatio = region.w / region.h;
  const drawWidth = canvasWidth;
  const drawHeight = drawWidth / sourceRatio;
  const scrollX = -((cameraX * parallax) % drawWidth);
  const firstX = scrollX > 0 ? scrollX - drawWidth : scrollX;

  ctx.save();
  ctx.globalAlpha = alpha;
  if (filter) ctx.filter = filter;
  for (let x = firstX; x < canvasWidth; x += drawWidth) {
    ctx.drawImage(
      image,
      region.x, region.y, region.w, region.h,
      Math.round(x), Math.round(dest.y), Math.round(drawWidth), Math.round(drawHeight),
    );
  }
  ctx.restore();
  return true;
}

function drawDesertEntryGroundLayer(ctx, assets, key, dest, options = {}) {
  const layer = getBackgroundRegionImage(assets, key);
  if (!layer) return false;

  const {
    canvasWidth,
    cameraX = 0,
    parallax = 1,
    alpha = 1,
    filter = null,
    minTileWidth = 0,
  } = options;
  const { region, image } = layer;
  const { y, height } = dest;
  if (!canvasWidth || height <= 0) return false;

  const sourceRatio = region.w / region.h;
  const layerTileWidth = Math.max(canvasWidth + 2, height * sourceRatio, minTileWidth);
  const tileOverlap = Math.max(14, Math.round(layerTileWidth * 0.018));
  const tileStep = Math.max(1, layerTileWidth - tileOverlap);
  const scroll = ((cameraX * parallax) % tileStep + tileStep) % tileStep;
  let x = -scroll;
  let tileIndex = 0;

  ctx.save();
  ctx.globalAlpha = alpha;
  if (filter) ctx.filter = filter;
  while (x > 0) {
    x -= tileStep;
    tileIndex -= 1;
  }
  for (; x < canvasWidth; x += tileStep, tileIndex += 1) {
    const drawX = Math.round(x);
    const drawWidth = Math.round(layerTileWidth + tileOverlap);
    if (Math.abs(tileIndex) % 2 === 1) {
      ctx.save();
      ctx.translate(drawX + drawWidth, Math.round(y));
      ctx.scale(-1, 1);
      ctx.drawImage(
        image,
        region.x, region.y, region.w, region.h,
        0, 0, drawWidth, Math.round(height),
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        image,
        region.x, region.y, region.w, region.h,
        drawX, Math.round(y), drawWidth, Math.round(height),
      );
    }
  }
  ctx.restore();
  return true;
}

function drawDesertEntryGroundLayerTileSeamBreakup(ctx, assets, key, dest, options = {}) {
  const layer = getBackgroundRegionImage(assets, key);
  if (!layer) return false;

  const {
    canvasWidth,
    cameraX = 0,
    parallax = 1,
    alpha = 1,
    opacity = 0.16,
    seamWidth = 58,
  } = options;
  const { region } = layer;
  const { y, height } = dest;
  if (!canvasWidth || height <= 0 || alpha <= 0 || opacity <= 0) return false;

  const sourceRatio = region.w / region.h;
  const layerTileWidth = Math.max(canvasWidth + 2, height * sourceRatio);
  const tileOverlap = Math.max(14, Math.round(layerTileWidth * 0.018));
  const tileStep = Math.max(1, layerTileWidth - tileOverlap);
  const scroll = ((cameraX * parallax) % tileStep + tileStep) % tileStep;
  let seamX = -scroll;
  while (seamX > 0) seamX -= tileStep;

  ctx.save();
  for (; seamX < canvasWidth + tileStep; seamX += tileStep) {
    const x = Math.round(seamX);
    if (x < -seamWidth || x > canvasWidth + seamWidth) continue;

    const dust = ctx.createLinearGradient(x - seamWidth, 0, x + seamWidth, 0);
    dust.addColorStop(0, 'rgba(176, 124, 62, 0)');
    dust.addColorStop(0.42, `rgba(193, 147, 82, ${0.16 * opacity * alpha})`);
    dust.addColorStop(0.5, `rgba(120, 83, 45, ${0.24 * opacity * alpha})`);
    dust.addColorStop(0.58, `rgba(223, 178, 102, ${0.13 * opacity * alpha})`);
    dust.addColorStop(1, 'rgba(176, 124, 62, 0)');
    ctx.fillStyle = dust;
    ctx.fillRect(x - seamWidth, y, seamWidth * 2, height);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < 7; i += 1) {
      const seed = Math.sin((x + cameraX * parallax + i * 47.3) * 0.019);
      const startY = y + height * (0.22 + (i % 5) * 0.145) + seed * 9;
      const leftX = x - seamWidth * (0.58 + (i % 3) * 0.08);
      const rightX = x + seamWidth * (0.46 + (i % 4) * 0.07);
      const controlX = x + seed * seamWidth * 0.28;
      const controlY = startY + Math.cos(seed * 3.7 + i) * 10;
      ctx.strokeStyle = i % 2 === 0
        ? `rgba(80, 49, 23, ${0.1 * opacity * alpha})`
        : `rgba(237, 193, 116, ${0.08 * opacity * alpha})`;
      ctx.lineWidth = 1.5 + (i % 3) * 0.55;
      ctx.beginPath();
      ctx.moveTo(leftX, startY);
      ctx.quadraticCurveTo(controlX, controlY, rightX, startY + seed * 7);
      ctx.stroke();
    }

    for (let i = 0; i < 15; i += 1) {
      const seed = Math.sin((x + cameraX * parallax + i * 41.7) * 0.021);
      const fleckX = x + seed * seamWidth * 0.64;
      const fleckY = y + ((Math.abs(seed) * 997 + i * 53) % Math.max(1, height));
      ctx.fillStyle = i % 2 === 0
        ? `rgba(76, 48, 24, ${0.1 * opacity * alpha})`
        : `rgba(238, 196, 120, ${0.085 * opacity * alpha})`;
      ctx.fillRect(fleckX, fleckY, 9 + (i % 4) * 5, 1.5 + (i % 2) * 0.5);
    }
  }
  ctx.restore();
  return true;
}

function drawDesertEntryAtmosphericGrade(ctx, canvasWidth, canvasHeight, options = {}) {
  const { groundY = 520, intensity = 1 } = options;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';

  const horizonHaze = ctx.createLinearGradient(0, 130, 0, groundY);
  horizonHaze.addColorStop(0, `rgba(255, 205, 128, ${0.02 * intensity})`);
  horizonHaze.addColorStop(0.34, `rgba(239, 159, 74, ${0.075 * intensity})`);
  horizonHaze.addColorStop(0.7, `rgba(133, 69, 26, ${0.065 * intensity})`);
  horizonHaze.addColorStop(1, 'rgba(82, 45, 18, 0)');
  ctx.fillStyle = horizonHaze;
  ctx.fillRect(0, 130, canvasWidth, Math.max(1, groundY - 130));

  const skyWeight = ctx.createLinearGradient(0, 0, 0, 210);
  skyWeight.addColorStop(0, `rgba(34, 14, 9, ${0.12 * intensity})`);
  skyWeight.addColorStop(0.62, `rgba(83, 34, 12, ${0.05 * intensity})`);
  skyWeight.addColorStop(1, 'rgba(72, 34, 15, 0)');
  ctx.fillStyle = skyWeight;
  ctx.fillRect(0, 0, canvasWidth, 220);

  const leftFocus = ctx.createLinearGradient(0, 0, canvasWidth, 0);
  leftFocus.addColorStop(0, `rgba(255, 220, 142, ${0.075 * intensity})`);
  leftFocus.addColorStop(0.34, 'rgba(255, 217, 143, 0)');
  leftFocus.addColorStop(0.72, 'rgba(35, 18, 8, 0)');
  leftFocus.addColorStop(1, `rgba(35, 18, 8, ${0.12 * intensity})`);
  ctx.fillStyle = leftFocus;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.restore();
}

function drawDesertEntryLayerCohesionGrade(ctx, canvasWidth, canvasHeight, options = {}) {
  const {
    groundY = 558,
    intensity = 1,
  } = options;
  if (intensity <= 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  const horizonDust = ctx.createLinearGradient(0, 255, 0, groundY + 26);
  horizonDust.addColorStop(0, 'rgba(225, 166, 94, 0)');
  horizonDust.addColorStop(0.42, `rgba(240, 176, 88, ${0.04 * intensity})`);
  horizonDust.addColorStop(0.72, `rgba(214, 128, 47, ${0.055 * intensity})`);
  horizonDust.addColorStop(1, `rgba(116, 55, 20, ${0.025 * intensity})`);
  ctx.fillStyle = horizonDust;
  ctx.fillRect(0, 255, canvasWidth, Math.max(1, groundY + 26 - 255));

  const groundDustShelf = ctx.createLinearGradient(0, groundY - 128, 0, groundY + 18);
  groundDustShelf.addColorStop(0, 'rgba(226, 174, 110, 0)');
  groundDustShelf.addColorStop(0.58, `rgba(245, 188, 106, ${0.05 * intensity})`);
  groundDustShelf.addColorStop(1, `rgba(166, 78, 27, ${0.028 * intensity})`);
  ctx.fillStyle = groundDustShelf;
  ctx.fillRect(0, groundY - 128, canvasWidth, 146);

  const sunsetGlow = ctx.createLinearGradient(0, 150, canvasWidth, groundY);
  sunsetGlow.addColorStop(0, `rgba(255, 206, 106, ${0.13 * intensity})`);
  sunsetGlow.addColorStop(0.38, `rgba(240, 124, 43, ${0.08 * intensity})`);
  sunsetGlow.addColorStop(1, 'rgba(236, 135, 49, 0)');
  ctx.fillStyle = sunsetGlow;
  ctx.fillRect(0, 150, canvasWidth, Math.max(1, groundY - 130));
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const lowSunRake = ctx.createRadialGradient(0, 160, 24, 0, 170, canvasWidth * 0.68);
  lowSunRake.addColorStop(0, `rgba(255, 214, 132, ${0.13 * intensity})`);
  lowSunRake.addColorStop(0.34, `rgba(255, 151, 58, ${0.07 * intensity})`);
  lowSunRake.addColorStop(1, 'rgba(255, 151, 58, 0)');
  ctx.fillStyle = lowSunRake;
  ctx.fillRect(0, 0, canvasWidth, Math.max(1, groundY));
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  const skyDepth = ctx.createLinearGradient(0, 0, 0, Math.min(canvasHeight, 340));
  skyDepth.addColorStop(0, `rgba(34, 12, 8, ${0.12 * intensity})`);
  skyDepth.addColorStop(0.58, `rgba(86, 32, 9, ${0.05 * intensity})`);
  skyDepth.addColorStop(1, 'rgba(255, 255, 255, 1)');
  ctx.fillStyle = skyDepth;
  ctx.fillRect(0, 0, canvasWidth, Math.min(canvasHeight, 340));

  const depthVignette = ctx.createLinearGradient(0, 0, canvasWidth, 0);
  depthVignette.addColorStop(0, `rgba(70, 34, 13, ${0.14 * intensity})`);
  depthVignette.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
  depthVignette.addColorStop(0.78, 'rgba(255, 255, 255, 1)');
  depthVignette.addColorStop(1, `rgba(51, 23, 9, ${0.15 * intensity})`);
  ctx.fillStyle = depthVignette;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();
}

function drawDesertEntryTempleBaseIntegrationGrade(ctx, canvasWidth, options = {}) {
  const {
    groundY = 558,
    intensity = 1,
  } = options;
  if (intensity <= 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  const baseDust = ctx.createLinearGradient(0, groundY - 172, 0, groundY + 36);
  baseDust.addColorStop(0, 'rgba(230, 178, 112, 0)');
  baseDust.addColorStop(0.24, `rgba(230, 178, 112, ${0.04 * intensity})`);
  baseDust.addColorStop(0.48, `rgba(185, 113, 49, ${0.06 * intensity})`);
  baseDust.addColorStop(0.72, `rgba(105, 64, 31, ${0.038 * intensity})`);
  baseDust.addColorStop(1, 'rgba(105, 64, 31, 0)');
  ctx.fillStyle = baseDust;
  ctx.fillRect(0, groundY - 172, canvasWidth, 208);

  const floorLift = ctx.createLinearGradient(0, groundY - 118, 0, groundY - 12);
  floorLift.addColorStop(0, 'rgba(255, 215, 139, 0)');
  floorLift.addColorStop(0.52, `rgba(255, 210, 132, ${0.035 * intensity})`);
  floorLift.addColorStop(1, 'rgba(255, 210, 132, 0)');
  ctx.fillStyle = floorLift;
  ctx.fillRect(0, groundY - 118, canvasWidth, 106);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  const ruinFootOcclusion = ctx.createLinearGradient(0, groundY - 132, 0, groundY - 26);
  ruinFootOcclusion.addColorStop(0, 'rgba(255, 255, 255, 1)');
  ruinFootOcclusion.addColorStop(0.58, `rgba(103, 59, 28, ${0.05 * intensity})`);
  ruinFootOcclusion.addColorStop(1, 'rgba(255, 255, 255, 1)');
  ctx.fillStyle = ruinFootOcclusion;
  ctx.fillRect(0, groundY - 132, canvasWidth, 106);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'round';
  for (let i = 0; i < 18; i += 1) {
    const y = groundY - 124 + (i % 9) * 11 + Math.sin(i * 1.9) * 5;
    const x = ((Math.sin(i * 14.37) + 1) * 0.5) * canvasWidth;
    const w = 160 + ((i * 47) % 260);
    const alpha = (i % 2 === 0 ? 0.022 : 0.016) * intensity;
    ctx.strokeStyle = i % 3 === 0
      ? `rgba(83, 52, 27, ${alpha})`
      : `rgba(236, 184, 108, ${alpha})`;
    ctx.lineWidth = 3 + (i % 4);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.5, y);
    ctx.quadraticCurveTo(x, y + Math.sin(i * 0.73) * 10, x + w * 0.5, y + Math.cos(i) * 4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDesertEntryRitualTempleNearLane(ctx, section, cameraX, assets, canvasWidth) {
  const T = DESERT_LAYER_TUNING;
  const ritualRegion = assets.atlas?.regions?.ritualPyramid;
  const ritualImage = ritualRegion?.image ? assets.images?.[ritualRegion.image] : null;
  if (!ritualImage || !ritualRegion || T.ritualPyramid.alpha <= 0.01) return false;

  const cfg = T.ritualPyramid;
  const ritualSectionWidth = Math.max(1, section.end - section.start);
  const ritualWorldX = section.start + ritualSectionWidth * cfg.sectionFraction;
  const ritualWidth = cfg.height * (ritualRegion.w / ritualRegion.h) * (cfg.widthScale ?? 1);
  const ritualX = (ritualWorldX - cameraX) * cfg.parallax + canvasWidth / 2 - ritualWidth / 2;
  if (ritualX <= -ritualWidth || ritualX >= canvasWidth + ritualWidth) return false;

  ctx.save();
  ctx.globalAlpha = cfg.alpha;
  ctx.filter = `sepia(5%) brightness(${cfg.brightness ?? 1}) saturate(${cfg.saturate ?? 1}) contrast(${cfg.contrast ?? 1})`;
  ctx.drawImage(
    ritualImage,
    ritualRegion.x, ritualRegion.y, ritualRegion.w, ritualRegion.h,
    Math.round(ritualX), Math.round(cfg.baseY - cfg.height), Math.round(ritualWidth), cfg.height,
  );
  ctx.restore();
  return true;
}

function drawDesertEntryPlayableFloorGrade(ctx, canvasWidth, options = {}) {
  const {
    groundY = 520,
    floorBottom = 610,
    intensity = 1,
  } = options;

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  const floorOcclusion = ctx.createLinearGradient(0, groundY - 28, 0, floorBottom);
  floorOcclusion.addColorStop(0, 'rgba(255, 255, 255, 1)');
  floorOcclusion.addColorStop(0.38, `rgba(145, 80, 26, ${0.12 * intensity})`);
  floorOcclusion.addColorStop(1, `rgba(76, 43, 18, ${0.22 * intensity})`);
  ctx.fillStyle = floorOcclusion;
  ctx.fillRect(0, groundY - 28, canvasWidth, Math.max(1, floorBottom - groundY + 28));
  ctx.restore();

  ctx.save();
  const routeContact = ctx.createLinearGradient(0, groundY - 18, 0, groundY + 62);
  routeContact.addColorStop(0, 'rgba(34, 19, 8, 0)');
  routeContact.addColorStop(0.45, `rgba(34, 19, 8, ${0.26 * intensity})`);
  routeContact.addColorStop(1, 'rgba(34, 19, 8, 0)');
  ctx.fillStyle = routeContact;
  ctx.fillRect(0, groundY - 18, canvasWidth, 80);

  const warmKick = ctx.createLinearGradient(0, groundY - 36, 0, groundY + 18);
  warmKick.addColorStop(0, 'rgba(255, 206, 116, 0)');
  warmKick.addColorStop(0.72, `rgba(255, 206, 116, ${0.08 * intensity})`);
  warmKick.addColorStop(1, 'rgba(255, 206, 116, 0)');
  ctx.fillStyle = warmKick;
  ctx.fillRect(0, groundY - 36, canvasWidth, 56);
  ctx.restore();
}

function drawDesertEntryDryPlazaSeamBreakup(ctx, canvasWidth, cameraX, options = {}) {
  const {
    seamY = 540,
    intensity = 1,
  } = options;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  const seamShade = ctx.createLinearGradient(0, seamY - 34, 0, seamY + 52);
  seamShade.addColorStop(0, 'rgba(56, 36, 20, 0)');
  seamShade.addColorStop(0.38, `rgba(126, 82, 42, ${0.12 * intensity})`);
  seamShade.addColorStop(0.62, `rgba(49, 33, 22, ${0.1 * intensity})`);
  seamShade.addColorStop(1, 'rgba(56, 36, 20, 0)');
  ctx.fillStyle = seamShade;
  ctx.fillRect(0, seamY - 34, canvasWidth, 86);
  ctx.restore();
}

export function drawDesertEntryBackgroundFrame(ctx, section, cameraX, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    desertBackgroundAssetsRef,
    drawDesertBackgroundLayer,
    getSectionBackgroundAssets,
  } = deps;
  const isNearDesertEntry = section.id === 'desert-entry';
  const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'desert-entry');
  if (!isNearDesertEntry || !assets?.ready) return false;

  const runtimeMode = assets.atlas?.runtimeMode;
  if (runtimeMode !== 'layered-necropolis-playable-route') {
    return false;
  }

  const T = DESERT_LAYER_TUNING;
  const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
  const fullFrame = { y: 0, height: CANVAS_HEIGHT };
  const isV3ProductionCandidate = assets.atlas?.devCandidateMode === 'v3-production-layers-test';
  const skyDrawn = isV3ProductionCandidate
    ? drawSinglePanoramaLayer(
      ctx,
      assets,
      'skyLight',
      { y: 0, height: assets.atlas?.candidateSkyLayerHeight ?? CANVAS_HEIGHT },
      { ...layerOptions, parallax: T.skyLight.parallax, alpha: T.skyLight.alpha, alignY: 0 },
    )
    : drawDesertBackgroundLayer(
      ctx,
      assets,
      'skyLight',
      fullFrame,
      {
        ...layerOptions,
        parallax: T.skyLight.parallax,
        alpha: T.skyLight.alpha,
        // Lift the baked-in storm murk so the sunset reads warm instead of muddy.
        filter: 'brightness(1.06) saturate(1.05)',
      },
    );
  if (!skyDrawn) return false;

  if (isV3ProductionCandidate) {
    drawSinglePanoramaLayer(ctx, assets, 'distantCliffs', {
      y: assets.atlas?.candidateDepthFillDrawY ?? 205,
      height: assets.atlas?.candidateDepthFillHeight ?? 230,
    }, {
      ...layerOptions,
      parallax: T.distantCliffs.parallax,
      alpha: assets.atlas?.candidateDepthFillAlpha ?? T.distantCliffs.alpha,
      alignY: 0.5,
    });

    drawSinglePanoramaLayer(ctx, assets, 'midNecropolisRuins', {
      y: assets.atlas?.candidateMidLayerDrawY ?? 240,
      height: assets.atlas?.candidateMidLayerHeight ?? 345,
    }, {
      ...layerOptions,
      parallax: T.midNecropolisRuins.parallax,
      alpha: T.midNecropolisRuins.alpha,
      alignY: 0.5,
    });
  } else {
    // Cliffs drawn first as the far backdrop (slowest, tiled). Height is
    // base-anchored to the canvas bottom so raising it lifts the peaks while the
    // base stays pinned behind the ground layers.
    const cliffsDest = { y: CANVAS_HEIGHT - T.distantCliffs.height, height: T.distantCliffs.height };
    drawDesertBackgroundLayer(ctx, assets, 'distantCliffs', cliffsDest, {
      ...layerOptions,
      parallax: T.distantCliffs.parallax,
      alpha: T.distantCliffs.alpha,
      filter: 'sepia(6%) saturate(102%) brightness(98%) contrast(106%)',
    });

    // Imposing pyramids drawn ONCE (non-tiling, world-anchored) so the
    // distinctive shapes never repeat as the player scrolls. Grounded in the art
    // (sand mounds at the bases), drawn at backdrop size with the bases sitting
    // on the necropolis floor, and at low parallax so they stay pinned to the
    // horizon. Position/size/base are dev-tunable.
    const pyrRegion = assets.atlas?.regions?.farPyramids;
    const pyrImage = pyrRegion?.image ? assets.images?.[pyrRegion.image] : null;
    if (pyrImage && pyrRegion) {
      const PYR_SECTION_FRACTION = T.farPyramids.sectionFraction; // anchored mid-section
      const PYR_PARALLAX = T.farPyramids.parallax;
      const PYR_HEIGHT = T.farPyramids.height;
      const PYR_BASE_Y = T.farPyramids.baseY;           // screen Y of the pyramid bases (ground line)
      const sectionWidth = Math.max(1, section.end - section.start);
      const pyrWorldX = section.start + sectionWidth * PYR_SECTION_FRACTION;
      const pyrWidth = PYR_HEIGHT * (pyrRegion.w / pyrRegion.h);
      const pyrX = (pyrWorldX - cameraX) * PYR_PARALLAX + CANVAS_WIDTH / 2 - pyrWidth / 2;
      ctx.save();
      ctx.globalAlpha = T.farPyramids.alpha ?? 1;
      ctx.filter = 'sepia(5%) saturate(112%) brightness(100%) contrast(112%)';
      ctx.drawImage(
        pyrImage,
        pyrRegion.x, pyrRegion.y, pyrRegion.w, pyrRegion.h,
        Math.round(pyrX), PYR_BASE_Y - PYR_HEIGHT, Math.round(pyrWidth), PYR_HEIGHT,
      );
      ctx.restore();
    }
    drawDesertBackgroundLayer(ctx, assets, 'midNecropolisRuins', { y: T.midNecropolisRuins.baseY - T.midNecropolisRuins.height, height: T.midNecropolisRuins.height }, {
      ...layerOptions,
      parallax: T.midNecropolisRuins.parallax,
      alpha: T.midNecropolisRuins.alpha,
      filter: 'sepia(3%) saturate(126%) brightness(103%) contrast(122%)',
    });
  }

  if (assets.atlas?.regions?.dustHaze && T.dustHaze?.alpha > 0.01) {
    drawDesertBackgroundLayer(
      ctx,
      assets,
      'dustHaze',
      { y: T.dustHaze.y, height: T.dustHaze.height },
      {
        ...layerOptions,
        parallax: T.dustHaze.parallax,
        alpha: T.dustHaze.alpha,
        filter: 'sepia(2%) saturate(104%) brightness(112%) contrast(100%)',
      },
    );
  }

  drawDesertEntryAtmosphericGrade(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, {
    groundY: isV3ProductionCandidate
      ? assets.atlas?.candidateGroundLaneWalkingSurfaceY ?? 538
      : T.groundLane.y,
    intensity: isV3ProductionCandidate ? 1.05 : 0.3,
  });

  // Placed Sphinx landmark: a single non-tiling monument grounded at the
  // necropolis floor, scrolling at mid parallax so the player approaches and
  // passes it. Position fraction, scale and base Y are dev-tunable.
  const sphinxRegion = assets.atlas?.regions?.desertSphinx;
  const sphinxImage = sphinxRegion?.image ? assets.images?.[sphinxRegion.image] : null;
  if (sphinxImage && sphinxRegion) {
    const SPHINX_SECTION_FRACTION = T.desertSphinx.sectionFraction; // where along desert-entry it is anchored
    const SPHINX_PARALLAX = T.desertSphinx.parallax;          // 1 = locked to the ground, lower = more distant
    const SPHINX_HEIGHT = T.desertSphinx.height;
    const SPHINX_BASE_Y = T.desertSphinx.baseY;            // screen Y of the Sphinx base (ground line)
    const sectionWidth = Math.max(1, section.end - section.start);
    const sphinxWorldX = section.start + sectionWidth * SPHINX_SECTION_FRACTION;
    const sphinxWidth = SPHINX_HEIGHT * (sphinxRegion.w / sphinxRegion.h);
    // True parallax: screen X drifts with actual camera movement (negative rate),
    // so the monument scrolls past as the player walks instead of following them.
    const sphinxX = (sphinxWorldX - cameraX) * SPHINX_PARALLAX + CANVAS_WIDTH / 2 - sphinxWidth / 2;
    if (sphinxX > -sphinxWidth && sphinxX < CANVAS_WIDTH + sphinxWidth) {
      // Tunable grade so the Sphinx sits in the weathered scene instead of reading as
      // bright polished gold (desertSphinx.brightness / .saturate, live in Layers panel).
      const sphinxBrightness = T.desertSphinx.brightness ?? 1;
      const sphinxSaturate = T.desertSphinx.saturate ?? 1;
      const sphinxContrast = T.desertSphinx.contrast ?? 1.04;
      const sphinxAlpha = Math.max(0, Math.min(1, T.desertSphinx.alpha ?? 1));
      ctx.save();
      ctx.globalAlpha = sphinxAlpha;
      ctx.filter = `sepia(5%) brightness(${sphinxBrightness}) saturate(${sphinxSaturate}) contrast(${sphinxContrast})`;
      ctx.drawImage(
        sphinxImage,
        sphinxRegion.x, sphinxRegion.y, sphinxRegion.w, sphinxRegion.h,
        Math.round(sphinxX), SPHINX_BASE_Y - SPHINX_HEIGHT, Math.round(sphinxWidth), SPHINX_HEIGHT,
      );
      ctx.restore();
    }
  }

  if (!isV3ProductionCandidate) {
    drawDesertEntryLayerCohesionGrade(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, {
      groundY: T.groundLane.y,
      intensity: 0.68,
    });
    drawDesertEntryTempleBaseIntegrationGrade(ctx, CANVAS_WIDTH, {
      groundY: T.groundLane.y,
      intensity: 0.5,
    });
  }
  if (assets.atlas?.devCandidateLabel) {
    ctx.save();
    ctx.font = '12px Georgia, serif';
    ctx.textBaseline = 'top';
    const label = assets.atlas.devCandidateLabel;
    const labelWidth = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(31, 20, 8, 0.82)';
    ctx.strokeStyle = 'rgba(244, 198, 112, 0.72)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(10, 38, labelWidth + 18, 24, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 232, 177, 0.94)';
    ctx.fillText(label, 19, 44);
    ctx.restore();
  }
  return true;
}

// World-locked, 1:1 scrolling ground lane for desert-entry. A near-locked backing
// layer sits below it as visual-only land mass so the playable path no longer reads
// as a floating ledge. Collision remains on the stable world floor. The backing and
// lane geometry are dev-tunable via DESERT_LAYER_TUNING (groundBacking / groundLane).

export function drawDesertEntryGroundLaneFrame(ctx, section, cameraX, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GROUND_Y,
    desertBackgroundAssetsRef,
    drawDesertBackgroundLayer,
    getSectionBackgroundAssets,
    stateRef,
  } = deps;
  if (section.id !== 'desert-entry') return false;
  const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'desert-entry');
  if (!assets?.loaded) return false;

  const T = DESERT_LAYER_TUNING;
  const isV3ProductionCandidate = assets.atlas?.devCandidateMode === 'v3-production-layers-test';
  const candidateGroundY = assets.atlas?.candidateGroundLaneWalkingSurfaceY ?? 538;
  const backingDrawn = isV3ProductionCandidate
    ? drawSingleGroundLayer(
      ctx,
      assets,
      'groundBacking',
      { y: assets.atlas?.candidateGroundBackingDrawY ?? 560 },
      {
        canvasWidth: CANVAS_WIDTH,
        cameraX,
        parallax: T.groundBacking.parallax,
        alpha: T.groundBacking.alpha,
        filter: getDesertGroundLayerFilter(T.groundBacking),
      },
    )
    : drawDesertEntryGroundLayer(
      ctx,
      assets,
      'groundBacking',
      { y: T.groundBacking.y, height: T.groundBacking.height },
      {
        canvasWidth: CANVAS_WIDTH,
        cameraX,
        parallax: T.groundBacking.parallax,
        alpha: T.groundBacking.alpha,
        filter: getDesertGroundLayerFilter(T.groundBacking),
        minTileWidth: CANVAS_WIDTH * 2.8,
      },
    );
  if (backingDrawn && !isV3ProductionCandidate) {
    drawDesertEntryGroundLayerTileSeamBreakup(
      ctx,
      assets,
      'groundBacking',
      { y: T.groundBacking.y, height: T.groundBacking.height },
      {
        canvasWidth: CANVAS_WIDTH,
        cameraX,
        parallax: T.groundBacking.parallax,
        alpha: T.groundBacking.alpha,
        opacity: 0,
        seamWidth: 42,
      },
    );
  }

  const ritualTempleDrawn = drawDesertEntryRitualTempleNearLane(
    ctx,
    section,
    cameraX,
    assets,
    CANVAS_WIDTH,
  );

  if (!isV3ProductionCandidate) {
    drawDesertEntryGroundLayer(
      ctx,
      assets,
      'groundTransition',
      { y: T.groundTransition.y, height: T.groundTransition.height },
      {
        canvasWidth: CANVAS_WIDTH,
        cameraX,
        parallax: T.groundTransition.parallax,
        alpha: T.groundTransition.alpha,
        filter: getDesertGroundLayerFilter(T.groundTransition),
      },
    );
  }

  const drawn = isV3ProductionCandidate
    ? drawSingleGroundLayer(
      ctx,
      assets,
      'groundLane',
      { y: assets.atlas?.candidateGroundLaneDrawY ?? 148 },
      {
        canvasWidth: CANVAS_WIDTH,
        cameraX,
        parallax: T.groundLane.parallax,
        alpha: T.groundLane.alpha,
        filter: getDesertGroundLayerFilter(T.groundLane),
      },
    )
    : drawDesertEntryGroundLayer(
      ctx,
      assets,
      'groundLane',
      { y: T.groundLane.y, height: T.groundLane.height },
      {
        canvasWidth: CANVAS_WIDTH,
        cameraX,
        parallax: T.groundLane.parallax,
        alpha: T.groundLane.alpha,
        filter: getDesertGroundLayerFilter(T.groundLane),
      },
    );
  if (drawn && !isV3ProductionCandidate) {
    drawDesertEntryGroundLayerTileSeamBreakup(
      ctx,
      assets,
      'groundLane',
      { y: T.groundLane.y, height: T.groundLane.height },
      {
        canvasWidth: CANVAS_WIDTH,
        cameraX,
        parallax: T.groundLane.parallax,
        alpha: T.groundLane.alpha,
        opacity: 0.28,
        seamWidth: 104,
      },
    );
  }

  // Soft contact shadow where the ruins meet the ground: grounds the
  // background onto the path and softens the boundary so it stops reading as a
  // hard ledge -- subtle, no clutter.
  drawDesertEntryPlayableFloorGrade(ctx, CANVAS_WIDTH, {
    groundY: isV3ProductionCandidate ? candidateGroundY : GROUND_Y,
    floorBottom: isV3ProductionCandidate ? 616 : Math.min(CANVAS_HEIGHT, T.groundLane.y + T.groundLane.height),
    intensity: isV3ProductionCandidate ? 0.72 : 0.42,
  });
  ctx.save();
  const contactShadow = ctx.createLinearGradient(0, GROUND_Y - 34, 0, GROUND_Y + 30);
  contactShadow.addColorStop(0, 'rgba(28, 17, 9, 0)');
  contactShadow.addColorStop(0.5, 'rgba(28, 17, 9, 0.11)');
  contactShadow.addColorStop(1, 'rgba(28, 17, 9, 0)');
  ctx.fillStyle = contactShadow;
  ctx.fillRect(0, GROUND_Y - 34, CANVAS_WIDTH, 64);
  ctx.restore();
  drawDesertEntryDryPlazaSeamBreakup(ctx, CANVAS_WIDTH, cameraX, {
    seamY: isV3ProductionCandidate ? candidateGroundY + 28 : T.groundLane.y + 35,
    intensity: isV3ProductionCandidate ? 1.18 : 1.12,
  });
  const rubbleDrawn = isV3ProductionCandidate
    ? drawDesertBackgroundLayer(
      ctx,
      assets,
      'foregroundRubble',
      { y: T.foregroundRubble.y, height: T.foregroundRubble.height },
      {
        canvasWidth: CANVAS_WIDTH,
        cameraX,
        parallax: T.foregroundRubble.parallax,
        alpha: T.foregroundRubble.alpha,
      },
    )
    : drawDesertEntryGroundLayer(
      ctx,
      assets,
      'foregroundRubble',
      { y: T.foregroundRubble.y, height: T.foregroundRubble.height },
      {
        canvasWidth: CANVAS_WIDTH,
        cameraX,
        parallax: T.foregroundRubble.parallax,
        alpha: T.foregroundRubble.alpha,
      },
    );
  if (rubbleDrawn && !isV3ProductionCandidate) {
    drawDesertEntryGroundLayerTileSeamBreakup(
      ctx,
      assets,
      'foregroundRubble',
      { y: T.foregroundRubble.y, height: T.foregroundRubble.height },
      {
        canvasWidth: CANVAS_WIDTH,
        cameraX,
        parallax: T.foregroundRubble.parallax,
        alpha: T.foregroundRubble.alpha,
        opacity: 0.18,
        seamWidth: 78,
      },
    );
  }

  if (drawn && stateRef.current.renderStats) {
    stateRef.current.renderStats.desertEntryGroundLaneActive = true;
    stateRef.current.renderStats.desertEntryGroundLaneParallax = DESERT_LAYER_TUNING.groundLane.parallax;
  }
  if (backingDrawn && stateRef.current.renderStats) {
    stateRef.current.renderStats.desertEntryGroundBackingActive = true;
    stateRef.current.renderStats.desertEntryGroundBackingParallax = DESERT_LAYER_TUNING.groundBacking.parallax;
  }
  if (rubbleDrawn && stateRef.current.renderStats) {
    stateRef.current.renderStats.desertEntryForegroundRubbleActive = true;
  }
  if (ritualTempleDrawn && stateRef.current.renderStats) {
    stateRef.current.renderStats.desertEntryRitualTempleDepthSlot = 'between-ground-backing-and-lane';
  }
  return drawn || backingDrawn || ritualTempleDrawn || rubbleDrawn;
}

export function drawChinaRiverValleyBackgroundFrame(ctx, cameraX, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    ENVIRONMENT_ASSET_PACK_IDS,
    backgroundPackId,
    desertBackgroundAssetsRef,
    drawDesertBackgroundLayer,
    environmentPackId,
    getSectionBackgroundAssets,
  } = deps;
  const isChinaRiverValleyBackground = backgroundPackId === 'china-river-valley'
    || environmentPackId === ENVIRONMENT_ASSET_PACK_IDS.CHINA_RIVER_VALLEY;
  if (!isChinaRiverValleyBackground) return false;
  const drawChinaFallbackBase = () => {
    ctx.save();
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0, '#7f9ca1');
    sky.addColorStop(0.48, '#d9c58f');
    sky.addColorStop(0.78, '#9a7a44');
    sky.addColorStop(1, '#5d482b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const distantRidge = ctx.createLinearGradient(0, 245, 0, 470);
    distantRidge.addColorStop(0, 'rgba(212, 222, 202, 0)');
    distantRidge.addColorStop(0.3, 'rgba(212, 222, 202, 0.28)');
    distantRidge.addColorStop(0.66, 'rgba(92, 116, 88, 0.2)');
    distantRidge.addColorStop(1, 'rgba(92, 116, 88, 0)');
    ctx.fillStyle = distantRidge;
    ctx.fillRect(0, 230, CANVAS_WIDTH, 260);

    const groundWash = ctx.createLinearGradient(0, CANVAS_HEIGHT - 170, 0, CANVAS_HEIGHT);
    groundWash.addColorStop(0, 'rgba(143, 107, 55, 0)');
    groundWash.addColorStop(0.42, 'rgba(143, 107, 55, 0.34)');
    groundWash.addColorStop(1, 'rgba(65, 47, 28, 0.56)');
    ctx.fillStyle = groundWash;
    ctx.fillRect(0, CANVAS_HEIGHT - 180, CANVAS_WIDTH, 180);
    ctx.restore();
  };
  const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'china-river-valley');
  if (!assets?.ready) {
    drawChinaFallbackBase();
    return true;
  }
  const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
  if (assets.atlas?.runtimeMode === 'layered-parallax') {
    // Five full-frame panoramic layers (each ~3:1, content positioned naturally in-frame),
    // drawn back-to-front at full canvas height with increasing parallax so their horizons
    // stay aligned while depth scrolls. The procedural base prevents old section art from
    // showing during route switches or if any alpha-keyed layer leaves uncovered pixels.
    drawChinaFallbackBase();
    const full = { y: 0, height: CANVAS_HEIGHT };
    const skyDrawn = drawDesertBackgroundLayer(ctx, assets, 'skyLayer', full, { ...layerOptions, parallax: 0.01, alpha: 1 });
    if (!skyDrawn) return true;
    drawDesertBackgroundLayer(ctx, assets, 'farMountains',    full, { ...layerOptions, parallax: 0.045, alpha: 0.9 });
    drawDesertBackgroundLayer(ctx, assets, 'riverValley',     full, { ...layerOptions, parallax: 0.1,  alpha: 1 });
    drawDesertBackgroundLayer(ctx, assets, 'watchtowerRidge', full, { ...layerOptions, parallax: 0.2,  alpha: 1 });
    drawDesertBackgroundLayer(ctx, assets, 'foregroundMist',  full, { ...layerOptions, parallax: 0.36, alpha: 0.92 });
    return true;
  }
  // Only the layered-parallax atlas ships today. Any other or unknown runtimeMode
  // falls back to the opaque procedural base so the China frame stays owned (no
  // old-section bleed) instead of drawing against deleted river-valley slice art.
  drawChinaFallbackBase();
  return true;
}

export function drawDesertJourneyPanelLayerFrame(ctx, panel, layer, cameraX, now, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    DESERT_JOURNEY_SCENE_PANELS,
  } = deps;
  const clipLeft = Math.max(0, Math.floor(panel.worldStart - cameraX));
  const clipRight = Math.min(CANVAS_WIDTH, Math.ceil(panel.worldEnd - cameraX));
  if (clipRight <= clipLeft) return false;

  const panelIndex = DESERT_JOURNEY_SCENE_PANELS.findIndex(item => item.id === panel.id);
  const panelSpan = panel.worldEnd - panel.worldStart;
  const cameraDelta = cameraX - panel.worldStart;
  const layerOriginX = -cameraDelta * layer.parallax;
  const at = (relativeX) => layerOriginX + relativeX;
  const wave = Math.sin(now / 2600 + panelIndex * 0.9) * 1.8;

  const drawDuneBand = (baseY, amplitude, color, alpha, phase = 0) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(clipLeft - 120, CANVAS_HEIGHT + 40);
    for (let x = clipLeft - 120; x <= clipRight + 140; x += 56) {
      const worldWaveX = x + cameraX * layer.parallax + panelIndex * 180;
      const y = baseY
        + Math.sin(worldWaveX * 0.004 + phase) * amplitude
        + Math.cos(worldWaveX * 0.0017 + phase * 0.6) * amplitude * 0.52;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(clipRight + 140, CANVAS_HEIGHT + 40);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawPyramid = (x, y, width, height, color, alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width / 2, y - height);
    ctx.lineTo(x + width, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 219, 144, 0.08)';
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y - height);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width * 0.62, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  ctx.save();
  ctx.beginPath();
  ctx.rect(clipLeft, 0, clipRight - clipLeft, CANVAS_HEIGHT);
  ctx.clip();

  if (layer.role === 'sky') {
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0, '#172033');
    sky.addColorStop(0.28, '#5f5144');
    sky.addColorStop(0.56, '#c28d4d');
    sky.addColorStop(1, '#6d4b2b');
    ctx.fillStyle = sky;
    ctx.fillRect(clipLeft, 0, clipRight - clipLeft, CANVAS_HEIGHT);

    if (panel.id === 'opening' || panel.id === 'ravine-bridge') {
      const sunX = panel.id === 'opening' ? at(250) : at(170);
      const sunY = 102 + wave;
      const glow = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 250);
      glow.addColorStop(0, 'rgba(255, 226, 142, 0.72)');
      glow.addColorStop(0.2, 'rgba(247, 181, 82, 0.24)');
      glow.addColorStop(1, 'rgba(247, 181, 82, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(clipLeft, 0, clipRight - clipLeft, CANVAS_HEIGHT);
      ctx.fillStyle = 'rgba(255, 236, 169, 0.86)';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    const haze = ctx.createLinearGradient(0, panel.horizonY - 70, 0, panel.horizonY + 90);
    haze.addColorStop(0, 'rgba(245, 196, 104, 0)');
    haze.addColorStop(0.45, 'rgba(245, 196, 104, 0.18)');
    haze.addColorStop(1, 'rgba(245, 196, 104, 0)');
    ctx.fillStyle = haze;
    ctx.fillRect(clipLeft, panel.horizonY - 80, clipRight - clipLeft, 180);
  } else if (layer.role === 'far') {
    drawDuneBand(322, 18, '#9a733f', 0.28, 0.5);
    drawDuneBand(365, 24, '#8b6236', 0.32, 1.3);
    const farBase = panel.horizonY + 102;
    [
      [at(120), farBase, 270, 135, 0.18],
      [at(panelSpan * 0.42), farBase + 6, 210, 96, 0.14],
      [at(panelSpan * 0.78), farBase + 2, 245, 112, 0.16],
    ].forEach(([x, y, width, height, alpha]) => {
      drawPyramid(x, y, width, height, '#d1a064', alpha);
    });
    if (panel.id === 'scribe-to-queen-gateway') {
      drawPyramid(at(panelSpan * 0.72), farBase + 18, 360, 164, '#bc874d', 0.2);
    }
  } else if (layer.role === 'mid') {
    drawDuneBand(448, 15, '#7c5731', 0.22, 2.2);
    const baseY = panel.groundY - 55;
    if (panel.id === 'opening') {
      drawPyramid(at(90), baseY + 4, 440, 250, '#b47a41', 0.62);
    } else if (panel.id === 'ravine-bridge') {
      const leftCliff = at(350);
      const rightCliff = at(panelSpan - 250);
      ctx.fillStyle = '#6d432a';
      ctx.beginPath();
      ctx.moveTo(leftCliff - 520, baseY - 12);
      ctx.lineTo(leftCliff + 250, baseY - 28);
      ctx.lineTo(leftCliff + 160, CANVAS_HEIGHT + 30);
      ctx.lineTo(leftCliff - 560, CANVAS_HEIGHT + 30);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#744a2d';
      ctx.beginPath();
      ctx.moveTo(rightCliff - 160, baseY - 36);
      ctx.lineTo(rightCliff + 620, baseY - 20);
      ctx.lineTo(rightCliff + 660, CANVAS_HEIGHT + 30);
      ctx.lineTo(rightCliff - 90, CANVAS_HEIGHT + 30);
      ctx.closePath();
      ctx.fill();
    } else {
      drawDuneBand(baseY + 18, 12, 'rgba(133, 89, 48, 0.2)', 1, panelIndex * 0.7);
      drawDuneBand(baseY + 48, 10, 'rgba(211, 143, 67, 0.14)', 1, panelIndex * 0.9);
    }
  } else if (layer.role === 'ground') {
    const ground = ctx.createLinearGradient(0, panel.groundY - 126, 0, CANVAS_HEIGHT);
    ground.addColorStop(0, 'rgba(197, 131, 59, 0.18)');
    ground.addColorStop(0.42, '#a56b34');
    ground.addColorStop(1, '#5b3823');
    ctx.fillStyle = ground;
    ctx.fillRect(clipLeft, panel.groundY - 116, clipRight - clipLeft, CANVAS_HEIGHT - panel.groundY + 116);

    if (panel.id === 'ravine-bridge') {
      const gapLeft = at(650);
      const gapRight = at(1590);
      const chasm = ctx.createLinearGradient(0, panel.groundY - 72, 0, CANVAS_HEIGHT);
      chasm.addColorStop(0, 'rgba(58, 31, 23, 0.72)');
      chasm.addColorStop(0.46, 'rgba(21, 19, 22, 0.94)');
      chasm.addColorStop(1, 'rgba(6, 8, 12, 0.98)');
      ctx.fillStyle = chasm;
      ctx.beginPath();
      ctx.moveTo(gapLeft, panel.groundY - 54);
      ctx.lineTo(gapRight, panel.groundY - 58);
      ctx.lineTo(gapRight + 128, CANVAS_HEIGHT + 30);
      ctx.lineTo(gapLeft - 126, CANVAS_HEIGHT + 30);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(16, 14, 16, 0.5)';
      ctx.fillRect(gapLeft + 120, panel.groundY - 36, Math.max(80, gapRight - gapLeft - 240), 110);
    } else {
      drawDuneBand(panel.groundY - 48, 12, 'rgba(218, 151, 73, 0.38)', 1, 1.6);
    }

    ctx.strokeStyle = 'rgba(255, 218, 142, 0.08)';
    ctx.lineWidth = 1.1;
    for (let line = 0; line < 7; line += 1) {
      const y = panel.groundY - 84 + line * 24;
      ctx.beginPath();
      for (let x = clipLeft - 80; x <= clipRight + 80; x += 80) {
        const ripple = Math.sin((x + cameraX * 0.23) * 0.015 + line + panelIndex) * 5;
        if (x === clipLeft - 80) ctx.moveTo(x, y + ripple);
        else ctx.lineTo(x, y + ripple);
      }
      ctx.stroke();
    }
  } else if (layer.role === 'foreground') {
    const haze = ctx.createLinearGradient(0, panel.groundY - 74, 0, CANVAS_HEIGHT);
    haze.addColorStop(0, 'rgba(232, 165, 91, 0)');
    haze.addColorStop(0.55, 'rgba(232, 165, 91, 0.16)');
    haze.addColorStop(1, 'rgba(86, 50, 29, 0.24)');
    ctx.fillStyle = haze;
    ctx.fillRect(clipLeft, panel.groundY - 90, clipRight - clipLeft, CANVAS_HEIGHT - panel.groundY + 90);

    for (let i = 0; i < 18; i += 1) {
      const x = at((i * 173 + panelIndex * 91) % Math.max(panelSpan, 1));
      const y = panel.groundY - 22 + Math.sin(i * 1.7 + panelIndex) * 14;
      ctx.fillStyle = i % 4 === 0 ? 'rgba(66, 42, 27, 0.24)' : 'rgba(189, 119, 55, 0.2)';
      ctx.beginPath();
      ctx.ellipse(x, y, 10 + (i % 5) * 3, 3 + (i % 3), -0.08 * i, 0, Math.PI * 2);
      ctx.fill();
    }

    if (panel.id === 'ravine-bridge') {
      const center = at(1120);
      const shadow = ctx.createRadialGradient(center, panel.groundY - 20, 40, center, panel.groundY + 40, 460);
      shadow.addColorStop(0, 'rgba(6, 7, 10, 0.72)');
      shadow.addColorStop(0.45, 'rgba(20, 16, 17, 0.44)');
      shadow.addColorStop(1, 'rgba(20, 16, 17, 0)');
      ctx.fillStyle = shadow;
      ctx.fillRect(center - 560, panel.groundY - 130, 1120, 300);
    }
  }

  ctx.restore();
  return true;
}

export function drawDesertJourneyTransitionMaskFrame(ctx, transition, cameraX, now, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
  } = deps;
  const x = transition.worldX - cameraX;
  if (x + transition.width / 2 < -80 || x - transition.width / 2 > CANVAS_WIDTH + 80) return false;
  const w = transition.width;
  const left = x - w / 2;
  const shimmer = Math.sin(now / 1200 + transition.worldX * 0.002) * 5;

  ctx.save();
  if (transition.mask === 'dust-haze' || transition.mask === 'sandstorm-overlay') {
    const dust = ctx.createLinearGradient(left, 0, left + w, 0);
    dust.addColorStop(0, 'rgba(226, 159, 82, 0)');
    dust.addColorStop(0.4, 'rgba(226, 159, 82, 0.48)');
    dust.addColorStop(0.54, 'rgba(246, 204, 127, 0.42)');
    dust.addColorStop(0.68, 'rgba(245, 205, 128, 0.34)');
    dust.addColorStop(1, 'rgba(226, 159, 82, 0)');
    ctx.fillStyle = dust;
    ctx.fillRect(left, 0, w, CANVAS_HEIGHT);
  } else if (transition.mask === 'cliff-wall') {
    const rock = ctx.createLinearGradient(left, 0, left + w, 0);
    rock.addColorStop(0, 'rgba(55, 34, 25, 0)');
    rock.addColorStop(0.42, 'rgba(83, 50, 31, 0.78)');
    rock.addColorStop(0.58, 'rgba(121, 78, 42, 0.7)');
    rock.addColorStop(1, 'rgba(55, 34, 25, 0)');
    ctx.fillStyle = rock;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.16, 270);
    ctx.lineTo(x + w * 0.12, 248 + shimmer);
    ctx.lineTo(x + w * 0.26, CANVAS_HEIGHT + 20);
    ctx.lineTo(x - w * 0.3, CANVAS_HEIGHT + 20);
    ctx.closePath();
    ctx.fill();
  } else if (transition.mask === 'broken-pillar') {
    ctx.fillStyle = 'rgba(96, 61, 35, 0.78)';
    ctx.fillRect(x - 32, 276 + shimmer, 64, 318);
    ctx.fillRect(x - 58, 264 + shimmer, 116, 20);
    ctx.fillStyle = 'rgba(176, 112, 55, 0.24)';
    ctx.fillRect(x - 18, 290 + shimmer, 12, 286);
    ctx.fillRect(x + 14, 286 + shimmer, 9, 292);
  } else if (transition.mask === 'temple-doorway') {
    const floorShadow = ctx.createRadialGradient(x, 556, 18, x, 558, 188);
    floorShadow.addColorStop(0, 'rgba(31, 22, 17, 0.28)');
    floorShadow.addColorStop(0.48, 'rgba(61, 40, 25, 0.14)');
    floorShadow.addColorStop(1, 'rgba(168, 102, 45, 0)');
    ctx.fillStyle = floorShadow;
    ctx.fillRect(x - 220, 478, 440, 132);

    const doorwayShade = ctx.createLinearGradient(x - 62, 0, x + 62, 0);
    doorwayShade.addColorStop(0, 'rgba(24, 18, 16, 0.06)');
    doorwayShade.addColorStop(0.5, 'rgba(18, 15, 14, 0.3)');
    doorwayShade.addColorStop(1, 'rgba(24, 18, 16, 0.06)');
    ctx.fillStyle = doorwayShade;
    ctx.fillRect(x - 62, 304, 124, 230);

    ctx.fillStyle = 'rgba(103, 67, 39, 0.52)';
    ctx.fillRect(x - 108, 268 + shimmer, 44, 292);
    ctx.fillRect(x + 64, 268 + shimmer, 44, 292);
    ctx.fillRect(x - 112, 250 + shimmer, 224, 30);
    ctx.fillStyle = 'rgba(197, 130, 62, 0.16)';
    ctx.fillRect(x - 94, 282 + shimmer, 8, 258);
    ctx.fillRect(x + 82, 282 + shimmer, 8, 258);
  } else if (transition.mask === 'ruined-arch') {
    ctx.strokeStyle = 'rgba(92, 59, 35, 0.78)';
    ctx.lineWidth = 42;
    ctx.beginPath();
    ctx.arc(x, 452, 138, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = 'rgba(84, 55, 35, 0.62)';
    ctx.fillRect(x - 168, 420, 56, 190);
    ctx.fillRect(x + 112, 420, 56, 190);
  } else if (transition.mask === 'shadowed-corridor') {
    const corridor = ctx.createLinearGradient(left, 0, left + w, 0);
    corridor.addColorStop(0, 'rgba(38, 27, 25, 0)');
    corridor.addColorStop(0.36, 'rgba(30, 22, 24, 0.5)');
    corridor.addColorStop(0.62, 'rgba(92, 60, 39, 0.4)');
    corridor.addColorStop(1, 'rgba(38, 27, 25, 0)');
    ctx.fillStyle = corridor;
    ctx.fillRect(left, 188, w, CANVAS_HEIGHT - 188);
    ctx.fillStyle = 'rgba(236, 181, 101, 0.18)';
    for (let i = 0; i < 14; i += 1) {
      const px = left + ((i * 71 + now * 0.012) % w);
      ctx.beginPath();
      ctx.ellipse(px, 310 + i * 19, 10 + (i % 3) * 4, 2.5, -0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  return true;
}

export function drawDesertJourneyScenePanelsFrame(ctx, current, cameraX, now, deps) {
  const {
    CANVAS_WIDTH,
    DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION,
    DESERT_JOURNEY_LAYER_ROLES,
    getDesertJourneyPanelsForViewport,
  } = deps;
  const panels = getDesertJourneyPanelsForViewport(cameraX, CANVAS_WIDTH, 160);
  if (panels.length === 0) return false;

  let layerDrawCount = 0;
  DESERT_JOURNEY_LAYER_ROLES.forEach((role) => {
    panels.forEach((panel) => {
      const layer = panel.layers.find(item => item.role === role);
      if (layer && drawDesertJourneyPanelLayerFrame(ctx, panel, layer, cameraX, now, deps)) {
        layerDrawCount += 1;
      }
    });
  });

  if (current.renderStats) {
    current.renderStats.desertJourneyBackgroundSystemVersion = DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION;
    current.renderStats.desertJourneyPanelIds = panels.map(panel => panel.id);
    current.renderStats.desertJourneyLayerRoles = DESERT_JOURNEY_LAYER_ROLES;
    current.renderStats.desertJourneyLayerDrawCount = layerDrawCount;
  }

  return layerDrawCount > 0;
}

export function drawDesertJourneySceneMasksFrame(ctx, current, cameraX, now, deps) {
  const {
    CANVAS_WIDTH,
    getDesertJourneyTransitionMasksForViewport,
  } = deps;
  const masks = getDesertJourneyTransitionMasksForViewport(cameraX, CANVAS_WIDTH, 220);
  const drawnMasks = masks.filter(mask => drawDesertJourneyTransitionMaskFrame(ctx, mask, cameraX, now, deps));

  if (current.renderStats) {
    current.renderStats.desertJourneyTransitionMasks = drawnMasks.map(mask => mask.mask);
  }

  return drawnMasks.length > 0;
}

export function drawSectionTransitionBlendFrame(ctx, cameraX, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GROUND_Y,
    SECTIONS,
    drawGroundDustLip,
    getSectionForX,
  } = deps;
  SECTIONS.slice(1).forEach((section) => {
    const x = section.start - cameraX;
    if (x < -140 || x > CANVAS_WIDTH + 140) return;
    const previousSection = getSectionForX(section.start - 1);
    const fromColor = previousSection.id === 'catacombs'
      ? 'rgba(55, 42, 30, 0.34)'
      : previousSection.id === 'escape-sequence'
        ? 'rgba(126, 74, 35, 0.3)'
        : 'rgba(177, 115, 54, 0.24)';
    const toColor = section.id === 'catacombs'
      ? 'rgba(55, 42, 30, 0.34)'
      : section.id === 'escape-sequence'
        ? 'rgba(126, 74, 35, 0.3)'
        : 'rgba(177, 115, 54, 0.24)';
    const gradient = ctx.createLinearGradient(x - 92, 0, x + 92, 0);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.35, fromColor);
    gradient.addColorStop(0.65, toColor);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 96, GROUND_Y - 18, 192, CANVAS_HEIGHT - GROUND_Y + 28);
    drawGroundDustLip(ctx, x, GROUND_Y + 2, 150, 'rgba(216, 154, 82, 0.22)');
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = section.id === 'catacombs' ? '#5b4630' : '#b87835';
    ctx.beginPath();
    ctx.ellipse(x - 28, GROUND_Y + 3, 34, 5, -0.12, 0, Math.PI * 2);
    ctx.ellipse(x + 36, GROUND_Y + 4, 42, 6, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
