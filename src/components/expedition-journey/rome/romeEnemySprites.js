// Rome enemy sprite definitions for the playable Section One route.

const ROME_ENEMY_SPRITE_BASE_PATH = 'assets/expedition/enemies/rome/';

export const ROME_LEGION_SHADE_SPRITE_ATLAS_JSON = `${ROME_ENEMY_SPRITE_BASE_PATH}rome-legion-shade-sprites.json`;
export const ROME_GLADIATOR_REVENANT_SPRITE_ATLAS_JSON = `${ROME_ENEMY_SPRITE_BASE_PATH}rome-gladiator-revenant-sprites.json`;
export const ROME_FORUM_RAT_SPRITE_ATLAS_JSON = `${ROME_ENEMY_SPRITE_BASE_PATH}rome-forum-rat-sprites.json`;
export const ROME_VESTIBULE_WISP_SPRITE_ATLAS_JSON = `${ROME_ENEMY_SPRITE_BASE_PATH}rome-vestibule-wisp-sprites.json`;
export const ROME_MARBLE_GOLEM_SPRITE_ATLAS_JSON = `${ROME_ENEMY_SPRITE_BASE_PATH}rome-marble-golem-sprites.json`;

// Standard 8-key animation contract (idle, walk1-3, windup, attack, hit, defeated)
const standardKeys = (prefix) => [
  `${prefix}Idle`,
  `${prefix}Walk1`,
  `${prefix}Walk2`,
  `${prefix}Walk3`,
  `${prefix}Windup`,
  `${prefix}Attack`,
  `${prefix}Hit`,
  `${prefix}Defeated`,
];

export const EXPECTED_ROME_LEGION_SHADE_SPRITE_KEYS = standardKeys('legionShade');
export const EXPECTED_ROME_GLADIATOR_REVENANT_SPRITE_KEYS = standardKeys('gladiatorRevenant');
export const EXPECTED_ROME_FORUM_RAT_SPRITE_KEYS = standardKeys('forumRat');
export const EXPECTED_ROME_VESTIBULE_WISP_SPRITE_KEYS = standardKeys('vestibuleWisp');
export const EXPECTED_ROME_MARBLE_GOLEM_SPRITE_KEYS = standardKeys('marbleGolem');

const ROME_ENEMY_SPRITE_PACKS = {
  legionShade: {
    atlasPath: ROME_LEGION_SHADE_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_ROME_LEGION_SHADE_SPRITE_KEYS,
  },
  gladiatorRevenant: {
    atlasPath: ROME_GLADIATOR_REVENANT_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_ROME_GLADIATOR_REVENANT_SPRITE_KEYS,
  },
  forumRat: {
    atlasPath: ROME_FORUM_RAT_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_ROME_FORUM_RAT_SPRITE_KEYS,
  },
  vestibuleWisp: {
    atlasPath: ROME_VESTIBULE_WISP_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_ROME_VESTIBULE_WISP_SPRITE_KEYS,
  },
  marbleGolem: {
    atlasPath: ROME_MARBLE_GOLEM_SPRITE_ATLAS_JSON,
    expectedKeys: EXPECTED_ROME_MARBLE_GOLEM_SPRITE_KEYS,
  },
};

export const ROME_ENEMY_SPRITE_PACK_IDS = Object.keys(ROME_ENEMY_SPRITE_PACKS);
