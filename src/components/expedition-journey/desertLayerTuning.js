// DEV-only live tuning for the desert-entry parallax layers.
//
// The render loop (useJourneyRenderer) reads DESERT_LAYER_TUNING every frame,
// and the on-screen dev panel (DesertLayerTuningPanel) mutates it in place, so
// dragging a slider updates the scene live. In production the panel is never
// mounted, the store stays at its defaults, and the renderer behaves exactly as
// the previous hardcoded constants did.
//
// Once a composition looks right, hit "Copy" in the panel and paste the JSON
// back so the values can be baked into the renderer constants.

export const DESERT_LAYER_TUNING_DEFAULTS = {
  skyLight: { parallax: 0.012, alpha: 1 },
  distantCliffs: { parallax: 0.055, alpha: 0, height: 792 },
  farPyramids: { sectionFraction: 0.5, parallax: 0.14, height: 540, baseY: 600, alpha: 0.94 },
  midNecropolisRuins: { parallax: 0.28, alpha: 1, height: 630, baseY: 630 },
  dustHaze: { y: 408, height: 104, parallax: 0.48, alpha: 0.09 },
  desertSphinx: { sectionFraction: 0.56, parallax: 0.48, height: 292, baseY: 590, brightness: 1.01, saturate: 1.12, alpha: 0.94, contrast: 1.18 },
  ritualPyramid: { sectionFraction: 0.31, parallax: 1, height: 764, widthScale: 1.1, baseY: 605, alpha: 0.99, brightness: 1.04, saturate: 0.88, contrast: 1.04 },
  groundBacking: { y: 460, height: 210, parallax: 0.72, alpha: 1 },
  groundLane: { y: 558, height: 174, parallax: 1, alpha: 1 },
  foregroundRubble: { y: 542, height: 96, parallax: 1.12, alpha: 0.12 },
  foregroundDepth: { y: 584, height: 46, parallax: 1.24, alpha: 0.14 },
};

const clone = (obj) => Object.fromEntries(
  Object.entries(obj).map(([key, fields]) => [key, { ...fields }]),
);

// Live mutable store. Imported by both the renderer (reads) and the panel (writes).
export const DESERT_LAYER_TUNING = clone(DESERT_LAYER_TUNING_DEFAULTS);

export const setDesertLayerTuningField = (layerKey, fieldKey, value) => {
  if (DESERT_LAYER_TUNING[layerKey]) DESERT_LAYER_TUNING[layerKey][fieldKey] = value;
};

export const resetDesertLayerTuning = () => {
  const fresh = clone(DESERT_LAYER_TUNING_DEFAULTS);
  Object.keys(fresh).forEach((key) => { DESERT_LAYER_TUNING[key] = fresh[key]; });
};

// Drives the dev panel UI: per-layer slider groups with sane ranges. `k` is the
// field name in the store; `label` defaults to a humanised `k`.
export const DESERT_LAYER_TUNING_SCHEMA = [
  { key: 'skyLight', label: 'Sky', fields: [
    { k: 'parallax', min: 0, max: 0.3, step: 0.001 },
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'distantCliffs', label: 'Distant Cliffs', fields: [
    { k: 'parallax', min: 0, max: 0.4, step: 0.001 },
    { k: 'height', min: 300, max: 1100, step: 2 },
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'farPyramids', label: 'Pyramids (placed)', fields: [
    { k: 'sectionFraction', label: 'Position', min: 0, max: 1, step: 0.01 },
    { k: 'parallax', min: 0, max: 0.5, step: 0.001 },
    { k: 'height', min: 120, max: 620, step: 2 },
    { k: 'baseY', label: 'Base Y', min: 400, max: 680, step: 1 },
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'midNecropolisRuins', label: 'Necropolis Ruins', fields: [
    { k: 'parallax', min: 0, max: 0.6, step: 0.001 },
    { k: 'height', min: 300, max: 760, step: 2 },
    { k: 'baseY', label: 'Base Y', min: 400, max: 760, step: 1 },
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'dustHaze', label: 'Dust Haze', fields: [
    { k: 'y', label: 'Top Y', min: 260, max: 610, step: 1 },
    { k: 'height', min: 40, max: 260, step: 1 },
    { k: 'parallax', min: 0, max: 1.2, step: 0.01 },
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'desertSphinx', label: 'Sphinx (placed)', fields: [
    { k: 'sectionFraction', label: 'Position', min: 0, max: 1, step: 0.01 },
    { k: 'parallax', min: 0, max: 1, step: 0.01 },
    { k: 'height', min: 80, max: 400, step: 2 },
    { k: 'baseY', label: 'Base Y', min: 400, max: 680, step: 1 },
    { k: 'brightness', label: 'Brightness', min: 0.4, max: 1.2, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.3, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.3, step: 0.02 },
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'ritualPyramid', label: 'Ritual Temple (building)', fields: [
    { k: 'sectionFraction', label: 'Position', min: 0, max: 1, step: 0.005 },
    { k: 'parallax', min: 0.5, max: 1.2, step: 0.01 },
    { k: 'height', min: 200, max: 1000, step: 4 },
    { k: 'widthScale', label: 'Width', min: 0.5, max: 2.5, step: 0.02 },
    { k: 'baseY', label: 'Base Y', min: 400, max: 700, step: 1 },
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
    { k: 'brightness', label: 'Brightness', min: 0.4, max: 1.2, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.3, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.3, step: 0.02 },
  ] },
  { key: 'groundBacking', label: 'Ground Backing', fields: [
    { k: 'y', label: 'Top Y', min: 440, max: 680, step: 1 },
    { k: 'height', min: 40, max: 280, step: 1 },
    { k: 'parallax', min: 0.6, max: 1.2, step: 0.01 },
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'groundLane', label: 'Path / Ground Lane', fields: [
    { k: 'y', label: 'Top Y', min: 480, max: 680, step: 1 },
    { k: 'height', min: 40, max: 220, step: 1 },
    { k: 'parallax', min: 0.6, max: 1.2, step: 0.01 },
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'foregroundRubble', label: 'Foreground Rubble', fields: [
    { k: 'y', label: 'Top Y', min: 380, max: 630, step: 1 },
    { k: 'height', min: 40, max: 260, step: 1 },
    { k: 'parallax', min: 0.6, max: 1.4, step: 0.01 },
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'foregroundDepth', label: 'Foreground Depth', fields: [
    { k: 'y', label: 'Top Y', min: 480, max: 630, step: 1 },
    { k: 'height', min: 20, max: 160, step: 1 },
    { k: 'parallax', min: 0.6, max: 1.4, step: 0.01 },
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
];
