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

2026-05-09 update:
- Added Journey Arcade Spectacle Phase 3 to the existing `ExpeditionJourney.jsx` side-scroller.
- Added cinematic boss intro states, section atmosphere palettes, particles, parallax/story props, environmental event cards, camera shake/focus, stronger section transitions, and HUD/render-state fields for spectacle checks.
- `npm.cmd run build` passed and `npm.cmd run lint` passed on this pass; `git diff --check` only reported the repo's LF-to-CRLF warnings.
- Browser/state checks confirmed boss intros, environment events, section transition states, section atmosphere changes, route-to-Base-Camp completion, and Begin Excavation still entering the existing excavation stage.
- Remaining risk: spectacle timing and readability should still be classroom-playtested on a projector, especially in the darker Catacombs and faster Escape Sequence sections.

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
