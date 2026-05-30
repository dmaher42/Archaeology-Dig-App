# Lost Site Expedition Production Bible

This document is the top-level production guide for Lost Site Expedition in Archaeology-Dig-App.

Lost Site Expedition has grown beyond the original small classroom MVP. It is now the main standalone archaeology adventure/platformer direction inside the repo. The original archaeology learning systems still matter, but they should deepen the adventure through Base Camp, excavation, evidence, lab, and report layers rather than interrupting core play.

## 1. Project identity

Lost Site Expedition should feel like a polished archaeology adventure first.

The player fantasy is:

> I am an explorer uncovering a dangerous protected ancient site.

The experience should not feel like:

> I am completing a worksheet inside a game.

The learning is strongest when the player learns through movement, exploration, evidence, tools, ruins, murals, excavation choices, preservation, and interpretation.

## 2. Source-of-truth hierarchy

Use this document first for production decisions, implementation order, pipelines, and quality standards.

Supporting documents:

- `docs/lost-site-expedition-design-brief.md` - design vision and emotional arc.
- `docs/standalone-game-rule.md` - protects the game-first, learning-through-world rule.
- `docs/lost-site-expedition-story-arc.md` - narrative, character roles, Anubis/Asha trust arc, threshold reveal, and story tone.
- `docs/expedition-asset-tidy-audit.md` - current asset roles, audit warnings, and cleanup order.
- `progress.md` - running implementation history and recent work notes.

If documents appear to conflict, follow this order:

1. Production Bible for implementation process and quality standards.
2. Story Arc for narrative and character decisions.
3. Standalone Game Rule for educational/gameplay philosophy.
4. Design Brief for broad design direction.
5. Asset Audit for asset cleanup and file-role decisions.
6. Progress notes for historical context, not final direction.

## 3. Canonical implementation files

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

Do not create parallel systems for progression, economy, player control, animation, evidence, inventory, excavation, lab, museum, report, Bureau, Base Camp, bosses, rooms, or Journey.

## 4. Current experience model

The intended high-level flow is:

1. Journey platformer
2. Discovery entrance
3. Base Camp
4. Excavation site
5. Lab / evidence interpretation / report reward

The intended emotional arc is:

1. Arrival - the player enters an ancient landscape and sees a clear expedition goal.
2. Preparation - shards, tools, map clues, route choices, and discoveries give reasons to explore.
3. Guardian challenge - bosses feel earned through preparation and route mastery.
4. Discovery - the route opens into a memorable tomb or excavation entrance moment.
5. Base Camp - the player prepares, spends, reviews, and chooses how to investigate.
6. Excavation - the player surveys, grids, excavates carefully, maps, and records finds.
7. Interpretation - evidence is catalogued, analysed, and used to build a claim/report.

## 5. Room implementation pipeline

Every new room or major area must be designed before it is implemented.

For each room, define:

- Room name
- Placement in the current room order
- Story purpose
- Player emotion
- Main gameplay verb or challenge
- Archaeology/evidence purpose
- Required assets
- Required enemies, hazards, boss, or NPC beats
- Entry transition
- Exit transition
- Completion condition
- Player reward
- State/progression flags affected
- Tests/build checks required

A room should not be added just because it is visually interesting. It must either deepen exploration, develop the story, teach a mechanic through play, create mystery, test player skill, reveal evidence, or unlock a meaningful next step.

## 6. Current room-order rule

Before adding or moving a room, update the canonical room order in the relevant Journey data/story documentation.

Known current direction for exterior route structures and major beats:

1. Desert / arrival route
2. Temple approach
3. Mummification Room
4. Mural Room
5. Scribes' Locked Chamber
6. Queen / Scarab Queen section
7. Deeper tomb or guardian reveal
8. Discovery entrance
9. Base Camp
10. Excavation / evidence interpretation

This order may change, but it must change in one source of truth before code changes are made. Do not implement rooms in random order without confirming where they sit in the player journey. Chamber interiors should remain separate spaces: the player enters from an exterior artwork doorway and exits back to that exterior structure area, rather than moving directly from one chamber interior into another.

## 7. Asset pipeline

Every Expedition asset should have a clear role.

Use these labels when documenting or changing assets:

- Runtime asset - used directly by gameplay.
- Fallback asset - kept as a safe backup for a runtime path.
- Candidate asset - under review and not yet active.
- Source/reference asset - used to generate or compare assets, not directly wired into gameplay.
- Trailer-only asset - used by trailer or promotional scenes, not core runtime.
- Deprecated/archive asset - kept for history but no longer intended for active use.
- Obsolete asset - proven unused by runtime, tests, trailer, docs, and stage previews; can be removed only after audit.

Do not move or delete assets until references have been checked across:

- runtime code
- Journey loaders
- Expedition loaders
- tests
- trailer code
- stage preview metadata
- docs

Preserve existing PNG + JSON atlas contracts unless deliberately changing the loader.

## 8. Premium quality checklist

Before a room or feature is considered complete, check:

- Movement feels responsive.
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
- Archaeology is embedded through evidence, ruins, tools, preservation, context, or interpretation.
- Any optional secret creates curiosity, risk, and wonder rather than just extra platforms.
- Bosses or guardians feel earned by preparation and route mastery.
- Asha earns trust through action, not speeches.

## 9. Educational design rule

The game should teach historical thinking through play.

Prefer:

- environmental storytelling
- murals and inscriptions
- ruins and architecture
- excavation choices
- artefacts and evidence
- preservation systems
- field notes
- tool use
- route discovery
- optional lore
- careful interpretation systems

Avoid:

- disconnected quiz popups
- long text walls during action gameplay
- constant pausing for explanation
- fake worksheet interfaces
- overexplaining historical facts
- educational tasks that interrupt pacing

## 10. Story and character rules

Follow `docs/lost-site-expedition-story-arc.md` for story decisions.

Important standing rules:

- Do not make Anubis friendly too early.
- Do not make Asha trusted because he says the right thing.
- Asha earns trust by restoring, protecting, interpreting, and acting carefully.
- Do not reveal the transport / threshold-network twist too early.
- Egypt remains the first complete vertical slice and the first seal.
- Optional secrets may foreshadow the wider mystery, but should create curiosity rather than explain everything.

## 11. Do-not-do rules

Do not:

- create a second Expedition mode
- create duplicate Journey/progression systems
- create a new player animation loader unless the existing loader cannot be extended
- wire source/reference images directly into runtime
- delete candidate or reference assets without an audit
- add isolated rooms without placing them in the room order
- treat Expedition as a worksheet wrapper
- add educational popups as the main teaching method
- let new rooms contradict the story arc
- let placeholders become permanent without being labelled
- rely on memory from previous chats without inspecting the repo

## 12. Recommended next work order

The safest next production sequence is:

1. Lock the current Egypt Act 1 room order.
2. Identify where the Scribes' Locked Chamber is currently implemented.
3. Move or rewire the Scribes' Locked Chamber exterior structure so it sits after the Mural Room structure and before the Queen section.
4. Add or verify the Mummification Room before the Mural Room.
5. Replace Scribes' Locked Chamber placeholders with a clear final asset contract before generating final art.
6. Audit active, fallback, source, candidate, and trailer-only asset roles.
7. Only then continue expanding new rooms or guardian content.

## 13. Acceptance criteria for future production changes

For every future Expedition change:

- State which canonical file or system is being extended.
- State whether the change affects Journey, Base Camp, excavation, evidence, story, assets, audio, or UI.
- Confirm no parallel system was created.
- Confirm asset roles if assets are added or changed.
- Run the relevant tests where available.
- Run `npm run lint` and `npm run build` when possible.
- Browser-check visible gameplay changes when possible.
- Update `progress.md` with a short implementation note.
- Update this bible or the relevant supporting doc if the source of truth changes.
