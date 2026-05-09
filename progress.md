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
