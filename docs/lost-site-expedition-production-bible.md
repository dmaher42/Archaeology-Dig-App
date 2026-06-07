# Lost Site Expedition Production Bible

This document is the top-level production guide for **Lost Site Expedition** in Archaeology-Dig-App.

Lost Site Expedition has grown beyond the original small classroom MVP. It is now the main standalone archaeology action-adventure / platformer direction inside the repo.

The archaeology systems still matter, but they should deepen the adventure through Base Camp, excavation, evidence, lab, and interpretation layers rather than interrupting core play.

---

## 1. Project Identity

Lost Site Expedition should feel like a polished standalone archaeology adventure first.

The player fantasy is:

> I am an explorer caught inside a dangerous sacred site, trying to survive, understand what happened, and restore what was broken.

The experience should not feel like:

> I am completing a worksheet inside a game.

Historical grounding should make the world more believable and meaningful. Fiction drives the story. Gameplay teaches without stopping the player.

Core story theme:

> The past is not treasure to own. It is memory to protect.

Key Anubis reveal:

> It was not treasure they stole. It was memory.

---

## 2. Source-of-Truth Hierarchy

Use this document first for production decisions, implementation order, pipelines, and quality standards.

Supporting documents:

- `docs/standalone-game-rule.md` - game-first, learning-through-world rule.
- `docs/lost-site-expedition-story-bible.md` - current narrative foundation, Asha, Anubis, the Queen, memory anchors, and major story rules.
- `docs/lost-site-expedition-story-arc.md` - narrative sequence, character arcs, room story roles, and threshold reveal.
- `docs/egypt-act-1-room-order.md` - canonical Egypt Act 1 exterior route and room placement.
- `docs/lost-site-expedition-design-brief.md` - broad design vision and emotional arc.
- `docs/docs-status.md` - document status, historical/reference notes, and cleanup guidance.
- `docs/expedition-asset-tidy-audit.md` - asset roles, audit warnings, and cleanup order.
- `progress.md` - running implementation history and recent work notes.

If documents appear to conflict, follow this order:

1. Production Bible for implementation process and quality standards.
2. Standalone Game Rule for game-first philosophy.
3. Story Bible for narrative foundation.
4. Story Arc for sequence, character progression, and story tone.
5. Egypt Act 1 Room Order for room placement.
6. Design Brief for broad direction.
7. Docs Status for interpreting older files.
8. Asset Audit for asset cleanup and file-role decisions.
9. Progress notes for historical context, not final direction.

---

## 3. Canonical Implementation Files

Inspect the current implementation before making changes. Do not invent a parallel system if one already exists.

Core files:

- App entry and main state flow: `src/App.jsx`
- Lost Site Expedition shell, Base Camp, excavation, evidence, and report loop: `src/components/ExpeditionMode.jsx`
- Journey platformer orchestration: `src/components/ExpeditionJourney.jsx`
- Journey data, gates, enemies, objectives, collectibles, events, helpers, and room/level logic: `src/components/expedition-journey/`
- Expedition stage selection, excavation maps, and stage metadata: `src/components/expedition/`
- Archaeology evidence, categories, scenarios, and shared label helpers: `src/data.js`
- Main styling: `src/index.css`
- Runtime Expedition assets: `public/assets/expedition/`
- Museum/report imagery: `public/museum/`

Do not create parallel systems for progression, economy, player control, animation, evidence, inventory, excavation, lab, museum, report, Bureau, Base Camp, bosses, rooms, dialogue, gates, or Journey.

---

## 4. Current Experience Model

The intended high-level flow is:

1. Journey platformer
2. Discovery entrance
3. Base Camp
4. Excavation site
5. Lab / evidence interpretation / report reward

The intended emotional arc is:

1. **Arrival** - Asha investigates a real-world scarab inconsistency and is pulled into the Lost Site.
2. **Rejection** - Anubis judges her as another trespasser.
3. **Preparation** - shards, tools, route choices, combat mastery, and discoveries give reasons to explore.
4. **Guardian challenge** - bosses feel earned through preparation and route mastery.
5. **Sacred rooms** - mummification, murals, scribes, and the Queen build the contested memory mystery.
6. **Discovery** - the route opens into a memorable tomb or excavation entrance moment.
7. **Base Camp** - the player prepares, reviews, spends, and chooses how to investigate.
8. **Excavation** - the player surveys, grids, excavates carefully, maps, and records finds.
9. **Interpretation** - evidence is catalogued, analysed, and used to build a claim or story understanding.

---

## 5. Current Story Foundation

Current story rules:

- Asha is the single protagonist: a present-day female heritage researcher / archaeologist-in-training living and working in Egypt.
- She enters the Lost Site through an ordinary-looking scarab threshold after connecting a new site-record inconsistency to a forgotten tomb-painting photograph.
- The threshold is intended to change her modern field clothes into trial-ready Lost Site garb; this is a judgement/survival mark, not a chosen-one reveal. (Planned visual — not yet depicted in-game.)
- The Lost Site is a hidden Duat-touched memory-world, not ordinary historical Egypt.
- Tomb objects are not generic loot. In the hidden mythology, they are memory anchors.
- Memory anchors preserve names, identity, relationships, rituals, afterlife passage, and the wholeness of the dead.
- Anubis sees Asha as another human who will take from the dead.
- The Queen is the centre of the contested truth and should not be a simple evil boss.
- Egypt is the first complete vertical slice and first seal in a wider guardian-network mystery.

---

## 6. Room Implementation Pipeline

Every new room or major area must be designed before it is implemented.

For each room, define:

- Room name
- Placement in the current room order
- Story purpose
- Player emotion
- Main gameplay verb or challenge
- Historical / mythic inspiration
- Evidence, memory, or afterlife purpose
- Required assets
- Required enemies, hazards, boss, or NPC beats
- Entry transition
- Exit transition
- Completion condition
- Player reward
- State/progression flags affected
- Tests/build checks required

A room should not be added just because it is visually interesting. It must either deepen exploration, develop the story, teach a mechanic through play, create mystery, test player skill, reveal evidence, restore memory, or unlock a meaningful next step.

---

## 7. Current Room-Order Rule

Before adding or moving a room, update the canonical room order in `docs/egypt-act-1-room-order.md` and relevant Journey data/story documentation.

Known current direction for exterior route structures and major beats:

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

Chamber interiors should remain separate spaces. The player enters from an exterior artwork doorway and exits back to that exterior structure area, rather than moving directly from one chamber interior into another.

---

## 8. Asset Pipeline

Every Expedition asset should have a clear role.

Use these labels when documenting or changing assets:

- Runtime asset - used directly by gameplay.
- Fallback asset - kept as a safe backup for a runtime path.
- Candidate asset - under review and not yet active.
- Source/reference asset - used to generate or compare assets, not directly wired into gameplay.
- Trailer-only asset - used by trailer or promotional scenes, not core runtime.
- Deprecated/archive asset - kept for history but no longer intended for active use.
- Obsolete asset - proven unused by runtime, tests, trailer, docs, and stage previews; can be removed only after audit.

Do not move or delete assets until references have been checked across runtime code, loaders, tests, trailer code, stage preview metadata, and docs.

Preserve existing PNG + JSON atlas contracts unless deliberately changing the loader.

---

## 9. Premium Quality Checklist

Before a room or feature is considered complete, check:

- Movement feels responsive.
- Combat feels readable, risky, and satisfying.
- Camera supports the room idea, especially vertical secrets and reveals.
- Platforms and ledges visually match the collision/platform layout.
- Entrances and exits are readable.
- Lighting, atmosphere, dust, shadows, or glow support the mood.
- Sound and ambience support the room.
- The player has a reason to explore.
- The room has a clear gameplay purpose.
- The room has a clear story purpose.
- The room belongs in the current world tone.
- The room does not rely on worksheet-style interruption.
- Historical grounding is embedded through evidence, ruins, tools, preservation, afterlife logic, memory, context, or interpretation.
- Any optional secret creates curiosity, risk, and wonder rather than just extra platforms.
- Bosses or guardians feel earned by preparation and route mastery.
- Asha earns Anubis' reconsideration through action, not speeches.

---

## 10. Game-First Historical Design Rule

The game should teach historical thinking through play.

Prefer:

- environmental storytelling
- murals and inscriptions
- ruins and architecture
- tomb layout and ritual purpose
- artefacts as memory anchors
- excavation choices
- preservation systems
- field notes
- tool use
- route discovery
- optional lore
- careful interpretation systems
- consequences for taking, breaking, restoring, or preserving

Avoid:

- disconnected quiz popups
- long text walls during action gameplay
- constant pausing for explanation
- fake worksheet interfaces
- overexplaining historical facts
- educational tasks that interrupt pacing
- direct classroom-style objectives inside Journey gameplay

---

## 11. Story and Character Rules

Follow `docs/lost-site-expedition-story-bible.md` and `docs/lost-site-expedition-story-arc.md` for story decisions.

Important standing rules:

- Asha is the single protagonist.
- Do not split Asha into separate protagonist and archaeologist roles unless a new character is deliberately designed and approved.
- Do not make Anubis friendly too early.
- Do not make Asha trusted because she says the right thing.
- Asha earns reconsideration by restoring, protecting, interpreting, and acting carefully.
- Do not reveal the transport / threshold-network twist too early.
- Egypt remains the first complete vertical slice and the first seal.
- Optional secrets may foreshadow the wider mystery, but should create curiosity rather than explain everything.
- Do not make the Queen a simple evil boss.
- Do not treat relics, tomb objects, or grave goods as generic loot.

---

## 12. Do-Not-Do Rules

Do not:

- create a second Expedition mode
- create duplicate Journey/progression systems
- create a new player animation loader unless the existing loader cannot be extended
- wire source/reference images directly into runtime
- delete candidate or reference assets without an audit
- add isolated rooms without placing them in the room order
- treat Expedition as a worksheet wrapper
- add educational popups as the main teaching method
- let new rooms contradict the story bible or story arc
- let placeholders become permanent without being labelled
- rely on memory from previous chats without inspecting the repo
- use older handover/planning docs as current source of truth when they conflict with the Production Bible, Story Bible, Story Arc, Standalone Game Rule, or Egypt Act 1 Room Order

---

## 13. Recommended Next Work Order

The safest next production sequence is:

1. Keep combat implementation aligned with the fast-fluid combat design and ensure dodge/animation polish is complete before deeper combat expansion.
2. Lock the current Egypt Act 1 room order.
3. Confirm the Scribes' Locked Chamber sits after the Mural Room and before the Queen section.
4. Verify the Mummification Room before the Mural Room.
5. Replace Scribes' Locked Chamber placeholders with a clear final asset contract before generating final art.
6. Perform a story-room pass so each current room clearly supports memory, afterlife, Anubis judgement, or the Queen's contested truth.
7. Audit active, fallback, source, candidate, and trailer-only asset roles.
8. Only then continue expanding new rooms or guardian content.

---

## 14. Acceptance Criteria For Future Production Changes

For every future Expedition change:

- State which canonical file or system is being extended.
- State whether the change affects Journey, Base Camp, excavation, evidence, story, assets, audio, combat, or UI.
- Confirm no parallel system was created.
- Confirm asset roles if assets are added or changed.
- Confirm the change does not contradict game-first design.
- Confirm the change does not contradict Asha, Anubis, Queen, memory-anchor, or room-order rules.
- Run the relevant tests where available.
- Run `npm run lint` and `npm run build` when possible.
- Browser-check visible gameplay changes when possible.
- Update `progress.md` with a short implementation note.
- Update this bible or the relevant supporting doc if the source of truth changes.
