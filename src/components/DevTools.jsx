import { 
  SCENARIOS, 
  RED_HERRINGS, 
  RANDOM_EVENTS, 
  createNewBureauSession 
} from '../utils/gameLogic'; 


export function DevTools({ currentPhase, setPhase, setBureauState, setExcavatedIds, setActiveArtifacts, setItemsLocation, setHypotheses, setCurrentScenario, setCurrentEvent, setSiteName, setFinalConclusion }) {
  const jumpTo = (target) => {
    // Pick first scenario as default for testing
    const scen = SCENARIOS && SCENARIOS.length > 0 ? SCENARIOS[0] : null;
    if (!scen) return;
    const artifacts = [...(scen.evidence || []), (RED_HERRINGS && RED_HERRINGS.length > 0 ? RED_HERRINGS[0] : null)].filter(Boolean);
    const evt = RANDOM_EVENTS && RANDOM_EVENTS.length > 0 ? RANDOM_EVENTS[0] : null;
    
    setCurrentScenario(scen);
    setCurrentEvent(evt);
    setActiveArtifacts(artifacts);
    setExcavatedIds(new Set(artifacts.map(a => a.id)));
    
    if (target === 'sort') {
      const locations = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: 'inventory' }), {});
      setItemsLocation(locations);
    } else if (target === 'lab') {
      const locations = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: a.type || 'objects' }), {});
      setItemsLocation(locations);
      setHypotheses({});
      setSiteName("Mock Testing Site");
      setFinalConclusion(scen.id);
    } else if (target === 'museum' || target === 'report') {
      const locations = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: a.type || 'objects' }), {});
      setItemsLocation(locations);
      
      const hyps = artifacts.reduce((acc, a) => ({ ...acc, [a.id]: a.correct || 0 }), {});
      setHypotheses(hyps);
      setSiteName("Mock Testing Site");
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
