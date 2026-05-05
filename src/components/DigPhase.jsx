import { useState, useEffect, useRef, useLayoutEffect } from 'react'; 
import { 
  Pickaxe, Clock, Radar, Trophy, RefreshCw, HelpCircle, Lightbulb, 
  CheckCircle2, FileText, Tent
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getArtifactTheme, 
  getArtifactEraLabel, 
  getCategoryTitle,
  createDigTiles
} from '../utils/gameLogic';
import { getIcon } from './Icons';

export function DigPhase({ activeArtifacts, excavatedIds, setExcavatedIds, onComplete, currentEvent, onBackToMenu, audioControls = {} }) {
  const { playFlip, playMatch, playError, initAudio, playTone } = audioControls;
  const [tiles, setTiles] = useState(() => createDigTiles(activeArtifacts, excavatedIds));
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', isError: false });
  const [fieldNote, setFieldNote] = useState(null);
  const [showDebrief, setShowDebrief] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(currentEvent.time); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStormWarning, setShowStormWarning] = useState(true);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const [attempts, setAttempts] = useState(0);
  const [isSurveying, setIsSurveying] = useState(false);
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
    
    if (initAudio) initAudio();
    if (playTone) playTone(800, 'sine', 0.5, 0.1);
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

    if (initAudio) initAudio();
    if (playFlip) playFlip();

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
          if (playMatch) playMatch();
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
          if (playError) playError();
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
                if (initAudio) initAudio();
                setTimeLeft(difficulty === 'easy' ? 300 : difficulty === 'medium' ? 180 : 90);
                setShowStormWarning(false);
                setIsPlaying(true);
              }}>1 Player <Pickaxe size={20} /></button>
              <button className="btn primary-btn" onClick={() => {
                if (initAudio) initAudio();
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
            <button
              className="btn primary-btn"
              onClick={() => onComplete(recoveredArtifacts)}
            >
              Open Sorting Tent <Tent size={20} />
            </button>
          </div>
        </div>
      )}

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
