export const CANVAS_WIDTH = 1120;
export const CANVAS_HEIGHT = 630;
export const CANVAS_NATIVE_WIDTH = 1280;
export const CANVAS_NATIVE_HEIGHT = 720;
export const JOURNEY_HORIZONTAL_SCALE = 5.65;
export const BASE_WORLD_WIDTH = 8200;
export const scaleJourneyX = (x) => Math.round(x * JOURNEY_HORIZONTAL_SCALE);
export const WORLD_WIDTH = scaleJourneyX(BASE_WORLD_WIDTH);
export const GROUND_Y = 595;
export const JOURNEY_VERTICAL_OFFSET = 235;
export const PLAYER_WIDTH = 28;
export const PLAYER_HEIGHT = 42;
export const GRAVITY = 1850;
export const MOVE_SPEED = 245;
export const JUMP_SPEED = 620;
export const ATTACK_COOLDOWN = 0.38;
export const ATTACK_DURATION = 0.24;
export const ATTACK_WINDUP_DURATION = 0.08;
export const ATTACK_RECOIL_DURATION = 0.12;
export const INVULNERABLE_DURATION = 1.05;

export const PLAYER_SPRITE_SRC = 'sprites/archaeologist-walk-cycle.png';
export const PLAYER_SPRITE_FRAME_COUNT = 4;
export const PLAYER_SPRITE_FRAME_WIDTH = 390;
export const PLAYER_SPRITE_FRAME_HEIGHT = 560;
export const PLAYER_SPRITE_DRAW_HEIGHT = 86;
export const PLAYER_SPRITE_SCALE = PLAYER_SPRITE_DRAW_HEIGHT / PLAYER_SPRITE_FRAME_HEIGHT;

export const INITIAL_JOURNEY_NOTICE = '';
