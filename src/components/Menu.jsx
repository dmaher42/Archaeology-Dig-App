import { useState, useRef, useEffect } from 'react';
import { Pickaxe, MapPin, FileText, Dice5, ChevronLeft, Compass, Volume2, VolumeX } from 'lucide-react';
import { SCENARIOS } from '../data';
import { WorldMap } from './WorldMap';


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
  onQuickPlay = () => {},
  savedGames,
  onResumeInvestigation, 
  onResumeBureau,
  onSiteSelectionChange = () => {},
  expeditionMusicEnabled = false,
  expeditionSfxEnabled = false,
  onExpeditionMusicToggle = () => {},
  onExpeditionSfxToggle = () => {}
}) {
  const [showCivSelection, setShowCivSelection] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedSiteId, setSelectedSiteId] = useState('egypt');
  const [focusedModeIndex, setFocusedModeIndex] = useState(1);
  const carouselRef = useRef(null);

  const hasSavedInvestigation = savedGames?.archaeology && savedGames.archaeology.phase !== 'menu';
  const hasSavedBureau = savedGames?.bureau;

  const modeArtworks = [
    `${import.meta.env.BASE_URL}assets/menu/mode_training_art.png`,
    `${import.meta.env.BASE_URL}assets/menu/mode_investigation_art.png`,
    `${import.meta.env.BASE_URL}assets/menu/mode_bureau_art.png`,
    `${import.meta.env.BASE_URL}assets/menu/mode_expedition_art.png`
  ];

  useEffect(() => {
    if (!carouselRef.current) return;
    let scrollTimeout;
    const container = carouselRef.current;

    const handleScroll = () => {
      const cards = container.querySelectorAll('.activity-card');
      let closestIndex = 1;
      let minDistance = Infinity;
      const containerRect = container.getBoundingClientRect();

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        // 5vw scroll padding
        const distance = Math.abs(rect.left - containerRect.left - (window.innerWidth * 0.05));
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = Number(card.dataset.index);
        }
      });
      setFocusedModeIndex(closestIndex);
    };

    container.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 50);
    });

    return () => {
      clearTimeout(scrollTimeout);
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
        <div className="selection-command-bar glass-card">
          <button
            className="back-to-modes-btn"
            onClick={closeSiteSelection}
          >
            <ChevronLeft size={16} /> Back to Missions
          </button>
          <div className="selection-command-heading">
            <div className="training-kicker">Mission Plan</div>
            <h2>Interactive Expedition Map</h2>
          </div>
          <div className="selection-command-status">Interactive Plan</div>
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
                <div className="dossier-kicker">Selected Folder</div>
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
    <section className="phase-container menu-phase main-menu-phase">
      <div className="dynamic-menu-backdrop" style={{ backgroundImage: `url(${modeArtworks[focusedModeIndex]})` }} />

      <div className="mission-selection-heading">
        <div>
          <div className="training-kicker">Archaeology Challenge</div>
          <h2 className="premium-text-glow" style={{ margin: 0, fontSize: '2rem' }}>The Antiquities Bureau</h2>
        </div>
        <div className="mission-selection-heading-actions">
          <button
            type="button"
            className={`menu-icon-btn ${expeditionMusicEnabled ? 'is-on' : 'is-off'}`}
            onClick={onExpeditionMusicToggle}
            aria-pressed={expeditionMusicEnabled}
            aria-label={`Expedition music ${expeditionMusicEnabled ? 'on' : 'off'}`}
            title={`Music: ${expeditionMusicEnabled ? 'On' : 'Off'}`}
          >
            {expeditionMusicEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            type="button"
            className={`menu-icon-btn ${expeditionSfxEnabled ? 'is-on' : 'is-off'}`}
            onClick={onExpeditionSfxToggle}
            aria-pressed={expeditionSfxEnabled}
            aria-label={`Expedition sound effects ${expeditionSfxEnabled ? 'on' : 'off'}`}
            title={`SFX: ${expeditionSfxEnabled ? 'On' : 'Off'}`}
          >
            {expeditionSfxEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      <div className="premium-carousel-container" ref={carouselRef} aria-label="Choose an activity">
        {/* Basic Training */}
        <article data-index={0} className={`activity-card activity-card--training glass-card ${focusedModeIndex === 0 ? 'is-focused' : ''}`} style={{ '--card-bg': `url(${modeArtworks[0]})` }} onMouseEnter={() => setFocusedModeIndex(0)}>
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
            <div className="activity-card-button-group">
              <button type="button" className="premium-action-btn" onClick={onStartTraining}>
                Start Training
              </button>
            </div>
        </article>

        {/* Full Investigation */}
        <article data-index={1} className={`activity-card activity-card--investigation glass-card ${hasSavedInvestigation ? 'has-save' : ''} ${focusedModeIndex === 1 ? 'is-focused' : ''}`} style={{ '--card-bg': `url(${modeArtworks[1]})` }} onMouseEnter={() => setFocusedModeIndex(1)}>
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
            <div className="activity-card-button-group">
              {hasSavedInvestigation && (
                <button type="button" className="premium-action-btn" onClick={onResumeInvestigation}>
                  Resume Investigation
                </button>
              )}
              <button
                type="button"
                className={hasSavedInvestigation ? 'premium-action-btn secondary-btn' : 'premium-action-btn'}
                onClick={openSiteSelection}
              >
                {hasSavedInvestigation ? 'Start New Investigation' : 'Start Investigation'}
              </button>
            </div>
        </article>

        {/* Secret Files */}
        <article data-index={2} className={`activity-card activity-card--bureau glass-card ${hasSavedBureau ? 'has-save' : ''} ${focusedModeIndex === 2 ? 'is-focused' : ''}`} style={{ '--card-bg': `url(${modeArtworks[2]})` }} onMouseEnter={() => setFocusedModeIndex(2)}>
          <div className="activity-card-header">
            <div className="activity-card-icon activity-card-icon--bureau">
              <FileText size={24} />
            </div>
            <div className="activity-time-tag">15-20 MINS | MYSTERY</div>
          </div>
          <div className="activity-card-copy">
            <h3>Secret Files</h3>
            <div className="activity-mode-label">Mystery</div>
            <p>Open secret museum case files and solve evidence mysteries.</p>
          </div>
            <div className="activity-card-button-group">
              {hasSavedBureau && (
                <button type="button" className="premium-action-btn" onClick={onResumeBureau}>
                  Resume Bureau Work
                </button>
              )}
              <button
                type="button"
                className={hasSavedBureau ? 'premium-action-btn secondary-btn' : 'premium-action-btn'}
                onClick={onStartBureau}
              >
                {hasSavedBureau ? 'Start New Case' : 'Start Bureau'}
              </button>
            </div>
        </article>

        {/* Lost Site Expedition */}
        <article data-index={3} className={`activity-card activity-card--expedition glass-card ${focusedModeIndex === 3 ? 'is-focused' : ''}`} style={{ '--card-bg': `url(${modeArtworks[3]})` }} onMouseEnter={() => setFocusedModeIndex(3)}>
          <div className="activity-card-header">
            <div className="activity-card-icon activity-card-icon--expedition">
              <Compass size={24} />
            </div>
            <div className="activity-time-tag">10-15 MINS | STANDALONE ADVENTURE</div>
          </div>
          <div className="activity-card-copy">
            <h3>Lost Site Expedition</h3>
            <div className="activity-mode-label">Standalone Adventure</div>
            <p>Cross the sealed route, face the first guardian, then return to Base Camp Outpost for fieldwork.</p>
          </div>
            <div className="activity-card-button-group">
              <button type="button" className="premium-action-btn" onClick={onStartExpedition}>
                Launch Expedition
              </button>
              {import.meta.env.DEV && (
                <button type="button" className="premium-action-btn secondary-btn" onClick={onQuickPlay}>
                  Dev: Skip to Desert Entry
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
