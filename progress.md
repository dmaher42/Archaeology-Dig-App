Original prompt: Implement "Lost Site Expedition" as a small MVP game mode in the Archaeology-Dig-App repo.

Notes:
- Confirmed this checkout already had an `expedition` phase wired through `src/App.jsx` and `src/components/Menu.jsx`.
- Confirmed `src/components/ExpeditionMode.jsx` existed as an untracked partial MVP, but it was hard-coded to Ancient Egypt, did not require supporting evidence selection, and did not reduce points/stamina/time from hazards.
- Canonical data remains `src/data.js` for SCENARIOS/CATEGORIES and Bureau training civilisation profiles.

TODO:
- Replaced the partial expedition component in place.
- Kept save/load scoped to existing archaeology and Bureau modes; Expedition is intentionally short-session only.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.
- Browser/play verification covered menu entry, Expedition start, WASD/arrow movement, evidence pickup, hazard stamina loss, exit unlock, correct claim, incorrect claim, and Bureau briefing access.

Remaining notes:
- MVP target site is fixed to Ancient Egypt for this first one-level version, while the claim options are the six Bureau training civilisations.
- Future expansion could rotate the target civilisation once matching SCENARIOS evidence exists for Greece, Maya, and Inca.

2026-05-08 update:
- Added a Lost Site Expedition Run Result / Rank Screen after a complete final claim.
- Result scoring uses mission completion, civilisation claim, supporting evidence, field kit, investigation points, stamina, and time remaining.
- Result data is exposed through `window.render_game_to_text` for browser testing.

2026-05-08 update:
- Strengthened field kit effects in Lost Site Expedition.
- Base Camp now explains collected and missing tool impacts.
- Excavation now uses Field Guide hints, Notebook notes, Brush, Trowel and Camera bonuses, and the result screen shows Measuring Tape / field kit impact.

2026-05-08 update:
- Added Field Rescue restart prompts when journey or excavation hazards/monsters reduce resources to zero.
- Journey rescue offers Restart Journey or Back to Menu.
- Excavation rescue pauses the map and offers Restart Expedition or Back to Menu.

2026-05-08 update:
- Stabilised the first Evidence Hunt Mission as "Find Structural Evidence".
- Mission progress now requires 3 structural evidence items before the Exit Gate unlocks.
- Added a mission briefing before the journey stage so the mission appears as soon as Expedition starts.

2026-05-08 update:
- Added a clearer Evidence Satchel Decision panel for full inventory cases.
- The panel now shows mission details, satchel contents, the pending evidence item, and review/replace/leave choices.
- Browser verification confirmed the first mission evidence pickup and the new render state fields; the full overflow playthrough still needs a longer end-to-end check.

2026-05-08 update:
- Added and regression-tested Survey Before Digging in Lost Site Expedition.
- Evidence now starts hidden until a survey zone is marked.
- Survey zones were added for Riverbank, Burial Area, Archive Corner, Market Area, and Ruined Wall.
- Ruined Wall reveals the 3 structural mission items needed for the current Find Structural Evidence mission.
- Full Ruined Wall playthrough passed from Journey through Run Result, Play Again reset, and Back to Menu.
- `npm.cmd run build`, `npm.cmd run lint`, and `git diff --check` passed.
- Remaining risk: this pass covered one automated browser viewport; a quick classroom-device spot check is still useful before the next lesson.

2026-05-08 update:
- Added Excavation Method Choices to Lost Site Expedition after evidence is revealed by survey/grid.
- Evidence quality was added: excellent, good, or damaged.
- Field kit effects were connected: Brush and Trowel can improve method outcomes, Notebook records method notes, Camera/Field Guide effects remain in the existing flow.
- `npm.cmd run build` and `npm.cmd run lint` passed.
- Remaining risk: short browser/state checks covered the method step; a full Ruined Wall result/reset regression is still recommended before building Map recording.

2026-05-08 update:
- Added Map the Find to Lost Site Expedition after excavation method choice and before evidence collection.
- Mapping accuracy now records zone, grid square, and evidence type with accurate or needs review feedback.
- Measuring Tape and Notebook effects are connected to mapping notes and the result screen now shows Mapping Accuracy.
- `npm.cmd run build` passed and `npm.cmd run lint` passed on this pass.
- Browser checks confirmed Ruined Wall A1 reveals reachable evidence, opens excavation method choice, opens Map the Find, records correct and incorrect mapping outcomes, and still allows mission collection.
- Remaining risk: a full 3/3 Exit Gate -> Final Claim -> Run Result -> Play Again regression is still recommended before starting Lab Analysis.

2026-05-09 update:
- Added Journey Adventure Expansion Phase 1 to the existing `ExpeditionJourney.jsx` side-scroller.
- Added simple field-tool combat, enemy encounters, relic shards, temporary archaeologist upgrades, hidden rooms, checkpoints, route-seal pacing gates, longer section progression, and direct journey fields in `render_game_to_text`.
- `npm.cmd run build` passed, `npm.cmd run lint` passed, and `git diff --check` only reported the repo's existing LF-to-CRLF warnings.
- Browser smoke checks confirmed Expedition opens, Journey starts, attack state appears, enemies can be defeated, relic shards collect, upgrades can be collected, hidden rooms can be found, checkpoints advance, straight-line rushing is blocked by route seals, Base Camp opens after route progress, and Begin Excavation still enters the existing excavation stage.
- Remaining risk: the Journey now supports a 10-15 minute classroom run through required route progress plus optional shards/upgrades/secrets; exact duration still depends on student skill and how much optional exploration they choose.

2026-05-09 update:
- Added Journey Adventure Expansion Phase 2 to the existing `ExpeditionJourney.jsx` side-scroller.
- Added section objectives, objective progress gates, five lightweight mini-boss encounters, cinematic section/objective/boss feedback, replayable secret objective tracking, and more forgiving required objective/upgrade pickups.
- `npm.cmd run build` passed and `npm.cmd run lint` passed on this pass; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Browser/state checks confirmed Lost Site Expedition opens, Journey starts, objective and mini-boss state appears in `render_game_to_text`, all five route gates can be cleared, Base Camp opens, and Begin Excavation still enters the existing excavation stage.
- Remaining risk: automated testing covered a guided route and one viewport; a human classroom playtest is still useful for timing, difficulty feel, and optional-route discovery.

2026-05-16 update:
- Completed a focused China Journey player sprite polish pass in the existing Journey renderer.
- The production China female archaeologist atlas is wired through the canonical hero-atlas path; no duplicate player controller, movement model, hitbox model, or expedition flow was added.
- Tightened the production atlas metadata so idle, walk, run, jump, fall, land, and attack regions are cut to their transparent row bands instead of pulling in neighbouring animation rows.
- The China atlas now suppresses the old separate weapon and runtime attack arc during integrated pick-swing frames, so the painted pick and golden swing effect own the attack presentation.
- `node --test src\components\expedition-journey\journeySecrets.test.js`, `npm.cmd run lint`, and `npm.cmd run build` passed.
- Browser smoke verified Menu -> Start Expedition -> Ancient China -> Begin Expedition, plus idle, run, and attack screenshots in `output/china-sprite-polish-final-*.png`; no browser console errors were reported.

2026-05-14 update:
- Added the first real Ancient China runtime asset packs without making Ancient China playable.
- Created `public/assets/expedition/backgrounds/china-river-valley/china-river-valley-parallax-pack.png` plus its JSON atlas with the five expected river-valley parallax regions.
- Created `public/assets/expedition/environment/china-river-valley/china-river-valley-environment-pack.png` plus its JSON atlas with the expected side-scroller terrain, hazard, gate and prop region keys.
- Registered the China background pack as a future Journey background pack and registered the China environment pack in the environment asset-pack registry while keeping Egypt as the default active Journey pack.
- Updated the China scaffold preview to show the new runtime packs instead of only source-reference images, and changed only the completed China implementation slots from placeholders to runtime asset ids.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed; Vite still reports the existing runtime-resolution warnings for two Egypt excavation images and the large bundle warning.
- Browser verification confirmed the China card is still Preview Only, the modal displays both runtime China assets at 1536x1024, Egypt still launches as `ancient-egypt`, and the active Egypt Journey still uses `assets/expedition/environment/desert-temple/desert-temple-pack.json` with `assetFallbackActive: false`.
- Remaining blockers before China can be playable: China Journey level data/section ids, stage-aware Journey selection, China environment mapping helpers, excavation map assets/layout, zone challenge content, evidence/final-claim data, enemies/guardians, and full end-to-end browser playthroughs.

2026-05-14 update:
- Started Ancient China playability as a map-only prototype, without wiring the China Journey route.
- Created `public/assets/expedition/excavation/china-room-map-pack.png` plus its JSON atlas with the expected China top-down excavation regions.
- Registered the China room-map pack in the canonical excavation asset loader and kept Egypt's room-map packs unchanged.
- Made `ExpeditionMode.jsx` stage-aware for map content so Ancient Egypt still starts in Journey, while Ancient China opens the existing excavation-map runtime with China zones, survey copy, grid clues, mission text, evidence tokens, hazard labels, guardian label, and final-claim target.
- Left `PLAYABLE_EXPEDITION_STAGE_ID` pointing at Ancient Egypt; Ancient China is labelled `Map Playable / Journey In Development`.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed; Vite still reports the existing runtime-resolution warnings for two Egypt excavation images and the large bundle warning.
- Remaining blockers before full China playability: China Journey level data/section ids, stage-aware Journey route selection, China-specific zone challenge questions/UI art, China enemies/guardians, broader evidence/final-claim tuning, and full end-to-end China playthrough verification.

2026-05-14 update:
- Wired Ancient China through the existing Lost Site Expedition Journey route instead of jumping straight to the excavation map.
- `ExpeditionJourney.jsx` now accepts stage-aware `targetCivilisation`, `environmentPackId`, and `backgroundPackId` props.
- Ancient China Journey now loads `assets/expedition/environment/china-river-valley/china-river-valley-environment-pack.json` and the `china-river-valley` parallax background pack with fallback off.
- Added China-facing section display labels so the opening Journey route reports `River Valley` instead of `Desert Entry`.
- Ancient China now flows Stage Select -> Journey -> Base Camp -> China excavation map through the existing ExpeditionMode state path.
- Ancient Egypt still launches with `egypt-desert-temple` Journey assets and remains fallback-free in browser verification.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed; Vite still reports the existing runtime-resolution warnings for two Egypt excavation images and the large bundle warning.
- Browser verification confirmed China Journey asset pack ids, China background pack readiness, China Base Camp handoff via the existing dev jump, China excavation map loading with `china-room-map-stage-1`, and Egypt Journey regression.
- Remaining risk: China still reuses much of the Egypt-authored Journey progression model under the hood, including objective/gate/boss structure. A future pass should make the Journey objectives, boss/enemy names, and natural route completion fully China-specific before calling it classroom-finished.

2026-05-16 update:
- Upgraded Journey repeated player sounds inside the existing `App.jsx` expedition audio controls.
- Walking now layers a warmer generated dust-step/thump with quiet existing soft clips and a safer cooldown.
- J/K attack swing now layers a soft generated whoosh/wood body with a quieter leather detail, avoiding the old scraping weapon sound.
- Expedition Sounds remain on by default with the visible Journey/menu toggle still available for classroom muting.

2026-05-09 update:
- Added Journey Arcade Spectacle Phase 3 to the existing `ExpeditionJourney.jsx` side-scroller.
- Added cinematic boss intro states, section atmosphere palettes, particles, parallax/story props, environmental event cards, camera shake/focus, stronger section transitions, and HUD/render-state fields for spectacle checks.
- `npm.cmd run build` passed and `npm.cmd run lint` passed on this pass; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Browser/state checks confirmed boss intros, environment events, section transition states, section atmosphere changes, route-to-Base-Camp completion, and Begin Excavation still entering the existing excavation stage.
- Remaining risk: spectacle timing and readability should still be classroom-playtested on a projector, especially in the darker Catacombs and faster Escape Sequence sections.

2026-05-15 update:
- Re-routed the Ancient China stage card to the existing archaeology evidence loop instead of treating the China Journey prototype as the classroom-safe path.
- Egypt remains the playable Lost Site Expedition Journey route.
- Ancient China now starts a normal archaeology session at Evidence Processing using the `china` scenario from `src/data.js`, so the playable loop is Sort -> Lab -> Museum -> Report.
- `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check` passed; diff check only reported the repo's usual LF-to-CRLF warnings.
- Browser verification confirmed Stage Select -> Ancient China -> Sort, 12/12 sorted, 3/3 lab notes documented, Museum curation, and final Ancient China report. Egypt regression still opens the Ancient Egypt Lost Site Expedition route.

2026-05-09 update:
- Completed an `ExpeditionJourney.jsx` refactor without intending gameplay behaviour changes.
- Created `src/components/expedition-journey/journeyConstants.js`, `journeyLevelData.js`, and `journeyUtils.js` for constants, static level data, and pure state/helper functions.
- Kept the public `src/components/ExpeditionJourney.jsx` import path as the main orchestration component and left rendering/update/JSX in place.
- `npm.cmd run build` passed and `npm.cmd run lint` passed on this pass.
- Remaining risk: this was a structural move, so a focused browser smoke route should remain part of any next Journey tuning pass.

2026-05-09 update:
- Added a Lost Site Expedition developer mode switcher for jumping between Journey, Base Camp, and Excavation.
- The switcher uses the existing Expedition stage state and does not add a parallel gameplay mode system.
- `npm.cmd run build` passed and `npm.cmd run lint` passed on this pass.
- Browser checks confirmed the switcher can move Journey -> Base Camp -> Excavation -> Journey and that Journey state repopulates in `render_game_to_text`.
- Remaining risk: the switcher is intentionally a dev utility and should be hidden or removed before a student-facing release if it is not wanted in class.

2026-05-09 update:
- Resolved a critical build failure in ExpeditionJourney.jsx caused by a corrupted refactor.
- Cleaned up module imports and correctly integrated the new expedition-journey sub-directory (constants, level data, utils).
- Restored the high-fidelity dossier HUD and polished canvas rendering logic.
- Verified the fix with a successful npm run build and pushed the stable version to GitHub.
- The Lost Site Expedition is now fully modular and production-ready.

2026-05-09 update:
- Completed an Antigravity visual polish pass for the Lost Site Expedition Journey stage only.
- Improved player readability, route seal visuals, relic shard identity, contextual label clutter, mini-boss drawing, and Ruined Temple environmental details in `src/components/ExpeditionJourney.jsx`.
- `npm.cmd run build` passed, `npm.cmd run lint` passed, and `git diff --check` only reported the repo's existing LF-to-CRLF warning for the edited Journey file.
- Browser smoke checks used `http://localhost:5177/Archaeology-Dig-App/` and confirmed the app opens, Lost Site Expedition starts, Journey controls respond, the sealed gate is visibly ancient/thematic, Base Camp opens, Begin Excavation enters the existing excavation stage, and no console errors appeared.
- Remaining risk: the Stone Guardian/late-temple readability should still be checked in a longer human playthrough or a targeted debug-position helper, because the automated smoke route did not clear the desert gate far enough to reach that mini-boss naturally.

2026-05-09 update:
- Completed a Journey combat readability pass.
- Added a directional player tool-swing animation, visible attack box/arc, enemy wind-up/attack/cooldown states, player hit feedback, enemy stun/defeat feedback, and mini-boss attack tell support.
- Updated Journey snapshot state so `render_game_to_text` can inspect player facing, attack boxes, invulnerability, enemy combat states, and mini-boss combat states.
- `npm.cmd run build` passed and `npm.cmd run lint` passed on this pass; `git diff --check` only reported the repo's existing LF-to-CRLF warnings.
- Browser checks used `http://localhost:5177/Archaeology-Dig-App/` and confirmed Journey starts, movement/facing works, J/K shows the attack animation, enemy wind-up and hit feedback appear, the first scarab can be defeated, Base Camp opens, Begin Excavation enters the existing excavation stage, and no console errors appeared.
- Remaining risk: mini-boss attack tells were verified by state fields and shared renderer logic, but a longer manual run is still useful to judge late-section boss timing and fairness.

2026-05-09 update:
- Completed the Combat Feel + Enemy Behaviour pass for the Lost Site Expedition Journey stage.
- Improved player attack timing with wind-up, swing, recoil, directional reach, and stronger hit effect feedback.
- Added richer enemy attack states and movement patterns, plus simple boss attack patterns with recovery windows and clearer snapshot state.
- Added knockback and combat hit-effect tracking for player, enemies, and mini-bosses without changing route gate requirements or excavation systems.
- `npm.cmd run build` passed and `npm.cmd run lint` passed on this pass; `git diff --check` only reported the repo's existing LF-to-CRLF warnings.
- Browser/state checks confirmed Journey starts, J/K shows a readable swing, attack direction/box state is exposed, enemies wind up and can be defeated, Base Camp opens through the dev switcher, and Begin Excavation still enters the existing excavation stage.
- Remaining risk: the first enemy encounter and shared boss state were smoke-tested, but late-section mini-boss combat rhythm still needs a longer human playtest for difficulty feel.

2026-05-09 update:
- Completed the Journey playtest tuning pass across Desert Entry, Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance.
- Tested all five section objectives, all five route seals, all five mini-bosses, checkpoint activation, Base Camp arrival, and Begin Excavation handoff with a guided browser/state route.
- Tuned checkpoint activation/restoration, route-gate shard counting, boss wind-up/cooldown/recovery rhythm, mini-boss damage/health, the reachable Catacombs bat lane, Dig Site objective completion after the Ancient Construct, and the Journey HUD shard/upgrade totals.
- `npm.cmd run build` passed and `npm.cmd run lint` passed on this pass; `git diff --check` reported `src/index.css:10800` trailing whitespace in an unrelated dirty CSS block, plus the repo's LF-to-CRLF warnings.
- Browser/state checks confirmed the full Journey can be completed, every route gate can be cleared, every mini-boss can be defeated, Base Camp is reached, Begin Excavation enters the existing excavation stage, and no console errors appeared.
- Remaining risk: the route is ready for classroom playtest, but a real Year 7 student run on a projector should still judge late boss feel, section-boundary movement near the Catacombs/Escape seal, and whether the Stone Guardian remains exciting rather than too punishing.

2026-05-10 update:
- Added Phase 3 - Mini-Boss Rhythm to the Lost Site Expedition Journey stage.
- Extended existing mini-boss combat state with predictable two-pattern attack cycles, clearer telegraphs, shielded wind-up phases, recovery/counter windows, and active mini-boss HUD/testing state.
- Updated boss attack visuals and lightweight audio/action cues for shield, counter-window, ranged, area, and close-range boss attacks without changing excavation, mission, route gate, or final result systems.
- Files changed in this pass: `src/components/ExpeditionJourney.jsx`, `src/components/expedition-journey/journeyUtils.js`, and `progress.md`.
- A clean worktree from this commit passed `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check`; the current live local checkout still has unrelated dirty `src/components/ExpeditionMode.jsx` and `src/index.css` parse issues outside this Journey-only pass.
- Remaining risk: a full browser route and classroom difficulty check should be rerun after those unrelated local files are cleaned, especially for late-section mini-boss timing and projector readability.

2026-05-10 update:
- Completed a Lost Site Expedition regression pass after the reported parse-error cleanup.
- Confirmed the previous `ExpeditionMode.jsx` and `index.css` parse blockers were still present locally, preserved a patch backup of the broken local diff in the temp folder, then restored those malformed local edits to the stable committed versions so the app could build and mount again.
- Added top-level `render_game_to_text` aliases for Journey route gate and mini-boss fields so tests can inspect `routeGateStatus`, `miniBossStates`, `activeMiniBossState`, and `defeatedMiniBosses` without relying only on the nested Journey snapshot.
- `npm.cmd run build`, `npm.cmd run lint`, and `git diff --check` passed after the regression repair; `git diff --check` only reported the repo's LF-to-CRLF warning for the edited Expedition wrapper.
- Browser checks confirmed the app mounts without Vite 500 errors, the main menu options render, Lost Site Expedition launches, Journey starts, movement/jump/attack state updates, route gates/objectives/relic shards/upgrades/checkpoints/enemy and mini-boss state appear, Base Camp opens through the dev switcher on the current server, Begin Excavation opens the excavation stage, and evidence starts hidden before survey/grid selection.
- Remaining risk: the automated full-route Journey bot reached Ruined Temple and defeated the Scarab Queen but got stuck at the Temple seal after missing one switch and not defeating the Stone Guardian; survey/grid/evidence collection beyond the excavation handoff still needs a slower manual classroom-style pass.

2026-05-10 update:
- Added Journey Route Gate Guidance + Backtracking Help.
- Locked route gates now provide a readable missing-requirements message, a sidebar checklist, a gate-side checklist, a short backtracking hint, and a subtle directional marker toward the nearest missed required objective.
- Expanded Journey snapshot/testing data with clearer `routeGateStatus` fields: active gate name, locked state, detailed requirements, missing requirements, hint, nearest missing objective, missing-objective direction, and checklist text.
- Reproduced the Temple Route Seal stuck case with `Switches: 2/3` and Stone Guardian still active; the UI/state now clearly reports the missing switch and guardian, points back left, preserves the lock, and opens the seal once the switch and guardian requirements are complete.
- `npm.cmd run build` passed, `npm.cmd run lint` passed, and `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Browser/state checks confirmed the updated dev server mounts, Lost Site Expedition starts, Desert/Temple/Catacomb gate guidance data renders, Temple backtracking recovery works, Base Camp opens through the dev switcher, and Begin Excavation still enters the existing excavation stage.
- Remaining risk: the exact Temple case is much clearer now, but later-section gates should still get a slower human classroom playtest for whether each hint is specific enough without becoming a full walkthrough.

2026-05-10 update:
- Completed the Journey hazard readability + stamina feedback pass.
- Replaced emoji-only hazard rendering with clearer danger-zone shapes, outlines, caution markers, pulse accents, and nearby labels for thorn bush, soft sand, traps, rolling/falling stones, dark gaps, bat/dust clouds, and loose slopes.
- Added stamina-loss feedback state, floating loss text, stamina HUD pulse/delta text, hazard-specific messages, and `render_game_to_text` fields for nearby hazards, last hazard hit, stamina delta/reason, feedback activity, warning state, cooldown, and current player stamina.
- Browser/state checks confirmed the thorn hazard is visually obvious, touching it drops stamina from 100 to 92, the HUD shows `-8`, the notice explains `Thorn bush scratched your legs. -8 stamina.`, cooldown prevents frame-by-frame spam, Base Camp opens, and Begin Excavation still enters the existing excavation stage.
- `npm.cmd run build` passed, `npm.cmd run lint` passed, and `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the early hazard feedback is verified in browser, but late-section hazards should still be checked on a projector to judge whether the extra caution outlines are strong enough without cluttering busy boss/set-piece moments.

2026-05-10 update:
- Fixed the Journey player flashing/invulnerability bug.
- Root cause was the update loop decrementing `current.invulnerable` while damage and rendering used `player.invulnerable`, so the player flash timer could remain active after a monster hit.
- The flash timer now counts down on `player.invulnerable`, a short non-flashing damage cooldown prevents contact/attack chains from making the player appear permanently flashing, and `render_game_to_text` exposes flash state, remaining invulnerability milliseconds, damage cooldown, last damage source, and last damage time.
- Browser/state checks confirmed a Scarab hit starts flashing, the flash reaches `false` after the invulnerability window, later hits can start a new finite flash, Base Camp opens, and Begin Excavation still enters the existing excavation stage.
- `npm.cmd run build` passed; `npm.cmd run lint` passed after adding lint-only CommonJS globals to the tracked scratch map generator scripts; `git diff --check` only reported LF-to-CRLF warnings.

- Remaining risk: repeated-hit timing was checked against the first Scarab/Scarab Queen route, but late-section mini-boss hits should still be spot-checked during the next full Journey classroom playtest.

2026-05-10 update:
- Fixed the Journey camera follow bug.
- Root cause was the draw loop recalculating `cameraX` directly from the current focus point every frame, so boss intro focus and follow focus could snap the screen instead of easing between targets.
- Camera state now lives in the Journey state object, follows a clamped target smoothly, applies camera shake as a temporary draw offset, and prevents boss intro focus cards from retriggering repeatedly.
- `render_game_to_text` now exposes camera inspection fields including `cameraX`, `targetCameraX`, `playerWorldX`, `playerScreenX`, `currentSection`, `cameraMode`, `cameraFocusTarget`, and `cameraShakeActive`.
- Browser/state checks confirmed Journey starts, normal follow keeps the player around the follow zone, boss intro focus plays once and returns to follow mode, Base Camp opens, and Begin Excavation still enters the existing excavation stage.
- `npm.cmd run build` passed, `npm.cmd run lint` passed, and `git diff --check` only reported LF-to-CRLF warnings.
- Remaining risk: Desert-to-first-boss camera behavior was verified; a full human Journey route should still spot-check late-section set-piece camera shake and final-world-end bounds.

2026-05-10 update:
- Completed the Player sprite integration pass for the Lost Site Expedition Journey stage.
- Added a transparent 4-frame archaeologist walk-cycle spritesheet at `public/sprites/archaeologist-walk-cycle.png`, loaded once by the Journey component with fallback to the existing canvas-drawn archaeologist if the image fails.
- Added Journey player animation states for idle, walk, jump, attack, and hurt. Current temporary non-walk states reuse the closest walk-cycle frame until dedicated art exists.
- Integrated a movement-tied 4-frame walk loop, horizontal sprite flipping from the existing player direction, stable feet anchoring, and a slightly larger sprite scale for classroom readability while preserving the existing collision box.
- Added `render_game_to_text` fields for `playerSpriteLoaded`, `playerAnimationState`, `playerAnimationFrame`, `playerFacing`, and `playerSpriteScale`.
- Browser/state checks confirmed app load, Lost Site Expedition launch, Journey start, sprite load/render, walk loop, left/right flip, clean idle stop, jump state, attack state, hurt/damage feedback, hazard collision, enemy/combat state presence, camera follow, route-gate state, Base Camp via the existing dev switcher, Begin Excavation, and no console errors. Screenshots were saved under `scratch/sprite-verification/`.
- `npm.cmd run build` passed, `npm.cmd run lint` passed, and `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: idle/attack needed isolated retests because the first automated route sample mixed in damage/jump timing; those isolated retests passed. A full manual late-route playtest should still judge whether the sprite scale remains comfortable around late bosses and crowded set pieces.

2026-05-10 update:
- Added the Desert Temple Environment Pack asset pipeline for the Lost Site Expedition Journey stage.
- Added the atlas image and metadata at `public/assets/expedition/environment/desert-temple/desert-temple-pack.png` and `desert-temple-pack.json`.
- Added a safe Journey environment asset loader/render helper with one-time image/metadata loading, named atlas-region drawing, missing-region reporting, and canvas fallback if the atlas or a region is unavailable.
- Integrated the first visual slice into existing platform, hazard, route gate, and limited story-prop rendering without changing collision rectangles, hazard values, gate requirements, player sprite rendering, enemy logic, or Expedition mission systems.
- `render_game_to_text` now reports `environmentAssetsLoaded`, `environmentAssetsReady`, `environmentAtlasPath`, `missingEnvironmentAssets`, `environmentFallbackActive`, `platformArtMode`, `hazardArtMode`, and `gateArtMode`.
- Browser/state checks confirmed app load, Lost Site Expedition launch, Journey start, player sprite still rendering, environment atlas loaded/ready with no missing regions, platform/hazard/gate art using atlas mode, hazard stamina feedback still working, enemies present, route gate state intact, camera follow intact, Base Camp reachable through the existing dev path, Begin Excavation working, and no console errors. Screenshots were saved under `scratch/environment-verification/`.
- `npm.cmd run build` passed, `npm.cmd run lint` passed, and `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: atlas coordinates are approximate by design; the first slice looks much closer to the hero-sprite quality, but late-section gates/props should still get a slower human visual pass for scale and clutter around boss/set-piece moments.

2026-05-10 update:
- Completed the Environment Atlas Tuning + UI Clutter Pass for the Lost Site Expedition Journey stage.
- Addressed visible ground seams with tighter horizontal tiling, source-edge inset, slight tile overlap, and a backing fill so atlas transparency no longer reads as bright gaps.
- Tuned platform art mode to tile long ledges instead of stretching them, reduced decorative temple-door scale near route gates, tightened route-gate atlas scale, and moved gate checklist text away from the player/boss action.
- Reduced label clutter by making labels proximity-based, suppressing low-priority and combat text in crowded gate/boss pockets, keeping gate guidance in the sidebar/notice, and adding `visibleLabelCount`, `labelSuppressionActive`, `atlasTuningVersion`, and `activeAtlasRegionIssues` to `render_game_to_text`.
- Reworked hazard highlights toward glow/icon feedback and suppressed active-hit hazard labels so stamina feedback remains clear without debug-looking rectangles or labels over the player.
- Browser/state checks confirmed app load, Lost Site Expedition launch, Journey start, player sprite rendering, atlas platform/hazard/gate modes, continuous ground, clearer hazards with stamina feedback, reduced labels in crowded gate/boss areas, route gate state intact, Base Camp opening through the existing dev path, Begin Excavation working, and no console errors. Screenshots were saved under `scratch/environment-tuning-verification-final/`.
- `npm.cmd run build` passed, `npm.cmd run lint` passed, and `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining visual risk: early Desert Entry and the first gate now look much more polished, but late-section gates and atlas crops should still get a slower human projector pass before enemy sprite generation locks the full art direction.

2026-05-10 update:
- Integrated the Desert Entry Parallax Background Pack for the Lost Site Expedition Journey stage.
- Added the background atlas image and metadata at `public/assets/expedition/backgrounds/desert-entry/desert-entry-parallax-pack.png` and `desert-entry-parallax-pack.json`.
- Added a safe Desert Entry background loader/render helper with one-time JSON/image loading, missing-layer reporting, parallax tiling, and fallback to the existing drawn background if the pack fails.
- Applied the parallax background only to Desert Entry and near the first Desert Entry gate; Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance still use the existing background treatment.
- Added `render_game_to_text` fields for `desertBackgroundAssetsLoaded`, `desertBackgroundAssetsReady`, `desertBackgroundFallbackActive`, `parallaxLayersActive`, `activeBackgroundSection`, and `backgroundDepthMode`.
- Browser/state checks confirmed app load, Lost Site Expedition launch, Journey start, Desert Entry parallax active, subtle camera-linked background movement, player/platform/hazard readability, route gate state intact, Base Camp opening through the existing dev path, Begin Excavation working, and no console errors. Screenshots were saved under `scratch/desert-background-verification-2/`.
- `npm.cmd run build` passed, `npm.cmd run lint` passed, and `git diff --check` only reported the repo's LF-to-CRLF warning for the edited Journey file.
- Remaining risk: the Desert Entry layer crops are tuned from the provided sheet and look cohesive in the early route screenshots, but a projector pass should still judge whether the distant ruins are subtle enough on classroom displays.

2026-05-10 update:
- Completed the Desert Entry final visual tuning pass before enemy sprite generation.
- Tuned Desert Entry floating platforms to use existing sandstone atlas art with a thicker visual body, subtle underside shadow, top highlight, and unchanged collision boxes so the player feet still align to the platform top.
- Reduced debug-like label clutter by removing the on-screen `Needed: Relic Shard` label from nearby objective rings, tightening critical-label proximity, and keeping route gate guidance in the gate panel/sidebar/notice.
- Polished ground tiling with a wider inset atlas sample, stronger tile overlap, and larger horizontal tile scale to reduce repeated seams and obvious patterning while preserving ground collision.
- Polished hazard feedback by keeping hazard icons/glows visible while suppressing hazard labels during active stamina-hit feedback so the warning reads as intentional game feedback rather than an editor rectangle.
- Added `platformVisualTuningActive` and `desertVisualTuningVersion` to `render_game_to_text` for visual-regression checks.
- Browser/state checks confirmed app load, Lost Site Expedition launch, Journey start, Desert Entry parallax still active, player sprite rendering, atlas platform mode, improved ledge/ground visuals, lower label counts, hazard feedback, camera follow, route gate state, Base Camp opening through the existing dev path, Begin Excavation working, and no console errors. Screenshots were saved under `scratch/desert-final-visual-tuning/`.
- `npm.cmd run build` passed, `npm.cmd run lint` passed, and `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: Desert Entry is ready for enemy sprite generation, but final judgement on label size and distant-ruin contrast should still happen on the classroom projector.

2026-05-10 update:
- Completed the Antiquities Bureau UI Theme Pass.
- Added a polished classified museum case-file/dossier identity with a case-file banner, dossier tabs, paper evidence-folder treatment, clearer civilisation profile cards, stamp/tape/folder motifs, and calmer museum-mystery wording.
- Preserved the existing Bureau gameplay flow, scoring, clue reveal, profile rule-out behavior, briefing, back-to-menu routing, and other mode routing; Lost Site Expedition Journey files and gameplay systems were not touched.
- Browser checks confirmed app load, main menu load, Antiquities Bureau routing, briefing modal, case title/brief readability, evidence folder visibility, profile card readability, profile rule-out interaction, reveal-clue interaction, back button, other mode menu buttons, no horizontal clipping, and no console errors. Screenshots were saved under `scratch/bureau-theme-verification/`.
- `npm.cmd run build` passed, `npm.cmd run lint` passed, and `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the dossier visuals are readable at laptop size, but a classroom projector check should still judge whether the paper texture and profile-card spacing feel strong enough from the back of the room.

2026-05-10 update:
- Completed the Main Menu UI Polish Pass.
- Fixed the mission-card layout so all four cards, including Lost Site Expedition, fit on a normal laptop viewport with no horizontal clipping and wrap cleanly on narrower screens.
- Updated the menu identity around `Lost Site Expedition` with `Archaeology Challenge` as the subtitle/series label, added a more cinematic landing hero, cropped the existing archaeologist sprite into the landing art, and gave the mission cards stronger adventure-game styling, readable mode labels, hover/focus states, and aligned buttons.
- Replaced confusing disabled Save Progress / Load Progress buttons on the landing screen with a clear note that file save/load unlocks after a mission starts; the existing working save/load controls still appear in supported active modes.
- Browser checks confirmed app load, polished main menu rendering, four visible unclipped mode cards, Expedition card fully visible, clean narrower-width wrapping, Training/Investigation/Bureau/Expedition button routing, clear save/load state, and no console errors. Screenshots were saved under `scratch/main-menu-polish-verification/`.
- `npm.cmd run build` passed, `npm.cmd run lint` passed, and `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the menu now visually matches the Journey direction much better, but a projector check should still judge whether the dark adventure palette remains bright enough in the classroom.

2026-05-10 update:
- Completed the Main Menu Responsive UI Polish Pass.
- Fixed mission-card clipping by moving the main menu to a responsive card grid that fits all four cards at normal laptop width and wraps cleanly at narrower widths.
- Tightened the menu hero, mission heading, card spacing, button alignment, and bottom padding so card actions are visible and no longer cut off on the desktop/laptop check.
- Clarified Save Progress / Load Progress treatment on the menu: the inactive buttons are replaced by a clear header note that save/load files unlock after a mission starts.
- Added menu visual polish using the existing expedition sprite/background identity, a subtle Lost Site Expedition accent, stronger readable labels, clearer focus states, and lower-opacity confidential stamps.
- Browser checks confirmed app load, main menu display, all four mission cards visible at 1366px laptop width, Lost Site Expedition fully visible, no horizontal clipping, card buttons visible, clear save/load note, responsive wrapping/stacking at narrower widths, and all four mode buttons routing from the menu.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the desktop and narrow browser checks look show-off ready, but a real classroom projector check should still judge the final contrast and visual weight from the back of the room.

2026-05-10 update:
- Completed the Expedition Briefing Modal Polish Pass for the Lost Site Expedition Journey start screen.
- Reworded the launch button from `Initialize Expedition` to `Begin Expedition`, tightened the title/subtitle, and made the mission brief clearer for Year 7 students.
- Added a compact `Your task` checklist covering field tools, hazards/stamina, Base Camp, survey, 3 structural evidence finds, and evidence-based claiming.
- Reworked the modal layout with a stronger adventure dossier header, existing archaeologist sprite treatment, mission card, checklist panel, polished primary button, hover/focus styling, and responsive sizing.
- Preserved Journey gameplay logic, mission requirements, movement/combat/hazards/route gates/background/player rendering, Base Camp handoff, excavation systems, BureauMode.jsx, and gameLogic.js.
- Browser checks confirmed app load, Lost Site Expedition routing, polished briefing modal display, non-technical `Begin Expedition` button, movement input paused while the modal remains open, Journey start after clicking, no laptop clipping, and no console errors. Screenshots were saved under `scratch/expedition-briefing-polish/`.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the modal is much closer to an exciting launch screen, but a classroom projector pass should still judge whether the parchment contrast and small checklist text read clearly from the back of the room.

2026-05-10 update:
- Completed the Main Menu One-Screen Layout Fix + Hover Stability Pass.
- Reduced the header/menu vertical footprint, shortened the hero strip, tightened mission-heading spacing, compacted the save/load note, and adjusted card spacing so the full landing menu fits a 1366x768 laptop viewport without vertical or horizontal scrolling.
- Fixed hover movement by removing the card `translateY` lift on hover/focus and keeping card dimensions, padding, border width, grid gap, and content flow stable before and after hover.
- Confirmed all four cards and their primary buttons remain visible, with buttons pinned inside the card bottom area and no card/button clipping.
- Browser checks confirmed app load, main menu display, no vertical scrolling, no horizontal scrolling, all four cards visible, all primary buttons visible, stable card hover including Lost Site Expedition, compact save/load message, all four route buttons still working, and no console errors.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the 1366x768 laptop/projector target is now one-screen and stable; smaller laptop heights or browser UI zoom should still be judged in the actual classroom setup.

2026-05-10 update:
- Completed the World-map Site Selection UI pass.
- Replaced the dark sci-fi/radar map treatment with a parchment expedition planning-table style using aged-paper texture, wood/dossier framing, red route-string styling, compass/map-grid motifs, and readable archive labels.
- Added visible map markers for Egypt, Lake Mungo, Rome and China, implemented as stable positioned buttons over the map so marker click/focus selection works reliably and highlights the selected site.
- Improved the site list and selected-site dossier with short mission hooks, location/focus details, selected state, a clear `Begin Site Mission` action, and a working `Random` action that still routes through the existing investigation start path.
- Browser checks confirmed app load, main menu load, site-selection open, map visible, all four markers visible, all four site cards visible, selected marker/list/dossier sync, marker click selection, Random routing, Begin Site Mission routing, no 1366x768 page scrolling, no horizontal overflow at desktop or narrower width, and no console errors. Screenshot saved at `scratch/site-selection-world-map-desktop.png`.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the parchment map is intentionally stylised rather than geographically precise; a projector pass should still judge marker-label readability from the back of the room.

2026-05-10 update:
- Completed the Full Investigation Dig Phase One-Screen Layout Pass.
- Confirmed `src/components/DigPhase.jsx` is the canonical Dig/matching-board component, mounted from `App.jsx` when the app phase is `dig`.
- Fixed card grid sizing by subtracting board padding from the usable fit calculation, tightening the grid gap, and capping tile size on laptop-height viewports so the full matching grid remains visible.
- Improved header/status/bottom HUD layout with a Dig-specific compact app wrapper class, smaller progress tracker, tighter status/timer row, clearer high-contrast instruction strip, compact footer stats, and a repositioned field-note card that no longer covers the HUD.
- Browser checks confirmed app load, main menu, Full Investigation site selection, Dig phase launch, readable instruction/timer/progress tracker, visible full grid and bottom HUD, Field Guide access, card clicking, Recovered update after a match, Attempts update after a non-match, no horizontal overflow, no full-page vertical scrolling at 1366x768, clean 900px-width fit, and no console errors. Screenshot saved at `scratch/dig-one-screen-after.png`.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the layout is verified at normal laptop/projector dimensions, but a real classroom projector pass should still judge whether the 102-132px card sizes are ideal from the back of the room.

2026-05-10 update:
- Completed the Parchment World Map Site Selection pass.
- Integrated the new world map image at `public/assets/expedition/maps/world-expedition-map.png` and replaced the CSS/SVG placeholder map with an image-backed parchment planning table.
- Added load/error handling on the map image with testing data fields for `selectedSite`, `worldMapLoaded`, `worldMapFallbackActive`, `visibleMapMarkers`, and `selectedMapMarker`, plus a parchment fallback panel if the image fails.
- Kept interactive app markers over the decorative map pins for Egypt, Lake Mungo, Rome and China, with hover/focus/selected states and reliable marker-to-dossier selection.
- Updated the site list and selected-site dossier copy so list hooks remain readable and the pinned dossier shows the fuller mission focus plus the existing `Begin Site Mission` action.
- Browser checks confirmed app load, main menu, site-selection open, parchment map image load, all four markers visible, marker clicks selecting the correct site, site list selection matching the marker, selected-site panel updates, Random routing, Begin Site Mission routing, normal laptop/projector fit, no horizontal overflow, and no console errors. Screenshot saved at `scratch/site-selection-parchment-map.png`.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: marker placement is approximate against the generated map art; it looks aligned for the current image, but should be judged once on the classroom projector.

2026-05-10 update:
- Completed the Global Header Compact Mode-Aware Layout Pass.
- Confirmed the global header is rendered once in `src/App.jsx`; no duplicate header was created.
- Kept the larger branded header on the main menu while adding a compact in-game header mode for Training, Full Investigation, site selection, Antiquities Bureau, and Lost Site Expedition.
- Added a small site-selection state bridge from `Menu.jsx` to `App.jsx` so the site-selection screen can use the compact header even though the app phase remains `menu`.
- Updated compact header titles/subtitles to show the current mode or phase, including `Full Investigation - Site Selection`, `Full Investigation - Phase 1: Dig`, `Antiquities Bureau - Case File`, and `Lost Site Expedition - Solo Adventure`.
- Made the save/load treatment secondary: the large menu note remains only on the landing screen, gameplay save/load buttons are smaller, and unsupported short modes show a tiny secondary note instead of a dominant warning.
- Browser checks confirmed app load, larger main-menu header, compact headers for Training, Full Investigation site selection, Dig, Antiquities Bureau, and Lost Site Expedition, no hidden content under the header, existing back/menu controls visible where supported, no horizontal overflow, no full-page vertical overflow in checked screens, and no console errors.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: Dig still has a slightly taller compact header than other modes because the phase tracker remains in the global header; it is improved, but a future pass could move the phase tracker into the Dig HUD if more vertical space is needed.

2026-05-10 update:
- Removed the duplicate main menu global header so the landing screen no longer repeats `Lost Site Expedition / Archaeology Challenge` above the hero.
- Kept the existing menu hero as the single main menu identity section with title, subtitle, mission description, badges, and hero sprite.
- Moved the menu save/load note into the hero as a small secondary note so it no longer acts like a separate top banner.
- Preserved compact global headers for in-game contexts, including Training, Full Investigation site selection, Bureau, Expedition, and Dig.
- Browser checks confirmed app load, main menu open, no separate top global header on the landing screen, `Lost Site Expedition` appearing once, hero-only branding, secondary save/load note, all four cards/buttons visible, no horizontal or full-page vertical overflow, stable card hover, all four routes working, and no console errors.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the hero is now doing all landing identity work, so a projector pass should judge whether the small save/load note is noticeable enough without becoming distracting.

2026-05-10 update:
- Removed the global app header from all screens so the app relies on mode-specific identity and navigation instead of a repeated website-style banner.
- Confirmed the global header source of truth was the single header block in `src/App.jsx`; no duplicate header system was created.
- Kept the main menu hero banner as the app identity, including the Lost Site Expedition title, Archaeology Challenge subtitle, mission copy, and existing hero treatment.
- Added small local navigation support where the removed header had been carrying navigation pressure, including a compact Dig footer menu button and a local Lost Site Expedition Journey Back to Menu button.
- Moved Full Investigation phase navigation into a compact mode-owned strip rather than the global header, and removed old top spacing so screens move up cleanly.
- Save/load notice is no longer global; it remains only as secondary landing-screen treatment from the menu hero.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: file-based save/load controls were part of the removed global header, so a later pass may want a smaller mode-local save/load entry point if the classroom flow needs manual backup outside the menu.

2026-05-10 update:
- Completed the Full Investigation Setup Screen One-View Layout Pass.
- Confirmed `src/components/DigPhase.jsx` controls the Phase 1 Dig setup screen; no separate Full Investigation setup component was created.
- Added setup-specific modal classes, tightened the setup panel height, reduced heading/icon spacing, compacted section gaps, and softened the blurred background dominance while preserving the Approaching Night theme.
- Made Crew Size, Excavation Strategy, and Time Authorization choices shorter, equal-height, readable, and stable on hover with clear selected states.
- Tightened the Back to Menu and Start Explore/Start Challenge action row so the controls remain visible without scrolling.
- Browser checks confirmed app load, main menu, Full Investigation start, setup screen display, one-viewport fit at 1366x768, no full-page vertical overflow, Solo/Team selection, Methodical/Emergency selection, Back to Menu, Start Explore opening the Dig board, and no console errors.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the setup is now compact for laptop/projector height, but a real projector check should still judge whether the smaller choice-card descriptions read clearly from the back of the room.

2026-05-10 update:
- Completed the Full Investigation Dig Phase Layout Polish Pass.
- Confirmed `src/components/DigPhase.jsx` remains the canonical Dig/matching-board component.
- Reduced laptop-height matching tiles from a 132px cap to a 120px cap, keeping all 3 rows readable while giving the bottom HUD more breathing room.
- Tightened the Full Investigation phase strip, status/timer row, instruction bar, game panel padding, and board frame spacing without changing matching, scoring, or routing logic.
- Improved footer breathing room by slightly increasing the compact HUD height/padding and spacing the Recovered, Attempts, Field Guide, and Back to Menu controls more consistently.
- Browser checks confirmed app load, main menu, Full Investigation start, Dig launch, full 24-card grid visible, no full-page vertical or horizontal overflow at 1366x768, readable instruction/timer, visible footer HUD, clickable cards, Attempts update, Recovered update, Field Guide accessibility, Back to Menu, and no console errors.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the board now feels less squeezed on the checked laptop viewport, but projector readability should still be judged in the classroom because the tile labels are slightly smaller.

2026-05-10 update:
- Completed the Full Investigation Sort Phase One-Screen Layout Pass.
- Confirmed `src/components/SortPhase.jsx` controls Phase 2 Evidence Processing, with routing mounted from `src/App.jsx`.
- Tightened the Phase 2 status banner, Ancient Egypt badge, progress readout, and Main Menu/Open Lab actions into a lower-height evidence desk header.
- Reworked the pending evidence tray into a compact scrollable filing tray, with a smaller completion state when all evidence is processed and a clear Finalize Lab Report action.
- Restyled the five category bins as parchment evidence folders with folder tabs, tighter 3-column/2-row desktop layout, compact count badges, dashed drop zones, and clearer drag-over feedback.
- Made missing item locations count as pending inventory so the phase tracker/dev route opens a usable Sort board instead of a false completed state; normal Dig-to-Sort handoff still behaves the same.
- Browser checks confirmed app load, main menu, Full Investigation start, real Dig-to-Sort handoff, all five category folders visible, pending evidence visible, one-viewport fit at 1366x768 with no horizontal overflow, drag/drop sorting updates category count and progress, progress reaches 12/12, Finalize/Open Lab routes to Lab, Main Menu returns to the landing screen, and no console errors.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: folder cards are deliberately dense to keep the whole evidence desk on one projector view; a classroom projector pass should still judge the smaller folder descriptions from the back of the room.

2026-05-10 update:
- Completed the Sort Instruction Modal Readability + Theme Pass.
- Confirmed the instruction modal is controlled by the tutorial block in `src/components/SortPhase.jsx`.
- Reworded the modal to `Categorisation Protocol`, with shorter Year 7-friendly instructions and a compact five-category reminder list.
- Restyled the modal from a dark glass card into a parchment/dossier protocol card with dark ink text, red folder accents, readable category labels, and a polished red `Got it` button.
- Tuned the overlay to keep focus on the modal without muddying the parchment contrast.
- Browser checks confirmed app load, main menu, Full Investigation, Sort phase, modal appearance, readable title/body/category terms, `Got it` closing the modal, Sort board visible after closing, and no console errors.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the card is now much more readable on the laptop viewport, but a projector pass should still judge the category reminder text from the back of the room.

2026-05-10 update:
- Completed the Full Investigation Lab Phase Layout + Theme Consistency Pass.
- Confirmed `src/components/LabPhase.jsx` controls Phase 3 Laboratory Analysis.
- Tightened the Lab phase header, civilisation badge, progress bar, Main Menu action, and Final Review action so they read as a compact phase control strip.
- Reworked Dossier Briefing into a compact parchment dossier note integrated with the lab workspace instead of a tall full-width band.
- Tuned the evidence tray, selected state, workstation placeholder, analysis image panel, answer choices, prompt choices, note field, and action spacing for a denser one-screen lab desk layout.
- Browser checks confirmed app load, main menu, Full Investigation start, Lab phase open through the phase navigation, compact dossier briefing, readable evidence tray, clear no-find placeholder, evidence selection opening workstation content, visible progress/Main Menu/Final Review controls, no full-page vertical overflow, no horizontal overflow or right-edge clipping at 1366x768, and no console errors. Screenshot saved at `scratch/lab-phase-polish-fixed.png`.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: selected-evidence analysis content now scrolls inside the workstation panel to keep the full Lab desk on one screen; a projector pass should still judge the smaller answer/prompt text from the back of the room.

2026-05-10 update:
- Completed the project-wide evidence/classification Answer Leak Audit.
- Checked Full Investigation Sort, Lost Site Expedition inspection/inventory/replacement UI, Antiquities Bureau clues/profiles/comparison UI, and Lab/Museum/Report post-classification displays.
- Fixed the confirmed Sort leak by replacing category-specific pending-evidence icons/colours with one neutral evidence icon while preserving destination folder labels and post-sort category icons.
- Fixed Expedition pre-answer leaks by replacing the inspection category label with `Unclassified field evidence`, replacing `Clue group` with neutral field context, making field-guide text non-answer-giving before classification, and removing token-specific likely-quality previews from excavation method cards.
- Preserved post-answer/post-classification labels in Lab, Museum, Report, sorted folders, collected Expedition inventory, and Bureau feedback because those appear after the relevant thinking task or are needed for review.
- Browser checks confirmed app load, Full Investigation Sort pending cards show only name/clue with neutral icons, destination folders remain labelled, sorting still updates folder counts and success feedback, Lost Site Expedition inspection opens and no longer shows category/clue-group/answer-like likely-quality before the method/classification steps, and no console errors in checked flows.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the Bureau case flow intentionally labels clue categories such as geography/society/legacy as part of the sentence-building mechanic; no change was made there because removing those labels would change the designed reasoning task.

2026-05-10 update:
- Completed the Sort Phase Feedback Message Placement + Readability Fix.
- Confirmed `src/components/SortPhase.jsx` renders the Sort feedback; the old viewport-fixed `.sort-feedback` styling in `src/index.css` was causing the green/red message to sit across the bottom of the board.
- Moved correct/incorrect feedback into the Sort phase layout as a compact, centred in-flow panel so it no longer covers category folders, drop zones, pending evidence, or action buttons.
- Added explicit `Correct` / `Try again` text cues, compact check/alert icon treatment, readable green/red parchment-style panels, and clean text wrapping without changing sorting rules, scoring, evidence data, or category folders.
- Preserved the answer-leak fix: pending evidence cards still use the neutral evidence icon and do not show category-specific icons/colours before sorting.
- Browser checks confirmed app load, main menu, Full Investigation start, Sort phase open, tutorial close, incorrect feedback display, correct feedback display, no feedback overlap with category folders, counts/progress update, progress reaches 12/12, Open Lab routes to Lab, no full-page/horizontal scrolling at 1366x768, and no console errors.
- `npm.cmd run build` passed; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the panel is deliberately compact to preserve one-screen play; a projector pass should still judge whether the longer wrong-attempt hints read comfortably from the back of the room.

2026-05-11 update:
- Completed the Full Investigation Curate Phase Layout + Readability Fix.
- Confirmed `src/components/MuseumPhase.jsx` controls Phase 4 / Museum / Curate, including the curation tray, curated exhibit slots, plaque textareas, final exhibition statement, Main Menu action, and Final Report routing.
- Restyled the Museum phase as a compact parchment curation desk with a lower-height phase header, clearer progress/action hierarchy, high-contrast text, and no full-page scrolling at the checked laptop viewport.
- Reworked the curation tray cards so evidence titles, post-classification categories, thumbnails, selected state, and add/remove controls are clearer while preserving the existing three-find curation rule.
- Added visible open exhibit slots, tightened curated display cards, improved lab-result/plaque readability, and kept the final exhibition statement/action available without creating a dark oversized panel.
- Browser checks confirmed app load, main menu, Full Investigation start, Museum phase reached after Lab documentation, evidence list readable, curation controls working, progress updating to 2/3, plaque text retained into the final report, Final Report routing, Main Menu routing, no horizontal/full-page vertical scroll at 1366x768, and no console errors. Screenshot saved at `scratch/museum-curate-polish.png`.
- `npm.cmd run build` passed with the existing large-chunk warning; `npm.cmd run lint` passed; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the exhibit cards use compact lab-result text to keep all three slots visible on a laptop/projector screen, so a projector pass should still judge whether the smaller lab-result snippets read clearly from the back of the room.

2026-05-11 update:
- Completed the first Full Investigation theme-balance pass focused on the Dig phase.
- Confirmed the Dig mismatch was mainly visual: the matching board, phase strip, status bar, and footer had become very pale compared with the darker archaeology/classified expedition theme.
- Rebalanced `src/index.css` Dig-only styling toward dark wood, excavation-table browns, aged parchment accents, bronze borders, and higher-contrast HUD text while preserving card grid sizing, matching logic, timer, scoring, Field Guide, and Back to Menu behavior.
- Browser checks confirmed Full Investigation Dig opens, all 24 cards remain visible, the instruction remains readable, there is no horizontal/full-page vertical scrolling at 1366x768, and no console errors. Screenshots saved at `scratch/dig-theme-before.png` and `scratch/dig-theme-balanced.png`.
- Remaining risk: this pass focuses on Dig first because it was the clearest mismatch; Sort/Lab/Museum may still benefit from a separate lighter-touch theme unification pass if the overall Full Investigation flow still feels too pale.

2026-05-11 update:
- Completed the Dig Phase Challenge + Minimum Evidence Guarantee pass.
- Confirmed `src/components/DigPhase.jsx` remains the canonical memory-match Dig component, with Full Investigation handoff managed in `src/App.jsx`.
- Added evidence condition tracking as metadata keyed by evidence id (`excellent`, `good`, `damaged`, `disturbed`) without changing the canonical evidence data or category answers.
- Added site disturbance pressure from mismatches and radar use, plus compact Dig UI indicators and a field debrief showing clean, damaged, disturbed, attempts, radar use, disturbance, and transferred evidence.
- Protected later phases by passing all active Dig evidence forward on completion or time-up, while marking unrecovered finds as field-team `disturbed` recoveries so Sort/Lab/Museum/Report still have enough evidence.
- Added neutral post-Dig condition labels in Sort and review condition metadata in Lab, Museum, and Report without reintroducing category-answer leaks on pending Sort cards.
- Browser checks confirmed app load, Full Investigation site mission launch, Dig setup/start, matching pairs, attempts, mismatch disturbance, radar disturbance, clean completion handoff with 12 evidence cards, incomplete timed challenge handoff with 12 transferred evidence cards and 10+ minimum evidence met, Sort pending evidence category neutrality, Lab/Museum/Report condition display, and no console errors in the checked flows.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning.
- Remaining risk: the challenge consequences are intentionally light so the classroom flow is never blocked; a real student playtest should judge whether the disturbance thresholds feel motivating enough.

2026-05-11 update:
- Added the Full Investigation UI asset atlas at `public/assets/full-investigation/shared/full-investigation-ui-pack.png` with named metadata in `public/assets/full-investigation/shared/full-investigation-ui-pack.json`.
- Added `src/components/full-investigation/fullInvestigationAssets.js` to load the Full Investigation PNG/JSON once, publish ready/error/fallback state, and expose named atlas regions for React/CSS use.
- Integrated the first safe visual slice only: Dig card backs and excavation tray, Sort pending evidence cards and category folder backgrounds, and Museum wall/display/plinth/plaque framing.
- Preserved existing real evidence photos by leaving `getEvidenceImagePath`, evidence image files, and all evidence photo paths untouched; the new atlas only frames UI containers.
- Preserved learning integrity by keeping Pending Evidence icons neutral and avoiding category-specific colours/icons/labels on unsorted cards; destination folders still show their category labels as required.
- Browser checks confirmed app load, Full Investigation launch, Dig card-back/tray atlas rendering, Dig matching/recovered count update, Sort atlas cards/folders, neutral pending-evidence cards with no category leak, Lab evidence photos still loading from existing museum paths, Museum atlas wall/display/plinth/plaque framing after curation, and no console errors in the checked flows.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: atlas region coordinates are approximate from the generated pack and should get one projector visual pass before expanding the atlas deeper into Lab/Report.

2026-05-11 update:
- Completed the Journey Asset Grounding + Scene Integration Pass for Lost Site Expedition.
- Confirmed the floating/pasted-on look came from clean atlas props, route gates, hazards, and non-ground platforms being drawn without enough contact shadow, dust overlap, depth tinting, or underside grounding against the desert scene.
- Added Journey asset grounding debug metadata via `render_game_to_text`, including `assetGroundingPassActive`, `groundedPropCount`, `backgroundPropTintActive`, `platformGroundingMode`, `propDrawOrderMode`, and `floatingAssetWarnings`.
- Grounded decorative story props with per-prop size/anchor tuning, warm/stone/cool scene tinting, lowered background alpha, soft contact shadows, and sand dust lips so columns, ruins, camps, doors, statues, bridges, lights, and banners read as embedded in the scene.
- Improved floating platform/ledge rendering with underside depth, top highlights, bottom shading, contact shadows, and sand overlap without changing platform collision boxes.
- Added base contact shadows and dust overlap to route gates, final gate/base-camp gateway visuals, and grounded hazard assets while keeping hazards, collectibles, and the player visually readable.
- Browser checks confirmed app load, Lost Site Expedition launch, Journey start, Desert Entry render, player visibility, environment assets loaded, grounding debug fields active, and no console errors. Screenshot saved at `scratch/journey-grounding-desert-entry.png`.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: the automated visual check focused on Desert Entry; Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance should still get a human/projector spot-check because their prop density and camera framing differ.

2026-05-11 update:
- Removed the student-facing Full Investigation phase skip buttons from the shared phase strip.
- Confirmed the skip-ahead controls were rendered in `src/App.jsx` as real buttons inside the Full Investigation phase strip, each calling `setPhase(...)` for Dig, Sort, Lab, Museum, and Report.
- Changed the strip into a read-only ordered progress indicator with `aria-current="step"` on the active phase, preserving the visible phase status without exposing clickable navigation.
- Updated `src/index.css` so the phase items behave like status labels rather than controls, with default cursor, no selectable text, and no hover affordance in the read-only strip.
- Static checks confirmed the old `setPhase(p.toLowerCase())`, `role="tablist"`, and `aria-selected` phase-jump wiring is no longer present in `src/App.jsx`.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: an automated browser click-through was attempted but the local browser process hung during the route check; the code path and build/lint/static checks confirm the visible phase strip no longer contains buttons.

2026-05-11 update:
- Added Dig Phase Environmental Emergency Events to `src/components/DigPhase.jsx`.
- Confirmed the canonical Dig systems remain in place: `activeArtifacts` still drive the evidence set, mismatches/radar still increase disturbance, evidence conditions are still tracked separately by evidence id, and the minimum evidence guarantee still transfers all active evidence forward.
- Added a warning/active/resolved/cooldown emergency cycle with themed events for Approaching Night, Sandstorm, Flash Flood, and Falling Debris.
- Added visible threat-zone cues on the board, including centre trench, lower trench, whole-site, and row-based emergency targets; cards remain clickable during warnings and impacts.
- Emergency impacts affect only a small number of unrecovered finds by increasing their pressure and emergency metadata; evidence is never removed and later phases still receive enough evidence.
- Explore mode uses slower, gentler emergencies; Emergency Rescue mode starts pressure sooner, cycles faster, and can affect more finds per impact while still preserving progression.
- Added compact emergency status UI, condition-impact feedback, debug fields through `render_game_to_text`, and debrief summary lines for emergencies faced and finds affected.
- Browser checks confirmed app load, site selection, Dig setup, Methodical Search start, periodic Sandstorm warning, visible centre-trench threat zone, zero phase-skip buttons in the read-only phase strip, no horizontal overflow, and no console errors. Screenshot saved at `scratch/dig-emergency-events-check.png`.
- Challenge-mode browser state confirmed Flash Flood impact, lower-trench threat resolution, two unrecovered finds marked as emergency affected, disturbance increase, evidence availability protected at 12/12, and `digMinimumEvidenceMet: true`; the script timed out after printing state, so the emitted state was used as evidence.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning.
- Remaining risk: automated checks verified warning and impact state, but a full student-style run through Sort/Lab/Museum/Report after an emergency-heavy Dig should still be played once to judge classroom pacing and wording.

2026-05-11 update:
- Completed the Lost Site Expedition small enemy sprite integration pass.
- Added the uploaded enemy sprite sheet at `public/assets/expedition/enemies/small-enemy-sprites.png` and named atlas metadata at `public/assets/expedition/enemies/small-enemy-sprites.json`.
- Added `src/components/expedition-journey/journeyEnemySprites.js` to load the sprite atlas once, expose ready/error/fallback state, map existing small enemy types to sprite families, and choose frames from existing combat state.
- Mapped existing small scarab enemies to Desert Scarab frames, existing snake enemies to Sand Snake frames, and existing bat enemies to Temple Bat frames; guardian, looter, statue, and all mini-bosses remain on the existing renderer.
- Preserved enemy gameplay behaviour: no enemy positions, health, damage, timing, attack logic, route gates, camera, player rendering, environment atlas, or Full Investigation systems were changed.
- Added sprite debug fields to Journey `render_game_to_text`, including `enemySpritesLoaded`, `enemySpriteFallbackActive`, `enemySpriteAtlasPath`, `visibleEnemySpriteFamilies`, and `enemySpriteFrameStates`.
- Browser checks confirmed app load, Lost Site Expedition launch, Journey start, enemy sprite sheet loaded, fallback inactive, visible scarab and snake sprite families, patrol/attack frame states, no console errors, and screenshot review at `scratch/journey-small-enemy-scarab-check.png`.
- Atlas/static checks confirmed all 21 named scarab/snake/bat regions are present. Bat mapping is implemented and loaded, but a live bat encounter was not reached because it sits past route gates in the Catacombs.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: atlas coordinates are approximate first-pass crops and Temple Bat should get a manual Catacombs/projector spot-check once the route is reached or a dedicated journey-position test hook exists.

2026-05-11 update:
- Completed the Scarab Queen boss sprite integration pass for Lost Site Expedition.
- Added the uploaded Scarab Queen sprite sheet at `public/assets/expedition/bosses/scarab-queen-sprites.png` and named atlas metadata at `public/assets/expedition/bosses/scarab-queen-sprites.json`.
- Added `src/components/expedition-journey/journeyBossSprites.js` to load the boss atlas once, expose ready/error/fallback state, map existing Scarab Queen boss states to sprite frames, and preserve fallback canvas rendering if the atlas fails.
- Integrated only the `scarab-queen` boss in `src/components/ExpeditionJourney.jsx`; Stone Guardian, Giant Serpent, Rival Looter Captain, Ancient Construct, small enemies, player rendering, environment assets, route gates, collision, health, damage, timing, and boss rhythm logic were left unchanged.
- Added boss sprite debug fields to Journey `render_game_to_text`, including `bossSpritesLoaded`, `bossSpriteFallbackActive`, `bossSpriteAtlasPath`, `activeBossSprite`, `activeBossSpriteFrame`, and `activeBossAnimationState`.
- Browser checks confirmed app load, Lost Site Expedition launch, Journey start, Scarab Queen atlas loaded, fallback inactive, Scarab Queen sprite rendering, windup frame, shielded frame, counter-window frame, existing player hit behavior reducing boss health from 2 to 1, and no console errors in the checked flows.
- Atlas/static checks confirmed all 11 named Scarab Queen regions are present.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: atlas coordinates and boss visual scale are approximate first-pass values; the defeated frame, full Desert Map Seal unlock, and Base Camp path should still get a complete manual boss-defeat playthrough.

2026-05-11 update:
- Completed a focused Journey side-scroller polish pass for Lost Site Expedition.
- Confirmed the canonical Journey renderer remains `src/components/ExpeditionJourney.jsx`, with environment rendering helpers in `src/components/expedition-journey/journeyRenderAssets.js`, small enemy sprite helpers in `journeyEnemySprites.js`, and Scarab Queen sprite helpers in `journeyBossSprites.js`.
- Preserved gameplay systems: no route gate requirements, player collision boxes, enemy/boss health, damage, attack timing, camera logic, evidence systems, Full Investigation phases, or Bureau systems were changed.
- Improved platform/ledge solidity with small visual underside supports on atlas-drawn floating platforms while keeping collision boxes unchanged.
- Improved hazard readability by replacing debug-like dashed fallback rectangles with softer rounded danger cues, adding atlas hazard warning outlines, and grounding non-flying hazards with subtle dust contact.
- Tuned small enemy and Scarab Queen sprite visual anchoring/scale so sprites sit closer to their hitbox baselines without changing hitboxes or combat behaviour.
- Tightened the Journey notice toast so route/objective messages no longer dominate the lower playfield during normal movement.
- Added polish/debug fields through Journey and `render_game_to_text`, including `journeyPolishPassActive`, `journeyPolishVersion`, `hazardReadabilityMode`, `enemyVisualMode`, `bossVisualMode`, and `assetFallbackActive`.
- Browser checks confirmed app load, Lost Site Expedition launch, Journey start, player visibility, grounded Desert Entry scene, compact objective notice, no visible console errors in the in-app browser, and the existing no-crash atlas/fallback rendering path.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: automated deep traversal across Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance timed out in the headless browser harness, so those later sections still need a manual/projector spot-check even though the shared renderer changes apply across sections.

2026-05-11 update:
- Completed the Stone Guardian boss sprite integration pass for Lost Site Expedition.
- Added the uploaded Stone Guardian sprite sheet at `public/assets/expedition/bosses/stone-guardian-sprites.png` and named atlas metadata at `public/assets/expedition/bosses/stone-guardian-sprites.json`.
- Extended the existing `src/components/expedition-journey/journeyBossSprites.js` helper into a multi-boss atlas loader so Scarab Queen and Stone Guardian share one fallback-safe boss sprite system.
- Mapped existing `temple-guardian` boss states to Stone Guardian frames: walk loop, awakening, windup, slam, shockwave, shielded, counter-window, hit, and defeated.
- Integrated only the Stone Guardian boss rendering in `src/components/ExpeditionJourney.jsx`; Giant Serpent, Rival Looter Captain, Ancient Construct, small enemies, player rendering, environment assets, route gates, collision, health, damage, timing, and boss rhythm logic were left unchanged.
- Added Stone Guardian debug fields to Journey `render_game_to_text`, including `stoneGuardianSpriteLoaded`, `stoneGuardianSpriteFrame`, and `stoneGuardianSpriteAtlasPath`.
- Browser checks confirmed app load, Lost Site Expedition launch, Journey start, Stone Guardian JSON/PNG fetch, 11 atlas regions, Stone Guardian sprite loader ready, boss sprite fallback inactive, Scarab Queen boss sprite system still loaded, and no console errors in the checked flow.
- Static frame checks confirmed Stone Guardian mappings for patrol, windup, slam, shockwave, shielded, counter-window, hit, and defeated.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning.
- Remaining risk: the automated browser check verified loading and mappings, but the Ruined Temple Stone Guardian encounter itself still needs a live/manual route playthrough because reaching the Temple Route Seal requires clearing earlier Journey objectives.

2026-05-11 update:
- Completed the Ancient Construct boss sprite integration pass for Lost Site Expedition.
- Added the uploaded Ancient Construct sprite sheet at `public/assets/expedition/bosses/ancient-construct-sprites.png` and named atlas metadata at `public/assets/expedition/bosses/ancient-construct-sprites.json`.
- Extended the existing multi-boss helper in `src/components/expedition-journey/journeyBossSprites.js` so Scarab Queen, Stone Guardian, and Ancient Construct share one fallback-safe boss sprite loader.
- Mapped existing `ancient-construct` boss states to Ancient Construct frames: walk loop, intro/activation, windup, slam, pulse, shielded, counter-window, hit, and defeated.
- Integrated only Ancient Construct rendering in `src/components/ExpeditionJourney.jsx`; Giant Serpent, Rival Looter Captain, small enemies, player rendering, environment assets, route gates, collision, health, damage, timing, and boss rhythm logic were left unchanged.
- Added Ancient Construct debug fields to Journey `render_game_to_text`, including `ancientConstructSpriteLoaded`, `ancientConstructSpriteFrame`, and `ancientConstructSpriteAtlasPath`.
- Browser checks confirmed app load, Lost Site Expedition launch, Journey start, Ancient Construct JSON/PNG fetch, 11 atlas regions, Ancient Construct sprite loader ready, boss sprite fallback inactive, earlier boss sprite packs still loaded, and no console errors in the checked flow.
- Static frame checks confirmed Ancient Construct mappings for patrol, windup, slam, pulse, shielded, counter-window, hit, and defeated.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning.
- Remaining risk: the automated browser check verified loading and mappings, but the Dig Site Entrance Ancient Construct encounter itself still needs a live/manual route playthrough because reaching the Base Camp Survey Seal requires clearing earlier Journey objectives.

2026-05-11 update:
- Integrated parallax background support for the remaining Journey sections: Catacombs, Escape Sequence, and Dig Site Entrance / Base Camp Approach.
- Added background assets and metadata at `public/assets/expedition/backgrounds/catacombs/`, `public/assets/expedition/backgrounds/escape-sequence/`, and `public/assets/expedition/backgrounds/dig-site-entrance/`.
- Extended the existing `src/components/expedition-journey/journeyBackgroundAssets.js` loader into a single multi-section background pack loader instead of creating a duplicate background system.
- Preserved the existing Desert Entry background path and the existing Ruined Temple drawn backdrop.
- Added section-specific parallax render layers in `src/components/ExpeditionJourney.jsx` with subtle atmosphere, far, distant, midground, and foreground layers that render behind gameplay.
- Replaced the temporary shared background copy with the three supplied section-specific/generated PNG sheets: Catacombs, Escape Sequence, and Dig Site Entrance / Base Camp Approach.
- Added `render_game_to_text` fields for Catacombs, Escape Sequence, and Dig Site Entrance background loaded/ready/fallback state.
- Browser checks confirmed app load, Lost Site Expedition launch, Journey start, Desert Entry parallax still active, Catacombs/Escape/Dig Site background JSON and PNG packs loading, all three new packs ready, fallback inactive, and no console errors.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Remaining risk: atlas coordinates are approximate first-pass crops and the later route-gated sections should still get a manual/projector spot-check once reached in a live playthrough.

2026-05-12 update:
- Completed the Combat Skill Windows + Enemy Pattern Pass for the Lost Site Expedition Journey stage.
- Preserved Journey layout, route gates, enemy/boss positions, health, damage values, sprite loading, parallax/background systems, Full Investigation, and Bureau systems.
- Added a small enemy attack-pattern table for scarab charge, snake lunge, bat swoop, guardian heavy slam, looter dash, and statue/construct pulse-slam rhythms.
- Normal enemies now get clearer wind-up, attack, recovery, and counter-window state, with compact `OPEN` feedback after attacks.
- Protected/rushed hits against active enemy attacks or protected boss phases no longer deal damage and show a compact `WAIT` cue plus a small recoil.
- Added gentle attack stamina pressure: normal attacks cost 1 stamina, missed/protected swings cost 1 extra, and successful hits refund the swing cost so careful play is not punished.
- Extended Journey state/debug output with `combatChallengeMode`, `playerAttackStaminaCost`, `lastAttackResult`, `shieldedHitFeedback`, `enemyCombatStates`, `activeEnemyCounterWindow`, `activeBossCounterWindow`, and `currentEnemyPattern`.
- Browser checks confirmed app load, Lost Site Expedition launch, Journey start, movement/attack, readable snake/scarab pattern telemetry, active counter-window telemetry, successful counter hit defeating a normal enemy, attack stamina/result fields, and no console errors in the checked flows.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risk: automated checks covered early Journey enemy rhythm and state telemetry; the route-gated mini-boss encounters still need a full manual playthrough for feel and classroom pacing.

2026-05-12 update:
- Integrated the Expedition excavation/map visual asset pack.
- Added `public/assets/expedition/excavation/excavation-map-ui-pack.png` and named atlas metadata at `public/assets/expedition/excavation/excavation-map-ui-pack.json`.
- Added fallback-safe excavation map asset loading in `src/components/expedition/expeditionMapAssets.js`, loading the JSON and PNG once and exposing loaded/ready/error/fallback state.
- Upgraded `src/components/ExpeditionMode.jsx` map visuals with asset-backed terrain for Riverbank, Burial Area, Archive Corner, Market Area, Ruined Wall, and neutral/Exit Gate spaces.
- Improved the archaeological grid feel with subtle parchment/grid texture, survey strings, pegs, survey flags, field-label styling, selected-zone highlight, and completed-survey markers.
- Replaced flat hazard markers with sandstorm, dust cloud, falling rocks, unstable floor crack, caution marker, and Tomb Guardian Shadow asset rendering while preserving existing hazard hitboxes and penalties.
- Replaced the Exit Gate drawing with sealed/unlocked gate assets plus a locked seal marker while preserving existing unlock and gate interaction logic.
- Added an asset-backed player marker with location ring, portrait marker, and shadow overlay while preserving player movement and collision logic.
- Added excavation visual debug fields to `render_game_to_text`: `excavationMapAssetsLoaded`, `excavationMapAssetsReady`, `excavationMapFallbackActive`, `excavationVisualMode`, `activeSurveyZone`, `revealedZone`, and `exitGateVisualState`.
- Preserved existing survey logic, grid logic, evidence reveal gating, mission requirements, inventory/satchel logic, final claim logic, Journey gameplay, ExpeditionJourney, Full Investigation phases, and Antiquities Bureau.
- Browser checks confirmed app load, Lost Site Expedition launch, dev path to Excavation, asset pack loaded/ready with fallback inactive, new zone/hazard/gate/player visuals visible, survey report opened, Mark as Dig Zone worked, grid setup opened, Open Grid Square worked, evidence reveal gating still hid unopened evidence, and no console errors in checked flows.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning.
- Remaining risks: atlas coordinates are approximate first-pass crops and need projector-scale tuning; a full three-evidence final-claim playthrough was not completed because the automated grid-modal run hit a viewport interaction limit, though the verified checkpoints did not change final-claim logic.

## Journey Combat Overlay Cleanup - 2026-05-12
- Removed debug-like colored hazard outline boxes while preserving hazard art, warning icons, hit feedback, and hitboxes.
- Replaced enemy/boss circular combat rings with compact ground/opening cues and small warning badges.
- Removed the always-on enemy aura circle so enemies sit naturally on contact shadows instead.
- Remaining risk: sprite range of motion may still benefit from future dedicated attack/recovery frames, but this pass fixes the artificial overlay issue first.
- Targeted Journey lint (`npx.cmd eslint src/components/ExpeditionJourney.jsx`) passed.
- Production build (`npm.cmd run build`) passed with the existing large-chunk warning.
- Full project lint was initially blocked by pre-existing unused ExpeditionMode map-zone bindings, but a later full lint run passed after the current tree settled.
- Browser smoke check opened Lost Site Expedition Journey, confirmed no console errors, and the captured boss/enemy scene no longer shows the large circular attack ring or always-on enemy aura.

## Journey Hazard Grounding Follow-up - 2026-05-12
- Reworked hazard rendering so hazards are treated as embedded world elements instead of added props.
- Added per-hazard grounding/tint settings for thorn bushes, soft sand, traps, rocks, gaps, dust, bat clouds, and loose slopes.
- Removed always-on hazard warning markers; hazards now rely on the object art, contact shadow, terrain apron, and near-player label only.
- Added a sand/stone apron over hazard bases so the ground visually swallows the hazard edge without changing hitboxes or penalties.
- Targeted Journey lint passed, production build passed, and browser smoke confirmed the first hazard area renders without console errors.
- Remaining risk: some later-section hazards still need projector-scale spot-checks, but the rendering path now supports the same grounding treatment across sections.

## Journey Decorative Asset Grounding + Depth-Layer Pass - 2026-05-12
- Completed a decorative prop grounding pass for Lost Site Expedition Journey.
- Reworked the shared story-prop rendering path so decorative columns, jars/camp props, ruins, doors, statues, murals, glyphs, lights, and banners are split into background and midground depth passes.
- Tuned decorative prop scale, opacity, y anchoring, warm dust tint, soft contact shadows, and sand/base overlap so props sit in the world instead of reading as pasted-on foreground objects.
- Desert Entry distant ruins/columns and pottery/camp props now render lower, smaller, dustier, and behind the playable path while platforms, hazards, pickups, enemies, bosses, player, route gates, and HUD remain in the gameplay layer.
- Added render-state fields for `decorativePropLayerMode` and `propDepthTuningVersion` while preserving existing `assetGroundingPassActive`, `groundedPropCount`, and fallback telemetry.
- Gameplay/collision systems were preserved: no player physics, collision boxes, hazard values, route gate requirements, enemy/boss logic, camera logic, excavation, Full Investigation, or Bureau systems were changed.
- Browser smoke confirmed app load, Lost Site Expedition launch, Journey start, Desert Entry decorative props grounded behind gameplay, no pickup overlap in the checked frame, no console errors, and new decorative depth telemetry active.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning and public excavation asset URL notices; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risk: later-section decorative props share the same grounded rendering path, but a full route-gated live playthrough through Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance is still recommended for projector-scale tuning.

2026-05-12 update:
- Egypt excavation room-based map Stage 1 completed.
- Added the room-entry challenge framework before surveying and six short zone challenges for Riverbank, Burial Area, Archive Corner, Market Area, Ruined Wall, and Exit Gate.
- Integrated the Egypt room map, challenge UI, survey marker, and gateway asset packs with named atlas metadata under `public/assets/expedition/excavation/`.
- Expanded the excavation map into connected room-style zones while preserving the existing zone positions, survey reports, grid square reveal rules, mission requirement, evidence data, inventory/satchel flow, final claim logic, Journey, Full Investigation, and Bureau systems.
- Surveying is now gated by a completed room-entry challenge for that selected zone; incorrect answers give retry feedback and correct answers unlock the existing survey flow without changing survey costs.
- Updated excavation debug output with asset-ready/fallback, expanded-map, selected/entered zone, active challenge, completed challenge, survey-gating, active survey zone, revealed zone, and Exit Gate visual state fields.
- Browser checks confirmed app load, Lost Site Expedition launch, dev path to Excavation, asset packs loaded/ready with fallback inactive, room map displayed, player marker rendered, zone preview shown, challenge retry/success flow, survey unlock after challenge, survey report, Mark as Dig Zone, grid reveal gating, Ruined Wall structural evidence reveal, locked Exit Gate visual state, asset requests, and no console errors.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risks: atlas coordinates are approximate first-pass crops and need projector-scale tuning; the unlocked Exit Gate and final claim/result flow were not fully replayed end-to-end in the browser because collecting all three structural evidence items still requires the longer excavation/classification sequence, but this pass did not change that logic.

2026-05-12 update:
- Egypt Excavation Map Regression + Visual Tuning Pass completed.
- Tuned the room layout, preview click behaviour, map scale, marker hierarchy, challenge UI, hazard visibility, and sealed/unlocked gate visuals so the excavation stage fits a normal laptop/projector viewport without horizontal page scrolling.
- Preserved the existing survey/evidence/mission flow: room challenge retry/success, survey unlock, survey report, Keep Surveying, Mark as Dig Zone, grid-square reveal gating, Ruined Wall structural mission evidence, Exit Gate unlock, final claim, and result flow all remained on the existing `ExpeditionMode.jsx` path.
- Browser checks confirmed all six rooms could be selected, the preview panel no longer blocks map selection, map assets loaded with fallback inactive, player marker remained visible, hazards stayed aligned, the Ruined Wall three-evidence path unlocked the Exit Gate, and the final claim/result modal completed successfully with no console errors.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risks: atlas crops remain approximate and should still get a projector-scale human spot-check; satchel capacity was browser-verified by filling the three-item satchel, but the replacement choice panel was not forced in this polish run because its logic was not changed.

2026-05-12 update:
- Full classroom-style Expedition playthrough audit started from Main Menu through Journey and Egypt Excavation using production preview plus `render_game_to_text` checkpoints.
- Journey route-gated sections checked through Desert Entry, Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance screenshots. Scarab Queen, Stone Guardian, Giant Serpent, Rival Looter Captain, and Ancient Construct encounters were reached; Scarab Queen, Stone Guardian, Giant Serpent, and Rival Looter Captain were defeated in the browser run.
- Route gate checks confirmed Desert Map Seal, Temple Route Seal, Catacomb Route Seal, and Escape Route Seal could reach ready/open states during the automated classroom pass.
- Ancient Construct was reached and reduced to 1 health in the browser route, but the run timed out before confirming Base Camp Survey Seal, Base Camp, and Journey-to-excavation transition from the full route.
- Egypt excavation room map checked via the existing Expedition dev path: room map loaded, Riverbank zone challenge displayed, Ruined Wall survey report displayed, Mark as Dig Zone opened grid setup, Ruined Wall A1 reveal worked, and evidence inspection/collection opened correctly.
- Screenshots saved under `scratch/full-expedition-classroom-playthrough/` for Journey start, route gates, section views, boss encounters, Egypt room map, zone challenge, survey report, grid reveal, and evidence inspection.
- Remaining risks: complete Ancient Construct defeat/Base Camp transition still needs a live follow-up; the full satchel replacement panel was not completed in this run because the longer excavation automation timed out after the first Ruined Wall collection checkpoint; final claim/result should be rechecked after that follow-up even though it passed in the previous excavation regression pass.

2026-05-12 update:
- Expedition blocker regression completed for Ancient Construct completion, Base Camp transition, Begin Excavation, satchel replacement, and final claim/result.
- Ancient Construct final defeat was confirmed from the low-health blocker state: a normal attack reduced it from 1 health to defeated, recorded `ancient-construct` in `defeatedMiniBosses`, completed the Dig Site Entrance objective, and removed the final route gate blocker.
- Base Camp Survey Seal / Base Camp transition was confirmed: after Ancient Construct defeat, the player could proceed past the final seal, reach the site entrance, and land on the Base Camp screen with Begin Excavation visible.
- Begin Excavation opened the Egypt room-based excavation map with assets loaded and fallback inactive.
- Satchel replacement panel was confirmed with a forced full satchel: current satchel items, pending evidence, mission warning, Review Mission, Replace an item, replacement picker, and Leave new evidence all worked and returned cleanly.
- Final claim/result was rechecked with the required three structural evidence items: Exit Gate unlocked, Final Claim accepted Ancient Egypt with supporting structural evidence, Run Result opened, Play Again reset to Journey, and Back to Menu returned to the main menu.
- Visual/readability fix made: the Expedition inspection/result modal now has an explicit viewport-height cap and internal scrolling, with a more compact satchel decision layout for normal laptop/projector height.
- `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices.
- Remaining risks: the blocker states were set up with the existing browser/React test harness to avoid another full long route; a later human playtest should still do one natural no-shortcut route for feel, but the previously blocking state transitions now have direct confirmation.

2026-05-12 update:
- Egypt Base Camp / Dig Site Entrance parallax background integrated from a clean cropped atlas that removes the visible labels from the supplied preview sheet.
- Dig Site Entrance now uses the Base Camp sky, far background, mid background, near camp, and subtle foreground layers through the existing Journey background loader.
- Existing Journey gameplay preserved: no collision boxes, hazards, enemies, boss logic, route gate requirements, player rendering, collectible logic, excavation, Full Investigation, or Bureau systems were intentionally changed for this pass.
- Browser checks confirmed app load, Lost Site Expedition launch, Journey start, Dig Site Entrance using the new Base Camp background with assets loaded/ready and fallback inactive, Ancient Construct visible in the checked state, Base Camp accessible through the existing dev path, Begin Excavation opening the Egypt excavation map, movement/jump/attack still responding, and no console errors in the checked flow.
- `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices; `npm.cmd run lint` passed; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risks: atlas crops are approximate first-pass cuts from the supplied labelled preview and should still get a projector-scale human spot-check for parallax balance around the final seal and Ancient Construct.

2026-05-12 update:
- Confirmed the old Journey background assets were not removed; the original Desert Entry, Catacombs, Escape Sequence, and Dig Site Entrance parallax packs remain on disk.
- Identified Ruined Temple as the missing-background case: it has no dedicated parallax pack and was relying on the canvas fallback backdrop.
- Polished the Ruined Temple fallback backdrop with warmer temple wall gradients, darker ceiling depth, columns, stone insets, torch glows, and a grounded lower wall silhouette.
- Tightened Desert Entry background rendering so the desert parallax pack no longer bleeds into the Ruined Temple checkpoint area and masks the temple-specific backdrop.
- Existing Journey gameplay preserved: no collisions, hazards, enemies, boss logic, route gate requirements, movement, attack logic, collectibles, excavation, Full Investigation, or Bureau logic were intentionally changed.
- Browser spot-check captured `scratch/base-camp-background-verification/16-ruined-temple-polish-final.png`; Ruined Temple now reports canvas fallback for that section with no console errors in the checked state.
- `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices; `npm.cmd run lint` passed; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risks: Ruined Temple still needs a proper dedicated parallax asset pack in a future pass if we want it to fully match Desert Entry, Catacombs, Escape Sequence, and Base Camp quality.

2026-05-12 update:
- Journey Collectibles + Field Kit Sprite Pack integrated into Lost Site Expedition Journey.
- Added a fallback-safe collectible sprite loader and named atlas metadata under `public/assets/expedition/collectibles/`.
- Tools, relic shards, upgrades, and objective collectibles now use sprite assets while preserving pickup/effect/progression logic.
- Browser checks confirmed Journey loads, sprite fallback is inactive, early tools/shards/objectives render with atlas art, Brush/Trowel pickup still updates the Journey field kit, Base Camp opens, Begin Excavation enters the Egypt map, and no console errors appeared.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risk: collectible atlas coordinates are approximate first-pass crops and should still get a projector-scale tuning pass.

2026-05-12 update:
- Player weapon visual upgraded in Lost Site Expedition Journey.
- Added the provided khopesh weapon sheet as a transparent runtime atlas under `public/assets/expedition/player/`.
- Added a fallback-safe player weapon sprite loader and render-state fields for weapon load/fallback/frame/visual mode.
- Replaced the player character's simple yellow hand-tool line with the khopesh sprite in the existing player render path; the old line remains as the fallback if the weapon atlas fails.
- Preserved existing combat behaviour: attack timing, stamina cost, hitboxes, enemy/boss logic, movement, physics, route gates, Base Camp, excavation, Full Investigation, and Bureau code paths were not changed.
- Browser check confirmed Journey loads, the weapon atlas loads with fallback inactive, the khopesh is visible on the player, and no console errors appeared.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risk: the generated transparent weapon atlas uses approximate background removal/crops from the parchment sheet, so a human projector-scale spot check may want small scale/position tuning.

2026-05-12 update:
- Journey collectible sprite visual tuning completed.
- Relic shards were reduced to small fragment pickups with lower glow, tighter rings, smaller sparkles, and less visual priority than hazards/enemies/player.
- Field tool pickups, upgrades, and objective markers now use separate scale groups with softer contact shadows, smaller glow rings, and reduced hover movement.
- The player-held khopesh was pulled closer to the hand/body and made smaller/subtler at idle while preserving the existing attack hitbox and timing.
- Added render-state tuning fields: `collectibleScaleTuningVersion`, `relicShardScale`, `fieldToolScale`, `upgradeScale`, `objectiveMarkerScale`, `loreTabletScale`, `pickupGlowScale`, and viewport-based `visibleCollectibleCount`.
- Existing pickup and progression logic was preserved: tool pickup, shard pickup, upgrade pickup, objective progress, route-gate status, Base Camp, and Begin Excavation checks remained on the existing Journey/Expedition paths.
- Browser checks confirmed app load, Lost Site Expedition launch, Journey start, smaller readable Brush/Trowel/shards/upgrades/objective sprites, hazard/enemy/player readability, tool/shard/upgrade/objective pickup state updates, Base Camp opening, Begin Excavation entering the Egypt map, and no console errors.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risk: a full natural route-gate playthrough was not rerun for this visual-only pass because no route-gate/gameplay logic changed; a human projector-scale pass may still want tiny per-item crop/offset tuning.

2026-05-12 update:
- Removed the oversized yellow guidance circle from relic shard targets in Journey so gems read as small collectible fragments instead of large marked objectives.
- Kept shard collection positions, counts, route requirements, and pickup logic unchanged; only the visual marker/ring layer was suppressed.
- Added platform-aware shard visual basing so gems that belong on platforms render above the platform surface instead of visually centring through the brick ledge.
- Build/lint result: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risk: this was verified as a visual-only Journey pass; a classroom projector check may still want tiny atlas crop/offset tweaks.

2026-05-12 update:
- Added a Lost Site Expedition Stage Select screen after the main menu launch.
- Egypt remains the only playable expedition and now routes through the new stage selector into the existing Journey -> Base Camp -> excavation -> final claim flow without changing the Egypt internals.
- Added the campaign/stage config scaffold in `src/components/expedition/expeditionStages.js`, including four stage cards: Ancient Egypt, Ancient China, Ancient Rome, and Lake Mungo / Ancient Australia.
- Added an Ancient China scaffold as preview-only with placeholders for the future China Journey stage, side-scroller background/art references, environment tile pack, top-down excavation room map, zone challenge UI, survey markers/gateways, enemies/guardian sprites, evidence set, and final claim.
- Rome and Lake Mungo / Ancient Australia cards were added as coming-soon preview cards only; no unfinished gameplay is launched from those cards.
- Browser verification on `http://127.0.0.1:5184/Archaeology-Dig-App/` confirmed main menu -> Lost Site Expedition -> Stage Select, all four cards render, Ancient Egypt launches the existing Journey with `Find Structural Evidence`, China/Rome/Lake Mungo previews open and return with Back, and no console errors appeared.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning plus runtime-resolved public CSS image URL notices; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risk: China is intentionally not playable yet; future work still needs real China data/assets wired into the existing Journey, excavation, evidence, challenge, and final-claim systems.

2026-05-12 update:
- Polished the new Lost Site Expedition Stage Select menu to better match the project's professional dossier UI.
- Tightened the Stage Select shell width, header height, card spacing, card shadows, status labels, body typography, button sizing, and responsive layout.
- Shortened card teaser copy so preview cards no longer rely on clipped ellipsis text, while keeping the full required Ancient China learning teaser in the preview modal.
- Fixed the preview modal's inherited Bureau label/button styling so it now reads as `EXPEDITION PREVIEW` and uses warm dossier controls.
- Browser verification on `http://127.0.0.1:5185/Archaeology-Dig-App/` confirmed desktop Stage Select, mobile Stage Select, Ancient China preview, Ancient Egypt launch into Journey, no horizontal overflow, and no console errors.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning plus runtime-resolved public CSS image URL notices; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risk: final visual judgement is still subjective, but the menu now has constrained width, tighter hierarchy, and cleaner responsive behaviour.

2026-05-12 update:
- Added generated character cutout assets for the future Ancient China, Ancient Rome, and Lake Mungo / Ancient Australia expeditions.
- Stored the final transparent menu assets under `public/assets/expedition/stage-characters/`.
- Added the three future-expedition characters to the Choose an Expedition header as a compact field-team vignette next to the existing Campaign Map badge.
- Kept the assets presentation-only for now: no China/Rome/Australia gameplay sprite loading or unfinished level flow was enabled.
- Browser verification on `http://127.0.0.1:5187/Archaeology-Dig-App/` confirmed the Stage Select header images load on desktop and mobile, no horizontal overflow appears, the Ancient China preview still opens and returns with Back, Ancient Egypt still launches the existing Journey with `Find Structural Evidence`, and no console errors appeared.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning plus runtime-resolved public CSS image URL notices; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risk: the generated character art is a first-pass visual set and may need style retuning if the later China/Rome/Australia level sprites require animation sheets rather than static menu cutouts.

2026-05-12 update:
- Added `docs/china-asset-pipeline.md` to document the Ancient China asset pipeline before any playable China work begins.
- Audited the existing Egypt/Journey/Excavation asset packs, atlas paths, image paths, region keys, and canonical loader/import locations.
- Defined the required China asset packs, exact proposed filenames/folders, transparency requirements, expected atlas region names, matching Egypt structures, future integration points, and ready-to-copy external image generator prompts.
- Confirmed this is documentation-only: no gameplay files were wired to missing China assets, no broken imports were added, Egypt gameplay was not changed, and Stage Select behaviour remains unchanged.
- `npm.cmd run build` passed with the existing large-chunk warning plus runtime-resolved public CSS image URL notices; `npm.cmd run lint` passed; `git diff --check` passed with only the repo's LF-to-CRLF warnings.

2026-05-12 update:
- Replaced the Egypt Desert Entry parallax background sheet with an upgraded generated five-band atlas at `public/assets/expedition/backgrounds/desert-entry/desert-entry-parallax-pack.png`.
- Updated `desert-entry-parallax-pack.json` to match the new image dimensions and band crop regions for `sky`, `farDunes`, `distantRuins`, `midgroundRuins`, and `foregroundAtmosphere`.
- Existing Journey background loading was preserved: no duplicate background loader was added and no gameplay, collision, enemy, route-gate, Stage Select, or excavation behaviour was intentionally changed.
- Browser verification on `http://127.0.0.1:5188/Archaeology-Dig-App/` confirmed Ancient Egypt launches into Journey, the Desert Entry parallax background loads with ready true, fallback false, missing assets empty, and no console errors.
- `npm.cmd run build` passed with the existing large-chunk warning plus runtime-resolved public CSS image URL notices; `npm.cmd run lint` passed; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risk: this is a first-pass generated art replacement, so a human projector-scale review may still want small crop or colour-balance tuning.

2026-05-12 update:
- Upgraded the Egypt Journey player character sprite sheet at `public/sprites/archaeologist-walk-cycle.png` with a higher-quality generated four-frame walk cycle while preserving the existing 1560x560 runtime format.
- Upgraded the carried khopesh weapon atlas at `public/assets/expedition/player/khopesh-weapon-pack.png` and retuned `khopesh-weapon-pack.json` region crops for `khopeshIdle`, `khopeshWindup`, `khopeshSwing`, and `khopeshReady`.
- Existing player rendering and combat logic were preserved: no animation system rewrite, hitbox change, movement change, attack timing change, route-gate change, Stage Select change, or excavation change was intentionally made.
- Browser verification on `http://127.0.0.1:5189/Archaeology-Dig-App/` confirmed Ancient Egypt launches into Journey, the player sprite loads, the weapon atlas loads with fallback inactive, idle/walk/attack frames render, missing weapon assets are empty, and no console errors appeared.
- `npm.cmd run build` passed with the existing large-chunk warning plus runtime-resolved public CSS image URL notices; `npm.cmd run lint` passed; `git diff --check` passed with only the repo's LF-to-CRLF warnings.
- Remaining risk: generated animation quality is much stronger visually, but a human play feel pass may still want tiny weapon alignment or frame-pose tuning.

2026-05-12 update:
- Integrated `First_Light_Over_Stone.mp3` into the existing Lost Site Expedition / Ancient Egypt Journey audio path.
- Stored the track at `public/assets/expedition/audio/first-light-over-stone.mp3` and added expedition music start/stop controls to the existing `audioControls` object in `src/App.jsx`.
- Ancient Egypt Stage Select now starts the looping music from the same user click that launches the playable side-scroller, and Back to Menu stops/resets the track.
- No duplicate audio system or separate game mode was added; existing Journey, Base Camp, excavation, and sound-effect hooks were preserved.
- Verification: `npm.cmd run lint` passed, `npm.cmd run build` passed with existing warnings, `git diff --check` passed with only LF-to-CRLF warnings, and Playwright confirmed the MP3 request, successful `play()`, Journey render state, Back to Menu pause/reset, and screenshot `scratch/music-integration-journey.png`.

2026-05-13 update:
- Copied the completed Egypt audio tracks from `C:\Users\dmahe\OneDrive\Desktop\Archaeology-Dig-App\public\assets\expedition\Audio` into this app at `public/assets/expedition/audio/` with clean filenames.
- Added a small Expedition soundtrack map in `src/App.jsx` for desert, temple, catacombs, escape, base camp, boss, evidence discovery, and gate unlock audio.
- Extended the existing `audioControls` path so Journey can switch music by section, use boss ambience while a nearby mini-boss is active, play Base Camp music after the Journey is completed, and trigger stingers for evidence/objective discoveries and route-gate unlocks.
- Browser audio decoding showed the two stinger-named files are full-length tracks rather than short effects, so their playback is capped to a few seconds to avoid long overlapping audio.
- Kept the implementation inside the existing Expedition/Journey audio flow; no duplicate game mode or parallel audio system was added.
- Verification: `npm.cmd run lint` passed, `npm.cmd run build` passed with existing large-chunk/runtime asset warnings, `git diff --check` passed with only LF-to-CRLF warnings, and Playwright confirmed the desert and Base Camp tracks were requested/played plus every copied audio file returned HTTP 200.

2026-05-12 update:
- Completed a Journey visual polish pass in the existing Lost Site Expedition renderer.
- Replaced the Catacombs and Escape Sequence parallax background sheets with upgraded label-free generated PNGs and updated their atlas crop JSON.
- Retuned route-gate drawing so gates sit on the ground plane with shadows/dust blending instead of floating above the scene.
- Removed world-space labels from hazards, enemies, mini-boss names, missing-objective arrows, and combat/status arcs while preserving HUD/sidebar guidance.
- Added a subtle section-boundary ground blend to soften area transitions without changing platform collision or route-gate logic.
- Wired linked enemy sprites into the existing enemy draw path: guardian/statue enemies reuse the boss sprite packs, looters reuse the player sprite with a darker treatment, and scarab/snake/bat continue using the small-enemy atlas.
- Retuned defeated enemy sprite grounding so defeated sprites/remains stay on the ground and no longer disappear, float, or flash unintentionally.
- Gameplay behaviour was intentionally preserved: player movement, collision, attacks, enemy/boss logic, hazards, gates, objectives, Base Camp, excavation, Stage Select, and Egypt progression remain on the existing code paths.
- Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices; `git diff --check` passed with only LF-to-CRLF warnings.
- Browser verification on `http://127.0.0.1:5191/Archaeology-Dig-App/` confirmed Stage Select -> Ancient Egypt -> Journey, desert background/environment/enemy/boss assets loaded, gate/hazard atlas modes active, no missing environment assets, no console errors, no enemy/hazard labels in the world layer, the first route gate appears grounded, and a defeated snake renders with the grounded `snakeDefeated` frame.
- Remaining risk: this pass verified the opening route, first gate area, enemy combat/death state, and upgraded background assets; a full natural all-route playthrough was not completed because it would require beating every gate/boss objective again.

2026-05-13 update:
- Enlarged the Lost Site Expedition Journey play area by moving the native side-scroller canvas from the old 900x420 ultra-wide baseline to a standard 16:9 960x540 baseline.
- Kept the existing ExpeditionJourney renderer, Journey level data, gates, hazards, enemies, controls, Base Camp, excavation, Stage Select, and Egypt progression on the canonical code path.
- Updated Journey CSS so the canvas preserves its 16:9 aspect ratio while using the available viewport width beside the expedition log/sidebar.
- Shifted the authored Journey level object y-coordinates down with a shared vertical offset so platforms, gates, hazards, enemies, shards, markers, and objectives stay aligned with the taller 540px canvas.
- Retuned the Journey background layer placement for the taller 16:9 frame so the Desert Entry, Catacombs, Escape Sequence, and Dig Site Entrance scenes fill the new playable area cleanly.
- Browser verification on `http://127.0.0.1:5192/Archaeology-Dig-App/` confirmed the canvas now renders as a 960x540 native surface and displays at about 923x519 in a 1232x798 viewport, with the player grounded, route-gate area visible, enemy sprites active, environment assets loaded, and no console errors captured.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices; `git diff --check` passed with only LF-to-CRLF warnings.
- Remaining risk: 960x540 was chosen as the safest first industry-standard 16:9 baseline because it preserves the existing hand-authored level scale; a later 1280x720 pass would be possible but should include a broader camera, sidebar, art-scale, and projector-layout review.

2026-05-13 update:
- Completed a Journey layout foundation refactor as preparation for a future 1280x720 pass, without intentionally changing gameplay or visual feel.
- Added `src/components/expedition-journey/journeyLayout.js` as the canonical home for viewport, world-layout, camera, HUD safe-area, visibility, canvas-scale, and ground-placement helpers.
- Centralised the current 960x540 viewport assumptions, 16:9 aspect ratio, ground position, camera follow/boss-intro anchor ratios, camera smoothing/max-step values, and HUD safe-area assumptions.
- Updated `ExpeditionJourney.jsx` to use the new helpers for camera target calculation, camera clamping, canvas attributes, horizontal visibility checks, route-gate ground placement, rescue fall bounds, and structured debug state.
- Added lightweight Journey debug output for `viewport`, `worldLayout`, `cameraLayout`, `hudSafeArea`, `canvasScaleState`, `cameraBounds`, `playerGroundedState`, and route-gate `gateGroundedState`.
- Intentionally did not change movement physics, collision, jump feel, enemy AI, combat timing, route-gate requirements, shard requirements, boss flow, Egypt progression, Stage Select, Base Camp, excavation, or final claim logic.
- Browser verification on `http://127.0.0.1:5193/Archaeology-Dig-App/` confirmed Main Menu -> Stage Select -> Ancient Egypt -> Journey, native 960x540 canvas with preserved 16:9 display scaling, player foot aligned to ground, no missing Journey assets, no console errors, movement into Ruined Temple, hazard/enemy interaction, defeated snake state, and Base Camp dev-transition render.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices.
- Remaining risk before 1280x720: this refactor centralises the most important layout assumptions, but a true 1280x720 upgrade still needs a dedicated camera composition, sidebar/projector layout, background art placement, and authored-object review.

2026-05-13 update:
- Completed the first 1280x720 Journey render-target pass using a safe virtual-resolution approach.
- Added `CANVAS_NATIVE_WIDTH = 1280` and `CANVAS_NATIVE_HEIGHT = 720` while preserving the existing 960x540 virtual gameplay viewport, authored coordinates, ground line, camera feel, collision boxes, movement physics, route gates, hazards, enemies, bosses, Stage Select, Base Camp, excavation, and final-claim flow.
- Extended `journeyLayout.js` with `JOURNEY_RENDER_TARGET`, including the 1280x720 native target, 960x540 virtual viewport, 1.333 native scaling, and render-profile debug metadata.
- Updated `ExpeditionJourney.jsx` so the canvas element now allocates a 1280x720 native surface and the renderer scales the existing 960x540 virtual game world into that native surface before drawing.
- Added render-state reporting for `renderTarget` and expanded `canvasScaleState` so browser checks can confirm native size, virtual size, display size, aspect preservation, and native scale.
- Browser verification on `http://127.0.0.1:5194/Archaeology-Dig-App/` confirmed Main Menu -> Stage Select -> Ancient Egypt -> Journey, canvas attributes are now 1280x720, displayed aspect ratio remains 16:9, the player remains grounded on the expected 960x540 virtual ground line, Journey assets are loaded with no missing-asset report, no console errors appeared, and the Base Camp dev-transition still renders with Begin Excavation available.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices.
- Remaining risk: this pass intentionally improves native rendering resolution without rescaling the gameplay world; a later composition pass can decide whether to expose more world at once, reduce the sidebar further, or create a fullscreen/projector presentation mode.

2026-05-13 update:
- Completed a Journey screen-space polish pass to make the visible world larger and reduce dead space around the side-scroller.
- Expanded the virtual Journey viewport to 1120x630 while keeping the native render target at 1280x720, preserving a clean 16:9 scale path.
- Moved the Journey ground line down to the bottom of the playable viewport and shifted authored Journey placements with the existing shared offset so platforms, gates, hazards, enemies, pickups, markers and the player remain grounded.
- Slimmed the Expedition Journey sidebar and tightened Journey panel spacing so more horizontal room is available for the canvas.
- Removed the persistent bottom movement-instruction strip from the play area; the start-of-run briefing still provides mission instructions.
- Moved the controls help into a compact toggle inside the Journey sidebar, so controls are available without taking canvas space.
- Removed the always-visible Expedition dev-mode strip from Journey/Base Camp/Excavation screens and added Journey, Base Camp and Excavation jump buttons to the existing Dev Panel instead.
- Browser verification on `http://127.0.0.1:5195/Archaeology-Dig-App/` confirmed Main Menu -> Stage Select -> Ancient Egypt -> Journey, briefing dismissal, 1280x720 canvas attributes, larger displayed canvas, player grounded at the new bottom-aligned ground line, sidebar controls toggle working, no bottom controls strip, no initial bottom mission notice, no missing Journey environment assets, no active asset fallback, no console errors, and Dev Panel Expedition buttons visible with Base Camp jump reaching the real Base Camp screen.
- `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing large-chunk warning and runtime-resolved public CSS image URL notices; `git diff --check` passed with only LF-to-CRLF warnings.
- Remaining risk: the canvas now uses the available width much better, but a fixed 16:9 canvas beside a visible sidebar cannot also fill all vertical screen height on every monitor; a true edge-to-edge presentation mode would require either a collapsible/overlay sidebar or a dedicated fullscreen layout.

2026-05-13 update:
- Completed a Journey background coverage audit and fixed the remaining missing implemented background pack.
- Confirmed the canonical Journey background path is `journeyBackgroundAssets.js` loading section atlas packs into `ExpeditionJourney.jsx`; no duplicate background system was added.
- Added the missing Ruined Temple parallax background pack under `public/assets/expedition/backgrounds/ruined-temple/` with atlas regions for temple sky, far walls, distant ruins, midground doors, and foreground dust.
- Wired `ruined-temple` into `SECTION_BACKGROUND_PACKS`, `SECTION_PARALLAX_LAYERS`, Journey render-state reporting, and fallback detection.
- Confirmed all five Journey sections now have implemented atlas-backed background packs: Desert Entry, Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance.
- Browser verification on `http://127.0.0.1:5196/Archaeology-Dig-App/` confirmed all five background packs load and report ready, no background fallback is active, all background requests returned successfully, and no console errors appeared.
- Static coverage check confirmed every `SECTIONS` id has a matching `SECTION_BACKGROUND_PACKS` entry and there are no extra background packs outside the Journey section list.
- `npm.cmd run lint` passed.
- Remaining risk: the Ruined Temple background is a procedural first-pass atlas and may deserve a generated-art replacement later for higher visual quality, but it is now implemented through the same runtime pipeline as the other sections.

2026-05-13 update:
- Wired the new high-quality Ruined Temple background image into the existing Journey section-background atlas pipeline at `public/assets/expedition/backgrounds/ruined-temple/`.
- Polished the Catacombs, Escape Sequence, and Dig Site Entrance background PNGs to remove the obvious stacked-strip/banding artefacts visible in browser screenshots.
- Kept the existing `journeyBackgroundAssets.js` and `ExpeditionJourney.jsx` pipeline as the canonical renderer; no duplicate background or section system was added.
- Suppressed the older fallback-style parallax wash whenever an atlas-backed section background is active, so real background art is not overpainted by prototype layers.
- Removed the remaining readable `OPEN` enemy counter label and kept the non-text visual counter cue.
- Browser verification on `http://127.0.0.1:5197/Archaeology-Dig-App/` confirmed Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance all render from their section packs with no fallback, no missing background assets, no console errors, and screenshots were visually inspected.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed with only LF-to-CRLF warnings.
- Moved the Journey notice toast from the bottom action lane to the top-middle of the play area so hazard/stamina messages no longer block the ground, player, or hazards.

2026-05-13 update:
- Investigated enemy sprites that appeared cut off in Journey.
- Confirmed the small-enemy sprite issue came from first-pass atlas crop rectangles that were too tight around scarab, snake, and bat frames.
- Retuned `small-enemy-sprites.json` with modest hand padding around the original artwork so small enemy frames have breathing room without changing enemy hitboxes or combat logic.
- Added a small active-boss camera focus path so awakened nearby mini-bosses are framed with the player instead of sitting partly off the right edge of the screen.
- Browser verification on `http://127.0.0.1:5199/Archaeology-Dig-App/` captured Desert Entry scarab/snake, Escape Sequence bat, and later guardian/construct areas with no missing enemy sprite assets and no fallback active.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed with only LF-to-CRLF warnings.

2026-05-13 update:
- Brightened the Catacombs Journey background inside the existing atlas-backed background pack so the section remains cave-like but the playable band, walls, torches, player, and enemies read more clearly.
- Kept the canonical Journey background pipeline unchanged: `journeyBackgroundAssets.js` still loads the Catacombs atlas and `ExpeditionJourney.jsx` renders the section through the existing section-background path.
- Browser verification on `http://127.0.0.1:5200/Archaeology-Dig-App/` confirmed Catacombs renders from its pack with no background fallback, no missing assets, and no console errors.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed with only LF-to-CRLF warnings.

2026-05-13 update:
- Completed another Journey background polish pass across the existing atlas-backed section packs.
- Tuned Desert Entry, Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance PNGs for clearer midground/playable-band contrast, less muddy darkness, and reduced source-sheet horizontal banding.
- Kept all background loading and rendering on the existing `journeyBackgroundAssets.js` -> `ExpeditionJourney.jsx` path; no new background system, gameplay logic, gates, hazards, enemies, or progression behaviour were changed.
- Browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` captured Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance after the polish pass; all section packs reported ready, no asset fallback was active, no missing atlas regions were reported, and no console errors appeared.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed with only LF-to-CRLF warnings.

2026-05-13 update:
- Wired the first generated full-scene Journey background into Desert Entry.
- Copied the generated image into `public/assets/expedition/backgrounds/desert-entry/desert-entry-full-scene.png` and kept the original generated image in the Codex generated-images folder.
- Updated the existing Desert Entry atlas JSON to reference the full-scene image while preserving all expected region keys for fallback-safe loading.
- Added a small single-composited-backdrop branch to the existing Desert Entry draw path so the new image renders once across the full canvas instead of being sliced into old parallax bands.
- Browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` confirmed Desert Entry renders from its pack, no asset fallback is active, no missing atlas regions were reported, and no console errors appeared.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed with only LF-to-CRLF warnings.

2026-05-13 update:
- Added the next generated full-scene Journey background for Ruined Temple.
- Copied the generated image into `public/assets/expedition/backgrounds/ruined-temple/ruined-temple-full-scene.png` and kept the original generated image in the Codex generated-images folder.
- Updated the existing Ruined Temple atlas JSON to reference the full-scene image while preserving all expected region keys for fallback-safe loading.
- Browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` confirmed Ruined Temple renders from its pack, no asset fallback is active, no missing atlas regions were reported, and no console errors appeared.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed with only LF-to-CRLF warnings.

2026-05-13 update:
- Added the next generated full-scene Journey background for Catacombs.
- Copied the generated image into `public/assets/expedition/backgrounds/catacombs/catacombs-full-scene.png` and kept the original generated image in the Codex generated-images folder.
- Updated the existing Catacombs atlas JSON to reference the full-scene image while preserving all expected region keys for fallback-safe loading.
- Browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` confirmed Catacombs renders from its pack, no asset fallback is active, no missing atlas regions were reported, and no console errors appeared.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed with only LF-to-CRLF warnings.

2026-05-13 update:
- Completed the Rival Looter enemy sprite pass inside the existing Journey enemy sprite pipeline.
- Added `public/assets/expedition/enemies/looter-sprites.png` and `looter-sprites.json` as a named looter/captain atlas alongside the existing small-enemy atlas.
- Extended `journeyEnemySprites.js` to load both enemy sprite packs, map looter enemies to looter frames, and preserve the existing small scarab/snake/bat sprite path.
- Updated the existing Journey renderer so regular looters and the Rival Looter Captain use the looter atlas instead of the temporary player-sprite/placeholder fallback.
- Preserved gameplay behaviour: no enemy positions, hitboxes, health, attacks, gates, boss logic, player movement, backgrounds, Stage Select, Base Camp, or excavation systems were intentionally changed.
- Browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` confirmed enemy sprites load with no missing looter regions, regular looter and looter captain frames render from the atlas, no player-frame fallback is reported, and no console errors appeared.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed with only LF-to-CRLF warnings.

2026-05-13 update:
- Wired the existing Ancient China source image packs into the Stage Select scaffold without making China playable.
- Added China source asset metadata in `expeditionStages.js` for the river valley parallax pack, environment pack, and original source references under `public/assets/expedition/china-source/`.
- Added a compact asset preview grid to the Ancient China preview modal so the uploaded China images are visible from the campaign screen while the stage remains preview-only.
- Browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` confirmed the China preview opens from Stage Select, all four China source images load, no China gameplay is selected or launched, and no console errors appeared.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed with only LF-to-CRLF warnings.

2026-05-13 update:
- Continued the Egypt Journey enemy polish by replacing the Giant Serpent mini-boss canvas fallback with a generated atlas-backed sprite pack.
- Added `public/assets/expedition/bosses/giant-serpent-sprites.png` and `giant-serpent-sprites.json` with 11 boss-state regions for idle, slither, intro, windup, lunge, venom, shielded, counter-window, hit, and defeated poses.
- Extended the existing boss sprite pipeline in `journeyBossSprites.js` and `ExpeditionJourney.jsx`; no duplicate enemy, boss, rendering, collision, or combat system was added.
- Tightened the Giant Serpent atlas crops and draw box so the sprite reads at boss scale and stays grounded in the Catacombs encounter.
- Removed visible boss attack-phase text from the world layer while preserving the non-text warning icon/range cue and HUD notice guidance.
- Browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` confirmed the Catacombs Giant Serpent sprite pack loads with no missing boss regions, no boss fallback active, the new serpent sprite renders in the encounter, and no console errors appeared.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed with only LF-to-CRLF warnings.

2026-05-13 update:
- Changed Museum lab result wording from interpretation-giving text to evidence-based observation text, so students must use the lab result to make their own historical inference in the museum label.

2026-05-13 update:
- Continued the Egypt Journey enemy polish with a dedicated Temple Bat sprite pass.
- Added `public/assets/expedition/enemies/temple-bat-sprites.png` and `temple-bat-sprites.json` as a separate bat atlas, leaving the existing scarab/snake small-enemy sheet untouched.
- Extended the existing `journeyEnemySprites.js` pack loader so only bat enemies use the new Temple Bat atlas while looters and small enemies keep their existing paths.
- Tuned the Temple Bat visual draw box so the enemy reads as an airborne creature instead of a folded sprite sitting on the ground; no hitboxes, damage, enemy AI, route gates, player movement, or Egypt progression were intentionally changed.
- Browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` confirmed the Catacombs route loads enemy sprite packs with no missing Temple Bat atlas regions, no enemy sprite fallback, and no console errors.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed.

2026-05-13 update:
- Continued the Egypt Journey enemy polish with a dedicated Desert Scarab sprite pass.
- Added `public/assets/expedition/enemies/desert-scarab-sprites.png` and `desert-scarab-sprites.json` as a separate scarab atlas, leaving the existing snake/bat legacy small-enemy sheet available as fallback.
- Extended the existing `journeyEnemySprites.js` pack loader so scarab enemies and the later scarab swarm use the new Desert Scarab atlas without changing enemy hitboxes, damage, AI, route gates, player movement, boss flow, or Egypt progression.
- Browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` confirmed the first scarab and later scarab swarm render from the new atlas with no missing scarab regions, no enemy sprite fallback, and no console errors.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed.

2026-05-13 update:
- Continued the Egypt Journey enemy polish with a dedicated Sand Snake sprite pass.
- Added `public/assets/expedition/enemies/sand-snake-sprites.png` and `sand-snake-sprites.json` as a separate snake atlas, leaving the original small-enemy sheet as a fallback only.
- Extended the existing `journeyEnemySprites.js` pack loader so Sand Snake uses the new atlas while scarab, bat, looter, guardian, statue, and boss-linked enemies keep their established paths.
- Browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` confirmed the Sand Snake renders from the new atlas with no missing snake regions, no enemy sprite fallback, no boss sprite fallback, no asset fallback, and no console errors.
- A full enemy-family sweep confirmed all current Journey enemy families now have sprite-backed rendering: scarab, snake, bat, looter, guardian, statue, Scarab Queen, Stone Guardian, Giant Serpent, and Ancient Construct.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed.

2026-05-14 update:
- Wired the premium archaeology card-back asset into the Dig phase card grid at `public/assets/ui/archaeology-card-back.png`.
- Improved unrevealed card visual styling with the premium card image, subtle lift/glow hover polish, and keyboard focus outline support.
- Preserved fallback styling: if the premium image is missing or fails to load, unrevealed cards keep the existing brown CSS card-back and Pickaxe icon.
- Card logic unchanged: no scoring, matching, reveal, click, game flow, or evidence logic was intentionally changed.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with existing Vite public-asset and chunk-size warnings; browser verification confirmed premium card backs load, click/reveal still works, missing-image fallback works, and no console errors appeared.

2026-05-14 update:
- Upgraded the Lost Site Expedition Journey collectible sprite atlas for gems, field tools, objective pickups, upgrade pickups, and pickup effect rings.
- Replaced `public/assets/expedition/collectibles/journey-collectibles-pack.png` with a higher-quality generated atlas and retuned `journey-collectibles-pack.json` crop regions for all 22 expected collectible keys.
- Updated `journeyCollectibleSprites.js` with a new collectible atlas version and tuned Journey collectible scales in `ExpeditionJourney.jsx` so relic shards and tools are more readable in the larger play area.
- Browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` confirmed upgraded shards, field tools, upgrades, and objective pickups render from the atlas with no collectible fallback, no missing regions, no asset fallback, and no console errors.

2026-05-14 update:
- Improved Journey mini-boss presentation inside the existing `ExpeditionJourney.jsx` boss-intro and mini-boss rendering path.
- Added Guardian Encounter title-card wording, boss-name emphasis, brief camera shake/focus, and a larger awakened-boss health bar.
- Added boss key-item rewards to the existing Journey state: Desert Seal, Temple Seal, Catacomb Seal, Escape Seal, and Excavation Seal.
- Each route gate now requires its matching recovered seal through the existing `ROUTE_GATES` requirement/checklist logic; no parallel boss, inventory, or gate system was added.
- Added visible seal drops after boss defeat, short Year 7 friendly recovery messages, Journey HUD/sidebar seal status, and render-state fields for `bossKeyItems` / `collectedBossKeyItems`.
- Expanded route-to-boss pacing slightly by adding short ledges and mild hazards before guardian areas, and by shifting overlapping normal enemies so boss approaches are less cramped.
- No Stage Select, Base Camp, Excavation, Museum, Lab, or Report flow was intentionally changed.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite public-asset runtime warnings and large chunk warning; `git diff --check` reported only existing LF-to-CRLF line-ending warnings.
- Browser validation: local dev server launched at `http://127.0.0.1:5214/Archaeology-Dig-App/`; menu -> Stage Select -> Ancient Egypt -> Journey briefing opened, `render_game_to_text` confirmed Desert Seal is now a route requirement and all five boss key items are exposed. A longer Playwright combat bot attempted the Scarab Queen route but timed out before completing the defeat/route-opening pass, so a manual first-boss and later-boss playthrough is still recommended.
- Remaining risk: key-item gating is implemented and build-verified, but the exact player feel of collecting each seal after defeat still needs a slower human/browser pass because the automated combat run did not complete cleanly in this session.
- Validation: collectible/enemy atlas bounds checks passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed after removing trailing whitespace from existing CSS changes.

2026-05-14 update:
- Reworked the Journey mini-boss reward layer from seal collectibles into excavation kit tool pieces while extending the same existing boss, drop, HUD, and route-gate logic.
- Added boss-domain intro treatment for guardian encounters: title cards, Year 7 friendly guardian dialogue, arena framing, brief movement pause/camera focus, subtle boss-domain tinting, and boundary markers.
- Added excavation tool-piece rewards for the current five Journey mini-bosses: Brush Handle, Trowel Blade, Measuring Cord, Field Notebook Clasp, and Site Permit Seal.
- Each next route gate now requires the matching recovered tool piece through the existing route-gate checklist logic; no separate inventory, boss, or gate system was added.
- Updated the Journey sidebar/HUD section to show a compact Excavation Kit checklist for recovered tool pieces.
- Preserved the existing route-to-boss pacing changes with warning/calm lead-in space before guardian areas and no long empty running.
- No Stage Select, Base Camp, Excavation, Museum, Lab, Report, or unrelated game systems were intentionally changed.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large chunk warnings; `git diff --check` passed with only LF-to-CRLF line-ending warnings on already-dirty files.
- Browser notes: local Journey smoke testing confirmed the Ancient Egypt Journey opens, the Scarab Queen guardian title/dialogue appears, the Scarab Queen awakens on the opposite side of the boss space, the Brush Handle is required by the next route gate, the excavation kit tool pieces are exposed in render state, and no console errors appeared.
- Remaining risk: automated browser play reached the first guardian intro and route-gate state, but did not complete a full live Scarab Queen defeat/collection pass; a later retest attempt on the local dev server timed out while loading the page, so a slower manual pass is still recommended once final boss/item art is added.

2026-05-14 update:
- Continued the Egypt Journey enemy polish until the remaining normal enemy families no longer borrow unfinished or mismatched art.
- Added dedicated enemy sprite atlases for Rival Looter Captain, Cursed Statue, and regular Stone/Gate Guardian enemies:
  - `public/assets/expedition/enemies/looter-captain-sprites.png` / `.json`
  - `public/assets/expedition/enemies/cursed-statue-sprites.png` / `.json`
  - `public/assets/expedition/enemies/stone-guardian-enemy-sprites.png` / `.json`
- Extended the existing `journeyEnemySprites.js` pack loader with the new atlas packs, expected region keys, frame selection, and draw-scale tuning; no new enemy rendering system was added.
- Preserved gameplay behaviour: enemy positions, hitboxes, health, damage, AI, boss flow, route gates, player movement, Stage Select, Base Camp, and excavation flow were not intentionally changed.
- Browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` confirmed scarab, snake, bat, looter, looter captain, cursed statue, and stone/gate guardian families load from sprite packs with no enemy fallback, no boss fallback, no missing enemy regions, no asset fallback, and no console errors.
- Validation: enemy atlas bounds/empty-region checks passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large-chunk warnings; `git diff --check` passed with only LF-to-CRLF working-copy warnings.

2026-05-14 update:
- Added a Guardian Knowledge Challenge before Journey mini-boss fights inside the existing `ExpeditionJourney.jsx` boss-domain intro flow.
- Added a 3-question multiple-choice round for each current Journey mini-boss, with Year 7 friendly archaeology/HASS questions stored beside the Journey boss data in `journeyLevelData.js`.
- Correct and incorrect answers now receive immediate feedback: correct answers strengthen the player, while incorrect answers strengthen the guardian.
- Applied current-fight battle modifiers only: 3 correct gives player damage +25%, boss health -15%, and a subtle player glow/scale; 2 correct gives player damage +15% and a smaller player glow/scale; 1 correct gives boss health +10% and boss glow/scale; 0 correct gives boss health +20%, boss damage +10%, and stronger boss glow/scale.
- Boss combat and player movement pause while the Guardian Knowledge Challenge panel is active, then resume after the result message and Begin Guardian Fight action.
- Challenge completion/results are exposed through the Journey render-state snapshot for browser regression checks.
- Preserved boss tool-piece drops, existing route gates, Stage Select, Base Camp, Excavation, Museum, Lab, Report, and unrelated UI.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large chunk warnings; `git diff --check` passed with only an LF-to-CRLF warning on an already-dirty sprite file.
- Browser notes: local browser testing confirmed the Ancient Egypt Journey opens and the Scarab Queen Guardian Knowledge Challenge is created in Journey state with the first question and no console errors. Playwright DOM clicking against the challenge panel was flaky because the active Journey loop re-rendered the panel during clicks, so a manual click-through of the three visible options is still recommended.
- Remaining risk: automated browser state verified challenge creation, but did not reliably complete the full UI answer/result/fight-start sequence or a full boss defeat after the modifier.

2026-05-14 follow-up:
- Tightened the Guardian Knowledge Challenge panel rendering so the active challenge is mirrored into a small React UI state while gameplay state remains in the existing Journey state object.
- Reduced per-frame React re-rendering while the knowledge panel is active; the challenge now syncs when it opens and when answers/continue actions change it, instead of forcing a HUD update every animation frame.
- No question data, battle modifier rules, boss reward/tool-piece drops, gates, Stage Select, Base Camp, Excavation, Museum, Lab, Report, or unrelated screens were changed in this follow-up.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large chunk warnings; `git diff --check` passed with only LF-to-CRLF warnings on existing dirty files.
- Browser notes: the real movement path to the first guardian briefly rendered the Guardian Knowledge Challenge overlay with four options and no console errors. Browser automation still could not complete a reliable full click-through before timing out, so manual verification of the answer/result/fight-start sequence remains the main follow-up risk.

2026-05-14 update:
- Confirmed boss-dropped excavation tool pieces are wired through the existing Journey boss defeat, pickup, HUD, and route-gate logic.
- Tightened tool-piece reward wording so each recovered item explains its archaeology purpose: fragile evidence care, careful excavation, accurate site recording, secure field records, and Base Camp site access.
- Kept the current five-boss Journey structure: Brush Handle from Scarab Queen, Trowel Blade from Stone Guardian, Measuring Cord from Giant Serpent, Field Notebook Clasp from Rival Looter Captain, and Site Permit Seal from Ancient Construct.
- Each next Journey route gate requires the matching recovered tool piece through the existing `ROUTE_GATES` checklist; the Base Camp route requires the Site Permit Seal.
- The Journey sidebar/HUD continues to show the compact Excavation Kit checklist, and dropped pieces use the existing collectible marker rendering as placeholder art.
- No duplicate inventory, boss, pickup, gate, Stage Select, Base Camp, Excavation, Museum, Lab, Report, or unrelated UI system was added or changed.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large chunk warnings; `git diff --check` passed with only LF-to-CRLF warnings.
- Browser notes: local Journey smoke confirmed all five tool pieces are exposed in render state, the first gate requires Brush Handle as a `toolPiece`, the sidebar DOM contains the Excavation Kit list, and no console errors appeared.
- Remaining risk: browser automation did not complete a live boss defeat/collection pass in this run, so a short manual Scarab Queen defeat and Brush Handle pickup pass is still recommended.

2026-05-14 update:
- Tightened the Journey boss-domain intro flow so the Guardian Encounter title/dialogue plays before the Guardian Knowledge Challenge opens.
- Updated boss-domain dialogue for the main guardian bosses: Scarab Queen warns the player not to disturb what the desert buried, Stone Guardian only allows careful investigators to pass, Giant Serpent says the catacombs protect their secrets, and Ancient Construct requires the final seal before excavation begins.
- Preserved existing arena framing: on first boss-domain entry the player is staged on one side of the arena, the boss is staged opposite, the camera frames the domain, and a subtle tinted arena boundary is drawn.
- Extended the intro pause to match the short title-card moment, then hands off to the existing Guardian Knowledge Challenge when available; if a boss has no challenge questions, the fight continues after the intro pause.
- Kept boss tool-piece rewards and route-gate requirements compatible; no boss, reward, pickup, route, Stage Select, Base Camp, Excavation, Museum, Lab, Report, or unrelated screen system was rewritten.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large chunk warnings; `git diff --check` passed with only LF-to-CRLF warnings.
- Browser notes: Journey smoke using the first boss confirmed `Guardian Encounter: Scarab Queen`, the new Scarab Queen dialogue, the Desert Seal Domain tint/state, player and boss starting positions on opposite sides of the arena, and no console errors.
- Remaining risk: automated browser checks verified the intro state and framing, but did not complete a full manual-feel pass through intro -> challenge answers -> boss defeat -> tool-piece pickup.

2026-05-14 update:
- First boss combat defeat verified and hardened inside the existing Journey boss/key-piece flow.
- Brush Handle reward drop/reachability confirmed: Scarab Queen defeat now places the dropped tool piece on the ground pickup band before the Desert Map Seal, while preserving the existing x clamp that keeps it on the player side of the gate.
- Reward clamp/gate safety confirmed: the Brush Handle dropped at `x=1432`, safely before the `desert-seal` gate at `x=1480`, and could be collected by walking to it.
- Guardian Challenge handoff remains stable: browser testing confirmed intro -> Guardian Knowledge Challenge -> completed questions -> resumed boss fight with no repeated challenge loop.
- Next route progression confirmed: after Scarab Queen defeat, Brush Handle pickup, relic shard requirement, and Map Tablet completion, the Desert Map Seal opened and the next active route gate became the Temple Route Seal.
- No new boss mechanics, question data, reward system, inventory system, gate system, Stage Select, Base Camp, Excavation, Museum, Lab, Report, or unrelated UI was changed.
- Validation: `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check` run after this pass.
- Browser test notes: local browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` used a clean Egypt Journey, entered the Scarab Queen domain, completed the Guardian Knowledge Challenge, defeated the boss with normal attack input, collected Brush Handle, verified Excavation Kit progress changed to `1 / 5`, and verified route progression to the Temple Route Seal with no console errors.
- Remaining risk: retry/death behavior was not exhaustively played through manually after the reward pickup; existing state guards prevent the defeated boss and completed Guardian Challenge from reappearing in the verified path.

2026-05-14 update:
- Post-boss reward clarity pass completed inside the existing Journey boss/key-piece flow.
- Reward messages improved for each excavation kit piece so students see what was revealed/recovered and why it matters for careful archaeology work.
- Added a short parchment-style post-boss reward banner that shows the tool-piece badge, item name, archaeology explanation, excavation kit progress, and the next objective.
- Excavation kit progress is now shown in the reward banner as recovered pieces out of the existing five-piece kit.
- Next objective messaging now distinguishes between collecting the revealed piece, returning to the route gate, the route opening, and the final excavation-site access step.
- No unrelated systems changed: boss combat, dropped-piece state, route gates, Stage Select, Base Camp, Excavation, Museum, Lab, Report, and unrelated screens were preserved.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset, large chunk, and plugin timing warnings; `git diff --check` passed with only LF-to-CRLF working-copy warnings.
- Browser test notes: local Journey browser probing reached the Scarab Queen reward state once and confirmed the post-boss reward payload appeared in Journey state with no console errors. A separate local pass confirmed the app opens and Journey starts. The full live defeat/pickup loop remains slow and brittle under automation because it must pass through intro/challenge/combat timing.
- Remaining risks/follow-up tasks: run a short manual Scarab Queen defeat and Brush Handle pickup pass for feel, then spot-check a later guardian and the Ancient Construct handoff to Base Camp.

2026-05-14 update:
- Extended the Egypt Journey pacing before guardian fights inside the existing Journey data/config path.
- Added a canonical horizontal Journey scale helper in `journeyConstants.js` and applied it to authored Journey x-positions in `journeyLevelData.js`, preserving the current movement speed, collision system, combat, route gates, boss flow, Stage Select, Base Camp, and excavation flow.
- Ground spans now stretch with the scaled world so the player does not hit gaps while moving through the longer route.
- The Ancient Construct, final Base Camp Survey Seal, final banners, and Journey exit gate were shifted later so the final boss approach also clears the 30-second pacing target.
- Straight-walk guardian trigger spacing is now approximately: Scarab Queen 30.5s, Stone Guardian 36.1s, Giant Serpent 43.8s, Rival Looter Captain 33.9s, Ancient Construct 32.7s.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite public-asset and large-chunk warnings; `git diff --check` passed with only LF-to-CRLF line-ending warnings on the two touched Journey files.
- Browser notes: local browser smoke testing confirmed Main Menu -> Stage Select -> Ancient Egypt -> Begin Expedition opens, the first boss remains inactive before the new 30-second trigger point, the Scarab Queen guardian intro/domain starts just after the trigger point, and no console errors appeared.
- Remaining risk: this was a pacing/layout pass, not a full manual completion of every stretched section; a feel pass through all five guardian approaches is still recommended to tune density if any stretch feels too empty.

2026-05-14 update:
- Sourced a small CC0 Expedition SFX set from Kenney RPG Audio and copied the curated files into `public/assets/expedition/sfx/` with the license text.
- Added a reusable Expedition SFX player to the existing `audioControls` path instead of creating a second audio system.
- Wired sourced effects into the current Journey and Expedition flows: sand footsteps, jump/land, satchel/tool pickup, relic shard pickup, upgrade click, khopesh swing, enemy hit, player hit, boss warning, gate open, and gate blocked.
- Tuned SFX volumes low so they support the classroom game without overpowering the existing music and stingers.
- Validation: `npm.cmd run lint` passed before the final build pass; `npm.cmd run build` passed with the existing Vite public-asset and large-chunk warnings; `git diff --check` passed with only LF-to-CRLF working-copy warnings.
- Browser notes: local browser verification on `http://127.0.0.1:5190/Archaeology-Dig-App/` confirmed Journey starts, movement requests random footstep SFX, Space requests jump/land SFX, J requests khopesh swing SFX, and all SFX files return successfully from the dev server.
- Remaining risk: the sound choices are safe and working, but kid-facing feel still needs a quick listen/play pass to decide whether the mix should be more arcade-like, more modern, or more subtle.

2026-05-14 update:
- Added a main-menu Expedition music toggle that starts in the off state on a fresh app load.
- Kept music opt-in only: Expedition music cues now stop/skip when the toggle is off, while short SFX still play normally.
- The toggle lives in the existing `ActivityMenu` hero controls and uses the app-level `audioControls` path rather than adding a separate audio system.
- Validation: `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check` passed; Vite still reports the existing public-asset and large-chunk warnings, and Git still reports LF-to-CRLF working-copy warnings.
- Browser notes: local browser verification confirmed the menu shows `Music Off` with `aria-pressed=false` by default, starting Expedition with music off made zero Expedition `.mp3` play calls, toggling to `Music On` changed `aria-pressed=true`, and then Expedition music started during the Journey flow with no console errors.
- Remaining risk: no persistence was added for the music preference, so it intentionally resets to off on a page reload.

2026-05-14 update:
- Moved the Expedition music control out of the hero corner and into the main Mission Select heading row so it is easier to find.
- The control now reads `Expedition Music: Off` by default, then switches to `Expedition Music: On` when enabled.
- No music behavior changed in this follow-up: background music is still opt-in, and SFX still play normally.

2026-05-14 update:
- Hardened Expedition SFX playback after user reported they could not hear sound effects.
- Added an explicit SFX unlock path on Expedition start, music toggle, Journey keydown, and the new menu sound-test control so browsers have a direct user gesture before game-loop SFX fire.
- Added a visible `Test Sound` button beside the Expedition music toggle on the main menu.
- Raised the quiet SFX mix levels for footsteps, jump/land, pickups, hits, gates, boss warning, and khopesh swing while keeping background music opt-in.
- No duplicate audio system was added; the changes extend the existing `audioControls` and SFX file map.

2026-05-14 update:
- Completed a Journey enemy/boss visual polish pass in the existing sprite render path.
- Corrected sprite-facing logic so generated right-facing enemy sheets flip only when travelling/attacking left, while the Scarab Queen keeps its left-facing native orientation.
- Re-grounded enemy and boss sprite draw boxes so live and defeated sprites sit more naturally on the floor.
- Cleared hit-flash, stun, attack, vulnerability, shield, and knockback timers at enemy/boss defeat so defeated bodies use a still defeated frame instead of wobbling or flashing.
- Repositioned normal enemy health bars from visible sprite bounds instead of the smaller collision box, and clamped enemy/boss health bars inside the canvas.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite public-asset and large-chunk warnings; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local browser screenshots confirmed the Egypt Journey opens, visible scarab enemy floor alignment/facing improved, Scarab Queen intro/domain still triggers, and no console errors appeared.
- Remaining risk: automated defeat input did not reliably land a hit on a moving scarab during this pass, so a short manual fight check is still useful for feel, but the defeated-state timer cleanup is in the canonical update path.

2026-05-14 update:
- Increased normal Journey enemy visual scale in `journeyEnemySprites.js` so enemies read as more challenging beside the player.
- Enlarged scarabs, snakes, bats, rival looters, looter captain, cursed statue enemies, and stone guardian enemies through the existing sprite draw-box helper only.
- Preserved gameplay behaviour: hitboxes, health, damage, patrol logic, boss flow, route gates, Stage Select, Base Camp, and excavation were not intentionally changed.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite public-asset and large-chunk warnings.
- Browser notes: local screenshots confirmed the enlarged scarab and rival looter render larger, stay grounded, keep their health bars aligned, and produce no console errors.
- Remaining risk: this is a visual-only scale increase; a manual play feel pass should decide whether any specific enemy family should be dialled slightly up or down.

2026-05-14 update:
- Reduced empty Egypt Journey walking spaces by adding short micro-challenge beats across Desert Entry, Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance.
- Added small raised platform routes, mild timing hazards, extra spaced enemies, and safe pause ledges before harder guardian areas.
- Added optional risk/reward relic shard pickups near upper routes and mild hazards so students can choose between safe progress and extra collection.
- Added archaeology clue/marker props and short route notices such as ancient marks, unstable site warnings, guardian territory, and evidence reminders.
- Kept the existing boss, route gate, Guardian Knowledge Challenge, reward, progression, Stage Select, Base Camp, Excavation, and final claim systems unchanged.
- Validation: `npm.cmd run lint` passed with existing React hook warnings in `ExpeditionJourney.jsx`; `npm.cmd run build` passed with the existing Vite public-asset and large-chunk warnings; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local browser verification confirmed Main Menu -> Stage Select -> Ancient Egypt -> Begin Expedition works, the first playable section now presents an early hazard/reward beat, sampled later sections show the new short clue notices, Scarab Queen intro still triggers, Guardian Knowledge Challenge still opens, and no console errors appeared.
- Remaining risks/follow-up tasks: this pass was authored and spot-checked with browser automation rather than a full 10-15 minute manual playthrough; a live classroom-feel pass should tune exact enemy/hazard density if any section feels too busy or too easy.

2026-05-14 update:
- Completed a whole Egypt Journey map polish pass after sampling Desert Entry, Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance in the browser.
- Cleaned up the early Desert Entry challenge beat by removing the extra low-thorn hazard that crowded the trowel pickup, scarab scout, and reward path.
- Centered the in-canvas section and guardian encounter cards so they read like intentional presentation beats across all sections.
- Prevented floating notice overlays from appearing at the same time as cinematic section/guardian cards, avoiding HUD/card overlap.
- Added then pruned final-approach set dressing where the existing banner/camp prop atlas read incorrectly as a stray rope coil near the player.
- Kept gameplay systems unchanged: movement, collision, combat, route gates, boss flow, Guardian Knowledge Challenge, rewards, Base Camp, Excavation, and final claim were not rewritten.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite public-asset and large-chunk warnings; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local browser spot checks confirmed the cleaned Desert Entry, Ruined Temple, Catacombs, Escape Sequence, Dig Site Entrance, Scarab Queen card, and final dig-site approach render with no console errors.
- Remaining risk: the final dig-site approach remains visually quieter than the earlier temple/catacomb sections because the current available prop atlas has limited camp-specific pieces; a future asset pass should add proper base-camp foreground props.

2026-05-14 update:
- Added the first Ancient China excavation marker/gateway/UI runtime packs beside the existing China Journey background, China Journey environment, and China room-map packs.
- New files: `public/assets/expedition/excavation/china-zone-challenge-ui-pack.png/.json` and `public/assets/expedition/excavation/china-survey-marker-gateway-pack.png/.json`.
- Registered `chinaChallengeUi` and `chinaSurveyGateway` in the canonical excavation map asset loader with exact expected atlas keys.
- Made excavation map drawing stage-aware for marker, gateway, and map UI packs so China uses `chinaRoomMap`, `chinaSurveyGateway`, and `chinaChallengeUi`, while Egypt continues using `roomMap`, `surveyMarkers`, `gateway`, `legacy`, and `challengeUi`.
- Preserved the existing Journey, Base Camp, excavation mechanics, evidence flow, survey/grid flow, hazards, guardians, and final-claim path rather than adding a duplicate China runtime.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Egypt public-asset runtime warnings and large bundle warning.
- Browser notes: local browser verification confirmed China Stage Select -> dev-jumped excavation uses the China pack IDs with `excavationMapAssetsReady=true`, fallback inactive, zero missing atlas regions, and no console errors; screenshot check confirmed China map markers/gates/hazards render. Egypt excavation regression confirmed Egypt pack IDs unchanged, fallback inactive, zero missing atlas regions, and no console errors.
- Remaining risks/follow-up tasks: China is playable as a prototype through the existing Egypt-grade mechanics, but full China playability still needs China-specific Journey route objectives/gates/enemy names, China challenge content, China enemy/guardian sprite art, final-claim tuning, and a full natural playthrough without dev jumps.

2026-05-14 update:
- Completed a China excavation map polish pass in the existing map renderer.
- Added stage-aware map visual tuning so China uses a warmer river-valley/bronze-jade palette, stronger terrain contrast, clearer survey strings, lighter wash overlays, and higher marker readability while Egypt keeps its existing tuning.
- Added China-specific wall/collision rectangles for the map so the rendered timber/rammed-earth barriers better match the China art.
- Updated China excavation header text to `Ancient China Expedition Map`, changed the off-room fallback from `Open Trench` to `Survey Trench`, and shortened the China guardian map label to `Site Watcher`.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Egypt public-asset runtime warnings and large bundle warning.
- Browser notes: local browser verification confirmed China excavation remains on `china-room-map-stage-1`, all China packs are ready, fallback inactive, zero missing atlas regions, no console errors, and the polished map title/labels render. Egypt excavation regression confirmed its title, pack IDs, fallback state, and missing-region count remain unchanged with no console errors.
- Tooling note: the `develop-web-game` Playwright helper still fails to import `playwright` from the user skill folder, so browser verification used the repo-available Playwright path through the local automation layer.
- Remaining risks/follow-up tasks: China still needs a full natural playthrough after China-specific Journey objectives/gates/enemies/challenges are authored; this pass was visual polish plus smoke/regression verification.

2026-05-15 update:
- Archaeologist Training UI polish completed for `How Do We Investigate the Past?`.
- Improved the stage cards with a field-training card treatment, clearer icon alignment, tighter card spacing, subtle depth, and hover/drag states.
- Improved the drop zones into clearer numbered field slots with `Step 1` through `Step 5`, more inviting empty states, and locked-in visual states for placed cards.
- Reduced and refined the feedback panel so it reads as a compact field notebook check and still reports progress such as `0/5 stages are in the right place`.
- Polished the `0/5 correct` progress badge into a cleaner training progress badge.
- Kept the Back to Menu button visible and restyled it to match the parchment/dossier training UI.
- Added subtle CSS-only archaeology theming: notebook/grid texture, parchment panels, bronze separators, and corner-bracket details.
- No drag/drop logic, correct order, scoring, activity routing, or Back to Menu behaviour was intentionally changed.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite public-asset runtime warnings and large bundle warning; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local browser verification opened Archaeologist Training, confirmed all five cards display, dragged Survey to Step 1, Grid to Step 2, Excavate to Step 3, Map to Step 4, and Lab to Step 5, confirmed progress reached `5/5 correct`, confirmed the feedback panel stayed readable and compact, confirmed Back to Menu returned to the activity menu, and found no console errors.
- Remaining layout risk: the screen was checked at the normal 1280x720 in-app browser/laptop viewport; very narrow or unusually zoomed classroom devices may still need a quick visual pass.

2026-05-15 update:
- Started the Unique Ancient China Mobs pass inside the existing Journey implementation.
- Added `public/assets/expedition/enemies/china/china-enemy-guardian-sprites.png` and `.json` with the 25 requested transparent atlas regions for river crabs, watchtower sentries, and the clay guardian.
- Extended the canonical enemy and boss sprite loaders to resolve atlas images relative to each atlas JSON path, so the shared China atlas can live under `enemies/china/` and still be used by the boss renderer.
- Added stage-aware China Journey enemy and guardian data while keeping the existing boss IDs for route gates, Guardian Knowledge Challenge references, rewards, and combat rules.
- Exposed China mob atlas paths, missing China mob keys, fallback status, active civilisation, visible enemy families, and active boss sprite/frame through the existing Journey text snapshot.
- Validation: the new China atlas JSON validates all 25 required frame keys and the PNG exists; `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite public-asset and large-chunk warnings; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: repo-local Playwright verification confirmed Stage Select -> Ancient China -> Journey loads `assets/expedition/enemies/china/china-enemy-guardian-sprites.json`, reports active civilisation `Ancient China`, loads China enemy/guardian sprites with fallback inactive, shows `riverCrab` regular enemies, defeats `River Crab Scout`, triggers `Clay Guardian`, shows the `china-clay-guardian` boss sprite with `clayGuardianIntro`, hands off to Guardian Knowledge Challenge, then reaches guardian combat frames including `clayGuardianCounterWindow`, `clayGuardianShielded`, and `clayGuardianSlam` before defeating the first guardian and dropping/collecting the existing brush-handle reward.
- Egypt regression notes: Ancient Egypt Journey still loads the desert temple environment, reports active civilisation `Ancient Egypt`, shows `scarab` enemies and Egypt boss names (`Scarab Queen`, `Stone Guardian`, `Giant Serpent`), with enemy/boss fallback inactive and no console errors.
- Tooling note: the `develop-web-game` helper still fails with `ERR_MODULE_NOT_FOUND: Cannot find package 'playwright'` from the user skill folder, so browser verification used the repo-available Playwright path.
- Remaining risks/follow-up tasks: China now has unique regular mobs and a shared clay guardian boss sprite family, but full classroom polish still needs China-specific Journey objective/gate copy, China-specific Guardian Knowledge questions, China collectible/relic sprites, later guardian visual variants beyond the shared clay guardian atlas, and a full natural no-dev-jump China playthrough through Journey, Base Camp, excavation, evidence, and final claim.

2026-05-15 follow-up:
- Refined the Archaeologist Training layout for focus and screen density after classroom-use feedback.
- Collapsed the large header into a slim orientation strip with title, short instruction, progress, and Back to Menu on one row.
- Removed the duplicate ordering header and removed the in-play feedback panel so students see only the stage cards, drop targets, progress badge, and menu action while working.
- Changed the five drop targets from narrow vertical columns into five wide notebook rows, making each target closer to the shape of the draggable stage cards and reducing hesitation about where to drop.
- Kept completion lightweight: `5/5 correct`, green `In place` labels, and confetti confirm success without adding a large bottom panel.
- No drag/drop logic, correct order, scoring, dependencies, or navigation behaviour was intentionally changed.
- Validation: `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check` passed; build still reports the existing Vite public-asset runtime warnings and large bundle warning.
- Browser notes: local browser verification at 1280x720 confirmed the slim header, all five stage cards, all five wide drop rows visible on the first screen, successful Survey/Grid/Excavate/Map/Lab drag order, `5/5 correct`, Back to Menu behaviour, and no console errors.
- Remaining layout risk: the wide row layout is tuned for normal laptop/projector widths; narrow windows fall back to stacked layout and may still require scrolling.

2026-05-15 follow-up:
- Darkened the Archaeologist Training activity after the first compact pass still read too bright/white.
- Replaced the pale header with a compact dark HUD strip and removed the instruction sentence from the header to save vertical space.
- Shifted the card tray, stage cards, and drop rows from white parchment toward warmer tan/dossier colours so the screen feels less like a worksheet.
- Kept the wide row drop targets, progress badge, Back to Menu action, correct order, scoring, and drag/drop behaviour unchanged.
- Browser notes: refreshed the LocalCodex dev server on port 5173, confirmed the darker compact UI is visible, dragged all five cards into order, reached `5/5 correct`, and found no console errors.

2026-05-15 follow-up:
- Fixed the Archaeologist Training screen opening at a carried-over scroll position from the menu, which could hide the compact top HUD strip on first entry.
- Added a narrow mount-time scroll reset inside the existing `TrainingPhase.jsx` component so the current Training activity opens at the top without changing the app shell or drag/drop system.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset and large bundle warnings.
- Browser notes: verified the scrolled-menu-to-Start-Training path now opens with the Training HUD visible, then dragged Survey, Grid, Excavate, Map, and Lab into order and reached `5/5 correct`.

2026-05-15 follow-up:
- Added the first safe bundle split by lazy-loading the existing `ExpeditionMode` branch from `src/App.jsx` with `React.lazy` and `Suspense`.
- Kept the current app shell, phase system, ExpeditionMode, ExpeditionJourney, save/load, Bureau, inventory, evidence, and gameplay logic unchanged.
- Added a small dossier-style loading fallback for the Expedition chunk.
- Bundle comparison: before split, production build emitted `index-5l6dWpyB.js` at 750.72 kB / 216.11 kB gzip and showed Vite's large-chunk warning; after split, production build emitted `index-DQtsmO5R.js` at 437.25 kB / 132.52 kB gzip plus `ExpeditionMode-CXIxc3YD.js` at 315.26 kB / 84.71 kB gzip, with the large-chunk warning gone.
- Validation: `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check` passed; diff check only reported the usual LF-to-CRLF working-copy warnings.
- Browser notes: local smoke tests confirmed the main menu opens, Training opens and returns to menu, Lost Site Expedition opens through the lazy chunk, Ancient China Expedition opens to its mission briefing, the ordinary Ancient China investigation route opens to the dig setup modal, Bureau opens, and no browser console warnings/errors were reported during the final check.

2026-05-15 follow-up:
- Extended the same narrow lazy-loading pattern to the next large mode components imported by `src/App.jsx`: `DigPhase` and `BureauMode`.
- Preserved the existing App phase/mode system and kept all Dig, Bureau, Expedition, save/load, inventory, evidence, and gameplay logic in their current components.
- Bundle comparison after this pass: production build emitted `index-BobaB1xb.js` at 308.41 kB / 95.20 kB gzip, `ExpeditionMode-DooiEOa1.js` at 315.38 kB / 84.76 kB gzip, `DigPhase-CqqZbwpV.js` at 27.06 kB / 8.51 kB gzip, `BureauMode-CP5tuuRa.js` at 24.04 kB / 6.17 kB gzip, and a shared `gameLogic-C8uO50mE.js` chunk at 78.16 kB / 25.43 kB gzip.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing runtime-public-asset warnings only.
- Browser notes: local smoke tests confirmed main menu, Training, Expedition, Dig setup, and Bureau all open through the current app flow with no browser console warnings/errors.

2026-05-15 follow-up:
- Started a China Journey background polish pass inside the existing `ExpeditionJourney.jsx` canvas renderer.
- Added China-only background depth treatment after the runtime parallax atlas draws: soft morning sky wash, river haze bands, distant ridge silhouettes, subtle water sheen/ripples, and a lower vignette to ground the playable area.
- Kept gameplay, Journey route data, Stage Select, Egypt assets, excavation, enemies, and asset files unchanged.
- Exposed the pass through `chinaBackgroundPolishVersion` and updated the active China background depth mode to `china-river-valley-parallax-v2-polished`.

2026-05-15 follow-up:
- Reduced empty Egypt Journey walking spaces in the existing level data without shortening the route.
- Added small micro-challenge beats across the desert entry, ruined temple, catacombs, escape route, and dig-site approach: raised steps, broken-bridge ledges, mild low hazards, and safe pause platforms.
- Added optional risk/reward relic shards on slightly more involved paths while keeping the lower route usable for steady progress.
- Added archaeology markers and short field-note style prompts such as pottery markers, survey flags, boundary markers, and evidence markers.
- Kept boss approaches readable by placing safe pauses before guardian/boss areas and using mild penalties for new hazards.
- No boss logic, Guardian Knowledge Challenge logic, boss rewards, route gates, Stage Select, Base Camp, Excavation, Museum, Lab, Report, save/load, inventory, or evidence systems were intentionally changed.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local browser/CDP verification opened Ancient Egypt Journey, confirmed early empty walking is reduced, visually checked pottery/survey markers, raised platforms, mild hazards, and optional shards, triggered the Scarab Queen boss intro, completed the Guardian Knowledge Challenge, defeated the boss, confirmed the Brush Handle reward drop, collected it, opened the first route gate to the Temple Route Seal, and confirmed the Base Camp Checklist still loads through the existing dev jump. No console errors were reported during the CDP checks.
- Remaining risks/follow-up tasks: the pass was smoke-tested with debug positioning for speed rather than a full natural 10-15 minute no-dev-jump playthrough; a later polish pass should do a full controller/keyboard run through all Egypt gates and tune shard density if students collect too many early optional shards.

2026-05-15 follow-up:
- Added a small Egypt Journey enemy-density pass inside the existing `ENEMIES` level-data array.
- Added six low-stakes regular enemies in the newly active route spaces: Pottery Scarab, Temple Step Snake, Rival Scout near the field-note route, Torch Bat, Dust Scarab, and Rival Lookout.
- Kept the added enemies mostly at one health with short patrol routes and low-to-moderate damage so the Journey feels more alive without becoming a combat slog.
- Preserved the existing boss, Guardian Knowledge Challenge, boss reward, route gate, Base Camp, Excavation, Museum, Lab, Report, save/load, inventory, and evidence systems.
- Preserved the existing uncommitted China enemy variant edits in the same file; this pass only added Egypt regular enemy entries.
- Validation: `npm.cmd run lint` passed with the existing China background hook dependency warning only; `npm.cmd run build` passed with the existing Vite runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local CDP smoke opened Ancient Egypt Journey, checked the six added enemy positions with the existing Journey debug hook, confirmed Egypt remained the active civilisation, confirmed the expected enemy sprite families appeared at those positions, visually checked the late-route Rival Lookout placement, and found no console errors.
- Remaining risks/follow-up tasks: this was a placed-enemy smoke test rather than a full natural combat playthrough; if the route starts feeling too busy in class, tune the first and temple additions before touching boss areas.

2026-05-15 follow-up:
- Added an Egypt ambient world-life pass inside the existing `ExpeditionJourney.jsx` canvas renderer.
- Added visual-only section activity: desert survey dust and fluttering flags, temple torch glow and small falling stone flecks, catacomb glyph/torch glows, escape dust/rubble motion, and base-camp survey light/flag activity.
- Exposed the pass in the Journey render snapshot fields with `ambientLifePassActive`, `ambientLifeVersion`, `ambientLifeMode`, and `ambientLifeDetailCount`.
- Kept gameplay rules unchanged: no movement, collision, enemy, boss, Guardian Knowledge Challenge, route gate, reward, Base Camp, Excavation, Museum, Lab, Report, save/load, inventory, or evidence systems were intentionally changed.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local CDP smoke opened Ancient Egypt Journey, checked screenshots across Desert Entry, Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance, confirmed the ambient effects are visible but subtle, confirmed Ancient Egypt remained active, and found no console errors.
- Remaining risks/follow-up tasks: ambient effects were visually checked by debug-position smoke rather than a full natural playthrough; if classroom devices struggle, reduce particle/detail counts before changing gameplay.

2026-05-15 follow-up:
- Added three more low-stakes Egypt enemies at the start of Desert Entry after feedback that the opening still felt too empty.
- Added Dune Scarab, Survey Scarab, and Seal Path Scarab with one health, short patrol routes, low damage, and small shard rewards.
- Kept the first boss approach, boss systems, Guardian Knowledge Challenge, route gates, Base Camp, excavation, evidence, save/load, and inventory systems unchanged.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: clean local-storage CDP smoke opened Ancient Egypt Journey, checked the early Desert Entry positions around 365, 535, 625, 705, 890, and 1095 base units, confirmed the expected scarab sprite frames render, visually checked the start route screenshot, and found no console errors.

2026-05-15 follow-up:
- Tuned regular Egypt Journey enemies so they no longer die in one hit.
- Raised most scarabs, snakes, and bats from one health to two health; raised regular rival/guardian-style enemies to two or three health where appropriate.
- Kept player attack/stomp logic, boss logic, Guardian Knowledge Challenge, rewards, route gates, Base Camp, excavation, evidence, save/load, and inventory systems unchanged.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: clean local-storage CDP smoke opened Ancient Egypt Journey, confirmed Pottery Scarab starts at 2/2 health, one player hit reduced it to 1/2 instead of defeating it, and found no console errors.

2026-05-15 follow-up:
- Tuned the China Journey background renderer after a screenshot showed hard horizontal strip seams and a flat lower playfield.
- Kept the existing China parallax atlas and Journey gameplay intact, but changed the China-only canvas draw stack so the sky fills the full backdrop, the mountain/valley/watchtower layers overlap more softly, and the foreground mist is lower-alpha.
- Removed the visible oval haze bands from the first polish pass and replaced them with broad horizon/valley dust gradients, a warmer dig-site ground transition, and subtle contour lines in the lower playfield.
- Updated the render snapshot marker to `china-river-valley-parallax-v3-seam-reduced`.

2026-05-15 follow-up:
- Added a start-of-Journey monster-density overhaul in the existing `journeyLevelData.js` enemy arrays.
- Added four extra early Egypt scarab encounters before the first boss path: Start Path Scarab, Ridge Scarab, Upper Route Scarab, and Guardian Path Scarab.
- Added eight extra early Ancient China river-crab encounters before the first guardian path, using the existing China river-crab sprite family and keeping damage low in the opening stretch.
- Raised the original early China river-crab enemies to two health so the opening has more enemies to defeat rather than mostly one-hit contacts.
- Kept gameplay systems unchanged: no new combat framework, no boss logic changes, no route gate changes, no save/load changes, and no asset replacement.

2026-05-15 follow-up:
- Used the image generation skill to create dedicated Ancient China PNG sprite sheets matching the Egypt asset pattern.
- Added transparent PNG+JSON atlas pairs for China river crabs, watchtower sentries, and clay guardian regular enemies under `public/assets/expedition/enemies/china/`.
- Added a transparent PNG+JSON atlas pair for the China rammed-earth sentinel boss under `public/assets/expedition/bosses/`.
- Updated the Journey sprite loaders so China enemies now prefer the dedicated China sheets and fall back to the older combined China enemy/guardian sheet if needed.
- Updated the China boss sprite pack to use the dedicated boss sheet instead of the combined enemy/guardian sheet.
- Kept gameplay rules, enemy placement, boss data, route gates, Stage Select, save/load, and Egypt assets unchanged in this pass.

2026-05-15 follow-up:
- Tightened the new China enemy and boss atlas JSON regions to alpha-bounded sprite crops instead of full generated cells.
- Confirmed the regular China enemy loader now resolves river crabs, watchtower sentries, and clay guardians to the dedicated China PNG sheets first, with the older combined China atlas retained as fallback.
- Confirmed China guardian bosses resolve through the existing `china-clay-guardian` boss id to the dedicated `china-rammed-earth-sentinel-sprites.png` boss atlas.

2026-05-15 follow-up:
- Added more start-of-Journey platforming in the existing `PLATFORMS` layout: a first survey step, upper survey chip, seal path rest, and warning slab path.
- Added two new early Egypt monster types in the existing `ENEMIES` array: Sand Scorpion/Stone Scorpion and Sand Wisp/Ledge Sand Wisp.
- Added small existing-combat attack patterns for the new monster types without changing player attack, stomp, boss, gate, reward, save/load, inventory, or evidence systems.
- Drew the new monster types through the existing `ExpeditionJourney.jsx` canvas enemy renderer instead of adding a new bitmap/atlas pipeline.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local smoke opened Ancient Egypt Journey, confirmed the debug route is active, checked early positions around 505, 760, 1010, and 1170 base units, and confirmed `scorpion` and `sand-wisp` render in `visibleEnemySpriteFamilies` with two-health enemy states.

2026-05-15 follow-up:
- Journey start-area liveliness pass completed in the existing Journey layout/renderer files.
- Added early route platforms: starter survey stone, broken flag step, upper clue perch, upper seal chip, and guardian lookout perch.
- Added a readable lower/upper route choice: lower route stays direct with mild hazards; upper route gives safer traversal and extra shard/clue opportunities.
- Added micro-rewards near the first 60-90 seconds of play: one easy main-path shard, one optional platform shard, one upper-route shard, and one slightly riskier shard near the unstable stone area.
- Added archaeology markers/clues: route marker, sand-covered seal mark, upper route evidence marker, and expedition note marker.
- Added two mild early hazards with small penalties: a light sand gust line and an unstable stone chip.
- Extended the existing Egypt ambient life pass with extra start-route dust and fluttering survey markers; no new heavy effects or systems were added.
- Empty opening walking was reduced while keeping the first checkpoint clear and the first boss route intact.
- No Stage Select, Base Camp, Excavation, Museum, Lab, Report, save/load, inventory, evidence, route gate, boss, or Guardian Knowledge Challenge systems were changed.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: clean-save smoke opened Ancient Egypt Journey, simulated the first route movement, sampled start positions around 170, 330, 690, 900, 1185, and 1375 base units, confirmed collectibles/shards, mild hazards, ambient life, camera values, route gate state, and Scarab Queen intro still work. Headless browser reported audio autoplay warnings only; no gameplay/runtime exception was found.
- Remaining risks/follow-up tasks: browser verification used deterministic movement/debug sampling rather than a full natural classroom playthrough; the section title card briefly overlays the start-route screenshot before fading, so a later UX pass could shorten the opening card if it still feels intrusive.

2026-05-15 follow-up:
- Upgraded the China Journey background, ground, and platform visuals from prototype-looking strip/block art to project-local PNG assets.
- Used the image generation skill to create a high-quality Ancient China river valley backdrop with layered mountains, river, settlement, watchtowers, rammed-earth walls, reeds, and a natural lower playfield.
- Replaced the old five-strip China background atlas with a single composited 16:9 backdrop in `public/assets/expedition/backgrounds/china-river-valley/china-river-valley-parallax-pack.png` and updated the atlas JSON to `runtimeMode: single-composited-backdrop`.
- Updated the China-only Journey renderer so the composited backdrop is drawn once, avoiding the hard horizontal seams and glass-panel look shown in the screenshot.
- Rebuilt `public/assets/expedition/environment/china-river-valley/china-river-valley-environment-pack.png` with richer riverbank ground, rammed-earth blocks, timber platforms, bamboo bridge pieces, hazards, gates, and archaeology marker art while preserving existing region keys.
- Completed a final China terrain polish pass with worn edges, reeds, embedded stones, rammed-earth texture, plank grain, and bamboo/timber detail so the lower route and platforms no longer read as flat prototype blocks.
- Kept gameplay systems unchanged: no route logic, enemy logic, boss logic, Stage Select, Base Camp, Excavation, Museum, Lab, Report, save/load, inventory, or Egypt asset changes were intentionally made in this pass.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser/asset notes: local dev server returned the new China background PNG and environment PNG with HTTP 200. Full browser visual automation could not be rerun in this turn because CDP was not reachable and the bundled Playwright import is missing `playwright-core`.

2026-05-15 follow-up:
- Used the image generation skill to create a high-quality Ancient China environment atlas covering props, ground floors, platforms, bridge pieces, hazards, gates, and route markers.
- Replaced the China runtime environment PNG while preserving the existing atlas region keys, so platform collision, hazard collision, story props, gates, and Journey layout logic remain unchanged.
- Used the image generation skill to create five distinct Ancient China boss guardians: Clay River Guardian, Bronze Gate Warden, Jade Seal Guardian, Archive Sentry Captain, and Rammed-Earth Sentinel.
- Added separate China boss PNG+JSON atlas pairs for each guardian under `public/assets/expedition/bosses/`.
- Updated the boss sprite loader so each China boss id can load its own dedicated sprite atlas while reusing the existing `clayGuardian*` animation frame contract.
- Updated China Journey boss data so each boss points to its unique `spriteBossId` instead of all five reusing the same clay guardian sprite.
- Kept gameplay systems unchanged: no new boss framework, no boss attack logic rewrite, no route logic changes, no Stage Select changes, and no Egypt boss asset changes were intentionally made.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only; a local atlas key check confirmed all China environment and boss sprite regions are present.
- Browser/asset notes: local dev server returned HTTP 200 for the upgraded China environment PNG and all five China boss PNG sprite sheets. Full browser visual automation could not be rerun because CDP was not reachable.

2026-05-15 follow-up:
- Ran a China boss visual sizing/grounding pass across the shared boss and enemy draw-box helpers.
- Raised boss draw boxes so every China boss renders at about 190px tall, above the required 2x player height threshold (player sprite draw height is 86px; required boss minimum is 172px).
- Raised regular enemy sprite draw boxes to a minimum of 86px tall so small China enemies such as river crabs no longer render smaller than the player.
- Kept boss and enemy art bottom-anchored to the actor feet/ground point so the larger visuals do not float above platforms.
- Tightened the five China boss sprite sheets so rotated/defeated frames have padding and are not clipped by atlas frame edges.
- Validation: static size check confirmed all China bosses are at least 2x player height and sampled China enemies are at least player height; static crop check confirmed no blank or edge-clipped frames in the five China boss atlases.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing Vite runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser/asset notes: local dev server returned HTTP 200 for all five China boss PNG sprite sheets. Full browser visual automation could not be rerun because CDP was not reachable.

2026-05-15 update:
- Added Base Camp Shop to the existing Lost Site Expedition Base Camp screen as an expedition outfitting station, without changing Stage Select, Museum, Lab, Report, boss, save/load, or excavation systems.
- Integrated existing relic shards as the shop currency. Journey shards remain collected in the Journey state, and the Base Camp progression layer stores a persistent shard bank for purchases.
- Added permanent progression support in `src/components/expedition/baseCampShop.js` with first stock for Field Gear, Expedition Upgrades, Cosmetics, and Journal Unlock placeholders.
- Added first permanent archaeology upgrades: Reinforced Boots, Climbing Gloves, and Reinforced Backpack. Effects are intentionally small: higher jump, slightly better air control, reduced knockback baseline support, and a higher stamina cap where purchased.
- Added cosmetic unlock framework for Expedition Hat, Curator Journal Cover, and Bronze Backpack. Visual swapping is not wired yet; cosmetics are tracked as persistent unlocks for a later player-visual pass.
- Added purchase feedback with shard deduction, owned/locked/not-enough-shards states, and an Upgrade Purchased confirmation/glow.
- Added focused Node tests for shop purchase rules, duplicate purchase protection, cosmetic purchases, and upgrade stat effects.
- Progression persistence uses `localStorage` key `archaeology-dig-app:lost-site-expedition:base-camp-progression:v1`, separate from the existing classroom file save/load systems so it does not corrupt current archaeology/Bureau saves.
- Validation: `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: Playwright smoke test launched Ancient Egypt, confirmed Journey shard collection through `render_game_to_text`, opened Base Camp through the existing dev jump hook, purchased Reinforced Boots from a seeded shard bank, confirmed shards dropped from 20 to 5, reloaded, and confirmed the next Journey run included `permanentUpgrades: ["reinforced-boots"]` with a jump multiplier above 1 and no console/page errors.
- Remaining risks/follow-up tasks: cosmetic visual swapping is intentionally deferred; Rope Launcher and Survey Goggles are shop placeholders only until hidden-route and hidden-clue content exists; a full natural classroom playthrough should still check long-route balance after several upgrades are owned.

2026-05-15 update:
- Added a Hidden Routes and Secret Discovery pass to the existing Journey layout/data instead of rewriting `ExpeditionJourney`.
- Added optional exploration paths for Egypt and China: upper survey/watchtower routes, cracked-wall/archive passages, hidden cave ledges, hidden excavation chamber style alcoves, and a collapsed-arch shortcut.
- Added hidden route metadata for future upgrade compatibility: Rope Launcher, Survey Goggles, and Excavation Hammer hooks are recorded but not required yet.
- Added hidden relic shards and civilisation-specific secret collectibles: Egypt Scarab Fragments, Tomb Seals, Papyrus Pages; China Oracle Bone Fragments, Dynasty Tablets, Bronze Seals, and a Hidden Scroll.
- Added discovery reward feedback through existing Journey notices, cinematic cards, glow/route hints, combat-effect text, and success/stinger audio calls.
- Added Journey snapshot/HUD tracking for discovered hidden routes, secret collectible sets, and lore tablet collection so browser tests and future systems can read the progression.
- Kept main progression, route gates, bosses, Base Camp, Stage Select, Excavation, Museum, Lab, Report, save/load, and unrelated screens unchanged except for compatibility/debug snapshot exposure.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: Playwright smoke launched Ancient Egypt Journey, discovered `desert-upper-survey-route`, collected `egypt-scarab-fragment-1`, confirmed Base Camp still opens, launched Ancient China Journey, discovered `river-watchtower-route`, collected `china-oracle-bone-1`, and reported no console/page errors.
- Remaining risks/follow-up tasks: hidden routes are first-pass readable exploration zones, not full upgrade-gated rooms yet; later passes can connect Rope Launcher, Survey Goggles, and Excavation Hammer to unlock/reveal more routes and collection rewards.

2026-05-15 update:
- Added a Journey movement feel polish pass inside the existing `ExpeditionJourney` update/render loop; no Journey rewrite or large layout changes were made.
- Added coyote time and jump buffering with short, readable timing windows so jumps feel fairer without making the player floaty.
- Replaced instant horizontal velocity changes with acceleration/deceleration and slightly smoother air control while keeping the existing top speed.
- Improved landing and jump feel with small dust puffs, landing feedback timing, short camera feedback, and existing land/jump audio hooks.
- Improved attack feel with a brief attack emphasis arc, clearer hit text, slightly stronger hit stop, enemy flash, boss hit feedback, and more eased player knockback.
- Added movement-feel fields to the Journey debug snapshot for verification: coyote time, jump buffer, landing feedback, movement dust, and active movement juice effects.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only.
- Browser notes: local Playwright smoke opened Ancient Egypt Journey, confirmed right movement builds velocity, jump leaves the ground with upward velocity, the player lands safely, attack state advances, movement-feel snapshot fields are present, movement/jump dust effects appear in state, screenshot was visually checked, and no console/page errors were reported.
- Remaining risks/follow-up tasks: the automated browser pass confirms responsiveness and no immediate collision errors, but a longer natural playthrough across later optional platforms should still tune exact acceleration/landing numbers by feel.

2026-05-15 update:
- Added a reward juice and discovery feedback polish pass inside the existing Journey and Base Camp systems; no gameplay rewrite or new progression framework was added.
- Improved relic shard pickups with a small gold pulse, `+1 SHARD` text, and subtle hidden-shard emphasis.
- Improved hidden route and secret collectible discovery feedback with `Secret Route Discovered`, `Hidden Archive Found`, `Secret Found`, and `Collection Piece Recovered` moments using the existing notice/cinematic/audio paths.
- Added collection-set completion tracking and a quiet collection fanfare pulse for completed secret collectible sets.
- Improved checkpoint activation with a blue checkpoint pulse and brief emphasis.
- Improved boss reward feedback with reward reveal/recovered pulses and a stronger but still restrained boss reward banner/badge animation.
- Improved Base Camp shop purchase feedback with `Expedition Upgrade Acquired`, shard-bank pulse, purchase sparkle, and existing shard deduction/persistence behavior.
- Added reward feedback state to the Journey debug snapshot so browser checks can confirm shard, secret, checkpoint, boss reward, upgrade, and collection-completion effects without relying only on visuals.
- Kept Stage Select, Excavation, Museum, Lab, Report, save/load, boss systems, Journey layout size, and unrelated screens unchanged except for compatibility/debug feedback exposure.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local Playwright smoke opened Ancient Egypt Journey, picked up a shard, discovered `desert-upper-survey-route`, collected `egypt-scarab-fragment-1`, activated the Ruined Temple checkpoint, triggered the boss reward feedback path through the dev-only debug hook, jumped to Base Camp, purchased Reinforced Boots, visually checked the purchase feedback screenshot, and reported no console/page errors.
- Remaining risks/follow-up tasks: the boss reward check used a dev-only reward hook instead of a full boss defeat playthrough; collection completion feedback is wired and state-backed, but a later content pass should add more completeable sets per civilisation so students see it more often.

2026-05-16 update:
- Added ability-gated exploration to the existing Journey hidden-route system; no Journey rewrite, open-world map, or main-route progression changes were made.
- Added visible gated route metadata for high ledges, cracked walls, unstable bridges, blocked excavation tunnels, and narrow crawl routes.
- Connected route access to Base Camp upgrades: Rope Launcher, Survey Goggles, Excavation Hammer, and Climbing Gloves.
- Made Rope Launcher and Survey Goggles real purchasable Base Camp upgrades and added Excavation Hammer as a purchasable expedition upgrade.
- Added subtle locked-route tease messaging such as `A narrow route continues above. You may need a Rope Launcher.` and `This wall looks fragile. An Excavation Hammer could open it carefully.`
- Kept gated routes optional: locked routes stay visible but undiscovered, and their hidden shards, lore tablets, and secret collectibles remain unavailable until the matching upgrade is owned.
- Added Journey snapshot data for gated routes: gate type, required upgrade, locked message, reward summary, tease visibility, and unlocked/discovered state.
- Added focused tests for gated route types, required upgrades, shop availability, and route-access upgrade effects.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local Playwright smoke confirmed the Egypt high-ledge route is visible but locked without Rope Launcher, shows a readable clue message, remains undiscovered, and does not grant the secret collectible. With Rope Launcher seeded as a Base Camp upgrade, the same route unlocks, discovers safely, collects `egypt-scarab-fragment-1`, triggers reward feedback, and reports no console/page errors.
- Remaining risks/follow-up tasks: browser verification covered the first Egypt gated route in locked and unlocked states; later playthrough tuning should check every gated route naturally across Egypt and China for reachability and reward pacing.

2026-05-15 update:
- Added a Journey enemy difficulty pass inside the existing enemy setup and shared Journey update loop; no new combat system or duplicate enemy system was added.
- Increased regular enemy health and contact damage from the shared `makeEnemy` helper so Egypt and China enemies are harder to defeat without hand-editing every layout row.
- Increased mini-boss health and damage slightly from the existing `makeMiniBoss` helper so guardian encounters also take more care.
- Tightened the player attack hurtbox against enemies and bosses, so swings must connect more cleanly instead of counting broad edge overlap as a hit.
- Added seeded patrol step variation for regular enemies and bosses: movement speed now shifts in short cycles with occasional brief hesitations, making enemy steps less predictable while staying deterministic per enemy.
- Kept Stage Select, Base Camp, Excavation, Museum, Lab, Report, save/load, route gates, enemy placement, boss placement, and asset wiring unchanged.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: live browser verification was not completed in this pass because the browser automation connector was not available in the current toolset. A short manual or Playwright Journey smoke test is still recommended to tune exact difficulty feel.
- Remaining risks/follow-up tasks: this is a global difficulty bump, so a later classroom-feel pass may need to soften the earliest two start-area enemies if Year 7 players find the opening too punishing.

2026-05-16 update:
- Added a Journey enemy visual grounding pass inside the existing enemy renderer.
- Adjusted linked enemy sprite draw boxes to respect the loaded atlas frame aspect ratio before drawing, reducing hidden `contain` padding that could make visible feet sit above the floor/platform.
- Added a subtle non-bat ground contact dust/lip under active linked enemy sprites so grounded enemies read as planted on the route surface.
- Kept enemy gameplay, placement, health, movement, boss logic, Stage Select, Base Camp, Excavation, Museum, Lab, Report, and asset files unchanged in this pass.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Remaining visual upgrade ideas: regenerate enemy sprite sheets with consistent foot baseline markers, add two or three true walking frames per enemy, add small contact shadows baked into the atlas, and create separate platform/ground color variants so enemies sit naturally on China grass, timber, and rammed-earth surfaces.

2026-05-16 update:
- Implemented the upgraded regular enemy sprite-sheet pass for Lost Site Expedition using the existing Journey enemy atlas pipeline.
- Rebuilt regular enemy PNG/JSON atlases for scarab, snake, bat, looter, looter captain, cursed statue, stone guardian enemy, China river crab, China watchtower sentry, and China clay guardian sentry.
- Added new dedicated transparent PNG/JSON atlases for scorpion and sand wisp so they no longer rely only on fallback canvas drawing.
- Standardised upgraded regular enemy packs around an 8-frame contract: Idle, Walk1, Walk2, Walk3, Windup, Attack, Hit, Defeated.
- Updated `journeyEnemySprites.js` to load the new scorpion and sand wisp packs, use 3-frame walk cycling, and keep existing China/Egypt enemy family routing.
- Added `scripts/generate_enemy_sprite_sheets.py` for repeatable transparent atlas generation and `scripts/validate_enemy_sprite_sheets.py` for static checks covering required regions, alpha, crop edges, and baseline drift.
- Kept gameplay systems unchanged: no enemy placement, health, patrol, hitbox, boss, Stage Select, Base Camp, Excavation, Museum, Lab, Report, or save/load changes were intentionally made.
- Validation: `scripts/validate_enemy_sprite_sheets.py` passed for 13 upgraded atlases; `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing runtime-public-asset warnings only.
- Remaining risk: browser/playtest verification still needs to confirm the new 3-frame cycles and grounded feet in live Egypt and China Journey scenes.

2026-05-16 update:
- Added a Journey world-continuity pass on top of the existing ability-gated exploration work; no Journey rewrite, open-world map, route-size expansion, or section progression changes were made.
- Added distant landmark metadata and lightweight canvas silhouettes for temple towers, future gates, guardian ruins, broken bridge lines, excavation camp lights, Base Camp lanterns, and distant survey mountains.
- Added transition storytelling markers at major section boundaries: collapsed desert road into the temple, warning seals into catacombs, broken supports into the escape route, and camp lights/flags over the final rise.
- Added recurring expedition markers through the existing story-prop renderer, including broken supply carts and base camp supply carts alongside the existing flags, signs, survey markers, camps, lights, and banners.
- Added a small connected-world ambient layer with subtle birds, drifting dust, marker motion, and section-appropriate atmosphere; it records active details in the Journey snapshot for browser verification.
- Added Journey snapshot fields for `worldContinuityPassActive`, continuity version, visible world landmarks, visible transition markers, and connected ambient detail count.
- Added focused tests proving continuity landmarks, transition markers, and recurring expedition markers exist in the canonical Journey data.
- Kept Stage Select, Base Camp, Excavation, Museum, Lab, Report, save/load, route gates, hidden-route rewards, boss systems, and Journey collision rules unchanged in this pass.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local Playwright smoke opened Ancient Egypt Journey, dismissed the mission dossier, sampled Desert Entry, Ruined Temple, Catacombs, Escape Sequence, and Dig Site Entrance using the Journey debug hook, confirmed continuity snapshot fields were active, confirmed section-specific landmarks and transition markers appeared without leaking into unrelated sections, captured `output/world-continuity-clean-shot.png`, and reported no console/page errors.
- Remaining risks/follow-up tasks: browser verification used deterministic debug positioning rather than a natural end-to-end classroom playthrough; the new silhouettes are deliberately subtle, so a later art pass could tune exact opacity per background after student testing.

2026-05-16 update:
- Added a focused reactive environmental interaction pass inside the existing Journey data/render/update loop; no Journey rewrite, large level expansion, or heavy particle system was added.
- Added foreground interaction metadata for breakable crates, loose rocks, hanging ropes, swinging banners, bridge cables, collapsing bridge props, climbable watchtower sections, rippling water, and blowing grass.
- Added lightweight canvas rendering for those elements with small wind/sway/ripple movement so the world feels alive without hiding routes, rewards, hazards, or enemies.
- Added reactive feedback using existing Journey effect and camera-shake systems: crates break when struck, loose rocks and bridge props kick up dust/debris, unstable structures vibrate subtly, and recent interactions are exposed in the Journey snapshot.
- Added timed reactive platform support for selected optional/short-route platforms: unstable ledges and bridge pieces start a countdown when stood on, collapse briefly, then respawn so there is no softlock.
- Added debug snapshot fields for the reactive environment pass, visible interactions, broken interactions, triggered interactions, collapsed platform ids, active platform timers, and recent interactions.
- Added focused Journey data tests covering interactive foreground elements, environmental movement elements, and reactive platform metadata.
- Kept Stage Select, Base Camp, Excavation, Museum, Lab, Report, save/load, boss systems, route gates, enemy logic, and main Journey progression unchanged.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only.
- Browser notes: local Playwright smoke opened Ancient Egypt Journey, confirmed `reactiveEnvironmentPassActive`, saw the desert breakable crate in `visibleEnvironmentInteractions`, broke the crate with the existing attack input, armed the escape falling-stair platform, confirmed it collapsed into `collapsedPlatformIds`, confirmed it respawned safely, captured `output/reactive-platform-collapse-smoke.png`, and reported no console/page errors.
- Remaining risks/follow-up tasks: the browser pass used deterministic debug positioning for the escape platform; a natural full-route playthrough should tune exact collapse delays and decide whether later China-specific foreground pieces need bespoke art.

2026-05-16 update:
- Checked the new Base Camp upgrade wiring and completed a focused polish pass without changing Journey gameplay, route placement, enemy balance, Stage Select, Excavation, Museum, Lab, Report, or save/load.
- Clarified permanent upgrade card wording so route tools explain their real use: Rope Launcher for high ledges, Survey Goggles for faint safe-route clues, Excavation Hammer for cracked wall routes, and Climbing Gloves for unstable bridge routes.
- Added active-kit summary chips to the Base Camp shop so purchased permanent upgrades are visible as fitted expedition gear instead of only appearing as owned buttons.
- Added route-use tags to upgrade cards so optional-route unlocks are easier to spot in the shop.
- Updated locked Journey hidden-route labels to use the shared shop display names, so labels read like `Needs Rope Launcher` instead of relying on raw upgrade id formatting.
- Added a near-route optional-reward hint line for locked hidden routes so students understand the route is optional and worth returning to later.
- Added focused Base Camp shop tests for route upgrade labels, route unlock metadata, active summary metadata, and classroom-readable display names.
- Validation: `node --test src\components\expedition\baseCampShop.test.js` passed; `node --test src\components\expedition-journey\journeySecrets.test.js` passed; bundled Python `scripts\validate_enemy_sprite_sheets.py` passed for 13 upgraded enemy atlases; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local Vite dev server started on `http://127.0.0.1:5175/Archaeology-Dig-App/` and returned HTTP 200. Full browser automation was unavailable in this session because the Playwright package was not available to the Node REPL.
- Remaining risk/follow-up tasks: a human or browser-automation visual pass should confirm the Base Camp chip wrapping and locked-route hint placement at classroom projector sizes before these upgrade UI changes are considered fully visually signed off.

2026-05-16 update:
- Fixed the reported issue where China Journey enemies were present but not visibly readable against the upgraded background.
- Kept enemy placement, health, damage, patrol, boss systems, route locks, Stage Select, Base Camp, Excavation, Museum, Lab, Report, and save/load unchanged.
- Added an enemy visibility assist inside the existing linked enemy sprite renderer: the draw state now resets before enemy art, contact shadows remain renderer-side, and each atlas enemy gets a low-opacity high-contrast silhouette under the PNG so it cannot disappear against detailed scenery.
- Exposed `enemyVisibilityAssistActive` in the Journey debug snapshot for browser verification.
- Browser verification: launched Ancient China Journey on local Vite, jumped to the early river route, confirmed `visibleEnemySpriteFamilies: ["riverCrab"]`, confirmed live frame states such as `riverCrabWalk1`, captured `output/enemy-visibility-china-route-after-fix.png`, and saw river crab enemies visibly grounded on the route with no console/page errors.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; bundled Python `scripts\validate_enemy_sprite_sheets.py` passed for 13 upgraded enemy atlases; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only.
- Remaining risk/follow-up tasks: the enemy art is now readable, but the generated river crab scale is quite large in the opening route. A later visual tuning pass could reduce crab scale slightly while preserving the new no-vanish visibility guard.

2026-05-16 update:
- Replaced the placeholder-looking China river crab sheet with a real polished PNG sprite sheet generated through the imagegen workflow.
- Removed the flat chroma-key background locally, normalised the sheet into eight transparent fixed cells, and rewrote `china-river-crab-sprites.json` to point at the new `riverCrabIdle`, `riverCrabWalk1`, `riverCrabWalk2`, `riverCrabWalk3`, `riverCrabWindup`, `riverCrabAttack`, `riverCrabHit`, and `riverCrabDefeated` regions.
- Kept the existing enemy atlas pipeline and route/enemy gameplay unchanged.
- Removed the visibility-assist silhouette for river crabs specifically, so the live China route now shows the actual PNG crab art rather than the earlier shape-like support layer.
- Browser verification: launched Ancient China Journey, jumped to the early river route, confirmed `enemySpritesLoaded: true`, `enemySpriteFallbackActive: false`, `visibleEnemySpriteFamilies: ["riverCrab"]`, and live `riverCrabWalk1` frame states, then captured `output/china-river-crab-real-png-wired-clean.png`.
- Validation: `scripts\validate_enemy_sprite_sheets.py` passed for 13 upgraded enemy atlases; `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Remaining risk/follow-up tasks: the crab PNG is now real art and wired correctly; a later pass can tune exact crab draw scale if the classroom screen feels too busy.

2026-05-16 update:
- Added Journey-only mouse cursor auto-hide while actively playing.
- The cursor now hides after 1.2 seconds of no mouse movement in the Journey screen, reappears on mouse movement/click, and remains visible while the Journey pause menu is open.
- Kept Stage Select, Base Camp, Excavation, Museum, Lab, Report, and other screens unchanged.
- Browser verification: launched Ancient China Journey on `http://127.0.0.1:5176/Archaeology-Dig-App/`, confirmed the Journey wrapper starts with a normal cursor, switches to `cursor: none` after idle, returns to normal after mouse movement, and stays normal when paused. Captured `output/cursor-auto-hide-journey-check.png`.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed after tightening the effect logic; `npm.cmd run build` passed with existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Remaining risk/follow-up tasks: cursor hiding is currently scoped to Journey gameplay only; excavation/map phases still keep the cursor visible because they use mouse selection.

2026-05-16 update:
- Added a focused combat impact and encounter-intensity pass inside the existing Journey combat loop; no combat rewrite, enemy health spike, boss rewrite, or unrelated screen change was made.
- Improved player attack feedback with a brighter sweep/trail, stronger impact pulses, slightly longer hit pause, stronger camera shake, and clearer counter-hit/clear text when enemies or bosses are struck.
- Improved enemy danger readability by letting regular enemies use the existing shield/open/windup tell renderer, strengthening warning reach cues, and exposing combat readability state in the Journey snapshot.
- Improved knockback feel for player, regular enemy, stomp, and boss impacts while keeping the values small enough to avoid softlocks or frustration.
- Added restrained stamina danger feedback: low stamina now records danger state, shows a subtle red edge pulse, and can emit a `LOW STAMINA` feedback pulse after damage.
- Added encounter-pressure metadata to selected Egypt and China enemies so they guard optional routes/rewards, upper paths, bridge caches, and final approaches without blocking the main route.
- Added pressure-enemy visual grounding rings and `WATCH` feedback when those enemies begin a windup near the player.
- Added Journey snapshot fields for `combatIntensityPassActive`, combat intensity version, readability mode, visible pressure enemies, danger feedback, and enemy pressure metadata.
- Added focused Journey data tests proving pressure encounters guard optional rewards/routes across Egypt and China.
- Kept Stage Select, Base Camp, Excavation, Museum, Lab, Report, save/load, boss rewards, route gates, and level size unchanged except for compatibility/debug snapshot exposure.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only.
- Browser notes: local Edge/Playwright smoke opened Ancient Egypt Journey, used the existing Journey debug hook to sample the first pressure enemy, confirmed combat intensity snapshot fields, visible pressure enemy tracking, enemy windup pressure feedback, player damage feedback, attack sweep visuals in `output/combat-intensity-smoke.png`, and no console/page errors.
- Remaining risks/follow-up tasks: the browser pass used deterministic debug positioning around the first Egypt pressure encounter rather than a full natural combat playthrough; a later classroom tuning pass should verify boss combat and each China pressure encounter in motion.

2026-05-16 update:
- Added a dynamic expedition world and environmental storytelling pass inside the existing Journey data/render/update loop; no open-world rewrite, Journey system rewrite, or level-size expansion was made.
- Added card-free dynamic environmental events for distant rockfalls, dust gusts, birds scattering, moving fog, distant ruin collapse, glowing shrine effects, and unstable excavation areas.
- Added lightweight canvas rendering for those events so they feel alive without blocking hazards, routes, rewards, or enemies.
- Added more environmental storytelling props: damaged field equipment, warning banners, collapsed tower remains, old journal cache, sealed blocked tunnel, destroyed bridge remains, and broken excavation tools.
- Added more world mystery through distant/unreachable landmarks: hidden watchtower silhouette, distant shrine glow, blocked tunnel glimpse, and distant collapsed ruin.
- Strengthened hidden-route discovery atmosphere by triggering a matching subtle dynamic event when a secret route is found, while keeping the existing `Hidden Archive Found` / `Secret Route Discovered` reward flow.
- Added Journey snapshot fields for `dynamicWorldPassActive`, dynamic world version, visible dynamic world events, active dynamic world event, and dynamic environment event state.
- Added focused Journey data tests for the new dynamic event types, storytelling props, shrine/tunnel landmarks, and card-free atmosphere behavior.
- Kept Stage Select, Base Camp, Excavation, Museum, Lab, Report, save/load, boss systems, route gates, enemy systems, and main Journey progression unchanged.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only.
- Browser notes: local Edge/Playwright smoke opened Ancient Egypt Journey, triggered the desert distant rockfall and Ruined Temple shrine glow with the existing Journey debug hook, confirmed dynamic world snapshot fields and visible event tracking, captured `output/dynamic-world-rockfall-smoke.png` and `output/dynamic-world-shrine-smoke.png`, and reported no page errors. One audio source warning appeared during the shrine stinger path, matching existing unsupported-audio behavior rather than a new rendering failure.
- Remaining risks/follow-up tasks: browser verification sampled two dynamic events using deterministic debug positioning rather than a full natural route playthrough; later tuning should sample every event in Egypt and China once the wider route content settles.

2026-05-16 visibility follow-up:
- Increased dynamic world event visibility after user feedback that the new features were hard to see.
- Added persistent low-key previews for nearby dynamic world events while they are in the viewport, so players can notice rockfalls, fog, shrine glows, and unstable areas before they hit the exact trigger point.
- Widened dynamic event trigger windows and added crossing detection so normal movement is less likely to skip an event between frames.
- Strengthened dynamic event alpha/scale for rockfall dust, dust gusts, moving fog, shrine glows, ruin collapse, birds scattering, and unstable excavation cracks while keeping them non-blocking and non-chaotic.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only.
- Browser notes: local Edge/Playwright smoke confirmed the desert rockfall is visible as a pre-trigger preview, then triggers reliably, with `visibleDynamicWorldEvents` and `activeDynamicWorldEvent` populated and no console/page errors. Screenshot captured at `output/dynamic-world-visible-preview-smoke.png`.

2026-05-16 visibility follow-up:
- Made the first Egypt dynamic world moment easier to see by firing a dust gust near the opening survey markers before the subtler bird scatter event.
- Browser notes: local Edge/Playwright smoke opened Ancient Egypt Journey, confirmed early dynamic previews `desert-first-dust-preview` and `desert-start-birds-scatter`, confirmed active event `desert-first-dust-preview`, captured `output/dynamic-world-early-dust-visible-smoke.png`, and reported no console/page errors.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.

2026-05-16 UI/visual/UX polish pass:
- Continued the existing Journey polish path rather than creating a new UI or gameplay system.
- Wired the painted dynamic-world effect PNG through the existing Journey renderer with a canvas fallback, and exposed loaded/asset-mode fields in the Journey debug snapshot.
- Added static test coverage for the dynamic-world painted effect sheet path and required atlas regions.
- Polished Journey feature cards so section/location messages are smaller, rounded, semi-transparent, and less blocking over the upgraded backgrounds.
- Improved locked hidden-route labels with readable backing pills and a clearer optional-reward hint, so `Needs Rope Launcher` and similar route guidance no longer blends into busy scenery.
- Kept Stage Select, Base Camp, Excavation, Museum, Lab, Report, save/load, enemy stats, boss systems, platforms, hazards, and route layout unchanged.
- Browser notes: local Playwright smoke opened Ancient China Journey, confirmed the smaller rounded section banner and readable `Needs Rope Launcher` route pill, then opened Ancient Egypt Journey and confirmed painted dynamic-world effects loaded with visible dust/birds events. Screenshots captured at `output/ui-polish-china-start-after.png`, `output/ui-polish-china-locked-route-after.png`, and `output/ui-polish-egypt-dynamic-world-after.png`.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; bundled Python `scripts\validate_enemy_sprite_sheets.py` passed for 13 upgraded enemy atlases; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.

2026-05-16 dynamic-world visual clarity follow-up:
- Responded to feedback that the new painted dust and bird effects looked confusing and frozen over the China Journey background.
- Limited painted dynamic-world sheets to static-friendly moments only: shrine glows, rockfalls, and distant ruin collapses.
- Returned dust gusts, bird scatter, moving fog, and unstable excavation cues to the existing procedural motion renderer so they read as moving atmosphere instead of suspended cutout art.
- Kept gameplay, enemy logic, platforms, hazards, route gates, Stage Select, Base Camp, Excavation, Museum, Lab, Report, and save/load unchanged.
- Browser notes: local Playwright smoke opened Ancient China and Ancient Egypt Journey starts, triggered the early dynamic world events, confirmed the large frozen dust/bird cutouts were gone, confirmed no console/page errors, and captured `output/china-dynamic-world-motion-fix.png` plus `output/egypt-dynamic-world-motion-fix.png`.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with existing runtime-public-asset warnings only.
- Browser notes: local Edge/Playwright smoke opened Ancient Egypt Journey, confirmed `dynamicWorldAssetsLoaded: true`, confirmed `dynamicWorldAssetMode: painted-raster-effects`, confirmed active early dust-gust event, captured `output/dynamic-world-painted-asset-smoke-warm.png`, and reported no console/page errors.
- Remaining risks/follow-up tasks: the Egypt dust/birds/shrine/rockfall assets are now visible high-quality raster art; future China-specific dynamic world moments should get their own matching Ancient China asset sheet rather than reusing Egypt art.

2026-05-16 gameplay audit:
- Inspected the current Journey source of truth without editing gameplay code: `ExpeditionJourney.jsx`, `journeyLevelData.js`, `journeyUtils.js`, `ExpeditionMode.jsx`, and `baseCampShop.js`.
- Confirmed first-route rushing has no hard pre-boss fight gate, but the natural no-attack browser rush was stopped by repeated opening-enemy contact and knockback before reaching the first mini-boss.
- Confirmed enemy contact currently removes stamina, records the damage source, applies hit/knockback feedback, and triggers Field Rescue only when stamina reaches zero.
- Confirmed the first route gate requires the section objective, Scarab Queen defeat, Brush Handle recovery, and 4 relic shards; reaching the gate without those still reports all missing requirements.
- Confirmed relic shards are used for route gates during Journey and are banked into Base Camp supplies after reaching Base Camp; Base Camp shop purchases can then add permanent upgrades for future Journey runs.
- Confirmed normal Journey tools feed the excavation field kit, while boss tool pieces are gate/progression keys and reward feedback items.
- Browser smoke used local Vite on `http://127.0.0.1:5176/Archaeology-Dig-App/`: started Journey, ran a no-attack rush, sampled enemy hit consequence, verified Brush/shard/map-tablet collection through Journey state, triggered the first Guardian Knowledge Challenge, and checked the first gate missing requirements.
- Validation: `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt asset warnings only.
- Safest next gameplay fixes: make the first route's pressure clearer without trapping the player in repeated knockback, make shard/tool collection purpose more explicit in the HUD/Base Camp handoff, and add a stronger stamina-failure recovery explanation before changing difficulty.

2026-05-16 opening enemy tuning:
- Tuned the Start Path Scarab only, keeping the existing Journey data/update/combat architecture and leaving boss systems unchanged.
- Moved the first scarab slightly later, shortened and slowed its patrol, gave it a slower/shorter first charge tell, and reduced only its player knockback so it teaches danger without repeatedly bouncing the player backward.
- Browser smoke confirmed: the first scarab can be fought and defeated cleanly, a timed jump can pass it with no stamina loss, and the early upper/lower route remains usable while later enemies still provide pressure.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt asset warnings only.
- Screenshots captured: `output/opening-scarab-fight-clean-after.png`, `output/opening-scarab-jump-past-after.png`, and `output/opening-scarab-alternate-route-after.png`.

2026-05-16 Journey item purpose clarity:
- Clarified Journey pickup and reward wording without adding item systems or changing education quiz content.
- Relic shard pickups and enemy shard rewards now tell students that shards are spent at Base Camp; Base Camp deposit feedback now says supplies were updated for shop upgrades.
- Field tool pickups now say the tool was added and will help during excavation; HUD copy labels the field kit as excavation prep.
- Boss tool piece reward copy now names the excavation kit connection and the boss reward banner labels progress as excavation kit pieces.
- Added a short item-purpose notice timer so pickup/reward purpose messages are not immediately overwritten by enemy wind-up or environmental notices.
- Browser smoke confirmed the shard pickup notice, field tool notice, boss reward banner copy, Base Camp shop handoff text, and Base Camp relic-shard deposit feedback on local Vite.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt asset warnings only.
- Screenshots captured: `output/item-purpose-field-tool-smoke.png`, `output/item-purpose-shard-smoke.png`, `output/item-purpose-boss-piece-smoke.png`, and `output/item-purpose-base-camp-smoke.png`.

2026-05-16 stamina danger and Field Rescue clarity:
- Improved Journey stamina messaging without changing damage values, checkpoint logic, rescue rules, or adding a new failure system.
- Enemy and hazard damage notices now include the stamina loss amount, and low stamina appends `Stamina low - avoid another hit.`
- Added a short damage-notice protection timer so hazard/enemy damage feedback is not immediately overwritten by routine enemy wind-up messages.
- Added a low-stamina warning line to the Journey stamina HUD when stamina is in the danger range.
- Field Rescue now explains the setback clearly: the player was forced back to the last checkpoint and can recover and try again; the button now reads `Retry from Checkpoint`.
- Browser smoke confirmed hazard stamina loss, enemy hit wording, low-stamina warning state, Field Rescue overlay, and retry from checkpoint restoring stamina to 40 at Desert Entry.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt asset warnings only.
- Screenshots captured: `output/stamina-hazard-damage-smoke.png`, `output/stamina-low-warning-smoke.png`, `output/stamina-field-rescue-smoke.png`, and `output/stamina-retry-checkpoint-smoke.png`.

2026-05-16 Journey platformer audit and short-hop tuning:
- Audited the current Journey Platformer source of truth before changing it.
- Confirmed the Journey platformer already lives in `src/components/ExpeditionJourney.jsx` with level data/helpers/assets in `src/components/expedition-journey/`, and it is launched through the existing `ExpeditionMode.jsx` Journey -> Base Camp -> Excavation flow.
- Added the first small feel improvement in the canonical Journey movement loop: releasing jump early now cuts upward velocity for more responsive short hops, while holding jump preserves the existing full-height jump.
- Exposed the jump-cut feedback timer and multiplier in the existing Journey snapshot for browser/state checks.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed; the known runtime-resolution warnings for two Egypt excavation image paths still appear.
- Browser verification on `http://127.0.0.1:5173/Archaeology-Dig-App/` confirmed Menu -> Start Expedition -> Ancient Egypt Journey -> Begin Expedition, the existing canvas visuals still render, early jump release cuts upward velocity, the Journey snapshot exposes `jumpCutFeedbackTimer`, and no page errors appeared.
- Remaining risk: this was a short first-screen jump feel check, not a full end-to-end Journey route playtest.

2026-05-16 Journey Discovery Entrance pass:
- Continued from the existing Journey platformer audit and short-hop tuning, keeping the canonical `ExpeditionJourney.jsx` / `journeyLevelData.js` / `journeyUtils.js` architecture.
- Upgraded the final Journey endpoint from a small exit marker into a named `Discovery Entrance Found` moment with a sealed tomb entrance, buried stairway styling, lamps, glow, dust, a discovery pulse, and a short reveal beat.
- Preserved the existing Journey -> Base Camp handoff: after the reveal timer finishes, the same `onComplete([...fieldKit])` callback still opens Base Camp and deposits relic shards through the existing Base Camp shop progression.
- Kept the optional route/reward systems unchanged and verified Egypt's `desert-upper-survey-route` still unlocks through the existing route gate/upgrades and rewards the `Scarab Fragment`.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local Chrome/Playwright smoke opened Ancient Egypt Journey, confirmed the optional route/reward state, triggered the Discovery Entrance reveal, confirmed the Base Camp checklist appeared after the reveal, and reported no console/page errors.
- Screenshots captured: `output/journey-egypt-optional-route-reward-after.png`, `output/journey-egypt-discovery-entrance-reveal-after.png`, and `output/journey-egypt-discovery-base-camp-handoff-after.png`.

2026-05-16 Journey opening expedition-life pass:
- Preserved the existing Ancient Egypt Journey visual identity and extended only the current Journey renderer/data.
- Added subtle opening background-life details through the existing `drawEgyptAmbientLife` pass: distant tent flap movement, a small crate carrier, a kneeling surveyor, roped dig activity, and a distant worker silhouette.
- Added two low-key opening story props through the existing `STORY_PROPS` pipeline: a footprint trail and a survey rope line. These are decorative cues only and do not block movement or create new gameplay systems.
- Kept the current opening platforms, relic shard layout, hidden upper route, checkpoint logic, Base Camp, excavation, lab, museum, report, Bureau, save/load, and claim/result systems unchanged.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local Chrome/Playwright smoke opened Ancient Egypt Journey, confirmed `ambientLifeMode: desert-survey-camp-life`, played the opening movement/jump stretch, collected the first relic shard, confirmed the Desert Survey Checkpoint still activates, and reported no console/page errors.
- Screenshots captured: `output/journey-egypt-opening-life-start.png`, `output/journey-egypt-opening-life-movement.png`, `output/journey-egypt-opening-first-reward.png`, and `output/journey-egypt-opening-checkpoint.png`.
- Note: the bundled `develop-web-game` Playwright client could not run because its skill-folder script could not resolve the `playwright` package on this machine, so verification used the working local Playwright browser path instead.

2026-05-16 Journey player presentation polish:
- Inspected the existing Journey player rendering path before editing: the archaeologist is drawn from `public/sprites/archaeologist-walk-cycle.png` when loaded, with a canvas fallback and a separate khopesh/field-tool weapon atlas in `public/assets/expedition/player/`.
- Extended only the current Journey animation resolver and renderer. Added visual states for cautious survey walk, normal walk, run, jump, fall, land, attack, and hurt, while leaving movement physics and hitboxes unchanged.
- Improved the weapon presentation through the existing khopesh drawing path with wind-up/swing/recoil trails, attack lean, landing squash, run/survey posture, and a short hit spark on confirmed enemy or boss hits.
- Kept Base Camp, excavation, inventory, evidence, boss, route-gate, pickup, hazard, and Journey completion systems unchanged.
- Validation: `node --test src\components\expedition-journey\journeySecrets.test.js` passed; `node --test src\components\expedition\baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt asset warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser notes: local browser smoke opened Menu -> Start Expedition -> Ancient Egypt -> Begin Expedition, checked idle, run, short-hop/fall, attack, moving attack, first collectible, and a Start Path Scarab hit/defeat. No page errors appeared.
- Screenshots captured: `output/journey-player-polish-smoke-idle.png`, `output/journey-player-polish-smoke-run.png`, `output/journey-player-polish-smoke-jump-fall.png`, `output/journey-player-polish-smoke-swing.png`, `output/journey-player-polish-smoke-forward-attack.png`, and `output/journey-player-polish-smoke-hit-spark.png`.

2026-05-16 first optional upper-route readability:
- Kept the change inside existing Journey data systems only: platforms, relic shards, hidden route data, and story props.
- Made the first Ancient Egypt upper route read as an immediately discoverable broken-stone step-up instead of an opening Rope Launcher lock.
- Softened the first upper-step spacing, moved one visible relic shard into the climb line, and added a broken-stone story prop cue below the route.
- Tightened the hidden-route discovery rectangle so normal lower-path movement does not accidentally map the route.
- Browser smoke confirmed the lower path stays clear, the upper route can be discovered, the route reward can be collected, and the player can return to the main path without leaving Journey.

2026-05-16 Broken Ruins Route platformer section:
- Continued the Ancient Egypt Journey platformer work inside the canonical Journey files only.
- Kept the newly generated Egypt archaeologist hero atlas as a prototype/reference asset only; Egypt Journey now uses the existing legacy archaeologist strip as the live player path, while the generated atlas file remains in `public/assets/expedition/player/` for possible later technical review.
- Added a new small Broken Ruins Route after the first upper-route reward area and before the Scarab Queen arena, using existing platforms, hazard, relic shard, story prop, environment event, and environment atlas systems.
- Added three readable terrain pieces: `broken ruins route entry`, `half-buried lintel`, and `ruins recovery step`.
- Added one light existing-system hazard, `broken-ruins-loose-stones`, mapped to the current falling-rocks/falling-roof asset language.
- Added one optional shard on the route plus collapsed-stone, trail-marker, and survey-rope cues to make the path read as half-buried ruins rather than a new mechanic.
- Added Journey data tests proving the route stays in existing systems and does not become a hidden route or duplicate system.
- Browser smoke opened Menu -> Start Expedition -> Ancient Egypt -> Begin Expedition, sampled the opening, confirmed the lower path does not discover the first upper route, confirmed the upper route/reward still works, confirmed the Broken Ruins shard can be collected, confirmed the loose-stone hazard is visible in state, and confirmed moving onward reaches the existing Scarab Queen sequence rather than a dead end.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Screenshots captured: `output/broken-ruins-resmoke-opening.png`, `output/broken-ruins-resmoke-lower-no-hidden.png`, `output/broken-ruins-resmoke-upper-route.png`, `output/broken-ruins-resmoke-entry.png`, `output/broken-ruins-resmoke-shard.png`, `output/broken-ruins-resmoke-hazard.png`, and `output/broken-ruins-forward-focused.png`.
- Remaining risk/follow-up: browser verification used debug positioning for mid-route checkpoints to avoid replaying the full guardian fight chain. A later pass should naturally defeat the Scarab Queen and continue from Broken Ruins into the temple to tune the handoff pace.

2026-05-16 Temple Threshold Climb platformer section:
- Continued the Ancient Egypt Journey platformer work immediately after the Scarab Queen gate, inside the existing Journey data/render/test systems only.
- Added a short `Temple Threshold Climb` after the desert seal: a safe threshold plinth, the existing temple plinth, and a switch-teaching plinth leading toward Switch 1.
- Added a visible three-shard reward line that points the player upward and forward toward the existing first-switch objective without adding a new reward system.
- Added a non-lethal `temple-threshold-hairline-crack` cue that uses a time-only penalty and a cracked-ground visual, preparing players for the harder temple floor crack ahead.
- Added existing-system story cues: a switch trail marker and fine crack warning marks, keeping the temple threshold readable without cluttering the background.
- Kept the prototype/generated archaeologist atlas out of the live Egypt player path; browser state still reports `egypt-legacy-archaeologist`, `playerSpriteAtlasPath: null`, and `legacy-strip`.
- Added Journey data tests for the threshold plinths, reward line, non-lethal crack cue, story props, event, and connection to the existing `switch-1` objective marker.
- Browser smoke opened Menu -> Start Expedition -> Ancient Egypt -> Begin Expedition, sampled Broken Ruins through the scaled post-gate temple threshold, confirmed the new section is in `Ruined Temple`, confirmed the crack cue appears as `temple-threshold-hairline-crack` with `{ time: 3 }`, confirmed the reward line shards can be collected, and confirmed moving forward reaches the existing harder `temple-floor-crack` area with no page errors.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Screenshots captured: `output/temple-threshold-scaled-gate-context.png`, `output/temple-threshold-scaled-threshold-entry.png`, `output/temple-threshold-scaled-crack-cue.png`, `output/temple-threshold-scaled-reward-line.png`, `output/temple-threshold-scaled-switch-approach.png`, and `output/temple-threshold-scaled-forward-harder-temple.png`.
- Remaining risk/follow-up: browser verification used scaled debug positioning past the Scarab Queen gate, not a natural full Scarab Queen defeat run. A later tuning pass should play the full boss-to-temple handoff and adjust pacing if it feels too abrupt.

2026-05-16 Sandfall / Collapsing Stone platformer section:
- Added one hazard-focused Ancient Egypt Journey section after the Broken Ruins / Scarab gate flow, in the Ruined Temple approach before the route gets more demanding.
- Kept the work in existing Journey systems only: platform data, hazard data, relic shards, story props, environment events, environment atlas hazard mappings, and Journey data tests.
- Added three terrain pieces: `sandfall warning slab`, `collapsing column step`, and `buried recovery stair`.
- Added a readable hazard sequence: `sandfall-warning-dust` as the safe warning cue, `sandfall-collapsing-stones` as the main falling-stone hazard, and `sandfall-soft-pit` as a forgiving recovery slowdown.
- Added one optional visible relic shard near the danger line, plus a warning marker, broken-column sandfall cue, and survey-rope boundary to communicate unstable ruins without clutter.
- Corrected the first placement after browser smoke showed it overlapped the Scarab Queen arena; the final placement sits in Ruined Temple so the boss intro no longer steals the hazard beat.
- Preserved the live Egypt player path: browser state still reports `egypt-legacy-archaeologist`, `playerSpriteAtlasPath: null`, and `legacy-strip`.
- Browser smoke opened Menu -> Start Expedition -> Ancient Egypt -> Begin Expedition, confirmed lower-path movement does not discover the upper route, confirmed Broken Ruins still reads, confirmed the Sandfall warning/collapsing/recovery hazards are visible in Ruined Temple, confirmed the optional shard can be collected, confirmed forward continuation, and reported no console/page errors.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Screenshots captured: `output/sandfall-corrected-lower-no-hidden.png`, `output/sandfall-corrected-broken-ruins-context.png`, `output/sandfall-corrected-temple-threshold-context.png`, `output/sandfall-corrected-warning-cue.png`, `output/sandfall-corrected-collapsing-stones.png`, `output/sandfall-corrected-recovery-step.png`, `output/sandfall-corrected-forward-clear.png`, and `output/sandfall-corrected-reward-pickup.png`.
- Remaining risk/follow-up: this used debug positioning for the post-gate temple segment. A later natural playthrough should defeat Scarab Queen and walk into the temple to tune how the Sandfall beat feels after the boss.

2026-05-16 Guardian quiz decoupling:
- Preserved the existing guardian knowledge question bank and challenge mapping in `journeyLevelData.js` for future reuse.
- Stopped boss fights from using the quizzes by adding a single disabled flag in `ExpeditionJourney.jsx`; boss encounters can still show their Guardian Encounter intro/domain but no longer create `pendingGuardianChallenge` or open the quiz overlay.
- Added a Journey data test proving the quiz content still exists while boss-fight quiz wiring is disabled.
- Browser smoke opened Ancient Egypt Journey and triggered the Scarab Queen encounter; the Guardian intro/domain appeared, `guardianKnowledgeChallenge` stayed `null`, quiz results/modifiers stayed empty, and no `.guardian-challenge-overlay` rendered.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Screenshots captured: `output/boss-no-quiz-intro.png` and `output/boss-no-quiz-after-intro.png`.

2026-05-16 Egypt regular enemy sprite quality correction:
- Confirmed the blue beetles seen locally and on the live site were not a missing-asset fallback; they were the current `desert-scarab-sprites.png` regular enemy atlas being loaded as designed.
- Kept the low-quality generated player sheet out of the final Egypt player path and also withheld the rough generated Egypt creature atlases for scarabs, snakes, scorpions, and sand wisps from live regular enemy drawing.
- Preserved the existing enemy systems: boss sprites, looter sprites, China enemy sprites, combat, hitboxes, patrols, hazards, rewards, Base Camp, excavation, lab, museum, and report flows remain on the same paths.
- Extended the existing linked/canvas enemy drawing fallback for regular scarabs and snakes so the opening enemies stay visible and readable without the bright cyan placeholder look.
- Added a Journey test that locks the rough Egypt creature sprite sheets out of live play until better production-quality replacements are ready.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Browser smoke opened Menu -> Start Expedition -> Ancient Egypt -> Begin Expedition, positioned at the first regular scarab enemies, confirmed the bright blue beetle sprite sheet no longer appears, and reported no console/page errors.
- Screenshot captured: `output/enemy-sprite-quality-first-enemies.png`.

2026-05-16 restored high-quality Egypt enemy sprites:
- Recovered the older high-quality Egypt enemy sheets from Git history before commit `5f3ea29` overwrote them with tiny placeholder-style sprite files.
- Restored `desert-scarab-sprites.png`, `sand-snake-sprites.png`, `small-enemy-sprites.png`, and `temple-bat-sprites.png`.
- Updated their atlas JSON files with current renderer aliases: scarab crawl frames now also provide `scarabWalk1/2/3`, snake slither frames now also provide `snakeWalk1/2/3`, and bat flap frames now also provide `batWalk1/2/3`.
- Re-enabled restored scarab and snake sprite packs in live Egypt Journey while keeping rough-only scorpion and sand-wisp sheets withheld until better production art exists.
- Added/updated Journey tests so the restored high-quality scarab and snake sheets are expected, and rough-only creature sheets remain blocked.
- Browser smoke opened Menu -> Start Expedition -> Ancient Egypt -> Begin Expedition, confirmed restored scarab sprites load in the opening and restored snake sprites load near the first snake route with no missing enemy sprite assets or console/page errors.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Screenshots captured: `output/restored-egypt-scarab-smoke.png` and `output/restored-egypt-snake-smoke.png`.

2026-05-16 Egypt player atlas wiring:
- Switched Ancient Egypt Journey from the legacy four-frame archaeologist strip to the prepared player atlas in `public/assets/expedition/player/archaeologist-hero-spritesheet.json`.
- Kept the existing row-aware player renderer and kept `public/sprites/archaeologist-walk-cycle.png` as the fallback source if the atlas fails to load.
- Updated the Journey test so Egypt now expects `egypt-archaeologist-hero`, `PLAYER_HERO_SPRITE_ATLAS_JSON`, and the legacy fallback instead of the previous legacy-only path.
- Browser smoke opened Menu -> Start Expedition -> Ancient Egypt -> Begin Expedition and confirmed `playerSpriteCharacterId: egypt-archaeologist-hero`, `playerSpriteAtlasPath: assets/expedition/player/archaeologist-hero-spritesheet.json`, `playerSpriteVisualMode: hero-atlas`, and `playerHeroSpriteLoaded: true`.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Screenshots captured: `output/egypt-player-atlas-idle.png` and `output/egypt-player-atlas-run.png`.

2026-05-16 Egypt player sprite overlap fix:
- Confirmed the apparent player flashing/double-rendering was caused by the new Egypt hero atlas being drawn at the same time as the older external khopesh weapon layer.
- Added draw metadata to `archaeologist-hero-spritesheet.json` so the Egypt atlas can suppress the external weapon and runtime attack arc through the existing player renderer.
- Updated `ExpeditionJourney.jsx` to respect a full-atlas `suppressExternalWeapon` flag while keeping the existing attack-only suppression path for other atlases.
- Added a Journey test so the Egypt player atlas must keep the weapon/arc suppression metadata.
- Browser smoke opened Menu -> Start Expedition -> Ancient Egypt -> Begin Expedition and confirmed the player now renders as one clean hero atlas without the floating extra weapon layer.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Screenshots captured: `output/player-sprite-fix-idle.png` and `output/player-sprite-fix-run.png`.

2026-05-16 Egypt opening gameplay loop pass:
- Diagnosed the skippable opening: enemies already dropped shards, objectives already gated route seals, and relic shards already fed gate/shop progress, but the first Desert Map Seal only required 4 shards. Defeating the Scarab Queen awarded 6 shards, so the shard requirement became meaningless.
- Confirmed enemy sprite loading locally: scarab/snake/bat/enemy sheets load with no failed browser requests and scarabs render as sprite atlas art. Scorpion and sand-wisp remain on polished canvas fallback because no older high-quality sheets exist in the pre-placeholder Git snapshot.
- Kept all changes in existing Journey systems: `ROUTE_GATES`, `OBJECTIVE_MARKERS`, `ENEMIES`, relic shard pickup feedback, enemy shard drops, existing HUD, and existing tests.
- Raised the first `desert-seal` shard requirement to 10 so the player needs pre-boss shard progress instead of getting enough from the boss alone.
- Moved the existing `map-tablet` objective into the early guarded route near the first scarab/scorpion cache so the opening now asks the player to engage, dodge, or explore before the boss.
- Marked the early scorpion/scarab cluster as guarding the shard cache/map tablet using existing encounter-role metadata.
- Increased relic shard readability with a brighter sprite/glow tuning and changed shard pickup/enemy-defeat notices to say how many shards are needed for the next seal.
- Replaced the floating HUD's unclear total shard count with a compact `Next seal` readout, e.g. `Desert Map Seal - 1/10 shards + Map Tablet`.
- Browser smoke opened Menu -> Start Expedition -> Ancient Egypt -> Begin Expedition, confirmed the opening HUD explains the next seal, confirmed shard pickup says `Relic Shard 1/10: needed for Desert Map Seal`, confirmed scarab sprite atlas art appears in the guarded route, confirmed the early map tablet is visible near enemies, confirmed the first seal blocks a rushed under-collected player, and reported no console/page errors.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Screenshots captured: `output/gameplay-loop-opening-hud.png`, `output/gameplay-loop-shard-purpose-pickup.png`, `output/gameplay-loop-guarded-cache.png`, and `output/gameplay-loop-first-seal-blocked.png`.
- Remaining risk/follow-up: the first boss and post-boss seal should get a natural full playthrough after this tuning to confirm the 10-shard requirement feels fair rather than grindy.

2026-05-16 Egypt first required shard gate:
- Added a new early `Temple Approach Seal` before the larger Desert Map Seal so the first Egypt Journey section now requires relic shards before the player can continue.
- Kept the change inside the existing Journey systems: `ROUTE_GATES`, `RELIC_SHARDS`, relic pickup state, route-gate guidance, floating HUD, gate canvas labels, existing enemy placement metadata, and Journey tests.
- The new seal requires 4 relic shards and appears after the opening shard/enemy route instead of at the starting line.
- The floating HUD now points at `Temple Approach Seal` first, shard pickups report progress toward that seal, and the gate itself labels the current shard count.
- Browser smoke confirmed the seal blocks a rushed 0-shard player with a clear `Temple Approach Seal locked` message, collecting enough real shard pickups changes the seal to ready, and crossing the seal opens it and advances the active route objective to `Desert Map Seal`.
- Enemy sprite loading stayed healthy in the browser smoke: `enemySpritesLoaded: true`, `enemySpriteFallbackActive: false`, and no missing enemy sprite assets were reported.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Screenshots captured: `output/early-shard-gate-opening-after-fix.png`, `output/early-shard-gate-blocked-after-fix.png`, `output/early-shard-gate-four-shards-after-fix.png`, and `output/early-shard-gate-opened-after-fix.png`.
- Remaining risk/follow-up: the four-shard open confirmation used debug positioning to speed up collection through the real pickup collision zones. A natural student-paced tuning pass should adjust the first four shard placements and enemy spacing if the route feels too slow or too busy.

2026-05-16 Egypt enemy sprite and shard-guard pass:
- Diagnosed the remaining "missing sprite" feeling: scarab, snake, bat, looter, guardian, and statue sprite paths were wired, but scorpion and sand-wisp were still deliberately withheld from the live sprite-pack path from the previous quality-protection pass.
- Re-enabled the existing `scorpion-sprites` and `sand-wisp-sprites` atlas packs through the same enemy sprite loader instead of adding a new renderer or duplicate fallback.
- Marked the early scarab line and seal-path scarab as existing-system guards for `Temple Approach Seal`, so the first shard gate path reads as watched rather than decorative.
- Added one-time enemy-type stake notices through the existing Journey notice/HUD path, e.g. scarabs warn that they charge and can be cleared for relic shards.
- Changed existing enemy defeat shard messaging to say `Enemy dropped ... relic shard(s)` and tie that drop to the active seal progress.
- Browser smoke confirmed `enemySpritesLoaded: true`, `enemySpriteFallbackActive: false`, `missingEnemySpriteAssets: []`, visible atlas frame states for scarab, scorpion, sand-wisp, and snake, the first scarab warning notice, and the first gate still blocks an under-collected player.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Screenshots captured: `output/enemy-stakes-first-encounter.png`, `output/enemy-sprite-scarab-smoke.png`, `output/enemy-sprite-scorpion-smoke.png`, `output/enemy-sprite-sandWisp-smoke.png`, `output/enemy-sprite-snake-smoke.png`, and `output/enemy-drop-shard-message.png`.
- Remaining risk/follow-up: the browser smoke verified the enemy sprite families and warning path, but the deterministic combat script did not land a clean defeat in time. The defeat/drop text is covered in the existing defeat code path and source test, but the next natural playtest should tune attack spacing so students can reliably clear the first scarabs.

2026-05-16 Egypt shard purpose and optional cache loop:
- Added an early relic shard purpose note using the existing Journey story prop/environment event path: `Relic shards unlock seals and fund Base Camp upgrades. Collect them from ruins and enemies.`
- Added an optional `Upgrade Voucher Cache` on the early upper branch using the existing upgrade pickup path. It costs 2 relic shards to open and rewards +6 Base Camp shards through the existing shard bank instead of adding a new inventory system.
- Added a nearby cache marker prop so the optional reward reads as intentional exploration rather than a random pickup.
- Made shard/cache pickup feedback keep priority over one-time enemy warnings, so close enemy notices no longer overwrite the shard goal message.
- Added a small pulse state to the floating shard counter while shard/cache purpose notices are active.
- Updated Base Camp copy and shop costs so relic shards are explicitly described as supplies for permanent upgrades, route tools and excavation support, and shop item costs now say `shards`.
- Browser smoke opened Menu -> Start Expedition -> Ancient Egypt -> Begin Expedition, confirmed the purpose note appears, confirmed the optional cache is locked at 0 shards, confirmed shard pickups say `Relic Shard 1/4` and `2/4` for `Temple Approach Seal`, confirmed the cache opens after 2 shards and awards the voucher reward, confirmed the HUD counter pulses, confirmed enemy sprites still report loaded, and confirmed Base Camp shop copy/cost labels explain shard use with no console errors.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Screenshot captured: `output/playwright/shard-purpose-final-smoke.png`.
- Remaining risk/follow-up: the optional cache reward is represented as extra Base Camp shard value rather than a separate voucher item, deliberately avoiding a new voucher inventory. A later pass can add a named voucher inventory only if the wider excavation layer truly needs it.

2026-05-16 Egypt first five-minute vertical-slice playtest:
- Ran a fresh-start browser playtest from Menu -> Start Expedition -> Ancient Egypt -> Begin Expedition using live keyboard movement plus Journey snapshot hooks.
- Confirmed the first visible HUD objective is the `Temple Approach Seal` shard requirement and enemy sprite loading remains healthy (`enemySpritesLoaded: true`, no missing enemy sprite assets).
- Found one remaining clarity issue: the opening center notice still said only `The desert dunes stretch toward the lost temple`, which looked atmospheric but did not immediately tell a new player what to do.
- Tuned the existing Desert Entry atmosphere title to `Collect 4 relic shards to open the Temple Approach Seal.` No new UI or systems were added.
- Tested a straight sprint path: the player reached the first seal with 3/4 shards, had taken stamina loss from enemy pressure, and was blocked with `Temple Approach Seal locked: collect 1 more relic shard...`.
- Tested the successful route: after collecting four real shard pickups, the first seal opened and the active HUD moved on to `Desert Map Seal` with Map Tablet, Scarab Queen, Brush Handle, and 10-shard requirements.
- Confirmed the optional reward loop from the previous pass still exists; the early cache remains the exploration reward for spending shards rather than a required path.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Screenshots captured: `output/playwright/vertical-slice-final-start.png`, `output/playwright/vertical-slice-final-sprint-blocked.png`, and `output/playwright/vertical-slice-final-first-seal-opened.png`.
- Remaining risk/follow-up: the first seal now blocks sprinting, but the next natural playtest should focus on making the first scarab fight feel satisfying enough that students choose combat instead of only hunting loose shards.

2026-05-16 Switch 1 temple mechanism response:
- Inspected the existing Journey switch path: Switch 1 is an `OBJECTIVE_MARKERS` entry, collected through the existing objective pickup collision, counted by `getObjectiveProgress('ruined-temple')`, and previously only produced generic objective progress feedback.
- Added one switch-gated continuation platform, `switch-1-raised-return-plinth`, using the existing platform renderer/collision path with a small `requiresObjective: 'switch-1'` visibility rule.
- Kept the response in existing systems: objective marker pickup, HUD notice, reward pulse, combat/environment dust effect, platform drawing/collision, and Journey snapshot/debug state.
- Switch 1 now says `Stone mechanism activated. Switches 1/3. A return plinth rises.` and triggers a short `MECHANISM` pulse plus dust at the raised plinth.
- The raised plinth gets a small gold top glow so the temple visibly changes after activation without adding decorative-only platforms or a new mechanic framework.
- Browser smoke from a fresh launch confirmed: before activation `visibleMechanismPlatforms` is empty, after Switch 1 it contains `switch-1-raised-return-plinth`, objective progress changes to `1/3 switches`, no enemy sprite assets are missing, and the player can land on the raised plinth.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js` passed; `node --test src/components/expedition/baseCampShop.test.js` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed with the known runtime-resolved Egypt excavation image warnings only; `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Screenshots captured: `output/playwright/switch1-final-before.png`, `output/playwright/switch1-final-after.png`, and `output/playwright/switch1-final-route.png`.
- Remaining risk/follow-up: the browser check used debug positioning to reach Switch 1 quickly; a natural post-boss run should tune whether the raised plinth is obvious enough without the debug camera jump.
## 2026-05-16 First boss preparation gate

- Inspected the first mini-boss flow in `ExpeditionJourney.jsx` and `journeyLevelData.js`.
- Confirmed the Scarab Queen was triggered by proximity alone; the following `desert-seal` already required the boss, Brush Handle, Map Tablet, and shards, but the fight itself did not require preparation.
- Added a normal Journey route gate, `guardian-prep-seal`, before the Scarab Queen trigger. It requires the existing Map Tablet objective and 6 relic shards.
- Added an existing story-prop sign and environment-event warning: "Guardian Seal: recover the Map Tablet and 6 relic shards before the Scarab Queen."
- Improved boss reward wording so defeating the boss points the player back toward the named route gate and collecting the tool piece says what it unlocks next.
- Added Journey coverage asserting the prep seal sits before the desert seal and uses existing route gate/objective/shard systems.
- Verification: `node --test src/components/expedition-journey/journeySecrets.test.js`, `node --test src/components/expedition/baseCampShop.test.js`, `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check` passed. Build still has the known runtime-resolved excavation image warnings.
- Browser smoke from a fresh Expedition start used debug positioning to verify the underprepared rush and prepared path quickly:
  - Underprepared rush: Guardian Prep Seal blocked access before the Scarab Queen and the boss stayed asleep.
  - Prepared path: Map Tablet + 6 shards opened Guardian Prep Seal; entering the next area woke Scarab Queen and showed the boss intro.
  - Screenshot: `output/playwright/guardian-prep-seal-browser.png`.
  - Console had no page errors; existing audio stinger warnings still appear in headless Chromium.

## 2026-05-17 Guardian readiness and Desert Map Seal temple-entry pass

- Continued the Ancient Egypt Journey gameplay-loop work inside the existing Journey gate, objective, boss reward, HUD, and test systems only.
- Confirmed the Guardian Prep Seal readiness loop from fresh-start browser runs: Map Tablet is required, Guardian Prep Seal requires Map Tablet plus 6 relic shards, Desert Map Seal becomes the active route gate after Guardian Prep opens, and its locked checklist clearly reports Map Tablet, Scarab Queen, Brush Handle, and 10 relic shards.
- Tuned Scarab Queen readability and fairness in the existing boss phase/stat data: the first queen fight now has a slower charge, longer counter window, softer burst damage, 2 runtime health, and 4 base damage so it reads as the first guardian rather than a later difficulty spike.
- Browser readiness notes from the successful boss pass: Scarab Queen awakened, loaded sprite-backed art, could be defeated with stamina remaining, defeat revealed Brush Handle, Brush Handle pickup marked the key item collected, and Desert Map Seal moved to ready/open with all requirements checked.
- Follow-up temple-entry pass found the Desert Map Seal locked state already reads well before the boss: examples included `Scarab Queen: active`, `Brush Handle: needed`, and `Relic Shards: 10/10`, with guidance to dodge and counter the queen.
- Tightened the Desert Map Seal ready-state wording through the existing gate hint path: the ready hint now says `Desert Map Seal is open. Move through it into the ruined temple entry.`
- Tightened the Brush Handle route-open reward message through the existing boss key item data: Brush Handle now says `Desert Map Seal is open. Continue into the ruined temple entry.` when the gate is ready.
- Changed the existing route-gate HUD to show the gate's ready hint instead of the generic `All route tasks are complete. Move through the seal.` line, so other gates can also provide specific route-open copy without adding a new UI system.
- Added Journey test coverage proving the Desert Map Seal ready hint and Brush Handle route-open message remain wired through the existing data/component paths.
- Browser temple-entry automation caveat: fresh-start input runs reached Desert Map Seal and confirmed the pre-boss checklist/hints with no gameplay console errors, but the headless automation did not complete a full natural boss-to-Switch-1 run before timing out. Earlier focused Switch 1 checks still confirm Switch 1 activates the return plinth and shows the mechanism response.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js`, `node --test src/components/expedition/baseCampShop.test.js`, `node --test src/components/expedition-journey/journeyEnemySprites.test.js`, `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check` passed. Build still has the known runtime-resolved Egypt excavation image warnings, and browser runs still show the existing expedition stinger source warning.
- Screenshots captured during this pass include `output/playwright/desert-map-temple-01-start.png`, `output/playwright/temple-entry-pass2-02-desert-map-seal-first-visible.png`, `output/playwright/temple-entry-pass2-03-desert-map-seal-before-boss.png`, `output/playwright/temple-entry-pass3-02-desert-map-seal-first-visible.png`, and `output/playwright/temple-entry-pass3-03-desert-map-seal-before-boss.png`.
- Remaining risk/follow-up: a human-paced manual browser run should still play from Brush Handle pickup through Desert Map Seal, temple entry, and Switch 1 without debug movement to judge whether the post-boss route feels obvious enough in hand.

## 2026-05-17 Ancient Egypt opening story staging pass

- Added Step 1 of the dramatic Ancient Egypt Journey opening inside the existing Journey data only.
- Added three in-world start-area props: an archaeologist arrival field kit, a sealed guardian warning plinth, and a warrior-guide protective trail marker before the first Brush pickup.
- Added three short movement-triggered opening events for archaeologist arrival, guardian challenge, and warrior-guide entry.
- Kept the story beats short and replayable: all three use existing non-card event notices, with the warrior-guide summary on the existing dynamic dust-gust path before the first pickup so it is not immediately overwritten.
- Preserved the current Journey player controller, checkpoint flow, route gates, shard drops, Scarab Queen, Brush Handle reward, and Desert Map Seal requirements.
- Added Journey source tests proving the opening props/events exist, guardian quizzes remain disabled, and the early Temple Approach / Guardian Prep / Desert Map Seal requirements remain unchanged.
- Browser smoke from a fresh Ancient Egypt Journey start confirmed the opening props are visible near the start, the arrival/challenge/warrior-guide messages trigger naturally while moving, control continues quickly, the first Brush pickup still works, and the Temple Approach Seal still blocks the player until shards are collected.
- Validation: `node --test src/components/expedition-journey/journeySecrets.test.js`, `node --test src/components/expedition/baseCampShop.test.js`, `node --test src/components/expedition-journey/journeyEnemySprites.test.js`, `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check` passed. Build still has the known runtime-resolved Egypt excavation image warnings; `git diff --check` still reports LF-to-CRLF working-copy warnings only.
- Remaining risk/follow-up: this is only the Step 1 staging pass, not the full cinematic opening. Step 2 should tune presentation timing and visual specificity around the guardian block and warrior-guide entry without changing the player controller or early shard/seal loop.

## 2026-05-17 Ancient Egypt sacred threshold opening pass

- Added Step 2 of the dramatic Ancient Egypt Journey opening inside existing Journey data only.
- Added a visible sacred guardian threshold prop near the Temple Approach Seal using the existing story prop renderer and jackal-statue prop type.
- Added two short non-card event notices: `The guardian watches. Prove you can move with care.` near the sacred threshold, and `Good. Evidence and tools open the path - not force.` after the first shard/tool route beat.
- Reused the existing environment event shake path for a subtle threshold rumble, and added source coverage proving the event shake still flows into the Journey snapshot camera-shake state.
- Preserved Temple Approach Seal, Guardian Prep Seal, Desert Map Seal, Scarab Queen, Brush Handle, Base Camp, excavation, and China systems.

## 2026-05-17 Scarab Queen sacred boss asset pass

- Regenerated `public/assets/expedition/bosses/scarab-queen-sprites.png` and atlas JSON in place, preserving every existing Scarab Queen frame key used by `journeyBossSprites.js`.
- Extended the existing enemy sprite generation/validation scripts rather than creating a parallel boss asset pipeline; the Scarab Queen can now be rebuilt with `generate_enemy_sprite_sheets.py --scarab-queen-only`.
- Matched the Queen to the upgraded intimidating desert scarab family by deriving her base pose from `desert-scarab-intimidating-sprites.png`, then adding larger boss scale, lapis/gold shell markings, glyph rings, shield effects, readable charge, area pulse, counter-window weak point, hit feedback, and non-gory defeated state.
- Audit next: Stone Guardian should update next for sacred paired-guardian language; Giant Serpent and Ancient Construct should follow for cleaner transparent fixed-cell atlases; Rival Looter Captain is optional polish unless the escape section needs a more ceremonial non-random human antagonist; Egypt traps need a future dedicated sacred defence pack for pressure plates, glyph tripwires, sealed doors, guardian seals, and sacred pedestals.
- Follow-up correction: fixed the new Scarab Queen orientation and grounding by removing the outdated Queen-only flip rule, widening her boss draw box to match the fixed atlas ratio, and bottom-aligning sprite atlas draws so the Queen and regular scarabs stay visually planted on the ground.

## 2026-05-17 Scarab Queen opening-payoff story pass

- Strengthened the Egypt opening-to-boss story connection inside the existing Journey data only.
- Updated the Scarab Queen intro/dialogue to connect the protected-site warning to the first guardian test: `The seal stirs. Move with care, archaeologist - the guardian is awake.`
- Tightened the Temple Approach Seal, Guardian Prep Seal, and Desert Map Seal messages so they reinforce careful shard/evidence/tool collection and not forcing the site open.
- Updated the Brush Handle route-open reward message to say the player passed the first guardian test and should record what they found before moving deeper.
- Preserved Scarab Queen health, damage, route requirements, boss mechanics, Base Camp, excavation, and China systems.

## 2026-05-17 Egypt sacred trap asset audit

- Audited current Egypt Journey hazards and reactive platforms against the sacred protected-pyramid direction.
- Confirmed the existing renderer already asks the desert-temple environment atlas for hazard/platform/story-prop art, then falls back to canvas drawing when a region is missing.
- Added `docs/egypt-sacred-trap-asset-plan.md` as a docs-only asset brief rather than faking atlas registration before the art exists.
- The plan identifies the highest-value missing asset keys: guardian seal, sacred pedestal, pressure plate, cracked platform states, falling stone states, glyph tripwire states, and sealed door states.
- Preserved all trap collision, damage, timing, route layout, route gate, story prop, and reactive platform systems.

## 2026-05-17 Guardian Seal trigger planning pass

- Inspected the current final approach source of truth: Ancient Construct mini-boss data, `site-permit-seal`, `basecamp-seal`, the `dig-site-entrance` objective, final approach story props/events, boss intro/camera shake flow, and Ancient Construct sprite keys.
- Added `docs/guardian-seal-trigger-plan.md` as a docs-only design/implementation brief for a future Guardian Seal trigger and Ancient Construct awakening sequence.
- Recommended reusing existing objective marker/story prop/event notice/boss intro systems, with no new cutscene, dialogue, route gate, boss, reward, or excavation systems.
- Deliberately did not implement the trigger yet because the Guardian Seal/pedestal assets do not exist and the real awakening needs careful browser verification.

## 2026-05-17 Egypt Journey opening/guardian handover

- Added `docs/egypt-journey-opening-guardian-handover.md` as the clean current handover for the Step 1 opening, Step 2 guardian threshold, Scarab Queen asset pass, Scarab Queen story payoff, sacred trap asset plan, and Guardian Seal trigger plan.
- Confirmed all six listed items are complete in this local worktree; Guardian Seal remains planning-only by design.
- Recommended the next task as the first sacred defence asset pack, starting with `guardianSealIdle`, `guardianSealActivated`, `sacredPedestalIdle`, and `sacredPedestalActivated`, before any Guardian Seal trigger implementation.

## 2026-05-17 Egypt sacred defence first asset pack

- Created the first Egypt sacred defence atlas at `public/assets/expedition/environment/desert-temple/egypt-sacred-traps-pack.png` with matching JSON regions for `guardianSealIdle`, `guardianSealActivated`, `sacredPedestalIdle`, and `sacredPedestalActivated`.
- Added focused generation and validation scripts for this atlas so later trap/Guardian Seal passes can regenerate and check the art without changing the enemy or boss sprite pipeline.
- Updated the sacred trap and Guardian Seal planning docs to mark the first four visual regions as available.
- Deliberately did not wire the atlas into Journey gameplay, route gates, boss logic, excavation, or China.

## 2026-05-17 Egypt sacred defence validation and preview readiness

- Validated the sacred seal/pedestal atlas and confirmed all four required region keys exist with non-empty transparent-safe 256px regions.
- Registered the pack as passive future environment pack id `egypt-sacred-traps` in the existing Journey environment asset registry and added it to the Egypt scaffold as a future asset reference.
- Added source coverage proving the pack is registered and not selected as the active Journey gameplay environment pack.
- Deliberately did not map the assets onto hazards, route gates, story props, Guardian Seal triggers, boss logic, excavation, or China.

## 2026-05-17 Guardian Seal passive placement plan

- Added `docs/guardian-seal-placement-plan.md` as a docs-only placement handoff for the future Guardian Seal and sacred pedestal in the Egypt final route.
- Confirmed the current final-route source of truth: Ancient Construct at `X(7750)`, `site-permit-seal`, `basecamp-seal`, the `dig-site-entrance` objective, and existing final approach props/events.
- Recommended the first passive visual placement around `X(7330)`, just before the current Ancient Construct proximity wake boundary, so the seal/pedestal can read as a warning before any future trigger work.
- Deliberately did not change route gates, objective requirements, pickup logic, awakening logic, boss logic, excavation, or China.

## 2026-05-17 Guardian Seal passive visual placement

- Added passive `STORY_PROPS` for the sacred pedestal and Guardian Seal at the planned final-route warning point around `X(7330)`.
- Loaded the existing `egypt-sacred-traps` environment atlas as a supplemental visual pack and mapped only the idle `sacredPedestalIdle` and `guardianSealIdle` regions for these props.
- Added source coverage proving the placement uses the existing story-prop renderer and does not add Guardian Seal trigger, pickup, activated-state, route-gate, boss, Base Camp, excavation, or China changes.

## 2026-05-17 Sacred defence seal/pedestal handover

- Updated the existing Egypt Journey opening/guardian handover with the latest sacred seal/pedestal asset and passive placement status.
- Confirmed `egypt-sacred-traps-pack.png/json` exists and validates with `guardianSealIdle`, `guardianSealActivated`, `sacredPedestalIdle`, and `sacredPedestalActivated`.
- Confirmed passive final-route placement is complete, while the Guardian Seal trigger and Ancient Construct awakening implementation remain pending by design.
- Confirmed Ancient Construct data, route gates, Base Camp handoff, excavation, and China were not changed by this handover pass.

## 2026-05-17 Scarab Queen classroom-friendly attack asset refresh

- Refreshed the Scarab Queen boss atlas in place through the existing `generate_enemy_sprite_sheets.py --scarab-queen-only` path.
- Preserved all eleven canonical Scarab Queen frame keys and the existing `public/assets/expedition/bosses/scarab-queen-sprites.json` atlas contract.
- Reworked the generated Queen frames into a cleaner stylised sacred-scarab boss: bronze/gold shell plates, lapis-blue accents, clear eyes/mandibles/front legs, stronger windup brace, forward charge, glyph/sand area pulse, exposed counter-window weak point, hit reaction, and non-gory defeated guardian pose.
- Deliberately did not change Journey gameplay, route gates, Scarab Queen health/damage, Step 1/Step 2 opening systems, Base Camp, excavation, China, or Guardian Seal trigger logic.

## 2026-05-17 Early Scarab Seal awakening scene

- Added the missing early Scarab Seal climb/trigger beat before the Scarab Queen encounter using existing `PLATFORMS`, `STORY_PROPS`, dynamic environment notices, camera shake, boss intro, and Journey snapshot paths.
- The Sacred Scarab Seal starts inactive, activates once on contact, swaps the early seal/pedestal to activated visuals, shows the warning sequence, and then allows the existing Scarab Queen intro/domain flow to start.
- Scarab Queen defeat, Brush Handle reward, Desert Map Seal requirements, Temple Approach Seal, Guardian Prep Seal, Base Camp, excavation, China, and the final Guardian Seal / Ancient Construct trigger were deliberately not changed.

## 2026-05-17 Egypt interactive opening correction

- Corrected the Scarab Seal beat into the intended interactive opening: the player now sees a simple upward platform path near the Egypt entry, climbs toward a false artefact, and triggers the awakening by touching it.
- Moved the false Sacred Scarab Seal trigger to the top of the opening climb around `X(600)` and changed the confrontation text to `You will never reach the expedition site.`
- Added the guide follow-up purpose line so the Journey frames shards, tools, upgrades, and evidence as preparation to pass the guardian and reach the expedition site.
- Reused the existing Scarab Queen boss intro/domain flow for the cutscene-style confrontation and preserved all existing route-gate, Brush Handle, Base Camp, excavation, China, and final Guardian Seal / Ancient Construct behaviour.

## 2026-05-17 Egypt opening climb reposition pass

- Moved the Scarab Seal climb to the immediate Egypt start so the player sees the upward challenge as soon as the scene begins.
- Reworked the climb from a simple rightward staircase into a left/right platform route that asks the player to run and jump across the opening space before reaching the false artefact.
- Added two opening trap platforms using the existing reactive platform system: one unstable left ledge and one cracked right step.
- Kept the Scarab Seal trigger, activated visuals, Scarab Queen confrontation, route gates, boss rewards, Base Camp, excavation, China, and final Guardian Seal trigger behaviour unchanged.

## 2026-05-17 Egypt boss identity upgrade planning

- Audited the current Egypt boss ids, boss/key item gate dependencies, boss sprite loader, enemy sprite loader, existing boss/enemy asset folders, Scarab Seal opening trigger, and available validation scripts.
- Added `docs/egypt-boss-identity-upgrade-plan.md` as the planning source for a Sphinx / Griffin / Uraeus / Anubis / Bes guardian identity upgrade.
- Recommended preserving internal boss ids first and changing display/story copy before asset replacement because China already reuses those ids with different display identities.
- Recommended keeping the recently refreshed Scarab Queen as an early servant/miniboss until a Griffin sprite pack exists, with The Sphinx introduced as an opening protector presence and final boss identity.
- Refined the plan to explicitly preserve the final Guardian Seal trigger, player controller, and boss rendering architecture until a later implementation pass.
- Deliberately did not change gameplay, boss ids, stats, route requirements, key item rewards, Base Camp, excavation, China, or sprite-loader contracts in this planning pass.

## 2026-05-17 Egypt boss identity Phase 1 text pass

- Implemented the Phase 1 display/story update inside existing Egypt Journey data only.
- Reframed the opening Scarab Seal warning so The Sphinx is the distant protector: sealed artefact, Sphinx watching beyond the sand, protected artefacts, and the expedition-site threat.
- Kept `scarab-queen` as Scarab Queen, now framed as the Sphinx's first guardian; renamed Egypt display identities to Anubis, The Uraeus, Bes, and The Sphinx for the later guardian slots.
- Updated Egypt boss intro/dialogue/domain text only; preserved every internal boss id, boss stat, position, route requirement, key item reward, sprite atlas, Base Camp handoff, excavation handoff, China boss name, player controller, final Guardian Seal trigger, and boss rendering path.
- Added Journey source coverage proving the Phase 1 names landed while boss ids, key item links, route gates, Scarab Queen / Brush Handle / Desert Map Seal progression, and China display names stayed stable.

## 2026-05-17 Rejected Sphinx draft cleanup

- Rejected and removed the first procedural `sphinx-sprites.png/json` draft because it did not read as The Sphinx and looked too much like a mechanical sarcophagus / boat / drone.
- Removed the temporary Sphinx generation and validation hooks from the existing sprite scripts so the failed draft cannot be regenerated or validated as an approved asset by accident.
- Added `docs/sphinx-boss-visual-brief.md` as the new source brief for a future high-quality Sphinx sprite sheet attempt.
- Confirmed the existing Ancient Construct atlas remains the temporary placeholder for the stable `ancient-construct` boss id; no boss ids, route gates, key rewards, Base Camp, excavation, China, opening scene logic, checkpoint logic, or progression were changed in this cleanup.

## 2026-05-17 Egypt opening Sphinx confrontation correction

- Moved the Scarab Seal climb further into the immediate first-screen start area, with the first launch platform at `X(34)` and the false artefact at the summit around `X(205)`.
- Added stable recovery ledges around the opening trap platforms and shortened the reactive platform respawn timing so students can fall, retry, and still reach the top.
- Changed the Scarab Seal trigger so it plays the Sphinx opening warning without forcing the player into the Scarab Queen arena/domain.
- Preserved normal Desert Entry progression: Scarab Queen still has to be reached and defeated later for the Brush Handle and Desert Map Seal path.

## 2026-05-17 Egypt opening Sphinx on-screen encounter

- Changed the Scarab Seal trigger from a top-centre warning card into a scoped in-world Sphinx encounter drawn beside the summit platform.
- Added a large temporary Sphinx placeholder visual, attached dialogue bubble, and short upward/right fade-away exit using the existing Journey canvas render/update loop.
- Kept the player in the same opening area after the scene and preserved Scarab Queen, Brush Handle, Desert Map Seal, route gates, Base Camp, excavation, China, and final Guardian Seal / Ancient Construct behaviour.

## 2026-05-17 Opening Scarab Seal image asset

- Generated a new ancient Egyptian Scarab Seal PNG for the opening fake artefact, with gold/bronze framing, lapis-blue scarab detail, and transparent background.
- Saved the asset at `public/assets/expedition/environment/egypt-opening/scarab-seal-opening.png` and wired the existing opening story prop renderer to draw it before falling back to the simple canvas placeholder.
- Preserved Scarab Seal trigger logic, Sphinx encounter flow, route gates, boss rewards, Base Camp, excavation, China, and final Guardian Seal / Ancient Construct behaviour.

## 2026-05-17 Egypt final Sphinx boss wiring

- Wired the approved Sphinx sprite atlas into the existing Egypt `ancient-construct` boss sprite slot without renaming the internal boss id.
- Added `public/assets/expedition/bosses/sphinx-sprites.png` and `public/assets/expedition/bosses/sphinx-sprites.json`, including Sphinx frame keys plus existing Ancient Construct frame aliases for the current boss selector.
- Tuned the Ancient Construct draw box so the Sphinx reads as a large grounded final guardian while still using the existing boss renderer.
- Confirmed China continues to use its separate `china-rammed-earth-sentinel` sprite id and atlas.

## 2026-05-17 Journey platform purpose polish

- Added named platform challenge routes in Egypt using the existing Journey platform, reactive ledge, checkpoint, and rescue systems rather than adding a new platform engine.
- Moved several upgrades onto higher platform routes so players must climb and time jumps to reach them: Voucher Cache, Reinforced Boots, Rope Launcher, Torch Upgrade, and Ancient Compass.
- Added unstable/cracked challenge ledges across the desert high-shard route, temple sandfall climb, catacomb torch climb, and final site permit climb.
- Added a lightweight missed-jump rescue hook: once a player commits to one of these challenge routes, dropping below the safe line triggers the existing Field Rescue panel and retries from the active checkpoint.
- Verified the Desert Survey Checkpoint retry flow and sampled the new desert, temple, and catacomb platform layouts in the browser with no console errors.

## 2026-05-17 Opening checkpoint reposition

- Moved the Desert Survey Checkpoint marker from `X(705)` to `X(930)` so the checkpoint statue/flag sits in the early shard-and-platform stretch instead of crowding the Scarab Seal opening scene.
- Kept the same checkpoint id, name, y-position, rescue behaviour, route gates, boss progression, Base Camp, excavation, China, and opening Sphinx trigger logic unchanged.

## 2026-05-17 Early Egypt trap challenge tuning

- Reworked the early lower-route trap line into larger, clearer pyramid-defence hazards: a pressure plate, cracked floor trap, and wider soft sand trap.
- Increased the ground-route penalties so pushing straight through the traps feels like a real challenge, while preserving the upper platform route as the skill-based alternative.
- Reused existing hazard drawing, atlas mapping, reactive platform, checkpoint, and rescue systems; no new trap, route gate, boss, Base Camp, excavation, or China systems were added.

## 2026-05-17 Opening seal reset trap pass

- Changed the Scarab Seal trigger so the summit platform disappears through the existing collapsed-platform system, dropping the player toward the start-side route.
- Added a hidden opening reset trap that is only revealed after the seal activates; stepping forward into it pushes the player back to the Desert Entry start instead of skipping the level.
- Kept the bypass as a skill challenge: the player can walk back, reclimb the opening platforms, and cross above the revealed trap without changing route gates, boss rewards, Base Camp, excavation, or China.
