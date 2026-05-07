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
  LAB_ANALYSIS_PROMPTS,
  LAB_NOTE_STEMS
} from '../utils/gameLogic';
import { getPromptIcon } from './Icons';

export function LabPhase({ activeArtifacts, itemsLocation, hypotheses, setHypotheses, currentScenario, onComplete, onBackToMenu }) {
  const currentScenarioData = currentScenario;
  const trayItems = useMemo(() => {
    const sortedItems = activeArtifacts.filter(item => itemsLocation[item.id] && itemsLocation[item.id] !== 'inventory');
    return sortedItems.length > 0 ? sortedItems : activeArtifacts;
  }, [activeArtifacts, itemsLocation]);

  const [selectedArtifactId, setSelectedArtifactId] = useState(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [draftNote, setDraftNote] = useState('');

  const requiredCount = 3;
  const analysedEntries = Object.entries(hypotheses);
  const analysedCount = analysedEntries.length;
  const progressPercent = Math.min(100, (analysedCount / requiredCount) * 100);
  const isComplete = analysedCount >= requiredCount;
  const selectedArtifact = trayItems.find(item => item.id === selectedArtifactId) || null;
  const selectedPrompt = LAB_ANALYSIS_PROMPTS.find(prompt => prompt.id === selectedPromptId) || null;
  
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
    setDraftNote(saved?.note ?? '');
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
            <div style={{display: 'flex', alignItems: 'baseline', gap: '10px'}}>
              <h2>Phase 3: The Lab</h2>
              <span className="status-site-badge">{currentScenario?.civilization || 'Archaeological Site'}</span>
            </div>
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

        <div className="status-panel-actions-compact">
          <button className="btn" onClick={onBackToMenu}>Main Menu</button>
          <button className="btn primary-btn" onClick={handleFinalise} disabled={!isComplete}>
            Curation Phase <ChevronRight size={18} />
          </button>
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
                    </div>
                    <div className="lab-artifact-clue" style={{ marginTop: '0.5rem' }}>
                      <strong>Evidence clue:</strong> {selectedArtifact.clue}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lab-analysis-form">
                <div className="lab-analysis-section">
                   <div className="lab-section-title">1. Identify Significance</div>
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
                </div>

                <div className="lab-analysis-section">
                   <div className="lab-section-title">2. Choose Research Category</div>
                   <p className="lab-section-instruction">Which historical area does this evidence best support?</p>
                   <div className="lab-prompt-grid">
                      {LAB_ANALYSIS_PROMPTS.map(prompt => {
                        return (
                          <button
                            key={prompt.id}
                            className={`lab-prompt-btn ${selectedPromptId === prompt.id ? 'selected' : ''}`}
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
                </div>

                <div className="lab-analysis-section">
                   <div className="lab-section-title">3. Record Research Note</div>
                   <p className="lab-section-instruction">Explain your reasoning in 1-2 sentences.</p>
                   
                   <div className="lab-note-field-container">
                      <div className="lab-note-stems">
                        {LAB_NOTE_STEMS.map((stem, i) => (
                          <button key={i} className="lab-stem-btn" onClick={() => addNoteStem(stem)}>{stem}</button>
                        ))}
                      </div>
                      <textarea
                        className="lab-note-textarea"
                        value={draftNote}
                        onChange={(e) => setDraftNote(e.target.value)}
                        placeholder={selectedArtifact.name ? `${selectedArtifact.name} suggests...` : 'Write your note here...'}
                      />
                   </div>
                </div>

                <div className="lab-analysis-actions">
                  <button
                    className="btn primary-btn lab-save-btn"
                    disabled={selectedAnswerIndex === null || !selectedPrompt || !draftNote.trim()}
                    onClick={handleSaveAnalysis}
                  >
                    Save Analysis to Journal
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
