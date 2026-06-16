import { ATTACK_TELEGRAPH_CLASSES } from './journeyCombatTelegraphs';

// Player-facing instructions, shared by the briefing primer and the in-game help
// panel so the controls + combat language are authored once.
const JOURNEY_CONTROL_ROWS = [
  { keys: ['A', 'D', '←', '→'], label: 'Move' },
  { keys: ['W', 'Space', '↑'], label: 'Jump' },
  { keys: ['E'], label: 'Interact' },
  { keys: ['J'], label: 'Attack' },
  { keys: ['K'], label: 'Heavy' },
  { keys: ['L'], label: 'Dodge' },
];

const JOURNEY_TELEGRAPH_LEGEND = [
  { color: ATTACK_TELEGRAPH_CLASSES.normal.color, name: 'Gold', desc: 'Parry or dodge.' },
  { color: ATTACK_TELEGRAPH_CLASSES.heavy.color, name: 'Orange', desc: 'Hits harder — parry or dodge.' },
  { color: ATTACK_TELEGRAPH_CLASSES.unblockable.color, name: 'Red', desc: 'Dodge only — no parry.' },
];

export function JourneyControlsReference({ compactMovementKeys = false } = {}) {
  return (
    <div className="journey-controls-reference">
      <div className="journey-controls-keys-grid">
        {JOURNEY_CONTROL_ROWS.map(row => {
          const keys = compactMovementKeys
            ? row.keys.filter(key => !['←', '→', '↑'].includes(key))
            : row.keys;
          return (
            <div className="journey-control-row" key={row.label}>
              <span className="journey-control-keys">
                {keys.map(key => <kbd key={key}>{key}</kbd>)}
              </span>
              <span className="journey-control-label">{row.label}</span>
            </div>
          );
        })}
      </div>
      <div className="journey-controls-legend">
        <div className="journey-controls-legend-title">Read the attack tells</div>
        {JOURNEY_TELEGRAPH_LEGEND.map(row => (
          <div className="journey-telegraph-row" key={row.name}>
            <span className="journey-telegraph-dot" style={{ '--tell-color': row.color }} aria-hidden="true" />
            <span className="journey-telegraph-name">{row.name}</span>
            <span className="journey-telegraph-desc">{row.desc}</span>
          </div>
        ))}
        <p className="journey-controls-parry-tip">
          <strong>Perfect dodge:</strong> tap <kbd>L</kbd> right as a blow lands to deflect it and
          stagger the enemy — even red.
        </p>
      </div>
    </div>
  );
}
