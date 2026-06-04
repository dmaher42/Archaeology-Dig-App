# Lost Site Expedition Design Brief

This document records the high-level design vision for **Lost Site Expedition** in Archaeology-Dig-App.

The top-level implementation, production, pipeline, and quality source of truth remains:

- `docs/lost-site-expedition-production-bible.md`

The current story source of truth is:

- `docs/lost-site-expedition-story-bible.md`
- `docs/lost-site-expedition-story-arc.md`
- `docs/standalone-game-rule.md`
- `docs/egypt-act-1-room-order.md`

This design brief should support those documents rather than compete with them.

---

## Current Source Of Truth

Use the current implementation before making changes.

- App entry and main state flow: `src/App.jsx`
- Lost Site Expedition shell, Base Camp, excavation, evidence, and report loop: `src/components/ExpeditionMode.jsx`
- Journey platformer orchestration: `src/components/ExpeditionJourney.jsx`
- Journey data, gates, enemies, objectives, collectibles, events, and helper modules: `src/components/expedition-journey/`
- Archaeology evidence and scenario data: `src/data.js`
- Main styling: `src/index.css`
- Running implementation notes: `progress.md`
- Production source of truth: `docs/lost-site-expedition-production-bible.md`
- Story bible: `docs/lost-site-expedition-story-bible.md`
- Story arc: `docs/lost-site-expedition-story-arc.md`
- Standalone game rule: `docs/standalone-game-rule.md`
- Egypt Act 1 room order: `docs/egypt-act-1-room-order.md`
- Document status guide: `docs/docs-status.md`

Do not create parallel systems for progression, economy, player control, animation, evidence, inventory, excavation, lab, museum, report, Bureau, Base Camp, bosses, rooms, dialogue, gates, or Journey. Extend the canonical systems above.

---

## Design Vision

Lost Site Expedition should feel like a polished standalone indie archaeology adventure, not a worksheet-style task wrapped in game UI.

The game is first and foremost an action-adventure / platformer set in a mythic, historically inspired Ancient Egyptian world.

Historical grounding should make the world feel more believable and meaningful. It should not interrupt the adventure.

Core design rule:

> Game first. Learning through the world.

The player should feel like Asha: a present-day heritage researcher pulled into a dangerous sacred memory-world beneath Egypt, where tombs, objects, guardians, seals, and stories have deeper meaning than she first understands.

---

## Core Story Idea

The central theme is:

> The past is not treasure to own. It is memory to protect.

The key Anubis reveal line is:

> It was not treasure they stole. It was memory.

This line should not be used too early. It should land after the player has seen enough of the world to understand that tomb objects, names, murals, records, and offerings are memory anchors in the hidden mythology of the game.

---

## Core Experience

The current high-level flow is:

1. Standalone Adventure Platformer
2. Discovery Entrance
3. Base Camp
4. Excavation Site
5. Lab / Evidence Interpretation / Report Reward

The intended emotional arc is:

1. **Arrival:** Asha investigates a strange scarab inconsistency and is pulled into the Lost Site.
2. **Rejection:** Anubis judges her as another trespasser.
3. **Preparation:** shards, tools, map clues, combat mastery, and route choices give the player reasons to explore.
4. **Guardian challenge:** bosses feel earned through preparation and route mastery.
5. **Sacred rooms:** mummification, murals, scribes, and the Queen build the mystery of memory, afterlife, and false interpretation.
6. **Discovery:** the route opens into a memorable tomb or excavation entrance moment.
7. **Base Camp:** the player prepares, reviews discoveries, and chooses how to investigate.
8. **Excavation:** the player surveys, selects grid squares, excavates carefully, and records finds.
9. **Interpretation:** evidence is catalogued, analysed, and used to form an understanding of what happened.

---

## Design Standard

The game should teach through:

- world rules
- combat consequences
- environmental storytelling
- tomb layout
- murals and inscriptions
- relic behaviour
- guardians
- room restoration
- discovery moments
- optional lore
- player choice

The game should avoid:

- quiz popups
- long educational interruptions
- worksheet-style interfaces during core gameplay
- overexplaining Ancient Egypt directly
- treating relics as generic loot
- turning Anubis into a friendly tutorial guide
- making the Queen a simple evil boss

---

## Current Development Direction

Near-term work should continue to strengthen:

1. Fast, fluid combat and dodge readability.
2. Egypt Act 1 room order and room meaning.
3. The Queen as the centre of contested interpretation.
4. Anubis as a judgement-focused guardian.
5. Tomb objects as memory anchors, not simple treasure.
6. Exploration and archaeology systems as adventure gameplay, not classroom tasks.
