# Journey Prop Editor — UX Pass Handover

> Handover for a fresh chat to start a UX pass on the in-game **Journey prop editor**.
> Written 2026-06-06. The previous session added a dev quick-start (`?play`) and a
> "Preview" overlay toggle; this doc is the starting point for the broader UX work.

---

## 0. Goal of this work

The Journey prop editor works but has grown feature-by-feature (colour grading, flip,
zIndex, draggable panel, locks, preview toggle) and accumulated UX papercuts. Do a
**deliberate UX pass**: improve layout, hierarchy, and affordances **without changing
what the editor can do**. Work in small, individually-verified slices — not a big-bang
rewrite. Confirm scope/priority with the user before large structural changes.

The user is a **non-coder, ideas-first creator** who relies on you as the technical
expert. Curate decisions for them; show results visually (screenshots), don't make them
read diffs.

---

## 1. What the editor is & how to open it

- It's a **dev-only** prop/level editor drawn on top of the Egypt "journey" gameplay
  canvas (the side-scrolling platformer). Gated by `import.meta.env.DEV`.
- Lives entirely in **`src/components/ExpeditionJourney.jsx`** (one ~22k-line file) plus
  styles in **`src/index.css`** (search `.journey-prop-editor`).

### Fast way to reach it
1. Start the dev server: `npm run dev` (Vite, port 5173, base path `/Archaeology-Dig-App/`).
2. Load **`http://localhost:5173/Archaeology-Dig-App/?play`** — the `?play` flag skips all
   menus/cutscenes and drops straight into the desert-entry journey gameplay. (There's
   also a "Dev: Skip to Desert Entry" button on the main menu.) See the
   `dev-play-shortcut` memory for details.
3. Press **Shift+E** to toggle the prop editor on/off. (Plain `E` is reserved for the
   in-world interact system.)

### Existing editor hotkeys (all require editor enabled, except Shift+E)
- `Shift+E` toggle editor · `G` grid snap · `P` palette · `T` trap triggers ·
  `H` preview (hide all editor chrome) · `Ctrl/Cmd+Z` undo · `Ctrl/Cmd+Shift+Z` / `Ctrl+Y` redo ·
  `Ctrl/Cmd+S` save export. (Handler: `handlePropEditorKeyDown`, ~line 19991.)

---

## 2. Code map (anchors — line numbers drift, search by name)

A linter/formatter touches this file, so **line numbers shift**. Always re-locate by
function/string name (Grep), don't trust the numbers below.

| What | Anchor | ~Line |
|---|---|---|
| Canvas dims `CANVAS_WIDTH=1120`, `CANVAS_HEIGHT=630` | `src/components/expedition-journey/journeyConstants.js` | 1–2 |
| Editor runtime state (refs, all flags) | `propPlacementEditorRef = useRef({ ... })` | ~3266 |
| Editor UI state (mirror for React render) | `const [propEditorUi, setPropEditorUi] = useState({ ... })` | ~3310 |
| Default-lock logic (locks ~218 items on open) | `applyDefaultEditorLocks` | ~3680 |
| Ref → UI sync (the `editorUiState` object) | `refreshPropEditorUi` | ~4234 |
| **Canvas overlay drawing** (selection border, tint, corners, labels, grid) | `drawPropPlacementEditorOverlay` | ~14835 |
| Selection corner markers | `drawEditorSelectionCorners` | ~14797 |
| Selection label chip | `drawEditorSelectionLabel` | ~14818 |
| Keyboard handler | `handlePropEditorKeyDown` | ~19991 |
| **The panel JSX** (toolbar, transform fields, etc.) | `<div className="journey-prop-editor-panel"` | ~20541 |
| Panel/header/button CSS | `src/index.css` → `.journey-prop-editor-panel` etc. | ~15260 |

---

## 3. How the editor is architected (patterns to FOLLOW)

State is split in two and kept in sync — important to understand before touching anything:

1. **`propPlacementEditorRef.current`** — a mutable ref holding all live editor state
   (selected ids, flags like `gridSnap`/`showTrapTriggers`/`previewMode`, edits, locks,
   undo stacks). The **canvas draw loop and pointer/keyboard handlers read/write this ref
   directly** every frame (no re-render needed).
2. **`propEditorUi`** — a React `useState` object that **mirrors** the ref for rendering
   the panel JSX.
3. **`refreshPropEditorUi()`** rebuilds `propEditorUi` from the ref and calls `setState`.
   **Call it after any ref mutation that the panel must reflect.**

**Template for adding a toggle** (copy this pattern — it's how `showTrapTriggers` and the
new `previewMode` work):
- add the flag to BOTH state objects (`propPlacementEditorRef` default + `propEditorUi` default),
- add it to the `editorUiState` object inside `refreshPropEditorUi`,
- read it where needed (draw loop / handlers),
- wire a hotkey in `handlePropEditorKeyDown` and/or a `<button>` in the panel JSX whose
  `onClick` mutates the ref then calls `refreshPropEditorUi()`. Button "active" style is
  `className={propEditorUi.flag ? 'is-selected' : ''}`.

**Reference example already in the tree:** the `previewMode` flag (press `H` / "Preview"
button). It makes `drawPropPlacementEditorOverlay` early-return so all editor chrome is
hidden — search `editor.previewMode` to see all the touch points end-to-end.

**Gotchas:**
- React **StrictMode is ON** (`src/main.jsx`) — mount effects run twice. Don't rely on
  mount-effect ordering; the previous session hit this hard.
- The journey canvas component is keyed by `journeyRunId` and **remounts** on various
  actions, resetting per-instance refs/state.
- The draw loop captures `drawPropPlacementEditorOverlay` via `useCallback`; HMR can leave
  a stale closure — do a **full reload** to be sure new draw code is live.

---

## 4. The papercuts to fix (prioritized — confirm with user before big moves)

Roughly highest-impact first. These are observations, not bugs; the editor functions.

> **Progress (2026-06-06):**
> - ✅ **#1 done** — added a **collapse toggle** (chevron ▾/▸ in the panel header). Collapses
>   the panel to a slim header+toolbar bar via an `is-collapsed` class; flag `panelCollapsed`
>   follows the `previewMode` pattern. (Chose collapse over dock/auto-shift per user.)
> - ✅ **#2 done** — toolbar **grouped** into "Actions" (Undo/Redo/Save) and "Modes" (the six
>   toggles) with labeled `.journey-prop-editor-action-group` sections + divider.
> - ✅ **#3 done** — locked-click affordance: selecting a locked item now shows a prominent
>   amber `.journey-prop-editor-lock-notice` banner with an inline **"🔓 Unlock to edit"**
>   button (and an unlocked/relock variant). Replaces the tiny grey "Selected item is locked"
>   line. Verified: click locked item → unlock → count 218→217.
> - ✅ **#5 done** (new, user-flagged) — **Ground contact layers** section cleanup. The bare
>   `<label>`s now get the panel's grid/uppercase-caption styling; Asset key spans 2 columns;
>   the raw-CSS **Filter** field is a full-width monospace row (was overflowing/wrapping);
>   inputs are `box-sizing:border-box` so they can't spill. CSS scoped to
>   `.journey-prop-editor-contact-row`. (JSX: added `journey-prop-editor-contact-asset` class.)
> - ⏭️ Remaining: **#4 redundant transform info**.

1. **Panel covers the work area.** `.journey-prop-editor-panel` is `position:absolute;
   top:0.62rem; left:0.72rem; width:min(21rem,…)`. At the displayed canvas size it covers
   ~40% of the left side, so objects you select on the left are hidden behind the panel
   while you edit them. **Biggest one.** Options to weigh with the user: collapsible panel,
   dock to a side/edge with a collapse toggle, make it auto-shift away from the current
   selection, or shrink/peek mode. The panel is already **draggable** (`editorPanelRef` +
   drag logic + `.journey-prop-editor-header:active`), so position is movable — but a
   default that doesn't obscure the selection is the goal.
2. **Toolbar is 9 ungrouped buttons** in one row (Undo, Redo, Save export, Palette, Grid,
   Triggers, Preview, Floors, Lock) mixing one-shot **actions** with **mode toggles**.
   Group/visually separate actions vs. toggles; consider icons + tooltips. JSX is in the
   panel block (~20541+); CSS `.journey-prop-editor-actions` (~15339).
3. **Default-lock affordance is confusing.** Opening the editor calls
   `applyDefaultEditorLocks`, locking ~218 items, so clicking an object frequently just
   shows *"Selected item is locked"* (panel string, ~20637) instead of selecting it.
   Make the locked state and how to unlock obvious (e.g. clearer messaging, one-click
   "unlock this", or rethink default-lock-everything).
4. **Redundant transform info.** The selected-item card shows X/Y/scale/rotation, and a
   separate `TRANSFORM` section repeats the same editable fields. Consolidate.

(While doing the above, also sanity-check visual hierarchy/spacing of the long scrolling
panel — it stacks many sections.)

---

## 5. Recommended approach & guardrails

- **Audit → prioritize → small verifiable slices.** Ship one papercut at a time, each
  screenshot-verified, rather than restructuring everything at once.
- **Don't remove capability.** This is a polish pass; every existing control/flow must
  still work.
- **CSS-first where possible.** Several wins (panel placement, toolbar grouping, spacing)
  are mostly `src/index.css` + light JSX, lower risk than touching the canvas/ref logic.
- **Keep it dev-only.** Everything here is behind `import.meta.env.DEV`; don't leak editor
  UI into production builds.
- Confirm direction with the user (a screenshot mock or a quick before/after) before any
  large structural change to the panel.

---

## 6. Verification workflow

Use the **preview_* MCP tools**, not Bash, to run/inspect (see the repo's preview tooling).
1. `preview_start` (config name `dev` in `.claude/launch.json`).
2. Navigate to `http://localhost:5173/Archaeology-Dig-App/?play`, wait for load
   (the file is huge — first compile can take several seconds; **the dev server
   recompiles/reloads when the file is edited**, so re-confirm "loaded" before asserting).
3. `Shift+E` to open the editor. Note: **synthetic keyboard events** dispatched via
   `preview_eval` are flaky against this app (they race re-renders/recompiles). Prefer
   clicking the actual panel **buttons** for verification; real hardware key presses work.
4. `preview_screenshot` to confirm visual changes; `preview_console_logs level:error` for errors.

Caveat seen last session: rapid edits → Vite recompiles → preview oscillates to the
"Loading expedition…" splash. Wait for it to settle (`/loading expedition/` gone, `canvas`
present) before screenshotting.

---

## 7. Git workflow

- Default branch `main`; the user has been happy to commit + push to `main` (fast-forward).
- Commit/push only when the user asks. End commit messages with:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- `tmp/` contains throwaway image-gen scratch — **don't commit it** (stage files explicitly).
- This handover file itself (`EDITOR_UX_HANDOVER.md`) can be deleted once the pass is done.

---

## 8. Recent related context (already shipped)

- `?play` quick-start + "Dev: Skip to Desert Entry" menu button (memory: `dev-play-shortcut`).
- Dodge now triggers on `L` only (Shift removed).
- The `previewMode` / `H` toggle described above — your best worked example of the
  toggle pattern.

See the project memory index (`MEMORY.md`) for more: `project_overview`, `combat_system`,
`project_rome_expedition`, `editor-ux-pass-deferred` (now superseded by this doc).
