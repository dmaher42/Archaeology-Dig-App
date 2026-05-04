import { useState, useEffect, useRef } from 'react';
import { 
  FileText, Search, CheckCircle2, ChevronRight, Archive, Users, Landmark, Beaker, Leaf, Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import * as data from '../data';

import { 
  BUREAU_CASES,
  BUREAU_RESEARCH_FOCUS,
  BUREAU_CIVILISATIONS,
  BUREAU_CASES_BY_ID,
  createInitialBureauEvidenceFilter,
  createNewBureauSession
} from '../utils/gameLogic';

const BUREAU_TAG_LABELS = {
  river_valley: 'river valley features',
  trade_and_economy: 'trade and economy',
  power_and_leadership: 'power and leadership',
  belief_and_ritual: 'belief and ritual',
  environment_and_farming: 'environment and farming',
};

const getBureauTagLabel = (tag = '') => BUREAU_TAG_LABELS[tag] ?? tag.replace(/_/g, ' ');

const getBureauCivilisationOptions = (bureauCase) => bureauCase?.civilisationOptions || 
bureauCase?.answerOptions || [];

const getBureauCorrectCivilisationIndex = (bureauCase) => {
  if (typeof bureauCase?.correctAnswerIndex === 'number') return bureauCase.correctAnswerIndex;
  if (typeof bureauCase?.correctIndex === 'number') return bureauCase.correctIndex;
  return -1;
};

const getBureauCorrectCivilisationLabel = (bureauCase) => {
  const options = getBureauCivilisationOptions(bureauCase);
  const correctIndex = getBureauCorrectCivilisationIndex(bureauCase);
  return options[correctIndex] || bureauCase.civilisation || 'unknown';
};

const findExplicitBureauComparisonChallenge = (firstCase, secondCase) => {
  if (!firstCase || !secondCase) return null;
  const BUREAU_COMPARISON_CHALLENGES = data.BUREAU_COMPARISON_CHALLENGES || [];
  const pairKey = [firstCase.civilisation, secondCase.civilisation].sort().join('||');
  
  for (const challenge of BUREAU_COMPARISON_CHALLENGES) {
    const challengeKey = challenge.civilisations.slice().sort().join('||');
    if (challengeKey === pairKey) return challenge;
  }
  return null;
};

const buildBureauComparisonChallenge = (firstCase, secondCase) => {
  const explicitChallenge = findExplicitBureauComparisonChallenge(firstCase, secondCase);
  if (explicitChallenge) return explicitChallenge;

  const sharedTags = (firstCase?.comparisonTags || []).filter(tag => secondCase?.comparisonTags?.includes(tag));
  const focusTags = sharedTags.length > 0
    ? sharedTags
    : (firstCase?.comparisonTags || []).slice(0, 2);
  const label = focusTags.length > 0
    ? focusTags.map(getBureauTagLabel).join(' and ')
    : 'historical evidence';

  return {
    title: `${firstCase?.caseTitle || 'Case 1'} + ${secondCase?.caseTitle || 'Case 2'}`,
    question: `What theme links ${firstCase?.caseTitle || 'the first case'} and ${secondCase?.caseTitle || 'the second case'}?`,
    options: [
      `Both cases show ${label}.`,
      'Both cases prove the same civilisation owned every clue.',
      'Both cases are modern and not ancient.',
      'Both cases only tell us about weather.',
    ],
    correctAnswer: 0,
    explanation: `Both cases connect through ${label}. Historians compare evidence to notice patterns across different discoveries.`,
  };
};

export const createBureauComparisonChallenge = (caseResults = []) => {
  const solvedCases = caseResults
    .map(result => BUREAU_CASES_BY_ID.get(result.caseId))
    .filter(Boolean);
  const secondLast = solvedCases[solvedCases.length - 2] ?? null;
  const last = solvedCases[solvedCases.length - 1] ?? null;
  return buildBureauComparisonChallenge(secondLast, last);
};

export function BureauMode({ bureauState, setBureauState, onBackToMenu, audioControls = {} }) {
  const { playWin, initAudio } = audioControls;
  const didCelebrateRef = useRef(false);
  const [selectedResearchCivilisation, setSelectedResearchCivilisation] = useState(null);
  const [isMakingClaim, setIsMakingClaim] = useState(false);
  const [showArchivedSuspects, setShowArchivedSuspects] = useState(false);
  
  const totalCases = BUREAU_CASES.length;
  const currentCase = BUREAU_CASES[bureauState.caseIndex] || null;
  const currentComparison = bureauState.phase === 'bureauComparison'
    ? createBureauComparisonChallenge(bureauState.caseResults)
    : null;
  const solvedCaseCount = bureauState.caseResults.length;
  const needsComparison = solvedCaseCount > 0 && solvedCaseCount % 2 === 0;
  const latestOutcome = bureauState.latestOutcome;
  const researchFocus = selectedResearchCivilisation
    ? BUREAU_RESEARCH_FOCUS[selectedResearchCivilisation] || null
    : null;
  const evidenceFilter = bureauState.evidenceFilter || createInitialBureauEvidenceFilter();
  const caseCivilisationOptions = getBureauCivilisationOptions(currentCase);
  const selectedClaimCivilisation = bureauState.selectedClaimCivilisation
    || (bureauState.selectedAnswerIndex !== null ? caseCivilisationOptions[bureauState.selectedAnswerIndex] : '')
    || '';
    
  const currentEvidenceText = [
    currentCase?.tier1SiteClue && { label: 'Clue 1: Place', text: currentCase.tier1SiteClue, tier: 1 },
    bureauState.currentTier >= 2 && currentCase?.tier2SocietyClue && { label: 'Clue 2: People', text: currentCase.tier2SocietyClue, tier: 2 },
    bureauState.currentTier >= 3 && currentCase?.tier3LegacyClue && { label: 'Clue 3: What they left behind', text: currentCase.tier3LegacyClue, tier: 3 },
  ].filter(Boolean);
  
  const availableClaimPoints = Math.max(0, 4 - bureauState.currentTier);
  const activeSuspects = BUREAU_CIVILISATIONS.filter(civilisation => (evidenceFilter[civilisation] || 'unsure') !== 'discard');
  const archivedSuspects = BUREAU_CIVILISATIONS.filter(civilisation => (evidenceFilter[civilisation] || 'unsure') === 'discard');

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
    const answerIndex = caseCivilisationOptions.indexOf(civilisation);
    setBureauState(prev => ({
      ...prev,
      selectedClaimCivilisation: civilisation,
      selectedAnswerIndex: answerIndex >= 0 ? answerIndex : null,
    }));
  };

  const toggleSuspectArchive = (civilisation) => {
    const currentStatus = evidenceFilter[civilisation] || 'unsure';
    setEvidenceFilterStatus(civilisation, currentStatus === 'discard' ? 'unsure' : 'discard');
  };

  const revealNextClue = () => {
    if (!currentCase || bureauState.currentTier >= 3) return;
    setIsMakingClaim(false);
    const nextTier = Math.min(3, bureauState.currentTier + 1);
    updateState({
      currentTier: nextTier,
      selectedAnswerIndex: null,
      selectedClaimCivilisation: '',
      latestOutcome: {
        explanation: 'Not yet. That answer does not fit all the clues. Reveal another clue.',
      },
    });
  };

  const startCase = () => {
    setIsMakingClaim(false);
    updateState({
      phase: 'bureauCase',
      ...resetCaseState(),
    });
  };

  const handleSubmitCase = () => {
    if (!currentCase || !selectedClaimCivilisation) return;

    const correctAnswerIndex = getBureauCorrectCivilisationIndex(currentCase);
    const selectedAnswerIndex = caseCivilisationOptions.indexOf(selectedClaimCivilisation);
    const selectedCivilisation = selectedClaimCivilisation;
    const correctCivilisation = getBureauCorrectCivilisationLabel(currentCase);
    const isCorrect = selectedCivilisation === correctCivilisation
      || (selectedAnswerIndex >= 0 && selectedAnswerIndex === correctAnswerIndex);
    const tierPoints = isCorrect ? Math.max(0, 4 - bureauState.currentTier) : 0;
    const nextOutcome = {
      caseId: currentCase.id,
      caseTitle: currentCase.caseTitle,
      civilisation: currentCase.civilisation,
      correctCivilisation,
      selectedCivilisation,
      civilisationCorrect: isCorrect,
      tierSolvedAt: isCorrect ? bureauState.currentTier : null,
      tierPoints,
      chosenAnswerIndex: selectedAnswerIndex >= 0 ? selectedAnswerIndex : null,
      correctAnswerIndex,
      logAnswerIndex: null,
      logPoints: 0,
      logCorrect: false,
      comparisonTags: currentCase.comparisonTags || [],
      explanation: currentCase.explanation,
    };

    if (isCorrect || bureauState.currentTier >= 3) {
      setIsMakingClaim(false);
      setBureauState(prev => ({
        ...prev,
        score: prev.score + tierPoints,
        phase: 'bureauLog',
        selectedLogAnswerIndex: null,
        pendingCaseOutcome: nextOutcome,
        latestOutcome: nextOutcome,
        selectedAnswerIndex: null,
        selectedClaimCivilisation: '',
      }));
      return;
    }

    setBureauState(prev => ({
      ...prev,
      currentTier: Math.min(3, prev.currentTier + 1),
      selectedAnswerIndex: null,
      selectedClaimCivilisation: '',
      latestOutcome: {
        ...nextOutcome,
        explanation: 'Not yet. That answer does not fit all the clues. Reveal another clue.',
      },
    }));
    setIsMakingClaim(false);
  };

  const handleSubmitLog = () => {
    if (!currentCase || bureauState.selectedLogAnswerIndex === null || !bureauState.pendingCaseOutcome) return;

    const logCorrect = bureauState.selectedLogAnswerIndex === currentCase.correctHistorianLogAnswer;
    const logPoints = logCorrect ? 1 : 0;
    const completedCase = {
      ...bureauState.pendingCaseOutcome,
      logAnswerIndex: bureauState.selectedLogAnswerIndex,
      logCorrect,
      logPoints,
    };

    setBureauState(prev => ({
      ...prev,
      score: prev.score + logPoints,
      caseResults: [...prev.caseResults, completedCase],
      latestOutcome: completedCase,
      pendingCaseOutcome: null,
      selectedLogAnswerIndex: null,
      phase: 'bureauFeedback',
    }));
  };

  const handleContinueFromFeedback = () => {
    if (needsComparison) {
      setBureauState(prev => ({
        ...prev,
        phase: 'bureauComparison',
        selectedComparisonAnswerIndex: null,
        comparisonResult: null,
      }));
      return;
    }

    if (bureauState.caseIndex + 1 < totalCases) {
      setIsMakingClaim(false);
      setBureauState(prev => ({
        ...prev,
        phase: 'bureauCase',
        caseIndex: prev.caseIndex + 1,
        ...resetCaseState(),
      }));
      return;
    }

    updateState({ phase: 'bureauResults' });
  };

  const handleSubmitComparison = () => {
    if (!currentComparison || bureauState.selectedComparisonAnswerIndex === null) return;
    const isCorrect = bureauState.selectedComparisonAnswerIndex === currentComparison.correctAnswer;
    const comparisonPoints = isCorrect ? 2 : 0;
    const result = {
      title: currentComparison.title,
      selectedAnswerIndex: bureauState.selectedComparisonAnswerIndex,
      correct: isCorrect,
      points: comparisonPoints,
      explanation: currentComparison.explanation,
    };

    setBureauState(prev => ({
      ...prev,
      score: prev.score + comparisonPoints,
      comparisonResults: [
        ...prev.comparisonResults,
        result,
      ],
      comparisonResult: result,
      latestOutcome: result,
    }));
  };

  const handleContinueAfterComparison = () => {
    if (bureauState.caseIndex + 1 < totalCases) {
      setIsMakingClaim(false);
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
    setSelectedResearchCivilisation(null);
    setIsMakingClaim(false);
    setBureauState(createNewBureauSession('bureauBriefing'));
  };

  const openResearchChoice = () => {
    setSelectedResearchCivilisation(null);
    setBureauState(prev => ({
      ...prev,
      phase: 'bureauResearchChoice',
    }));
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
                <h2>Final Identification</h2>
              </div>
              <div className="bureau-simple-points">
                {bureauState.currentTier < 3 ? `Guess now: ${availableClaimPoints} points` : 'Final guess: 1 point'}
              </div>
            </div>

            <p className="bureau-case-instruction">
              Which civilisation do the clues point to?
            </p>

            <div className="bureau-claim-evidence-reminder">
              <strong>Current clue:</strong>
              <span>{currentEvidenceText[currentEvidenceText.length - 1]?.text || 'Review the clues before you submit your guess.'}</span>
            </div>

            <div className="bureau-answer-grid bureau-focused-answer-grid">
              {caseCivilisationOptions.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  className={`bureau-answer-btn bureau-focused-answer ${selectedClaimCivilisation === option ? 'selected' : ''}`}
                  onClick={() => selectClaimCivilisation(option)}
                  aria-pressed={selectedClaimCivilisation === option}
                >
                  <span className="bureau-answer-index">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>

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
                  disabled={!selectedClaimCivilisation}
                >
                  Submit Guess
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setIsMakingClaim(false);
                    updateState({ selectedAnswerIndex: null, selectedClaimCivilisation: '' });
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
              </div>
              <div className="bureau-case-meta">
                <div className="bureau-score-badge">
                  <span className="bureau-score-label">CURRENT SCORE</span>
                  <span className="bureau-score-value">{bureauState.score}</span>
                </div>
              </div>
            </div>

            <p className="bureau-case-instruction">
              Read the clues. Remove choices that do not fit. Guess when you are ready.
            </p>

            <div className="bureau-tier-tabs" aria-label="Case file clue tiers">
              {['Site', 'Society', 'Legacy'].map((label, index) => {
                const tierNumber = index + 1;
                const stateClass = bureauState.currentTier === tierNumber
                  ? 'current'
                  : bureauState.currentTier > tierNumber
                    ? 'complete'
                    : 'locked';
                return (
                  <div key={label} className={`bureau-tier-tab bureau-tier-indicator ${stateClass}`}>
                    {`Clue ${tierNumber}`}
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>

            <div className="bureau-evidence-box">
              <div className="bureau-evidence-text-list">
                {currentEvidenceText.map((item) => (
                  <div key={item.tier} className="bureau-evidence-text">
                    <strong>{item.label}</strong>
                    <p>{item.text}</p>
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
                  Make a Guess
                </button>
                {bureauState.currentTier < 3 && (
                  <button type="button" className="btn" onClick={revealNextClue}>
                    Reveal Clue {bureauState.currentTier + 1}
                  </button>
                )}
                <span className="bureau-simple-points">
                  {bureauState.currentTier < 3 ? `Guess now: ${availableClaimPoints} points` : 'Final guess: 1 point'}
                </span>
              </div>
              <button type="button" className="btn" onClick={onBackToMenu}>
                Back to Main Menu
              </button>
            </div>
          </article>

          <aside className="bureau-suspect-board glass-card">
            <div className="bureau-suspect-header">
              <h2>🕵️‍♂️ Possible Civilisations</h2>
              <p>Eliminate suspects as you analyze the evidence. Archiving a case removes it from the board.</p>
            </div>

            <div className="bureau-suspect-grid">
              {activeSuspects.map((civilisation) => {
                const status = evidenceFilter[civilisation] || 'unsure';
                return (
                  <article 
                    key={civilisation} 
                    className={`bureau-suspect-card status-${status}`}
                    onClick={() => setEvidenceFilterStatus(civilisation, 'keep')}
                  >
                    <div className="bureau-suspect-icon-box">
                       <Landmark size={24} />
                    </div>
                    <div className="bureau-suspect-name">
                      {civilisation}
                    </div>
                    <button
                      type="button"
                      className="bureau-suspect-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSuspectArchive(civilisation);
                      }}
                      title="Archive Suspect"
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="bureau-archived-suspects">
              <button
                type="button"
                className="btn bureau-filter-toggle"
                onClick={() => setShowArchivedSuspects(prev => !prev)}
              >
                {showArchivedSuspects ? 'Hide removed civilisations' : `Removed civilisations (${archivedSuspects.length})`}
              </button>

              {showArchivedSuspects && (
                <div className="bureau-archived-list">
                  {archivedSuspects.length === 0 ? (
                    <p>No civilisations removed yet.</p>
                  ) : (
                    archivedSuspects.map(civilisation => (
                      <div key={civilisation} className="bureau-archived-row">
                        <span>{civilisation}</span>
                        <button
                          type="button"
                          className="bureau-evidence-chip"
                          onClick={() => toggleSuspectArchive(civilisation)}
                        >
                          Bring back
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
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
          <h2>Evidence Audit</h2>
          <p>Historians explain how they know something. Choose the clue that best supports your answer.</p>
          <p>{currentCase?.historianLogQuestion || 'Which clue was the strongest evidence?'}</p>

          <div className="bureau-answer-grid bureau-log-grid">
            {(currentCase?.historianLogOptions || []).map((option, index) => (
              <button
                key={option}
                type="button"
                className={`bureau-answer-btn ${bureauState.selectedLogAnswerIndex === index ? 'selected' : ''}`}
                onClick={() => updateState({ selectedLogAnswerIndex: index })}
              >
                <span className="bureau-answer-index">{String.fromCharCode(65 + index)}</span>
                <span>{option}</span>
              </button>
            ))}
          </div>

          <div className="bureau-case-actions">
            <button
              type="button"
              className="btn primary-btn"
              onClick={handleSubmitLog}
              disabled={bureauState.selectedLogAnswerIndex === null}
            >
              Submit Log
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
    const logPoints = outcome.logPoints || 0;
    const feedbackText = outcome.logCorrect
      ? 'Good thinking. You chose the strongest clue.'
      : 'Good try. This clue was useful, but it was not the strongest one.';
    const civilisationText = civilisationCorrect
      ? `Correct. The clues point to ${outcome.correctCivilisation || outcome.civilisation || 'the civilisation'}.`
      : `Not quite. The correct civilisation was ${outcome.correctCivilisation || outcome.civilisation || 'unknown'}.`;

    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-feedback glass-card">
          <div className="training-kicker">Intelligence Report - Case #{bureauState.caseIndex + 1}</div>
          <h2>Review & Outcome</h2>
          <p>{civilisationCorrect ? feedbackText : civilisationText}</p>

          <div className="bureau-feedback-grid">
            <div className="bureau-feedback-card">
              <strong>Guess</strong>
              <span>{civilisationCorrect ? `Solved at Clue ${solvedAt}` : 'Not quite'}</span>
              <span>{tierPoints} point{tierPoints === 1 ? '' : 's'}</span>
            </div>
            <div className="bureau-feedback-card">
              <strong>Historian&apos;s Log</strong>
              <span>{logPoints > 0 ? 'Correct clue' : 'Needs more evidence'}</span>
              <span>{logPoints} points</span>
            </div>
            <div className="bureau-feedback-card">
              <strong>Total so far</strong>
              <span>{bureauState.score} points</span>
              <span>{solvedCaseCount} case{solvedCaseCount === 1 ? '' : 's'} solved</span>
            </div>
          </div>

          <div className="bureau-feedback-note">
            {outcome.explanation || 'Use the next case to keep building your thinking.'}
          </div>

          <div className="bureau-case-actions">
            <button type="button" className="btn primary-btn" onClick={handleContinueFromFeedback}>
              {needsComparison ? 'Compare Two Civilisations' : (bureauState.caseIndex + 1 < totalCases ? 'Next Case' : 'View Results')}
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
    const challenge = currentComparison;
    const comparisonResult = bureauState.comparisonResult;

    return (
      <section className="phase-container bureau-phase">
        <div className="bureau-comparison glass-card">
          <div className="training-kicker">Comparative Analysis</div>
          <h2>Cross-Case Examination</h2>
          <p>{challenge?.question || 'What was similar about these two civilisations?'}</p>

          <div className="bureau-answer-grid bureau-comparison-grid">
            {(challenge?.options || []).map((option, index) => (
              <button
                key={option}
                type="button"
                className={`bureau-answer-btn ${bureauState.selectedComparisonAnswerIndex === index ? 'selected' : ''}`}
                onClick={() => updateState({ selectedComparisonAnswerIndex: index })}
              >
                <span className="bureau-answer-index">{String.fromCharCode(65 + index)}</span>
                <span>{option}</span>
              </button>
            ))}
          </div>

          {comparisonResult && (
            <div className="bureau-feedback-note">
              {comparisonResult.correct
                ? `Correct. +${comparisonResult.points} points. ${comparisonResult.explanation || ''}`
                : `Not quite. ${comparisonResult.explanation || 'Try to compare the evidence more carefully.'}`}
            </div>
          )}

          <div className="bureau-case-actions">
            {!comparisonResult ? (
              <button
                type="button"
                className="btn primary-btn"
                onClick={handleSubmitComparison}
                disabled={bureauState.selectedComparisonAnswerIndex === null}
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                className="btn primary-btn"
                onClick={handleContinueAfterComparison}
              >
                {bureauState.caseIndex + 1 < totalCases ? 'Next Case' : 'View Results'}
              </button>
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
    const isResearchChoice = bureauState.phase === 'bureauResearchChoice';
    const totalTierPoints = bureauState.caseResults.reduce((acc, curr) => acc + (curr.tierPoints || 0), 0);
    const totalLogPoints = bureauState.caseResults.reduce((acc, curr) => acc + (curr.logPoints || 0), 0);
    const totalComparisonPoints = bureauState.caseResults.reduce((acc, curr) => acc + (curr.comparisonPoints || 0), 0);

    return (
      <section className="phase-container bureau-theme-dispatch">
        <div className="bureau-document">
          <button type="button" className="print-dispatch-btn" onClick={() => window.print()}>
            PRINT DISPATCH
          </button>
          
          <div className="bureau-stamp">
            Official<br />Bureau<br />Record
          </div>

          <header className="bureau-header">
            <div className="training-kicker">Year 7 HASS Research Dispatch</div>
            <p>Official Record of Findings</p>
          </header>

          <div className="bureau-meta-grid">
            <div className="bureau-field">
              <span className="bureau-label">Junior Historian Name</span>
              <div className="bureau-input-line">________________________________</div>
            </div>
            <div className="bureau-field">
              <span className="bureau-label">Date of Investigation</span>
              <div className="bureau-input-line">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="bureau-field" style={{ gridColumn: 'span 2' }}>
              <span className="bureau-label">Chosen Ancient Civilisation for Research</span>
              <div className="bureau-input-line">{selectedResearchCivilisation || '________________________________'}</div>
            </div>
          </div>

          {!isResearchChoice ? (
            <>
              <div className="bureau-section">
                <div className="bureau-section-header">
                  <h2>Investigation Results Summary</h2>
                </div>
                <div className="bureau-results-summary-box">
                  <div className="bureau-results-stat">
                    <span className="bureau-stat-label">Cases</span>
                    <span className="bureau-stat-value">{bureauState.caseResults.length}</span>
                  </div>
                  <div className="bureau-results-stat">
                    <span className="bureau-stat-label">Correct</span>
                    <span className="bureau-stat-value">{totalTierPoints} pts</span>
                  </div>
                  <div className="bureau-results-stat">
                    <span className="bureau-stat-label">Log</span>
                    <span className="bureau-stat-value">{totalLogPoints} pts</span>
                  </div>
                  <div className="bureau-results-stat">
                    <span className="bureau-stat-label">Total</span>
                    <span className="bureau-stat-value">{bureauState.score} pts</span>
                  </div>
                </div>
              </div>

              <div className="bureau-section">
                <div className="bureau-section-header">
                  <h2>Case File Breakdown</h2>
                </div>
                <div className="bureau-results-list">
                  {bureauState.caseResults.map((result, index) => (
                    <article key={result.caseId} className="bureau-results-item" style={{ border: 'none', borderBottom: '1px solid var(--bureau-border)', borderRadius: 0, padding: '0.75rem 0' }}>
                      <div>
                        <strong>Case {index + 1}: {result.caseTitle}</strong>
                        <p style={{ color: '#666' }}>{result.civilisationCorrect ? `Correct guess: ${result.correctCivilisation}` : `Best guess: ${result.correctCivilisation}`}</p>
                      </div>
                      <div className="bureau-results-item-points">
                        <strong style={{ color: 'var(--bureau-gold)' }}>{(result.tierPoints || 0) + (result.logPoints || 0)} pts</strong>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="bureau-action-row">
                <button type="button" className="btn primary-btn" onClick={openResearchChoice}>
                  Enter Research Phase
                </button>
                <button type="button" className="btn" onClick={onBackToMenu}>
                  Return to Menu
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bureau-section">
                <div className="bureau-section-header">
                  <h2>I. Research Focus (Shopping List)</h2>
                </div>
                <p className="bureau-instruction">List the key geographical features, social structures, or legacies you need to find in your booklet:</p>
                <div className="bureau-content-box">
                  {researchFocus ? (
                    <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                      {researchFocus.lookFor.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  ) : (
                    <p style={{ color: '#999' }}>Select a civilisation below to populate focus areas.</p>
                  )}
                </div>
              </div>

              <div className="bureau-section">
                <div className="bureau-section-header">
                  <h2>II. Core Inquiry Question</h2>
                </div>
                <div className="bureau-content-box" style={{ minHeight: 'auto', textAlign: 'center', fontStyle: 'italic', fontSize: '1.2rem', padding: '2rem' }}>
                  {researchFocus ? `"${researchFocus.inquiryQuestion}"` : '"Select a civilisation to reveal your inquiry question..."'}
                </div>
              </div>

              <div className="bureau-section">
                <div className="bureau-section-header">
                  <h2>III. Investigative Reflection</h2>
                </div>
                <div className="bureau-reflection-grid">
                  <div className="bureau-field">
                    <span className="bureau-label">Most Helpful Evidence Type</span>
                    <div className="bureau-content-box" style={{ minHeight: '100px' }}></div>
                  </div>
                  <div className="bureau-field">
                    <span className="bureau-label">Strategy: Early Guess or Patient Analysis?</span>
                    <div className="bureau-content-box" style={{ minHeight: '100px' }}></div>
                  </div>
                </div>
              </div>

              <div className="bureau-section">
                <div className="bureau-section-header">
                  <h2>IV. Bureau Verification</h2>
                </div>
                <p style={{ fontSize: '0.85rem', marginBottom: '2rem' }}>
                  I confirm that the above civilisation has been selected based on digital archive patterns and that I am ready to begin my deep-dive research in the Physical Booklet.
                </p>
                <div className="bureau-reflection-grid">
                  <div className="bureau-field">
                    <span className="bureau-label">Historian Signature</span>
                    <div className="bureau-input-line"></div>
                  </div>
                  <div className="bureau-field">
                    <span className="bureau-label">Bureau Witness (Teacher)</span>
                    <div className="bureau-input-line"></div>
                  </div>
                </div>
              </div>

              <div className="bureau-target-selection hide-on-print">
                <p style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 700, fontFamily: 'Cinzel, serif', color: 'var(--bureau-gold)' }}>Select your target civilisation:</p>
                <div className="bureau-research-grid">
                  {BUREAU_CASES.map((bureauCase, index) => (
                    <button
                      key={bureauCase.id}
                      type="button"
                      className={`bureau-research-option ${selectedResearchCivilisation === bureauCase.civilisation ? 'selected' : ''}`}
                      onClick={() => setSelectedResearchCivilisation(bureauCase.civilisation)}
                    >
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {bureauCase.civilisation}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bureau-action-row hide-on-print">
                <button type="button" className="btn" onClick={() => setBureauState(prev => ({ ...prev, phase: 'bureauResults' }))}>
                  Back to Results
                </button>
                <button type="button" className="btn" onClick={onBackToMenu}>
                  Finish & Exit
                </button>
              </div>
            </>
          )}

          <footer className="bureau-footer">
            BUREAU FORM 7-HASS | YEAR 7 HISTORY | ARCHAEOLOGY DIG APP INTEGRATION
          </footer>
        </div>
      </section>
    );
  }

  return null;
}
