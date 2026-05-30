# Egypt Act 1 Room Order

This document is the exterior route and room-placement source of truth for Egypt Act 1 in Lost Site Expedition.

It supports `docs/lost-site-expedition-production-bible.md` and should be checked before adding, moving, or renaming Egypt Journey rooms.

## Intended order

This is the order of structures and route beats on the exterior artwork. Each chamber remains a separate interior space: enter through its exterior doorway, solve or inspect the room, then exit back to that same exterior structure area.

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

## Current implementation notes

Canonical room and route data currently lives in:

- `src/components/expedition-journey/journeyLevelData.js`

Supporting runtime systems include:

- `src/components/ExpeditionJourney.jsx`
- `src/components/expedition-journey/`
- `public/assets/expedition/`

## Current room status

| Intended beat | Current status | Implementation note |
| --- | --- | --- |
| Desert Entry / Arrival | Implemented | Section id `desert-entry` exists in `SECTIONS`. |
| Temple Approach | Implemented | Section id `ruined-temple` currently functions as the temple approach / ruined temple route. |
| Mummification Room / Mummification Chamber | Implemented as secret/side-room content | Platform ids and scene id `mummification-chamber` exist in `journeyLevelData.js`. |
| Mural Room / Forgotten Mural Chamber | Implemented as secret/side-room content | Platform ids and scene id `forgotten-mural-chamber` exist in `journeyLevelData.js`. |
| Scribes' Locked Chamber | Implemented as secret/side-room content, but needs placement discipline | Platform ids and scene id `scribe-locked-chamber` exist in `journeyLevelData.js`. This room must sit after the Mural Room and before the Queen section in future route work. |
| Queen / Scarab Queen section | Implemented boss identity/assets exist | Scarab Queen boss assets and trigger logic exist. The exact placement should remain tied to Journey progression and guardian-test logic. |
| Deeper tomb / guardian reveal | Partial / evolving | Keep this tied to Anubis, protection-system, and threshold reveal rules in the story arc. |
| Discovery entrance | Implemented / evolving | Current section id `dig-site-entrance` supports the handoff toward Base Camp/excavation. |
| Base Camp | Implemented | Expedition mode owns Base Camp and the preparation layer. |
| Excavation / evidence interpretation | Implemented / evolving | Expedition mode, Training/Dig phase, and archaeology evidence systems support this layer. |

## Placement correction made

The Scribe Locked Chamber platforms were previously positioned near the early temple route, before the Forgotten Mural route. This contradicted the intended order.

The Scribe Chamber exterior platforms and `scribe-locked-chamber` scene floor should now be positioned after the Forgotten Mural Chamber structure and before the later Queen / guardian-test section. Its interior should still be entered and exited through its own exterior artwork doorway. This preserves the existing platform/scene system and avoids creating a parallel room loader.

## Rules for future changes

- Do not add a new Egypt room without placing it in this document.
- Do not create a second Journey room-order system.
- Do not move rooms by only changing art; platform/collision, story triggers, scene ids, and camera logic must remain aligned.
- If a room is a placeholder, mark it here before adding final assets.
- Mummification Room's exterior structure must remain before the Mural Room structure.
- Scribes' Locked Chamber's exterior structure must remain after the Mural Room structure and before the Queen / Scarab Queen section.
- Do not directly link one chamber interior to another chamber interior; chamber exits return to the exterior doorway/structure area.
- Optional rooms should still create curiosity, story value, or archaeology value rather than being random platforming detours.
