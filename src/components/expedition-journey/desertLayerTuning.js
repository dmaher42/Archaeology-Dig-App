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
  skyLight: { parallax: 0.005, alpha: 0.88, brightness: 0.96, saturate: 0.88, contrast: 0.98, sepia: 0, hue: 0, shadowLift: 0, highlightClamp: 1, dustHaze: 0 },
  distantCliffs: { parallax: 0.055, alpha: 0, height: 792 },
  farPyramids: { sectionFraction: 0.5, parallax: 0.14, height: 540, baseY: 600, alpha: 0.94 },
  midNecropolisRuins: { parallax: 0.28, alpha: 1, height: 630, baseY: 630, brightness: 1.03, saturate: 1.26, contrast: 1.22, sepia: 3, hue: 0, shadowLift: 0, highlightClamp: 1, dustHaze: 0 },
  dustHaze: { y: 398, height: 126, parallax: 0.48, alpha: 0.1 },
  desertSphinx: { sectionFraction: 0.56, parallax: 0.48, height: 292, baseY: 590, brightness: 1.01, saturate: 1.12, alpha: 0.94, contrast: 1.18, shadowLift: 0, highlightClamp: 1, dustHaze: 0 },
  ritualPyramid: { sectionFraction: 0.31, parallax: 1, height: 764, widthScale: 1.1, baseY: 605, alpha: 1, brightness: 1.04, saturate: 0.88, contrast: 1.04, shadowLift: 0, highlightClamp: 1, dustHaze: 0 },
  thresholdBuildingGrade: { brightness: 0.86, saturate: 0.88, contrast: 1.18, sepia: 0, hue: -3, alpha: 1, shadowLift: 0.03, highlightClamp: 0.9, dustHaze: 0 },
  groundBacking: { y: 475, height: 280, parallax: 0.6, alpha: 1, brightness: 0.94, saturate: 0.84, contrast: 1.04, shadowLift: 0, highlightClamp: 1, dustHaze: 0 },
  templeFoundationTransition: { y: 442, height: 115, parallax: 0.45, alpha: 1, brightness: 0.78, saturate: 0.78, contrast: 1.16, shadowLift: 0, highlightClamp: 1, dustHaze: 0 },
  templeFoundationStart: { sectionFraction: 0.045, y: 500, height: 88, widthScale: 1.5, parallax: 0.45, alpha: 1, brightness: 0.92, saturate: 0.9, contrast: 0.94, shadowLift: 0, highlightClamp: 0.98, dustHaze: 0 },
  templeFoundationAccent: { sectionFraction: 0.12, y: 508, height: 122, widthScale: 1.45, parallax: 0.45, alpha: 0.44, brightness: 0.92, saturate: 0.9, contrast: 0.92, shadowLift: 0, highlightClamp: 0.98, dustHaze: 0 },
  groundTransition: { y: 515, height: 81, parallax: 1, alpha: 1, brightness: 0.94, saturate: 0.78, contrast: 1.18, shadowLift: 0, highlightClamp: 1, dustHaze: 0 },
  groundLane: { y: 558, height: 112, parallax: 1, alpha: 0.92, brightness: 0.92, saturate: 0.78, contrast: 1.18, shadowLift: 0.04, highlightClamp: 0.92, dustHaze: 0 },
  foregroundRubble: { y: 510, height: 118, parallax: 1.06, alpha: 0, brightness: 1, saturate: 1, contrast: 1, sepia: 4, hue: 0, shadowLift: 0, highlightClamp: 1, dustHaze: 0 },
  foregroundDepth: { y: 584, height: 46, parallax: 1.24, alpha: 0.06 },
  ruinedTempleCliffSkyGrade: { brightness: 1, saturate: 0.52, contrast: 0.88, sepia: 2, hue: -12, alpha: 1, shadowLift: 0, highlightClamp: 1, dustHaze: 0 },
  ruinedTempleTempleMaskGrade: { brightness: 1.08, saturate: 1.08, contrast: 1.04, sepia: 18, hue: 2, alpha: 1, shadowLift: 0, highlightClamp: 1, dustHaze: 0 },
};

const clone = (obj) => Object.fromEntries(
  Object.entries(obj).map(([key, fields]) => [key, { ...fields }]),
);

const advancedGradeFields = [
  { k: 'shadowLift', label: 'Shadow Lift', min: 0, max: 0.28, step: 0.01 },
  { k: 'highlightClamp', label: 'Highlight Clamp', min: 0.72, max: 1, step: 0.01 },
  { k: 'dustHaze', label: 'Dust Haze', min: 0, max: 0.18, step: 0.01 },
];

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
    { k: 'brightness', label: 'Brightness', min: 0.5, max: 1.4, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.6, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.5, step: 0.02 },
    { k: 'sepia', label: 'Warmth', min: 0, max: 60, step: 1 },
    { k: 'hue', label: 'Hue', min: -45, max: 45, step: 1 },
    ...advancedGradeFields,
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
    { k: 'brightness', label: 'Brightness', min: 0.5, max: 1.4, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.6, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.5, step: 0.02 },
    { k: 'sepia', label: 'Warmth', min: 0, max: 60, step: 1 },
    { k: 'hue', label: 'Hue', min: -45, max: 45, step: 1 },
    ...advancedGradeFields,
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
    ...advancedGradeFields,
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'ritualPyramid', label: 'Background Temple Placement', fields: [
    { k: 'sectionFraction', label: 'Position', min: 0, max: 1, step: 0.005 },
    { k: 'parallax', min: 0.5, max: 1.2, step: 0.01 },
    { k: 'height', min: 200, max: 1000, step: 4 },
    { k: 'widthScale', label: 'Width', min: 0.5, max: 2.5, step: 0.02 },
    { k: 'baseY', label: 'Base Y', min: 400, max: 700, step: 1 },
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'thresholdBuildingGrade', label: 'Threshold Building', fields: [
    { k: 'brightness', label: 'Brightness', min: 0.4, max: 1.2, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.3, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.3, step: 0.02 },
    { k: 'sepia', label: 'Warmth', min: 0, max: 60, step: 1 },
    { k: 'hue', label: 'Hue', min: -45, max: 45, step: 1 },
    ...advancedGradeFields,
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'groundBacking', label: 'Ground Backing', fields: [
    { k: 'y', label: 'Top Y', min: 440, max: 680, step: 1 },
    { k: 'height', min: 40, max: 280, step: 1 },
    { k: 'parallax', min: 0.6, max: 1.2, step: 0.01 },
    { k: 'brightness', label: 'Brightness', min: 0.6, max: 1.3, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.4, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.3, step: 0.02 },
    ...advancedGradeFields,
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'templeFoundationTransition', label: 'Temple Foundation', fields: [
    { k: 'y', label: 'Top Y', min: 340, max: 560, step: 1 },
    { k: 'height', min: 80, max: 260, step: 1 },
    { k: 'parallax', min: 0.45, max: 1.05, step: 0.01 },
    { k: 'brightness', label: 'Brightness', min: 0.5, max: 1.2, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.3, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.3, step: 0.02 },
    ...advancedGradeFields,
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'templeFoundationStart', label: 'Temple Foundation Start', fields: [
    { k: 'sectionFraction', label: 'Position', min: 0, max: 0.24, step: 0.005 },
    { k: 'y', label: 'Top Y', min: 340, max: 560, step: 1 },
    { k: 'height', min: 40, max: 180, step: 1 },
    { k: 'widthScale', label: 'Width', min: 0.4, max: 2.6, step: 0.02 },
    { k: 'parallax', min: 0.3, max: 1.05, step: 0.01 },
    { k: 'brightness', label: 'Brightness', min: 0.5, max: 1.2, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.3, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.3, step: 0.02 },
    ...advancedGradeFields,
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'templeFoundationAccent', label: 'Temple Foundation Accent', fields: [
    { k: 'sectionFraction', label: 'Position', min: 0, max: 1, step: 0.01 },
    { k: 'y', label: 'Top Y', min: 340, max: 560, step: 1 },
    { k: 'height', min: 40, max: 180, step: 1 },
    { k: 'widthScale', label: 'Width', min: 0.4, max: 2.4, step: 0.02 },
    { k: 'parallax', min: 0.3, max: 1.05, step: 0.01 },
    { k: 'brightness', label: 'Brightness', min: 0.5, max: 1.2, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.3, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.3, step: 0.02 },
    ...advancedGradeFields,
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'groundTransition', label: 'Ground Transition', fields: [
    { k: 'y', label: 'Top Y', min: 460, max: 640, step: 1 },
    { k: 'height', min: 48, max: 180, step: 1 },
    { k: 'parallax', min: 0.8, max: 1.15, step: 0.01 },
    { k: 'brightness', label: 'Brightness', min: 0.6, max: 1.3, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.4, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.4, step: 0.02 },
    ...advancedGradeFields,
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'groundLane', label: 'Path / Ground Lane', fields: [
    { k: 'y', label: 'Top Y', min: 480, max: 680, step: 1 },
    { k: 'height', min: 40, max: 220, step: 1 },
    { k: 'parallax', min: 0.6, max: 1.2, step: 0.01 },
    { k: 'brightness', label: 'Brightness', min: 0.6, max: 1.3, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.4, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.3, step: 0.02 },
    ...advancedGradeFields,
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'foregroundRubble', label: 'Foreground Rubble', fields: [
    { k: 'y', label: 'Top Y', min: 380, max: 630, step: 1 },
    { k: 'height', min: 40, max: 260, step: 1 },
    { k: 'parallax', min: 0.6, max: 1.4, step: 0.01 },
    { k: 'brightness', label: 'Brightness', min: 0.5, max: 1.4, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.5, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.5, step: 0.02 },
    { k: 'sepia', label: 'Warmth', min: 0, max: 50, step: 1 },
    { k: 'hue', label: 'Hue', min: -24, max: 24, step: 1 },
    ...advancedGradeFields,
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'foregroundDepth', label: 'Foreground Depth', fields: [
    { k: 'y', label: 'Top Y', min: 480, max: 630, step: 1 },
    { k: 'height', min: 20, max: 160, step: 1 },
    { k: 'parallax', min: 0.6, max: 1.4, step: 0.01 },
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'ruinedTempleCliffSkyGrade', label: 'Temple Cliff / Sky Grade', fields: [
    { k: 'brightness', label: 'Brightness', min: 0.5, max: 1.4, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.6, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.5, step: 0.02 },
    { k: 'sepia', label: 'Warmth', min: 0, max: 60, step: 1 },
    { k: 'hue', label: 'Hue', min: -45, max: 45, step: 1 },
    ...advancedGradeFields,
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
  { key: 'ruinedTempleTempleMaskGrade', label: 'Temple Mask Grade', fields: [
    { k: 'brightness', label: 'Brightness', min: 0.5, max: 1.4, step: 0.02 },
    { k: 'saturate', label: 'Saturation', min: 0.2, max: 1.6, step: 0.02 },
    { k: 'contrast', label: 'Contrast', min: 0.5, max: 1.5, step: 0.02 },
    { k: 'sepia', label: 'Warmth', min: 0, max: 60, step: 1 },
    { k: 'hue', label: 'Hue', min: -45, max: 45, step: 1 },
    ...advancedGradeFields,
    { k: 'alpha', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  ] },
];
