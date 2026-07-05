import { useCallback } from 'react';

import {
  isEnemyDefeatedVisible,
  COMBAT_INTENSITY_VERSION,
  PLAYER_HIT_SCREEN_SHAKE_DURATION,
  PLAYER_HIT_SCREEN_SHAKE_PIXELS,
} from './journeyCombat.js';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COMBAT_DAMAGE_SCALE,
  GROUND_Y,
  scaleJourneyX,
  WORLD_WIDTH,
} from './journeyConstants';
import {
  DISCOVERY_ENTRANCE,
  ENVIRONMENT_EVENTS,
  ENVIRONMENT_INTERACTIONS,
  JOURNEY_TOOLS,
  LORE_TABLETS,
  OBJECTIVE_MARKERS,
  RELIC_SHARDS,
  ROUTE_GATES,
  SCARAB_SEAL_TRIGGER,
  SECTIONS,
  SECTION_ATMOSPHERES,
  STAGE_ENTRANCE_FEATURES,
  TOOL_LAYOUT,
  UPGRADES,
  WORLD_CONTINUITY_LANDMARKS,
  WORLD_TRANSITION_STORY_MARKERS,
} from './journeyDataRouter';
import {
  clampCameraX,
  isHorizontallyVisible,
  JOURNEY_RENDER_TARGET,
  worldToScreenX,
} from './journeyLayout';
import {
  getHeroSpriteRow,
} from './journeyPlayerVisuals';
import {
  clamp,
  getNextJourneyRouteGate,
  getSectionForX,
} from './journeyUtils';
import {
  ATLAS_TUNING_VERSION,
  DESERT_VISUAL_TUNING_VERSION,
  EGYPT_ATMOSPHERE_ASSET_VERSION,
  EGYPT_FOREGROUND_DEPTH_ASSET_VERSION,
  getMissingEnvironmentAssets,
  JOURNEY_ASSET_GROUNDING_VERSION,
  MUMMIFICATION_CHAMBER_INTERACTIONS_ASSET_VERSION,
} from './journeyRenderAssets';
import {
  DESERT_BACKGROUND_DEPTH_MODE,
  JOURNEY_BACKGROUND_DEPTH_MODE,
} from './journeyBackgroundAssets';
import {
  DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION,
} from './journeyDesertBackgroundPanels';
import {
  drawContactShadow,
  drawGroundDustLip,
  drawRouteGroundApron,
} from './journeyRenderPrimitives.js';
import {
  getObjectiveSpriteKey,
  getRelicShardSpriteKey,
  getToolSpriteKey,
  getUpgradeSpriteKey,
} from './journeyCollectibleSprites';
import {
  getPlayerWeaponFrameKey,
} from './journeyPlayerWeaponSprites';
import {
  drawMarkerSprite,
} from './journeyMarkerSprites';
import {
  getEnemySpriteDrawBox,
} from './journeyEnemySprites';

/* eslint-disable react-hooks/exhaustive-deps -- every dependency the rule flags in this file
   is a stable ref or a module-level helper passed in from the component; none change across
   renders, so omitting them from dependency arrays is correct and preserves the original
   pre-extraction behaviour. */

// Per-frame canvas render loop. Extracted wholesale from ExpeditionJourney as a pure mechanical
// move: the entire `draw` render useCallback (background/parallax, ground & props, entities,
// collectibles, player + foreground occluders, scene transitions, debug + editor overlays)
// relocated here verbatim with its original statement order, draw-call order, and useCallback
// dependency array unchanged. Every component-owned ref/state/resolver/draw-helper and base-data
// table is passed in via the deps object so the live render path is byte-for-byte identical.
export function useJourneyDraw({
  CHAMBER_DOOR_VISUALS,
  CHINA_BACKGROUND_POLISH_VERSION,
  COLLECTIBLE_VISUAL_BASE,
  DECORATIVE_PROP_LAYER_MODE,
  DESERT_ENTRY_LAYERED_NECROPOLIS_OWNS_RAVINE_VISUALS,
  DRAW_JOURNEY_FLAG_MARKERS,
  DYNAMIC_WORLD_VERSION,
  ENABLE_FOREGROUND_DEPTH_LAYER,
  FOREGROUND_DEPTH_LAYER_MODE,
  FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_VERSION,
  FORGOTTEN_MURAL_CHAMBER_VERSION,
  FORGOTTEN_MURAL_HIDDEN_MEMORY_REVEAL_VERSION,
  JOURNEY_FLAG_VISUAL_MODE,
  JOURNEY_POLISH_VERSION,
  MUMMIFICATION_CHAMBER_EXTERIOR_VERSION,
  MUMMIFICATION_CHAMBER_INTERIOR_VERSION,
  MUMMIFICATION_CHAMBER_READABILITY,
  OPENING_PYRAMID_ASSET_VERSION,
  OPENING_PYRAMID_FACADE_VERSION,
  OPENING_TRAP_DECAL_ASSET_VERSION,
  PROP_DEPTH_TUNING_VERSION,
  REACTIVE_ENVIRONMENT_VERSION,
  ROUTE_GROUND_HAZE_FIX_VERSION,
  ROUTE_GROUND_VISUAL_MODE,
  SCRIBE_CHAMBER_EXTERIOR_VERSION,
  SCRIBE_CHAMBER_INTERIOR_VERSION,
  WORLD_CONTINUITY_VERSION,
  atmosphereEnvironmentAssetsRef,
  backgroundPackId,
  bossSpriteAssetsRef,
  canvasRef,
  collectibleSpriteAssetsRef,
  drawAncientRouteGround,
  drawArrivalThresholdDoorwayOccluder,
  drawArrivalThresholdScene,
  drawArrivalThresholdTrial,
  drawAttackArc,
  drawChinaRiverValleyBackground,
  drawCinematicCards,
  drawCollectible,
  drawCombatEffects,
  drawConnectedWorldAmbientLife,
  drawDebugPlatformOverlay,
  drawDesertEntryBackground,
  drawDesertEntryGroundLane,
  drawDesertEntryGroundMotionCues,
  drawDesertForegroundAtmosphere,
  drawDesertJourneySceneMasks,
  drawDesertJourneyScenePanels,
  drawDiscoveryEntrance,
  drawDynamicEnvironmentEvent,
  drawEgyptAmbientLife,
  drawEnemyAttackTell,
  drawEnvironmentInteraction,
  drawFieldNoteLabel,
  drawForegroundDepthLayer,
  drawForegroundOccluderProps,
  drawForgottenMuralChamberInterior,
  drawForgottenMuralChamberTransition,
  drawHazard,
  drawHiddenRouteHint,
  drawLinkedEnemySprite,
  drawLostBridgeRavineDepth,
  drawLostBridgeRavineForegroundVoid,
  drawLostBridgeStructure,
  drawMiniBoss,
  drawMissingObjectiveMarker,
  drawMummificationChamberInterior,
  drawOpeningCinematic,
  drawOpeningPyramidMasonryBack,
  drawOpeningSphinxEncounter,
  drawOpeningThresholdScene,
  drawPlatform,
  drawPlayerFeedbackOverlays,
  drawPlayerSprite,
  drawPremiumEgyptianChamberDoor,
  drawPropPlacementEditorOverlay,
  drawRouteGate,
  drawScarabQueenLairOpeningProp,
  drawScribeLockedChamberInterior,
  drawSectionParallaxBackground,
  drawSectionParallaxForeground,
  drawSectionTransitionBlend,
  drawSmallEnemySprite,
  drawStageEntranceFeature,
  drawStageEntranceForegroundOccluder,
  drawStoryProp,
  drawTempleBackdrop,
  drawTempleThresholdHallInterior,
  drawTempleThresholdTransition,
  drawTrapProjectile,
  drawWorldContinuityLandmark,
  drawWorldTransitionMarker,
  enemySpriteAssetsRef,
  environmentAssetsRef,
  foregroundDepthEnvironmentAssetsRef,
  forgottenMuralAlcoveStructureRef,
  forgottenMuralChamberRef,
  forgottenMuralHiddenRevealRef,
  getActiveHiddenRoutes,
  getActiveSecretCollectibles,
  getCombatMode,
  getDesertEntryEnemyFootLift,
  getDesertEntryVisualGroundOffsetY,
  getDoorwayGateStatus,
  getEditedMiniBoss,
  getEditedNestParams,
  getGateGuidance,
  getGroundPlaneEntityRenderY,
  getJourneySceneId,
  getPlayerAttackState,
  getRenderableCheckpoints,
  getRenderableHazards,
  getRenderablePlatforms,
  getRouteGateDoorwayEntries,
  getScarabQueenEmergenceBeat,
  getScarabQueenLairPlacement,
  getZIndexSortedRenderableStoryProps,
  isEntityActiveInScene,
  isInteriorChamberScene,
  isNormalEnemyInsideBossFocus,
  isRouteRewardAccessible,
  markerSpriteAssetsRef,
  mummificationChamberExteriorRef,
  mummificationChamberInteriorRef,
  mummificationInteractionAssetsRef,
  openingHazardDecalPackRef,
  openingPyramidClimbPackRef,
  openingPyramidFacadeRef,
  openingTrapDecalPackRef,
  playerSpriteRef,
  playerWeaponSpriteRef,
  resolveChamberEntryTrigger,
  scopedJourneyAssetPacks,
  scorpionNestRef,
  scribeChamberExteriorRef,
  scribeChamberInteriorRef,
  shouldRenderStageEntranceFeatureForState,
  stateRef,
}) {
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const current = stateRef.current;
    // Derive the virtual->backing-store scale from the live canvas dimensions so the
    // game renders at the display's actual pixel resolution (set by syncCanvasResolution).
    // Falling back to the fixed render target keeps behaviour correct before the first sync.
    const backingWidth = canvas.width || JOURNEY_RENDER_TARGET.nativeWidth;
    const backingHeight = canvas.height || JOURNEY_RENDER_TARGET.nativeHeight;
    ctx.setTransform(
      backingWidth / CANVAS_WIDTH,
      0,
      0,
      backingHeight / CANVAS_HEIGHT,
      0,
      0,
    );
    const player = current.player;
    const now = Date.now();
    const section = getSectionForX(player.x);
    const atmosphere = SECTION_ATMOSPHERES[section.id] || SECTION_ATMOSPHERES[SECTIONS[0].id];
    const isRomeJourney = scopedJourneyAssetPacks.isRomeJourney;
    const isChinaJourney = scopedJourneyAssetPacks.isChinaJourney;
    const isEgyptJourney = !isRomeJourney && !isChinaJourney;
    const shake = current.cameraShakeTimer > 0
      ? Math.sin(now / 28) * current.cameraShakeStrength * 7
      : 0;
    const cameraPunchX = (current.cameraPunchTimer || 0) > 0
      ? (current.cameraPunchDirection || 1) * 7 * clamp((current.cameraPunchTimer || 0) / 0.07, 0, 1)
      : 0;
    const cameraX = clampCameraX((Number.isFinite(current.cameraX) ? current.cameraX : 0) + shake + cameraPunchX);
    const playerImpactShakeProgress = player.impactShakeTimer > 0
      ? clamp(player.impactShakeTimer / PLAYER_HIT_SCREEN_SHAKE_DURATION, 0, 1)
      : 0;
    const playerImpactShakeDirection = player.knockbackDirection || -player.direction || 1;
    const playerImpactShakeX = playerImpactShakeProgress > 0
      ? Math.sin(now / 17) * PLAYER_HIT_SCREEN_SHAKE_PIXELS * playerImpactShakeProgress * playerImpactShakeDirection
      : 0;
    const playerImpactShakeY = playerImpactShakeProgress > 0
      ? Math.cos(now / 23) * PLAYER_HIT_SCREEN_SHAKE_PIXELS * 0.38 * playerImpactShakeProgress
      : 0;
    const isPlayerNear = (worldX, distance = 240) => Math.abs((player.x + player.width / 2) - worldX) < distance;
    const chamberSceneActive = isInteriorChamberScene(current);
    const playerGroundPlaneRenderY = getGroundPlaneEntityRenderY(player, current);
    const activeRouteGate = chamberSceneActive ? null : getNextJourneyRouteGate(ROUTE_GATES, current);
    const activeGateGuidance = activeRouteGate ? getGateGuidance(activeRouteGate, current) : null;
    const playerCenterX = player.x + player.width / 2;
    const crowdedGateActive = Boolean(activeRouteGate && Math.abs((activeRouteGate.x + activeRouteGate.width / 2) - playerCenterX) < 360);
    const crowdedBossActive = current.miniBosses.some(boss => boss.awakened && !boss.defeated && Math.abs(boss.x - player.x) < 360);
    const labelSuppressionActive = crowdedGateActive || crowdedBossActive || current.bossIntroTimer > 0;
    const secretClimbRouteIds = ['mummification-chamber-route', 'desert-upper-survey-route'];
    const secretClimbRoute = getActiveHiddenRoutes().find(route => secretClimbRouteIds.includes(route.id)
      && playerCenterX >= route.x - scaleJourneyX(240)
      && playerCenterX <= route.x + route.width + scaleJourneyX(160));
    const playerIsElevated = player.y < GROUND_Y - 160;
    const openingPyramidVerticalWindow = current.currentSectionId === 'desert-entry'
      && playerCenterX >= -scaleJourneyX(80)
      && playerCenterX <= scaleJourneyX(980)
      && playerIsElevated;
    const inVerticalCameraWindow = (Boolean(secretClimbRoute) && playerIsElevated) || openingPyramidVerticalWindow;
    const desiredSecretVerticalCameraOffset = !chamberSceneActive && inVerticalCameraWindow
      ? clamp(CANVAS_HEIGHT * 0.46 - (player.y + player.height / 2), 0, openingPyramidVerticalWindow ? 320 : 420)
      : 0;
    const currentVertOffset = current.secretVerticalCameraOffset || 0;
    const movingUp = desiredSecretVerticalCameraOffset > currentVertOffset;
    const vertBlend = movingUp ? 0.52 : 0.14;
    current.secretVerticalCameraOffset = Number((
      currentVertOffset * (1 - vertBlend) + desiredSecretVerticalCameraOffset * vertBlend
    ).toFixed(2));
    const secretVerticalCameraOffset = current.secretVerticalCameraOffset || 0;
    current.renderStats = {
      visibleLabelCount: 0,
      labelSuppressionActive,
      atlasTuningVersion: ATLAS_TUNING_VERSION,
      activeAtlasRegionIssues: getMissingEnvironmentAssets(environmentAssetsRef.current),
      parallaxLayersActive: false,
      activeBackgroundSection: null,
      backgroundDepthMode: 'canvas-fallback',
      platformVisualTuningActive: true,
      journeyPolishPassActive: true,
      journeyPolishVersion: JOURNEY_POLISH_VERSION,
      worldContinuityPassActive: true,
      worldContinuityVersion: WORLD_CONTINUITY_VERSION,
      visibleWorldLandmarks: [],
      visibleTransitionStoryMarkers: [],
      connectedWorldAmbientDetails: 0,
      dynamicWorldPassActive: true,
      dynamicWorldVersion: DYNAMIC_WORLD_VERSION,
      visibleDynamicWorldEvents: [],
      reactiveEnvironmentPassActive: true,
      reactiveEnvironmentVersion: REACTIVE_ENVIRONMENT_VERSION,
      visibleEnvironmentInteractions: [],
      chinaBackgroundPolishVersion: backgroundPackId === 'china-river-valley' ? CHINA_BACKGROUND_POLISH_VERSION : null,
      ambientLifePassActive: false,
      ambientLifeVersion: null,
      ambientLifeMode: null,
      ambientLifeDetailCount: 0,
      hazardReadabilityMode: openingTrapDecalPackRef.current.loaded && openingHazardDecalPackRef.current.loaded
        ? 'painted-egypt-trap-decals-complete'
        : 'soft-warning-cues',
      combatIntensityPassActive: true,
      combatIntensityVersion: COMBAT_INTENSITY_VERSION,
      combatReadabilityMode: 'windup-vulnerable-pressure-v1',
      visibleCombatPressureEnemies: [],
      dangerFeedbackActive: current.resources.stamina <= Math.round((current.upgradeEffects?.maxStamina || 100) * 0.3),
      enemyVisualMode: enemySpriteAssetsRef.current.loaded ? 'sprite-atlas-with-grounding' : 'canvas-fallback',
      bossVisualMode: bossSpriteAssetsRef.current.loaded ? 'multi-boss-atlas-fallback-safe' : 'canvas-fallback',
      collectibleVisualMode: collectibleSpriteAssetsRef.current.loaded ? 'sprite-atlas-with-fallback' : 'canvas-fallback',
      playerWeaponVisualMode: playerWeaponSpriteRef.current.loaded ? `${playerWeaponSpriteRef.current.weaponId || 'khopesh'}-sprite-atlas` : 'canvas-fallback',
      desertVisualTuningVersion: DESERT_VISUAL_TUNING_VERSION,
      desertEntryCausewayVisualMode: ROUTE_GROUND_VISUAL_MODE,
      desertEntryPlayableGroundPlane: 'integrated-background-painted-route-v1',
      openingPyramidAssetVersion: OPENING_PYRAMID_ASSET_VERSION,
      openingPyramidAssetLoaded: openingPyramidClimbPackRef.current.loaded,
      openingPyramidFacadeVersion: OPENING_PYRAMID_FACADE_VERSION,
      openingPyramidFacadeLoaded: openingPyramidFacadeRef.current.loaded,
      mummificationChamberExteriorVersion: MUMMIFICATION_CHAMBER_EXTERIOR_VERSION,
      mummificationChamberExteriorLoaded: mummificationChamberExteriorRef.current.loaded,
      mummificationChamberInteriorVersion: MUMMIFICATION_CHAMBER_INTERIOR_VERSION,
      mummificationChamberInteriorLoaded: mummificationChamberInteriorRef.current.loaded,
      mummificationChamberInteractionAssetVersion: MUMMIFICATION_CHAMBER_INTERACTIONS_ASSET_VERSION,
      mummificationChamberInteractionAssetsLoaded: mummificationInteractionAssetsRef.current.loaded,
      mummificationChamberReadableZones: MUMMIFICATION_CHAMBER_READABILITY.mummificationChamberReadableZones.map(zone => zone.id),
      mummificationChamberPuzzleCenterpiece: MUMMIFICATION_CHAMBER_READABILITY.mummificationChamberPuzzleCenterpiece,
      forgottenMuralAlcoveClimbStructureVersion: FORGOTTEN_MURAL_ALCOVE_CLIMB_STRUCTURE_VERSION,
      forgottenMuralAlcoveClimbStructureLoaded: forgottenMuralAlcoveStructureRef.current.loaded,
      forgottenMuralChamberVersion: FORGOTTEN_MURAL_CHAMBER_VERSION,
      forgottenMuralChamberLoaded: forgottenMuralChamberRef.current.loaded,
      forgottenMuralHiddenRevealVersion: FORGOTTEN_MURAL_HIDDEN_MEMORY_REVEAL_VERSION,
      forgottenMuralHiddenRevealLoaded: forgottenMuralHiddenRevealRef.current.loaded,
      scribeChamberExteriorVersion: SCRIBE_CHAMBER_EXTERIOR_VERSION,
      scribeChamberExteriorLoaded: scribeChamberExteriorRef.current.loaded,
      scribeChamberInteriorVersion: SCRIBE_CHAMBER_INTERIOR_VERSION,
      scribeChamberInteriorLoaded: scribeChamberInteriorRef.current.loaded,
      templeThresholdHallActive: Boolean(current.templeThresholdHallActive),
      templeThresholdHallCleared: Boolean(current.templeThresholdHallCleared),
      forgottenMuralChamberActive: Boolean(current.forgottenMuralChamberActive),
      currentSceneId: getJourneySceneId(current),
      sceneTransitionActive: Boolean(current.sceneTransition || current.forgottenMuralChamberTransition),
      openingTrapDecalAssetVersion: OPENING_TRAP_DECAL_ASSET_VERSION,
      openingTrapDecalAssetLoaded: openingTrapDecalPackRef.current.loaded,
      openingHazardDecalAssetLoaded: openingHazardDecalPackRef.current.loaded,
      assetGroundingPassActive: true,
      groundedPropCount: 0,
      atmospherePropCount: 0,
      groundLockedAtmospherePropCount: 0,
      atmosphereAssetVersion: EGYPT_ATMOSPHERE_ASSET_VERSION,
      atmosphereAssetLoaded: atmosphereEnvironmentAssetsRef.current.loaded,
      atmosphereGroundingMode: 'ground-locked-floor-and-route-edge-assets',
      foregroundDepthAssetVersion: EGYPT_FOREGROUND_DEPTH_ASSET_VERSION,
      foregroundDepthLayerMode: FOREGROUND_DEPTH_LAYER_MODE,
      foregroundDepthLayerActive: false,
      foregroundDepthAssetLoaded: foregroundDepthEnvironmentAssetsRef.current.loaded,
      foregroundDepthElementCount: 0,
      foregroundDepthParticleCount: 0,
      backgroundPropTintActive: true,
      platformGroundingMode: 'contact-shadow-ledges',
      visibleElevatedPlatforms: [],
      propDrawOrderMode: DECORATIVE_PROP_LAYER_MODE,
      decorativePropLayerMode: DECORATIVE_PROP_LAYER_MODE,
      propDepthTuningVersion: PROP_DEPTH_TUNING_VERSION,
      routeGroundVisualMode: ROUTE_GROUND_VISUAL_MODE,
      routeGroundHazeFixVersion: ROUTE_GROUND_HAZE_FIX_VERSION,
      journeyFlagVisualMode: JOURNEY_FLAG_VISUAL_MODE,
      removedRouteFlagCount: 0,
      floatingAssetWarnings: [],
      assetGroundingVersion: JOURNEY_ASSET_GROUNDING_VERSION,
      visibleEnemySpriteFamilies: [],
      enemySpriteFrameStates: [],
      activeBossSprite: null,
      activeBossSpriteFrame: null,
      activeBossAnimationState: null,
      stoneGuardianSpriteFrame: null,
      ancientConstructSpriteFrame: null,
      visibleToolSprites: [],
      visibleShardSprites: [],
      visibleUpgradeSprites: [],
      visibleObjectiveSprites: [],
      visibleCollectibleCount: 0,
      playerWeaponFrame: getPlayerWeaponFrameKey(getPlayerAttackState(current), playerWeaponSpriteRef.current.weaponId),
      playerSpriteFrame: null,
      playerSpriteVisualMode: playerSpriteRef.current.mode || 'canvas-fallback',
      bossDomainActive: Boolean(current.bossDomain),
      playerHitScreenShakeActive: playerImpactShakeProgress > 0,
      secretVerticalCameraOffset: Number(secretVerticalCameraOffset.toFixed(2)),
      forgottenMuralCameraFrameActive: secretVerticalCameraOffset > 0.5,
    };
    const showWorldLabel = (worldX, distance = 150, priority = 'normal') => {
      const near = isPlayerNear(worldX, distance);
      if (priority === 'critical') return near && !labelSuppressionActive && Math.abs(worldX - playerCenterX) < distance;
      if (priority === 'combat') return near && !labelSuppressionActive;
      return near && !labelSuppressionActive;
    };

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    if (playerImpactShakeProgress > 0) {
      ctx.translate(playerImpactShakeX, playerImpactShakeY);
    }

    const arrivalThresholdDrawn = current.arrivalThresholdActive && drawArrivalThresholdScene(ctx, current, now);
    const chinaBackgroundDrawn = !arrivalThresholdDrawn && isChinaJourney && drawChinaRiverValleyBackground(ctx, cameraX);
    const desertBackgroundDrawn = !arrivalThresholdDrawn && !chinaBackgroundDrawn && isEgyptJourney && drawDesertEntryBackground(ctx, section, cameraX);
    const sectionParallaxDrawn = !arrivalThresholdDrawn && !chinaBackgroundDrawn && !desertBackgroundDrawn && drawSectionParallaxBackground(ctx, section, cameraX);
    if (arrivalThresholdDrawn) {
      current.renderStats.parallaxLayersActive = true;
      current.renderStats.activeBackgroundSection = 'arrival-threshold';
      current.renderStats.backgroundDepthMode = 'arrival-threshold-final-art-v1';
    } else if (chinaBackgroundDrawn) {
      current.renderStats.parallaxLayersActive = true;
      current.renderStats.activeBackgroundSection = 'china-river-valley';
      current.renderStats.backgroundDepthMode = 'china-river-valley-parallax-v3-seam-reduced';
    } else if (desertBackgroundDrawn) {
      current.renderStats.parallaxLayersActive = true;
      current.renderStats.activeBackgroundSection = 'desert-entry';
      current.renderStats.backgroundDepthMode = DESERT_BACKGROUND_DEPTH_MODE;
    } else if (sectionParallaxDrawn) {
      current.renderStats.parallaxLayersActive = true;
      current.renderStats.activeBackgroundSection = section.id;
      current.renderStats.backgroundDepthMode = JOURNEY_BACKGROUND_DEPTH_MODE;
    } else {
      // Sky — fall back to neutral dark if atmosphere colors are missing (e.g. new civ sections)
      const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      skyGradient.addColorStop(0, atmosphere.skyTop ?? '#1a1410');
      skyGradient.addColorStop(1, atmosphere.skyBottom ?? '#2a2018');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    }

    const parallaxBackgroundDrawn = arrivalThresholdDrawn || chinaBackgroundDrawn || desertBackgroundDrawn || sectionParallaxDrawn;
    const canDrawCleanDesertEntryBackground = !arrivalThresholdDrawn
      && !desertBackgroundDrawn
      && !chamberSceneActive
      && section.id === 'desert-entry';
    const desertJourneyScenePanelsDrawn = canDrawCleanDesertEntryBackground
      && drawDesertJourneyScenePanels(ctx, current, cameraX, now);
    if (desertJourneyScenePanelsDrawn && current.renderStats) {
      current.renderStats.activeBackgroundSection = 'desert-entry';
      current.renderStats.backgroundDepthMode = DESERT_JOURNEY_BACKGROUND_SYSTEM_VERSION;
    }
    const routeBackgroundArtDrawn = parallaxBackgroundDrawn
      || desertJourneyScenePanelsDrawn;

    // --- Ground & Props ---
    ctx.save();
    if (secretVerticalCameraOffset > 0.5) {
      ctx.translate(0, secretVerticalCameraOffset);
    }
    if (!routeBackgroundArtDrawn) drawTempleBackdrop(ctx, section, cameraX);
    if (!chamberSceneActive && !current.arrivalThresholdActive) {
      WORLD_CONTINUITY_LANDMARKS.forEach((landmark) => drawWorldContinuityLandmark(ctx, landmark, cameraX, now));
      WORLD_TRANSITION_STORY_MARKERS.forEach((marker) => drawWorldTransitionMarker(ctx, marker, cameraX, now));
      getZIndexSortedRenderableStoryProps(current).forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'background'));
      if (desertJourneyScenePanelsDrawn) drawDesertJourneySceneMasks(ctx, current, cameraX, now);
    }

    // --- Environment Layers (Parallax) ---
    if (!routeBackgroundArtDrawn && section.id !== 'ruined-temple') {
      const renderParallaxLayer = (depth, color, heightMult) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT);
        for (let i = 0; i <= CANVAS_WIDTH; i += 40) {
          const worldX = i + cameraX * depth;
          const y = CANVAS_HEIGHT - 60 - heightMult * (20 + Math.sin(worldX * 0.002) * 30 + Math.cos(worldX * 0.005) * 15);
          ctx.lineTo(i, y);
        }
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fill();
      };
      renderParallaxLayer(0.08, `${atmosphere.skyBottom}66`, 1.3);
      renderParallaxLayer(0.18, `${atmosphere.skyBottom}99`, 0.9);
      renderParallaxLayer(0.28, `${atmosphere.skyBottom}cc`, 0.5);
    }
    if (!chamberSceneActive && !current.arrivalThresholdActive) {
      if (isEgyptJourney) drawDesertForegroundAtmosphere(ctx, section, cameraX);
      drawSectionParallaxForeground(ctx, section, cameraX);
      if (isEgyptJourney) drawOpeningPyramidMasonryBack(ctx, cameraX, now, current);
      getZIndexSortedRenderableStoryProps(current).forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'midground'));
      ENVIRONMENT_INTERACTIONS.forEach((item) => drawEnvironmentInteraction(ctx, item, cameraX, now, current));
      if (isEgyptJourney) drawEgyptAmbientLife(ctx, section, cameraX, now);
      drawConnectedWorldAmbientLife(ctx, section, cameraX, now);
      ENVIRONMENT_EVENTS
        .filter(event => event.dynamic && event.id !== current.dynamicEnvironmentEvent?.id)
        .forEach((event) => {
          const eventSection = getSectionForX(event.x);
          if (eventSection.id !== section.id) return;
          if (eventSection.id === 'desert-entry') return;
          if (!isHorizontallyVisible(event.x, 1, cameraX, 180)) return;
          drawDynamicEnvironmentEvent(ctx, { ...event, preview: true }, cameraX, now, (event.duration || 2.5) * 0.62);
        });
      drawDynamicEnvironmentEvent(ctx, current.dynamicEnvironmentEvent, cameraX, now, current.dynamicEnvironmentEventTimer);
      drawDesertEntryGroundLane(ctx, section, cameraX);
      drawAncientRouteGround(ctx, section, cameraX, now, current);
      getZIndexSortedRenderableStoryProps(current).forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'grounded'));
      if (isEgyptJourney) {
        CHAMBER_DOOR_VISUALS
          .map(door => ({ ...door, trigger: resolveChamberEntryTrigger(door) }))
          .filter(door => door.trigger)
          .forEach((door) => drawPremiumEgyptianChamberDoor(ctx, door, cameraX, current, now));
      }
    }
    const renderablePlatforms = current.arrivalThresholdActive ? [] : getRenderablePlatforms(current);
    drawTempleThresholdHallInterior(ctx, current, now);
    drawMummificationChamberInterior(ctx, current, now);
    drawForgottenMuralChamberInterior(ctx, current, now);
    drawScribeLockedChamberInterior(ctx, current, now);
    if (
      !chamberSceneActive
      && !current.arrivalThresholdActive
      && !DESERT_ENTRY_LAYERED_NECROPOLIS_OWNS_RAVINE_VISUALS
    ) {
      drawLostBridgeStructure(ctx, renderablePlatforms, cameraX, current);
    }

    const activeBossDomain = !chamberSceneActive && !current.arrivalThresholdActive && current.bossDomain
      && !current.defeatedMiniBosses.has(current.bossDomain.bossId)
      && !current.bossDomain.suppressVisuals
      ? current.bossDomain
      : null;
    if (activeBossDomain) {
      const domainStartX = worldToScreenX(activeBossDomain.arenaStart, cameraX);
      const domainEndX = worldToScreenX(activeBossDomain.arenaEnd, cameraX);
      const domainWidth = domainEndX - domainStartX;
      if (domainEndX > -80 && domainStartX < CANVAS_WIDTH + 80) {
        const introProgress = current.bossIntroTimer > 0 && current.bossIntro?.id === activeBossDomain.bossId
          ? Math.min(1, current.bossIntroTimer / (activeBossDomain.introSeconds || 3.2))
          : 0;
        ctx.save();
        const domainFocusWorldX = activeBossDomain.bossStartX
          || current.bossIntro?.focusX
          || ((activeBossDomain.arenaStart ?? 0) + (activeBossDomain.arenaEnd ?? WORLD_WIDTH)) / 2;
        const domainFocusX = worldToScreenX(domainFocusWorldX, cameraX);
        const domainRadius = Math.max(360, Math.min(CANVAS_WIDTH * 0.92, Math.abs(domainWidth) * 0.58));
        const domainAtmosphere = ctx.createRadialGradient(
          domainFocusX,
          GROUND_Y - 92,
          92,
          domainFocusX,
          GROUND_Y - 38,
          domainRadius,
        );
        domainAtmosphere.addColorStop(0, activeBossDomain.tint || 'rgba(67, 24, 24, 0.18)');
        domainAtmosphere.addColorStop(0.52, 'rgba(36, 22, 16, 0.12)');
        domainAtmosphere.addColorStop(1, 'rgba(36, 22, 16, 0)');
        ctx.fillStyle = domainAtmosphere;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        if (introProgress > 0) {
          const introAtmosphere = ctx.createRadialGradient(
            domainFocusX,
            GROUND_Y - 62,
            80,
            domainFocusX,
            GROUND_Y - 24,
            domainRadius * 0.82,
          );
          introAtmosphere.addColorStop(0, `rgba(12, 8, 5, ${0.16 + introProgress * 0.18})`);
          introAtmosphere.addColorStop(0.58, `rgba(12, 8, 5, ${0.06 + introProgress * 0.08})`);
          introAtmosphere.addColorStop(1, 'rgba(12, 8, 5, 0)');
          ctx.fillStyle = introAtmosphere;
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          if (activeBossDomain.buriedSandEmergence) {
            const beat = getScarabQueenEmergenceBeat(introProgress);
            const sealScreenX = worldToScreenX(activeBossDomain.bossStartX || current.bossIntro.focusX, cameraX);
            const sealPulse = Math.sin(now / 120) * (0.12 + beat.sandEruption * 0.18) + 0.9 + beat.sandEruption * 0.22;
          const revealProgress = beat.sceneProgress;
          if (sealScreenX > -120 && sealScreenX < CANVAS_WIDTH + 120) {
              const lairBoss = getEditedMiniBoss(current.miniBosses.find(boss => boss.id === activeBossDomain.bossId) || {});
              const lairPlacement = getScarabQueenLairPlacement(lairBoss);
              drawScarabQueenLairOpeningProp(ctx, lairPlacement.x || activeBossDomain.bossStartX || current.bossIntro.focusX, cameraX, now, beat, lairPlacement);
              const sealGlow = ctx.createRadialGradient(sealScreenX, GROUND_Y - 62, 12, sealScreenX, GROUND_Y - 62, 170 * sealPulse + beat.sandEruption * 90);
              sealGlow.addColorStop(0, `rgba(250, 204, 21, ${0.16 + beat.glyphGlow * 0.3 + beat.queenRise * 0.16})`);
              sealGlow.addColorStop(0.48, `rgba(45, 212, 191, ${0.08 + beat.sandEruption * 0.2})`);
              sealGlow.addColorStop(1, 'rgba(120, 53, 15, 0)');
              ctx.fillStyle = sealGlow;
              ctx.beginPath();
              ctx.ellipse(sealScreenX, GROUND_Y - 62, 156 * sealPulse, 72 * sealPulse, 0, 0, Math.PI * 2);
              ctx.fill();
              if (beat.sandEruption > 0) {
                ctx.strokeStyle = `rgba(253, 224, 71, ${0.62 * (1 - beat.sandEruption)})`;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(sealScreenX, GROUND_Y - 56, 26 + beat.sandEruption * 230, 0, Math.PI * 2);
                ctx.stroke();
              }
              ctx.strokeStyle = `rgba(250, 204, 21, ${0.45 + revealProgress * 0.25})`;
              ctx.lineWidth = 2;
              [0, 1, 2].forEach((ring) => {
                ctx.beginPath();
                ctx.ellipse(sealScreenX, GROUND_Y - 40, 48 + ring * 32 + revealProgress * 18, 12 + ring * 6, 0, 0, Math.PI * 2);
                ctx.stroke();
              });
              ctx.fillStyle = `rgba(217, 119, 6, ${0.16 + beat.sandEruption * 0.24})`;
              for (let index = 0; index < 18; index += 1) {
                const angle = (index / 18) * Math.PI * 2 + now / 900;
                const radius = 28 + beat.sandEruption * 132 + Math.sin(now / 80 + index) * 8;
                ctx.beginPath();
                ctx.arc(sealScreenX + Math.cos(angle) * radius, GROUND_Y - 30 + Math.sin(angle) * radius * 0.24, 2.2 + beat.sandEruption * 1.8, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
          const introMarkers = activeBossDomain.buriedSandEmergence
            ? [{ x: current.bossIntro.focusX }]
            : [
              { x: current.player.x + current.player.width / 2 },
              { x: current.bossIntro.focusX },
            ];
          introMarkers.forEach(marker => {
            const markerX = worldToScreenX(marker.x, cameraX);
            if (markerX < -80 || markerX > CANVAS_WIDTH + 80) return;
            const pulse = Math.sin(now / 180) * 0.12 + 0.88;
            const glow = ctx.createRadialGradient(markerX, GROUND_Y - 58, 10, markerX, GROUND_Y - 58, 92 * pulse);
            glow.addColorStop(0, `${activeBossDomain.color || '#facc15'}66`);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(markerX, GROUND_Y - 58, 92 * pulse, 0, Math.PI * 2);
            ctx.fill();
          });
        }
        ctx.strokeStyle = activeBossDomain.color || 'rgba(250, 204, 21, 0.72)';
        ctx.lineWidth = 3;
        [domainStartX, domainEndX].forEach((x) => {
          if (x < -20 || x > CANVAS_WIDTH + 20) return;
          ctx.beginPath();
          ctx.moveTo(x, 92);
          ctx.lineTo(x, GROUND_Y + 10);
          ctx.stroke();
        });
        ctx.restore();
      }
    }

    // --- Entities ---
    if (!current.arrivalThresholdActive) {
      const bridgePlatforms = renderablePlatforms.filter(platform => platform.variant === 'lost-bridge');
      const nonBridgePlatforms = renderablePlatforms.filter(platform => platform.variant !== 'lost-bridge');
      nonBridgePlatforms.forEach((platform) => drawPlatform(ctx, platform, cameraX, current));
      if (!chamberSceneActive && !DESERT_ENTRY_LAYERED_NECROPOLIS_OWNS_RAVINE_VISUALS) {
        drawLostBridgeRavineDepth(ctx, renderablePlatforms, cameraX, current);
      }
      bridgePlatforms.forEach((platform) => drawPlatform(ctx, platform, cameraX, current));
      getZIndexSortedRenderableStoryProps(current).forEach((prop) => drawStoryProp(ctx, prop, cameraX, now, 'route-edge'));
    }
    if (!chamberSceneActive && !current.arrivalThresholdActive) {
      getActiveHiddenRoutes().forEach(route => drawHiddenRouteHint(ctx, route, cameraX, current, now));
      drawSectionTransitionBlend(ctx, cameraX);
    }
    
    if (!current.arrivalThresholdActive) {
      getRenderableHazards(current).forEach((hazard) => drawHazard(ctx, hazard, cameraX, current, now));
      (current.trapProjectiles || []).forEach((projectile) => drawTrapProjectile(ctx, projectile, cameraX));
    }

    if (!chamberSceneActive && !current.arrivalThresholdActive) getRenderableCheckpoints().forEach((checkpoint) => {
      const markerX = checkpoint.markerX ?? checkpoint.x;
      const cx = worldToScreenX(markerX, cameraX);
      if (!isHorizontallyVisible(markerX, 1, cameraX, 130)) return;
      const active = current.activeCheckpoint.id === checkpoint.id;
      const openingCheckpointMarker = checkpoint.id === 'desert-entry';
      ctx.save();
      if (openingCheckpointMarker && (current.openingEntranceStageTimer || 0) > 0) {
        ctx.restore();
        return;
      }
      const checkpointSection = getSectionForX(markerX);
      const checkpointHeight = openingCheckpointMarker ? 154 : active ? 160 : 148;
      const checkpointWidth = checkpointHeight * (openingCheckpointMarker ? 1.36 : 1.48);
      if (openingCheckpointMarker) {
        drawRouteGroundApron(ctx, cx, GROUND_Y - 1, checkpointWidth * 0.52, checkpointSection.id, 0.42, Math.round(markerX));
        drawGroundDustLip(ctx, cx, GROUND_Y + 2, checkpointWidth * 0.44, 'rgba(226, 151, 56, 0.18)');
        ctx.restore();
        return;
      }
      const checkpointDrawn = DRAW_JOURNEY_FLAG_MARKERS && drawMarkerSprite(
          ctx,
          markerSpriteAssetsRef.current,
          'checkpoint',
          {
            x: cx - checkpointWidth / 2,
            y: GROUND_Y - checkpointHeight + (openingCheckpointMarker ? 20 : 10),
            width: checkpointWidth,
            height: checkpointHeight,
          },
          0,
        );
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      if (checkpointDrawn) {
        drawRouteGroundApron(ctx, cx, GROUND_Y - 1, checkpointWidth * (openingCheckpointMarker ? 0.84 : 0.9), checkpointSection.id, openingCheckpointMarker ? 0.78 : active ? 0.96 : 0.8, Math.round(markerX));
        drawContactShadow(ctx, cx, GROUND_Y + 2, checkpointWidth * (openingCheckpointMarker ? 0.72 : 0.76), openingCheckpointMarker ? 0.24 : active ? 0.22 : 0.16, 1.1);
        drawGroundDustLip(ctx, cx, GROUND_Y + 2, checkpointWidth * (openingCheckpointMarker ? 0.68 : 0.72), openingCheckpointMarker ? 'rgba(226, 151, 56, 0.28)' : 'rgba(116, 72, 36, 0.24)');
        ctx.restore();
        return;
      }
      drawRouteGroundApron(ctx, cx, GROUND_Y - 1, 92, checkpointSection.id, active ? 0.86 : 0.7, Math.round(markerX));
      drawContactShadow(ctx, cx, GROUND_Y + 1, 76, active ? 0.22 : 0.14, 1);
      drawGroundDustLip(ctx, cx, GROUND_Y + 1, 70, 'rgba(116, 72, 36, 0.24)');
      ctx.fillStyle = active ? '#d2b277' : '#9f7646';
      ctx.strokeStyle = active ? 'rgba(22, 101, 52, 0.86)' : 'rgba(69, 26, 3, 0.62)';
      ctx.lineWidth = active ? 2.25 : 1.75;
      [
        { x: -22, y: -13, w: 26, h: 13 },
        { x: 1, y: -17, w: 24, h: 17 },
        { x: -11, y: -33, w: 22, h: 17 },
      ].forEach((stone, index) => {
        ctx.beginPath();
        ctx.roundRect(cx + stone.x, GROUND_Y + stone.y, stone.w, stone.h, 3);
        ctx.globalAlpha = active ? 1 : 0.9 - index * 0.04;
        ctx.fill();
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      if (active) {
        ctx.strokeStyle = 'rgba(22, 101, 52, 0.74)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, GROUND_Y - 31, 20 + Math.sin(now / 280) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(22, 101, 52, 0.62)';
        ctx.beginPath();
        ctx.ellipse(cx, GROUND_Y - 28, 8 + Math.sin(now / 260), 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!openingCheckpointMarker && (active || showWorldLabel(markerX, 130))) {
        drawFieldNoteLabel(ctx, cx, checkpoint.y - 20, active ? 'Checkpoint' : checkpoint.name, active ? '#166534' : '#78350f');
      }
      ctx.restore();
    });

    const activeBossDomainForObjectiveMarkers = current.bossDomain
      && !current.defeatedMiniBosses.has(current.bossDomain.bossId)
      ? current.bossDomain
      : null;
    if (!chamberSceneActive && !current.arrivalThresholdActive) getRouteGateDoorwayEntries().forEach((entry) => {
      const status = getDoorwayGateStatus(entry, current);
      const gate = status.activeGate;
      const doorway = entry.doorway;
      if (!gate) return;
      const doorwayAnchorX = doorway?.anchorX ?? gate.x;
      const doorwayWidth = doorway?.width ?? gate.width;
      const doorwayLeft = doorway ? doorwayAnchorX - doorwayWidth / 2 : gate.x;
      if (
        activeBossDomainForObjectiveMarkers
        && doorwayAnchorX >= (activeBossDomainForObjectiveMarkers.arenaStart ?? -Infinity) - 24
        && doorwayAnchorX <= (activeBossDomainForObjectiveMarkers.arenaEnd ?? Infinity) + 72
      ) return;
      const gx = worldToScreenX(doorway ? doorwayAnchorX : gate.x, cameraX);
      if (!isHorizontallyVisible(doorwayLeft, doorwayWidth, cameraX, 100)) return;
      drawRouteGate(ctx, gate, gx, current, status.complete, 'base', doorway);
    });
    if (!chamberSceneActive && !current.arrivalThresholdActive && !activeBossDomainForObjectiveMarkers) drawMissingObjectiveMarker(ctx, activeGateGuidance, cameraX, now);

    if (!chamberSceneActive && !current.arrivalThresholdActive) STAGE_ENTRANCE_FEATURES.forEach((feature) => {
      if (!shouldRenderStageEntranceFeatureForState(feature, current)) return;
      drawStageEntranceFeature(ctx, feature, cameraX, now);
    });

    if (!current.arrivalThresholdActive && !current.enemiesDisabled) current.enemies.forEach((enemy) => {
      if (!isEnemyDefeatedVisible(enemy)) return;
      if (!isEntityActiveInScene(enemy, current)) return;
      const activeBossDomain = current.bossDomain
        && !current.defeatedMiniBosses.has(current.bossDomain.bossId)
        ? current.bossDomain
        : null;
      if (!enemy.defeated && isNormalEnemyInsideBossFocus(enemy, activeBossDomain)) return;
      const ex = worldToScreenX(enemy.x, cameraX);
      if (!isHorizontallyVisible(enemy.x, enemy.width, cameraX, 50)) return;
      const enemyFootLift = typeof getDesertEntryEnemyFootLift === 'function'
        ? getDesertEntryEnemyFootLift(enemy, current)
        : 0;
      const enemyGroundPlaneRenderY = getGroundPlaneEntityRenderY(enemy, current) - enemyFootLift;
      const renderEnemy = Number.isFinite(enemyGroundPlaneRenderY) && enemyGroundPlaneRenderY !== enemy.y
        ? { ...enemy, y: enemyGroundPlaneRenderY }
        : enemy;
      if (!enemy.defeated && enemy.encounterRole && current.renderStats) {
        current.renderStats.visibleCombatPressureEnemies = Array.from(new Set([
          ...(current.renderStats.visibleCombatPressureEnemies || []),
          enemy.id,
        ])).slice(-8);
      }
      
      ctx.save();
      const shakeX = enemy.hitFlash > 0 ? Math.sin(now / 20) * 5 : 0;
      if (!enemy.defeated) drawEnemyAttackTell(ctx, renderEnemy, ex, cameraX, now, false, true);

      // Main Visual
      const spriteDrawn = drawSmallEnemySprite(ctx, renderEnemy, ex, now, shakeX)
        || drawLinkedEnemySprite(ctx, renderEnemy, ex, now, shakeX);
      if (!spriteDrawn) {
        if (enemy.defeated) {
          drawContactShadow(ctx, ex + enemy.width / 2, renderEnemy.y + enemy.height + 3, enemy.width * 0.62, 0.12, 0.75);
          drawGroundDustLip(ctx, ex + enemy.width / 2, renderEnemy.y + enemy.height + 2, enemy.width * 0.68, 'rgba(95, 58, 27, 0.24)');
        } else if (enemy.type === 'scorpion-nest') {
          // Placement + appearance are editor-tunable (Shift+E, click the nest); falls
          // back to SCORPION_NEST_EDITOR_DEFAULTS when no edit exists.
          const nestParams = getEditedNestParams(enemy);
          const nestCx = worldToScreenX(nestParams.x, cameraX) + enemy.width / 2 + shakeX;
          const nestGroundPlaneOffsetY = getDesertEntryVisualGroundOffsetY(
            nestParams.x + enemy.width / 2,
            nestParams.y + enemy.height + nestParams.yOffset,
            current,
          );
          const nestBaseY = nestParams.y + enemy.height + nestParams.yOffset + nestGroundPlaneOffsetY;
          const nestAsset = scorpionNestRef.current;
          const nestGlow = 0.4 + Math.sin(now / 220) * 0.25;
          if (nestAsset.loaded && nestAsset.image) {
            // Real nest art: widen the footprint to the art's native aspect (~2.4:1
            // visible nest baked into the PNG) and anchor the flat burrow lip at the
            // ground line so it sits flush. Native aspect avoids horizontal stretch.
            const nestNativeAspect = (nestAsset.image.naturalWidth || nestAsset.image.width || 3)
              / (nestAsset.image.naturalHeight || nestAsset.image.height || 2);
            const nestDrawWidth = enemy.width * nestParams.widthScale;
            const nestDrawHeight = nestDrawWidth / nestNativeAspect;
            const nestDrawX = nestCx - nestDrawWidth / 2;
            const nestDrawY = nestBaseY - nestDrawHeight;
            drawContactShadow(ctx, nestCx, nestBaseY + 3, nestDrawWidth * 0.52, 0.26, 0.9);
            ctx.drawImage(nestAsset.image, nestDrawX, nestDrawY, nestDrawWidth, nestDrawHeight);
            // Pulsing amber glow over the burrow mouth (centered near the base).
            const glowY = nestBaseY - enemy.height * nestParams.glowYFactor;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const glowGrad = ctx.createRadialGradient(nestCx, glowY, 1, nestCx, glowY, 16 * nestParams.glowSize);
            glowGrad.addColorStop(0, `rgba(255, 168, 76, ${nestGlow})`);
            glowGrad.addColorStop(1, 'rgba(255, 168, 76, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.ellipse(nestCx, glowY, 18 * nestParams.glowSize, 11 * nestParams.glowSize, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            // Placeholder nest visual (final art not yet loaded): a sand mound with a
            // dark burrow opening and pulsing amber eyes.
            drawContactShadow(ctx, nestCx, nestBaseY + 3, enemy.width * 0.95, 0.26, 0.9);
            ctx.fillStyle = '#7a4a1f';
            ctx.strokeStyle = 'rgba(28, 16, 6, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(nestCx, nestBaseY - enemy.height * 0.32, enemy.width * 0.5, enemy.height * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#160d05';
            ctx.beginPath();
            ctx.ellipse(nestCx, nestBaseY - enemy.height * 0.34, enemy.width * 0.24, enemy.height * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(217, 119, 47, ${nestGlow})`;
            ctx.beginPath();
            ctx.ellipse(nestCx - 6, nestBaseY - enemy.height * 0.36, 2.4, 2.4, 0, 0, Math.PI * 2);
            ctx.ellipse(nestCx + 6, nestBaseY - enemy.height * 0.36, 2.4, 2.4, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          drawContactShadow(ctx, ex + enemy.width / 2, renderEnemy.y + enemy.height + 3, enemy.width * 0.72, 0.16, 0.75);
          ctx.fillStyle = enemy.type === 'guardian' || enemy.type === 'statue' ? '#6b7280' : '#78350f';
          ctx.strokeStyle = 'rgba(30, 18, 8, 0.45)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(ex + enemy.width / 2 + shakeX, renderEnemy.y + enemy.height * 0.55, enemy.width * 0.45, enemy.height * 0.43, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Unblockable windup aura is now drawn (in red) by drawEnemyAttackTell's
      // colour-coded telegraph, so the old pale-gold ellipse here was removed to
      // avoid a conflicting double ring.

      // Only show normal enemy health after damage so full bars do not read as platforms.
      if (!enemy.defeated && enemy.health > COMBAT_DAMAGE_SCALE && enemy.health < enemy.maxHealth) {
        const enemyDrawBox = getEnemySpriteDrawBox(renderEnemy, ex, 0, getCombatMode(enemy)) || {
          x: ex,
          y: renderEnemy.y,
          width: enemy.width,
          height: enemy.height,
        };
        const enemyBarWidth = Math.max(34, enemyDrawBox.width * 0.56);
        const enemyBarX = clamp(enemyDrawBox.x + enemyDrawBox.width / 2 - enemyBarWidth / 2, 10, CANVAS_WIDTH - enemyBarWidth - 10);
        const enemyBarY = Math.max(18, enemyDrawBox.y - 9);
        const enemyHealthRatio = clamp(enemy.health / enemy.maxHealth, 0, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(enemyBarX, enemyBarY, enemyBarWidth, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(enemyBarX, enemyBarY, enemyHealthRatio * enemyBarWidth, 4);
      }

      ctx.restore();
    });

    if (!current.enemiesDisabled) current.miniBosses.forEach((boss) => {
      const editedBoss = getEditedMiniBoss(boss);
      const lairPlacement = getScarabQueenLairPlacement(editedBoss);
      if (!isEntityActiveInScene(boss, current)) return;
      if (boss.defeated) return;
      const bx = worldToScreenX(boss.x, cameraX);
      if (!isHorizontallyVisible(boss.x, boss.width, cameraX, 100)) return;
      const bossGroundPlaneRenderY = getGroundPlaneEntityRenderY(boss, current);
      const renderBoss = Number.isFinite(bossGroundPlaneRenderY) && bossGroundPlaneRenderY !== boss.y
        ? { ...boss, y: bossGroundPlaneRenderY }
        : boss;
      const isBuriedScarabQueen = boss.id === SCARAB_SEAL_TRIGGER.bossId
        && isEgyptJourney;
      const bossIntroActive = current.bossIntro?.id === boss.id;
      const bossDomainActive = isBuriedScarabQueen && current.bossDomain?.bossId === boss.id;
      if (isBuriedScarabQueen && !boss.awakened && !bossIntroActive) {
        drawScarabQueenLairOpeningProp(ctx, lairPlacement.x, cameraX, now, null, lairPlacement);
        return;
      }
      if (bossDomainActive) {
        drawScarabQueenLairOpeningProp(ctx, lairPlacement.x || current.bossDomain.bossStartX || boss.x + boss.width / 2, cameraX, now, null, lairPlacement);
      }
      drawMiniBoss(ctx, renderBoss, bx, now);
      if (!bossIntroActive) drawEnemyAttackTell(ctx, renderBoss, bx, cameraX, now, true, true);
    });

    if (
      !chamberSceneActive
      && !current.arrivalThresholdActive
      && !DESERT_ENTRY_LAYERED_NECROPOLIS_OWNS_RAVINE_VISUALS
    ) {
      drawLostBridgeRavineForegroundVoid(ctx, renderablePlatforms, cameraX, current);
    }

    (current.bossKeyItems || []).forEach((keyItem) => {
      if (chamberSceneActive) return;
      if (!keyItem.dropped || keyItem.collected) return;
      drawCollectible(ctx, keyItem.x, keyItem.y, cameraX, now, keyItem.label || 'S', keyItem.color || '#b45309', false, false, {
        key: keyItem.spriteKey || 'loreTablet',
        kind: 'objective',
        size: 44,
        ringSize: 54,
        glowAlpha: 0.42,
        shadowAlpha: 0.2,
        bobAmplitude: 2,
        anchor: 'center',
        nearGlowDistance: 170,
        ringKey: 'objectiveHighlightRing',
      });
      if (showWorldLabel(keyItem.x, 180, 'critical')) {
        drawFieldNoteLabel(ctx, keyItem.x - cameraX, keyItem.y - 34, keyItem.name, keyItem.color || '#b45309');
      }
    });

    const getShardVisualBaseY = (shard) => {
      const platform = getRenderablePlatforms(current)
        .filter(p => p.y !== GROUND_Y)
        .find(p => (
          shard.x >= p.x - 8
          && shard.x <= p.x + p.width + 8
          && Math.abs(shard.y - (p.y + p.height)) <= 34
        ));
      if (platform) return platform.y - 4;
      return shard.y + COLLECTIBLE_VISUAL_BASE.relicShard.anchorYOffset;
    };

    RELIC_SHARDS.forEach(shard => {
      if (chamberSceneActive) return;
      if (current.collectedShardIds.has(shard.id)) return;
      const routeRewardAccessible = isRouteRewardAccessible(shard.routeId, current);
      const visible = (!shard.hidden || current.collectedUpgrades.has('historian-vision') || routeRewardAccessible)
        && (!shard.routeId || routeRewardAccessible);
      if (visible) {
        drawCollectible(ctx, shard.x, shard.y, cameraX, now, '💎', '#f59e0b', shard.hidden, true, {
          key: getRelicShardSpriteKey(shard),
          kind: 'shard',
          size: COLLECTIBLE_VISUAL_BASE.relicShard.size,
          ringSize: COLLECTIBLE_VISUAL_BASE.relicShard.ringSize,
          glowAlpha: COLLECTIBLE_VISUAL_BASE.relicShard.glowAlpha,
          shadowAlpha: COLLECTIBLE_VISUAL_BASE.relicShard.shadowAlpha,
          bobAmplitude: COLLECTIBLE_VISUAL_BASE.relicShard.bobAmplitude,
          sparkleAlpha: COLLECTIBLE_VISUAL_BASE.relicShard.sparkleAlpha,
          sparkleSize: COLLECTIBLE_VISUAL_BASE.relicShard.sparkleSize,
          anchorYOffset: COLLECTIBLE_VISUAL_BASE.relicShard.anchorYOffset,
          nearGlowDistance: COLLECTIBLE_VISUAL_BASE.relicShard.nearGlowDistance,
          baseY: getShardVisualBaseY(shard),
          ringKey: 'availableGlowRing',
          shadowBlur: 8,
        });
      }
    });

    getActiveSecretCollectibles().forEach(secret => {
      if (!isEntityActiveInScene(secret, current)) return;
      if (current.collectedSecretIds?.has(secret.id)) return;
      const discoveredRoute = current.discoveredHiddenRouteIds?.has(secret.routeId);
      const routeRewardAccessible = isRouteRewardAccessible(secret.routeId, current);
      if (!routeRewardAccessible && Math.abs(secret.x - current.player.x) > 260) return;
      drawCollectible(ctx, secret.x, secret.y, cameraX, now, secret.shortName?.slice(0, 1) || 'S', secret.color || '#b45309', true, false, {
        key: secret.spriteKey || 'loreTablet',
        kind: 'objective',
        size: 34,
        ringSize: 48,
        glowAlpha: discoveredRoute ? 0.42 : 0.22,
        shadowAlpha: 0.18,
        bobAmplitude: 2,
        sparkleAlpha: 0.55,
        sparkleSize: 2.5,
        anchor: 'center',
        nearGlowDistance: 190,
        ringKey: 'objectiveHighlightRing',
      });
      if (showWorldLabel(secret.x, 120, 'critical')) {
        drawFieldNoteLabel(ctx, secret.x - cameraX, secret.y - 30, secret.shortName || secret.name, secret.color || '#b45309');
      }
    });

    LORE_TABLETS.forEach(tablet => {
      if (chamberSceneActive) return;
      if (current.collectedTabletIds?.has(tablet.id)) return;
      if (tablet.routeId && !isRouteRewardAccessible(tablet.routeId, current)) return;
      drawCollectible(ctx, tablet.x, tablet.y, cameraX, now, 'T', '#facc15', true, false, {
        key: 'loreTablet',
        kind: 'objective',
        size: 30,
        ringSize: 42,
        glowAlpha: 0.28,
        shadowAlpha: 0.14,
        bobAmplitude: 1.6,
        sparkleAlpha: 0.42,
        sparkleSize: 2,
        anchor: 'center',
        nearGlowDistance: 150,
        ringKey: 'objectiveHighlightRing',
      });
    });

    UPGRADES.forEach(upgrade => {
      if (chamberSceneActive) return;
      if (!current.collectedUpgrades.has(upgrade.id)) {
        drawCollectible(ctx, upgrade.x, upgrade.y, cameraX, now, upgrade.emoji, '#2563eb', false, false, {
          key: getUpgradeSpriteKey(upgrade.id),
          kind: 'upgrade',
          size: COLLECTIBLE_VISUAL_BASE.upgrade.size,
          ringSize: COLLECTIBLE_VISUAL_BASE.upgrade.ringSize,
          glowAlpha: COLLECTIBLE_VISUAL_BASE.upgrade.glowAlpha,
          shadowAlpha: COLLECTIBLE_VISUAL_BASE.upgrade.shadowAlpha,
          bobAmplitude: COLLECTIBLE_VISUAL_BASE.upgrade.bobAmplitude,
          sparkleAlpha: COLLECTIBLE_VISUAL_BASE.upgrade.sparkleAlpha,
          sparkleSize: COLLECTIBLE_VISUAL_BASE.upgrade.sparkleSize,
          anchorYOffset: COLLECTIBLE_VISUAL_BASE.upgrade.anchorYOffset,
          nearGlowDistance: COLLECTIBLE_VISUAL_BASE.upgrade.nearGlowDistance,
          hideGlow: true,
        });
        if (showWorldLabel(upgrade.x, 135, 'critical')) {
          drawFieldNoteLabel(ctx, upgrade.x - cameraX, upgrade.y - 30, upgrade.name, '#2563eb');
        }
      }
    });

    TOOL_LAYOUT.forEach(toolPos => {
      if (chamberSceneActive) return;
      if (!current.collectedToolIds.has(toolPos.id)) {
        const tool = JOURNEY_TOOLS.find(t => t.id === toolPos.id);
        drawCollectible(ctx, toolPos.x, toolPos.y, cameraX, now, tool.emoji, '#d4af37', false, false, {
          key: getToolSpriteKey(toolPos.id),
          kind: 'tool',
          size: toolPos.id === 'field-guide-page'
            ? COLLECTIBLE_VISUAL_BASE.fieldTool.fieldGuideSize
            : COLLECTIBLE_VISUAL_BASE.fieldTool.size,
          ringSize: COLLECTIBLE_VISUAL_BASE.fieldTool.ringSize,
          glowAlpha: COLLECTIBLE_VISUAL_BASE.fieldTool.glowAlpha,
          shadowAlpha: COLLECTIBLE_VISUAL_BASE.fieldTool.shadowAlpha,
          bobAmplitude: COLLECTIBLE_VISUAL_BASE.fieldTool.bobAmplitude,
          sparkleAlpha: COLLECTIBLE_VISUAL_BASE.fieldTool.sparkleAlpha,
          sparkleSize: COLLECTIBLE_VISUAL_BASE.fieldTool.sparkleSize,
          anchorYOffset: COLLECTIBLE_VISUAL_BASE.fieldTool.anchorYOffset,
          nearGlowDistance: COLLECTIBLE_VISUAL_BASE.fieldTool.nearGlowDistance,
          hideGlow: true,
        });
        if (showWorldLabel(toolPos.x, 125)) {
          drawFieldNoteLabel(ctx, toolPos.x - cameraX, toolPos.y - 30, tool.name, '#b45309');
        }
      }
    });

    OBJECTIVE_MARKERS.forEach(marker => {
      if (chamberSceneActive) return;
      if (current.collectedObjectiveIds.has(marker.id)) return;
      const mx = worldToScreenX(marker.x, cameraX);
      if (!isHorizontallyVisible(marker.x, 1, cameraX, 50)) return;
      const emoji = marker.type === 'switch' ? '⚙️' : marker.type === 'glyph' ? '📜' : marker.type === 'escape' ? '🏃' : '🚩';
      const markerNeeded = activeGateGuidance?.nearestMissingObjective?.id === marker.id;
      const markerSize = marker.type === 'map-tablet'
        ? COLLECTIBLE_VISUAL_BASE.objective.mapTabletSize
        : COLLECTIBLE_VISUAL_BASE.objective.size;
      const markerBaseY = marker.visualBaseY ?? (marker.y + 12 + COLLECTIBLE_VISUAL_BASE.objective.anchorYOffset);
      ctx.save();
      drawCollectible(ctx, marker.x + 15, marker.y + 12, cameraX, now, emoji, marker.color || '#b45309', false, false, {
        key: getObjectiveSpriteKey(marker.type),
        kind: 'objective',
        size: markerSize,
        ringSize: COLLECTIBLE_VISUAL_BASE.objective.ringSize,
        glowAlpha: 0,
        shadowAlpha: marker.groundedProp ? 0.22 : COLLECTIBLE_VISUAL_BASE.objective.shadowAlpha,
        shadowWidth: marker.groundedProp ? markerSize * 0.82 : undefined,
        bobAmplitude: marker.groundedProp ? 0 : COLLECTIBLE_VISUAL_BASE.objective.bobAmplitude,
        sparkleAlpha: marker.groundedProp ? 0 : COLLECTIBLE_VISUAL_BASE.objective.sparkleAlpha,
        sparkleSize: marker.groundedProp ? 0 : COLLECTIBLE_VISUAL_BASE.objective.sparkleSize,
        anchorYOffset: COLLECTIBLE_VISUAL_BASE.objective.anchorYOffset,
        baseY: markerBaseY,
        nearGlowDistance: COLLECTIBLE_VISUAL_BASE.objective.nearGlowDistance,
        hideGlow: true,
      });
      if (showWorldLabel(marker.x, markerNeeded ? 170 : 120, markerNeeded ? 'critical' : 'normal')) {
        drawFieldNoteLabel(ctx, mx + 15, marker.groundedProp ? markerBaseY - markerSize - 10 : marker.y - 15, marker.label, marker.color || '#b45309');
      }
      ctx.restore();
    });

    if (!chamberSceneActive) drawDiscoveryEntrance(ctx, DISCOVERY_ENTRANCE, cameraX, current, now);

    const suppressRuntimeAttackArc = playerSpriteRef.current.mode === 'hero-atlas'
      && playerSpriteRef.current.atlas?.draw?.suppressRuntimeAttackArc;
    if (current.attackTimer > 0 && !suppressRuntimeAttackArc) {
      drawAttackArc(ctx, current.playerAttackBox, cameraX, player.direction, '#facc15', getPlayerAttackState(current));
    } else if (current.attackTimer > 0 && current.renderStats) {
      current.renderStats.playerAttackArcMode = 'integrated-hero-atlas';
    }
    drawArrivalThresholdTrial(ctx, current, now);
    drawOpeningSphinxEncounter(ctx, current.openingSphinxEncounter, cameraX, now);
    drawCombatEffects(ctx, current.combatHitEffects, cameraX, now);
    drawDesertEntryGroundMotionCues(ctx, player, cameraX, now);
    const playerRenderY = Number.isFinite(playerGroundPlaneRenderY) ? playerGroundPlaneRenderY : player.y;
    const hasDedicatedDodgeRow = playerSpriteRef.current.mode === 'hero-atlas'
      && Boolean(getHeroSpriteRow(playerSpriteRef.current.atlas, 'dodge'));
    if (current.dodgeTrail?.length && !hasDedicatedDodgeRow) {
      current.dodgeTrail.forEach((ghost) => {
        ctx.save();
        ctx.globalAlpha = clamp(ghost.alpha, 0, 0.35);
        const ghostGroundPlaneRenderY = getGroundPlaneEntityRenderY({
          x: ghost.x,
          y: ghost.y,
          width: player.width,
          height: player.height,
        }, current);
        const ghostRenderY = Number.isFinite(ghostGroundPlaneRenderY) ? ghostGroundPlaneRenderY : ghost.y;
        drawPlayerSprite(ctx, ghost.x - cameraX, ghostRenderY, player.width, player.height, ghost.dir, 0, now);
        ctx.restore();
      });
    }
    drawPlayerSprite(ctx, player.x - cameraX, playerRenderY, player.width, player.height, player.direction, player.invulnerable, now);
    if (!chamberSceneActive && !current.arrivalThresholdActive && section.id === 'desert-entry' && current.renderStats) {
      current.renderStats.desertEntryForegroundDepthLoaded = false;
      current.renderStats.desertEntryForegroundDepthMode = 'retired-integrated-background-carries-front-edge';
    }
    drawForegroundOccluderProps(ctx, current, cameraX, now);
    if (!chamberSceneActive) getRouteGateDoorwayEntries().forEach((entry) => {
      const status = getDoorwayGateStatus(entry, current);
      const gate = status.activeGate;
      const doorway = entry.doorway;
      if (!gate) return;
      const doorwayAnchorX = doorway?.anchorX ?? gate.x;
      const doorwayWidth = doorway?.width ?? gate.width;
      const doorwayLeft = doorway ? doorwayAnchorX - doorwayWidth / 2 : gate.x;
      if (
        activeBossDomainForObjectiveMarkers
        && doorwayAnchorX >= (activeBossDomainForObjectiveMarkers.arenaStart ?? -Infinity) - 24
        && doorwayAnchorX <= (activeBossDomainForObjectiveMarkers.arenaEnd ?? Infinity) + 72
      ) return;
      const gx = worldToScreenX(doorway ? doorwayAnchorX : gate.x, cameraX);
      if (!isHorizontallyVisible(doorwayLeft, doorwayWidth, cameraX, 100)) return;
      drawRouteGate(ctx, gate, gx, current, status.complete, 'foreground', doorway);
    });
    if (!chamberSceneActive) STAGE_ENTRANCE_FEATURES.forEach((feature) => {
      if (!shouldRenderStageEntranceFeatureForState(feature, current)) return;
      drawStageEntranceForegroundOccluder(ctx, feature, cameraX, now);
    });
    drawArrivalThresholdDoorwayOccluder(ctx, current, now);
    if (!chamberSceneActive && ENABLE_FOREGROUND_DEPTH_LAYER) {
      drawForegroundDepthLayer(ctx, section, cameraX, now);
    }
    drawOpeningThresholdScene(ctx, current.openingThresholdScene, cameraX, now);
    drawTempleThresholdTransition(ctx, current.templeThresholdTransition, now);
    drawForgottenMuralChamberTransition(ctx, current.forgottenMuralChamberTransition);
    drawOpeningCinematic(ctx, current.openingCinematic, now);
    ctx.restore();

    drawPlayerFeedbackOverlays(ctx, current, cameraX, secretVerticalCameraOffset, now);

    drawDebugPlatformOverlay(ctx, current, cameraX);

    drawPropPlacementEditorOverlay(ctx, current, cameraX);

    ctx.restore();

    drawCinematicCards(ctx, current);
  }, [backgroundPackId, drawAncientRouteGround, drawArrivalThresholdDoorwayOccluder, drawArrivalThresholdScene, drawArrivalThresholdTrial, drawAttackArc, drawCinematicCards, drawCollectible, drawCombatEffects, drawConnectedWorldAmbientLife, drawChinaRiverValleyBackground, drawDebugPlatformOverlay, drawDesertEntryGroundLane, drawDesertEntryGroundMotionCues, drawDesertEntryBackground, drawDesertForegroundAtmosphere, drawDesertJourneySceneMasks, drawDesertJourneyScenePanels, drawDiscoveryEntrance, drawDynamicEnvironmentEvent, drawEgyptAmbientLife, drawEnemyAttackTell, drawEnvironmentInteraction, drawForegroundDepthLayer, drawForegroundOccluderProps, drawTempleThresholdHallInterior, drawMummificationChamberInterior, drawForgottenMuralChamberInterior, drawForgottenMuralChamberTransition, drawHazard, drawHiddenRouteHint, drawLinkedEnemySprite, drawLostBridgeRavineDepth, drawLostBridgeRavineForegroundVoid, drawLostBridgeStructure, drawMiniBoss, drawMissingObjectiveMarker, drawOpeningCinematic, drawOpeningPyramidMasonryBack, drawOpeningSphinxEncounter, drawOpeningThresholdScene, drawPlatform, drawPlayerFeedbackOverlays, drawPremiumEgyptianChamberDoor, drawPropPlacementEditorOverlay, drawRouteGate, drawScarabQueenLairOpeningProp, drawScribeLockedChamberInterior, drawSectionParallaxBackground, drawSectionParallaxForeground, drawSectionTransitionBlend, drawSmallEnemySprite, drawStageEntranceFeature, drawStageEntranceForegroundOccluder, drawStoryProp, drawTempleBackdrop, drawTempleThresholdTransition, drawTrapProjectile, drawWorldContinuityLandmark, drawWorldTransitionMarker, getActiveHiddenRoutes, getActiveSecretCollectibles, getCombatMode, getDesertEntryVisualGroundOffsetY, getDoorwayGateStatus, getEditedMiniBoss, getEditedNestParams, getGateGuidance, getGroundPlaneEntityRenderY, getPlayerAttackState, getRenderableCheckpoints, getRenderableHazards, getRenderablePlatforms, getZIndexSortedRenderableStoryProps, getRouteGateDoorwayEntries, getScarabQueenLairPlacement, isRouteRewardAccessible, resolveChamberEntryTrigger, scopedJourneyAssetPacks.isChinaJourney, scopedJourneyAssetPacks.isRomeJourney, drawPlayerSprite, drawFieldNoteLabel]);

  return { draw };
}
