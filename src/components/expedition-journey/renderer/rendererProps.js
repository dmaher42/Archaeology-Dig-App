import { drawForegroundSettlingDetailsFrame } from './rendererPlatforms.js';
import { DESERT_LAYER_TUNING, DESERT_LAYER_TUNING_DEFAULTS } from '../desertLayerTuning.js';

export function drawPropGroundContactFrame(ctx, x, anchorY, propSize, sectionId, grounding, deps) {
  const { drawContactShadow } = deps;
  if (grounding.shadowOpacity <= 0) return;
  drawContactShadow(
    ctx,
    x,
    anchorY + 3,
    grounding.shadowWidth,
    grounding.shadowOpacity,
    1.2,
    { height: grounding.shadowHeight, color: 'rgba(31, 19, 8, 0.96)' },
  );
}

export function drawPropSandOcclusionFrame(ctx, x, anchorY, propSize, sectionId, grounding) {
  if (sectionId === 'desert-entry') return;
  if (grounding.sandOverlapHeight <= 0) return;
  const moundW = grounding.sandMoundWidth;
  const moundH = grounding.sandMoundHeight;
  const overlapH = grounding.sandOverlapHeight;
  const pebbleCount = Math.round(grounding.groundPebbles);
  const seed = grounding.seed;
  const isCatacombs = sectionId === 'catacombs';
  const isEscape = sectionId === 'escape-sequence';
  const isDesert = sectionId === 'desert-entry';
  const fillColor = isCatacombs
    ? 'rgba(82, 66, 48, 0.72)'
    : isEscape
      ? 'rgba(152, 97, 52, 0.70)'
      : isDesert
        ? 'rgba(210, 158, 88, 0.74)'
        : 'rgba(190, 128, 62, 0.70)';
  const rimColor = isCatacombs
    ? 'rgba(108, 87, 62, 0.38)'
    : isDesert
      ? 'rgba(230, 178, 102, 0.40)'
      : 'rgba(210, 150, 78, 0.36)';
  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.ellipse(x, anchorY, moundW / 2, moundH / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.72;
  ctx.strokeStyle = rimColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x, anchorY - moundH * 0.18, moundW * 0.44, moundH * 0.28, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  if (overlapH > 0) {
    const overlapY = anchorY - overlapH;
    const overlapGrad = ctx.createLinearGradient(0, overlapY, 0, anchorY + moundH * 0.5);
    overlapGrad.addColorStop(0, 'rgba(0,0,0,0)');
    overlapGrad.addColorStop(0.4, isCatacombs ? 'rgba(72, 57, 42, 0.44)' : isDesert ? 'rgba(210, 155, 82, 0.48)' : 'rgba(185, 122, 56, 0.46)');
    overlapGrad.addColorStop(1, isCatacombs ? 'rgba(60, 46, 34, 0.58)' : isDesert ? 'rgba(195, 143, 72, 0.60)' : 'rgba(172, 112, 48, 0.58)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = overlapGrad;
    ctx.fillRect(x - moundW / 2 - 2, overlapY, moundW + 4, overlapH + moundH * 0.5);
  }
  if (pebbleCount > 0) {
    const pebbleColor = isCatacombs ? 'rgba(55, 44, 33, 0.72)' : isDesert ? 'rgba(148, 108, 60, 0.68)' : 'rgba(130, 92, 44, 0.64)';
    ctx.globalAlpha = 1;
    ctx.fillStyle = pebbleColor;
    for (let i = 0; i < pebbleCount; i++) {
      const t = (seed * 7 + i * 137) % 1000 / 1000;
      const px = x + (t - 0.5) * moundW * 0.9;
      const py = anchorY - ((seed * 3 + i * 53) % 100) / 100 * moundH * 0.6;
      const pr = 1.5 + ((seed + i * 23) % 10) / 10 * 2;
      ctx.beginPath();
      ctx.ellipse(px, py, pr, pr * 0.6, t * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export const getStoryPropVisibilityWidth = (prop = {}, getStoryPropEditorSize) => {
  const propSize = typeof getStoryPropEditorSize === 'function'
    ? getStoryPropEditorSize(prop)
    : null;
  const baseWidth = Number.isFinite(propSize?.width)
    ? propSize.width
    : Number(prop.width) || 0;
  const widthScale = Number.isFinite(prop.widthScale)
    ? Math.max(0.2, Math.min(3, prop.widthScale))
    : 1;
  return Math.max(440, baseWidth * widthScale);
};

export function drawStoryPropFrame(ctx, prop, cameraX, now, requestedDepth = null, deps) {
  const {
    DRAW_JOURNEY_FLAG_MARKERS,
    ENVIRONMENT_ASSET_PACK_IDS,
    JOURNEY_FLAG_VISUAL_MODE,
    PROP_GROUNDING_CONFIG,
    PROP_GROUNDING_INTEGRATION_VERSION,
    ROUTE_GATE_STANDALONE_PROP_COLOR_GRADE_FILTER,
    STORY_PROP_GROUNDING_OVERRIDES,
    atmosphereEnvironmentAssetsRef,
    clamp,
    collectibleSpriteAssetsRef,
    drawAtlasRegion,
    drawCollectibleAtlasRegion,
    drawContactShadow,
    drawDecorativeBaseBlend,
    drawEgyptStructureGroundContactLayer,
    drawForgottenMuralGeneratedAsset,
    drawGroundDustLip,
    drawMarkerSprite,
    drawMummificationChamberExteriorAsset,
    drawScribeChamberDoorwayStructure,
    environmentAssetsRef,
    getEnvironmentAssetKeyForStoryProp,
    getGeneratedStoryPropRenderProp,
    getJourneyPaintTintBuffer,
    getScaledDetailContactLayer,
    getSectionForX,
    getStandaloneImagePropAsset,
    getStoryPropAnchorY,
    getStoryPropDepth,
    getStoryPropEditorBounds,
    getStoryPropEditorSize,
    getStoryPropPlacementPreset,
    isHorizontallyVisible,
    isLostBridgeRavineSpecialRendererProp,
    markerSpriteAssetsRef,
    propPlacementEditorRef,
    resolvePropGroundingSettings,
    shouldGroundLockAtmosphereProp,
    stateRef,
    worldToScreenX,
  } = deps;
  const drawPropGroundContact = (innerCtx, x, anchorY, propSize, sectionId, grounding) => (
    drawPropGroundContactFrame(innerCtx, x, anchorY, propSize, sectionId, grounding, deps)
  );
  const drawPropSandOcclusion = (innerCtx, x, anchorY, propSize, sectionId, grounding) => (
    drawPropSandOcclusionFrame(innerCtx, x, anchorY, propSize, sectionId, grounding)
  );
  const propDepth = getStoryPropDepth(prop);
  if (requestedDepth && propDepth !== requestedDepth) return;
  // Scene Outliner: props toggled off in the outliner are hidden while the editor
  // is open (view-only — never affects gameplay or the export).
  if (import.meta.env.DEV) {
    const outlinerEditor = propPlacementEditorRef.current;
    if (outlinerEditor?.enabled && outlinerEditor.hiddenIds?.has(prop.id)) return;
  }
  const x = worldToScreenX(prop.x, cameraX);
  const visibilityWidth = getStoryPropVisibilityWidth(prop, getStoryPropEditorSize);
  if (!isHorizontallyVisible(prop.x - visibilityWidth / 2, visibilityWidth, cameraX)) return;

  ctx.save();
  const section = getSectionForX(prop.x);
  if (prop.id === 'opening-warrior-guide-marker') {
    ctx.restore();
    return;
  }
  if (isLostBridgeRavineSpecialRendererProp(prop)) {
    ctx.restore();
    return;
  }
  if (Number.isFinite(prop.alpha) && prop.alpha <= 0) {
    ctx.restore();
    return;
  }
  if (Number.isFinite(prop.rotation) && prop.rotation !== 0) {
    const bounds = getStoryPropEditorBounds(prop, cameraX, stateRef.current);
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((prop.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }
  if (prop.type === 'ground-contact-detail-prop' || prop.type === 'foreground-depth-detail-prop') {
    const detailSize = getStoryPropEditorSize(prop);
    const width = detailSize.width;
    const groundY = prop.y + (Number.isFinite(prop.yOffset) ? prop.yOffset : 0);
    const left = x - width / 2;
    const detailColorFilter = typeof prop.colorGradeFilter === 'string' && prop.colorGradeFilter.trim() && prop.colorGradeFilter.trim() !== 'none'
      ? prop.colorGradeFilter.trim()
      : '';
    const detailBrightnessFilter = Number.isFinite(prop.brightness) && prop.brightness !== 1
      ? `brightness(${Math.round(clamp(prop.brightness, 0.4, 1.8) * 100)}%)`
      : '';
    const detailFilter = [detailColorFilter, detailBrightnessFilter].filter(Boolean).join(' ');
    const scaledDetailContactLayer = getScaledDetailContactLayer(prop, detailSize);
    const detailContactLayer = detailFilter
      ? scaledDetailContactLayer.map((entry) => ({
        ...entry,
        filter: [entry.filter, detailFilter].filter(Boolean).join(' '),
      }))
      : scaledDetailContactLayer;
    const underlayContact = drawEgyptStructureGroundContactLayer(ctx, detailContactLayer, left, width, groundY, 'underlay');
    const overlayContact = drawEgyptStructureGroundContactLayer(ctx, detailContactLayer, left, width, groundY, 'overlay');
    if (stateRef.current.renderStats) {
      stateRef.current.renderStats.groundDetailPropCount = (stateRef.current.renderStats.groundDetailPropCount || 0) + 1;
      stateRef.current.renderStats.groundDetailAssetKeys = Array.from(new Set([
        ...(stateRef.current.renderStats.groundDetailAssetKeys || []),
        ...underlayContact.keys,
        ...overlayContact.keys,
      ]));
    }
    ctx.restore();
    return;
  }
  if (prop.type === 'collectible-shard-prop') {
    const detailSize = getStoryPropEditorSize(prop);
    const width = detailSize.width;
    const height = detailSize.height;
    const drawX = x - width / 2;
    const drawY = prop.y + (Number.isFinite(prop.yOffset) ? prop.yOffset : 0) - height / 2;
    const colorFilter = typeof prop.colorGradeFilter === 'string' && prop.colorGradeFilter.trim() && prop.colorGradeFilter.trim() !== 'none'
      ? prop.colorGradeFilter.trim()
      : '';
    const brightnessFilter = Number.isFinite(prop.brightness) && prop.brightness !== 1
      ? `brightness(${Math.round(clamp(prop.brightness, 0.4, 1.8) * 100)}%)`
      : '';
    const filter = [colorFilter, brightnessFilter].filter(Boolean).join(' ');
    if (filter) ctx.filter = filter;
    const shadowOpacity = Number.isFinite(prop.shadowOpacity) ? clamp(prop.shadowOpacity, 0, 1) : 0.18;
    if (shadowOpacity > 0) drawContactShadow(ctx, x, drawY + height + 2, width * 0.72, shadowOpacity, 0.82);
    ctx.globalAlpha = Number.isFinite(prop.alpha) ? clamp(prop.alpha, 0, 1) : 1;
    const drawn = drawCollectibleAtlasRegion(
      ctx,
      collectibleSpriteAssetsRef.current,
      prop.collectibleSpriteKey,
      { x: drawX, y: drawY, width, height },
    );
    if (stateRef.current.renderStats && drawn) {
      stateRef.current.renderStats.shardPropCount = (stateRef.current.renderStats.shardPropCount || 0) + 1;
      stateRef.current.renderStats.shardPropSpriteKeys = Array.from(new Set([
        ...(stateRef.current.renderStats.shardPropSpriteKeys || []),
        prop.collectibleSpriteKey,
      ]));
    }
    ctx.restore();
    return;
  }
  const propForAsset = prop;
  const atmospherePropAssetKey = propForAsset.atmosphereAssetKey
    ? getEnvironmentAssetKeyForStoryProp(propForAsset, ENVIRONMENT_ASSET_PACK_IDS.EGYPT_ATMOSPHERE)
    : null;
  const propAssetKey = atmospherePropAssetKey
    || getEnvironmentAssetKeyForStoryProp(propForAsset, environmentAssetsRef.current.packId);
  const standalonePropAsset = getStandaloneImagePropAsset(propForAsset);
  if (propAssetKey || (standalonePropAsset?.loaded && standalonePropAsset.image)) {
    const placementPreset = getStoryPropPlacementPreset(propForAsset) || {};
    const propSize = {
      ...(PROP_GROUNDING_CONFIG[propForAsset.type] || { width: 72, height: 72, yOffset: 0, alpha: 1, depth: 'midground', tint: 'warm' }),
      ...(STORY_PROP_GROUNDING_OVERRIDES[prop.id] || {}),
      ...placementPreset,
      ...(Number.isFinite(propForAsset.width) ? { width: propForAsset.width } : {}),
      ...(Number.isFinite(propForAsset.height) ? { height: propForAsset.height } : {}),
      ...(Number.isFinite(propForAsset.yOffset) ? { yOffset: propForAsset.yOffset } : {}),
      ...(Number.isFinite(propForAsset.alpha) ? { alpha: propForAsset.alpha } : {}),
      ...(Number.isFinite(propForAsset.shadow) ? { shadow: propForAsset.shadow } : {}),
      ...(Number.isFinite(propForAsset.dust) ? { dust: propForAsset.dust } : {}),
      ...(Number.isFinite(propForAsset.bury) ? { bury: propForAsset.bury } : {}),
      ...(Number.isFinite(propForAsset.scale) ? { scale: propForAsset.scale } : {}),
      ...(Number.isFinite(propForAsset.brightness) ? { brightness: propForAsset.brightness } : {}),
      ...(Number.isFinite(propForAsset.burialDepth) ? { burialDepth: propForAsset.burialDepth } : {}),
      ...(Number.isFinite(propForAsset.shadowWidth) ? { shadowWidth: propForAsset.shadowWidth } : {}),
      ...(Number.isFinite(propForAsset.shadowHeight) ? { shadowHeight: propForAsset.shadowHeight } : {}),
      ...(Number.isFinite(propForAsset.shadowOpacity) ? { shadowOpacity: propForAsset.shadowOpacity } : {}),
      ...(Number.isFinite(propForAsset.sandOverlapHeight) ? { sandOverlapHeight: propForAsset.sandOverlapHeight } : {}),
      ...(Number.isFinite(propForAsset.sandMoundWidth) ? { sandMoundWidth: propForAsset.sandMoundWidth } : {}),
      ...(Number.isFinite(propForAsset.sandMoundHeight) ? { sandMoundHeight: propForAsset.sandMoundHeight } : {}),
      ...(Number.isFinite(propForAsset.groundPlaneY) ? { groundPlaneY: propForAsset.groundPlaneY } : {}),
      ...(Number.isFinite(propForAsset.groundPlaneOffset) ? { groundPlaneOffset: propForAsset.groundPlaneOffset } : {}),
      ...(Number.isFinite(propForAsset.assetContactYRatio) ? { assetContactYRatio: propForAsset.assetContactYRatio } : {}),
      ...(Number.isFinite(propForAsset.sandSeed) ? { sandSeed: propForAsset.sandSeed } : {}),
      ...(Number.isFinite(propForAsset.groundPebbles) ? { groundPebbles: propForAsset.groundPebbles } : {}),
      ...(Number.isFinite(propForAsset.zIndex) ? { zIndex: propForAsset.zIndex } : {}),
      ...(propForAsset.layer ? { layer: propForAsset.layer } : {}),
      ...(propForAsset.depth ? { depth: propForAsset.depth } : {}),
      ...(propForAsset.tint ? { tint: propForAsset.tint } : {}),
      ...(propForAsset.sceneBlend ? { sceneBlend: propForAsset.sceneBlend } : {}),
      ...(standalonePropAsset ? { colorGradeFilter: ROUTE_GATE_STANDALONE_PROP_COLOR_GRADE_FILTER } : {}),
      ...(propForAsset.colorGradeFilter ? { colorGradeFilter: propForAsset.colorGradeFilter } : {}),
      ...(typeof propForAsset.paintColor === 'string' && propForAsset.paintColor ? { paintColor: propForAsset.paintColor } : {}),
      ...(Number.isFinite(propForAsset.paintStrength) ? { paintStrength: propForAsset.paintStrength } : {}),
    };
    if (Number.isFinite(propSize.scale)) {
      propSize.width *= propSize.scale;
      propSize.height *= propSize.scale;
    }
    // Horizontal-only squash: narrows the prop along its own width axis (the draw
    // frame is already rotated, so this thins the silhouette regardless of tilt)
    // without changing its height — unlike scale/width, which resize uniformly.
    const horizontalSquash = Number.isFinite(propForAsset.widthScale)
      ? clamp(propForAsset.widthScale, 0.2, 3)
      : 1;
    const shouldGroundLock = shouldGroundLockAtmosphereProp(propForAsset, propDepth);
    if (shouldGroundLock) {
      if (propDepth === 'grounded') propSize.depth = 'grounded';
      propSize.alpha = Number.isFinite(propForAsset.alpha) ? propForAsset.alpha : Math.max(propSize.alpha ?? 0.82, 0.86);
      propSize.shadow = Math.max(propSize.shadow ?? 0.14, 0.2);
      propSize.dust = Math.max(propSize.dust ?? 0.72, 0.84);
      propSize.bury = Math.max(propSize.bury ?? 0.12, 0.2);
    }
    const propAssets = atmospherePropAssetKey
      ? atmosphereEnvironmentAssetsRef.current
      : environmentAssetsRef.current;
    const drawX = x - propSize.width / 2;
    const propGrounding = resolvePropGroundingSettings({ ...propSize, x: propForAsset.x });
    const anchorY = getStoryPropAnchorY(prop, propSize, shouldGroundLock);
    const drawY = anchorY - propSize.height * propGrounding.contactRatio;
    const shouldDrawPropShadow = propGrounding.shadowOpacity > 0;
    drawPropGroundContact(ctx, x, anchorY, propSize, section.id, propGrounding);
    ctx.globalAlpha = propSize.alpha ?? 1;
    const propColorFilter = (() => {
      if (propSize.colorGradeFilter) return propSize.colorGradeFilter;
      if (propSize.sceneBlend === 'desert-entry-sand') return 'sepia(12%) saturate(88%) brightness(92%) contrast(98%)';
      if (propSize.tint === 'stone') return 'sepia(8%) saturate(78%) brightness(90%)';
      if (propSize.tint === 'cool') return 'saturate(62%) brightness(78%) contrast(90%)';
      if (propSize.tint === 'dust') return 'sepia(20%) saturate(58%) brightness(84%) contrast(88%)';
      if (propSize.tint === 'buried-stone') return 'sepia(28%) saturate(72%) brightness(78%) contrast(88%)';
      if (propSize.tint === 'warm') return 'sepia(10%) saturate(86%) brightness(92%)';
      return 'none';
    })();
    if (propColorFilter && propColorFilter !== 'none') ctx.filter = propColorFilter;
    if (shouldDrawPropShadow) {
      if (propSize.colorGradeFilter) {
        ctx.shadowColor = 'rgba(57, 32, 12, 0.24)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 2;
      } else if (propSize.sceneBlend === 'desert-entry-sand') {
        ctx.shadowColor = 'rgba(57, 32, 12, 0.28)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
      } else if (propSize.depth === 'route-edge') {
        ctx.shadowColor = 'rgba(35, 21, 10, 0.62)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
      }
    }
    if (Number.isFinite(propSize.brightness) && propSize.brightness !== 1) {
      const baseFilter = ctx.filter && ctx.filter !== 'none' ? `${ctx.filter} ` : '';
      ctx.filter = `${baseFilter}brightness(${Math.round(clamp(propSize.brightness, 0.4, 1.8) * 100)}%)`;
    }
    const drawStandalonePropAsset = (targetCtx, image, target) => {
      if (!image) return false;
      const sourceWidth = Number(image.naturalWidth || image.width) || target.width;
      const sourceHeight = Number(image.naturalHeight || image.height) || target.height;
      if (!sourceWidth || !sourceHeight) return false;
      const containScale = Math.min(target.width / sourceWidth, target.height / sourceHeight);
      const drawWidth = sourceWidth * containScale;
      const drawHeight = sourceHeight * containScale;
      targetCtx.drawImage(
        image,
        target.x + (target.width - drawWidth) / 2,
        target.y + (target.height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
      return true;
    };
    const drawPropImageAsset = (targetCtx, target) => (
      standalonePropAsset?.loaded && standalonePropAsset.image
        ? drawStandalonePropAsset(targetCtx, standalonePropAsset.image, target)
        : drawAtlasRegion(targetCtx, propAssets, propAssetKey, target, { mode: 'contain' })
    );
    // Render the sprite into an offscreen buffer, multiply the paint colour onto only
    // its opaque pixels (re-masked via destination-in), and return the buffer so the
    // caller can composite it at paintStrength. Returns null if nothing drew.
    const buildPaintTintBuffer = (paintColor) => {
      const bw = Math.max(1, Math.ceil(propSize.width));
      const bh = Math.max(1, Math.ceil(propSize.height));
      const assetSignature = standalonePropAsset?.image
        ? `standalone:${propForAsset.assetPath || propForAsset.imageAssetKey || standalonePropAsset.image.currentSrc || standalonePropAsset.image.src || 'image'}`
        : `atlas:${propAssets?.packId || 'environment'}:${propAssetKey}`;
      const cacheKey = [
        propForAsset.id || 'prop',
        assetSignature,
        bw,
        bh,
        propColorFilter || 'none',
        paintColor,
      ].join('|');
      const buffer = getJourneyPaintTintBuffer(bw, bh, cacheKey, (bctx, entry) => {
        bctx.setTransform(1, 0, 0, 1, 0, 0);
        bctx.globalAlpha = 1;
        bctx.globalCompositeOperation = 'source-over';
        bctx.clearRect(0, 0, entry.width, entry.height);
        const target = { x: 0, y: 0, width: bw, height: bh };
        bctx.filter = propColorFilter && propColorFilter !== 'none' ? propColorFilter : 'none';
        const drew = drawPropImageAsset(bctx, target);
        bctx.filter = 'none';
        if (!drew) return false;
        bctx.globalCompositeOperation = 'multiply';
        bctx.fillStyle = paintColor;
        bctx.fillRect(0, 0, bw, bh);
        bctx.globalCompositeOperation = 'destination-in';
        drawPropImageAsset(bctx, target);
        bctx.globalCompositeOperation = 'source-over';
        return true;
      });
      if (!buffer) return null;
      return { canvas: buffer.canvas, width: bw, height: bh };
    };
    const paintColor = typeof propSize.paintColor === 'string' && /^#([0-9a-f]{6})$/i.test(propSize.paintColor.trim())
      ? propSize.paintColor.trim()
      : '';
    const paintStrength = paintColor ? clamp(Number(propSize.paintStrength) || 0, 0, 1) : 0;
    const drawTransformedPropAsset = () => {
      ctx.save();
      ctx.translate(drawX + propSize.width / 2, drawY + propSize.height / 2);
      ctx.scale((propForAsset.mirrorX ? -1 : 1) * horizontalSquash, propForAsset.mirrorY ? -1 : 1);
      const local = {
        x: -propSize.width / 2,
        y: -propSize.height / 2,
        width: propSize.width,
        height: propSize.height,
      };
      const didDraw = drawPropImageAsset(ctx, local);
      if (didDraw && paintStrength > 0) {
        const tinted = buildPaintTintBuffer(paintColor);
        if (tinted) {
          const baseAlpha = ctx.globalAlpha;
          ctx.filter = 'none';
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
          ctx.globalAlpha = baseAlpha * paintStrength;
          ctx.drawImage(
            tinted.canvas,
            0, 0, tinted.width, tinted.height,
            local.x, local.y, local.width, local.height,
          );
          ctx.globalAlpha = baseAlpha;
        }
      }
      ctx.restore();
      return didDraw;
    };
    const drawn = drawTransformedPropAsset();
    if (drawn) {
      ctx.filter = 'none';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.globalAlpha = 1;
      drawPropSandOcclusion(ctx, x, anchorY, propSize, section.id, propGrounding);
      if (stateRef.current.renderStats) stateRef.current.renderStats.groundedPropCount += 1;
      if (atmospherePropAssetKey && stateRef.current.renderStats) {
        stateRef.current.renderStats.atmospherePropCount += 1;
        if (shouldGroundLock) stateRef.current.renderStats.groundLockedAtmospherePropCount += 1;
        stateRef.current.renderStats.propGroundingIntegrationVersion = PROP_GROUNDING_INTEGRATION_VERSION;
      }
      ctx.restore();
      return;
    }
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
  }
  if (prop.type === 'generated-opening-pyramid-facade') {
    ctx.restore();
    return;
  }
  if (prop.type === 'generated-mummification-chamber-entrance') {
    drawMummificationChamberExteriorAsset(ctx, getGeneratedStoryPropRenderProp(prop), x, section, now);
    ctx.restore();
    return;
  }
  if (prop.type === 'generated-climb-structure') {
    drawForgottenMuralGeneratedAsset(ctx, getGeneratedStoryPropRenderProp(prop), x);
    ctx.restore();
    return;
  }
  if (prop.type === 'generated-scribe-chamber-doorway') {
    drawScribeChamberDoorwayStructure(ctx, {
      ...getGeneratedStoryPropRenderProp(prop),
      layerGrade: DESERT_LAYER_TUNING.thresholdBuildingGrade,
      layerGradeDefaults: DESERT_LAYER_TUNING_DEFAULTS.thresholdBuildingGrade,
    }, x, section, now);
    ctx.restore();
    return;
  }
  ctx.globalAlpha *= propDepth === 'background' ? 0.5 : 0.78;
  if (prop.type === 'ruins') {
    drawContactShadow(ctx, x, prop.y + 66, 108, 0.12, 1.4);
    drawDecorativeBaseBlend(ctx, x, prop.y + 66, 86, section.id, propDepth, 0.7);
    ctx.fillStyle = 'rgba(92, 64, 51, 0.32)';
    ctx.fillRect(x - 52, prop.y + 18, 104, 48);
    ctx.fillStyle = 'rgba(48, 31, 21, 0.28)';
    [-34, -12, 12, 34].forEach(offset => ctx.fillRect(x + offset, prop.y - 16, 14, 82));
    ctx.strokeStyle = 'rgba(255, 244, 212, 0.28)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 60, prop.y - 18);
    ctx.lineTo(x, prop.y - 48);
    ctx.lineTo(x + 60, prop.y - 18);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (prop.type === 'door') {
    drawContactShadow(ctx, x, prop.y + 160, 128, 0.12, 1.4);
    drawDecorativeBaseBlend(ctx, x, prop.y + 160, 92, section.id, propDepth, 0.7);
    ctx.fillStyle = 'rgba(42, 28, 20, 0.62)';
    ctx.fillRect(x - 62, prop.y, 124, 158);
    ctx.fillStyle = 'rgba(140, 98, 54, 0.68)';
    ctx.fillRect(x - 76, prop.y - 18, 152, 24);
    [-54, 54].forEach(offset => {
      ctx.fillStyle = 'rgba(92, 64, 51, 0.8)';
      ctx.fillRect(x + offset - 14, prop.y, 28, 160);
      ctx.strokeStyle = 'rgba(255, 236, 180, 0.22)';
      ctx.strokeRect(x + offset - 10, prop.y + 12, 20, 42);
      ctx.strokeRect(x + offset - 10, prop.y + 66, 20, 42);
    });
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.28)';
    ctx.lineWidth = 4;
    ctx.strokeRect(x - 36, prop.y + 24, 72, 112);
    ctx.restore();
    return;
  }
  if (prop.type === 'statue') {
    drawContactShadow(ctx, x, prop.y + 84, 86, 0.14, 1.4);
    drawDecorativeBaseBlend(ctx, x, prop.y + 84, 68, section.id, propDepth, 0.7);
    ctx.fillStyle = 'rgba(71, 85, 105, 0.62)';
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x - 24, prop.y - 28, 48, 32, 8);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(x - 34, prop.y + 2, 68, 70, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(20, 184, 166, 0.55)';
    ctx.fillRect(x - 8, prop.y + 24, 16, 16);
    ctx.fillStyle = 'rgba(71, 85, 105, 0.62)';
    ctx.fillRect(x - 48, prop.y + 68, 96, 14);
    ctx.restore();
    return;
  }
  if (prop.type === 'mural') {
    drawDecorativeBaseBlend(ctx, x, prop.y + 64, 140, section.id, propDepth, 0.46);
    ctx.fillStyle = 'rgba(49, 32, 21, 0.55)';
    ctx.fillRect(x - 88, prop.y - 26, 176, 92);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.34)';
    ctx.lineWidth = 2;
    for (let i = -64; i <= 64; i += 32) {
      ctx.strokeRect(x + i - 10, prop.y - 4, 20, 28);
      ctx.beginPath();
      ctx.moveTo(x + i - 14, prop.y + 42);
      ctx.lineTo(x + i + 14, prop.y + 32);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255, 247, 212, 0.22)';
    ctx.strokeRect(x - 78, prop.y - 18, 156, 76);
    ctx.restore();
    return;
  }
  if (prop.type === 'camp') {
    drawContactShadow(ctx, x, prop.y + 38, 88, 0.14, 1.4);
    drawDecorativeBaseBlend(ctx, x, prop.y + 38, 66, section.id, propDepth, 0.72);
    ctx.fillStyle = 'rgba(120, 53, 15, 0.45)';
    ctx.fillRect(x - 38, prop.y + 18, 76, 18);
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 46, prop.y + 18);
    ctx.lineTo(x - 18, prop.y - 18);
    ctx.lineTo(x + 12, prop.y + 18);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (prop.type === 'cart') {
    drawContactShadow(ctx, x, prop.y + 20, 92, 0.14, 1.3);
    drawDecorativeBaseBlend(ctx, x, prop.y + 22, 78, section.id, propDepth, 0.66);
    ctx.fillStyle = 'rgba(120, 53, 15, 0.46)';
    ctx.fillRect(x - 42, prop.y - 8, 72, 22);
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.56)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 48, prop.y - 14);
    ctx.lineTo(x + 38, prop.y + 10);
    ctx.stroke();
    [-24, 24].forEach((offset) => {
      ctx.fillStyle = 'rgba(41, 24, 12, 0.58)';
      ctx.beginPath();
      ctx.arc(x + offset, prop.y + 20, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.18)';
      ctx.stroke();
    });
    ctx.fillStyle = 'rgba(245, 158, 11, 0.42)';
    ctx.fillRect(x - 18, prop.y - 20, 30, 12);
    ctx.restore();
    return;
  }
  if (prop.type === 'glyphs') {
    drawDecorativeBaseBlend(ctx, x, prop.y + 62, 140, section.id, propDepth, 0.42);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.52)';
    ctx.fillRect(x - 82, prop.y - 30, 164, 90);
    ctx.strokeStyle = `rgba(125, 211, 252, ${0.38 + Math.sin(now / 350) * 0.12})`;
    ctx.lineWidth = 2;
    for (let i = -54; i <= 54; i += 36) {
      ctx.beginPath();
      ctx.arc(x + i, prop.y + 6, 12, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.strokeRect(x + i - 8, prop.y + 30, 16, 16);
    }
    ctx.restore();
    return;
  }
  if (prop.type === 'eyes') {
    ctx.fillStyle = `rgba(125, 211, 252, ${0.28 + Math.sin(now / 280) * 0.12})`;
    [-16, 16].forEach(offset => {
      ctx.beginPath();
      ctx.ellipse(x + offset, prop.y, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
    return;
  }
  if (prop.type === 'bridge') {
    drawContactShadow(ctx, x, prop.y + 50, 164, 0.18, 1.2);
    drawDecorativeBaseBlend(ctx, x, prop.y + 50, 128, section.id, propDepth, 0.76);
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.62)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x - 90, prop.y + 34);
    ctx.lineTo(x + 90, prop.y + 22);
    ctx.stroke();
    ctx.lineWidth = 3;
    for (let i = -70; i <= 70; i += 28) {
      ctx.beginPath();
      ctx.moveTo(x + i, prop.y + 16);
      ctx.lineTo(x + i + 10, prop.y + 44);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }
  if (prop.type === 'sign') {
    if (!DRAW_JOURNEY_FLAG_MARKERS) {
      if (stateRef.current.renderStats) {
        stateRef.current.renderStats.journeyFlagVisualMode = JOURNEY_FLAG_VISUAL_MODE;
        stateRef.current.renderStats.removedRouteFlagCount += 1;
      }
      ctx.restore();
      return;
    }
    const flagHeight = 104;
    const flagWidth = 96;
    const flagBaseY = prop.y + 42;
    drawForegroundSettlingDetailsFrame(ctx, x, flagBaseY + 1, 74, section.id, {
      intensity: propDepth === 'background' ? 0.52 : 0.78,
      seed: Math.round(prop.x),
      stones: 4,
    }, deps);
    drawContactShadow(ctx, x, flagBaseY + 1, 52, 0.15, 1);
    const flagDest = {
      x: x - flagWidth / 2,
      y: flagBaseY - flagHeight,
      width: flagWidth,
      height: flagHeight,
    };
    const flagDrawn = drawMarkerSprite(
      ctx,
      markerSpriteAssetsRef.current,
      'flag',
      flagDest,
      0,
    );
    if (flagDrawn) {
      const assets = markerSpriteAssetsRef.current;
      const fixedPoleRegion = assets?.atlas?.regions?.flag_00;
      if (assets?.image && fixedPoleRegion) {
        const containScale = Math.min(flagDest.width / fixedPoleRegion.w, flagDest.height / fixedPoleRegion.h);
        const renderedWidth = fixedPoleRegion.w * containScale;
        const renderedHeight = fixedPoleRegion.h * containScale;
        const renderX = flagDest.x + (flagDest.width - renderedWidth) / 2;
        const renderY = flagDest.y + (flagDest.height - renderedHeight) / 2;
        const poleSourceWidth = fixedPoleRegion.w * 0.38;
        ctx.drawImage(
          assets.image,
          fixedPoleRegion.x,
          fixedPoleRegion.y,
          poleSourceWidth,
          fixedPoleRegion.h,
          renderX,
          renderY,
          poleSourceWidth * containScale,
          renderedHeight,
        );
      }
      ctx.fillStyle = 'rgba(92, 49, 18, 0.34)';
      ctx.beginPath();
      ctx.roundRect(x - 10, flagBaseY - 4, 20, 10, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(180, 116, 52, 0.34)';
      ctx.beginPath();
      ctx.ellipse(x - 15, flagBaseY + 1, 8, 4, -0.2, 0, Math.PI * 2);
      ctx.ellipse(x + 14, flagBaseY + 2, 9, 4, 0.15, 0, Math.PI * 2);
      ctx.fill();
      drawDecorativeBaseBlend(ctx, x, flagBaseY + 2, 66, section.id, propDepth, 0.62);
      drawGroundDustLip(ctx, x, flagBaseY + 1, 54, 'rgba(187, 128, 64, 0.22)');
      if (stateRef.current.renderStats) stateRef.current.renderStats.groundedPropCount += 1;
      ctx.restore();
      return;
    }
    drawDecorativeBaseBlend(ctx, x, prop.y + 36, 64, section.id, propDepth, 0.6);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 3, prop.y - 20, 6, 56);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(x - 22, prop.y - 18);
    ctx.lineTo(x + 22, prop.y - 18);
    ctx.lineTo(x, prop.y + 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(x - 3, prop.y - 8, 6, 14);
    ctx.restore();
    return;
  }
  if (prop.type === 'footprints') {
    drawDecorativeBaseBlend(ctx, x, prop.y + 10, 150, section.id, propDepth, 0.42);
    ctx.fillStyle = 'rgba(92, 64, 51, 0.18)';
    for (let i = 0; i < 7; i += 1) {
      const offsetX = i * 18 - 60;
      const offsetY = (i % 2) * 8;
      ctx.beginPath();
      ctx.ellipse(x + offsetX, prop.y + offsetY, 7, 3.2, -0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + offsetX + 8, prop.y + offsetY + 4, 6, 3, -0.08, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }
  if (prop.type === 'survey-rope') {
    drawDecorativeBaseBlend(ctx, x, prop.y + 20, 128, section.id, propDepth, 0.5);
    const sag = Math.sin(now / 520 + prop.x * 0.01) * 2;
    ctx.strokeStyle = 'rgba(92, 49, 18, 0.5)';
    ctx.lineWidth = 3;
    [-56, 56].forEach(offset => {
      ctx.fillStyle = 'rgba(69, 26, 3, 0.48)';
      ctx.fillRect(x + offset - 2, prop.y - 20, 4, 44);
    });
    ctx.beginPath();
    ctx.moveTo(x - 56, prop.y - 8);
    ctx.quadraticCurveTo(x, prop.y + 4 + sag, x + 56, prop.y - 8);
    ctx.stroke();
    ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
    [-56, 56].forEach(offset => {
      ctx.beginPath();
      ctx.moveTo(x + offset + 2, prop.y - 20);
      ctx.lineTo(x + offset + 24, prop.y - 15 + sag);
      ctx.lineTo(x + offset + 2, prop.y - 8);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
    return;
  }
  if (prop.type === 'banners') {
    drawDecorativeBaseBlend(ctx, x, prop.y + 58, 76, section.id, propDepth, 0.52);
    [-24, 24].forEach(offset => {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + offset, prop.y - 38, 4, 96);
      ctx.fillStyle = offset < 0 ? '#0f766e' : '#b45309';
      ctx.fillRect(x + offset + 4, prop.y - 34, 26, 44);
    });
    ctx.restore();
    return;
  }
  if (prop.type === 'ruins' || prop.type === 'statue') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.font = 'bold 80px serif';
    ctx.fillText(prop.type === 'ruins' ? '🏛️' : '🗿', x, prop.y + 40);
  } else if (prop.type === 'lights') {
    const pulse = Math.sin(now / 400) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(254, 240, 138, ${0.4 * pulse})`;
    ctx.beginPath();
    ctx.arc(x, prop.y + 20, 120, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawCollectibleSpriteGlowFrame(ctx, screenX, centerY, now, color, options = {}, deps) {
  const {
    collectibleSpriteAssetsRef,
    drawCollectibleAtlasRegion,
  } = deps;
  const pulse = Math.sin(now / (options.pulseSpeed || 340)) * 0.22 + 0.78;
  const ringKey = options.ringKey || 'availableGlowRing';
  const ringSize = options.ringSize || 46;
  ctx.save();
  ctx.globalAlpha = options.alpha ?? 0.68;
  ctx.shadowColor = color;
  ctx.shadowBlur = options.shadowBlur || 14;
  const drawnRing = drawCollectibleAtlasRegion(
    ctx,
    collectibleSpriteAssetsRef.current,
    ringKey,
    {
      x: screenX - ringSize / 2,
      y: centerY - ringSize / 2,
      width: ringSize,
      height: ringSize,
    },
  );
  if (!drawnRing) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenX, centerY, (ringSize / 2 - 4) * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function recordCollectibleSprite(kind, key, deps) {
  const { stateRef } = deps;
  const stats = stateRef.current.renderStats;
  if (!stats || !key) return;
  const field = {
    tool: 'visibleToolSprites',
    shard: 'visibleShardSprites',
    upgrade: 'visibleUpgradeSprites',
    objective: 'visibleObjectiveSprites',
  }[kind];
  if (!field) return;
  stats[field] = Array.from(new Set([...(stats[field] || []), key])).slice(-16);
}

export function drawCollectibleFrame(ctx, x, y, cameraX, now, label, color, hidden = false, isShard = false, sprite = {}, deps) {
  const {
    collectibleSpriteAssetsRef,
    drawCollectibleAtlasRegion,
    drawContactShadow,
    isHorizontallyVisible,
    stateRef,
    worldToScreenX,
  } = deps;
  const drawCollectibleSpriteGlow = (innerCtx, screenX, centerY, innerNow, innerColor, options = {}) => (
    drawCollectibleSpriteGlowFrame(innerCtx, screenX, centerY, innerNow, innerColor, options, deps)
  );
  const recordCollectibleSpriteForKind = (kind, key) => recordCollectibleSprite(kind, key, deps);
  const screenX = worldToScreenX(x, cameraX);
  if (!isHorizontallyVisible(x, 1, cameraX, 80)) return;
  const spriteKey = sprite.key || null;
  const spriteKind = sprite.kind || (isShard ? 'shard' : null);
  const spriteSize = sprite.size || (isShard ? 34 : 42);
  const bobAmplitude = sprite.bobAmplitude ?? (isShard ? 2 : 3);
  const floatY = Math.sin((now / 260) + x) * bobAmplitude;
  const baseY = sprite.baseY ?? (y + (sprite.anchorYOffset ?? (isShard ? 18 : 22)));
  const centerY = sprite.anchor === 'center'
    ? y + floatY
    : baseY - spriteSize / 2 + floatY;
  const current = stateRef.current;
  const playerCenterX = current.player.x + current.player.width / 2;
  const nearPlayer = Math.abs(playerCenterX - x) < (sprite.nearGlowDistance ?? 130);
  const glowAlpha = hidden
    ? 0.12
    : nearPlayer
      ? (sprite.glowAlpha ?? 0.28)
      : (sprite.glowAlpha ?? 0.28) * 0.45;
  if (current.renderStats) current.renderStats.visibleCollectibleCount += 1;
  ctx.save();
  ctx.globalAlpha = hidden ? 0.25 : 1;

  if (spriteKey && collectibleSpriteAssetsRef.current.loaded) {
    drawContactShadow(ctx, screenX, baseY + 1, sprite.shadowWidth || spriteSize * 0.72, hidden ? 0.06 : (sprite.shadowAlpha ?? 0.15), 0.85);
    if (!sprite.hideGlow && (sprite.ringSize ?? spriteSize + 8) > 0 && glowAlpha > 0) {
      drawCollectibleSpriteGlow(ctx, screenX, centerY + (sprite.glowYOffset || 0), now, color, {
        ringKey: sprite.ringKey || (spriteKind === 'objective' ? 'objectiveHighlightRing' : 'availableGlowRing'),
        ringSize: sprite.ringSize || spriteSize + 8,
        alpha: glowAlpha,
        shadowBlur: sprite.shadowBlur ?? (isShard ? 5 : 8),
      });
    }

    if (spriteKind !== 'objective' && (nearPlayer || !isShard)) {
      const sparkleSize = sprite.sparkleSize ?? (isShard ? 9 : 11);
      const sparkleOffset = Math.sin(now / 310 + x) * 1.5;
      ctx.globalAlpha = hidden ? 0.08 : (sprite.sparkleAlpha ?? 0.18);
      drawCollectibleAtlasRegion(
        ctx,
        collectibleSpriteAssetsRef.current,
        'pickupSparkle',
        {
          x: screenX + spriteSize * 0.22,
          y: centerY - spriteSize * 0.72 + sparkleOffset,
          width: sparkleSize,
          height: sparkleSize,
        },
      );
      ctx.globalAlpha = hidden ? 0.25 : 1;
    }

    const drawn = drawCollectibleAtlasRegion(
      ctx,
      collectibleSpriteAssetsRef.current,
      spriteKey,
      {
        x: screenX - spriteSize / 2,
        y: centerY - spriteSize / 2,
        width: spriteSize,
        height: spriteSize,
      },
    );

    if (drawn) {
      recordCollectibleSpriteForKind(spriteKind, spriteKey);
      ctx.restore();
      return;
    }
  }

  // Core glow (Dynamic)
  const pulse = Math.sin(now / 300) * 0.3 + 0.7;
  const innerGlow = ctx.createRadialGradient(screenX, centerY, 0, screenX, centerY, 25 * pulse);
  innerGlow.addColorStop(0, `${color}88`);
  innerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = innerGlow;
  ctx.beginPath();
  ctx.arc(screenX, centerY, 25 * pulse, 0, Math.PI * 2);
  ctx.fill();

  if (spriteKind === 'objective') {
    drawContactShadow(ctx, screenX, baseY + 1, 34, 0.12, 0.8);
    ctx.shadowColor = 'rgba(69, 26, 3, 0.36)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#b89768';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(screenX - 14, centerY - 12, 28, 24, 4);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.56)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(screenX - 8, centerY - 3);
    ctx.lineTo(screenX + 8, centerY - 6);
    ctx.moveTo(screenX - 7, centerY + 5);
    ctx.lineTo(screenX + 6, centerY + 4);
    ctx.stroke();
  } else if (isShard) {
    // Amber archaeology shard with carved glyph lines.
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12 * pulse;

    const shardColor = ctx.createLinearGradient(screenX - 12, centerY - 14, screenX + 12, centerY + 16);
    shardColor.addColorStop(0, '#fff7ad');
    shardColor.addColorStop(0.45, '#f59e0b');
    shardColor.addColorStop(1, '#78350f');

    ctx.fillStyle = shardColor;
    ctx.beginPath();
    ctx.moveTo(screenX - 2, centerY - 16);
    ctx.lineTo(screenX + 13, centerY - 4);
    ctx.lineTo(screenX + 7, centerY + 15);
    ctx.lineTo(screenX - 12, centerY + 8);
    ctx.lineTo(screenX - 9, centerY - 8);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 247, 212, 0.82)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(screenX - 3, centerY - 8);
    ctx.lineTo(screenX + 5, centerY - 2);
    ctx.moveTo(screenX - 5, centerY + 4);
    ctx.lineTo(screenX + 4, centerY + 8);
    ctx.stroke();
  } else {
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 12;

    // Premium Token
    const tokenGrad = ctx.createRadialGradient(screenX, centerY, 5, screenX, centerY, 20);
    tokenGrad.addColorStop(0, '#fffcf0');
    tokenGrad.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = tokenGrad;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(screenX - 18, centerY - 18, 36, 36, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = '800 20px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(label, screenX, centerY + 7);
  }
  ctx.restore();
}
