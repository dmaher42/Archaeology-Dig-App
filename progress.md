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
- Changed Museum lab result wording from interpretation-giving text to evidence-based observation text, so students must use the lab result to make their own historical inference in the museum label.
