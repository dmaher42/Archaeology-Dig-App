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
- Use plain Year 7 classroom-friendly wording.
- For UI/game changes, verify in the browser where possible.

## Current Source Of Truth

- App entry and main state flow: `src/App.jsx`
- Archaeology evidence/scenario data: `src/data.js`
- Lost Site Expedition shell: `src/components/ExpeditionMode.jsx`
- Journey stage orchestration: `src/components/ExpeditionJourney.jsx`
- Journey helpers/data: `src/components/expedition-journey/`
- Training screen currently being polished: `src/components/TrainingPhase.jsx`
- Main styling: `src/index.css`
- Running progress notes: `progress.md`

## Current Work In Progress

The local worktree intentionally has uncommitted changes:

- `progress.md`
- `src/components/TrainingPhase.jsx`
- `src/index.css`
- `output/`
- `scratch/sfx-source/`

These came from the previous Codex session and should be treated as active work, not clutter.

The visible current change appears to be a Training Phase layout/style pass:

- the Training Phase header and summary were simplified
- progress was moved into the hero action area
- slot/card layout and CSS spacing were tightened
- the page was made more compact and projector-friendly

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
