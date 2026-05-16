import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Backpack,
  CheckCircle2,
  ChevronLeft,
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
  EXPEDITION_STAGE_HEADER_CHARACTERS,
  EXPEDITION_STAGES,
  PLAYABLE_EXPEDITION_STAGE_ID,
} from './expedition/expeditionStages';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 560;
const PLAYER_SIZE = 22;
const TARGET_CIVILISATION = 'Ancient Egypt';

const ZONES = [
  { id: 'riverbank', name: 'Riverbank', emoji: '🌊', x: 0, y: 0, w: 260, h: 220, color: 'rgba(56, 189, 248, 0.18)' },
  { id: 'burial', name: 'Burial Area', emoji: '🏺', x: 260, y: 0, w: 260, h: 220, color: 'rgba(160, 120, 90, 0.2)' },
  { id: 'archive', name: 'Archive Corner', emoji: '📜', x: 520, y: 0, w: 280, h: 220, color: 'rgba(232, 158, 93, 0.16)' },
  { id: 'market', name: 'Market Area', emoji: '⛺', x: 0, y: 220, w: 320, h: 190, color: 'rgba(245, 158, 11, 0.14)' },
  { id: 'wall', name: 'Ruined Wall', emoji: '🏛️', x: 320, y: 220, w: 260, h: 190, color: 'rgba(148, 163, 184, 0.18)' },
  { id: 'gate', name: 'Exit Gate', emoji: '🔒', x: 580, y: 220, w: 220, h: 340, color: 'rgba(74, 222, 128, 0.12)' },
];

const EXCAVATION_TERRAIN_BY_ZONE = {
  riverbank: 'roomMap:riverbankTerrain',
  burial: 'roomMap:burialTerrain',
  archive: 'roomMap:archiveTerrain',
  market: 'roomMap:marketTerrain',
  wall: 'roomMap:ruinedWallTerrain',
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

const SURVEY_COST = { investigation: -4, time: -8 };
const SURVEY_ZONES = [
  {
    id: 'riverbank',
    name: 'Riverbank',
    prompt: 'Dark river mud and reed marks sit near the edge of the site.',
    clue: 'You notice layers of river silt and plant traces. This area may show how the natural environment shaped where people lived.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible environmental evidence from water, soil or plants.',
    missionHint: 'This may help explain the site, but it does not look like the strongest place for structural evidence.',
  },
  {
    id: 'burial',
    name: 'Burial Area',
    prompt: 'Sunken ground and stone edges suggest an old protected space.',
    clue: 'You notice a cut edge in the ground and signs of a hidden chamber. This area may include a built burial feature, but not every clue here will match the mission.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible burial structures plus other evidence linked to beliefs or records.',
    missionHint: 'This area could help, but the mission evidence may be mixed with non-target finds.',
  },
  {
    id: 'archive',
    name: 'Archive Corner',
    prompt: 'Broken shelves and sealed jars cluster near a shaded wall.',
    clue: 'You notice scraps, sealed containers and marks that look recorded rather than built. This area may preserve messages or records.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible written evidence, symbols or records.',
    missionHint: 'Useful for understanding people, but probably not the best match for structural evidence.',
  },
  {
    id: 'market',
    name: 'Market Area',
    prompt: 'Scattered everyday materials sit near an old activity space.',
    clue: 'You notice small objects and traces of daily work. This area may show what people used, traded or made.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible artefacts, objects or everyday activity evidence.',
    missionHint: 'This area may produce useful discoveries, but it is not the strongest match for the current mission.',
  },
  {
    id: 'wall',
    name: 'Ruined Wall',
    prompt: 'Stone lines and compacted foundations run across the trench.',
    clue: 'You notice a line of stone blocks and compacted foundations. This area may show where people built, changed or protected the site.',
    risk: 'Survey cost: -4 investigation points and -8 seconds.',
    likelyEvidence: 'Possible structures or construction evidence.',
    missionHint: 'This area looks promising for the current Bureau mission.',
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
  { x: 322, y: 238, w: 178, h: 34, label: 'low ruined wall' },
  { x: 98, y: 366, w: 210, h: 28, label: 'broken market stall' },
  { x: 602, y: 360, w: 118, h: 28, label: 'fallen archive shelf' },
  { x: 618, y: 120, w: 32, h: 98, label: 'scorpion path obstacle' },
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
    name: 'sandstorm',
    emoji: '🌪️',
    x: 84,
    y: 96,
    w: 120,
    h: 70,
    color: 'rgba(232, 158, 93, 0.35)',
    penalty: { time: -15 },
    message: 'Sandstorm: time drops by 15 seconds.',
  },
  {
    id: 'falling-rocks',
    name: 'falling rocks',
    emoji: '🪨',
    x: 388,
    y: 292,
    w: 110,
    h: 78,
    color: 'rgba(148, 163, 184, 0.32)',
    penalty: { investigation: -8 },
    message: 'Falling rocks: investigation points drop by 8.',
  },
  {
    id: 'unstable-floor',
    name: 'unstable floor',
    emoji: '⚠️',
    x: 196,
    y: 454,
    w: 118,
    h: 70,
    color: 'rgba(239, 68, 68, 0.25)',
    penalty: { stamina: -18 },
    message: 'Unstable floor: stamina drops by 18.',
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
    message: 'Loose rubble disrupted the trench. Investigation points drop by 8.',
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
    emoji: '👤',
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
    message: 'Tomb Guardian Shadow disrupted your survey. Investigation points and time reduced.',
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
    message: 'Site Watcher Shadow disrupted your survey. Investigation points and time reduced.',
  },
];

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
  { id: 'eg_13', x: 690, y: 94, zone: 'Archive Corner', clueGroup: 'Legacy' },
  { id: 'eg_7', x: 548, y: 340, zone: 'Ruined Wall', clueGroup: 'Society' },
  { id: 'eg_11', x: 128, y: 142, zone: 'Riverbank', clueGroup: 'Geography' },
  { id: 'eg_8', x: 350, y: 310, zone: 'Ruined Wall', clueGroup: 'Society' },
  { id: 'eg_10', x: 140, y: 330, zone: 'Market Area', clueGroup: 'Society' },
  { id: 'eg_9', x: 532, y: 330, zone: 'Ruined Wall', clueGroup: 'Society' },
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
    mapTitle: 'Lost Site Expedition',
    routeMusicCue: 'desert',
    excavationMusicCue: 'baseCamp',
    briefingIntro: 'Survey the site first, choose a dig zone, collect evidence, and prove which civilisation lived here.',
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
    return 'Field rescue needed: stamina reached zero. Restart and take a safer route.';
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

export function ExpeditionMode({ onBackToMenu, audioControls = {} }) {
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
  const [baseCampProgression, setBaseCampProgression] = useState(loadBaseCampProgression);
  const [shopFeedback, setShopFeedback] = useState(null);
  const baseCampProgressionRef = useRef(baseCampProgression);
  const [excavationMapAssets, setExcavationMapAssets] = useState(() => createExcavationMapAssetState());
  const [selectedMapZone, setSelectedMapZone] = useState(null);
  const [enteredMapZone, setEnteredMapZone] = useState(null);
  const [completedZoneChallenges, setCompletedZoneChallenges] = useState(() => new Set());
  const [activeZoneChallenge, setActiveZoneChallenge] = useState(null);
  const [zoneChallengeFeedback, setZoneChallengeFeedback] = useState(null);

  useEffect(() => loadExcavationMapAssetPack({
    baseUrl: import.meta.env.BASE_URL || '/',
    onUpdate: setExcavationMapAssets,
  }), []);

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
  const baseCampOwnedItemIds = useMemo(() => getOwnedItemIds(baseCampProgression), [baseCampProgression]);
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
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
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
      studentMappedType: evidenceTypeId,
      mappingAccurate: accurate,
    };
    const updatedToken = {
      ...inspectionToken,
      mappedZone: zoneName,
      mappedGridSquare: gridSquare,
      mappedEvidenceType: evidenceTypeName,
      studentMappedType: evidenceTypeId,
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
    setExpeditionStage(content.startsAt === 'excavation' ? 'excavation' : 'journey');
    setBaseCampOpen(false);
    setJourneyPaused(false);
    setFieldKit(content.startsAt === 'excavation' ? ['field-guide-page', 'notebook', 'brush', 'trowel', 'camera', 'measuring-tape'] : []);
    setActiveMission(nextMission);
    setJourneyRunId(previous => previous + 1);
    journeySnapshotRef.current = null;
    playerRef.current = { x: 42, y: 498 };
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
    const depositRunId = `${selectedStageId}-${journeyRunId}`;
    const depositResult = applyJourneyShardDeposit(baseCampProgressionRef.current, {
      runId: depositRunId,
      shardCount: journeyShardCount,
    });
    setFieldKit(nextFieldKit);
    baseCampProgressionRef.current = depositResult.progress;
    setBaseCampProgression(depositResult.progress);
    if (depositResult?.deposited) {
      setShopFeedback({
        type: 'deposit',
        title: 'Relic Shards Banked',
        message: `${depositResult.amount} relic shards added to Base Camp supplies.`,
        itemId: null,
      });
    } else if (journeyShardCount > 0) {
      setShopFeedback({
        type: 'deposit',
        title: 'Relic Shards Ready',
        message: `${journeyShardCount} relic shards are already recorded for this run.`,
        itemId: null,
      });
    }
    setBaseCampOpen(true);
    setNotice('Base Camp reached. Check your field kit before excavation.');
    audioControls.playExpeditionMusic?.('baseCamp');
  }, [audioControls, journeyRunId, selectedStageId]);

  const purchaseShopItem = useCallback((itemId) => {
    const purchaseResult = applyShopPurchase(baseCampProgressionRef.current, itemId);
    baseCampProgressionRef.current = purchaseResult.progress;
    setBaseCampProgression(purchaseResult.progress);
    if (purchaseResult?.ok) {
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
    token.mappedEvidenceType = token.mappedEvidenceType || getMapEvidenceTypeName(token.studentMappedType || getMapEvidenceTypeIdForToken(token));
    token.mappingAccurate = token.mappingAccurate ?? (token.studentMappedType ? isMappingAccurate(token, token.studentMappedType) : true);
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
      audioControls.playExpeditionSfx?.('pickupTool');
      audioControls.playExpeditionStinger?.('evidenceDiscovery');
      audioControls.playMatch?.();
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
      audioControls.playExpeditionSfx?.('pickupShard');
      audioControls.playError?.();
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


    // 3. Map Zones with transparent labels
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

      // Label background (Soft rounded card)
      const labelText = zone.name;
      ctx.font = '700 13px Outfit, sans-serif';
      const textWidth = ctx.measureText(labelText).width;
      
      const lx = zone.x + 8;
      const ly = zone.y + 8;
      const lw = textWidth + 18;
      const lh = 24;
      const lr = 4;

      if (!drawExcavationMapRegion(ctx, excavationMapAssets, `${mapUiPackId}:pinnedFieldLabel`, { x: lx - 3, y: ly - 5, w: Math.max(lw + 20, 100), h: 38 }, { alpha: mapTheme.labelAssetAlpha, fit: 'cover' })) {
        ctx.fillStyle = 'rgba(255, 248, 232, 0.9)';
        fillRoundRect(lx, ly, lw, lh, lr);
      }

      ctx.fillStyle = mapTheme.labelText;
      ctx.fillText(labelText, lx + 6, ly + 17);

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
        const surveyLabelText = selectedSurveyZone === zone.id
          ? 'Dig zone marked'
          : surveyedZones.has(zone.id)
            ? 'Surveyed'
            : completedZoneChallenges.has(zone.id)
              ? 'Survey ready'
              : 'Check needed';
        const tagWidth = selectedSurveyZone === zone.id ? 136 : 124;
        const tagAsset = surveyedZones.has(zone.id) ? `${mapUiPackId}:surveyTag` : `${mapUiPackId}:pinnedFieldLabel`;
        const drewTag = drawExcavationMapRegion(ctx, excavationMapAssets, tagAsset, { x: sX - 4, y: sY - 8, w: tagWidth, h: 42 }, { alpha: mapTheme.labelAssetAlpha, fit: 'cover' });
        if (!drewTag) {
          ctx.fillStyle = selectedSurveyZone === zone.id
            ? 'rgba(45, 90, 39, 0.9)'
            : 'rgba(74, 54, 32, 0.86)';
          fillRoundRect(sX, sY, tagWidth - 8, 24, 4);
        }
        if (selectedSurveyZone === zone.id || surveyedZones.has(zone.id)) {
          drawExcavationMapRegion(ctx, excavationMapAssets, selectedSurveyZone === zone.id ? `${mapUiPackId}:mapPin` : `${mapUiPackId}:completedSurveyStamp`, { x: sX + tagWidth - 36, y: sY - 12, w: 30, h: 30 }, { alpha: 0.88, fit: 'contain' });
        } else if (completedZoneChallenges.has(zone.id)) {
          drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:neutralUnlockIcon`, { x: sX + tagWidth - 32, y: sY - 8, w: 24, h: 24 }, { alpha: 0.82, fit: 'contain' });
        } else {
          drawExcavationMapRegion(ctx, excavationMapAssets, `${markerPackId}:neutralQuestionIcon`, { x: sX + tagWidth - 32, y: sY - 8, w: 24, h: 24 }, { alpha: 0.82, fit: 'contain' });
        }

        ctx.fillStyle = selectedSurveyZone === zone.id ? mapTheme.selectedSurveyLabelText : mapTheme.surveyLabelText;
        ctx.font = '800 11px Outfit, sans-serif';
        ctx.fillText(surveyLabelText, sX + 10, sY + 16);
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

      // Label background (Soft card)
      ctx.fillStyle = mapTheme.hazardLabelBackground;
      const labelText = hazard.name;
      ctx.font = '700 12px Outfit, sans-serif';
      const textWidth = ctx.measureText(labelText).width;
      
      // Rounded rect for hazard label
      const hX = hazard.x + 4;
      const hY = hazard.y + 4;
      const hW = textWidth + 12;
      const hH = 22;
      const r = 4;
      ctx.beginPath();
      ctx.moveTo(hX + r, hY);
      ctx.lineTo(hX + hW - r, hY);
      ctx.quadraticCurveTo(hX + hW, hY, hX + hW, hY + r);
      ctx.lineTo(hX + hW, hY + hH - r);
      ctx.quadraticCurveTo(hX + hW, hY + hH, hX + hW - r, hY + hH);
      ctx.lineTo(hX + r, hY + hH);
      ctx.quadraticCurveTo(hX, hY + hH, hX, hY + r);
      ctx.lineTo(hX, hY + r);
      ctx.quadraticCurveTo(hX, hY, hX + r, hY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = mapTheme.hazardLabelText;
      ctx.fillText(labelText, hX + 6, hY + 15);
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
    ctx.shadowColor = gateOpen ? 'rgba(74, 222, 128, 0.4)' : 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    const gateAsset = gateOpen ? `${gatewayPackId}:unlockedExitGate` : `${gatewayPackId}:sealedExitGate`;
    const drewGate = drawExcavationMapRegion(ctx, excavationMapAssets, gateAsset, { x: 710, y: 238, w: 78, h: 132 }, { alpha: 0.96, fit: 'contain' });
    if (!drewGate) {
      ctx.fillStyle = gateOpen ? 'rgba(74, 222, 128, 0.6)' : 'rgba(74, 54, 32, 0.8)';
      ctx.fillRect(724, 258, 54, 108);
    }
    if (!gateOpen) {
      drawExcavationMapRegion(ctx, excavationMapAssets, `${gatewayPackId}:lockedSealIcon`, { x: 734, y: 298, w: 30, h: 28 }, { alpha: 0.92, fit: 'contain' });
    } else {
      drawExcavationMapRegion(ctx, excavationMapAssets, `${gatewayPackId}:unlockedSealIcon`, { x: 735, y: 296, w: 30, h: 28 }, { alpha: 0.9, fit: 'contain' });
    }
    ctx.strokeStyle = gateOpen ? '#166534' : '#3a2a18';
    ctx.lineWidth = gateOpen ? 2 : 3;
    ctx.strokeRect(724, 258, 54, 108);
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = gateOpen ? '#064e3b' : '#fdf6e3';
    ctx.font = '800 13px Outfit, sans-serif';
    ctx.fillText(gateOpen ? 'OPEN' : 'LOCKED', gateOpen ? 736 : 728, 386);
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
      
      const tokenEmoji = '🔍'; // Keep generic so students must inspect to find out what it is
      
      ctx.font = '15px Outfit, sans-serif';
      ctx.fillText(tokenEmoji, token.x - 7, token.y + 5 + floatY);
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

      // Guardian label (Small rounded placard)
      ctx.fillStyle = 'rgba(255, 250, 240, 0.85)';
      ctx.font = '700 11px Outfit, sans-serif';
      const labelWidth = ctx.measureText(guardian.name).width;
      
      const gw = labelWidth + 14;
      const gx = Math.min(Math.max(guardian.x - 22, 8), MAP_WIDTH - gw - 8);
      const gy = guardian.y - 24;
      const gh = 18;
      const gr = 3;

      ctx.beginPath();
      ctx.moveTo(gx + gr, gy); ctx.lineTo(gx + gw - gr, gy);
      ctx.quadraticCurveTo(gx + gw, gy, gx + gw, gy + gr);
      ctx.lineTo(gx + gw, gy + gh - gr);
      ctx.quadraticCurveTo(gx + gw, gy + gh, gx + gw - gr, gy + gh);
      ctx.lineTo(gx + gr, gy + gh);
      ctx.quadraticCurveTo(gx, gy + gh, gx, gy + gr);
      ctx.lineTo(gx, gy + gr);
      ctx.quadraticCurveTo(gx, gy, gx + gr, gy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#3a2a18';
      ctx.fillText(guardian.name, gx + 7, gy + 13);
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
      ctx.font = '700 9px Outfit, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('YOU', player.x + 2, player.y + 15);
    }
  }, [completedZoneChallenges, excavationMapAssets, gatewayPackId, gridZoneConfigs, mapHazards, mapTheme, mapUiPackId, mapWalls, mapZones, markerPackId, missionEvidenceCount, missionRequiredCount, openedGridSquares, roomMapPackId, selectedMapZone, selectedSurveyZone, surveyRevealLinks, surveyedZones, surveyZoneById, terrainByZone]);

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
      update(dt);
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
    setExpeditionStage(stageContent.startsAt === 'excavation' ? 'excavation' : 'journey');
    setBaseCampOpen(false);
    setJourneyPaused(false);
    setFieldKit(stageContent.startsAt === 'excavation' ? ['field-guide-page', 'notebook', 'brush', 'trowel', 'camera', 'measuring-tape'] : []);
    setActiveMission(nextMission);
    setJourneyRunId(previous => previous + 1);
    journeySnapshotRef.current = null;
    playerRef.current = { x: 42, y: 498 };
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
      if (event.detail?.target === 'base-camp') devJumpToBaseCamp();
      if (event.detail?.target === 'excavation') devJumpToExcavation();
    };

    window.addEventListener('expedition-dev-jump', handleExpeditionDevJump);
    return () => window.removeEventListener('expedition-dev-jump', handleExpeditionDevJump);
  }, [devJumpToBaseCamp, devJumpToExcavation, devJumpToJourney]);

  const previewScaffoldAssets = previewExpedition?.scaffold?.runtimeAssets?.length > 0
    ? previewExpedition.scaffold.runtimeAssets
    : previewExpedition?.scaffold?.sourceAssets || [];

  const renderStageSelect = () => (
    <section className="phase-container bureau-phase expedition-phase">
      <div className="expedition-shell expedition-stage-select-shell">
        <header className="expedition-topbar expedition-stage-select-topbar">
          <button type="button" className="bureau-hint-btn" onClick={onBackToMenu}>
            <ChevronLeft size={18} /> Back to Menu
          </button>
          <div className="expedition-title">
            <div className="training-kicker">Lost Site Expedition</div>
            <h2>Choose an Expedition</h2>
          </div>
          <div className="expedition-stage-header-art" aria-label="Upcoming expedition character previews">
            <div className="expedition-stage-character-strip" aria-hidden="true">
              {EXPEDITION_STAGE_HEADER_CHARACTERS.map(character => (
                <img
                  key={character.id}
                  src={`${import.meta.env.BASE_URL}${character.src}`}
                  alt=""
                  className={`expedition-stage-character expedition-stage-character--${character.id}`}
                />
              ))}
            </div>
            <div className="expedition-gate-badge unlocked">
              <Compass size={16} />
              <span>Campaign Map</span>
              <small>Egypt playable now</small>
            </div>
          </div>
        </header>

        <div className="expedition-stage-grid" aria-label="Lost Site Expedition stage selection">
          {EXPEDITION_STAGES.map(stage => (
            <article key={stage.id} className={`expedition-stage-card expedition-stage-card--${stage.statusTone}`}>
              <div className="expedition-stage-card-header">
                <span className="expedition-stage-dossier-tag">{stage.dossierTag}</span>
                <span className={`expedition-stage-status expedition-stage-status--${stage.statusTone}`}>
                  {stage.status}
                </span>
              </div>
              <div className="expedition-stage-card-body">
                <h3>{stage.title}</h3>
                <p>{stage.subtitle}</p>
              </div>
              <p className="expedition-stage-teaser">{stage.teaser}</p>
              <button
                type="button"
                className={`btn ${stage.route === 'playable' || stage.route === 'map-playable' ? 'primary-btn expedition-begin-btn' : 'secondary-btn'} expedition-stage-action`}
                onClick={() => openExpeditionStage(stage)}
              >
                {stage.route === 'playable' || stage.route === 'map-playable' ? <Sparkles size={16} /> : <BookOpen size={16} />}
                {stage.actionLabel}
              </button>
            </article>
          ))}
        </div>
      </div>

      {previewExpedition && (
        <div className="modal-overlay expedition-briefing-overlay">
          <div className="bureau-briefing-modal expedition-stage-preview-modal">
            <div className="expedition-stage-preview-header">
              <span className={`expedition-stage-status expedition-stage-status--${previewExpedition.statusTone}`}>
                {previewExpedition.status}
              </span>
              <h2>{previewExpedition.title}</h2>
              <p>{previewExpedition.subtitle}</p>
            </div>
            <div className="expedition-stage-preview-note">
              <MapIcon size={20} />
              <p>{previewExpedition.previewTeaser || previewExpedition.teaser}</p>
            </div>
            {previewScaffoldAssets.length > 0 && (
              <div className="expedition-stage-preview-assets" aria-label={`${previewExpedition.title} asset previews`}>
                {previewScaffoldAssets.map(asset => (
                  <figure key={asset.id} className="expedition-stage-preview-asset">
                    <img
                      src={`${import.meta.env.BASE_URL}${asset.src}`}
                      alt={asset.title}
                      loading="lazy"
                    />
                    <figcaption>{asset.title}</figcaption>
                  </figure>
                ))}
              </div>
            )}
            <p className="expedition-stage-preview-status">
              This expedition is a preview only for now. It will not launch unfinished gameplay.
            </p>
            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn" onClick={() => setPreviewExpedition(null)}>
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

  if (expeditionStage === 'journey' && !baseCampOpen) {
    return (
      <div className={`expedition-journey-mode-shell ${journeyPaused ? 'is-paused' : ''}`}>
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
        {journeyPaused && (
          <div className="journey-pause-menu" role="dialog" aria-modal="true" aria-label="Expedition options">
            <div className="journey-pause-card">
              <div className="journey-pause-title">Paused</div>
              <button type="button" className="journey-pause-primary" onClick={() => setJourneyPaused(false)}>
                <Play size={16} /> Resume
              </button>
              <div className="journey-pause-controls" aria-label="Controls">
                <div><Keyboard size={15} /><span><kbd>W/A/S/D</kbd> Move and jump</span></div>
                <div><Keyboard size={15} /><span><kbd>J/K</kbd> Use tool</span></div>
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
      <section className="phase-container bureau-phase expedition-phase">
        <div className="expedition-shell expedition-basecamp-shell">
          <header className="expedition-topbar">
            <button type="button" className="bureau-hint-btn" onClick={onBackToMenu}>
              <ChevronLeft size={18} /> Back to Menu
            </button>
            <div className="expedition-title">
              <div className="training-kicker">Lost Site Expedition</div>
              <h2>Base Camp Checklist</h2>
            </div>
            <div className="expedition-gate-badge unlocked">
              <Sparkles size={16} />
              <span>Dig Site Reached</span>
              <small>Prepare for excavation</small>
            </div>
          </header>

          <div className="expedition-basecamp-card">
            <section className="basecamp-intro-section">
              <header className="basecamp-section-header">
                <div className="section-icon-circle">
                  <Backpack size={20} />
                </div>
                <div>
                  <p className="phase-kicker">Expedition Status</p>
                  <h3>Field Kit & Equipment Report</h3>
                </div>
              </header>
              <p className="basecamp-section-description">
                Tools collected on the journey now help with careful excavation, field notes,
                mapping and evidence checks. Missing tools mean the team loses that advantage.
              </p>
            </section>

            <section className="basecamp-mission-section">
              <header className="basecamp-section-header">
                <div className="section-icon-circle">
                  <Target size={20} />
                </div>
                <div>
                  <p className="phase-kicker">Mission Objective</p>
                  <h3>{activeMission.title}</h3>
                </div>
              </header>
              <div className="expedition-mission-card">
                <span className="mission-category-tag">{activeMission.targetCategoryTitle}</span>
                <p className="mission-question"><strong>Inquiry:</strong> {activeMission.inquiryQuestion}</p>
                <p className="mission-instruction">{activeMission.instruction}</p>
              </div>
            </section>

            <section className="basecamp-shop-section">
              <header className="basecamp-section-header">
                <div className="section-icon-circle">
                  <Gem size={20} />
                </div>
                <div>
                  <p className="phase-kicker">Base Camp Shop</p>
                  <h3>Expedition Outfitting Station</h3>
                </div>
              </header>
              <div className="basecamp-shop-summary">
                <div className={`basecamp-shard-bank ${shopFeedback?.type === 'purchase' || shopFeedback?.type === 'deposit' ? 'is-rewarding' : ''}`}>
                  <Gem size={18} />
                  <span>Relic Shards</span>
                  <strong>{baseCampProgression.relicShards}</strong>
                </div>
                <div className="basecamp-shop-summary-copy">
                  <p>Spend collected relic shards on permanent field gear and expedition identity unlocks.</p>
                  <div className="basecamp-active-kit">
                    <span>Active kit</span>
                    {activeBaseCampKitSummary.length > 0 ? (
                      activeBaseCampKitSummary.map(summary => (
                        <strong key={summary}>{summary}</strong>
                      ))
                    ) : (
                      <em>No permanent gear fitted yet</em>
                    )}
                  </div>
                </div>
              </div>
              {shopFeedback && (
                <div className={`basecamp-shop-feedback ${shopFeedback.type}`}>
                  <strong>{shopFeedback.title}</strong>
                  <span>{shopFeedback.message}</span>
                </div>
              )}
              <div className="basecamp-shop-grid">
                {shopItemsBySection.map(group => (
                  <div key={group.section} className="basecamp-shop-category">
                    <h4>{group.section}</h4>
                    <div className="basecamp-shop-items">
                      {group.items.map((item) => {
                        const owned = baseCampOwnedItemIds.has(item.id);
                        const affordable = baseCampProgression.relicShards >= item.cost;
                        const highlighted = shopFeedback?.itemId === item.id && shopFeedback.type === 'purchase';
                        return (
                          <article
                            key={item.id}
                            className={`basecamp-shop-item ${owned ? 'is-owned' : ''} ${highlighted ? 'just-purchased' : ''} ${item.locked ? 'is-locked' : ''}`}
                          >
                            <div className="basecamp-shop-item-main">
                              <div>
                                <strong>{item.name}</strong>
                                <span>{item.shortEffect}</span>
                              </div>
                              <div className="basecamp-shop-cost">
                                <Gem size={14} />
                                {item.cost}
                              </div>
                            </div>
                            {item.routeUse && (
                              <div className="basecamp-shop-route-tag">
                                <Compass size={12} />
                                <span>{item.routeUse}</span>
                              </div>
                            )}
                            <p>{item.description}</p>
                            <button
                              type="button"
                              className="btn basecamp-shop-buy-btn"
                              onClick={() => purchaseShopItem(item.id)}
                              disabled={owned || item.locked || !affordable}
                            >
                              {owned ? 'Owned' : item.locked ? 'Future' : affordable ? 'Buy' : 'Need Shards'}
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="expedition-field-kit-impact-grid">
              {fieldKitImpact.map((tool) => (
                <div key={tool.id} className={`expedition-field-kit-impact ${tool.isCollected ? 'is-collected' : ''}`}>
                  <div className="expedition-impact-header">
                    <div className="expedition-tool-icon-wrapper">
                      <tool.icon size={28} />
                    </div>
                    <div className="expedition-impact-meta">
                      <div className="status-label-row">
                        {tool.isCollected ? (
                          <CheckCircle2 size={12} className="status-icon" />
                        ) : (
                          <ShieldAlert size={12} className="status-icon" />
                        )}
                        <span className="status-label">
                          {tool.isCollected ? 'Equipment Secured' : 'Gear Missing'}
                        </span>
                      </div>
                      <strong>{tool.shortTitle}</strong>
                    </div>
                  </div>
                  <p className="expedition-impact-description">
                    {tool.isCollected ? tool.collectedDesc : tool.missingDesc}
                  </p>
                  <p className="expedition-impact-description">
                    <strong>Field Impact:</strong> {tool.impact}
                  </p>
                </div>
              ))}
            </div>

            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn expedition-begin-btn" onClick={beginExcavationStage}>
                Begin Excavation
              </button>
              <button type="button" className="btn" onClick={resetExpedition}>
                Restart Journey
              </button>
            </div>
          </div>
        </div>
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
            <div className="training-kicker">10-15 mins | Solo Adventure</div>
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
              <h3><Sparkles size={17} /> Mission Target</h3>
              <div className="expedition-mission-card">
                <strong>{activeMission.title}</strong>
                <span>{activeMission.targetCategoryTitle}</span>
                <p><strong>Inquiry question:</strong> {activeMission.inquiryQuestion}</p>
                <p>{activeMission.instruction}</p>
                <div className="expedition-mission-progress">
                  {activeMission.evidenceLabel}: <span>{missionEvidenceCount}/{missionRequiredCount}</span>
                </div>
              </div>
            </section>

            <section className="expedition-panel">
              <h3><MapIcon size={17} /> Survey Before Digging</h3>
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
              <h3><MapIcon size={17} /> Grid Before Excavating</h3>
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
                <div><strong>{resources.investigation}</strong><span>Investigation points</span></div>
                <div><strong>{resources.stamina}</strong><span>Stamina</span></div>
                <div><strong>{Math.floor(resources.time / 60)}:{String(resources.time % 60).padStart(2, '0')}</strong><span>Time</span></div>
              </div>
            </section>

            <section className="expedition-panel">
              <h3><Backpack size={17} /> Field Kit</h3>
              <ul className="expedition-tool-list expedition-tool-impact-list compact">
                {fieldKitImpact.map((tool) => (
                  <li key={tool.id} className={tool.collected ? 'is-collected' : ''}>
                    <span>{tool.name}</span>
                    <strong>{tool.collected ? tool.effect : 'Missing'}</strong>
                    <p>{tool.collected ? tool.detail : tool.baseCampMissing}</p>
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
                <li>unstable floor: lowers stamina</li>
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
        <div className="bureau-briefing-overlay expedition-briefing-overlay">
          <div className="bureau-briefing-modal expedition-mission-briefing-modal">
            <div className="expedition-briefing-stamp">Top Secret</div>
            <h2>Operation: Lost Site Expedition</h2>
            <p>Survey the site first, choose a dig zone, collect evidence, and prove which civilisation lived here.</p>
            
            <div className="expedition-mission-card expedition-briefing-mission">
              <strong>{activeMission.title}</strong>
              <p><strong>Inquiry question:</strong> {activeMission.inquiryQuestion}</p>
              <p><strong>Evidence type:</strong> {activeMission.targetCategoryTitle}</p>
              <p><strong>Needed:</strong> {missionRequiredCount} correct evidence items</p>
              <p>{activeMission.instruction}</p>
            </div>

            <div className="expedition-briefing-rules" aria-label="Mission Rules">
              <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'grid', gap: '0.4rem' }}>
                <li><strong>Search</strong>: {activeMission.briefingRule}</li>
                <li><strong>Survey First</strong>: Evidence is hidden until you survey an area and mark a dig zone.</li>
                <li><strong>Grid Next</strong>: Open grid squares to record where evidence was found before inspecting it.</li>
                <li><strong>Choose Carefully</strong>: Your evidence satchel can only hold 3 items, so you may need to replace weaker evidence.</li>
                <li><strong>Survive</strong>: Avoid hazards that drain your time and stamina.</li>
                <li><strong>Prove</strong>: Make your final claim at the exit using your evidence.</li>
              </ul>
            </div>

            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn expedition-begin-btn" onClick={beginExpedition}>
                Begin Expedition
              </button>
            </div>
          </div>
        </div>
      )}

      {expeditionFailure && (
        <div className="bureau-briefing-overlay">
          <div className="bureau-briefing-modal expedition-rescue-modal">
            <div className="training-kicker">Field Rescue</div>
            <h2>Restart Needed</h2>
            <p>{expeditionFailure.message}</p>
            <p>
              Hazards and monsters can end the expedition if your investigation points,
              stamina or time run out. Restart and plan a safer route through the site.
            </p>
            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn" onClick={resetExpedition}>
                Restart Expedition
              </button>
              <button type="button" className="btn" onClick={onBackToMenu}>
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {surveyReportZone && (
        <div className="bureau-briefing-overlay">
          <div className="bureau-briefing-modal expedition-survey-modal">
            <div className="training-kicker">Survey Report</div>
            <h2>{surveyReportZone.name}</h2>
            <p>{surveyReportZone.clue}</p>

            <div className="expedition-survey-report-grid">
              <section>
                <strong>Likely evidence</strong>
                <span>{surveyReportZone.likelyEvidence}</span>
              </section>
              <section>
                <strong>Mission hint</strong>
                <span>{surveyReportZone.missionHint}</span>
              </section>
              <section>
                <strong>Risk / cost</strong>
                <span>{surveyReportZone.risk}</span>
              </section>
            </div>

            <p className="expedition-survey-process-note">
              Archaeologists survey before digging so they can choose where evidence is most likely to answer the question.
            </p>

            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn" onClick={() => markSurveyZone(surveyReportZone)}>
                Mark as Dig Zone
              </button>
              <button type="button" className="btn" onClick={keepSurveying}>
                Keep Surveying
              </button>
            </div>
          </div>
        </div>
      )}

      {activeChallengeData && (
        <div className="bureau-briefing-overlay expedition-zone-challenge-overlay">
          <div className="bureau-briefing-modal expedition-zone-challenge-modal">
            <div className="training-kicker">Zone Entry Check</div>
            <h2>{activeChallengeData.title}</h2>
            <p>{activeChallengeData.question}</p>

            <div className="expedition-zone-challenge-layout">
              <div className="expedition-zone-challenge-icon" aria-hidden="true" />
              <div className="expedition-zone-answer-list">
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
                    >
                      {answer.text}
                    </button>
                  );
                })}
              </div>
            </div>

            {zoneChallengeFeedback && (
              <div className={`expedition-zone-feedback ${zoneChallengeFeedback.correct ? 'is-correct' : 'is-incorrect'}`}>
                <strong>{zoneChallengeFeedback.correct ? 'Survey unlocked' : 'Try again'}</strong>
                <span>{zoneChallengeFeedback.message}</span>
              </div>
            )}

            <div className="bureau-briefing-actions">
              {zoneChallengeFeedback?.correct ? (
                <button
                  type="button"
                  className="btn primary-btn"
                  onClick={() => {
                    closeZoneChallenge();
                    if (surveyZoneById[activeChallengeData.zoneId]) {
                      openSurveyReport(surveyZoneById[activeChallengeData.zoneId], { skipChallenge: true });
                    }
                  }}
                >
                  Open Survey Report
                </button>
              ) : (
                <button type="button" className="btn" onClick={closeZoneChallenge}>
                  Return to Map
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {gridSetupOpen && selectedSurveyZone && (
        <div className="bureau-briefing-overlay">
          <div className="bureau-briefing-modal expedition-grid-modal">
            <div className="training-kicker">Grid Setup</div>
            <h2>{surveyZoneById[selectedSurveyZone]?.name}</h2>
            <p>
              Archaeologists divide a dig site into grid squares so they can record exactly where evidence was found.
            </p>

            <div className="expedition-mission-card expedition-grid-explainer">
              <strong>Selected dig zone</strong>
              <span>{surveyZoneById[selectedSurveyZone]?.name}</span>
              <p>Open one square at a time. Only evidence linked to opened squares will become visible.</p>
            </div>

            <div className="expedition-grid-square-list">
              {gridSquares.map(square => {
                const isOpened = openedGridSquares.has(square.id);
                const cost = GRID_COSTS[square.risk] || GRID_COSTS.Low;
                return (
                  <article key={square.id} className={`expedition-grid-square ${isOpened ? 'is-opened' : ''}`}>
                    <strong>{square.id}</strong>
                    <span>Risk: {square.risk}</span>
                    <p>{square.clue}</p>
                    <div className="expedition-grid-square-meta">
                      <small>{square.possibleEvidenceHint}</small>
                      <small>
                        Cost: {cost.investigation} investigation, {cost.time} seconds
                      </small>
                    </div>
                    <button type="button" className="btn primary-btn" onClick={() => openGridSquare(square)}>
                      {isOpened ? 'Open Grid Square Again' : 'Open Grid Square'}
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="expedition-grid-review">
              <strong>{activeMission.title}</strong>
              <span>{activeMission.instruction}</span>
            </div>

            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn" onClick={keepExploringGrid}>
                Keep Exploring
              </button>
              <button type="button" className="btn" onClick={() => setNotice(`${activeMission.title}: ${activeMission.instruction}`)}>
                Review Mission
              </button>
            </div>
          </div>
        </div>
      )}

      {inspectionToken && (
        <div className="bureau-briefing-overlay">
          <div className="bureau-briefing-modal expedition-inspection-modal">
            <div className="training-kicker">Inspect Evidence</div>
            <h2>{inspectionToken.name}</h2>
            <div className="expedition-inspection-meta">Unclassified field evidence</div>
            <p>{inspectionToken.clue}</p>
            <div className="expedition-inspection-clue-group">Field context: {inspectionToken.zone}</div>
            {fieldKitEffects.fieldGuideAvailable && !inspectionFeedback && (
              <div className="expedition-tool-effect-hint">
                <strong>Field Guide Hint</strong>
                <span>
                  Look at the material, shape, location and clue before deciding how to classify this evidence.
                </span>
              </div>
            )}
            {fieldKitEffects.notebookReady && !inspectionFeedback && (
              <div className="expedition-tool-effect-hint">
                <strong>Notebook Ready</strong>
                <span>Excavation method choices and rejected evidence are recorded as field notes.</span>
              </div>
            )}

            {!inspectionFeedback && inspectionStep === 'excavate' && (
              <div className="expedition-excavation-method-panel">
                <div className="expedition-inspection-question">Choose an excavation method before collecting evidence.</div>
                <p className="expedition-survey-process-note">
                  Archaeologists excavate carefully so the evidence and its location stay useful.
                </p>
                <div className="expedition-excavation-method-grid">
                  {EXCAVATION_METHODS.map(method => {
                    const costText = `${method.cost.investigation} investigation, ${method.cost.time} seconds`;
                    return (
                      <article key={method.id} className="expedition-excavation-method-card">
                        <strong>{method.name}</strong>
                        <span>{method.bestFor}</span>
                        <p>Cost: {costText}</p>
                        <p>Likely quality: depends on the find and method choice.</p>
                        <button type="button" className="btn primary-btn" onClick={() => chooseExcavationMethod(method.id)}>
                          Choose Method
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {!inspectionFeedback && inspectionStep === 'map' && (
              <div className="expedition-map-panel">
                <div className="expedition-inspection-question">Map the Find</div>
                <p className="expedition-survey-process-note">
                  Archaeologists record where evidence is found. This helps them understand the evidence in context.
                </p>

                <div className="expedition-map-summary">
                  <section>
                    <strong>Zone</strong>
                    <span>{getSurveyZoneName(selectedSurveyZone, surveyZoneById) || 'Unknown'}</span>
                  </section>
                  <section>
                    <strong>Grid Square</strong>
                    <span>{selectedGridSquare || 'Unknown'}</span>
                  </section>
                  <section>
                    <strong>Evidence Type</strong>
                    <span>{selectedMappedEvidenceType ? getMapEvidenceTypeName(selectedMappedEvidenceType) : 'Choose one below'}</span>
                  </section>
                </div>

                {fieldKitEffects.fieldGuideAvailable && (
                  <div className="expedition-tool-effect-hint">
                    <strong>Field Guide Hint</strong>
                    <span>
                      Use the clue and location record to choose the evidence type. The field guide will not choose the category for you.
                    </span>
                  </div>
                )}

                <div className="expedition-map-type-grid">
                  {MAP_EVIDENCE_TYPES.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      className={`expedition-map-type-btn ${selectedMappedEvidenceType === type.id ? 'is-selected' : ''}`}
                      onClick={() => setSelectedMappedEvidenceType(type.id)}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>

                {mappingFeedback && (
                  <div className={`expedition-claim-feedback ${mappingFeedback.accurate ? 'correct' : 'incorrect'}`}>
                    <CheckCircle2 size={20} />
                    <div>
                      <strong>{mappingFeedback.accurate ? 'Mapping complete' : 'Mapping recorded'}</strong>
                      <p>{mappingFeedback.text}</p>
                    </div>
                  </div>
                )}

                <div className="bureau-briefing-actions">
                  <button
                    type="button"
                    className="btn primary-btn"
                    onClick={recordMappedFind}
                    disabled={!selectedMappedEvidenceType}
                  >
                    Record Map
                  </button>
                </div>
              </div>
            )}

            {selectedExcavationMethod && !inspectionFeedback && inspectionStep !== 'excavate' && (
              <div className="expedition-tool-effect-hint match">
                <strong>{selectedExcavationMethod.methodName} used</strong>
                <span>
                  Evidence quality: {selectedExcavationMethod.quality}. {selectedExcavationMethod.feedback}
                  {selectedExcavationMethod.kitFeedback ? ` ${selectedExcavationMethod.kitFeedback}` : ''}
                </span>
              </div>
            )}

            {inspectionStep === 'review' && mappingFeedback && !inspectionFeedback && (
              <div className={`expedition-tool-effect-hint ${mappingFeedback.accurate ? 'match' : 'miss'}`}>
                <strong>{mappingFeedback.accurate ? 'Mapping accurate' : 'Mapping needs review'}</strong>
                <span>{mappingFeedback.text}</span>
              </div>
            )}

            {inspectionStep === 'review' && (
              <div className="expedition-inspection-question">Does this evidence match your mission?</div>
            )}

            {!inspectionFeedback && inspectionStep === 'review' && (
              <div className="expedition-inspection-actions">
                <button
                  type="button"
                  className="btn primary-btn"
                  onClick={() => inspectMissionChoice(true)}
                >
                  Secure as mission evidence
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => inspectMissionChoice(false)}
                >
                  Not mission evidence - keep searching
                </button>
              </div>
            )}

            {!inspectionFeedback && inspectionStep === 'capacity' && pendingEvidence && (
              <div className="expedition-satchel-decision">
                <div className="expedition-satchel-mission-banner">
                  <div className="training-kicker">Bureau Mission</div>
                  <strong>{activeMission.title}</strong>
                  <p className="inquiry"><strong>Inquiry:</strong> {activeMission.inquiryQuestion}</p>
                  <div className="expedition-mission-progress">
                    Progress: <span>{missionEvidenceCount} / {missionRequiredCount} {activeMission.evidenceLabel} secured</span>
                  </div>
                </div>

                <p className="expedition-satchel-decision-note">
                  <strong>Satchel Full!</strong> Archaeologists must choose evidence that answers the inquiry question. Review the items below.
                </p>

                <div className="expedition-satchel-decision-columns">
                  <section className="expedition-satchel-column">
                    <h3>Current Satchel (3/3)</h3>
                    <div className="expedition-evidence-list">
                      {satchelContents.map(item => (
                        <article key={item.id} className={`expedition-evidence-item ${item.matchesMission ? 'is-mission' : 'is-general'}`}>
                          <div className={`item-label ${item.matchesMission ? 'mission' : 'general'}`}>
                            {item.matchesMission ? 'Mission Evidence' : 'General Discovery'}
                          </div>
                          <strong>{item.name}</strong>
                          <span>{item.category} | {item.zone}</span>
                          {item.evidenceQuality && <span>Quality: {item.evidenceQuality}</span>}
                          <p>{item.clue}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="expedition-satchel-column new-evidence-column">
                    <h3>New Evidence</h3>
                    <article className={`expedition-evidence-item new-evidence-card ${pendingEvidence.matchesMission ? 'is-mission' : 'is-general'}`}>
                      <div className={`item-label ${pendingEvidence.matchesMission ? 'mission' : 'general'}`}>
                        {pendingEvidence.matchesMission ? 'Mission Evidence' : 'General Discovery'}
                      </div>
                      <strong>{pendingEvidence.name}</strong>
                      <span>{pendingEvidence.category} | {pendingEvidence.zone}</span>
                      {pendingEvidence.evidenceQuality && <span>Quality: {pendingEvidence.evidenceQuality}</span>}
                      <p>{pendingEvidence.clue}</p>
                      <div className={`new-evidence-advice ${pendingEvidence.matchesMission ? 'positive' : 'negative'}`}>
                        {pendingEvidence.matchesMission 
                          ? '✅ This answers the inquiry question.' 
                          : '❌ This does not answer the inquiry question.'}
                      </div>
                    </article>
                    
                    <div className="expedition-inventory-choice-actions stack-actions">
                      <button
                        type="button"
                        className="btn primary-btn"
                        onClick={() => setInspectionStep('replace')}
                      >
                        Replace an item
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => rejectInspectedEvidence(inspectionToken)}
                      >
                        Leave new evidence
                      </button>
                      <button
                        type="button"
                        className="btn outline-btn"
                        onClick={() => setInspectionStep('mission')}
                      >
                        Review mission
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {!inspectionFeedback && inspectionStep === 'mission' && pendingEvidence && (
              <div className="expedition-mission-review">
                <div className="expedition-mission-card expedition-satchel-summary-card">
                  <strong>{activeMission.title}</strong>
                  <span>{activeMission.targetCategoryTitle}</span>
                  <p><strong>Inquiry question:</strong> {activeMission.inquiryQuestion}</p>
                  <p><strong>Target evidence type:</strong> {activeMission.targetEvidenceType}</p>
                  <p><strong>Mission rule:</strong> {activeMission.briefingRule}</p>
                  <p>{activeMission.instruction}</p>
                </div>
                <p className="expedition-mission-review-note">This review does not change your satchel. It just helps you decide what evidence matters most.</p>
                <button type="button" className="btn" onClick={() => setInspectionStep('capacity')}>
                  Back to satchel decision
                </button>
              </div>
            )}

            {!inspectionFeedback && inspectionStep === 'replace' && pendingEvidence && (
              <div className="expedition-replacement-picker">
                <p>Choose one item to replace with the new evidence.</p>
                <div className="expedition-replacement-grid">
                  {satchelContents.map(item => (
                    <button
                      type="button"
                      key={item.id}
                      className="expedition-replacement-card"
                      onClick={() => finishInspection(inspectionToken, item.id)}
                    >
                      <strong>{item.name}</strong>
                      <span>{item.category} | {item.zone}</span>
                      {item.evidenceQuality && <span>Quality: {item.evidenceQuality}</span>}
                      <span className="expedition-evidence-clue-group">{item.missionLabel}</span>
                      <span className="expedition-replacement-action">Replace {item.name}</span>
                    </button>
                  ))}
                </div>
                <button type="button" className="btn" onClick={() => setInspectionStep('capacity')}>
                  Back
                </button>
              </div>
            )}

            {inspectionFeedback && (
              <div className={`expedition-claim-feedback ${inspectionFeedback.correct ? 'correct' : 'incorrect'}`}>
                {inspectionFeedback.correct ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
                <div>
                  <strong>{inspectionFeedback.correct ? 'Evidence verified' : 'Evidence collected'}</strong>
                  <p>{inspectionFeedback.text}</p>
                </div>
                <span className={`expedition-evidence-stamp ${inspectionFeedback.correct ? 'verified' : 'collected'}`}>
                  {inspectionFeedback.stamp}
                </span>
              </div>
            )}

            {inspectionStep === 'mission' && !inspectionFeedback && (
              <div className="bureau-briefing-actions">
                <button type="button" className="btn" onClick={() => setInspectionStep('capacity')}>
                  Return to satchel decision
                </button>
              </div>
            )}

            {(inspectionFeedback || inspectionStep === 'review') && (
              <div className="bureau-briefing-actions">
                <button type="button" className="btn" onClick={closeInspection}>
                  {inspectionFeedback ? 'Continue Expedition' : 'Keep Looking'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {claimOpen && (
        <div className="bureau-briefing-overlay">
          <div className="bureau-briefing-modal expedition-claim-modal">
            <div className="training-kicker">Final Expedition Claim</div>
            <h2>Identify the Lost Site</h2>
            <p>Choose the civilisation and the collected evidence that best supports your claim.</p>

            <label className="expedition-claim-field">
              <span>Civilisation</span>
              <select value={selectedCivilisation} onChange={(event) => setSelectedCivilisation(event.target.value)}>
                <option value="">Choose a civilisation</option>
                {claimCivilisations.map(civilisation => (
                  <option key={civilisation} value={civilisation}>{civilisation}</option>
                ))}
              </select>
            </label>

            <label className="expedition-claim-field">
              <span>Best supporting evidence</span>
              <select value={selectedEvidenceId} onChange={(event) => setSelectedEvidenceId(event.target.value)}>
                <option value="">Choose collected evidence</option>
                {collectedEvidence.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>

            {claimResult && (
              <div className={`expedition-claim-feedback ${claimResult.correct ? 'correct' : 'incorrect'}`}>
                {claimResult.correct ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
                <div>
                  <strong>{claimResult.sentence}</strong>
                  <p>{claimResult.feedback}</p>
                </div>
              </div>
            )}

            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn" onClick={submitClaim}>
                Submit Claim
              </button>
              {claimResult?.correct ? (
                <button type="button" className="btn" onClick={resetExpedition}>
                  Play Again
                </button>
              ) : (
                <button type="button" className="btn" onClick={() => {
                  playerRef.current = { x: 676, y: 304 };
                  lockedRef.current = false;
                  setClaimOpen(false);
                }}>
                  Return to Site
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {resultOpen && (
        <div className="bureau-briefing-overlay">
          <div className="bureau-briefing-modal expedition-result-modal">
            <div className="training-kicker">Run Result</div>
            <div className="expedition-result-header">
              <div>
                <h2>{finalRank}</h2>
                <p>{resultFeedback}</p>
              </div>
              <div className="expedition-score-badge">
                <strong>{finalScore}</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="expedition-result-grid">
              <section className="expedition-result-card">
                <h3>Mission Result</h3>
                <dl>
                  <div><dt>Mission</dt><dd>{activeMission.title}</dd></div>
                  <div><dt>Mission evidence</dt><dd>{missionComplete ? 'Secured' : 'Not secured'}</dd></div>
                  <div><dt>Collected</dt><dd>{missionEvidenceCount}/{missionRequiredCount} {activeMission.targetCategoryTitle}</dd></div>
                  <div><dt>Exit Gate</dt><dd>{exitUnlocked ? 'Unlocked' : 'Locked'}</dd></div>
                </dl>
              </section>

              <section className="expedition-result-card">
                <h3>Final Claim</h3>
                <dl>
                  <div><dt>Civilisation</dt><dd>{selectedCivilisation || 'Not chosen'}</dd></div>
                  <div><dt>{targetCivilisation} match</dt><dd>{claimCorrect ? 'Yes' : 'No'}</dd></div>
                  <div><dt>Supporting evidence</dt><dd>{selectedEvidence?.name || 'Not chosen'}</dd></div>
                  <div><dt>Evidence support</dt><dd>{evidenceSupportsClaim ? `Supports ${targetCivilisation}` : `Does not support ${targetCivilisation}`}</dd></div>
                </dl>
                {claimResult && (
                  <div className={`expedition-claim-feedback ${claimResult.correct ? 'correct' : 'incorrect'}`}>
                    {claimResult.correct ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    <div>
                      <strong>{claimResult.sentence}</strong>
                      <p>{claimResult.feedback}</p>
                    </div>
                  </div>
                )}
              </section>

              <section className="expedition-result-card expedition-result-card-wide">
                <h3>Field Performance</h3>
                <div className="expedition-result-stats">
                  <span>Time: <strong>{resources.time}s</strong></span>
                  <span>Stamina: <strong>{resources.stamina}</strong></span>
                  <span>Investigation: <strong>{resources.investigation}</strong></span>
                  <span>Evidence: <strong>{collectedEvidence.length}/{MAX_EVIDENCE_ITEMS}</strong></span>
                  <span>Field notes: <strong>{fieldNotes.length}</strong></span>
                  <span>Tool bonus: <strong>+{fieldKitBonus}</strong></span>
                  <span>Quality impact: <strong>{evidenceQualityBonus >= 0 ? `+${evidenceQualityBonus}` : evidenceQualityBonus}</strong></span>
                </div>
                <div className="expedition-result-lists">
                  <div>
                    <strong>Tools collected</strong>
                    <p>{collectedTools.length > 0 ? collectedTools.map(tool => tool.name).join(', ') : 'No tools collected'}</p>
                  </div>
                  <div>
                    <strong>Missing tools</strong>
                    <p>{missingTools.length > 0 ? missingTools.map(tool => tool.name).join(', ') : 'No tools missing'}</p>
                  </div>
                  <div>
                    <strong>Evidence collected</strong>
                    <p>{collectedEvidence.length > 0 ? collectedEvidence.map(item => `${item.name} (${item.evidenceQuality || 'good'})`).join(', ') : 'No evidence collected'}</p>
                  </div>
                  <div>
                    <strong>Field notes recorded</strong>
                    <p>{fieldNotes.length > 0 ? fieldNotes.map(note => note.name).join(', ') : 'No field notes recorded'}</p>
                  </div>
                </div>
              </section>

              <section className="expedition-result-card expedition-result-card-wide">
                <h3>Evidence Quality</h3>
                <div className="expedition-result-stats">
                  <span>Excellent: <strong>{evidenceQualitySummary.excellent}</strong></span>
                  <span>Good: <strong>{evidenceQualitySummary.good}</strong></span>
                  <span>Damaged: <strong>{evidenceQualitySummary.damaged}</strong></span>
                </div>
                <p className="expedition-quality-feedback">
                  {evidenceQualitySummary.damaged > 0
                    ? 'Some evidence was damaged by rushed excavation. It can still support a claim, but careful excavation is more reliable.'
                  : 'Careful excavation improved the reliability of your evidence.'}
                </p>
              </section>

              <section className="expedition-result-card expedition-result-card-wide">
                <h3>Mapping Accuracy</h3>
                <div className="expedition-result-stats">
                  <span>Mapped finds: <strong>{mappingAccuracySummary.mapped}</strong></span>
                  <span>Accurate: <strong>{mappingAccuracySummary.accurate}</strong></span>
                  <span>Needs review: <strong>{mappingAccuracySummary.needsReview}</strong></span>
                </div>
                <p className="expedition-quality-feedback">
                  {fieldKitEffects.measuringTapeReady
                    ? 'Measuring Tape used: grid locations were recorded clearly.'
                    : 'Measuring Tape was not collected, so location records were a little less precise.'}
                </p>
              </section>

              <section className="expedition-result-card expedition-result-card-wide">
                <h3>Field Kit Impact</h3>
                <div className="expedition-field-kit-impact-grid">
                  {fieldKitImpact.map((tool) => (
                    <article key={tool.id} className={`expedition-field-kit-impact ${tool.collected ? 'is-collected' : ''}`}>
                      <strong>{tool.name}</strong>
                      <span>{tool.collected ? tool.effect : 'Missed advantage'}</span>
                      <p>{tool.detail}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn" onClick={resetExpedition}>
                Play Again
              </button>
              <button type="button" className="btn" onClick={onBackToMenu}>
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
