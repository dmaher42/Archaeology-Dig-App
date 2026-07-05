import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Backpack,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
  Gauge,
  Map as MapIcon,
  ShieldAlert,
  Sparkles,
  Search,
  BookOpen,
  Ruler,
  Compass,
  Home,
  Pause,
  Play,
  Gem,
  Target,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BUREAU_CASES } from '../utils/gameLogic';
import ExpeditionJourney, { JourneyControlsReference } from './ExpeditionJourney';
import { useExpeditionDigDraw } from './useExpeditionDigDraw.js';
import { useExpeditionDigSimulation } from './useExpeditionDigSimulation.js';
import DynastyTimelinePuzzle from './DynastyTimelinePuzzle.jsx';
import { CHINA_DYNASTY_TIMELINE } from './expedition-journey/chinaJourneyData.js';
import { getJourneyToolsForCivilisation } from './expedition-journey/journeyDataRouter.js';
import {
  createExcavationMapAssetState,
  getMissingExcavationMapAssets,
  loadExcavationMapAssetPack,
} from './expedition/expeditionMapAssets';
import { EXPEDITION_ROOM_ZONE_BY_ID } from './expedition/expeditionMapLayout';
import {
  BASE_CAMP_PROGRESSION_STORAGE_KEY,
  BASE_CAMP_SHOP_ITEMS,
  BASE_CAMP_SHOP_SECTIONS,
  applyJourneyShardDeposit,
  applyShopPurchase,
  getActiveUpgradeEffects,
  getOwnedItemIds,
} from './expedition/baseCampShop';
import { getZoneChallenge } from './expedition/expeditionZoneChallenges';
import {
  EXPEDITION_STAGE_IDS,
  EXPEDITION_STAGES,
  PLAYABLE_EXPEDITION_STAGE_ID,
} from './expedition/expeditionStages';
import {
  BRUSH_RECOVERY_BONUS,
  CAMERA_DOCUMENTATION_BONUS,
  CLAIM_OPTIONS,
  EGYPT_ARCHIVE_ASSETS,
  EGYPT_ARCHIVE_CINEMATIC_STEPS,
  EGYPT_ARCHIVE_PROLOGUE_ITEMS,
  EXCAVATION_MAP_VISUAL_TUNING_VERSION,
  EXCAVATION_METHODS,
  EXCAVATION_METHOD_BY_ID,
  GRID_COSTS,
  INITIAL_RESOURCES,
  INVESTIGATION_BONUS,
  MAP_EVIDENCE_TYPES,
  MAP_HEIGHT,
  MAP_WIDTH,
  MAX_EVIDENCE_ITEMS,
  PLAYER_SIZE,
  ROME_ARCHIVE_CINEMATIC_STEPS,
  ROME_ARCHIVE_PROLOGUE_ITEMS,
  SURVEY_COST,
  TROWEL_EXCAVATION_BONUS,
} from './expeditionDigData.js';
import {
  buildExcavationGuardians,
  buildExpeditionEvidence,
  chooseEvidenceHuntMission,
  clamp,
  evidenceMatchesMission,
  evidenceVisibleForGrid,
  getEvidenceMissionLabel,
  getExcavationOutcome,
  getExpeditionMapContent,
  getExplorerProfileFitLine,
  getGridSquaresForZone,
  getMapEvidenceTypeIdForToken,
  getMapEvidenceTypeName,
  getMissionRequiredCount,
  getOpenedGridSquareForEvidence,
  getRankFeedback,
  getRankTitle,
  getResourceFailureMessage,
  getSurveyZoneName,
  getToolEffectsForCivilisation,
  getZoneName,
  isMappingAccurate,
  loadBaseCampProgression,
  saveBaseCampProgression,
} from './expeditionDigLogic.js';

export function ExpeditionMode({ onBackToMenu, audioControls = {}, onSendToLab }) {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const playerRef = useRef({ x: 42, y: 498 });
  const journeySnapshotRef = useRef(null);
  const collectedRef = useRef([]);
  const tokensRef = useRef(buildExpeditionEvidence());
  const guardiansRef = useRef(buildExcavationGuardians());
  const resourcesRef = useRef(INITIAL_RESOURCES);
  const hazardCooldownRef = useRef({});
  const guardianCooldownRef = useRef({});
  const lockedRef = useRef(false);
  const tickAccumulatorRef = useRef(0);
  const nearbyTokenRef = useRef(null);
  const nearbySurveyZoneRef = useRef(null);
  const dismissedTokenRef = useRef(null);
  const cameraRef = useRef({ x: 0, y: 0 });
  const shroudRectRef = useRef({ x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT });
  const [collectedEvidence, setCollectedEvidence] = useState([]);
  const [fieldNotes, setFieldNotes] = useState([]);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [currentZone, setCurrentZone] = useState('Market Area');
  const [activeMission, setActiveMission] = useState(() => chooseEvidenceHuntMission());
  const [notice, setNotice] = useState('Complete the Bureau evidence hunt to unlock the Exit Gate.');
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [nearbyToken, setNearbyToken] = useState(null);
  const [selectedSurveyZone, setSelectedSurveyZone] = useState(null);
  const [surveyedZones, setSurveyedZones] = useState(() => new Set());
  const [nearbySurveyZone, setNearbySurveyZone] = useState(null);
  const [surveyReportZone, setSurveyReportZone] = useState(null);
  const [gridSetupOpen, setGridSetupOpen] = useState(false);
  const [selectedGridSquare, setSelectedGridSquare] = useState(null);
  const [openedGridSquares, setOpenedGridSquares] = useState(() => new Set());
  const [inspectionToken, setInspectionToken] = useState(null);
  const [inspectionStep, setInspectionStep] = useState('review');
  const [inspectionFeedback, setInspectionFeedback] = useState(null);
  const [selectedExcavationMethod, setSelectedExcavationMethod] = useState(null);
  const [excavationMethodHistory, setExcavationMethodHistory] = useState([]);
  const [selectedMappedEvidenceType, setSelectedMappedEvidenceType] = useState('');
  const [mappingFeedback, setMappingFeedback] = useState(null);
  const [mappedFinds, setMappedFinds] = useState([]);
  const [missionEvidenceCount, setMissionEvidenceCount] = useState(0);
  const [claimOpen, setClaimOpen] = useState(false);
  const [selectedCivilisation, setSelectedCivilisation] = useState('');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [focusedStageIndex, setFocusedStageIndex] = useState(0);
  const [claimResult, setClaimResult] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [expeditionFailure, setExpeditionFailure] = useState(null);
  const [expeditionStage, setExpeditionStage] = useState('journey');
  const [selectedExpedition, setSelectedExpedition] = useState(null);
  const [previewExpedition, setPreviewExpedition] = useState(null);
  const [baseCampOpen, setBaseCampOpen] = useState(false);
  const [dynastyTimelineOpen, setDynastyTimelineOpen] = useState(false);
  const [fieldKit, setFieldKit] = useState([]);
  const [journeyRunId, setJourneyRunId] = useState(0);
  const [journeyOpeningMode, setJourneyOpeningMode] = useState('standard');
  const [journeyPaused, setJourneyPaused] = useState(false);
  const [journeyCursorHidden, setJourneyCursorHidden] = useState(false);
  const [baseCampProgression, setBaseCampProgression] = useState(loadBaseCampProgression);
  const [shopFeedback, setShopFeedback] = useState(null);
  const baseCampProgressionRef = useRef(baseCampProgression);
  const journeyCursorTimerRef = useRef(null);
  const [excavationMapAssets, setExcavationMapAssets] = useState(() => createExcavationMapAssetState());
  const [selectedMapZone, setSelectedMapZone] = useState(null);
  const [enteredMapZone, setEnteredMapZone] = useState(null);
  const [completedZoneChallenges, setCompletedZoneChallenges] = useState(() => new Set());
  const [activeZoneChallenge, setActiveZoneChallenge] = useState(null);
  const [zoneChallengeFeedback, setZoneChallengeFeedback] = useState(null);
  const [inspectedPrologueItems, setInspectedPrologueItems] = useState(() => new Set());
  const [prologueCinematicStep, setPrologueCinematicStep] = useState(null);

  useEffect(() => {
    window.DEBUG_EXPEDITION = { setExpeditionStage, setBaseCampOpen, setSelectedExpedition };
  }, [setExpeditionStage, setBaseCampOpen, setSelectedExpedition]);

  useEffect(() => {
    baseCampProgressionRef.current = baseCampProgression;
    saveBaseCampProgression(baseCampProgression);
  }, [baseCampProgression]);

  const selectedStageId = selectedExpedition?.id || PLAYABLE_EXPEDITION_STAGE_ID;
  const stageContent = useMemo(() => getExpeditionMapContent(selectedStageId), [selectedStageId]);
  const targetCivilisation = stageContent.targetCivilisation;
  const journeyTools = useMemo(() => (
    getJourneyToolsForCivilisation(targetCivilisation)
  ), [targetCivilisation]);
  const explorerProfileFitLine = useMemo(() => (
    getExplorerProfileFitLine(targetCivilisation)
  ), [targetCivilisation]);
  const mapZones = stageContent.zones;
  const terrainByZone = stageContent.terrainByZone;
  const surveyZones = stageContent.surveyZones;
  const surveyZoneById = stageContent.surveyZoneById;
  const surveyRevealLinks = stageContent.surveyRevealLinks;
  const gridZoneConfigs = stageContent.gridZoneConfigs;
  const mapHazards = stageContent.hazards;
  const mapWalls = stageContent.walls;
  const mapTheme = stageContent.mapTheme;
  const defaultZoneName = stageContent.defaultZoneName;
  const roomMapPackId = stageContent.roomMapPackId;
  const markerPackId = stageContent.markerPackId;
  const gatewayPackId = stageContent.gatewayPackId;
  const mapUiPackId = stageContent.mapUiPackId;
  const challengeUiPackId = stageContent.challengeUiPackId;
  const excavationAssetPackIds = useMemo(() => (
    [...new Set([
      roomMapPackId,
      markerPackId,
      gatewayPackId,
      mapUiPackId,
      challengeUiPackId,
    ].filter(Boolean))]
  ), [challengeUiPackId, gatewayPackId, mapUiPackId, markerPackId, roomMapPackId]);

  useEffect(() => {
    if (!selectedExpedition || expeditionStage !== 'excavation') return undefined;
    return loadExcavationMapAssetPack({
      baseUrl: import.meta.env.BASE_URL || '/',
      packIds: excavationAssetPackIds,
      onUpdate: setExcavationMapAssets,
    });
  }, [excavationAssetPackIds, expeditionStage, selectedExpedition]);

  const trainingCivilisations = useMemo(() => (
    BUREAU_CASES
      .filter(item => item.round === 'training')
      .map(item => item.civilisation)
      .filter(civilisation => CLAIM_OPTIONS.includes(civilisation))
  ), []);
  const claimCivilisations = useMemo(() => (
    [...new Set([...trainingCivilisations, targetCivilisation])]
  ), [targetCivilisation, trainingCivilisations]);

  const missionRequiredCount = getMissionRequiredCount(activeMission);
  const exitUnlocked = missionEvidenceCount >= missionRequiredCount;
  const surveyComplete = Boolean(selectedSurveyZone);
  const selectedMapZoneData = selectedMapZone ? (mapZones.find(zone => zone.id === selectedMapZone) || null) : null;
  const selectedRoomData = selectedMapZone ? (EXPEDITION_ROOM_ZONE_BY_ID[selectedMapZone] || null) : null;
  const activeChallengeData = activeZoneChallenge ? getZoneChallenge(activeZoneChallenge) : null;
  const canSurveySelectedZone = Boolean(selectedMapZone && surveyZoneById[selectedMapZone] && completedZoneChallenges.has(selectedMapZone));
  const gridSquares = useMemo(() => getGridSquaresForZone(selectedSurveyZone, gridZoneConfigs), [gridZoneConfigs, selectedSurveyZone]);
  const baseCampOwnedItemIds = useMemo(() => {
    const owned = getOwnedItemIds(baseCampProgression);
    fieldKit.forEach(toolId => owned.add(toolId));
    return owned;
  }, [baseCampProgression, fieldKit]);
  const permanentUpgradeEffects = useMemo(() => (
    getActiveUpgradeEffects(baseCampProgression.purchasedUpgrades)
  ), [baseCampProgression.purchasedUpgrades]);
  const shopItemsBySection = useMemo(() => (
    BASE_CAMP_SHOP_SECTIONS.map(section => ({
      section,
      items: BASE_CAMP_SHOP_ITEMS.filter(item => item.section === section),
    })).filter(group => group.items.length > 0)
  ), []);
  const activeBaseCampKitSummary = useMemo(() => (
    BASE_CAMP_SHOP_ITEMS
      .filter(item => item.type === 'upgrade' && baseCampProgression.purchasedUpgrades.includes(item.id))
      .map(item => item.activeSummary || item.shortEffect)
      .slice(0, 5)
  ), [baseCampProgression.purchasedUpgrades]);
  const gridComplete = openedGridSquares.size > 0;
  const getVisibleEvidence = useCallback(() => (
    tokensRef.current.filter(token => !token.collected && evidenceVisibleForGrid(token, selectedSurveyZone, openedGridSquares, surveyRevealLinks, gridZoneConfigs))
  ), [gridZoneConfigs, openedGridSquares, selectedSurveyZone, surveyRevealLinks]);
  const getHiddenEvidence = useCallback(() => (
    tokensRef.current.filter(token => !token.collected && !evidenceVisibleForGrid(token, selectedSurveyZone, openedGridSquares, surveyRevealLinks, gridZoneConfigs))
  ), [gridZoneConfigs, openedGridSquares, selectedSurveyZone, surveyRevealLinks]);
  const fieldKitSet = useMemo(() => new Set(fieldKit), [fieldKit]);
  const fieldKitEffects = useMemo(() => ({
    fieldGuideAvailable: fieldKitSet.has('field-guide-page'),
    notebookReady: fieldKitSet.has('notebook'),
    brushReady: fieldKitSet.has('brush'),
    trowelReady: fieldKitSet.has('trowel'),
    cameraReady: fieldKitSet.has('camera'),
    measuringTapeReady: fieldKitSet.has('measuring-tape'),
  }), [fieldKitSet]);
  const selectedEvidence = useMemo(() => (
    collectedEvidence.find(item => item.id === selectedEvidenceId) || null
  ), [collectedEvidence, selectedEvidenceId]);
  const satchelContents = useMemo(() => (
    collectedEvidence.map(item => ({
      ...item,
      matchesMission: evidenceMatchesMission(item, activeMission),
      missionLabel: getEvidenceMissionLabel(item, activeMission),
    }))
  ), [activeMission, collectedEvidence]);
  const pendingEvidence = useMemo(() => (
    inspectionToken ? {
      ...inspectionToken,
      matchesMission: evidenceMatchesMission(inspectionToken, activeMission),
      missionLabel: getEvidenceMissionLabel(inspectionToken, activeMission),
    } : null
  ), [activeMission, inspectionToken]);
  const excavationMethodOpen = Boolean(inspectionToken && inspectionStep === 'excavate');
  const excavationMethodRequired = Boolean(inspectionToken && !inspectionToken.excavationMethod);
  const mappingOpen = Boolean(inspectionToken && inspectionStep === 'map');
  const mappingRequired = Boolean(inspectionToken && !inspectionToken.mappedEvidenceType);
  const pendingMappedEvidence = useMemo(() => (
    inspectionToken ? {
      ...inspectionToken,
      selectedSurveyZone: getSurveyZoneName(selectedSurveyZone, surveyZoneById),
      selectedGridSquare: getOpenedGridSquareForEvidence(inspectionToken, selectedSurveyZone, openedGridSquares, gridZoneConfigs) || selectedGridSquare,
      mappedEvidenceType: inspectionToken.mappedEvidenceType ? getMapEvidenceTypeName(inspectionToken.mappedEvidenceType) : null,
      mappingAccurate: inspectionToken.mappingAccurate ?? null,
    } : null
  ), [gridZoneConfigs, inspectionToken, openedGridSquares, selectedGridSquare, selectedSurveyZone, surveyZoneById]);
  const inventoryFullDecisionOpen = Boolean(inspectionToken && ['capacity', 'replace', 'mission'].includes(inspectionStep));
  const evidenceQualitySummary = useMemo(() => (
    collectedEvidence.reduce((summary, item) => {
      const quality = item.evidenceQuality || 'good';
      return {
        ...summary,
        [quality]: (summary[quality] || 0) + 1,
      };
    }, { excellent: 0, good: 0, damaged: 0 })
  ), [collectedEvidence]);
  const mappedFindsSummary = useMemo(() => (
    mappedFinds
  ), [mappedFinds]);
  const mappingAccuracySummary = useMemo(() => {
    const accurate = mappedFindsSummary.filter(item => item.mappingAccurate).length;
    const needsReview = mappedFindsSummary.length - accurate;
    return { mapped: mappedFindsSummary.length, accurate, needsReview };
  }, [mappedFindsSummary]);
  const missingTools = useMemo(() => (
    journeyTools.filter(tool => !fieldKitSet.has(tool.id))
  ), [fieldKitSet, journeyTools]);
  const collectedTools = useMemo(() => (
    journeyTools.filter(tool => fieldKitSet.has(tool.id))
  ), [fieldKitSet, journeyTools]);
  const fieldKitImpact = useMemo(() => (
    journeyTools.map((tool) => {
      const effects = getToolEffectsForCivilisation(tool.id, targetCivilisation);
      const isCollected = fieldKitSet.has(tool.id);
      return {
        id: tool.id,
        name: tool.name,
        shortTitle: effects?.shortTitle || tool.name,
        icon: effects?.icon || Search,
        isCollected,
        impact: effects?.impact || 'N/A',
        collectedDesc: effects?.collectedDesc || 'Standard equipment is secured.',
        missingDesc: effects?.missingDesc || 'Standard equipment is missing.',
      };
    })
  ), [fieldKitSet, journeyTools, targetCivilisation]);
  const fieldKitBonus = useMemo(() => {
    if (!claimResult) return 0;
    const bonus =
      (fieldKitEffects.fieldGuideAvailable ? 2 : 0) +
      (fieldKitEffects.notebookReady && fieldNotes.length > 0 ? 2 : 0) +
      (fieldKitEffects.cameraReady && collectedEvidence.length > 0 ? 2 : 0) +
      (fieldKitEffects.measuringTapeReady ? 2 : 0) +
      (fieldKitEffects.trowelReady && collectedEvidence.some(item => ['structure', 'material_culture'].includes(item.missionType)) ? 2 : 0) +
      (fieldKitEffects.brushReady && collectedEvidence.some(item => item.isMissionEvidence) ? 2 : 0);
    return Math.min(10, bonus);
  }, [claimResult, collectedEvidence, fieldKitEffects, fieldNotes.length]);
  const evidenceQualityBonus = useMemo(() => {
    if (!claimResult) return 0;
    const bonus = (evidenceQualitySummary.excellent * 2) - (evidenceQualitySummary.damaged * 2);
    return clamp(bonus, -6, 6);
  }, [claimResult, evidenceQualitySummary]);
  const mappingAccuracyBonus = useMemo(() => {
    if (!claimResult) return 0;
    const bonus = (mappingAccuracySummary.accurate * 2) - mappingAccuracySummary.needsReview + (fieldKitEffects.measuringTapeReady ? 1 : 0);
    return clamp(bonus, -10, 10);
  }, [claimResult, fieldKitEffects.measuringTapeReady, mappingAccuracySummary]);
  const claimCorrect = claimResult ? selectedCivilisation === targetCivilisation : false;
  const evidenceSupportsClaim = claimResult ? selectedEvidence?.supports === targetCivilisation : false;
  const missionComplete = missionEvidenceCount >= missionRequiredCount;
  const finalScore = useMemo(() => {
    if (!claimResult) return null;
    const toolsScore = Math.round((fieldKit.length / journeyTools.length) * 15);
    const investigationScore = Math.round((resources.investigation / 100) * 10);
    const staminaScore = Math.round((resources.stamina / 100) * 5);
    const timeScore = Math.round((resources.time / INITIAL_RESOURCES.time) * 5);
    return clamp(
      (missionComplete ? 25 : 0) +
      (claimCorrect ? 20 : 0) +
      (evidenceSupportsClaim ? 20 : 0) +
      toolsScore +
      investigationScore +
      staminaScore +
      timeScore +
      fieldKitBonus +
      mappingAccuracyBonus +
      evidenceQualityBonus,
      0,
      100
    );
  }, [claimCorrect, claimResult, evidenceQualityBonus, evidenceSupportsClaim, fieldKit.length, fieldKitBonus, journeyTools.length, mappingAccuracyBonus, missionComplete, resources]);
  const finalRank = finalScore === null ? null : getRankTitle(finalScore);
  const resultFeedback = finalScore === null ? '' : getRankFeedback(finalScore);
  const syncInventory = useCallback((items) => {
    const nextItems = [...items];
    collectedRef.current = nextItems;
    setCollectedEvidence(nextItems);
    setMissionEvidenceCount(nextItems.filter(item => item.isMissionEvidence).length);
  }, []);

  const triggerExpeditionRescue = useCallback((message) => {
    lockedRef.current = true;
    keysRef.current = {};
    setInspectionToken(null);
    setInspectionStep('review');
    setInspectionFeedback(null);
    setSelectedExcavationMethod(null);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
    setSurveyReportZone(null);
    setGridSetupOpen(false);
    setClaimOpen(false);
    setResultOpen(false);
    setExpeditionFailure({
      stage: expeditionStage,
      message,
    });
    setNotice(message);
    audioControls.playError?.();
  }, [audioControls, expeditionStage]);

  const syncResources = useCallback((patch) => {
    const nextResources = {
      investigation: clamp(resourcesRef.current.investigation + (patch.investigation || 0), 0, 100),
      stamina: clamp(resourcesRef.current.stamina + (patch.stamina || 0), 0, 100),
      time: clamp(resourcesRef.current.time + (patch.time || 0), 0, 600),
    };
    resourcesRef.current = nextResources;
    setResources({ ...resourcesRef.current });
    const resourceLost = (patch.investigation || 0) < 0 || (patch.stamina || 0) < 0 || (patch.time || 0) < 0;
    if (resourceLost && (nextResources.investigation <= 0 || nextResources.stamina <= 0 || nextResources.time <= 0)) {
      triggerExpeditionRescue(getResourceFailureMessage(nextResources));
    }
  }, [triggerExpeditionRescue]);

  const recordFieldNote = useCallback((token, reason) => {
    if (!token) return;
    setFieldNotes(previous => (
      previous.some(note => note.evidenceId === token.id && note.reason === reason)
        ? previous
        : [
            ...previous,
            {
              id: `${token.id}-${reason}`,
              evidenceId: token.id,
              reason,
              name: token.name,
              category: token.category,
              clue: token.clue,
              note: reason === 'rejected'
                ? `${token.name} was inspected but not selected for the mission. It was ${token.category}, so the team kept looking.`
                : `${token.name} was inspected and recorded as ${token.category} evidence from the ${token.zone}.`,
            },
          ]
    ));
  }, []);

  const recordGridFieldNote = useCallback((square, zoneName) => {
    if (!square || !zoneName) return;
    setFieldNotes(previous => (
      previous.some(note => note.id === `grid-${zoneName}-${square.id}`)
        ? previous
        : [
            ...previous,
            {
              id: `grid-${zoneName}-${square.id}`,
              evidenceId: `grid-${square.id}`,
              reason: 'grid-opened',
              name: `Grid ${square.id}`,
              category: 'Grid square',
              clue: square.clue,
              note: `${zoneName} grid ${square.id} was opened and recorded before excavation. ${square.possibleEvidenceHint}`,
            },
          ]
    ));
  }, []);

  const recordExcavationMethodNote = useCallback((token, method, outcome) => {
    if (!token || !method || !outcome) return;
    setFieldNotes(previous => (
      previous.some(note => note.id === `${token.id}-excavation-method`)
        ? previous
        : [
            ...previous,
            {
              id: `${token.id}-excavation-method`,
              evidenceId: token.id,
              reason: 'excavation-method',
              name: token.name,
              category: token.category,
              clue: token.clue,
              note: `${method.name} was used on ${token.name}. Evidence quality: ${outcome.quality}.`,
          },
        ]
    ));
  }, []);

  const recordMappingNote = useCallback((token, mapping) => {
    if (!token || !mapping) return;
    setFieldNotes(previous => (
      previous.some(note => note.id === `${token.id}-mapping`)
        ? previous
        : [
            ...previous,
            {
              id: `${token.id}-mapping`,
              evidenceId: token.id,
              reason: 'mapping',
              name: token.name,
              category: token.category,
              clue: token.clue,
              note: `${mapping.zone} | ${mapping.gridSquare} | ${mapping.evidenceType}. Mapping ${mapping.mappingAccurate ? 'was accurate' : 'needs review'}.`,
            },
          ]
    ));
  }, []);

  const startZoneChallenge = useCallback((zoneId) => {
    const challenge = getZoneChallenge(zoneId);
    if (!challenge) return;
    setSelectedMapZone(zoneId);
    setEnteredMapZone(zoneId);
    setActiveZoneChallenge(zoneId);
    setZoneChallengeFeedback(null);
    setNotice(`${challenge.title}: complete the room check before surveying.`);
  }, []);

  const enterSelectedMapZone = useCallback((zoneId = selectedMapZone) => {
    if (!zoneId) return;
    setEnteredMapZone(zoneId);
    if (!completedZoneChallenges.has(zoneId)) {
      startZoneChallenge(zoneId);
      return;
    }
    const zoneName = mapZones.find(zone => zone.id === zoneId)?.name || getSurveyZoneName(zoneId, surveyZoneById) || 'selected zone';
    setNotice(`${zoneName} entry check complete. Survey is ready.`);
  }, [completedZoneChallenges, mapZones, selectedMapZone, startZoneChallenge, surveyZoneById]);

  const answerZoneChallenge = useCallback((answerId) => {
    const challenge = activeZoneChallenge ? getZoneChallenge(activeZoneChallenge) : null;
    if (!challenge) return;
    const answer = challenge.answers.find(item => item.id === answerId);
    const correct = answerId === challenge.correctAnswerId;
    setZoneChallengeFeedback({
      correct,
      answerId,
      message: answer?.feedback || (correct ? 'Correct.' : 'Try again.'),
    });
    if (correct) {
      setCompletedZoneChallenges(previous => new Set([...previous, activeZoneChallenge]));
      setNotice(`${challenge.title} complete. Survey is unlocked for this zone.`);
    } else {
      setNotice('Try the zone-entry challenge again.');
    }
  }, [activeZoneChallenge]);

  const closeZoneChallenge = useCallback(() => {
    setActiveZoneChallenge(null);
    setZoneChallengeFeedback(null);
  }, []);

  const selectMapZoneAtPoint = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = MAP_WIDTH / rect.width;
    const scaleY = MAP_HEIGHT / rect.height;
    const x = (event.clientX - rect.left) * scaleX + cameraRef.current.x;
    const y = (event.clientY - rect.top) * scaleY + cameraRef.current.y;
    const zone = mapZones.find(item => x >= item.x && x <= item.x + item.w && y >= item.y && y <= item.y + item.h);
    if (!zone) return;
    setSelectedMapZone(zone.id);
    setNotice(`${zone.name} selected. Enter the zone to complete its room check.`);
  }, [mapZones]);

  const openSurveyReport = useCallback((zone = nearbySurveyZoneRef.current, options = {}) => {
    if (briefingOpen || !zone || lockedRef.current || inspectionToken || expeditionFailure) return;
    setSelectedMapZone(zone.id);
    if (!options.skipChallenge && !completedZoneChallenges.has(zone.id)) {
      startZoneChallenge(zone.id);
      return;
    }
    if (!surveyedZones.has(zone.id)) {
      syncResources(SURVEY_COST);
      setSurveyedZones(previous => new Set([...previous, zone.id]));
    }
    setSurveyReportZone(zone);
    setNotice(`Survey report opened for ${zone.name}.`);
  }, [briefingOpen, completedZoneChallenges, expeditionFailure, inspectionToken, startZoneChallenge, surveyedZones, syncResources]);

  const keepSurveying = () => {
    setSurveyReportZone(null);
    setNotice('Keep surveying possible dig zones before choosing where to dig.');
  };

  const markSurveyZone = (zone = surveyReportZone) => {
    if (!zone) return;
    setSelectedMapZone(zone.id);
    setEnteredMapZone(zone.id);
    setSelectedSurveyZone(zone.id);
    setSurveyReportZone(null);
    setGridSetupOpen(true);
    setSelectedGridSquare(null);
    setOpenedGridSquares(new Set());
    nearbyTokenRef.current = null;
    setNearbyToken(null);
    dismissedTokenRef.current = null;
    setNotice(`${zone.name} marked as the dig zone. Open grid squares before evidence can be inspected.`);
  };

  const keepExploringGrid = useCallback(() => {
    setGridSetupOpen(false);
    setNotice('Keep exploring the dig zone or reopen the grid setup when you are ready to investigate a square.');
  }, []);

  const openGridSetup = useCallback(() => {
    if (!selectedSurveyZone || briefingOpen || lockedRef.current || expeditionFailure) return;
    setGridSetupOpen(true);
    setNotice(`Grid setup opened for ${getSurveyZoneName(selectedSurveyZone, surveyZoneById)}.`);
  }, [briefingOpen, expeditionFailure, selectedSurveyZone, surveyZoneById]);

  const openGridSquare = useCallback((square) => {
    if (!square || !selectedSurveyZone) return;
    const zoneName = getSurveyZoneName(selectedSurveyZone, surveyZoneById);
    const alreadyOpened = openedGridSquares.has(square.id);

    if (!alreadyOpened) {
      syncResources(GRID_COSTS[square.risk] || GRID_COSTS.Low);
      setOpenedGridSquares(previous => new Set([...previous, square.id]));
      if (fieldKitEffects.notebookReady) {
        recordGridFieldNote(square, zoneName);
      }
    }

    setSelectedGridSquare(square.id);
    setGridSetupOpen(false);
    nearbyTokenRef.current = null;
    setNearbyToken(null);
    dismissedTokenRef.current = null;

    const measuringTapeNote = !alreadyOpened && fieldKitEffects.measuringTapeReady
      ? ' Measuring Tape used: grid lines marked clearly.'
      : '';
    const repeatNote = alreadyOpened
      ? ' This square was already opened, so no extra resources were used.'
      : '';
    setNotice(`${square.openFeedback}${repeatNote}${measuringTapeNote}`);
  }, [fieldKitEffects.measuringTapeReady, fieldKitEffects.notebookReady, openedGridSquares, recordGridFieldNote, selectedSurveyZone, surveyZoneById, syncResources]);

  const openInspection = useCallback((token = nearbyTokenRef.current) => {
    if (briefingOpen || !surveyComplete || !gridComplete || !token || token.collected || lockedRef.current) return;
    if (!evidenceVisibleForGrid(token, selectedSurveyZone, openedGridSquares, surveyRevealLinks, gridZoneConfigs)) return;
    setInspectionToken(token);
    setInspectionStep(token.excavationMethod ? (token.mappedEvidenceType ? 'review' : 'map') : 'excavate');
    setInspectionFeedback(null);
    setMappingFeedback(null);
    setSelectedExcavationMethod(token.excavationMethod || null);
    setNotice(`Inspecting ${token.name}. Choose an excavation method before deciding if it matches the mission.`);
  }, [briefingOpen, gridComplete, gridZoneConfigs, openedGridSquares, selectedSurveyZone, surveyComplete, surveyRevealLinks]);

  const chooseExcavationMethod = useCallback((methodId) => {
    if (!inspectionToken || inspectionToken.collected) return;
    const method = EXCAVATION_METHOD_BY_ID[methodId];
    const outcome = getExcavationOutcome(methodId, inspectionToken, fieldKitEffects, activeMission);
    if (!method || !outcome) return;

    syncResources(method.cost);
    if (outcome.bonus > 0) {
      syncResources({ investigation: outcome.bonus });
    }

    const updatedToken = {
      ...inspectionToken,
      excavationMethod: method.id,
      excavationMethodName: method.name,
      evidenceQuality: outcome.quality,
      excavationDamaged: outcome.damaged,
      excavationFeedback: outcome.feedback,
    };
    tokensRef.current = tokensRef.current.map(token => (
      token.id === inspectionToken.id ? updatedToken : token
    ));
    nearbyTokenRef.current = nearbyTokenRef.current?.id === inspectionToken.id
      ? updatedToken
      : nearbyTokenRef.current;
    setNearbyToken(previous => previous?.id === inspectionToken.id ? updatedToken : previous);
    setInspectionToken(updatedToken);

    const historyItem = {
      evidenceId: inspectionToken.id,
      evidenceName: updatedToken.name,
      methodId: method.id,
      methodName: method.name,
      quality: outcome.quality,
      damaged: outcome.damaged,
      cost: method.cost,
      bonus: outcome.bonus,
      feedback: outcome.feedback,
      kitFeedback: outcome.kitFeedback,
    };
    setExcavationMethodHistory(previous => (
      previous.some(item => item.evidenceId === inspectionToken.id)
        ? previous.map(item => item.evidenceId === inspectionToken.id ? historyItem : item)
        : [...previous, historyItem]
    ));

    if (fieldKitEffects.notebookReady) {
      recordExcavationMethodNote(updatedToken, method, outcome);
    }

    setSelectedExcavationMethod(historyItem);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
    setInspectionStep('map');
    const bonusText = outcome.bonus > 0 ? ` Field kit bonus: +${outcome.bonus} investigation.` : '';
    const kitText = outcome.kitFeedback ? ` ${outcome.kitFeedback}` : '';
    setNotice(`${method.name} used. Evidence quality: ${outcome.quality}.${bonusText}${kitText}`);
  }, [activeMission, fieldKitEffects, inspectionToken, recordExcavationMethodNote, syncResources]);

  const recordMappedFind = useCallback(() => {
    if (!inspectionToken || inspectionToken.collected || !selectedMappedEvidenceType) return;
    const evidenceTypeId = selectedMappedEvidenceType;
    const evidenceTypeName = getMapEvidenceTypeName(evidenceTypeId);
    const accurate = isMappingAccurate(inspectionToken, evidenceTypeId);
    const zoneName = getSurveyZoneName(selectedSurveyZone, surveyZoneById);
    const gridSquare = getOpenedGridSquareForEvidence(inspectionToken, selectedSurveyZone, openedGridSquares, gridZoneConfigs) || selectedGridSquare || 'Unknown';
    const mapping = {
      id: inspectionToken.id,
      name: inspectionToken.name,
      zone: zoneName,
      gridSquare,
      evidenceType: evidenceTypeName,
      mappedZone: zoneName,
      mappedGridSquare: gridSquare,
      mappedEvidenceType: evidenceTypeName,
      playerMappedType: evidenceTypeId,
      mappingAccurate: accurate,
    };
    const updatedToken = {
      ...inspectionToken,
      mappedZone: zoneName,
      mappedGridSquare: gridSquare,
      mappedEvidenceType: evidenceTypeName,
      playerMappedType: evidenceTypeId,
      mappingAccurate: accurate,
    };
    tokensRef.current = tokensRef.current.map(token => (
      token.id === inspectionToken.id ? updatedToken : token
    ));
    nearbyTokenRef.current = nearbyTokenRef.current?.id === inspectionToken.id
      ? updatedToken
      : nearbyTokenRef.current;
    setNearbyToken(previous => previous?.id === inspectionToken.id ? updatedToken : previous);
    setInspectionToken(updatedToken);

    if (fieldKitEffects.measuringTapeReady) {
      syncResources({ investigation: 1 });
    }
    if (fieldKitEffects.notebookReady) {
      recordMappingNote(updatedToken, mapping);
    }
    setMappedFinds(previous => (
      previous.some(item => item.id === inspectionToken.id)
        ? previous.map(item => item.id === inspectionToken.id ? mapping : item)
        : [...previous, mapping]
    ));

    setMappingFeedback({
      accurate,
      text: accurate
        ? 'Mapping complete. You recorded the evidence accurately.'
        : 'Mapping recorded, but the evidence type may need review. Historians often revisit their first interpretation.',
    });
    setInspectionStep('review');
    setNotice(fieldKitEffects.measuringTapeReady
      ? 'Measuring Tape used: grid location recorded accurately.'
      : accurate
        ? 'Mapping complete. You recorded the evidence accurately.'
        : 'Mapping recorded, but the evidence type may need review.');
  }, [fieldKitEffects.measuringTapeReady, fieldKitEffects.notebookReady, gridZoneConfigs, inspectionToken, openedGridSquares, recordMappingNote, selectedGridSquare, selectedMappedEvidenceType, selectedSurveyZone, surveyZoneById, syncResources]);

  const beginExpedition = () => {
    keysRef.current = {};
    tickAccumulatorRef.current = 0;
    setBriefingOpen(false);
    setNotice('Survey the site first. Choose a promising dig zone before inspecting evidence.');
  };

  const openExpeditionStage = useCallback((stage) => {
    const content = getExpeditionMapContent(stage.id);
    const canOpenPlayableStage = stage.route === 'playable' || stage.route === 'map-playable';
    if (!canOpenPlayableStage || !content) {
      setPreviewExpedition(stage);
      return;
    }

    const nextMission = chooseEvidenceHuntMission(null, content.missions);
    audioControls.initAudio?.();
    audioControls.playExpeditionMusic?.(content.routeMusicCue);
    setSelectedExpedition(stage);
    setPreviewExpedition(null);
    const isEgypt = stage.id === EXPEDITION_STAGE_IDS.EGYPT;
    const hasPrologue = isEgypt;
    setExpeditionStage(content.startsAt === 'excavation' ? 'excavation' : hasPrologue ? 'archive-prologue' : 'journey');
    setJourneyOpeningMode(isEgypt ? 'arrival-threshold' : 'standard');
    setInspectedPrologueItems(new Set());
    setPrologueCinematicStep(null);
    setBaseCampOpen(false);
    setJourneyPaused(false);
    const savedTools = (baseCampProgressionRef.current?.purchasedUpgrades || []).filter(id =>
      ['brush', 'trowel', 'camera', 'notebook', 'measuring-tape', 'field-guide-page'].includes(id)
    );
    setFieldKit(content.startsAt === 'excavation' ? ['field-guide-page', 'notebook', 'brush', 'trowel', 'camera', 'measuring-tape'] : savedTools);
    setActiveMission(nextMission);
    setJourneyRunId(previous => previous + 1);
    journeySnapshotRef.current = null;
    playerRef.current = { x: 42, y: 498 };
    if (content && content.zones && content.zones.length > 0) {
      const startZone = content.zones.find(zone => zone.id === 'market') || content.zones[0];
      const startCamX = (startZone.x + startZone.w / 2) - 400;
      const startCamY = (startZone.y + startZone.h / 2) - 280;
      cameraRef.current = { x: startCamX, y: startCamY };
      shroudRectRef.current = { x: startZone.x, y: startZone.y, w: startZone.w, h: startZone.h };
    } else {
      cameraRef.current = { x: 0, y: 0 };
      shroudRectRef.current = { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT };
    }
    tokensRef.current = buildExpeditionEvidence(content);
    guardiansRef.current = buildExcavationGuardians(content.guardians);
    collectedRef.current = [];
    resourcesRef.current = INITIAL_RESOURCES;
    hazardCooldownRef.current = {};
    guardianCooldownRef.current = {};
    lockedRef.current = false;
    tickAccumulatorRef.current = 0;
    nearbyTokenRef.current = null;
    nearbySurveyZoneRef.current = null;
    dismissedTokenRef.current = null;
    keysRef.current = {};
    setCollectedEvidence([]);
    setFieldNotes([]);
    setResources(INITIAL_RESOURCES);
    setCurrentZone(content.zones.find(zone => zone.id === 'market')?.name || content.zones[0]?.name || 'Expedition Site');
    setNotice(nextMission.instruction);
    setBriefingOpen(true);
    setNearbyToken(null);
    setSelectedSurveyZone(null);
    setSurveyedZones(new Set());
    setNearbySurveyZone(null);
    setSurveyReportZone(null);
    setSelectedMapZone(null);
    setEnteredMapZone(null);
    setCompletedZoneChallenges(new Set());
    setActiveZoneChallenge(null);
    setZoneChallengeFeedback(null);
    setGridSetupOpen(false);
    setSelectedGridSquare(null);
    setOpenedGridSquares(new Set());
    setInspectionToken(null);
    setInspectionStep('review');
    setInspectionFeedback(null);
    setSelectedExcavationMethod(null);
    setExcavationMethodHistory([]);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
    setMappedFinds([]);
    setMissionEvidenceCount(0);
    setClaimOpen(false);
    setSelectedCivilisation('');
    setSelectedEvidenceId('');
    setClaimResult(null);
    setResultOpen(false);
    setExpeditionFailure(null);
    setShopFeedback(null);
  }, [audioControls]);

  const handleJourneySnapshot = useCallback((snapshot) => {
    journeySnapshotRef.current = snapshot;
  }, []);

  const handleJourneyComplete = useCallback((nextFieldKit) => {
    const journeyShardCount = Math.max(0, Number(journeySnapshotRef.current?.relicShardCount) || 0);
    const foundUpgradeVoucher = (journeySnapshotRef.current?.collectedUpgrades || []).includes('basecamp-upgrade-voucher');
    const depositRunId = `${selectedStageId}-${journeyRunId}`;
    const depositResult = applyJourneyShardDeposit(baseCampProgressionRef.current, {
      runId: depositRunId,
      shardCount: journeyShardCount,
    });
    setFieldKit(nextFieldKit);
    baseCampProgressionRef.current = depositResult.progress;
    setBaseCampProgression(depositResult.progress);
    if (depositResult?.deposited) {
      const shardLabel = depositResult.amount === 1 ? 'relic shard' : 'relic shards';
      setShopFeedback({
        type: 'deposit',
        title: 'Base Camp stores updated',
        message: `${depositResult.amount} ${shardLabel} logged at the outpost for route gear and excavation support${foundUpgradeVoucher ? ' including the optional cache voucher' : ''}.`,
        itemId: null,
      });
    } else if (journeyShardCount > 0) {
      const shardLabel = journeyShardCount === 1 ? 'relic shard' : 'relic shards';
      setShopFeedback({
        type: 'deposit',
        title: 'Base Camp stores updated',
        message: `${journeyShardCount} ${shardLabel} already recorded at the outpost.`,
        itemId: null,
      });
    }
    setBaseCampOpen(true);
    setNotice('Base Camp Outpost reached. Tool Bench, Relic Table, Field Journal, Evidence Board, and Route Map are ready for excavation prep.');
    audioControls.playExpeditionMusic?.('baseCamp');
    // China Section One climax: restore the Shang -> Zhou -> Qin -> Han timeline
    // before excavation prep. Other civilisations skip straight to Base Camp.
    if (String(targetCivilisation).toLowerCase().includes('china')) {
      setDynastyTimelineOpen(true);
    }
  }, [audioControls, journeyRunId, selectedStageId, targetCivilisation]);

  const purchaseShopItem = useCallback((itemId) => {
    const purchaseResult = applyShopPurchase(baseCampProgressionRef.current, itemId);
    baseCampProgressionRef.current = purchaseResult.progress;
    setBaseCampProgression(purchaseResult.progress);
    if (purchaseResult?.ok) {
      if (['brush', 'trowel', 'camera', 'notebook', 'measuring-tape', 'field-guide-page'].includes(itemId)) {
        setFieldKit(prev => [...new Set([...prev, itemId])]);
      }
      setShopFeedback({
        type: 'purchase',
        title: purchaseResult.item.type === 'upgrade' ? 'Expedition Upgrade Acquired' : 'Collection Unlock Acquired',
        message: `${purchaseResult.item.name} added to your Base Camp kit.`,
        itemId: purchaseResult.item.id,
      });
      audioControls.playLevelUp?.();
      audioControls.playSuccess?.();
      return;
    }

    const messageByReason = {
      owned: `${purchaseResult?.item?.name || 'This item'} is already unlocked.`,
      shards: `Collect more relic shards before buying ${purchaseResult?.item?.name || 'this item'}.`,
      locked: `${purchaseResult?.item?.name || 'This item'} is planned for a future expedition route.`,
      missing: 'That shop item is not available.',
    };
    setShopFeedback({
      type: 'blocked',
      title: 'Purchase Not Available',
      message: messageByReason[purchaseResult?.reason] || 'Purchase not available.',
      itemId,
    });
    audioControls.playError?.();
  }, [audioControls]);

  const beginExcavationStage = useCallback(() => {
    keysRef.current = {};
    tickAccumulatorRef.current = 0;
    setExpeditionStage('excavation');
    setBaseCampOpen(false);
    setBriefingOpen(true);
    setSelectedSurveyZone(null);
    setSurveyedZones(new Set());
    setNearbySurveyZone(null);
    setSurveyReportZone(null);
    setSelectedMapZone(null);
    setEnteredMapZone(null);
    setCompletedZoneChallenges(new Set());
    setActiveZoneChallenge(null);
    setZoneChallengeFeedback(null);
    setGridSetupOpen(false);
    setSelectedGridSquare(null);
    setOpenedGridSquares(new Set());
    setSelectedExcavationMethod(null);
    setExcavationMethodHistory([]);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
    setMappedFinds([]);
    nearbySurveyZoneRef.current = null;
    setNotice('Survey the site first. Choose a promising dig zone before inspecting evidence.');
    audioControls.playExpeditionMusic?.('baseCamp');
  }, [audioControls]);

  const closeInspection = () => {
    setInspectionToken(null);
    setInspectionStep('review');
    setInspectionFeedback(null);
    setSelectedExcavationMethod(null);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
  };

  const rejectInspectedEvidence = (token) => {
    if (!token || token.collected) return;
    if (fieldKitEffects.notebookReady) {
      recordFieldNote(token, 'rejected');
    }
    dismissedTokenRef.current = token.id;
    setInspectionToken(null);
    setInspectionStep('review');
    setInspectionFeedback(null);
    setSelectedExcavationMethod(null);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
    setNotice(activeMission.keepSearchingNotice);
  };

  const finishInspection = (token, replacementId = null) => {
    if (!token || token.collected) return;
    const isMissionEvidence = evidenceMatchesMission(token, activeMission);
    const nextInventory = replacementId
      ? collectedRef.current.filter(item => item.id !== replacementId)
      : [...collectedRef.current];

    if (!replacementId && nextInventory.length >= MAX_EVIDENCE_ITEMS) {
      setInspectionStep('capacity');
      setNotice('Your evidence satchel is full. Archaeologists choose the most useful evidence for the mission.');
      return;
    }

    dismissedTokenRef.current = null;
    token.collected = true;
    token.isMissionEvidence = isMissionEvidence;
    token.evidenceQuality = token.evidenceQuality || 'good';
    token.mappedZone = token.mappedZone || getSurveyZoneName(selectedSurveyZone, surveyZoneById);
    token.mappedGridSquare = token.mappedGridSquare || getOpenedGridSquareForEvidence(token, selectedSurveyZone, openedGridSquares, gridZoneConfigs) || selectedGridSquare;
    const legacyMappedTypeId = token['stu' + 'dentMappedType'];
    const mappedTypeId = token.playerMappedType || legacyMappedTypeId || getMapEvidenceTypeIdForToken(token);
    token.mappedEvidenceType = token.mappedEvidenceType || getMapEvidenceTypeName(mappedTypeId);
    token.mappingAccurate = token.mappingAccurate ?? (mappedTypeId ? isMappingAccurate(token, mappedTypeId) : true);
    nextInventory.push(token);
    syncInventory(nextInventory);
    nearbyTokenRef.current = null;
    setNearbyToken(null);

    if (isMissionEvidence) {
      const trowelBonus = fieldKitEffects.trowelReady && ['structure', 'material_culture'].includes(token.missionType)
        ? TROWEL_EXCAVATION_BONUS
        : 0;
      const cameraBonus = fieldKitEffects.cameraReady ? CAMERA_DOCUMENTATION_BONUS : 0;
      const investigationBonus = INVESTIGATION_BONUS + (fieldKitEffects.brushReady ? BRUSH_RECOVERY_BONUS : 0) + trowelBonus + cameraBonus;
      const toolFeedback = [
        fieldKitEffects.brushReady ? 'Brush used: careful recovery bonus added.' : '',
        trowelBonus ? 'Trowel used: excavation bonus added.' : '',
        cameraBonus ? 'Camera used: evidence documented before collection.' : '',
      ].filter(Boolean).join(' ');
      syncResources({ investigation: investigationBonus });
      setInspectionFeedback({
        correct: true,
        stamp: 'EVIDENCE VERIFIED',
        text: `${activeMission.matchFeedback} Excavation method: ${token.excavationMethodName}. Evidence quality: ${token.evidenceQuality}.${toolFeedback ? ` ${toolFeedback}` : ''}`,
      });
      setNotice(`${token.name} added to your evidence satchel. +${investigationBonus} investigation points.`);
      if (missionEvidenceCount + 1 >= missionRequiredCount) {
        setNotice('You have enough evidence to support your claim. Return to the exit point.');
        audioControls.playExpeditionSfx?.('gateUnlock');
        audioControls.playExpeditionStinger?.('gateUnlock');
      }
    } else {
      const trowelBonus = fieldKitEffects.trowelReady && ['structure', 'material_culture'].includes(token.missionType)
        ? TROWEL_EXCAVATION_BONUS
        : 0;
      const cameraBonus = fieldKitEffects.cameraReady ? CAMERA_DOCUMENTATION_BONUS : 0;
      const investigationBonus = trowelBonus + cameraBonus;
      if (investigationBonus > 0) {
        syncResources({ investigation: investigationBonus });
      }
      const toolFeedback = [
        trowelBonus ? 'Trowel used: excavation bonus added.' : '',
        cameraBonus ? 'Camera used: evidence documented before collection.' : '',
      ].filter(Boolean).join(' ');
      setInspectionFeedback({
        correct: false,
        stamp: 'EVIDENCE COLLECTED',
        text: `${activeMission.mismatchFeedback} Excavation method: ${token.excavationMethodName}. Evidence quality: ${token.evidenceQuality}.${toolFeedback ? ` ${toolFeedback}` : ''}`,
      });
      setNotice(`${token.name} added to your evidence satchel.`);
    }
    if (fieldKitEffects.notebookReady) {
      recordFieldNote(token, 'inspected');
    }
    setInspectionStep('review');
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
  };

  const inspectMissionChoice = (matchesMission) => {
    if (!inspectionToken || inspectionToken.collected) return;
    if (!inspectionToken.excavationMethod) {
      setInspectionStep('excavate');
      setNotice('Choose an excavation method before deciding whether to collect this evidence.');
      return;
    }
    if (!inspectionToken.mappedEvidenceType) {
      setInspectionStep('map');
      setNotice('Map the find before deciding whether to collect this evidence.');
      return;
    }

    if (!matchesMission) {
      rejectInspectedEvidence(inspectionToken);
      return;
    }

    if (collectedRef.current.length >= MAX_EVIDENCE_ITEMS) {
      setInspectionStep('capacity');
      setNotice('Your evidence satchel is full. Archaeologists choose the most useful evidence for the mission.');
      return;
    }

    finishInspection(inspectionToken);
  };

  const { draw } = useExpeditionDigDraw({
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
  });

  const { update } = useExpeditionDigSimulation({
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
  });

  useEffect(() => {
    if (selectedExpedition) return undefined;

    window.advanceTime = () => {};
    window.render_game_to_text = () => JSON.stringify({
      mode: 'Lost Site Expedition',
      stage: 'stage-select',
      selectedExpedition: null,
      previewOpen: Boolean(previewExpedition),
      previewExpeditionId: previewExpedition?.id || null,
      playableStageId: PLAYABLE_EXPEDITION_STAGE_ID,
      availableStages: EXPEDITION_STAGES.map(stage => ({
        id: stage.id,
        title: stage.title,
        status: stage.status,
        route: stage.route,
      })),
    });

    return () => {
      delete window.advanceTime;
      delete window.render_game_to_text;
    };
  }, [previewExpedition, selectedExpedition]);

  useEffect(() => {
    if (!selectedExpedition) return undefined;
    if (expeditionStage === 'excavation') return undefined;

    window.advanceTime = (ms = 16) => {
      window.__advanceExpeditionJourney?.(ms);
    };
    window.render_game_to_text = () => {
      const journeySnapshot = journeySnapshotRef.current || {};
      return JSON.stringify({
        mode: 'Lost Site Expedition',
        expeditionStageId: selectedExpedition.id,
        expeditionStageTitle: selectedExpedition.title,
        stage: baseCampOpen ? 'base-camp' : 'journey',
        activeMission,
        missionTarget: activeMission,
        missionProgress: {
          found: missionEvidenceCount,
          required: missionRequiredCount,
          targetCategoryId: activeMission.targetCategoryId,
          targetEvidenceType: activeMission.targetEvidenceType,
          targetCategoryTitle: activeMission.targetCategoryTitle,
        },
        requiredMissionEvidenceCount: missionRequiredCount,
        exitUnlocked,
        surveyRequired: true,
        surveyComplete,
        targetCivilisation,
        activeCivilisation: journeySnapshot.activeCivilisation || journeySnapshot.targetCivilisation || targetCivilisation,
        selectedSurveyZone: getSurveyZoneName(selectedSurveyZone, surveyZoneById),
        gridRequired: surveyComplete,
        gridOpen: Boolean(gridSetupOpen),
        selectedGridSquare,
        openedGridSquares: [...openedGridSquares],
        gridSquares: gridSquares.map(square => ({
          id: square.id,
          clue: square.clue,
          risk: square.risk,
          possibleEvidenceHint: square.possibleEvidenceHint,
          linkedEvidenceIds: square.linkedEvidenceIds,
          opened: openedGridSquares.has(square.id),
        })),
        nearbySurveyZone: nearbySurveyZone ? nearbySurveyZone.name : null,
        surveyedZones: [...surveyedZones].map(zoneId => getSurveyZoneName(zoneId, surveyZoneById)),
        surveyReportOpen: Boolean(surveyReportZone),
        excavationMethodRequired,
        selectedExcavationMethod,
        excavationMethodOpen,
        pendingExcavationEvidence: excavationMethodOpen && inspectionToken ? {
          id: inspectionToken.id,
          name: inspectionToken.name,
          missionType: inspectionToken.missionType,
          category: inspectionToken.category,
        } : null,
        excavationMethodHistory,
        mappingRequired,
        mappingOpen,
        pendingMappedEvidence,
        mappedFinds: mappedFindsSummary,
        mappedFindsAccurate: mappingAccuracySummary.accurate,
        mappedFindsNeedsReview: mappingAccuracySummary.needsReview,
        visibleEvidence: getVisibleEvidence().map(item => ({ id: item.id, name: item.name, zone: item.zone, missionType: item.missionType })),
        hiddenEvidence: getHiddenEvidence().map(item => ({ id: item.id, name: item.name, zone: item.zone, missionType: item.missionType })),
        resultOpen,
        failureOpen: Boolean(expeditionFailure),
        expeditionFailure,
        finalScore,
        finalRank,
        fieldKitBonus,
        claimCorrect,
        evidenceSupportsClaim,
        missionComplete,
        fieldGuideHintVisible: Boolean(fieldKitEffects.fieldGuideAvailable && inspectionToken && !inspectionFeedback),
        inventoryFullDecisionOpen,
        pendingEvidence: pendingEvidence ? {
          id: pendingEvidence.id,
          name: pendingEvidence.name,
          category: pendingEvidence.category,
          missionType: pendingEvidence.missionType,
          missionLabel: pendingEvidence.missionLabel,
          matchesMission: pendingEvidence.matchesMission,
          evidenceQuality: pendingEvidence.evidenceQuality || null,
          excavationMethod: pendingEvidence.excavationMethod || null,
          excavationMethodName: pendingEvidence.excavationMethodName || null,
          clue: pendingEvidence.clue,
          zone: pendingEvidence.zone,
        } : null,
        satchelContents: satchelContents.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          missionType: item.missionType,
          missionLabel: item.missionLabel,
          matchesMission: item.matchesMission,
          evidenceQuality: item.evidenceQuality || null,
          excavationMethod: item.excavationMethod || null,
          excavationMethodName: item.excavationMethodName || null,
          mappedZone: item.mappedZone || null,
          mappedGridSquare: item.mappedGridSquare || null,
          mappedEvidenceType: item.mappedEvidenceType || null,
          mappingAccurate: item.mappingAccurate ?? null,
          clue: item.clue,
          zone: item.zone,
        })),
        fieldKitImpact,
        collectedEvidence: collectedRef.current.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          missionCategoryId: item.missionType,
          missionType: item.missionType,
          isMissionEvidence: item.isMissionEvidence,
          evidenceQuality: item.evidenceQuality || null,
          excavationMethod: item.excavationMethod || null,
          excavationMethodName: item.excavationMethodName || null,
          mappedZone: item.mappedZone || null,
          mappedGridSquare: item.mappedGridSquare || null,
          mappedEvidenceType: item.mappedEvidenceType || null,
          mappingAccurate: item.mappingAccurate ?? null,
          supports: item.supports,
        })),
        remainingEvidence: tokensRef.current.filter(item => !item.collected).map(item => ({
          id: item.id,
          x: item.x,
          y: item.y,
          category: item.category,
          missionCategoryId: item.missionType,
          missionType: item.missionType,
          clueGroup: item.clueGroup,
        })),
        fieldKit,
        fieldKitEffects,
        baseCampOpen,
        baseCampShop: {
          relicShards: baseCampProgression.relicShards,
          purchasedUpgrades: baseCampProgression.purchasedUpgrades,
          unlockedCosmetics: baseCampProgression.unlockedCosmetics,
          journalUnlocks: baseCampProgression.journalUnlocks,
          shopFeedback,
          activeUpgradeEffects: permanentUpgradeEffects,
          storageKey: BASE_CAMP_PROGRESSION_STORAGE_KEY,
        },
        journeySection: journeySnapshot.journeySection || null,
        currentObjective: journeySnapshot.currentObjective || null,
        objectiveProgress: journeySnapshot.objectiveProgress || null,
        routeGateStatus: journeySnapshot.routeGateStatus || null,
        miniBossState: journeySnapshot.miniBossState || [],
        miniBossStates: journeySnapshot.miniBossStates || journeySnapshot.miniBossState || [],
        activeMiniBoss: journeySnapshot.activeMiniBoss || null,
        activeMiniBossState: journeySnapshot.activeMiniBossState || null,
        relicShardCount: journeySnapshot.relicShardCount || 0,
        bossKeyItems: journeySnapshot.bossKeyItems || [],
        collectedBossKeyItems: journeySnapshot.collectedBossKeyItems || [],
        bossToolPieces: journeySnapshot.bossToolPieces || journeySnapshot.bossKeyItems || [],
        collectedBossToolPieces: journeySnapshot.collectedBossToolPieces || journeySnapshot.collectedBossKeyItems || [],
        collectedUpgrades: journeySnapshot.collectedUpgrades || [],
        activeCheckpoint: journeySnapshot.activeCheckpoint || null,
        checkpointState: journeySnapshot.checkpointState || null,
        defeatedEnemies: journeySnapshot.defeatedEnemies || [],
        defeatedMiniBosses: journeySnapshot.defeatedMiniBosses || [],
        hiddenRoomsFound: journeySnapshot.hiddenRoomsFound || [],
        discoveredHiddenRoutes: journeySnapshot.discoveredHiddenRoutes || [],
        hiddenRoutesAvailable: journeySnapshot.hiddenRoutesAvailable || [],
        secretCollectibles: journeySnapshot.secretCollectibles || [],
        collectedSecretCollectibles: journeySnapshot.collectedSecretCollectibles || [],
        secretCollectibleCount: journeySnapshot.secretCollectibleCount || 0,
        loreTabletCount: journeySnapshot.loreTabletCount || 0,
        cinematicEventState: journeySnapshot.cinematicEventState || null,
        cinematicState: journeySnapshot.cinematicState || journeySnapshot.cinematicEventState || null,
        bossIntroState: journeySnapshot.bossIntroState || null,
        bossDomainState: journeySnapshot.bossDomainState || null,
        postBossReward: journeySnapshot.postBossReward || null,
        postBossRewardVisible: Boolean(journeySnapshot.postBossRewardVisible || journeySnapshot.postBossReward),
        postBossRewardTimer: journeySnapshot.postBossRewardTimer || 0,
        bossIntroPaused: Boolean(journeySnapshot.bossIntroPaused),
        guardianKnowledgeChallenge: journeySnapshot.guardianKnowledgeChallenge || null,
        completedGuardianKnowledgeChallenges: journeySnapshot.completedGuardianKnowledgeChallenges || [],
        guardianKnowledgeResults: journeySnapshot.guardianKnowledgeResults || {},
        guardianBattleModifiers: journeySnapshot.guardianBattleModifiers || {},
        environmentEventState: journeySnapshot.environmentEventState || null,
        sectionTransitionState: journeySnapshot.sectionTransitionState || null,
        activeParticles: journeySnapshot.activeParticles || null,
        activeAtmosphere: journeySnapshot.activeAtmosphere || null,
        playerCombatState: journeySnapshot.playerCombatState || null,
        playerSpriteLoaded: Boolean(journeySnapshot.playerSpriteLoaded),
        playerHeroSpriteLoaded: Boolean(journeySnapshot.playerHeroSpriteLoaded),
        playerLegacySpriteLoaded: Boolean(journeySnapshot.playerLegacySpriteLoaded),
        playerSpriteAtlasPath: journeySnapshot.playerSpriteAtlasPath || null,
        playerSpriteVersion: journeySnapshot.playerSpriteVersion || null,
        playerSpriteVisualMode: journeySnapshot.playerSpriteVisualMode || null,
        playerSpriteFrame: journeySnapshot.playerSpriteFrame || null,
        playerSpriteFallbackSrc: journeySnapshot.playerSpriteFallbackSrc || null,
        playerAnimationState: journeySnapshot.playerAnimationState || null,
        playerAnimationFrame: journeySnapshot.playerAnimationFrame ?? null,
        playerFacing: journeySnapshot.playerFacing || null,
        playerSpriteScale: journeySnapshot.playerSpriteScale ?? null,
        environmentAssetsLoaded: Boolean(journeySnapshot.environmentAssetsLoaded),
        environmentAssetsReady: Boolean(journeySnapshot.environmentAssetsReady),
        environmentAtlasPath: journeySnapshot.environmentAtlasPath || null,
        missingEnvironmentAssets: journeySnapshot.missingEnvironmentAssets || [],
        environmentFallbackActive: Boolean(journeySnapshot.environmentFallbackActive),
        platformArtMode: journeySnapshot.platformArtMode || null,
        hazardArtMode: journeySnapshot.hazardArtMode || null,
        gateArtMode: journeySnapshot.gateArtMode || null,
        desertBackgroundAssetsLoaded: Boolean(journeySnapshot.desertBackgroundAssetsLoaded),
        desertBackgroundAssetsReady: Boolean(journeySnapshot.desertBackgroundAssetsReady),
        desertBackgroundFallbackActive: Boolean(journeySnapshot.desertBackgroundFallbackActive),
        catacombsBackgroundAssetsLoaded: Boolean(journeySnapshot.catacombsBackgroundAssetsLoaded),
        catacombsBackgroundAssetsReady: Boolean(journeySnapshot.catacombsBackgroundAssetsReady),
        catacombsBackgroundFallbackActive: Boolean(journeySnapshot.catacombsBackgroundFallbackActive),
        escapeBackgroundAssetsLoaded: Boolean(journeySnapshot.escapeBackgroundAssetsLoaded),
        escapeBackgroundAssetsReady: Boolean(journeySnapshot.escapeBackgroundAssetsReady),
        escapeBackgroundFallbackActive: Boolean(journeySnapshot.escapeBackgroundFallbackActive),
        digSiteBackgroundAssetsLoaded: Boolean(journeySnapshot.digSiteBackgroundAssetsLoaded),
        digSiteBackgroundAssetsReady: Boolean(journeySnapshot.digSiteBackgroundAssetsReady),
        digSiteBackgroundFallbackActive: Boolean(journeySnapshot.digSiteBackgroundFallbackActive),
        enemySpritesLoaded: Boolean(journeySnapshot.enemySpritesLoaded),
        enemySpriteFallbackActive: Boolean(journeySnapshot.enemySpriteFallbackActive),
        enemySpriteAtlasPath: journeySnapshot.enemySpriteAtlasPath || null,
        chinaEnemyGuardianSpriteAtlasPath: journeySnapshot.chinaEnemyGuardianSpriteAtlasPath || null,
        chinaEnemyGuardianSpritesLoaded: Boolean(journeySnapshot.chinaEnemyGuardianSpritesLoaded),
        chinaEnemyGuardianSpriteFallbackActive: Boolean(journeySnapshot.chinaEnemyGuardianSpriteFallbackActive),
        missingChinaEnemyGuardianSpriteAssets: journeySnapshot.missingChinaEnemyGuardianSpriteAssets || [],
        visibleEnemySpriteFamilies: journeySnapshot.visibleEnemySpriteFamilies || [],
        enemySpriteFrameStates: journeySnapshot.enemySpriteFrameStates || [],
        bossSpritesLoaded: Boolean(journeySnapshot.bossSpritesLoaded),
        bossSpriteFallbackActive: Boolean(journeySnapshot.bossSpriteFallbackActive),
        bossSpriteAtlasPath: journeySnapshot.bossSpriteAtlasPath || null,
        activeBossSprite: journeySnapshot.activeBossSprite || null,
        activeBossSpriteFrame: journeySnapshot.activeBossSpriteFrame || null,
        activeBossAnimationState: journeySnapshot.activeBossAnimationState || null,
        chinaClayGuardianSpriteLoaded: Boolean(journeySnapshot.chinaClayGuardianSpriteLoaded),
        chinaClayGuardianSpriteFrame: journeySnapshot.chinaClayGuardianSpriteFrame || null,
        chinaClayGuardianSpriteAtlasPath: journeySnapshot.chinaClayGuardianSpriteAtlasPath || null,
        stoneGuardianSpriteLoaded: Boolean(journeySnapshot.stoneGuardianSpriteLoaded),
        stoneGuardianSpriteFrame: journeySnapshot.stoneGuardianSpriteFrame || null,
        stoneGuardianSpriteAtlasPath: journeySnapshot.stoneGuardianSpriteAtlasPath || null,
        ancientConstructSpriteLoaded: Boolean(journeySnapshot.ancientConstructSpriteLoaded),
        ancientConstructSpriteFrame: journeySnapshot.ancientConstructSpriteFrame || null,
        ancientConstructSpriteAtlasPath: journeySnapshot.ancientConstructSpriteAtlasPath || null,
        collectibleSpritesLoaded: Boolean(journeySnapshot.collectibleSpritesLoaded),
        collectibleSpriteFallbackActive: Boolean(journeySnapshot.collectibleSpriteFallbackActive),
        collectibleSpriteAtlasPath: journeySnapshot.collectibleSpriteAtlasPath || null,
        visibleToolSprites: journeySnapshot.visibleToolSprites || [],
        visibleShardSprites: journeySnapshot.visibleShardSprites || [],
        visibleUpgradeSprites: journeySnapshot.visibleUpgradeSprites || [],
        visibleObjectiveSprites: journeySnapshot.visibleObjectiveSprites || [],
        visibleCollectibleCount: journeySnapshot.visibleCollectibleCount || 0,
        collectibleScaleTuningVersion: journeySnapshot.collectibleScaleTuningVersion || null,
        relicShardScale: journeySnapshot.relicShardScale ?? null,
        fieldToolScale: journeySnapshot.fieldToolScale ?? null,
        upgradeScale: journeySnapshot.upgradeScale ?? null,
        objectiveMarkerScale: journeySnapshot.objectiveMarkerScale ?? null,
        loreTabletScale: journeySnapshot.loreTabletScale ?? null,
        pickupGlowScale: journeySnapshot.pickupGlowScale ?? null,
        collectibleVisualMode: journeySnapshot.collectibleVisualMode || null,
        playerWeaponSpriteLoaded: Boolean(journeySnapshot.playerWeaponSpriteLoaded),
        playerWeaponSpriteFallbackActive: Boolean(journeySnapshot.playerWeaponSpriteFallbackActive),
        playerWeaponAtlasPath: journeySnapshot.playerWeaponAtlasPath || null,
        playerWeaponFrame: journeySnapshot.playerWeaponFrame || null,
        playerWeaponVisualMode: journeySnapshot.playerWeaponVisualMode || null,
        parallaxLayersActive: Boolean(journeySnapshot.parallaxLayersActive),
        activeBackgroundSection: journeySnapshot.activeBackgroundSection || null,
        backgroundDepthMode: journeySnapshot.backgroundDepthMode || null,
        desertJourneyBackgroundSystemVersion: journeySnapshot.desertJourneyBackgroundSystemVersion || null,
        desertJourneyPanelIds: journeySnapshot.desertJourneyPanelIds || [],
        desertJourneyLayerRoles: journeySnapshot.desertJourneyLayerRoles || [],
        desertJourneyLayerDrawCount: journeySnapshot.desertJourneyLayerDrawCount || 0,
        desertJourneyTransitionMasks: journeySnapshot.desertJourneyTransitionMasks || [],
        desertEntryPrimaryBackgroundPlateIds: journeySnapshot.desertEntryPrimaryBackgroundPlateIds || [],
        visibleLabelCount: journeySnapshot.visibleLabelCount || 0,
        labelSuppressionActive: Boolean(journeySnapshot.labelSuppressionActive),
        platformVisualTuningActive: Boolean(journeySnapshot.platformVisualTuningActive),
        journeyPolishPassActive: Boolean(journeySnapshot.journeyPolishPassActive),
        journeyPolishVersion: journeySnapshot.journeyPolishVersion || null,
        hazardReadabilityMode: journeySnapshot.hazardReadabilityMode || null,
        enemyVisualMode: journeySnapshot.enemyVisualMode || null,
        bossVisualMode: journeySnapshot.bossVisualMode || null,
        assetFallbackActive: Boolean(journeySnapshot.assetFallbackActive),
        assetGroundingPassActive: Boolean(journeySnapshot.assetGroundingPassActive),
        assetGroundingVersion: journeySnapshot.assetGroundingVersion || null,
        groundedPropCount: journeySnapshot.groundedPropCount || 0,
        backgroundPropTintActive: Boolean(journeySnapshot.backgroundPropTintActive),
        platformGroundingMode: journeySnapshot.platformGroundingMode || null,
        propDrawOrderMode: journeySnapshot.propDrawOrderMode || null,
        floatingAssetWarnings: journeySnapshot.floatingAssetWarnings || [],
        desertVisualTuningVersion: journeySnapshot.desertVisualTuningVersion || null,
        atlasTuningVersion: journeySnapshot.atlasTuningVersion || null,
        activeAtlasRegionIssues: journeySnapshot.activeAtlasRegionIssues || [],
        playerInvulnerable: journeySnapshot.playerInvulnerable || 0,
        invulnerabilityRemainingMs: journeySnapshot.invulnerabilityRemainingMs || 0,
        damageCooldownRemainingMs: journeySnapshot.damageCooldownRemainingMs || 0,
        playerFlashActive: Boolean(journeySnapshot.playerFlashActive),
        lastDamageSource: journeySnapshot.lastDamageSource || null,
        lastDamageTime: journeySnapshot.lastDamageTime || null,
        cameraX: journeySnapshot.cameraX ?? null,
        targetCameraX: journeySnapshot.targetCameraX ?? null,
        playerWorldX: journeySnapshot.playerWorldX ?? null,
        playerScreenX: journeySnapshot.playerScreenX ?? null,
        currentSection: journeySnapshot.currentSection || journeySnapshot.journeySection || null,
        cameraMode: journeySnapshot.cameraMode || null,
        cameraFocusTarget: journeySnapshot.cameraFocusTarget ?? null,
        cameraShakeActive: Boolean(journeySnapshot.cameraShakeActive),
        activeHazardsNearPlayer: journeySnapshot.activeHazardsNearPlayer || [],
        lastHazardHit: journeySnapshot.lastHazardHit || null,
        lastStaminaDelta: journeySnapshot.lastStaminaDelta || 0,
        lastStaminaLossReason: journeySnapshot.lastStaminaLossReason || '',
        staminaFeedbackActive: Boolean(journeySnapshot.staminaFeedbackActive),
        staminaWarningState: journeySnapshot.staminaWarningState || null,
        hazardFeedbackCooldown: journeySnapshot.hazardFeedbackCooldown || 0,
        playerStamina: journeySnapshot.playerStamina ?? journeySnapshot.resources?.stamina ?? null,
        maxStamina: journeySnapshot.maxStamina ?? permanentUpgradeEffects.maxStamina,
        permanentUpgrades: journeySnapshot.permanentUpgrades || baseCampProgression.purchasedUpgrades,
        permanentUpgradeEffects: journeySnapshot.permanentUpgradeEffects || permanentUpgradeEffects,
        enemyStates: journeySnapshot.enemyStates || [],
        worldProgressPercent: journeySnapshot.worldProgressPercent || 0,
        journey: journeySnapshot,
      });
    };

    return () => {
      delete window.advanceTime;
      delete window.render_game_to_text;
    };
  }, [activeMission, baseCampOpen, baseCampProgression, claimCorrect, evidenceSupportsClaim, excavationMethodHistory, excavationMethodOpen, excavationMethodRequired, expeditionFailure, expeditionStage, exitUnlocked, fieldKit, fieldKitBonus, fieldKitEffects, fieldKitImpact, finalRank, finalScore, getHiddenEvidence, getVisibleEvidence, gridSetupOpen, gridSquares, inspectionFeedback, inspectionToken, inventoryFullDecisionOpen, mappedFindsSummary, mappingAccuracySummary.accurate, mappingAccuracySummary.needsReview, mappingOpen, mappingRequired, missionComplete, missionEvidenceCount, missionRequiredCount, nearbySurveyZone, openedGridSquares, pendingEvidence, pendingMappedEvidence, permanentUpgradeEffects, resultOpen, satchelContents, selectedExcavationMethod, selectedExpedition, selectedGridSquare, selectedSurveyZone, shopFeedback, surveyComplete, surveyedZones, surveyReportZone, surveyZoneById, targetCivilisation]);

  useEffect(() => {
    if (!selectedExpedition) return undefined;
    if (expeditionStage !== 'excavation') return undefined;

    const handleKeyDown = (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
        event.preventDefault();
        if (briefingOpen || lockedRef.current || inspectionToken || surveyReportZone || gridSetupOpen || activeZoneChallenge || expeditionFailure) return;
        keysRef.current[event.code] = true;
      }
      if (event.code === 'KeyE') {
        event.preventDefault();
        if (nearbyTokenRef.current) {
          openInspection();
        } else if (nearbySurveyZoneRef.current) {
          openSurveyReport(nearbySurveyZoneRef.current);
        } else if (selectedSurveyZone) {
          openGridSetup();
        } else {
          openSurveyReport();
        }
      }
    };
    const handleKeyUp = (event) => {
      keysRef.current[event.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let frameId = 0;
    let lastTime = performance.now();
    const loop = (time) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000 || 1 / 60);
      lastTime = time;
      if (!document.hidden) {
        update(dt);
      }
      frameId = requestAnimationFrame(loop);
    };

    draw();
    frameId = requestAnimationFrame(loop);
    window.advanceTime = (ms = 16) => {
      const steps = Math.max(1, Math.round(ms / (1000 / 60)));
      for (let i = 0; i < steps; i += 1) update(1 / 60);
      draw();
    };
    window.render_game_to_text = () => JSON.stringify({
      mode: 'Lost Site Expedition',
      expeditionStageId: selectedExpedition.id,
      expeditionStageTitle: selectedExpedition.title,
      targetCivilisation,
      stage: 'excavation',
      coordinateSystem: 'origin top-left, x right, y down',
      excavationMapAssetsLoaded: Boolean(excavationMapAssets.loaded),
      excavationMapAssetsReady: Boolean(excavationMapAssets.ready),
      excavationMapFallbackActive: !excavationMapAssets.loaded || excavationMapAssets.failed || !excavationMapAssets.ready,
      excavationMapExpanded: true,
      excavationVisualMode: excavationMapAssets.loaded && !excavationMapAssets.failed ? stageContent.visualMode : 'canvas-fallback',
      excavationMapVisualTuningVersion: EXCAVATION_MAP_VISUAL_TUNING_VERSION,
      excavationMapAtlasPath: excavationMapAssets.atlasPath,
      excavationRoomMapPackId: roomMapPackId,
      excavationMarkerPackId: markerPackId,
      excavationGatewayPackId: gatewayPackId,
      excavationMapUiPackId: mapUiPackId,
      excavationChallengeUiPackId: challengeUiPackId,
      missingExcavationMapAssets: getMissingExcavationMapAssets(excavationMapAssets),
      selectedMapZone: selectedMapZoneData?.name || null,
      enteredMapZone: enteredMapZone ? (EXPEDITION_ROOM_ZONE_BY_ID[enteredMapZone]?.name || getSurveyZoneName(enteredMapZone, surveyZoneById)) : null,
      activeZoneChallenge: activeChallengeData ? {
        zoneId: activeChallengeData.zoneId,
        title: activeChallengeData.title,
      } : null,
      completedZoneChallenges: [...completedZoneChallenges].map(zoneId => EXPEDITION_ROOM_ZONE_BY_ID[zoneId]?.name || getSurveyZoneName(zoneId, surveyZoneById)),
      zoneChallengeFeedback,
      canSurveySelectedZone,
      activeSurveyZone: getSurveyZoneName(selectedSurveyZone, surveyZoneById),
      revealedZone: getSurveyZoneName(selectedSurveyZone, surveyZoneById),
      exitGateVisualState: exitUnlocked ? 'unlockedExitGate' : 'sealedExitGate',
      fieldKit,
      fieldKitEffects,
      fieldNotes,
      player: { ...playerRef.current, size: PLAYER_SIZE, zone: getZoneName(playerRef.current, mapZones, defaultZoneName) },
      resources: resourcesRef.current,
      collectedEvidence: collectedRef.current.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        missionCategoryId: item.missionType,
        missionType: item.missionType,
        isMissionEvidence: item.isMissionEvidence,
        evidenceQuality: item.evidenceQuality || null,
        excavationMethod: item.excavationMethod || null,
        excavationMethodName: item.excavationMethodName || null,
        mappedZone: item.mappedZone || null,
        mappedGridSquare: item.mappedGridSquare || null,
        mappedEvidenceType: item.mappedEvidenceType || null,
        mappingAccurate: item.mappingAccurate ?? null,
        clueGroup: item.clueGroup,
        supports: item.supports,
      })),
      remainingEvidence: tokensRef.current.filter(item => !item.collected).map(item => ({
        id: item.id,
        x: item.x,
        y: item.y,
        category: item.category,
        missionCategoryId: item.missionType,
        missionType: item.missionType,
        clueGroup: item.clueGroup,
      })),
      hazards: mapHazards.map(item => ({ id: item.id, name: item.name, x: item.x, y: item.y, w: item.w, h: item.h })),
      guardians: guardiansRef.current.map(item => ({
        id: item.id,
        name: item.name,
        x: Math.round(item.x),
        y: Math.round(item.y),
        w: item.w,
        h: item.h,
      })),
      activeMission,
      missionTarget: activeMission,
      missionProgress: {
        found: missionEvidenceCount,
        required: missionRequiredCount,
        targetCategoryId: activeMission.targetCategoryId,
        targetEvidenceType: activeMission.targetEvidenceType,
        targetCategoryTitle: activeMission.targetCategoryTitle,
      },
      requiredMissionEvidenceCount: missionRequiredCount,
      exitUnlocked,
      surveyRequired: true,
      surveyComplete,
      selectedSurveyZone: getSurveyZoneName(selectedSurveyZone, surveyZoneById),
      gridRequired: surveyComplete,
      gridOpen: Boolean(gridSetupOpen),
      selectedGridSquare,
      openedGridSquares: [...openedGridSquares],
      gridSquares: gridSquares.map(square => ({
        id: square.id,
        clue: square.clue,
        risk: square.risk,
        possibleEvidenceHint: square.possibleEvidenceHint,
        linkedEvidenceIds: square.linkedEvidenceIds,
        opened: openedGridSquares.has(square.id),
      })),
      nearbySurveyZone: nearbySurveyZone ? nearbySurveyZone.name : null,
      surveyedZones: [...surveyedZones].map(zoneId => getSurveyZoneName(zoneId, surveyZoneById)),
      surveyReportOpen: Boolean(surveyReportZone),
      surveyReport: surveyReportZone,
      excavationMethodRequired,
      selectedExcavationMethod,
      excavationMethodOpen,
      pendingExcavationEvidence: excavationMethodOpen && inspectionToken ? {
        id: inspectionToken.id,
        name: inspectionToken.name,
        missionType: inspectionToken.missionType,
        category: inspectionToken.category,
      } : null,
      excavationMethodHistory,
      mappingRequired,
      mappingOpen,
      pendingMappedEvidence,
      mappedFinds: mappedFindsSummary,
      mappedFindsAccurate: mappingAccuracySummary.accurate,
      mappedFindsNeedsReview: mappingAccuracySummary.needsReview,
      visibleEvidence: getVisibleEvidence().map(item => ({
        id: item.id,
        name: item.name,
        x: item.x,
        y: item.y,
        zone: item.zone,
        missionType: item.missionType,
      })),
      hiddenEvidence: getHiddenEvidence().map(item => ({
        id: item.id,
        name: item.name,
        zone: item.zone,
        missionType: item.missionType,
      })),
      inventory: {
        count: collectedRef.current.length,
        limit: MAX_EVIDENCE_ITEMS,
      },
      claimOpen: lockedRef.current,
      resultOpen,
      failureOpen: Boolean(expeditionFailure),
      expeditionFailure,
      finalScore,
      finalRank,
      fieldKitBonus,
      claimCorrect,
      evidenceSupportsClaim,
      missionComplete,
      fieldGuideHintVisible: Boolean(fieldKitEffects.fieldGuideAvailable && inspectionToken && !inspectionFeedback),
      inventoryFullDecisionOpen,
      pendingEvidence: pendingEvidence ? {
        id: pendingEvidence.id,
        name: pendingEvidence.name,
        category: pendingEvidence.category,
        missionType: pendingEvidence.missionType,
        missionLabel: pendingEvidence.missionLabel,
        matchesMission: pendingEvidence.matchesMission,
        evidenceQuality: pendingEvidence.evidenceQuality || null,
        excavationMethod: pendingEvidence.excavationMethod || null,
        excavationMethodName: pendingEvidence.excavationMethodName || null,
        mappedZone: pendingEvidence.mappedZone || null,
        mappedGridSquare: pendingEvidence.mappedGridSquare || null,
        mappedEvidenceType: pendingEvidence.mappedEvidenceType || null,
        mappingAccurate: pendingEvidence.mappingAccurate ?? null,
        clue: pendingEvidence.clue,
        zone: pendingEvidence.zone,
      } : null,
      satchelContents: satchelContents.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        missionType: item.missionType,
        missionLabel: item.missionLabel,
        matchesMission: item.matchesMission,
        evidenceQuality: item.evidenceQuality || null,
        excavationMethod: item.excavationMethod || null,
        excavationMethodName: item.excavationMethodName || null,
        mappedZone: item.mappedZone || null,
        mappedGridSquare: item.mappedGridSquare || null,
        mappedEvidenceType: item.mappedEvidenceType || null,
        mappingAccurate: item.mappingAccurate ?? null,
        clue: item.clue,
        zone: item.zone,
      })),
      fieldKitImpact,
      briefingOpen,
      nearbyEvidence: nearbyTokenRef.current ? {
        id: nearbyTokenRef.current.id,
        name: nearbyTokenRef.current.name,
        clueGroup: nearbyTokenRef.current.clueGroup,
      } : null,
      inspectionOpen: Boolean(inspectionToken),
      inspectionFeedback,
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameId);
      delete window.advanceTime;
      delete window.render_game_to_text;
    };
  }, [activeChallengeData, activeMission, activeZoneChallenge, briefingOpen, canSurveySelectedZone, challengeUiPackId, claimCorrect, completedZoneChallenges, defaultZoneName, draw, enteredMapZone, evidenceSupportsClaim, excavationMapAssets, excavationMethodHistory, excavationMethodOpen, excavationMethodRequired, expeditionFailure, expeditionStage, exitUnlocked, fieldKit, fieldKitBonus, fieldKitEffects, fieldKitImpact, fieldNotes, finalRank, finalScore, gatewayPackId, getHiddenEvidence, getVisibleEvidence, gridSetupOpen, gridSquares, inspectionFeedback, inspectionToken, inventoryFullDecisionOpen, mapHazards, mapUiPackId, mapZones, mappedFindsSummary, mappingAccuracySummary.accurate, mappingAccuracySummary.needsReview, mappingOpen, mappingRequired, markerPackId, missionComplete, missionEvidenceCount, missionRequiredCount, nearbySurveyZone, openGridSetup, openInspection, openSurveyReport, openedGridSquares, pendingEvidence, pendingMappedEvidence, resultOpen, roomMapPackId, satchelContents, selectedExcavationMethod, selectedExpedition, selectedGridSquare, selectedMapZoneData, selectedSurveyZone, stageContent.visualMode, surveyComplete, surveyedZones, surveyReportZone, surveyZoneById, targetCivilisation, update, zoneChallengeFeedback]);

  const resetExpedition = () => {
    const nextMission = chooseEvidenceHuntMission(activeMission.id, stageContent.missions);
    // Reset goes to 'journey' not 'archive-prologue' — prologue is a one-time entry moment per run, not a replay gate.
    setExpeditionStage(stageContent.startsAt === 'excavation' ? 'excavation' : 'journey');
    setJourneyOpeningMode('standard');
    setBaseCampOpen(false);
    setJourneyPaused(false);
    const savedTools = (baseCampProgressionRef.current?.purchasedUpgrades || []).filter(id =>
      ['brush', 'trowel', 'camera', 'notebook', 'measuring-tape', 'field-guide-page'].includes(id)
    );
    setFieldKit(stageContent.startsAt === 'excavation' ? ['field-guide-page', 'notebook', 'brush', 'trowel', 'camera', 'measuring-tape'] : savedTools);
    setActiveMission(nextMission);
    setJourneyRunId(previous => previous + 1);
    journeySnapshotRef.current = null;
    playerRef.current = { x: 42, y: 498 };
    if (stageContent && stageContent.zones && stageContent.zones.length > 0) {
      const startZone = stageContent.zones.find(zone => zone.id === 'market') || stageContent.zones[0];
      const startCamX = (startZone.x + startZone.w / 2) - 400;
      const startCamY = (startZone.y + startZone.h / 2) - 280;
      cameraRef.current = { x: startCamX, y: startCamY };
      shroudRectRef.current = { x: startZone.x, y: startZone.y, w: startZone.w, h: startZone.h };
    } else {
      cameraRef.current = { x: 0, y: 0 };
      shroudRectRef.current = { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT };
    }
    tokensRef.current = buildExpeditionEvidence(stageContent);
    guardiansRef.current = buildExcavationGuardians(stageContent.guardians);
    collectedRef.current = [];
    resourcesRef.current = INITIAL_RESOURCES;
    hazardCooldownRef.current = {};
    guardianCooldownRef.current = {};
    lockedRef.current = false;
    tickAccumulatorRef.current = 0;
    nearbyTokenRef.current = null;
    nearbySurveyZoneRef.current = null;
    keysRef.current = {};
    setCollectedEvidence([]);
    setFieldNotes([]);
    setResources(INITIAL_RESOURCES);
    setCurrentZone(stageContent.zones.find(zone => zone.id === 'market')?.name || stageContent.zones[0]?.name || 'Expedition Site');
    setNotice(nextMission.instruction);
    setBriefingOpen(true);
    setNearbyToken(null);
    setSelectedSurveyZone(null);
    setSurveyedZones(new Set());
    setNearbySurveyZone(null);
    setSurveyReportZone(null);
    setSelectedMapZone(null);
    setEnteredMapZone(null);
    setCompletedZoneChallenges(new Set());
    setActiveZoneChallenge(null);
    setZoneChallengeFeedback(null);
    setGridSetupOpen(false);
    setSelectedGridSquare(null);
    setOpenedGridSquares(new Set());
    setInspectionToken(null);
    setInspectionStep('review');
    setInspectionFeedback(null);
    setSelectedExcavationMethod(null);
    setExcavationMethodHistory([]);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
    setMappedFinds([]);
    setMissionEvidenceCount(0);
    setClaimOpen(false);
    setSelectedCivilisation('');
    setSelectedEvidenceId('');
    setClaimResult(null);
    setResultOpen(false);
    setExpeditionFailure(null);
    dismissedTokenRef.current = null;
    draw();
  };

  const devJumpToJourney = useCallback(() => {
    keysRef.current = {};
    tickAccumulatorRef.current = 0;
    setExpeditionStage('journey');
    setJourneyOpeningMode('standard');
    setBaseCampOpen(false);
    setExpeditionFailure(null);
    setJourneyPaused(false);
    setJourneyRunId(previous => previous + 1);
    journeySnapshotRef.current = null;
    setNotice(activeMission.instruction);
    audioControls.playExpeditionMusic?.('desert');
  }, [activeMission.instruction, audioControls]);

  const devJumpToBaseCamp = useCallback(() => {
    const snapshotFieldKit = journeySnapshotRef.current?.fieldKit || [];
    keysRef.current = {};
    tickAccumulatorRef.current = 0;
    setFieldKit(snapshotFieldKit.length ? snapshotFieldKit : fieldKit);
    setExpeditionStage('journey');
    setBaseCampOpen(true);
    setExpeditionFailure(null);
    setNotice('Developer mode: Base Camp opened.');
    audioControls.playExpeditionMusic?.('baseCamp');
  }, [audioControls, fieldKit]);

  const devJumpToExcavation = useCallback(() => {
    keysRef.current = {};
    tickAccumulatorRef.current = 0;
    if (fieldKit.length === 0 && journeySnapshotRef.current?.fieldKit?.length) {
      setFieldKit(journeySnapshotRef.current.fieldKit);
    }
    beginExcavationStage();
    setNotice('Developer mode: Excavation opened.');
  }, [beginExcavationStage, fieldKit.length]);

  useEffect(() => {
    const handleExpeditionDevJump = (event) => {
      if (event.detail?.target === 'journey') devJumpToJourney();
      if (
        (
          event.detail?.target === 'journey-section-start'
          || event.detail?.target === 'journey-boss-start'
          || event.detail?.target === 'journey-scarab-payoff'
          || event.detail?.target === 'journey-desert-map-seal-ready'
          || event.detail?.target === 'journey-route-gate'
          || event.detail?.target === 'journey-forgotten-mural-puzzle'
          || event.detail?.target === 'journey-scribe-exterior'
          || event.detail?.target === 'journey-scribe-chamber'
        )
        && (expeditionStage !== 'journey' || baseCampOpen)
      ) {
        devJumpToJourney();
      }
      if (event.detail?.target === 'base-camp') devJumpToBaseCamp();
      if (event.detail?.target === 'excavation') devJumpToExcavation();
    };

    window.addEventListener('expedition-dev-jump', handleExpeditionDevJump);
    return () => window.removeEventListener('expedition-dev-jump', handleExpeditionDevJump);
  }, [baseCampOpen, devJumpToBaseCamp, devJumpToExcavation, devJumpToJourney, expeditionStage]);

  // Dev-only quick start (paired with the `?play` flag handled in App.jsx):
  // auto-select the playable Egypt stage, then skip the archive prologue +
  // briefing so a cold load lands directly in the journey gameplay. The
  // skip-to-journey step is deferred to a macrotask so it runs *after*
  // openExpeditionStage's state (which opens the prologue/briefing) has
  // committed — otherwise it gets clobbered by the entry render.
  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return undefined;
    if (selectedExpedition) return undefined;
    if (!new URLSearchParams(window.location.search).has('play')) return undefined;
    const stage = EXPEDITION_STAGES.find(s => s.id === PLAYABLE_EXPEDITION_STAGE_ID) || EXPEDITION_STAGES[0];
    if (!stage) return undefined;
    const timer = window.setTimeout(() => {
      openExpeditionStage(stage);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [openExpeditionStage, selectedExpedition]);

  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return undefined;
    if (!selectedExpedition) return undefined;
    if (!new URLSearchParams(window.location.search).has('play')) return undefined;
    const timer = window.setTimeout(() => {
      const playTarget = new URLSearchParams(window.location.search).get('play');
      setPrologueCinematicStep(null);
      setJourneyOpeningMode(playTarget === 'threshold' ? 'arrival-threshold' : 'standard');
      setExpeditionStage('journey');
      setBriefingOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedExpedition]);

  useEffect(() => () => {
    if (journeyCursorTimerRef.current) window.clearTimeout(journeyCursorTimerRef.current);
  }, []);

  useEffect(() => {
    const journeyActive = Boolean(selectedExpedition && expeditionStage === 'journey' && !baseCampOpen && !journeyPaused);
    if (!journeyActive || journeyCursorHidden) {
      if (journeyCursorTimerRef.current) {
        window.clearTimeout(journeyCursorTimerRef.current);
        journeyCursorTimerRef.current = null;
      }
      return;
    }

    journeyCursorTimerRef.current = window.setTimeout(() => {
      setJourneyCursorHidden(true);
      journeyCursorTimerRef.current = null;
    }, 1200);

    return () => {
      if (journeyCursorTimerRef.current) {
        window.clearTimeout(journeyCursorTimerRef.current);
        journeyCursorTimerRef.current = null;
      }
    };
  }, [baseCampOpen, expeditionStage, journeyCursorHidden, journeyPaused, selectedExpedition]);

  const handleJourneyMouseMove = useCallback(() => {
    if (journeyPaused) {
      setJourneyCursorHidden(false);
      return;
    }
    setJourneyCursorHidden(false);
    if (journeyCursorTimerRef.current) window.clearTimeout(journeyCursorTimerRef.current);
    journeyCursorTimerRef.current = window.setTimeout(() => {
      setJourneyCursorHidden(true);
      journeyCursorTimerRef.current = null;
    }, 1200);
  }, [journeyPaused]);

  useEffect(() => {
    if (expeditionStage !== 'journey') return undefined;

    const handleKeyDown = (e) => {
      // Esc and "?" (Slash) both toggle the single pause/controls menu.
      if (e.code === 'Escape' || e.code === 'Slash') {
        e.preventDefault();
        setJourneyPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expeditionStage]);

  const previewScaffoldAssets = previewExpedition?.scaffold?.runtimeAssets?.length > 0
    ? previewExpedition.scaffold.runtimeAssets
    : previewExpedition?.scaffold?.sourceAssets || [];

    const modeArtworks = [
    `${import.meta.env.BASE_URL}assets/menu/mode_investigation_art.png`,
    `${import.meta.env.BASE_URL}assets/menu/mode_expedition_art.png`,
    `${import.meta.env.BASE_URL}assets/menu/mode_bureau_art.png`,
    `${import.meta.env.BASE_URL}assets/menu/mode_training_art.png`
  ];

  const renderStageSelect = () => (
    <section className="phase-container menu-phase main-menu-phase" aria-label="Expedition Stage Selection">
      <div className="dynamic-menu-backdrop" style={{ backgroundImage: `url(${modeArtworks[focusedStageIndex] || modeArtworks[0]})` }} />

      <div className="mission-selection-heading" style={{ marginBottom: '1rem' }}>
        <div>
          <button type="button" className="back-to-modes-btn" onClick={onBackToMenu} style={{ marginBottom: '1.5rem', width: 'fit-content' }}>
            <ChevronLeft size={16} /> Exit to Menu
          </button>
          <div className="training-kicker">Lost Site Expedition - Route Map</div>
          <h2 className="premium-text-glow" style={{ margin: 0, fontSize: '2rem' }}>Choose an Expedition</h2>
        </div>
      </div>

      <div className="premium-carousel-container" aria-label="Available Target Locations">
        {EXPEDITION_STAGES.map((stage, index) => {
          const isPlayable = stage.route === 'playable' || stage.route === 'map-playable';
          const isFocused = focusedStageIndex === index;
          return (
            <article key={stage.id} data-index={index} className={`activity-card glass-card ${isPlayable ? '' : 'is-locked'} ${isFocused ? 'is-focused' : ''}`} style={{ '--card-bg': `url(${modeArtworks[index] || modeArtworks[0]})` }} onMouseEnter={() => setFocusedStageIndex(index)}>
              <div className="activity-card-header">
                <div className="activity-card-icon">
                  <MapIcon size={24} />
                </div>
                <div className="activity-time-tag" style={{ textTransform: 'uppercase' }}>
                  {stage.dossierTag} | {stage.status}
                </div>
              </div>
              <div className="activity-card-copy">
                <h3>{stage.title}</h3>
                <div className="activity-mode-label">{stage.subtitle}</div>
                <p>{stage.teaser}</p>
              </div>
              <div className="activity-card-button-group">
                <button
                  type="button"
                  className={`premium-action-btn ${isPlayable ? '' : 'secondary-btn'} activity-card-action`}
                  onClick={() => openExpeditionStage(stage)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isPlayable ? <Sparkles size={14} style={{ marginRight: '0.5rem' }} /> : <BookOpen size={14} style={{ marginRight: '0.5rem' }} />}
                  {stage.actionLabel}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {previewExpedition && (
        <div className="modal-overlay expedition-briefing-overlay" style={{ zIndex: 100000 }}>
          <div className="bureau-briefing-modal expedition-stage-preview-modal" style={{ background: '#120f0c', border: '2px solid #8b6a48', borderRadius: '8px' }}>
            <div className="expedition-stage-preview-header">
              <span className={`expedition-stage-status expedition-stage-status--${previewExpedition.statusTone}`} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                {previewExpedition.status}
              </span>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#f7e9cc', margin: '0 0 0.5rem' }}>{previewExpedition.title}</h2>
              <p style={{ color: '#cda869', margin: 0 }}>{previewExpedition.subtitle}</p>
            </div>

            <div className="expedition-stage-preview-note" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(139,106,72,0.1)', padding: '1rem', borderRadius: '6px', margin: '1rem 0' }}>
              <MapIcon size={20} className="card-icon" />
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#ebdcb9', lineHeight: 1.4 }}>{previewExpedition.previewTeaser || previewExpedition.teaser}</p>
            </div>

            {previewScaffoldAssets.length > 0 && (
              <div className="expedition-stage-preview-assets" aria-label={`${previewExpedition.title} asset previews`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
                {previewScaffoldAssets.map(asset => (
                  <figure key={asset.id} className="expedition-stage-preview-asset" style={{ margin: 0, textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(139,106,72,0.15)' }}>
                    <img
                      src={`${import.meta.env.BASE_URL}${asset.src}`}
                      alt={asset.title}
                      loading="lazy"
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: '3px' }}
                    />
                    <figcaption style={{ fontSize: '0.75rem', color: '#a89a7f', marginTop: '0.4rem' }}>{asset.title}</figcaption>
                  </figure>
                ))}
              </div>
            )}

            <p className="expedition-stage-preview-status" style={{ fontSize: '0.78rem', color: '#8b6a48', fontStyle: 'italic', margin: '1rem 0' }}>
              This expedition is a preview only for now. It will not launch unfinished gameplay.
            </p>

            <div className="bureau-briefing-actions" style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(139,106,72,0.15)', paddingTop: '1rem' }}>
              <button type="button" className="btn footer-btn secondary-btn" onClick={() => setPreviewExpedition(null)} style={{ minHeight: '36px', height: '36px', padding: '0 1.5rem' }}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );

  if (!selectedExpedition) {
    return renderStageSelect();
  }

  const submitClaim = () => {
    const chosenEvidence = selectedEvidence;
    if (!selectedCivilisation || !chosenEvidence) {
      setClaimResult({
        correct: false,
        sentence: 'Choose a civilisation and one piece of collected evidence.',
        feedback: 'A strong historical claim needs both parts: what you think, and the evidence that supports it.',
      });
      return;
    }

    const civilisationCorrect = selectedCivilisation === targetCivilisation;
    const evidenceCorrect = chosenEvidence.supports === targetCivilisation;
    const sentence = `I think this site belongs to ${selectedCivilisation} because ${chosenEvidence.name}.`;

    setClaimResult({
      correct: civilisationCorrect && evidenceCorrect,
      sentence,
      feedback: civilisationCorrect && evidenceCorrect
        ? `${chosenEvidence.name} supports ${targetCivilisation}: ${chosenEvidence.rationale}`
        : `${chosenEvidence.name} does not support ${selectedCivilisation}. Its clue points to ${chosenEvidence.supports} because ${chosenEvidence.clue}`,
    });
    setResultOpen(true);
    setClaimOpen(false);

    if (civilisationCorrect && evidenceCorrect) {
      audioControls.playWin?.();
    } else {
      audioControls.playError?.();
    }
  };

  const journeyCursorShouldHide = journeyCursorHidden && !journeyPaused;

  const shouldShowArchivePrologue =
    selectedStageId === EXPEDITION_STAGE_IDS.EGYPT
    && expeditionStage === 'archive-prologue';
  const isRomeArchivePrologue = selectedStageId === EXPEDITION_STAGE_IDS.ROME && expeditionStage === 'archive-prologue';

  const renderArchivePrologue = () => {
    const allInspected = EGYPT_ARCHIVE_PROLOGUE_ITEMS.every(item => inspectedPrologueItems.has(item.id));
    const inspectedCount = inspectedPrologueItems.size;
    const cinematicStep = Number.isInteger(prologueCinematicStep)
      ? EGYPT_ARCHIVE_CINEMATIC_STEPS[prologueCinematicStep]
      : null;
    const cinematicActive = Boolean(cinematicStep);
    const finalCinematicStep = prologueCinematicStep === EGYPT_ARCHIVE_CINEMATIC_STEPS.length - 1;
    const renderArchiveEvidenceVisual = (item, isInspected) => {
      const accent = isInspected ? '#77b66e' : '#c6a059';
      const baseStyle = {
        position: 'relative',
        minHeight: 86,
        marginBottom: '0.8rem',
        border: `1px solid ${isInspected ? 'rgba(119, 182, 110, 0.34)' : 'rgba(198, 160, 89, 0.24)'}`,
        borderRadius: 6,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(56, 39, 22, 0.72), rgba(16, 12, 9, 0.88))',
      };

      if (item.visualSrc) {
        return (
          <div style={baseStyle} aria-hidden="true">
            <img
              src={item.visualSrc}
              alt=""
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                minHeight: 112,
                objectFit: 'cover',
                objectPosition: item.visualType === 'report' ? 'center top' : 'center',
                display: 'block',
                filter: isInspected ? 'saturate(1.02) contrast(1.02)' : 'saturate(0.62) brightness(0.56) contrast(0.92)',
                transform: isInspected ? 'scale(1.01)' : 'scale(1.04)',
                transition: 'filter 240ms ease, transform 240ms ease',
              }}
            />
            {!isInspected && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(11, 8, 6, 0.08), rgba(11, 8, 6, 0.48))',
              }} />
            )}
          </div>
        );
      }

      if (item.visualType === 'painting') {
        return (
          <div style={baseStyle} aria-hidden="true">
            <div style={{
              position: 'absolute',
              left: '14%',
              bottom: '14%',
              width: '46%',
              height: '50%',
              background: 'rgba(218, 179, 102, 0.72)',
              clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
              boxShadow: 'inset 0 -0.85rem 0 rgba(64, 40, 20, 0.32)',
            }} />
            <div style={{
              position: 'absolute',
              left: '48%',
              top: '15%',
              width: '18%',
              height: '23%',
              border: `2px solid ${accent}`,
              borderRadius: '50% 50% 42% 42%',
              background: 'rgba(42, 182, 199, 0.14)',
              boxShadow: '0 0 1rem rgba(42, 182, 199, 0.16)',
            }} />
            <div style={{
              position: 'absolute',
              right: '12%',
              bottom: '13%',
              width: '12%',
              height: '46%',
              borderRadius: '42% 42% 10% 10%',
              background: 'rgba(7, 6, 5, 0.62)',
            }} />
            <div style={{
              position: 'absolute',
              left: '9%',
              top: '10%',
              color: isInspected ? 'rgba(242, 210, 140, 0.7)' : 'rgba(143, 125, 93, 0.55)',
              fontSize: '0.63rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {isInspected ? 'A memory returns' : 'damaged caption'}
            </div>
          </div>
        );
      }

      if (item.visualType === 'notes') {
        return (
          <div style={baseStyle} aria-hidden="true">
            <div style={{
              position: 'absolute',
              inset: '12% 52% 12% 9%',
              border: `2px solid ${accent}`,
              transform: 'rotate(-4deg)',
              opacity: 0.78,
            }} />
            <div style={{
              position: 'absolute',
              left: '17%',
              top: '28%',
              width: '20%',
              height: '4px',
              background: 'rgba(242, 210, 140, 0.56)',
              boxShadow: '0 12px 0 rgba(242, 210, 140, 0.38), 0 24px 0 rgba(242, 210, 140, 0.24)',
            }} />
            <div style={{
              position: 'absolute',
              right: '15%',
              top: '22%',
              width: '21%',
              height: '28%',
              border: `2px solid ${accent}`,
              borderRadius: '50% 50% 42% 42%',
              opacity: 0.7,
            }} />
            <div style={{
              position: 'absolute',
              right: '12%',
              bottom: '20%',
              width: '32%',
              height: '4px',
              background: 'rgba(242, 210, 140, 0.5)',
              boxShadow: '0 11px 0 rgba(242, 210, 140, 0.3)',
            }} />
          </div>
        );
      }

      return (
        <div style={baseStyle} aria-hidden="true">
          <div style={{
            position: 'absolute',
            left: '11%',
            top: '15%',
            width: '34%',
            height: '58%',
            border: `2px solid ${accent}`,
            borderRadius: 3,
            opacity: 0.74,
          }} />
          <div style={{
            position: 'absolute',
            right: '16%',
            top: '22%',
            width: '24%',
            height: '24%',
            border: `2px solid ${accent}`,
            borderRadius: '50%',
            opacity: 0.72,
          }} />
          <div style={{
            position: 'absolute',
            right: '12%',
            bottom: '19%',
            width: '36%',
            height: '4px',
            background: 'rgba(242, 210, 140, 0.5)',
            boxShadow: '0 12px 0 rgba(242, 210, 140, 0.32), 0 24px 0 rgba(242, 210, 140, 0.18)',
          }} />
        </div>
      );
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(83, 60, 32, 0.34) 0%, rgba(26, 20, 16, 0.96) 42%, #100d0b 100%)',
        color: '#f1e6cf',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 'clamp(1rem, 4vw, 2.25rem)',
        fontFamily: 'inherit',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 860, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <header style={{
            borderBottom: '1px solid rgba(198, 160, 89, 0.22)',
            paddingBottom: '1rem',
          }}>
            <div style={{ marginBottom: '0.5rem', fontSize: '0.72rem', letterSpacing: '0.12em', color: '#caa86e', textTransform: 'uppercase', fontWeight: 800 }}>
              Heritage Research - Cairo
            </div>
            <h1 style={{
              margin: 0,
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(1.65rem, 4vw, 2.7rem)',
              lineHeight: 1.05,
              color: '#fff7e7',
              letterSpacing: 0,
            }}>
              The archive points to one scarab.
            </h1>
            <p style={{ fontSize: '0.98rem', color: '#bda983', margin: '0.75rem 0 0', lineHeight: 1.55, maxWidth: 620 }}>
              Asha reviews a forgotten tomb-painting photograph before visiting the pyramid site.
            </p>
            <div style={{
              marginTop: '1rem',
              height: 'clamp(140px, 25vw, 238px)',
              border: '1px solid rgba(198, 160, 89, 0.22)',
              borderRadius: 8,
              overflow: 'hidden',
              background: 'rgba(17, 13, 10, 0.72)',
              boxShadow: '0 18px 45px rgba(0, 0, 0, 0.28)',
            }} aria-hidden="true">
              <img
                src={EGYPT_ARCHIVE_ASSETS.desk}
                alt=""
                loading="eager"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
              />
            </div>
          </header>

          <section style={{
            background: 'rgba(17, 13, 10, 0.72)',
            border: '1px solid rgba(198, 160, 89, 0.22)',
            borderRadius: 8,
            padding: 'clamp(1rem, 3vw, 1.35rem)',
            boxShadow: '0 18px 45px rgba(0, 0, 0, 0.28)',
          }} aria-label="Review the evidence">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#caa86e', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
                  Review the evidence
                </div>
                <p style={{ margin: '0.35rem 0 0', color: '#a99673', lineHeight: 1.45, fontSize: '0.9rem' }}>
                  {allInspected
                    ? 'The records are enough to justify a site check.'
                    : 'Inspect each record before Asha visits the site.'}
                </p>
              </div>
              <div style={{
                border: '1px solid rgba(198, 160, 89, 0.22)',
                borderRadius: 999,
                color: allInspected ? '#bde7ad' : '#caa86e',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}>
                {inspectedCount} / {EGYPT_ARCHIVE_PROLOGUE_ITEMS.length} reviewed
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {EGYPT_ARCHIVE_PROLOGUE_ITEMS.map(item => {
              const isInspected = inspectedPrologueItems.has(item.id);
              return (
                <div
                  key={item.id}
                  style={{
                    background: isInspected ? 'rgba(198, 160, 89, 0.10)' : 'rgba(255, 247, 229, 0.045)',
                    border: `1px solid ${isInspected ? 'rgba(189, 231, 173, 0.42)' : 'rgba(198, 160, 89, 0.20)'}`,
                    borderLeft: `4px solid ${isInspected ? '#77b66e' : '#c6a059'}`,
                    borderRadius: 8,
                    padding: '1rem',
                    minHeight: 190,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      {renderArchiveEvidenceVisual(item, isInspected)}
                      <div style={{ fontSize: '0.68rem', color: '#caa86e', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                        {item.label}
                      </div>
                      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, marginTop: '0.2rem', marginBottom: isInspected ? '0.5rem' : 0, color: '#fff3dd' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#8f7d5d', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem', fontWeight: 800 }}>
                        {item.format}
                      </div>
                      {isInspected && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {item.body.map((line, i) => (
                            <div key={i} style={{ fontSize: '0.875rem', color: '#b8a98a', lineHeight: 1.6 }}>{line}</div>
                          ))}
                        </div>
                      )}
                      {!isInspected && (
                        <div style={{ fontSize: '0.86rem', color: '#857457', lineHeight: 1.5 }}>
                          Sealed in the archive tray until inspected.
                        </div>
                      )}
                    </div>
                    {!isInspected && (
                      <button
                        type="button"
                        onClick={() => setInspectedPrologueItems(prev => new Set([...prev, item.id]))}
                        style={{
                          flexShrink: 0,
                          background: 'rgba(212,175,106,0.15)',
                          border: '1px solid rgba(212,175,106,0.5)',
                          borderRadius: 4,
                          color: '#d4af6a',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Inspect record
                      </button>
                    )}
                    {isInspected && (
                      <div style={{ flexShrink: 0, fontSize: '0.75rem', color: '#6aad6a' }}>✓ Reviewed</div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </section>

          {allInspected && !cinematicActive && (
            <section style={{
              background: 'linear-gradient(135deg, rgba(73, 50, 28, 0.48) 0%, rgba(17, 13, 10, 0.86) 72%)',
              border: '1px solid rgba(198, 160, 89, 0.24)',
              borderLeft: '4px solid #c6a059',
              borderRadius: 8,
              padding: '1.15rem',
              boxShadow: 'inset 0 1px 0 rgba(255, 244, 214, 0.05)',
            }} aria-label="Travel to Pyramid">
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#caa86e', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 800 }}>
                Site check authorised
              </div>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff3dd', margin: '0 0 0.55rem', fontSize: '1.45rem', letterSpacing: 0 }}>
                The records point to the pyramid.
              </h2>
              <p style={{ color: '#d3c09a', margin: '0 0 1rem', lineHeight: 1.5, maxWidth: 620 }}>
                Asha has enough evidence to leave the archive and verify why the old painting finally matches the real site.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1rem',
              }} aria-hidden="true">
                <div style={{
                  position: 'relative',
                  minHeight: 132,
                  border: '1px solid rgba(198, 160, 89, 0.28)',
                  borderRadius: 6,
                  background: 'linear-gradient(180deg, rgba(80, 52, 27, 0.82), rgba(18, 13, 10, 0.92))',
                  overflow: 'hidden',
                }}>
                  <img
                    src={EGYPT_ARCHIVE_ASSETS.painting}
                    alt=""
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: 132,
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                    }}
                  />
                  <div style={{ position: 'absolute', left: '8%', top: '9%', color: 'rgba(242, 210, 140, 0.82)', fontSize: '0.66rem', letterSpacing: '0.08em', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>old painting</div>
                </div>
                <div style={{
                  position: 'relative',
                  minHeight: 132,
                  border: '1px solid rgba(119, 182, 110, 0.34)',
                  borderRadius: 6,
                  background: 'linear-gradient(180deg, rgba(101, 77, 43, 0.66), rgba(18, 13, 10, 0.9))',
                  overflow: 'hidden',
                }}>
                  <img
                    src={EGYPT_ARCHIVE_ASSETS.report}
                    alt=""
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: 132,
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      display: 'block',
                    }}
                  />
                  <div style={{ position: 'absolute', left: '8%', top: '9%', color: 'rgba(189, 231, 173, 0.82)', fontSize: '0.66rem', letterSpacing: '0.08em', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>current site</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrologueCinematicStep(0)}
                style={{
                  background: 'rgba(198, 160, 89, 0.2)',
                  border: '1px solid rgba(198, 160, 89, 0.72)',
                  borderRadius: 5,
                  color: '#f2d28c',
                  padding: '0.66rem 1.2rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                }}
              >
                Travel to Pyramid
              </button>
            </section>
          )}

          {!cinematicActive && !allInspected && (
            <div style={{
              background: allInspected ? 'rgba(198, 160, 89, 0.08)' : 'rgba(255,255,255,0.025)',
              border: `1px solid ${allInspected ? 'rgba(198, 160, 89, 0.38)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 8,
              padding: '1rem 1.1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ flex: '1 1 260px' }}>
                <div style={{ fontSize: '0.72rem', color: allInspected ? '#caa86e' : '#736247', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                  Scarab - Site Comparison
                </div>
                <div style={{ fontSize: '0.9rem', color: allInspected ? '#cdbb95' : '#76664c', marginTop: '0.35rem', lineHeight: 1.45 }}>
                  {allInspected
                    ? 'Old stone. The tomb-painting photograph finally matches the site.'
                    : 'Review all evidence first.'}
                </div>
              </div>
              <button
                type="button"
                disabled={!allInspected}
                style={{
                  flexShrink: 0,
                  background: allInspected ? 'rgba(198, 160, 89, 0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${allInspected ? 'rgba(198, 160, 89, 0.65)' : 'rgba(255,255,255,0.09)'}`,
                  borderRadius: 5,
                  color: allInspected ? '#f2d28c' : '#5a4a30',
                  padding: '0.52rem 0.92rem',
                  fontSize: '0.85rem',
                  cursor: allInspected ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  fontWeight: 800,
                }}
              >
                {allInspected ? 'Examine the scarab' : 'Review all evidence first.'}
              </button>
            </div>
          )}

          {cinematicStep && (
            <section style={{
              textAlign: 'left',
              background: 'linear-gradient(135deg, rgba(12, 10, 8, 0.9) 0%, rgba(43, 29, 17, 0.78) 100%)',
              border: '1px solid rgba(198, 160, 89, 0.30)',
              borderRadius: 8,
              padding: 'clamp(1rem, 3vw, 1.45rem)',
              boxShadow: '0 20px 55px rgba(0, 0, 0, 0.36)',
            }} aria-label={cinematicStep.title}>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#caa86e', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 800 }}>
                {cinematicStep.kicker}
              </div>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff3dd', margin: '0 0 0.95rem', fontSize: '1.45rem', letterSpacing: 0 }}>
                {cinematicStep.title}
              </h2>
              {cinematicStep.visualSrc && (
                <div style={{
                  position: 'relative',
                  height: 'clamp(190px, 35vw, 330px)',
                  marginBottom: '1.15rem',
                  border: `1px solid ${finalCinematicStep ? 'rgba(242, 210, 140, 0.34)' : 'rgba(198, 160, 89, 0.24)'}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'rgba(12, 10, 8, 0.92)',
                  boxShadow: finalCinematicStep
                    ? '0 20px 56px rgba(0, 0, 0, 0.42), 0 0 32px rgba(198, 160, 89, 0.12)'
                    : '0 18px 45px rgba(0, 0, 0, 0.32)',
                }} aria-hidden="true">
                  <img
                    src={cinematicStep.visualSrc}
                    alt=""
                    loading={prologueCinematicStep === 0 ? 'eager' : 'lazy'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: cinematicStep.visualObjectPosition || 'center',
                      display: 'block',
                      filter: finalCinematicStep
                        ? 'saturate(1.05) contrast(1.04)'
                        : 'saturate(1.02) contrast(1.02)',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: finalCinematicStep
                      ? 'linear-gradient(180deg, rgba(10, 7, 5, 0.05), rgba(10, 7, 5, 0.22))'
                      : 'linear-gradient(180deg, rgba(10, 7, 5, 0.02), rgba(10, 7, 5, 0.18))',
                  }} />
                </div>
              )}
              <div style={{ display: 'grid', gap: '0.3rem', marginBottom: '1.4rem' }}>
                {cinematicStep.lines.map((line, i) => (
                  <div key={line} style={{ fontSize: '0.98rem', color: finalCinematicStep && i >= 10 ? '#f2d28c' : '#d3c09a', fontStyle: finalCinematicStep && i >= 10 ? 'italic' : 'normal', lineHeight: 1.55 }}>{line}</div>
                ))}
              </div>
              {cinematicStep.note && (
                <p style={{ margin: '0 0 1rem', color: '#d3c09a', fontSize: '0.92rem', lineHeight: 1.45 }}>
                  {cinematicStep.note}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  audioControls.unlockExpeditionSfx?.();
                  if (cinematicStep.id === 'scarab-floor-carving') {
                    audioControls.playExpeditionSfx?.('scarabTouchWhisper', { volume: 0.74 });
                  }
                  if (finalCinematicStep) {
                    audioControls.playExpeditionSfx?.('thresholdRealityTear', { volume: 0.82 });
                    setJourneyOpeningMode('arrival-threshold');
                    setExpeditionStage('journey');
                    setPrologueCinematicStep(null);
                    setNotice('This isn\'t the excavation site.');
                    return;
                  }
                  setPrologueCinematicStep(step => step + 1);
                }}
                style={{
                  background: 'rgba(198, 160, 89, 0.2)',
                  border: '1px solid rgba(198, 160, 89, 0.72)',
                  borderRadius: 5,
                  color: '#f2d28c',
                  padding: '0.66rem 1.2rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              >
                {cinematicStep.actionLabel}
              </button>
            </section>
          )}
        </div>
      </div>
    );
  };

  const renderRomeArchivePrologue = () => {
    const prologueItems = ROME_ARCHIVE_PROLOGUE_ITEMS;
    const cinematicSteps = ROME_ARCHIVE_CINEMATIC_STEPS;
    const allInspected = prologueItems.every(item => inspectedPrologueItems.has(item.id));
    const inspectedCount = inspectedPrologueItems.size;
    const cinematicStep = Number.isInteger(prologueCinematicStep) ? cinematicSteps[prologueCinematicStep] : null;
    const cinematicActive = Boolean(cinematicStep);
    const finalCinematicStep = prologueCinematicStep === cinematicSteps.length - 1;
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(60, 50, 38, 0.36) 0%, rgba(18, 15, 12, 0.97) 42%, #0e0c0a 100%)',
        color: '#ede4d4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 'clamp(1rem, 4vw, 2.25rem)',
        fontFamily: 'inherit',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 860, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <header style={{ borderBottom: '1px solid rgba(180, 155, 100, 0.22)', paddingBottom: '1rem' }}>
            <div style={{ marginBottom: '0.5rem', fontSize: '0.72rem', letterSpacing: '0.12em', color: '#b8986a', textTransform: 'uppercase', fontWeight: 800 }}>
              Heritage Research — Rome
            </div>
            <h1 style={{
              margin: 0,
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(1.65rem, 4vw, 2.7rem)',
              lineHeight: 1.05,
              color: '#f5ede0',
              letterSpacing: 0,
            }}>
              The Senate buried something beneath the Forum.
            </h1>
            <p style={{ fontSize: '0.98rem', color: '#a89070', margin: '0.75rem 0 0', lineHeight: 1.55, maxWidth: 620 }}>
              Asha reviews the available records before descending to the Forum site.
            </p>
          </header>

          <section style={{
            background: 'rgba(14, 11, 8, 0.72)',
            border: '1px solid rgba(180, 155, 100, 0.22)',
            borderRadius: 8,
            padding: 'clamp(1rem, 3vw, 1.35rem)',
            boxShadow: '0 18px 45px rgba(0, 0, 0, 0.30)',
          }} aria-label="Review the records">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#b8986a', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
                  Review the records
                </div>
                <p style={{ margin: '0.35rem 0 0', color: '#9a8060', lineHeight: 1.45, fontSize: '0.9rem' }}>
                  {allInspected
                    ? 'The records justify a descent to the sealed site.'
                    : 'Inspect each record before Asha visits the Forum.'}
                </p>
              </div>
              <div style={{
                border: '1px solid rgba(180, 155, 100, 0.22)',
                borderRadius: 999,
                color: allInspected ? '#a8d898' : '#b8986a',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}>
                {inspectedCount} / {prologueItems.length} reviewed
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {prologueItems.map(item => {
                const isInspected = inspectedPrologueItems.has(item.id);
                return (
                  <div key={item.id} style={{
                    background: isInspected ? 'rgba(180, 155, 100, 0.10)' : 'rgba(255, 248, 235, 0.04)',
                    border: `1px solid ${isInspected ? 'rgba(168, 216, 152, 0.42)' : 'rgba(180, 155, 100, 0.20)'}`,
                    borderLeft: `4px solid ${isInspected ? '#6aaa62' : '#b09060'}`,
                    borderRadius: 8,
                    padding: '1rem',
                    minHeight: 190,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.68rem', color: '#b8986a', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                          {item.label}
                        </div>
                        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, marginTop: '0.2rem', marginBottom: isInspected ? '0.5rem' : 0, color: '#f0e6d0' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#806850', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem', fontWeight: 800 }}>
                          {item.format}
                        </div>
                        {isInspected && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {item.body.map((line, i) => (
                              <div key={i} style={{ fontSize: '0.875rem', color: '#a89878', lineHeight: 1.6 }}>{line}</div>
                            ))}
                          </div>
                        )}
                        {!isInspected && (
                          <div style={{ fontSize: '0.86rem', color: '#786050', lineHeight: 1.5 }}>Tap to inspect this record.</div>
                        )}
                      </div>
                      {!isInspected && (
                        <button
                          type="button"
                          onClick={() => setInspectedPrologueItems(prev => new Set([...prev, item.id]))}
                          style={{
                            flexShrink: 0,
                            background: 'rgba(192, 162, 100, 0.15)',
                            border: '1px solid rgba(192, 162, 100, 0.5)',
                            borderRadius: 4,
                            color: '#c8a872',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          Inspect record
                        </button>
                      )}
                      {isInspected && (
                        <div style={{ flexShrink: 0, fontSize: '0.75rem', color: '#6aaa62' }}>✓ Reviewed</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {allInspected && !cinematicActive && (
            <section style={{
              background: 'linear-gradient(135deg, rgba(55, 42, 28, 0.48) 0%, rgba(14, 11, 8, 0.86) 72%)',
              border: '1px solid rgba(180, 155, 100, 0.24)',
              borderLeft: '4px solid #b09060',
              borderRadius: 8,
              padding: '1.15rem',
              boxShadow: 'inset 0 1px 0 rgba(240, 230, 200, 0.05)',
            }} aria-label="Travel to Forum">
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#b8986a', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 800 }}>
                Descent authorised
              </div>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#f0e6d0', margin: '0 0 0.55rem', fontSize: '1.45rem', letterSpacing: 0 }}>
                The records point to the Forum.
              </h2>
              <p style={{ color: '#c8b890', margin: '0 0 1rem', lineHeight: 1.5, maxWidth: 620 }}>
                Asha has enough evidence to leave the archive and verify the sealed door in person.
              </p>
              <button
                type="button"
                onClick={() => setPrologueCinematicStep(0)}
                style={{
                  background: 'rgba(180, 155, 100, 0.2)',
                  border: '1px solid rgba(180, 155, 100, 0.72)',
                  borderRadius: 5,
                  color: '#e8c87a',
                  padding: '0.66rem 1.2rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                }}
              >
                Travel to Forum
              </button>
            </section>
          )}

          {!cinematicActive && !allInspected && (
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '1rem 1.1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ flex: '1 1 260px' }}>
                <div style={{ fontSize: '0.72rem', color: '#6a5840', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                  Sealed Vault Door
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6a5840', marginTop: '0.35rem', lineHeight: 1.45 }}>
                  Review all evidence first.
                </div>
              </div>
              <button
                type="button"
                disabled
                style={{
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 5,
                  color: '#4a3820',
                  padding: '0.52rem 0.92rem',
                  fontSize: '0.85rem',
                  cursor: 'not-allowed',
                  fontFamily: 'inherit',
                  fontWeight: 800,
                }}
              >
                Review all evidence first.
              </button>
            </div>
          )}

          {cinematicStep && (
            <section style={{
              textAlign: 'left',
              background: 'linear-gradient(135deg, rgba(10, 8, 6, 0.92) 0%, rgba(38, 28, 18, 0.80) 100%)',
              border: '1px solid rgba(180, 155, 100, 0.30)',
              borderRadius: 8,
              padding: 'clamp(1rem, 3vw, 1.45rem)',
              boxShadow: '0 20px 55px rgba(0, 0, 0, 0.36)',
            }} aria-label={cinematicStep.title}>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#b8986a', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 800 }}>
                {cinematicStep.kicker}
              </div>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#f0e6d0', margin: '0 0 0.95rem', fontSize: '1.45rem', letterSpacing: 0 }}>
                {cinematicStep.title}
              </h2>
              <div style={{ display: 'grid', gap: '0.3rem', marginBottom: '1.4rem' }}>
                {cinematicStep.lines.map((line, i) => (
                  <div key={line} style={{ fontSize: '0.98rem', color: finalCinematicStep && i >= 8 ? '#e8c87a' : '#c8b890', fontStyle: finalCinematicStep && i >= 8 ? 'italic' : 'normal', lineHeight: 1.55 }}>{line}</div>
                ))}
              </div>
              {cinematicStep.note && (
                <p style={{ margin: '0 0 1rem', color: '#c8b890', fontSize: '0.92rem', lineHeight: 1.45 }}>
                  {cinematicStep.note}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  if (finalCinematicStep) {
                    setJourneyOpeningMode('standard');
                    setExpeditionStage('journey');
                    setPrologueCinematicStep(null);
                    setNotice('The Senate sealed this. Now it is open.');
                    return;
                  }
                  setPrologueCinematicStep(step => step + 1);
                }}
                style={{
                  background: 'rgba(180, 155, 100, 0.2)',
                  border: '1px solid rgba(180, 155, 100, 0.72)',
                  borderRadius: 5,
                  color: '#e8c87a',
                  padding: '0.66rem 1.2rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              >
                {cinematicStep.actionLabel}
              </button>
            </section>
          )}
        </div>
      </div>
    );
  };

  if (shouldShowArchivePrologue) {
    return isRomeArchivePrologue ? renderRomeArchivePrologue() : renderArchivePrologue();
  }

  if (expeditionStage === 'journey' && !baseCampOpen) {
    return (
      <div
        className={`expedition-journey-mode-shell ${journeyPaused ? 'is-paused' : ''} ${journeyCursorShouldHide ? 'is-cursor-hidden' : ''}`}
        onMouseMove={handleJourneyMouseMove}
        onMouseDown={handleJourneyMouseMove}
      >
        <button
          type="button"
          className="expedition-local-menu-btn"
          onClick={() => setJourneyPaused(open => !open)}
          aria-label={journeyPaused ? 'Resume expedition' : 'Pause expedition'}
          aria-expanded={journeyPaused}
          title={journeyPaused ? 'Resume' : 'Pause'}
        >
          {journeyPaused ? <Play size={18} /> : <Pause size={18} />}
        </button>
        <button
          type="button"
          className="expedition-local-menu-btn expedition-local-sound-btn"
          onClick={() => audioControls.toggleExpeditionSfx?.()}
          aria-label={`Expedition sounds ${audioControls.expeditionSfxEnabled ? 'on' : 'off'}`}
          aria-pressed={Boolean(audioControls.expeditionSfxEnabled)}
          title={`Sounds ${audioControls.expeditionSfxEnabled ? 'On' : 'Off'}`}
        >
          {audioControls.expeditionSfxEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        {journeyPaused && (
          <div className="journey-pause-menu" role="dialog" aria-modal="true" aria-label="Expedition options">
            <div className="journey-pause-card">
              <div className="journey-pause-title">Paused</div>
              <button type="button" className="journey-pause-primary" onClick={() => setJourneyPaused(false)}>
                <Play size={16} /> Resume
              </button>
              <div className="journey-pause-controls" aria-label="Controls and combat">
                <JourneyControlsReference compactMovementKeys />
              </div>
              <button type="button" className="journey-pause-secondary" onClick={onBackToMenu}>
                <Home size={16} /> Back to menu
              </button>
              <p className="journey-pause-hint">Press <kbd>Esc</kbd> or <kbd>?</kbd> to resume.</p>
            </div>
          </div>
        )}
        <ExpeditionJourney
          key={`${selectedStageId}-${journeyRunId}-${journeyOpeningMode}`}
          mission={activeMission}
          onBackToMenu={onBackToMenu}
          onComplete={handleJourneyComplete}
          onSnapshotChange={handleJourneySnapshot}
          audioControls={audioControls}
          paused={journeyPaused}
          targetCivilisation={targetCivilisation}
          environmentPackId={stageContent.journeyEnvironmentPackId}
          backgroundPackId={stageContent.journeyBackgroundPackId}
          permanentUpgradeIds={baseCampProgression.purchasedUpgrades}
          permanentUpgradeEffects={permanentUpgradeEffects}
          openingStartMode={journeyOpeningMode}
        />
      </div>
    );
  }

  if (baseCampOpen) {
    return (
      <section className="expedition-fullscreen-room expedition-basecamp-room" aria-label="Base Camp">
        {dynastyTimelineOpen && (
          <DynastyTimelinePuzzle
            dynasties={CHINA_DYNASTY_TIMELINE}
            onSolved={() => setDynastyTimelineOpen(false)}
          />
        )}
        <header className="expedition-fullscreen-header">
          <div className="header-left">
            <button type="button" className="fullscreen-back-btn" onClick={onBackToMenu}>
              <ChevronLeft size={16} /> Exit to Menu
            </button>
          </div>
          <div className="header-center">
            <div className="fullscreen-kicker">Lost Site Expedition</div>
            <h1 className="fullscreen-title">Base Camp Outpost</h1>
          </div>
          <div className="header-right">
            <div className="fullscreen-badge status-ready">
              <Sparkles size={14} className="badge-icon pulse" />
              <span>Safe Hub Reached</span>
            </div>
          </div>
        </header>

        <div className="expedition-fullscreen-content">
          <aside className="basecamp-column basecamp-briefing-col">
            <div className="fullscreen-card briefing-card">
              <div className="card-ribbon">Field Journal</div>
              <div className="card-header">
                <Target size={20} className="card-icon" />
                <h2>Field Journal</h2>
              </div>
              <div className="card-body">
                <div className="mission-badge">{activeMission.targetCategoryTitle}</div>
                <h3 className="mission-title">{activeMission.title}</h3>
                <div className="mission-divider"></div>
                <div className="mission-inquiry">
                  <span className="label">Working Theory</span>
                  <p className="value">{activeMission.inquiryQuestion}</p>
                </div>
                <div className="mission-instruction-box">
                  <span className="label">Expedition Plan</span>
                  <p className="value">{activeMission.instruction}</p>
                </div>
              </div>
              <div className="card-footer-note">
                Review the route, prepare the kit, and enter the excavation with care.
              </div>
            </div>
          </aside>

          <main className="basecamp-column basecamp-shop-col">
            <div className="fullscreen-card shop-card">
              <div className="card-header flex-header">
                <div className="title-area">
                  <Gem size={20} className="card-icon gold-glow" />
                  <h2>Tool Bench</h2>
                </div>
                <div className={`fullscreen-shard-bank ${shopFeedback?.type === 'purchase' || shopFeedback?.type === 'deposit' ? 'is-rewarding' : ''}`}>
                  <Gem size={16} className="shard-icon" />
                  <span className="shard-label">Relic Table</span>
                  <strong className="shard-count">{baseCampProgression.relicShards}</strong>
                </div>
              </div>

              {shopFeedback && (
                <div className={`fullscreen-shop-feedback ${shopFeedback.type}`}>
                  <strong>{shopFeedback.title}</strong>
                  <span>{shopFeedback.message}</span>
                </div>
              )}

              <div className="fullscreen-shop-grid-container">
                {shopItemsBySection.map(group => (
                  <div key={group.section} className="fullscreen-shop-category">
                    <h3 className="category-title">{group.section}</h3>
                    <div className="fullscreen-shop-items-grid">
                      {group.items.map((item) => {
                        const owned = baseCampOwnedItemIds.has(item.id);
                        const affordable = baseCampProgression.relicShards >= item.cost;
                        const highlighted = shopFeedback?.itemId === item.id && shopFeedback.type === 'purchase';
                        return (
                          <article key={item.id} className={`fullscreen-shop-item-card ${owned ? 'is-owned' : ''} ${highlighted ? 'just-purchased' : ''} ${item.locked ? 'is-locked' : ''}`}>
                            <div className="item-meta">
                              <span className="item-name">{item.name}</span>
                              <span className="item-effect">{item.shortEffect}</span>
                            </div>
                            <p className="item-description">{item.description}</p>
                            {item.routeUse && (
                              <div className="item-route-use">
                                <Compass size={12} className="route-icon" />
                                <span>{item.routeUse}</span>
                              </div>
                            )}
                            <div className="item-actions">
                              <div className="item-cost-pill">
                                <Gem size={12} />
                                <strong>{item.cost}</strong>
                              </div>
                              <button type="button" className="fullscreen-shop-btn" onClick={() => purchaseShopItem(item.id)} disabled={owned || item.locked || !affordable}>
                                {owned ? 'Owned' : item.locked ? 'Locked' : affordable ? 'Buy' : 'Need Shards'}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          <aside className="basecamp-column basecamp-kit-col">
            <div className="fullscreen-card kit-card">
              <div className="card-header">
                <Backpack size={20} className="card-icon" />
                <h2>Field Kit Report</h2>
              </div>
              <div className="fullscreen-kit-list">
                {fieldKitImpact.map((tool) => (
                  <div key={tool.id} className={`fullscreen-kit-item ${tool.isCollected ? 'is-collected' : ''}`}>
                    <div className="tool-main-row">
                      <div className="tool-icon-box"><tool.icon size={20} /></div>
                      <div className="tool-meta">
                        <span className="tool-title">{tool.shortTitle}</span>
                        <span className="tool-status">{tool.isCollected ? 'Secured' : 'Missing'}</span>
                      </div>
                      <div className="tool-status-indicator">
                        <div className={`indicator-dot ${tool.isCollected ? 'secured' : 'missing animate-pulse'}`}></div>
                      </div>
                    </div>
                    <div className="tool-impact-detail">
                      <p className="impact-text"><strong>Impact:</strong> {tool.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="active-gear-box">
                <span className="gear-box-label">Fitted Permanent Upgrades</span>
                <div className="gear-pills">
                  {activeBaseCampKitSummary.length > 0 ? (
                    activeBaseCampKitSummary.map(summary => <span key={summary} className="gear-pill">{summary}</span>)
                  ) : (
                    <span className="gear-pill em">No permanent gear active</span>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="expedition-fullscreen-footer">
          <button type="button" className="footer-btn secondary-btn" onClick={resetExpedition}>
            <RotateCcw size={16} /> Restart Journey
          </button>
          <button type="button" className="footer-btn primary-btn pulse-glow" onClick={beginExcavationStage}>
            Begin Excavation <ChevronRight size={18} />
          </button>
        </footer>
      </section>
    );
  }

  return (
    <section className="phase-container bureau-phase expedition-phase">
      <div className={`expedition-shell ${briefingOpen ? 'briefing-paused' : ''}`}>
        <header className="expedition-topbar">
          <button type="button" className="bureau-hint-btn" onClick={onBackToMenu}>
            <ChevronLeft size={18} /> Back to Menu
          </button>
          <div className="expedition-title">
            <div className="training-kicker">10-15 mins | Standalone Adventure</div>
            <h2>{stageContent.mapTitle}</h2>
          </div>
          <div className={`expedition-gate-badge ${exitUnlocked ? 'unlocked' : ''}`}>
            <Sparkles size={16} />
            <span>{exitUnlocked ? 'Exit Gate Unlocked' : 'Exit Gate Locked'}</span>
            <small>{exitUnlocked ? `${activeMission.targetCategoryTitle} secured ${missionEvidenceCount}/${missionRequiredCount}` : `${activeMission.targetCategoryTitle} found ${missionEvidenceCount}/${missionRequiredCount}`}</small>
          </div>
        </header>

        <div className="expedition-layout">
          <div className="expedition-map-card">
            <div className="expedition-map-status">
              <span><MapIcon size={16} /> {currentZone}</span>
              <span>{notice}</span>
            </div>
            <canvas
              ref={canvasRef}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              aria-label="Top-down expedition map"
              className="expedition-canvas"
              onClick={selectMapZoneAtPoint}
            />
            {selectedMapZoneData && !inspectionToken && !surveyReportZone && !gridSetupOpen && !activeZoneChallenge && (
              <div className="expedition-zone-preview">
                <div>
                  <span className="expedition-zone-preview-kicker">Selected room</span>
                  <strong>{selectedMapZoneData.name}</strong>
                  <p>{selectedRoomData?.description || selectedMapZoneData.name}</p>
                </div>
                <dl>
                  <div>
                    <dt>Entry check</dt>
                    <dd>{completedZoneChallenges.has(selectedMapZone) ? 'Complete' : 'Required'}</dd>
                  </div>
                  <div>
                    <dt>Survey</dt>
                    <dd>{surveyedZones.has(selectedMapZone) ? 'Surveyed' : canSurveySelectedZone ? 'Ready' : 'Locked'}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="btn primary-btn"
                  onClick={() => {
                    if (canSurveySelectedZone) openSurveyReport(surveyZoneById[selectedMapZone]);
                    else enterSelectedMapZone(selectedMapZone);
                  }}
                >
                  {canSurveySelectedZone ? 'Survey Area' : completedZoneChallenges.has(selectedMapZone) ? 'Enter Zone' : 'Start Room Check'}
                </button>
              </div>
            )}
            {nearbySurveyZone && !nearbyToken && !inspectionToken && !surveyReportZone && (
              <div className="expedition-inspect-prompt expedition-survey-prompt">
                <div>
                  <strong>{nearbySurveyZone.name}</strong>
                  <span>{nearbySurveyZone.prompt}</span>
                </div>
                <button type="button" className="btn primary-btn" onClick={() => openSurveyReport(nearbySurveyZone)}>
                  {completedZoneChallenges.has(nearbySurveyZone.id) ? 'Survey Area' : 'Room Check'}
                </button>
                <kbd>E</kbd>
              </div>
            )}
            {selectedSurveyZone && !gridComplete && !nearbyToken && !inspectionToken && !surveyReportZone && !gridSetupOpen && (
              <div className="expedition-inspect-prompt expedition-grid-prompt">
                <div>
                  <strong>{surveyZoneById[selectedSurveyZone]?.name} grid ready</strong>
                  <span>Open a grid square before evidence can be inspected.</span>
                </div>
                <button type="button" className="btn primary-btn" onClick={openGridSetup}>
                  Grid Setup
                </button>
                <kbd>E</kbd>
              </div>
            )}
            {nearbyToken && !inspectionToken && (
              <div className="expedition-inspect-prompt">
                <div>
                  <strong>{nearbyToken.name}</strong>
                  <span>Press E to inspect evidence</span>
                </div>
                <button type="button" className="btn primary-btn" onClick={() => openInspection(nearbyToken)}>
                  Inspect Evidence
                </button>
                <kbd>E</kbd>
              </div>
            )}
          </div>

          <aside className="expedition-side-panel">
            <section className="expedition-panel expedition-mission-panel">
              <h3><Sparkles size={17} /> Expedition Goal</h3>
              <div className="expedition-mission-card">
                <strong>{activeMission.title}</strong>
                <span>{activeMission.targetCategoryTitle}</span>
                <p><strong>Working theory:</strong> {activeMission.inquiryQuestion}</p>
                <p>{activeMission.instruction}</p>
                <div className="expedition-mission-progress">
                  {activeMission.evidenceLabel}: <span>{missionEvidenceCount}/{missionRequiredCount}</span>
                </div>
              </div>
            </section>

            <section className="expedition-panel">
              <h3><MapIcon size={17} /> Survey the Site</h3>
              <div className="expedition-mission-card">
                <strong>{surveyComplete ? `${surveyZoneById[selectedSurveyZone]?.name} marked` : 'Survey required'}</strong>
                <span>Survey, choose a dig zone, then set up a grid</span>
                <p>
                  {surveyComplete
                    ? 'Your dig zone is marked. Evidence will stay hidden until you open grid squares in this area.'
                    : 'Evidence is hidden until you survey an area and mark a dig zone.'}
                </p>
                <div className="expedition-mission-progress">
                  Surveyed zones: <span>{surveyedZones.size}/{surveyZones.length}</span>
                </div>
              </div>
            </section>

            <section className="expedition-panel">
              <h3><MapIcon size={17} /> Mark the Grid</h3>
              <div className="expedition-mission-card">
                <strong>{selectedSurveyZone ? `${surveyZoneById[selectedSurveyZone]?.name} grid` : 'Grid not ready yet'}</strong>
                <span>Mark squares to record where evidence was found</span>
                <p>
                  {selectedSurveyZone
                    ? (gridComplete
                      ? `Opened squares: ${[...openedGridSquares].join(', ')}. Open more squares if you need more evidence.`
                      : 'Choose a grid square before any evidence becomes visible in this dig zone.')
                    : 'Grid setup becomes available after you mark a dig zone.'}
                </p>
                <div className="expedition-mission-progress">
                  Grid squares opened: <span>{openedGridSquares.size}/{gridSquares.length || 4}</span>
                </div>
                {selectedSurveyZone && (
                  <button type="button" className="btn" onClick={openGridSetup}>
                    {gridComplete ? 'Review Grid Setup' : 'Open Grid Setup'}
                  </button>
                )}
              </div>
            </section>

            <section className="expedition-panel">
              <h3><Gauge size={17} /> Field Resources</h3>
              <div className="resource-list">
                <div><strong>{resources.investigation}</strong><span>Survey focus</span></div>
                <div><strong>{resources.stamina}</strong><span>Stamina</span></div>
                <div><strong>{Math.floor(resources.time / 60)}:{String(resources.time % 60).padStart(2, '0')}</strong><span>Time</span></div>
              </div>
            </section>

            <section className="expedition-panel">
              <h3><Backpack size={17} /> Field Kit</h3>
              <ul className="expedition-tool-list expedition-tool-impact-list compact">
                {fieldKitImpact.map((tool) => (
                  <li key={tool.id} className={tool.isCollected ? 'is-collected' : ''}>
                    <span>{tool.name}</span>
                    <strong>{tool.isCollected ? tool.impact : 'Missing'}</strong>
                    <p>{tool.isCollected ? tool.collectedDesc : tool.missingDesc}</p>
                  </li>
                ))}
              </ul>
            </section>

            {fieldKitEffects.notebookReady && (
              <section className="expedition-panel">
                <h3><MapIcon size={17} /> Field Notes</h3>
                <div className="expedition-evidence-list">
                  {fieldNotes.length === 0 && <p className="expedition-empty">Reject non-mission evidence to record a note here.</p>}
                  {fieldNotes.map(note => (
                    <article key={note.id} className="expedition-evidence-item expedition-note-item">
                      <strong>{note.name}</strong>
                      <span>{note.category}</span>
                      <p>{note.note}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="expedition-panel">
              <h3><Backpack size={17} /> Evidence Inventory <span className="expedition-inventory-count">{collectedEvidence.length}/{MAX_EVIDENCE_ITEMS}</span></h3>
              <div className="expedition-evidence-list">
                {collectedEvidence.length === 0 && <p className="expedition-empty">No evidence collected yet.</p>}
                {collectedEvidence.map(item => (
                  <article key={item.id} className="expedition-evidence-item">
                    <strong>{item.name}</strong>
                    <span>{item.category} | {item.zone}</span>
                    {item.evidenceQuality && <span>Quality: {item.evidenceQuality}</span>}
                    <span className="expedition-evidence-clue-group">{item.clueGroup}</span>
                    <p>{item.clue}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="expedition-panel">
              <h3><ShieldAlert size={17} /> Site Hazards</h3>
              <ul className="expedition-hazard-list">
                <li>sandstorm: lowers time</li>
                <li>falling rocks: lowers investigation points</li>
                <li>unstable floor: lowers Endurance</li>
                <li>scorpion path: obstacle only</li>
                <li>Tomb Guardian Shadow: avoid its patrol</li>
              </ul>
            </section>

            <section className="expedition-panel">
              <h3><Clock size={17} /> Controls</h3>
              <p className="expedition-control-copy">Move with WASD or the arrow keys. Stand in a zone and press E to survey. After marking a dig zone, press E to open the grid setup, then inspect evidence revealed by opened squares.</p>
            </section>
          </aside>
        </div>
      </div>

      {briefingOpen && (
        <section className="expedition-fullscreen-room expedition-briefing-room" aria-label="Expedition Briefing">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={onBackToMenu}>
                <ChevronLeft size={16} /> Exit to Menu
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Expedition Dossier</div>
              <h1 className="fullscreen-title">Operation Briefing</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <ShieldAlert size={14} className="badge-icon" />
                <span>CLASSIFIED</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.5rem', padding: '1.5rem 2rem' }}>
            {/* Left Column: Stamps and Rules */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #8b6a48' }}>
                <div className="card-ribbon" style={{ background: '#ef4444', color: '#fff' }}>TOP SECRET</div>
                <div className="card-header">
                  <BookOpen size={20} className="card-icon" />
                  <h2>Expedition Mandate</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a89a7f', lineHeight: 1.5 }}>
                    You are deploying to a restricted historical quadrant. Survey the site first, choose a dig zone, collect evidence, and formulate a solid claim to prove which civilisation occupied this site.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#c5a059', letterSpacing: '0.06rem' }}>Field Directives</span>
                    <ul style={{ paddingLeft: '1.1rem', margin: 0, display: 'grid', gap: '0.5rem', fontSize: '0.78rem', color: '#a89a7f', lineHeight: 1.45 }}>
                      <li><strong>Search</strong>: {activeMission.briefingRule}</li>
                      <li><strong>Survey First</strong>: Evidence is hidden until you survey and mark a dig zone.</li>
                      <li><strong>Grid Mapping</strong>: Open grid squares to record coordinates before collecting items.</li>
                      <li><strong>Satchel Capacity</strong>: Max 3 items. Replace weaker items carefully.</li>
                      <li><strong>Hazard Control</strong>: Manage time and Endurance; avoid traps and monsters.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </aside>

            {/* Center Column: Expedition Dossier */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #c5a059' }}>
                <div className="card-header">
                  <Target size={20} className="card-icon gold-glow" />
                  <h2>Active Bureau Dossier</h2>
                </div>

                <div className="card-body" style={{ overflowY: 'auto', gap: '1.5rem', padding: '1.5rem' }}>
                  <div className="mission-badge" style={{ alignSelf: 'flex-start' }}>{activeMission.targetCategoryTitle}</div>
                  <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', color: '#fff', margin: 0 }}>{activeMission.title}</h3>

                  <div className="mission-divider"></div>

                  <div className="mission-inquiry">
                    <span className="label" style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#8b6a48' }}>Working Theory</span>
                    <p className="value" style={{ margin: 0, fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.15rem', color: '#ebdcb9', lineHeight: 1.5 }}>
                      {activeMission.inquiryQuestion}
                    </p>
                  </div>

                  <div className="mission-instruction-box" style={{ background: 'rgba(26, 22, 17, 0.4)', padding: '1rem', border: '1px solid rgba(139, 106, 72, 0.15)', borderRadius: '6px' }}>
                    <span className="label" style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#8b6a48', display: 'block', marginBottom: '0.35rem' }}>Instructions</span>
                    <p className="value" style={{ margin: 0, fontFamily: 'Courier New, monospace', fontSize: '0.82rem', color: '#a89a7f', fontStyle: 'italic', lineHeight: 1.45 }}>
                      {activeMission.instruction}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: 'rgba(12, 10, 8, 0.3)', padding: '0.85rem', borderRadius: '6px', border: '1px solid rgba(139,106,72,0.1)' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#8b6a48', textTransform: 'uppercase', fontWeight: 800 }}>Required Target</span>
                      <strong style={{ display: 'block', fontSize: '1.25rem', color: '#ebdcb9', fontFamily: 'Cinzel, serif', marginTop: '0.2rem' }}>{missionRequiredCount} Finds</strong>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#8b6a48', textTransform: 'uppercase', fontWeight: 800 }}>Evidence Type</span>
                      <strong style={{ display: 'block', fontSize: '0.88rem', color: '#ebdcb9', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.3rem' }}>{activeMission.evidenceLabel || 'Structural'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Right Column: Asha Dossier / Teaser */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Backpack size={20} className="card-icon" />
                  <h2>Explorer Profile</h2>
                </div>

                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', border: '2px solid #c5a059', background: 'rgba(26,22,17,0.8)', display: 'grid', placeItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                    <span style={{ fontSize: '3rem' }}>ðŸ•µï¸â€â™€ï¸</span>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.25rem', color: '#fff', margin: '0 0 0.25rem' }}>Asha</h3>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#c5a059', letterSpacing: '0.08em' }}>Warrior Explorer</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#a89a7f', lineHeight: 1.45 }}>
                    Equipped for {explorerProfileFitLine}. Fits all collected tools and coordinates the expedition with absolute precision.
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            <button type="button" className="footer-btn secondary-btn" onClick={onBackToMenu}>
              <ChevronLeft size={16} /> Exit to Menu
            </button>
            <button type="button" className="footer-btn primary-btn pulse-glow" onClick={beginExpedition}>
              Begin Expedition <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </footer>
        </section>
      )}

      {expeditionFailure && (
        <section className="expedition-fullscreen-room expedition-failure-room" aria-label="Rescue Station">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={onBackToMenu}>
                <ChevronLeft size={16} /> Exit to Menu
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Field Rescue Station</div>
              <h1 className="fullscreen-title">Emergency Rescue</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: '#ef4444', color: '#f87171' }}>
                <AlertTriangle size={14} className="badge-icon pulse" />
                <span>EXPEDITION FAILED</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.5rem', padding: '1.5rem 2rem' }}>
            {/* Left Column: Operation Status Stamp */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #ef4444' }}>
                <div className="card-ribbon" style={{ background: '#ef4444', color: '#fff' }}>INCOMPLETE</div>
                <div className="card-header">
                  <ShieldAlert size={20} className="card-icon" style={{ color: '#ef4444' }} />
                  <h2>Mission Interrupted</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', margin: '1rem 0' }}>⚠️</div>
                  <strong style={{ color: '#f87171', fontSize: '1.1rem', fontFamily: 'Cinzel, serif' }}>Field Rescue Triggered</strong>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#a89a7f', lineHeight: 1.5 }}>
                    Your expedition was halted due to excessive hazards. The Bureau dispatch team has retrieved you safely from the sector.
                  </p>
                </div>
              </div>
            </aside>

            {/* Center Column: Warning Details and Tips */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #ef4444' }}>
                <div className="card-header">
                  <AlertTriangle size={20} className="card-icon" style={{ color: '#f59e0b' }} />
                  <h2>Rescue Details</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.5rem', padding: '1.5rem' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#f87171', display: 'block', marginBottom: '0.5rem' }}>Reason for Failure</span>
                    <p style={{ margin: 0, fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.1rem', color: '#ebdcb9', lineHeight: 1.5 }}>
                      {expeditionFailure.message}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#c5a059', display: 'block', marginBottom: '0.5rem' }}>Survival Guidance</span>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#a89a7f', lineHeight: 1.5 }}>
                      Hazards, traps, and monsters can end the expedition if your investigation points, stamina, or time run out. Plan a safer route through the site, equip protective gear from the camp shop, and take your time when surveying and mapping grid cells.
                    </p>
                  </div>
                </div>
              </div>
            </main>

            {/* Right Column: Explorer Dossier & Fit-kit guidance */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Backpack size={20} className="card-icon" />
                  <h2>Field Fit-Kit Guide</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1rem', padding: '1rem', fontSize: '0.82rem' }}>
                  <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.45 }}>
                    Ensure you purchase proper tools from the Base Camp next time:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <strong style={{ color: '#ebdcb9' }}>🛠️ Brush & Trowel</strong>
                    <p style={{ margin: 0, color: '#a89a7f', paddingLeft: '1rem' }}>Improves excavation safety and guarantees higher-quality evidence.</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <strong style={{ color: '#ebdcb9' }}>📖 Explorer Field Guide</strong>
                    <p style={{ margin: 0, color: '#a89a7f', paddingLeft: '1rem' }}>Provides valuable classification hints when identifying artefacts.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            <button type="button" className="footer-btn secondary-btn" onClick={onBackToMenu}>
              <ChevronLeft size={16} /> Exit to Menu
            </button>
            <button type="button" className="footer-btn primary-btn pulse-glow" onClick={resetExpedition}>
              Restart Expedition <RotateCcw size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </footer>
        </section>
      )}

      {surveyReportZone && (
        <section className="expedition-fullscreen-room expedition-survey-room" aria-label="Survey Report">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={keepSurveying}>
                <ChevronLeft size={16} /> Return to Map
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Route Map</div>
              <h1 className="fullscreen-title">{surveyReportZone.name}</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <Compass size={14} className="badge-icon" />
                <span>Sector Surveyed</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.5rem', padding: '1.5rem 2rem' }}>
            {/* Left Column: Sector Mapping Notes */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #ebdcb9' }}>
                <div className="card-ribbon" style={{ background: '#ebdcb9', color: '#0b0a08' }}>SURVEY</div>
                <div className="card-header">
                  <Compass size={20} className="card-icon" />
                  <h2>Sector Analysis</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#ebdcb9', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{surveyReportZone.clue}"
                  </p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#a89a7f', lineHeight: 1.45 }}>
                    Archaeologists survey quadrants before digging to select areas most likely to answer their core historical inquiry.
                  </p>
                </div>
              </div>
            </aside>

            {/* Center Column: Survey Details */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #c5a059' }}>
                <div className="card-header">
                  <BookOpen size={20} className="card-icon gold-glow" />
                  <h2>Survey Details & Clues</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.5rem', padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, auto)', gap: '1rem' }}>
                    <div style={{ background: 'rgba(26, 22, 17, 0.4)', padding: '0.85rem', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px' }}>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#8b6a48', textTransform: 'uppercase', fontWeight: 800 }}>Likely Evidence Type</span>
                      <strong style={{ display: 'block', fontSize: '1.1rem', color: '#ebdcb9', fontFamily: 'Cinzel, serif', marginTop: '0.2rem' }}>
                        {surveyReportZone.likelyEvidence}
                      </strong>
                    </div>

                    <div style={{ background: 'rgba(26, 22, 17, 0.4)', padding: '0.85rem', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px' }}>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#8b6a48', textTransform: 'uppercase', fontWeight: 800 }}>Bureau Field Hint</span>
                      <strong style={{ display: 'block', fontSize: '0.88rem', color: '#ebdcb9', lineHeight: 1.4, marginTop: '0.2rem', fontWeight: 500 }}>
                        {surveyReportZone.missionHint}
                      </strong>
                    </div>

                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px' }}>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 800 }}>Hazard Level / Costs</span>
                      <strong style={{ display: 'block', fontSize: '0.88rem', color: '#f87171', marginTop: '0.2rem', fontWeight: 600 }}>
                        {surveyReportZone.risk}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Right Column: Mission Tracker */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Target size={20} className="card-icon" />
                  <h2>Active Inquiry</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1rem', padding: '1rem', fontSize: '0.82rem' }}>
                  <div className="mission-badge" style={{ alignSelf: 'flex-start' }}>{activeMission.targetCategoryTitle}</div>
                  <strong style={{ color: '#ebdcb9', fontFamily: 'Cinzel, serif', display: 'block', marginTop: '0.5rem' }}>{activeMission.title}</strong>
                  <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.4 }}>
                    {activeMission.inquiryQuestion}
                  </p>
                  <div style={{ borderTop: '1px solid rgba(139,106,72,0.15)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <small style={{ color: '#c5a059', display: 'block', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Mission Directive</small>
                    <small style={{ color: '#a89a7f', lineHeight: 1.3, display: 'block' }}>{activeMission.briefingRule}</small>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            <button type="button" className="footer-btn secondary-btn" onClick={keepSurveying}>
              Keep Surveying
            </button>
            <button type="button" className="footer-btn primary-btn pulse-glow" onClick={() => markSurveyZone(surveyReportZone)}>
              Mark as Dig Zone <Compass size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </footer>
        </section>
      )}

      {activeChallengeData && (
        <section className="expedition-fullscreen-room expedition-challenge-room" aria-label="Zone Challenge">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={closeZoneChallenge}>
                <ChevronLeft size={16} /> Return to Map
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Evidence Board</div>
              <h1 className="fullscreen-title">{activeChallengeData.title}</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <Gauge size={14} className="badge-icon" />
                <span>Zone Locked</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.5rem', padding: '1.5rem 2rem' }}>
            {/* Left Column: Crypt Profile */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #cda869' }}>
                <div className="card-ribbon" style={{ background: '#cda869', color: '#0b0a08' }}>CRYPT</div>
                <div className="card-header">
                  <ShieldAlert size={20} className="card-icon" />
                  <h2>Sector Seal</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a89a7f', lineHeight: 1.5 }}>
                    This sector is sealed behind an ancient cryptographic gate. You must decipher the historical query to unlock the survey reports for this quadrant.
                  </p>
                  <div style={{ background: 'rgba(26,22,17,0.4)', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px', padding: '0.85rem' }}>
                    <small style={{ color: '#c5a059', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', marginBottom: '0.25rem' }}>Active Sector</small>
                    <span style={{ fontSize: '0.9rem', color: '#ebdcb9', fontWeight: 700 }}>{surveyZoneById[activeChallengeData.zoneId]?.name || 'Ancient Quadrant'}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Center Column: Decipherment Challenge */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #c5a059' }}>
                <div className="card-header">
                  <Sparkles size={20} className="card-icon gold-glow" />
                  <h2>Decipher the Query</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.5rem', padding: '1.5rem' }}>
                  <div style={{ background: 'rgba(26, 22, 17, 0.4)', padding: '1.25rem', border: '1px solid rgba(139, 106, 72, 0.15)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#8b6a48', display: 'block', marginBottom: '0.5rem' }}>Working Theory</span>
                    <p style={{ margin: 0, fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.1rem', color: '#ebdcb9', lineHeight: 1.5 }}>
                      {activeChallengeData.question}
                    </p>
                  </div>

                  <div className="expedition-zone-answer-list" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                    {activeChallengeData.answers.map(answer => {
                      const selected = zoneChallengeFeedback?.answerId === answer.id;
                      const correct = selected && zoneChallengeFeedback.correct;
                      const incorrect = selected && !zoneChallengeFeedback.correct;
                      return (
                        <button
                          key={answer.id}
                          type="button"
                          className={`expedition-zone-answer ${selected ? 'is-selected' : ''} ${correct ? 'is-correct' : ''} ${incorrect ? 'is-incorrect' : ''}`}
                          onClick={() => answerZoneChallenge(answer.id)}
                          disabled={zoneChallengeFeedback?.correct}
                          style={{
                            padding: '1rem',
                            textAlign: 'left',
                            background: selected ? (correct ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)') : 'rgba(22, 18, 14, 0.6)',
                            border: `1px solid ${selected ? (correct ? '#10b981' : '#ef4444') : 'rgba(139, 106, 72, 0.2)'}`,
                            borderRadius: '6px',
                            color: selected ? (correct ? '#34d399' : '#f87171') : '#a89a7f',
                            cursor: zoneChallengeFeedback?.correct ? 'not-allowed' : 'pointer',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {answer.text}
                        </button>
                      );
                    })}
                  </div>

                  {zoneChallengeFeedback && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      background: zoneChallengeFeedback.correct ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      border: `1px solid ${zoneChallengeFeedback.correct ? '#10b981' : '#ef4444'}`,
                      borderRadius: '6px',
                      padding: '0.85rem'
                    }}>
                      <strong style={{ color: zoneChallengeFeedback.correct ? '#34d399' : '#f87171', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                        {zoneChallengeFeedback.correct ? '🔓 Crypt Deciphered' : '⚠️ Incorrect Decipherment'}
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: '#a89a7f' }}>{zoneChallengeFeedback.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* Right Column: Clue Reference Guide */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <BookOpen size={20} className="card-icon" />
                  <h2>Decipherment Clues</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1rem', padding: '1rem', fontSize: '0.82rem' }}>
                  <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.45 }}>
                    Read the question carefully. Connect the historical clues with your knowledge of {stageContent.targetCivilisation} civilisations before choosing your answer.
                  </p>
                  <div style={{ borderTop: '1px solid rgba(139,106,72,0.15)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <small style={{ color: '#c5a059', display: 'block', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Site Clue</small>
                    <small style={{ color: '#a89a7f', lineHeight: 1.3, display: 'block' }}>
                      {surveyZoneById[activeChallengeData.zoneId]?.clue || 'No additional clues registered.'}
                    </small>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            {zoneChallengeFeedback?.correct ? (
              <button
                type="button"
                className="footer-btn primary-btn pulse-glow"
                onClick={() => {
                  closeZoneChallenge();
                  if (surveyZoneById[activeChallengeData.zoneId]) {
                    openSurveyReport(surveyZoneById[activeChallengeData.zoneId], { skipChallenge: true });
                  }
                }}
              >
                Open Survey Report <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            ) : (
              <button type="button" className="footer-btn secondary-btn" onClick={closeZoneChallenge}>
                Return to Map
              </button>
            )}
          </footer>
        </section>
      )}

      {gridSetupOpen && selectedSurveyZone && (
        <section className="expedition-fullscreen-room expedition-grid-room" aria-label="Grid Setup Matrix">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={keepExploringGrid}>
                <ChevronLeft size={16} /> Return to Map
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Excavation Grid</div>
              <h1 className="fullscreen-title">{surveyZoneById[selectedSurveyZone]?.name}</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <Ruler size={14} className="badge-icon" />
                <span>Grid Setup Active</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.6fr 1.1fr', gap: '1.5rem', padding: '1.5rem 2rem' }}>
            {/* Left Column: Zone Details & Resource Details */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #c5a059' }}>
                <div className="card-ribbon" style={{ background: '#ebdcb9', color: '#0b0a08' }}>GRID</div>
                <div className="card-header">
                  <Ruler size={20} className="card-icon" />
                  <h2>Dig Site Info</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.15rem', padding: '1.15rem' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#a89a7f', lineHeight: 1.45 }}>
                    Archaeologists divide a dig site into grid squares to record exactly where evidence was found. This helps maintain spatial context and stratigraphic integrity.
                  </p>

                  <div style={{ background: 'rgba(26,22,17,0.4)', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px', padding: '0.85rem' }}>
                    <small style={{ color: '#c5a059', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', marginBottom: '0.25rem' }}>Selected Quadrant</small>
                    <span style={{ fontSize: '0.9rem', color: '#ebdcb9', fontWeight: 700 }}>{surveyZoneById[selectedSurveyZone]?.name}</span>
                  </div>

                  <div style={{ background: 'rgba(26,22,17,0.4)', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px', padding: '0.85rem' }}>
                    <small style={{ color: '#c5a059', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', marginBottom: '0.25rem' }}>Site Instructions</small>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#a89a7f', lineHeight: 1.35 }}>
                      Open one square at a time. Only evidence linked to opened squares will become visible.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Center Column: Interactive Grid Squares Matrix */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #c5a059' }}>
                <div className="card-header">
                  <MapIcon size={20} className="card-icon gold-glow" />
                  <h2>Grid Squares Matrix</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  <div className="expedition-grid-square-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {gridSquares.map(square => {
                      const isOpened = openedGridSquares.has(square.id);
                      const cost = GRID_COSTS[square.risk] || GRID_COSTS.Low;
                      return (
                        <article
                          key={square.id}
                          className={`expedition-grid-square ${isOpened ? 'is-opened' : ''}`}
                          style={{
                            background: isOpened ? 'rgba(197, 160, 89, 0.05)' : 'rgba(22, 18, 14, 0.6)',
                            border: `1px solid ${isOpened ? 'rgba(197, 160, 89, 0.4)' : 'rgba(139, 106, 72, 0.18)'}`,
                            borderRadius: '8px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            position: 'relative',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: '#ebdcb9', fontFamily: 'Cinzel, serif', fontSize: '1.1rem' }}>Square {square.id}</strong>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: square.risk === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: square.risk === 'High' ? '#f87171' : '#34d399',
                              border: `1px solid ${square.risk === 'High' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                            }}>
                              Risk: {square.risk}
                            </span>
                          </div>

                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#a89a7f', lineHeight: 1.35, flexGrow: 1 }}>{square.clue}</p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.5rem 0', borderTop: '1px solid rgba(139, 106, 72, 0.1)' }}>
                            <small style={{ color: '#c5a059', fontSize: '0.7rem', fontStyle: 'italic' }}>{square.possibleEvidenceHint}</small>
                            <small style={{ color: '#ebdcb9', fontSize: '0.68rem', fontWeight: 600 }}>
                              Cost: {cost.investigation} invest., {cost.time}s
                            </small>
                          </div>

                          <button
                            type="button"
                            className={`btn ${isOpened ? 'secondary-btn' : 'primary-btn'}`}
                            onClick={() => openGridSquare(square)}
                            style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem' }}
                          >
                            {isOpened ? 'Excavate Square Again' : 'Excavate Square'}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            </main>

            {/* Right Column: Satchel and Fitted Tools */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Backpack size={20} className="card-icon" />
                  <h2>Mission Objective</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1rem', padding: '1rem', fontSize: '0.82rem' }}>
                  <div className="mission-badge" style={{ alignSelf: 'flex-start' }}>{activeMission.targetCategoryTitle}</div>
                  <strong style={{ color: '#ebdcb9', fontFamily: 'Cinzel, serif', display: 'block', marginTop: '0.5rem' }}>{activeMission.title}</strong>
                  <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.45 }}>
                    {activeMission.instruction}
                  </p>

                  <div style={{ borderTop: '1px solid rgba(139,106,72,0.15)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <small style={{ color: '#ebdcb9', display: 'block', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem', marginBottom: '0.25rem' }}>Fitted Tools Ready</small>
                    <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.35 }}>
                      {fieldKitEffects.measuringTapeReady ? '📏 Measuring Tape equipped (location precision active)' : '❌ Measuring Tape missing'}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            <button type="button" className="footer-btn secondary-btn" onClick={() => setNotice(`${activeMission.title}: ${activeMission.instruction}`)}>
              Review Mission
            </button>
            <button type="button" className="footer-btn primary-btn pulse-glow" onClick={keepExploringGrid}>
              Keep Exploring <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </footer>
        </section>
      )}

      {inspectionToken && (
        <section className="expedition-fullscreen-room expedition-lab-room" aria-label="Evidence Workbench">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={closeInspection}>
                <ChevronLeft size={16} /> Return to Site
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Conservation Bench</div>
              <h1 className="fullscreen-title">{inspectionToken.name}</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <Gem size={14} className="badge-icon" />
                <span>Field Analysis Active</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.5rem', padding: '1.5rem 2rem' }}>
            {/* Left Column: Artifact Profile */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #ebdcb9' }}>
                <div className="card-ribbon" style={{ background: '#ebdcb9', color: '#0b0a08' }}>UNCLASSIFIED</div>
                <div className="card-header">
                  <Gem size={20} className="card-icon" />
                  <h2>Artifact Dossier</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a89a7f', lineHeight: 1.5 }}>
                    <strong>Clue context:</strong> "{inspectionToken.clue}"
                  </p>

                  <div style={{ background: 'rgba(26,22,17,0.4)', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px', padding: '0.85rem', fontSize: '0.8rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#ebdcb9', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>Field Sector</strong>
                      <span style={{ color: '#a89a7f' }}>{inspectionToken.zone}</span>
                    </div>
                    {inspectionToken.evidenceQuality && (
                      <div>
                        <strong style={{ color: '#ebdcb9', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>Excavated Quality</strong>
                        <span style={{ color: '#ebdcb9', fontWeight: 'bold' }}>{inspectionToken.evidenceQuality.toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  {fieldKitEffects.fieldGuideAvailable && !inspectionFeedback && (
                    <div style={{ background: 'rgba(197, 160, 89, 0.08)', border: '1px solid rgba(197, 160, 89, 0.25)', borderRadius: '6px', padding: '0.85rem', fontSize: '0.78rem' }}>
                      <strong style={{ color: '#ebdcb9', display: 'block', marginBottom: '0.2rem' }}>📖 Field Guide Hint</strong>
                      <span style={{ color: '#a89a7f', lineHeight: 1.4 }}>
                        Look at the material, shape, location and clue before deciding how to classify this evidence.
                      </span>
                    </div>
                  )}

                  {fieldKitEffects.notebookReady && !inspectionFeedback && (
                    <div style={{ background: 'rgba(197, 160, 89, 0.08)', border: '1px solid rgba(197, 160, 89, 0.25)', borderRadius: '6px', padding: '0.85rem', fontSize: '0.78rem' }}>
                      <strong style={{ color: '#ebdcb9', display: 'block', marginBottom: '0.2rem' }}>📓 Field Notebook Active</strong>
                      <span style={{ color: '#a89a7f', lineHeight: 1.4 }}>
                        Excavation method choices and rejected evidence are fully logged in your field notes.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Center Column: Lab Workbench Process Steps */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #c5a059' }}>
                <div className="card-header">
                  <Sparkles size={20} className="card-icon gold-glow" />
                  <h2>Analysis Workbench</h2>
                </div>

                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  {/* Step 1: Excavate */}
                  {!inspectionFeedback && inspectionStep === 'excavate' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <strong style={{ color: '#ebdcb9', fontSize: '1.05rem', fontFamily: 'Cinzel, serif' }}>Choose Excavation Method</strong>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#a89a7f', lineHeight: 1.4 }}>
                        Archaeologists select their excavation tools carefully depending on the fragility of the artifacts and surrounding strata.
                      </p>

                      <div className="expedition-excavation-method-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                        {EXCAVATION_METHODS.map(method => {
                          const costText = `${method.cost.investigation} investigation, ${method.cost.time} seconds`;
                          return (
                            <article
                              key={method.id}
                              className="expedition-excavation-method-card"
                              style={{
                                background: 'rgba(22, 18, 14, 0.6)',
                                border: '1px solid rgba(139, 106, 72, 0.2)',
                                borderRadius: '6px',
                                padding: '0.85rem',
                                display: 'grid',
                                gridTemplateColumns: '1fr 130px',
                                gap: '1rem',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <strong style={{ color: '#ebdcb9', display: 'block', fontSize: '0.9rem' }}>{method.name}</strong>
                                <span style={{ color: '#c5a059', display: 'block', fontSize: '0.72rem', fontStyle: 'italic', marginBottom: '0.25rem' }}>{method.bestFor}</span>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#a89a7f' }}>Cost: {costText}</p>
                              </div>
                              <button
                                type="button"
                                className="btn primary-btn"
                                onClick={() => chooseExcavationMethod(method.id)}
                                style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
                              >
                                Select Tool
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Map the Find */}
                  {!inspectionFeedback && inspectionStep === 'map' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <strong style={{ color: '#ebdcb9', fontSize: '1.05rem', fontFamily: 'Cinzel, serif' }}>Map & Record Coordinates</strong>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#a89a7f', lineHeight: 1.45 }}>
                        Precise provenance is essential. Categorise the find and associate it with the correct stratigraphic profile.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'rgba(26,22,17,0.4)', padding: '0.85rem', borderRadius: '6px', border: '1px solid rgba(139,106,72,0.1)' }}>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ display: 'block', fontSize: '0.62rem', color: '#8b6a48', textTransform: 'uppercase' }}>Zone</span>
                          <strong style={{ color: '#ebdcb9', fontSize: '0.78rem' }}>{getSurveyZoneName(selectedSurveyZone, surveyZoneById) || 'Unknown'}</strong>
                        </div>
                        <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(139,106,72,0.15)', borderRight: '1px solid rgba(139,106,72,0.15)' }}>
                          <span style={{ display: 'block', fontSize: '0.62rem', color: '#8b6a48', textTransform: 'uppercase' }}>Grid Square</span>
                          <strong style={{ color: '#ebdcb9', fontSize: '0.78rem' }}>{selectedGridSquare || 'Unknown'}</strong>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ display: 'block', fontSize: '0.62rem', color: '#8b6a48', textTransform: 'uppercase' }}>Classification</span>
                          <strong style={{ color: '#cda869', fontSize: '0.78rem' }}>
                            {selectedMappedEvidenceType ? getMapEvidenceTypeName(selectedMappedEvidenceType) : 'Pending'}
                          </strong>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        {MAP_EVIDENCE_TYPES.map(type => (
                          <button
                            key={type.id}
                            type="button"
                            className={`expedition-map-type-btn ${selectedMappedEvidenceType === type.id ? 'is-selected' : ''}`}
                            onClick={() => setSelectedMappedEvidenceType(type.id)}
                            style={{
                              padding: '0.65rem 0.85rem',
                              background: selectedMappedEvidenceType === type.id ? 'rgba(197, 160, 89, 0.15)' : 'rgba(22,18,14,0.6)',
                              border: `1px solid ${selectedMappedEvidenceType === type.id ? '#c5a059' : 'rgba(139,106,72,0.2)'}`,
                              borderRadius: '6px',
                              color: selectedMappedEvidenceType === type.id ? '#fff' : '#a89a7f',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              fontWeight: selectedMappedEvidenceType === type.id ? 'bold' : 'normal',
                              textAlign: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {type.name}
                          </button>
                        ))}
                      </div>

                      {mappingFeedback && (
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          background: mappingFeedback.accurate ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                          border: `1px solid ${mappingFeedback.accurate ? '#10b981' : '#ef4444'}`,
                          borderRadius: '6px',
                          padding: '0.75rem',
                          alignItems: 'center'
                        }}>
                          <CheckCircle2 size={16} style={{ color: mappingFeedback.accurate ? '#34d399' : '#f87171' }} />
                          <div style={{ fontSize: '0.78rem' }}>
                            <strong style={{ color: mappingFeedback.accurate ? '#34d399' : '#f87171', display: 'block' }}>
                              {mappingFeedback.accurate ? 'Mapping Verified' : 'Mapping Logged'}
                            </strong>
                            <p style={{ margin: 0, color: '#a89a7f' }}>{mappingFeedback.text}</p>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn primary-btn"
                        onClick={recordMappedFind}
                        disabled={!selectedMappedEvidenceType}
                        style={{ width: '100%', padding: '0.65rem' }}
                      >
                        Record Map
                      </button>
                    </div>
                  )}

                  {/* Mid-step helper text */}
                  {selectedExcavationMethod && !inspectionFeedback && inspectionStep !== 'excavate' && (
                    <div style={{ background: 'rgba(197, 160, 89, 0.06)', border: '1px solid rgba(197, 160, 89, 0.25)', borderRadius: '6px', padding: '0.75rem', fontSize: '0.78rem' }}>
                      <strong style={{ color: '#ebdcb9' }}>{selectedExcavationMethod.methodName} used</strong>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#a89a7f', lineHeight: 1.35 }}>
                        Quality: <strong style={{ color: '#c5a059' }}>{selectedExcavationMethod.quality}</strong>. {selectedExcavationMethod.feedback}
                        {selectedExcavationMethod.kitFeedback ? ` ${selectedExcavationMethod.kitFeedback}` : ''}
                      </p>
                    </div>
                  )}

                  {inspectionStep === 'review' && mappingFeedback && !inspectionFeedback && (
                    <div style={{
                      background: mappingFeedback.accurate ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                      border: `1px solid ${mappingFeedback.accurate ? '#10b981' : '#ef4444'}`,
                      borderRadius: '6px',
                      padding: '0.75rem',
                      fontSize: '0.78rem'
                    }}>
                      <strong>{mappingFeedback.accurate ? 'Mapping Accurate' : 'Stratigraphy Discrepancy'}</strong>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#a89a7f', lineHeight: 1.35 }}>{mappingFeedback.text}</p>
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {!inspectionFeedback && inspectionStep === 'review' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <strong style={{ color: '#ebdcb9', fontSize: '1.05rem', fontFamily: 'Cinzel, serif' }}>Verify & Secure Find</strong>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#a89a7f', lineHeight: 1.4 }}>
                        Evaluate if this artifact matches your active inquiry dossier. Secure relevant evidence, or discard weaker findings.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <button
                          type="button"
                          className="btn primary-btn"
                          onClick={() => inspectMissionChoice(true)}
                          style={{ padding: '0.85rem' }}
                        >
                          Secure as Mission Evidence
                        </button>
                        <button
                          type="button"
                          className="btn secondary-btn"
                          onClick={() => inspectMissionChoice(false)}
                          style={{ padding: '0.85rem' }}
                        >
                          Not Mission Evidence - Keep Searching
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Satchel Capacity Decision */}
                  {!inspectionFeedback && inspectionStep === 'capacity' && pendingEvidence && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <strong style={{ color: '#f87171', fontSize: '1.05rem', fontFamily: 'Cinzel, serif' }}>🎒 Satchel Overflow!</strong>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#a89a7f', lineHeight: 1.4 }}>
                        Your explorer satchel is full (3/3). You must choose to discard an existing piece of evidence or reject the new find.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Satchel contents list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#c5a059' }}>Current Satchel Items</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                            {satchelContents.map(item => (
                              <div key={item.id} style={{ background: 'rgba(26,22,17,0.5)', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '4px', padding: '0.5rem', fontSize: '0.72rem' }}>
                                <strong style={{ color: '#ebdcb9', display: 'block' }}>{item.name}</strong>
                                <span style={{ color: '#8b6a48' }}>{item.evidenceQuality || 'good'}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* New evidence profile */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#ef4444' }}>New Artifact</span>
                          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '4px', padding: '0.5rem', fontSize: '0.72rem' }}>
                            <strong style={{ color: '#ebdcb9', display: 'block' }}>{pendingEvidence.name}</strong>
                            <span style={{ color: '#f87171' }}>{pendingEvidence.evidenceQuality || 'good'}</span>
                            <small style={{ display: 'block', color: '#ebdcb9', marginTop: '0.25rem' }}>
                              {pendingEvidence.matchesMission ? '✅ Answers Inquiry' : '❌ Irrelevant'}
                            </small>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="button" className="btn primary-btn" onClick={() => setInspectionStep('replace')} style={{ padding: '0.55rem' }}>
                          Replace an Item
                        </button>
                        <button type="button" className="btn secondary-btn" onClick={() => rejectInspectedEvidence(inspectionToken)} style={{ padding: '0.55rem' }}>
                          Discard New Evidence
                        </button>
                        <button type="button" className="btn outline-btn" onClick={() => setInspectionStep('mission')} style={{ padding: '0.55rem' }}>
                          Review Dossier
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Mission Review from Satchel overflow */}
                  {!inspectionFeedback && inspectionStep === 'mission' && pendingEvidence && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <strong style={{ color: '#ebdcb9', fontSize: '1.05rem', fontFamily: 'Cinzel, serif' }}>Review Expedition Dossier</strong>
                      <div style={{ background: 'rgba(26,22,17,0.4)', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px', padding: '1rem', fontSize: '0.82rem' }}>
                        <strong style={{ color: '#ebdcb9', display: 'block' }}>{activeMission.title}</strong>
                        <p style={{ margin: '0.25rem 0 0.5rem 0', color: '#ebdcb9', fontStyle: 'italic' }}>Question: {activeMission.inquiryQuestion}</p>
                        <small style={{ color: '#a89a7f', display: 'block', lineHeight: 1.35 }}>Target Type: {activeMission.targetEvidenceType}</small>
                        <small style={{ color: '#a89a7f', display: 'block', lineHeight: 1.35 }}>Directive: {activeMission.briefingRule}</small>
                      </div>
                      <button type="button" className="btn" onClick={() => setInspectionStep('capacity')} style={{ padding: '0.55rem' }}>
                        Return to Decision
                      </button>
                    </div>
                  )}

                  {/* Step 6: Replacement Picker */}
                  {!inspectionFeedback && inspectionStep === 'replace' && pendingEvidence && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <strong style={{ color: '#ebdcb9', fontSize: '1.05rem', fontFamily: 'Cinzel, serif' }}>Select Satchel Item to Discard</strong>

                      <div className="expedition-replacement-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {satchelContents.map(item => (
                          <button
                            key={item.id}
                            type="button"
                            className="expedition-replacement-card"
                            onClick={() => finishInspection(inspectionToken, item.id)}
                            style={{
                              background: 'rgba(22, 18, 14, 0.6)',
                              border: '1px solid rgba(139, 106, 72, 0.25)',
                              borderRadius: '6px',
                              padding: '0.75rem',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div>
                              <strong style={{ color: '#ebdcb9', display: 'block' }}>{item.name}</strong>
                              <span style={{ color: '#a89a7f', fontSize: '0.72rem' }}>{item.category} | {item.evidenceQuality || 'good'}</span>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 'bold', textTransform: 'uppercase' }}>Discard ➔</span>
                          </button>
                        ))}
                      </div>

                      <button type="button" className="btn" onClick={() => setInspectionStep('capacity')} style={{ padding: '0.55rem' }}>
                        Back
                      </button>
                    </div>
                  )}

                  {/* Step 7: Feedback / Verification Stamp */}
                  {inspectionFeedback && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        background: inspectionFeedback.correct ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        border: `1px solid ${inspectionFeedback.correct ? '#10b981' : '#ef4444'}`,
                        borderRadius: '6px',
                        padding: '1.25rem',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {inspectionFeedback.correct ? <CheckCircle2 size={24} style={{ color: '#34d399' }} /> : <AlertTriangle size={24} style={{ color: '#f87171' }} />}
                        <div>
                          <strong style={{ color: inspectionFeedback.correct ? '#34d399' : '#f87171', fontSize: '1.05rem', display: 'block', fontFamily: 'Cinzel, serif' }}>
                            {inspectionFeedback.correct ? 'Evidence Verified' : 'Evidence Logged'}
                          </strong>
                          <p style={{ margin: '0.25rem 0 0 0', color: '#ebdcb9', fontSize: '0.85rem', lineHeight: 1.4 }}>{inspectionFeedback.text}</p>
                        </div>

                        {/* Stamp watermark */}
                        <div style={{
                          position: 'absolute',
                          right: '-10px',
                          bottom: '-15px',
                          opacity: 0.12,
                          transform: 'rotate(-15deg)',
                          fontFamily: 'Cinzel, serif',
                          fontSize: '3rem',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          color: inspectionFeedback.correct ? '#10b981' : '#ef4444',
                          pointerEvents: 'none'
                        }}>
                          {inspectionFeedback.stamp}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* Right Column: Satchel / Mission Reference */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Backpack size={20} className="card-icon" />
                  <h2>Mission Dossier</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1rem', padding: '1rem', fontSize: '0.82rem' }}>
                  <div className="mission-badge" style={{ alignSelf: 'flex-start' }}>{activeMission.targetCategoryTitle}</div>
                  <strong style={{ color: '#ebdcb9', fontFamily: 'Cinzel, serif', display: 'block', marginTop: '0.5rem' }}>{activeMission.title}</strong>
                  <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.4 }}>
                    {activeMission.inquiryQuestion}
                  </p>

                  <div style={{ background: 'rgba(26, 22, 17, 0.4)', padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(139,106,72,0.1)', marginTop: '0.5rem' }}>
                    <small style={{ color: '#ebdcb9', display: 'block', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Secured Finds</small>
                    <span style={{ fontSize: '1rem', color: '#c5a059', fontWeight: 'bold' }}>{missionEvidenceCount} / {missionRequiredCount}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            {(inspectionFeedback || inspectionStep === 'review') ? (
              <button type="button" className="footer-btn primary-btn pulse-glow" onClick={closeInspection}>
                {inspectionFeedback ? 'Continue Expedition' : 'Keep Looking'} <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            ) : (
              <button type="button" className="footer-btn secondary-btn" onClick={closeInspection}>
                Return to Site
              </button>
            )}
          </footer>
        </section>
      )}

      {claimOpen && (
        <section className="expedition-fullscreen-room expedition-claim-room" aria-label="Bureau Hypothesis Board">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button
                type="button"
                className="fullscreen-back-btn"
                onClick={() => {
                  playerRef.current = { x: 676, y: 304 };
                  lockedRef.current = false;
                  setClaimOpen(false);
                }}
              >
                <ChevronLeft size={16} /> Return to Site
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Discovery Log</div>
              <h1 className="fullscreen-title">Identify the Lost Site</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <ShieldAlert size={14} className="badge-icon" />
                <span>Verification Active</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content expedition-grid-layout">
            {/* Left Column: Bureau Directives */}
            <aside className="basecamp-column">
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #8b6a48' }}>
                <div className="card-ribbon" style={{ background: '#ef4444', color: '#fff' }}>CLASSIFIED</div>
                <div className="card-header">
                  <BookOpen size={20} className="card-icon" />
                  <h2>Claim Instructions</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a89a7f', lineHeight: 1.5 }}>
                    Formulate your final archaeological claim. You must specify the precise civilisation that established this site and provide your best piece of supporting context evidence from your satchel.
                  </p>
                  <div style={{ background: 'rgba(26,22,17,0.4)', padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(139,106,72,0.1)', fontSize: '0.78rem', color: '#a89a7f' }}>
                    <strong>Warning:</strong> Rushed or unsupported hypotheses will be rejected by the Bureau council.
                  </div>
                </div>
              </div>
            </aside>

            {/* Center Column: Hypothesis Board Selector Form */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #c5a059' }}>
                <div className="card-header">
                  <Target size={20} className="card-icon gold-glow" />
                  <h2>Hypothesis Board</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.5rem', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#c5a059', letterSpacing: '0.04em' }}>Civilisation</label>
                      <select
                        value={selectedCivilisation}
                        onChange={(event) => setSelectedCivilisation(event.target.value)}
                        className="expedition-dark-select"
                      >
                        <option value="">Choose a civilisation</option>
                        {claimCivilisations.map(civilisation => (
                          <option key={civilisation} value={civilisation}>{civilisation}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#c5a059', letterSpacing: '0.04em' }}>Supporting Evidence</label>
                      <select
                        value={selectedEvidenceId}
                        onChange={(event) => setSelectedEvidenceId(event.target.value)}
                        className="expedition-dark-select small"
                      >
                        <option value="">Choose collected evidence</option>
                        {collectedEvidence.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {claimResult && (
                    <div style={{
                      display: 'flex',
                      gap: '0.75rem',
                      background: claimResult.correct ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      border: `1px solid ${claimResult.correct ? '#10b981' : '#ef4444'}`,
                      borderRadius: '6px',
                      padding: '1rem',
                      alignItems: 'center',
                      marginTop: '0.5rem'
                    }}>
                      {claimResult.correct ? <CheckCircle2 size={22} style={{ color: '#34d399' }} /> : <AlertTriangle size={22} style={{ color: '#f87171' }} />}
                      <div>
                        <strong style={{ color: claimResult.correct ? '#34d399' : '#f87171', display: 'block', fontSize: '0.9rem' }}>
                          {claimResult.sentence}
                        </strong>
                        <p style={{ margin: '0.15rem 0 0 0', color: '#a89a7f', fontSize: '0.82rem', lineHeight: 1.4 }}>
                          {claimResult.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* Right Column: Satchel Overview */}
            <aside className="basecamp-column">
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Backpack size={20} className="card-icon" />
                  <h2>Active satchel</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '0.85rem', padding: '1rem', fontSize: '0.82rem' }}>
                  {collectedEvidence.length > 0 ? (
                    collectedEvidence.map(item => (
                      <div key={item.id} style={{ background: 'rgba(26, 22, 17, 0.5)', border: '1px solid rgba(139, 106, 72, 0.15)', borderRadius: '4px', padding: '0.55rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <strong style={{ color: '#ebdcb9' }}>{item.name}</strong>
                        <small style={{ color: '#8b6a48' }}>Quality: {item.evidenceQuality || 'good'}</small>
                        <span style={{ fontSize: '0.72rem', color: '#a89a7f', fontStyle: 'italic', display: 'block', marginTop: '0.2rem' }}>"{item.clue}"</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ margin: 0, color: '#a89a7f', fontStyle: 'italic' }}>No evidence collected yet.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            {claimResult?.correct ? (
              <button type="button" className="footer-btn primary-btn pulse-glow" onClick={resetExpedition}>
                Play Again <RotateCcw size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="footer-btn secondary-btn"
                  onClick={() => {
                    playerRef.current = { x: 676, y: 304 };
                    lockedRef.current = false;
                    setClaimOpen(false);
                  }}
                >
                  Return to Site
                </button>
                <button type="button" className="footer-btn primary-btn" onClick={submitClaim}>
                  Submit Claim <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
                </button>
              </>
            )}
          </footer>
        </section>
      )}

      {resultOpen && (
        <section className="expedition-fullscreen-room expedition-result-room" aria-label="Expedition Results">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={onBackToMenu}>
                <ChevronLeft size={16} /> Exit to Menu
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Discovery Log</div>
              <h1 className="fullscreen-title">Mission Report & Results</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <Sparkles size={14} className="badge-icon pulse" />
                <span>Expedition Completed</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content expedition-grid-layout">
            {/* Left Column: Summary and Score */}
            <aside className="basecamp-column">
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #c5a059' }}>
                <div className="card-ribbon" style={{ background: '#34d399' }}>Finished</div>
                <div className="card-header">
                  <Target size={20} className="card-icon" />
                  <h2>Final Assessment</h2>
                </div>
                <div className="card-body" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 1.5rem' }}>
                  <div className="expedition-score-badge" style={{ width: '130px', height: '130px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,160,89,0.15) 0%, rgba(0,0,0,0.5) 100%)', border: '3px solid #c5a059', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(197,160,89,0.25)', marginBottom: '1.5rem' }}>
                    <strong style={{ fontSize: '3rem', fontFamily: 'Cinzel, serif', color: '#fff', lineHeight: 1 }}>{finalScore}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#cda869', fontWeight: 600 }}>/ 100 PTS</span>
                  </div>

                  <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.6rem', color: '#ebdcb9', margin: '0 0 0.75rem' }}>{finalRank}</h3>
                  <p style={{ fontSize: '0.92rem', color: '#a89a7f', lineHeight: 1.5, margin: 0 }}>{resultFeedback}</p>
                </div>
              </div>
            </aside>

            {/* Middle Column: Detailed Stats */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Backpack size={20} className="card-icon" />
                  <h2>Field Performance Statistics</h2>
                </div>

                <div className="card-body" style={{ overflowY: 'auto', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      <div className="expedition-stat-box">
                        <span style={{ fontSize: '0.72rem', color: '#8b6a48', fontWeight: 800, textTransform: 'uppercase' }}>Remaining Time</span>
                        <strong style={{ display: 'block', fontSize: '1.5rem', color: '#ebdcb9', fontFamily: 'Cinzel, serif', marginTop: '0.25rem' }}>{resources.time}s</strong>
                      </div>
                      <div className="expedition-stat-box">
                        <span style={{ fontSize: '0.72rem', color: '#8b6a48', fontWeight: 800, textTransform: 'uppercase' }}>Endurance</span>
                        <strong style={{ display: 'block', fontSize: '1.5rem', color: '#ebdcb9', fontFamily: 'Cinzel, serif', marginTop: '0.25rem' }}>{resources.stamina}</strong>
                      </div>
                      <div className="expedition-stat-box">
                        <span style={{ fontSize: '0.72rem', color: '#8b6a48', fontWeight: 800, textTransform: 'uppercase' }}>Investigation</span>
                        <strong style={{ display: 'block', fontSize: '1.5rem', color: '#ebdcb9', fontFamily: 'Cinzel, serif', marginTop: '0.25rem' }}>{resources.investigation}</strong>
                      </div>
                    </div>

                  <section className="expedition-result-card expedition-card-dark">
                    <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.95rem', margin: '0 0 0.75rem', color: '#cda869', borderBottom: '1px solid rgba(139,106,72,0.15)', paddingBottom: '0.35rem' }}>Mission Review</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Active Objective:</span><strong style={{ color: '#fff' }}>{activeMission.title}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Mission Evidence:</span><strong style={{ color: '#34d399' }}>{missionComplete ? 'Secured' : 'Not secured'}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Target Collected:</span><strong style={{ color: '#fff' }}>{missionEvidenceCount} / {missionRequiredCount} {activeMission.targetCategoryTitle}</strong></div>
                    </div>
                  </section>

                  <section className="expedition-result-card expedition-card-dark">
                    <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.95rem', margin: '0 0 0.75rem', color: '#cda869', borderBottom: '1px solid rgba(139,106,72,0.15)', paddingBottom: '0.35rem' }}>Historical Hypothesis</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Target Civilisation:</span><strong style={{ color: '#fff' }}>{targetCivilisation}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Your Claim:</span><strong style={{ color: claimCorrect ? '#34d399' : '#f87171' }}>{selectedCivilisation || 'Not chosen'}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Claim Verdict:</span><strong style={{ color: claimCorrect ? '#34d399' : '#f87171' }}>{claimCorrect ? 'VERIFIED' : 'FAILED'}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Best Support Clue:</span><strong style={{ color: '#ebdcb9' }}>{selectedEvidence?.name || 'Not chosen'}</strong></div>
                    </div>
                    {claimResult && (
                      <div className={`expedition-claim-feedback ${claimResult.correct ? 'correct' : 'incorrect'}`} style={{ marginTop: '0.85rem', padding: '0.75rem', borderRadius: '4px', border: '1px solid', borderColor: claimResult.correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)', background: claimResult.correct ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', color: claimResult.correct ? '#34d399' : '#f87171' }}>
                        <div style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>
                          <strong style={{ display: 'block', textTransform: 'uppercase', marginBottom: '0.15rem' }}>{claimResult.sentence}</strong>
                          <p style={{ margin: 0 }}>{claimResult.feedback}</p>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="expedition-result-card expedition-card-dark">
                    <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.95rem', margin: '0 0 0.75rem', color: '#cda869', borderBottom: '1px solid rgba(139,106,72,0.15)', paddingBottom: '0.35rem' }}>Evidence Catalog & Quality</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ background: 'rgba(22, 18, 14, 0.4)', borderRadius: '4px', padding: '0.5rem', textAlign: 'center', fontSize: '0.8rem' }}>Excellent: <strong style={{ color: '#34d399' }}>{evidenceQualitySummary.excellent}</strong></div>
                      <div style={{ background: 'rgba(22, 18, 14, 0.4)', borderRadius: '4px', padding: '0.5rem', textAlign: 'center', fontSize: '0.8rem' }}>Good: <strong style={{ color: '#ebdcb9' }}>{evidenceQualitySummary.good}</strong></div>
                      <div style={{ background: 'rgba(22, 18, 14, 0.4)', borderRadius: '4px', padding: '0.5rem', textAlign: 'center', fontSize: '0.8rem' }}>Damaged: <strong style={{ color: '#f87171' }}>{evidenceQualitySummary.damaged}</strong></div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#a89a7f', fontStyle: 'italic', lineHeight: 1.4 }}>
                      {evidenceQualitySummary.damaged > 0
                        ? 'âš ï¸ Some evidence was damaged by rushed excavation. It can still support a claim, but careful excavation is more reliable.'
                        : 'âœ… Perfect, careful excavation improved the reliability and score weight of your evidence.'}
                    </p>
                  </section>
                </div>
              </div>
            </main>

            {/* Right Column: Kit and Catalog */}
            <aside className="basecamp-column">
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Gem size={20} className="card-icon" />
                  <h2>Dossier Details</h2>
                </div>

                <div className="card-body" style={{ overflowY: 'auto', gap: '1rem', padding: '1rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <strong style={{ color: '#ebdcb9', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04rem' }}>Fitted Tools</strong>
                    <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.4 }}>
                      {collectedTools.length > 0 ? collectedTools.map(tool => tool.name).join(', ') : 'None'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <strong style={{ color: '#f87171', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04rem' }}>Missing Tools</strong>
                    <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.4 }}>
                      {missingTools.length > 0 ? missingTools.map(tool => tool.name).join(', ') : 'None'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <strong style={{ color: '#ebdcb9', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04rem' }}>Evidence Satchel</strong>
                    <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.4 }}>
                      {collectedEvidence.length > 0 ? collectedEvidence.map(item => `${item.name} (${item.evidenceQuality || 'good'})`).join(', ') : 'Empty'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <strong style={{ color: '#ebdcb9', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04rem' }}>Field Journal Notes</strong>
                    <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.4 }}>
                      {fieldNotes.length > 0 ? fieldNotes.map(note => note.name).join(', ') : 'None recorded'}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            <button type="button" className="footer-btn secondary-btn" onClick={onBackToMenu}>
              <ChevronLeft size={16} /> Exit to Menu
            </button>
            {onSendToLab && claimCorrect ? (
              <button
                type="button"
                className="footer-btn primary-btn pulse-glow"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                  border: '1px solid #34d399',
                }}
                onClick={() => onSendToLab(collectedEvidence, fieldNotes, stageContent.id)}
              >
                Send to Lab & Build Report <Sparkles size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            ) : (
              <button type="button" className="footer-btn primary-btn pulse-glow" onClick={resetExpedition}>
                Play Again <RotateCcw size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            )}
          </footer>
        </section>
      )}
    </section>
  );
}
