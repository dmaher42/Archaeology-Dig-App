import { useCallback } from 'react';

import { drawExcavationMapRegion } from './expedition/expeditionMapAssets';
import { EXPEDITION_ROOM_CONNECTIONS } from './expedition/expeditionMapLayout';
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  PLAYER_SIZE,
} from './expeditionDigData.js';
import { evidenceVisibleForGrid } from './expeditionDigLogic.js';

/* eslint-disable react-hooks/exhaustive-deps -- every dependency the rule flags in this file
   is a stable ref or a module-level helper passed in from the component; none change across
   renders, so omitting them from dependency arrays is correct and preserves the original
   pre-extraction behaviour. */

// Per-frame excavation-map render loop. Extracted wholesale from ExpeditionMode as a pure
// mechanical move: the entire `draw` render useCallback (background, grid, room connections,
// zones, hazards, walls, exit gate, evidence tokens, mythic guardians, player avatar, late-pass
// state markers, and the Diablo-style shroud/spotlight overlay) relocated here verbatim with its
// original statement order, draw-call order, and useCallback dependency array unchanged. Every
// component-owned ref/state value and base-data table is passed in via the deps object so the
// live render path is byte-for-byte identical.
export function useExpeditionDigDraw({
  canvasRef,
  cameraRef,
  tokensRef,
  guardiansRef,
  playerRef,
  shroudRectRef,
  excavationMapAssets,
  mapTheme,
  roomMapPackId,
  gatewayPackId,
  mapZones,
  terrainByZone,
  selectedSurveyZone,
  selectedMapZone,
  markerPackId,
  mapHazards,
  mapUiPackId,
  mapWalls,
  missionEvidenceCount,
  missionRequiredCount,
  openedGridSquares,
  surveyRevealLinks,
  gridZoneConfigs,
  surveyedZones,
  completedZoneChallenges,
  surveyZoneById,
  targetCivilisation,
}) {
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    const now = Date.now();
    const assetsReady = excavationMapAssets.loaded && excavationMapAssets.image && !excavationMapAssets.failed;

    const fillRoundRect = (x, y, w, h, radius) => {
      const r = Math.min(radius, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
    };

    // 1. Better Background (Subtle radial gradient)
    const bgGradient = ctx.createRadialGradient(MAP_WIDTH/2, MAP_HEIGHT/2, MAP_WIDTH/4, MAP_WIDTH/2, MAP_HEIGHT/2, MAP_WIDTH);
    bgGradient.addColorStop(0, mapTheme.backgroundInner);
    bgGradient.addColorStop(1, mapTheme.backgroundOuter);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Camera translation start
    ctx.save();
    ctx.translate(-cameraRef.current.x, -cameraRef.current.y);

    if (assetsReady) {
      for (let x = 0; x < MAP_WIDTH; x += 145) {
        for (let y = 0; y < MAP_HEIGHT; y += 96) {
          drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:neutralExcavationTerrain`, { x, y, w: 150, h: 100 }, { alpha: mapTheme.neutralTileAlpha });
        }
      }
      drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:gridOverlay`, { x: 318, y: 230, w: 168, h: 110 }, { alpha: mapTheme.gridOverlayAlpha });
    }

    // 2. Map Grid (Ultra Faint)
    ctx.strokeStyle = mapTheme.gridLineColor;
    ctx.lineWidth = 1;
    for (let x = 0; x <= MAP_WIDTH; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, MAP_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y <= MAP_HEIGHT; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(MAP_WIDTH, y); ctx.stroke();
    }

    if (assetsReady) {
      for (let x = 18; x < MAP_WIDTH; x += 260) {
        drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:surveyStringHorizontal`, { x, y: 212, w: 190, h: 7 }, { alpha: mapTheme.surveyLineAlpha });
        drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:surveyStringHorizontal`, { x: x + 40, y: 414, w: 190, h: 7 }, { alpha: mapTheme.surveyLineSecondaryAlpha });
      }
      for (let x = 252; x < MAP_WIDTH; x += 260) {
        drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:surveyStringVertical`, { x, y: 24, w: 150, h: 6 }, { alpha: mapTheme.surveyLineSecondaryAlpha, rotation: Math.PI / 2 });
      }
      [
        [260, 214], [522, 214], [318, 414], [580, 414], [720, 220],
      ].forEach(([x, y]) => {
        drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:surveyPeg`, { x, y, w: 14, h: 26 }, { alpha: mapTheme.surveyPegAlpha, fit: 'contain' });
      });
    }

    EXPEDITION_ROOM_CONNECTIONS.forEach((connection) => {
      const points = connection.points;
      for (let index = 0; index < points.length - 1; index += 1) {
        const [x1, y1] = points[index];
        const [x2, y2] = points[index + 1];
        const x = Math.min(x1, x2) - 8;
        const y = Math.min(y1, y2) - 8;
        const w = Math.max(Math.abs(x2 - x1), 16) + 16;
        const h = Math.max(Math.abs(y2 - y1), 16) + 16;
        const horizontal = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
        if (!drawExcavationMapRegion(ctx, excavationMapAssets, horizontal ? `${roomMapPackId}:pathHorizontal` : `${roomMapPackId}:pathVertical`, { x, y, w, h }, { alpha: mapTheme.pathAlpha })) {
          ctx.strokeStyle = 'rgba(115, 79, 42, 0.28)';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
      const lastPoint = points[points.length - 1];
      drawExcavationMapRegion(ctx, excavationMapAssets, `${gatewayPackId}:carvedThreshold`, { x: lastPoint[0] - 22, y: lastPoint[1] - 14, w: 44, h: 28 }, { alpha: mapTheme.thresholdAlpha, fit: 'contain' });
    });


    // 3. Map Zones (Terrain background and borders ONLY. Labels are drawn in a final overlay pass)
    mapZones.forEach((zone) => {
      const terrainKey = terrainByZone[zone.id] || `${roomMapPackId}:neutralExcavationTerrain`;
      const drewTerrain = drawExcavationMapRegion(
        ctx,
        excavationMapAssets,
        terrainKey,
        { x: zone.x + 3, y: zone.y + 3, w: zone.w - 6, h: zone.h - 6 },
        { alpha: zone.id === 'gate' ? mapTheme.gateTerrainAlpha : mapTheme.terrainAlpha },
      );
      if (!drewTerrain) {
        ctx.fillStyle = zone.color;
        ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      }
      ctx.fillStyle = mapTheme.terrainWash;
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      if (zone.id !== 'gate') {
        drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:roomShadowOverlay`, { x: zone.x + 2, y: zone.y + 2, w: zone.w - 4, h: zone.h - 4 }, { alpha: mapTheme.roomShadowAlpha });
      }
      ctx.strokeStyle = selectedSurveyZone === zone.id || selectedMapZone === zone.id
        ? mapTheme.selectedStroke
        : mapTheme.idleStroke;
      ctx.lineWidth = selectedSurveyZone === zone.id || selectedMapZone === zone.id ? 3 : 1.5;
      ctx.strokeRect(zone.x + 1, zone.y + 1, zone.w - 2, zone.h - 2);

      if ((selectedSurveyZone === zone.id || selectedMapZone === zone.id) && assetsReady) {
        ctx.save();
        ctx.strokeStyle = mapTheme.selectedDashStroke;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 6]);
        ctx.strokeRect(zone.x + 8, zone.y + 8, zone.w - 16, zone.h - 16);
        ctx.restore();
        drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:highlightedSelectedZoneBorder`, {
          x: zone.x + zone.w - 88,
          y: zone.y + 10,
          w: 70,
          h: 42,
        }, { alpha: mapTheme.markerAlpha, fit: 'contain' });
      }
    });

    // 4. Hazards (Simplified to reduce visual noise)
    mapHazards.forEach((hazard) => {
      const hazardAsset = {
        sandstorm: `${mapUiPackId}:sandstormPatch`,
        'falling-rocks': `${mapUiPackId}:fallingRocksPatch`,
        'unstable-floor': `${mapUiPackId}:unstableFloorCrack`,
      }[hazard.id];
      const drewHazard = drawExcavationMapRegion(ctx, excavationMapAssets, hazardAsset, {
        x: hazard.x - 6,
        y: hazard.y - 8,
        w: hazard.w + 12,
        h: hazard.h + 16,
      }, { alpha: mapTheme.hazardAlpha, fit: 'contain' });
      if (hazard.id === 'sandstorm') {
        drawExcavationMapRegion(ctx, excavationMapAssets, `${mapUiPackId}:dustCloudOverlay`, {
          x: hazard.x + 16,
          y: hazard.y + 4,
          w: hazard.w + 34,
          h: hazard.h + 18,
        }, { alpha: 0.32, fit: 'contain' });
      }
      if (!drewHazard) {
        ctx.fillStyle = hazard.color;
        fillRoundRect(hazard.x, hazard.y, hazard.w, hazard.h, 6);
      }
      drawExcavationMapRegion(ctx, excavationMapAssets, `${mapUiPackId}:cautionIcon`, {
        x: hazard.x + hazard.w - 28,
        y: hazard.y + hazard.h - 28,
        w: 24,
        h: 24,
      }, { alpha: 0.78, fit: 'contain' });

    });

    // 5. Walls (Stony texture instead of black bars)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 3;

    mapWalls.forEach((wall) => {
      const wallAsset = wall.w > wall.h * 1.8 ? `${mapUiPackId}:stoneWallSegment` : `${mapUiPackId}:buriedFoundationStones`;
      const drewWall = drawExcavationMapRegion(ctx, excavationMapAssets, wallAsset, { x: wall.x - 4, y: wall.y - 8, w: wall.w + 8, h: wall.h + 16 }, { alpha: mapTheme.wallAlpha });
      if (!drewWall) {
        // Base stone color
        ctx.fillStyle = '#968471';
        ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      }

      // Add stone highlights/texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(wall.x, wall.y, wall.w, 2); // Top highlight
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(wall.x, wall.y + wall.h - 2, wall.w, 2); // Bottom shadow

      // Cracks / Stone blocks
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 20; i < wall.w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(wall.x + i, wall.y);
        ctx.lineTo(wall.x + i, wall.y + wall.h);
        ctx.stroke();
      }

      ctx.strokeStyle = mapTheme.wallStroke;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
    });
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // 6. Exit Gate
    const gateOpen = missionEvidenceCount >= missionRequiredCount;
    const gateArchBounds = { x: 670, y: 226, w: 128, h: 132 };
    const gateSlabBounds = { x: 706, y: 264, w: 62, h: 82 };
    ctx.shadowColor = gateOpen ? 'rgba(247, 196, 83, 0.44)' : 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    if (!gateOpen) {
      drawExcavationMapRegion(ctx, excavationMapAssets, `${gatewayPackId}:closedGateSlab`, gateSlabBounds, { alpha: 0.96, fit: 'cover' });
    } else {
      ctx.fillStyle = 'rgba(255, 223, 140, 0.22)';
      ctx.beginPath();
      ctx.ellipse(gateArchBounds.x + 64, gateArchBounds.y + 72, 26, 45, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const drewGate = drawExcavationMapRegion(ctx, excavationMapAssets, `${gatewayPackId}:exitArch`, gateArchBounds, { alpha: 0.98, fit: 'contain' });
    if (!drewGate) {
      ctx.fillStyle = gateOpen ? 'rgba(247, 196, 83, 0.34)' : 'rgba(74, 54, 32, 0.82)';
      ctx.fillRect(gateArchBounds.x + 30, gateArchBounds.y + 28, 66, 98);
      ctx.strokeStyle = gateOpen ? '#b45309' : '#3a2a18';
      ctx.lineWidth = gateOpen ? 2 : 3;
      ctx.strokeRect(gateArchBounds.x + 28, gateArchBounds.y + 24, 70, 104);
    }
    ctx.shadowColor = 'transparent';

    ctx.lineWidth = 1;

    // 7. Tokens (Floating/glowing)
    tokensRef.current.forEach((token, index) => {
      if (token.collected || !evidenceVisibleForGrid(token, selectedSurveyZone, openedGridSquares, surveyRevealLinks, gridZoneConfigs)) return;

      const floatY = Math.sin((now / 200) + index) * 3;

      ctx.shadowColor = 'rgba(232, 158, 93, 0.8)';
      ctx.shadowBlur = 12;

      ctx.fillStyle = '#e89e5d';
      ctx.beginPath();
      ctx.arc(token.x, token.y + floatY, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 247, 237, 0.78)';
      ctx.beginPath();
      ctx.arc(token.x, token.y + floatY, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 8. Mythic guardians (non-combat pressure)
    guardiansRef.current.forEach((guardian) => {
      const shimmer = (Math.sin(now / 180) + 1) / 2;
      ctx.save();
      ctx.strokeStyle = 'rgba(76, 29, 149, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      guardian.path.forEach((point, pointIndex) => {
        if (pointIndex === 0) ctx.moveTo(point.x + guardian.w / 2, point.y + guardian.h / 2);
        else ctx.lineTo(point.x + guardian.w / 2, point.y + guardian.h / 2);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.globalAlpha = 0.68 + shimmer * 0.24;
      const drewGuardian = drawExcavationMapRegion(ctx, excavationMapAssets, `${mapUiPackId}:guardianShadowMarker`, {
        x: guardian.x - 14,
        y: guardian.y - 18,
        w: guardian.w + 32,
        h: guardian.h + 42,
      }, { alpha: 0.82 + shimmer * 0.16, fit: 'contain' });
      if (!drewGuardian) {
        ctx.fillStyle = '#5b3b8c';
        ctx.beginPath();
        ctx.ellipse(guardian.x + guardian.w / 2, guardian.y + guardian.h / 2, 18, 21, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#efe3ff';
        ctx.beginPath();
        ctx.arc(guardian.x + 10, guardian.y + 11, 2.8, 0, Math.PI * 2);
        ctx.arc(guardian.x + 20, guardian.y + 11, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

    });

    // 9. Player Avatar
    const player = playerRef.current;
    const playerCentreX = player.x + PLAYER_SIZE / 2;
    const playerCentreY = player.y + PLAYER_SIZE / 2;
    if (assetsReady) {
      drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:playerShadow`, { x: playerCentreX - 20, y: playerCentreY + 7, w: 40, h: 18 }, { alpha: 0.34, fit: 'contain' });
      drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:playerGlow`, { x: playerCentreX - 23, y: playerCentreY - 24, w: 46, h: 46 }, { alpha: mapTheme.playerGlowAlpha, fit: 'contain' });
      drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:playerLocationRing`, { x: playerCentreX - 20, y: playerCentreY - 16, w: 40, h: 35 }, { alpha: 0.98, fit: 'contain' });
      drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:heroPortraitMarker`, { x: playerCentreX - 15, y: playerCentreY - 21, w: 30, h: 33 }, { alpha: 0.98, fit: 'contain' });
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(playerCentreX, playerCentreY, PLAYER_SIZE / 2 + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.shadowOffsetY = 0;
    }

    // 10. Late Pass Overlays (state markers float on top of everything)
    mapZones.forEach((zone) => {
      const roomMarker = surveyedZones.has(zone.id)
        ? `${markerPackId}:surveyedMarker`
        : completedZoneChallenges.has(zone.id)
          ? `${markerPackId}:surveyReadyMarker`
          : `${markerPackId}:challengeRequiredMarker`;
      const markerSize = zone.id === 'gate' ? 32 : 27;
      drawExcavationMapRegion(ctx, excavationMapAssets, roomMarker, {
        x: zone.x + zone.w - markerSize - 12,
        y: zone.y + zone.h - markerSize - 10,
        w: markerSize,
        h: markerSize,
      }, { alpha: mapTheme.markerAlpha, fit: 'contain' });

      if (surveyZoneById[zone.id]) {
        const sX = zone.x + 10;
        const sY = zone.y + zone.h - 32;
        const statusIconSize = selectedSurveyZone === zone.id ? 34 : 28;
        const statusIconX = sX;
        const statusIconY = sY - 4;

        ctx.save();
        ctx.globalAlpha = selectedSurveyZone === zone.id ? 0.72 : 0.34;
        ctx.fillStyle = selectedSurveyZone === zone.id
          ? 'rgba(45, 90, 39, 0.34)'
          : completedZoneChallenges.has(zone.id)
            ? 'rgba(250, 204, 21, 0.18)'
            : 'rgba(74, 54, 32, 0.16)';
        ctx.beginPath();
        ctx.arc(
          statusIconX + statusIconSize / 2,
          statusIconY + statusIconSize / 2,
          statusIconSize * 0.56,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.restore();

        if (selectedSurveyZone === zone.id || surveyedZones.has(zone.id)) {
          drawExcavationMapRegion(ctx, excavationMapAssets, selectedSurveyZone === zone.id ? `${mapUiPackId}:mapPin` : `${mapUiPackId}:completedSurveyStamp`, { x: statusIconX, y: statusIconY, w: statusIconSize, h: statusIconSize }, { alpha: 0.9, fit: 'contain' });
        } else if (completedZoneChallenges.has(zone.id)) {
          drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:neutralUnlockIcon`, { x: statusIconX + 2, y: statusIconY + 2, w: statusIconSize - 4, h: statusIconSize - 4 }, { alpha: 0.82, fit: 'contain' });
        } else {
          drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:neutralQuestionIcon`, { x: statusIconX + 2, y: statusIconY + 2, w: statusIconSize - 4, h: statusIconSize - 4 }, { alpha: 0.82, fit: 'contain' });
        }
      }
    });

    // --- DIABLO-STYLE VISUAL OVERLAYS (SHROUD, OUTLINES, AND SPOTLIGHT) ---
    const r = shroudRectRef.current;

    // 1. Draw shroud void (deep blackish-brown tomb darkness) in world coordinates
    ctx.fillStyle = '#050403'; // deep pitch black-brown tomb darkness
    ctx.fillRect(r.x - 3000, r.y - 3000, r.w + 6000, 3000); // top
    ctx.fillRect(r.x - 3000, r.y + r.h, r.w + 6000, 3000); // bottom
    ctx.fillRect(r.x - 3000, r.y, 3000, r.h); // left
    ctx.fillRect(r.x + r.w, r.y, 3000, r.h); // right

    // 2. Draw double glowing outlines (gold for Egypt, jade for China)
    const isChina = targetCivilisation && targetCivilisation.toLowerCase().includes('china');
    const mainColor = isChina ? '#38bd94' : '#d4af37';
    const glowColor = isChina ? 'rgba(56, 189, 148, 0.35)' : 'rgba(212, 175, 55, 0.35)';

    ctx.save();
    // Outer glow border
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 6;
    ctx.shadowBlur = 15;
    ctx.shadowColor = mainColor;
    ctx.strokeRect(r.x, r.y, r.w, r.h);

    // Inner sharp border
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 0; // reset
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.restore();

    // 3. Draw warm radial torchlight vignette centered on the player avatar (clipped to active room)

    ctx.save();
    // Clip the spotlight overlay to the active room boundary
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.clip();

    // Create the warm radial vignette centered on the player
    const vignetteGrad = ctx.createRadialGradient(
      playerCentreX, playerCentreY, 40,
      playerCentreX, playerCentreY, 260
    );
    vignetteGrad.addColorStop(0, 'rgba(253, 224, 185, 0.05)'); // warm tint center
    vignetteGrad.addColorStop(0.3, 'rgba(180, 110, 50, 0.15)'); // warm ambient glow
    vignetteGrad.addColorStop(0.7, 'rgba(5, 4, 3, 0.7)');       // fade to tomb dark
    vignetteGrad.addColorStop(1, '#050403');                     // tomb dark
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(r.x - 10, r.y - 10, r.w + 20, r.h + 20);
    ctx.restore();

    // Camera translation end
    ctx.restore();
  }, [completedZoneChallenges, excavationMapAssets, gatewayPackId, gridZoneConfigs, mapHazards, mapTheme, mapUiPackId, mapWalls, mapZones, markerPackId, missionEvidenceCount, missionRequiredCount, openedGridSquares, roomMapPackId, selectedMapZone, selectedSurveyZone, surveyRevealLinks, surveyedZones, surveyZoneById, terrainByZone, targetCivilisation]);

  return { draw };
}
