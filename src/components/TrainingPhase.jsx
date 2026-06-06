import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  Search, FileText, Pickaxe, MapPin, Beaker, CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  createDefaultTrainingGridTiles,
  createTrainingGridTiles,
  getTrainingDifficulty,
  getTrainingSurveyScore,
  getTrainingSurveyZone,
  normalizeTrainingState,
  TRAINING_DIFFICULTIES,
  TRAINING_SURVEY_ZONES,
} from '../utils/gameLogic';

const TRAINING_STAGES = [
  { id: 'survey', title: 'Survey', description: 'Observe the surface before digging and identify a promising area.', icon: Search },
  { id: 'grid', title: 'Grid', description: 'Lay a grid so the find can be recorded in its exact location.', icon: FileText },
  { id: 'excavate', title: 'Excavate', description: 'Use clues, markers, and careful tools to recover the find without damage.', icon: Pickaxe },
  { id: 'map', title: 'Map', description: 'Record the grid coordinate so the find keeps its archaeological context.', icon: MapPin },
  { id: 'lab', title: 'Lab', description: 'Analyze the artifact and choose the strongest historical interpretation.', icon: Beaker },
];

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAP_RECORD_CHOICES = [
  'Only the first find was written down',
  'All recovered finds were plotted by grid coordinate',
  'The team kept the finds but skipped the grid log',
  'Only disturbed squares were recorded',
];
const CORRECT_MAP_RECORD = MAP_RECORD_CHOICES[1];
const LAB_HYPOTHESIS_CHOICES = [
  'A loose scatter with no useful context',
  'A documented artifact scatter',
  'A modern disturbance layer',
];
const CORRECT_LAB_HYPOTHESIS = LAB_HYPOTHESIS_CHOICES[1];

export function TrainingPhase({
  initialTrainingState,
  onTrainingStateChange,
  onBackToMenu,
  onBeginExpedition,
}) {
  const getInitialTrainingState = () => normalizeTrainingState(initialTrainingState);

  const [currentStepIndex, setCurrentStepIndex] = useState(() => getInitialTrainingState().currentStepIndex);
  const [difficultyId, setDifficultyId] = useState(() => getInitialTrainingState().difficultyId);
  const [isSurveyed, setIsSurveyed] = useState(() => getInitialTrainingState().isSurveyed);
  const [isGridded, setIsGridded] = useState(() => getInitialTrainingState().isGridded);
  const [inspectedSurveyZoneIds, setInspectedSurveyZoneIds] = useState(() => getInitialTrainingState().inspectedSurveyZoneIds);
  const [selectedSurveyZoneId, setSelectedSurveyZoneId] = useState(() => getInitialTrainingState().selectedSurveyZoneId);
  const [focusedSurveyZoneId, setFocusedSurveyZoneId] = useState(() => getInitialTrainingState().selectedSurveyZoneId);
  const [surveyQuality, setSurveyQuality] = useState(() => getInitialTrainingState().surveyQuality);
  const [gridAccuracy, setGridAccuracy] = useState(() => getInitialTrainingState().gridAccuracy);
  const [gridTiles, setGridTiles] = useState(() => getInitialTrainingState().gridTiles || createDefaultTrainingGridTiles());
  const [selectedTool, setSelectedTool] = useState(null);
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);
  const [targetIndex, setTargetIndex] = useState(null);
  const [artifactExtracted, setArtifactExtracted] = useState(() => getInitialTrainingState().artifactExtracted);
  const [mappedCoordinate, setMappedCoordinate] = useState(() => getInitialTrainingState().mappedCoordinate);
  const [labHypothesis, setLabHypothesis] = useState(() => getInitialTrainingState().labHypothesis);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('info');
  const [disturbanceCount, setDisturbanceCount] = useState(0);

  const phaseRef = useRef(null);
  const didCelebrateRef = useRef(false);

  const boardDifficulty = getTrainingDifficulty(difficultyId);
  const boardTileCount = boardDifficulty.cols * boardDifficulty.rows;
  const totalArtifacts = boardDifficulty.artifactCount;
  const extractedArtifactsCount = gridTiles.filter(item => item.isArtifact && item.isRevealed).length;
  const remainingArtifactsCount = Math.max(totalArtifacts - extractedArtifactsCount, 0);
  const requiredCluesBeforeBrush = Math.min(8, Math.max(2, Math.ceil(totalArtifacts / 12)));
  const currentStage = TRAINING_STAGES[currentStepIndex] || TRAINING_STAGES[TRAINING_STAGES.length - 1];
  const isComplete = currentStepIndex === TRAINING_STAGES.length;
  const revealedCluesCount = gridTiles.filter(item => item.isRevealed && !item.isArtifact).length;
  const markedTilesCount = gridTiles.filter(item => item.isMarked && !item.isRevealed).length;
  const hasExcavationProgress = revealedCluesCount > 0 || markedTilesCount > 0;
  const selectedSurveyZone = getTrainingSurveyZone(selectedSurveyZoneId);
  const focusedSurveyZone = getTrainingSurveyZone(focusedSurveyZoneId) || selectedSurveyZone;
  const isFocusedZoneInspected = focusedSurveyZone ? inspectedSurveyZoneIds.includes(focusedSurveyZone.id) : false;

  useEffect(() => {
    onTrainingStateChange?.({
      currentStepIndex,
      difficultyId,
      isSurveyed,
      isGridded,
      inspectedSurveyZoneIds,
      selectedSurveyZoneId,
      surveyQuality,
      gridAccuracy,
      gridTiles,
      artifactExtracted,
      mappedCoordinate,
      labHypothesis,
    });
  }, [
    artifactExtracted,
    currentStepIndex,
    difficultyId,
    gridAccuracy,
    gridTiles,
    inspectedSurveyZoneIds,
    isGridded,
    isSurveyed,
    labHypothesis,
    mappedCoordinate,
    onTrainingStateChange,
    selectedSurveyZoneId,
    surveyQuality,
  ]);

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

  const setTrainingFeedback = (message, type = 'info') => {
    setFeedback(message);
    setFeedbackType(type);
  };

  const handleSurveyZoneInspect = (zoneId) => {
    if (currentStepIndex !== 0) return;
    const zone = getTrainingSurveyZone(zoneId);
    if (!zone) return;

    setInspectedSurveyZoneIds(prev => (
      prev.includes(zoneId) ? prev : [...prev, zoneId]
    ));
    setFocusedSurveyZoneId(zoneId);
    setTrainingFeedback(`${zone.title}: ${zone.clue}`, 'info');
  };

  const handleSurveyZoneSelect = (zoneId) => {
    if (currentStepIndex !== 0) return;
    const zone = getTrainingSurveyZone(zoneId);
    if (!zone) return;

    const nextInspectedIds = inspectedSurveyZoneIds.includes(zoneId)
      ? inspectedSurveyZoneIds
      : [...inspectedSurveyZoneIds, zoneId];
    const nextSurveyQuality = getTrainingSurveyScore({
      inspectedZoneIds: nextInspectedIds,
      selectedSurveyZoneId: zoneId,
    });

    setInspectedSurveyZoneIds(nextInspectedIds);
    setSelectedSurveyZoneId(zoneId);
    setFocusedSurveyZoneId(zoneId);
    setSurveyQuality(nextSurveyQuality);
    setIsSurveyed(true);
    setIsGridded(false);
    setGridAccuracy(null);
    setGridTiles(createTrainingGridTiles(difficultyId, { selectedSurveyZoneId: zoneId }));
    setSelectedTool(null);
    setShowConfidenceModal(false);
    setTargetIndex(null);
    setArtifactExtracted(false);
    setMappedCoordinate(null);
    setLabHypothesis(null);
    setDisturbanceCount(0);
    setTrainingFeedback(`${zone.title} selected. Survey quality ${nextSurveyQuality}/100. The next step will narrow the field into a focused grid.`, 'success');
  };

  const handleDifficultySelect = (nextDifficultyId) => {
    const nextDifficulty = getTrainingDifficulty(nextDifficultyId);
    setDifficultyId(nextDifficulty.id);
    setCurrentStepIndex(0);
    setIsSurveyed(false);
    setIsGridded(false);
    setInspectedSurveyZoneIds([]);
    setSelectedSurveyZoneId(null);
    setFocusedSurveyZoneId(null);
    setSurveyQuality(0);
    setGridAccuracy(null);
    setGridTiles(createTrainingGridTiles(nextDifficulty.id));
    setSelectedTool(null);
    setShowConfidenceModal(false);
    setTargetIndex(null);
    setArtifactExtracted(false);
    setMappedCoordinate(null);
    setLabHypothesis(null);
    setDisturbanceCount(0);
    setTrainingFeedback(`${nextDifficulty.label} selected: ${nextDifficulty.summary}.`, 'info');
  };

  const resetExcavationGrid = () => {
    setGridTiles(prev => prev.map(tile => ({ ...tile, isRevealed: false, isMarked: false })));
    setSelectedTool(null);
  };

  const handlePracticeReset = () => {
    resetExcavationGrid();
    setArtifactExtracted(false);
    setTargetIndex(null);
    setDisturbanceCount(0);
    setTrainingFeedback('Practice grid reset. Use the survey clue, then test safe-looking squares before brushing.', 'info');
  };

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    if (tool === 'trowel') {
      setTrainingFeedback('Trowel selected. Test soil squares around the surface change and read the numbers.', 'info');
    } else if (tool === 'marker') {
      setTrainingFeedback('Marker selected. Flag the square your evidence points toward.', 'info');
    } else if (tool === 'brush') {
      setTrainingFeedback('Soft Brush selected. Use it only on a marked square when your evidence is strong.', 'info');
    }
  };

  const handleNextStep = () => {
    setTrainingFeedback('');
    setCurrentStepIndex(prev => prev + 1);
  };

  const handleTileClick = (index, event) => {
    if (event?.type === 'contextmenu') event.preventDefault();
    if (currentStepIndex !== 2 || showConfidenceModal || artifactExtracted) return;

    const tile = gridTiles[index];

    if (event?.type === 'contextmenu' || event?.button === 2) {
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
      setTrainingFeedback('Choose a tool first. Use the trowel to test soil, mark your best inference, then brush only when confident.', 'error');
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
      setTrainingFeedback('That square is marked. Remove the marker first, or use the Soft Brush to extract it.', 'error');
      return;
    }

    if (selectedTool === 'brush') {
      if (revealedCluesCount < requiredCluesBeforeBrush) {
        setTrainingFeedback(`Gather more evidence first. Trowel at least ${requiredCluesBeforeBrush} soil squares before brushing.`, 'error');
        return;
      }
      if (!tile.isMarked) {
        setTrainingFeedback('Mark the suspected square before using the Soft Brush.', 'error');
        return;
      }
      setTargetIndex(index);
      setShowConfidenceModal(true);
      return;
    }

    if (selectedTool === 'trowel') {
      if (tile.isArtifact) {
        setDisturbanceCount(prev => prev + 1);
        setTrainingFeedback('Careful. A trowel scrape would damage a fragile find. The practice grid has reset so you can reassess the evidence.', 'error');
        resetExcavationGrid();
        return;
      }

      setTrainingFeedback('Soil layer cleared. The number shows how many artifact squares touch that tile.', 'info');
      setGridTiles(prev => {
        const next = [...prev];
        next[index] = { ...next[index], isRevealed: true };
        return next;
      });
    }
  };

  const handleConfidenceSubmit = (level) => {
    setShowConfidenceModal(false);
    const tile = gridTiles[targetIndex];

    if (tile?.isArtifact) {
      const nextExtractedCount = extractedArtifactsCount + (tile.isRevealed ? 0 : 1);
      const isExcavationComplete = nextExtractedCount >= totalArtifacts;
      setTrainingFeedback(
        isExcavationComplete
          ? `${level.toUpperCase()} CONFIDENCE. Final find recovered. Excavation complete.`
          : `${level.toUpperCase()} CONFIDENCE. Find ${nextExtractedCount} of ${totalArtifacts} safely recovered.`,
        'success',
      );
      setGridTiles(prev => {
        const next = [...prev];
        next[targetIndex] = { ...next[targetIndex], isRevealed: true };
        return next;
      });
      setArtifactExtracted(isExcavationComplete);
    } else {
      setDisturbanceCount(prev => prev + 1);
      setTrainingFeedback('That square was empty dirt. Recheck the numbers and the survey clue, then try again.', 'error');
      resetExcavationGrid();
    }

    setTargetIndex(null);
  };

  const getGridLabel = (index) => {
    const row = Math.floor(index / boardDifficulty.cols);
    const col = index % boardDifficulty.cols;
    return `${ROW_LABELS[row] || row + 1}${col + 1}`;
  };

  const getOverlayLabel = (index) => {
    const row = Math.floor(index / boardDifficulty.cols);
    const col = index % boardDifficulty.cols;
    if (row === 0) return col + 1;
    if (col === 0) return ROW_LABELS[row] || row + 1;
    return '';
  };

  const renderExcavationToolDock = () => (
    <div className="training-tool-dock" aria-label="Excavation tools">
      <button
        type="button"
        className={`training-dock-tool ${selectedTool === 'trowel' ? 'active' : ''}`}
        onClick={() => handleToolSelect('trowel')}
      >
        <Pickaxe size={24} />
        <span>Trowel</span>
      </button>
      <button
        type="button"
        className={`training-dock-tool ${selectedTool === 'marker' ? 'active' : ''}`}
        onClick={() => handleToolSelect('marker')}
      >
        <MapPin size={24} />
        <span>Marker</span>
      </button>
      <button
        type="button"
        className={`training-dock-tool ${selectedTool === 'brush' ? 'active' : ''}`}
        onClick={() => handleToolSelect('brush')}
      >
        <Search size={24} />
        <span>Brush</span>
      </button>
    </div>
  );

  const renderCompactCertificationSteps = () => (
    <ol className="training-compact-steps" aria-label="Certification progress">
      {TRAINING_STAGES.map((stage, index) => {
        const Icon = stage.icon;
        const stateClass = index < currentStepIndex ? 'done' : index === currentStepIndex ? 'active' : '';

        return (
          <li key={stage.id} className={stateClass}>
            <Icon size={16} />
            <span>{stage.title}</span>
          </li>
        );
      })}
    </ol>
  );

  const renderPremiumExcavationScreen = () => {
    const confidencePercent = Math.min(100, Math.round((revealedCluesCount / requiredCluesBeforeBrush) * 100));
    const riskPercent = Math.min(100, disturbanceCount * 25);
    const currentInstruction = artifactExtracted
      ? 'Find recovered. Record the excavation context in the field log.'
      : revealedCluesCount < requiredCluesBeforeBrush
        ? `Trowel ${requiredCluesBeforeBrush} safe-looking soil squares before brushing.`
        : markedTilesCount === 0
          ? 'Use the numbers to mark the square your evidence points toward.'
          : `Brush marked squares when confident. ${remainingArtifactsCount} finds remain.`;

    return (
      <div className="training-excavation-tabletop">
        <header className="training-premium-topbar">
          <div className="training-topbar-seal" aria-hidden="true">
            <Pickaxe size={22} />
          </div>
          <div className="training-topbar-title">
            <span>Step {currentStepIndex + 1} of 5</span>
            <strong>{currentStage.title}</strong>
          </div>
          <p>{currentStage.description}</p>
          <div className="training-topbar-stat">
            <span>Finds</span>
            <strong>{`${extractedArtifactsCount}/${totalArtifacts}`}</strong>
          </div>
          <div className="training-topbar-stat">
            <span>Risk</span>
            <strong>{`${riskPercent}%`}</strong>
          </div>
          <div className="training-topbar-stat training-topbar-confidence">
            <span>Confidence</span>
            <strong>{`${confidencePercent}%`}</strong>
            <div className="training-confidence-track" aria-hidden="true">
              <i style={{ width: `${confidencePercent}%` }} />
            </div>
          </div>
          <div className="training-topbar-certification">
            <span>Certification</span>
            {renderCompactCertificationSteps()}
          </div>
          <button className="btn training-premium-back-btn" type="button" onClick={onBackToMenu}>Menu</button>
        </header>

        <div className="training-premium-playfield">
          <div className="training-table-prop training-table-prop--sample" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <main className="training-premium-board-zone">
            <div className="training-premium-board-frame">
              {renderDirtPatch()}
            </div>
            <div className={`training-premium-field-log ${feedbackType}`}>
              <strong>Field Log</strong>
              <span>09:42</span>
              <p>{feedback || currentInstruction}</p>
              {!artifactExtracted && (hasExcavationProgress || disturbanceCount > 0) && (
                <button className="btn btn-secondary training-reset-btn" type="button" onClick={handlePracticeReset}>
                  Retry
                </button>
              )}
              {artifactExtracted && (
                <button className="btn pulse-glow" type="button" onClick={handleNextStep}>
                  Map
                </button>
              )}
            </div>
          </main>
          <aside className="training-premium-tools-panel">
            <h4>Tools</h4>
            {renderExcavationToolDock()}
          </aside>
          <div className="training-table-prop training-table-prop--compass" aria-hidden="true" />
          <div className="training-table-prop training-table-prop--logbook" aria-hidden="true">
            <span>Field Log</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSurveyMap = () => (
    <div className="training-site-stage training-site-stage--survey-map vintage-panel">
      <div className="training-survey-map-bg" aria-hidden="true" />
      <div className="training-survey-map-legend">Field Survey — tap a marker to read its clue</div>
      {TRAINING_SURVEY_ZONES.map((zone, index) => {
        const isInspected = inspectedSurveyZoneIds.includes(zone.id);
        const isFocused = focusedSurveyZoneId === zone.id;
        const isSelected = selectedSurveyZoneId === zone.id;

        return (
          <button
            key={zone.id}
            type="button"
            className={`training-survey-pin zone-${zone.id} ${isInspected ? 'inspected' : ''} ${isFocused ? 'focused' : ''} ${isSelected ? 'selected' : ''}`}
            onClick={() => handleSurveyZoneInspect(zone.id)}
            aria-pressed={isSelected}
          >
            <span className="training-survey-pin-num">{isSelected ? '✓' : index + 1}</span>
            <span className="training-survey-pin-label">
              <strong>{zone.title}</strong>
              <em>{zone.terrain}</em>
            </span>
            {isInspected && isFocused && (
              <span className="training-survey-pin-clue">{zone.clue}</span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderDirtPatch = () => {
    if (currentStepIndex === 0) return renderSurveyMap();

    return (
    <div
      className={`training-site-stage vintage-panel board-${boardDifficulty.id} ${boardDifficulty.cols >= 16 ? 'large-board' : ''} ${boardDifficulty.cols > boardDifficulty.rows ? 'wide-board' : ''} ${currentStepIndex === 0 && !isSurveyed ? 'is-surveyable' : ''}`}
      style={{
        '--training-cols': boardDifficulty.cols,
        '--training-rows': boardDifficulty.rows,
      }}
    >
      {(isGridded || currentStepIndex > 1) && (
        <div className="training-grid-overlay">
          {Array.from({ length: boardTileCount }, (_, index) => (
            <div key={index}>{getOverlayLabel(index)}</div>
          ))}
        </div>
      )}

      {isSurveyed && currentStepIndex < 2 && (
        <div className="training-survey-clue" aria-hidden="true">
          {selectedSurveyZone?.title || 'Surface change'}
        </div>
      )}

      {currentStepIndex >= 2 && gridTiles.map((tile, index) => (
        <button
          type="button"
          key={tile.id}
          onClick={(event) => handleTileClick(index, event)}
          onContextMenu={(event) => handleTileClick(index, event)}
          className={`training-mine-tile ${tile.isRevealed ? 'revealed' : 'unrevealed'} ${tile.isRevealed && tile.isArtifact ? 'artifact' : ''} ${tile.isStarterProbe ? 'starter-probe' : ''}`}
          aria-label={`${getGridLabel(index)} ${tile.isMarked ? 'marked' : 'unmarked'}`}
        >
          {tile.isMarked && !tile.isRevealed && <div className="mine-marker">F</div>}
          {tile.isRevealed && !tile.isArtifact && tile.adjacentCount > 0 && (
            <div className={`mine-number number-${tile.adjacentCount}`}>{tile.adjacentCount}</div>
          )}
          {tile.isRevealed && tile.isArtifact && (
            <svg className="mine-artifact-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
          )}
        </button>
      ))}

      {currentStepIndex < 2 && <div className="training-soil-preview" />}
    </div>
    );
  };

  const renderCurrentStepControls = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <div className="training-action-card training-survey-action">
            <h4>Current action</h4>
            <p>Tap a marker on the map to read its surface clue, then choose the area with the strongest excavation context.</p>

            <div className="training-difficulty-segment" role="group" aria-label="Training difficulty">
              {TRAINING_DIFFICULTIES.map(difficulty => (
                <button
                  key={difficulty.id}
                  type="button"
                  className={`training-difficulty-seg ${difficulty.id === difficultyId ? 'active' : ''}`}
                  onClick={() => handleDifficultySelect(difficulty.id)}
                >
                  <strong>{difficulty.label}</strong>
                  <span>{difficulty.summary}</span>
                </button>
              ))}
            </div>

            {focusedSurveyZone ? (
              <div className={`training-zone-detail ${selectedSurveyZoneId === focusedSurveyZone.id ? 'selected' : ''}`}>
                <span className="training-zone-detail-kicker">
                  {selectedSurveyZoneId === focusedSurveyZone.id ? 'Chosen area' : 'Inspecting'}
                </span>
                <strong>{focusedSurveyZone.title}</strong>
                <p className="training-zone-detail-terrain">{focusedSurveyZone.terrain}</p>
                {isFocusedZoneInspected && (
                  <p className="training-zone-detail-clue">{focusedSurveyZone.clue}</p>
                )}
                <p className="training-zone-detail-note">{focusedSurveyZone.fieldNote}</p>
                <button
                  className={`btn ${selectedSurveyZoneId === focusedSurveyZone.id ? 'btn-secondary' : 'pulse-glow'}`}
                  type="button"
                  onClick={() => handleSurveyZoneSelect(focusedSurveyZone.id)}
                >
                  {selectedSurveyZoneId === focusedSurveyZone.id ? 'Re-confirm this area' : 'Choose this area'}
                </button>
              </div>
            ) : (
              <div className="training-mini-brief">
                Survey reveals field evidence, not exact find locations. Tap at least one marker to inspect a zone.
              </div>
            )}

            {isSurveyed && (
              <button className="btn pulse-glow training-survey-zoom-btn" type="button" onClick={handleNextStep}>
                Zoom into Selected Area
              </button>
            )}
          </div>
        );
      case 1:
        return (
          <div className="training-action-card">
            <h4>Current action</h4>
            <p>
              {selectedSurveyZone
                ? `Narrowing into ${selectedSurveyZone.title}. Lay the grid before digging so the find keeps its location context.`
                : 'Lay the grid before digging so the find keeps its location context.'}
            </p>
            {!isGridded ? (
              <button
                className="btn pulse-glow"
                type="button"
                onClick={() => {
                  setIsGridded(true);
                  setTrainingFeedback(`${boardDifficulty.label} grid laid out. Use the coordinate frame before excavation begins.`, 'success');
                }}
              >
                Lay Grid Overlay
              </button>
            ) : (
              <button className="btn pulse-glow" type="button" onClick={handleNextStep}>Proceed to Excavate</button>
            )}
          </div>
        );
      case 2:
        return (
          <div className="training-action-card">
            <h4>Tool Protocol</h4>
            <ol className="training-excavation-sequence" aria-label="Excavation procedure">
              <li className={revealedCluesCount >= requiredCluesBeforeBrush ? 'done' : 'active'}>
                <span>1</span>
                <strong>Trowel clues</strong>
              </li>
              <li className={artifactExtracted || markedTilesCount > 0 ? 'done' : revealedCluesCount >= requiredCluesBeforeBrush ? 'active' : ''}>
                <span>2</span>
                <strong>Mark inference</strong>
              </li>
              <li className={artifactExtracted ? 'done' : markedTilesCount > 0 ? 'active' : ''}>
                <span>3</span>
                <strong>Brush with confidence</strong>
              </li>
            </ol>
            <div className="training-challenge-status">
              <span>Finds <strong>{`${extractedArtifactsCount}/${totalArtifacts}`}</strong></span>
              <span>Warnings <strong>{disturbanceCount}</strong></span>
              <span>Clues <strong>{`${Math.min(revealedCluesCount, requiredCluesBeforeBrush)}/${requiredCluesBeforeBrush}`}</strong></span>
            </div>
            {!artifactExtracted && (
              <div className="training-mini-brief">
                {revealedCluesCount < requiredCluesBeforeBrush
                  ? `Start by troweling ${requiredCluesBeforeBrush} safe-looking soil squares before brushing.`
                  : markedTilesCount === 0
                    ? 'Use the numbers to mark the square your evidence points toward.'
                    : `Brush marked squares when confident. ${remainingArtifactsCount} finds remain.`}
              </div>
            )}
            {!artifactExtracted && (hasExcavationProgress || disturbanceCount > 0) && (
              <button className="btn btn-secondary training-reset-btn" type="button" onClick={handlePracticeReset}>
                Retry Excavation
              </button>
            )}
            {artifactExtracted && <button className="btn pulse-glow" type="button" onClick={handleNextStep}>Proceed to Map</button>}
          </div>
        );
      case 3:
        return (
          <div className="training-action-card">
            <h4>Record the field log</h4>
            <p>Which record preserves the excavation context?</p>
            <div className="training-choice-grid">
              {MAP_RECORD_CHOICES.map(choice => (
                <button
                  key={choice}
                  type="button"
                  className={`btn ${mappedCoordinate === choice ? '' : 'btn-secondary'}`}
                  onClick={() => {
                    setMappedCoordinate(choice);
                    if (choice === CORRECT_MAP_RECORD) {
                      setTrainingFeedback('Correct. Every recovered find needs a coordinate record so the context survives.', 'success');
                    } else {
                      setTrainingFeedback('Not enough. Archaeologists need the full coordinate record, not just the objects.', 'error');
                    }
                  }}
                >
                  {choice}
                </button>
              ))}
            </div>
            {mappedCoordinate === CORRECT_MAP_RECORD && <button className="btn pulse-glow" type="button" onClick={handleNextStep}>Proceed to Lab</button>}
          </div>
        );
      case 4:
        return (
          <div className="training-action-card">
            <h4>Lab hypothesis</h4>
            <p>What did the recovered pattern show?</p>
            <div className="training-answer-stack">
              {LAB_HYPOTHESIS_CHOICES.map(hypothesis => (
                <button
                  key={hypothesis}
                  type="button"
                  className={`btn ${labHypothesis === hypothesis ? '' : 'btn-secondary'}`}
                  onClick={() => {
                    setLabHypothesis(hypothesis);
                    if (hypothesis === CORRECT_LAB_HYPOTHESIS) {
                      setTrainingFeedback('Spot on. The find pattern and coordinate log turn objects into evidence.', 'success');
                    } else {
                      setTrainingFeedback('Not quite. The important evidence is the documented pattern, not one object by itself.', 'error');
                    }
                  }}
                >
                  {hypothesis}
                </button>
              ))}
            </div>
            {labHypothesis === CORRECT_LAB_HYPOTHESIS && <button className="btn pulse-glow" type="button" onClick={handleNextStep}>Complete Certification</button>}
          </div>
        );
      default:
        return null;
    }
  };

  const renderStageList = () => (
    <div className="training-steps-card">
      <h3>Certification Steps</h3>
      <ul>
        {TRAINING_STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index === currentStepIndex;
          const isDone = index < currentStepIndex;

          return (
            <li key={stage.id} className={`${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
              <div className="training-step-icon">
                {isDone ? <CheckCircle2 size={18} /> : <Icon size={16} />}
              </div>
              <div>
                <span>{stage.title}</span>
                {(isActive || isDone) && <p>{stage.description}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <section ref={phaseRef} className="phase-container training-phase training-phase--certification">
      {showConfidenceModal && (
        <div className="modal-overlay training-confidence-overlay">
          <div className="modal-content glass-card warning-modal training-confidence-modal">
            <h2 className="modal-title">Confidence Check</h2>
            <p>
              How confident are you that the artifact is here based on the adjacent numbers and the survey clue?
            </p>
            <div className="training-answer-stack">
              <button className="btn primary-btn" type="button" onClick={() => handleConfidenceSubmit('high')}>High confidence - I deduced it</button>
              <button className="btn secondary-btn" type="button" onClick={() => handleConfidenceSubmit('medium')}>Medium confidence - highly likely</button>
              <button className="btn secondary-btn" type="button" onClick={() => handleConfidenceSubmit('low')}>Low confidence - I am guessing</button>
            </div>
          </div>
        </div>
      )}

      {currentStepIndex !== 2 && (
        <div className="training-hero vintage-panel">
          <div className="training-hero-copy">
            <h2>Antiquities Bureau: Field Certification</h2>
          </div>
          <div className="training-hero-actions">
            <button className="btn training-back-btn" type="button" onClick={onBackToMenu}>Back to menu</button>
          </div>
        </div>
      )}

      <div className="training-layout training-layout--certification">
        {isComplete ? (
          <div className="training-success-panel vintage-panel">
            <div className="training-success-header">
              <span className="training-panel-kicker success-text">Certification Complete</span>
              <h3>Ready for the Field</h3>
            </div>
            <div className="training-success-body">
              <p className="success-intro">Great work. You completed the investigation sequence by reading evidence, not guessing.</p>
              <div className="reflection-box">
                <span className="reflection-label">Reflection check</span>
                <p className="reflection-question">Why pause before using the Soft Brush?</p>
                <div className="reflection-prompt">
                  A brush is the final recovery step. Confidence matters because a wrong action can disturb evidence and erase context.
                </div>
              </div>
            </div>
            <div className="training-success-footer">
              <button className="btn btn-secondary" type="button" onClick={onBackToMenu}>
                Return to Menu
              </button>
              <button className="btn training-back-btn pulse-glow" type="button" onClick={onBeginExpedition}>
                Begin Expedition
              </button>
            </div>
          </div>
        ) : currentStepIndex === 2 ? (
          renderPremiumExcavationScreen()
        ) : (
          <>
            <div className="training-board vintage-panel training-main-panel">
              <div className="training-board-header">
                <span className="training-panel-kicker">Step {currentStepIndex + 1} of 5</span>
                <h3>{currentStage.title}</h3>
                <p>{currentStage.description}</p>
              </div>

              <div className="sim-container">
                {renderDirtPatch()}
              </div>

              <div className="training-feedback-slot">
                <div className={`feedback-banner ${feedbackType} ${feedback ? 'visible' : ''}`}>
                  {feedback || 'Follow the current action panel to continue the certification.'}
                </div>
              </div>
            </div>

            <div className="training-sidebar vintage-panel">
              {renderCurrentStepControls()}
              {renderStageList()}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
