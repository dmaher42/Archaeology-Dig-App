import { useCallback } from 'react';

import {
  CANVAS_WIDTH,
  COYOTE_TIME,
  JUMP_BUFFER_TIME,
  JUMP_CUT_MULTIPLIER,
  OPENING_PYRAMID_AIR_JUMP_MULTIPLIER,
  PLAYER_SPRITE_SCALE,
  WORLD_WIDTH,
} from './journeyConstants';
import {
  getEnemyCombatIntent,
} from './journeyCombat.js';
import {
  DISCOVERY_ENTRANCE,
  JOURNEY_TOOLS,
  LORE_TABLETS,
  PLATFORMS,
  RELIC_SHARDS,
  ROUTE_GATES,
  SCARAB_SEAL_TRIGGER,
  SECTIONS,
  SECTION_ATMOSPHERES,
} from './journeyDataRouter';
import {
  clamp,
  FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_VERSION,
  getNextJourneyRouteGate,
  getSectionForX,
} from './journeyUtils';
import {
  getCanvasScaleState,
  JOURNEY_CAMERA,
  JOURNEY_HUD_SAFE_AREA,
  JOURNEY_RENDER_TARGET,
  JOURNEY_VIEWPORT,
  JOURNEY_WORLD_LAYOUT,
} from './journeyLayout';
import {
  ATLAS_TUNING_VERSION,
  DESERT_VISUAL_TUNING_VERSION,
  EGYPT_ATMOSPHERE_ASSET_VERSION,
  EGYPT_FOREGROUND_DEPTH_ASSET_VERSION,
  EGYPT_PREMIUM_GROUND_CONTACT_ASSET_VERSION,
  ENVIRONMENT_ATLAS_JSON,
  getMissingEnvironmentAssets,
  JOURNEY_ASSET_GROUNDING_VERSION,
  MUMMIFICATION_CHAMBER_INTERACTIONS_ASSET_VERSION,
} from './journeyRenderAssets';
import {
  CATACOMBS_BACKGROUND_ATLAS_JSON,
  CHINA_RIVER_VALLEY_BACKGROUND_ATLAS_JSON,
  DIG_SITE_BACKGROUND_ATLAS_JSON,
  ESCAPE_BACKGROUND_ATLAS_JSON,
  getMissingSectionBackgroundAssets,
  getSectionBackgroundAssets,
  RUINED_TEMPLE_BACKGROUND_ATLAS_JSON,
} from './journeyBackgroundAssets';
import {
  ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON,
  BOSS_SPRITE_ATLAS_JSON,
  BOSS_SPRITE_ATLAS_VERSION,
  CHINA_CLAY_GUARDIAN_BOSS_ID,
  CHINA_CLAY_GUARDIAN_SPRITE_ATLAS_JSON,
  getMissingBossSpriteAssets,
  STONE_GUARDIAN_SPRITE_ATLAS_JSON,
} from './journeyBossSprites';
import {
  CHINA_ENEMY_GUARDIAN_SPRITE_ATLAS_JSON,
  ENEMY_SPRITE_ATLAS_VERSION,
  EXPECTED_CHINA_ENEMY_GUARDIAN_SPRITE_KEYS,
  getEnemySpriteDebugAtlasState,
  getMissingEnemySpriteAssets,
} from './journeyEnemySprites';
import {
  COLLECTIBLE_ATLAS_JSON,
  COLLECTIBLE_SPRITE_ATLAS_VERSION,
  getMissingCollectibleSpriteAssets,
} from './journeyCollectibleSprites';
import {
  getMissingPlayerWeaponSpriteAssets,
  getPlayerWeaponFrameKey,
  PLAYER_WEAPON_ATLAS_JSON,
  PLAYER_WEAPON_ATLAS_VERSION,
} from './journeyPlayerWeaponSprites';
import {
  DYNAMIC_WORLD_EFFECTS_VERSION,
} from './journeyDynamicWorldAssets';
import {
  getMissingMarkerSpriteAssets,
  MARKER_SPRITE_ATLAS_JSON,
  MARKER_SPRITE_VERSION,
} from './journeyMarkerSprites';
import {
  COMBAT_CHALLENGE_MODE,
  COMBAT_INTENSITY_VERSION,
  PLAYER_ATTACK_TYPES,
} from './journeyCombat.js';
import {
  ARRIVAL_THRESHOLD_BACKGROUND_SRC,
  ARRIVAL_THRESHOLD_EXIT_WALK_SECONDS,
  getOpeningCinematicLine,
  getOpeningThresholdDialogueLine,
  OPENING_THRESHOLD_FADE_SECONDS,
  OPENING_THRESHOLD_FALL_DELAY_SECONDS,
  OPENING_THRESHOLD_FALL_DURATION_SECONDS,
  OPENING_THRESHOLD_STAIR_REVEAL_SECONDS,
} from './journeyOpeningScenes';
import {
  FORGOTTEN_MURAL_CHAMBER_RESTORATION_IDS,
  getSacredRoomRestorationEvidence,
  MUMMIFICATION_CHAMBER_ATMOSPHERE_VERSION,
  MUMMIFICATION_CHAMBER_RITUAL_GUIDANCE_VERSION,
} from './journeySacredRooms';

/* eslint-disable react-hooks/exhaustive-deps -- every dependency the rule flags in this file
   is a stable ref or a module-level helper passed in from the component; none change across
   renders, so omitting them from dependency arrays is correct and preserves the original
   pre-extraction behaviour. */

// Debug/AI-readable snapshot builder. Extracted wholesale from ExpeditionJourney as a pure
// mechanical move: the entire `createJourneySnapshot` useCallback (which reads game state plus
// every asset-load ref to assemble the journey snapshot object consumed by the rAF loop and
// effects) relocated here verbatim with its original statement order and useCallback dependency
// array unchanged. Every component-owned ref/state/getter/resolver and component-module constant
// is passed in via the deps object so the produced snapshot is byte-for-byte identical.
export function useJourneySnapshot({
  // --- module-level constants defined in ExpeditionJourney (passed in; not exported) ---
  COLLECTIBLE_SCALE_TUNING_VERSION,
  DECORATIVE_PROP_LAYER_MODE,
  DYNAMIC_WORLD_VERSION,
  FIELD_TOOL_SCALE,
  FOREGROUND_DEPTH_LAYER_MODE,
  JOURNEY_FLAG_VISUAL_MODE,
  JOURNEY_POLISH_VERSION,
  LORE_TABLET_SCALE,
  MUMMIFICATION_CHAMBER_EXTERIOR_VERSION,
  MUMMIFICATION_CHAMBER_INTERIOR_ASSET_DESCRIPTION,
  MUMMIFICATION_CHAMBER_INTERIOR_VERSION,
  OBJECTIVE_MARKER_SCALE,
  OPENING_SPHINX_SPRITE_BOSS_ID,
  OPENING_TRAP_DECAL_ASSET_VERSION,
  PICKUP_GLOW_SCALE,
  PROP_DEPTH_TUNING_VERSION,
  PROP_GROUNDING_INTEGRATION_VERSION,
  REACTIVE_ENVIRONMENT_VERSION,
  RELIC_SHARD_SCALE,
  ROUTE_GROUND_HAZE_FIX_VERSION,
  ROUTE_GROUND_VISUAL_MODE,
  UPGRADE_SCALE,
  WORLD_CONTINUITY_VERSION,
  // --- module-level helpers defined in ExpeditionJourney (passed in; not exported) ---
  getEntitySceneId,
  getJourneySceneId,
  isEntityActiveInScene,
  isPlatformAvailable,
  // --- component refs ---
  arrivalThresholdBackgroundRef,
  arrivalThresholdDoorwayGlowRef,
  arrivalThresholdDoorwayOccluderRef,
  arrivalThresholdDuatEchoRef,
  atmosphereEnvironmentAssetsRef,
  bossSpriteAssetsRef,
  canvasRef,
  collectibleSpriteAssetsRef,
  desertBackgroundAssetsRef,
  dynamicWorldAssetsRef,
  enemySpriteAssetsRef,
  environmentAssetsRef,
  foregroundDepthEnvironmentAssetsRef,
  markerSpriteAssetsRef,
  mummificationChamberExteriorRef,
  mummificationChamberInteriorRef,
  mummificationInteractionAssetsRef,
  openingHazardDecalPackRef,
  openingTrapDecalPackRef,
  playerSpriteRef,
  playerWeaponSpriteRef,
  premiumGroundContactAssetsRef,
  stateRef,
  // --- component state / values ---
  briefingOpen,
  playerHeroSpriteConfig,
  scopedJourneyAssetPacks,
  targetCivilisation,
  // --- component getters / resolvers ---
  getActiveHazardsNearPlayer,
  getActiveHiddenRoutes,
  getActiveSecretCollectibles,
  getBossVulnerabilityState,
  getCombatMode,
  getEnemyPatternConfig,
  getEntityCombatState,
  getGateGuidance,
  getObjectiveProgress,
  getPlayerAttackState,
  getRenderableHazards,
  getRouteAccessState,
  getSectionDisplayName,
  getSectionDisplayTitle,
  getStaminaWarningState,
  isRouteRewardAccessible,
}) {
  const createJourneySnapshot = useCallback((current = stateRef.current) => {
    const fallbackSection = getSectionForX(current.player.x);
    const sectionId = current.currentSectionId || fallbackSection.id;
    const section = SECTIONS.find(item => item.id === sectionId) || fallbackSection;
    const objective = getObjectiveProgress(section.id, current);
    const enemiesDisabled = Boolean(current.enemiesDisabled);
    const activeMiniBoss = enemiesDisabled
      ? null
      : current.miniBosses.find(boss => boss.awakened && !boss.defeated && Math.abs(boss.x - current.player.x) < 520);
    const nearbyCombatEnemy = enemiesDisabled ? null : current.enemies
      .filter(enemy => !enemy.defeated && Math.abs(enemy.x - current.player.x) < 520)
      .sort((a, b) => Math.abs(a.x - current.player.x) - Math.abs(b.x - current.player.x))[0] || null;
    const activeEnemyCounterWindow = enemiesDisabled ? null : current.enemies.find(enemy => !enemy.defeated && (enemy.vulnerabilityTimer > 0 || enemy.attackRecovery > 0));
    const activeBossCounterWindow = enemiesDisabled ? null : current.miniBosses.find(boss => !boss.defeated && (boss.vulnerabilityTimer > 0 || boss.attackRecovery > 0));
    const activeHiddenRoutes = getActiveHiddenRoutes();
    const activeSecretCollectibles = getActiveSecretCollectibles();
    const environmentAssets = environmentAssetsRef.current;
    const missingEnvironmentAssets = getMissingEnvironmentAssets(environmentAssets);
    const environmentFallbackActive = !environmentAssets.loaded || environmentAssets.failed || missingEnvironmentAssets.length > 0;
    const atmosphereEnvironmentAssets = atmosphereEnvironmentAssetsRef.current;
    const missingAtmosphereEnvironmentAssets = getMissingEnvironmentAssets(atmosphereEnvironmentAssets);
    const desertBackgroundAssets = desertBackgroundAssetsRef.current;
    const desertPack = getSectionBackgroundAssets(desertBackgroundAssets, 'desert-entry');
    const chinaRiverValleyPack = getSectionBackgroundAssets(desertBackgroundAssets, 'china-river-valley');
    const ruinedTemplePack = getSectionBackgroundAssets(desertBackgroundAssets, 'ruined-temple');
    const catacombsPack = getSectionBackgroundAssets(desertBackgroundAssets, 'catacombs');
    const escapePack = getSectionBackgroundAssets(desertBackgroundAssets, 'escape-sequence');
    const digSitePack = getSectionBackgroundAssets(desertBackgroundAssets, 'dig-site-entrance');
    const missingDesertBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'desert-entry');
    const missingRuinedTempleBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'ruined-temple');
    const missingCatacombsBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'catacombs');
    const missingEscapeBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'escape-sequence');
    const missingDigSiteBackgroundAssets = getMissingSectionBackgroundAssets(desertBackgroundAssets, 'dig-site-entrance');
    const desertBackgroundFallbackActive = !desertPack?.loaded
      || desertPack.failed
      || missingDesertBackgroundAssets.length > 0;
    const ruinedTempleBackgroundFallbackActive = !ruinedTemplePack?.loaded
      || ruinedTemplePack.failed
      || missingRuinedTempleBackgroundAssets.length > 0;
    const catacombsBackgroundFallbackActive = !catacombsPack?.loaded
      || catacombsPack.failed
      || missingCatacombsBackgroundAssets.length > 0;
    const escapeBackgroundFallbackActive = !escapePack?.loaded
      || escapePack.failed
      || missingEscapeBackgroundAssets.length > 0;
    const digSiteBackgroundFallbackActive = !digSitePack?.loaded
      || digSitePack.failed
      || missingDigSiteBackgroundAssets.length > 0;
    const enemySpriteAssets = enemySpriteAssetsRef.current;
    const missingEnemySpriteAssets = getMissingEnemySpriteAssets(enemySpriteAssets);
    const chinaEnemyGuardianPack = enemySpriteAssets.packs?.chinaEnemyGuardian || null;
    const missingChinaEnemyGuardianSpriteAssets = scopedJourneyAssetPacks.isChinaJourney
      ? EXPECTED_CHINA_ENEMY_GUARDIAN_SPRITE_KEYS
        .filter(key => !chinaEnemyGuardianPack?.atlas?.regions?.[key])
      : [];
    const chinaEnemyGuardianFallbackActive = scopedJourneyAssetPacks.isChinaJourney
      && (!chinaEnemyGuardianPack?.loaded
        || chinaEnemyGuardianPack.failed
        || missingChinaEnemyGuardianSpriteAssets.length > 0);
    const enemySpriteFallbackActive = !enemySpriteAssets.loaded || enemySpriteAssets.failed || missingEnemySpriteAssets.length > 0;
    const bossSpriteAssets = bossSpriteAssetsRef.current;
    const missingBossSpriteAssets = getMissingBossSpriteAssets(bossSpriteAssets);
    const chinaClayGuardianBossPack = bossSpriteAssets.packs?.[CHINA_CLAY_GUARDIAN_BOSS_ID] || null;
    const bossSpriteFallbackActive = !bossSpriteAssets.loaded || bossSpriteAssets.failed || missingBossSpriteAssets.length > 0;
    const collectibleSpriteAssets = collectibleSpriteAssetsRef.current;
    const missingCollectibleSpriteAssets = getMissingCollectibleSpriteAssets(collectibleSpriteAssets);
    const collectibleSpriteFallbackActive = !collectibleSpriteAssets.loaded
      || collectibleSpriteAssets.failed
      || missingCollectibleSpriteAssets.length > 0;
    const playerWeaponAssets = playerWeaponSpriteRef.current;
    const missingPlayerWeaponSpriteAssets = getMissingPlayerWeaponSpriteAssets(playerWeaponAssets);
    const playerWeaponSpriteFallbackActive = !playerWeaponAssets.loaded
      || playerWeaponAssets.failed
      || missingPlayerWeaponSpriteAssets.length > 0;
    const markerSpriteAssets = markerSpriteAssetsRef.current;
    const missingMarkerSpriteAssets = getMissingMarkerSpriteAssets(markerSpriteAssets);
    const markerSpriteFallbackActive = !markerSpriteAssets.loaded
      || markerSpriteAssets.failed
      || missingMarkerSpriteAssets.length > 0;
    const dynamicWorldAssets = dynamicWorldAssetsRef.current;
    const scopedBackgroundFallbackActive = scopedJourneyAssetPacks.backgroundSectionIds
      .some((backgroundSectionId) => {
        const sectionPack = getSectionBackgroundAssets(desertBackgroundAssets, backgroundSectionId);
        return !sectionPack?.ready
          || sectionPack.failed
          || getMissingSectionBackgroundAssets(desertBackgroundAssets, backgroundSectionId).length > 0;
      });
    const renderStats = current.renderStats || {};
    const enemySpriteDebugAtlasState = getEnemySpriteDebugAtlasState(
      enemySpriteAssets,
      renderStats.visibleEnemySpriteFamilies || [],
    );
    const playerAttackBox = current.playerAttackBox
      ? {
        x: Math.round(current.playerAttackBox.x),
        y: Math.round(current.playerAttackBox.y),
        width: current.playerAttackBox.width,
        height: current.playerAttackBox.height,
      }
      : null;
    const nextRouteGate = getNextJourneyRouteGate(ROUTE_GATES, current);

    return {
      stage: 'journey',
      targetCivilisation,
      activeCivilisation: targetCivilisation,
      coordinateSystem: 'origin top-left, x right, y down',
      viewport: JOURNEY_VIEWPORT,
      renderTarget: JOURNEY_RENDER_TARGET,
      worldLayout: JOURNEY_WORLD_LAYOUT,
      cameraLayout: JOURNEY_CAMERA,
      hudSafeArea: JOURNEY_HUD_SAFE_AREA,
      canvasScaleState: getCanvasScaleState(canvasRef.current),
      player: {
        x: Math.round(current.player.x),
        y: Math.round(current.player.y),
        vx: Math.round(current.player.vx),
        vy: Math.round(current.player.vy),
        onGround: current.player.onGround,
        coyoteTimer: Number((current.player.coyoteTimer || 0).toFixed(2)),
        jumpBufferTimer: Number((current.player.jumpBufferTimer || 0).toFixed(2)),
        jumpCutFeedbackTimer: Number((current.player.jumpCutFeedbackTimer || 0).toFixed(2)),
      },
      playerFacing: current.player.direction >= 0 ? 'right' : 'left',
      playerSpriteLoaded: Boolean(playerSpriteRef.current.loaded),
      playerHeroSpriteLoaded: Boolean(playerSpriteRef.current.heroLoaded),
      playerLegacySpriteLoaded: Boolean(playerSpriteRef.current.legacyLoaded),
      playerSpriteCharacterId: playerSpriteRef.current.characterId || playerHeroSpriteConfig.characterId,
      playerSpriteAtlasPath: playerSpriteRef.current.atlasPath || playerHeroSpriteConfig.atlasPath,
      playerSpriteVersion: playerHeroSpriteConfig.version,
      playerSpriteVisualMode: renderStats.playerSpriteVisualMode || playerSpriteRef.current.mode || 'canvas-fallback',
      playerSpriteFrame: renderStats.playerSpriteFrame || null,
      playerSpriteFallbackSrc: playerSpriteRef.current.fallbackSrc || playerHeroSpriteConfig.fallbackSrc,
      playerAnimationState: current.player.animationState || 'idle',
      playerAnimationFrame: current.player.animationFrame ?? 1,
      playerSpriteScale: Number((current.player.spriteScale || PLAYER_SPRITE_SCALE).toFixed(3)),
      environmentAssetsLoaded: Boolean(environmentAssets.loaded),
      environmentAssetsReady: Boolean(environmentAssets.ready),
      environmentPackId: environmentAssets.packId,
      environmentAtlasPath: environmentAssets.atlasPath || ENVIRONMENT_ATLAS_JSON,
      missingEnvironmentAssets,
      environmentFallbackActive,
      atmosphereEnvironmentAssetsLoaded: Boolean(atmosphereEnvironmentAssets.loaded),
      atmosphereEnvironmentAssetsReady: Boolean(atmosphereEnvironmentAssets.ready),
      atmosphereEnvironmentPackId: atmosphereEnvironmentAssets.packId,
      atmosphereEnvironmentAtlasPath: atmosphereEnvironmentAssets.atlasPath || null,
      missingAtmosphereEnvironmentAssets,
      platformArtMode: environmentAssets.loaded ? 'atlas' : 'canvas-fallback',
      hazardArtMode: environmentAssets.loaded ? 'atlas' : 'canvas-fallback',
      gateArtMode: environmentAssets.loaded ? 'atlas' : 'canvas-fallback',
      assetGroundingPassActive: true,
      assetGroundingVersion: JOURNEY_ASSET_GROUNDING_VERSION,
      groundedPropCount: renderStats.groundedPropCount || 0,
      atmospherePropCount: renderStats.atmospherePropCount || 0,
      groundLockedAtmospherePropCount: renderStats.groundLockedAtmospherePropCount || 0,
      atmosphereAssetVersion: EGYPT_ATMOSPHERE_ASSET_VERSION,
      atmosphereGroundingMode: renderStats.atmosphereGroundingMode || 'ground-locked-floor-and-route-edge-assets',
      foregroundDepthAssetVersion: EGYPT_FOREGROUND_DEPTH_ASSET_VERSION,
      foregroundDepthLayerMode: renderStats.foregroundDepthLayerMode || FOREGROUND_DEPTH_LAYER_MODE,
      foregroundDepthAssetLoaded: Boolean(foregroundDepthEnvironmentAssetsRef.current.loaded),
      premiumGroundContactAssetVersion: EGYPT_PREMIUM_GROUND_CONTACT_ASSET_VERSION,
      premiumGroundContactAssetLoaded: Boolean(premiumGroundContactAssetsRef.current.loaded),
      foregroundDepthElementCount: renderStats.foregroundDepthElementCount || 0,
      foregroundDepthParticleCount: renderStats.foregroundDepthParticleCount || 0,
      backgroundPropTintActive: Boolean(renderStats.backgroundPropTintActive),
      platformGroundingMode: renderStats.platformGroundingMode || 'contact-shadow-ledges',
      visibleElevatedPlatforms: renderStats.visibleElevatedPlatforms || [],
      propDrawOrderMode: renderStats.propDrawOrderMode || DECORATIVE_PROP_LAYER_MODE,
      decorativePropLayerMode: renderStats.decorativePropLayerMode || DECORATIVE_PROP_LAYER_MODE,
      propDepthTuningVersion: renderStats.propDepthTuningVersion || PROP_DEPTH_TUNING_VERSION,
      propGroundingIntegrationVersion: renderStats.propGroundingIntegrationVersion || PROP_GROUNDING_INTEGRATION_VERSION,
      routeGroundVisualMode: renderStats.routeGroundVisualMode || ROUTE_GROUND_VISUAL_MODE,
      routeGroundHazeFixVersion: renderStats.routeGroundHazeFixVersion || ROUTE_GROUND_HAZE_FIX_VERSION,
      journeyFlagVisualMode: renderStats.journeyFlagVisualMode || JOURNEY_FLAG_VISUAL_MODE,
      removedRouteFlagCount: renderStats.removedRouteFlagCount || 0,
      floatingAssetWarnings: renderStats.floatingAssetWarnings || [],
      desertBackgroundAssetsLoaded: Boolean(desertPack?.loaded),
      desertBackgroundAssetsReady: Boolean(desertPack?.ready),
      desertBackgroundFallbackActive,
      ruinedTempleBackgroundAssetsLoaded: Boolean(ruinedTemplePack?.loaded),
      ruinedTempleBackgroundAssetsReady: Boolean(ruinedTemplePack?.ready),
      ruinedTempleBackgroundFallbackActive,
      ruinedTempleBackgroundAtlasPath: RUINED_TEMPLE_BACKGROUND_ATLAS_JSON,
      catacombsBackgroundAssetsLoaded: Boolean(catacombsPack?.loaded),
      catacombsBackgroundAssetsReady: Boolean(catacombsPack?.ready),
      catacombsBackgroundFallbackActive,
      catacombsBackgroundAtlasPath: CATACOMBS_BACKGROUND_ATLAS_JSON,
      escapeBackgroundAssetsLoaded: Boolean(escapePack?.loaded),
      escapeBackgroundAssetsReady: Boolean(escapePack?.ready),
      escapeBackgroundFallbackActive,
      escapeBackgroundAtlasPath: ESCAPE_BACKGROUND_ATLAS_JSON,
      digSiteBackgroundAssetsLoaded: Boolean(digSitePack?.loaded),
      digSiteBackgroundAssetsReady: Boolean(digSitePack?.ready),
      digSiteBackgroundFallbackActive,
      digSiteBackgroundAtlasPath: DIG_SITE_BACKGROUND_ATLAS_JSON,
      baseCampBackgroundAssetsLoaded: Boolean(digSitePack?.loaded),
      baseCampBackgroundAssetsReady: Boolean(digSitePack?.ready),
      baseCampBackgroundFallbackActive: digSiteBackgroundFallbackActive,
      chinaRiverValleyBackgroundAssetsLoaded: Boolean(chinaRiverValleyPack?.loaded),
      chinaRiverValleyBackgroundAssetsReady: Boolean(chinaRiverValleyPack?.ready),
      chinaRiverValleyBackgroundFallbackActive: scopedJourneyAssetPacks.isChinaJourney && !chinaRiverValleyPack?.ready,
      chinaRiverValleyBackgroundAtlasPath: CHINA_RIVER_VALLEY_BACKGROUND_ATLAS_JSON,
      enemySpritesLoaded: enemySpriteAssets.loaded,
      enemySpriteFallbackActive,
      ...enemySpriteDebugAtlasState,
      enemySpriteAtlasVersion: ENEMY_SPRITE_ATLAS_VERSION,
      missingEnemySpriteAssets,
      chinaEnemyGuardianSpriteAtlasPath: CHINA_ENEMY_GUARDIAN_SPRITE_ATLAS_JSON,
      chinaEnemyGuardianSpritesLoaded: Boolean(chinaEnemyGuardianPack?.loaded),
      chinaEnemyGuardianSpriteFallbackActive: chinaEnemyGuardianFallbackActive,
      missingChinaEnemyGuardianSpriteAssets,
      visibleEnemySpriteFamilies: renderStats.visibleEnemySpriteFamilies || [],
      enemySpriteFrameStates: renderStats.enemySpriteFrameStates || [],
      enemyVisibilityAssistActive: Boolean(renderStats.enemyVisibilityAssistActive),
      bossSpritesLoaded: bossSpriteAssets.loaded,
      bossSpriteFallbackActive,
      bossSpriteAtlasPath: BOSS_SPRITE_ATLAS_JSON,
      bossSpriteAtlasVersion: BOSS_SPRITE_ATLAS_VERSION,
      missingBossSpriteAssets,
      activeBossSprite: renderStats.activeBossSprite || null,
      activeBossSpriteFrame: renderStats.activeBossSpriteFrame || null,
      activeBossAnimationState: renderStats.activeBossAnimationState || null,
      chinaClayGuardianSpriteLoaded: Boolean(chinaClayGuardianBossPack?.loaded),
      chinaClayGuardianSpriteFrame: renderStats.chinaClayGuardianSpriteFrame || null,
      chinaClayGuardianSpriteAtlasPath: CHINA_CLAY_GUARDIAN_SPRITE_ATLAS_JSON,
      stoneGuardianSpriteLoaded: Boolean(bossSpriteAssets.packs?.['temple-guardian']?.loaded),
      stoneGuardianSpriteFrame: renderStats.stoneGuardianSpriteFrame || null,
      stoneGuardianSpriteAtlasPath: STONE_GUARDIAN_SPRITE_ATLAS_JSON,
      ancientConstructSpriteLoaded: Boolean(bossSpriteAssets.packs?.['ancient-construct']?.loaded),
      ancientConstructSpriteFrame: renderStats.ancientConstructSpriteFrame || null,
      ancientConstructSpriteAtlasPath: ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON,
      collectibleSpritesLoaded: Boolean(collectibleSpriteAssets.loaded),
      collectibleSpritesReady: Boolean(collectibleSpriteAssets.ready),
      collectibleSpriteFallbackActive,
      collectibleSpriteAtlasPath: collectibleSpriteAssets.atlasPath || COLLECTIBLE_ATLAS_JSON,
      collectibleSpriteAtlasVersion: COLLECTIBLE_SPRITE_ATLAS_VERSION,
      missingCollectibleSpriteAssets,
      visibleToolSprites: renderStats.visibleToolSprites || [],
      visibleShardSprites: renderStats.visibleShardSprites || [],
      visibleUpgradeSprites: renderStats.visibleUpgradeSprites || [],
      visibleObjectiveSprites: renderStats.visibleObjectiveSprites || [],
      visibleCollectibleCount: renderStats.visibleCollectibleCount || 0,
      collectibleScaleTuningVersion: COLLECTIBLE_SCALE_TUNING_VERSION,
      relicShardScale: RELIC_SHARD_SCALE,
      fieldToolScale: FIELD_TOOL_SCALE,
      upgradeScale: UPGRADE_SCALE,
      objectiveMarkerScale: OBJECTIVE_MARKER_SCALE,
      loreTabletScale: LORE_TABLET_SCALE,
      pickupGlowScale: PICKUP_GLOW_SCALE,
      collectibleVisualMode: renderStats.collectibleVisualMode || (collectibleSpriteAssets.loaded ? 'sprite-atlas-with-fallback' : 'canvas-fallback'),
      playerWeaponSpriteLoaded: Boolean(playerWeaponAssets.loaded),
      playerWeaponSpriteReady: Boolean(playerWeaponAssets.ready),
      playerWeaponSpriteFallbackActive,
      playerWeaponAtlasPath: playerWeaponAssets.atlasPath || PLAYER_WEAPON_ATLAS_JSON,
      playerWeaponAtlasVersion: playerWeaponAssets.version || PLAYER_WEAPON_ATLAS_VERSION,
      missingPlayerWeaponSpriteAssets,
      markerSpritesLoaded: Boolean(markerSpriteAssets.loaded),
      markerSpritesReady: Boolean(markerSpriteAssets.ready),
      markerSpriteFallbackActive,
      markerSpriteAtlasPath: markerSpriteAssets.atlasPath || MARKER_SPRITE_ATLAS_JSON,
      markerSpriteAtlasVersion: MARKER_SPRITE_VERSION,
      missingMarkerSpriteAssets,
      playerWeaponFrame: renderStats.playerWeaponFrame || getPlayerWeaponFrameKey(getPlayerAttackState(current), playerWeaponAssets.weaponId),
      playerWeaponVisualMode: renderStats.playerWeaponVisualMode || (playerWeaponAssets.loaded ? `${playerWeaponAssets.weaponId || 'khopesh'}-sprite-atlas` : 'canvas-fallback'),
      parallaxLayersActive: Boolean(renderStats.parallaxLayersActive),
      activeBackgroundSection: renderStats.activeBackgroundSection || null,
      backgroundDepthMode: renderStats.backgroundDepthMode || 'canvas-fallback',
      desertJourneyBackgroundSystemVersion: renderStats.desertJourneyBackgroundSystemVersion || null,
      desertJourneyPanelIds: renderStats.desertJourneyPanelIds || [],
      desertJourneyLayerRoles: renderStats.desertJourneyLayerRoles || [],
      desertJourneyLayerDrawCount: renderStats.desertJourneyLayerDrawCount || 0,
      desertJourneyTransitionMasks: renderStats.desertJourneyTransitionMasks || [],
      visibleLabelCount: renderStats.visibleLabelCount || 0,
      labelSuppressionActive: Boolean(renderStats.labelSuppressionActive),
      platformVisualTuningActive: Boolean(renderStats.platformVisualTuningActive),
      journeyPolishPassActive: Boolean(renderStats.journeyPolishPassActive),
      journeyPolishVersion: renderStats.journeyPolishVersion || JOURNEY_POLISH_VERSION,
      worldContinuityPassActive: Boolean(renderStats.worldContinuityPassActive),
      worldContinuityVersion: renderStats.worldContinuityVersion || WORLD_CONTINUITY_VERSION,
      visibleWorldLandmarks: renderStats.visibleWorldLandmarks || [],
      visibleTransitionStoryMarkers: renderStats.visibleTransitionStoryMarkers || [],
      connectedWorldAmbientDetails: renderStats.connectedWorldAmbientDetails || 0,
      dynamicWorldPassActive: Boolean(renderStats.dynamicWorldPassActive),
      dynamicWorldVersion: renderStats.dynamicWorldVersion || DYNAMIC_WORLD_VERSION,
      dynamicWorldAssetVersion: dynamicWorldAssets.version || DYNAMIC_WORLD_EFFECTS_VERSION,
      dynamicWorldAssetsLoaded: Boolean(dynamicWorldAssets.loaded),
      dynamicWorldAssetMode: dynamicWorldAssets.loaded ? 'painted-raster-effects' : 'canvas-fallback',
      dynamicWorldAssetSrc: dynamicWorldAssets.src,
      visibleDynamicWorldEvents: renderStats.visibleDynamicWorldEvents || [],
      activeDynamicWorldEvent: current.dynamicEnvironmentEvent ? {
        id: current.dynamicEnvironmentEvent.id,
        type: current.dynamicEnvironmentEvent.type,
        name: current.dynamicEnvironmentEvent.name,
        timer: Number((current.dynamicEnvironmentEventTimer || 0).toFixed(2)),
      } : null,
      scarabSealState: {
        id: SCARAB_SEAL_TRIGGER.id,
        name: SCARAB_SEAL_TRIGGER.name,
        activated: Boolean(current.scarabSealActivated),
        bossId: SCARAB_SEAL_TRIGGER.bossId,
        x: Math.round(SCARAB_SEAL_TRIGGER.x),
        y: Math.round(SCARAB_SEAL_TRIGGER.y),
        confrontationSeen: Boolean(current.openingConfrontationSeen),
        bossIntroLine: SCARAB_SEAL_TRIGGER.bossIntroLine,
        guideFollowUpLine: SCARAB_SEAL_TRIGGER.guideFollowUpLine,
        messages: SCARAB_SEAL_TRIGGER.messages,
      },
      openingSphinxEncounterState: current.openingSphinxEncounter ? {
        active: true,
        name: current.openingSphinxEncounter.name,
        message: current.openingSphinxEncounter.message,
        playerX: Math.round(current.openingSphinxEncounter.playerX),
        x: Math.round(current.openingSphinxEncounter.x),
        y: Math.round(current.openingSphinxEncounter.y),
        timer: Number(current.openingSphinxEncounter.timer.toFixed(2)),
        spriteModel: renderStats.openingSphinxSpriteModel || OPENING_SPHINX_SPRITE_BOSS_ID,
        spriteFrame: renderStats.openingSphinxSpriteFrame || null,
        spriteAtlasPath: renderStats.openingSphinxSpriteAtlasPath || ANCIENT_CONSTRUCT_SPRITE_ATLAS_JSON,
        spriteLoaded: renderStats.openingSphinxSpriteLoaded
          ?? Boolean(bossSpriteAssets.packs?.[OPENING_SPHINX_SPRITE_BOSS_ID]?.loaded),
      } : null,
      openingThresholdSceneState: current.openingThresholdScene ? {
        id: current.openingThresholdScene.id,
        phase: current.openingThresholdScene.phase,
        lockMovement: Boolean(current.openingThresholdScene.lockMovement),
        activeLine: getOpeningThresholdDialogueLine(current.openingThresholdScene),
        timer: Number(current.openingThresholdScene.timer.toFixed(2)),
        duration: current.openingThresholdScene.duration,
        stairwellRevealActive: current.openingThresholdScene.timer <= OPENING_THRESHOLD_STAIR_REVEAL_SECONDS,
        fallProgress: Number(clamp(
          ((current.openingThresholdScene.duration || 0) - (current.openingThresholdScene.timer || 0) - (current.openingThresholdScene.playerFallDelay ?? OPENING_THRESHOLD_FALL_DELAY_SECONDS))
          / (current.openingThresholdScene.playerFallDuration ?? OPENING_THRESHOLD_FALL_DURATION_SECONDS),
          0,
          1,
        ).toFixed(2)),
        fallSfxPlayed: Boolean(current.openingThresholdScene.fallSfxPlayed),
        stoneShiftSfxPlayed: Boolean(current.openingThresholdScene.stoneShiftSfxPlayed),
        finalPulseSfxPlayed: Boolean(current.openingThresholdScene.finalPulseSfxPlayed),
        fading: current.openingThresholdScene.timer <= OPENING_THRESHOLD_FADE_SECONDS,
        transitionTargetSectionId: current.openingThresholdScene.transitionTargetSectionId,
      } : null,
      arrivalThresholdState: current.arrivalThresholdActive ? {
        active: true,
        started: Boolean(current.arrivalThresholdStarted),
        leftInspected: Boolean(current.arrivalThresholdLeftInspected),
        markingsInspected: Boolean(current.arrivalThresholdMarkingsInspected),
        gateTriggered: Boolean(current.arrivalThresholdGateTriggered),
        exitTransitionActive: Boolean(current.arrivalThresholdExitTransition),
        exitTransitionProgress: current.arrivalThresholdExitTransition
          ? Number(clamp(
            (current.arrivalThresholdExitTransition.timer || 0) / (current.arrivalThresholdExitTransition.duration || ARRIVAL_THRESHOLD_EXIT_WALK_SECONDS),
            0,
            1,
          ).toFixed(3))
          : 0,
        playerX: Math.round(current.player.x),
        objective: current.notice,
        backgroundLoaded: Boolean(arrivalThresholdBackgroundRef.current.loaded),
        doorwayGlowLoaded: Boolean(arrivalThresholdDoorwayGlowRef.current.loaded),
        doorwayOccluderLoaded: Boolean(arrivalThresholdDoorwayOccluderRef.current.loaded),
        duatEchoLoaded: Boolean(arrivalThresholdDuatEchoRef.current.loaded),
        backgroundSrc: ARRIVAL_THRESHOLD_BACKGROUND_SRC,
      } : null,
      arrivalThresholdTrialState: current.arrivalThresholdTrial ? {
        active: Boolean(current.arrivalThresholdTrial.active),
        completed: Boolean(current.arrivalThresholdTrial.completed),
        activeStepId: current.arrivalThresholdTrial.activeStepId || null,
        completedStepIds: current.arrivalThresholdTrial.completedStepIds || [],
        echoX: current.arrivalThresholdTrial.echo ? Math.round(current.arrivalThresholdTrial.echo.x || 0) : null,
      } : null,
      templeThresholdTransitionState: current.templeThresholdTransition ? {
        id: current.templeThresholdTransition.id,
        phase: current.templeThresholdTransition.phase,
        switched: Boolean(current.templeThresholdTransition.switched),
        anubisStarted: Boolean(current.templeThresholdTransition.anubisStarted),
        lockMovement: Boolean(current.templeThresholdTransition.lockMovement),
        timer: Number(current.templeThresholdTransition.timer.toFixed(2)),
        duration: current.templeThresholdTransition.duration,
        from: current.templeThresholdTransition.from,
        to: current.templeThresholdTransition.to,
      } : null,
      reactiveEnvironmentPassActive: Boolean(renderStats.reactiveEnvironmentPassActive),
      reactiveEnvironmentVersion: renderStats.reactiveEnvironmentVersion || REACTIVE_ENVIRONMENT_VERSION,
      visibleEnvironmentInteractions: renderStats.visibleEnvironmentInteractions || [],
      brokenEnvironmentInteractions: Array.from(current.brokenEnvironmentIds || []),
      triggeredEnvironmentInteractions: Array.from(current.triggeredEnvironmentIds || []),
      collapsedPlatformIds: Array.from(current.collapsedPlatformIds || []),
      visibleMechanismPlatforms: PLATFORMS
        .filter(platform => platform.requiresObjective && isPlatformAvailable(platform, current))
        .map(platform => platform.id || platform.label),
      activeReactivePlatformTimers: Object.entries(current.reactivePlatformTimers || {}).map(([id, timer]) => ({
        id,
        timer: Number(timer.toFixed(2)),
      })),
      recentEnvironmentInteractions: current.recentEnvironmentInteractions || [],
      ambientLifePassActive: Boolean(renderStats.ambientLifePassActive),
      ambientLifeVersion: renderStats.ambientLifeVersion || null,
      ambientLifeMode: renderStats.ambientLifeMode || null,
      ambientLifeDetailCount: renderStats.ambientLifeDetailCount || 0,
      hazardReadabilityMode: renderStats.hazardReadabilityMode || 'soft-warning-cues',
      openingTrapDecalAssetLoaded: Boolean(openingTrapDecalPackRef.current.loaded),
      openingHazardDecalAssetLoaded: Boolean(openingHazardDecalPackRef.current.loaded),
      openingTrapDecalAssetVersion: OPENING_TRAP_DECAL_ASSET_VERSION,
      enemyVisualMode: renderStats.enemyVisualMode || 'sprite-atlas-with-grounding',
      bossVisualMode: renderStats.bossVisualMode || 'multi-boss-atlas-fallback-safe',
      assetFallbackActive: environmentFallbackActive || enemySpriteFallbackActive || bossSpriteFallbackActive || collectibleSpriteFallbackActive || playerWeaponSpriteFallbackActive || scopedBackgroundFallbackActive,
      desertVisualTuningVersion: DESERT_VISUAL_TUNING_VERSION,
      atlasTuningVersion: ATLAS_TUNING_VERSION,
      activeAtlasRegionIssues: missingEnvironmentAssets,
      playerAttackBox,
      combatChallengeMode: COMBAT_CHALLENGE_MODE,
      combatIntensityPassActive: Boolean(renderStats.combatIntensityPassActive),
      combatIntensityVersion: renderStats.combatIntensityVersion || COMBAT_INTENSITY_VERSION,
      combatReadabilityMode: renderStats.combatReadabilityMode || 'windup-vulnerable-pressure-v1',
      visibleCombatPressureEnemies: renderStats.visibleCombatPressureEnemies || [],
      dangerFeedbackActive: Boolean(renderStats.dangerFeedbackActive) || current.resources.stamina <= Math.round((current.upgradeEffects?.maxStamina || 100) * 0.3),
      playerAttackStaminaCost: current.playerAttackStaminaCost || 0,
      lastAttackResult: current.lastAttackResult || 'ready',
      shieldedHitFeedback: current.shieldedHitFeedback || '',
      activeEnemyCounterWindow: activeEnemyCounterWindow ? {
        id: activeEnemyCounterWindow.id,
        name: activeEnemyCounterWindow.name,
        pattern: activeEnemyCounterWindow.attackPattern,
        time: Number(Math.max(activeEnemyCounterWindow.vulnerabilityTimer || 0, activeEnemyCounterWindow.attackRecovery || 0).toFixed(2)),
      } : null,
      activeBossCounterWindow: activeBossCounterWindow ? {
        id: activeBossCounterWindow.id,
        name: activeBossCounterWindow.name,
        pattern: activeBossCounterWindow.attackPattern,
        time: Number(Math.max(activeBossCounterWindow.vulnerabilityTimer || 0, activeBossCounterWindow.attackRecovery || 0).toFixed(2)),
      } : null,
      currentEnemyPattern: nearbyCombatEnemy ? {
        id: nearbyCombatEnemy.id,
        name: nearbyCombatEnemy.name,
        type: nearbyCombatEnemy.type,
        pattern: nearbyCombatEnemy.attackPattern,
        label: nearbyCombatEnemy.attackPhaseLabel || getEnemyPatternConfig(nearbyCombatEnemy).label,
        state: getCombatMode(nearbyCombatEnemy),
        selectedAbility: nearbyCombatEnemy.selectedAbility || nearbyCombatEnemy.attackPattern || null,
        selectedAbilityReason: nearbyCombatEnemy.selectedAbilityReason || null,
        targetReason: nearbyCombatEnemy.targetReason || null,
        combatIntent: nearbyCombatEnemy.combatIntent || getEnemyCombatIntent(nearbyCombatEnemy).id,
        combatIntentLabel: nearbyCombatEnemy.combatIntentLabel || getEnemyCombatIntent(nearbyCombatEnemy).label,
        combatRole: nearbyCombatEnemy.combatRole || nearbyCombatEnemy.encounterRole || null,
        pressureHint: nearbyCombatEnemy.pressureHint || null,
      } : null,
      playerInvulnerable: Number(current.player.invulnerable.toFixed(2)),
      invulnerabilityRemainingMs: Math.round(current.player.invulnerable * 1000),
      damageCooldownRemainingMs: Math.round(current.player.damageCooldownTimer * 1000),
      playerFlashActive: current.player.invulnerable > 0,
      playerHitScreenShakeActive: (current.player.impactShakeTimer || 0) > 0,
      lastDamageSource: current.player.lastDamageSource,
      lastDamageTime: current.player.lastDamageTime,
      playerAttackState: getPlayerAttackState(current),
      journeySection: getSectionDisplayName(section.id),
      worldProgressPercent: Math.round((current.player.x / WORLD_WIDTH) * 100),
      resources: current.resources,
      playerStamina: current.resources.stamina,
      maxStamina: current.upgradeEffects?.maxStamina || 100,
      permanentUpgrades: Array.from(current.permanentUpgrades || []),
      permanentUpgradeEffects: current.upgradeEffects || {},
      cameraX: Math.round(current.cameraX),
      targetCameraX: Math.round(current.targetCameraX),
      secretVerticalCameraOffset: Number((current.secretVerticalCameraOffset || 0).toFixed(2)),
      mummificationChamberExteriorVersion: MUMMIFICATION_CHAMBER_EXTERIOR_VERSION,
      mummificationChamberExteriorLoaded: Boolean(mummificationChamberExteriorRef.current.loaded),
      mummificationChamberInteriorVersion: MUMMIFICATION_CHAMBER_INTERIOR_VERSION,
      mummificationChamberInteriorLoaded: Boolean(mummificationChamberInteriorRef.current.loaded),
      mummificationChamberInteriorAssetDescription: MUMMIFICATION_CHAMBER_INTERIOR_ASSET_DESCRIPTION,
      mummificationChamberInteractionAssetVersion: MUMMIFICATION_CHAMBER_INTERACTIONS_ASSET_VERSION,
      mummificationChamberInteractionAssetsLoaded: Boolean(mummificationInteractionAssetsRef.current.loaded),
      mummificationChamberRitualGuidanceVersion: MUMMIFICATION_CHAMBER_RITUAL_GUIDANCE_VERSION,
      mummificationChamberCurrentRite: renderStats.mummificationChamberCurrentRite || null,
      mummificationChamberNextObjectId: renderStats.mummificationChamberNextObjectId || null,
      mummificationChamberAtmosphereVersion: renderStats.mummificationChamberAtmosphereVersion || MUMMIFICATION_CHAMBER_ATMOSPHERE_VERSION,
      mummificationChamberAtmosphereState: renderStats.mummificationChamberAtmosphereState || null,
      mummificationChamberWakeProgress: renderStats.mummificationChamberWakeProgress || 0,
      mummificationChamberParticleCount: renderStats.mummificationChamberParticleCount || 0,
      forgottenMuralCameraFrameActive: Boolean(renderStats.forgottenMuralCameraFrameActive),
      playerWorldX: Math.round(current.player.x),
      playerScreenX: Math.round(current.player.x - current.cameraX),
      openingCameraRevealState: current.openingCameraRevealTimer > 0 ? {
        active: true,
        mode: current.cameraMode,
        focusTarget: current.cameraFocusTarget,
        secondsRemaining: Number(current.openingCameraRevealTimer.toFixed(2)),
      } : null,
      playerGroundedState: {
        onGround: current.player.onGround,
        expectedGroundY: JOURNEY_WORLD_LAYOUT.groundY,
        playerFootY: Math.round(current.player.y + current.player.height),
      },
      activePlatformChallenge: current.activePlatformChallenge ? {
        id: current.activePlatformChallenge.id,
        failY: Math.round(current.activePlatformChallenge.failY),
      } : null,
      currentSection: getSectionDisplayName(section.id),
      cameraMode: current.cameraMode,
      cameraFocusTarget: current.cameraFocusTarget,
      cameraBounds: {
        min: 0,
        max: WORLD_WIDTH - CANVAS_WIDTH,
      },
      cameraShakeActive: current.cameraShakeTimer > 0,
      activeHazardsNearPlayer: getActiveHazardsNearPlayer(current),
      lastHazardHit: current.lastHazardHit,
      lastStaminaDelta: current.lastStaminaDelta,
      lastStaminaLossReason: current.lastStaminaLossReason,
      staminaFeedbackActive: current.staminaFeedbackTimer > 0,
      staminaWarningState: getStaminaWarningState(current),
      hazardFeedbackCooldown: Number(current.hazardCooldown.toFixed(2)),
      fieldKit: current.fieldKit.map(tool => tool.name),
      remainingTools: JOURNEY_TOOLS.filter(tool => !current.collectedToolIds.has(tool.id)).map(tool => tool.name),
      relicShardCount: current.relicShardCount,
      totalRelicShards: RELIC_SHARDS.length,
      bossKeyItems: (current.bossKeyItems || []).map(item => ({
        id: item.id,
        name: item.name,
        bossId: item.bossId,
        gateId: item.gateId,
        dropped: Boolean(item.dropped),
        collected: current.collectedBossKeyIds?.has(item.id) || Boolean(item.collected),
        x: Math.round(item.x || 0),
      })),
      collectedBossKeyItems: Array.from(current.collectedBossKeyIds || []),
      bossToolPieces: (current.bossKeyItems || []).map(item => ({
        id: item.id,
        name: item.name,
        bossId: item.bossId,
        gateId: item.gateId,
        dropped: Boolean(item.dropped),
        collected: current.collectedBossKeyIds?.has(item.id) || Boolean(item.collected),
        x: Math.round(item.x || 0),
      })),
      collectedBossToolPieces: Array.from(current.collectedBossKeyIds || []),
      bossDomainState: current.bossDomain,
      bossIntroPaused: current.bossIntroPauseTimer > 0,
      postBossReward: current.postBossReward,
      postBossRewardVisible: Boolean(current.postBossReward),
      postBossRewardTimer: Number((current.postBossRewardTimer || 0).toFixed(2)),
      guardianKnowledgeChallenge: current.activeGuardianChallenge ? {
        type: current.activeGuardianChallenge.type || 'guardian-knowledge',
        bossId: current.activeGuardianChallenge.bossId,
        bossName: current.activeGuardianChallenge.bossName,
        title: current.activeGuardianChallenge.title,
        currentIndex: current.activeGuardianChallenge.currentIndex,
        totalQuestions: current.activeGuardianChallenge.questions.length,
        correctCount: current.activeGuardianChallenge.correctCount,
        selectedAnswerIndex: current.activeGuardianChallenge.selectedAnswerIndex,
        feedback: current.activeGuardianChallenge.feedback,
        completed: Boolean(current.activeGuardianChallenge.completed),
        resultMessage: current.activeGuardianChallenge.resultMessage || null,
        modifier: current.activeGuardianChallenge.modifier || null,
        question: current.activeGuardianChallenge.questions[current.activeGuardianChallenge.currentIndex]?.question || null,
        optionOrder: current.activeGuardianChallenge.questions[current.activeGuardianChallenge.currentIndex]?.shuffledOptions?.map(option => option.originalIndex) || null,
      } : null,
      completedGuardianKnowledgeChallenges: Array.from(current.completedGuardianChallengeIds || []),
      guardianKnowledgeResults: current.guardianChallengeResults || {},
      guardianBattleModifiers: current.guardianBattleModifiers || {},
      collectedUpgrades: Array.from(current.collectedUpgrades),
      romeTimelineEvidenceOrder: Array.isArray(current.romeTimelineEvidenceOrder) ? current.romeTimelineEvidenceOrder : [],
      romeTimelineSolved: Boolean(current.romeTimelineSolved),
      activeCheckpoint: current.activeCheckpoint?.name,
      checkpointState: current.activeCheckpoint ? { id: current.activeCheckpoint.id, name: current.activeCheckpoint.name } : null,
      currentObjective: objective?.title || null,
      objectiveProgress: objective ? {
        id: section.id,
        title: objective.title,
        found: objective.count,
        required: objective.total,
        complete: objective.count >= objective.total,
        label: `${objective.count}/${objective.total} ${objective.itemLabel}`,
      } : null,
      miniBossState: current.miniBosses.map(boss => ({
        id: boss.id,
        name: boss.name,
        sectionId: boss.sectionId,
        health: boss.health,
        maxHealth: boss.maxHealth,
        awakened: boss.awakened,
        x: Math.round(boss.x),
        knowledgeModifierId: boss.knowledgeModifierId || null,
        playerDamageMultiplier: boss.playerDamageMultiplier || 1,
        bossDamageMultiplier: boss.bossDamageMultiplier || 1,
        visualScale: boss.visualScale || 1,
        ...getEntityCombatState(boss),
      })),
      activeMiniBoss: activeMiniBoss?.name || null,
      activeMiniBossState: activeMiniBoss ? {
        id: activeMiniBoss.id,
        name: activeMiniBoss.name,
        health: activeMiniBoss.health,
        maxHealth: activeMiniBoss.maxHealth,
        x: Math.round(activeMiniBoss.x),
        knowledgeModifierId: activeMiniBoss.knowledgeModifierId || null,
        playerDamageMultiplier: activeMiniBoss.playerDamageMultiplier || 1,
        bossDamageMultiplier: activeMiniBoss.bossDamageMultiplier || 1,
        visualScale: activeMiniBoss.visualScale || 1,
        ...getEntityCombatState(activeMiniBoss),
        ...getBossVulnerabilityState(activeMiniBoss),
      } : null,
      defeatedEnemies: Array.from(current.defeatedEnemies),
      enemiesDisabled,
      enemyPlaytestAssistActive: enemiesDisabled,
      activeEnemyCount: enemiesDisabled
        ? 0
        : current.enemies.filter(enemy => !enemy.defeated && isEntityActiveInScene(enemy, current)).length,
      seenEnemyTypeNoticeIds: Array.from(current.seenEnemyTypeNoticeIds || []),
      defeatedMiniBosses: Array.from(current.defeatedMiniBosses),
      hiddenRoomsFound: Array.from(current.hiddenRoomsFound),
      discoveredHiddenRoutes: Array.from(current.discoveredHiddenRouteIds || []),
      hiddenRoutesAvailable: activeHiddenRoutes.map(route => ({
        id: route.id,
        name: route.name,
        sectionId: route.sectionId,
        optional: route.optional,
        discovered: current.discoveredHiddenRouteIds?.has(route.id) || false,
        gateType: route.gateType || null,
        requiredUpgradeId: route.requiredUpgradeId || null,
        lockedMessage: route.lockedMessage || null,
        storySummary: route.storySummary || null,
        rewardSummary: route.rewardSummary || null,
        teaseVisible: route.teaseVisible !== false,
        unlocked: getRouteAccessState(route, current).unlocked,
        futureUpgradeHook: route.futureUpgradeHook || null,
      })),
      secretCollectibles: activeSecretCollectibles.map(item => ({
        id: item.id,
        name: item.name,
        setId: item.setId,
        routeId: item.routeId,
        sceneId: getEntitySceneId(item),
        activeInScene: isEntityActiveInScene(item, current),
        routeUnlocked: item.routeId ? isRouteRewardAccessible(item.routeId, current) : true,
        restorationSetId: item.restorationSetId || null,
        restoresStoryFlag: item.restoresStoryFlag || null,
        restoreMessage: item.restoreMessage || null,
        anubisReaction: item.anubisReaction || null,
        collected: current.collectedSecretIds?.has(item.id) || false,
      })),
      collectedSecretCollectibles: Array.from(current.collectedSecretIds || []),
      secretCollectibleCount: current.collectedSecretIds?.size || 0,
      sacredRoomRestorationEvidence: getSacredRoomRestorationEvidence(current),
      templeThresholdHallEntranceDiscovered: Boolean(current.templeThresholdHallEntranceDiscovered),
      templeThresholdHallEntered: Boolean(current.templeThresholdHallEntered),
      templeThresholdHallCleared: Boolean(current.templeThresholdHallCleared),
      mummificationChamberEntranceDiscovered: Boolean(current.mummificationChamberEntranceDiscovered),
      forgottenMuralLooterSeen: Boolean(current.forgottenMuralLooterSeen),
      forgottenMuralChamberEntered: Boolean(current.forgottenMuralChamberEntered),
      forgottenMuralChamberActive: Boolean(current.forgottenMuralChamberActive),
      currentSceneId: getJourneySceneId(current),
      previousSceneId: current.previousSceneId || null,
      sceneReturn: current.sceneReturn ? {
        sceneId: current.sceneReturn.sceneId || null,
        x: Math.round(current.sceneReturn.x || 0),
        y: Math.round(current.sceneReturn.y || 0),
      } : null,
      sceneTransitionState: (current.sceneTransition || current.forgottenMuralChamberTransition) ? {
        id: (current.sceneTransition || current.forgottenMuralChamberTransition).id,
        phase: (current.sceneTransition || current.forgottenMuralChamberTransition).phase,
        fromSceneId: (current.sceneTransition || current.forgottenMuralChamberTransition).fromSceneId || null,
        toSceneId: (current.sceneTransition || current.forgottenMuralChamberTransition).toSceneId || null,
        switched: Boolean((current.sceneTransition || current.forgottenMuralChamberTransition).switched),
        lockMovement: Boolean((current.sceneTransition || current.forgottenMuralChamberTransition).lockMovement),
        timer: Number((current.sceneTransition || current.forgottenMuralChamberTransition).timer.toFixed(2)),
        duration: (current.sceneTransition || current.forgottenMuralChamberTransition).duration,
      } : null,
      forgottenMuralChamberTransitionState: current.forgottenMuralChamberTransition ? {
        id: current.forgottenMuralChamberTransition.id,
        phase: current.forgottenMuralChamberTransition.phase,
        switched: Boolean(current.forgottenMuralChamberTransition.switched),
        lockMovement: Boolean(current.forgottenMuralChamberTransition.lockMovement),
        timer: Number(current.forgottenMuralChamberTransition.timer.toFixed(2)),
        duration: current.forgottenMuralChamberTransition.duration,
      } : null,
      forgottenMuralChamberRestored: Boolean(current.forgottenMuralChamberRestored),
      forgottenMuralFragmentsRecovered: FORGOTTEN_MURAL_CHAMBER_RESTORATION_IDS.filter(id => current.collectedSecretIds?.has(id)).length,
      forgottenMuralRestored: Boolean(current.forgottenMuralChamberRestored),
      forgottenMuralRelicSlidePuzzleVersion: FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_VERSION,
      forgottenMuralRelicSlidePuzzleOpen: Boolean(current.forgottenMuralRelicSlidePuzzleOpen),
      forgottenMuralRelicSlidePuzzleSolved: Boolean(current.forgottenMuralRelicSlidePuzzleSolved),
      forgottenMuralRelicSlidePuzzleTiles: [...(current.forgottenMuralRelicSlidePuzzleTiles || [])],
      forgottenMuralRelicSlidePuzzleMoves: current.forgottenMuralRelicSlidePuzzleMoves || 0,
      mummificationChamberEntered: Boolean(current.mummificationChamberEntered),
      mummificationChamberActive: Boolean(current.mummificationChamberActive),
      mummificationChamberDoorSealed: Boolean(current.mummificationChamberDoorSealed),
      mummificationChamberExitUnlocked: Boolean(current.mummificationChamberExitUnlocked),
      mummificationChamberPuzzleSolved: Boolean(current.mummificationChamberPuzzleSolved),
      mummificationChamberRestored: Boolean(current.mummificationChamberRestored),
      mummificationChamberRitualStep: current.mummificationChamberRitualStep || 0,
      mummificationChamberInspectedObjects: Array.from(current.mummificationChamberInspectedObjectIds || []),
      scribeChamberEntered: Boolean(current.scribeChamberEntered),
      scribeChamberActive: Boolean(current.scribeChamberActive),
      scribeChamberDoorSealed: Boolean(current.scribeChamberDoorSealed),
      scribeChamberTabletInspected: Boolean(current.scribeChamberTabletInspected),
      scribeChamberWallInspected: Boolean(current.scribeChamberWallInspected),
      scribeChamberExitUnlocked: Boolean(current.scribeChamberExitUnlocked),
      scribeChamberPuzzleSolved: Boolean(current.scribeChamberPuzzleSolved),
      scribeChamberRecordRestored: Boolean(current.scribeChamberRecordRestored),
      completedCollectionSets: Array.from(current.completedCollectionSetIds || []),
      loreTablets: LORE_TABLETS.map(tablet => ({
        id: tablet.id,
        collected: current.collectedTabletIds.has(tablet.id),
      })),
      loreTabletCount: current.collectedTabletIds.size,
      playerCombatState: {
        attacking: current.attackTimer > 0,
        attackCooldown: Number(current.attackCooldown.toFixed(2)),
        attackTimer: Number(current.attackTimer.toFixed(2)),
        attackWindup: Number(current.attackWindupTimer.toFixed(2)),
        attackRecoil: Number(current.attackRecoilTimer.toFixed(2)),
        attackState: getPlayerAttackState(current),
        attackType: current.attackType || PLAYER_ATTACK_TYPES.LIGHT,
        heavyFollowupReady: (current.heavyFollowupReadyTimer || 0) > 0,
        heavyFollowupPromptActive: (current.heavyFollowupReadyTimer || 0) > 0,
        heavyFollowupReadyMs: Math.round((current.heavyFollowupReadyTimer || 0) * 1000),
        heavyFollowupCueMs: Math.round((current.heavyFollowupCueTimer || 0) * 1000),
        hitStop: Number(current.hitStopTimer.toFixed(2)),
        facing: current.player.direction >= 0 ? 'right' : 'left',
        animationState: current.player.animationState || 'idle',
        animationFrame: current.player.animationFrame ?? 1,
        visualWalkStyle: current.player.visualWalkStyle || 'none',
        invulnerable: Number(current.player.invulnerable.toFixed(2)),
        invulnerabilityRemainingMs: Math.round(current.player.invulnerable * 1000),
        damageCooldownRemainingMs: Math.round(current.player.damageCooldownTimer * 1000),
        venomSlowRemainingMs: Math.round((current.player.venomSlowTimer || 0) * 1000),
        venomSlowMultiplier: current.player.venomSlowTimer > 0 ? current.player.venomSlowMultiplier : 1,
        flashActive: current.player.invulnerable > 0,
        lastDamage: current.player.lastDamage || 0,
        lastDamageSource: current.player.lastDamageSource,
        lastDamageTime: current.player.lastDamageTime,
        lastAttackResult: current.lastAttackResult || 'ready',
        attackStaminaCost: current.playerAttackStaminaCost || 0,
      },
      combatHitEffects: current.combatHitEffects.map(effect => ({
        type: effect.type,
        x: Math.round(effect.x),
        y: Math.round(effect.y),
        timer: Number(effect.timer.toFixed(2)),
        text: effect.text || null,
      })),
      rewardFeedbackEffects: current.combatHitEffects
        .filter(effect => ['reward-pulse', 'shard-pickup', 'secret-found', 'checkpoint-pulse', 'collection-complete', 'boss-reward-pulse', 'upgrade-pulse'].includes(effect.type))
        .map(effect => ({
          type: effect.type,
          text: effect.text || null,
          timer: Number(effect.timer.toFixed(2)),
        })),
      knockbackState: {
        playerKnockback: current.player.knockbackTimer > 0,
        playerDirection: current.player.knockbackDirection,
        playerTimer: Number((current.player.knockbackTimer || 0).toFixed(2)),
        enemies: current.enemies
          .filter(enemy => enemy.knockbackTimer > 0)
          .map(enemy => ({ id: enemy.id, direction: enemy.knockbackDirection, timer: Number(enemy.knockbackTimer.toFixed(2)) })),
        bosses: current.miniBosses
          .filter(boss => boss.knockbackTimer > 0)
          .map(boss => ({ id: boss.id, direction: boss.knockbackDirection, timer: Number(boss.knockbackTimer.toFixed(2)) })),
      },
      movementFeelState: {
        coyoteTimeSeconds: COYOTE_TIME,
        jumpBufferSeconds: JUMP_BUFFER_TIME,
        jumpCutMultiplier: JUMP_CUT_MULTIPLIER,
        openingPyramidAssistJumpAvailable: Boolean(current.openingPyramidAssistJumpAvailable),
        openingPyramidAirJumpMultiplier: OPENING_PYRAMID_AIR_JUMP_MULTIPLIER,
        jumpCutFeedback: Number((current.player.jumpCutFeedbackTimer || 0).toFixed(2)),
        landingFeedback: Number((current.player.landingFeedbackTimer || 0).toFixed(2)),
        movementDustTimer: Number((current.player.movementDustTimer || 0).toFixed(2)),
        activeJuiceEffects: current.combatHitEffects
          .filter(effect => ['movement-dust', 'landing-dust', 'jump-dust', 'attack-burst', 'knockback-dust'].includes(effect.type))
          .map(effect => effect.type),
      },
      enemyStates: enemiesDisabled ? [] : current.enemies
        .filter(enemy => Math.abs(enemy.x - current.player.x) < 700 || current.defeatedEnemies.has(enemy.id))
        .map(enemy => ({
          id: enemy.id,
          name: enemy.name,
          type: enemy.type,
          health: enemy.health,
          maxHealth: enemy.maxHealth,
          x: Math.round(enemy.x),
          encounterRole: enemy.encounterRole || null,
          combatRole: enemy.combatRole || enemy.encounterRole || null,
          selectedAbility: enemy.selectedAbility || enemy.attackPattern || null,
          selectedAbilityReason: enemy.selectedAbilityReason || null,
          targetReason: enemy.targetReason || null,
          combatIntent: enemy.combatIntent || getEnemyCombatIntent(enemy).id,
          combatIntentLabel: enemy.combatIntentLabel || getEnemyCombatIntent(enemy).label,
          protectsRouteId: enemy.protectsRouteId || null,
          pressureHint: enemy.pressureHint || null,
          ...getEntityCombatState(enemy),
        })),
      enemyCombatStates: enemiesDisabled ? [] : current.enemies
        .filter(enemy => Math.abs(enemy.x - current.player.x) < 700 || current.defeatedEnemies.has(enemy.id))
        .map(enemy => ({
          id: enemy.id,
          name: enemy.name,
          type: enemy.type,
          pattern: enemy.attackPattern,
          label: enemy.attackPhaseLabel || getEnemyPatternConfig(enemy).label,
          state: getCombatMode(enemy),
          encounterRole: enemy.encounterRole || null,
          combatRole: enemy.combatRole || enemy.encounterRole || null,
          selectedAbility: enemy.selectedAbility || enemy.attackPattern || null,
          selectedAbilityReason: enemy.selectedAbilityReason || null,
          targetReason: enemy.targetReason || null,
          combatIntent: enemy.combatIntent || getEnemyCombatIntent(enemy).id,
          combatIntentLabel: enemy.combatIntentLabel || getEnemyCombatIntent(enemy).label,
          protectsRouteId: enemy.protectsRouteId || null,
          pressureHint: enemy.pressureHint || null,
          windup: Number((enemy.attackWindup || 0).toFixed(2)),
          attack: Number((enemy.attackTimer || 0).toFixed(2)),
          recovery: Number((enemy.attackRecovery || 0).toFixed(2)),
          counterWindow: Number((enemy.vulnerabilityTimer || 0).toFixed(2)),
          shielded: Boolean(enemy.shieldTimer > 0),
          attackTellActive: enemy.attackWindup > 0,
          recoveryWindowActive: enemy.attackRecovery > 0,
          counterWindowActive: enemy.vulnerabilityTimer > 0 || enemy.attackRecovery > 0,
        })),
      miniBossStates: current.miniBosses.map(boss => ({
        id: boss.id,
        name: boss.name,
        sectionId: boss.sectionId,
        health: boss.health,
        maxHealth: boss.maxHealth,
        awakened: boss.awakened,
        x: Math.round(boss.x),
        knowledgeModifierId: boss.knowledgeModifierId || null,
        playerDamageMultiplier: boss.playerDamageMultiplier || 1,
        bossDamageMultiplier: boss.bossDamageMultiplier || 1,
        visualScale: boss.visualScale || 1,
        ...getEntityCombatState(boss),
      })),
      routeGateStatus: nextRouteGate ? (() => {
        const gate = nextRouteGate;
        const guidance = getGateGuidance(gate, current);
        const requirements = guidance.gateRequirements;
        return {
          id: gate.id,
          name: guidance.activeGateName,
          distance: Math.round(gate.x - current.player.x),
          gateGroundedState: {
            expectedGroundY: JOURNEY_WORLD_LAYOUT.groundY,
            visualFootY: JOURNEY_WORLD_LAYOUT.groundY,
            authoredY: Math.round(gate.y),
          },
          requirements,
          complete: requirements.every(req => req.met),
          summary: `${requirements.filter(req => req.met).length}/${requirements.length} ready`,
          activeGateName: guidance.activeGateName,
          activeGateLocked: guidance.activeGateLocked,
          gateRequirements: guidance.gateRequirements,
          gateMissingRequirements: guidance.gateMissingRequirements,
          gateHint: guidance.gateHint,
          nearestMissingObjective: guidance.nearestMissingObjective,
          missingObjectiveDirection: guidance.missingObjectiveDirection,
          gateChecklistText: guidance.gateChecklistText,
        };
      })() : null,
      cinematicEventState: current.cinematicEvent,
      cinematicState: current.cinematicEvent,
      openingCinematicState: current.openingCinematic
        ? {
          ...current.openingCinematic,
          activeLine: getOpeningCinematicLine(current.openingCinematic),
          progress: Number((1 - (current.openingCinematic.timer / current.openingCinematic.duration)).toFixed(3)),
        }
        : null,
      bossIntroState: current.bossIntro,
      environmentEventState: current.environmentEvent,
      dynamicEnvironmentEventState: current.dynamicEnvironmentEvent,
      discoveryEntranceState: {
        id: DISCOVERY_ENTRANCE.id,
        title: DISCOVERY_ENTRANCE.name,
        siteType: DISCOVERY_ENTRANCE.title,
        message: DISCOVERY_ENTRANCE.message,
        handoffMessage: DISCOVERY_ENTRANCE.handoffMessage,
        active: Boolean(current.discoveryEntranceActive),
        reached: Boolean(current.discoveryEntranceActive || current.discoveryEntranceHandoffStarted || current.completed),
        timer: Number((current.discoveryEntranceTimer || 0).toFixed(2)),
      },
      discoveryEntranceFound: Boolean(current.discoveryEntranceActive || current.discoveryEntranceHandoffStarted || current.completed),
      sectionTransitionState: current.sectionTransition,
      activeAtmosphere: {
        sectionId: section.id,
        sectionName: getSectionDisplayName(section.id),
        mood: SECTION_ATMOSPHERES[section.id]?.mood || null,
        title: getSectionDisplayTitle(section.id) || null,
      },
      hazards: getRenderableHazards(current).map(hazard => hazard.name),
      endGateReached: current.completed || current.discoveryEntranceActive,
      briefingOpen,
      failed: current.failed,
      failureReason: current.failureReason,
      failureDetail: current.failureDetail,
      notice: current.notice,
    };
  }, [briefingOpen, getActiveHazardsNearPlayer, getActiveHiddenRoutes, getActiveSecretCollectibles, getBossVulnerabilityState, getCombatMode, getEnemyPatternConfig, getEntityCombatState, getGateGuidance, getObjectiveProgress, getPlayerAttackState, getRenderableHazards, getRouteAccessState, getSectionDisplayName, getSectionDisplayTitle, getStaminaWarningState, isRouteRewardAccessible, playerHeroSpriteConfig, scopedJourneyAssetPacks.backgroundSectionIds, scopedJourneyAssetPacks.isChinaJourney, targetCivilisation]);

  return { createJourneySnapshot };
}
