// Split into themed modules under ./renderer/ - this file re-exports everything
// so existing imports keep working, and hosts the useJourneyRenderer hook.
import {
  drawArrivalThresholdDoorwayOccluderFrame,
  drawArrivalThresholdSceneFrame,
  drawArrivalThresholdTrialFrame,
  drawForgottenMuralChamberTransitionFrame,
  drawOpeningCinematicFrame,
  drawOpeningSphinxDialogueFrame,
  drawOpeningSphinxEncounterFrame,
  drawOpeningThresholdSceneFrame,
  drawTempleThresholdTransitionFrame,
  getOpeningSphinxSpriteFrame,
} from './renderer/rendererOpeningScenes.js';
import {
  drawPlayerSpriteFrame,
} from './renderer/rendererPlayer.js';
import {
  drawAncientRouteGroundFrame,
  drawBuriedStoneCausewaySurfaceFrame,
  drawDesertEntryGroundMotionCuesFrame,
  drawPlatformFrame,
} from './renderer/rendererPlatforms.js';
import {
  drawCollectibleFrame,
  drawStoryPropFrame,
} from './renderer/rendererProps.js';
import {
  drawChinaRiverValleyBackgroundFrame,
  drawDesertEntryBackgroundFrame,
  drawDesertEntryForegroundDepthFrame,
  drawDesertEntryGroundLaneFrame,
  drawDesertForegroundAtmosphereFrame,
  drawDesertJourneySceneMasksFrame,
  drawDesertJourneyScenePanelsFrame,
  drawForegroundDepthLayerFrame,
  drawSectionParallaxBackgroundFrame,
  drawSectionParallaxForegroundFrame,
  drawSectionTransitionBlendFrame,
  drawTempleBackdropFrame,
} from './renderer/rendererBackgrounds.js';
import {
  drawBossSpriteFrame,
  drawConnectedWorldAmbientLifeFrame,
  drawEgyptAmbientLifeFrame,
  drawEnemyAttackTellFrame,
  drawLinkedEnemySpriteFrame,
  drawMiniBossFrame,
  drawScarabQueenLairOpeningPropFrame,
  drawSmallEnemySpriteFrame,
} from './renderer/rendererEnemies.js';
import {
  drawAttackArcFrame,
  drawCinematicCardsFrame,
  drawCombatEffectsFrame,
  drawDebugPlatformOverlayFrame,
  drawForegroundOccluderPropsFrame,
  drawHiddenRouteHintFrame,
  drawMissingObjectiveMarkerFrame,
  drawPlayerFeedbackOverlaysFrame,
  drawPropPlacementEditorOverlayFrame,
  drawStageEntranceForegroundOccluderFrame,
  drawWorldTransitionMarkerFrame,
} from './renderer/rendererEffectsOverlays.js';
import {
  drawDiscoveryEntranceFrame,
  drawDynamicEnvironmentEventFrame,
  drawEnvironmentInteractionFrame,
  drawHazardFrame,
  drawPremiumEgyptianChamberDoorFrame,
  drawRouteGateFrame,
  drawStageEntranceFeatureFrame,
  drawTrapProjectileFrame,
  drawWorldContinuityLandmarkFrame,
} from './renderer/rendererWorldFeatures.js';

export * from './renderer/rendererOpeningScenes.js';
export * from './renderer/rendererPlayer.js';
export * from './renderer/rendererPlatforms.js';
export * from './renderer/rendererProps.js';
export * from './renderer/rendererBackgrounds.js';
export * from './renderer/rendererEnemies.js';
export * from './renderer/rendererEffectsOverlays.js';
export * from './renderer/rendererWorldFeatures.js';

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
