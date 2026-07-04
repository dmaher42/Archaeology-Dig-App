import { drawStoryPropFrame } from './rendererProps.js';

export function drawAttackArcFrame() {}

export function drawCombatEffectsFrame(ctx, effects, cameraX, deps) {
  const {
    SCORPION_VENOM_SPIT_EFFECT_FRAMES,
    clamp,
    getDesertEntryVisualGroundOffsetY,
    playerComboSlashEffectRef,
    playerFinisherSlashEffectRef,
    scorpionVenomSpitEffectRef,
  } = deps;
    effects.forEach((effect) => {
      const progress = effect.timer / (effect.maxTimer || 0.35);
      const x = effect.x - cameraX;
      const footAnchoredEffects = new Set([
        'combo-slash',
        'finisher-slash',
        'combat-impact',
        'weapon-hit-spark',
        'defeat',
        'boss-defeat',
        'movement-dust',
        'landing-dust',
        'jump-dust',
        'knockback-dust',
        'sand-skid',
      ]);
      const visualGroundFootY = Number.isFinite(effect.visualGroundFootY)
        ? effect.visualGroundFootY
        : footAnchoredEffects.has(effect.type)
          ? effect.y
          : Number.NaN;
      const visualGroundOffsetY = typeof getDesertEntryVisualGroundOffsetY === 'function' && Number.isFinite(visualGroundFootY)
        ? getDesertEntryVisualGroundOffsetY(effect.x, visualGroundFootY)
        : 0;
      const y = effect.y + visualGroundOffsetY;
      const compactTypes = new Set([
        'enemy-counter-window',
        'boss-vulnerable',
        'enemy-shield',
        'enemy-guard-deflect',
        'boss-shield',
        'boss-telegraph',
        'attack-stamina',
      ]);
      ctx.save();
      ctx.globalAlpha = Math.max(0, progress);
      ctx.strokeStyle = effect.color || '#facc15';
      ctx.fillStyle = effect.color || '#facc15';
      ctx.lineWidth = 3;
      if (effect.type === 'combo-slash') {
        const slashState = playerComboSlashEffectRef.current;
        const direction = effect.direction || 1;
        const ease = 1 - Math.pow(1 - Math.max(0, Math.min(1, progress)), 2);
        if (slashState.loaded && slashState.image) {
          const drawWidth = effect.width || 138;
          const drawHeight = drawWidth * (slashState.image.height / slashState.image.width);
          const comboStepAlpha = effect.comboStep >= 2 ? 0.74 : 0.54;
          ctx.globalAlpha = Math.max(0, Math.min(1, ease * comboStepAlpha));
          ctx.globalCompositeOperation = 'lighter';
          ctx.translate(x, y);
          if (direction < 0) ctx.scale(-1, 1);
          ctx.rotate((effect.angle || -0.08) * direction);
          ctx.drawImage(
            slashState.image,
            -drawWidth * 0.46 - (1 - progress) * 8,
            -drawHeight * 0.54,
            drawWidth,
            drawHeight,
          );
        } else {
          ctx.globalAlpha = Math.max(0, progress * (effect.comboStep >= 2 ? 0.28 : 0.18));
          ctx.strokeStyle = 'rgba(226, 213, 192, 0.82)';
          ctx.lineWidth = effect.comboStep >= 2 ? 4 : 3;
          ctx.beginPath();
          ctx.ellipse(x + direction * 30, y, effect.comboStep >= 2 ? 56 : 42, effect.comboStep >= 2 ? 15 : 11, -0.18 * direction, 0, Math.PI * 1.28);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }
      if (effect.type === 'finisher-slash') {
        const slashState = playerFinisherSlashEffectRef.current;
        const direction = effect.direction || 1;
        const ease = 1 - Math.pow(1 - Math.max(0, Math.min(1, progress)), 2);
        if (slashState.loaded && slashState.image) {
          const drawWidth = effect.width || 220;
          const drawHeight = drawWidth * (slashState.image.height / slashState.image.width);
          ctx.globalAlpha = Math.max(0, Math.min(1, ease * 0.88));
          ctx.globalCompositeOperation = 'lighter';
          ctx.translate(x, y);
          if (direction < 0) ctx.scale(-1, 1);
          ctx.rotate((effect.angle || -0.05) * direction);
          ctx.drawImage(
            slashState.image,
            -drawWidth * 0.42 - (1 - progress) * 10,
            -drawHeight * 0.58,
            drawWidth,
            drawHeight,
          );
        } else {
          ctx.globalAlpha = Math.max(0, progress * 0.34);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.86)';
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.ellipse(x + direction * 40, y, 76, 22, -0.18 * direction, 0, Math.PI * 1.45);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }
      if (['movement-dust', 'landing-dust', 'jump-dust', 'knockback-dust', 'sand-skid'].includes(effect.type)) {
        const direction = effect.direction || 1;
        const dustWidth = effect.type === 'landing-dust' ? 44 : effect.type === 'jump-dust' ? 34 : effect.type === 'sand-skid' ? 38 : 28;
        ctx.globalAlpha = Math.max(0, progress * (effect.type === 'movement-dust' ? 0.38 : effect.type === 'sand-skid' ? 0.42 : 0.58));
        ctx.fillStyle = effect.color || 'rgba(217, 161, 88, 0.62)';
        for (let i = 0; i < 4; i += 1) {
          const offset = (i - 1.5) * 9 * direction + (1 - progress) * direction * (8 + i * 4);
          ctx.beginPath();
          ctx.ellipse(
            x - direction * 10 + offset,
            y + 16 - i * 2,
            (dustWidth / 4) * (0.8 + i * 0.16) * (1.15 - progress * 0.25),
            4 + (1 - progress) * 4,
            -0.08 * direction,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.restore();
        return;
      }
      if (['environment-debris', 'environment-dust', 'platform-crack'].includes(effect.type)) {
        ctx.globalAlpha = Math.max(0, progress * 0.62);
        ctx.fillStyle = effect.color || 'rgba(203, 139, 68, 0.58)';
        const count = effect.type === 'platform-crack' ? 6 : 8;
        for (let i = 0; i < count; i += 1) {
          const spread = (1 - progress) * (14 + i * 4);
          const angle = -Math.PI * 0.9 + i * (Math.PI / Math.max(1, count - 1));
          ctx.beginPath();
          ctx.ellipse(
            x + Math.cos(angle) * spread,
            y + Math.sin(angle) * spread + i * 0.8,
            3 + (i % 3),
            2,
            angle,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.restore();
        return;
      }
      if (['reward-pulse', 'shard-pickup', 'secret-found', 'checkpoint-pulse', 'collection-complete', 'boss-reward-pulse', 'upgrade-pulse'].includes(effect.type)) {
        ctx.restore();
        return;
      }
      if (effect.type === 'attack-burst') {
        ctx.restore();
        return;
      }
      if (effect.type === 'weapon-hit-spark') {
        const direction = effect.direction || 1;
        ctx.globalAlpha = Math.max(0, progress * 0.62);
        ctx.strokeStyle = effect.color || '#fff7ad';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i += 1) {
          const angle = -0.5 + i * 0.25 + (direction < 0 ? Math.PI : 0);
          const length = 8 + i * 1.5 + (1 - progress) * 10;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }
      if (effect.type === 'near-miss-spacing') {
        const direction = effect.direction || 1;
        const pulse = 1 - progress;
        ctx.globalAlpha = Math.max(0, progress * 0.54);
        ctx.strokeStyle = effect.color || 'rgba(226, 213, 192, 0.78)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x - direction * (effect.gap || 24), y - 5);
        ctx.lineTo(x + direction * 10, y - 5);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = Math.max(0, progress * 0.34);
        ctx.fillStyle = 'rgba(159, 126, 80, 0.36)';
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.ellipse(
            x - direction * (4 + i * 8 + pulse * 8),
            y + 22 - i,
            9 + pulse * 5,
            3 + pulse * 2,
            -0.08 * direction,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.restore();
        return;
      }
      if (effect.type === 'heavy-ready-cue') {
        const direction = effect.direction || 1;
        const pulse = 1 - progress;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = Math.max(0, Math.min(1, progress * 0.82));
        ctx.strokeStyle = effect.color || '#f8e7b6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(x + direction * 10, y, 28 + pulse * 10, 8 + pulse * 4, -0.18 * direction, 0, Math.PI * 1.45);
        ctx.stroke();
        ctx.globalAlpha = Math.max(0, progress * 0.38);
        ctx.strokeStyle = 'rgba(255, 247, 221, 0.66)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x - direction * 8, y + 8);
        ctx.quadraticCurveTo(x + direction * 20, y - 12 - pulse * 5, x + direction * 54, y - 2);
        ctx.stroke();
        ctx.globalAlpha = Math.max(0, progress * 0.58);
        ctx.fillStyle = 'rgba(248, 231, 182, 0.62)';
        for (let i = 0; i < 4; i += 1) {
          ctx.beginPath();
          ctx.arc(x + direction * (12 + i * 8), y - 6 - i * 2 - pulse * 10, 1.4 + i * 0.18, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = Math.max(0, progress * 0.24);
        ctx.fillStyle = 'rgba(159, 126, 80, 0.36)';
        ctx.beginPath();
        ctx.ellipse(x + direction * 8, y + 26, 24 + pulse * 12, 5 + pulse * 2, -0.04 * direction, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }
      if (effect.type === 'venom-spit') {
        const targetX = (effect.targetX ?? effect.x) - cameraX;
        const targetY = effect.targetY ?? y;
        const arcH = effect.arcHeight || 42;
        const travel = 1 - progress;
        const spitX = x + (targetX - x) * travel;
        const arcLift = Math.sin(travel * Math.PI) * arcH;
        const spitY = y + (targetY - y) * travel - arcLift;

        // Motion-aware angle from arc tangent
        const sampleDt = 0.015;
        const t2 = Math.min(1, travel + sampleDt);
        const nx = x + (targetX - x) * t2;
        const ny = y + (targetY - y) * t2 - Math.sin(t2 * Math.PI) * arcH;
        const motionAngle = Math.atan2(ny - spitY, nx - spitX);
        const venomAsset = scorpionVenomSpitEffectRef.current;
        if (venomAsset.loaded && venomAsset.image) {
          const frameWidth = venomAsset.image.width / SCORPION_VENOM_SPIT_EFFECT_FRAMES;
          const frameHeight = venomAsset.image.height;
          const frameIndex = clamp(Math.floor(travel * SCORPION_VENOM_SPIT_EFFECT_FRAMES), 0, SCORPION_VENOM_SPIT_EFFECT_FRAMES - 1);
          const splashFrame = frameIndex >= SCORPION_VENOM_SPIT_EFFECT_FRAMES - 2;
          const drawWidth = (splashFrame ? 88 : 72) * (0.96 + Math.sin(travel * 9) * 0.035);
          const drawHeight = drawWidth * (frameHeight / frameWidth);
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = Math.max(0, Math.min(1, progress * (splashFrame ? 0.72 : 0.86)));
          ctx.shadowColor = 'rgba(160, 220, 36, 0.55)';
          ctx.shadowBlur = splashFrame ? 8 : 5;
          ctx.translate(spitX, spitY);
          ctx.rotate(motionAngle);
          ctx.drawImage(
            venomAsset.image,
            frameIndex * frameWidth,
            0,
            frameWidth,
            frameHeight,
            -drawWidth * 0.5,
            -drawHeight * 0.5,
            drawWidth,
            drawHeight,
          );
          ctx.restore();
          return;
        }

        // Organic pulse — blobs wobble as they fly
        const wobble = 1 + 0.09 * Math.sin(travel * 13);
        const blobAlpha = Math.min(1, Math.max(0, progress * 0.9 + 0.1));

        // Outer glow aura aligned to motion
        ctx.globalAlpha = Math.max(0, progress * 0.40);
        const aura = ctx.createRadialGradient(spitX, spitY, 2, spitX, spitY, 20);
        aura.addColorStop(0, 'rgba(210, 95, 18, 0.68)');
        aura.addColorStop(0.5, 'rgba(165, 62, 10, 0.28)');
        aura.addColorStop(1, 'rgba(120, 40, 5, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.ellipse(spitX, spitY, 20 * wobble, 12 * wobble, motionAngle, 0, Math.PI * 2);
        ctx.fill();

        // Dark outer shell — gives depth and edge definition
        ctx.globalAlpha = blobAlpha * 0.94;
        ctx.fillStyle = '#7a3008';
        ctx.shadowColor = 'rgba(215, 92, 15, 0.95)';
        ctx.shadowBlur = 11 + progress * 10;
        ctx.beginPath();
        ctx.ellipse(spitX, spitY, 13 * wobble, 7.2 * wobble, motionAngle, 0, Math.PI * 2);
        ctx.fill();

        // Mid amber body
        ctx.shadowBlur = 0;
        ctx.globalAlpha = blobAlpha;
        ctx.fillStyle = '#c45a14';
        ctx.beginPath();
        ctx.ellipse(spitX, spitY, 11 * wobble, 6 * wobble, motionAngle, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright layer
        const hOffX = Math.cos(motionAngle - Math.PI * 0.5) * 1.6;
        const hOffY = Math.sin(motionAngle - Math.PI * 0.5) * 1.6;
        ctx.globalAlpha = blobAlpha * 0.90;
        ctx.fillStyle = '#e8841c';
        ctx.beginPath();
        ctx.ellipse(
          spitX - Math.cos(motionAngle) * 2 + hOffX,
          spitY - Math.sin(motionAngle) * 2 + hOffY,
          5.8 * wobble, 3.2 * wobble, motionAngle, 0, Math.PI * 2,
        );
        ctx.fill();

        // Specular highlight — small bright spot at leading top edge
        ctx.globalAlpha = blobAlpha * 0.68;
        ctx.fillStyle = 'rgba(255, 216, 140, 0.92)';
        ctx.beginPath();
        ctx.ellipse(
          spitX - Math.cos(motionAngle) * 3.5 + hOffX * 1.6,
          spitY - Math.sin(motionAngle) * 3.5 + hOffY * 1.6,
          2.6 * wobble, 1.4 * wobble, motionAngle, 0, Math.PI * 2,
        );
        ctx.fill();

        // Trailing drops — offset along motion axis, slight downward sag
        for (let i = 0; i < 5; i += 1) {
          const trailDist = 13 + i * 10;
          const tX = spitX - Math.cos(motionAngle) * trailDist;
          const tY = spitY - Math.sin(motionAngle) * trailDist + i * 1.4;
          const trailAlpha = Math.max(0, progress * (0.56 - i * 0.09));
          const rx = Math.max(0.6, 5.2 - i * 0.88);
          ctx.globalAlpha = trailAlpha;
          ctx.fillStyle = i < 2 ? '#b05010' : '#7a3610';
          ctx.shadowColor = i < 2 ? 'rgba(185, 82, 16, 0.55)' : 'transparent';
          ctx.shadowBlur = i < 2 ? 4 : 0;
          ctx.beginPath();
          ctx.ellipse(tX, tY, rx, rx * 0.56, motionAngle, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
        return;
      }
      if (effect.type === 'venom-slow') {
        const burst = 1 - progress;
        const radius = effect.radius || 34;
        const footY = effect.footY ?? y + 28;
        const pulse = 0.68 + Math.sin(burst * Math.PI * 3) * 0.12;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = Math.max(0, progress * 0.25);
        const venomGlow = ctx.createRadialGradient(x, y + 14, 5, x, y + 14, radius * (1.2 + burst * 0.45));
        venomGlow.addColorStop(0, 'rgba(150, 230, 28, 0.32)');
        venomGlow.addColorStop(0.5, 'rgba(72, 158, 24, 0.13)');
        venomGlow.addColorStop(1, 'rgba(58, 120, 16, 0)');
        ctx.fillStyle = venomGlow;
        ctx.beginPath();
        ctx.ellipse(x - 4, y + 18, radius * 0.86, radius * 1.02, -0.16, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 7; i += 1) {
          const side = i % 2 === 0 ? -1 : 1;
          const drift = side * (10 + i * 3.4) * (0.45 + burst * 0.55);
          const wispX = x + drift + Math.sin(i * 1.3 + burst * 5) * 3;
          const wispY = y + 24 - i * 6 - burst * (10 + i * 2.5);
          const wispWidth = radius * (0.18 + i * 0.018) * (1 + burst * 0.4);
          const wispHeight = radius * (0.34 + i * 0.025);
          ctx.globalAlpha = Math.max(0, progress * (0.16 + i * 0.018));
          ctx.fillStyle = i % 3 === 0 ? 'rgba(185, 245, 36, 0.34)' : 'rgba(78, 174, 26, 0.24)';
          ctx.beginPath();
          ctx.ellipse(wispX, wispY, wispWidth, wispHeight, side * 0.28, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = Math.max(0, progress * 0.52);
        ctx.fillStyle = 'rgba(126, 218, 28, 0.38)';
        ctx.beginPath();
        ctx.ellipse(x - 5, footY, radius * (0.72 + burst * 0.22), 7 + burst * 6, -0.1, 0, Math.PI * 2);
        ctx.ellipse(x + 16, footY + 1, radius * (0.46 + burst * 0.18), 5 + burst * 4, 0.14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(197, 252, 48, 0.62)';
        for (let i = 0; i < 13; i += 1) {
          const side = i % 2 === 0 ? -1 : 1;
          const spread = 4 + i * 3.7;
          const bubbleX = x + side * spread * (0.5 + burst * 0.46) + Math.sin(i * 2.1) * 2;
          const bubbleY = footY - 3 - burst * (10 + i * 2.1) - Math.sin(i * 1.7 + burst * 5) * 3;
          const bubbleRadius = (1.1 + (i % 4) * 0.45) * pulse;
          ctx.globalAlpha = Math.max(0, progress * (0.42 + (i % 3) * 0.08));
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, bubbleRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
        return;
      }
      if (effect.type === 'parry-burst') {
        const radius = 8 + (1 - progress) * 28;
        ctx.globalAlpha = Math.max(0, progress * 0.76);
        ctx.strokeStyle = effect.color || '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(x, y + 2, radius, radius * 0.54, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = Math.max(0, progress * 0.44);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(x, y + 2, radius * 0.52, radius * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i += 1) {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
          const inner = 5 + (1 - progress) * 6;
          const outer = 13 + (1 - progress) * 20;
          ctx.globalAlpha = Math.max(0, progress * 0.68);
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner * 0.54 + 2);
          ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer * 0.54 + 2);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }
      if (effect.type === 'enemy-guard-deflect') {
        const drawDeflectRing = (radius, alpha, lineWidth = 2) => {
          ctx.globalAlpha = Math.max(0, progress * alpha);
          ctx.strokeStyle = effect.color || 'rgba(214, 185, 92, 0.7)';
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.ellipse(x, y + 2, radius * 1.05, radius * 0.58, 0, 0, Math.PI * 2);
          ctx.stroke();
        };
        drawDeflectRing(7 + (1 - progress) * 5, 0.34, 1.2);
        ctx.strokeStyle = 'rgba(214, 185, 92, 0.78)';
        ctx.globalAlpha = Math.max(0, progress * 0.52);
        for (let i = 0; i < 4; i += 1) {
          const angle = -0.75 + i * 0.5;
          const inner = 5 + (1 - progress) * 2;
          const outer = 11 + (1 - progress) * 5;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner * 0.75);
          ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer * 0.75);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(136, 82, 36, 0.28)';
        ctx.globalAlpha = Math.max(0, progress * 0.34);
        ctx.beginPath();
        ctx.ellipse(x, y + 16, 15 + (1 - progress) * 6, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }
      if (['combat-impact', 'enemy-pressure', 'stamina-danger'].includes(effect.type)) {
        ctx.restore();
        return;
      }
      if (compactTypes.has(effect.type)) {
        ctx.restore();
        return;
      }
      ctx.restore();
      return;
    });
}

export function drawPropPlacementEditorOverlayFrame(ctx, current, cameraX, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    CHAMBER_DOOR_VISUALS,
    DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE,
    clamp,
    drawEditorSelectionCorners,
    drawEditorSelectionLabel,
    getArchEditorBounds,
    getCheckpointEditorBounds,
    getEditedNestParams,
    getEditorEntityBounds,
    getEditorEntityLabel,
    getHazardEditorBounds,
    getJourneyTrapTriggerRect,
    getLairEditorBounds,
    getNestEditorBounds,
    getPlatformEditorBounds,
    getPropEditorSelectedArch,
    getPropEditorSelectedCheckpoint,
    getPropEditorSelectedHazard,
    getPropEditorSelectedLair,
    getPropEditorSelectedNest,
    getPropEditorSelectedPlatform,
    getPropEditorSelectedProp,
    getRenderableCheckpoints,
    getRenderableHazards,
    getRenderablePlatforms,
    getRenderableRouteGateDoorways,
    getRenderableRouteGates,
    getRenderableScarabLairs,
    getRenderableStoryProps,
    getScarabQueenLairPlacement,
    getStoryPropEditorBounds,
    isJourneyBlockerPlatform,
    isJourneyFloorPlatform,
    propPlacementEditorRef,
    resolveChamberEntryTrigger,
    worldToScreenX,
  } = deps;
    const editor = propPlacementEditorRef.current;
    if (!import.meta.env.DEV || !editor.enabled) return;
    // Preview mode: suppress all editor chrome (selection border, tinted overlay,
    // corner markers, labels, grid) so the object's real appearance is visible
    // without leaving the editor. A small badge reminds how to toggle back.
    if (editor.previewMode) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = 'rgba(8, 13, 22, 0.78)';
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(CANVAS_WIDTH - 150, 12, 138, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ecfeff';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('PREVIEW — press H', CANVAS_WIDTH - 140, 28);
      ctx.restore();
      return;
    }
    ctx.save();
    if (editor.gridSnap) {
      const gridSize = clamp(Number(editor.gridSize) || DEFAULT_JOURNEY_PROP_EDITOR_GRID_SIZE, 2, 128);
      const startWorldX = Math.floor(cameraX / gridSize) * gridSize;
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      for (let worldX = startWorldX; worldX <= cameraX + CANVAS_WIDTH + gridSize; worldX += gridSize) {
        const screenX = Math.round(worldToScreenX(worldX, cameraX)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let screenY = 0; screenY <= CANVAS_HEIGHT; screenY += gridSize) {
        const y = Math.round(screenY) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
    }
    getRenderableStoryProps(current).forEach((prop) => {
      const bounds = getStoryPropEditorBounds(prop, cameraX, current);
      if (bounds.x + bounds.width < -80 || bounds.x > CANVAS_WIDTH + 80) return;
      const selected = prop.id === editor.selectedPropId;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 3;
      ctx.strokeStyle = selected ? 'rgba(72, 187, 205, 0.9)' : 'rgba(72, 187, 205, 0.5)';
      ctx.lineWidth = selected ? 3 : 1.5;
      ctx.setLineDash(selected ? [] : [6, 5]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.restore();
      if (selected) {
        drawEditorSelectionCorners(ctx, bounds, 'rgba(72, 187, 205, 0.92)');
      }
    });
    const selectedProp = getPropEditorSelectedProp(current);
    if (selectedProp) {
      // Pin the id/coords readout to a fixed clear spot (bottom-left, clear of the panel,
      // the top HUD bars and the bottom-right seal HUD) instead of floating it over the
      // asset, where the name was covering the very thing being positioned. Same info also
      // lives in the side panel.
      const labelX = 12;
      const labelY = CANVAS_HEIGHT - 30;
      const selectedScale = Number.isFinite(selectedProp.scale) ? selectedProp.scale : 1;
      const selectedRotation = Number.isFinite(selectedProp.rotation) ? selectedProp.rotation : 0;
      drawEditorSelectionLabel(
        ctx,
        labelX,
        labelY,
        `${selectedProp.id}  x:${Math.round(selectedProp.x)} y:${Math.round(selectedProp.y)} s:${selectedScale.toFixed(2)} r:${Math.round(selectedRotation)}`,
        'rgba(94, 234, 212, 0.74)',
      );
    }
    getRenderablePlatforms(current).forEach((platform) => {
      const platformId = platform.id || platform.label;
      const bounds = getPlatformEditorBounds(platform, cameraX, current);
      if (bounds.x + bounds.width < -80 || bounds.x > CANVAS_WIDTH + 80) return;
      const floor = isJourneyFloorPlatform(platform);
      const blocker = isJourneyBlockerPlatform(platform);
      const selected = platformId === editor.selectedPlatformId;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 3;
      ctx.strokeStyle = selected
        ? blocker ? 'rgba(56, 170, 156, 0.9)' : floor ? 'rgba(150, 130, 210, 0.9)' : 'rgba(130, 190, 80, 0.9)'
        : blocker ? 'rgba(56, 170, 156, 0.6)' : floor ? 'rgba(150, 130, 210, 0.58)' : 'rgba(130, 190, 80, 0.58)';
      ctx.fillStyle = selected
        ? blocker ? 'rgba(56, 170, 156, 0.16)' : floor ? 'rgba(150, 130, 210, 0.16)' : 'rgba(130, 190, 80, 0.16)'
        : blocker ? 'rgba(56, 170, 156, 0.1)' : floor ? 'rgba(150, 130, 210, 0.1)' : 'rgba(130, 190, 80, 0.1)';
      ctx.lineWidth = selected ? 3.5 : 2.25;
      ctx.setLineDash(selected ? [] : blocker ? [3, 3] : floor ? [14, 7] : [8, 5]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      if (blocker && (platform.blockerShape === 'left-slant' || platform.blockerShape === 'right-slant')) {
        ctx.setLineDash([]);
        ctx.strokeStyle = selected ? 'rgba(204, 251, 241, 0.98)' : 'rgba(204, 251, 241, 0.72)';
        ctx.lineWidth = selected ? 2.5 : 1.75;
        ctx.beginPath();
        if (platform.blockerShape === 'left-slant') {
          ctx.moveTo(bounds.x + bounds.width, bounds.y);
          ctx.lineTo(bounds.x, bounds.y + bounds.height);
        } else {
          ctx.moveTo(bounds.x, bounds.y);
          ctx.lineTo(bounds.x + bounds.width, bounds.y + bounds.height);
        }
        ctx.stroke();
      }
      ctx.restore();
      if (platform.invisible || floor || blocker) {
        ctx.fillStyle = blocker ? 'rgba(204, 251, 241, 0.98)' : floor ? 'rgba(255, 251, 235, 0.98)' : 'rgba(255, 237, 213, 0.96)';
        ctx.font = '800 10px Outfit, sans-serif';
        ctx.textAlign = 'left';
        const platformLabel = blocker && platform.blockerShape === 'left-slant'
          ? 'left slant'
          : blocker && platform.blockerShape === 'right-slant'
            ? 'right slant'
            : blocker ? 'blocker' : floor ? 'floor' : 'platform';
        ctx.fillText(platformLabel, bounds.x + 4, bounds.y + 11);
      }
    });
    getRenderableHazards(current).forEach((hazard) => {
      if (hazard.editorVisible === false && hazard.id !== editor.selectedHazardId) return;
      const bounds = getHazardEditorBounds(hazard, cameraX);
      if (bounds.x + bounds.width < -80 || bounds.x > CANVAS_WIDTH + 80) return;
      const selected = hazard.id === editor.selectedHazardId;
      if (editor.showTrapTriggers) {
        const trigger = getJourneyTrapTriggerRect(hazard);
        const triggerX = worldToScreenX(trigger.x, cameraX);
        ctx.strokeStyle = selected ? 'rgba(253, 224, 71, 0.95)' : 'rgba(253, 224, 71, 0.42)';
        ctx.fillStyle = selected ? 'rgba(253, 224, 71, 0.12)' : 'rgba(253, 224, 71, 0.05)';
        ctx.lineWidth = selected ? 2.5 : 1.25;
        ctx.setLineDash([2, 4]);
        ctx.strokeRect(triggerX, trigger.y, trigger.width, trigger.height);
        ctx.fillRect(triggerX, trigger.y, trigger.width, trigger.height);
      }
      ctx.strokeStyle = selected ? 'rgba(248, 113, 113, 0.98)' : 'rgba(248, 113, 113, 0.55)';
      ctx.fillStyle = selected ? 'rgba(248, 113, 113, 0.18)' : 'rgba(248, 113, 113, 0.08)';
      ctx.lineWidth = selected ? 3 : 1.5;
      ctx.setLineDash(selected ? [] : [4, 4]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillStyle = 'rgba(254, 226, 226, 0.92)';
      ctx.font = '800 10px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('trap', bounds.x + 4, bounds.y + 11);
    });
    getRenderableScarabLairs().forEach((boss) => {
      const bounds = getLairEditorBounds(boss, cameraX);
      if (bounds.x + bounds.width < -80 || bounds.x > CANVAS_WIDTH + 80) return;
      const selected = boss.id === editor.selectedLairId;
      ctx.strokeStyle = selected ? 'rgba(214, 132, 64, 0.9)' : 'rgba(214, 132, 64, 0.55)';
      ctx.fillStyle = selected ? 'rgba(214, 132, 64, 0.15)' : 'rgba(214, 132, 64, 0.07)';
      ctx.lineWidth = selected ? 3 : 1.5;
      ctx.setLineDash(selected ? [] : [3, 5]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillStyle = 'rgba(204, 251, 241, 0.94)';
      ctx.font = '800 10px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('scarab lair', bounds.x + 4, bounds.y + 11);
    });
    [
      ...getRenderableRouteGateDoorways().map(doorway => ({ ...doorway, editorKind: 'doorway', editorId: `doorway:${doorway.id}` })),
      ...getRenderableRouteGates().map(gate => ({ ...gate, editorKind: 'gate', editorId: `gate:${gate.id}` })),
    ].forEach((arch) => {
      const bounds = getArchEditorBounds(arch, cameraX);
      if (bounds.x + bounds.width < -80 || bounds.x > CANVAS_WIDTH + 80) return;
      const selected = arch.editorId === editor.selectedArchId;
      ctx.strokeStyle = selected ? 'rgba(129, 140, 248, 0.98)' : 'rgba(129, 140, 248, 0.5)';
      ctx.fillStyle = selected ? 'rgba(129, 140, 248, 0.16)' : 'rgba(129, 140, 248, 0.07)';
      ctx.lineWidth = selected ? 3 : 1.5;
      ctx.setLineDash(selected ? [] : [10, 5]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillStyle = 'rgba(224, 231, 255, 0.94)';
      ctx.font = '800 10px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('arch', bounds.x + 4, bounds.y + 11);
    });
    getRenderableCheckpoints().forEach((checkpoint) => {
      const bounds = getCheckpointEditorBounds(checkpoint, cameraX);
      if (bounds.x + bounds.width < -80 || bounds.x > CANVAS_WIDTH + 80) return;
      const selected = checkpoint.id === editor.selectedCheckpointId;
      ctx.strokeStyle = selected ? 'rgba(34, 197, 94, 0.98)' : 'rgba(34, 197, 94, 0.5)';
      ctx.fillStyle = selected ? 'rgba(34, 197, 94, 0.16)' : 'rgba(34, 197, 94, 0.07)';
      ctx.lineWidth = selected ? 3 : 1.5;
      ctx.setLineDash(selected ? [] : [5, 5]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillStyle = 'rgba(220, 252, 231, 0.94)';
      ctx.font = '800 10px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('checkpoint', bounds.x + 4, bounds.y + 11);
    });
    // Chamber entry trigger zones — teal boxes showing where Asha must stand to enter
    const chamberEntryTriggers = CHAMBER_DOOR_VISUALS.map(door => ({
      id: door.id,
      label: `entry: ${door.title}`,
      trigger: resolveChamberEntryTrigger(door),
    })).filter(entry => entry.trigger);
    chamberEntryTriggers.forEach(({ label, trigger }) => {
      const sx = worldToScreenX(trigger.minX, cameraX);
      const sw = worldToScreenX(trigger.maxX, cameraX) - sx;
      if (sx + sw < -80 || sx > CANVAS_WIDTH + 80) return;
      // Foot-Y target band (where player feet must be)
      const footTop = trigger.footY - trigger.footTolerance;
      const footBot = trigger.footY + trigger.footTolerance;
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.88)';
      ctx.fillStyle = 'rgba(45, 212, 191, 0.14)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(sx, footTop, sw, footBot - footTop);
      ctx.fillRect(sx, footTop, sw, footBot - footTop);
      // maxY ceiling line (player.y must be below this)
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.44)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(sx, trigger.maxY);
      ctx.lineTo(sx + sw, trigger.maxY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(204, 251, 241, 0.96)';
      ctx.font = '800 10px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, sx + 4, footTop - 4);
    });
    const selectedPlatform = getPropEditorSelectedPlatform(current);
    if (selectedPlatform) {
      const bounds = getPlatformEditorBounds(selectedPlatform, cameraX, current);
      const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - 300);
      const labelY = clamp(bounds.y - 28, 14, CANVAS_HEIGHT - 36);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(8, 13, 22, 0.86)';
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.74)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, 290, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff7ed';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${selectedPlatform.id || selectedPlatform.label}  x:${Math.round(selectedPlatform.x)} y:${Math.round(selectedPlatform.y)} w:${Math.round(selectedPlatform.width)} h:${Math.round(selectedPlatform.height)}`, labelX + 8, labelY + 16);
    }
    const selectedHazard = getPropEditorSelectedHazard(current);
    if (selectedHazard) {
      const bounds = getHazardEditorBounds(selectedHazard, cameraX);
      const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - 300);
      const labelY = clamp(bounds.y - 28, 14, CANVAS_HEIGHT - 36);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(8, 13, 22, 0.88)';
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.74)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, 290, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fee2e2';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${selectedHazard.id}  x:${Math.round(selectedHazard.x)} y:${Math.round(selectedHazard.y)} w:${Math.round(selectedHazard.width)} h:${Math.round(selectedHazard.height)}`, labelX + 8, labelY + 16);
    }
    const selectedLair = getPropEditorSelectedLair(current);
    if (selectedLair) {
      const placement = getScarabQueenLairPlacement(selectedLair);
      const bounds = getLairEditorBounds(selectedLair, cameraX);
      const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - 310);
      const labelY = clamp(bounds.y - 28, 14, CANVAS_HEIGHT - 36);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(8, 13, 22, 0.88)';
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.74)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, 300, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ccfbf1';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${selectedLair.id} lair  x:${Math.round(placement.x)} y:${Math.round(placement.y)} w:${Math.round(placement.width)} h:${Math.round(placement.height)}`, labelX + 8, labelY + 16);
    }
    const selectedNest = getPropEditorSelectedNest();
    if (selectedNest) {
      const params = getEditedNestParams(selectedNest);
      const bounds = getNestEditorBounds(selectedNest, cameraX);
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.restore();
      const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - 360);
      const labelY = clamp(bounds.y - 44, 14, CANVAS_HEIGHT - 52);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(8, 13, 22, 0.9)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.74)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, 352, 40, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef3c7';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${selectedNest.id}  x:${Math.round(params.x)} y:${Math.round(params.y)} size:${params.widthScale.toFixed(2)} anchor:${Math.round(params.yOffset)} glowY:${params.glowYFactor.toFixed(2)} glowS:${params.glowSize.toFixed(2)}`, labelX + 8, labelY + 15);
      ctx.fillStyle = 'rgba(254, 243, 199, 0.7)';
      ctx.font = '600 10px Outfit, sans-serif';
      ctx.fillText('drag=move  [ ]=size  ; \'=anchor  , .=glowY  9 0=glow size  \\=reset', labelX + 8, labelY + 31);
    }
    const selectedArch = getPropEditorSelectedArch(current);
    if (selectedArch) {
      const bounds = getArchEditorBounds(selectedArch, cameraX);
      const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - 300);
      const labelY = clamp(bounds.y - 28, 14, CANVAS_HEIGHT - 36);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(8, 13, 22, 0.88)';
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.74)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, 290, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e0e7ff';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      const archX = Number.isFinite(selectedArch.anchorX) ? selectedArch.anchorX : selectedArch.x;
      ctx.fillText(`${selectedArch.id}  x:${Math.round(archX)} y:${Math.round(selectedArch.y)} w:${Math.round(selectedArch.width)} h:${Math.round(selectedArch.height)}`, labelX + 8, labelY + 16);
    }
    const selectedCheckpoint = getPropEditorSelectedCheckpoint(current);
    if (selectedCheckpoint) {
      const bounds = getCheckpointEditorBounds(selectedCheckpoint, cameraX);
      const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - 300);
      const labelY = clamp(bounds.y - 28, 14, CANVAS_HEIGHT - 36);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(8, 13, 22, 0.88)';
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.74)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, 290, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#dcfce7';
      ctx.font = '800 11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${selectedCheckpoint.id}  x:${Math.round(selectedCheckpoint.x)} y:${Math.round(selectedCheckpoint.y)}`, labelX + 8, labelY + 16);
    }
    // Hover preview: outline + plain label of the entity a click would select, with a
    // Tab counter when several entities are stacked under the cursor.
    const hover = editor.hover;
    if (!editor.dragging && hover && hover.stack && hover.stack.length) {
      const descriptor = hover.stack[Math.min(hover.index, hover.stack.length - 1)];
      const bounds = getEditorEntityBounds(descriptor, cameraX, current);
      if (bounds) {
        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.lineWidth = 2;
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.restore();
        drawEditorSelectionCorners(ctx, bounds, 'rgba(255, 255, 255, 0.98)');
        if (editor.showHoverLabels !== false) {
        const cycleSuffix = hover.stack.length > 1 ? `   ⇥ ${hover.index + 1}/${hover.stack.length} · right-click for list` : '';
        // Long prop names sprawl over the asset you're positioning, so show a compact
        // name: drop the trailing " · <id>" and redundant " — prop", then cap the length.
        const HOVER_LABEL_MAX = 26;
        let compact = getEditorEntityLabel(descriptor)
          .replace(/\s·\s.*$/, '')
          .replace(/\s—\sprop$/, '');
        if (compact.length > HOVER_LABEL_MAX) compact = `${compact.slice(0, HOVER_LABEL_MAX - 1).trimEnd()}…`;
        const text = `${compact}${cycleSuffix}`;
        ctx.save();
        ctx.setLineDash([]);
        ctx.font = '800 12px Outfit, sans-serif';
        const textWidth = ctx.measureText(text).width;
        const labelX = clamp(bounds.x, 12, CANVAS_WIDTH - (textWidth + 30));
        const labelY = clamp(bounds.y - 26, 14, CANVAS_HEIGHT - 34);
        ctx.fillStyle = 'rgba(8, 13, 22, 0.92)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(labelX, labelY, textWidth + 18, 22, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'left';
        ctx.fillText(text, labelX + 9, labelY + 15);
        ctx.restore();
        }
      }
    }
    ctx.restore();
}

export function drawCinematicCardsFrame(ctx, current, deps) {
  const {
    CANVAS_WIDTH,
  } = deps;
  const featureCard = current.bossIntro || current.environmentEvent || current.cinematicEvent;
  if (!featureCard) return;
  const isGuardianCard = Boolean(current.bossIntro);
  const isSectionCard = Boolean(current.sectionTransition);
  const cardWidth = isGuardianCard ? 520 : isSectionCard ? 430 : 500;
  const cardHeight = isGuardianCard ? 90 : isSectionCard ? 58 : 70;
  const cardX = (CANVAS_WIDTH - cardWidth) / 2;
  const cardY = isSectionCard ? 86 : 78;
  const cardCenterX = cardX + cardWidth / 2;
  const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
  if (isGuardianCard) {
    cardGradient.addColorStop(0, 'rgba(15, 23, 42, 0.92)');
    cardGradient.addColorStop(1, 'rgba(48, 35, 22, 0.92)');
  } else {
    cardGradient.addColorStop(0, 'rgba(42, 31, 24, 0.78)');
    cardGradient.addColorStop(1, 'rgba(81, 55, 34, 0.78)');
  }
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.34)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = cardGradient;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardWidth, cardHeight, isGuardianCard ? 12 : 10);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = isGuardianCard ? 'rgba(250, 204, 21, 0.72)' : 'rgba(255, 241, 198, 0.24)';
  ctx.lineWidth = isGuardianCard ? 3 : 1.5;
  ctx.beginPath();
  ctx.roundRect(cardX + 3, cardY + 3, cardWidth - 6, cardHeight - 6, isGuardianCard ? 10 : 8);
  ctx.stroke();
  if (isGuardianCard) {
    ctx.fillStyle = 'rgba(250, 204, 21, 0.18)';
    ctx.beginPath();
    ctx.arc(cardX + 40, cardY + cardHeight / 2, 18, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fff4d4';
  ctx.font = isGuardianCard ? '900 20px Outfit' : isSectionCard ? '900 16px Outfit' : '900 17px Outfit';
  ctx.textAlign = 'center';
  ctx.fillText(featureCard.name || featureCard.title, cardCenterX, cardY + (isSectionCard ? 22 : 30));
  ctx.font = isSectionCard ? '800 11px Outfit' : '800 12px Outfit';
  ctx.fillStyle = isSectionCard ? 'rgba(255, 247, 226, 0.88)' : '#fff4d4';
  const messageText = featureCard.message || '';
  if (isGuardianCard && messageText) {
    const words = messageText.split(' ');
    const lines = words.reduce((nextLines, word) => {
      const currentLine = nextLines[nextLines.length - 1] || '';
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      return ctx.measureText(candidate).width <= cardWidth - 62
        ? [...nextLines.slice(0, -1), candidate]
        : [...nextLines, word];
    }, ['']).filter(Boolean).slice(0, 2);
    lines.forEach((line, index) => {
      ctx.fillText(line, cardCenterX, cardY + 56 + index * 16);
    });
  } else {
    ctx.fillText(messageText, cardCenterX, cardY + (isSectionCard ? 42 : 54));
  }
  ctx.textAlign = 'start';
}

export function drawPlayerFeedbackOverlaysFrame(ctx, current, cameraX, secretVerticalCameraOffset, now, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    clamp,
  } = deps;
  const player = current.player;
  const staminaRatio = current.resources.stamina / Math.max(1, current.upgradeEffects?.maxStamina || 100);
  if (current.enduranceExhausted) {
    // Exhausted state: amber/teal desaturated pulse - distinct from the red low-stamina danger
    current.renderStats.dangerFeedbackActive = true;
    const pulse = 0.45 + Math.sin(now / 200) * 0.22;
    const alpha = clamp(0.28 + pulse * 0.12, 0.22, 0.42);
    ctx.save();
    const exhaustedGradient = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.15,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.72,
    );
    exhaustedGradient.addColorStop(0, 'rgba(40, 30, 15, 0)');
    exhaustedGradient.addColorStop(1, `rgba(80, 55, 20, ${alpha})`);
    ctx.fillStyle = exhaustedGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  } else if (staminaRatio <= 0.3) {
    current.renderStats.dangerFeedbackActive = true;
    const pulse = 0.55 + Math.sin(now / 130) * 0.18;
    const alpha = clamp((0.3 - staminaRatio) / 0.3, 0.18, 0.42) * pulse;
    ctx.save();
    const dangerGradient = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.2,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.68,
    );
    dangerGradient.addColorStop(0, 'rgba(127, 29, 29, 0)');
    dangerGradient.addColorStop(1, `rgba(127, 29, 29, ${alpha})`);
    ctx.fillStyle = dangerGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }

  if ((player.sandBlindTimer || 0) > 0) {
    const blindAlpha = Math.min(1, player.sandBlindTimer / 0.6) * 0.38;
    ctx.save();
    const sandGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sandGrad.addColorStop(0, `rgba(180, 140, 80, ${blindAlpha * 0.6})`);
    sandGrad.addColorStop(0.4, `rgba(160, 118, 60, ${blindAlpha})`);
    sandGrad.addColorStop(0.7, `rgba(140, 100, 45, ${blindAlpha * 0.9})`);
    sandGrad.addColorStop(1, `rgba(120, 85, 35, ${blindAlpha * 0.5})`);
    ctx.fillStyle = sandGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }

  if (player.hitFeedbackTimer > 0) {
    ctx.save();
    ctx.fillStyle = '#fecaca';
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.font = '900 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    const px = player.x - cameraX + player.width / 2;
    const py = player.y + secretVerticalCameraOffset - 24 - player.hitFeedbackTimer * 8;
    ctx.fillText(`-${player.lastDamage} ENDURANCE`, px, py);
    ctx.strokeText(`-${player.lastDamage} ENDURANCE`, px, py);
    ctx.restore();
  }
}

export function drawDebugPlatformOverlayFrame(ctx, current, cameraX, deps) {
  const {
    getRenderablePlatforms,
    isHorizontallyVisible,
    worldToScreenX,
  } = deps;
  const debugShow = window._pShow || [];
  if (debugShow.length <= 0) return;
  getRenderablePlatforms(current).forEach(p => {
    if (!p.id || !debugShow.some(pfx => p.id.startsWith(pfx))) return;
    const px = worldToScreenX(p.x, cameraX);
    if (!isHorizontallyVisible(p.x, p.width, cameraX, 50)) return;
    const adjustment = (window._pAdj || {})[p.id] || {};
    const ay = adjustment.y || 0;
    const ax = adjustment.x || 0;
    const aw = adjustment.w || 0;
    const dy = p.y + ay;
    const dx = px + ax;
    const dw = p.width + aw;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,100,0,0.95)';
    ctx.lineWidth = 2;
    ctx.strokeRect(dx, dy, dw, p.height);
    ctx.fillStyle = 'rgba(255,100,0,0.22)';
    ctx.fillRect(dx, dy, dw, p.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`${p.id}  y=${Math.round(dy)}  x=${Math.round(p.x + ax)}  w=${Math.round(dw)}`, dx + 3, dy + 12);
    ctx.restore();
  });
}

export function drawForegroundOccluderPropsFrame(ctx, current, cameraX, now, deps) {
  const { getZIndexSortedRenderableStoryProps } = deps;
  getZIndexSortedRenderableStoryProps(current).forEach((prop) => (
    drawStoryPropFrame(ctx, prop, cameraX, now, 'foreground-occluder', deps)
  ));
}

export function drawMissingObjectiveMarkerFrame(ctx, guidance, cameraX, now, deps) {
  const {
    CANVAS_WIDTH,
    worldToScreenX,
  } = deps;
  if (!guidance?.activeGateLocked || !guidance.nearestMissingObjective) return;
  const target = guidance.nearestMissingObjective;
  const isShardTarget = target.type === 'shards' || String(target.id || '').startsWith('shard-');
  if (isShardTarget) return;
  const targetScreenX = worldToScreenX(target.x, cameraX);
  const pulse = Math.sin(now / 140) * 0.25 + 0.75;
  ctx.save();
  ctx.strokeStyle = `rgba(251, 191, 36, ${pulse})`;
  ctx.fillStyle = '#78350f';
  ctx.lineWidth = 3;
  if (targetScreenX > 24 && targetScreenX < CANVAS_WIDTH - 24) {
    ctx.beginPath();
    ctx.arc(targetScreenX, 292, 20 + pulse * 6, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    const arrowX = targetScreenX < 0 ? 30 : CANVAS_WIDTH - 30;
    const direction = targetScreenX < 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(arrowX + direction * 13, 112);
    ctx.lineTo(arrowX - direction * 13, 98);
    ctx.lineTo(arrowX - direction * 13, 126);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawHiddenRouteHintFrame(ctx, route, cameraX, current, now, deps) {
  const {
    CANVAS_WIDTH,
    clamp,
    getRouteAccessState,
    isHorizontallyVisible,
    worldToScreenX,
  } = deps;
  if (!isHorizontallyVisible(route.x, route.width, cameraX, 80)) return;
  const x = worldToScreenX(route.x, cameraX);
  const discovered = current.discoveredHiddenRouteIds?.has(route.id);
  const access = getRouteAccessState(route, current);
  const locked = access.locked;
  const routeCenterX = x + route.width * 0.5;
  const labelX = clamp(routeCenterX, 130, CANVAS_WIDTH - 130);
  const pulse = 0.78 + Math.sin(now / 360 + route.x * 0.002) * 0.18;
  const useNaturalUpperRouteHint = route.id === 'desert-upper-survey-route';
  ctx.save();
  if (discovered) {
    ctx.restore();
    return;
  }
  if (useNaturalUpperRouteHint) {
    const baseY = route.y + route.height - 5;
    const sandTrail = ctx.createLinearGradient(x, baseY - 38, x, baseY + 8);
    sandTrail.addColorStop(0, 'rgba(226, 167, 91, 0)');
    sandTrail.addColorStop(0.55, discovered ? 'rgba(226, 172, 84, 0.2)' : 'rgba(206, 143, 69, 0.16)');
    sandTrail.addColorStop(1, 'rgba(130, 79, 36, 0.22)');
    ctx.globalAlpha = discovered ? 0.84 : locked ? 0.66 : 0.58;
    ctx.fillStyle = sandTrail;
    ctx.beginPath();
    ctx.ellipse(routeCenterX, baseY - 7, Math.min(210, route.width * 0.32), 22, -0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = discovered
      ? `rgba(250, 204, 21, ${0.13 * pulse})`
      : `rgba(166, 105, 48, ${0.12 * pulse})`;
    ctx.beginPath();
    ctx.ellipse(routeCenterX + 26, baseY - 15, Math.min(120, route.width * 0.18), 9, -0.05, 0, Math.PI * 2);
    ctx.fill();
    const stoneColor = discovered ? 'rgba(142, 91, 45, 0.34)' : 'rgba(119, 76, 42, 0.26)';
    [-210, -132, -54, 38, 128, 214].forEach((offset, index) => {
      const stoneX = routeCenterX + offset;
      if (stoneX < -30 || stoneX > CANVAS_WIDTH + 30) return;
      ctx.fillStyle = stoneColor;
      ctx.beginPath();
      ctx.ellipse(stoneX, baseY - 10 + (index % 2) * 4, 18 - (index % 3) * 3, 6, 0.08, 0, Math.PI * 2);
      ctx.fill();
    });
    if (!discovered && !locked) {
      ctx.restore();
      return;
    }
  } else {
    ctx.globalAlpha = discovered ? 0.78 : locked ? 0.5 : 0.42;
    ctx.fillStyle = discovered
      ? 'rgba(250, 204, 21, 0.08)'
      : locked
        ? 'rgba(14, 116, 144, 0.08)'
        : 'rgba(15, 23, 42, 0.08)';
    ctx.strokeStyle = discovered
      ? 'rgba(250, 204, 21, 0.74)'
      : locked
        ? 'rgba(125, 211, 252, 0.48)'
        : 'rgba(255, 247, 212, 0.34)';
    ctx.lineWidth = discovered ? 2.5 : locked ? 2 : 1.5;
    ctx.setLineDash(discovered ? [] : locked ? [12, 7, 3, 7] : [8, 9]);
    ctx.beginPath();
    ctx.roundRect(x, route.y, route.width, route.height, 14);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = discovered
      ? `rgba(250, 204, 21, ${0.2 * pulse})`
      : locked
        ? `rgba(125, 211, 252, ${0.16 * pulse})`
        : `rgba(255, 247, 212, ${0.13 * pulse})`;
    ctx.beginPath();
    ctx.ellipse(x + route.width * 0.5, route.y + route.height - 10, Math.min(120, route.width * 0.34), 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (locked) {
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.62)';
    ctx.beginPath();
    ctx.roundRect(labelX - 14, route.y + 10, 28, 24, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(labelX, route.y + 21, 6, Math.PI, 0);
    ctx.stroke();
    ctx.strokeRect(labelX - 7, route.y + 19, 14, 9);
  }
  ctx.restore();
}

export function drawWorldTransitionMarkerFrame(ctx, marker, cameraX, now, deps) {
  const {
    CANVAS_WIDTH,
    GROUND_Y,
    drawContactShadow,
    stateRef,
    worldToScreenX,
  } = deps;
  const x = worldToScreenX(marker.x, cameraX);
  if (x < -90 || x > CANVAS_WIDTH + 90) return false;
  const pulse = 0.7 + Math.sin(now / 420 + marker.x * 0.01) * 0.12;
  const baseY = GROUND_Y - 26;
  ctx.save();
  ctx.globalAlpha = 0.48;
  ctx.strokeStyle = 'rgba(255, 247, 212, 0.38)';
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(x, 88);
  ctx.lineTo(x, baseY);
  ctx.stroke();
  ctx.setLineDash([]);
  drawContactShadow(ctx, x, baseY + 28, 96, 0.12, 1.2);
  ctx.fillStyle = `rgba(250, 204, 21, ${0.18 * pulse})`;
  ctx.beginPath();
  ctx.arc(x, baseY - 32, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(69, 26, 3, 0.6)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 26, baseY - 2);
  ctx.lineTo(x - 4, baseY - 62);
  ctx.lineTo(x + 28, baseY - 2);
  ctx.stroke();
  ctx.fillStyle = '#b45309';
  ctx.fillRect(x - 34, baseY - 6, 68, 10);
  const stats = stateRef.current.renderStats;
  if (stats) {
    stats.visibleTransitionStoryMarkers = Array.from(new Set([...(stats.visibleTransitionStoryMarkers || []), marker.id])).slice(-8);
  }
  ctx.restore();
  return true;
}

export function drawStageEntranceForegroundOccluderFrame(ctx, feature, cameraX, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    STAGE_ENTRANCE_THEME_FILTERS,
    clamp,
    desertEndGatewayRef,
    stageEntranceDoorwayRef,
    stateRef,
    worldToScreenX,
  } = deps;
  const occluders = feature.foregroundOccluders || (feature.foregroundOccluder ? [feature.foregroundOccluder] : []);
  if (!occluders.length) return false;
  const doorwayAsset = feature.assetKey === 'desertEndGateway'
    ? desertEndGatewayRef.current
    : stageEntranceDoorwayRef.current;
  if (!doorwayAsset.loaded || !doorwayAsset.image) return false;
  const centerX = worldToScreenX(feature.x, cameraX);
  const width = feature.width || CANVAS_WIDTH * 1.12;
  const height = feature.height || CANVAS_HEIGHT;
  if (centerX < -width * 0.58 || centerX > CANVAS_WIDTH + width * 0.58) return false;

  const drawX = centerX - width / 2;
  const drawY = Math.min(0, CANVAS_HEIGHT - height) + (feature.yOffset || 0);
  const current = stateRef.current;
  const playerCenterX = current.player.x + current.player.width / 2;
  const passageVisual = feature.passageVisual || {};
  const doorwayCenterX = drawX + width * (passageVisual.centerX ?? 0.5);
  let drewLayer = false;

  occluders.forEach((occluder) => {
    const sourceX = doorwayAsset.image.width * occluder.sourceX;
    const sourceY = doorwayAsset.image.height * occluder.sourceY;
    const sourceWidth = doorwayAsset.image.width * occluder.sourceWidth;
    const sourceHeight = doorwayAsset.image.height * occluder.sourceHeight;
    const destX = drawX + width * occluder.destX;
    const destY = drawY + height * occluder.destY;
    const destWidth = width * occluder.destWidth;
    const destHeight = height * occluder.destHeight;
    const nearRadius = occluder.nearRadius ?? width * 0.18;
    const playerNearAmount = clamp(1 - Math.abs(worldToScreenX(playerCenterX, cameraX) - doorwayCenterX) / nearRadius, 0, 1);
    const layerAlpha = (occluder.alpha ?? 1) * (occluder.onlyWhenPlayerNear ? playerNearAmount : 1);

    if (layerAlpha <= 0.02) return;
    ctx.save();
    ctx.globalAlpha = layerAlpha;
    ctx.filter = STAGE_ENTRANCE_THEME_FILTERS[feature.structureTheme] || 'drop-shadow(0 16px 16px rgba(34, 18, 8, 0.24))';
    ctx.drawImage(
      doorwayAsset.image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      destX,
      destY,
      destWidth,
      destHeight,
    );
    ctx.restore();
    drewLayer = true;
  });
  return drewLayer;
}
