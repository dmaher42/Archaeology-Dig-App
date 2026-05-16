export const DYNAMIC_WORLD_EFFECTS_SRC = 'assets/expedition/environment/dynamic-world/egypt-dynamic-world-effects.png';
export const DYNAMIC_WORLD_EFFECTS_VERSION = 'painted-dynamic-world-effects-2026-05-16';

export const DYNAMIC_WORLD_EFFECT_REGIONS = {
  dustGust: { x: 0, y: 0, w: 627, h: 627 },
  birdsScatter: { x: 627, y: 0, w: 627, h: 627 },
  shrineGlow: { x: 0, y: 627, w: 627, h: 627 },
  rockfall: { x: 627, y: 627, w: 627, h: 627 },
};

export const createDynamicWorldAssetState = () => ({
  image: null,
  loaded: false,
  failed: false,
  src: DYNAMIC_WORLD_EFFECTS_SRC,
  version: DYNAMIC_WORLD_EFFECTS_VERSION,
});

export const loadDynamicWorldAssetPack = ({ baseUrl = '/', onUpdate } = {}) => {
  let cancelled = false;
  const image = new Image();

  image.onload = () => {
    if (cancelled) return;
    onUpdate?.({
      image,
      loaded: true,
      failed: false,
      src: DYNAMIC_WORLD_EFFECTS_SRC,
      version: DYNAMIC_WORLD_EFFECTS_VERSION,
    });
  };

  image.onerror = () => {
    if (cancelled) return;
    onUpdate?.({
      ...createDynamicWorldAssetState(),
      failed: true,
    });
  };

  image.src = `${baseUrl}${DYNAMIC_WORLD_EFFECTS_SRC}`;

  return () => {
    cancelled = true;
  };
};

export const getDynamicWorldEffectRegion = (type) => {
  if (type === 'shrine-glow') return DYNAMIC_WORLD_EFFECT_REGIONS.shrineGlow;
  if (type === 'rockfall' || type === 'ruin-collapse') return DYNAMIC_WORLD_EFFECT_REGIONS.rockfall;
  return null;
};

export const usesPaintedDynamicWorldEffect = (type) => (
  type === 'shrine-glow'
  || type === 'rockfall'
  || type === 'ruin-collapse'
);
