# Lost Site Expedition Design Brief

This document records the high-level design vision for Lost Site Expedition in Archaeology-Dig-App.

The top-level implementation, production, pipeline, and quality source of truth is now:

- `docs/lost-site-expedition-production-bible.md`

This design brief should support that production bible rather than compete with it.

Lost Site Expedition is now a standalone archaeology adventure platformer. The platformer is the main game; excavation, Base Camp, lab, evidence, and report systems are add-on and reward layers that deepen the adventure after major discoveries.

## Current Source Of Truth

Use the current implementation before making changes.

- App entry and main state flow: `src/App.jsx`
- Lost Site Expedition shell, Base Camp, excavation, evidence, and report loop: `src/components/ExpeditionMode.jsx`
- Journey platformer orchestration: `src/components/ExpeditionJourney.jsx`
- Journey data, gates, enemies, objectives, collectibles, events, and helper modules: `src/components/expedition-journey/`
- Archaeology evidence and scenario data: `src/data.js`
- Main styling: `src/index.css`
- Running implementation notes: `progress.md`
- Story arc source of truth: `docs/lost-site-expedition-story-arc.md`
- Standalone game design rule: `docs/standalone-game-rule.md`
- Expedition asset audit and tidy-up handover: `docs/expedition-asset-tidy-audit.md`
- Production pipeline and implementation hierarchy: `docs/lost-site-expedition-production-bible.md`

Do not create parallel systems for progression, economy, player control, animation, evidence, inventory, excavation, lab, museum, report, Bureau, Base Camp, bosses, or Journey. Extend the canonical systems above.

## Design Vision

Lost Site Expedition should feel like a polished archaeology adventure, not a worksheet-style task wrapped in game UI.

The player should feel like an expedition hero entering an ancient site, gathering tools and evidence, overcoming guardians, unlocking seals, discovering a tomb entrance, returning to Base Camp, then excavating and analysing evidence.

Archaeology should emerge through play. The player should understand the field work by doing archaeology-like actions inside the game loop, not by being stopped repeatedly for disconnected questions.

## Core Experience

The current high-level flow is:

1. Standalone Adventure Platformer
2. Discovery Entrance
3. Base Camp
4. Excavation Site
5. Lab / Report Reward

The intended emotional arc is:

1. Arrival: the player enters an ancient landscape and sees a clear expedition goal.
2. Preparation: shards, tools, map clues, and route choices give the player reasons to explore.
3. Guardian challenge: bosses feel earned through preparation and route mastery.
4. Discovery: the route opens into a memorable tomb or excavation entrance moment.
5. Base Camp: the player spends and prepares, then chooses how to enter the site.
6. Excavation: the player surveys, selects grid squares, excavates carefully, and records finds.
7. Interpretation: evidence is catalogued, analysed, and used in a claim/report.
