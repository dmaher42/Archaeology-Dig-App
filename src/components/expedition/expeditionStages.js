export const EXPEDITION_STAGE_IDS = {
  EGYPT: 'ancient-egypt',
  CHINA: 'ancient-china',
  ROME: 'ancient-rome',
  LAKE_MUNGO: 'lake-mungo',
};

export const CHINA_EXPEDITION_SOURCE_ASSETS = [
  {
    id: 'china-river-valley-parallax-v2',
    title: 'River valley parallax pack',
    src: 'assets/expedition/china-source/china-river-valley-parallax-pack-v2.png',
    role: 'future-journey-background',
  },
  {
    id: 'china-river-valley-environment-v2',
    title: 'River valley environment pack',
    src: 'assets/expedition/china-source/china-river-valley-environment-pack-v2.png',
    role: 'future-environment-tiles',
  },
  {
    id: 'china-river-valley-parallax-source',
    title: 'Original parallax source',
    src: 'assets/expedition/china-source/china-river-valley-parallax-pack.png',
    role: 'source-reference',
  },
  {
    id: 'china-river-valley-environment-source',
    title: 'Original environment source',
    src: 'assets/expedition/china-source/china-river-valley-environment-pack.png',
    role: 'source-reference',
  },
];

export const CHINA_EXPEDITION_RUNTIME_ASSETS = [
  {
    id: 'china-river-valley-parallax-runtime',
    title: 'Runtime river valley parallax pack',
    src: 'assets/expedition/backgrounds/china-river-valley/china-river-valley-parallax-pack.png',
    atlas: 'assets/expedition/backgrounds/china-river-valley/china-river-valley-parallax-pack.json',
    role: 'journey-background',
  },
  {
    id: 'china-river-valley-environment-runtime',
    title: 'Runtime river valley environment tiles',
    src: 'assets/expedition/environment/china-river-valley/china-river-valley-environment-pack.png',
    atlas: 'assets/expedition/environment/china-river-valley/china-river-valley-environment-pack.json',
    role: 'journey-environment-tiles',
  },
];

export const EGYPT_EXPEDITION_FUTURE_ASSETS = [
  {
    id: 'egypt-sacred-traps-runtime',
    title: 'Egypt sacred seal and pedestal pack',
    src: 'assets/expedition/environment/desert-temple/egypt-sacred-traps-pack.png',
    atlas: 'assets/expedition/environment/desert-temple/egypt-sacred-traps-pack.json',
    role: 'future-journey-sacred-defence',
  },
];

export const CHINA_EXPEDITION_SCAFFOLD = {
  title: 'Ancient China Expedition',
  subtitle: 'River valleys, dynasties, oracle bones and early civilisation',
  learningTeaser: 'Investigate how river valleys, dynasties, bronze, jade and early writing help us understand Ancient China.',
  year7Concepts: [
    'Ancient civilisations developed around river valleys.',
    'Evidence helps historians understand the ancient past.',
    'Artefacts and written sources can reveal values, beliefs, technology and government.',
    'Archaeologists use survey, excavation, cataloguing, evidence and interpretation.',
    'Students make claims using evidence.',
  ],
  visualDirection: [
    'river valley',
    'misty mountains',
    'rammed-earth walls',
    'ancient watchtowers',
    'timber gates',
    'bronze and jade accents',
    'oracle bone, archive and tomb visual language',
  ],
  exclusions: [
    'pyramids',
    'Egyptian temples',
    'desert Egypt styling',
    'Egyptian columns',
    'hieroglyphs',
    'pharaoh imagery',
    'sphinx imagery',
    'fantasy dragons as the main theme',
    'anime or martial arts fantasy styling',
  ],
  sourceAssets: CHINA_EXPEDITION_SOURCE_ASSETS,
  runtimeAssets: CHINA_EXPEDITION_RUNTIME_ASSETS,
  implementationSlots: {
    journeyStage: 'china-journey-stage-runtime-prototype',
    journeyBackgroundArt: 'china-river-valley-parallax-runtime',
    environmentTilePack: 'china-river-valley-environment-runtime',
    excavationRoomMap: 'china-top-down-excavation-map-placeholder',
    zoneChallengeUi: 'china-zone-challenge-ui-placeholder',
    surveyMarkersAndGateways: 'china-survey-marker-gateway-placeholder',
    enemiesAndGuardians: 'china-enemies-guardian-sprites-placeholder',
    evidenceSet: 'china-evidence-set-placeholder',
    finalClaim: 'china-final-claim-placeholder',
  },
};

export const EXPEDITION_STAGES = [
  {
    id: EXPEDITION_STAGE_IDS.EGYPT,
    title: 'Ancient Egypt',
    subtitle: 'Nile engineering, built spaces and structural evidence',
    status: 'Playable',
    statusTone: 'playable',
    actionLabel: 'Start Expedition',
    route: 'playable',
    dossierTag: 'Active Expedition',
    teaser: 'Reach Base Camp, survey the dig site and make a final claim from evidence.',
    scaffold: {
      journeyStage: 'existing-egypt-journey',
      excavationRoomMap: 'existing-egypt-room-map',
      finalClaim: 'existing-egypt-final-claim',
      futureAssets: EGYPT_EXPEDITION_FUTURE_ASSETS,
    },
  },
  {
    id: EXPEDITION_STAGE_IDS.CHINA,
    title: 'Ancient China',
    subtitle: CHINA_EXPEDITION_SCAFFOLD.subtitle,
    status: 'Playable Prototype',
    statusTone: 'development',
    actionLabel: 'Start Expedition',
    route: 'playable',
    dossierTag: 'Prototype Expedition',
    teaser: 'Play the first Ancient China Journey route into the excavation map.',
    previewTeaser: CHINA_EXPEDITION_SCAFFOLD.learningTeaser,
    scaffold: CHINA_EXPEDITION_SCAFFOLD,
  },
  {
    id: EXPEDITION_STAGE_IDS.ROME,
    title: 'Ancient Rome',
    subtitle: 'Roads, civic life, public works and empire evidence',
    status: 'Coming Soon',
    statusTone: 'soon',
    actionLabel: 'Preview Only',
    route: 'preview',
    dossierTag: 'Future Expedition',
    teaser: 'Preview a later investigation into roads, public works and Roman influence.',
  },
  {
    id: EXPEDITION_STAGE_IDS.LAKE_MUNGO,
    title: 'Lake Mungo / Ancient Australia',
    subtitle: 'Ancient Australia, landscape evidence and deep time',
    status: 'Coming Soon',
    statusTone: 'soon',
    actionLabel: 'Preview Only',
    route: 'preview',
    dossierTag: 'Future Expedition',
    teaser: 'Preview ancient remains, landscape evidence and cultural significance.',
  },
];

export const EXPEDITION_STAGE_HEADER_CHARACTERS = [
  {
    id: EXPEDITION_STAGE_IDS.CHINA,
    title: 'Ancient China explorer',
    src: 'assets/expedition/stage-characters/ancient-china-character.png',
  },
  {
    id: EXPEDITION_STAGE_IDS.ROME,
    title: 'Ancient Rome explorer',
    src: 'assets/expedition/stage-characters/ancient-rome-character.png',
  },
  {
    id: EXPEDITION_STAGE_IDS.LAKE_MUNGO,
    title: 'Lake Mungo explorer',
    src: 'assets/expedition/stage-characters/ancient-australia-character.png',
  },
];

export const PLAYABLE_EXPEDITION_STAGE_ID = EXPEDITION_STAGE_IDS.EGYPT;
