import { useState } from 'react';
import {
  Camera, CheckCircle2, ChevronRight, Maximize2, Search, Send, X
} from 'lucide-react';
import {
  getArtifactTheme,
  getCategoryTitle,
  getEvidenceImagePath,
  getObservableLabResult
} from '../utils/gameLogic';

const formatConditionLabel = (condition) => {
  if (!condition) return '';
  return condition.charAt(0).toUpperCase() + condition.slice(1);
};

export function MuseumPhase({
  activeArtifacts,
  hypotheses,
  curatedItems,
  setCuratedItems,
  plaques,
  setPlaques,
  finalExhibitionStatement,
  setFinalExhibitionStatement,
  evidenceConditions = {},
  onComplete,
  onBackToMenu
}) {
  const [previewArtifact, setPreviewArtifact] = useState(null);
  const curatedSet = new Set(curatedItems.map(item => item.id));

  const analysedArtifacts = activeArtifacts.filter(item => !!hypotheses[item.id]);
  const emptySlots = Array.from({ length: Math.max(0, 3 - curatedItems.length) });

  const toggleCuration = (artifact) => {
    if (curatedSet.has(artifact.id)) {
      setCuratedItems(prev => prev.filter(item => item.id !== artifact.id));
    } else {
      if (curatedItems.length >= 3) return; // Max 3
      setCuratedItems(prev => [...prev, artifact]);
    }
  };

  const handlePlaqueChange = (artifactId, text) => {
    setPlaques(prev => ({ ...prev, [artifactId]: text }));
  };

  return (
    <div className="phase-container museum-phase">
      <div className="phase-status-panel-compact museum-status-panel">
        <div className="status-panel-info">
          <div className="status-icon-box-small">
            <Camera size={20} />
          </div>
          <div className="status-text-content-horizontal">
            <h2>Phase 4: The Museum</h2>
            <p>Select up to 3 finds for the exhibition and write their museum labels.</p>
          </div>
        </div>

        <div className="status-panel-progress-compact">
          <div className="progress-label-group">
            <span className="progress-label-mini">EXHIBITION</span>
            <span className="progress-count-mini">{curatedItems.length} / 3 curated</span>
          </div>
          <div className="progress-bar-thin">
            <div className="progress-fill" style={{ width: `${(curatedItems.length / 3) * 100}%` }}></div>
          </div>
        </div>

        <div className="status-panel-actions-compact">
          <button className="btn museum-menu-btn" onClick={onBackToMenu}>Main Menu</button>
          <button className="btn primary-btn museum-final-report-btn" onClick={onComplete} disabled={curatedItems.length === 0}>
            Final Report <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="museum-layout">
        <section className="museum-panel museum-curation-panel">
          <div className="museum-panel-heading">Curation Tray</div>
          <p className="museum-panel-subheading">Choose finds from your lab results.</p>

          <div className="museum-curation-list">
            {analysedArtifacts.map(item => {
              const isCurated = curatedSet.has(item.id);
              const theme = getArtifactTheme(item);
              const curationDisabled = !isCurated && curatedItems.length >= 3;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`museum-curation-card ${isCurated ? 'curated' : ''} ${curationDisabled ? 'disabled' : ''}`}
                  onClick={() => toggleCuration(item)}
                  disabled={curationDisabled}
                  aria-pressed={isCurated}
                  aria-label={isCurated ? `Remove ${item.name} from exhibition` : `Add ${item.name} to exhibition`}
                >
                  <span className="museum-curation-icon" style={{ color: theme.accent, overflow: 'hidden' }}>
                    <img
                      src={getEvidenceImagePath(item)}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </span>
                  <span className="museum-curation-copy">
                    <span className="museum-curation-name">{item.name}</span>
                    <span className="museum-curation-meta">{getCategoryTitle(item.type)}</span>
                    {evidenceConditions[item.id]?.condition && (
                      <span className={`condition-badge condition-${evidenceConditions[item.id].condition}`}>
                        {formatConditionLabel(evidenceConditions[item.id].condition)}
                      </span>
                    )}
                  </span>

                </button>
              );
            })}
            {analysedArtifacts.length === 0 && (
              <div className="museum-empty-tray">
                <Search size={24} />
                <p>Go back to the Lab to analyse finds first.</p>
              </div>
            )}
          </div>

          {curatedItems.length > 0 && (
            <div className="museum-final-statement-box">
              <div className="museum-panel-heading">Final Exhibition Statement</div>
              <p className="museum-panel-subheading">Summarise what this entire collection tells us about the site.</p>
              <div className="museum-statement-input-wrap">
                <textarea
                  className="museum-statement-textarea"
                  value={finalExhibitionStatement}
                  onChange={(e) => setFinalExhibitionStatement(e.target.value)}
                  placeholder="The evidence from this site reveals that..."
                />
                <button onClick={onComplete} className="btn primary-btn finish-museum-btn">
                  <Send size={14} />
                  Finish Exhibition
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="museum-panel museum-dossier-panel">
           <div className="museum-panel-heading">Exhibition Display</div>
           <p className="museum-panel-subheading">Write a plaque for each curated find.</p>

           <div className="museum-display-grid">
              {curatedItems.map((item, index) => {
                const analysis = hypotheses[item.id];
                const labResultText = analysis?.labResultText || getObservableLabResult(item);

                return (
                  <div key={item.id} className="museum-display-card">
                    <div className="museum-display-header">
                       <div className="museum-display-number">Find {index + 1}</div>
                       <button className="museum-remove-btn" onClick={() => toggleCuration(item)}>Remove</button>
                    </div>
                    <button
                      type="button"
                      className="museum-display-visual"
                      onClick={() => setPreviewArtifact(item)}
                      aria-label={`Inspect ${item.name} image`}
                    >
                       <img
                         src={getEvidenceImagePath(item)}
                         alt={item.name}
                         style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                       />
                       <span className="museum-image-expand-chip">
                         <Maximize2 size={13} />
                       </span>
                    </button>
                    <div className="museum-display-body">
                       <h4>{item.name}</h4>
                       <div className="museum-display-analysis-box">
                          <strong>Lab Result:</strong>
                          {evidenceConditions[item.id]?.condition && (
                            <p className="museum-analysis-note">
                              Field condition: {formatConditionLabel(evidenceConditions[item.id].condition)}
                            </p>
                          )}
                          {analysis ? (
                             <>
                               <p className="museum-analysis-answer">{labResultText}</p>
                             </>
                           ) : (
                             <p>No research note.</p>
                           )}
                       </div>
                       <div className="museum-plaque-field">
                          <label>Your Interpretation</label>
                          <p className="museum-plaque-helper">Use the lab result as evidence. What might this tell us about people's lives, beliefs, work, or society?</p>
                          <textarea
                            value={plaques[item.id] || ''}
                            onChange={(e) => handlePlaqueChange(item.id, e.target.value)}
                            placeholder="This might suggest..."
                          />
                       </div>
                    </div>
                  </div>
                );
              })}
              {curatedItems.length > 0 && emptySlots.map((_, index) => (
                <div
                  key={`empty-slot-${index}`}
                  className="museum-display-card museum-display-slot"
                >
                  <div className="museum-display-number">Open Slot {curatedItems.length + index + 1}</div>
                  <div className="museum-slot-placeholder">
                    <Camera size={24} />
                    <p>Select another find from the curation tray.</p>
                  </div>
                </div>
              ))}
              {curatedItems.length === 0 && (
                <div className="museum-empty-display">
                  <Camera size={32} />
                  <p>Select finds from the tray to build your exhibition.</p>
                </div>
              )}
           </div>
        </section>
      </div>

      {previewArtifact && (
        <div className="museum-image-preview-backdrop" role="dialog" aria-modal="true" aria-label={`${previewArtifact.name} image preview`}>
          <div className="museum-image-preview-card">
            <button
              type="button"
              className="museum-image-preview-close"
              onClick={() => setPreviewArtifact(null)}
              aria-label="Close image preview"
            >
              <X size={18} />
            </button>
            <img src={getEvidenceImagePath(previewArtifact)} alt={previewArtifact.name} />
            <div className="museum-image-preview-caption">
              <strong>{previewArtifact.name}</strong>
              <span>{getCategoryTitle(previewArtifact.type)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
