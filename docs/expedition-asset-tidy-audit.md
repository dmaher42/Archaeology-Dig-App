# Expedition Asset Tidy Audit

Inspection date: 2026-05-23

Scope: Lost Site Expedition only. This audit covers the Journey platformer, Expedition/Base Camp/excavation flow, Expedition trailer assets, and files under `public/assets/expedition/`. It does not cover the general museum evidence images except where Expedition directly uses them.

This is an audit and handover document. It does not delete, move, or replace assets.

## Source Of Truth

Future chats should inspect these files before changing Expedition assets:

- Design direction: `docs/lost-site-expedition-design-brief.md`
- Expedition shell, Base Camp, excavation, stage content, and map rendering: `src/components/ExpeditionMode.jsx`
- Journey runtime and player/boss/enemy rendering: `src/components/ExpeditionJourney.jsx`
- Journey asset modules: `src/components/expedition-journey/`
- Excavation asset loader: `src/components/expedition/expeditionMapAssets.js`
- Stage selection and future-stage metadata: `src/components/expedition/expeditionStages.js`
- Audio wiring: `src/App.jsx`
- Runtime asset root: `public/assets/expedition/`
- Running notes: `progress.md`

Do not add a second loader or parallel asset system. Extend the existing atlas, loader, stage, and Journey data paths.

## Current Asset Shape

`public/assets/expedition/` currently contains:

| Area | File count | Current role |
| --- | ---: | --- |
| `Audio/` | 9 | Expedition music and stingers. Git tracks this as lowercase `audio`, but Windows displays the folder as `Audio`. |
| `backgrounds/` | 29 | Journey parallax/full-scene backgrounds for Egypt sections and China prototype. |
| `bosses/` | 29 | Runtime boss atlases plus candidate/source reference images. |
| `china-source/` | 4 | China generation/source references, not runtime gameplay packs. |
| `collectibles/` | 2 | Runtime Journey collectible atlas. |
| `enemies/` | 45 | Runtime enemy atlases plus source/reference sheets. |
| `environment/` | 27 | Runtime Journey terrain, props, traps, atmosphere, opening-scene art, and source art. |
| `excavation/` | 16 | Egypt and China excavation map/UI/marker/gateway atlases. |
| `maps/` | 1 | Expedition world map. |
| `markers/` | 3 | Journey checkpoint marker atlas plus older marker art. |
| `player/` | 70 | Active, fallback, candidate, and source/reference player sprite sheets. |
| `sfx/` | 26 | Generated and sourced Expedition sound effects plus licenses. |
| `stage-characters/` | 3 | Stage Select character images for future/prototype expeditions. |

The active runtime contract is mostly PNG plus JSON atlas files. Many source/reference images live beside runtime files, especially in `player/`, `enemies/`, `bosses/`, and `environment/`.

## Confirmed Runtime Wiring

These are currently wired through canonical loaders:

- Journey backgrounds: `journeyBackgroundAssets.js`
  - Egypt section packs: desert-entry, ruined-temple, catacombs, escape-sequence, dig-site-entrance
  - China prototype pack: china-river-valley
- Journey environment and props: `journeyRenderAssets.js`
  - Egypt desert-temple, sacred-traps, atmosphere
  - China river-valley environment pack
- Journey enemies: `journeyEnemySprites.js`
  - small legacy pack, looter, looter captain, bat, scarab, snake, scorpion, sand wisp, mummy, Bes, and China enemy packs
- Journey bosses: `journeyBossSprites.js`
  - Scarab Queen, Anubis, Giant Serpent, Sphinx, and China guardian boss packs
- Journey player:
  - active Egypt Asha: `assets/expedition/player/asha-final-production-spritesheet.json`
  - previous Egypt Asha fallback: `assets/expedition/player/asha-hooded-warrior-explorer-spritesheet.json`
  - older warrior-guide fallback: `assets/expedition/player/egypt-warrior-guide-spritesheet.json`
  - China prototype player: `assets/expedition/player/china-female-archaeologist-production-spritesheet.json`
- Excavation map/UI packs: `expeditionMapAssets.js`
  - Egypt room map, challenge UI, survey markers, gateway
  - China room map, challenge UI, combined survey/gateway pack
- Expedition audio:
  - music and stingers are referenced from `src/App.jsx`
  - current code uses lowercase `assets/expedition/audio/...`
  - generated SFX are referenced from `assets/expedition/sfx/generated/...`

## Tidy-Up Findings

### P1: Normalize Expedition Audio Folder Casing

The app code references lowercase `assets/expedition/audio/...`, while Windows currently displays the folder as `public/assets/expedition/Audio`. Git tracks the paths as lowercase `public/assets/expedition/audio/...`.

Why it matters: Windows is forgiving, but GitHub Pages is case-sensitive. This should be normalized with a case-only Git rename if needed, then verified by build and browser playback.

Do not change the audio engine. This is a path/name hygiene task.

### P1: Separate Runtime Assets From Source/Reference Assets

Several folders contain source images beside runtime atlases. This is useful history, but it makes future asset work harder to reason about.

Source/reference folders or files already visible:

- `public/assets/expedition/china-source/`
- `public/assets/expedition/enemies/bes-guardian-source/`
- `public/assets/expedition/player/asha-final-production-source/`
- `public/assets/expedition/player/asha-option-a-source/`
- source/candidate files in `bosses/`, `enemies/`, `environment/egypt-opening/`, and `player/`

Recommended next step: mark these as source/reference in docs first. Move or delete only after proving they are not used by runtime, trailer, tests, or stage preview metadata.

### P1: Keep The Active Player Sprite Contract Explicit

The player folder has active, fallback, candidate, and source sheets. The current active Egypt player is Asha Final Production. The previous hooded Asha atlas is fallback/comparison, not the active default. The China player atlas is used for the China prototype path.

Recommended next step: keep active/fallback/candidate roles documented before removing older Asha variants.

### P2: Update Stale China Scaffold Labels

`src/components/expedition/expeditionStages.js` still has some `implementationSlots` names that say `placeholder`, even though the China prototype now has runtime room map, challenge UI, survey/gateway, enemy, guardian, evidence, and final-claim assets wired deeper in Expedition.

Recommended next step: rename scaffold labels to reflect prototype/runtime status. This is metadata cleanup, not gameplay.

### P2: Recheck Candidate And Source Boss/Enemy Files

Some boss/enemy files look like source or candidate art rather than runtime assets:

- `anubis-sprites-candidate-v1.png`
- `anubis-sprites-candidate-v1-source-chromakey.png`
- `anubis-apparition-source-chromakey.png`
- `opening-sphinx-apparition-source.png`
- `flying-scarab-production-source*.png`
- `sand-wisp-cinematic-source*.png`
- `warrior-mummy-production-source*.png`
- `warrior-mummy-source.jpg`

Recommended next step: tag these as retained source references or move them to a clearly named source/reference folder after checking trailer/tests/runtime references.

### P2: Sprite Sheet Validator Reports Older Crop-Edge Warnings

The existing sprite-sheet validator reports crop-edge warnings for older scarab/snake/bat sheets. This does not block the current build, and it is not caused by the latest Bes/Asha work.

Recommended next step: treat this as a later sprite-quality pass, not as a reason to delete assets.

### P3: Decide Whether Trailer Assets Belong In Expedition Runtime

`src/trailer/GameTrailer.jsx` references several Expedition assets directly, including source/candidate-looking images and one uppercase `assets/expedition/Audio/...` path.

Recommended next step: decide whether trailer-only assets should stay in `public/assets/expedition/` or be documented as trailer dependencies. Do not remove them just because the gameplay path does not use them.

## Do Not Delete Yet

Do not delete these categories until each file is checked against runtime code, tests, stage previews, trailer code, and docs:

- player candidate/reference/source sheets
- boss apparition/candidate/source images
- enemy source and alpha images
- `china-source/`
- unreferenced-looking marker images
- SFX root `.ogg` files, because license/source preservation may be intentional even when runtime uses generated `.wav`

## Suggested Tidy-Up Order

1. Normalize/document audio casing and verify deployed-path behavior.
2. Add comments or metadata for source/reference folders so future chats do not treat them as clutter.
3. Update stale China scaffold labels in `expeditionStages.js`.
4. Run a reference audit for trailer-only assets before moving anything.
5. Only then consider moving source-only files into a clearer `source/` or `references/` structure.
6. Leave sprite regeneration for a separate visual-quality pass.

## Acceptance Criteria For Future Asset Changes

For any Expedition asset change:

- Confirm whether the asset is runtime, fallback, source/reference, trailer-only, or obsolete.
- Preserve PNG + JSON atlas contracts unless deliberately changing the loader.
- Verify JSON atlas `image` names resolve beside the JSON file.
- Run at least `npm.cmd run build` and the relevant Journey tests.
- Browser-check the actual Expedition scene when visible assets change.
- Update this audit or `progress.md` when asset roles change.
