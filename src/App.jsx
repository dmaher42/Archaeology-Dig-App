import { useState, useEffect, useMemo, useReducer, useRef, useLayoutEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import * as data from './data';
import { 
  Pickaxe, Tent, Search, FileText, CheckCircle2, ChevronRight, Clock, Radar,
  AlertTriangle, RefreshCw, Library, Users, Skull, Landmark, Leaf,
  ScrollText, Package, ArrowRight, Lightbulb, HelpCircle, Archive, Save, Upload,
  MapPin, Beaker, Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './index.css';

// --- Advanced Audio Synthesis ---
let audioCtx = null;
const initAudio = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
};

const playFlip = () => {
  if (!audioCtx) return;
  // Dirt/brush sound: filtered noise
  const bufferSize = audioCtx.sampleRate * 0.15; 
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.8;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  noiseSource.start();
};

const playMatch = () => {
  if (!audioCtx) return;
  // Magical chime (major arpeggio)
  const playBell = (freq, startTime, vol) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.6);
  };
  const now = audioCtx.currentTime;
  playBell(523.25, now, 0.2); // C5
  playBell(659.25, now + 0.1, 0.2); // E5
  playBell(783.99, now + 0.2, 0.3); // G5
};

const playError = () => {
  if (!audioCtx) return;
  // Soft, low thud
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
};

const playWin = () => {
  if (!audioCtx) return;
  // Grand success arpeggio
  const playBell = (freq, startTime, duration) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };
  const now = audioCtx.currentTime;
  playBell(523.25, now, 0.8);       // C5
  playBell(659.25, now + 0.15, 0.8); // E5
  playBell(783.99, now + 0.3, 0.8);  // G5
  playBell(1046.50, now + 0.45, 1.2); // C6
};

const playTone = (freq, type = 'sine', duration = 0.5, vol = 0.2) => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};
// -----------------------
const {
  CATEGORIES,
  RANDOM_EVENTS,
  SCENARIOS,
  RED_HERRINGS,
  BUREAU_CASES: RAW_BUREAU_CASES = [],
  BUREAU_RESEARCH_FOCUS = {},
  getCategoryTitle,
  getArtifactEraLabel,
} = data;

const BUREAU_CASES = RAW_BUREAU_CASES;
const BUREAU_CASES_BY_ID = new Map(BUREAU_CASES.map(item => [item.id, item]));
const BUREAU_COMPARISON_CHALLENGES = data.BUREAU_COMPARISON_CHALLENGES || [];
const BUREAU_COMPARISON_BY_PAIR = new Map(
  BUREAU_COMPARISON_CHALLENGES.map(item => [item.civilisations.slice().sort().join('||'), item]),
);
const BUREAU_CIVILISATIONS = [...new Set(BUREAU_CASES.map(item => item.civilisation))];
const createInitialBureauEvidenceFilter = () => (
  BUREAU_CIVILISATIONS.reduce((acc, civilisation) => {
    acc[civilisation] = 'unsure';
    return acc;
  }, {})
);

// Custom collision detection strategy
const customCollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(args);
};

// Global Icon Helper
const getIcon = (type, size = 20) => {
  switch(type) {
    case 'objects': return <Package size={size} />;
    case 'remains': return <Skull size={size} />;
    case 'structures': return <Landmark size={size} />;
    case 'environment': return <Leaf size={size} />;
    case 'written': return <ScrollText size={size} />;
    case 'mystery': return <Search size={size} />;
    default: return <Search size={size} />;
  }
};

const ARTIFACT_THEME_MAP = {
  objects: {
    accent: '#f59e0b',
    accentSoft: 'rgba(245, 158, 11, 0.18)',
    label: 'Artifact',
  },
  remains: {
    accent: '#a855f7',
    accentSoft: 'rgba(168, 85, 247, 0.18)',
    label: 'Remains',
  },
  structures: {
    accent: '#14b8a6',
    accentSoft: 'rgba(20, 184, 166, 0.18)',
    label: 'Structure',
  },
  environment: {
    accent: '#84cc16',
    accentSoft: 'rgba(132, 204, 22, 0.18)',
    label: 'Ecofact',
  },
  written: {
    accent: '#60a5fa',
    accentSoft: 'rgba(96, 165, 250, 0.18)',
    label: 'Text / Symbol',
  },
  default: {
    accent: '#e89e5d',
    accentSoft: 'rgba(232, 158, 93, 0.18)',
    label: 'Find',
  },
};

const getArtifactHash = (input = '') => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const getArtifactTheme = (artifact) => {
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

const getFirstSentence = (text = '') => {
  const trimmed = String(text).trim();
  if (!trimmed) return '';
  const match = trimmed.match(/^(.+?[.!?])(?:\s|$)/);
  return (match?.[1] ?? trimmed).trim();
};

const lowercaseFirstLetter = (text = '') => {
  if (!text) return '';
  return text.charAt(0).toLowerCase() + text.slice(1);
};

const SORT_HINTS = {
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

const getSortingHint = (artifact, attemptCount = 0) => {
  const hintSet = SORT_HINTS[artifact?.type] ?? SORT_HINTS.objects;
  const hint = attemptCount > 0 ? hintSet.repeat : hintSet.first;
  return `Not quite yet. ${hint} Try again.`;
};

const getSortingSuccessMessage = (artifact, categoryId) => {
  const categoryTitle = getCategoryTitle(categoryId);
  const explanation = lowercaseFirstLetter(getFirstSentence(artifact?.rationale))
    || lowercaseFirstLetter(artifact?.clue)
    || 'it gives useful evidence about the past';
  return `Correct. ${artifact.name} fits ${categoryTitle} because ${explanation}`;
};

const LAB_ANALYSIS_PROMPTS = [
  {
    id: 'daily-life',
    title: 'Daily life',
    description: 'How people lived, worked or ate',
    icon: MapPin,
  },
  {
    id: 'beliefs',
    title: 'Beliefs',
    description: 'Religion, burial or afterlife ideas',
    icon: Landmark,
  },
  {
    id: 'technology',
    title: 'Technology',
    description: 'Tools, building or materials',
    icon: Beaker,
  },
  {
    id: 'environment',
    title: 'Environment',
    description: 'Climate, plants, animals or natural conditions',
    icon: Leaf,
  },
  {
    id: 'society',
    title: 'Power and society',
    description: 'Rules, status, wealth or leadership',
    icon: Users,
  },
];

const LAB_NOTE_STEMS = [
  'This find suggests...',
  'The clue that supports this is...',
  'This helps historians understand...',
];

const TRAINING_STAGES = [
  {
    id: 'survey',
    title: 'Survey',
    purpose: 'Find a possible site',
  },
  {
    id: 'grid',
    title: 'Grid',
    purpose: 'Mark out the site so locations can be recorded',
  },
  {
    id: 'excavate',
    title: 'Excavate',
    purpose: 'Carefully uncover evidence',
  },
  {
    id: 'map',
    title: 'Map',
    purpose: 'Record where each find was discovered',
  },
  {
    id: 'lab',
    title: 'Lab',
    purpose: 'Analyse the finds to work out what they mean',
  },
];

const TRAINING_STAGE_ICONS = {
  survey: Search,
  grid: FileText,
  excavate: Pickaxe,
  map: MapPin,
  lab: Beaker,
};

const shuffleArray = (items) => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const hashStringToSeed = (value) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const shuffleArrayWithSeed = (items, seedSource) => {
  const next = [...items];
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

const createDigTiles = (activeArtifacts, excavatedIds) => {
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

function DraggableArtifact({ artifact, onClick, showStatus = false, isNeutral = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: artifact.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1001,
  } : undefined;

  const theme = isNeutral ? { accent: '#A88661', accentSoft: 'rgba(168, 134, 97, 0.1)' } : getArtifactTheme(artifact);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes} 
      className={`artifact-card ${isDragging ? 'dragging' : ''} ${isNeutral ? 'neutral-artifact' : ''}`}
      onClick={(e) => {
        if (!isDragging && onClick) {
          e.stopPropagation();
          onClick(artifact);
        }
      }}
    >
      <span className="artifact-card-icon" style={{ '--artifact-accent': theme.accent, '--artifact-accent-soft': theme.accentSoft }}>
        {getIcon(isNeutral ? 'mystery' : artifact.type, 22)}
      </span>
      <span className="artifact-card-copy">
        <span className="card-name">{artifact.name}</span>
      </span>
      {showStatus && <div className="status-indicator"><CheckCircle2 size={16} /></div>}
    </div>
  );
}

function CategoryBin({ category, items, onArtifactClick, itemsWithHypothesis = {} }) {
  const { isOver, setNodeRef } = useDroppable({
    id: category.id,
  });

  return (
    <div ref={setNodeRef} className={`category-bin ${isOver ? 'is-over' : ''}`}>
      <div className="category-header">
        {getIcon(category.id, 28)}
        <div className="category-header-text">
          <h3 className="category-title">{category.title}</h3>
          <p className="category-examples">{category.description}</p>
        </div>
      </div>
      
      <div className="bin-content">
        <div className="drop-zone-area">
          {items.length === 0 ? (
            <div className="drop-placeholder">
              <span className="drop-icon"><Search size={20} /></span>
              <span className="drop-text">Drop items here</span>
            </div>
          ) : (
            <div className="bin-items">
              {items.map(item => (
                <DraggableArtifact 
                  key={item.id} 
                  artifact={item} 
                  onClick={onArtifactClick}
                  showStatus={!!itemsWithHypothesis[item.id]}
                />
              ))}
            </div>
          )}
        </div>
        <div className="bin-footer">
          <span className="bin-count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </div>
      </div>
    </div>
  );
}

function TrainingStageCard({ stage, compact = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: stage.id,
  });
  const Icon = TRAINING_STAGE_ICONS[stage.id] ?? Search;
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1001,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`training-stage-card ${compact ? 'compact' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="training-stage-chip">
        <Icon size={18} />
      </div>
      <div className="training-stage-copy">
        <span className="training-stage-title">{stage.title}</span>
        <span className="training-stage-purpose">{stage.purpose}</span>
      </div>
    </div>
  );
}

function TrainingSlot({ index, stage }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `training-slot-${index}`,
  });

  return (
    <div ref={setNodeRef} className={`training-slot ${isOver ? 'is-over' : ''} ${stage ? 'filled' : ''}`}>
      <div className="training-slot-label">Step {index + 1}</div>
      {stage ? (
        <TrainingStageCard stage={stage} compact />
      ) : (
        <div className="training-slot-empty">
          <span>Drop stage here</span>
        </div>
      )}
    </div>
  );
}

function TrainingTray({ stages }) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'training-tray',
  });

  return (
    <div className={`training-tray ${isOver ? 'is-over' : ''}`} ref={setNodeRef}>
      <div className="training-tray-header">
        <span className="training-panel-kicker">Stage cards</span>
        <span className="training-tray-hint">Drag these into the correct order</span>
      </div>
      <div className="training-tray-list">
        {stages.map(stage => (
          <TrainingStageCard key={stage.id} stage={stage} />
        ))}
      </div>
    </div>
  );
}

function ActivityMenu({ onStartInvestigation, onStartTraining, onStartBureau }) {
  return (
    <section className="phase-container menu-phase">
      <div className="menu-hero glass-card">
        <div className="training-kicker">Choose Your Activity</div>
        <h2>Archaeology Challenge</h2>
        <p>Pick the full investigation game, the archaeology training activity, or the Antiquities Bureau clues game.</p>
      </div>

      <div className="activity-menu-grid">
        <article className="activity-card glass-card">
          <div className="activity-card-icon activity-card-icon--investigation">
            <Pickaxe size={26} />
          </div>
          <div className="activity-card-copy">
            <h3>Full Investigation Game</h3>
            <p>Recover evidence, sort your finds, analyse clues, build a museum exhibition, and complete your report.</p>
          </div>
          <button type="button" className="btn primary-btn activity-card-action" onClick={onStartInvestigation}>
            Start Investigation
          </button>
        </article>

        <article className="activity-card glass-card">
          <div className="activity-card-icon activity-card-icon--training">
            <MapPin size={26} />
          </div>
          <div className="activity-card-copy">
            <h3>Archaeologist Training</h3>
            <p>Practise the steps archaeologists use to investigate the past.</p>
          </div>
          <button type="button" className="btn primary-btn activity-card-action" onClick={onStartTraining}>
            Start Training
          </button>
        </article>

        <article className="activity-card glass-card">
          <div className="activity-card-icon activity-card-icon--bureau">
            <FileText size={26} />
          </div>
          <div className="activity-card-copy">
            <h3>Antiquities Bureau</h3>
            <p>Use clues to work out which ancient civilisation each case belongs to. Then choose one civilisation to research in your booklet.</p>
          </div>
          <button type="button" className="btn primary-btn activity-card-action" onClick={onStartBureau}>
            Start Bureau Game
          </button>
        </article>
      </div>
    </section>
  );
}

function ResumeCard({ savedGame, onResume }) {
  if (!savedGame) return null;

  return (
    <section className="menu-resume glass-card">
      <div className="training-kicker">Saved progress found</div>
      <h3>Resume your last game?</h3>
      <p>
        You have a saved {savedGame.mode === 'bureau' ? 'Bureau' : 'investigation'} session from{' '}
        <strong>{savedGame.phase === 'bureauBriefing'
          ? 'Bureau Briefing'
          : savedGame.phase === 'bureauCase'
            ? 'Case'
          : savedGame.phase === 'bureauLog'
              ? "Historian's Log"
              : savedGame.phase === 'bureauFeedback'
                ? 'Case Feedback'
                : savedGame.phase === 'bureauComparison'
                  ? 'Compare Two Civilisations'
                  : savedGame.phase === 'bureauResults'
                    ? 'Case Work Complete'
                    : savedGame.phase === 'bureauResearchChoice'
                      ? 'Choose Your Civilisation'
                      : savedGame.phase || 'a previous screen'}</strong>.
      </p>
      <div className="bureau-briefing-actions">
        <button type="button" className="btn primary-btn" onClick={onResume}>
          {savedGame.mode === 'bureau' ? 'Resume Bureau Game' : 'Resume Investigation Game'}
        </button>
      </div>
    </section>
  );
}

function BureauMode({ bureauState, setBureauState, onBackToMenu }) {
  const didCelebrateRef = useRef(false);
  const [selectedResearchCivilisation, setSelectedResearchCivilisation] = useState(null);
  const [isMakingClaim, setIsMakingClaim] = useState(false);
  const [showArchivedSuspects, setShowArchivedSuspects] = useState(false);
  const currentCase = BUREAU_CASES[bureauState.caseIndex] || null;
  const currentComparison = bureauState.phase === 'bureauComparison'
    ? createBureauComparisonChallenge(bureauState.caseResults)
    : null;
  const solvedCaseCount = bureauState.caseResults.length;
  const totalCases = BUREAU_CASES.length;
  const needsComparison = solvedCaseCount > 0 && solvedCaseCount % 2 === 0;
  const latestOutcome = bureauState.latestOutcome;
  const researchFocus = selectedResearchCivilisation
    ? BUREAU_RESEARCH_FOCUS[selectedResearchCivilisation] || null
    : null;
  const evidenceFilter = bureauState.evidenceFilter || createInitialBureauEvidenceFilter();
  const caseCivilisationOptions = getBureauCivilisationOptions(currentCase);
  const selectedClaimCivilisation = bureauState.selectedClaimCivilisation
    || (bureauState.selectedAnswerIndex !== null ? caseCivilisationOptions[bureauState.selectedAnswerIndex] : '')
    || '';
  const currentEvidenceText = [
    currentCase?.tier1SiteClue && { label: 'Clue 1: Place', text: currentCase.tier1SiteClue },
    bureauState.currentTier >= 2 && currentCase?.tier2SocietyClue && { label: 'Clue 2: People', text: currentCase.tier2SocietyClue },
    bureauState.currentTier >= 3 && currentCase?.tier3LegacyClue && { label: 'Clue 3: What they left behind', text: currentCase.tier3LegacyClue },
  ].filter(Boolean);
  const availableClaimPoints = Math.max(0, 4 - bureauState.currentTier);
  const activeSuspects = BUREAU_CIVILISATIONS.filter(civilisation => (evidenceFilter[civilisation] || 'unsure') !== 'discard');
  const archivedSuspects = BUREAU_CIVILISATIONS.filter(civilisation => (evidenceFilter[civilisation] || 'unsure') === 'discard');

  useEffect(() => {
    if (bureauState.phase === 'bureauResults' && !didCelebrateRef.current) {
      initAudio();
      playWin();
      confetti({ particleCount: 110, spread: 72, origin: { y: 0.55 } });
      didCelebrateRef.current = true;
    }
    if (bureauState.phase !== 'bureauResults') {
      didCelebrateRef.current = false;
    }
  }, [bureauState.phase]);

  const updateState = (patch) => {
    setBureauState(prev => ({ ...prev, ...patch }));
  };

  const resetCaseState = () => ({
    currentTier: 1,
    selectedAnswerIndex: null,
    selectedClaimCivilisation: '',
    selectedLogAnswerIndex: null,
    selectedComparisonAnswerIndex: null,
    pendingCaseOutcome: null,
    latestOutcome: null,
    evidenceFilter: createInitialBureauEvidenceFilter(),
    showEvidenceFilter: true,
  });

  const setEvidenceFilterStatus = (civilisation, status) => {
    setBureauState(prev => ({
      ...prev,
      evidenceFilter: {
        ...(prev.evidenceFilter || createInitialBureauEvidenceFilter()),
        [civilisation]: status,
      },
    }));
  };

  const selectClaimCivilisation = (civilisation) => {
    const answerIndex = caseCivilisationOptions.indexOf(civilisation);
    setBureauState(prev => ({
      ...prev,
      selectedClaimCivilisation: civilisation,
      selectedAnswerIndex: answerIndex >= 0 ? answerIndex : null,
    }));
  };

  const toggleSuspectArchive = (civilisation) => {
    const currentStatus = evidenceFilter[civilisation] || 'unsure';
    setEvidenceFilterStatus(civilisation, currentStatus === 'discard' ? 'unsure' : 'discard');
  };

  const revealNextClue = () => {
    if (!currentCase || bureauState.currentTier >= 3) return;
    setIsMakingClaim(false);
    const nextTier = Math.min(3, bureauState.currentTier + 1);
    updateState({
      currentTier: nextTier,
      selectedAnswerIndex: null,
      selectedClaimCivilisation: '',
      latestOutcome: {
        explanation: 'Not yet. That answer does not fit all the clues. Reveal another clue.',
      },
    });
  };

  const startCase = () => {
    setIsMakingClaim(false);
    updateState({
      phase: 'bureauCase',
      ...resetCaseState(),
    });
  };

  const renderStickyActionBar = (primaryLabel, onPrimary, primaryDisabled = false) => (
    <div className="bureau-sticky-action-bar hide-on-print">
      <button
        type="button"
        className="btn primary-btn"
        onClick={onPrimary}
        disabled={primaryDisabled}
      >
        {primaryLabel}
      </button>
      <button type="button" className="btn" onClick={onBackToMenu}>
        Back to Main Menu
      </button>
    </div>
  );

  const handleSubmitCase = () => {
    if (!currentCase || !selectedClaimCivilisation) return;

    const correctAnswerIndex = getBureauCorrectCivilisationIndex(currentCase);
    const selectedAnswerIndex = caseCivilisationOptions.indexOf(selectedClaimCivilisation);
    const selectedCivilisation = selectedClaimCivilisation;
    const correctCivilisation = getBureauCorrectCivilisationLabel(currentCase);
    const isCorrect = selectedCivilisation === correctCivilisation
      || (selectedAnswerIndex >= 0 && selectedAnswerIndex === correctAnswerIndex);
    const tierPoints = isCorrect ? Math.max(0, 4 - bureauState.currentTier) : 0;
    const nextOutcome = {
      caseId: currentCase.id,
      caseTitle: currentCase.caseTitle,
      civilisation: currentCase.civilisation,
      correctCivilisation,
      selectedCivilisation,
      civilisationCorrect: isCorrect,
      tierSolvedAt: isCorrect ? bureauState.currentTier : null,
      tierPoints,
      chosenAnswerIndex: selectedAnswerIndex >= 0 ? selectedAnswerIndex : null,
      correctAnswerIndex,
      logAnswerIndex: null,
      logPoints: 0,
      logCorrect: false,
      comparisonTags: currentCase.comparisonTags || [],
      explanation: currentCase.explanation,
    };

    if (isCorrect || bureauState.currentTier >= 3) {
      setIsMakingClaim(false);
      setBureauState(prev => ({
        ...prev,
        score: prev.score + tierPoints,
        phase: 'bureauLog',
        selectedLogAnswerIndex: null,
        pendingCaseOutcome: nextOutcome,
        latestOutcome: nextOutcome,
        selectedAnswerIndex: null,
        selectedClaimCivilisation: '',
      }));
      return;
    }

    setBureauState(prev => ({
      ...prev,
      currentTier: Math.min(3, prev.currentTier + 1),
      selectedAnswerIndex: null,
      selectedClaimCivilisation: '',
      latestOutcome: {
        ...nextOutcome,
        explanation: 'Not yet. That answer does not fit all the clues. Reveal another clue.',
      },
    }));
    setIsMakingClaim(false);
  };

  const handleSubmitLog = () => {
    if (!currentCase || bureauState.selectedLogAnswerIndex === null || !bureauState.pendingCaseOutcome) return;

    const logCorrect = bureauState.selectedLogAnswerIndex === currentCase.correctHistorianLogAnswer;
    const logPoints = logCorrect ? 1 : 0;
    const completedCase = {
      ...bureauState.pendingCaseOutcome,
      logAnswerIndex: bureauState.selectedLogAnswerIndex,
      logCorrect,
      logPoints,
    };

    setBureauState(prev => ({
      ...prev,
      score: prev.score + logPoints,
      caseResults: [...prev.caseResults, completedCase],
      latestOutcome: completedCase,
      pendingCaseOutcome: null,
      selectedLogAnswerIndex: null,
      phase: 'bureauFeedback',
    }));
  };

  const handleContinueFromFeedback = () => {
    if (needsComparison) {
      setBureauState(prev => ({
        ...prev,
        phase: 'bureauComparison',
        selectedComparisonAnswerIndex: null,
        comparisonResult: null,
      }));
      return;
    }

    if (bureauState.caseIndex + 1 < totalCases) {
      setIsMakingClaim(false);
      setBureauState(prev => ({
        ...prev,
        phase: 'bureauCase',
        caseIndex: prev.caseIndex + 1,
        ...resetCaseState(),
      }));
      return;
    }

    updateState({ phase: 'bureauResults' });
  };

  const handleSubmitComparison = () => {
    if (!currentComparison || bureauState.selectedComparisonAnswerIndex === null) return;
    const isCorrect = bureauState.selectedComparisonAnswerIndex === currentComparison.correctAnswer;
    const comparisonPoints = isCorrect ? 2 : 0;
    const result = {
      title: currentComparison.title,
      selectedAnswerIndex: bureauState.selectedComparisonAnswerIndex,
      correct: isCorrect,
      points: comparisonPoints,
      explanation: currentComparison.explanation,
    };

    setBureauState(prev => ({
      ...prev,
      score: prev.score + comparisonPoints,
      comparisonResults: [
        ...prev.comparisonResults,
        result,
      ],
      comparisonResult: result,
      latestOutcome: result,
    }));
  };

  const handleContinueAfterComparison = () => {
    if (bureauState.caseIndex + 1 < totalCases) {
      setIsMakingClaim(false);
      setBureauState(prev => ({
        ...prev,
        phase: 'bureauCase',
        caseIndex: prev.caseIndex + 1,
        comparisonResult: null,
        ...resetCaseState(),
      }));
      return;
    }

    updateState({ phase: 'bureauResults' });
  };

  const handleReplay = () => {
    setSelectedResearchCivilisation(null);
    setIsMakingClaim(false);
    setBureauState(createNewBureauSession('bureauBriefing'));
  };

  const openResearchChoice = () => {
    setSelectedResearchCivilisation(null);
    setBureauState(prev => ({
      ...prev,
      phase: 'bureauResearchChoice',
    }));
  };

  if (bureauState.phase === 'bureauBriefing') {
    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-briefing glass-card">
          <div className="training-kicker">The Antiquities Bureau</div>
          <h2>Ancient Civilisation Clues</h2>
          <p>
            You are going to solve ancient civilisation cases.
            Each case gives you clues. Use the clues to work out which civilisation it is.
            You can guess early for more points, or reveal more clues first.
          </p>
          <div className="bureau-briefing-actions">
            <button className="btn primary-btn" type="button" onClick={startCase}>
              Start First Case
            </button>
            <button className="btn" type="button" onClick={onBackToMenu}>
              Back to Main Menu
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (bureauState.phase === 'bureauCase') {
    if (isMakingClaim) {
      return (
        <section className="phase-container bureau-phase">
          <div className="bureau-claim-screen glass-card">
            <div className="bureau-report-header">
              <div>
                <div className="training-kicker">Case {bureauState.caseIndex + 1} of {totalCases}</div>
                <h2>Make your guess</h2>
              </div>
              <div className="bureau-simple-points">
                {bureauState.currentTier < 3 ? `Guess now: ${availableClaimPoints} points` : 'Final guess: 1 point'}
              </div>
            </div>

            <p className="bureau-case-instruction">
              Which civilisation do the clues point to?
            </p>

            <div className="bureau-claim-evidence-reminder">
              <strong>Current clue:</strong>
              <span>{currentEvidenceText[currentEvidenceText.length - 1]?.text || 'Review the clues before you submit your guess.'}</span>
            </div>

            <div className="bureau-answer-grid bureau-focused-answer-grid">
              {caseCivilisationOptions.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  className={`bureau-answer-btn bureau-focused-answer ${selectedClaimCivilisation === option ? 'selected' : ''}`}
                  onClick={() => selectClaimCivilisation(option)}
                  aria-pressed={selectedClaimCivilisation === option}
                >
                  <span className="bureau-answer-index">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>

            {latestOutcome && (
              <div className="bureau-feedback-note bureau-case-latest">
                {latestOutcome.explanation}
              </div>
            )}

            <div className="bureau-case-actions bureau-claim-actions">
              <button
                type="button"
                className="btn primary-btn"
                onClick={handleSubmitCase}
                disabled={!selectedClaimCivilisation}
              >
                Submit Guess
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setIsMakingClaim(false);
                  updateState({ selectedAnswerIndex: null, selectedClaimCivilisation: '' });
                }}
              >
                Back to clues
              </button>
              <button type="button" className="btn" onClick={onBackToMenu}>
                Back to Main Menu
              </button>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-investigation-layout">
          <article className="bureau-case-file glass-card">
            <div className="bureau-report-header">
              <div>
                <div className="training-kicker">Case {bureauState.caseIndex + 1} of {totalCases}</div>
                <h2>{currentCase?.caseTitle || 'Unknown case'}</h2>
              </div>
              <div className="bureau-case-meta">
                <span>Case {bureauState.caseIndex + 1} of {totalCases}</span>
                <span>Score {bureauState.score}</span>
              </div>
            </div>

            <p className="bureau-case-instruction">
              Read the clues. Remove choices that do not fit. Guess when you are ready.
            </p>

            <div className="bureau-tier-tabs" aria-label="Case file clue tiers">
              {['Site', 'Society', 'Legacy'].map((label, index) => {
                const tierNumber = index + 1;
                const stateClass = bureauState.currentTier === tierNumber
                  ? 'current'
                  : bureauState.currentTier > tierNumber
                    ? 'complete'
                    : 'locked';
                return (
                  <div key={label} className={`bureau-tier-tab bureau-tier-indicator ${stateClass}`}>
                    {`Clue ${tierNumber}`}
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>

            <div className="bureau-evidence-box">
              <div className="bureau-evidence-text-list">
                {currentEvidenceText.map((item) => (
                  <div key={item.tier} className="bureau-evidence-text">
                    <strong>{item.label}</strong>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {latestOutcome && (
              <div className="bureau-feedback-note bureau-case-latest">
                {latestOutcome.explanation}
              </div>
            )}

            <div className="bureau-case-actions">
              <button
                type="button"
                className="btn primary-btn"
                onClick={() => {
                  updateState({ selectedAnswerIndex: null, selectedClaimCivilisation: '' });
                  setIsMakingClaim(true);
                }}
              >
                Make a Guess
              </button>
              {bureauState.currentTier < 3 && (
                <button type="button" className="btn" onClick={revealNextClue}>
                  Reveal Clue {bureauState.currentTier + 1}
                </button>
              )}
              <span className="bureau-simple-points">
                {bureauState.currentTier < 3 ? `Guess now: ${availableClaimPoints} points` : 'Final guess: 1 point'}
              </span>
              <button type="button" className="btn" onClick={onBackToMenu}>
                Back to Main Menu
              </button>
            </div>
          </article>

          <aside className="bureau-suspect-board glass-card">
            <div className="bureau-suspect-header">
              <div>
                <div className="training-kicker">Possible Civilisations</div>
                <h3>Remove civilisations that do not fit the clue</h3>
              </div>
              <div className="bureau-evidence-summary" aria-label="Evidence filter summary">
                <span>{activeSuspects.length} possible</span>
                <span>{archivedSuspects.length} removed</span>
              </div>
            </div>
            <p className="bureau-evidence-filter-note">
              Click a card to mark it possible. Remove ones that do not fit. Bring them back if you change your mind.
            </p>

            <div className="bureau-suspect-grid">
              {activeSuspects.map((civilisation) => {
                const status = evidenceFilter[civilisation] || 'unsure';
                return (
                  <article key={civilisation} className={`bureau-suspect-card status-${status}`}>
                    <button
                      type="button"
                      className="bureau-suspect-main"
                      onClick={() => setEvidenceFilterStatus(civilisation, 'keep')}
                    >
                      <span>{civilisation}</span>
                      <small>{status === 'keep' ? 'Possible' : 'Tap to mark possible'}</small>
                    </button>
                    <div className="bureau-suspect-actions" role="group" aria-label={`${civilisation} remove action`}>
                      <button
                        type="button"
                        className="bureau-evidence-chip"
                        onClick={() => toggleSuspectArchive(civilisation)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="bureau-archived-suspects">
              <button
                type="button"
                className="btn bureau-filter-toggle"
                onClick={() => setShowArchivedSuspects(prev => !prev)}
              >
                {showArchivedSuspects ? 'Hide removed civilisations' : `Removed civilisations (${archivedSuspects.length})`}
              </button>

              {showArchivedSuspects && (
                <div className="bureau-archived-list">
                  {archivedSuspects.length === 0 ? (
                    <p>No civilisations removed yet.</p>
                  ) : (
                    archivedSuspects.map(civilisation => (
                      <div key={civilisation} className="bureau-archived-row">
                        <span>{civilisation}</span>
                        <button
                          type="button"
                          className="bureau-evidence-chip"
                          onClick={() => toggleSuspectArchive(civilisation)}
                        >
                          Bring back
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    );
  }

  if (bureauState.phase === 'bureauLog') {
    return (
      <section className="phase-container bureau-phase">
          <div className="bureau-log glass-card">
          <div className="training-kicker">Historian&apos;s Log</div>
          <h2>{currentCase?.caseTitle || 'Case log'}</h2>
          <p>Historians explain how they know something. Choose the clue that best supports your answer.</p>
          <p>{currentCase?.historianLogQuestion || 'Which clue was the strongest evidence?'}</p>

          <div className="bureau-answer-grid bureau-log-grid">
            {(currentCase?.historianLogOptions || []).map((option, index) => (
              <button
                key={option}
                type="button"
                className={`bureau-answer-btn ${bureauState.selectedLogAnswerIndex === index ? 'selected' : ''}`}
                onClick={() => updateState({ selectedLogAnswerIndex: index })}
              >
                <span className="bureau-answer-index">{String.fromCharCode(65 + index)}</span>
                <span>{option}</span>
              </button>
            ))}
          </div>

          <div className="bureau-case-actions">
            <button
              type="button"
              className="btn primary-btn"
              onClick={handleSubmitLog}
              disabled={bureauState.selectedLogAnswerIndex === null}
            >
              Submit Log
            </button>
          </div>
          {renderStickyActionBar('Submit Log', handleSubmitLog, bureauState.selectedLogAnswerIndex === null)}
        </div>
      </section>
    );
  }

  if (bureauState.phase === 'bureauFeedback') {
    const outcome = bureauState.latestOutcome || {};
    const civilisationCorrect = outcome.civilisationCorrect === true;
    const solvedAt = typeof outcome.tierSolvedAt === 'number' ? outcome.tierSolvedAt : null;
    const tierPoints = outcome.tierPoints || 0;
    const logPoints = outcome.logPoints || 0;
    const feedbackText = outcome.logCorrect
      ? 'Good thinking. You chose the strongest clue.'
      : 'Good try. This clue was useful, but it was not the strongest one.';
    const civilisationText = civilisationCorrect
      ? `Correct. The clues point to ${outcome.correctCivilisation || outcome.civilisation || 'the civilisation'}.`
      : `Not quite. The correct civilisation was ${outcome.correctCivilisation || outcome.civilisation || 'unknown'}.`;

    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-feedback glass-card">
          <div className="training-kicker">Case Feedback</div>
          <h2>{outcome.caseTitle || 'Case complete'}</h2>
          <p>{civilisationCorrect ? feedbackText : civilisationText}</p>

          <div className="bureau-feedback-grid">
            <div className="bureau-feedback-card">
              <strong>Guess</strong>
              <span>{civilisationCorrect ? `Solved at Clue ${solvedAt}` : 'Not quite'}</span>
              <span>{tierPoints} point{tierPoints === 1 ? '' : 's'}</span>
            </div>
            <div className="bureau-feedback-card">
              <strong>Historian&apos;s Log</strong>
              <span>{logPoints > 0 ? 'Correct clue' : 'Needs more evidence'}</span>
              <span>{logPoints} points</span>
            </div>
            <div className="bureau-feedback-card">
              <strong>Total so far</strong>
              <span>{bureauState.score} points</span>
              <span>{solvedCaseCount} case{solvedCaseCount === 1 ? '' : 's'} solved</span>
            </div>
          </div>

          <div className="bureau-feedback-note">
            {outcome.explanation || 'Use the next case to keep building your thinking.'}
          </div>

          <div className="bureau-case-actions">
            <button type="button" className="btn primary-btn" onClick={handleContinueFromFeedback}>
              {needsComparison ? 'Compare Two Civilisations' : (bureauState.caseIndex + 1 < totalCases ? 'Next Case' : 'View Results')}
            </button>
            <button type="button" className="btn" onClick={onBackToMenu}>
              Back to Main Menu
            </button>
          </div>
          {renderStickyActionBar(
            needsComparison
              ? 'Compare Two Civilisations'
              : (bureauState.caseIndex + 1 < totalCases ? 'Next Case' : 'View Results'),
            handleContinueFromFeedback,
          )}
        </div>
      </section>
    );
  }

  if (bureauState.phase === 'bureauComparison') {
    const challenge = currentComparison;
    const comparisonResult = bureauState.comparisonResult;

    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-comparison glass-card">
          <div className="training-kicker">Compare Two Civilisations</div>
          <h2>{challenge?.title || 'Compare the cases'}</h2>
          <p>{challenge?.question || 'What was similar about these two civilisations?'}</p>

          <div className="bureau-answer-grid bureau-comparison-grid">
            {(challenge?.options || []).map((option, index) => (
              <button
                key={option}
                type="button"
                className={`bureau-answer-btn ${bureauState.selectedComparisonAnswerIndex === index ? 'selected' : ''}`}
                onClick={() => updateState({ selectedComparisonAnswerIndex: index })}
              >
                <span className="bureau-answer-index">{String.fromCharCode(65 + index)}</span>
                <span>{option}</span>
              </button>
            ))}
          </div>

          {comparisonResult && (
            <div className="bureau-feedback-note">
              {comparisonResult.correct
                ? `Correct. +${comparisonResult.points} points. ${comparisonResult.explanation || ''}`
                : `Not quite. ${comparisonResult.explanation || 'Try to compare the evidence more carefully.'}`}
            </div>
          )}

          <div className="bureau-case-actions">
            {!comparisonResult ? (
              <button
                type="button"
                className="btn primary-btn"
                onClick={handleSubmitComparison}
                disabled={bureauState.selectedComparisonAnswerIndex === null}
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                className="btn primary-btn"
                onClick={handleContinueAfterComparison}
              >
                {bureauState.caseIndex + 1 < totalCases ? 'Next Case' : 'View Results'}
              </button>
            )}
            <button type="button" className="btn" onClick={onBackToMenu}>
              Back to Main Menu
            </button>
          </div>
          {renderStickyActionBar(
            comparisonResult
              ? (bureauState.caseIndex + 1 < totalCases ? 'Next Case' : 'View Results')
              : 'Submit Answer',
            comparisonResult ? handleContinueAfterComparison : handleSubmitComparison,
            !comparisonResult && bureauState.selectedComparisonAnswerIndex === null,
          )}
        </div>
      </section>
    );
  }

  if (bureauState.phase === 'bureauResults') {
    const totalTierPoints = bureauState.caseResults.reduce((sum, item) => sum + (item.tierPoints || 0), 0);
    const totalLogPoints = bureauState.caseResults.reduce((sum, item) => sum + (item.logPoints || 0), 0);
    const totalComparisonPoints = bureauState.comparisonResults.reduce((sum, item) => sum + (item.points || 0), 0);

    return (
      <section className="phase-container bureau-phase">
          <div className="bureau-results glass-card">
          <div className="training-kicker">Case Work Complete</div>
          <h2>You solved the civilisation cases</h2>
          <p>You solved {bureauState.caseResults.length} case{bureauState.caseResults.length === 1 ? '' : 's'} using the clues.</p>

          <div className="bureau-results-summary">
            <div className="bureau-results-card">
              <strong>Cases completed</strong>
              <span>{bureauState.caseResults.length}</span>
            </div>
            <div className="bureau-results-card">
              <strong>Correct guesses</strong>
              <span>{totalTierPoints} points</span>
            </div>
            <div className="bureau-results-card">
              <strong>Historian&apos;s Log points</strong>
              <span>{totalLogPoints} points</span>
            </div>
            <div className="bureau-results-card">
              <strong>Comparison points</strong>
              <span>{totalComparisonPoints} points</span>
            </div>
            <div className="bureau-results-card">
              <strong>Total score</strong>
              <span>{bureauState.score} points</span>
            </div>
          </div>

          <div className="bureau-results-list">
            {bureauState.caseResults.map((result, index) => (
              <article key={result.caseId} className="bureau-results-item">
                <div>
                  <strong>Case {index + 1}: {result.caseTitle}</strong>
                  <p>{result.civilisationCorrect ? `Correct guess: ${result.correctCivilisation}` : `Best guess: ${result.correctCivilisation}`}</p>
                </div>
                <div className="bureau-results-item-points">
                  <span>{result.civilisationCorrect ? `Clue ${result.tierSolvedAt}` : 'No guess points'} + Log</span>
                  <strong>{(result.tierPoints || 0) + (result.logPoints || 0)} pts</strong>
                </div>
              </article>
            ))}
          </div>

          <div className="bureau-case-actions">
            <button type="button" className="btn primary-btn" onClick={openResearchChoice}>
              Choose Civilisation
            </button>
            <button type="button" className="btn" onClick={handleReplay}>
              Start another Bureau game
            </button>
            <button type="button" className="btn" onClick={onBackToMenu}>
              Back to Main Menu
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (bureauState.phase === 'bureauResearchChoice') {
    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-results glass-card">
          <div className="training-kicker">Choose Civilisation</div>
          <h2>Which civilisation would you like to research in your booklet?</h2>
          <p>
            Pick the civilisation that interested you most.
          </p>

          <div className="bureau-research-layout">
            <div className="bureau-research-list">
              {BUREAU_CASES.map((bureauCase, index) => {
                const isSelected = selectedResearchCivilisation === bureauCase.civilisation;
                return (
                  <button
                    key={bureauCase.id}
                    type="button"
                    className={`bureau-answer-btn bureau-research-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedResearchCivilisation(bureauCase.civilisation)}
                    aria-pressed={isSelected}
                  >
                    <span className="bureau-answer-index">{String(index + 1).padStart(2, '0')}</span>
                    <span>{bureauCase.civilisation}</span>
                  </button>
                );
              })}
            </div>

            <div className="bureau-research-card">
              {researchFocus ? (
                <>
                  <div className="bureau-tier-label">Research tips</div>
                  <h3>{selectedResearchCivilisation}</h3>
                  <div className="bureau-research-section">
                    <strong>In your booklet, look for:</strong>
                    <ul>
                      {researchFocus.lookFor.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div className="bureau-research-section">
                    <strong>Big question:</strong>
                    <p>{researchFocus.inquiryQuestion}</p>
                  </div>
                  <div className="bureau-research-section bureau-research-reminder">
                    <strong>Remember:</strong>
                    <p>{researchFocus.evidenceReminder}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bureau-tier-label">Research tips</div>
                  <p>Select a civilisation to see booklet prompts and a big question.</p>
                </>
              )}
            </div>
          </div>

          <div className="bureau-feedback-note">
            <strong>Think about your thinking:</strong>
            <ul className="bureau-reflection-list">
              <li>Which clue type helped you most: Site, Society, or Legacy?</li>
              <li>Did you guess early or wait for more evidence?</li>
              <li>Which civilisation seems most interesting to research further?</li>
              <li>What evidence made you interested in that civilisation?</li>
            </ul>
          </div>

          <div className="bureau-case-actions">
            <button type="button" className="btn" onClick={() => setBureauState(prev => ({ ...prev, phase: 'bureauResults' }))}>
              Back to results
            </button>
            <button type="button" className="btn" onClick={onBackToMenu}>
              Back to Main Menu
            </button>
          </div>
        </div>
      </section>
    );
  }

  return null;
}

function TrainingPhase({ trainingPlacements, setTrainingPlacements, onBackToMenu }) {
  const [activeStageId, setActiveStageId] = useState(null);
  const didCelebrateRef = useRef(false);
  const [trayOrder] = useState(() => shuffleArray(TRAINING_STAGES));
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  );

  const stageById = useMemo(() => new Map(TRAINING_STAGES.map(stage => [stage.id, stage])), []);
  const placedIds = useMemo(() => trainingPlacements.filter(Boolean), [trainingPlacements]);
  const trayStages = useMemo(() => {
    const placedSet = new Set(placedIds);
    return trayOrder.filter(stage => !placedSet.has(stage.id));
  }, [placedIds, trayOrder]);
  const activeStage = activeStageId ? stageById.get(activeStageId) : null;
  const correctCount = trainingPlacements.reduce(
    (count, stageId, index) => count + (stageId === TRAINING_STAGES[index].id ? 1 : 0),
    0,
  );
  const isComplete = correctCount === TRAINING_STAGES.length;

  useEffect(() => {
    if (isComplete && !didCelebrateRef.current) {
      initAudio();
      playWin();
      confetti({ particleCount: 120, spread: 72, origin: { y: 0.55 } });
      didCelebrateRef.current = true;
    }
    if (!isComplete && didCelebrateRef.current) {
      didCelebrateRef.current = false;
    }
  }, [isComplete]);

  const handleDragStart = (event) => {
    setActiveStageId(event.active?.id ?? null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveStageId(null);
    if (!active || !over) return;

    const activeId = active.id;
    const overId = over.id;

    if (overId === 'training-tray') {
      setTrainingPlacements(prev => prev.map(stageId => (stageId === activeId ? null : stageId)));
      return;
    }

    if (typeof overId === 'string' && overId.startsWith('training-slot-')) {
      const slotIndex = Number(overId.replace('training-slot-', ''));
      if (Number.isNaN(slotIndex)) return;

      setTrainingPlacements(prev => {
        const next = [...prev];
        const currentIndex = next.indexOf(activeId);
        if (currentIndex !== -1) next[currentIndex] = null;
        next[slotIndex] = activeId;
        return next;
      });
    }
  };

  return (
    <section className="phase-container training-phase">
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="training-hero glass-card">
          <div className="training-hero-copy">
            <div className="training-kicker">Archaeologist Training</div>
            <h2>How Do We Investigate the Past?</h2>
            <p>
              Put the five archaeology stages in order.
            </p>
          </div>
          <div className="training-hero-actions">
            <button className="btn" type="button" onClick={onBackToMenu}>Back to menu</button>
          </div>
        </div>

        <div className="training-layout">
          <TrainingTray stages={trayStages} />
          <div className="training-board glass-card">
            <div className="training-board-header">
              <div>
                <div className="training-panel-kicker">Put these in order</div>
                <h3>Survey, Grid, Excavate, Map, Lab</h3>
              </div>
              <div className="training-progress">
                {correctCount}/5 correct
              </div>
            </div>

            <div className="training-slots">
              {TRAINING_STAGES.map((stage, index) => (
                <TrainingSlot
                  key={stage.id}
                  index={index}
                  stage={stageById.get(trainingPlacements[index]) ?? null}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="training-summary glass-card">
          {isComplete ? (
            <>
              <div className="training-success-message">You are ready to investigate the ancient past.</div>
              <p className="training-prompt">Why does the order matter?</p>
              <div className="training-answer-starter">
                If archaeologists move evidence before recording it, then...
              </div>
              <div className="training-summary-actions">
                <button className="btn primary-btn" type="button" onClick={onBackToMenu}>
                  Back to menu
                </button>
              </div>
            </>
          ) : (
            <div className="training-summary-copy">
              <span className="training-summary-title">Keep going</span>
              <p>
                Use the tray on the left to place each stage in the correct order.
              </p>
              <div className="training-summary-note">
                {correctCount}/5 stages are in the right place.
              </div>
            </div>
          )}
        </div>

        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeStage ? <TrainingStageCard stage={activeStage} compact /> : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}

// ------------------------------------------------------------------
// Phase 1: Dig (Memory Matching Game with Time Limit)
// ------------------------------------------------------------------
function DigPhase({ activeArtifacts, excavatedIds, setExcavatedIds, onComplete, currentEvent, onBackToMenu }) {
  const [tiles, setTiles] = useState(() => createDigTiles(activeArtifacts, excavatedIds));
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', isError: false });
  const [fieldNote, setFieldNote] = useState(null);
  const [showDebrief, setShowDebrief] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(currentEvent.time); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStormWarning, setShowStormWarning] = useState(true);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  // Game Stats
  const [attempts, setAttempts] = useState(0);
  const [isSurveying, setIsSurveying] = useState(false);
 
  // Difficulty State
  const [difficulty, setDifficulty] = useState('medium');
  const radarTimeoutRef = useRef(null);
  const boardContainerRef = useRef(null);
  const [boardFit, setBoardFit] = useState({ width: 0, height: 0 });
  const boardColumns = 8;
  const boardRows = Math.max(1, Math.ceil(tiles.length / boardColumns));

  const EventIcon = currentEvent.icon;
  const recoveredArtifacts = activeArtifacts.filter(artifact => excavatedIds.has(artifact.id));
  const ancientRecoveredCount = recoveredArtifacts.filter(artifact => !artifact.isRedHerring).length;
  const disturbanceCount = recoveredArtifacts.filter(artifact => artifact.isRedHerring).length;

  // Timer Logic
  useEffect(() => {
    const isComplete = activeArtifacts.length > 0 && excavatedIds.size === activeArtifacts.length;
    if (!isPlaying || isTimeUp || isComplete) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsPlaying(false);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeArtifacts.length, excavatedIds.size, isPlaying, isTimeUp]);

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', isError: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback.message]);

  useEffect(() => {
    if (fieldNote) {
      const timer = setTimeout(() => {
        setFieldNote(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [fieldNote]);

  useLayoutEffect(() => {
    const element = boardContainerRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;

    const updateBoardFit = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (!width || !height) return;

      const gapSize = 6;
      const tileSize = Math.max(1, Math.floor(Math.min(
        (width - (gapSize * (boardColumns - 1))) / boardColumns,
        (height - (gapSize * (boardRows - 1))) / boardRows,
      )));
      const nextWidth = (tileSize * boardColumns) + (gapSize * (boardColumns - 1));
      const nextHeight = (tileSize * boardRows) + (gapSize * (boardRows - 1));

      setBoardFit(prev => (
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight }
      ));
    };

    updateBoardFit();
    const observer = new ResizeObserver(updateBoardFit);
    observer.observe(element);

    return () => observer.disconnect();
  }, [boardColumns, boardRows]);

  useEffect(() => () => {
    if (radarTimeoutRef.current) {
      clearTimeout(radarTimeoutRef.current);
      radarTimeoutRef.current = null;
    }
  }, []);

  const handleRadar = () => {
    const radarCost = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 10;
    if (timeLeft <= radarCost || isLocked || !isPlaying) return;
    
    initAudio();
    playTone(800, 'sine', 0.5, 0.1);
    setFeedback({ message: 'Radar activated. Scanning sub-surface context...', isError: false });
    setTimeLeft(prev => prev - radarCost);
    setIsLocked(true);
    setIsSurveying(true);
    
    let duration = 1500;
    if (difficulty === 'easy') duration = 5000;
    if (difficulty === 'medium') duration = 3000;

    setTiles(prev => prev.map(t => t.isMatched ? t : { ...t, isFlipped: true }));
    if (radarTimeoutRef.current) {
      clearTimeout(radarTimeoutRef.current);
    }
    
    radarTimeoutRef.current = setTimeout(() => {
      setTiles(prev => prev.map(t => t.isMatched ? t : { ...t, isFlipped: false }));
      setIsLocked(false);
      setIsSurveying(false);
      setFlippedIndices([]);
      radarTimeoutRef.current = null;
    }, duration);
  };

  const recordRecoveryNote = (artifact) => {
    setFieldNote({
      name: artifact.name,
      eraLabel: getArtifactEraLabel(artifact),
      discoveryMethod: artifact.discoveryMethod,
      typeLabel: getCategoryTitle(artifact.type),
      isDisturbance: !!artifact.isRedHerring,
    });

    // Clear the note after 5 seconds so it doesn't block tiles
    setTimeout(() => {
      setFieldNote(prev => {
        if (prev && prev.name === artifact.name) return null;
        return prev;
      });
    }, 5000);
  };

  const openDebrief = () => {
    setShowDebrief(true);
  };

  const handleTileClick = (index) => {
    if (isLocked || !isPlaying) return;
    if (tiles[index].isFlipped || tiles[index].isMatched) return;

    initAudio();
    playFlip();

    setTiles(prev => {
      const next = [...prev];
      next[index] = { ...next[index], isFlipped: true };
      return next;
    });

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setAttempts(prev => prev + 1);
      const [idx1, idx2] = newFlipped;
      const match = tiles[idx1].artifactId === tiles[index].artifactId;

      if (match) {
        setTimeout(() => {
          playMatch();
          setTiles(prev => {
            const next = [...prev];
            next[idx1] = { ...next[idx1], isMatched: true, isFlipped: true };
            next[idx2] = { ...next[idx2], isMatched: true, isFlipped: true };
            return next;
          });
          
          setExcavatedIds(prev => {
            const next = new Set(prev);
            next.add(tiles[idx1].artifactId);
            return next;
          });
          recordRecoveryNote(tiles[idx1].artifact);
          if (excavatedIds.size + 1 === activeArtifacts.length) {
            setIsPlaying(false);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          }
          
          setFlippedIndices([]);
          setIsLocked(false);
        }, 600);
      } else {
        setTimeout(() => {
          playError();
          setTiles(prev => {
            const next = [...prev];
            next[idx1] = { ...next[idx1], isFlipped: false };
            next[idx2] = { ...next[idx2], isFlipped: false };
            return next;
          });
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timeDanger = timeLeft <= 15 && isPlaying;
  const perfectClear = activeArtifacts.length > 0 && excavatedIds.size === activeArtifacts.length;

  return (
    <div className="phase-container dig-phase">
      {/* Modals */}
      {showStormWarning && (
        <div className="modal-overlay">
          <div className="modal-content glass-card warning-modal" style={{borderColor: currentEvent.dangerColor, boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${currentEvent.dangerColor}40`}}>
            <EventIcon size={48} style={{ color: currentEvent.dangerColor, marginBottom: '1rem', animation: 'pulse 2s infinite' }} />
            <h2 className="modal-title" style={{color: currentEvent.dangerColor}}>{currentEvent.title}</h2>
            <p style={{fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--sand-100)'}}>
              {currentEvent.description} You have exactly <strong>{difficulty === 'easy' ? '5 minutes' : difficulty === 'medium' ? '3 minutes' : '90 seconds'}</strong> to recover as many finds as you can before the team must leave.
            </p>
            <div style={{marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <p style={{margin: '0 0 10px 0', fontWeight: 'bold', color: 'var(--sand-200)'}}>Select difficulty</p>
              <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
                <button className={`btn ${difficulty === 'easy' ? 'primary-btn' : ''}`} onClick={() => setDifficulty('easy')} style={{padding: '5px 15px', background: difficulty === 'easy' ? 'var(--accent)' : 'rgba(0,0,0,0.5)', color: difficulty === 'easy' ? '#111' : 'var(--sand-100)', border: '1px solid var(--sand-600)'}}>Easy (5 min)</button>
                <button className={`btn ${difficulty === 'medium' ? 'primary-btn' : ''}`} onClick={() => setDifficulty('medium')} style={{padding: '5px 15px', background: difficulty === 'medium' ? 'var(--accent)' : 'rgba(0,0,0,0.5)', color: difficulty === 'medium' ? '#111' : 'var(--sand-100)', border: '1px solid var(--sand-600)'}}>Medium (3 min)</button>
                <button className={`btn ${difficulty === 'hard' ? 'primary-btn' : ''}`} onClick={() => setDifficulty('hard')} style={{padding: '5px 15px', background: difficulty === 'hard' ? 'var(--accent)' : 'rgba(0,0,0,0.5)', color: difficulty === 'hard' ? '#111' : 'var(--sand-100)', border: '1px solid var(--sand-600)'}}>Hard (90 sec)</button>
              </div>
            </div>
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
              <button className="btn" onClick={onBackToMenu}>
                Back to menu
              </button>
              <button className="btn primary-btn" onClick={() => {
                initAudio();
                setTimeLeft(difficulty === 'easy' ? 300 : difficulty === 'medium' ? 180 : 90);
                setShowStormWarning(false);
                setIsPlaying(true);
              }}>1 Player <Pickaxe size={20} /></button>
              <button className="btn primary-btn" onClick={() => {
                initAudio();
                setTimeLeft(difficulty === 'easy' ? 300 : difficulty === 'medium' ? 180 : 90);
                setShowStormWarning(false);
                setIsPlaying(true);
              }}>2-player challenge <Pickaxe size={20} /></button>
            </div>
          </div>
        </div>
      )}

      {isTimeUp && (
        <div className="modal-overlay">
          <div className="modal-content glass-card warning-modal" style={{borderColor: '#ef4444'}}>
            <EventIcon size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
            <h2 className="modal-title" style={{color: '#ef4444'}}>Time is up</h2>
            <p style={{fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--sand-100)'}}>
              The site had to be cleared. You recovered <strong>{excavatedIds.size}</strong> find{excavatedIds.size === 1 ? '' : 's'} for study.
            </p>
            <button className="btn primary-btn" onClick={openDebrief}>Move finds to Sorting Tent <Tent size={20} /></button>
          </div>
        </div>
      )}

      {perfectClear && (
        <div className="modal-overlay">
          <div className="modal-content glass-card warning-modal">
            <CheckCircle2 size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
            <h2 className="modal-title" style={{color: 'var(--success)'}}>Site cleared</h2>
            <p style={{fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--sand-100)'}}>
              Every find was recovered with {formatTime(timeLeft)} remaining.
            </p>
            <button className="btn primary-btn" onClick={openDebrief}>Move finds to Sorting Tent <Tent size={20} /></button>
          </div>
        </div>
      )}

      {showDebrief && (
        <div className="modal-overlay">
          <div className="modal-content glass-card debrief-modal">
            <FileText size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
            <h2 className="modal-title" style={{color: 'var(--accent)'}}>Field notebook</h2>
            <div className="field-note-summary">
              <div className="field-note-stat"><strong>{ancientRecoveredCount}</strong><span>Ancient finds</span></div>
              <div className="field-note-stat"><strong>{disturbanceCount}</strong><span>Disturbance items</span></div>
              <div className="field-note-stat"><strong>{recoveredArtifacts.length}</strong><span>Total items</span></div>
            </div>
            <button className="btn primary-btn" onClick={() => onComplete(excavatedIds)}>Open Sorting Tent <Tent size={20} /></button>
          </div>
        </div>
      )}

      {/* Status Panel - Horizontal Compact Bar */}
      <div className="dig-status-panel">
        <div className="status-info-row">
          <span className="status-phase-label">Phase 1: Emergency excavation</span>
          <span className="status-sep">|</span>
          <span className="status-warning-text" style={{color: currentEvent.dangerColor}}>
             {currentEvent.title}
          </span>
        </div>
        
        <div className={`timer-horizontal ${timeDanger ? 'danger' : ''}`}>
           <Clock size={20} />
           <span className="timer-value">{formatTime(timeLeft)}</span>
           <span className="timer-label">TIME REMAINING</span>
        </div>

        <button 
          className="radar-btn-compact" 
          onClick={handleRadar}
          disabled={timeLeft <= (difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 10) || isLocked || !isPlaying}
        >
          <Radar size={16} /> Use radar (-{difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 10}s)
        </button>
      </div>

      {/* Game Panel */}
      <div className="dig-game-panel">
        <div className="instruction-row">
          <Lightbulb size={16} className="instruction-icon" />
          <span>Match pairs to recover finds before time runs out.</span>
        </div>
        
        <div className="game-board-container" ref={boardContainerRef} style={{ position: 'relative' }}>
          {isSurveying && (
            <div className="surveying-overlay">
               <div className="surveying-content">
                  <div className="surveying-scanner"></div>
                  <div className="surveying-text">SURVEYING AREA...</div>
               </div>
            </div>
          )}
          <div
            className="memory-grid"
            style={boardFit.width && boardFit.height ? {
              width: `${boardFit.width}px`,
              height: `${boardFit.height}px`,
              gap: '6px',
              gridTemplateColumns: `repeat(${boardColumns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${boardRows}, minmax(0, 1fr))`,
            } : undefined}
          >
            {tiles.map((tile, index) => {
              const isRevealed = tile.isFlipped || tile.isMatched;
              const tileTheme = getArtifactTheme(tile.artifact);
              return (
                <div 
                  key={tile.uniqueId} 
                  className={`memory-tile ${isRevealed ? 'revealed' : ''} ${tile.isMatched ? 'matched' : ''}`} 
                  onClick={() => handleTileClick(index)}
                >
                  <div className="tile-inner">
                    <div className="tile-front card-back-design">
                      <div className="card-back-pattern"></div>
                      <Pickaxe size={24} className="card-back-icon" />
                    </div>
                    <div
                      className={`tile-back artifact-texture artifact-texture--${tile.artifact.type} ${tile.artifact.isRedHerring ? 'artifact-texture--disturbance' : ''}`}
                      style={{ '--artifact-accent': tileTheme.accent, '--artifact-accent-soft': tileTheme.accentSoft }}
                    >
                      <div className="artifact-icon" style={{ color: 'var(--artifact-accent)' }}>
                        {getIcon(tile.artifact.type, 24)}
                      </div>
                      <div className="artifact-label">{tile.artifact.name}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compact Footer Panel */}
      <div className="dig-footer-panel-compact">
        <div className="footer-stats-group">
          <div className="footer-stat-item">
             <Trophy size={16} />
             <span>Recovered: <strong>{excavatedIds.size} / {activeArtifacts.length}</strong></span>
          </div>
          <div className="footer-stat-item">
             <RefreshCw size={16} />
             <span>Attempts: <strong>{attempts}</strong></span>
          </div>
        </div>
        
        <button className="help-btn-compact" onClick={() => setFeedback({message: "Match two identical finds to recover them. Some finds are ancient evidence; others are modern disturbance.", isError: false})}>
           <HelpCircle size={18} /> Field guide
        </button>
      </div>

      {feedback.message && (
        <div className={`sort-feedback ${feedback.isError ? 'error' : 'success'}`} style={{position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 100}}>
          {feedback.isError ? '❌ ' : '✅ '}{feedback.message}
        </div>
      )}

      {fieldNote && (
        <div className="field-note-card field-note-card--dig">
          <div className="field-note-heading">Field note</div>
          <div className="field-note-name">{fieldNote.name}</div>
          <div className="field-note-mini">
            <span><strong>Discovery:</strong> {fieldNote.discoveryMethod}</span>
            <span><strong>Type:</strong> {fieldNote.typeLabel}</span>
            <span><strong>Context:</strong> {fieldNote.eraLabel}</span>
          </div>
          <div className="field-note-foot">
            {fieldNote.isDisturbance ? 'Modern disturbance logged.' : 'Ancient evidence saved.'}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Phase 2: Sort
// ------------------------------------------------------------------
function SortPhase({ activeArtifacts, itemsLocation, setItemsLocation, onComplete, onBackToMenu }) {
  const [activeId, setActiveId] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', isError: false });
  const [attemptCounts, setAttemptCounts] = useState({});

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    const card = activeArtifacts.find(c => c.id === event.active.id);
    setHoveredCard(card);
    setFeedback({ message: '', isError: false });
  };

  const processSuccess = (card, categoryId) => {
    initAudio();
    playMatch();
    setItemsLocation(prev => ({
      ...prev,
      [card.id]: categoryId
    }));
    setAttemptCounts(prev => {
      if (!Object.prototype.hasOwnProperty.call(prev, card.id)) return prev;
      const next = { ...prev };
      delete next[card.id];
      return next;
    });
    setFeedback({ message: getSortingSuccessMessage(card, categoryId), isError: false });
    setHoveredCard(null); // Deselect on success
  };

  const processFailure = (card) => {
    initAudio();
    playError();
    setAttemptCounts(prev => ({
      ...prev,
      [card.id]: (prev[card.id] ?? 0) + 1,
    }));
    setFeedback({
      message: getSortingHint(card, attemptCounts[card.id] ?? 0),
      isError: true,
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over) {
      const card = activeArtifacts.find(c => c.id === active.id);
      if (card.type === over.id) {
        processSuccess(card, over.id);
      } else {
        processFailure(card);
      }
    }
  };

  const inventoryItems = activeArtifacts.filter(c => itemsLocation[c.id] === 'inventory');
  const sortedCount = activeArtifacts.length - inventoryItems.length;
  const isComplete = sortedCount === activeArtifacts.length;

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', isError: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback.message]);

  useEffect(() => {
    if (isComplete && activeArtifacts.length > 0) {
      initAudio();
      playWin();
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 } });
    }
  }, [isComplete, activeArtifacts.length]);

  return (
    <div className="phase-container sort-phase">
      <div className="phase-status-panel-compact">
        <div className="status-info-row">
          <div className="status-icon-box-small">
            <Tent size={20} color="var(--arch-accent)" />
          </div>
          <div className="status-text-content-horizontal">
            <h2>Phase 2: Sorting Tent</h2>
            <p className="hide-on-mobile">Classify each recovered find by the evidence it provides.</p>
          </div>
        </div>
        
        <div className="status-panel-progress-compact">
          <div className="progress-label-group">
            <span className="progress-label-mini">PROGRESS</span>
            <span className="progress-count-mini">{sortedCount} / {activeArtifacts.length}</span>
          </div>
          <div className="progress-bar-thin">
            <div className="progress-fill" style={{ width: `${(sortedCount / activeArtifacts.length) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="sort-main-layout">
          {/* Left Column: Inventory */}
          <div className="inventory-side-panel">
            <div className="panel-header">
              <h3>Evidence tray</h3>
              <p>Check the clue, then place the find in its best category.</p>
            </div>
            <div className="inventory-scroll-area">
              {inventoryItems.map(item => (
                 <DraggableArtifact 
                   key={item.id} 
                   artifact={item} 
                   onClick={setHoveredCard} 
                   isNeutral={true}
                 />
              ))}
              {inventoryItems.length === 0 && (
                <div className="empty-inventory-msg">
                  <CheckCircle2 size={32} color="var(--success)" />
                  <p>All finds sorted.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Clues and Categories */}
          <div className="sort-content-area">
            <div className="sort-board-shell">
            <div className="clue-card-wide sort-clue-card">
              <div className="clue-card-header">
                <div className="clue-label">Clue card</div>
                {hoveredCard && <div className="selected-item-tag">{hoveredCard.name}</div>}
              </div>
              <div className="clue-card-body">
                {hoveredCard ? (
                  <div className="clue-info-active animate-fade-in">
                    <div className="sort-clue-selected">
                      <div className="sort-clue-name">{hoveredCard.name}</div>
                    </div>
                    <p className="clue-prompt">What type of evidence is this?</p>
                    <p className="clue-text">"{hoveredCard.clue}"</p>
                    <div className="clue-metadata">
                      <span><strong>Discovery:</strong> {hoveredCard.discoveryMethod}</span>
                    </div>
                  </div>
                ) : (
                  <div className="clue-placeholder">
                    <p className="placeholder-main">No find selected</p>
                    <p className="placeholder-sub">Select a find to inspect its clue before sorting.</p>
                  </div>
                )}
                
                {feedback.message && (
                  <div className={`sort-feedback-inline ${feedback.isError ? 'error' : 'success'}`}>
                    {feedback.isError ? '❌ ' : '✅ '}{feedback.message}
                  </div>
                )}
              </div>
            </div>

            <div className="categories-section sort-categories-section">
              <div className="sort-categories-header">
                <h4 className="section-heading">Evidence categories: <span className="section-heading-copy">Drop each find into the category that best explains the clue.</span></h4>
              </div>
              <div className="categories-grid-custom">
                {CATEGORIES.map(cat => (
                  <CategoryBin 
                    key={cat.id} 
                    category={cat} 
                    items={activeArtifacts.filter(c => itemsLocation[c.id] === cat.id)} 
                    onArtifactClick={setHoveredCard}
                  />
                ))}
              </div>

              {isComplete && (
                <div className="sort-completion-strip animate-bounce-in">
                  <button className="btn primary-btn large-btn" onClick={onComplete}>
                    Open the Lab <ArrowRight size={22} />
                  </button>
                  <button className="btn" type="button" onClick={onBackToMenu}>
                    Back to Main Menu
                  </button>
                </div>
              )}
              {!isComplete && (
                <div className="sort-completion-strip">
                  <button className="btn" type="button" onClick={onBackToMenu}>
                    Back to Main Menu
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeId ? (
            <div className="artifact-card dragging neutral-artifact">
              <span className="artifact-card-icon">
                <Search size={22} />
              </span>
              <span className="artifact-card-copy">
                <span className="card-name">{activeArtifacts.find(c => c.id === activeId)?.name}</span>
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// ------------------------------------------------------------------
// Phase 3: Lab
// ------------------------------------------------------------------
function LabPhase({ activeArtifacts, itemsLocation, hypotheses, setHypotheses, currentScenario, onComplete, onBackToMenu }) {
  const currentScenarioData = currentScenario;
  const trayItems = useMemo(() => {
    const sortedItems = activeArtifacts.filter(item => itemsLocation[item.id] && itemsLocation[item.id] !== 'inventory');
    return sortedItems.length > 0 ? sortedItems : activeArtifacts;
  }, [activeArtifacts, itemsLocation]);

  const [selectedArtifactId, setSelectedArtifactId] = useState(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [draftNote, setDraftNote] = useState('');
  const [noticeDraft, setNoticeDraft] = useState('');

  const requiredCount = 3;
  const analysedEntries = Object.entries(hypotheses);
  const analysedCount = analysedEntries.length;
  const progressPercent = Math.min(100, (analysedCount / requiredCount) * 100);
  const isComplete = analysedCount >= requiredCount;
  const selectedArtifact = trayItems.find(item => item.id === selectedArtifactId) || null;
  const selectedAnalysis = selectedArtifact ? hypotheses[selectedArtifact.id] : null;
  const selectedPrompt = LAB_ANALYSIS_PROMPTS.find(prompt => prompt.id === selectedPromptId) || null;
  const answerChoices = useMemo(() => {
    if (!selectedArtifact) return [];
    return shuffleArrayWithSeed(
      (selectedArtifact.options ?? []).map((text, originalIndex) => ({ text, originalIndex })),
      selectedArtifact.id,
    );
  }, [selectedArtifact]);
  const notePlaceholder = selectedArtifact
    ? `${selectedArtifact.name} suggests... The clue that supports this is... This helps historians understand...`
    : 'Select a find, then use the sentence frames to build an evidence-based note.';

  const selectArtifact = (artifactId) => {
    setSelectedArtifactId(artifactId);
    const saved = hypotheses[artifactId];
    setSelectedAnswerIndex(typeof saved?.answerIndex === 'number' ? saved.answerIndex : null);
    setSelectedPromptId(saved?.promptId ?? null);
    setDraftNote(saved?.note ?? '');
    setNoticeDraft('');
  };

  const handleSaveAnalysis = () => {
    if (!selectedArtifact || selectedAnswerIndex === null || !selectedPrompt || !draftNote.trim()) return;

    const analysisRecord = {
      answerIndex: selectedAnswerIndex,
      answerText: selectedArtifact.options?.[selectedAnswerIndex] ?? '',
      answerIsCorrect: selectedAnswerIndex === selectedArtifact.correct,
      answerRationale: selectedArtifact.rationale,
      promptId: selectedPrompt.id,
      promptTitle: selectedPrompt.title,
      promptDescription: selectedPrompt.description,
      note: draftNote.trim(),
      clue: selectedArtifact.clue,
      question: selectedArtifact.question,
      typeLabel: getCategoryTitle(selectedArtifact.type),
      eraLabel: getArtifactEraLabel(selectedArtifact),
    };

    setHypotheses(prev => ({
      ...prev,
      [selectedArtifact.id]: analysisRecord,
    }));
    setSelectedArtifactId(null);
    setSelectedAnswerIndex(null);
    setSelectedPromptId(null);
    setDraftNote('');
  };

  const addNoteStem = (stem) => {
    setDraftNote(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${stem}` : stem;
    });
  };

  const savedAnalyses = analysedEntries.map(([artifactId, analysis], index) => {
    const artifact = activeArtifacts.find(item => item.id === artifactId);
    return {
      artifactId,
      analysis,
      artifact,
      slot: index + 1,
    };
  });

  return (
    <div className="phase-container lab-phase">
      <div className="phase-status-panel-compact lab-status-panel">
        <div className="status-panel-info">
          <div className="status-icon-box-small">
            <Search size={20} />
          </div>
          <div className="status-text-content-horizontal">
            <h2>Phase 3: The Lab</h2>
            <p>Choose three finds. Read the clue, then record what each one reveals.</p>
          </div>
        </div>

        <div className="status-panel-progress-compact">
          <div className="progress-label-group">
            <span className="progress-label-mini">PROGRESS</span>
            <span className="progress-count-mini">{analysedCount} / {requiredCount} analysed</span>
          </div>
          <div className="progress-bar-thin">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {currentScenarioData && (
        <div className="lab-briefing-card">
          <div className="lab-briefing-title">
            <ScrollText size={16} />
            <span>Briefing</span>
          </div>
          <p>{currentScenarioData.historicalContext}</p>
        </div>
      )}

      <div className="lab-layout">
        <section className="lab-panel lab-tray-panel">
          <div className="lab-panel-heading">Evidence Tray</div>
          <p className="lab-panel-subheading">Choose one sorted find to examine.</p>

          <div className="lab-tray-list">
            {trayItems.map(item => {
              const theme = getArtifactTheme(item);
              const isSelected = selectedArtifactId === item.id;
              const isAnalysed = !!hypotheses[item.id];

              return (
                  <button
                    key={item.id}
                    type="button"
                    className={`lab-tray-card ${isSelected ? 'selected' : ''} ${isAnalysed ? 'analysed' : ''}`}
                    onClick={() => selectArtifact(item.id)}
                  >
                  <div className="lab-tray-icon" style={{ color: theme.accent }}>
                    {getIcon(item.type, 18)}
                  </div>
                  <div className="lab-tray-copy">
                    <div className="lab-tray-name">{item.name}</div>
                    <div className="lab-tray-meta">{getCategoryTitle(item.type)}</div>
                  </div>
                  {isAnalysed && <CheckCircle2 size={16} className="lab-tray-check" />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="lab-panel lab-bench-panel">
          <div className="lab-panel-heading">Analysis Bench</div>
          <p className="lab-panel-subheading">Study the clue, answer the question, then write a short research note.</p>

          {!selectedArtifact ? (
            <div className="lab-empty-state">
              <div className="lab-empty-icon"><Search size={26} /></div>
              <div className="lab-empty-title">No find selected</div>
              <p>Select a find from the Evidence Tray to begin analysis.</p>
            </div>
          ) : (
            <div className="lab-bench-content">
              <div className="lab-artifact-card">
                <div className="lab-artifact-icon" style={{ color: getArtifactTheme(selectedArtifact).accent }}>
                  {getIcon(selectedArtifact.type, 28)}
                </div>
                <div className="lab-artifact-copy">
                  <div className="lab-artifact-name">{selectedArtifact.name}</div>
                  <div className="lab-artifact-meta">
                    <span>{getCategoryTitle(selectedArtifact.type)}</span>
                    <span>{getArtifactEraLabel(selectedArtifact)}</span>
                  </div>
                </div>
              </div>

              <div className="lab-inspection-box">
                <div className="lab-label">Inspect the Evidence</div>
                <div className="lab-inspection-grid">
                  <div className="lab-inspection-media">
                    {selectedArtifact.image ? (
                      <img
                        src={selectedArtifact.image}
                        alt={selectedArtifact.name}
                        className="lab-inspection-image"
                      />
                    ) : (
                      <div className="lab-inspection-fallback">
                        <div className="lab-inspection-fallback-icon">
                          {getIcon(selectedArtifact.type, 26)}
                        </div>
                        <p>Image not available yet - use the clue and discovery method.</p>
                      </div>
                    )}
                  </div>

                  <div className="lab-inspection-details">
                    <div className="lab-inspection-name">{selectedArtifact.name}</div>
                    <div className="lab-inspection-meta">
                      <span>{getCategoryTitle(selectedArtifact.type)}</span>
                      <span>{getArtifactEraLabel(selectedArtifact)}</span>
                    </div>
                    <div className="lab-inspection-method">
                      <strong>Discovery method:</strong> {selectedArtifact.discoveryMethod}
                    </div>
                    <div className="lab-inspection-clue">
                      <strong>Clue:</strong> {selectedArtifact.clue}
                    </div>
                    <div className="lab-notice-input">
                      <label htmlFor={`lab-notice-${selectedArtifact.id}`}>What do you notice?</label>
                      <textarea
                        id={`lab-notice-${selectedArtifact.id}`}
                        value={noticeDraft}
                        onChange={(e) => setNoticeDraft(e.target.value)}
                        placeholder="I notice..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lab-clue-box">
                <div className="lab-label">Clue</div>
                <p>{selectedArtifact.clue}</p>
                <div className="lab-clue-method">{selectedArtifact.discoveryMethod}</div>
              </div>

              <div className="lab-question-box">
                <div className="lab-label">Analysis Question</div>
                <p>{selectedArtifact.question}</p>
              </div>

              <div className="lab-answer-box">
                <div className="lab-label">Choose the best interpretation</div>
                <div className="lab-answer-grid">
                  {answerChoices.map(choice => {
                    const isSelected = selectedAnswerIndex === choice.originalIndex;
                    const isCorrect = choice.originalIndex === selectedArtifact.correct;
                    const showResult = selectedAnswerIndex !== null;
                    const optionState = !showResult
                      ? ''
                      : isSelected
                        ? (isCorrect ? 'correct' : 'incorrect')
                        : '';

                    return (
                      <button
                        key={choice.originalIndex}
                        type="button"
                        className={`lab-answer-card ${isSelected ? 'selected' : ''} ${optionState}`}
                        onClick={() => setSelectedAnswerIndex(choice.originalIndex)}
                        aria-pressed={isSelected}
                      >
                        <span className="lab-answer-index">{String.fromCharCode(65 + choice.originalIndex)}</span>
                        <span className="lab-answer-text">{choice.text}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedAnswerIndex !== null && (
                  <div className={`lab-answer-feedback ${selectedAnswerIndex === selectedArtifact.correct ? 'correct' : 'incorrect'}`}>
                    <strong>
                      {selectedAnswerIndex === selectedArtifact.correct ? 'Good evidence thinking' : 'Try again'}
                    </strong>
                    <p>{selectedArtifact.rationale}</p>
                  </div>
                )}
              </div>

              <div className="lab-prompt-box">
                <div className="lab-label">Choose the reveal focus</div>
                <div className="lab-prompt-grid">
                  {LAB_ANALYSIS_PROMPTS.map(prompt => {
                    const PromptIcon = prompt.icon;
                    const isSelected = selectedPromptId === prompt.id;
                    return (
                      <button
                        key={prompt.id}
                        type="button"
                        className={`lab-prompt-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedPromptId(prompt.id)}
                        aria-pressed={isSelected}
                      >
                        <PromptIcon size={16} aria-hidden="true" />
                        <span className="lab-prompt-title">{prompt.title}</span>
                        <span className="lab-prompt-desc">{prompt.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lab-note-editor">
                <label htmlFor="lab-note">Research note</label>
                <div className="lab-note-scaffold">
                  <div>
                    <strong>Write like a historian:</strong>
                    <span> make a claim, use the clue, then explain what it reveals.</span>
                  </div>
                  {selectedPrompt && (
                    <p>
                      Focus: <strong>{selectedPrompt.title}</strong> - {selectedPrompt.description}.
                    </p>
                  )}
                  <div className="lab-stem-row" aria-label="Sentence starters">
                    {LAB_NOTE_STEMS.map(stem => (
                      <button
                        key={stem}
                        type="button"
                        className="lab-stem-chip"
                        onClick={() => addNoteStem(stem)}
                      >
                        {stem}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  id="lab-note"
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  placeholder={notePlaceholder}
                  rows={4}
                />
                <div className="lab-note-footer">
                  <span>{draftNote.trim().length} characters</span>
                  <span>{selectedAnalysis ? 'Saved analysis loaded' : 'Claim + clue + meaning'}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn primary-btn lab-save-btn"
                disabled={selectedAnswerIndex === null || !selectedPrompt || !draftNote.trim()}
                onClick={handleSaveAnalysis}
              >
                Save analysis <CheckCircle2 size={18} />
              </button>
            </div>
          )}
        </section>

        <section className="lab-panel lab-notes-panel">
          <div className="lab-panel-heading">Research Notes</div>
          <p className="lab-panel-subheading">Complete three short analyses.</p>

          <div className="lab-notes-list">
            {[0, 1, 2].map(index => {
              const saved = savedAnalyses[index];
              return (
                <div key={index} className={`lab-note-card ${saved ? 'filled' : 'empty'}`}>
                  <div className="lab-note-slot">Analysis {index + 1}</div>
                  {saved ? (
                    <>
                      <div className="lab-note-artifact">{saved.artifact?.name ?? 'Unknown find'}</div>
                      <div className="lab-note-reveal">{saved.analysis?.promptTitle ?? 'Research note'}</div>
                      <p className="lab-note-text">{saved.analysis?.note ?? ''}</p>
                    </>
                  ) : (
                    <div className="lab-note-empty">Select find - choose reveal - explain</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="lab-footer-strip">
        <div className="lab-footer-flow">Choose a find - read the clue - choose a reveal - save a note</div>
        {isComplete ? (
          <div className="lab-footer-actions">
            <button
              type="button"
              className="btn"
              onClick={onBackToMenu}
            >
              Back to Main Menu
            </button>
            <button
              type="button"
              className="btn primary-btn lab-continue-btn"
              onClick={() => {
                initAudio();
                playWin();
                onComplete(currentScenarioData?.name || 'Unknown Dig Site', currentScenarioData?.id || null);
              }}
            >
              Continue to Museum <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="lab-footer-actions">
            <button type="button" className="btn" onClick={onBackToMenu}>
              Back to Main Menu
            </button>
            <div className="lab-footer-prompt">Complete three analyses to continue.</div>
          </div>
        )}
      </div>
    </div>
  );
}
// ------------------------------------------------------------------
// Phase 4: Museum Curator (Student selects items and writes labels)
// ------------------------------------------------------------------
function MuseumPhase({
  activeArtifacts,
  excavatedIds,
  hypotheses,
  curatedItems,
  setCuratedItems,
  plaques,
  setPlaques,
  finalExhibitionStatement,
  setFinalExhibitionStatement,
  onComplete,
  onBackToMenu,
}) {
  const [editingId, setEditingId] = useState(null);

  const analyzedItems = activeArtifacts.filter(a => excavatedIds.has(a.id) && hypotheses[a.id] !== undefined);
  const editingItem = analyzedItems.find(a => a.id === editingId) || null;
  const editingAnalysis = editingItem ? hypotheses[editingItem.id] : null;
  
  const toggleItem = (id) => {
    if (curatedItems.includes(id)) {
      setCuratedItems(curatedItems.filter(i => i !== id));
      if (editingId === id) setEditingId(null);
    } else {
      if (curatedItems.length < 3) {
        setCuratedItems([...curatedItems, id]);
        setEditingId(id);
      }
    }
  };

  const isReady = curatedItems.length === 3
    && curatedItems.every(id => plaques[id] && plaques[id].length > 10)
    && finalExhibitionStatement.trim().length > 12;

  return (
    <div className="phase-container museum-phase">
      <div className="phase-header">
        <h2><Library size={28} /> Museum Exhibition: What Does the Evidence Show?</h2>
        <p>Choose your strongest finds and explain what they teach us about ancient people.</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem', flex: 1, minHeight: 0}}>
        {/* Artifact List */}
        <div className="glass-card" style={{padding: '0.75rem', overflowY: 'auto'}}>
          <h3 style={{color: 'var(--accent)', marginBottom: '0.5rem', borderBottom: '1px solid var(--sand-600)', paddingBottom: '4px', fontSize: '1rem'}}>Inventory</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
            {analyzedItems.map(item => (
              <div 
                key={item.id} 
                className={`artifact-list-item ${curatedItems.includes(item.id) ? 'selected' : ''}`}
                onClick={() => toggleItem(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '8px', cursor: 'pointer',
                  background: curatedItems.includes(item.id) ? 'rgba(232, 158, 93, 0.2)' : 'rgba(0,0,0,0.3)',
                  border: curatedItems.includes(item.id) ? '1px solid var(--accent)' : '1px solid var(--sand-600)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{color: curatedItems.includes(item.id) ? 'var(--accent)' : 'var(--sand-300)'}}>
                  {getIcon(item.type)}
                </div>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 'bold', color: '#fff'}}>{item.name}</div>
                  <div style={{fontSize: '0.8rem', color: 'var(--sand-300)'}}>{getCategoryTitle(item.type)}</div>
                </div>
                {curatedItems.includes(item.id) && <CheckCircle2 size={16} color="var(--accent)" />}
              </div>
            ))}
          </div>
        </div>

        {/* Display Case */}
        <div className="display-case-area">
          <div className="museum-case glass-card" style={{
            background: 'linear-gradient(to bottom, rgba(30,30,35,0.8), rgba(15,15,20,0.9))',
            padding: '1rem', minHeight: '100%', position: 'relative', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column'
          }}>
            <h3 style={{textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--sand-400)', marginBottom: '1rem', fontSize: '0.85rem'}}>Curator's Exhibition Report</h3>
            
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem'}}>
              {[0, 1, 2].map(idx => {
                const itemId = curatedItems[idx];
                const item = analyzedItems.find(a => a.id === itemId);
                return (
                  <div key={idx} 
                    className={`display-slot ${item ? 'active' : ''}`}
                    onClick={() => item && setEditingId(itemId)}
                    style={{
                      width: '100px', height: '110px', border: '2px dashed var(--sand-600)', borderRadius: '12px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: editingId === itemId ? 'rgba(232, 158, 93, 0.1)' : 'transparent',
                      borderColor: editingId === itemId ? 'var(--accent)' : 'var(--sand-600)',
                      cursor: item ? 'pointer' : 'default', transition: 'all 0.3s'
                    }}
                  >
                    {item ? (
                      <>
                        <div style={{color: 'var(--accent)', marginBottom: '8px'}}>{getIcon(item.type)}</div>
                        <div style={{fontSize: '0.7rem', textAlign: 'center', padding: '0 5px', color: '#fff'}}>{item.name}</div>
                      </>
                    ) : (
                      <span style={{color: 'var(--sand-600)', fontSize: '0.8rem'}}>Slot {idx+1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {editingItem ? (
              <div className="plaque-editor animate-fade-in" style={{background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--accent)', flex: 1}}>
                <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem', height: '100%'}}>
                  {editingItem.image && (
                    <div style={{width: '180px', flexShrink: 0}}>
                      <img 
                        src={editingItem.image} 
                        alt="Artifact"
                        style={{width: '100%', height: 'auto', borderRadius: '8px', border: '1px solid var(--sand-600)', boxShadow: '0 4px 20px rgba(0,0,0,0.6)'}}
                      />
                    </div>
                  )}
                  <div style={{flex: 1}}>
                      <label style={{display: 'block', color: 'var(--accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px'}}>Exhibition Plaque: {editingItem.name}</label>
                      <textarea 
                        placeholder="Write a museum label. Explain what this evidence suggests and why it matters."
                        value={plaques[editingId] || ''}
                        onChange={(e) => setPlaques({...plaques, [editingId]: e.target.value})}
                        style={{
                          width: '100%', flex: 1, minHeight: '80px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--sand-600)',
                          color: 'var(--sand-100)', padding: '10px', borderRadius: '8px', resize: 'none', fontFamily: 'inherit',
                          lineHeight: '1.4', fontSize: '0.9rem'
                        }}
                      />
                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem'}}>
                      <span style={{color: (plaques[editingId]?.length || 0) > 10 ? 'var(--success)' : '#ef4444'}}>
                        {(plaques[editingId]?.length || 0) > 10 ? '✓ Minimum length met' : '⚠ Description too short'}
                      </span>
                      <span style={{color: 'var(--sand-400)'}}>{plaques[editingId]?.length || 0} characters</span>
                    </div>
                    <div className="museum-reflection-card">
                      <div className="museum-reflection-title">Connect evidence to interpretation</div>
                      <div><strong>Evidence:</strong> {editingItem.name}</div>
                      <div><strong>Category:</strong> {getCategoryTitle(editingItem.type)}</div>
                      <div><strong>What is it?</strong> {editingItem.clue}</div>
                      <div>
                        <strong>What does it tell us?</strong>{' '}
                        {editingAnalysis && typeof editingAnalysis === 'object'
                          ? `${editingAnalysis.promptTitle}: ${editingAnalysis.note}`
                          : 'Use your lab note and plaque to explain what this find suggests.'}
                      </div>
                      <div><strong>How confident are we?</strong> Strongest when the clue and lab note support the same idea.</div>
                      <div><strong>What question do we still have?</strong> What other evidence would help confirm this interpretation?</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{textAlign: 'center', color: 'var(--sand-400)', marginTop: '4rem'}}>
                <Library size={48} style={{opacity: 0.2, marginBottom: '1rem'}} />
                <p>Select artifacts from your inventory to begin curation.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="museum-final-statement glass-card">
        <div>
          <h3>Final exhibition statement</h3>
          <p>Use all three finds to make one clear historical interpretation.</p>
        </div>
        <textarea
          value={finalExhibitionStatement}
          onChange={(e) => setFinalExhibitionStatement(e.target.value)}
          placeholder="Our exhibition shows that this civilisation... / The evidence suggests that these people..."
        />
        <div className="museum-final-statement-footer">
          <span>{finalExhibitionStatement.trim().length} characters</span>
          <span>{finalExhibitionStatement.trim().length > 12 ? 'Reflection ready' : 'Add a final statement to open the exhibition'}</span>
        </div>
      </div>

      <div style={{marginTop: '1rem', textAlign: 'center'}}>
        <button 
          className="btn primary-btn" 
          disabled={!isReady}
          style={{opacity: isReady ? 1 : 0.5, padding: '0.75rem 2rem'}}
          onClick={() => {
            initAudio();
            onComplete();
          }}
        >
          OPEN EXHIBITION <Users size={18} />
        </button>
        {!isReady && <p style={{fontSize: '0.8rem', color: 'var(--sand-400)', marginTop: '4px'}}>Curate 3 items, write plaques, and add a final statement to finish.</p>}
        <div style={{marginTop: '0.75rem'}}>
          <button className="btn" type="button" onClick={onBackToMenu}>
            Back to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

const getLegacyAnalysisFeedback = (selectedIndex, correctIndex) => {
  if (selectedIndex === correctIndex) {
    return 'This interpretation matches the strongest evidence from the clue.';
  }
  return 'This interpretation needs more evidence. Historians revise ideas when the clues point another way.';
};

const BUREAU_TAG_LABELS = {
  burial: 'burial and remembrance',
  ritual: 'ritual practice',
  afterlife: 'beliefs about the afterlife',
  ancestors: 'ancestor memory',
  trade: 'trade and exchange',
  administration: 'administration and organisation',
  records: 'record-keeping',
};

const getBureauTagLabel = (tag = '') => BUREAU_TAG_LABELS[tag] ?? tag.replace(/_/g, ' ');

const getBureauCivilisationOptions = (bureauCase) => bureauCase?.civilisationOptions || bureauCase?.answerOptions || [];

const getBureauCorrectCivilisationIndex = (bureauCase) => {
  if (Number.isInteger(bureauCase?.correctCivilisation)) return bureauCase.correctCivilisation;
  if (Number.isInteger(bureauCase?.correctAnswer)) return bureauCase.correctAnswer;
  return 0;
};

const getBureauCorrectCivilisationLabel = (bureauCase) => {
  const options = getBureauCivilisationOptions(bureauCase);
  const correctIndex = getBureauCorrectCivilisationIndex(bureauCase);
  return options[correctIndex] || bureauCase?.civilisation || 'Unknown civilisation';
};

const getBureauComparisonKeyVariants = (firstCase, secondCase) => {
  const idPair = [firstCase?.id, secondCase?.id].filter(Boolean);
  const titlePair = [firstCase?.caseTitle, secondCase?.caseTitle].filter(Boolean);
  const sortedIdPair = [...idPair].sort();
  const sortedTitlePair = [...titlePair].sort();
  return [
    idPair.join('::'),
    idPair.join('|'),
    idPair.join('__'),
    idPair.join('+'),
    idPair.slice().reverse().join('::'),
    idPair.slice().reverse().join('|'),
    idPair.slice().reverse().join('__'),
    idPair.slice().reverse().join('+'),
    sortedIdPair.join('::'),
    sortedIdPair.join('|'),
    sortedIdPair.join('__'),
    sortedIdPair.join('+'),
    titlePair.join('::'),
    titlePair.join('|'),
    titlePair.slice().reverse().join('::'),
    titlePair.slice().reverse().join('|'),
    sortedTitlePair.join('::'),
    sortedTitlePair.join('|'),
  ].filter(Boolean);
};

const normalizeBureauComparisonChallenge = (entry, firstCase, secondCase) => {
  if (!entry || typeof entry !== 'object') return null;

  const source = entry.challenge
    || entry.comparison
    || entry.comparisonChallenge
    || entry.data
    || entry;

  if (!source || typeof source !== 'object') return null;

  const options = Array.isArray(source.options)
    ? source.options.filter(option => typeof option === 'string' && option.trim())
    : [];

  if (options.length === 0) return null;

  const maxIndex = Math.max(0, options.length - 1);
  const correctAnswer = Number.isInteger(source.correctAnswer)
    ? Math.min(Math.max(source.correctAnswer, 0), maxIndex)
    : 0;

  return {
    title: source.title || `${firstCase?.caseTitle || 'Case 1'} + ${secondCase?.caseTitle || 'Case 2'}`,
    question: source.question
      || source.prompt
      || `What theme links ${firstCase?.caseTitle || 'the first case'} and ${secondCase?.caseTitle || 'the second case'}?`,
    options,
    correctAnswer,
    explanation: source.explanation
      || source.feedback
      || 'These cases can be compared to show how archaeologists connect evidence across discoveries.',
  };
};

const findExplicitBureauComparisonChallenge = (firstCase, secondCase) => {
  const pairKey = [firstCase?.civilisation, secondCase?.civilisation].filter(Boolean).sort().join('||');
  if (pairKey && BUREAU_COMPARISON_BY_PAIR.has(pairKey)) {
    const challenge = normalizeBureauComparisonChallenge(
      BUREAU_COMPARISON_BY_PAIR.get(pairKey),
      firstCase,
      secondCase,
    );
    if (challenge) return challenge;
  }

  const pairKeys = getBureauComparisonKeyVariants(firstCase, secondCase);
  const sources = [
    firstCase?.comparisonChallenge,
    firstCase?.comparison,
    firstCase?.comparisonData,
    secondCase?.comparisonChallenge,
    secondCase?.comparison,
    secondCase?.comparisonData,
  ].filter(Boolean);

  const resolveFromSource = (source) => {
    if (Array.isArray(source)) {
      for (const entry of source) {
        const challenge = normalizeBureauComparisonChallenge(entry, firstCase, secondCase);
        if (challenge) return challenge;
      }
      return null;
    }

    if (typeof source !== 'object') return null;

    for (const key of pairKeys) {
      if (source[key]) {
        const challenge = normalizeBureauComparisonChallenge(source[key], firstCase, secondCase);
        if (challenge) return challenge;
      }
    }

    const directChallenge = normalizeBureauComparisonChallenge(source, firstCase, secondCase);
    if (directChallenge) return directChallenge;

    for (const value of Object.values(source)) {
      if (Array.isArray(value)) {
        for (const entry of value) {
          const challenge = normalizeBureauComparisonChallenge(entry, firstCase, secondCase);
          if (challenge) return challenge;
        }
      }
    }

    return null;
  };

  for (const source of sources) {
    const challenge = resolveFromSource(source);
    if (challenge) return challenge;
  }

  return null;
};

const buildBureauComparisonChallenge = (firstCase, secondCase) => {
  const explicitChallenge = findExplicitBureauComparisonChallenge(firstCase, secondCase);
  if (explicitChallenge) return explicitChallenge;

  const sharedTags = (firstCase?.comparisonTags || []).filter(tag => secondCase?.comparisonTags?.includes(tag));
  const focusTags = sharedTags.length > 0
    ? sharedTags
    : (firstCase?.comparisonTags || []).slice(0, 2);
  const label = focusTags.length > 0
    ? focusTags.map(getBureauTagLabel).join(' and ')
    : 'historical evidence';

  return {
    title: `${firstCase?.caseTitle || 'Case 1'} + ${secondCase?.caseTitle || 'Case 2'}`,
    question: `What theme links ${firstCase?.caseTitle || 'the first case'} and ${secondCase?.caseTitle || 'the second case'}?`,
    options: [
      `Both cases show ${label}.`,
      'Both cases prove the same civilisation owned every clue.',
      'Both cases are modern and not ancient.',
      'Both cases only tell us about weather.',
    ],
    correctAnswer: 0,
    explanation: `Both cases connect through ${label}. Historians compare evidence to notice patterns across different discoveries.`,
  };
};

const createBureauComparisonChallenge = (caseResults = []) => {
  const solvedCases = caseResults
    .map(result => BUREAU_CASES_BY_ID.get(result.caseId))
    .filter(Boolean);
  const secondLast = solvedCases[solvedCases.length - 2] ?? null;
  const last = solvedCases[solvedCases.length - 1] ?? null;
  return buildBureauComparisonChallenge(secondLast, last);
};

const createNewBureauSession = (startPhase = 'bureauBriefing') => ({
  mode: 'bureau',
  phase: startPhase,
  score: 0,
  caseIndex: 0,
  currentTier: 1,
  evidenceFilter: createInitialBureauEvidenceFilter(),
  showEvidenceFilter: true,
  selectedAnswerIndex: null,
  selectedClaimCivilisation: '',
  selectedLogAnswerIndex: null,
  selectedComparisonAnswerIndex: null,
  pendingCaseOutcome: null,
  caseResults: [],
  comparisonResults: [],
  comparisonResult: null,
  latestOutcome: null,
});

const AUTOSAVE_KEY = 'archaeologyDigApp.autosave.v1';
const AUTOSAVE_VERSION = 1;
const SAVE_APP_ID = 'archaeology-dig-app';

const createSavePayload = ({
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
    currentScenarioId: currentScenario.id,
    currentEventId: currentEvent.id,
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
  }),
});

const allArtifactsById = () => {
  const artifacts = SCENARIOS.flatMap(scenario => scenario.evidence || []);
  return new Map([...artifacts, ...RED_HERRINGS].map(item => [item.id, item]));
};

const rebuildSavedSession = (saved) => {
  if (!saved || saved.app !== SAVE_APP_ID || saved.saveVersion !== AUTOSAVE_VERSION) {
    throw new Error('This is not a valid Archaeology Dig save file.');
  }

  if (saved.mode === 'bureau') {
    const bureauState = saved.bureauState || {};
    const baseState = createNewBureauSession(saved.phase || bureauState.phase || 'bureauBriefing');
    return {
      ...baseState,
      ...bureauState,
      phase: saved.phase || bureauState.phase || baseState.phase,
      savedAt: saved.savedAt || null,
    };
  }

  const scenario = SCENARIOS.find(item => item.id === saved.currentScenarioId);
  const event = RANDOM_EVENTS.find(item => item.id === saved.currentEventId);
  const artifactsById = allArtifactsById();
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
    trainingPlacements: Array.from({ length: TRAINING_STAGES.length }, (_, index) => (
      Array.isArray(saved.trainingPlacements) ? saved.trainingPlacements[index] ?? null : null
    )),
    savedAt: saved.savedAt || null,
  };
};

const createNewGameSession = (mode = 'archaeology', startPhase = mode === 'bureau' ? 'bureauBriefing' : 'menu') => {
  if (mode === 'bureau') {
    return createNewBureauSession(startPhase);
  }

  const scen = SCENARIOS && SCENARIOS.length > 0
    ? SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
    : null;

  if (!scen || !scen.evidence) {
    console.error('Critical Error: No scenario or evidence found during initialization.');
    return null;
  }

  const evt = RANDOM_EVENTS && RANDOM_EVENTS.length > 0
    ? RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)]
    : { title: 'Emergency', time: 60, icon: AlertTriangle };

  // Choose exactly 11 items from the scenario + 1 red herring = 12 items total (24 tiles)
  const scenarioArtifacts = [...scen.evidence].sort(() => 0.5 - Math.random()).slice(0, 11);
  const selectedRedHerring = (RED_HERRINGS && RED_HERRINGS.length > 0)
    ? RED_HERRINGS[Math.floor(Math.random() * RED_HERRINGS.length)]
    : { id: 'fallback', name: 'Unknown Object', type: 'objects', options: ['Ancient', 'Modern'], correct: 1 };

  return {
    mode: 'archaeology',
    phase: startPhase,
    currentScenario: scen,
    currentEvent: evt,
    activeArtifacts: [...scenarioArtifacts, selectedRedHerring].sort(() => 0.5 - Math.random()),
    trainingPlacements: Array(TRAINING_STAGES.length).fill(null),
  };
};

const loadAutosave = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw);
    if (!saved.app || saved.app !== SAVE_APP_ID || saved.saveVersion !== AUTOSAVE_VERSION) return null;
    if (saved.phase === 'menu') return null;
    return rebuildSavedSession(saved);
  } catch (error) {
    console.warn('Could not load autosaved archaeology game.', error);
    return null;
  }
};

function ReportPhase({
  activeArtifacts,
  itemsLocation,
  hypotheses,
  siteName,
  finalConclusion,
  currentScenario,
  onBack,
  currentEvent,
  onRetry,
  onBackToMenu,
  curatedItems = [],
  plaques = {},
  finalExhibitionStatement = '',
}) {
  const [printMode, setPrintMode] = useState('report');
  const analysedItems = activeArtifacts.filter(item => hypotheses[item.id] !== undefined);
  const curatedFinds = curatedItems
    .map(id => activeArtifacts.find(item => item.id === id))
    .filter(Boolean);
  const currentCivilization = SCENARIOS.find(s => s.id === finalConclusion)?.civilization || currentScenario?.civilization || 'Unknown civilisation';
  const eventTitle = currentEvent?.title ? currentEvent.title.replace('!', '') : 'Emergency excavation';

  const summary = useMemo(() => {
    const categoriesUsed = CATEGORIES
      .map(cat => ({
        ...cat,
        items: activeArtifacts.filter(item => itemsLocation[item.id] === cat.id),
      }))
      .filter(cat => cat.items.length > 0);

    const evidenceSentence = `Your team recovered ${activeArtifacts.length} find${activeArtifacts.length === 1 ? '' : 's'} during the ${eventTitle.toLowerCase()}.`;
    const analysisSentence = analysedItems.length > 0
      ? `You completed ${analysedItems.length} evidence-based analysis note${analysedItems.length === 1 ? '' : 's'}.`
      : 'No analysis notes were recorded.';

    return { categoriesUsed, evidenceSentence, analysisSentence };
  }, [activeArtifacts, analysedItems.length, eventTitle, itemsLocation]);

  useEffect(() => {
    const resetPrintMode = () => setPrintMode('report');
    window.addEventListener('afterprint', resetPrintMode);
    return () => window.removeEventListener('afterprint', resetPrintMode);
  }, []);

  const handlePrint = (mode = 'report') => {
    setPrintMode(mode);
    window.setTimeout(() => window.print(), 60);
  };

  return (
    <div className={`report-container print-mode-${printMode}`} style={{padding: '1rem', maxWidth: '900px'}}>
      <div className="report-paper" style={{padding: '1.5rem'}}>
        <div className="report-header" style={{marginBottom: '1rem', paddingBottom: '0.5rem'}}>
          <h2 style={{fontSize: '1.5rem'}}>Archaeologist's Final Report</h2>
          <p className="report-subtitle" style={{fontSize: '1rem'}}>Dig Site: {siteName}</p>
        </div>

        <div className="site-conclusion report-context-card" style={{padding: '1rem', marginBottom: '1rem'}}>
          <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}><Search size={18} style={{verticalAlign:'middle', marginBottom:'2px'}}/> Site Context</h3>
          <p style={{fontSize: '0.9rem'}}><strong>Civilisation / context:</strong> {currentCivilization}</p>
          <p style={{fontSize: '0.9rem'}}><strong>Evidence recovered:</strong> {activeArtifacts.length}</p>
          <p style={{fontSize: '0.9rem'}}><strong>Analyses completed:</strong> {analysedItems.length}</p>
          <p style={{marginTop: '6px', fontStyle: 'italic', fontSize: '0.85rem'}}>
            Historians and archaeologists use evidence carefully to explain what the past may have been like.
          </p>
        </div>

        <div className="site-conclusion evidence-summary-card" style={{marginTop: '1rem', padding: '1rem', marginBottom: '1rem'}}>
          <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}><Search size={18} style={{verticalAlign:'middle', marginBottom:'2px'}}/> Evidence Summary</h3>
          <p className="conclusion-vol" style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>{summary.evidenceSentence}</p>
          <p className="conclusion-vol" style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>{summary.analysisSentence}</p>
          {finalExhibitionStatement && (
            <p className="conclusion-vol" style={{fontSize: '0.9rem', marginBottom: 0}}>
              <strong>Final exhibition statement:</strong> {finalExhibitionStatement}
            </p>
          )}
        </div>

        {curatedFinds.length > 0 && (
          <div className="museum-exhibition-section">
             <div className="museum-export-cover">
               <div className="museum-export-kicker">Museum Exhibition Assessment</div>
               <h3><Library size={22} /> Evidence From The Ancient Past</h3>
               <p>
                 Curate three significant finds and explain what they reveal about ancient people, places, beliefs,
                 technology or environments.
               </p>
               <div className="museum-export-meta">
                 <span>Name / group: ____________________</span>
                 <span>Class: __________</span>
                 <span>Dig site: {siteName}</span>
               </div>
               <div className="museum-export-context">
                 <strong>Civilisation / context:</strong> {currentCivilization}
               </div>
             </div>

             <div className="museum-export-summary">
               <div>
                 <strong>Curator task</strong>
                 <span>Select important evidence, write clear museum labels, and support ideas with clues.</span>
               </div>
               <div>
                 <strong>Evidence used</strong>
                 <span>{curatedFinds.length} star find{curatedFinds.length === 1 ? '' : 's'} from {activeArtifacts.length} recovered find{activeArtifacts.length === 1 ? '' : 's'}.</span>
               </div>
               <div>
                 <strong>Historical thinking</strong>
                 <span>Claim + clue + meaning</span>
               </div>
             </div>

             {finalExhibitionStatement && (
               <div className="museum-export-final-statement">
                 <strong>Final exhibition statement</strong>
                 <p>{finalExhibitionStatement}</p>
               </div>
             )}

             <div className="museum-export-grid">
                {curatedFinds.map((item, index) => {
                  const analysis = hypotheses[item.id];
                  return (
                    <article key={item.id} className="museum-export-card">
                       <div className="museum-export-card-number">Find {index + 1}</div>
                       {item.image ? (
                         <img src={item.image} alt={item.name} />
                       ) : (
                         <div className="museum-export-image-placeholder">
                           {getIcon(item.type, 34)}
                         </div>
                       )}
                       <div className="museum-export-card-body">
                         <div className="museum-export-category">{getCategoryTitle(item.type)}</div>
                         <h4>{item.name}</h4>
                         <div className="museum-export-label">
                           <strong>Museum label</strong>
                           <p>{plaques[item.id] || 'No plaque written.'}</p>
                         </div>
                         <div className="museum-export-evidence">
                           <strong>Evidence clue</strong>
                           <p>{item.clue}</p>
                         </div>
                         {analysis && typeof analysis === 'object' && (
                           <div className="museum-export-analysis">
                             <strong>What this reveals</strong>
                             <p><span>{analysis.promptTitle}:</span> {analysis.note}</p>
                           </div>
                         )}
                       </div>
                    </article>
                  );
                })}
             </div>
          </div>
        )}

        <div className="report-body">
          {summary.categoriesUsed.map(cat => (
            <div key={cat.id} className="report-category">
              <h3>{cat.title}</h3>
              <ul>
                {cat.items.map(item => {
                  const analysis = hypotheses[item.id];
                  return (
                    <li key={item.id} className="report-item">
                      <div className="report-item-header">
                        <strong>{item.name}</strong>
                        <span className="report-clue">{item.clue}</span>
                      </div>
                      {analysis && typeof analysis === 'object' && (
                        <>
                          <div className="report-hypothesis">
                            <strong>Analysis focus:</strong> {analysis.promptTitle || 'Research note'}
                          </div>
                          <div className="report-feedback">
                            {analysis.note || 'No note recorded.'}
                          </div>
                        </>
                      )}
                      {typeof analysis === 'number' && (
                        <>
                          <div className="report-hypothesis">
                            <strong>Significance:</strong> "{item.options?.[analysis] || 'No option recorded.'}"
                          </div>
                          <div className="report-feedback">
                            {getLegacyAnalysisFeedback(analysis, item.correct)}
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="report-actions hide-on-print">
         <button className="btn" onClick={onBack}>
           Back to Lab
         </button>
         <button className="btn" onClick={onBackToMenu}>
           Back to Main Menu
         </button>
         <button className="btn primary-btn" onClick={() => handlePrint('report')}>
           Print Report
         </button>
         <button className="btn primary-btn" onClick={() => handlePrint('museum')} disabled={curatedItems.length === 0}>
           Export Museum
         </button>
         <button className="btn" onClick={onRetry} style={{marginLeft: 'auto', background: 'var(--accent)', color: '#111', borderColor: 'var(--accent)'}}>
           <RefreshCw size={20} style={{verticalAlign:'middle', marginRight:'5px'}} />
           Start New Dig
         </button>
      </div>
    </div>
  );
}

function DevTools({ currentPhase, setPhase, setBureauState, setExcavatedIds, setActiveArtifacts, setItemsLocation, setHypotheses, setCurrentScenario, setCurrentEvent, setSiteName, setFinalConclusion }) {
  const jumpTo = (target) => {
    // Pick first scenario as default for testing
    const scen = SCENARIOS && SCENARIOS.length > 0 ? SCENARIOS[0] : null;
    if (!scen) return;
    const artifacts = [...(scen.evidence || []), (RED_HERRINGS && RED_HERRINGS.length > 0 ? RED_HERRINGS[0] : null)].filter(Boolean);
    const evt = RANDOM_EVENTS && RANDOM_EVENTS.length > 0 ? RANDOM_EVENTS[0] : null;
    
    setCurrentScenario(scen);
    setCurrentEvent(evt);
    setActiveArtifacts(artifacts);
    setExcavatedIds(new Set(artifacts.map(a => a.id)));
    
    if (target === 'sort') {
      const locations = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: 'inventory' }), {});
      setItemsLocation(locations);
    } else if (target === 'lab') {
      const locations = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: a.type || 'objects' }), {});
      setItemsLocation(locations);
      setHypotheses({});
      setSiteName("Mock Testing Site");
      setFinalConclusion(scen.id);
    } else if (target === 'museum' || target === 'report') {
      const locations = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: a.type || 'objects' }), {});
      setItemsLocation(locations);
      
      const hyps = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: a.correct || 0 }), {});
      setHypotheses(hyps);
      setSiteName("Mock Testing Site");
      setFinalConclusion(scen.id);
    }
    
    if (target === 'bureau') {
      if (typeof setBureauState === 'function') {
        setBureauState(createNewBureauSession('bureauBriefing'));
      }
      setPhase('bureauBriefing');
      return;
    }
    setPhase(target);
  };

  return (
    <div className="dev-tools hide-on-print">
      <div className="dev-tools-label">Dev Panel</div>
      <button className={currentPhase === 'dig' ? 'active' : ''} onClick={() => jumpTo('dig')}>1. Dig</button>
      <button className={currentPhase === 'sort' ? 'active' : ''} onClick={() => jumpTo('sort')}>2. Sort</button>
      <button className={currentPhase === 'lab' ? 'active' : ''} onClick={() => jumpTo('lab')}>3. Analyze</button>
      <button className={currentPhase === 'museum' ? 'active' : ''} onClick={() => jumpTo('museum')}>4. Curate</button>
      <button className={currentPhase === 'report' ? 'active' : ''} onClick={() => jumpTo('report')}>5. Report</button>
      <button className={currentPhase.startsWith('bureau') ? 'active' : ''} onClick={() => jumpTo('bureau')}>6. Bureau</button>
    </div>
  );
}

// ------------------------------------------------------------------
// Main App Component
// ------------------------------------------------------------------
export default function App() {
  const [savedGame, setSavedGame] = useReducer((_, nextSavedGame) => nextSavedGame, null, loadAutosave);
  const initialGame = useMemo(() => createNewGameSession('archaeology', 'menu'), []);
  const initialBureauGame = useMemo(() => createNewBureauSession('bureauBriefing'), []);
  const [phase, setPhase] = useState(initialGame.phase); // 'menu', 'training', 'dig', 'sort', 'lab', 'museum', 'report'
  const [currentScenario, setCurrentScenario] = useState(initialGame.currentScenario || null);
  const [activeArtifacts, setActiveArtifacts] = useState(initialGame.activeArtifacts || []);
  const [excavatedIds, setExcavatedIds] = useState(initialGame.excavatedIds || new Set());
  const [itemsLocation, setItemsLocation] = useState(initialGame.itemsLocation || {});
  const [hypotheses, setHypotheses] = useState(initialGame.hypotheses || {});
  const [siteName, setSiteName] = useState(initialGame.siteName || "Unknown Dig Site");
  const [finalConclusion, setFinalConclusion] = useState(initialGame.finalConclusion || null);
  const [currentEvent, setCurrentEvent] = useState(initialGame.currentEvent || null);
  const [curatedItems, setCuratedItems] = useState(initialGame.curatedItems || []);
  const [plaques, setPlaques] = useState(initialGame.plaques || {});
  const [finalExhibitionStatement, setFinalExhibitionStatement] = useState(initialGame.finalExhibitionStatement || '');
  const [trainingPlacements, setTrainingPlacements] = useState(initialGame.trainingPlacements || Array(TRAINING_STAGES.length).fill(null));
  const [bureauState, setBureauState] = useState(savedGame?.mode === 'bureau' ? savedGame : initialBureauGame);
  const [saveMessage, setSaveMessage] = useState('');

  const [showDevTools, setShowDevTools] = useState(false);

  useEffect(() => {
    if (phase === 'menu') return;

    try {
      const payload = phase.startsWith('bureau')
        ? createSavePayload({
          mode: 'bureau',
          phase,
          bureauState,
        })
        : createSavePayload({
          mode: 'archaeology',
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
      });
      window.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
      setSavedGame(rebuildSavedSession(payload));
    } catch (error) {
      console.warn('Could not autosave archaeology game.', error);
    }
  }, [
    activeArtifacts,
    currentEvent,
    currentScenario,
    curatedItems,
    excavatedIds,
    finalConclusion,
    finalExhibitionStatement,
    hypotheses,
    itemsLocation,
    bureauState,
    phase,
    plaques,
    siteName,
    trainingPlacements,
  ]);

  // Hotkey listener for DevTools (Ctrl + Shift + D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'D') {
        e.preventDefault();
        setShowDevTools(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!saveMessage) return;
    const timer = window.setTimeout(() => setSaveMessage(''), 4500);
    return () => window.clearTimeout(timer);
  }, [saveMessage]);

  const handleRetry = () => {
    const nextGame = createNewGameSession('archaeology', 'dig');
    if (!nextGame) return;
    setPhase(nextGame.phase);
    setCurrentScenario(nextGame.currentScenario);
    setCurrentEvent(nextGame.currentEvent);
    setActiveArtifacts(nextGame.activeArtifacts);
    setTrainingPlacements(nextGame.trainingPlacements || Array(TRAINING_STAGES.length).fill(null));
    setExcavatedIds(new Set());
    setItemsLocation({});
    setHypotheses({});
    setSiteName("Unknown Dig Site");
    setFinalConclusion(null);
    setCuratedItems([]);
    setPlaques({});
    setFinalExhibitionStatement('');
    setTrainingPlacements(Array(TRAINING_STAGES.length).fill(null));
  };

  const handleStartInvestigation = () => {
    handleRetry();
  };

  const handleStartTraining = () => {
    const nextGame = createNewGameSession('archaeology', 'training');
    if (!nextGame) return;
    setPhase(nextGame.phase);
    setCurrentScenario(nextGame.currentScenario);
    setCurrentEvent(nextGame.currentEvent);
    setActiveArtifacts(nextGame.activeArtifacts);
    setTrainingPlacements(nextGame.trainingPlacements || Array(TRAINING_STAGES.length).fill(null));
    setExcavatedIds(new Set());
    setItemsLocation({});
    setHypotheses({});
    setSiteName("Unknown Dig Site");
    setFinalConclusion(null);
    setCuratedItems([]);
    setPlaques({});
    setFinalExhibitionStatement('');
  };

  const handleStartBureau = () => {
    setSaveMessage('');
    setBureauState(createNewBureauSession('bureauBriefing'));
    setPhase('bureauBriefing');
  };

  const applySavedSession = (session) => {
    setPhase(session.phase);
    if (session.mode === 'bureau') {
      setBureauState(session);
    } else {
      setCurrentScenario(session.currentScenario);
      setCurrentEvent(session.currentEvent);
      setActiveArtifacts(session.activeArtifacts);
      setExcavatedIds(session.excavatedIds);
      setItemsLocation(session.itemsLocation);
      setHypotheses(session.hypotheses);
      setSiteName(session.siteName);
      setFinalConclusion(session.finalConclusion);
      setCuratedItems(session.curatedItems);
      setPlaques(session.plaques);
      setFinalExhibitionStatement(session.finalExhibitionStatement);
      setTrainingPlacements(session.trainingPlacements || Array(TRAINING_STAGES.length).fill(null));
    }
    setSavedGame(session);
  };

  const handleSaveProgressFile = () => {
    if (phase === 'menu') {
      setSaveMessage('Choose Investigation or Training before saving.');
      return;
    }
    const isBureau = phase.startsWith('bureau');
    if (!isBureau && (!currentScenario || !currentEvent || activeArtifacts.length === 0)) return;

    const payload = isBureau
      ? createSavePayload({
        mode: 'bureau',
        phase,
        bureauState,
      })
      : createSavePayload({
        mode: 'archaeology',
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
      });
    const stamp = new Date()
      .toISOString()
      .slice(0, 16)
      .replace('T', '-')
      .replace(':', '');
    const filename = isBureau
      ? `antiquities-bureau-${stamp}.json`
      : `archaeology-dig-${currentScenario.id}-${stamp}.json`;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setSaveMessage(`Progress downloaded as ${filename}`);
  };

  const handleLoadProgressFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const session = rebuildSavedSession(payload);
      applySavedSession(session);
      window.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
      setSavedGame(session);
      setSaveMessage(`Loaded progress from ${file.name}`);
    } catch (error) {
      console.warn('Could not load progress file.', error);
      setSaveMessage(error instanceof SyntaxError
        ? 'That file is not valid JSON. Please choose an exported Archaeology Dig save file.'
        : error.message || 'Could not load that save file.');
    }
  };

  const handleDigComplete = (finalExcavatedIds) => {
    // Filter the active artifacts to ONLY the ones they managed to save
    let savedArtifacts = activeArtifacts.filter(a => finalExcavatedIds.has(a.id));
    
    // Safety fallback: if they somehow found 0 pairs in 90 seconds, give them 3 freebies so they can still play the rest of the game
    if (savedArtifacts.length === 0) {
      savedArtifacts = activeArtifacts.slice(0, 3);
    }
    
    setActiveArtifacts(savedArtifacts);
    
    // Set initial locations to inventory
    const initialLocations = savedArtifacts.reduce((acc, card) => ({ ...acc, [card.id]: 'inventory' }), {});
    setItemsLocation(initialLocations);
    setPhase('sort');
  };

  const resumeAction = savedGame ? (() => applySavedSession(savedGame)) : null;

  return (
    <div className="app-wrapper">
      <header className="main-header hide-on-print">
        <div className="header-left">
          <div className="header-icon-container">
            {phase.startsWith('bureau') ? <Archive size={28} className="header-main-icon" /> : <Pickaxe size={28} className="header-main-icon" />}
          </div>
          <div className="header-titles">
            {phase.startsWith('bureau') ? (
              <>
                <h1>The Antiquities Bureau</h1>
                <p>Ancient Civilisation Clues</p>
              </>
            ) : (
              <>
                <h1>Archaeology Challenge</h1>
                <p>What can evidence tell us about the ancient past?</p>
              </>
            )}
          </div>
        </div>
        <div className="header-right">
          <div className="save-controls">
            <button
              className="save-control-btn save-control-icon-btn"
              type="button"
              onClick={handleSaveProgressFile}
              disabled={phase === 'menu'}
              title="Save progress"
              aria-label="Save progress"
            >
              <Save size={16} aria-hidden="true" />
              <span className="save-control-text">Save Progress</span>
            </button>
            <label className="save-control-btn save-control-icon-btn" title="Load progress" aria-label="Load progress">
              <Upload size={16} aria-hidden="true" />
              <span className="save-control-text">Load Progress</span>
              <input type="file" accept="application/json,.json" onChange={handleLoadProgressFile} />
            </label>
          </div>
          {phase !== 'menu' && phase !== 'training' && !phase.startsWith('bureau') && (
            <nav className="phase-navigation">
              <div className={`phase-nav-item ${phase === 'training' || phase === 'dig' ? 'active' : 'done'}`}>
                <span className="phase-num">1</span> Dig
              </div>
              <ChevronRight size={16} className="phase-sep" />
              <div className={`phase-nav-item ${phase === 'sort' ? 'active' : (phase === 'lab' || phase === 'museum' || phase === 'report' ? 'done' : '')}`}>
                <span className="phase-num">2</span> Sort
              </div>
              <ChevronRight size={16} className="phase-sep" />
              <div className={`phase-nav-item ${phase === 'lab' ? 'active' : (phase === 'museum' || phase === 'report' ? 'done' : '')}`}>
                <span className="phase-num">3</span> Lab
              </div>
              <ChevronRight size={16} className="phase-sep" />
              <div className={`phase-nav-item ${phase === 'museum' ? 'active' : (phase === 'report' ? 'done' : '')}`}>
                <span className="phase-num">4</span> Museum
              </div>
              <ChevronRight size={16} className="phase-sep" />
              <div className={`phase-nav-item ${phase === 'report' ? 'active' : ''}`}>
                <span className="phase-num">5</span> Report
              </div>
            </nav>
          )}
        </div>
      </header>
      {saveMessage && (
        <div className="save-message hide-on-print" role="status">
          {saveMessage}
        </div>
      )}

      <main className="main-content">
        {phase === 'menu' && (
          <>
            <ActivityMenu
              onStartInvestigation={handleStartInvestigation}
              onStartTraining={handleStartTraining}
              onStartBureau={handleStartBureau}
            />
            <ResumeCard
              savedGame={savedGame}
              onResume={resumeAction}
            />
          </>
        )}

        {phase === 'training' && currentScenario && currentEvent && (
          <TrainingPhase
            trainingPlacements={trainingPlacements}
            setTrainingPlacements={setTrainingPlacements}
            onBackToMenu={() => setPhase('menu')}
          />
        )}

        {phase === 'dig' && currentEvent && (
          <DigPhase 
            activeArtifacts={activeArtifacts}
            excavatedIds={excavatedIds} 
            setExcavatedIds={setExcavatedIds} 
            onComplete={handleDigComplete}
            currentEvent={currentEvent}
            onBackToMenu={() => setPhase('menu')}
          />
        )}
        
        {phase === 'sort' && (
          <SortPhase 
            activeArtifacts={activeArtifacts}
            itemsLocation={itemsLocation} 
            setItemsLocation={setItemsLocation} 
            onComplete={() => setPhase('lab')}
            onBackToMenu={() => setPhase('menu')}
          />
        )}

        {phase === 'lab' && (
          <LabPhase 
            activeArtifacts={activeArtifacts}
            itemsLocation={itemsLocation} 
            hypotheses={hypotheses}
            setHypotheses={setHypotheses}
            currentScenario={currentScenario}
            onComplete={(name, civId) => {
              setSiteName(name);
              setFinalConclusion(civId);
              setPhase('museum');
            }}
            onBackToMenu={() => setPhase('menu')}
          />
        )}
        
        {phase === 'museum' && (
          <MuseumPhase 
            activeArtifacts={activeArtifacts}
            excavatedIds={excavatedIds}
            hypotheses={hypotheses}
            curatedItems={curatedItems}
            setCuratedItems={setCuratedItems}
            plaques={plaques}
            setPlaques={setPlaques}
            finalExhibitionStatement={finalExhibitionStatement}
            setFinalExhibitionStatement={setFinalExhibitionStatement}
            onComplete={() => setPhase('report')}
            onBackToMenu={() => setPhase('menu')}
          />
        )}

        {phase === 'report' && currentEvent && currentScenario && (
          <ReportPhase 
            activeArtifacts={activeArtifacts}
            itemsLocation={itemsLocation} 
            hypotheses={hypotheses} 
            siteName={siteName}
            finalConclusion={finalConclusion}
            currentScenario={currentScenario}
            onBack={() => setPhase('lab')}
            onRetry={handleRetry}
            currentEvent={currentEvent}
            curatedItems={curatedItems}
            plaques={plaques}
            finalExhibitionStatement={finalExhibitionStatement}
            onBackToMenu={() => setPhase('menu')}
          />
        )}

        {phase.startsWith('bureau') && (
          <BureauMode
            bureauState={bureauState}
            setBureauState={setBureauState}
            onBackToMenu={() => setPhase('menu')}
          />
        )}
      </main>

      {showDevTools && (
        <DevTools 
          currentPhase={phase}
          setPhase={setPhase}
          setBureauState={setBureauState}
          setExcavatedIds={setExcavatedIds}
          setActiveArtifacts={setActiveArtifacts}
          setItemsLocation={setItemsLocation}
          setHypotheses={setHypotheses}
          setCurrentScenario={setCurrentScenario}
          setCurrentEvent={setCurrentEvent}
          setSiteName={setSiteName}
          setFinalConclusion={setFinalConclusion}
        />
      )}
    </div>
  );
}
