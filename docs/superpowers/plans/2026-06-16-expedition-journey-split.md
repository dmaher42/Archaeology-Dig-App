# Expedition Journey Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Break `src/components/ExpeditionJourney.jsx` into smaller, focused Journey modules without changing gameplay, editor output, or live placement source of truth.

**Architecture:** Keep `ExpeditionJourney.jsx` as the Journey orchestrator at first, then move pure constants/components, dev-editor UI, renderer groups, and finally the update loop into nearby files under `src/components/expedition-journey/`. Do not create a parallel Journey system; every extracted module must be imported back into the existing runtime path.

**Tech Stack:** React 19, Vite, JavaScript modules, existing `node --test` tests, `npm.cmd run lint`, `npm.cmd run build`.

---

## Investigation Summary

Current file shape from the real repo:

- `src/components/ExpeditionJourney.jsx` is 27,305 lines.
- Imports and top-level constants/helpers occupy roughly lines 1-3941.
- The `ExpeditionJourney` React component starts at line 3942 and runs to the end, roughly 23,365 lines.
- The JSX return starts around line 24609.
- The file exports `JourneyControlsReference`, used by `src/components/ExpeditionMode.jsx`, and default-exports `ExpeditionJourney`.

Major internal zones:

- Lines 1-376: imports from Journey data, layout, render assets, sprite modules, combat, and Rome/China packs.
- Lines 377-1721: story/chamber constants, opening cinematic copy, room restoration data, entrance/door/chamber definitions.
- Lines 1722-2498: guardian modifiers, hero sprite selection helpers, attack patterns, telegraph configuration.
- Lines 2499-2534: `JourneyControlsReference`.
- Lines 2535-3941: enemy pressure, hazard visuals, prop/editor visual helpers, camera target helpers.
- Lines 3942-6353: component state plus Journey placement editor state, selection, persistence, and export/write callbacks.
- Lines 6354-7328: asset loading and setup effects.
- Lines 7329-9154: gameplay callbacks, objective/gate helpers, combat helper callbacks, snapshot creation.
- Lines 9155-19585: canvas drawing callbacks.
- Lines 19894-23256: main simulation/update callback.
- Lines 23257-24133: step loop and dev-window hooks.
- Lines 24165-24608: pointer handlers.
- Lines 24609-27306: sidebar, canvas overlays, editor panel JSX, HUD, puzzles, failure overlay, briefing overlay.

Important constraints:

- `src/components/expedition-journey/journeyDataRouter.js` remains the runtime data router.
- `src/components/expedition-journey/journeyPlacementOverrides.generated.js` remains the generated editor/runtime placement handoff. Do not rewrite or normalize it as part of this refactor.
- Several tests inspect `ExpeditionJourney.jsx` as source text. Update those test guardrails before moving code, or tests will fail for the wrong reason.
- Preserve existing local WIP. Stage only files touched by the current refactor task.

## Target File Responsibilities

Add files only when each one has a clear owner:

- `src/components/expedition-journey/journeySourceText.test-utils.mjs`: test helper that reads the Journey source bundle after code is split.
- `src/components/expedition-journey/journeyCombatTelegraphs.js`: attack telegraph classes, heavy attack interval, and `getEnemyAttackTelegraph`.
- `src/components/expedition-journey/journeyControlsReference.jsx`: `JourneyControlsReference` and its authored control rows.
- `src/components/expedition-journey/journeyPlayerVisuals.js`: character preset data and hero sprite/frame selection helpers.
- `src/components/expedition-journey/journeySacredRooms.js`: sacred room restoration sets, chamber puzzle copy, mummification ritual definitions, room status helpers.
- `src/components/expedition-journey/journeyOpeningScenes.js`: opening cinematic lines, arrival/threshold helpers, and opening camera helper functions that do not need React state.
- `src/components/expedition-journey/JourneyPlacementEditorPanel.jsx`: dev-only editor panel JSX; callbacks still owned by `ExpeditionJourney` during the first extraction.
- `src/components/expedition-journey/JourneyHudOverlays.jsx`: floating HUD, puzzle overlays, failure overlay, and briefing overlay.
- `src/components/expedition-journey/journeyRenderPrimitives.js`: canvas primitives with no React state or refs.
- `src/components/expedition-journey/useJourneyRenderer.js`: later-stage renderer hook that receives refs/dependencies and returns grouped draw callbacks.
- `src/components/expedition-journey/useJourneySimulation.js`: last-stage simulation hook that receives state refs, audio callbacks, and gameplay helpers.

## Task 1: Make Source-Scanning Tests Split-Safe

**Files:**

- Create: `src/components/expedition-journey/journeySourceText.test-utils.mjs`
- Modify: `src/components/expedition-journey/journeyAudioSfx.test.js`
- Modify: `src/components/expedition-journey/journeyEnemySprites.test.js`
- Modify: `src/components/expedition-journey/journeyPlacementOverrides.test.mjs`
- Modify: `src/components/expedition-journey/journeySecrets.test.js`

- [ ] **Step 1: Create the shared source-reader test helper**

Create `src/components/expedition-journey/journeySourceText.test-utils.mjs`:

```js
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const JOURNEY_SOURCE_URLS = [
  new URL('../ExpeditionJourney.jsx', import.meta.url),
  new URL('./journeyCombatTelegraphs.js', import.meta.url),
  new URL('./journeyControlsReference.jsx', import.meta.url),
  new URL('./journeyPlayerVisuals.js', import.meta.url),
  new URL('./journeySacredRooms.js', import.meta.url),
  new URL('./journeyOpeningScenes.js', import.meta.url),
  new URL('./JourneyPlacementEditorPanel.jsx', import.meta.url),
  new URL('./JourneyHudOverlays.jsx', import.meta.url),
  new URL('./journeyRenderPrimitives.js', import.meta.url),
  new URL('./useJourneyRenderer.js', import.meta.url),
  new URL('./useJourneySimulation.js', import.meta.url),
];

export const readJourneySourceText = (urls = JOURNEY_SOURCE_URLS) => urls
  .map((url) => {
    const path = fileURLToPath(url);
    return existsSync(path) ? readFileSync(path, 'utf8') : '';
  })
  .filter(Boolean)
  .join('\n\n/* ---- journey source boundary ---- */\n\n');

export const journeyComponentSource = readJourneySourceText();
```

- [ ] **Step 2: Update source-scanning tests to import the helper**

In each listed test file, replace any local `journeyComponentSource = readFileSync(new URL('../ExpeditionJourney.jsx', import.meta.url), 'utf8')` with:

```js
import { journeyComponentSource } from './journeySourceText.test-utils.mjs';
```

Keep `readFileSync` imports only in test files that still read other files.

- [ ] **Step 3: Run the focused source tests before any runtime code move**

Run:

```text
node --test src/components/expedition-journey/journeyAudioSfx.test.js
node --test src/components/expedition-journey/journeyEnemySprites.test.js
node --test src/components/expedition-journey/journeyPlacementOverrides.test.mjs
node --test src/components/expedition-journey/journeySecrets.test.js
```

Expected: same pass/fail status as before this task. Any new failure here is a test-helper regression, not a gameplay regression.

- [ ] **Step 4: Commit only the test-helper change**

Run:

```text
git add src/components/expedition-journey/journeySourceText.test-utils.mjs src/components/expedition-journey/journeyAudioSfx.test.js src/components/expedition-journey/journeyEnemySprites.test.js src/components/expedition-journey/journeyPlacementOverrides.test.mjs src/components/expedition-journey/journeySecrets.test.js
git diff --cached --check
git commit -m "test: make Journey source guardrails split-safe"
```

## Task 2: Extract Controls and Combat Telegraph Metadata

**Files:**

- Create: `src/components/expedition-journey/journeyCombatTelegraphs.js`
- Create: `src/components/expedition-journey/journeyControlsReference.jsx`
- Modify: `src/components/ExpeditionJourney.jsx`
- Test: `src/components/expedition-journey/journeySecrets.test.js`
- Test: `src/components/expedition-journey/journeyEnemySprites.test.js`

- [x] **Step 1: Move combat telegraph constants unchanged**

Move these existing top-level declarations out of `ExpeditionJourney.jsx`:

```text
HEAVY_ATTACK_INTERVAL
ATTACK_TELEGRAPH_CLASSES
getEnemyAttackTelegraph
```

Export them from `journeyCombatTelegraphs.js`. Import `HEAVY_ATTACK_PATTERNS` into that file only if `HEAVY_ATTACK_PATTERNS` is moved with it; otherwise pass the heavy pattern map into `getEnemyAttackTelegraph(enemy, heavyPatterns)` during this task.

- [x] **Step 2: Move the controls reference component**

Move these existing declarations into `journeyControlsReference.jsx`:

```text
JOURNEY_CONTROL_ROWS
JOURNEY_TELEGRAPH_LEGEND
JourneyControlsReference
```

Import `ATTACK_TELEGRAPH_CLASSES` from `journeyCombatTelegraphs.js`.

- [x] **Step 3: Preserve the current public import path**

In `ExpeditionJourney.jsx`, keep this named export available so `ExpeditionMode.jsx` does not need to change yet:

```js
import { JourneyControlsReference } from './expedition-journey/journeyControlsReference.jsx';
export { JourneyControlsReference } from './expedition-journey/journeyControlsReference.jsx';
```

- [x] **Step 4: Verify**

Run:

```text
node --test src/components/expedition-journey/journeySecrets.test.js
node --test src/components/expedition-journey/journeyEnemySprites.test.js
npm.cmd run lint
npm.cmd run build
```

Expected: no gameplay-visible change. `ExpeditionMode.jsx` still imports `JourneyControlsReference` from `./ExpeditionJourney`.

## Task 3: Extract Player Visual Selection Helpers

**Files:**

- Create: `src/components/expedition-journey/journeyPlayerVisuals.js`
- Modify: `src/components/ExpeditionJourney.jsx`
- Test: `src/components/expedition-journey/journeySecrets.test.js`
- Test: `src/components/expedition-journey/journeyEnemySprites.test.js`

- [x] **Step 1: Move only pure player visual declarations**

Move these existing top-level declarations unchanged:

```text
getAtlasImagePath
getHeroSpriteRow
getHeroSpriteFrameRowName
getHeroSpriteRowScale
getHeroSpriteFrameScale
getHeroSpriteFrameDistance
getHeroSpriteFixedFrame
isPlayerAttackVisualPhase
PLAYER_CHARACTER_PRESETS
getPlayerCharacterPreset
getPlayerHeroSpriteConfig
getHeroSpriteFrameKey
```

Keep runtime collision, movement, stamina, and attack behavior in `ExpeditionJourney.jsx`.

- [x] **Step 2: Import the extracted helpers back into the component**

Add imports from `journeyPlayerVisuals.js` for the moved names. Do not change the existing player atlas JSON imports until this task is green.

- [x] **Step 3: Verify**

Run:

```text
node --test src/components/expedition-journey/journeySecrets.test.js
node --test src/components/expedition-journey/journeyEnemySprites.test.js
npm.cmd run build
```

Expected: Asha sprite selection, dodge frames, attack frames, and character loader behavior remain unchanged.

## Task 4: Extract Sacred Room and Chamber Data

**Files:**

- Create: `src/components/expedition-journey/journeySacredRooms.js`
- Modify: `src/components/ExpeditionJourney.jsx`
- Test: `src/components/expedition-journey/journeySecrets.test.js`
- Test: `src/components/expedition-journey/journeyRoomInteract.test.js`

- [x] **Step 1: Move chamber copy and restoration helpers**

Move these existing top-level declarations unchanged:

```text
SCRIBE_CHAMBER_PUZZLE
SCRIBE_CHAMBER_FEEDBACK
SCRIBE_CHAMBER_DOOR_OPEN_LINE
MUMMIFICATION_CHAMBER_RITUAL_ORDER
MUMMIFICATION_CHAMBER_PUZZLE
MUMMIFICATION_CHAMBER_FEEDBACK
MUMMIFICATION_CHAMBER_RESTORATION_IDS
FORGOTTEN_MURAL_CHAMBER_RESTORATION_IDS
SCRIBE_CHAMBER_RESTORATION_IDS
ROOM_RESTORATION_SETS
SACRED_ROOM_EVIDENCE_LABELS
getSacredRoomRestorationEvidence
getSacredRoomEvidenceRows
getRoomRestorationStatus
getAnubisRestorationReaction
MUMMIFICATION_CHAMBER_INTERACTION_OBJECTS
MUMMIFICATION_CHAMBER_RITUAL_STEPS
getMummificationChamberAtmosphere
MUMMIFICATION_CHAMBER_RITES
getMummificationRiteByIndex
CHAMBER_DOOR_VISUALS
```

- [x] **Step 2: Keep scene-entry coordinates in `ExpeditionJourney.jsx` for now**

Do not move these yet:

```text
MUMMIFICATION_CHAMBER_ENTRY_SPAWN
MUMMIFICATION_CHAMBER_ENTRY_TRIGGER
MUMMIFICATION_CHAMBER_BOUNDS
FORGOTTEN_MURAL_CHAMBER_ENTRY_SPAWN
SCRIBE_CHAMBER_ENTRY_SPAWN
```

Those are tightly coupled to camera, platform, and transition logic and should move only after the renderer split.

- [x] **Step 3: Verify**

Run:

```text
node --test src/components/expedition-journey/journeySecrets.test.js
node --test src/components/expedition-journey/journeyRoomInteract.test.js
npm.cmd run build
```

Expected: sacred room evidence counts, mummification ritual prompts, mural slide puzzle gates, and scribe chamber challenge behavior stay unchanged.

## Task 5: Extract Opening Scene and Cinematic Constants

**Files:**

- Create: `src/components/expedition-journey/journeyOpeningScenes.js`
- Modify: `src/components/ExpeditionJourney.jsx`
- Test: `src/components/expedition-journey/journeySecrets.test.js`
- Test: `src/components/expedition-journey/journeyAudioSfx.test.js`

- [x] **Step 1: Move pure opening scene declarations**

Move existing top-level declarations that are copy/config only:

```text
OPENING_THRESHOLD_SCENE_DURATION
OPENING_THRESHOLD_FADE_SECONDS
OPENING_THRESHOLD_STAIR_REVEAL_SECONDS
OPENING_THRESHOLD_FALL_DELAY_SECONDS
OPENING_THRESHOLD_FALL_DURATION_SECONDS
ARRIVAL_THRESHOLD_BACKGROUND_SRC
ARRIVAL_THRESHOLD_ASSET_VERSION
ARRIVAL_THRESHOLD_SPAWN_X
ARRIVAL_THRESHOLD_LEFT_BOUND
ARRIVAL_THRESHOLD_RIGHT_BOUND
ARRIVAL_THRESHOLD_LEFT_INSPECT_X
ARRIVAL_THRESHOLD_MARKINGS_INSPECT_X
ARRIVAL_THRESHOLD_FORWARD_GATE_TRIGGER_X
ARRIVAL_THRESHOLD_OBJECTIVE_LINE
ARRIVAL_THRESHOLD_LEFT_OBJECTIVE_LINE
ARRIVAL_THRESHOLD_GATE_OBJECTIVE_LINE
ARRIVAL_THRESHOLD_SPAWN_LINE
ARRIVAL_THRESHOLD_LEFT_LINES
ARRIVAL_THRESHOLD_MARKING_LINES
OPENING_SPHINX_DURATION
OPENING_SPHINX_EXIT_SECONDS
OPENING_SPHINX_ARRIVAL_SECONDS
OPENING_SPHINX_LINE_SECONDS
OPENING_CINEMATIC_ENABLED
OPENING_CINEMATIC_VOICE_ENABLED
OPENING_CINEMATIC_DURATION
OPENING_CINEMATIC_SPELL_IMPACT_AT
OPENING_ASHA_CUTSCENE_SRC
OPENING_ARRIVAL_AFTERSHOCK_NOTICE
OPENING_CINEMATIC_LINES
ROME_OPENING_CINEMATIC_LINES
getOpeningCinematicLines
getOpeningThresholdDialogueLine
getOpeningCinematicLine
easeInOutCubic
```

- [x] **Step 2: Keep transition mutation callbacks in `ExpeditionJourney.jsx`**

Do not move `startOpeningCinematic`, `completeOpeningThresholdScene`, `enterLevelFromThreshold`, or `startTempleThresholdTransition` in this task. They mutate `stateRef.current`, call audio, and sync HUD.

- [x] **Step 3: Verify**

Run:

```text
node --test src/components/expedition-journey/journeySecrets.test.js
node --test src/components/expedition-journey/journeyAudioSfx.test.js
npm.cmd run build
```

Expected: opening intro, skip intro, arrival threshold, and opening audio references are unchanged.

## Task 6: Extract Dev Editor JSX Before Extracting Editor Logic

**Files:**

- Create: `src/components/expedition-journey/JourneyPlacementEditorPanel.jsx`
- Modify: `src/components/ExpeditionJourney.jsx`
- Test: `src/components/expedition-journey/journeySecrets.test.js`
- Test: `src/components/expedition-journey/journeyPlacementOverrides.test.mjs`

- [x] **Step 1: Move the stack picker JSX into a component**

Create `JourneyPlacementEditorStackPicker` inside `JourneyPlacementEditorPanel.jsx`. Pass the currently-used values as props:

```js
export function JourneyPlacementEditorStackPicker({
  stackPicker,
  onDismiss,
  onSelectEntity,
}) {
  if (!stackPicker) return null;
  return null;
}
```

Replace `return null;` by moving the existing stack picker JSX unchanged from `ExpeditionJourney.jsx`. Keep the inline styles during the first move.

- [x] **Step 2: Move the editor panel JSX into a component**

Create `JourneyPlacementEditorPanel` with explicit props for state and callbacks:

```js
export function JourneyPlacementEditorPanel({
  propEditorUi,
  collapsedPanelSections,
  outlinerOpen,
  setOutlinerOpen,
  setEditorPanelNode,
  handleEditorPanelDragStart,
  resetEditorPanelPosition,
  renderEditorSectionHeader,
  refreshPropEditorUi,
  propPlacementEditorRef,
  undoEditorChange,
  redoEditorChange,
  savePropPlacementExport,
  writeJourneyOverridesToSource,
  showAllEditorProps,
  selectEditorEntityFromStack,
  updateSelectedPropEditorTransform,
  updateSelectedPropEditorField,
  updateSelectedPropEditorNumberField,
  updateSelectedPropGroundContactLayer,
  removeSelectedPropGroundContactLayer,
  updateSelectedPlatformEditorTransform,
  updateSelectedHazardEditorTransform,
  updateSelectedArchEditorTransform,
  updateSelectedCheckpointEditorTransform,
  updateSelectedLairEditorTransform,
  updateSelectedNestEditorTransform,
  resetSelectedNestEditor,
  duplicateSelectedPropInEditor,
  deleteSelectedPropFromEditor,
  toggleSelectedEditorLock,
  selectEditorPropFromOutliner,
  toggleEditorPropHidden,
  toggleEditorPropLockFromOutliner,
  setEditorOutlinerSearch,
  copySelectedPropLook,
  pasteSelectedPropLook,
  blendSelectedPropIntoScene,
  nudgeSelectedPropZOrder,
}) {
  return null;
}
```

Replace `return null;` by moving only the existing dev editor panel JSX. Do not move editor state, persistence, export/write logic, or pointer logic yet.

- [x] **Step 3: Verify**

Run:

```text
node --test src/components/expedition-journey/journeyPlacementOverrides.test.mjs
node --test src/components/expedition-journey/journeySecrets.test.js
npm.cmd run lint
npm.cmd run build
```

Expected: editor still opens, builds export, writes to source in dev, clears draft after successful write, and keeps the same local-storage key.

## Task 7: Extract Player-Facing HUD and Overlay JSX

**Files:**

- Create: `src/components/expedition-journey/JourneyHudOverlays.jsx`
- Modify: `src/components/ExpeditionJourney.jsx`
- Test: `src/components/expedition-journey/journeySecrets.test.js`

- [ ] **Step 1: Move only presentational overlays**

Move these JSX regions into exported components:

```text
sidebar field kit/status panel
floating Journey HUD
character loader
post-boss reward banner
forgotten mural slide puzzle overlay
guardian challenge overlay
failure overlay
briefing overlay
```

Keep all state mutation callbacks in `ExpeditionJourney.jsx` and pass them down as props.

- [ ] **Step 2: Keep the canvas and pointer handlers in `ExpeditionJourney.jsx`**

Do not move `<canvas>`, `handlePointerDown`, `handlePointerMove`, or `handlePointerUp` in this task.

- [ ] **Step 3: Verify**

Run:

```text
node --test src/components/expedition-journey/journeySecrets.test.js
npm.cmd run lint
npm.cmd run build
```

Expected: visible UI is the same. This task is mostly internal, but the player should still see the same Journey HUD, briefing, puzzle overlays, and failure screen.

## Task 8: Extract Pure Canvas Render Primitives

**Files:**

- Create: `src/components/expedition-journey/journeyRenderPrimitives.js`
- Modify: `src/components/ExpeditionJourney.jsx`
- Test: `src/components/expedition-journey/journeySecrets.test.js`
- Test: `src/components/expedition-journey/journeyEnemySprites.test.js`

- [ ] **Step 1: Move drawing helpers that do not use React refs or component state**

Start with small helpers only:

```text
drawContactShadow
drawGroundDustLip
drawHazardGroundApron
drawDecorativeBaseBlend
drawRouteGroundApron
drawEditorSelectionCorners
drawEditorSelectionLabel
```

If a helper touches `stateRef`, an asset ref, `audioControls`, or another `useCallback`, leave it in `ExpeditionJourney.jsx`.

- [ ] **Step 2: Verify**

Run:

```text
node --test src/components/expedition-journey/journeySecrets.test.js
node --test src/components/expedition-journey/journeyEnemySprites.test.js
npm.cmd run build
```

Expected: no visible change. This task only moves pure canvas helper functions.

## Task 9: Extract Renderer Groups With a Hook

**Files:**

- Create: `src/components/expedition-journey/useJourneyRenderer.js`
- Modify: `src/components/ExpeditionJourney.jsx`
- Test: `src/components/expedition-journey/journeySecrets.test.js`
- Test: `src/components/expedition-journey/journeyEnemySprites.test.js`

- [ ] **Step 1: Create the renderer hook shell**

Create a hook that accepts dependency objects rather than importing runtime state directly:

```js
export function useJourneyRenderer(deps) {
  return {
    draw: deps.draw,
  };
}
```

- [ ] **Step 2: Move one renderer group at a time**

Move groups in this order, running tests after each group:

```text
opening/arrival cinematic draw callbacks
player draw callbacks
platform and ground draw callbacks
story prop draw callbacks
collectible draw callbacks
background and parallax draw callbacks
enemy and boss draw callbacks
combat effect draw callbacks
editor overlay draw callbacks
main draw callback
```

Each moved callback should receive refs/callbacks through `deps`; do not import `stateRef` or `canvasRef` into the renderer module.

- [ ] **Step 3: Verify after each group**

Run:

```text
node --test src/components/expedition-journey/journeySecrets.test.js
node --test src/components/expedition-journey/journeyEnemySprites.test.js
npm.cmd run build
```

Expected: canvas rendering remains visually unchanged.

## Task 10: Extract Simulation Last

**Files:**

- Create: `src/components/expedition-journey/useJourneySimulation.js`
- Modify: `src/components/ExpeditionJourney.jsx`
- Test: `src/components/expedition-journey/journeyCombat.test.js`
- Test: `src/components/expedition-journey/journeyEnemySprites.test.js`
- Test: `src/components/expedition-journey/journeySecrets.test.js`

- [ ] **Step 1: Create the simulation hook shell**

Create a hook that accepts dependencies explicitly:

```js
export function useJourneySimulation(deps) {
  return {
    update: deps.update,
    step: deps.step,
  };
}
```

- [ ] **Step 2: Move gameplay callbacks before moving `update`**

Move small callback groups first:

```text
objective/gate guidance helpers
guardian challenge answer/continue callbacks
forgotten mural slide puzzle callbacks
rescue/respawn callbacks
combat helper callbacks
```

Do not move `update` until these groups are green.

- [ ] **Step 3: Move the main `update` callback only after renderer extraction is stable**

Move `update` into `useJourneySimulation.js` only when all dependencies are explicit in the hook arguments.

- [ ] **Step 4: Verify**

Run:

```text
node --test src/components/expedition-journey/journeyCombat.test.js
node --test src/components/expedition-journey/journeyEnemySprites.test.js
node --test src/components/expedition-journey/journeySecrets.test.js
npm.cmd run lint
npm.cmd run build
```

Expected: movement, combat, boss behavior, hazards, doors, chamber entry/exit, and rescue behavior remain unchanged.

## Task 11: Split `journeySecrets.test.js` After Runtime Modules Are Stable

**Files:**

- Modify: `src/components/expedition-journey/journeySecrets.test.js`
- Create as needed:
  - `src/components/expedition-journey/journeyEditorSource.test.js`
  - `src/components/expedition-journey/journeySacredRoomsSource.test.js`
  - `src/components/expedition-journey/journeyHudSource.test.js`
  - `src/components/expedition-journey/journeyRendererSource.test.js`

- [ ] **Step 1: Move tests by topic, not by old line number**

Move assertions into topic files only after the code they guard has been extracted. Keep the shared `journeySourceText.test-utils.mjs` helper.

- [ ] **Step 2: Run all Journey tests**

Run:

```text
node --test src/components/expedition-journey/*.test.js
node --test src/components/expedition-journey/*.test.mjs
npm.cmd run lint
npm.cmd run build
```

Expected: tests are easier to navigate, with no loss of guardrail coverage.

## Browser Smoke Check For Visible Stages

Run this after Tasks 6, 7, 9, and 10:

```text
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Open:

```text
http://127.0.0.1:5173/Archaeology-Dig-App/?play=1
```

Check:

- Journey loads into playable state.
- HUD appears.
- Player can move, jump, attack, heavy attack, and dodge.
- At least one enemy and one hazard render.
- Dev editor still toggles only in dev and can build export.
- Opening/briefing still works without `?play=1`.

Stop the dev server after verification.

## Recommended Order and Stopping Points

Safe stopping points:

1. After Task 1: tests are split-safe, no gameplay code changed.
2. After Task 2: small visible component extracted, public import preserved.
3. After Task 5: most top-level pure data/config is out.
4. After Task 7: JSX is smaller, but behavior remains in the old component.
5. After Task 10: major refactor complete.

Do not start with:

- `update`
- `draw`
- pointer handlers
- `journeyPlacementOverrides.generated.js`
- the write-to-source editor pipeline

Those are the highest-risk areas and should move only after the smaller extractions prove the import/test structure.

## Final Verification Before Claiming Done

Run:

```text
git status --short --branch
node --test src/components/expedition-journey/journeyAudioSfx.test.js
node --test src/components/expedition-journey/journeyEnemySprites.test.js
node --test src/components/expedition-journey/journeyPlacementOverrides.test.mjs
node --test src/components/expedition-journey/journeySecrets.test.js
npm.cmd run lint
npm.cmd run build
```

For a full completion claim, also run the browser smoke check.

## Human-Facing Expectation

Most stages are internal only; the player probably will not see a gameplay difference. If a stage changes what the user sees, it should only be because the same HUD/editor/briefing/canvas is now rendered by a smaller component.
