import { useState, useEffect, useRef } from 'react';
import { Landmark } from 'lucide-react';
import confetti from 'canvas-confetti';

import { 
  BUREAU_CASES,
  BUREAU_CIVILISATIONS,
  createInitialBureauEvidenceFilter,
  createNewBureauSession,
  getBureauClaimValidationMessage,
} from '../utils/gameLogic';

const BUREAU_TAG_LABELS = {
  Location: 'Location',
  Rulers: 'Rulers',
  Buildings: 'Buildings',
  Beliefs: 'Beliefs',
  Inventions: 'Inventions',
  Mysteries: 'Mysteries',
};

const getBureauTagLabel = (tag = '') => BUREAU_TAG_LABELS[tag] ?? tag.replace(/_/g, ' ');

const BUREAU_CLUE_TYPES = ['Location', 'Rulers', 'Buildings', 'Beliefs', 'Inventions', 'Mysteries'];

const getBureauProfileFactsGrouped = (bureauCase) => {
  const rawProfileFacts = bureauCase?.profileFacts ?? bureauCase?.keywords;
  if (!rawProfileFacts) return {};

  if (Array.isArray(rawProfileFacts)) {
    return rawProfileFacts.reduce((acc, fact, index) => {
      const clueType = bureauCase?.clueTiers?.[index]?.category || BUREAU_CLUE_TYPES[index] || 'Mysteries';
      if (!acc[clueType]) acc[clueType] = [];
      if (fact) acc[clueType].push(fact);
      return acc;
    }, {});
  }

  return BUREAU_CLUE_TYPES.reduce((acc, clueType) => {
    const value = rawProfileFacts[clueType];
    if (Array.isArray(value)) {
      acc[clueType] = value.filter(Boolean);
    } else if (value) {
      acc[clueType] = [value];
    }
    return acc;
  }, {});
};

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

const getBureauProfileFacts = (bureauCase, clueType = null) => {
  const groupedFacts = getBureauProfileFactsGrouped(bureauCase);
  if (clueType) {
    return groupedFacts[clueType] || [];
  }
  return BUREAU_CLUE_TYPES.flatMap(type => groupedFacts[type] || []);
};

const getUnlockedCivilisations = () => BUREAU_CASES.filter(bureauCase => bureauCase.round === 'training').map(item => item.civilisation);

export function BureauMode({ bureauState, setBureauState, onBackToMenu, audioControls = {} }) {
  const { playWin, initAudio } = audioControls;
  const didCelebrateRef = useRef(false);
  const [isMakingClaim, setIsMakingClaim] = useState(false);
  const [claimValidationMessage, setClaimValidationMessage] = useState('');
  
  const totalCases = BUREAU_CASES.length;
  const currentCase = BUREAU_CASES[bureauState.caseIndex] || null;
  const solvedCaseCount = bureauState.caseResults.length;
  const latestOutcome = bureauState.latestOutcome;
  const evidenceFilter = bureauState.evidenceFilter || createInitialBureauEvidenceFilter();
  const selectedClaimCivilisation = bureauState.selectedClaimCivilisation || '';
  const selectedClaimClueType = bureauState.selectedClaimClueType || '';
  const selectedClaimEvidence = bureauState.selectedClaimEvidence || '';
  const currentClueTiers = getBureauClueTiers(currentCase);
  const selectedProfile = BUREAU_CASES.find(item => item.civilisation === selectedClaimCivilisation);
  const currentProfileFacts = selectedProfile && selectedClaimClueType
    ? getBureauProfileFacts(selectedProfile, selectedClaimClueType)
    : [];
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

  const suspectStatuses = availableCivilisations.map(civilisation => ({
    civilisation,
    isRuledOut: (evidenceFilter[civilisation] || 'unsure') === 'discard',
  }));

  const currentEvidenceText = currentClueTiers
    .filter(item => item.tier <= bureauState.currentTier)
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
    const profile = BUREAU_CASES.find(item => item.civilisation === civilisation);
    setBureauState(prev => ({
      ...prev,
      selectedClaimCivilisation: civilisation,
      selectedClaimEvidence: (() => {
        const matchingFacts = prev.selectedClaimClueType
          ? getBureauProfileFacts(profile, prev.selectedClaimClueType)
          : getBureauProfileFacts(profile);
        return matchingFacts.includes(prev.selectedClaimEvidence) ? prev.selectedClaimEvidence : '';
      })(),
    }));
    setClaimValidationMessage('');
  };

  const selectClaimClueType = (clueType) => {
    setBureauState(prev => ({
      ...prev,
      selectedClaimClueType: clueType,
      selectedClaimEvidence: (() => {
        const profile = BUREAU_CASES.find(item => item.civilisation === prev.selectedClaimCivilisation);
        const matchingFacts = profile ? getBureauProfileFacts(profile, clueType) : [];
        return matchingFacts.includes(prev.selectedClaimEvidence) ? prev.selectedClaimEvidence : '';
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
  };

  const startCase = () => {
    setIsMakingClaim(false);
    setClaimValidationMessage('');
    updateState({
      phase: 'bureauCase',
      ...resetCaseState(),
    });
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
      currentEvidenceText,
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

  if (bureauState.phase === 'bureauBriefing') {
    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-briefing glass-card">
          <div className="training-kicker">Case Briefing</div>
          <h2>Mission Intelligence</h2>
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
      </section>
    );
  }

  if (bureauState.phase === 'bureauCase') {
    if (isMakingClaim) {
      return (
        <section className="phase-container bureau-phase">
          <div className="bureau-claim-screen glass-card">
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
                <span>and the profile says</span>
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
                  {currentProfileFacts.map(option => (
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
        </section>
      );
    }

    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-investigation-layout">
          <article className="bureau-case-file glass-card">
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
                </div>
              </div>
            </div>

            {bureauState.caseIndex === 6 && currentCase?.round === 'challenge' && (
              <div className="bureau-feedback-note bureau-transition-note" role="status" aria-live="polite">
                Training Round complete. Challenge Round unlocked.
              </div>
            )}

            <p className="bureau-case-instruction">
              Read the clues, check the suspect profiles, and keep narrowing the options.
            </p>

            <div className="bureau-tier-tabs" aria-label="Case file clue tiers">
              {currentClueTiers.map((item) => {
                const stateClass = bureauState.currentTier === item.tier
                  ? 'current'
                  : bureauState.currentTier > item.tier
                    ? 'complete'
                    : 'locked';
                return (
                  <div key={`${item.tier}-${item.category}`} className={`bureau-tier-tab bureau-tier-indicator ${stateClass}`}>
                    {`Clue ${item.tier}`}
                    <span>{getBureauTagLabel(item.category)}</span>
                  </div>
                );
              })}
            </div>

            <div className="bureau-evidence-box">
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
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn primary-btn"
                  onClick={() => {
                    updateState({ selectedAnswerIndex: null, selectedClaimCivilisation: '' });
                    setIsMakingClaim(true);
                  }}
                >
                  Close case now
                </button>
                {bureauState.currentTier < 3 && (
                  <button type="button" className="btn" onClick={revealNextClue}>
                    Reveal Clue {bureauState.currentTier + 1}
                  </button>
                )}
                <span className="bureau-simple-points">
                  {bureauState.currentTier < 3 ? `Close case now: ${availableClaimPoints} points` : 'Final claim: 1 point'}
                </span>
              </div>
              <button type="button" className="btn" onClick={onBackToMenu}>
                Back to Main Menu
              </button>
            </div>
          </article>

          <aside className="bureau-suspect-board glass-card">
            <div className="bureau-suspect-header">
              <div className="bureau-header-row">
                <h2>Suspect Profiles</h2>
                {solvedCaseCount < 6 && (
                  <div className="bureau-unlock-tag">Training round: {6 - solvedCaseCount} more cases</div>
                )}
                {solvedCaseCount >= 6 && (
                  <div className="bureau-unlock-tag unlocked">Challenge Round Active</div>
                )}
              </div>
              <p>Click a card to rule it out. Click again if you change your mind.</p>
            </div>

            <div className="bureau-suspect-grid">
              {suspectStatuses.map(({ civilisation, isRuledOut }) => {
                return (
                  <article 
                    key={civilisation} 
                    className={`bureau-suspect-card ${isRuledOut ? 'is-ruled-out' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isRuledOut}
                    aria-label={`${civilisation}. ${isRuledOut ? 'Ruled out.' : 'Still possible.'} Click to toggle.`}
                    onClick={() => toggleSuspectRuleOut(civilisation)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleSuspectRuleOut(civilisation);
                      }
                    }}
                  >
                    <div className="bureau-suspect-icon-box">
                       <Landmark size={20} />
                    </div>
                    <div className="bureau-suspect-name">
                      {civilisation}
                    </div>
                    <div className="bureau-suspect-status">
                      {isRuledOut ? 'Ruled out' : 'Still possible'}
                    </div>
                    {isRuledOut && <div className="bureau-ruled-out-label">Ruled out</div>}
                  </article>
                );
              })}
            </div>
          </aside>
        </div>
      </section>
    );
  }

  if (bureauState.phase === 'bureauLog') {
    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-log glass-card">
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
        <div className="bureau-feedback glass-card">
          <div className="training-kicker">Intelligence Report - Case #{bureauState.caseIndex + 1}</div>
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
    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-comparison glass-card">
          <div className="training-kicker">Comparative Analysis</div>
          <h2>Comparison Retired</h2>
          <p>The Bureau now uses the evidence sentence instead. Continue to the next case or the mission audit.</p>

          <div className="bureau-case-actions">
            <button
              type="button"
              className="btn primary-btn"
              onClick={handleContinueAfterComparison}
            >
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
        <div className="bureau-mission-audit glass-card">
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
