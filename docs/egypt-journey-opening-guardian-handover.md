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
| Guardian Seal trigger plan | Complete as planning only | `docs/guardian-seal-trigger-plan.md`; implementation intentionally not started. |

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
- Current planning docs: `docs/egypt-sacred-trap-asset-plan.md`, `docs/guardian-seal-trigger-plan.md`, this handover note
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

## Deliberately Not Changed

- No new gameplay systems.
- No new cutscene or dialogue system.
- No player controller changes.
- No route layout changes.
- No China changes.
- No Base Camp or excavation changes.
- No Scarab Queen health/damage/route requirement changes in the story payoff pass.
- No trap collision, damage, timing, platform, or route gate behavior changes in the trap planning pass.
- No Guardian Seal trigger implementation yet.

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

## Known Warnings

- `npm.cmd run build` still reports the known runtime-resolved Egypt excavation image warnings for:
  - `/Archaeology-Dig-App/assets/expedition/excavation/egypt-zone-challenge-ui-pack.png`
  - `/Archaeology-Dig-App/assets/expedition/excavation/egypt-survey-marker-pack.png`
- `git diff --check` reports LF-to-CRLF working-copy warnings on existing modified files. It does not report whitespace errors.

## Remaining Risks

- A full natural, human-paced playthrough from Brush Handle pickup through Desert Map Seal, temple entry, Switch 1, final approach, Ancient Construct, Base Camp, and excavation is still recommended.
- The Scarab Queen asset has been regenerated and validated, but longer classroom-projector review would still help judge readability during real combat.
- Sacred trap work is planning only; actual trap/pedestal/seal assets do not exist yet.
- Guardian Seal trigger work is planning only; implementation should wait until Guardian Seal and sacred pedestal art exists.
- `progress.md` and the Journey files are part of an intentionally dirty worktree with prior uncommitted work. Preserve that work unless the user explicitly asks to commit, discard, or split it.

## Recommended Next Task

Create the first sacred defence asset pack before implementing any new Guardian Seal behavior.

Recommended next Codex prompt:

```text
Use C:\Users\dmahe\Documents\LocalCodex\Archaeology-Dig-App as the repo.

First read AGENTS.md, progress.md, docs/egypt-journey-opening-guardian-handover.md, docs/egypt-sacred-trap-asset-plan.md, git status, and the current diff.

Do not create new gameplay systems. Create the first sacred Egypt trap/defence asset pack only, starting with Guardian Seal and sacred pedestal assets. Preserve existing Journey gameplay, route gates, Scarab Queen, Base Camp, excavation, and China systems.

Target assets:
- guardianSealIdle
- guardianSealActivated
- sacredPedestalIdle
- sacredPedestalActivated

Use the existing environment asset style and prepare atlas JSON/PNG so a later pass can wire the assets into the existing Journey environment atlas path.
```
