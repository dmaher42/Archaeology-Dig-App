import React, { useState, useEffect, useRef } from 'react';
import { 
  Shovel, 
  Search, 
  Microscope, 
  FileText, 
  History, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  Trash2,
  Package,
  Layers,
  FlaskConical,
  ScrollText,
  Printer,
  RotateCcw,
  Plus,
  Play,
  Settings,
  Users,
  Trophy,
  Hammer,
  Gem,
  Skull,
  Map,
  Lightbulb,
  Info,
  ExternalLink,
  ChevronDown,
  Timer,
  Zap,
  Wind,
  Droplets,
  CloudLightning,
  Eye,
  Camera,
  BookOpen,
  ClipboardList,
  PenTool,
  Save,
  Download,
  Share2,
  HelpCircle,
  X,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Archive,
  Mountain,
  Waves,
  Feather,
  Palette,
  Compass,
  ArrowRight
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import confetti from 'canvas-confetti';

import { 
  SCENARIOS, 
  CATEGORIES, 
  ARTIFACT_TYPES, 
  getCategoryTitle,
  getArtifactEraLabel
} from './data';

// ------------------------------------------------------------------
// Audio System
// ------------------------------------------------------------------
let audioCtx = null;
const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
};

const playTone = (freq, type = 'sine', duration = 0.1, volume = 0.1) => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

const playFlip = () => playTone(440, 'triangle', 0.1, 0.05);
const playMatch = () => {
  playTone(523.25, 'sine', 0.2, 0.1);
  setTimeout(() => playTone(659.25, 'sine', 0.3, 0.1), 100);
};
const playError = () => playTone(150, 'sawtooth', 0.3, 0.1);

// ------------------------------------------------------------------
// Shared UI Components
// ------------------------------------------------------------------

const ARTIFACT_THEME_MAP = {
  household: {
    accent: '#fbbf24',
    accentSoft: 'rgba(251, 191, 36, 0.18)',
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

function DraggableArtifact({ artifact, onClick, showStatus }) {
  const theme = getArtifactTheme(artifact);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: artifact.id,
    data: artifact,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.8 : 1,
  } : {};
  style['--artifact-accent'] = theme.accent;
  style['--artifact-accent-soft'] = theme.accentSoft;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`artifact-card ${showStatus ? 'has-status' : ''} artifact-card--${artifact.type} ${artifact.isRedHerring ? 'artifact-card--disturbance' : ''}`}
      {...listeners} 
      {...attributes}
      onClick={(e) => {
        if (!isDragging && onClick) {
          e.stopPropagation();
          onClick(artifact);
        }
      }}
    >
      <span className="artifact-card-icon" style={{ '--artifact-accent': theme.accent, '--artifact-accent-soft': theme.accentSoft }}>
        {getIcon(artifact.type, 22)}
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
      <h3 className="category-title">
        <span className="category-title-row">
          {getIcon(category.id, 24)}
          <span className="category-title-text">{category.title}</span>
          <span className="item-count">({items.length})</span>
        </span>
        <span className="category-description">{category.description}</span>
      </h3>
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
    </div>
  );
}

// ------------------------------------------------------------------
// Phase 1: Dig (Memory Matching Game with Time Limit)
// ------------------------------------------------------------------
function DigPhase({ activeArtifacts, excavatedIds, setExcavatedIds, onComplete, currentEvent }) {
  const [tiles, setTiles] = useState([]);
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
  const [perfectClear, setPerfectClear] = useState(false);
 
  // Multiplayer State
  const [numPlayers, setNumPlayers] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });

  // Difficulty State
  const [difficulty, setDifficulty] = useState('medium');

  const EventIcon = currentEvent.icon;
  const recoveredArtifacts = activeArtifacts.filter(artifact => excavatedIds.has(artifact.id));
  const ancientRecoveredCount = recoveredArtifacts.filter(artifact => !artifact.isRedHerring).length;
  const disturbanceCount = recoveredArtifacts.filter(artifact => artifact.isRedHerring).length;

  // Initialize the memory grid with pairs
  useEffect(() => {
    if (tiles.length === 0 && activeArtifacts.length > 0) {
      const pairs = [...activeArtifacts, ...activeArtifacts].map((artifact, index) => ({
        uniqueId: `${artifact.id}-${index}`,
        artifactId: artifact.id,
        artifact: artifact,
        isFlipped: false,
        isMatched: false
      }));
      // Shuffle
      for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
      }
      setTiles(pairs);
    }
  }, [activeArtifacts, tiles.length]);

  // Timer Logic
  useEffect(() => {
    if (!isPlaying || isTimeUp || perfectClear) return;
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
  }, [isPlaying, isTimeUp, perfectClear]);

  // Perfect clear logic
  useEffect(() => {
    if (excavatedIds.size === activeArtifacts.length && activeArtifacts.length > 0) {
      setIsPlaying(false);
      setPerfectClear(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
  }, [excavatedIds.size, activeArtifacts.length]);

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
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [fieldNote]);

  const handleRadar = () => {
    const radarCost = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 10;
    if (timeLeft <= radarCost || isLocked || !isPlaying) return;
    
    initAudio();
    playTone(800, 'sine', 0.5, 0.1); // Survey sweep sound
    setFeedback({ message: 'Surveying the site - checking for buried context.', isError: false });
    setTimeLeft(prev => prev - radarCost);
    setIsLocked(true);
    
    // Dynamic reveal duration based on difficulty (snappier for better game flow)
    let duration = 1500; // Hard (1.5s)
    if (difficulty === 'easy') duration = 5000; // 5s
    if (difficulty === 'medium') duration = 3000; // 3s

    // Briefly flip all unmatched tiles
    setTiles(prev => prev.map(t => t.isMatched ? t : { ...t, isFlipped: true }));
    
    setTimeout(() => {
      setTiles(prev => prev.map(t => t.isMatched ? t : { ...t, isFlipped: false }));
      setIsLocked(false);
      setFlippedIndices([]);
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
      const [idx1, idx2] = newFlipped;
      
      // Use the newly clicked index and the previously stored idx1
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
          
          if (numPlayers === 2) {
             setScores(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer] + 1 }));
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
          if (numPlayers === 2) {
            setCurrentPlayer(prev => prev === 1 ? 2 : 1);
          }
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1200);
      }
    }
  };

  return (
    <div className="phase-container dig-phase">
      {/* Intro Modal / Storm Warning */}
      {showStormWarning && (
        <div className="modal-overlay">
          <div className="modal-content glass-card warning-modal slide-up">
            <div className="phase-indicator" style={{ marginBottom: '1rem', color: '#f87171' }}>
              <AlertCircle size={20} />
              <span>IMMEDIATE ACTION REQUIRED</span>
            </div>
            <h2 className="modal-title" style={{ color: '#fff' }}>Incoming {currentEvent.name}!</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--sand-200)', marginBottom: '1.5rem' }}>
              Weather reports confirm a <strong>{currentEvent.name}</strong> is heading straight for the site. 
              We have exactly <strong>{currentEvent.time} seconds</strong> to recover as many artifacts as possible 
              before the site is flooded and the context is lost forever!
            </p>
            
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Field Objectives:</h4>
              <ul style={{ textAlign: 'left', fontSize: '0.95rem', color: 'var(--sand-300)', paddingLeft: '1.2rem' }}>
                <li>Find matching pairs of artifacts in the trench grid.</li>
                <li>Each match recovers the item to our sorting tent.</li>
                <li>Watch out for modern disturbances (red herrings)!</li>
                {numPlayers === 2 && <li>Player {currentPlayer}, you're up first!</li>}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
               <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className={`btn ${numPlayers === 1 ? 'primary-btn' : ''}`} 
                  onClick={() => setNumPlayers(1)}
                  style={{ flex: 1 }}
                >
                  <Users size={18} /> Solo Dig
                </button>
                <button 
                  className={`btn ${numPlayers === 2 ? 'primary-btn' : ''}`} 
                  onClick={() => setNumPlayers(2)}
                  style={{ flex: 1 }}
                >
                  <Users size={18} /> Team (PvP)
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '0.5rem 0' }}>
                {['easy', 'medium', 'hard'].map(level => (
                  <button 
                    key={level}
                    className={`btn ${difficulty === level ? 'primary-btn' : ''}`}
                    onClick={() => setDifficulty(level)}
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>

              <button className="btn primary-btn" style={{ width: '100%' }} onClick={() => {
                setShowStormWarning(false);
                setIsPlaying(true);
                initAudio();
              }}>
                <Play size={20} /> START EMERGENCY EXCAVATION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time's Up / Success Modal */}
      {(isTimeUp || perfectClear) && !showDebrief && (
        <div className="modal-overlay">
          <div className="modal-content glass-card slide-up">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {perfectClear ? (
                <div style={{ color: 'var(--success)' }}>
                  <Trophy size={64} style={{ margin: '0 auto 1rem' }} />
                  <h2 className="modal-title">SITE SECURED!</h2>
                  <p>Incredible work! You've recovered every single artifact before the {currentEvent.name} hit.</p>
                </div>
              ) : (
                <div style={{ color: '#f87171' }}>
                  <CloudLightning size={64} style={{ margin: '0 auto 1rem' }} />
                  <h2 className="modal-title">EVACUATE NOW!</h2>
                  <p>The {currentEvent.name} has arrived. Site is no longer safe for excavation.</p>
                </div>
              )}
            </div>

            <div className="field-note-summary">
              <div className="field-note-stat">
                <strong>{ancientRecoveredCount}</strong>
                <span>Ancient Finds</span>
              </div>
              <div className="field-note-stat">
                <strong>{disturbanceCount}</strong>
                <span>Modern Objects</span>
              </div>
              <div className="field-note-stat">
                <strong>{Math.round((ancientRecoveredCount / activeArtifacts.filter(a => !a.isRedHerring).length) * 100)}%</strong>
                <span>Site Yield</span>
              </div>
            </div>

            <button className="btn primary-btn" style={{ width: '100%' }} onClick={openDebrief}>
              PROCEED TO FIELD DEBRIEF <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Debrief Modal (Context Learning) */}
      {showDebrief && (
        <div className="modal-overlay">
          <div className="modal-content glass-card debrief-modal slide-up">
            <h2 className="modal-title">Archaeological Debrief</h2>
            <p style={{ color: 'var(--sand-400)', marginBottom: '1.5rem' }}>
              Site Assessment: {currentEvent.location}
            </p>

            <div className="debrief-insight">
              <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} /> Historical Context Log
              </h4>
              <p>By excavating these remains, we've begun to piece together the history of this site. Your quick actions saved valuable evidence that will now be processed in the lab.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h5 style={{ color: 'var(--sand-200)', marginBottom: '0.5rem' }}>Site Integrity</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--sand-400)' }}>
                  Recovery of {ancientRecoveredCount} items provides a significant sample size for determining the site's primary function and era.
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h5 style={{ color: 'var(--sand-200)', marginBottom: '0.5rem' }}>Stratigraphy Note</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--sand-400)' }}>
                  {disturbanceCount > 0 ? `The ${disturbanceCount} modern items found suggest some soil disturbance (bioturbation) in the upper layers.` : "The absence of modern items indicates a very well-preserved, sealed context."}
                </p>
              </div>
            </div>

            <button className="btn primary-btn" style={{ width: '100%' }} onClick={onComplete}>
              TAKE FINDS TO SORTING TENT <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main UI Header */}
      <div className="dig-phase-header phase-header">
        <div className="dig-event-banner" style={{ '--event-color': currentEvent.color }}>
          <EventIcon size={16} /> EMERGENCY: {currentEvent.name.toUpperCase()} IMMINENT
        </div>
        <p className="dig-blurb">Site: {currentEvent.location}. The stratigraphy is clear but fragile. Recover pairs of matching context before the weather turns.</p>
      </div>

      <div className="dig-control-row">
        <div className={`timer-display ${timeLeft < 10 ? 'danger' : ''}`}>
          <Clock size={18} /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
        
        <button 
          className="btn" 
          onClick={handleRadar} 
          disabled={timeLeft <= 20 || isLocked || !isPlaying}
          style={{ padding: '6px 14px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <Search size={16} /> Site Survey (-20s)
        </button>

        {numPlayers === 2 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className={`dig-player-chip ${currentPlayer === 1 ? 'active' : ''}`}>
              P1: {scores[1]}
            </div>
            <div className={`dig-player-chip ${currentPlayer === 2 ? 'active' : ''}`}>
              P2: {scores[2]}
            </div>
          </div>
        )}
      </div>

      <div className="dig-progress-group">
        <div className="progress-bar" style={{ margin: '0 auto', maxWidth: '600px' }}>
          <div 
            className="progress-fill" 
            style={{ 
              width: `${(excavatedIds.size / activeArtifacts.length) * 100}%`,
              background: `linear-gradient(90deg, var(--accent), #fcd34d)`
            }} 
          />
        </div>
        <div className="dig-mini-stats">
          <span>Recovered: {ancientRecoveredCount} Ancient Contexts</span>
          <span>Logged: {disturbanceCount} Modern Disturbances</span>
          <span>Target: {activeArtifacts.length} Units</span>
        </div>
      </div>

      {/* Excavation Trench */}
      <div className="dig-grid-shell">
        <div className="memory-grid">
          {tiles.map((tile, idx) => (
            <div 
              key={tile.uniqueId} 
              className={`memory-tile ${tile.isFlipped ? 'revealed' : ''} ${tile.isMatched ? 'matched' : ''}`}
              onClick={() => handleTileClick(idx)}
              style={{
                '--artifact-accent': getArtifactTheme(tile.artifact).accent,
                '--artifact-accent-soft': getArtifactTheme(tile.artifact).accentSoft
              }}
            >
              <div className="tile-inner">
                <div className="tile-front dirt-texture">
                  <Shovel size={24} style={{ opacity: 0.3, color: 'var(--sand-900)' }} />
                </div>
                <div className="tile-back artifact-texture">
                  <div className="artifact-icon">
                    {getIcon(tile.artifact.type, 24)}
                  </div>
                  <span className="artifact-label">{tile.artifact.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Discovery Overlay (Field Note) */}
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
              {fieldNote.isDisturbance 
                ? 'Modern disturbance logged for sorting later.' 
                : 'Ancient evidence ready for the Sorting Tent.'}
            </div>
          </div>
        )}
      </div>

      {feedback.message && (
        <div className={`sort-feedback ${feedback.isError ? 'error' : 'success'}`} style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
          {feedback.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {feedback.message}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Phase 2: Sort (Drag and Drop artifacts into categories)
// ------------------------------------------------------------------
function SortPhase({ artifacts, onComplete }) {
  const [trayItems, setTrayItems] = useState([...artifacts]);
  const [binnedItems, setBinnedItems] = useState({
    household: [],
    remains: [],
    structures: [],
    environment: [],
    written: []
  });
  const [activeId, setActiveId] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', isError: false });
  const [clueIndex, setClueIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', isError: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback.message]);

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    initAudio();
    playFlip();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const artifactId = active.id;
    const categoryId = over.id;
    const artifact = artifacts.find(a => a.id === artifactId);

    if (artifact.type === categoryId) {
      // Correct Match
      playMatch();
      setFeedback({ message: `Correct! ${artifact.name} is a ${getCategoryTitle(categoryId)}.`, isError: false });
      
      // Move from tray to bin
      setTrayItems(prev => prev.filter(item => item.id !== artifactId));
      setBinnedItems(prev => ({
        ...prev,
        [categoryId]: [...prev[categoryId], artifact]
      }));
    } else {
      // Incorrect Match
      playError();
      setFeedback({ message: `Not quite. Examine the material and function of the ${artifact.name} again.`, isError: true });
    }
  };

  const handleQuickSort = (artifactId, categoryId) => {
    const artifact = artifacts.find(a => a.id === artifactId);
    initAudio();

    if (artifact.type === categoryId) {
      playMatch();
      setFeedback({ message: `Correct! ${artifact.name} sorted into ${getCategoryTitle(categoryId)}.`, isError: false });
      setTrayItems(prev => prev.filter(item => item.id !== artifactId));
      setBinnedItems(prev => ({
        ...prev,
        [categoryId]: [...prev[categoryId], artifact]
      }));
    } else {
      playError();
      setFeedback({ message: `Incorrect category for ${artifact.name}.`, isError: true });
    }
  };

  const isComplete = trayItems.length === 0;
  const activeArtifact = activeId ? artifacts.find(a => a.id === activeId) : null;

  return (
    <div className="phase-container sort-phase">
      <div className="phase-header">
        <h2><Layers size={28} /> Site Sorting Tent</h2>
        <p>The site was a chaotic mix of history. Organize your finds into categories to begin the analysis.</p>
      </div>

      <div className="clue-panel">
        <div className="clue-main-content">
          {!isComplete ? (
            <div className="clue-content active">
              <p><strong>Current Task:</strong> Sort the recovered items by their primary archaeological function.</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                 {CATEGORIES.map(cat => (
                   <span key={cat.id} style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--sand-400)' }}>
                     {cat.title}
                   </span>
                 ))}
              </div>
            </div>
          ) : (
            <div className="clue-content active">
              <p style={{ color: 'var(--success)' }}><strong>Tent Organized!</strong> All artifacts have been categorized and are ready for laboratory analysis.</p>
              <button className="btn primary-btn slide-up" onClick={() => onComplete(binnedItems)} style={{ marginTop: '1rem' }}>
                OPEN THE LAB CASE <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {feedback.message && (
          <div className={`sort-feedback ${feedback.isError ? 'error' : 'success'}`}>
            {feedback.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {feedback.message}
          </div>
        )}
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="sorting-layout">
          {CATEGORIES.map(category => (
            <CategoryBin 
              key={category.id}
              category={category}
              items={binnedItems[category.id]}
            />
          ))}
        </div>

        <div className={`inventory-tray ${trayItems.length === 0 ? 'empty-tray' : ''}`}>
          <div className="tray-label">Field Tray:</div>
          <div className="tray-items">
            {trayItems.map(artifact => (
              <DraggableArtifact key={artifact.id} artifact={artifact} />
            ))}
          </div>
          {trayItems.length > 0 && (
             <div style={{ color: 'var(--sand-500)', fontSize: '0.8rem', fontStyle: 'italic', paddingLeft: '1rem' }}>
               Drag items to bins
             </div>
          )}
        </div>

        <DragOverlay dropAnimation={{
          duration: 250,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId ? (
            <div className="artifact-card dragging" style={{ '--artifact-accent': getArtifactTheme(activeArtifact).accent }}>
              <span className="artifact-card-icon" style={{ background: getArtifactTheme(activeArtifact).accentSoft }}>
                {getIcon(activeArtifact.type, 22)}
              </span>
              <span className="card-name">{activeArtifact.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// ------------------------------------------------------------------
// Phase 3: Lab (Analyze artifacts, build hypotheses)
// ------------------------------------------------------------------
function LabPhase({ binnedItems, onComplete }) {
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [hypotheses, setHypotheses] = useState({});
  const [feedback, setFeedback] = useState({ message: '', isError: false });
  const [activeCategory, setActiveCategory] = useState('household');

  const allArtifacts = Object.values(binnedItems).flat();
  
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', isError: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback.message]);

  const handleArtifactClick = (artifact) => {
    initAudio();
    playFlip();
    setSelectedArtifact(artifact);
  };

  const saveHypothesis = (artifactId, text) => {
    setHypotheses(prev => ({
      ...prev,
      [artifactId]: text
    }));
    setFeedback({ message: 'Analysis recorded in the site registry.', isError: false });
    setSelectedArtifact(null);
    playMatch();
  };

  const isComplete = Object.keys(hypotheses).length >= Math.min(allArtifacts.length, 5);

  return (
    <div className="phase-container lab-phase">
      <div className="phase-header">
        <h2><Microscope size={28} /> Context Analysis Lab</h2>
        <p>Examine the evidence. What does each find tell us about the people who lived here?</p>
      </div>

      <div className="lab-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', flex: 1, minHeight: 0 }}>
        <div className="lab-sidebar glass-card" style={{ padding: '1rem', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>Recovered Evidence</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {CATEGORIES.map(category => (
              <div key={category.id}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--sand-400)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {getIcon(category.id, 14)} {category.title}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {binnedItems[category.id].map(item => (
                    <div 
                      key={item.id} 
                      className={`artifact-card ${selectedArtifact?.id === item.id ? 'active' : ''} ${hypotheses[item.id] ? 'has-status' : ''}`}
                      onClick={() => handleArtifactClick(item)}
                      style={{ cursor: 'pointer', maxWidth: '100%', '--artifact-accent': getArtifactTheme(item).accent }}
                    >
                      <span className="artifact-card-icon" style={{ background: getArtifactTheme(item).accentSoft }}>
                        {getIcon(item.type, 18)}
                      </span>
                      <span className="card-name" style={{ fontSize: '0.75rem' }}>{item.name}</span>
                      {hypotheses[item.id] && <div className="status-indicator"><CheckCircle2 size={12} /></div>}
                    </div>
                  ))}
                  {binnedItems[category.id].length === 0 && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--sand-600)', fontStyle: 'italic', paddingLeft: '1rem' }}>No items recovered</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lab-main glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {selectedArtifact ? (
            <div className="analysis-view slide-up">
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ 
                  width: '120px', height: '120px', borderRadius: '20px', 
                  background: 'rgba(255,255,255,0.03)', border: '2px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
                }}>
                  {getIcon(selectedArtifact.type, 64)}
                </div>
                <div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedArtifact.name}</h2>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span className="dig-player-chip">{getCategoryTitle(selectedArtifact.type)}</span>
                    <span className="dig-player-chip">{getArtifactEraLabel(selectedArtifact)}</span>
                  </div>
                </div>
              </div>

              <div className="field-note-card" style={{ marginBottom: '2rem', position: 'static', maxWidth: 'none' }}>
                <div className="field-note-heading">Field Analysis Notes</div>
                <div className="field-note-lines">
                  <p><strong>Clue:</strong> {selectedArtifact.clue}</p>
                  <p><strong>Discovery:</strong> {selectedArtifact.discoveryMethod}</p>
                  <p><strong>Technical Data:</strong> {selectedArtifact.details}</p>
                </div>
              </div>

              <div className="hypothesis-section">
                <p className="hypothesis-prompt">Develop a hypothesis for this find:</p>
                <textarea 
                  className="hypothesis-input"
                  placeholder="What does this object tell us about the site's history? Consider its use, material, and where it was found..."
                  defaultValue={hypotheses[selectedArtifact.id] || ''}
                  onChange={(e) => {
                    const text = e.target.value;
                    // Auto-save logic or wait for button
                  }}
                  onBlur={(e) => saveHypothesis(selectedArtifact.id, e.target.value)}
                />
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn primary-btn" onClick={() => {
                    const input = document.querySelector('.hypothesis-input');
                    saveHypothesis(selectedArtifact.id, input.value);
                  }}>
                    SAVE ANALYSIS TO REPORT <Save size={18} />
                  </button>
                  <div className="starter-buttons" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                     {["Domestic life", "Trade activity", "Ritual use", "Abandonment"].map(tag => (
                       <button key={tag} className="starter-btn" onClick={() => {
                         const input = document.querySelector('.hypothesis-input');
                         input.value += (input.value ? ' ' : '') + tag + "...";
                       }}>+{tag}</button>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--sand-500)' }}>
              <Search size={64} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
              <h3>Select an artifact from the tray to begin analysis</h3>
              <p style={{ maxWidth: '400px', marginTop: '1rem' }}>Each object is a piece of the puzzle. Analyze its properties to build a hypothesis for your final archaeological report.</p>
              
              <div style={{ marginTop: '2rem', display: 'flex', gap: '15px' }}>
                <div className="field-note-stat">
                  <strong>{Object.keys(hypotheses).length}</strong>
                  <span>Analyses Done</span>
                </div>
                <div className="field-note-stat">
                  <strong>{allArtifacts.length}</strong>
                  <span>Total Finds</span>
                </div>
              </div>

              {isComplete && (
                <button className="btn primary-btn slide-up" onClick={() => onComplete(hypotheses)} style={{ marginTop: '3rem' }}>
                  PUBLISH FINAL SITE REPORT <FileText size={20} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {feedback.message && (
        <div className={`sort-feedback ${feedback.isError ? 'error' : 'success'}`} style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
          {feedback.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {feedback.message}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Phase 4: Report (Final Presentation)
// ------------------------------------------------------------------
function ReportPhase({ scenario, binnedItems, hypotheses, onRestart }) {
  const allArtifacts = Object.values(binnedItems).flat();
  const analyzedArtifacts = allArtifacts.filter(a => hypotheses[a.id]);

  return (
    <div className="phase-container report-phase">
      <div className="report-container">
        <div className="report-paper slide-up">
          <div className="report-header">
            <h2 className="header-font">ARCHAEOLOGICAL SITE REPORT</h2>
            <p className="report-subtitle">EXCAVATION ID: {scenario.id.toUpperCase()} | SECTOR: {scenario.location.toUpperCase()}</p>
          </div>

          <div className="site-conclusion">
            <h3><MapPin size={24} /> Site Conclusion</h3>
            <p className="conclusion-vol">{scenario.conclusion}</p>
            <ul className="conclusion-specs">
              <li><strong>Site Classification:</strong> {scenario.title}</li>
              <li><strong>Temporal Range:</strong> {scenario.era}</li>
              <li><strong>Context Integrity:</strong> Verified via recovered evidence</li>
            </ul>
          </div>

          <div className="report-body">
            {CATEGORIES.map(category => {
              const categoryItems = binnedItems[category.id].filter(a => hypotheses[a.id]);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category.id} className="report-category">
                  <h3>{category.title} Evidence</h3>
                  <ul>
                    {categoryItems.map(item => (
                      <li key={item.id} className="report-item">
                        <div className="report-item-header">
                          <strong>{item.name}</strong>
                          <span className="report-clue">({getArtifactEraLabel(item)})</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.8rem' }}>{item.details}</p>
                        <div className="report-hypothesis">
                          <strong style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--sand-600)', display: 'block', marginBottom: '4px' }}>Hypothesis:</strong>
                          {hypotheses[item.id]}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="report-actions hide-on-print">
            <button className="btn" onClick={() => window.print()}>
              <Printer size={20} /> PRINT REPORT
            </button>
            <button className="btn primary-btn" onClick={onRestart}>
              <RotateCcw size={20} /> NEW EXCAVATION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Main App Component
// ------------------------------------------------------------------
export default function ArchaeologyApp() {
  const [phase, setPhase] = useState('dig'); // 'dig', 'sort', 'lab', 'report'
  const [currentScenario, setCurrentScenario] = useState(SCENARIOS[0]);
  const [activeArtifacts, setActiveArtifacts] = useState([]);
  const [excavatedIds, setExcavatedIds] = useState(new Set());
  const [binnedItems, setBinnedItems] = useState({});
  const [hypotheses, setHypotheses] = useState({});
  const [devMode, setDevMode] = useState(false);

  // Initialize game
  useEffect(() => {
    initGame();
  }, []);

  // Developer Hotkey
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle Dev Mode with Ctrl+Shift+D
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDevMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initGame = () => {
    const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setCurrentScenario(scenario);
    
    // Combine scenario artifacts with red herrings, but limit total to 12
    // to ensure a perfect 8x3 grid (24 tiles total)
    const items = [...scenario.artifacts];
    
    // Fill up to 11 scenario items if scenario has fewer, otherwise take first 11
    const finalAncientItems = items.slice(0, 11);
    
    // Add exactly 1 red herring to make 12 total
    const redHerring = scenario.redHerrings[Math.floor(Math.random() * scenario.redHerrings.length)];
    const finalItems = [...finalAncientItems, redHerring];
    
    setActiveArtifacts(finalItems);
    setExcavatedIds(new Set());
    setPhase('dig');
  };

  const goToPhase = (p) => {
    initAudio();
    setPhase(p);
  };

  const handleDigComplete = () => {
    const excavated = activeArtifacts.filter(a => excavatedIds.has(a.id));
    goToPhase('sort');
  };

  const handleSortComplete = (bins) => {
    setBinnedItems(bins);
    goToPhase('lab');
  };

  const handleLabComplete = (results) => {
    setHypotheses(results);
    goToPhase('report');
  };

  return (
    <div className="app-wrapper">
      <header className="main-header">
        <div className="header-titles">
          <h1>Archaeology Field School</h1>
          <p>Digital Excavation & Analysis Workbench v2.1</p>
        </div>
        <div className="phase-indicator">
          <span className={phase === 'dig' ? 'active' : 'done'}>
            <Shovel size={14} /> <strong>PHASE 1</strong> <em>Site Dig</em>
          </span>
          <ChevronRight size={14} />
          <span className={phase === 'sort' ? 'active' : phase === 'lab' || phase === 'report' ? 'done' : ''}>
            <Layers size={14} /> <strong>PHASE 2</strong> <em>Tent Sort</em>
          </span>
          <ChevronRight size={14} />
          <span className={phase === 'lab' ? 'active' : phase === 'report' ? 'done' : ''}>
            <Microscope size={14} /> <strong>PHASE 3</strong> <em>Lab Analysis</em>
          </span>
          <ChevronRight size={14} />
          <span className={phase === 'report' ? 'active' : ''}>
            <FileText size={14} /> <strong>PHASE 4</strong> <em>Final Report</em>
          </span>
        </div>
      </header>

      <main className="main-content">
        {phase === 'dig' && (
          <DigPhase 
            activeArtifacts={activeArtifacts}
            excavatedIds={excavatedIds}
            setExcavatedIds={setExcavatedIds}
            onComplete={handleDigComplete}
            currentEvent={currentScenario.events[0]}
          />
        )}
        {phase === 'sort' && (
          <SortPhase 
            artifacts={activeArtifacts.filter(a => excavatedIds.has(a.id))}
            onComplete={handleSortComplete}
          />
        )}
        {phase === 'lab' && (
          <LabPhase 
            binnedItems={binnedItems}
            onComplete={handleLabComplete}
          />
        )}
        {phase === 'report' && (
          <ReportPhase 
            scenario={currentScenario}
            binnedItems={binnedItems}
            hypotheses={hypotheses}
            onRestart={initGame}
          />
        )}
      </main>

      {/* Developer Overlays */}
      {devMode && (
        <div className="dev-tools">
          <div className="dev-tools-label">Staff Dev Tools</div>
          <button onClick={() => goToPhase('dig')} className={phase === 'dig' ? 'active' : ''}>Skip to Dig</button>
          <button onClick={() => {
            setExcavatedIds(new Set(activeArtifacts.map(a => a.id)));
            goToPhase('sort');
          }} className={phase === 'sort' ? 'active' : ''}>Skip to Sort</button>
          <button onClick={() => {
            const bins = { household: [], remains: [], structures: [], environment: [], written: [] };
            activeArtifacts.forEach(a => bins[a.type].push(a));
            setBinnedItems(bins);
            goToPhase('lab');
          }} className={phase === 'lab' ? 'active' : ''}>Skip to Lab</button>
          <button onClick={() => {
             const results = {};
             activeArtifacts.forEach(a => results[a.id] = "Developer hypothesis: This context shows high-status residential activity.");
             setHypotheses(results);
             const bins = { household: [], remains: [], structures: [], environment: [], written: [] };
             activeArtifacts.forEach(a => bins[a.type].push(a));
             setBinnedItems(bins);
             goToPhase('report');
          }} className={phase === 'report' ? 'active' : ''}>Skip to Report</button>
          <button onClick={initGame}>Reset All</button>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Icon Helper
// ------------------------------------------------------------------
function getIcon(type, size = 20) {
  switch (type) {
    case 'household': return <Gem size={size} />;
    case 'remains': return <Skull size={size} />;
    case 'structures': return <Hammer size={size} />;
    case 'environment': return <Mountain size={size} />;
    case 'written': return <ScrollText size={size} />;
    default: return <Info size={size} />;
  }
}
