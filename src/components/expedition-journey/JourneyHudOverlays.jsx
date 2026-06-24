import {
  Backpack,
  CheckCircle2,
  Flag,
  Map,
  ShieldAlert,
} from 'lucide-react';

import { JourneyControlsReference } from './journeyControlsReference.jsx';

// Expedition HUD glyphs — period iconography in place of stock UI icons so the
// overlay reads as part of the dig, not a debug layer.
const ShardGlyph = () => (
  <svg viewBox="0 0 12 14" aria-hidden="true" focusable="false">
    <path d="M6 0.8 L11.2 4.8 L8.4 13.2 L3.6 13.2 L0.8 4.8 Z" fill="currentColor" />
    <path d="M6 0.8 L6 13.2 M0.8 4.8 L11.2 4.8" stroke="rgba(61, 42, 16, 0.35)" strokeWidth="0.8" fill="none" />
  </svg>
);

const HorusEyeGlyph = () => (
  <svg viewBox="0 0 16 12" aria-hidden="true" focusable="false">
    <path d="M1 5.2 Q8 -0.6 15 5.2 Q8 11 1 5.2 Z" fill="none" stroke="currentColor" strokeWidth="1.1" />
    <circle cx="8" cy="5.2" r="2.1" fill="currentColor" />
    <path d="M11.4 7.6 Q12.6 10 14.8 10.4" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M5.4 7.8 L4.6 10.6" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const AnkhGlyph = () => (
  <svg viewBox="0 0 12 16" aria-hidden="true" focusable="false">
    <path d="M6 1.1c1.8 0 3.2 1.4 3.2 3 0 1.4-1 2.8-1.9 3.7h2.9v1.7H7v5.4H5V9.5H1.8V7.8h2.9C3.8 6.9 2.8 5.5 2.8 4.1c0-1.6 1.4-3 3.2-3Zm0 1.6c-.9 0-1.6.7-1.6 1.5 0 .9.8 2 1.6 2.8.8-.8 1.6-1.9 1.6-2.8 0-.8-.7-1.5-1.6-1.5Z" fill="currentColor" />
  </svg>
);

const SunDiscGlyph = () => (
  <svg viewBox="0 0 18 10" aria-hidden="true" focusable="false">
    <circle cx="9" cy="4.6" r="3" fill="currentColor" />
    <path d="M1 6.4 Q5 2.6 7.2 5 M17 6.4 Q13 2.6 10.8 5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export function JourneySidebarStatus({
  JOURNEY_TOOLS,
  gameState,
  getSectionDisplayName,
  RELIC_SHARDS,
  UPGRADES,
  getActiveHiddenRoutes,
  getActiveSecretCollectibles,
  restoredSacredRoomCount,
  sacredRoomEvidenceRows,
  BOSS_KEY_ITEMS,
  activeHudGateGuidance,
}) {
  return (
        <div className="expedition-sidebar">
          <div className="expedition-panel inventory-panel">
            <h3 className="section-title"><Backpack size={16} /> Field Kit: Excavation Prep</h3>
            <ul className="expedition-tool-list">
              {JOURNEY_TOOLS.map(t => (
                <li key={t.id} className={gameState.collectedToolIds.has(t.id) ? 'is-collected' : ''}>
                  <span>{t.emoji} {t.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="expedition-panel objective-panel">
            <h3 className="section-title"><Map size={16} /> Status</h3>
            <div className="current-section-badge">
              {getSectionDisplayName(gameState.currentSectionId) || 'Surveying'}
            </div>
            <div className="objective-progress">
              <div>Relic shards recovered: {gameState.relicShardCount} / {RELIC_SHARDS.length}</div>
              <div>Upgrades: {gameState.collectedUpgrades.size} / {UPGRADES.length}</div>
              <div>Hidden Routes: {gameState.discoveredHiddenRouteIds?.size || 0} / {getActiveHiddenRoutes().length}</div>
              <div>Secrets: {gameState.collectedSecretIds?.size || 0} / {getActiveSecretCollectibles().length}</div>
            </div>
            <div className="journey-sacred-evidence" aria-label="Sacred room evidence">
              <div className="journey-sacred-evidence-title">
                <span>Sacred room evidence</span>
                <strong>{restoredSacredRoomCount}/{sacredRoomEvidenceRows.length}</strong>
              </div>
              <p>Anubis judges restored evidence, not promises.</p>
              <div className="journey-sacred-evidence-list">
                {sacredRoomEvidenceRows.map(row => (
                  <div key={row.setId} className={`journey-sacred-evidence-row ${row.restored ? 'is-restored' : ''}`}>
                    <span>{row.label}</span>
                    <strong>{row.recoveredCount}/{row.requiredCount}</strong>
                    <em>{row.restored ? 'Restored' : row.clue}</em>
                  </div>
                ))}
              </div>
            </div>
            <div className="journey-key-items" aria-label="Recovered excavation kit pieces">
              <div className="journey-key-items-title">Excavation Kit Pieces</div>
              {BOSS_KEY_ITEMS.map(item => {
                const recovered = gameState.collectedBossKeyIds?.has(item.id)
                  || gameState.bossKeyItems?.some(keyItem => keyItem.id === item.id && keyItem.collected);
                return (
                  <div key={item.id} className={`journey-key-item ${recovered ? 'is-collected' : ''}`}>
                    <span className="journey-key-mark">{item.label}</span>
                    <span>{item.name}</span>
                  </div>
                );
              })}
            </div>
            {activeHudGateGuidance && (
              <div className={`route-gate-hud ${activeHudGateGuidance.activeGateLocked ? 'is-locked' : 'is-ready'}`}>
                <div className="route-gate-hud-title">
                  {activeHudGateGuidance.activeGateName}
                </div>
                <ul className="route-gate-checklist">
                  {activeHudGateGuidance.gateRequirements.map(req => (
                    <li key={`${req.type}-${req.id}`} className={req.met ? 'is-met' : 'is-missing'}>
                      <span aria-hidden="true">{req.met ? '✓' : '○'}</span>
                      <span>{req.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="route-gate-hint">
                  {activeHudGateGuidance.gateHint}
                </p>
              </div>
            )}
          </div>
        </div>
  );
}

export function JourneyPlayerOverlays({
  openingCinematicActive,
  gameState,
  restoredSacredRoomCount,
  sacredRoomEvidenceRows,
  activeSacredRoomEvidence,
  getSectionDisplayName,
  toggleEnemyPlaytestAssist,
  staminaWarningState,
  staminaPercent,
  timeWarningState,
  timePercent,
  heavyFollowupPromptActive,
  PLAYER_HEAVY_FOLLOWUP_PROMPT_LABEL,
  bossDomainHudSuppressed,
  activeHudGateGuidance,
  activeHudShardRequirement,
  activeHudFirstMissing,
  RELIC_SHARDS,
  characterLoaderVisible,
  selectedCharacterPresetId,
  setSelectedCharacterPresetId,
  PLAYER_CHARACTER_PRESETS,
  selectedCharacterPreset,
  FORGOTTEN_MURAL_CHAMBER_RESTORATION_IDS,
  FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_ART_SRC,
  forgottenMuralRelicSlidePuzzleTiles,
  getForgottenMuralRelicSlideMove,
  FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_TILE_LABELS,
  moveForgottenMuralRelicSlideTile,
  resetForgottenMuralRelicSlidePuzzle,
  activeGuardianChallenge,
  activeGuardianQuestion,
  answerGuardianChallenge,
  continueGuardianChallenge,
  FIELD_RESCUE_MESSAGE,
  respawnAtCheckpoint,
}) {
  const showDevEnemyPlaytestAssist = import.meta.env.DEV;

  return (
    <>
            {!openingCinematicActive && (
            <div className="journey-floating-hud" aria-label="Expedition status">
              <div className="journey-hud-ledger">
                <div className={`journey-floating-hud-gems ${gameState.itemPurposeNoticeTimer > 0 ? 'is-rewarding' : ''}`}>
                  <ShardGlyph />
                  <strong>{gameState.relicShardCount}</strong>
                  <span>Relic shards</span>
                </div>
                <div className="journey-hud-ledger-divider" aria-hidden="true" />
                <div className="journey-floating-hud-restoration">
                  <HorusEyeGlyph />
                  <span>Evidence</span>
                  <strong>{restoredSacredRoomCount}/{sacredRoomEvidenceRows.length}</strong>
                  <em>
                    {activeSacredRoomEvidence.restored
                      ? 'Rooms restored'
                      : `${activeSacredRoomEvidence.label} ${activeSacredRoomEvidence.recoveredCount}/${activeSacredRoomEvidence.requiredCount}`}
                  </em>
                </div>
                <div className="journey-floating-hud-status">
                  {getSectionDisplayName(gameState.currentSectionId) || 'Surveying'}
                </div>
              </div>

              {showDevEnemyPlaytestAssist && (
                <button
                  type="button"
                  className={`journey-enemy-toggle ${gameState.enemiesDisabled ? 'is-off' : ''}`}
                  onClick={toggleEnemyPlaytestAssist}
                  aria-pressed={gameState.enemiesDisabled}
                  title={gameState.enemiesDisabled ? 'Turn enemies back on' : 'Turn enemies off for bridge play-testing'}
                >
                  <ShieldAlert size={14} />
                  <span>{gameState.enemiesDisabled ? 'Enemies off' : 'Enemies on'}</span>
                </button>
              )}

              <div className="journey-floating-hud-cluster journey-floating-hud-meters">
                <div className={`journey-floating-hud-meter ${staminaWarningState !== 'stable' ? `stamina-alert stamina-${staminaWarningState}` : ''}`}>
                  <div className="journey-floating-hud-meter-label">
                    <AnkhGlyph />
                    <span>Endurance</span>
                  </div>
                  <div className="journey-floating-hud-bar">
                    <div className="journey-floating-hud-fill stamina-fill" style={{ width: `${staminaPercent}%` }} />
                    {gameState.staminaFeedbackTimer > 0 && gameState.lastStaminaDelta < 0 && (
                      <span className="stamina-delta">-{Math.abs(gameState.lastStaminaDelta)}</span>
                    )}
                  </div>
                </div>

                <div className={`journey-floating-hud-meter ${timeWarningState !== 'stable' ? `time-alert time-${timeWarningState}` : ''}`}>
                  <div className="journey-floating-hud-meter-label">
                    <SunDiscGlyph />
                    <span>Time</span>
                  </div>
                  <div className="journey-floating-hud-bar">
                    <div className="journey-floating-hud-fill time-fill" style={{ width: `${timePercent}%` }} />
                  </div>
                </div>
              </div>

              {heavyFollowupPromptActive && (
                <div className="journey-heavy-followup-cue" role="status" aria-live="polite">
                  <kbd>{PLAYER_HEAVY_FOLLOWUP_PROMPT_LABEL}</kbd>
                  <span>Heavy ready</span>
                </div>
              )}

              {!bossDomainHudSuppressed && (
                <div className="journey-floating-hud-cluster journey-floating-hud-count journey-floating-hud-gate">
                  <span>Next seal</span>
                  <strong>{activeHudGateGuidance?.activeGateName || 'Route Seal'}</strong>
                  {activeHudShardRequirement && activeHudShardRequirement.required <= 8 && (
                    <span className="journey-hud-pips" aria-hidden="true">
                      {Array.from({ length: activeHudShardRequirement.required }, (_, pipIndex) => (
                        <i key={pipIndex} className={`journey-hud-pip ${pipIndex < activeHudShardRequirement.found ? 'is-filled' : ''}`} />
                      ))}
                    </span>
                  )}
                  <em>
                    {activeHudShardRequirement
                      ? `${activeHudShardRequirement.found}/${activeHudShardRequirement.required} shards`
                      : `${gameState.relicShardCount}/${RELIC_SHARDS.length} shards`}
                    {activeHudFirstMissing && activeHudFirstMissing.type !== 'shards'
                      ? ` + ${activeHudFirstMissing.checklistLabel}`
                      : ''}
                  </em>
                </div>
              )}
            </div>
            )}

            {characterLoaderVisible && (
              <div className="journey-character-loader" aria-label="Character loader">
                <label htmlFor="journey-character-loader-select">Character Loader</label>
                <select
                  id="journey-character-loader-select"
                  value={selectedCharacterPresetId}
                  onChange={(event) => setSelectedCharacterPresetId(event.target.value)}
                >
                  {PLAYER_CHARACTER_PRESETS.map(preset => (
                    <option key={preset.id} value={preset.id}>{preset.label}</option>
                  ))}
                </select>
                <p>{selectedCharacterPreset.description}</p>
                <small>
                  Ctrl+Alt+C hides or shows this loader. Concept sheets need a sprite atlas first.
                </small>
              </div>
            )}
            
            {gameState.postBossReward && (
              <div
                className={`journey-boss-reward-banner ${gameState.postBossReward.kitComplete ? 'is-complete' : ''}`}
                style={{ '--reward-accent': gameState.postBossReward.color }}
                role="status"
                aria-live="polite"
              >
                <div className="journey-boss-reward-badge" aria-hidden="true">
                  {gameState.postBossReward.itemLabel || 'K'}
                </div>
                <div className="journey-boss-reward-copy">
                  <div className="journey-boss-reward-kicker">
                    {gameState.postBossReward.phase === 'revealed' ? 'Tool piece revealed' : 'Tool piece recovered'}
                  </div>
                  <strong>{gameState.postBossReward.title}</strong>
                  <span>{gameState.postBossReward.detail}</span>
                  <em>{gameState.postBossReward.nextObjective}</em>
                </div>
                <div className="journey-boss-reward-progress">
                  {gameState.postBossReward.progressText}
                </div>
              </div>
            )}

            {gameState.forgottenMuralRelicSlidePuzzleOpen && (
              <div className="forgotten-mural-slide-puzzle-overlay" role="dialog" aria-modal="true" aria-label="Broken relic slide puzzle">
                <div className="forgotten-mural-slide-puzzle-card">
                  <div className="guardian-challenge-kicker">Forgotten Mural Relic</div>
                  <h2>Restore the scarab seal</h2>
                  <p>
                    Slide the rearranged stone cuts until the image tells the right story.
                  </p>
                  <div className="forgotten-mural-slide-puzzle-meta">
                    <span>{FORGOTTEN_MURAL_CHAMBER_RESTORATION_IDS.filter(id => gameState.collectedSecretIds?.has(id)).length}/3 seal cuts placed</span>
                    <span>{gameState.forgottenMuralRelicSlidePuzzleMoves || 0} moves</span>
                  </div>
                  <div
                    className="forgotten-mural-slide-puzzle-grid"
                    style={{
                      '--relic-art-url': `url("${import.meta.env.BASE_URL}${FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_ART_SRC}")`,
                    }}
                    aria-label="Slide puzzle board"
                  >
                    {forgottenMuralRelicSlidePuzzleTiles.map((tile, index) => {
                      const movable = tile !== null && getForgottenMuralRelicSlideMove(forgottenMuralRelicSlidePuzzleTiles, index);
                      const label = tile === null ? 'Empty cut' : FORGOTTEN_MURAL_RELIC_SLIDE_PUZZLE_TILE_LABELS[tile];
                      return (
                        <button
                          type="button"
                          key={`${tile ?? 'empty'}-${index}`}
                          className={[
                            'forgotten-mural-slide-puzzle-tile',
                            tile === null ? 'is-empty' : '',
                            movable ? 'is-movable' : '',
                          ].filter(Boolean).join(' ')}
                          style={tile === null ? undefined : {
                            '--tile-row': Math.floor(tile / 3),
                            '--tile-col': tile % 3,
                            '--tile-bg-x': `${(tile % 3) * 50}%`,
                            '--tile-bg-y': `${Math.floor(tile / 3) * 50}%`,
                          }}
                          onClick={() => moveForgottenMuralRelicSlideTile(index)}
                          disabled={tile === null || !movable}
                          aria-label={tile === null ? 'Empty relic cut' : `Slide ${label}`}
                          title={tile === null ? 'Empty relic cut' : `Slide ${label}`}
                        />
                      );
                    })}
                  </div>
                  <div className="forgotten-mural-slide-puzzle-actions">
                    <button type="button" className="journey-pause-secondary" onClick={resetForgottenMuralRelicSlidePuzzle}>
                      Reset Pieces
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeGuardianChallenge && activeGuardianQuestion && (
              <div className="guardian-challenge-overlay" role="dialog" aria-modal="true" aria-label="Guardian Knowledge Challenge">
                <div className="guardian-challenge-card">
                  <div className="guardian-challenge-kicker">
                    {activeGuardianChallenge.type === 'scribe-chamber-puzzle'
                      ? 'Scribe Chamber Decoding'
                      : activeGuardianChallenge.type === 'mummification-ritual-order-puzzle'
                        ? 'Mummification Ritual Order'
                        : 'Guardian Knowledge Challenge'}
                  </div>
                  <h2>{activeGuardianChallenge.bossName}</h2>
                  <p className="guardian-challenge-intro">
                    {activeGuardianChallenge.intro}
                  </p>
                  <div className="guardian-challenge-progress">
                    Question {activeGuardianChallenge.currentIndex + 1} of {activeGuardianChallenge.questions.length}
                    <span>{activeGuardianChallenge.correctCount} correct</span>
                  </div>
                  <div className="guardian-challenge-question">
                    {activeGuardianQuestion.question}
                  </div>
                  <div className="guardian-challenge-options">
                    {(activeGuardianQuestion.shuffledOptions || activeGuardianQuestion.options.map((text, index) => ({
                      id: `${activeGuardianQuestion.id}-${index}`,
                      text,
                      originalIndex: index,
                    }))).map((option, index) => {
                      const selected = activeGuardianChallenge.selectedAnswerIndex === option.originalIndex;
                      const correct = activeGuardianQuestion.correctIndex === option.originalIndex;
                      const locked = activeGuardianChallenge.selectedAnswerIndex !== null;
                      return (
                        <button
                          type="button"
                          key={option.id}
                          className={[
                            'guardian-challenge-option',
                            selected ? 'is-selected' : '',
                            locked && correct ? 'is-correct' : '',
                            locked && selected && !correct ? 'is-incorrect' : '',
                          ].filter(Boolean).join(' ')}
                          onClick={() => answerGuardianChallenge(option.originalIndex)}
                          disabled={locked}
                        >
                          <strong>{String.fromCharCode(65 + index)}</strong>
                          <span>{option.text}</span>
                        </button>
                      );
                    })}
                  </div>
                  {activeGuardianChallenge.feedback && (
                    <div className={`guardian-challenge-feedback ${activeGuardianChallenge.feedback.correct ? 'is-correct' : 'is-incorrect'}`}>
                      {activeGuardianChallenge.feedback.message}
                    </div>
                  )}
                  {activeGuardianChallenge.completed && (
                    <div className="guardian-challenge-result">
                      {activeGuardianChallenge.resultMessage}
                    </div>
                  )}
                  <div className="guardian-challenge-actions">
                    <button
                      type="button"
                      className="premium-action-btn"
                      onClick={continueGuardianChallenge}
                      disabled={activeGuardianChallenge.selectedAnswerIndex === null}
                    >
                      {activeGuardianChallenge.type === 'scribe-chamber-puzzle'
                        || activeGuardianChallenge.type === 'mummification-ritual-order-puzzle'
                        ? (activeGuardianChallenge.completed ? 'Open Exit' : 'Try Again')
                        : (activeGuardianChallenge.completed ? 'Begin Guardian Fight' : 'Next Question')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {gameState.failed && (
              <div className="expedition-failure-overlay">
                <div className="expedition-panel failure-card">
                  <ShieldAlert size={48} className="text-red-600 mb-4" />
                  <h3 className="cinzel-header">Field Rescue Required</h3>
                  <p>{gameState.failureDetail || FIELD_RESCUE_MESSAGE}</p>
                  {gameState.failureReason && (
                    <span className="failure-reason">{gameState.failureReason}</span>
                  )}
                  <button className="premium-action-btn" onClick={respawnAtCheckpoint}>
                    Retry from Checkpoint
                  </button>
                </div>
              </div>
            )}
    </>
  );
}

export function JourneyBriefingOverlay({
  briefingOpen,
  OPENING_CINEMATIC_ENABLED,
  startOpeningCinematic,
  startJourneyWithoutOpeningScene,
  targetCivilisation = 'Ancient Egypt',
}) {
  const isRomeBriefing = String(targetCivilisation).toLowerCase().includes('rome');
  const briefingCopy = isRomeBriefing
    ? {
        kicker: 'Forum Breach',
        title: 'Ancient Rome',
        intro: 'Asha enters the Via Sacra as a sealed archive stirs below the Forum.',
        tag: 'THE FORUM',
        missionTitle: 'Break the Senate vault',
        missionDesc: 'Cross the Via Sacra, fight through the ruins, recover evidence of Rome\'s shift from Republic to Empire, and force the archive gate open.',
        portraitSrc: 'assets/expedition/player/asha-rome-cutscene-2026-06-24.png',
        portraitAlt: 'Asha ready for the Ancient Rome expedition',
        tasks: [
          'Push through the Via Sacra',
          'Recover tablets, coins, statues, and standards',
          'Fight the Legate\'s guards',
          'Restore the Republic-to-Empire sequence',
          'Open the sealed vault beneath the Forum',
        ],
      }
    : {
        kicker: 'Expedition Arrival',
        title: 'Lost Site Expedition',
        intro: 'Asha reaches a sealed site where the first guardian is already watching.',
        tag: 'SEALED SITE',
        missionTitle: 'The site tests the expedition',
        missionDesc: 'The site won\'t open easily. Read what it still remembers, recover the scattered relics, and outlast the guardians that watch it.',
        portraitSrc: 'assets/expedition/player/asha-reference-warrior-reference.png',
        portraitAlt: 'Asha Explorer',
        tasks: [
          'Find and read the Lost Map Tablet',
          'Collect relic shards along the route',
          'Use shards to open sealed paths',
          'Defeat the first guardian',
          'Reach Base Camp',
        ],
      };

  return (
    <>
      {briefingOpen && (
        <div className="expedition-briefing-overlay">
          <div className="expedition-briefing-card glass-card animate-slide-up">
            <div className="briefing-header">
              <div className="briefing-header-copy">
                <div className="briefing-kicker">
                  <Flag size={16} />
                  {briefingCopy.kicker}
                </div>
                <h1 className="premium-text-glow cinzel-header" style={{ fontSize: "2.5rem", margin: "0.2rem 0" }}>{briefingCopy.title}</h1>
                <p>{briefingCopy.intro}</p>
              </div>
              <div className="briefing-hero-mark" aria-hidden="true">
                <img
                  className="briefing-hero-portrait"
                  src={briefingCopy.portraitSrc}
                  alt={briefingCopy.portraitAlt}
                />
              </div>
            </div>
            <div className="briefing-content">
              <div className="mission-dossier expedition-start-dossier">
                <div className="dossier-tag">{briefingCopy.tag}</div>
                <h2 className="mission-title">{briefingCopy.missionTitle}</h2>
                <p className="mission-desc">
                  {briefingCopy.missionDesc}
                </p>
              </div>
              <div className="briefing-task-panel">
                <div className="briefing-task-heading">
                  <Map size={18} />
                  <h2>What to do first</h2>
                </div>
                <ul className="briefing-task-list">
                  {briefingCopy.tasks.map(task => (
                    <li key={task}>
                      <CheckCircle2 size={16} />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="briefing-task-panel briefing-controls-panel">
                <div className="briefing-task-heading">
                  <ShieldAlert size={18} />
                  <h2>Controls &amp; combat</h2>
                </div>
                <JourneyControlsReference compactMovementKeys />
              </div>
            </div>
            <div className="briefing-actions" style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
              <button
                type="button"
                className="premium-action-btn"
                onClick={OPENING_CINEMATIC_ENABLED ? () => startOpeningCinematic({ speechEnabled: true }) : startJourneyWithoutOpeningScene}
              >
                Begin Expedition
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
