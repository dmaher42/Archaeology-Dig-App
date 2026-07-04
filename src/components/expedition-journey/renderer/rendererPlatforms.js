export function drawBuriedStoneCausewaySurfaceFrame(ctx, platform, x, cameraX, now, deps) {
  const {
    DESERT_ENTRY_BACKGROUND_ART_VERSION,
    GROUND_Y,
    ROUTE_GROUND_VISUAL_MODE,
    getSectionForX,
    stateRef,
  } = deps;
  const section = getSectionForX(platform.x);
  if (section.id !== 'desert-entry' || platform.y !== GROUND_Y) return false;
  void ctx;
  void x;
  void cameraX;
  void now;

  if (stateRef.current.renderStats) {
    stateRef.current.renderStats.desertGroundPngAssetLoaded = false;
    stateRef.current.renderStats.desertEntryBackgroundArtVersion = DESERT_ENTRY_BACKGROUND_ART_VERSION;
    stateRef.current.renderStats.desertEntryCausewayVisualMode = ROUTE_GROUND_VISUAL_MODE;
    stateRef.current.renderStats.desertEntryPlayableGroundPlane = 'integrated-background-painted-route-v1';
    stateRef.current.renderStats.desertEntryGroundBodyFill = 'painted-into-background-no-separate-floor-strip';
    stateRef.current.renderStats.desertEntryForegroundEdgeBlend = 'retired-separate-rubble-mask-strip';
    stateRef.current.renderStats.desertEntryCollisionGroundY = GROUND_Y;
  }
  return true;
}

export function drawDesertEntryGroundMotionCuesFrame(ctx, player, cameraX, now, deps) {
  const {
    clamp,
    drawGroundDustLip,
    getDesertEntryGroundContactActive,
    getDesertEntryVisualGroundOffsetY,
    stateRef,
    worldToScreenX,
  } = deps;
  if (!player || typeof getDesertEntryGroundContactActive !== 'function') return false;
  void now;
  const footY = player.y + player.height;
  const footX = player.x + player.width / 2;
  const contactActive = getDesertEntryGroundContactActive(footX, footY);
  const offsetY = typeof getDesertEntryVisualGroundOffsetY === 'function'
    ? getDesertEntryVisualGroundOffsetY(footX, footY)
    : 0;
  const speed = Math.abs(player.vx || 0);
  if (!contactActive || speed < 45) return false;

  const renderFootY = footY + offsetY;
  const direction = player.vx >= 0 ? -1 : 1;
  const screenX = worldToScreenX(footX, cameraX);
  const runAmount = clamp((speed - 45) / 220, 0, 1);
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  if (typeof drawGroundDustLip === 'function') {
    drawGroundDustLip(
      ctx,
      screenX - direction * 16,
      renderFootY + 4,
      54 + runAmount * 20,
      `rgba(222, 151, 67, ${0.16 + runAmount * 0.1})`,
    );
  }
  const contactShadow = ctx.createRadialGradient(screenX, renderFootY + 4, 4, screenX, renderFootY + 6, 64 + runAmount * 18);
  contactShadow.addColorStop(0, `rgba(41, 22, 8, ${0.12 + runAmount * 0.08})`);
  contactShadow.addColorStop(0.42, `rgba(82, 46, 18, ${0.08 + runAmount * 0.04})`);
  contactShadow.addColorStop(1, 'rgba(82, 46, 18, 0)');
  ctx.fillStyle = contactShadow;
  ctx.beginPath();
  ctx.ellipse(screenX - direction * 14, renderFootY + 6, 54 + runAmount * 18, 6.5, -0.04 * direction, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.13 + runAmount * 0.1;
  ctx.fillStyle = 'rgba(232, 169, 86, 0.58)';
  for (let index = 0; index < 4; index += 1) {
    const seed = index * 41 + Math.round(player.x * 0.055);
    const chipX = screenX - direction * (14 + index * 12) + Math.sin(seed) * 3;
    const chipY = renderFootY + 4 + (index % 2) * 3;
    const chipW = 5 + (seed % 4);
    ctx.beginPath();
    ctx.ellipse(chipX, chipY, chipW, 1.2 + runAmount * 0.55, -0.08 * direction, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  if (stateRef.current.renderStats) {
    stateRef.current.renderStats.desertEntryPlayerFootAnchor = 'warm-plaza-contact-shadow-v1';
  }
  return true;
}

export function drawAncientRouteGroundFrame(ctx, section, cameraX, now, current, deps) {
  const {
    CANVAS_WIDTH,
    GROUND_Y,
    PLATFORMS,
    ROUTE_GROUND_HAZE_FIX_VERSION,
    ROUTE_GROUND_VISUAL_MODE,
    drawRouteGroundApron,
    getRenderableCheckpoints,
    isHorizontallyVisible,
    isPlatformAvailable,
    worldToScreenX,
  } = deps;
  const isCatacombs = section.id === 'catacombs';
  const floorBandTop = GROUND_Y - (isCatacombs ? 18 : 20);
  ctx.save();
  if (section.id !== 'desert-entry') {
    ctx.globalAlpha = 0.46;
    ctx.strokeStyle = isCatacombs ? 'rgba(160, 128, 86, 0.22)' : 'rgba(255, 205, 123, 0.24)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let sx = -12; sx <= CANVAS_WIDTH + 12; sx += 36) {
      const worldX = cameraX + sx;
      const y = floorBandTop + 5 + Math.sin(worldX * 0.01) * 2;
      if (sx === -12) ctx.moveTo(sx, y);
      else ctx.lineTo(sx, y);
    }
    ctx.stroke();
  }

  const sectionStart = Math.max(section.start, cameraX - 160);
  const sectionEnd = Math.min(section.end, cameraX + CANVAS_WIDTH + 160);
  const firstStone = Math.floor(sectionStart / 96) * 96;
  if (section.id !== 'desert-entry') {
    for (let worldX = firstStone; worldX <= sectionEnd; worldX += 96) {
      const sx = worldToScreenX(worldX, cameraX);
      const seed = Math.abs(Math.sin(worldX * 0.037)) * 100;
      const stoneY = GROUND_Y - 13 + Math.sin(worldX * 0.017 + now / 2800) * 2;
      const stoneWidth = 28 + (seed % 18);
      ctx.globalAlpha = 0.12 + (seed % 4) * 0.018;
      ctx.fillStyle = isCatacombs ? '#8a6b49' : '#b77a3a';
      ctx.beginPath();
      ctx.roundRect(sx - stoneWidth / 2, stoneY, stoneWidth, 6 + (seed % 5), 3);
      ctx.fill();
    }
  }

  if (section.id !== 'desert-entry') {
    const blendPoints = [
      ...getRenderableCheckpoints().map((checkpoint) => ({ x: checkpoint.x, width: 210, kind: 'checkpoint' })),
      ...PLATFORMS
        .filter((platform) => platform.y !== GROUND_Y && isPlatformAvailable(platform, current))
        .map((platform) => ({ x: platform.x + platform.width / 2, width: Math.min(220, platform.width * 1.35), kind: 'platform' })),
    ];
    blendPoints.forEach((item) => {
      if (!isHorizontallyVisible(item.x - item.width / 2, item.width, cameraX, 80)) return;
      const sx = worldToScreenX(item.x, cameraX);
      drawRouteGroundApron(ctx, sx, GROUND_Y - 3, item.width, section.id, item.kind === 'checkpoint' ? 0.82 : 0.56, Math.round(item.x));
    });
  }

  if (current.renderStats) {
    current.renderStats.routeGroundVisualMode = ROUTE_GROUND_VISUAL_MODE;
    current.renderStats.routeGroundHazeFixVersion = ROUTE_GROUND_HAZE_FIX_VERSION;
    if (section.id === 'desert-entry') current.renderStats.desertGroundStyle = 'integrated-background-painted-route';
  }
  ctx.restore();
}

export function drawOpeningPyramidAssetRegionFrame(ctx, regionKey, dest, options = {}, deps) {
  const {
    OPENING_PYRAMID_ASSET_REGIONS,
    openingPyramidClimbPackRef,
  } = deps;
  const pack = openingPyramidClimbPackRef.current;
  const region = OPENING_PYRAMID_ASSET_REGIONS[regionKey];
  if (!pack.loaded || !pack.image || !region) return false;
  const alpha = options.alpha ?? 1;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (options.filter) ctx.filter = options.filter;
  if (options.flipX) {
    ctx.translate(dest.x + dest.width / 2, dest.y + dest.height / 2);
    ctx.scale(-1, 1);
    ctx.drawImage(pack.image, region.x, region.y, region.w, region.h, -dest.width / 2, -dest.height / 2, dest.width, dest.height);
  } else {
    ctx.drawImage(pack.image, region.x, region.y, region.w, region.h, dest.x, dest.y, dest.width, dest.height);
  }
  ctx.restore();
  return true;
}

export function drawDesertEntryPlatformSupportFrame(ctx, platform, screenX, visualY, visualHeight, reactiveActive = false, deps) {
  const {
    GROUND_Y,
    openingPyramidClimbPackRef,
    scaleJourneyX,
  } = deps;
    const topY = visualY + visualHeight - 4;
    if (topY >= GROUND_Y - 10) return;

    const centerX = screenX + platform.width / 2;
    const openingSetPiece = platform.x < scaleJourneyX(720);
    const compactOpeningSupport = openingSetPiece && (
      platform.width <= 170
      || platform.label?.includes('return')
      || platform.label?.includes('recovery')
    );
    const floatingOpeningSupport = openingSetPiece && topY < GROUND_Y - 150;
    const supportBottom = openingSetPiece
      ? Math.min(GROUND_Y - 8, topY + (floatingOpeningSupport ? 82 : 118))
      : Math.min(GROUND_Y - 18, topY + 34);
    const supportHeight = Math.max(28, supportBottom - topY);
    const columnCount = compactOpeningSupport ? 1 : openingSetPiece ? (platform.width >= 250 ? 3 : platform.width >= 160 ? 2 : 1) : 1;
    const columnWidth = compactOpeningSupport ? 26 : openingSetPiece ? 38 : 18;
    const baseAlpha = compactOpeningSupport ? 0.42 : openingSetPiece ? 0.58 : 0.28;
    const blockHeight = compactOpeningSupport ? 16 : openingSetPiece ? 18 : 14;

    ctx.save();
    ctx.globalAlpha = baseAlpha;
    if (openingSetPiece && openingPyramidClimbPackRef.current.loaded) {
      ctx.restore();
      return;
    }

    if (!openingSetPiece) {
      const backShadow = ctx.createLinearGradient(0, topY, 0, supportBottom);
      backShadow.addColorStop(0, 'rgba(55, 31, 14, 0.18)');
      backShadow.addColorStop(1, 'rgba(95, 55, 24, 0)');
      ctx.fillStyle = backShadow;
      ctx.beginPath();
      ctx.moveTo(screenX + platform.width * 0.2, topY + 2);
      ctx.lineTo(screenX + platform.width * 0.8, topY + 2);
      ctx.lineTo(screenX + platform.width * 0.62, supportBottom + 4);
      ctx.lineTo(screenX + platform.width * 0.38, supportBottom + 4);
      ctx.closePath();
      ctx.fill();
    }

    for (let index = 0; index < columnCount; index += 1) {
      const t = columnCount === 1 ? 0.5 : index / (columnCount - 1);
      const columnX = screenX + platform.width * (0.18 + t * 0.64);
      const lean = Math.sin(platform.x * 0.01 + index) * 4;
      const columnTop = topY + (compactOpeningSupport ? 12 : openingSetPiece ? 8 : 4) + (index % 2) * 5;
      const columnBottom = supportBottom;
      const columnHeight = Math.max(22, columnBottom - columnTop);
      if (openingSetPiece && openingPyramidClimbPackRef.current.loaded) {
        const columnRegion = index % 2 ? 'paintedColumn' : 'carvedColumn';
        drawOpeningPyramidAssetRegionFrame(ctx, columnRegion, {
          x: columnX - columnWidth / 2 + lean - 12,
          y: columnTop - 9,
          width: columnWidth + 24,
          height: columnHeight + 15,
        }, { alpha: compactOpeningSupport ? 0.34 : 0.46, filter: 'sepia(8%) saturate(84%) brightness(84%) contrast(92%)' }, deps);
        continue;
      }
      const columnGradient = ctx.createLinearGradient(0, columnTop, 0, columnBottom);
      columnGradient.addColorStop(0, openingSetPiece ? 'rgb(184, 118, 57)' : 'rgb(157, 98, 46)');
      columnGradient.addColorStop(0.48, openingSetPiece ? 'rgb(126, 74, 34)' : 'rgb(113, 67, 31)');
      columnGradient.addColorStop(1, openingSetPiece ? 'rgb(70, 39, 17)' : 'rgb(74, 42, 19)');

      ctx.fillStyle = columnGradient;
      ctx.strokeStyle = openingSetPiece ? 'rgba(42, 24, 10, 0.62)' : 'rgba(51, 30, 14, 0.44)';
      ctx.lineWidth = openingSetPiece ? 2 : 1.5;
      ctx.beginPath();
      const left = columnX - columnWidth / 2 + lean;
      if (openingSetPiece) {
        ctx.moveTo(left + 5, columnTop);
        ctx.lineTo(left + columnWidth - 5, columnTop);
        ctx.lineTo(left + columnWidth - 1, columnBottom);
        ctx.lineTo(left + 1, columnBottom);
        ctx.closePath();
      } else {
        ctx.roundRect(left, columnTop, columnWidth, columnHeight, 5);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = compactOpeningSupport ? 'rgba(238, 171, 86, 0.46)' : openingSetPiece ? 'rgba(238, 171, 86, 0.82)' : 'rgba(229, 158, 75, 0.62)';
      ctx.fillRect(left - 10, columnTop - 7, columnWidth + 20, compactOpeningSupport ? 8 : openingSetPiece ? 12 : 9);
      ctx.fillStyle = openingSetPiece ? 'rgba(92, 52, 22, 0.72)' : 'rgba(57, 31, 13, 0.42)';
      ctx.fillRect(left - 12, columnBottom - 8, columnWidth + 24, compactOpeningSupport ? 7 : openingSetPiece ? 10 : 8);
      ctx.fillStyle = openingSetPiece ? 'rgba(37, 21, 9, 0.28)' : 'rgba(38, 22, 10, 0.2)';
      ctx.fillRect(left + columnWidth * 0.58, columnTop + 4, columnWidth * 0.35, Math.max(18, columnHeight - 10));
      ctx.strokeStyle = openingSetPiece ? 'rgba(255, 216, 139, 0.22)' : 'rgba(255, 207, 128, 0.14)';
      ctx.beginPath();
      ctx.moveTo(left + 7, columnTop + 7);
      ctx.lineTo(left + 7, columnBottom - 10);
      ctx.stroke();

      if (openingSetPiece && !compactOpeningSupport) {
        ctx.fillStyle = 'rgba(22, 118, 126, 0.2)';
        ctx.fillRect(left + 5, columnTop + 17, columnWidth - 10, 5);
        ctx.fillStyle = 'rgba(183, 73, 39, 0.16)';
        ctx.fillRect(left + 6, columnTop + 26, columnWidth - 12, 4);
      }

      ctx.strokeStyle = openingSetPiece ? 'rgba(246, 197, 115, 0.28)' : 'rgba(238, 183, 101, 0.22)';
      ctx.lineWidth = 1;
      for (let y = columnTop + blockHeight; y < columnBottom - 8; y += blockHeight) {
        ctx.beginPath();
        ctx.moveTo(left + 5, y);
        ctx.lineTo(left + columnWidth - 5, y + Math.sin(y * 0.08 + index) * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(left + columnWidth * (index % 2 ? 0.42 : 0.58), y - blockHeight + 4);
        ctx.lineTo(left + columnWidth * (index % 2 ? 0.36 : 0.64), y - 4);
        ctx.stroke();
      }
    }

    if (platform.width >= 180 && !openingSetPiece && supportHeight > 54) {
      const wallTop = Math.min(supportBottom - 42, topY + supportHeight * 0.52);
      const wallHeight = Math.max(28, supportBottom - wallTop - 2);
      const wallWidth = platform.width * 0.52;
      const wallX = centerX - wallWidth / 2 + Math.sin(platform.x * 0.004) * 14;
      ctx.globalAlpha = baseAlpha * 0.82;
      const wallGradient = ctx.createLinearGradient(0, wallTop, 0, supportBottom);
      wallGradient.addColorStop(0, 'rgba(131, 78, 35, 0.82)');
      wallGradient.addColorStop(1, 'rgba(64, 36, 16, 0.7)');
      ctx.fillStyle = wallGradient;
      ctx.beginPath();
      ctx.roundRect(wallX, wallTop, wallWidth, wallHeight, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(43, 24, 10, 0.48)';
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 185, 87, 0.14)';
      ctx.fillRect(wallX + 5, wallTop + 4, wallWidth * 0.42, 3);
      ctx.globalAlpha = baseAlpha * 0.62;
      ctx.strokeStyle = 'rgba(226, 162, 83, 0.24)';
      for (let rowY = wallTop + 12; rowY < wallTop + wallHeight - 4; rowY += 13) {
        ctx.beginPath();
        ctx.moveTo(wallX + 5, rowY);
        ctx.lineTo(wallX + wallWidth - 5, rowY + Math.sin(rowY * 0.09) * 1.5);
        ctx.stroke();
        ctx.beginPath();
        const jointX = wallX + wallWidth * (0.32 + 0.2 * Math.sin(rowY * 0.13));
        ctx.moveTo(jointX, rowY - 10);
        ctx.lineTo(jointX + Math.sin(rowY * 0.21) * 6, rowY - 1);
        ctx.stroke();
      }
    }

    if (reactiveActive) {
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = 'rgba(137, 104, 72, 0.34)';
      ctx.beginPath();
      ctx.ellipse(centerX, topY + 18, platform.width * 0.42, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
}

export function drawDesertOpeningPlatformFaceFrame(ctx, platform, x, visualY, visualHeight, reactiveActive = false, deps) {
  const {
    openingPyramidClimbPackRef,
    openingPyramidFacadeRef,
    scaleJourneyX,
  } = deps;
    const isOpeningPlatform = platform.x < scaleJourneyX(720);
    if (!isOpeningPlatform) return;

    const topY = visualY;
    const bottomY = visualY + visualHeight;
    const capHeight = Math.min(16, Math.max(9, visualHeight * 0.52));
    const blockCount = Math.max(3, Math.round(platform.width / 58));
    const blockWidth = platform.width / blockCount;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    if (openingPyramidFacadeRef.current.loaded) {
      const hiddenFacadeTread = /stair tread|stair helper|pressure stair slab|cracked summit trap slab/i.test(platform.label || '');
      if (hiddenFacadeTread) {
        ctx.restore();
        return;
      }
      ctx.globalAlpha = reactiveActive ? 0.62 : 0.16;
      const edgeGradient = ctx.createLinearGradient(0, topY - 3, 0, topY + 9);
      edgeGradient.addColorStop(0, 'rgba(255, 225, 145, 0.38)');
      edgeGradient.addColorStop(0.55, 'rgba(159, 92, 35, 0.16)');
      edgeGradient.addColorStop(1, 'rgba(53, 30, 12, 0)');
      ctx.fillStyle = edgeGradient;
      ctx.fillRect(x + 12, topY - 2, platform.width - 24, 8);
      ctx.strokeStyle = reactiveActive ? 'rgba(255, 202, 138, 0.58)' : 'rgba(255, 222, 154, 0.18)';
      ctx.lineWidth = reactiveActive ? 2 : 1.4;
      if (reactiveActive) ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.moveTo(x + 18, topY + 1);
      ctx.lineTo(x + platform.width - 18, topY + 1);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }

    const sourceKey = platform.reactive
      ? 'trapSlab'
      : platform.label?.includes('summit')
        ? 'terraceWall'
        : platform.label?.includes('base')
          ? 'crackedBlock'
          : 'terraceWall';
    if (openingPyramidClimbPackRef.current.loaded) {
      const embeddedAlpha = platform.label?.includes('summit')
        ? 0.94
        : platform.reactive
          ? 0.88
          : 0.78;
      drawOpeningPyramidAssetRegionFrame(ctx, sourceKey, {
        x: x - 4,
        y: topY - 7,
        width: platform.width + 8,
        height: Math.max(36, visualHeight + 13),
      }, {
        alpha: reactiveActive ? Math.min(1, embeddedAlpha + 0.08) : embeddedAlpha,
        filter: reactiveActive ? 'saturate(112%) brightness(108%)' : 'sepia(6%) saturate(96%) brightness(94%) contrast(98%)',
      }, deps);
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(99, 55, 24, 0.18)';
      ctx.fillRect(x, topY + 8, platform.width, Math.max(9, visualHeight - 7));
      ctx.restore();
      if (reactiveActive) {
        ctx.strokeStyle = 'rgba(255, 202, 138, 0.46)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 7]);
        ctx.beginPath();
        ctx.moveTo(x + 12, topY + 18);
        ctx.lineTo(x + platform.width - 12, topY + 24);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
      return;
    }

    const faceGradient = ctx.createLinearGradient(0, topY, 0, bottomY);
    faceGradient.addColorStop(0, 'rgba(205, 141, 69, 0.24)');
    faceGradient.addColorStop(0.42, 'rgba(104, 60, 27, 0.22)');
    faceGradient.addColorStop(1, 'rgba(37, 22, 10, 0.42)');
    ctx.fillStyle = faceGradient;
    ctx.fillRect(x - 2, topY, platform.width + 4, visualHeight);

    const capGradient = ctx.createLinearGradient(0, topY - 3, 0, topY + capHeight);
    capGradient.addColorStop(0, 'rgba(255, 222, 150, 0.52)');
    capGradient.addColorStop(0.5, 'rgba(196, 125, 55, 0.32)');
    capGradient.addColorStop(1, 'rgba(85, 49, 22, 0.22)');
    ctx.fillStyle = capGradient;
    ctx.fillRect(x - 4, topY - 1, platform.width + 8, capHeight);

    ctx.strokeStyle = 'rgba(45, 25, 10, 0.46)';
    ctx.lineWidth = 1.4;
    for (let index = 1; index < blockCount; index += 1) {
      const jointX = x + index * blockWidth + Math.sin(platform.x * 0.04 + index) * 4;
      ctx.beginPath();
      ctx.moveTo(jointX, topY + 3);
      ctx.lineTo(jointX + Math.sin(index) * 4, bottomY - 5);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(247, 199, 118, 0.22)';
    ctx.lineWidth = 1;
    for (let rowY = topY + capHeight + 7; rowY < bottomY - 4; rowY += 11) {
      ctx.beginPath();
      ctx.moveTo(x + 8, rowY);
      ctx.lineTo(x + platform.width - 8, rowY + Math.sin(rowY * 0.08 + platform.x) * 1.4);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(27, 16, 7, 0.36)';
    ctx.fillRect(x + 5, bottomY - 7, platform.width - 10, 7);
    ctx.strokeStyle = 'rgba(255, 226, 156, 0.34)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 8, topY + 2);
    ctx.lineTo(x + platform.width - 8, topY + 2);
    ctx.stroke();

    if (reactiveActive) {
      ctx.strokeStyle = 'rgba(255, 202, 138, 0.46)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.moveTo(x + 12, topY + capHeight + 5);
      ctx.lineTo(x + platform.width - 12, topY + capHeight + 9);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
}

function drawDesertEntryInvisibleLedgeCueFrame(ctx, platform, screenX, deps) {
  const {
    GROUND_Y,
    openingPyramidClimbPackRef,
  } = deps;
  const visibleLedgeIds = new Set([
    'desert-entry-platform-6',
    'desert-entry-platform-7',
    'desert-entry-platform-8',
    'desert-entry-platform-11',
  ]);
  if (!visibleLedgeIds.has(platform.id)) return false;

  const topY = platform.y;
  const width = Math.max(48, platform.width);
  const height = Math.max(14, platform.height);
  const ledgeCueStyles = {
    'desert-entry-platform-6': { topAlpha: 0.76, underhangAlpha: 0.18, rubbleAlpha: 0.1, underhangHeight: 8, shadowAlpha: 0.14 },
    'desert-entry-platform-7': { topAlpha: 0.76, underhangAlpha: 0.2, rubbleAlpha: 0.12, underhangHeight: 10, shadowAlpha: 0.15 },
    'desert-entry-platform-8': { topAlpha: 0.74, underhangAlpha: 0.22, rubbleAlpha: 0.14, underhangHeight: 10, shadowAlpha: 0.16 },
    'desert-entry-platform-11': { topAlpha: 0.64, underhangAlpha: 0.08, rubbleAlpha: 0.04, underhangHeight: 6, shadowAlpha: 0.1 },
  };
  const cueStyle = ledgeCueStyles[platform.id] || {};
  const underhangHeight = cueStyle.underhangHeight ?? Math.max(24, Math.min(42, height + 18));
  const underhangY = topY + height - 1;
  const rubbleY = underhangY + underhangHeight - 5;
  const shadowY = Math.min(GROUND_Y - 10, rubbleY + 22);

  ctx.save();

  const rasterAssetsReady = Boolean(openingPyramidClimbPackRef.current.loaded && openingPyramidClimbPackRef.current.image);
  const shadow = ctx.createRadialGradient(
    screenX + width / 2,
    shadowY,
    Math.max(10, width * 0.12),
    screenX + width / 2,
    shadowY,
    Math.max(44, width * 0.55),
  );
  shadow.addColorStop(0, `rgba(28, 17, 9, ${cueStyle.shadowAlpha ?? 0.22})`);
  shadow.addColorStop(1, 'rgba(28, 17, 9, 0)');
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(screenX + width / 2, shadowY, Math.max(44, width * 0.58), 12, 0, 0, Math.PI * 2);
  ctx.fill();

  if (rasterAssetsReady) {
    drawOpeningPyramidAssetRegionFrame(ctx, 'crackedBlock', {
      x: screenX - 4,
      y: underhangY,
      width: width + 8,
      height: underhangHeight,
    }, {
      alpha: cueStyle.underhangAlpha ?? 0.82,
      filter: 'sepia(10%) saturate(82%) brightness(62%) contrast(116%)',
      flipX: platform.id === 'desert-entry-platform-7' || platform.id === 'desert-entry-platform-11',
    }, deps);

    const rubbleCount = width > 138 ? 2 : 1;
    for (let index = 0; index < rubbleCount; index += 1) {
      const rubbleWidth = Math.min(56, Math.max(34, width * 0.3));
      const rubbleX = rubbleCount === 1
        ? screenX + width * 0.5 - rubbleWidth / 2
        : screenX + width * (index === 0 ? 0.22 : 0.72) - rubbleWidth / 2;
      drawOpeningPyramidAssetRegionFrame(ctx, 'crackedBlock', {
        x: rubbleX,
        y: rubbleY + (index % 2) * 3,
        width: rubbleWidth,
        height: 26,
      }, {
        alpha: cueStyle.rubbleAlpha ?? 0.62,
        filter: 'sepia(10%) saturate(82%) brightness(70%) contrast(110%)',
        flipX: index % 2 === 0,
      }, deps);
    }
  } else {
    const underhang = ctx.createLinearGradient(0, underhangY, 0, underhangY + underhangHeight);
    underhang.addColorStop(0, 'rgba(125, 84, 45, 0.7)');
    underhang.addColorStop(1, 'rgba(62, 38, 20, 0.46)');
    ctx.fillStyle = underhang;
    ctx.beginPath();
    ctx.roundRect(screenX - 3, underhangY, width + 6, underhangHeight, 4);
    ctx.fill();
  }

  if (rasterAssetsReady) {
    drawOpeningPyramidAssetRegionFrame(ctx, width > 138 ? 'crackedBlock' : 'trapSlab', {
      x: screenX - 6,
      y: topY - 8,
      width: width + 12,
      height: Math.max(34, height + 18),
    }, {
      alpha: cueStyle.topAlpha ?? 0.88,
      filter: 'sepia(10%) saturate(88%) brightness(78%) contrast(108%)',
    }, deps);
  } else {
    ctx.fillStyle = 'rgba(130, 83, 41, 0.48)';
    ctx.beginPath();
    ctx.roundRect(screenX, topY - 3, width, height + 10, 4);
    ctx.fill();
  }

  ctx.restore();
  return true;
}

export function drawLostBridgePlatformFrame(ctx, platform, x, visualY, visualHeight, reactiveActive, reactivePulse, unstableShift, deps) {
  const {
    JOURNEY_VERTICAL_OFFSET,
    LOST_BRIDGE_PIECE_TUNING,
    lostBridgeAssetsRef,
  } = deps;
    const w = platform.width;
    const seed = Math.round(platform.x);
    const isDeck = platform.y <= 140 + JOURNEY_VERTICAL_OFFSET;

    // Painted art path: draw the chroma-keyed cutout aligned to the platform rect. Falls back
    // to the code-drawn bridge below if the image has not loaded yet.
    const bridgeKey = platform.reactive
      ? 'timber'
      : platform.id === 'lost-bridge-near-landing'
        ? 'landing'
        : platform.id === 'lost-bridge-far-landing'
          ? 'pillar'
          : 'slab';
    const bridgeImage = lostBridgeAssetsRef.current?.images?.[bridgeKey];
    const bridgeTune = LOST_BRIDGE_PIECE_TUNING[bridgeKey];
    if (bridgeImage && bridgeImage.naturalWidth && bridgeTune) {
      const contentFrac = 1 - bridgeTune.padL - bridgeTune.padR;
      const drawW = w / contentFrac;
      const drawH = drawW * (bridgeImage.naturalHeight / bridgeImage.naturalWidth);
      const dx = x - bridgeTune.padL * drawW;
      const dy = visualY - bridgeTune.deckTopFrac * drawH;
      ctx.save();
      // Soft drop-shadow into the ravine beneath the piece.
      const sh = ctx.createLinearGradient(0, visualY + visualHeight, 0, visualY + visualHeight + 70);
      sh.addColorStop(0, 'rgba(14, 9, 5, 0.32)');
      sh.addColorStop(1, 'rgba(14, 9, 5, 0)');
      ctx.fillStyle = sh;
      ctx.fillRect(x - 6, visualY + visualHeight, w + 12, 70);
      ctx.drawImage(bridgeImage, dx, dy, drawW, drawH);
      if (reactiveActive) {
        ctx.fillStyle = `rgba(214, 150, 70, ${0.14 + reactivePulse * 0.12})`;
        ctx.fillRect(x, visualY - 2, w, 4);
      }
      ctx.restore();
      return;
    }

    ctx.save();

    // Drop-shadow / ravine darkness beneath the slab (sells the "deadly drop").
    const shadow = ctx.createLinearGradient(0, visualY + visualHeight, 0, visualY + visualHeight + 90);
    shadow.addColorStop(0, 'rgba(18, 11, 6, 0.42)');
    shadow.addColorStop(1, 'rgba(18, 11, 6, 0)');
    ctx.fillStyle = shadow;
    ctx.fillRect(x - 6, visualY + visualHeight, w + 12, 90);

    // Timber support struts hanging under the deck.
    if (isDeck) {
      ctx.strokeStyle = 'rgba(58, 38, 18, 0.5)';
      ctx.lineWidth = 4;
      for (let sx = x + 18; sx < x + w - 12; sx += 64) {
        const lean = ((seed + sx) % 7) - 3;
        ctx.beginPath();
        ctx.moveTo(sx, visualY + visualHeight - 2);
        ctx.lineTo(sx + lean, visualY + visualHeight + 26);
        ctx.stroke();
      }
      // A frayed rope of hanging debris.
      ctx.strokeStyle = 'rgba(92, 70, 40, 0.42)';
      ctx.lineWidth = 1.6;
      const ropeX = x + 10 + (seed % Math.max(20, w - 30));
      ctx.beginPath();
      ctx.moveTo(ropeX, visualY + visualHeight - 1);
      ctx.lineTo(ropeX + 2, visualY + visualHeight + 34);
      ctx.stroke();
    }

    // Stone slab body.
    ctx.fillStyle = reactiveActive ? '#7a5630' : '#83602f';
    ctx.fillRect(x, visualY, w, visualHeight);
    // Darker base / weathered underside.
    ctx.fillStyle = 'rgba(36, 22, 10, 0.5)';
    ctx.fillRect(x, visualY + visualHeight - 6, w, 6);
    // Lit top edge.
    ctx.fillStyle = 'rgba(247, 220, 158, 0.32)';
    ctx.fillRect(x, visualY, w, 4);

    // Timber plank repairs across the deck (the "missing sections repaired with timber").
    ctx.fillStyle = 'rgba(105, 70, 36, 0.7)';
    const plankCount = Math.max(2, Math.floor(w / 46));
    for (let i = 0; i < plankCount; i += 1) {
      if ((seed + i * 13) % 3 === 0) {
        const px = x + 6 + (i * (w - 12)) / plankCount;
        ctx.fillRect(px, visualY + 2, Math.min(14, (w - 12) / plankCount - 3), visualHeight - 5);
      }
    }

    // Weathered cracks.
    ctx.strokeStyle = 'rgba(28, 16, 6, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 30; i < w; i += 58) {
      ctx.beginPath();
      ctx.moveTo(x + i, visualY + 4);
      ctx.lineTo(x + i + 4, visualY + visualHeight - 4);
      ctx.stroke();
    }

    // Collapsed railing posts on the landings (broken, leaning).
    if (!isDeck || w >= 200) {
      ctx.strokeStyle = 'rgba(70, 47, 22, 0.62)';
      ctx.lineWidth = 3;
      [x + 10, x + w - 12].forEach((postX, idx) => {
        const lean = idx === 0 ? -3 : 3;
        ctx.beginPath();
        ctx.moveTo(postX, visualY);
        ctx.lineTo(postX + lean, visualY - 14 - ((seed + idx) % 6));
        ctx.stroke();
      });
    }

    // Reactive (collapsing) emphasis: shuddering crack glow.
    if (reactiveActive) {
      ctx.fillStyle = `rgba(214, 150, 70, ${0.18 + reactivePulse * 0.12})`;
      ctx.fillRect(x, visualY - 2, w, 4);
      ctx.strokeStyle = `rgba(255, 196, 120, ${0.4 + reactivePulse * 0.2})`;
      ctx.setLineDash([7, 6]);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x + 8, visualY + visualHeight * 0.5);
      ctx.lineTo(x + w - 8, visualY + visualHeight * 0.5 + unstableShift);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
}

export function drawForegroundSettlingDetailsFrame(ctx, x, y, width, sectionId, options = {}, deps) {
  const {
    drawRouteGroundApron,
  } = deps;
  const intensity = options.intensity ?? 1;
  const seed = options.seed ?? 0;
  const isCatacombs = sectionId === 'catacombs';
  const stoneColor = isCatacombs ? 'rgba(105, 82, 56, 0.42)' : 'rgba(126, 77, 34, 0.36)';
  const highlight = isCatacombs ? 'rgba(178, 145, 96, 0.2)' : 'rgba(238, 184, 101, 0.24)';

  ctx.save();
  drawRouteGroundApron(ctx, x, y, width, sectionId, 0.56 * intensity, seed);

  ctx.globalAlpha = 0.64 * intensity;
  ctx.fillStyle = stoneColor;
  const stoneCount = options.stones ?? 5;
  for (let i = 0; i < stoneCount; i += 1) {
    const t = stoneCount <= 1 ? 0.5 : i / (stoneCount - 1);
    const jitter = Math.sin(seed * 0.07 + i * 1.9);
    const stoneX = x - width * 0.42 + width * 0.84 * t + jitter * 8;
    const stoneY = y + 4 + Math.cos(seed * 0.05 + i) * 3;
    ctx.beginPath();
    ctx.roundRect(stoneX - 6, stoneY - 3, 10 + (i % 3) * 3, 5 + (i % 2) * 2, 2);
    ctx.fill();
  }

  ctx.globalAlpha = 0.72 * intensity;
  ctx.strokeStyle = highlight;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.32, y + 1);
  ctx.quadraticCurveTo(x - width * 0.08, y + 7, x + width * 0.24, y + 3);
  ctx.stroke();
  ctx.restore();
}

export function drawPlatformFrame(ctx, platform, cameraX, current, deps) {
  const {
    GROUND_Y,
    drawAtlasRegion,
    drawContactShadow,
    drawGroundDustLip,
    environmentAssetsRef,
    getEnvironmentAssetKeyForPlatform,
    getSectionForX,
    isHorizontallyVisible,
    isLostBridgeStructureDeckPlatform,
    lostBridgeAssetsRef,
    openingPyramidClimbPackRef,
    openingPyramidFacadeRef,
    scaleJourneyX,
    worldToScreenX,
  } = deps;
  const drawDesertEntryPlatformSupport = (innerCtx, innerPlatform, screenX, visualY, visualHeight, reactiveActive = false) => (
    drawDesertEntryPlatformSupportFrame(innerCtx, innerPlatform, screenX, visualY, visualHeight, reactiveActive, deps)
  );
  const drawDesertOpeningPlatformFace = (innerCtx, innerPlatform, x, visualY, visualHeight, reactiveActive = false) => (
    drawDesertOpeningPlatformFaceFrame(innerCtx, innerPlatform, x, visualY, visualHeight, reactiveActive, deps)
  );
  const drawLostBridgePlatform = (innerCtx, innerPlatform, x, visualY, visualHeight, reactiveActive, reactivePulse, unstableShift) => (
    drawLostBridgePlatformFrame(innerCtx, innerPlatform, x, visualY, visualHeight, reactiveActive, reactivePulse, unstableShift, deps)
  );
  const drawBuriedStoneCausewaySurface = (innerCtx, innerPlatform, x, cameraX, now) => (
    drawBuriedStoneCausewaySurfaceFrame(innerCtx, innerPlatform, x, cameraX, now, deps)
  );
    const x = worldToScreenX(platform.x, cameraX);
    if (!isHorizontallyVisible(platform.x, platform.width, cameraX, 50)) return;
    if (platform.invisible) {
      drawDesertEntryInvisibleLedgeCueFrame(ctx, platform, x, deps);
      const _show = window._pShow || [];
      if (_show.length > 0 && (platform.id || '') && _show.some(p => platform.id.startsWith(p))) {
        const _e = (window._pAdj || {})[platform.id] || {};
        const _ay = (_e.y || 0), _ax = (_e.x || 0), _aw = (_e.w || 0);
        const _dy = platform.y + _ay, _dx = x + _ax, _dw = platform.width + _aw;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,100,0,0.92)'; ctx.lineWidth = 2;
        ctx.strokeRect(_dx, _dy, _dw, platform.height);
        ctx.fillStyle = 'rgba(255,100,0,0.18)';
        ctx.fillRect(_dx, _dy, _dw, platform.height);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace';
        ctx.fillText(platform.id + '  y=' + Math.round(_dy) + '  x=' + Math.round(platform.x + _ax) + '  w=' + Math.round(_dw), _dx + 3, _dy + 12);
        ctx.restore();
      }
      return;
    }

    ctx.save();
    if (platform.secret && platform.secretVisibility !== 'visible' && !current.collectedUpgrades.has('ancient-compass')) {
      ctx.globalAlpha = 0.15;
    }

    const isGround = platform.y === GROUND_Y;
    const section = getSectionForX(platform.x);
    if (isGround && section.id === 'desert-entry') {
      drawBuriedStoneCausewaySurface(ctx, platform, x, cameraX, Date.now());
      ctx.restore();
      return;
    }
    if (!isGround && current.renderStats) {
      current.renderStats.visibleElevatedPlatforms = [
        ...(current.renderStats.visibleElevatedPlatforms || []),
        {
          id: platform.id || platform.label,
          label: platform.label,
          x: Math.round(platform.x),
          y: Math.round(platform.y),
          width: Math.round(platform.width),
          assetKey: getEnvironmentAssetKeyForPlatform(platform, section.id, environmentAssetsRef.current.packId),
          sectionId: section.id,
        },
      ].slice(-18);
    }
    const platformId = platform.id || platform.label;
    const reactiveTimer = platform.reactive ? current.reactivePlatformTimers?.[platformId] : null;
    const reactiveActive = Number.isFinite(reactiveTimer);
    const reactivePulse = reactiveActive ? 0.58 + Math.sin(Date.now() / 110) * 0.12 : 0;
    const unstableShift = reactiveActive ? Math.sin(Date.now() / 36 + platform.x * 0.01) * Math.min(3, 1.5 + (platform.reactive?.delay || 1) - reactiveTimer) : 0;
    const assetKey = getEnvironmentAssetKeyForPlatform(platform, section.id, environmentAssetsRef.current.packId);
    const visualHeight = isGround ? platform.height : Math.max(platform.height + 10, 28);
    const visualY = platform.y + unstableShift;
    const platformX = x - 2;
    const platformWidth = platform.width + 4;
    const hasSlopeSurface = Number.isFinite(platform.slopeStartY)
      && Number.isFinite(platform.slopeEndY)
      && platform.slopeStartY !== platform.slopeEndY;
    const desertSetPiecePlatform = section.id === 'desert-entry' && !isGround;
    const embeddedOpeningPyramidPlatform = desertSetPiecePlatform
      && !platform.assetKey
      && platform.x < scaleJourneyX(720)
      && (openingPyramidFacadeRef.current.loaded || openingPyramidClimbPackRef.current.loaded);
    const facadeIntegratedOpeningPlatform = desertSetPiecePlatform
      && !platform.assetKey
      && platform.x < scaleJourneyX(720)
      && openingPyramidFacadeRef.current.loaded;
    if (hasSlopeSurface) {
      const startY = platform.slopeStartY + unstableShift;
      const endY = platform.slopeEndY + unstableShift;
      const lowerY = Math.max(startY, endY) + Math.max(platform.height, 18);
      const endX = worldToScreenX(platform.x + platform.width, cameraX);
      ctx.save();
      ctx.fillStyle = section.id === 'desert-entry' ? 'rgba(104, 68, 36, 0.92)' : 'rgba(74, 55, 32, 0.92)';
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(endX, endY);
      ctx.lineTo(endX, lowerY);
      ctx.lineTo(x, lowerY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 224, 159, 0.16)';
      ctx.beginPath();
      ctx.moveTo(x + 4, startY - 1);
      ctx.lineTo(endX - 4, endY - 1);
      ctx.lineTo(endX - 4, endY + 5);
      ctx.lineTo(x + 4, startY + 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = reactiveActive ? `rgba(255, 196, 120, ${0.45 + reactivePulse * 0.2})` : 'rgba(37, 25, 14, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      drawGroundDustLip(ctx, (x + endX) / 2, lowerY + 1, platform.width * 0.72, 'rgba(178, 117, 54, 0.18)');
      ctx.restore();
      ctx.restore();
      return;
    }
    if (platform.variant === 'lost-bridge') {
      const bridgeStructureReady = Boolean(lostBridgeAssetsRef.current?.structure?.naturalWidth);
      if (bridgeStructureReady && isLostBridgeStructureDeckPlatform(platform)) {
        if (reactiveActive) {
          ctx.fillStyle = `rgba(214, 150, 70, ${0.18 + reactivePulse * 0.12})`;
          ctx.fillRect(x + 8, visualY - 3, Math.max(12, platform.width - 16), 6);
          ctx.strokeStyle = `rgba(255, 196, 120, ${0.45 + reactivePulse * 0.2})`;
          ctx.setLineDash([7, 6]);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(x + 14, visualY + 4);
          ctx.lineTo(x + platform.width - 14, visualY + 4 + unstableShift);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
        return;
      }
      drawLostBridgePlatform(ctx, platform, x, visualY, visualHeight, reactiveActive, reactivePulse, unstableShift);
      ctx.restore();
      return;
    }
    if (facadeIntegratedOpeningPlatform) {
      const hiddenFacadeTread = /stair tread|stair helper|pressure stair slab|cracked summit trap slab/i.test(platform.label || '');
      drawDesertOpeningPlatformFace(ctx, platform, x, visualY, visualHeight, reactiveActive);
      if (reactiveActive && !hiddenFacadeTread) {
        ctx.save();
        ctx.fillStyle = `rgba(137, 104, 72, ${0.12 + reactivePulse * 0.08})`;
        ctx.fillRect(x + 10, platform.y - 2, platform.width - 20, 4);
        ctx.restore();
      }
      ctx.restore();
      return;
    }
    ctx.fillStyle = isGround
      ? section.id === 'catacombs'
        ? '#2b211a'
        : '#9b7140'
      : '#5f4229';
    if (!isGround) {
      if (desertSetPiecePlatform) {
        drawDesertEntryPlatformSupport(ctx, platform, x, visualY, visualHeight, reactiveActive);
      }
      if (!desertSetPiecePlatform) {
        drawForegroundSettlingDetailsFrame(ctx, x + platform.width / 2, platform.y + visualHeight + 4, platform.width * 1.28, section.id, {
          intensity: 0.74,
          seed: Math.round(platform.x),
          stones: 6,
        }, deps);
        drawContactShadow(ctx, x + platform.width / 2, platform.y + visualHeight + 5, platform.width * 0.94, 0.32, 1.5);
      }
      ctx.fillStyle = 'rgba(30, 18, 8, 0.34)';
      ctx.fillRect(platformX, visualY + visualHeight - 8, platformWidth, 8);
    }
    if (isGround && section.id === 'desert-entry') {
      ctx.restore();
      return;
    }
    ctx.fillStyle = isGround ? '#9b7140' : '#5f4229';
    if (embeddedOpeningPyramidPlatform) {
      ctx.globalAlpha *= facadeIntegratedOpeningPlatform ? 0.18 : 0.62;
    }
    ctx.fillRect(platformX, visualY, platformWidth, visualHeight);
    if (desertSetPiecePlatform) {
      ctx.filter = 'sepia(16%) saturate(78%) brightness(84%) contrast(96%)';
    }
    const assetDrawn = drawAtlasRegion(
      ctx,
      environmentAssetsRef.current,
      assetKey,
      { x: platformX, y: visualY, width: platformWidth, height: visualHeight },
      {
        mode: 'tileX',
        sourceInset: isGround ? 30 : 22,
        sourceInsetY: isGround ? 5 : 4,
        overlap: isGround ? 4 : 3,
        tileScale: isGround ? 1.55 : 1.35,
      },
    );
    ctx.filter = 'none';

    if (assetDrawn) {
      if (desertSetPiecePlatform) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = platform.x < scaleJourneyX(720) ? 'rgba(142, 78, 31, 0.18)' : 'rgba(167, 101, 42, 0.22)';
        ctx.fillRect(platformX, visualY, platformWidth, visualHeight);
        ctx.restore();
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = platform.x < scaleJourneyX(720) ? 'rgba(255, 220, 146, 0.14)' : 'rgba(255, 205, 130, 0.08)';
        ctx.fillRect(platformX, visualY, platformWidth, Math.max(5, visualHeight * 0.24));
        ctx.restore();
        drawDesertOpeningPlatformFace(ctx, platform, x, visualY, visualHeight, reactiveActive);
      }
      if (isGround) {
        drawBuriedStoneCausewaySurface(ctx, platform, x, cameraX, Date.now());
        if (section.id === 'desert-entry') {
          const floorDepth = ctx.createLinearGradient(0, platform.y + 12, 0, platform.y + platform.height);
          floorDepth.addColorStop(0, 'rgba(65, 38, 18, 0)');
          floorDepth.addColorStop(1, 'rgba(48, 28, 14, 0.28)');
          ctx.fillStyle = floorDepth;
          ctx.fillRect(x, platform.y + 12, platform.width, Math.max(0, platform.height - 12));
        }
        const edgeGradient = ctx.createLinearGradient(0, platform.y - 10, 0, platform.y + 10);
        edgeGradient.addColorStop(0, 'rgba(230, 171, 88, 0)');
        edgeGradient.addColorStop(0.42, 'rgba(230, 171, 88, 0.2)');
        edgeGradient.addColorStop(1, 'rgba(97, 55, 24, 0.08)');
        ctx.fillStyle = edgeGradient;
        ctx.fillRect(x, platform.y - 8, platform.width, 18);
        ctx.fillStyle = 'rgba(238, 183, 101, 0.16)';
        for (let sx = x - 8; sx < x + platform.width + 12; sx += 34) {
          const wave = Math.sin((sx + cameraX) * 0.035) * 2;
          ctx.beginPath();
          ctx.ellipse(sx + 12, platform.y - 2 + wave, 18, 3.2, -0.05, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = desertSetPiecePlatform ? 'rgba(255, 224, 159, 0.1)' : 'rgba(255, 247, 212, 0.2)';
        ctx.fillRect(x, platform.y, platform.width, 4);
      }
      if (reactiveActive) {
        ctx.fillStyle = `rgba(137, 104, 72, ${0.12 + reactivePulse * 0.08})`;
        ctx.fillRect(x, platform.y - 2, platform.width, 5);
        ctx.strokeStyle = 'rgba(180, 139, 90, 0.34)';
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(x + 8, platform.y + visualHeight * 0.5);
        ctx.lineTo(x + platform.width - 8, platform.y + visualHeight * 0.5 + unstableShift);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (!isGround) {
        ctx.fillStyle = desertSetPiecePlatform ? (platform.x < scaleJourneyX(720) ? 'rgba(23, 13, 6, 0.48)' : 'rgba(30, 18, 9, 0.4)') : 'rgba(30, 18, 9, 0.3)';
        ctx.fillRect(x, platform.y + visualHeight - 7, platform.width, 7);
        if (platform.requiresObjective) {
          const glow = 0.26 + Math.sin(Date.now() / 180) * 0.08;
          ctx.fillStyle = `rgba(250, 204, 21, ${glow})`;
          ctx.fillRect(x + 6, platform.y - 3, platform.width - 12, 5);
        }
        const supportSpacing = Math.max(42, Math.min(72, platform.width / 3));
        ctx.fillStyle = 'rgba(37, 25, 14, 0.28)';
        for (let supportX = x + 14; supportX < x + platform.width - 10; supportX += supportSpacing) {
          ctx.beginPath();
          ctx.moveTo(supportX - 5, platform.y + visualHeight - 2);
          ctx.lineTo(supportX + 5, platform.y + visualHeight - 2);
          ctx.lineTo(supportX + 1, platform.y + visualHeight + 12);
          ctx.lineTo(supportX - 1, platform.y + visualHeight + 12);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(92, 57, 23, 0.26)';
        ctx.fillRect(x + 5, platform.y + visualHeight - 2, platform.width - 10, 3);
        const sandLip = ctx.createLinearGradient(0, platform.y + visualHeight - 10, 0, platform.y + visualHeight + 10);
        sandLip.addColorStop(0, 'rgba(218, 152, 73, 0)');
        sandLip.addColorStop(0.48, 'rgba(205, 135, 58, 0.44)');
        sandLip.addColorStop(1, 'rgba(122, 71, 31, 0.56)');
        ctx.fillStyle = sandLip;
        ctx.beginPath();
        ctx.ellipse(x + platform.width / 2, platform.y + visualHeight + 1, platform.width * 0.5, 8, -0.02, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 247, 212, 0.2)';
        ctx.beginPath();
        ctx.moveTo(x + 4, platform.y + 2);
        ctx.lineTo(x + platform.width - 4, platform.y + 2);
        ctx.stroke();
        drawGroundDustLip(ctx, x + platform.width / 2, platform.y + visualHeight + 2, platform.width * 0.72, 'rgba(178, 117, 54, 0.2)');
      }
      if (!isGround) {
        ctx.strokeStyle = 'rgba(37, 25, 14, 0.34)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, platform.y + 1);
        ctx.lineTo(x + platform.width, platform.y + 1);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    // Platform Base
    ctx.fillStyle = platform.secret ? '#5c4d3c' : isGround ? '#8b6a47' : '#4a3720';
    ctx.fillRect(x, visualY, platform.width, platform.height);

    // Depth Side
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x, visualY + platform.height - 4, platform.width, 4);

    // Top Surface
    ctx.fillStyle = isGround ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(x, visualY, platform.width, 6);

    // Texture / Cracks
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 40; i < platform.width; i += 80) {
      ctx.beginPath();
      ctx.moveTo(x + i, visualY + 6);
      ctx.lineTo(x + i + 5, visualY + platform.height - 4);
      ctx.stroke();
    }
    if (reactiveActive) {
      ctx.fillStyle = `rgba(137, 104, 72, ${0.12 + reactivePulse * 0.08})`;
      ctx.fillRect(x, visualY - 2, platform.width, 5);
    }

    // Border
    ctx.strokeStyle = 'rgba(37, 25, 14, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, visualY, platform.width, platform.height);
    ctx.restore();
}
