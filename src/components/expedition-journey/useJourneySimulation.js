import { useCallback } from 'react';

import {
  SCARAB_QUEEN_DRAW_OFFSET_X,
} from './journeyBossSprites';
import {
  beginEnemyAttackSwing,
  beginEnemyAttackWindup,
  BOSS_ATTACK_PHASES,
  DEFAULT_BOSS_ATTACK_PHASES,
  ENEMY_AGGRO_MEMORY_SECONDS,
  ENEMY_AGGRO_PATROL_PADDING,
  ENEMY_DEFEATED_VISIBLE_SECONDS,
  getEnemyCombatIntent,
  getEnemyFacingDirectionToPlayer,
  getEnemyIntentTuning,
  getEnemyVenomPressureTuning,
  shouldScarabFrontalArmorDeflect,
  shouldStunScarabChargeOnDodge,
  resolveEnemyCombatSide,
  shouldVaultScarabCharge,
  getScarabVaultOutcome,
  MISSED_ATTACK_EXTRA_STAMINA_COST,
  openEnemyCounterWindow,
  PLAYER_AIR_ATTACK_TYPE,
  PLAYER_AIR_ATTACK_DAMAGE,
  PLAYER_ATTACK_BACK_REACH,
  PLAYER_ATTACK_FINISHER_DAMAGE,
  PLAYER_ATTACK_FINISHER_EXTRA_STAMINA_COST,
  PLAYER_ATTACK_HEIGHT,
  PLAYER_ATTACK_LIGHT_DAMAGE,
  PLAYER_ATTACK_PARRY_DAMAGE,
  PLAYER_ATTACK_RANGE,
  PLAYER_ATTACK_SHOVE_DAMAGE,
  PLAYER_ATTACK_STAMINA_COST,
  PLAYER_ATTACK_TYPES,
  PLAYER_BOSS_STAGGER_ENDURANCE_REWARD,
  PLAYER_COMBO_MAX_STEP,
  PLAYER_COMBO_WINDOW_DURATION,
  PLAYER_DEFEAT_ENDURANCE_REWARD,
  PLAYER_DODGE_SPEED,
  PLAYER_HEAVY_FOLLOWUP_CUE_DURATION,
  PLAYER_HEAVY_FOLLOWUP_HIT_REFUND,
  PLAYER_HIT_SCREEN_SHAKE_DURATION,
  getPlayerAttackProfile,
  PROTECTED_HIT_EXTRA_STAMINA_COST,
  SCORPION_ANTI_AIR_ATTACK_PATTERN,
  SCORPION_CHASE_SPEED_MULTIPLIER,
  SCORPION_VENOM_SLOW_DURATION,
  SCORPION_VENOM_SLOW_MULTIPLIER,
  SCORPION_VENOM_STAMINA_DAMAGE,
  SCORPION_VENOM_SPIT_RANGE,
  SNAKE_AMBUSH_LUNGE_PATTERN,
  shouldUseScorpionAntiAirSting,
  shouldUseScorpionVenomSpit,
  shouldUseSnakeAmbushLunge,
  shouldUseWispDiveHarass,
  shouldAllowEnemyAttackMovement,
  suppressEnemyForBossFocus,
  updateEnemyCombatTimers,
  updateEnemyDefeatedVisibility,
  WISP_DIVE_ATTACK_PATTERN,
} from './journeyCombat.js';
import {
  getEnemyAttackTelegraph,
  HEAVY_ATTACK_INTERVAL,
} from './journeyCombatTelegraphs';
import {
  AIR_ACCELERATION,
  AIR_DECELERATION,
  ATTACK_DURATION,
  ATTACK_RECOIL_DURATION,
  BOSS_INTRO_PLAYER_STANDOFF,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COYOTE_TIME,
  DESERT_ENTRY_EXTERIOR_SPAWN_X,
  ENEMY_ATTACK_TRIGGER_REACH,
  ENEMY_COMBAT_STANDOFF_GAP,
  EXHAUSTED_RECOVERY_CEILING,
  EXHAUSTED_RECOVERY_RATE,
  FIELD_RESCUE_STAMINA_REASON,
  GRAVITY,
  GROUND_Y,
  GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED,
  INVULNERABLE_DURATION,
  JUMP_BUFFER_TIME,
  JUMP_CUT_FEEDBACK_TIME,
  JUMP_CUT_MULTIPLIER,
  JUMP_SPEED,
  LOW_STAMINA_WARNING,
  MOVE_ACCELERATION,
  MOVE_DECELERATION,
  MOVE_SPEED,
  OPENING_PYRAMID_AIR_JUMP_MULTIPLIER,
  OPENING_PYRAMID_GROUND_JUMP_MULTIPLIER,
  PERFECT_DODGE_ENDURANCE_REWARD,
  scaleJourneyX,
  SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO,
  SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS,
  SCARAB_QUEEN_INTRO_TRIGGER_DISTANCE,
  SCORPION_VENOM_SPIT_VISUAL_TRAVEL_TIME,
  WORLD_WIDTH,
} from './journeyConstants';
import {
  DISCOVERY_ENTRANCE,
  ENVIRONMENT_EVENTS,
  ENVIRONMENT_INTERACTIONS,
  GATE,
  JOURNEY_TOOLS,
  LORE_TABLETS,
  OBJECTIVE_MARKERS,
  PLATFORMS,
  RELIC_SHARDS,
  ROUTE_GATES,
  SCARAB_SEAL_TRIGGER,
  SECTION_ATMOSPHERES,
  STAGE_ENTRANCE_FEATURES,
  TOOL_LAYOUT,
  UPGRADES,
} from './journeyDataRouter';
import {
  clampCameraX,
  JOURNEY_CAMERA,
  JOURNEY_VIEWPORT,
  JOURNEY_WORLD_LAYOUT,
} from './journeyLayout';
import {
  ARRIVAL_THRESHOLD_EXIT_WALK_END_X,
  ARRIVAL_THRESHOLD_EXIT_WALK_SECONDS,
  ARRIVAL_THRESHOLD_FORWARD_GATE_TRIGGER_X,
  ARRIVAL_THRESHOLD_GATE_OBJECTIVE_LINE,
  ARRIVAL_THRESHOLD_LEFT_BOUND,
  ARRIVAL_THRESHOLD_LEFT_INSPECT_X,
  ARRIVAL_THRESHOLD_LEFT_LINES,
  ARRIVAL_THRESHOLD_LEFT_OBJECTIVE_LINE,
  ARRIVAL_THRESHOLD_MARKING_LINES,
  ARRIVAL_THRESHOLD_MARKINGS_INSPECT_X,
  ARRIVAL_THRESHOLD_RIGHT_BOUND,
  ARRIVAL_THRESHOLD_SPAWN_LINE,
  ARRIVAL_THRESHOLD_TRIAL_EXIT_LOCKED_LINE,
  ARRIVAL_THRESHOLD_WAKE_SECONDS,
  createArrivalThresholdTrialState,
  getOpeningCinematicLine,
  getOpeningThresholdDialogueLine,
  OPENING_ARRIVAL_AFTERSHOCK_NOTICE,
  OPENING_CINEMATIC_SPELL_IMPACT_AT,
  OPENING_THRESHOLD_FALL_DELAY_SECONDS,
  OPENING_THRESHOLD_FALL_DURATION_SECONDS,
  OPENING_THRESHOLD_SCENE_DURATION,
  OPENING_THRESHOLD_STAIR_REVEAL_SECONDS,
} from './journeyOpeningScenes';
import {
  getHeroSpriteRow,
} from './journeyPlayerVisuals';
import {
  getAnubisRestorationReaction,
  getMummificationRiteByIndex,
  getRoomRestorationStatus,
  MUMMIFICATION_ANUBIS_WARNINGS,
  MUMMIFICATION_CHAMBER_DISTURBANCE_DURATION,
  MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS,
  MUMMIFICATION_CHAMBER_RITE_OBJECTS,
  MUMMIFICATION_CHAMBER_RITUAL_STEPS,
  MUMMIFICATION_HOLD_DURATIONS,
  SCRIBE_CHAMBER_PUZZLE,
} from './journeySacredRooms';
import {
  clamp,
  createForgottenMuralRelicSlidePuzzleTiles,
  createJourneyRoomInteractionState,
  getCollectibleHitbox,
  getHazardHitbox,
  getPlayerBodyHitbox,
  getPlatformSurfaceYAtX,
  getSectionForX,
  isLandingOnPlatform,
  isMummificationChamberComplete,
  isReusableJourneyTrap,
  JOURNEY_INTERACT_OBJECT_STATES,
  journeyInteractHoldTick,
  journeyInteractInspect,
  journeyInteractPickUp,
  journeyInteractPlace,
  makeEnemy,
  normalizeJourneyTrap,
  rectsOverlap,
  resolveEnemyContact,
  updateJourneyTrapRuntime,
  updatePlayerAnimation,
} from './journeyUtils';

/* eslint-disable react-hooks/exhaustive-deps -- every dependency the rule flags in this file
   is a stable ref or a module-level helper passed in from the component; none change across
   renders, so omitting them from dependency arrays is correct and preserves the original
   pre-extraction behaviour. */

// Per-frame game simulation. Extracted wholesale from ExpeditionJourney as a pure mechanical
// move: the entire `update` game-loop useCallback (player physics, combat, hazards/traps,
// camera, scene/threshold transitions, objective + HUD sync) relocated here verbatim with its
// original statement order, stateRef mutation sequence, and useCallback dependency array
// unchanged. Every component-owned ref/state/setter/resolver and base-data table is passed in
// via the deps object so the live render/update path is byte-for-byte identical.
export function useJourneySimulation({
  // --- module-level constants/tables defined in ExpeditionJourney (passed in; not exported) ---
  CHAMBER_DOOR_VISUALS_BY_ID,
  CHINA_OPENING_CINEMATIC_ID,
  DEFAULT_LEVEL_TRANSITION,
  DISCOVERY_ENTRANCE_REVEAL_SECONDS,
  ENEMY_TYPE_STAKE_MESSAGES,
  FORGOTTEN_MURAL_CHAMBER_BOUNDS,
  FORGOTTEN_MURAL_CHAMBER_CAMERA_X,
  FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN,
  FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER,
  FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER,
  FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK,
  FORGOTTEN_MURAL_CHAMBER_SWITCH_SECONDS,
  FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
  HAZARD_VISUALS,
  HEAVY_ATTACK_PATTERNS,
  JOURNEY_SCENE_IDS,
  LOST_BRIDGE_RAVINE_FALL_DEPTH,
  LOST_BRIDGE_RAVINE_FALL_SIDE_PAD,
  MUMMIFICATION_CHAMBER_BOUNDS,
  MUMMIFICATION_CHAMBER_CAMERA_X,
  MUMMIFICATION_CHAMBER_ENTRY_SPAWN,
  MUMMIFICATION_CHAMBER_ENTRY_TRIGGER,
  MUMMIFICATION_CHAMBER_EXIT_TRIGGER,
  MUMMIFICATION_CHAMBER_RETURN_FALLBACK,
  OPENING_CAMERA_REVEAL_DURATION,
  PARRY_WINDOW_DURATION,
  ROME_OPENING_CINEMATIC_ID,
  SCARAB_POISONED_CHARGE_SPEED_MULTIPLIER,
  SCARAB_POISONED_CHARGE_START_BONUS,
  SCORPION_NEST_EDITOR_DEFAULTS,
  SCORPION_VENOM_ATTACK_PATTERN,
  SCRIBE_CHAMBER_BOUNDS,
  SCRIBE_CHAMBER_CAMERA_X,
  SCRIBE_CHAMBER_ENTRY_SPAWN,
  SCRIBE_CHAMBER_ENTRY_TRIGGER,
  SCRIBE_CHAMBER_EXIT_TRIGGER,
  SCRIBE_CHAMBER_RETURN_FALLBACK,
  SCRIBE_CHAMBER_TABLET_REGION,
  SCRIBE_CHAMBER_WALL_REGION,
  TEMPLE_APPROACH_RAMP_ASSIST,
  TEMPLE_APPROACH_RAMP_LOWER_PATH_FOOT_Y,
  TEMPLE_THRESHOLD_ANUBIS_START_SECONDS,
  TEMPLE_THRESHOLD_HALL_BOUNDS,
  TEMPLE_THRESHOLD_HALL_CAMERA_X,
  TEMPLE_THRESHOLD_HALL_ENTRY_DISABLED_FOR_BUILD,
  TEMPLE_THRESHOLD_HALL_ENTRY_SPAWN,
  TEMPLE_THRESHOLD_HALL_ENTRY_TRIGGER,
  TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER,
  TEMPLE_THRESHOLD_HALL_RETURN_FALLBACK,
  TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER,
  TEMPLE_THRESHOLD_SWITCH_SECONDS,
  // --- component refs / state / callbacks / resolvers / base-data ---
  addCombatEffect,
  applyCombatHitImpact,
  audioControls,
  briefingOpen,
  buildBossRewardMoment,
  completeOpeningThresholdScene,
  enterLevelFromThreshold,
  footstepTimerRef,
  getActiveHiddenRoutes,
  getActiveSecretCollectibles,
  getActiveShardGateProgress,
  getAmbientDramaSfxKey,
  getArrivalThresholdGroundY,
  getAttackBox,
  getAttackHurtbox,
  getBossPhaseConfig,
  getBossVulnerabilityState,
  getCameraFollowTarget,
  getDoorwayGateStatus,
  getEnemyHitSfxKey,
  getEnemyPatternConfig,
  getGateGuidance,
  getGuardianChallengeQuestions,
  getHazardSfxKey,
  getJourneySceneId,
  getLiveScorpionNestBlockers,
  getLostBridgeDeckBounds,
  getObjectiveProgress,
  getOpeningArrivalNoticeForCinematicId,
  getOpeningCameraRevealTarget,
  getPlayerAttackNearMissTarget,
  getPlayerAttackState,
  getRenderableCheckpoints,
  getRenderableHazards,
  getRenderablePlatforms,
  getRenderableTrapPlatforms,
  getRouteAccessState,
  getRouteGateDoorwayEntries,
  getSectionDisplayName,
  getSectionDisplayTitle,
  getStageEntranceTriggerX,
  getTempleApproachRampSurfaceY,
  getTimelineRequirementProgress,
  isEntityActiveInScene,
  isForgottenMuralChamberScene,
  isInteriorChamberScene,
  isJourneyBlockerPlatform,
  isLowStamina,
  isMummificationChamberScene,
  isNormalEnemyInsideBossFocus,
  isOpeningPyramidAirJumpAssistAvailable,
  isRouteRewardAccessible,
  isScribeLockedChamberScene,
  isStageEntranceAvailableForState,
  isTempleThresholdHallScene,
  keysRef,
  onComplete,
  openingAtmosphereSfxKey,
  playerSpriteRef,
  recordEnvironmentInteraction,
  resetPlayerCombo,
  resolveChamberEntryTrigger,
  resolveChamberReturnPoint,
  resolveJourneyBlockerPlatformCollision,
  scopedJourneyAssetPacks,
  shuffleGuardianQuestionOptions,
  startLevelThresholdEncounter,
  startOpeningCinematic,
  startTempleThresholdTransition,
  stateRef,
  syncHud,
  targetCivilisation,
  triggerJourneyRescue,
  updateArrivalThresholdTrial,
  updateHostileStepMultiplier,
  wasGroundedRef,
  applyOpeningEntranceStage,
}) {
  const update = useCallback((dt) => {
    const current = stateRef.current;
    if (briefingOpen || current.completed || current.failed) return;

    const player = current.player;
    const enemiesDisabled = Boolean(current.enemiesDisabled);
    if (current.openingCinematic) {
      const cinematic = current.openingCinematic;
      cinematic.timer = Math.max(0, cinematic.timer - dt);
      const elapsed = clamp(cinematic.duration - cinematic.timer, 0, cinematic.duration);
      const activeLine = getOpeningCinematicLine(cinematic);
      const isRomeOpeningCinematicActive = cinematic.id === ROME_OPENING_CINEMATIC_ID;
      const isChinaOpeningCinematicActive = cinematic.id === CHINA_OPENING_CINEMATIC_ID;
      const openingArrivalNotice = getOpeningArrivalNoticeForCinematicId(cinematic.id);
      const spellImpactAt = cinematic.spellImpactAt ?? OPENING_CINEMATIC_SPELL_IMPACT_AT;
      cinematic.activeLineId = activeLine?.id || null;
      cinematic.activeLine = activeLine || null;
      current.notice = activeLine?.text || (isRomeOpeningCinematicActive ? 'The vault is still watching.' : isChinaOpeningCinematicActive ? 'The watchtower is still watching.' : 'The first seal watches.');
      current.attackQueued = false;
      player.vx = 0;
      player.vy = 0;
      player.direction = 1;
      if (!cinematic.spellImpactTriggered && elapsed >= spellImpactAt) {
        cinematic.spellImpactTriggered = true;
        cinematic.shieldShattered = true;
        current.player.x = DESERT_ENTRY_EXTERIOR_SPAWN_X;
        current.player.y = GROUND_Y - current.player.height;
        current.player.vx = 0;
        current.player.vy = 0;
        current.cameraX = 0;
        current.targetCameraX = 0;
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.7);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.42);
        audioControls?.playExpeditionSfx?.('openingThresholdFinalPulse');
        audioControls?.playExpeditionSfx?.('thresholdRealityTear', { volume: 0.86 });
      }
      if (cinematic.timer <= 0) {
        current.openingCinematic = null;
        current.player.x = DESERT_ENTRY_EXTERIOR_SPAWN_X;
        current.player.y = GROUND_Y - current.player.height;
        current.cameraX = 0;
        current.targetCameraX = 0;
        if (!applyOpeningEntranceStage?.(current)) {
          current.notice = openingArrivalNotice;
          current.cinematicEvent = {
            id: 'opening-arrival-aftershock',
            name: 'Asha',
            message: openingArrivalNotice,
            temporary: true,
          };
          current.cinematicTimer = 3.4;
          audioControls?.playExpeditionSfx?.('lostSiteAirShift', { volume: 0.64 });
          current.openingCameraRevealTimer = Math.max(current.openingCameraRevealTimer, OPENING_CAMERA_REVEAL_DURATION);
        }
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.24);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.12);
      } else if (Math.abs(elapsed - spellImpactAt) < dt + 0.02) {
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.42);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.22);
      }
      return;
    }

    const upgradeEffects = current.upgradeEffects || {};
    const maxStamina = upgradeEffects.maxStamina || 100;
    const knockbackMultiplier = upgradeEffects.knockbackMultiplier || 1;
    const keys = keysRef.current;
    const left = keys.ArrowLeft || keys.KeyA;
    const right = keys.ArrowRight || keys.KeyD;
    const jump = keys.ArrowUp || keys.KeyW || keys.Space;
    const approach = (value, target, amount) => {
      if (value < target) return Math.min(value + amount, target);
      if (value > target) return Math.max(value - amount, target);
      return value;
    };

    const applyAttackStaminaCost = (amount, reason) => {
      if (!amount) return;
      current.resources.stamina = Math.max(0, current.resources.stamina - amount);
      if (current.resources.stamina === 0) current.enduranceExhausted = true;
      current.playerAttackStaminaCost = amount;
      current.lastStaminaDelta = -amount;
      current.lastStaminaLossReason = reason;
      current.staminaFeedbackTimer = Math.max(current.staminaFeedbackTimer, 0.65);
    };
    const addRewardPulse = (type, x, y, text, options = {}) => {
      addCombatEffect(current, {
        type,
        x,
        y,
        text,
        color: options.color || '#facc15',
        fill: options.fill,
        radius: options.radius,
        alpha: options.alpha,
        timer: options.timer || 0.58,
        maxTimer: options.maxTimer || options.timer || 0.58,
      });
    };
    const activateScarabSealForQueenEncounter = () => {
      current.scarabSealActivated = true;
      current.openingConfrontationSeen = true;
      current.collapsedPlatformIds.add('opening-scarab-seal-summit');
      current.triggeredEnvironmentEventIds.add(SCARAB_SEAL_TRIGGER.id);
      current.dynamicEnvironmentEvent = {
        id: SCARAB_SEAL_TRIGGER.id,
        sectionId: SCARAB_SEAL_TRIGGER.sectionId,
        type: SCARAB_SEAL_TRIGGER.eventType,
        x: SCARAB_SEAL_TRIGGER.x,
        name: SCARAB_SEAL_TRIGGER.eventName,
        message: SCARAB_SEAL_TRIGGER.sealEmphasisMessage,
        duration: Math.min(SCARAB_SEAL_TRIGGER.duration, 1.4),
        shake: SCARAB_SEAL_TRIGGER.shake,
        card: false,
      };
      current.dynamicEnvironmentEventTimer = current.dynamicEnvironmentEvent.duration;
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.24);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, SCARAB_SEAL_TRIGGER.shake * 0.7);
      addRewardPulse('scarab-seal-awakening', SCARAB_SEAL_TRIGGER.x, SCARAB_SEAL_TRIGGER.y, SCARAB_SEAL_TRIGGER.sealPulseLabel, {
        color: '#b45309',
        fill: 'rgba(180, 83, 9, 0.12)',
        radius: SCARAB_SEAL_TRIGGER.sealPulseRadius,
        timer: SCARAB_SEAL_TRIGGER.sealPulseDuration,
      });
      audioControls?.playExpeditionSfx?.(openingAtmosphereSfxKey);
    };
    const markSecretSetProgress = (secret) => {
      if (!secret?.setId || current.completedCollectionSetIds?.has(secret.setId)) return;
      const setItems = getActiveSecretCollectibles().filter(item => item.setId === secret.setId);
      if (setItems.length > 0 && setItems.every(item => current.collectedSecretIds?.has(item.id))) {
        current.completedCollectionSetIds.add(secret.setId);
        current.notice = `Collection Complete: ${secret.setId === 'china-secrets' ? 'Ancient China secret finds' : 'Ancient Egypt secret finds'}.`;
        current.cinematicEvent = {
          id: `${secret.setId}-complete`,
          name: 'Collection Complete',
          message: 'The field journal now holds a complete set of hidden discoveries.',
          temporary: true,
        };
        current.cinematicTimer = 2.9;
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.045);
        addRewardPulse('collection-complete', secret.x, secret.y, 'COLLECTION COMPLETE', {
          color: '#22c55e',
          fill: 'rgba(34, 197, 94, 0.11)',
          radius: 64,
          timer: 0.82,
        });
        audioControls?.playLevelUp?.();
      }
    };

    // Timers
    current.cinematicTimer = Math.max(0, current.cinematicTimer - dt);
    if (current.cinematicTimer <= 0 && current.cinematicEvent?.temporary) current.cinematicEvent = null;
    current.postBossRewardTimer = Math.max(0, (current.postBossRewardTimer || 0) - dt);
    if (current.postBossRewardTimer <= 0 && current.postBossReward) current.postBossReward = null;
    current.itemPurposeNoticeTimer = Math.max(0, (current.itemPurposeNoticeTimer || 0) - dt);
    current.damageNoticeTimer = Math.max(0, (current.damageNoticeTimer || 0) - dt);
    current.openingEntranceStageTimer = Math.max(0, (current.openingEntranceStageTimer || 0) - dt);
    current.openingCameraRevealTimer = Math.max(0, (current.openingCameraRevealTimer || 0) - dt);
    if (current.openingCameraRevealTimer <= 0 && current.openingCameraRevealMode) {
      current.openingCameraRevealMode = null;
      current.openingCameraRevealDuration = OPENING_CAMERA_REVEAL_DURATION;
    }
    current.bossIntroTimer = Math.max(0, current.bossIntroTimer - dt);
    if (current.bossIntroTimer <= 0) {
      if (current.bossIntro) current.bossIntro = null;
      if (current.pendingGuardianChallenge && !current.activeGuardianChallenge) {
        current.activeGuardianChallenge = current.pendingGuardianChallenge;
        current.pendingGuardianChallenge = null;
      }
    }
    current.environmentEventTimer = Math.max(0, current.environmentEventTimer - dt);
    if (current.environmentEventTimer <= 0 && current.environmentEvent) current.environmentEvent = null;
    if (current.openingSphinxEncounter) {
      current.openingSphinxEncounter.timer = Math.max(0, current.openingSphinxEncounter.timer - dt);
      if (current.openingSphinxEncounter.timer <= 0) current.openingSphinxEncounter = null;
    }
    if (current.openingThresholdScene) {
      current.openingThresholdScene.timer = Math.max(0, current.openingThresholdScene.timer - dt);
      current.openingThresholdScene.activeLine = getOpeningThresholdDialogueLine(current.openingThresholdScene);
      const thresholdElapsed = clamp(
        (current.openingThresholdScene.duration || 0) - (current.openingThresholdScene.timer || 0),
        0,
        current.openingThresholdScene.duration || 0,
      );
      const fallDelay = current.openingThresholdScene.playerFallDelay ?? OPENING_THRESHOLD_FALL_DELAY_SECONDS;
      const fallDuration = current.openingThresholdScene.playerFallDuration ?? OPENING_THRESHOLD_FALL_DURATION_SECONDS;
      const thresholdFallProgress = clamp((thresholdElapsed - fallDelay) / fallDuration, 0, 1);
      if (thresholdFallProgress > 0 && !current.openingThresholdScene.fallSfxPlayed) {
        current.openingThresholdScene.fallSfxPlayed = true;
        audioControls?.playExpeditionSfx?.('openingThresholdFall');
      }
      current.openingThresholdScene.stairwellRevealActive = current.openingThresholdScene.timer <= OPENING_THRESHOLD_STAIR_REVEAL_SECONDS;
      if (current.openingThresholdScene.stairwellRevealActive && !current.openingThresholdScene.stoneShiftSfxPlayed) {
        current.openingThresholdScene.stoneShiftSfxPlayed = true;
        audioControls?.playExpeditionSfx?.('openingThresholdStoneShift');
      }
      if (current.openingThresholdScene.timer <= 4.5 && !current.openingThresholdScene.finalPulseSfxPlayed) {
        current.openingThresholdScene.finalPulseSfxPlayed = true;
        audioControls?.playExpeditionSfx?.('openingThresholdFinalPulse');
      }
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, current.openingThresholdScene.stairwellRevealActive ? 0.08 : 0);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, current.openingThresholdScene.stairwellRevealActive ? 0.06 : 0);
      if (current.openingThresholdScene.timer <= 0) {
        completeOpeningThresholdScene(current);
      }
    }
    if (current.templeThresholdTransition) {
      const transition = current.templeThresholdTransition;
      transition.timer = Math.max(0, transition.timer - dt);
      const transitionElapsed = clamp((transition.duration || 0) - (transition.timer || 0), 0, transition.duration || 0);
      if (!transition.switched && transitionElapsed >= TEMPLE_THRESHOLD_SWITCH_SECONDS) {
        transition.switched = true;
        transition.phase = 'destination-reveal';
        enterLevelFromThreshold(current, transition);
      }
      if (transition.switched && !transition.encounterChecked && transitionElapsed >= TEMPLE_THRESHOLD_ANUBIS_START_SECONDS) {
        transition.encounterChecked = true;
        transition.anubisStarted = startLevelThresholdEncounter(current, transition);
      }
      if (transition.timer <= 0) {
        current.templeThresholdTransition = null;
        current.notice = transition.levelTransition?.finalNotice || DEFAULT_LEVEL_TRANSITION.finalNotice;
        syncHud();
      }
    }
    const activeSceneTransition = current.sceneTransition || current.forgottenMuralChamberTransition;
    if (activeSceneTransition) {
      const transition = activeSceneTransition;
      transition.timer = Math.max(0, transition.timer - dt);
      const transitionElapsed = clamp((transition.duration || 0) - (transition.timer || 0), 0, transition.duration || 0);
      if (!transition.switched && transitionElapsed >= FORGOTTEN_MURAL_CHAMBER_SWITCH_SECONDS) {
        transition.switched = true;
        const enteringTempleThresholdHall = transition.toSceneId === JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL;
        const enteringMummificationChamber = transition.toSceneId === JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER;
        const enteringForgottenMuralChamber = transition.toSceneId === JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER;
        const enteringScribeChamber = transition.toSceneId === JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER;
        transition.phase = enteringTempleThresholdHall
          ? 'temple-threshold-hall-reveal'
          : enteringMummificationChamber
          ? 'mummification-chamber-reveal'
          : enteringForgottenMuralChamber
            ? 'chamber-reveal'
            : enteringScribeChamber
            ? 'scribe-chamber-reveal'
            : 'exterior-return';
        current.previousSceneId = transition.fromSceneId || getJourneySceneId(current);
        current.currentSceneId = transition.toSceneId || JOURNEY_SCENE_IDS.EXTERIOR;
        current.templeThresholdHallActive = enteringTempleThresholdHall;
        current.mummificationChamberActive = enteringMummificationChamber;
        current.forgottenMuralChamberActive = enteringForgottenMuralChamber;
        current.scribeChamberActive = enteringScribeChamber;
        if (enteringTempleThresholdHall) {
          current.templeThresholdHallEntered = true;
          current.hiddenRoomsFound?.add('temple-threshold-hall');
          current.discoveredHiddenRouteIds?.add('temple-threshold-hall-route');
          player.x = TEMPLE_THRESHOLD_HALL_ENTRY_SPAWN.x - player.width / 2;
          player.y = TEMPLE_THRESHOLD_HALL_ENTRY_SPAWN.y - player.height;
          player.direction = TEMPLE_THRESHOLD_HALL_ENTRY_SPAWN.direction;
          current.cameraX = TEMPLE_THRESHOLD_HALL_CAMERA_X;
          current.targetCameraX = current.cameraX;
          current.notice = 'The first hall is not abandoned. It is waiting.';
          current.cinematicEvent = {
            id: 'temple-threshold-hall-entered',
            name: 'Temple Approach',
            message: 'The first hall is not abandoned. It is waiting.',
            temporary: true,
          };
          current.cinematicTimer = 2.8;
        } else if (enteringMummificationChamber) {
          current.mummificationChamberEntered = true;
          current.mummificationChamberDoorSealed = true;
          current.mummificationChamberExitUnlocked = Boolean(current.mummificationChamberPuzzleSolved);
          current.hiddenRoomsFound?.add('mummification-chamber');
          current.discoveredHiddenRouteIds?.add('mummification-chamber-route');
          player.x = MUMMIFICATION_CHAMBER_ENTRY_SPAWN.x - player.width / 2;
          player.y = MUMMIFICATION_CHAMBER_ENTRY_SPAWN.y - player.height;
          player.direction = MUMMIFICATION_CHAMBER_ENTRY_SPAWN.direction;
          current.cameraX = MUMMIFICATION_CHAMBER_CAMERA_X;
          current.targetCameraX = current.cameraX;
          current.notice = 'This is a mummification chamber...';
          current.cinematicEvent = {
            id: 'mummification-chamber-entered',
            name: 'Asha',
            message: 'This is a mummification chamber...',
            temporary: true,
          };
          current.cinematicTimer = 2.8;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.0);
        } else if (enteringForgottenMuralChamber) {
          current.forgottenMuralChamberEntered = true;
          current.hiddenRoomsFound?.add('forgotten-mural-chamber');
          current.discoveredHiddenRouteIds?.add('desert-upper-survey-route');
          player.x = FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN.x - player.width / 2;
          player.y = FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN.y - player.height;
          player.direction = FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN.direction;
          current.cameraX = FORGOTTEN_MURAL_CHAMBER_CAMERA_X;
          current.targetCameraX = current.cameraX;
          current.notice = 'Forgotten Mural Chamber discovered. The warning mural has been damaged.';
          current.cinematicEvent = {
            id: 'forgotten-mural-chamber-entered',
            name: 'Forgotten Mural Chamber discovered',
            message: 'Broken pieces of a scarab seal lie across the floor. Someone tried to erase this warning.',
            temporary: true,
          };
          current.cinematicTimer = 2.8;
        } else if (enteringScribeChamber) {
          current.scribeChamberEntered = true;
          current.scribeChamberDoorSealed = true;
          current.scribeChamberExitUnlocked = Boolean(current.scribeChamberPuzzleSolved);
          current.hiddenRoomsFound?.add('scribe-locked-chamber');
          current.discoveredHiddenRouteIds?.add('scribe-locked-chamber-route');
          current.sceneReturn = resolveChamberReturnPoint(
            CHAMBER_DOOR_VISUALS_BY_ID['scribe-chamber-entry-door'],
            SCRIBE_CHAMBER_RETURN_FALLBACK.direction,
          );
          player.x = SCRIBE_CHAMBER_ENTRY_SPAWN.x - player.width / 2;
          player.y = SCRIBE_CHAMBER_ENTRY_SPAWN.y - player.height;
          player.direction = SCRIBE_CHAMBER_ENTRY_SPAWN.direction;
          current.cameraX = SCRIBE_CHAMBER_CAMERA_X;
          current.targetCameraX = current.cameraX;
          current.notice = 'A scribe\'s chamber... these walls are covered in symbols.';
          current.cinematicEvent = {
            id: 'scribe-chamber-door-sealed',
            name: 'The Scribe\'s Locked Chamber',
            message: 'I\'m trapped. Whoever built this room wanted this message protected.',
            temporary: true,
          };
          current.cinematicTimer = 3.2;
        } else {
          const returnPoint = current.sceneReturn || FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK;
          player.x = (returnPoint.x ?? FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK.x) - player.width / 2;
          player.y = (returnPoint.y ?? FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK.y) - player.height;
          player.direction = returnPoint.direction || FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK.direction;
          current.cameraX = Number.isFinite(returnPoint.cameraX)
            ? returnPoint.cameraX
            : clampCameraX(player.x - CANVAS_WIDTH * (returnPoint.cameraAnchorRatio ?? FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK.cameraAnchorRatio));
          current.targetCameraX = current.cameraX;
          current.notice = current.scribeChamberPuzzleSolved
            ? 'Asha leaves the Scribe\'s Chamber with the message recorded.'
            : current.templeThresholdHallCleared
              ? 'Asha returns to the temple approach with the threshold warning recorded.'
            : current.forgottenMuralChamberRestored
              ? 'Asha returns to the exterior route with the warning preserved.'
              : current.mummificationChamberPuzzleSolved
              ? 'Asha leaves the Mummification Chamber with the sacred rite recorded.'
                : 'Asha returns to the exterior route.';
          current.templeThresholdHallActive = false;
          current.mummificationChamberActive = false;
          current.scribeChamberActive = false;
        }
        player.vx = 0;
        player.vy = 0;
        player.onGround = true;
      }
      if (transition.timer <= 0) {
        const endedInTempleThresholdHall = getJourneySceneId(current) === JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL;
        const endedInMummificationChamber = getJourneySceneId(current) === JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER;
        const endedInForgottenMuralChamber = getJourneySceneId(current) === JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER;
        const endedInScribeChamber = getJourneySceneId(current) === JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER;
        current.sceneTransition = null;
        current.forgottenMuralChamberTransition = null;
        current.notice = endedInTempleThresholdHall
          ? 'The threshold hall listens for proof.'
          : endedInMummificationChamber
          ? 'The entrance sealed behind me.'
          : endedInForgottenMuralChamber
            ? 'The hidden chamber is quiet. Recover the broken scarab fragments.'
            : endedInScribeChamber
            ? 'I\'m trapped. Whoever built this room wanted this message protected.'
            : current.notice;
        if (endedInMummificationChamber) {
          current.cinematicEvent = {
            id: 'mummification-chamber-door-sealed',
            name: 'Asha',
            message: 'The entrance sealed behind me.',
            temporary: true,
          };
          current.cinematicTimer = 2.6;
        }
        syncHud();
      }
    }
    current.dynamicEnvironmentEventTimer = Math.max(0, (current.dynamicEnvironmentEventTimer || 0) - dt);
    if (current.dynamicEnvironmentEventTimer <= 0 && current.dynamicEnvironmentEvent) current.dynamicEnvironmentEvent = null;
    current.discoveryEntranceTimer = Math.max(0, (current.discoveryEntranceTimer || 0) - dt);
    current.sectionTransitionTimer = Math.max(0, current.sectionTransitionTimer - dt);
    if (current.sectionTransitionTimer <= 0 && current.sectionTransition) current.sectionTransition = null;
    current.cameraShakeTimer = Math.max(0, current.cameraShakeTimer - dt);
    if (current.cameraShakeTimer <= 0) current.cameraShakeStrength = 0;
    current.cameraPunchTimer = Math.max(0, (current.cameraPunchTimer || 0) - dt);
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.damageCooldownTimer = Math.max(0, player.damageCooldownTimer - dt);
    player.venomSlowTimer = Math.max(0, (player.venomSlowTimer || 0) - dt);
    if (player.venomSlowTimer <= 0) player.venomSlowMultiplier = 1;
    if (player.poisonTimer > 0) {
      player.poisonTimer = Math.max(0, player.poisonTimer - dt);
      player.poisonTickTimer = Math.max(0, (player.poisonTickTimer || 0) - dt);
      if (player.poisonTickTimer <= 0 && player.poisonTimer > 0) {
        player.poisonTickTimer = 1.0;
        current.resources.stamina = Math.max(0, current.resources.stamina - 1);
        if (current.resources.stamina === 0) current.enduranceExhausted = true;
        addCombatEffect(current, {
          type: 'knockback-dust',
          x: player.x + player.width / 2,
          y: player.y + player.height - 4,
          direction: 0,
          color: 'rgba(70, 48, 20, 0.42)',
          timer: 0.28,
          maxTimer: 0.28,
        });
      }
    }
    player.sandBlindTimer = Math.max(0, (player.sandBlindTimer || 0) - dt);
    player.coyoteTimer = Math.max(0, (player.coyoteTimer || 0) - dt);
    player.jumpBufferTimer = Math.max(0, (player.jumpBufferTimer || 0) - dt);
    player.jumpCutFeedbackTimer = Math.max(0, (player.jumpCutFeedbackTimer || 0) - dt);
    player.impactShakeTimer = Math.max(0, (player.impactShakeTimer || 0) - dt);
    player.landingFeedbackTimer = Math.max(0, (player.landingFeedbackTimer || 0) - dt);
    player.movementDustTimer = Math.max(0, (player.movementDustTimer || 0) - dt);
    current.hazardCooldown = Math.max(0, current.hazardCooldown - dt);
    current.staminaFeedbackTimer = Math.max(0, current.staminaFeedbackTimer - dt);
    current.enemyCooldown = Math.max(0, current.enemyCooldown - dt);
    current.scorpionNestBlockNoticeCooldown = Math.max(0, (current.scorpionNestBlockNoticeCooldown || 0) - dt);
    current.attackCooldown = Math.max(0, current.attackCooldown - dt);
    const wasWindingUp = current.attackWindupTimer > 0;
    const wasSwinging = current.attackTimer > 0;
    const wasRecoiling = current.attackRecoilTimer > 0;
    current.attackWindupTimer = Math.max(0, current.attackWindupTimer - dt);
    current.attackTimer = Math.max(0, current.attackTimer - dt);
    current.attackRecoilTimer = Math.max(0, current.attackRecoilTimer - dt);
    current.attackComboWindowTimer = Math.max(0, (current.attackComboWindowTimer || 0) - dt);
    // Expire buffered attack presses that waited too long for Asha to recover.
    if ((current.attackQueuedBufferTimer || 0) > 0) {
      current.attackQueuedBufferTimer = Math.max(0, current.attackQueuedBufferTimer - dt);
      const stillBusy = current.attackCooldown > 0
        || current.attackWindupTimer > 0
        || current.attackTimer > 0
        || current.attackRecoilTimer > 0;
      if (
        current.attackQueuedBufferTimer <= 0
        && current.attackQueued
        && !current.attackQueuedHeavyFollowupPrimed
        && stillBusy
      ) {
        current.attackQueued = false;
        current.attackQueuedType = PLAYER_ATTACK_TYPES.LIGHT;
      }
    }
    current.heavyFollowupReadyTimer = Math.max(0, (current.heavyFollowupReadyTimer || 0) - dt);
    current.heavyFollowupCueTimer = Math.max(0, (current.heavyFollowupCueTimer || 0) - dt);
    current.dodgeTimer = Math.max(0, (current.dodgeTimer || 0) - dt);
    current.dodgeInvulnerableTimer = Math.max(0, (current.dodgeInvulnerableTimer || 0) - dt);
    current.dodgeRecoveryTimer = Math.max(0, (current.dodgeRecoveryTimer || 0) - dt);
    if (current.dodgeInvulnerableTimer > 0) player.invulnerable = Math.max(player.invulnerable, current.dodgeInvulnerableTimer);
    const hasDedicatedDodgeRow = playerSpriteRef.current.mode === 'hero-atlas'
      && Boolean(getHeroSpriteRow(playerSpriteRef.current.atlas, 'dodge'));
    if (current.dodgeTimer > 0 && hasDedicatedDodgeRow) {
      current.dodgeTrail = [];
    } else if (current.dodgeTimer > 0) {
      if (!current.dodgeTrail) current.dodgeTrail = [];
      current.dodgeTrail.unshift({ x: player.x, y: player.y, dir: player.direction, alpha: 0.38 });
      if (current.dodgeTrail.length > 4) current.dodgeTrail.length = 4;
    } else if (current.dodgeTrail?.length) {
      current.dodgeTrail = current.dodgeTrail
        .map(g => ({ ...g, alpha: g.alpha - dt * 3.2 }))
        .filter(g => g.alpha > 0);
    }
    player.hitFeedbackTimer = Math.max(0, player.hitFeedbackTimer - dt);
    // Exhausted state: track when Endurance hits zero and apply last-chance slow recovery
    if (current.resources.stamina === 0) current.enduranceExhausted = true;
    if (current.enduranceExhausted && !current.failed && !current.completed) {
      current.resources.stamina += EXHAUSTED_RECOVERY_RATE * dt;
      if (current.resources.stamina >= EXHAUSTED_RECOVERY_CEILING) {
        current.enduranceExhausted = false;
      }
    }
    const expiredAttackBox = wasSwinging && current.attackTimer <= 0 ? current.playerAttackBox : null;
    if (current.attackTimer <= 0) current.playerAttackBox = null;
    if (wasWindingUp && current.attackWindupTimer <= 0) {
      current.attackTimer = current.attackSwingDuration || ATTACK_DURATION;
      current.attackHitIds.clear();
    }
    if (wasSwinging && current.attackTimer <= 0 && current.attackRecoilTimer <= 0) {
      if (current.attackHitIds.size === 0) {
        const nearMissTarget = getPlayerAttackNearMissTarget(current, expiredAttackBox);
        current.lastAttackResult = nearMissTarget ? 'near-miss' : 'missed';
        applyAttackStaminaCost(MISSED_ATTACK_EXTRA_STAMINA_COST, 'Missed attack', '-1');
        audioControls?.playExpeditionSfx?.('attackMiss', { volume: 0.72 });
        if (nearMissTarget) {
          addCombatEffect(current, {
            type: 'near-miss-spacing',
            x: nearMissTarget.direction >= 0 ? nearMissTarget.hurtbox.x : nearMissTarget.hurtbox.x + nearMissTarget.hurtbox.width,
            y: nearMissTarget.hurtbox.y + nearMissTarget.hurtbox.height * 0.56,
            direction: nearMissTarget.direction,
            gap: nearMissTarget.gap,
            color: 'rgba(226, 213, 192, 0.78)',
            timer: 0.28,
            maxTimer: 0.28,
          });
          current.notice = 'Close - step in and land J before K.';
        }
        resetPlayerCombo(current);
      }
      if (current.attackComboFinisherActive) resetPlayerCombo(current);
      current.attackRecoilTimer = current.attackRecoilDuration || ATTACK_RECOIL_DURATION;
    }
    if (wasRecoiling && current.attackRecoilTimer <= 0 && current.attackCooldown <= 0) {
      current.attackPhase = 'ready';
    } else {
      current.attackPhase = getPlayerAttackState(current);
    }
    if (current.attackComboWindowTimer <= 0 && current.attackSequenceIndex > 0 && current.attackPhase === 'ready') resetPlayerCombo(current);
    current.hitStopTimer = Math.max(0, current.hitStopTimer - dt);
    current.combatHitEffects = current.combatHitEffects
      .map(effect => ({ ...effect, timer: Math.max(0, effect.timer - dt) }))
      .filter(effect => effect.timer > 0);
    Object.entries(current.reactivePlatformTimers || {}).forEach(([platformId, timer]) => {
      if (platformId.endsWith(':respawn')) return;
      const nextTimer = timer - dt;
      const platform = getRenderablePlatforms(current).find(item => (item.id || item.label) === platformId)
        || PLATFORMS.find(item => (item.id || item.label) === platformId);
      if (nextTimer <= 0) {
        delete current.reactivePlatformTimers[platformId];
        current.collapsedPlatformIds.add(platformId);
        current.reactivePlatformTimers[`${platformId}:respawn`] = platform?.reactive?.respawn || 3.2;
        addCombatEffect(current, {
          type: 'platform-crack',
          x: platform?.x || player.x,
          y: (platform?.y || player.y) + 8,
          color: 'rgba(137, 104, 72, 0.42)',
          timer: 0.52,
          maxTimer: 0.52,
        });
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.18);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.18);
      } else {
        current.reactivePlatformTimers[platformId] = nextTimer;
      }
    });
    Array.from(current.collapsedPlatformIds || []).forEach((platformId) => {
      const platform = getRenderablePlatforms(current).find(item => (item.id || item.label) === platformId)
        || PLATFORMS.find(item => (item.id || item.label) === platformId);
      const respawnKey = `${platformId}:respawn`;
      const nextTimer = (current.reactivePlatformTimers[respawnKey] ?? platform?.reactive?.respawn ?? 3.2) - dt;
      if (nextTimer <= 0) {
        current.collapsedPlatformIds.delete(platformId);
        delete current.reactivePlatformTimers[respawnKey];
        addCombatEffect(current, {
          type: 'environment-dust',
          x: platform?.x || player.x,
          y: (platform?.y || player.y) + 8,
          color: 'rgba(203, 139, 68, 0.42)',
          timer: 0.42,
          maxTimer: 0.42,
        });
      } else {
        current.reactivePlatformTimers[respawnKey] = nextTimer;
      }
    });
    current.routeGateCooldown = Math.max(0, current.routeGateCooldown - dt);
    if (current.discoveryEntranceActive) {
      current.attackQueued = false;
      player.vx = 0;
      player.vy = 0;
      updatePlayerAnimation(current, dt);
      if (current.discoveryEntranceTimer <= 0 && !current.discoveryEntranceHandoffStarted) {
        current.discoveryEntranceHandoffStarted = true;
        current.discoveryEntranceActive = false;
        current.completed = true;
        current.notice = DISCOVERY_ENTRANCE.handoffMessage;
        syncHud();
        onComplete?.([...current.fieldKit]);
      }
      return;
    }
    if (current.openingThresholdScene?.lockMovement) {
      const scene = current.openingThresholdScene;
      const sceneElapsed = clamp((scene.duration || 0) - (scene.timer || 0), 0, scene.duration || 0);
      const fallDelay = scene.playerFallDelay ?? OPENING_THRESHOLD_FALL_DELAY_SECONDS;
      const fallDuration = scene.playerFallDuration ?? OPENING_THRESHOLD_FALL_DURATION_SECONDS;
      const fallProgress = clamp((sceneElapsed - fallDelay) / fallDuration, 0, 1);
      const easedFall = fallProgress < 0.5
        ? 4 * fallProgress * fallProgress * fallProgress
        : 1 - Math.pow(-2 * fallProgress + 2, 3) / 2;
      const startY = scene.playerStartY ?? scene.playerY ?? player.y;
      const endY = scene.playerFallEndY ?? (GROUND_Y - player.height);
      current.attackQueued = false;
      player.vx = 0;
      player.vy = 0;
      player.x = scene.playerX ?? player.x;
      player.y = startY + (endY - startY) * easedFall;
      player.onGround = fallProgress >= 1;
      updatePlayerAnimation(current, dt);
      return;
    }
    if (current.templeThresholdTransition?.lockMovement) {
      current.attackQueued = false;
      player.vx = 0;
      player.vy = 0;
      player.onGround = true;
      player.jumpBufferTimer = 0;
      updatePlayerAnimation(current, dt);
      return;
    }
    if ((current.sceneTransition || current.forgottenMuralChamberTransition)?.lockMovement) {
      current.attackQueued = false;
      player.vx = 0;
      player.vy = 0;
      player.onGround = true;
      player.jumpBufferTimer = 0;
      updatePlayerAnimation(current, dt);
      return;
    }
    current.bossIntroPauseTimer = Math.max(0, (current.bossIntroPauseTimer || 0) - dt);
    if (current.activeGuardianChallenge || current.pendingGuardianChallenge || current.bossIntroPauseTimer > 0) {
      current.attackQueued = false;
      player.vx = 0;
      player.vy = 0;
      updatePlayerAnimation(current, dt);
      return;
    }

    // Movement
    const previousPlayer = { ...player };
    const wasGrounded = player.onGround;
    if (wasGrounded) player.coyoteTimer = COYOTE_TIME;

    let targetVx = 0;
    if (current.dodgeTimer > 0) {
      targetVx = (current.dodgeDirection || player.direction || 1) * PLAYER_DODGE_SPEED;
    } else {
      if (left) { targetVx -= MOVE_SPEED; player.direction = -1; }
      if (right) { targetVx += MOVE_SPEED; player.direction = 1; }
      if (player.venomSlowTimer > 0) targetVx *= player.venomSlowMultiplier || SCORPION_VENOM_SLOW_MULTIPLIER;
      if (current.resources.stamina > 0 && current.resources.stamina < 25) targetVx *= 0.8;
      if (!player.onGround) targetVx *= Math.max(1, upgradeEffects.airControlMultiplier || 1);
      if (current.attackWindupTimer > 0) targetVx *= 0.45;
    }
    const hasHorizontalInput = left || right;
    const acceleration = player.onGround
      ? (hasHorizontalInput ? MOVE_ACCELERATION : MOVE_DECELERATION)
      : (hasHorizontalInput ? AIR_ACCELERATION : AIR_DECELERATION);
    if (current.dodgeTimer > 0) {
      player.vx = targetVx;
    } else {
      player.vx = approach(player.vx, targetVx, acceleration * dt);
      if (current.attackRecoilTimer > 0) player.vx += -player.direction * 45 * dt * 12;
    }
    if (player.knockbackTimer > 0) {
      player.knockbackTimer = Math.max(0, player.knockbackTimer - dt);
      const knockbackProgress = player.knockbackTimer / Math.max(0.01, player.knockbackMaxTimer || 0.22);
      player.vx += player.knockbackDirection * (55 + knockbackProgress * 42.5) * knockbackMultiplier;
    }

    const jumpPressed = jump && !keys.jumpHeld;
    if (jumpPressed) player.jumpBufferTimer = JUMP_BUFFER_TIME;
    const canGroundJump = player.jumpBufferTimer > 0 && (player.onGround || player.coyoteTimer > 0);
    const openingPyramidGroundJumpMultiplier = canGroundJump
      && !current.collectedUpgrades.has('rope-launcher')
      && isOpeningPyramidAirJumpAssistAvailable(current, player, targetCivilisation)
      ? OPENING_PYRAMID_GROUND_JUMP_MULTIPLIER
      : 1;
    const openingPyramidAssistJump = player.jumpBufferTimer > 0
      && !canGroundJump
      && !current.collectedUpgrades.has('rope-launcher')
      && player.airJumpsUsed < 1
      && isOpeningPyramidAirJumpAssistAvailable(current, player, targetCivilisation);
    current.openingPyramidAssistJumpAvailable = openingPyramidAssistJump;
    const canRopeJump = player.jumpBufferTimer > 0 && !canGroundJump && current.collectedUpgrades.has('rope-launcher') && player.airJumpsUsed < 1;
    if (canGroundJump) {
      player.vy = -JUMP_SPEED * (upgradeEffects.jumpMultiplier || 1) * openingPyramidGroundJumpMultiplier;
      player.onGround = false;
      player.coyoteTimer = 0;
      player.jumpBufferTimer = 0;
      player.airJumpsUsed = 0;
      addCombatEffect(current, {
        type: 'jump-dust',
        x: player.x + player.width / 2,
        y: player.y + player.height - 6,
        direction: -player.direction,
        color: 'rgba(230, 173, 96, 0.68)',
        timer: 0.28,
        maxTimer: 0.28,
      });
      audioControls?.playExpeditionSfx?.('jump');
      audioControls?.playJump?.();
    } else if (openingPyramidAssistJump) {
      player.vy = -JUMP_SPEED * OPENING_PYRAMID_AIR_JUMP_MULTIPLIER;
      player.jumpBufferTimer = 0;
      player.airJumpsUsed += 1;
      addCombatEffect(current, {
        type: 'jump-dust',
        x: player.x + player.width / 2,
        y: player.y + player.height - 4,
        direction: -player.direction,
        color: 'rgba(251, 191, 36, 0.5)',
        timer: 0.25,
        maxTimer: 0.25,
      });
      audioControls?.playExpeditionSfx?.('jump', { volume: 0.76, playbackRate: 1.1 });
      audioControls?.playJump?.();
    } else if (canRopeJump) {
      player.vy = -JUMP_SPEED * 0.85 * (upgradeEffects.jumpMultiplier || 1);
      player.jumpBufferTimer = 0;
      player.airJumpsUsed += 1;
      addCombatEffect(current, {
        type: 'jump-dust',
        x: player.x + player.width / 2,
        y: player.y + player.height - 4,
        direction: -player.direction,
        color: 'rgba(125, 211, 252, 0.58)',
        timer: 0.25,
        maxTimer: 0.25,
      });
      audioControls?.playExpeditionSfx?.('jump', { volume: 0.8, playbackRate: 1.08 });
      audioControls?.playJump?.();
    }
    if (!jump && keys.jumpHeld && player.vy < 0) {
      player.vy *= JUMP_CUT_MULTIPLIER;
      player.jumpCutFeedbackTimer = JUMP_CUT_FEEDBACK_TIME;
    }
    keys.jumpHeld = jump;

    const previousPlayerX = player.x;
    player.vy += GRAVITY * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    updatePlayerAnimation(current, dt);

    // Bounds
    player.x = clamp(player.x, 0, WORLD_WIDTH - player.width);
    if (isTempleThresholdHallScene(current)) {
      player.x = clamp(
        player.x,
        TEMPLE_THRESHOLD_HALL_BOUNDS.minX,
        TEMPLE_THRESHOLD_HALL_BOUNDS.maxX - player.width,
      );
    } else if (isMummificationChamberScene(current)) {
      player.x = clamp(
        player.x,
        MUMMIFICATION_CHAMBER_BOUNDS.minX,
        MUMMIFICATION_CHAMBER_BOUNDS.maxX - player.width,
      );
    } else if (isForgottenMuralChamberScene(current)) {
      player.x = clamp(
        player.x,
        FORGOTTEN_MURAL_CHAMBER_BOUNDS.minX,
        FORGOTTEN_MURAL_CHAMBER_BOUNDS.maxX - player.width,
      );
    } else if (isScribeLockedChamberScene(current)) {
      player.x = clamp(
        player.x,
        SCRIBE_CHAMBER_BOUNDS.minX,
        SCRIBE_CHAMBER_BOUNDS.maxX - player.width,
      );
    }
    const activeBossDomainBounds = current.bossDomain
      && !current.defeatedMiniBosses.has(current.bossDomain.bossId)
      ? current.bossDomain
      : null;
    if (activeBossDomainBounds) {
      player.x = clamp(
        player.x,
        (activeBossDomainBounds.arenaStart ?? 0) + 16,
        Math.max(
          (activeBossDomainBounds.arenaStart ?? 0) + 16,
          (activeBossDomainBounds.arenaEnd ?? WORLD_WIDTH) - player.width - 16,
        ),
      );
    }
    const movementBlocker = getRenderablePlatforms(current)
      .filter(isJourneyBlockerPlatform)
      .find(blocker => resolveJourneyBlockerPlatformCollision(player, previousPlayer, blocker));
    if (movementBlocker) {
      player.x = clamp(player.x, 0, WORLD_WIDTH - player.width);
    }
    const liveScorpionNestBlocker = getLiveScorpionNestBlockers(current)
      .find(blocker => rectsOverlap(player, blocker));
    if (liveScorpionNestBlocker) {
      const movedRight = player.x >= previousPlayerX;
      player.x = movedRight
        ? liveScorpionNestBlocker.x - player.width - 3
        : liveScorpionNestBlocker.x + liveScorpionNestBlocker.width + 3;
      player.x = clamp(player.x, 0, WORLD_WIDTH - player.width);
      player.vx = movedRight ? Math.min(0, player.vx) : Math.max(0, player.vx);
      current.notice = 'The scorpion nest blocks the route. Destroy it to clear the path.';
      current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.55);
      if ((current.scorpionNestBlockNoticeCooldown || 0) <= 0) {
        current.scorpionNestBlockNoticeCooldown = 0.85;
        audioControls?.playExpeditionSfx?.('gateBlocked');
      }
    }
    if (current.arrivalThresholdActive) {
      player.x = clamp(player.x, ARRIVAL_THRESHOLD_LEFT_BOUND, ARRIVAL_THRESHOLD_RIGHT_BOUND - player.width);
      const arrivalCenterX = player.x + player.width / 2;
      player.y = getArrivalThresholdGroundY(arrivalCenterX) - player.height;
      player.vy = 0;
      player.onGround = true;
      player.airJumpsUsed = 0;
      updateArrivalThresholdTrial(current, player, dt);
      // Room wakes up once Asha reaches the breach (the refusal beat) and stays awake.
      if (current.arrivalThresholdLeftInspected) {
        current.arrivalThresholdWakeProgress = clamp(
          (current.arrivalThresholdWakeProgress || 0) + dt / ARRIVAL_THRESHOLD_WAKE_SECONDS,
          0,
          1,
        );
      }
      current.trapProjectiles = [];
      current.currentSectionId = 'arrival-threshold';
      current.lastSectionId = 'desert-entry';
      current.resources.stamina = Math.max(current.resources.stamina, Math.min(maxStamina, 35));
      current.arrivalThresholdNoticeTimer = Math.max(0, (current.arrivalThresholdNoticeTimer || 0) - dt);
      if (current.arrivalThresholdExitTransition) {
        const transition = current.arrivalThresholdExitTransition;
        transition.timer = Math.min(transition.duration, (transition.timer || 0) + dt);
        const progress = clamp(transition.timer / transition.duration, 0, 1);
        const eased = 1 - ((1 - progress) * (1 - progress));
        player.x = clamp(
          transition.startX + (transition.endX - transition.startX) * eased,
          ARRIVAL_THRESHOLD_LEFT_BOUND,
          ARRIVAL_THRESHOLD_RIGHT_BOUND - player.width,
        );
        player.y = getArrivalThresholdGroundY(player.x + player.width / 2) - player.height;
        player.vx = 0;
        player.vy = 0;
        player.onGround = true;
        player.direction = -1;
        current.notice = 'Asha climbs through the broken scarab breach.';
        if (progress >= 1) {
          player.x = DESERT_ENTRY_EXTERIOR_SPAWN_X;
          player.y = GROUND_Y - player.height;
          player.direction = 1;
          current.arrivalThresholdActive = false;
          current.arrivalThresholdExitTransition = null;
          current.openingCinematic = null;
          current.openingThresholdScene = null;
          current.openingSphinxEncounter = null;
          current.sectionTransition = null;
          current.sectionTransitionTimer = 0;
          current.currentSectionId = 'desert-entry';
          current.lastSectionId = 'desert-entry';
          current.environmentEvent = null;
          current.environmentEventTimer = 0;
          current.dynamicEnvironmentEvent = null;
          current.dynamicEnvironmentEventTimer = 0;
          current.cinematicEvent = null;
          current.cinematicTimer = 0;
          current.cameraX = 0;
          current.targetCameraX = 0;
          if (!current.openingConfrontationSeen) {
            startOpeningCinematic({ speechEnabled: true, fromArrivalThreshold: true });
          } else {
            // Establish origin: she emerges in the Duat desert with the dying scarab
            // breach she just climbed through right behind her (the seal prop sits at
            // the far-left of desert-entry). Hold the camera on the spawn (no forward
            // pan, which would scroll the breach off-screen) and name it, so the player
            // reads where she came from instead of just standing there.
            current.notice = OPENING_ARRIVAL_AFTERSHOCK_NOTICE;
            current.cinematicEvent = {
              id: 'desert-entry-breach-emergence',
              name: 'Asha',
              message: 'Behind you, the scarab breach seals shut. No road leads back — only forward, into the cracked mirror of Egypt.',
              temporary: true,
            };
            current.cinematicTimer = 4.4;
          }
        }
        syncHud();
        return;
      }
      if (!current.arrivalThresholdLeftInspected && arrivalCenterX <= ARRIVAL_THRESHOLD_LEFT_INSPECT_X) {
        current.arrivalThresholdLeftInspected = true;
        current.notice = ARRIVAL_THRESHOLD_LEFT_OBJECTIVE_LINE;
        current.cinematicEvent = {
          id: 'arrival-threshold-way-back',
          name: 'Asha',
          message: ARRIVAL_THRESHOLD_LEFT_LINES.join(' '),
          temporary: true,
        };
        current.cinematicTimer = 3.1;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.0);
        if (!current.arrivalThresholdTrial) {
          current.arrivalThresholdTrial = createArrivalThresholdTrialState();
        }
        audioControls?.playExpeditionSfx?.('gateBlocked', { volume: 0.58 });
      }
      if (!current.arrivalThresholdMarkingsInspected && arrivalCenterX >= ARRIVAL_THRESHOLD_MARKINGS_INSPECT_X) {
        current.arrivalThresholdMarkingsInspected = true;
        current.notice = ARRIVAL_THRESHOLD_GATE_OBJECTIVE_LINE;
        current.cinematicEvent = {
          id: 'arrival-threshold-funerary-markings',
          name: 'Asha',
          message: ARRIVAL_THRESHOLD_MARKING_LINES.join(' '),
          temporary: true,
        };
        current.cinematicTimer = 3.4;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.0);
        audioControls?.playExpeditionSfx?.('lostSiteAirShift', { volume: 0.46 });
      }
      if (!current.arrivalThresholdGateTriggered && arrivalCenterX <= ARRIVAL_THRESHOLD_FORWARD_GATE_TRIGGER_X) {
        if (!current.arrivalThresholdTrial?.completed) {
          current.notice = ARRIVAL_THRESHOLD_TRIAL_EXIT_LOCKED_LINE;
          current.cinematicEvent = {
            id: 'arrival-threshold-trial-incomplete',
            name: 'Asha',
            message: ARRIVAL_THRESHOLD_TRIAL_EXIT_LOCKED_LINE,
            temporary: true,
          };
          current.cinematicTimer = 2.2;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.6);
          player.vx = Math.max(player.vx, 80);
          audioControls?.playExpeditionSfx?.('gateBlocked', { volume: 0.58 });
          syncHud();
          return;
        }
        current.arrivalThresholdGateTriggered = true;
        player.vx = 0;
        player.vy = 0;
        current.arrivalThresholdExitTransition = {
          timer: 0,
          duration: ARRIVAL_THRESHOLD_EXIT_WALK_SECONDS,
          startX: player.x,
          endX: ARRIVAL_THRESHOLD_EXIT_WALK_END_X - player.width / 2,
        };
        current.cinematicEvent = {
          id: 'arrival-threshold-doorway-crossing',
          name: 'Asha',
          message: 'The broken scarab breach opens toward the Duat. Asha climbs through.',
          temporary: true,
        };
        current.cinematicTimer = ARRIVAL_THRESHOLD_EXIT_WALK_SECONDS;
        current.notice = 'Asha climbs through the broken scarab breach.';
        audioControls?.playExpeditionSfx?.('openingThresholdFinalPulse', { volume: 0.82 });
        syncHud();
        return;
      }
      const camera = getCameraFollowTarget(current);
      current.targetCameraX = camera.targetCameraX;
      current.cameraMode = camera.mode;
      current.cameraFocusTarget = camera.focusTarget;
      if (!Number.isFinite(current.cameraX)) current.cameraX = camera.targetCameraX;
      const cameraStep = clamp(
        (current.targetCameraX - current.cameraX) * 0.16,
        -JOURNEY_CAMERA.maxStep,
        JOURNEY_CAMERA.maxStep,
      );
      current.cameraX = clampCameraX(current.cameraX + cameraStep);
      syncHud();
      return;
    }
    if (player.y > JOURNEY_VIEWPORT.height + JOURNEY_WORLD_LAYOUT.rescueFallPadding) {
      triggerJourneyRescue('The team stumbled into a ravine. Field rescue required.');
    }

    current.trapStates ??= {};
    current.trapProjectiles = (current.trapProjectiles || [])
      .map(projectile => ({
        ...projectile,
        x: projectile.x + (projectile.vx || 0) * dt,
        y: projectile.y + (projectile.vy || 0) * dt,
        ttl: (projectile.ttl || 0) - dt,
      }))
      .filter(projectile => (
        projectile.ttl > 0
        && projectile.x > -120
        && projectile.x < WORLD_WIDTH + 120
        && projectile.y > -120
        && projectile.y < CANVAS_HEIGHT + 240
      ));
    getRenderableHazards(current).forEach((hazard) => {
      if (!isReusableJourneyTrap(hazard)) return;
      const runtime = current.trapStates[hazard.id] ||= {};
      updateJourneyTrapRuntime({
        trap: hazard,
        runtime,
        triggered: false,
        dt,
      });
    });

    // Platforms
    player.onGround = false;
    let landedThisFrame = false;
    const available = [
      ...getRenderablePlatforms(current),
      ...getRenderableTrapPlatforms(current),
    ];
    available.forEach(p => {
      if (isLandingOnPlatform(player, previousPlayer, p)) {
        const landingImpact = Math.max(0, previousPlayer.vy || player.vy || 0);
        player.y = getPlatformSurfaceYAtX(p, player.x + player.width / 2) - player.height;
        player.vy = 0;
        player.onGround = true;
        player.coyoteTimer = COYOTE_TIME;
        player.airJumpsUsed = 0;
        landedThisFrame = true;
        player.lastLandingImpact = landingImpact;
        if (p.challengeId) {
          current.activePlatformChallenge = {
            id: p.challengeId,
            failY: p.challengeFailY || (GROUND_Y - 18),
            message: p.challengeFailMessage || 'You missed the platform route. Retry from the checkpoint.',
          };
        }
        if (p.challengeComplete && current.activePlatformChallenge?.id === p.challengeComplete) {
          current.activePlatformChallenge = null;
          addCombatEffect(current, {
            type: 'environment-dust',
            x: player.x + player.width / 2,
            y: p.y + 5,
            text: 'SAFE',
            color: 'rgba(56, 189, 248, 0.62)',
            timer: 0.36,
            maxTimer: 0.36,
          });
        }
        if (p.reactive) {
          const platformId = p.id || p.label;
          if (!current.reactivePlatformTimers[platformId]) {
            current.reactivePlatformTimers[platformId] = p.reactive.delay || 1.4;
            current.triggeredEnvironmentIds.add(platformId);
            current.recentEnvironmentInteractions = [
              {
                id: platformId,
                type: p.reactive.type,
                reason: 'platform pressure',
                message: `${p.label} is shifting.`,
              },
              ...(current.recentEnvironmentInteractions || []),
            ].slice(0, 6);
          }
          addCombatEffect(current, {
            type: 'platform-crack',
            x: player.x + player.width / 2,
            y: p.y + 6,
            color: 'rgba(137, 104, 72, 0.36)',
            timer: 0.24,
            maxTimer: 0.24,
          });
          current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.05);
          current.cameraShakeStrength = Math.max(current.cameraShakeStrength, p.reactive.shake || 0.1);
        }
      }
    });

    const playerCenterXForRamp = player.x + player.width / 2;
    const playerFootY = player.y + player.height;
    const templeApproachRampClimbRequested = jump || playerFootY < TEMPLE_APPROACH_RAMP_LOWER_PATH_FOOT_Y;
    if (
      getJourneySceneId(current) === JOURNEY_SCENE_IDS.EXTERIOR
      && playerCenterXForRamp >= TEMPLE_APPROACH_RAMP_ASSIST.minX
      && playerCenterXForRamp <= TEMPLE_APPROACH_RAMP_ASSIST.maxX
      && player.vy >= -25
      && templeApproachRampClimbRequested
    ) {
      const rampSurfaceY = getTempleApproachRampSurfaceY(playerCenterXForRamp);
      const snapDistance = playerFootY - rampSurfaceY;
      if (
        snapDistance >= -TEMPLE_APPROACH_RAMP_ASSIST.maxSnapUp
        && snapDistance <= TEMPLE_APPROACH_RAMP_ASSIST.maxSnapDown
      ) {
        player.y = rampSurfaceY - player.height;
        player.vy = 0;
        player.onGround = true;
        player.coyoteTimer = COYOTE_TIME;
        player.airJumpsUsed = 0;
        landedThisFrame = true;
      }
    }

    if (landedThisFrame && !wasGroundedRef.current) {
      player.landingFeedbackTimer = Math.min(0.22, 0.1 + (player.lastLandingImpact || 0) / 9000);
      addCombatEffect(current, {
        type: 'landing-dust',
        x: player.x + player.width / 2,
        y: player.y + player.height - 5,
        direction: player.direction,
        color: 'rgba(210, 150, 78, 0.62)',
        timer: 0.34,
        maxTimer: 0.34,
      });
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.05);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, Math.min(0.12, (player.lastLandingImpact || 0) / 5200));
      audioControls?.playExpeditionSfx?.('land');
    }
    if (
      current.activePlatformChallenge
      && !current.failed
      && player.vy >= 0
      && player.y + player.height >= current.activePlatformChallenge.failY
    ) {
      const challengeMessage = current.activePlatformChallenge.message;
      current.activePlatformChallenge = null;
      triggerJourneyRescue('Missed platform jump. Field rescue required.', challengeMessage);
    }
    const lostBridgeDeckBounds = getLostBridgeDeckBounds(available);
    if (lostBridgeDeckBounds && !current.failed && !isInteriorChamberScene(current)) {
      const playerCenterX = player.x + player.width / 2;
      const playerFootY = player.y + player.height;
      const ravineFallLeft = lostBridgeDeckBounds.left + LOST_BRIDGE_RAVINE_FALL_SIDE_PAD;
      const ravineFallRight = lostBridgeDeckBounds.right - LOST_BRIDGE_RAVINE_FALL_SIDE_PAD * 0.74;
      const belowBridgeDeck = playerFootY >= lostBridgeDeckBounds.y + LOST_BRIDGE_RAVINE_FALL_DEPTH;
      if (playerCenterX >= ravineFallLeft && playerCenterX <= ravineFallRight && belowBridgeDeck) {
        current.activePlatformChallenge = null;
        addCombatEffect(current, {
          type: 'environment-dust',
          x: playerCenterX,
          y: Math.min(GROUND_Y + 16, playerFootY),
          text: 'RAVINE',
          color: 'rgba(120, 53, 15, 0.62)',
          timer: 0.42,
          maxTimer: 0.42,
        });
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.18);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.16);
        triggerJourneyRescue(
          'Asha fell into the ravine. Field rescue required.',
          'The bridge drops into a ravine here. Climb to the bridge deck before crossing.',
        );
      }
    }
    if (player.onGround && Math.abs(player.vx) > 20) {
      const groundSpeed = Math.abs(player.vx);
      const isRunFeedback = groundSpeed > 190;
      footstepTimerRef.current -= dt;
      if (footstepTimerRef.current <= 0) {
        audioControls?.playExpeditionSfx?.('footstepSand');
        footstepTimerRef.current = isRunFeedback ? 0.36 : 0.44;
      }
      player.movementDustTimer -= dt;
      if (player.movementDustTimer <= 0 && groundSpeed > 90) {
        addCombatEffect(current, {
          type: 'movement-dust',
          x: player.x + player.width / 2,
          y: player.y + player.height - 4,
          direction: player.vx >= 0 ? -1 : 1,
          color: 'rgba(203, 139, 68, 0.5)',
          timer: 0.28,
          maxTimer: 0.28,
        });
        player.movementDustTimer = isRunFeedback ? 0.16 : 0.22;
      }
    } else {
      footstepTimerRef.current = 0;
    }
    wasGroundedRef.current = player.onGround;

    const inInteriorChamberScene = isInteriorChamberScene(current);

    // Sections
    const section = getSectionForX(player.x);
    if (!inInteriorChamberScene && !current.arrivalThresholdActive && section.id !== current.lastSectionId) {
      const atmosphere = SECTION_ATMOSPHERES[section.id];
      const sectionTitle = getSectionDisplayTitle(section.id) || atmosphere.title;
      current.sectionTransition = { id: section.id, name: getSectionDisplayName(section.id), message: sectionTitle };
      current.sectionTransitionTimer = 2.6;
      current.lastSectionId = section.id;
      current.notice = sectionTitle;
      audioControls?.playLevelUp?.();
    }

    const reachedCheckpoint = !inInteriorChamberScene && !current.arrivalThresholdActive && getRenderableCheckpoints()
      .filter(checkpoint => player.x + player.width / 2 >= checkpoint.x)
      .at(-1);
    if (reachedCheckpoint && current.activeCheckpoint.id !== reachedCheckpoint.id) {
      current.activeCheckpoint = reachedCheckpoint;
      current.resources.stamina = Math.max(current.resources.stamina, Math.min(maxStamina, 85));
      current.notice = `Checkpoint reached: ${reachedCheckpoint.name}.`;
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.025);
      addRewardPulse('checkpoint-pulse', reachedCheckpoint.x, reachedCheckpoint.y || (GROUND_Y - 46), 'Checkpoint reached', {
        color: '#38bdf8',
        fill: 'rgba(56, 189, 248, 0.1)',
        radius: 52,
        timer: 0.62,
      });
      audioControls?.playSuccess?.();
    }

    // Events
    if (!inInteriorChamberScene && !current.arrivalThresholdActive) ENVIRONMENT_EVENTS.forEach(ev => {
      const triggerRange = ev.dynamic ? 145 : 70;
      const crossedEvent = (previousPlayer.x <= ev.x && player.x >= ev.x) || (previousPlayer.x >= ev.x && player.x <= ev.x);
      if (!current.triggeredEnvironmentEventIds.has(ev.id) && (Math.abs(player.x - ev.x) < triggerRange || crossedEvent)) {
        current.triggeredEnvironmentEventIds.add(ev.id);
        if (ev.id === 'air-wrongness') {
          audioControls?.playExpeditionSfx?.('airWrongness');
          return;
        }
        if (ev.dynamic || ev.card === false) {
          current.dynamicEnvironmentEvent = ev;
          current.dynamicEnvironmentEventTimer = ev.duration;
        } else {
          current.environmentEvent = ev;
          current.environmentEventTimer = ev.duration;
        }
        if (ev.id === 'forgotten-mural-looter-shadow') {
          current.forgottenMuralLooterSeen = true;
        }
        current.cameraShakeTimer = ev.duration * 0.4;
        current.cameraShakeStrength = ev.shake;
        current.notice = ev.message;
        if (ev.sfxKey) {
          audioControls?.playExpeditionSfx?.(ev.sfxKey, { volume: ev.sfxVolume ?? 1 });
        } else if (ev.id === 'scarab-queen-lair-dread-wind') {
          audioControls?.playExpeditionSfx?.('scarabQueenApproachAtmosphere');
        } else if (ev.type === 'shrine-glow') {
          audioControls?.playExpeditionStinger?.('evidenceDiscovery');
        } else {
          audioControls?.playTransition?.();
        }
      }
    });

    // Recurring underground pressure pulse — active once player passes the pyramid into open desert
    // X(500) = Math.round(500 * 5.65) = 2825
    if (!inInteriorChamberScene && !current.arrivalThresholdActive && player.x > 2825) {
      if (current.pressurePulseTimer == null) {
        current.pressurePulseTimer = 20 + Math.random() * 25;
      }
      current.pressurePulseTimer -= dt;
      if (current.pressurePulseTimer <= 0) {
        audioControls?.playExpeditionSfx?.('earthPressurePulse');
        current.pressurePulseTimer = 45 + Math.random() * 45;
      }
    } else if (player.x <= 2825) {
      current.pressurePulseTimer = null;
    }

    if (!inInteriorChamberScene && !current.arrivalThresholdActive && !current.openingThresholdScene?.lockMovement) {
      current.ambientDramaTimer ??= 24 + Math.random() * 28;
      current.ambientDramaTimer -= dt;
      if (current.ambientDramaTimer <= 0) {
        const ambientDramaSfxKey = getAmbientDramaSfxKey(current, section.id);
        if (ambientDramaSfxKey) {
          audioControls?.playExpeditionSfx?.(ambientDramaSfxKey, { volume: section.id === 'escape-sequence' ? 0.72 : 0.46 });
        }
        current.ambientDramaTimer = section.id === 'escape-sequence'
          ? 18 + Math.random() * 22
          : 34 + Math.random() * 44;
      }
    } else {
      current.ambientDramaTimer = null;
    }

    const forgottenMuralPlayerCenterX = player.x + player.width / 2;
    const forgottenMuralPlayerFootY = player.y + player.height;
    const currentSceneId = getJourneySceneId(current);
    const mummificationInteractionResult = (() => {
      if (
        currentSceneId !== JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER
        || current.sceneTransition
        || current.forgottenMuralChamberTransition
      ) {
        return null;
      }

      const playerBody = getPlayerBodyHitbox(player);
      current.mummificationChamberInspectedObjectIds ??= new Set();
      current.mummificationChamberInteraction ??= createJourneyRoomInteractionState();
      let interaction = current.mummificationChamberInteraction;
      interaction.wrongFlash ??= {};
      const inspectedObjectIds = current.mummificationChamberInspectedObjectIds;
      const ritualStep = current.mummificationChamberRitualStep || 0;

      // Tick down any wrong-target flickers + the chamber disturbance pulse.
      Object.keys(interaction.wrongFlash).forEach((id) => {
        interaction.wrongFlash[id] = Math.max(0, (interaction.wrongFlash[id] || 0) - dt);
        if (interaction.wrongFlash[id] <= 0) delete interaction.wrongFlash[id];
      });
      current.mummificationChamberDisturbanceTimer = Math.max(0, (current.mummificationChamberDisturbanceTimer || 0) - dt);

      // The chamber reacts to careless hands using the existing atmosphere systems
      // (candle flare, room dim-flash, seal pulse) plus a small shake. Anubis, cold
      // and watching, only speaks when the player keeps disturbing the room.
      const stirChamber = (strength = 1) => {
        current.mummificationChamberDisturbanceTimer = Math.max(
          current.mummificationChamberDisturbanceTimer || 0,
          MUMMIFICATION_CHAMBER_DISTURBANCE_DURATION * strength,
        );
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength || 0, 0.06 + 0.05 * strength);
        current.mummificationChamberWrongCount = (current.mummificationChamberWrongCount || 0) + 1;
        // Sparingly: a cold Anubis judgement after repeated carelessness.
        if (current.mummificationChamberWrongCount % 3 === 0) {
          const line = MUMMIFICATION_ANUBIS_WARNINGS[
            (current.mummificationChamberWrongCount / 3 - 1) % MUMMIFICATION_ANUBIS_WARNINGS.length
          ];
          current.cinematicEvent = { id: 'mummification-anubis-warning', name: 'Anubis', message: line, temporary: true };
          current.cinematicTimer = Math.max(current.cinematicTimer || 0, 2.6);
        }
      };

      const interactDown = !!keys.KeyE;
      const interactPressed = interactDown && !interaction.interactHeldPrev;
      const moving = Math.abs(player.vx) > 0.1;
      interaction.interactHeldPrev = interactDown;
      // Render hints recomputed every frame.
      interaction.activePromptId = null;
      interaction.activePrompt = null;

      const overlaps = (item) => rectsOverlap(playerBody, {
        x: current.cameraX + item.hitbox.x,
        y: item.hitbox.y,
        width: item.hitbox.width,
        height: item.hitbox.height,
      });
      const setObjectState = (id, state) => { interaction.objectStates[id] = state; };
      const isDone = (state) => [
        JOURNEY_INTERACT_OBJECT_STATES.INSPECTED,
        JOURNEY_INTERACT_OBJECT_STATES.PLACED,
        JOURNEY_INTERACT_OBJECT_STATES.USED,
        JOURNEY_INTERACT_OBJECT_STATES.COMPLETED,
      ].includes(state);
      // Helpers clone the interaction state; commit() re-binds the live object so
      // later reads (e.g. rite-completion checks) see the freshly applied change.
      const commit = (result) => {
        interaction = result.interaction;
        current.mummificationChamberInteraction = interaction;
        return result;
      };

      // Exit seal: priority overlap that stays locked until every rite is done.
      const exitSealItem = MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS.find(item => item.exitSeal);
      if (exitSealItem && overlaps(exitSealItem)) {
        if (current.mummificationChamberExitUnlocked) {
          interaction.activePromptId = exitSealItem.id;
          interaction.activePrompt = 'Exit open';
          return { id: exitSealItem.id, alreadyUnlocked: true };
        }
        interaction.activePromptId = exitSealItem.id;
        interaction.activePrompt = 'Sealed';
        if (interactPressed && (current.itemPurposeNoticeTimer || 0) <= 0) {
          current.notice = 'The seal does not trust an unfinished rite.';
          current.itemPurposeNoticeTimer = 1.35;
          audioControls?.playExpeditionSfx?.('gateBlocked');
        }
        return { id: exitSealItem.id, blocked: true };
      }

      const riteDef = getMummificationRiteByIndex(ritualStep);
      if (!riteDef) return null; // all rites complete

      // Story beat: the first time a rite with an intro line becomes active and no
      // cinematic is playing, plant it (e.g. the name was scratched out by hand).
      if (riteDef.introLine) {
        current.mummificationChamberRiteIntrosShown ??= new Set();
        if (!current.mummificationChamberRiteIntrosShown.has(riteDef.rite) && (current.cinematicTimer || 0) <= 0) {
          current.mummificationChamberRiteIntrosShown.add(riteDef.rite);
          current.cinematicEvent = { id: `mummification-rite-intro-${riteDef.rite}`, name: 'Asha', message: riteDef.introLine, temporary: true };
          current.cinematicTimer = 2.6;
          current.notice = riteDef.introLine;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.6);
        }
      }

      const advanceRiteIfComplete = (item) => {
        const done = riteDef.requires.every(id => isDone(interaction.objectStates[id]));
        if (!done) return false;
        const stepInfo = MUMMIFICATION_CHAMBER_RITUAL_STEPS[ritualStep];
        const nextStep = ritualStep + 1;
        current.mummificationChamberRitualStep = nextStep;
        // Keep the atmosphere/guidance systems progressing on the canonical objects.
        if (stepInfo?.id) inspectedObjectIds.add(stepInfo.id);
        const isComplete = isMummificationChamberComplete(nextStep);
        current.notice = riteDef.completeNotice;
        current.cinematicEvent = {
          id: isComplete ? 'mummification-chamber-ritual-complete' : `mummification-rite-${riteDef.rite}`,
          name: 'Asha',
          message: riteDef.completeLine,
          temporary: true,
        };
        current.cinematicTimer = isComplete ? 3.2 : 2.1;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, isComplete ? 2.0 : 1.1);
        current.hitStopTimer = Math.max(current.hitStopTimer, isComplete ? 0.04 : 0.022);
        addRewardPulse(item.id, current.cameraX + item.screen.x, item.screen.y,
          isComplete ? 'RITE SEALED' : (stepInfo?.pulseText || 'RITE DONE'), {
            color: isComplete ? '#5eead4' : '#facc15',
            fill: isComplete ? 'rgba(94, 234, 212, 0.12)' : 'rgba(250, 204, 21, 0.12)',
            radius: isComplete ? 72 : 48,
            timer: isComplete ? 0.9 : 0.6,
          });
        if (isComplete) {
          current.mummificationChamberPuzzleSolved = true;
          current.mummificationChamberExitUnlocked = true;
          interaction.carriedItemId = null;
          audioControls?.playLevelUp?.();
          syncHud();
        } else {
          audioControls?.playSuccess?.();
        }
        return true;
      };

      const flashWrong = (item, message) => {
        interaction.wrongFlash[item.id] = 0.55;
        if ((current.itemPurposeNoticeTimer || 0) <= 0) {
          current.notice = message;
          current.itemPurposeNoticeTimer = 1.35;
          audioControls?.playExpeditionSfx?.('gateBlocked');
          current.hitStopTimer = Math.max(current.hitStopTimer, 0.016);
          stirChamber(1);
          addCombatEffect(current, {
            type: 'environment-dust',
            x: current.cameraX + item.screen.x,
            y: item.screen.y,
            color: 'rgba(245, 158, 11, 0.6)',
            timer: 0.4,
            maxTimer: 0.4,
          });
        }
      };

      const carried = interaction.carriedItemId;
      const overlappingObjects = riteDef.objects.filter(overlaps);
      const isHoldTarget = (object) => object.role === 'apply' || object.role === 'wrap';

      // Choose the object the player can act on right now: when carrying, prefer a
      // valid hold/place target; otherwise prefer a source/inspect/activate object.
      const target = carried
        ? (overlappingObjects.find(o => isHoldTarget(o) && o.acceptsItemId === carried)
          || overlappingObjects.find(o => o.role === 'target' || o.role === 'restore')
          || overlappingObjects.find(o => o.id === carried) // returning to its source
          || overlappingObjects.find(o => isHoldTarget(o)))
        : (overlappingObjects.find(o => o.role === 'source')
          || overlappingObjects.find(o => o.role === 'inspect' && !isDone(interaction.objectStates[o.id]))
          || overlappingObjects.find(o => o.role === 'activate' && !isDone(interaction.objectStates[o.id]))
          || overlappingObjects.find(o => o.role === 'inspect' || o.role === 'activate'));

      // Hold-to-use (apply / wrap): accumulate only while stationary and held.
      if (target && isHoldTarget(target) && carried === target.acceptsItemId) {
        const duration = MUMMIFICATION_HOLD_DURATIONS[target.holdKey] || 1.5;
        const hold = commit(journeyInteractHoldTick(interaction, {
          itemId: target.id, verb: target.verb, duration, dt,
          holding: interactDown, moving,
        }));
        interaction.activePromptId = target.id;
        interaction.activePrompt = target.prompt;
        if (hold.completed) {
          setObjectState(target.id, JOURNEY_INTERACT_OBJECT_STATES.COMPLETED);
          setObjectState(carried, JOURNEY_INTERACT_OBJECT_STATES.USED);
          interaction.carriedItemId = null;
          advanceRiteIfComplete(target);
        } else if (hold.cancelled && moving && riteDef.slipNotice && (current.itemPurposeNoticeTimer || 0) <= 0) {
          // Linen slip etc. — retry only this hold, nothing else resets.
          current.notice = riteDef.slipNotice;
          current.itemPurposeNoticeTimer = 1.2;
          stirChamber(0.6);
        }
        return { id: target.id, holding: hold.reason === 'holding' };
      }

      // Expose the current prompt for rendering even when the player isn't pressing.
      if (target) {
        if (carried && target.id === carried) {
          interaction.activePrompt = 'E Put back';
        } else {
          // Hold targets still prompt with the wrong item; pressing reveals the clue.
          interaction.activePrompt = target.prompt;
        }
        interaction.activePromptId = interaction.activePrompt ? target.id : null;
      }

      if (!interactPressed || !target) {
        return target ? { id: target.id } : null;
      }
      // Each press is edge-detected (one action per key-down), so taps stay
      // responsive — no notice-timer debounce needed here.

      // Tap actions.
      // Carrying the wrong item to a hold target (e.g. the wrong oil at the table):
      // give the carried item's own clue instead of failing silently.
      if (isHoldTarget(target) && carried && carried !== target.acceptsItemId) {
        const carriedObj = MUMMIFICATION_CHAMBER_RITE_OBJECTS.find(o => o.id === carried);
        flashWrong(target, carriedObj?.wrongMessage || riteDef.wrongTargetNotice || 'That is not what this rite needs.');
        return { id: target.id, wrongHoldItem: true };
      }
      if (target.role === 'inspect' || target.role === 'activate') {
        commit(journeyInteractInspect(interaction, target));
        current.notice = target.message || `${target.label} honoured.`;
        current.itemPurposeNoticeTimer = 1.0;
        audioControls?.playSuccess?.();
        addRewardPulse(target.id, current.cameraX + target.screen.x, target.screen.y, 'HONOURED', {
          color: '#facc15', radius: 40, timer: 0.5,
        });
        advanceRiteIfComplete(target);
        return { id: target.id, inspected: true };
      }

      if (target.role === 'source') {
        if (carried && carried === target.id) {
          // Put the carried item back where it came from.
          interaction.carriedItemId = null;
          setObjectState(target.id, JOURNEY_INTERACT_OBJECT_STATES.IDLE);
          current.notice = `${target.label} set back down.`;
          current.itemPurposeNoticeTimer = 0.8;
          audioControls?.playSuccess?.();
          return { id: target.id, returned: true };
        }
        const result = commit(journeyInteractPickUp(interaction, target));
        if (!result.ok) {
          current.notice = 'Both hands are full. Place what I carry first.';
          current.itemPurposeNoticeTimer = 1.1;
          audioControls?.playExpeditionSfx?.('gateBlocked');
          return { id: target.id, handsFull: true };
        }
        current.notice = `Carrying the ${target.label}.`;
        current.itemPurposeNoticeTimer = 0.6;
        audioControls?.playSuccess?.();
        return { id: target.id, pickedUp: true };
      }

      if (target.role === 'target' || target.role === 'restore') {
        const result = commit(journeyInteractPlace(interaction, target));
        if (!result.ok) {
          flashWrong(target, riteDef.wrongTargetNotice || 'That does not belong here.');
          return { id: target.id, wrongTarget: true };
        }
        current.notice = target.message || riteDef.completeNotice;
        current.itemPurposeNoticeTimer = 0.9;
        audioControls?.playSuccess?.();
        addRewardPulse(target.id, current.cameraX + target.screen.x, target.screen.y, 'PLACED', {
          color: '#5eead4', radius: 44, timer: 0.55,
        });
        advanceRiteIfComplete(target);
        return { id: target.id, placed: true };
      }

      return { id: target.id };
    })();
    const templeThresholdEntryDoor = CHAMBER_DOOR_VISUALS_BY_ID['temple-threshold-hall-entry-door'];
    const mummificationEntryDoor = CHAMBER_DOOR_VISUALS_BY_ID['mummification-chamber-entry-door'];
    const forgottenMuralEntryDoor = CHAMBER_DOOR_VISUALS_BY_ID['forgotten-mural-entry-door'];
    const scribeEntryDoor = CHAMBER_DOOR_VISUALS_BY_ID['scribe-chamber-entry-door'];
    const templeThresholdEntryTrigger = resolveChamberEntryTrigger(templeThresholdEntryDoor) || TEMPLE_THRESHOLD_HALL_ENTRY_TRIGGER;
    const mummificationEntryTrigger = resolveChamberEntryTrigger(mummificationEntryDoor) || MUMMIFICATION_CHAMBER_ENTRY_TRIGGER;
    const forgottenMuralEntryTrigger = resolveChamberEntryTrigger(forgottenMuralEntryDoor) || FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER;
    const scribeEntryTrigger = resolveChamberEntryTrigger(scribeEntryDoor) || SCRIBE_CHAMBER_ENTRY_TRIGGER;
    const templeThresholdReturnPoint = (direction = -1) => resolveChamberReturnPoint(templeThresholdEntryDoor, direction);
    const mummificationReturnPoint = (direction = 1) => resolveChamberReturnPoint(mummificationEntryDoor, direction);
    const forgottenMuralReturnPoint = (direction = 1) => resolveChamberReturnPoint(forgottenMuralEntryDoor, direction);
    const scribeReturnPoint = (direction = 1) => resolveChamberReturnPoint(scribeEntryDoor, direction);
    const templeThresholdHallGate = ROUTE_GATES.find(gate => gate.id === 'desert-seal');
    const templeThresholdHallGateReady = !templeThresholdHallGate
      || !getGateGuidance(templeThresholdHallGate, current).activeGateLocked;

    const templeThresholdDoorwayActive = !TEMPLE_THRESHOLD_HALL_ENTRY_DISABLED_FOR_BUILD
      && scopedJourneyAssetPacks.isEgyptJourney
      && templeThresholdHallGateReady
      && !current.templeThresholdHallCleared
      && currentSceneId === JOURNEY_SCENE_IDS.EXTERIOR
      && player.onGround
      && forgottenMuralPlayerCenterX >= templeThresholdEntryTrigger.minX
      && forgottenMuralPlayerCenterX <= templeThresholdEntryTrigger.maxX
      && player.y < templeThresholdEntryTrigger.maxY
      && Math.abs(forgottenMuralPlayerFootY - templeThresholdEntryTrigger.footY) <= templeThresholdEntryTrigger.footTolerance;
    const templeThresholdExitActive = currentSceneId === JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL
      && forgottenMuralPlayerCenterX >= TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER.minX
      && forgottenMuralPlayerCenterX <= TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER.maxX
      && player.y < TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER.maxY
      && Math.abs(forgottenMuralPlayerFootY - TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER.footY) <= TEMPLE_THRESHOLD_HALL_EXIT_TRIGGER.footTolerance;
    const templeThresholdSealActive = currentSceneId === JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL
      && forgottenMuralPlayerCenterX >= TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER.minX
      && forgottenMuralPlayerCenterX <= TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER.maxX
      && player.y < TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER.maxY
      && Math.abs(forgottenMuralPlayerFootY - TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER.footY) <= TEMPLE_THRESHOLD_HALL_SEAL_TRIGGER.footTolerance;
    if (templeThresholdDoorwayActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      if (templeThresholdHallGate) current.openedRouteGateIds.add(templeThresholdHallGate.id);
      current.templeThresholdHallEntranceDiscovered = true;
      current.hiddenRoomsFound?.add('temple-threshold-hall');
      current.discoveredHiddenRouteIds?.add('temple-threshold-hall-route');
      current.sceneReturn = templeThresholdReturnPoint(player.direction || -1);
      const transition = {
        id: 'temple-threshold-hall-doorway',
        phase: 'doorway-fade',
        fromSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
        toSceneId: JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL,
        lockMovement: true,
        switched: false,
        duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
      };
      current.sceneTransition = transition;
      current.forgottenMuralChamberTransition = transition;
      current.notice = 'Asha steps into the threshold hall.';
      current.cinematicEvent = {
        id: 'temple-threshold-hall-threshold',
        name: 'Temple Approach',
        type: 'temple-threshold-hall-threshold',
        x: (templeThresholdEntryTrigger.minX + templeThresholdEntryTrigger.maxX) / 2,
        y: templeThresholdEntryTrigger.footY - 92,
        duration: 2.6,
        timer: 2.6,
        message: 'The door opens into a guarded hall.',
      };
      current.cinematicTimer = Math.max(current.cinematicTimer || 0, 2.2);
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
      addRewardPulse('temple-threshold-hall-found', current.cinematicEvent.x, current.cinematicEvent.y, 'THRESHOLD', {
        color: '#facc15',
        radius: 82,
        timer: 0.72,
      });
      audioControls?.playExpeditionStinger?.('evidenceDiscovery');
    } else if (templeThresholdSealActive && !current.templeThresholdHallCleared && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      current.templeThresholdHallCleared = true;
      current.completedObjectiveIds.add('temple-threshold-hall');
      current.notice = 'The sealed door answers. This is only the first judgement.';
      current.cinematicEvent = {
        id: 'temple-threshold-hall-seal-warning',
        name: 'Threshold Seal',
        message: 'The sealed door answers. This is only the first judgement.',
        temporary: true,
      };
      current.cinematicTimer = 3.0;
      current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.0);
      audioControls?.playExpeditionSfx?.('openingThresholdFinalPulse');
    } else if (templeThresholdExitActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      current.sceneReturn = templeThresholdReturnPoint(TEMPLE_THRESHOLD_HALL_RETURN_FALLBACK.direction);
      const transition = {
        id: 'temple-threshold-hall-exit',
        phase: 'doorway-fade',
        fromSceneId: JOURNEY_SCENE_IDS.TEMPLE_THRESHOLD_HALL,
        toSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
        lockMovement: true,
        switched: false,
        duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
      };
      current.sceneTransition = transition;
      current.forgottenMuralChamberTransition = transition;
      current.notice = 'Asha returns to the temple approach doorway.';
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
      audioControls?.playTransition?.();
    } else {
      current.templeThresholdHallActive = isTempleThresholdHallScene(current);
    }

    const mummificationChamberDoorwayActive = scopedJourneyAssetPacks.isEgyptJourney
      && currentSceneId === JOURNEY_SCENE_IDS.EXTERIOR
      && player.onGround
      && forgottenMuralPlayerCenterX >= mummificationEntryTrigger.minX
      && forgottenMuralPlayerCenterX <= mummificationEntryTrigger.maxX
      && player.y < mummificationEntryTrigger.maxY
      && Math.abs(forgottenMuralPlayerFootY - mummificationEntryTrigger.footY) <= mummificationEntryTrigger.footTolerance;
    const forgottenMuralDoorwayActive = scopedJourneyAssetPacks.isEgyptJourney
      && currentSceneId === JOURNEY_SCENE_IDS.EXTERIOR
      && player.onGround
      && forgottenMuralPlayerCenterX >= forgottenMuralEntryTrigger.minX
      && forgottenMuralPlayerCenterX <= forgottenMuralEntryTrigger.maxX
      && player.y < forgottenMuralEntryTrigger.maxY
      && Math.abs(forgottenMuralPlayerFootY - forgottenMuralEntryTrigger.footY) <= forgottenMuralEntryTrigger.footTolerance;
    const forgottenMuralChamberExitActive = currentSceneId === JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER
      && forgottenMuralPlayerCenterX >= FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER.minX
      && forgottenMuralPlayerCenterX <= FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER.maxX
      && player.y < FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER.maxY
      && Math.abs(forgottenMuralPlayerFootY - FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER.footY) <= FORGOTTEN_MURAL_CHAMBER_EXIT_TRIGGER.footTolerance;
    const mummificationChamberExitActive = currentSceneId === JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER
      && forgottenMuralPlayerCenterX >= MUMMIFICATION_CHAMBER_EXIT_TRIGGER.minX
      && forgottenMuralPlayerCenterX <= MUMMIFICATION_CHAMBER_EXIT_TRIGGER.maxX
      && player.y < MUMMIFICATION_CHAMBER_EXIT_TRIGGER.maxY
      && Math.abs(forgottenMuralPlayerFootY - MUMMIFICATION_CHAMBER_EXIT_TRIGGER.footY) <= MUMMIFICATION_CHAMBER_EXIT_TRIGGER.footTolerance;
    if (mummificationChamberDoorwayActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      current.mummificationChamberEntranceDiscovered = true;
      current.hiddenRoomsFound?.add('mummification-chamber');
      current.discoveredHiddenRouteIds?.add('mummification-chamber-route');
      current.sceneReturn = mummificationReturnPoint(player.direction || 1);
      const transition = {
        id: 'mummification-chamber-doorway',
        phase: 'doorway-fade',
        fromSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
        toSceneId: JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER,
        lockMovement: true,
        switched: false,
        duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
      };
      current.sceneTransition = transition;
      current.forgottenMuralChamberTransition = transition;
      current.notice = 'This chamber still holds power...';
      current.cinematicEvent = {
        id: 'mummification-chamber-threshold',
        name: 'Asha',
        type: 'mummification-chamber-threshold',
        x: (mummificationEntryTrigger.minX + mummificationEntryTrigger.maxX) / 2,
        y: mummificationEntryTrigger.footY - 92,
        duration: 2.6,
        timer: 2.6,
        message: 'This chamber still holds power...',
      };
      current.cinematicTimer = Math.max(current.cinematicTimer || 0, 2.2);
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
      addRewardPulse('collection-complete', current.cinematicEvent.x, current.cinematicEvent.y, 'CHAMBER FOUND', {
        color: '#facc15',
        radius: 82,
        timer: 0.72,
      });
      audioControls?.playExpeditionStinger?.('evidenceDiscovery');
    } else if (mummificationChamberExitActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      if (!current.mummificationChamberExitUnlocked) {
        if ((current.itemPurposeNoticeTimer || 0) <= 0) {
          current.notice = 'The entrance is sealed. I need to solve the chamber first.';
          current.itemPurposeNoticeTimer = 1.6;
          audioControls?.playExpeditionSfx?.('gateBlocked');
        }
      } else if (!mummificationInteractionResult?.unlocked) {
        current.sceneReturn = mummificationReturnPoint(MUMMIFICATION_CHAMBER_RETURN_FALLBACK.direction);
        const transition = {
          id: 'mummification-chamber-exit',
          phase: 'doorway-fade',
          fromSceneId: JOURNEY_SCENE_IDS.MUMMIFICATION_CHAMBER,
          toSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
          lockMovement: true,
          switched: false,
          duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
          timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        };
        current.sceneTransition = transition;
        current.forgottenMuralChamberTransition = transition;
        current.notice = 'Asha returns to the mummification chamber doorway.';
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
        audioControls?.playTransition?.();
      }
    } else if (forgottenMuralDoorwayActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      current.sceneReturn = forgottenMuralReturnPoint(player.direction || 1);
      const transition = {
        id: 'forgotten-mural-chamber-doorway',
        phase: 'doorway-fade',
        fromSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
        toSceneId: JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER,
        lockMovement: true,
        switched: false,
        duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
      };
      current.sceneTransition = transition;
      current.forgottenMuralChamberTransition = transition;
      current.notice = 'Asha steps through the hidden doorway.';
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
      audioControls?.playExpeditionStinger?.('evidenceDiscovery');
    } else if (forgottenMuralChamberExitActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      current.sceneReturn = forgottenMuralReturnPoint(FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK.direction);
      const transition = {
        id: 'forgotten-mural-chamber-exit',
        phase: 'doorway-fade',
        fromSceneId: JOURNEY_SCENE_IDS.FORGOTTEN_MURAL_CHAMBER,
        toSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
        lockMovement: true,
        switched: false,
        duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
      };
      current.sceneTransition = transition;
      current.forgottenMuralChamberTransition = transition;
      current.notice = 'Asha returns to the mural chamber doorway.';
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
      audioControls?.playTransition?.();
    } else {
      current.forgottenMuralChamberActive = isForgottenMuralChamberScene(current);
    }

    const scribeDoorwayActive = scopedJourneyAssetPacks.isEgyptJourney
      && currentSceneId === JOURNEY_SCENE_IDS.EXTERIOR
      && player.onGround
      && forgottenMuralPlayerCenterX >= scribeEntryTrigger.minX
      && forgottenMuralPlayerCenterX <= scribeEntryTrigger.maxX
      && player.y < scribeEntryTrigger.maxY
      && Math.abs(forgottenMuralPlayerFootY - scribeEntryTrigger.footY) <= scribeEntryTrigger.footTolerance;
    const scribeChamberExitActive = currentSceneId === JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER
      && forgottenMuralPlayerCenterX >= SCRIBE_CHAMBER_EXIT_TRIGGER.minX
      && forgottenMuralPlayerCenterX <= SCRIBE_CHAMBER_EXIT_TRIGGER.maxX
      && player.y < SCRIBE_CHAMBER_EXIT_TRIGGER.maxY
      && Math.abs(forgottenMuralPlayerFootY - SCRIBE_CHAMBER_EXIT_TRIGGER.footY) <= SCRIBE_CHAMBER_EXIT_TRIGGER.footTolerance;
    if (scribeDoorwayActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      current.sceneReturn = scribeReturnPoint(player.direction || -1);
      current.sceneTransition = {
        id: 'scribe-locked-chamber-doorway',
        phase: 'doorway-fade',
        fromSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
        toSceneId: JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER,
        lockMovement: true,
        switched: false,
        duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
      };
      current.notice = 'Asha steps through the sealed scribe doorway.';
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
      audioControls?.playExpeditionStinger?.('evidenceDiscovery');
    } else if (scribeChamberExitActive && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      if (!current.scribeChamberExitUnlocked) {
        if ((current.itemPurposeNoticeTimer || 0) <= 0) {
          current.notice = current.scribeChamberTabletInspected
            ? 'The exit stays sealed. The glowing wall message still needs to be decoded.'
            : 'The exit stays sealed. I need to inspect the translation tablet first.';
          current.itemPurposeNoticeTimer = 1.6;
          audioControls?.playExpeditionSfx?.('gateBlocked');
        }
      } else {
        current.sceneReturn = scribeReturnPoint(SCRIBE_CHAMBER_RETURN_FALLBACK.direction);
        current.sceneTransition = {
          id: 'scribe-locked-chamber-exit',
          phase: 'doorway-fade',
          fromSceneId: JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER,
          toSceneId: JOURNEY_SCENE_IDS.EXTERIOR,
          lockMovement: true,
          switched: false,
          duration: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
          timer: FORGOTTEN_MURAL_CHAMBER_TRANSITION_DURATION,
        };
        current.notice = 'Asha steps through the opened scribe door.';
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
        audioControls?.playTransition?.();
      }
    } else {
      current.scribeChamberActive = isScribeLockedChamberScene(current);
    }

    if (currentSceneId === JOURNEY_SCENE_IDS.SCRIBE_LOCKED_CHAMBER && !(current.sceneTransition || current.forgottenMuralChamberTransition)) {
      const playerBody = getPlayerBodyHitbox(player);
      if (!current.scribeChamberTabletInspected && rectsOverlap(playerBody, SCRIBE_CHAMBER_TABLET_REGION)) {
        current.scribeChamberTabletInspected = true;
        current.notice = 'A translation tablet. Name, witness, and record signs repeat around the scratched wall.';
        current.cinematicEvent = {
          id: 'scribe-chamber-tablet',
          name: 'Translation Tablet',
          message: 'Name = identity. Witness = record. Queen = protector. Door = passage.',
          temporary: true,
        };
        current.cinematicTimer = 3;
        addRewardPulse('scribe-tablet-pulse', SCRIBE_CHAMBER_TABLET_REGION.x + SCRIBE_CHAMBER_TABLET_REGION.width / 2, SCRIBE_CHAMBER_TABLET_REGION.y, 'TABLET READ', {
          color: '#facc15',
          fill: 'rgba(250, 204, 21, 0.12)',
          radius: 46,
          timer: 0.72,
        });
        audioControls?.playSuccess?.();
      }
      if (rectsOverlap(playerBody, SCRIBE_CHAMBER_WALL_REGION) && !current.scribeChamberPuzzleSolved && !current.activeGuardianChallenge) {
        if (!current.scribeChamberTabletInspected) {
          if ((current.itemPurposeNoticeTimer || 0) <= 0) {
            current.notice = 'The wall is not decoration. A name has been scratched away, but I need the translation tablet first.';
            current.itemPurposeNoticeTimer = 1.6;
          }
        } else {
          current.scribeChamberWallInspected = true;
          current.notice = 'This record keeps disagreeing with the warning. If I read the name-line correctly, the door may answer.';
          current.activeGuardianChallenge = {
            ...SCRIBE_CHAMBER_PUZZLE,
            questions: SCRIBE_CHAMBER_PUZZLE.questions.map(question => ({ ...question })),
            currentIndex: 0,
            correctCount: 0,
            selectedAnswerIndex: null,
            feedback: null,
            answers: [],
            completed: false,
            modifier: null,
            resultMessage: null,
          };
          audioControls?.playTransition?.();
          syncHud();
          return;
        }
      }
    }

    if (!inInteriorChamberScene && scopedJourneyAssetPacks.isEgyptJourney && !current.scarabSealActivated) {
      const scarabSealHitbox = {
        x: SCARAB_SEAL_TRIGGER.x - SCARAB_SEAL_TRIGGER.width / 2,
        y: SCARAB_SEAL_TRIGGER.y - SCARAB_SEAL_TRIGGER.height / 2,
        width: SCARAB_SEAL_TRIGGER.width,
        height: SCARAB_SEAL_TRIGGER.height,
      };
      if (rectsOverlap(getPlayerBodyHitbox(player), scarabSealHitbox)) {
        const thresholdAlreadyIntroduced = Boolean(current.openingConfrontationSeen);
        current.scarabSealActivated = true;
        current.collapsedPlatformIds.add('opening-scarab-seal-summit');
        current.triggeredEnvironmentEventIds.add(SCARAB_SEAL_TRIGGER.id);
        const thresholdLines = [
          { speaker: 'Asha', text: ARRIVAL_THRESHOLD_SPAWN_LINE, at: 0.8 },
          { speaker: 'Asha', text: 'The world fell away.', at: 3.0 },
          { speaker: 'Asha', text: 'I have to find where the seal brought me.', at: 6.0 },
        ];
        if (!thresholdAlreadyIntroduced) {
          current.openingThresholdScene = {
            id: 'opening-false-scarab-threshold',
            phase: 'false-discovery',
            lockMovement: true,
            playerX: player.x,
            playerY: player.y,
            playerStartY: player.y,
            playerFallEndY: GROUND_Y - player.height,
            playerFallDelay: OPENING_THRESHOLD_FALL_DELAY_SECONDS,
            playerFallDuration: OPENING_THRESHOLD_FALL_DURATION_SECONDS,
            playerOnGround: false,
            focusX: SCARAB_SEAL_TRIGGER.x,
            transitionTargetSectionId: 'desert-entry',
            stairwellRevealLine: SCARAB_SEAL_TRIGGER.stairwellRevealLine,
            lines: thresholdLines,
            duration: OPENING_THRESHOLD_SCENE_DURATION,
            timer: OPENING_THRESHOLD_SCENE_DURATION,
            fallSfxPlayed: false,
            stoneShiftSfxPlayed: false,
            finalPulseSfxPlayed: false,
          };
        }
        if (thresholdAlreadyIntroduced) {
          current.openingConfrontationSeen = true;
        }
        current.openingSphinxEncounter = null;
        current.sectionTransition = null;
        current.sectionTransitionTimer = 0;
        current.environmentEvent = null;
        current.environmentEventTimer = 0;
        current.dynamicEnvironmentEvent = {
          id: SCARAB_SEAL_TRIGGER.id,
          sectionId: SCARAB_SEAL_TRIGGER.sectionId,
          type: SCARAB_SEAL_TRIGGER.eventType,
          x: SCARAB_SEAL_TRIGGER.x,
          name: SCARAB_SEAL_TRIGGER.eventName,
          message: SCARAB_SEAL_TRIGGER.sealEmphasisMessage,
          duration: SCARAB_SEAL_TRIGGER.duration,
          shake: SCARAB_SEAL_TRIGGER.shake,
          card: false,
        };
        current.dynamicEnvironmentEventTimer = SCARAB_SEAL_TRIGGER.duration;
        current.openingCameraRevealDuration = SCARAB_SEAL_TRIGGER.cameraRevealDuration;
        current.openingCameraRevealTimer = Math.max(current.openingCameraRevealTimer || 0, SCARAB_SEAL_TRIGGER.cameraRevealDuration);
        current.cinematicEvent = thresholdAlreadyIntroduced ? {
          id: 'scarab-seal-anubis-warning',
          name: SCARAB_SEAL_TRIGGER.eventName,
          message: `${SCARAB_SEAL_TRIGGER.messages.slice(0, 8).join(' ')} ${SCARAB_SEAL_TRIGGER.objectiveEchoLine}`,
          temporary: true,
        } : null;
        current.cinematicTimer = thresholdAlreadyIntroduced ? 5.4 : 0;
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, SCARAB_SEAL_TRIGGER.duration * 0.45);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, SCARAB_SEAL_TRIGGER.shake);
        current.notice = thresholdAlreadyIntroduced ? SCARAB_SEAL_TRIGGER.objectiveEchoLine : '';
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.12);
        addRewardPulse('scarab-seal-awakening', SCARAB_SEAL_TRIGGER.x, SCARAB_SEAL_TRIGGER.y, SCARAB_SEAL_TRIGGER.sealPulseLabel, {
          color: '#38bdf8',
          fill: 'rgba(56, 189, 248, 0.14)',
          radius: SCARAB_SEAL_TRIGGER.sealPulseRadius,
          timer: SCARAB_SEAL_TRIGGER.sealPulseDuration,
        });
        audioControls?.playExpeditionSfx?.(openingAtmosphereSfxKey);
      }
    }

    getActiveHiddenRoutes().forEach(route => {
      if (current.discoveredHiddenRouteIds?.has(route.id)) return;
      if (rectsOverlap(getPlayerBodyHitbox(player), route)) {
        const access = getRouteAccessState(route, current);
        if (access.locked) {
          current.notice = route.lockedMessage || 'This hidden route needs better expedition equipment.';
          current.hazardFeedbackCooldown = Math.max(current.hazardFeedbackCooldown, 0.12);
          return;
        }
        current.discoveredHiddenRouteIds.add(route.id);
        const routeMomentName = route.name?.includes('Mural')
          ? 'Forgotten Mural Alcove discovered'
          : route.name?.includes('Shrine')
          ? 'Ancient Shrine Discovered'
          : route.name?.includes('Archive')
            ? 'Hidden Archive Found'
            : 'Secret Route Discovered';
        current.notice = route.discoveryMessage || `${routeMomentName}.`;
        current.cinematicEvent = {
          id: `${route.id}-discovered`,
          name: routeMomentName,
          message: route.storySummary || route.rewardHint,
          temporary: true,
        };
        current.dynamicEnvironmentEvent = {
          id: `${route.id}-atmosphere`,
          type: route.id === 'desert-upper-survey-route' || routeMomentName === 'Ancient Shrine Discovered' ? 'shrine-glow' : 'dust-gust',
          x: route.x + route.width / 2,
          name: routeMomentName,
          duration: 2.4,
          message: route.rewardHint,
        };
        current.dynamicEnvironmentEventTimer = 2.4;
        current.cinematicTimer = 2.6;
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.08);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.14);
        addCombatEffect(current, {
          type: 'secret-found',
          x: route.x + route.width / 2,
          y: route.y + Math.min(42, route.height / 2),
          text: 'SECRET ROUTE',
          color: '#facc15',
          fill: 'rgba(250, 204, 21, 0.12)',
          radius: 58,
          timer: 0.72,
          maxTimer: 0.72,
        });
        audioControls?.playExpeditionStinger?.('evidenceDiscovery');
        audioControls?.playSuccess?.();
      }
    });

    const currentSectionId = getSectionForX(player.x).id;
    const activeLevelEntrance = !inInteriorChamberScene
      && !(current.sceneTransition || current.forgottenMuralChamberTransition)
      && STAGE_ENTRANCE_FEATURES.find(feature => (
      feature.levelTransition
      && feature.from === currentSectionId
      && !current.templeThresholdTransition
      && isStageEntranceAvailableForState(feature, current)
    ));
    const activeLevelGate = activeLevelEntrance
      ? ROUTE_GATES.find(gate => gate.id === activeLevelEntrance.routeGateId)
      : null;
    if (
      activeLevelEntrance
      && activeLevelGate
      && Number.isFinite(activeLevelEntrance.x)
      && scopedJourneyAssetPacks.isEgyptJourney
      && player.x + player.width / 2 >= getStageEntranceTriggerX(activeLevelEntrance)
    ) {
      const guidance = getGateGuidance(activeLevelGate, current);
      if (!guidance.activeGateLocked) {
        current.openedRouteGateIds.add(activeLevelGate.id);
        current.notice = guidance.openMessage;
        current.cinematicEvent = {
          id: `${activeLevelGate.id}-opened`,
          name: guidance.activeGateName,
          message: guidance.openMessage,
          temporary: true,
        };
        current.cinematicTimer = 2.4;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.2);
        addRewardPulse('route-gate-open', activeLevelGate.x + activeLevelGate.width / 2, activeLevelGate.y + 64, 'SEAL OPEN', {
          color: '#38bdf8',
          fill: 'rgba(56, 189, 248, 0.13)',
          radius: 66,
          timer: 0.78,
        });
        audioControls?.playExpeditionSfx?.('gateUnlock');
        audioControls?.playExpeditionStinger?.('gateUnlock');
        startTempleThresholdTransition(current, activeLevelGate, activeLevelEntrance);
        return;
      }
    }

    // Collectibles
    TOOL_LAYOUT.forEach(toolPos => {
      if (inInteriorChamberScene) return;
      if (!current.collectedToolIds.has(toolPos.id) && rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(toolPos, { width: 30, height: 30 }))) {
        current.collectedToolIds.add(toolPos.id);
        const tool = JOURNEY_TOOLS.find(t => t.id === toolPos.id);
        current.fieldKit.push(tool);
        current.notice = `Field tool added: ${tool.name}. This will help during excavation.`;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.8);
        audioControls?.playExpeditionSfx?.('pickupTool');
      }
    });

    RELIC_SHARDS.forEach(shard => {
      if (inInteriorChamberScene) return;
      if (shard.routeId && !isRouteRewardAccessible(shard.routeId, current)) return;
      if (!current.collectedShardIds.has(shard.id) && rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(shard, { width: 24, height: 24 }))) {
        current.collectedShardIds.add(shard.id);
        current.relicShardCount += 1;
        audioControls?.playExpeditionSfx?.('pickupShard');
        const shardGateProgress = getActiveShardGateProgress(current);
        addRewardPulse('shard-pickup', shard.x, shard.y, '+1 SHARD', {
          color: '#f59e0b',
          fill: 'rgba(245, 158, 11, 0.14)',
          radius: shard.hidden ? 32 : 24,
          timer: 0.46,
        });
        if (shard.timelineId) {
          if (!(current.collectedTimelineEvidenceIds instanceof Set)) current.collectedTimelineEvidenceIds = new Set();
          if (!Array.isArray(current.romeTimelineEvidenceOrder)) current.romeTimelineEvidenceOrder = [];
          if (!current.collectedTimelineEvidenceIds.has(shard.timelineId)) {
            current.collectedTimelineEvidenceIds.add(shard.timelineId);
            current.romeTimelineEvidenceOrder.push(shard.timelineId);
          }
          const timelineGate = ROUTE_GATES.find(gate => gate.requires?.timelineSequence?.length);
          const timelineProgress = timelineGate
            ? getTimelineRequirementProgress(timelineGate.requires.timelineSequence, current)
            : null;
          current.romeTimelineSolved = Boolean(timelineProgress?.complete);
          current.notice = timelineProgress?.complete
            ? 'The archive sequence locks into place: Republic, Caesar, Augustus, Empire, split.'
            : `${shard.timelineNotice || `${shard.shortName || shard.label || 'Rome evidence'} recovered.`} (${timelineProgress?.found ?? 1}/${timelineProgress?.required ?? 5})`;
          current.hitStopTimer = Math.max(current.hitStopTimer, 0.025);
        } else if (shard.hidden) {
          current.notice = shardGateProgress
            ? `Hidden Relic Shard ${Math.min(current.relicShardCount, shardGateProgress.required)}/${shardGateProgress.required}: needed for ${shardGateProgress.gateName}.`
            : 'Hidden relic shard recovered. Spend these at Base Camp.';
          current.hitStopTimer = Math.max(current.hitStopTimer, 0.025);
        } else {
          current.notice = shardGateProgress
            ? `Relic Shard ${Math.min(current.relicShardCount, shardGateProgress.required)}/${shardGateProgress.required}: needed for ${shardGateProgress.gateName}.`
            : 'Relic shard recovered. Spend these at Base Camp.';
        }
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.8);
        const shouldEchoOpeningFirstShard = scopedJourneyAssetPacks.isEgyptJourney
          && current.scarabSealActivated
          && !current.openingFirstShardEchoSeen
          && current.relicShardCount === 1
          && shardGateProgress?.gate?.id === 'temple-approach-seal';
        if (shouldEchoOpeningFirstShard) {
          current.openingFirstShardEchoSeen = true;
          current.notice = SCARAB_SEAL_TRIGGER.firstShardEchoLine;
          current.cinematicEvent = {
            id: 'opening-first-shard-echo',
            name: 'Asha',
            message: SCARAB_SEAL_TRIGGER.firstShardEchoLine,
            temporary: true,
          };
          current.cinematicTimer = 2.4;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.2);
        }
      }
    });

    getActiveSecretCollectibles().forEach(secret => {
      if (!isEntityActiveInScene(secret, current)) return;
      if (current.collectedSecretIds?.has(secret.id)) return;
      if (secret.routeId && !isRouteRewardAccessible(secret.routeId, current)) return;
      if (rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(secret, { width: 32, height: 32 }))) {
        current.collectedSecretIds.add(secret.id);
        const restorationStatus = getRoomRestorationStatus(secret, current);
        const forgottenMuralPuzzleReady = restorationStatus.puzzleReady;
        const restoredRoom = restorationStatus.roomRestored;
        const restoration = restorationStatus.restoration || secret;
        const restorationReaction = getAnubisRestorationReaction(restorationStatus, current);
        if (restoredRoom && restorationStatus.config?.restoredStateKey) {
          current[restorationStatus.config.restoredStateKey] = true;
        }
        if (forgottenMuralPuzzleReady) {
          current.forgottenMuralRelicSlidePuzzleOpen = true;
          current.forgottenMuralRelicSlidePuzzleTiles = createForgottenMuralRelicSlidePuzzleTiles();
          current.forgottenMuralRelicSlidePuzzleMoves = 0;
          keysRef.current = {};
        }
        current.notice = forgottenMuralPuzzleReady
          ? 'The scarab mural has been broken into pieces. Not destroyed. Rearranged.'
          : restoredRoom
          ? (restoration?.restoreMessage || restorationStatus.config?.fallbackRestoreMessage || 'Asha restores a sacred room fragment set.')
          : (secret.discoveryMessage || 'Collection Piece Recovered.');
        current.cinematicEvent = {
          id: forgottenMuralPuzzleReady ? 'forgotten-mural-relic-slide-puzzle-opened' : restoredRoom ? `${secret.id}-restored` : `${secret.id}-collected`,
          name: forgottenMuralPuzzleReady ? 'Asha' : restoredRoom ? 'Anubis' : 'Secret Found',
          message: forgottenMuralPuzzleReady
            ? 'If the image is wrong, the story is wrong.'
            : restoredRoom
            ? (restorationReaction || 'Do not mistake this for trust.')
            : `${secret.name} has been added to the field journal.`,
          temporary: true,
        };
        current.cinematicTimer = forgottenMuralPuzzleReady ? 2.8 : restoredRoom ? 3.2 : 2.8;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, forgottenMuralPuzzleReady ? 2.4 : restoredRoom ? 2.6 : 1.8);
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.04);
        addCombatEffect(current, {
          type: 'secret-found',
          x: secret.x,
          y: secret.y,
          text: forgottenMuralPuzzleReady ? 'RELIC READY' : restoredRoom ? (restorationStatus.config?.effectText || 'ROOM RESTORED') : 'SECRET FOUND',
          color: secret.color || '#facc15',
          fill: 'rgba(250, 204, 21, 0.12)',
          radius: 48,
          timer: 0.76,
          maxTimer: 0.76,
        });
        markSecretSetProgress(secret);
      }
    });

    LORE_TABLETS.forEach(tablet => {
      if (inInteriorChamberScene) return;
      if (current.collectedTabletIds?.has(tablet.id)) return;
      if (tablet.routeId && !isRouteRewardAccessible(tablet.routeId, current)) return;
      if (rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(tablet, { width: 30, height: 30 }))) {
        current.collectedTabletIds.add(tablet.id);
        const loreMessage = tablet.text.replace(/^Tablet found:\s*/i, '');
        current.notice = tablet.text;
        current.cinematicEvent = {
          id: `${tablet.id}-lore`,
          name: 'Lore found',
          message: loreMessage,
          temporary: true,
        };
        current.cinematicTimer = 2.6;
        addCombatEffect(current, {
          type: 'secret-found',
          x: tablet.x,
          y: tablet.y,
          text: 'LORE RECOVERED',
          color: '#facc15',
          radius: 42,
          timer: 0.62,
          maxTimer: 0.62,
        });
      }
    });

    UPGRADES.forEach(u => {
      if (inInteriorChamberScene) return;
      if (!current.collectedUpgrades.has(u.id) && rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(u, { width: 36, height: 36 }))) {
        if (u.shardCost && current.relicShardCount < u.shardCost) {
          current.notice = `${u.name}: need ${u.shardCost} relic shards to open this optional cache.`;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.8);
          return;
        }
        if (u.shardCost) {
          current.relicShardCount = Math.max(0, current.relicShardCount - u.shardCost);
        }
        if (u.rewardShards) {
          current.relicShardCount += u.rewardShards;
        }
        current.collectedUpgrades.add(u.id);
        audioControls?.playExpeditionSfx?.('pickupUpgrade');
        current.notice = u.cacheReward
          ? `Cache opened! Upgrade Voucher earned: +${u.rewardShards} relic shards for Base Camp.`
          : `Expedition Upgrade Acquired: ${u.name}.`;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.1);
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
        addRewardPulse('upgrade-pulse', u.x, u.y, u.cacheReward ? 'VOUCHER' : 'UPGRADE', {
          color: '#2563eb',
          fill: 'rgba(37, 99, 235, 0.1)',
          radius: 48,
          timer: 0.7,
        });
      }
    });

    OBJECTIVE_MARKERS.forEach(m => {
      if (inInteriorChamberScene) return;
      if (!current.collectedObjectiveIds.has(m.id) && rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox(m, { width: 30, height: 30 }))) {
        current.collectedObjectiveIds.add(m.id);
        const progress = getObjectiveProgress(m.sectionId, current);
        if (m.id === 'switch-1') {
          current.notice = 'Stone mechanism activated. Switches 1/3. A return plinth rises.';
          current.cinematicEvent = {
            id: 'switch-1-raised-return-plinth',
            name: 'Stone Mechanism',
            message: 'A return plinth rises ahead.',
            temporary: true,
          };
          current.cinematicTimer = 2.2;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.1);
          current.hitStopTimer = Math.max(current.hitStopTimer, 0.045);
          addRewardPulse('switch-1-response', m.x, m.y, 'MECHANISM', {
            color: m.color || '#92400e',
            fill: 'rgba(146, 64, 14, 0.12)',
            radius: 58,
            timer: 0.7,
          });
          addCombatEffect(current, {
            type: 'environment-dust',
            x: m.x + 96,
            y: m.y - 6,
            text: 'RISE',
            color: 'rgba(203, 139, 68, 0.64)',
            timer: 0.78,
            maxTimer: 0.78,
          });
        } else if (progress.count >= progress.total) {
          current.completedObjectiveIds.add(m.sectionId);
          current.notice = `Objective Complete: ${progress.title}`;
          current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
          addRewardPulse('collection-complete', m.x, m.y, 'OBJECTIVE COMPLETE', {
            color: '#22c55e',
            fill: 'rgba(34, 197, 94, 0.1)',
            radius: 54,
            timer: 0.68,
          });
        } else {
          current.notice = `Objective Progress: ${progress.count}/${progress.total} ${progress.itemLabel}.`;
          addRewardPulse('reward-pulse', m.x, m.y, 'RECORDED', {
            color: m.color || '#b45309',
            radius: 36,
            timer: 0.46,
          });
        }
      }
    });

    (current.bossKeyItems || []).forEach((keyItem) => {
      if (inInteriorChamberScene) return;
      if (!keyItem.dropped || keyItem.collected) return;
      if (rectsOverlap(getPlayerBodyHitbox(player), getCollectibleHitbox({ x: keyItem.x - 16, y: keyItem.y - 18 }, { width: 32, height: 36 }))) {
        keyItem.collected = true;
        current.collectedBossKeyIds.add(keyItem.id);
        const rewardMoment = buildBossRewardMoment(current, keyItem, 'recovered');
        current.postBossReward = rewardMoment;
        current.postBossRewardTimer = 5.2;
        current.notice = `${rewardMoment.title} ${rewardMoment.nextObjective}`;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.2);
        current.cinematicEvent = {
          id: `${keyItem.id}-recovered`,
          name: 'Boss Reward Recovered',
          message: rewardMoment.nextObjective,
          temporary: true,
        };
        current.cinematicTimer = 3.2;
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.045);
        addRewardPulse('boss-reward-pulse', keyItem.x, keyItem.y, 'REWARD SECURED', {
          color: keyItem.color || '#b45309',
          fill: 'rgba(180, 83, 9, 0.12)',
          radius: 68,
          timer: 0.86,
        });
      }
    });

    // Hazards
    if (current.hazardCooldown <= 0) {
      getRenderableHazards(current).forEach(h => {
        if (rectsOverlap(getPlayerBodyHitbox(player), getHazardHitbox(h))) {
          if (isReusableJourneyTrap(h)) {
            const trap = normalizeJourneyTrap(h);
            const runtime = current.trapStates[trap.id] ||= {};
            const previousPhase = runtime.phase || 'armed';
            const previousCooldown = runtime.cooldown || 0;
            const result = updateJourneyTrapRuntime({
              trap,
              runtime,
              triggered: true,
              dt: 0,
            });
            if (result.projectile) {
              current.trapProjectiles.push(result.projectile);
              current.notice = trap.message;
              current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.1);
              current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.08);
              current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.12);
              audioControls?.playExpeditionSfx?.('trapReset', { volume: 0.8 });
            }
            const activated = previousPhase === 'armed' && (trap.type !== 'dart-launcher' || previousCooldown <= 0);
            if (activated && trap.type !== 'dart-launcher') {
              const trapStaminaLoss = Math.ceil((trap.damage || 0) * (upgradeEffects.hazardStaminaMultiplier || 1));
              if (trapStaminaLoss) current.resources.stamina = Math.max(0, current.resources.stamina - trapStaminaLoss);
              current.hazardCooldown = Math.max(current.hazardCooldown, trap.cooldown || 0.9);
              current.lastHazardHit = {
                id: trap.id,
                name: trap.name,
                message: trap.message,
                staminaDelta: -trapStaminaLoss,
                timeDelta: 0,
              };
              current.lastStaminaDelta = -trapStaminaLoss;
              current.lastStaminaLossReason = trap.message;
              current.staminaFeedbackTimer = trapStaminaLoss ? 1.25 : 0.65;
              current.notice = `${trap.message}${trapStaminaLoss ? ` -${trapStaminaLoss} stamina.` : ''}`;
              current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.4);
              current.cameraShakeTimer = Math.max(current.cameraShakeTimer, trap.type === 'collapsing-stone-floor' ? 0.24 : 0.16);
              current.cameraShakeStrength = Math.max(current.cameraShakeStrength, trap.type === 'collapsing-stone-floor' ? 0.28 : 0.18);
              trap.linkedObjectIds.forEach(id => current.triggeredEnvironmentIds.add(id));
              addCombatEffect(current, {
                type: trap.type === 'collapsing-stone-floor' ? 'platform-crack' : 'environment-dust',
                x: trap.x + trap.width / 2,
                y: trap.y + trap.height,
                color: trap.type === 'hidden-sand-pit' ? 'rgba(203, 139, 68, 0.54)' : 'rgba(137, 104, 72, 0.5)',
                timer: 0.46,
                maxTimer: 0.46,
              });
              audioControls?.playExpeditionSfx?.(trap.type === 'hidden-sand-pit' ? 'trapSandTrigger' : 'trapReset', { volume: 0.9 });
              if (current.resources.stamina === 0) current.enduranceExhausted = true;
            }
            return;
          }
          const staminaLoss = Math.ceil((h.penalty?.stamina || 0) * (upgradeEffects.hazardStaminaMultiplier || 1));
          const timeLoss = h.penalty?.time || 0;
          const visual = HAZARD_VISUALS[h.id] || {};
          if (h.pushToStart) {
            const startCheckpoint = getRenderableCheckpoints()[0];
            player.x = startCheckpoint.x;
            player.y = startCheckpoint.y - player.height;
            player.vx = 0;
            player.vy = 0;
            player.onGround = true;
            current.cameraX = clampCameraX(player.x - CANVAS_WIDTH * 0.42);
            current.targetCameraX = current.cameraX;
            current.hazardCooldown = 1.4;
            current.lastHazardHit = {
              id: h.id,
              name: h.name,
              message: h.message,
              staminaDelta: 0,
              timeDelta: -timeLoss,
            };
            if (timeLoss) current.resources.time = Math.max(0, current.resources.time - timeLoss);
            current.lastStaminaDelta = 0;
            current.lastStaminaLossReason = h.message;
            current.staminaFeedbackTimer = 0.9;
            current.notice = h.message;
            current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.28);
            current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.26);
            const hazardSfx = h.type === 'arrow-trap' && scopedJourneyAssetPacks.isChinaJourney ? 'chinaCrossbowTrap' : getHazardSfxKey(h);
            audioControls?.playExpeditionSfx?.(hazardSfx, { volume: 1.04 });
            return;
          }
          if (staminaLoss) current.resources.stamina = Math.max(0, current.resources.stamina - staminaLoss);
          if (timeLoss) current.resources.time = Math.max(0, current.resources.time - timeLoss);
          current.hazardCooldown = 1.2;
          current.lastHazardHit = {
            id: h.id,
            name: h.name,
            message: visual.message || h.message,
            staminaDelta: -staminaLoss,
            timeDelta: -timeLoss,
          };
          current.lastStaminaDelta = -staminaLoss;
          current.lastStaminaLossReason = staminaLoss ? (visual.message || h.message) : '';
          current.staminaFeedbackTimer = staminaLoss ? 1.25 : 0.65;
          if (staminaLoss) {
            player.hitFeedbackTimer = 0.85;
            player.lastDamage = staminaLoss;
            player.knockbackTimer = Math.max(player.knockbackTimer, 0.12 * knockbackMultiplier);
            player.knockbackDirection = player.direction >= 0 ? -1 : 1;
          }
          current.cameraShakeTimer = Math.max(current.cameraShakeTimer, staminaLoss ? 0.16 : 0.08);
          current.cameraShakeStrength = Math.max(current.cameraShakeStrength, staminaLoss ? 0.28 : 0.16);
          const dangerWarning = staminaLoss && isLowStamina(current, maxStamina)
            ? ` ${LOW_STAMINA_WARNING}`
            : '';
          if (staminaLoss && current.resources.stamina === 0) current.enduranceExhausted = true;
          current.notice = `${visual.message || h.message}${staminaLoss ? ` -${staminaLoss} Endurance.` : timeLoss ? ` -${timeLoss} seconds.` : ''}${dangerWarning}`;
          current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.4);
          const hazardSfx = h.type === 'arrow-trap' && scopedJourneyAssetPacks.isChinaJourney ? 'chinaCrossbowTrap' : getHazardSfxKey(h);
          audioControls?.playExpeditionSfx?.(hazardSfx, {
            volume: staminaLoss ? 0.96 : 0.82,
          });
          audioControls?.playError?.();
          if (current.resources.stamina <= 0) triggerJourneyRescue(FIELD_RESCUE_STAMINA_REASON);
        }
      });
    }

    // Attacks
    let attackRect = null;
    const attackActionReady = current.attackCooldown <= 0
      && current.attackWindupTimer <= 0
      && current.attackTimer <= 0
      && current.attackRecoilTimer <= 0;
    if (current.attackQueued && attackActionReady) {
      const finisherAllowed = !current.enduranceExhausted;
      const queuedAttackType = current.attackQueuedType === PLAYER_ATTACK_TYPES.HEAVY
        ? PLAYER_ATTACK_TYPES.HEAVY
        : PLAYER_ATTACK_TYPES.LIGHT;
      const isHeavyAttack = queuedAttackType === PLAYER_ATTACK_TYPES.HEAVY;
      const heavyFollowupPrimed = isHeavyAttack && finisherAllowed && (current.attackQueuedHeavyFollowupPrimed || (current.attackComboWindowTimer > 0 && current.attackComboLanded));
      const attackProfile = getPlayerAttackProfile({
        queuedAttackType,
        player,
        heavyFollowupPrimed,
      });
      const nextAttackSequenceIndex = attackProfile.sequenceIndex;
      const isFinisher = nextAttackSequenceIndex === PLAYER_COMBO_MAX_STEP;
      const isAirAttack = attackProfile.attackType === PLAYER_AIR_ATTACK_TYPE;
      const activeAttackType = attackProfile.attackType;
      const attackTiming = attackProfile.timing;
      current.attackQueued = false;
      current.attackQueuedType = PLAYER_ATTACK_TYPES.LIGHT;
      current.attackQueuedHeavyFollowupPrimed = false;
      current.attackQueuedBufferTimer = 0;
      current.attackType = activeAttackType;
      current.attackRange = attackProfile.range;
      current.attackHeight = attackProfile.height;
      current.attackBackReach = attackProfile.backReach;
      current.attackYOffset = attackProfile.yOffset;
      current.attackDamage = attackProfile.damage;
      current.attackWindupDuration = attackTiming.windup;
      current.attackSwingDuration = attackTiming.swing;
      current.attackRecoilDuration = attackTiming.recoil;
      current.attackWindupTimer = attackTiming.windup;
      current.attackTimer = 0;
      current.attackRecoilTimer = 0;
      current.attackPhase = 'windup';
      current.attackCooldown = attackTiming.cooldown;
      current.attackSequenceIndex = nextAttackSequenceIndex;
      current.attackComboStep = nextAttackSequenceIndex;
      current.attackComboLanded = false;
      current.attackComboPreserved = false;
      current.attackComboFinisherActive = heavyFollowupPrimed;
      current.heavyFollowupReadyTimer = 0;
      current.heavyFollowupCueTimer = 0;
      current.attackHitIds.clear();
      current.attackRewarded = false;
      current.lastAttackResult = 'started';
      current.shieldedHitFeedback = '';
      applyAttackStaminaCost(attackProfile.staminaCost ?? PLAYER_ATTACK_STAMINA_COST, isAirAttack ? 'Air strike' : 'Attack swing');
      if (!isAirAttack && isHeavyAttack && !heavyFollowupPrimed) applyAttackStaminaCost(PLAYER_ATTACK_FINISHER_EXTRA_STAMINA_COST, 'Heavy swing');
      if (!isAirAttack && isFinisher) applyAttackStaminaCost(PLAYER_ATTACK_FINISHER_EXTRA_STAMINA_COST, 'Finisher swing');
      if (isAirAttack) {
        player.vy = Math.max(player.vy || 0, attackProfile.downwardVelocity || 0);
        player.vx += (player.direction || 1) * (attackProfile.forwardBoost || 0);
      }
      addCombatEffect(current, {
        type: 'attack-burst',
        x: player.x + player.width / 2 + player.direction * 12,
        y: isAirAttack ? player.y + player.height * 0.66 : player.y + 23,
        direction: player.direction,
        color: isAirAttack ? '#7dd3fc' : (isFinisher ? '#fbbf24' : '#fde68a'),
        timer: isAirAttack ? 0.2 : (isFinisher ? 0.32 : 0.22),
        maxTimer: isAirAttack ? 0.2 : (isFinisher ? 0.32 : 0.22),
      });
      audioControls?.playExpeditionSfx?.(isAirAttack ? 'attackSwing2' : isFinisher ? 'attackFinisher' : isHeavyAttack ? 'attackSwing2' : 'attackSwing1', isAirAttack ? { volume: 0.82, playbackRate: 1.16 } : undefined);
      audioControls?.playAction?.();
    }
    if (current.attackTimer > 0) {
      attackRect = getAttackBox(
        player,
        current.attackRange || PLAYER_ATTACK_RANGE,
        current.attackHeight || PLAYER_ATTACK_HEIGHT,
        player.direction,
        current.attackYOffset || 0,
        current.attackBackReach ?? PLAYER_ATTACK_BACK_REACH,
      );
      current.playerAttackBox = attackRect;
    } else {
      current.playerAttackBox = null;
    }

    ENVIRONMENT_INTERACTIONS.forEach((interaction) => {
      if (inInteriorChamberScene) return;
      if (current.brokenEnvironmentIds?.has(interaction.id)) return;
      if (interaction.oneShot && current.triggeredEnvironmentIds?.has(interaction.id)) return;
      const interactionBox = {
        x: interaction.x,
        y: interaction.y,
        width: interaction.width,
        height: interaction.height,
      };
      const touching = rectsOverlap(getPlayerBodyHitbox(player), interactionBox);
      const struck = attackRect && rectsOverlap(attackRect, interactionBox);
      if (!touching && !struck) return;

      if (!current.triggeredEnvironmentIds.has(interaction.id)) {
        recordEnvironmentInteraction(current, interaction, struck ? 'struck' : 'touched');
        current.notice = interaction.message;
        addCombatEffect(current, {
          type: interaction.type === 'breakable-crate' ? 'environment-debris' : 'environment-dust',
          x: interaction.x + interaction.width / 2,
          y: interaction.y + interaction.height / 2,
          color: interaction.type === 'breakable-crate' ? 'rgba(245, 158, 11, 0.62)' : 'rgba(203, 139, 68, 0.48)',
          timer: 0.42,
          maxTimer: 0.42,
        });
      }
      if (interaction.type === 'breakable-crate' && struck) {
        current.brokenEnvironmentIds.add(interaction.id);
        current.hitStopTimer = Math.max(current.hitStopTimer, 0.035);
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.06);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.1);
        audioControls?.playExpeditionSfx?.('enemyHit', { volume: 0.55, playbackRate: 1.25 });
      } else if (['loose-rocks', 'collapsing-bridge'].includes(interaction.type)) {
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.06);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, interaction.type === 'collapsing-bridge' ? 0.14 : 0.08);
      }
    });

    const applyPlayerDamage = (amount, message, direction = 1, source = 'enemy', options = {}) => {
      if (player.invulnerable > 0 || player.damageCooldownTimer > 0) return;
      const sourceKnockbackMultiplier = options.knockbackMultiplier ?? 1;
      const effectiveKnockbackMultiplier = knockbackMultiplier * sourceKnockbackMultiplier;
      const newStamina = current.resources.stamina - amount;
      current.resources.stamina = Math.max(0, newStamina);
      if (current.resources.stamina === 0) current.enduranceExhausted = true;
      player.invulnerable = INVULNERABLE_DURATION;
      player.damageCooldownTimer = INVULNERABLE_DURATION + 0.34;
      player.hitFeedbackTimer = 0.75;
      player.impactShakeTimer = Math.max(player.impactShakeTimer || 0, PLAYER_HIT_SCREEN_SHAKE_DURATION);
      player.lastDamage = amount;
      player.lastDamageSource = source;
      player.lastDamageTime = Date.now();
      player.knockbackMaxTimer = Math.max(0.06, 0.12 * effectiveKnockbackMultiplier);
      player.knockbackTimer = player.knockbackMaxTimer;
      player.knockbackDirection = direction;
      player.vx = approach(player.vx, direction * 95 * effectiveKnockbackMultiplier, 160);
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.075);
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.2);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.4);
      current.notice = `${message} -${amount} Endurance.${isLowStamina(current, maxStamina) ? ` ${LOW_STAMINA_WARNING}` : ''}`;
      current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.4);
      current.lastAttackResult = 'player-hit';
      resetPlayerCombo(current);
      addCombatEffect(current, {
        type: 'player-hit',
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        direction,
        color: '#f87171',
      });
      addCombatEffect(current, {
        type: 'knockback-dust',
        x: player.x + player.width / 2,
        y: player.y + player.height - 4,
        direction: -direction,
        color: 'rgba(137, 104, 72, 0.38)',
        timer: 0.32,
        maxTimer: 0.32,
      });
      audioControls?.playExpeditionSfx?.('playerHit');
      if (!scopedJourneyAssetPacks.isChinaJourney && !scopedJourneyAssetPacks.isRomeJourney) {
        audioControls?.playExpeditionSfx?.('combatDangerHit', { volume: Math.min(1.12, 0.78 + amount / 28) });
        audioControls?.playExpeditionSfx?.('ashaHurtBreath', { volume: amount >= 8 ? 0.72 : 0.5 });
      }
      audioControls?.playError?.();
      if (options.canOverwhelm && newStamina < 0) triggerJourneyRescue(FIELD_RESCUE_STAMINA_REASON);
    };

    current.trapProjectiles = (current.trapProjectiles || []).filter((projectile) => {
      if (!rectsOverlap(getPlayerBodyHitbox(player), projectile)) return true;
      const direction = projectile.direction === 'left' ? -1 : projectile.direction === 'right' ? 1 : player.direction >= 0 ? -1 : 1;
      applyPlayerDamage(projectile.damage || 6, 'Hidden dart trap struck Asha', direction, projectile.trapId || 'dart-launcher', {
        knockbackMultiplier: 0.7,
      });
      return false;
    });

    const applyPlayerVenomSlow = (sourceEnemy, pattern) => {
      const damageDirection = ((player.x + player.width / 2) >= (sourceEnemy.x + sourceEnemy.width / 2)) ? 1 : -1;
      applyPlayerDamage(pattern.staminaDamage || SCORPION_VENOM_STAMINA_DAMAGE, `${sourceEnemy.name} venom hit Asha`, damageDirection, sourceEnemy.name, {
        knockbackMultiplier: 0.35,
      });
      player.venomSlowTimer = Math.max(player.venomSlowTimer || 0, pattern.slowDuration || SCORPION_VENOM_SLOW_DURATION);
      player.venomSlowMultiplier = pattern.slowMultiplier || SCORPION_VENOM_SLOW_MULTIPLIER;
      player.vx *= player.venomSlowMultiplier;
      current.notice = `${sourceEnemy.name} venom clipped Asha. -${pattern.staminaDamage || SCORPION_VENOM_STAMINA_DAMAGE} Endurance and movement slowed.`;
      current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.25);
      current.lastAttackResult = 'player-slowed';
      addCombatEffect(current, {
        type: 'venom-slow',
        x: player.x + player.width / 2,
        y: player.y + player.height * 0.42,
        footY: player.y + player.height + 5,
        radius: 34,
        timer: 0.92,
        maxTimer: 0.92,
      });
      audioControls?.playExpeditionSfx?.('enemyHit', { volume: 0.5, playbackRate: 0.72 });
    };

    const applyEnemyStomp = (enemy) => {
      enemy.stunTimer = 0.55;
      enemy.hitFlash = 0.18;
      enemy.attackWindup = 0;
      enemy.attackTimer = 0;
      enemy.attackReady = false;
      enemy.attackCooldown = Math.max(enemy.attackCooldown, 0.45);
      enemy.attackRecovery = 0.35;
      enemy.vulnerabilityTimer = Math.max(enemy.vulnerabilityTimer || 0, 0.25);
      enemy.shieldTimer = 0;
      if (enemy.type === 'scorpion-nest') {
        enemy.knockbackTimer = 0;
        enemy.knockbackDirection = 0;
      } else {
        enemy.knockbackTimer = 0.18;
        enemy.knockbackDirection = player.direction;
      }
      player.vy = -JUMP_SPEED * 0.42;
      player.onGround = false;
      player.coyoteTimer = 0;
      player.jumpBufferTimer = 0;
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.045);
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.05);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.08);
      addCombatEffect(current, {
        type: 'combat-impact',
        x: enemy.x + enemy.width / 2,
        y: enemy.y,
        direction: player.direction,
        color: '#7dd3fc',
      });
      audioControls?.playExpeditionSfx?.('jump', { volume: 0.75, playbackRate: 1.08 });
      current.notice = `${enemy.name} bounced away. Use J or K to defeat it.`;
    };

    const applyScarabVault = (enemy) => {
      const vaultOutcome = getScarabVaultOutcome({ jumpSpeed: JUMP_SPEED });
      enemy.stunTimer = Math.max(enemy.stunTimer || 0, vaultOutcome.enemyStunTimer);
      enemy.hitFlash = Math.max(enemy.hitFlash || 0, 0.24);
      enemy.attackWindup = 0;
      enemy.attackTimer = 0;
      enemy.attackReady = false;
      enemy.attackCooldown = Math.max(enemy.attackCooldown || 0, vaultOutcome.attackCooldown);
      enemy.attackRecovery = Math.max(enemy.attackRecovery || 0, vaultOutcome.attackRecovery);
      enemy.vulnerabilityTimer = Math.max(enemy.vulnerabilityTimer || 0, vaultOutcome.vulnerabilityTimer);
      enemy.shieldTimer = 0;
      enemy.knockbackTimer = 0.2;
      enemy.knockbackDirection = player.direction;
      enemy.selectedAbility = 'vaulted-charge';
      enemy.selectedAbilityReason = 'Asha vaulted the charge';
      enemy.targetReason = enemy.selectedAbilityReason;
      player.vy = vaultOutcome.playerVy;
      player.onGround = false;
      player.coyoteTimer = 0;
      player.jumpBufferTimer = 0;
      current.hitStopTimer = Math.max(current.hitStopTimer, vaultOutcome.hitStopTimer);
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, vaultOutcome.cameraShakeTimer);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, vaultOutcome.cameraShakeStrength);
      current.lastAttackResult = vaultOutcome.lastAttackResult;
      if (vaultOutcome.notice) {
        current.notice = vaultOutcome.notice;
        current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.2);
      }
      addCombatEffect(current, {
        type: 'combat-impact',
        x: enemy.x + enemy.width / 2,
        y: enemy.y,
        direction: player.direction,
        color: '#facc15',
      });
      addCombatEffect(current, {
        type: 'sand-skid',
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        direction: -(enemy.attackDirection || enemy.direction || 1),
        color: 'rgba(202, 138, 4, 0.45)',
        timer: 0.34,
        maxTimer: 0.34,
      });
      addCombatEffect(current, {
        type: 'enemy-counter-window',
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height * 0.48,
        color: '#facc15',
        timer: 0.46,
        maxTimer: 0.46,
      });
      audioControls?.playExpeditionSfx?.('jump', { volume: 0.82, playbackRate: 1.16 });
    };

    // Enemies
    if (enemiesDisabled) {
      current.enemies.forEach(e => {
        e.attackWindup = 0;
        e.attackTimer = 0;
        e.attackReady = false;
        e.attackRecovery = 0;
        e.vulnerabilityTimer = 0;
        e.shieldTimer = 0;
        e.knockbackTimer = 0;
        e.aggroMemoryTimer = 0;
        if (e.defeated) updateEnemyDefeatedVisibility(e, dt);
      });
    } else current.enemies.forEach(e => {
      if (e.defeated) {
        updateEnemyDefeatedVisibility(e, dt);
        return;
      }
      if (!isEntityActiveInScene(e, current)) return;
      const activeBossDomain = current.bossDomain
        && !current.defeatedMiniBosses.has(current.bossDomain.bossId)
        ? current.bossDomain
        : null;
      if (isNormalEnemyInsideBossFocus(e, activeBossDomain)) {
        suppressEnemyForBossFocus(e);
        return;
      }
      const wasEnemyAttacking = updateEnemyCombatTimers(e, dt);
      if (wasEnemyAttacking && e.attackTimer <= 0) {
        // The swing just ended, so the in-flight timers are already zero — resolve the
        // heavy pattern by id here so heavies open their longer counter windows.
        const endedHeavyPattern = HEAVY_ATTACK_PATTERNS[e.type];
        const endedScorpionAntiAirPattern = e.type === 'scorpion' && e.attackPattern === SCORPION_ANTI_AIR_ATTACK_PATTERN.id
          ? SCORPION_ANTI_AIR_ATTACK_PATTERN
          : null;
        const endedWispDivePattern = e.attackPattern === WISP_DIVE_ATTACK_PATTERN.id
          ? WISP_DIVE_ATTACK_PATTERN
          : null;
        const endedSnakeAmbushPattern = e.attackPattern === SNAKE_AMBUSH_LUNGE_PATTERN.id
          ? SNAKE_AMBUSH_LUNGE_PATTERN
          : null;
        const pattern = endedScorpionAntiAirPattern || endedWispDivePattern || endedSnakeAmbushPattern || (endedHeavyPattern && e.attackPattern === endedHeavyPattern.id
          ? endedHeavyPattern
          : getEnemyPatternConfig(e));
        openEnemyCounterWindow(e, pattern);
        addCombatEffect(current, {
          type: 'enemy-counter-window',
          x: e.x + e.width / 2,
          y: e.y + e.height / 2,
          color: '#d6b95c',
        });
        addCombatEffect(current, {
          type: 'sand-skid',
          x: e.x + e.width / 2,
          y: e.y + e.height,
          direction: -(e.attackDirection || e.direction || 1),
          color: 'rgba(136, 82, 36, 0.42)',
          timer: 0.42,
          maxTimer: 0.42,
        });
      }

      const distanceToPlayer = (player.x + player.width / 2) - (e.x + e.width / 2);
      e.direction = getEnemyFacingDirectionToPlayer(e, player, e.direction || 1);
      const tacticalPattern = getEnemyPatternConfig(e);
      const combatIntent = getEnemyCombatIntent(e);
      const intentTuning = getEnemyIntentTuning(e, combatIntent);
      const playerIsVenomSlowed = (player.venomSlowTimer || 0) > 0;
      const venomPressureTuning = getEnemyVenomPressureTuning(e, player.venomSlowTimer || 0);
      e.combatIntent = combatIntent.id;
      e.combatIntentLabel = combatIntent.label;
      e.combatIntentReason = combatIntent.reason;
      const pressureReachBonus = (intentTuning.pressureReachBonus ?? (e.encounterRole ? 26 : 0)) + venomPressureTuning.aggroReachBonus;
      const awarenessMultiplier = (tacticalPattern.awarenessMultiplier || 1) * (intentTuning.awarenessMultiplier || 1);
      const baseNearPlayerX = (e.type === 'bat' || e.flying ? 240 : 210) + pressureReachBonus;
      const verticalAwareness = intentTuning.verticalAwareness ?? (104 + (e.encounterRole ? 14 : 0));
      const nearPlayer = Math.abs(distanceToPlayer) < (baseNearPlayerX * awarenessMultiplier) && Math.abs(player.y - e.y) < verticalAwareness;
      const scorpionVenomCanReach = e.type === 'scorpion'
        && Math.abs(distanceToPlayer) <= SCORPION_VENOM_SPIT_RANGE
        && Math.abs((player.y + player.height / 2) - (e.y + e.height / 2)) < 96;
      const attackDirectionToPlayer = distanceToPlayer >= 0 ? 1 : -1;
      const meleeReachesPlayer = rectsOverlap(
        getAttackBox(e, ENEMY_ATTACK_TRIGGER_REACH, tacticalPattern.height, attackDirectionToPlayer, tacticalPattern.yOffset || 0, 0),
        getPlayerBodyHitbox(player),
      );
      const shouldUseScorpionAntiAir = shouldUseScorpionAntiAirSting({
        enemy: e,
        player,
        distanceToPlayer,
        baseNearPlayerX,
        awarenessMultiplier,
        verticalAwareness,
      });
      const shouldUseVenomSpit = shouldUseScorpionVenomSpit({
        enemy: e,
        meleeReachesPlayer,
        scorpionVenomCanReach,
        shouldUseScorpionAntiAir,
        venomSlowTimer: player.venomSlowTimer || 0,
      });
      const shouldUseWispDive = shouldUseWispDiveHarass({
        enemy: e,
        player,
        distanceToPlayer,
        baseNearPlayerX,
        awarenessMultiplier,
        verticalAwareness,
        meleeReachesPlayer,
      });
      const shouldUseSnakeAmbush = shouldUseSnakeAmbushLunge({
        enemy: e,
        player,
        distanceToPlayer,
        baseNearPlayerX,
        awarenessMultiplier,
        verticalAwareness,
        meleeReachesPlayer,
      });
      const scarabPoisonChargeCanReach = e.type === 'scarab'
        && playerIsVenomSlowed
        && nearPlayer
        && Math.abs(distanceToPlayer) <= (ENEMY_ATTACK_TRIGGER_REACH + SCARAB_POISONED_CHARGE_START_BONUS);
      const airborneIntentCanReach = Boolean(intentTuning.airborneAggro)
        && !player.onGround
        && Math.abs(distanceToPlayer) < (baseNearPlayerX * awarenessMultiplier * 1.35)
        && Math.abs((player.y + player.height / 2) - (e.y + e.height / 2)) < verticalAwareness + 34;
      const enemyCanStartAttack = (nearPlayer && meleeReachesPlayer) || shouldUseScorpionAntiAir || shouldUseVenomSpit || shouldUseWispDive || shouldUseSnakeAmbush || scarabPoisonChargeCanReach;
      if (nearPlayer || shouldUseVenomSpit || shouldUseWispDive || shouldUseSnakeAmbush || scarabPoisonChargeCanReach || airborneIntentCanReach || (e.type === 'scorpion' && playerIsVenomSlowed && scorpionVenomCanReach)) {
        e.aggroMemoryTimer = Math.max(
          e.aggroMemoryTimer || 0,
          ENEMY_AGGRO_MEMORY_SECONDS * (tacticalPattern.aggroMemoryMultiplier || 1) * venomPressureTuning.aggroMemoryMultiplier,
        );
      }
      if (!current.seenEnemyTypeNoticeIds) current.seenEnemyTypeNoticeIds = new Set();
      const stakeMessage = ENEMY_TYPE_STAKE_MESSAGES[e.type];
      if (
        stakeMessage
        && !current.seenEnemyTypeNoticeIds.has(e.type)
        && (current.itemPurposeNoticeTimer || 0) <= 0
        && Math.abs(distanceToPlayer) < (e.flying ? 260 : 220)
        && Math.abs(player.y - e.y) < 118
      ) {
        current.seenEnemyTypeNoticeIds.add(e.type);
        current.notice = stakeMessage;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.9);
      }

      if (e.stunTimer <= 0 && e.attackTimer <= 0 && e.attackWindup <= 0 && enemyCanStartAttack && e.attackCooldown <= 0) {
        e.attackCount = (e.attackCount || 0) + 1;
        const heavyInterval = HEAVY_ATTACK_INTERVAL[e.type];
        const isHeavyAttack = Boolean(
          HEAVY_ATTACK_PATTERNS[e.type]
          && heavyInterval
          && e.attackCount % heavyInterval === 0
          && !shouldUseVenomSpit
          && !shouldUseScorpionAntiAir
          && !shouldUseWispDive
          && !shouldUseSnakeAmbush
        );
        const pattern = shouldUseScorpionAntiAir
          ? SCORPION_ANTI_AIR_ATTACK_PATTERN
          : shouldUseVenomSpit
            ? SCORPION_VENOM_ATTACK_PATTERN
            : shouldUseWispDive
              ? WISP_DIVE_ATTACK_PATTERN
              : shouldUseSnakeAmbush
                ? SNAKE_AMBUSH_LUNGE_PATTERN
                : isHeavyAttack
                  ? HEAVY_ATTACK_PATTERNS[e.type]
                  : tacticalPattern;
        const selectedAbilityReason = shouldUseScorpionAntiAir
          ? 'anti-air jump punish'
          : shouldUseVenomSpit
            ? 'venom control'
            : shouldUseWispDive
              ? 'aerial dive harassment'
              : shouldUseSnakeAmbush
                ? 'ambush lunge from mid-range'
                : isHeavyAttack
                  ? 'heavy cadence'
                  : 'standard pressure';
        e.selectedAbility = pattern.id;
        e.selectedAbilityReason = selectedAbilityReason;
        e.targetReason = selectedAbilityReason;
        // Depth pressure: enemies deeper in the site attack more frequently
        const deepZone = e.x > scaleJourneyX(1480);
        const deepZoneCooldownMultiplier = deepZone
          ? (e.x > scaleJourneyX(4000) ? 0.78 : 0.85)
          : 1;
        // Wound state: below half health, enemies become more desperate
        const woundState = e.health < e.maxHealth * 0.5;
        const woundMultiplier = woundState ? 0.80 : 1;
        const attackCooldown = Math.max(0.55, pattern.cooldown * deepZoneCooldownMultiplier * woundMultiplier);
        beginEnemyAttackWindup(e, pattern, {
          attackDirection: attackDirectionToPlayer,
          attackCooldown,
        });
        if (shouldUseWispDive) {
          e.diveHomeY = Number.isFinite(e.diveHomeY) ? e.diveHomeY : e.y;
          e.diveTargetY = Math.min(player.y + player.height * 0.1, e.diveHomeY + 92);
        }
        if (e.encounterRole) {
          addCombatEffect(current, {
            type: 'enemy-pressure',
            x: e.x + e.width / 2,
            y: e.y + e.height / 2,
            color: 'rgba(137, 104, 72, 0.42)',
            timer: 0.38,
            maxTimer: 0.38,
          });
        }
        if (pattern.id === SCORPION_ANTI_AIR_ATTACK_PATTERN.id) {
          addCombatEffect(current, {
            type: 'enemy-pressure',
            x: e.x + e.width / 2,
            y: e.y,
            color: 'rgba(245, 158, 11, 0.52)',
            timer: 0.42,
            maxTimer: 0.42,
          });
        }
        if (shouldUseVenomSpit) {
          addCombatEffect(current, {
            type: 'enemy-pressure',
            x: e.x + e.width / 2,
            y: e.y + e.height * 0.28,
            color: 'rgba(132, 204, 22, 0.5)',
            timer: 0.46,
            maxTimer: 0.46,
          });
        }
        if (pattern.id === WISP_DIVE_ATTACK_PATTERN.id) {
          addCombatEffect(current, {
            type: 'enemy-pressure',
            x: e.x + e.width / 2,
            y: e.y + e.height / 2,
            color: 'rgba(56, 189, 248, 0.5)',
            timer: 0.4,
            maxTimer: 0.4,
          });
        }
        if (pattern.id === SNAKE_AMBUSH_LUNGE_PATTERN.id) {
          addCombatEffect(current, {
            type: 'enemy-pressure',
            x: e.x + e.width / 2,
            y: e.y + e.height * 0.35,
            color: 'rgba(180, 83, 9, 0.5)',
            timer: 0.4,
            maxTimer: 0.4,
          });
        }
        if (isHeavyAttack) {
          current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.14);
          current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.18);
        }
        const scarabPoisonedChargeNotice = e.type === 'scarab' && playerIsVenomSlowed;
        const isUnblockableAttack = isHeavyAttack && pattern.protectedDuringWindup;
        if (shouldUseVenomSpit) {
          current.notice = `${e.name} aims venom. Keep moving or dodge before it spits.`;
          current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.55);
        } else if (shouldUseScorpionAntiAir) {
          current.notice = `${e.name} raises its tail. Jump is unsafe - land away or counter after the sting.`;
          current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.6);
        } else if (shouldUseWispDive) {
          current.notice = `${e.name} dives from above. Jump-strike with J or dodge through it.`;
          current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.45);
        } else if (shouldUseSnakeAmbush) {
          current.notice = `${e.name} coils low. Jump or dodge the lunge, then punish the miss.`;
          current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.45);
        } else if (scarabPoisonedChargeNotice) {
          addCombatEffect(current, {
            type: 'enemy-pressure',
            x: e.x + e.width / 2,
            y: e.y + e.height / 2,
            color: 'rgba(250, 204, 21, 0.48)',
            timer: 0.4,
            maxTimer: 0.4,
          });
        } else if ((current.itemPurposeNoticeTimer || 0) <= 0 && (current.damageNoticeTimer || 0) <= 0) {
          if (isUnblockableAttack) {
            if (!current.redAttackHintShown) {
              // First red attack of the run — teach the colour language explicitly.
              current.redAttackHintShown = true;
              current.notice = `${e.name} glows RED — unblockable. You can't parry it; dodge (L)!`;
              current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 2.6);
            } else {
              current.notice = `${e.name} — red ${pattern.label}. Unblockable, dodge it!`;
            }
          } else {
            current.notice = isHeavyAttack
              ? `${e.name} — orange ${pattern.label}. Parry or dodge.`
              : `${e.name} winds up ${pattern.label}. Parry or dodge.`;
          }
        }
      }

      if (e.attackReady && e.attackWindup <= 0 && e.attackTimer <= 0) {
        const releasePattern = getEnemyPatternConfig(e);
        beginEnemyAttackSwing(e, releasePattern);
        if (releasePattern.id === SCORPION_VENOM_ATTACK_PATTERN.id) {
          const venomTravelTime = SCORPION_VENOM_SPIT_VISUAL_TRAVEL_TIME;
          const rawLead = (player.vx || 0) * venomTravelTime * 0.85;
          const velocityLead = Math.max(-160, Math.min(160, rawLead));
          addCombatEffect(current, {
            type: 'venom-spit',
            x: e.x + e.width / 2,
            y: e.y + e.height * 0.28,
            targetX: player.x + player.width / 2 + velocityLead,
            targetY: player.y + player.height * 0.42,
            color: '#84cc16',
            arcHeight: 42,
            timer: venomTravelTime,
            maxTimer: venomTravelTime,
          });
        }
      }

      if (e.attackTimer > 0) {
        const pattern = getEnemyPatternConfig(e);
        const scarabPoisonChargeBoost = e.type === 'scarab' && playerIsVenomSlowed ? SCARAB_POISONED_CHARGE_SPEED_MULTIPLIER : 1;
        e.x += e.attackDirection * pattern.speed * scarabPoisonChargeBoost * dt;
        if (pattern.airborneHarass) {
          const diveHomeY = Number.isFinite(e.diveHomeY) ? e.diveHomeY : e.y;
          const diveTargetY = Number.isFinite(e.diveTargetY)
            ? e.diveTargetY
            : Math.min(player.y + player.height * 0.1, diveHomeY + 92);
          e.y = approach(e.y, diveTargetY, 236 * dt);
        }
        const enemyAttackBox = getAttackBox(e, pattern.range, pattern.height, e.attackDirection, pattern.yOffset || 0, pattern.backReach || 0);
        const contact = resolveEnemyContact(player, previousPlayer, e);
        const playerBodyHitbox = getPlayerBodyHitbox(player);
        if (contact.type === 'stomp') {
          const scarabVaultCharge = shouldVaultScarabCharge({
            enemy: e,
            contact,
            pattern,
          });
          if (scarabVaultCharge) {
            applyScarabVault(e);
            return;
          }
          applyEnemyStomp(e);
          return;
        }
        if (!e.attackHasHit && rectsOverlap(enemyAttackBox, playerBodyHitbox)) {
          e.attackHasHit = true;
          // Perfect dodge takes precedence: if the blow lands while Asha is in her
          // dodge i-frames, she deflects it (any colour, including red) and the
          // enemy is left staggered for a punish.
          const playerIsPerfectDodging = current.dodgeInvulnerableTimer > 0;
          const scarabChargeDodged = shouldStunScarabChargeOnDodge({
            enemy: e,
            pattern,
          });
          const playerIsParrying = attackRect
            && e.attackTimer <= PARRY_WINDOW_DURATION
            && !current.attackHitIds.has(e.id)
            && getEnemyAttackTelegraph(e, HEAVY_ATTACK_PATTERNS).parryable
            && rectsOverlap(attackRect, getAttackHurtbox(e));
          if (playerIsPerfectDodging) {
            const scarabDodgeOutcome = scarabChargeDodged ? getScarabVaultOutcome({ jumpSpeed: JUMP_SPEED }) : null;
            e.attackTimer = 0;
            e.attackWindup = 0;
            e.attackReady = false;
            e.stunTimer = Math.max(e.stunTimer || 0, scarabDodgeOutcome?.enemyStunTimer ?? 1.3);
            e.attackCooldown = Math.max(e.attackCooldown || 0, scarabDodgeOutcome?.attackCooldown ?? 1.3);
            e.attackRecovery = Math.max(e.attackRecovery || 0, scarabDodgeOutcome?.attackRecovery ?? 0.6);
            e.vulnerabilityTimer = Math.max(e.vulnerabilityTimer || 0, scarabDodgeOutcome?.vulnerabilityTimer ?? 0.6);
            e.shieldTimer = 0;
            if (scarabChargeDodged) {
              e.selectedAbility = 'dodged-charge';
              e.selectedAbilityReason = 'Asha slipped past the charge';
              e.targetReason = e.selectedAbilityReason;
            }
            current.resources.stamina = Math.min(maxStamina, current.resources.stamina + PERFECT_DODGE_ENDURANCE_REWARD);
            current.lastAttackResult = scarabChargeDodged ? 'scarab-skid-dodge' : 'perfect-dodge';
            if (!scarabChargeDodged) {
            current.notice = `Perfect dodge! ${e.name} is staggered — strike now.`;
            current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.4);
            }
            current.hitStopTimer = Math.max(current.hitStopTimer, 0.08);
            current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.18);
            current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.35);
            addCombatEffect(current, {
              type: 'parry-burst',
              x: player.x + player.width / 2,
              y: player.y + player.height * 0.42,
              color: '#7fe9ff',
              timer: 0.42,
              maxTimer: 0.42,
            });
            if (scarabChargeDodged) {
              addCombatEffect(current, {
                type: 'enemy-counter-window',
                x: e.x + e.width / 2,
                y: e.y + e.height * 0.48,
                color: '#facc15',
                timer: 0.48,
                maxTimer: 0.48,
              });
              addCombatEffect(current, {
                type: 'sand-skid',
                x: e.x + e.width / 2,
                y: e.y + e.height,
                direction: -(e.attackDirection || e.direction || 1),
                color: 'rgba(202, 138, 4, 0.45)',
                timer: 0.42,
                maxTimer: 0.42,
              });
            }
            audioControls?.playExpeditionSfx?.('parryClash', { volume: 0.7 });
          } else if (playerIsParrying) {
            e.parried = true;
          } else if (pattern.slowDuration) {
            applyPlayerVenomSlow(e, pattern);
          } else {
            const damageDirection = contact.direction || e.attackDirection || ((player.x + player.width / 2) >= (e.x + e.width / 2) ? 1 : -1);
            const isHeavyHit = HEAVY_ATTACK_PATTERNS[e.type]?.id === pattern.id;
            const batKnockback = e.type === 'bat' ? (isHeavyHit ? 3.4 : 2.6) : (e.playerKnockbackMultiplier || 1);
            applyPlayerDamage(Math.max(e.damage, Math.round(e.damage * (pattern.damageScale || 1))), `${e.name} hit you`, damageDirection, e.name, {
              knockbackMultiplier: isHeavyHit ? (batKnockback * 1.4) : batKnockback,
              canOverwhelm: true,
            });
            if (isHeavyHit) {
              current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.36);
              current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.65);
              current.hitStopTimer = Math.max(current.hitStopTimer, 0.10);
            }
            if (e.type === 'snake' && !player.poisonTimer) {
              player.poisonTimer = 4.0;
              player.poisonTickTimer = 1.0;
              current.notice = 'Snake venom is in the wound. -1 stamina per second.';
              current.damageNoticeTimer = Math.max(current.damageNoticeTimer || 0, 1.4);
            }
            if (e.type === 'sand-wisp') {
              player.sandBlindTimer = Math.max(player.sandBlindTimer || 0, 2.2);
            }
          }
        }
      }

      if (Number.isFinite(e.diveHomeY) && e.attackTimer <= 0) {
        const returnSpeed = e.attackRecovery > 0 ? 124 : 176;
        e.y = approach(e.y, e.diveHomeY, returnSpeed * dt);
        if (Math.abs(e.y - e.diveHomeY) <= 0.5 && e.attackWindup <= 0 && e.attackRecovery <= 0) {
          e.y = e.diveHomeY;
          delete e.diveHomeY;
          delete e.diveTargetY;
        }
      }

      if (e.knockbackTimer > 0 && e.type !== 'scorpion-nest') {
        e.x += e.knockbackDirection * 95 * dt;
      }

      const attackMovementAllowed = shouldAllowEnemyAttackMovement({ enemy: e });
      if (
        e.stunTimer <= 0
        && e.attackRecovery <= 0
        && (
          attackMovementAllowed
          || (e.attackWindup <= 0 && e.attackTimer <= 0)
        )
      ) {
        // While this timer runs the enemy has given up an unwinnable chase and
        // walks back to its patrol ground instead of freezing at its leash end.
        e.patrolReturnTimer = Math.max(0, (e.patrolReturnTimer || 0) - dt);
        const isAggroChasing = (e.aggroMemoryTimer || 0) > 0 && e.patrolReturnTimer <= 0;
        const sameCombatPlane = Math.abs(player.y - e.y) < Math.max(intentTuning.verticalAwareness || 0, 118 + (e.encounterRole ? 16 : 0));
        const isPressingPlayer = e.patrolReturnTimer <= 0
          && (
            isAggroChasing
            || (
              Math.abs(distanceToPlayer) < (baseNearPlayerX * awarenessMultiplier * 1.55)
              && sameCombatPlane
            )
          );
        const venomPursuitBoost = venomPressureTuning.chaseSpeedMultiplier;
        const chaseSpeedMultiplier = isAggroChasing
          ? (tacticalPattern.chaseMultiplier || 1.65) * (intentTuning.chaseMultiplier || 1) * venomPursuitBoost * (e.type === 'scorpion' ? SCORPION_CHASE_SPEED_MULTIPLIER : 1)
          : 1;
        const patrolSpeed = (e.baseSpeed || e.speed) * updateHostileStepMultiplier(e, dt) * chaseSpeedMultiplier;
        const pursuitPadding = ENEMY_AGGRO_PATROL_PADDING + (intentTuning.pursuitPaddingBonus || 0);
        const movementMin = isAggroChasing ? e.patrolMin - pursuitPadding : e.patrolMin;
        const movementMax = isAggroChasing ? e.patrolMax + pursuitPadding : e.patrolMax;

        if (isPressingPlayer && sameCombatPlane) {
          // Hold a consistent standoff slot just in front of or behind Asha
          // instead of sharing her space. Commit to whichever side the enemy
          // approached from so the choice can't flip-flop frame to frame (that
          // flip-flop is what looked like the enemy spinning on top of her).
          const playerCenter = player.x + player.width / 2;
          e.combatSide = resolveEnemyCombatSide({ enemy: e, player, currentSide: e.combatSide });
          const standoffDistance = e.width / 2 + player.width / 2 + ENEMY_COMBAT_STANDOFF_GAP + (intentTuning.standoffGapBonus || 0);
          const rawTargetX = playerCenter + e.combatSide * standoffDistance - e.width / 2;
          const targetX = Math.min(movementMax, Math.max(movementMin, rawTargetX));
          const step = patrolSpeed * dt;
          const toTarget = targetX - e.x;
          e.x += Math.abs(toTarget) <= step ? toTarget : Math.sign(toTarget) * step;
          // Always face Asha while holding the line.
          e.direction = e.combatSide >= 0 ? -1 : 1;
          // Stuck-chase watchdog: if the leash clamp is holding this enemy away
          // from Asha and it has already reached the clamped spot, it would
          // otherwise stand frozen at an invisible wall. After ~0.9s of that,
          // give up: drop aggro and walk home for a couple of seconds.
          const pinnedByLeash = rawTargetX !== targetX && Math.abs(toTarget) <= Math.max(step, 1.5);
          if (pinnedByLeash && (e.speed || 0) > 0) {
            e.stuckChaseTimer = (e.stuckChaseTimer || 0) + dt;
            if (e.stuckChaseTimer >= 0.9) {
              e.stuckChaseTimer = 0;
              e.aggroMemoryTimer = 0;
              e.combatSide = 0;
              e.stepShiftTimer = 0;
              e.patrolReturnTimer = 2.2;
              // Head back toward home ground immediately.
              const patrolCenter = (e.patrolMin + e.patrolMax) / 2;
              e.direction = e.x <= patrolCenter ? 1 : -1;
            }
          } else {
            e.stuckChaseTimer = 0;
          }
        } else {
          // Not locked into a combat slot: patrol/chase normally and release the
          // committed side so it is re-picked on the next approach.
          e.combatSide = 0;
          if (isPressingPlayer) {
            e.direction = distanceToPlayer >= 0 ? 1 : -1;
          }
          e.x += e.direction * patrolSpeed * dt;
          if (e.x <= movementMin) {
            e.x = movementMin;
            e.direction = 1;
            e.stepShiftTimer = 0;
          } else if (e.x >= movementMax) {
            e.x = movementMax;
            e.direction = -1;
            e.stepShiftTimer = 0;
          }
        }
      }
      const contact = resolveEnemyContact(player, previousPlayer, e);
      if (contact.type === 'stomp') {
        applyEnemyStomp(e);
        return;
      }
      if (attackRect && !current.attackHitIds.has(e.id) && rectsOverlap(attackRect, getAttackHurtbox(e))) {
        current.attackHitIds.add(e.id);
        const pattern = getEnemyPatternConfig(e);
        const protectedEnemy = (e.shieldTimer > 0)
          || (e.attackWindup > 0 && pattern.protectedDuringWindup)
          || (e.attackTimer > 0 && pattern.protectedDuringAttack && e.vulnerabilityTimer <= 0);
        if (protectedEnemy) {
          e.attackCooldown = Math.max(e.attackCooldown, 0.35);
          current.attackRecoilTimer = Math.max(current.attackRecoilTimer, 0.1);
          current.lastAttackResult = 'protected';
          resetPlayerCombo(current);
          current.shieldedHitFeedback = `${e.name} blocked the rushed hit.`;
          applyAttackStaminaCost(PROTECTED_HIT_EXTRA_STAMINA_COST, 'Protected enemy blocked attack', '-1');
          applyCombatHitImpact({
            current,
            target: e,
            player,
            hitType: 'blocked',
            direction: player.direction,
            shieldEffectType: 'enemy-shield',
            guardColor: 'rgba(214, 185, 92, 0.78)',
            sfxOptions: { volume: e.type === 'scarab' ? 0.92 : 0.78 },
          });
          current.notice = `${e.name} blocked the rushed hit. Wait for an opening.`;
          return;
        }
        const isScarabFrontalHit = shouldScarabFrontalArmorDeflect({
          enemy: e,
          player,
        });
        if (isScarabFrontalHit) {
          current.lastAttackResult = 'shell-deflect';
          resetPlayerCombo(current);
          applyCombatHitImpact({
            current,
            target: e,
            player,
            hitType: 'blocked',
            direction: player.direction,
            guardColor: 'rgba(170, 140, 90, 0.72)',
            sfxOptions: { volume: 0.68 },
          });
          return;
        }
        const isParry = getEnemyAttackTelegraph(e, HEAVY_ATTACK_PATTERNS).parryable
          && (e.parried || (e.attackTimer > 0 && e.attackTimer <= PARRY_WINDOW_DURATION));
        const isFinisher = current.attackComboFinisherActive;
        const isHeavyAttack = current.attackType === PLAYER_ATTACK_TYPES.HEAVY;
        const isAirAttack = current.attackType === PLAYER_AIR_ATTACK_TYPE;
        e.parried = false;
        e.health -= isFinisher
          ? PLAYER_ATTACK_FINISHER_DAMAGE
          : isParry
            ? PLAYER_ATTACK_PARRY_DAMAGE
            : isAirAttack
              ? (current.attackDamage || PLAYER_AIR_ATTACK_DAMAGE)
              : isHeavyAttack
                ? PLAYER_ATTACK_SHOVE_DAMAGE
                : PLAYER_ATTACK_LIGHT_DAMAGE;
        if (!current.attackRewarded) {
          const heavyFollowupRefund = isFinisher ? PLAYER_HEAVY_FOLLOWUP_HIT_REFUND : (isParry ? 8 : (isAirAttack ? 2 : (isHeavyAttack ? 0 : 1)));
          current.resources.stamina = Math.min(current.upgradeEffects?.maxStamina || 100, current.resources.stamina + heavyFollowupRefund);
          current.attackRewarded = true;
        }
        const primesHeavyFollowup = !isFinisher && !isHeavyAttack && !isAirAttack;
        current.attackComboLanded = primesHeavyFollowup;
        current.attackComboWindowTimer = primesHeavyFollowup ? PLAYER_COMBO_WINDOW_DURATION : 0;
        current.heavyFollowupReadyTimer = primesHeavyFollowup ? PLAYER_COMBO_WINDOW_DURATION : 0;
        current.heavyFollowupCueTimer = primesHeavyFollowup ? PLAYER_HEAVY_FOLLOWUP_CUE_DURATION : 0;
        current.attackComboStep = primesHeavyFollowup ? current.attackSequenceIndex : 0;
        current.lastAttackResult = isFinisher ? 'finisher' : (isParry ? 'parry' : (isAirAttack ? 'air-hit' : (e.vulnerabilityTimer > 0 || e.attackRecovery > 0 ? 'counter-hit' : 'hit')));
        current.shieldedHitFeedback = '';
        if (primesHeavyFollowup) {
          addCombatEffect(current, {
            type: 'heavy-ready-cue',
            x: player.x + player.width / 2 + player.direction * 30,
            y: player.y + player.height * 0.28,
            direction: player.direction,
            color: '#f8e7b6',
            timer: Math.max(current.heavyFollowupReadyTimer || 0, current.heavyFollowupCueTimer || 0),
            maxTimer: Math.max(current.heavyFollowupReadyTimer || 0, current.heavyFollowupCueTimer || 0),
          });
        }
        const exhausted = current.resources.stamina > 0 && current.resources.stamina < 25;
        e.stunTimer = isFinisher ? 1.55 : (isParry ? 1.4 : (isHeavyAttack ? 1.1 : (isAirAttack ? 0.72 : (exhausted ? 0.38 : 0.8))));
        e.attackWindup = 0;
        e.attackTimer = 0;
        e.attackReady = false;
        e.attackCooldown = Math.max(e.attackCooldown, isFinisher ? 1.55 : (isParry ? 1.4 : (isHeavyAttack ? 0.95 : (isAirAttack ? 0.62 : (exhausted ? 0.32 : 0.6)))));
        e.attackRecovery = isFinisher ? 0.72 : (isParry ? 0.6 : (isHeavyAttack ? 0.55 : (isAirAttack ? 0.4 : (exhausted ? 0.22 : 0.45))));
        e.vulnerabilityTimer = isFinisher ? 0.62 : (isParry ? 0.55 : 0.35);
        e.shieldTimer = 0;
        if (isAirAttack) {
          player.vy = Math.min(player.vy || 0, -JUMP_SPEED * 0.16);
          player.onGround = false;
        }
        const combatHitImpactType = isFinisher
          ? 'finisher'
            : e.health <= 0
              ? 'defeated'
            : isHeavyAttack
              ? 'shove'
              : 'light';
        if (isParry && e.health > 0) {
          addCombatEffect(current, {
            type: 'parry-burst',
            x: e.x + e.width / 2,
            y: e.y + e.height / 2,
            color: '#fbbf24',
            timer: 0.4,
            maxTimer: 0.4,
          });
        }
        applyCombatHitImpact({
          current,
          target: e,
          player,
          hitType: isParry ? 'combo2' : combatHitImpactType,
          defeated: e.health <= 0,
          direction: player.direction,
          targetKind: 'enemy',
          color: isFinisher ? '#fbbf24' : (e.health <= 0 ? '#b8943c' : (combatHitImpactType === 'shove' ? '#b8c4d0' : '#7dd3fc')),
          sparkColor: current.lastAttackResult === 'finisher' ? '#fbbf24' : (current.lastAttackResult === 'parry' ? '#fde68a' : (current.lastAttackResult === 'air-hit' ? '#7dd3fc' : (current.lastAttackResult === 'counter-hit' ? '#bbf7d0' : (combatHitImpactType === 'shove' ? '#cdd8e0' : '#e2d5c0')))),
          sparkFill: current.lastAttackResult === 'finisher' ? 'rgba(251, 191, 36, 0.38)' : (current.lastAttackResult === 'parry' ? 'rgba(251, 191, 36, 0.32)' : (current.lastAttackResult === 'air-hit' ? 'rgba(125, 211, 252, 0.22)' : (current.lastAttackResult === 'counter-hit' ? 'rgba(34, 197, 94, 0.18)' : (combatHitImpactType === 'shove' ? 'rgba(176, 196, 214, 0.2)' : 'rgba(190, 168, 128, 0.18)')))),
          sfxKey: isParry ? 'parryClash' : (combatHitImpactType === 'light' ? getEnemyHitSfxKey(e) : undefined),
          sfxOptions: isParry
            ? { volume: 1.0 }
            : { volume: e.health <= 0 ? 1.12 : (current.lastAttackResult === 'counter-hit' ? 1.02 : 0.92) },
          suppressSlash: isParry,
        });
        if (e.health <= 0) {
          e.defeated = true;
          e.defeatedVisibleTimer = ENEMY_DEFEATED_VISIBLE_SECONDS;
          e.hitFlash = 0;
          e.stunTimer = 0;
          e.attackWindup = 0;
          e.attackTimer = 0;
          e.attackReady = false;
          e.attackRecovery = 0;
          e.vulnerabilityTimer = 0;
          e.shieldTimer = 0;
          e.knockbackTimer = 0;
          e.knockbackDirection = 0;
          current.defeatedEnemies.add(e.id);
          current.relicShardCount += e.shards;
          const shardGateProgress = getActiveShardGateProgress(current);
          current.notice = shardGateProgress
            ? `Enemy dropped ${e.shards} relic shard${e.shards === 1 ? '' : 's'}: ${Math.min(current.relicShardCount, shardGateProgress.required)}/${shardGateProgress.required} for ${shardGateProgress.gateName}.`
            : `Enemy dropped ${e.shards} relic shard${e.shards === 1 ? '' : 's'}. Spend these at Base Camp.`;
          // Clean defeat refunds a little Endurance so chained fights stay sustainable.
          const enduranceBeforeDefeat = current.resources.stamina;
          current.resources.stamina = Math.min(current.upgradeEffects?.maxStamina || 100, enduranceBeforeDefeat + PLAYER_DEFEAT_ENDURANCE_REWARD);
          const defeatEnduranceGained = Math.round(current.resources.stamina - enduranceBeforeDefeat);
          if (defeatEnduranceGained > 0) current.notice = `${current.notice} +${defeatEnduranceGained} Endurance.`;
          current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 1.8);
        } else {
          current.notice = isFinisher ? `${e.name} thrown back by Asha's finisher.` : (isParry ? 'Parried! Asha deflected the blow.' : (isAirAttack ? `Asha clipped ${e.name} from above.` : (isHeavyAttack ? `${e.name} shoved back. Land J first for a heavy.` : `${e.name} stunned.`)));
        }
      }
    });

    // --- Scorpion nest spawner: stationary nests spit scorpions until destroyed ---
    if (!enemiesDisabled) current.enemies.forEach(nest => {
      if (nest.type !== 'scorpion-nest' || nest.defeated) return;
      if (!isEntityActiveInScene(nest, current)) return;
      // Keep the nest inert — it never moves or attacks, it only spawns.
      nest.attackWindup = 0;
      nest.attackTimer = 0;
      nest.attackReady = false;
      nest.attackRecovery = 0;
      nest.vx = 0;
      // Only spawn while the player is engaged with the arena (nest roughly on-screen).
      const playerNearNest = Math.abs((player.x + player.width / 2) - (nest.x + nest.width / 2)) < CANVAS_WIDTH * 0.85;
      if (!playerNearNest) {
        nest.spawnTimer = nest.spawnInitialDelay ?? 0.9;
        return;
      }
      if (nest.spawnTimer == null) nest.spawnTimer = nest.spawnInitialDelay ?? 0.9;
      nest.spawnTimer -= dt;
      const aliveBrood = current.enemies.filter(other => other.nestParentId === nest.id && !other.defeated).length;
      const spawnCap = nest.spawnCap ?? 3;
      if (nest.spawnTimer <= 0 && aliveBrood < spawnCap) {
        nest.spawnTimer = nest.spawnInterval ?? 3.4;
        nest.broodCount = (nest.broodCount || 0) + 1;
        const spawnDir = (player.x + player.width / 2) >= (nest.x + nest.width / 2) ? 1 : -1;
        const broodHeight = 30;
        const nestBaseY = nest.y + nest.height + (
          Number.isFinite(nest.yOffset)
            ? nest.yOffset
            : SCORPION_NEST_EDITOR_DEFAULTS.yOffset
        );
        current.enemies.push(makeEnemy({
          id: `${nest.id}-spawn-${nest.broodCount}`,
          name: 'Nest Scorpion',
          type: 'scorpion',
          emoji: 'S',
          x: nest.x + nest.width / 2 - 23 + spawnDir * 18,
          y: nestBaseY - broodHeight - 2,
          width: 46,
          height: broodHeight,
          patrolMin: nest.x - 150,
          patrolMax: nest.x + nest.width + 150,
          speed: 64,
          health: 2,
          damage: 6,
          openingRouteRamp: true,
          attackPatternTuning: { windup: 0.62, duration: 0.32, cooldown: 1.68, recovery: 0.66, vulnerableAfter: 0.74, speed: 50, range: 28, height: 62, yOffset: -38, backReach: 42, damageScale: 1.4 },
          shards: 1,
          direction: spawnDir,
          nestParentId: nest.id,
          encounterRole: 'nest brood',
        }));
        addCombatEffect(current, {
          type: 'sand-skid',
          x: nest.x + nest.width / 2,
          y: nestBaseY,
          direction: spawnDir,
          color: 'rgba(136, 82, 36, 0.5)',
          timer: 0.4,
          maxTimer: 0.4,
        });
      }
    });

    // Bosses
    if (!enemiesDisabled) current.miniBosses.forEach(b => {
      if (!isEntityActiveInScene(b, current)) return;
      if (b.defeated) return;
      const wasBossAttacking = b.attackTimer > 0;
      b.hitFlash = Math.max(0, b.hitFlash - dt);
      b.stunTimer = Math.max(0, b.stunTimer - dt);
      b.attackWindup = Math.max(0, b.attackWindup - dt);
      b.attackTimer = Math.max(0, b.attackTimer - dt);
      b.attackCooldown = Math.max(0, b.attackCooldown - dt);
      b.attackRecovery = Math.max(0, b.attackRecovery - dt);
      b.knockbackTimer = Math.max(0, b.knockbackTimer - dt);
      b.vulnerabilityTimer = Math.max(0, (b.vulnerabilityTimer || 0) - dt);
      b.shieldTimer = Math.max(0, (b.shieldTimer || 0) - dt);
      if (wasBossAttacking && b.attackTimer <= 0) {
        const phase = getBossPhaseConfig(b);
        b.attackRecovery = phase.recovery;
        b.vulnerabilityTimer = phase.vulnerableAfter;
        b.staggerRewarded = false; // a fresh opening — punishing it can earn the stagger reward again
        addCombatEffect(current, {
          type: 'boss-vulnerable',
          x: b.x + b.width / 2,
          y: b.y + b.height / 2,
          color: '#22c55e',
        });
      }
      if (!current.seenBossIntroIds) current.seenBossIntroIds = new Set();
      const scarabSealRequired = scopedJourneyAssetPacks.isEgyptJourney
        && b.id === SCARAB_SEAL_TRIGGER.bossId;
      if (scarabSealRequired && current.openingThresholdScene) return;
      const bossIntroTriggerDistance = scarabSealRequired ? SCARAB_QUEEN_INTRO_TRIGGER_DISTANCE : 400;
      const playerNearBossIntro = Math.abs(b.x - player.x) < bossIntroTriggerDistance;
      const scarabQueenRequiresScribe = scarabSealRequired && !current.scribeChamberPuzzleSolved;
      if (scarabQueenRequiresScribe) {
        if (playerNearBossIntro && (current.itemPurposeNoticeTimer || 0) <= 0) {
          current.notice = 'The Queen\'s lair stays sealed until Asha records the scribe\'s message.';
          current.itemPurposeNoticeTimer = 1.6;
        }
        return;
      }
      if (scarabSealRequired && !current.scarabSealActivated) {
        if (!playerNearBossIntro) return;
        activateScarabSealForQueenEncounter();
      }
      if (!current.seenBossIntroIds.has(b.id) && playerNearBossIntro) {
        b.awakened = true;
        current.seenBossIntroIds.add(b.id);
        const keyItem = current.bossKeyItems?.find(item => item.bossId === b.id);
        const scarabSealBossIntroLine = b.id === SCARAB_SEAL_TRIGGER.bossId && current.scarabSealActivated
          ? SCARAB_SEAL_TRIGGER.bossIntroLine
          : null;
        const arenaStart = b.arenaStart ?? Math.max(0, b.x - 160);
        const arenaEnd = b.arenaEnd ?? Math.min(WORLD_WIDTH, b.x + 180);
        const scarabQueenCinematic = b.id === SCARAB_SEAL_TRIGGER.bossId && scopedJourneyAssetPacks.isEgyptJourney;
        const bossArenaMin = Math.max(arenaStart + 90, b.patrolMin);
        const bossArenaMax = Math.max(
          bossArenaMin,
          Math.min(arenaEnd - b.width - 24, b.patrolMax),
        );
        b.x = scarabQueenCinematic && Number.isFinite(b.lairX)
          ? clamp(b.lairX - SCARAB_QUEEN_DRAW_OFFSET_X - b.width / 2, bossArenaMin, bossArenaMax)
          : bossArenaMax;
        const playerDomainMinX = arenaStart + 44;
        const playerDomainMaxX = Math.max(playerDomainMinX, arenaEnd - player.width - 44);
        const playerDomainStartX = clamp(
          b.x - player.width - BOSS_INTRO_PLAYER_STANDOFF,
          playerDomainMinX,
          playerDomainMaxX,
        );
        player.x = playerDomainStartX;
        player.y = GROUND_Y - player.height;
        player.vx = 0;
        player.vy = 0;
        player.direction = 1;
        b.direction = -1;
        b.patrolMin = bossArenaMin;
        b.patrolMax = bossArenaMax;
        b.attackWindup = 0;
        b.attackTimer = 0;
        b.attackReady = false;
        b.attackCooldown = Math.max(b.attackCooldown, 1.4);
        const guardianQuestions = GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED && !current.completedGuardianChallengeIds?.has(b.id)
          ? getGuardianChallengeQuestions(b.id).map(shuffleGuardianQuestionOptions)
          : [];
        current.bossDomain = {
          bossId: b.id,
          name: b.domainName || `${b.name} Domain`,
          arenaStart,
          arenaEnd,
          playerStartX: Math.round(player.x),
          bossStartX: Math.round(b.x),
          color: keyItem?.color || '#facc15',
          tint: b.sectionId === 'catacombs'
            ? 'rgba(49, 46, 129, 0.16)'
            : b.sectionId === 'escape-sequence'
              ? 'rgba(127, 29, 29, 0.14)'
              : scarabQueenCinematic
                ? 'rgba(92, 35, 15, 0.24)'
                : 'rgba(120, 53, 15, 0.14)',
          suppressVisuals: false,
          buriedSandEmergence: scarabQueenCinematic,
          introSeconds: scarabQueenCinematic ? SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS : 3.2,
        };
        current.bossIntro = {
          id: b.id,
          title: scarabQueenCinematic ? `Buried Lair: ${b.name}` : `Guardian Encounter: ${b.name}`,
          message: scarabSealBossIntroLine || (keyItem
            ? b.dialogue || `Defeat the guardian to recover the ${keyItem.name}.`
            : b.intro),
          focusX: b.x,
          triggerActor: scarabQueenCinematic ? 'Buried Scarab Lair' : null,
          triggerLine: scarabQueenCinematic ? 'The lair mouth splits open. Something ancient is rising.' : null,
          cameraAnchorRatio: scarabQueenCinematic ? SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO : null,
          dialogue: scarabSealBossIntroLine || b.dialogue || null,
          domainName: b.domainName || `${b.name} Domain`,
          rewardName: keyItem?.name || null,
        };
        if (!current.completedGuardianChallengeIds?.has(b.id)) {
          if (guardianQuestions.length) {
            current.pendingGuardianChallenge = {
              bossId: b.id,
              bossName: b.name,
              title: 'Guardian Knowledge Challenge',
              intro: 'Answer carefully. Your knowledge will decide the strength of the battle.',
              questions: guardianQuestions,
              currentIndex: 0,
              correctCount: 0,
              selectedAnswerIndex: null,
              feedback: null,
              answers: [],
              completed: false,
              modifier: null,
              resultMessage: null,
            };
          }
        }
        current.bossIntroTimer = scarabQueenCinematic ? SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS : 3.2;
        current.bossIntroPauseTimer = scarabQueenCinematic ? SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS : 3.2;
        current.cameraShakeTimer = Math.max(current.cameraShakeTimer, scarabQueenCinematic ? 0.62 : 0.35);
        current.cameraShakeStrength = Math.max(current.cameraShakeStrength, scarabQueenCinematic ? 0.42 : 0.32);
        const arenaCamera = scarabQueenCinematic
          ? clampCameraX(b.x - CANVAS_WIDTH * SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO)
          : clampCameraX(((arenaStart + arenaEnd) / 2) - (CANVAS_WIDTH / 2));
        current.cameraX = arenaCamera;
        current.targetCameraX = arenaCamera;
        current.cameraMode = 'boss-domain';
        current.cameraFocusTarget = Math.round(b.x);
        current.notice = current.bossIntro.message;
        audioControls?.playTransition?.();
      } else if (current.seenBossIntroIds.has(b.id) && Math.abs(b.x - player.x) < bossIntroTriggerDistance) {
        b.awakened = true;
      }

      const distanceToPlayer = (player.x + player.width / 2) - (b.x + b.width / 2);
      const bossNearPlayer = Math.abs(distanceToPlayer) < 155 && Math.abs(player.y - b.y) < 90;

      if (b.awakened && b.stunTimer <= 0 && b.attackTimer <= 0 && b.attackWindup <= 0 && bossNearPlayer && b.attackCooldown <= 0) {
        const phases = BOSS_ATTACK_PHASES[b.id] || DEFAULT_BOSS_ATTACK_PHASES;
        const phase = phases[b.attackCycleIndex % phases.length];
        b.attackPattern = phase.id;
        b.attackPhaseLabel = phase.label;
        b.attackKind = phase.kind;
        b.attackWindup = phase.windup;
        b.attackDirection = distanceToPlayer >= 0 ? 1 : -1;
        b.attackHasHit = false;
        b.attackReady = true;
        b.attackCooldown = phase.cooldown;
        b.shieldTimer = phase.shieldDuringWindup ? Math.min(0.55, phase.windup * 0.7) : 0;
        b.vulnerabilityTimer = 0;
        b.attackCycleIndex += 1;
        b.patternHistory = [...(b.patternHistory || []), phase.id].slice(-6);
        addCombatEffect(current, {
          type: 'boss-telegraph',
          x: b.x + b.width / 2,
          y: b.y + b.height / 2,
          color: phase.color || '#fb923c',
        });
        const warningSfx = scopedJourneyAssetPacks.isRomeJourney ? 'romeBossWarning' : scopedJourneyAssetPacks.isChinaJourney ? 'chinaBossWarning' : 'bossWarning';
        audioControls?.playExpeditionSfx?.(warningSfx);
        audioControls?.playAction?.();
        current.notice = `${b.name} telegraphs ${phase.label}. Watch, dodge, then counter.`;
      }

      if (b.attackReady && b.attackWindup <= 0 && b.attackTimer <= 0) {
        const phase = getBossPhaseConfig(b);
        b.attackTimer = phase.duration;
        b.attackReady = false;
      }

      if (b.attackTimer > 0) {
        const phase = getBossPhaseConfig(b);
        if (phase.kind === 'close') {
          b.x += b.attackDirection * phase.speed * dt;
        }
        // Area attacks span the phase's authored range centred on the boss, so wider
        // rings (Core Pulse 140 vs Scarab Burst 118) actually differ in reach.
        const bossAttackBox = phase.kind === 'area'
          ? {
            x: b.x + b.width / 2 - phase.range / 2,
            y: b.y + b.height - 48,
            width: phase.range,
            height: 54,
          }
          : getAttackBox(b, phase.range, phase.height, b.attackDirection);
        if (!b.attackHasHit && rectsOverlap(bossAttackBox, getPlayerBodyHitbox(player))) {
          b.attackHasHit = true;
          applyPlayerDamage(Math.max(4, Math.round(b.damage * (phase.damageScale || 1) * (b.bossDamageMultiplier || 1))), `${b.name} ${phase.label} hit you. Dodge, then counter`, b.attackDirection, b.name, { canOverwhelm: true });
        }
      }

      if (b.knockbackTimer > 0) {
        b.x += b.knockbackDirection * 65 * dt;
      }

      if (b.awakened && b.stunTimer <= 0 && b.attackWindup <= 0 && b.attackTimer <= 0 && b.attackRecovery <= 0) {
        const patrolSpeed = (b.baseSpeed || b.speed) * updateHostileStepMultiplier(b, dt, { boss: true });
        b.x += b.direction * patrolSpeed * dt;
        if (b.x <= b.patrolMin) {
          b.x = b.patrolMin;
          b.direction = 1;
          b.stepShiftTimer = 0;
        } else if (b.x >= b.patrolMax) {
          b.x = b.patrolMax;
          b.direction = -1;
          b.stepShiftTimer = 0;
        }
      }
      if (attackRect && !current.attackHitIds.has(b.id) && rectsOverlap(attackRect, getAttackHurtbox(b, { boss: true }))) {
        current.attackHitIds.add(b.id);
        const { shielded, vulnerable } = getBossVulnerabilityState(b);
        const protectedBoss = shielded || ((b.attackWindup > 0 || b.attackTimer > 0) && !vulnerable);
        if (protectedBoss) {
          b.attackCooldown = Math.max(b.attackCooldown, 0.35);
          current.attackRecoilTimer = Math.max(current.attackRecoilTimer, 0.12);
          current.lastAttackResult = 'protected';
          current.shieldedHitFeedback = `${b.name} protected itself.`;
          applyAttackStaminaCost(PROTECTED_HIT_EXTRA_STAMINA_COST, 'Protected boss blocked attack', '-1');
          applyCombatHitImpact({
            current,
            target: b,
            player,
            hitType: 'blocked',
            direction: player.direction,
            targetKind: 'boss',
            shieldEffectType: 'boss-shield',
            guardEffectType: 'boss-shield',
            sfxOptions: { volume: 1.04, playbackRate: 0.88 },
          });
          current.notice = `${b.name} blocked the rushed hit. Wait for the counter window.`;
          return;
        }
        const isFinisher = current.attackComboFinisherActive;
        const isHeavyAttack = current.attackType === PLAYER_ATTACK_TYPES.HEAVY;
        const isAirAttack = current.attackType === PLAYER_AIR_ATTACK_TYPE;
        const bossWasVulnerable = b.vulnerabilityTimer > 0 || b.attackRecovery > 0;
        // Bosses take the same typed damage as regular enemies so finishers and the
        // light -> primed-heavy loop stay meaningful in boss fights.
        const bossHitDamage = isFinisher
          ? PLAYER_ATTACK_FINISHER_DAMAGE
          : isAirAttack
            ? (current.attackDamage || PLAYER_AIR_ATTACK_DAMAGE)
            : isHeavyAttack
              ? PLAYER_ATTACK_SHOVE_DAMAGE
              : PLAYER_ATTACK_LIGHT_DAMAGE;
        b.health -= (b.playerDamageMultiplier || 1) * bossHitDamage;
        if (!current.attackRewarded) {
          const heavyFollowupRefund = isFinisher ? PLAYER_HEAVY_FOLLOWUP_HIT_REFUND : (isAirAttack ? 2 : (isHeavyAttack ? 0 : 1));
          current.resources.stamina = Math.min(current.upgradeEffects?.maxStamina || 100, current.resources.stamina + heavyFollowupRefund);
          current.attackRewarded = true;
        }
        const primesHeavyFollowup = !isFinisher && !isHeavyAttack && !isAirAttack;
        current.attackComboLanded = primesHeavyFollowup;
        current.attackComboWindowTimer = primesHeavyFollowup ? PLAYER_COMBO_WINDOW_DURATION : 0;
        current.heavyFollowupReadyTimer = primesHeavyFollowup ? PLAYER_COMBO_WINDOW_DURATION : 0;
        current.heavyFollowupCueTimer = primesHeavyFollowup ? PLAYER_HEAVY_FOLLOWUP_CUE_DURATION : 0;
        current.attackComboStep = primesHeavyFollowup ? current.attackSequenceIndex : 0;
        current.lastAttackResult = isFinisher ? 'finisher' : (isAirAttack ? 'air-hit' : (b.vulnerabilityTimer > 0 || b.attackRecovery > 0 ? 'counter-hit' : 'hit'));
        current.shieldedHitFeedback = '';
        // Punishing the boss's vulnerable opening restores a chunk of Endurance — once per opening.
        let bossStaggerEnduranceGain = 0;
        if (bossWasVulnerable && !b.staggerRewarded) {
          const enduranceBeforeStagger = current.resources.stamina;
          current.resources.stamina = Math.min(current.upgradeEffects?.maxStamina || 100, enduranceBeforeStagger + PLAYER_BOSS_STAGGER_ENDURANCE_REWARD);
          bossStaggerEnduranceGain = Math.round(current.resources.stamina - enduranceBeforeStagger);
          b.staggerRewarded = true;
        }
        if (primesHeavyFollowup) {
          addCombatEffect(current, {
            type: 'heavy-ready-cue',
            x: player.x + player.width / 2 + player.direction * 30,
            y: player.y + player.height * 0.28,
            direction: player.direction,
            color: '#f8e7b6',
            timer: Math.max(current.heavyFollowupReadyTimer || 0, current.heavyFollowupCueTimer || 0),
            maxTimer: Math.max(current.heavyFollowupReadyTimer || 0, current.heavyFollowupCueTimer || 0),
          });
        }
        b.stunTimer = 0.75;
        b.attackWindup = 0;
        b.attackTimer = 0;
        b.attackReady = false;
        b.attackCooldown = Math.max(b.attackCooldown, 1.1);
        b.attackRecovery = 0.75;
        b.vulnerabilityTimer = 0.55;
        b.shieldTimer = 0;
        if (isAirAttack) {
          player.vy = Math.min(player.vy || 0, -JUMP_SPEED * 0.14);
          player.onGround = false;
        }
        const hitSfx = scopedJourneyAssetPacks.isRomeJourney ? 'romeBossHit' : scopedJourneyAssetPacks.isChinaJourney ? 'chinaBossHit' : 'bossHit';
        const bossHitImpactType = current.attackComboFinisherActive
          ? 'finisher'
          : b.health <= 0
            ? 'defeated'
            : isHeavyAttack
              ? 'combo2'
              : 'light';
        applyCombatHitImpact({
          current,
          target: b,
          player,
          hitType: bossHitImpactType,
          defeated: b.health <= 0,
          direction: player.direction,
          targetKind: 'boss',
          color: b.health <= 0 ? '#facc15' : '#fb923c',
          sparkColor: current.lastAttackResult === 'counter-hit' ? '#bbf7d0' : '#fff7ad',
          sparkFill: current.lastAttackResult === 'counter-hit' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(251, 146, 60, 0.2)',
          sfxKey: bossHitImpactType === 'light' ? hitSfx : undefined,
          sfxOptions: { volume: b.health <= 0 ? 1.2 : 1 },
        });
        current.notice = bossStaggerEnduranceGain > 0 ? `${b.name} staggered. +${bossStaggerEnduranceGain} Endurance.` : `${b.name} staggered.`;
        if (b.health <= 0) {
          b.defeated = true;
          b.hitFlash = 0;
          b.stunTimer = 0;
          b.attackWindup = 0;
          b.attackTimer = 0;
          b.attackReady = false;
          b.attackRecovery = 0;
          b.vulnerabilityTimer = 0;
          b.shieldTimer = 0;
          b.knockbackTimer = 0;
          b.knockbackDirection = 0;
          current.defeatedMiniBosses.add(b.id);
          if (current.guardianBattleModifiers?.[b.id]) {
            current.guardianBattleModifiers = { ...current.guardianBattleModifiers };
            delete current.guardianBattleModifiers[b.id];
          }
          current.player.knowledgeVisualScale = 1;
          if (b.sectionId === 'dig-site-entrance') {
            current.completedObjectiveIds.add(b.sectionId);
          }
          current.relicShardCount += b.shards;
          const keyItem = current.bossKeyItems?.find(item => item.bossId === b.id);
          if (keyItem && !keyItem.collected) {
            keyItem.dropped = true;
            keyItem.x = clamp(
              b.x + b.width / 2,
              (b.arenaStart ?? 0) + 24,
              (b.arenaEnd ?? WORLD_WIDTH) - 48,
            );
            keyItem.y = GROUND_Y - 24;
            const rewardMoment = buildBossRewardMoment(current, keyItem, 'revealed');
            current.postBossReward = rewardMoment;
            current.postBossRewardTimer = 4.6;
            current.bossIntroPauseTimer = Math.max(current.bossIntroPauseTimer || 0, 1.05);
            current.notice = `${b.name} defeated. ${rewardMoment.title} ${rewardMoment.nextObjective}`;
            current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.2);
            current.cinematicEvent = {
              id: `${b.id}-tool-piece-drop`,
              name: 'Boss Reward Revealed',
              message: rewardMoment.nextObjective,
              temporary: true,
            };
            current.cinematicTimer = 3.2;
            addRewardPulse('boss-reward-pulse', keyItem.x, keyItem.y, 'REWARD REVEALED', {
              color: keyItem.color || '#b45309',
              fill: 'rgba(180, 83, 9, 0.12)',
              radius: 70,
              timer: 0.9,
            });
          } else {
            current.notice = `${b.name} defeated. Path secured.`;
          }
          if (current.bossDomain?.bossId === b.id) {
            current.bossDomain = null;
          }
        }
      }
    });

    // Gates
    getRouteGateDoorwayEntries().forEach((entry) => {
      const status = getDoorwayGateStatus(entry, current);
      const activeGate = status.activeGate;
      const doorway = entry.doorway;
      if (!activeGate || !isEntityActiveInScene(activeGate, current)) return;
      const blockX = doorway?.blockX ?? activeGate.x;
      const collisionWidth = doorway?.width ?? activeGate.width;
      const gateCollision = {
        x: blockX,
        y: activeGate.y,
        width: Math.max(activeGate.width, collisionWidth),
        height: activeGate.height,
      };
      const reachedGate = rectsOverlap(player, gateCollision)
        || (player.x + player.width > blockX && player.x < blockX + gateCollision.width + 18);
      if (status.gatesToOpen.length > 0 && reachedGate) {
        status.gatesToOpen.forEach(gateToOpen => current.openedRouteGateIds.add(gateToOpen.id));
        const guidance = status.guidance || getGateGuidance(activeGate, current);
        current.notice = guidance.openMessage;
        current.cinematicEvent = {
          id: `${entry.id}-opened`,
          name: guidance.activeGateName,
          message: guidance.openMessage,
          temporary: true,
        };
        current.cinematicTimer = 2.4;
        current.itemPurposeNoticeTimer = Math.max(current.itemPurposeNoticeTimer || 0, 2.2);
        addRewardPulse('route-gate-open', blockX, activeGate.y + 64, 'SEAL OPEN', {
          color: '#38bdf8',
          fill: 'rgba(56, 189, 248, 0.13)',
          radius: 66,
          timer: 0.78,
        });
        audioControls?.playExpeditionSfx?.('gateUnlock');
        audioControls?.playExpeditionStinger?.('gateUnlock');
      } else if (!status.complete && reachedGate) {
        player.x = blockX - player.width - 5;
        current.notice = status.guidance?.notice || activeGate.message;
        audioControls?.playExpeditionSfx?.('gateBlocked');
      }
    });

    // Final Goal
    if (rectsOverlap(player, GATE) && !current.discoveryEntranceActive && !current.discoveryEntranceHandoffStarted) {
      current.discoveryEntranceActive = true;
      current.discoveryEntranceTimer = DISCOVERY_ENTRANCE_REVEAL_SECONDS;
      current.notice = `${DISCOVERY_ENTRANCE.name}. ${DISCOVERY_ENTRANCE.handoffMessage}`;
      current.cinematicEvent = {
        id: DISCOVERY_ENTRANCE.id,
        name: DISCOVERY_ENTRANCE.name,
        message: DISCOVERY_ENTRANCE.message,
        temporary: false,
      };
      current.cinematicTimer = DISCOVERY_ENTRANCE_REVEAL_SECONDS;
      current.dynamicEnvironmentEvent = {
        id: 'discovery-entrance-reveal',
        type: 'shrine-glow',
        x: GATE.x + GATE.width / 2,
        name: DISCOVERY_ENTRANCE.name,
        duration: DISCOVERY_ENTRANCE_REVEAL_SECONDS,
      };
      current.dynamicEnvironmentEventTimer = DISCOVERY_ENTRANCE_REVEAL_SECONDS;
      current.hitStopTimer = Math.max(current.hitStopTimer, 0.05);
      current.cameraShakeTimer = Math.max(current.cameraShakeTimer, 0.16);
      current.cameraShakeStrength = Math.max(current.cameraShakeStrength, 0.16);
      addRewardPulse('collection-complete', GATE.x + GATE.width / 2, GATE.y + 18, 'DISCOVERY FOUND', {
        color: DISCOVERY_ENTRANCE.glowColor,
        fill: 'rgba(250, 204, 21, 0.14)',
        radius: 82,
        timer: 0.92,
      });
      audioControls?.playExpeditionStinger?.('evidenceDiscovery');
      audioControls?.playSuccess?.();
      syncHud();
    }

    // Camera
    const openingCameraReveal = getOpeningCameraRevealTarget(current);
    const camera = openingCameraReveal || getCameraFollowTarget(current);
    current.targetCameraX = camera.targetCameraX;
    current.cameraMode = camera.mode;
    current.cameraFocusTarget = camera.focusTarget;
    if (!Number.isFinite(current.cameraX)) current.cameraX = camera.targetCameraX;
    const smoothing = camera.mode === 'opening-reveal' || camera.mode === 'opening-entrance-stage' || camera.mode === 'opening-threshold'
      ? 0.18
      : camera.mode === 'boss-intro'
        ? JOURNEY_CAMERA.bossIntroSmoothing
        : camera.mode === 'stage-entrance'
          ? 0.16
        : JOURNEY_CAMERA.followSmoothing;
    const cameraStep = clamp(
      (current.targetCameraX - current.cameraX) * smoothing,
      camera.mode === 'opening-reveal' || camera.mode === 'opening-entrance-stage' || camera.mode === 'opening-threshold' || camera.mode === 'stage-entrance' ? -42 : -JOURNEY_CAMERA.maxStep,
      camera.mode === 'opening-reveal' || camera.mode === 'opening-entrance-stage' || camera.mode === 'opening-threshold' || camera.mode === 'stage-entrance' ? 42 : JOURNEY_CAMERA.maxStep,
    );
    current.cameraX = clampCameraX(current.cameraX + cameraStep);

    // Time
    current.timeAccumulator += dt;
    if (current.timeAccumulator >= 1) {
      current.resources.time -= 1;
      current.timeAccumulator = 0;
      if (current.resources.time <= 0) triggerJourneyRescue('Time expired. Field team rescued.');
    }

  }, [briefingOpen, audioControls, onComplete, triggerJourneyRescue, openingAtmosphereSfxKey, scopedJourneyAssetPacks.isChinaJourney, scopedJourneyAssetPacks.isEgyptJourney, scopedJourneyAssetPacks.isRomeJourney, targetCivilisation, buildBossRewardMoment, completeOpeningThresholdScene, enterLevelFromThreshold, startOpeningCinematic, startLevelThresholdEncounter, startTempleThresholdTransition, getActiveHiddenRoutes, getActiveSecretCollectibles, getActiveShardGateProgress, getAttackBox, getAttackHurtbox, getPlayerAttackNearMissTarget, getBossPhaseConfig, getBossVulnerabilityState, getDoorwayGateStatus, getEnemyPatternConfig, getObjectiveProgress, getGateGuidance, getRenderableCheckpoints, getRenderableHazards, getRenderablePlatforms, getRenderableTrapPlatforms, getLiveScorpionNestBlockers, getRouteAccessState, getRouteGateDoorwayEntries, isRouteRewardAccessible, isLowStamina, addCombatEffect, applyCombatHitImpact, applyOpeningEntranceStage, recordEnvironmentInteraction, getPlayerAttackState, getSectionDisplayName, getSectionDisplayTitle, resolveChamberEntryTrigger, resolveChamberReturnPoint, syncHud, updateArrivalThresholdTrial]);

  return { update };
}
