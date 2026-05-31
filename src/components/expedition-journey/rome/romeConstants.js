// Rome expedition — world constants. All values are Rome-only; do not import from journeyConstants.

export const ROME_BASE_WORLD_WIDTH = 9060;
export const ROME_HORIZONTAL_SCALE = 5.65;
export const scaleRomeX = (x) => Math.round(x * ROME_HORIZONTAL_SCALE);
export const ROME_WORLD_WIDTH = scaleRomeX(ROME_BASE_WORLD_WIDTH);
export const ROME_GROUND_Y = 595;
export const ROME_VERTICAL_OFFSET = 235;

// Asha Rome variant — a new sprite atlas. Placeholder paths until art is delivered.
export const PLAYER_ROME_HERO_SPRITE_ATLAS_JSON = 'assets/expedition/player/asha-rome-variant-spritesheet.json';
export const PLAYER_ROME_HERO_SPRITE_VERSION = 'asha-rome-variant-spritesheet-placeholder-2026-05-31';

// Rome weapon — gladius replaces khopesh
export const ROME_PLAYER_WEAPON_ATLAS_JSON = 'assets/expedition/player/gladius-weapon-pack.json';
export const ROME_PLAYER_WEAPON_ATLAS_VERSION = 'gladius-weapon-pack-placeholder-2026-05-31';
export const ROME_EXPECTED_PLAYER_WEAPON_ASSET_KEYS = [
  'gladiusIdle',
  'gladiusWindup',
  'gladiusSwing',
  'gladiusReady',
];

// Section IDs
export const ROME_SECTION_IDS = {
  VIA_SACRA:   'via-sacra',
  FORUM_RUINS: 'forum-ruins',
  THERMAE:     'subterranean-thermae',
  BASILICA:    'basilica-interior',
  VAULT:       'sealed-vault',
};
