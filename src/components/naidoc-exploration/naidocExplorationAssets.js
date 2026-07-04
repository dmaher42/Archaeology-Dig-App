export const NAIDOC_EXPLORATION_ASSETS = {
  background: {
    src: 'assets/naidoc-exploration/backgrounds/naidoc-country-discovery-panorama-2026.png',
    width: 1983,
    height: 793,
  },
  player: {
    src: 'assets/naidoc-exploration/player/student-explorer-sprite-strip-384x192.png',
    width: 384,
    height: 192,
    frameWidth: 96,
    frameHeight: 192,
    frameCount: 4,
  },
  markers: {
    src: 'assets/naidoc-exploration/markers/knowledge-marker-sheet-512x128.png',
    width: 512,
    height: 128,
    frameWidth: 128,
    frameHeight: 128,
    states: ['available', 'collected', 'locked', 'info'],
  },
  props: {
    src: 'assets/naidoc-exploration/props/naidoc-classroom-props-sheet-1024x256.png',
    width: 1024,
    height: 256,
    frameWidth: 256,
    frameHeight: 256,
    frames: ['archaeology', 'river', 'milestone', 'reflection'],
  },
};
