import { useState } from 'react';
import { Pickaxe, MapPin, FileText, Dice5, ChevronLeft, Compass } from 'lucide-react';
import { SCENARIOS } from '../data';
import { WorldMap } from './WorldMap';


const getSavedModeLabel = (mode) => (mode === 'bureau' ? 'Bureau case' : 'Investigation');
const getResumeLabel = (mode) => (mode === 'bureau' ? 'Resume Bureau' : 'Resume Investigation');

export function ActivityMenu({ 
  onStartInvestigation, 
  onStartTraining, 
  onStartBureau, 
  onStartExpedition,
  savedGames, 
  onResumeInvestigation, 
  onResumeBureau 
}) {
  const [showCivSelection, setShowCivSelection] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const hasSavedInvestigation = savedGames?.archaeology && savedGames.archaeology.phase !== 'menu';
  const hasSavedBureau = savedGames?.bureau;

  if (showCivSelection) {
    return (
      <section className="phase-container menu-phase selection-view">
        <div className="menu-hero glass-card">
          <button 
            className="back-to-modes-btn" 
            onClick={() => setShowCivSelection(false)}
          >
            <ChevronLeft size={16} /> Back to Missions
          </button>
          <div className="training-kicker">Expedition Logistics</div>
          <h2 className="premium-text-glow">Interactive Expedition Map</h2>
          <p>Deploy your team to a specific global site to begin your archaeological inquiry.</p>
        </div>

        <div className="selection-layout">
          <div className="selection-map-area">
            <WorldMap 
              onSelect={onStartInvestigation} 
              activeId={hoveredId} 
              onHover={setHoveredId}
            />
          </div>

          <div className="selection-sidebar glass-card">
            <div className="sidebar-header">
              <h3>Available Sites</h3>
              <button 
                className="btn secondary-btn btn-sm"
                onClick={() => onStartInvestigation(null)}
              >
                <Dice5 size={14} /> Random
              </button>
            </div>
            <div className="sidebar-list">
              {SCENARIOS && SCENARIOS.map(civ => (
                <button 
                  key={civ.id}
                  className={`sidebar-civ-item ${hoveredId === civ.id ? 'active' : ''}`}
                  onClick={() => onStartInvestigation(civ.id)}
                  onMouseEnter={() => setHoveredId(civ.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="civ-item-info">
                    <span className="civ-item-name">{civ.name}</span>
                    <span className="civ-item-tag">{civ.civilization}</span>
                  </div>
                  <ChevronLeft className="rotate-180" size={14} />
                </button>
              ))}
            </div>
          </div>
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

      <div className="activity-menu-grid" aria-label="Choose an activity">
        {/* Basic Training */}
        <article className="activity-card activity-card--training glass-card">
          <div className="activity-card-header">
            <div className="activity-card-icon activity-card-icon--training">
              <MapPin size={24} />
            </div>
            <div className="activity-time-tag">5-10 MINS | PRACTICE</div>
          </div>
          <div className="activity-card-copy">
            <h3>Archaeologist Training</h3>
            <p>Practise the five core investigation steps in isolation.</p>
          </div>
          <div className="activity-card-actions activity-card-button-group">
            <button type="button" className="btn primary-btn activity-card-action" onClick={onStartTraining}>
              Start Training
            </button>
          </div>
        </article>

        {/* Full Investigation */}
        <article className={`activity-card activity-card--investigation glass-card ${hasSavedInvestigation ? 'has-save' : ''}`}>
          <div className="activity-card-header">
            <div className="activity-card-icon activity-card-icon--investigation">
              <Pickaxe size={24} />
            </div>
            <div className="activity-time-tag">45-60 MINS | SITE MISSION</div>
          </div>
          <div className="activity-card-copy">
            <h3>Full Investigation</h3>
            <p>Recover finds, sort evidence, and build a museum display.</p>
          </div>
          <div className="activity-card-actions activity-card-button-group">
            <button 
              type="button" 
              className={`btn primary-btn activity-card-action ${hasSavedInvestigation ? 'pulse-btn' : ''}`} 
            onClick={hasSavedInvestigation ? onResumeInvestigation : () => setShowCivSelection(true)}
          >
              {hasSavedInvestigation ? 'Resume Investigation' : 'Start Investigation'}
            </button>
            {hasSavedInvestigation && (
              <button type="button" className="btn secondary-btn activity-card-action" onClick={() => setShowCivSelection(true)}>
                Start New Investigation
              </button>
            )}
          </div>
        </article>

        {/* Antiquities Bureau */}
        <article className={`activity-card activity-card--bureau glass-card ${hasSavedBureau ? 'has-save' : ''}`}>
          <div className="activity-card-header">
            <div className="activity-card-icon activity-card-icon--bureau">
              <FileText size={24} />
            </div>
            <div className="activity-time-tag">15-20 MINS | DEDUCTION</div>
          </div>
          <div className="activity-card-copy">
            <h3>Antiquities Bureau</h3>
            <p>Solve high-stakes civilisation cases using evidence clues.</p>
          </div>
          <div className="activity-card-actions activity-card-button-group">
            <button 
              type="button" 
              className={`btn primary-btn activity-card-action ${hasSavedBureau ? 'pulse-btn' : ''}`} 
            onClick={hasSavedBureau ? onResumeBureau : onStartBureau}
          >
              {hasSavedBureau ? 'Resume Bureau' : 'Start Bureau'}
            </button>
            {hasSavedBureau && (
              <button type="button" className="btn secondary-btn activity-card-action" onClick={onStartBureau}>
                Start New Bureau
              </button>
            )}
          </div>
        </article>

        {/* Lost Site Expedition */}
        <article className="activity-card activity-card--expedition glass-card">
          <div className="activity-card-header">
            <div className="activity-card-icon activity-card-icon--expedition">
              <Compass size={24} />
            </div>
            <div className="activity-time-tag">10-15 MINS | SOLO ADVENTURE</div>
          </div>
          <div className="activity-card-copy">
            <h3>Lost Site Expedition</h3>
            <p>Explore ruins, navigate hazards, and identify the lost civilisation.</p>
          </div>
          <div className="activity-card-actions activity-card-button-group">
            <button type="button" className="btn primary-btn activity-card-action" onClick={onStartExpedition}>
              Start Expedition
            </button>
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
          Saved {getSavedModeLabel(savedGame.mode)}:{' '}
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
          {getResumeLabel(savedGame.mode)}
        </button>
      </div>
    </section>
  );
}
