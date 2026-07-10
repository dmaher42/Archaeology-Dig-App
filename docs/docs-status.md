# Docs Status Guide

This file explains how to interpret the Markdown files in this repo after the current story-direction cleanup.

Lost Site Expedition is now treated as a standalone indie archaeology action-adventure first. Historical grounding should come through world, story, gameplay, atmosphere, mystery, relics, tomb design, guardians, afterlife logic, and player consequence.

It should not be treated as a classroom-first or worksheet-style educational tool.

---

## Quick Decision Rule

If a Markdown file conflicts with the current source-of-truth set, do not average the documents together.

Use the source-of-truth set below, then treat the conflicting file as supporting, historical, or in need of update.

`progress.md` records what happened. It does not override the Production Bible, Story Bible, Story Arc, Standalone Game Rule, or Room Order.

---

## Current Source-Of-Truth Order

Use these files first when making decisions:

1. `docs/lost-site-expedition-production-bible.md`
   - Production process, implementation standards, canonical systems, quality checks.
2. `docs/standalone-game-rule.md`
   - Game-first philosophy and learning-through-world rule.
3. `docs/lost-site-expedition-story-bible.md`
   - Core story foundation, Asha, Anubis, Queen, memory anchors, tomb object meaning.
4. `docs/lost-site-expedition-story-arc.md`
   - Narrative sequence, character arcs, room story roles, and threshold mystery.
5. `docs/egypt-act-1-room-order.md`
   - Egypt Act 1 route order and room placement.
6. `docs/lost-site-expedition-journey-progression-map.md`
   - Journey section progression, shard/restoration choice, Anubis judgement pressure, and revisit structure.
7. `docs/lost-site-expedition-design-brief.md`
   - High-level design vision.
8. `docs/docs-status.md`
   - Which Markdown files are current, supporting, historical, or stale.
9. `AGENTS.md`
   - Codex handover rules, current working checkout, canonical implementation paths, and current dirty-worktree warning.
10. `README.md`
   - Public project overview and technical run commands.
11. `progress.md`
   - Running implementation history and recent work notes.

If any older planning, handover, or asset document conflicts with these files, follow the current source-of-truth files above.

---

## Absolute Current Rules

These are current and should be treated as firm unless the user explicitly changes direction:

- Lost Site Expedition is the main premium game direction inside Archaeology-Dig-App.
- It is a standalone indie archaeology action-adventure first, not a classroom-first worksheet layer.
- The source-of-truth hierarchy starts with `docs/lost-site-expedition-production-bible.md`.
- Narrative direction comes from `docs/lost-site-expedition-story-bible.md` and `docs/lost-site-expedition-story-arc.md`.
- Egypt Act 1 room order comes from `docs/egypt-act-1-room-order.md`.
- Future implementation must extend the existing React/Vite/Journey systems rather than create duplicate systems.
- Character, enemy, NPC, boss, or sprite-sheet work must read `docs/character-sprite-pipeline.md` before asset or loader edits.
- Asset deletion or movement requires a role audit first; do not delete runtime/source/reference/trailer assets by guesswork.

---

## Markdown Status Map

### Current And Prominent

These files should be read early and kept visible:

| File | Status | Use |
| --- | --- | --- |
| `docs/lost-site-expedition-production-bible.md` | Absolute | Top-level production, implementation, pipeline, quality, and canonical-system guide. |
| `docs/standalone-game-rule.md` | Absolute | Protects the game-first direction. |
| `docs/lost-site-expedition-story-bible.md` | Absolute | Current narrative foundation. |
| `docs/lost-site-expedition-story-arc.md` | Absolute | Current sequence, character arc, room purpose, and reveal pacing. |
| `docs/egypt-act-1-room-order.md` | Absolute | Canonical Egypt Act 1 route and room placement. |
| `docs/lost-site-expedition-journey-progression-map.md` | Current supporting | Journey section progression, shard/restoration choice, revisit structure, and Anubis judgement pressure. |
| `docs/lost-site-expedition-design-brief.md` | Current supporting | High-level design vision; supports the files above. |
| `docs/docs-status.md` | Current supporting | This interpretation map. Keep it linked from entry points. |
| `AGENTS.md` | Current supporting | Codex workflow, checkout, verification commands, and dirty-worktree context. |
| `README.md` | Current supporting | Human-facing overview and run commands. |
| `progress.md` | Current supporting | Running implementation history; useful but not final direction. |

### Current Specialist Sources

These are authoritative inside their narrower scope:

| File | Status | Use |
| --- | --- | --- |
| `docs/character-sprite-pipeline.md` | Absolute for sprite work | Character, NPC, enemy, boss, and sprite-sheet workflow. |
| `docs/expedition-asset-tidy-audit.md` | Current supporting | Asset role taxonomy, cleanup warnings, and safe tidy order. |
| `docs/guardian-seal-trigger-plan.md` | Current plan | Future Guardian Seal trigger implementation brief. |
| `docs/guardian-seal-placement-plan.md` | Current plan | Future Guardian Seal placement constraints. |
| `docs/egypt-sacred-trap-asset-plan.md` | Current plan | Trap and sacred-defence asset planning. |
| `docs/sphinx-boss-visual-brief.md` | Current asset brief | Sphinx boss visual direction before generation/wiring. |
| `docs/china-asset-audit.md` | Current audit | China Expedition asset gaps and reuse warnings. |
| `docs/china-asset-pipeline.md` | Current plan | China Expedition asset generation/integration plan. |
| `docs/museum-image-sources.md` | Current reference | Museum image sourcing and attribution notes. |
| `docs/superpowers/specs/2026-06-04-fast-fluid-combat-design.md` | Current spec | Combat direction/specification. |
| `docs/superpowers/plans/2026-06-04-fast-fluid-combat-slice-1.md` | Current implementation plan | Combat slice 1 plan; use only when executing that slice. |
| `asset-sources/expedition/bosses/source/scarab-queen-v2-animation-contract.md` | Current asset contract | Scarab Queen V2 animation contract. |
| `asset-sources/expedition/bosses/source/scarab-queen-v2-generation-prompts.md` | Current asset prompt reference | Scarab Queen V2 generation prompts. |
| `public/assets/expedition/sfx/opening/OPENING_SFX_LICENSES.md` | Current asset/license note | Opening SFX licenses. |
| `public/assets/expedition/sfx/generated/README.md` | Current asset note | Generated SFX folder note. |

### Historical Or Lower-Prominence Reference

These files may still contain useful evidence, but should not drive current direction:

| File | Status | Use |
| --- | --- | --- |
| `THE_ANTIQUITIES_BUREAU_TEACHER_GUIDE.md` | Historical/classroom reference | Bureau/classroom mode guidance, not Lost Site production direction. |
| `docs/egypt-journey-opening-guardian-handover.md` | Historical handover | Older guardian/opening handoff; check current code/docs before using. |
| `docs/egypt-boss-identity-upgrade-plan.md` | Historical/partial plan | Boss identity planning; do not override current Story Bible or sprite pipeline. |
| `docs/asha-player-sprite-atlas-prep-report.md` | Historical asset review | Asha atlas prep notes; use `character-sprite-pipeline.md` first. |

---

## Needs Updating Or More Prominence

Current audit result:

- `docs/docs-status.md` needed more prominence as the single map for Markdown status; it should stay linked from `README.md`, `AGENTS.md`, and the Production Bible.
- `AGENTS.md` must stay synced with the actual dirty worktree. If the active branch or WIP files change, update only the Current Work In Progress section.
- `README.md` should keep the production/source-of-truth list aligned with this status guide.
- Older classroom-facing docs should remain available, but should be clearly treated as historical/supporting when working on Lost Site Expedition.
- One-off plans should not be deleted just because they are old; mark as historical/reference when they start conflicting with current direction.

---

## Current Story Direction

The current story direction is:

- Asha is the single protagonist.
- Asha is a young female heritage researcher / archaeologist-in-training living and working in Egypt.
- Asha enters the Lost Site through a present-day scarab inconsistency, not because she is seeking treasure.
- The Lost Site is a hidden Duat-touched memory-world, not ordinary historical Egypt.
- Tomb objects are not generic loot. In the hidden mythology, they are memory anchors.
- Anubis is suspicious and judgement-focused. He judges Asha by action, not words.
- The Queen is the centre of the contested truth and should not be reduced to a simple evil boss.
- Egypt is the first complete vertical slice and first seal in a wider guardian-network mystery.

Core theme:

> The past is not treasure to own. It is memory to protect.

Key Anubis reveal:

> It was not treasure they stole. It was memory.

---

## Current Room Order

Use `docs/egypt-act-1-room-order.md` for the canonical Egypt Act 1 order:

1. Desert Entry / Arrival
2. Temple Approach
3. Mummification Room / Mummification Chamber
4. Mural Room / Forgotten Mural Chamber
5. Scribes' Locked Chamber
6. Queen / Scarab Queen section
7. Deeper tomb / guardian reveal
8. Discovery entrance
9. Base Camp
10. Excavation / evidence interpretation

Do not use old planning notes to move rooms unless the room-order doc is updated first.

---

## Historical / Reference Docs

The following kinds of docs should be treated as historical or supporting context, not current story truth:

- handover notes
- old audit notes
- asset-generation plans
- one-off implementation plans
- previous prompt drafts
- rejected asset briefs
- early boss-identity experiments
- old MVP education plans

These files may still contain useful implementation history, asset references, or warnings. They should not override the current Story Bible, Story Arc, Standalone Game Rule, Production Bible, or Egypt Act 1 Room Order.

---

## Cleanup Rules For Older Docs

When a future doc seems outdated:

1. Do not delete it immediately.
2. Check whether runtime code, tests, assets, or progress notes still reference it.
3. If it is only historical, mark it as historical/reference at the top.
4. If it conflicts with current direction, update the current source-of-truth files instead of creating another competing story file.
5. If a file is truly obsolete and unused, remove it only after an audit.

---

## Terms To Avoid In New Story Docs

Avoid framing the game as:

- a worksheet
- a lesson
- a classroom tool
- a direct teaching system
- a quiz-based experience
- an educational popup layer

Prefer framing it as:

- a standalone indie adventure
- a mythic archaeology action-adventure
- a dangerous protected site
- a memory-world
- a story of protection, interpretation, and consequence
- historical grounding through gameplay

---

## Current Open Cleanup Items

- Keep this status guide prominent whenever new planning docs are added.
- If a new doc becomes authoritative, add it to the relevant table above instead of letting it compete silently.
- If a historical doc is still useful but stale, add a short historical/reference note at the top of that file during the next relevant pass.
