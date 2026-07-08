import { applyLayerToneGrade, createLayerGradeCanvas, hasLayerToneGrade } from './journeyBackgroundAssets.js';

export function drawOpeningPyramidFacadeFrame(ctx, cameraX, _now = 0, prop = null, deps) {
  void _now;
  const {
    CANVAS_WIDTH,
    OPENING_PYRAMID_FACADE_WORLD_LEFT_X,
    getGeneratedStoryPropRenderProp,
    openingPyramidFacadeRef,
    worldToScreenX,
  } = deps;
  const facade = openingPyramidFacadeRef.current;
  if (!facade.loaded || !facade.image) return false;
  const renderProp = getGeneratedStoryPropRenderProp(prop || {});
  const width = Number.isFinite(renderProp.width) ? renderProp.width : 1208;
  const height = Number.isFinite(renderProp.height) ? renderProp.height : 664;
  const worldLeftX = Number.isFinite(renderProp.x)
    ? renderProp.x - width / 2
    : OPENING_PYRAMID_FACADE_WORLD_LEFT_X;
  const x = worldToScreenX(worldLeftX, cameraX);
  const y = Number.isFinite(renderProp.y) ? renderProp.y : -4;
  if (x > CANVAS_WIDTH + 80 || x + width < -80) return false;
  ctx.save();
  ctx.globalAlpha = Number.isFinite(renderProp.alpha) ? renderProp.alpha : 0.98;
  ctx.filter = 'sepia(4%) saturate(98%) brightness(91%) contrast(102%)';
  ctx.drawImage(facade.image, x, y, width, height);
  ctx.restore();
  return true;
}

export function drawOpeningPyramidMasonryBackFrame(ctx, cameraX, now = 0, current, deps) {
  const {
    CANVAS_WIDTH,
    GROUND_Y,
    OPENING_PYRAMID_FACADE_TIERS,
    drawOpeningPyramidAssetRegion,
    getRenderableStoryProps,
    isHorizontallyVisible,
    openingJourneyY,
    openingPyramidFacadeRef,
    scaleJourneyX,
    worldToScreenX,
  } = deps;
  const openingPyramidFacadeProp = getRenderableStoryProps(current).find(prop => prop.id === 'opening-pyramid-facade-structure');
  if (!openingPyramidFacadeProp) return;
  if (openingPyramidFacadeRef.current.loaded && openingPyramidFacadeRef.current.image) {
    drawOpeningPyramidFacadeFrame(ctx, cameraX, now, openingPyramidFacadeProp, deps);
    return;
  }
  const facadeStartX = 80;
  const facadeEndX = 1760;
  if (!isHorizontallyVisible(facadeStartX, facadeEndX - facadeStartX, cameraX, 180)) return;
  const baseY = GROUND_Y + 12;
  ctx.save();

  OPENING_PYRAMID_FACADE_TIERS.forEach((tier, index) => {
    const sx = worldToScreenX(tier.x, cameraX);
    const topY = tier.y;
    const tierBottom = Math.min(baseY, tier.y + tier.height);
    const height = tierBottom - topY;
    if (sx > CANVAS_WIDTH + 160 || sx + tier.width < -160 || height <= 0) return;

    ctx.save();
    ctx.globalAlpha = tier.alpha;
    ctx.beginPath();
    ctx.moveTo(sx + tier.inset, topY);
    ctx.lineTo(sx + tier.width - tier.inset * 0.3, topY);
    ctx.lineTo(sx + tier.width, tierBottom);
    ctx.lineTo(sx, tierBottom);
    ctx.closePath();
    ctx.clip();

    const faceGradient = ctx.createLinearGradient(0, topY, 0, tierBottom);
    faceGradient.addColorStop(0, 'rgb(183, 117, 49)');
    faceGradient.addColorStop(0.5, 'rgb(110, 63, 27)');
    faceGradient.addColorStop(1, 'rgb(58, 34, 16)');
    ctx.fillStyle = faceGradient;
    ctx.fillRect(sx, topY, tier.width, height);

    const region = index < 3 ? 'leftStairFace' : index < 5 ? 'rightStairFace' : 'terraceWall';
    drawOpeningPyramidAssetRegion(ctx, region, {
      x: sx - 10,
      y: topY - 5,
      width: tier.width + 20,
      height: height + 18,
    }, {
      alpha: 0.58,
      filter: 'sepia(10%) saturate(88%) brightness(70%) contrast(112%)',
    });

    ctx.globalAlpha = tier.alpha * 0.86;
    ctx.strokeStyle = 'rgba(48, 27, 12, 0.42)';
    ctx.lineWidth = 1.2;
    for (let rowY = topY + 13; rowY < tierBottom - 8; rowY += 16) {
      ctx.beginPath();
      ctx.moveTo(sx + 18, rowY);
      ctx.lineTo(sx + tier.width - 18, rowY + Math.sin(rowY * 0.09 + index) * 1.4);
      ctx.stroke();
      for (let jointX = sx + 42 + ((index * 23 + rowY) % 58); jointX < sx + tier.width - 36; jointX += 72) {
        ctx.beginPath();
        ctx.moveTo(jointX, rowY - 13);
        ctx.lineTo(jointX + Math.sin(jointX * 0.04) * 5, rowY - 2);
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = tier.alpha * 0.34;
    ctx.fillStyle = 'rgba(255, 220, 142, 0.9)';
    ctx.fillRect(sx + tier.inset * 0.7, topY, tier.width - tier.inset, 6);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = tier.alpha * 0.2;
    ctx.fillStyle = 'rgba(41, 23, 9, 0.95)';
    ctx.fillRect(sx + tier.width * 0.42, topY + 8, tier.width * 0.58, Math.max(12, height - 10));
    ctx.restore();
  });

  const summitX = worldToScreenX(scaleJourneyX(488), cameraX);
  drawOpeningPyramidAssetRegion(ctx, 'terraceWall', {
    x: summitX - 84,
    y: openingJourneyY(98),
    width: 246,
    height: 86,
  }, { alpha: 0.82, filter: 'sepia(8%) saturate(92%) brightness(82%) contrast(102%)' });
  drawOpeningPyramidAssetRegion(ctx, 'carvedColumn', {
    x: summitX - 58,
    y: openingJourneyY(129),
    width: 54,
    height: 118,
  }, { alpha: 0.64, filter: 'sepia(8%) saturate(86%) brightness(80%) contrast(96%)' });
  drawOpeningPyramidAssetRegion(ctx, 'paintedColumn', {
    x: summitX + 84,
    y: openingJourneyY(128),
    width: 54,
    height: 120,
  }, { alpha: 0.6, filter: 'sepia(8%) saturate(86%) brightness(80%) contrast(96%)' });

  const lowerX = worldToScreenX(scaleJourneyX(110), cameraX);
  drawOpeningPyramidAssetRegion(ctx, 'carvedColumn', {
    x: lowerX + 20,
    y: openingJourneyY(270),
    width: 58,
    height: 118,
  }, { alpha: 0.48, filter: 'sepia(8%) saturate(84%) brightness(78%) contrast(96%)' });
  drawOpeningPyramidAssetRegion(ctx, 'paintedColumn', {
    x: lowerX + 318,
    y: openingJourneyY(226),
    width: 58,
    height: 122,
  }, { alpha: 0.48, filter: 'sepia(8%) saturate(84%) brightness(78%) contrast(96%)' });

  const x = worldToScreenX(scaleJourneyX(84), cameraX);
  drawOpeningPyramidAssetRegion(ctx, 'rubble', {
    x: x + 510,
    y: GROUND_Y - 64,
    width: 128,
    height: 58,
  }, { alpha: 0.74 });
  drawOpeningPyramidAssetRegion(ctx, 'dust', {
    x: x + 80,
    y: GROUND_Y - 42,
    width: 520,
    height: 58,
  }, { alpha: 0.3 });
  ctx.restore();
}

export function drawLostBridgeRavineDepthFrame(ctx, platforms, cameraX, current, deps) {
  const {
    CANVAS_HEIGHT,
    GROUND_Y,
    LOST_BRIDGE_ASSET_VERSION,
    LOST_BRIDGE_RAVINE_BLEND_CLIP_PAD,
    LOST_BRIDGE_RAVINE_BLEND_CLIP_TOP_OFFSET,
    LOST_BRIDGE_RAVINE_FALL_DEPTH,
    LOST_BRIDGE_RAVINE_FALL_SIDE_PAD,
    LOST_BRIDGE_RAVINE_FLOOR_VARIANT_SRCS,
    LOST_BRIDGE_RAVINE_THROAT_TOP_OFFSET,
    getLostBridgeDeckBounds,
    getLostBridgeRavineFloorPlacement,
    isHorizontallyVisible,
    lostBridgeAssetsRef,
    worldToScreenX,
  } = deps;
    const editorPlacement = getLostBridgeRavineFloorPlacement(current);
    if (!editorPlacement) return false;
    const deckBounds = getLostBridgeDeckBounds(platforms || []);
    const bounds = deckBounds || {
      left: editorPlacement.drawWorldLeft + editorPlacement.width * 0.18,
      right: editorPlacement.drawWorldLeft + editorPlacement.width * 0.82,
      y: Math.max(0, editorPlacement.drawY + editorPlacement.height * 0.08),
      span: editorPlacement.width * 0.64,
    };
    const activeRavineAssetKey = editorPlacement.prop?.imageAssetKey || 'lostBridgeRavineFloor';
    const activeRavineAssetPath = editorPlacement.prop?.assetPath || LOST_BRIDGE_RAVINE_FLOOR_VARIANT_SRCS.lostBridgeRavineFloor;
    const blend = lostBridgeAssetsRef.current?.floorBlends?.[activeRavineAssetKey]
      || lostBridgeAssetsRef.current?.floorBlends?.[activeRavineAssetPath]
      || lostBridgeAssetsRef.current?.floorBlend;
    const drawWorldLeft = editorPlacement.drawWorldLeft;
    const drawW = editorPlacement.width;
    if (!isHorizontallyVisible(drawWorldLeft, drawW, cameraX, 180)) return false;

    ctx.save();
    const drawX = worldToScreenX(drawWorldLeft, cameraX);
    const ravineFallWorldLeft = bounds.left + LOST_BRIDGE_RAVINE_FALL_SIDE_PAD * 0.82;
    const ravineFallWorldRight = bounds.right - LOST_BRIDGE_RAVINE_FALL_SIDE_PAD * 0.72;
    const ravineFallWidth = Math.max(0, ravineFallWorldRight - ravineFallWorldLeft);
    const drawNonFloorRavineVoid = () => {
      if (ravineFallWidth <= 0) return;
      const throatX = worldToScreenX(ravineFallWorldLeft, cameraX);
      const throatTop = Math.max(0, bounds.y + 18);
      const throatBottom = Math.min(CANVAS_HEIGHT + 42, GROUND_Y + 68);
      const voidGradient = ctx.createLinearGradient(0, throatTop, 0, throatBottom);
      voidGradient.addColorStop(0, 'rgba(79, 45, 18, 0.08)');
      voidGradient.addColorStop(0.2, 'rgba(43, 25, 13, 0.48)');
      voidGradient.addColorStop(0.68, 'rgba(8, 9, 13, 0.92)');
      voidGradient.addColorStop(1, 'rgba(2, 4, 8, 0.72)');
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = voidGradient;
      ctx.beginPath();
      ctx.moveTo(throatX - 96, throatTop + 14);
      ctx.bezierCurveTo(throatX + ravineFallWidth * 0.08, throatTop + 50, throatX + ravineFallWidth * 0.26, throatTop + 32, throatX + ravineFallWidth * 0.42, throatTop + 62);
      ctx.bezierCurveTo(throatX + ravineFallWidth * 0.58, throatTop + 34, throatX + ravineFallWidth * 0.84, throatTop + 54, throatX + ravineFallWidth + 96, throatTop + 12);
      ctx.lineTo(throatX + ravineFallWidth + 148, throatBottom + 40);
      ctx.lineTo(throatX - 148, throatBottom + 40);
      ctx.closePath();
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      const depthGlow = ctx.createRadialGradient(
        throatX + ravineFallWidth * 0.5,
        throatTop + 132,
        Math.max(24, ravineFallWidth * 0.14),
        throatX + ravineFallWidth * 0.5,
        throatTop + 170,
        Math.max(220, ravineFallWidth * 0.72),
      );
      depthGlow.addColorStop(0, 'rgba(0, 3, 7, 0.64)');
      depthGlow.addColorStop(0.58, 'rgba(6, 7, 10, 0.36)');
      depthGlow.addColorStop(1, 'rgba(6, 7, 10, 0)');
      ctx.fillStyle = depthGlow;
      ctx.beginPath();
      ctx.ellipse(
        throatX + ravineFallWidth * 0.5,
        throatTop + 154,
        Math.max(210, ravineFallWidth * 0.64),
        170,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 218, 148, 0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(throatX - 84, throatTop + 14);
      ctx.bezierCurveTo(throatX + ravineFallWidth * 0.16, throatTop + 46, throatX + ravineFallWidth * 0.4, throatTop + 36, throatX + ravineFallWidth * 0.5, throatTop + 66);
      ctx.bezierCurveTo(throatX + ravineFallWidth * 0.66, throatTop + 36, throatX + ravineFallWidth * 0.84, throatTop + 50, throatX + ravineFallWidth + 84, throatTop + 14);
      ctx.stroke();
      ctx.restore();
    };

    if (blend?.naturalWidth && blend?.naturalHeight) {
      const drawH = editorPlacement.height;
      const drawY = editorPlacement.drawY;
      const visibleTop = Math.max(0, drawY + LOST_BRIDGE_RAVINE_BLEND_CLIP_TOP_OFFSET);
      ctx.beginPath();
      ctx.rect(
        drawX - LOST_BRIDGE_RAVINE_BLEND_CLIP_PAD,
        visibleTop,
        drawW + LOST_BRIDGE_RAVINE_BLEND_CLIP_PAD * 2,
        CANVAS_HEIGHT - visibleTop + 24,
      );
      ctx.clip();
      ctx.globalAlpha = 1;
      ctx.filter = 'sepia(4%) saturate(96%) brightness(88%) contrast(112%)';
      ctx.drawImage(blend, drawX, drawY, drawW, drawH);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      const throatX = worldToScreenX(ravineFallWorldLeft, cameraX);
      const throatTop = bounds.y + LOST_BRIDGE_RAVINE_THROAT_TOP_OFFSET;
      const throatBottom = Math.min(CANVAS_HEIGHT + 24, GROUND_Y + 58);
      const throatHeight = Math.max(120, throatBottom - throatTop);
      const throatGradient = ctx.createLinearGradient(0, throatTop, 0, throatBottom);
      throatGradient.addColorStop(0, 'rgba(35, 21, 12, 0)');
      throatGradient.addColorStop(0.24, 'rgba(22, 14, 9, 0.36)');
      throatGradient.addColorStop(0.7, 'rgba(6, 7, 10, 0.76)');
      throatGradient.addColorStop(1, 'rgba(6, 7, 10, 0.18)');
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = throatGradient;
      ctx.beginPath();
      ctx.ellipse(
        throatX + ravineFallWidth * 0.5,
        throatTop + throatHeight * 0.58,
        Math.max(120, ravineFallWidth * 0.54),
        Math.max(92, throatHeight * 0.5),
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
      drawNonFloorRavineVoid();
      if (current.renderStats) {
        current.renderStats.lostBridgeRavineDepth = {
          x: Math.round(ravineFallWorldLeft),
          width: Math.round(ravineFallWidth),
          fallDepth: LOST_BRIDGE_RAVINE_FALL_DEPTH,
          floorBlendVersion: LOST_BRIDGE_ASSET_VERSION,
          floorBlendAssetKey: activeRavineAssetKey,
          floorBlendAssetPath: activeRavineAssetPath,
          editorControlled: true,
          controllerPropId: editorPlacement.prop?.id || null,
          deckBoundsFallback: !deckBounds,
          visualMode: 'dark-non-floor-chasm-under-bridge',
        };
        current.renderStats.lostBridgeRavineStripBounds = {
          x: Math.round(drawWorldLeft),
          y: Math.round(drawY),
          width: Math.round(drawW),
          height: Math.round(drawH),
          clipTop: Math.round(visibleTop),
          layer: 'above-floor-below-bridge-platforms',
          editorControlled: true,
        };
        current.renderStats.lostBridgeRavineThroat = {
          x: Math.round(ravineFallWorldLeft),
          width: Math.round(ravineFallWidth),
          top: Math.round(throatTop),
          bottom: Math.round(throatBottom),
          layer: 'shadow-over-ravine-under-bridge-platforms',
        };
        current.renderStats.lostBridgeRavineFloorBlendLoaded = true;
      }
      ctx.restore();
      return true;
    }

    const fallbackCenterX = drawX + drawW * 0.5;
    const dust = ctx.createLinearGradient(0, GROUND_Y - 40, 0, GROUND_Y + 46);
    dust.addColorStop(0, 'rgba(224, 157, 78, 0)');
    dust.addColorStop(0.48, 'rgba(221, 155, 82, 0.18)');
    dust.addColorStop(1, 'rgba(221, 155, 82, 0)');
    ctx.fillStyle = dust;
    ctx.beginPath();
    ctx.ellipse(fallbackCenterX, GROUND_Y + 2, Math.max(180, drawW * 0.38), 48, 0, 0, Math.PI * 2);
    ctx.fill();
    drawNonFloorRavineVoid();
    ctx.restore();

    if (current.renderStats) {
      current.renderStats.lostBridgeRavineDepth = {
        x: Math.round(ravineFallWorldLeft),
        width: Math.round(ravineFallWidth),
        fallDepth: LOST_BRIDGE_RAVINE_FALL_DEPTH,
        floorBlendLoaded: false,
        floorBlendAssetKey: activeRavineAssetKey,
        floorBlendAssetPath: activeRavineAssetPath,
        visualMode: 'dark-non-floor-chasm-under-bridge',
      };
    }
    return true;
}

export function drawLostBridgeRavineForegroundVoidFrame(ctx, platforms, cameraX, current, deps) {
  const {
    CANVAS_HEIGHT,
    GROUND_Y,
    LOST_BRIDGE_RAVINE_FOREGROUND_VOID_GROUND_CLEARANCE,
    LOST_BRIDGE_RAVINE_FOREGROUND_VOID_MIN_TOP_OFFSET,
    LOST_BRIDGE_RAVINE_FOREGROUND_VOID_SIDE_PAD,
    getLostBridgeDeckBounds,
    isHorizontallyVisible,
    worldToScreenX,
  } = deps;
    const bounds = getLostBridgeDeckBounds(platforms || []);
    if (!bounds) return false;
    const voidWorldLeft = bounds.left - LOST_BRIDGE_RAVINE_FOREGROUND_VOID_SIDE_PAD;
    const voidWorldRight = bounds.right + LOST_BRIDGE_RAVINE_FOREGROUND_VOID_SIDE_PAD;
    if (!isHorizontallyVisible(voidWorldLeft, voidWorldRight - voidWorldLeft, cameraX, 120)) return false;
    const left = worldToScreenX(voidWorldLeft, cameraX);
    const right = worldToScreenX(voidWorldRight, cameraX);
    const width = right - left;
    const top = Math.max(
      bounds.y + LOST_BRIDGE_RAVINE_FOREGROUND_VOID_MIN_TOP_OFFSET,
      GROUND_Y + LOST_BRIDGE_RAVINE_FOREGROUND_VOID_GROUND_CLEARANCE,
    );
    const bottom = CANVAS_HEIGHT + 48;
    if (top >= bottom) return false;

    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, width, bottom - top);
    ctx.clip();

    const voidWash = ctx.createLinearGradient(0, top, 0, bottom);
    voidWash.addColorStop(0, 'rgba(43, 25, 13, 0)');
    voidWash.addColorStop(0.14, 'rgba(31, 20, 16, 0.54)');
    voidWash.addColorStop(0.52, 'rgba(7, 8, 12, 0.9)');
    voidWash.addColorStop(1, 'rgba(2, 3, 6, 0.96)');
    ctx.fillStyle = voidWash;
    ctx.fillRect(left, top, width, bottom - top);

    ctx.globalCompositeOperation = 'multiply';
    const core = ctx.createRadialGradient(
      left + width * 0.48,
      top + 118,
      Math.max(60, width * 0.12),
      left + width * 0.52,
      top + 190,
      Math.max(320, width * 0.55),
    );
    core.addColorStop(0, 'rgba(1, 2, 6, 0.92)');
    core.addColorStop(0.64, 'rgba(4, 5, 9, 0.62)');
    core.addColorStop(1, 'rgba(4, 5, 9, 0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.ellipse(left + width * 0.5, top + 152, Math.max(280, width * 0.48), 188, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    const dust = ctx.createLinearGradient(0, top - 18, 0, top + 96);
    dust.addColorStop(0, 'rgba(225, 167, 88, 0)');
    dust.addColorStop(0.5, 'rgba(207, 139, 67, 0.18)');
    dust.addColorStop(1, 'rgba(73, 44, 24, 0)');
    ctx.fillStyle = dust;
    ctx.fillRect(left, top - 18, width, 96);
    ctx.restore();

    if (current.renderStats) {
      current.renderStats.lostBridgeRavineForegroundVoid = {
        x: Math.round(voidWorldLeft),
        width: Math.round(voidWorldRight - voidWorldLeft),
        top: Math.round(top),
        visualMode: 'late-lower-chasm-occlusion',
      };
    }
    return true;
}

export function drawLostBridgeStructureFrame(ctx, platforms, cameraX, current, deps) {
  const {
    LOST_BRIDGE_ASSET_VERSION,
    LOST_BRIDGE_STRUCTURE_DECK_TOP_FRAC,
    LOST_BRIDGE_STRUCTURE_SIDE_PAD,
    getLostBridgeDeckBounds,
    isHorizontallyVisible,
    lostBridgeAssetsRef,
    worldToScreenX,
  } = deps;
    const structure = lostBridgeAssetsRef.current?.structure;
    if (!structure || !structure.naturalWidth) return false;
    const bounds = getLostBridgeDeckBounds(platforms || []);
    if (!bounds) return false;

    const drawWorldLeft = bounds.left - LOST_BRIDGE_STRUCTURE_SIDE_PAD;
    const drawW = bounds.span + LOST_BRIDGE_STRUCTURE_SIDE_PAD * 2;
    if (!isHorizontallyVisible(drawWorldLeft, drawW, cameraX, 160)) return false;

    const drawX = worldToScreenX(drawWorldLeft, cameraX);
    const drawH = drawW * (structure.naturalHeight / structure.naturalWidth);
    const drawY = bounds.y - drawH * LOST_BRIDGE_STRUCTURE_DECK_TOP_FRAC;

    ctx.save();
    const ravineY = bounds.y + 18;
    ctx.save();
    ctx.translate(drawX + drawW * 0.5, ravineY + 98);
    ctx.scale(Math.max(1, drawW * 0.38), 92);
    const ravineShadow = ctx.createRadialGradient(0, 0, 0.08, 0, 0, 1);
    ravineShadow.addColorStop(0, 'rgba(44, 24, 8, 0.18)');
    ravineShadow.addColorStop(0.58, 'rgba(44, 24, 8, 0.08)');
    ravineShadow.addColorStop(1, 'rgba(44, 24, 8, 0)');
    ctx.fillStyle = ravineShadow;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.filter = 'sepia(8%) saturate(94%) brightness(93%) contrast(106%)';
    ctx.drawImage(structure, drawX, drawY, drawW, drawH);
    ctx.filter = 'none';
    ctx.restore();

    if (current.renderStats) {
      current.renderStats.lostBridgeStructureVersion = LOST_BRIDGE_ASSET_VERSION;
      current.renderStats.lostBridgeStructureLoaded = true;
      current.renderStats.lostBridgeStructureBounds = {
        x: Math.round(drawWorldLeft),
        y: Math.round(drawY),
        width: Math.round(drawW),
        height: Math.round(drawH),
      };
    }
    return true;
}

export function drawMummificationChamberExteriorAssetFrame(ctx, prop, x, section, now, deps) {
  const {
    GROUND_Y,
    MUMMIFICATION_CHAMBER_EXTERIOR_VERSION,
    drawEgyptStructureGroundContactLayer,
    drawEgyptStructureWeatheringOverlay,
    mummificationChamberExteriorRef,
    stateRef,
  } = deps;
    const structureAsset = mummificationChamberExteriorRef.current;
    if (!structureAsset.loaded || !structureAsset.image) return false;

    const width = prop.width || 1500;
    const height = prop.height || 760;
    const drawX = x - width / 2;
    const drawY = prop.y;
    const left = drawX;
    const baseY = drawY + height;
    const groundY = Math.min(GROUND_Y - 2, baseY - 4);
    const pulse = 0.75 + Math.sin(now / 420) * 0.12;
    const visualAlpha = prop.alpha ?? 1;
    if (visualAlpha <= 0.01) return false;

    const underlayContact = drawEgyptStructureGroundContactLayer(ctx, prop.groundContactLayer, left, width, groundY, 'underlay');
    ctx.save();
    ctx.globalAlpha = 0.28 * visualAlpha;
    ctx.filter = 'brightness(0) sepia(30%) saturate(130%) blur(4px)';
    ctx.drawImage(structureAsset.image, drawX + width * 0.014, drawY + 10, width * 1.008, height * 1.006);
    ctx.restore();

    ctx.save();
    const baseShadow = ctx.createRadialGradient(x, groundY - 4, width * 0.08, x, groundY - 4, width * 0.52);
    baseShadow.addColorStop(0, `rgba(31, 18, 9, ${0.3 * visualAlpha})`);
    baseShadow.addColorStop(0.52, `rgba(39, 23, 12, ${0.18 * visualAlpha})`);
    baseShadow.addColorStop(1, 'rgba(39, 23, 12, 0)');
    ctx.fillStyle = baseShadow;
    ctx.beginPath();
    ctx.ellipse(x, groundY + 10, width * 0.5, 38, -0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.globalAlpha = visualAlpha;
    ctx.filter = `sepia(6%) saturate(108%) brightness(${98 + pulse * 3}%) contrast(106%)`;
    ctx.drawImage(structureAsset.image, drawX, drawY, width, height);
    ctx.filter = 'none';
    ctx.globalAlpha = 1;

    ctx.save();
    const doorwayX = left + width * 0.535;
    const doorwayY = drawY + height * 0.105;
    const doorwayW = width * 0.085;
    const doorwayH = height * 0.25;
    const doorwayDepth = ctx.createLinearGradient(0, doorwayY, 0, doorwayY + doorwayH);
    doorwayDepth.addColorStop(0, 'rgba(12, 7, 4, 0.08)');
    doorwayDepth.addColorStop(0.45, 'rgba(4, 3, 2, 0.24)');
    doorwayDepth.addColorStop(1, 'rgba(4, 3, 2, 0.1)');
    ctx.fillStyle = doorwayDepth;
    ctx.fillRect(doorwayX, doorwayY, doorwayW, doorwayH);
    ctx.restore();

    drawEgyptStructureWeatheringOverlay(ctx, left, width, groundY, { alpha: 0.74 });
    const overlayContact = drawEgyptStructureGroundContactLayer(ctx, prop.groundContactLayer, left, width, groundY, 'overlay');
    if (stateRef.current.renderStats) {
      stateRef.current.renderStats.mummificationChamberExteriorVersion = MUMMIFICATION_CHAMBER_EXTERIOR_VERSION;
      stateRef.current.renderStats.mummificationChamberExteriorLoaded = true;
      stateRef.current.renderStats.mummificationGroundBlendAssetKeys = Array.from(new Set([
        ...underlayContact.keys,
        ...overlayContact.keys,
      ]));
      stateRef.current.renderStats.mummificationGroundBlendElementCount = underlayContact.count + overlayContact.count;
    }
    return true;
}

export function drawForgottenMuralGeneratedAssetFrame(ctx, prop, x, deps) {
  const {
    GROUND_Y,
    drawEgyptStructureGroundContactLayer,
    drawEgyptStructureWeatheringOverlay,
    forgottenMuralAlcoveStructureRef,
    stateRef,
  } = deps;
    const structureAsset = forgottenMuralAlcoveStructureRef.current;
    if (!structureAsset.loaded || !structureAsset.image) return false;

    const width = prop.width || 1420;
    const height = prop.height || 690;
    const drawX = x - width / 2;
    const drawY = prop.y;
    const left = drawX;
    const baseY = drawY + height;
    const groundY = Math.min(GROUND_Y - 2, baseY - 6);

    const underlayContact = drawEgyptStructureGroundContactLayer(ctx, prop.groundContactLayer, left, width, groundY, 'underlay');
    ctx.globalAlpha = prop.alpha ?? 0.98;
    ctx.filter = 'sepia(2%) saturate(102%) brightness(98%) contrast(104%)';
    ctx.drawImage(structureAsset.image, drawX, drawY, width, height);
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
    drawEgyptStructureWeatheringOverlay(ctx, left, width, groundY, { alpha: 0.86 });
    const overlayContact = drawEgyptStructureGroundContactLayer(ctx, prop.groundContactLayer, left, width, groundY, 'overlay');
    if (stateRef.current.renderStats) {
      stateRef.current.renderStats.forgottenMuralGroundBlendAssetKeys = Array.from(new Set([
        ...underlayContact.keys,
        ...overlayContact.keys,
      ]));
      stateRef.current.renderStats.forgottenMuralGroundBlendElementCount = underlayContact.count + overlayContact.count;
    }
    return true;
}

function drawScribeDoorwayGroundPocket(ctx, doorwayCenterX, groundY, width, visualAlpha, now = 0) {
  const pulse = 0.92 + Math.sin(now / 840) * 0.03;
  const pocketWidth = width * 0.42;
  ctx.save();

  const coreShadow = ctx.createRadialGradient(
    doorwayCenterX,
    groundY - 10,
    pocketWidth * 0.08,
    doorwayCenterX,
    groundY - 3,
    pocketWidth * 0.58,
  );
  coreShadow.addColorStop(0, `rgba(25, 15, 8, ${0.3 * visualAlpha * pulse})`);
  coreShadow.addColorStop(0.48, `rgba(48, 29, 13, ${0.18 * visualAlpha})`);
  coreShadow.addColorStop(1, 'rgba(48, 29, 13, 0)');
  ctx.fillStyle = coreShadow;
  ctx.beginPath();
  ctx.ellipse(doorwayCenterX, groundY + 2, pocketWidth * 0.54, 42, -0.03, 0, Math.PI * 2);
  ctx.fill();

  const sideShadow = ctx.createLinearGradient(
    doorwayCenterX - pocketWidth * 0.62,
    0,
    doorwayCenterX + pocketWidth * 0.72,
    0,
  );
  sideShadow.addColorStop(0, 'rgba(48, 29, 13, 0)');
  sideShadow.addColorStop(0.2, `rgba(43, 25, 12, ${0.12 * visualAlpha})`);
  sideShadow.addColorStop(0.48, `rgba(26, 15, 7, ${0.2 * visualAlpha})`);
  sideShadow.addColorStop(0.72, `rgba(76, 49, 23, ${0.1 * visualAlpha})`);
  sideShadow.addColorStop(1, 'rgba(76, 49, 23, 0)');
  ctx.fillStyle = sideShadow;
  ctx.beginPath();
  ctx.ellipse(doorwayCenterX + width * 0.02, groundY + 12, pocketWidth * 0.66, 26, 0.02, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(75, 47, 22, ${0.16 * visualAlpha})`;
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 9; i += 1) {
    const seed = Math.sin((doorwayCenterX + i * 71.3 + now * 0.03) * 0.017);
    const startX = doorwayCenterX - pocketWidth * (0.36 + (i % 3) * 0.07) + seed * 12;
    const startY = groundY + 2 + (i % 4) * 7;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      doorwayCenterX + seed * pocketWidth * 0.18,
      startY + 7 + seed * 4,
      doorwayCenterX + pocketWidth * (0.24 + (i % 4) * 0.05),
      startY + seed * 5,
    );
    ctx.stroke();
  }

  ctx.restore();
}

function drawScribeDoorwayForegroundOcclusion(ctx, left, width, doorwayCenterX, groundY, visualAlpha, now = 0) {
  ctx.save();
  const apronLeft = doorwayCenterX - width * 0.29;
  const apronRight = doorwayCenterX + width * 0.37;
  const sediment = ctx.createLinearGradient(0, groundY - 30, 0, groundY + 34);
  sediment.addColorStop(0, `rgba(111, 71, 32, ${0.04 * visualAlpha})`);
  sediment.addColorStop(0.48, `rgba(183, 123, 55, ${0.2 * visualAlpha})`);
  sediment.addColorStop(1, `rgba(238, 184, 102, ${0.07 * visualAlpha})`);
  ctx.fillStyle = sediment;
  ctx.beginPath();
  ctx.moveTo(apronLeft, groundY - 8);
  ctx.quadraticCurveTo(doorwayCenterX - width * 0.18, groundY - 26, doorwayCenterX - width * 0.04, groundY - 14);
  ctx.quadraticCurveTo(doorwayCenterX + width * 0.14, groundY - 3, apronRight, groundY - 18);
  ctx.lineTo(apronRight + width * 0.04, groundY + 28);
  ctx.quadraticCurveTo(doorwayCenterX + width * 0.1, groundY + 40, apronLeft - width * 0.04, groundY + 26);
  ctx.closePath();
  ctx.fill();

  [
    { x: left + width * 0.22, w: width * 0.22, h: 30, a: 0.18, r: -0.04 },
    { x: doorwayCenterX, w: width * 0.34, h: 36, a: 0.24, r: 0.01 },
    { x: left + width * 0.74, w: width * 0.2, h: 26, a: 0.14, r: 0.05 },
  ].forEach((patch) => {
    const g = ctx.createRadialGradient(patch.x, groundY, 8, patch.x, groundY + 6, patch.w * 0.58);
    g.addColorStop(0, `rgba(99, 60, 27, ${patch.a * visualAlpha})`);
    g.addColorStop(0.58, `rgba(168, 106, 45, ${patch.a * 0.5 * visualAlpha})`);
    g.addColorStop(1, 'rgba(168, 106, 45, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(patch.x, groundY + 8, patch.w * 0.5, patch.h, patch.r, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = 0; i < 18; i += 1) {
    const seed = Math.sin((doorwayCenterX * 0.011) + i * 1.93 + now * 0.001);
    const pebbleX = doorwayCenterX - width * 0.24 + ((i * 41) % Math.max(1, width * 0.52)) + seed * 9;
    const pebbleY = groundY - 18 + ((i * 17) % 52);
    ctx.fillStyle = i % 3 === 0
      ? `rgba(64, 40, 19, ${0.14 * visualAlpha})`
      : `rgba(205, 151, 78, ${0.12 * visualAlpha})`;
    ctx.beginPath();
    ctx.ellipse(pebbleX, pebbleY, 3 + (i % 4), 1.4 + (i % 2), seed * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

const getRelativeScribeDoorwayFilter = (grade = {}, defaults = {}) => {
  const safeGrade = grade || {};
  const safeDefaults = defaults || {};
  const brightness = (safeGrade.brightness ?? safeDefaults.brightness ?? 1) / (safeDefaults.brightness ?? 1);
  const saturate = (safeGrade.saturate ?? safeDefaults.saturate ?? 1) / (safeDefaults.saturate ?? 1);
  const contrast = (safeGrade.contrast ?? safeDefaults.contrast ?? 1) / (safeDefaults.contrast ?? 1);
  const sepia = safeGrade.sepia ?? safeDefaults.sepia ?? 0;
  const defaultSepia = safeDefaults.sepia ?? 0;
  const hue = (safeGrade.hue ?? safeDefaults.hue ?? 0) - (safeDefaults.hue ?? 0);
  const highlightClamp = safeGrade.highlightClamp ?? 1;
  return [
    `sepia(${Math.max(0, 5 + sepia - defaultSepia)}%)`,
    `hue-rotate(${hue}deg)`,
    `brightness(${0.96 * brightness * highlightClamp})`,
    `saturate(${1.04 * saturate})`,
    `contrast(${1.02 * contrast})`,
  ].join(' ');
};

export function drawScribeChamberDoorwayStructureFrame(ctx, prop, x, section, now, deps) {
  const {
    GROUND_Y,
    SCRIBE_CHAMBER_EXTERIOR_VERSION,
    drawContactShadow,
    drawEgyptStructureGroundContactLayer,
    drawEgyptStructureWeatheringOverlay,
    scribeChamberExteriorRef,
    stateRef,
  } = deps;
    const width = prop.width || 1120;
    const height = prop.height || 620;
    const left = x - width / 2;
    const top = prop.y;
    const baseY = top + height;
    const centerX = x;
    const visualAlpha = (prop.alpha ?? 1) * (prop.layerGrade?.alpha ?? 1);
    const doorwayXRatio = Number.isFinite(prop.assetDoorwayXRatio) ? prop.assetDoorwayXRatio : 0.35;
    const doorwayCenterX = left + width * doorwayXRatio;
    const pulse = 0.76 + Math.sin(now / 310) * 0.16;
    const lamp = 0.78 + Math.sin(now / 93) * 0.12;
    const current = stateRef.current;
    const discovered = Boolean(current.discoveredHiddenRouteIds?.has('scribe-locked-chamber-route'));
    const structureAsset = scribeChamberExteriorRef.current;

    if (structureAsset.loaded && structureAsset.image) {
      ctx.save();
      const groundY = Number.isFinite(prop.visualGroundY)
        ? prop.visualGroundY
        : Math.min(GROUND_Y - 3, baseY - 8);
      const underlayContact = drawEgyptStructureGroundContactLayer(ctx, prop.groundContactLayer, left, width, groundY, 'underlay');

      ctx.save();
      ctx.globalAlpha = 0.28 * visualAlpha;
      ctx.filter = 'brightness(0) sepia(30%) saturate(130%) blur(4px)';
      ctx.drawImage(structureAsset.image, left + width * 0.014, top + 10, width * 1.008, height * 1.006);
      ctx.restore();

      ctx.save();
      const baseShadow = ctx.createRadialGradient(centerX, groundY - 4, width * 0.08, centerX, groundY - 4, width * 0.52);
      baseShadow.addColorStop(0, `rgba(31, 18, 9, ${0.3 * visualAlpha})`);
      baseShadow.addColorStop(0.52, `rgba(39, 23, 12, ${0.18 * visualAlpha})`);
      baseShadow.addColorStop(1, 'rgba(39, 23, 12, 0)');
      ctx.fillStyle = baseShadow;
      ctx.beginPath();
      ctx.ellipse(centerX, groundY + 10, width * 0.5, 38, -0.02, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      drawScribeDoorwayGroundPocket(ctx, doorwayCenterX, groundY, width, visualAlpha, now);

      const gradeCanvas = hasLayerToneGrade(prop.layerGrade) ? createLayerGradeCanvas(Math.ceil(width), Math.ceil(height)) : null;
      const gradeCtx = gradeCanvas?.getContext?.('2d');
      const imageFilter = getRelativeScribeDoorwayFilter(prop.layerGrade, prop.layerGradeDefaults);
      if (gradeCtx) {
        gradeCtx.setTransform(1, 0, 0, 1, 0, 0);
        gradeCtx.clearRect(0, 0, gradeCanvas.width, gradeCanvas.height);
        gradeCtx.globalAlpha = 1;
        gradeCtx.globalCompositeOperation = 'source-over';
        gradeCtx.filter = imageFilter;
        gradeCtx.drawImage(structureAsset.image, 0, 0, gradeCanvas.width, gradeCanvas.height);
        gradeCtx.filter = 'none';
        applyLayerToneGrade(gradeCtx, gradeCanvas.width, gradeCanvas.height, prop.layerGrade);
        ctx.globalAlpha = visualAlpha;
        ctx.drawImage(gradeCanvas, left, top, width, height);
      } else {
        ctx.globalAlpha = visualAlpha;
        ctx.filter = imageFilter;
        ctx.drawImage(structureAsset.image, left, top, width, height);
      }
      ctx.filter = 'none';

      drawEgyptStructureWeatheringOverlay(ctx, left, width, groundY, { alpha: 0.92 });
      const overlayContact = drawEgyptStructureGroundContactLayer(ctx, prop.groundContactLayer, left, width, groundY, 'overlay');
      const groundBlendCount = underlayContact.count + overlayContact.count;
      drawScribeDoorwayForegroundOcclusion(ctx, left, width, doorwayCenterX, groundY, visualAlpha, now);

      ctx.globalCompositeOperation = 'screen';
      const doorwayGlow = ctx.createRadialGradient(doorwayCenterX, top + height * 0.42, 28, doorwayCenterX, top + height * 0.42, width * 0.2);
      doorwayGlow.addColorStop(0, `rgba(250, 204, 21, ${0.14 * pulse})`);
      doorwayGlow.addColorStop(0.52, `rgba(180, 83, 9, ${0.08 * pulse})`);
      doorwayGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = doorwayGlow;
      ctx.fillRect(doorwayCenterX - width * 0.24, top + height * 0.17, width * 0.48, height * 0.44);
      ctx.globalCompositeOperation = 'source-over';
      if (stateRef.current.renderStats) {
        stateRef.current.renderStats.scribeChamberExteriorVersion = SCRIBE_CHAMBER_EXTERIOR_VERSION;
        stateRef.current.renderStats.scribeChamberExteriorLoaded = true;
        stateRef.current.renderStats.scribeChamberDoorwayAnchorX = Math.round(doorwayCenterX);
        stateRef.current.renderStats.scribeChamberDoorwayGroundPocket = true;
        stateRef.current.renderStats.scribeChamberGroundBlendAssetKeys = Array.from(new Set([
          ...underlayContact.keys,
          ...overlayContact.keys,
        ]));
        stateRef.current.renderStats.scribeChamberGroundBlendElementCount = groundBlendCount;
        stateRef.current.renderStats.visibleWorldLandmarks = Array.from(new Set([
          ...(stateRef.current.renderStats.visibleWorldLandmarks || []),
          prop.id,
        ])).slice(-12);
      }
      ctx.restore();
      return true;
    }

    ctx.save();
    ctx.globalAlpha = prop.alpha ?? 1;
    drawContactShadow(ctx, centerX, Math.min(GROUND_Y - 2, baseY - 3), width * 0.72, 0.18, 1.25);
    const glow = ctx.createRadialGradient(centerX, top + height * 0.44, 22, centerX, top + height * 0.44, width * 0.64);
    glow.addColorStop(0, `rgba(250, 204, 21, ${0.2 * pulse})`);
    glow.addColorStop(0.46, `rgba(180, 83, 9, ${0.12 * pulse})`);
    glow.addColorStop(1, 'rgba(69, 26, 3, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(left - 90, top - 42, width + 180, height + 80);

    const stone = ctx.createLinearGradient(left, top, left + width, top + height);
    stone.addColorStop(0, '#2a1e17');
    stone.addColorStop(0.48, '#5a3f2a');
    stone.addColorStop(1, '#1f1510');
    ctx.fillStyle = stone;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.26)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(left + 18, top + 34, width - 36, height - 52, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(17, 12, 8, 0.94)';
    ctx.beginPath();
    ctx.roundRect(centerX - 54, top + 94, 108, height - 118, 34);
    ctx.fill();
    ctx.strokeStyle = `rgba(250, 204, 21, ${discovered ? 0.72 : 0.46})`;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
    ctx.fillRect(centerX - 48, top + height - 122, 96, 11);
    ctx.fillRect(centerX - 6, top + 106, 12, height - 132);
    ctx.fillStyle = `rgba(255, 231, 143, ${0.62 * pulse})`;
    ctx.beginPath();
    ctx.arc(centerX, top + 158, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 231, 143, ${0.78 * pulse})`;
    ctx.fillStyle = `rgba(250, 204, 21, ${0.5 * pulse})`;
    ctx.shadowColor = 'rgba(250, 204, 21, 0.8)';
    ctx.shadowBlur = 13;
    ctx.lineWidth = 2;
    const glyphY = top + 72;
    [-105, -72, 78, 112].forEach((offset, index) => {
      const gx = centerX + offset;
      if (index % 2 === 0) {
        ctx.beginPath();
        ctx.arc(gx, glyphY + 4, 8, 0, Math.PI * 2);
        ctx.stroke();
        for (let ray = 0; ray < 8; ray += 1) {
          const angle = (Math.PI * 2 * ray) / 8;
          ctx.beginPath();
          ctx.moveTo(gx + Math.cos(angle) * 12, glyphY + 4 + Math.sin(angle) * 12);
          ctx.lineTo(gx + Math.cos(angle) * 18, glyphY + 4 + Math.sin(angle) * 18);
          ctx.stroke();
        }
      } else {
        for (let row = 0; row < 3; row += 1) {
          ctx.beginPath();
          ctx.moveTo(gx - 16, glyphY - 8 + row * 8);
          for (let i = -16; i <= 12; i += 8) ctx.quadraticCurveTo(gx + i + 4, glyphY - 13 + row * 8, gx + i + 8, glyphY - 8 + row * 8);
          ctx.stroke();
        }
      }
    });
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(36, 20, 12, 0.72)';
    ctx.lineWidth = 2;
    [left + 58, left + width - 64].forEach((crackX, index) => {
      ctx.beginPath();
      ctx.moveTo(crackX, top + 78);
      ctx.lineTo(crackX + (index ? -10 : 14), top + 118);
      ctx.lineTo(crackX + (index ? -3 : 8), top + 172);
      ctx.stroke();
    });

    [-1, 1].forEach((side) => {
      const torchX = centerX + side * 126;
      ctx.strokeStyle = '#4a2b17';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(torchX - side * 9, top + 164);
      ctx.lineTo(torchX + side * 22, top + 220);
      ctx.stroke();
      ctx.fillStyle = `rgba(245, 158, 11, ${0.76 * lamp})`;
      ctx.shadowColor = 'rgba(250, 204, 21, 0.9)';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.ellipse(torchX, top + 150, 9, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    for (let step = 0; step < 4; step += 1) {
      const stepWidth = width * (0.38 + step * 0.08);
      ctx.fillStyle = `rgba(93, 64, 42, ${0.74 - step * 0.06})`;
      ctx.fillRect(centerX - stepWidth / 2, baseY - 18 + step * 7, stepWidth, 6);
    }
    if (stateRef.current.renderStats) {
      stateRef.current.renderStats.visibleWorldLandmarks = Array.from(new Set([
        ...(stateRef.current.renderStats.visibleWorldLandmarks || []),
        prop.id,
      ])).slice(-12);
    }
    ctx.restore();
    return true;
}

export function useJourneyExteriorStructureRenderers(deps) {
  return {
    drawLostBridgeRavineDepth: (ctx, platforms, cameraX, current) => (
      drawLostBridgeRavineDepthFrame(ctx, platforms, cameraX, current, deps)
    ),
    drawLostBridgeRavineForegroundVoid: (ctx, platforms, cameraX, current) => (
      drawLostBridgeRavineForegroundVoidFrame(ctx, platforms, cameraX, current, deps)
    ),
    drawLostBridgeStructure: (ctx, platforms, cameraX, current) => (
      drawLostBridgeStructureFrame(ctx, platforms, cameraX, current, deps)
    ),
    drawForgottenMuralGeneratedAsset: (ctx, prop, x) => (
      drawForgottenMuralGeneratedAssetFrame(ctx, prop, x, deps)
    ),
    drawMummificationChamberExteriorAsset: (ctx, prop, x, section, now) => (
      drawMummificationChamberExteriorAssetFrame(ctx, prop, x, section, now, deps)
    ),
    drawOpeningPyramidMasonryBack: (ctx, cameraX, now = 0, current) => (
      drawOpeningPyramidMasonryBackFrame(ctx, cameraX, now, current, deps)
    ),
    drawScribeChamberDoorwayStructure: (ctx, prop, x, section, now) => (
      drawScribeChamberDoorwayStructureFrame(ctx, prop, x, section, now, deps)
    ),
  };
}
