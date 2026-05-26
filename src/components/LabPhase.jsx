import { useState, useMemo } from 'react';
import { 
  Search, CheckCircle2, ScrollText, ChevronRight
} from 'lucide-react';
import { 
  getArtifactTheme, 
  getCategoryTitle, 
  getArtifactEraLabel,
  getEvidenceImagePath,
  shuffleArrayWithSeed,
  getObservableLabResult,
  getLabAnswerFeedback,
  getLabFocusFeedback,
  LAB_ANALYSIS_PROMPTS
} from '../utils/gameLogic';
import { getPromptIcon } from './Icons';

const formatConditionLabel = (condition) => {
  if (!condition) return '';
  return condition.charAt(0).toUpperCase() + condition.slice(1);
};

export function LabPhase({ activeArtifacts, itemsLocation, hypotheses, setHypotheses, currentScenario, evidenceConditions = {}, onComplete, onBackToMenu }) {
  const currentScenarioData = currentScenario;
  const trayItems = useMemo(() => {
    const sortedItems = activeArtifacts.filter(item => itemsLocation[item.id] && itemsLocation[item.id] !== 'inventory');
    return sortedItems.length > 0 ? sortedItems : activeArtifacts;
  }, [activeArtifacts, itemsLocation]);

  const [selectedArtifactId, setSelectedArtifactId] = useState(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [selectedPromptId, setSelectedPromptId] = useState(null);

  const requiredCount = 3;
  const analysedEntries = Object.entries(hypotheses);
  const analysedCount = analysedEntries.length;
  const progressPercent = Math.min(100, (analysedCount / requiredCount) * 100);
  const isComplete = analysedCount >= requiredCount;
  const selectedArtifact = trayItems.find(item => item.id === selectedArtifactId) || null;
  const selectedPrompt = LAB_ANALYSIS_PROMPTS.find(prompt => prompt.id === selectedPromptId) || null;
  const answerFeedback = selectedArtifact ? getLabAnswerFeedback(selectedArtifact, selectedAnswerIndex) : null;
  const focusFeedback = selectedArtifact ? getLabFocusFeedback(selectedArtifact, selectedPromptId) : null;
  
  const answerChoices = useMemo(() => {
    if (!selectedArtifact) return [];
    return shuffleArrayWithSeed(
      (selectedArtifact.options ?? []).map((text, originalIndex) => ({ text, originalIndex })),
      selectedArtifact.id,
    );
  }, [selectedArtifact]);

  const selectArtifact = (artifactId) => {
    setSelectedArtifactId(artifactId);
    const saved = hypotheses[artifactId];
    setSelectedAnswerIndex(typeof saved?.answerIndex === 'number' ? saved.answerIndex : null);
    setSelectedPromptId(saved?.promptId ?? null);
  };

  const handleSaveAnalysis = () => {
    if (!selectedArtifact || selectedAnswerIndex !== selectedArtifact.correct || !selectedPrompt || !focusFeedback?.isCorrect) return;

    const analysisRecord = {
      answerIndex: selectedAnswerIndex,
      answerText: selectedArtifact.options?.[selectedAnswerIndex] ?? '',
      labResultText: getObservableLabResult(selectedArtifact),
      answerIsCorrect: selectedAnswerIndex === selectedArtifact.correct,
      answerRationale: selectedArtifact.rationale,
      promptId: selectedPrompt.id,
      promptTitle: selectedPrompt.title,
      promptDescription: selectedPrompt.description,
      note: '',
      clue: selectedArtifact.clue,
      question: selectedArtifact.question,
      typeLabel: getCategoryTitle(selectedArtifact.type),
      eraLabel: getArtifactEraLabel(selectedArtifact),
      recoveryCondition: evidenceConditions[selectedArtifact.id]?.condition || null,
      recoveryNote: evidenceConditions[selectedArtifact.id]?.note || '',
    };

    setHypotheses(prev => ({
      ...prev,
      [selectedArtifact.id]: analysisRecord,
    }));
    setSelectedArtifactId(null);
    setSelectedAnswerIndex(null);
    setSelectedPromptId(null);
  };

  const handleFinalise = () => {
    const defaultSiteName = currentScenarioData?.name || "Discovery Site";
    const defaultCivId = currentScenarioData?.id || null;
    onComplete(defaultSiteName, defaultCivId);
  };

  return (
    <div className="phase-container lab-phase">
      <div className="phase-status-panel-compact lab-status-panel">
        <div className="status-panel-info">
          <div className="status-icon-box-small">
            <Search size={20} />
          </div>
          <div className="status-text-content-horizontal">
            <div className="lab-status-title-row">
              <h2>Phase 3: Laboratory Analysis</h2>
              <span className="status-site-badge">{currentScenario?.civilization || 'Archaeological Site'}</span>
            </div>
            <p>Select three items of evidence. Confirm their meaning to prepare for curation.</p>
          </div>
        </div>

        <div className="status-panel-progress-compact">
          <div className="progress-label-group">
            <span className="progress-label-mini">PROGRESS</span>
            <span className="progress-count-mini">{analysedCount} / {requiredCount} Verified</span>
          </div>
          <div className="progress-bar-thin">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="status-panel-actions-compact">
          <button className="btn lab-menu-btn" onClick={onBackToMenu}>Main Menu</button>
          <button className="btn primary-btn lab-final-btn" onClick={handleFinalise} disabled={!isComplete}>
            Final Review <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {currentScenarioData && (
        <div className="lab-briefing-card">
          <div className="lab-briefing-title">
            <ScrollText size={16} />
            <span>Dossier Briefing</span>
          </div>
          <p>{currentScenarioData.historicalContext}</p>
        </div>
      )}

      <div className="lab-layout">
        <section className="lab-panel lab-tray-panel">
          <div className="lab-panel-heading">Evidence Tray</div>
          <p className="lab-panel-subheading">Select an item to study.</p>

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
                  <div className="lab-tray-icon" style={{ color: theme.accent, overflow: 'hidden' }}>
                    <img 
                      src={getEvidenceImagePath(item)} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                    <div className="lab-tray-copy">
                      <div className="lab-tray-name">{item.name}</div>
                      <div className="lab-tray-meta">{getCategoryTitle(item.type)}</div>
                      {evidenceConditions[item.id]?.condition && (
                        <div className={`condition-badge condition-${evidenceConditions[item.id].condition}`}>
                          {formatConditionLabel(evidenceConditions[item.id].condition)}
                        </div>
                      )}
                    </div>
                  {isAnalysed && <CheckCircle2 size={16} className="lab-tray-check" />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="lab-panel lab-bench-panel">
          <div className="lab-panel-heading">Analysis Desk</div>
          <p className="lab-panel-subheading">Use the clue to confirm the meaning, then choose the historical focus.</p>

          {!selectedArtifact ? (
            <div className="lab-empty-state">
              <div className="lab-empty-icon"><Search size={26} /></div>
              <div className="lab-empty-title">No find selected</div>
              <p>Choose an item from the evidence tray to begin analysis.</p>
            </div>
          ) : (
            <div className="lab-bench-content">
              <div className="lab-inspection-box">
                <div className="lab-inspection-grid">
                  <div className="lab-inspection-media">
                    <img 
                      src={getEvidenceImagePath(selectedArtifact)} 
                      alt={selectedArtifact.name} 
                      className="lab-inspection-image" 
                    />
                  </div>
                  
                  <div className="lab-inspection-details">
                    <div className="lab-inspection-name">{selectedArtifact.name}</div>
                    <div className="lab-inspection-meta">
                      <span>{getCategoryTitle(selectedArtifact.type)}</span>
                      <span>{getArtifactEraLabel(selectedArtifact)}</span>
                      {evidenceConditions[selectedArtifact.id]?.condition && (
                        <span>{formatConditionLabel(evidenceConditions[selectedArtifact.id].condition)} recovery</span>
                      )}
                    </div>
                    <div className="lab-artifact-clue" style={{ marginTop: '0.5rem' }}>
                      <strong>Evidence Clue:</strong> {selectedArtifact.clue}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lab-analysis-form">
                <div className="lab-analysis-section">
                   <div className="lab-section-title">1. Find the Meaning</div>
                   <p className="lab-section-instruction">{selectedArtifact.question || 'What does this reveal about the past?'}</p>
                    <div className="lab-answer-grid">
                       {answerChoices.map((choice, idx) => (
                         <button
                           key={choice.originalIndex}
                           className={`lab-answer-card ${selectedAnswerIndex === choice.originalIndex ? 'selected' : ''}`}
                           onClick={() => setSelectedAnswerIndex(choice.originalIndex)}
                         >
                           <div className="lab-answer-index">{String.fromCharCode(65 + idx)}</div>
                           <div className="lab-answer-text">{choice.text}</div>
                         </button>
                       ))}
                    </div>
                    {answerFeedback && (
                      <div className={`lab-answer-feedback ${answerFeedback.isCorrect ? 'correct' : 'incorrect'}`}>
                        <strong>{answerFeedback.title}</strong>
                        <p>{answerFeedback.message}</p>
                      </div>
                    )}
                </div>

                <div className="lab-analysis-section">
                   <div className="lab-section-title">2. Choose the Focus</div>
                   <p className="lab-section-instruction">Which historical area does this evidence best support?</p>
                   <div className="lab-prompt-grid">
                      {LAB_ANALYSIS_PROMPTS.map(prompt => {
                        const promptFeedbackClass = selectedPromptId === prompt.id && focusFeedback
                          ? (focusFeedback.isCorrect ? 'correct' : 'incorrect')
                          : '';
                        return (
                          <button
                            key={prompt.id}
                            className={`lab-prompt-btn ${selectedPromptId === prompt.id ? 'selected' : ''} ${promptFeedbackClass}`}
                            onClick={() => setSelectedPromptId(prompt.id)}
                          >
                            <div className="lab-prompt-icon">{getPromptIcon(prompt.iconId, 18)}</div>
                            <div className="lab-prompt-copy">
                              <div className="lab-prompt-title">{prompt.title}</div>
                              <div className="lab-prompt-desc">{prompt.description}</div>
                            </div>
                          </button>
                        );
                      })}
                   </div>
                   {focusFeedback && (
                     <div className={`lab-focus-feedback ${focusFeedback.isCorrect ? 'correct' : 'incorrect'}`}>
                       <strong>{focusFeedback.title}</strong>
                       <p>{focusFeedback.message}</p>
                     </div>
                   )}
                </div>

                <div className="lab-analysis-section">
                   <div className="lab-section-title">3. Prepare for Curation</div>
                   <p className="lab-section-instruction">Save the confirmed lab result. You will write your full interpretation in the museum display.</p>

                   <div className="lab-curation-preview">
                      <strong>Curate will ask:</strong>
                      <p>What might this tell us about people's lives, beliefs, work, or society?</p>
                   </div>
                </div>

                <div className="lab-analysis-actions">
                  <button
                    className="btn primary-btn lab-save-btn"
                    disabled={selectedAnswerIndex !== selectedArtifact.correct || !focusFeedback?.isCorrect}
                    onClick={handleSaveAnalysis}
                  >
                    Save to Records
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
