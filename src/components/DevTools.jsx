import { 
  SCENARIOS, 
  RED_HERRINGS, 
  RANDOM_EVENTS, 
  createNewBureauSession 
} from '../utils/gameLogic'; 


export function DevTools({ 
  currentPhase, setPhase, setBureauState, setExcavatedIds, setActiveArtifacts, 
  setItemsLocation, setHypotheses, setCurrentScenario, setCurrentEvent, 
  setSiteName, setFinalConclusion, currentScenario, activeArtifacts, currentEvent 
}) {
  const jumpTo = (target) => {
    // Use current scenario if available, otherwise pick first as fallback
    const scen = currentScenario || (SCENARIOS && SCENARIOS.length > 0 ? SCENARIOS[0] : null);
    if (!scen) return;
    
    // For jumps, if we're not already in a game state, we might need to initialize artifacts
    // But usually activeArtifacts should already be set if we're in a game.
    // However, for a "jump", we often want to populate it with all evidence for that scenario.
    const artifacts = activeArtifacts && activeArtifacts.length > 0 
      ? activeArtifacts 
      : [...(scen.evidence || []), (RED_HERRINGS && RED_HERRINGS.length > 0 ? RED_HERRINGS[0] : null)].filter(Boolean);
    
    const evt = currentEvent || (RANDOM_EVENTS && RANDOM_EVENTS.length > 0 ? RANDOM_EVENTS[0] : null);
    
    setCurrentScenario(scen);
    setCurrentEvent(evt);
    
    if (target === 'dig') {
      setActiveArtifacts(artifacts);
      setExcavatedIds(new Set());
    } else if (target === 'sort') {
      setActiveArtifacts(artifacts);
      setExcavatedIds(new Set(artifacts.map(a => a.id)));
      const locations = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: 'inventory' }), {});
      setItemsLocation(locations);
    } else if (target === 'lab') {
      setActiveArtifacts(artifacts);
      setExcavatedIds(new Set(artifacts.map(a => a.id)));
      const locations = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: a.type || 'objects' }), {});
      setItemsLocation(locations);
      setHypotheses({});
      setSiteName(`Mock ${scen.name} Site`);
      setFinalConclusion(scen.id);
    } else if (target === 'museum' || target === 'report') {
      setActiveArtifacts(artifacts);
      setExcavatedIds(new Set(artifacts.map(a => a.id)));
      const locations = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: a.type || 'objects' }), {});
      setItemsLocation(locations);
      
      const hyps = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: a.correct || 0 }), {});
      setHypotheses(hyps);
      setSiteName(`Mock ${scen.name} Site`);
      setFinalConclusion(scen.id);
    }
    
    if (target === 'bureau') {
      if (typeof setBureauState === 'function') {
        setBureauState(createNewBureauSession('bureauBriefing'));
      }
      setPhase('bureauBriefing');
      return;
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
      <button className={currentPhase.startsWith('bureau') ? 'active' : ''} onClick={() => jumpTo('bureau')}>6. Bureau</button>
    </div>
  );
}
