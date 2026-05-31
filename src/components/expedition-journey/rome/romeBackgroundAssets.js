// Rome background parallax pack definitions — placeholder atlas paths until art is delivered.

export const ROME_VIA_SACRA_BACKGROUND_ATLAS_BASE_PATH        = 'assets/expedition/backgrounds/rome-via-sacra/';
export const ROME_FORUM_RUINS_BACKGROUND_ATLAS_BASE_PATH      = 'assets/expedition/backgrounds/rome-forum-ruins/';
export const ROME_THERMAE_BACKGROUND_ATLAS_BASE_PATH          = 'assets/expedition/backgrounds/rome-subterranean-thermae/';
export const ROME_BASILICA_BACKGROUND_ATLAS_BASE_PATH         = 'assets/expedition/backgrounds/rome-basilica-interior/';
export const ROME_VAULT_BACKGROUND_ATLAS_BASE_PATH            = 'assets/expedition/backgrounds/rome-sealed-vault/';

export const ROME_VIA_SACRA_BACKGROUND_ATLAS_JSON   = `${ROME_VIA_SACRA_BACKGROUND_ATLAS_BASE_PATH}rome-via-sacra-parallax-pack.json`;
export const ROME_FORUM_RUINS_BACKGROUND_ATLAS_JSON = `${ROME_FORUM_RUINS_BACKGROUND_ATLAS_BASE_PATH}rome-forum-ruins-parallax-pack.json`;
export const ROME_THERMAE_BACKGROUND_ATLAS_JSON     = `${ROME_THERMAE_BACKGROUND_ATLAS_BASE_PATH}rome-thermae-parallax-pack.json`;
export const ROME_BASILICA_BACKGROUND_ATLAS_JSON    = `${ROME_BASILICA_BACKGROUND_ATLAS_BASE_PATH}rome-basilica-parallax-pack.json`;
export const ROME_VAULT_BACKGROUND_ATLAS_JSON       = `${ROME_VAULT_BACKGROUND_ATLAS_BASE_PATH}rome-vault-parallax-pack.json`;

// Layer key contracts per section — what the parallax renderer expects in each atlas
export const ROME_BACKGROUND_DEPTH_MODE = 'rome-section-parallax-v1';

export const ROME_SECTION_BACKGROUND_PACKS = {
  'via-sacra': {
    basePath: ROME_VIA_SACRA_BACKGROUND_ATLAS_BASE_PATH,
    atlasPath: ROME_VIA_SACRA_BACKGROUND_ATLAS_JSON,
    expectedKeys: [
      'viaSacraSky',          // distant sky — warm Italian midday haze
      'farAqueductArches',    // aqueduct silhouette, very slow parallax
      'distantHillSide',      // Palatine/Capitoline hill ridge
      'midgroundRoadRuins',   // broken portico columns, mid scroll
      'foregroundDust',       // ground-level dust and road debris
    ],
  },
  'forum-ruins': {
    basePath: ROME_FORUM_RUINS_BACKGROUND_ATLAS_BASE_PATH,
    atlasPath: ROME_FORUM_RUINS_BACKGROUND_ATLAS_JSON,
    expectedKeys: [
      'forumSky',             // dusty ochre sky, late afternoon
      'farTempleColonnades',  // distant colonnades, near-silhouette
      'distantForumRuins',    // fallen columns and archways
      'midgroundForumFloor',  // cracked marble paving slabs
      'foregroundColumnDust', // drifting limestone dust
    ],
  },
  'subterranean-thermae': {
    basePath: ROME_THERMAE_BACKGROUND_ATLAS_BASE_PATH,
    atlasPath: ROME_THERMAE_BACKGROUND_ATLAS_JSON,
    expectedKeys: [
      'thermaeDeepAtmosphere', // deep underground ambience, dark warm tones
      'farHypocaustPillars',   // hypocaust pillar forest receding into darkness
      'distantBarrelVaults',   // barrel vaults with steam haze
      'midgroundSteamChannels', // active steam channels, tile floor visible
      'foregroundSteamMist',   // foreground rolling steam
    ],
  },
  'basilica-interior': {
    basePath: ROME_BASILICA_BACKGROUND_ATLAS_BASE_PATH,
    atlasPath: ROME_BASILICA_BACKGROUND_ATLAS_JSON,
    expectedKeys: [
      'basilicaSky',           // dusty light through clerestory windows
      'farApseWall',           // apse mosaic or painted wall, far
      'distantNaveColumns',    // nave column rows receding
      'midgroundMarbleFloor',  // polished marble floor reflections
      'foregroundColumnShadow', // foreground column shadow edge
    ],
  },
  'sealed-vault': {
    basePath: ROME_VAULT_BACKGROUND_ATLAS_BASE_PATH,
    atlasPath: ROME_VAULT_BACKGROUND_ATLAS_JSON,
    expectedKeys: [
      'vaultDarkAtmosphere',   // sealed chamber deep black
      'farInscribedWalls',     // carved inscription walls, faint torch glow
      'distantSealedArchways', // sealed archways and iron-banded doors
      'midgroundVaultFloor',   // cracked stone floor, dried puddles
      'foregroundAshDrift',    // volcanic ash drifting (79 AD aftermath)
    ],
  },
};

// Section-to-music-track mapping for Rome audio system
export const ROME_SECTION_MUSIC_TRACKS = {
  'via-sacra':             'romanRoad',
  'forum-ruins':           'romanForum',
  'subterranean-thermae':  'romanThermae',
  'basilica-interior':     'romanBasilica',
  'sealed-vault':          'romanVaultBoss',
};
