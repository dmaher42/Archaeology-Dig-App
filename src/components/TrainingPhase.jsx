import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { 
  Search, FileText, Pickaxe, MapPin, Beaker, CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const TRAINING_STAGES = [
  { id: 'survey', title: 'Survey', description: 'Observe the surface for clues before digging. Find an area of interest.', icon: Search },
  { id: 'grid', title: 'Grid', description: 'Lay down a grid to record exact locations before starting the excavation.', icon: FileText },
  { id: 'excavate', title: 'Excavate', description: 'Carefully remove soil. Use a trowel to clear dirt, and a brush for delicate finds.', icon: Pickaxe },
  { id: 'map', title: 'Map', description: 'Log the exact grid coordinate of your find to preserve its historical context.', icon: MapPin },
  { id: 'lab', title: 'Lab', description: 'Analyze the artifact to determine its identity and purpose.', icon: Beaker },
];

export function TrainingPhase({ onBackToMenu }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const [isSurveyed, setIsSurveyed] = useState(false);
  const [isGridded, setIsGridded] = useState(false);
  
  // Minesweeper state
  const [gridTiles, setGridTiles] = useState(() => {
    const tiles = Array(16).fill(null).map((_, i) => ({
      id: i,
      isRevealed: false,
      isMarked: false,
      isArtifact: i === 10, // Row 2, Col 2 (C3)
      adjacentCount: 0
    }));
    // Neighbors of 10 in 4x4 (col 0-3, row 0-3)
    // index 10 is row 2, col 2.
    const neighbors = [5, 6, 7, 9, 11, 13, 14, 15];
    neighbors.forEach(n => {
      if(tiles[n]) tiles[n].adjacentCount = 1;
    });
    return tiles;
  });
  
  const [selectedTool, setSelectedTool] = useState(null); 
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);
  const [targetIndex, setTargetIndex] = useState(null);
  const [artifactExtracted, setArtifactExtracted] = useState(false);

  const [mappedCoordinate, setMappedCoordinate] = useState(null);
  const [labHypothesis, setLabHypothesis] = useState(null);
  
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('info'); // info, success, error
  const phaseRef = useRef(null);
  const didCelebrateRef = useRef(false);

  const currentStage = TRAINING_STAGES[currentStepIndex];
  const isComplete = currentStepIndex === 5; 

  useEffect(() => {
    if (isComplete && !didCelebrateRef.current) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      didCelebrateRef.current = true;
    }
  }, [isComplete]);

  useLayoutEffect(() => {
    const phase = phaseRef.current;
    if (!phase) return;
    phase.scrollIntoView({ block: 'start', inline: 'nearest' });
  }, []);

  const handleNextStep = () => {
    setFeedback('');
    setFeedbackType('info');
    setCurrentStepIndex(prev => prev + 1);
  };

  const handleTileClick = (index, e) => {
    if (e && e.type === 'contextmenu') e.preventDefault();
    if (currentStepIndex !== 2) return;
    if (showConfidenceModal || artifactExtracted) return;

    const tile = gridTiles[index];
    
    // Right click always toggles marker
    if (e && (e.type === 'contextmenu' || e.button === 2)) {
      if (tile.isRevealed) return;
      setGridTiles(prev => {
        const next = [...prev];
        next[index] = { ...next[index], isMarked: !next[index].isMarked };
        return next;
      });
      return;
    }
    
    if (tile.isRevealed) return;

    if (!selectedTool) {
      setFeedback('Select a tool first! Trowel clears dirt, Marker flags it, Brush extracts it.');
      setFeedbackType('error');
      return;
    }

    if (selectedTool === 'marker') {
      setGridTiles(prev => {
        const next = [...prev];
        next[index] = { ...next[index], isMarked: !next[index].isMarked };
        return next;
      });
      return;
    }
    
    if (tile.isMarked && selectedTool !== 'brush') {
      setFeedback('Remove marker before troweling, or use the brush to extract!');
      setFeedbackType('error');
      return;
    }
    
    if (selectedTool === 'brush') {
      if (!tile.isMarked) {
        setFeedback('You must mark the square with a Survey Marker before extracting!');
        setFeedbackType('error');
        return;
      }
      setTargetIndex(index);
      setShowConfidenceModal(true);
      return;
    }

    if (selectedTool === 'trowel') {
      if (tile.isArtifact) {
        setFeedback('Oh no! You used a trowel on the artifact and damaged it! Site reset.');
        setFeedbackType('error');
        // Reset
        setGridTiles(prev => prev.map(t => ({ ...t, isRevealed: false, isMarked: false })));
      } else {
        setFeedback('Cleared dirt. The number shows how many artifacts are adjacent!');
        setFeedbackType('info');
        setGridTiles(prev => {
          const next = [...prev];
          next[index] = { ...next[index], isRevealed: true };
          return next;
        });
      }
    }
  };

  const handleConfidenceSubmit = (level) => {
    setShowConfidenceModal(false);
    const tile = gridTiles[targetIndex];
    if (tile.isArtifact) {
      setFeedback(`${level.toUpperCase()} CONFIDENCE! Excellent deduction. Artifact safely extracted.`);
      setFeedbackType('success');
      setGridTiles(prev => {
        const next = [...prev];
        next[targetIndex] = { ...next[targetIndex], isRevealed: true };
        return next;
      });
      setArtifactExtracted(true);
    } else {
      setFeedback('You brushed empty dirt! You need to deduce better using the numbers. Site reset.');
      setFeedbackType('error');
      setGridTiles(prev => prev.map(t => ({ ...t, isRevealed: false, isMarked: false })));
    }
    setTargetIndex(null);
  };

  const getGridLabel = (index) => {
    const cols = ['1', '2', '3', '4'];
    const rows = ['A', 'B', 'C', 'D'];
    const r = Math.floor(index / 4);
    const c = index % 4;
    return rows[r] + cols[c];
  };

  const renderDirtPatch = () => {
    return (
      <div 
        style={{ 
          position: 'relative', 
          width: '320px', 
          height: '320px', 
          backgroundColor: '#8B6A48', 
          backgroundImage: 'radial-gradient(circle, #8B6A48 0%, #5C4033 100%)',
          margin: '0 auto', 
          borderRadius: '8px', 
          overflow: 'hidden', 
          border: '4px solid #4a3322', 
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
          cursor: currentStepIndex === 0 && !isSurveyed ? 'crosshair' : 'default',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
        }}
        onClick={() => {
          if (currentStepIndex === 0 && !isSurveyed) {
            setIsSurveyed(true);
            setFeedback('You noticed a slight depression and color change in the soil in the C3 area. Good eye!');
            setFeedbackType('success');
          }
        }}
      >
        {/* The Grid Overlay */}
        {(isGridded || currentStepIndex > 1) && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', pointerEvents: 'none', zIndex: 10 }}>
            {Array(16).fill(0).map((_, i) => (
              <div key={i} style={{ 
                borderRight: (i % 4 !== 3) ? '2px solid rgba(255,255,255,0.4)' : 'none', 
                borderBottom: (Math.floor(i / 4) !== 3) ? '2px solid rgba(255,255,255,0.4)' : 'none', 
                display: 'flex', 
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                padding: '4px',
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '0.8rem', 
                fontWeight: 'bold',
                textShadow: '0px 0px 2px #000'
              }}>
                {getGridLabel(i)}
              </div>
            ))}
          </div>
        )}

        {/* Minesweeper Tiles */}
        {(currentStepIndex >= 2) && gridTiles.map((tile, index) => (
          <div 
            key={tile.id}
            onClick={(e) => handleTileClick(index, e)}
            onContextMenu={(e) => handleTileClick(index, e)}
            style={{
              position: 'relative',
              zIndex: 5,
              backgroundColor: tile.isRevealed 
                ? (tile.isArtifact ? '#D4AF37' : '#d2b48c') 
                : 'rgba(102, 70, 44, 0.95)',
              borderRight: '1px solid rgba(0,0,0,0.3)',
              borderBottom: '1px solid rgba(0,0,0,0.3)',
              cursor: tile.isRevealed ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: tile.isRevealed ? 'inset 0 0 10px rgba(0,0,0,0.2)' : 'inset 0 0 5px rgba(255,255,255,0.1)',
            }}
          >
            {tile.isMarked && !tile.isRevealed && (
               <div style={{color: '#ff4444', fontSize: '1.5rem', zIndex: 10, textShadow: '0px 0px 4px #000'}}>🚩</div>
            )}
            {tile.isRevealed && !tile.isArtifact && tile.adjacentCount > 0 && (
               <div style={{ fontSize: '1.5rem', color: '#5C4033', fontWeight: 'bold' }}>{tile.adjacentCount}</div>
            )}
            {tile.isRevealed && tile.isArtifact && (
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <circle cx="12" cy="12" r="10"></circle>
                 <path d="M12 6v6l4 2"></path>
               </svg>
            )}
          </div>
        ))}
        
        {/* Fill the background if not in Minesweeper mode yet */}
        {currentStepIndex < 2 && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}></div>
        )}
      </div>
    );
  };

  const renderCurrentStepControls = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <p style={{ margin: 0 }}>Click on the site area to perform a visual survey.</p>
            {isSurveyed && <button className="btn pulse-glow" onClick={handleNextStep}>Proceed to Grid</button>}
          </div>
        );
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <p style={{ margin: 0 }}>Without a grid, we lose the context of where things are found.</p>
            {!isGridded ? (
               <button className="btn" onClick={() => { setIsGridded(true); setFeedback('Grid laid out! Now we can accurately map our finds.'); setFeedbackType('success'); }}>Lay Grid Overlay</button>
            ) : (
               <button className="btn pulse-glow" onClick={handleNextStep}>Proceed to Excavate</button>
            )}
          </div>
        );
      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <p style={{ margin: 0 }}>Deduce the artifact's location! Trowel clears dirt, revealing adjacent counts. Marker flags the artifact.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className={`btn ${selectedTool === 'trowel' ? '' : 'btn-secondary'}`} 
                onClick={() => setSelectedTool('trowel')}
                style={{ opacity: selectedTool === 'trowel' ? 1 : 0.7 }}
              >
                Hand Trowel
              </button>
              <button 
                className={`btn ${selectedTool === 'marker' ? '' : 'btn-secondary'}`} 
                onClick={() => setSelectedTool('marker')}
                style={{ opacity: selectedTool === 'marker' ? 1 : 0.7 }}
              >
                Survey Marker
              </button>
              <button 
                className={`btn ${selectedTool === 'brush' ? '' : 'btn-secondary'}`} 
                onClick={() => setSelectedTool('brush')}
                style={{ opacity: selectedTool === 'brush' ? 1 : 0.7 }}
              >
                Soft Brush
              </button>
            </div>
            {artifactExtracted && <button className="btn pulse-glow" onClick={handleNextStep}>Proceed to Map</button>}
          </div>
        );
      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <p style={{ margin: 0 }}>In which grid square did you extract the artifact?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '200px' }}>
              {['A2', 'B3', 'C3', 'D1'].map(sq => (
                <button 
                  key={sq} 
                  className={`btn ${mappedCoordinate === sq ? '' : 'btn-secondary'}`} 
                  onClick={() => {
                    setMappedCoordinate(sq);
                    if (sq === 'C3') {
                      setFeedback('Correct! The artifact was found in C3. We have preserved its context.');
                      setFeedbackType('success');
                    } else {
                      setFeedback('Look closely at the grid overlay. The artifact is not in ' + sq + '.');
                      setFeedbackType('error');
                    }
                  }}
                >
                  {sq}
                </button>
              ))}
            </div>
            {mappedCoordinate === 'C3' && <button className="btn pulse-glow" onClick={handleNextStep}>Proceed to Lab</button>}
          </div>
        );
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <p style={{ margin: 0 }}>What kind of artifact have we uncovered?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              {['A piece of rough pottery', 'An ancient golden sun disc', 'A rusted iron tool'].map(hyp => (
                <button 
                  key={hyp} 
                  className={`btn ${labHypothesis === hyp ? '' : 'btn-secondary'}`} 
                  onClick={() => {
                    setLabHypothesis(hyp);
                    if (hyp === 'An ancient golden sun disc') {
                      setFeedback('Spot on! The shiny, golden material and shape suggest a ceremonial sun disc.');
                      setFeedbackType('success');
                    } else {
                      setFeedback('Not quite. Consider the shiny, golden material and round shape.');
                      setFeedbackType('error');
                    }
                  }}
                >
                  {hyp}
                </button>
              ))}
            </div>
            {labHypothesis === 'An ancient golden sun disc' && <button className="btn pulse-glow" onClick={handleNextStep}>Complete Certification</button>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section ref={phaseRef} className="phase-container training-phase">
      
      {showConfidenceModal && (
        <div className="modal-overlay" style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-content glass-card warning-modal" style={{ maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <h2 className="modal-title" style={{color: 'var(--bureau-gold)', marginBottom: '1rem'}}>Confidence Check</h2>
            <p style={{marginBottom: '2rem', color: 'var(--sand-100)'}}>
              How confident are you that the artifact is here based on the adjacent numbers?
            </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <button className="btn primary-btn" onClick={() => handleConfidenceSubmit('high')}>High Confidence (I deduced it)</button>
              <button className="btn secondary-btn" onClick={() => handleConfidenceSubmit('medium')}>Medium Confidence (Highly likely)</button>
              <button className="btn secondary-btn" onClick={() => handleConfidenceSubmit('low')}>Low Confidence (I am guessing)</button>
            </div>
          </div>
        </div>
      )}

      <div className="training-hero vintage-panel">
        <div className="training-hero-copy">
          <h2>Antiquities Bureau: Field Certification</h2>
        </div>
        <div className="training-hero-actions">
          <button className="btn training-back-btn" type="button" onClick={onBackToMenu}>Back to menu</button>
        </div>
      </div>

      <div className="training-layout" style={{ marginTop: '1.5rem' }}>
        {isComplete ? (
          <div className="training-success-panel vintage-panel animate-fade-in" style={{ gridColumn: '1 / -1' }}>
            <div className="training-success-header">
              <span className="training-panel-kicker success-text">✓ Certification Complete</span>
              <h3>Ready for the Field!</h3>
            </div>
            <div className="training-success-body">
              <p className="success-intro">Great work, recruit! You have mastered the scientific sequence of an archaeological investigation, as well as deductive excavation techniques.</p>
              <div className="reflection-box" style={{ background: 'rgba(139,106,72,0.1)', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
                <span className="reflection-label" style={{ fontWeight: 'bold' }}>Metacognition Reflection Check:</span>
                <p className="reflection-question">Why must we pause to consider our confidence level before using the Soft Brush?</p>
                <div className="reflection-prompt">
                  <em>"Mindless guessing destroys history. Validating our deductions ensures we protect fragile evidence."</em>
                </div>
              </div>
            </div>
            <div className="training-success-footer" style={{ marginTop: '2rem' }}>
              <button className="btn training-back-btn pulse-glow" type="button" onClick={onBackToMenu}>
                Begin Your First Expedition
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="training-board vintage-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              <div className="training-board-header" style={{ width: '100%', textAlign: 'left' }}>
                <span className="training-panel-kicker">Step {currentStepIndex + 1} of 5</span>
                <h3 style={{ margin: '0.2rem 0' }}>{currentStage.title}</h3>
                <p style={{ color: 'var(--sand-300)', margin: '0.5rem 0 0 0' }}>{currentStage.description}</p>
              </div>
              
              <div className="sim-container" style={{ margin: '1rem 0' }}>
                {renderDirtPatch()}
              </div>

              <div style={{ height: '4rem', display: 'flex', alignItems: 'center', width: '100%' }}>
                {feedback && (
                  <div className={`feedback-banner ${feedbackType}`} style={{ 
                    width: '100%',
                    background: feedbackType === 'success' ? 'rgba(74, 222, 128, 0.15)' : feedbackType === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(212, 175, 55, 0.15)', 
                    border: '1px solid',
                    borderColor: feedbackType === 'success' ? '#4ade80' : feedbackType === 'error' ? '#ef4444' : '#D4AF37', 
                    padding: '0.75rem', 
                    borderRadius: '4px', 
                    color: 'var(--bureau-ink)', 
                    textAlign: 'center'
                  }}>
                    {feedback}
                  </div>
                )}
              </div>

              <div className="controls-container" style={{ width: '100%' }}>
                {renderCurrentStepControls()}
              </div>
            </div>

            <div className="training-sidebar vintage-panel">
              <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--bureau-ink)' }}>Certification Steps</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {TRAINING_STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isActive = idx === currentStepIndex;
                  const isDone = idx < currentStepIndex;
                  
                  return (
                    <li key={stage.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem', 
                      opacity: isActive || isDone ? 1 : 0.5,
                      padding: '0.5rem',
                      background: isActive ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                      borderRadius: '6px',
                      border: isActive ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid transparent'
                    }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: isDone ? '#2D5A27' : isActive ? 'var(--bureau-gold)' : 'rgba(0,0,0,0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: isDone ? 'white' : isActive ? '#fff' : 'var(--bureau-ink-muted)', 
                        flexShrink: 0
                      }}>
                        {isDone ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: isActive ? 'bold' : 'normal', color: 'var(--bureau-ink)' }}>
                          {stage.title}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
