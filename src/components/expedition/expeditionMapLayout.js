export const EXPEDITION_ROOM_ZONES = [
  {
    id: 'riverbank',
    name: 'Riverbank',
    x: 0,
    y: 0,
    w: 260,
    h: 220,
    terrain: 'riverbankTerrain',
    description: 'Wet river mud, reeds and silt marks sit along the edge of the site.',
    connections: ['market'],
  },
  {
    id: 'market',
    name: 'Market Area',
    x: 0,
    y: 220,
    w: 320,
    h: 190,
    terrain: 'marketTerrain',
    description: 'Everyday materials and activity traces are scattered through an open work area.',
    connections: ['riverbank', 'burial', 'wall'],
  },
  {
    id: 'burial',
    name: 'Burial Area',
    x: 260,
    y: 0,
    w: 260,
    h: 220,
    terrain: 'burialTerrain',
    description: 'Stone edges and sunken ground suggest a protected burial space.',
    connections: ['market', 'archive'],
  },
  {
    id: 'archive',
    name: 'Archive Corner',
    x: 520,
    y: 0,
    w: 280,
    h: 220,
    terrain: 'archiveTerrain',
    description: 'Broken shelves, sealed jars and shaded debris may preserve recorded clues.',
    connections: ['burial'],
  },
  {
    id: 'wall',
    name: 'Ruined Wall',
    x: 320,
    y: 220,
    w: 260,
    h: 190,
    terrain: 'ruinedWallTerrain',
    description: 'Aligned stones and compacted foundations run across the trench.',
    connections: ['market', 'gate'],
  },
  {
    id: 'gate',
    name: 'Exit Gate',
    x: 580,
    y: 220,
    w: 220,
    h: 340,
    terrain: 'neutralExcavationTerrain',
    description: 'The final exit stays sealed until enough mission evidence has been recorded.',
    connections: ['wall'],
  },
];

export const EXPEDITION_ROOM_ZONE_BY_ID = Object.fromEntries(
  EXPEDITION_ROOM_ZONES.map(zone => [zone.id, zone]),
);

export const EXPEDITION_ROOM_CONNECTIONS = [
  { from: 'riverbank', to: 'market', points: [[130, 214], [130, 226]] },
  { from: 'market', to: 'burial', points: [[258, 254], [276, 206]] },
  { from: 'burial', to: 'archive', points: [[514, 118], [526, 118]] },
  { from: 'market', to: 'wall', points: [[314, 314], [326, 314]] },
  { from: 'wall', to: 'gate', points: [[574, 314], [586, 314]] },
];

export const getRoomZoneAtPoint = (x, y) => EXPEDITION_ROOM_ZONES.find(zone => (
  x >= zone.x && x <= zone.x + zone.w &&
  y >= zone.y && y <= zone.y + zone.h
)) || null;
