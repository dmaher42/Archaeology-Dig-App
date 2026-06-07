# Story Content Locations — Locator Guide

Purpose: tell another AI (or a new contributor) **where every piece of story / narrative text lives** in this repo, so it can find and edit story without guessing. Line numbers drift — search by the **identifier** names in `code font`, not by line number.

Game: *Lost Site Expedition* — a 2D archaeology action-adventure. Asha, a present-day heritage researcher, is pulled through a scarab threshold into the "Lost Site," a hidden Duat-touched memory-world guarded by Anubis. There are three civilisation "Journeys": **Egypt (Act 1, primary)**, **Rome (Act 2)**, **China**.

---

## 0. Read these first — the canon / source of truth (docs, not code)

The narrative bibles define what the story *should* be. Always reconcile code against these:

- `docs/lost-site-expedition-story-bible.md` — fullest canon: premise, characters, themes, opening tone, per-room purpose. Contains **implementation-status / payoff-status notes** flagging beats that are design-canon but not yet built (e.g. the clothes-change on crossing, the "a memory returns" caption payoff).
- `docs/lost-site-expedition-story-arc.md` — the beat-by-beat arc (Arrival → Rejection → Preparation → Guardian Test → Sacred Rooms → Queen Truth → … → Threshold Reveal). Has hard pacing rules ("do not reveal X too early").
- `docs/lost-site-expedition-production-bible.md` — condensed "current story rules" list.
- `docs/lost-site-expedition-design-brief.md`, `docs/standalone-game-rule.md` — high-level framing ("Game first. Learning through the world.").
- `docs/egypt-act-1-room-order.md` — canonical room order for Egypt.
- `docs/lost-site-expedition-journey-progression-map.md` — how the Journey level is segmented.
- `docs/egypt-journey-opening-guardian-handover.md`, `docs/guardian-seal-trigger-plan.md` — Anubis opening / seal design.

**Rule:** if you change in-game story text, check whether a bible asserts something different, and keep them consistent (or update the bible note).

---

## 1. Egypt — Asha's arrival (the part most recently reworked)

Asha's arrival is told in **two stages across two files**. Do not confuse them.

### 1a. Present-day Cairo archive prologue → scarab → fall
**File:** `src/components/ExpeditionMode.jsx`
**Search for these identifiers:**
- `EGYPT_ARCHIVE_ASSETS` — image asset paths for the prologue.
- `EGYPT_ARCHIVE_PROLOGUE_ITEMS` — the three evidence documents Asha reviews: **Museum Report**, **Tomb Painting Photo**, **Asha's Notes**. Each has a `body` array of lines.
- `EGYPT_ARCHIVE_SITE_TRANSITION_LINES` — narration walking up to the pyramid.
- `EGYPT_ARCHIVE_SCARAB_CINEMATIC_LINES` — examining the scarab (contains the damaged caption `"A memory returns"`).
- `EGYPT_ARCHIVE_ACTIVATION_LINES` — the touch → "the pyramid drops away" → fall.
- `EGYPT_ARCHIVE_CINEMATIC_STEPS` — ties the above arrays into ordered cinematic steps with kicker/title/actionLabel.
- `renderArchiveEvidenceVisual` — the React render for each evidence card (visual only, no story text).

### 1b. Lost Site opening cinematic (Anubis ↔ Asha back-and-forth)
**File:** `src/components/expedition-journey/ExpeditionJourney.jsx`
**Search for:**
- `OPENING_CINEMATIC_LINES` — the Egypt arrival dialogue (array of `{id, at, speaker, voice, text}`). **This is the Anubis/Asha exchange the player sees on entering the Lost Site.**
- `getOpeningCinematicLines` — selects Egypt vs Rome lines by civilisation.
- The title card text (e.g. `The Gate Refuses`) is JSX in the same file's render — search `opening-cinematic-kicker` / the `<h2>` near `opening-cinematic-copy`.

### 1c. First seal in-level monologue ("Leave.")
**File:** `src/components/expedition-journey/journeyLevelData.js`
**Search for:**
- `SCARAB_SEAL_TRIGGER` — Anubis's short hostile monologue that fires when Asha reaches the first seal in the level. The `messages` array holds the lines ("You stand where you should not." … "Leave."); `dialogueSpeakers` / `dialogueTiming` align them. Also `objectiveEchoLine`, `firstShardEchoLine`.

> Note: 1b (cinematic) and 1c (in-level monologue) are **separate** Anubis openings. Keep their tone consistent.

---

## 2. Egypt — in-level story beats, guardians, rooms

**File:** `src/components/expedition-journey/journeyLevelData.js` (the big Egypt data file)
**Search for:**
- Enemy/guardian objects with `intro:` and `dialogue:` fields — e.g. `temple-guardian` (Anubis), `giant-serpent` (The Uraeus), `looter-captain` (Bes). Each guardian's encounter line lives here.
- `story:` and `message:` fields on feature/prop/clue objects — e.g. `image-to-name-clue` ("The restored picture exposes missing captions…"), mural/scribe-chamber beats.
- Section/room identifiers: `desert-entry`, `ruined-temple`, `catacombs`, `escape-sequence`, mummification / mural / scribe chamber sections.
- Forgotten Mural Alcove (optional story-deviation secret) — search `mural` and cross-reference story-arc §13.

**Companion files in the same folder (`src/components/expedition-journey/`):**
- `journeyUtils.js` — helper text, echo lines, some narration helpers.
- `journeySecrets.test.js` — **the test that pins story text.** If you change any story string, this file's `assert.match(...)` / `assert.doesNotMatch(...)` will likely need updating. Run it: `node --test src/components/expedition-journey/journeySecrets.test.js`.
- `journeyTraps.js` — trap flavor text.

---

## 3. Rome (Act 2) and China — other civilisation stories

- `src/components/expedition-journey/romeJourneyData.js` and `src/components/expedition-journey/rome/romeLevelData.js` — Rome story data, guardian = **Legate Revenant**. Rome opening dialogue = `ROME_OPENING_CINEMATIC_LINES` in `ExpeditionJourney.jsx`.
- `src/components/expedition-journey/chinaJourneyData.js` — China story data, guardian = **Jade Seal Guardian**.
- These mirror the Egypt structure: enemy `intro`/`dialogue`, seal triggers, section narration.

---

## 4. Cinematics / trailer / menus (framing text)

- `src/trailer/OpeningPrologueRender.jsx`, `src/trailer/GameTrailer.jsx`, `src/trailer/Root.jsx` — standalone prologue/trailer narration (separate from in-game prologue).
- `src/components/ExpeditionJourney.jsx` — also holds the **expedition briefing screen** text ("Expedition Arrival", mission dossier, task list). Search `briefing-` and `mission-`.
- `src/components/expedition/expeditionStages.js` — stage definitions / transitions.
- `src/App.jsx` — top-level menu/intro wiring (search `prologue`).

---

## 5. Excavation / interpretation layer (the "second layer" story — NOT Asha's arrival)

This is the archaeology-detective half. Its "story" is evidence text and interpretation, not dialogue. Don't mistake it for the Journey narrative.
- `src/utils/gameLogic.js` — evidence categories and interpretation logic (e.g. the `beliefs` / `afterlife` clue category, `isRevealed` clue flags). Story-adjacent flavor only.
- Phase components: `src/components/DigPhase.jsx`, `LabPhase.jsx`, `ReportPhase.jsx`, `MuseumPhase.jsx`, `TrainingPhase.jsx`, `BureauMode.jsx` — UI copy and prompts for excavation/analysis/reporting.

---

## 6. How to work safely

1. **Find** the text by searching the identifier names above (symbol search beats line numbers).
2. **Check canon:** does a bible in §0 say something different? Reconcile.
3. **Respect pacing rules** in `story-arc.md` (e.g. don't surface the "memory" theme or the "protection system is failing" reveal in the opening).
4. **Edit** the string in the data file.
5. **Update tests:** `journeySecrets.test.js` (and `expeditionModePrologue.test.js`) pin exact story strings with `assert.match`. Update those assertions to match your new text.
6. **Run:** `node --test src/components/expedition-journey/journeySecrets.test.js` and the prologue test; confirm green.

### Quick search recipes (ripgrep)
```
# All Anubis/guardian dialogue and intros
rg -n "intro:|dialogue:|eventName:" src/components/expedition-journey

# All cinematic/narration line arrays
rg -n "_LINES =|messages:|EchoLine|CINEMATIC_STEPS" src

# A specific known line (to find which file owns it)
rg -n "You stand where you should not"
```
