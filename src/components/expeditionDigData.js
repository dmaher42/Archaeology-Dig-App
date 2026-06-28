// Extracted from ExpeditionMode.jsx — pure module-level DATA constants for the excavation dig.
// Pure data only: no React, no component logic. Helpers live in expeditionDigLogic.js.

import {
  BookOpen,
  Camera,
  Compass,
  Hammer,
  Ruler,
  Search,
} from 'lucide-react';
import { EXPEDITION_STAGE_IDS } from './expedition/expeditionStages';

export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 560;
export const PLAYER_SIZE = 22;
export const TARGET_CIVILISATION = 'Ancient Egypt';

export const ZONES = [
  { id: 'riverbank', name: 'Entry Corridor', emoji: '👣', x: 0, y: 0, w: 260, h: 220, color: 'rgba(212, 175, 55, 0.15)' },
  { id: 'burial', name: 'Burial Chamber', emoji: '⚰️', x: 260, y: 0, w: 260, h: 220, color: 'rgba(180, 110, 80, 0.18)' },
  { id: 'archive', name: 'The Treasury', emoji: '👑', x: 520, y: 0, w: 280, h: 220, color: 'rgba(230, 185, 90, 0.15)' },
  { id: 'market', name: 'The Annex', emoji: '📦', x: 0, y: 220, w: 320, h: 190, color: 'rgba(240, 190, 110, 0.12)' },
  { id: 'wall', name: 'The Antechamber', emoji: '🛋️', x: 320, y: 220, w: 260, h: 190, color: 'rgba(160, 160, 140, 0.16)' },
  { id: 'gate', name: 'Sealed Entrance', emoji: '🔒', x: 580, y: 220, w: 220, h: 340, color: 'rgba(74, 222, 128, 0.12)' },
];

export const EXCAVATION_TERRAIN_BY_ZONE = {
  riverbank: 'roomMap:corridorTerrain',
  burial: 'roomMap:burialChamberTerrain',
  archive: 'roomMap:treasuryTerrain',
  market: 'roomMap:annexTerrain',
  wall: 'roomMap:antechamberTerrain',
  gate: 'roomMap:neutralExcavationTerrain',
};

export const EXCAVATION_VISUAL_MODE = 'egypt-room-map-stage-1';
export const EXCAVATION_MAP_VISUAL_TUNING_VERSION = 'egypt-room-map-regression-tuning-2026-05-12';
export const DEFAULT_EXCAVATION_MAP_THEME = {
  backgroundInner: '#ebdaba',
  backgroundOuter: '#d4c09d',
  neutralTileAlpha: 0.12,
  gridOverlayAlpha: 0.18,
  gridLineColor: 'rgba(100, 75, 50, 0.03)',
  surveyLineAlpha: 0.3,
  surveyLineSecondaryAlpha: 0.26,
  surveyPegAlpha: 0.58,
  pathAlpha: 0.36,
  thresholdAlpha: 0.46,
  terrainAlpha: 0.82,
  gateTerrainAlpha: 0.34,
  terrainWash: 'rgba(244, 224, 187, 0.14)',
  roomShadowAlpha: 0.16,
  labelAssetAlpha: 0.86,
  labelText: '#3a2a18',
  surveyLabelText: '#4b341d',
  selectedSurveyLabelText: '#214315',
  selectedStroke: 'rgba(33, 77, 38, 0.95)',
  idleStroke: 'rgba(92, 64, 35, 0.38)',
  selectedDashStroke: 'rgba(250, 204, 21, 0.82)',
  markerAlpha: 0.88,
  hazardAlpha: 0.92,
  hazardLabelBackground: 'rgba(255, 255, 255, 0.85)',
  hazardLabelText: '#5b2b16',
  wallAlpha: 0.9,
  wallStroke: 'rgba(74, 54, 32, 0.35)',
  playerGlowAlpha: 0.5,
};

export const CHINA_EXCAVATION_MAP_THEME = {
  ...DEFAULT_EXCAVATION_MAP_THEME,
  backgroundInner: '#ead9b2',
  backgroundOuter: '#bfa36d',
  neutralTileAlpha: 0.18,
  gridOverlayAlpha: 0.14,
  gridLineColor: 'rgba(43, 76, 54, 0.055)',
  surveyLineAlpha: 0.36,
  surveyLineSecondaryAlpha: 0.32,
  surveyPegAlpha: 0.72,
  pathAlpha: 0.48,
  thresholdAlpha: 0.62,
  terrainAlpha: 0.94,
  gateTerrainAlpha: 0.42,
  terrainWash: 'rgba(255, 239, 202, 0.055)',
  roomShadowAlpha: 0.1,
  labelAssetAlpha: 0.96,
  labelText: '#2f2617',
  surveyLabelText: '#3b321f',
  selectedSurveyLabelText: '#174934',
  selectedStroke: 'rgba(23, 73, 52, 0.98)',
  idleStroke: 'rgba(77, 60, 33, 0.5)',
  selectedDashStroke: 'rgba(50, 143, 102, 0.8)',
  markerAlpha: 0.94,
  hazardAlpha: 0.88,
  hazardLabelBackground: 'rgba(255, 251, 236, 0.92)',
  hazardLabelText: '#4a321d',
  wallAlpha: 0.96,
  wallStroke: 'rgba(82, 58, 29, 0.46)',
  playerGlowAlpha: 0.58,
};

export const EGYPT_ARCHIVE_ASSETS = {
  desk: 'assets/expedition/opening/archive-prologue/cairo-archive-desk-2026-06-07.png',
  report: 'assets/expedition/opening/archive-prologue/modern-pyramid-scarab-site-2026-06-07.png',
  painting: 'assets/expedition/opening/archive-prologue/tomb-painting-photo-2026-06-07.png',
  notes: 'assets/expedition/opening/archive-prologue/asha-field-notebook-2026-06-07.png',
};

export const EGYPT_ARCHIVE_TRANSPORT_ASSETS = {
  site: 'assets/expedition/opening/scarab-transport/pyramid-scarab-site-approach-2026-06-07.png',
  touch: 'assets/expedition/opening/scarab-transport/scarab-photo-comparison-touch-2026-06-07.png',
  threshold: 'assets/expedition/opening/scarab-transport/scarab-threshold-opening-2026-06-07.png',
};

export const EGYPT_ARCHIVE_PROLOGUE_ITEMS = [
  {
    id: 'museum-report',
    label: 'Site Update',
    title: 'Museum Report',
    format: 'Field record',
    visualType: 'report',
    visualSrc: EGYPT_ARCHIVE_ASSETS.report,
    body: [
      'A new site photograph records a scarab form at the pyramid crown.',
      'Earlier surveys list blank stone in the same position.',
      'Discrepancy flagged for field verification.',
    ],
  },
  {
    id: 'tomb-painting-photo',
    label: 'Archive Photograph',
    title: 'Tomb Painting Photo',
    format: 'Decades-old tomb-painting photograph',
    visualType: 'painting',
    visualSrc: EGYPT_ARCHIVE_ASSETS.painting,
    body: [
      'The painting shows this pyramid with a scarab above it.',
      'No one could explain the scene when the photograph was filed.',
      'Damaged margin: "[...] A memory returns [...]"',
      'It reads like a broken caption, not an answer.',
    ],
  },
  {
    id: 'asha-notes',
    label: "Asha's Field Notes",
    title: "Asha's Notes",
    format: 'Notebook entry',
    visualType: 'notes',
    visualSrc: EGYPT_ARCHIVE_ASSETS.notes,
    body: [
      'Everyone else treated the photograph as symbolic, mistaken, or too strange to explain.',
      'But the new report matches the old painting exactly: the real pyramid never carried that scarab until now.',
      'I keep wanting to write that it is showing what would return. That is not a conclusion. It is a question I cannot close.',
      'Either way, the scarab needs to be checked in person.',
    ],
  },
];

export const EGYPT_ARCHIVE_SITE_TRANSITION_LINES = [
  'The climb is familiar.',
  'Sun on stone.',
  'Wind across the sand.',
  'A routine site check.',
  'Asha carries the old tomb-painting photograph in her field notebook.',
  'The pyramid should be blank at the crown.',
  'Today, stone catches the light there.',
  'The scarab from the painting is real.',
  'It should not be here.',
];

export const EGYPT_ARCHIVE_SCARAB_CINEMATIC_LINES = [
  'Plain stone.',
  'No metal fitting.',
  'No modern tool marks.',
  'Asha holds the old photograph beside it.',
  'The painted scarab and the real scarab line up.',
  'The damaged caption still refuses translation.',
  '"A memory returns" is all she can make out.',
  'It sounds like a bad reading, not an answer.',
  'No glow.',
  'No sound.',
];

export const EGYPT_ARCHIVE_ACTIVATION_LINES = [
  'Asha brushes sand from the scarab.',
  'It looks ordinary.',
  'Old stone.',
  'No glow.',
  'No sound.',
  'She checks the edge of the carving with her palm.',
  'The shape matches.',
  'The fracture matches.',
  'For a moment, nothing happens.',
  'Then the pyramid drops away.',
  'The scarab was not a stolen object.',
  'It was a seal.',
  'The ground opens beneath her.',
  'The archive, the sun, the site - gone.',
  'She falls.',
];

export const EGYPT_ARCHIVE_CINEMATIC_STEPS = [
  {
    id: 'pyramid-site',
    kicker: 'Location shift',
    title: 'Pyramid Site',
    visualSrc: EGYPT_ARCHIVE_TRANSPORT_ASSETS.site,
    visualObjectPosition: 'center',
    lines: EGYPT_ARCHIVE_SITE_TRANSITION_LINES,
    actionLabel: 'Approach the scarab',
  },
  {
    id: 'scarab-floor-carving',
    kicker: 'Scarab - Site Comparison',
    title: 'The old photograph matches now.',
    visualSrc: EGYPT_ARCHIVE_TRANSPORT_ASSETS.touch,
    visualObjectPosition: 'center',
    lines: EGYPT_ARCHIVE_SCARAB_CINEMATIC_LINES,
    actionLabel: 'Examine the scarab',
  },
  {
    id: 'threshold-opened',
    kicker: 'Threshold Opened',
    title: 'The seal answers.',
    visualSrc: EGYPT_ARCHIVE_TRANSPORT_ASSETS.threshold,
    visualObjectPosition: 'center',
    lines: EGYPT_ARCHIVE_ACTIVATION_LINES,
    note: 'The world below is not the site Asha climbed.',
    actionLabel: 'Enter the Lost Site',
  },
];

// ─── Rome archive prologue ─────────────────────────────────────────────────────

export const ROME_ARCHIVE_PROLOGUE_ITEMS = [
  {
    id: 'senate-memorandum',
    label: 'Senate Archive — Rome',
    title: 'Memorandum Redacted',
    format: 'Administrative fragment',
    body: [
      'A copied fragment from a pre-eruption Senate record.',
      'One line survives: "The eastern consignment is not to be listed in the public register."',
      'The consignment date corresponds with a known Egyptian shipment route.',
      'The rest of the page was deliberately removed.',
    ],
  },
  {
    id: 'field-report',
    label: 'Ground Survey',
    title: 'Forum Site Report',
    format: 'Field photograph + annotation',
    body: [
      'A buried doorway was detected by ground-penetrating radar beneath the Forum paving.',
      'Ash deposits seal the threshold.',
      'The seal style matches a known imperial locksmith workshop — 1st century AD.',
      'Whoever sealed this wanted it to stay sealed.',
    ],
  },
  {
    id: 'asha-notes',
    label: "Asha's Field Notes",
    title: "Asha's Notes",
    format: 'Notebook entry',
    body: [
      'The Senate does not redact shipping records unless the cargo matters.',
      'An Egyptian consignment. A sealed vault. A deliberate omission.',
      'This is not a routine burial site.',
      'If the record survived, whatever it describes is still down there.',
    ],
  },
];

export const ROME_ARCHIVE_SITE_TRANSITION_LINES = [
  'The Forum is quieter than it should be.',
  'Tourists on the upper level.',
  'Barriers where the radar flagged the anomaly.',
  'Asha shows her permit.',
  'The barriers go back.',
  'She descends to the paving level.',
  'Then below it.',
  'The sealed doorway is exactly where the survey said it would be.',
];

export const ROME_ARCHIVE_VAULT_LINES = [
  'Iron fittings, corroded but intact.',
  'A lead seal pressed over the latch.',
  'The stamp: Senate authority, pre-eruption.',
  'Someone locked this before Vesuvius.',
  'The eruption buried it.',
  'Nobody came back to open it.',
];

export const ROME_ARCHIVE_ACTIVATION_LINES = [
  'Asha checks the seal stamp against her photograph.',
  'The impression matches.',
  'She applies pressure to the latch.',
  'The lead cracks.',
  'The door gives.',
  'Cold air.',
  'Not tomb cold.',
  'Archive cold.',
  'There is something in the dark below.',
  'The Senate did not want anyone to find it.',
  'Asha climbs down anyway.',
];

export const ROME_ARCHIVE_CINEMATIC_STEPS = [
  {
    id: 'forum-approach',
    kicker: 'Location shift',
    title: 'Beneath the Forum paving.',
    lines: ROME_ARCHIVE_SITE_TRANSITION_LINES,
    actionLabel: 'Approach the sealed door',
  },
  {
    id: 'vault-door',
    kicker: 'Vault Door — Sealed',
    title: 'Iron fittings. Senate stamp. Pre-eruption.',
    lines: ROME_ARCHIVE_VAULT_LINES,
    actionLabel: 'Break the seal',
  },
  {
    id: 'vault-opened',
    kicker: 'Vault Opened',
    title: 'The archive the Senate buried.',
    lines: ROME_ARCHIVE_ACTIVATION_LINES,
    note: 'Whatever is below has been sealed since 79 AD.',
    actionLabel: 'Descend into the vault',
  },
];

// ─── End Rome archive prologue ─────────────────────────────────────────────────

export const SURVEY_COST = { investigation: -4, time: -8 };
export const SURVEY_ZONES = [
  {
    id: 'riverbank',
    name: 'Entry Corridor',
    prompt: 'The deep entrance passage is filled with rubble and dried mud layers.',
    clue: 'You notice layers of ancient mud silt that washed down the tomb entrance. It preserves traces of ancient plants and seeds from old valley floods.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible environmental evidence (silt layers or wild seeds) washed into the entrance passage.',
    missionHint: 'Interesting context, but not the strongest place for structural remains.',
  },
  {
    id: 'burial',
    name: 'Burial Chamber',
    prompt: 'A massive stone sarcophagus outline sits in the centre of a painted room.',
    clue: 'You observe giant, precisely cut stone blocks and mummified remains. The walls show ritual painting. This is a highly protected sacred chamber.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible giant structures (limestone blocks) and human remains.',
    missionHint: 'This looks like a very promising spot for finding monumental structures!',
  },
  {
    id: 'archive',
    name: 'The Treasury',
    prompt: 'A golden shrine chest and chest cases are piled beside the wall.',
    clue: 'You notice sealed boxes, scrolls, and jars with animal-headed lids. This area holds official records and symbolic offerings.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible written evidence (papyrus scrolls) and sacred objects.',
    missionHint: 'Highly valuable for cultural artifacts, but less likely to have massive structural walls.',
  },
  {
    id: 'market',
    name: 'The Annex',
    prompt: 'A cluttered pile of alabaster oil jars, stools, and seed baskets.',
    clue: 'You observe everyday items and food offerings scattered in heaps. This room shows what items were packed for the afterlife.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible everyday objects (amulets, baskets, seeds) and materials.',
    missionHint: 'Contains many small finds, but it is not the main structural focus of the tomb.',
  },
  {
    id: 'wall',
    name: 'The Antechamber',
    prompt: 'Heavy plastered walls and three large golden animal couches dominate the room.',
    clue: 'You find thick mudbrick blocking-walls and plastered partition structures. This chamber shows strong evidence of official tomb construction.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible building structures (mudbrick walls, shafts) or carved walls.',
    missionHint: 'This area contains solid mudbrick partition structures and is an excellent fit for the mission!',
  },
];

export const SURVEY_ZONE_BY_ID = Object.fromEntries(SURVEY_ZONES.map(zone => [zone.id, zone]));
export const SURVEY_REVEAL_LINKS = {
  eg_13: ['archive', 'burial'],
  eg_7: ['burial', 'wall'],
  eg_11: ['riverbank'],
  eg_8: ['wall'],
  eg_10: ['market', 'riverbank'],
  eg_9: ['wall', 'burial'],
};
export const GRID_COSTS = {
  Low: { investigation: -2, time: -4 },
  Medium: { investigation: -4, time: -8 },
  High: { investigation: -6, time: -12 },
};
export const GRID_ZONE_CONFIGS = {
  wall: [
    {
      id: 'A1',
      clue: 'A straight line of compacted stone runs under the sand.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible foundation or wall evidence.',
      linkedEvidenceIds: ['eg_8'],
      openFeedback: 'Grid A1 opened. You have recorded this location and can now inspect evidence found there.',
    },
    {
      id: 'A2',
      clue: 'Loose rubble and cracked stone make this area harder to work.',
      risk: 'Medium',
      possibleEvidenceHint: 'Unstable area. Evidence may be limited.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid A2 opened. Mostly rubble here. This square did not reveal strong mission evidence.',
    },
    {
      id: 'B1',
      clue: 'You notice mudbrick fragments in a repeated pattern.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible building material.',
      linkedEvidenceIds: ['eg_7'],
      openFeedback: 'Grid B1 opened. Repeated building material is visible here. Inspect the evidence carefully.',
    },
    {
      id: 'B2',
      clue: 'A darker rectangular cut appears beneath the surface.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible tomb shaft or built feature.',
      linkedEvidenceIds: ['eg_9'],
      openFeedback: 'Grid B2 opened. A built feature may be present. Inspect the evidence carefully.',
    },
  ],
  burial: [
    {
      id: 'A1',
      clue: 'A cut edge in the soil suggests a planned burial space.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible tomb feature or burial structure.',
      linkedEvidenceIds: ['eg_7'],
      openFeedback: 'Grid A1 opened. A burial feature may be recorded here.',
    },
    {
      id: 'A2',
      clue: 'Stone chips and disturbed fill sit above a sealed layer.',
      risk: 'Medium',
      possibleEvidenceHint: 'Mixed evidence from a protected area.',
      linkedEvidenceIds: ['eg_13'],
      openFeedback: 'Grid A2 opened. This square may hold useful clues, but not all of them match the mission.',
    },
    {
      id: 'B1',
      clue: 'A neat rectangular cut drops below the surface.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible shaft or built chamber.',
      linkedEvidenceIds: ['eg_9'],
      openFeedback: 'Grid B1 opened. A built burial feature may be present here.',
    },
    {
      id: 'B2',
      clue: 'The top layer is mostly loose sand and scattered debris.',
      risk: 'Low',
      possibleEvidenceHint: 'A weaker square with fewer clear signs.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B2 opened. This square is mostly loose surface debris.',
    },
  ],
  archive: [
    {
      id: 'A1',
      clue: 'A sealed container sits beside a collapsed shelf line.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible written record or stored document evidence.',
      linkedEvidenceIds: ['eg_13'],
      openFeedback: 'Grid A1 opened. Stored evidence can now be inspected here.',
    },
    {
      id: 'A2',
      clue: 'Dusty fragments cluster in a corner with little structure left.',
      risk: 'Low',
      possibleEvidenceHint: 'Light traces of storage activity.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid A2 opened. This square shows only light traces of storage activity.',
    },
    {
      id: 'B1',
      clue: 'The ground is compact but broken by shelf collapse.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible mixed archive debris.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B1 opened. The archive surface is disturbed here.',
    },
    {
      id: 'B2',
      clue: 'Scattered sherds sit in a line beside a wall base.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible stored material or writing tools.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B2 opened. This square gives context, but not a strong mission lead.',
    },
  ],
  riverbank: [
    {
      id: 'A1',
      clue: 'Dark silt layers sit beneath the top sand.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible river or environmental evidence.',
      linkedEvidenceIds: ['eg_11'],
      openFeedback: 'Grid A1 opened. River evidence can now be inspected here.',
    },
    {
      id: 'A2',
      clue: 'Plant traces cling to damp soil near the edge.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible plant or soil evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid A2 opened. This square adds environmental context to the site.',
    },
    {
      id: 'B1',
      clue: 'The bank has slumped and the surface is uneven.',
      risk: 'Medium',
      possibleEvidenceHint: 'A harder square with limited clear finds.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B1 opened. The unstable bank limits what can be recorded here.',
    },
    {
      id: 'B2',
      clue: 'Scattered objects have washed toward a shallow channel.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible washed-in artefacts or everyday materials.',
      linkedEvidenceIds: ['eg_10'],
      openFeedback: 'Grid B2 opened. This square may hold useful finds carried by water or activity nearby.',
    },
  ],
  market: [
    {
      id: 'A1',
      clue: 'Broken object pieces sit where people once moved through the space.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible artefacts or trade objects.',
      linkedEvidenceIds: ['eg_10'],
      openFeedback: 'Grid A1 opened. Everyday activity evidence can now be inspected here.',
    },
    {
      id: 'A2',
      clue: 'The ground is trampled and mixed with little pattern.',
      risk: 'Medium',
      possibleEvidenceHint: 'A busy surface with mixed evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid A2 opened. This square is busy but does not show a strong mission clue yet.',
    },
    {
      id: 'B1',
      clue: 'A patch of packed soil suggests repeated foot traffic.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible market activity evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B1 opened. This square helps explain how the area was used.',
    },
    {
      id: 'B2',
      clue: 'Collapsed stall debris makes the square harder to clear.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible mixed object evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B2 opened. This square is cluttered and slower to investigate.',
    },
  ],
};

export const CHINA_ZONES = [
  { id: 'riverbank', name: 'River Valley', emoji: '', x: 0, y: 0, w: 260, h: 220, color: 'rgba(56, 189, 148, 0.16)' },
  { id: 'burial', name: 'Tomb Edge', emoji: '', x: 260, y: 0, w: 260, h: 220, color: 'rgba(154, 126, 93, 0.18)' },
  { id: 'archive', name: 'Oracle Archive', emoji: '', x: 520, y: 0, w: 280, h: 220, color: 'rgba(185, 141, 66, 0.16)' },
  { id: 'market', name: 'Bronze Workshop', emoji: '', x: 0, y: 220, w: 320, h: 190, color: 'rgba(168, 112, 57, 0.15)' },
  { id: 'wall', name: 'Rammed Earth Wall', emoji: '', x: 320, y: 220, w: 260, h: 190, color: 'rgba(142, 119, 84, 0.18)' },
  { id: 'gate', name: 'Timber Exit Gate', emoji: '', x: 580, y: 220, w: 220, h: 340, color: 'rgba(74, 222, 128, 0.12)' },
];

export const CHINA_EXCAVATION_TERRAIN_BY_ZONE = {
  riverbank: 'chinaRoomMap:riverbankTerrain',
  burial: 'chinaRoomMap:tombEdgeTerrain',
  archive: 'chinaRoomMap:archiveTerrain',
  market: 'chinaRoomMap:workshopTerrain',
  wall: 'chinaRoomMap:rammedEarthWallTerrain',
  gate: 'chinaRoomMap:neutralExcavationTerrain',
};

export const CHINA_SURVEY_ZONES = [
  {
    id: 'riverbank',
    name: 'River Valley',
    prompt: 'Silt layers and plant traces sit near a broad river channel.',
    clue: 'You notice damp silt and plant remains. This area may show how river valleys shaped farming and settlement.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible environmental evidence linked to food, farming and river settlement.',
    missionHint: 'Useful context, but it may not be the strongest place for structural evidence.',
  },
  {
    id: 'burial',
    name: 'Tomb Edge',
    prompt: 'A cut edge in the ground leads toward a protected burial area.',
    clue: 'You notice a planned tomb edge and traces of high-status objects. This area may include ritual or status evidence.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible burial structures plus objects or remains.',
    missionHint: 'This area could help, but the mission evidence may be mixed with non-target finds.',
  },
  {
    id: 'archive',
    name: 'Oracle Archive',
    prompt: 'Fragments of bone, bamboo and sealed containers sit near a shaded wall.',
    clue: 'You notice stored records and carved marks. This area may preserve early writing evidence.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible written evidence such as oracle bone or bamboo records.',
    missionHint: 'Important for understanding belief and government, but probably not the strongest match for structural evidence.',
  },
  {
    id: 'market',
    name: 'Bronze Workshop',
    prompt: 'Broken vessels, ash and workshop debris sit beside compacted floor marks.',
    clue: 'You notice craft debris and everyday activity traces. This area may show production, technology and objects.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible artefacts, workshop objects and production evidence.',
    missionHint: 'Useful for technology evidence, but only some finds may answer the current mission.',
  },
  {
    id: 'wall',
    name: 'Rammed Earth Wall',
    prompt: 'Compacted earth layers run in a planned line across the trench.',
    clue: 'You notice repeated packed-earth layers and foundation traces. This area may show organised building work.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible structures or construction evidence.',
    missionHint: 'This area looks promising for the current Bureau mission.',
  },
];

export const CHINA_SURVEY_ZONE_BY_ID = Object.fromEntries(CHINA_SURVEY_ZONES.map(zone => [zone.id, zone]));
export const CHINA_SURVEY_REVEAL_LINKS = {
  ch_13: ['archive'],
  ch_7: ['wall'],
  ch_10: ['riverbank'],
  ch_8: ['wall', 'burial'],
  ch_1: ['market', 'burial'],
  ch_9: ['market', 'wall'],
};
export const CHINA_GRID_ZONE_CONFIGS = {
  wall: [
    {
      id: 'A1',
      clue: 'Layered compacted earth runs in a straight line.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible rammed-earth wall evidence.',
      linkedEvidenceIds: ['ch_7'],
      openFeedback: 'Grid A1 opened. Compacted wall evidence can now be inspected.',
    },
    {
      id: 'A2',
      clue: 'A square post base suggests a tall timber structure once stood here.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible foundation evidence.',
      linkedEvidenceIds: ['ch_8'],
      openFeedback: 'Grid A2 opened. A building foundation can now be inspected.',
    },
    {
      id: 'B1',
      clue: 'Loose rubble and mixed fill make this patch slower to read.',
      risk: 'Medium',
      possibleEvidenceHint: 'Unclear disturbed surface.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B1 opened. The surface is mixed and does not reveal strong mission evidence yet.',
    },
    {
      id: 'B2',
      clue: 'Heat-marked clay appears beside a built feature.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible kiln or workshop structure.',
      linkedEvidenceIds: ['ch_9'],
      openFeedback: 'Grid B2 opened. A built kiln feature can now be inspected.',
    },
  ],
  burial: [
    {
      id: 'A1',
      clue: 'A packed edge leads toward a protected tomb area.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible foundation or burial feature.',
      linkedEvidenceIds: ['ch_8'],
      openFeedback: 'Grid A1 opened. Foundation evidence may be recorded here.',
    },
    {
      id: 'A2',
      clue: 'High-status vessel fragments sit beside the tomb edge.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible ritual object evidence.',
      linkedEvidenceIds: ['ch_1'],
      openFeedback: 'Grid A2 opened. A bronze object can now be inspected.',
    },
    {
      id: 'B1',
      clue: 'The surface is compact but has few clear features.',
      risk: 'Low',
      possibleEvidenceHint: 'Weak context evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B1 opened. This square gives context but not a strong mission lead.',
    },
    {
      id: 'B2',
      clue: 'Dark fill suggests a protected edge below the surface.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible built edge or tomb cut.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B2 opened. The area needs care but reveals no clear target evidence yet.',
    },
  ],
  archive: [
    {
      id: 'A1',
      clue: 'Carved bone fragments sit near a storage alcove.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible written record evidence.',
      linkedEvidenceIds: ['ch_13'],
      openFeedback: 'Grid A1 opened. Written evidence can now be inspected here.',
    },
    {
      id: 'A2',
      clue: 'Bamboo fragments are mixed with loose dust.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible archive evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid A2 opened. This square adds archive context but no strong mission evidence.',
    },
    {
      id: 'B1',
      clue: 'Shelf collapse makes the surface harder to interpret.',
      risk: 'Medium',
      possibleEvidenceHint: 'Mixed archive debris.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B1 opened. The surface is disturbed here.',
    },
    {
      id: 'B2',
      clue: 'A sealed container rests near a wall base.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible record storage context.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B2 opened. This square gives useful context but not a direct mission match.',
    },
  ],
  riverbank: [
    {
      id: 'A1',
      clue: 'Burnt grain sits in damp river silt.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible farming or food evidence.',
      linkedEvidenceIds: ['ch_10'],
      openFeedback: 'Grid A1 opened. River-valley farming evidence can now be inspected.',
    },
    {
      id: 'A2',
      clue: 'Plant traces cling to wet soil.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible plant evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid A2 opened. This square adds environmental context to the site.',
    },
    {
      id: 'B1',
      clue: 'The bank has slumped and disturbed the surface.',
      risk: 'Medium',
      possibleEvidenceHint: 'Limited clear finds.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B1 opened. The unstable bank limits what can be recorded here.',
    },
    {
      id: 'B2',
      clue: 'Washed-in debris sits beside a shallow channel.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible mixed objects or plant remains.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B2 opened. The square gives context, but not a strong mission lead.',
    },
  ],
  market: [
    {
      id: 'A1',
      clue: 'A bronze vessel fragment sits near workshop ash.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible object or technology evidence.',
      linkedEvidenceIds: ['ch_1'],
      openFeedback: 'Grid A1 opened. Bronze object evidence can now be inspected.',
    },
    {
      id: 'A2',
      clue: 'A heat-marked built oven cuts into the surface.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible production structure.',
      linkedEvidenceIds: ['ch_9'],
      openFeedback: 'Grid A2 opened. A kiln structure can now be inspected.',
    },
    {
      id: 'B1',
      clue: 'Compacted floor traces suggest repeated workshop movement.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible activity evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B1 opened. This square explains workshop use but is not direct mission evidence.',
    },
    {
      id: 'B2',
      clue: 'Mixed debris makes the square slower to clear.',
      risk: 'Medium',
      possibleEvidenceHint: 'Mixed workshop evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B2 opened. This square is cluttered and slower to investigate.',
    },
  ],
};

export const EXCAVATION_METHODS = [
  {
    id: 'brush',
    name: 'Brush Carefully',
    bestFor: 'Safest method. Best when evidence may be fragile.',
    cost: { investigation: -2, time: -10 },
    baseQuality: 'good',
    kitTool: 'brush',
    feedback: 'Careful recovery protected the evidence.',
  },
  {
    id: 'trowel',
    name: 'Use Trowel',
    bestFor: 'Balanced method. Best for structures and objects.',
    cost: { investigation: -3, time: -6 },
    baseQuality: 'good',
    kitTool: 'trowel',
    feedback: 'Trowel used. The evidence was removed cleanly.',
  },
  {
    id: 'quick-dig',
    name: 'Quick Dig',
    bestFor: 'Fastest method, but it can damage context.',
    cost: { investigation: -1, time: -2 },
    baseQuality: 'good',
    kitTool: null,
    feedback: 'Quick dig saved time, but this was risky.',
  },
];
export const EXCAVATION_METHOD_BY_ID = Object.fromEntries(EXCAVATION_METHODS.map(method => [method.id, method]));
export const MAP_EVIDENCE_TYPES = [
  { id: 'structure', name: 'Feature / Structure' },
  { id: 'written_record', name: 'Written Source' },
  { id: 'material_culture', name: 'Artefact / Object' },
  { id: 'environmental', name: 'Environmental Evidence' },
  { id: 'human_remains', name: 'Human Remains' },
];
export const MAP_EVIDENCE_TYPE_BY_ID = Object.fromEntries(MAP_EVIDENCE_TYPES.map(item => [item.id, item]));
export const MAP_EVIDENCE_TYPE_BY_MISSION_TYPE = {
  structure: 'structure',
  written_record: 'written_record',
  material_culture: 'material_culture',
  environmental: 'environmental',
  human_remains: 'human_remains',
};

export const WALLS = [
  { x: 322, y: 238, w: 178, h: 34, label: 'plastered brick partition' },
  { x: 98, y: 366, w: 210, h: 28, label: 'golden couch supports' },
  { x: 602, y: 360, w: 118, h: 28, label: 'collapsed shrine base' },
  { x: 618, y: 120, w: 32, h: 98, label: 'rubble blocking wall' },
];

export const CHINA_WALLS = [
  { x: 322, y: 238, w: 178, h: 34, label: 'rammed earth spine' },
  { x: 92, y: 342, w: 220, h: 24, label: 'workshop timber edge' },
  { x: 600, y: 360, w: 126, h: 28, label: 'gate approach beam' },
  { x: 618, y: 120, w: 32, h: 98, label: 'archive threshold' },
];

export const HAZARDS = [
  {
    id: 'sandstorm',
    name: 'tomb dust',
    emoji: '💨',
    x: 84,
    y: 96,
    w: 120,
    h: 70,
    color: 'rgba(232, 158, 93, 0.35)',
    penalty: { time: -15 },
    message: 'Tomb dust: time drops by 15 seconds.',
  },
  {
    id: 'falling-rocks',
    name: 'ceiling rubble',
    emoji: '🪨',
    x: 388,
    y: 292,
    w: 110,
    h: 78,
    color: 'rgba(148, 163, 184, 0.32)',
    penalty: { investigation: -8 },
    message: 'Ceiling rubble: investigation points drop by 8.',
  },
  {
    id: 'unstable-floor',
    name: 'crumbling floor',
    emoji: '⚠️',
    x: 196,
    y: 454,
    w: 118,
    h: 70,
    color: 'rgba(239, 68, 68, 0.25)',
    penalty: { stamina: -18 },
    message: 'Crumbling floor: stamina drops by 18.',
  },
];

export const CHINA_HAZARDS = [
  {
    id: 'sandstorm',
    name: 'river silt',
    emoji: 'silt',
    x: 84,
    y: 96,
    w: 120,
    h: 70,
    color: 'rgba(74, 124, 89, 0.28)',
    penalty: { time: -15 },
    message: 'River silt slowed the survey. Time drops by 15 seconds.',
  },
  {
    id: 'falling-rocks',
    name: 'loose rubble',
    emoji: 'rubble',
    x: 388,
    y: 292,
    w: 110,
    h: 78,
    color: 'rgba(148, 163, 184, 0.32)',
    penalty: { investigation: -8 },
    message: 'Loose rubble disrupted the trench. Survey focus drops by 8.',
  },
  {
    id: 'unstable-floor',
    name: 'soft trench',
    emoji: 'trench',
    x: 196,
    y: 454,
    w: 118,
    h: 70,
    color: 'rgba(166, 94, 46, 0.24)',
    penalty: { stamina: -18 },
    message: 'Soft trench edge: stamina drops by 18.',
  },
];

export const EXCAVATION_GUARDIANS = [
  {
    id: 'tomb-guardian-shadow',
    name: 'Tomb Guardian Shadow',
    emoji: 'ðŸ‘¤',
    x: 620,
    y: 420,
    w: 30,
    h: 30,
    path: [
      { x: 620, y: 420 },
      { x: 708, y: 420 },
      { x: 708, y: 286 },
      { x: 620, y: 286 },
    ],
    speed: 54,
    penalty: { investigation: -6, time: -8 },
    message: 'Tomb Guardian Shadow disrupted your survey. Survey focus and time reduced.',
  },
];

export const CHINA_EXCAVATION_GUARDIANS = [
  {
    id: 'site-watcher-shadow',
    name: 'Site Watcher',
    emoji: 'watcher',
    x: 620,
    y: 420,
    w: 30,
    h: 30,
    path: [
      { x: 620, y: 420 },
      { x: 708, y: 420 },
      { x: 708, y: 286 },
      { x: 620, y: 286 },
    ],
    speed: 54,
    penalty: { investigation: -6, time: -8 },
    message: 'Site Watcher Shadow disrupted your survey. Survey focus and time reduced.',
  },
];

// ─── Rome excavation-map constants ────────────────────────────────────────────

export const ROME_EXCAVATION_MAP_THEME = {
  ...DEFAULT_EXCAVATION_MAP_THEME,
  backgroundInner: '#e4ddd0',
  backgroundOuter: '#c8bfb0',
  neutralTileAlpha: 0.14,
  gridOverlayAlpha: 0.16,
  gridLineColor: 'rgba(80, 65, 48, 0.045)',
  surveyLineAlpha: 0.32,
  surveyLineSecondaryAlpha: 0.28,
  surveyPegAlpha: 0.64,
  pathAlpha: 0.40,
  thresholdAlpha: 0.52,
  terrainAlpha: 0.88,
  gateTerrainAlpha: 0.38,
  terrainWash: 'rgba(240, 228, 210, 0.12)',
  roomShadowAlpha: 0.14,
  labelAssetAlpha: 0.90,
  labelText: '#2e2318',
  surveyLabelText: '#3d2f1e',
  selectedSurveyLabelText: '#1a3a20',
  selectedStroke: 'rgba(26, 58, 32, 0.96)',
  idleStroke: 'rgba(88, 68, 44, 0.42)',
  selectedDashStroke: 'rgba(180, 140, 80, 0.82)',
  markerAlpha: 0.90,
  hazardAlpha: 0.90,
  hazardLabelBackground: 'rgba(255, 252, 244, 0.90)',
  hazardLabelText: '#4a321d',
  wallAlpha: 0.92,
  wallStroke: 'rgba(90, 68, 44, 0.40)',
  playerGlowAlpha: 0.54,
};

// Reuse the 6 generic zone IDs so all existing zone-handling code works unchanged.
// Rome renames them with period-appropriate labels.
export const ROME_ZONES = [
  { id: 'riverbank', name: 'Via Sacra Trench',  emoji: '', x: 0,   y: 0,   w: 260, h: 220, color: 'rgba(200, 180, 140, 0.16)' },
  { id: 'burial',    name: 'Forum Pit',          emoji: '', x: 260, y: 0,   w: 260, h: 220, color: 'rgba(160, 140, 110, 0.18)' },
  { id: 'archive',   name: 'Thermae Shaft',      emoji: '', x: 520, y: 0,   w: 280, h: 220, color: 'rgba(80,  90,  95,  0.18)' },
  { id: 'market',    name: 'Basilica Floor',     emoji: '', x: 0,   y: 220, w: 320, h: 190, color: 'rgba(190, 178, 160, 0.15)' },
  { id: 'wall',      name: 'Civic Wing',         emoji: '', x: 320, y: 220, w: 260, h: 190, color: 'rgba(160, 148, 130, 0.18)' },
  { id: 'gate',      name: 'Sealed Archive',     emoji: '', x: 580, y: 220, w: 220, h: 340, color: 'rgba(74, 222, 128, 0.12)' },
];

export const ROME_EXCAVATION_TERRAIN_BY_ZONE = {
  riverbank: 'romeRoomMap:romeSacraRoadTerrain',
  burial:    'romeRoomMap:romeForumPitTerrain',
  archive:   'romeRoomMap:romeThermaeShaftTerrain',
  market:    'romeRoomMap:romeBasilicaFloorTerrain',
  wall:      'romeRoomMap:romeCivicWingTerrain',
  gate:      'romeRoomMap:romeNeutralExcavationTerrain',
};

export const ROME_SURVEY_ZONES = [
  {
    id: 'riverbank',
    name: 'Via Sacra Trench',
    prompt: 'Compacted limestone fragments and gravel sit along a buried road surface.',
    clue: 'You notice road-surfacing material and worn flagstones. This area may preserve evidence of Roman engineering and civic movement.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible road construction evidence or milestone fragments.',
    missionHint: 'Useful context, but the strongest structural evidence may be deeper in the site.',
  },
  {
    id: 'burial',
    name: 'Forum Pit',
    prompt: 'Broken marble paving and column stump bases sit in ash-rich fill.',
    clue: 'You notice planned stonework and civic debris. This area may contain public-works structures buried under the eruption layer.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible structural evidence — column bases, paving, public works.',
    missionHint: 'This area looks promising for the structural mission.',
  },
  {
    id: 'archive',
    name: 'Thermae Shaft',
    prompt: 'Lead pipe sections and tile stack remnants mark an underground heat system.',
    clue: 'You notice hypocaust pillars and fired-clay conduits. This area may preserve evidence of Roman engineering below ground.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible structural evidence — hypocaust system and water infrastructure.',
    missionHint: 'Strong candidate for engineering evidence.',
  },
  {
    id: 'market',
    name: 'Basilica Floor',
    prompt: 'Polished marble fragments and bronze fitting holes mark a large public hall.',
    clue: 'You notice high-quality flooring and administrative fittings. This area may have been a civic or legal building.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible floor evidence, written records, or administrative objects.',
    missionHint: 'Mixed evidence — may contain both structural and written finds.',
  },
  {
    id: 'wall',
    name: 'Civic Wing',
    prompt: 'Dense pottery, lamp fragments and coin scatters fill the trench surface.',
    clue: 'You notice everyday artefacts at high density. This area reflects active civic use before the eruption.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible artefact and object evidence — lamps, pottery, coins.',
    missionHint: 'Good for artefact evidence, but structural evidence may be sparse here.',
  },
];

export const ROME_SURVEY_ZONE_BY_ID = Object.fromEntries(ROME_SURVEY_ZONES.map(zone => [zone.id, zone]));

export const ROME_SURVEY_REVEAL_LINKS = {
  rm_13: ['archive', 'market'],  // Wax Tablet → Thermae Shaft or Basilica Floor
  rm_7:  ['burial', 'archive'],  // Aqueduct Arch → Forum Pit or Thermae Shaft
  rm_10: ['riverbank'],          // Volcanic Ash Layer → Via Sacra Trench
  rm_8:  ['archive', 'burial'],  // Hypocaust → Thermae Shaft or Forum Pit
  rm_1:  ['wall', 'market'],     // Bronze Sestertius → Civic Wing or Basilica
  rm_9:  ['market', 'wall'],     // Mosaic Floor → Basilica Floor or Civic Wing
};

export const ROME_GRID_ZONE_CONFIGS = {
  burial: [  // Forum Pit — strongest structural zone
    {
      id: 'A1',
      clue: 'A marble column base sits proud of the surrounding ash.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible structural evidence — column base.',
      linkedEvidenceIds: ['rm_7'],
      openFeedback: 'Grid A1 opened. A column base can now be inspected.',
    },
    {
      id: 'A2',
      clue: 'Compacted rubble fills a planned rectangular cut — possibly a foundation.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible foundation or public-works evidence.',
      linkedEvidenceIds: ['rm_8'],
      openFeedback: 'Grid A2 opened. Structural evidence can now be recorded.',
    },
    {
      id: 'B1',
      clue: 'Loose volcanic ash makes this patch harder to excavate cleanly.',
      risk: 'Medium',
      possibleEvidenceHint: 'Environmental context — limited structural evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B1 opened. The ash layer is thick here — limited structural evidence.',
    },
    {
      id: 'B2',
      clue: 'A paved floor surface is partially exposed near a wall edge.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible mosaic or paving evidence.',
      linkedEvidenceIds: ['rm_9'],
      openFeedback: 'Grid B2 opened. Paving evidence can now be recorded.',
    },
  ],
  archive: [  // Thermae Shaft — underground engineering
    {
      id: 'A1',
      clue: 'A lead pipe bears a stamped inscription from an imperial supplier.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible infrastructure evidence.',
      linkedEvidenceIds: ['rm_8'],
      openFeedback: 'Grid A1 opened. Hypocaust evidence can now be inspected.',
    },
    {
      id: 'A2',
      clue: 'Stacked tile columns form a regular pattern in the subsurface.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible hypocaust system evidence.',
      linkedEvidenceIds: ['rm_7'],
      openFeedback: 'Grid A2 opened. Engineering evidence recorded.',
    },
    {
      id: 'B1',
      clue: 'Steam-corroded brickwork is soft and difficult to record cleanly.',
      risk: 'Medium',
      possibleEvidenceHint: 'Limited finds — corrosion damage.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B1 opened. Corroded surface — minimal recordable evidence here.',
    },
    {
      id: 'B2',
      clue: 'A tile floor section is intact near a sealed drain.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible engineering surface evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B2 opened. Useful context, but not the strongest mission match.',
    },
  ],
  market: [  // Basilica Floor — mixed structural and written
    {
      id: 'A1',
      clue: 'Polished marble fragments sit over a planned floor layer.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible mosaic or floor evidence.',
      linkedEvidenceIds: ['rm_9'],
      openFeedback: 'Grid A1 opened. Mosaic floor evidence can now be recorded.',
    },
    {
      id: 'A2',
      clue: 'A wax tablet fragment is preserved in compacted fill.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible written-record evidence.',
      linkedEvidenceIds: ['rm_13'],
      openFeedback: 'Grid A2 opened. Written evidence found here.',
    },
    {
      id: 'B1',
      clue: 'Mixed rubble and marble dust make the surface hard to read.',
      risk: 'Medium',
      possibleEvidenceHint: 'Unclear context.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B1 opened. The mixed fill is difficult to interpret.',
    },
    {
      id: 'B2',
      clue: 'Bronze fitting holes in the floor suggest fixed furniture or barriers.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible structural evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B2 opened. Fittings noted but no strong mission evidence here.',
    },
  ],
  riverbank: [  // Via Sacra Trench — road-surface context
    {
      id: 'A1',
      clue: 'Compacted limestone gravel from the road surface is well-preserved.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible road-engineering evidence.',
      linkedEvidenceIds: ['rm_10'],
      openFeedback: 'Grid A1 opened. Ash-sealed road context can now be inspected.',
    },
    {
      id: 'A2',
      clue: 'Worn flagstone edges show heavy foot and cart traffic.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible infrastructure evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid A2 opened. Road-use context noted here.',
    },
    {
      id: 'B1',
      clue: 'Thick ash deposit obscures the road surface.',
      risk: 'Medium',
      possibleEvidenceHint: 'Environmental evidence — limited structural finds.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B1 opened. Dense ash limits what can be recorded.',
    },
    {
      id: 'B2',
      clue: 'Scattered coin and pottery fragments sit in the road margin.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible artefact evidence.',
      linkedEvidenceIds: ['rm_1'],
      openFeedback: 'Grid B2 opened. Object evidence can now be inspected.',
    },
  ],
  wall: [  // Civic Wing — artefact-rich
    {
      id: 'A1',
      clue: 'A bronze sestertius sits in compacted activity debris.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible artefact evidence.',
      linkedEvidenceIds: ['rm_1'],
      openFeedback: 'Grid A1 opened. Coin evidence can now be inspected.',
    },
    {
      id: 'A2',
      clue: 'Oil lamp fragments cluster near a threshold stone.',
      risk: 'Low',
      possibleEvidenceHint: 'Possible everyday-life object evidence.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid A2 opened. Artefact context noted here.',
    },
    {
      id: 'B1',
      clue: 'Dense pottery scatter makes this slow to record correctly.',
      risk: 'Medium',
      possibleEvidenceHint: 'Object evidence — mixed quality.',
      linkedEvidenceIds: [],
      openFeedback: 'Grid B1 opened. The dense scatter is useful but not a strong structural lead.',
    },
    {
      id: 'B2',
      clue: 'A mosaic floor fragment is partly exposed at the edge.',
      risk: 'Medium',
      possibleEvidenceHint: 'Possible structural surface evidence.',
      linkedEvidenceIds: ['rm_9'],
      openFeedback: 'Grid B2 opened. Mosaic fragment recorded.',
    },
  ],
};

export const ROME_WALLS = [
  { x: 322, y: 238, w: 178, h: 34, label: 'marble partition base' },
  { x: 92,  y: 342, w: 220, h: 24, label: 'collapsed column drum' },
  { x: 600, y: 360, w: 126, h: 28, label: 'sealed archive lintel' },
  { x: 618, y: 120, w: 32,  h: 98, label: 'forum threshold block' },
];

export const ROME_EXCAVATION_HAZARDS = [
  {
    id: 'sandstorm',
    name: 'volcanic ash',
    emoji: 'ash',
    x: 84,
    y: 96,
    w: 120,
    h: 70,
    color: 'rgba(160, 145, 120, 0.30)',
    penalty: { time: -15 },
    message: 'Ash layer slowed excavation. Time drops by 15 seconds.',
  },
  {
    id: 'falling-rocks',
    name: 'loose masonry',
    emoji: 'masonry',
    x: 388,
    y: 292,
    w: 110,
    h: 78,
    color: 'rgba(148, 163, 184, 0.30)',
    penalty: { investigation: -8 },
    message: 'Loose masonry disrupted the trench. Investigation points drop by 8.',
  },
  {
    id: 'unstable-floor',
    name: 'cracked marble',
    emoji: 'marble',
    x: 196,
    y: 454,
    w: 118,
    h: 70,
    color: 'rgba(200, 180, 155, 0.24)',
    penalty: { stamina: -18 },
    message: 'Cracked marble floor: stamina drops by 18.',
  },
];

export const ROME_EXCAVATION_GUARDIANS = [
  {
    id: 'vault-warden-shadow',
    name: 'Vault Warden',
    emoji: 'warden',
    x: 620,
    y: 420,
    w: 30,
    h: 30,
    path: [
      { x: 620, y: 420 },
      { x: 708, y: 420 },
      { x: 708, y: 286 },
      { x: 620, y: 286 },
    ],
    speed: 58,
    penalty: { investigation: -6, time: -8 },
    message: 'Vault Warden disrupted the excavation. Survey focus and time reduced.',
  },
];

export const ROME_EVIDENCE_HUNT_MISSIONS = [
  {
    id: 'rome-structural-engineering',
    title: 'Find Structural Evidence',
    inquiryQuestion: 'What evidence shows that Ancient Rome had advanced engineering and organised public construction?',
    instruction: 'Search for evidence that shows Ancient Rome had advanced engineering and organised public construction.',
    targetEvidenceType: 'structure',
    targetCategoryId: 'structure',
    targetCategoryTitle: 'Features / Structures',
    evidenceLabel: 'Structural evidence',
    requiredTargetCount: 3,
    gateRequirement: 'The Sealed Archive needs 3 pieces of structural evidence.',
    keepSearchingNotice: 'Keep searching for evidence of aqueducts, floors, heating systems or other built features.',
    matchFeedback: 'Mission evidence found: this supports your inquiry about Ancient Rome.',
    mismatchFeedback: 'Interesting discovery, but it does not directly answer this mission question.',
    briefingRule: 'Find 3 pieces of structural evidence to unlock the Sealed Archive.',
  },
];

export const ROME_EVIDENCE_PICKS = [
  { id: 'rm_7',  x: 690, y: 94,  zone: 'Thermae Shaft',    clueGroup: 'Engineering' },
  { id: 'rm_8',  x: 548, y: 340, zone: 'Civic Wing',       clueGroup: 'Engineering' },
  { id: 'rm_10', x: 128, y: 142, zone: 'Via Sacra Trench', clueGroup: 'Environment' },
  { id: 'rm_9',  x: 350, y: 310, zone: 'Basilica Floor',   clueGroup: 'Structures' },
  { id: 'rm_1',  x: 140, y: 330, zone: 'Civic Wing',       clueGroup: 'Artefacts' },
  { id: 'rm_13', x: 532, y: 330, zone: 'Basilica Floor',   clueGroup: 'Written' },
];

// ─── End Rome constants ────────────────────────────────────────────────────────

export const CLAIM_OPTIONS = ['Ancient Egypt', 'Ancient Greece', 'Ancient Rome', 'Ancient China', 'Maya', 'Inca'];
export const INITIAL_RESOURCES = { investigation: 95, stamina: 100, time: 600 };
export const INVESTIGATION_BONUS = 5;
export const BRUSH_RECOVERY_BONUS = 3;
export const TROWEL_EXCAVATION_BONUS = 2;
export const CAMERA_DOCUMENTATION_BONUS = 1;
export const MAX_EVIDENCE_ITEMS = 3;
export const TOOL_EFFECTS = {
  brush: {
    icon: Search,
    short: 'Precision Cleaning',
    shortTitle: 'Precision Brush',
    collected: 'Helps recover fragile evidence carefully. Adds a careful recovery bonus when mission evidence is secured.',
    missing: 'Fragile evidence is harder to recover carefully.',
    result: 'Precision Brush: Secured for careful artifact recovery.',
    impact: '+2 Quality Bonus for fragile finds',
    collectedDesc: 'Your team is equipped with precision brushes, allowing for the safe recovery of fragile mudbrick and ceramics.',
    missingDesc: 'Without precision brushes, fragile surface details may be lost during the excavation process.'
  },
  trowel: {
    icon: Hammer,
    short: 'Structural Excavation',
    shortTitle: 'Masonry Trowel',
    collected: 'Helps excavate features and buried objects. Adds a bonus for structures or object evidence.',
    missing: 'Features and buried objects are harder to excavate cleanly.',
    result: 'Masonry Trowel: Secured for structural feature clearing.',
    impact: '+2 Efficiency for built features',
    collectedDesc: 'The masonry trowel is essential for defining the edges of stone foundations and mudbrick walls.',
    missingDesc: 'Lack of proper trowels will make it difficult to distinguish built features from surrounding debris.'
  },
  notebook: {
    icon: BookOpen,
    short: 'Field Documentation',
    shortTitle: 'Field Notebook',
    collected: 'Records field notes when evidence is rejected or inspected. Adds field notes to the final result.',
    missing: 'Fewer field notes are recorded for later checking.',
    result: 'Field Notebook: Secured for stratigraphic recording.',
    impact: 'Unlocks Detailed Field Notes',
    collectedDesc: 'Standard Bureau notebooks are ready for recording every layer and context found during the dig.',
    missingDesc: 'Without notebooks, your team will rely on memory, leading to less detailed final reports.'
  },
  camera: {
    icon: Camera,
    short: 'Visual Evidence',
    shortTitle: 'Survey Camera',
    collected: 'Documents evidence in place before collection. Adds a small evidence quality bonus.',
    missing: 'Evidence is less clearly documented before it is moved.',
    result: 'Survey Camera: Secured for in-situ documentation.',
    impact: '+1 Evidence Quality (All)',
    collectedDesc: 'The survey camera allows for high-resolution documentation of evidence in its original context.',
    missingDesc: 'Moving evidence without photographs significantly reduces its historical value and quality.'
  },
  'measuring-tape': {
    icon: Ruler,
    short: 'Spatial Mapping',
    shortTitle: 'Measuring Tape',
    collected: 'Helps map and record where evidence was found. Adds a mapping bonus in the result.',
    missing: 'Site mapping is less accurate.',
    result: 'Measuring Tape: Secured for precise spatial mapping.',
    impact: 'Unlocks Accurate Site Mapping',
    collectedDesc: 'Steel measuring tapes allow for the precise recording of artifact coordinates within the grid.',
    missingDesc: 'Estimated measurements will result in a less accurate map of the site layout.'
  },
  'field-guide-page': {
    icon: Compass,
    short: 'Analytical Support',
    shortTitle: 'Expert Field Guide',
    collected: 'Gives evidence category hints during inspection.',
    missing: 'No category hints are available during inspection.',
    result: 'Expert Field Guide: Secured for real-time analysis.',
    impact: 'Unlocks Category Expert Hints',
    collectedDesc: 'The field guide provides instant reference for identifying cultural materials, architecture and site clues.',
    missingDesc: 'Identifying unfamiliar artifacts will be much slower and more prone to error.'
  },
};
export const EGYPT_TOOL_EFFECT_OVERRIDES = {
  'field-guide-page': {
    collectedDesc: 'The field guide provides instant reference for identifying Egyptian pottery and architectural styles.',
  },
};
export const CHINA_TOOL_EFFECT_OVERRIDES = {
  brush: {
    shortTitle: 'Soft Bamboo Brush',
    collectedDesc: 'Soft brushes protect painted slips, bronze surfaces and loose loess from damage.',
    missingDesc: 'Fragile inscriptions, paint traces and river-silt details are easier to damage without careful brushing.',
  },
  trowel: {
    shortTitle: 'Rammed-Earth Trowel',
    collectedDesc: 'The trowel defines packed-earth layers, wall footings and workshop edges.',
    missingDesc: 'Wall layers and workshop boundaries are harder to separate from collapsed soil.',
  },
  notebook: {
    shortTitle: 'Bamboo Field Notes',
    collectedDesc: 'Field notes track dynasty clues, layers and context across the river-valley site.',
    missingDesc: 'The team may miss how evidence from the river, wall and archive connects.',
  },
  camera: {
    shortTitle: 'Survey Lens',
    collectedDesc: 'The survey lens records artefacts before they leave the trench or archive shelf.',
    missingDesc: 'Evidence moved without images loses some of its context.',
  },
  'measuring-tape': {
    shortTitle: 'River Measuring Cord',
    collectedDesc: 'The measuring cord maps wall lines, kilns and archive shelves against the survey grid.',
    missingDesc: 'The site plan will be less reliable around walls, kilns and archive rooms.',
  },
  'field-guide-page': {
    shortTitle: 'Dynasty Field Guide',
    collectedDesc: 'The guide helps compare Chinese bronzes, oracle bones, coins, bamboo slips and rammed-earth features.',
    missingDesc: 'Dynasty evidence is harder to read without quick reference notes.',
  },
};
export const ROME_TOOL_EFFECT_OVERRIDES = {
  brush: {
    shortTitle: 'Bristle Brush',
    collectedDesc: 'Bristle brushes clean coins, inscriptions and plaster fragments without scraping them.',
    missingDesc: 'Small Roman inscriptions and surface marks may be missed.',
  },
  trowel: {
    shortTitle: 'Iron Trowel',
    collectedDesc: 'The iron trowel defines paving edges, wall lines and buried civic foundations.',
    missingDesc: 'Forum walls and road layers are harder to separate from rubble.',
  },
  notebook: {
    shortTitle: 'Field Codex',
    collectedDesc: 'The codex keeps civic records, road clues and archive notes in order.',
    missingDesc: 'The team may lose track of which finds point to law, trade, army or public life.',
  },
  camera: {
    shortTitle: 'Survey Lens',
  },
  'measuring-tape': {
    shortTitle: 'Measuring Chain',
    collectedDesc: 'The measuring chain maps roads, basilica lines and vault rooms with Roman-site precision.',
    missingDesc: 'Distances between roads, walls and chambers will be less reliable.',
  },
  'field-guide-page': {
    shortTitle: 'Wax Tablet',
    collectedDesc: 'The wax tablet helps compare Roman law, civic buildings, coins, roads and inscriptions.',
    missingDesc: 'Roman public-life evidence is harder to classify quickly.',
  },
};
export const RANK_BANDS = [
  { min: 90, title: 'Lead Archaeologist' },
  { min: 75, title: 'Field Investigator' },
  { min: 60, title: 'Evidence Apprentice' },
  { min: 40, title: 'Trainee Excavator' },
  { min: 0, title: 'Needs More Training' },
];
export const EVIDENCE_HUNT_MISSIONS = [
  {
    id: 'structural-engineering',
    title: 'Find Structural Evidence',
    inquiryQuestion: 'What evidence shows that Ancient Egypt had advanced engineering and organised construction?',
    instruction: 'Search for evidence that shows Ancient Egypt had advanced engineering and organised construction.',
    targetEvidenceType: 'structure',
    targetCategoryId: 'structure',
    targetCategoryTitle: 'Features / Structures',
    evidenceLabel: 'Structural evidence',
    requiredTargetCount: 3,
    gateRequirement: 'The Exit Gate needs 3 pieces of structural evidence.',
    keepSearchingNotice: 'Keep searching for evidence of buildings or structures.',
    matchFeedback: 'Mission evidence found: this supports your inquiry.',
    mismatchFeedback: 'Interesting discovery, but it does not directly answer this mission question.',
    briefingRule: 'Find 3 pieces of structural evidence to unlock the Exit Gate.',
  },
];

export const CHINA_EVIDENCE_HUNT_MISSIONS = [
  {
    id: 'china-structural-organisation',
    title: 'Find Structural Evidence',
    inquiryQuestion: 'What evidence shows that Ancient China had organised construction and specialised building knowledge?',
    instruction: 'Search for evidence that shows Ancient China had organised construction and specialised building knowledge.',
    targetEvidenceType: 'structure',
    targetCategoryId: 'structure',
    targetCategoryTitle: 'Features / Structures',
    evidenceLabel: 'Structural evidence',
    requiredTargetCount: 3,
    gateRequirement: 'The Timber Exit Gate needs 3 pieces of structural evidence.',
    keepSearchingNotice: 'Keep searching for evidence of walls, foundations, kilns or other built features.',
    matchFeedback: 'Mission evidence found: this supports your inquiry about Ancient China.',
    mismatchFeedback: 'Interesting discovery, but it does not directly answer this mission question.',
    briefingRule: 'Find 3 pieces of structural evidence to unlock the Timber Exit Gate.',
  },
];

export const EGYPT_EVIDENCE_PICKS = [
  { id: 'eg_13', x: 690, y: 94, zone: 'The Treasury', clueGroup: 'Legacy' },
  { id: 'eg_7', x: 548, y: 340, zone: 'The Antechamber', clueGroup: 'Society' },
  { id: 'eg_11', x: 128, y: 142, zone: 'Entry Corridor', clueGroup: 'Geography' },
  { id: 'eg_8', x: 350, y: 310, zone: 'The Antechamber', clueGroup: 'Society' },
  { id: 'eg_10', x: 140, y: 330, zone: 'The Annex', clueGroup: 'Society' },
  { id: 'eg_9', x: 532, y: 330, zone: 'The Antechamber', clueGroup: 'Society' },
];

export const CHINA_EVIDENCE_PICKS = [
  { id: 'ch_13', x: 690, y: 94, zone: 'Oracle Archive', clueGroup: 'Writing' },
  { id: 'ch_7', x: 548, y: 340, zone: 'Rammed Earth Wall', clueGroup: 'Organisation' },
  { id: 'ch_10', x: 128, y: 142, zone: 'River Valley', clueGroup: 'Geography' },
  { id: 'ch_8', x: 350, y: 310, zone: 'Rammed Earth Wall', clueGroup: 'Engineering' },
  { id: 'ch_1', x: 140, y: 330, zone: 'Bronze Workshop', clueGroup: 'Power' },
  { id: 'ch_9', x: 532, y: 330, zone: 'Rammed Earth Wall', clueGroup: 'Technology' },
];

export const EXPEDITION_MAP_CONTENT = {
  [EXPEDITION_STAGE_IDS.EGYPT]: {
    id: EXPEDITION_STAGE_IDS.EGYPT,
    targetCivilisation: TARGET_CIVILISATION,
    startsAt: 'journey',
    zones: ZONES,
    terrainByZone: EXCAVATION_TERRAIN_BY_ZONE,
    surveyZones: SURVEY_ZONES,
    surveyZoneById: SURVEY_ZONE_BY_ID,
    surveyRevealLinks: SURVEY_REVEAL_LINKS,
    gridZoneConfigs: GRID_ZONE_CONFIGS,
    hazards: HAZARDS,
    walls: WALLS,
    guardians: EXCAVATION_GUARDIANS,
    missions: EVIDENCE_HUNT_MISSIONS,
    evidencePicks: EGYPT_EVIDENCE_PICKS,
    roomMapPackId: 'roomMap',
    markerPackId: 'surveyMarkers',
    gatewayPackId: 'gateway',
    mapUiPackId: 'legacy',
    challengeUiPackId: 'challengeUi',
    mapTheme: DEFAULT_EXCAVATION_MAP_THEME,
    defaultZoneName: 'Open Trench',
    visualMode: EXCAVATION_VISUAL_MODE,
    journeyEnvironmentPackId: 'egypt-desert-temple',
    journeyBackgroundPackId: null,
    mapTitle: 'Tomb of Tutankhamun (KV62)',
    routeMusicCue: 'desert',
    excavationMusicCue: 'baseCamp',
    briefingIntro: 'Survey the underground chambers first, choose a dig zone, collect structural evidence to unlock the seal, and prove which civilisation constructed this tomb.',
  },
  [EXPEDITION_STAGE_IDS.CHINA]: {
    id: EXPEDITION_STAGE_IDS.CHINA,
    targetCivilisation: 'Ancient China',
    startsAt: 'journey',
    zones: CHINA_ZONES,
    terrainByZone: CHINA_EXCAVATION_TERRAIN_BY_ZONE,
    surveyZones: CHINA_SURVEY_ZONES,
    surveyZoneById: CHINA_SURVEY_ZONE_BY_ID,
    surveyRevealLinks: CHINA_SURVEY_REVEAL_LINKS,
    gridZoneConfigs: CHINA_GRID_ZONE_CONFIGS,
    hazards: CHINA_HAZARDS,
    walls: CHINA_WALLS,
    guardians: CHINA_EXCAVATION_GUARDIANS,
    missions: CHINA_EVIDENCE_HUNT_MISSIONS,
    evidencePicks: CHINA_EVIDENCE_PICKS,
    roomMapPackId: 'chinaRoomMap',
    markerPackId: 'chinaSurveyGateway',
    gatewayPackId: 'chinaSurveyGateway',
    mapUiPackId: 'chinaSurveyGateway',
    challengeUiPackId: 'chinaChallengeUi',
    mapTheme: CHINA_EXCAVATION_MAP_THEME,
    defaultZoneName: 'Survey Trench',
    visualMode: 'china-room-map-stage-1',
    journeyEnvironmentPackId: 'china-river-valley',
    journeyBackgroundPackId: 'china-river-valley',
    mapTitle: 'Ancient China Expedition Map',
    routeMusicCue: 'bamboo-forest',
    excavationMusicCue: 'baseCamp',
    briefingIntro: 'Survey the river-valley site, choose a dig zone, collect evidence, and prove this Ancient China investigation.',
  },
  [EXPEDITION_STAGE_IDS.ROME]: {
    id: EXPEDITION_STAGE_IDS.ROME,
    targetCivilisation: 'Ancient Rome',
    startsAt: 'journey',
    zones: ROME_ZONES,
    terrainByZone: ROME_EXCAVATION_TERRAIN_BY_ZONE,
    surveyZones: ROME_SURVEY_ZONES,
    surveyZoneById: ROME_SURVEY_ZONE_BY_ID,
    surveyRevealLinks: ROME_SURVEY_REVEAL_LINKS,
    gridZoneConfigs: ROME_GRID_ZONE_CONFIGS,
    hazards: ROME_EXCAVATION_HAZARDS,
    walls: ROME_WALLS,
    guardians: ROME_EXCAVATION_GUARDIANS,
    missions: ROME_EVIDENCE_HUNT_MISSIONS,
    evidencePicks: ROME_EVIDENCE_PICKS,
    roomMapPackId: 'romeRoomMap',
    markerPackId: 'surveyMarkers',
    gatewayPackId: 'gateway',
    mapUiPackId: 'legacy',
    challengeUiPackId: 'romeChallengeUi',
    mapTheme: ROME_EXCAVATION_MAP_THEME,
    defaultZoneName: 'Excavation Trench',
    visualMode: 'rome-room-map-stage-1',
    journeyEnvironmentPackId: 'rome-section-one',
    journeyBackgroundPackId: 'rome',
    mapTitle: 'Forum Romanum Buried Site',
    routeMusicCue: 'romanRoad',
    excavationMusicCue: 'baseCamp',
    briefingIntro: 'Survey the buried Forum site, choose a dig zone, collect structural evidence to unseal the archive, and prove this Ancient Rome investigation.',
  },
};

export const EVIDENCE_MISSION_TYPE_MAP = {
  structures: 'structure',
  written: 'written_record',
  objects: 'material_culture',
  environment: 'environmental',
  remains: 'human_remains',
};
