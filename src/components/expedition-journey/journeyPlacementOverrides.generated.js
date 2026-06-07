// Generated from the Journey editor placement export. Do not edit by hand.
const journeyPlacementOverrides = {
  "source": "src/components/expedition-journey/journeyLevelData.js::STORY_PROPS",
  "platformSource": "src/components/expedition-journey/journeyLevelData.js::PLATFORMS",
  "hazardSource": "src/components/expedition-journey/journeyLevelData.js::HAZARDS",
  "routeGateSource": "src/components/expedition-journey/journeyLevelData.js::ROUTE_GATES",
  "routeGateDoorwaySource": "src/components/expedition-journey/journeyLevelData.js::ROUTE_GATE_DOORWAYS",
  "checkpointSource": "src/components/expedition-journey/journeyLevelData.js::CHECKPOINTS",
  "miniBossSource": "src/components/expedition-journey/journeyLevelData.js::MINI_BOSSES",
  "room": "desert-entry",
  "props": [
    {
      "id": "opening-archaeologist-field-kit",
      "sectionId": "desert-entry",
      "type": "camp",
      "x": 624,
      "y": 547,
      "label": "archaeologist arrival field kit"
    },
    {
      "id": "desert-boundary-marker",
      "sectionId": "desert-entry",
      "type": "guardian-seal",
      "x": 4405,
      "y": 544,
      "label": "ancient boundary seal"
    },
    {
      "id": "opening-pyramid-facade-structure",
      "sectionId": "desert-entry",
      "type": "generated-opening-pyramid-facade",
      "x": 640,
      "y": -161,
      "width": 1208,
      "height": 655,
      "depth": "background",
      "alpha": 0.98,
      "label": "editable opening pyramid facade landmark with scarab seal approach",
      "scale": 1.15,
      "rotation": 10,
      "groundContactLayer": [],
      "editorBoundsInsetBottom": 0,
      "brightness": 0.95,
      "colorGradeFilter": "saturate(63%) sepia(56%) contrast(99%) hue-rotate(-23deg)pp",
      "mirrorX": false,
      "zIndex": 5
    },
    {
      "id": "mummification-chamber-exterior-structure",
      "sectionId": "desert-entry",
      "type": "generated-mummification-chamber-entrance",
      "x": 4310,
      "y": -225,
      "width": 1500,
      "height": 760,
      "depth": "background",
      "alpha": 1,
      "layer": "background",
      "groundContactLayer": [],
      "label": "generated Mummification Chamber exterior with bottom secret entrance, climbable sandstone ledges, damaged stairs, torches, and glowing hieroglyphs",
      "scale": 1.1,
      "mirrorX": false,
      "brightness": 0.8,
      "colorGradeFilter": "saturate(78%) sepia(8%) contrast(96%)",
      "shadowWidth": 0,
      "shadowHeight": 0,
      "sandMoundWidth": 0,
      "sandMoundHeight": 0,
      "groundPebbles": 0,
      "sandOverlapHeight": 0,
      "shadowOpacity": 0
    },
    {
      "id": "forgotten-mural-climb-structure",
      "sectionId": "desert-entry",
      "type": "generated-climb-structure",
      "x": 7465,
      "y": -176,
      "width": 1420,
      "height": 690,
      "depth": "route-edge",
      "alpha": 1,
      "groundContactLayer": [
        {
          "layer": "underlay",
          "assetKey": "premiumRubbleContactShadow",
          "xRatio": 0.5,
          "widthRatio": 0.68,
          "height": 60,
          "yOffset": -42,
          "alpha": 0.4,
          "filter": "sepia(18%) saturate(88%) brightness(70%) contrast(108%)"
        },
        {
          "layer": "underlay",
          "assetKey": "premiumHalfBuriedStairSupport",
          "xRatio": 0.25,
          "widthRatio": 0.3,
          "height": 66,
          "yOffset": -70,
          "alpha": 0.44,
          "rotation": -2,
          "filter": "sepia(12%) saturate(92%) brightness(84%) contrast(102%)"
        },
        {
          "layer": "underlay",
          "assetKey": "premiumBrokenMasonryFooting",
          "xRatio": 0.78,
          "widthRatio": 0.24,
          "height": 62,
          "yOffset": -64,
          "alpha": 0.34,
          "rotation": 4,
          "mirrorX": true,
          "filter": "sepia(12%) saturate(88%) brightness(82%) contrast(104%)"
        },
        {
          "layer": "overlay",
          "assetKey": "premiumRubbleMoundBlend",
          "xRatio": 0.42,
          "widthRatio": 0.46,
          "height": 82,
          "yOffset": -74,
          "alpha": 0.46,
          "rotation": -3,
          "filter": "sepia(12%) saturate(88%) brightness(88%) contrast(98%)"
        },
        {
          "layer": "overlay",
          "assetKey": "premiumLowSedimentRibbon",
          "xRatio": 0.27,
          "widthRatio": 0.42,
          "height": 42,
          "yOffset": -38,
          "alpha": 0.58,
          "rotation": -1,
          "filter": "sepia(10%) saturate(86%) brightness(94%) contrast(94%)"
        },
        {
          "layer": "overlay",
          "assetKey": "premiumLowSedimentRibbon",
          "xRatio": 0.69,
          "widthRatio": 0.36,
          "height": 38,
          "yOffset": -36,
          "alpha": 0.5,
          "rotation": 2,
          "mirrorX": true,
          "filter": "sepia(10%) saturate(86%) brightness(94%) contrast(94%)"
        },
        {
          "layer": "overlay",
          "assetKey": "premiumSmallStoneScatter",
          "xRatio": 0.18,
          "widthRatio": 0.2,
          "height": 36,
          "yOffset": -52,
          "alpha": 0.52,
          "rotation": 5,
          "filter": "sepia(10%) saturate(86%) brightness(90%) contrast(98%)"
        },
        {
          "layer": "overlay",
          "assetKey": "premiumSmallStoneScatter",
          "xRatio": 0.79,
          "widthRatio": 0.24,
          "height": 36,
          "yOffset": -54,
          "alpha": 0.58,
          "rotation": -4,
          "mirrorX": true,
          "filter": "sepia(10%) saturate(86%) brightness(90%) contrast(98%)"
        },
        {
          "layer": "overlay",
          "assetKey": "premiumLongSandLip",
          "xRatio": 0.56,
          "widthRatio": 0.28,
          "height": 42,
          "yOffset": -46,
          "alpha": 0.44,
          "rotation": 1,
          "filter": "sepia(12%) saturate(88%) brightness(93%) contrast(96%)"
        }
      ],
      "label": "generated Forgotten Mural Alcove climb structure with broken stairs, carved ledges, and damaged Anubis mural",
      "scale": 1.15
    },
    {
      "id": "scribe-chamber-doorway-structure",
      "sectionId": "desert-entry",
      "type": "generated-scribe-chamber-doorway",
      "x": 10876,
      "y": -24,
      "width": 1120,
      "height": 620,
      "depth": "route-edge",
      "alpha": 1,
      "groundContactLayer": [
        {
          "layer": "underlay",
          "assetKey": "premiumRubbleContactShadow",
          "xRatio": 0.5,
          "widthRatio": 0.72,
          "height": 60,
          "yOffset": -42,
          "alpha": 0.48,
          "filter": "sepia(18%) saturate(88%) brightness(68%) contrast(110%)"
        },
        {
          "layer": "underlay",
          "assetKey": "premiumBrokenMasonryFooting",
          "xRatio": 0.43,
          "widthRatio": 0.36,
          "height": 76,
          "yOffset": -74,
          "alpha": 0.42,
          "rotation": -2,
          "filter": "sepia(12%) saturate(90%) brightness(82%) contrast(104%)"
        },
        {
          "layer": "underlay",
          "assetKey": "premiumRubbleMoundBlend",
          "xRatio": 0.78,
          "widthRatio": 0.25,
          "height": 66,
          "yOffset": -65,
          "alpha": 0.3,
          "rotation": 4,
          "mirrorX": true,
          "filter": "sepia(12%) saturate(88%) brightness(80%) contrast(102%)"
        },
        {
          "layer": "overlay",
          "assetKey": "premiumDoorThresholdBuildup",
          "xRatio": 0.5,
          "widthRatio": 0.46,
          "height": 54,
          "yOffset": -57,
          "alpha": 0.64,
          "filter": "sepia(16%) saturate(92%) brightness(86%) contrast(102%)"
        },
        {
          "layer": "overlay",
          "assetKey": "premiumLowSedimentRibbon",
          "xRatio": 0.28,
          "widthRatio": 0.42,
          "height": 40,
          "yOffset": -36,
          "alpha": 0.58,
          "rotation": -1,
          "filter": "sepia(10%) saturate(84%) brightness(94%) contrast(94%)"
        },
        {
          "layer": "overlay",
          "assetKey": "premiumLowSedimentRibbon",
          "xRatio": 0.72,
          "widthRatio": 0.34,
          "height": 38,
          "yOffset": -34,
          "alpha": 0.52,
          "rotation": 2,
          "mirrorX": true,
          "filter": "sepia(10%) saturate(84%) brightness(94%) contrast(94%)"
        },
        {
          "layer": "overlay",
          "assetKey": "premiumSmallStoneScatter",
          "xRatio": 0.2,
          "widthRatio": 0.24,
          "height": 38,
          "yOffset": -54,
          "alpha": 0.58,
          "rotation": 4,
          "filter": "sepia(10%) saturate(84%) brightness(91%) contrast(98%)"
        },
        {
          "layer": "overlay",
          "assetKey": "premiumSmallStoneScatter",
          "xRatio": 0.82,
          "widthRatio": 0.22,
          "height": 36,
          "yOffset": -52,
          "alpha": 0.54,
          "rotation": -5,
          "mirrorX": true,
          "filter": "sepia(10%) saturate(84%) brightness(91%) contrast(98%)"
        },
        {
          "layer": "overlay",
          "assetKey": "premiumLongSandLip",
          "xRatio": 0.58,
          "widthRatio": 0.3,
          "height": 42,
          "yOffset": -46,
          "alpha": 0.42,
          "rotation": 1,
          "filter": "sepia(12%) saturate(86%) brightness(93%) contrast(96%)"
        }
      ],
      "label": "production Scribe Locked Chamber exterior with raised platform, crumbled stairs, glowing hieroglyphs, and sealed doorway"
    },
    {
      "id": "desert-entry-premium-column-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "desertEntryPremiumFallenColumn",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 2338,
      "y": 621,
      "width": 108,
      "height": 70,
      "shadowOpacity": 0.2,
      "shadowWidth": 210,
      "sandMoundWidth": 0,
      "sandOverlapHeight": 32,
      "groundPebbles": 6,
      "label": "generated premium carved fallen column in open sand after the pyramid",
      "yOffset": 32,
      "depth": "foreground-occluder",
      "layer": "route-edge",
      "zIndex": 2,
      "scale": 2.3,
      "rotation": 50,
      "mirrorX": true,
      "mirrorY": false,
      "brightness": 0.7,
      "colorGradeFilter": "saturate(104%) sepia(12%) contrast(82%) hue-rotate(1deg)",
      "shadowHeight": 24,
      "sandMoundHeight": 1,
      "groundContactLayer": []
    },
    {
      "id": "desert-entry-premium-pillar-caps-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "desertEntryPremiumPillarCaps",
      "placementPreset": "desertEntryGroundedRuin",
      "x": 2245,
      "y": 610,
      "width": 74,
      "height": 119,
      "shadowOpacity": 0.3,
      "shadowWidth": 82,
      "sandMoundWidth": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 24,
      "label": "generated premium pillar-cap ruins in open sand after the pyramid",
      "yOffset": 21,
      "depth": "midground",
      "layer": "midground",
      "zIndex": 42,
      "scale": 1.75,
      "mirrorX": true,
      "colorGradeFilter": "saturate(104%) sepia(12%) contrast(82%) hue-rotate(1deg)",
      "shadowHeight": 1,
      "sandMoundHeight": 0,
      "brightness": 0.75
    },
    {
      "id": "opening-rubble-left",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "rubbleDustSmall",
      "x": 217,
      "y": 561,
      "width": 112,
      "height": 42,
      "yOffset": 8,
      "alpha": 1,
      "depth": "midground",
      "tint": "warm",
      "shadow": 0.08,
      "dust": 0.66,
      "bury": 0.18,
      "label": "scattered rubble at the base of the pyramid left approach"
    },
    {
      "id": "opening-supply-jars-left",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "supplyJars",
      "x": 319,
      "y": 557,
      "width": 72,
      "height": 50,
      "yOffset": 8,
      "alpha": 1,
      "depth": "midground",
      "tint": "warm",
      "shadow": 0.08,
      "dust": 0.54,
      "bury": 0.26,
      "label": "supply jar cluster at the pyramid base left — expedition camp cache"
    },
    {
      "id": "opening-fallen-column-base",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "fallenColumn",
      "x": 1003,
      "y": 557,
      "width": 122,
      "height": 48,
      "yOffset": 8,
      "alpha": 1,
      "depth": "midground",
      "tint": "warm",
      "shadow": 0.11,
      "dust": 0.64,
      "bury": 0.22,
      "label": "fallen stone column at the pyramid base right — once framed the entrance"
    },
    {
      "id": "desert-entry-sand-piles-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "sand_piles",
      "scale": 1.8,
      "layer": "route-edge",
      "x": 3751,
      "y": 715,
      "label": "sand piles",
      "height": 87,
      "brightness": 1.15,
      "depth": "route-edge",
      "colorGradeFilter": "sepia(21%) saturate(103%) brightness(84%) contrast(100%)",
      "zIndex": 58,
      "mirrorX": true
    },
    {
      "id": "desert-entry-rubble-mounds-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "rubble_mounds",
      "scale": 1.1,
      "layer": "route-edge",
      "x": 3349,
      "y": 519,
      "label": "rubble mounds",
      "depth": "route-edge"
    },
    {
      "id": "desert-entry-broken-pottery-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "broken_pottery",
      "scale": 1.15,
      "layer": "ruin-detail",
      "x": 3787,
      "y": 517,
      "label": "broken pottery",
      "depth": "grounded",
      "mirrorX": false,
      "shadowOpacity": 0,
      "shadowWidth": 0,
      "shadowHeight": 0,
      "sandOverlapHeight": 0,
      "sandMoundWidth": 0,
      "sandMoundHeight": 0,
      "groundPebbles": 15,
      "zIndex": 7,
      "width": 123,
      "colorGradeFilter": "saturate(72%) sepia(30%) contrast(94%)"
    },
    {
      "id": "desert-entry-cracked-stone-blocks-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "cracked_stone_blocks",
      "scale": 0.9,
      "layer": "route-edge",
      "x": 3524,
      "y": 432,
      "label": "cracked stone blocks",
      "rotation": 10,
      "colorGradeFilter": "saturate(162%) contrast(99%) hue-rotate(9deg)",
      "alpha": 1,
      "shadowOpacity": 0.22,
      "shadowWidth": 106,
      "sandOverlapHeight": 10,
      "sandMoundWidth": 118,
      "groundPebbles": 4,
      "depth": "route-edge",
      "zIndex": 91,
      "brightness": 1.15,
      "yOffset": -5,
      "height": 164,
      "mirrorX": true,
      "width": 118
    },
    {
      "id": "desert-entry-fallen-lintel-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "fallen_lintel",
      "scale": 1.4,
      "layer": "foreground",
      "x": 583,
      "y": 350,
      "label": "fallen lintel",
      "width": 118,
      "height": 112,
      "rotation": 4,
      "mirrorX": true,
      "shadowOpacity": 0.3,
      "shadowWidth": 111,
      "sandOverlapHeight": 0,
      "sandMoundWidth": 0,
      "groundPebbles": 0,
      "depth": "grounded",
      "brightness": 0.9,
      "colorGradeFilter": "saturate(113%) contrast(98%)",
      "editorBoundsInsetTop": 31,
      "editorBoundsInsetBottom": 31,
      "zIndex": -70,
      "shadowHeight": 0,
      "sandMoundHeight": 1,
      "groundContactLayer": []
    },
    {
      "id": "desert-entry-fallen-lintel-1-copy-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "fallen_lintel",
      "scale": 1.4,
      "layer": "foreground",
      "x": 342,
      "y": 541,
      "label": "fallen lintel",
      "width": 118,
      "height": 107,
      "rotation": 3,
      "shadowOpacity": 0.3,
      "shadowWidth": 122,
      "sandOverlapHeight": 0,
      "sandMoundWidth": 0,
      "groundPebbles": 0,
      "depth": "grounded",
      "mirrorX": true,
      "brightness": 0.9,
      "colorGradeFilter": "saturate(113%) contrast(98%)",
      "shadowHeight": 9,
      "sandMoundHeight": 0,
      "yOffset": -18
    },
    {
      "id": "desert-entry-incense-stands-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "incense_stands",
      "scale": 1,
      "layer": "route-edge",
      "x": 1032,
      "y": 156,
      "label": "incense stands",
      "yOffset": 2,
      "width": 111,
      "rotation": 0,
      "mirrorX": false,
      "mirrorY": false,
      "brightness": 0.65,
      "shadowOpacity": 0.16,
      "shadowWidth": 3,
      "sandOverlapHeight": 7,
      "sandMoundWidth": 0,
      "groundPebbles": 2,
      "depth": "foreground-occluder",
      "height": 103,
      "zIndex": 58
    },
    {
      "id": "desert-entry-route-gate-front-1",
      "sectionId": "desert-entry",
      "type": "route-gate-prop",
      "imageAssetKey": "routeGateFront",
      "assetPath": "assets/expedition/environment/egypt-opening/route-gate-front.png",
      "width": 316,
      "height": 257,
      "scale": 1,
      "layer": "foreground",
      "depth": "foreground-occluder",
      "tint": "stone",
      "alpha": 0.98,
      "shadowOpacity": 0,
      "sandOverlapHeight": 8,
      "sandMoundWidth": 0,
      "x": 5921,
      "y": 616,
      "zIndex": 290,
      "label": "route gate front",
      "groundContactLayer": [],
      "colorGradeFilter": "saturate(96%) sepia(18%) contrast(98%)",
      "sandMoundHeight": 0,
      "mirrorX": true,
      "mirrorY": true,
      "rotation": 180
    },
    {
      "id": "desert-entry-route-gate-back-1",
      "sectionId": "desert-entry",
      "type": "route-gate-prop",
      "imageAssetKey": "routeGateBack",
      "assetPath": "assets/expedition/environment/egypt-opening/route-gate-back.png",
      "width": 316,
      "height": 219,
      "scale": 1.8,
      "layer": "foreground",
      "depth": "foreground-occluder",
      "tint": "stone",
      "alpha": 0.94,
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "sandMoundWidth": 250,
      "mirrorX": false,
      "x": 5718,
      "y": 645,
      "zIndex": -155,
      "label": "route gate back",
      "mirrorY": false,
      "groundContactLayer": [],
      "colorGradeFilter": "saturate(96%) sepia(18%) contrast(98%)",
      "shadowWidth": 0,
      "shadowHeight": 0,
      "groundPebbles": 0,
      "sandMoundHeight": 21
    },
    {
      "id": "desert-entry-wooden-crates-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "wooden_crates",
      "scale": 1.15,
      "layer": "ruin-detail",
      "x": 2154,
      "y": 622,
      "label": "wooden crates",
      "height": 121,
      "editorBoundsInsetBottom": 26,
      "depth": "route-edge",
      "sandMoundHeight": 0,
      "editorBoundsInsetLeft": 16,
      "zIndex": 73,
      "colorGradeFilter": "saturate(98%) sepia(30%) contrast(109%) hue-rotate(1deg)",
      "brightness": 0.8
    },
    {
      "id": "desert-entry-canopic-jars-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "canopic_jars",
      "scale": 1.25,
      "layer": "ruin-detail",
      "x": 3845,
      "y": 431,
      "label": "canopic jars",
      "yOffset": 10,
      "brightness": 1,
      "depth": "grounded",
      "colorGradeFilter": "saturate(96%) sepia(18%) contrast(133%) hue-rotate(2deg)",
      "shadowWidth": 0,
      "shadowOpacity": 0,
      "shadowHeight": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 0
    },
    {
      "id": "desert-entry-ram-statue-fragment-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "ram_statue_fragment",
      "scale": 0.85,
      "layer": "foreground",
      "x": 3903,
      "y": 270,
      "label": "ram statue fragment",
      "rotation": 0,
      "mirrorX": true,
      "zIndex": -40,
      "sandMoundHeight": 0,
      "groundPebbles": 0,
      "shadowOpacity": 0.31,
      "shadowWidth": 10,
      "colorGradeFilter": "saturate(119%) contrast(140%)",
      "sandOverlapHeight": 0,
      "shadowHeight": 7,
      "depth": "grounded"
    },
    {
      "id": "desert-entry-opening-pyramid-rubble-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "openingPyramidRubble",
      "width": 128,
      "height": 58,
      "scale": 1.15,
      "layer": "foreground",
      "depth": "route-edge",
      "tint": "buried-stone",
      "colorGradeFilter": "sepia(24%) hue-rotate(12deg) saturate(58%) brightness(72%) contrast(116%)",
      "alpha": 0.96,
      "shadowOpacity": 0.14,
      "sandOverlapHeight": 5,
      "sandMoundWidth": 116,
      "groundPebbles": 2,
      "x": 3276,
      "y": 377,
      "label": "opening pyramid rubble",
      "mirrorY": false,
      "mirrorX": true,
      "zIndex": 117
    },
    {
      "id": "desert-entry-opening-pyramid-cracked-block-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "openingPyramidCrackedBlock",
      "width": 325,
      "height": 82,
      "scale": 1,
      "layer": "foreground",
      "depth": "route-edge",
      "tint": "buried-stone",
      "colorGradeFilter": "saturate(127%) sepia(2%) contrast(107%)",
      "alpha": 0.97,
      "shadowOpacity": 0,
      "sandOverlapHeight": 6,
      "sandMoundWidth": 0,
      "groundPebbles": 2,
      "x": 3456,
      "y": 457,
      "label": "opening pyramid cracked block",
      "shadowHeight": 0,
      "shadowWidth": 0,
      "sandMoundHeight": 0
    },
    {
      "id": "desert-entry-ledge-helper-excavation-assist-kit-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "ledgeHelperExcavationAssistKit",
      "width": 332,
      "height": 249,
      "scale": 0.9,
      "layer": "foreground",
      "depth": "route-edge",
      "placementPreset": "desertEntryGroundedRuin",
      "tint": "warm",
      "colorGradeFilter": "saturate(113%) contrast(98%)",
      "alpha": 0.97,
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "sandMoundWidth": 292,
      "groundPebbles": 3,
      "x": 80,
      "y": 655,
      "label": "excavation assist kit",
      "yOffset": 66,
      "rotation": 180,
      "mirrorX": false,
      "mirrorY": true,
      "shadowHeight": 0,
      "brightness": 0.85
    },
    {
      "id": "desert-entry-premium-short-sand-lip-1",
      "sectionId": "desert-entry",
      "type": "ground-contact-detail-prop",
      "groundDetailAssetKey": "premiumShortSandLip",
      "width": 389,
      "height": 32,
      "depth": "grounded",
      "layer": "route-edge",
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 0,
      "groundContactLayer": [
        {
          "assetKey": "premiumShortSandLip",
          "layer": "overlay",
          "filter": "saturate(78%) sepia(16%) contrast(90%) hue-rotate(3deg)",
          "mode": "stretch",
          "alignY": "bottom",
          "xRatio": 0.5,
          "widthRatio": 1,
          "yOffset": -48,
          "height": 48,
          "alpha": 0.86,
          "mirrorX": false
        }
      ],
      "x": 1241,
      "y": 603,
      "label": "short sand lip",
      "scale": 0.65,
      "colorGradeFilter": "saturate(107%) sepia(11%) contrast(136%) hue-rotate(-3deg)",
      "brightness": 0.85,
      "zIndex": -43
    },
    {
      "id": "desert-entry-premium-short-sand-lip-2",
      "sectionId": "desert-entry",
      "type": "ground-contact-detail-prop",
      "groundDetailAssetKey": "premiumShortSandLip",
      "width": 248,
      "height": 24,
      "depth": "route-edge",
      "layer": "route-edge",
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 0,
      "brightness": 0.85,
      "colorGradeFilter": "saturate(96%) sepia(20%) contrast(98%)",
      "groundContactLayer": [
        {
          "assetKey": "premiumShortSandLip",
          "layer": "overlay",
          "mode": "stretch",
          "alignY": "bottom",
          "xRatio": 0.5,
          "widthRatio": 1,
          "yOffset": -48,
          "height": 48,
          "alpha": 1
        }
      ],
      "x": 1760,
      "y": 590,
      "label": "short sand lip",
      "zIndex": 110,
      "scale": 0.75
    },
    {
      "id": "desert-entry-premium-rubble-contact-shadow-1",
      "sectionId": "desert-entry",
      "type": "ground-contact-detail-prop",
      "groundDetailAssetKey": "premiumRubbleContactShadow",
      "width": 345,
      "height": 52,
      "depth": "route-edge",
      "layer": "route-edge",
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 0,
      "brightness": 1.1,
      "colorGradeFilter": "saturate(126%) contrast(98%)",
      "groundContactLayer": [
        {
          "assetKey": "premiumRubbleContactShadow",
          "layer": "overlay",
          "mode": "stretch",
          "alignY": "bottom",
          "xRatio": 0.5,
          "widthRatio": 1,
          "yOffset": -52,
          "height": 52,
          "alpha": 1
        }
      ],
      "x": 909,
      "y": 596,
      "label": "rubble contact shadow",
      "rotation": -5,
      "zIndex": 7
    },
    {
      "id": "desert-entry-premium-carved-stone-edge-1",
      "sectionId": "desert-entry",
      "type": "ground-contact-detail-prop",
      "groundDetailAssetKey": "premiumCarvedStoneEdge",
      "width": 172,
      "height": 56,
      "depth": "route-edge",
      "layer": "route-edge",
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 0,
      "brightness": 1,
      "colorGradeFilter": "saturate(104%) sepia(12%) contrast(82%) hue-rotate(1deg)",
      "groundContactLayer": [
        {
          "assetKey": "premiumCarvedStoneEdge",
          "layer": "overlay",
          "mode": "stretch",
          "alignY": "bottom",
          "xRatio": 0.5,
          "widthRatio": 1,
          "yOffset": -56,
          "height": 81,
          "alpha": 1,
          "filter": "saturate(92%) sepia(28%) contrast(90%) hue-rotate(6deg)"
        }
      ],
      "x": 1581,
      "y": 577,
      "label": "carved stone edge"
    },
    {
      "id": "desert-entry-premium-carved-stone-edge-2",
      "sectionId": "desert-entry",
      "type": "ground-contact-detail-prop",
      "groundDetailAssetKey": "premiumCarvedStoneEdge",
      "width": 191,
      "height": 56,
      "depth": "route-edge",
      "layer": "route-edge",
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 0,
      "brightness": 0.95,
      "colorGradeFilter": "saturate(72%) sepia(30%) contrast(94%)",
      "groundContactLayer": [
        {
          "assetKey": "premiumCarvedStoneEdge",
          "layer": "overlay",
          "filter": "saturate(145%) sepia(17%) contrast(78%) hue-rotate(3deg)",
          "mode": "stretch",
          "alignY": "bottom",
          "xRatio": 0.5,
          "widthRatio": 1,
          "yOffset": -56,
          "height": 56,
          "alpha": 1
        }
      ],
      "x": 1688,
      "y": 586,
      "label": "carved stone edge"
    },
    {
      "id": "desert-entry-damaged-jackal-statue-1",
      "sectionId": "desert-entry",
      "type": "damaged-jackal-statue",
      "x": 2075,
      "y": 512,
      "label": "damaged jackal statue",
      "depth": "grounded",
      "zIndex": 0,
      "colorGradeFilter": "saturate(104%) sepia(12%) contrast(82%) hue-rotate(1deg)",
      "sandMoundWidth": 0,
      "sandMoundHeight": 0,
      "groundPebbles": 0,
      "sandOverlapHeight": 0,
      "shadowHeight": 0,
      "brightness": 0.9,
      "scale": 1.4
    },
    {
      "id": "desert-entry-old-baskets-1",
      "sectionId": "desert-entry",
      "type": "atmosphere-prop",
      "atmosphereAssetKey": "old_baskets",
      "scale": 1,
      "layer": "foreground",
      "x": 2042,
      "y": 601,
      "label": "old baskets",
      "depth": "route-edge",
      "colorGradeFilter": "saturate(98%) sepia(30%) contrast(109%) hue-rotate(1deg)",
      "brightness": 0.9,
      "zIndex": 64,
      "mirrorX": false
    },
    {
      "id": "desert-entry-premium-small-stone-scatter-1",
      "sectionId": "desert-entry",
      "type": "ground-contact-detail-prop",
      "groundDetailAssetKey": "premiumSmallStoneScatter",
      "width": 5,
      "height": 55,
      "depth": "route-edge",
      "layer": "route-edge",
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 0,
      "brightness": 1,
      "colorGradeFilter": "sepia(47%) contrast(134%)",
      "groundContactLayer": [
        {
          "assetKey": "premiumSmallStoneScatter",
          "layer": "overlay",
          "xRatio": 0.5,
          "widthRatio": 1,
          "height": 55,
          "yOffset": -55,
          "alpha": 0.64,
          "mode": "stretch",
          "alignY": "bottom"
        }
      ],
      "x": 544,
      "y": 590,
      "label": "small stone scatter"
    },
    {
      "id": "desert-entry-premium-rubble-contact-shadow-2",
      "sectionId": "desert-entry",
      "type": "ground-contact-detail-prop",
      "groundDetailAssetKey": "premiumRubbleContactShadow",
      "width": 284,
      "height": 52,
      "depth": "route-edge",
      "layer": "route-edge",
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 0,
      "brightness": 1.15,
      "colorGradeFilter": "saturate(113%)",
      "groundContactLayer": [
        {
          "assetKey": "premiumRubbleContactShadow",
          "layer": "overlay",
          "mode": "stretch",
          "alignY": "bottom",
          "xRatio": 0.5,
          "widthRatio": 1,
          "yOffset": -52,
          "height": 52,
          "alpha": 1
        }
      ],
      "x": 623,
      "y": 591,
      "label": "rubble contact shadow"
    },
    {
      "id": "desert-entry-premium-short-sand-lip-1-copy-1",
      "sectionId": "desert-entry",
      "type": "ground-contact-detail-prop",
      "groundDetailAssetKey": "premiumShortSandLip",
      "width": 389,
      "height": 32,
      "depth": "route-edge",
      "layer": "route-edge",
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 0,
      "groundContactLayer": [
        {
          "assetKey": "premiumShortSandLip",
          "layer": "overlay",
          "mode": "stretch",
          "alignY": "bottom",
          "xRatio": 0.5,
          "widthRatio": 1,
          "yOffset": -48,
          "height": 48,
          "alpha": 1
        }
      ],
      "x": 1484,
      "y": 606,
      "label": "short sand lip",
      "scale": 0.65,
      "colorGradeFilter": "saturate(96%) sepia(18%) contrast(98%)",
      "brightness": 0.95,
      "zIndex": 33
    },
    {
      "id": "desert-entry-premium-broken-masonry-footing-1",
      "sectionId": "desert-entry",
      "type": "ground-contact-detail-prop",
      "groundDetailAssetKey": "premiumBrokenMasonryFooting",
      "width": 217,
      "height": 64,
      "depth": "route-edge",
      "layer": "route-edge",
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 0,
      "brightness": 1,
      "colorGradeFilter": "saturate(104%) sepia(12%) contrast(82%) hue-rotate(1deg)",
      "groundContactLayer": [
        {
          "assetKey": "premiumBrokenMasonryFooting",
          "layer": "overlay",
          "mode": "stretch",
          "alignY": "bottom",
          "xRatio": 0.53,
          "widthRatio": 1,
          "yOffset": -64,
          "height": 70,
          "rotation": -1,
          "alpha": 1,
          "mirrorX": true
        }
      ],
      "x": 1907,
      "y": 592,
      "label": "broken masonry footing",
      "mirrorX": false,
      "mirrorY": false,
      "scale": 1.1,
      "sandMoundHeight": 0
    },
    {
      "id": "desert-entry-premium-rubble-contact-shadow-3",
      "sectionId": "desert-entry",
      "type": "ground-contact-detail-prop",
      "groundDetailAssetKey": "premiumRubbleContactShadow",
      "width": 170,
      "height": 86,
      "depth": "grounded",
      "layer": "route-edge",
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 0,
      "brightness": 1,
      "colorGradeFilter": "saturate(113%) contrast(98%)",
      "groundContactLayer": [
        {
          "assetKey": "premiumRubbleContactShadow",
          "layer": "overlay",
          "mode": "stretch",
          "alignY": "bottom",
          "xRatio": 0.5,
          "widthRatio": 1,
          "yOffset": -52,
          "height": 24,
          "rotation": -3,
          "alpha": 1
        }
      ],
      "x": 553,
      "y": 334,
      "label": "rubble contact shadow",
      "scale": 0.7
    },
    {
      "id": "desert-entry-premium-rubble-contact-shadow-4",
      "sectionId": "desert-entry",
      "type": "ground-contact-detail-prop",
      "groundDetailAssetKey": "premiumRubbleContactShadow",
      "width": 147,
      "height": 21,
      "depth": "route-edge",
      "layer": "route-edge",
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 0,
      "brightness": 1,
      "colorGradeFilter": "saturate(113%) contrast(98%)",
      "groundContactLayer": [
        {
          "assetKey": "premiumRubbleContactShadow",
          "layer": "overlay",
          "mode": "stretch",
          "alignY": "bottom",
          "xRatio": 0.47,
          "widthRatio": 1,
          "yOffset": -38,
          "height": 29,
          "alpha": 0.99
        }
      ],
      "x": 371,
      "y": 492,
      "label": "rubble contact shadow"
    },
    {
      "id": "desert-entry-right-prop-sand-cover-strip",
      "x": 2729,
      "y": 588,
      "groundContactLayer": [
        {
          "assetKey": "premiumLongSandLip",
          "layer": "underlay",
          "filter": "sepia(28%) saturate(80%) brightness(88%) contrast(88%) hue-rotate(5deg)",
          "mode": "stretch",
          "alignY": "bottom",
          "xRatio": 0.5,
          "widthRatio": 1,
          "yOffset": -44,
          "height": 44,
          "alpha": 1
        }
      ],
      "colorGradeFilter": "saturate(96%) sepia(18%) contrast(98%)",
      "mirrorY": true,
      "depth": "route-edge",
      "sectionId": "desert-entry",
      "type": "ground-contact-detail-prop",
      "groundDetailAssetKey": "premiumLongSandLip",
      "width": 610,
      "height": 38,
      "layer": "route-edge",
      "label": "right prop cluster sand cover strip",
      "brightness": 0.82,
      "zIndex": 4,
      "shadowOpacity": 0,
      "sandOverlapHeight": 0,
      "groundPebbles": 0
    }
  ],
  "deletedPropIds": [
    "desert-entry-premium-threshold-slab-1",
    "opening-pillar-caps-base",
    "desert-entry-rubble-scatter-1"
  ],
  "platforms": [
    {
      "id": "desert-entry-floor",
      "x": 56,
      "y": 595,
      "width": 13334,
      "height": 73,
      "label": "desert track"
    },
    {
      "id": "desert-entry-floor-1",
      "sectionId": "desert-entry",
      "width": 320,
      "height": 60,
      "label": "editable floor",
      "invisible": true,
      "layer": "floor",
      "x": 3533,
      "y": 534
    },
    {
      "id": "opening-lower-ruin-ledge",
      "x": 102,
      "y": 475,
      "width": 330,
      "height": 18,
      "label": "invisible marked lower pyramid ledge",
      "invisible": true
    },
    {
      "id": "opening-first-terrace",
      "x": 879,
      "y": -26,
      "width": 402,
      "height": 18,
      "label": "invisible marked first pyramid terrace",
      "invisible": true
    },
    {
      "id": "opening-second-terrace",
      "x": 611,
      "y": 137,
      "width": 404,
      "height": 18,
      "label": "invisible marked second pyramid terrace",
      "invisible": true
    },
    {
      "id": "opening-scarab-seal-summit",
      "x": 966,
      "y": -46,
      "width": 333,
      "height": 18,
      "label": "invisible marked scarab artefact platform",
      "invisible": true
    },
    {
      "id": "mummification-chamber-bottom-secret-threshold",
      "x": 3821,
      "y": 132,
      "width": 79,
      "height": 18,
      "label": "invisible bottom secret threshold at the base of the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-sand-buried-block",
      "x": 4541,
      "y": 487,
      "width": 176,
      "height": 18,
      "label": "invisible buried block at the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-far-left-ground-shelf",
      "x": 3529,
      "y": 408,
      "width": 176,
      "height": 18,
      "label": "invisible far left ground shelf on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-right-low-landing",
      "x": 4548,
      "y": 28,
      "width": 197,
      "height": 18,
      "label": "invisible right low landing on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-central-left-shelf",
      "x": 4410,
      "y": 354,
      "width": 210,
      "height": 18,
      "label": "invisible central left shelf on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-right-stair-landing",
      "x": 4727,
      "y": 415,
      "width": 121,
      "height": 18,
      "label": "invisible right stair landing on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-left-lower-terrace",
      "x": 4016,
      "y": 456,
      "width": 233,
      "height": 18,
      "label": "invisible left lower terrace on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-central-drop-slab",
      "x": 4118,
      "y": 290,
      "width": 247,
      "height": 18,
      "label": "invisible central drop slab on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-carved-lower-ledge",
      "x": 4506,
      "y": 209,
      "width": 258,
      "height": 18,
      "label": "invisible carved lower ledge on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-left-sandstone-shelf",
      "x": 3770,
      "y": 339,
      "width": 231,
      "height": 18,
      "label": "invisible left sandstone shelf on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-right-column-cap",
      "x": 3930,
      "y": -2,
      "width": 128,
      "height": 18,
      "label": "invisible right column cap on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-left-column-cap",
      "x": 3690,
      "y": 198,
      "width": 101,
      "height": 18,
      "label": "invisible left column cap on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-upper-rite-ledge",
      "x": 4684,
      "y": 61,
      "width": 218,
      "height": 18,
      "label": "invisible upper rite ledge at the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-left-pedestal-top",
      "x": 3993,
      "y": 197,
      "width": 150,
      "height": 18,
      "label": "invisible left pedestal top cap on the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-left-doorway-ledge",
      "x": 4285,
      "y": 98,
      "width": 240,
      "height": 18,
      "label": "invisible left doorway ledge at the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-upper-right-platform",
      "x": 4126,
      "y": 56,
      "width": 269,
      "height": 18,
      "label": "invisible upper right platform at the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-doorway-floor",
      "x": 4800,
      "y": 13,
      "width": 228,
      "height": 18,
      "label": "invisible high doorway floor at the Mummification Chamber entrance",
      "secret": true,
      "invisible": true
    },
    {
      "id": "mummification-chamber-upper-left-platform",
      "x": 4121,
      "y": -66,
      "width": 219,
      "height": 18,
      "label": "invisible upper left platform at the Mummification Chamber exterior",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-lower-masonry",
      "x": 7534,
      "y": 191,
      "width": 104,
      "height": 18,
      "label": "invisible collapsed ceremonial masonry step over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-carved-wall-ledge",
      "x": 7297,
      "y": 484,
      "width": 133,
      "height": 18,
      "label": "invisible carved wall ledge in hidden priest passage art",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-broken-warning-step",
      "x": 7080,
      "y": 536,
      "width": 149,
      "height": 18,
      "label": "invisible broken warning-stone ledge over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-priest-passage-shelf",
      "x": 6822,
      "y": 454,
      "width": 79,
      "height": 18,
      "label": "invisible hidden priest passage shelf over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-column-shelf",
      "x": 7052,
      "y": 328,
      "width": 63,
      "height": 18,
      "label": "invisible right-side column shelf over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-upper-doorway-floor",
      "x": 7528,
      "y": 193,
      "width": 250,
      "height": 18,
      "label": "invisible upper doorway floor over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-forward-passage-step",
      "x": 7301,
      "y": 246,
      "width": 174,
      "height": 18,
      "label": "invisible forward stonework return from the hidden alcove over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-return-masonry",
      "x": 7505,
      "y": 398,
      "width": 390,
      "height": 18,
      "label": "invisible return masonry over generated mural structure",
      "secret": true,
      "invisible": true
    },
    {
      "id": "forgotten-mural-lower-return",
      "x": 6894,
      "y": 368,
      "width": 122,
      "height": 18,
      "label": "invisible lower return ledge from priest passage over generated art",
      "secret": true,
      "invisible": true
    },
    {
      "id": "scribe-chamber-buried-lower-block",
      "x": 10379,
      "y": 519,
      "width": 95,
      "height": 18,
      "label": "invisible buried lower block at the Scribe Chamber platform",
      "secret": true,
      "invisible": true
    },
    {
      "id": "scribe-chamber-collapsed-stair-slab",
      "x": 10633,
      "y": 473,
      "width": 120,
      "height": 18,
      "label": "invisible collapsed stair slab at the Scribe Chamber platform",
      "secret": true,
      "invisible": true
    },
    {
      "id": "scribe-chamber-middle-rubble-landing",
      "x": 10780,
      "y": 433,
      "width": 235,
      "height": 18,
      "label": "invisible middle rubble landing at the Scribe Chamber platform",
      "secret": true,
      "invisible": true
    },
    {
      "id": "scribe-chamber-upper-carved-landing",
      "x": 10837,
      "y": 357,
      "width": 210,
      "height": 18,
      "label": "invisible upper carved landing at the Scribe Chamber platform",
      "secret": true,
      "invisible": true
    },
    {
      "id": "scribe-chamber-doorway-threshold",
      "x": 10871,
      "y": 297,
      "width": 180,
      "height": 18,
      "label": "invisible raised doorway threshold at the Scribe Chamber entrance",
      "secret": true,
      "invisible": true
    },
    {
      "id": "desert-entry-platform-2",
      "sectionId": "desert-entry",
      "width": 94,
      "height": 18,
      "label": "editable platform",
      "invisible": true,
      "layer": "platform",
      "x": 2194,
      "y": 428
    },
    {
      "id": "desert-entry-platform-3",
      "sectionId": "desert-entry",
      "width": 57,
      "height": 15,
      "label": "editable platform",
      "invisible": true,
      "layer": "platform",
      "x": 3483,
      "y": 478
    },
    {
      "id": "desert-entry-platform-4",
      "sectionId": "desert-entry",
      "width": 192,
      "height": 18,
      "label": "editable platform",
      "invisible": true,
      "layer": "platform",
      "x": 8497,
      "y": 91
    },
    {
      "id": "desert-entry-platform-5",
      "sectionId": "desert-entry",
      "width": 114,
      "height": 18,
      "label": "editable platform",
      "invisible": true,
      "layer": "platform",
      "x": 8569,
      "y": 47
    },
    {
      "id": "desert-entry-platform-6",
      "sectionId": "desert-entry",
      "width": 150,
      "height": 20,
      "label": "editable platform",
      "invisible": true,
      "layer": "platform",
      "x": 513,
      "y": 237,
      "zIndex": -17
    },
    {
      "id": "desert-entry-platform-7",
      "sectionId": "desert-entry",
      "width": 154,
      "height": 18,
      "label": "editable platform",
      "invisible": true,
      "layer": "platform",
      "x": 274,
      "y": 416
    },
    {
      "id": "desert-entry-platform-10",
      "sectionId": "desert-entry",
      "width": 50,
      "height": 18,
      "label": "editable platform",
      "invisible": true,
      "layer": "platform",
      "x": 2136,
      "y": 518
    },
    {
      "id": "desert-entry-platform-9",
      "sectionId": "desert-entry",
      "width": 192,
      "height": 18,
      "label": "editable platform",
      "invisible": true,
      "layer": "platform",
      "x": 3390,
      "y": 550
    },
    {
      "id": "desert-entry-platform-11",
      "sectionId": "desert-entry",
      "width": 140,
      "height": 18,
      "label": "editable platform",
      "invisible": true,
      "layer": "platform",
      "x": 821,
      "y": 515
    },
    {
      "id": "desert-entry-platform-8",
      "sectionId": "desert-entry",
      "width": 130,
      "height": 18,
      "label": "editable platform",
      "invisible": true,
      "layer": "platform",
      "x": 28,
      "y": 531
    },
    {
      "id": "temple-floor",
      "x": 16001,
      "y": 595,
      "width": 9323,
      "height": 60,
      "label": "temple floor"
    },
    {
      "id": "catacomb-path-floor",
      "x": 27188,
      "y": 595,
      "width": 10735,
      "height": 60,
      "label": "catacomb path"
    },
    {
      "id": "escape-road-floor",
      "x": 40070,
      "y": 595,
      "width": 8193,
      "height": 60,
      "label": "escape road"
    },
    {
      "id": "dig-site-rise-floor",
      "x": 49901,
      "y": 595,
      "width": 9605,
      "height": 60,
      "label": "dig-site rise"
    },
    {
      "id": "mummification-chamber-floor",
      "sceneId": "mummification-chamber",
      "x": 3539,
      "y": 502,
      "width": 1356,
      "height": 18,
      "label": "invisible full Mummification Chamber floor",
      "secret": true,
      "invisible": true
    },
    {
      "id": "switch-1-raised-return-plinth",
      "x": 18103,
      "y": 539,
      "width": 128,
      "height": 18,
      "label": "switch raised return plinth",
      "requiresObjective": "switch-1"
    },
    {
      "id": "temple-sandfall-cracked-column-step",
      "x": 19255,
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
      "x": 29120,
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
      "x": 34307,
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
      "x": 40816,
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
      "x": 41867,
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
      "x": 52375,
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
  "deletedPlatformIds": [
    "desert-entry-platform-1"
  ],
  "hazards": [
    {
      "id": "sealed-sand",
      "name": "sealed sand",
      "emoji": "!",
      "x": 8678,
      "y": 565,
      "width": 62,
      "height": 30,
      "penalty": {
        "time": 6
      },
      "message": "A marked patch of sealed sand slowed the approach."
    },
    {
      "id": "desert-low-ridge",
      "name": "low sand ridge",
      "emoji": "!",
      "x": 2917,
      "y": 574,
      "width": 71,
      "height": 30,
      "alpha": 0.65,
      "penalty": {
        "time": 4
      },
      "message": "A low sand ridge slowed the survey line."
    },
    {
      "id": "thorn-bush",
      "name": "thorn bush",
      "emoji": "ðŸŒ¿",
      "x": 3605,
      "y": 500,
      "width": 126,
      "height": 70,
      "penalty": {
        "stamina": 5
      },
      "message": "Thorn scrub slowed the team. Stamina reduced.",
      "sectionId": "desert-entry",
      "triggerArea": {
        "x": 0,
        "y": 0,
        "width": 112,
        "height": 58
      },
      "damage": 20,
      "reset": false,
      "cooldown": 1.2,
      "depth": "grounded",
      "linkedObjectIds": [],
      "editorVisible": true,
      "burial": 0.35,
      "brightness": 0.88,
      "alpha": 0.92,
      "colorGradeFilter": "sepia(0%) hue-rotate(8deg) saturate(72%) brightness(78%) contrast(90%)"
    },
    {
      "id": "opening-seal-reset-trap",
      "name": "buried spike trap",
      "emoji": "!",
      "x": 2225,
      "y": 567,
      "width": 134,
      "height": 16,
      "penalty": {
        "stamina": 8
      },
      "message": "Buried spikes jabbed out of the sand. Jump cleanly over them.",
      "sectionId": "desert-entry",
      "triggerArea": {
        "x": 0,
        "y": 0,
        "width": 87,
        "height": 16
      },
      "damage": 15,
      "reset": false,
      "cooldown": 1.2,
      "depth": "foreground-occluder",
      "linkedObjectIds": [],
      "editorVisible": true
    },
    {
      "id": "entry-pressure-plate",
      "name": "pressure plate dart launcher",
      "emoji": "!",
      "type": "dart-launcher",
      "x": 5118,
      "y": 625,
      "width": 170,
      "height": 1,
      "triggerArea": {
        "x": 0,
        "y": 0,
        "width": 126,
        "height": 34
      },
      "damage": 8,
      "reset": true,
      "cooldown": 1.6,
      "depth": "midground",
      "direction": "right",
      "launcherX": 4679,
      "launcherY": 489,
      "penalty": {
        "stamina": 8,
        "time": 3
      },
      "message": "A carved pressure plate shuddered. A wall dart snapped from a hidden launcher.",
      "sectionId": "desert-entry",
      "linkedObjectIds": [],
      "editorVisible": true,
      "roomId": "desert-entry"
    },
    {
      "id": "entry-cracked-floor-trap",
      "name": "cracked collapsing floor",
      "emoji": "!",
      "type": "collapsing-stone-floor",
      "x": 5959,
      "y": 587,
      "width": 104,
      "height": 32,
      "triggerArea": {
        "x": 0,
        "y": -4,
        "width": 104,
        "height": 36
      },
      "damage": 9,
      "reset": false,
      "cooldown": 0.9,
      "depth": "grounded",
      "penalty": {
        "stamina": 9
      },
      "message": "Cracked floor stones shook, then gave way underfoot.",
      "sectionId": "desert-entry",
      "linkedObjectIds": [],
      "editorVisible": true,
      "roomId": "desert-entry"
    },
    {
      "id": "sand-pit",
      "name": "hidden sand pit",
      "emoji": "!",
      "type": "hidden-sand-pit",
      "x": 7187,
      "y": 563,
      "width": 132,
      "height": 32,
      "triggerArea": {
        "x": 6,
        "y": -2,
        "width": 120,
        "height": 34
      },
      "damage": 7,
      "reset": false,
      "cooldown": 1.2,
      "depth": "grounded",
      "linkedObjectIds": [
        "opening-lower-passage-hint"
      ],
      "penalty": {
        "time": 9
      },
      "message": "The disturbed sand gave way beneath Asha.",
      "sectionId": "desert-entry",
      "editorVisible": true,
      "roomId": "desert-entry"
    },
    {
      "id": "desert-soft-ridge",
      "name": "soft sand ridge",
      "emoji": "!",
      "x": 7034,
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
      "x": 7797,
      "y": 565,
      "width": 74,
      "height": 30,
      "penalty": {
        "stamina": 5
      },
      "message": "Loose ruin stones shifted underfoot."
    },
    {
      "id": "loose-temple-floor",
      "name": "loose temple floor",
      "emoji": "!",
      "x": 23866,
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
      "x": 36985,
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
      "x": 47460,
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
      "x": 54206,
      "y": 565,
      "width": 76,
      "height": 30,
      "penalty": {
        "time": 6
      },
      "message": "Survey ropes slowed the final site access path."
    },
    {
      "id": "spike-trap",
      "name": "temple trap",
      "emoji": "ðŸ§±",
      "x": 19730,
      "y": 565,
      "width": 70,
      "height": 30,
      "penalty": {
        "stamina": 12
      },
      "message": "A temple trap clipped your route. Endurance reduced."
    },
    {
      "id": "temple-loose-step",
      "name": "loose stone step",
      "emoji": "!",
      "x": 17459,
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
      "x": 25662,
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
      "x": 29290,
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
      "x": 28781,
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
      "x": 36138,
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
      "x": 42104,
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
      "x": 41731,
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
      "x": 46240,
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
      "x": 51359,
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
      "x": 52681,
      "y": 565,
      "width": 110,
      "height": 30,
      "penalty": {
        "stamina": 10
      },
      "message": "Loose stones made the final climb harder."
    },
    {
      "id": "temple-threshold-hairline-crack",
      "name": "hairline floor crack",
      "emoji": "!",
      "x": 16712,
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
      "x": 18611,
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
      "x": 18917,
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
      "x": 19391,
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
      "x": 22543,
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
      "x": 20306,
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
      "x": 30679,
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
      "x": 33900,
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
      "x": 43867,
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
      "x": 45799,
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
      "x": 52104,
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
      "x": 55562,
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
      "x": 7174,
      "y": 320,
      "width": 34,
      "height": 274,
      "hideArchVisual": true,
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
      "x": 5765,
      "y": 497,
      "width": 100,
      "height": 274,
      "hideArchVisual": true,
      "message": "Sealed. Read the Lost Map Tablet (behind you in the desert) and restore 6 relic fragments to pass.",
      "requires": {
        "objective": "desert-entry",
        "shards": 6
      }
    },
    {
      "id": "desert-entry-scorpion-nest-gate",
      "x": 2977,
      "y": 338
    },
    {
      "id": "desert-seal",
      "name": "Desert Map Seal",
      "x": 15492,
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
  "routeGateDoorways": [],
  "checkpoints": [
    {
      "id": "desert-entry",
      "name": "Desert Entry",
      "x": 542,
      "markerX": 163,
      "y": 517
    },
    {
      "id": "desert-survey-marker",
      "name": "Desert Survey Checkpoint",
      "x": 6306,
      "y": 517
    }
  ],
  "miniBosses": [
    {
      "id": "scarab-queen",
      "sectionId": "desert-entry",
      "name": "Scarab Queen",
      "type": "scarab",
      "x": 14578,
      "y": 553,
      "width": 58,
      "height": 42,
      "patrolMin": 14171,
      "patrolMax": 15018,
      "speed": 66,
      "health": 1,
      "damage": 4,
      "shards": 6,
      "intro": "Buried Lair: Scarab Queen. The buried scarab lair splits open beneath the sand. The Scarab Queen rises as the first trial of Anubis. The site will not yield easily.",
      "dialogue": "The buried scarab lair splits open beneath the sand. The Scarab Queen rises as the first trial of Anubis. The site will not yield easily.",
      "domainName": "First Guardian Domain",
      "arenaStart": 13669,
      "arenaEnd": 15146,
      "lairX": 14579,
      "lairY": 583,
      "lairWidth": 689,
      "lairHeight": 268
    }
  ]
};

export default journeyPlacementOverrides;
