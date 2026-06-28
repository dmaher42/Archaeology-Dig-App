// Extracted from ExpeditionMode.jsx — pure module-level HELPER functions for the excavation dig.
// Pure logic only: no React, no component state. Data lives in expeditionDigData.js.

import { SCENARIOS } from '../data';
import { getCategoryTitle } from '../utils/gameLogic';
import {
  BASE_CAMP_PROGRESSION_STORAGE_KEY,
  createDefaultProgression,
  normalizeBaseCampProgression,
} from './expedition/baseCampShop';
import { PLAYABLE_EXPEDITION_STAGE_ID } from './expedition/expeditionStages';
import {
  CHINA_TOOL_EFFECT_OVERRIDES,
  EGYPT_TOOL_EFFECT_OVERRIDES,
  EVIDENCE_HUNT_MISSIONS,
  EVIDENCE_MISSION_TYPE_MAP,
  EXCAVATION_GUARDIANS,
  EXCAVATION_METHOD_BY_ID,
  EXPEDITION_MAP_CONTENT,
  GRID_ZONE_CONFIGS,
  MAP_EVIDENCE_TYPE_BY_ID,
  MAP_EVIDENCE_TYPE_BY_MISSION_TYPE,
  PLAYER_SIZE,
  RANK_BANDS,
  ROME_TOOL_EFFECT_OVERRIDES,
  SURVEY_REVEAL_LINKS,
  SURVEY_ZONES,
  SURVEY_ZONE_BY_ID,
  TOOL_EFFECTS,
  ZONES,
} from './expeditionDigData.js';

export const getToolEffectOverridesForCivilisation = (targetCivilisation) => {
  const civ = String(targetCivilisation || '').toLowerCase();
  if (civ.includes('china')) return CHINA_TOOL_EFFECT_OVERRIDES;
  if (civ.includes('rome')) return ROME_TOOL_EFFECT_OVERRIDES;
  return EGYPT_TOOL_EFFECT_OVERRIDES;
};
export const getToolEffectsForCivilisation = (toolId, targetCivilisation) => ({
  ...(TOOL_EFFECTS[toolId] || {}),
  ...(getToolEffectOverridesForCivilisation(targetCivilisation)[toolId] || {}),
});
export const getExplorerProfileFitLine = (targetCivilisation) => {
  const civ = String(targetCivilisation || '').toLowerCase();
  if (civ.includes('china')) return 'river valleys, rammed-earth walls and archive routes';
  if (civ.includes('rome')) return 'stone roads, Forum ruins and buried civic spaces';
  return 'harsh Egyptian sands';
};
export const getExpeditionMapContent = (stageId = PLAYABLE_EXPEDITION_STAGE_ID) => (
  EXPEDITION_MAP_CONTENT[stageId] || EXPEDITION_MAP_CONTENT[PLAYABLE_EXPEDITION_STAGE_ID]
);

export const normaliseEvidenceTypeForMission = (type) => (
  type === 'environment' ? 'environmental' : type
);

export const getMissionEvidenceType = (type) => EVIDENCE_MISSION_TYPE_MAP[type] || normaliseEvidenceTypeForMission(type);

export const evidenceMatchesMission = (token, mission) => (
  token?.missionType === mission?.targetEvidenceType
);

export const getMapEvidenceTypeIdForToken = (token) => (
  MAP_EVIDENCE_TYPE_BY_MISSION_TYPE[token?.missionType] || 'structure'
);

export const getMapEvidenceTypeName = (typeId) => MAP_EVIDENCE_TYPE_BY_ID[typeId]?.name || typeId || 'Unknown';

export const isMappingAccurate = (token, typeId) => (
  getMapEvidenceTypeIdForToken(token) === typeId
);

export const quickDigDamagesEvidence = (token, mission) => (
  evidenceMatchesMission(token, mission)
);

export const getExcavationOutcome = (methodId, token, fieldKitEffects, mission) => {
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

export const getEvidenceMissionLabel = (token, mission) => (
  evidenceMatchesMission(token, mission) ? 'Mission evidence' : 'General discovery'
);

export const getRankTitle = (score) => RANK_BANDS.find(rank => score >= rank.min)?.title || RANK_BANDS[RANK_BANDS.length - 1].title;

export const getRankFeedback = (score) => {
  if (score >= 90) {
    return 'Excellent fieldwork. You used evidence carefully and made a strong historical claim.';
  }
  if (score >= 60) {
    return 'Good work. You found useful evidence, but your claim or field preparation could be stronger.';
  }
  return 'You need more training. Review the mission, collect useful tools, and choose evidence that supports your claim.';
};

export const getResourceFailureMessage = (resources) => {
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

export const chooseEvidenceHuntMission = (previousMissionId = null, missions = EVIDENCE_HUNT_MISSIONS) => {
  const choices = missions.filter(mission => mission.id !== previousMissionId);
  const pool = choices.length > 0 ? choices : missions;
  return pool[Math.floor(Math.random() * pool.length)];
};

export const getMissionRequiredCount = (mission) => mission?.requiredTargetCount || 1;

export const buildExcavationGuardians = (guardians = EXCAVATION_GUARDIANS) => guardians.map(guardian => ({
  ...guardian,
  targetIndex: 1,
}));

export const rectsOverlap = (a, b) => (
  a.x < b.x + b.w &&
  a.x + a.w > b.x &&
  a.y < b.y + b.h &&
  a.y + a.h > b.y
);

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const getPlayerRect = (player) => ({
  x: player.x,
  y: player.y,
  w: PLAYER_SIZE,
  h: PLAYER_SIZE,
});

export const getZoneName = (player, zones = ZONES, fallbackName = 'Open Trench') => {
  const centre = { x: player.x + PLAYER_SIZE / 2, y: player.y + PLAYER_SIZE / 2 };
  return zones.find(zone => (
    centre.x >= zone.x && centre.x <= zone.x + zone.w &&
    centre.y >= zone.y && centre.y <= zone.y + zone.h
  ))?.name || fallbackName;
};

export const getActiveZone = (player, zones = ZONES) => {
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


export const getSurveyZoneAtPlayer = (player, surveyZones = SURVEY_ZONES, zones = ZONES) => {
  const centre = { x: player.x + PLAYER_SIZE / 2, y: player.y + PLAYER_SIZE / 2 };
  const zone = surveyZones.find(item => {
    const mapZone = zones.find(mapItem => mapItem.id === item.id);
    return mapZone && centre.x >= mapZone.x && centre.x <= mapZone.x + mapZone.w &&
      centre.y >= mapZone.y && centre.y <= mapZone.y + mapZone.h;
  });
  return zone || null;
};

export const getGridSquaresForZone = (zoneId, gridZoneConfigs = GRID_ZONE_CONFIGS) => gridZoneConfigs[zoneId] || [];

export const evidenceVisibleForGrid = (token, selectedSurveyZone, openedGridSquares, surveyRevealLinks = SURVEY_REVEAL_LINKS, gridZoneConfigs = GRID_ZONE_CONFIGS) => {
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

export const getOpenedGridSquareForEvidence = (token, selectedSurveyZone, openedGridSquares, gridZoneConfigs = GRID_ZONE_CONFIGS) => (
  getGridSquaresForZone(selectedSurveyZone, gridZoneConfigs).find(square => (
    openedGridSquares?.has(square.id) && square.linkedEvidenceIds.includes(token.id)
  ))?.id || null
);

export const getSurveyZoneName = (zoneId, surveyZoneById = SURVEY_ZONE_BY_ID) => (
  zoneId ? surveyZoneById[zoneId]?.name || zoneId : null
);

export const loadBaseCampProgression = () => {
  if (typeof window === 'undefined') return createDefaultProgression();
  try {
    const saved = window.localStorage.getItem(BASE_CAMP_PROGRESSION_STORAGE_KEY);
    return normalizeBaseCampProgression(saved ? JSON.parse(saved) : null);
  } catch {
    return createDefaultProgression();
  }
};

export const saveBaseCampProgression = (progression) => {
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

export const buildExpeditionEvidence = (content = getExpeditionMapContent()) => {
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
