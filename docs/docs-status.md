# Docs Status Guide

This file explains how to interpret the Markdown files in `docs/` after the current story-direction cleanup.

Lost Site Expedition is now treated as a standalone indie archaeology action-adventure first. Historical grounding should come through world, story, gameplay, atmosphere, mystery, relics, tomb design, guardians, afterlife logic, and player consequence.

It should not be treated as a classroom-first or worksheet-style educational tool.

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
6. `docs/lost-site-expedition-design-brief.md`
   - High-level design vision.

If any older planning, handover, or asset document conflicts with these files, follow the current source-of-truth files above.

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

## Current Open Cleanup Item

`docs/lost-site-expedition-production-bible.md` still remains the top-level production source of truth. It already supports the game-first direction, but future cleanup should align its source-of-truth hierarchy with this status file and the updated story bible.
