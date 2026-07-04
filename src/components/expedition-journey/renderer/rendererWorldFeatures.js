export function drawTrapProjectileFrame(ctx, projectile, cameraX, deps) {
  const {
    CANVAS_WIDTH,
    worldToScreenX,
  } = deps;
  const x = worldToScreenX(projectile.x, cameraX);
  if (x > CANVAS_WIDTH + 80 || x + projectile.width < -80) return;
  ctx.save();
  ctx.translate(x + projectile.width / 2, projectile.y + projectile.height / 2);
  if (projectile.direction === 'up') ctx.rotate(-Math.PI / 2);
  if (projectile.direction === 'down') ctx.rotate(Math.PI / 2);
  if (projectile.direction === 'left') ctx.rotate(Math.PI);
  ctx.fillStyle = '#4b3424';
  ctx.strokeStyle = 'rgba(250, 204, 142, 0.72)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-projectile.width / 2, -3);
  ctx.lineTo(projectile.width / 2, 0);
  ctx.lineTo(-projectile.width / 2, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawWorldContinuityLandmarkFrame(ctx, landmark, cameraX, now, deps) {
  const {
    CANVAS_WIDTH,
    clamp,
    drawDecorativeBaseBlend,
    getSectionForX,
    stateRef,
  } = deps;

    const parallax = landmark.parallax ?? 0.2;
    const section = getSectionForX(landmark.x);
    const viewSection = getSectionForX(cameraX + CANVAS_WIDTH / 2);
    if (section.id !== viewSection.id) return false;
    if (section.id === 'desert-entry' && ['gate', 'tower'].includes(landmark.type)) return false;

    const width = landmark.width || 120;
    const height = landmark.height || 100;
    const sectionWidth = Math.max(1, section.end - section.start);
    const sectionProgress = clamp((cameraX - section.start) / Math.max(1, sectionWidth - CANVAS_WIDTH), 0, 1);
    const localAnchor = ((landmark.x - section.start) / sectionWidth) * CANVAS_WIDTH;
    const x = 120 + localAnchor - sectionProgress * CANVAS_WIDTH * parallax;
    if (x < -width || x > CANVAS_WIDTH + width) return false;

    const baseY = landmark.y + height;
    const pulse = 0.78 + Math.sin(now / 900 + landmark.x * 0.002) * 0.08;

    ctx.save();
    const landmarkAlpha = Number.isFinite(landmark.alpha)
      ? landmark.alpha
      : landmark.type === 'excavation-camp'
        ? 0.58
        : landmark.layer === 'between-chambers'
          ? 0.62
          : 0.38;
    ctx.globalAlpha = landmarkAlpha;
    drawDecorativeBaseBlend(ctx, x, baseY, width * 0.78, section.id, 'background', 0.38);

    if (landmark.type === 'mountains') {
      ctx.fillStyle = 'rgba(37, 62, 79, 0.34)';
      ctx.beginPath();
      ctx.moveTo(x - width * 0.58, baseY - height * 0.06);
      ctx.lineTo(x - width * 0.32, baseY - height * 0.92);
      ctx.lineTo(x - width * 0.08, baseY - height * 0.24);
      ctx.lineTo(x + width * 0.18, baseY - height);
      ctx.lineTo(x + width * 0.52, baseY - height * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.16)';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (landmark.type === 'tower') {
      ctx.fillStyle = 'rgba(61, 45, 31, 0.54)';
      ctx.fillRect(x - width * 0.18, baseY - height, width * 0.36, height);
      ctx.fillRect(x - width * 0.32, baseY - height * 0.28, width * 0.64, height * 0.28);
      ctx.strokeStyle = 'rgba(255, 236, 179, 0.18)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - width * 0.36, baseY - height);
      ctx.lineTo(x, baseY - height * 1.16);
      ctx.lineTo(x + width * 0.36, baseY - height);
      ctx.stroke();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.18)';
      ctx.fillRect(x - 8, baseY - height * 0.72, 16, 22);
    } else if (landmark.type === 'gate') {
      const ruinGradient = ctx.createLinearGradient(x, baseY - height, x, baseY);
      ruinGradient.addColorStop(0, 'rgba(123, 82, 42, 0.2)');
      ruinGradient.addColorStop(1, 'rgba(86, 55, 31, 0.34)');
      ctx.fillStyle = ruinGradient;
      [
        { left: -0.39, right: -0.22, lean: -0.04 },
        { left: 0.22, right: 0.39, lean: 0.035 },
      ].forEach((pillar) => {
        ctx.beginPath();
        ctx.moveTo(x + width * (pillar.left + pillar.lean), baseY - height * 0.82);
        ctx.lineTo(x + width * (pillar.right + pillar.lean), baseY - height * 0.8);
        ctx.lineTo(x + width * pillar.right, baseY - height * 0.08);
        ctx.lineTo(x + width * pillar.left, baseY - height * 0.04);
        ctx.closePath();
        ctx.fill();
      });
      ctx.fillStyle = 'rgba(139, 92, 45, 0.24)';
      ctx.beginPath();
      ctx.moveTo(x - width * 0.5, baseY - height * 0.86);
      ctx.lineTo(x - width * 0.18, baseY - height * 0.96);
      ctx.lineTo(x + width * 0.47, baseY - height * 0.85);
      ctx.lineTo(x + width * 0.4, baseY - height * 0.74);
      ctx.lineTo(x - width * 0.48, baseY - height * 0.72);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(111, 78, 42, 0.28)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, baseY - height * 0.22, width * 0.25, Math.PI, 0);
      ctx.stroke();
    } else if (landmark.type === 'bridge') {
      ctx.strokeStyle = 'rgba(80, 43, 24, 0.5)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x - width * 0.5, baseY - height * 0.48);
      ctx.lineTo(x - width * 0.12, baseY - height * 0.62);
      ctx.moveTo(x + width * 0.04, baseY - height * 0.66);
      ctx.lineTo(x + width * 0.52, baseY - height * 0.5);
      ctx.stroke();
      ctx.lineWidth = 2;
      for (let i = -4; i <= 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x + i * 22, baseY - height * 0.7);
        ctx.lineTo(x + i * 22 + 8, baseY - height * 0.38);
        ctx.stroke();
      }
    } else if (landmark.type === 'record-causeway') {
      ctx.fillStyle = 'rgba(44, 31, 22, 0.26)';
      ctx.beginPath();
      ctx.moveTo(x - width * 0.48, baseY - height * 0.18);
      ctx.lineTo(x - width * 0.34, baseY - height * 0.24);
      ctx.lineTo(x - width * 0.1, baseY - height * 0.21);
      ctx.lineTo(x + width * 0.18, baseY - height * 0.27);
      ctx.lineTo(x + width * 0.48, baseY - height * 0.2);
      ctx.lineTo(x + width * 0.42, baseY - height * 0.08);
      ctx.lineTo(x - width * 0.46, baseY - height * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 238, 180, 0.18)';
      ctx.lineWidth = 2;
      for (let column = 0; column < 7; column += 1) {
        const columnX = x - width * 0.39 + column * width * 0.13;
        ctx.fillStyle = column % 2 === 0 ? 'rgba(88, 57, 31, 0.36)' : 'rgba(59, 39, 24, 0.32)';
        ctx.beginPath();
        ctx.roundRect(columnX - 9, baseY - height * 0.58, 18, height * 0.42, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(columnX - 15, baseY - height * 0.6);
        ctx.lineTo(columnX + 15, baseY - height * 0.6);
        ctx.moveTo(columnX - 13, baseY - height * 0.17);
        ctx.lineTo(columnX + 13, baseY - height * 0.17);
        ctx.stroke();
      }
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.16 * pulse})`;
      ctx.lineWidth = 1.5;
      for (let row = 0; row < 3; row += 1) {
        const rowY = baseY - height * (0.5 - row * 0.1);
        ctx.beginPath();
        ctx.moveTo(x - width * 0.32, rowY);
        ctx.lineTo(x - width * 0.18, rowY + Math.sin(now / 1200 + row) * 1.5);
        ctx.moveTo(x + width * 0.02, rowY + 3);
        ctx.lineTo(x + width * 0.3, rowY + Math.sin(now / 1200 + row + 1) * 1.5);
        ctx.stroke();
      }
    } else if (landmark.type === 'record-frieze') {
      const slabGradient = ctx.createLinearGradient(x - width / 2, baseY - height, x + width / 2, baseY);
      slabGradient.addColorStop(0, 'rgba(92, 57, 28, 0.3)');
      slabGradient.addColorStop(0.48, 'rgba(171, 112, 55, 0.42)');
      slabGradient.addColorStop(1, 'rgba(65, 39, 22, 0.32)');
      ctx.fillStyle = slabGradient;
      ctx.beginPath();
      ctx.roundRect(x - width * 0.5, baseY - height * 0.86, width, height * 0.58, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = `rgba(250, 204, 21, ${0.16 * pulse})`;
      for (let mark = 0; mark < 5; mark += 1) {
        const markX = x - width * 0.35 + mark * width * 0.17;
        ctx.beginPath();
        ctx.ellipse(markX, baseY - height * 0.58, 9, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(markX - 2, baseY - height * 0.42, 4, 16);
      }
    } else if (landmark.type === 'record-image-wall') {
      ctx.fillStyle = 'rgba(75, 48, 28, 0.44)';
      ctx.beginPath();
      ctx.roundRect(x - width * 0.5, baseY - height * 0.9, width, height * 0.68, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 236, 179, 0.22)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = `rgba(96, 165, 250, ${0.14 * pulse})`;
      ctx.beginPath();
      ctx.arc(x - width * 0.12, baseY - height * 0.58, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.24)';
      ctx.lineWidth = 2;
      [-0.32, -0.12, 0.12, 0.32].forEach((offset, index) => {
        const glyphX = x + width * offset;
        ctx.beginPath();
        ctx.moveTo(glyphX - 12, baseY - height * (0.72 - index * 0.02));
        ctx.lineTo(glyphX + 12, baseY - height * (0.72 - index * 0.02));
        ctx.moveTo(glyphX, baseY - height * 0.78);
        ctx.lineTo(glyphX, baseY - height * 0.46);
        ctx.stroke();
      });
    } else if (landmark.type === 'record-script-panel') {
      ctx.fillStyle = 'rgba(52, 35, 24, 0.5)';
      ctx.beginPath();
      ctx.roundRect(x - width * 0.36, baseY - height * 0.9, width * 0.72, height * 0.82, 8);
      ctx.fill();
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.28 * pulse})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 236, 179, 0.3)';
      ctx.lineWidth = 1.5;
      for (let row = 0; row < 5; row += 1) {
        const rowY = baseY - height * 0.72 + row * height * 0.12;
        ctx.beginPath();
        ctx.moveTo(x - width * 0.22, rowY);
        ctx.lineTo(x + width * 0.22, rowY + Math.sin(now / 900 + row) * 2);
        ctx.stroke();
      }
    } else if (landmark.type === 'guardian-ruin') {
      ctx.fillStyle = 'rgba(98, 74, 48, 0.3)';
      ctx.beginPath();
      ctx.moveTo(x - width * 0.3, baseY - height * 0.1);
      ctx.lineTo(x - width * 0.24, baseY - height * 0.62);
      ctx.lineTo(x + width * 0.04, baseY - height * 0.72);
      ctx.lineTo(x + width * 0.3, baseY - height * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x - width * 0.2, baseY - height * 0.92, width * 0.4, height * 0.22, 8);
      ctx.fill();
      ctx.fillStyle = `rgba(45, 212, 191, ${0.14 * pulse})`;
      ctx.beginPath();
      ctx.ellipse(x, baseY - height * 0.46, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 247, 212, 0.16)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - width * 0.32, baseY - height * 0.11);
      ctx.lineTo(x + width * 0.32, baseY - height * 0.14);
      ctx.stroke();
    } else if (landmark.type === 'excavation-camp') {
      ctx.fillStyle = `rgba(254, 240, 138, ${0.18 * pulse})`;
      ctx.beginPath();
      ctx.arc(x, baseY - height * 0.5, width * 0.52, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.48)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - width * 0.34, baseY - height * 0.15);
      ctx.lineTo(x - width * 0.08, baseY - height * 0.62);
      ctx.lineTo(x + width * 0.22, baseY - height * 0.15);
      ctx.stroke();
      [-34, 8, 44].forEach((offset) => {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.58)';
        ctx.beginPath();
        ctx.arc(x + offset, baseY - height * 0.42, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (landmark.type === 'shrine') {
      ctx.fillStyle = `rgba(45, 212, 191, ${0.16 * pulse})`;
      ctx.beginPath();
      ctx.arc(x, baseY - height * 0.46, width * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(31, 41, 55, 0.48)';
      ctx.beginPath();
      ctx.roundRect(x - width * 0.24, baseY - height * 0.78, width * 0.48, height * 0.68, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(204, 251, 241, 0.24)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - width * 0.34, baseY - height * 0.78);
      ctx.lineTo(x, baseY - height);
      ctx.lineTo(x + width * 0.34, baseY - height * 0.78);
      ctx.stroke();
      ctx.fillStyle = `rgba(250, 204, 21, ${0.2 * pulse})`;
      ctx.fillRect(x - 7, baseY - height * 0.56, 14, 20);
    } else if (landmark.type === 'blocked-tunnel') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.44)';
      ctx.beginPath();
      ctx.ellipse(x, baseY - height * 0.26, width * 0.48, height * 0.4, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.22)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, baseY - height * 0.26, width * 0.34, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
      for (let i = 0; i < 7; i += 1) {
        ctx.beginPath();
        ctx.ellipse(x - width * 0.32 + i * width * 0.1, baseY - height * 0.18 + (i % 2) * 6, 8, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const stats = stateRef.current.renderStats;
    if (stats) {
      stats.visibleWorldLandmarks = Array.from(new Set([...(stats.visibleWorldLandmarks || []), landmark.id])).slice(-12);
    }
    ctx.restore();
    return true;
}

export function drawStageEntranceFeatureFrame(ctx, feature, cameraX, now, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GROUND_Y,
    ROUTE_GATES,
    STAGE_ENTRANCE_THEME_FILTERS,
    areRouteGateRequirementsMetForState,
    clamp,
    desertEndGatewayRef,
    drawContactShadow,
    drawGroundDustLip,
    drawRouteGroundApron,
    getSectionForX,
    stageEntranceDoorwayRef,
    stateRef,
    worldToScreenX,
  } = deps;

    const centerX = worldToScreenX(feature.x, cameraX);
    const width = feature.width || CANVAS_WIDTH * 1.12;
    const height = feature.height || CANVAS_HEIGHT;
    if (centerX < -width * 0.58 || centerX > CANVAS_WIDTH + width * 0.58) return false;

    const doorwayAsset = feature.assetKey === 'desertEndGateway'
      ? desertEndGatewayRef.current
      : stageEntranceDoorwayRef.current;
    if (!doorwayAsset.loaded || !doorwayAsset.image) return false;

    const drawX = centerX - width / 2;
    const drawY = Math.min(0, CANVAS_HEIGHT - height) + (feature.yOffset || 0);
    const floorY = Math.min(GROUND_Y + 6, drawY + height - 26);
    const sectionId = feature.to || getSectionForX(feature.x).id;
    const pulse = 0.72 + Math.sin(now / 580 + feature.x * 0.006) * 0.08;
    const revealDistance = Math.abs(centerX - CANVAS_WIDTH * 0.5);
    const focus = clamp(1 - revealDistance / (CANVAS_WIDTH * 0.72), 0, 1);
    const current = stateRef.current;
    const routeGate = ROUTE_GATES.find(item => item.id === feature.routeGateId);
    const doorwayUnlocked = !routeGate || current.openedRouteGateIds?.has(routeGate.id) || areRouteGateRequirementsMetForState(routeGate, current);
    const permanentStructure = Boolean(feature.permanentStructure);
    const passageVisual = feature.passageVisual || {};
    const doorwayCenterX = drawX + width * (passageVisual.centerX ?? 0.5);
    const doorwayCenterY = drawY + height * (passageVisual.centerY ?? 0.54);
    const doorwayRadiusX = width * (passageVisual.radiusX ?? 0.14);
    const doorwayRadiusY = height * (passageVisual.radiusY ?? 0.25);

    ctx.save();
    drawRouteGroundApron(ctx, centerX, floorY - 2, width * 0.72, sectionId, 0.78, Math.round(feature.x));
    if (!permanentStructure) {
      drawContactShadow(ctx, centerX, floorY + 2, width * 0.62, 0.28, 1.22);
    }
    ctx.save();
    ctx.filter = STAGE_ENTRANCE_THEME_FILTERS[feature.structureTheme] || 'drop-shadow(0 16px 16px rgba(34, 18, 8, 0.24))';
    ctx.drawImage(doorwayAsset.image, drawX, drawY, width, height);
    ctx.restore();

    if (feature.structureTheme === 'cool-catacomb-descent') {
      ctx.globalAlpha = 0.18 + focus * 0.1;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.fillRect(drawX + width * 0.38, drawY + height * 0.18, width * 0.24, height * 0.7);
      ctx.globalAlpha = 1;
    } else if (feature.structureTheme === 'collapsed-breach') {
      ctx.globalAlpha = 0.2 + focus * 0.14;
      ctx.fillStyle = 'rgba(249, 115, 22, 0.2)';
      ctx.beginPath();
      ctx.moveTo(centerX - width * 0.18, drawY + height * 0.2);
      ctx.lineTo(centerX + width * 0.2, drawY + height * 0.48);
      ctx.lineTo(centerX - width * 0.08, drawY + height * 0.78);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (feature.structureTheme === 'open-dig-site-threshold') {
      ctx.globalAlpha = 0.14 + focus * 0.1;
      ctx.fillStyle = 'rgba(134, 239, 172, 0.18)';
      ctx.fillRect(drawX + width * 0.32, drawY + height * 0.2, width * 0.36, height * 0.68);
      ctx.globalAlpha = 1;
    }

    if (!permanentStructure) {
      const vignette = ctx.createRadialGradient(doorwayCenterX, doorwayCenterY, width * 0.08, doorwayCenterX, doorwayCenterY, width * 0.5);
      vignette.addColorStop(0, `rgba(20, 184, 166, ${doorwayUnlocked ? 0.08 + focus * 0.1 : 0.03})`);
      vignette.addColorStop(0.5, 'rgba(20, 10, 5, 0)');
      vignette.addColorStop(1, `rgba(18, 10, 6, ${0.08 + focus * 0.18})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(drawX, drawY, width, height);

      ctx.globalAlpha = doorwayUnlocked ? 0.18 + focus * 0.16 + pulse * 0.04 : 0.32 + focus * 0.08;
      ctx.fillStyle = doorwayUnlocked ? 'rgba(8, 18, 24, 0.72)' : 'rgba(18, 13, 9, 0.82)';
      ctx.beginPath();
      ctx.ellipse(doorwayCenterX, doorwayCenterY, doorwayRadiusX, doorwayRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (!doorwayUnlocked) {
        const lockPulse = 0.7 + Math.sin(now / 260) * 0.12;
        ctx.globalAlpha = 0.78;
        ctx.fillStyle = 'rgba(30, 19, 10, 0.72)';
        ctx.beginPath();
        ctx.roundRect(doorwayCenterX - 38, doorwayCenterY - 34, 76, 76, 12);
        ctx.fill();
        ctx.strokeStyle = `rgba(250, 204, 21, ${0.48 + lockPulse * 0.24})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = `rgba(250, 204, 21, ${0.34 + lockPulse * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(doorwayCenterX, doorwayCenterY + 2, 22, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    drawGroundDustLip(ctx, centerX, floorY, width * 0.72, 'rgba(216, 154, 82, 0.26)');
    const stats = stateRef.current.renderStats;
    if (stats) {
      stats.visibleStageEntranceFeatures = Array.from(new Set([...(stats.visibleStageEntranceFeatures || []), feature.id])).slice(-6);
    }
    ctx.restore();
    return true;
}

export function drawDynamicEnvironmentEventFrame(ctx, event, cameraX, now, timer = 0, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GROUND_Y,
    clamp,
    dynamicWorldAssetsRef,
    getDynamicWorldEffectRegion,
    usesPaintedDynamicWorldEffect,
    worldToScreenX,
    stateRef,
  } = deps;

    if (!event || timer <= 0) return false;
    const x = worldToScreenX(event.x, cameraX);
    if (x < -220 || x > CANVAS_WIDTH + 220) return false;
    const preview = Boolean(event.preview);
    const progress = preview
      ? 0.62 + Math.sin(now / 520 + event.x * 0.003) * 0.1
      : clamp(timer / Math.max(0.1, event.duration || 1), 0, 1);
    const reveal = preview ? 0.46 + Math.sin(now / 620 + event.x * 0.004) * 0.18 : 1 - progress;
    const visibility = preview ? 0.62 : 1;
    const pulse = 0.75 + Math.sin(now / 220 + event.x * 0.01) * 0.18;
    const baseY = GROUND_Y - 46;
    const recordVisibleEvent = () => {
      const stats = stateRef.current.renderStats;
      if (stats) {
        stats.visibleDynamicWorldEvents = Array.from(new Set([...(stats.visibleDynamicWorldEvents || []), event.id])).slice(-8);
      }
    };

    ctx.save();

    if (!preview && event.id === 'scarab-queen-lair-dread-wind') {
      const envelope = Math.sin(clamp(reveal, 0, 1) * Math.PI);
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';

      // Directional vignette — amber pressing in from the right (lair's direction)
      const vg = ctx.createLinearGradient(CANVAS_WIDTH, 0, 0, 0);
      vg.addColorStop(0, `rgba(60, 20, 0, ${0.36 * envelope})`);
      vg.addColorStop(0.42, `rgba(40, 12, 0, ${0.14 * envelope})`);
      vg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const rg = ctx.createRadialGradient(CANVAS_WIDTH * 0.45, CANVAS_HEIGHT * 0.5, CANVAS_WIDTH * 0.18, CANVAS_WIDTH * 0.45, CANVAS_HEIGHT * 0.5, CANVAS_WIDTH * 0.86);
      rg.addColorStop(0, 'rgba(0,0,0,0)');
      rg.addColorStop(0.68, `rgba(20, 6, 0, ${0.09 * envelope})`);
      rg.addColorStop(1, `rgba(10, 3, 0, ${0.32 * envelope})`);
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Sand streaks flying right-to-left from the lair
      for (let i = 0; i < 26; i++) {
        const seed = i * 137.508;
        const yPos = CANVAS_HEIGHT * 0.04 + (seed % (CANVAS_HEIGHT * 0.92));
        const speed = 180 + (i * 29 % 170);
        const len = 44 + (i * 19 % 110);
        const stride = CANVAS_WIDTH + len;
        const t = (now * speed * 0.001 + (i / 26) * stride) % stride;
        const sx = CANVAS_WIDTH - t + len * 0.5;
        ctx.globalAlpha = (0.14 + (i % 5) * 0.07) * envelope;
        ctx.strokeStyle = i % 4 === 0 ? 'rgba(255, 215, 110, 0.9)' : 'rgba(220, 155, 65, 0.75)';
        ctx.lineWidth = 0.7 + (i % 4) * 0.55;
        ctx.beginPath();
        ctx.moveTo(sx, yPos);
        ctx.lineTo(sx + len, yPos + (i % 5) - 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    const effectAssets = dynamicWorldAssetsRef.current;
    const effectRegion = getDynamicWorldEffectRegion(event.type);
    if (usesPaintedDynamicWorldEffect(event.type) && effectAssets.loaded && effectAssets.image && effectRegion) {
      const assetAlpha = (preview ? 0.82 : 1) * (0.82 + pulse * 0.12);
      const drawEffect = (width, height, offsetX, offsetY, options = {}) => {
        ctx.save();
        ctx.globalAlpha = clamp(assetAlpha * (options.alpha ?? 1), 0, 1);
        if (options.flipX) {
          ctx.translate(x + offsetX + width / 2, baseY + offsetY + height / 2);
          ctx.scale(-1, 1);
          ctx.drawImage(
            effectAssets.image,
            effectRegion.x,
            effectRegion.y,
            effectRegion.w,
            effectRegion.h,
            -width / 2,
            -height / 2,
            width,
            height,
          );
        } else {
          ctx.drawImage(
            effectAssets.image,
            effectRegion.x,
            effectRegion.y,
            effectRegion.w,
            effectRegion.h,
            x + offsetX,
            baseY + offsetY,
            width,
            height,
          );
        }
        ctx.restore();
      };

      if (event.type === 'dust-gust' || event.type === 'moving-fog' || event.type === 'unstable-excavation') {
        drawEffect(360 + pulse * 16, 230 + pulse * 8, -180 + reveal * 34, -205, { alpha: event.type === 'moving-fog' ? 0.72 : 0.96 });
        ctx.restore();
        recordVisibleEvent();
        return true;
      }
      if (event.type === 'birds-scatter') {
        drawEffect(290 + reveal * 34, 190 + reveal * 12, -120 + reveal * 48, -370 - reveal * 28, { alpha: 0.98 });
        ctx.restore();
        recordVisibleEvent();
        return true;
      }
      if (event.type === 'shrine-glow') {
        ctx.globalCompositeOperation = 'screen';
        drawEffect(250 + pulse * 28, 280 + pulse * 24, -126, -330, { alpha: 0.86 });
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
        recordVisibleEvent();
        return true;
      }
      if (event.type === 'rockfall' || event.type === 'ruin-collapse') {
        drawEffect(300 + reveal * 20, 320 + reveal * 16, -146, -322 + reveal * 10, { alpha: 0.95 });
        ctx.restore();
        recordVisibleEvent();
        return true;
      }
    }

    if (event.type === 'looter-shadow') {
      const run = preview ? 0.32 + Math.sin(now / 520) * 0.08 : clamp(1 - progress, 0, 1);
      const looterX = x - 86 + run * 255;
      const looterY = GROUND_Y - 392 - Math.sin(run * Math.PI) * 14;
      ctx.globalAlpha = (preview ? 0.44 : 0.9) * visibility;
      ctx.fillStyle = 'rgba(10, 8, 7, 0.86)';
      ctx.beginPath();
      ctx.ellipse(looterX, looterY + 28, 13, 24, -0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(looterX + 2, looterY + 5, 10, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(10, 8, 7, 0.82)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(looterX - 4, looterY + 34);
      ctx.lineTo(looterX - 24 + Math.sin(run * 12) * 8, looterY + 53);
      ctx.moveTo(looterX + 8, looterY + 34);
      ctx.lineTo(looterX + 30 - Math.sin(run * 12) * 7, looterY + 52);
      ctx.stroke();
      ctx.globalCompositeOperation = 'screen';
      const glow = ctx.createRadialGradient(looterX + 28, looterY + 22, 4, looterX + 28, looterY + 22, 54);
      glow.addColorStop(0, 'rgba(96, 165, 250, 0.75)');
      glow.addColorStop(0.42, 'rgba(250, 204, 21, 0.28)');
      glow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(looterX - 34, looterY - 36, 124, 124);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = (preview ? 0.28 : 0.52) * visibility;
      ctx.fillStyle = 'rgba(217, 119, 6, 0.34)';
      ctx.beginPath();
      ctx.ellipse(x + 205, looterY + 62 + reveal * 10, 92 + reveal * 24, 12, -0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      recordVisibleEvent();
      return true;
    }

    if (event.type === 'rockfall') {
      ctx.globalAlpha = 0.58 * progress * visibility;
      ctx.fillStyle = 'rgba(100, 76, 52, 0.66)';
      for (let i = 0; i < 7; i += 1) {
        const fall = reveal * (50 + i * 18);
        ctx.beginPath();
        ctx.ellipse(x + i * 18 - 54, baseY - 150 + fall, 4 + (i % 3), 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(217, 161, 88, 0.26)';
      ctx.beginPath();
      ctx.ellipse(x, baseY - 16, 128 + reveal * 44, 13, -0.08, 0, Math.PI * 2);
      ctx.fill();
    } else if (event.type === 'dust-gust' || event.type === 'moving-fog') {
      const fog = event.type === 'moving-fog';
      ctx.globalAlpha = (fog ? 0.42 : 0.66) * progress * visibility;
      ctx.fillStyle = fog ? 'rgba(191, 219, 254, 0.28)' : 'rgba(245, 158, 11, 0.32)';
      for (let i = 0; i < 6; i += 1) {
        const drift = reveal * (110 + i * 26);
        ctx.beginPath();
        ctx.ellipse(x - 120 + drift + i * 38, fog ? GROUND_Y - 170 + i * 16 : GROUND_Y - 108 + i * 12, 112 - i * 6, fog ? 14 : 10, -0.08, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!fog) {
        ctx.strokeStyle = 'rgba(255, 247, 212, 0.38)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i += 1) {
          const drift = reveal * (90 + i * 24);
          ctx.beginPath();
          ctx.moveTo(x - 150 + drift, GROUND_Y - 130 + i * 17);
          ctx.quadraticCurveTo(x - 45 + drift, GROUND_Y - 146 + i * 10, x + 92 + drift, GROUND_Y - 118 + i * 12);
          ctx.stroke();
        }
      }
    } else if (event.type === 'birds-scatter') {
      ctx.globalAlpha = 0.78 * progress * visibility;
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.58)';
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 6; i += 1) {
        const bx = x + reveal * (70 + i * 16) + i * 16;
        const by = GROUND_Y - 270 - reveal * (50 + i * 5) + Math.sin(now / 120 + i) * 6;
        ctx.beginPath();
        ctx.moveTo(bx - 10, by);
        ctx.lineTo(bx, by - 4);
        ctx.lineTo(bx + 10, by);
        ctx.stroke();
      }
    } else if (event.type === 'ruin-collapse') {
      ctx.globalAlpha = 0.5 * progress * visibility;
      ctx.fillStyle = 'rgba(61, 45, 31, 0.58)';
      ctx.fillRect(x - 30, baseY - 170 + reveal * 18, 24, 132);
      ctx.fillRect(x + 14, baseY - 138 + reveal * 26, 22, 98);
      ctx.fillStyle = 'rgba(190, 119, 62, 0.32)';
      for (let i = 0; i < 8; i += 1) {
        ctx.beginPath();
        ctx.ellipse(x - 60 + i * 18, baseY - 32 + reveal * i * 5, 5, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (event.type === 'shrine-glow') {
      ctx.globalAlpha = 0.92 * progress * visibility;
      const glow = ctx.createRadialGradient(x, baseY - 126, 8, x, baseY - 126, 92 * pulse);
      glow.addColorStop(0, 'rgba(250, 204, 21, 0.46)');
      glow.addColorStop(0.42, 'rgba(45, 212, 191, 0.24)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, baseY - 126, 92 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(204, 251, 241, 0.34)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, baseY - 126, 28 + reveal * 18, 0, Math.PI * 2);
      ctx.stroke();
    } else if (event.type === 'unstable-excavation') {
      ctx.globalAlpha = 0.64 * progress * visibility;
      ctx.strokeStyle = 'rgba(137, 104, 72, 0.36)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x - 80 + i * 34, baseY - 8);
        ctx.lineTo(x - 62 + i * 34 + Math.sin(now / 80 + i) * 5, baseY + 14);
        ctx.lineTo(x - 42 + i * 34, baseY + 6);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(217, 161, 88, 0.16)';
      ctx.beginPath();
      ctx.ellipse(x, baseY + 10, 118, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.restore();
      return false;
    }
    ctx.restore();

    recordVisibleEvent();
    return true;
}

export function drawEnvironmentInteractionFrame(ctx, item, cameraX, now, current, deps) {
  const {
    drawContactShadow,
    drawDecorativeBaseBlend,
    getSectionForX,
    isHorizontallyVisible,
    stateRef,
    worldToScreenX,
  } = deps;

    if (current.brokenEnvironmentIds?.has(item.id)) return;
    if (!isHorizontallyVisible(item.x, item.width, cameraX, 90)) return;
    const x = worldToScreenX(item.x, cameraX);
    const section = getSectionForX(item.x);
    const wobble = Math.sin(now / 420 + item.x * 0.01);
    const touched = current.triggeredEnvironmentIds?.has(item.id);

    ctx.save();
    ctx.globalAlpha = touched ? 0.9 : 0.78;
    if (item.type === 'breakable-crate') {
      drawContactShadow(ctx, x + item.width / 2, item.y + item.height + 4, item.width * 0.9, 0.16, 1.2);
      drawDecorativeBaseBlend(ctx, x + item.width / 2, item.y + item.height + 4, item.width * 0.8, section.id, 'midground', 0.66);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x, item.y, item.width, item.height);
      ctx.strokeStyle = touched ? '#fde68a' : '#451a03';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 3, item.y + 3, item.width - 6, item.height - 6);
      ctx.beginPath();
      ctx.moveTo(x + 6, item.y + item.height - 6);
      ctx.lineTo(x + item.width - 6, item.y + 6);
      ctx.stroke();
    } else if (item.type === 'loose-rocks') {
      drawDecorativeBaseBlend(ctx, x + item.width / 2, item.y + item.height, item.width, section.id, 'midground', 0.58);
      ctx.fillStyle = touched ? 'rgba(148, 163, 184, 0.72)' : 'rgba(100, 76, 52, 0.62)';
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.ellipse(x + 8 + i * 14, item.y + 15 + (i % 2) * 5, 8 + (i % 2) * 2, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (item.type === 'hanging-rope') {
      const sway = wobble * 10;
      ctx.strokeStyle = 'rgba(92, 49, 18, 0.68)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + item.width / 2, item.y);
      ctx.quadraticCurveTo(x + item.width / 2 + sway, item.y + item.height * 0.48, x + item.width / 2 - sway * 0.3, item.y + item.height);
      ctx.stroke();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
      ctx.beginPath();
      ctx.arc(x + item.width / 2 - sway * 0.3, item.y + item.height, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === 'swinging-banner') {
      const sway = wobble * 8;
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + item.width / 2 - 2, item.y, 4, item.height);
      ctx.fillStyle = touched ? '#f59e0b' : '#b45309';
      ctx.beginPath();
      ctx.moveTo(x + item.width / 2 + 4, item.y + 8);
      ctx.quadraticCurveTo(x + item.width + sway, item.y + 26, x + item.width / 2 + 6, item.y + 62);
      ctx.closePath();
      ctx.fill();
    } else if (item.type === 'collapsing-bridge') {
      drawContactShadow(ctx, x + item.width / 2, item.y + item.height + 4, item.width, 0.18, 1.2);
      ctx.strokeStyle = touched ? 'rgba(137, 104, 72, 0.72)' : 'rgba(69, 26, 3, 0.66)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x, item.y + 16 + wobble * 2);
      ctx.lineTo(x + item.width * 0.38, item.y + 8);
      ctx.moveTo(x + item.width * 0.48, item.y + 10);
      ctx.lineTo(x + item.width, item.y + 22 - wobble * 2);
      ctx.stroke();
    } else if (item.type === 'watchtower-section') {
      drawContactShadow(ctx, x + item.width / 2, item.y + item.height + 4, item.width * 0.8, 0.12, 1.2);
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.62)';
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 14, item.y, item.width - 28, item.height);
      ctx.lineWidth = 2;
      for (let rung = 18; rung < item.height - 8; rung += 20) {
        ctx.beginPath();
        ctx.moveTo(x + 14, item.y + rung);
        ctx.lineTo(x + item.width - 14, item.y + rung + wobble * 1.2);
        ctx.stroke();
      }
    } else if (item.type === 'rippling-water') {
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.42)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.ellipse(x + item.width / 2 + wobble * 10, item.y + 5 + i * 6, item.width * (0.26 + i * 0.09), 3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (item.type === 'blowing-grass') {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.46)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i += 1) {
        const bladeX = x + i * 10;
        ctx.beginPath();
        ctx.moveTo(bladeX, item.y + item.height);
        ctx.quadraticCurveTo(bladeX + wobble * 7, item.y + item.height * 0.44, bladeX + 3 + wobble * 9, item.y + 2);
        ctx.stroke();
      }
    }

    const stats = stateRef.current.renderStats;
    if (stats) {
      stats.visibleEnvironmentInteractions = Array.from(new Set([...(stats.visibleEnvironmentInteractions || []), item.id])).slice(-12);
    }
    ctx.restore();
}

export function drawRouteGateFrame(ctx, gate, screenX, current, complete, layer = 'base', doorway = null, deps) {
  const {
    ENVIRONMENT_ASSET_PACK_IDS,
    GROUND_Y,
    drawAtlasRegion,
    drawContactShadow,
    drawDecorativeBaseBlend,
    drawGroundDustLip,
    environmentAssetsRef,
    getSectionForX,
    placeGateOnGround,
    routeGateBackRef,
    routeGateFrontRef,
    routeGateSlabRef,
  } = deps;

    if (gate.suppressRouteGateVisual) return;
    if (gate.hideArchVisual) {
      if (layer !== 'base' || complete) return;
      const cx = (doorway?.anchorX ? screenX : screenX + gate.width / 2);
      ctx.save();
      const sealedShadow = ctx.createRadialGradient(cx, GROUND_Y - 62, 12, cx, GROUND_Y - 62, 94);
      sealedShadow.addColorStop(0, 'rgba(70, 37, 13, 0.26)');
      sealedShadow.addColorStop(1, 'rgba(70, 37, 13, 0)');
      ctx.fillStyle = sealedShadow;
      ctx.beginPath();
      ctx.ellipse(cx, GROUND_Y - 58, 94, 62, 0, 0, Math.PI * 2);
      ctx.fill();
      const slabGradient = ctx.createLinearGradient(cx - 92, GROUND_Y - 288, cx + 92, GROUND_Y);
      slabGradient.addColorStop(0, '#d1a96b');
      slabGradient.addColorStop(0.56, '#927047');
      slabGradient.addColorStop(1, '#5f4327');
      ctx.fillStyle = slabGradient;
      ctx.strokeStyle = 'rgba(58, 35, 18, 0.62)';
      ctx.lineWidth = 2;
      ctx.fillRect(cx - 17, GROUND_Y - 274, 34, 274);
      ctx.strokeRect(cx - 17, GROUND_Y - 274, 34, 274);
      ctx.restore();
      return;
    }
    const gateCenter = doorway?.anchorX ? screenX : screenX + gate.width / 2;
    ctx.save();
    const activeEnvironmentPackId = environmentAssetsRef.current?.packId;
    const isChinaGate = activeEnvironmentPackId === ENVIRONMENT_ASSET_PACK_IDS.CHINA_RIVER_VALLEY;
    const isRomeGate = activeEnvironmentPackId === ENVIRONMENT_ASSET_PACK_IDS.ROME_SECTION_ONE;
    if (isChinaGate || isRomeGate) {
      const atlasKey = complete ? 'routeDoor' : isChinaGate ? 'sealedTimberGate' : 'romanSealedGate';
      const gateHeight = isChinaGate ? 310 : 330;
      const gateWidth = isChinaGate ? 290 : 250;
      const gateTop = placeGateOnGround(gateHeight) + (isChinaGate ? 8 : 4);
      const dest = {
        x: gateCenter - gateWidth / 2,
        y: gateTop,
        width: gateWidth,
        height: gateHeight,
      };
      if (layer === 'foreground') {
        if (!complete) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const pulse = Math.sin(performance.now() / 620) * 0.5 + 0.5;
          const glow = ctx.createRadialGradient(gateCenter, gateTop + gateHeight * 0.48, 8, gateCenter, gateTop + gateHeight * 0.48, gateWidth * 0.42);
          glow.addColorStop(0, isChinaGate
            ? `rgba(104, 180, 132, ${0.18 + pulse * 0.12})`
            : `rgba(238, 190, 86, ${0.18 + pulse * 0.12})`);
          glow.addColorStop(1, 'rgba(238, 190, 86, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.ellipse(gateCenter, gateTop + gateHeight * 0.48, gateWidth * 0.42, gateHeight * 0.24, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
        return;
      }
      drawContactShadow(ctx, gateCenter, GROUND_Y + 2, gateWidth * 0.86, complete ? 0.16 : 0.24, 1.1);
      drawDecorativeBaseBlend(ctx, gateCenter, GROUND_Y + 2, gateWidth * 0.76, getSectionForX(gate.x).id, 'midground', 0.72);
      if (complete) {
        const openGlow = ctx.createRadialGradient(gateCenter, GROUND_Y - 92, 8, gateCenter, GROUND_Y - 92, 96);
        openGlow.addColorStop(0, isChinaGate ? 'rgba(90, 196, 136, 0.2)' : 'rgba(70, 217, 190, 0.18)');
        openGlow.addColorStop(0.5, isChinaGate ? 'rgba(214, 184, 84, 0.12)' : 'rgba(250, 204, 21, 0.12)');
        openGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = openGlow;
        ctx.beginPath();
        ctx.ellipse(gateCenter, GROUND_Y - 92, 96, 78, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      const gateDrawn = drawAtlasRegion(ctx, environmentAssetsRef.current, atlasKey, dest, {
        mode: 'contain',
        alignY: 'bottom',
      });
      if (!gateDrawn) {
        ctx.restore();
        return;
      }
      drawGroundDustLip(ctx, gateCenter, GROUND_Y + 1, gateWidth * 0.78, isChinaGate ? 'rgba(134, 110, 54, 0.2)' : 'rgba(184, 116, 52, 0.22)');
      if (current.renderStats) current.renderStats.groundedPropCount += 1;
      ctx.restore();
      return;
    }
    // Assets are 1024×682 (back/front) and 1024×637 (slab) — ratio ≈ 1.50:1.
    // Draw at natural aspect ratio to avoid squashing, and sink into ground by 20px
    // so the stone base sits flush rather than floating.
    const ASSET_RATIO = 1024 / 682; // ≈ 1.501
    const gateHeight = 340;
    const gateTop = placeGateOnGround(gateHeight) + 15; // +15 sinks base into ground line
    const backWidth = Math.round(gateHeight * ASSET_RATIO); // 510
    const frontWidth = Math.round((gateHeight + 20) * ASSET_RATIO); // 540
    const frontPillarPassageOffset = -Math.round(frontWidth * 0.37);
    const gateWidth = backWidth;

    const drawGateAsset = (ref, dest, options = {}) => {
      if (!ref.current.loaded || !ref.current.image) return false;
      ctx.save();
      ctx.globalAlpha *= options.alpha ?? 1;
      if (options.filter) ctx.filter = options.filter;
      if (options.flipX) {
        ctx.translate(dest.x + dest.width / 2, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(ref.current.image, -dest.width / 2, dest.y, dest.width, dest.height);
      } else {
        ctx.drawImage(ref.current.image, dest.x, dest.y, dest.width, dest.height);
      }
      ctx.restore();
      return true;
    };

    // 3/4 Perspective Layout — both assets are landscape (1024×682).
    // Back arch: left column + spanning lintel, centred on gateCenter.
    const backDest = {
      x: gateCenter - Math.round(backWidth / 2),
      y: gateTop,
      width: backWidth,   // 510
      height: gateHeight, // 340
    };
    // Front column: near foreground occluder, offset clear of the walk-through opening.
    const frontDest = {
      x: gateCenter - Math.round(frontWidth / 2) + frontPillarPassageOffset,
      y: gateTop - 8,     // slightly higher — closer to camera = taller
      width: frontWidth,  // 540
      height: gateHeight + 20, // 360
    };
    // Slab fills the arch opening when locked.
    const slabDest = doorway?.slab
      ? {
          x: gateCenter + doorway.slab.x,
          y: GROUND_Y + doorway.slab.y,
          width: doorway.slab.width,
          height: doorway.slab.height,
        }
      : {
          x: gateCenter - 105,
          y: gateTop + 52,
          width: 185,
          height: gateHeight - 42,
        };

    const drawFallbackArch = () => {
      const stone = ctx.createLinearGradient(gateCenter - gateWidth / 2, gateTop, gateCenter + gateWidth / 2, GROUND_Y);
      stone.addColorStop(0, complete ? '#d8c092' : '#b89768');
      stone.addColorStop(0.55, complete ? '#a98455' : '#806242');
      stone.addColorStop(1, '#4f3825');
      ctx.fillStyle = stone;
      ctx.strokeStyle = 'rgba(58, 35, 18, 0.76)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gateCenter - gateWidth * 0.42, GROUND_Y);
      ctx.lineTo(gateCenter - gateWidth * 0.42, gateTop + 54);
      ctx.quadraticCurveTo(gateCenter, gateTop - 14, gateCenter + gateWidth * 0.42, gateTop + 54);
      ctx.lineTo(gateCenter + gateWidth * 0.42, GROUND_Y);
      ctx.lineTo(gateCenter + gateWidth * 0.24, GROUND_Y);
      ctx.lineTo(gateCenter + gateWidth * 0.24, gateTop + 70);
      ctx.quadraticCurveTo(gateCenter, gateTop + 36, gateCenter - gateWidth * 0.24, gateTop + 70);
      ctx.lineTo(gateCenter - gateWidth * 0.24, GROUND_Y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    if (layer === 'foreground') {
      const archDrawn = drawGateAsset(routeGateFrontRef, frontDest, {
        alpha: 0.99,
        filter: 'sepia(2%) saturate(104%) brightness(108%) contrast(102%) drop-shadow(-8px 6px 12px rgba(46, 28, 12, 0.35))',
        flipX: true,
      });
      if (!archDrawn && complete) drawFallbackArch();
      ctx.restore();
      return;
    }

    drawContactShadow(ctx, gateCenter, GROUND_Y + 2, gateWidth * 0.9, complete ? 0.18 : 0.24, 1.15);
    drawDecorativeBaseBlend(ctx, gateCenter, GROUND_Y + 2, gateWidth * 0.86, getSectionForX(gate.x).id, 'midground', 0.74);

    if (complete) {
      const openGlow = ctx.createRadialGradient(gateCenter, GROUND_Y - 70, 8, gateCenter, GROUND_Y - 70, 104);
      openGlow.addColorStop(0, 'rgba(70, 217, 190, 0.2)');
      openGlow.addColorStop(0.42, 'rgba(250, 204, 21, 0.12)');
      openGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = openGlow;
      ctx.beginPath();
      ctx.ellipse(gateCenter, GROUND_Y - 70, 104, 74, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(26, 16, 9, 0.46)';
      ctx.beginPath();
      ctx.roundRect(gateCenter - 35, GROUND_Y - 115, 70, 108, 8);
      ctx.fill();
    } else {
      const sealedShadow = ctx.createRadialGradient(gateCenter, GROUND_Y - 62, 12, gateCenter, GROUND_Y - 62, 94);
      sealedShadow.addColorStop(0, 'rgba(70, 37, 13, 0.26)');
      sealedShadow.addColorStop(1, 'rgba(70, 37, 13, 0)');
      ctx.fillStyle = sealedShadow;
      ctx.beginPath();
      ctx.ellipse(gateCenter, GROUND_Y - 58, 94, 62, 0, 0, Math.PI * 2);
      ctx.fill();
      // Interior depth: dark recess behind/around the slab so it reads as set INTO
      // the arch rather than flush against a flat wall.
      const recess = ctx.createLinearGradient(slabDest.x, slabDest.y, slabDest.x + slabDest.width, slabDest.y);
      recess.addColorStop(0, 'rgba(20, 11, 5, 0.55)');
      recess.addColorStop(0.22, 'rgba(20, 11, 5, 0)');
      recess.addColorStop(0.78, 'rgba(20, 11, 5, 0)');
      recess.addColorStop(1, 'rgba(20, 11, 5, 0.55)');
      ctx.fillStyle = recess;
      ctx.fillRect(slabDest.x - 8, slabDest.y - 6, slabDest.width + 16, slabDest.height + 6);
      const slabDrawn = drawGateAsset(routeGateSlabRef, slabDest, {
        alpha: 0.98,
        filter: 'sepia(3%) saturate(96%) brightness(95%) contrast(104%)',
      });
      if (!slabDrawn) {
        const slabGradient = ctx.createLinearGradient(slabDest.x, slabDest.y, slabDest.x + slabDest.width, slabDest.y + slabDest.height);
        slabGradient.addColorStop(0, '#d1a96b');
        slabGradient.addColorStop(0.56, '#927047');
        slabGradient.addColorStop(1, '#5f4327');
        ctx.fillStyle = slabGradient;
        ctx.strokeStyle = 'rgba(58, 35, 18, 0.62)';
        ctx.lineWidth = 2;
        ctx.fillRect(slabDest.x, slabDest.y, slabDest.width, slabDest.height);
        ctx.strokeRect(slabDest.x, slabDest.y, slabDest.width, slabDest.height);
      }
      // Active-checkpoint signal: a warm sealed-energy light shaft rising from the
      // opening, gently pulsing so the gate reads as "break the seal", not set dressing.
      const seam = gateCenter;
      const pulse = Math.sin(performance.now() / 620) * 0.5 + 0.5; // 0..1
      const shaftTop = slabDest.y + 6;
      const shaftBottom = slabDest.y + slabDest.height;
      const shaft = ctx.createLinearGradient(seam, shaftBottom, seam, shaftTop);
      shaft.addColorStop(0, `rgba(250, 196, 84, ${0.12 + pulse * 0.16})`);
      shaft.addColorStop(0.5, `rgba(252, 211, 110, ${0.07 + pulse * 0.1})`);
      shaft.addColorStop(1, 'rgba(252, 211, 110, 0)');
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const shaftWidth = 30 + pulse * 8;
      ctx.fillStyle = shaft;
      ctx.fillRect(seam - shaftWidth / 2, shaftTop, shaftWidth, shaftBottom - shaftTop);
      const seamGlow = ctx.createRadialGradient(seam, shaftTop + 18, 4, seam, shaftTop + 18, 46 + pulse * 10);
      seamGlow.addColorStop(0, `rgba(255, 224, 140, ${0.22 + pulse * 0.18})`);
      seamGlow.addColorStop(1, 'rgba(255, 224, 140, 0)');
      ctx.fillStyle = seamGlow;
      ctx.beginPath();
      ctx.ellipse(seam, shaftTop + 18, 40 + pulse * 8, 56 + pulse * 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const archBackDrawn = drawGateAsset(routeGateBackRef, backDest, {
      alpha: 0.96,
      filter: 'sepia(5%) saturate(94%) brightness(94%) contrast(106%) drop-shadow(0 6px 8px rgba(46, 28, 12, 0.3))',
      flipX: true,
    });
    if (!archBackDrawn && !complete) drawFallbackArch();

    drawGroundDustLip(ctx, gateCenter, GROUND_Y + 1, gateWidth * 0.82, 'rgba(184, 116, 52, 0.22)');
    if (current.renderStats) current.renderStats.groundedPropCount += 1;
    ctx.restore();
}

export function drawHazardBurialCoverFrame(ctx, centerX, footY, width, burial, sectionId) {
    if (burial <= 0) return;
    const coverHeight = Math.max(5, width * (0.04 + burial * 0.08));
    const coverWidth = width * (0.92 + burial * 0.34);
    const isCatacombs = sectionId === 'catacombs';

    ctx.save();
    ctx.globalAlpha = 0.42 + burial * 0.32;
    const sand = ctx.createLinearGradient(0, footY - coverHeight * 1.6, 0, footY + coverHeight * 0.95);
    sand.addColorStop(0, isCatacombs ? 'rgba(110, 86, 56, 0)' : 'rgba(233, 181, 96, 0)');
    sand.addColorStop(0.46, isCatacombs ? 'rgba(107, 84, 57, 0.48)' : 'rgba(214, 149, 69, 0.54)');
    sand.addColorStop(1, isCatacombs ? 'rgba(52, 39, 28, 0.5)' : 'rgba(124, 70, 29, 0.5)');
    ctx.fillStyle = sand;
    ctx.beginPath();
    ctx.ellipse(centerX, footY - coverHeight * 0.18, coverWidth / 2, coverHeight, -0.03, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.3 + burial * 0.22;
    ctx.strokeStyle = isCatacombs ? 'rgba(170, 135, 86, 0.32)' : 'rgba(250, 203, 119, 0.36)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(centerX - coverWidth * 0.38, footY - coverHeight * 0.48);
    ctx.quadraticCurveTo(centerX - coverWidth * 0.08, footY + coverHeight * 0.14, centerX + coverWidth * 0.24, footY - coverHeight * 0.18);
    ctx.quadraticCurveTo(centerX + coverWidth * 0.36, footY - coverHeight * 0.36, centerX + coverWidth * 0.45, footY - coverHeight * 0.04);
    ctx.stroke();
    ctx.restore();
}

export function drawHazardFrame(ctx, hazard, cameraX, current, now, deps) {
  const {
    HAZARD_VISUALS,
    clamp,
    drawAtlasRegion,
    drawContactShadow,
    drawGroundDustLip,
    drawHazardGroundApron,
    drawOpeningHazardDecalRegion,
    environmentAssetsRef,
    getEgyptHazardDecalDescriptor,
    getEgyptHazardDecalDest,
    getEnvironmentAssetKeyForHazard,
    getDesertEntryVisualGroundOffsetY,
    getHazardBurialAmount,
    getHazardGroundingConfig,
    getHazardVisualConfig,
    getHazardVisualId,
    getSectionForX,
    isHorizontallyVisible,
    isReusableJourneyTrap,
    normalizeJourneyTrap,
    worldToScreenX,
  } = deps;

    const hx = worldToScreenX(hazard.x, cameraX);
    if (!isHorizontallyVisible(hazard.x, hazard.width, cameraX, 50)) return;

    const trapRuntime = current.trapStates?.[hazard.id] || {};
    const reusableTrap = isReusableJourneyTrap(hazard) ? normalizeJourneyTrap(hazard) : null;
    const trapPhase = trapRuntime.phase || 'armed';
    const visualHazardId = reusableTrap?.type === 'hidden-sand-pit' && trapPhase === 'revealed'
      ? 'dark-gap'
      : getHazardVisualId(hazard);
    const visual = HAZARD_VISUALS[visualHazardId] || getHazardVisualConfig(hazard);
    const shakeY = reusableTrap?.type === 'collapsing-stone-floor' && trapPhase === 'shaking'
      ? Math.sin(now / 22) * 2
      : 0;
    const hazardFootY = hazard.y + hazard.height;
    const visualGroundOffsetY = typeof getDesertEntryVisualGroundOffsetY === 'function'
      ? getDesertEntryVisualGroundOffsetY(hazard.x + hazard.width / 2, hazardFootY, current)
      : 0;
    const baseY = hazard.y + shakeY + visualGroundOffsetY;
    const section = getSectionForX(hazard.x);
    const grounding = getHazardGroundingConfig(hazard);
    const centerX = hx + hazard.width / 2;
    const footY = baseY + hazard.height;
    const dustWidth = hazard.width * (grounding.dustWidth || 0.9);
    const burial = getHazardBurialAmount(hazard);
    const hazardAlpha = Number.isFinite(hazard.alpha) ? clamp(hazard.alpha, 0, 1) : 1;
    const hazardFilterBase = hazard.colorGradeFilter || grounding.filter || 'none';
    const hazardFilter = Number.isFinite(hazard.brightness) && hazard.brightness !== 1
      ? `${hazardFilterBase && hazardFilterBase !== 'none' ? `${hazardFilterBase} ` : ''}brightness(${Math.round(clamp(hazard.brightness, 0.4, 1.8) * 100)}%)`
      : hazardFilterBase;

    ctx.save();
    ctx.globalAlpha *= hazardAlpha;
    if (reusableTrap?.type === 'dart-launcher') {
      const launcherX = worldToScreenX(reusableTrap.launcherX, cameraX);
      const launcherY = reusableTrap.launcherY;
      ctx.save();
      ctx.fillStyle = 'rgba(37, 25, 17, 0.82)';
      ctx.strokeStyle = 'rgba(180, 137, 76, 0.72)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(launcherX - 16, launcherY - 13, 32, 26, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(8, 13, 22, 0.9)';
      ctx.beginPath();
      ctx.ellipse(launcherX, launcherY, reusableTrap.direction === 'up' || reusableTrap.direction === 'down' ? 5 : 10, reusableTrap.direction === 'up' || reusableTrap.direction === 'down' ? 10 : 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (reusableTrap?.type === 'collapsing-stone-floor' && trapPhase === 'collapsed') {
      ctx.globalAlpha = 0.9;
    }
    const hazardAssetKey = getEnvironmentAssetKeyForHazard(hazard, environmentAssetsRef.current.packId);
    const hazardDest = {
      x: hx - grounding.xPad,
      y: baseY - grounding.yOffset,
      width: hazard.width + grounding.widthPad,
      height: Math.max(12, hazard.height + grounding.heightPad),
    };
    const decalDescriptor = reusableTrap?.type === 'hidden-sand-pit' && trapPhase === 'revealed'
      ? null
      : getEgyptHazardDecalDescriptor(hazard);
    const decalDest = decalDescriptor
      ? getEgyptHazardDecalDest(hazard, hx, footY, decalDescriptor.regionKey)
      : hazardDest;
    if (visualHazardId === 'spike-trap' && current.lastHazardHit?.id === hazard.id && current.hazardCooldown > 0.4) {
      decalDest.y -= 18;
    }
    if (visualHazardId !== 'bat-cloud' && visualHazardId !== 'dust-wave') {
      drawContactShadow(ctx, centerX, footY + 3, hazard.width * 0.92, grounding.shadow, 0.9);
    }
    if (dustWidth > 0) {
      drawGroundDustLip(ctx, centerX, footY + 1, dustWidth, 'rgba(122, 78, 37, 0.16)');
    }
    if (decalDescriptor) {
      const decalDrawn = drawOpeningHazardDecalRegion(ctx, decalDescriptor, decalDest, {
        alpha: 0.94 * hazardAlpha,
        filter: hazardFilter,
        ...(visualHazardId === 'spike-trap' ? { cropBottomRatio: 0.56, alignY: 'bottom' } : {}),
      });
      if (decalDrawn) {
        if (dustWidth > 0) {
          const apronIntensity = visualHazardId === 'spike-trap'
            ? 1.08
            : visualHazardId === 'sand-pit' || visualHazardId === 'dark-gap'
              ? 1.2
              : 0.82;
          drawGroundDustLip(ctx, centerX, footY + 2, dustWidth * 0.9, visualHazardId === 'spike-trap' ? 'rgba(209, 143, 72, 0.32)' : 'rgba(209, 143, 72, 0.24)');
          drawHazardGroundApron(ctx, centerX, footY + 4, dustWidth, section.id, apronIntensity);
        }
        drawHazardBurialCoverFrame(ctx, centerX, footY, dustWidth, burial, section.id);
        ctx.restore();
        return;
      }
    }
    ctx.save();
    ctx.filter = hazardFilter;
    const hazardDrawn = drawAtlasRegion(
      ctx,
      environmentAssetsRef.current,
      hazardAssetKey,
      hazardDest,
      { mode: 'contain' },
    );
    ctx.restore();
    if (hazardDrawn) {
      if (dustWidth > 0) {
        const apronIntensity = visualHazardId === 'spike-trap'
          ? 1.08
          : visualHazardId === 'sand-pit' || visualHazardId === 'dark-gap'
            ? 1.2
            : 0.82;
        drawGroundDustLip(ctx, centerX, footY + 2, dustWidth * 0.9, visualHazardId === 'spike-trap' ? 'rgba(209, 143, 72, 0.32)' : 'rgba(209, 143, 72, 0.24)');
        drawHazardGroundApron(ctx, centerX, footY + 4, dustWidth, section.id, apronIntensity);
      }
      drawHazardBurialCoverFrame(ctx, centerX, footY, dustWidth, burial, section.id);
      ctx.restore();
      return;
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = visual.color;
    ctx.fillStyle = visual.fill;
    ctx.globalAlpha = 0.88;

    if (visualHazardId === 'dark-gap') {
      const gradient = ctx.createRadialGradient(hx + hazard.width / 2, baseY + hazard.height / 2, 6, hx + hazard.width / 2, baseY + hazard.height / 2, hazard.width / 1.5);
      gradient.addColorStop(0, '#020617');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.72)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(hx + hazard.width / 2, baseY + hazard.height / 2, hazard.width / 2, Math.max(12, hazard.height), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.fillRect(hx + 8, baseY + 3, hazard.width - 16, 2);
    } else if (visualHazardId === 'thorn-bush') {
      ctx.beginPath();
      ctx.roundRect(hx, baseY + 8, hazard.width, hazard.height - 4, 8);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = visual.accent;
      for (let i = 8; i < hazard.width; i += 12) {
        ctx.beginPath();
        ctx.moveTo(hx + i, baseY + hazard.height + 2);
        ctx.lineTo(hx + i + 6, baseY + 5);
        ctx.lineTo(hx + i + 12, baseY + hazard.height + 2);
        ctx.stroke();
      }
    } else if (visualHazardId === 'sand-pit') {
      ctx.beginPath();
      ctx.ellipse(hx + hazard.width / 2, baseY + hazard.height / 2, hazard.width / 2, hazard.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = visual.accent;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.arc(hx + 18 + i * 18, baseY + 15 + Math.sin(now / 220 + i) * 3, 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (visualHazardId === 'spike-trap') {
      ctx.fillRect(hx, baseY + 10, hazard.width, hazard.height - 8);
      ctx.strokeRect(hx, baseY + 10, hazard.width, hazard.height - 8);
      ctx.fillStyle = visual.accent;
      for (let i = 4; i < hazard.width - 4; i += 14) {
        ctx.beginPath();
        ctx.moveTo(hx + i, baseY + 10);
        ctx.lineTo(hx + i + 7, baseY - 8);
        ctx.lineTo(hx + i + 14, baseY + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (visualHazardId === 'rolling-stones' || visualHazardId === 'falling-blocks') {
      ctx.fillRect(hx, baseY + 10, hazard.width, hazard.height - 8);
      ctx.strokeRect(hx, baseY + 10, hazard.width, hazard.height - 8);
      ctx.strokeStyle = visual.accent;
      ctx.beginPath();
      ctx.moveTo(hx + 8, baseY + 18);
      ctx.lineTo(hx + hazard.width * 0.45, baseY + 8);
      ctx.lineTo(hx + hazard.width - 10, baseY + 22);
      ctx.stroke();
      ctx.fillStyle = visual.color;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(hx + 18 + i * 22, baseY + 6 + Math.sin(now / 160 + i) * 4, 5 + i, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (visualHazardId === 'bat-cloud' || visualHazardId === 'dust-wave') {
      ctx.beginPath();
      ctx.roundRect(hx, baseY, hazard.width, hazard.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = visual.accent;
      for (let i = 0; i < 7; i += 1) {
        ctx.globalAlpha = 0.42;
        ctx.beginPath();
        ctx.arc(hx + 14 + i * 15, baseY + 18 + Math.sin(now / 130 + i) * 14, 3 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.beginPath();
      ctx.moveTo(hx, baseY + hazard.height);
      ctx.lineTo(hx + hazard.width * 0.35, baseY + 8);
      ctx.lineTo(hx + hazard.width, baseY + hazard.height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = visual.accent;
      ctx.beginPath();
      ctx.moveTo(hx + 12, baseY + hazard.height - 8);
      ctx.lineTo(hx + hazard.width - 10, baseY + 12);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.82;
    if (visualHazardId !== 'bat-cloud' && visualHazardId !== 'dust-wave') {
      drawGroundDustLip(ctx, centerX, footY + 2, dustWidth * 0.82, 'rgba(185, 110, 45, 0.2)');
      drawHazardGroundApron(ctx, centerX, footY + 4, dustWidth, section.id, visualHazardId === 'sand-pit' || visualHazardId === 'dark-gap' ? 1.2 : 0.82);
      drawHazardBurialCoverFrame(ctx, centerX, footY, dustWidth, burial, section.id);
    }
    ctx.restore();
}

export function drawDiscoveryEntranceFrame(ctx, entrance, cameraX, current, now, deps) {
  const {
    CANVAS_WIDTH,
    DISCOVERY_ENTRANCE_REVEAL_SECONDS,
    GATE,
    clamp,
    drawContactShadow,
    drawFieldNoteLabel,
    drawGroundDustLip,
  } = deps;

    const screenX = entrance.x - cameraX;
    const centerX = screenX + entrance.width / 2;
    const footY = GATE.y + GATE.height;
    if (screenX > CANVAS_WIDTH + 260 || screenX + entrance.width < -260) return;

    const revealProgress = current.discoveryEntranceActive
      ? 1 - clamp((current.discoveryEntranceTimer || 0) / DISCOVERY_ENTRANCE_REVEAL_SECONDS, 0, 1)
      : 0;
    const pulse = 0.5 + Math.sin(now / 210) * 0.5;
    const glowAlpha = 0.16 + pulse * 0.08 + revealProgress * 0.2;
    const lampFlicker = 0.82 + Math.sin(now / 95) * 0.1;

    ctx.save();
    drawContactShadow(ctx, centerX, footY + 4, entrance.width * 0.9, 0.34, 1.2);

    const aura = ctx.createRadialGradient(centerX, entrance.y + 82, 18, centerX, entrance.y + 82, entrance.width * 0.84);
    aura.addColorStop(0, `rgba(250, 204, 21, ${glowAlpha})`);
    aura.addColorStop(0.48, `rgba(187, 247, 208, ${0.12 + revealProgress * 0.12})`);
    aura.addColorStop(1, 'rgba(6, 78, 59, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(centerX, entrance.y + 82, entrance.width * 0.72, entrance.height * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.beginPath();
    ctx.ellipse(centerX + 12, footY + 13, entrance.width * 0.56, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    const leftPillarX = screenX + 18;
    const rightPillarX = screenX + entrance.width - 46;
    const pillarGradient = ctx.createLinearGradient(screenX, entrance.y, screenX + entrance.width, entrance.y);
    pillarGradient.addColorStop(0, '#1f3f2e');
    pillarGradient.addColorStop(0.45, entrance.stoneColor);
    pillarGradient.addColorStop(1, '#163425');
    ctx.fillStyle = pillarGradient;
    ctx.strokeStyle = 'rgba(187, 247, 208, 0.34)';
    ctx.lineWidth = 2;
    [leftPillarX, rightPillarX].forEach((pillarX) => {
      ctx.beginPath();
      ctx.roundRect(pillarX, entrance.y + 30, 28, entrance.height - 26, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.18)';
      ctx.fillRect(pillarX + 6, entrance.y + 52, 16, entrance.height - 84);
      ctx.fillStyle = pillarGradient;
    });

    ctx.beginPath();
    ctx.moveTo(screenX + 18, entrance.y + 56);
    ctx.quadraticCurveTo(centerX, entrance.y - 8, screenX + entrance.width - 18, entrance.y + 56);
    ctx.lineTo(screenX + entrance.width - 6, entrance.y + 86);
    ctx.quadraticCurveTo(centerX, entrance.y + 22, screenX + 6, entrance.y + 86);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const doorGradient = ctx.createLinearGradient(centerX, entrance.y + 40, centerX, footY);
    doorGradient.addColorStop(0, 'rgba(6, 78, 59, 0.9)');
    doorGradient.addColorStop(0.58, '#10291f');
    doorGradient.addColorStop(1, '#07150f');
    ctx.fillStyle = doorGradient;
    ctx.beginPath();
    ctx.roundRect(centerX - 31, entrance.y + 54, 62, entrance.height - 42, 24);
    ctx.fill();
    ctx.strokeStyle = `rgba(250, 204, 21, ${0.38 + revealProgress * 0.24})`;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = `rgba(250, 204, 21, ${0.38 + revealProgress * 0.28})`;
    ctx.beginPath();
    ctx.arc(centerX, entrance.y + 104, 12 + revealProgress * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 247, 237, 0.52)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (let index = 0; index < 5; index += 1) {
      const stairY = footY - 2 + index * 8;
      const stairWidth = entrance.width * (0.52 + index * 0.08);
      ctx.fillStyle = `rgba(49, 84, 61, ${0.86 - index * 0.06})`;
      ctx.fillRect(centerX - stairWidth / 2, stairY, stairWidth, 5);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.08)';
      ctx.fillRect(centerX - stairWidth / 2, stairY, stairWidth, 1);
    }

    [-1, 1].forEach((side) => {
      const torchX = centerX + side * 54;
      ctx.fillStyle = '#5c4033';
      ctx.fillRect(torchX - 3, entrance.y + 82, 6, 28);
      ctx.fillStyle = `rgba(250, 204, 21, ${0.74 * lampFlicker})`;
      ctx.beginPath();
      ctx.ellipse(torchX, entrance.y + 76, 7 + revealProgress * 2, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 247, 237, ${0.38 * lampFlicker})`;
      ctx.beginPath();
      ctx.ellipse(torchX, entrance.y + 78, 3, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = 'rgba(187, 247, 208, 0.28)';
    ctx.lineWidth = 1;
    for (let index = 0; index < 6; index += 1) {
      const crackX = screenX + 34 + index * 18;
      ctx.beginPath();
      ctx.moveTo(crackX, entrance.y + 46 + (index % 2) * 12);
      ctx.lineTo(crackX + 7, entrance.y + 72 + (index % 3) * 8);
      ctx.lineTo(crackX + 3, entrance.y + 102 + (index % 2) * 10);
      ctx.stroke();
    }

    drawGroundDustLip(ctx, centerX, footY + 3, entrance.width * 0.78, 'rgba(250, 204, 21, 0.2)');
    if (Math.abs((current.player.x + current.player.width / 2) - (entrance.x + entrance.width / 2)) < 240) {
      drawFieldNoteLabel(ctx, centerX, entrance.y - 16, entrance.title, entrance.glowColor);
    }
    ctx.restore();
}

export function drawPremiumEgyptianChamberDoorFrame(ctx, door, cameraX, current, now, deps) {
  const {
    CANVAS_WIDTH,
    JOURNEY_SCENE_IDS,
    drawContactShadow,
    drawFieldNoteLabel,
    drawGroundDustLip,
    getJourneySceneId,
    shouldRenderChamberDoorVisual,
    worldToScreenX,
  } = deps;

    if (!door?.trigger || getJourneySceneId(current) !== JOURNEY_SCENE_IDS.EXTERIOR) return;
    if (!shouldRenderChamberDoorVisual(door)) return;
    const centerWorldX = (door.trigger.minX + door.trigger.maxX) / 2;
    const centerX = worldToScreenX(centerWorldX, cameraX);
    const width = door.width || 148;
    const height = door.height || 210;
    const baseY = door.trigger.footY + (door.yOffset || 0);
    const top = baseY - height;
    if (centerX + width < -80 || centerX - width > CANVAS_WIDTH + 80) return;

    const playerCenterX = current.player.x + current.player.width / 2;
    const playerFootY = current.player.y + current.player.height;
    const playerNear = Math.abs(playerCenterX - centerWorldX) < width * 0.72
      && Math.abs(playerFootY - door.trigger.footY) <= Math.max(door.trigger.footTolerance * 2.2, 58);
    const pulse = 0.72 + Math.sin(now / 360) * 0.18;
    const glowColor = door.glow || '#facc15';
    const accent = door.accent || '#facc15';

    ctx.save();
    drawContactShadow(ctx, centerX, baseY + 7, width * 0.86, 0.22, 1.25);

    const aura = ctx.createRadialGradient(centerX, top + height * 0.48, 12, centerX, top + height * 0.48, width * 0.9);
    aura.addColorStop(0, `rgba(250, 204, 21, ${0.1 + pulse * 0.06})`);
    aura.addColorStop(0.4, `rgba(94, 234, 212, ${playerNear ? 0.12 : 0.06})`);
    aura.addColorStop(1, 'rgba(94, 234, 212, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(centerX, top + height * 0.48, width * 0.7, height * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    const frameGradient = ctx.createLinearGradient(centerX - width / 2, top, centerX + width / 2, baseY);
    frameGradient.addColorStop(0, '#d7bd83');
    frameGradient.addColorStop(0.28, '#8f6c42');
    frameGradient.addColorStop(0.72, '#5c3d23');
    frameGradient.addColorStop(1, '#2d1b10');
    ctx.fillStyle = frameGradient;
    ctx.strokeStyle = 'rgba(38, 24, 13, 0.86)';
    ctx.lineWidth = 3;

    // Carved stone doorway frame.
    ctx.beginPath();
    ctx.roundRect(centerX - width * 0.5, top + height * 0.12, width, height * 0.86, 12);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(centerX - width * 0.34, top + height * 0.28, width * 0.68, height * 0.68, 30);
    ctx.fillStyle = 'rgba(17, 24, 39, 0.5)';
    ctx.fill();

    // Sealed slab, kept visual-only so transition triggers remain unchanged.
    const slabWidth = width * (door.slabInset || 0.5);
    const slabHeight = height * 0.58;
    const slabX = centerX - slabWidth / 2;
    const slabY = top + height * 0.34;
    const slabGradient = ctx.createLinearGradient(slabX, slabY, slabX + slabWidth, slabY + slabHeight);
    slabGradient.addColorStop(0, '#c7a66e');
    slabGradient.addColorStop(0.55, '#7c5832');
    slabGradient.addColorStop(1, '#3d2515');
    ctx.fillStyle = slabGradient;
    ctx.strokeStyle = 'rgba(246, 202, 108, 0.5)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(slabX, slabY, slabWidth, slabHeight, 10);
    ctx.fill();
    ctx.stroke();

    // Hieroglyphs are simple carved marks on the frame, not new assets.
    ctx.strokeStyle = 'rgba(36, 21, 12, 0.58)';
    ctx.lineWidth = 1.4;
    [-1, 1].forEach((side) => {
      const glyphX = centerX + side * width * 0.36;
      for (let i = 0; i < 5; i += 1) {
        const glyphY = top + height * (0.26 + i * 0.11);
        ctx.beginPath();
        if (i % 3 === 0) {
          ctx.moveTo(glyphX - 5, glyphY);
          ctx.lineTo(glyphX + 5, glyphY);
          ctx.lineTo(glyphX, glyphY + 8);
        } else if (i % 3 === 1) {
          ctx.ellipse(glyphX, glyphY + 4, 5, 7, 0, 0, Math.PI * 2);
        } else {
          ctx.moveTo(glyphX, glyphY - 2);
          ctx.lineTo(glyphX, glyphY + 10);
          ctx.moveTo(glyphX - 5, glyphY + 4);
          ctx.lineTo(glyphX + 5, glyphY + 4);
        }
        ctx.stroke();
      }
    });

    // Glowing ankh or scarab seal.
    const sealX = centerX;
    const sealY = slabY + slabHeight * 0.38;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const sealGlow = ctx.createRadialGradient(sealX, sealY, 3, sealX, sealY, 42 + pulse * 14);
    sealGlow.addColorStop(0, `rgba(255, 247, 203, ${0.5 + pulse * 0.22})`);
    sealGlow.addColorStop(0.52, `rgba(250, 204, 21, ${0.18 + pulse * 0.12})`);
    sealGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = sealGlow;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 42 + pulse * 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2.6;
    if (door.seal === 'scarab') {
      ctx.beginPath();
      ctx.ellipse(sealX, sealY, 15, 20, 0, 0, Math.PI * 2);
      ctx.moveTo(sealX, sealY - 20);
      ctx.lineTo(sealX, sealY + 20);
      ctx.moveTo(sealX - 21, sealY - 6);
      ctx.lineTo(sealX + 21, sealY - 6);
      ctx.moveTo(sealX - 18, sealY + 8);
      ctx.lineTo(sealX + 18, sealY + 8);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(sealX, sealY - 15, 8, 10, 0, 0, Math.PI * 2);
      ctx.moveTo(sealX, sealY - 4);
      ctx.lineTo(sealX, sealY + 24);
      ctx.moveTo(sealX - 15, sealY + 6);
      ctx.lineTo(sealX + 15, sealY + 6);
      ctx.moveTo(sealX - 9, sealY + 24);
      ctx.lineTo(sealX + 9, sealY + 24);
      ctx.stroke();
    }
    ctx.restore();

    // Subtle gold rim light around the active passage edge.
    ctx.strokeStyle = `rgba(250, 204, 21, ${playerNear ? 0.62 : 0.34})`;
    ctx.lineWidth = playerNear ? 3 : 2;
    ctx.beginPath();
    ctx.roundRect(slabX - 7, slabY - 8, slabWidth + 14, slabHeight + 16, 13);
    ctx.stroke();

    if (door.dust !== false) {
      ctx.fillStyle = `rgba(244, 196, 113, ${0.16 + pulse * 0.06})`;
      for (let i = 0; i < 6; i += 1) {
        const drift = Math.sin(now / (520 + i * 31) + i) * 5;
        ctx.beginPath();
        ctx.arc(centerX - width * 0.34 + i * width * 0.14 + drift, baseY - 18 - (i % 3) * 8, 1.7 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawGroundDustLip(ctx, centerX, baseY + 2, width * 0.76, 'rgba(198, 130, 55, 0.24)');
    if (playerNear) {
      const promptText = door.prompt || 'E Enter';
      drawFieldNoteLabel(ctx, centerX, top - 16, promptText, accent);
    }
    ctx.restore();
}
