import { useState, useEffect, useRef } from 'react';
import { Landmark, Map, Users, Sparkles, Wrench, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

import { 
  BUREAU_CASES,
  BUREAU_CIVILISATIONS,
  BUREAU_COMPARISON_DATA,
  createInitialBureauEvidenceFilter,
  createNewBureauSession,
  getBureauCasesForSession,
  getBureauEvidenceSentenceOptions,
  getBureauClaimValidationMessage,
  resolveAssetPath,
} from '../utils/gameLogic';

const BUREAU_TAG_LABELS = {
  Location: 'Geography',
  Rulers: 'Society',
  Buildings: 'Legacy',
  Beliefs: 'Beliefs',
  Inventions: 'Inventions',
  Mysteries: 'Mysteries',
};

const getCategoryIcon = (category) => {
  const size = 14;
  switch (category) {
    case 'Location': 
    case 'Geography': return <Map size={size} />;
    case 'Rulers':
    case 'Society': return <Users size={size} />;
    case 'Buildings':
    case 'Legacy': return <Landmark size={size} />;
    case 'Beliefs': return <Sparkles size={size} />;
    case 'Inventions': return <Wrench size={size} />;
    case 'Mysteries': return <Search size={size} />;
    default: return null;
  }
};

const getBureauTagLabel = (tag = '') => BUREAU_TAG_LABELS[tag] ?? tag.replace(/_/g, ' ');

const BUREAU_DOSSIER_TABS = ['Folder', 'Evidence', 'Profiles', 'Journal'];

const getBureauClueTiers = (bureauCase) => {
  if (Array.isArray(bureauCase?.clueTiers) && bureauCase.clueTiers.length > 0) {
    return bureauCase.clueTiers;
  }

  return [
    bureauCase?.tier1SiteClue && { tier: 1, category: 'Location', text: bureauCase.tier1SiteClue },
    bureauCase?.tier2SocietyClue && { tier: 2, category: 'Rulers', text: bureauCase.tier2SocietyClue },
    bureauCase?.tier3LegacyClue && { tier: 3, category: 'Buildings', text: bureauCase.tier3LegacyClue },
  ].filter(Boolean);
};

const getUnlockedCivilisations = () => BUREAU_CASES.filter(bureauCase => bureauCase.round === 'training').map(item => item.civilisation);

export function BureauMode({ bureauState, setBureauState, onBackToMenu, audioControls = {} }) {
  const { playWin, initAudio } = audioControls;
  const didCelebrateRef = useRef(false);
  const [isMakingClaim, setIsMakingClaim] = useState(false);
  const [claimValidationMessage, setClaimValidationMessage] = useState('');
  const [showBriefing, setShowBriefing] = useState(bureauState.phase === 'bureauBriefing');
  const [activeTabTier, setActiveTabTier] = useState(bureauState.currentTier);
  const [activeProfile, setActiveProfile] = useState(null);
  
  const bureauCases = getBureauCasesForSession(bureauState);
  const totalCases = bureauCases.length;
  const currentCase = bureauCases[bureauState.caseIndex] || null;
  const solvedCaseCount = bureauState.caseResults.length;
  const latestOutcome = bureauState.latestOutcome;
  const evidenceFilter = bureauState.evidenceFilter || createInitialBureauEvidenceFilter();
  const selectedClaimCivilisation = bureauState.selectedClaimCivilisation || '';
  const selectedClaimClueType = bureauState.selectedClaimClueType || '';
  const selectedClaimEvidence = bureauState.selectedClaimEvidence || '';
  const currentClueTiers = getBureauClueTiers(currentCase);
  const profileFactOptions = getBureauEvidenceSentenceOptions({
    selectedCivilisation: selectedClaimCivilisation,
    selectedClueType: selectedClaimClueType,
    maxOptions: 4,
    seedSource: `${currentCase?.id || 'bureau'}:${selectedClaimCivilisation}:${selectedClaimClueType}`,
  });
  const availableClueTypes = [...new Set(
    currentClueTiers
      .filter(item => item.tier <= bureauState.currentTier)
      .map(item => item.category)
  )];
  const sentencePreview = selectedClaimCivilisation && selectedClaimClueType && selectedClaimEvidence
    ? `I think this object belongs to ${selectedClaimCivilisation} because the clue is about ${selectedClaimClueType}, and the profile says ${selectedClaimEvidence}.`
    : 'Choose all three dropdowns to close the case.';
  const availableClaimPoints = Math.max(0, 4 - bureauState.currentTier);
  const availableCivilisations = solvedCaseCount >= 6 
    ? BUREAU_CIVILISATIONS 
    : getUnlockedCivilisations();

  const suspectStatuses = availableCivilisations.map(civilisation => {
    const caseData = BUREAU_CASES.find(c => c.civilisation === civilisation);
    return {
      civilisation,
      isRuledOut: (evidenceFilter[civilisation] || 'unsure') === 'discard',
      thumbnail: caseData?.thumbnail,
      profileFacts: caseData?.profileFacts || {},
    };
  });

  const revealedEvidenceText = currentClueTiers
    .filter(item => item.tier <= bureauState.currentTier)
    .map(item => ({
      label: item.category,
      text: item.text,
      tier: item.tier,
    }));
  const currentEvidenceText = currentClueTiers
    .filter(item => item.tier <= bureauState.currentTier && item.tier === activeTabTier)
    .map(item => ({
      label: item.category,
      text: item.text,
      tier: item.tier,
    }));

  useEffect(() => {
    if (bureauState.phase === 'bureauResults' && !didCelebrateRef.current) {
      if (initAudio) initAudio();
      if (playWin) playWin();
      confetti({ particleCount: 110, spread: 72, origin: { y: 0.55 } });
      didCelebrateRef.current = true;
    }
    if (bureauState.phase !== 'bureauResults') {
      didCelebrateRef.current = false;
    }
  }, [bureauState.phase, initAudio, playWin]);

  const updateState = (patch) => {
    setBureauState(prev => ({ ...prev, ...patch }));
  };

  const resetCaseState = () => ({
    currentTier: 1,
    selectedAnswerIndex: null,
    selectedClaimCivilisation: '',
    selectedClaimClueType: '',
    selectedClaimEvidence: '',
    selectedLogAnswerIndex: null,
    selectedComparisonAnswerIndex: null,
    pendingCaseOutcome: null,
    latestOutcome: null,
    evidenceFilter: createInitialBureauEvidenceFilter(),
    showEvidenceFilter: false,
  });

  const setEvidenceFilterStatus = (civilisation, status) => {
    setBureauState(prev => ({
      ...prev,
      evidenceFilter: {
        ...(prev.evidenceFilter || createInitialBureauEvidenceFilter()),
        [civilisation]: status,
      },
    }));
  };

  const selectClaimCivilisation = (civilisation) => {
    const nextProfileFactOptions = civilisation && selectedClaimClueType
      ? getBureauEvidenceSentenceOptions({
        selectedCivilisation: civilisation,
        selectedClueType: selectedClaimClueType,
        maxOptions: 4,
        seedSource: `${currentCase?.id || 'bureau'}:${civilisation}:${selectedClaimClueType}`,
      })
      : [];
    setBureauState(prev => ({
      ...prev,
      selectedClaimCivilisation: civilisation,
      selectedClaimEvidence: (() => {
        return nextProfileFactOptions.includes(prev.selectedClaimEvidence) ? prev.selectedClaimEvidence : '';
      })(),
    }));
    setClaimValidationMessage('');
  };

  const selectClaimClueType = (clueType) => {
    const nextProfileFactOptions = selectedClaimCivilisation && clueType
      ? getBureauEvidenceSentenceOptions({
        selectedCivilisation: selectedClaimCivilisation,
        selectedClueType: clueType,
        maxOptions: 4,
        seedSource: `${currentCase?.id || 'bureau'}:${selectedClaimCivilisation}:${clueType}`,
      })
      : [];
    setBureauState(prev => ({
      ...prev,
      selectedClaimClueType: clueType,
      selectedClaimEvidence: (() => {
        return nextProfileFactOptions.includes(prev.selectedClaimEvidence) ? prev.selectedClaimEvidence : '';
      })(),
    }));
    setClaimValidationMessage('');
  };

  const selectClaimEvidence = (evidence) => {
    setBureauState(prev => ({
      ...prev,
      selectedClaimEvidence: evidence,
    }));
    setClaimValidationMessage('');
  };

  const toggleSuspectRuleOut = (civilisation) => {
    const currentStatus = evidenceFilter[civilisation] || 'unsure';
    setEvidenceFilterStatus(civilisation, currentStatus === 'discard' ? 'unsure' : 'discard');
  };

  const revealNextClue = () => {
    if (!currentCase || bureauState.currentTier >= 3) return;
    setIsMakingClaim(false);
    setClaimValidationMessage('');
    const nextTier = Math.min(3, bureauState.currentTier + 1);
    updateState({
      currentTier: nextTier,
      selectedAnswerIndex: null,
      selectedClaimCivilisation: '',
      selectedClaimClueType: '',
      selectedClaimEvidence: '',
    });
    setActiveTabTier(nextTier);
  };

  const startCase = () => {
    setShowBriefing(false);
    setIsMakingClaim(false);
    setClaimValidationMessage('');
    updateState({
      phase: 'bureauCase',
      ...resetCaseState(),
    });
    setActiveTabTier(1);
  };

  const handleSubmitCase = () => {
    if (!currentCase || !selectedClaimCivilisation || !selectedClaimClueType || !selectedClaimEvidence) {
      setClaimValidationMessage('Choose a civilisation, a clue type, and a profile fact before closing the case.');
      return;
    }

    const validationMessage = getBureauClaimValidationMessage({
      currentCase,
      selectedClaimCivilisation,
      selectedClaimClueType,
      selectedClaimEvidence,
      currentEvidenceText: revealedEvidenceText,
    });

    if (validationMessage) {
      setClaimValidationMessage(validationMessage);
      return;
    }

    const tierPoints = Math.max(0, 4 - bureauState.currentTier);
    const evidenceSentence = `I think this object belongs to ${selectedClaimCivilisation} because the clue is about ${selectedClaimClueType}, and the profile says ${selectedClaimEvidence}.`;
    const nextOutcome = {
      caseId: currentCase.id,
      caseTitle: currentCase.caseTitle,
      round: currentCase.round,
      civilisation: currentCase.civilisation,
      correctCivilisation: currentCase.civilisation,
      selectedCivilisation: selectedClaimCivilisation,
      civilisationCorrect: true,
      clueType: selectedClaimClueType,
      clueCorrect: true,
      selectedEvidence: selectedClaimEvidence,
      evidenceCorrect: true,
      evidenceSentence,
      tiersRevealed: bureauState.currentTier,
      tierSolvedAt: bureauState.currentTier,
      tierPoints,
      logAnswerIndex: null,
      logPoints: 0,
      logCorrect: false,
      comparisonTags: currentCase.comparisonTags || [],
      explanation: currentCase.explanation,
    };

    setIsMakingClaim(false);
    setBureauState(prev => ({
      ...prev,
      score: prev.score + tierPoints,
      phase: 'bureauFeedback',
      selectedLogAnswerIndex: null,
      pendingCaseOutcome: nextOutcome,
      latestOutcome: nextOutcome,
      selectedAnswerIndex: null,
      selectedClaimCivilisation: '',
      selectedClaimClueType: '',
      selectedClaimEvidence: '',
    }));
    setClaimValidationMessage('');
  };

  const handleContinueFromFeedback = () => {
    const completedCase = bureauState.pendingCaseOutcome;
    const nextCaseIndex = bureauState.caseIndex + 1;

    setIsMakingClaim(false);
    setClaimValidationMessage('');
    setBureauState(prev => {
      const nextState = {
        ...prev,
        caseResults: completedCase ? [...prev.caseResults, completedCase] : prev.caseResults,
        pendingCaseOutcome: null,
        latestOutcome: completedCase || prev.latestOutcome,
      };

      // Trigger comparison round every 2 cases
      const solvedCount = nextState.caseResults.length;
      if (solvedCount > 0 && solvedCount % 2 === 0 && solvedCount < totalCases) {
        // Find a comparison challenge that matches the last two civilisations solved
        const lastTwo = nextState.caseResults.slice(-2).map(r => r.correctCivilisation);
        const comparison = BUREAU_COMPARISON_DATA.find(c => 
          c.civilisations.includes(lastTwo[0]) && c.civilisations.includes(lastTwo[1])
        ) || BUREAU_COMPARISON_DATA[Math.floor(Math.random() * BUREAU_COMPARISON_DATA.length)];

        return {
          ...nextState,
          phase: 'bureauComparison',
          comparisonResult: {
            ...comparison,
            isCorrect: null,
            submitted: false
          },
          selectedComparisonAnswerIndex: null
        };
      }

      if (nextCaseIndex < totalCases) {
        return {
          ...nextState,
          phase: 'bureauCase',
          caseIndex: nextCaseIndex,
          ...resetCaseState(),
        };
      }

      return {
        ...nextState,
        phase: 'bureauResults',
      };
    });
  };

  const handleComparisonSelection = (index) => {
    if (bureauState.comparisonResult?.submitted) return;

    const isCorrect = index === bureauState.comparisonResult.correctAnswer;
    
    setBureauState(prev => ({
      ...prev,
      selectedComparisonAnswerIndex: index,
      score: prev.score + (isCorrect ? 2 : 0),
      comparisonResult: {
        ...prev.comparisonResult,
        isCorrect,
        submitted: true
      }
    }));

    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e89e5d', '#f4edd8', '#2c1d12']
      });
    }
  };

  const handleContinueAfterComparison = () => {
    if (bureauState.caseIndex + 1 < totalCases) {
      setIsMakingClaim(false);
      setClaimValidationMessage('');
      setBureauState(prev => ({
        ...prev,
        phase: 'bureauCase',
        caseIndex: prev.caseIndex + 1,
        comparisonResult: null,
        ...resetCaseState(),
      }));
      return;
    }

    updateState({ phase: 'bureauResults' });
  };

  const handleReplay = () => {
    setIsMakingClaim(false);
    setClaimValidationMessage('');
    setBureauState(createNewBureauSession('bureauBriefing'));
  };

  if (bureauState.phase === 'bureauCase' || bureauState.phase === 'bureauBriefing') {
    const mainContent = isMakingClaim ? (
      <div className="bureau-claim-screen">
        <div className="bureau-report-header">
          <div>
            <div className="training-kicker">Antiquities Bureau - Case #{bureauState.caseIndex + 1}</div>
            <h2>Evidence Sentence</h2>
          </div>
          <div className="bureau-simple-points">
            {bureauState.currentTier < 3 ? `Close case now: ${availableClaimPoints} points` : 'Final claim: 1 point'}
          </div>
        </div>

        <p className="bureau-case-instruction">
          Build the sentence using the clues and the profile card. The case only closes when all three parts are chosen.
        </p>

        <div className="bureau-sentence-builder">
          <div className="bureau-sentence-phrase">
            <span>I think this object belongs to</span>
            <select
              className="bureau-sentence-select"
              value={selectedClaimCivilisation}
              onChange={(e) => selectClaimCivilisation(e.target.value)}
            >
              <option value="">Choose a civilisation</option>
              {availableCivilisations.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="bureau-sentence-phrase">
            <span>because the clue is about</span>
            <select
              className="bureau-sentence-select"
              value={selectedClaimClueType}
              onChange={(e) => selectClaimClueType(e.target.value)}
              disabled={!availableClueTypes.length}
            >
              <option value="">{availableClueTypes.length ? 'Choose a clue type' : 'Reveal a clue first'}</option>
              {availableClueTypes.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="bureau-sentence-phrase">
            <span>WHICH SUPPORTS MY ANSWER</span>
            <select
              className="bureau-sentence-select"
              value={selectedClaimEvidence}
              onChange={(e) => selectClaimEvidence(e.target.value)}
              disabled={!selectedClaimCivilisation || !selectedClaimClueType}
            >
              <option value="">
                {selectedClaimCivilisation
                  ? (selectedClaimClueType ? 'Choose a profile fact' : 'Choose a clue type first')
                  : 'Choose a civilisation first'}
              </option>
              {profileFactOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span>.</span>
          </div>
        </div>

        <div className="bureau-sentence-preview">
          {sentencePreview}
        </div>

        {claimValidationMessage && (
          <div className="bureau-feedback-note bureau-claim-warning" role="status" aria-live="polite">
            {claimValidationMessage}
          </div>
        )}

        {latestOutcome && (
          <div className="bureau-feedback-note bureau-case-latest">
            {latestOutcome.explanation}
          </div>
        )}

        <div className="bureau-case-actions bureau-claim-actions">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn primary-btn"
              onClick={handleSubmitCase}
            >
              Close case now
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setIsMakingClaim(false);
                setClaimValidationMessage('');
                updateState({
                  selectedAnswerIndex: null,
                  selectedClaimCivilisation: '',
                  selectedClaimClueType: '',
                  selectedClaimEvidence: '',
                });
              }}
            >
              Back to clues
            </button>
          </div>
          <button type="button" className="btn" onClick={onBackToMenu}>
            Back to Main Menu
          </button>
        </div>
      </div>
    ) : (
      <div className="bureau-investigation-layout">
        <article className="bureau-case-file">
          <div className="bureau-file-banner" aria-label="Secret museum case file">
            <span>Secret Museum Case File</span>
            <strong>Antiquities Bureau</strong>
          </div>
          <nav className="bureau-dossier-tabs" aria-label="Bureau case sections">
            {BUREAU_DOSSIER_TABS.map((tab) => (
              <span
                key={tab}
                className={`bureau-dossier-tab ${tab === 'Folder' ? 'active' : ''}`}
              >
                {tab}
              </span>
            ))}
          </nav>
          <div className="bureau-report-header">
            <div className="bureau-case-info">
              <div className="training-kicker">Antiquities Case #{bureauState.caseIndex + 1}</div>
              <h2>{currentCase?.caseTitle || 'Case File'}</h2>
              <div className="bureau-round-tag">
                {currentCase?.round === 'training' ? 'Training Round' : 'Challenge Round'}
              </div>
            </div>
            <div className="bureau-case-meta">
              <div className="bureau-score-badge">
                <span className="bureau-score-label">CURRENT SCORE</span>
                <span className="bureau-score-value">{bureauState.score}</span>
                <div className={`bureau-score-stamp visible ${bureauState.score === 0 ? 'pending' : 'active'}`}>
                  {bureauState.score === 0 ? 'PENDING' : 'ACTIVE'}
                </div>
              </div>
            </div>
          </div>

          {bureauState.caseIndex === 6 && currentCase?.round === 'challenge' && (
            <div className="bureau-feedback-note bureau-transition-note" role="status" aria-live="polite">
              Training Round complete. Challenge Round unlocked.
            </div>
          )}

          <p className="bureau-case-instruction">
            Read the clues, check the civilisation profiles, and keep narrowing the options.
          </p>

          <div className="bureau-tier-tabs" aria-label="Case file clue tiers">
            {currentClueTiers.map((item) => {
              const stateClass = bureauState.currentTier === item.tier
                ? 'current'
                : bureauState.currentTier > item.tier
                  ? 'complete'
                  : 'locked';
              return (
                <div 
                  key={`${item.tier}-${item.category}`} 
                  className={`bureau-tier-tab bureau-tier-indicator ${stateClass} ${activeTabTier === item.tier ? 'active-selection' : ''}`}
                  onClick={() => {
                    if (item.tier <= bureauState.currentTier) {
                      setActiveTabTier(item.tier);
                    }
                  }}
                  role="button"
                  tabIndex={item.tier <= bureauState.currentTier ? 0 : -1}
                >
                  <div className="bureau-tier-icon">{getCategoryIcon(item.category)}</div>
                  <div className="bureau-tier-info">
                    {`Clue ${item.tier}`}
                    <span>{getBureauTagLabel(item.category)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bureau-evidence-box">
            <div className="bureau-section-label">
              <span>Evidence Folder</span>
              <strong>{currentEvidenceText.length} saved</strong>
            </div>
            <div className="bureau-evidence-text-list">
              {currentEvidenceText.map((item) => (
                <div key={item.tier} className="bureau-clue-dossier-item">
                  <div className="bureau-clue-badge">{item.label}</div>
                  <div className="bureau-clue-content">
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {latestOutcome && (
            <div className="bureau-feedback-note bureau-case-latest">
              {latestOutcome.explanation}
            </div>
          )}

          <div className="bureau-case-actions">
            <button
              type="button"
              className="btn primary-btn bureau-solve-btn"
              onClick={() => {
                updateState({ selectedAnswerIndex: null, selectedClaimCivilisation: '' });
                setIsMakingClaim(true);
              }}
            >
              Close case now
            </button>
            {bureauState.currentTier < 3 && (
              <button type="button" className="btn bureau-reveal-btn" onClick={revealNextClue}>
                Reveal Clue {bureauState.currentTier + 1}
              </button>
            )}
            <div className="bureau-clue-cost">
              {bureauState.currentTier < 3 ? `Close case now: ${availableClaimPoints} points` : 'Final claim: 1 point'}
            </div>
            <button type="button" className="btn bureau-back-btn" onClick={onBackToMenu}>
              Back to Main Menu
            </button>
          </div>
        </article>

        <aside className="bureau-suspect-board">
          <div className="bureau-suspect-header">
            <div className="bureau-header-row">
              <h2>Civilisation Profiles</h2>
              <div className="bureau-unlock-tags">
                {solvedCaseCount < 6 && (
                  <div className="bureau-unlock-tag">Training: {6 - solvedCaseCount} left</div>
                )}
                {solvedCaseCount >= 6 && (
                  <div className="bureau-unlock-tag unlocked">Challenge Active</div>
                )}
              </div>
            </div>
            <p className="bureau-suspect-instruction">Click a profile to cross out the ones that don't match the clues.</p>
          </div>

          <div className="bureau-suspect-grid">
            {suspectStatuses.map(({ civilisation, isRuledOut, thumbnail, profileFacts }, index) => {
              return (
                <article 
                  key={civilisation} 
                  className={`bureau-suspect-card ${isRuledOut ? 'is-ruled-out' : ''}`}
                  style={{ '--deal-order': index }}
                  aria-pressed={isRuledOut}
                  aria-label={`${civilisation}. ${isRuledOut ? 'Ruled out.' : 'Still possible.'}`}
                  onClick={() => toggleSuspectRuleOut(civilisation)}
                >
                  <button 
                    className="bureau-discard-btn" 
                    title="Rule out this suspect"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSuspectRuleOut(civilisation);
                    }}
                  >
                    {isRuledOut ? '+' : '×'}
                  </button>

                  <div className="bureau-suspect-image-container">
                    {thumbnail ? (
                      <img 
                        src={resolveAssetPath(thumbnail)} 
                        alt="" 
                        className="bureau-suspect-image"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="bureau-suspect-image-placeholder">
                        <Landmark size={32} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  
                  <div className="bureau-suspect-name">
                    {civilisation}
                  </div>

                  <div className="bureau-suspect-profile-action">
                    <button
                      type="button"
                      className="btn secondary-btn bureau-read-profile-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveProfile({ civilisation, facts: profileFacts });
                      }}
                    >
                      Read Profile
                    </button>
                  </div>

                  {isRuledOut && <div className="bureau-discarded-stamp">RULED OUT</div>}
                </article>
              );
            })}
          </div>
        </aside>
      </div>
    );

    return (
      <section className="phase-container bureau-phase">
        {mainContent}
        {activeProfile && (
          <div className="bureau-briefing-overlay" onClick={() => setActiveProfile(null)}>
            <div className="bureau-profile-modal bureau-briefing-modal" onClick={e => e.stopPropagation()}>
              <div className="training-kicker">Civilisation Profile</div>
              <h2>{activeProfile.civilisation}</h2>
              <div className="bureau-profile-facts" style={{textAlign: 'left', marginBottom: '1.5rem'}}>
                <ul style={{listStyleType: 'none', padding: 0}}>
                  {activeProfile.facts && Object.entries(activeProfile.facts).map(([category, facts]) => (
                    <li key={category} style={{marginBottom: '0.75rem'}}>
                      <strong style={{color: '#8B4513'}}>{category}:</strong> {Array.isArray(facts) ? facts.join(', ') : facts}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bureau-briefing-actions">
                <button className="btn primary-btn" type="button" onClick={() => setActiveProfile(null)}>
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
        {showBriefing && (
          <div className="bureau-briefing-overlay">
            <div className="bureau-briefing-modal">
              <div className="training-kicker">Case Briefing</div>
              <h2>Mission Briefing</h2>
              <p>
                You are going to solve ancient civilisation cases.
                Each case gives you clues. Use the clues to work out which civilisation it is.
                You can guess early for more points, or reveal more clues first.
              </p>
              <div className="bureau-briefing-actions">
                <button className="btn primary-btn" type="button" onClick={startCase}>
                  Start First Case
                </button>
                <button className="btn" type="button" onClick={onBackToMenu}>
                  Back to Main Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  if (bureauState.phase === 'bureauLog') {
    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-log">
          <div className="training-kicker">Historian&apos;s Log - Case #{bureauState.caseIndex + 1}</div>
          <h2>Evidence Review</h2>
          <p>
            The Bureau now closes cases with the evidence sentence builder. Review the sentence and continue.
          </p>
          <div className="bureau-feedback-note">
            {bureauState.pendingCaseOutcome?.evidenceSentence || latestOutcome?.evidenceSentence || 'No sentence recorded yet.'}
          </div>
          <div className="bureau-case-actions">
            <button
              type="button"
              className="btn primary-btn"
              onClick={() => updateState({ phase: 'bureauFeedback' })}
            >
              Continue to Feedback
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (bureauState.phase === 'bureauFeedback') {
    const outcome = bureauState.latestOutcome || {};
    const civilisationCorrect = outcome.civilisationCorrect === true;
    const solvedAt = typeof outcome.tierSolvedAt === 'number' ? outcome.tierSolvedAt : null;
    const tierPoints = outcome.tierPoints || 0;
    const closedCaseCount = solvedCaseCount + (bureauState.pendingCaseOutcome ? 1 : 0);
    const civilisationText = civilisationCorrect
      ? `Correct. The clues point to ${outcome.correctCivilisation || outcome.civilisation || 'the civilisation'}.`
      : `Not quite. The correct civilisation was ${outcome.correctCivilisation || outcome.civilisation || 'unknown'}.`;

    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-feedback">
          <div className="training-kicker">Mission Report - Case #{bureauState.caseIndex + 1}</div>
          <h2>Review & Outcome</h2>
          <p>{civilisationText}</p>

          <div className="bureau-feedback-grid">
            <div className="bureau-feedback-card">
              <strong>Sentence</strong>
              <span>{outcome.evidenceSentence || 'No sentence recorded.'}</span>
            </div>
            <div className="bureau-feedback-card">
              <strong>Clue use</strong>
              <span>{solvedAt ? `Solved after ${solvedAt} clue${solvedAt === 1 ? '' : 's'}` : 'Not recorded'}</span>
              <span>{tierPoints} point{tierPoints === 1 ? '' : 's'}</span>
            </div>
            <div className="bureau-feedback-card">
              <strong>Total so far</strong>
              <span>{bureauState.score} points</span>
              <span>{closedCaseCount} case{closedCaseCount === 1 ? '' : 's'} solved</span>
            </div>
          </div>

          <div className="bureau-feedback-note">
            {outcome.explanation || 'Use the next case to keep building your thinking.'}
          </div>

          <div className="bureau-case-actions">
            <button type="button" className="btn primary-btn" onClick={handleContinueFromFeedback}>
              {bureauState.caseIndex + 1 < totalCases ? 'Next Case' : 'View Mission Audit'}
            </button>
            <button type="button" className="btn" onClick={onBackToMenu}>
              Back to Main Menu
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (bureauState.phase === 'bureauComparison') {
    const comp = bureauState.comparisonResult;
    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-comparison">
          <div className="training-kicker">Comparative Analysis</div>
          <h2>{comp?.title || 'History Comparison'}</h2>
          <p className="bureau-comparison-question">
            {comp?.question || 'What is similar about these two civilisations?'}
          </p>

          <div className="bureau-comparison-options">
            {comp?.options?.map((option, index) => {
              const isSelected = bureauState.selectedComparisonAnswerIndex === index;
              const isCorrect = index === comp.correctAnswer;
              const showResult = comp.submitted;

              let btnClass = 'bureau-comparison-option';
              if (showResult) {
                if (isCorrect) btnClass += ' is-correct';
                else if (isSelected) btnClass += ' is-incorrect';
              } else if (isSelected) {
                btnClass += ' is-selected';
              }

              return (
                <button
                  key={index}
                  className={btnClass}
                  onClick={() => handleComparisonSelection(index)}
                  disabled={showResult}
                >
                  <span className="bureau-option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="bureau-option-text">{option}</span>
                </button>
              );
            })}
          </div>

          {comp?.submitted && (
            <div className={`bureau-comparison-feedback ${comp.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="bureau-feedback-icon">
                {comp.isCorrect ? '✓' : '✗'}
              </div>
              <div className="bureau-feedback-content">
                <strong>{comp.isCorrect ? 'Brilliant analysis!' : 'Not quite right.'}</strong>
                <p>{comp.explanation}</p>
              </div>
            </div>
          )}

          <div className="bureau-case-actions">
            {comp?.submitted ? (
              <button
                type="button"
                className="btn primary-btn"
                onClick={handleContinueAfterComparison}
              >
                {bureauState.caseIndex + 1 < totalCases ? 'Next Case' : 'View Mission Audit'}
              </button>
            ) : (
              <p className="bureau-hint">Choose the best historical explanation to continue.</p>
            )}
            <button type="button" className="btn" onClick={onBackToMenu}>
              Back to Main Menu
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (bureauState.phase === 'bureauResults' || bureauState.phase === 'bureauResearchChoice') {
    const caseResults = bureauState.caseResults || [];
    const totalTierPoints = caseResults.reduce((acc, curr) => acc + (curr.tierPoints || 0), 0);
    const trainingSolved = caseResults.filter(result => result.round === 'training').length;
    const challengeSolved = caseResults.filter(result => result.round === 'challenge').length;
    const earlyGuessCases = caseResults
      .filter(result => result.tiersRevealed === 1)
      .slice(0, 3);
    const earlyGuessCount = caseResults.filter(result => result.tiersRevealed === 1).length;
    const moreClueCases = [...caseResults]
      .filter(result => result.tiersRevealed > 1)
      .sort((a, b) => (b.tiersRevealed || 0) - (a.tiersRevealed || 0))
      .slice(0, 3);
    const reflectionPrompts = [
      'Which clue helped you the most? Explain why.',
      'Which case was hardest to solve? What made it difficult?',
      'How did evidence help you avoid guessing?',
      'What would a historian or archaeologist do before making a claim?',
    ];

    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-mission-audit">
          <div className="bureau-report-header">
            <div>
              <div className="training-kicker">Mission Audit</div>
              <h2>Civilisation Fingerprinting Record</h2>
              <p>Historians build explanations from evidence. This record helps you think about how you used clues.</p>
            </div>
            <div className="bureau-score-badge">
              <span className="bureau-score-label">FINAL SCORE</span>
              <span className="bureau-score-value">{bureauState.score}</span>
            </div>
          </div>

          <div className="bureau-results-summary">
            <div className="bureau-results-card">
              <strong>Cases solved</strong>
              <span>{caseResults.length}</span>
            </div>
            <div className="bureau-results-card">
              <strong>Training round</strong>
              <span>{trainingSolved} solved</span>
            </div>
            <div className="bureau-results-card">
              <strong>Challenge round</strong>
              <span>{challengeSolved} solved</span>
            </div>
            <div className="bureau-results-card">
              <strong>Points from cases</strong>
              <span>{totalTierPoints} pts</span>
            </div>
          </div>

          <div className="bureau-results-grid">
            <section className="bureau-audit-panel">
              <div className="bureau-audit-panel-head">
                <h3>Best evidence moments</h3>
                <div className="bureau-unlock-tag unlocked">Guessed early: {earlyGuessCount}</div>
              </div>
              <p>These cases were solved after the first clue.</p>
              <div className="bureau-results-list">
                {earlyGuessCases.length > 0 ? earlyGuessCases.map((result, index) => (
                  <article key={`${result.caseId}-conf-${index}`} className="bureau-results-item">
                    <div>
                      <strong>{result.caseTitle}</strong>
                      <p>{result.correctCivilisation}</p>
                    </div>
                    <div className="bureau-results-item-points">
                      <strong>{result.tiersRevealed} clue{result.tiersRevealed === 1 ? '' : 's'}</strong>
                    </div>
                  </article>
                )) : <p className="bureau-empty-state">No cases were solved after one clue.</p>}
              </div>
            </section>

            <section className="bureau-audit-panel">
              <h3>Cases needing more clues</h3>
              <p>These answers needed extra evidence before you were ready to claim them.</p>
              <div className="bureau-results-list">
                {moreClueCases.length > 0 ? moreClueCases.map((result, index) => (
                  <article key={`${result.caseId}-hard-${index}`} className="bureau-results-item">
                    <div>
                      <strong>{result.caseTitle}</strong>
                      <p>{result.correctCivilisation}</p>
                    </div>
                    <div className="bureau-results-item-points">
                      <strong>{result.tiersRevealed} clue{result.tiersRevealed === 1 ? '' : 's'}</strong>
                    </div>
                  </article>
                )) : <p className="bureau-empty-state">No cases needed extra clues.</p>}
              </div>
            </section>
          </div>

          <section className="bureau-audit-panel bureau-audit-panel--full bureau-reflection-card">
            <h3>Reflection on evidence</h3>
            <p>Pick one question to answer or discuss with your teacher.</p>
            <ul className="bureau-reflection-list">
              {reflectionPrompts.map((prompt) => (
                <li key={prompt}>{prompt}</li>
              ))}
            </ul>
            <div className="bureau-reflection-note">
              Historians and archaeologists look at clues first, then make the best explanation they can from the evidence.
            </div>
          </section>

          <div className="bureau-action-row">
            <button type="button" className="btn primary-btn" onClick={handleReplay}>
              Replay Bureau
            </button>
            <button type="button" className="btn" onClick={onBackToMenu}>
              Back to Main Menu
            </button>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
