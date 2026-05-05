import { useState } from 'react';
import { 
  Camera, CheckCircle2, ChevronRight, FileText, Search
} from 'lucide-react';
import { 
  getArtifactTheme, 
  getCategoryTitle,
  getEvidenceImagePath
} from '../utils/gameLogic';
import { getIcon } from './Icons';

export function MuseumPhase({ 
  activeArtifacts, 
  hypotheses, 
  curatedItems, 
  setCuratedItems, 
  plaques, 
  setPlaques, 
  finalExhibitionStatement, 
  setFinalExhibitionStatement, 
  onComplete, 
  onBackToMenu 
}) {
  const [selectedArtifactId, setSelectedArtifactId] = useState(null);
  const curatedSet = new Set(curatedItems.map(item => item.id));
  
  const analysedArtifacts = activeArtifacts.filter(item => !!hypotheses[item.id]);
  const selectedArtifact = selectedArtifactId ? activeArtifacts.find(a => a.id === selectedArtifactId) : null;

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

  const isComplete = curatedItems.length > 0 && curatedItems.every(item => plaques[item.id] && plaques[item.id].trim().length > 10);

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
          <button className="btn" onClick={onBackToMenu}>Main Menu</button>
          <button className="btn primary-btn" onClick={onComplete} disabled={curatedItems.length === 0}>
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
              const isSelected = selectedArtifactId === item.id;
              const isCurated = curatedSet.has(item.id);
              const theme = getArtifactTheme(item);

              return (
                <button
                  key={item.id}
                  className={`museum-curation-card ${isSelected ? 'active' : ''} ${isCurated ? 'curated' : ''}`}
                  onClick={() => setSelectedArtifactId(item.id)}
                >
                  <div className="museum-curation-icon" style={{ color: theme.accent, overflow: 'hidden' }}>
                    <img 
                      src={getEvidenceImagePath(item)} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div className="museum-curation-copy">
                    <div className="museum-curation-name">{item.name}</div>
                    <div className="museum-curation-meta">{getCategoryTitle(item.type)}</div>
                  </div>
                  <div className="museum-curation-checkbox" onClick={(e) => { e.stopPropagation(); toggleCuration(item); }}>
                    {isCurated ? <CheckCircle2 size={18} /> : <div className="museum-checkbox-empty" />}
                  </div>
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
              </div>
            </div>
          )}
        </section>

        <section className="museum-panel museum-exhibit-panel">
           <div className="museum-panel-heading">Exhibition Display</div>
           <p className="museum-panel-subheading">Write a plaque for each curated find.</p>

           <div className="museum-display-grid">
              {curatedItems.map((item, index) => {
                const theme = getArtifactTheme(item);
                const analysis = hypotheses[item.id];

                return (
                  <div key={item.id} className="museum-display-card">
                    <div className="museum-display-header">
                       <div className="museum-display-number">Find {index + 1}</div>
                       <button className="museum-remove-btn" onClick={() => toggleCuration(item)}>Remove</button>
                    </div>
                    <div className="museum-display-visual">
                       <img 
                         src={getEvidenceImagePath(item)} 
                         alt={item.name} 
                         style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                       />
                    </div>
                    <div className="museum-display-body">
                       <h4>{item.name}</h4>
                       <div className="museum-display-analysis-box">
                          <strong>Lab Result:</strong>
                          <p>{analysis?.note || 'No research note.'}</p>
                       </div>
                       <div className="museum-plaque-field">
                          <label>Exhibition Label</label>
                          <textarea
                            value={plaques[item.id] || ''}
                            onChange={(e) => handlePlaqueChange(item.id, e.target.value)}
                            placeholder="Explain why this find is important for visitors to see..."
                          />
                       </div>
                    </div>
                  </div>
                );
              })}
              {curatedItems.length === 0 && (
                <div className="museum-empty-display">
                  <Camera size={32} />
                  <p>Select finds from the tray to build your exhibition.</p>
                </div>
              )}
           </div>
        </section>
      </div>
    </div>
  );
}
