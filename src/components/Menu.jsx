import { useState } from 'react';
import { Pickaxe, MapPin, FileText, Dice5, ChevronLeft, Compass, Volume2, VolumeX } from 'lucide-react';
import { SCENARIOS } from '../data';
import { WorldMap } from './WorldMap';
import { PLAYER_SPRITE_SRC } from './expedition-journey/journeyConstants';


const getSavedModeLabel = (mode) => (mode === 'bureau' ? 'Bureau case' : 'Investigation');
const getResumeLabel = (mode) => (mode === 'bureau' ? 'Resume Bureau' : 'Resume Investigation');
const SITE_SELECTION_COPY = {
  egypt: {
    location: 'Nile region, northeast Africa',
    hook: 'Engineering and river life along the Nile.',
    focus: 'Investigate engineering, river life and structural evidence along the Nile.',
  },
  mungo: {
    location: 'Southeast Australia',
    hook: 'Ancient remains and landscape evidence.',
    focus: 'Investigate ancient remains, landscape evidence and cultural significance.',
  },
  rome: {
    location: 'Italy and the Mediterranean',
    hook: 'Roads, public works and civic life.',
    focus: 'Investigate roads, public works and civic life.',
  },
  china: {
    location: 'East Asia',
    hook: 'Walls, writing systems and dynastic power.',
    focus: 'Investigate walls, writing systems and dynastic power.',
  },
};

export function ActivityMenu({ 
  onStartInvestigation, 
  onStartTraining, 
  onStartBureau, 
  onStartExpedition,
  savedGames, 
  onResumeInvestigation, 
  onResumeBureau,
  onSiteSelectionChange = () => {},
  expeditionMusicEnabled = false,
  onExpeditionMusicToggle = () => {}
}) {
  const [showCivSelection, setShowCivSelection] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedSiteId, setSelectedSiteId] = useState('egypt');
  const hasSavedInvestigation = savedGames?.archaeology && savedGames.archaeology.phase !== 'menu';
  const hasSavedBureau = savedGames?.bureau;

  const openSiteSelection = () => {
    setShowCivSelection(true);
    onSiteSelectionChange(true);
  };

  const closeSiteSelection = () => {
    setShowCivSelection(false);
    onSiteSelectionChange(false);
  };

  if (showCivSelection) {
    const selectedSite = SCENARIOS?.find(civ => civ.id === selectedSiteId) || SCENARIOS?.[0];
    const selectedCopy = SITE_SELECTION_COPY[selectedSite?.id] || {};
    const displaySiteId = hoveredId || selectedSite?.id;

    return (
      <section className="phase-container menu-phase selection-view">
        <div className="menu-hero glass-card">
          <button 
            className="back-to-modes-btn" 
            onClick={closeSiteSelection}
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
              onSelect={setSelectedSiteId}
              activeId={displaySiteId}
              selectedId={selectedSite?.id}
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
                  className={`sidebar-civ-item ${selectedSiteId === civ.id ? 'selected' : ''} ${hoveredId === civ.id ? 'active' : ''}`}
                  onClick={() => setSelectedSiteId(civ.id)}
                  onMouseEnter={() => setHoveredId(civ.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="civ-item-info">
                    <span className="civ-item-name">{civ.name}</span>
                    <span className="civ-item-tag">{civ.civilization}</span>
                    <span className="civ-item-hook">{SITE_SELECTION_COPY[civ.id]?.hook}</span>
                  </div>
                  <ChevronLeft className="rotate-180" size={14} />
                </button>
              ))}
            </div>

            {selectedSite && (
              <div className="site-selected-dossier">
                <div className="dossier-kicker">Pinned Dossier</div>
                <h3>{selectedSite.name}</h3>
                <p className="dossier-civilization">{selectedSite.civilization}</p>
                <dl>
                  <div>
                    <dt>Location</dt>
                    <dd>{selectedCopy.location}</dd>
                  </div>
                  <div>
                    <dt>Mission focus</dt>
                    <dd>{selectedCopy.focus || selectedCopy.hook || selectedSite.spark}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="btn primary-btn selected-site-start"
                  onClick={() => onStartInvestigation(selectedSite.id)}
                >
                  Begin Site Mission
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }



  return (
    <section className="phase-container menu-phase">
      <div className="menu-hero glass-card">
        <div className="menu-hero-copy">
          <div className="training-kicker">Archaeology Challenge</div>
          <h2>Lost Site Expedition</h2>
          <p>Choose your classroom mission: practise field skills, investigate a dig site, solve museum case files, or begin the solo adventure.</p>
          <div className="menu-hero-badges" aria-label="Game features">
            <span>Year 7 HASS</span>
            <span>Evidence Skills</span>
            <span>Museum Mystery</span>
          </div>
        </div>
        <div className="menu-save-note" role="note">
          Save/load unlocks after a mission starts.
        </div>
        <div className="menu-hero-art" aria-hidden="true">
          <div className="menu-hero-sun" />
          <div
            className="menu-hero-sprite"
            style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${PLAYER_SPRITE_SRC})` }}
          />
        </div>
      </div>

      <div className="mission-selection-heading">
        <div>
          <div className="training-kicker">Mission Select</div>
          <h3>Pick a path into the ancient world</h3>
        </div>
        <div className="mission-selection-heading-actions">
          <p>Four modes, one evidence toolkit. Start quick, go deep, or take the new platforming route.</p>
          <button
            type="button"
            className={`menu-music-toggle ${expeditionMusicEnabled ? 'is-on' : 'is-off'}`}
            onClick={onExpeditionMusicToggle}
            aria-pressed={expeditionMusicEnabled}
            aria-label={`Expedition music ${expeditionMusicEnabled ? 'on' : 'off'}`}
          >
            {expeditionMusicEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>Expedition Music: {expeditionMusicEnabled ? 'On' : 'Off'}</span>
          </button>
        </div>
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
            <div className="activity-mode-label">Practice</div>
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
            <div className="activity-mode-label">Site Mission</div>
            <p>Recover finds, sort evidence, and build a museum display.</p>
          </div>
          <div className="activity-card-actions activity-card-button-group">
            <button 
              type="button" 
              className={`btn primary-btn activity-card-action ${hasSavedInvestigation ? 'pulse-btn' : ''}`} 
            onClick={hasSavedInvestigation ? onResumeInvestigation : openSiteSelection}
          >
              {hasSavedInvestigation ? 'Resume Investigation' : 'Start Investigation'}
            </button>
            {hasSavedInvestigation && (
              <button type="button" className="btn secondary-btn activity-card-action" onClick={openSiteSelection}>
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
            <div className="activity-mode-label">Deduction</div>
            <p>Open classified museum case files and solve evidence mysteries.</p>
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
            <div className="activity-mode-label">Solo Adventure</div>
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
