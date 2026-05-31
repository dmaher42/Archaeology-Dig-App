export const CHINA_AUDIO_TRACKS = {
  music: {
    'bamboo-forest': 'assets/expedition/audio/china-bamboo-forest.mp3',
    'rammed-earth-gate': 'assets/expedition/audio/china-earth-gate-tension.mp3',
    'terracotta-tomb': 'assets/expedition/audio/china-terracotta-tomb.mp3',
    'china-boss': 'assets/expedition/audio/china-boss-ambience.mp3',
  },
  stingers: {
    chinaEvidenceDiscovery: 'assets/expedition/audio/china-evidence-stinger.mp3',
    chinaGateUnlock: 'assets/expedition/audio/china-gate-unlock.mp3',
  },
  sfx: {
    chinaGuardianWalk: {
      synth: 'dustStep',
      synthVolume: 1.5,
      randomize: true,
      cooldownMs: 400,
      clips: [
        { path: 'assets/expedition/sfx/generated/stone-gate-blocked.wav', volume: 0.3, playbackRate: 0.8 },
      ],
    },
    chinaGuardianAttack: {
      synth: 'softSwing',
      synthVolume: 1.5,
      cooldownMs: 300,
      clips: [
        { path: 'assets/expedition/sfx/generated/stone-gate-open.wav', volume: 0.4, playbackRate: 1.2 },
      ],
    },
    chinaCrossbowTrap: {
      synth: 'softSwing',
      synthVolume: 1.8,
      cooldownMs: 200,
      clips: [
        { path: 'assets/expedition/sfx/generated/metal-click.wav', volume: 0.5, playbackRate: 1.5 },
      ],
    },
    chinaBossWarning: { path: 'assets/expedition/sfx/generated/stone-gate-blocked.wav', volume: 0.6 },
    chinaBossHit: { path: 'assets/expedition/sfx/generated/relic-shard.wav', volume: 0.8, playbackRate: 0.5 },
  }
};
