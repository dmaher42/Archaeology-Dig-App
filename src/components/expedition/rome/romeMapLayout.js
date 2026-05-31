// Rome excavation map — dig-site zone layout and room connections.
// Canvas dimensions match Egypt: 800 × 560. All zones tile within that space.

export const ROME_EXCAVATION_MAP_WIDTH  = 800;
export const ROME_EXCAVATION_MAP_HEIGHT = 560;

export const ROME_EXCAVATION_ZONES = [
  {
    id: 'via-sacra-trench',
    name: 'Via Sacra Trench',
    x: 0,
    y: 0,
    w: 280,
    h: 210,
    terrain: 'romeSacraRoadTerrain',
    description: 'Compacted gravel and limestone fragments mark the buried road surface.',
    connections: ['forum-pit'],
  },
  {
    id: 'forum-pit',
    name: 'Forum Pit',
    x: 0,
    y: 210,
    w: 280,
    h: 200,
    terrain: 'romeForumPitTerrain',
    description: 'Cracked marble paving and column stump bases are embedded in ash-rich fill.',
    connections: ['via-sacra-trench', 'thermae-shaft', 'civic-wing'],
  },
  {
    id: 'thermae-shaft',
    name: 'Thermae Shaft',
    x: 280,
    y: 0,
    w: 260,
    h: 210,
    terrain: 'romeThermaeShaftTerrain',
    description: 'Lead pipe sections and tile stack remnants indicate an underground heat system.',
    connections: ['via-sacra-trench', 'basilica-floor'],
  },
  {
    id: 'basilica-floor',
    name: 'Basilica Floor',
    x: 540,
    y: 0,
    w: 260,
    h: 210,
    terrain: 'romeBasilicaFloorTerrain',
    description: 'Polished marble fragments and bronze fitting holes suggest a public administrative hall.',
    connections: ['thermae-shaft'],
  },
  {
    id: 'civic-wing',
    name: 'Civic Wing',
    x: 280,
    y: 210,
    w: 260,
    h: 200,
    terrain: 'romeCivicWingTerrain',
    description: 'A dense scatter of pottery, lamp fragments and coin flans point to civic activity.',
    connections: ['forum-pit', 'sealed-archive'],
  },
  {
    id: 'sealed-archive',
    name: 'Sealed Archive',
    x: 540,
    y: 210,
    w: 260,
    h: 350,
    terrain: 'romeNeutralExcavationTerrain',
    description: 'A heavy stone door seals this chamber. Traces of wax and lead suggest official records within.',
    connections: ['civic-wing'],
    locked: true,
  },
];

// Flat room-connection lookup — same pattern as Egypt's EXPEDITION_ROOM_CONNECTIONS
export const ROME_EXCAVATION_ROOM_CONNECTIONS = ROME_EXCAVATION_ZONES.reduce((acc, zone) => {
  acc[zone.id] = zone.connections;
  return acc;
}, {});

// Zone → terrain type lookup for the dig-phase renderer
export const ROME_EXCAVATION_ROOM_ZONE_BY_ID = Object.fromEntries(
  ROME_EXCAVATION_ZONES.map((z) => [z.id, z.terrain]),
);
