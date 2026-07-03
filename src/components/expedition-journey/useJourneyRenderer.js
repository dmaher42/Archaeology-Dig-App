import { DESERT_LAYER_TUNING } from './desertLayerTuning.js';

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

  if (desertEntryFootContactActive && typeof drawContactShadow === 'function') {
    drawContactShadow(
      ctx,
      footX,
      footY + 3,
      w * (applyRuntimeDodgeEffects ? 1.58 : 1.42),
      0.28 + groundContactEnergy * 0.08,
      0.9,
      { height: 5.5, color: 'rgba(38, 21, 8, 0.9)', coreOffsetX: direction * 2 },
    );
    if (typeof drawGroundDustLip === 'function') {
      drawGroundDustLip(
        ctx,
        footX - direction * (7 + groundContactEnergy * 5),
        footY + 5,
        w * (1.36 + groundContactEnergy * 0.32),
        `rgba(221, 151, 68, ${0.2 + groundContactEnergy * 0.08})`,
      );
    }
    if (current.renderStats) {
      current.renderStats.desertEntryPlayerFootContact = 'warm-plaza-foot-shadow-v1';
    }
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.34)';
    ctx.beginPath();
    ctx.ellipse(footX, footY + 1, w * (applyRuntimeDodgeEffects ? 1.28 : 1.05), 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

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
  const visibilityWidth = Math.max(440, Number(prop.width) || 0);
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

export function drawSectionParallaxBackgroundFrame(ctx, section, cameraX, deps) {
  const {
    CANVAS_WIDTH,
    SECTION_PARALLAX_LAYERS,
    desertBackgroundAssetsRef,
    drawDesertBackgroundLayer,
    getSectionBackgroundAssets,
  } = deps;
  const layers = SECTION_PARALLAX_LAYERS[section.id];
  if (!layers) return false;
  const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, section.id);
  if (!assets?.ready) return false;

  const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
  const drawn = layers
    .filter(layer => !layer.foreground)
    .map(layer => drawDesertBackgroundLayer(
      ctx,
      assets,
      layer.key,
      { y: layer.y, height: layer.height },
      {
        ...layerOptions,
        parallax: layer.parallax,
        alpha: layer.alpha,
      },
    ));
  return drawn.every(Boolean);
}

export function drawSectionParallaxForegroundFrame(ctx, section, cameraX, deps) {
  const {
    CANVAS_WIDTH,
    SECTION_PARALLAX_LAYERS,
    desertBackgroundAssetsRef,
    drawDesertBackgroundLayer,
    getSectionBackgroundAssets,
  } = deps;
  const layers = SECTION_PARALLAX_LAYERS[section.id]?.filter(layer => layer.foreground);
  if (!layers?.length) return false;
  const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, section.id);
  if (!assets?.ready) return false;

  const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
  const drawn = layers.map(layer => drawDesertBackgroundLayer(
    ctx,
    assets,
    layer.key,
    { y: layer.y, height: layer.height },
    {
      ...layerOptions,
      parallax: layer.parallax,
      alpha: layer.alpha,
    },
  ));
  return drawn.every(Boolean);
}

export function drawDesertForegroundAtmosphereFrame(ctx, section, cameraX, deps) {
  const {
    CANVAS_WIDTH,
    backgroundPackId,
    desertBackgroundAssetsRef,
    drawDesertBackgroundLayer,
    getSectionBackgroundAssets,
  } = deps;
  if (backgroundPackId === 'china-river-valley') {
    const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'china-river-valley');
    if (!assets?.ready) return false;
    if (assets.atlas?.runtimeMode === 'single-composited-backdrop') {
      ctx.save();
      const mist = ctx.createLinearGradient(0, 270, 0, 480);
      mist.addColorStop(0, 'rgba(229, 232, 211, 0)');
      mist.addColorStop(0.36, 'rgba(229, 232, 211, 0.09)');
      mist.addColorStop(0.76, 'rgba(187, 171, 132, 0.07)');
      mist.addColorStop(1, 'rgba(187, 171, 132, 0)');
      ctx.fillStyle = mist;
      ctx.fillRect(0, 270, CANVAS_WIDTH, 220);
      ctx.restore();
      return true;
    }
    const mistDrawn = [
      drawDesertBackgroundLayer(
        ctx,
        assets,
        'foregroundMist',
        { y: 260, height: 190 },
        { canvasWidth: CANVAS_WIDTH, cameraX, parallax: 0.34, alpha: 0.1 },
      ),
      drawDesertBackgroundLayer(
        ctx,
        assets,
        'foregroundMist',
        { y: 374, height: 130 },
        { canvasWidth: CANVAS_WIDTH, cameraX, parallax: 0.48, alpha: 0.08 },
      ),
    ];
    return mistDrawn.some(Boolean);
  }
  const isNearDesertEntry = section.id === 'desert-entry';
  const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'desert-entry');
  if (!isNearDesertEntry || !assets?.ready) return false;
  const runtimeMode = assets.atlas?.runtimeMode;
  if (runtimeMode !== 'layered-necropolis-playable-route') {
    return false;
  }
  const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
  const foregroundDrawn = [
    drawDesertBackgroundLayer(
      ctx,
      assets,
      'foregroundDepth',
      { y: DESERT_LAYER_TUNING.foregroundDepth.y, height: DESERT_LAYER_TUNING.foregroundDepth.height },
      { ...layerOptions, parallax: DESERT_LAYER_TUNING.foregroundDepth.parallax, alpha: DESERT_LAYER_TUNING.foregroundDepth.alpha },
    ),
  ];
  return foregroundDrawn.some(Boolean);
}

export function drawForegroundDepthParticlesFrame(ctx, now, cameraX, deps) {
  const {
    CANVAS_WIDTH,
    GROUND_Y,
    clamp,
  } = deps;
  let particleCount = 0;
  ctx.save();
  for (let index = 0; index < 18; index += 1) {
    const drift = (now * (0.006 + (index % 5) * 0.0017) + cameraX * 0.035 + index * 91) % (CANVAS_WIDTH + 180);
    const x = drift - 90;
    const edgeWeight = Math.max(
      clamp(1 - x / 230, 0, 1),
      clamp((x - (CANVAS_WIDTH - 230)) / 230, 0, 1),
    );
    const y = GROUND_Y - 34 + (index % 4) * 11 + Math.sin(now / 900 + index) * 4;
    const alpha = (0.012 + edgeWeight * 0.014) * (index % 3 === 0 ? 1.15 : 1);
    ctx.fillStyle = `rgba(232, 205, 157, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 14 + (index % 4) * 6, 1.8 + (index % 3), -0.08, 0, Math.PI * 2);
    ctx.fill();
    particleCount += 1;
  }
  ctx.restore();
  return particleCount;
}

export function drawForegroundDepthLayerFrame(ctx, section, cameraX, now, deps) {
  const {
    CANVAS_WIDTH,
    FOREGROUND_DEPTH_LAYER_MODE,
    GROUND_Y,
    backgroundPackId,
    drawAtlasRegion,
    foregroundDepthEnvironmentAssetsRef,
    stateRef,
  } = deps;
  const drawForegroundDepthParticles = (innerCtx, innerNow, innerCameraX) => (
    drawForegroundDepthParticlesFrame(innerCtx, innerNow, innerCameraX, deps)
  );
  if (backgroundPackId === 'china-river-valley' || section.id !== 'desert-entry') return false;
  const assets = foregroundDepthEnvironmentAssetsRef.current;
  let elementCount = 0;
  const drawRegion = (key, dest, alpha, options = {}) => {
    if (!assets?.loaded || assets.failed) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (options.filter) ctx.filter = options.filter;
    const drawn = drawAtlasRegion(ctx, assets, key, dest, {
      mode: options.mode || 'contain',
      alignY: options.alignY || 'bottom',
    });
    ctx.restore();
    if (drawn) elementCount += 1;
    return drawn;
  };

  ctx.save();

  // ── Grounded ruin prop clusters scattered across the desert-entry world ──
  // Each cluster has a world-X position. We convert to screen-X and scale by
  // depth (smaller = further away) so clusters feel layered.  Only drawn when
  // they fall inside the visible viewport.
  drawRegion('rubbleClusterSmall', { x: -18, y: GROUND_Y - 34, width: 128, height: 54 }, 0.24);
  drawRegion('buriedCarvedHead', { x: -34, y: GROUND_Y - 62, width: 86, height: 72 }, 0.14);
  drawRegion('dryShrub', { x: CANVAS_WIDTH - 132, y: GROUND_Y - 68, width: 84, height: 76 }, 0.22);
  drawRegion('rubbleClusterLarge', { x: CANVAS_WIDTH - 250, y: GROUND_Y - 44, width: 214, height: 74 }, 0.26);
  drawRegion('edgePebbleScatter', { x: CANVAS_WIDTH - 370, y: GROUND_Y - 28, width: 318, height: 44 }, 0.24, { mode: 'stretch' });
  const particleCount = drawForegroundDepthParticles(ctx, now, cameraX);
  ctx.restore();

  if (stateRef.current.renderStats) {
    stateRef.current.renderStats.foregroundDepthLayerActive = elementCount > 0 || particleCount > 0;
    stateRef.current.renderStats.foregroundDepthLayerMode = FOREGROUND_DEPTH_LAYER_MODE;
    stateRef.current.renderStats.foregroundDepthAssetLoaded = Boolean(assets?.loaded);
    stateRef.current.renderStats.foregroundDepthElementCount = elementCount;
    stateRef.current.renderStats.foregroundDepthParticleCount = particleCount;
  }
  return elementCount > 0 || particleCount > 0;
}

export function drawDesertEntryForegroundDepthFrame(ctx, section, cameraX, now, deps) {
  const {
    stateRef,
  } = deps;
  if (section.id !== 'desert-entry') return false;
  void ctx;
  void cameraX;
  void now;
  if (stateRef.current.renderStats) {
    stateRef.current.renderStats.desertEntryForegroundDepthLoaded = false;
    stateRef.current.renderStats.desertEntryForegroundDepthMode = 'retired-integrated-background-carries-front-edge';
  }
  return false;
}

export function drawTempleBackdropFrame(ctx, section, cameraX, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
  } = deps;
  if (section.id !== 'ruined-temple') return;

  ctx.save();
  const wallGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  wallGradient.addColorStop(0, 'rgba(77, 58, 40, 0.88)');
  wallGradient.addColorStop(0.38, 'rgba(94, 70, 45, 0.9)');
  wallGradient.addColorStop(0.78, 'rgba(122, 86, 49, 0.52)');
  wallGradient.addColorStop(1, 'rgba(157, 106, 55, 0.18)');
  ctx.fillStyle = wallGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = 'rgba(20, 14, 10, 0.28)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 96);

  ctx.fillStyle = 'rgba(245, 200, 120, 0.08)';
  for (let worldX = section.start + 120; worldX < section.end; worldX += 340) {
    const x = worldX - cameraX * 0.42;
    if (x < -260 || x > CANVAS_WIDTH + 260) continue;
    ctx.beginPath();
    ctx.ellipse(x, 214, 190, 74, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(39, 25, 16, 0.42)';
  for (let worldX = section.start + 100; worldX < section.end; worldX += 210) {
    const x = worldX - cameraX;
    if (x < -120 || x > CANVAS_WIDTH + 120) continue;
    ctx.fillRect(x - 24, 100, 48, 238);
    ctx.fillStyle = 'rgba(255, 220, 142, 0.11)';
    ctx.fillRect(x - 16, 122, 32, 17);
    ctx.fillRect(x - 16, 172, 32, 17);
    ctx.fillRect(x - 16, 222, 32, 17);
    ctx.fillStyle = 'rgba(22, 15, 11, 0.38)';
    ctx.fillRect(x - 18, 266, 36, 72);
    ctx.fillStyle = 'rgba(39, 25, 16, 0.42)';
  }

  ctx.strokeStyle = 'rgba(255, 226, 160, 0.2)';
  ctx.lineWidth = 2;
  for (let worldX = section.start + 42; worldX < section.end; worldX += 120) {
    const x = worldX - cameraX;
    if (x < -80 || x > CANVAS_WIDTH + 80) continue;
    ctx.strokeRect(x, 154, 54, 28);
    ctx.beginPath();
    ctx.moveTo(x + 8, 238);
    ctx.lineTo(x + 37, 212);
    ctx.lineTo(x + 52, 240);
    ctx.stroke();
  }

  for (let worldX = section.start + 155; worldX < section.end; worldX += 360) {
    const x = worldX - cameraX;
    if (x < -140 || x > CANVAS_WIDTH + 140) continue;
    const glow = ctx.createRadialGradient(x, 248, 0, x, 248, 78);
    glow.addColorStop(0, 'rgba(251, 191, 36, 0.24)');
    glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, 248, 78, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 212, 112, 0.78)';
    ctx.fillRect(x - 3, 240, 6, 16);
  }

  ctx.restore();
}

const getBackgroundRegionImage = (assets, key) => {
  const region = assets?.atlas?.regions?.[key] || null;
  const image = region?.image ? assets?.images?.[region.image] : assets?.image;
  if (!region || !image) return null;
  return { region, image };
};

function drawSinglePanoramaLayer(ctx, assets, key, dest, options = {}) {
  const layer = getBackgroundRegionImage(assets, key);
  if (!layer) return false;

  const {
    canvasWidth,
    cameraX = 0,
    parallax = 0,
    alpha = 1,
    alignY = 0.5,
  } = options;
  const { region, image } = layer;
  if (!canvasWidth || dest.height <= 0) return false;

  const sourceRatio = region.w / region.h;
  const drawWidth = Math.max(canvasWidth, dest.height * sourceRatio);
  const drawHeight = drawWidth / sourceRatio;
  const overflowX = Math.max(0, drawWidth - canvasWidth);
  const driftX = overflowX > 0 ? Math.max(-overflowX, Math.min(0, -cameraX * parallax)) : 0;
  const drawY = dest.y + (dest.height - drawHeight) * alignY;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    image,
    region.x, region.y, region.w, region.h,
    Math.round(driftX), Math.round(drawY), Math.round(drawWidth), Math.round(drawHeight),
  );
  ctx.restore();
  return true;
}

function drawSingleGroundLayer(ctx, assets, key, dest, options = {}) {
  const layer = getBackgroundRegionImage(assets, key);
  if (!layer) return false;

  const {
    canvasWidth,
    cameraX = 0,
    parallax = 1,
    alpha = 1,
  } = options;
  const { region, image } = layer;
  if (!canvasWidth) return false;

  const sourceRatio = region.w / region.h;
  const drawWidth = canvasWidth;
  const drawHeight = drawWidth / sourceRatio;
  const scrollX = -((cameraX * parallax) % drawWidth);
  const firstX = scrollX > 0 ? scrollX - drawWidth : scrollX;

  ctx.save();
  ctx.globalAlpha = alpha;
  for (let x = firstX; x < canvasWidth; x += drawWidth) {
    ctx.drawImage(
      image,
      region.x, region.y, region.w, region.h,
      Math.round(x), Math.round(dest.y), Math.round(drawWidth), Math.round(drawHeight),
    );
  }
  ctx.restore();
  return true;
}

function drawDesertEntryAtmosphericGrade(ctx, canvasWidth, canvasHeight, options = {}) {
  const { groundY = 520, intensity = 1 } = options;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';

  const horizonHaze = ctx.createLinearGradient(0, 130, 0, groundY);
  horizonHaze.addColorStop(0, `rgba(255, 205, 128, ${0.02 * intensity})`);
  horizonHaze.addColorStop(0.34, `rgba(239, 159, 74, ${0.075 * intensity})`);
  horizonHaze.addColorStop(0.7, `rgba(133, 69, 26, ${0.065 * intensity})`);
  horizonHaze.addColorStop(1, 'rgba(82, 45, 18, 0)');
  ctx.fillStyle = horizonHaze;
  ctx.fillRect(0, 130, canvasWidth, Math.max(1, groundY - 130));

  const skyWeight = ctx.createLinearGradient(0, 0, 0, 210);
  skyWeight.addColorStop(0, `rgba(34, 14, 9, ${0.24 * intensity})`);
  skyWeight.addColorStop(0.62, `rgba(83, 34, 12, ${0.07 * intensity})`);
  skyWeight.addColorStop(1, 'rgba(72, 34, 15, 0)');
  ctx.fillStyle = skyWeight;
  ctx.fillRect(0, 0, canvasWidth, 220);

  const leftFocus = ctx.createLinearGradient(0, 0, canvasWidth, 0);
  leftFocus.addColorStop(0, `rgba(255, 220, 142, ${0.075 * intensity})`);
  leftFocus.addColorStop(0.34, 'rgba(255, 217, 143, 0)');
  leftFocus.addColorStop(0.72, 'rgba(35, 18, 8, 0)');
  leftFocus.addColorStop(1, `rgba(35, 18, 8, ${0.12 * intensity})`);
  ctx.fillStyle = leftFocus;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.restore();
}

function drawDesertEntryLayerCohesionGrade(ctx, canvasWidth, canvasHeight, options = {}) {
  const {
    groundY = 558,
    intensity = 1,
  } = options;
  if (intensity <= 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  const horizonDust = ctx.createLinearGradient(0, 255, 0, groundY + 26);
  horizonDust.addColorStop(0, 'rgba(225, 166, 94, 0)');
  horizonDust.addColorStop(0.42, `rgba(240, 176, 88, ${0.04 * intensity})`);
  horizonDust.addColorStop(0.72, `rgba(214, 128, 47, ${0.055 * intensity})`);
  horizonDust.addColorStop(1, `rgba(116, 55, 20, ${0.025 * intensity})`);
  ctx.fillStyle = horizonDust;
  ctx.fillRect(0, 255, canvasWidth, Math.max(1, groundY + 26 - 255));

  const groundDustShelf = ctx.createLinearGradient(0, groundY - 128, 0, groundY + 18);
  groundDustShelf.addColorStop(0, 'rgba(226, 174, 110, 0)');
  groundDustShelf.addColorStop(0.58, `rgba(245, 188, 106, ${0.05 * intensity})`);
  groundDustShelf.addColorStop(1, `rgba(166, 78, 27, ${0.028 * intensity})`);
  ctx.fillStyle = groundDustShelf;
  ctx.fillRect(0, groundY - 128, canvasWidth, 146);

  const sunsetGlow = ctx.createLinearGradient(0, 150, canvasWidth, groundY);
  sunsetGlow.addColorStop(0, `rgba(255, 206, 106, ${0.13 * intensity})`);
  sunsetGlow.addColorStop(0.38, `rgba(240, 124, 43, ${0.08 * intensity})`);
  sunsetGlow.addColorStop(1, 'rgba(236, 135, 49, 0)');
  ctx.fillStyle = sunsetGlow;
  ctx.fillRect(0, 150, canvasWidth, Math.max(1, groundY - 130));
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const lowSunRake = ctx.createRadialGradient(0, 160, 24, 0, 170, canvasWidth * 0.68);
  lowSunRake.addColorStop(0, `rgba(255, 214, 132, ${0.13 * intensity})`);
  lowSunRake.addColorStop(0.34, `rgba(255, 151, 58, ${0.07 * intensity})`);
  lowSunRake.addColorStop(1, 'rgba(255, 151, 58, 0)');
  ctx.fillStyle = lowSunRake;
  ctx.fillRect(0, 0, canvasWidth, Math.max(1, groundY));
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  const skyDepth = ctx.createLinearGradient(0, 0, 0, Math.min(canvasHeight, 340));
  skyDepth.addColorStop(0, `rgba(34, 12, 8, ${0.24 * intensity})`);
  skyDepth.addColorStop(0.58, `rgba(86, 32, 9, ${0.075 * intensity})`);
  skyDepth.addColorStop(1, 'rgba(255, 255, 255, 1)');
  ctx.fillStyle = skyDepth;
  ctx.fillRect(0, 0, canvasWidth, Math.min(canvasHeight, 340));

  const depthVignette = ctx.createLinearGradient(0, 0, canvasWidth, 0);
  depthVignette.addColorStop(0, `rgba(70, 34, 13, ${0.14 * intensity})`);
  depthVignette.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
  depthVignette.addColorStop(0.78, 'rgba(255, 255, 255, 1)');
  depthVignette.addColorStop(1, `rgba(51, 23, 9, ${0.15 * intensity})`);
  ctx.fillStyle = depthVignette;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();
}

function drawDesertEntryPlayableFloorGrade(ctx, canvasWidth, options = {}) {
  const {
    groundY = 520,
    floorBottom = 610,
    intensity = 1,
  } = options;

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  const floorOcclusion = ctx.createLinearGradient(0, groundY - 28, 0, floorBottom);
  floorOcclusion.addColorStop(0, 'rgba(255, 255, 255, 1)');
  floorOcclusion.addColorStop(0.38, `rgba(145, 80, 26, ${0.12 * intensity})`);
  floorOcclusion.addColorStop(1, `rgba(76, 43, 18, ${0.22 * intensity})`);
  ctx.fillStyle = floorOcclusion;
  ctx.fillRect(0, groundY - 28, canvasWidth, Math.max(1, floorBottom - groundY + 28));
  ctx.restore();

  ctx.save();
  const routeContact = ctx.createLinearGradient(0, groundY - 18, 0, groundY + 62);
  routeContact.addColorStop(0, 'rgba(34, 19, 8, 0)');
  routeContact.addColorStop(0.45, `rgba(34, 19, 8, ${0.26 * intensity})`);
  routeContact.addColorStop(1, 'rgba(34, 19, 8, 0)');
  ctx.fillStyle = routeContact;
  ctx.fillRect(0, groundY - 18, canvasWidth, 80);

  const warmKick = ctx.createLinearGradient(0, groundY - 36, 0, groundY + 18);
  warmKick.addColorStop(0, 'rgba(255, 206, 116, 0)');
  warmKick.addColorStop(0.72, `rgba(255, 206, 116, ${0.08 * intensity})`);
  warmKick.addColorStop(1, 'rgba(255, 206, 116, 0)');
  ctx.fillStyle = warmKick;
  ctx.fillRect(0, groundY - 36, canvasWidth, 56);
  ctx.restore();
}

function drawDesertEntryDryPlazaSeamBreakup(ctx, canvasWidth, cameraX, options = {}) {
  const {
    seamY = 540,
    intensity = 1,
  } = options;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  const seamShade = ctx.createLinearGradient(0, seamY - 34, 0, seamY + 52);
  seamShade.addColorStop(0, 'rgba(56, 36, 20, 0)');
  seamShade.addColorStop(0.38, `rgba(126, 82, 42, ${0.12 * intensity})`);
  seamShade.addColorStop(0.62, `rgba(49, 33, 22, ${0.1 * intensity})`);
  seamShade.addColorStop(1, 'rgba(56, 36, 20, 0)');
  ctx.fillStyle = seamShade;
  ctx.fillRect(0, seamY - 34, canvasWidth, 86);
  ctx.restore();
}

export function drawDesertEntryBackgroundFrame(ctx, section, cameraX, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    desertBackgroundAssetsRef,
    drawDesertBackgroundLayer,
    getSectionBackgroundAssets,
    stateRef,
  } = deps;
  const isNearDesertEntry = section.id === 'desert-entry';
  const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'desert-entry');
  if (!isNearDesertEntry || !assets?.ready) return false;

  const runtimeMode = assets.atlas?.runtimeMode;
  if (runtimeMode !== 'layered-necropolis-playable-route') {
    return false;
  }

  const T = DESERT_LAYER_TUNING;
  const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
  const fullFrame = { y: 0, height: CANVAS_HEIGHT };
  const isV3ProductionCandidate = assets.atlas?.devCandidateMode === 'v3-production-layers-test';
  const skyDrawn = isV3ProductionCandidate
    ? drawSinglePanoramaLayer(
      ctx,
      assets,
      'skyLight',
      { y: 0, height: assets.atlas?.candidateSkyLayerHeight ?? CANVAS_HEIGHT },
      { ...layerOptions, parallax: T.skyLight.parallax, alpha: T.skyLight.alpha, alignY: 0 },
    )
    : drawDesertBackgroundLayer(
      ctx,
      assets,
      'skyLight',
      fullFrame,
      { ...layerOptions, parallax: T.skyLight.parallax, alpha: T.skyLight.alpha },
    );
  if (!skyDrawn) return false;

  if (isV3ProductionCandidate) {
    drawSinglePanoramaLayer(ctx, assets, 'distantCliffs', {
      y: assets.atlas?.candidateDepthFillDrawY ?? 205,
      height: assets.atlas?.candidateDepthFillHeight ?? 230,
    }, {
      ...layerOptions,
      parallax: T.distantCliffs.parallax,
      alpha: assets.atlas?.candidateDepthFillAlpha ?? T.distantCliffs.alpha,
      alignY: 0.5,
    });

    drawSinglePanoramaLayer(ctx, assets, 'midNecropolisRuins', {
      y: assets.atlas?.candidateMidLayerDrawY ?? 240,
      height: assets.atlas?.candidateMidLayerHeight ?? 345,
    }, {
      ...layerOptions,
      parallax: T.midNecropolisRuins.parallax,
      alpha: T.midNecropolisRuins.alpha,
      alignY: 0.5,
    });
  } else {
    // Cliffs drawn first as the far backdrop (slowest, tiled). Height is
    // base-anchored to the canvas bottom so raising it lifts the peaks while the
    // base stays pinned behind the ground layers.
    const cliffsDest = { y: CANVAS_HEIGHT - T.distantCliffs.height, height: T.distantCliffs.height };
    drawDesertBackgroundLayer(ctx, assets, 'distantCliffs', cliffsDest, {
      ...layerOptions,
      parallax: T.distantCliffs.parallax,
      alpha: T.distantCliffs.alpha,
      filter: 'sepia(6%) saturate(102%) brightness(98%) contrast(106%)',
    });

    // Imposing pyramids drawn ONCE (non-tiling, world-anchored) so the
    // distinctive shapes never repeat as the player scrolls. Grounded in the art
    // (sand mounds at the bases), drawn at backdrop size with the bases sitting
    // on the necropolis floor, and at low parallax so they stay pinned to the
    // horizon. Position/size/base are dev-tunable.
    const pyrRegion = assets.atlas?.regions?.farPyramids;
    const pyrImage = pyrRegion?.image ? assets.images?.[pyrRegion.image] : null;
    if (pyrImage && pyrRegion) {
      const PYR_SECTION_FRACTION = T.farPyramids.sectionFraction; // anchored mid-section
      const PYR_PARALLAX = T.farPyramids.parallax;
      const PYR_HEIGHT = T.farPyramids.height;
      const PYR_BASE_Y = T.farPyramids.baseY;           // screen Y of the pyramid bases (ground line)
      const sectionWidth = Math.max(1, section.end - section.start);
      const pyrWorldX = section.start + sectionWidth * PYR_SECTION_FRACTION;
      const pyrWidth = PYR_HEIGHT * (pyrRegion.w / pyrRegion.h);
      const pyrX = (pyrWorldX - cameraX) * PYR_PARALLAX + CANVAS_WIDTH / 2 - pyrWidth / 2;
      ctx.save();
      ctx.globalAlpha = T.farPyramids.alpha ?? 1;
      ctx.filter = 'sepia(5%) saturate(112%) brightness(100%) contrast(112%)';
      ctx.drawImage(
        pyrImage,
        pyrRegion.x, pyrRegion.y, pyrRegion.w, pyrRegion.h,
        Math.round(pyrX), PYR_BASE_Y - PYR_HEIGHT, Math.round(pyrWidth), PYR_HEIGHT,
      );
      ctx.restore();
    }
    drawDesertBackgroundLayer(ctx, assets, 'midNecropolisRuins', { y: T.midNecropolisRuins.baseY - T.midNecropolisRuins.height, height: T.midNecropolisRuins.height }, {
      ...layerOptions,
      parallax: T.midNecropolisRuins.parallax,
      alpha: T.midNecropolisRuins.alpha,
      filter: 'sepia(3%) saturate(126%) brightness(103%) contrast(122%)',
    });
  }

  if (assets.atlas?.regions?.dustHaze && T.dustHaze?.alpha > 0.01) {
    drawDesertBackgroundLayer(
      ctx,
      assets,
      'dustHaze',
      { y: T.dustHaze.y, height: T.dustHaze.height },
      {
        ...layerOptions,
        parallax: T.dustHaze.parallax,
        alpha: T.dustHaze.alpha,
        filter: 'sepia(2%) saturate(104%) brightness(112%) contrast(100%)',
      },
    );
  }

  drawDesertEntryAtmosphericGrade(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, {
    groundY: isV3ProductionCandidate
      ? assets.atlas?.candidateGroundLaneWalkingSurfaceY ?? 538
      : T.groundLane.y,
    intensity: isV3ProductionCandidate ? 1.05 : 0.3,
  });

  // Placed Sphinx landmark: a single non-tiling monument grounded at the
  // necropolis floor, scrolling at mid parallax so the player approaches and
  // passes it. Position fraction, scale and base Y are dev-tunable.
  const sphinxRegion = assets.atlas?.regions?.desertSphinx;
  const sphinxImage = sphinxRegion?.image ? assets.images?.[sphinxRegion.image] : null;
  if (sphinxImage && sphinxRegion) {
    const SPHINX_SECTION_FRACTION = T.desertSphinx.sectionFraction; // where along desert-entry it is anchored
    const SPHINX_PARALLAX = T.desertSphinx.parallax;          // 1 = locked to the ground, lower = more distant
    const SPHINX_HEIGHT = T.desertSphinx.height;
    const SPHINX_BASE_Y = T.desertSphinx.baseY;            // screen Y of the Sphinx base (ground line)
    const sectionWidth = Math.max(1, section.end - section.start);
    const sphinxWorldX = section.start + sectionWidth * SPHINX_SECTION_FRACTION;
    const sphinxWidth = SPHINX_HEIGHT * (sphinxRegion.w / sphinxRegion.h);
    // True parallax: screen X drifts with actual camera movement (negative rate),
    // so the monument scrolls past as the player walks instead of following them.
    const sphinxX = (sphinxWorldX - cameraX) * SPHINX_PARALLAX + CANVAS_WIDTH / 2 - sphinxWidth / 2;
    if (sphinxX > -sphinxWidth && sphinxX < CANVAS_WIDTH + sphinxWidth) {
      // Tunable grade so the Sphinx sits in the weathered scene instead of reading as
      // bright polished gold (desertSphinx.brightness / .saturate, live in Layers panel).
      const sphinxBrightness = T.desertSphinx.brightness ?? 1;
      const sphinxSaturate = T.desertSphinx.saturate ?? 1;
      const sphinxContrast = T.desertSphinx.contrast ?? 1.04;
      const sphinxAlpha = Math.max(0, Math.min(1, T.desertSphinx.alpha ?? 1));
      ctx.save();
      ctx.globalAlpha = sphinxAlpha;
      ctx.filter = `sepia(5%) brightness(${sphinxBrightness}) saturate(${sphinxSaturate}) contrast(${sphinxContrast})`;
      ctx.drawImage(
        sphinxImage,
        sphinxRegion.x, sphinxRegion.y, sphinxRegion.w, sphinxRegion.h,
        Math.round(sphinxX), SPHINX_BASE_Y - SPHINX_HEIGHT, Math.round(sphinxWidth), SPHINX_HEIGHT,
      );
      ctx.restore();
    }
  }

  // Placed Ritual Chamber building: a tall, climbable stepped-pyramid facade drawn
  // world-locked (parallax ~1) at gameplay depth -- behind the player, who climbs
  // invisible platforms laid onto its terraces. Position / scale / base / opacity
  // are dev-tunable via the layer panel (ritualPyramid).
  const ritualRegion = assets.atlas?.regions?.ritualPyramid;
  const ritualImage = ritualRegion?.image ? assets.images?.[ritualRegion.image] : null;
  if (ritualImage && ritualRegion && T.ritualPyramid.alpha > 0.01) {
    const cfg = T.ritualPyramid;
    const ritualSectionWidth = Math.max(1, section.end - section.start);
    const ritualWorldX = section.start + ritualSectionWidth * cfg.sectionFraction;
    const ritualWidth = cfg.height * (ritualRegion.w / ritualRegion.h) * (cfg.widthScale ?? 1);
    const ritualX = (ritualWorldX - cameraX) * cfg.parallax + CANVAS_WIDTH / 2 - ritualWidth / 2;
    // Track the vertical climb-camera: the background frame draws BEFORE the
    // world's secretVerticalCameraOffset translate, so without this the building
    // stays screen-pinned while the platforms/player slide down as Asha climbs.
    const climbOffsetY = stateRef?.current?.secretVerticalCameraOffset || 0;
    if (ritualX > -ritualWidth && ritualX < CANVAS_WIDTH + ritualWidth) {
      ctx.save();
      ctx.globalAlpha = cfg.alpha;
      ctx.filter = `sepia(5%) brightness(${cfg.brightness ?? 1}) saturate(${cfg.saturate ?? 1}) contrast(${cfg.contrast ?? 1})`;
      ctx.drawImage(
        ritualImage,
        ritualRegion.x, ritualRegion.y, ritualRegion.w, ritualRegion.h,
        Math.round(ritualX), Math.round(cfg.baseY - cfg.height + climbOffsetY), Math.round(ritualWidth), cfg.height,
      );
      ctx.restore();
    }
  }
  if (!isV3ProductionCandidate) {
    drawDesertEntryLayerCohesionGrade(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, {
      groundY: T.groundLane.y,
      intensity: 0.68,
    });
  }
  if (assets.atlas?.devCandidateLabel) {
    ctx.save();
    ctx.font = '12px Georgia, serif';
    ctx.textBaseline = 'top';
    const label = assets.atlas.devCandidateLabel;
    const labelWidth = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(31, 20, 8, 0.82)';
    ctx.strokeStyle = 'rgba(244, 198, 112, 0.72)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(10, 38, labelWidth + 18, 24, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 232, 177, 0.94)';
    ctx.fillText(label, 19, 44);
    ctx.restore();
  }
  return true;
}

// World-locked, 1:1 scrolling ground lane for desert-entry. A near-locked backing
// layer sits below it as visual-only land mass so the playable path no longer reads
// as a floating ledge. Collision remains on the stable world floor. The backing and
// lane geometry are dev-tunable via DESERT_LAYER_TUNING (groundBacking / groundLane).

export function drawDesertEntryGroundLaneFrame(ctx, section, cameraX, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GROUND_Y,
    desertBackgroundAssetsRef,
    drawDesertBackgroundLayer,
    getSectionBackgroundAssets,
    stateRef,
  } = deps;
  if (section.id !== 'desert-entry') return false;
  const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'desert-entry');
  if (!assets?.loaded) return false;

  const T = DESERT_LAYER_TUNING;
  const isV3ProductionCandidate = assets.atlas?.devCandidateMode === 'v3-production-layers-test';
  const candidateGroundY = assets.atlas?.candidateGroundLaneWalkingSurfaceY ?? 538;
  const backingDrawn = isV3ProductionCandidate
    ? drawSingleGroundLayer(
      ctx,
      assets,
      'groundBacking',
      { y: assets.atlas?.candidateGroundBackingDrawY ?? 560 },
      { canvasWidth: CANVAS_WIDTH, cameraX, parallax: T.groundBacking.parallax, alpha: T.groundBacking.alpha },
    )
    : drawDesertBackgroundLayer(
      ctx,
      assets,
      'groundBacking',
      { y: T.groundBacking.y, height: T.groundBacking.height },
      {
        canvasWidth: CANVAS_WIDTH,
        cameraX,
        parallax: T.groundBacking.parallax,
        alpha: T.groundBacking.alpha,
      },
    );

  const drawn = isV3ProductionCandidate
    ? drawSingleGroundLayer(
      ctx,
      assets,
      'groundLane',
      { y: assets.atlas?.candidateGroundLaneDrawY ?? 148 },
      { canvasWidth: CANVAS_WIDTH, cameraX, parallax: T.groundLane.parallax, alpha: T.groundLane.alpha },
    )
    : drawDesertBackgroundLayer(
      ctx,
      assets,
      'groundLane',
      { y: T.groundLane.y, height: T.groundLane.height },
      { canvasWidth: CANVAS_WIDTH, cameraX, parallax: T.groundLane.parallax, alpha: T.groundLane.alpha },
    );

  // Soft contact shadow where the ruins meet the ground: grounds the
  // background onto the path and softens the boundary so it stops reading as a
  // hard ledge -- subtle, no clutter.
  drawDesertEntryPlayableFloorGrade(ctx, CANVAS_WIDTH, {
    groundY: isV3ProductionCandidate ? candidateGroundY : GROUND_Y,
    floorBottom: isV3ProductionCandidate ? 616 : Math.min(CANVAS_HEIGHT, T.groundLane.y + T.groundLane.height),
    intensity: isV3ProductionCandidate ? 0.72 : 0.42,
  });
  ctx.save();
  const contactShadow = ctx.createLinearGradient(0, GROUND_Y - 34, 0, GROUND_Y + 30);
  contactShadow.addColorStop(0, 'rgba(28, 17, 9, 0)');
  contactShadow.addColorStop(0.5, 'rgba(28, 17, 9, 0.11)');
  contactShadow.addColorStop(1, 'rgba(28, 17, 9, 0)');
  ctx.fillStyle = contactShadow;
  ctx.fillRect(0, GROUND_Y - 34, CANVAS_WIDTH, 64);
  ctx.restore();
  drawDesertEntryDryPlazaSeamBreakup(ctx, CANVAS_WIDTH, cameraX, {
    seamY: isV3ProductionCandidate ? candidateGroundY + 28 : T.groundLane.y + 35,
    intensity: isV3ProductionCandidate ? 1.18 : 1.12,
  });
  const rubbleDrawn = drawDesertBackgroundLayer(
    ctx,
    assets,
    'foregroundRubble',
    { y: T.foregroundRubble.y, height: T.foregroundRubble.height },
    {
      canvasWidth: CANVAS_WIDTH,
      cameraX,
      parallax: T.foregroundRubble.parallax,
      alpha: T.foregroundRubble.alpha,
    },
  );

  if (drawn && stateRef.current.renderStats) {
    stateRef.current.renderStats.desertEntryGroundLaneActive = true;
    stateRef.current.renderStats.desertEntryGroundLaneParallax = DESERT_LAYER_TUNING.groundLane.parallax;
  }
  if (backingDrawn && stateRef.current.renderStats) {
    stateRef.current.renderStats.desertEntryGroundBackingActive = true;
    stateRef.current.renderStats.desertEntryGroundBackingParallax = DESERT_LAYER_TUNING.groundBacking.parallax;
  }
  if (rubbleDrawn && stateRef.current.renderStats) {
    stateRef.current.renderStats.desertEntryForegroundRubbleActive = true;
  }
  return drawn || backingDrawn || rubbleDrawn;
}

export function drawChinaRiverValleyBackgroundFrame(ctx, cameraX, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    ENVIRONMENT_ASSET_PACK_IDS,
    backgroundPackId,
    desertBackgroundAssetsRef,
    drawDesertBackgroundLayer,
    environmentPackId,
    getSectionBackgroundAssets,
  } = deps;
  const isChinaRiverValleyBackground = backgroundPackId === 'china-river-valley'
    || environmentPackId === ENVIRONMENT_ASSET_PACK_IDS.CHINA_RIVER_VALLEY;
  if (!isChinaRiverValleyBackground) return false;
  const drawChinaFallbackBase = () => {
    ctx.save();
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0, '#7f9ca1');
    sky.addColorStop(0.48, '#d9c58f');
    sky.addColorStop(0.78, '#9a7a44');
    sky.addColorStop(1, '#5d482b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const distantRidge = ctx.createLinearGradient(0, 245, 0, 470);
    distantRidge.addColorStop(0, 'rgba(212, 222, 202, 0)');
    distantRidge.addColorStop(0.3, 'rgba(212, 222, 202, 0.28)');
    distantRidge.addColorStop(0.66, 'rgba(92, 116, 88, 0.2)');
    distantRidge.addColorStop(1, 'rgba(92, 116, 88, 0)');
    ctx.fillStyle = distantRidge;
    ctx.fillRect(0, 230, CANVAS_WIDTH, 260);

    const groundWash = ctx.createLinearGradient(0, CANVAS_HEIGHT - 170, 0, CANVAS_HEIGHT);
    groundWash.addColorStop(0, 'rgba(143, 107, 55, 0)');
    groundWash.addColorStop(0.42, 'rgba(143, 107, 55, 0.34)');
    groundWash.addColorStop(1, 'rgba(65, 47, 28, 0.56)');
    ctx.fillStyle = groundWash;
    ctx.fillRect(0, CANVAS_HEIGHT - 180, CANVAS_WIDTH, 180);
    ctx.restore();
  };
  const assets = getSectionBackgroundAssets(desertBackgroundAssetsRef.current, 'china-river-valley');
  if (!assets?.ready) {
    drawChinaFallbackBase();
    return true;
  }
  const layerOptions = { canvasWidth: CANVAS_WIDTH, cameraX };
  if (assets.atlas?.runtimeMode === 'layered-parallax') {
    // Five full-frame panoramic layers (each ~3:1, content positioned naturally in-frame),
    // drawn back-to-front at full canvas height with increasing parallax so their horizons
    // stay aligned while depth scrolls. The procedural base prevents old section art from
    // showing during route switches or if any alpha-keyed layer leaves uncovered pixels.
    drawChinaFallbackBase();
    const full = { y: 0, height: CANVAS_HEIGHT };
    const skyDrawn = drawDesertBackgroundLayer(ctx, assets, 'skyLayer', full, { ...layerOptions, parallax: 0.01, alpha: 1 });
    if (!skyDrawn) return true;
    drawDesertBackgroundLayer(ctx, assets, 'farMountains',    full, { ...layerOptions, parallax: 0.045, alpha: 0.9 });
    drawDesertBackgroundLayer(ctx, assets, 'riverValley',     full, { ...layerOptions, parallax: 0.1,  alpha: 1 });
    drawDesertBackgroundLayer(ctx, assets, 'watchtowerRidge', full, { ...layerOptions, parallax: 0.2,  alpha: 1 });
    drawDesertBackgroundLayer(ctx, assets, 'foregroundMist',  full, { ...layerOptions, parallax: 0.36, alpha: 0.92 });
    return true;
  }
  // Only the layered-parallax atlas ships today. Any other or unknown runtimeMode
  // falls back to the opaque procedural base so the China frame stays owned (no
  // old-section bleed) instead of drawing against deleted river-valley slice art.
  drawChinaFallbackBase();
  return true;
}

export function drawDesertJourneyPanelLayerFrame(ctx, panel, layer, cameraX, now, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    DESERT_JOURNEY_SCENE_PANELS,
  } = deps;
  const clipLeft = Math.max(0, Math.floor(panel.worldStart - cameraX));
  const clipRight = Math.min(CANVAS_WIDTH, Math.ceil(panel.worldEnd - cameraX));
  if (clipRight <= clipLeft) return false;

  const panelIndex = DESERT_JOURNEY_SCENE_PANELS.findIndex(item => item.id === panel.id);
  const panelSpan = panel.worldEnd - panel.worldStart;
  const cameraDelta = cameraX - panel.worldStart;
  const layerOriginX = -cameraDelta * layer.parallax;
  const at = (relativeX) => layerOriginX + relativeX;
  const wave = Math.sin(now / 2600 + panelIndex * 0.9) * 1.8;

  const drawDuneBand = (baseY, amplitude, color, alpha, phase = 0) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(clipLeft - 120, CANVAS_HEIGHT + 40);
    for (let x = clipLeft - 120; x <= clipRight + 140; x += 56) {
      const worldWaveX = x + cameraX * layer.parallax + panelIndex * 180;
      const y = baseY
        + Math.sin(worldWaveX * 0.004 + phase) * amplitude
        + Math.cos(worldWaveX * 0.0017 + phase * 0.6) * amplitude * 0.52;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(clipRight + 140, CANVAS_HEIGHT + 40);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawPyramid = (x, y, width, height, color, alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width / 2, y - height);
    ctx.lineTo(x + width, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 219, 144, 0.08)';
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y - height);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width * 0.62, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  ctx.save();
  ctx.beginPath();
  ctx.rect(clipLeft, 0, clipRight - clipLeft, CANVAS_HEIGHT);
  ctx.clip();

  if (layer.role === 'sky') {
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0, '#172033');
    sky.addColorStop(0.28, '#5f5144');
    sky.addColorStop(0.56, '#c28d4d');
    sky.addColorStop(1, '#6d4b2b');
    ctx.fillStyle = sky;
    ctx.fillRect(clipLeft, 0, clipRight - clipLeft, CANVAS_HEIGHT);

    if (panel.id === 'opening' || panel.id === 'ravine-bridge') {
      const sunX = panel.id === 'opening' ? at(250) : at(170);
      const sunY = 102 + wave;
      const glow = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 250);
      glow.addColorStop(0, 'rgba(255, 226, 142, 0.72)');
      glow.addColorStop(0.2, 'rgba(247, 181, 82, 0.24)');
      glow.addColorStop(1, 'rgba(247, 181, 82, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(clipLeft, 0, clipRight - clipLeft, CANVAS_HEIGHT);
      ctx.fillStyle = 'rgba(255, 236, 169, 0.86)';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    const haze = ctx.createLinearGradient(0, panel.horizonY - 70, 0, panel.horizonY + 90);
    haze.addColorStop(0, 'rgba(245, 196, 104, 0)');
    haze.addColorStop(0.45, 'rgba(245, 196, 104, 0.18)');
    haze.addColorStop(1, 'rgba(245, 196, 104, 0)');
    ctx.fillStyle = haze;
    ctx.fillRect(clipLeft, panel.horizonY - 80, clipRight - clipLeft, 180);
  } else if (layer.role === 'far') {
    drawDuneBand(322, 18, '#9a733f', 0.28, 0.5);
    drawDuneBand(365, 24, '#8b6236', 0.32, 1.3);
    const farBase = panel.horizonY + 102;
    [
      [at(120), farBase, 270, 135, 0.18],
      [at(panelSpan * 0.42), farBase + 6, 210, 96, 0.14],
      [at(panelSpan * 0.78), farBase + 2, 245, 112, 0.16],
    ].forEach(([x, y, width, height, alpha]) => {
      drawPyramid(x, y, width, height, '#d1a064', alpha);
    });
    if (panel.id === 'scribe-to-queen-gateway') {
      drawPyramid(at(panelSpan * 0.72), farBase + 18, 360, 164, '#bc874d', 0.2);
    }
  } else if (layer.role === 'mid') {
    drawDuneBand(448, 15, '#7c5731', 0.22, 2.2);
    const baseY = panel.groundY - 55;
    if (panel.id === 'opening') {
      drawPyramid(at(90), baseY + 4, 440, 250, '#b47a41', 0.62);
    } else if (panel.id === 'ravine-bridge') {
      const leftCliff = at(350);
      const rightCliff = at(panelSpan - 250);
      ctx.fillStyle = '#6d432a';
      ctx.beginPath();
      ctx.moveTo(leftCliff - 520, baseY - 12);
      ctx.lineTo(leftCliff + 250, baseY - 28);
      ctx.lineTo(leftCliff + 160, CANVAS_HEIGHT + 30);
      ctx.lineTo(leftCliff - 560, CANVAS_HEIGHT + 30);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#744a2d';
      ctx.beginPath();
      ctx.moveTo(rightCliff - 160, baseY - 36);
      ctx.lineTo(rightCliff + 620, baseY - 20);
      ctx.lineTo(rightCliff + 660, CANVAS_HEIGHT + 30);
      ctx.lineTo(rightCliff - 90, CANVAS_HEIGHT + 30);
      ctx.closePath();
      ctx.fill();
    } else {
      drawDuneBand(baseY + 18, 12, 'rgba(133, 89, 48, 0.2)', 1, panelIndex * 0.7);
      drawDuneBand(baseY + 48, 10, 'rgba(211, 143, 67, 0.14)', 1, panelIndex * 0.9);
    }
  } else if (layer.role === 'ground') {
    const ground = ctx.createLinearGradient(0, panel.groundY - 126, 0, CANVAS_HEIGHT);
    ground.addColorStop(0, 'rgba(197, 131, 59, 0.18)');
    ground.addColorStop(0.42, '#a56b34');
    ground.addColorStop(1, '#5b3823');
    ctx.fillStyle = ground;
    ctx.fillRect(clipLeft, panel.groundY - 116, clipRight - clipLeft, CANVAS_HEIGHT - panel.groundY + 116);

    if (panel.id === 'ravine-bridge') {
      const gapLeft = at(650);
      const gapRight = at(1590);
      const chasm = ctx.createLinearGradient(0, panel.groundY - 72, 0, CANVAS_HEIGHT);
      chasm.addColorStop(0, 'rgba(58, 31, 23, 0.72)');
      chasm.addColorStop(0.46, 'rgba(21, 19, 22, 0.94)');
      chasm.addColorStop(1, 'rgba(6, 8, 12, 0.98)');
      ctx.fillStyle = chasm;
      ctx.beginPath();
      ctx.moveTo(gapLeft, panel.groundY - 54);
      ctx.lineTo(gapRight, panel.groundY - 58);
      ctx.lineTo(gapRight + 128, CANVAS_HEIGHT + 30);
      ctx.lineTo(gapLeft - 126, CANVAS_HEIGHT + 30);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(16, 14, 16, 0.5)';
      ctx.fillRect(gapLeft + 120, panel.groundY - 36, Math.max(80, gapRight - gapLeft - 240), 110);
    } else {
      drawDuneBand(panel.groundY - 48, 12, 'rgba(218, 151, 73, 0.38)', 1, 1.6);
    }

    ctx.strokeStyle = 'rgba(255, 218, 142, 0.08)';
    ctx.lineWidth = 1.1;
    for (let line = 0; line < 7; line += 1) {
      const y = panel.groundY - 84 + line * 24;
      ctx.beginPath();
      for (let x = clipLeft - 80; x <= clipRight + 80; x += 80) {
        const ripple = Math.sin((x + cameraX * 0.23) * 0.015 + line + panelIndex) * 5;
        if (x === clipLeft - 80) ctx.moveTo(x, y + ripple);
        else ctx.lineTo(x, y + ripple);
      }
      ctx.stroke();
    }
  } else if (layer.role === 'foreground') {
    const haze = ctx.createLinearGradient(0, panel.groundY - 74, 0, CANVAS_HEIGHT);
    haze.addColorStop(0, 'rgba(232, 165, 91, 0)');
    haze.addColorStop(0.55, 'rgba(232, 165, 91, 0.16)');
    haze.addColorStop(1, 'rgba(86, 50, 29, 0.24)');
    ctx.fillStyle = haze;
    ctx.fillRect(clipLeft, panel.groundY - 90, clipRight - clipLeft, CANVAS_HEIGHT - panel.groundY + 90);

    for (let i = 0; i < 18; i += 1) {
      const x = at((i * 173 + panelIndex * 91) % Math.max(panelSpan, 1));
      const y = panel.groundY - 22 + Math.sin(i * 1.7 + panelIndex) * 14;
      ctx.fillStyle = i % 4 === 0 ? 'rgba(66, 42, 27, 0.24)' : 'rgba(189, 119, 55, 0.2)';
      ctx.beginPath();
      ctx.ellipse(x, y, 10 + (i % 5) * 3, 3 + (i % 3), -0.08 * i, 0, Math.PI * 2);
      ctx.fill();
    }

    if (panel.id === 'ravine-bridge') {
      const center = at(1120);
      const shadow = ctx.createRadialGradient(center, panel.groundY - 20, 40, center, panel.groundY + 40, 460);
      shadow.addColorStop(0, 'rgba(6, 7, 10, 0.72)');
      shadow.addColorStop(0.45, 'rgba(20, 16, 17, 0.44)');
      shadow.addColorStop(1, 'rgba(20, 16, 17, 0)');
      ctx.fillStyle = shadow;
      ctx.fillRect(center - 560, panel.groundY - 130, 1120, 300);
    }
  }

  ctx.restore();
  return true;
}

export function drawDesertJourneyTransitionMaskFrame(ctx, transition, cameraX, now, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
  } = deps;
  const x = transition.worldX - cameraX;
  if (x + transition.width / 2 < -80 || x - transition.width / 2 > CANVAS_WIDTH + 80) return false;
  const w = transition.width;
  const left = x - w / 2;
  const shimmer = Math.sin(now / 1200 + transition.worldX * 0.002) * 5;

  ctx.save();
  if (transition.mask === 'dust-haze' || transition.mask === 'sandstorm-overlay') {
    const dust = ctx.createLinearGradient(left, 0, left + w, 0);
    dust.addColorStop(0, 'rgba(226, 159, 82, 0)');
    dust.addColorStop(0.4, 'rgba(226, 159, 82, 0.48)');
    dust.addColorStop(0.54, 'rgba(246, 204, 127, 0.42)');
    dust.addColorStop(0.68, 'rgba(245, 205, 128, 0.34)');
    dust.addColorStop(1, 'rgba(226, 159, 82, 0)');
    ctx.fillStyle = dust;
    ctx.fillRect(left, 0, w, CANVAS_HEIGHT);
  } else if (transition.mask === 'cliff-wall') {
    const rock = ctx.createLinearGradient(left, 0, left + w, 0);
    rock.addColorStop(0, 'rgba(55, 34, 25, 0)');
    rock.addColorStop(0.42, 'rgba(83, 50, 31, 0.78)');
    rock.addColorStop(0.58, 'rgba(121, 78, 42, 0.7)');
    rock.addColorStop(1, 'rgba(55, 34, 25, 0)');
    ctx.fillStyle = rock;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.16, 270);
    ctx.lineTo(x + w * 0.12, 248 + shimmer);
    ctx.lineTo(x + w * 0.26, CANVAS_HEIGHT + 20);
    ctx.lineTo(x - w * 0.3, CANVAS_HEIGHT + 20);
    ctx.closePath();
    ctx.fill();
  } else if (transition.mask === 'broken-pillar') {
    ctx.fillStyle = 'rgba(96, 61, 35, 0.78)';
    ctx.fillRect(x - 32, 276 + shimmer, 64, 318);
    ctx.fillRect(x - 58, 264 + shimmer, 116, 20);
    ctx.fillStyle = 'rgba(176, 112, 55, 0.24)';
    ctx.fillRect(x - 18, 290 + shimmer, 12, 286);
    ctx.fillRect(x + 14, 286 + shimmer, 9, 292);
  } else if (transition.mask === 'temple-doorway') {
    const floorShadow = ctx.createRadialGradient(x, 556, 18, x, 558, 188);
    floorShadow.addColorStop(0, 'rgba(31, 22, 17, 0.28)');
    floorShadow.addColorStop(0.48, 'rgba(61, 40, 25, 0.14)');
    floorShadow.addColorStop(1, 'rgba(168, 102, 45, 0)');
    ctx.fillStyle = floorShadow;
    ctx.fillRect(x - 220, 478, 440, 132);

    const doorwayShade = ctx.createLinearGradient(x - 62, 0, x + 62, 0);
    doorwayShade.addColorStop(0, 'rgba(24, 18, 16, 0.06)');
    doorwayShade.addColorStop(0.5, 'rgba(18, 15, 14, 0.3)');
    doorwayShade.addColorStop(1, 'rgba(24, 18, 16, 0.06)');
    ctx.fillStyle = doorwayShade;
    ctx.fillRect(x - 62, 304, 124, 230);

    ctx.fillStyle = 'rgba(103, 67, 39, 0.52)';
    ctx.fillRect(x - 108, 268 + shimmer, 44, 292);
    ctx.fillRect(x + 64, 268 + shimmer, 44, 292);
    ctx.fillRect(x - 112, 250 + shimmer, 224, 30);
    ctx.fillStyle = 'rgba(197, 130, 62, 0.16)';
    ctx.fillRect(x - 94, 282 + shimmer, 8, 258);
    ctx.fillRect(x + 82, 282 + shimmer, 8, 258);
  } else if (transition.mask === 'ruined-arch') {
    ctx.strokeStyle = 'rgba(92, 59, 35, 0.78)';
    ctx.lineWidth = 42;
    ctx.beginPath();
    ctx.arc(x, 452, 138, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = 'rgba(84, 55, 35, 0.62)';
    ctx.fillRect(x - 168, 420, 56, 190);
    ctx.fillRect(x + 112, 420, 56, 190);
  } else if (transition.mask === 'shadowed-corridor') {
    const corridor = ctx.createLinearGradient(left, 0, left + w, 0);
    corridor.addColorStop(0, 'rgba(38, 27, 25, 0)');
    corridor.addColorStop(0.36, 'rgba(30, 22, 24, 0.5)');
    corridor.addColorStop(0.62, 'rgba(92, 60, 39, 0.4)');
    corridor.addColorStop(1, 'rgba(38, 27, 25, 0)');
    ctx.fillStyle = corridor;
    ctx.fillRect(left, 188, w, CANVAS_HEIGHT - 188);
    ctx.fillStyle = 'rgba(236, 181, 101, 0.18)';
    for (let i = 0; i < 14; i += 1) {
      const px = left + ((i * 71 + now * 0.012) % w);
      ctx.beginPath();
      ctx.ellipse(px, 310 + i * 19, 10 + (i % 3) * 4, 2.5, -0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  return true;
}

export function drawDesertJourneyScenePanelsFrame(ctx, current, cameraX, now, deps) {
  const {
    CANVAS_WIDTH,
    DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION,
    DESERT_JOURNEY_LAYER_ROLES,
    getDesertJourneyPanelsForViewport,
  } = deps;
  const panels = getDesertJourneyPanelsForViewport(cameraX, CANVAS_WIDTH, 160);
  if (panels.length === 0) return false;

  let layerDrawCount = 0;
  DESERT_JOURNEY_LAYER_ROLES.forEach((role) => {
    panels.forEach((panel) => {
      const layer = panel.layers.find(item => item.role === role);
      if (layer && drawDesertJourneyPanelLayerFrame(ctx, panel, layer, cameraX, now, deps)) {
        layerDrawCount += 1;
      }
    });
  });

  if (current.renderStats) {
    current.renderStats.desertJourneyBackgroundSystemVersion = DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION;
    current.renderStats.desertJourneyPanelIds = panels.map(panel => panel.id);
    current.renderStats.desertJourneyLayerRoles = DESERT_JOURNEY_LAYER_ROLES;
    current.renderStats.desertJourneyLayerDrawCount = layerDrawCount;
  }

  return layerDrawCount > 0;
}

export function drawDesertJourneySceneMasksFrame(ctx, current, cameraX, now, deps) {
  const {
    CANVAS_WIDTH,
    getDesertJourneyTransitionMasksForViewport,
  } = deps;
  const masks = getDesertJourneyTransitionMasksForViewport(cameraX, CANVAS_WIDTH, 220);
  const drawnMasks = masks.filter(mask => drawDesertJourneyTransitionMaskFrame(ctx, mask, cameraX, now, deps));

  if (current.renderStats) {
    current.renderStats.desertJourneyTransitionMasks = drawnMasks.map(mask => mask.mask);
  }

  return drawnMasks.length > 0;
}

export function drawSectionTransitionBlendFrame(ctx, cameraX, deps) {
  const {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GROUND_Y,
    SECTIONS,
    drawGroundDustLip,
    getSectionForX,
  } = deps;
  SECTIONS.slice(1).forEach((section) => {
    const x = section.start - cameraX;
    if (x < -140 || x > CANVAS_WIDTH + 140) return;
    const previousSection = getSectionForX(section.start - 1);
    const fromColor = previousSection.id === 'catacombs'
      ? 'rgba(55, 42, 30, 0.34)'
      : previousSection.id === 'escape-sequence'
        ? 'rgba(126, 74, 35, 0.3)'
        : 'rgba(177, 115, 54, 0.24)';
    const toColor = section.id === 'catacombs'
      ? 'rgba(55, 42, 30, 0.34)'
      : section.id === 'escape-sequence'
        ? 'rgba(126, 74, 35, 0.3)'
        : 'rgba(177, 115, 54, 0.24)';
    const gradient = ctx.createLinearGradient(x - 92, 0, x + 92, 0);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.35, fromColor);
    gradient.addColorStop(0.65, toColor);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 96, GROUND_Y - 18, 192, CANVAS_HEIGHT - GROUND_Y + 28);
    drawGroundDustLip(ctx, x, GROUND_Y + 2, 150, 'rgba(216, 154, 82, 0.22)');
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = section.id === 'catacombs' ? '#5b4630' : '#b87835';
    ctx.beginPath();
    ctx.ellipse(x - 28, GROUND_Y + 3, 34, 5, -0.12, 0, Math.PI * 2);
    ctx.ellipse(x + 36, GROUND_Y + 4, 42, 6, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

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

      const abdomenSx = isAttacking ? 0.94 : isWindup ? 1.06 : 1 + slowPulse * 0.025;
      const abdomenSy = isAttacking ? 1.06 : isWindup ? 0.94 : 1;
      const bodyOffsetY = isWindup ? -2 : isAttacking ? 1 : isCooldown ? 3 : stunned ? 2 : 0;
      ctx.strokeStyle = stunned ? 'rgba(210, 190, 165, 0.88)' : '#7c2d12';
      ctx.fillStyle = stunned ? '#8a6535' : '#a16207';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(centerX, bodyY + bodyOffsetY, enemy.width * 0.38 * abdomenSx, enemy.height * 0.34 * abdomenSy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const headShift = isAttacking ? facing * 3 : isWindup ? -facing * 1 : 0;
      ctx.fillStyle = stunned ? '#6b4e28' : '#78350f';
      ctx.beginPath();
      ctx.ellipse(centerX + facing * enemy.width * 0.27 + headShift, bodyY - 2 + bodyOffsetY, enemy.width * 0.18, enemy.height * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const pinchSpread = isAttacking ? 7 : isWindup ? 5 : 3.5;
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
      const legSplay = isCooldown ? 1.18 : isWindup ? 1.08 : isAttacking ? 0.86 : defeated ? 0.7 : 1;
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
      } else if (isWindup) {
        tailCpX = centerX - facing * enemy.width * 0.42; tailCpY = bodyY - 42;
        tailTipX = centerX - facing * enemy.width * 0.04; tailTipY = bodyY - 44 - fastPulse * 2;
      } else if (isAttacking) {
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
    const windupDuration = Math.max(0.001, pattern.windup || 0.4);
    const charge = clamp(1 - enemy.attackWindup / windupDuration, 0, 1);
    const isUnblockable = !telegraph.parryable;
    const ringR = enemy.width * 0.6;

    if (!pattern.ranged) {
      ctx.globalAlpha = (0.14 + charge * 0.2) * (isUnblockable ? 1.1 : 1);
      ctx.fillStyle = telegraph.color;
      ctx.beginPath();
      ctx.roundRect(boxX, attackBox.y, attackBox.width, attackBox.height, 6);
      ctx.fill();
      ctx.globalAlpha = 0.3 + charge * 0.4;
      ctx.lineWidth = 1.5 + charge;
      ctx.strokeStyle = telegraph.color;
      ctx.stroke();
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
      const auraPulse = 0.5 + Math.sin(now / 130) * 0.5;
      ctx.globalAlpha = 0.3 + auraPulse * 0.45 + charge * 0.2;
      ctx.lineWidth = 2 + auraPulse * 2;
      ctx.strokeStyle = telegraph.color;
      ctx.shadowColor = telegraph.glow;
      ctx.shadowBlur = 8 + auraPulse * 10;
      ctx.beginPath();
      ctx.ellipse(screenX + enemy.width / 2, enemy.y + enemy.height * 0.5, enemy.width * 0.58, enemy.height * 0.52, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (attackActive) {
    const parryNow = telegraph.parryable && enemy.attackTimer <= PARRY_WINDOW_DURATION;
    if (!pattern.ranged) {
      ctx.globalAlpha = parryNow ? 0.32 : 0.16;
      ctx.fillStyle = parryNow ? '#fff7cc' : telegraph.color;
      ctx.beginPath();
      ctx.roundRect(boxX, attackBox.y, attackBox.width, attackBox.height, 6);
      ctx.fill();
      if (parryNow) {
        ctx.globalAlpha = 0.82;
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#fff2b0';
        ctx.shadowColor = 'rgba(255, 240, 170, 0.7)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(boxX, attackBox.y, attackBox.width, attackBox.height, 6);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

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

export function useJourneyRenderer(deps) {
  return {
    draw: deps.draw,
    drawAncientRouteGround: (ctx, section, cameraX, now, current) => (
      drawAncientRouteGroundFrame(ctx, section, cameraX, now, current, deps)
    ),
    drawArrivalThresholdDoorwayOccluder: (ctx, current, now) => (
      drawArrivalThresholdDoorwayOccluderFrame(ctx, current, now, deps)
    ),
    drawArrivalThresholdScene: (ctx, current, now) => drawArrivalThresholdSceneFrame(ctx, current, now, deps),
    drawArrivalThresholdTrial: (ctx, current, now) => drawArrivalThresholdTrialFrame(ctx, current, now, deps),
    drawAttackArc: () => drawAttackArcFrame(),
    drawBuriedStoneCausewaySurface: (ctx, platform, x, cameraX, now) => (
      drawBuriedStoneCausewaySurfaceFrame(ctx, platform, x, cameraX, now, deps)
    ),
    drawBossSprite: (ctx, boss, screenX, now, bossVisualState) => (
      drawBossSpriteFrame(ctx, boss, screenX, now, bossVisualState, deps)
    ),
    drawCollectible: (ctx, x, y, cameraX, now, label, color, hidden = false, isShard = false, sprite = {}) => (
      drawCollectibleFrame(ctx, x, y, cameraX, now, label, color, hidden, isShard, sprite, deps)
    ),
    drawCombatEffects: (ctx, effects, cameraX) => drawCombatEffectsFrame(ctx, effects, cameraX, deps),
    drawDesertEntryGroundMotionCues: (ctx, player, cameraX, now) => (
      drawDesertEntryGroundMotionCuesFrame(ctx, player, cameraX, now, deps)
    ),
    drawCinematicCards: (ctx, current) => drawCinematicCardsFrame(ctx, current, deps),
    drawChinaRiverValleyBackground: (ctx, cameraX) => drawChinaRiverValleyBackgroundFrame(ctx, cameraX, deps),
    drawConnectedWorldAmbientLife: (ctx, section, cameraX, now) => (
      drawConnectedWorldAmbientLifeFrame(ctx, section, cameraX, now, deps)
    ),
    drawDesertEntryBackground: (ctx, section, cameraX) => drawDesertEntryBackgroundFrame(ctx, section, cameraX, deps),
    drawDesertEntryGroundLane: (ctx, section, cameraX) => drawDesertEntryGroundLaneFrame(ctx, section, cameraX, deps),
    drawDesertEntryForegroundDepth: (ctx, section, cameraX, now) => (
      drawDesertEntryForegroundDepthFrame(ctx, section, cameraX, now, deps)
    ),
    drawDesertForegroundAtmosphere: (ctx, section, cameraX) => (
      drawDesertForegroundAtmosphereFrame(ctx, section, cameraX, deps)
    ),
    drawDesertJourneySceneMasks: (ctx, current, cameraX, now) => (
      drawDesertJourneySceneMasksFrame(ctx, current, cameraX, now, deps)
    ),
    drawDesertJourneyScenePanels: (ctx, current, cameraX, now) => (
      drawDesertJourneyScenePanelsFrame(ctx, current, cameraX, now, deps)
    ),
    drawDebugPlatformOverlay: (ctx, current, cameraX) => drawDebugPlatformOverlayFrame(ctx, current, cameraX, deps),
    drawEgyptAmbientLife: (ctx, section, cameraX, now) => drawEgyptAmbientLifeFrame(ctx, section, cameraX, now, deps),
    drawEnemyAttackTell: (ctx, enemy, screenX, cameraX, now, boss = false) => (
      drawEnemyAttackTellFrame(ctx, enemy, screenX, cameraX, now, boss, deps)
    ),
    drawForegroundDepthLayer: (ctx, section, cameraX, now) => (
      drawForegroundDepthLayerFrame(ctx, section, cameraX, now, deps)
    ),
    drawForegroundOccluderProps: (ctx, current, cameraX, now) => (
      drawForegroundOccluderPropsFrame(ctx, current, cameraX, now, deps)
    ),
    drawWorldContinuityLandmark: (ctx, landmark, cameraX, now) => (
      drawWorldContinuityLandmarkFrame(ctx, landmark, cameraX, now, deps)
    ),
    drawStageEntranceFeature: (ctx, feature, cameraX, now) => (
      drawStageEntranceFeatureFrame(ctx, feature, cameraX, now, deps)
    ),
    drawDynamicEnvironmentEvent: (ctx, event, cameraX, now, timer = 0) => (
      drawDynamicEnvironmentEventFrame(ctx, event, cameraX, now, timer, deps)
    ),
    drawEnvironmentInteraction: (ctx, item, cameraX, now, current) => (
      drawEnvironmentInteractionFrame(ctx, item, cameraX, now, current, deps)
    ),
    drawRouteGate: (ctx, gate, screenX, current, complete, layer = 'base', doorway = null) => (
      drawRouteGateFrame(ctx, gate, screenX, current, complete, layer, doorway, deps)
    ),
    drawHazard: (ctx, hazard, cameraX, current, now) => drawHazardFrame(ctx, hazard, cameraX, current, now, deps),
    drawDiscoveryEntrance: (ctx, entrance, cameraX, current, now) => (
      drawDiscoveryEntranceFrame(ctx, entrance, cameraX, current, now, deps)
    ),
    drawPremiumEgyptianChamberDoor: (ctx, door, cameraX, current, now) => (
      drawPremiumEgyptianChamberDoorFrame(ctx, door, cameraX, current, now, deps)
    ),
    drawForgottenMuralChamberTransition: (ctx, scene) => drawForgottenMuralChamberTransitionFrame(ctx, scene, deps),
    drawHiddenRouteHint: (ctx, route, cameraX, current, now) => (
      drawHiddenRouteHintFrame(ctx, route, cameraX, current, now, deps)
    ),
    drawLinkedEnemySprite: (ctx, enemy, screenX, now, shakeX = 0) => (
      drawLinkedEnemySpriteFrame(ctx, enemy, screenX, now, shakeX, deps)
    ),
    drawMiniBoss: (ctx, boss, screenX, now) => drawMiniBossFrame(ctx, boss, screenX, now, deps),
    drawMissingObjectiveMarker: (ctx, guidance, cameraX, now) => (
      drawMissingObjectiveMarkerFrame(ctx, guidance, cameraX, now, deps)
    ),
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
    drawPlayerFeedbackOverlays: (ctx, current, cameraX, secretVerticalCameraOffset, now) => (
      drawPlayerFeedbackOverlaysFrame(ctx, current, cameraX, secretVerticalCameraOffset, now, deps)
    ),
    drawPropPlacementEditorOverlay: (ctx, current, cameraX) => (
      drawPropPlacementEditorOverlayFrame(ctx, current, cameraX, deps)
    ),
    drawStoryProp: (ctx, prop, cameraX, now, requestedDepth = null) => (
      drawStoryPropFrame(ctx, prop, cameraX, now, requestedDepth, deps)
    ),
    drawSectionParallaxBackground: (ctx, section, cameraX) => (
      drawSectionParallaxBackgroundFrame(ctx, section, cameraX, deps)
    ),
    drawSectionParallaxForeground: (ctx, section, cameraX) => (
      drawSectionParallaxForegroundFrame(ctx, section, cameraX, deps)
    ),
    drawSectionTransitionBlend: (ctx, cameraX) => drawSectionTransitionBlendFrame(ctx, cameraX, deps),
    drawScarabQueenLairOpeningProp: (ctx, worldCenterX, cameraX, now, beat = null, placement = null) => (
      drawScarabQueenLairOpeningPropFrame(ctx, worldCenterX, cameraX, now, beat, placement, deps)
    ),
    drawSmallEnemySprite: (ctx, enemy, screenX, now, shakeX = 0) => (
      drawSmallEnemySpriteFrame(ctx, enemy, screenX, now, shakeX, deps)
    ),
    drawStageEntranceForegroundOccluder: (ctx, feature, cameraX) => (
      drawStageEntranceForegroundOccluderFrame(ctx, feature, cameraX, deps)
    ),
    drawTempleBackdrop: (ctx, section, cameraX) => drawTempleBackdropFrame(ctx, section, cameraX, deps),
    getOpeningSphinxSpriteFrame: (encounter, now) => getOpeningSphinxSpriteFrame(encounter, now, deps),
    drawTempleThresholdTransition: (ctx, scene, now) => drawTempleThresholdTransitionFrame(ctx, scene, now, deps),
    drawTrapProjectile: (ctx, projectile, cameraX) => drawTrapProjectileFrame(ctx, projectile, cameraX, deps),
    drawWorldTransitionMarker: (ctx, marker, cameraX, now) => (
      drawWorldTransitionMarkerFrame(ctx, marker, cameraX, now, deps)
    ),
  };
}
