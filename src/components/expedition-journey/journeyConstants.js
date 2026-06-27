export const CANVAS_WIDTH = 1120;
export const CANVAS_HEIGHT = 630;
export const CANVAS_NATIVE_WIDTH = 1280;
export const CANVAS_NATIVE_HEIGHT = 720;
export const JOURNEY_HORIZONTAL_SCALE = 7.35;
export const BASE_WORLD_WIDTH = 9060;
export const scaleJourneyX = (x) => Math.round(x * JOURNEY_HORIZONTAL_SCALE);
export const SACRED_EXTERIOR_SPACING_BASE_UNITS = Object.freeze({
  muralApproach: 120,
  scribeApproach: 240,
});
export const sacredMuralExteriorX = (x) => scaleJourneyX(x + SACRED_EXTERIOR_SPACING_BASE_UNITS.muralApproach);
export const sacredScribeExteriorX = (x) => scaleJourneyX(x + SACRED_EXTERIOR_SPACING_BASE_UNITS.scribeApproach);
export const WORLD_WIDTH = scaleJourneyX(BASE_WORLD_WIDTH);
export const GROUND_Y = 595;
export const JOURNEY_VERTICAL_OFFSET = 235;
export const JOURNEY_EXTERIOR_SCENE_ID = 'journey-exterior-route';
export const PLAYER_WIDTH = 28;
export const PLAYER_HEIGHT = 42;
export const DESERT_ENTRY_EXTERIOR_SPAWN_X = 128;
export const GRAVITY = 1850;
export const MOVE_SPEED = 260;
export const JUMP_SPEED = 620;
export const JUMP_CUT_MULTIPLIER = 0.52;
export const JUMP_CUT_FEEDBACK_TIME = 0.12;
export const MOVE_ACCELERATION = 2650;
export const MOVE_DECELERATION = 3500;
export const AIR_ACCELERATION = 1700;
export const AIR_DECELERATION = 1300;
export const COYOTE_TIME = 0.11;
export const JUMP_BUFFER_TIME = 0.13;
export const ATTACK_COOLDOWN = 0.38;
export const ATTACK_DURATION = 0.42;
export const ATTACK_WINDUP_DURATION = 0.12;
export const ATTACK_RECOIL_DURATION = 0.18;
export const INVULNERABLE_DURATION = 0.58;

// Combat damage scale. Enemy/boss effective HP and Asha's attack damage are both
// multiplied by this factor so tuning has finer resolution (e.g. an unprimed-heavy
// "shove" can deal a little damage instead of being stuck at 0 or 1). Kill-counts are
// unchanged because both sides scale together: 1 raw HP unit = 1 light hit = this value.
// Note: enemy damage TO Asha is NOT scaled — her Endurance is already a 0-100 pool.
export const COMBAT_DAMAGE_SCALE = 10;

// Player endurance recovery + field-rescue messaging. Pure tuning/text consumed by the
// journey update loop and HUD; the survival logic that reads them stays in the component.
export const LOW_STAMINA_WARNING = 'Endurance low — avoid another hit.';
export const FIELD_RESCUE_MESSAGE = 'You were forced back to the last checkpoint. Recover and try again.';
export const FIELD_RESCUE_STAMINA_REASON = 'Endurance overwhelmed.';
export const EXHAUSTED_RECOVERY_RATE = 4; // Endurance per second while exhausted at zero
export const EXHAUSTED_RECOVERY_CEILING = 15; // auto-recovery stops here; enough to dodge once

// Boss sprite load grace — boss art swaps in after this delay.
export const INITIAL_BOSS_SPRITE_LOAD_DELAY_MS = 9000;

// Guardian knowledge-challenge config (currently disabled) + feedback copy.
export const KNOWLEDGE_CHALLENGE_SIZE = 3;
export const GUARDIAN_KNOWLEDGE_CHALLENGES_ENABLED = false;
export const KNOWLEDGE_CHALLENGE_FEEDBACK = {
  correct: 'Correct. Your field knowledge strengthens you.',
  incorrect: 'Not quite. The guardian grows stronger.',
};

// Pyramid-climb jump tuning — Asha jumps higher on the opening pyramid ground/air.
export const OPENING_PYRAMID_GROUND_JUMP_MULTIPLIER = 1.32;
export const OPENING_PYRAMID_AIR_JUMP_MULTIPLIER = 1.6;

// Perfect dodge: a last-instant dodge (the blow lands while Asha is still in her
// dodge i-frames) deflects ANY attack — even red unblockables — and refunds some
// Endurance, turning evasion into the primary, readable parry.
export const PERFECT_DODGE_ENDURANCE_REWARD = 6;
// How close an enemy's front edge must be to the player body before committing to a windup.
// Kept deliberately small so the freeze reads as "right on you" not "approaching from afar".
export const ENEMY_ATTACK_TRIGGER_REACH = 16;
// Gap (in px) an enemy keeps between its body edge and Asha's body edge when
// pressing the attack. Larger than 0 so sprites never overlap/"share her space",
// but smaller than ENEMY_ATTACK_TRIGGER_REACH so melee still lands at standoff.
export const ENEMY_COMBAT_STANDOFF_GAP = 6;
export const BOSS_INTRO_PLAYER_STANDOFF = 65;

// localStorage keys for the journey character loader + DEV prop editor.
export const CHARACTER_LOADER_STORAGE_KEY = 'expedition-character-loader-choice';
export const JOURNEY_PROP_EDITOR_STORAGE_KEY = 'expedition-journey-prop-editor-edits-v1';
export const JOURNEY_PROP_EDITOR_SECTIONS_KEY = 'expedition-journey-prop-editor-collapsed-sections-v1';
export const JOURNEY_PROP_EDITOR_PANEL_POS_KEY = 'expedition-journey-prop-editor-panel-pos-v1';
export const CHARACTER_LOADER_VISIBILITY_STORAGE_KEY = 'expedition-character-loader-visible-v3';

// Boss focus padding + Scarab Queen lair intro/camera tuning (update loop + cinematic).
export const BOSS_DOMAIN_ENEMY_FOCUS_PADDING = 96;
export const SCARAB_QUEEN_ENEMY_FOCUS_PADDING = 220;
export const SCARAB_QUEEN_INTRO_TRIGGER_DISTANCE = 220;
export const SCARAB_QUEEN_EMERGENCE_INTRO_SECONDS = 6.8;
export const SCARAB_QUEEN_CINEMATIC_CAMERA_ANCHOR_RATIO = 0.72;
export const SCORPION_VENOM_SPIT_VISUAL_TRAVEL_TIME = 0.48;

// Objective + gate display text, keyed by section / gate id (per civilisation).
export const OBJECTIVE_MARKER_IDS_BY_SECTION = {
  'desert-entry': ['map-tablet'],
  'ruined-temple': ['switch-1', 'switch-2', 'switch-3'],
  catacombs: ['glyph-1', 'glyph-2', 'glyph-3'],
  'escape-sequence': ['escape-beacon'],
};

export const OBJECTIVE_LABELS = {
  'desert-entry': 'Map Tablet',
  'ruined-temple': 'Switches',
  catacombs: 'Glyph Fragments',
  'escape-sequence': 'Escape Route',
  'dig-site-entrance': 'Guardian Seal',
};

export const OBJECTIVE_SINGULAR_LABELS = {
  'desert-entry': 'map tablet',
  'ruined-temple': 'switch',
  catacombs: 'glyph fragment',
  'escape-sequence': 'escape marker',
  'dig-site-entrance': 'guardian seal',
};

export const CHINA_OBJECTIVE_LABELS = {
  'desert-entry': 'River Survey Tablet',
  'ruined-temple': 'Archive Switches',
  catacombs: 'Oracle Fragments',
  'escape-sequence': 'Safe Route',
  'dig-site-entrance': 'Rammed-Earth Seal',
};

export const CHINA_OBJECTIVE_SINGULAR_LABELS = {
  'desert-entry': 'river survey tablet',
  'ruined-temple': 'archive switch',
  catacombs: 'oracle fragment',
  'escape-sequence': 'safe route marker',
  'dig-site-entrance': 'rammed-earth seal',
};

export const CHINA_GATE_NAMES = {
  'guardian-prep-seal': 'Guardian Prep Seal',
  'desert-seal': 'River Valley Seal',
  'temple-seal': 'Bronze Archive Seal',
  'catacomb-seal': 'Jade Archive Seal',
  'escape-seal': 'Field Records Seal',
  'final-gate': 'Rammed-Earth Site Gate',
};

export const CHINA_GATE_HINTS = {
  objective: {
    'desert-entry': 'The river survey tablet is still behind you on the valley route.',
    'ruined-temple': 'One archive switch is still behind you near the timber gate.',
    catacombs: 'Search the archive floor for the remaining oracle fragment.',
    'escape-sequence': 'Reach the safe route marker before the seal will open.',
    'dig-site-entrance': 'The final rammed-earth seal opens after the guardian falls.',
  },
  shards: 'Search the nearby platforms and lower route for more relic shards.',
};

export const PLAYER_HERO_SPRITE_ATLAS_JSON = 'assets/expedition/player/asha-reference-warrior-dodge-preview-spritesheet.json';
export const PLAYER_HERO_SPRITE_VERSION = 'asha-reference-warrior-dodge-backstep-tone-matched-2026-06-05';
export const PLAYER_HERO_PREVIOUS_SPRITE_ATLAS_JSON = 'assets/expedition/player/asha-hooded-warrior-explorer-spritesheet.json';
export const PLAYER_HERO_PREVIOUS_SPRITE_VERSION = 'asha-egypt-hooded-warrior-explorer-reference-2026-05-19';
export const PLAYER_HERO_FALLBACK_SPRITE_ATLAS_JSON = 'assets/expedition/player/egypt-warrior-guide-spritesheet.json';
export const PLAYER_HERO_FALLBACK_SPRITE_VERSION = 'egypt-warrior-guide-spritesheet-2026-05-17';
export const PLAYER_CHINA_HERO_SPRITE_ATLAS_JSON = 'assets/expedition/player/china-female-archaeologist-production-spritesheet.json';
export const PLAYER_CHINA_HERO_SPRITE_VERSION = 'china-female-archaeologist-production-spritesheet-2026-05-16';
export const PLAYER_LEGACY_SPRITE_SRC = 'sprites/archaeologist-walk-cycle.png';
export const PLAYER_SPRITE_SRC = PLAYER_LEGACY_SPRITE_SRC;
export const PLAYER_SPRITE_FRAME_COUNT = 4;
export const PLAYER_SPRITE_FRAME_WIDTH = 390;
export const PLAYER_SPRITE_FRAME_HEIGHT = 560;
export const PLAYER_SPRITE_DRAW_HEIGHT = 92;
export const PLAYER_SPRITE_SCALE = PLAYER_SPRITE_DRAW_HEIGHT / PLAYER_SPRITE_FRAME_HEIGHT;

export const INITIAL_JOURNEY_NOTICE = '';
