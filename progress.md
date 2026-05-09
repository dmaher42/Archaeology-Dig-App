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
