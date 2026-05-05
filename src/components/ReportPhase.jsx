import { useMemo } from 'react';
import { 
  FileText, MapPin, Search, RefreshCw
} from 'lucide-react';
import { 
  getCategoryTitle,
  getEvidenceImagePath,
  CATEGORIES
} from '../utils/gameLogic';
import { getIcon } from './Icons';

export function ReportPhase({ 
  activeArtifacts, 
  itemsLocation, 
  hypotheses, 
  siteName, 
  finalConclusion, 
  currentScenario, 
  onBack, 
  onRetry, 
  currentEvent, 
  curatedItems, 
  plaques, 
  finalExhibitionStatement, 
  onBackToMenu 
}) {
  const summary = useMemo(() => {
    const categoriesUsed = CATEGORIES.map(cat => ({
      ...cat,
      items: activeArtifacts.filter(a => itemsLocation[a.id] === cat.id),
    })).filter(cat => cat.items.length > 0);

    const totalAnalysed = Object.keys(hypotheses).length;
    const correctAnalyses = Object.values(hypotheses).filter(h => h.answerIsCorrect).length;

    return { categoriesUsed, totalAnalysed, correctAnalyses };
  }, [activeArtifacts, itemsLocation, hypotheses]);

  const handlePrint = (type) => {
    // Basic print trigger. Styles in index.css handle .hide-on-print
    window.print();
  };

  const getLegacyAnalysisFeedback = (selectedIndex, correctIndex) => {
    if (selectedIndex === correctIndex) return "Your analysis correctly identified the historical significance of this find.";
    return "While your interpretation was thoughtful, historians generally agree on a different significance for this evidence.";
  };

  const curatedFinds = curatedItems || [];

  return (
    <div className="phase-container report-phase">
      <div className="report-card glass-card">
        <div className="report-header">
          <div className="report-header-top">
             <FileText size={40} className="report-icon" />
             <div className="report-titles">
                <h2>Field Research Report</h2>
                <p className="report-site-name">{siteName}</p>
             </div>
          </div>
          <div className="report-meta">
            <div className="report-meta-item">
              <MapPin size={16} />
              <span><strong>Scenario:</strong> {currentScenario?.name || 'Unknown'}</span>
            </div>
            <div className="report-meta-item">
              <Search size={16} />
              <span><strong>Total Finds:</strong> {activeArtifacts.length}</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h3>Historical Context</h3>
          <p>{currentScenario?.historicalContext}</p>
        </div>

        {curatedFinds.length > 0 && (
          <div className="museum-export-section">
             <h3>Museum Exhibition: {siteName}</h3>
             
             {finalExhibitionStatement && (
               <div className="museum-export-final-statement">
                 <strong>Final exhibition statement</strong>
                 <p>{finalExhibitionStatement}</p>
               </div>
             )}

             <div className="museum-export-grid">
                {curatedFinds.map((item, index) => {
                  const analysis = hypotheses[item.id];
                  return (
                    <article key={item.id} className="museum-export-card">
                       <div className="museum-export-card-number">Find {index + 1}</div>
                       <img src={getEvidenceImagePath(item)} alt={item.name} />
                       <div className="museum-export-card-body">
                         <div className="museum-export-category">{getCategoryTitle(item.type)}</div>
                         <h4>{item.name}</h4>
                         <div className="museum-export-label">
                           <strong>Museum label</strong>
                           <p>{plaques[item.id] || 'No plaque written.'}</p>
                         </div>
                         <div className="museum-export-evidence">
                           <strong>Evidence clue</strong>
                           <p>{item.clue}</p>
                         </div>
                         {analysis && typeof analysis === 'object' && (
                           <div className="museum-export-analysis">
                             <strong>What this reveals</strong>
                             <p><span>{analysis.promptTitle}:</span> {analysis.note}</p>
                           </div>
                         )}
                       </div>
                    </article>
                  );
                })}
             </div>
          </div>
        )}

        <div className="report-body">
           <h3>All Field Evidence</h3>
          {summary.categoriesUsed.map(cat => (
            <div key={cat.id} className="report-category">
              <h4>{cat.title}</h4>
              <ul>
                {cat.items.map(item => {
                  const analysis = hypotheses[item.id];
                  return (
                    <li key={item.id} className="report-item">
                      <div className="report-item-header">
                        <strong>{item.name}</strong>
                        <span className="report-clue">{item.clue}</span>
                      </div>
                      {analysis && typeof analysis === 'object' && (
                        <>
                          <div className="report-hypothesis">
                            <strong>Analysis focus:</strong> {analysis.promptTitle || 'Research note'}
                          </div>
                          <div className="report-feedback">
                            {analysis.note || 'No note recorded.'}
                          </div>
                        </>
                      )}
                      {typeof analysis === 'number' && (
                        <>
                          <div className="report-hypothesis">
                            <strong>Significance:</strong> "{item.options?.[analysis] || 'No option recorded.'}"
                          </div>
                          <div className="report-feedback">
                            {getLegacyAnalysisFeedback(analysis, item.correct)}
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="report-actions hide-on-print">
         <button className="btn" onClick={onBack}>
           Back to Lab
         </button>
         <button className="btn" onClick={onBackToMenu}>
           Back to Main Menu
         </button>
         <button className="btn primary-btn" onClick={() => handlePrint('report')}>
           Print Report
         </button>
         <button className="btn primary-btn" onClick={() => handlePrint('museum')} disabled={curatedFinds.length === 0}>
           Export Museum
         </button>
         <button className="btn" onClick={onRetry} style={{marginLeft: 'auto', background: 'var(--accent)', color: '#111', borderColor: 'var(--accent)'}}>
           <RefreshCw size={20} style={{verticalAlign:'middle', marginRight:'5px'}} />
           Start New Dig
         </button>
      </div>
    </div>
  );
}
