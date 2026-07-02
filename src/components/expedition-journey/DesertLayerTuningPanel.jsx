import { useEffect, useState } from 'react';
import {
  DESERT_LAYER_TUNING,
  DESERT_LAYER_TUNING_SCHEMA,
  resetDesertLayerTuning,
  setDesertLayerTuningField,
} from './desertLayerTuning.js';

// DEV-only overlay for live-tuning the desert-entry parallax layers. It mutates
// the shared DESERT_LAYER_TUNING store in place; the render loop reads that store
// every frame, so dragging a slider updates the scene immediately. "Copy" dumps
// the current values as JSON so they can be pasted back and baked in.

const humanise = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

const formatValue = (value, step) => {
  if (step < 0.01) return value.toFixed(3);
  if (step < 1) return value.toFixed(2);
  return String(Math.round(value));
};

const PANEL_BG = 'rgba(15,12,10,0.92)';
const ACCENT = 'rgba(212,184,120,0.4)';

export default function DesertLayerTuningPanel() {
  const [open, setOpen] = useState(false);
  const [, forceRender] = useState(0);
  const [copied, setCopied] = useState(false);
  const [focusedLayerKey, setFocusedLayerKey] = useState(null);

  const bump = () => forceRender((n) => n + 1);

  useEffect(() => {
    const handleOpenLayerTuning = (event) => {
      setFocusedLayerKey(event?.detail?.layerKey || null);
      setOpen(true);
    };
    window.addEventListener('journey:open-desert-layer-tuning', handleOpenLayerTuning);
    return () => window.removeEventListener('journey:open-desert-layer-tuning', handleOpenLayerTuning);
  }, []);

  const setField = (layerKey, fieldKey, value) => {
    setDesertLayerTuningField(layerKey, fieldKey, value);
    bump();
  };

  const handleReset = () => {
    resetDesertLayerTuning();
    setCopied(false);
    bump();
  };

  const handleCopy = () => {
    const json = JSON.stringify(DESERT_LAYER_TUNING, null, 2);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(json).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }).catch(() => {});
    }
  };

  const buttonStyle = {
    cursor: 'pointer', padding: '3px 9px', borderRadius: 4,
    font: '11px/1.2 system-ui, sans-serif',
    background: 'rgba(212,184,120,0.16)', border: `1px solid ${ACCENT}`, color: '#f0e6d2',
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          ...buttonStyle, position: 'absolute', top: 6, right: 6, zIndex: 41, pointerEvents: 'auto',
        }}
      >
        Layers
      </button>
    );
  }

  return (
    <div
      onKeyDown={(event) => event.stopPropagation()}
      onKeyUp={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      style={{
        position: 'absolute', top: 6, right: 6, zIndex: 41, pointerEvents: 'auto',
        width: 260, maxHeight: '86%', overflowY: 'auto',
        padding: '8px 10px', borderRadius: 8,
        background: PANEL_BG, border: `1px solid ${ACCENT}`,
        font: '11px/1.3 system-ui, sans-serif', color: '#e8dcc4',
        boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ opacity: 0.8, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
          Desert Layers
        </span>
        <button type="button" onClick={() => setOpen(false)} style={{ ...buttonStyle, padding: '1px 7px' }}>
          ✕
        </button>
      </div>

      {DESERT_LAYER_TUNING_SCHEMA.map((layer) => (
        <div
          key={layer.key}
          style={{
            marginBottom: 8,
            padding: focusedLayerKey === layer.key ? '5px 6px 6px' : '0 0 6px',
            borderBottom: '1px solid rgba(212,184,120,0.14)',
            borderRadius: focusedLayerKey === layer.key ? 5 : 0,
            background: focusedLayerKey === layer.key ? 'rgba(212,184,120,0.12)' : 'transparent',
          }}
        >
          <div style={{ fontWeight: 600, color: '#f0e6d2', marginBottom: 3 }}>{layer.label}</div>
          {layer.fields.map((field) => {
            const value = DESERT_LAYER_TUNING[layer.key][field.k];
            return (
              <label key={field.k} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ flex: '0 0 78px', opacity: 0.85 }}>{field.label || humanise(field.k)}</span>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={value}
                  onChange={(event) => setField(layer.key, field.k, Number(event.target.value))}
                  style={{ flex: 1, accentColor: '#d4b878', minWidth: 0 }}
                />
                <span style={{ flex: '0 0 38px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', opacity: 0.95 }}>
                  {formatValue(value, field.step)}
                </span>
              </label>
            );
          })}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button type="button" onClick={handleCopy} style={{ ...buttonStyle, flex: 1 }}>
          {copied ? 'Copied!' : 'Copy values'}
        </button>
        <button type="button" onClick={handleReset} style={{ ...buttonStyle, flex: 1 }}>
          Reset
        </button>
      </div>
    </div>
  );
}
