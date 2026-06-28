// Rome expedition audio — music tracks, stingers, and SFX definitions.
// All asset paths are placeholders until audio is composed / recorded.
// This file is imported by the Rome-specific journey controller only, never by Egypt.

export const ROME_AUDIO_TRACKS = {
  music: {
    romanRoad:     'assets/expedition/audio/rome/rome-via-sacra-ambience.mp3',
    romanForum:    'assets/expedition/audio/rome/rome-forum-ruins-ambience.mp3',
    romanThermae:  'assets/expedition/audio/rome/rome-thermae-depths.mp3',
    romanBasilica: 'assets/expedition/audio/rome/rome-basilica-interior.mp3',
    romanVaultBoss:'assets/expedition/audio/rome/rome-legate-boss-ambience.mp3',
    fallback:      'assets/expedition/audio/rome/rome-fallback-ambient.mp3',
  },
  stingers: {
    evidenceDiscovery: 'assets/expedition/audio/rome/rome-evidence-discovery-stinger.mp3',
    gateUnlock:        'assets/expedition/audio/rome/rome-gate-unlock-stinger.mp3',
  },
  sfx: {
    // Footsteps — marble / stone surface
    footstepMarble: {
      synth: 'romeMarbleStep',
      synthVolume: 1.1,
      randomize: true,
      cooldownMs: 340,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/marble-step-a.wav', volume: 0.15, playbackRate: 0.94 },
        { path: 'assets/expedition/sfx/rome/generated/marble-step-b.wav', volume: 0.13, playbackRate: 1.04 },
      ],
    },

    // Jump & land
    jump:  { path: 'assets/expedition/sfx/rome/generated/stone-jump.wav',  volume: 0.28, playbackRate: 1.22 },
    land:  { path: 'assets/expedition/sfx/rome/generated/stone-land.wav',  volume: 0.38 },

    // Pickups
    pickupTool: [
      { path: 'assets/expedition/sfx/rome/generated/leather-satchel.wav',  volume: 0.38 },
      { path: 'assets/expedition/sfx/rome/generated/iron-buckle.wav',       volume: 0.28, delay: 60 },
      { path: 'assets/expedition/sfx/rome/generated/metal-clink.wav',       volume: 0.30, delay: 100, playbackRate: 1.06 },
    ],
    pickupShard: {
      cooldownMs: 120,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/coin-clink-a.wav',   volume: 0.30, playbackRate: 0.94 },
        { path: 'assets/expedition/sfx/rome/generated/metal-clink.wav',    volume: 0.14, delay: 65, playbackRate: 1.22 },
        { path: 'assets/expedition/sfx/rome/generated/coin-clink-b.wav',   volume: 0.12, delay: 120, playbackRate: 1.32 },
      ],
    },
    pickupUpgrade: { path: 'assets/expedition/sfx/rome/generated/metal-clink.wav', volume: 0.40, playbackRate: 0.90 },

    // Gates
    gateUnlock:  { path: 'assets/expedition/sfx/rome/generated/iron-gate-open.wav',    volume: 0.50 },
    gateBlocked: { path: 'assets/expedition/sfx/rome/generated/iron-gate-blocked.wav', volume: 0.42 },

    // Combat — gladius swing
    attackSwing: {
      synth: 'romeGladiusSwing',
      synthVolume: 1.25,
      cooldownMs: 240,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/leather-satchel.wav', volume: 0.10, delay: 28, playbackRate: 0.92 },
      ],
    },
    combatDeflect: {
      synth: 'romeShieldDeflect',
      synthVolume: 1.20,
      cooldownMs: 180,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/metal-clink.wav', volume: 0.18, playbackRate: 1.40 },
      ],
    },

    // Enemy hit SFX — one per enemy type (synth-only until WAV assets arrive)
    romeEnemyHit: {
      synth: 'romeEnemyImpact',
      synthVolume: 1.05,
      cooldownMs: 120,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/enemy-hit-legion.wav', volume: 0.18, playbackRate: 1.10 },
      ],
    },
    romeGladiatorHit: {
      synth: 'romeGladiatorImpact',
      synthVolume: 1.14,
      cooldownMs: 120,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/enemy-hit-gladiator.wav', volume: 0.20, playbackRate: 1.05 },
      ],
    },
    romeRatHit: {
      synth: 'romeSmallImpact',
      synthVolume: 0.92,
      cooldownMs: 100,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/enemy-hit-rat.wav', volume: 0.12, playbackRate: 1.50 },
      ],
    },
    romeWispHit: {
      synth: 'romeWispImpact',
      synthVolume: 1.08,
      cooldownMs: 110,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/enemy-hit-wisp.wav', volume: 0.10, playbackRate: 0.86 },
      ],
    },
    romeGolemHit: {
      synth: 'romeGolemImpact',
      synthVolume: 1.22,
      cooldownMs: 140,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/enemy-hit-golem.wav', volume: 0.24, playbackRate: 0.78 },
      ],
    },
    romeBossHit: {
      synth: 'romeLegateImpact',
      synthVolume: 1.20,
      cooldownMs: 160,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/boss-hit-legate.wav', volume: 0.24, playbackRate: 0.80 },
      ],
    },
    playerHit: {
      synth: 'romePlayerImpact',
      synthVolume: 1.14,
      cooldownMs: 220,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/player-hit.wav', volume: 0.20, playbackRate: 0.96 },
      ],
    },

    // Traps — pressure plate, steam burst, falling block
    trapPressurePlate: {
      synth: 'romePresurePlate',
      synthVolume: 1.10,
      cooldownMs: 320,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/stone-scrape.wav', volume: 0.16, playbackRate: 0.72 },
      ],
    },
    trapSteamBurst: {
      synth: 'romeSteamBurst',
      synthVolume: 1.05,
      cooldownMs: 260,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/steam-hiss.wav', volume: 0.22, playbackRate: 0.88 },
      ],
    },
    trapFallingBlock: {
      synth: 'romeStoneFall',
      synthVolume: 1.18,
      cooldownMs: 260,
      clips: [
        { path: 'assets/expedition/sfx/rome/generated/stone-impact.wav', volume: 0.26, playbackRate: 0.68 },
      ],
    },
    bossWarning: { path: 'assets/expedition/sfx/rome/generated/legate-approach-warning.wav', volume: 0.36 },

    // Opening atmosphere — Roman road ambience
    openingRomeAtmosphere: {
      cooldownMs: 36000,
      clips: [
        { id: 'wind-roman-low',  path: 'assets/expedition/sfx/rome/opening/rome-opening-wind.ogg',       volume: 0.18, playbackRate: 0.86, loop: true },
        { id: 'wind-roman-mid',  path: 'assets/expedition/sfx/rome/opening/rome-opening-wind.ogg',       volume: 0.10, delay: 10000, playbackRate: 1.06, loop: true },
        { path: 'assets/expedition/sfx/rome/opening/rome-opening-stone-rumble.ogg', volume: 0.18, delay: 400,  playbackRate: 0.66 },
        { path: 'assets/expedition/sfx/rome/opening/rome-opening-stone-rumble.ogg', volume: 0.12, delay: 9200, playbackRate: 0.56 },
        { path: 'assets/expedition/sfx/rome/opening/rome-opening-earth-groan.flac', volume: 0.16, delay: 20000, playbackRate: 0.80 },
      ],
    },
  },
};

