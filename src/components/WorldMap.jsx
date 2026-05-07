import { useState } from 'react';
import { Globe, Compass, Wind } from 'lucide-react';

const CIVILIZATIONS = [
  { 
    id: 'egypt', 
    name: 'Ancient Egypt', 
    x: 55, y: 35, 
    region: 'Africa',
    tagline: 'The Gift of the Nile',
    description: 'Explore the monumental pyramids and temples preserved by the desert sands.'
  },
  { 
    id: 'mungo', 
    name: 'Lake Mungo', 
    x: 88, y: 78, 
    region: 'Australia',
    tagline: 'Ancient Footprints',
    description: 'Discover evidence of human life dating back over 40,000 years in the Willandra Lakes.'
  },
  { 
    id: 'rome', 
    name: 'Ancient Rome', 
    x: 48, y: 25, 
    region: 'Europe',
    tagline: 'Eternal City',
    description: 'Uncover the engineering marvels and law-giving society of the Roman Empire.'
  },
  { 
    id: 'china', 
    name: 'Ancient China', 
    x: 78, y: 35, 
    region: 'Asia',
    tagline: 'The Middle Kingdom',
    description: 'Investigate the birthplace of silk, paper, and the Great Wall.'
  },
  { 
    id: 'greece', 
    name: 'Ancient Greece', 
    x: 52, y: 28, 
    region: 'Europe',
    tagline: 'Cradle of Democracy',
    description: 'Analyze the philosophers, athletes, and architects of the Hellenic world.'
  },
  { 
    id: 'maya', 
    x: 22, y: 48, 
    name: 'The Maya', 
    region: 'Americas',
    tagline: 'Jungle Astronomers',
    description: 'Decipher the complex calendars and stepped pyramids hidden in the rainforest.'
  },
  { 
    id: 'inca', 
    x: 28, y: 72, 
    name: 'The Inca', 
    region: 'Americas',
    tagline: 'Empire of the Sun',
    description: 'Trek through the Andes to uncover the masonry and road systems of the Sun Kings.'
  },
  { 
    id: 'indus', 
    x: 68, y: 38, 
    name: 'Indus Valley', 
    region: 'Asia',
    tagline: 'Urban Pioneers',
    description: 'Explore the world\'s first planned cities and advanced drainage systems.'
  },
  { 
    id: 'mesopotamia', 
    x: 60, y: 32, 
    name: 'Mesopotamia', 
    region: 'Asia',
    tagline: 'Land Between Rivers',
    description: 'Visit the Ziggurats of the world\'s earliest writing civilization.'
  },
  { 
    id: 'persia', 
    x: 64, y: 30, 
    name: 'Ancient Persia', 
    region: 'Asia',
    tagline: 'Royal Roads',
    description: 'Study the diverse empire known for its religious tolerance and royal infrastructure.'
  },
  { 
    id: 'byzantine', 
    x: 54, y: 24, 
    name: 'Byzantine Empire', 
    region: 'Europe',
    tagline: 'Eastern Rome',
    description: 'Witness the mosaics and golden domes of the empire that bridged East and West.'
  },
  { 
    id: 'aztec', 
    x: 18, y: 45, 
    name: 'The Aztec', 
    region: 'Americas',
    tagline: 'Island City-State',
    description: 'Uncover the military might and chinampa farming of Tenochtitlan.'
  }
];

export function WorldMap({ onSelect, activeId, onHover }) {
  // Use local hover if onHover isn't provided, otherwise use parent's state via activeId
  const [localHovered, setLocalHovered] = useState(null);
  const currentHovered = activeId ? CIVILIZATIONS.find(c => c.id === activeId) : localHovered;

  const handleMarkerClick = (civ) => {
    if (onSelect) onSelect(civ.id);
  };

  const handleMouseEnter = (civ) => {
    setLocalHovered(civ);
    if (onHover) onHover(civ.id);
  };

  const handleMouseLeave = () => {
    setLocalHovered(null);
    if (onHover) onHover(null);
  };

  return (
    <div className="world-map-container glass-card premium-map">
      {/* Dynamic Background Noise/Texture Overlay */}
      <div className="map-texture-overlay"></div>
      <div className="map-scanlines"></div>

      <div className="world-map-header">
        <div className="world-map-title">
          <Globe className="text-accent animate-pulse" size={20} />
          <span className="premium-text-glow">Global Expedition Network</span>
        </div>
        <div className="world-map-coordinates">
          {currentHovered ? (
            <span className="coord-readout">
              LAT: {currentHovered.y.toFixed(2)}° N | LON: {currentHovered.x.toFixed(2)}° E
            </span>
          ) : (
            <span className="coord-readout opacity-50">SYSTEM IDLE // SELECT SITE</span>
          )}
        </div>
      </div>

      <div className="world-map-wrapper">
        <svg viewBox="0 0 100 100" className="world-map-svg">
          {/* Subtle Grid - Latitude/Longitude */}
          <g className="map-grid-lines">
            {[...Array(11)].map((_, i) => (
              <line key={`lat-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />
            ))}
            {[...Array(11)].map((_, i) => (
              <line key={`lon-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />
            ))}
          </g>

          {/* Continents - More stylized and layered */}
          <g className="map-landmass" fill="currentColor">
            <path 
              className="land-path" 
              d="M5,20 Q15,15 30,20 T45,15 T60,25 T80,20 T95,30 L95,50 Q85,60 75,55 T60,65 T40,50 T20,60 T5,45 Z" 
              opacity="0.05" 
            />
            
            <path d="M5,15 L35,15 L38,40 L25,55 L8,48 Z" opacity="0.08" className="continent-shape" />
            <path d="M22,55 L38,45 L42,88 L28,95 L20,70 Z" opacity="0.08" className="continent-shape" />
            <path d="M42,10 L62,10 L65,35 L45,35 Z" opacity="0.1" className="continent-shape" />
            <path d="M42,38 L65,38 L70,75 L50,90 L40,65 Z" opacity="0.08" className="continent-shape" />
            <path d="M62,10 L95,12 L98,58 L68,58 L65,35 Z" opacity="0.08" className="continent-shape" />
            <path d="M78,68 L96,68 L98,90 L80,92 Z" opacity="0.08" className="continent-shape" />
          </g>

          {/* Topographic Accents */}
          <g className="topo-lines" stroke="rgba(255,255,255,0.03)" fill="none" strokeWidth="0.2">
            <circle cx="55" cy="35" r="5" />
            <circle cx="78" cy="35" r="8" />
            <path d="M20,70 Q25,75 30,70 T40,75" />
          </g>

          {/* Site Markers */}
          {CIVILIZATIONS.map(civ => (
            <g 
              key={civ.id}
              className={`map-site-marker ${activeId === civ.id ? 'active' : ''}`}
              onMouseEnter={() => handleMouseEnter(civ)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleMarkerClick(civ)}
            >
              {/* Radar Ping Effect */}
              <circle cx={civ.x} cy={civ.y} r="1.5" className="marker-ping" />
              <circle cx={civ.x} cy={civ.y} r="3" className="marker-ping-outer" />
              
              <circle 
                cx={civ.x} 
                cy={civ.y} 
                r="0.8" 
                className="marker-core"
                fill={activeId === civ.id ? 'var(--accent)' : 'rgba(255,255,255,0.8)'} 
              />

              {activeId === civ.id && (
                <circle 
                  cx={civ.x} 
                  cy={civ.y} 
                  r="2.5" 
                  fill="none" 
                  stroke="var(--accent)" 
                  strokeWidth="0.3" 
                  strokeDasharray="1 1"
                  className="animate-spin-slow"
                />
              )}
            </g>
          ))}
        </svg>

        {/* Compass & HUD Elements */}
        <div className="map-hud-overlay">
          <div className="hud-corner top-left"></div>
          <div className="hud-corner top-right"></div>
          <div className="hud-corner bottom-left"></div>
          <div className="hud-corner bottom-right"></div>
          
          <div className="map-compass-premium">
            <Compass className="compass-icon" size={40} />
            <div className="compass-direction">N</div>
          </div>

          <div className="map-wind-decoration">
            <Wind size={14} className="opacity-30" />
            <span className="text-[8px] tracking-[2px] opacity-30">WIND_SPD: 12KT</span>
          </div>
        </div>

        {/* Floating Site Info Panel */}
        {currentHovered && (
          <div className="map-floating-info glass-card animate-slide-in">
            <div className="info-header">
              <span className="info-region">{currentHovered.region}</span>
              <span className="info-status">SIGNAL: STABLE</span>
            </div>
            <h4>{currentHovered.name}</h4>
            <p className="info-tagline">{currentHovered.tagline}</p>
            <div className="info-action">
              <span className="text-xs">TAP MARKER TO DEPLOY</span>
              <div className="action-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="world-map-footer">
        <div className="footer-status">
          <div className="status-dot green"></div>
          <span>SATELLITE LINK ACTIVE</span>
        </div>
        <p className="footer-copyright">
          © ANTIQUITIES BUREAU GLOBAL TRACKER V2.4
        </p>
      </div>
    </div>
  );
}
