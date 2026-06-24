import * as EgyptData from './journeyLevelData.js';
import * as ChinaData from './chinaJourneyData.js';
import * as RomeData from './romeJourneyData.js';
import journeyPlacementOverrides from './journeyPlacementOverrides.generated.js';
import journeyPropBlendOverrides from './journeyPropBlendOverrides.js';
import { applyJourneyPlacementOverrides } from './journeyPlacementOverrides.js';

let currentCiv = 'Ancient Egypt';

const EgyptEditorPlacementData = applyJourneyPlacementOverrides({
  enemies: EgyptData.ENEMIES,
  props: EgyptData.STORY_PROPS,
  platforms: EgyptData.PLATFORMS,
  hazards: EgyptData.HAZARDS,
  routeGates: EgyptData.ROUTE_GATES,
  routeGateDoorways: EgyptData.ROUTE_GATE_DOORWAYS,
  hiddenRoutes: EgyptData.HIDDEN_ROUTES,
  checkpoints: EgyptData.CHECKPOINTS,
  miniBosses: EgyptData.MINI_BOSSES,
}, journeyPlacementOverrides);

// Small, hand-authored polish layer for scene-blending fixes that should survive
// future editor exports. Use this for deliberate fake-bury/contact-strip passes,
// not broad room layout changes.
const EgyptPlacementData = applyJourneyPlacementOverrides(EgyptEditorPlacementData, journeyPropBlendOverrides);

export const setExpeditionJourneyCiv = (civ) => {
  currentCiv = civ;
};

const getCivSource = (egyptObj, chinaObj, romeObj) => {
  const civ = typeof currentCiv === 'string' ? currentCiv.toLowerCase() : '';
  if (civ.includes('rome') && romeObj) return romeObj;
  if (civ.includes('china') && chinaObj) return chinaObj;
  return egyptObj;
};

const makeProxy = (egyptObj, chinaObj, romeObj) => {
  if (!egyptObj) return undefined;
  return new Proxy(egyptObj, {
    get(target, prop) {
      const source = getCivSource(target, chinaObj, romeObj);
      const value = source[prop];
      return typeof value === 'function' ? value.bind(source) : value;
    },
  });
};

export const SECTIONS = makeProxy(EgyptData.SECTIONS, ChinaData.CHINA_SECTIONS, RomeData.ROME_JOURNEY_SECTIONS);
export const SECTION_COPY = makeProxy(EgyptData.SECTION_COPY, ChinaData.CHINA_SECTION_COPY, RomeData.ROME_SECTION_COPY);
export const PLATFORMS = makeProxy(EgyptPlacementData.platforms, ChinaData.CHINA_PLATFORMS, RomeData.ROME_JOURNEY_PLATFORMS);
export const HAZARDS = makeProxy(EgyptPlacementData.hazards, ChinaData.CHINA_HAZARDS, RomeData.ROME_HAZARDS);
export const ROUTE_GATES = makeProxy(EgyptPlacementData.routeGates, ChinaData.CHINA_ROUTE_GATES, RomeData.ROME_ROUTE_GATES);
export const ROUTE_GATE_DOORWAYS = makeProxy(EgyptPlacementData.routeGateDoorways, ChinaData.CHINA_ROUTE_GATE_DOORWAYS || [], RomeData.ROME_ROUTE_GATE_DOORWAYS || []);
export const SCARAB_SEAL_TRIGGER = makeProxy(EgyptData.SCARAB_SEAL_TRIGGER, ChinaData.CHINA_SCARAB_SEAL_TRIGGER, RomeData.ROME_OPENING_TRIGGER);
export const TOOL_LAYOUT = makeProxy(EgyptData.TOOL_LAYOUT, ChinaData.CHINA_TOOL_LAYOUT, RomeData.ROME_JOURNEY_TOOL_LAYOUT);
export const RELIC_SHARDS = makeProxy(EgyptData.RELIC_SHARDS, ChinaData.CHINA_RELIC_SHARD_LAYOUT, RomeData.ROME_RELIC_SHARD_LAYOUT);
export const BOSS_KEY_ITEMS = makeProxy(EgyptData.BOSS_KEY_ITEMS, ChinaData.CHINA_BOSS_KEY_ITEMS, RomeData.ROME_BOSS_KEY_ITEMS);
export const STORY_PROPS = makeProxy(EgyptPlacementData.props, ChinaData.CHINA_STORY_PROPS, RomeData.ROME_STORY_PROPS);
export const SECTION_ATMOSPHERES = makeProxy(EgyptData.SECTION_ATMOSPHERES, ChinaData.CHINA_SECTION_ATMOSPHERES, RomeData.ROME_SECTION_ATMOSPHERES);
export const CHECKPOINTS = makeProxy(EgyptPlacementData.checkpoints, ChinaData.CHINA_CHECKPOINTS, RomeData.ROME_CHECKPOINTS);
export const ENVIRONMENT_INTERACTIONS = makeProxy(EgyptData.ENVIRONMENT_INTERACTIONS, ChinaData.CHINA_ENVIRONMENT_INTERACTIONS, RomeData.ROME_ENVIRONMENT_INTERACTIONS);
export const HIDDEN_ROUTES = makeProxy(EgyptPlacementData.hiddenRoutes, ChinaData.CHINA_HIDDEN_ROUTES, RomeData.ROME_HIDDEN_ROUTES);
export const STAGE_ENTRANCE_FEATURES = makeProxy(EgyptData.STAGE_ENTRANCE_FEATURES, ChinaData.CHINA_STAGE_ENTRANCE_FEATURES, RomeData.ROME_STAGE_ENTRANCE_FEATURES);
export const ENVIRONMENT_EVENTS = makeProxy(EgyptData.ENVIRONMENT_EVENTS, ChinaData.CHINA_ENVIRONMENT_EVENTS, RomeData.ROME_ENVIRONMENT_EVENTS);
export const SECTION_OBJECTIVES = makeProxy(EgyptData.SECTION_OBJECTIVES, ChinaData.CHINA_SECTION_OBJECTIVES, RomeData.ROME_SECTION_OBJECTIVES);
export const OBJECTIVE_MARKERS = makeProxy(EgyptData.OBJECTIVE_MARKERS, ChinaData.CHINA_OBJECTIVE_MARKERS, RomeData.ROME_OBJECTIVE_MARKERS);
export const SECRET_COLLECTIBLES = makeProxy(EgyptData.SECRET_COLLECTIBLES, ChinaData.CHINA_SECRET_COLLECTIBLES, RomeData.ROME_SECRET_COLLECTIBLES);
export const LORE_TABLETS = makeProxy(EgyptData.LORE_TABLETS, ChinaData.CHINA_LORE_TABLETS, RomeData.ROME_LORE_TABLETS);
export const GUARDIAN_KNOWLEDGE_CHALLENGES = makeProxy(EgyptData.GUARDIAN_KNOWLEDGE_CHALLENGES, ChinaData.CHINA_GUARDIAN_KNOWLEDGE_CHALLENGES, RomeData.ROME_GUARDIAN_KNOWLEDGE_CHALLENGES);
export const GUARDIAN_KNOWLEDGE_QUESTIONS = makeProxy(EgyptData.GUARDIAN_KNOWLEDGE_QUESTIONS, ChinaData.CHINA_GUARDIAN_KNOWLEDGE_QUESTIONS, RomeData.ROME_GUARDIAN_KNOWLEDGE_QUESTIONS);
export const WORLD_CONTINUITY_LANDMARKS = makeProxy(EgyptData.WORLD_CONTINUITY_LANDMARKS, ChinaData.CHINA_WORLD_CONTINUITY_LANDMARKS, RomeData.ROME_WORLD_CONTINUITY_LANDMARKS);
export const WORLD_TRANSITION_STORY_MARKERS = makeProxy(EgyptData.WORLD_TRANSITION_STORY_MARKERS, ChinaData.CHINA_WORLD_TRANSITION_STORY_MARKERS, RomeData.ROME_WORLD_TRANSITION_STORY_MARKERS);

// Non-proxied items
export const JOURNEY_TOOLS = EgyptData.JOURNEY_TOOLS;
export const UPGRADES = makeProxy(EgyptData.UPGRADES, ChinaData.CHINA_UPGRADES, RomeData.ROME_UPGRADES);
export const isChinaJourneyCivilisation = EgyptData.isChinaJourneyCivilisation;
export const CHINA_ENEMIES = EgyptData.CHINA_ENEMIES;
export const ENEMIES = EgyptData.ENEMIES;
export const ROME_ENEMIES = RomeData.ROME_ENEMIES;

// Civ-aware enemy getters — three-way: Egypt / China / Rome
export const getJourneyEnemies = (targetCivilisation) => {
  const civ = typeof targetCivilisation === 'string' ? targetCivilisation.toLowerCase() : '';
  if (civ.includes('rome'))  return RomeData.ROME_ENEMIES;
  if (civ.includes('china')) return EgyptData.CHINA_ENEMIES;
  return EgyptPlacementData.enemies;
};

export const getJourneyMiniBosses = (targetCivilisation) => {
  const civ = typeof targetCivilisation === 'string' ? targetCivilisation.toLowerCase() : '';
  if (civ.includes('rome'))  return RomeData.ROME_MINI_BOSSES;
  if (civ.includes('china')) return EgyptData.getJourneyMiniBosses(targetCivilisation);
  return EgyptPlacementData.miniBosses;
};

// Civ-aware GATE — returns the world-end gate for the current expedition
export const GATE = new Proxy(EgyptData.GATE, {
  get(target, prop) {
    const civ = typeof currentCiv === 'string' ? currentCiv.toLowerCase() : '';
    const source = civ.includes('rome') ? RomeData.ROME_GATE
      : civ.includes('china') ? (ChinaData.CHINA_GATE || target)
      : target;
    return source[prop];
  },
});

// Civ-aware DISCOVERY_ENTRANCE — the handoff trigger at journey's end
export const DISCOVERY_ENTRANCE = new Proxy(EgyptData.DISCOVERY_ENTRANCE, {
  get(target, prop) {
    const civ = typeof currentCiv === 'string' ? currentCiv.toLowerCase() : '';
    const source = civ.includes('rome') ? RomeData.ROME_DISCOVERY_ENTRANCE
      : civ.includes('china') ? (ChinaData.CHINA_DISCOVERY_ENTRANCE || target)
      : target;
    return source[prop];
  },
});
