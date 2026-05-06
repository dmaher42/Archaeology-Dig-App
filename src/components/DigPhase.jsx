import { useState, useEffect, useRef, useLayoutEffect } from 'react'; 
import { 
  Pickaxe, Clock, Radar, Trophy, RefreshCw, HelpCircle, Lightbulb, Users,
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
  const [feedback, setFeedback] = useState({ message: '', isError: false, tone: 'neutral' });
  const [fieldNote, setFieldNote] = useState(null);
  const [showDebrief, setShowDebrief] = useState(false);
  const [timerMode, setTimerMode] = useState('normal');
  const [selectedDigMode, setSelectedDigMode] = useState('normal');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(1);
  const [playerCount, setPlayerCount] = useState(1);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerScores, setPlayerScores] = useState([0, 0]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(currentEvent.time); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStormWarning, setShowStormWarning] = useState(true);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const [attempts, setAttempts] = useState(0);
  const [isSurveying, setIsSurveying] = useState(false);
  const [challengeDuration, setChallengeDuration] = useState(180);
  const radarTimeoutRef = useRef(null);
  const boardContainerRef = useRef(null);
  const [boardFit, setBoardFit] = useState({ width: 0, height: 0 });
  const boardColumns = 8;
  const boardRows = Math.max(1, Math.ceil(tiles.length / boardColumns));

  const EventIcon = currentEvent?.icon ?? HelpCircle;
  const recoveredArtifacts = activeArtifacts.filter(artifact => excavatedIds.has(artifact.id));
  const ancientRecoveredCount = recoveredArtifacts.filter(artifact => !artifact.isRedHerring).length;
  const disturbanceCount = recoveredArtifacts.filter(artifact => artifact.isRedHerring).length;
  const isTwoPlayer = playerCount === 2;
  const playerTurnLabel = isTwoPlayer ? `Player ${currentPlayerIndex + 1}` : 'Explorer';
  const playerOneScore = playerScores[0] ?? 0;
  const playerTwoScore = playerScores[1] ?? 0;
  const scoreSummary = isTwoPlayer
    ? `P1 ${playerOneScore} - P2 ${playerTwoScore}`
    : `Score ${playerOneScore}`;
  const getWinnerText = () => {
    if (!isTwoPlayer) return `You recovered ${recoveredArtifacts.length} find${recoveredArtifacts.length === 1 ? '' : 's'}.`;
    if (playerOneScore === playerTwoScore) return `It's a tie at ${playerOneScore} to ${playerTwoScore}.`;
    return `Player ${playerOneScore > playerTwoScore ? 1 : 2} wins ${Math.max(playerOneScore, playerTwoScore)} to ${Math.min(playerOneScore, playerTwoScore)}.`;
  };

  useEffect(() => {
    const isComplete = activeArtifacts.length > 0 && excavatedIds.size === activeArtifacts.length;
    if (!isPlaying || isTimeUp || isComplete) return;
    const interval = setInterval(() => {
      if (timerMode === 'challenge') {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsPlaying(false);
            setIsTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
        return;
      }
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeArtifacts.length, excavatedIds.size, isPlaying, isTimeUp, timerMode]);

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', isError: false, tone: 'neutral' });
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
    const radarCost = timerMode === 'challenge' ? (challengeDuration === 300 ? 30 : challengeDuration === 180 ? 20 : 10) : 0;
    if ((timerMode === 'challenge' && timeLeft <= radarCost) || isLocked || !isPlaying) return;
    
    if (initAudio) initAudio();
    if (playTone) playTone(800, 'sine', 0.5, 0.1);
    setFeedback({ message: 'Radar activated. Scanning sub-surface context...', isError: false, tone: 'neutral' });
    if (radarCost > 0) {
      setTimeLeft(prev => prev - radarCost);
    }
    setIsLocked(true);
    setIsSurveying(true);
    
    const duration = challengeDuration === 300 ? 5000 : challengeDuration === 180 ? 3000 : 1500;

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
          if (isTwoPlayer) {
            const scoringPlayer = currentPlayerIndex;
            setPlayerScores(prev => {
              const next = [...prev];
              next[scoringPlayer] = (next[scoringPlayer] || 0) + 1;
              return next;
            });
            setFeedback({
              message: `Player ${scoringPlayer + 1} keeps the turn.`,
              isError: false,
              tone: 'accent',
            });
          }
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
          if (isTwoPlayer) {
            const nextPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
            setCurrentPlayerIndex(nextPlayerIndex);
            setFeedback({
              message: `Turn passes to Player ${nextPlayerIndex + 1}.`,
              isError: false,
              tone: 'neutral',
            });
          }
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
  const displayTime = timerMode === 'challenge' ? timeLeft : elapsedTime;
  const timerLabel = timerMode === 'challenge' ? 'TIME LEFT' : 'TIME TAKEN';
  const timerModeLabel = timerMode === 'challenge' ? 'Challenge' : 'Explore';
  const challengeTimeLabel = challengeDuration === 300 ? '5 minutes' : challengeDuration === 180 ? '3 minutes' : '90 seconds';

  return (
    <div className="phase-container dig-phase">
      {showStormWarning && (
        <div className="modal-overlay">
          <div className="modal-content warning-modal" style={{borderColor: currentEvent.dangerColor, boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 40px ${currentEvent.dangerColor}30`}}>
            <div style={{ color: currentEvent.dangerColor, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <EventIcon size={64} style={{ animation: 'pulse 2s infinite', filter: `drop-shadow(0 0 15px ${currentEvent.dangerColor}60)` }} />
            </div>
            <h2 className="modal-title" style={{color: currentEvent.dangerColor}}>{currentEvent.title}</h2>
            <p className="modal-subtitle">{currentEvent.description}</p>
            <div className="dig-mode-picker">
              <div className="dig-mode-group">
                <p className="dig-step-label">Select Crew Size</p>
                <div className="dig-mode-grid">
                  <button
                    type="button"
                    className={`btn dig-mode-card ${selectedPlayerCount === 1 ? 'is-selected' : ''}`}
                    onClick={() => setSelectedPlayerCount(1)}
                  >
                    <strong>Solo Operation</strong>
                    <span>Single explorer focus</span>
                  </button>
                  <button
                    type="button"
                    className={`btn dig-mode-card ${selectedPlayerCount === 2 ? 'is-selected' : ''}`}
                    onClick={() => setSelectedPlayerCount(2)}
                  >
                    <strong>Team Expedition</strong>
                    <span>Two explorers, shared grid</span>
                  </button>
                </div>
              </div>

              <div className="dig-mode-group">
                <p className="dig-step-label">Excavation Strategy</p>
                <div className="dig-mode-grid">
                  <button
                    type="button"
                    className={`btn dig-mode-card ${selectedDigMode === 'normal' ? 'is-selected' : ''}`}
                    onClick={() => setSelectedDigMode('normal')}
                  >
                    <strong>Methodical Search</strong>
                    <span>No time pressure, thorough study</span>
                  </button>
                  <button
                    type="button"
                    className={`btn dig-mode-card ${selectedDigMode === 'challenge' ? 'is-selected' : ''}`}
                    onClick={() => setSelectedDigMode('challenge')}
                  >
                    <strong>Emergency Rescue</strong>
                    <span>Rapid recovery before time expires</span>
                  </button>
                </div>
              </div>

              {selectedDigMode === 'challenge' && (
                <div className="dig-mode-group" style={{animation: 'fadeIn 0.3s ease'}}>
                  <p className="dig-step-label">Time Authorization</p>
                  <div className="dig-time-grid">
                    <button className={`btn dig-time-pill ${challengeDuration === 300 ? 'is-selected' : ''}`} onClick={() => setChallengeDuration(300)}>5m Authorization</button>
                    <button className={`btn dig-time-pill ${challengeDuration === 180 ? 'is-selected' : ''}`} onClick={() => setChallengeDuration(180)}>3m Authorization</button>
                    <button className={`btn dig-time-pill ${challengeDuration === 90 ? 'is-selected' : ''}`} onClick={() => setChallengeDuration(90)}>90s Authorization</button>
                  </div>
                </div>
              )}
            </div>
            <div className="dig-mode-actions">
              <button className="btn secondary-btn" onClick={onBackToMenu}>
                Back to menu
              </button>
              <button className="btn primary-btn large-btn" onClick={() => {
                if (initAudio) initAudio();
                setPlayerCount(selectedPlayerCount);
                setCurrentPlayerIndex(0);
                setPlayerScores([0, 0]);
                setTimerMode(selectedDigMode);
                setElapsedTime(0);
                setTimeLeft(challengeDuration);
                setIsTimeUp(false);
                setShowDebrief(false);
                setFeedback({ message: '', isError: false, tone: 'neutral' });
                setShowStormWarning(false);
                setIsPlaying(true);
              }}>
                {selectedDigMode === 'challenge' ? `Start challenge (${challengeTimeLabel})` : 'Start explore'}
                <Pickaxe size={20} />
              </button>
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
              The site had to be cleared. {isTwoPlayer
                ? getWinnerText()
                : `You recovered ${excavatedIds.size} find${excavatedIds.size === 1 ? '' : 's'} for study.`}
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
              {isTwoPlayer
                ? `Every find was recovered. ${getWinnerText()}`
                : timerMode === 'challenge'
                  ? `Every find was recovered with ${formatTime(timeLeft)} remaining.`
                  : `Every find was recovered in ${formatTime(displayTime)}.`}
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
            <p style={{ margin: '0 0 1rem 0', color: 'var(--sand-200)' }}>
              {timerMode === 'challenge'
                ? `You cleared the site in ${formatTime(displayTime)} of challenge time.`
                : `You cleared the site in ${formatTime(displayTime)}.`}
            </p>
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
          <span className="status-sep">|</span>
          <span className="status-phase-label">{timerModeLabel}</span>
          {isTwoPlayer && (
            <>
              <span className="status-sep">|</span>
              <span className="status-phase-label">2 players</span>
            </>
          )}
        </div>
        
        <div className={`timer-horizontal ${timeDanger ? 'danger' : ''}`}>
           <Clock size={20} />
           <span className="timer-value">{formatTime(displayTime)}</span>
           <span className="timer-label">{timerLabel}</span>
        </div>

        {isTwoPlayer && (
          <div className="dig-player-row" aria-label="Player scores">
            <div className={`dig-player-chip ${currentPlayerIndex === 0 ? 'active' : ''}`}>
              <strong>Player 1</strong>
              <span>: {playerOneScore}</span>
            </div>
            <div className={`dig-player-chip ${currentPlayerIndex === 1 ? 'active' : ''}`}>
              <strong>Player 2</strong>
              <span>: {playerTwoScore}</span>
            </div>
            <div className="dig-player-turn">{playerTurnLabel} to play</div>
          </div>
        )}

        {timerMode === 'challenge' && (
          <button 
            className="radar-btn-compact" 
            onClick={handleRadar}
            disabled={timeLeft <= (challengeDuration === 300 ? 30 : challengeDuration === 180 ? 20 : 10) || isLocked || !isPlaying}
          >
            <Radar size={16} /> Use radar (-{challengeDuration === 300 ? 30 : challengeDuration === 180 ? 20 : 10}s)
          </button>
        )}
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
          {isTwoPlayer && (
            <div className="footer-stat-item">
              <Users size={16} />
              <span>Score: <strong>{scoreSummary}</strong></span>
            </div>
          )}
        </div>
        
        <button className="help-btn-compact" onClick={() => setFeedback({message: "Match two identical finds to recover them. Some finds are ancient evidence; others are modern disturbance.", isError: false, tone: 'neutral'})}>
           <HelpCircle size={18} /> Field guide
        </button>
      </div>      {feedback.message && (
        <div className={`sort-feedback ${feedback.tone === 'accent' ? 'accent' : feedback.isError ? 'error' : 'neutral'}`} style={{position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 100}}>
          <span className="sort-feedback-icon" aria-hidden="true">•</span>
          <span>{feedback.message}</span>
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



