import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Backpack,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
  Gauge,
  Map as MapIcon,
  ShieldAlert,
  Sparkles,
  Search,
  Camera,
  BookOpen,
  Ruler,
  Compass,
  Hammer,
  Home,
  Keyboard,
  Pause,
  Play,
  Gem,
  Target,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SCENARIOS } from '../data';
import { BUREAU_CASES, getCategoryTitle } from '../utils/gameLogic';
import ExpeditionJourney from './ExpeditionJourney';
import {
  createExcavationMapAssetState,
  drawExcavationMapRegion,
  getMissingExcavationMapAssets,
  loadExcavationMapAssetPack,
} from './expedition/expeditionMapAssets';
import { EXPEDITION_ROOM_CONNECTIONS, EXPEDITION_ROOM_ZONE_BY_ID } from './expedition/expeditionMapLayout';
import {
  BASE_CAMP_PROGRESSION_STORAGE_KEY,
  BASE_CAMP_SHOP_ITEMS,
  BASE_CAMP_SHOP_SECTIONS,
  applyJourneyShardDeposit,
  applyShopPurchase,
  createDefaultProgression,
  getActiveUpgradeEffects,
  getOwnedItemIds,
  normalizeBaseCampProgression,
} from './expedition/baseCampShop';
import { getZoneChallenge } from './expedition/expeditionZoneChallenges';
import {
  EXPEDITION_STAGE_IDS,
  EXPEDITION_STAGES,
  PLAYABLE_EXPEDITION_STAGE_ID,
} from './expedition/expeditionStages';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 560;
const PLAYER_SIZE = 22;
const TARGET_CIVILISATION = 'Ancient Egypt';

const ZONES = [
  { id: 'riverbank', name: 'Entry Corridor', emoji: '👣', x: 0, y: 0, w: 260, h: 220, color: 'rgba(212, 175, 55, 0.15)' },
  { id: 'burial', name: 'Burial Chamber', emoji: '⚰️', x: 260, y: 0, w: 260, h: 220, color: 'rgba(180, 110, 80, 0.18)' },
  { id: 'archive', name: 'The Treasury', emoji: '👑', x: 520, y: 0, w: 280, h: 220, color: 'rgba(230, 185, 90, 0.15)' },
  { id: 'market', name: 'The Annex', emoji: '📦', x: 0, y: 220, w: 320, h: 190, color: 'rgba(240, 190, 110, 0.12)' },
  { id: 'wall', name: 'The Antechamber', emoji: '🛋️', x: 320, y: 220, w: 260, h: 190, color: 'rgba(160, 160, 140, 0.16)' },
  { id: 'gate', name: 'Sealed Entrance', emoji: '🔒', x: 580, y: 220, w: 220, h: 340, color: 'rgba(74, 222, 128, 0.12)' },
];

const EXCAVATION_TERRAIN_BY_ZONE = {
  riverbank: 'roomMap:corridorTerrain',
  burial: 'roomMap:burialChamberTerrain',
  archive: 'roomMap:treasuryTerrain',
  market: 'roomMap:annexTerrain',
  wall: 'roomMap:antechamberTerrain',
  gate: 'roomMap:neutralExcavationTerrain',
};

const EXCAVATION_VISUAL_MODE = 'egypt-room-map-stage-1';
const EXCAVATION_MAP_VISUAL_TUNING_VERSION = 'egypt-room-map-regression-tuning-2026-05-12';
const DEFAULT_EXCAVATION_MAP_THEME = {
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

const CHINA_EXCAVATION_MAP_THEME = {
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

const EGYPT_ARCHIVE_ASSETS = {
  desk: 'assets/expedition/opening/archive-prologue/cairo-archive-desk-2026-06-07.png',
  report: 'assets/expedition/opening/archive-prologue/modern-pyramid-scarab-site-2026-06-07.png',
  painting: 'assets/expedition/opening/archive-prologue/tomb-painting-photo-2026-06-07.png',
  notes: 'assets/expedition/opening/archive-prologue/asha-field-notebook-2026-06-07.png',
};

const EGYPT_ARCHIVE_TRANSPORT_ASSETS = {
  site: 'assets/expedition/opening/scarab-transport/pyramid-scarab-site-approach-2026-06-07.png',
  touch: 'assets/expedition/opening/scarab-transport/scarab-photo-comparison-touch-2026-06-07.png',
  threshold: 'assets/expedition/opening/scarab-transport/scarab-threshold-opening-2026-06-07.png',
};

const EGYPT_ARCHIVE_PROLOGUE_ITEMS = [
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

const EGYPT_ARCHIVE_SITE_TRANSITION_LINES = [
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

const EGYPT_ARCHIVE_SCARAB_CINEMATIC_LINES = [
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

const EGYPT_ARCHIVE_ACTIVATION_LINES = [
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

const EGYPT_ARCHIVE_CINEMATIC_STEPS = [
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

const ROME_ARCHIVE_PROLOGUE_ITEMS = [
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

const ROME_ARCHIVE_SITE_TRANSITION_LINES = [
  'The Forum is quieter than it should be.',
  'Tourists on the upper level.',
  'Barriers where the radar flagged the anomaly.',
  'Asha shows her permit.',
  'The barriers go back.',
  'She descends to the paving level.',
  'Then below it.',
  'The sealed doorway is exactly where the survey said it would be.',
];

const ROME_ARCHIVE_VAULT_LINES = [
  'Iron fittings, corroded but intact.',
  'A lead seal pressed over the latch.',
  'The stamp: Senate authority, pre-eruption.',
  'Someone locked this before Vesuvius.',
  'The eruption buried it.',
  'Nobody came back to open it.',
];

const ROME_ARCHIVE_ACTIVATION_LINES = [
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

const ROME_ARCHIVE_CINEMATIC_STEPS = [
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

const SURVEY_COST = { investigation: -4, time: -8 };
const SURVEY_ZONES = [
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

const SURVEY_ZONE_BY_ID = Object.fromEntries(SURVEY_ZONES.map(zone => [zone.id, zone]));
const SURVEY_REVEAL_LINKS = {
  eg_13: ['archive', 'burial'],
  eg_7: ['burial', 'wall'],
  eg_11: ['riverbank'],
  eg_8: ['wall'],
  eg_10: ['market', 'riverbank'],
  eg_9: ['wall', 'burial'],
};
const GRID_COSTS = {
  Low: { investigation: -2, time: -4 },
  Medium: { investigation: -4, time: -8 },
  High: { investigation: -6, time: -12 },
};
const GRID_ZONE_CONFIGS = {
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

const CHINA_ZONES = [
  { id: 'riverbank', name: 'River Valley', emoji: '', x: 0, y: 0, w: 260, h: 220, color: 'rgba(56, 189, 148, 0.16)' },
  { id: 'burial', name: 'Tomb Edge', emoji: '', x: 260, y: 0, w: 260, h: 220, color: 'rgba(154, 126, 93, 0.18)' },
  { id: 'archive', name: 'Oracle Archive', emoji: '', x: 520, y: 0, w: 280, h: 220, color: 'rgba(185, 141, 66, 0.16)' },
  { id: 'market', name: 'Bronze Workshop', emoji: '', x: 0, y: 220, w: 320, h: 190, color: 'rgba(168, 112, 57, 0.15)' },
  { id: 'wall', name: 'Rammed Earth Wall', emoji: '', x: 320, y: 220, w: 260, h: 190, color: 'rgba(142, 119, 84, 0.18)' },
  { id: 'gate', name: 'Timber Exit Gate', emoji: '', x: 580, y: 220, w: 220, h: 340, color: 'rgba(74, 222, 128, 0.12)' },
];

const CHINA_EXCAVATION_TERRAIN_BY_ZONE = {
  riverbank: 'chinaRoomMap:riverbankTerrain',
  burial: 'chinaRoomMap:tombEdgeTerrain',
  archive: 'chinaRoomMap:archiveTerrain',
  market: 'chinaRoomMap:workshopTerrain',
  wall: 'chinaRoomMap:rammedEarthWallTerrain',
  gate: 'chinaRoomMap:neutralExcavationTerrain',
};

const CHINA_SURVEY_ZONES = [
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

const CHINA_SURVEY_ZONE_BY_ID = Object.fromEntries(CHINA_SURVEY_ZONES.map(zone => [zone.id, zone]));
const CHINA_SURVEY_REVEAL_LINKS = {
  ch_13: ['archive'],
  ch_7: ['wall'],
  ch_10: ['riverbank'],
  ch_8: ['wall', 'burial'],
  ch_1: ['market', 'burial'],
  ch_9: ['market', 'wall'],
};
const CHINA_GRID_ZONE_CONFIGS = {
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

const EXCAVATION_METHODS = [
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
const EXCAVATION_METHOD_BY_ID = Object.fromEntries(EXCAVATION_METHODS.map(method => [method.id, method]));
const MAP_EVIDENCE_TYPES = [
  { id: 'structure', name: 'Feature / Structure' },
  { id: 'written_record', name: 'Written Source' },
  { id: 'material_culture', name: 'Artefact / Object' },
  { id: 'environmental', name: 'Environmental Evidence' },
  { id: 'human_remains', name: 'Human Remains' },
];
const MAP_EVIDENCE_TYPE_BY_ID = Object.fromEntries(MAP_EVIDENCE_TYPES.map(item => [item.id, item]));
const MAP_EVIDENCE_TYPE_BY_MISSION_TYPE = {
  structure: 'structure',
  written_record: 'written_record',
  material_culture: 'material_culture',
  environmental: 'environmental',
  human_remains: 'human_remains',
};

const WALLS = [
  { x: 322, y: 238, w: 178, h: 34, label: 'plastered brick partition' },
  { x: 98, y: 366, w: 210, h: 28, label: 'golden couch supports' },
  { x: 602, y: 360, w: 118, h: 28, label: 'collapsed shrine base' },
  { x: 618, y: 120, w: 32, h: 98, label: 'rubble blocking wall' },
];

const CHINA_WALLS = [
  { x: 322, y: 238, w: 178, h: 34, label: 'rammed earth spine' },
  { x: 92, y: 342, w: 220, h: 24, label: 'workshop timber edge' },
  { x: 600, y: 360, w: 126, h: 28, label: 'gate approach beam' },
  { x: 618, y: 120, w: 32, h: 98, label: 'archive threshold' },
];

const HAZARDS = [
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

const CHINA_HAZARDS = [
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

const EXCAVATION_GUARDIANS = [
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

const CHINA_EXCAVATION_GUARDIANS = [
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

const ROME_EXCAVATION_MAP_THEME = {
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
const ROME_ZONES = [
  { id: 'riverbank', name: 'Via Sacra Trench',  emoji: '', x: 0,   y: 0,   w: 260, h: 220, color: 'rgba(200, 180, 140, 0.16)' },
  { id: 'burial',    name: 'Forum Pit',          emoji: '', x: 260, y: 0,   w: 260, h: 220, color: 'rgba(160, 140, 110, 0.18)' },
  { id: 'archive',   name: 'Thermae Shaft',      emoji: '', x: 520, y: 0,   w: 280, h: 220, color: 'rgba(80,  90,  95,  0.18)' },
  { id: 'market',    name: 'Basilica Floor',     emoji: '', x: 0,   y: 220, w: 320, h: 190, color: 'rgba(190, 178, 160, 0.15)' },
  { id: 'wall',      name: 'Civic Wing',         emoji: '', x: 320, y: 220, w: 260, h: 190, color: 'rgba(160, 148, 130, 0.18)' },
  { id: 'gate',      name: 'Sealed Archive',     emoji: '', x: 580, y: 220, w: 220, h: 340, color: 'rgba(74, 222, 128, 0.12)' },
];

const ROME_EXCAVATION_TERRAIN_BY_ZONE = {
  riverbank: 'romeRoomMap:romeSacraRoadTerrain',
  burial:    'romeRoomMap:romeForumPitTerrain',
  archive:   'romeRoomMap:romeThermaeShaftTerrain',
  market:    'romeRoomMap:romeBasilicaFloorTerrain',
  wall:      'romeRoomMap:romeCivicWingTerrain',
  gate:      'romeRoomMap:romeNeutralExcavationTerrain',
};

const ROME_SURVEY_ZONES = [
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

const ROME_SURVEY_ZONE_BY_ID = Object.fromEntries(ROME_SURVEY_ZONES.map(zone => [zone.id, zone]));

const ROME_SURVEY_REVEAL_LINKS = {
  rm_13: ['archive', 'market'],  // Wax Tablet → Thermae Shaft or Basilica Floor
  rm_7:  ['burial', 'archive'],  // Aqueduct Arch → Forum Pit or Thermae Shaft
  rm_10: ['riverbank'],          // Volcanic Ash Layer → Via Sacra Trench
  rm_8:  ['archive', 'burial'],  // Hypocaust → Thermae Shaft or Forum Pit
  rm_1:  ['wall', 'market'],     // Bronze Sestertius → Civic Wing or Basilica
  rm_9:  ['market', 'wall'],     // Mosaic Floor → Basilica Floor or Civic Wing
};

const ROME_GRID_ZONE_CONFIGS = {
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

const ROME_WALLS = [
  { x: 322, y: 238, w: 178, h: 34, label: 'marble partition base' },
  { x: 92,  y: 342, w: 220, h: 24, label: 'collapsed column drum' },
  { x: 600, y: 360, w: 126, h: 28, label: 'sealed archive lintel' },
  { x: 618, y: 120, w: 32,  h: 98, label: 'forum threshold block' },
];

const ROME_EXCAVATION_HAZARDS = [
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

const ROME_EXCAVATION_GUARDIANS = [
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

const ROME_EVIDENCE_HUNT_MISSIONS = [
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

const ROME_EVIDENCE_PICKS = [
  { id: 'rm_7',  x: 690, y: 94,  zone: 'Thermae Shaft',    clueGroup: 'Engineering' },
  { id: 'rm_8',  x: 548, y: 340, zone: 'Civic Wing',       clueGroup: 'Engineering' },
  { id: 'rm_10', x: 128, y: 142, zone: 'Via Sacra Trench', clueGroup: 'Environment' },
  { id: 'rm_9',  x: 350, y: 310, zone: 'Basilica Floor',   clueGroup: 'Structures' },
  { id: 'rm_1',  x: 140, y: 330, zone: 'Civic Wing',       clueGroup: 'Artefacts' },
  { id: 'rm_13', x: 532, y: 330, zone: 'Basilica Floor',   clueGroup: 'Written' },
];

// ─── End Rome constants ────────────────────────────────────────────────────────

const CLAIM_OPTIONS = ['Ancient Egypt', 'Ancient Greece', 'Ancient Rome', 'Ancient China', 'Maya', 'Inca'];
const INITIAL_RESOURCES = { investigation: 95, stamina: 100, time: 600 };
const INVESTIGATION_BONUS = 5;
const BRUSH_RECOVERY_BONUS = 3;
const TROWEL_EXCAVATION_BONUS = 2;
const CAMERA_DOCUMENTATION_BONUS = 1;
const MAX_EVIDENCE_ITEMS = 3;
const JOURNEY_TOOLS = ExpeditionJourney.tools;
const TOOL_EFFECTS = {
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
    collectedDesc: 'The field guide provides instant reference for identifying Egyptian pottery and architectural styles.',
    missingDesc: 'Identifying unfamiliar artifacts will be much slower and more prone to error.'
  },
};
const RANK_BANDS = [
  { min: 90, title: 'Lead Archaeologist' },
  { min: 75, title: 'Field Investigator' },
  { min: 60, title: 'Evidence Apprentice' },
  { min: 40, title: 'Trainee Excavator' },
  { min: 0, title: 'Needs More Training' },
];
const EVIDENCE_HUNT_MISSIONS = [
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

const CHINA_EVIDENCE_HUNT_MISSIONS = [
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

const EGYPT_EVIDENCE_PICKS = [
  { id: 'eg_13', x: 690, y: 94, zone: 'The Treasury', clueGroup: 'Legacy' },
  { id: 'eg_7', x: 548, y: 340, zone: 'The Antechamber', clueGroup: 'Society' },
  { id: 'eg_11', x: 128, y: 142, zone: 'Entry Corridor', clueGroup: 'Geography' },
  { id: 'eg_8', x: 350, y: 310, zone: 'The Antechamber', clueGroup: 'Society' },
  { id: 'eg_10', x: 140, y: 330, zone: 'The Annex', clueGroup: 'Society' },
  { id: 'eg_9', x: 532, y: 330, zone: 'The Antechamber', clueGroup: 'Society' },
];

const CHINA_EVIDENCE_PICKS = [
  { id: 'ch_13', x: 690, y: 94, zone: 'Oracle Archive', clueGroup: 'Writing' },
  { id: 'ch_7', x: 548, y: 340, zone: 'Rammed Earth Wall', clueGroup: 'Organisation' },
  { id: 'ch_10', x: 128, y: 142, zone: 'River Valley', clueGroup: 'Geography' },
  { id: 'ch_8', x: 350, y: 310, zone: 'Rammed Earth Wall', clueGroup: 'Engineering' },
  { id: 'ch_1', x: 140, y: 330, zone: 'Bronze Workshop', clueGroup: 'Power' },
  { id: 'ch_9', x: 532, y: 330, zone: 'Rammed Earth Wall', clueGroup: 'Technology' },
];

const EXPEDITION_MAP_CONTENT = {
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
    routeMusicCue: 'desert',
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
    journeyEnvironmentPackId: 'egypt-desert-temple',
    journeyBackgroundPackId: 'rome',
    mapTitle: 'Forum Romanum Buried Site',
    routeMusicCue: 'desert',
    excavationMusicCue: 'baseCamp',
    briefingIntro: 'Survey the buried Forum site, choose a dig zone, collect structural evidence to unseal the archive, and prove this Ancient Rome investigation.',
  },
};

const getExpeditionMapContent = (stageId = PLAYABLE_EXPEDITION_STAGE_ID) => (
  EXPEDITION_MAP_CONTENT[stageId] || EXPEDITION_MAP_CONTENT[PLAYABLE_EXPEDITION_STAGE_ID]
);

const normaliseEvidenceTypeForMission = (type) => (
  type === 'environment' ? 'environmental' : type
);

const EVIDENCE_MISSION_TYPE_MAP = {
  structures: 'structure',
  written: 'written_record',
  objects: 'material_culture',
  environment: 'environmental',
  remains: 'human_remains',
};

const getMissionEvidenceType = (type) => EVIDENCE_MISSION_TYPE_MAP[type] || normaliseEvidenceTypeForMission(type);

const evidenceMatchesMission = (token, mission) => (
  token?.missionType === mission?.targetEvidenceType
);

const getMapEvidenceTypeIdForToken = (token) => (
  MAP_EVIDENCE_TYPE_BY_MISSION_TYPE[token?.missionType] || 'structure'
);

const getMapEvidenceTypeName = (typeId) => MAP_EVIDENCE_TYPE_BY_ID[typeId]?.name || typeId || 'Unknown';

const isMappingAccurate = (token, typeId) => (
  getMapEvidenceTypeIdForToken(token) === typeId
);

const quickDigDamagesEvidence = (token, mission) => (
  evidenceMatchesMission(token, mission)
);

const getExcavationOutcome = (methodId, token, fieldKitEffects, mission) => {
  const method = EXCAVATION_METHOD_BY_ID[methodId];
  if (!method || !token) return null;

  if (method.id === 'brush') {
    const excellent = fieldKitEffects.brushReady || ['written_record', 'human_remains'].includes(token.missionType);
    return {
      quality: excellent ? 'excellent' : method.baseQuality,
      damaged: false,
      bonus: fieldKitEffects.brushReady ? 2 : 0,
      feedback: `${method.feedback} Careful excavation protects fragile evidence and keeps it useful for historians.`,
      kitFeedback: fieldKitEffects.brushReady ? 'Brush from field kit used: recovery quality improved.' : '',
    };
  }

  if (method.id === 'trowel') {
    const suitedEvidence = ['structure', 'material_culture'].includes(token.missionType);
    return {
      quality: fieldKitEffects.trowelReady && suitedEvidence ? 'excellent' : method.baseQuality,
      damaged: false,
      bonus: fieldKitEffects.trowelReady && suitedEvidence ? 2 : 0,
      feedback: method.feedback,
      kitFeedback: fieldKitEffects.trowelReady && suitedEvidence ? 'Trowel from field kit used: the find was excavated cleanly.' : '',
    };
  }

  if (method.id === 'quick-dig') {
    const damaged = quickDigDamagesEvidence(token, mission);
    return {
      quality: damaged ? 'damaged' : 'good',
      damaged,
      bonus: 0,
      feedback: damaged
        ? 'The evidence was partly damaged because the excavation was rushed.'
        : method.feedback,
      kitFeedback: '',
    };
  }

  return null;
};

const getEvidenceMissionLabel = (token, mission) => (
  evidenceMatchesMission(token, mission) ? 'Mission evidence' : 'General discovery'
);

const getRankTitle = (score) => RANK_BANDS.find(rank => score >= rank.min)?.title || RANK_BANDS[RANK_BANDS.length - 1].title;

const getRankFeedback = (score) => {
  if (score >= 90) {
    return 'Excellent fieldwork. You used evidence carefully and made a strong historical claim.';
  }
  if (score >= 60) {
    return 'Good work. You found useful evidence, but your claim or field preparation could be stronger.';
  }
  return 'You need more training. Review the mission, collect useful tools, and choose evidence that supports your claim.';
};

const getResourceFailureMessage = (resources) => {
  if (resources.investigation <= 0) {
    return 'Field rescue needed: investigation points reached zero. Restart and avoid site hazards.';
  }
  if (resources.stamina <= 0) {
    return 'Field rescue needed: Endurance reached zero. Restart and take a safer route.';
  }
  if (resources.time <= 0) {
    return 'Field rescue needed: time ran out. Restart and plan the excavation more carefully.';
  }
  return 'Field rescue needed. Restart the expedition and try a safer route.';
};

const chooseEvidenceHuntMission = (previousMissionId = null, missions = EVIDENCE_HUNT_MISSIONS) => {
  const choices = missions.filter(mission => mission.id !== previousMissionId);
  const pool = choices.length > 0 ? choices : missions;
  return pool[Math.floor(Math.random() * pool.length)];
};

const getMissionRequiredCount = (mission) => mission?.requiredTargetCount || 1;

const buildExcavationGuardians = (guardians = EXCAVATION_GUARDIANS) => guardians.map(guardian => ({
  ...guardian,
  targetIndex: 1,
}));

const rectsOverlap = (a, b) => (
  a.x < b.x + b.w &&
  a.x + a.w > b.x &&
  a.y < b.y + b.h &&
  a.y + a.h > b.y
);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getPlayerRect = (player) => ({
  x: player.x,
  y: player.y,
  w: PLAYER_SIZE,
  h: PLAYER_SIZE,
});

const getZoneName = (player, zones = ZONES, fallbackName = 'Open Trench') => {
  const centre = { x: player.x + PLAYER_SIZE / 2, y: player.y + PLAYER_SIZE / 2 };
  return zones.find(zone => (
    centre.x >= zone.x && centre.x <= zone.x + zone.w &&
    centre.y >= zone.y && centre.y <= zone.y + zone.h
  ))?.name || fallbackName;
};

const getActiveZone = (player, zones = ZONES) => {
  const centre = { x: player.x + PLAYER_SIZE / 2, y: player.y + PLAYER_SIZE / 2 };
  const insideZone = zones.find(zone => (
    centre.x >= zone.x && centre.x <= zone.x + zone.w &&
    centre.y >= zone.y && centre.y <= zone.y + zone.h
  ));
  if (insideZone) return insideZone;

  // Fallback: find the closest zone by distance from center
  let closestZone = zones[0];
  let minDistance = Infinity;
  zones.forEach(zone => {
    const zoneCenterX = zone.x + zone.w / 2;
    const zoneCenterY = zone.y + zone.h / 2;
    const dist = Math.hypot(centre.x - zoneCenterX, centre.y - zoneCenterY);
    if (dist < minDistance) {
      minDistance = dist;
      closestZone = zone;
    }
  });
  return closestZone;
};


const getSurveyZoneAtPlayer = (player, surveyZones = SURVEY_ZONES, zones = ZONES) => {
  const centre = { x: player.x + PLAYER_SIZE / 2, y: player.y + PLAYER_SIZE / 2 };
  const zone = surveyZones.find(item => {
    const mapZone = zones.find(mapItem => mapItem.id === item.id);
    return mapZone && centre.x >= mapZone.x && centre.x <= mapZone.x + mapZone.w &&
      centre.y >= mapZone.y && centre.y <= mapZone.y + mapZone.h;
  });
  return zone || null;
};

const getGridSquaresForZone = (zoneId, gridZoneConfigs = GRID_ZONE_CONFIGS) => gridZoneConfigs[zoneId] || [];

const evidenceVisibleForGrid = (token, selectedSurveyZone, openedGridSquares, surveyRevealLinks = SURVEY_REVEAL_LINKS, gridZoneConfigs = GRID_ZONE_CONFIGS) => {
  if (!selectedSurveyZone || !surveyRevealLinks[token.id]?.includes(selectedSurveyZone)) {
    return false;
  }
  if (!openedGridSquares || openedGridSquares.size === 0) {
    return false;
  }
  return getGridSquaresForZone(selectedSurveyZone, gridZoneConfigs).some(square => (
    openedGridSquares.has(square.id) && square.linkedEvidenceIds.includes(token.id)
  ));
};

const getOpenedGridSquareForEvidence = (token, selectedSurveyZone, openedGridSquares, gridZoneConfigs = GRID_ZONE_CONFIGS) => (
  getGridSquaresForZone(selectedSurveyZone, gridZoneConfigs).find(square => (
    openedGridSquares?.has(square.id) && square.linkedEvidenceIds.includes(token.id)
  ))?.id || null
);

const getSurveyZoneName = (zoneId, surveyZoneById = SURVEY_ZONE_BY_ID) => (
  zoneId ? surveyZoneById[zoneId]?.name || zoneId : null
);

const loadBaseCampProgression = () => {
  if (typeof window === 'undefined') return createDefaultProgression();
  try {
    const saved = window.localStorage.getItem(BASE_CAMP_PROGRESSION_STORAGE_KEY);
    return normalizeBaseCampProgression(saved ? JSON.parse(saved) : null);
  } catch {
    return createDefaultProgression();
  }
};

const saveBaseCampProgression = (progression) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      BASE_CAMP_PROGRESSION_STORAGE_KEY,
      JSON.stringify(normalizeBaseCampProgression(progression))
    );
  } catch {
    // localStorage can be unavailable in strict browser modes; the run still works without persistence.
  }
};

const buildExpeditionEvidence = (content = getExpeditionMapContent()) => {
  const scenario = SCENARIOS.find(item => item.civilization === content.targetCivilisation);
  const byId = new Map((scenario?.evidence || []).map(item => [item.id, item]));

  return content.evidencePicks.map((pick, index) => {
    const source = byId.get(pick.id);
    return {
      ...pick,
      key: pick.id,
      name: source?.name || `Evidence ${index + 1}`,
      type: source?.type || 'objects',
      missionType: getMissionEvidenceType(source?.type || 'objects'),
      category: getCategoryTitle(source?.type),
      clue: source?.clue || 'A clue from the site.',
      rationale: source?.rationale || 'This evidence helps explain the site.',
      supports: content.targetCivilisation,
      collected: false,
    };
  });
};

export function ExpeditionMode({ onBackToMenu, audioControls = {}, onSendToLab }) {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const playerRef = useRef({ x: 42, y: 498 });
  const journeySnapshotRef = useRef(null);
  const collectedRef = useRef([]);
  const tokensRef = useRef(buildExpeditionEvidence());
  const guardiansRef = useRef(buildExcavationGuardians());
  const resourcesRef = useRef(INITIAL_RESOURCES);
  const hazardCooldownRef = useRef({});
  const guardianCooldownRef = useRef({});
  const lockedRef = useRef(false);
  const tickAccumulatorRef = useRef(0);
  const nearbyTokenRef = useRef(null);
  const nearbySurveyZoneRef = useRef(null);
  const dismissedTokenRef = useRef(null);
  const cameraRef = useRef({ x: 0, y: 0 });
  const shroudRectRef = useRef({ x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT });
  const [collectedEvidence, setCollectedEvidence] = useState([]);
  const [fieldNotes, setFieldNotes] = useState([]);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [currentZone, setCurrentZone] = useState('Market Area');
  const [activeMission, setActiveMission] = useState(() => chooseEvidenceHuntMission());
  const [notice, setNotice] = useState('Complete the Bureau evidence hunt to unlock the Exit Gate.');
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [nearbyToken, setNearbyToken] = useState(null);
  const [selectedSurveyZone, setSelectedSurveyZone] = useState(null);
  const [surveyedZones, setSurveyedZones] = useState(() => new Set());
  const [nearbySurveyZone, setNearbySurveyZone] = useState(null);
  const [surveyReportZone, setSurveyReportZone] = useState(null);
  const [gridSetupOpen, setGridSetupOpen] = useState(false);
  const [selectedGridSquare, setSelectedGridSquare] = useState(null);
  const [openedGridSquares, setOpenedGridSquares] = useState(() => new Set());
  const [inspectionToken, setInspectionToken] = useState(null);
  const [inspectionStep, setInspectionStep] = useState('review');
  const [inspectionFeedback, setInspectionFeedback] = useState(null);
  const [selectedExcavationMethod, setSelectedExcavationMethod] = useState(null);
  const [excavationMethodHistory, setExcavationMethodHistory] = useState([]);
  const [selectedMappedEvidenceType, setSelectedMappedEvidenceType] = useState('');
  const [mappingFeedback, setMappingFeedback] = useState(null);
  const [mappedFinds, setMappedFinds] = useState([]);
  const [missionEvidenceCount, setMissionEvidenceCount] = useState(0);
  const [claimOpen, setClaimOpen] = useState(false);
  const [selectedCivilisation, setSelectedCivilisation] = useState('');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [focusedStageIndex, setFocusedStageIndex] = useState(0);
  const [claimResult, setClaimResult] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [expeditionFailure, setExpeditionFailure] = useState(null);
  const [expeditionStage, setExpeditionStage] = useState('journey');
  const [selectedExpedition, setSelectedExpedition] = useState(null);
  const [previewExpedition, setPreviewExpedition] = useState(null);
  const [baseCampOpen, setBaseCampOpen] = useState(false);
  const [fieldKit, setFieldKit] = useState([]);
  const [journeyRunId, setJourneyRunId] = useState(0);
  const [journeyPaused, setJourneyPaused] = useState(false);
  const [journeyCursorHidden, setJourneyCursorHidden] = useState(false);
  const [baseCampProgression, setBaseCampProgression] = useState(loadBaseCampProgression);
  const [shopFeedback, setShopFeedback] = useState(null);
  const baseCampProgressionRef = useRef(baseCampProgression);
  const journeyCursorTimerRef = useRef(null);
  const [excavationMapAssets, setExcavationMapAssets] = useState(() => createExcavationMapAssetState());
  const [selectedMapZone, setSelectedMapZone] = useState(null);
  const [enteredMapZone, setEnteredMapZone] = useState(null);
  const [completedZoneChallenges, setCompletedZoneChallenges] = useState(() => new Set());
  const [activeZoneChallenge, setActiveZoneChallenge] = useState(null);
  const [zoneChallengeFeedback, setZoneChallengeFeedback] = useState(null);
  const [inspectedPrologueItems, setInspectedPrologueItems] = useState(() => new Set());
  const [prologueCinematicStep, setPrologueCinematicStep] = useState(null);

  useEffect(() => {
    window.DEBUG_EXPEDITION = { setExpeditionStage, setBaseCampOpen, setSelectedExpedition };
  }, [setExpeditionStage, setBaseCampOpen, setSelectedExpedition]);

  useEffect(() => {
    baseCampProgressionRef.current = baseCampProgression;
    saveBaseCampProgression(baseCampProgression);
  }, [baseCampProgression]);

  const selectedStageId = selectedExpedition?.id || PLAYABLE_EXPEDITION_STAGE_ID;
  const stageContent = useMemo(() => getExpeditionMapContent(selectedStageId), [selectedStageId]);
  const targetCivilisation = stageContent.targetCivilisation;
  const mapZones = stageContent.zones;
  const terrainByZone = stageContent.terrainByZone;
  const surveyZones = stageContent.surveyZones;
  const surveyZoneById = stageContent.surveyZoneById;
  const surveyRevealLinks = stageContent.surveyRevealLinks;
  const gridZoneConfigs = stageContent.gridZoneConfigs;
  const mapHazards = stageContent.hazards;
  const mapWalls = stageContent.walls;
  const mapTheme = stageContent.mapTheme;
  const defaultZoneName = stageContent.defaultZoneName;
  const roomMapPackId = stageContent.roomMapPackId;
  const markerPackId = stageContent.markerPackId;
  const gatewayPackId = stageContent.gatewayPackId;
  const mapUiPackId = stageContent.mapUiPackId;
  const challengeUiPackId = stageContent.challengeUiPackId;
  const excavationAssetPackIds = useMemo(() => (
    [...new Set([
      roomMapPackId,
      markerPackId,
      gatewayPackId,
      mapUiPackId,
      challengeUiPackId,
    ].filter(Boolean))]
  ), [challengeUiPackId, gatewayPackId, mapUiPackId, markerPackId, roomMapPackId]);

  useEffect(() => {
    if (!selectedExpedition || expeditionStage !== 'excavation') return undefined;
    return loadExcavationMapAssetPack({
      baseUrl: import.meta.env.BASE_URL || '/',
      packIds: excavationAssetPackIds,
      onUpdate: setExcavationMapAssets,
    });
  }, [excavationAssetPackIds, expeditionStage, selectedExpedition]);

  const trainingCivilisations = useMemo(() => (
    BUREAU_CASES
      .filter(item => item.round === 'training')
      .map(item => item.civilisation)
      .filter(civilisation => CLAIM_OPTIONS.includes(civilisation))
  ), []);
  const claimCivilisations = useMemo(() => (
    [...new Set([...trainingCivilisations, targetCivilisation])]
  ), [targetCivilisation, trainingCivilisations]);

  const missionRequiredCount = getMissionRequiredCount(activeMission);
  const exitUnlocked = missionEvidenceCount >= missionRequiredCount;
  const surveyComplete = Boolean(selectedSurveyZone);
  const selectedMapZoneData = selectedMapZone ? (mapZones.find(zone => zone.id === selectedMapZone) || null) : null;
  const selectedRoomData = selectedMapZone ? (EXPEDITION_ROOM_ZONE_BY_ID[selectedMapZone] || null) : null;
  const activeChallengeData = activeZoneChallenge ? getZoneChallenge(activeZoneChallenge) : null;
  const canSurveySelectedZone = Boolean(selectedMapZone && surveyZoneById[selectedMapZone] && completedZoneChallenges.has(selectedMapZone));
  const gridSquares = useMemo(() => getGridSquaresForZone(selectedSurveyZone, gridZoneConfigs), [gridZoneConfigs, selectedSurveyZone]);
  const baseCampOwnedItemIds = useMemo(() => {
    const owned = getOwnedItemIds(baseCampProgression);
    fieldKit.forEach(toolId => owned.add(toolId));
    return owned;
  }, [baseCampProgression, fieldKit]);
  const permanentUpgradeEffects = useMemo(() => (
    getActiveUpgradeEffects(baseCampProgression.purchasedUpgrades)
  ), [baseCampProgression.purchasedUpgrades]);
  const shopItemsBySection = useMemo(() => (
    BASE_CAMP_SHOP_SECTIONS.map(section => ({
      section,
      items: BASE_CAMP_SHOP_ITEMS.filter(item => item.section === section),
    })).filter(group => group.items.length > 0)
  ), []);
  const activeBaseCampKitSummary = useMemo(() => (
    BASE_CAMP_SHOP_ITEMS
      .filter(item => item.type === 'upgrade' && baseCampProgression.purchasedUpgrades.includes(item.id))
      .map(item => item.activeSummary || item.shortEffect)
      .slice(0, 5)
  ), [baseCampProgression.purchasedUpgrades]);
  const gridComplete = openedGridSquares.size > 0;
  const getVisibleEvidence = useCallback(() => (
    tokensRef.current.filter(token => !token.collected && evidenceVisibleForGrid(token, selectedSurveyZone, openedGridSquares, surveyRevealLinks, gridZoneConfigs))
  ), [gridZoneConfigs, openedGridSquares, selectedSurveyZone, surveyRevealLinks]);
  const getHiddenEvidence = useCallback(() => (
    tokensRef.current.filter(token => !token.collected && !evidenceVisibleForGrid(token, selectedSurveyZone, openedGridSquares, surveyRevealLinks, gridZoneConfigs))
  ), [gridZoneConfigs, openedGridSquares, selectedSurveyZone, surveyRevealLinks]);
  const fieldKitSet = useMemo(() => new Set(fieldKit), [fieldKit]);
  const fieldKitEffects = useMemo(() => ({
    fieldGuideAvailable: fieldKitSet.has('field-guide-page'),
    notebookReady: fieldKitSet.has('notebook'),
    brushReady: fieldKitSet.has('brush'),
    trowelReady: fieldKitSet.has('trowel'),
    cameraReady: fieldKitSet.has('camera'),
    measuringTapeReady: fieldKitSet.has('measuring-tape'),
  }), [fieldKitSet]);
  const selectedEvidence = useMemo(() => (
    collectedEvidence.find(item => item.id === selectedEvidenceId) || null
  ), [collectedEvidence, selectedEvidenceId]);
  const satchelContents = useMemo(() => (
    collectedEvidence.map(item => ({
      ...item,
      matchesMission: evidenceMatchesMission(item, activeMission),
      missionLabel: getEvidenceMissionLabel(item, activeMission),
    }))
  ), [activeMission, collectedEvidence]);
  const pendingEvidence = useMemo(() => (
    inspectionToken ? {
      ...inspectionToken,
      matchesMission: evidenceMatchesMission(inspectionToken, activeMission),
      missionLabel: getEvidenceMissionLabel(inspectionToken, activeMission),
    } : null
  ), [activeMission, inspectionToken]);
  const excavationMethodOpen = Boolean(inspectionToken && inspectionStep === 'excavate');
  const excavationMethodRequired = Boolean(inspectionToken && !inspectionToken.excavationMethod);
  const mappingOpen = Boolean(inspectionToken && inspectionStep === 'map');
  const mappingRequired = Boolean(inspectionToken && !inspectionToken.mappedEvidenceType);
  const pendingMappedEvidence = useMemo(() => (
    inspectionToken ? {
      ...inspectionToken,
      selectedSurveyZone: getSurveyZoneName(selectedSurveyZone, surveyZoneById),
      selectedGridSquare: getOpenedGridSquareForEvidence(inspectionToken, selectedSurveyZone, openedGridSquares, gridZoneConfigs) || selectedGridSquare,
      mappedEvidenceType: inspectionToken.mappedEvidenceType ? getMapEvidenceTypeName(inspectionToken.mappedEvidenceType) : null,
      mappingAccurate: inspectionToken.mappingAccurate ?? null,
    } : null
  ), [gridZoneConfigs, inspectionToken, openedGridSquares, selectedGridSquare, selectedSurveyZone, surveyZoneById]);
  const inventoryFullDecisionOpen = Boolean(inspectionToken && ['capacity', 'replace', 'mission'].includes(inspectionStep));
  const evidenceQualitySummary = useMemo(() => (
    collectedEvidence.reduce((summary, item) => {
      const quality = item.evidenceQuality || 'good';
      return {
        ...summary,
        [quality]: (summary[quality] || 0) + 1,
      };
    }, { excellent: 0, good: 0, damaged: 0 })
  ), [collectedEvidence]);
  const mappedFindsSummary = useMemo(() => (
    mappedFinds
  ), [mappedFinds]);
  const mappingAccuracySummary = useMemo(() => {
    const accurate = mappedFindsSummary.filter(item => item.mappingAccurate).length;
    const needsReview = mappedFindsSummary.length - accurate;
    return { mapped: mappedFindsSummary.length, accurate, needsReview };
  }, [mappedFindsSummary]);
  const missingTools = useMemo(() => (
    JOURNEY_TOOLS.filter(tool => !fieldKitSet.has(tool.id))
  ), [fieldKitSet]);
  const collectedTools = useMemo(() => (
    JOURNEY_TOOLS.filter(tool => fieldKitSet.has(tool.id))
  ), [fieldKitSet]);
  const fieldKitImpact = useMemo(() => (
    JOURNEY_TOOLS.map((tool) => {
      const effects = TOOL_EFFECTS[tool.id];
      const isCollected = fieldKitSet.has(tool.id);
      return {
        id: tool.id,
        name: tool.name,
        shortTitle: effects?.shortTitle || tool.name,
        icon: effects?.icon || Search,
        isCollected,
        impact: effects?.impact || 'N/A',
        collectedDesc: effects?.collectedDesc || 'Standard equipment is secured.',
        missingDesc: effects?.missingDesc || 'Standard equipment is missing.',
      };
    })
  ), [fieldKitSet]);
  const fieldKitBonus = useMemo(() => {
    if (!claimResult) return 0;
    const bonus =
      (fieldKitEffects.fieldGuideAvailable ? 2 : 0) +
      (fieldKitEffects.notebookReady && fieldNotes.length > 0 ? 2 : 0) +
      (fieldKitEffects.cameraReady && collectedEvidence.length > 0 ? 2 : 0) +
      (fieldKitEffects.measuringTapeReady ? 2 : 0) +
      (fieldKitEffects.trowelReady && collectedEvidence.some(item => ['structure', 'material_culture'].includes(item.missionType)) ? 2 : 0) +
      (fieldKitEffects.brushReady && collectedEvidence.some(item => item.isMissionEvidence) ? 2 : 0);
    return Math.min(10, bonus);
  }, [claimResult, collectedEvidence, fieldKitEffects, fieldNotes.length]);
  const evidenceQualityBonus = useMemo(() => {
    if (!claimResult) return 0;
    const bonus = (evidenceQualitySummary.excellent * 2) - (evidenceQualitySummary.damaged * 2);
    return clamp(bonus, -6, 6);
  }, [claimResult, evidenceQualitySummary]);
  const mappingAccuracyBonus = useMemo(() => {
    if (!claimResult) return 0;
    const bonus = (mappingAccuracySummary.accurate * 2) - mappingAccuracySummary.needsReview + (fieldKitEffects.measuringTapeReady ? 1 : 0);
    return clamp(bonus, -10, 10);
  }, [claimResult, fieldKitEffects.measuringTapeReady, mappingAccuracySummary]);
  const claimCorrect = claimResult ? selectedCivilisation === targetCivilisation : false;
  const evidenceSupportsClaim = claimResult ? selectedEvidence?.supports === targetCivilisation : false;
  const missionComplete = missionEvidenceCount >= missionRequiredCount;
  const finalScore = useMemo(() => {
    if (!claimResult) return null;
    const toolsScore = Math.round((fieldKit.length / JOURNEY_TOOLS.length) * 15);
    const investigationScore = Math.round((resources.investigation / 100) * 10);
    const staminaScore = Math.round((resources.stamina / 100) * 5);
    const timeScore = Math.round((resources.time / INITIAL_RESOURCES.time) * 5);
    return clamp(
      (missionComplete ? 25 : 0) +
      (claimCorrect ? 20 : 0) +
      (evidenceSupportsClaim ? 20 : 0) +
      toolsScore +
      investigationScore +
      staminaScore +
      timeScore +
      fieldKitBonus +
      mappingAccuracyBonus +
      evidenceQualityBonus,
      0,
      100
    );
  }, [claimCorrect, claimResult, evidenceQualityBonus, evidenceSupportsClaim, fieldKit.length, fieldKitBonus, mappingAccuracyBonus, missionComplete, resources]);
  const finalRank = finalScore === null ? null : getRankTitle(finalScore);
  const resultFeedback = finalScore === null ? '' : getRankFeedback(finalScore);
  const syncInventory = useCallback((items) => {
    const nextItems = [...items];
    collectedRef.current = nextItems;
    setCollectedEvidence(nextItems);
    setMissionEvidenceCount(nextItems.filter(item => item.isMissionEvidence).length);
  }, []);

  const triggerExpeditionRescue = useCallback((message) => {
    lockedRef.current = true;
    keysRef.current = {};
    setInspectionToken(null);
    setInspectionStep('review');
    setInspectionFeedback(null);
    setSelectedExcavationMethod(null);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
    setSurveyReportZone(null);
    setGridSetupOpen(false);
    setClaimOpen(false);
    setResultOpen(false);
    setExpeditionFailure({
      stage: expeditionStage,
      message,
    });
    setNotice(message);
    audioControls.playError?.();
  }, [audioControls, expeditionStage]);

  const syncResources = useCallback((patch) => {
    const nextResources = {
      investigation: clamp(resourcesRef.current.investigation + (patch.investigation || 0), 0, 100),
      stamina: clamp(resourcesRef.current.stamina + (patch.stamina || 0), 0, 100),
      time: clamp(resourcesRef.current.time + (patch.time || 0), 0, 600),
    };
    resourcesRef.current = nextResources;
    setResources({ ...resourcesRef.current });
    const resourceLost = (patch.investigation || 0) < 0 || (patch.stamina || 0) < 0 || (patch.time || 0) < 0;
    if (resourceLost && (nextResources.investigation <= 0 || nextResources.stamina <= 0 || nextResources.time <= 0)) {
      triggerExpeditionRescue(getResourceFailureMessage(nextResources));
    }
  }, [triggerExpeditionRescue]);

  const recordFieldNote = useCallback((token, reason) => {
    if (!token) return;
    setFieldNotes(previous => (
      previous.some(note => note.evidenceId === token.id && note.reason === reason)
        ? previous
        : [
            ...previous,
            {
              id: `${token.id}-${reason}`,
              evidenceId: token.id,
              reason,
              name: token.name,
              category: token.category,
              clue: token.clue,
              note: reason === 'rejected'
                ? `${token.name} was inspected but not selected for the mission. It was ${token.category}, so the team kept looking.`
                : `${token.name} was inspected and recorded as ${token.category} evidence from the ${token.zone}.`,
            },
          ]
    ));
  }, []);

  const recordGridFieldNote = useCallback((square, zoneName) => {
    if (!square || !zoneName) return;
    setFieldNotes(previous => (
      previous.some(note => note.id === `grid-${zoneName}-${square.id}`)
        ? previous
        : [
            ...previous,
            {
              id: `grid-${zoneName}-${square.id}`,
              evidenceId: `grid-${square.id}`,
              reason: 'grid-opened',
              name: `Grid ${square.id}`,
              category: 'Grid square',
              clue: square.clue,
              note: `${zoneName} grid ${square.id} was opened and recorded before excavation. ${square.possibleEvidenceHint}`,
            },
          ]
    ));
  }, []);

  const recordExcavationMethodNote = useCallback((token, method, outcome) => {
    if (!token || !method || !outcome) return;
    setFieldNotes(previous => (
      previous.some(note => note.id === `${token.id}-excavation-method`)
        ? previous
        : [
            ...previous,
            {
              id: `${token.id}-excavation-method`,
              evidenceId: token.id,
              reason: 'excavation-method',
              name: token.name,
              category: token.category,
              clue: token.clue,
              note: `${method.name} was used on ${token.name}. Evidence quality: ${outcome.quality}.`,
          },
        ]
    ));
  }, []);

  const recordMappingNote = useCallback((token, mapping) => {
    if (!token || !mapping) return;
    setFieldNotes(previous => (
      previous.some(note => note.id === `${token.id}-mapping`)
        ? previous
        : [
            ...previous,
            {
              id: `${token.id}-mapping`,
              evidenceId: token.id,
              reason: 'mapping',
              name: token.name,
              category: token.category,
              clue: token.clue,
              note: `${mapping.zone} | ${mapping.gridSquare} | ${mapping.evidenceType}. Mapping ${mapping.mappingAccurate ? 'was accurate' : 'needs review'}.`,
            },
          ]
    ));
  }, []);

  const startZoneChallenge = useCallback((zoneId) => {
    const challenge = getZoneChallenge(zoneId);
    if (!challenge) return;
    setSelectedMapZone(zoneId);
    setEnteredMapZone(zoneId);
    setActiveZoneChallenge(zoneId);
    setZoneChallengeFeedback(null);
    setNotice(`${challenge.title}: complete the room check before surveying.`);
  }, []);

  const enterSelectedMapZone = useCallback((zoneId = selectedMapZone) => {
    if (!zoneId) return;
    setEnteredMapZone(zoneId);
    if (!completedZoneChallenges.has(zoneId)) {
      startZoneChallenge(zoneId);
      return;
    }
    const zoneName = mapZones.find(zone => zone.id === zoneId)?.name || getSurveyZoneName(zoneId, surveyZoneById) || 'selected zone';
    setNotice(`${zoneName} entry check complete. Survey is ready.`);
  }, [completedZoneChallenges, mapZones, selectedMapZone, startZoneChallenge, surveyZoneById]);

  const answerZoneChallenge = useCallback((answerId) => {
    const challenge = activeZoneChallenge ? getZoneChallenge(activeZoneChallenge) : null;
    if (!challenge) return;
    const answer = challenge.answers.find(item => item.id === answerId);
    const correct = answerId === challenge.correctAnswerId;
    setZoneChallengeFeedback({
      correct,
      answerId,
      message: answer?.feedback || (correct ? 'Correct.' : 'Try again.'),
    });
    if (correct) {
      setCompletedZoneChallenges(previous => new Set([...previous, activeZoneChallenge]));
      setNotice(`${challenge.title} complete. Survey is unlocked for this zone.`);
    } else {
      setNotice('Try the zone-entry challenge again.');
    }
  }, [activeZoneChallenge]);

  const closeZoneChallenge = useCallback(() => {
    setActiveZoneChallenge(null);
    setZoneChallengeFeedback(null);
  }, []);

  const selectMapZoneAtPoint = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = MAP_WIDTH / rect.width;
    const scaleY = MAP_HEIGHT / rect.height;
    const x = (event.clientX - rect.left) * scaleX + cameraRef.current.x;
    const y = (event.clientY - rect.top) * scaleY + cameraRef.current.y;
    const zone = mapZones.find(item => x >= item.x && x <= item.x + item.w && y >= item.y && y <= item.y + item.h);
    if (!zone) return;
    setSelectedMapZone(zone.id);
    setNotice(`${zone.name} selected. Enter the zone to complete its room check.`);
  }, [mapZones]);

  const openSurveyReport = useCallback((zone = nearbySurveyZoneRef.current, options = {}) => {
    if (briefingOpen || !zone || lockedRef.current || inspectionToken || expeditionFailure) return;
    setSelectedMapZone(zone.id);
    if (!options.skipChallenge && !completedZoneChallenges.has(zone.id)) {
      startZoneChallenge(zone.id);
      return;
    }
    if (!surveyedZones.has(zone.id)) {
      syncResources(SURVEY_COST);
      setSurveyedZones(previous => new Set([...previous, zone.id]));
    }
    setSurveyReportZone(zone);
    setNotice(`Survey report opened for ${zone.name}.`);
  }, [briefingOpen, completedZoneChallenges, expeditionFailure, inspectionToken, startZoneChallenge, surveyedZones, syncResources]);

  const keepSurveying = () => {
    setSurveyReportZone(null);
    setNotice('Keep surveying possible dig zones before choosing where to dig.');
  };

  const markSurveyZone = (zone = surveyReportZone) => {
    if (!zone) return;
    setSelectedMapZone(zone.id);
    setEnteredMapZone(zone.id);
    setSelectedSurveyZone(zone.id);
    setSurveyReportZone(null);
    setGridSetupOpen(true);
    setSelectedGridSquare(null);
    setOpenedGridSquares(new Set());
    nearbyTokenRef.current = null;
    setNearbyToken(null);
    dismissedTokenRef.current = null;
    setNotice(`${zone.name} marked as the dig zone. Open grid squares before evidence can be inspected.`);
  };

  const keepExploringGrid = useCallback(() => {
    setGridSetupOpen(false);
    setNotice('Keep exploring the dig zone or reopen the grid setup when you are ready to investigate a square.');
  }, []);

  const openGridSetup = useCallback(() => {
    if (!selectedSurveyZone || briefingOpen || lockedRef.current || expeditionFailure) return;
    setGridSetupOpen(true);
    setNotice(`Grid setup opened for ${getSurveyZoneName(selectedSurveyZone, surveyZoneById)}.`);
  }, [briefingOpen, expeditionFailure, selectedSurveyZone, surveyZoneById]);

  const openGridSquare = useCallback((square) => {
    if (!square || !selectedSurveyZone) return;
    const zoneName = getSurveyZoneName(selectedSurveyZone, surveyZoneById);
    const alreadyOpened = openedGridSquares.has(square.id);

    if (!alreadyOpened) {
      syncResources(GRID_COSTS[square.risk] || GRID_COSTS.Low);
      setOpenedGridSquares(previous => new Set([...previous, square.id]));
      if (fieldKitEffects.notebookReady) {
        recordGridFieldNote(square, zoneName);
      }
    }

    setSelectedGridSquare(square.id);
    setGridSetupOpen(false);
    nearbyTokenRef.current = null;
    setNearbyToken(null);
    dismissedTokenRef.current = null;

    const measuringTapeNote = !alreadyOpened && fieldKitEffects.measuringTapeReady
      ? ' Measuring Tape used: grid lines marked clearly.'
      : '';
    const repeatNote = alreadyOpened
      ? ' This square was already opened, so no extra resources were used.'
      : '';
    setNotice(`${square.openFeedback}${repeatNote}${measuringTapeNote}`);
  }, [fieldKitEffects.measuringTapeReady, fieldKitEffects.notebookReady, openedGridSquares, recordGridFieldNote, selectedSurveyZone, surveyZoneById, syncResources]);

  const openInspection = useCallback((token = nearbyTokenRef.current) => {
    if (briefingOpen || !surveyComplete || !gridComplete || !token || token.collected || lockedRef.current) return;
    if (!evidenceVisibleForGrid(token, selectedSurveyZone, openedGridSquares, surveyRevealLinks, gridZoneConfigs)) return;
    setInspectionToken(token);
    setInspectionStep(token.excavationMethod ? (token.mappedEvidenceType ? 'review' : 'map') : 'excavate');
    setInspectionFeedback(null);
    setMappingFeedback(null);
    setSelectedExcavationMethod(token.excavationMethod || null);
    setNotice(`Inspecting ${token.name}. Choose an excavation method before deciding if it matches the mission.`);
  }, [briefingOpen, gridComplete, gridZoneConfigs, openedGridSquares, selectedSurveyZone, surveyComplete, surveyRevealLinks]);

  const chooseExcavationMethod = useCallback((methodId) => {
    if (!inspectionToken || inspectionToken.collected) return;
    const method = EXCAVATION_METHOD_BY_ID[methodId];
    const outcome = getExcavationOutcome(methodId, inspectionToken, fieldKitEffects, activeMission);
    if (!method || !outcome) return;

    syncResources(method.cost);
    if (outcome.bonus > 0) {
      syncResources({ investigation: outcome.bonus });
    }

    const updatedToken = {
      ...inspectionToken,
      excavationMethod: method.id,
      excavationMethodName: method.name,
      evidenceQuality: outcome.quality,
      excavationDamaged: outcome.damaged,
      excavationFeedback: outcome.feedback,
    };
    tokensRef.current = tokensRef.current.map(token => (
      token.id === inspectionToken.id ? updatedToken : token
    ));
    nearbyTokenRef.current = nearbyTokenRef.current?.id === inspectionToken.id
      ? updatedToken
      : nearbyTokenRef.current;
    setNearbyToken(previous => previous?.id === inspectionToken.id ? updatedToken : previous);
    setInspectionToken(updatedToken);

    const historyItem = {
      evidenceId: inspectionToken.id,
      evidenceName: updatedToken.name,
      methodId: method.id,
      methodName: method.name,
      quality: outcome.quality,
      damaged: outcome.damaged,
      cost: method.cost,
      bonus: outcome.bonus,
      feedback: outcome.feedback,
      kitFeedback: outcome.kitFeedback,
    };
    setExcavationMethodHistory(previous => (
      previous.some(item => item.evidenceId === inspectionToken.id)
        ? previous.map(item => item.evidenceId === inspectionToken.id ? historyItem : item)
        : [...previous, historyItem]
    ));

    if (fieldKitEffects.notebookReady) {
      recordExcavationMethodNote(updatedToken, method, outcome);
    }

    setSelectedExcavationMethod(historyItem);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
    setInspectionStep('map');
    const bonusText = outcome.bonus > 0 ? ` Field kit bonus: +${outcome.bonus} investigation.` : '';
    const kitText = outcome.kitFeedback ? ` ${outcome.kitFeedback}` : '';
    setNotice(`${method.name} used. Evidence quality: ${outcome.quality}.${bonusText}${kitText}`);
  }, [activeMission, fieldKitEffects, inspectionToken, recordExcavationMethodNote, syncResources]);

  const recordMappedFind = useCallback(() => {
    if (!inspectionToken || inspectionToken.collected || !selectedMappedEvidenceType) return;
    const evidenceTypeId = selectedMappedEvidenceType;
    const evidenceTypeName = getMapEvidenceTypeName(evidenceTypeId);
    const accurate = isMappingAccurate(inspectionToken, evidenceTypeId);
    const zoneName = getSurveyZoneName(selectedSurveyZone, surveyZoneById);
    const gridSquare = getOpenedGridSquareForEvidence(inspectionToken, selectedSurveyZone, openedGridSquares, gridZoneConfigs) || selectedGridSquare || 'Unknown';
    const mapping = {
      id: inspectionToken.id,
      name: inspectionToken.name,
      zone: zoneName,
      gridSquare,
      evidenceType: evidenceTypeName,
      mappedZone: zoneName,
      mappedGridSquare: gridSquare,
      mappedEvidenceType: evidenceTypeName,
      playerMappedType: evidenceTypeId,
      mappingAccurate: accurate,
    };
    const updatedToken = {
      ...inspectionToken,
      mappedZone: zoneName,
      mappedGridSquare: gridSquare,
      mappedEvidenceType: evidenceTypeName,
      playerMappedType: evidenceTypeId,
      mappingAccurate: accurate,
    };
    tokensRef.current = tokensRef.current.map(token => (
      token.id === inspectionToken.id ? updatedToken : token
    ));
    nearbyTokenRef.current = nearbyTokenRef.current?.id === inspectionToken.id
      ? updatedToken
      : nearbyTokenRef.current;
    setNearbyToken(previous => previous?.id === inspectionToken.id ? updatedToken : previous);
    setInspectionToken(updatedToken);

    if (fieldKitEffects.measuringTapeReady) {
      syncResources({ investigation: 1 });
    }
    if (fieldKitEffects.notebookReady) {
      recordMappingNote(updatedToken, mapping);
    }
    setMappedFinds(previous => (
      previous.some(item => item.id === inspectionToken.id)
        ? previous.map(item => item.id === inspectionToken.id ? mapping : item)
        : [...previous, mapping]
    ));

    setMappingFeedback({
      accurate,
      text: accurate
        ? 'Mapping complete. You recorded the evidence accurately.'
        : 'Mapping recorded, but the evidence type may need review. Historians often revisit their first interpretation.',
    });
    setInspectionStep('review');
    setNotice(fieldKitEffects.measuringTapeReady
      ? 'Measuring Tape used: grid location recorded accurately.'
      : accurate
        ? 'Mapping complete. You recorded the evidence accurately.'
        : 'Mapping recorded, but the evidence type may need review.');
  }, [fieldKitEffects.measuringTapeReady, fieldKitEffects.notebookReady, gridZoneConfigs, inspectionToken, openedGridSquares, recordMappingNote, selectedGridSquare, selectedMappedEvidenceType, selectedSurveyZone, surveyZoneById, syncResources]);

  const beginExpedition = () => {
    keysRef.current = {};
    tickAccumulatorRef.current = 0;
    setBriefingOpen(false);
    setNotice('Survey the site first. Choose a promising dig zone before inspecting evidence.');
  };

  const openExpeditionStage = useCallback((stage) => {
    const content = getExpeditionMapContent(stage.id);
    const canOpenPlayableStage = stage.route === 'playable' || stage.route === 'map-playable';
    if (!canOpenPlayableStage || !content) {
      setPreviewExpedition(stage);
      return;
    }

    const nextMission = chooseEvidenceHuntMission(null, content.missions);
    audioControls.initAudio?.();
    audioControls.playExpeditionMusic?.(content.routeMusicCue);
    setSelectedExpedition(stage);
    setPreviewExpedition(null);
    const isEgypt = stage.id === EXPEDITION_STAGE_IDS.EGYPT;
    const isRome  = stage.id === EXPEDITION_STAGE_IDS.ROME;
    const hasPrologue = isEgypt || isRome;
    setExpeditionStage(content.startsAt === 'excavation' ? 'excavation' : hasPrologue ? 'archive-prologue' : 'journey');
    setInspectedPrologueItems(new Set());
    setPrologueCinematicStep(null);
    setBaseCampOpen(false);
    setJourneyPaused(false);
    const savedTools = (baseCampProgressionRef.current?.purchasedUpgrades || []).filter(id =>
      ['brush', 'trowel', 'camera', 'notebook', 'measuring-tape', 'field-guide-page'].includes(id)
    );
    setFieldKit(content.startsAt === 'excavation' ? ['field-guide-page', 'notebook', 'brush', 'trowel', 'camera', 'measuring-tape'] : savedTools);
    setActiveMission(nextMission);
    setJourneyRunId(previous => previous + 1);
    journeySnapshotRef.current = null;
    playerRef.current = { x: 42, y: 498 };
    if (content && content.zones && content.zones.length > 0) {
      const startZone = content.zones.find(zone => zone.id === 'market') || content.zones[0];
      const startCamX = (startZone.x + startZone.w / 2) - 400;
      const startCamY = (startZone.y + startZone.h / 2) - 280;
      cameraRef.current = { x: startCamX, y: startCamY };
      shroudRectRef.current = { x: startZone.x, y: startZone.y, w: startZone.w, h: startZone.h };
    } else {
      cameraRef.current = { x: 0, y: 0 };
      shroudRectRef.current = { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT };
    }
    tokensRef.current = buildExpeditionEvidence(content);
    guardiansRef.current = buildExcavationGuardians(content.guardians);
    collectedRef.current = [];
    resourcesRef.current = INITIAL_RESOURCES;
    hazardCooldownRef.current = {};
    guardianCooldownRef.current = {};
    lockedRef.current = false;
    tickAccumulatorRef.current = 0;
    nearbyTokenRef.current = null;
    nearbySurveyZoneRef.current = null;
    dismissedTokenRef.current = null;
    keysRef.current = {};
    setCollectedEvidence([]);
    setFieldNotes([]);
    setResources(INITIAL_RESOURCES);
    setCurrentZone(content.zones.find(zone => zone.id === 'market')?.name || content.zones[0]?.name || 'Expedition Site');
    setNotice(nextMission.instruction);
    setBriefingOpen(true);
    setNearbyToken(null);
    setSelectedSurveyZone(null);
    setSurveyedZones(new Set());
    setNearbySurveyZone(null);
    setSurveyReportZone(null);
    setSelectedMapZone(null);
    setEnteredMapZone(null);
    setCompletedZoneChallenges(new Set());
    setActiveZoneChallenge(null);
    setZoneChallengeFeedback(null);
    setGridSetupOpen(false);
    setSelectedGridSquare(null);
    setOpenedGridSquares(new Set());
    setInspectionToken(null);
    setInspectionStep('review');
    setInspectionFeedback(null);
    setSelectedExcavationMethod(null);
    setExcavationMethodHistory([]);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
    setMappedFinds([]);
    setMissionEvidenceCount(0);
    setClaimOpen(false);
    setSelectedCivilisation('');
    setSelectedEvidenceId('');
    setClaimResult(null);
    setResultOpen(false);
    setExpeditionFailure(null);
    setShopFeedback(null);
  }, [audioControls]);

  const handleJourneySnapshot = useCallback((snapshot) => {
    journeySnapshotRef.current = snapshot;
  }, []);

  const handleJourneyComplete = useCallback((nextFieldKit) => {
    const journeyShardCount = Math.max(0, Number(journeySnapshotRef.current?.relicShardCount) || 0);
    const foundUpgradeVoucher = (journeySnapshotRef.current?.collectedUpgrades || []).includes('basecamp-upgrade-voucher');
    const depositRunId = `${selectedStageId}-${journeyRunId}`;
    const depositResult = applyJourneyShardDeposit(baseCampProgressionRef.current, {
      runId: depositRunId,
      shardCount: journeyShardCount,
    });
    setFieldKit(nextFieldKit);
    baseCampProgressionRef.current = depositResult.progress;
    setBaseCampProgression(depositResult.progress);
    if (depositResult?.deposited) {
      const shardLabel = depositResult.amount === 1 ? 'relic shard' : 'relic shards';
      setShopFeedback({
        type: 'deposit',
        title: 'Base Camp stores updated',
        message: `${depositResult.amount} ${shardLabel} logged at the outpost for route gear and excavation support${foundUpgradeVoucher ? ' including the optional cache voucher' : ''}.`,
        itemId: null,
      });
    } else if (journeyShardCount > 0) {
      const shardLabel = journeyShardCount === 1 ? 'relic shard' : 'relic shards';
      setShopFeedback({
        type: 'deposit',
        title: 'Base Camp stores updated',
        message: `${journeyShardCount} ${shardLabel} already recorded at the outpost.`,
        itemId: null,
      });
    }
    setBaseCampOpen(true);
    setNotice('Base Camp Outpost reached. Tool Bench, Relic Table, Field Journal, Evidence Board, and Route Map are ready for excavation prep.');
    audioControls.playExpeditionMusic?.('baseCamp');
  }, [audioControls, journeyRunId, selectedStageId]);

  const purchaseShopItem = useCallback((itemId) => {
    const purchaseResult = applyShopPurchase(baseCampProgressionRef.current, itemId);
    baseCampProgressionRef.current = purchaseResult.progress;
    setBaseCampProgression(purchaseResult.progress);
    if (purchaseResult?.ok) {
      if (['brush', 'trowel', 'camera', 'notebook', 'measuring-tape', 'field-guide-page'].includes(itemId)) {
        setFieldKit(prev => [...new Set([...prev, itemId])]);
      }
      setShopFeedback({
        type: 'purchase',
        title: purchaseResult.item.type === 'upgrade' ? 'Expedition Upgrade Acquired' : 'Collection Unlock Acquired',
        message: `${purchaseResult.item.name} added to your Base Camp kit.`,
        itemId: purchaseResult.item.id,
      });
      audioControls.playLevelUp?.();
      audioControls.playSuccess?.();
      return;
    }

    const messageByReason = {
      owned: `${purchaseResult?.item?.name || 'This item'} is already unlocked.`,
      shards: `Collect more relic shards before buying ${purchaseResult?.item?.name || 'this item'}.`,
      locked: `${purchaseResult?.item?.name || 'This item'} is planned for a future expedition route.`,
      missing: 'That shop item is not available.',
    };
    setShopFeedback({
      type: 'blocked',
      title: 'Purchase Not Available',
      message: messageByReason[purchaseResult?.reason] || 'Purchase not available.',
      itemId,
    });
    audioControls.playError?.();
  }, [audioControls]);

  const beginExcavationStage = useCallback(() => {
    keysRef.current = {};
    tickAccumulatorRef.current = 0;
    setExpeditionStage('excavation');
    setBaseCampOpen(false);
    setBriefingOpen(true);
    setSelectedSurveyZone(null);
    setSurveyedZones(new Set());
    setNearbySurveyZone(null);
    setSurveyReportZone(null);
    setSelectedMapZone(null);
    setEnteredMapZone(null);
    setCompletedZoneChallenges(new Set());
    setActiveZoneChallenge(null);
    setZoneChallengeFeedback(null);
    setGridSetupOpen(false);
    setSelectedGridSquare(null);
    setOpenedGridSquares(new Set());
    setSelectedExcavationMethod(null);
    setExcavationMethodHistory([]);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
    setMappedFinds([]);
    nearbySurveyZoneRef.current = null;
    setNotice('Survey the site first. Choose a promising dig zone before inspecting evidence.');
    audioControls.playExpeditionMusic?.('baseCamp');
  }, [audioControls]);

  const closeInspection = () => {
    setInspectionToken(null);
    setInspectionStep('review');
    setInspectionFeedback(null);
    setSelectedExcavationMethod(null);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
  };

  const rejectInspectedEvidence = (token) => {
    if (!token || token.collected) return;
    if (fieldKitEffects.notebookReady) {
      recordFieldNote(token, 'rejected');
    }
    dismissedTokenRef.current = token.id;
    setInspectionToken(null);
    setInspectionStep('review');
    setInspectionFeedback(null);
    setSelectedExcavationMethod(null);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
    setNotice(activeMission.keepSearchingNotice);
  };

  const finishInspection = (token, replacementId = null) => {
    if (!token || token.collected) return;
    const isMissionEvidence = evidenceMatchesMission(token, activeMission);
    const nextInventory = replacementId
      ? collectedRef.current.filter(item => item.id !== replacementId)
      : [...collectedRef.current];

    if (!replacementId && nextInventory.length >= MAX_EVIDENCE_ITEMS) {
      setInspectionStep('capacity');
      setNotice('Your evidence satchel is full. Archaeologists choose the most useful evidence for the mission.');
      return;
    }

    dismissedTokenRef.current = null;
    token.collected = true;
    token.isMissionEvidence = isMissionEvidence;
    token.evidenceQuality = token.evidenceQuality || 'good';
    token.mappedZone = token.mappedZone || getSurveyZoneName(selectedSurveyZone, surveyZoneById);
    token.mappedGridSquare = token.mappedGridSquare || getOpenedGridSquareForEvidence(token, selectedSurveyZone, openedGridSquares, gridZoneConfigs) || selectedGridSquare;
    const legacyMappedTypeId = token['stu' + 'dentMappedType'];
    const mappedTypeId = token.playerMappedType || legacyMappedTypeId || getMapEvidenceTypeIdForToken(token);
    token.mappedEvidenceType = token.mappedEvidenceType || getMapEvidenceTypeName(mappedTypeId);
    token.mappingAccurate = token.mappingAccurate ?? (mappedTypeId ? isMappingAccurate(token, mappedTypeId) : true);
    nextInventory.push(token);
    syncInventory(nextInventory);
    nearbyTokenRef.current = null;
    setNearbyToken(null);

    if (isMissionEvidence) {
      const trowelBonus = fieldKitEffects.trowelReady && ['structure', 'material_culture'].includes(token.missionType)
        ? TROWEL_EXCAVATION_BONUS
        : 0;
      const cameraBonus = fieldKitEffects.cameraReady ? CAMERA_DOCUMENTATION_BONUS : 0;
      const investigationBonus = INVESTIGATION_BONUS + (fieldKitEffects.brushReady ? BRUSH_RECOVERY_BONUS : 0) + trowelBonus + cameraBonus;
      const toolFeedback = [
        fieldKitEffects.brushReady ? 'Brush used: careful recovery bonus added.' : '',
        trowelBonus ? 'Trowel used: excavation bonus added.' : '',
        cameraBonus ? 'Camera used: evidence documented before collection.' : '',
      ].filter(Boolean).join(' ');
      syncResources({ investigation: investigationBonus });
      setInspectionFeedback({
        correct: true,
        stamp: 'EVIDENCE VERIFIED',
        text: `${activeMission.matchFeedback} Excavation method: ${token.excavationMethodName}. Evidence quality: ${token.evidenceQuality}.${toolFeedback ? ` ${toolFeedback}` : ''}`,
      });
      setNotice(`${token.name} added to your evidence satchel. +${investigationBonus} investigation points.`);
      if (missionEvidenceCount + 1 >= missionRequiredCount) {
        setNotice('You have enough evidence to support your claim. Return to the exit point.');
        audioControls.playExpeditionSfx?.('gateUnlock');
        audioControls.playExpeditionStinger?.('gateUnlock');
      }
    } else {
      const trowelBonus = fieldKitEffects.trowelReady && ['structure', 'material_culture'].includes(token.missionType)
        ? TROWEL_EXCAVATION_BONUS
        : 0;
      const cameraBonus = fieldKitEffects.cameraReady ? CAMERA_DOCUMENTATION_BONUS : 0;
      const investigationBonus = trowelBonus + cameraBonus;
      if (investigationBonus > 0) {
        syncResources({ investigation: investigationBonus });
      }
      const toolFeedback = [
        trowelBonus ? 'Trowel used: excavation bonus added.' : '',
        cameraBonus ? 'Camera used: evidence documented before collection.' : '',
      ].filter(Boolean).join(' ');
      setInspectionFeedback({
        correct: false,
        stamp: 'EVIDENCE COLLECTED',
        text: `${activeMission.mismatchFeedback} Excavation method: ${token.excavationMethodName}. Evidence quality: ${token.evidenceQuality}.${toolFeedback ? ` ${toolFeedback}` : ''}`,
      });
      setNotice(`${token.name} added to your evidence satchel.`);
    }
    if (fieldKitEffects.notebookReady) {
      recordFieldNote(token, 'inspected');
    }
    setInspectionStep('review');
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
  };

  const inspectMissionChoice = (matchesMission) => {
    if (!inspectionToken || inspectionToken.collected) return;
    if (!inspectionToken.excavationMethod) {
      setInspectionStep('excavate');
      setNotice('Choose an excavation method before deciding whether to collect this evidence.');
      return;
    }
    if (!inspectionToken.mappedEvidenceType) {
      setInspectionStep('map');
      setNotice('Map the find before deciding whether to collect this evidence.');
      return;
    }

    if (!matchesMission) {
      rejectInspectedEvidence(inspectionToken);
      return;
    }

    if (collectedRef.current.length >= MAX_EVIDENCE_ITEMS) {
      setInspectionStep('capacity');
      setNotice('Your evidence satchel is full. Archaeologists choose the most useful evidence for the mission.');
      return;
    }

    finishInspection(inspectionToken);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    const now = Date.now();
    const assetsReady = excavationMapAssets.loaded && excavationMapAssets.image && !excavationMapAssets.failed;

    const fillRoundRect = (x, y, w, h, radius) => {
      const r = Math.min(radius, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
    };

    // 1. Better Background (Subtle radial gradient)
    const bgGradient = ctx.createRadialGradient(MAP_WIDTH/2, MAP_HEIGHT/2, MAP_WIDTH/4, MAP_WIDTH/2, MAP_HEIGHT/2, MAP_WIDTH);
    bgGradient.addColorStop(0, mapTheme.backgroundInner);
    bgGradient.addColorStop(1, mapTheme.backgroundOuter);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Camera translation start
    ctx.save();
    ctx.translate(-cameraRef.current.x, -cameraRef.current.y);

    if (assetsReady) {
      for (let x = 0; x < MAP_WIDTH; x += 145) {
        for (let y = 0; y < MAP_HEIGHT; y += 96) {
          drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:neutralExcavationTerrain`, { x, y, w: 150, h: 100 }, { alpha: mapTheme.neutralTileAlpha });
        }
      }
      drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:gridOverlay`, { x: 318, y: 230, w: 168, h: 110 }, { alpha: mapTheme.gridOverlayAlpha });
    }

    // 2. Map Grid (Ultra Faint)
    ctx.strokeStyle = mapTheme.gridLineColor;
    ctx.lineWidth = 1;
    for (let x = 0; x <= MAP_WIDTH; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, MAP_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y <= MAP_HEIGHT; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(MAP_WIDTH, y); ctx.stroke();
    }

    if (assetsReady) {
      for (let x = 18; x < MAP_WIDTH; x += 260) {
        drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:surveyStringHorizontal`, { x, y: 212, w: 190, h: 7 }, { alpha: mapTheme.surveyLineAlpha });
        drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:surveyStringHorizontal`, { x: x + 40, y: 414, w: 190, h: 7 }, { alpha: mapTheme.surveyLineSecondaryAlpha });
      }
      for (let x = 252; x < MAP_WIDTH; x += 260) {
        drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:surveyStringVertical`, { x, y: 24, w: 150, h: 6 }, { alpha: mapTheme.surveyLineSecondaryAlpha, rotation: Math.PI / 2 });
      }
      [
        [260, 214], [522, 214], [318, 414], [580, 414], [720, 220],
      ].forEach(([x, y]) => {
        drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:surveyPeg`, { x, y, w: 14, h: 26 }, { alpha: mapTheme.surveyPegAlpha, fit: 'contain' });
      });
    }

    EXPEDITION_ROOM_CONNECTIONS.forEach((connection) => {
      const points = connection.points;
      for (let index = 0; index < points.length - 1; index += 1) {
        const [x1, y1] = points[index];
        const [x2, y2] = points[index + 1];
        const x = Math.min(x1, x2) - 8;
        const y = Math.min(y1, y2) - 8;
        const w = Math.max(Math.abs(x2 - x1), 16) + 16;
        const h = Math.max(Math.abs(y2 - y1), 16) + 16;
        const horizontal = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
        if (!drawExcavationMapRegion(ctx, excavationMapAssets, horizontal ? `${roomMapPackId}:pathHorizontal` : `${roomMapPackId}:pathVertical`, { x, y, w, h }, { alpha: mapTheme.pathAlpha })) {
          ctx.strokeStyle = 'rgba(115, 79, 42, 0.28)';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
      const lastPoint = points[points.length - 1];
      drawExcavationMapRegion(ctx, excavationMapAssets, `${gatewayPackId}:carvedThreshold`, { x: lastPoint[0] - 22, y: lastPoint[1] - 14, w: 44, h: 28 }, { alpha: mapTheme.thresholdAlpha, fit: 'contain' });
    });


    // 3. Map Zones (Terrain background and borders ONLY. Labels are drawn in a final overlay pass)
    mapZones.forEach((zone) => {
      const terrainKey = terrainByZone[zone.id] || `${roomMapPackId}:neutralExcavationTerrain`;
      const drewTerrain = drawExcavationMapRegion(
        ctx,
        excavationMapAssets,
        terrainKey,
        { x: zone.x + 3, y: zone.y + 3, w: zone.w - 6, h: zone.h - 6 },
        { alpha: zone.id === 'gate' ? mapTheme.gateTerrainAlpha : mapTheme.terrainAlpha },
      );
      if (!drewTerrain) {
        ctx.fillStyle = zone.color;
        ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      }
      ctx.fillStyle = mapTheme.terrainWash;
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      if (zone.id !== 'gate') {
        drawExcavationMapRegion(ctx, excavationMapAssets, `${roomMapPackId}:roomShadowOverlay`, { x: zone.x + 2, y: zone.y + 2, w: zone.w - 4, h: zone.h - 4 }, { alpha: mapTheme.roomShadowAlpha });
      }
      ctx.strokeStyle = selectedSurveyZone === zone.id || selectedMapZone === zone.id
        ? mapTheme.selectedStroke
        : mapTheme.idleStroke;
      ctx.lineWidth = selectedSurveyZone === zone.id || selectedMapZone === zone.id ? 3 : 1.5;
      ctx.strokeRect(zone.x + 1, zone.y + 1, zone.w - 2, zone.h - 2);

      if ((selectedSurveyZone === zone.id || selectedMapZone === zone.id) && assetsReady) {
        ctx.save();
        ctx.strokeStyle = mapTheme.selectedDashStroke;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 6]);
        ctx.strokeRect(zone.x + 8, zone.y + 8, zone.w - 16, zone.h - 16);
        ctx.restore();
        drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:highlightedSelectedZoneBorder`, {
          x: zone.x + zone.w - 88,
          y: zone.y + 10,
          w: 70,
          h: 42,
        }, { alpha: mapTheme.markerAlpha, fit: 'contain' });
      }
    });

    // 4. Hazards (Simplified to reduce visual noise)
    mapHazards.forEach((hazard) => {
      const hazardAsset = {
        sandstorm: `${mapUiPackId}:sandstormPatch`,
        'falling-rocks': `${mapUiPackId}:fallingRocksPatch`,
        'unstable-floor': `${mapUiPackId}:unstableFloorCrack`,
      }[hazard.id];
      const drewHazard = drawExcavationMapRegion(ctx, excavationMapAssets, hazardAsset, {
        x: hazard.x - 6,
        y: hazard.y - 8,
        w: hazard.w + 12,
        h: hazard.h + 16,
      }, { alpha: mapTheme.hazardAlpha, fit: 'contain' });
      if (hazard.id === 'sandstorm') {
        drawExcavationMapRegion(ctx, excavationMapAssets, `${mapUiPackId}:dustCloudOverlay`, {
          x: hazard.x + 16,
          y: hazard.y + 4,
          w: hazard.w + 34,
          h: hazard.h + 18,
        }, { alpha: 0.32, fit: 'contain' });
      }
      if (!drewHazard) {
        ctx.fillStyle = hazard.color;
        fillRoundRect(hazard.x, hazard.y, hazard.w, hazard.h, 6);
      }
      drawExcavationMapRegion(ctx, excavationMapAssets, `${mapUiPackId}:cautionIcon`, {
        x: hazard.x + hazard.w - 28,
        y: hazard.y + hazard.h - 28,
        w: 24,
        h: 24,
      }, { alpha: 0.78, fit: 'contain' });

    });

    // 5. Walls (Stony texture instead of black bars)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 3;

    mapWalls.forEach((wall) => {
      const wallAsset = wall.w > wall.h * 1.8 ? `${mapUiPackId}:stoneWallSegment` : `${mapUiPackId}:buriedFoundationStones`;
      const drewWall = drawExcavationMapRegion(ctx, excavationMapAssets, wallAsset, { x: wall.x - 4, y: wall.y - 8, w: wall.w + 8, h: wall.h + 16 }, { alpha: mapTheme.wallAlpha });
      if (!drewWall) {
        // Base stone color
        ctx.fillStyle = '#968471';
        ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      }

      // Add stone highlights/texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(wall.x, wall.y, wall.w, 2); // Top highlight
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(wall.x, wall.y + wall.h - 2, wall.w, 2); // Bottom shadow

      // Cracks / Stone blocks
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 20; i < wall.w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(wall.x + i, wall.y);
        ctx.lineTo(wall.x + i, wall.y + wall.h);
        ctx.stroke();
      }

      ctx.strokeStyle = mapTheme.wallStroke;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
    });
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // 6. Exit Gate
    const gateOpen = missionEvidenceCount >= missionRequiredCount;
    const gateArchBounds = { x: 670, y: 226, w: 128, h: 132 };
    const gateSlabBounds = { x: 706, y: 264, w: 62, h: 82 };
    ctx.shadowColor = gateOpen ? 'rgba(247, 196, 83, 0.44)' : 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    if (!gateOpen) {
      drawExcavationMapRegion(ctx, excavationMapAssets, `${gatewayPackId}:closedGateSlab`, gateSlabBounds, { alpha: 0.96, fit: 'cover' });
    } else {
      ctx.fillStyle = 'rgba(255, 223, 140, 0.22)';
      ctx.beginPath();
      ctx.ellipse(gateArchBounds.x + 64, gateArchBounds.y + 72, 26, 45, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const drewGate = drawExcavationMapRegion(ctx, excavationMapAssets, `${gatewayPackId}:exitArch`, gateArchBounds, { alpha: 0.98, fit: 'contain' });
    if (!drewGate) {
      ctx.fillStyle = gateOpen ? 'rgba(247, 196, 83, 0.34)' : 'rgba(74, 54, 32, 0.82)';
      ctx.fillRect(gateArchBounds.x + 30, gateArchBounds.y + 28, 66, 98);
      ctx.strokeStyle = gateOpen ? '#b45309' : '#3a2a18';
      ctx.lineWidth = gateOpen ? 2 : 3;
      ctx.strokeRect(gateArchBounds.x + 28, gateArchBounds.y + 24, 70, 104);
    }
    ctx.shadowColor = 'transparent';

    ctx.lineWidth = 1;

    // 7. Tokens (Floating/glowing)
    tokensRef.current.forEach((token, index) => {
      if (token.collected || !evidenceVisibleForGrid(token, selectedSurveyZone, openedGridSquares, surveyRevealLinks, gridZoneConfigs)) return;

      const floatY = Math.sin((now / 200) + index) * 3;

      ctx.shadowColor = 'rgba(232, 158, 93, 0.8)';
      ctx.shadowBlur = 12;

      ctx.fillStyle = '#e89e5d';
      ctx.beginPath();
      ctx.arc(token.x, token.y + floatY, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 247, 237, 0.78)';
      ctx.beginPath();
      ctx.arc(token.x, token.y + floatY, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 8. Mythic guardians (non-combat pressure)
    guardiansRef.current.forEach((guardian) => {
      const shimmer = (Math.sin(now / 180) + 1) / 2;
      ctx.save();
      ctx.strokeStyle = 'rgba(76, 29, 149, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      guardian.path.forEach((point, pointIndex) => {
        if (pointIndex === 0) ctx.moveTo(point.x + guardian.w / 2, point.y + guardian.h / 2);
        else ctx.lineTo(point.x + guardian.w / 2, point.y + guardian.h / 2);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.globalAlpha = 0.68 + shimmer * 0.24;
      const drewGuardian = drawExcavationMapRegion(ctx, excavationMapAssets, `${mapUiPackId}:guardianShadowMarker`, {
        x: guardian.x - 14,
        y: guardian.y - 18,
        w: guardian.w + 32,
        h: guardian.h + 42,
      }, { alpha: 0.82 + shimmer * 0.16, fit: 'contain' });
      if (!drewGuardian) {
        ctx.fillStyle = '#5b3b8c';
        ctx.beginPath();
        ctx.ellipse(guardian.x + guardian.w / 2, guardian.y + guardian.h / 2, 18, 21, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#efe3ff';
        ctx.beginPath();
        ctx.arc(guardian.x + 10, guardian.y + 11, 2.8, 0, Math.PI * 2);
        ctx.arc(guardian.x + 20, guardian.y + 11, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

    });

    // 9. Player Avatar
    const player = playerRef.current;
    const playerCentreX = player.x + PLAYER_SIZE / 2;
    const playerCentreY = player.y + PLAYER_SIZE / 2;
    if (assetsReady) {
      drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:playerShadow`, { x: playerCentreX - 20, y: playerCentreY + 7, w: 40, h: 18 }, { alpha: 0.34, fit: 'contain' });
      drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:playerGlow`, { x: playerCentreX - 23, y: playerCentreY - 24, w: 46, h: 46 }, { alpha: mapTheme.playerGlowAlpha, fit: 'contain' });
      drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:playerLocationRing`, { x: playerCentreX - 20, y: playerCentreY - 16, w: 40, h: 35 }, { alpha: 0.98, fit: 'contain' });
      drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:heroPortraitMarker`, { x: playerCentreX - 15, y: playerCentreY - 21, w: 30, h: 33 }, { alpha: 0.98, fit: 'contain' });
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(playerCentreX, playerCentreY, PLAYER_SIZE / 2 + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.shadowOffsetY = 0;
    }

    // 10. Late Pass Overlays (state markers float on top of everything)
    mapZones.forEach((zone) => {
      const roomMarker = surveyedZones.has(zone.id)
        ? `${markerPackId}:surveyedMarker`
        : completedZoneChallenges.has(zone.id)
          ? `${markerPackId}:surveyReadyMarker`
          : `${markerPackId}:challengeRequiredMarker`;
      const markerSize = zone.id === 'gate' ? 32 : 27;
      drawExcavationMapRegion(ctx, excavationMapAssets, roomMarker, {
        x: zone.x + zone.w - markerSize - 12,
        y: zone.y + zone.h - markerSize - 10,
        w: markerSize,
        h: markerSize,
      }, { alpha: mapTheme.markerAlpha, fit: 'contain' });

      if (surveyZoneById[zone.id]) {
        const sX = zone.x + 10;
        const sY = zone.y + zone.h - 32;
        const statusIconSize = selectedSurveyZone === zone.id ? 34 : 28;
        const statusIconX = sX;
        const statusIconY = sY - 4;

        ctx.save();
        ctx.globalAlpha = selectedSurveyZone === zone.id ? 0.72 : 0.34;
        ctx.fillStyle = selectedSurveyZone === zone.id
          ? 'rgba(45, 90, 39, 0.34)'
          : completedZoneChallenges.has(zone.id)
            ? 'rgba(250, 204, 21, 0.18)'
            : 'rgba(74, 54, 32, 0.16)';
        ctx.beginPath();
        ctx.arc(
          statusIconX + statusIconSize / 2,
          statusIconY + statusIconSize / 2,
          statusIconSize * 0.56,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.restore();

        if (selectedSurveyZone === zone.id || surveyedZones.has(zone.id)) {
          drawExcavationMapRegion(ctx, excavationMapAssets, selectedSurveyZone === zone.id ? `${mapUiPackId}:mapPin` : `${mapUiPackId}:completedSurveyStamp`, { x: statusIconX, y: statusIconY, w: statusIconSize, h: statusIconSize }, { alpha: 0.9, fit: 'contain' });
        } else if (completedZoneChallenges.has(zone.id)) {
          drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:neutralUnlockIcon`, { x: statusIconX + 2, y: statusIconY + 2, w: statusIconSize - 4, h: statusIconSize - 4 }, { alpha: 0.82, fit: 'contain' });
        } else {
          drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:neutralQuestionIcon`, { x: statusIconX + 2, y: statusIconY + 2, w: statusIconSize - 4, h: statusIconSize - 4 }, { alpha: 0.82, fit: 'contain' });
        }
      }
    });

    // --- DIABLO-STYLE VISUAL OVERLAYS (SHROUD, OUTLINES, AND SPOTLIGHT) ---
    const r = shroudRectRef.current;

    // 1. Draw shroud void (deep blackish-brown tomb darkness) in world coordinates
    ctx.fillStyle = '#050403'; // deep pitch black-brown tomb darkness
    ctx.fillRect(r.x - 3000, r.y - 3000, r.w + 6000, 3000); // top
    ctx.fillRect(r.x - 3000, r.y + r.h, r.w + 6000, 3000); // bottom
    ctx.fillRect(r.x - 3000, r.y, 3000, r.h); // left
    ctx.fillRect(r.x + r.w, r.y, 3000, r.h); // right

    // 2. Draw double glowing outlines (gold for Egypt, jade for China)
    const isChina = targetCivilisation && targetCivilisation.toLowerCase().includes('china');
    const mainColor = isChina ? '#38bd94' : '#d4af37';
    const glowColor = isChina ? 'rgba(56, 189, 148, 0.35)' : 'rgba(212, 175, 55, 0.35)';

    ctx.save();
    // Outer glow border
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 6;
    ctx.shadowBlur = 15;
    ctx.shadowColor = mainColor;
    ctx.strokeRect(r.x, r.y, r.w, r.h);

    // Inner sharp border
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 0; // reset
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.restore();

    // 3. Draw warm radial torchlight vignette centered on the player avatar (clipped to active room)

    ctx.save();
    // Clip the spotlight overlay to the active room boundary
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.clip();

    // Create the warm radial vignette centered on the player
    const vignetteGrad = ctx.createRadialGradient(
      playerCentreX, playerCentreY, 40,
      playerCentreX, playerCentreY, 260
    );
    vignetteGrad.addColorStop(0, 'rgba(253, 224, 185, 0.05)'); // warm tint center
    vignetteGrad.addColorStop(0.3, 'rgba(180, 110, 50, 0.15)'); // warm ambient glow
    vignetteGrad.addColorStop(0.7, 'rgba(5, 4, 3, 0.7)');       // fade to tomb dark
    vignetteGrad.addColorStop(1, '#050403');                     // tomb dark
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(r.x - 10, r.y - 10, r.w + 20, r.h + 20);
    ctx.restore();

    // Camera translation end
    ctx.restore();
  }, [completedZoneChallenges, excavationMapAssets, gatewayPackId, gridZoneConfigs, mapHazards, mapTheme, mapUiPackId, mapWalls, mapZones, markerPackId, missionEvidenceCount, missionRequiredCount, openedGridSquares, roomMapPackId, selectedMapZone, selectedSurveyZone, surveyRevealLinks, surveyedZones, surveyZoneById, terrainByZone, targetCivilisation]);

  const update = useCallback((dt = 1 / 60) => {
    if (briefingOpen || lockedRef.current || inspectionToken || surveyReportZone || gridSetupOpen || activeZoneChallenge || expeditionFailure) {
      draw();
      return;
    }

    Object.keys(hazardCooldownRef.current).forEach((key) => {
      hazardCooldownRef.current[key] = Math.max(0, hazardCooldownRef.current[key] - dt);
    });
    Object.keys(guardianCooldownRef.current).forEach((key) => {
      guardianCooldownRef.current[key] = Math.max(0, guardianCooldownRef.current[key] - dt);
    });

    tickAccumulatorRef.current += dt;
    if (tickAccumulatorRef.current >= 1) {
      tickAccumulatorRef.current = 0;
      syncResources({ time: -1 });
    }

    const keys = keysRef.current;
    const staminaFactor = resourcesRef.current.stamina <= 25 ? 0.72 : 1;
    const speed = 172 * staminaFactor * dt;
    let dx = 0;
    let dy = 0;

    if (keys.ArrowUp || keys.KeyW) dy -= speed;
    if (keys.ArrowDown || keys.KeyS) dy += speed;
    if (keys.ArrowLeft || keys.KeyA) dx -= speed;
    if (keys.ArrowRight || keys.KeyD) dx += speed;

    if (dx && dy) {
      dx *= 0.72;
      dy *= 0.72;
    }

    const current = playerRef.current;
    const next = {
      x: clamp(current.x + dx, 0, MAP_WIDTH - PLAYER_SIZE),
      y: clamp(current.y + dy, 0, MAP_HEIGHT - PLAYER_SIZE),
    };
    const nextRect = getPlayerRect(next);
    const hitWall = mapWalls.some(wall => rectsOverlap(nextRect, wall));
    if (!hitWall) {
      playerRef.current = next;
    }

    const zoneName = getZoneName(playerRef.current, mapZones, defaultZoneName);
    setCurrentZone(previous => previous === zoneName ? previous : zoneName);
    const surveyZone = getSurveyZoneAtPlayer(playerRef.current, surveyZones, mapZones);
    if (surveyZone !== nearbySurveyZoneRef.current) {
      nearbySurveyZoneRef.current = surveyZone;
      setNearbySurveyZone(surveyZone);
      if (surveyZone) setSelectedMapZone(surveyZone.id);
      if (surveyZone && !nearbyTokenRef.current) {
        setNotice(completedZoneChallenges.has(surveyZone.id)
          ? 'Press E to survey this area before digging.'
          : 'Press E to complete this room check before surveying.');
      }
    }

    const playerRect = getPlayerRect(playerRef.current);
    mapHazards.forEach((hazard) => {
      if (rectsOverlap(playerRect, hazard) && !hazardCooldownRef.current[hazard.id]) {
        hazardCooldownRef.current[hazard.id] = 2.5;
        syncResources(hazard.penalty);
        setNotice(hazard.message);
        audioControls.playExpeditionSfx?.('playerHit');
        audioControls.playError?.();
      }
    });

    guardiansRef.current.forEach((guardian) => {
      const target = guardian.path[guardian.targetIndex];
      const dxGuardian = target.x - guardian.x;
      const dyGuardian = target.y - guardian.y;
      const distance = Math.hypot(dxGuardian, dyGuardian);
      const travel = guardian.speed * dt;

      if (distance <= travel) {
        guardian.x = target.x;
        guardian.y = target.y;
        guardian.targetIndex = (guardian.targetIndex + 1) % guardian.path.length;
      } else if (distance > 0) {
        guardian.x += (dxGuardian / distance) * travel;
        guardian.y += (dyGuardian / distance) * travel;
      }

      if (rectsOverlap(playerRect, guardian) && !guardianCooldownRef.current[guardian.id]) {
        guardianCooldownRef.current[guardian.id] = 2.2;
        syncResources(guardian.penalty);
        const playerCentre = playerRef.current.x + PLAYER_SIZE / 2;
        const guardianCentre = guardian.x + guardian.w / 2;
        const pushDirection = playerCentre < guardianCentre ? -1 : 1;
        const pushed = {
          x: clamp(playerRef.current.x + pushDirection * 54, 0, MAP_WIDTH - PLAYER_SIZE),
          y: playerRef.current.y,
        };
        if (!mapWalls.some(wall => rectsOverlap(getPlayerRect(pushed), wall))) {
          playerRef.current = pushed;
        }
        setNotice(guardian.message);
        audioControls.playExpeditionSfx?.('playerHit');
        audioControls.playError?.();
      }
    });

    const nearestToken = tokensRef.current.find((token) => {
      if (token.collected) return;
      if (!evidenceVisibleForGrid(token, selectedSurveyZone, openedGridSquares, surveyRevealLinks, gridZoneConfigs)) return;
      const dxToken = playerRef.current.x + PLAYER_SIZE / 2 - token.x;
      const dyToken = playerRef.current.y + PLAYER_SIZE / 2 - token.y;
      return Math.hypot(dxToken, dyToken) <= 31;
    });
    if (nearestToken?.id === dismissedTokenRef.current) {
      nearbyTokenRef.current = null;
      setNearbyToken(null);
    } else if (nearestToken !== nearbyTokenRef.current) {
      dismissedTokenRef.current = null;
      nearbyTokenRef.current = nearestToken || null;
      setNearbyToken(nearestToken || null);
      if (nearestToken) {
        setNotice('Press E to inspect evidence.');
      }
    } else if (!nearestToken && dismissedTokenRef.current) {
      dismissedTokenRef.current = null;
    }

    const gateRect = { x: 724, y: 258, w: 54, h: 108 };
    if (rectsOverlap(playerRect, gateRect)) {
      if (missionEvidenceCount >= missionRequiredCount) {
        lockedRef.current = true;
        setClaimOpen(true);
        setNotice('Exit Gate reached. Make your final claim.');
        audioControls.playExpeditionSfx?.('gateUnlock');
      } else {
        setNotice(activeMission.gateRequirement);
        if (!hazardCooldownRef.current.exitGateBlocked) {
          hazardCooldownRef.current.exitGateBlocked = 1.6;
          audioControls.playExpeditionSfx?.('gateBlocked');
        }
      }
    }

    // Diablo-style Smooth Camera and Shroud Panning
    const activeZone = getActiveZone(playerRef.current, mapZones);
    if (activeZone) {
      const targetCamX = (activeZone.x + activeZone.w / 2) - 400;
      const targetCamY = (activeZone.y + activeZone.h / 2) - 280;

      // Lerp camera (5 * dt)
      cameraRef.current.x += (targetCamX - cameraRef.current.x) * 5 * dt;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * 5 * dt;

      // Lerp shroud (6 * dt) for morphing transition
      shroudRectRef.current.x += (activeZone.x - shroudRectRef.current.x) * 6 * dt;
      shroudRectRef.current.y += (activeZone.y - shroudRectRef.current.y) * 6 * dt;
      shroudRectRef.current.w += (activeZone.w - shroudRectRef.current.w) * 6 * dt;
      shroudRectRef.current.h += (activeZone.h - shroudRectRef.current.h) * 6 * dt;
    }

    draw();
  }, [activeMission.gateRequirement, activeZoneChallenge, audioControls, briefingOpen, completedZoneChallenges, defaultZoneName, draw, expeditionFailure, gridSetupOpen, gridZoneConfigs, inspectionToken, mapHazards, mapWalls, mapZones, missionEvidenceCount, missionRequiredCount, openedGridSquares, selectedSurveyZone, surveyReportZone, surveyRevealLinks, surveyZones, syncResources]);

  useEffect(() => {
    if (selectedExpedition) return undefined;

    window.advanceTime = () => {};
    window.render_game_to_text = () => JSON.stringify({
      mode: 'Lost Site Expedition',
      stage: 'stage-select',
      selectedExpedition: null,
      previewOpen: Boolean(previewExpedition),
      previewExpeditionId: previewExpedition?.id || null,
      playableStageId: PLAYABLE_EXPEDITION_STAGE_ID,
      availableStages: EXPEDITION_STAGES.map(stage => ({
        id: stage.id,
        title: stage.title,
        status: stage.status,
        route: stage.route,
      })),
    });

    return () => {
      delete window.advanceTime;
      delete window.render_game_to_text;
    };
  }, [previewExpedition, selectedExpedition]);

  useEffect(() => {
    if (!selectedExpedition) return undefined;
    if (expeditionStage === 'excavation') return undefined;

    window.advanceTime = (ms = 16) => {
      window.__advanceExpeditionJourney?.(ms);
    };
    window.render_game_to_text = () => {
      const journeySnapshot = journeySnapshotRef.current || {};
      return JSON.stringify({
        mode: 'Lost Site Expedition',
        expeditionStageId: selectedExpedition.id,
        expeditionStageTitle: selectedExpedition.title,
        stage: baseCampOpen ? 'base-camp' : 'journey',
        activeMission,
        missionTarget: activeMission,
        missionProgress: {
          found: missionEvidenceCount,
          required: missionRequiredCount,
          targetCategoryId: activeMission.targetCategoryId,
          targetEvidenceType: activeMission.targetEvidenceType,
          targetCategoryTitle: activeMission.targetCategoryTitle,
        },
        requiredMissionEvidenceCount: missionRequiredCount,
        exitUnlocked,
        surveyRequired: true,
        surveyComplete,
        targetCivilisation,
        activeCivilisation: journeySnapshot.activeCivilisation || journeySnapshot.targetCivilisation || targetCivilisation,
        selectedSurveyZone: getSurveyZoneName(selectedSurveyZone, surveyZoneById),
        gridRequired: surveyComplete,
        gridOpen: Boolean(gridSetupOpen),
        selectedGridSquare,
        openedGridSquares: [...openedGridSquares],
        gridSquares: gridSquares.map(square => ({
          id: square.id,
          clue: square.clue,
          risk: square.risk,
          possibleEvidenceHint: square.possibleEvidenceHint,
          linkedEvidenceIds: square.linkedEvidenceIds,
          opened: openedGridSquares.has(square.id),
        })),
        nearbySurveyZone: nearbySurveyZone ? nearbySurveyZone.name : null,
        surveyedZones: [...surveyedZones].map(zoneId => getSurveyZoneName(zoneId, surveyZoneById)),
        surveyReportOpen: Boolean(surveyReportZone),
        excavationMethodRequired,
        selectedExcavationMethod,
        excavationMethodOpen,
        pendingExcavationEvidence: excavationMethodOpen && inspectionToken ? {
          id: inspectionToken.id,
          name: inspectionToken.name,
          missionType: inspectionToken.missionType,
          category: inspectionToken.category,
        } : null,
        excavationMethodHistory,
        mappingRequired,
        mappingOpen,
        pendingMappedEvidence,
        mappedFinds: mappedFindsSummary,
        mappedFindsAccurate: mappingAccuracySummary.accurate,
        mappedFindsNeedsReview: mappingAccuracySummary.needsReview,
        visibleEvidence: getVisibleEvidence().map(item => ({ id: item.id, name: item.name, zone: item.zone, missionType: item.missionType })),
        hiddenEvidence: getHiddenEvidence().map(item => ({ id: item.id, name: item.name, zone: item.zone, missionType: item.missionType })),
        resultOpen,
        failureOpen: Boolean(expeditionFailure),
        expeditionFailure,
        finalScore,
        finalRank,
        fieldKitBonus,
        claimCorrect,
        evidenceSupportsClaim,
        missionComplete,
        fieldGuideHintVisible: Boolean(fieldKitEffects.fieldGuideAvailable && inspectionToken && !inspectionFeedback),
        inventoryFullDecisionOpen,
        pendingEvidence: pendingEvidence ? {
          id: pendingEvidence.id,
          name: pendingEvidence.name,
          category: pendingEvidence.category,
          missionType: pendingEvidence.missionType,
          missionLabel: pendingEvidence.missionLabel,
          matchesMission: pendingEvidence.matchesMission,
          evidenceQuality: pendingEvidence.evidenceQuality || null,
          excavationMethod: pendingEvidence.excavationMethod || null,
          excavationMethodName: pendingEvidence.excavationMethodName || null,
          clue: pendingEvidence.clue,
          zone: pendingEvidence.zone,
        } : null,
        satchelContents: satchelContents.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          missionType: item.missionType,
          missionLabel: item.missionLabel,
          matchesMission: item.matchesMission,
          evidenceQuality: item.evidenceQuality || null,
          excavationMethod: item.excavationMethod || null,
          excavationMethodName: item.excavationMethodName || null,
          mappedZone: item.mappedZone || null,
          mappedGridSquare: item.mappedGridSquare || null,
          mappedEvidenceType: item.mappedEvidenceType || null,
          mappingAccurate: item.mappingAccurate ?? null,
          clue: item.clue,
          zone: item.zone,
        })),
        fieldKitImpact,
        collectedEvidence: collectedRef.current.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          missionCategoryId: item.missionType,
          missionType: item.missionType,
          isMissionEvidence: item.isMissionEvidence,
          evidenceQuality: item.evidenceQuality || null,
          excavationMethod: item.excavationMethod || null,
          excavationMethodName: item.excavationMethodName || null,
          mappedZone: item.mappedZone || null,
          mappedGridSquare: item.mappedGridSquare || null,
          mappedEvidenceType: item.mappedEvidenceType || null,
          mappingAccurate: item.mappingAccurate ?? null,
          supports: item.supports,
        })),
        remainingEvidence: tokensRef.current.filter(item => !item.collected).map(item => ({
          id: item.id,
          x: item.x,
          y: item.y,
          category: item.category,
          missionCategoryId: item.missionType,
          missionType: item.missionType,
          clueGroup: item.clueGroup,
        })),
        fieldKit,
        fieldKitEffects,
        baseCampOpen,
        baseCampShop: {
          relicShards: baseCampProgression.relicShards,
          purchasedUpgrades: baseCampProgression.purchasedUpgrades,
          unlockedCosmetics: baseCampProgression.unlockedCosmetics,
          journalUnlocks: baseCampProgression.journalUnlocks,
          shopFeedback,
          activeUpgradeEffects: permanentUpgradeEffects,
          storageKey: BASE_CAMP_PROGRESSION_STORAGE_KEY,
        },
        journeySection: journeySnapshot.journeySection || null,
        currentObjective: journeySnapshot.currentObjective || null,
        objectiveProgress: journeySnapshot.objectiveProgress || null,
        routeGateStatus: journeySnapshot.routeGateStatus || null,
        miniBossState: journeySnapshot.miniBossState || [],
        miniBossStates: journeySnapshot.miniBossStates || journeySnapshot.miniBossState || [],
        activeMiniBoss: journeySnapshot.activeMiniBoss || null,
        activeMiniBossState: journeySnapshot.activeMiniBossState || null,
        relicShardCount: journeySnapshot.relicShardCount || 0,
        bossKeyItems: journeySnapshot.bossKeyItems || [],
        collectedBossKeyItems: journeySnapshot.collectedBossKeyItems || [],
        bossToolPieces: journeySnapshot.bossToolPieces || journeySnapshot.bossKeyItems || [],
        collectedBossToolPieces: journeySnapshot.collectedBossToolPieces || journeySnapshot.collectedBossKeyItems || [],
        collectedUpgrades: journeySnapshot.collectedUpgrades || [],
        activeCheckpoint: journeySnapshot.activeCheckpoint || null,
        checkpointState: journeySnapshot.checkpointState || null,
        defeatedEnemies: journeySnapshot.defeatedEnemies || [],
        defeatedMiniBosses: journeySnapshot.defeatedMiniBosses || [],
        hiddenRoomsFound: journeySnapshot.hiddenRoomsFound || [],
        discoveredHiddenRoutes: journeySnapshot.discoveredHiddenRoutes || [],
        hiddenRoutesAvailable: journeySnapshot.hiddenRoutesAvailable || [],
        secretCollectibles: journeySnapshot.secretCollectibles || [],
        collectedSecretCollectibles: journeySnapshot.collectedSecretCollectibles || [],
        secretCollectibleCount: journeySnapshot.secretCollectibleCount || 0,
        loreTabletCount: journeySnapshot.loreTabletCount || 0,
        cinematicEventState: journeySnapshot.cinematicEventState || null,
        cinematicState: journeySnapshot.cinematicState || journeySnapshot.cinematicEventState || null,
        bossIntroState: journeySnapshot.bossIntroState || null,
        bossDomainState: journeySnapshot.bossDomainState || null,
        postBossReward: journeySnapshot.postBossReward || null,
        postBossRewardVisible: Boolean(journeySnapshot.postBossRewardVisible || journeySnapshot.postBossReward),
        postBossRewardTimer: journeySnapshot.postBossRewardTimer || 0,
        bossIntroPaused: Boolean(journeySnapshot.bossIntroPaused),
        guardianKnowledgeChallenge: journeySnapshot.guardianKnowledgeChallenge || null,
        completedGuardianKnowledgeChallenges: journeySnapshot.completedGuardianKnowledgeChallenges || [],
        guardianKnowledgeResults: journeySnapshot.guardianKnowledgeResults || {},
        guardianBattleModifiers: journeySnapshot.guardianBattleModifiers || {},
        environmentEventState: journeySnapshot.environmentEventState || null,
        sectionTransitionState: journeySnapshot.sectionTransitionState || null,
        activeParticles: journeySnapshot.activeParticles || null,
        activeAtmosphere: journeySnapshot.activeAtmosphere || null,
        playerCombatState: journeySnapshot.playerCombatState || null,
        playerSpriteLoaded: Boolean(journeySnapshot.playerSpriteLoaded),
        playerHeroSpriteLoaded: Boolean(journeySnapshot.playerHeroSpriteLoaded),
        playerLegacySpriteLoaded: Boolean(journeySnapshot.playerLegacySpriteLoaded),
        playerSpriteAtlasPath: journeySnapshot.playerSpriteAtlasPath || null,
        playerSpriteVersion: journeySnapshot.playerSpriteVersion || null,
        playerSpriteVisualMode: journeySnapshot.playerSpriteVisualMode || null,
        playerSpriteFrame: journeySnapshot.playerSpriteFrame || null,
        playerSpriteFallbackSrc: journeySnapshot.playerSpriteFallbackSrc || null,
        playerAnimationState: journeySnapshot.playerAnimationState || null,
        playerAnimationFrame: journeySnapshot.playerAnimationFrame ?? null,
        playerFacing: journeySnapshot.playerFacing || null,
        playerSpriteScale: journeySnapshot.playerSpriteScale ?? null,
        environmentAssetsLoaded: Boolean(journeySnapshot.environmentAssetsLoaded),
        environmentAssetsReady: Boolean(journeySnapshot.environmentAssetsReady),
        environmentAtlasPath: journeySnapshot.environmentAtlasPath || null,
        missingEnvironmentAssets: journeySnapshot.missingEnvironmentAssets || [],
        environmentFallbackActive: Boolean(journeySnapshot.environmentFallbackActive),
        platformArtMode: journeySnapshot.platformArtMode || null,
        hazardArtMode: journeySnapshot.hazardArtMode || null,
        gateArtMode: journeySnapshot.gateArtMode || null,
        desertBackgroundAssetsLoaded: Boolean(journeySnapshot.desertBackgroundAssetsLoaded),
        desertBackgroundAssetsReady: Boolean(journeySnapshot.desertBackgroundAssetsReady),
        desertBackgroundFallbackActive: Boolean(journeySnapshot.desertBackgroundFallbackActive),
        catacombsBackgroundAssetsLoaded: Boolean(journeySnapshot.catacombsBackgroundAssetsLoaded),
        catacombsBackgroundAssetsReady: Boolean(journeySnapshot.catacombsBackgroundAssetsReady),
        catacombsBackgroundFallbackActive: Boolean(journeySnapshot.catacombsBackgroundFallbackActive),
        escapeBackgroundAssetsLoaded: Boolean(journeySnapshot.escapeBackgroundAssetsLoaded),
        escapeBackgroundAssetsReady: Boolean(journeySnapshot.escapeBackgroundAssetsReady),
        escapeBackgroundFallbackActive: Boolean(journeySnapshot.escapeBackgroundFallbackActive),
        digSiteBackgroundAssetsLoaded: Boolean(journeySnapshot.digSiteBackgroundAssetsLoaded),
        digSiteBackgroundAssetsReady: Boolean(journeySnapshot.digSiteBackgroundAssetsReady),
        digSiteBackgroundFallbackActive: Boolean(journeySnapshot.digSiteBackgroundFallbackActive),
        enemySpritesLoaded: Boolean(journeySnapshot.enemySpritesLoaded),
        enemySpriteFallbackActive: Boolean(journeySnapshot.enemySpriteFallbackActive),
        enemySpriteAtlasPath: journeySnapshot.enemySpriteAtlasPath || null,
        chinaEnemyGuardianSpriteAtlasPath: journeySnapshot.chinaEnemyGuardianSpriteAtlasPath || null,
        chinaEnemyGuardianSpritesLoaded: Boolean(journeySnapshot.chinaEnemyGuardianSpritesLoaded),
        chinaEnemyGuardianSpriteFallbackActive: Boolean(journeySnapshot.chinaEnemyGuardianSpriteFallbackActive),
        missingChinaEnemyGuardianSpriteAssets: journeySnapshot.missingChinaEnemyGuardianSpriteAssets || [],
        visibleEnemySpriteFamilies: journeySnapshot.visibleEnemySpriteFamilies || [],
        enemySpriteFrameStates: journeySnapshot.enemySpriteFrameStates || [],
        bossSpritesLoaded: Boolean(journeySnapshot.bossSpritesLoaded),
        bossSpriteFallbackActive: Boolean(journeySnapshot.bossSpriteFallbackActive),
        bossSpriteAtlasPath: journeySnapshot.bossSpriteAtlasPath || null,
        activeBossSprite: journeySnapshot.activeBossSprite || null,
        activeBossSpriteFrame: journeySnapshot.activeBossSpriteFrame || null,
        activeBossAnimationState: journeySnapshot.activeBossAnimationState || null,
        chinaClayGuardianSpriteLoaded: Boolean(journeySnapshot.chinaClayGuardianSpriteLoaded),
        chinaClayGuardianSpriteFrame: journeySnapshot.chinaClayGuardianSpriteFrame || null,
        chinaClayGuardianSpriteAtlasPath: journeySnapshot.chinaClayGuardianSpriteAtlasPath || null,
        stoneGuardianSpriteLoaded: Boolean(journeySnapshot.stoneGuardianSpriteLoaded),
        stoneGuardianSpriteFrame: journeySnapshot.stoneGuardianSpriteFrame || null,
        stoneGuardianSpriteAtlasPath: journeySnapshot.stoneGuardianSpriteAtlasPath || null,
        ancientConstructSpriteLoaded: Boolean(journeySnapshot.ancientConstructSpriteLoaded),
        ancientConstructSpriteFrame: journeySnapshot.ancientConstructSpriteFrame || null,
        ancientConstructSpriteAtlasPath: journeySnapshot.ancientConstructSpriteAtlasPath || null,
        collectibleSpritesLoaded: Boolean(journeySnapshot.collectibleSpritesLoaded),
        collectibleSpriteFallbackActive: Boolean(journeySnapshot.collectibleSpriteFallbackActive),
        collectibleSpriteAtlasPath: journeySnapshot.collectibleSpriteAtlasPath || null,
        visibleToolSprites: journeySnapshot.visibleToolSprites || [],
        visibleShardSprites: journeySnapshot.visibleShardSprites || [],
        visibleUpgradeSprites: journeySnapshot.visibleUpgradeSprites || [],
        visibleObjectiveSprites: journeySnapshot.visibleObjectiveSprites || [],
        visibleCollectibleCount: journeySnapshot.visibleCollectibleCount || 0,
        collectibleScaleTuningVersion: journeySnapshot.collectibleScaleTuningVersion || null,
        relicShardScale: journeySnapshot.relicShardScale ?? null,
        fieldToolScale: journeySnapshot.fieldToolScale ?? null,
        upgradeScale: journeySnapshot.upgradeScale ?? null,
        objectiveMarkerScale: journeySnapshot.objectiveMarkerScale ?? null,
        loreTabletScale: journeySnapshot.loreTabletScale ?? null,
        pickupGlowScale: journeySnapshot.pickupGlowScale ?? null,
        collectibleVisualMode: journeySnapshot.collectibleVisualMode || null,
        playerWeaponSpriteLoaded: Boolean(journeySnapshot.playerWeaponSpriteLoaded),
        playerWeaponSpriteFallbackActive: Boolean(journeySnapshot.playerWeaponSpriteFallbackActive),
        playerWeaponAtlasPath: journeySnapshot.playerWeaponAtlasPath || null,
        playerWeaponFrame: journeySnapshot.playerWeaponFrame || null,
        playerWeaponVisualMode: journeySnapshot.playerWeaponVisualMode || null,
        parallaxLayersActive: Boolean(journeySnapshot.parallaxLayersActive),
        activeBackgroundSection: journeySnapshot.activeBackgroundSection || null,
        backgroundDepthMode: journeySnapshot.backgroundDepthMode || null,
        visibleLabelCount: journeySnapshot.visibleLabelCount || 0,
        labelSuppressionActive: Boolean(journeySnapshot.labelSuppressionActive),
        platformVisualTuningActive: Boolean(journeySnapshot.platformVisualTuningActive),
        journeyPolishPassActive: Boolean(journeySnapshot.journeyPolishPassActive),
        journeyPolishVersion: journeySnapshot.journeyPolishVersion || null,
        hazardReadabilityMode: journeySnapshot.hazardReadabilityMode || null,
        enemyVisualMode: journeySnapshot.enemyVisualMode || null,
        bossVisualMode: journeySnapshot.bossVisualMode || null,
        assetFallbackActive: Boolean(journeySnapshot.assetFallbackActive),
        assetGroundingPassActive: Boolean(journeySnapshot.assetGroundingPassActive),
        assetGroundingVersion: journeySnapshot.assetGroundingVersion || null,
        groundedPropCount: journeySnapshot.groundedPropCount || 0,
        backgroundPropTintActive: Boolean(journeySnapshot.backgroundPropTintActive),
        platformGroundingMode: journeySnapshot.platformGroundingMode || null,
        propDrawOrderMode: journeySnapshot.propDrawOrderMode || null,
        floatingAssetWarnings: journeySnapshot.floatingAssetWarnings || [],
        desertVisualTuningVersion: journeySnapshot.desertVisualTuningVersion || null,
        atlasTuningVersion: journeySnapshot.atlasTuningVersion || null,
        activeAtlasRegionIssues: journeySnapshot.activeAtlasRegionIssues || [],
        playerInvulnerable: journeySnapshot.playerInvulnerable || 0,
        invulnerabilityRemainingMs: journeySnapshot.invulnerabilityRemainingMs || 0,
        damageCooldownRemainingMs: journeySnapshot.damageCooldownRemainingMs || 0,
        playerFlashActive: Boolean(journeySnapshot.playerFlashActive),
        lastDamageSource: journeySnapshot.lastDamageSource || null,
        lastDamageTime: journeySnapshot.lastDamageTime || null,
        cameraX: journeySnapshot.cameraX ?? null,
        targetCameraX: journeySnapshot.targetCameraX ?? null,
        playerWorldX: journeySnapshot.playerWorldX ?? null,
        playerScreenX: journeySnapshot.playerScreenX ?? null,
        currentSection: journeySnapshot.currentSection || journeySnapshot.journeySection || null,
        cameraMode: journeySnapshot.cameraMode || null,
        cameraFocusTarget: journeySnapshot.cameraFocusTarget ?? null,
        cameraShakeActive: Boolean(journeySnapshot.cameraShakeActive),
        activeHazardsNearPlayer: journeySnapshot.activeHazardsNearPlayer || [],
        lastHazardHit: journeySnapshot.lastHazardHit || null,
        lastStaminaDelta: journeySnapshot.lastStaminaDelta || 0,
        lastStaminaLossReason: journeySnapshot.lastStaminaLossReason || '',
        staminaFeedbackActive: Boolean(journeySnapshot.staminaFeedbackActive),
        staminaWarningState: journeySnapshot.staminaWarningState || null,
        hazardFeedbackCooldown: journeySnapshot.hazardFeedbackCooldown || 0,
        playerStamina: journeySnapshot.playerStamina ?? journeySnapshot.resources?.stamina ?? null,
        maxStamina: journeySnapshot.maxStamina ?? permanentUpgradeEffects.maxStamina,
        permanentUpgrades: journeySnapshot.permanentUpgrades || baseCampProgression.purchasedUpgrades,
        permanentUpgradeEffects: journeySnapshot.permanentUpgradeEffects || permanentUpgradeEffects,
        enemyStates: journeySnapshot.enemyStates || [],
        worldProgressPercent: journeySnapshot.worldProgressPercent || 0,
        journey: journeySnapshot,
      });
    };

    return () => {
      delete window.advanceTime;
      delete window.render_game_to_text;
    };
  }, [activeMission, baseCampOpen, baseCampProgression, claimCorrect, evidenceSupportsClaim, excavationMethodHistory, excavationMethodOpen, excavationMethodRequired, expeditionFailure, expeditionStage, exitUnlocked, fieldKit, fieldKitBonus, fieldKitEffects, fieldKitImpact, finalRank, finalScore, getHiddenEvidence, getVisibleEvidence, gridSetupOpen, gridSquares, inspectionFeedback, inspectionToken, inventoryFullDecisionOpen, mappedFindsSummary, mappingAccuracySummary.accurate, mappingAccuracySummary.needsReview, mappingOpen, mappingRequired, missionComplete, missionEvidenceCount, missionRequiredCount, nearbySurveyZone, openedGridSquares, pendingEvidence, pendingMappedEvidence, permanentUpgradeEffects, resultOpen, satchelContents, selectedExcavationMethod, selectedExpedition, selectedGridSquare, selectedSurveyZone, shopFeedback, surveyComplete, surveyedZones, surveyReportZone, surveyZoneById, targetCivilisation]);

  useEffect(() => {
    if (!selectedExpedition) return undefined;
    if (expeditionStage !== 'excavation') return undefined;

    const handleKeyDown = (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
        event.preventDefault();
        if (briefingOpen || lockedRef.current || inspectionToken || surveyReportZone || gridSetupOpen || activeZoneChallenge || expeditionFailure) return;
        keysRef.current[event.code] = true;
      }
      if (event.code === 'KeyE') {
        event.preventDefault();
        if (nearbyTokenRef.current) {
          openInspection();
        } else if (nearbySurveyZoneRef.current) {
          openSurveyReport(nearbySurveyZoneRef.current);
        } else if (selectedSurveyZone) {
          openGridSetup();
        } else {
          openSurveyReport();
        }
      }
    };
    const handleKeyUp = (event) => {
      keysRef.current[event.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let frameId = 0;
    let lastTime = performance.now();
    const loop = (time) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000 || 1 / 60);
      lastTime = time;
      if (!document.hidden) {
        update(dt);
      }
      frameId = requestAnimationFrame(loop);
    };

    draw();
    frameId = requestAnimationFrame(loop);
    window.advanceTime = (ms = 16) => {
      const steps = Math.max(1, Math.round(ms / (1000 / 60)));
      for (let i = 0; i < steps; i += 1) update(1 / 60);
      draw();
    };
    window.render_game_to_text = () => JSON.stringify({
      mode: 'Lost Site Expedition',
      expeditionStageId: selectedExpedition.id,
      expeditionStageTitle: selectedExpedition.title,
      targetCivilisation,
      stage: 'excavation',
      coordinateSystem: 'origin top-left, x right, y down',
      excavationMapAssetsLoaded: Boolean(excavationMapAssets.loaded),
      excavationMapAssetsReady: Boolean(excavationMapAssets.ready),
      excavationMapFallbackActive: !excavationMapAssets.loaded || excavationMapAssets.failed || !excavationMapAssets.ready,
      excavationMapExpanded: true,
      excavationVisualMode: excavationMapAssets.loaded && !excavationMapAssets.failed ? stageContent.visualMode : 'canvas-fallback',
      excavationMapVisualTuningVersion: EXCAVATION_MAP_VISUAL_TUNING_VERSION,
      excavationMapAtlasPath: excavationMapAssets.atlasPath,
      excavationRoomMapPackId: roomMapPackId,
      excavationMarkerPackId: markerPackId,
      excavationGatewayPackId: gatewayPackId,
      excavationMapUiPackId: mapUiPackId,
      excavationChallengeUiPackId: challengeUiPackId,
      missingExcavationMapAssets: getMissingExcavationMapAssets(excavationMapAssets),
      selectedMapZone: selectedMapZoneData?.name || null,
      enteredMapZone: enteredMapZone ? (EXPEDITION_ROOM_ZONE_BY_ID[enteredMapZone]?.name || getSurveyZoneName(enteredMapZone, surveyZoneById)) : null,
      activeZoneChallenge: activeChallengeData ? {
        zoneId: activeChallengeData.zoneId,
        title: activeChallengeData.title,
      } : null,
      completedZoneChallenges: [...completedZoneChallenges].map(zoneId => EXPEDITION_ROOM_ZONE_BY_ID[zoneId]?.name || getSurveyZoneName(zoneId, surveyZoneById)),
      zoneChallengeFeedback,
      canSurveySelectedZone,
      activeSurveyZone: getSurveyZoneName(selectedSurveyZone, surveyZoneById),
      revealedZone: getSurveyZoneName(selectedSurveyZone, surveyZoneById),
      exitGateVisualState: exitUnlocked ? 'unlockedExitGate' : 'sealedExitGate',
      fieldKit,
      fieldKitEffects,
      fieldNotes,
      player: { ...playerRef.current, size: PLAYER_SIZE, zone: getZoneName(playerRef.current, mapZones, defaultZoneName) },
      resources: resourcesRef.current,
      collectedEvidence: collectedRef.current.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        missionCategoryId: item.missionType,
        missionType: item.missionType,
        isMissionEvidence: item.isMissionEvidence,
        evidenceQuality: item.evidenceQuality || null,
        excavationMethod: item.excavationMethod || null,
        excavationMethodName: item.excavationMethodName || null,
        mappedZone: item.mappedZone || null,
        mappedGridSquare: item.mappedGridSquare || null,
        mappedEvidenceType: item.mappedEvidenceType || null,
        mappingAccurate: item.mappingAccurate ?? null,
        clueGroup: item.clueGroup,
        supports: item.supports,
      })),
      remainingEvidence: tokensRef.current.filter(item => !item.collected).map(item => ({
        id: item.id,
        x: item.x,
        y: item.y,
        category: item.category,
        missionCategoryId: item.missionType,
        missionType: item.missionType,
        clueGroup: item.clueGroup,
      })),
      hazards: mapHazards.map(item => ({ id: item.id, name: item.name, x: item.x, y: item.y, w: item.w, h: item.h })),
      guardians: guardiansRef.current.map(item => ({
        id: item.id,
        name: item.name,
        x: Math.round(item.x),
        y: Math.round(item.y),
        w: item.w,
        h: item.h,
      })),
      activeMission,
      missionTarget: activeMission,
      missionProgress: {
        found: missionEvidenceCount,
        required: missionRequiredCount,
        targetCategoryId: activeMission.targetCategoryId,
        targetEvidenceType: activeMission.targetEvidenceType,
        targetCategoryTitle: activeMission.targetCategoryTitle,
      },
      requiredMissionEvidenceCount: missionRequiredCount,
      exitUnlocked,
      surveyRequired: true,
      surveyComplete,
      selectedSurveyZone: getSurveyZoneName(selectedSurveyZone, surveyZoneById),
      gridRequired: surveyComplete,
      gridOpen: Boolean(gridSetupOpen),
      selectedGridSquare,
      openedGridSquares: [...openedGridSquares],
      gridSquares: gridSquares.map(square => ({
        id: square.id,
        clue: square.clue,
        risk: square.risk,
        possibleEvidenceHint: square.possibleEvidenceHint,
        linkedEvidenceIds: square.linkedEvidenceIds,
        opened: openedGridSquares.has(square.id),
      })),
      nearbySurveyZone: nearbySurveyZone ? nearbySurveyZone.name : null,
      surveyedZones: [...surveyedZones].map(zoneId => getSurveyZoneName(zoneId, surveyZoneById)),
      surveyReportOpen: Boolean(surveyReportZone),
      surveyReport: surveyReportZone,
      excavationMethodRequired,
      selectedExcavationMethod,
      excavationMethodOpen,
      pendingExcavationEvidence: excavationMethodOpen && inspectionToken ? {
        id: inspectionToken.id,
        name: inspectionToken.name,
        missionType: inspectionToken.missionType,
        category: inspectionToken.category,
      } : null,
      excavationMethodHistory,
      mappingRequired,
      mappingOpen,
      pendingMappedEvidence,
      mappedFinds: mappedFindsSummary,
      mappedFindsAccurate: mappingAccuracySummary.accurate,
      mappedFindsNeedsReview: mappingAccuracySummary.needsReview,
      visibleEvidence: getVisibleEvidence().map(item => ({
        id: item.id,
        name: item.name,
        x: item.x,
        y: item.y,
        zone: item.zone,
        missionType: item.missionType,
      })),
      hiddenEvidence: getHiddenEvidence().map(item => ({
        id: item.id,
        name: item.name,
        zone: item.zone,
        missionType: item.missionType,
      })),
      inventory: {
        count: collectedRef.current.length,
        limit: MAX_EVIDENCE_ITEMS,
      },
      claimOpen: lockedRef.current,
      resultOpen,
      failureOpen: Boolean(expeditionFailure),
      expeditionFailure,
      finalScore,
      finalRank,
      fieldKitBonus,
      claimCorrect,
      evidenceSupportsClaim,
      missionComplete,
      fieldGuideHintVisible: Boolean(fieldKitEffects.fieldGuideAvailable && inspectionToken && !inspectionFeedback),
      inventoryFullDecisionOpen,
      pendingEvidence: pendingEvidence ? {
        id: pendingEvidence.id,
        name: pendingEvidence.name,
        category: pendingEvidence.category,
        missionType: pendingEvidence.missionType,
        missionLabel: pendingEvidence.missionLabel,
        matchesMission: pendingEvidence.matchesMission,
        evidenceQuality: pendingEvidence.evidenceQuality || null,
        excavationMethod: pendingEvidence.excavationMethod || null,
        excavationMethodName: pendingEvidence.excavationMethodName || null,
        mappedZone: pendingEvidence.mappedZone || null,
        mappedGridSquare: pendingEvidence.mappedGridSquare || null,
        mappedEvidenceType: pendingEvidence.mappedEvidenceType || null,
        mappingAccurate: pendingEvidence.mappingAccurate ?? null,
        clue: pendingEvidence.clue,
        zone: pendingEvidence.zone,
      } : null,
      satchelContents: satchelContents.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        missionType: item.missionType,
        missionLabel: item.missionLabel,
        matchesMission: item.matchesMission,
        evidenceQuality: item.evidenceQuality || null,
        excavationMethod: item.excavationMethod || null,
        excavationMethodName: item.excavationMethodName || null,
        mappedZone: item.mappedZone || null,
        mappedGridSquare: item.mappedGridSquare || null,
        mappedEvidenceType: item.mappedEvidenceType || null,
        mappingAccurate: item.mappingAccurate ?? null,
        clue: item.clue,
        zone: item.zone,
      })),
      fieldKitImpact,
      briefingOpen,
      nearbyEvidence: nearbyTokenRef.current ? {
        id: nearbyTokenRef.current.id,
        name: nearbyTokenRef.current.name,
        clueGroup: nearbyTokenRef.current.clueGroup,
      } : null,
      inspectionOpen: Boolean(inspectionToken),
      inspectionFeedback,
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameId);
      delete window.advanceTime;
      delete window.render_game_to_text;
    };
  }, [activeChallengeData, activeMission, activeZoneChallenge, briefingOpen, canSurveySelectedZone, challengeUiPackId, claimCorrect, completedZoneChallenges, defaultZoneName, draw, enteredMapZone, evidenceSupportsClaim, excavationMapAssets, excavationMethodHistory, excavationMethodOpen, excavationMethodRequired, expeditionFailure, expeditionStage, exitUnlocked, fieldKit, fieldKitBonus, fieldKitEffects, fieldKitImpact, fieldNotes, finalRank, finalScore, gatewayPackId, getHiddenEvidence, getVisibleEvidence, gridSetupOpen, gridSquares, inspectionFeedback, inspectionToken, inventoryFullDecisionOpen, mapHazards, mapUiPackId, mapZones, mappedFindsSummary, mappingAccuracySummary.accurate, mappingAccuracySummary.needsReview, mappingOpen, mappingRequired, markerPackId, missionComplete, missionEvidenceCount, missionRequiredCount, nearbySurveyZone, openGridSetup, openInspection, openSurveyReport, openedGridSquares, pendingEvidence, pendingMappedEvidence, resultOpen, roomMapPackId, satchelContents, selectedExcavationMethod, selectedExpedition, selectedGridSquare, selectedMapZoneData, selectedSurveyZone, stageContent.visualMode, surveyComplete, surveyedZones, surveyReportZone, surveyZoneById, targetCivilisation, update, zoneChallengeFeedback]);

  const resetExpedition = () => {
    const nextMission = chooseEvidenceHuntMission(activeMission.id, stageContent.missions);
    // Reset goes to 'journey' not 'archive-prologue' — prologue is a one-time entry moment per run, not a replay gate.
    setExpeditionStage(stageContent.startsAt === 'excavation' ? 'excavation' : 'journey');
    setBaseCampOpen(false);
    setJourneyPaused(false);
    const savedTools = (baseCampProgressionRef.current?.purchasedUpgrades || []).filter(id =>
      ['brush', 'trowel', 'camera', 'notebook', 'measuring-tape', 'field-guide-page'].includes(id)
    );
    setFieldKit(stageContent.startsAt === 'excavation' ? ['field-guide-page', 'notebook', 'brush', 'trowel', 'camera', 'measuring-tape'] : savedTools);
    setActiveMission(nextMission);
    setJourneyRunId(previous => previous + 1);
    journeySnapshotRef.current = null;
    playerRef.current = { x: 42, y: 498 };
    if (stageContent && stageContent.zones && stageContent.zones.length > 0) {
      const startZone = stageContent.zones.find(zone => zone.id === 'market') || stageContent.zones[0];
      const startCamX = (startZone.x + startZone.w / 2) - 400;
      const startCamY = (startZone.y + startZone.h / 2) - 280;
      cameraRef.current = { x: startCamX, y: startCamY };
      shroudRectRef.current = { x: startZone.x, y: startZone.y, w: startZone.w, h: startZone.h };
    } else {
      cameraRef.current = { x: 0, y: 0 };
      shroudRectRef.current = { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT };
    }
    tokensRef.current = buildExpeditionEvidence(stageContent);
    guardiansRef.current = buildExcavationGuardians(stageContent.guardians);
    collectedRef.current = [];
    resourcesRef.current = INITIAL_RESOURCES;
    hazardCooldownRef.current = {};
    guardianCooldownRef.current = {};
    lockedRef.current = false;
    tickAccumulatorRef.current = 0;
    nearbyTokenRef.current = null;
    nearbySurveyZoneRef.current = null;
    keysRef.current = {};
    setCollectedEvidence([]);
    setFieldNotes([]);
    setResources(INITIAL_RESOURCES);
    setCurrentZone(stageContent.zones.find(zone => zone.id === 'market')?.name || stageContent.zones[0]?.name || 'Expedition Site');
    setNotice(nextMission.instruction);
    setBriefingOpen(true);
    setNearbyToken(null);
    setSelectedSurveyZone(null);
    setSurveyedZones(new Set());
    setNearbySurveyZone(null);
    setSurveyReportZone(null);
    setSelectedMapZone(null);
    setEnteredMapZone(null);
    setCompletedZoneChallenges(new Set());
    setActiveZoneChallenge(null);
    setZoneChallengeFeedback(null);
    setGridSetupOpen(false);
    setSelectedGridSquare(null);
    setOpenedGridSquares(new Set());
    setInspectionToken(null);
    setInspectionStep('review');
    setInspectionFeedback(null);
    setSelectedExcavationMethod(null);
    setExcavationMethodHistory([]);
    setSelectedMappedEvidenceType('');
    setMappingFeedback(null);
    setMappedFinds([]);
    setMissionEvidenceCount(0);
    setClaimOpen(false);
    setSelectedCivilisation('');
    setSelectedEvidenceId('');
    setClaimResult(null);
    setResultOpen(false);
    setExpeditionFailure(null);
    dismissedTokenRef.current = null;
    draw();
  };

  const devJumpToJourney = useCallback(() => {
    keysRef.current = {};
    tickAccumulatorRef.current = 0;
    setExpeditionStage('journey');
    setBaseCampOpen(false);
    setExpeditionFailure(null);
    setJourneyPaused(false);
    setJourneyRunId(previous => previous + 1);
    journeySnapshotRef.current = null;
    setNotice(activeMission.instruction);
    audioControls.playExpeditionMusic?.('desert');
  }, [activeMission.instruction, audioControls]);

  const devJumpToBaseCamp = useCallback(() => {
    const snapshotFieldKit = journeySnapshotRef.current?.fieldKit || [];
    keysRef.current = {};
    tickAccumulatorRef.current = 0;
    setFieldKit(snapshotFieldKit.length ? snapshotFieldKit : fieldKit);
    setExpeditionStage('journey');
    setBaseCampOpen(true);
    setExpeditionFailure(null);
    setNotice('Developer mode: Base Camp opened.');
    audioControls.playExpeditionMusic?.('baseCamp');
  }, [audioControls, fieldKit]);

  const devJumpToExcavation = useCallback(() => {
    keysRef.current = {};
    tickAccumulatorRef.current = 0;
    if (fieldKit.length === 0 && journeySnapshotRef.current?.fieldKit?.length) {
      setFieldKit(journeySnapshotRef.current.fieldKit);
    }
    beginExcavationStage();
    setNotice('Developer mode: Excavation opened.');
  }, [beginExcavationStage, fieldKit.length]);

  useEffect(() => {
    const handleExpeditionDevJump = (event) => {
      if (event.detail?.target === 'journey') devJumpToJourney();
      if (
        (
          event.detail?.target === 'journey-section-start'
          || event.detail?.target === 'journey-boss-start'
          || event.detail?.target === 'journey-scarab-payoff'
          || event.detail?.target === 'journey-desert-map-seal-ready'
          || event.detail?.target === 'journey-route-gate'
          || event.detail?.target === 'journey-forgotten-mural-puzzle'
        )
        && (expeditionStage !== 'journey' || baseCampOpen)
      ) {
        devJumpToJourney();
      }
      if (event.detail?.target === 'base-camp') devJumpToBaseCamp();
      if (event.detail?.target === 'excavation') devJumpToExcavation();
    };

    window.addEventListener('expedition-dev-jump', handleExpeditionDevJump);
    return () => window.removeEventListener('expedition-dev-jump', handleExpeditionDevJump);
  }, [baseCampOpen, devJumpToBaseCamp, devJumpToExcavation, devJumpToJourney, expeditionStage]);

  // Dev-only quick start (paired with the `?play` flag handled in App.jsx):
  // auto-select the playable Egypt stage, then skip the archive prologue +
  // briefing so a cold load lands directly in the journey gameplay. The
  // skip-to-journey step is deferred to a macrotask so it runs *after*
  // openExpeditionStage's state (which opens the prologue/briefing) has
  // committed — otherwise it gets clobbered by the entry render.
  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return undefined;
    if (selectedExpedition) return undefined;
    if (!new URLSearchParams(window.location.search).has('play')) return undefined;
    const stage = EXPEDITION_STAGES.find(s => s.id === PLAYABLE_EXPEDITION_STAGE_ID) || EXPEDITION_STAGES[0];
    if (!stage) return undefined;
    const timer = window.setTimeout(() => {
      openExpeditionStage(stage);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [openExpeditionStage, selectedExpedition]);

  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return undefined;
    if (!selectedExpedition) return undefined;
    if (!new URLSearchParams(window.location.search).has('play')) return undefined;
    const timer = window.setTimeout(() => {
      setPrologueCinematicStep(null);
      setExpeditionStage('journey');
      setBriefingOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedExpedition]);

  useEffect(() => () => {
    if (journeyCursorTimerRef.current) window.clearTimeout(journeyCursorTimerRef.current);
  }, []);

  useEffect(() => {
    const journeyActive = Boolean(selectedExpedition && expeditionStage === 'journey' && !baseCampOpen && !journeyPaused);
    if (!journeyActive || journeyCursorHidden) {
      if (journeyCursorTimerRef.current) {
        window.clearTimeout(journeyCursorTimerRef.current);
        journeyCursorTimerRef.current = null;
      }
      return;
    }

    journeyCursorTimerRef.current = window.setTimeout(() => {
      setJourneyCursorHidden(true);
      journeyCursorTimerRef.current = null;
    }, 1200);

    return () => {
      if (journeyCursorTimerRef.current) {
        window.clearTimeout(journeyCursorTimerRef.current);
        journeyCursorTimerRef.current = null;
      }
    };
  }, [baseCampOpen, expeditionStage, journeyCursorHidden, journeyPaused, selectedExpedition]);

  const handleJourneyMouseMove = useCallback(() => {
    if (journeyPaused) {
      setJourneyCursorHidden(false);
      return;
    }
    setJourneyCursorHidden(false);
    if (journeyCursorTimerRef.current) window.clearTimeout(journeyCursorTimerRef.current);
    journeyCursorTimerRef.current = window.setTimeout(() => {
      setJourneyCursorHidden(true);
      journeyCursorTimerRef.current = null;
    }, 1200);
  }, [journeyPaused]);

  useEffect(() => {
    if (expeditionStage !== 'journey') return undefined;

    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        setJourneyPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expeditionStage]);

  const previewScaffoldAssets = previewExpedition?.scaffold?.runtimeAssets?.length > 0
    ? previewExpedition.scaffold.runtimeAssets
    : previewExpedition?.scaffold?.sourceAssets || [];

    const modeArtworks = [
    `${import.meta.env.BASE_URL}assets/menu/mode_investigation_art.png`,
    `${import.meta.env.BASE_URL}assets/menu/mode_expedition_art.png`,
    `${import.meta.env.BASE_URL}assets/menu/mode_bureau_art.png`,
    `${import.meta.env.BASE_URL}assets/menu/mode_training_art.png`
  ];

  const renderStageSelect = () => (
    <section className="phase-container menu-phase main-menu-phase" aria-label="Expedition Stage Selection">
      <div className="dynamic-menu-backdrop" style={{ backgroundImage: `url(${modeArtworks[focusedStageIndex] || modeArtworks[0]})` }} />

      <div className="mission-selection-heading" style={{ marginBottom: '1rem' }}>
        <div>
          <button type="button" className="back-to-modes-btn" onClick={onBackToMenu} style={{ marginBottom: '1.5rem', width: 'fit-content' }}>
            <ChevronLeft size={16} /> Exit to Menu
          </button>
          <div className="training-kicker">Lost Site Expedition - Route Map</div>
          <h2 className="premium-text-glow" style={{ margin: 0, fontSize: '2rem' }}>Choose an Expedition</h2>
        </div>
      </div>

      <div className="premium-carousel-container" aria-label="Available Target Locations">
        {EXPEDITION_STAGES.map((stage, index) => {
          const isPlayable = stage.route === 'playable' || stage.route === 'map-playable';
          const isFocused = focusedStageIndex === index;
          return (
            <article key={stage.id} data-index={index} className={`activity-card glass-card ${isPlayable ? '' : 'is-locked'} ${isFocused ? 'is-focused' : ''}`} style={{ '--card-bg': `url(${modeArtworks[index] || modeArtworks[0]})` }} onMouseEnter={() => setFocusedStageIndex(index)}>
              <div className="activity-card-header">
                <div className="activity-card-icon">
                  <MapIcon size={24} />
                </div>
                <div className="activity-time-tag" style={{ textTransform: 'uppercase' }}>
                  {stage.dossierTag} | {stage.status}
                </div>
              </div>
              <div className="activity-card-copy">
                <h3>{stage.title}</h3>
                <div className="activity-mode-label">{stage.subtitle}</div>
                <p>{stage.teaser}</p>
              </div>
              <div className="activity-card-button-group">
                <button
                  type="button"
                  className={`premium-action-btn ${isPlayable ? '' : 'secondary-btn'} activity-card-action`}
                  onClick={() => openExpeditionStage(stage)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isPlayable ? <Sparkles size={14} style={{ marginRight: '0.5rem' }} /> : <BookOpen size={14} style={{ marginRight: '0.5rem' }} />}
                  {stage.actionLabel}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {previewExpedition && (
        <div className="modal-overlay expedition-briefing-overlay" style={{ zIndex: 100000 }}>
          <div className="bureau-briefing-modal expedition-stage-preview-modal" style={{ background: '#120f0c', border: '2px solid #8b6a48', borderRadius: '8px' }}>
            <div className="expedition-stage-preview-header">
              <span className={`expedition-stage-status expedition-stage-status--${previewExpedition.statusTone}`} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                {previewExpedition.status}
              </span>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#f7e9cc', margin: '0 0 0.5rem' }}>{previewExpedition.title}</h2>
              <p style={{ color: '#cda869', margin: 0 }}>{previewExpedition.subtitle}</p>
            </div>

            <div className="expedition-stage-preview-note" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(139,106,72,0.1)', padding: '1rem', borderRadius: '6px', margin: '1rem 0' }}>
              <MapIcon size={20} className="card-icon" />
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#ebdcb9', lineHeight: 1.4 }}>{previewExpedition.previewTeaser || previewExpedition.teaser}</p>
            </div>

            {previewScaffoldAssets.length > 0 && (
              <div className="expedition-stage-preview-assets" aria-label={`${previewExpedition.title} asset previews`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
                {previewScaffoldAssets.map(asset => (
                  <figure key={asset.id} className="expedition-stage-preview-asset" style={{ margin: 0, textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(139,106,72,0.15)' }}>
                    <img
                      src={`${import.meta.env.BASE_URL}${asset.src}`}
                      alt={asset.title}
                      loading="lazy"
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: '3px' }}
                    />
                    <figcaption style={{ fontSize: '0.75rem', color: '#a89a7f', marginTop: '0.4rem' }}>{asset.title}</figcaption>
                  </figure>
                ))}
              </div>
            )}

            <p className="expedition-stage-preview-status" style={{ fontSize: '0.78rem', color: '#8b6a48', fontStyle: 'italic', margin: '1rem 0' }}>
              This expedition is a preview only for now. It will not launch unfinished gameplay.
            </p>

            <div className="bureau-briefing-actions" style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(139,106,72,0.15)', paddingTop: '1rem' }}>
              <button type="button" className="btn footer-btn secondary-btn" onClick={() => setPreviewExpedition(null)} style={{ minHeight: '36px', height: '36px', padding: '0 1.5rem' }}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );

  if (!selectedExpedition) {
    return renderStageSelect();
  }

  const submitClaim = () => {
    const chosenEvidence = selectedEvidence;
    if (!selectedCivilisation || !chosenEvidence) {
      setClaimResult({
        correct: false,
        sentence: 'Choose a civilisation and one piece of collected evidence.',
        feedback: 'A strong historical claim needs both parts: what you think, and the evidence that supports it.',
      });
      return;
    }

    const civilisationCorrect = selectedCivilisation === targetCivilisation;
    const evidenceCorrect = chosenEvidence.supports === targetCivilisation;
    const sentence = `I think this site belongs to ${selectedCivilisation} because ${chosenEvidence.name}.`;

    setClaimResult({
      correct: civilisationCorrect && evidenceCorrect,
      sentence,
      feedback: civilisationCorrect && evidenceCorrect
        ? `${chosenEvidence.name} supports ${targetCivilisation}: ${chosenEvidence.rationale}`
        : `${chosenEvidence.name} does not support ${selectedCivilisation}. Its clue points to ${chosenEvidence.supports} because ${chosenEvidence.clue}`,
    });
    setResultOpen(true);
    setClaimOpen(false);

    if (civilisationCorrect && evidenceCorrect) {
      audioControls.playWin?.();
    } else {
      audioControls.playError?.();
    }
  };

  const journeyCursorShouldHide = journeyCursorHidden && !journeyPaused;

  const shouldShowArchivePrologue =
    (selectedStageId === EXPEDITION_STAGE_IDS.EGYPT || selectedStageId === EXPEDITION_STAGE_IDS.ROME)
    && expeditionStage === 'archive-prologue';
  const isRomeArchivePrologue = selectedStageId === EXPEDITION_STAGE_IDS.ROME && expeditionStage === 'archive-prologue';

  const renderArchivePrologue = () => {
    const allInspected = EGYPT_ARCHIVE_PROLOGUE_ITEMS.every(item => inspectedPrologueItems.has(item.id));
    const inspectedCount = inspectedPrologueItems.size;
    const cinematicStep = Number.isInteger(prologueCinematicStep)
      ? EGYPT_ARCHIVE_CINEMATIC_STEPS[prologueCinematicStep]
      : null;
    const cinematicActive = Boolean(cinematicStep);
    const finalCinematicStep = prologueCinematicStep === EGYPT_ARCHIVE_CINEMATIC_STEPS.length - 1;
    const renderArchiveEvidenceVisual = (item, isInspected) => {
      const accent = isInspected ? '#77b66e' : '#c6a059';
      const baseStyle = {
        position: 'relative',
        minHeight: 86,
        marginBottom: '0.8rem',
        border: `1px solid ${isInspected ? 'rgba(119, 182, 110, 0.34)' : 'rgba(198, 160, 89, 0.24)'}`,
        borderRadius: 6,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(56, 39, 22, 0.72), rgba(16, 12, 9, 0.88))',
      };

      if (item.visualSrc) {
        return (
          <div style={baseStyle} aria-hidden="true">
            <img
              src={item.visualSrc}
              alt=""
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                minHeight: 112,
                objectFit: 'cover',
                objectPosition: item.visualType === 'report' ? 'center top' : 'center',
                display: 'block',
                filter: isInspected ? 'saturate(1.02) contrast(1.02)' : 'saturate(0.62) brightness(0.56) contrast(0.92)',
                transform: isInspected ? 'scale(1.01)' : 'scale(1.04)',
                transition: 'filter 240ms ease, transform 240ms ease',
              }}
            />
            {!isInspected && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(11, 8, 6, 0.08), rgba(11, 8, 6, 0.48))',
              }} />
            )}
          </div>
        );
      }

      if (item.visualType === 'painting') {
        return (
          <div style={baseStyle} aria-hidden="true">
            <div style={{
              position: 'absolute',
              left: '14%',
              bottom: '14%',
              width: '46%',
              height: '50%',
              background: 'rgba(218, 179, 102, 0.72)',
              clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
              boxShadow: 'inset 0 -0.85rem 0 rgba(64, 40, 20, 0.32)',
            }} />
            <div style={{
              position: 'absolute',
              left: '48%',
              top: '15%',
              width: '18%',
              height: '23%',
              border: `2px solid ${accent}`,
              borderRadius: '50% 50% 42% 42%',
              background: 'rgba(42, 182, 199, 0.14)',
              boxShadow: '0 0 1rem rgba(42, 182, 199, 0.16)',
            }} />
            <div style={{
              position: 'absolute',
              right: '12%',
              bottom: '13%',
              width: '12%',
              height: '46%',
              borderRadius: '42% 42% 10% 10%',
              background: 'rgba(7, 6, 5, 0.62)',
            }} />
            <div style={{
              position: 'absolute',
              left: '9%',
              top: '10%',
              color: isInspected ? 'rgba(242, 210, 140, 0.7)' : 'rgba(143, 125, 93, 0.55)',
              fontSize: '0.63rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {isInspected ? 'A memory returns' : 'damaged caption'}
            </div>
          </div>
        );
      }

      if (item.visualType === 'notes') {
        return (
          <div style={baseStyle} aria-hidden="true">
            <div style={{
              position: 'absolute',
              inset: '12% 52% 12% 9%',
              border: `2px solid ${accent}`,
              transform: 'rotate(-4deg)',
              opacity: 0.78,
            }} />
            <div style={{
              position: 'absolute',
              left: '17%',
              top: '28%',
              width: '20%',
              height: '4px',
              background: 'rgba(242, 210, 140, 0.56)',
              boxShadow: '0 12px 0 rgba(242, 210, 140, 0.38), 0 24px 0 rgba(242, 210, 140, 0.24)',
            }} />
            <div style={{
              position: 'absolute',
              right: '15%',
              top: '22%',
              width: '21%',
              height: '28%',
              border: `2px solid ${accent}`,
              borderRadius: '50% 50% 42% 42%',
              opacity: 0.7,
            }} />
            <div style={{
              position: 'absolute',
              right: '12%',
              bottom: '20%',
              width: '32%',
              height: '4px',
              background: 'rgba(242, 210, 140, 0.5)',
              boxShadow: '0 11px 0 rgba(242, 210, 140, 0.3)',
            }} />
          </div>
        );
      }

      return (
        <div style={baseStyle} aria-hidden="true">
          <div style={{
            position: 'absolute',
            left: '11%',
            top: '15%',
            width: '34%',
            height: '58%',
            border: `2px solid ${accent}`,
            borderRadius: 3,
            opacity: 0.74,
          }} />
          <div style={{
            position: 'absolute',
            right: '16%',
            top: '22%',
            width: '24%',
            height: '24%',
            border: `2px solid ${accent}`,
            borderRadius: '50%',
            opacity: 0.72,
          }} />
          <div style={{
            position: 'absolute',
            right: '12%',
            bottom: '19%',
            width: '36%',
            height: '4px',
            background: 'rgba(242, 210, 140, 0.5)',
            boxShadow: '0 12px 0 rgba(242, 210, 140, 0.32), 0 24px 0 rgba(242, 210, 140, 0.18)',
          }} />
        </div>
      );
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(83, 60, 32, 0.34) 0%, rgba(26, 20, 16, 0.96) 42%, #100d0b 100%)',
        color: '#f1e6cf',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 'clamp(1rem, 4vw, 2.25rem)',
        fontFamily: 'inherit',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 860, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <header style={{
            borderBottom: '1px solid rgba(198, 160, 89, 0.22)',
            paddingBottom: '1rem',
          }}>
            <div style={{ marginBottom: '0.5rem', fontSize: '0.72rem', letterSpacing: '0.12em', color: '#caa86e', textTransform: 'uppercase', fontWeight: 800 }}>
              Heritage Research - Cairo
            </div>
            <h1 style={{
              margin: 0,
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(1.65rem, 4vw, 2.7rem)',
              lineHeight: 1.05,
              color: '#fff7e7',
              letterSpacing: 0,
            }}>
              The archive points to one scarab.
            </h1>
            <p style={{ fontSize: '0.98rem', color: '#bda983', margin: '0.75rem 0 0', lineHeight: 1.55, maxWidth: 620 }}>
              Asha reviews a forgotten tomb-painting photograph before visiting the pyramid site.
            </p>
            <div style={{
              marginTop: '1rem',
              height: 'clamp(140px, 25vw, 238px)',
              border: '1px solid rgba(198, 160, 89, 0.22)',
              borderRadius: 8,
              overflow: 'hidden',
              background: 'rgba(17, 13, 10, 0.72)',
              boxShadow: '0 18px 45px rgba(0, 0, 0, 0.28)',
            }} aria-hidden="true">
              <img
                src={EGYPT_ARCHIVE_ASSETS.desk}
                alt=""
                loading="eager"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
              />
            </div>
          </header>

          <section style={{
            background: 'rgba(17, 13, 10, 0.72)',
            border: '1px solid rgba(198, 160, 89, 0.22)',
            borderRadius: 8,
            padding: 'clamp(1rem, 3vw, 1.35rem)',
            boxShadow: '0 18px 45px rgba(0, 0, 0, 0.28)',
          }} aria-label="Review the evidence">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#caa86e', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
                  Review the evidence
                </div>
                <p style={{ margin: '0.35rem 0 0', color: '#a99673', lineHeight: 1.45, fontSize: '0.9rem' }}>
                  {allInspected
                    ? 'The records are enough to justify a site check.'
                    : 'Inspect each record before Asha visits the site.'}
                </p>
              </div>
              <div style={{
                border: '1px solid rgba(198, 160, 89, 0.22)',
                borderRadius: 999,
                color: allInspected ? '#bde7ad' : '#caa86e',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}>
                {inspectedCount} / {EGYPT_ARCHIVE_PROLOGUE_ITEMS.length} reviewed
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {EGYPT_ARCHIVE_PROLOGUE_ITEMS.map(item => {
              const isInspected = inspectedPrologueItems.has(item.id);
              return (
                <div
                  key={item.id}
                  style={{
                    background: isInspected ? 'rgba(198, 160, 89, 0.10)' : 'rgba(255, 247, 229, 0.045)',
                    border: `1px solid ${isInspected ? 'rgba(189, 231, 173, 0.42)' : 'rgba(198, 160, 89, 0.20)'}`,
                    borderLeft: `4px solid ${isInspected ? '#77b66e' : '#c6a059'}`,
                    borderRadius: 8,
                    padding: '1rem',
                    minHeight: 190,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      {renderArchiveEvidenceVisual(item, isInspected)}
                      <div style={{ fontSize: '0.68rem', color: '#caa86e', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                        {item.label}
                      </div>
                      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, marginTop: '0.2rem', marginBottom: isInspected ? '0.5rem' : 0, color: '#fff3dd' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#8f7d5d', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem', fontWeight: 800 }}>
                        {item.format}
                      </div>
                      {isInspected && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {item.body.map((line, i) => (
                            <div key={i} style={{ fontSize: '0.875rem', color: '#b8a98a', lineHeight: 1.6 }}>{line}</div>
                          ))}
                        </div>
                      )}
                      {!isInspected && (
                        <div style={{ fontSize: '0.86rem', color: '#857457', lineHeight: 1.5 }}>
                          Sealed in the archive tray until inspected.
                        </div>
                      )}
                    </div>
                    {!isInspected && (
                      <button
                        type="button"
                        onClick={() => setInspectedPrologueItems(prev => new Set([...prev, item.id]))}
                        style={{
                          flexShrink: 0,
                          background: 'rgba(212,175,106,0.15)',
                          border: '1px solid rgba(212,175,106,0.5)',
                          borderRadius: 4,
                          color: '#d4af6a',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Inspect record
                      </button>
                    )}
                    {isInspected && (
                      <div style={{ flexShrink: 0, fontSize: '0.75rem', color: '#6aad6a' }}>✓ Reviewed</div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </section>

          {allInspected && !cinematicActive && (
            <section style={{
              background: 'linear-gradient(135deg, rgba(73, 50, 28, 0.48) 0%, rgba(17, 13, 10, 0.86) 72%)',
              border: '1px solid rgba(198, 160, 89, 0.24)',
              borderLeft: '4px solid #c6a059',
              borderRadius: 8,
              padding: '1.15rem',
              boxShadow: 'inset 0 1px 0 rgba(255, 244, 214, 0.05)',
            }} aria-label="Travel to Pyramid">
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#caa86e', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 800 }}>
                Site check authorised
              </div>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff3dd', margin: '0 0 0.55rem', fontSize: '1.45rem', letterSpacing: 0 }}>
                The records point to the pyramid.
              </h2>
              <p style={{ color: '#d3c09a', margin: '0 0 1rem', lineHeight: 1.5, maxWidth: 620 }}>
                Asha has enough evidence to leave the archive and verify why the old painting finally matches the real site.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1rem',
              }} aria-hidden="true">
                <div style={{
                  position: 'relative',
                  minHeight: 132,
                  border: '1px solid rgba(198, 160, 89, 0.28)',
                  borderRadius: 6,
                  background: 'linear-gradient(180deg, rgba(80, 52, 27, 0.82), rgba(18, 13, 10, 0.92))',
                  overflow: 'hidden',
                }}>
                  <img
                    src={EGYPT_ARCHIVE_ASSETS.painting}
                    alt=""
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: 132,
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                    }}
                  />
                  <div style={{ position: 'absolute', left: '8%', top: '9%', color: 'rgba(242, 210, 140, 0.82)', fontSize: '0.66rem', letterSpacing: '0.08em', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>old painting</div>
                </div>
                <div style={{
                  position: 'relative',
                  minHeight: 132,
                  border: '1px solid rgba(119, 182, 110, 0.34)',
                  borderRadius: 6,
                  background: 'linear-gradient(180deg, rgba(101, 77, 43, 0.66), rgba(18, 13, 10, 0.9))',
                  overflow: 'hidden',
                }}>
                  <img
                    src={EGYPT_ARCHIVE_ASSETS.report}
                    alt=""
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: 132,
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      display: 'block',
                    }}
                  />
                  <div style={{ position: 'absolute', left: '8%', top: '9%', color: 'rgba(189, 231, 173, 0.82)', fontSize: '0.66rem', letterSpacing: '0.08em', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>current site</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrologueCinematicStep(0)}
                style={{
                  background: 'rgba(198, 160, 89, 0.2)',
                  border: '1px solid rgba(198, 160, 89, 0.72)',
                  borderRadius: 5,
                  color: '#f2d28c',
                  padding: '0.66rem 1.2rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                }}
              >
                Travel to Pyramid
              </button>
            </section>
          )}

          {!cinematicActive && !allInspected && (
            <div style={{
              background: allInspected ? 'rgba(198, 160, 89, 0.08)' : 'rgba(255,255,255,0.025)',
              border: `1px solid ${allInspected ? 'rgba(198, 160, 89, 0.38)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 8,
              padding: '1rem 1.1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ flex: '1 1 260px' }}>
                <div style={{ fontSize: '0.72rem', color: allInspected ? '#caa86e' : '#736247', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                  Scarab - Site Comparison
                </div>
                <div style={{ fontSize: '0.9rem', color: allInspected ? '#cdbb95' : '#76664c', marginTop: '0.35rem', lineHeight: 1.45 }}>
                  {allInspected
                    ? 'Old stone. The tomb-painting photograph finally matches the site.'
                    : 'Review all evidence first.'}
                </div>
              </div>
              <button
                type="button"
                disabled={!allInspected}
                style={{
                  flexShrink: 0,
                  background: allInspected ? 'rgba(198, 160, 89, 0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${allInspected ? 'rgba(198, 160, 89, 0.65)' : 'rgba(255,255,255,0.09)'}`,
                  borderRadius: 5,
                  color: allInspected ? '#f2d28c' : '#5a4a30',
                  padding: '0.52rem 0.92rem',
                  fontSize: '0.85rem',
                  cursor: allInspected ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  fontWeight: 800,
                }}
              >
                {allInspected ? 'Examine the scarab' : 'Review all evidence first.'}
              </button>
            </div>
          )}

          {cinematicStep && (
            <section style={{
              textAlign: 'left',
              background: 'linear-gradient(135deg, rgba(12, 10, 8, 0.9) 0%, rgba(43, 29, 17, 0.78) 100%)',
              border: '1px solid rgba(198, 160, 89, 0.30)',
              borderRadius: 8,
              padding: 'clamp(1rem, 3vw, 1.45rem)',
              boxShadow: '0 20px 55px rgba(0, 0, 0, 0.36)',
            }} aria-label={cinematicStep.title}>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#caa86e', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 800 }}>
                {cinematicStep.kicker}
              </div>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff3dd', margin: '0 0 0.95rem', fontSize: '1.45rem', letterSpacing: 0 }}>
                {cinematicStep.title}
              </h2>
              {cinematicStep.visualSrc && (
                <div style={{
                  position: 'relative',
                  height: 'clamp(190px, 35vw, 330px)',
                  marginBottom: '1.15rem',
                  border: `1px solid ${finalCinematicStep ? 'rgba(242, 210, 140, 0.34)' : 'rgba(198, 160, 89, 0.24)'}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'rgba(12, 10, 8, 0.92)',
                  boxShadow: finalCinematicStep
                    ? '0 20px 56px rgba(0, 0, 0, 0.42), 0 0 32px rgba(198, 160, 89, 0.12)'
                    : '0 18px 45px rgba(0, 0, 0, 0.32)',
                }} aria-hidden="true">
                  <img
                    src={cinematicStep.visualSrc}
                    alt=""
                    loading={prologueCinematicStep === 0 ? 'eager' : 'lazy'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: cinematicStep.visualObjectPosition || 'center',
                      display: 'block',
                      filter: finalCinematicStep
                        ? 'saturate(1.05) contrast(1.04)'
                        : 'saturate(1.02) contrast(1.02)',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: finalCinematicStep
                      ? 'linear-gradient(180deg, rgba(10, 7, 5, 0.05), rgba(10, 7, 5, 0.22))'
                      : 'linear-gradient(180deg, rgba(10, 7, 5, 0.02), rgba(10, 7, 5, 0.18))',
                  }} />
                </div>
              )}
              <div style={{ display: 'grid', gap: '0.3rem', marginBottom: '1.4rem' }}>
                {cinematicStep.lines.map((line, i) => (
                  <div key={line} style={{ fontSize: '0.98rem', color: finalCinematicStep && i >= 10 ? '#f2d28c' : '#d3c09a', fontStyle: finalCinematicStep && i >= 10 ? 'italic' : 'normal', lineHeight: 1.55 }}>{line}</div>
                ))}
              </div>
              {cinematicStep.note && (
                <p style={{ margin: '0 0 1rem', color: '#d3c09a', fontSize: '0.92rem', lineHeight: 1.45 }}>
                  {cinematicStep.note}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  if (finalCinematicStep) {
                    setExpeditionStage('journey');
                    setPrologueCinematicStep(null);
                    setNotice('This isn\'t the excavation site.');
                    return;
                  }
                  setPrologueCinematicStep(step => step + 1);
                }}
                style={{
                  background: 'rgba(198, 160, 89, 0.2)',
                  border: '1px solid rgba(198, 160, 89, 0.72)',
                  borderRadius: 5,
                  color: '#f2d28c',
                  padding: '0.66rem 1.2rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              >
                {cinematicStep.actionLabel}
              </button>
            </section>
          )}
        </div>
      </div>
    );
  };

  const renderRomeArchivePrologue = () => {
    const prologueItems = ROME_ARCHIVE_PROLOGUE_ITEMS;
    const cinematicSteps = ROME_ARCHIVE_CINEMATIC_STEPS;
    const allInspected = prologueItems.every(item => inspectedPrologueItems.has(item.id));
    const inspectedCount = inspectedPrologueItems.size;
    const cinematicStep = Number.isInteger(prologueCinematicStep) ? cinematicSteps[prologueCinematicStep] : null;
    const cinematicActive = Boolean(cinematicStep);
    const finalCinematicStep = prologueCinematicStep === cinematicSteps.length - 1;
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(60, 50, 38, 0.36) 0%, rgba(18, 15, 12, 0.97) 42%, #0e0c0a 100%)',
        color: '#ede4d4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 'clamp(1rem, 4vw, 2.25rem)',
        fontFamily: 'inherit',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 860, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <header style={{ borderBottom: '1px solid rgba(180, 155, 100, 0.22)', paddingBottom: '1rem' }}>
            <div style={{ marginBottom: '0.5rem', fontSize: '0.72rem', letterSpacing: '0.12em', color: '#b8986a', textTransform: 'uppercase', fontWeight: 800 }}>
              Heritage Research — Rome
            </div>
            <h1 style={{
              margin: 0,
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(1.65rem, 4vw, 2.7rem)',
              lineHeight: 1.05,
              color: '#f5ede0',
              letterSpacing: 0,
            }}>
              The Senate buried something beneath the Forum.
            </h1>
            <p style={{ fontSize: '0.98rem', color: '#a89070', margin: '0.75rem 0 0', lineHeight: 1.55, maxWidth: 620 }}>
              Asha reviews the available records before descending to the Forum site.
            </p>
          </header>

          <section style={{
            background: 'rgba(14, 11, 8, 0.72)',
            border: '1px solid rgba(180, 155, 100, 0.22)',
            borderRadius: 8,
            padding: 'clamp(1rem, 3vw, 1.35rem)',
            boxShadow: '0 18px 45px rgba(0, 0, 0, 0.30)',
          }} aria-label="Review the records">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#b8986a', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
                  Review the records
                </div>
                <p style={{ margin: '0.35rem 0 0', color: '#9a8060', lineHeight: 1.45, fontSize: '0.9rem' }}>
                  {allInspected
                    ? 'The records justify a descent to the sealed site.'
                    : 'Inspect each record before Asha visits the Forum.'}
                </p>
              </div>
              <div style={{
                border: '1px solid rgba(180, 155, 100, 0.22)',
                borderRadius: 999,
                color: allInspected ? '#a8d898' : '#b8986a',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}>
                {inspectedCount} / {prologueItems.length} reviewed
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {prologueItems.map(item => {
                const isInspected = inspectedPrologueItems.has(item.id);
                return (
                  <div key={item.id} style={{
                    background: isInspected ? 'rgba(180, 155, 100, 0.10)' : 'rgba(255, 248, 235, 0.04)',
                    border: `1px solid ${isInspected ? 'rgba(168, 216, 152, 0.42)' : 'rgba(180, 155, 100, 0.20)'}`,
                    borderLeft: `4px solid ${isInspected ? '#6aaa62' : '#b09060'}`,
                    borderRadius: 8,
                    padding: '1rem',
                    minHeight: 190,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.68rem', color: '#b8986a', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                          {item.label}
                        </div>
                        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, marginTop: '0.2rem', marginBottom: isInspected ? '0.5rem' : 0, color: '#f0e6d0' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#806850', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem', fontWeight: 800 }}>
                          {item.format}
                        </div>
                        {isInspected && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {item.body.map((line, i) => (
                              <div key={i} style={{ fontSize: '0.875rem', color: '#a89878', lineHeight: 1.6 }}>{line}</div>
                            ))}
                          </div>
                        )}
                        {!isInspected && (
                          <div style={{ fontSize: '0.86rem', color: '#786050', lineHeight: 1.5 }}>Tap to inspect this record.</div>
                        )}
                      </div>
                      {!isInspected && (
                        <button
                          type="button"
                          onClick={() => setInspectedPrologueItems(prev => new Set([...prev, item.id]))}
                          style={{
                            flexShrink: 0,
                            background: 'rgba(192, 162, 100, 0.15)',
                            border: '1px solid rgba(192, 162, 100, 0.5)',
                            borderRadius: 4,
                            color: '#c8a872',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          Inspect record
                        </button>
                      )}
                      {isInspected && (
                        <div style={{ flexShrink: 0, fontSize: '0.75rem', color: '#6aaa62' }}>✓ Reviewed</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {allInspected && !cinematicActive && (
            <section style={{
              background: 'linear-gradient(135deg, rgba(55, 42, 28, 0.48) 0%, rgba(14, 11, 8, 0.86) 72%)',
              border: '1px solid rgba(180, 155, 100, 0.24)',
              borderLeft: '4px solid #b09060',
              borderRadius: 8,
              padding: '1.15rem',
              boxShadow: 'inset 0 1px 0 rgba(240, 230, 200, 0.05)',
            }} aria-label="Travel to Forum">
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#b8986a', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 800 }}>
                Descent authorised
              </div>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#f0e6d0', margin: '0 0 0.55rem', fontSize: '1.45rem', letterSpacing: 0 }}>
                The records point to the Forum.
              </h2>
              <p style={{ color: '#c8b890', margin: '0 0 1rem', lineHeight: 1.5, maxWidth: 620 }}>
                Asha has enough evidence to leave the archive and verify the sealed door in person.
              </p>
              <button
                type="button"
                onClick={() => setPrologueCinematicStep(0)}
                style={{
                  background: 'rgba(180, 155, 100, 0.2)',
                  border: '1px solid rgba(180, 155, 100, 0.72)',
                  borderRadius: 5,
                  color: '#e8c87a',
                  padding: '0.66rem 1.2rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                }}
              >
                Travel to Forum
              </button>
            </section>
          )}

          {!cinematicActive && !allInspected && (
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '1rem 1.1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ flex: '1 1 260px' }}>
                <div style={{ fontSize: '0.72rem', color: '#6a5840', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                  Sealed Vault Door
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6a5840', marginTop: '0.35rem', lineHeight: 1.45 }}>
                  Review all evidence first.
                </div>
              </div>
              <button
                type="button"
                disabled
                style={{
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 5,
                  color: '#4a3820',
                  padding: '0.52rem 0.92rem',
                  fontSize: '0.85rem',
                  cursor: 'not-allowed',
                  fontFamily: 'inherit',
                  fontWeight: 800,
                }}
              >
                Review all evidence first.
              </button>
            </div>
          )}

          {cinematicStep && (
            <section style={{
              textAlign: 'left',
              background: 'linear-gradient(135deg, rgba(10, 8, 6, 0.92) 0%, rgba(38, 28, 18, 0.80) 100%)',
              border: '1px solid rgba(180, 155, 100, 0.30)',
              borderRadius: 8,
              padding: 'clamp(1rem, 3vw, 1.45rem)',
              boxShadow: '0 20px 55px rgba(0, 0, 0, 0.36)',
            }} aria-label={cinematicStep.title}>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#b8986a', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 800 }}>
                {cinematicStep.kicker}
              </div>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#f0e6d0', margin: '0 0 0.95rem', fontSize: '1.45rem', letterSpacing: 0 }}>
                {cinematicStep.title}
              </h2>
              <div style={{ display: 'grid', gap: '0.3rem', marginBottom: '1.4rem' }}>
                {cinematicStep.lines.map((line, i) => (
                  <div key={line} style={{ fontSize: '0.98rem', color: finalCinematicStep && i >= 8 ? '#e8c87a' : '#c8b890', fontStyle: finalCinematicStep && i >= 8 ? 'italic' : 'normal', lineHeight: 1.55 }}>{line}</div>
                ))}
              </div>
              {cinematicStep.note && (
                <p style={{ margin: '0 0 1rem', color: '#c8b890', fontSize: '0.92rem', lineHeight: 1.45 }}>
                  {cinematicStep.note}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  if (finalCinematicStep) {
                    setExpeditionStage('journey');
                    setPrologueCinematicStep(null);
                    setNotice('The Senate sealed this. Now it is open.');
                    return;
                  }
                  setPrologueCinematicStep(step => step + 1);
                }}
                style={{
                  background: 'rgba(180, 155, 100, 0.2)',
                  border: '1px solid rgba(180, 155, 100, 0.72)',
                  borderRadius: 5,
                  color: '#e8c87a',
                  padding: '0.66rem 1.2rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              >
                {cinematicStep.actionLabel}
              </button>
            </section>
          )}
        </div>
      </div>
    );
  };

  if (shouldShowArchivePrologue) {
    return isRomeArchivePrologue ? renderRomeArchivePrologue() : renderArchivePrologue();
  }

  if (expeditionStage === 'journey' && !baseCampOpen) {
    return (
      <div
        className={`expedition-journey-mode-shell ${journeyPaused ? 'is-paused' : ''} ${journeyCursorShouldHide ? 'is-cursor-hidden' : ''}`}
        onMouseMove={handleJourneyMouseMove}
        onMouseDown={handleJourneyMouseMove}
      >
        <button
          type="button"
          className="expedition-local-menu-btn"
          onClick={() => setJourneyPaused(open => !open)}
          aria-label={journeyPaused ? 'Resume expedition' : 'Pause expedition'}
          aria-expanded={journeyPaused}
          title={journeyPaused ? 'Resume' : 'Pause'}
        >
          {journeyPaused ? <Play size={18} /> : <Pause size={18} />}
        </button>
        <button
          type="button"
          className="expedition-local-menu-btn expedition-local-sound-btn"
          onClick={() => audioControls.toggleExpeditionSfx?.()}
          aria-label={`Expedition sounds ${audioControls.expeditionSfxEnabled ? 'on' : 'off'}`}
          aria-pressed={Boolean(audioControls.expeditionSfxEnabled)}
          title={`Sounds ${audioControls.expeditionSfxEnabled ? 'On' : 'Off'}`}
        >
          {audioControls.expeditionSfxEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        {journeyPaused && (
          <div className="journey-pause-menu" role="dialog" aria-modal="true" aria-label="Expedition options">
            <div className="journey-pause-card">
              <div className="journey-pause-title">Paused</div>
              <button type="button" className="journey-pause-primary" onClick={() => setJourneyPaused(false)}>
                <Play size={16} /> Resume
              </button>
              <div className="journey-pause-controls" aria-label="Controls">
                <div><Keyboard size={15} /><span><kbd>W/A/S/D</kbd> Move and jump</span></div>
                <div><Keyboard size={15} /><span><kbd>J</kbd> Light attack / <kbd>K</kbd> Heavy attack</span></div>
              </div>
              <button type="button" className="journey-pause-secondary" onClick={onBackToMenu}>
                <Home size={16} /> Back to menu
              </button>
            </div>
          </div>
        )}
        <ExpeditionJourney
          key={`${selectedStageId}-${journeyRunId}`}
          mission={activeMission}
          onBackToMenu={onBackToMenu}
          onComplete={handleJourneyComplete}
          onSnapshotChange={handleJourneySnapshot}
          audioControls={audioControls}
          paused={journeyPaused}
          targetCivilisation={targetCivilisation}
          environmentPackId={stageContent.journeyEnvironmentPackId}
          backgroundPackId={stageContent.journeyBackgroundPackId}
          permanentUpgradeIds={baseCampProgression.purchasedUpgrades}
          permanentUpgradeEffects={permanentUpgradeEffects}
        />
      </div>
    );
  }

  if (baseCampOpen) {
    return (
      <section className="expedition-fullscreen-room expedition-basecamp-room" aria-label="Base Camp">
        <header className="expedition-fullscreen-header">
          <div className="header-left">
            <button type="button" className="fullscreen-back-btn" onClick={onBackToMenu}>
              <ChevronLeft size={16} /> Exit to Menu
            </button>
          </div>
          <div className="header-center">
            <div className="fullscreen-kicker">Lost Site Expedition</div>
            <h1 className="fullscreen-title">Base Camp Outpost</h1>
          </div>
          <div className="header-right">
            <div className="fullscreen-badge status-ready">
              <Sparkles size={14} className="badge-icon pulse" />
              <span>Safe Hub Reached</span>
            </div>
          </div>
        </header>

        <div className="expedition-fullscreen-content">
          <aside className="basecamp-column basecamp-briefing-col">
            <div className="fullscreen-card briefing-card">
              <div className="card-ribbon">Field Journal</div>
              <div className="card-header">
                <Target size={20} className="card-icon" />
                <h2>Field Journal</h2>
              </div>
              <div className="card-body">
                <div className="mission-badge">{activeMission.targetCategoryTitle}</div>
                <h3 className="mission-title">{activeMission.title}</h3>
                <div className="mission-divider"></div>
                <div className="mission-inquiry">
                  <span className="label">Working Theory</span>
                  <p className="value">{activeMission.inquiryQuestion}</p>
                </div>
                <div className="mission-instruction-box">
                  <span className="label">Expedition Plan</span>
                  <p className="value">{activeMission.instruction}</p>
                </div>
              </div>
              <div className="card-footer-note">
                Review the route, prepare the kit, and enter the excavation with care.
              </div>
            </div>
          </aside>

          <main className="basecamp-column basecamp-shop-col">
            <div className="fullscreen-card shop-card">
              <div className="card-header flex-header">
                <div className="title-area">
                  <Gem size={20} className="card-icon gold-glow" />
                  <h2>Tool Bench</h2>
                </div>
                <div className={`fullscreen-shard-bank ${shopFeedback?.type === 'purchase' || shopFeedback?.type === 'deposit' ? 'is-rewarding' : ''}`}>
                  <Gem size={16} className="shard-icon" />
                  <span className="shard-label">Relic Table</span>
                  <strong className="shard-count">{baseCampProgression.relicShards}</strong>
                </div>
              </div>

              {shopFeedback && (
                <div className={`fullscreen-shop-feedback ${shopFeedback.type}`}>
                  <strong>{shopFeedback.title}</strong>
                  <span>{shopFeedback.message}</span>
                </div>
              )}

              <div className="fullscreen-shop-grid-container">
                {shopItemsBySection.map(group => (
                  <div key={group.section} className="fullscreen-shop-category">
                    <h3 className="category-title">{group.section}</h3>
                    <div className="fullscreen-shop-items-grid">
                      {group.items.map((item) => {
                        const owned = baseCampOwnedItemIds.has(item.id);
                        const affordable = baseCampProgression.relicShards >= item.cost;
                        const highlighted = shopFeedback?.itemId === item.id && shopFeedback.type === 'purchase';
                        return (
                          <article key={item.id} className={`fullscreen-shop-item-card ${owned ? 'is-owned' : ''} ${highlighted ? 'just-purchased' : ''} ${item.locked ? 'is-locked' : ''}`}>
                            <div className="item-meta">
                              <span className="item-name">{item.name}</span>
                              <span className="item-effect">{item.shortEffect}</span>
                            </div>
                            <p className="item-description">{item.description}</p>
                            {item.routeUse && (
                              <div className="item-route-use">
                                <Compass size={12} className="route-icon" />
                                <span>{item.routeUse}</span>
                              </div>
                            )}
                            <div className="item-actions">
                              <div className="item-cost-pill">
                                <Gem size={12} />
                                <strong>{item.cost}</strong>
                              </div>
                              <button type="button" className="fullscreen-shop-btn" onClick={() => purchaseShopItem(item.id)} disabled={owned || item.locked || !affordable}>
                                {owned ? 'Owned' : item.locked ? 'Locked' : affordable ? 'Buy' : 'Need Shards'}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          <aside className="basecamp-column basecamp-kit-col">
            <div className="fullscreen-card kit-card">
              <div className="card-header">
                <Backpack size={20} className="card-icon" />
                <h2>Field Kit Report</h2>
              </div>
              <div className="fullscreen-kit-list">
                {fieldKitImpact.map((tool) => (
                  <div key={tool.id} className={`fullscreen-kit-item ${tool.isCollected ? 'is-collected' : ''}`}>
                    <div className="tool-main-row">
                      <div className="tool-icon-box"><tool.icon size={20} /></div>
                      <div className="tool-meta">
                        <span className="tool-title">{tool.shortTitle}</span>
                        <span className="tool-status">{tool.isCollected ? 'Secured' : 'Missing'}</span>
                      </div>
                      <div className="tool-status-indicator">
                        <div className={`indicator-dot ${tool.isCollected ? 'secured' : 'missing animate-pulse'}`}></div>
                      </div>
                    </div>
                    <div className="tool-impact-detail">
                      <p className="impact-text"><strong>Impact:</strong> {tool.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="active-gear-box">
                <span className="gear-box-label">Fitted Permanent Upgrades</span>
                <div className="gear-pills">
                  {activeBaseCampKitSummary.length > 0 ? (
                    activeBaseCampKitSummary.map(summary => <span key={summary} className="gear-pill">{summary}</span>)
                  ) : (
                    <span className="gear-pill em">No permanent gear active</span>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="expedition-fullscreen-footer">
          <button type="button" className="footer-btn secondary-btn" onClick={resetExpedition}>
            <RotateCcw size={16} /> Restart Journey
          </button>
          <button type="button" className="footer-btn primary-btn pulse-glow" onClick={beginExcavationStage}>
            Begin Excavation <ChevronRight size={18} />
          </button>
        </footer>
      </section>
    );
  }

  return (
    <section className="phase-container bureau-phase expedition-phase">
      <div className={`expedition-shell ${briefingOpen ? 'briefing-paused' : ''}`}>
        <header className="expedition-topbar">
          <button type="button" className="bureau-hint-btn" onClick={onBackToMenu}>
            <ChevronLeft size={18} /> Back to Menu
          </button>
          <div className="expedition-title">
            <div className="training-kicker">10-15 mins | Standalone Adventure</div>
            <h2>{stageContent.mapTitle}</h2>
          </div>
          <div className={`expedition-gate-badge ${exitUnlocked ? 'unlocked' : ''}`}>
            <Sparkles size={16} />
            <span>{exitUnlocked ? 'Exit Gate Unlocked' : 'Exit Gate Locked'}</span>
            <small>{exitUnlocked ? `${activeMission.targetCategoryTitle} secured ${missionEvidenceCount}/${missionRequiredCount}` : `${activeMission.targetCategoryTitle} found ${missionEvidenceCount}/${missionRequiredCount}`}</small>
          </div>
        </header>

        <div className="expedition-layout">
          <div className="expedition-map-card">
            <div className="expedition-map-status">
              <span><MapIcon size={16} /> {currentZone}</span>
              <span>{notice}</span>
            </div>
            <canvas
              ref={canvasRef}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              aria-label="Top-down expedition map"
              className="expedition-canvas"
              onClick={selectMapZoneAtPoint}
            />
            {selectedMapZoneData && !inspectionToken && !surveyReportZone && !gridSetupOpen && !activeZoneChallenge && (
              <div className="expedition-zone-preview">
                <div>
                  <span className="expedition-zone-preview-kicker">Selected room</span>
                  <strong>{selectedMapZoneData.name}</strong>
                  <p>{selectedRoomData?.description || selectedMapZoneData.name}</p>
                </div>
                <dl>
                  <div>
                    <dt>Entry check</dt>
                    <dd>{completedZoneChallenges.has(selectedMapZone) ? 'Complete' : 'Required'}</dd>
                  </div>
                  <div>
                    <dt>Survey</dt>
                    <dd>{surveyedZones.has(selectedMapZone) ? 'Surveyed' : canSurveySelectedZone ? 'Ready' : 'Locked'}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="btn primary-btn"
                  onClick={() => {
                    if (canSurveySelectedZone) openSurveyReport(surveyZoneById[selectedMapZone]);
                    else enterSelectedMapZone(selectedMapZone);
                  }}
                >
                  {canSurveySelectedZone ? 'Survey Area' : completedZoneChallenges.has(selectedMapZone) ? 'Enter Zone' : 'Start Room Check'}
                </button>
              </div>
            )}
            {nearbySurveyZone && !nearbyToken && !inspectionToken && !surveyReportZone && (
              <div className="expedition-inspect-prompt expedition-survey-prompt">
                <div>
                  <strong>{nearbySurveyZone.name}</strong>
                  <span>{nearbySurveyZone.prompt}</span>
                </div>
                <button type="button" className="btn primary-btn" onClick={() => openSurveyReport(nearbySurveyZone)}>
                  {completedZoneChallenges.has(nearbySurveyZone.id) ? 'Survey Area' : 'Room Check'}
                </button>
                <kbd>E</kbd>
              </div>
            )}
            {selectedSurveyZone && !gridComplete && !nearbyToken && !inspectionToken && !surveyReportZone && !gridSetupOpen && (
              <div className="expedition-inspect-prompt expedition-grid-prompt">
                <div>
                  <strong>{surveyZoneById[selectedSurveyZone]?.name} grid ready</strong>
                  <span>Open a grid square before evidence can be inspected.</span>
                </div>
                <button type="button" className="btn primary-btn" onClick={openGridSetup}>
                  Grid Setup
                </button>
                <kbd>E</kbd>
              </div>
            )}
            {nearbyToken && !inspectionToken && (
              <div className="expedition-inspect-prompt">
                <div>
                  <strong>{nearbyToken.name}</strong>
                  <span>Press E to inspect evidence</span>
                </div>
                <button type="button" className="btn primary-btn" onClick={() => openInspection(nearbyToken)}>
                  Inspect Evidence
                </button>
                <kbd>E</kbd>
              </div>
            )}
          </div>

          <aside className="expedition-side-panel">
            <section className="expedition-panel expedition-mission-panel">
              <h3><Sparkles size={17} /> Expedition Goal</h3>
              <div className="expedition-mission-card">
                <strong>{activeMission.title}</strong>
                <span>{activeMission.targetCategoryTitle}</span>
                <p><strong>Working theory:</strong> {activeMission.inquiryQuestion}</p>
                <p>{activeMission.instruction}</p>
                <div className="expedition-mission-progress">
                  {activeMission.evidenceLabel}: <span>{missionEvidenceCount}/{missionRequiredCount}</span>
                </div>
              </div>
            </section>

            <section className="expedition-panel">
              <h3><MapIcon size={17} /> Survey the Site</h3>
              <div className="expedition-mission-card">
                <strong>{surveyComplete ? `${surveyZoneById[selectedSurveyZone]?.name} marked` : 'Survey required'}</strong>
                <span>Survey, choose a dig zone, then set up a grid</span>
                <p>
                  {surveyComplete
                    ? 'Your dig zone is marked. Evidence will stay hidden until you open grid squares in this area.'
                    : 'Evidence is hidden until you survey an area and mark a dig zone.'}
                </p>
                <div className="expedition-mission-progress">
                  Surveyed zones: <span>{surveyedZones.size}/{surveyZones.length}</span>
                </div>
              </div>
            </section>

            <section className="expedition-panel">
              <h3><MapIcon size={17} /> Mark the Grid</h3>
              <div className="expedition-mission-card">
                <strong>{selectedSurveyZone ? `${surveyZoneById[selectedSurveyZone]?.name} grid` : 'Grid not ready yet'}</strong>
                <span>Mark squares to record where evidence was found</span>
                <p>
                  {selectedSurveyZone
                    ? (gridComplete
                      ? `Opened squares: ${[...openedGridSquares].join(', ')}. Open more squares if you need more evidence.`
                      : 'Choose a grid square before any evidence becomes visible in this dig zone.')
                    : 'Grid setup becomes available after you mark a dig zone.'}
                </p>
                <div className="expedition-mission-progress">
                  Grid squares opened: <span>{openedGridSquares.size}/{gridSquares.length || 4}</span>
                </div>
                {selectedSurveyZone && (
                  <button type="button" className="btn" onClick={openGridSetup}>
                    {gridComplete ? 'Review Grid Setup' : 'Open Grid Setup'}
                  </button>
                )}
              </div>
            </section>

            <section className="expedition-panel">
              <h3><Gauge size={17} /> Field Resources</h3>
              <div className="resource-list">
                <div><strong>{resources.investigation}</strong><span>Survey focus</span></div>
                <div><strong>{resources.stamina}</strong><span>Stamina</span></div>
                <div><strong>{Math.floor(resources.time / 60)}:{String(resources.time % 60).padStart(2, '0')}</strong><span>Time</span></div>
              </div>
            </section>

            <section className="expedition-panel">
              <h3><Backpack size={17} /> Field Kit</h3>
              <ul className="expedition-tool-list expedition-tool-impact-list compact">
                {fieldKitImpact.map((tool) => (
                  <li key={tool.id} className={tool.isCollected ? 'is-collected' : ''}>
                    <span>{tool.name}</span>
                    <strong>{tool.isCollected ? tool.impact : 'Missing'}</strong>
                    <p>{tool.isCollected ? tool.collectedDesc : tool.missingDesc}</p>
                  </li>
                ))}
              </ul>
            </section>

            {fieldKitEffects.notebookReady && (
              <section className="expedition-panel">
                <h3><MapIcon size={17} /> Field Notes</h3>
                <div className="expedition-evidence-list">
                  {fieldNotes.length === 0 && <p className="expedition-empty">Reject non-mission evidence to record a note here.</p>}
                  {fieldNotes.map(note => (
                    <article key={note.id} className="expedition-evidence-item expedition-note-item">
                      <strong>{note.name}</strong>
                      <span>{note.category}</span>
                      <p>{note.note}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="expedition-panel">
              <h3><Backpack size={17} /> Evidence Inventory <span className="expedition-inventory-count">{collectedEvidence.length}/{MAX_EVIDENCE_ITEMS}</span></h3>
              <div className="expedition-evidence-list">
                {collectedEvidence.length === 0 && <p className="expedition-empty">No evidence collected yet.</p>}
                {collectedEvidence.map(item => (
                  <article key={item.id} className="expedition-evidence-item">
                    <strong>{item.name}</strong>
                    <span>{item.category} | {item.zone}</span>
                    {item.evidenceQuality && <span>Quality: {item.evidenceQuality}</span>}
                    <span className="expedition-evidence-clue-group">{item.clueGroup}</span>
                    <p>{item.clue}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="expedition-panel">
              <h3><ShieldAlert size={17} /> Site Hazards</h3>
              <ul className="expedition-hazard-list">
                <li>sandstorm: lowers time</li>
                <li>falling rocks: lowers investigation points</li>
                <li>unstable floor: lowers Endurance</li>
                <li>scorpion path: obstacle only</li>
                <li>Tomb Guardian Shadow: avoid its patrol</li>
              </ul>
            </section>

            <section className="expedition-panel">
              <h3><Clock size={17} /> Controls</h3>
              <p className="expedition-control-copy">Move with WASD or the arrow keys. Stand in a zone and press E to survey. After marking a dig zone, press E to open the grid setup, then inspect evidence revealed by opened squares.</p>
            </section>
          </aside>
        </div>
      </div>

      {briefingOpen && (
        <section className="expedition-fullscreen-room expedition-briefing-room" aria-label="Expedition Briefing">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={onBackToMenu}>
                <ChevronLeft size={16} /> Exit to Menu
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Expedition Dossier</div>
              <h1 className="fullscreen-title">Operation Briefing</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <ShieldAlert size={14} className="badge-icon" />
                <span>CLASSIFIED</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.5rem', padding: '1.5rem 2rem' }}>
            {/* Left Column: Stamps and Rules */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #8b6a48' }}>
                <div className="card-ribbon" style={{ background: '#ef4444', color: '#fff' }}>TOP SECRET</div>
                <div className="card-header">
                  <BookOpen size={20} className="card-icon" />
                  <h2>Expedition Mandate</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a89a7f', lineHeight: 1.5 }}>
                    You are deploying to a restricted historical quadrant. Survey the site first, choose a dig zone, collect evidence, and formulate a solid claim to prove which civilisation occupied this site.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#c5a059', letterSpacing: '0.06rem' }}>Field Directives</span>
                    <ul style={{ paddingLeft: '1.1rem', margin: 0, display: 'grid', gap: '0.5rem', fontSize: '0.78rem', color: '#a89a7f', lineHeight: 1.45 }}>
                      <li><strong>Search</strong>: {activeMission.briefingRule}</li>
                      <li><strong>Survey First</strong>: Evidence is hidden until you survey and mark a dig zone.</li>
                      <li><strong>Grid Mapping</strong>: Open grid squares to record coordinates before collecting items.</li>
                      <li><strong>Satchel Capacity</strong>: Max 3 items. Replace weaker items carefully.</li>
                      <li><strong>Hazard Control</strong>: Manage time and Endurance; avoid traps and monsters.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </aside>

            {/* Center Column: Expedition Dossier */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #c5a059' }}>
                <div className="card-header">
                  <Target size={20} className="card-icon gold-glow" />
                  <h2>Active Bureau Dossier</h2>
                </div>

                <div className="card-body" style={{ overflowY: 'auto', gap: '1.5rem', padding: '1.5rem' }}>
                  <div className="mission-badge" style={{ alignSelf: 'flex-start' }}>{activeMission.targetCategoryTitle}</div>
                  <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', color: '#fff', margin: 0 }}>{activeMission.title}</h3>

                  <div className="mission-divider"></div>

                  <div className="mission-inquiry">
                    <span className="label" style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#8b6a48' }}>Working Theory</span>
                    <p className="value" style={{ margin: 0, fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.15rem', color: '#ebdcb9', lineHeight: 1.5 }}>
                      {activeMission.inquiryQuestion}
                    </p>
                  </div>

                  <div className="mission-instruction-box" style={{ background: 'rgba(26, 22, 17, 0.4)', padding: '1rem', border: '1px solid rgba(139, 106, 72, 0.15)', borderRadius: '6px' }}>
                    <span className="label" style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#8b6a48', display: 'block', marginBottom: '0.35rem' }}>Instructions</span>
                    <p className="value" style={{ margin: 0, fontFamily: 'Courier New, monospace', fontSize: '0.82rem', color: '#a89a7f', fontStyle: 'italic', lineHeight: 1.45 }}>
                      {activeMission.instruction}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: 'rgba(12, 10, 8, 0.3)', padding: '0.85rem', borderRadius: '6px', border: '1px solid rgba(139,106,72,0.1)' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#8b6a48', textTransform: 'uppercase', fontWeight: 800 }}>Required Target</span>
                      <strong style={{ display: 'block', fontSize: '1.25rem', color: '#ebdcb9', fontFamily: 'Cinzel, serif', marginTop: '0.2rem' }}>{missionRequiredCount} Finds</strong>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#8b6a48', textTransform: 'uppercase', fontWeight: 800 }}>Evidence Type</span>
                      <strong style={{ display: 'block', fontSize: '0.88rem', color: '#ebdcb9', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.3rem' }}>{activeMission.evidenceLabel || 'Structural'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Right Column: Asha Dossier / Teaser */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Backpack size={20} className="card-icon" />
                  <h2>Explorer Profile</h2>
                </div>

                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', border: '2px solid #c5a059', background: 'rgba(26,22,17,0.8)', display: 'grid', placeItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                    <span style={{ fontSize: '3rem' }}>ðŸ•µï¸â€â™€ï¸</span>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.25rem', color: '#fff', margin: '0 0 0.25rem' }}>Asha</h3>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#c5a059', letterSpacing: '0.08em' }}>Warrior Explorer</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#a89a7f', lineHeight: 1.45 }}>
                    Equipped for {stageContent.targetCivilisation === 'Ancient Egypt' ? 'harsh Egyptian sands' : 'ancient environments'}. Fits all collected tools and coordinates the expedition with absolute precision.
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            <button type="button" className="footer-btn secondary-btn" onClick={onBackToMenu}>
              <ChevronLeft size={16} /> Exit to Menu
            </button>
            <button type="button" className="footer-btn primary-btn pulse-glow" onClick={beginExpedition}>
              Begin Expedition <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </footer>
        </section>
      )}

      {expeditionFailure && (
        <section className="expedition-fullscreen-room expedition-failure-room" aria-label="Rescue Station">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={onBackToMenu}>
                <ChevronLeft size={16} /> Exit to Menu
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Field Rescue Station</div>
              <h1 className="fullscreen-title">Emergency Rescue</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: '#ef4444', color: '#f87171' }}>
                <AlertTriangle size={14} className="badge-icon pulse" />
                <span>EXPEDITION FAILED</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.5rem', padding: '1.5rem 2rem' }}>
            {/* Left Column: Operation Status Stamp */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #ef4444' }}>
                <div className="card-ribbon" style={{ background: '#ef4444', color: '#fff' }}>INCOMPLETE</div>
                <div className="card-header">
                  <ShieldAlert size={20} className="card-icon" style={{ color: '#ef4444' }} />
                  <h2>Mission Interrupted</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', margin: '1rem 0' }}>⚠️</div>
                  <strong style={{ color: '#f87171', fontSize: '1.1rem', fontFamily: 'Cinzel, serif' }}>Field Rescue Triggered</strong>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#a89a7f', lineHeight: 1.5 }}>
                    Your expedition was halted due to excessive hazards. The Bureau dispatch team has retrieved you safely from the sector.
                  </p>
                </div>
              </div>
            </aside>

            {/* Center Column: Warning Details and Tips */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #ef4444' }}>
                <div className="card-header">
                  <AlertTriangle size={20} className="card-icon" style={{ color: '#f59e0b' }} />
                  <h2>Rescue Details</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.5rem', padding: '1.5rem' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#f87171', display: 'block', marginBottom: '0.5rem' }}>Reason for Failure</span>
                    <p style={{ margin: 0, fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.1rem', color: '#ebdcb9', lineHeight: 1.5 }}>
                      {expeditionFailure.message}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#c5a059', display: 'block', marginBottom: '0.5rem' }}>Survival Guidance</span>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#a89a7f', lineHeight: 1.5 }}>
                      Hazards, traps, and monsters can end the expedition if your investigation points, stamina, or time run out. Plan a safer route through the site, equip protective gear from the camp shop, and take your time when surveying and mapping grid cells.
                    </p>
                  </div>
                </div>
              </div>
            </main>

            {/* Right Column: Explorer Dossier & Fit-kit guidance */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Backpack size={20} className="card-icon" />
                  <h2>Field Fit-Kit Guide</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1rem', padding: '1rem', fontSize: '0.82rem' }}>
                  <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.45 }}>
                    Ensure you purchase proper tools from the Base Camp next time:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <strong style={{ color: '#ebdcb9' }}>🛠️ Brush & Trowel</strong>
                    <p style={{ margin: 0, color: '#a89a7f', paddingLeft: '1rem' }}>Improves excavation safety and guarantees higher-quality evidence.</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <strong style={{ color: '#ebdcb9' }}>📖 Explorer Field Guide</strong>
                    <p style={{ margin: 0, color: '#a89a7f', paddingLeft: '1rem' }}>Provides valuable classification hints when identifying artefacts.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            <button type="button" className="footer-btn secondary-btn" onClick={onBackToMenu}>
              <ChevronLeft size={16} /> Exit to Menu
            </button>
            <button type="button" className="footer-btn primary-btn pulse-glow" onClick={resetExpedition}>
              Restart Expedition <RotateCcw size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </footer>
        </section>
      )}

      {surveyReportZone && (
        <section className="expedition-fullscreen-room expedition-survey-room" aria-label="Survey Report">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={keepSurveying}>
                <ChevronLeft size={16} /> Return to Map
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Route Map</div>
              <h1 className="fullscreen-title">{surveyReportZone.name}</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <Compass size={14} className="badge-icon" />
                <span>Sector Surveyed</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.5rem', padding: '1.5rem 2rem' }}>
            {/* Left Column: Sector Mapping Notes */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #ebdcb9' }}>
                <div className="card-ribbon" style={{ background: '#ebdcb9', color: '#0b0a08' }}>SURVEY</div>
                <div className="card-header">
                  <Compass size={20} className="card-icon" />
                  <h2>Sector Analysis</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#ebdcb9', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{surveyReportZone.clue}"
                  </p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#a89a7f', lineHeight: 1.45 }}>
                    Archaeologists survey quadrants before digging to select areas most likely to answer their core historical inquiry.
                  </p>
                </div>
              </div>
            </aside>

            {/* Center Column: Survey Details */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #c5a059' }}>
                <div className="card-header">
                  <BookOpen size={20} className="card-icon gold-glow" />
                  <h2>Survey Details & Clues</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.5rem', padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, auto)', gap: '1rem' }}>
                    <div style={{ background: 'rgba(26, 22, 17, 0.4)', padding: '0.85rem', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px' }}>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#8b6a48', textTransform: 'uppercase', fontWeight: 800 }}>Likely Evidence Type</span>
                      <strong style={{ display: 'block', fontSize: '1.1rem', color: '#ebdcb9', fontFamily: 'Cinzel, serif', marginTop: '0.2rem' }}>
                        {surveyReportZone.likelyEvidence}
                      </strong>
                    </div>

                    <div style={{ background: 'rgba(26, 22, 17, 0.4)', padding: '0.85rem', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px' }}>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#8b6a48', textTransform: 'uppercase', fontWeight: 800 }}>Bureau Field Hint</span>
                      <strong style={{ display: 'block', fontSize: '0.88rem', color: '#ebdcb9', lineHeight: 1.4, marginTop: '0.2rem', fontWeight: 500 }}>
                        {surveyReportZone.missionHint}
                      </strong>
                    </div>

                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px' }}>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 800 }}>Hazard Level / Costs</span>
                      <strong style={{ display: 'block', fontSize: '0.88rem', color: '#f87171', marginTop: '0.2rem', fontWeight: 600 }}>
                        {surveyReportZone.risk}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Right Column: Mission Tracker */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Target size={20} className="card-icon" />
                  <h2>Active Inquiry</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1rem', padding: '1rem', fontSize: '0.82rem' }}>
                  <div className="mission-badge" style={{ alignSelf: 'flex-start' }}>{activeMission.targetCategoryTitle}</div>
                  <strong style={{ color: '#ebdcb9', fontFamily: 'Cinzel, serif', display: 'block', marginTop: '0.5rem' }}>{activeMission.title}</strong>
                  <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.4 }}>
                    {activeMission.inquiryQuestion}
                  </p>
                  <div style={{ borderTop: '1px solid rgba(139,106,72,0.15)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <small style={{ color: '#c5a059', display: 'block', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Mission Directive</small>
                    <small style={{ color: '#a89a7f', lineHeight: 1.3, display: 'block' }}>{activeMission.briefingRule}</small>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            <button type="button" className="footer-btn secondary-btn" onClick={keepSurveying}>
              Keep Surveying
            </button>
            <button type="button" className="footer-btn primary-btn pulse-glow" onClick={() => markSurveyZone(surveyReportZone)}>
              Mark as Dig Zone <Compass size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </footer>
        </section>
      )}

      {activeChallengeData && (
        <section className="expedition-fullscreen-room expedition-challenge-room" aria-label="Zone Challenge">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={closeZoneChallenge}>
                <ChevronLeft size={16} /> Return to Map
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Evidence Board</div>
              <h1 className="fullscreen-title">{activeChallengeData.title}</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <Gauge size={14} className="badge-icon" />
                <span>Zone Locked</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.5rem', padding: '1.5rem 2rem' }}>
            {/* Left Column: Crypt Profile */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #cda869' }}>
                <div className="card-ribbon" style={{ background: '#cda869', color: '#0b0a08' }}>CRYPT</div>
                <div className="card-header">
                  <ShieldAlert size={20} className="card-icon" />
                  <h2>Sector Seal</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a89a7f', lineHeight: 1.5 }}>
                    This sector is sealed behind an ancient cryptographic gate. You must decipher the historical query to unlock the survey reports for this quadrant.
                  </p>
                  <div style={{ background: 'rgba(26,22,17,0.4)', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px', padding: '0.85rem' }}>
                    <small style={{ color: '#c5a059', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', marginBottom: '0.25rem' }}>Active Sector</small>
                    <span style={{ fontSize: '0.9rem', color: '#ebdcb9', fontWeight: 700 }}>{surveyZoneById[activeChallengeData.zoneId]?.name || 'Ancient Quadrant'}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Center Column: Decipherment Challenge */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #c5a059' }}>
                <div className="card-header">
                  <Sparkles size={20} className="card-icon gold-glow" />
                  <h2>Decipher the Query</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.5rem', padding: '1.5rem' }}>
                  <div style={{ background: 'rgba(26, 22, 17, 0.4)', padding: '1.25rem', border: '1px solid rgba(139, 106, 72, 0.15)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#8b6a48', display: 'block', marginBottom: '0.5rem' }}>Working Theory</span>
                    <p style={{ margin: 0, fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.1rem', color: '#ebdcb9', lineHeight: 1.5 }}>
                      {activeChallengeData.question}
                    </p>
                  </div>

                  <div className="expedition-zone-answer-list" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                    {activeChallengeData.answers.map(answer => {
                      const selected = zoneChallengeFeedback?.answerId === answer.id;
                      const correct = selected && zoneChallengeFeedback.correct;
                      const incorrect = selected && !zoneChallengeFeedback.correct;
                      return (
                        <button
                          key={answer.id}
                          type="button"
                          className={`expedition-zone-answer ${selected ? 'is-selected' : ''} ${correct ? 'is-correct' : ''} ${incorrect ? 'is-incorrect' : ''}`}
                          onClick={() => answerZoneChallenge(answer.id)}
                          disabled={zoneChallengeFeedback?.correct}
                          style={{
                            padding: '1rem',
                            textAlign: 'left',
                            background: selected ? (correct ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)') : 'rgba(22, 18, 14, 0.6)',
                            border: `1px solid ${selected ? (correct ? '#10b981' : '#ef4444') : 'rgba(139, 106, 72, 0.2)'}`,
                            borderRadius: '6px',
                            color: selected ? (correct ? '#34d399' : '#f87171') : '#a89a7f',
                            cursor: zoneChallengeFeedback?.correct ? 'not-allowed' : 'pointer',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {answer.text}
                        </button>
                      );
                    })}
                  </div>

                  {zoneChallengeFeedback && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      background: zoneChallengeFeedback.correct ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      border: `1px solid ${zoneChallengeFeedback.correct ? '#10b981' : '#ef4444'}`,
                      borderRadius: '6px',
                      padding: '0.85rem'
                    }}>
                      <strong style={{ color: zoneChallengeFeedback.correct ? '#34d399' : '#f87171', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                        {zoneChallengeFeedback.correct ? '🔓 Crypt Deciphered' : '⚠️ Incorrect Decipherment'}
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: '#a89a7f' }}>{zoneChallengeFeedback.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* Right Column: Clue Reference Guide */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <BookOpen size={20} className="card-icon" />
                  <h2>Decipherment Clues</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1rem', padding: '1rem', fontSize: '0.82rem' }}>
                  <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.45 }}>
                    Read the question carefully. Connect the historical clues with your knowledge of {stageContent.targetCivilisation} civilisations before choosing your answer.
                  </p>
                  <div style={{ borderTop: '1px solid rgba(139,106,72,0.15)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <small style={{ color: '#c5a059', display: 'block', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Site Clue</small>
                    <small style={{ color: '#a89a7f', lineHeight: 1.3, display: 'block' }}>
                      {surveyZoneById[activeChallengeData.zoneId]?.clue || 'No additional clues registered.'}
                    </small>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            {zoneChallengeFeedback?.correct ? (
              <button
                type="button"
                className="footer-btn primary-btn pulse-glow"
                onClick={() => {
                  closeZoneChallenge();
                  if (surveyZoneById[activeChallengeData.zoneId]) {
                    openSurveyReport(surveyZoneById[activeChallengeData.zoneId], { skipChallenge: true });
                  }
                }}
              >
                Open Survey Report <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            ) : (
              <button type="button" className="footer-btn secondary-btn" onClick={closeZoneChallenge}>
                Return to Map
              </button>
            )}
          </footer>
        </section>
      )}

      {gridSetupOpen && selectedSurveyZone && (
        <section className="expedition-fullscreen-room expedition-grid-room" aria-label="Grid Setup Matrix">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={keepExploringGrid}>
                <ChevronLeft size={16} /> Return to Map
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Excavation Grid</div>
              <h1 className="fullscreen-title">{surveyZoneById[selectedSurveyZone]?.name}</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <Ruler size={14} className="badge-icon" />
                <span>Grid Setup Active</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.6fr 1.1fr', gap: '1.5rem', padding: '1.5rem 2rem' }}>
            {/* Left Column: Zone Details & Resource Details */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #c5a059' }}>
                <div className="card-ribbon" style={{ background: '#ebdcb9', color: '#0b0a08' }}>GRID</div>
                <div className="card-header">
                  <Ruler size={20} className="card-icon" />
                  <h2>Dig Site Info</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.15rem', padding: '1.15rem' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#a89a7f', lineHeight: 1.45 }}>
                    Archaeologists divide a dig site into grid squares to record exactly where evidence was found. This helps maintain spatial context and stratigraphic integrity.
                  </p>

                  <div style={{ background: 'rgba(26,22,17,0.4)', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px', padding: '0.85rem' }}>
                    <small style={{ color: '#c5a059', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', marginBottom: '0.25rem' }}>Selected Quadrant</small>
                    <span style={{ fontSize: '0.9rem', color: '#ebdcb9', fontWeight: 700 }}>{surveyZoneById[selectedSurveyZone]?.name}</span>
                  </div>

                  <div style={{ background: 'rgba(26,22,17,0.4)', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px', padding: '0.85rem' }}>
                    <small style={{ color: '#c5a059', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', marginBottom: '0.25rem' }}>Site Instructions</small>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#a89a7f', lineHeight: 1.35 }}>
                      Open one square at a time. Only evidence linked to opened squares will become visible.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Center Column: Interactive Grid Squares Matrix */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #c5a059' }}>
                <div className="card-header">
                  <MapIcon size={20} className="card-icon gold-glow" />
                  <h2>Grid Squares Matrix</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  <div className="expedition-grid-square-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {gridSquares.map(square => {
                      const isOpened = openedGridSquares.has(square.id);
                      const cost = GRID_COSTS[square.risk] || GRID_COSTS.Low;
                      return (
                        <article
                          key={square.id}
                          className={`expedition-grid-square ${isOpened ? 'is-opened' : ''}`}
                          style={{
                            background: isOpened ? 'rgba(197, 160, 89, 0.05)' : 'rgba(22, 18, 14, 0.6)',
                            border: `1px solid ${isOpened ? 'rgba(197, 160, 89, 0.4)' : 'rgba(139, 106, 72, 0.18)'}`,
                            borderRadius: '8px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            position: 'relative',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: '#ebdcb9', fontFamily: 'Cinzel, serif', fontSize: '1.1rem' }}>Square {square.id}</strong>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: square.risk === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: square.risk === 'High' ? '#f87171' : '#34d399',
                              border: `1px solid ${square.risk === 'High' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                            }}>
                              Risk: {square.risk}
                            </span>
                          </div>

                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#a89a7f', lineHeight: 1.35, flexGrow: 1 }}>{square.clue}</p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.5rem 0', borderTop: '1px solid rgba(139, 106, 72, 0.1)' }}>
                            <small style={{ color: '#c5a059', fontSize: '0.7rem', fontStyle: 'italic' }}>{square.possibleEvidenceHint}</small>
                            <small style={{ color: '#ebdcb9', fontSize: '0.68rem', fontWeight: 600 }}>
                              Cost: {cost.investigation} invest., {cost.time}s
                            </small>
                          </div>

                          <button
                            type="button"
                            className={`btn ${isOpened ? 'secondary-btn' : 'primary-btn'}`}
                            onClick={() => openGridSquare(square)}
                            style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem' }}
                          >
                            {isOpened ? 'Excavate Square Again' : 'Excavate Square'}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            </main>

            {/* Right Column: Satchel and Fitted Tools */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Backpack size={20} className="card-icon" />
                  <h2>Mission Objective</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1rem', padding: '1rem', fontSize: '0.82rem' }}>
                  <div className="mission-badge" style={{ alignSelf: 'flex-start' }}>{activeMission.targetCategoryTitle}</div>
                  <strong style={{ color: '#ebdcb9', fontFamily: 'Cinzel, serif', display: 'block', marginTop: '0.5rem' }}>{activeMission.title}</strong>
                  <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.45 }}>
                    {activeMission.instruction}
                  </p>

                  <div style={{ borderTop: '1px solid rgba(139,106,72,0.15)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <small style={{ color: '#ebdcb9', display: 'block', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem', marginBottom: '0.25rem' }}>Fitted Tools Ready</small>
                    <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.35 }}>
                      {fieldKitEffects.measuringTapeReady ? '📏 Measuring Tape equipped (location precision active)' : '❌ Measuring Tape missing'}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            <button type="button" className="footer-btn secondary-btn" onClick={() => setNotice(`${activeMission.title}: ${activeMission.instruction}`)}>
              Review Mission
            </button>
            <button type="button" className="footer-btn primary-btn pulse-glow" onClick={keepExploringGrid}>
              Keep Exploring <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </footer>
        </section>
      )}

      {inspectionToken && (
        <section className="expedition-fullscreen-room expedition-lab-room" aria-label="Evidence Workbench">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={closeInspection}>
                <ChevronLeft size={16} /> Return to Site
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Conservation Bench</div>
              <h1 className="fullscreen-title">{inspectionToken.name}</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <Gem size={14} className="badge-icon" />
                <span>Field Analysis Active</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.5rem', padding: '1.5rem 2rem' }}>
            {/* Left Column: Artifact Profile */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #ebdcb9' }}>
                <div className="card-ribbon" style={{ background: '#ebdcb9', color: '#0b0a08' }}>UNCLASSIFIED</div>
                <div className="card-header">
                  <Gem size={20} className="card-icon" />
                  <h2>Artifact Dossier</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a89a7f', lineHeight: 1.5 }}>
                    <strong>Clue context:</strong> "{inspectionToken.clue}"
                  </p>

                  <div style={{ background: 'rgba(26,22,17,0.4)', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px', padding: '0.85rem', fontSize: '0.8rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#ebdcb9', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>Field Sector</strong>
                      <span style={{ color: '#a89a7f' }}>{inspectionToken.zone}</span>
                    </div>
                    {inspectionToken.evidenceQuality && (
                      <div>
                        <strong style={{ color: '#ebdcb9', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>Excavated Quality</strong>
                        <span style={{ color: '#ebdcb9', fontWeight: 'bold' }}>{inspectionToken.evidenceQuality.toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  {fieldKitEffects.fieldGuideAvailable && !inspectionFeedback && (
                    <div style={{ background: 'rgba(197, 160, 89, 0.08)', border: '1px solid rgba(197, 160, 89, 0.25)', borderRadius: '6px', padding: '0.85rem', fontSize: '0.78rem' }}>
                      <strong style={{ color: '#ebdcb9', display: 'block', marginBottom: '0.2rem' }}>📖 Field Guide Hint</strong>
                      <span style={{ color: '#a89a7f', lineHeight: 1.4 }}>
                        Look at the material, shape, location and clue before deciding how to classify this evidence.
                      </span>
                    </div>
                  )}

                  {fieldKitEffects.notebookReady && !inspectionFeedback && (
                    <div style={{ background: 'rgba(197, 160, 89, 0.08)', border: '1px solid rgba(197, 160, 89, 0.25)', borderRadius: '6px', padding: '0.85rem', fontSize: '0.78rem' }}>
                      <strong style={{ color: '#ebdcb9', display: 'block', marginBottom: '0.2rem' }}>📓 Field Notebook Active</strong>
                      <span style={{ color: '#a89a7f', lineHeight: 1.4 }}>
                        Excavation method choices and rejected evidence are fully logged in your field notes.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Center Column: Lab Workbench Process Steps */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #c5a059' }}>
                <div className="card-header">
                  <Sparkles size={20} className="card-icon gold-glow" />
                  <h2>Analysis Workbench</h2>
                </div>

                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  {/* Step 1: Excavate */}
                  {!inspectionFeedback && inspectionStep === 'excavate' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <strong style={{ color: '#ebdcb9', fontSize: '1.05rem', fontFamily: 'Cinzel, serif' }}>Choose Excavation Method</strong>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#a89a7f', lineHeight: 1.4 }}>
                        Archaeologists select their excavation tools carefully depending on the fragility of the artifacts and surrounding strata.
                      </p>

                      <div className="expedition-excavation-method-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                        {EXCAVATION_METHODS.map(method => {
                          const costText = `${method.cost.investigation} investigation, ${method.cost.time} seconds`;
                          return (
                            <article
                              key={method.id}
                              className="expedition-excavation-method-card"
                              style={{
                                background: 'rgba(22, 18, 14, 0.6)',
                                border: '1px solid rgba(139, 106, 72, 0.2)',
                                borderRadius: '6px',
                                padding: '0.85rem',
                                display: 'grid',
                                gridTemplateColumns: '1fr 130px',
                                gap: '1rem',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <strong style={{ color: '#ebdcb9', display: 'block', fontSize: '0.9rem' }}>{method.name}</strong>
                                <span style={{ color: '#c5a059', display: 'block', fontSize: '0.72rem', fontStyle: 'italic', marginBottom: '0.25rem' }}>{method.bestFor}</span>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#a89a7f' }}>Cost: {costText}</p>
                              </div>
                              <button
                                type="button"
                                className="btn primary-btn"
                                onClick={() => chooseExcavationMethod(method.id)}
                                style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
                              >
                                Select Tool
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Map the Find */}
                  {!inspectionFeedback && inspectionStep === 'map' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <strong style={{ color: '#ebdcb9', fontSize: '1.05rem', fontFamily: 'Cinzel, serif' }}>Map & Record Coordinates</strong>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#a89a7f', lineHeight: 1.45 }}>
                        Precise provenance is essential. Categorise the find and associate it with the correct stratigraphic profile.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'rgba(26,22,17,0.4)', padding: '0.85rem', borderRadius: '6px', border: '1px solid rgba(139,106,72,0.1)' }}>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ display: 'block', fontSize: '0.62rem', color: '#8b6a48', textTransform: 'uppercase' }}>Zone</span>
                          <strong style={{ color: '#ebdcb9', fontSize: '0.78rem' }}>{getSurveyZoneName(selectedSurveyZone, surveyZoneById) || 'Unknown'}</strong>
                        </div>
                        <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(139,106,72,0.15)', borderRight: '1px solid rgba(139,106,72,0.15)' }}>
                          <span style={{ display: 'block', fontSize: '0.62rem', color: '#8b6a48', textTransform: 'uppercase' }}>Grid Square</span>
                          <strong style={{ color: '#ebdcb9', fontSize: '0.78rem' }}>{selectedGridSquare || 'Unknown'}</strong>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ display: 'block', fontSize: '0.62rem', color: '#8b6a48', textTransform: 'uppercase' }}>Classification</span>
                          <strong style={{ color: '#cda869', fontSize: '0.78rem' }}>
                            {selectedMappedEvidenceType ? getMapEvidenceTypeName(selectedMappedEvidenceType) : 'Pending'}
                          </strong>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        {MAP_EVIDENCE_TYPES.map(type => (
                          <button
                            key={type.id}
                            type="button"
                            className={`expedition-map-type-btn ${selectedMappedEvidenceType === type.id ? 'is-selected' : ''}`}
                            onClick={() => setSelectedMappedEvidenceType(type.id)}
                            style={{
                              padding: '0.65rem 0.85rem',
                              background: selectedMappedEvidenceType === type.id ? 'rgba(197, 160, 89, 0.15)' : 'rgba(22,18,14,0.6)',
                              border: `1px solid ${selectedMappedEvidenceType === type.id ? '#c5a059' : 'rgba(139,106,72,0.2)'}`,
                              borderRadius: '6px',
                              color: selectedMappedEvidenceType === type.id ? '#fff' : '#a89a7f',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              fontWeight: selectedMappedEvidenceType === type.id ? 'bold' : 'normal',
                              textAlign: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {type.name}
                          </button>
                        ))}
                      </div>

                      {mappingFeedback && (
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          background: mappingFeedback.accurate ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                          border: `1px solid ${mappingFeedback.accurate ? '#10b981' : '#ef4444'}`,
                          borderRadius: '6px',
                          padding: '0.75rem',
                          alignItems: 'center'
                        }}>
                          <CheckCircle2 size={16} style={{ color: mappingFeedback.accurate ? '#34d399' : '#f87171' }} />
                          <div style={{ fontSize: '0.78rem' }}>
                            <strong style={{ color: mappingFeedback.accurate ? '#34d399' : '#f87171', display: 'block' }}>
                              {mappingFeedback.accurate ? 'Mapping Verified' : 'Mapping Logged'}
                            </strong>
                            <p style={{ margin: 0, color: '#a89a7f' }}>{mappingFeedback.text}</p>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn primary-btn"
                        onClick={recordMappedFind}
                        disabled={!selectedMappedEvidenceType}
                        style={{ width: '100%', padding: '0.65rem' }}
                      >
                        Record Map
                      </button>
                    </div>
                  )}

                  {/* Mid-step helper text */}
                  {selectedExcavationMethod && !inspectionFeedback && inspectionStep !== 'excavate' && (
                    <div style={{ background: 'rgba(197, 160, 89, 0.06)', border: '1px solid rgba(197, 160, 89, 0.25)', borderRadius: '6px', padding: '0.75rem', fontSize: '0.78rem' }}>
                      <strong style={{ color: '#ebdcb9' }}>{selectedExcavationMethod.methodName} used</strong>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#a89a7f', lineHeight: 1.35 }}>
                        Quality: <strong style={{ color: '#c5a059' }}>{selectedExcavationMethod.quality}</strong>. {selectedExcavationMethod.feedback}
                        {selectedExcavationMethod.kitFeedback ? ` ${selectedExcavationMethod.kitFeedback}` : ''}
                      </p>
                    </div>
                  )}

                  {inspectionStep === 'review' && mappingFeedback && !inspectionFeedback && (
                    <div style={{
                      background: mappingFeedback.accurate ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                      border: `1px solid ${mappingFeedback.accurate ? '#10b981' : '#ef4444'}`,
                      borderRadius: '6px',
                      padding: '0.75rem',
                      fontSize: '0.78rem'
                    }}>
                      <strong>{mappingFeedback.accurate ? 'Mapping Accurate' : 'Stratigraphy Discrepancy'}</strong>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#a89a7f', lineHeight: 1.35 }}>{mappingFeedback.text}</p>
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {!inspectionFeedback && inspectionStep === 'review' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <strong style={{ color: '#ebdcb9', fontSize: '1.05rem', fontFamily: 'Cinzel, serif' }}>Verify & Secure Find</strong>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#a89a7f', lineHeight: 1.4 }}>
                        Evaluate if this artifact matches your active inquiry dossier. Secure relevant evidence, or discard weaker findings.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <button
                          type="button"
                          className="btn primary-btn"
                          onClick={() => inspectMissionChoice(true)}
                          style={{ padding: '0.85rem' }}
                        >
                          Secure as Mission Evidence
                        </button>
                        <button
                          type="button"
                          className="btn secondary-btn"
                          onClick={() => inspectMissionChoice(false)}
                          style={{ padding: '0.85rem' }}
                        >
                          Not Mission Evidence - Keep Searching
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Satchel Capacity Decision */}
                  {!inspectionFeedback && inspectionStep === 'capacity' && pendingEvidence && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <strong style={{ color: '#f87171', fontSize: '1.05rem', fontFamily: 'Cinzel, serif' }}>🎒 Satchel Overflow!</strong>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#a89a7f', lineHeight: 1.4 }}>
                        Your explorer satchel is full (3/3). You must choose to discard an existing piece of evidence or reject the new find.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Satchel contents list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#c5a059' }}>Current Satchel Items</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                            {satchelContents.map(item => (
                              <div key={item.id} style={{ background: 'rgba(26,22,17,0.5)', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '4px', padding: '0.5rem', fontSize: '0.72rem' }}>
                                <strong style={{ color: '#ebdcb9', display: 'block' }}>{item.name}</strong>
                                <span style={{ color: '#8b6a48' }}>{item.evidenceQuality || 'good'}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* New evidence profile */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#ef4444' }}>New Artifact</span>
                          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '4px', padding: '0.5rem', fontSize: '0.72rem' }}>
                            <strong style={{ color: '#ebdcb9', display: 'block' }}>{pendingEvidence.name}</strong>
                            <span style={{ color: '#f87171' }}>{pendingEvidence.evidenceQuality || 'good'}</span>
                            <small style={{ display: 'block', color: '#ebdcb9', marginTop: '0.25rem' }}>
                              {pendingEvidence.matchesMission ? '✅ Answers Inquiry' : '❌ Irrelevant'}
                            </small>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="button" className="btn primary-btn" onClick={() => setInspectionStep('replace')} style={{ padding: '0.55rem' }}>
                          Replace an Item
                        </button>
                        <button type="button" className="btn secondary-btn" onClick={() => rejectInspectedEvidence(inspectionToken)} style={{ padding: '0.55rem' }}>
                          Discard New Evidence
                        </button>
                        <button type="button" className="btn outline-btn" onClick={() => setInspectionStep('mission')} style={{ padding: '0.55rem' }}>
                          Review Dossier
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Mission Review from Satchel overflow */}
                  {!inspectionFeedback && inspectionStep === 'mission' && pendingEvidence && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <strong style={{ color: '#ebdcb9', fontSize: '1.05rem', fontFamily: 'Cinzel, serif' }}>Review Expedition Dossier</strong>
                      <div style={{ background: 'rgba(26,22,17,0.4)', border: '1px solid rgba(139,106,72,0.15)', borderRadius: '6px', padding: '1rem', fontSize: '0.82rem' }}>
                        <strong style={{ color: '#ebdcb9', display: 'block' }}>{activeMission.title}</strong>
                        <p style={{ margin: '0.25rem 0 0.5rem 0', color: '#ebdcb9', fontStyle: 'italic' }}>Question: {activeMission.inquiryQuestion}</p>
                        <small style={{ color: '#a89a7f', display: 'block', lineHeight: 1.35 }}>Target Type: {activeMission.targetEvidenceType}</small>
                        <small style={{ color: '#a89a7f', display: 'block', lineHeight: 1.35 }}>Directive: {activeMission.briefingRule}</small>
                      </div>
                      <button type="button" className="btn" onClick={() => setInspectionStep('capacity')} style={{ padding: '0.55rem' }}>
                        Return to Decision
                      </button>
                    </div>
                  )}

                  {/* Step 6: Replacement Picker */}
                  {!inspectionFeedback && inspectionStep === 'replace' && pendingEvidence && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <strong style={{ color: '#ebdcb9', fontSize: '1.05rem', fontFamily: 'Cinzel, serif' }}>Select Satchel Item to Discard</strong>

                      <div className="expedition-replacement-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {satchelContents.map(item => (
                          <button
                            key={item.id}
                            type="button"
                            className="expedition-replacement-card"
                            onClick={() => finishInspection(inspectionToken, item.id)}
                            style={{
                              background: 'rgba(22, 18, 14, 0.6)',
                              border: '1px solid rgba(139, 106, 72, 0.25)',
                              borderRadius: '6px',
                              padding: '0.75rem',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div>
                              <strong style={{ color: '#ebdcb9', display: 'block' }}>{item.name}</strong>
                              <span style={{ color: '#a89a7f', fontSize: '0.72rem' }}>{item.category} | {item.evidenceQuality || 'good'}</span>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 'bold', textTransform: 'uppercase' }}>Discard ➔</span>
                          </button>
                        ))}
                      </div>

                      <button type="button" className="btn" onClick={() => setInspectionStep('capacity')} style={{ padding: '0.55rem' }}>
                        Back
                      </button>
                    </div>
                  )}

                  {/* Step 7: Feedback / Verification Stamp */}
                  {inspectionFeedback && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        background: inspectionFeedback.correct ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        border: `1px solid ${inspectionFeedback.correct ? '#10b981' : '#ef4444'}`,
                        borderRadius: '6px',
                        padding: '1.25rem',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {inspectionFeedback.correct ? <CheckCircle2 size={24} style={{ color: '#34d399' }} /> : <AlertTriangle size={24} style={{ color: '#f87171' }} />}
                        <div>
                          <strong style={{ color: inspectionFeedback.correct ? '#34d399' : '#f87171', fontSize: '1.05rem', display: 'block', fontFamily: 'Cinzel, serif' }}>
                            {inspectionFeedback.correct ? 'Evidence Verified' : 'Evidence Logged'}
                          </strong>
                          <p style={{ margin: '0.25rem 0 0 0', color: '#ebdcb9', fontSize: '0.85rem', lineHeight: 1.4 }}>{inspectionFeedback.text}</p>
                        </div>

                        {/* Stamp watermark */}
                        <div style={{
                          position: 'absolute',
                          right: '-10px',
                          bottom: '-15px',
                          opacity: 0.12,
                          transform: 'rotate(-15deg)',
                          fontFamily: 'Cinzel, serif',
                          fontSize: '3rem',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          color: inspectionFeedback.correct ? '#10b981' : '#ef4444',
                          pointerEvents: 'none'
                        }}>
                          {inspectionFeedback.stamp}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* Right Column: Satchel / Mission Reference */}
            <aside className="basecamp-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Backpack size={20} className="card-icon" />
                  <h2>Mission Dossier</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1rem', padding: '1rem', fontSize: '0.82rem' }}>
                  <div className="mission-badge" style={{ alignSelf: 'flex-start' }}>{activeMission.targetCategoryTitle}</div>
                  <strong style={{ color: '#ebdcb9', fontFamily: 'Cinzel, serif', display: 'block', marginTop: '0.5rem' }}>{activeMission.title}</strong>
                  <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.4 }}>
                    {activeMission.inquiryQuestion}
                  </p>

                  <div style={{ background: 'rgba(26, 22, 17, 0.4)', padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(139,106,72,0.1)', marginTop: '0.5rem' }}>
                    <small style={{ color: '#ebdcb9', display: 'block', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Secured Finds</small>
                    <span style={{ fontSize: '1rem', color: '#c5a059', fontWeight: 'bold' }}>{missionEvidenceCount} / {missionRequiredCount}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            {(inspectionFeedback || inspectionStep === 'review') ? (
              <button type="button" className="footer-btn primary-btn pulse-glow" onClick={closeInspection}>
                {inspectionFeedback ? 'Continue Expedition' : 'Keep Looking'} <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            ) : (
              <button type="button" className="footer-btn secondary-btn" onClick={closeInspection}>
                Return to Site
              </button>
            )}
          </footer>
        </section>
      )}

      {claimOpen && (
        <section className="expedition-fullscreen-room expedition-claim-room" aria-label="Bureau Hypothesis Board">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button
                type="button"
                className="fullscreen-back-btn"
                onClick={() => {
                  playerRef.current = { x: 676, y: 304 };
                  lockedRef.current = false;
                  setClaimOpen(false);
                }}
              >
                <ChevronLeft size={16} /> Return to Site
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Discovery Log</div>
              <h1 className="fullscreen-title">Identify the Lost Site</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <ShieldAlert size={14} className="badge-icon" />
                <span>Verification Active</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content expedition-grid-layout">
            {/* Left Column: Bureau Directives */}
            <aside className="basecamp-column">
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #8b6a48' }}>
                <div className="card-ribbon" style={{ background: '#ef4444', color: '#fff' }}>CLASSIFIED</div>
                <div className="card-header">
                  <BookOpen size={20} className="card-icon" />
                  <h2>Claim Instructions</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.25rem', padding: '1.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a89a7f', lineHeight: 1.5 }}>
                    Formulate your final archaeological claim. You must specify the precise civilisation that established this site and provide your best piece of supporting context evidence from your satchel.
                  </p>
                  <div style={{ background: 'rgba(26,22,17,0.4)', padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(139,106,72,0.1)', fontSize: '0.78rem', color: '#a89a7f' }}>
                    <strong>Warning:</strong> Rushed or unsupported hypotheses will be rejected by the Bureau council.
                  </div>
                </div>
              </div>
            </aside>

            {/* Center Column: Hypothesis Board Selector Form */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #c5a059' }}>
                <div className="card-header">
                  <Target size={20} className="card-icon gold-glow" />
                  <h2>Hypothesis Board</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '1.5rem', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#c5a059', letterSpacing: '0.04em' }}>Civilisation</label>
                      <select
                        value={selectedCivilisation}
                        onChange={(event) => setSelectedCivilisation(event.target.value)}
                        className="expedition-dark-select"
                      >
                        <option value="">Choose a civilisation</option>
                        {claimCivilisations.map(civilisation => (
                          <option key={civilisation} value={civilisation}>{civilisation}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#c5a059', letterSpacing: '0.04em' }}>Supporting Evidence</label>
                      <select
                        value={selectedEvidenceId}
                        onChange={(event) => setSelectedEvidenceId(event.target.value)}
                        className="expedition-dark-select small"
                      >
                        <option value="">Choose collected evidence</option>
                        {collectedEvidence.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {claimResult && (
                    <div style={{
                      display: 'flex',
                      gap: '0.75rem',
                      background: claimResult.correct ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      border: `1px solid ${claimResult.correct ? '#10b981' : '#ef4444'}`,
                      borderRadius: '6px',
                      padding: '1rem',
                      alignItems: 'center',
                      marginTop: '0.5rem'
                    }}>
                      {claimResult.correct ? <CheckCircle2 size={22} style={{ color: '#34d399' }} /> : <AlertTriangle size={22} style={{ color: '#f87171' }} />}
                      <div>
                        <strong style={{ color: claimResult.correct ? '#34d399' : '#f87171', display: 'block', fontSize: '0.9rem' }}>
                          {claimResult.sentence}
                        </strong>
                        <p style={{ margin: '0.15rem 0 0 0', color: '#a89a7f', fontSize: '0.82rem', lineHeight: 1.4 }}>
                          {claimResult.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* Right Column: Satchel Overview */}
            <aside className="basecamp-column">
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Backpack size={20} className="card-icon" />
                  <h2>Active satchel</h2>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', gap: '0.85rem', padding: '1rem', fontSize: '0.82rem' }}>
                  {collectedEvidence.length > 0 ? (
                    collectedEvidence.map(item => (
                      <div key={item.id} style={{ background: 'rgba(26, 22, 17, 0.5)', border: '1px solid rgba(139, 106, 72, 0.15)', borderRadius: '4px', padding: '0.55rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <strong style={{ color: '#ebdcb9' }}>{item.name}</strong>
                        <small style={{ color: '#8b6a48' }}>Quality: {item.evidenceQuality || 'good'}</small>
                        <span style={{ fontSize: '0.72rem', color: '#a89a7f', fontStyle: 'italic', display: 'block', marginTop: '0.2rem' }}>"{item.clue}"</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ margin: 0, color: '#a89a7f', fontStyle: 'italic' }}>No evidence collected yet.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            {claimResult?.correct ? (
              <button type="button" className="footer-btn primary-btn pulse-glow" onClick={resetExpedition}>
                Play Again <RotateCcw size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="footer-btn secondary-btn"
                  onClick={() => {
                    playerRef.current = { x: 676, y: 304 };
                    lockedRef.current = false;
                    setClaimOpen(false);
                  }}
                >
                  Return to Site
                </button>
                <button type="button" className="footer-btn primary-btn" onClick={submitClaim}>
                  Submit Claim <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
                </button>
              </>
            )}
          </footer>
        </section>
      )}

      {resultOpen && (
        <section className="expedition-fullscreen-room expedition-result-room" aria-label="Expedition Results">
          <header className="expedition-fullscreen-header">
            <div className="header-left">
              <button type="button" className="fullscreen-back-btn" onClick={onBackToMenu}>
                <ChevronLeft size={16} /> Exit to Menu
              </button>
            </div>
            <div className="header-center">
              <div className="fullscreen-kicker">Lost Site Expedition - Discovery Log</div>
              <h1 className="fullscreen-title">Mission Report & Results</h1>
            </div>
            <div className="header-right">
              <div className="fullscreen-badge status-ready" style={{ background: 'rgba(197, 160, 89, 0.12)', borderColor: '#c5a059', color: '#ebdcb9' }}>
                <Sparkles size={14} className="badge-icon pulse" />
                <span>Expedition Completed</span>
              </div>
            </div>
          </header>

          <div className="expedition-fullscreen-content expedition-grid-layout">
            {/* Left Column: Summary and Score */}
            <aside className="basecamp-column">
              <div className="fullscreen-card briefing-card" style={{ borderLeft: '3px solid #c5a059' }}>
                <div className="card-ribbon" style={{ background: '#34d399' }}>Finished</div>
                <div className="card-header">
                  <Target size={20} className="card-icon" />
                  <h2>Final Assessment</h2>
                </div>
                <div className="card-body" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 1.5rem' }}>
                  <div className="expedition-score-badge" style={{ width: '130px', height: '130px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,160,89,0.15) 0%, rgba(0,0,0,0.5) 100%)', border: '3px solid #c5a059', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(197,160,89,0.25)', marginBottom: '1.5rem' }}>
                    <strong style={{ fontSize: '3rem', fontFamily: 'Cinzel, serif', color: '#fff', lineHeight: 1 }}>{finalScore}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#cda869', fontWeight: 600 }}>/ 100 PTS</span>
                  </div>

                  <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.6rem', color: '#ebdcb9', margin: '0 0 0.75rem' }}>{finalRank}</h3>
                  <p style={{ fontSize: '0.92rem', color: '#a89a7f', lineHeight: 1.5, margin: 0 }}>{resultFeedback}</p>
                </div>
              </div>
            </aside>

            {/* Middle Column: Detailed Stats */}
            <main className="basecamp-column">
              <div className="fullscreen-card shop-card" style={{ borderTop: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Backpack size={20} className="card-icon" />
                  <h2>Field Performance Statistics</h2>
                </div>

                <div className="card-body" style={{ overflowY: 'auto', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      <div className="expedition-stat-box">
                        <span style={{ fontSize: '0.72rem', color: '#8b6a48', fontWeight: 800, textTransform: 'uppercase' }}>Remaining Time</span>
                        <strong style={{ display: 'block', fontSize: '1.5rem', color: '#ebdcb9', fontFamily: 'Cinzel, serif', marginTop: '0.25rem' }}>{resources.time}s</strong>
                      </div>
                      <div className="expedition-stat-box">
                        <span style={{ fontSize: '0.72rem', color: '#8b6a48', fontWeight: 800, textTransform: 'uppercase' }}>Endurance</span>
                        <strong style={{ display: 'block', fontSize: '1.5rem', color: '#ebdcb9', fontFamily: 'Cinzel, serif', marginTop: '0.25rem' }}>{resources.stamina}</strong>
                      </div>
                      <div className="expedition-stat-box">
                        <span style={{ fontSize: '0.72rem', color: '#8b6a48', fontWeight: 800, textTransform: 'uppercase' }}>Investigation</span>
                        <strong style={{ display: 'block', fontSize: '1.5rem', color: '#ebdcb9', fontFamily: 'Cinzel, serif', marginTop: '0.25rem' }}>{resources.investigation}</strong>
                      </div>
                    </div>

                  <section className="expedition-result-card expedition-card-dark">
                    <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.95rem', margin: '0 0 0.75rem', color: '#cda869', borderBottom: '1px solid rgba(139,106,72,0.15)', paddingBottom: '0.35rem' }}>Mission Review</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Active Objective:</span><strong style={{ color: '#fff' }}>{activeMission.title}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Mission Evidence:</span><strong style={{ color: '#34d399' }}>{missionComplete ? 'Secured' : 'Not secured'}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Target Collected:</span><strong style={{ color: '#fff' }}>{missionEvidenceCount} / {missionRequiredCount} {activeMission.targetCategoryTitle}</strong></div>
                    </div>
                  </section>

                  <section className="expedition-result-card expedition-card-dark">
                    <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.95rem', margin: '0 0 0.75rem', color: '#cda869', borderBottom: '1px solid rgba(139,106,72,0.15)', paddingBottom: '0.35rem' }}>Historical Hypothesis</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Target Civilisation:</span><strong style={{ color: '#fff' }}>{targetCivilisation}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Your Claim:</span><strong style={{ color: claimCorrect ? '#34d399' : '#f87171' }}>{selectedCivilisation || 'Not chosen'}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Claim Verdict:</span><strong style={{ color: claimCorrect ? '#34d399' : '#f87171' }}>{claimCorrect ? 'VERIFIED' : 'FAILED'}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b6a48' }}>Best Support Clue:</span><strong style={{ color: '#ebdcb9' }}>{selectedEvidence?.name || 'Not chosen'}</strong></div>
                    </div>
                    {claimResult && (
                      <div className={`expedition-claim-feedback ${claimResult.correct ? 'correct' : 'incorrect'}`} style={{ marginTop: '0.85rem', padding: '0.75rem', borderRadius: '4px', border: '1px solid', borderColor: claimResult.correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)', background: claimResult.correct ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', color: claimResult.correct ? '#34d399' : '#f87171' }}>
                        <div style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>
                          <strong style={{ display: 'block', textTransform: 'uppercase', marginBottom: '0.15rem' }}>{claimResult.sentence}</strong>
                          <p style={{ margin: 0 }}>{claimResult.feedback}</p>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="expedition-result-card expedition-card-dark">
                    <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.95rem', margin: '0 0 0.75rem', color: '#cda869', borderBottom: '1px solid rgba(139,106,72,0.15)', paddingBottom: '0.35rem' }}>Evidence Catalog & Quality</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ background: 'rgba(22, 18, 14, 0.4)', borderRadius: '4px', padding: '0.5rem', textAlign: 'center', fontSize: '0.8rem' }}>Excellent: <strong style={{ color: '#34d399' }}>{evidenceQualitySummary.excellent}</strong></div>
                      <div style={{ background: 'rgba(22, 18, 14, 0.4)', borderRadius: '4px', padding: '0.5rem', textAlign: 'center', fontSize: '0.8rem' }}>Good: <strong style={{ color: '#ebdcb9' }}>{evidenceQualitySummary.good}</strong></div>
                      <div style={{ background: 'rgba(22, 18, 14, 0.4)', borderRadius: '4px', padding: '0.5rem', textAlign: 'center', fontSize: '0.8rem' }}>Damaged: <strong style={{ color: '#f87171' }}>{evidenceQualitySummary.damaged}</strong></div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#a89a7f', fontStyle: 'italic', lineHeight: 1.4 }}>
                      {evidenceQualitySummary.damaged > 0
                        ? 'âš ï¸ Some evidence was damaged by rushed excavation. It can still support a claim, but careful excavation is more reliable.'
                        : 'âœ… Perfect, careful excavation improved the reliability and score weight of your evidence.'}
                    </p>
                  </section>
                </div>
              </div>
            </main>

            {/* Right Column: Kit and Catalog */}
            <aside className="basecamp-column">
              <div className="fullscreen-card kit-card" style={{ borderRight: '2px solid #8b6a48' }}>
                <div className="card-header">
                  <Gem size={20} className="card-icon" />
                  <h2>Dossier Details</h2>
                </div>

                <div className="card-body" style={{ overflowY: 'auto', gap: '1rem', padding: '1rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <strong style={{ color: '#ebdcb9', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04rem' }}>Fitted Tools</strong>
                    <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.4 }}>
                      {collectedTools.length > 0 ? collectedTools.map(tool => tool.name).join(', ') : 'None'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <strong style={{ color: '#f87171', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04rem' }}>Missing Tools</strong>
                    <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.4 }}>
                      {missingTools.length > 0 ? missingTools.map(tool => tool.name).join(', ') : 'None'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <strong style={{ color: '#ebdcb9', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04rem' }}>Evidence Satchel</strong>
                    <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.4 }}>
                      {collectedEvidence.length > 0 ? collectedEvidence.map(item => `${item.name} (${item.evidenceQuality || 'good'})`).join(', ') : 'Empty'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <strong style={{ color: '#ebdcb9', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04rem' }}>Field Journal Notes</strong>
                    <p style={{ margin: 0, color: '#a89a7f', lineHeight: 1.4 }}>
                      {fieldNotes.length > 0 ? fieldNotes.map(note => note.name).join(', ') : 'None recorded'}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <footer className="expedition-fullscreen-footer">
            <button type="button" className="footer-btn secondary-btn" onClick={onBackToMenu}>
              <ChevronLeft size={16} /> Exit to Menu
            </button>
            {onSendToLab && claimCorrect ? (
              <button
                type="button"
                className="footer-btn primary-btn pulse-glow"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                  border: '1px solid #34d399',
                }}
                onClick={() => onSendToLab(collectedEvidence, fieldNotes, stageContent.id)}
              >
                Send to Lab & Build Report <Sparkles size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            ) : (
              <button type="button" className="footer-btn primary-btn pulse-glow" onClick={resetExpedition}>
                Play Again <RotateCcw size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            )}
          </footer>
        </section>
      )}
    </section>
  );
}
