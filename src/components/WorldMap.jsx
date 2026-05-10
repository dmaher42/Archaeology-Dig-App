import { useState } from 'react';
import { Compass, MapPin } from 'lucide-react';

const WORLD_MAP_SRC = `${import.meta.env.BASE_URL}assets/expedition/maps/world-expedition-map.png`;

const CIVILIZATIONS = [
  {
    id: 'egypt',
    name: 'The Desert River Valley',
    civilization: 'Ancient Egypt',
    x: 52.8,
    y: 42.6,
    region: 'Nile region',
    tagline: 'Engineering along the Nile',
    description: 'Investigate engineering, river life and structural evidence along the Nile.',
  },
  {
    id: 'mungo',
    name: 'Lake Mungo',
    civilization: 'Ancient Australia',
    x: 82.6,
    y: 75.3,
    region: 'Southeast Australia',
    tagline: 'Ancient remains and landscape evidence',
    description: 'Investigate ancient remains, landscape evidence and cultural significance.',
  },
  {
    id: 'rome',
    name: 'The Mediterranean Empire',
    civilization: 'Ancient Rome',
    x: 48.6,
    y: 37.2,
    region: 'Mediterranean',
    tagline: 'Roads, water and civic life',
    description: 'Investigate roads, public works and civic life.',
  },
  {
    id: 'china',
    name: 'The Eastern Dynasties',
    civilization: 'Ancient China',
    x: 71.5,
    y: 38.8,
    region: 'East Asia',
    tagline: 'Writing, walls and dynastic power',
    description: 'Investigate walls, writing systems and dynastic power.',
  },
];

export function WorldMap({ onSelect, activeId, selectedId, onHover }) {
  const [localHovered, setLocalHovered] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const activeSite = CIVILIZATIONS.find(civ => civ.id === activeId);
  const selectedSite = CIVILIZATIONS.find(civ => civ.id === selectedId);
  const currentHovered = localHovered || activeSite;

  const handleMarkerClick = (civ) => {
    onSelect?.(civ.id);
  };

  const handleMarkerKeyDown = (event, civ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMarkerClick(civ);
    }
  };

  const handleMouseEnter = (civ) => {
    setLocalHovered(civ);
    onHover?.(civ.id);
  };

  const handleMouseLeave = () => {
    setLocalHovered(null);
    onHover?.(null);
  };

  return (
    <div
      className="world-map-container glass-card premium-map"
      aria-label="Archaeological expedition world map"
      data-selected-site={selectedSite?.id || ''}
      data-world-map-loaded={mapLoaded ? 'true' : 'false'}
      data-world-map-fallback-active={mapFailed ? 'true' : 'false'}
      data-visible-map-markers={CIVILIZATIONS.length}
      data-selected-map-marker={selectedSite?.id || ''}
    >
      <div className="map-texture-overlay" />

      <div className="world-map-header">
        <div className="world-map-title">
          <MapPin size={18} />
          <span>Field Expedition World Map</span>
        </div>
        <div className="world-map-coordinates">
          {currentHovered ? (
            <span className="coord-readout">
              {currentHovered.region} | {currentHovered.civilization}
            </span>
          ) : (
            <span className="coord-readout">Choose a field site</span>
          )}
        </div>
      </div>

      <div className="world-map-wrapper">
        <div className="world-map-image-stage">
          {!mapFailed ? (
            <img
              src={WORLD_MAP_SRC}
              alt="Parchment world map with expedition routes"
              className="world-map-image"
              onLoad={() => setMapLoaded(true)}
              onError={() => {
                setMapLoaded(false);
                setMapFailed(true);
              }}
            />
          ) : (
            <div className="world-map-fallback" role="img" aria-label="Fallback parchment map">
              <span>Field map unavailable</span>
            </div>
          )}

          <div className="map-site-buttons" aria-label="Choose an expedition site">
            {CIVILIZATIONS.map(civ => (
              <button
                key={civ.id}
                type="button"
                data-site-id={civ.id}
                className={`map-site-button ${activeId === civ.id || selectedId === civ.id ? 'active' : ''}`}
                style={{ left: `${civ.x}%`, top: `${civ.y}%` }}
                aria-label={`Select ${civ.name}`}
                onMouseEnter={() => handleMouseEnter(civ)}
                onMouseLeave={handleMouseLeave}
                onFocus={() => handleMouseEnter(civ)}
                onBlur={handleMouseLeave}
                onClick={() => handleMarkerClick(civ)}
                onKeyDown={(event) => handleMarkerKeyDown(event, civ)}
              >
                <span className="map-site-button-pin" aria-hidden="true" />
                <span className="map-site-button-label">{civ.civilization}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="map-hud-overlay">
          <div className="map-compass-premium">
            <Compass className="compass-icon" size={40} />
            <div className="compass-direction">N</div>
          </div>
          <div className="map-legend-note">Red string marks the expedition route plan</div>
        </div>

        {localHovered && (
          <div className="map-floating-info glass-card animate-slide-in">
            <div className="info-header">
              <span className="info-region">{localHovered.region}</span>
              <span className="info-status">FIELD SITE</span>
            </div>
            <h4>{localHovered.name}</h4>
            <p className="info-tagline">{localHovered.tagline}</p>
            <p>{localHovered.description}</p>
            <div className="info-action">
              <span>Select marker to pin this dossier</span>
            </div>
          </div>
        )}
      </div>

      <div className="world-map-footer">
        <div className="footer-status">
          <div className="status-dot green" />
          <span>Field archive map</span>
        </div>
        <p className="footer-copyright">
          Antiquities Bureau expedition planning table
        </p>
      </div>
    </div>
  );
}
