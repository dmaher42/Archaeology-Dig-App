import { SECRET_COLLECTIBLES } from './journeyDataRouter.js';
import { JOURNEY_EXTERIOR_SCENE_ID } from './journeyConstants.js';
import { clamp, JOURNEY_INTERACT_VERBS } from './journeyUtils.js';

export const SCRIBE_CHAMBER_PUZZLE = {
  id: 'scribe-chamber-wall-inscription',
  type: 'scribe-chamber-puzzle',
  bossId: 'scribe-locked-chamber',
  bossName: 'The Scribe\'s Locked Chamber',
  title: 'Scribe Chamber Decoding',
  intro: 'Use the translation tablet to read the scratched name-line, then choose what the record proves.',
  questions: [{
    id: 'scribe-chamber-name-record-queen-truth',
    question: 'Scratched Name + Witness Line + Queen Record',
    options: [
      'The Queen protected memory anchors so names would not be lost.',
      'The Queen hid treasure and ordered the scribes to lie.',
      'The scribes erased every witness so the door could sleep.',
      'The record says the river opens only at sunrise.',
    ],
    correctIndex: 0,
  }],
};
export const SCRIBE_CHAMBER_FEEDBACK = {
  correct: 'The decoded record names a protector, not a thief.',
  incorrect: 'That repeats the false story. The scratched name-line says more.',
};
export const SCRIBE_CHAMBER_DOOR_OPEN_LINE = 'The name is remembered. The door opens.';
export const MUMMIFICATION_CHAMBER_RITUAL_ORDER = [
  'Cleanse the body',
  'Remove organs and dry the body',
  'Anoint with oils and resins',
  'Wrap body in linen',
  'Place in sarcophagus with amulets',
];
export const MUMMIFICATION_CHAMBER_PUZZLE = {
  id: 'mummification-chamber-ritual-order',
  type: 'mummification-ritual-order-puzzle',
  bossId: 'mummification-chamber',
  bossName: 'The Mummification Chamber',
  title: 'The Ritual of Preservation',
  intro: 'This room holds a sequence. Each step was performed for a reason. Restore the sacred order to release the seal.',
  hints: [
    'The body must be cleansed before anything is removed or wrapped.',
    'Drying comes before the oils, and oils come before linen.',
    'The sarcophagus is the final step, after the body is wrapped.',
  ],
  questions: [{
    id: 'mummification-chamber-ritual-sequence',
    question: 'Which sequence completes the sacred ritual?',
    options: [
      MUMMIFICATION_CHAMBER_RITUAL_ORDER.map((step, index) => `${index + 1}. ${step}`).join(' -> '),
      [
        '1. Wrap body in linen',
        '2. Cleanse the body',
        '3. Anoint with oils and resins',
        '4. Remove organs and dry the body',
        '5. Place in sarcophagus with amulets',
      ].join(' -> '),
      [
        '1. Remove organs and dry the body',
        '2. Place in sarcophagus with amulets',
        '3. Cleanse the body',
        '4. Wrap body in linen',
        '5. Anoint with oils and resins',
      ].join(' -> '),
      [
        '1. Cleanse the body',
        '2. Wrap body in linen',
        '3. Anoint with oils and resins',
        '4. Remove organs and dry the body',
        '5. Place in sarcophagus with amulets',
      ].join(' -> '),
    ],
    correctIndex: 0,
  }],
};
export const MUMMIFICATION_CHAMBER_FEEDBACK = {
  correct: 'The ritual order is understood. The seal is opening.',
  incorrect: 'That order is not right. Look again at what each step required.',
};

export const MUMMIFICATION_CHAMBER_RESTORATION_IDS = [
  'egypt-mummification-body-fragment-1',
  'egypt-mummification-body-fragment-2',
  'egypt-mummification-body-fragment-3',
];
export const FORGOTTEN_MURAL_CHAMBER_RESTORATION_IDS = ['egypt-scarab-fragment-1', 'egypt-scarab-fragment-2', 'egypt-scarab-fragment-3'];
export const SCRIBE_CHAMBER_RESTORATION_IDS = [
  'egypt-scribe-name-fragment-1',
  'egypt-scribe-name-fragment-2',
  'egypt-scribe-name-fragment-3',
];
export const ROOM_RESTORATION_SETS = {
  'mummification-body-self': {
    ids: MUMMIFICATION_CHAMBER_RESTORATION_IDS,
    restoredStateKey: 'mummificationChamberRestored',
    restoresStoryFlag: 'mummification-body-restored',
    effectText: 'BODY RESTORED',
    fallbackRestoreMessage: 'Asha restores the body rite as a protected memory.',
    fallbackAnubisReaction: 'Care is not innocence. But it is care.',
  },
  'forgotten-mural-seal': {
    ids: FORGOTTEN_MURAL_CHAMBER_RESTORATION_IDS,
    restoredStateKey: 'forgottenMuralChamberRestored',
    restoresStoryFlag: 'forgotten-mural-restored',
    opensMuralPuzzle: true,
    effectText: 'RELIC READY',
    fallbackRestoreMessage: 'Asha restores the broken warning mural.',
    fallbackAnubisReaction: 'Do not mistake this for trust.',
  },
  'scribe-name-record': {
    ids: SCRIBE_CHAMBER_RESTORATION_IDS,
    restoredStateKey: 'scribeChamberRecordRestored',
    restoresStoryFlag: 'scribe-name-restored',
    effectText: 'NAME RESTORED',
    fallbackRestoreMessage: 'Asha restores the broken name-line.',
    fallbackAnubisReaction: 'A name remembered can still accuse.',
  },
};

export const SACRED_ROOM_EVIDENCE_LABELS = [
  {
    label: 'Body',
    setId: 'mummification-body-self',
    room: 'Mummification',
    clue: 'Preservation',
  },
  {
    label: 'Image',
    setId: 'forgotten-mural-seal',
    room: 'Mural',
    clue: 'Memory',
  },
  {
    label: 'Name',
    setId: 'scribe-name-record',
    room: 'Scribe',
    clue: 'Identity',
  },
];

export const getSacredRoomRestorationEvidence = (current) => Object.fromEntries(
  Object.entries(ROOM_RESTORATION_SETS).map(([setId, config]) => {
    const recoveredCount = config.ids.filter(id => current.collectedSecretIds?.has(id)).length;
    return [setId, {
      recoveredCount,
      requiredCount: config.ids.length,
      fragmentsRecovered: recoveredCount === config.ids.length,
      restored: Boolean(config.restoredStateKey && current[config.restoredStateKey]),
    }];
  }),
);

export const getSacredRoomEvidenceRows = (current) => {
  const evidence = getSacredRoomRestorationEvidence(current);
  return SACRED_ROOM_EVIDENCE_LABELS.map(item => ({
    ...item,
    ...(evidence[item.setId] || { recoveredCount: 0, requiredCount: 3, fragmentsRecovered: false, restored: false }),
  }));
};

export const getRoomRestorationStatus = (secret, current) => {
  const config = ROOM_RESTORATION_SETS[secret?.restorationSetId];
  if (!config) {
    return {
      config: null,
      restoration: secret,
      evidence: null,
      fragmentsRecovered: false,
      alreadyRestored: false,
      puzzleReady: false,
      roomRestored: false,
    };
  }
  const evidence = getSacredRoomRestorationEvidence(current)[secret.restorationSetId];
  const fragmentsRecovered = Boolean(evidence?.fragmentsRecovered);
  const alreadyRestored = Boolean(config.restoredStateKey && current[config.restoredStateKey]);
  const restoration = SECRET_COLLECTIBLES.find(item => (
    item.restorationSetId === secret.restorationSetId
    && item.restoresStoryFlag === config.restoresStoryFlag
  )) || secret;
  return {
    config,
    restoration,
    evidence,
    fragmentsRecovered,
    alreadyRestored,
    puzzleReady: Boolean(config.opensMuralPuzzle && fragmentsRecovered && !alreadyRestored && !current.forgottenMuralRelicSlidePuzzleSolved),
    roomRestored: Boolean(!config.opensMuralPuzzle && fragmentsRecovered && !alreadyRestored),
  };
};

export const getAnubisRestorationReaction = (restorationStatus, current) => {
  if (!restorationStatus?.roomRestored) return null;
  const restoredCount = Object.values(getSacredRoomRestorationEvidence(current))
    .filter(evidence => evidence.restored)
    .length;
  return restorationStatus.restoration?.anubisReaction
    || restorationStatus.config?.fallbackAnubisReaction
    || (restoredCount > 1 ? 'You keep choosing memory over speed.' : 'Do not mistake this for trust.');
};

export const MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS = Object.freeze([
  {
    id: 'mummification-embalming-table',
    assetKey: 'embalmingTableMarker',
    name: 'Embalming Table',
    message: 'This was a work of care. Every hand here moved slowly, and in silence.',
    successMessage: 'The chamber grows still.',
    pulseText: 'TABLE HONOURED',
    screen: { x: 565, y: 340, width: 120, height: 84 },
    hitbox: { x: 430, y: 350, width: 320, height: 180 },
  },
  {
    id: 'mummification-linen-wrappings',
    assetKey: 'linenWrappings',
    name: 'Linen Wrappings',
    message: 'Layer by layer. Not hidden. Held together.',
    successMessage: 'The linen settles, smooth and patient under careful hands.',
    pulseText: 'LINEN PREPARED',
    screen: { x: 295, y: 446, width: 114, height: 82 },
    hitbox: { x: 245, y: 410, width: 170, height: 150 },
  },
  {
    id: 'mummification-canopic-jars',
    assetKey: 'canopicJars',
    name: 'Canopic Jars',
    message: 'Not storage. Safekeeping.',
    successMessage: 'The jars settle into silence.',
    pulseText: 'JARS SEALED',
    screen: { x: 585, y: 452, width: 230, height: 108 },
    hitbox: { x: 450, y: 408, width: 275, height: 160 },
  },
  {
    id: 'mummification-ritual-tablet',
    assetKey: 'ritualTablet',
    name: 'Ritual Tablet',
    message: 'The name has been scratched away. Someone tried to remove more than stone.',
    successMessage: 'A faint line of the name returns.',
    pulseText: 'NAME REMEMBERED',
    screen: { x: 780, y: 456, width: 90, height: 108 },
    hitbox: { x: 735, y: 410, width: 130, height: 170 },
  },
  {
    id: 'mummification-oils-resins',
    assetKey: 'oilsResins',
    name: 'Oils and Resins',
    message: 'Preservation was care. Not display.',
    successMessage: 'The scent of resin rises from the stone.',
    pulseText: 'OILS APPLIED',
    screen: { x: 806, y: 380, width: 122, height: 76 },
    hitbox: { x: 740, y: 360, width: 170, height: 170 },
  },
  {
    id: 'mummification-exit-seal',
    assetKey: 'exitSeal',
    name: 'Exit Seal',
    message: 'The seal recognises care before passage.',
    lockedMessage: 'The seal remains closed.',
    pulseText: 'SEAL OPEN',
    screen: { x: 154, y: 316, width: 104, height: 130 },
    hitbox: { x: 78, y: 250, width: 150, height: 245 },
    exitSeal: true,
  },
]);
export const MUMMIFICATION_CHAMBER_REQUIRED_INSPECTION_IDS = MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS
  .filter(item => !item.exitSeal)
  .map(item => item.id);
// Ritual preparation sequence — the order the player must activate each object
export const MUMMIFICATION_CHAMBER_RITUAL_GUIDANCE_VERSION = 'mummification-ritual-guided-sequence-2026-05-31';
export const MUMMIFICATION_CHAMBER_RITUAL_STEPS = Object.freeze([
  {
    id: 'mummification-embalming-table',
    rite: 'Cleanse the body',
    guideLabel: 'Cleanse the body',
    shortLabel: 'Cleanse',
    hint: 'Begin at the embalming table. Cleansing comes before preservation.',
    pulseText: 'BODY CLEANSED',
  },
  {
    id: 'mummification-canopic-jars',
    rite: 'Remove organs and dry the body',
    guideLabel: 'Prepare the jars',
    shortLabel: 'Jars',
    hint: 'The canopic jars come next. The body is prepared before oils or linen.',
    pulseText: 'JARS PREPARED',
  },
  {
    id: 'mummification-oils-resins',
    rite: 'Anoint with oils and resins',
    guideLabel: 'Apply oils',
    shortLabel: 'Oils',
    hint: 'Now apply the oils and resins before wrapping.',
    pulseText: 'OILS APPLIED',
  },
  {
    id: 'mummification-linen-wrappings',
    rite: 'Wrap body in linen',
    guideLabel: 'Wrap in linen',
    shortLabel: 'Linen',
    hint: 'The linen follows the oils. Wrap only after the body is prepared.',
    pulseText: 'LINEN WRAPPED',
  },
  {
    id: 'mummification-ritual-tablet',
    rite: 'Place in sarcophagus with amulets',
    guideLabel: 'Speak the name',
    shortLabel: 'Name',
    hint: 'The name is last. The seal opens when the life is remembered.',
    pulseText: 'NAME SPOKEN',
  },
]);
export const MUMMIFICATION_CHAMBER_RITUAL_SEQUENCE = MUMMIFICATION_CHAMBER_RITUAL_STEPS.map(step => step.id);
export const MUMMIFICATION_CHAMBER_ATMOSPHERE_VERSION = 'mummification-chamber-atmosphere-progression-2026-05-28';
export const MUMMIFICATION_CHAMBER_DISTURBANCE_DURATION = 0.7;
export const getMummificationChamberAtmosphere = (current) => {
  const inspectedObjectIds = current.mummificationChamberInspectedObjectIds || new Set();
  const inspectedRequiredCount = MUMMIFICATION_CHAMBER_REQUIRED_INSPECTION_IDS
    .filter(id => inspectedObjectIds.has(id)).length;
  const inspectedRatio = inspectedRequiredCount / Math.max(1, MUMMIFICATION_CHAMBER_REQUIRED_INSPECTION_IDS.length);
  const ritualStep = current.mummificationChamberRitualStep || 0;
  const ritualRatio = ritualStep / Math.max(1, MUMMIFICATION_CHAMBER_RITUAL_SEQUENCE.length);
  const solved = Boolean(current.mummificationChamberPuzzleSolved || current.mummificationChamberExitUnlocked);
  const rawProgress = 0.12 + inspectedRatio * 0.24 + ritualRatio * 0.58;
  const wakeProgress = solved ? 1 : clamp(rawProgress, 0.12, 0.92);
  // A careless or wrong action briefly "stirs" the chamber: flames flare, the
  // room flashes darker, the seal pulses. Decays in the step loop.
  const disturbance = clamp((current.mummificationChamberDisturbanceTimer || 0) / MUMMIFICATION_CHAMBER_DISTURBANCE_DURATION, 0, 1);

  return {
    wakeProgress,
    disturbance,
    state: solved ? 'solved' : ritualStep > 0 ? 'ritual-active' : inspectedRequiredCount > 0 ? 'awakening' : 'dormant',
    inspectedRequiredCount,
    inspectedRatio,
    glyphGlowAlpha: 0.08 + wakeProgress * 0.34,
    candleFlickerBoost: 0.78 + wakeProgress * 0.34 + disturbance * 0.55,
    linenMotion: 0.2 + wakeProgress * 0.9 + disturbance * 0.6,
    particleCount: Math.min(40, 6 + Math.round(wakeProgress * 24) + Math.round(disturbance * 10)),
    roomDimAlpha: 0.43 - wakeProgress * 0.27 + disturbance * 0.22,
    roomLightAlpha: 0.04 + wakeProgress * 0.28,
    sealGlowAlpha: (solved ? 0.66 : ritualStep > 0 ? 0.36 : 0.14 + inspectedRatio * 0.18) + disturbance * 0.3,
  };
};

// ---------------------------------------------------------------------------
// Mummification Chamber — physical rite interactables (Journey Room Interact)
// ---------------------------------------------------------------------------
// The five rites keep their order via mummificationChamberRitualStep (0..5,
// indexed by MUMMIFICATION_RITE_SEQUENCE). Each rite exposes in-world sub-objects
// the player handles directly: inspect / pick up / carry / place / hold-apply /
// hold-wrap / restore. hitbox.x is screen-space (cameraX is added at runtime);
// hitbox.y is world-y. The standing player's body hitbox sits ~y514..552 in the
// fixed chamber camera, so rite hitboxes reach down into that band.
export const MUMMIFICATION_ROOM_INTERACT_VERSION = 'mummification-room-interact-system-2026-06-05';
export const MUMMIFICATION_HOLD_DURATIONS = Object.freeze({ apply: 1.5, wrap: 1.8 });
// Cold, judgement-only Anubis — used sparingly when the player keeps disturbing
// the chamber. Never friendly, never explains the larger mystery.
export const MUMMIFICATION_ANUBIS_WARNINGS = Object.freeze([
  'One careless hand can undo centuries.',
  'The dead do not forgive the careless.',
  'A name scratched from stone is not silence. It is a wound.',
]);
// Four Sons of Horus — jar symbol/colour matched to a scrambled plinth set.
export const MUMMIFICATION_JAR_SYMBOLS = Object.freeze({
  imsety: { glyph: 'I', color: '#d6b06a', label: 'Imsety' },
  hapi: { glyph: 'H', color: '#7c9bd1', label: 'Hapi' },
  duamutef: { glyph: 'D', color: '#c98a4b', label: 'Duamutef' },
  qebehsenuef: { glyph: 'Q', color: '#8fb98a', label: 'Qebehsenuef' },
});
export const MUMMIFICATION_CHAMBER_RITES = Object.freeze([
  {
    rite: 'cleanse',
    objects: [
      { id: 'cleanse-table', role: 'inspect', verb: JOURNEY_INTERACT_VERBS.INSPECT, prompt: 'E Inspect',
        label: 'Embalming table', message: 'The body is washed with care. The crossing begins in silence.',
        screen: { x: 560, y: 332, width: 150, height: 60 }, hitbox: { x: 470, y: 440, width: 200, height: 132 } },
      { id: 'cleanse-bowl-left', role: 'activate', verb: JOURNEY_INTERACT_VERBS.INSPECT, prompt: 'E Cleanse',
        label: 'Purification bowl', message: 'The water is poured. The chamber listens.',
        screen: { x: 360, y: 508, width: 56, height: 40 }, hitbox: { x: 304, y: 482, width: 112, height: 90 } },
      { id: 'cleanse-bowl-right', role: 'activate', verb: JOURNEY_INTERACT_VERBS.INSPECT, prompt: 'E Cleanse',
        label: 'Purification bowl', message: 'The second bowl is emptied. Stillness gathers.',
        screen: { x: 760, y: 508, width: 56, height: 40 }, hitbox: { x: 704, y: 482, width: 112, height: 90 } },
    ],
    // Rite is complete once the table is inspected and both bowls are activated.
    requires: ['cleanse-table', 'cleanse-bowl-left', 'cleanse-bowl-right'],
    actionHint: 'Inspect the table, then ready both bowls.',
    completeNotice: 'The chamber grows still.',
    completeLine: 'Cleansed. Nothing careless may follow.',
  },
  {
    rite: 'jars',
    objects: [
      { id: 'jar-imsety', role: 'source', verb: JOURNEY_INTERACT_VERBS.PICK_UP, prompt: 'E Pick up', symbol: 'imsety',
        label: 'Imsety jar', screen: { x: 150, y: 500, width: 48, height: 64 }, hitbox: { x: 108, y: 470, width: 100, height: 102 } },
      { id: 'jar-hapi', role: 'source', verb: JOURNEY_INTERACT_VERBS.PICK_UP, prompt: 'E Pick up', symbol: 'hapi',
        label: 'Hapi jar', screen: { x: 268, y: 500, width: 48, height: 64 }, hitbox: { x: 226, y: 470, width: 100, height: 102 } },
      { id: 'jar-duamutef', role: 'source', verb: JOURNEY_INTERACT_VERBS.PICK_UP, prompt: 'E Pick up', symbol: 'duamutef',
        label: 'Duamutef jar', screen: { x: 386, y: 500, width: 48, height: 64 }, hitbox: { x: 344, y: 470, width: 100, height: 102 } },
      { id: 'jar-qebehsenuef', role: 'source', verb: JOURNEY_INTERACT_VERBS.PICK_UP, prompt: 'E Pick up', symbol: 'qebehsenuef',
        label: 'Qebehsenuef jar', screen: { x: 504, y: 500, width: 48, height: 64 }, hitbox: { x: 462, y: 470, width: 100, height: 102 } },
      { id: 'plinth-a', role: 'target', verb: JOURNEY_INTERACT_VERBS.PLACE, prompt: 'E Place', symbol: 'duamutef', acceptsItemId: 'jar-duamutef',
        label: 'Plinth', screen: { x: 640, y: 512, width: 66, height: 58 }, hitbox: { x: 600, y: 480, width: 100, height: 92 } },
      { id: 'plinth-b', role: 'target', verb: JOURNEY_INTERACT_VERBS.PLACE, prompt: 'E Place', symbol: 'imsety', acceptsItemId: 'jar-imsety',
        label: 'Plinth', screen: { x: 760, y: 512, width: 66, height: 58 }, hitbox: { x: 720, y: 480, width: 100, height: 92 } },
      { id: 'plinth-c', role: 'target', verb: JOURNEY_INTERACT_VERBS.PLACE, prompt: 'E Place', symbol: 'qebehsenuef', acceptsItemId: 'jar-qebehsenuef',
        label: 'Plinth', screen: { x: 880, y: 512, width: 66, height: 58 }, hitbox: { x: 840, y: 480, width: 100, height: 92 } },
      { id: 'plinth-d', role: 'target', verb: JOURNEY_INTERACT_VERBS.PLACE, prompt: 'E Place', symbol: 'hapi', acceptsItemId: 'jar-hapi',
        label: 'Plinth', screen: { x: 1000, y: 512, width: 66, height: 58 }, hitbox: { x: 960, y: 480, width: 100, height: 92 } },
    ],
    requires: ['plinth-a', 'plinth-b', 'plinth-c', 'plinth-d'],
    actionHint: 'Carry each jar to the plinth with its matching symbol.',
    wrongTargetNotice: 'That jar does not belong here. Match the symbol to the plinth.',
    completeNotice: 'The jars settle into silence.',
    completeLine: 'Each one safekept. Nothing of them is lost.',
  },
  {
    rite: 'oils',
    objects: [
      { id: 'oil-common', role: 'source', verb: JOURNEY_INTERACT_VERBS.PICK_UP, prompt: 'E Pick up', oilTone: 'thin',
        label: 'Thin oil', wrongMessage: 'The flame recoils. This is not the sacred resin.',
        screen: { x: 700, y: 504, width: 48, height: 54 }, hitbox: { x: 656, y: 474, width: 88, height: 98 } },
      { id: 'oil-bitter', role: 'source', verb: JOURNEY_INTERACT_VERBS.PICK_UP, prompt: 'E Pick up', oilTone: 'bitter',
        label: 'Bitter resin', wrongMessage: 'The scent turns bitter. The chamber stirs.',
        screen: { x: 808, y: 504, width: 48, height: 54 }, hitbox: { x: 764, y: 474, width: 88, height: 98 } },
      { id: 'oil-sacred', role: 'source', verb: JOURNEY_INTERACT_VERBS.PICK_UP, prompt: 'E Pick up', sacred: true, oilTone: 'sacred',
        label: 'Sacred resin', screen: { x: 916, y: 504, width: 48, height: 54 }, hitbox: { x: 872, y: 474, width: 88, height: 98 } },
      { id: 'oils-apply-table', role: 'apply', verb: JOURNEY_INTERACT_VERBS.HOLD_APPLY, prompt: 'Hold E Apply',
        acceptsItemId: 'oil-sacred', holdKey: 'apply',
        label: 'Embalming table', screen: { x: 560, y: 332, width: 150, height: 60 }, hitbox: { x: 470, y: 440, width: 200, height: 132 } },
    ],
    requires: ['oils-apply-table'],
    actionHint: 'One vessel calms the room. The others do not.',
    wrongTargetNotice: 'This oil is not the sacred resin. The seal does not trust it.',
    completeNotice: 'The air settles. The scent of resin rises from the stone.',
    completeLine: 'Anointed. The crossing is honoured.',
  },
  {
    rite: 'linen',
    objects: [
      { id: 'linen-roll', role: 'source', verb: JOURNEY_INTERACT_VERBS.PICK_UP, prompt: 'E Pick up',
        label: 'Linen', screen: { x: 320, y: 500, width: 60, height: 56 }, hitbox: { x: 262, y: 466, width: 116, height: 106 } },
      { id: 'linen-wrap-table', role: 'wrap', verb: JOURNEY_INTERACT_VERBS.HOLD_WRAP, prompt: 'Hold E Wrap',
        acceptsItemId: 'linen-roll', holdKey: 'wrap',
        label: 'Embalming table', screen: { x: 560, y: 332, width: 150, height: 60 }, hitbox: { x: 470, y: 440, width: 200, height: 132 } },
    ],
    requires: ['linen-wrap-table'],
    actionHint: 'Hold E at the table to wrap — stay still or the linen slips.',
    slipNotice: 'The linen slips. One careless hand can undo centuries. Begin the wrap again.',
    completeNotice: 'The linen settles, smooth and patient under careful hands.',
    completeLine: 'Wrapped. Held together, not hidden away.',
  },
  {
    rite: 'name',
    // The damaged name is restored from three scratched glyph fragments, each
    // returned to its slot on the tablet (left to right). Wrong slot = the
    // chamber stirs, but nothing already restored is lost.
    objects: [
      { id: 'name-frag-1', role: 'source', verb: JOURNEY_INTERACT_VERBS.PICK_UP, prompt: 'E Pick up', fragMark: 'I',
        label: 'first glyph', screen: { x: 170, y: 502, width: 40, height: 50 }, hitbox: { x: 128, y: 472, width: 92, height: 100 } },
      { id: 'name-frag-2', role: 'source', verb: JOURNEY_INTERACT_VERBS.PICK_UP, prompt: 'E Pick up', fragMark: 'II',
        label: 'second glyph', screen: { x: 290, y: 502, width: 40, height: 50 }, hitbox: { x: 248, y: 472, width: 92, height: 100 } },
      { id: 'name-frag-3', role: 'source', verb: JOURNEY_INTERACT_VERBS.PICK_UP, prompt: 'E Pick up', fragMark: 'III',
        label: 'third glyph', screen: { x: 410, y: 502, width: 40, height: 50 }, hitbox: { x: 368, y: 472, width: 92, height: 100 } },
      { id: 'name-slot-1', role: 'restore', verb: JOURNEY_INTERACT_VERBS.RESTORE, prompt: 'E Restore', fragMark: 'I', acceptsItemId: 'name-frag-1',
        label: 'tablet mark', screen: { x: 720, y: 470, width: 46, height: 60 }, hitbox: { x: 680, y: 446, width: 84, height: 126 } },
      { id: 'name-slot-2', role: 'restore', verb: JOURNEY_INTERACT_VERBS.RESTORE, prompt: 'E Restore', fragMark: 'II', acceptsItemId: 'name-frag-2',
        label: 'tablet mark', screen: { x: 824, y: 470, width: 46, height: 60 }, hitbox: { x: 784, y: 446, width: 84, height: 126 } },
      { id: 'name-slot-3', role: 'restore', verb: JOURNEY_INTERACT_VERBS.RESTORE, prompt: 'E Restore', fragMark: 'III', acceptsItemId: 'name-frag-3',
        label: 'tablet mark', screen: { x: 928, y: 470, width: 46, height: 60 }, hitbox: { x: 888, y: 446, width: 84, height: 126 } },
    ],
    requires: ['name-slot-1', 'name-slot-2', 'name-slot-3'],
    actionHint: 'The name was scratched away. Set each mark back in its place.',
    introLine: 'This name was not worn by time. It was scratched out by hand.',
    wrongTargetNotice: 'The mark refuses this place. The chamber stirs.',
    completeNotice: 'The scratched mark glows. The seal opens.',
    completeLine: 'The name is set right. Anubis says nothing.',
  },
]);
export const MUMMIFICATION_CHAMBER_RITE_OBJECTS = MUMMIFICATION_CHAMBER_RITES
  .flatMap(rite => rite.objects.map(object => ({ ...object, rite: rite.rite })));
export const getMummificationRiteByIndex = (step) => MUMMIFICATION_CHAMBER_RITES[step] || null;

export const createChamberDoorVisuals = ({
  TEMPLE_THRESHOLD_HALL_ENTRY_TRIGGER,
  TEMPLE_THRESHOLD_HALL_RETURN_FALLBACK,
  MUMMIFICATION_CHAMBER_ENTRY_TRIGGER,
  MUMMIFICATION_CHAMBER_RETURN_FALLBACK,
  FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER,
  FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK,
  SCRIBE_CHAMBER_ENTRY_TRIGGER,
  SCRIBE_CHAMBER_RETURN_FALLBACK,
}) => Object.freeze([
  {
    id: 'temple-threshold-hall-entry-door',
    roomId: JOURNEY_EXTERIOR_SCENE_ID,
    trigger: TEMPLE_THRESHOLD_HALL_ENTRY_TRIGGER,
    returnFallback: TEMPLE_THRESHOLD_HALL_RETURN_FALLBACK,
    preserveTriggerBounds: true,
    useReturnFallbackPosition: true,
    title: 'Threshold Hall',
    prompt: 'E Enter',
    seal: 'scarab',
    accent: '#d97706',
    glow: '#facc15',
    width: 150,
    height: 214,
    yOffset: -18,
    slabInset: 0.5,
    dust: false,
    renderDoorVisual: false,
  },
  {
    id: 'mummification-chamber-entry-door',
    roomId: JOURNEY_EXTERIOR_SCENE_ID,
    routeId: 'mummification-chamber-route',
    entryPlatformId: 'mummification-chamber-doorway-floor',
    trigger: MUMMIFICATION_CHAMBER_ENTRY_TRIGGER,
    returnFallback: MUMMIFICATION_CHAMBER_RETURN_FALLBACK,
    title: 'Ritual Chamber',
    prompt: 'E Enter',
    seal: 'ankh',
    accent: '#facc15',
    glow: '#fbbf24',
    width: 164,
    height: 232,
    yOffset: -16,
    slabInset: 0.52,
    dust: true,
  },
  {
    id: 'forgotten-mural-entry-door',
    roomId: JOURNEY_EXTERIOR_SCENE_ID,
    routeId: 'desert-upper-survey-route',
    entryPlatformId: 'forgotten-mural-upper-doorway-floor',
    trigger: FORGOTTEN_MURAL_CHAMBER_ENTRY_TRIGGER,
    returnFallback: FORGOTTEN_MURAL_CHAMBER_RETURN_FALLBACK,
    title: 'Mural Doorway',
    prompt: 'Inspect Door',
    seal: 'scarab',
    accent: '#38bdf8',
    glow: '#5eead4',
    width: 142,
    height: 204,
    yOffset: -8,
    slabInset: 0.48,
    dust: true,
  },
  {
    id: 'scribe-chamber-entry-door',
    roomId: JOURNEY_EXTERIOR_SCENE_ID,
    routeId: 'scribe-locked-chamber-route',
    entryPlatformId: 'scribe-chamber-doorway-threshold',
    trigger: SCRIBE_CHAMBER_ENTRY_TRIGGER,
    returnFallback: SCRIBE_CHAMBER_RETURN_FALLBACK,
    preserveTriggerBounds: true,
    useReturnFallbackPosition: true,
    title: 'Scribe Door',
    prompt: 'E Enter',
    seal: 'ankh',
    accent: '#f59e0b',
    glow: '#fde68a',
    width: 132,
    height: 188,
    yOffset: -6,
    slabInset: 0.5,
    dust: false,
  },
]);

export const createChamberDoorVisualsById = (doors) => Object.freeze(
  Object.fromEntries(doors.map(door => [door.id, door])),
);
