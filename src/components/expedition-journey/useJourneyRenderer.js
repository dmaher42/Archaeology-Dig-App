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
    ARRIVAL_THRESHOLD_RIGHT_BOUND,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GROUND_Y,
    arrivalThresholdBackgroundRef,
    clamp,
  } = deps;
  const asset = arrivalThresholdBackgroundRef.current;
  const playerCenter = current.player.x + current.player.width / 2;
  const travelProgress = clamp(
    (playerCenter - ARRIVAL_THRESHOLD_LEFT_BOUND) / (ARRIVAL_THRESHOLD_RIGHT_BOUND - ARRIVAL_THRESHOLD_LEFT_BOUND),
    0,
    1,
  );

  ctx.save();
  if (asset.loaded && asset.image) {
    const scale = CANVAS_HEIGHT / (asset.image.naturalHeight || asset.image.height || CANVAS_HEIGHT);
    const drawWidth = (asset.image.naturalWidth || asset.image.width || CANVAS_WIDTH) * scale;
    const panX = Math.max(0, drawWidth - CANVAS_WIDTH) * travelProgress;
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
    current.renderStats.arrivalThresholdAssetVersion = ARRIVAL_THRESHOLD_ASSET_VERSION;
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
  const frameKey = getPlayerWeaponFrameKey(attackState);
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
    stateRef.current.renderStats.playerWeaponVisualMode = 'khopesh-sprite-atlas';
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

  ctx.save();
  if (invuln > 0 && !dodging && Math.floor(now / 100) % 2 === 0) ctx.globalAlpha = 0.34;

  ctx.fillStyle = 'rgba(0,0,0,0.34)';
  ctx.beginPath();
  ctx.ellipse(footX, footY + 1, w * (applyRuntimeDodgeEffects ? 1.28 : 1.05), 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(footX + attackLean + movementLean + hurtShake + dodgeLean, footY + jumpLift + dodgeDuckSink);
  if (knowledgeScale > 1) {
    ctx.shadowColor = 'rgba(250, 204, 21, 0.54)';
    ctx.shadowBlur = 18;
    ctx.scale(knowledgeScale, knowledgeScale);
  }
  ctx.scale(squashX, squashY);
  if (direction < 0) ctx.scale(-1, 1);
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
    renderedHeight,
  );
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

  if (stateRef.current.notice && stateRef.current.notice.includes('near')) {
    ctx.save();
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 12px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('!', x + w / 2, y - 18);
    ctx.restore();
  }
}

export function drawBuriedStoneCausewaySurfaceFrame(ctx, platform, x, cameraX, now, deps) {
  const {
    CANVAS_WIDTH,
    DESERT_ENTRY_BURIED_CAUSEWAY_GROUND_VERSION,
    DESERT_ENTRY_CAUSEWAY_DRAW_HEIGHT,
    DESERT_ENTRY_CAUSEWAY_DRAW_Y_OFFSET,
    GROUND_Y,
    desertEntryBuriedCausewayGroundRef,
    getSectionForX,
    stateRef,
    worldToScreenX,
  } = deps;
  const section = getSectionForX(platform.x);
  if (section.id !== 'desert-entry' || platform.y !== GROUND_Y) return false;

  const visibleStart = Math.max(platform.x, cameraX - 120);
  const visibleEnd = Math.min(platform.x + platform.width, cameraX + CANVAS_WIDTH + 120);
  const causewayAsset = desertEntryBuriedCausewayGroundRef.current;
  if (causewayAsset.loaded && causewayAsset.image) {
    const tileWorldWidth = 768;
    const drawHeight = DESERT_ENTRY_CAUSEWAY_DRAW_HEIGHT;
    const drawY = platform.y + DESERT_ENTRY_CAUSEWAY_DRAW_Y_OFFSET;
    const firstTile = Math.floor(visibleStart / tileWorldWidth) * tileWorldWidth;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, drawY, platform.width, drawHeight);
    ctx.clip();
    ctx.globalAlpha = 0.96;
    for (let worldX = firstTile; worldX <= visibleEnd; worldX += tileWorldWidth) {
      ctx.drawImage(causewayAsset.image, worldToScreenX(worldX, cameraX), drawY, tileWorldWidth + 1, drawHeight);
    }
    ctx.restore();
    if (stateRef.current.renderStats) {
      stateRef.current.renderStats.desertGroundPngAssetLoaded = true;
      stateRef.current.renderStats.desertGroundPngAssetVersion = DESERT_ENTRY_BURIED_CAUSEWAY_GROUND_VERSION;
      stateRef.current.renderStats.desertEntryCausewayVisualMode = 'narrow-premium-causeway-with-modular-floor-kit';
    }
    return true;
  }

  const firstSlab = Math.floor(visibleStart / 118) * 118;
  const surfaceTop = platform.y - 16;
  const surfaceBottom = platform.y + 18;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, surfaceTop - 10, platform.width, surfaceBottom - surfaceTop + 18);
  ctx.clip();

  for (let worldX = firstSlab; worldX <= visibleEnd; worldX += 118) {
    const seed = Math.abs(Math.sin(worldX * 0.021)) * 1000;
    const slabWidth = 72 + (seed % 50);
    const slabHeight = 14 + (seed % 11);
    const slabX = worldToScreenX(worldX + (seed % 24) - 12, cameraX);
    const slabY = surfaceTop + Math.sin(worldX * 0.017 + now / 3800) * 3 + (seed % 5);
    const exposed = 0.14 + (seed % 7) * 0.012;

    ctx.globalAlpha = exposed;
    ctx.fillStyle = seed % 3 > 1
      ? 'rgba(185, 137, 78, 0.86)'
      : 'rgba(150, 105, 62, 0.88)';
    ctx.beginPath();
    ctx.roundRect(slabX, slabY, slabWidth, slabHeight, 4);
    ctx.fill();

    ctx.globalAlpha = exposed * 0.92;
    ctx.strokeStyle = 'rgba(61, 36, 17, 0.68)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(slabX + slabWidth * 0.18, slabY + 2);
    ctx.lineTo(slabX + slabWidth * 0.42, slabY + slabHeight - 3);
    ctx.lineTo(slabX + slabWidth * 0.72, slabY + 5);
    ctx.stroke();

    ctx.globalAlpha = exposed * 0.7;
    ctx.strokeStyle = 'rgba(247, 203, 124, 0.42)';
    ctx.beginPath();
    ctx.moveTo(slabX + 5, slabY + 2);
    ctx.lineTo(slabX + slabWidth - 6, slabY + 1 + Math.sin(worldX * 0.03));
    ctx.stroke();
  }

  ctx.globalAlpha = 0.34;
  const drift = ctx.createLinearGradient(0, surfaceTop - 4, 0, surfaceBottom + 16);
  drift.addColorStop(0, 'rgba(235, 184, 105, 0)');
  drift.addColorStop(0.48, 'rgba(213, 151, 75, 0.28)');
  drift.addColorStop(1, 'rgba(128, 76, 34, 0.2)');
  ctx.fillStyle = drift;
  ctx.beginPath();
  ctx.moveTo(x, surfaceBottom + 14);
  for (let sx = 0; sx <= platform.width + 20; sx += 28) {
    const worldX = cameraX + x + sx;
    ctx.lineTo(x + sx, surfaceTop + 13 + Math.sin(worldX * 0.015) * 3 + Math.cos(worldX * 0.006) * 4);
  }
  ctx.lineTo(x + platform.width, surfaceBottom + 14);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.18;
  ctx.fillStyle = 'rgba(99, 58, 24, 0.5)';
  for (let worldX = firstSlab + 42; worldX <= visibleEnd; worldX += 76) {
    const seed = Math.abs(Math.sin(worldX * 0.049)) * 1000;
    const pebbleX = worldToScreenX(worldX, cameraX);
    const pebbleY = surfaceTop + 10 + (seed % 14);
    ctx.beginPath();
    ctx.ellipse(pebbleX, pebbleY, 2.5 + (seed % 3), 1.4, seed * 0.01, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  if (stateRef.current.renderStats) {
    stateRef.current.renderStats.desertGroundPngAssetLoaded = false;
    stateRef.current.renderStats.desertGroundPngFallback = true;
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

  const sectionStart = Math.max(section.start, cameraX - 160);
  const sectionEnd = Math.min(section.end, cameraX + CANVAS_WIDTH + 160);
  const firstStone = Math.floor(sectionStart / 96) * 96;
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

  if (current.renderStats) {
    current.renderStats.routeGroundVisualMode = ROUTE_GROUND_VISUAL_MODE;
    current.renderStats.routeGroundHazeFixVersion = ROUTE_GROUND_HAZE_FIX_VERSION;
    if (section.id === 'desert-entry') current.renderStats.desertGroundStyle = 'buried-stone-causeway-under-windblown-sand';
  }
  ctx.restore();
}

export function drawDesertEntryPlatformSupportFrame(ctx, platform, screenX, visualY, visualHeight, reactiveActive = false, deps) {
  const {
    GROUND_Y,
    drawDecorativeBaseBlend,
    drawGroundDustLip,
    drawOpeningPyramidAssetRegion,
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
      : GROUND_Y - 4;
    const supportHeight = Math.max(28, supportBottom - topY);
    const columnCount = compactOpeningSupport ? 1 : platform.width >= 250 ? 3 : platform.width >= 160 ? 2 : 1;
    const columnWidth = compactOpeningSupport ? 26 : openingSetPiece ? 38 : 30;
    const baseAlpha = compactOpeningSupport ? 0.42 : openingSetPiece ? 0.58 : 0.62;
    const blockHeight = compactOpeningSupport ? 16 : openingSetPiece ? 18 : 14;

    ctx.save();
    ctx.globalAlpha = baseAlpha;
    drawDecorativeBaseBlend(ctx, centerX, supportBottom + 6, platform.width * 0.88, 'desert-entry', 'midground', openingSetPiece ? 0.28 : 0.52);

    if (openingSetPiece && openingPyramidClimbPackRef.current.loaded) {
      drawGroundDustLip(ctx, centerX, Math.min(GROUND_Y - 6, supportBottom + 1), platform.width * 0.58, 'rgba(171, 103, 42, 0.12)');
      ctx.restore();
      return;
    }

    if (!openingSetPiece) {
      const backShadow = ctx.createLinearGradient(0, topY, 0, supportBottom);
      backShadow.addColorStop(0, 'rgba(55, 31, 14, 0.44)');
      backShadow.addColorStop(0.72, 'rgba(95, 55, 24, 0.24)');
      backShadow.addColorStop(1, 'rgba(95, 55, 24, 0)');
      ctx.fillStyle = backShadow;
      ctx.beginPath();
      ctx.moveTo(screenX + platform.width * 0.08, topY + 2);
      ctx.lineTo(screenX + platform.width * 0.92, topY + 2);
      ctx.lineTo(screenX + platform.width * 0.72, supportBottom + 8);
      ctx.lineTo(screenX + platform.width * 0.24, supportBottom + 8);
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
        drawOpeningPyramidAssetRegion(ctx, columnRegion, {
          x: columnX - columnWidth / 2 + lean - 12,
          y: columnTop - 9,
          width: columnWidth + 24,
          height: columnHeight + 15,
        }, { alpha: compactOpeningSupport ? 0.34 : 0.46, filter: 'sepia(8%) saturate(84%) brightness(84%) contrast(92%)' });
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

    if (platform.width >= 180 && !openingSetPiece) {
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

    drawGroundDustLip(ctx, centerX, supportBottom + 1, platform.width * 0.72, 'rgba(171, 103, 42, 0.16)');
    ctx.restore();
}

export function drawDesertOpeningPlatformFaceFrame(ctx, platform, x, visualY, visualHeight, reactiveActive = false, deps) {
  const {
    drawOpeningPyramidAssetRegion,
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
      drawOpeningPyramidAssetRegion(ctx, sourceKey, {
        x: x - 4,
        y: topY - 7,
        width: platform.width + 8,
        height: Math.max(36, visualHeight + 13),
      }, {
        alpha: reactiveActive ? Math.min(1, embeddedAlpha + 0.08) : embeddedAlpha,
        filter: reactiveActive ? 'saturate(112%) brightness(108%)' : 'sepia(6%) saturate(96%) brightness(94%) contrast(98%)',
      });
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

export function drawPlatformFrame(ctx, platform, cameraX, current, deps) {
  const {
    GROUND_Y,
    drawAtlasRegion,
    drawContactShadow,
    drawForegroundSettlingDetails,
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
    const desertSetPiecePlatform = section.id === 'desert-entry' && !isGround;
    const embeddedOpeningPyramidPlatform = desertSetPiecePlatform
      && !platform.assetKey
      && platform.x < scaleJourneyX(720)
      && (openingPyramidFacadeRef.current.loaded || openingPyramidClimbPackRef.current.loaded);
    const facadeIntegratedOpeningPlatform = desertSetPiecePlatform
      && !platform.assetKey
      && platform.x < scaleJourneyX(720)
      && openingPyramidFacadeRef.current.loaded;
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
      drawForegroundSettlingDetails(ctx, x + platform.width / 2, platform.y + visualHeight + 4, platform.width * 1.28, section.id, {
        intensity: 0.74,
        seed: Math.round(platform.x),
        stones: 6,
      });
      drawContactShadow(ctx, x + platform.width / 2, platform.y + visualHeight + 5, platform.width * 0.94, 0.32, 1.5);
      ctx.fillStyle = 'rgba(30, 18, 8, 0.34)';
      ctx.fillRect(platformX, visualY + visualHeight - 8, platformWidth, 8);
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

export function drawStoryPropFrame(ctx, prop, cameraX, now, requestedDepth = null, deps) {
  const {
    CANVAS_WIDTH,
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
    drawForegroundSettlingDetails,
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
    isDesertEntryRebuildBackgroundPlateProp,
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
  const isPrimaryBackgroundPlate = isDesertEntryRebuildBackgroundPlateProp(prop);
  const visibilityWidth = Math.max(isPrimaryBackgroundPlate ? CANVAS_WIDTH * 1.6 : 440, Number(prop.width) || 0);
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
  if (isDesertEntryRebuildBackgroundPlateProp(prop)) {
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
      propSize.alpha = Math.max(propSize.alpha ?? 0.82, 0.86);
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
      const buffer = getJourneyPaintTintBuffer(bw, bh);
      if (!buffer) return null;
      const bctx = buffer.ctx;
      bctx.setTransform(1, 0, 0, 1, 0, 0);
      bctx.globalAlpha = 1;
      bctx.globalCompositeOperation = 'source-over';
      bctx.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
      const target = { x: 0, y: 0, width: bw, height: bh };
      bctx.filter = propColorFilter && propColorFilter !== 'none' ? propColorFilter : 'none';
      const drew = drawPropImageAsset(bctx, target);
      bctx.filter = 'none';
      if (!drew) return null;
      bctx.globalCompositeOperation = 'multiply';
      bctx.fillStyle = paintColor;
      bctx.fillRect(0, 0, bw, bh);
      bctx.globalCompositeOperation = 'destination-in';
      drawPropImageAsset(bctx, target);
      bctx.globalCompositeOperation = 'source-over';
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
    drawScribeChamberDoorwayStructure(ctx, getGeneratedStoryPropRenderProp(prop), x, section, now);
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
    drawForegroundSettlingDetails(ctx, x, flagBaseY + 1, 74, section.id, {
      intensity: propDepth === 'background' ? 0.52 : 0.78,
      seed: Math.round(prop.x),
      stones: 4,
    });
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

export function useJourneyRenderer(deps) {
  return {
    draw: deps.draw,
    drawAncientRouteGround: (ctx, section, cameraX, now, current) => (
      drawAncientRouteGroundFrame(ctx, section, cameraX, now, current, deps)
    ),
    drawArrivalThresholdScene: (ctx, current, now) => drawArrivalThresholdSceneFrame(ctx, current, now, deps),
    drawBuriedStoneCausewaySurface: (ctx, platform, x, cameraX, now) => (
      drawBuriedStoneCausewaySurfaceFrame(ctx, platform, x, cameraX, now, deps)
    ),
    drawForgottenMuralChamberTransition: (ctx, scene) => drawForgottenMuralChamberTransitionFrame(ctx, scene, deps),
    drawOpeningCinematic: (ctx, cinematic, now) => drawOpeningCinematicFrame(ctx, cinematic, now, deps),
    drawOpeningSphinxEncounter: (ctx, encounter, cameraX, now) => (
      drawOpeningSphinxEncounterFrame(ctx, encounter, cameraX, now, deps)
    ),
    drawOpeningSphinxDialogue: (ctx, encounter, screenX, screenY, alpha) => (
      drawOpeningSphinxDialogueFrame(ctx, encounter, screenX, screenY, alpha, deps)
    ),
    drawOpeningThresholdScene: (ctx, scene, cameraX, now) => drawOpeningThresholdSceneFrame(ctx, scene, cameraX, now, deps),
    drawPlatform: (ctx, platform, cameraX, current) => drawPlatformFrame(ctx, platform, cameraX, current, deps),
    drawPlayerSprite: (ctx, x, y, w, h, direction, invuln, now) => (
      drawPlayerSpriteFrame(ctx, x, y, w, h, direction, invuln, now, deps)
    ),
    drawStoryProp: (ctx, prop, cameraX, now, requestedDepth = null) => (
      drawStoryPropFrame(ctx, prop, cameraX, now, requestedDepth, deps)
    ),
    getOpeningSphinxSpriteFrame: (encounter, now) => getOpeningSphinxSpriteFrame(encounter, now, deps),
    drawTempleThresholdTransition: (ctx, scene, now) => drawTempleThresholdTransitionFrame(ctx, scene, now, deps),
  };
}
