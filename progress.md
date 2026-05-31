Current source-of-truth note:
- Lost Site Expedition is no longer treated as only a small MVP mode.
- It is now the main standalone archaeology adventure/platformer direction inside Archaeology-Dig-App.
- Future implementation should follow `docs/lost-site-expedition-production-bible.md`.
- The production bible now defines implementation hierarchy, room pipelines, asset roles, and quality expectations.

Original prompt: Implement "Lost Site Expedition" as a small MVP game mode in the Archaeology-Dig-App repo.

2026-05-31 update:
- Started Phase 1 developer visual prop placement mode by extending the existing Journey `STORY_PROPS` path instead of adding a new room format or editor.
- Added helper coverage for prop placement edit/export serialization, then wired dev-only `E` edit mode, click selection, mouse dragging, `G` grid snapping, `Delete` removal confirmation, and `Ctrl+S` export JSON for current-room canonical prop objects.
- Extended the same Phase 1 prop editor for Phase 2 creation and transforms: `P` opens a palette derived from current `STORY_PROPS`, palette clicks arm a prop, room clicks spawn into the same runtime/export list, `Ctrl+D` duplicates selected props, `Q`/`R` rotate, and scale/rotation export on the existing prop object shape when changed.
- Replaced the Mummification Chamber interior runtime background with the side-on puzzle-ready PNG `public/assets/expedition/environment/desert-temple/mummification-chamber-interior-side-scroll-2026-05-31.png`.
- Kept the existing Journey chamber system and interaction atlas, then realigned the chamber readable zones, inspection hitboxes, exit seal trigger, and entry spawn to the new shallower room layout.
- Verified the updated room in the browser through the existing Journey dev shortcut; the chamber rendered with the new art and no browser console warnings.
- Upgraded the Mummification Chamber ritual puzzle in the existing Journey chamber code instead of adding a parallel puzzle.
- The active ritual order now follows the readable rite sequence: embalming table, canopic jars, oils and resins, linen wrappings, then ritual tablet.
- Added an in-room next-rite guide and current-object glow so the puzzle teaches the next action.
- Wrong-order interactions now keep completed progress and give a next-step clue instead of resetting the ritual.
- Verified the new puzzle guard test, the focused mummification tests, lint, and production build. Browser-control canvas screenshots timed out, but the live app mounted the Journey shell and retained only the existing audio autoplay warnings.
- Started the Forgotten Mural Room upgrade: collecting all three broken scarab relic fragments now opens a slide-puzzle overlay instead of immediately restoring the mural.
- Added a 3x3 scarab-seal slide puzzle with movable relic-piece buttons, reset support, solve detection, and restoration payoff once solved.
- Added a dev-panel smoke shortcut for the Mural Slide Puzzle so the overlay can be checked without a long playthrough.
- Verified the focused mural puzzle test, lint, production build, and a live browser smoke check showing the 9-tile overlay with two movable pieces and the reset control. The browser still reports existing audio autoplay warnings.
- Upgraded the Forgotten Mural slide puzzle art from labelled placeholder tiles to a generated scarab-seal mural PNG at `public/assets/expedition/environment/desert-temple/forgotten-mural-relic-slide-puzzle-2026-06-01.png`; the overlay now slices that artwork across the 3x3 board.

2026-05-29 update:
- Began the immersion cleanup pass for artificial in-world labels and markers.
- Removed the generated text residue from `public/assets/expedition/excavation/egypt-gateway-pack.png` by making unused atlas areas transparent while preserving registered regions.
- Added generated Egypt exit-gate art into the existing gateway atlas as `exitArch` and `closedGateSlab`.
- Wired the excavation exit gate so the arch remains in-world and the stone slab appears only while mission objectives are incomplete, replacing the modern padlock/unlock overlay.
- Added source-level test coverage to prevent canvas text labels and padlock overlays from returning to the Expedition map draw path.
- Corrected the target to the side-scrolling Journey progress gates after screenshot review.
- Added `public/assets/expedition/environment/egypt-opening/route-gate-arch-pack.png` and wired `drawRouteGate` so every Journey progress gate renders as an in-world arch with a stone slab while closed, then an open arch when requirements are complete.
- Removed the route-gate padlock, glowing artificial ring, and in-world gate label from the Journey progress-gate renderer.
- Enlarged and split the Journey route-gate rendering into base and foreground layers so open gates read as walk-through arches: Asha can pass through the transparent opening while the stone frame occludes correctly.
- Kept already-opened Journey route gates visible as open arches instead of removing the prop, so the world still contains a doorway after the route unlocks.

2026-05-28 update:
- Added `docs/lost-site-expedition-production-bible.md` as the top-level production and implementation guide for Lost Site Expedition.
- Clarified the source-of-truth hierarchy between the Production Bible, Story Arc, Standalone Game Rule, Design Brief, Asset Audit, and Progress notes.
- Updated the README to reflect that Lost Site Expedition is now the primary standalone archaeology adventure direction inside the repo.
- Updated the design brief so it supports the Production Bible instead of competing with it.
- No gameplay systems, Journey logic, loaders, or assets were changed during this documentation consolidation pass.
- Added `docs/character-sprite-pipeline.md` as the source of truth for future character, enemy, NPC, boss, and sprite-sheet work.
- Added an `AGENTS.md` pointer requiring future sprite-related tasks to read the pipeline before editing assets or runtime loaders.
- The pipeline separates human visual approval from Codex implementation, keeps candidates out of runtime loaders until approved, requires contact sheets/previews, and forbids broad scripted data rewrites without explicit approval.

2026-05-27 update:
- Started the Training / Field Certification survey-to-excavation rework with a focused first slice.
- Added three inspectable survey zones for Training: Central Depression, Ridge Scatter, and Washout Edge.
- Survey now reveals field evidence and requires choosing an excavation area before moving to Grid.
- The selected survey area now seeds the Training board with a safe starter probe while preserving the classic Beginner, Intermediate, and Expert hidden-find counts.
- Training save normalization now preserves the exact saved excavation board instead of regenerating hidden-find positions on restore.
- Added focused Training logic tests for survey-zone clue safety, board sizing, survey score, and save/restore behavior.
- Verified `node --test src\utils\gameLogic.training.test.js`, `npm.cmd run lint`, `npm.cmd run build`, and a browser Training flow from Start Training through Survey, Grid, and Excavate.
- Browser check confirmed no console errors and no horizontal layout overflow in the checked Training flow.

2026-05-25 update:
- Completed the UI makeover for the "Archeologist Training" screen (Training Phase).
- Implemented the "Vintage Explorer Journal" aesthetic, featuring parchment textures, leather stitched borders, and classic serif typography.
- Updated `src/index.css` to add the vintage styles to the training phase components.
- Updated `src/components/TrainingPhase.jsx` to replace `glass-card` classes with the new `vintage-panel` classes.
- Expanded the width of the game to full screen by removing max-width constraints on `.expedition-shell` and updating `.expedition-layout` to use `1fr`.
- Completely rewrote `src/components/TrainingPhase.jsx` to replace the static drag-and-drop card game with a playable "Field Certification" mini-simulation, directly teaching the player the mechanics of surveying, gridding, excavating, mapping, and lab analysis.
- Completely overhauled `src/components/DigPhase.jsx` to function as a Minesweeper-style deduction puzzle. Empty tiles reveal adjacency numbers.
