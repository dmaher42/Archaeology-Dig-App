// Generated from the Journey editor placement export. Do not edit by hand.
const journeyPlacementOverrides = {
  "source": "src/components/expedition-journey/journeyLevelData.js::STORY_PROPS",
  "platformSource": "src/components/expedition-journey/journeyLevelData.js::PLATFORMS",
  "hazardSource": "src/components/expedition-journey/journeyLevelData.js::HAZARDS",
  "routeGateSource": "src/components/expedition-journey/journeyLevelData.js::ROUTE_GATES",
  "routeGateDoorwaySource": "src/components/expedition-journey/journeyLevelData.js::ROUTE_GATE_DOORWAYS",
  "checkpointSource": "src/components/expedition-journey/journeyLevelData.js::CHECKPOINTS",
  "miniBossSource": "src/components/expedition-journey/journeyLevelData.js::MINI_BOSSES",
  "room": "mummification-chamber",
  "props": [
    {
      "id": "opening-archaeologist-field-kit",
      "sectionId": "desert-entry",
      "type": "camp",
      "x": 520,
      "y": 547,
      "label": "archaeologist arrival field kit"
    },
    {
      "id": "opening-guardian-warning-plinth",
      "sectionId": "desert-entry",
      "type": "statue",
      "x": 949,
      "y": 521,
      "label": "sealed guardian warning plinth"
    },
    {
      "id": "early-scarab-seal-pedestal",
      "sectionId": "desert-entry",
      "type": "sacred-pedestal",
      "x": 925,
      "y": 98,
      "label": "sacred pedestal holding the Sacred Scarab Seal"
    },
    {
      "id": "early-scarab-seal",
      "sectionId": "desert-entry",
      "type": "guardian-seal",
      "x": 925,
      "y": 71,
      "label": "Sacred Scarab Seal opening warning trigger"
    },
    {
      "id": "desert-boundary-marker",
      "sectionId": "desert-entry",
      "type": "guardian-seal",
      "x": 3673,
      "y": 547,
      "label": "ancient boundary seal"
    },
    {
      "id": "mummification-chamber-exterior-structure",
      "sectionId": "desert-entry",
      "type": "generated-mummification-chamber-entrance",
      "x": 3872,
      "y": -136,
      "width": 1500,
      "height": 760,
      "depth": "route-edge",
      "alpha": 1,
      "label": "generated Mummification Chamber exterior with bottom secret entrance, climbable sandstone ledges, damaged stairs, torches, and glowing hieroglyphs"
    },
    {
      "id": "forgotten-mural-climb-structure",
      "sectionId": "desert-entry",
      "type": "generated-climb-structure",
      "x": 6611,
      "y": -37,
      "width": 1420,
      "height": 690,
      "depth": "route-edge",
      "alpha": 1,
      "label": "generated Forgotten Mural Alcove climb structure with broken stairs, carved ledges, and damaged Anubis mural"
    },
    {
      "id": "scribe-chamber-doorway-structure",
      "sectionId": "desert-entry",
      "type": "generated-scribe-chamber-doorway",
      "x": 9520,
      "y": -24,
      "width": 1120,
      "height": 620,
      "depth": "route-edge",
      "alpha": 1,
      "groundContactLayer": [
        {
          "assetKey": "egyptRubbleContactShadow",
          "purpose": "scribe-exterior-base-contact-shadow",
          "xRatio": 0.5,
          "yOffset": -18,
          "widthRatio": 0.68,
          "height": 48,
          "alpha": 0.34,
          "mode": "stretch",
          "layer": "underlay"
        },
        {
          "assetKey": "egyptBaseSandDrift",
          "purpose": "scribe-exterior-sand-drift",
          "xRatio": 0.42,
          "yOffset": -32,
          "widthRatio": 0.58,
          "height": 66,
          "alpha": 0.4,
          "mode": "stretch",
          "layer": "overlay"
        },
        {
          "assetKey": "egyptGroundSkirtShort",
          "purpose": "lower-secret-exit-grounding",
          "xRatio": 0.57,
          "yOffset": -25,
          "widthRatio": 0.34,
          "height": 54,
          "alpha": 0.38,
          "mode": "stretch",
          "layer": "overlay"
        },
        {
          "assetKey": "egyptBuriedStoneEdge",
          "purpose": "climb-support-grounding",
          "xRatio": 0.31,
          "yOffset": -60,
          "widthRatio": 0.17,
          "height": 86,
          "alpha": 0.34,
          "mode": "contain",
          "layer": "overlay"
        },
        {
          "assetKey": "egyptStructureBaseRubble",
          "purpose": "climb-support-grounding",
          "xRatio": 0.76,
          "yOffset": -66,
          "widthRatio": 0.22,
          "height": 92,
          "alpha": 0.3,
          "mode": "contain",
          "layer": "overlay"
        }
      ],
      "label": "production Scribe Locked Chamber exterior with raised platform, crumbled stairs, glowing hieroglyphs, and sealed doorway"
    },
    {
      "id": "scribe-base-left-jar-cluster",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "supplyJars",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 8972,
      "y": 557,
      "width": 84,
      "height": 48,
      "alpha": 0.72,
      "depth": "route-edge",
      "tint": "warm",
      "shadowOpacity": 0,
      "shadowWidth": 92,
      "sandMoundWidth": 104,
      "sandOverlapHeight": 10,
      "groundPebbles": 2,
      "label": "Scribe Chamber left base sealed jars tucked into sand"
    },
    {
      "id": "scribe-base-left-fallen-tablet",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "stoneTablet",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 9119,
      "y": 555,
      "width": 58,
      "height": 82,
      "alpha": 0.62,
      "depth": "route-edge",
      "tint": "buried-stone",
      "rotation": -8,
      "shadowOpacity": 0,
      "shadowWidth": 74,
      "sandMoundWidth": 92,
      "sandOverlapHeight": 16,
      "groundPebbles": 2,
      "label": "Scribe Chamber left base half-buried fallen record stone"
    },
    {
      "id": "scribe-base-left-rubble-cluster",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "rubbleDustSmall",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 9255,
      "y": 559,
      "width": 154,
      "height": 58,
      "alpha": 0.78,
      "depth": "route-edge",
      "tint": "buried-stone",
      "shadowOpacity": 0,
      "shadowWidth": 150,
      "sandMoundWidth": 168,
      "sandOverlapHeight": 14,
      "groundPebbles": 4,
      "label": "Scribe Chamber left base rubble and sand drift"
    },
    {
      "id": "scribe-under-climb-collapsed-stair-stones",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "desertEntryPremiumThresholdSlab",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 9402,
      "y": 559,
      "width": 150,
      "height": 34,
      "alpha": 0.74,
      "depth": "route-edge",
      "tint": "buried-stone",
      "shadowOpacity": 0,
      "shadowWidth": 156,
      "sandMoundWidth": 172,
      "sandOverlapHeight": 11,
      "groundPebbles": 3,
      "label": "Scribe Chamber collapsed stair stones supporting the exterior climb"
    },
    {
      "id": "scribe-under-climb-broken-blocks",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "rubbleScatter",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 9571,
      "y": 561,
      "width": 122,
      "height": 50,
      "alpha": 0.66,
      "depth": "route-edge",
      "tint": "buried-stone",
      "shadowOpacity": 0,
      "shadowWidth": 124,
      "sandMoundWidth": 142,
      "sandOverlapHeight": 12,
      "groundPebbles": 5,
      "label": "Scribe Chamber broken blocks below the climb route"
    },
    {
      "id": "scribe-lower-door-rubble",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "rubbleDustSmall",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 9769,
      "y": 559,
      "width": 146,
      "height": 54,
      "alpha": 0.72,
      "depth": "route-edge",
      "tint": "buried-stone",
      "shadowOpacity": 0,
      "shadowWidth": 150,
      "sandMoundWidth": 166,
      "sandOverlapHeight": 13,
      "groundPebbles": 4,
      "label": "Scribe Chamber lower archive door rubble skirt"
    },
    {
      "id": "scribe-lower-door-papyrus-cases",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "scrollCache",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 9888,
      "y": 554,
      "width": 94,
      "height": 38,
      "alpha": 0.68,
      "depth": "route-edge",
      "tint": "warm",
      "shadowOpacity": 0,
      "shadowWidth": 98,
      "sandMoundWidth": 112,
      "sandOverlapHeight": 9,
      "groundPebbles": 2,
      "label": "Scribe Chamber lower archive papyrus case bundle"
    },
    {
      "id": "scribe-right-column-base",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "pillarCaps",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 10012,
      "y": 557,
      "width": 82,
      "height": 74,
      "alpha": 0.7,
      "depth": "route-edge",
      "tint": "buried-stone",
      "shadowOpacity": 0,
      "shadowWidth": 96,
      "sandMoundWidth": 108,
      "sandOverlapHeight": 16,
      "groundPebbles": 3,
      "label": "Scribe Chamber right base broken column cap"
    },
    {
      "id": "scribe-right-foreground-stones",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "rubbleScatter",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 10181,
      "y": 561,
      "width": 128,
      "height": 46,
      "alpha": 0.64,
      "depth": "route-edge",
      "tint": "buried-stone",
      "shadowOpacity": 0,
      "shadowWidth": 132,
      "sandMoundWidth": 150,
      "sandOverlapHeight": 12,
      "groundPebbles": 5,
      "label": "Scribe Chamber right base low foreground stones"
    },
    {
      "id": "desert-entry-premium-threshold-slab-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "desertEntryPremiumThresholdSlab",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 2055,
      "y": 557,
      "width": 96,
      "height": 26,
      "shadowOpacity": 0,
      "shadowWidth": 96,
      "sandMoundWidth": 96,
      "sandOverlapHeight": 7,
      "label": "generated premium carved threshold slab beyond the first guardian route"
    },
    {
      "id": "desert-entry-premium-column-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "desertEntryPremiumFallenColumn",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 1720,
      "y": 557,
      "width": 108,
      "height": 70,
      "shadowOpacity": 0,
      "shadowWidth": 112,
      "sandMoundWidth": 116,
      "sandOverlapHeight": 18,
      "groundPebbles": 4,
      "label": "generated premium carved fallen column in open sand after the pyramid"
    },
    {
      "id": "desert-entry-premium-pillar-caps-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "desertEntryPremiumPillarCaps",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 1885,
      "y": 553,
      "width": 74,
      "height": 96,
      "shadowOpacity": 0,
      "shadowWidth": 82,
      "sandMoundWidth": 88,
      "sandOverlapHeight": 16,
      "groundPebbles": 3,
      "label": "generated premium pillar-cap ruins in open sand after the pyramid"
    }
  ],
  "deletedPropIds": [
    "opening-warrior-guide-marker"
  ],
  "platforms": [
    {
      "id": "desert-entry-floor",
      "x": 34,
      "y": 595,
      "width": 13334,
      "height": 73,
      "label": "desert track"
    },
    {
      "id": "temple-floor",
      "x": 13334,
      "y": 595,
      "width": 9323,
      "height": 60,
      "label": "temple floor"
    },
    {
      "id": "catacomb-path-floor",
      "x": 22657,
      "y": 595,
      "width": 10735,
      "height": 60,
      "label": "catacomb path"
    },
    {
      "id": "escape-road-floor",
      "x": 33392,
      "y": 595,
      "width": 8193,
      "height": 60,
      "label": "escape road"
    },
    {
      "id": "dig-site-rise-floor",
      "x": 41584,
      "y": 595,
      "width": 9605,
      "height": 60,
      "label": "dig-site rise"
    },
    {
      "id": "opening-lower-ruin-ledge",
      "x": 0,
      "y": 553,
      "width": 330,
      "height": 18,
      "label": "invisible marked lower pyramid ledge",
      "invisible": true
    },
    {
      "id": "opening-first-terrace",
      "x": 355,
      "y": 406,
      "width": 365,
      "height": 18,
      "label": "invisible marked first pyramid terrace",
      "invisible": true
    },
    {
      "id": "opening-second-terrace",
      "x": 505,
      "y": 259,
      "width": 355,
      "height": 18,
      "label": "invisible marked second pyramid terrace",
      "invisible": true
    },
    {
      "id": "opening-scarab-seal-summit",
      "x": 770,
      "y": 100,
      "width": 280,
      "height": 18,
      "label": "invisible marked scarab artefact platform",
      "invisible": true
    },
    {
      "id": "mummification-chamber-bottom-secret-threshold",
      "x": 3605,
      "y": 492,
      "width": 176,
      "height": 18,
      "label": "invisible bottom secret threshold at the base of the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-sand-buried-block",
      "x": 3656,
      "y": 458,
      "width": 176,
      "height": 18,
      "label": "invisible buried block at the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-far-left-ground-shelf",
      "x": 3171,
      "y": 435,
      "width": 176,
      "height": 18,
      "label": "invisible far left ground shelf on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-right-low-landing",
      "x": 4091,
      "y": 475,
      "width": 197,
      "height": 18,
      "label": "invisible right low landing on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-central-left-shelf",
      "x": 3712,
      "y": 383,
      "width": 210,
      "height": 18,
      "label": "invisible central left shelf on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-right-stair-landing",
      "x": 3961,
      "y": 370,
      "width": 155,
      "height": 18,
      "label": "invisible right stair landing on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-left-lower-terrace",
      "x": 3378,
      "y": 373,
      "width": 233,
      "height": 18,
      "label": "invisible left lower terrace on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-central-drop-slab",
      "x": 3848,
      "y": 290,
      "width": 192,
      "height": 18,
      "label": "invisible central drop slab on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-carved-lower-ledge",
      "x": 4000,
      "y": 235,
      "width": 212,
      "height": 18,
      "label": "invisible carved lower ledge on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-left-sandstone-shelf",
      "x": 3304,
      "y": 235,
      "width": 132,
      "height": 18,
      "label": "invisible left sandstone shelf on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-right-column-cap",
      "x": 4102,
      "y": 205,
      "width": 212,
      "height": 18,
      "label": "invisible right column cap on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-left-column-cap",
      "x": 3425,
      "y": 180,
      "width": 80,
      "height": 18,
      "label": "invisible left column cap on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-upper-rite-ledge",
      "x": 3865,
      "y": 126,
      "width": 218,
      "height": 18,
      "label": "invisible upper rite ledge at the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-left-pedestal-top",
      "x": 3531,
      "y": 59,
      "width": 106,
      "height": 18,
      "label": "invisible left pedestal top cap on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-left-doorway-ledge",
      "x": 3723,
      "y": 79,
      "width": 259,
      "height": 18,
      "label": "invisible left doorway ledge at the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-upper-right-platform",
      "x": 4209,
      "y": 79,
      "width": 228,
      "height": 18,
      "label": "invisible upper right platform at the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-doorway-floor",
      "x": 4000,
      "y": 13,
      "width": 228,
      "height": 18,
      "label": "invisible high doorway floor at the Mummification Chamber entrance",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-upper-left-platform",
      "x": 3723,
      "y": -20,
      "width": 238,
      "height": 18,
      "label": "invisible upper left platform at the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-floor",
      "sceneId": "mummification-chamber",
      "x": 2933,
      "y": 498,
      "width": 1356,
      "height": 18,
      "label": "invisible full Mummification Chamber floor",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-lower-masonry",
      "x": 5921,
      "y": 511,
      "width": 230,
      "height": 18,
      "label": "invisible collapsed ceremonial masonry step over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-carved-wall-ledge",
      "x": 6101,
      "y": 453,
      "width": 230,
      "height": 18,
      "label": "invisible carved wall ledge in hidden priest passage art",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-broken-warning-step",
      "x": 6286,
      "y": 395,
      "width": 240,
      "height": 18,
      "label": "invisible broken warning-stone ledge over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-priest-passage-shelf",
      "x": 6471,
      "y": 339,
      "width": 260,
      "height": 18,
      "label": "invisible hidden priest passage shelf over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-column-shelf",
      "x": 6666,
      "y": 279,
      "width": 230,
      "height": 18,
      "label": "invisible right-side column shelf over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-upper-doorway-floor",
      "x": 6850,
      "y": 193,
      "width": 250,
      "height": 18,
      "label": "invisible upper doorway floor over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-forward-passage-step",
      "x": 6908,
      "y": 181,
      "width": 220,
      "height": 18,
      "label": "invisible forward stonework return from the hidden alcove over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-return-masonry",
      "x": 6885,
      "y": 287,
      "width": 235,
      "height": 18,
      "label": "invisible return masonry over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-lower-return",
      "x": 6575,
      "y": 405,
      "width": 255,
      "height": 18,
      "label": "invisible lower return ledge from priest passage over generated art",
      "secret": true,
      "invisible": true
    },
    {
      "id": "scribe-chamber-buried-lower-block",
      "x": 9023,
      "y": 519,
      "width": 95,
      "height": 18,
      "label": "invisible buried lower block at the Scribe Chamber platform",
      "secret": true,
      "invisible": true
    },
    {
      "id": "scribe-chamber-collapsed-stair-slab",
      "x": 9277,
      "y": 473,
      "width": 120,
      "height": 18,
      "label": "invisible collapsed stair slab at the Scribe Chamber platform",
      "secret": true,
      "invisible": true
    },
    {
      "id": "scribe-chamber-middle-rubble-landing",
      "x": 9424,
      "y": 433,
      "width": 235,
      "height": 18,
      "label": "invisible middle rubble landing at the Scribe Chamber platform",
      "secret": true,
      "invisible": true
    },
    {
      "id": "scribe-chamber-upper-carved-landing",
      "x": 9481,
      "y": 357,
      "width": 210,
      "height": 18,
      "label": "invisible upper carved landing at the Scribe Chamber platform",
      "secret": true,
      "invisible": true
    },
    {
      "id": "scribe-chamber-doorway-threshold",
      "x": 9515,
      "y": 297,
      "width": 180,
      "height": 18,
      "label": "invisible raised doorway threshold at the Scribe Chamber entrance",
      "secret": true,
      "invisible": true
    },
    {
      "id": "switch-1-raised-return-plinth",
      "x": 15086,
      "y": 539,
      "width": 128,
      "height": 18,
      "label": "switch raised return plinth",
      "requiresObjective": "switch-1"
    },
    {
      "id": "temple-sandfall-cracked-column-step",
      "x": 16046,
      "y": 517,
      "width": 138,
      "height": 18,
      "label": "collapsing column step",
      "reactive": {
        "type": "collapsing bridge piece",
        "delay": 1.25,
        "respawn": 3.2,
        "shake": 0.12
      },
      "challengeId": "temple-sandfall-climb",
      "challengeFailY": 561,
      "challengeFailMessage": "You slipped from the sandfall climb. The team reset at the checkpoint."
    },
    {
      "id": "catacomb-torch-cracked-ledge",
      "x": 24267,
      "y": 521,
      "width": 145,
      "height": 18,
      "label": "torch safe ledge",
      "reactive": {
        "type": "unstable ledge",
        "delay": 1.42,
        "respawn": 3,
        "shake": 0.1
      },
      "challengeId": "catacomb-torch-climb",
      "challengeFailY": 565,
      "challengeFailMessage": "You missed the torch climb and dropped into the dark path. Retry from the checkpoint."
    },
    {
      "id": "catacomb-bone-dry-bridge",
      "x": 28589,
      "y": 513,
      "width": 210,
      "height": 18,
      "label": "bone-dry bridge",
      "reactive": {
        "type": "unstable ledge",
        "delay": 1.8,
        "respawn": 3.4,
        "shake": 0.1
      }
    },
    {
      "id": "escape-falling-stair",
      "x": 34013,
      "y": 535,
      "width": 160,
      "height": 18,
      "label": "falling stair",
      "reactive": {
        "type": "unstable platform",
        "delay": 1.4,
        "respawn": 3.2,
        "shake": 0.12
      }
    },
    {
      "id": "escape-broken-bridge-step",
      "x": 34889,
      "y": 523,
      "width": 118,
      "height": 18,
      "label": "broken bridge step",
      "reactive": {
        "type": "collapsing bridge piece",
        "delay": 1.2,
        "respawn": 3.6,
        "shake": 0.14
      }
    },
    {
      "id": "final-site-rope-cracked-ledge",
      "x": 43646,
      "y": 505,
      "width": 118,
      "height": 18,
      "label": "survey rope ledge",
      "reactive": {
        "type": "unstable ledge",
        "delay": 1.35,
        "respawn": 3,
        "shake": 0.12
      },
      "challengeId": "final-site-permit-climb",
      "challengeFailY": 563,
      "challengeFailMessage": "You missed the final permit climb. The survey team pulled you back to the checkpoint."
    }
  ],
  "deletedPlatformIds": [],
  "hazards": [
    {
      "id": "sealed-sand",
      "name": "sealed sand",
      "emoji": "!",
      "x": 7232,
      "y": 565,
      "width": 62,
      "height": 30,
      "penalty": {
        "time": 6
      },
      "message": "A marked patch of sealed sand slowed the approach."
    },
    {
      "id": "loose-temple-floor",
      "name": "loose temple floor",
      "emoji": "!",
      "x": 19888,
      "y": 565,
      "width": 72,
      "height": 30,
      "penalty": {
        "stamina": 8
      },
      "message": "Loose temple stones made the guardian route harder."
    },
    {
      "id": "glyph-tripwire",
      "name": "glyph tripwire",
      "emoji": "!",
      "x": 30821,
      "y": 565,
      "width": 78,
      "height": 30,
      "penalty": {
        "stamina": 8
      },
      "message": "A glyph tripwire flashed underfoot."
    },
    {
      "id": "warning-rubble",
      "name": "warning rubble",
      "emoji": "!",
      "x": 39550,
      "y": 559,
      "width": 80,
      "height": 36,
      "penalty": {
        "stamina": 8
      },
      "message": "Warning rubble narrowed the route."
    },
    {
      "id": "survey-rope",
      "name": "survey rope",
      "emoji": "!",
      "x": 45172,
      "y": 565,
      "width": 76,
      "height": 30,
      "penalty": {
        "time": 6
      },
      "message": "Survey ropes slowed the final site access path."
    },
    {
      "id": "desert-low-ridge",
      "name": "low sand ridge",
      "emoji": "!",
      "x": 2430,
      "y": 565,
      "width": 64,
      "height": 30,
      "penalty": {
        "time": 4
      },
      "message": "A low sand ridge slowed the survey line."
    },
    {
      "id": "thorn-bush",
      "name": "thorn bush",
      "emoji": "ðŸŒ¿",
      "x": 3164,
      "y": 564,
      "width": 54,
      "height": 31,
      "penalty": {
        "stamina": 5
      },
      "message": "Thorn scrub slowed the team. Stamina reduced."
    },
    {
      "id": "opening-seal-reset-trap",
      "name": "buried spike trap",
      "emoji": "!",
      "x": 1413,
      "y": 599,
      "width": 110,
      "height": 1,
      "penalty": {
        "stamina": 8
      },
      "message": "Buried spikes jabbed out of the sand. Jump cleanly over them.",
      "damage": 10,
      "reset": false,
      "cooldown": 1.2,
      "depth": "grounded",
      "linkedObjectIds": [],
      "editorVisible": true,
      "triggerArea": {
        "x": 1,
        "y": -5,
        "width": 89,
        "height": 16
      },
      "burial": 0.05,
      "sectionId": "mummification-chamber"
    },
    {
      "id": "spike-trap",
      "name": "temple trap",
      "emoji": "ðŸ§±",
      "x": 16442,
      "y": 565,
      "width": 70,
      "height": 30,
      "penalty": {
        "stamina": 12
      },
      "message": "A temple trap clipped your route. Stamina reduced."
    },
    {
      "id": "temple-loose-step",
      "name": "loose stone step",
      "emoji": "!",
      "x": 14549,
      "y": 565,
      "width": 62,
      "height": 30,
      "penalty": {
        "stamina": 5
      },
      "message": "A loose stone shifted underfoot."
    },
    {
      "id": "rolling-stones",
      "name": "rolling stones",
      "emoji": "ðŸª¨",
      "x": 21385,
      "y": 553,
      "width": 70,
      "height": 42,
      "penalty": {
        "stamina": 12,
        "time": 5
      },
      "message": "Rolling stones forced a scramble."
    },
    {
      "id": "dark-gap",
      "name": "dark gap",
      "emoji": "â¬›",
      "x": 24408,
      "y": 579,
      "width": 90,
      "height": 18,
      "penalty": {
        "stamina": 10
      },
      "message": "You stumbled in a dark gap."
    },
    {
      "id": "catacomb-small-gap",
      "name": "small dark gap",
      "emoji": "!",
      "x": 23984,
      "y": 579,
      "width": 68,
      "height": 18,
      "penalty": {
        "stamina": 5
      },
      "message": "A small dark gap broke the safe path."
    },
    {
      "id": "bat-cloud",
      "name": "bat cloud",
      "emoji": "ðŸ¦‡",
      "x": 30115,
      "y": 479,
      "width": 105,
      "height": 78,
      "penalty": {
        "time": 9
      },
      "message": "A cloud of bats scattered the team."
    },
    {
      "id": "falling-blocks",
      "name": "falling blocks",
      "emoji": "ðŸ§±",
      "x": 35087,
      "y": 553,
      "width": 90,
      "height": 42,
      "penalty": {
        "stamina": 14
      },
      "message": "Falling blocks made the escape tense."
    },
    {
      "id": "escape-cracked-step",
      "name": "cracked bridge step",
      "emoji": "!",
      "x": 34776,
      "y": 561,
      "width": 74,
      "height": 34,
      "penalty": {
        "stamina": 5
      },
      "message": "A cracked bridge step shifted."
    },
    {
      "id": "dust-wave",
      "name": "dust wave",
      "emoji": "ðŸ’¨",
      "x": 38533,
      "y": 551,
      "width": 130,
      "height": 44,
      "penalty": {
        "time": 12
      },
      "message": "Dust reduced visibility. Time reduced."
    },
    {
      "id": "camp-low-rope",
      "name": "low survey rope",
      "emoji": "!",
      "x": 42799,
      "y": 565,
      "width": 62,
      "height": 30,
      "penalty": {
        "time": 4
      },
      "message": "A low survey rope slowed the final approach."
    },
    {
      "id": "loose-slope",
      "name": "loose slope",
      "emoji": "ðŸ“‰",
      "x": 43901,
      "y": 565,
      "width": 110,
      "height": 30,
      "penalty": {
        "stamina": 10
      },
      "message": "Loose stones made the final climb harder."
    },
    {
      "id": "desert-soft-ridge",
      "name": "soft sand ridge",
      "emoji": "!",
      "x": 6356,
      "y": 565,
      "width": 86,
      "height": 30,
      "penalty": {
        "time": 4
      },
      "message": "A soft sand ridge slowed the upper route."
    },
    {
      "id": "broken-ruins-loose-stones",
      "name": "loose ruin stones",
      "emoji": "!",
      "x": 7119,
      "y": 565,
      "width": 74,
      "height": 30,
      "penalty": {
        "stamina": 5
      },
      "message": "Loose ruin stones shifted underfoot."
    },
    {
      "id": "temple-threshold-hairline-crack",
      "name": "hairline floor crack",
      "emoji": "!",
      "x": 13927,
      "y": 565,
      "width": 76,
      "height": 30,
      "penalty": {
        "time": 3
      },
      "message": "A hairline crack warned the team to step carefully."
    },
    {
      "id": "temple-floor-crack",
      "name": "floor crack",
      "emoji": "!",
      "x": 15509,
      "y": 565,
      "width": 70,
      "height": 30,
      "penalty": {
        "stamina": 8
      },
      "message": "Cracked floor stones shifted underfoot."
    },
    {
      "id": "sandfall-warning-dust",
      "name": "falling sand warning",
      "emoji": "!",
      "x": 15764,
      "y": 565,
      "width": 62,
      "height": 30,
      "penalty": {
        "time": 3
      },
      "message": "Falling sand warned that the stones ahead were unstable."
    },
    {
      "id": "sandfall-collapsing-stones",
      "name": "collapsing stones",
      "emoji": "!",
      "x": 16159,
      "y": 553,
      "width": 82,
      "height": 42,
      "penalty": {
        "stamina": 8,
        "time": 3
      },
      "message": "Collapsing stones forced a careful jump."
    },
    {
      "id": "temple-falling-chip",
      "name": "falling stone chip",
      "emoji": "!",
      "x": 18786,
      "y": 553,
      "width": 70,
      "height": 42,
      "penalty": {
        "stamina": 8,
        "time": 3
      },
      "message": "Small stones fell from the temple wall."
    },
    {
      "id": "sandfall-soft-pit",
      "name": "sandfall soft pit",
      "emoji": "!",
      "x": 16922,
      "y": 565,
      "width": 76,
      "height": 30,
      "penalty": {
        "time": 5
      },
      "message": "A soft sand pocket slowed the recovery step."
    },
    {
      "id": "catacomb-gap-2",
      "name": "narrow dark gap",
      "emoji": "!",
      "x": 25566,
      "y": 579,
      "width": 90,
      "height": 18,
      "penalty": {
        "stamina": 8
      },
      "message": "A narrow gap interrupted the catacomb path."
    },
    {
      "id": "catacomb-bat-pocket",
      "name": "bat pocket",
      "emoji": "!",
      "x": 28250,
      "y": 479,
      "width": 96,
      "height": 76,
      "penalty": {
        "time": 6
      },
      "message": "A small bat pocket broke the team rhythm."
    },
    {
      "id": "escape-falling-chip",
      "name": "falling stone chip",
      "emoji": "!",
      "x": 36556,
      "y": 553,
      "width": 86,
      "height": 42,
      "penalty": {
        "stamina": 10
      },
      "message": "Loose ceiling stones fell near the escape path."
    },
    {
      "id": "escape-dust-pocket",
      "name": "dust pocket",
      "emoji": "!",
      "x": 38166,
      "y": 551,
      "width": 118,
      "height": 44,
      "penalty": {
        "time": 8
      },
      "message": "Dust swept across the broken route."
    },
    {
      "id": "dig-site-loose-rope",
      "name": "loose survey rope",
      "emoji": "!",
      "x": 43420,
      "y": 565,
      "width": 76,
      "height": 30,
      "penalty": {
        "time": 5
      },
      "message": "Loose survey rope slowed the final approach."
    },
    {
      "id": "dig-site-loose-slope-2",
      "name": "loose final slope",
      "emoji": "!",
      "x": 46302,
      "y": 565,
      "width": 105,
      "height": 30,
      "penalty": {
        "stamina": 8
      },
      "message": "Loose stones shifted before the final guardian path."
    }
  ],
  "deletedHazardIds": [],
  "routeGates": [
    {
      "id": "temple-approach-seal",
      "name": "Temple Approach Seal",
      "x": 5933,
      "y": 321,
      "width": 34,
      "height": 274,
      "message": "The Temple Approach Seal refuses easy entry. The lost fragments must prove Asha came to protect.",
      "readyHint": "The seal answers. Move through the threshold before the site closes again.",
      "openMessage": "The seal answers, but it does not trust you.",
      "requires": {
        "shards": 4
      }
    },
    {
      "id": "guardian-prep-seal",
      "name": "Guardian Prep Seal",
      "x": 6300,
      "y": 321,
      "width": 34,
      "height": 274,
      "message": "The ancient Map Tablet and 6 lost fragments must be restored before the path deeper wakes.",
      "requires": {
        "objective": "desert-entry",
        "shards": 6
      }
    },
    {
      "id": "desert-seal",
      "name": "Desert Map Seal",
      "x": 12910,
      "y": 321,
      "width": 34,
      "height": 274,
      "message": "The Desert Map Seal waits for the Map Tablet, the Brush Handle, the fall of the Scarab Queen, and 10 lost fragments.",
      "readyHint": "The Desert Map Seal opens. Carry the record forward into the ruined temple.",
      "requires": {
        "objective": "desert-entry",
        "miniBoss": "scarab-queen",
        "keyItem": "brush-handle",
        "shards": 10
      }
    }
  ],
  "routeGateDoorways": [
    {
      "id": "desert-entry-main-doorway",
      "gateIds": [
        "temple-approach-seal",
        "guardian-prep-seal"
      ],
      "anchorX": 6300,
      "blockX": 6300,
      "y": 321,
      "width": 184,
      "height": 274,
      "opening": {
        "left": -92,
        "right": 92,
        "top": -250,
        "bottom": 0
      },
      "slab": {
        "x": -76,
        "y": -248,
        "width": 152,
        "height": 266
      },
      "label": "shared blocked desert-entry route doorway"
    }
  ],
  "checkpoints": [
    {
      "id": "desert-entry",
      "name": "Desert Entry",
      "x": 452,
      "markerX": 136,
      "y": 517
    },
    {
      "id": "desert-survey-marker",
      "name": "Desert Survey Checkpoint",
      "x": 5255,
      "y": 517
    }
  ],
  "miniBosses": [
    {
      "id": "scarab-queen",
      "sectionId": "desert-entry",
      "name": "Scarab Queen",
      "type": "scarab",
      "x": 12148,
      "y": 553,
      "width": 58,
      "height": 42,
      "patrolMin": 11809,
      "patrolMax": 12515,
      "speed": 66,
      "health": 1,
      "damage": 4,
      "shards": 6,
      "intro": "Buried Lair: Scarab Queen. The buried scarab lair splits open beneath the sand. The Scarab Queen rises as the first trial of Anubis. The site will not yield easily.",
      "dialogue": "The buried scarab lair splits open beneath the sand. The Scarab Queen rises as the first trial of Anubis. The site will not yield easily.",
      "domainName": "First Guardian Domain",
      "arenaStart": 11413,
      "arenaEnd": 12628
    }
  ]
};

export default journeyPlacementOverrides;
