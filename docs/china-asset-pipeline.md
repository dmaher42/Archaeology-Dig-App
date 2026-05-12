# Ancient China Asset Pipeline

Status: planning document only.

This document prepares the Ancient China expedition asset pipeline without making China playable, adding runtime imports, or changing the current Ancient Egypt flow. The canonical campaign/stage config is `src/components/expedition/expeditionStages.js`; Ancient Egypt remains the only playable Lost Site Expedition stage.

## Source Of Truth

- Stage and campaign config: `src/components/expedition/expeditionStages.js`
- Stage Select and Egypt excavation flow: `src/components/ExpeditionMode.jsx`
- Journey runtime: `src/components/ExpeditionJourney.jsx`
- Journey level data: `src/components/expedition-journey/journeyLevelData.js`
- Journey environment tile loader: `src/components/expedition-journey/journeyRenderAssets.js`
- Journey parallax background loader: `src/components/expedition-journey/journeyBackgroundAssets.js`
- Journey enemy sprite loader: `src/components/expedition-journey/journeyEnemySprites.js`
- Journey boss sprite loader: `src/components/expedition-journey/journeyBossSprites.js`
- Journey collectible sprite loader: `src/components/expedition-journey/journeyCollectibleSprites.js`
- Journey weapon sprite loader: `src/components/expedition-journey/journeyPlayerWeaponSprites.js`
- Excavation map asset loader: `src/components/expedition/expeditionMapAssets.js`
- Excavation room layout: `src/components/expedition/expeditionMapLayout.js`
- Zone challenge content: `src/components/expedition/expeditionZoneChallenges.js`
- Runtime assets root: `public/assets/expedition/`

## Existing Egypt Asset Audit

The current runtime uses JSON atlases in `public/assets/expedition/`. Atlas entries use named `regions` with `{ x, y, w, h }` coordinates into the matching image file. China should copy these structures and only be wired into the existing loaders after the generated files and atlas JSON are present.

### Journey Parallax Background Packs

Current loader: `src/components/expedition-journey/journeyBackgroundAssets.js`

| Pack | Folder | Atlas JSON | Image | Expected region keys |
| --- | --- | --- | --- | --- |
| Desert Entry | `public/assets/expedition/backgrounds/desert-entry/` | `desert-entry-parallax-pack.json` | `desert-entry-parallax-pack.png` | `sky`, `farDunes`, `distantRuins`, `midgroundRuins`, `foregroundAtmosphere` |
| Catacombs | `public/assets/expedition/backgrounds/catacombs/` | `catacombs-parallax-pack.json` | `catacombs-parallax-pack.png` | `undergroundAtmosphere`, `farTunnelWalls`, `distantCatacombs`, `midgroundGlyphWalls`, `foregroundMist` |
| Escape Sequence | `public/assets/expedition/backgrounds/escape-sequence/` | `escape-sequence-parallax-pack.json` | `escape-sequence-parallax-pack.png` | `dangerAtmosphere`, `farCollapsingWalls`, `distantRuinsDebris`, `midgroundEscapeRuins`, `foregroundDust` |
| Dig Site Entrance / Base Camp | `public/assets/expedition/backgrounds/dig-site-entrance/` | `base-camp-parallax-pack.json` | `base-camp-parallax-pack.png` | `skyLayer`, `farBackground`, `midBackground`, `nearBaseCamp`, `foregroundLayer` |

Notes:
- The loader currently maps background packs by Journey section id.
- The Egypt Journey has several section-specific background packs, not one global background.
- Future China should use the same `SECTION_BACKGROUND_PACKS` shape once China Journey data exists.

### Journey Environment Tile Pack

Current loader: `src/components/expedition-journey/journeyRenderAssets.js`

| Pack | Folder | Atlas JSON | Image | Expected region keys |
| --- | --- | --- | --- | --- |
| Desert Temple Environment | `public/assets/expedition/environment/desert-temple/` | `desert-temple-pack.json` | `desert-temple-pack.png` | `groundSand`, `groundCracked`, `layeredSand`, `templeFloor`, `catacombFloor`, `sandstoneBlock`, `templeBlock`, `woodenPlatform`, `brokenBridge`, `thornBush`, `spikeTrap`, `fallingRocks`, `softSand`, `collapsingFloor`, `darkPit`, `brokenColumn`, `torch`, `pottery`, `rope`, `lantern`, `catStatue`, `lionStatue`, `sealedGate`, `ancientSeal`, `routeDoor` |

Notes:
- This atlas supplies platform, hazard, gate, and story-prop art.
- The mapping helpers `getEnvironmentAssetKeyForPlatform`, `getEnvironmentAssetKeyForHazard`, and `getEnvironmentAssetKeyForStoryProp` decide which region key to draw.

### Journey Enemy And Boss Sprite Packs

Current loaders:
- `src/components/expedition-journey/journeyEnemySprites.js`
- `src/components/expedition-journey/journeyBossSprites.js`

| Pack | Folder | Atlas JSON | Image | Expected region keys |
| --- | --- | --- | --- | --- |
| Small Enemy Sprites | `public/assets/expedition/enemies/` | `small-enemy-sprites.json` | `small-enemy-sprites.png` | `scarabIdle`, `scarabCrawl1`, `scarabCrawl2`, `scarabWindup`, `scarabAttack`, `scarabHit`, `scarabDefeated`, `snakeIdle`, `snakeSlither1`, `snakeSlither2`, `snakeWindup`, `snakeAttack`, `snakeHit`, `snakeDefeated`, `batIdle`, `batFlap1`, `batFlap2`, `batWindup`, `batAttack`, `batHit`, `batDefeated` |
| Scarab Queen Boss | `public/assets/expedition/bosses/` | `scarab-queen-sprites.json` | `scarab-queen-sprites.png` | `scarabQueenIdle`, `scarabQueenWalk1`, `scarabQueenWalk2`, `scarabQueenIntro`, `scarabQueenWindup`, `scarabQueenCharge`, `scarabQueenAreaAttack`, `scarabQueenShielded`, `scarabQueenCounterWindow`, `scarabQueenHit`, `scarabQueenDefeated` |
| Stone Guardian Boss | `public/assets/expedition/bosses/` | `stone-guardian-sprites.json` | `stone-guardian-sprites.png` | `stoneGuardianIdle`, `stoneGuardianWalk1`, `stoneGuardianWalk2`, `stoneGuardianAwakening`, `stoneGuardianWindup`, `stoneGuardianSlam`, `stoneGuardianShockwave`, `stoneGuardianShielded`, `stoneGuardianCounterWindow`, `stoneGuardianHit`, `stoneGuardianDefeated` |
| Ancient Construct Boss | `public/assets/expedition/bosses/` | `ancient-construct-sprites.json` | `ancient-construct-sprites.png` | `ancientConstructIdle`, `ancientConstructWalk1`, `ancientConstructWalk2`, `ancientConstructIntro`, `ancientConstructWindup`, `ancientConstructSlam`, `ancientConstructPulse`, `ancientConstructShielded`, `ancientConstructCounterWindow`, `ancientConstructHit`, `ancientConstructDefeated` |

### Journey Collectible And Player Packs

Current loaders:
- `src/components/expedition-journey/journeyCollectibleSprites.js`
- `src/components/expedition-journey/journeyPlayerWeaponSprites.js`
- Player body source in `src/components/expedition-journey/journeyConstants.js`

| Pack | Folder | Atlas JSON / Image | Expected region keys |
| --- | --- | --- | --- |
| Journey Collectibles | `public/assets/expedition/collectibles/` | `journey-collectibles-pack.json` / `journey-collectibles-pack.png` | `brush`, `trowel`, `notebook`, `camera`, `measuringTape`, `fieldGuidePage`, `relicShard`, `mapTablet`, `ancientSwitch`, `glyphFragment`, `escapeMarker`, `loreTablet`, `reinforcedBoots`, `ropeLauncher`, `torchUpgrade`, `historianVision`, `ancientCompass`, `pickupSparkle`, `collectedFlashRing`, `lockedDimOverlay`, `availableGlowRing`, `objectiveHighlightRing` |
| Egypt Player Weapon | `public/assets/expedition/player/` | `khopesh-weapon-pack.json` / `khopesh-weapon-pack.png` | `khopeshIdle`, `khopeshWindup`, `khopeshSwing`, `khopeshReady` |
| Player Body Sprite | `public/sprites/` | `archaeologist-walk-cycle.png` | Four fixed frames; no JSON atlas |

### Excavation Map Packs

Current loader: `src/components/expedition/expeditionMapAssets.js`

| Pack id | Folder | Atlas JSON | Image | Expected region keys used by loader |
| --- | --- | --- | --- | --- |
| `legacy` | `public/assets/expedition/excavation/` | `excavation-map-ui-pack.json` | `excavation-map-ui-pack.png` | `riverbankTerrain`, `burialTerrain`, `archiveTerrain`, `marketTerrain`, `ruinedWallTerrain`, `neutralGridTerrain`, `sealedExitGate`, `unlockedExitGate` |
| `roomMap` | `public/assets/expedition/excavation/` | `egypt-room-map-pack.json` | `egypt-room-map-pack.png` | `riverbankTerrain`, `burialTerrain`, `archiveTerrain`, `marketTerrain`, `ruinedWallTerrain`, `neutralExcavationTerrain`, `pathHorizontal`, `pathVertical`, `pathCorner`, `doorwayThreshold`, `ropeBoundary`, `gridOverlay`, `mapSquareOverlay`, `roomShadowOverlay` |
| `challengeUi` | `public/assets/expedition/excavation/` | `egypt-zone-challenge-ui-pack.json` | `egypt-zone-challenge-ui-pack.png` | `challengeCard`, `fieldNotebookPage`, `questionPanel`, `answerChoiceNormal`, `answerChoiceCorrect`, `answerChoiceIncorrect`, `feedbackPanel`, `challengeCompleteStamp`, `challengeRetryStamp` |
| `surveyMarkers` | `public/assets/expedition/excavation/` | `egypt-survey-marker-pack.json` | `egypt-survey-marker-pack.png` | `explorerToken`, `heroPortraitMarker`, `playerLocationRing`, `playerShadow`, `challengeRequiredMarker`, `challengeCompleteMarker`, `surveyReadyMarker`, `surveyedMarker`, `activeRoomMarker`, `pinnedFieldTag` |
| `gateway` | `public/assets/expedition/excavation/` | `egypt-gateway-pack.json` | `egypt-gateway-pack.png` | `openRoomDoorway`, `sealedRoomDoorway`, `brokenArchPassage`, `ropeMarkedEntrance`, `sealedExitGate`, `unlockedExitGate`, `lockedSealIcon`, `unlockedSealIcon`, `sandstoneWallSegment`, `crackedStoneWallSegment` |

Additional available Egypt excavation regions:
- `egypt-room-map-pack.json`: `brokenStoneDoorway`, `passageConnector`, `excavationBoundaryLine`, `surveyStringHorizontal`, `surveyStringVertical`, `surveyPeg`, `surveyFlag`, `potteryFragments`, `stonePile`, `brokenColumnTop`, `buriedWallFoundation`, `trenchEdge`, `sandMound`, `shadedAlcove`
- `egypt-zone-challenge-ui-pack.json`: `challengeHeaderStrip`, `answerChoiceSelected`, `warningTag`, `successTag`, `neutralHintTag`, `riverbankChallengeIcon`, `burialChallengeIcon`, `archiveChallengeIcon`, `marketChallengeIcon`, `ruinedWallChallengeIcon`, `exitGateChallengeIcon`, `paperclip`, `brassCornerClip`, `redStampMark`, `mapPin`, `compassAccent`, `tornPaperDivider`, `blankLabelRibbon`
- `egypt-survey-marker-pack.json`: `playerGlow`, `lockedRoomMarker`, `completedRoomMarker`, `surveyPin`, `surveyFlag`, `surveyPeg`, `blankRoomLabel`, `highlightedSelectedZoneBorder`, `pulsingRing`, `neutralQuestionIcon`, `neutralWarningIcon`, `neutralCheckIcon`, `neutralRetryIcon`, `neutralEvidenceCheckIcon`, `neutralLockIcon`, `neutralUnlockIcon`
- `egypt-gateway-pack.json`: `tentEntranceMarker`, `narrowPassageConnector`, `glowingAncientSeal`, `brokenUnlockedSeal`, `buriedStoneFoundation`, `carvedThreshold`, `brokenPillarBase`, `fallenLintelStone`, `rubblePile`, `gateBaseDustShadow`

## China Visual Direction

Use:
- river valley
- misty mountains
- rammed-earth walls
- watchtowers
- timber gates
- bronze accents
- jade accents
- oracle bone, archive and tomb visual language
- early Chinese civilisation / Shang-Zhou-Han inspiration

Do not use:
- pyramids
- Egyptian columns
- hieroglyphs
- pharaoh or sphinx imagery
- desert Egypt camp styling
- fantasy dragons as the main theme
- anime
- martial arts fantasy
- modern China skyline
- neon or sci-fi

## Required China Asset Packs

These are the exact external image-generation targets to make next. Do not import them into the app until the image files and matching atlas JSON are both present.

### 1. China Journey Parallax Background Pack

- Proposed folder: `public/assets/expedition/backgrounds/china-river-valley/`
- Proposed atlas file: `china-river-valley-parallax-pack.json`
- Proposed image file: `china-river-valley-parallax-pack.png`
- Background: opaque rectangular parallax sheet, not transparent
- Format: atlas image with five wide background regions
- Expected region names: `skyLayer`, `farMountains`, `riverValley`, `watchtowerRidge`, `foregroundMist`
- Match structurally: `public/assets/expedition/backgrounds/dig-site-entrance/base-camp-parallax-pack.json`
- Future loader location: add to `SECTION_BACKGROUND_PACKS` in `src/components/expedition-journey/journeyBackgroundAssets.js` only after a China Journey section id exists

Prompt:

```text
Create a Lost Site Expedition style parallax background atlas for a modern stylised 2D educational archaeology game. Theme: Ancient China river valley, early Chinese civilisation / Shang-Zhou-Han inspiration. Make a single atlas sheet with five clean horizontal background regions: skyLayer, farMountains, riverValley, watchtowerRidge, foregroundMist. Visual direction: broad river valley, misty mountains, rammed-earth walls in the distance, ancient watchtowers, timber gates, bronze and jade accent colours, archive and tomb atmosphere. Classroom-friendly Year 7 readability, clear silhouettes, readable on a projector, warm museum/archive adventure tone. No text labels, no numbers, no watermark, no signature, no photorealism, no anime, no horror, no gore. Do not include pyramids, Egyptian columns, hieroglyphs, pharaohs, sphinx imagery, desert Egypt camp styling, fantasy dragons as the main theme, martial arts fantasy, modern China skyline, neon, or sci-fi. Opaque background atlas, not transparent.
```

### 2. China Side-Scroller Environment Tile Pack

- Proposed folder: `public/assets/expedition/environment/china-river-valley/`
- Proposed atlas file: `china-river-valley-environment-pack.json`
- Proposed image file: `china-river-valley-environment-pack.png`
- Background: transparent
- Format: sprite/atlas sheet of terrain, hazard, gate, and prop regions
- Expected region names: `riverbankGround`, `rammedEarthGround`, `packedClayGround`, `stonePathFloor`, `archiveFloor`, `rammedEarthBlock`, `timberPlatform`, `bambooBridge`, `brokenBridge`, `reedPatch`, `mudPit`, `fallingRoofTiles`, `looseEarth`, `collapsingFloor`, `darkPit`, `watchtowerPost`, `bronzeLamp`, `jadeMarker`, `oracleBoneShard`, `archiveJar`, `sealedTimberGate`, `bronzeSeal`, `routeDoor`
- Match structurally: `public/assets/expedition/environment/desert-temple/desert-temple-pack.json`
- Future loader location: stage-aware extension of `src/components/expedition-journey/journeyRenderAssets.js`; future mapping helpers should mirror `getEnvironmentAssetKeyForPlatform`, `getEnvironmentAssetKeyForHazard`, and `getEnvironmentAssetKeyForStoryProp`

Prompt:

```text
Create a Lost Site Expedition style transparent environment tile atlas for a modern stylised 2D educational archaeology game. Theme: Ancient China river valley expedition, early Chinese civilisation / Shang-Zhou-Han inspiration. Make separated atlas items for side-scroller terrain and props: riverbankGround, rammedEarthGround, packedClayGround, stonePathFloor, archiveFloor, rammedEarthBlock, timberPlatform, bambooBridge, brokenBridge, reedPatch, mudPit, fallingRoofTiles, looseEarth, collapsingFloor, darkPit, watchtowerPost, bronzeLamp, jadeMarker, oracleBoneShard, archiveJar, sealedTimberGate, bronzeSeal, routeDoor. Visual direction: river valley, misty mountains implied through colours, rammed-earth walls, timber gates, watchtowers, bronze and jade accents, oracle bone/archive/tomb visual language. Classroom-friendly Year 7 readability, bold silhouettes, clean edges, consistent scale, enough empty padding between items for atlas cropping. No text labels, no numbers, no watermark, no signature, no photorealism, no anime, no horror, no gore. Transparent background required. Do not include pyramids, Egyptian columns, hieroglyphs, pharaohs, sphinx imagery, desert Egypt styling, fantasy dragons as the main theme, martial arts fantasy, modern China skyline, neon, or sci-fi.
```

### 3. China Top-Down Excavation Room Map Pack

- Proposed folder: `public/assets/expedition/excavation/`
- Proposed atlas file: `china-room-map-pack.json`
- Proposed image file: `china-room-map-pack.png`
- Background: transparent
- Format: atlas sheet for top-down excavation room terrain and overlays
- Expected region names: `riverbankTerrain`, `rammedEarthWallTerrain`, `archiveTerrain`, `workshopTerrain`, `tombEdgeTerrain`, `neutralExcavationTerrain`, `pathHorizontal`, `pathVertical`, `pathCorner`, `doorwayThreshold`, `timberGateThreshold`, `passageConnector`, `ropeBoundary`, `excavationBoundaryLine`, `gridOverlay`, `surveyStringHorizontal`, `surveyStringVertical`, `surveyPeg`, `surveyFlag`, `mapSquareOverlay`, `potteryFragments`, `bronzeFragmentPile`, `oracleBoneFragments`, `jadeChipScatter`, `trenchEdge`, `siltMound`, `shadedArchiveAlcove`, `roomShadowOverlay`
- Match structurally: `public/assets/expedition/excavation/egypt-room-map-pack.json`
- Future loader location: `EXCAVATION_ASSET_PACKS.roomMap` in `src/components/expedition/expeditionMapAssets.js` should become stage-aware only after China excavation data exists

Prompt:

```text
Create a Lost Site Expedition style transparent top-down excavation room map atlas for a modern stylised 2D educational archaeology game. Theme: Ancient China excavation site near a river valley, early Chinese civilisation / Shang-Zhou-Han inspiration. Make separated atlas regions for: riverbankTerrain, rammedEarthWallTerrain, archiveTerrain, workshopTerrain, tombEdgeTerrain, neutralExcavationTerrain, pathHorizontal, pathVertical, pathCorner, doorwayThreshold, timberGateThreshold, passageConnector, ropeBoundary, excavationBoundaryLine, gridOverlay, surveyStringHorizontal, surveyStringVertical, surveyPeg, surveyFlag, mapSquareOverlay, potteryFragments, bronzeFragmentPile, oracleBoneFragments, jadeChipScatter, trenchEdge, siltMound, shadedArchiveAlcove, roomShadowOverlay. Top-down readable room-map style, warm parchment/museum palette, clear excavation textures, readable on a classroom projector. No text labels, no numbers, no watermark, no signature, no photorealism, no anime, no horror, no gore. Transparent background required. Do not include pyramids, Egyptian columns, hieroglyphs, pharaohs, sphinx imagery, desert Egypt camp styling, fantasy dragons as the main theme, martial arts fantasy, modern China skyline, neon, or sci-fi.
```

### 4. China Zone Challenge UI Pack

- Proposed folder: `public/assets/expedition/excavation/`
- Proposed atlas file: `china-zone-challenge-ui-pack.json`
- Proposed image file: `china-zone-challenge-ui-pack.png`
- Background: transparent
- Format: UI atlas sheet
- Expected region names: `challengeCard`, `fieldNotebookPage`, `challengeHeaderStrip`, `questionPanel`, `answerChoiceNormal`, `answerChoiceSelected`, `answerChoiceCorrect`, `answerChoiceIncorrect`, `feedbackPanel`, `challengeCompleteStamp`, `challengeRetryStamp`, `warningTag`, `successTag`, `neutralHintTag`, `riverbankChallengeIcon`, `rammedEarthChallengeIcon`, `archiveChallengeIcon`, `workshopChallengeIcon`, `tombChallengeIcon`, `exitGateChallengeIcon`, `paperclip`, `bronzeCornerClip`, `jadeAccentMark`, `mapPin`, `compassAccent`, `tornPaperDivider`, `blankLabelRibbon`
- Match structurally: `public/assets/expedition/excavation/egypt-zone-challenge-ui-pack.json`
- Future loader location: `EXCAVATION_ASSET_PACKS.challengeUi` in `src/components/expedition/expeditionMapAssets.js`; CSS references in `src/index.css` must remain Egypt-specific until stage-aware styling exists

Prompt:

```text
Create a Lost Site Expedition style transparent zone challenge UI atlas for a modern stylised 2D educational archaeology game. Theme: Ancient China classroom archaeology expedition. Make separated UI parts: challengeCard, fieldNotebookPage, challengeHeaderStrip, questionPanel, answerChoiceNormal, answerChoiceSelected, answerChoiceCorrect, answerChoiceIncorrect, feedbackPanel, challengeCompleteStamp, challengeRetryStamp, warningTag, successTag, neutralHintTag, riverbankChallengeIcon, rammedEarthChallengeIcon, archiveChallengeIcon, workshopChallengeIcon, tombChallengeIcon, exitGateChallengeIcon, paperclip, bronzeCornerClip, jadeAccentMark, mapPin, compassAccent, tornPaperDivider, blankLabelRibbon. Style: parchment dossier UI, warm museum/archive feel, bronze and jade accents, simple archaeology icon shapes only, classroom-friendly Year 7 readability. No text labels, no readable writing, no numbers, no watermark, no signature, no photorealism, no anime, no horror, no gore. Transparent background required. Do not include pyramids, Egyptian columns, hieroglyphs, pharaohs, sphinx imagery, desert Egypt camp styling, fantasy dragons as the main theme, martial arts fantasy, modern China skyline, neon, or sci-fi.
```

### 5. China Survey Marker + Gateway Pack

- Proposed folder: `public/assets/expedition/excavation/`
- Proposed atlas file: `china-survey-marker-gateway-pack.json`
- Proposed image file: `china-survey-marker-gateway-pack.png`
- Background: transparent
- Format: combined marker/gateway atlas sheet, or split later if the existing loader remains split by `surveyMarkers` and `gateway`
- Expected region names: `explorerToken`, `heroPortraitMarker`, `playerLocationRing`, `playerShadow`, `playerGlow`, `lockedRoomMarker`, `challengeRequiredMarker`, `challengeCompleteMarker`, `surveyReadyMarker`, `surveyedMarker`, `activeRoomMarker`, `completedRoomMarker`, `surveyPin`, `surveyFlag`, `surveyPeg`, `pinnedFieldTag`, `blankRoomLabel`, `highlightedSelectedZoneBorder`, `pulsingRing`, `neutralQuestionIcon`, `neutralWarningIcon`, `neutralCheckIcon`, `neutralRetryIcon`, `neutralEvidenceCheckIcon`, `neutralLockIcon`, `neutralUnlockIcon`, `openRoomDoorway`, `sealedRoomDoorway`, `timberGatePassage`, `ropeMarkedEntrance`, `narrowPassageConnector`, `sealedExitGate`, `unlockedExitGate`, `bronzeSealIcon`, `jadeUnlockedSealIcon`, `rammedEarthWallSegment`, `crackedEarthWallSegment`, `buriedFoundation`, `carvedThreshold`, `fallenTimberLintel`, `rubblePile`, `gateBaseDustShadow`
- Match structurally: `public/assets/expedition/excavation/egypt-survey-marker-pack.json` and `public/assets/expedition/excavation/egypt-gateway-pack.json`
- Future loader location: either split into `EXCAVATION_ASSET_PACKS.surveyMarkers` and `EXCAVATION_ASSET_PACKS.gateway`, or keep combined only if the stage-aware loader allows multiple pack ids to point at the same atlas; do this in `src/components/expedition/expeditionMapAssets.js` after China excavation exists

Prompt:

```text
Create a Lost Site Expedition style transparent survey marker and gateway atlas for a modern stylised 2D educational archaeology game. Theme: Ancient China excavation site, river valley, rammed-earth walls, timber gates, bronze and jade accents. Make separated atlas items: explorerToken, heroPortraitMarker, playerLocationRing, playerShadow, playerGlow, lockedRoomMarker, challengeRequiredMarker, challengeCompleteMarker, surveyReadyMarker, surveyedMarker, activeRoomMarker, completedRoomMarker, surveyPin, surveyFlag, surveyPeg, pinnedFieldTag, blankRoomLabel, highlightedSelectedZoneBorder, pulsingRing, neutralQuestionIcon, neutralWarningIcon, neutralCheckIcon, neutralRetryIcon, neutralEvidenceCheckIcon, neutralLockIcon, neutralUnlockIcon, openRoomDoorway, sealedRoomDoorway, timberGatePassage, ropeMarkedEntrance, narrowPassageConnector, sealedExitGate, unlockedExitGate, bronzeSealIcon, jadeUnlockedSealIcon, rammedEarthWallSegment, crackedEarthWallSegment, buriedFoundation, carvedThreshold, fallenTimberLintel, rubblePile, gateBaseDustShadow. Classroom-friendly Year 7 readability, clean icon silhouettes, warm parchment/dossier compatibility. No text labels, no readable writing, no numbers, no watermark, no signature, no photorealism, no anime, no horror, no gore. Transparent background required. Do not include pyramids, Egyptian columns, hieroglyphs, pharaohs, sphinx imagery, desert Egypt camp styling, fantasy dragons as the main theme, martial arts fantasy, modern China skyline, neon, or sci-fi.
```

### 6. China Enemy + Guardian Sprite Pack

- Proposed folder: `public/assets/expedition/enemies/china/`
- Proposed atlas file: `china-enemy-guardian-sprites.json`
- Proposed image file: `china-enemy-guardian-sprites.png`
- Background: transparent
- Format: sprite sheet / atlas with animation state regions
- Expected region names: `riverCrabIdle`, `riverCrabWalk1`, `riverCrabWalk2`, `riverCrabWindup`, `riverCrabAttack`, `riverCrabHit`, `riverCrabDefeated`, `watchtowerSentryIdle`, `watchtowerSentryWalk1`, `watchtowerSentryWalk2`, `watchtowerSentryWindup`, `watchtowerSentryAttack`, `watchtowerSentryHit`, `watchtowerSentryDefeated`, `clayGuardianIdle`, `clayGuardianWalk1`, `clayGuardianWalk2`, `clayGuardianIntro`, `clayGuardianWindup`, `clayGuardianSlam`, `clayGuardianPulse`, `clayGuardianShielded`, `clayGuardianCounterWindow`, `clayGuardianHit`, `clayGuardianDefeated`
- Match structurally: `public/assets/expedition/enemies/small-enemy-sprites.json` plus the boss-state shape from `public/assets/expedition/bosses/ancient-construct-sprites.json`
- Future loader location: stage-aware extension of `src/components/expedition-journey/journeyEnemySprites.js` and `src/components/expedition-journey/journeyBossSprites.js`

Prompt:

```text
Create a Lost Site Expedition style transparent enemy and guardian sprite atlas for a modern stylised 2D educational archaeology game. Theme: Ancient China river valley excavation, early Chinese civilisation / Shang-Zhou-Han inspiration. Make clean separated animation frames for: riverCrabIdle, riverCrabWalk1, riverCrabWalk2, riverCrabWindup, riverCrabAttack, riverCrabHit, riverCrabDefeated, watchtowerSentryIdle, watchtowerSentryWalk1, watchtowerSentryWalk2, watchtowerSentryWindup, watchtowerSentryAttack, watchtowerSentryHit, watchtowerSentryDefeated, clayGuardianIdle, clayGuardianWalk1, clayGuardianWalk2, clayGuardianIntro, clayGuardianWindup, clayGuardianSlam, clayGuardianPulse, clayGuardianShielded, clayGuardianCounterWindow, clayGuardianHit, clayGuardianDefeated. The guardian should feel like an archaeological site guardian made of rammed earth, timber, bronze, and jade accents, not a fantasy dragon. Classroom-friendly Year 7 readability, bold silhouettes, consistent scale, enough padding between frames for cropping. No text labels, no numbers, no watermark, no signature, no photorealism, no anime, no horror, no gore. Transparent background required. Do not include pyramids, Egyptian columns, hieroglyphs, pharaohs, sphinx imagery, desert Egypt camp styling, fantasy dragons as the main theme, martial arts fantasy, modern China skyline, neon, or sci-fi.
```

### 7. Optional China Collectible / Relic Pack

- Proposed folder: `public/assets/expedition/collectibles/china/`
- Proposed atlas file: `china-journey-collectibles-pack.json`
- Proposed image file: `china-journey-collectibles-pack.png`
- Background: transparent
- Format: sprite/atlas sheet
- Expected region names: `brush`, `trowel`, `notebook`, `camera`, `measuringTape`, `fieldGuidePage`, `relicShard`, `oracleBoneTablet`, `bronzeDingFragment`, `jadeBiDisc`, `timberGateToken`, `loreTablet`, `reinforcedBoots`, `ropeLauncher`, `lanternUpgrade`, `historianVision`, `jadeCompass`, `pickupSparkle`, `collectedFlashRing`, `lockedDimOverlay`, `availableGlowRing`, `objectiveHighlightRing`
- Match structurally: `public/assets/expedition/collectibles/journey-collectibles-pack.json`
- Future loader location: stage-aware extension of `src/components/expedition-journey/journeyCollectibleSprites.js`
- Optional because the current Journey collectible pack may be reused temporarily, but China will feel more coherent with its own relic/objective visuals

Prompt:

```text
Create a Lost Site Expedition style transparent collectible and relic atlas for a modern stylised 2D educational archaeology game. Theme: Ancient China river valley expedition, early Chinese civilisation / Shang-Zhou-Han inspiration. Make separated collectible sprites: brush, trowel, notebook, camera, measuringTape, fieldGuidePage, relicShard, oracleBoneTablet, bronzeDingFragment, jadeBiDisc, timberGateToken, loreTablet, reinforcedBoots, ropeLauncher, lanternUpgrade, historianVision, jadeCompass, pickupSparkle, collectedFlashRing, lockedDimOverlay, availableGlowRing, objectiveHighlightRing. Visual direction: bronze, jade, oracle bone, archive and tomb evidence language, classroom-friendly Year 7 readability, clear silhouettes, small pickup readability, consistent scale, enough padding between items for atlas cropping. No text labels, no readable writing, no numbers, no watermark, no signature, no photorealism, no anime, no horror, no gore. Transparent background required. Do not include pyramids, Egyptian columns, hieroglyphs, pharaohs, sphinx imagery, desert Egypt camp styling, fantasy dragons as the main theme, martial arts fantasy, modern China skyline, neon, or sci-fi.
```

## Exact Next Images To Generate

Generate these first, in this order:

1. `china-river-valley-parallax-pack.png`
2. `china-river-valley-environment-pack.png`
3. `china-room-map-pack.png`
4. `china-zone-challenge-ui-pack.png`
5. `china-survey-marker-gateway-pack.png`
6. `china-enemy-guardian-sprites.png`
7. Optional: `china-journey-collectibles-pack.png`

After each image is generated, create matching JSON atlas files with the exact region keys listed above. The app should not load any of these files until both the image and atlas JSON are present and the stage-aware loader work is implemented.

## Future Integration Plan

1. Generate the China asset images externally using the prompts above.
2. Add the atlas PNG and JSON files under the proposed `public/assets/expedition/` folders.
3. Verify atlas region names match the expected keys before touching runtime code.
4. Add a stage-aware China Journey prototype by extending the existing Journey data/loader pattern, not by duplicating `ExpeditionJourney.jsx`.
5. Add China excavation room layout, zone challenges, and map assets by extending the existing `expeditionMapAssets.js`, `expeditionMapLayout.js`, and `expeditionZoneChallenges.js` pattern.
6. Add China evidence data and final-claim rules using the existing evidence/final-claim flow.
7. Run browser verification through Stage Select, Egypt Journey, China preview, and the new China dev/prototype path.
8. Only after Journey, excavation, evidence, and final claim are complete should `expeditionStages.js` change Ancient China from preview-only to playable.

## Guardrails

- Do not add imports or loader constants for China files until those files exist.
- Do not change `PLAYABLE_EXPEDITION_STAGE_ID`; Egypt stays playable and China stays preview-only.
- Do not replace the Egypt asset packs.
- Do not add a parallel Expedition or Journey runtime.
- Do not make China playable from Stage Select until the full China flow exists and passes browser checks.
