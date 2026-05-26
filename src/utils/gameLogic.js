import * as data from '../data.js';

export const {
  CATEGORIES,
  RANDOM_EVENTS,
  SCENARIOS,
  RED_HERRINGS,
  BUREAU_CASES = [],
  BUREAU_COMPARISON_DATA = [],
  BUREAU_RESEARCH_FOCUS = {},
  getCategoryTitle,
  getArtifactEraLabel,
} = data;

/**
 * Resolves an asset path by prepending the application's BASE_URL.
 * This ensures images load correctly regardless of the hosting environment
 * (e.g., local dev vs. GitHub Pages sub-directories).
 */
export const resolveAssetPath = (path) => {
  if (!path) return '';
  // import.meta.env.BASE_URL is provided by Vite
  const base = import.meta.env.BASE_URL || '/';
  // Ensure we don't double up slashes or miss them
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
};

const EVIDENCE_FALLBACK_IMAGES = {
  eg: 'museum/egypt_generic.svg',
  mg: 'museum/mungo_generic.svg',
  rm: 'museum/roman_generic.jpg',
  ch: 'museum/china_generic.svg',
  rh: 'museum/modern_generic.svg',
  default: 'museum/modern_generic.svg',
};

const EVIDENCE_IMAGE_OVERRIDES = {
  mg_2: 'museum/mungo_grinding_stone.jpg',
  mg_3: 'museum/mungo_ochre_rock_art.jpg',
  mg_4: 'museum/mungo_man.jpg',
  mg_5: 'museum/mungo_cremated_human_remains.jpg',
  mg_6: 'museum/mungo_megafauna_bone.jpg',
  mg_7: 'museum/mungo_ancient_hearth.jpg',
  mg_8: 'museum/mungo_footprints.png',
  mg_9: 'museum/mungo_fish_trap.jpg',
  mg_10: 'museum/mungo_shell_midden.jpg',
  mg_11: 'museum/mungo_emu_egg.jpg',
  mg_12: 'museum/mungo_sediment_core.jpg',
  mg_13: 'museum/mungo_hand_stencil.jpg',
  mg_14: 'museum/mungo_boab_nut.png',
  mg_15: 'museum/mungo_stone_arrangement.jpg',
};

export const getEvidenceImagePath = (artifact) => {
  if (artifact?.image) return resolveAssetPath(artifact.image);
  if (artifact?.id && EVIDENCE_IMAGE_OVERRIDES[artifact.id]) {
    return resolveAssetPath(EVIDENCE_IMAGE_OVERRIDES[artifact.id]);
  }
  const prefix = String(artifact?.id || '').split('_')[0];
  const fallback = EVIDENCE_FALLBACK_IMAGES[prefix] || EVIDENCE_FALLBACK_IMAGES.default;
  return resolveAssetPath(fallback);
};

export const BUREAU_CASES_BY_ID = new Map(BUREAU_CASES.map(item => [item.id, item]));
export const BUREAU_CIVILISATIONS = [...new Set(BUREAU_CASES.map(item => item.civilisation))];

const FIRST_BUREAU_CIVILISATION = 'Ancient Egypt';
const TRAINING_GRID_TILE_COUNT = 16;
const TRAINING_ARTIFACT_INDEX = 10;
const TRAINING_ARTIFACT_NEIGHBORS = new Set([5, 6, 7, 9, 11, 13, 14, 15]);

export const createDefaultTrainingGridTiles = () => (
  Array.from({ length: TRAINING_GRID_TILE_COUNT }, (_, index) => ({
    id: index,
    isRevealed: false,
    isMarked: false,
    isArtifact: index === TRAINING_ARTIFACT_INDEX,
    adjacentCount: TRAINING_ARTIFACT_NEIGHBORS.has(index) ? 1 : 0,
  }))
);

export const createDefaultTrainingState = () => ({
  currentStepIndex: 0,
  isSurveyed: false,
  isGridded: false,
  gridTiles: createDefaultTrainingGridTiles(),
  artifactExtracted: false,
  mappedCoordinate: null,
  labHypothesis: null,
});

export const normalizeTrainingState = (state) => {
  const defaults = createDefaultTrainingState();
  if (!state || typeof state !== 'object') return defaults;

  const currentStepIndex = Number.isInteger(state.currentStepIndex)
    ? Math.min(Math.max(state.currentStepIndex, 0), TRAINING_STAGES.length)
    : defaults.currentStepIndex;
  const gridTiles = Array.isArray(state.gridTiles) && state.gridTiles.length === TRAINING_GRID_TILE_COUNT
    ? defaults.gridTiles.map((defaultTile, index) => ({
        ...defaultTile,
        isRevealed: Boolean(state.gridTiles[index]?.isRevealed),
        isMarked: Boolean(state.gridTiles[index]?.isMarked),
      }))
    : defaults.gridTiles;

  return {
    currentStepIndex,
    isSurveyed: Boolean(state.isSurveyed),
    isGridded: Boolean(state.isGridded),
    gridTiles,
    artifactExtracted: Boolean(state.artifactExtracted),
    mappedCoordinate: typeof state.mappedCoordinate === 'string' ? state.mappedCoordinate : null,
    labHypothesis: typeof state.labHypothesis === 'string' ? state.labHypothesis : null,
  };
};

const shuffleItems = (items) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

export const createBureauCaseOrder = () => {
  const firstCase = BUREAU_CASES.find(item => item.civilisation === FIRST_BUREAU_CIVILISATION) || BUREAU_CASES[0];
  const trainingCases = BUREAU_CASES.filter(item => item.round === 'training' && item.id !== firstCase?.id);
  const challengeCases = BUREAU_CASES.filter(item => item.round !== 'training' && item.id !== firstCase?.id);

  return [
    firstCase,
    ...shuffleItems(trainingCases),
    ...shuffleItems(challengeCases),
  ].filter(Boolean).map(item => item.id);
};

export const getBureauCasesForSession = (bureauState = {}) => {
  const caseOrder = Array.isArray(bureauState.caseOrder) ? bureauState.caseOrder : [];
  if (caseOrder.length === 0) return BUREAU_CASES;

  const orderedCases = caseOrder.map(id => BUREAU_CASES_BY_ID.get(id)).filter(Boolean);
  const orderedIds = new Set(orderedCases.map(item => item.id));
  const missingCases = BUREAU_CASES.filter(item => !orderedIds.has(item.id));

  return [...orderedCases, ...missingCases];
};

export const AUTOSAVE_KEY = 'archaeologyDigApp.autosave.v1';
export const AUTOSAVE_VERSION = 1;
export const SAVE_APP_ID = 'archaeology-dig-app';

export const TRAINING_STAGES = [
  { id: 'survey', title: 'Survey', purpose: 'Find a possible site' },
  { id: 'grid', title: 'Grid', purpose: 'Mark out the site so locations can be recorded' },
  { id: 'excavate', title: 'Excavate', purpose: 'Carefully uncover evidence' },
  { id: 'map', title: 'Map', purpose: 'Record where each find was discovered' },
  { id: 'lab', title: 'Lab', purpose: 'Analyse the finds to work out what they mean' },
];

export const ARTIFACT_THEME_MAP = {
  objects: { accent: '#f59e0b', accentSoft: 'rgba(245, 158, 11, 0.18)', label: 'Artifact' },
  remains: { accent: '#a855f7', accentSoft: 'rgba(168, 85, 247, 0.18)', label: 'Remains' },
  structures: { accent: '#14b8a6', accentSoft: 'rgba(20, 184, 166, 0.18)', label: 'Structure' },
  environment: { accent: '#84cc16', accentSoft: 'rgba(132, 204, 22, 0.18)', label: 'Ecofact' },
  written: { accent: '#60a5fa', accentSoft: 'rgba(96, 165, 250, 0.18)', label: 'Text / Symbol' },
  default: { accent: '#e89e5d', accentSoft: 'rgba(232, 158, 93, 0.18)', label: 'Find' },
};

export const LAB_ANALYSIS_PROMPTS = [
  { id: 'daily-life', iconId: 'daily-life', title: 'Daily life', description: 'How people lived, worked or ate' },
  { id: 'beliefs', iconId: 'beliefs', title: 'Beliefs', description: 'Religion, burial or afterlife ideas' },
  { id: 'technology', iconId: 'technology', title: 'Technology', description: 'Tools, building or materials' },
  { id: 'environment', iconId: 'environment', title: 'Environment', description: 'Climate, plants, animals or natural conditions' },
  { id: 'society', iconId: 'society', title: 'Power and society', description: 'Rules, status, wealth or leadership' },
];

const LAB_FOCUS_BY_ARTIFACT_ID = {
  eg_1: 'beliefs',
  eg_2: 'beliefs',
  eg_3: 'daily-life',
  eg_4: 'beliefs',
  eg_5: 'beliefs',
  eg_6: 'daily-life',
  eg_7: 'technology',
  eg_8: 'technology',
  eg_9: 'beliefs',
  eg_10: 'environment',
  eg_11: 'environment',
  eg_12: 'environment',
  eg_13: 'society',
  eg_14: 'society',
  eg_15: 'daily-life',
  mg_1: 'technology',
  mg_2: 'daily-life',
  mg_3: 'beliefs',
  mg_4: 'beliefs',
  mg_5: 'beliefs',
  mg_6: 'environment',
  mg_7: 'daily-life',
  mg_8: 'daily-life',
  mg_9: 'technology',
  mg_10: 'daily-life',
  mg_11: 'daily-life',
  mg_12: 'environment',
  mg_13: 'beliefs',
  mg_14: 'beliefs',
  mg_15: 'beliefs',
  rm_1: 'society',
  rm_2: 'technology',
  rm_3: 'technology',
  rm_4: 'society',
  rm_5: 'beliefs',
  rm_6: 'environment',
  rm_7: 'technology',
  rm_8: 'technology',
  rm_9: 'society',
  rm_10: 'environment',
  rm_11: 'daily-life',
  rm_12: 'daily-life',
  rm_13: 'daily-life',
  rm_14: 'society',
  rm_15: 'society',
  ch_1: 'beliefs',
  ch_2: 'beliefs',
  ch_3: 'beliefs',
  ch_4: 'beliefs',
  ch_5: 'technology',
  ch_6: 'society',
  ch_7: 'society',
  ch_8: 'technology',
  ch_9: 'technology',
  ch_10: 'environment',
  ch_11: 'environment',
  ch_12: 'environment',
  ch_13: 'beliefs',
  ch_14: 'society',
  ch_15: 'society',
  rh_1: 'daily-life',
  rh_2: 'environment',
  rh_3: 'daily-life',
};

const getPromptTitleById = (promptId) => (
  LAB_ANALYSIS_PROMPTS.find(prompt => prompt.id === promptId)?.title || promptId
);

export const LAB_NOTE_STEMS = [
  'This find suggests...',
  'The clue that supports this is...',
  'This helps historians understand...',
];

const OBSERVATION_LEADS = {
  objects: 'This object shows',
  remains: 'The evidence shows',
  structures: 'This structure shows',
  environment: 'The evidence shows',
  written: 'This source shows',
  default: 'This find shows',
};

const lowerCaseFirstWord = (text = '') => {
  if (!text) return '';
  return text.charAt(0).toLowerCase() + text.slice(1);
};

export const getObservableLabResult = (artifact = {}) => {
  if (artifact.labResult) return artifact.labResult;

  const clue = String(artifact.clue || '').trim();
  if (!clue) {
    return 'This find has visible features that can be recorded and used as evidence.';
  }

  const lead = OBSERVATION_LEADS[artifact.type] || OBSERVATION_LEADS.default;
  const observation = lowerCaseFirstWord(clue).replace(/[.!?]+$/, '');
  return `${lead} ${observation}. Record its visible features as evidence.`;
};

export const getLabAnswerFeedback = (artifact = {}, selectedAnswerIndex = null) => {
  if (typeof selectedAnswerIndex !== 'number') return null;

  const isCorrect = selectedAnswerIndex === artifact.correct;
  if (isCorrect) {
    return {
      isCorrect: true,
      title: 'Meaning confirmed',
      message: artifact.rationale || 'This answer best matches the evidence clue.',
    };
  }

  const clue = String(artifact.clue || '').trim();
  return {
    isCorrect: false,
    title: 'Check the clue again',
    message: clue
      ? `The clue says: "${clue}" Choose the answer that best explains that evidence.`
      : 'Look again at the visible evidence and choose the answer it supports most strongly.',
  };
};

export const getLabFocusId = (artifact = {}) => {
  if (artifact.labFocusId) return artifact.labFocusId;
  if (artifact.id && LAB_FOCUS_BY_ARTIFACT_ID[artifact.id]) return LAB_FOCUS_BY_ARTIFACT_ID[artifact.id];

  const correctAnswer = artifact.options?.[artifact.correct] || '';
  const evidenceText = [
    artifact.question,
    correctAnswer,
    artifact.rationale,
    artifact.clue,
    artifact.labResult,
  ].join(' ').toLowerCase();

  if (/(belief|relig|ritual|burial|afterlife|sacred|ceremon|spiritual|prophecy|ancestor|magic|death|tomb)/.test(evidenceText)) {
    return 'beliefs';
  }
  if (/(climate|plant|animal|natural|river|flood|silt|seed|grain|environment|landscape|lake|ash layer|weather)/.test(evidenceText)) {
    return 'environment';
  }
  if (/(tool|build|building|engineering|material|construction|technology|production|kiln|heating|metal|stone block|foundation)/.test(evidenceText)) {
    return 'technology';
  }
  if (/(power|status|wealth|leader|ruler|emperor|government|rule|labour|organised|trade network|official|public|politic)/.test(evidenceText)) {
    return 'society';
  }
  return 'daily-life';
};

export const getLabFocusFeedback = (artifact = {}, selectedFocusId = null) => {
  if (!selectedFocusId) return null;

  const correctFocusId = getLabFocusId(artifact);
  const selectedTitle = getPromptTitleById(selectedFocusId);
  const correctTitle = getPromptTitleById(correctFocusId);
  const isCorrect = selectedFocusId === correctFocusId;

  return {
    correctFocusId,
    isCorrect,
    title: isCorrect ? 'Focus confirmed' : 'Try another focus',
    message: isCorrect
      ? `${correctTitle} is the strongest focus for this evidence.`
      : `This evidence fits ${correctTitle} more strongly than ${selectedTitle}.`,
  };
};

export const getCurationAnalysisSummary = (analysis = null, artifact = {}) => {
  if (!analysis || typeof analysis !== 'object') return null;

  const correctAnswerText = artifact.options?.[artifact.correct] || analysis.answerText || '';
  const selectedAnswerText = analysis.answerText || correctAnswerText;

  return {
    correctAnswerText,
    selectedAnswerText,
    answerIsCorrect: analysis.answerIsCorrect !== false,
    promptTitle: analysis.promptTitle || '',
    note: analysis.note || '',
  };
};

const PEOPLE_LABEL_BY_CIVILISATION = {
  'Ancient Egypt': 'Ancient Egyptians',
  'Ancient Rome': 'Romans',
  'Ancient China': 'people in Ancient China',
  'Indigenous Australia (Lake Mungo)': 'people at Lake Mungo',
};

export const getMuseumDisplayLabelPrompt = (artifact = {}) => {
  const civilisation = getArtifactEraLabel(artifact);
  const peopleLabel = PEOPLE_LABEL_BY_CIVILISATION[civilisation] || 'people in the past';

  return {
    label: 'Museum Display Label',
    helper: `Write a museum display label explaining what this find tells us about ${peopleLabel}. Use the lab result and correct answer as evidence.`,
    placeholder: 'This find tells us that...',
  };
};

export const getArtifactHash = (input = '') => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const getArtifactTheme = (artifact) => {
  const base = ARTIFACT_THEME_MAP[artifact?.type] ?? ARTIFACT_THEME_MAP.default;
  const hash = getArtifactHash(artifact?.id ?? artifact?.name ?? 'artifact');
  const shade = (hash % 18) - 9;
  return {
    accent: base.accent,
    accentSoft: base.accentSoft,
    label: artifact?.isRedHerring ? 'Modern Find' : base.label,
    shimmer: `hsl(${(hash % 360)} 78% ${58 + shade / 4}%)`,
    panel: `hsl(${(hash % 360)} 32% ${18 + shade / 5}%)`,
    panel2: `hsl(${(hash % 360)} 28% ${12 + shade / 6}%)`,
  };
};

export const getFirstSentence = (text = '') => {
  const trimmed = String(text).trim();
  if (!trimmed) return '';
  const match = trimmed.match(/^(.+?[.!?])(?:\s|$)/);
  return (match?.[1] ?? trimmed).trim();
};

export const lowercaseFirstLetter = (text = '') => {
  if (!text) return '';
  return text.charAt(0).toLowerCase() + text.slice(1);
};

export const SORT_HINTS = {
  objects: {
    first: 'This looks like something people deliberately made and could pick up. What does that tell you about it?',
    repeat: 'Look again at the clue. What does the shape, material or use tell you about what people made it for?',
  },
  remains: {
    first: 'This evidence comes from a person or animal body. What clue in the find points you toward health, burial or care?',
    repeat: 'Look again at the clue. What part of a body or burial does this evidence point to?',
  },
  structures: {
    first: 'This looks like part of a built place rather than a loose item. What does that suggest?',
    repeat: 'Look again at the clue. Is this a small object, or part of a larger place people built?',
  },
  environment: {
    first: 'This clue comes from the natural world around the site. What does that tell you to pay attention to?',
    repeat: 'Look again at the clue. Does this come from plants, animals, mud, shells, or another natural trace?',
  },
  written: {
    first: 'Look at the marks on the surface. Are they decoration, or are they trying to communicate something?',
    repeat: 'Look again at the clue. Do the marks on this evidence record or communicate information?',
  },
};

export const getSortingHint = (artifact, attemptCount = 0) => {
  const hintSet = SORT_HINTS[artifact?.type] ?? SORT_HINTS.objects;
  const hint = attemptCount > 0 ? hintSet.repeat : hintSet.first;
  return `Not quite yet. ${hint} Try again.`;
};

export const getSortingSuccessMessage = (artifact, categoryId) => {
  const categoryTitle = getCategoryTitle(categoryId);
  const explanation = lowercaseFirstLetter(getFirstSentence(artifact?.rationale))
    || lowercaseFirstLetter(artifact?.clue)
    || 'it gives useful evidence about the past';
  return `Correct. ${artifact.name} fits ${categoryTitle} because ${explanation}`;
};

export const shuffleArrayWithSeed = (items, seedSource) => {
  const next = [...items];
  
  const hashStringToSeed = (value) => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  let seed = hashStringToSeed(seedSource);

  const seededRandom = () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(seededRandom() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

export const createDigTiles = (activeArtifacts, excavatedIds) => {
  const pairs = [...activeArtifacts, ...activeArtifacts].map((artifact, index) => ({
    uniqueId: `${artifact.id}-${index}`,
    artifactId: artifact.id,
    artifact,
    isFlipped: excavatedIds.has(artifact.id),
    isMatched: excavatedIds.has(artifact.id),
  }));

  for (let i = pairs.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  return pairs;
};

export const getDigBoardColumns = (tileCount) => {
  if (tileCount >= 22) return 8;
  if (tileCount >= 18) return 6;
  if (tileCount >= 10) return 5;
  return Math.max(2, Math.ceil(Math.sqrt(Math.max(tileCount, 1))));
};
export const allArtifactsById = () => {
  const artifacts = SCENARIOS.flatMap(scenario => scenario.evidence || []);
  return new Map([...artifacts, ...RED_HERRINGS].map(item => [item.id, item]));
};

export const createInitialBureauEvidenceFilter = () => (
  BUREAU_CIVILISATIONS.reduce((acc, civilisation) => {
    acc[civilisation] = 'unsure';
    return acc;
  }, {})
);

const getBureauProfileFactsForClue = (bureauCase, clueType = '') => {
  const facts = bureauCase?.profileFacts?.[clueType];
  if (Array.isArray(facts)) return facts.filter(Boolean);
  if (facts) return [facts];
  return [];
};

const getBureauAllProfileFacts = (bureauCase = null) => {
  if (!bureauCase) {
    return [];
  }

  return Object.entries(bureauCase.profileFacts || {}).flatMap(([clueType, facts]) => (
    (facts || []).filter(Boolean).map(fact => ({
      civilisation: bureauCase.civilisation,
      clueType,
      fact,
    }))
  ));
};

export const getBureauEvidenceSentenceOptions = ({
  selectedCivilisation = '',
  selectedClueType = '',
  maxOptions = 4,
  seedSource = '',
} = {}) => {
  if (!selectedCivilisation || !selectedClueType) return [];

  const correctCase = BUREAU_CASES.find(item => item.civilisation === selectedCivilisation);
  const correctFacts = getBureauProfileFactsForClue(correctCase, selectedClueType);
  const correctFact = correctFacts[0];
  if (!correctFact) return [];

  const sameClueDistractors = BUREAU_CASES
    .filter(item => item.civilisation !== selectedCivilisation)
    .flatMap(item => getBureauProfileFactsForClue(item, selectedClueType)
      .map(fact => ({
        civilisation: item.civilisation,
        clueType: selectedClueType,
        fact,
      })));

  const fallbackDistractors = BUREAU_CASES
    .filter(item => item.civilisation !== selectedCivilisation)
    .flatMap(item => getBureauAllProfileFacts(item))
    .filter(option => option.fact !== correctFact);

  const seen = new Set();
  const uniqueDistractors = [...sameClueDistractors, ...fallbackDistractors].filter(option => {
    if (option.fact === correctFact || seen.has(option.fact)) return false;
    seen.add(option.fact);
    return true;
  });

  const pickedOptions = shuffleArrayWithSeed(
    [correctFact, ...uniqueDistractors.slice(0, Math.max(0, maxOptions - 1)).map(option => option.fact)],
    seedSource || `${selectedCivilisation}:${selectedClueType}`
  );

  return pickedOptions;
};

export const getBureauClaimValidationMessage = ({
  currentCase,
  selectedClaimCivilisation,
  selectedClaimClueType,
  selectedClaimEvidence,
  currentEvidenceText = [],
}) => {
  if (!currentCase) return '';

  const selectedProfile = BUREAU_CASES.find(item => item.civilisation === selectedClaimCivilisation);
  const revealedClueTypes = new Set(currentEvidenceText.map(item => item.label));
  const allProfileFacts = selectedProfile
    ? Object.values(selectedProfile.profileFacts || {}).flat().filter(Boolean)
    : [];
  const clueFacts = selectedProfile
    ? getBureauProfileFactsForClue(selectedProfile, selectedClaimClueType)
    : [];

  if (selectedClaimCivilisation !== currentCase.civilisation) {
    return 'That civilisation does not match the clues yet. Check the suspect profiles again.';
  }

  if (!revealedClueTypes.has(selectedClaimClueType)) {
    return 'That evidence does not match the clue type you selected.';
  }

  if (!allProfileFacts.includes(selectedClaimEvidence)) {
    return 'That profile fact does not belong to the civilisation you selected.';
  }

  if (!clueFacts.includes(selectedClaimEvidence)) {
    return 'Use a profile fact that supports the clue.';
  }

  return '';
};

export const createNewBureauSession = (startPhase = 'bureauBriefing', startCivilisation = null) => {
  const caseOrder = createBureauCaseOrder();
  const orderedCases = caseOrder.map(id => BUREAU_CASES_BY_ID.get(id)).filter(Boolean);
  let initialCaseIndex = 0;
  if (startCivilisation) {
    const foundIndex = orderedCases.findIndex(c => c.civilisation === startCivilisation);
    if (foundIndex >= 0) initialCaseIndex = foundIndex;
  }

  return {
    mode: 'bureau',
    phase: startPhase,
    score: 0,
    caseOrder,
    caseIndex: initialCaseIndex,
    currentTier: 1,
    evidenceFilter: createInitialBureauEvidenceFilter(),
    showEvidenceFilter: false,
    selectedAnswerIndex: null,
    selectedClaimCivilisation: '',
    selectedClaimClueType: '',
    selectedClaimEvidence: '',
    selectedLogAnswerIndex: null,
    selectedComparisonAnswerIndex: null,
    pendingCaseOutcome: null,
    caseResults: [],
    comparisonResults: [],
    comparisonResult: null,
    latestOutcome: null,
  };
};

export const createSavePayload = ({
  mode = 'archaeology',
  phase,
  currentScenario,
  currentEvent,
  activeArtifacts,
  excavatedIds,
  itemsLocation,
  hypotheses,
  siteName,
  finalConclusion,
  curatedItems,
  plaques,
  finalExhibitionStatement,
  trainingPlacements,
  trainingState,
  evidenceConditions,
  digRecoverySummary,
  bureauState,
}) => ({
  app: SAVE_APP_ID,
  version: AUTOSAVE_VERSION,
  saveVersion: AUTOSAVE_VERSION,
  savedAt: new Date().toISOString(),
  mode,
  phase: mode === 'bureau' ? (bureauState?.phase || phase) : phase,
  ...(mode === 'bureau' ? {
    bureauState,
  } : {
    currentScenarioId: currentScenario?.id,
    currentEventId: currentEvent?.id,
    activeArtifactIds: activeArtifacts.map(item => item.id),
    excavatedIds: Array.from(excavatedIds),
    itemsLocation,
    hypotheses,
    siteName,
    finalConclusion,
    curatedItems,
    plaques,
    finalExhibitionStatement,
    trainingPlacements,
    trainingState: normalizeTrainingState(trainingState),
    evidenceConditions,
    digRecoverySummary,
  }),
});

export const createNewGameSession = (mode = 'archaeology', phase = 'dig', preferredScenarioId = null) => {
  console.log('gameUtils: createNewGameSession', { mode, phase, preferredScenarioId });
  const scen = preferredScenarioId 
    ? SCENARIOS.find(s => s.id === preferredScenarioId)
    : SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];

  if (!scen || !scen.evidence) {
    console.error('Critical Error: No scenario or evidence found during initialization.');
    return null;
  }

  const evt = RANDOM_EVENTS && RANDOM_EVENTS.length > 0
    ? RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)]
    : { title: 'Emergency', time: 60 };

  const scenarioArtifacts = [...scen.evidence].sort(() => 0.5 - Math.random()).slice(0, 11);
  const selectedRedHerring = (RED_HERRINGS && RED_HERRINGS.length > 0)
    ? RED_HERRINGS[Math.floor(Math.random() * RED_HERRINGS.length)]
    : { id: 'fallback', name: 'Unknown Object', type: 'objects', options: ['Ancient', 'Modern'], correct: 1 };

  return {
    mode: 'archaeology',
    phase: phase,
    currentScenario: scen,
    currentEvent: evt,
    activeArtifacts: [...scenarioArtifacts, selectedRedHerring].sort(() => 0.5 - Math.random()),
    trainingPlacements: Array(TRAINING_STAGES.length).fill(null),
    trainingState: createDefaultTrainingState(),
    excavatedIds: new Set(),
    itemsLocation: {},
    hypotheses: {},
    siteName: scen.name || "Unknown Dig Site",
    finalConclusion: null,
    curatedItems: [],
    plaques: {},
    finalExhibitionStatement: '',
    evidenceConditions: {},
    digRecoverySummary: null,
  };
};

export const rebuildSavedSession = (saved) => {
  if (!saved || saved.app !== SAVE_APP_ID || saved.saveVersion !== AUTOSAVE_VERSION) {
    throw new Error('This is not a valid Archaeology Dig save file.');
  }

  if (saved.mode === 'bureau') {
    return {
      mode: 'bureau',
      phase: saved.phase || 'bureauBriefing',
      bureauState: {
        ...createNewBureauSession(saved.phase),
        ...(saved.bureauState || {}),
      },
      savedAt: saved.savedAt || null,
    };
  }

  const scenario = SCENARIOS.find(item => item.id === saved.currentScenarioId);
  const event = RANDOM_EVENTS.find(item => item.id === saved.currentEventId);
  const artifactsById = new Map(SCENARIOS.flatMap(s => s.evidence || []).concat(RED_HERRINGS).map(item => [item.id, item]));
  const artifacts = (saved.activeArtifactIds || [])
    .map(id => artifactsById.get(id))
    .filter(Boolean);

  if (!scenario || !event || artifacts.length === 0) {
    throw new Error('This save file is missing scenario or evidence data.');
  }

  return {
    mode: 'archaeology',
    phase: saved.phase || 'dig',
    currentScenario: scenario,
    currentEvent: event,
    activeArtifacts: artifacts,
    excavatedIds: new Set(saved.excavatedIds || []),
    itemsLocation: saved.itemsLocation || {},
    hypotheses: saved.hypotheses || {},
    siteName: saved.siteName || scenario.name || 'Unknown Dig Site',
    finalConclusion: saved.finalConclusion || null,
    curatedItems: saved.curatedItems || [],
    plaques: saved.plaques || {},
    finalExhibitionStatement: saved.finalExhibitionStatement || '',
    evidenceConditions: saved.evidenceConditions || {},
    digRecoverySummary: saved.digRecoverySummary || null,
    trainingPlacements: Array.from({ length: TRAINING_STAGES.length }, (_, index) => (
      Array.isArray(saved.trainingPlacements) ? saved.trainingPlacements[index] ?? null : null
    )),
    trainingState: normalizeTrainingState(saved.trainingState),
    savedAt: saved.savedAt || null,
  };
};

export const customCollisionDetection = () => {
  return null; 
};
