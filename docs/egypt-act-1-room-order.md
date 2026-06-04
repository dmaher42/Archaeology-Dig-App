# Egypt Act 1 Room Order

This document is the exterior route and room-placement source of truth for Egypt Act 1 in **Lost Site Expedition**.

It supports:

- `docs/lost-site-expedition-production-bible.md`
- `docs/lost-site-expedition-story-bible.md`
- `docs/lost-site-expedition-story-arc.md`
- `docs/standalone-game-rule.md`

It should be checked before adding, moving, renaming, or re-theming Egypt Journey rooms.

---

## Current Direction

Egypt Act 1 is a standalone indie archaeology adventure first.

The rooms should not feel like classroom tasks. They should feel like dangerous, atmospheric, story-rich spaces inside a sacred Ancient Egyptian memory-world.

The core story idea is:

> The past is not treasure to own. It is memory to protect.

The key Anubis reveal is:

> It was not treasure they stole. It was memory.

Room order should build toward that reveal.

---

## Intended Order

This is the order of structures and route beats on the exterior artwork. Each chamber remains a separate interior space: enter through its exterior doorway, solve or survive the room, then exit back to that same exterior structure area.

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

---

## Story Build Across Rooms

### Desert Entry / Arrival

Purpose: grounded investigation becomes sacred trespass.

Asha enters because a scarab feature does not match old records. The player should feel curiosity first, then danger when the Lost Site rejects easy entry.

### Temple Approach

Purpose: judgement threshold.

Anubis or the protection system makes clear that Asha is not trusted. The site is not abandoned; it is guarded.

### Mummification Room / Mummification Chamber

Purpose: body, preservation, and respect for the dead.

This room begins the shift from treasure thinking to memory thinking. It should suggest that preservation is not only about the body; it is about keeping the self whole.

### Mural Room / Forgotten Mural Chamber

Purpose: visual memory, damaged evidence, and interpretation.

This room should show that the walls are telling a story, but part of that story has been damaged, erased, or misread.

### Scribes' Locked Chamber

Purpose: names, records, contradiction, and false stories.

This room should complicate the murals and move the player closer to the idea that stories can corrupt memory as much as theft can damage objects.

### Queen / Scarab Queen Section

Purpose: contested truth and major guardian confrontation.

The Queen should not read as a simple villain. This section should begin pulling together the suspicion that she may have been misunderstood, corrupted, or falsely remembered.

### Deeper Tomb / Guardian Reveal

Purpose: sacred-system escalation.

The Lost Site should feel larger and older than Asha first understood. This is where the wider guardian-network mystery can be lightly foreshadowed without being explained.

### Discovery Entrance

Purpose: earned access.

The player has not just beaten a level. They have earned entry into something sealed, protected, and meaningful.

### Base Camp

Purpose: return to expedition preparation.

Base Camp should feel like the human-world bridge after a supernatural discovery. It should support preparation, review, and interpretation without feeling like a classroom menu.

### Excavation / Evidence Interpretation

Purpose: archaeological detective work.

The player investigates what they found because understanding the site is now part of the mystery. This layer should feel like game-world interpretation, not a worksheet.

---

## Current Implementation Notes

Canonical room and route data currently lives in:

- `src/components/expedition-journey/journeyLevelData.js`

Supporting runtime systems include:

- `src/components/ExpeditionJourney.jsx`
- `src/components/expedition-journey/`
- `public/assets/expedition/`

---

## Current Room Status

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

---

## Placement Correction Made

The Scribe Locked Chamber platforms were previously positioned near the early temple route, before the Forgotten Mural route. This contradicted the intended order.

The Scribe Chamber exterior platforms and `scribe-locked-chamber` scene floor should now be positioned after the Forgotten Mural Chamber structure and before the later Queen / guardian-test section.

Its interior should still be entered and exited through its own exterior artwork doorway. This preserves the existing platform/scene system and avoids creating a parallel room loader.

---

## Rules For Future Changes

- Do not add a new Egypt room without placing it in this document.
- Do not create a second Journey room-order system.
- Do not move rooms by only changing art; platform/collision, story triggers, scene ids, and camera logic must remain aligned.
- If a room is a placeholder, mark it here before adding final assets.
- Mummification Room's exterior structure must remain before the Mural Room structure.
- Scribes' Locked Chamber's exterior structure must remain after the Mural Room structure and before the Queen / Scarab Queen section.
- Do not directly link one chamber interior to another chamber interior; chamber exits return to the exterior doorway/structure area.
- Optional rooms should create curiosity, risk, story value, or archaeology value rather than being random platforming detours.
- Room writing should not become educational exposition. It should reveal mystery, danger, memory, afterlife logic, or contested interpretation through the world.
