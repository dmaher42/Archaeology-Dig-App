Current source-of-truth note:
- Lost Site Expedition is no longer treated as only a small MVP mode.
- It is now the main standalone archaeology adventure/platformer direction inside Archaeology-Dig-App.
- Future implementation should follow `docs/lost-site-expedition-production-bible.md`.
- The production bible now defines implementation hierarchy, room pipelines, asset roles, and quality expectations.

Original prompt: Implement "Lost Site Expedition" as a small MVP game mode in the Archaeology-Dig-App repo.

2026-05-28 update:
- Added `docs/lost-site-expedition-production-bible.md` as the top-level production and implementation guide for Lost Site Expedition.
- Clarified the source-of-truth hierarchy between the Production Bible, Story Arc, Standalone Game Rule, Design Brief, Asset Audit, and Progress notes.
- Updated the README to reflect that Lost Site Expedition is now the primary standalone archaeology adventure direction inside the repo.
- Updated the design brief so it supports the Production Bible instead of competing with it.
- No gameplay systems, Journey logic, loaders, or assets were changed during this documentation consolidation pass.

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
