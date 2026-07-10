export function drawPlayerWeaponFallbackFrame(ctx, attackState, direction, scale = 1) {
  const attacking = attackState === 'swing';
  const reach = attackState === 'windup' ? 11 : attacking ? 32 : attackState === 'recoil' ? 14 : 18;
  const lift = attacking ? -10 : attackState === 'windup' ? 4 : -2;
  ctx.save();
  if (attackState === 'windup' || attacking || attackState === 'recoil') {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = attacking ? 0.52 : attackState === 'windup' ? 0.26 : 0.18;
    ctx.strokeStyle = attacking ? 'rgba(255, 247, 173, 0.92)' : 'rgba(250, 204, 21, 0.62)';
    ctx.lineWidth = (attacking ? 6 : 3) * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(direction * 12 * scale, -8 * scale, 28 * scale, direction > 0 ? -1.38 : Math.PI + 1.38, direction > 0 ? 0.34 : Math.PI - 0.34, direction < 0);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = (attacking ? 5 : 3) * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(direction * reach * scale, lift * scale);
  ctx.stroke();
  ctx.fillStyle = '#fff7ad';
  ctx.beginPath();
  ctx.arc(direction * (reach + 2) * scale, lift * scale, (attacking ? 4 : 3) * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawPlayerKhopeshFrame(ctx, anchorX, anchorY, attackState, direction = 1, scale = 1, deps) {
  const {
    drawPlayerWeaponAtlasRegion,
    getPlayerWeaponFrameKey,
    playerWeaponSpriteRef,
    stateRef,
  } = deps;
  const assets = playerWeaponSpriteRef.current;
  const frameKey = getPlayerWeaponFrameKey(attackState, assets?.weaponId);
  const ready = assets.loaded && assets.image && assets.atlas?.regions?.[frameKey];

  if (!ready) {
    drawPlayerWeaponFallbackFrame(ctx, attackState, direction, scale);
    return false;
  }

  const frameConfig = {
    khopeshIdle: { x: -5, y: -22, width: 14, height: 40, rotate: -0.1, alpha: 0.92 },
    khopeshWindup: { x: -7, y: -28, width: 30, height: 42, rotate: -0.72, alpha: 1 },
    khopeshSwing: { x: 2, y: -39, width: 64, height: 48, rotate: 0.08, alpha: 0.94 },
    khopeshReady: { x: -5, y: -20, width: 14, height: 40, rotate: 0.2, alpha: 0.9 },
    gladiusIdle: { x: -5, y: -23, width: 13, height: 43, rotate: -0.08, alpha: 0.95 },
    gladiusWindup: { x: -8, y: -31, width: 29, height: 45, rotate: -0.7, alpha: 1 },
    gladiusSwing: { x: 3, y: -40, width: 63, height: 50, rotate: 0.08, alpha: 0.96 },
    gladiusReady: { x: -5, y: -22, width: 14, height: 43, rotate: 0.18, alpha: 0.94 },
  }[frameKey] || { x: 0, y: -24, width: 17, height: 48, rotate: 0, alpha: 1 };

  ctx.save();
  ctx.translate(anchorX, anchorY);
  if (direction < 0) ctx.scale(-1, 1);
  if (attackState === 'windup' || attackState === 'swing' || attackState === 'recoil') {
    const trailAlpha = attackState === 'swing' ? 0.58 : attackState === 'windup' ? 0.28 : 0.18;
    const trailWidth = attackState === 'swing' ? 9 : 5;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = trailAlpha;
    ctx.strokeStyle = attackState === 'swing' ? 'rgba(255, 247, 173, 0.92)' : 'rgba(250, 204, 21, 0.68)';
    ctx.lineWidth = trailWidth * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (attackState === 'windup') {
      ctx.arc(8 * scale, -16 * scale, 26 * scale, -2.15, -0.62);
    } else if (attackState === 'recoil') {
      ctx.arc(16 * scale, -14 * scale, 24 * scale, -0.12, 0.82);
    } else {
      ctx.arc(22 * scale, -18 * scale, 38 * scale, -1.28, 0.55);
    }
    ctx.stroke();
    ctx.lineWidth = Math.max(1.5, trailWidth * 0.28) * scale;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.86)';
    ctx.stroke();
    ctx.restore();
  }
  ctx.rotate(frameConfig.rotate);
  ctx.globalAlpha *= frameConfig.alpha;
  ctx.shadowColor = attackState === 'swing' ? 'rgba(250, 204, 21, 0.72)' : 'rgba(0, 0, 0, 0.28)';
  ctx.shadowBlur = attackState === 'swing' ? 12 : 4;
  const drawn = drawPlayerWeaponAtlasRegion(
    ctx,
    assets,
    frameKey,
    {
      x: frameConfig.x * scale,
      y: frameConfig.y * scale,
      width: frameConfig.width * scale,
      height: frameConfig.height * scale,
    },
  );
  ctx.restore();

  if (drawn && stateRef.current.renderStats) {
    stateRef.current.renderStats.playerWeaponFrame = frameKey;
    stateRef.current.renderStats.playerWeaponVisualMode = `${assets?.weaponId || 'khopesh'}-sprite-atlas`;
  }
  return drawn;
}

export function drawPlayerFallbackCharacterFrame(ctx, x, y, w, h, direction, invuln, now, deps) {
  const {
    getPlayerAttackState,
    stateRef,
  } = deps;
  ctx.save();
  if (invuln > 0 && Math.floor(now / 100) % 2 === 0) ctx.globalAlpha = 0.3;

  const current = stateRef.current;
  const walkStyle = current.player.visualWalkStyle || 'none';
  const animationState = current.player.animationState || 'idle';
  const walkTempo = walkStyle === 'run' ? 72 : walkStyle === 'survey-walk' ? 180 : 105;
  const bob = animationState === 'land'
    ? 2
    : Math.sin(now / walkTempo) * (walkStyle === 'run' ? 3 : walkStyle === 'survey-walk' ? 1 : 2);
  const legSwing = Math.sin(now / Math.max(54, walkTempo * 0.72)) * (walkStyle === 'run' ? 11 : walkStyle === 'survey-walk' ? 5 : 8);
  const attackState = getPlayerAttackState(current);
  const movementLean = walkStyle === 'run' ? direction * 2 : walkStyle === 'survey-walk' ? -direction * 1.2 : 0;
  const attackLean = attackState === 'windup'
    ? -direction * 3
    : attackState === 'swing'
      ? direction * 7
      : attackState === 'recoil'
        ? -direction * 4
        : 0;
  const totalLean = attackLean + movementLean;

  ctx.fillStyle = 'rgba(0,0,0,0.36)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 2, w * 0.9, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#fff7d6';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.roundRect(x + 3 + totalLean, y + 5 + bob, 24, 28, 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w / 2 + totalLean, y + 4 + bob, 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#1f4f5f';
  ctx.beginPath();
  ctx.roundRect(x + 2 + totalLean, y + 8 + bob, 26, 25, 7);
  ctx.fill();
  ctx.strokeStyle = '#05111f';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#f2c36b';
  ctx.beginPath();
  ctx.arc(x + w / 2 + totalLean, y + 18 + bob, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#d69a5f';
  ctx.beginPath();
  ctx.arc(x + w / 2 + totalLean, y + 1 + bob, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3a2416';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = '#3a2416';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + totalLean + (direction > 0 ? 8 : 22), y + 11 + bob);
  ctx.lineTo(x + totalLean + (direction > 0 ? 22 : 8), y + 29 + bob);
  ctx.stroke();

  ctx.fillStyle = '#4b2f1c';
  ctx.strokeStyle = '#fff7d6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x + totalLean + (direction > 0 ? -6 : 0), y - 5 + bob, 36, 5, 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(x + totalLean + (direction > 0 ? 4 : 8), y - 13 + bob, 20, 10, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#7c3f18';
  ctx.beginPath();
  ctx.roundRect(x + totalLean + (direction > 0 ? -2 : 21), y + 13 + bob, 9, 16, 3);
  ctx.fill();
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.roundRect(x + totalLean + (direction > 0 ? 20 : 0), y + 18 + bob, 10, 8, 2);
  ctx.fill();

  const handX = x + totalLean + (direction > 0 ? 24 : 4);
  drawPlayerKhopeshFrame(ctx, handX, y + 19 + bob, attackState, direction, 0.9, deps);

  const moving = Math.abs(current.player.vx) > 0.1;
  const leftLegX = x + 7 + (moving ? (direction > 0 ? legSwing : -legSwing) * 0.25 : 0);
  const rightLegX = x + 17 + (moving ? (direction > 0 ? -legSwing : legSwing) * 0.25 : 0);
  ctx.fillStyle = '#10233b';
  ctx.fillRect(leftLegX, y + 31, 6, 12);
  ctx.fillRect(rightLegX, y + 31, 6, 12);
  ctx.fillStyle = '#241407';
  ctx.fillRect(leftLegX - 1, y + 41, 9, 4);
  ctx.fillRect(rightLegX - 1, y + 41, 9, 4);

  if (stateRef.current.notice && stateRef.current.notice.includes('near')) {
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 12px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('!', x + w / 2, y - 15 + bob);
  }

  ctx.restore();
}

export function drawPlayerSpriteFrame(ctx, x, y, w, h, direction, invuln, now, deps) {
  const {
    PLAYER_DODGE_DURATION,
    PLAYER_SPRITE_DRAW_HEIGHT,
    PLAYER_SPRITE_FRAME_COUNT,
    PLAYER_SPRITE_FRAME_HEIGHT,
    PLAYER_SPRITE_FRAME_WIDTH,
    clamp,
    getHeroSpriteFrameKey,
    getHeroSpriteFrameRowName,
    getHeroSpriteFrameScale,
    getHeroSpriteRowScale,
    getPlayerAttackState,
    drawContactShadow,
    drawGroundDustLip,
    getDesertEntryGroundContactActive,
    getDesertEntryVisualGroundOffsetY,
    isPlayerAttackVisualPhase,
    playerSpriteRef,
    stateRef,
  } = deps;
  const sprite = playerSpriteRef.current;
  if (!sprite.loaded || !sprite.image) {
    drawPlayerFallbackCharacterFrame(ctx, x, y, w, h, direction, invuln, now, deps);
    return;
  }

  const current = stateRef.current;
  const heroAtlas = sprite.mode === 'hero-atlas' ? sprite.atlas : null;
  const heroFrameKey = heroAtlas ? getHeroSpriteFrameKey(current, heroAtlas, now) : null;
  const usingDedicatedDodgeFrame = typeof heroFrameKey === 'string' && heroFrameKey.startsWith('dodge_');
  const heroRegion = heroFrameKey
    ? heroAtlas?.regions?.[heroFrameKey] || heroAtlas?.frames?.[heroFrameKey]
    : null;
  const heroFrameRowName = getHeroSpriteFrameRowName(heroAtlas, heroFrameKey);
  const frame = clamp(current.player.animationFrame ?? 1, 0, PLAYER_SPRITE_FRAME_COUNT - 1);
  const heroDrawBounds = heroRegion?.drawBounds || null;
  const sourceX = (heroRegion?.x ?? frame * PLAYER_SPRITE_FRAME_WIDTH) + (heroDrawBounds?.x || 0);
  const sourceY = (heroRegion?.y ?? 0) + (heroDrawBounds?.y || 0);
  const frameWidth = heroDrawBounds?.w || heroRegion?.w || PLAYER_SPRITE_FRAME_WIDTH;
  const frameHeight = heroDrawBounds?.h || heroRegion?.h || PLAYER_SPRITE_FRAME_HEIGHT;
  const heroDrawHeight = Number(heroAtlas?.draw?.height) || PLAYER_SPRITE_DRAW_HEIGHT;
  const atlasNominalHeight = Number(heroAtlas?.draw?.sourceHeight) || Number(heroAtlas?.frame?.height);
  const nominalFrameHeight = atlasNominalHeight
    || (heroRegion ? heroRegion.h : frameHeight)
    || frameHeight;
  const heroRowScale = getHeroSpriteRowScale(heroAtlas, heroFrameRowName);
  const heroFrameScale = getHeroSpriteFrameScale(heroAtlas, heroFrameKey);
  const drawScale = (heroDrawHeight / nominalFrameHeight) * heroRowScale * heroFrameScale;
  const drawWidth = frameWidth * drawScale;
  const renderedHeight = frameHeight * drawScale;
  const footX = x + w / 2;
  const footY = y + h + 1;
  const worldFootY = current.player.y + current.player.height;
  const desertEntryVisualGroundOffsetY = typeof getDesertEntryVisualGroundOffsetY === 'function'
    ? getDesertEntryVisualGroundOffsetY(current.player.x + current.player.width / 2, worldFootY, current)
    : 0;
  const desertEntryFootContactActive = typeof getDesertEntryGroundContactActive === 'function'
    ? getDesertEntryGroundContactActive(current.player.x + current.player.width / 2, worldFootY, current)
    : Boolean(desertEntryVisualGroundOffsetY);
  const drawX = -drawWidth / 2;
  const regionGroundLineY = Number(heroRegion?.groundLineY);
  const boundedGroundLineY = Number.isFinite(regionGroundLineY)
    ? regionGroundLineY - (heroDrawBounds?.y || 0)
    : null;
  const drawY = heroRegion && Number.isFinite(boundedGroundLineY)
    ? -boundedGroundLineY * drawScale
    : -renderedHeight;
  const attackState = getPlayerAttackState(current);
  const attackLean = attackState === 'windup'
    ? -direction * 3
    : attackState === 'swing'
      ? direction * 6
      : attackState === 'recoil'
        ? -direction * 4
        : 0;
  const animationState = current.player.animationState || 'idle';
  const walkStyle = current.player.visualWalkStyle || 'none';
  const movementLean = usingDedicatedDodgeFrame
    ? 0
    : walkStyle === 'run'
      ? direction * 2.5
      : walkStyle === 'survey-walk'
        ? -direction * 1.25
        : 0;
  const jumpLift = animationState === 'jump' ? -3 : animationState === 'fall' ? 1 : animationState === 'land' ? 2 : 0;
  const hurtShake = animationState === 'hurt' ? Math.sin(now / 24) * 2 : 0;
  const landingPulse = clamp((current.player.landingFeedbackTimer || 0) / 0.16, 0, 1);
  const dodgeProgress = current.dodgeTimer > 0
    ? clamp(current.dodgeTimer / PLAYER_DODGE_DURATION, 0, 1)
    : 0;
  const dodging = dodgeProgress > 0;
  const dodgeElapsedProgress = dodging ? 1 - dodgeProgress : 0;
  const dedicatedDodgeDuck = usingDedicatedDodgeFrame ? Math.sin(Math.PI * clamp(dodgeElapsedProgress, 0, 1)) : 0;
  const applyRuntimeDodgeEffects = dodging && !usingDedicatedDodgeFrame;
  const dodgeLean = applyRuntimeDodgeEffects ? (current.dodgeDirection || direction) * 14 * dodgeProgress : 0;
  const dodgeDuckSink = usingDedicatedDodgeFrame ? dedicatedDodgeDuck * 5 : 0;
  const squashX = applyRuntimeDodgeEffects ? 1 + dodgeProgress * 0.12 : 1 + landingPulse * 0.045 + dedicatedDodgeDuck * 0.035;
  const squashY = applyRuntimeDodgeEffects ? 1 - dodgeProgress * 0.08 : 1 - landingPulse * 0.035 - dedicatedDodgeDuck * 0.04;
  const knowledgeScale = current.player.knowledgeVisualScale || 1;
  const groundSpeed = Math.abs(current.player.vx || 0);
  const groundContactEnergy = clamp(groundSpeed / 260, 0, 1);

  ctx.save();
  if (invuln > 0 && !dodging && Math.floor(now / 100) % 2 === 0) ctx.globalAlpha = 0.34;

  // 1. DYNAMIC CAST SHADOW (AAA projected silhouette cast forward from the sunset)
  if (sprite.image && sprite.loaded) {
    ctx.save();

    // Scale Y by a negative factor to flip the silhouette forward (down the screen)
    const shadowScaleY = -0.32;
    // Skew X toward a consistent world-space sun direction (light from screen-right / west).
    // Using a fixed value prevents the shadow from flipping instantly when Asha reverses.
    const shadowSkewX = -0.34;
    const shadowOpacity = 0.30;
    const shadowBlur = 2.8;

    ctx.translate(footX, footY + 1);
    ctx.transform(1, 0, shadowSkewX, shadowScaleY, 0, 0);

    if (knowledgeScale > 1) {
      ctx.scale(knowledgeScale, knowledgeScale);
    }
    ctx.scale(squashX, squashY);
    if (direction < 0) ctx.scale(-1, 1);

    // Use the offscreen offset shadow rendering technique to bypass canvas filter bounding box bugs
    const shadowOffset = 5000;
    ctx.shadowColor = `rgba(28, 14, 6, ${shadowOpacity})`;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = shadowOffset;
    ctx.shadowOffsetY = 0;

    // Draw body silhouette offscreen (shifted left by shadowOffset)
    ctx.drawImage(
      sprite.image,
      sourceX,
      sourceY,
      frameWidth,
      frameHeight,
      drawX - shadowOffset,
      drawY,
      drawWidth,
      renderedHeight
    );

    // Draw projected weapon shadow silhouette offscreen (shifted left by shadowOffset)
    const suppressExternalWeapon = heroAtlas?.draw?.suppressExternalWeapon
      || (heroAtlas?.draw?.suppressExternalWeaponDuringAttack
        && isPlayerAttackVisualPhase(attackState));
    if (!suppressExternalWeapon) {
      drawPlayerKhopeshFrame(ctx, drawWidth * 0.34 - shadowOffset, -renderedHeight * 0.54, attackState, 1, 0.9, deps);
    }

    ctx.restore();
  }

  // 2. CONTACT SHADOW — runs in every section, only when Asha is grounded
  // desertEntryFootContactActive tells us we are on warm desert sand specifically.
  // For all other grounded surfaces we use a cooler stone/soil palette.
  const playerIsGrounded = Boolean(current.player.onGround);
  if (playerIsGrounded && typeof drawContactShadow === 'function') {
    const dodgeWidthMod = applyRuntimeDodgeEffects ? 1.62 : 1.52;
    const shadowWidth = w * dodgeWidthMod;
    // Base intensity raised so the shadow holds against textured backgrounds.
    // groundContactEnergy adds a subtle reactive pulse when Asha is running.
    const shadowIntensity = 0.36 + groundContactEnergy * 0.10;

    if (desertEntryFootContactActive) {
      // Warm desert sand palette — wide flat disc, orange-brown occlusion core
      drawContactShadow(
        ctx,
        footX,
        footY + 2,
        shadowWidth,
        shadowIntensity,
        0.9,
        {
          height: 16,
          color: 'rgba(32, 16, 4, 0.92)',
          coreOffsetX: direction * 2,
        },
      );
      // Desert-specific moving dust lip
      if (typeof drawGroundDustLip === 'function') {
        drawGroundDustLip(
          ctx,
          footX - direction * (7 + groundContactEnergy * 5),
          footY + 6,
          w * (1.44 + groundContactEnergy * 0.32),
          `rgba(204, 136, 52, ${0.22 + groundContactEnergy * 0.10})`,
        );
      }
      if (current.renderStats) {
        current.renderStats.desertEntryPlayerFootContact = 'warm-plaza-foot-shadow-v2';
      }
    } else {
      // Cool stone / soil palette — slightly narrower, darker to bite against textured floors
      drawContactShadow(
        ctx,
        footX,
        footY + 2,
        shadowWidth,
        shadowIntensity,
        0.9,
        {
          height: 14,
          color: 'rgba(14, 8, 4, 0.94)',
          coreOffsetX: direction * 2,
        },
      );
    }
  } else if (!playerIsGrounded) {
    // Airborne — no contact shadow drawn.
    void 0;
  } else {
    // drawContactShadow not available — plain fallback ellipse
    ctx.save();
    ctx.fillStyle = 'rgba(18, 10, 4, 0.50)';
    ctx.beginPath();
    ctx.ellipse(footX, footY + 2, w * 1.1, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. SPRITE DRAWING & REAL-TIME LIGHTING INTEGRATION
  ctx.save();

  // Set soft golden ambient bloom (rim light glow) before translating context
  ctx.shadowColor = 'rgba(253, 186, 116, 0.38)';
  ctx.shadowBlur = 5;

  ctx.translate(footX + attackLean + movementLean + hurtShake + dodgeLean, footY + jumpLift + dodgeDuckSink);
  if (knowledgeScale > 1) {
    ctx.shadowColor = 'rgba(250, 204, 21, 0.54)';
    ctx.shadowBlur = 18;
    ctx.scale(knowledgeScale, knowledgeScale);
  }
  ctx.scale(squashX, squashY);
  if (direction < 0) ctx.scale(-1, 1);

  // Create offscreen canvas for player sprite to apply real-time warm lighting grading
  // without blending with the main canvas's background pixels (which creates a box).
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = Math.ceil(drawWidth);
  tempCanvas.height = Math.ceil(renderedHeight);
  const tempCtx = tempCanvas.getContext('2d');

  if (tempCtx) {
    tempCtx.imageSmoothingEnabled = true;
    if (heroAtlas?.draw?.imageSmoothingQuality) {
      tempCtx.imageSmoothingQuality = heroAtlas.draw.imageSmoothingQuality;
    }
    tempCtx.drawImage(
      sprite.image,
      sourceX,
      sourceY,
      frameWidth,
      frameHeight,
      0,
      0,
      drawWidth,
      renderedHeight
    );

    // Apply real-time warm lighting grading (source-atop overlay of a sunset gradient)
    tempCtx.save();
    tempCtx.globalCompositeOperation = 'source-atop';
    const overlayGrad = tempCtx.createLinearGradient(0, 0, drawWidth, renderedHeight);
    overlayGrad.addColorStop(0, 'rgba(254, 215, 170, 0.28)'); // warm golden highlights
    overlayGrad.addColorStop(0.5, 'rgba(251, 146, 60, 0.12)'); // soft orange midtones
    overlayGrad.addColorStop(1, 'rgba(124, 45, 18, 0.22)'); // deep earthy shadow tones
    tempCtx.fillStyle = overlayGrad;
    tempCtx.fillRect(0, 0, drawWidth, renderedHeight);
    tempCtx.restore();

    // Draw the graded player sprite from the temp canvas onto the main canvas
    ctx.drawImage(tempCanvas, drawX, drawY);
  } else {
    ctx.imageSmoothingEnabled = true;
    if (heroAtlas?.draw?.imageSmoothingQuality) {
      ctx.imageSmoothingQuality = heroAtlas.draw.imageSmoothingQuality;
    }
    ctx.drawImage(
      sprite.image,
      sourceX,
      sourceY,
      frameWidth,
      frameHeight,
      drawX,
      drawY,
      drawWidth,
      renderedHeight
    );
  }

  if (current.renderStats && heroFrameKey) {
    current.renderStats.playerSpriteFrame = heroFrameKey;
    current.renderStats.playerSpriteVisualMode = 'hero-atlas';
    current.renderStats.playerSpriteRowScale = heroRowScale;
    current.renderStats.playerSpriteFrameScale = heroFrameScale;
  }

  const suppressExternalWeapon = heroAtlas?.draw?.suppressExternalWeapon
    || (heroAtlas?.draw?.suppressExternalWeaponDuringAttack
      && isPlayerAttackVisualPhase(attackState));
  if (!suppressExternalWeapon) {
    drawPlayerKhopeshFrame(ctx, drawWidth * 0.34, -renderedHeight * 0.54, attackState, 1, 0.9, deps);
  } else if (current.renderStats) {
    current.renderStats.playerWeaponVisualMode = 'integrated-hero-atlas';
  }

  ctx.restore();
  ctx.restore();

  if (stateRef.current.notice && stateRef.current.notice.includes('near')) {
    ctx.save();
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 12px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('!', x + w / 2, y - 18);
    ctx.restore();
  }
}
