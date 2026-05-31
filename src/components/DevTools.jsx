import { 
  SCENARIOS, 
  RED_HERRINGS, 
  RANDOM_EVENTS, 
  createNewBureauSession,
  getObservableLabResult,
} from '../utils/gameLogic'; 
import { SECTIONS } from './expedition-journey/journeyDataRouter';

const JOURNEY_SECTION_DEV_JUMPS = SECTIONS.map((section, index) => ({
  id: section.id,
  label: `${index + 1}. ${section.name}`,
}));

export function DevTools({ 
  currentPhase, setPhase, setBureauState, setExcavatedIds, setActiveArtifacts, 
  setItemsLocation, setHypotheses, setCurrentScenario, setCurrentEvent, 
  setSiteName, setFinalConclusion, setCuratedItems, setPlaques,
  setEvidenceConditions, setDigRecoverySummary,
  currentScenario, activeArtifacts, currentEvent 
}) {
  const jumpToExpeditionStage = (target, detail = {}) => {
    const dispatchExpeditionJump = () => {
      window.dispatchEvent(new CustomEvent('expedition-dev-jump', { detail: { target, ...detail } }));
    };

    setPhase('expedition');
    dispatchExpeditionJump();
    window.setTimeout(dispatchExpeditionJump, 80);
    window.setTimeout(dispatchExpeditionJump, 180);
  };

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
    const defaultConditions = artifacts.reduce((acc, artifact) => ({
      ...acc,
      [artifact.id]: {
        condition: artifact.isRedHerring ? 'disturbed' : 'good',
        recoveredBy: 'dev-tools',
        pressure: 0,
        note: artifact.isRedHerring ? 'Logged as site disturbance.' : 'Mock recovered with usable field context.',
      },
    }), {});
    const defaultSummary = {
      cleanRecoveryCount: artifacts.filter(artifact => !artifact.isRedHerring).length,
      damagedRecoveryCount: 0,
      disturbedRecoveryCount: artifacts.filter(artifact => artifact.isRedHerring).length,
      recoveredEvidenceCount: artifacts.length,
      guaranteedEvidenceCount: artifacts.length,
      minimumEvidenceTarget: Math.min(artifacts.length, artifacts.length >= 10 ? 10 : artifacts.length),
      digMinimumEvidenceMet: true,
      attempts: 0,
      radarUses: 0,
      disturbanceLevel: 0,
      timeMode: 'dev-tools',
    };
    
    setCurrentScenario(scen);
    setCurrentEvent(evt);
    if (typeof setEvidenceConditions === 'function') setEvidenceConditions(defaultConditions);
    if (typeof setDigRecoverySummary === 'function') setDigRecoverySummary(defaultSummary);
    
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
      
      const hyps = artifacts.reduce((acc, a) => ({ 
        ...acc, 
        [a.id]: {
          answerIndex: a.correct || 0,
          answerText: a.options?.[a.correct || 0] || 'Mock identification',
          labResultText: getObservableLabResult(a),
          note: `Use the lab result to explain what ${a.name} might tell us about the past.`,
          answerIsCorrect: true
        } 
      }), {});
      setHypotheses(hyps);
      setSiteName(`Mock ${scen.name} Site`);
      setFinalConclusion(scen.id);

      if (target === 'report') {
        // Pre-curate first 3 items for testing
        const toCurate = artifacts.filter(a => !a.isRedHerring).slice(0, 3);
        setCuratedItems(toCurate);
        const mockPlaques = toCurate.reduce((acc, a) => ({ ...acc, [a.id]: `Mock plaque for ${a.name}` }), {});
        setPlaques(mockPlaques);
      } else {
        setCuratedItems([]);
        setPlaques({});
      }
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
      <div className="dev-tools-section-label">Expedition</div>
      <button className={currentPhase === 'expedition' ? 'active' : ''} onClick={() => jumpToExpeditionStage('journey')}>Journey</button>
      <button onClick={() => jumpToExpeditionStage('base-camp')}>Base Camp</button>
      <button onClick={() => jumpToExpeditionStage('excavation')}>Excavation</button>
      <div className="dev-tools-section-label">Journey Bosses</div>
      <button
        className="dev-tools-subbutton"
        onClick={() => jumpToExpeditionStage('journey-boss-start', { bossId: 'scarab-queen' })}
      >
        Scarab Queen
      </button>
      <button
        className="dev-tools-subbutton"
        onClick={() => jumpToExpeditionStage('journey-scarab-payoff')}
      >
        Smoke: Scarab Queen Payoff
      </button>
      <button
        className="dev-tools-subbutton"
        onClick={() => jumpToExpeditionStage('journey-desert-map-seal-ready')}
      >
        Smoke: Desert Map Seal Ready
      </button>
      <div className="dev-tools-section-label">Journey Starts</div>
      {JOURNEY_SECTION_DEV_JUMPS.map(jump => (
        <button
          key={jump.id}
          className="dev-tools-subbutton"
          onClick={() => jumpToExpeditionStage('journey-section-start', { sectionId: jump.id })}
        >
          {jump.label}
        </button>
      ))}
    </div>
  );
}
