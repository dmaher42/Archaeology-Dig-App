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
