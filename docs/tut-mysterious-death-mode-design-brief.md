# Cold Case: KV62 — Tutankhamun Investigation Mode (Design Brief)

A new game mode where the player joins a modern forensic team re-opening the most famous
cold case in archaeology: how did Tutankhamun die?

This brief follows the [Standalone Game Rule](standalone-game-rule.md): the mode must be a
satisfying detective game first. The curriculum alignment comes from the world and the
player's actions, never from quiz pop-ups.

---

## 1. Curriculum anchor (why this mode exists)

Source: `Curicculum Docs/HASS_History_yr7_unit1_InvestigatingTheAncientPast.pdf`,
unit sequence **"Tutankhamun: A mysterious death"** (Year 7 HASS, SA).

| Curriculum requirement | How the game delivers it |
| --- | --- |
| Teams of four, each student investigates **one theory** | Four playable **case dossiers** — Murder, Accident, Frail Health (inbreeding), Disease. Each student in a team picks a different dossier. Replayable. |
| Theories: murder/assassination · fall or accident · frail health & inbreeding disorders · disease | The four dossiers, each with its own lead expert, signature technology, and evidence trail. |
| Identify **the role of an expert** and **a piece of equipment/technology** | Expert NPCs (radiologist, geneticist, Egyptologist, forensic pathologist, botanist, conservator) are consulted in-game; each station is built around its real technology (CT scanner, DNA lab, archive, autopsy table). |
| **Contestability** — evidence open to challenge and debate | The core mechanic. Most evidence supports more than one theory; cards can be **CONTESTED** and flipped by newer technology (the 1968 "murder blow" X-ray is debunked by the 2005 CT scan). |
| Subject-specific language: theory, contestability, assassination, inbreeding, malaria, Tutankhamun syndrome, compound fracture, club foot, CT scan | All SSL terms appear as in-world labels on evidence cards, station UI, and expert dialogue — never as vocabulary drills. A tappable glossary lives in the field journal. |
| Present, debate and contest findings; reach class consensus | The **Inquest** — an end-of-case debate scene where a rival investigator challenges your theory and you answer with evidence cards. Designed so a class can also run the debate live using each team's in-game verdict screens. |
| Summative: "technology, human expertise and teamwork…" exposition | The mode ends by generating a **Field Report** that lists exactly which technologies, experts and contested debates the player used — a ready-made scaffold for the written/video task. |

## 2. Player fantasy

> *I am a forensic investigator given access to the world's most famous mummy.
> The evidence is damaged, the experts disagree, and every answer creates a new question.*

Not: *I am completing a comprehension worksheet about King Tut.*

## 3. Mode structure (five acts)

1. **Case Briefing — "The Boy King is on the table."**
   Sepia 1922 prologue (Carter opening the tomb, Burton-photo style stills) cuts to the
   present-day lab. The player chooses one of four case dossiers. Their dossier shapes
   which expert leads them in and which evidence is highlighted first — but all evidence
   is reachable in every playthrough.

2. **Investigation — the three stations.** Free movement between:
   - **Scan Suite (CT scanner)** — drag the scan plane through the body to discover
     findings: left femur compound fracture (resin inside the wound), club foot,
     Köhler disease, cleft palate, missing sternum and heart, loose skull fragments.
     Minigame: calibrate and sweep the scanner; sloppy sweeps miss findings.
   - **DNA Lab** — match STR marker bands between Tut and the family mummies
     (KV55, KV35 Younger Lady) to reveal his parents were siblings; run a pathogen
     screen that lights up *Plasmodium falciparum* (malaria) genes.
     Minigame: band-matching puzzle, then a contamination-control step.
   - **Records Room** — Burton photographs, Carter's excavation journals, tomb
     inventory. 130 walking sticks, six chariots, the floral collar that dates the
     burial to spring. Minigame: cross-reference photos against the 1926 inventory to
     spot what changed (the ribcage damage that does NOT appear in Burton's photos).

3. **Evidence Board — the core loop.** Every finding becomes an **evidence card**
   (photo, source, date, reliability). The player pins cards to a corkboard and runs
   string to the four theory panels. Theory **confidence meters** move live.
   Key rules:
   - Most cards link plausibly to more than one theory (contestability as play).
   - Some cards **flip**: pinning the 2005 CT scan stamps the 1968 X-ray card
     CONTESTED and drains the Murder meter it had inflated.
   - Some damage cards are traps — the 1925 examination dismembered the body, so
     "crushed chest" evidence may be modern damage, not ancient injury.

4. **The Inquest (boss equivalent).** A rival investigator presents counter-arguments;
   the player answers each challenge by playing the right evidence card from their
   board. No health bars — the stakes are credibility. Win condition is not "pick the
   one true theory" but **a defensible, evidence-linked position**.

5. **Verdict & Field Report.** The strongest historical position is a *composite*
   (a frail, inbred king with a broken leg and malaria — the fracture-plus-infection
   chain), and the game rewards composites over single-cause verdicts. The report
   screen ranks the case (S/A/B/C) on evidence coverage, correct debunks, experts
   consulted, and secrets found — then exports a one-page Field Report the student
   uses for the summative task.

## 4. Game-first features (Standalone Game Rule compliance)

- **Discovery Rank** end screen, mirroring expedition ratings.
- **Collectibles:** hidden Burton archive photographs scattered through stations.
- **Unlockable tools:** UV lamp, endoscope, spectral imaging — open optional evidence.
- **Achievements:** *Myth Buster* (debunk the murder blow), *Cold Reading* (find the
  ribcage discrepancy), *Composite Thinker* (link three theories into one chain).
- **Secrets:** an optional fifth "folk theory" dossier (the Curse) that exists to be
  systematically dismantled with evidence — teaching source criticism by play.
- **Replay:** four dossiers × hidden evidence = four distinct runs for a team of four.

## 5. Evidence database (starter set, ~15 cards)

Verify all facts against the unit's listed sources during the content pass
(History Extra "What Killed Tutankhamun?", 60 Minutes Australia episode).

| # | Evidence card | Source / tech | Supports | Weakens / notes |
| --- | --- | --- | --- | --- |
| 1 | Bone fragments inside skull | 1968 X-ray (Harrison) | Murder | Flipped by #2 — fragments are post-mortem |
| 2 | No skull trauma; fragments loose, post-embalming | 2005 CT scan (Hawass team) | — | **Debunks #1** |
| 3 | Left femur compound fracture, embalming resin in wound | 2005 CT | Accident | Happened shortly before death; infection risk |
| 4 | *Plasmodium falciparum* DNA in tissue | 2010 DNA study (JAMA) | Disease | Severe malaria strain |
| 5 | Parents were full siblings (KV55 + KV35YL) | 2010 DNA kinship | Frail Health | Inbreeding card |
| 6 | Club foot + Köhler disease (bone necrosis) | 2005 CT | Frail Health | Walking impairment |
| 7 | 130 walking sticks/staves in tomb | Carter inventory | Frail Health | Also a status symbol — contestable |
| 8 | Six chariots + hunting gear in tomb | Carter inventory | Accident | Active lifestyle… or ceremonial |
| 9 | Missing sternum & heart, crushed ribcage | CT + autopsy records | Accident (crash) | Contested — see #10, #11 |
| 10 | 1925 examination dismembered the body | Carter/Derry records | — | Contestability wildcard — taints all damage evidence |
| 11 | Burton's 1926 photos show chest beadwork intact; later X-rays show it gone | Records Room cross-reference | — | Ribcage damage is **modern** — major debunk, hidden evidence |
| 12 | Floral collar species → burial in spring → death in winter | Botanist analysis | — | Timeline card; aligns with hunting season |
| 13 | Ankhesenamun's letter to the Hittite king ("send me a son") | Historical text | Murder | Court intrigue, circumstantial |
| 14 | Successor Ay took the throne; names later erased | Historical record | Murder | Motive only — no physical evidence |
| 15 | "Tutankhamun syndrome" body-shape claims from Amarna art | Art analysis | Frail Health | Contested — artistic style vs anatomy |

Expert ↔ technology pairs (curriculum requirement):
radiologist ↔ CT scanner · geneticist ↔ DNA sequencing · Egyptologist ↔ archives &
inscriptions · forensic pathologist ↔ autopsy analysis · botanist ↔ floral remains ·
conservator ↔ embalming damage assessment.

## 6. Asset plan — semi-realistic photo-quality PNG

Follow the proven `full-investigation-ui-pack` atlas pattern: one new atlas
`public/assets/tut-inquiry/shared/tut-inquiry-ui-pack.{png,json}` plus scene art.

**AI-generated scene/UI art** (existing pipeline: generate → `strip_prop_white_fringe.py`
→ atlas build script):
- Scenes: modern Cairo lab interior, CT scan suite, records room (1920s archive feel),
  inquest chamber, sepia 1922 tomb prologue frames.
- UI atlas regions: corkboard, evidence card frame, red string, CONTESTED / VERIFIED /
  DEBUNKED stamps, theory dossier folders (4 colours), confidence gauge, CT console
  bezel, DNA gel frame, field journal, report page, archive photo frame.
- Characters: 6 expert portraits in one consistent semi-realistic style (2–3 expressions
  each), matching the existing character pipeline.
- Menu card: `assets/menu/mode_tut_inquiry_art.png` (golden mask in CT scanner gantry —
  ancient-meets-modern in one image).

**Real photographic evidence** (extend `docs/museum-image-sources.md` +
`docs/museum-image-attributions.json` patterns):
- Harry Burton excavation photographs — The Met Open Access / Griffith Institute
  "Discovering Tutankhamun in colour" (linked in the curriculum doc itself).
- Death mask, tomb artefacts — The Met Open Access (CC0) and Wikimedia Commons,
  licence-checked per file.
- CT/scan imagery — real stills are rights-encumbered; generate stylised semi-realistic
  scan slices instead and label them as reconstructions.
- Human-remains imagery: keep it scientific (scan renderings, diagrams), not graphic —
  consistent with the sensitivity guidance already in the museum sources doc.

## 7. Technical integration

- New phase `tutInquiry` in `App.jsx`, lazy-loaded like Bureau/Expedition:
  `src/components/TutInquiryMode.jsx` + `src/components/tut-inquiry/` for
  `tutInquiryData.js` (theories, evidence cards, experts, inquest challenges) and
  `tutInquiryAssets.js` (clone of the `fullInvestigationAssets.js` loader).
- Content lives in the data file — same content/component split as `data.js` modes.
- Save: third key in the autosave payload (`tutInquiry`) following the
  archaeology/bureau pattern.
- Two entry points: a fifth menu activity card (direct classroom access) **and** the
  post-Egypt-expedition unlock — this is the "Lab/Report reward layer" that
  `Curicculum Docs/Game Direction.txt` already names: *"New excavation site unlocked:
  Tutankhamun's Antechamber."*
- Dev shortcut: `?tut` URL flag jumping straight into the evidence board (mirrors `?play`).

## 8. Build phases

1. **Content lock** — finalise the evidence database, expert scripts and inquest
   challenge/response trees in `tutInquiryData.js`. Zero rendering risk; fastest review loop.
2. **Core loop** — dossier select + evidence board (pin, string, meters, contest flips),
   with placeholder art.
3. **Stations** — CT sweep, DNA match, records cross-reference minigames.
4. **Inquest + Field Report** — debate scene, verdict, ranked report export.
5. **Polish** — final atlas art, sepia prologue, audio (existing SFX pipeline),
   collectibles, achievements, menu card.
