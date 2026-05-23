# Asha Player Sprite Atlas Prep Report

Date: 2026-05-19

## Source Reviewed

- User-provided Asha sprite sheet image in the current Codex thread.
- Current Egypt player atlas:
  - `public/assets/expedition/player/egypt-warrior-guide-spritesheet.png`
  - `public/assets/expedition/player/egypt-warrior-guide-spritesheet.json`
- Current Journey player renderer:
  - `src/components/ExpeditionJourney.jsx`
  - `src/components/expedition-journey/journeyConstants.js`
  - `src/components/expedition-journey/journeyUtils.js`

## Decision

The supplied Asha sheet is not engine-ready and should not be wired into the game yet.

It is strong concept art and a useful style guide, but it needs a clean atlas preparation pass before it can safely replace the current Egypt player atlas.

## Current Player Atlas Contract

The current Egypt Journey player renderer expects a JSON atlas with:

- `image`
- `frame.width`
- `frame.height`
- `frame.groundLineY`
- `draw.height`
- `draw.sourceHeight`
- `rows`
- `regions`
- per-frame `drawBounds`
- per-frame `groundLineY`

The current active Egypt atlas supports these rows:

- `idle`
- `walk`
- `run`
- `survey_walk`
- `jump`
- `fall`
- `land`
- `attack_pick_swing`
- `hurt`

The renderer currently selects these gameplay states:

- idle
- survey-walk
- walk
- run
- jump
- fall
- land
- attack
- hurt

The requested future states `interact`, `climb`, and `push/pull` are not currently selected by the Journey player renderer. They can be included in a future atlas for readiness, but wiring them as active gameplay states would require a separate renderer/state pass.

## Frame Layout Issues

Observed issues in the supplied Asha sheet:

- The background appears black, not transparent.
- Frames are not placed in a clean fixed grid.
- Frame spacing varies horizontally across rows.
- Some poses overlap visually through dust/sand strokes and cloak edges.
- Ground contact is inconsistent between rows and poses.
- Several frames include white ground smears or shadow shapes that would need cleanup.
- Some rows include stone blocks or wall props baked into the character frames.
- Baked stone props make those frames unsuitable for a character-only player atlas.
- The sheet mixes character animation poses with environment/action props.
- Rows cannot be sliced safely using simple fixed-width frame coordinates.
- The bottom area has large unused black space.
- The attack/action poses are visually strong but not isolated enough for reliable hit-frame mapping.

## Animation State Coverage

Likely present:

- idle
- walk/run-style movement
- crouch/brace
- attack/slash-style motion
- push or brace against stone

Unclear or missing as clean character-only rows:

- jump
- fall
- land
- hurt
- interact
- climb
- push/pull without baked stone props

Because those states are either missing, unclear, or mixed with props, the sheet should not be sliced into the active atlas.

## Required Fixes

To become production-ready, the Asha sheet needs:

1. True transparent background.
2. Fixed frame cells with consistent dimensions.
3. One animation row per state.
4. Consistent frame count per row where practical.
5. Consistent ground line across standing/running/action frames.
6. Character-only frames with no baked wall, block, platform, or stone props.
7. No cropped limbs, cloak edges, weapon arcs, or shields.
8. Clear padding around every frame.
9. Rows named to match the current renderer, at minimum:
   - `idle`
   - `walk`
   - `run`
   - `survey_walk`
   - `jump`
   - `fall`
   - `land`
   - `attack_pick_swing`
   - `hurt`
10. Optional future rows:
   - `interact`
   - `climb`
   - `push`
   - `pull`

## Exact Production Prompt

Use this prompt to generate a clean engine-ready replacement sheet:

```text
Create a production-ready 2D side-scroller player character sprite sheet for Asha, an Ancient Egypt expedition warrior-guide.

Use the attached concept sheet only as style reference: hooded desert cloak, bronze/gold armour, blue cloth accents, round Egyptian shield, strong readable silhouette, heroic archaeology adventure tone.

Output requirements:
- One clean transparent-background PNG sprite sheet.
- No background colour, no black background, no floor, no shadows baked into the sheet.
- No stone blocks, walls, platforms, props, enemies, labels, numbers, or UI.
- Character only in every frame.
- Side-view, facing right.
- Consistent character scale across all frames.
- Consistent ground line across all grounded frames.
- Fixed grid layout with equal-size frame cells.
- Generous padding inside each cell so no limbs, shield, cloak, weapon, or effects are cropped.
- No overlapping frames.
- No readable text or symbols.

Atlas layout:
- Cell size: 192x224 pixels.
- 12 rows, 8 columns.
- Canvas size: 1536x2688 pixels.
- Every row starts at x=0 and uses the same cell width.
- Keep all feet aligned to the same grounded baseline inside each cell where applicable.

Rows:
1. idle: 8 frames, subtle breathing, shield held ready.
2. walk: 8 frames, careful expedition walk.
3. run: 8 frames, clear running cycle, cloak trailing.
4. survey_walk: 8 frames, slower careful movement with shield lowered slightly.
5. jump: 8 frames, takeoff and rising poses.
6. fall: 8 frames, descending poses.
7. land: 8 frames, landing compression and recovery.
8. attack_pick_swing: 8 frames, clear warning, swing, follow-through, and recovery with khopesh/short blade motion.
9. hurt: 8 frames, readable hit reaction, no gore.
10. interact: 8 frames, reaching/inspecting with one hand, no object baked in.
11. climb: 8 frames, ladder/wall-climb body poses only, no ladder or wall baked in.
12. push_pull: 8 frames, bracing/pushing/pulling body poses only, no stone block or prop baked in.

Style:
- High-quality painted 2D game sprite.
- Clean transparent edges.
- Strong silhouette readable at gameplay scale and on large displays.
- Ancient Egyptian palette: bronze, gold, sandy brown, lapis-blue accents.
- Adventurous, respectful, sacred-site protector feel.
- Not horror, not gory, not treasure-thief framing.
```

## Wiring Recommendation

Do not wire the supplied sheet.

Once a clean engine-ready sheet is produced, the next safe pass should:

1. Save it under `public/assets/expedition/player/`.
2. Create a matching JSON atlas using the current `egypt-warrior-guide-spritesheet.json` format.
3. Preserve the old Egypt sprite as fallback.
4. Point `PLAYER_HERO_SPRITE_ATLAS_JSON` at the new JSON.
5. Update `PLAYER_HERO_SPRITE_VERSION`.
6. Run Journey sprite tests, lint, build, and browser smoke.
