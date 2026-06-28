import {
  CANVAS_HEIGHT,
  CANVAS_NATIVE_HEIGHT,
  CANVAS_NATIVE_WIDTH,
  CANVAS_WIDTH,
  GROUND_Y,
  WORLD_WIDTH,
} from './journeyConstants';

export const JOURNEY_VIEWPORT = Object.freeze({
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  aspectRatio: CANVAS_WIDTH / CANVAS_HEIGHT,
  targetAspectRatio: '16:9',
});

export const JOURNEY_RENDER_TARGET = Object.freeze({
  nativeWidth: CANVAS_NATIVE_WIDTH,
  nativeHeight: CANVAS_NATIVE_HEIGHT,
  nativeAspectRatio: CANVAS_NATIVE_WIDTH / CANVAS_NATIVE_HEIGHT,
  virtualToNativeScaleX: CANVAS_NATIVE_WIDTH / CANVAS_WIDTH,
  virtualToNativeScaleY: CANVAS_NATIVE_HEIGHT / CANVAS_HEIGHT,
  resolutionProfile: `${CANVAS_NATIVE_WIDTH}x${CANVAS_NATIVE_HEIGHT}-native / ${CANVAS_WIDTH}x${CANVAS_HEIGHT}-virtual`,
});

export const JOURNEY_WORLD_LAYOUT = Object.freeze({
  width: WORLD_WIDTH,
  groundY: GROUND_Y,
  groundDepth: CANVAS_HEIGHT - GROUND_Y,
  rescueFallPadding: 100,
});

export const JOURNEY_CAMERA = Object.freeze({
  followAnchorRatio: 0.38,
  bossIntroAnchorRatio: 0.48,
  bossIntroPlayerBlend: 0.3,
  bossIntroFocusBlend: 0.7,
  followSmoothing: 0.11,
  bossIntroSmoothing: 0.055,
  maxStep: 34,
});

export const JOURNEY_HUD_SAFE_AREA = Object.freeze({
  top: 24,
  right: 24,
  bottom: 18,
  left: 24,
});

export const clampCameraX = (cameraX) => (
  Math.max(0, Math.min(cameraX, JOURNEY_WORLD_LAYOUT.width - JOURNEY_VIEWPORT.width))
);

export const worldToScreenX = (worldX, cameraX) => worldX - cameraX;

export const isHorizontallyVisible = (worldX, width, cameraX, margin = 0) => {
  const screenX = worldToScreenX(worldX, cameraX);
  return screenX + width >= -margin && screenX <= JOURNEY_VIEWPORT.width + margin;
};

const placeOnGround = (height, yOffset = 0) => (
  JOURNEY_WORLD_LAYOUT.groundY - height + yOffset
);

export const placeGateOnGround = (height) => placeOnGround(height, 5);

export const getCameraFollowTarget = ({ playerCenterX, bossIntroFocusX = null }) => {
  if (Number.isFinite(bossIntroFocusX)) {
    const focusX = bossIntroFocusX * JOURNEY_CAMERA.bossIntroFocusBlend
      + playerCenterX * JOURNEY_CAMERA.bossIntroPlayerBlend;
    return {
      mode: 'boss-intro',
      focusTarget: Math.round(bossIntroFocusX),
      targetCameraX: clampCameraX(focusX - JOURNEY_VIEWPORT.width * JOURNEY_CAMERA.bossIntroAnchorRatio),
    };
  }

  return {
    mode: 'follow',
    focusTarget: Math.round(playerCenterX),
    targetCameraX: clampCameraX(playerCenterX - JOURNEY_VIEWPORT.width * JOURNEY_CAMERA.followAnchorRatio),
  };
};

export const getCanvasScaleState = (canvas) => {
  if (!canvas) {
    return {
      nativeWidth: JOURNEY_RENDER_TARGET.nativeWidth,
      nativeHeight: JOURNEY_RENDER_TARGET.nativeHeight,
      virtualWidth: JOURNEY_VIEWPORT.width,
      virtualHeight: JOURNEY_VIEWPORT.height,
      displayWidth: 0,
      displayHeight: 0,
      displayAspectRatio: 0,
      preservesAspectRatio: false,
      resolutionProfile: JOURNEY_RENDER_TARGET.resolutionProfile,
    };
  }

  const bounds = canvas.getBoundingClientRect();
  const displayAspectRatio = bounds.height > 0 ? bounds.width / bounds.height : 0;
  return {
    nativeWidth: canvas.width,
    nativeHeight: canvas.height,
    virtualWidth: JOURNEY_VIEWPORT.width,
    virtualHeight: JOURNEY_VIEWPORT.height,
    displayWidth: Math.round(bounds.width),
    displayHeight: Math.round(bounds.height),
    displayAspectRatio: Number(displayAspectRatio.toFixed(3)),
    preservesAspectRatio: Math.abs(displayAspectRatio - JOURNEY_VIEWPORT.aspectRatio) < 0.02,
    nativeScaleX: Number((canvas.width / JOURNEY_VIEWPORT.width).toFixed(3)),
    nativeScaleY: Number((canvas.height / JOURNEY_VIEWPORT.height).toFixed(3)),
    resolutionProfile: JOURNEY_RENDER_TARGET.resolutionProfile,
  };
};
