import React, { useState, useEffect, useMemo } from 'react';
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
import { 
  Pickaxe, Tent, Search, FileText, CheckCircle2, X, ChevronRight, Clock, Wind, Radar, 
  Droplets, AlertTriangle, Moon, RefreshCw, Library, Users, Skull, Landmark, Leaf, 
  ScrollText, Package, Sparkles, ArrowRight, Lightbulb, Info, HelpCircle, History,
  MapPin, Beaker, Dna, Zap, Trophy, Award, Check, Database, FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './index.css';

// --- Advanced Audio Synthesis ---
let audioCtx = null;
export const initAudio = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
};

export const playFlip = () => {
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

export const playMatch = () => {
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

export const playError = () => {
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

export const playWin = () => {
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

export const playTone = (freq, type = 'sine', duration = 0.5, vol = 0.2) => {
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
import { CATEGORIES, RANDOM_EVENTS, SCENARIOS, RED_HERRINGS } from './data';

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

const getCategoryTitle = (type) => CATEGORIES.find(category => category.id === type)?.title ?? type;

const getArtifactEraLabel = (artifact) => {
  if (!artifact) return 'Unknown';
  if (artifact.isRedHerring) return 'Modern disturbance';
  
  // Try to find the scenario this artifact belongs to for a better label
  for (const s of SCENARIOS) {
    if (s.evidence.some(e => e.id === artifact.id)) {
      return s.civilization;
    }
  }
  return 'Ancient evidence';
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
  
  // Game Stats
  const [attempts, setAttempts] = useState(0);
  const [isSurveying, setIsSurveying] = useState(false);
 
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
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [fieldNote]);

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
    
    setTimeout(() => {
      setTiles(prev => prev.map(t => t.isMatched ? t : { ...t, isFlipped: false }));
      setIsLocked(false);
      setIsSurveying(false);
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
      timestamp: Date.now()
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

  return (
    <div className="phase-container dig-phase">
      {/* Modals */}
      {showStormWarning && (
        <div className="modal-overlay">
          <div className="modal-content glass-card warning-modal" style={{borderColor: currentEvent.dangerColor, boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${currentEvent.dangerColor}40`}}>
            <EventIcon size={48} style={{ color: currentEvent.dangerColor, marginBottom: '1rem', animation: 'pulse 2s infinite' }} />
            <h2 className="modal-title" style={{color: currentEvent.dangerColor}}>{currentEvent.title}</h2>
            <p style={{fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--sand-100)'}}>
              {currentEvent.description} You have exactly <strong>{difficulty === 'easy' ? '5 minutes' : difficulty === 'medium' ? '3 minutes' : '90 seconds'}</strong> to excavate as many artifacts as you can before we must evacuate.
            </p>
            <div style={{marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <p style={{margin: '0 0 10px 0', fontWeight: 'bold', color: 'var(--sand-200)'}}>Select Difficulty:</p>
              <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
                <button className={`btn ${difficulty === 'easy' ? 'primary-btn' : ''}`} onClick={() => setDifficulty('easy')} style={{padding: '5px 15px', background: difficulty === 'easy' ? 'var(--accent)' : 'rgba(0,0,0,0.5)', color: difficulty === 'easy' ? '#111' : 'var(--sand-100)', border: '1px solid var(--sand-600)'}}>Easy (5 Min)</button>
                <button className={`btn ${difficulty === 'medium' ? 'primary-btn' : ''}`} onClick={() => setDifficulty('medium')} style={{padding: '5px 15px', background: difficulty === 'medium' ? 'var(--accent)' : 'rgba(0,0,0,0.5)', color: difficulty === 'medium' ? '#111' : 'var(--sand-100)', border: '1px solid var(--sand-600)'}}>Medium (3 Min)</button>
                <button className={`btn ${difficulty === 'hard' ? 'primary-btn' : ''}`} onClick={() => setDifficulty('hard')} style={{padding: '5px 15px', background: difficulty === 'hard' ? 'var(--accent)' : 'rgba(0,0,0,0.5)', color: difficulty === 'hard' ? '#111' : 'var(--sand-100)', border: '1px solid var(--sand-600)'}}>Hard (90 Sec)</button>
              </div>
            </div>
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
              <button className="btn primary-btn" onClick={() => {
                initAudio();
                setNumPlayers(1);
                setTimeLeft(difficulty === 'easy' ? 300 : difficulty === 'medium' ? 180 : 90);
                setShowStormWarning(false);
                setIsPlaying(true);
              }}>1 Player <Pickaxe size={20} /></button>
              <button className="btn primary-btn" onClick={() => {
                initAudio();
                setNumPlayers(2);
                setTimeLeft(difficulty === 'easy' ? 300 : difficulty === 'medium' ? 180 : 90);
                setShowStormWarning(false);
                setIsPlaying(true);
              }}>2 Player Versus <Pickaxe size={20} /></button>
            </div>
          </div>
        </div>
      )}

      {isTimeUp && (
        <div className="modal-overlay">
          <div className="modal-content glass-card warning-modal" style={{borderColor: '#ef4444'}}>
            <EventIcon size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
            <h2 className="modal-title" style={{color: '#ef4444'}}>Time's Up!</h2>
            <p style={{fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--sand-100)'}}>
              We had to evacuate the site! You managed to save <strong>{excavatedIds.size}</strong> artifacts.
            </p>
            <button className="btn primary-btn" onClick={openDebrief}>Run to Sorting Tent <Tent size={20} /></button>
          </div>
        </div>
      )}

      {perfectClear && (
        <div className="modal-overlay">
          <div className="modal-content glass-card warning-modal">
            <CheckCircle2 size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
            <h2 className="modal-title" style={{color: 'var(--success)'}}>Site Cleared!</h2>
            <p style={{fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--sand-100)'}}>
              Incredible! You excavated all artifacts with {formatTime(timeLeft)} to spare!
            </p>
            <button className="btn primary-btn" onClick={openDebrief}>Head to Sorting Tent <Tent size={20} /></button>
          </div>
        </div>
      )}

      {showDebrief && (
        <div className="modal-overlay">
          <div className="modal-content glass-card debrief-modal">
            <FileText size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
            <h2 className="modal-title" style={{color: 'var(--accent)'}}>Field Notebook</h2>
            <div className="field-note-summary">
              <div className="field-note-stat"><strong>{ancientRecoveredCount}</strong><span>Ancient finds</span></div>
              <div className="field-note-stat"><strong>{disturbanceCount}</strong><span>Disturbance items</span></div>
              <div className="field-note-stat"><strong>{recoveredArtifacts.length}</strong><span>Total items</span></div>
            </div>
            <button className="btn primary-btn" onClick={() => onComplete(excavatedIds)}>Proceed to Sorting <Tent size={20} /></button>
          </div>
        </div>
      )}

      {/* Status Panel */}
      <div className="dig-status-panel">
        <div className="status-section left">
          <div className="status-icon-box">
             <EventIcon size={24} style={{color: currentEvent.dangerColor}} />
          </div>
          <div className="status-info">
            <div className="status-phase-label">Phase 1: Emergency Excavation</div>
            <div className="status-warning-pill" style={{'--pill-color': currentEvent.dangerColor}}>
               {currentEvent.title}
            </div>
          </div>
        </div>
        
        <div className="status-section center">
          <div className={`timer-card ${timeDanger ? 'danger' : ''}`}>
             <Clock size={22} />
             <span className="timer-value">{formatTime(timeLeft)}</span>
             <div className="timer-label">TIME REMAINING</div>
          </div>
        </div>

        <div className="status-section right">
           <button 
             className="radar-btn" 
             onClick={handleRadar}
             disabled={timeLeft <= (difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 10) || isLocked || !isPlaying}
           >
             <Radar size={18} /> Use Radar (-{difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 10}s)
           </button>
        </div>
      </div>

      {/* Game Panel */}
      <div className="dig-game-panel">
        <div className="instruction-row">
          <Lightbulb size={18} className="instruction-icon" />
          <span>Find matching artefacts before time runs out!</span>
        </div>
        
        <div className="game-board-container" style={{position: 'relative'}}>
          {isSurveying && (
            <div className="surveying-overlay">
               <div className="surveying-content">
                  <div className="surveying-scanner"></div>
                  <div className="surveying-text">SURVEYING AREA...</div>
               </div>
            </div>
          )}
          <div className="memory-grid">
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
                        {getIcon(tile.artifact.type, 28)}
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

      {/* Footer Panel */}
      <div className="dig-footer-panel">
        <div className="footer-stat">
           <Trophy size={20} className="footer-icon" />
           <div className="stat-content">
             <span className="stat-label">Matches Found</span>
             <span className="stat-value">{excavatedIds.size} / {activeArtifacts.length}</span>
           </div>
        </div>
        <div className="footer-stat">
           <RefreshCw size={20} className="footer-icon" />
           <div className="stat-content">
             <span className="stat-label">Attempts</span>
             <span className="stat-value">{attempts}</span>
           </div>
        </div>
        <button className="help-btn" onClick={() => setFeedback({message: "Match pairs of items to excavate them. Some are ancient, some are modern distraction!", isError: false})}>
           <HelpCircle size={20} /> How to Play
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
function SortPhase({ activeArtifacts, itemsLocation, setItemsLocation, onComplete }) {
  const [activeId, setActiveId] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', isError: false });

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
    const catTitle = CATEGORIES.find(c => c.id === categoryId)?.title ?? 'this category';
    setFeedback({ message: `Recovered - this fits ${catTitle.toLowerCase()}.`, isError: false });
    setHoveredCard(null); // Deselect on success
  };

  const processFailure = () => {
    initAudio();
    playError();
    setFeedback({ message: "Not quite - check the clue and the discovery method again.", isError: true });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over) {
      const card = activeArtifacts.find(c => c.id === active.id);
      if (card.type === over.id) {
        processSuccess(card, over.id);
      } else {
        processFailure();
      }
    }
  };

  const handleQuickSort = (categoryId) => {
    if (!hoveredCard) return;
    if (hoveredCard.type === categoryId) {
      processSuccess(hoveredCard, categoryId);
    } else {
      processFailure();
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
      <div className="phase-status-panel">
        <div className="status-panel-info">
          <div className="status-icon-box">
            <Tent size={24} color="var(--accent)" />
          </div>
          <div className="status-text-content">
            <h2>Phase 2: Sorting Tent</h2>
            <p>Drag the artefacts you saved into the correct evidence categories.</p>
          </div>
        </div>
        <div className="status-panel-progress">
          <div className="progress-label-row">
            <span className="progress-label">PROGRESS</span>
            <span className="progress-count">{sortedCount} / {activeArtifacts.length} sorted</span>
          </div>
          <div className="progress-bar-wide">
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
              <h3>INVENTORY</h3>
              <p>Tap an item to see its clue, then drag to a category.</p>
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
                  <p>All items sorted!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Clues and Categories */}
          <div className="sort-content-area">
            <div className="clue-card-wide">
              <div className="clue-card-header">
                <div className="clue-label">CLUE CARD</div>
                {hoveredCard && <div className="selected-item-tag">{hoveredCard.name}</div>}
              </div>
              <div className="clue-card-body">
                {hoveredCard ? (
                  <div className="clue-info-active animate-fade-in">
                    <p className="clue-text">"{hoveredCard.clue}"</p>
                    <div className="clue-metadata">
                      <span><strong>Discovery:</strong> {hoveredCard.discoveryMethod}</span>
                      <span><strong>Context:</strong> {getArtifactEraLabel(hoveredCard)}</span>
                    </div>
                    <p className="clue-prompt">Which evidence category does this best fit?</p>
                  </div>
                ) : (
                  <div className="clue-placeholder">
                    <p className="placeholder-main">No item selected</p>
                    <p className="placeholder-sub">Tap an item from the inventory to view its clue before sorting.</p>
                  </div>
                )}
                
                {feedback.message && (
                  <div className={`sort-feedback-inline ${feedback.isError ? 'error' : 'success'}`}>
                    {feedback.isError ? '❌ ' : '✅ '}{feedback.message}
                  </div>
                )}
              </div>
            </div>

            <div className="categories-section">
              <h4 className="section-heading">SORT INTO EVIDENCE CATEGORIES</h4>
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
            </div>

            <div className="sort-footer-actions">
              <button 
                className="help-btn-large" 
                onClick={() => setFeedback({message: "Carefully read the clue for each item. Think about what it is made of, where it was found, and what it represents.", isError: false})}
              >
                <HelpCircle size={20} /> How to Play
              </button>
              
              {isComplete && (
                <div className="completion-action animate-bounce-in">
                   <button className="btn primary-btn large-btn" onClick={onComplete}>
                     Proceed to The Lab <ArrowRight size={22} />
                   </button>
                </div>
              )}
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
function LabPhase({ activeArtifacts, itemsLocation, hypotheses, setHypotheses, scenarios, currentScenario, onComplete }) {
  // Use currentScenario directly as it is passed as the scenario object from App.jsx
  const currentScenarioData = currentScenario;

  const [inspectingItem, setInspectingItem] = useState(null);
  const [showNamingModal, setShowNamingModal] = useState(false);
  const [tempSiteName, setTempSiteName] = useState("");
  const [selectedCiv, setSelectedCiv] = useState(null);
  const [wrongAttempt, setWrongAttempt] = useState(false);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [shuffledCivs, setShuffledCivs] = useState([]);

  useEffect(() => {
    setWrongAttempt(false);
    setIsSuccess(false);
    setCurrentSelection(null);
    if (inspectingItem && inspectingItem.options) {
      const opts = inspectingItem.options.map((text, idx) => ({ text, originalIndex: idx }));
      setShuffledOptions([...opts].sort(() => Math.random() - 0.5));
    }
  }, [inspectingItem]);

  useEffect(() => {
    if (showNamingModal) {
      setShuffledCivs([...scenarios].sort(() => Math.random() - 0.5));
    }
  }, [showNamingModal, scenarios]);
  
  // They only need to analyze up to 3 (or less if they found less than 3)
  const requiredCount = Math.min(3, activeArtifacts.length);
  const hypothesesCount = Object.keys(hypotheses).length;
  const isComplete = hypothesesCount >= requiredCount;

  return (
    <div className="phase-container">
      <div className="phase-header lab-header" style={{marginBottom: '0.5rem'}}>
        <h2 style={{fontSize: '1.15rem', marginBottom: '2px'}}><Search size={22} /> Phase 3: The Lab</h2>
        <p style={{fontSize: '0.85rem', marginBottom: '0.5rem'}}>Analyze <strong>{requiredCount} artifact{requiredCount > 1 ? 's' : ''}</strong>. What do they reveal?</p>
        
        {currentScenarioData && (
          <div className="historical-context-box slide-up" style={{padding: '0.6rem 0.8rem', marginBottom: '0.5rem'}}>
            <h3 style={{fontSize: '0.9rem', marginBottom: '2px'}}><ScrollText size={16} style={{verticalAlign: 'middle', marginRight: '6px'}}/> Briefing</h3>
            <p style={{fontSize: '0.82rem', lineHeight: '1.3'}}>{currentScenarioData.historicalContext}</p>
          </div>
        )}

        <div className="progress-bar" style={{height: '6px', marginBottom: '2px'}}>
          <div className="progress-fill" style={{ width: `${Math.min(100, (hypothesesCount / requiredCount) * 100)}%` }}></div>
        </div>
        <p className="progress-text" style={{fontSize: '0.75rem'}}>Analyzed: {hypothesesCount} / {requiredCount}</p>
      </div>

      <div className="sorting-layout read-only">
        {CATEGORIES.map(cat => (
          <CategoryBin 
            key={cat.id} 
            category={cat} 
            items={activeArtifacts.filter(c => itemsLocation[c.id] === cat.id)} 
            onArtifactClick={setInspectingItem}
            itemsWithHypothesis={hypotheses}
          />
        ))}
      </div>
      
      {isComplete && (
        <div className="action-footer slide-up">
           <button className="btn primary-btn" onClick={() => setShowNamingModal(true)}>
             Complete Analysis <CheckCircle2 size={20} />
           </button>
        </div>
      )}

      {showNamingModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card slide-up" style={{maxWidth: '600px'}}>
            <h2 className="modal-title">Final Synthesis</h2>
            
            <div className="mcq-options" style={{marginBottom: '2rem'}}>
               {shuffledCivs.map((scen, idx) => (
                  <button key={idx} className="btn" 
                     style={{
                        background: selectedCiv === scen.id ? 'var(--accent)' : 'rgba(0,0,0,0.4)',
                        color: selectedCiv === scen.id ? '#111' : 'var(--sand-100)',
                        border: '1px solid var(--sand-600)',
                        marginBottom: '8px',
                        display: 'block', width: '100%',
                        textAlign: 'left'
                     }}
                     onClick={() => setSelectedCiv(scen.id)}
                  >{scen.civilization}</button>
               ))}
            </div>

            <h3 style={{marginTop: '1rem', marginBottom: '0.5rem'}}>Name Your Dig Site</h3>
            <p style={{marginBottom: '1rem', color: 'var(--sand-300)', fontSize: '0.9rem'}}>What should we call this site for the official records?</p>
            <input 
              type="text" 
              className="hypothesis-input" 
              style={{minHeight: 'auto', textAlign: 'center', fontSize: '1.5rem', padding: '1rem'}}
              placeholder="e.g. The Lost City of Alexandria"
              value={tempSiteName}
              onChange={e => setTempSiteName(e.target.value)}
            />
            <button className="btn primary-btn" style={{marginTop: '1.5rem'}} disabled={!selectedCiv} onClick={() => {
               confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
               initAudio();
               playWin();
               onComplete(tempSiteName || "Unknown Dig Site", selectedCiv);
            }}>
              Generate Final Report <FileText size={20} />
            </button>
          </div>
        </div>
      )}

      {inspectingItem && !showNamingModal && (
        <div className="modal-overlay" onClick={() => setInspectingItem(null)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setInspectingItem(null)}><X size={20} /></button>
            <h2 className="modal-title" style={{fontSize: '1.4rem', marginBottom: '0.15rem'}}>{inspectingItem.name}</h2>
            
            <div className="evidence-metadata" style={{
              background: 'rgba(0,0,0,0.3)', 
              padding: '8px 10px', 
              borderRadius: '8px', 
              marginBottom: '8px', 
              textAlign: 'left', 
              border: '1px solid var(--sand-600)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px'
            }}>
              <p style={{margin: '0', fontSize: '0.75rem', color: 'var(--sand-200)'}}>
                <strong style={{color: 'var(--accent)', display: 'block', marginBottom: '0'}}>
                  <Pickaxe size={11} style={{verticalAlign:'middle', marginRight:'4px'}}/> Method:
                </strong> 
                {inspectingItem.discoveryMethod}
              </p>
              <p style={{margin: '0', fontSize: '0.75rem', color: 'var(--sand-200)'}}>
                <strong style={{color: 'var(--accent)', display: 'block', marginBottom: '0'}}>
                  <FileText size={11} style={{verticalAlign:'middle', marginRight:'4px'}}/> Notes:
                </strong> 
                "{inspectingItem.clue}"
              </p>
            </div>
            
            <div className="hypothesis-prompt" style={{marginBottom: '0.35rem', fontSize: '0.82rem', lineHeight: '1.2'}}>
              Analysis: {inspectingItem.question}
            </div>
            
            <div className="mcq-options" style={{display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '0.6rem'}}>
              {shuffledOptions
                .filter(opt => !isSuccess || opt.originalIndex === inspectingItem.correct)
                .map((opt, idx) => (
                <button 
                  key={idx}
                  className="btn"
                  style={{
                    background: currentSelection === opt.originalIndex ? 'var(--accent)' : 'rgba(0,0,0,0.4)',
                    color: currentSelection === opt.originalIndex ? '#111' : 'var(--sand-100)',
                    border: '1px solid var(--sand-600)',
                    textAlign: 'left',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 'normal',
                    justifyContent: 'flex-start',
                    lineHeight: '1.2'
                  }}
                  disabled={isSuccess}
                  onClick={() => {
                    if (isSuccess) return;
                    setCurrentSelection(opt.originalIndex);
                    setWrongAttempt(false);
                  }}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {wrongAttempt && (
               <p style={{color: '#ef4444', fontWeight: 'bold', marginBottom: '0.75rem', animation: 'pulse 1s infinite', background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '8px', border: '1px solid #ef4444', fontSize: '0.8rem'}}>
                 ❌ Incorrect interpretation. Review the notes and try again!
               </p>
            )}

            {isSuccess && (
               <div className="rationale-box slide-up" style={{
                 background: 'rgba(74, 222, 128, 0.1)',
                 border: '1px solid var(--success)',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  marginBottom: '0.6rem',
                 textAlign: 'left',
                 animation: 'fadeIn 0.5s ease-out'
               }}>
                 <h4 style={{color: 'var(--success)', marginBottom: '0.1rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem'}}>
                   <Sparkles size={12} /> Analysis Confirmed
                 </h4>
                 <p style={{color: 'var(--sand-100)', lineHeight: '1.25', fontSize: '0.78rem'}}>
                   {inspectingItem.rationale || "Great job! Your analysis correctly identifies the historical significance of this artifact."}
                 </p>
               </div>
            )}
            
            {!isSuccess ? (
              <button 
                className="btn primary-btn" 
                disabled={currentSelection === null}
                style={{opacity: currentSelection === null ? 0.5 : 1, width: '100%', padding: '8px', fontSize: '0.95rem'}}
                onClick={() => {
                  initAudio();
                  if (currentSelection == inspectingItem.correct) {
                    playMatch();
                    setIsSuccess(true);
                  } else {
                    playError();
                    setWrongAttempt(true);
                  }
                }}
              >
                Submit Analysis <CheckCircle2 size={16} />
              </button>
            ) : (
              <button 
                className="btn primary-btn" 
                style={{background: 'var(--success)', color: '#111', width: '100%', padding: '8px', fontSize: '0.95rem'}}
                onClick={() => {
                  setHypotheses({...hypotheses, [inspectingItem.id]: currentSelection});
                  setInspectingItem(null);
                  setIsSuccess(false);
                }}
              >
                Accept Findings & Continue <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Phase 4: Report
// ------------------------------------------------------------------
const generateFeedback = (selectedIndex, correctIndex) => {
  if (selectedIndex === correctIndex) {
    return "✅ Expert Feedback: Correct interpretation! You successfully connected the primary evidence to logical conclusions about this ancient civilization.";
  }
  return "💡 Growth Feedback: Historical evidence is contestable, but most archaeologists interpret this differently. Review the evidence and try again.";
};

// ------------------------------------------------------------------
// Phase 4: Museum Curator (Student selects items and writes labels)
// ------------------------------------------------------------------
function MuseumPhase({ activeArtifacts, excavatedIds, hypotheses, curatedItems, setCuratedItems, plaques, setPlaques, onComplete }) {
  const [editingId, setEditingId] = useState(null);

  const analyzedItems = activeArtifacts.filter(a => excavatedIds.has(a.id) && hypotheses[a.id] !== undefined);
  
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

  const isReady = curatedItems.length === 3 && curatedItems.every(id => plaques[id] && plaques[id].length > 10);

  return (
    <div className="phase-container museum-phase">
      <div className="phase-header">
        <h2><Library size={28} /> Phase 4: Grand Opening Curation</h2>
        <p>Select your 3 most significant artifacts to feature in the Grand Opening of the local Museum exhibit.</p>
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
                  <div style={{fontSize: '0.8rem', color: 'var(--sand-300)'}}>{item.type}</div>
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
            <h3 style={{textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--sand-400)', marginBottom: '1rem', fontSize: '0.85rem'}}>The Discovery Gallery</h3>
            
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

            {editingId ? (
              <div className="plaque-editor animate-fade-in" style={{background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--accent)', flex: 1}}>
                <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem', height: '100%'}}>
                  {analyzedItems.find(a => a.id === editingId).image && (
                    <div style={{width: '180px', flexShrink: 0}}>
                      <img 
                        src={analyzedItems.find(a => a.id === editingId).image} 
                        alt="Artifact"
                        style={{width: '100%', height: 'auto', borderRadius: '8px', border: '1px solid var(--sand-600)', boxShadow: '0 4px 20px rgba(0,0,0,0.6)'}}
                      />
                    </div>
                  )}
                  <div style={{flex: 1}}>
                      <label style={{display: 'block', color: 'var(--accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px'}}>Exhibition Plaque: {analyzedItems.find(a => a.id === editingId).name}</label>
                      <textarea 
                        placeholder="Write an educational plaque..."
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
        {!isReady && <p style={{fontSize: '0.8rem', color: 'var(--sand-400)', marginTop: '4px'}}>Curate 3 items to finish.</p>}
      </div>
    </div>
  );
}

function ReportPhase({ activeArtifacts, itemsLocation, hypotheses, siteName, finalConclusion, currentScenario, onBack, currentEvent, onRetry, curatedItems = [], plaques = {} }) {
  const summary = useMemo(() => {
    const total = activeArtifacts.length;
    const eventTitle = (currentEvent && currentEvent.title) ? currentEvent.title.replace('!', '') : 'Emergency';
    let vol = `Despite the emergency situation (${eventTitle}), your team successfully excavated ${total} artifact${total !== 1 ? 's' : ''}. `;
    if (total < 5) {
      vol += "While the incident forced an early evacuation, this small sample still provides valuable clues, though much of the site remains a mystery.";
    } else if (total < 10) {
      vol += "This provides a strong foundation of evidence to help us understand the ancient people who lived here.";
    } else {
      vol += "This incredibly rich collection of evidence gives us a highly detailed picture of ancient life at this dig site.";
    }

    const names = activeArtifacts.map(a => a.name.toLowerCase());
    const specs = [];
    
    if (names.some(n => n.includes('pottery') || n.includes('sword') || n.includes('coin') || n.includes('amulet') || n.includes('jade') || n.includes('mirror'))) {
      specs.push("The objects you discovered prove that these people had advanced skills in craft, metallurgy, and potentially a trading economy.");
    }
    if (names.some(n => n.includes('skull') || n.includes('teeth') || n.includes('mummified') || n.includes('bone') || n.includes('skeleton'))) {
      specs.push("The human and animal remains provide crucial biological evidence about their physical health, diet, and their spiritual beliefs surrounding death.");
    }
    if (names.some(n => n.includes('temple') || n.includes('wall') || n.includes('hearth') || n.includes('trap') || n.includes('aqueduct') || n.includes('foundation') || n.includes('kiln'))) {
      specs.push("The places and structures indicate organized engineering, settlement building, and potentially defensive or communal capabilities.");
    }
    if (names.some(n => n.includes('shell') || n.includes('seeds') || n.includes('charcoal') || n.includes('silt') || n.includes('ash') || n.includes('papyrus') || n.includes('leaves'))) {
      specs.push("The environmental evidence gives us a direct look into their diet, local climate, available natural resources, and agricultural practices.");
    }
    if (names.some(n => n.includes('tablet') || n.includes('painting') || n.includes('hieroglyph') || n.includes('scroll') || n.includes('art') || n.includes('bone') || n.includes('slips') || n.includes('inscription'))) {
      specs.push("The written and symbolic evidence reveals their intellectual culture, showing how they communicated, recorded history, and expressed complex ideas.");
    }

    return { vol, specs };
  }, [activeArtifacts]);

  return (
    <div className="report-container" style={{padding: '1rem', maxWidth: '800px'}}>
      <div className="report-paper" style={{padding: '1.5rem'}}>
        <div className="report-header" style={{marginBottom: '1rem', paddingBottom: '0.5rem'}}>
          <h2 style={{fontSize: '1.5rem'}}>Archaeologist's Final Report</h2>
          <p className="report-subtitle" style={{fontSize: '1rem'}}>Dig Site: {siteName}</p>
        </div>
        
        {finalConclusion && currentScenario && (
          <div className="site-conclusion" style={{
            background: finalConclusion === currentScenario.id ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            borderColor: finalConclusion === currentScenario.id ? '#22c55e' : '#ef4444',
            padding: '1rem', marginBottom: '1rem'
          }}>
             <h3 style={{color: finalConclusion === currentScenario.id ? '#166534' : '#991b1b', fontSize: '1.1rem', marginBottom: '0.5rem'}}>
               <Search size={18} style={{verticalAlign:'middle', marginBottom:'2px'}}/> Grand Synthesis
             </h3>
             <p style={{fontSize: '0.9rem'}}><strong>Your Hypothesis:</strong> {SCENARIOS.find(s => s.id === finalConclusion)?.civilization}</p>
             <p style={{fontSize: '0.9rem'}}><strong>True Identity:</strong> {currentScenario.civilization}</p>
             <p style={{marginTop: '6px', fontStyle: 'italic', color: finalConclusion === currentScenario.id ? '#166534' : '#991b1b', fontSize: '0.85rem'}}>
               {finalConclusion === currentScenario.id 
                  ? "✅ Excellent work! You correctly synthesized the evidence." 
                  : "💡 Historical interpretation requires looking at all evidence together."}
             </p>
          </div>
        )}

        <div className="site-conclusion" style={{marginTop: '1rem', padding: '1rem', marginBottom: '1rem'}}>
          <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}><Search size={18} style={{verticalAlign:'middle', marginBottom:'2px'}}/> Evidence Summary</h3>
          <p className="conclusion-vol" style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>{summary.vol}</p>
          {summary.specs.length > 0 && (
            <ul className="conclusion-specs" style={{fontSize: '0.85rem'}}>
              {summary.specs.map((spec, i) => <li key={i}>{spec}</li>)}
            </ul>
          )}
        </div>

        {curatedItems.length > 0 && (
          <div className="site-conclusion" style={{marginTop: '1.5rem', background: 'rgba(232, 158, 93, 0.05)', borderColor: 'var(--accent)'}}>
             <h3 style={{color: 'var(--accent)'}}><Library size={20} style={{verticalAlign:'middle', marginBottom:'2px'}}/> Museum Exhibition: Star Finds</h3>
             <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem'}}>
                {curatedItems.map(id => {
                  const item = activeArtifacts.find(a => a.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} style={{padding: '10px', background: '#fff', borderRadius: '4px', border: '1px solid #ddd'}}>
                       {item.image && <img src={item.image} style={{width: '100%', height: '80px', objectFit: 'cover', borderRadius: '2px', marginBottom: '8px'}} alt={item.name}/>}
                       <h4 style={{margin: '0 0 4px 0', fontSize: '0.9rem'}}>{item.name}</h4>
                       <p style={{fontSize: '0.75rem', color: '#555', fontStyle: 'italic', lineHeight: '1.2'}}>{plaques[id]}</p>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        <div className="report-body">
          {CATEGORIES.map(cat => {
            const items = activeArtifacts.filter(c => itemsLocation[c.id] === cat.id);
            if (items.length === 0) return null;
            return (
              <div key={cat.id} className="report-category">
                <h3>{cat.title}</h3>
                <ul>
                  {items.map(item => (
                    <li key={item.id} className="report-item">
                      <div className="report-item-header">
                        <strong>{item.name}</strong>
                        <span className="report-clue">{item.clue}</span>
                      </div>
                      {hypotheses[item.id] !== undefined && (
                        <>
                          <div className="report-hypothesis">
                            <strong>Significance:</strong> "{item.options && hypotheses[item.id] !== undefined ? item.options[hypotheses[item.id]] : 'N/A'}"
                          </div>
                          <div className="report-feedback">
                            {generateFeedback(hypotheses[item.id], item.correct)}
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="report-actions hide-on-print">
         <button className="btn" onClick={onBack}>
           Back to Lab
         </button>
         <button className="btn primary-btn" onClick={() => window.print()}>
           Print Report
         </button>
         <button className="btn" onClick={onRetry} style={{marginLeft: 'auto', background: 'var(--accent)', color: '#111', borderColor: 'var(--accent)'}}>
           <RefreshCw size={20} style={{verticalAlign:'middle', marginRight:'5px'}} />
           Start New Dig
         </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Dev Tools Component
// ------------------------------------------------------------------
function DevTools({ currentPhase, setPhase, setExcavatedIds, setActiveArtifacts, setItemsLocation, setHypotheses, setCurrentScenario, setCurrentEvent, setSiteName, setFinalConclusion }) {
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
    } else if (target === 'lab' || target === 'museum' || target === 'report') {
      const locations = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: a.type || 'objects' }), {});
      setItemsLocation(locations);
      
      const hyps = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: a.correct || 0 }), {});
      setHypotheses(hyps);
      setSiteName("Mock Testing Site");
      setFinalConclusion(scen.id);
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
    </div>
  );
}

// ------------------------------------------------------------------
// Main App Component
// ------------------------------------------------------------------
export default function App() {
  const [phase, setPhase] = useState('dig'); // 'dig', 'sort', 'lab', 'report'
  const [currentScenario, setCurrentScenario] = useState(null);
  const [activeArtifacts, setActiveArtifacts] = useState([]);
  const [excavatedIds, setExcavatedIds] = useState(new Set());
  const [itemsLocation, setItemsLocation] = useState({});
  const [hypotheses, setHypotheses] = useState({});
  const [siteName, setSiteName] = useState("Unknown Dig Site");
  const [finalConclusion, setFinalConclusion] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [curatedItems, setCuratedItems] = useState([]);
  const [plaques, setPlaques] = useState({});

  const initGame = () => {
    const scen = SCENARIOS && SCENARIOS.length > 0 
      ? SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)] 
      : null;
    
    if (!scen || !scen.evidence) {
      console.error("Critical Error: No scenario or evidence found during initialization.");
      return;
    }

    const evt = RANDOM_EVENTS && RANDOM_EVENTS.length > 0 
      ? RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)] 
      : { title: "Emergency", time: 60, icon: AlertTriangle };

    setCurrentScenario(scen);
    setCurrentEvent(evt);
    // Choose exactly 11 items from the scenario + 1 red herring = 12 items total (24 tiles)
    const scenarioArtifacts = [...scen.evidence].sort(() => 0.5 - Math.random()).slice(0, 11);
    const selectedRedHerring = (RED_HERRINGS && RED_HERRINGS.length > 0) 
      ? RED_HERRINGS[Math.floor(Math.random() * RED_HERRINGS.length)] 
      : { id: 'fallback', name: 'Unknown Object', type: 'objects', options: ['Ancient', 'Modern'], correct: 1 };

    const artifacts = [...scenarioArtifacts, selectedRedHerring].sort(() => 0.5 - Math.random());
    setActiveArtifacts(artifacts);
    setPhase('dig');
  };

  const [showDevTools, setShowDevTools] = useState(false);

  // Initialize random selection of 15 artifacts for the game (30 tiles for memory)
  useEffect(() => {
    initGame();
  }, []);

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

  const handleRetry = () => {
    setPhase('dig');
    setExcavatedIds(new Set());
    setItemsLocation({});
    setHypotheses({});
    setSiteName("Unknown Dig Site");
    setFinalConclusion(null);
    initGame();
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

  if (activeArtifacts.length === 0) return null;

  return (
    <div className="app-wrapper">
      <header className="main-header hide-on-print">
        <div className="header-left">
          <div className="header-icon-container">
            <Pickaxe size={32} className="header-main-icon" />
          </div>
          <div className="header-titles">
            <h1>Archaeology Challenge</h1>
            <p>What can evidence tell us about the ancient past?</p>
          </div>
        </div>
        <nav className="phase-navigation">
          <div className={`phase-nav-item ${phase === 'dig' ? 'active' : 'done'}`}>
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
      </header>

      <main className="main-content">
        {phase === 'dig' && currentEvent && (
          <DigPhase 
            activeArtifacts={activeArtifacts}
            excavatedIds={excavatedIds} 
            setExcavatedIds={setExcavatedIds} 
            onComplete={handleDigComplete}
            currentEvent={currentEvent}
          />
        )}
        
        {phase === 'sort' && (
          <SortPhase 
            activeArtifacts={activeArtifacts}
            itemsLocation={itemsLocation} 
            setItemsLocation={setItemsLocation} 
            onComplete={() => setPhase('lab')}
          />
        )}

        {phase === 'lab' && (
          <LabPhase 
            activeArtifacts={activeArtifacts}
            itemsLocation={itemsLocation} 
            hypotheses={hypotheses}
            setHypotheses={setHypotheses}
            scenarios={SCENARIOS}
            currentScenario={currentScenario}
            onComplete={(name, civId) => {
              setSiteName(name);
              setFinalConclusion(civId);
              setPhase('museum');
            }}
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
            onComplete={() => setPhase('report')}
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
          />
        )}
      </main>

      {showDevTools && (
        <DevTools 
          currentPhase={phase}
          setPhase={setPhase}
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
