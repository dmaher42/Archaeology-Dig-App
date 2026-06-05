# Archaeology Dig App Codex Handover

This is the local non-OneDrive working repo. Use this path for Codex work:

```text
C:\Users\dmahe\Documents\LocalCodex\Archaeology-Dig-App
```

Do not use the old OneDrive backup path for active work:

```text
C:\Users\dmahe\OneDrive\Desktop\Codex\Archaeology-Dig-App1
```

## Working Rules

- Inspect the current implementation before editing.
- Extend the existing systems. Do not create duplicate gameplay, save/load, inventory, evidence, Bureau, boss, or expedition systems.
- Keep changes small and in the canonical files already used by the app.
- Preserve uncommitted work unless the user explicitly asks to discard it.
- If a feature already exists partially, repair or extend it in place instead of replacing it with a parallel version.
- Use concise, readable adventure-game wording. Do not default to Year 7 or classroom-safe tuning unless the user explicitly asks for a classroom mode.
- For UI/game changes, verify in the browser where possible.

## Usage Management

Default to a scoped pass, not a full deep pass. Classify each request before doing heavy work:

- Quick check: inspect only the smallest relevant files, answer plainly, make no edits, and skip browser checks or tests unless essential.
- Narrow fix: inspect the canonical source path, make the smallest safe change, and run the narrowest useful verification.
- Deep pass: use only when the user explicitly asks for an audit, redesign, gameplay implementation, asset generation, browser playtest, commit, or push.

For this Archaeology project:

- Prefer this LocalCodex checkout unless the user names another path.
- Start by identifying the canonical source of truth, but keep inspection bounded to the likely files.
- Do not regenerate images, sprites, audio, or other large assets until the current asset pipeline and acceptance criteria are confirmed.
- For any character, enemy, boss, NPC, or sprite-sheet task, read `docs/character-sprite-pipeline.md` before editing assets or runtime loaders.
- Do not run long natural browser playthroughs by default. Prefer short state-focused browser checks, existing tests, and build/lint verification.
- Do not leave dev servers, preview servers, browser helpers, or Playwright/headless processes running after verification.
- For longer playtesting, prefer the existing low-power/static playtest flow over a hot dev server when practical.
- If a task is only wording, layout, or tuning, do not broaden into a full gameplay redesign.

When the conversation becomes long:

- If the thread has shifted goals more than twice, has repeated failed verification loops, or has grown into a broad multi-hour context, stop before starting another major pass.
- Tell the user: "This conversation is getting long. Starting fresh will likely use less Codex usage."
- Provide a compact handoff summary with the current repo path, current goal, files changed or inspected, what is confirmed, what remains unclear, exact next recommended step, and tests/build/browser checks already run.
- Ask the user to start a new conversation with that summary before continuing major work.

## Current Source Of Truth

- Markdown status and doc hierarchy: `docs/docs-status.md`
- Lost Site production guide: `docs/lost-site-expedition-production-bible.md`
- Game-first rule: `docs/standalone-game-rule.md`
- Narrative source of truth: `docs/lost-site-expedition-story-bible.md`
- Narrative sequence: `docs/lost-site-expedition-story-arc.md`
- Egypt Act 1 room order: `docs/egypt-act-1-room-order.md`
- App entry and main state flow: `src/App.jsx`
- Archaeology evidence/scenario data: `src/data.js`
- Lost Site Expedition shell: `src/components/ExpeditionMode.jsx`
- Journey stage orchestration: `src/components/ExpeditionJourney.jsx`
- Journey helpers/data: `src/components/expedition-journey/`
- Training screen currently being polished: `src/components/TrainingPhase.jsx`
- Main styling: `src/index.css`
- Running progress notes: `progress.md`

## Current Work In Progress

The local worktree may intentionally have uncommitted changes. Always verify with `git status --short --branch` before assuming the current WIP.

Current observed WIP from the 2026-06-05 Markdown audit:

- Branch: `mummification-ritual-lock-upgrade`
- `src/components/ExpeditionJourney.jsx`
- `src/components/expedition-journey/journeyPlacementOverrides.generated.js`
- `src/components/expedition-journey/journeySecrets.test.js`
- `src/components/expedition-journey/journeyUtils.js`

These should be treated as active Journey/mummification-room work, not clutter, unless the user explicitly asks to discard or split them.

The visible current change appears to be a Mummification Chamber ritual polish/lock-upgrade pass:

- wrong/careless rite actions stir the chamber instead of silently failing
- rite prompts and ritual hints were made clearer
- oils/resins and name-fragment restoration became more deliberate
- Journey tests and placement overrides were adjusted alongside the runtime path

Before continuing that work, review the diff and run the app locally.

## Verification Commands

Use Windows commands:

```text
npm.cmd run lint
npm.cmd run build
```

Start the local dev server from this repo:

```text
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Known build warnings may mention existing runtime-resolved expedition images and a large bundle. Do not treat those as new failures unless they change or break the app.

## Suggested Prompt For A New Codex Project

Use this when starting a new Codex project:

```text
Use C:\Users\dmahe\Documents\LocalCodex\Archaeology-Dig-App as the repo.

First read AGENTS.md, progress.md, git status, and the current diff.
Continue from the existing uncommitted work.
Do not create duplicate systems.
Extend the existing App.jsx / ExpeditionMode / ExpeditionJourney / TrainingPhase / data.js architecture.
If you are unsure where a feature belongs, inspect the current source of truth before editing.
```
