export function drawTempleThresholdHallInteriorFrame(ctx, current, now, deps) {
  const {
    ARRIVAL_THRESHOLD_ASSET_VERSION,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    arrivalThresholdBackgroundRef,
    isTempleThresholdHallScene,
  } = deps;
    if (!isTempleThresholdHallScene(current)) return false;
    const chamberAsset = arrivalThresholdBackgroundRef.current;
    const flicker = 0.82 + Math.sin(now / 240) * 0.08 + Math.sin(now / 91) * 0.04;

    ctx.save();
    ctx.fillStyle = 'rgba(8, 5, 4, 0.96)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (chamberAsset.loaded && chamberAsset.image) {
      ctx.globalAlpha = 0.99;
      ctx.drawImage(chamberAsset.image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      const wallGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      wallGradient.addColorStop(0, '#0b0808');
      wallGradient.addColorStop(0.52, '#211813');
      wallGradient.addColorStop(1, '#090605');
      ctx.fillStyle = wallGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = 'rgba(71, 45, 30, 0.72)';
      ctx.fillRect(CANVAS_WIDTH * 0.62, 82, CANVAS_WIDTH * 0.26, CANVAS_HEIGHT * 0.66);
    }

    ctx.fillStyle = 'rgba(5, 4, 4, 0.16)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const sealGlow = ctx.createRadialGradient(CANVAS_WIDTH * 0.78, CANVAS_HEIGHT * 0.48, 20, CANVAS_WIDTH * 0.78, CANVAS_HEIGHT * 0.48, 210);
    sealGlow.addColorStop(0, `rgba(250, 204, 21, ${0.18 * flicker})`);
    sealGlow.addColorStop(0.45, `rgba(168, 85, 247, ${0.1 * flicker})`);
    sealGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sealGlow;
    ctx.fillRect(CANVAS_WIDTH * 0.54, 80, CANVAS_WIDTH * 0.42, CANVAS_HEIGHT * 0.72);
    ctx.restore();

    if (current.templeThresholdHallCleared) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(250, 204, 21, ${0.12 * flicker})`;
      ctx.fillRect(CANVAS_WIDTH * 0.68, CANVAS_HEIGHT * 0.2, CANVAS_WIDTH * 0.22, CANVAS_HEIGHT * 0.5);
      ctx.restore();
    }

    if (current.renderStats) {
      current.renderStats.templeThresholdHallVersion = ARRIVAL_THRESHOLD_ASSET_VERSION;
      current.renderStats.templeThresholdHallLoaded = Boolean(chamberAsset.loaded && chamberAsset.image);
    }
    ctx.restore();
    return true;
}

export function drawForgottenMuralChamberInteriorFrame(ctx, current, now, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    clamp,
    forgottenMuralChamberRef,
    forgottenMuralHiddenRevealRef,
    isForgottenMuralChamberScene,
  } = deps;
    if (!isForgottenMuralChamberScene(current)) return false;
    const chamberAsset = forgottenMuralChamberRef.current;
    const flicker = 0.78 + Math.sin(now / 260) * 0.12;

    ctx.save();
    ctx.globalAlpha = 0.98;
    ctx.fillStyle = 'rgba(8, 5, 4, 0.96)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (chamberAsset.loaded && chamberAsset.image) {
      ctx.drawImage(chamberAsset.image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      const wall = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      wall.addColorStop(0, '#1c1714');
      wall.addColorStop(0.58, '#2b211a');
      wall.addColorStop(1, '#0b0706');
      ctx.fillStyle = wall;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = 'rgba(45, 31, 23, 0.72)';
      ctx.fillRect(110, 92, CANVAS_WIDTH - 220, CANVAS_HEIGHT - 170);
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.26)';
      ctx.lineWidth = 5;
      ctx.strokeRect(386, 150, 348, 190);
    }

    ctx.globalCompositeOperation = 'screen';
    const glow = ctx.createRadialGradient(CANVAS_WIDTH * 0.52, CANVAS_HEIGHT * 0.42, 18, CANVAS_WIDTH * 0.52, CANVAS_HEIGHT * 0.42, 240);
    glow.addColorStop(0, `rgba(96, 165, 250, ${0.26 * flicker})`);
    glow.addColorStop(0.42, `rgba(250, 204, 21, ${0.14 * flicker})`);
    glow.addColorStop(1, 'rgba(8, 13, 24, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalCompositeOperation = 'source-over';

    if (current.forgottenMuralChamberRestored) {
      const revealAsset = forgottenMuralHiddenRevealRef.current;
      const revealPulse = current.cinematicEvent?.id === 'forgotten-mural-relic-slide-puzzle-solved'
        ? clamp(current.cinematicTimer / 4.2, 0, 1)
        : 0;
      const muralX = 390;
      const muralY = 78;
      const muralWidth = 420;
      const muralHeight = 420;
      const muralCenterX = muralX + muralWidth / 2;
      const muralCenterY = muralY + muralHeight / 2;
      const revealedGlow = 0.74 + Math.sin(now / 260) * 0.08 + revealPulse * 0.38;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const revealBacklight = ctx.createRadialGradient(muralCenterX, muralCenterY, 30, muralCenterX, muralCenterY, 350);
      revealBacklight.addColorStop(0, `rgba(250, 204, 21, ${0.3 * revealedGlow})`);
      revealBacklight.addColorStop(0.34, `rgba(37, 99, 235, ${0.16 * revealedGlow})`);
      revealBacklight.addColorStop(1, 'rgba(8, 13, 24, 0)');
      ctx.fillStyle = revealBacklight;
      ctx.fillRect(muralX - 130, muralY - 120, muralWidth + 260, muralHeight + 220);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.72 + revealPulse * 0.12;
      ctx.fillStyle = 'rgba(15, 10, 7, 0.72)';
      ctx.shadowColor = 'rgba(250, 204, 21, 0.52)';
      ctx.shadowBlur = 16 + revealPulse * 22;
      ctx.fillRect(muralX - 10, muralY - 10, muralWidth + 20, muralHeight + 20);
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.64 + revealPulse * 0.18})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(muralX - 10, muralY - 10, muralWidth + 20, muralHeight + 20);
      ctx.restore();

      if (revealAsset.loaded && revealAsset.image) {
        ctx.save();
        ctx.globalAlpha = 0.9 + revealPulse * 0.08;
        ctx.shadowColor = 'rgba(250, 204, 21, 0.5)';
        ctx.shadowBlur = 16 + revealPulse * 26;
        ctx.filter = `sepia(3%) saturate(108%) brightness(${100 + revealPulse * 6}%) contrast(106%)`;
        ctx.drawImage(revealAsset.image, muralX, muralY, muralWidth, muralHeight);
        ctx.filter = 'none';
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = 'rgba(250, 204, 21, 0.38)';
        ctx.fillRect(muralX, muralY, muralWidth, muralHeight);
        ctx.restore();
      }
    }

    ctx.globalAlpha = 0.36;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
    for (let i = 0; i < 14; i += 1) {
      const dustX = 180 + i * 68 + Math.sin(now / 720 + i) * 10;
      const dustY = 60 + ((now / 36 + i * 37) % 370);
      ctx.beginPath();
      ctx.ellipse(dustX, dustY, 1.6 + (i % 3), 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return true;
}

export function drawMummificationChamberInteriorFrame(ctx, current, now, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GROUND_Y,
    JOURNEY_INTERACT_OBJECT_STATES,
    MUMMIFICATION_CHAMBER_ATMOSPHERE_VERSION,
    MUMMIFICATION_CHAMBER_EXIT_TRIGGER,
    MUMMIFICATION_CHAMBER_INTERACTIONS_ASSET_VERSION,
    MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS,
    MUMMIFICATION_CHAMBER_INTERIOR_VERSION,
    MUMMIFICATION_CHAMBER_READABILITY,
    MUMMIFICATION_CHAMBER_RITUAL_GUIDANCE_VERSION,
    MUMMIFICATION_CHAMBER_RITUAL_SEQUENCE,
    MUMMIFICATION_CHAMBER_RITUAL_STEPS,
    MUMMIFICATION_CHAMBER_RITE_OBJECTS,
    MUMMIFICATION_JAR_SYMBOLS,
    MUMMIFICATION_ROOM_INTERACT_VERSION,
    clamp,
    drawAtlasRegion,
    drawFieldNoteLabel,
    getMummificationChamberAtmosphere,
    getMummificationRiteByIndex,
    isMummificationChamberScene,
    mummificationChamberInteriorRef,
    mummificationInteractionAssetsRef,
    worldToScreenX,
  } = deps;
    if (!isMummificationChamberScene(current)) return false;
    const chamberAsset = mummificationChamberInteriorRef.current;
    const atmosphere = getMummificationChamberAtmosphere(current);
    const flickerBase = 0.82 + Math.sin(now / 190) * 0.1 + Math.sin(now / 83) * 0.05;
    const flicker = clamp(flickerBase * atmosphere.candleFlickerBoost, 0.62, 1.2);
    const unlocked = Boolean(current.mummificationChamberExitUnlocked);

    ctx.save();
    ctx.fillStyle = 'rgba(8, 5, 4, 0.96)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (chamberAsset.loaded && chamberAsset.image) {
      ctx.globalAlpha = 0.98;
      ctx.drawImage(chamberAsset.image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      const wallGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      wallGradient.addColorStop(0, '#120b07');
      wallGradient.addColorStop(0.42, '#2c1b10');
      wallGradient.addColorStop(0.78, '#3b2614');
      wallGradient.addColorStop(1, '#090604');
      ctx.fillStyle = wallGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.globalAlpha = 0.32;
      ctx.strokeStyle = 'rgba(179, 128, 56, 0.5)';
      ctx.lineWidth = 1.4;
      for (let y = 74; y < CANVAS_HEIGHT - 70; y += 54) {
        ctx.beginPath();
        ctx.moveTo(70, y + Math.sin(now / 2200 + y) * 2);
        ctx.lineTo(CANVAS_WIDTH - 70, y + Math.cos(now / 2300 + y) * 2);
        ctx.stroke();
      }
      for (let x = 118; x < CANVAS_WIDTH - 90; x += 94) {
        ctx.beginPath();
        ctx.moveTo(x + Math.sin(now / 2600 + x) * 3, 42);
        ctx.lineTo(x + 34, CANVAS_HEIGHT - 68);
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(7, 4, 3, ${atmosphere.roomDimAlpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.globalCompositeOperation = 'screen';
    const roomLight = ctx.createRadialGradient(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.42, 20, CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.42, CANVAS_WIDTH * 0.58);
    roomLight.addColorStop(0, `rgba(255, 235, 179, ${atmosphere.roomLightAlpha * flicker})`);
    roomLight.addColorStop(0.36, `rgba(250, 204, 21, ${atmosphere.roomLightAlpha * 0.52})`);
    roomLight.addColorStop(1, 'rgba(69, 26, 3, 0)');
    ctx.fillStyle = roomLight;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const glyphAlpha = atmosphere.glyphGlowAlpha * flicker;
    [
      { x: 164, y: 72, width: 720, height: 72 },
      { x: 142, y: 158, width: 760, height: 48 },
      { x: 72, y: 236, width: 180, height: 184 },
      { x: 946, y: 198, width: 118, height: 236 },
    ].forEach((zone, index) => {
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.shadowColor = index % 2 === 0 ? 'rgba(250, 204, 21, 0.9)' : 'rgba(94, 234, 212, 0.62)';
      ctx.shadowBlur = 20 + atmosphere.wakeProgress * 18;
      ctx.fillStyle = index % 2 === 0
        ? `rgba(250, 204, 21, ${glyphAlpha * 0.32})`
        : `rgba(45, 212, 191, ${glyphAlpha * 0.2})`;
      ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
      ctx.restore();
    });

    const tableZone = MUMMIFICATION_CHAMBER_READABILITY.mummificationChamberPuzzleCenterpiece;
    const tableGlow = ctx.createRadialGradient(tableZone.x, tableZone.y, 20, tableZone.x, tableZone.y, tableZone.radiusX);
    tableGlow.addColorStop(0, `rgba(250, 204, 21, ${(0.16 + atmosphere.wakeProgress * 0.18) * flicker})`);
    tableGlow.addColorStop(0.5, `rgba(245, 158, 11, ${(0.08 + atmosphere.wakeProgress * 0.1) * flicker})`);
    tableGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = tableGlow;
    ctx.fillRect(tableZone.x - tableZone.radiusX, tableZone.y - tableZone.radiusY * 2, tableZone.radiusX * 2, tableZone.radiusY * 4);
    ctx.globalCompositeOperation = 'source-over';

    const candleGlow = (x, y, radius = 86) => {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const glow = ctx.createRadialGradient(x, y, 2, x, y, radius);
      glow.addColorStop(0, `rgba(255, 240, 180, ${(0.2 + atmosphere.wakeProgress * 0.26) * flicker})`);
      glow.addColorStop(0.35, `rgba(245, 158, 11, ${(0.1 + atmosphere.wakeProgress * 0.18) * flicker})`);
      glow.addColorStop(1, 'rgba(88, 28, 5, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      ctx.restore();
    };

    candleGlow(120, 255, 96);
    candleGlow(232, 336, 72);
    candleGlow(CANVAS_WIDTH - 128, 256, 102);
    candleGlow(CANVAS_WIDTH - 242, 332, 72);

    const torch = (x, y, direction = 1) => {
      ctx.save();
      const flame = ctx.createRadialGradient(x, y - 12, 2, x, y - 12, 112);
      flame.addColorStop(0, `rgba(255, 230, 151, ${0.74 * flicker})`);
      flame.addColorStop(0.32, `rgba(245, 158, 11, ${0.42 * flicker})`);
      flame.addColorStop(1, 'rgba(88, 28, 5, 0)');
      ctx.fillStyle = flame;
      ctx.fillRect(x - 132, y - 130, 264, 230);
      ctx.strokeStyle = '#4a2b17';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x - direction * 10, y + 18);
      ctx.lineTo(x + direction * 28, y + 82);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = 'rgba(250, 204, 21, 0.9)';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.ellipse(x, y - 12, 12 + Math.sin(now / 120) * 2, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff7ad';
      ctx.beginPath();
      ctx.ellipse(x + direction * 2, y - 18, 5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    if (!chamberAsset.loaded || !chamberAsset.image) {
      torch(132, 164, 1);
      torch(CANVAS_WIDTH - 132, 164, -1);
    }

    const tableX = CANVAS_WIDTH * 0.5;
    const tableY = GROUND_Y - 84;
    if (!chamberAsset.loaded || !chamberAsset.image) {
      const tableGradient = ctx.createLinearGradient(tableX - 250, tableY, tableX + 250, tableY + 90);
      tableGradient.addColorStop(0, '#4f351f');
      tableGradient.addColorStop(0.48, '#a16207');
      tableGradient.addColorStop(1, '#321b0d');
      ctx.globalAlpha = 0.96;
      ctx.fillStyle = tableGradient;
      ctx.beginPath();
      ctx.roundRect(tableX - 260, tableY, 520, 88, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.42)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = 'rgba(236, 201, 126, 0.9)';
      ctx.beginPath();
      ctx.roundRect(tableX - 150, tableY - 36, 300, 48, 22);
      ctx.fill();
      ctx.strokeStyle = 'rgba(92, 49, 18, 0.52)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(91, 52, 24, 0.54)';
      ctx.fillRect(tableX - 112, tableY - 19, 224, 8);

      const jarColors = ['#b45309', '#92400e', '#854d0e', '#a16207'];
      jarColors.forEach((color, index) => {
        const jarX = tableX - 198 + index * 132;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(jarX, tableY - 8, 24, 36, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(250, 204, 21, 0.36)';
        ctx.fillRect(jarX - 15, tableY - 42, 30, 10);
      });
    }

    const exitX = worldToScreenX(MUMMIFICATION_CHAMBER_EXIT_TRIGGER.minX + 24, current.cameraX);
    ctx.fillStyle = unlocked ? 'rgba(13, 49, 38, 0.84)' : 'rgba(24, 15, 10, 0.96)';
    ctx.beginPath();
    ctx.roundRect(exitX - 32, GROUND_Y - 176, 96, 176, 12);
    ctx.fill();
    ctx.strokeStyle = unlocked ? 'rgba(94, 234, 212, 0.72)' : 'rgba(250, 204, 21, 0.48)';
    ctx.lineWidth = 4;
    ctx.stroke();
    if (!unlocked) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
      ctx.fillRect(exitX - 24, GROUND_Y - 104, 80, 12);
      ctx.fillRect(exitX + 10, GROUND_Y - 162, 12, 144);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const sealPulse = 0.78 + Math.sin(now / 260) * 0.22;
    const sealGlow = ctx.createRadialGradient(exitX + 16, GROUND_Y - 92, 10, exitX + 16, GROUND_Y - 92, unlocked ? 150 : 108);
    sealGlow.addColorStop(0, unlocked
      ? `rgba(94, 234, 212, ${atmosphere.sealGlowAlpha * sealPulse})`
      : `rgba(250, 204, 21, ${atmosphere.sealGlowAlpha * sealPulse})`);
    sealGlow.addColorStop(0.42, unlocked
      ? `rgba(45, 212, 191, ${atmosphere.sealGlowAlpha * 0.36})`
      : `rgba(245, 158, 11, ${atmosphere.sealGlowAlpha * 0.24})`);
    sealGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sealGlow;
    ctx.fillRect(exitX - 142, GROUND_Y - 244, 316, 300);
    ctx.restore();

    const interactionAssets = mummificationInteractionAssetsRef.current;
    const inspectedObjectIds = current.mummificationChamberInspectedObjectIds || new Set();
    const chamberRitualStep = current.mummificationChamberRitualStep || 0;
    const currentStepInfo = MUMMIFICATION_CHAMBER_RITUAL_STEPS[chamberRitualStep];
    if (!unlocked && currentStepInfo) {
      const activeRiteDef = getMummificationRiteByIndex(chamberRitualStep);
      const actionHint = activeRiteDef?.actionHint;
      const panelX = CANVAS_WIDTH * 0.5 - 230;
      const panelY = 70;
      const panelH = actionHint ? 98 : 76;
      ctx.save();
      ctx.fillStyle = 'rgba(22, 13, 8, 0.78)';
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.44)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, 460, panelH, 10);
      ctx.fill();
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 13px Cinzel, serif';
      ctx.fillStyle = 'rgba(250, 204, 21, 0.9)';
      ctx.fillText(`Rite ${chamberRitualStep + 1}/${MUMMIFICATION_CHAMBER_RITUAL_STEPS.length}`, CANVAS_WIDTH * 0.5, panelY + 22);
      ctx.font = '800 15px Outfit, sans-serif';
      ctx.fillStyle = 'rgba(255, 247, 237, 0.9)';
      ctx.fillText(currentStepInfo.guideLabel, CANVAS_WIDTH * 0.5, panelY + 48);
      if (actionHint) {
        ctx.font = '600 12px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(94, 234, 212, 0.86)';
        ctx.fillText(actionHint, CANVAS_WIDTH * 0.5, panelY + 76);
      }
      ctx.restore();
    }
    MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS.forEach((item) => {
      // activated = ritual step completed for this item (drives glow/alpha); inspected = same (kept for label logic)
      const ritualIdx = MUMMIFICATION_CHAMBER_RITUAL_SEQUENCE.indexOf(item.id);
      const activated = item.exitSeal ? unlocked : (ritualIdx >= 0 && ritualIdx < chamberRitualStep);
      const isCurrentRitualStep = !unlocked && currentStepInfo?.id === item.id;
      const inspected = activated || inspectedObjectIds.has(item.id);
      const dest = {
        x: item.screen.x - item.screen.width / 2,
        y: item.screen.y - item.screen.height / 2,
        width: item.screen.width,
        height: item.screen.height,
      };
      if (item.assetKey === 'linenWrappings') {
        dest.x += Math.sin(now / 540) * atmosphere.linenMotion * 5;
        dest.y += Math.sin(now / 360) * atmosphere.linenMotion * 9;
      }
      ctx.save();
      ctx.globalAlpha = item.exitSeal
        ? (unlocked ? 0.94 : 0.74)
        : item.assetKey === 'linenWrappings'
          ? (inspected ? 0.62 : 0.82) + atmosphere.wakeProgress * 0.1
          : isCurrentRitualStep ? 0.96 : (inspected ? 0.62 : 0.86);
      ctx.filter = item.exitSeal
        ? `drop-shadow(0 0 ${unlocked ? 22 : 10 + atmosphere.wakeProgress * 8}px ${unlocked ? 'rgba(94, 234, 212, 0.72)' : 'rgba(250, 204, 21, 0.62)'})`
        : item.assetKey === 'linenWrappings'
          ? `drop-shadow(0 0 ${8 + atmosphere.wakeProgress * 14}px rgba(255, 244, 214, 0.38))`
          : isCurrentRitualStep
            ? 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.32))'
            : 'drop-shadow(0 8px 10px rgba(18, 10, 6, 0.42))';
      const drewAsset = drawAtlasRegion(ctx, interactionAssets, item.assetKey, dest, { mode: 'contain' });
      ctx.restore();

      if (!drewAsset) {
        ctx.save();
        ctx.globalAlpha = inspected ? 0.54 : 0.82;
        ctx.fillStyle = item.exitSeal ? 'rgba(250, 204, 21, 0.32)' : 'rgba(146, 64, 14, 0.44)';
        ctx.strokeStyle = item.exitSeal ? 'rgba(250, 204, 21, 0.72)' : 'rgba(253, 230, 138, 0.58)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(dest.x, dest.y, dest.width, dest.height, item.exitSeal ? 40 : 10);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      if (isCurrentRitualStep) {
        drawFieldNoteLabel(ctx, item.screen.x, dest.y - 8, `Next: ${currentStepInfo.shortLabel}`, '#5eead4');
      } else if (!inspected || (item.exitSeal && unlocked)) {
        const markerColor = item.exitSeal && unlocked ? '#5eead4' : '#facc15';
        drawFieldNoteLabel(ctx, item.screen.x, dest.y - 8, item.exitSeal && unlocked ? 'Exit open' : 'Inspect', markerColor);
      }
    });

    if (!chamberAsset.loaded || !chamberAsset.image) {
      const glyphPanelX = CANVAS_WIDTH * 0.5 - 230;
      const glyphPanelY = 74;
      ctx.fillStyle = 'rgba(22, 13, 8, 0.74)';
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.38 + flicker * 0.16})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(glyphPanelX, glyphPanelY, 460, 190, 12);
      ctx.fill();
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 18px Cinzel, serif';
      ctx.fillStyle = `rgba(255, 231, 143, ${0.88 * flicker})`;
      ctx.fillText('PREPARATION RITES', CANVAS_WIDTH * 0.5, glyphPanelY + 42);
      ctx.font = '700 13px Outfit, sans-serif';
      ctx.fillStyle = 'rgba(255, 247, 237, 0.74)';
      ctx.fillText('The jars, wrappings, and sealed door wait for the puzzle.', CANVAS_WIDTH * 0.5, glyphPanelY + 92);
      ctx.fillStyle = `rgba(250, 204, 21, ${0.44 * flicker})`;
      ['ANKH', 'JAR', 'LINEN', 'DOOR'].forEach((label, index) => {
        ctx.fillText(label, glyphPanelX + 85 + index * 96, glyphPanelY + 144);
      });
    }

    if (!unlocked) {
      drawFieldNoteLabel(ctx, exitX + 38, GROUND_Y - 192, 'Entrance sealed', '#facc15');
    }

    // --- Journey Room Interact: rite sub-objects, carried item, hold ring, prompt ---
    const interaction = current.mummificationChamberInteraction;
    if (interaction) {
      const carriedId = interaction.carriedItemId;
      const objStates = interaction.objectStates || {};
      const wrongFlash = interaction.wrongFlash || {};
      const activeRite = getMummificationRiteByIndex(chamberRitualStep);
      const flashPulse = 0.5 + Math.sin(now / 70) * 0.5;

      // The chamber "stirs" — a brief ember-coloured flush over the room when a
      // careless action disturbs it (reuses the atmosphere disturbance value).
      if (atmosphere.disturbance > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(214, 84, 32, ${atmosphere.disturbance * 0.18})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
      }

      MUMMIFICATION_CHAMBER_RITE_OBJECTS.forEach((object) => {
        const state = objStates[object.id] || JOURNEY_INTERACT_OBJECT_STATES.IDLE;
        const isActiveRite = activeRite && object.rite === activeRite.rite;
        const completed = state === JOURNEY_INTERACT_OBJECT_STATES.COMPLETED
          || state === JOURNEY_INTERACT_OBJECT_STATES.USED;
        // Future-rite objects aren't placed in the room yet; completed ones stay settled.
        if (!isActiveRite && !completed) return;
        if (carriedId === object.id) return; // carried items render on the player
        const sx = object.screen.x;
        const sy = object.screen.y;
        const w = object.screen.width;
        const h = object.screen.height;
        const sym = object.symbol ? MUMMIFICATION_JAR_SYMBOLS[object.symbol] : null;
        const mark = sym?.glyph || object.fragMark || null;
        const oilColor = object.oilTone === 'sacred' ? '#7fd6c0'
          : object.oilTone === 'bitter' ? '#6f5f33'
            : object.oilTone === 'thin' ? '#b9a06a' : null;
        const baseColor = sym?.color || oilColor || (object.id === 'linen-roll' ? '#e8ddc4' : '#caa86a');
        const isSlot = object.role === 'target' || object.role === 'restore';
        const flashStroke = wrongFlash[object.id]
          ? `rgba(248, 113, 113, ${0.4 + flashPulse * 0.5})`
          : null;
        ctx.save();
        // Subtle presence glow only — no "this is the correct one" highlight, so
        // matching the jar/fragment to its mark stays genuine inference.
        if (isActiveRite && !completed) {
          ctx.shadowColor = isSlot ? 'rgba(214, 176, 106, 0.38)' : 'rgba(250, 204, 21, 0.46)';
          ctx.shadowBlur = 8;
        }
        if (isSlot) {
          ctx.fillStyle = completed ? 'rgba(34, 28, 18, 0.95)' : 'rgba(54, 41, 24, 0.9)';
          ctx.strokeStyle = flashStroke || (completed ? 'rgba(94, 234, 212, 0.8)' : 'rgba(214, 176, 106, 0.5)');
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(sx - w / 2, sy - h / 2, w, h, 6);
          ctx.fill();
          ctx.stroke();
          if (mark) {
            ctx.fillStyle = completed ? 'rgba(94, 234, 212, 0.92)' : baseColor;
            ctx.font = '900 18px Cinzel, serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(mark, sx, sy - 2);
          }
          if (completed) {
            ctx.fillStyle = baseColor;
            ctx.beginPath();
            ctx.ellipse(sx, sy - h / 2 - 12, 13, 20, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (object.role === 'source') {
          ctx.globalAlpha = completed ? 0.35 : 1;
          ctx.fillStyle = baseColor;
          ctx.beginPath();
          ctx.ellipse(sx, sy, w / 2, h / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = flashStroke || 'rgba(20, 12, 6, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
          if (mark) {
            ctx.fillStyle = 'rgba(20, 12, 6, 0.82)';
            ctx.font = '900 14px Cinzel, serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(mark, sx, sy);
          }
        } else {
          // inspect / activate / apply / wrap markers
          ctx.strokeStyle = flashStroke
            || (completed ? 'rgba(94, 234, 212, 0.5)' : 'rgba(250, 204, 21, 0.42)');
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(w, h) / 2, 0, Math.PI * 2);
          ctx.stroke();
          if (object.role === 'activate') {
            ctx.fillStyle = completed ? 'rgba(94, 234, 212, 0.5)' : 'rgba(120, 170, 210, 0.55)';
            ctx.beginPath();
            ctx.ellipse(sx, sy + 5, w / 2 - 4, h / 3, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      });

      // Hold progress ring over the active apply/wrap target.
      if (interaction.holdItemId && interaction.holdProgress > 0 && interaction.holdDuration > 0) {
        const holdObj = MUMMIFICATION_CHAMBER_RITE_OBJECTS.find(o => o.id === interaction.holdItemId);
        if (holdObj) {
          const ratio = clamp(interaction.holdProgress / interaction.holdDuration, 0, 1);
          const cx = holdObj.screen.x;
          const cy = holdObj.screen.y - 36;
          const pulse = 0.85 + Math.sin(now / 90) * 0.15;
          ctx.save();
          ctx.lineWidth = 6;
          ctx.strokeStyle = 'rgba(18, 12, 8, 0.65)';
          ctx.beginPath();
          ctx.arc(cx, cy, 26, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowColor = 'rgba(94, 234, 212, 0.7)';
          ctx.shadowBlur = 12 * pulse;
          ctx.strokeStyle = `rgba(94, 234, 212, ${0.85 + ratio * 0.15})`;
          ctx.beginPath();
          ctx.arc(cx, cy, 26, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(224, 252, 247, 0.95)';
          ctx.font = '800 12px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(holdObj.holdKey === 'wrap' ? 'Wrapping…' : 'Applying…', cx, cy - 40);
          ctx.restore();
        }
      }

      // Carried item floating above Asha.
      if (carriedId) {
        const carriedObj = MUMMIFICATION_CHAMBER_RITE_OBJECTS.find(o => o.id === carriedId);
        const pcx = worldToScreenX(current.player.x + current.player.width / 2, current.cameraX);
        const pcy = current.player.y - 24;
        const sym = carriedObj?.symbol ? MUMMIFICATION_JAR_SYMBOLS[carriedObj.symbol] : null;
        const carriedMark = sym?.glyph || carriedObj?.fragMark || null;
        const carriedOilColor = carriedObj?.oilTone === 'sacred' ? '#7fd6c0'
          : carriedObj?.oilTone === 'bitter' ? '#6f5f33'
            : carriedObj?.oilTone === 'thin' ? '#b9a06a' : null;
        ctx.save();
        ctx.shadowColor = 'rgba(94, 234, 212, 0.7)';
        ctx.shadowBlur = 14;
        ctx.fillStyle = sym?.color || carriedOilColor || (carriedId === 'linen-roll' ? '#e8ddc4' : '#d8c08a');
        ctx.beginPath();
        ctx.ellipse(pcx, pcy, 13, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (carriedMark) {
          ctx.fillStyle = 'rgba(20, 12, 6, 0.85)';
          ctx.font = '900 13px Cinzel, serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(carriedMark, pcx, pcy);
        }
        ctx.font = '800 11px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(255, 247, 237, 0.92)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Carrying: ${carriedObj?.label || 'item'}`, pcx, pcy - 28);
        ctx.restore();
      }

      // Interact prompt pill near the active object — only when close enough to act.
      if (interaction.activePrompt && interaction.activePromptId) {
        const promptObj = MUMMIFICATION_CHAMBER_RITE_OBJECTS.find(o => o.id === interaction.activePromptId)
          || MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS.find(o => o.id === interaction.activePromptId);
        if (promptObj) {
          const label = interaction.activePrompt;
          const px = promptObj.screen.x;
          const ph = promptObj.screen.height || 60;
          const py = promptObj.screen.y - ph / 2 - 30;
          ctx.save();
          ctx.font = '800 13px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const pw = ctx.measureText(label).width + 24;
          ctx.fillStyle = 'rgba(15, 23, 24, 0.86)';
          ctx.strokeStyle = 'rgba(94, 234, 212, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(px - pw / 2, py - 13, pw, 26, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'rgba(224, 252, 247, 0.96)';
          ctx.fillText(label, px, py);
          ctx.restore();
        }
      }
    }

    const particleCount = atmosphere.particleCount;
    ctx.globalAlpha = 0.16 + atmosphere.wakeProgress * 0.26;
    ctx.fillStyle = unlocked ? 'rgba(94, 234, 212, 0.34)' : 'rgba(245, 158, 11, 0.25)';
    for (let i = 0; i < particleCount; i += 1) {
      const driftSpeed = 60 - atmosphere.wakeProgress * 24;
      const dustX = 112 + i * 38 + Math.sin(now / 620 + i) * (7 + atmosphere.wakeProgress * 9);
      const dustY = 50 + ((now / driftSpeed + i * 31) % 420);
      ctx.beginPath();
      ctx.ellipse(dustX, dustY, 1.1 + (i % 3) + atmosphere.wakeProgress * 0.8, 3 + atmosphere.wakeProgress * 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (current.renderStats) {
      current.renderStats.mummificationChamberInteriorVersion = MUMMIFICATION_CHAMBER_INTERIOR_VERSION;
      current.renderStats.mummificationChamberInteriorLoaded = Boolean(chamberAsset.loaded && chamberAsset.image);
      current.renderStats.mummificationChamberInteractionAssetVersion = MUMMIFICATION_CHAMBER_INTERACTIONS_ASSET_VERSION;
      current.renderStats.mummificationChamberInteractionAssetsLoaded = Boolean(interactionAssets.loaded && interactionAssets.image);
      current.renderStats.mummificationChamberRitualGuidanceVersion = MUMMIFICATION_CHAMBER_RITUAL_GUIDANCE_VERSION;
      current.renderStats.mummificationChamberCurrentRite = currentStepInfo?.rite || null;
      current.renderStats.mummificationChamberNextObjectId = currentStepInfo?.id || null;
      current.renderStats.mummificationChamberAtmosphereVersion = MUMMIFICATION_CHAMBER_ATMOSPHERE_VERSION;
      current.renderStats.mummificationChamberAtmosphereState = atmosphere.state;
      current.renderStats.mummificationChamberWakeProgress = Number(atmosphere.wakeProgress.toFixed(2));
      current.renderStats.mummificationChamberParticleCount = particleCount;
      current.renderStats.mummificationChamberGlyphGlowAlpha = Number(atmosphere.glyphGlowAlpha.toFixed(2));
      current.renderStats.visibleMummificationChamberInteractionObjects = MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS.map(item => item.id);
      current.renderStats.mummificationChamberInspectedObjects = Array.from(inspectedObjectIds);
      current.renderStats.mummificationChamberInteractVersion = MUMMIFICATION_ROOM_INTERACT_VERSION;
      current.renderStats.mummificationChamberCarriedItemId = current.mummificationChamberInteraction?.carriedItemId || null;
      current.renderStats.mummificationChamberActivePrompt = current.mummificationChamberInteraction?.activePrompt || null;
      current.renderStats.mummificationChamberHoldProgress = Number((current.mummificationChamberInteraction?.holdProgress || 0).toFixed(2));
      current.renderStats.mummificationChamberDisturbance = Number((atmosphere.disturbance || 0).toFixed(2));
      current.renderStats.mummificationChamberWrongCount = current.mummificationChamberWrongCount || 0;
    }
    ctx.restore();
    return true;
}

export function drawScribeLockedChamberInteriorFrame(ctx, current, now, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GROUND_Y,
    SCRIBE_CHAMBER_EXIT_TRIGGER,
    SCRIBE_CHAMBER_INTERIOR_VERSION,
    SCRIBE_CHAMBER_TABLET_REGION,
    drawFieldNoteLabel,
    isScribeLockedChamberScene,
    scribeChamberInteriorRef,
    worldToScreenX,
  } = deps;
    if (!isScribeLockedChamberScene(current)) return false;
    const chamberAsset = scribeChamberInteriorRef.current;
    const hasInteriorAsset = Boolean(chamberAsset.loaded && chamberAsset.image);
    const flicker = 0.82 + Math.sin(now / 220) * 0.1 + Math.sin(now / 91) * 0.04;
    const unlocked = Boolean(current.scribeChamberExitUnlocked);

    ctx.save();
    ctx.fillStyle = 'rgba(8, 5, 4, 0.96)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (hasInteriorAsset) {
      ctx.globalAlpha = 0.98;
      ctx.drawImage(chamberAsset.image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = 1;
      ctx.fillStyle = unlocked ? 'rgba(7, 4, 3, 0.1)' : 'rgba(7, 4, 3, 0.18)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const scribeRoomLight = ctx.createRadialGradient(CANVAS_WIDTH * 0.52, CANVAS_HEIGHT * 0.42, 30, CANVAS_WIDTH * 0.52, CANVAS_HEIGHT * 0.42, CANVAS_WIDTH * 0.56);
      scribeRoomLight.addColorStop(0, `rgba(255, 225, 154, ${0.14 * flicker})`);
      scribeRoomLight.addColorStop(0.44, `rgba(245, 158, 11, ${0.07 * flicker})`);
      scribeRoomLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = scribeRoomLight;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    } else {
    const wallGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    wallGradient.addColorStop(0, '#0b0806');
    wallGradient.addColorStop(0.38, '#21170f');
    wallGradient.addColorStop(0.72, '#2b1d12');
    wallGradient.addColorStop(1, '#070504');
    ctx.fillStyle = wallGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.globalAlpha = 0.34;
    ctx.strokeStyle = 'rgba(120, 87, 49, 0.5)';
    ctx.lineWidth = 1.5;
    for (let x = -40; x < CANVAS_WIDTH + 60; x += 96) {
      ctx.beginPath();
      ctx.moveTo(x + Math.sin(now / 3000 + x) * 4, 36);
      ctx.lineTo(x + 32, CANVAS_HEIGHT - 64);
      ctx.stroke();
    }
    for (let y = 80; y < CANVAS_HEIGHT - 70; y += 58) {
      ctx.beginPath();
      ctx.moveTo(60, y + Math.sin(now / 2400 + y) * 2);
      ctx.lineTo(CANVAS_WIDTH - 60, y + Math.cos(now / 2200 + y) * 2);
      ctx.stroke();
    }

    const torch = (x, y, direction = 1) => {
      ctx.save();
      const flame = ctx.createRadialGradient(x, y - 12, 2, x, y - 12, 90);
      flame.addColorStop(0, `rgba(255, 218, 117, ${0.72 * flicker})`);
      flame.addColorStop(0.32, `rgba(245, 158, 11, ${0.36 * flicker})`);
      flame.addColorStop(1, 'rgba(88, 28, 5, 0)');
      ctx.fillStyle = flame;
      ctx.fillRect(x - 110, y - 118, 220, 210);
      ctx.strokeStyle = '#4a2b17';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x - direction * 10, y + 18);
      ctx.lineTo(x + direction * 28, y + 82);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = 'rgba(250, 204, 21, 0.9)';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.ellipse(x, y - 12, 12 + Math.sin(now / 120) * 2, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff7ad';
      ctx.beginPath();
      ctx.ellipse(x + direction * 2, y - 18, 5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    torch(104, 154, 1);
    torch(CANVAS_WIDTH - 104, 154, -1);

    const wallX = 245;
    const wallY = 70;
    const wallW = 610;
    const wallH = 272;
    const wallPanel = ctx.createLinearGradient(wallX, wallY, wallX, wallY + wallH);
    wallPanel.addColorStop(0, '#201712');
    wallPanel.addColorStop(0.48, '#110d0b');
    wallPanel.addColorStop(1, '#2f2118');
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = wallPanel;
    ctx.beginPath();
    ctx.roundRect(wallX, wallY, wallW, wallH, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(180, 129, 57, 0.5)';
    ctx.lineWidth = 4;
    ctx.stroke();

    const drawMiniGlyph = (x, y, kind, damaged = false, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = damaged ? 0.58 : 0.86;
      ctx.strokeStyle = damaged ? 'rgba(217, 119, 6, 0.82)' : 'rgba(255, 231, 143, 0.95)';
      ctx.fillStyle = damaged ? 'rgba(217, 119, 6, 0.64)' : 'rgba(250, 204, 21, 0.86)';
      ctx.shadowColor = 'rgba(250, 204, 21, 0.7)';
      ctx.shadowBlur = damaged ? 5 : 13;
      ctx.lineWidth = 2.2;
      if (kind === 'sun') {
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.stroke();
        for (let ray = 0; ray < 8; ray += 1) {
          const angle = (Math.PI * 2 * ray) / 8;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 12, Math.sin(angle) * 12);
          ctx.lineTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
          ctx.stroke();
        }
      } else if (kind === 'water') {
        for (let row = -1; row <= 1; row += 1) {
          ctx.beginPath();
          ctx.moveTo(-17, row * 7);
          for (let i = -16; i <= 18; i += 8) ctx.quadraticCurveTo(i + 4, row * 7 - 5, i + 8, row * 7);
          ctx.stroke();
        }
      } else if (kind === 'ankh') {
        ctx.beginPath();
        ctx.ellipse(0, -10, 7, 10, 0, 0, Math.PI * 2);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 22);
        ctx.moveTo(-14, 8);
        ctx.lineTo(14, 8);
        ctx.stroke();
      } else if (kind === 'eye') {
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === 'feather') {
        ctx.beginPath();
        ctx.moveTo(-6, 18);
        ctx.quadraticCurveTo(5, -18, 14, -22);
        ctx.quadraticCurveTo(19, -4, -6, 18);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-4, 14);
        ctx.lineTo(12, -14);
        ctx.stroke();
      } else if (kind === 'reed') {
        ctx.beginPath();
        ctx.moveTo(0, 22);
        ctx.lineTo(0, -18);
        ctx.moveTo(0, -12);
        ctx.lineTo(12, -22);
        ctx.stroke();
      } else if (kind === 'bird') {
        ctx.beginPath();
        ctx.moveTo(-18, 8);
        ctx.quadraticCurveTo(-5, -16, 13, -4);
        ctx.quadraticCurveTo(3, 0, 17, 14);
        ctx.moveTo(-2, 10);
        ctx.lineTo(-8, 22);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(-10, -16, 20, 32, 3);
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();
      }
      if (damaged) {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(17, 12, 8, 0.88)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -17);
        ctx.lineTo(-2, 2);
        ctx.lineTo(-8, 19);
        ctx.stroke();
      }
      ctx.restore();
    };

    const miniGlyphTypes = ['sun', 'water', 'ankh', 'door', 'eye', 'feather', 'reed', 'bird'];
    for (let col = 0; col < 10; col += 1) {
      const x = wallX + 36 + col * 58;
      ctx.globalAlpha = 0.24;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 27, wallY + 18);
      ctx.lineTo(x + 27, wallY + wallH - 24);
      ctx.stroke();
      for (let row = 0; row < 6; row += 1) {
        drawMiniGlyph(x, wallY + 42 + row * 36, miniGlyphTypes[(col + row) % miniGlyphTypes.length], (col + row) % 7 === 0, 0.72);
      }
    }

    const glyphs = [
      ['sun', 'Sun', 344, 156, false],
      ['water', 'Water', 476, 156, false],
      ['ankh', 'Ankh', 608, 156, false],
      ['door', 'Door', 740, 156, false],
      ['eye', 'Eye', 392, 252, false],
      ['feather', 'Feather', 514, 252, true],
      ['reed', 'Reed', 636, 252, false],
      ['bird', 'Bird', 758, 252, true],
    ];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    glyphs.forEach(([kind, label, x, y, cracked], index) => {
      const pulse = flicker + Math.sin(now / 320 + index) * 0.08;
      ctx.save();
      ctx.globalAlpha = cracked ? 0.82 : 0.98;
      ctx.fillStyle = 'rgba(36, 25, 16, 0.92)';
      ctx.strokeStyle = cracked ? 'rgba(180, 83, 9, 0.65)' : 'rgba(250, 204, 21, 0.72)';
      ctx.lineWidth = 3;
      ctx.shadowColor = cracked ? 'rgba(245, 158, 11, 0.42)' : 'rgba(250, 204, 21, 0.74)';
      ctx.shadowBlur = cracked ? 12 : 22;
      ctx.beginPath();
      ctx.roundRect(x - 35, y - 38, 70, 76, 10);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      drawMiniGlyph(x, y - 4, kind, cracked, index < 4 ? 1.42 : 1.1);
      ctx.save();
      ctx.shadowColor = 'rgba(250, 204, 21, 0.55)';
      ctx.shadowBlur = cracked ? 4 : 10;
      ctx.font = '10px Cinzel, serif';
      ctx.fillStyle = cracked ? `rgba(217, 119, 6, ${0.66 * pulse})` : `rgba(255, 231, 143, ${0.92 * pulse})`;
      ctx.fillText(label.toUpperCase(), x, y + 32);
      ctx.restore();
    });

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const glyphGlow = ctx.createRadialGradient(552, 175, 30, 552, 175, 360);
    glyphGlow.addColorStop(0, `rgba(250, 204, 21, ${0.34 * flicker})`);
    glyphGlow.addColorStop(0.45, `rgba(245, 158, 11, ${0.16 * flicker})`);
    glyphGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glyphGlow;
    ctx.fillRect(160, 10, 790, 410);
    ctx.restore();
    }

    const pedestalX = worldToScreenX(SCRIBE_CHAMBER_TABLET_REGION.x + SCRIBE_CHAMBER_TABLET_REGION.width / 2, current.cameraX);
    const pedestalY = GROUND_Y - 70;
    ctx.fillStyle = '#4b3524';
    ctx.beginPath();
    ctx.roundRect(pedestalX - 42, pedestalY, 84, 82, 8);
    ctx.fill();
    ctx.fillStyle = '#7c5b38';
    ctx.beginPath();
    ctx.roundRect(pedestalX - 54, pedestalY - 12, 108, 22, 8);
    ctx.fill();
    ctx.fillStyle = current.scribeChamberTabletInspected ? '#fde68a' : '#d6b66b';
    ctx.shadowColor = 'rgba(250, 204, 21, 0.55)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(pedestalX - 34, pedestalY - 44, 68, 34, 5);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '10px Cinzel, serif';
    ctx.fillStyle = '#3b2614';
    ctx.fillText('SUN WATER ANKH DOOR', pedestalX, pedestalY - 27);

    const exitX = worldToScreenX(SCRIBE_CHAMBER_EXIT_TRIGGER.minX + 24, current.cameraX);
    ctx.fillStyle = unlocked ? 'rgba(13, 49, 38, 0.84)' : 'rgba(28, 18, 13, 0.94)';
    ctx.beginPath();
    ctx.roundRect(exitX - 30, GROUND_Y - 172, 92, 172, 12);
    ctx.fill();
    ctx.strokeStyle = unlocked ? 'rgba(94, 234, 212, 0.7)' : 'rgba(250, 204, 21, 0.48)';
    ctx.lineWidth = 4;
    ctx.stroke();
    if (!unlocked) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
      ctx.fillRect(exitX - 22, GROUND_Y - 100, 76, 12);
      ctx.fillRect(exitX + 10, GROUND_Y - 160, 12, 142);
    }

    ctx.globalAlpha = 0.36;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.26)';
    for (let i = 0; i < 22; i += 1) {
      const dustX = 120 + i * 42 + Math.sin(now / 760 + i) * 9;
      const dustY = 46 + ((now / 42 + i * 31) % 380);
      ctx.beginPath();
      ctx.ellipse(dustX, dustY, 1.2 + (i % 3), 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (current.scribeChamberTabletInspected) {
      drawFieldNoteLabel(ctx, pedestalX, pedestalY - 72, 'Translation tablet recorded', '#facc15');
    }
    if (current.scribeChamberWallInspected && !current.scribeChamberPuzzleSolved) {
      drawFieldNoteLabel(ctx, CANVAS_WIDTH * 0.52, 52, 'Decode the glowing wall', '#facc15');
    }
    if (current.renderStats) {
      current.renderStats.scribeChamberInteriorVersion = SCRIBE_CHAMBER_INTERIOR_VERSION;
      current.renderStats.scribeChamberInteriorLoaded = hasInteriorAsset;
    }
    ctx.restore();
    return true;
}

export function useJourneyInteriorRenderers(deps) {
  return {
    drawTempleThresholdHallInterior: (ctx, current, now) => (
      drawTempleThresholdHallInteriorFrame(ctx, current, now, deps)
    ),
    drawMummificationChamberInterior: (ctx, current, now) => (
      drawMummificationChamberInteriorFrame(ctx, current, now, deps)
    ),
    drawForgottenMuralChamberInterior: (ctx, current, now) => (
      drawForgottenMuralChamberInteriorFrame(ctx, current, now, deps)
    ),
    drawScribeLockedChamberInterior: (ctx, current, now) => (
      drawScribeLockedChamberInteriorFrame(ctx, current, now, deps)
    ),
  };
}
