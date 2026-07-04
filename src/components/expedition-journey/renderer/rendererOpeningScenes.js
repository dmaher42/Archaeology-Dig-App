export function drawOpeningSphinxDialogueFrame(ctx, encounter, screenX, screenY, alpha, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    OPENING_SPHINX_ARRIVAL_SECONDS,
    OPENING_SPHINX_LINE_SECONDS,
    SCARAB_SEAL_TRIGGER,
    clamp,
  } = deps;
  const boxWidth = 360;
  const lines = encounter.lines || [
    'These artefacts are protected.',
    'You will never reach the expedition site.',
    'Only those who prove themselves may pass.',
  ];
  const elapsed = encounter.duration - encounter.timer;
  const lineStart = Math.max(0, elapsed - OPENING_SPHINX_ARRIVAL_SECONDS);
  const visibleLineCount = clamp(
    Math.floor(lineStart / OPENING_SPHINX_LINE_SECONDS) + 1,
    1,
    lines.length,
  );
  const visibleLines = lines.slice(Math.max(0, visibleLineCount - 1), visibleLineCount);
  const boxHeight = 54 + visibleLines.length * 20;
  const placeLeftOfSphinx = screenX > CANVAS_WIDTH * 0.55;
  const usesPinnedDialogue = Number.isFinite(encounter.dialogueX);
  const boxX = usesPinnedDialogue
    ? clamp(encounter.dialogueX, 26, CANVAS_WIDTH - boxWidth - 26)
    : placeLeftOfSphinx
      ? clamp(screenX - boxWidth - 56, 26, CANVAS_WIDTH - boxWidth - 26)
      : clamp(screenX + 56, 26, CANVAS_WIDTH - boxWidth - 26);
  const boxY = Number.isFinite(encounter.dialogueY)
    ? clamp(encounter.dialogueY, 130, CANVAS_HEIGHT - boxHeight - 28)
    : clamp(screenY + 58, 152, CANVAS_HEIGHT - boxHeight - 28);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.38)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  const bubbleGradient = ctx.createLinearGradient(boxX, boxY, boxX + boxWidth, boxY + boxHeight);
  bubbleGradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
  bubbleGradient.addColorStop(1, 'rgba(69, 45, 21, 0.9)');
  ctx.fillStyle = bubbleGradient;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 12);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = '#facc15';
  ctx.font = '900 15px Outfit, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(encounter.name || SCARAB_SEAL_TRIGGER.eventName, boxX + 18, boxY + 25);
  ctx.fillStyle = '#fff4d4';
  ctx.font = '800 12px Outfit, sans-serif';
  visibleLines.forEach((line, index) => {
    ctx.fillText(line, boxX + 18, boxY + 50 + index * 18);
  });
  if (!usesPinnedDialogue) {
    ctx.beginPath();
    if (placeLeftOfSphinx) {
      ctx.moveTo(boxX + boxWidth - 74, boxY + 12);
      ctx.lineTo(screenX - 36, screenY + 34);
      ctx.lineTo(boxX + boxWidth - 30, boxY + 12);
    } else {
      ctx.moveTo(boxX + 30, boxY + 12);
      ctx.lineTo(screenX + 36, screenY + 34);
      ctx.lineTo(boxX + 74, boxY + 12);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(42, 31, 24, 0.9)';
    ctx.fill();
  }
  ctx.restore();
}

export function getOpeningSphinxSpriteFrame(encounter, now, deps) {
  if (!encounter) return 'ancientConstructIdle';
  const {
    OPENING_SPHINX_ARRIVAL_SECONDS,
    OPENING_SPHINX_EXIT_SECONDS,
    OPENING_SPHINX_LINE_SECONDS,
    clamp,
  } = deps;
  const elapsed = encounter.duration - encounter.timer;
  const reveal = clamp(elapsed / OPENING_SPHINX_ARRIVAL_SECONDS, 0, 1);
  const exitProgress = clamp((OPENING_SPHINX_EXIT_SECONDS - encounter.timer) / OPENING_SPHINX_EXIT_SECONDS, 0, 1);
  if (exitProgress > 0.08) {
    return Math.floor(now / 180) % 2 === 0 ? 'ancientConstructWalk1' : 'ancientConstructWalk2';
  }
  if (reveal < 0.8) return 'ancientConstructIntro';
  const lineIndex = Math.floor(elapsed / OPENING_SPHINX_LINE_SECONDS);
  if (lineIndex === 1 || lineIndex === 2) return 'ancientConstructPulse';
  return 'ancientConstructIdle';
}

export function drawOpeningCinematicFrame(ctx, cinematic, now, deps) {
  if (!cinematic || cinematic.timer <= 0) return;
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    clamp,
    getOpeningCinematicLine,
  } = deps;
  const elapsed = clamp(cinematic.duration - cinematic.timer, 0, cinematic.duration);
  const progress = clamp(elapsed / cinematic.duration, 0, 1);
  const pulse = 0.5 + Math.sin(now / 360) * 0.18;

  ctx.save();
  ctx.fillStyle = `rgba(2, 6, 23, ${0.24 + progress * 0.08})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = 'rgba(3, 7, 18, 0.92)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 58);
  ctx.fillRect(0, CANVAS_HEIGHT - 58, CANVAS_WIDTH, 58);

  const sealX = CANVAS_WIDTH * 0.58;
  const sealY = CANVAS_HEIGHT * 0.56;
  const glow = ctx.createRadialGradient(sealX, sealY, 20, sealX, sealY, CANVAS_WIDTH * 0.42);
  glow.addColorStop(0, `rgba(125, 211, 252, ${0.14 + pulse * 0.08})`);
  glow.addColorStop(0.36, `rgba(250, 204, 21, ${0.08 + pulse * 0.05})`);
  glow.addColorStop(1, 'rgba(2, 6, 23, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = `rgba(250, 204, 21, ${0.35 + pulse * 0.22})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 82 + Math.sin(now / 280) * 4, 0, Math.PI * 2);
  ctx.stroke();

  const activeLine = getOpeningCinematicLine(cinematic);
  if (activeLine) {
    ctx.fillStyle = activeLine.voice === 'guardian' ? '#93c5fd' : '#facc15';
    ctx.font = '900 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${activeLine.speaker.toUpperCase()} SPEAKS`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 31);
  }
  ctx.restore();
}

export function drawOpeningSphinxEncounterFrame(ctx, encounter, cameraX, now, deps) {
  if (!encounter || encounter.timer <= 0) return;
  const {
    ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON,
    CANVAS_WIDTH,
    OPENING_SPHINX_APPARITION_SRC,
    OPENING_SPHINX_ARRIVAL_SECONDS,
    OPENING_SPHINX_EXIT_SECONDS,
    OPENING_SPHINX_SCREEN_Y_OFFSET,
    OPENING_SPHINX_SPRITE_BOSS_ID,
    OPENING_SPHINX_SPRITE_VERSION,
    bossSpriteAssetsRef,
    clamp,
    drawAtlasRegion,
    drawContactShadow,
    getBossSpritePack,
    openingSphinxApparitionRef,
    shouldFlipBossSprite,
    stateRef,
    worldToScreenX,
  } = deps;
  const elapsed = encounter.duration - encounter.timer;
  const reveal = clamp(elapsed / OPENING_SPHINX_ARRIVAL_SECONDS, 0, 1);
  const exitProgress = clamp((OPENING_SPHINX_EXIT_SECONDS - encounter.timer) / OPENING_SPHINX_EXIT_SECONDS, 0, 1);
  const alpha = clamp(reveal * (1 - exitProgress * 0.72), 0, 1);
  if (alpha <= 0.02) return;

  const baseScreenX = worldToScreenX(encounter.x, cameraX);
  const easedReveal = 1 - Math.pow(1 - reveal, 3);
  const arrivalLift = (1 - easedReveal) * 46;
  const sx = baseScreenX + exitProgress * 220;
  const sy = encounter.y + OPENING_SPHINX_SCREEN_Y_OFFSET + arrivalLift + Math.sin(now / 260) * 4 - exitProgress * 190;
  if (sx < -220 || sx > CANVAS_WIDTH + 220) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  drawContactShadow(ctx, sx, sy + 124, 158, 0.22 * (1 - exitProgress), 1.2);
  if (reveal < 1 && exitProgress <= 0) {
    ctx.save();
    ctx.globalAlpha = alpha * (1 - reveal) * 0.75;
    ctx.fillStyle = 'rgba(210, 160, 92, 0.34)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 124, 110 + reveal * 32, 16 + reveal * 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const apparitionAsset = openingSphinxApparitionRef.current;
  const spritePack = getBossSpritePack(bossSpriteAssetsRef.current, OPENING_SPHINX_SPRITE_BOSS_ID);
  const frameKey = getOpeningSphinxSpriteFrame(encounter, now, deps);
  const apparitionHeight = 318;
  const apparitionWidth = apparitionAsset.loaded && apparitionAsset.image
    ? apparitionHeight * (apparitionAsset.image.naturalWidth / apparitionAsset.image.naturalHeight)
    : 246;
  let drawBox = {
    x: sx - apparitionWidth / 2,
    y: sy + 126 - apparitionHeight,
    width: apparitionWidth,
    height: apparitionHeight,
  };
  let sphinxSpriteDrawn = false;

  if (apparitionAsset.loaded && apparitionAsset.image) {
    const projectionReveal = encounter.silhouetteReveal
      ? clamp((elapsed - 2.4) / 4.2, 0, 1)
      : 1;
    const apparitionAlpha = encounter.silhouetteReveal
      ? 0.3 + projectionReveal * 0.58
      : 1;
    const projectionClipHeight = encounter.silhouetteReveal
      ? drawBox.height * (0.62 + projectionReveal * 0.38)
      : drawBox.height;
    ctx.save();
    ctx.globalAlpha *= apparitionAlpha;
    ctx.shadowColor = 'rgba(70, 214, 235, 0.2)';
    ctx.shadowBlur = 12 + reveal * 8;
    if (projectionClipHeight < drawBox.height) {
      ctx.beginPath();
      ctx.rect(drawBox.x, drawBox.y, drawBox.width, projectionClipHeight);
      ctx.clip();
    }
    ctx.drawImage(apparitionAsset.image, drawBox.x, drawBox.y, drawBox.width, drawBox.height);
    ctx.restore();
    if (encounter.silhouetteReveal && projectionReveal < 0.35) {
      ctx.save();
      ctx.globalAlpha = alpha * (0.55 - projectionReveal * 0.35);
      ctx.shadowColor = 'rgba(125, 211, 252, 0.75)';
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(147, 197, 253, 0.72)';
      ctx.beginPath();
      ctx.ellipse(sx - 15, drawBox.y + 74, 5.5, 3.2, 0, 0, Math.PI * 2);
      ctx.ellipse(sx + 18, drawBox.y + 74, 5.5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    sphinxSpriteDrawn = true;
    if (stateRef.current.renderStats) {
      stateRef.current.renderStats.openingSphinxSpriteLoaded = true;
      stateRef.current.renderStats.openingSphinxSpriteVersion = OPENING_SPHINX_SPRITE_VERSION;
      stateRef.current.renderStats.openingSphinxSpriteModel = 'opening-anubis-apparition';
      stateRef.current.renderStats.openingSphinxSpriteFrame = 'openingAnubisApparition';
      stateRef.current.renderStats.openingSphinxSpriteAtlasPath = OPENING_SPHINX_APPARITION_SRC;
    }
  } else if (spritePack) {
    const spriteHeight = 226;
    const spriteWidth = 278;
    drawBox = {
      x: sx - spriteWidth / 2,
      y: sy + 126 - spriteHeight,
      width: spriteWidth,
      height: spriteHeight,
    };
    const shouldFlip = shouldFlipBossSprite(OPENING_SPHINX_SPRITE_BOSS_ID, -1);
    ctx.save();
    if (shouldFlip) {
      ctx.translate(drawBox.x + drawBox.width / 2, 0);
      ctx.scale(-1, 1);
    }
    sphinxSpriteDrawn = drawAtlasRegion(
      ctx,
      spritePack,
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
  }

  if (sphinxSpriteDrawn && !apparitionAsset.loaded && stateRef.current.renderStats) {
    stateRef.current.renderStats.openingSphinxSpriteLoaded = true;
    stateRef.current.renderStats.openingSphinxSpriteVersion = OPENING_SPHINX_SPRITE_VERSION;
    stateRef.current.renderStats.openingSphinxSpriteModel = OPENING_SPHINX_SPRITE_BOSS_ID;
    stateRef.current.renderStats.openingSphinxSpriteFrame = frameKey;
    stateRef.current.renderStats.openingSphinxSpriteAtlasPath = ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON;
  }

  if (!sphinxSpriteDrawn) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(1.08, 1.08);
    ctx.strokeStyle = 'rgba(44, 27, 12, 0.78)';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#b7792e';
    ctx.beginPath();
    ctx.ellipse(-10, 52, 82, 36, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d6a354';
    ctx.beginPath();
    ctx.ellipse(48, 30, 34, 26, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f2c86b';
    ctx.beginPath();
    ctx.roundRect(24, -4, 42, 34, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#654321';
    [-48, -12, 24, 58].forEach((legX) => {
      ctx.beginPath();
      ctx.roundRect(legX, 72, 12, 42, 5);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }
  ctx.restore();

  if (!encounter.suppressDialogue) {
    drawOpeningSphinxDialogueFrame(ctx, encounter, sx, sy, alpha, deps);
  }
}

export function drawOpeningThresholdSceneFrame(ctx, scene, cameraX, now, deps) {
  if (!scene || scene.timer <= 0) return;
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GROUND_Y,
    OPENING_THRESHOLD_FADE_SECONDS,
    OPENING_THRESHOLD_STAIR_REVEAL_SECONDS,
    OPENING_TOMB_STAIRWELL_VERSION,
    SCARAB_SEAL_TRIGGER,
    clamp,
    getOpeningThresholdDialogueLine,
    openingTombStairwellRef,
    stateRef,
    worldToScreenX,
  } = deps;
  const elapsed = clamp(scene.duration - scene.timer, 0, scene.duration);
  const sealX = worldToScreenX(SCARAB_SEAL_TRIGGER.x, cameraX);
  const reveal = clamp((OPENING_THRESHOLD_STAIR_REVEAL_SECONDS - scene.timer) / OPENING_THRESHOLD_STAIR_REVEAL_SECONDS, 0, 1);
  const fade = clamp((OPENING_THRESHOLD_FADE_SECONDS - scene.timer) / OPENING_THRESHOLD_FADE_SECONDS, 0, 1);
  const activeLine = getOpeningThresholdDialogueLine(scene);

  ctx.save();
  const vignette = ctx.createRadialGradient(sealX, CANVAS_HEIGHT * 0.62, 80, sealX, CANVAS_HEIGHT * 0.62, CANVAS_WIDTH * 0.82);
  vignette.addColorStop(0, `rgba(15, 23, 42, ${0.05 + reveal * 0.08})`);
  vignette.addColorStop(0.52, 'rgba(15, 23, 42, 0.08)');
  vignette.addColorStop(1, `rgba(3, 7, 18, ${0.28 + reveal * 0.18 + fade * 0.36})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const projectionBuild = clamp((elapsed - 1.15) / 8.5, 0, 1) * (1 - fade * 0.45);
  if (projectionBuild > 0) {
    const drift = Math.sin(now / 620) * 10;
    const projectionTopY = 112;
    const projectionBaseY = GROUND_Y - 42;
    const beam = ctx.createLinearGradient(sealX, projectionTopY, sealX, projectionBaseY);
    beam.addColorStop(0, `rgba(125, 211, 252, ${0.02 * projectionBuild})`);
    beam.addColorStop(0.42, `rgba(56, 189, 248, ${0.1 * projectionBuild})`);
    beam.addColorStop(1, `rgba(250, 204, 21, ${0.06 * projectionBuild})`);
    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(sealX - 20 - projectionBuild * 48 + drift * 0.2, projectionBaseY);
    ctx.quadraticCurveTo(sealX - 78 + drift, 320, sealX - 34, projectionTopY);
    ctx.lineTo(sealX + 54, projectionTopY + 22);
    ctx.quadraticCurveTo(sealX + 76 - drift, 328, sealX + 28 + projectionBuild * 50 + drift * 0.18, projectionBaseY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(125, 211, 252, ${0.18 * projectionBuild})`;
    ctx.lineWidth = 1.2;
    [0, 1, 2].forEach((line) => {
      const lineOffset = (line - 1) * 38 + Math.sin(now / 520 + line) * 5;
      ctx.beginPath();
      ctx.moveTo(sealX + lineOffset * 0.34, projectionBaseY - 8);
      ctx.quadraticCurveTo(sealX + lineOffset, 330, sealX + lineOffset * 0.4, projectionTopY + 24);
      ctx.stroke();
    });
    ctx.restore();
  }

  const eyeGlint = clamp((elapsed - 0.45) / 0.8, 0, 1) * (1 - clamp((elapsed - 5.6) / 1.4, 0, 1));
  if (eyeGlint > 0) {
    const glintPulse = 0.72 + Math.sin(now / 180) * 0.18;
    const eyeX = sealX + 338;
    const eyeY = 188;
    ctx.save();
    ctx.globalAlpha = eyeGlint * glintPulse;
    ctx.shadowColor = 'rgba(125, 211, 252, 0.78)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(147, 197, 253, 0.76)';
    ctx.beginPath();
    ctx.ellipse(eyeX - 15, eyeY, 4.8, 2.4, -0.08, 0, Math.PI * 2);
    ctx.ellipse(eyeX + 15, eyeY, 4.8, 2.4, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const cueTimes = [6.2, 10.8, 14.8, 18.6, 22.8, 26.5, 31.5];
  cueTimes.forEach((cueTime, index) => {
    const cue = 1 - clamp(Math.abs(elapsed - cueTime) / 1.35, 0, 1);
    if (cue <= 0) return;
    const side = index % 2 === 0 ? -1 : 1;
    const cueX = sealX + side * (92 + index * 9);
    const cueY = GROUND_Y - 244 + (index % 3) * 36;
    ctx.save();
    ctx.globalAlpha = cue * 0.52;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.58)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cueX - 16, cueY);
    ctx.lineTo(cueX + 18, cueY + Math.sin(now / 180 + index) * 4);
    ctx.stroke();
    ctx.fillStyle = 'rgba(125, 211, 252, 0.45)';
    for (let mote = 0; mote < 4; mote += 1) {
      const fall = ((now / 38 + mote * 17 + index * 23) % 48) * cue;
      ctx.beginPath();
      ctx.arc(cueX + mote * 9 - 12, cueY + fall, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  const fissureCues = [11.9, 18.6, 26.5, 29.8];
  fissureCues.forEach((cueTime, index) => {
    const cue = 1 - clamp(Math.abs(elapsed - cueTime) / 1.1, 0, 1);
    if (cue <= 0) return;
    const width = 86 + index * 38;
    const y = GROUND_Y - 20 + Math.sin(now / 190 + index) * 2;
    ctx.save();
    ctx.globalAlpha = cue * 0.62;
    ctx.strokeStyle = index === fissureCues.length - 1 ? 'rgba(125, 211, 252, 0.72)' : 'rgba(250, 204, 21, 0.48)';
    ctx.lineWidth = 1.6 + cue * 1.4;
    ctx.shadowColor = index === fissureCues.length - 1 ? 'rgba(56, 189, 248, 0.42)' : 'rgba(245, 158, 11, 0.28)';
    ctx.shadowBlur = 8 + cue * 12;
    ctx.beginPath();
    ctx.moveTo(sealX - width, y);
    for (let step = 0; step <= 6; step += 1) {
      const x = sealX - width + (width * 2 * step) / 6;
      const jag = Math.sin(now / 130 + step * 1.7 + index) * 4 + (step % 2 === 0 ? -4 : 4) * cue;
      ctx.lineTo(x, y + jag);
    }
    ctx.stroke();
    ctx.restore();
  });

  if (elapsed > 2.4) {
    const rumble = Math.sin(now / 84) * 2.5;
    const revealEase = reveal * reveal * (3 - 2 * reveal);
    const stairX = sealX - 10;
    const mouthY = GROUND_Y - 22;
    const shaftTopY = GROUND_Y - 126 - revealEase * 18;
    const halfMouthWidth = 94 + revealEase * 50;
    const tombStairwellAsset = openingTombStairwellRef.current;
    const stairGlow = ctx.createRadialGradient(stairX, GROUND_Y - 58 + rumble, 8, stairX, GROUND_Y - 58 + rumble, 226);
    stairGlow.addColorStop(0, 'rgba(125, 211, 252, 0.72)');
    stairGlow.addColorStop(0.45, 'rgba(14, 165, 233, 0.22)');
    stairGlow.addColorStop(1, 'rgba(14, 116, 144, 0)');
    ctx.globalAlpha = 0.18 + revealEase * 0.34;
    ctx.fillStyle = stairGlow;
    ctx.fillRect(stairX - 252, GROUND_Y - 270, 504, 306);

    const tombAssetDrawn = Boolean(tombStairwellAsset.loaded && tombStairwellAsset.image);
    if (tombAssetDrawn) {
      const assetWidth = 332 + revealEase * 92;
      const assetHeight = assetWidth * (tombStairwellAsset.image.height / tombStairwellAsset.image.width);
      const assetX = stairX - assetWidth / 2;
      const assetY = mouthY + 44 - assetHeight;
      ctx.save();
      ctx.globalAlpha = 0.68 + revealEase * 0.32;
      ctx.filter = 'sepia(5%) saturate(98%) brightness(94%) contrast(104%) drop-shadow(0 14px 18px rgba(4, 12, 20, 0.34))';
      ctx.drawImage(tombStairwellAsset.image, assetX, assetY, assetWidth, assetHeight);
      ctx.restore();
      if (stateRef.current.renderStats) {
        stateRef.current.renderStats.openingTombStairwellAssetVersion = OPENING_TOMB_STAIRWELL_VERSION;
        stateRef.current.renderStats.openingTombStairwellAssetLoaded = true;
      }
    } else {
      ctx.globalAlpha = 0.2 + revealEase * 0.46;
      const shaftGradient = ctx.createLinearGradient(stairX, shaftTopY, stairX, mouthY + 18);
      shaftGradient.addColorStop(0, 'rgba(14, 116, 144, 0.5)');
      shaftGradient.addColorStop(0.46, 'rgba(8, 47, 73, 0.72)');
      shaftGradient.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
      ctx.fillStyle = shaftGradient;
      ctx.beginPath();
      ctx.moveTo(stairX - 50 - revealEase * 36, shaftTopY);
      ctx.lineTo(stairX + 50 + revealEase * 36, shaftTopY);
      ctx.lineTo(stairX + halfMouthWidth, mouthY + 9);
      ctx.lineTo(stairX - halfMouthWidth, mouthY + 9);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 0.46 + revealEase * 0.32;
      ctx.fillStyle = 'rgba(5, 18, 28, 0.72)';
      ctx.beginPath();
      ctx.ellipse(stairX, mouthY, halfMouthWidth, 23 + revealEase * 9, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.52 + revealEase * 0.26;
      ctx.strokeStyle = 'rgba(211, 170, 98, 0.62)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(stairX, mouthY - 2, halfMouthWidth + 12, 28 + revealEase * 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.24 + revealEase * 0.28;
      ctx.strokeStyle = 'rgba(255, 236, 179, 0.54)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(stairX, mouthY - 6, halfMouthWidth + 22, 34 + revealEase * 8, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 0.32 + revealEase * 0.42;
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.72)';
      ctx.lineWidth = 2.4;
      for (let index = 0; index < 7; index += 1) {
        const stepDepth = index / 6;
        const y = mouthY - 18 - index * (14 + revealEase * 2.5);
        const stepHalfWidth = 52 + stepDepth * 68 + revealEase * 14;
        ctx.beginPath();
        ctx.moveTo(stairX - stepHalfWidth, y + Math.sin(now / 180 + index) * 0.8);
        ctx.lineTo(stairX + stepHalfWidth, y + Math.sin(now / 180 + index) * 0.8);
        ctx.stroke();
        ctx.globalAlpha *= 0.94;
      }

      [-1, 1].forEach((side) => {
        const torchX = stairX + side * (82 + revealEase * 18);
        const flameY = mouthY - 64 + Math.sin(now / 170 + side) * 2;
        ctx.globalAlpha = (0.16 + revealEase * 0.34) * (0.82 + Math.sin(now / 120 + side) * 0.12);
        ctx.fillStyle = 'rgba(96, 165, 250, 0.78)';
        ctx.beginPath();
        ctx.ellipse(torchX, flameY, 7 + revealEase * 3, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(250, 204, 21, 0.42)';
        ctx.beginPath();
        ctx.ellipse(torchX, flameY + 4, 3.5, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    if (scene.playerX != null && scene.playerY != null) {
      const playerScreenX = worldToScreenX(scene.playerX + 18, cameraX);
      const playerScreenY = scene.playerFallEndY ?? scene.playerY;
      const clarityGradient = ctx.createRadialGradient(
        playerScreenX,
        playerScreenY + 42,
        16,
        playerScreenX,
        playerScreenY + 42,
        78,
      );
      clarityGradient.addColorStop(0, 'rgba(252, 211, 77, 0.16)');
      clarityGradient.addColorStop(0.55, 'rgba(252, 211, 77, 0.06)');
      clarityGradient.addColorStop(1, 'rgba(252, 211, 77, 0)');
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = clarityGradient;
      ctx.fillRect(playerScreenX - 86, playerScreenY - 18, 172, 138);
    }
    ctx.globalAlpha = 1;
  }

  if (activeLine) {
    const guardianSpeaker = activeLine.speaker === 'Anubis' || activeLine.speaker === 'Sphinx';
    const boxWidth = guardianSpeaker ? 430 : 390;
    const textMaxWidth = boxWidth - 36;
    ctx.font = '900 18px Georgia, serif';
    const words = activeLine.text.split(' ');
    const wrappedLines = words.reduce((lines, word) => {
      const currentLine = lines[lines.length - 1] || '';
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      return ctx.measureText(candidate).width <= textMaxWidth
        ? [...lines.slice(0, -1), candidate]
        : [...lines, word];
    }, ['']).filter(Boolean);
    const dialogueBoxHeight = 54 + Math.max(1, wrappedLines.length) * 24;
    const boxX = guardianSpeaker ? 42 : 54;
    const boxY = 112;
    ctx.globalAlpha = clamp((elapsed - activeLine.at) * 1.8, 0, 1);
    ctx.fillStyle = guardianSpeaker
      ? 'rgba(15, 23, 42, 0.84)'
      : 'rgba(255, 248, 225, 0.86)';
    ctx.strokeStyle = guardianSpeaker
      ? 'rgba(125, 211, 252, 0.62)'
      : 'rgba(146, 64, 14, 0.38)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, dialogueBoxHeight, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = guardianSpeaker ? '#93c5fd' : '#92400e';
    ctx.font = '900 12px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(activeLine.speaker.toUpperCase(), boxX + 18, boxY + 24);
    ctx.fillStyle = guardianSpeaker ? '#fff7ed' : '#3f2a18';
    ctx.font = '900 18px Georgia, serif';
    wrappedLines.forEach((line, index) => {
      ctx.fillText(line, boxX + 18, boxY + 52 + index * 23);
    });
    ctx.globalAlpha = 1;
  }

  if (fade > 0) {
    ctx.globalAlpha = fade;
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function drawArrivalThresholdSceneFrame(ctx, current, now, deps) {
  const {
    ARRIVAL_THRESHOLD_ASSET_VERSION,
    ARRIVAL_THRESHOLD_LEFT_BOUND,
    ARRIVAL_THRESHOLD_LEFT_INSPECT_X,
    ARRIVAL_THRESHOLD_RIGHT_BOUND,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GROUND_Y,
    arrivalThresholdBackgroundRef,
    arrivalThresholdDoorwayGlowRef,
    arrivalThresholdSealVeilRef,
    arrivalThresholdAwakenedRef,
    arrivalThresholdGlowCanvasRef,
    clamp,
  } = deps;
  const asset = arrivalThresholdBackgroundRef.current;
  const glowAsset = arrivalThresholdDoorwayGlowRef?.current;
  const sealVeilAsset = arrivalThresholdSealVeilRef?.current;
  const playerCenter = current.player.x + current.player.width / 2;
  const travelProgress = clamp(
    (playerCenter - ARRIVAL_THRESHOLD_LEFT_BOUND) / (ARRIVAL_THRESHOLD_RIGHT_BOUND - ARRIVAL_THRESHOLD_LEFT_BOUND),
    0,
    1,
  );
  let panX = 0;

  ctx.save();
  if (asset.loaded && asset.image) {
    const scale = CANVAS_HEIGHT / (asset.image.naturalHeight || asset.image.height || CANVAS_HEIGHT);
    const drawWidth = (asset.image.naturalWidth || asset.image.width || CANVAS_WIDTH) * scale;
    panX = Math.max(0, drawWidth - CANVAS_WIDTH) * travelProgress;
    ctx.drawImage(asset.image, -panX, 0, drawWidth, CANVAS_HEIGHT);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#07080a');
    gradient.addColorStop(0.55, '#20140f');
    gradient.addColorStop(1, '#6f4522');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = 'rgba(191, 124, 49, 0.22)';
    ctx.fillRect(CANVAS_WIDTH * 0.68, 86, 235, 422);
    ctx.fillStyle = 'rgba(21, 13, 10, 0.72)';
    ctx.fillRect(98, 230, 245, 235);
  }

  const floorGradient = ctx.createLinearGradient(0, GROUND_Y - 64, 0, CANVAS_HEIGHT);
  floorGradient.addColorStop(0, 'rgba(118, 71, 31, 0)');
  floorGradient.addColorStop(1, 'rgba(26, 15, 10, 0.58)');
  ctx.fillStyle = floorGradient;
  ctx.fillRect(0, GROUND_Y - 64, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y + 64);

  // Room "wakes up": keep the dormant plate as the base and additively reveal the light
  // difference toward the awakened plate, ramped by wakeProgress. Built once into an
  // offscreen canvas (awakened minus dormant), then added with 'lighter' — the room
  // ignites instead of cross-fading (no morph).
  const wakeRaw = clamp(current.arrivalThresholdWakeProgress || 0, 0, 1);
  const awakenedImage = arrivalThresholdAwakenedRef?.current?.image || null;
  if (wakeRaw > 0 && asset.image && awakenedImage) {
    let glowCanvas = arrivalThresholdGlowCanvasRef?.current || null;
    if (!glowCanvas) {
      const gw = awakenedImage.naturalWidth || awakenedImage.width || CANVAS_WIDTH;
      const gh = awakenedImage.naturalHeight || awakenedImage.height || CANVAS_HEIGHT;
      glowCanvas = document.createElement('canvas');
      glowCanvas.width = gw;
      glowCanvas.height = gh;
      const glowCtx = glowCanvas.getContext('2d');
      glowCtx.drawImage(awakenedImage, 0, 0, gw, gh);
      glowCtx.globalCompositeOperation = 'difference';
      glowCtx.drawImage(asset.image, 0, 0, gw, gh);
      if (arrivalThresholdGlowCanvasRef) arrivalThresholdGlowCanvasRef.current = glowCanvas;
    }
    const wakeDrawWidth = (asset.image.naturalWidth || asset.image.width || CANVAS_WIDTH)
      * (CANVAS_HEIGHT / (asset.image.naturalHeight || asset.image.height || CANVAS_HEIGHT));
    const wakeEased = wakeRaw * wakeRaw * (3 - 2 * wakeRaw);
    const wakeFlicker = 0.95 + Math.sin(now / 250) * 0.035 + Math.sin(now / 105) * 0.018;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(wakeEased * wakeFlicker, 0, 1);
    ctx.drawImage(glowCanvas, -panX, 0, wakeDrawWidth, CANVAS_HEIGHT);
    ctx.restore();
  }

  const trialComplete = Boolean(current.arrivalThresholdTrial?.completed);
  const barrierApproach = clamp((ARRIVAL_THRESHOLD_LEFT_INSPECT_X + 220 - playerCenter) / 260, 0, 1);
  const barrierActive = !trialComplete && !current.arrivalThresholdExitTransition && barrierApproach > 0.01;
  if (barrierActive) {
    if (sealVeilAsset?.loaded && sealVeilAsset.image) {
      const sealScale = CANVAS_HEIGHT / (sealVeilAsset.image.naturalHeight || sealVeilAsset.image.height || CANVAS_HEIGHT);
      const sealDrawWidth = (sealVeilAsset.image.naturalWidth || sealVeilAsset.image.width || CANVAS_WIDTH) * sealScale;
      const barrierPulse = 0.78 + Math.sin(now / 520) * 0.08 + Math.sin(now / 1370) * 0.04;
      ctx.save();
      ctx.globalAlpha = clamp(barrierApproach * barrierPulse, 0, 0.88);
      ctx.drawImage(sealVeilAsset.image, -panX, 0, sealDrawWidth, CANVAS_HEIGHT);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = clamp(barrierApproach * (0.08 + Math.sin(now / 360) * 0.025), 0.04, 0.12);
      ctx.drawImage(sealVeilAsset.image, -panX, 0, sealDrawWidth, CANVAS_HEIGHT);
      ctx.restore();
    }
  }

  for (let index = 0; index < 36; index += 1) {
    const seed = index * 67.7;
    const x = (seed + now * 0.006 * (1 + (index % 3))) % (CANVAS_WIDTH + 80) - 40;
    const y = 92 + ((index * 41) % 420);
    const alpha = 0.08 + ((index % 5) * 0.018);
    ctx.fillStyle = `rgba(245, 197, 116, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y + Math.sin(now / 780 + index) * 5, 1.2 + (index % 3) * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  if (current.renderStats) {
    current.renderStats.parallaxLayersActive = true;
    current.renderStats.activeBackgroundSection = 'arrival-threshold';
    current.renderStats.backgroundDepthMode = 'arrival-threshold-final-art-v1';
    current.renderStats.arrivalThresholdAssetLoaded = Boolean(asset.loaded && asset.image);
    current.renderStats.arrivalThresholdDoorwayGlowLoaded = Boolean(glowAsset?.loaded && glowAsset.image);
    current.renderStats.arrivalThresholdSealVeilLoaded = Boolean(sealVeilAsset?.loaded && sealVeilAsset.image);
    current.renderStats.arrivalThresholdSealVeilActive = Boolean(barrierActive);
    current.renderStats.arrivalThresholdAssetVersion = ARRIVAL_THRESHOLD_ASSET_VERSION;
    current.renderStats.arrivalThresholdWakeProgress = Number((current.arrivalThresholdWakeProgress || 0).toFixed(2));
  }

  if (current.arrivalThresholdExitTransition) {
    const progress = clamp(
      (current.arrivalThresholdExitTransition.timer || 0)
        / (current.arrivalThresholdExitTransition.duration || 1),
      0,
      1,
    );
    ctx.globalAlpha = 0.72 * progress;
    const fade = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
    fade.addColorStop(0, 'rgba(246, 218, 160, 0.46)');
    fade.addColorStop(0.18, 'rgba(19, 76, 84, 0.62)');
    fade.addColorStop(0.54, 'rgba(5, 18, 25, 0.16)');
    fade.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  return true;
}

export function drawArrivalThresholdDoorwayOccluderFrame(ctx, current, now, deps) {
  if (!current?.arrivalThresholdActive) return false;
  const {
    ARRIVAL_THRESHOLD_LEFT_BOUND,
    ARRIVAL_THRESHOLD_RIGHT_BOUND,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    arrivalThresholdDoorwayOccluderRef,
    clamp,
  } = deps;
  const asset = arrivalThresholdDoorwayOccluderRef?.current;
  if (!asset?.loaded || !asset.image) return false;
  const playerCenter = current.player.x + current.player.width / 2;
  const travelProgress = clamp(
    (playerCenter - ARRIVAL_THRESHOLD_LEFT_BOUND) / (ARRIVAL_THRESHOLD_RIGHT_BOUND - ARRIVAL_THRESHOLD_LEFT_BOUND),
    0,
    1,
  );
  const scale = CANVAS_HEIGHT / (asset.image.naturalHeight || asset.image.height || CANVAS_HEIGHT);
  const drawWidth = (asset.image.naturalWidth || asset.image.width || CANVAS_WIDTH) * scale;
  const panX = Math.max(0, drawWidth - CANVAS_WIDTH) * travelProgress;
  ctx.save();
  ctx.globalAlpha = 0.98;
  ctx.drawImage(asset.image, -panX, 0, drawWidth, CANVAS_HEIGHT);
  ctx.restore();
  if (current.renderStats) {
    current.renderStats.arrivalThresholdDoorwayOccluderLoaded = true;
  }
  return true;
}

export function drawArrivalThresholdTrialFrame(ctx, current, now, deps) {
  const {
    ARRIVAL_THRESHOLD_ECHO_SPAWN_SECONDS = 0.85,
    arrivalThresholdDuatEchoRef,
    clamp,
    getArrivalThresholdEchoHitbox,
    getArrivalThresholdGroundY,
  } = deps;
  const trial = current.arrivalThresholdTrial;
  const echo = trial?.echo || trial?.defeatedEcho;
  if (!current.arrivalThresholdActive || !trial || !echo) return false;
  const hitbox = getArrivalThresholdEchoHitbox(echo);
  if (!hitbox) return false;
  const cameraX = current.cameraX || 0;
  const x = hitbox.x - cameraX;
  const y = hitbox.y;
  const pulse = 0.7 + Math.sin(now / 220 + (echo.timer || 0) * 3) * 0.18;
  const spawnProgress = clamp(1 - ((echo.spawnTimer || 0) / ARRIVAL_THRESHOLD_ECHO_SPAWN_SECONDS), 0, 1);
  const formedProgress = spawnProgress * spawnProgress * (3 - 2 * spawnProgress);
  const auraAlpha = clamp((echo.hitFlash || 0) > 0 ? 0.62 : 0.28 + pulse * 0.12, 0.25, 0.62);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const aura = ctx.createRadialGradient(
    x + hitbox.width / 2,
    y + hitbox.height * 0.56,
    8,
    x + hitbox.width / 2,
    y + hitbox.height * 0.56,
    58,
  );
  aura.addColorStop(0, `rgba(94, 234, 212, ${0.34 * auraAlpha})`);
  aura.addColorStop(0.55, `rgba(56, 189, 248, ${0.16 * auraAlpha})`);
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(x - 64, y - 24, hitbox.width + 128, hitbox.height + 72);
  if (spawnProgress < 1) {
    const groundY = getArrivalThresholdGroundY(echo.x);
    ctx.globalAlpha = 0.72 * (1 - spawnProgress * 0.35);
    ctx.strokeStyle = 'rgba(94, 234, 212, 0.58)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 9; i += 1) {
      const angle = now / 240 + i * 0.75;
      const radius = 9 + i * 4.2 + spawnProgress * 22;
      const px = x + hitbox.width / 2 + Math.cos(angle) * radius;
      const py = groundY - 8 - Math.sin(angle * 1.4) * 26 - i * 2;
      ctx.beginPath();
      ctx.moveTo(px, py + 10);
      ctx.lineTo(px + Math.sin(angle) * 8, py - 14 - spawnProgress * 18);
      ctx.stroke();
    }
  }

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = (trial.defeatedEcho && !trial.echo ? 0.82 : 0.96) * clamp(formedProgress * 1.25, 0, 1);
  const echoAsset = arrivalThresholdDuatEchoRef?.current;
  if (echoAsset?.loaded && echoAsset.image) {
    const frameWidth = 256;
    const frameHeight = 256;
    const frameIndex = spawnProgress < 0.62
      ? 5
      : trial.defeatedEcho && !trial.echo
      ? 5
      : (echo.hitFlash || 0) > 0
        ? 4
        : (echo.attackCue || 0) > 0
          ? 2
          : echo.movement === 'strike'
            ? 3
            : echo.movement === 'patrol'
              ? Math.floor(now / 180) % 2 === 0 ? 1 : 0
              : 0;
    const bob = Math.sin(now / 260 + (echo.awakeTimer || 0) * 2.2) * 4;
    const visualHeight = hitbox.height * (1.45 + formedProgress * 0.45);
    const visualWidth = visualHeight * (frameWidth / frameHeight);
    const visualX = x + hitbox.width / 2 - visualWidth / 2;
    const materialiseRise = (1 - formedProgress) * 18;
    const visualY = getArrivalThresholdGroundY(echo.x) - visualHeight + 12 + materialiseRise + bob;
    const shouldFaceLeft = (echo.direction || -1) < 0;
    if (shouldFaceLeft) {
      ctx.save();
      ctx.translate(visualX + visualWidth, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(
      echoAsset.image,
      frameIndex * frameWidth,
      0,
      frameWidth,
      frameHeight,
      shouldFaceLeft ? 0 : visualX,
      visualY,
      visualWidth,
      visualHeight,
    );
    if (shouldFaceLeft) ctx.restore();
  } else {
    ctx.fillStyle = (echo.attackCue || 0) > 0 ? 'rgba(250, 204, 21, 0.44)' : 'rgba(34, 211, 238, 0.36)';
    ctx.beginPath();
    ctx.ellipse(x + hitbox.width / 2, y + hitbox.height * 0.48, hitbox.width * 0.45, hitbox.height * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = (echo.attackCue || 0) > 0 ? 'rgba(253, 224, 71, 0.82)' : 'rgba(153, 246, 228, 0.72)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(232, 244, 255, 0.78)';
    ctx.beginPath();
    ctx.moveTo(x + hitbox.width / 2, y + 9);
    ctx.lineTo(x + hitbox.width * 0.72, y + hitbox.height * 0.5);
    ctx.lineTo(x + hitbox.width / 2, y + hitbox.height - 8);
    ctx.lineTo(x + hitbox.width * 0.28, y + hitbox.height * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  return true;
}

export function drawTempleThresholdTransitionFrame(ctx, scene, now, deps) {
  if (!scene || scene.timer <= 0) return;
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    DEFAULT_LEVEL_TRANSITION,
    TEMPLE_THRESHOLD_FADE_IN_SECONDS,
    TEMPLE_THRESHOLD_FADE_OUT_SECONDS,
    TEMPLE_THRESHOLD_SWITCH_SECONDS,
    clamp,
  } = deps;
  const elapsed = clamp(scene.duration - scene.timer, 0, scene.duration);
  const fadeOut = clamp(elapsed / TEMPLE_THRESHOLD_FADE_OUT_SECONDS, 0, 1);
  const fadeInStart = TEMPLE_THRESHOLD_SWITCH_SECONDS;
  const fadeIn = clamp((elapsed - fadeInStart) / TEMPLE_THRESHOLD_FADE_IN_SECONDS, 0, 1);
  const fadeAlpha = elapsed < fadeInStart
    ? fadeOut
    : Math.max(0, 1 - fadeIn);
  const letterbox = clamp(Math.min(elapsed, scene.duration - elapsed) / 0.7, 0, 1);

  ctx.save();
  if (letterbox > 0) {
    ctx.globalAlpha = 0.88 * letterbox;
    ctx.fillStyle = '#020617';
    const barHeight = 48;
    ctx.fillRect(0, 0, CANVAS_WIDTH, barHeight);
    ctx.fillRect(0, CANVAS_HEIGHT - barHeight, CANVAS_WIDTH, barHeight);
  }

  if (elapsed < fadeInStart && fadeAlpha < 0.98) {
    const doorPulse = 0.48 + Math.sin(now / 190) * 0.12;
    ctx.globalAlpha = (1 - fadeAlpha) * doorPulse;
    const doorGlow = ctx.createRadialGradient(
      CANVAS_WIDTH * 0.52,
      CANVAS_HEIGHT * 0.52,
      18,
      CANVAS_WIDTH * 0.52,
      CANVAS_HEIGHT * 0.52,
      CANVAS_WIDTH * 0.46,
    );
    doorGlow.addColorStop(0, 'rgba(15, 23, 42, 0.62)');
    doorGlow.addColorStop(0.44, 'rgba(88, 56, 28, 0.24)');
    doorGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = doorGlow;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  if (fadeAlpha > 0) {
    ctx.globalAlpha = clamp(fadeAlpha, 0, 1);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  if (fadeAlpha > 0.72) {
    const titleAlpha = clamp((fadeAlpha - 0.72) / 0.28, 0, 1);
    ctx.globalAlpha = titleAlpha;
    ctx.textAlign = 'center';
    ctx.fillStyle = scene.accent || '#facc15';
    ctx.font = '900 18px Outfit, sans-serif';
    ctx.fillText(scene.title || DEFAULT_LEVEL_TRANSITION.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 12);
    ctx.fillStyle = 'rgba(255, 247, 237, 0.86)';
    ctx.font = '800 13px Outfit, sans-serif';
    ctx.fillText(scene.subtitle || DEFAULT_LEVEL_TRANSITION.subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 18);
  }
  ctx.restore();
}

export function drawForgottenMuralChamberTransitionFrame(ctx, scene, deps) {
  if (!scene || scene.timer <= 0) return;
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    FORGOTTEN_MURAL_CHAMBER_FADE_IN_SECONDS,
    FORGOTTEN_MURAL_CHAMBER_FADE_OUT_SECONDS,
    FORGOTTEN_MURAL_CHAMBER_SWITCH_SECONDS,
    JOURNEY_SCENE_IDS,
    clamp,
  } = deps;
  const elapsed = clamp(scene.duration - scene.timer, 0, scene.duration);
  const fadeOut = clamp(elapsed / FORGOTTEN_MURAL_CHAMBER_FADE_OUT_SECONDS, 0, 1);
  const fadeIn = clamp((elapsed - FORGOTTEN_MURAL_CHAMBER_SWITCH_SECONDS) / FORGOTTEN_MURAL_CHAMBER_FADE_IN_SECONDS, 0, 1);
  const fadeAlpha = elapsed < FORGOTTEN_MURAL_CHAMBER_SWITCH_SECONDS
    ? fadeOut
    : Math.max(0, 1 - fadeIn);

  ctx.save();
  ctx.globalAlpha = clamp(fadeAlpha, 0, 1);
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (fadeAlpha > 0.72) {
    ctx.globalAlpha = clamp((fadeAlpha - 0.72) / 0.28, 0, 1);
    const label = scene.toSceneId === JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER
      ? (scene.switched ? 'MUMMIFICATION CHAMBER' : 'ENTERING SACRED DOORWAY')
      : scene.switched
        ? 'FORGOTTEN MURAL CHAMBER'
        : 'ENTERING HIDDEN DOORWAY';
    ctx.fillStyle = '#facc15';
    ctx.font = '900 17px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }
  ctx.restore();
}
