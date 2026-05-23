# Egypt Boss Identity Upgrade Plan

Date: 2026-05-17

## Planning Goal

Upgrade the Egypt Journey bosses into a coherent ancient Egyptian guardian line-up while preserving the current Journey progression. This pass is planning-only: no gameplay ids, route gates, rewards, stats, or sprite loader contracts should change yet.

Tone target:

- mysterious
- sacred
- intimidating
- ancient Egyptian
- protector / guardian energy
- game-first, not worksheet-first
- not horror
- not gore
- not treasure-thief framing

Desired long-term line-up:

- Final boss / main protector: The Sphinx
- Other major guardians: The Griffin, The Uraeus, Anubis, Bes
- Opening presence: The Sphinx appears early as the protector of the sacred site, warns the player, and explains that shards, tools, and upgrades prove the player is ready to reach the expedition site.

## Confirmed Current System

The Egypt bosses are currently defined in `src/components/expedition-journey/journeyLevelData.js` as `MINI_BOSSES`.

| Current internal id | Current display name | Current section | Current type | Current sprite source |
| --- | --- | --- | --- | --- |
| `scarab-queen` | Scarab Queen | `desert-entry` | `scarab` | `public/assets/expedition/bosses/scarab-queen-sprites.json` |
| `temple-guardian` | Stone Guardian | `ruined-temple` | `guardian` | `public/assets/expedition/bosses/stone-guardian-sprites.json` |
| `giant-serpent` | Giant Serpent | `catacombs` | `snake` | `public/assets/expedition/bosses/giant-serpent-sprites.json` |
| `looter-captain` | Rival Looter Captain | `escape-sequence` | `looter` | enemy sprite family: `public/assets/expedition/enemies/looter-captain-sprites.json` |
| `ancient-construct` | Ancient Construct | `dig-site-entrance` | `statue` | `public/assets/expedition/bosses/ancient-construct-sprites.json` |

The same internal ids are reused by the China Journey with different display names and `spriteBossId` values. That is strong evidence that internal ids are progression slots, not civilization-specific identity names.

`BOSS_KEY_ITEMS` ties these ids to route progression:

| Internal boss id | Reward item | Route gate |
| --- | --- | --- |
| `scarab-queen` | Brush Handle | `desert-seal` |
| `temple-guardian` | Trowel Blade | `temple-seal` |
| `giant-serpent` | Measuring Cord | `catacomb-seal` |
| `looter-captain` | Field Notebook Clasp | `escape-seal` |
| `ancient-construct` | Site Permit Seal | `basecamp-seal` |

The first Scarab Queen awakening scene is also tied to `SCARAB_SEAL_TRIGGER.bossId = 'scarab-queen'`.

## Recommendation: Preserve Internal Ids First

Yes: preserve the existing boss ids internally and change display identity, story copy, and asset mapping in phases.

Reasons:

- Route gates, key item rewards, guardian challenges, boss domains, and opening Scarab Seal logic currently depend on these ids.
- China reuses the same ids with different names, proving that display identity can already vary without changing progression.
- Renaming ids first would risk breaking Brush Handle / Desert Map Seal progression, Base Camp handoff, excavation handoff, and existing tests.
- The recent Scarab Queen asset pass should not be discarded before the Griffin replacement path is ready.

## Recommended Mapping

Best safe mapping from current gameplay slots to new identity:

| Current internal id | Recommended display identity | Story role | Keep id stable? | Notes |
| --- | --- | --- | --- | --- |
| Opening presence | The Sphinx | Distant protector who warns the player that the site is sacred and guarded | N/A | Add as a story/cinematic presence first, not a new combat boss. |
| `scarab-queen` | Scarab Queen, First Servant of the Sphinx; later optional Griffin replacement | Early sacred guardian / threshold test | Yes | Keep the completed Scarab Queen asset for now. Do not rename to Griffin until a Griffin sprite pack exists. |
| `temple-guardian` | Anubis | Temple threshold judge / protector of careful passage | Yes | Fits guardian role and can later use an Anubis jackal-headed sprite. |
| `giant-serpent` | The Uraeus | Sacred cobra/catacomb seal guardian | Yes | Best fit for current serpent silhouette, venom/ranged frames, and sacred protection theme. |
| `looter-captain` | Bes | Protective challenge guardian who tests field records and courage | Yes | Bes is smaller and humanoid enough to replace the current captain slot once the asset is ready. Keep it readable, ceremonial, and non-horror. |
| `ancient-construct` | The Sphinx | Final protector of the expedition site | Yes | Best final-boss slot because it already guards Base Camp / excavation access. |

### Evaluation Of The User-Proposed Mapping

The proposed mapping was:

- `scarab-queen` -> The Griffin
- `temple-guardian` -> The Uraeus
- `giant-serpent` -> Anubis
- `looter-captain` -> Bes
- `ancient-construct` -> The Sphinx

This is possible as a story plan, but it is riskier for the first implementation because `temple-guardian` is currently a stone humanoid/guardian silhouette while `giant-serpent` already has the serpent body, lunge, and venom/area attack frame family. The safer visual and mechanical fit is to swap those two: make `giant-serpent` become The Uraeus and `temple-guardian` become Anubis.

The Scarab Queen should remain as an early boss/miniboss or servant of The Sphinx for now. The Griffin should become either:

- a future replacement display identity for the `scarab-queen` slot after `griffin-sprites` exists, or
- a later expanded guardian if the boss roster grows beyond five slots.

For the current five-slot Journey, the safest practical route is: keep `scarab-queen` stable internally, keep the Scarab Queen display in Phase 1, and only convert that slot to The Griffin once the Griffin asset exists and the opening Scarab Seal scene has been reworded/tested.

## Refreshed Scarab Queen Asset Plan

The refreshed Scarab Queen asset should be preserved. It has a recent visual and attack-readability pass, and it already matches the upgraded desert scarab family better than the older boss art.

Safe options, in order:

1. Keep Scarab Queen as the first active boss and call her the first servant of The Sphinx.
2. Keep Scarab Queen as the Scarab Seal guardian while the Sphinx is foreshadowed in the opening warning.
3. Convert the `scarab-queen` slot to The Griffin only after `griffin-sprites` exists and tests prove the Brush Handle / Desert Map Seal progression still works.
4. Later, if the roster expands, move Scarab Queen to an optional miniboss role instead of deleting the asset.

Do not discard or overwrite the Scarab Queen atlas just to make room for The Griffin.

## Safe Text Changes For Phase 1

These can be updated without changing gameplay, as long as the internal ids and requirements stay the same:

- Egypt `MINI_BOSSES` display `name`
- Egypt `MINI_BOSSES` `intro`
- Egypt `MINI_BOSSES` `dialogue`
- Egypt `MINI_BOSSES` `domainName`
- `SCARAB_SEAL_TRIGGER` messages, `bossIntroLine`, and `guideFollowUpLine`
- Display-only story prop labels for the opening Sphinx presence
- Route gate messages or ready hints, only if the requirements remain unchanged
- `BOSS_KEY_ITEMS.rewardDetail` and display route messages, only if `bossId`, `gateId`, and item ids remain unchanged

Suggested Phase 1 naming:

| Internal id | Phase 1 display name | Phase 1 domain name |
| --- | --- | --- |
| `scarab-queen` | Scarab Queen, First Servant | First Seal Domain |
| `temple-guardian` | Anubis Guardian | Temple Judgement Domain |
| `giant-serpent` | The Uraeus | Sacred Cobra Domain |
| `looter-captain` | Bes Guardian | Field Records Domain |
| `ancient-construct` | The Sphinx | Final Protector Domain |

The Phase 1 copy should make the Sphinx the protector of sacred artefacts without implying the player is stealing. The player should be framed as proving care, respect, and readiness.

## Code Paths Not To Change Yet

Do not change these in Phase 1:

- Internal boss ids:
  - `scarab-queen`
  - `temple-guardian`
  - `giant-serpent`
  - `looter-captain`
  - `ancient-construct`
- Boss health, damage, movement speed, patrol ranges, arena ranges, width, or height
- `BOSS_KEY_ITEMS` ids, `bossId`, `gateId`, or reward ordering
- Route gate requirements
- Brush Handle / Desert Map Seal progression
- Base Camp handoff
- Excavation handoff
- China route/data
- Final Guardian Seal trigger
- Player controller
- Boss rendering architecture
- Existing boss frame keys
- Existing boss sprite loader architecture in `journeyBossSprites.js`
- Existing enemy sprite loader architecture in `journeyEnemySprites.js`

## Required Future Asset Files

Create boss sprite atlases one at a time in the existing asset structure:

- `public/assets/expedition/bosses/sphinx-sprites.png`
- `public/assets/expedition/bosses/sphinx-sprites.json`
- `public/assets/expedition/bosses/griffin-sprites.png`
- `public/assets/expedition/bosses/griffin-sprites.json`
- `public/assets/expedition/bosses/uraeus-sprites.png`
- `public/assets/expedition/bosses/uraeus-sprites.json`
- `public/assets/expedition/bosses/anubis-sprites.png`
- `public/assets/expedition/bosses/anubis-sprites.json`
- `public/assets/expedition/bosses/bes-sprites.png`
- `public/assets/expedition/bosses/bes-sprites.json`

Asset guidance:

- Keep the style sacred, protected, mysterious, and readable.
- Avoid horror, gore, skull overload, and realistic insect horror.
- Use clean outlines and strong side-view silhouettes readable at gameplay scale.
- Preserve the boss combat state readability: intro, walk/idle, warning, direct attack, area/ranged attack, shielded, counter window, hit, defeated.
- A defeated frame should read as stunned, cracked, lowered, or deactivated ancient guardian style, not gore.

### Sphinx Atlas Status - 2026-05-17

The first procedural Sphinx atlas draft was rejected and removed. It did not read as an unmistakable monumental Sphinx guardian and looked too much like a mechanical Egyptian sarcophagus / boat / drone form.

Do not wire that rejected draft into Journey gameplay. Keep the existing Ancient Construct atlas as the temporary visual placeholder for the stable `ancient-construct` internal id until a high-quality Sphinx sprite sheet is generated and approved.

The source visual direction for the next Sphinx asset attempt is `docs/sphinx-boss-visual-brief.md`.

## Sprite Loader Strategy

Phase 3 asset creation should not require a new rendering system. Extend `journeyBossSprites.js` only when a new atlas is ready.

Two safe options:

1. Preserve internal ids and map each id to a new atlas while keeping the current expected frame-key family for that slot.
2. Add identity-specific expected key arrays only when tests confirm the loader, frame selection, and fallback behavior.

The lowest-risk first replacement is The Sphinx for `ancient-construct`, because that slot is already the final guardian and already has a full boss sprite frame family.

`looter-captain` is currently handled through the enemy sprite system, so a future Bes boss pack needs extra care: either keep it in the enemy sprite family for Phase 1/2, or move it into `journeyBossSprites.js` only with tests confirming the current captain still renders.

Do not create a new cutscene system for the opening Sphinx presence. Use the existing Scarab Seal trigger, story prop, environment event, reward pulse, boss intro, camera, and notice patterns unless inspection later proves one of those cannot support the beat.

## Tests Needed

For Phase 1 text-only implementation:

- `node --test src/components/expedition-journey/journeySecrets.test.js`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`

For future sprite asset phases:

- `python scripts/validate_enemy_sprite_sheets.py`
- `python scripts/validate_enemy_sprite_sheets.py --only public/assets/expedition/bosses/scarab-queen-sprites.json` when touching Scarab Queen
- Extend validation before replacing non-Scarab boss atlases, because the current validator only has a boss contract for Scarab Queen.
- Any added boss validation script should validate atlas image existence, required frame keys, non-empty alpha, crop edge safety, and grounded baseline consistency.
- Browser visual smoke test for Egypt Journey after each sprite pack is wired.

## Phased Implementation Plan

### Phase 1: Display And Story Text Only - Complete 2026-05-17

Goal: make the Egypt guardian identity feel coherent without changing gameplay.

Actions:

- Preserved all internal boss ids.
- Updated Egypt-only boss display names, intros, dialogue, and domain names.
- Reframed the opening Scarab Seal moment as a protected-site warning under the Sphinx's authority.
- Kept Scarab Queen as an early servant/miniboss so the recent asset pass remains useful.
- Did not change route gates, key items, boss stats, sprite paths, Base Camp, excavation, China, player controller, final Guardian Seal trigger, or boss rendering architecture.

### Phase 2: Opening Sphinx Protector Presence

Goal: let the Sphinx appear as the intimidating protector of the site before the final boss.

Actions:

- Use existing Journey story/cinematic/environment event patterns.
- Add the Sphinx as a non-combat presence first.
- Use an existing placeholder visual only if clearly labelled as temporary in code comments/progress notes.
- Keep the opening message short: the Sphinx protects sacred artefacts; the player must prove care by gathering shards, tools, and upgrades.

### Phase 3: Create New Boss Sprite Atlases One At A Time

Goal: replace temporary identities with real high-quality guardian assets.

Recommended order:

1. `sphinx-sprites` for the final boss.
2. `uraeus-sprites` for the serpent slot.
3. `anubis-sprites` for the temple guardian slot.
4. `bes-sprites` for the looter captain slot.
5. `griffin-sprites` for the early guardian slot if the Scarab Queen is being replaced.

Each sprite pack should be generated, validated, visually inspected, then wired separately.

### Phase 4: Wire New Boss Sprite Packs Carefully

Goal: move from display-only names to real visual identities.

Actions:

- Extend `journeyBossSprites.js` rather than creating a parallel boss renderer.
- Preserve boss ids unless a later migration is proven necessary.
- Add or update tests for expected frame keys and atlas loading.
- Keep China `spriteBossId` behavior untouched.

### Phase 5: Full Egypt Boss Playthrough And Balance Pass

Goal: confirm the whole guardian line-up feels sacred, coherent, and fair.

Actions:

- Play through the Egypt route from opening to Base Camp handoff.
- Confirm the Sphinx appears early and returns as the final protector.
- Confirm boss names, domains, rewards, and route gates still line up.
- Check gameplay-scale readability for every boss.
- Tune only after the asset and story identity are stable.

## Remaining Decisions

- Whether The Griffin fully replaces the Scarab Queen slot, or the Scarab Queen remains a named first servant while Griffin is reserved for a future expanded encounter.
- Whether Bes should remain a re-themed humanoid/captain slot or receive a full boss sprite pack and boss-loader entry.
- Whether the first Sphinx appearance should use a large background landmark, a cinematic event, or a temporary boss silhouette before final Sphinx sprites exist.
- Whether the boss atlas validator should be split from `validate_enemy_sprite_sheets.py` once multiple new boss packs exist.
