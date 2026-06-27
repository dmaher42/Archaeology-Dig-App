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
