import { useCallback } from 'react';

import {
  MAP_HEIGHT,
  MAP_WIDTH,
  PLAYER_SIZE,
} from './expeditionDigData.js';
import {
  clamp,
  evidenceVisibleForGrid,
  getActiveZone,
  getPlayerRect,
  getSurveyZoneAtPlayer,
  getZoneName,
  rectsOverlap,
} from './expeditionDigLogic.js';

/* eslint-disable react-hooks/exhaustive-deps -- every dependency the rule flags in this file
   is a stable ref or a module-level helper passed in from the component; none change across
   renders, so omitting them from dependency arrays is correct and preserves the original
   pre-extraction behaviour. */

// Per-frame excavation-mode simulation loop. Extracted wholesale from ExpeditionMode as a pure
// mechanical move: the entire `update` step useCallback (input-driven player movement & wall
// collision, zone/survey detection, hazard + mythic-guardian collisions, nearby-evidence probing,
// exit-gate handling, and Diablo-style camera/shroud lerping) relocated here verbatim with its
// original statement order and useCallback dependency array unchanged. The component-owned `draw`
// loop is passed in via deps and remains in the dependency array exactly as before, so the live
// simulation path is byte-for-byte identical.
export function useExpeditionDigSimulation({
  hazardCooldownRef,
  guardianCooldownRef,
  lockedRef,
  tickAccumulatorRef,
  keysRef,
  resourcesRef,
  playerRef,
  nearbySurveyZoneRef,
  nearbyTokenRef,
  dismissedTokenRef,
  tokensRef,
  guardiansRef,
  cameraRef,
  shroudRectRef,
  setCurrentZone,
  setNearbySurveyZone,
  setSelectedMapZone,
  setNotice,
  setNearbyToken,
  setClaimOpen,
  syncResources,
  draw,
  briefingOpen,
  inspectionToken,
  surveyReportZone,
  gridSetupOpen,
  activeZoneChallenge,
  expeditionFailure,
  mapWalls,
  mapZones,
  defaultZoneName,
  surveyZones,
  mapHazards,
  audioControls,
  completedZoneChallenges,
  selectedSurveyZone,
  openedGridSquares,
  surveyRevealLinks,
  gridZoneConfigs,
  missionEvidenceCount,
  missionRequiredCount,
  activeMission,
}) {
  const update = useCallback((dt = 1 / 60) => {
    if (briefingOpen || lockedRef.current || inspectionToken || surveyReportZone || gridSetupOpen || activeZoneChallenge || expeditionFailure) {
      draw();
      return;
    }

    Object.keys(hazardCooldownRef.current).forEach((key) => {
      hazardCooldownRef.current[key] = Math.max(0, hazardCooldownRef.current[key] - dt);
    });
    Object.keys(guardianCooldownRef.current).forEach((key) => {
      guardianCooldownRef.current[key] = Math.max(0, guardianCooldownRef.current[key] - dt);
    });

    tickAccumulatorRef.current += dt;
    if (tickAccumulatorRef.current >= 1) {
      tickAccumulatorRef.current = 0;
      syncResources({ time: -1 });
    }

    const keys = keysRef.current;
    const staminaFactor = resourcesRef.current.stamina <= 25 ? 0.72 : 1;
    const speed = 172 * staminaFactor * dt;
    let dx = 0;
    let dy = 0;

    if (keys.ArrowUp || keys.KeyW) dy -= speed;
    if (keys.ArrowDown || keys.KeyS) dy += speed;
    if (keys.ArrowLeft || keys.KeyA) dx -= speed;
    if (keys.ArrowRight || keys.KeyD) dx += speed;

    if (dx && dy) {
      dx *= 0.72;
      dy *= 0.72;
    }

    const current = playerRef.current;
    const next = {
      x: clamp(current.x + dx, 0, MAP_WIDTH - PLAYER_SIZE),
      y: clamp(current.y + dy, 0, MAP_HEIGHT - PLAYER_SIZE),
    };
    const nextRect = getPlayerRect(next);
    const hitWall = mapWalls.some(wall => rectsOverlap(nextRect, wall));
    if (!hitWall) {
      playerRef.current = next;
    }

    const zoneName = getZoneName(playerRef.current, mapZones, defaultZoneName);
    setCurrentZone(previous => previous === zoneName ? previous : zoneName);
    const surveyZone = getSurveyZoneAtPlayer(playerRef.current, surveyZones, mapZones);
    if (surveyZone !== nearbySurveyZoneRef.current) {
      nearbySurveyZoneRef.current = surveyZone;
      setNearbySurveyZone(surveyZone);
      if (surveyZone) setSelectedMapZone(surveyZone.id);
      if (surveyZone && !nearbyTokenRef.current) {
        setNotice(completedZoneChallenges.has(surveyZone.id)
          ? 'Press E to survey this area before digging.'
          : 'Press E to complete this room check before surveying.');
      }
    }

    const playerRect = getPlayerRect(playerRef.current);
    mapHazards.forEach((hazard) => {
      if (rectsOverlap(playerRect, hazard) && !hazardCooldownRef.current[hazard.id]) {
        hazardCooldownRef.current[hazard.id] = 2.5;
        syncResources(hazard.penalty);
        setNotice(hazard.message);
        audioControls.playExpeditionSfx?.('playerHit');
        audioControls.playError?.();
      }
    });

    guardiansRef.current.forEach((guardian) => {
      const target = guardian.path[guardian.targetIndex];
      const dxGuardian = target.x - guardian.x;
      const dyGuardian = target.y - guardian.y;
      const distance = Math.hypot(dxGuardian, dyGuardian);
      const travel = guardian.speed * dt;

      if (distance <= travel) {
        guardian.x = target.x;
        guardian.y = target.y;
        guardian.targetIndex = (guardian.targetIndex + 1) % guardian.path.length;
      } else if (distance > 0) {
        guardian.x += (dxGuardian / distance) * travel;
        guardian.y += (dyGuardian / distance) * travel;
      }

      if (rectsOverlap(playerRect, guardian) && !guardianCooldownRef.current[guardian.id]) {
        guardianCooldownRef.current[guardian.id] = 2.2;
        syncResources(guardian.penalty);
        const playerCentre = playerRef.current.x + PLAYER_SIZE / 2;
        const guardianCentre = guardian.x + guardian.w / 2;
        const pushDirection = playerCentre < guardianCentre ? -1 : 1;
        const pushed = {
          x: clamp(playerRef.current.x + pushDirection * 54, 0, MAP_WIDTH - PLAYER_SIZE),
          y: playerRef.current.y,
        };
        if (!mapWalls.some(wall => rectsOverlap(getPlayerRect(pushed), wall))) {
          playerRef.current = pushed;
        }
        setNotice(guardian.message);
        audioControls.playExpeditionSfx?.('playerHit');
        audioControls.playError?.();
      }
    });

    const nearestToken = tokensRef.current.find((token) => {
      if (token.collected) return;
      if (!evidenceVisibleForGrid(token, selectedSurveyZone, openedGridSquares, surveyRevealLinks, gridZoneConfigs)) return;
      const dxToken = playerRef.current.x + PLAYER_SIZE / 2 - token.x;
      const dyToken = playerRef.current.y + PLAYER_SIZE / 2 - token.y;
      return Math.hypot(dxToken, dyToken) <= 31;
    });
    if (nearestToken?.id === dismissedTokenRef.current) {
      nearbyTokenRef.current = null;
      setNearbyToken(null);
    } else if (nearestToken !== nearbyTokenRef.current) {
      dismissedTokenRef.current = null;
      nearbyTokenRef.current = nearestToken || null;
      setNearbyToken(nearestToken || null);
      if (nearestToken) {
        setNotice('Press E to inspect evidence.');
      }
    } else if (!nearestToken && dismissedTokenRef.current) {
      dismissedTokenRef.current = null;
    }

    const gateRect = { x: 724, y: 258, w: 54, h: 108 };
    if (rectsOverlap(playerRect, gateRect)) {
      if (missionEvidenceCount >= missionRequiredCount) {
        lockedRef.current = true;
        setClaimOpen(true);
        setNotice('Exit Gate reached. Make your final claim.');
        audioControls.playExpeditionSfx?.('gateUnlock');
      } else {
        setNotice(activeMission.gateRequirement);
        if (!hazardCooldownRef.current.exitGateBlocked) {
          hazardCooldownRef.current.exitGateBlocked = 1.6;
          audioControls.playExpeditionSfx?.('gateBlocked');
        }
      }
    }

    // Diablo-style Smooth Camera and Shroud Panning
    const activeZone = getActiveZone(playerRef.current, mapZones);
    if (activeZone) {
      const targetCamX = (activeZone.x + activeZone.w / 2) - 400;
      const targetCamY = (activeZone.y + activeZone.h / 2) - 280;

      // Lerp camera (5 * dt)
      cameraRef.current.x += (targetCamX - cameraRef.current.x) * 5 * dt;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * 5 * dt;

      // Lerp shroud (6 * dt) for morphing transition
      shroudRectRef.current.x += (activeZone.x - shroudRectRef.current.x) * 6 * dt;
      shroudRectRef.current.y += (activeZone.y - shroudRectRef.current.y) * 6 * dt;
      shroudRectRef.current.w += (activeZone.w - shroudRectRef.current.w) * 6 * dt;
      shroudRectRef.current.h += (activeZone.h - shroudRectRef.current.h) * 6 * dt;
    }

    draw();
  }, [activeMission.gateRequirement, activeZoneChallenge, audioControls, briefingOpen, completedZoneChallenges, defaultZoneName, draw, expeditionFailure, gridSetupOpen, gridZoneConfigs, inspectionToken, mapHazards, mapWalls, mapZones, missionEvidenceCount, missionRequiredCount, openedGridSquares, selectedSurveyZone, surveyReportZone, surveyRevealLinks, surveyZones, syncResources]);

  return { update };
}
