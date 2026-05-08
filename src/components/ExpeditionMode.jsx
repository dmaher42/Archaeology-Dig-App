import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Backpack,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Gauge,
  Map as MapIcon,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { SCENARIOS } from '../data';
import { BUREAU_CASES, getCategoryTitle } from '../utils/gameLogic';
import ExpeditionJourney from './ExpeditionJourney';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 560;
const PLAYER_SIZE = 22;
const TARGET_CIVILISATION = 'Ancient Egypt';

const ZONES = [
  { id: 'riverbank', name: 'Riverbank', emoji: '🌊', x: 0, y: 0, w: 260, h: 220, color: 'rgba(56, 189, 248, 0.18)' },
  { id: 'burial', name: 'Burial Area', emoji: '🏺', x: 260, y: 0, w: 260, h: 220, color: 'rgba(160, 120, 90, 0.2)' },
  { id: 'archive', name: 'Archive Corner', emoji: '📜', x: 520, y: 0, w: 280, h: 220, color: 'rgba(232, 158, 93, 0.16)' },
  { id: 'market', name: 'Market Area', emoji: '⛺', x: 0, y: 220, w: 320, h: 190, color: 'rgba(245, 158, 11, 0.14)' },
  { id: 'wall', name: 'Ruined Wall', emoji: '🏛️', x: 320, y: 220, w: 260, h: 190, color: 'rgba(148, 163, 184, 0.18)' },
  { id: 'gate', name: 'Exit Gate', emoji: '🔒', x: 580, y: 220, w: 220, h: 340, color: 'rgba(74, 222, 128, 0.12)' },
];

const WALLS = [
  { x: 322, y: 238, w: 178, h: 34, label: 'low ruined wall' },
  { x: 98, y: 366, w: 210, h: 28, label: 'broken market stall' },
  { x: 602, y: 360, w: 118, h: 28, label: 'fallen archive shelf' },
  { x: 618, y: 120, w: 32, h: 98, label: 'scorpion path obstacle' },
];

const HAZARDS = [
  {
    id: 'sandstorm',
    name: 'sandstorm',
    emoji: '🌪️',
    x: 84,
    y: 96,
    w: 120,
    h: 70,
    color: 'rgba(232, 158, 93, 0.35)',
    penalty: { time: -15 },
    message: 'Sandstorm: time drops by 15 seconds.',
  },
  {
    id: 'falling-rocks',
    name: 'falling rocks',
    emoji: '🪨',
    x: 388,
    y: 292,
    w: 110,
    h: 78,
    color: 'rgba(148, 163, 184, 0.32)',
    penalty: { investigation: -8 },
    message: 'Falling rocks: investigation points drop by 8.',
  },
  {
    id: 'unstable-floor',
    name: 'unstable floor',
    emoji: '⚠️',
    x: 196,
    y: 454,
    w: 118,
    h: 70,
    color: 'rgba(239, 68, 68, 0.25)',
    penalty: { stamina: -18 },
    message: 'Unstable floor: stamina drops by 18.',
  },
];

const EXCAVATION_GUARDIANS = [
  {
    id: 'tomb-guardian-shadow',
    name: 'Tomb Guardian Shadow',
    emoji: '👤',
    x: 620,
    y: 420,
    w: 30,
    h: 30,
    path: [
      { x: 620, y: 420 },
      { x: 708, y: 420 },
      { x: 708, y: 286 },
      { x: 620, y: 286 },
    ],
    speed: 54,
    penalty: { investigation: -6, time: -8 },
    message: 'Tomb Guardian Shadow disrupted your survey. Investigation points and time reduced.',
  },
];

const CLAIM_OPTIONS = ['Ancient Egypt', 'Ancient Greece', 'Ancient Rome', 'Ancient China', 'Maya', 'Inca'];
const INITIAL_RESOURCES = { investigation: 95, stamina: 100, time: 600 };
const INVESTIGATION_BONUS = 5;
const BRUSH_RECOVERY_BONUS = 3;
const TROWEL_EXCAVATION_BONUS = 2;
const CAMERA_DOCUMENTATION_BONUS = 1;
const MAX_EVIDENCE_ITEMS = 3;
const JOURNEY_TOOLS = ExpeditionJourney.tools;
const TOOL_EFFECTS = {
  brush: {
    short: 'Careful recovery',
    collected: 'Helps recover fragile evidence carefully. Adds a careful recovery bonus when mission evidence is secured.',
    missing: 'Fragile evidence is harder to recover carefully.',
    result: 'Brush used: careful recovery bonus added.',
  },
  trowel: {
    short: 'Excavation bonus',
    collected: 'Helps excavate features and buried objects. Adds a bonus for structures or object evidence.',
    missing: 'Features and buried objects are harder to excavate cleanly.',
    result: 'Trowel used: excavation bonus added for structures or object evidence.',
  },
  notebook: {
    short: 'Field notes',
    collected: 'Records field notes when evidence is rejected or inspected. Adds field notes to the final result.',
    missing: 'Fewer field notes are recorded for later checking.',
    result: 'Notebook used: field notes recorded for inspected or rejected evidence.',
  },
  camera: {
    short: 'Documented in situ',
    collected: 'Documents evidence in place before collection. Adds a small evidence quality bonus.',
    missing: 'Evidence is less clearly documented before it is moved.',
    result: 'Camera used: evidence documented before collection.',
  },
  'measuring-tape': {
    short: 'Site mapping',
    collected: 'Helps map and record where evidence was found. Adds a mapping bonus in the result.',
    missing: 'Site mapping is less accurate.',
    result: 'Measuring Tape: site mapping completed.',
  },
  'field-guide-page': {
    short: 'Category hints',
    collected: 'Gives evidence category hints during inspection.',
    missing: 'No category hints are available during inspection.',
    result: 'Field Guide used: evidence category hints were available.',
  },
};
const FIELD_GUIDE_HINTS = {
  structures: 'Field Guide Hint: Features and structures are things people built or changed, like walls, roads, buildings or tombs.',
  written: 'Field Guide Hint: Written sources often contain symbols, records, laws, names or stories.',
  environmental: 'Field Guide Hint: Environmental evidence can show rivers, farming, climate, soil, plants or natural resources.',
  objects: 'Field Guide Hint: Artefacts and objects are things people made, used, traded or valued.',
};
const RANK_BANDS = [
  { min: 90, title: 'Lead Archaeologist' },
  { min: 75, title: 'Field Investigator' },
  { min: 60, title: 'Evidence Apprentice' },
  { min: 40, title: 'Trainee Excavator' },
  { min: 0, title: 'Needs More Training' },
];
const EVIDENCE_HUNT_MISSIONS = [
  {
    id: 'structures',
    title: 'Find Structural Evidence',
    instruction: 'The Bureau needs evidence of buildings or structures. Search the site and secure evidence that shows people built or changed this place.',
    targetCategoryId: 'structures',
    targetCategoryTitle: 'Features / Structures',
    evidenceLabel: 'Structural evidence',
    gateRequirement: 'The Exit Gate needs 1 piece of structural evidence.',
    keepSearchingNotice: 'Keep searching for evidence of buildings or structures.',
    matchFeedback: 'Correct. This structural evidence matches the current Bureau mission because it helps show what people built or changed at the site.',
    mismatchFeedback: 'Useful evidence, but it does not match the current Bureau mission because it does not show buildings or structures.',
    briefingRule: 'Find structural evidence to unlock the Exit Gate.',
  },
  {
    id: 'written',
    title: 'Find Written Evidence',
    instruction: 'The Bureau needs written evidence. Search the site and secure evidence that shows people recorded information, beliefs, laws or stories.',
    targetCategoryId: 'written',
    targetCategoryTitle: 'Written Sources',
    evidenceLabel: 'Written evidence',
    gateRequirement: 'The Exit Gate needs 1 piece of written evidence.',
    keepSearchingNotice: 'Keep searching for written evidence.',
    matchFeedback: 'Correct. This written evidence matches the current Bureau mission because it can show recorded information, beliefs, laws or stories.',
    mismatchFeedback: 'Useful evidence, but it does not match the current Bureau mission because it is not a written source.',
    briefingRule: 'Find written evidence to unlock the Exit Gate.',
  },
  {
    id: 'environmental',
    title: 'Find Environmental Evidence',
    instruction: 'The Bureau needs environmental evidence. Search the site and secure evidence that shows how geography, rivers, farming or natural resources shaped this civilisation.',
    targetCategoryId: 'environmental',
    targetCategoryTitle: 'Environmental Evidence',
    evidenceLabel: 'Environmental evidence',
    gateRequirement: 'The Exit Gate needs 1 piece of environmental evidence.',
    keepSearchingNotice: 'Keep searching for environmental evidence.',
    matchFeedback: 'Correct. This environmental evidence matches the current Bureau mission because it helps explain how geography, rivers, farming or natural resources shaped this civilisation.',
    mismatchFeedback: 'Useful evidence, but it does not match the current Bureau mission because it is not environmental evidence.',
    briefingRule: 'Find environmental evidence to unlock the Exit Gate.',
  },
  {
    id: 'objects',
    title: 'Find Object Evidence',
    instruction: 'The Bureau needs artefact evidence. Search the site and secure evidence that shows what people made, used, traded or valued.',
    targetCategoryId: 'objects',
    targetCategoryTitle: 'Artefacts / Objects',
    evidenceLabel: 'Object evidence',
    gateRequirement: 'The Exit Gate needs 1 artefact or object as evidence.',
    keepSearchingNotice: 'Keep searching for object evidence.',
    matchFeedback: 'Correct. This object evidence matches the current Bureau mission because it shows what people made, used, traded or valued.',
    mismatchFeedback: 'Useful evidence, but it does not match the current Bureau mission because it is not an artefact or object.',
    briefingRule: 'Find object evidence to unlock the Exit Gate.',
  },
];

const normaliseEvidenceTypeForMission = (type) => (
  type === 'environment' ? 'environmental' : type
);

const evidenceMatchesMission = (token, mission) => (
  normaliseEvidenceTypeForMission(token?.type) === mission?.targetCategoryId
);

const getRankTitle = (score) => RANK_BANDS.find(rank => score >= rank.min)?.title || RANK_BANDS[RANK_BANDS.length - 1].title;

const getRankFeedback = (score) => {
  if (score >= 90) {
    return 'Excellent fieldwork. You used evidence carefully and made a strong historical claim.';
  }
  if (score >= 60) {
    return 'Good work. You found useful evidence, but your claim or field preparation could be stronger.';
  }
  return 'You need more training. Review the mission, collect useful tools, and choose evidence that supports your claim.';
};

const chooseEvidenceHuntMission = (previousMissionId = null) => {
  const choices = EVIDENCE_HUNT_MISSIONS.filter(mission => mission.id !== previousMissionId);
  const pool = choices.length > 0 ? choices : EVIDENCE_HUNT_MISSIONS;
  return pool[Math.floor(Math.random() * pool.length)];
};

const buildExcavationGuardians = () => EXCAVATION_GUARDIANS.map(guardian => ({
  ...guardian,
  targetIndex: 1,
}));

const rectsOverlap = (a, b) => (
  a.x < b.x + b.w &&
  a.x + a.w > b.x &&
  a.y < b.y + b.h &&
  a.y + a.h > b.y
);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getPlayerRect = (player) => ({
  x: player.x,
  y: player.y,
  w: PLAYER_SIZE,
  h: PLAYER_SIZE,
});

const getZoneName = (player) => {
  const centre = { x: player.x + PLAYER_SIZE / 2, y: player.y + PLAYER_SIZE / 2 };
  return ZONES.find(zone => (
    centre.x >= zone.x && centre.x <= zone.x + zone.w &&
    centre.y >= zone.y && centre.y <= zone.y + zone.h
  ))?.name || 'Open Trench';
};

const buildExpeditionEvidence = () => {
  const egypt = SCENARIOS.find(scenario => scenario.civilization === TARGET_CIVILISATION);
  const byId = new Map((egypt?.evidence || []).map(item => [item.id, item]));
  const picks = [
    { id: 'eg_13', x: 690, y: 94, zone: 'Archive Corner', clueGroup: 'Legacy' },
    { id: 'eg_1', x: 398, y: 112, zone: 'Burial Area', clueGroup: 'Legacy' },
    { id: 'eg_11', x: 128, y: 142, zone: 'Riverbank', clueGroup: 'Geography' },
    { id: 'eg_8', x: 350, y: 214, zone: 'Ruined Wall', clueGroup: 'Society' },
    { id: 'eg_10', x: 140, y: 330, zone: 'Market Area', clueGroup: 'Society' },
  ];

  return picks.map((pick, index) => {
    const source = byId.get(pick.id);
    return {
      ...pick,
      key: pick.id,
      name: source?.name || `Evidence ${index + 1}`,
      type: source?.type || 'objects',
      category: getCategoryTitle(source?.type),
      clue: source?.clue || 'A clue from the site.',
      rationale: source?.rationale || 'This evidence helps explain the site.',
      supports: TARGET_CIVILISATION,
      collected: false,
    };
  });
};

export function ExpeditionMode({ onBackToMenu, audioControls = {} }) {
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
  const dismissedTokenRef = useRef(null);
  const [collectedEvidence, setCollectedEvidence] = useState([]);
  const [fieldNotes, setFieldNotes] = useState([]);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [currentZone, setCurrentZone] = useState('Market Area');
  const [activeMission, setActiveMission] = useState(() => chooseEvidenceHuntMission());
  const [notice, setNotice] = useState('Complete the Bureau evidence hunt to unlock the Exit Gate.');
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [nearbyToken, setNearbyToken] = useState(null);
  const [inspectionToken, setInspectionToken] = useState(null);
  const [inspectionStep, setInspectionStep] = useState('review');
  const [inspectionFeedback, setInspectionFeedback] = useState(null);
  const [missionEvidenceCount, setMissionEvidenceCount] = useState(0);
  const [claimOpen, setClaimOpen] = useState(false);
  const [selectedCivilisation, setSelectedCivilisation] = useState('');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [claimResult, setClaimResult] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [expeditionStage, setExpeditionStage] = useState('journey');
  const [baseCampOpen, setBaseCampOpen] = useState(false);
  const [fieldKit, setFieldKit] = useState([]);
  const [journeyRunId, setJourneyRunId] = useState(0);

  const trainingCivilisations = useMemo(() => (
    BUREAU_CASES
      .filter(item => item.round === 'training')
      .map(item => item.civilisation)
      .filter(civilisation => CLAIM_OPTIONS.includes(civilisation))
  ), []);

  const exitUnlocked = missionEvidenceCount >= 1;
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
  const missingTools = useMemo(() => (
    JOURNEY_TOOLS.filter(tool => !fieldKitSet.has(tool.id))
  ), [fieldKitSet]);
  const collectedTools = useMemo(() => (
    JOURNEY_TOOLS.filter(tool => fieldKitSet.has(tool.id))
  ), [fieldKitSet]);
  const fieldKitImpact = useMemo(() => (
    JOURNEY_TOOLS.map((tool) => ({
      id: tool.id,
      name: tool.name,
      collected: fieldKitSet.has(tool.id),
      effect: TOOL_EFFECTS[tool.id]?.short || 'Field tool',
      detail: fieldKitSet.has(tool.id)
        ? TOOL_EFFECTS[tool.id]?.result
        : TOOL_EFFECTS[tool.id]?.missing,
      baseCampCollected: TOOL_EFFECTS[tool.id]?.collected,
      baseCampMissing: TOOL_EFFECTS[tool.id]?.missing,
    }))
  ), [fieldKitSet]);
  const fieldKitBonus = useMemo(() => {
    if (!claimResult) return 0;
    const bonus =
      (fieldKitEffects.fieldGuideAvailable ? 2 : 0) +
      (fieldKitEffects.notebookReady && fieldNotes.length > 0 ? 2 : 0) +
      (fieldKitEffects.cameraReady && collectedEvidence.length > 0 ? 2 : 0) +
      (fieldKitEffects.measuringTapeReady ? 2 : 0) +
      (fieldKitEffects.trowelReady && collectedEvidence.some(item => ['structures', 'objects'].includes(normaliseEvidenceTypeForMission(item.type))) ? 2 : 0) +
      (fieldKitEffects.brushReady && collectedEvidence.some(item => item.isMissionEvidence) ? 2 : 0);
    return Math.min(10, bonus);
  }, [claimResult, collectedEvidence, fieldKitEffects, fieldNotes.length]);
  const claimCorrect = claimResult ? selectedCivilisation === TARGET_CIVILISATION : false;
  const evidenceSupportsClaim = claimResult ? selectedEvidence?.supports === TARGET_CIVILISATION : false;
  const missionComplete = missionEvidenceCount >= 1;
  const finalScore = useMemo(() => {
    if (!claimResult) return null;
    const toolsScore = Math.round((fieldKit.length / JOURNEY_TOOLS.length) * 15);
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
      fieldKitBonus,
      0,
      100
    );
  }, [claimCorrect, claimResult, evidenceSupportsClaim, fieldKit.length, fieldKitBonus, missionComplete, resources]);
  const finalRank = finalScore === null ? null : getRankTitle(finalScore);
  const resultFeedback = finalScore === null ? '' : getRankFeedback(finalScore);
  const syncInventory = useCallback((items) => {
    const nextItems = [...items];
    collectedRef.current = nextItems;
    setCollectedEvidence(nextItems);
    setMissionEvidenceCount(nextItems.filter(item => item.isMissionEvidence).length);
  }, []);

  const syncResources = useCallback((patch) => {
    resourcesRef.current = {
      investigation: clamp(resourcesRef.current.investigation + (patch.investigation || 0), 0, 100),
      stamina: clamp(resourcesRef.current.stamina + (patch.stamina || 0), 0, 100),
      time: clamp(resourcesRef.current.time + (patch.time || 0), 0, 600),
    };
    setResources({ ...resourcesRef.current });
  }, []);

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

  const openInspection = useCallback((token = nearbyTokenRef.current) => {
    if (briefingOpen || !token || token.collected || lockedRef.current) return;
    setInspectionToken(token);
    setInspectionStep('review');
    setInspectionFeedback(null);
    setNotice(`Inspecting ${token.name}. Decide whether it matches your mission.`);
  }, [briefingOpen]);

  const beginExpedition = () => {
    keysRef.current = {};
    tickAccumulatorRef.current = 0;
    setBriefingOpen(false);
    setNotice(activeMission.instruction);
  };

  const handleJourneySnapshot = useCallback((snapshot) => {
    journeySnapshotRef.current = snapshot;
  }, []);

  const handleJourneyComplete = useCallback((nextFieldKit) => {
    setFieldKit(nextFieldKit);
    setBaseCampOpen(true);
    setNotice('Base Camp reached. Check your field kit before excavation.');
  }, []);

  const beginExcavationStage = () => {
    keysRef.current = {};
    tickAccumulatorRef.current = 0;
    setExpeditionStage('excavation');
    setBaseCampOpen(false);
    setBriefingOpen(true);
    setNotice(activeMission.instruction);
  };

  const closeInspection = () => {
    setInspectionToken(null);
    setInspectionStep('review');
    setInspectionFeedback(null);
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
      setNotice('Your evidence satchel is full. Replace an item or leave this evidence here.');
      return;
    }

    dismissedTokenRef.current = null;
    token.collected = true;
    token.isMissionEvidence = isMissionEvidence;
    nextInventory.push(token);
    syncInventory(nextInventory);
    nearbyTokenRef.current = null;
    setNearbyToken(null);

    if (isMissionEvidence) {
      const trowelBonus = fieldKitEffects.trowelReady && ['structures', 'objects'].includes(normaliseEvidenceTypeForMission(token.type))
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
        text: `${activeMission.matchFeedback}${toolFeedback ? ` ${toolFeedback}` : ''}`,
      });
      setNotice(`${token.name} added to your evidence satchel. +${investigationBonus} investigation points.`);
      audioControls.playMatch?.();
    } else {
      const trowelBonus = fieldKitEffects.trowelReady && ['structures', 'objects'].includes(normaliseEvidenceTypeForMission(token.type))
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
        text: `${activeMission.mismatchFeedback}${toolFeedback ? ` ${toolFeedback}` : ''}`,
      });
      setNotice(`${token.name} added to your evidence satchel.`);
      audioControls.playError?.();
    }
    if (fieldKitEffects.notebookReady) {
      recordFieldNote(token, 'inspected');
    }
    setInspectionStep('review');
  };

  const inspectMissionChoice = (matchesMission) => {
    if (!inspectionToken || inspectionToken.collected) return;

    if (!matchesMission) {
      rejectInspectedEvidence(inspectionToken);
      return;
    }

    if (collectedRef.current.length >= MAX_EVIDENCE_ITEMS) {
      setInspectionStep('capacity');
      setNotice('Your evidence satchel is full. Replace an item or leave this evidence here.');
      return;
    }

    finishInspection(inspectionToken);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    const now = Date.now();

    // 1. Better Background (Subtle radial gradient)
    const bgGradient = ctx.createRadialGradient(MAP_WIDTH/2, MAP_HEIGHT/2, MAP_WIDTH/4, MAP_WIDTH/2, MAP_HEIGHT/2, MAP_WIDTH);
    bgGradient.addColorStop(0, '#ebdaba');
    bgGradient.addColorStop(1, '#d4c09d');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // 2. Map Grid (Softer)
    ctx.strokeStyle = 'rgba(100, 75, 50, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= MAP_WIDTH; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, MAP_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y <= MAP_HEIGHT; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(MAP_WIDTH, y); ctx.stroke();
    }

    // 3. Map Zones with transparent labels
    ZONES.forEach((zone) => {
      ctx.fillStyle = zone.color;
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      ctx.strokeStyle = 'rgba(74, 54, 32, 0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
      
      // Draw watermark emoji
      ctx.fillStyle = 'rgba(74, 54, 32, 0.12)';
      ctx.font = '72px Outfit, sans-serif';
      ctx.fillText(zone.emoji, zone.x + zone.w / 2 - 36, zone.y + zone.h / 2 + 25);

      // Label background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      const labelText = `${zone.emoji} ${zone.name}`;
      ctx.font = '700 13px Outfit, sans-serif';
      const textWidth = ctx.measureText(labelText).width;
      ctx.fillRect(zone.x + 8, zone.y + 8, textWidth + 12, 24);

      ctx.fillStyle = '#3a2a18';
      ctx.fillText(labelText, zone.x + 14, zone.y + 24);
    });

    // 4. Hazards (Pulsing borders)
    const pulse = (Math.sin(now / 300) + 1) / 2; // 0 to 1
    HAZARDS.forEach((hazard) => {
      ctx.fillStyle = hazard.color;
      ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h);
      
      ctx.strokeStyle = `rgba(180, 50, 20, ${0.4 + pulse * 0.4})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = -now / 40; // Moving dash
      ctx.strokeRect(hazard.x, hazard.y, hazard.w, hazard.h);
      ctx.setLineDash([]);
      
      // Draw watermark emoji
      ctx.fillStyle = 'rgba(120, 53, 15, 0.25)';
      ctx.font = '48px Outfit, sans-serif';
      ctx.fillText(hazard.emoji, hazard.x + hazard.w / 2 - 24, hazard.y + hazard.h / 2 + 16);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const labelText = `${hazard.emoji} ${hazard.name}`;
      ctx.font = '700 12px Outfit, sans-serif';
      const textWidth = ctx.measureText(labelText).width;
      ctx.fillRect(hazard.x + 4, hazard.y + 4, textWidth + 10, 22);

      ctx.fillStyle = '#5b2b16';
      ctx.fillText(labelText, hazard.x + 9, hazard.y + 19);
    });

    // 5. Walls with drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#4a3a2a'; // darker stone
    WALLS.forEach((wall) => {
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = 'rgba(20, 15, 10, 0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
    });
    ctx.shadowColor = 'transparent'; // Reset
    ctx.shadowOffsetY = 0;

    // 6. Exit Gate
    const gateOpen = missionEvidenceCount >= 1;
    ctx.shadowColor = gateOpen ? 'rgba(74, 222, 128, 0.4)' : 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = gateOpen ? 'rgba(74, 222, 128, 0.6)' : 'rgba(74, 54, 32, 0.8)';
    ctx.fillRect(724, 258, 54, 108);
    ctx.strokeStyle = gateOpen ? '#166534' : '#3a2a18';
    ctx.lineWidth = 4;
    ctx.strokeRect(724, 258, 54, 108);
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = gateOpen ? '#064e3b' : '#fdf6e3';
    ctx.font = '800 13px Outfit, sans-serif';
    ctx.fillText(gateOpen ? '🔓 EXIT' : '🔒 LOCKED', gateOpen ? 728 : 726, 316);
    ctx.lineWidth = 1;

    // 7. Tokens (Floating/glowing)
    tokensRef.current.forEach((token, index) => {
      if (token.collected) return;
      
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
      
      const tokenEmoji = '🔍'; // Keep generic so students must inspect to find out what it is
      
      ctx.font = '15px Outfit, sans-serif';
      ctx.fillText(tokenEmoji, token.x - 7, token.y + 5 + floatY);
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
      ctx.fillStyle = '#5b3b8c';
      ctx.beginPath();
      ctx.ellipse(guardian.x + guardian.w / 2, guardian.y + guardian.h / 2, 18, 21, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#efe3ff';
      ctx.beginPath();
      ctx.arc(guardian.x + 10, guardian.y + 11, 2.8, 0, Math.PI * 2);
      ctx.arc(guardian.x + 20, guardian.y + 11, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = 'rgba(255, 250, 240, 0.72)';
      ctx.font = '700 11px Outfit, sans-serif';
      const labelWidth = ctx.measureText(guardian.name).width;
      ctx.fillRect(guardian.x - 22, guardian.y - 24, labelWidth + 14, 18);
      ctx.fillStyle = '#3a2a18';
      ctx.fillText(guardian.name, guardian.x - 15, guardian.y - 11);
    });

    // 9. Player Avatar
    const player = playerRef.current;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    
    // Draw a nice badge background for the player
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(player.x + PLAYER_SIZE / 2, player.y + PLAYER_SIZE / 2, PLAYER_SIZE / 2 + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetY = 0;
    ctx.font = '16px Outfit, sans-serif';
    ctx.fillText('🕵️', player.x + 3, player.y + 17);
  }, [missionEvidenceCount]);

  const update = useCallback((dt = 1 / 60) => {
    if (briefingOpen || lockedRef.current || inspectionToken) {
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
    const hitWall = WALLS.some(wall => rectsOverlap(nextRect, wall));
    if (!hitWall) {
      playerRef.current = next;
    }

    const zoneName = getZoneName(playerRef.current);
    setCurrentZone(previous => previous === zoneName ? previous : zoneName);

    const playerRect = getPlayerRect(playerRef.current);
    HAZARDS.forEach((hazard) => {
      if (rectsOverlap(playerRect, hazard) && !hazardCooldownRef.current[hazard.id]) {
        hazardCooldownRef.current[hazard.id] = 2.5;
        syncResources(hazard.penalty);
        setNotice(hazard.message);
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
        if (!WALLS.some(wall => rectsOverlap(getPlayerRect(pushed), wall))) {
          playerRef.current = pushed;
        }
        setNotice(guardian.message);
        audioControls.playError?.();
      }
    });

    const nearestToken = tokensRef.current.find((token) => {
      if (token.collected) return;
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
      if (missionEvidenceCount >= 1) {
        lockedRef.current = true;
        setClaimOpen(true);
        setNotice('Exit Gate reached. Make your final claim.');
      } else {
        setNotice(activeMission.gateRequirement);
      }
    }

    draw();
  }, [activeMission.gateRequirement, audioControls, briefingOpen, draw, inspectionToken, missionEvidenceCount, syncResources]);

  useEffect(() => {
    if (expeditionStage === 'excavation') return undefined;

    window.advanceTime = (ms = 16) => {
      window.__advanceExpeditionJourney?.(ms);
    };
    window.render_game_to_text = () => JSON.stringify({
      mode: 'Lost Site Expedition',
      stage: baseCampOpen ? 'base-camp' : 'journey',
      activeMission,
      missionTarget: activeMission,
      missionProgress: {
        found: missionEvidenceCount,
        required: 1,
        targetCategoryId: activeMission.targetCategoryId,
        targetCategoryTitle: activeMission.targetCategoryTitle,
      },
      exitUnlocked: missionEvidenceCount >= 1,
      resultOpen,
      finalScore,
      finalRank,
      fieldKitBonus,
      claimCorrect,
      evidenceSupportsClaim,
      missionComplete,
      fieldGuideHintVisible: Boolean(fieldKitEffects.fieldGuideAvailable && inspectionToken && !inspectionFeedback),
      fieldKitImpact,
      collectedEvidence: collectedRef.current.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        missionCategoryId: normaliseEvidenceTypeForMission(item.type),
        isMissionEvidence: item.isMissionEvidence,
        supports: item.supports,
      })),
      remainingEvidence: tokensRef.current.filter(item => !item.collected).map(item => ({
        id: item.id,
        x: item.x,
        y: item.y,
        category: item.category,
        missionCategoryId: normaliseEvidenceTypeForMission(item.type),
        clueGroup: item.clueGroup,
      })),
      fieldKit,
      fieldKitEffects,
      baseCampOpen,
      journey: journeySnapshotRef.current,
    });

    return () => {
      delete window.advanceTime;
      delete window.render_game_to_text;
    };
  }, [activeMission, baseCampOpen, claimCorrect, evidenceSupportsClaim, expeditionStage, fieldKit, fieldKitBonus, fieldKitEffects, fieldKitImpact, finalRank, finalScore, inspectionFeedback, inspectionToken, missionComplete, missionEvidenceCount, resultOpen]);

  useEffect(() => {
    if (expeditionStage !== 'excavation') return undefined;

    const handleKeyDown = (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
        event.preventDefault();
        if (briefingOpen || lockedRef.current || inspectionToken) return;
        keysRef.current[event.code] = true;
      }
      if (event.code === 'KeyE') {
        event.preventDefault();
        openInspection();
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
      update(dt);
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
      stage: 'excavation',
      coordinateSystem: 'origin top-left, x right, y down',
      fieldKit,
      fieldKitEffects,
      fieldNotes,
      player: { ...playerRef.current, size: PLAYER_SIZE, zone: getZoneName(playerRef.current) },
      resources: resourcesRef.current,
      collectedEvidence: collectedRef.current.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        missionCategoryId: normaliseEvidenceTypeForMission(item.type),
        isMissionEvidence: item.isMissionEvidence,
        clueGroup: item.clueGroup,
        supports: item.supports,
      })),
      remainingEvidence: tokensRef.current.filter(item => !item.collected).map(item => ({
        id: item.id,
        x: item.x,
        y: item.y,
        category: item.category,
        missionCategoryId: normaliseEvidenceTypeForMission(item.type),
        clueGroup: item.clueGroup,
      })),
      hazards: HAZARDS.map(item => ({ id: item.id, name: item.name, x: item.x, y: item.y, w: item.w, h: item.h })),
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
        required: 1,
        targetCategoryId: activeMission.targetCategoryId,
        targetCategoryTitle: activeMission.targetCategoryTitle,
      },
      exitUnlocked: missionEvidenceCount >= 1,
      inventory: {
        count: collectedRef.current.length,
        limit: MAX_EVIDENCE_ITEMS,
      },
      claimOpen: lockedRef.current,
      resultOpen,
      finalScore,
      finalRank,
      fieldKitBonus,
      claimCorrect,
      evidenceSupportsClaim,
      missionComplete,
      fieldGuideHintVisible: Boolean(fieldKitEffects.fieldGuideAvailable && inspectionToken && !inspectionFeedback),
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
  }, [activeMission, briefingOpen, claimCorrect, draw, evidenceSupportsClaim, expeditionStage, fieldKit, fieldKitBonus, fieldKitEffects, fieldKitImpact, fieldNotes, finalRank, finalScore, inspectionFeedback, inspectionToken, missionComplete, missionEvidenceCount, openInspection, resultOpen, update]);

  const resetExpedition = () => {
    const nextMission = chooseEvidenceHuntMission(activeMission.id);
    setExpeditionStage('journey');
    setBaseCampOpen(false);
    setFieldKit([]);
    setActiveMission(nextMission);
    setJourneyRunId(previous => previous + 1);
    journeySnapshotRef.current = null;
    playerRef.current = { x: 42, y: 498 };
    tokensRef.current = buildExpeditionEvidence();
    guardiansRef.current = buildExcavationGuardians();
    collectedRef.current = [];
    resourcesRef.current = INITIAL_RESOURCES;
    hazardCooldownRef.current = {};
    guardianCooldownRef.current = {};
    lockedRef.current = false;
    tickAccumulatorRef.current = 0;
    nearbyTokenRef.current = null;
    keysRef.current = {};
    setCollectedEvidence([]);
    setFieldNotes([]);
    setResources(INITIAL_RESOURCES);
    setCurrentZone('Market Area');
    setNotice(nextMission.instruction);
    setBriefingOpen(true);
    setNearbyToken(null);
    setInspectionToken(null);
    setInspectionStep('review');
    setInspectionFeedback(null);
    setMissionEvidenceCount(0);
    setClaimOpen(false);
    setSelectedCivilisation('');
    setSelectedEvidenceId('');
    setClaimResult(null);
    setResultOpen(false);
    dismissedTokenRef.current = null;
    draw();
  };

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

    const civilisationCorrect = selectedCivilisation === TARGET_CIVILISATION;
    const evidenceCorrect = chosenEvidence.supports === TARGET_CIVILISATION;
    const sentence = `I think this site belongs to ${selectedCivilisation} because ${chosenEvidence.name}.`;

    setClaimResult({
      correct: civilisationCorrect && evidenceCorrect,
      sentence,
      feedback: civilisationCorrect && evidenceCorrect
        ? `${chosenEvidence.name} supports ${TARGET_CIVILISATION}: ${chosenEvidence.rationale}`
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

  if (expeditionStage === 'journey' && !baseCampOpen) {
    return (
      <ExpeditionJourney
        key={journeyRunId}
        mission={activeMission}
        onBackToMenu={onBackToMenu}
        onComplete={handleJourneyComplete}
        onSnapshotChange={handleJourneySnapshot}
        audioControls={audioControls}
      />
    );
  }

  if (baseCampOpen) {
    return (
      <section className="phase-container bureau-phase expedition-phase">
        <div className="expedition-shell expedition-basecamp-shell">
          <header className="expedition-topbar">
            <button type="button" className="bureau-hint-btn" onClick={onBackToMenu}>
              <ChevronLeft size={18} /> Back to Menu
            </button>
            <div className="expedition-title">
              <div className="training-kicker">Lost Site Expedition</div>
              <h2>Base Camp Checklist</h2>
            </div>
            <div className="expedition-gate-badge unlocked">
              <Sparkles size={16} />
              <span>Dig Site Reached</span>
              <small>Prepare for excavation</small>
            </div>
          </header>

          <div className="expedition-basecamp-card">
            <div>
              <p className="phase-kicker">Field Kit Report</p>
              <h3>Equipment packed for the excavation stage</h3>
              <p>
                Tools collected on the journey now help with careful excavation, field notes,
                mapping and evidence checks. Missing tools mean the team loses that advantage.
              </p>
            </div>

            <div className="expedition-mission-card">
              <strong>{activeMission.title}</strong>
              <span>{activeMission.targetCategoryTitle}</span>
              <p>{activeMission.instruction}</p>
            </div>

            <div className="expedition-field-kit-impact-grid">
              {fieldKitImpact.map((tool) => (
                <article key={tool.id} className={`expedition-field-kit-impact ${tool.collected ? 'is-collected' : ''}`}>
                  <strong>{tool.name}</strong>
                  <span>{tool.collected ? 'Advantage secured' : 'Missed advantage'}</span>
                  <p>{tool.collected ? tool.baseCampCollected : tool.baseCampMissing}</p>
                </article>
              ))}
            </div>

            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn expedition-begin-btn" onClick={beginExcavationStage}>
                Begin Excavation
              </button>
              <button type="button" className="btn" onClick={resetExpedition}>
                Restart Journey
              </button>
            </div>
          </div>
        </div>
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
            <div className="training-kicker">10-15 mins | Solo Adventure</div>
            <h2>Lost Site Expedition</h2>
          </div>
          <div className={`expedition-gate-badge ${exitUnlocked ? 'unlocked' : ''}`}>
            <Sparkles size={16} />
            <span>{exitUnlocked ? 'Exit Gate Unlocked' : 'Exit Gate Locked'}</span>
            <small>{exitUnlocked ? `${activeMission.targetCategoryTitle} secured 1/1` : `${activeMission.targetCategoryTitle} found ${missionEvidenceCount}/1`}</small>
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
            />
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
              <h3><Sparkles size={17} /> Mission Target</h3>
              <div className="expedition-mission-card">
                <strong>{activeMission.title}</strong>
                <span>{activeMission.targetCategoryTitle}</span>
                <p>{activeMission.instruction}</p>
                <div className="expedition-mission-progress">
                  {activeMission.targetCategoryTitle} found: <span>{missionEvidenceCount}/1</span>
                </div>
              </div>
            </section>

            <section className="expedition-panel">
              <h3><Gauge size={17} /> Field Resources</h3>
              <div className="resource-list">
                <div><strong>{resources.investigation}</strong><span>Investigation points</span></div>
                <div><strong>{resources.stamina}</strong><span>Stamina</span></div>
                <div><strong>{Math.floor(resources.time / 60)}:{String(resources.time % 60).padStart(2, '0')}</strong><span>Time</span></div>
              </div>
            </section>

            <section className="expedition-panel">
              <h3><Backpack size={17} /> Field Kit</h3>
              <ul className="expedition-tool-list expedition-tool-impact-list compact">
                {fieldKitImpact.map((tool) => (
                  <li key={tool.id} className={tool.collected ? 'is-collected' : ''}>
                    <span>{tool.name}</span>
                    <strong>{tool.collected ? tool.effect : 'Missing'}</strong>
                    <p>{tool.collected ? tool.detail : tool.baseCampMissing}</p>
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
                <li>unstable floor: lowers stamina</li>
                <li>scorpion path: obstacle only</li>
                <li>Tomb Guardian Shadow: avoid its patrol</li>
              </ul>
            </section>

            <section className="expedition-panel">
              <h3><Clock size={17} /> Controls</h3>
              <p className="expedition-control-copy">Move with WASD or the arrow keys. Stand near evidence and press E or Inspect Evidence.</p>
            </section>
          </aside>
        </div>
      </div>

      {briefingOpen && (
        <div className="bureau-briefing-overlay expedition-briefing-overlay">
          <div className="bureau-briefing-modal expedition-mission-briefing-modal">
            <div className="expedition-briefing-stamp">Top Secret</div>
            <h2>Operation: Lost Site Expedition</h2>
            <p>Explore the site, collect evidence, and prove which civilisation lived here.</p>
            
            <div className="expedition-mission-card expedition-briefing-mission">
              <strong>{activeMission.title}</strong>
              <p>{activeMission.instruction}</p>
            </div>

            <div className="expedition-briefing-rules" aria-label="Mission Rules">
              <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'grid', gap: '0.4rem' }}>
                <li><strong>Search</strong>: {activeMission.briefingRule}</li>
                <li><strong>Choose Carefully</strong>: Your evidence satchel can only hold 3 items, so you may need to replace weaker evidence.</li>
                <li><strong>Survive</strong>: Avoid hazards that drain your time and stamina.</li>
                <li><strong>Prove</strong>: Make your final claim at the exit using your evidence.</li>
              </ul>
            </div>

            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn expedition-begin-btn" onClick={beginExpedition}>
                Begin Expedition
              </button>
            </div>
          </div>
        </div>
      )}

      {inspectionToken && (
        <div className="bureau-briefing-overlay">
          <div className="bureau-briefing-modal expedition-inspection-modal">
            <div className="training-kicker">Inspect Evidence</div>
            <h2>{inspectionToken.name}</h2>
            <div className="expedition-inspection-meta">{inspectionToken.category}</div>
            <p>{inspectionToken.clue}</p>
            <div className="expedition-inspection-clue-group">Clue group: {inspectionToken.clueGroup}</div>
            {fieldKitEffects.fieldGuideAvailable && !inspectionFeedback && (
              <div className="expedition-tool-effect-hint">
                <strong>Field Guide Hint</strong>
                <span>
                  {FIELD_GUIDE_HINTS[normaliseEvidenceTypeForMission(inspectionToken.type)] || 'Field Guide Hint: Look at what this evidence shows before deciding if it matches the mission.'}
                </span>
              </div>
            )}
            {fieldKitEffects.notebookReady && !inspectionFeedback && (
              <div className="expedition-tool-effect-hint">
                <strong>Notebook Ready</strong>
                <span>Choosing "Not mission evidence" records a field note without filling your evidence satchel.</span>
              </div>
            )}
            <div className="expedition-inspection-question">Does this evidence match your mission?</div>

            {!inspectionFeedback && inspectionStep === 'review' && (
              <div className="expedition-inspection-actions">
                <button
                  type="button"
                  className="btn primary-btn"
                  onClick={() => inspectMissionChoice(true)}
                >
                  Secure as mission evidence
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => inspectMissionChoice(false)}
                >
                  Not mission evidence - keep searching
                </button>
              </div>
            )}

            {!inspectionFeedback && inspectionStep === 'capacity' && (
              <div className="expedition-inventory-choice">
                <p>Your evidence satchel is full. What would you like to do?</p>
                <div className="expedition-inventory-choice-actions">
                  <button
                    type="button"
                    className="btn primary-btn"
                    onClick={() => setInspectionStep('replace')}
                  >
                    Replace an existing evidence item
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => rejectInspectedEvidence(inspectionToken)}
                  >
                    Leave this evidence here
                  </button>
                </div>
              </div>
            )}

            {!inspectionFeedback && inspectionStep === 'replace' && (
              <div className="expedition-replacement-picker">
                <p>Choose one evidence item to replace.</p>
                <div className="expedition-replacement-grid">
                  {collectedEvidence.map(item => (
                    <button
                      type="button"
                      key={item.id}
                      className="expedition-replacement-card"
                      onClick={() => finishInspection(inspectionToken, item.id)}
                    >
                      <strong>{item.name}</strong>
                      <span>{item.category} | {item.zone}</span>
                    </button>
                  ))}
                </div>
                <button type="button" className="btn" onClick={() => setInspectionStep('capacity')}>
                  Back
                </button>
              </div>
            )}

            {inspectionFeedback && (
              <div className={`expedition-claim-feedback ${inspectionFeedback.correct ? 'correct' : 'incorrect'}`}>
                {inspectionFeedback.correct ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
                <div>
                  <strong>{inspectionFeedback.correct ? 'Evidence verified' : 'Evidence collected'}</strong>
                  <p>{inspectionFeedback.text}</p>
                </div>
                <span className={`expedition-evidence-stamp ${inspectionFeedback.correct ? 'verified' : 'collected'}`}>
                  {inspectionFeedback.stamp}
                </span>
              </div>
            )}

            <div className="bureau-briefing-actions">
              <button type="button" className="btn" onClick={closeInspection}>
                {inspectionFeedback ? 'Continue Expedition' : 'Keep Looking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {claimOpen && (
        <div className="bureau-briefing-overlay">
          <div className="bureau-briefing-modal expedition-claim-modal">
            <div className="training-kicker">Final Expedition Claim</div>
            <h2>Identify the Lost Site</h2>
            <p>Choose the civilisation and the collected evidence that best supports your claim.</p>

            <label className="expedition-claim-field">
              <span>Civilisation</span>
              <select value={selectedCivilisation} onChange={(event) => setSelectedCivilisation(event.target.value)}>
                <option value="">Choose a civilisation</option>
                {trainingCivilisations.map(civilisation => (
                  <option key={civilisation} value={civilisation}>{civilisation}</option>
                ))}
              </select>
            </label>

            <label className="expedition-claim-field">
              <span>Best supporting evidence</span>
              <select value={selectedEvidenceId} onChange={(event) => setSelectedEvidenceId(event.target.value)}>
                <option value="">Choose collected evidence</option>
                {collectedEvidence.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>

            {claimResult && (
              <div className={`expedition-claim-feedback ${claimResult.correct ? 'correct' : 'incorrect'}`}>
                {claimResult.correct ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
                <div>
                  <strong>{claimResult.sentence}</strong>
                  <p>{claimResult.feedback}</p>
                </div>
              </div>
            )}

            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn" onClick={submitClaim}>
                Submit Claim
              </button>
              {claimResult?.correct ? (
                <button type="button" className="btn" onClick={resetExpedition}>
                  Play Again
                </button>
              ) : (
                <button type="button" className="btn" onClick={() => {
                  playerRef.current = { x: 676, y: 304 };
                  lockedRef.current = false;
                  setClaimOpen(false);
                }}>
                  Return to Site
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {resultOpen && (
        <div className="bureau-briefing-overlay">
          <div className="bureau-briefing-modal expedition-result-modal">
            <div className="training-kicker">Run Result</div>
            <div className="expedition-result-header">
              <div>
                <h2>{finalRank}</h2>
                <p>{resultFeedback}</p>
              </div>
              <div className="expedition-score-badge">
                <strong>{finalScore}</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="expedition-result-grid">
              <section className="expedition-result-card">
                <h3>Mission Result</h3>
                <dl>
                  <div><dt>Mission</dt><dd>{activeMission.title}</dd></div>
                  <div><dt>Mission evidence</dt><dd>{missionComplete ? 'Secured' : 'Not secured'}</dd></div>
                  <div><dt>Collected</dt><dd>{missionEvidenceCount}/1 {activeMission.targetCategoryTitle}</dd></div>
                  <div><dt>Exit Gate</dt><dd>{exitUnlocked ? 'Unlocked' : 'Locked'}</dd></div>
                </dl>
              </section>

              <section className="expedition-result-card">
                <h3>Final Claim</h3>
                <dl>
                  <div><dt>Civilisation</dt><dd>{selectedCivilisation || 'Not chosen'}</dd></div>
                  <div><dt>Ancient Egypt match</dt><dd>{claimCorrect ? 'Yes' : 'No'}</dd></div>
                  <div><dt>Supporting evidence</dt><dd>{selectedEvidence?.name || 'Not chosen'}</dd></div>
                  <div><dt>Evidence support</dt><dd>{evidenceSupportsClaim ? 'Supports Ancient Egypt' : 'Does not support Ancient Egypt'}</dd></div>
                </dl>
                {claimResult && (
                  <div className={`expedition-claim-feedback ${claimResult.correct ? 'correct' : 'incorrect'}`}>
                    {claimResult.correct ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    <div>
                      <strong>{claimResult.sentence}</strong>
                      <p>{claimResult.feedback}</p>
                    </div>
                  </div>
                )}
              </section>

              <section className="expedition-result-card expedition-result-card-wide">
                <h3>Field Performance</h3>
                <div className="expedition-result-stats">
                  <span>Time: <strong>{resources.time}s</strong></span>
                  <span>Stamina: <strong>{resources.stamina}</strong></span>
                  <span>Investigation: <strong>{resources.investigation}</strong></span>
                  <span>Evidence: <strong>{collectedEvidence.length}/{MAX_EVIDENCE_ITEMS}</strong></span>
                  <span>Field notes: <strong>{fieldNotes.length}</strong></span>
                  <span>Tool bonus: <strong>+{fieldKitBonus}</strong></span>
                </div>
                <div className="expedition-result-lists">
                  <div>
                    <strong>Tools collected</strong>
                    <p>{collectedTools.length > 0 ? collectedTools.map(tool => tool.name).join(', ') : 'No tools collected'}</p>
                  </div>
                  <div>
                    <strong>Missing tools</strong>
                    <p>{missingTools.length > 0 ? missingTools.map(tool => tool.name).join(', ') : 'No tools missing'}</p>
                  </div>
                  <div>
                    <strong>Evidence collected</strong>
                    <p>{collectedEvidence.length > 0 ? collectedEvidence.map(item => item.name).join(', ') : 'No evidence collected'}</p>
                  </div>
                  <div>
                    <strong>Field notes recorded</strong>
                    <p>{fieldNotes.length > 0 ? fieldNotes.map(note => note.name).join(', ') : 'No field notes recorded'}</p>
                  </div>
                </div>
              </section>

              <section className="expedition-result-card expedition-result-card-wide">
                <h3>Field Kit Impact</h3>
                <div className="expedition-field-kit-impact-grid">
                  {fieldKitImpact.map((tool) => (
                    <article key={tool.id} className={`expedition-field-kit-impact ${tool.collected ? 'is-collected' : ''}`}>
                      <strong>{tool.name}</strong>
                      <span>{tool.collected ? tool.effect : 'Missed advantage'}</span>
                      <p>{tool.detail}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn" onClick={resetExpedition}>
                Play Again
              </button>
              <button type="button" className="btn" onClick={onBackToMenu}>
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
