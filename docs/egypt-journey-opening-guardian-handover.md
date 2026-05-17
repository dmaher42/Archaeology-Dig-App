# Egypt Journey Opening Guardian Handover

Date: 2026-05-17

## Status

All requested opening/guardian/scarab/trap planning items are complete in this local worktree.

| Item | Status | Evidence |
| --- | --- | --- |
| Step 1 opening | Complete | `progress.md` entry `2026-05-17 Ancient Egypt opening story staging pass`; source changes in `journeyLevelData.js` and coverage in `journeySecrets.test.js`. |
| Step 2 guardian threshold | Complete | `progress.md` entry `2026-05-17 Ancient Egypt sacred threshold opening pass`; adds sacred threshold prop, guardian notice, guide follow-up, and event-shake coverage. |
| Scarab Queen asset pass | Complete | `scarab-queen-sprites.png/json` regenerated in place; generator and validator scripts extended; frame keys preserved. |
| Scarab Queen story payoff | Complete | `journeyLevelData.js` updates Scarab Queen intro/dialogue, early seal text, Desert Map Seal copy, and Brush Handle route-open message. |
| Sacred trap asset plan | Complete | `docs/egypt-sacred-trap-asset-plan.md`. |
| Sacred defence seal/pedestal asset pack | Complete | `public/assets/expedition/environment/desert-temple/egypt-sacred-traps-pack.png` and `.json`; validation script confirms four regions. |
| Guardian Seal passive placement plan | Complete | `docs/guardian-seal-placement-plan.md`; final-route placement chosen near `X(7330)`. |
| Guardian Seal passive placement | Complete | `journeyLevelData.js` adds passive `guardian-seal-pedestal-passive` and `guardian-seal-passive` story props; `ExpeditionJourney.jsx` renders idle regions through the existing story-prop path. |
| Guardian Seal trigger plan | Complete as planning only | `docs/guardian-seal-trigger-plan.md`; trigger/awakening implementation intentionally not started. |

## Source Of Truth

- App shell and main state: `src/App.jsx`
- Lost Site Expedition shell: `src/components/ExpeditionMode.jsx`
- Journey runtime orchestration: `src/components/ExpeditionJourney.jsx`
- Journey data, route gates, props, hazards, events, bosses, and rewards: `src/components/expedition-journey/journeyLevelData.js`
- Journey helper/hitbox tuning: `src/components/expedition-journey/journeyUtils.js`
- Boss sprite registry and frame selection: `src/components/expedition-journey/journeyBossSprites.js`
- Enemy sprite registry and frame selection: `src/components/expedition-journey/journeyEnemySprites.js`
- Scarab Queen boss assets: `public/assets/expedition/bosses/scarab-queen-sprites.png` and `.json`
- Enemy/scarab assets: `public/assets/expedition/enemies/`
- Environment atlas currently used by hazards/props/gates: `public/assets/expedition/environment/desert-temple/desert-temple-pack.png` and `.json`
- Sacred defence seal/pedestal atlas: `public/assets/expedition/environment/desert-temple/egypt-sacred-traps-pack.png` and `.json`
- Sacred defence asset scripts: `scripts/generate_egypt_sacred_trap_assets.py` and `scripts/validate_egypt_sacred_trap_assets.py`
- Current planning docs: `docs/egypt-sacred-trap-asset-plan.md`, `docs/guardian-seal-trigger-plan.md`, `docs/guardian-seal-placement-plan.md`, this handover note
- Durable work log: `progress.md`

## What Changed

- Step 1 staged the Egypt opening with existing story props and movement-triggered notices for arrival, protected-site warning, and warrior-guide guidance.
- Step 2 strengthened the sacred threshold using an existing `jackal-statue` story prop, a guardian notice, a guide follow-up, and the existing event rumble/camera-shake path.
- Scarab Queen art was regenerated in place as the larger sacred boss version of the updated desert scarabs, with clearer attack, area pulse, vulnerable, hit, and defeated frames.
- Scarab Queen story copy now connects the protected-site opening to the first guardian test: `The seal stirs. Move with care, archaeologist - the guardian is awake.`
- Early seal and Desert Map Seal text now emphasizes evidence, shards, tools, and earning passage rather than forcing the site open.
- The Brush Handle route-open reward now says the player passed the first guardian test and should record findings before moving deeper.
- The sacred trap plan audits all current hazards and reactive platforms, then defines the missing trap/defence asset keys and priorities.
- The Guardian Seal trigger plan defines a future final Ancient Construct awakening feature without implementing it.
- The first sacred defence atlas now exists with these exact region keys: `guardianSealIdle`, `guardianSealActivated`, `sacredPedestalIdle`, and `sacredPedestalActivated`.
- The sacred defence atlas is registered as the passive/future environment pack id `egypt-sacred-traps`.
- Passive final-route placement now shows the idle Guardian Seal and sacred pedestal near the planned final approach point using existing `STORY_PROPS` and the existing story-prop renderer.
- The early Sacred Scarab Seal awakening beat now exists as an interactive opening climb near the Egypt entry: the player climbs to a false artefact, triggers the awakening, and gets a Scarab Queen confrontation through the existing boss intro/domain flow.

## Deliberately Not Changed

- No new gameplay systems.
- No new cutscene or dialogue system.
- No player controller changes.
- No route layout changes.
- No China changes.
- No Base Camp or excavation changes.
- No Scarab Queen health/damage/route requirement changes in the story payoff pass.
- No Scarab Queen health/damage/route requirement changes in the early Scarab Seal awakening pass.
- No trap collision, damage, timing, platform, or route gate behavior changes in the trap planning pass.
- No Guardian Seal trigger implementation yet.
- No Guardian Seal pickup, activation, or Ancient Construct awakening sequence yet.
- No route gate, Base Camp, excavation, or China changes were made by the seal/pedestal asset or passive placement passes.

## Tests Passed

Recent passes in this worktree include:

- `node --test src/components/expedition-journey/journeySecrets.test.js`
- `node --test src/components/expedition/baseCampShop.test.js`
- `node --test src/components/expedition-journey/journeyEnemySprites.test.js`
- `python scripts/validate_enemy_sprite_sheets.py`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`

The final handover pass reran:

- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`

The sacred seal/pedestal handover pass also confirmed:

- `scripts/validate_egypt_sacred_trap_assets.py` passes with the bundled Python runtime.
- `guardianSealIdle` exists.
- `guardianSealActivated` exists.
- `sacredPedestalIdle` exists.
- `sacredPedestalActivated` exists.

## Known Warnings

- `npm.cmd run build` still reports the known runtime-resolved Egypt excavation image warnings for:
  - `/Archaeology-Dig-App/assets/expedition/excavation/egypt-zone-challenge-ui-pack.png`
  - `/Archaeology-Dig-App/assets/expedition/excavation/egypt-survey-marker-pack.png`
- `git diff --check` reports LF-to-CRLF working-copy warnings on existing modified files. It does not report whitespace errors.

## Remaining Risks

- A full natural, human-paced playthrough from Brush Handle pickup through Desert Map Seal, temple entry, Switch 1, final approach, Ancient Construct, Base Camp, and excavation is still recommended.
- The early Scarab Seal scene has source and browser-smoke coverage, but classroom pacing and climb readability should still be reviewed in a natural playthrough.
- The Scarab Queen asset has been regenerated and validated, but longer classroom-projector review would still help judge readability during real combat.
- Sacred trap work is still only partially implemented: the first Guardian Seal and sacred pedestal assets exist, but pressure plate, cracked platform, falling stone, glyph tripwire, and sealed door regions remain pending.
- Guardian Seal trigger work is still planning only; implementation should reuse the passive placement and existing event/boss intro paths when it starts.
- The passive Guardian Seal/pedestal can look meaningful before it does anything, so the next trigger pass must avoid player confusion and preserve low replay friction.
- `progress.md` and the Journey files are part of an intentionally dirty worktree with prior uncommitted work. Preserve that work unless the user explicitly asks to commit, discard, or split it.

## Recommended Next Task

Implement the Guardian Seal trigger only after first locking the current final-route requirements in tests, or continue the sacred defence asset set with non-gameplay trap art if the trigger should wait. Do not revisit the early Scarab Seal unless a playthrough shows climb readability or pacing problems.

Recommended next Codex prompt:

```text
Use C:\Users\dmahe\Documents\LocalCodex\Archaeology-Dig-App as the repo.

First read AGENTS.md, progress.md, docs/egypt-journey-opening-guardian-handover.md, docs/egypt-sacred-trap-asset-plan.md, docs/guardian-seal-trigger-plan.md, docs/guardian-seal-placement-plan.md, git status, and the current diff.

Important: only start if the sacred seal/pedestal passive placement is complete and the worktree is safe.

Task: start the Guardian Seal trigger implementation with the smallest safe existing-system change.

Before changing gameplay, add tests locking Ancient Construct health/damage, `site-permit-seal`, and `basecamp-seal` requirements. Then reuse the existing story prop, event notice, camera shake, and boss intro systems so the passive Guardian Seal becomes a trigger without creating a new cutscene, dialogue, boss, route gate, inventory, Base Camp, excavation, or China system.
```
