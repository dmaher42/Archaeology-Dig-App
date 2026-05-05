import { useState } from 'react';
import { Pickaxe, MapPin, FileText, Dice5, ChevronLeft } from 'lucide-react';
import { SCENARIOS } from '../data';

export function ActivityMenu({ 
  onStartInvestigation, 
  onStartTraining, 
  onStartBureau, 
  savedGames, 
  onResumeInvestigation, 
  onResumeBureau 
}) {
  const [showCivSelection, setShowCivSelection] = useState(false);
  const hasSavedInvestigation = savedGames?.archaeology && savedGames.archaeology.phase !== 'menu';
  const hasSavedBureau = savedGames?.bureau;

  if (showCivSelection) {
    return (
      <section className="phase-container menu-phase">
        <div className="menu-hero glass-card">
          <button 
            className="back-to-modes-btn" 
            onClick={() => setShowCivSelection(false)}
          >
            <ChevronLeft size={16} /> Back to Missions
          </button>
          <div className="training-kicker">Customise Your Expedition</div>
          <h2>Choose Your Ancient Civilisation</h2>
          <p>Select a specific site to investigate, or let fate decide your destination.</p>
        </div>

        <div className="civ-selection-grid">
          <button 
            className="civ-selection-card random-card glass-card"
            onClick={() => onStartInvestigation(null)}
          >
            <div className="civ-card-icon">
              <Dice5 size={32} />
            </div>
            <div className="civ-card-content">
              <h4>Random Selection</h4>
              <p>Test your skills with a surprise historical mystery.</p>
            </div>
          </button>

          {SCENARIOS && SCENARIOS.map(civ => (
            <button 
              key={civ.id}
              className="civ-selection-card glass-card"
              onClick={() => onStartInvestigation(civ.id)}
            >
              <div className="civ-card-content">
                <h4>{civ.name}</h4>
                <p className="civ-spark-text">"{civ.spark}"</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="phase-container menu-phase">
      <div className="menu-hero glass-card">
        <div className="training-kicker">Welcome back, Historian</div>
        <h2>What are we doing today?</h2>
        <p>Choose an archaeological mission to begin or resume your progress.</p>
      </div>

      <div className="activity-menu-grid">
        <article className={`activity-card glass-card ${hasSavedInvestigation ? 'has-save' : ''}`}>
          <div className="activity-card-header">
            <div className="activity-card-icon activity-card-icon--investigation">
              <Pickaxe size={24} />
            </div>
            <div className="activity-time-tag">45-60 MINS</div>
          </div>
          <div className="activity-card-copy">
            <h3>Full Investigation</h3>
            <p>Recover finds, sort evidence, and build a museum display.</p>
          </div>
          <div className="activity-card-actions">
            {hasSavedInvestigation ? (
              <div className="activity-card-button-group">
                <button type="button" className="btn primary-btn activity-card-action pulse-btn" onClick={onResumeInvestigation}>
                  Resume Mission
                </button>
                <button type="button" className="btn secondary-btn activity-card-action" onClick={() => setShowCivSelection(true)}>
                  Start New Mission
                </button>
              </div>
            ) : (
              <button type="button" className="btn primary-btn activity-card-action" onClick={() => setShowCivSelection(true)}>
                Start New Mission
              </button>
            )}
          </div>
        </article>

        <article className="activity-card glass-card">
          <div className="activity-card-header">
            <div className="activity-card-icon activity-card-icon--training">
              <MapPin size={24} />
            </div>
            <div className="activity-time-tag">5-10 MINS</div>
          </div>
          <div className="activity-card-copy">
            <h3>Basic Training</h3>
            <p>Practise the five core investigation steps in isolation.</p>
          </div>
          <div className="activity-card-actions">
            <button type="button" className="btn primary-btn activity-card-action" onClick={onStartTraining}>
              Start Training
            </button>
          </div>
        </article>

        <article className={`activity-card glass-card ${hasSavedBureau ? 'has-save' : ''}`}>
          <div className="activity-card-header">
            <div className="activity-card-icon activity-card-icon--bureau">
              <FileText size={24} />
            </div>
            <div className="activity-time-tag">15-20 MINS</div>
          </div>
          <div className="activity-card-copy">
            <h3>Antiquities Bureau</h3>
            <p>Solve high-stakes civilisation cases using evidence clues.</p>
          </div>
          <div className="activity-card-actions">
            {hasSavedBureau ? (
              <div className="activity-card-button-group">
                <button type="button" className="btn primary-btn activity-card-action pulse-btn" onClick={onResumeBureau}>
                  Resume Mission
                </button>
                <button type="button" className="btn secondary-btn activity-card-action" onClick={onStartBureau}>
                  Start New Mission
                </button>
              </div>
            ) : (
              <button type="button" className="btn primary-btn activity-card-action" onClick={onStartBureau}>
                Start New Mission
              </button>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

export function ResumeCard({ savedGame, onResume }) {
  if (!savedGame) return null;

  return (
    <section className="menu-resume glass-card">
      <div className="menu-resume-copy">
        <div className="training-kicker">Saved progress found</div>
        <h3>Continue where you left off?</h3>
        <p>
          Saved {savedGame.mode === 'bureau' ? 'Bureau' : 'investigation'} game:{' '}
          <strong>{savedGame.phase === 'bureauBriefing'
            ? 'Bureau Briefing'
            : savedGame.phase === 'bureauCase'
              ? 'Case'
            : savedGame.phase === 'bureauLog'
                ? "Historian's Log"
                : savedGame.phase === 'bureauFeedback'
                  ? 'Case Feedback'
                  : savedGame.phase === 'bureauComparison'
                    ? 'Compare Two Civilisations'
                    : savedGame.phase === 'bureauResults'
                      ? 'Case Work Complete'
                      : savedGame.phase === 'bureauResearchChoice'
                        ? 'Choose Your Civilisation'
                        : savedGame.phase || 'a previous screen'}</strong>
        </p>
      </div>
      <div className="menu-resume-actions">
        <button type="button" className="btn primary-btn" onClick={onResume}>
          {savedGame.mode === 'bureau' ? 'Resume Bureau Game' : 'Resume Investigation Game'}
        </button>
      </div>
    </section>
  );
}
