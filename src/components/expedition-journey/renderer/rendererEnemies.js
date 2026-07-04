export function drawConnectedWorldAmbientLifeFrame(ctx, section, cameraX, now, deps) {
  const {
    CANVAS_WIDTH,
    GROUND_Y,
    scaleJourneyX,
    stateRef,
    worldToScreenX,
  } = deps;
  const stats = stateRef.current.renderStats;
  let details = 0;
  const time = now / 1000;
  const addDetail = () => {
    details += 1;
  };

  ctx.save();
  if (section.id !== 'catacombs') {
    ctx.strokeStyle = 'rgba(255, 247, 212, 0.32)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i += 1) {
      const x = ((i * 230 + time * 18 + cameraX * 0.05) % (CANVAS_WIDTH + 160)) - 80;
      const y = 80 + i * 18 + Math.sin(time * 0.8 + i) * 8;
      ctx.beginPath();
      ctx.moveTo(x - 8, y);
      ctx.lineTo(x, y - 4);
      ctx.lineTo(x + 8, y);
      ctx.stroke();
      addDetail();
    }
  }

  const markerXs = section.id === 'desert-entry'
    ? [520, 1260]
    : section.id === 'ruined-temple'
      ? [1605, 2890]
      : section.id === 'catacombs'
        ? [3440, 4250]
        : section.id === 'escape-sequence'
          ? [5315, 6260]
          : [6700, 7505];
  markerXs.forEach((baseWorldX, index) => {
    const worldX = scaleJourneyX(baseWorldX);
    const x = worldToScreenX(worldX, cameraX);
    if (x < -70 || x > CANVAS_WIDTH + 70) return;
    addDetail();
    const drift = Math.sin(time * 1.6 + index + baseWorldX * 0.01) * 9;
    ctx.fillStyle = section.id === 'catacombs'
      ? 'rgba(125, 211, 252, 0.13)'
      : 'rgba(244, 202, 134, 0.12)';
    ctx.beginPath();
    ctx.ellipse(x + drift, GROUND_Y - 58 - index * 10, 44, 5, -0.12, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  if (details > 0 && stats) {
    stats.connectedWorldAmbientDetails = details;
  }
  return details;
}

export function drawEgyptAmbientLifeFrame(ctx, section, cameraX, now, deps) {
  const {
    CANVAS_WIDTH,
    DRAW_JOURNEY_FLAG_MARKERS,
    EGYPT_AMBIENT_LIFE_VERSION,
    GROUND_Y,
    JOURNEY_FLAG_VISUAL_MODE,
    JOURNEY_VERTICAL_OFFSET,
    backgroundPackId,
    scaleJourneyX,
    stateRef,
    worldToScreenX,
  } = deps;
  if (backgroundPackId === 'china-river-valley') return 0;
  let activeDetails = 0;
  const stats = stateRef.current.renderStats;
  const time = now / 1000;
  const baseX = (x) => scaleJourneyX(x);
  const baseY = (y) => y + JOURNEY_VERTICAL_OFFSET;
  const drawSoftDust = (worldX, dustBaseY, width, alpha = 0.18, speed = 1) => {
    const x = worldToScreenX(worldX, cameraX);
    if (x < -width || x > CANVAS_WIDTH + width) return;
    activeDetails += 1;
    ctx.save();
    ctx.fillStyle = `rgba(244, 202, 134, ${alpha})`;
    for (let i = 0; i < 4; i += 1) {
      const drift = ((time * 22 * speed + i * 41 + worldX * 0.01) % width) - width / 2;
      const y = dustBaseY - 8 - i * 4 + Math.sin(time * 1.4 + i + worldX * 0.004) * 4;
      ctx.beginPath();
      ctx.ellipse(x + drift, y, 18 + i * 5, 3.2, -0.08, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };
  const drawFlutterPennant = (worldX, y, color = '#facc15') => {
    if (!DRAW_JOURNEY_FLAG_MARKERS) {
      if (stats) {
        stats.journeyFlagVisualMode = JOURNEY_FLAG_VISUAL_MODE;
        stats.removedRouteFlagCount += 1;
      }
      return;
    }
    const x = worldToScreenX(worldX, cameraX);
    if (x < -80 || x > CANVAS_WIDTH + 80) return;
    activeDetails += 1;
    const flutter = Math.sin(time * 5.4 + worldX * 0.02) * 5;
    ctx.save();
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.52)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 26);
    ctx.lineTo(x, y + 22);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + 2, y - 24);
    ctx.quadraticCurveTo(x + 28, y - 28 + flutter, x + 44, y - 18);
    ctx.quadraticCurveTo(x + 22, y - 14 - flutter * 0.3, x + 2, y - 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  const drawTinyRubble = (worldX, y, color = 'rgba(136, 90, 48, 0.42)') => {
    const x = worldToScreenX(worldX, cameraX);
    if (x < -80 || x > CANVAS_WIDTH + 80) return;
    activeDetails += 1;
    ctx.save();
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i += 1) {
      const fall = (time * 34 + i * 23 + worldX * 0.015) % 72;
      ctx.beginPath();
      ctx.ellipse(x + i * 15 - 30, y + fall, 3 + (i % 2), 2.2, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };
  const drawGlowPulse = (worldX, y, color, radius = 72) => {
    const x = worldToScreenX(worldX, cameraX);
    if (x < -radius || x > CANVAS_WIDTH + radius) return;
    activeDetails += 1;
    const pulse = 0.72 + Math.sin(time * 3 + worldX * 0.01) * 0.18;
    const glow = ctx.createRadialGradient(x, y, 4, x, y, radius * pulse);
    glow.addColorStop(0, color);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.save();
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  if (section.id === 'desert-entry') {
    if (stats) stats.ambientLifeMode = 'desert-clean-backdrop';
  } else if (section.id === 'ruined-temple') {
    [1605, 2145, 2890].forEach((x, index) => drawFlutterPennant(baseX(x), baseY(306), index === 2 ? '#dc2626' : '#d97706'));
    [1860, 2640].forEach(x => drawGlowPulse(baseX(x), baseY(232), 'rgba(250, 204, 21, 0.16)', 84));
    [1715, 2380, 2925].forEach(x => drawTinyRubble(baseX(x), baseY(236), 'rgba(164, 113, 61, 0.34)'));
    if (stats) stats.ambientLifeMode = 'temple-torch-and-stone-motion';
  } else if (section.id === 'catacombs') {
    [3440, 4020, 4250].forEach(x => drawGlowPulse(baseX(x), baseY(232), 'rgba(125, 211, 252, 0.18)', 92));
    [3195, 3985, 4740].forEach((x, index) => drawFlutterPennant(baseX(x), baseY(306), index === 2 ? '#dc2626' : '#38bdf8'));
    [3705, 4310].forEach(x => drawSoftDust(baseX(x), baseY(326), 100, 0.1, 0.45));
    if (stats) stats.ambientLifeMode = 'catacomb-glyph-and-torch-motion';
  } else if (section.id === 'escape-sequence') {
    [5200, 5315, 5600, 6030, 6260].forEach((x, index) => {
      if (index % 2 === 0) drawTinyRubble(baseX(x), baseY(220), 'rgba(190, 119, 62, 0.42)');
      drawSoftDust(baseX(x), GROUND_Y - 6, 150, 0.18, 1.25);
    });
    [5315, 5600, 6260].forEach(x => drawFlutterPennant(baseX(x), baseY(306), '#dc2626'));
    if (stats) stats.ambientLifeMode = 'escape-dust-and-warning-motion';
  } else if (section.id === 'dig-site-entrance') {
    [6700, 7505].forEach(x => drawGlowPulse(baseX(x), baseY(288), 'rgba(254, 240, 138, 0.2)', 120));
    [6750, 6870, 7040, 7330].forEach((x, index) => drawFlutterPennant(baseX(x), baseY(306), index === 3 ? '#dc2626' : '#22c55e'));
    [6680, 6870, 7330].forEach(x => drawSoftDust(baseX(x), GROUND_Y - 5, 130, 0.12, 0.55));
    if (stats) stats.ambientLifeMode = 'base-camp-survey-activity';
  }

  if (activeDetails > 0 && stats) {
    stats.ambientLifePassActive = true;
    stats.ambientLifeVersion = EGYPT_AMBIENT_LIFE_VERSION;
    stats.ambientLifeDetailCount = activeDetails;
  }
  return activeDetails;
}

export function drawSmallEnemySpriteFrame(ctx, enemy, screenX, now, shakeX = 0, deps) {
  const {
    drawAtlasRegion,
    drawContactShadow,
    drawGroundDustLip,
    enemySpriteAssetsRef,
    getCombatMode,
    getEnemyBodyLanguagePose,
    getEnemySpriteDrawBox,
    getEnemySpriteFamily,
    getEnemySpriteFrame,
    getEnemySpritePack,
    shouldFlipEnemySprite,
    shouldUseEnemySpritePack,
    stateRef,
  } = deps;
  const family = getEnemySpriteFamily(enemy);
  if (!family) return false;
  if (!shouldUseEnemySpritePack(enemy)) return false;
  const combatMode = getCombatMode(enemy);
  const frameKey = getEnemySpriteFrame(enemy, combatMode, now);
  const stableShakeX = enemy.defeated ? 0 : shakeX;
  const drawBox = getEnemySpriteDrawBox(enemy, screenX, stableShakeX, combatMode);
  if (!frameKey || !drawBox) return false;

  const assets = enemySpriteAssetsRef.current;
  const spritePack = getEnemySpritePack(assets, family);
  if (!spritePack?.loaded || spritePack.failed) return false;
  const atlasRegion = spritePack.atlas?.regions?.[frameKey] || null;

  const centerX = screenX + enemy.width / 2 + stableShakeX;
  const baseY = enemy.y + enemy.height;
  const bodyPose = getEnemyBodyLanguagePose(enemy, combatMode);
  // sandWisp uses a fixed width from drawBox so frame aspect-ratio differences
  // don't cause visible size jumps between idle, windup, and attack frames.
  const atlasAdjustedWidth = (family === 'sandWisp' || family === 'vestibuleWisp')
    ? drawBox.width
    : Math.max(drawBox.width, drawBox.height * (atlasRegion.w / Math.max(1, atlasRegion.h)));
  const groundedDrawBox = atlasRegion
    ? {
      ...drawBox,
      x: centerX - atlasAdjustedWidth / 2,
      width: atlasAdjustedWidth,
    }
    : drawBox;
  const facing = (enemy.attackTimer > 0 || enemy.attackWindup > 0)
    ? enemy.attackDirection
    : enemy.direction;
  const shouldFlip = shouldFlipEnemySprite(family, facing);
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  const shadowWidth = family === 'bat' ? groundedDrawBox.width * 0.72 : groundedDrawBox.width * 0.78;
  drawContactShadow(ctx, centerX, baseY + (family === 'bat' ? 10 : 3), shadowWidth, family === 'bat' ? 0.16 : 0.24, 1);
  if (family !== 'bat' && !enemy.defeated) {
    drawGroundDustLip(ctx, centerX, baseY + 2, groundedDrawBox.width * 0.64, 'rgba(95, 58, 27, 0.22)');
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  if (enemy.defeated) {
    ctx.globalAlpha = family === 'bat' ? 0.78 : 0.84;
    ctx.filter = 'saturate(0.86) brightness(0.92)';
  } else if (enemy.hitFlash > 0) {
    ctx.filter = 'brightness(1.1) saturate(0.62)';
  } else if (family === 'bat') {
    ctx.filter = 'brightness(1.12) contrast(1.08)';
  } else {
    ctx.filter = 'drop-shadow(-3px 2px 3px rgba(231, 166, 82, 0.3)) drop-shadow(0 7px 7px rgba(34, 18, 8, 0.24))';
  }

  if (shouldFlip) {
    ctx.translate(groundedDrawBox.x + groundedDrawBox.width / 2 + bodyPose.offsetX, groundedDrawBox.y + groundedDrawBox.height + bodyPose.offsetY);
    ctx.rotate(bodyPose.rotation);
    ctx.scale(-bodyPose.scaleX, bodyPose.scaleY);
  } else {
    ctx.translate(groundedDrawBox.x + groundedDrawBox.width / 2 + bodyPose.offsetX, groundedDrawBox.y + groundedDrawBox.height + bodyPose.offsetY);
    ctx.rotate(bodyPose.rotation);
    ctx.scale(bodyPose.scaleX, bodyPose.scaleY);
  }
  if (enemy.hitFlash > 0 && !enemy.defeated) {
    const hitT = Math.min(1, enemy.hitFlash / 0.18);
    ctx.scale(1 - hitT * 0.20, 1 + hitT * 0.16);
  }

  if (combatMode === 'cooldown' && (family === 'scarab' || family === 'scorpion')) {
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = 'rgba(136, 82, 36, 0.24)';
    ctx.beginPath();
    ctx.ellipse(0, 4, groundedDrawBox.width * 0.22, 3.5, bodyPose.rotation * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  const drawn = drawAtlasRegion(
    ctx,
    spritePack,
    frameKey,
    {
      x: -groundedDrawBox.width / 2,
      y: -groundedDrawBox.height,
      width: groundedDrawBox.width,
      height: groundedDrawBox.height,
    },
    { mode: 'contain', alignY: 'bottom' },
  );
  ctx.restore();

  if (drawn && stateRef.current.renderStats) {
    const stats = stateRef.current.renderStats;
    stats.visibleEnemySpriteFamilies = Array.from(new Set([...(stats.visibleEnemySpriteFamilies || []), family]));
    const frameState = `${enemy.id}:${family}:${combatMode}:${frameKey}`;
    stats.enemySpriteFrameStates = [...(stats.enemySpriteFrameStates || []), frameState].slice(-12);
    stats.enemyVisibilityAssistActive = false;
  }

  return drawn;
}

export function drawLinkedEnemySpriteFrame(ctx, enemy, screenX, now, shakeX = 0, deps) {
  const {
    PLAYER_SPRITE_FRAME_COUNT,
    PLAYER_SPRITE_FRAME_HEIGHT,
    PLAYER_SPRITE_FRAME_WIDTH,
    bossSpriteAssetsRef,
    drawAtlasRegion,
    drawContactShadow,
    getBossSpritePack,
    getCombatMode,
    playerSpriteRef,
    shouldFlipBossSprite,
    shouldFlipEnemySprite,
    stateRef,
  } = deps;
  const combatMode = getCombatMode(enemy);
  const stableShakeX = enemy.defeated ? 0 : shakeX;
  const centerX = screenX + enemy.width / 2 + stableShakeX;
  const baseY = enemy.y + enemy.height;
  const facing = (enemy.attackTimer > 0 || enemy.attackWindup > 0)
    ? enemy.attackDirection
    : enemy.direction;
  if (enemy.type === 'scarab' || enemy.type === 'snake' || enemy.type === 'scorpion' || enemy.type === 'sand-wisp') {
    const pulse = Math.sin(now / 140) * 0.5 + 0.5;
    const defeated = combatMode === 'defeated';
    const stunned = enemy.hitFlash > 0 || combatMode === 'stunned';
    const frameKey = `${enemy.type}-${combatMode}-${Math.floor(now / 220) % 2}`;
    ctx.save();
    if (enemy.type === 'scarab') {
      const bodyY = baseY - 11 + (defeated ? 5 : 0);
      const shellPulse = defeated ? 0 : Math.sin(now / 190) * 0.8;
      drawContactShadow(ctx, centerX, baseY + 3, enemy.width * 0.82, defeated ? 0.1 : 0.2, 0.9);
      ctx.globalAlpha = defeated ? 0.5 : 0.96;
      ctx.strokeStyle = stunned ? 'rgba(210, 195, 172, 0.9)' : '#4a2b12';
      ctx.lineWidth = 2;
      const shell = ctx.createLinearGradient(centerX, bodyY - 16, centerX, bodyY + 11);
      shell.addColorStop(0, stunned ? '#c8a87a' : '#b77932');
      shell.addColorStop(0.48, stunned ? '#8a5e28' : '#7c3f16');
      shell.addColorStop(1, '#3f2411');
      ctx.fillStyle = shell;
      ctx.beginPath();
      ctx.ellipse(centerX, bodyY, enemy.width * 0.68, enemy.height * 0.42 + shellPulse, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = stunned ? 'rgba(220, 210, 190, 0.85)' : 'rgba(146, 64, 14, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, bodyY - enemy.height * 0.34);
      ctx.lineTo(centerX, bodyY + enemy.height * 0.34);
      ctx.moveTo(centerX - enemy.width * 0.42, bodyY - 1);
      ctx.quadraticCurveTo(centerX - enemy.width * 0.18, bodyY + 5, centerX, bodyY + 4);
      ctx.quadraticCurveTo(centerX + enemy.width * 0.18, bodyY + 5, centerX + enemy.width * 0.42, bodyY - 1);
      ctx.stroke();
      ctx.strokeStyle = '#5b3516';
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(centerX - enemy.width * 0.18, bodyY + i * 4);
        ctx.lineTo(centerX - enemy.width * 0.5, bodyY + i * 6 + 5);
        ctx.moveTo(centerX + enemy.width * 0.18, bodyY + i * 4);
        ctx.lineTo(centerX + enemy.width * 0.5, bodyY + i * 6 + 5);
        ctx.stroke();
      }
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(centerX + facing * enemy.width * 0.22, bodyY - 5, 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (enemy.type === 'snake') {
      const bodyY = baseY - 13 + (defeated ? 6 : 0);
      drawContactShadow(ctx, centerX, baseY + 3, enemy.width * 0.76, defeated ? 0.08 : 0.16, 0.8);
      ctx.globalAlpha = defeated ? 0.48 : 0.94;
      ctx.strokeStyle = stunned ? 'rgba(200, 188, 168, 0.88)' : '#4d7c0f';
      ctx.fillStyle = stunned ? '#4a6028' : '#365314';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i += 1) {
        const segmentX = centerX - facing * (enemy.width * 0.26 - i * enemy.width * 0.17);
        const segmentY = bodyY + Math.sin(now / 180 + i) * 2;
        ctx.beginPath();
        ctx.ellipse(segmentX, segmentY, enemy.width * (i === 3 ? 0.2 : 0.24), enemy.height * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.ellipse(centerX + facing * enemy.width * 0.34, bodyY - 3, enemy.width * 0.22, enemy.height * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(centerX + facing * enemy.width * 0.4, bodyY - 5, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (enemy.type === 'scorpion') {
      const bodyY = baseY - 13 + (defeated ? 6 : 0);
      const slowPulse = Math.sin(now / 360) * 0.5 + 0.5;
      const fastPulse = Math.sin(now / 110) * 0.5 + 0.5;
      const walkCycle = Math.sin(now / 165);
      const isWindup = combatMode === 'windup';
      const isAttacking = combatMode === 'attacking';
      const isCooldown = combatMode === 'cooldown';
      const isVenomAttack = enemy.attackPattern === 'venom-spit';

      drawContactShadow(ctx, centerX, baseY + 3, enemy.width * (defeated ? 0.55 : 0.78), defeated ? 0.08 : 0.18, 0.9);
      ctx.globalAlpha = defeated ? 0.52 : 0.96;

      const attackLashesTail = isAttacking && !isVenomAttack;
      const attackHoldsTail = isAttacking && isVenomAttack;
      const abdomenSx = attackLashesTail ? 0.94 : (isWindup || attackHoldsTail) ? 1.06 : 1 + slowPulse * 0.025;
      const abdomenSy = attackLashesTail ? 1.06 : (isWindup || attackHoldsTail) ? 0.94 : 1;
      const bodyOffsetY = (isWindup || attackHoldsTail) ? -2 : attackLashesTail ? 1 : isCooldown ? 3 : stunned ? 2 : 0;
      ctx.strokeStyle = stunned ? 'rgba(210, 190, 165, 0.88)' : '#7c2d12';
      ctx.fillStyle = stunned ? '#8a6535' : '#a16207';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(centerX, bodyY + bodyOffsetY, enemy.width * 0.38 * abdomenSx, enemy.height * 0.34 * abdomenSy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const headShift = attackLashesTail ? facing * 3 : (isWindup || attackHoldsTail) ? -facing * 1 : 0;
      ctx.fillStyle = stunned ? '#6b4e28' : '#78350f';
      ctx.beginPath();
      ctx.ellipse(centerX + facing * enemy.width * 0.27 + headShift, bodyY - 2 + bodyOffsetY, enemy.width * 0.18, enemy.height * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const pinchSpread = attackLashesTail ? 7 : (isWindup || attackHoldsTail) ? 5 : 3.5;
      const pinchBaseX = centerX + facing * enemy.width * 0.42 + headShift;
      ctx.strokeStyle = stunned ? 'rgba(160, 130, 90, 0.8)' : '#6b2d0e';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(pinchBaseX - facing * 2, bodyY - 4 + bodyOffsetY);
      ctx.lineTo(pinchBaseX + facing * 5, bodyY - 4 - pinchSpread * 0.55 + bodyOffsetY);
      ctx.moveTo(pinchBaseX - facing * 2, bodyY + bodyOffsetY);
      ctx.lineTo(pinchBaseX + facing * 5, bodyY + pinchSpread * 0.45 + bodyOffsetY);
      ctx.stroke();

      ctx.strokeStyle = stunned ? 'rgba(160, 130, 90, 0.75)' : '#92400e';
      ctx.lineWidth = 1.3;
      const legSplay = isCooldown ? 1.18 : (isWindup || attackHoldsTail) ? 1.08 : attackLashesTail ? 0.86 : defeated ? 0.7 : 1;
      const legLen = enemy.width * 0.38 * legSplay;
      const walkAnim = (isAttacking || isWindup || isCooldown || stunned || defeated) ? 0 : walkCycle * 3;
      for (let i = -1; i <= 1; i += 1) {
        const wave = i * walkAnim;
        const tipY = defeated ? bodyY + 10 : bodyY + i * 5.5 + 5 + bodyOffsetY;
        ctx.beginPath();
        ctx.moveTo(centerX - enemy.width * 0.08, bodyY + i * 3 + bodyOffsetY);
        ctx.quadraticCurveTo(centerX - enemy.width * 0.22, bodyY + i * 4 + 5 + bodyOffsetY, centerX - legLen, tipY + wave);
        ctx.moveTo(centerX + enemy.width * 0.08, bodyY + i * 3 + bodyOffsetY);
        ctx.quadraticCurveTo(centerX + enemy.width * 0.22, bodyY + i * 4 + 5 + bodyOffsetY, centerX + legLen, tipY - wave);
        ctx.stroke();
      }

      let tailCpX;
      let tailCpY;
      let tailTipX;
      let tailTipY;
      const tailBaseX = centerX - facing * enemy.width * 0.22;
      const tailBaseY = bodyY - 8 + bodyOffsetY;
      if (defeated) {
        tailCpX = centerX - facing * enemy.width * 0.12; tailCpY = bodyY + 4;
        tailTipX = centerX - facing * enemy.width * 0.28; tailTipY = bodyY + 10;
      } else if (isWindup || attackHoldsTail) {
        tailCpX = centerX - facing * enemy.width * 0.42; tailCpY = bodyY - 42;
        tailTipX = centerX - facing * enemy.width * 0.04; tailTipY = bodyY - 44 - fastPulse * 2;
      } else if (attackLashesTail) {
        tailCpX = centerX - facing * enemy.width * 0.08; tailCpY = bodyY - 16;
        tailTipX = centerX + facing * enemy.width * 0.24; tailTipY = bodyY - 20;
      } else if (isCooldown) {
        tailCpX = centerX - facing * enemy.width * 0.3; tailCpY = bodyY - 6;
        tailTipX = centerX - facing * enemy.width * 0.06; tailTipY = bodyY - 7 + slowPulse * 2;
      } else if (stunned) {
        tailCpX = centerX - facing * enemy.width * 0.22; tailCpY = bodyY - 10;
        tailTipX = centerX - facing * enemy.width * 0.04; tailTipY = bodyY - 12;
      } else {
        tailCpX = centerX - facing * enemy.width * 0.36; tailCpY = bodyY - 24;
        tailTipX = centerX - facing * enemy.width * 0.05; tailTipY = bodyY - 26 - slowPulse * 2.5;
      }
      ctx.strokeStyle = stunned ? 'rgba(175, 145, 105, 0.78)' : '#92400e';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tailBaseX, tailBaseY);
      ctx.quadraticCurveTo(tailCpX, tailCpY, tailTipX, tailTipY);
      ctx.stroke();

      const stingerGlowing = (isWindup || isAttacking) && isVenomAttack;
      const stingerR = stingerGlowing ? 4.2 + fastPulse * 1.5 : defeated ? 2.2 : 3.2;
      if (stingerGlowing) {
        ctx.shadowColor = 'rgba(110, 52, 12, 0.75)';
        ctx.shadowBlur = 7 + fastPulse * 4;
      }
      ctx.fillStyle = stingerGlowing
        ? `rgba(${Math.round(175 + fastPulse * 35)}, 72, 18, 0.92)`
        : stunned ? '#7a5530' : '#c2410c';
      ctx.beginPath();
      ctx.arc(tailTipX, tailTipY, stingerR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      const floatY = centerX % 2 === 0 ? baseY - 33 - pulse * 5 : baseY - 31 - pulse * 5;
      drawContactShadow(ctx, centerX, baseY + 4, enemy.width * 0.66, defeated ? 0.06 : 0.12, 0.65);
      ctx.globalAlpha = defeated ? 0.42 : 0.86;
      const glow = ctx.createRadialGradient(centerX, floatY, 2, centerX, floatY, enemy.width * 0.55);
      glow.addColorStop(0, stunned ? 'rgba(235, 222, 200, 0.88)' : 'rgba(253, 224, 71, 0.9)');
      glow.addColorStop(0.55, 'rgba(251, 191, 36, 0.35)');
      glow.addColorStop(1, 'rgba(180, 83, 9, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, floatY, enemy.width * 0.58, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = stunned ? 'rgba(210, 198, 178, 0.88)' : '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, floatY, enemy.width * 0.28 + pulse * 2, Math.PI * 0.1, Math.PI * 1.55);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX + 3, floatY + 2, enemy.width * 0.17, Math.PI * 1.1, Math.PI * 2.1);
      ctx.stroke();
    }
    ctx.restore();
    if (stateRef.current.renderStats) {
      const stats = stateRef.current.renderStats;
      stats.visibleEnemySpriteFamilies = Array.from(new Set([...(stats.visibleEnemySpriteFamilies || []), enemy.type]));
      const frameState = `${enemy.id}:${enemy.type}:${combatMode}:${frameKey}`;
      stats.enemySpriteFrameStates = [...(stats.enemySpriteFrameStates || []), frameState].slice(-12);
    }
    return true;
  }

  if (enemy.type === 'guardian' || enemy.type === 'statue') {
    const bossId = enemy.type === 'statue' ? 'ancient-construct' : 'temple-guardian';
    const pack = getBossSpritePack(bossSpriteAssetsRef.current, bossId);
    if (!pack) return false;
    const frameKey = enemy.type === 'statue'
      ? (combatMode === 'defeated' ? 'ancientConstructDefeated' : enemy.hitFlash > 0 || combatMode === 'stunned' ? 'ancientConstructHit' : combatMode === 'windup' ? 'ancientConstructWindup' : combatMode === 'attacking' ? 'ancientConstructSlam' : 'ancientConstructWalk1')
      : (combatMode === 'defeated' ? 'stoneGuardianDefeated' : enemy.hitFlash > 0 || combatMode === 'stunned' ? 'stoneGuardianHit' : combatMode === 'windup' ? 'stoneGuardianWindup' : combatMode === 'attacking' ? 'stoneGuardianSlam' : 'stoneGuardianWalk1');
    const width = enemy.type === 'statue' ? 82 : 76;
    const height = enemy.type === 'statue' ? 82 : 78;
    const drawBox = {
      x: centerX - width / 2,
      y: baseY - height + 4,
      width,
      height,
    };
    const shouldFlip = shouldFlipBossSprite(bossId, facing);
    ctx.save();
    drawContactShadow(ctx, centerX, baseY + 3, width * 0.74, enemy.defeated ? 0.12 : 0.24, 1);
    if (enemy.hitFlash > 0 && !enemy.defeated) {
      const hitT = Math.min(1, enemy.hitFlash / 0.18);
      const pivotX = drawBox.x + drawBox.width / 2;
      const pivotY = drawBox.y + drawBox.height * 0.5;
      ctx.translate(pivotX, pivotY);
      ctx.scale(1 - hitT * 0.18, 1 + hitT * 0.14);
      ctx.translate(-pivotX, -pivotY);
    }
    if (enemy.defeated) ctx.globalAlpha = 0.82;
    if (enemy.hitFlash > 0) ctx.filter = 'brightness(1.1) saturate(0.62)';
    if (shouldFlip) {
      ctx.translate(drawBox.x + drawBox.width / 2, 0);
      ctx.scale(-1, 1);
    }
    const drawn = drawAtlasRegion(
      ctx,
      pack,
      frameKey,
      {
        x: shouldFlip ? -drawBox.width / 2 : drawBox.x,
        y: drawBox.y,
        width: drawBox.width,
        height: drawBox.height,
      },
      { mode: 'contain' },
    );
    ctx.restore();
    if (drawn && stateRef.current.renderStats) {
      const stats = stateRef.current.renderStats;
      stats.visibleEnemySpriteFamilies = Array.from(new Set([...(stats.visibleEnemySpriteFamilies || []), enemy.type]));
      const frameState = `${enemy.id}:${enemy.type}:${combatMode}:${frameKey}`;
      stats.enemySpriteFrameStates = [...(stats.enemySpriteFrameStates || []), frameState].slice(-12);
    }
    return drawn;
  }

  if (enemy.type === 'looter' && playerSpriteRef.current.loaded && playerSpriteRef.current.image) {
    const frame = combatMode === 'defeated'
      ? 1
      : Math.floor(now / 180) % PLAYER_SPRITE_FRAME_COUNT;
    const drawHeight = enemy.defeated ? 46 : 72;
    const drawWidth = PLAYER_SPRITE_FRAME_WIDTH * (drawHeight / PLAYER_SPRITE_FRAME_HEIGHT);
    const drawX = centerX - drawWidth / 2;
    const drawY = baseY - drawHeight + (enemy.defeated ? 8 : 0);
    const shouldFlip = shouldFlipEnemySprite('looter', facing);
    ctx.save();
    drawContactShadow(ctx, centerX, baseY + 3, drawWidth * 0.56, enemy.defeated ? 0.11 : 0.2, 1);
    ctx.filter = enemy.hitFlash > 0
      ? 'brightness(1.22) sepia(40%) saturate(0.8)'
      : 'sepia(38%) saturate(0.72) brightness(0.78)';
    ctx.globalAlpha = enemy.defeated ? 0.72 : 0.92;
    if (shouldFlip) {
      ctx.translate(drawX + drawWidth / 2, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(
      playerSpriteRef.current.image,
      frame * PLAYER_SPRITE_FRAME_WIDTH,
      0,
      PLAYER_SPRITE_FRAME_WIDTH,
      PLAYER_SPRITE_FRAME_HEIGHT,
      shouldFlip ? -drawWidth / 2 : drawX,
      drawY,
      drawWidth,
      drawHeight,
    );
    ctx.restore();
    if (stateRef.current.renderStats) {
      const stats = stateRef.current.renderStats;
      stats.visibleEnemySpriteFamilies = Array.from(new Set([...(stats.visibleEnemySpriteFamilies || []), 'looter']));
      const frameState = `${enemy.id}:looter:${combatMode}:playerFrame${frame}`;
      stats.enemySpriteFrameStates = [...(stats.enemySpriteFrameStates || []), frameState].slice(-12);
    }
    return true;
  }

  return false;
}

export function drawScarabQueenLairOpeningPropFrame(ctx, worldCenterX, cameraX, now, beat = null, placement = null, deps) {
  const {
    CANVAS_WIDTH,
    GROUND_Y,
    drawContactShadow,
    drawGroundDustLip,
    scarabQueenLairOpeningImageRef,
    worldToScreenX,
  } = deps;
  const screenX = worldToScreenX(worldCenterX, cameraX);
  if (screenX < -260 || screenX > CANVAS_WIDTH + 260) return false;

  const crack = beat?.buriedSealCrack || 0;
  const glowStrength = beat?.glyphGlow || 0;
  const eruption = beat?.sandEruption || 0;
  const rise = beat?.queenRise || 0;
  const asset = scarabQueenLairOpeningImageRef.current;
  const baseWidth = Math.max(1, Number(placement?.width) || 500);
  const width = baseWidth + crack * 64;
  const baseHeight = Math.max(1, Number(placement?.height) || baseWidth * (330 / 980));
  const height = baseHeight * (width / baseWidth);
  const groundY = Number.isFinite(placement?.y) ? placement.y : GROUND_Y + 6;
  const drawX = screenX - width / 2;
  const drawY = groundY - height;
  const pulse = 0.82 + Math.sin(now / 150) * 0.12;

  ctx.save();
  drawContactShadow(ctx, screenX, groundY - 2, width * 0.82, 0.2 + crack * 0.1, 1.1);
  if (glowStrength > 0) {
    const glow = ctx.createRadialGradient(screenX, groundY - 42, 10, screenX, groundY - 42, 132 + glowStrength * 112);
    glow.addColorStop(0, `rgba(45, 212, 191, ${0.2 + glowStrength * 0.2})`);
    glow.addColorStop(0.36, `rgba(250, 204, 21, ${0.1 + glowStrength * 0.22})`);
    glow.addColorStop(1, 'rgba(120, 53, 15, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(screenX, groundY - 42, (132 + glowStrength * 92) * pulse, (48 + glowStrength * 34) * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (asset.loaded && asset.image) {
    ctx.globalAlpha = 0.98;
    ctx.drawImage(asset.image, drawX, drawY, width, height);
  } else {
    ctx.fillStyle = '#b7793b';
    ctx.beginPath();
    ctx.ellipse(screenX, groundY - 24, width / 2, height * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d6a642';
    ctx.beginPath();
    ctx.ellipse(screenX, groundY - 38, width * 0.24, height * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (crack > 0) {
    ctx.strokeStyle = `rgba(255, 244, 196, ${0.18 + glowStrength * 0.42})`;
    ctx.lineWidth = 1.4 + crack * 1.2;
    [-1, 1, 0].forEach((side, index) => {
      ctx.beginPath();
      const startX = screenX + side * (18 + index * 12);
      ctx.moveTo(startX, groundY - 44);
      ctx.lineTo(startX + side * (24 + crack * 22), groundY - 31 + index * 5);
      ctx.lineTo(startX + side * (44 + crack * 34), groundY - 20 + index * 2);
      ctx.stroke();
    });
  }

  if (eruption > 0) {
    ctx.fillStyle = `rgba(202, 138, 62, ${0.22 + eruption * 0.32})`;
    for (let index = 0; index < 26; index += 1) {
      const side = index % 2 ? 1 : -1;
      const spread = 16 + (index % 7) * 13 + eruption * 64;
      const lift = (18 + (index % 5) * 11) * eruption + Math.sin(now / 95 + index) * 3;
      ctx.beginPath();
      ctx.arc(
        screenX + side * spread * (0.28 + eruption * 0.72),
        groundY - 14 - lift,
        1.8 + (index % 3) * 0.7 + eruption * 1.8,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    drawGroundDustLip(ctx, screenX, groundY - 5, width * (0.82 + eruption * 0.36), `rgba(202, 138, 62, ${0.2 + eruption * 0.34})`);
  }

  if (rise > 0 && rise < 0.96) {
    ctx.fillStyle = `rgba(12, 8, 6, ${0.38 * (1 - rise)})`;
    ctx.beginPath();
    ctx.ellipse(screenX, groundY - 40, width * (0.22 + rise * 0.12), 28 + rise * 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  return true;
}

export function drawBossSpriteFrame(ctx, boss, screenX, now, bossVisualState, deps) {
  const {
    CANVAS_WIDTH,
    bossSpriteAssetsRef,
    clamp,
    drawAtlasRegion,
    drawContactShadow,
    drawGroundDustLip,
    getAncientConstructDrawBox,
    getAncientConstructSpriteFrame,
    getBossSpritePack,
    getClayGuardianDrawBox,
    getClayGuardianSpriteFrame,
    getCombatMode,
    getGiantSerpentDrawBox,
    getGiantSerpentSpriteFrame,
    getLegateRevenantDrawBox,
    getLegateRevenantSpriteFrame,
    getRomeBossSpritePack,
    getScarabQueenDrawBox,
    getScarabQueenSpriteFrame,
    getStoneGuardianDrawBox,
    getStoneGuardianSpriteFrame,
    isChinaGuardianBossSpriteId,
    isRomeBossSpriteId,
    shouldFlipBossSprite,
    stateRef,
  } = deps;
  const spriteBossId = boss.spriteBossId || boss.id;
  const isChinaGuardianBoss = isChinaGuardianBossSpriteId(spriteBossId);
  const isRomeGuardianBoss = isRomeBossSpriteId(spriteBossId);
  const supportedBoss = isRomeGuardianBoss
    || isChinaGuardianBoss
    || boss.id === 'scarab-queen'
    || boss.id === 'temple-guardian'
    || boss.id === 'giant-serpent'
    || boss.id === 'ancient-construct';
  if (!supportedBoss) return false;
  const combatMode = getCombatMode(boss);
  const frameKey = isRomeGuardianBoss
    ? getLegateRevenantSpriteFrame(boss, combatMode, bossVisualState, now)
    : isChinaGuardianBoss
      ? getClayGuardianSpriteFrame(boss, combatMode, bossVisualState, now)
      : boss.id === 'ancient-construct'
        ? getAncientConstructSpriteFrame(boss, combatMode, bossVisualState, now)
        : boss.id === 'temple-guardian'
          ? getStoneGuardianSpriteFrame(boss, combatMode, bossVisualState, now)
          : boss.id === 'giant-serpent'
            ? getGiantSerpentSpriteFrame(boss, combatMode, bossVisualState, now)
            : getScarabQueenSpriteFrame(boss, combatMode, bossVisualState, now);
  let drawBox = isRomeGuardianBoss
    ? getLegateRevenantDrawBox(boss, screenX)
    : isChinaGuardianBoss
      ? getClayGuardianDrawBox(boss, screenX)
      : boss.id === 'ancient-construct'
        ? getAncientConstructDrawBox(boss, screenX)
        : boss.id === 'temple-guardian'
          ? getStoneGuardianDrawBox(boss, screenX)
          : boss.id === 'giant-serpent'
            ? getGiantSerpentDrawBox(boss, screenX)
            : getScarabQueenDrawBox(boss, screenX);
  const pack = isRomeGuardianBoss
    ? getRomeBossSpritePack(bossSpriteAssetsRef.current, spriteBossId)
    : getBossSpritePack(bossSpriteAssetsRef.current, spriteBossId);
  if (!frameKey || !drawBox || !pack) return false;
  if (boss.id === 'scarab-queen') {
    const visibleX = clamp(drawBox.x, 18, CANVAS_WIDTH - drawBox.width - 118);
    drawBox = { ...drawBox, x: visibleX };
  }

  const facing = (boss.attackTimer > 0 || boss.attackWindup > 0)
    ? boss.attackDirection
    : boss.direction;
  const shouldFlip = shouldFlipBossSprite(spriteBossId, facing);
  const centerX = screenX + boss.width / 2;
  const baseY = boss.y + boss.height;
  if (boss.id === 'scarab-queen' && bossVisualState?.buriedSandEmergence && bossVisualState.cinematicBeat?.queenRise <= 0) return false;

  const cinematicReveal = boss.id === 'scarab-queen' && bossVisualState?.cinematicBeat
    ? bossVisualState.cinematicBeat.queenRise
    : 1;
  const cinematicLift = boss.id === 'scarab-queen' && bossVisualState?.buriedSandEmergence
    ? (1 - cinematicReveal) * 118
    : 0;
  const cinematicPulse = boss.id === 'scarab-queen' && bossVisualState?.cinematicBeat
    ? Math.sin(now / 78) * 0.035 * bossVisualState.cinematicBeat.finalHold
    : 0;
  const visualScale = (boss.visualScale || 1) * (boss.id === 'scarab-queen' && bossVisualState?.buriedSandEmergence
    ? 0.86 + cinematicReveal * 0.14 + cinematicPulse
    : 1);

  ctx.save();
  if (boss.id === 'scarab-queen' && bossVisualState?.buriedSandEmergence) {
    ctx.globalAlpha = clamp(0.35 + cinematicReveal * 0.65, 0.35, 1);
    ctx.translate(0, cinematicLift);
    if (cinematicReveal < 1) {
      ctx.filter = `brightness(${0.82 + cinematicReveal * 0.42}) saturate(${0.72 + cinematicReveal * 0.5})`;
    }
  }
  if (visualScale !== 1) {
    ctx.translate(centerX, baseY);
    ctx.scale(visualScale, visualScale);
    ctx.translate(-centerX, -baseY);
  }
  const isStoneBoss = isChinaGuardianBoss || boss.id === 'temple-guardian' || boss.id === 'ancient-construct';
  if (boss.id !== 'scarab-queen') {
    drawContactShadow(ctx, centerX, baseY + 3, drawBox.width * (isStoneBoss ? 0.86 : 0.78), isStoneBoss ? 0.34 : 0.28, 1.5);
  }
  if (isStoneBoss && (combatMode === 'attacking' || combatMode === 'windup')) {
    drawGroundDustLip(ctx, centerX, baseY + 2, drawBox.width * 0.72, 'rgba(197, 148, 72, 0.28)');
  }
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  if (boss.hitFlash > 0 || combatMode === 'stunned') {
    ctx.filter = 'brightness(1.28) saturate(1.12)';
  }
  if (shouldFlip) {
    ctx.translate(drawBox.x + drawBox.width / 2, 0);
    ctx.scale(-1, 1);
  }
  const drawn = drawAtlasRegion(
    ctx,
    pack,
    frameKey,
    {
      x: shouldFlip ? -drawBox.width / 2 : drawBox.x,
      y: drawBox.y,
      width: drawBox.width,
      height: drawBox.height,
    },
    { mode: 'contain', alignY: 'bottom' },
  );
  ctx.restore();

  if (drawn && stateRef.current.renderStats) {
    stateRef.current.renderStats.activeBossSprite = spriteBossId;
    stateRef.current.renderStats.activeBossSpriteFrame = frameKey;
    stateRef.current.renderStats.activeBossAnimationState = combatMode;
    if (isChinaGuardianBoss) {
      stateRef.current.renderStats.chinaClayGuardianSpriteFrame = frameKey;
    }
    if (boss.id === 'temple-guardian') {
      stateRef.current.renderStats.stoneGuardianSpriteFrame = frameKey;
    }
    if (boss.id === 'ancient-construct') {
      stateRef.current.renderStats.ancientConstructSpriteFrame = frameKey;
    }
    if (boss.id === 'giant-serpent') {
      stateRef.current.renderStats.giantSerpentSpriteFrame = frameKey;
    }
  }

  return drawn;
}

export function getBossVisibleDrawBoxFrame(boss, screenX, deps) {
  const {
    getAncientConstructDrawBox,
    getClayGuardianDrawBox,
    getGiantSerpentDrawBox,
    getScarabQueenDrawBox,
    getStoneGuardianDrawBox,
    isChinaGuardianBossSpriteId,
  } = deps;
  if (isChinaGuardianBossSpriteId(boss.spriteBossId)) return getClayGuardianDrawBox(boss, screenX);
  if (boss.id === 'ancient-construct') return getAncientConstructDrawBox(boss, screenX);
  if (boss.id === 'temple-guardian') return getStoneGuardianDrawBox(boss, screenX);
  if (boss.id === 'giant-serpent') return getGiantSerpentDrawBox(boss, screenX);
  if (boss.id === 'scarab-queen') return getScarabQueenDrawBox(boss, screenX);
  return {
    x: screenX,
    y: boss.y,
    width: boss.width,
    height: boss.height,
  };
}

export function drawMiniBossFrame(ctx, boss, screenX, now, deps) {
  const {
    CANVAS_WIDTH,
    clamp,
    getBossVulnerabilityState,
    getScarabQueenEmergenceBeat,
    stateRef,
  } = deps;
  const cx = screenX + boss.width / 2;
  const cy = boss.y + boss.height / 2;
  const introActive = stateRef.current.bossIntro?.id === boss.id;
  const activeBossDomain = stateRef.current.bossDomain?.bossId === boss.id ? stateRef.current.bossDomain : null;
  const introProgress = introActive
    ? Math.min(1, stateRef.current.bossIntroTimer / (activeBossDomain?.introSeconds || 3.2))
    : 0;
  const buriedSandEmergenceActive = Boolean(activeBossDomain?.buriedSandEmergence && introActive);
  const bossVisualState = {
    ...getBossVulnerabilityState(boss),
    introActive,
    buriedSandEmergence: buriedSandEmergenceActive,
    cinematicBeat: buriedSandEmergenceActive ? getScarabQueenEmergenceBeat(introProgress) : null,
  };

  ctx.save();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 3;

  const bossSpriteDrawn = boss.type === 'looter' || boss.type === 'bes'
    ? drawSmallEnemySpriteFrame(ctx, boss, screenX, now, 0, deps)
    : drawBossSpriteFrame(ctx, boss, screenX, now, bossVisualState, deps);

  if (bossSpriteDrawn) {
    // Sprite atlas handles supported boss body art; shared health/status UI below remains unchanged.
  } else if (boss.type === 'guardian' || boss.type === 'statue') {
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.roundRect(screenX + 10, boss.y + 10, boss.width - 20, 22, 8);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(screenX + 5, boss.y + 30, boss.width - 10, boss.height - 28, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.fillRect(screenX - 8, boss.y + 36, 14, 34);
    ctx.fillRect(screenX + boss.width - 6, boss.y + 36, 14, 34);
    ctx.fillRect(screenX + 8, boss.y + boss.height - 4, boss.width - 16, 12);
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.arc(cx - 8, boss.y + 22, 3, 0, Math.PI * 2);
    ctx.arc(cx + 8, boss.y + 22, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(cx, boss.y + 50, 9 + Math.sin(now / 220) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 247, 212, 0.34)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(screenX + 14, boss.y + 38, boss.width - 28, 24);
  } else if (boss.type === 'snake') {
    ctx.fillStyle = '#166534';
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      const cy = boss.y + boss.height / 2;
      ctx.ellipse(screenX + 12 + i * 14, cy + Math.sin(now / 180 + i) * 5, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(screenX + boss.width - 10, cy - 4, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (boss.type === 'looter') {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(screenX + 14, boss.y + 18, boss.width - 28, boss.height - 14, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(screenX + 7, boss.y + 9, boss.width - 14, 6);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(screenX + boss.width - 18, boss.y + 36, 12, 18);
  } else {
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.ellipse(cx, cy, boss.width / 2, boss.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(cx, boss.y + 8);
    ctx.lineTo(cx + 18, cy);
    ctx.lineTo(cx, boss.y + boss.height - 6);
    ctx.lineTo(cx - 18, cy);
    ctx.closePath();
    ctx.fill();
  }

  if (introActive) {
    ctx.restore();
    return;
  }

  const visibleBox = getBossVisibleDrawBoxFrame(boss, screenX, deps);
  const healthCenterX = boss.awakened ? CANVAS_WIDTH / 2 : visibleBox.x + visibleBox.width / 2;
  const barWidth = boss.awakened ? Math.min(390, CANVAS_WIDTH - 120) : Math.max(boss.width + 20, visibleBox.width * 0.55);
  const barHeight = boss.awakened ? 10 : 8;
  const barX = clamp(healthCenterX - barWidth / 2, 18, CANVAS_WIDTH - barWidth - 18);
  const barY = boss.awakened ? 18 : Math.max(18, visibleBox.y - 16);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0,0,0,0.62)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, 5);
  ctx.fill();
  ctx.fillStyle = boss.awakened ? '#dc2626' : '#b45309';
  ctx.beginPath();
  ctx.roundRect(barX, barY, (boss.health / boss.maxHealth) * barWidth, barHeight, 5);
  ctx.fill();

  ctx.restore();
}

export function drawEnemyAttackTellFrame(ctx, enemy, screenX, cameraX, now, boss = false, deps) {
  const {
    HEAVY_ATTACK_PATTERNS,
    PARRY_WINDOW_DURATION,
    clamp,
    getAttackBox,
    getEnemyAttackTelegraph,
    getEnemyPatternConfig,
  } = deps;
  if (boss || enemy.defeated) return;
  const pattern = getEnemyPatternConfig(enemy);
  const direction = enemy.attackDirection || enemy.direction || 1;
  const attackBox = getAttackBox(
    enemy,
    pattern.range,
    pattern.height,
    direction,
    pattern.yOffset || 0,
    pattern.backReach || 0,
  );
  const tellActive = enemy.attackWindup > 0;
  const attackActive = enemy.attackTimer > 0;
  const recoveryActive = enemy.attackRecovery > 0 || enemy.vulnerabilityTimer > 0;
  if (!tellActive && !attackActive && !recoveryActive) return;

  const telegraph = getEnemyAttackTelegraph(enemy, HEAVY_ATTACK_PATTERNS);
  const boxX = attackBox.x - cameraX;
  const centerX = screenX + enemy.width / 2 - direction * 4;
  const footY = enemy.y + enemy.height + 4;
  const pulse = 0.72 + Math.sin(now / 90) * 0.18;
  const recoveryGoldPulse = 0.46 + Math.sin(now / 125) * 0.16;
  ctx.save();
  ctx.lineWidth = 1.5;
  if (recoveryActive) {
    // Gold punish-window cue: the enemy is open, strike now.
    ctx.globalAlpha = 0.18 + recoveryGoldPulse * 0.07;
    ctx.fillStyle = 'rgba(110, 68, 28, 0.28)';
    ctx.beginPath();
    ctx.ellipse(centerX, footY, enemy.width * 0.78, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (tellActive) {
    // Gold/orange means parry or dodge; red means unblockable, dodge only.
    // Danger reads through grounded light on the sand instead of floating
    // overlay rectangles, so the cue feels like part of the world.
    const windupDuration = Math.max(0.001, pattern.windup || 0.4);
    const charge = clamp(1 - enemy.attackWindup / windupDuration, 0, 1);
    const isUnblockable = !telegraph.parryable;
    const ringR = enemy.width * 0.6;

    if (!pattern.ranged) {
      // Soft danger pool on the ground under the strike zone, growing with charge.
      const zoneCenterX = boxX + attackBox.width / 2;
      const zoneRadius = Math.max(attackBox.width * (0.42 + charge * 0.22), 20);
      const zoneGlow = ctx.createRadialGradient(zoneCenterX, footY, 2, zoneCenterX, footY, zoneRadius);
      zoneGlow.addColorStop(0, telegraph.glow);
      zoneGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.save();
      ctx.translate(zoneCenterX, footY);
      ctx.scale(1, 0.26);
      ctx.translate(-zoneCenterX, -footY);
      ctx.globalAlpha = (0.3 + charge * 0.3) * (isUnblockable ? 1.1 : 1);
      ctx.fillStyle = zoneGlow;
      ctx.beginPath();
      ctx.arc(zoneCenterX, footY, zoneRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Small reach tick at the far edge keeps the strike range honest.
      const reachX = direction >= 0 ? boxX + attackBox.width : boxX;
      ctx.globalAlpha = 0.28 + charge * 0.3;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = telegraph.color;
      ctx.beginPath();
      ctx.moveTo(reachX, footY - 6);
      ctx.lineTo(reachX, footY + 3);
      ctx.stroke();
      ctx.fillStyle = telegraph.color;
      ctx.beginPath();
      ctx.arc(reachX, footY - 1, 1.6 + charge * 1.2, 0, Math.PI * 2);
      ctx.fill();
      if (pattern.lowLineThreat) {
        const lowLineY = attackBox.y + attackBox.height - 3;
        ctx.globalAlpha = 0.44 + charge * 0.34;
        ctx.lineWidth = 2 + charge * 2;
        ctx.shadowColor = telegraph.glow;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(boxX, lowLineY);
        ctx.lineTo(boxX + attackBox.width, lowLineY);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    ctx.save();
    ctx.translate(centerX, footY);
    ctx.scale(1, 0.32);
    ctx.globalAlpha = 0.22 + pulse * 0.06;
    ctx.lineWidth = 2;
    ctx.strokeStyle = telegraph.color;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.55 + pulse * 0.25;
    ctx.lineWidth = 3 + charge * 1.5;
    ctx.shadowColor = telegraph.glow;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, -Math.PI / 2, -Math.PI / 2 + charge * Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (isUnblockable) {
      // Red expanding ground ring instead of a body outline: dodge, do not parry.
      const auraPulse = 0.5 + Math.sin(now / 130) * 0.5;
      ctx.save();
      ctx.translate(centerX, footY);
      ctx.scale(1, 0.32);
      ctx.globalAlpha = 0.28 + auraPulse * 0.3 + charge * 0.16;
      ctx.lineWidth = 2 + auraPulse * 1.5;
      ctx.strokeStyle = telegraph.color;
      ctx.shadowColor = telegraph.glow;
      ctx.shadowBlur = 6 + auraPulse * 6;
      ctx.beginPath();
      ctx.arc(0, 0, ringR + 8 + auraPulse * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  } else if (attackActive) {
    const parryNow = telegraph.parryable && enemy.attackTimer <= PARRY_WINDOW_DURATION;
    if (!pattern.ranged) {
      // During the swing the ground pool stays lit; the parry window flashes
      // it bright gold so the counter moment still pops without a UI box.
      const zoneCenterX = boxX + attackBox.width / 2;
      const zoneRadius = Math.max(attackBox.width * 0.62, 22);
      const strikeGlow = ctx.createRadialGradient(zoneCenterX, footY, 2, zoneCenterX, footY, zoneRadius);
      strikeGlow.addColorStop(0, parryNow ? 'rgba(255, 242, 176, 0.9)' : telegraph.glow);
      strikeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.save();
      ctx.translate(zoneCenterX, footY);
      ctx.scale(1, 0.26);
      ctx.translate(-zoneCenterX, -footY);
      ctx.globalAlpha = parryNow ? 0.66 : 0.24;
      ctx.fillStyle = strikeGlow;
      ctx.beginPath();
      ctx.arc(zoneCenterX, footY, zoneRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (parryNow) {
        // Bright counter ring at the enemy's feet during the parry window.
        ctx.save();
        ctx.translate(centerX, footY);
        ctx.scale(1, 0.32);
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#fff2b0';
        ctx.shadowColor = 'rgba(255, 240, 170, 0.7)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.width * 0.66, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
  ctx.restore();
}
