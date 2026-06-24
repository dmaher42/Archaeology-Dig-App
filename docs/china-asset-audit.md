# Ancient China Expedition Asset Audit

Inspection date: 2026-05-15

Scope: inspection and asset planning only. This audit does not change gameplay, Stage Select, Egypt, asset wiring, or generated images.

## Confirmed Source Of Truth

- Stage config: `src/components/expedition/expeditionStages.js`
- Expedition stage content and excavation wiring: `src/components/ExpeditionMode.jsx`
- Journey orchestration: `src/components/ExpeditionJourney.jsx`
- Journey static data: `src/components/expedition-journey/journeyLevelData.js`
- Journey background loader: `src/components/expedition-journey/journeyBackgroundAssets.js`
- Journey environment loader: `src/components/expedition-journey/journeyRenderAssets.js`
- Journey enemy and guardian loaders: `src/components/expedition-journey/journeyEnemySprites.js`, `src/components/expedition-journey/journeyBossSprites.js`
- Journey collectible and weapon loaders: `src/components/expedition-journey/journeyCollectibleSprites.js`, `src/components/expedition-journey/journeyPlayerWeaponSprites.js`
- Excavation asset loader: `src/components/expedition/expeditionMapAssets.js`
- Zone challenge content: `src/components/expedition/expeditionZoneChallenges.js`
- Evidence and civilisation profile data: `src/data.js`
- Evidence image fallback helper: `src/utils/gameLogic.js`
- Runtime asset folders: `public/assets/expedition/`, `public/assets/civilisations/`, `public/museum/`
- Progress notes inspected: `progress.md`

## Current Status Summary

Ancient China now has real runtime PNG atlas packs for the Journey background, Journey environment, excavation room map, excavation UI, survey/gateway map pieces, stage character, profile image, and a shared enemy/guardian sprite sheet.

The largest remaining asset issue is not missing files. It is mixed reuse: the China Journey still runs on the Egypt-authored Journey structure, route ids, objective model, key-item rewards, section ids, some helper copy, shared generic archaeology collectibles, and the Egypt khopesh weapon sprite. The stage scaffold in `expeditionStages.js` is also stale: it still labels some China implementation slots as placeholders even though runtime assets now exist and are wired in deeper Expedition/Journey config.

## Asset Area Audit

| Area | Current file/path used | Status | Where it appears | Required before China looks playable? | Priority |
| --- | --- | --- | --- | --- | --- |
| China parallax/background assets | `public/assets/expedition/backgrounds/china-river-valley/china-river-valley-parallax-pack.png` + `.json` | Real PNG runtime atlas, 1536x1024, 5 regions | China Journey background via `journeyBackgroundPackId: 'china-river-valley'` | Already present; keep | P1 done |
| China environment/platform assets | `public/assets/expedition/environment/china-river-valley/china-river-valley-environment-pack.png` + `.json` | Real PNG runtime atlas, 1536x1024, 23 regions | China Journey platforms, hazards, story props, gates through `journeyEnvironmentPackId: 'china-river-valley'` | Already present; keep | P1 done |
| China room/excavation map assets | `public/assets/expedition/excavation/china-room-map-pack.png` + `.json` | Real PNG runtime atlas, 1536x1024, 28 regions | China excavation terrain and overlays through `roomMapPackId: 'chinaRoomMap'` | Already present; keep | P2 done |
| China challenge UI assets | `public/assets/expedition/excavation/china-zone-challenge-ui-pack.png` + `.json` | Real PNG runtime atlas, 1536x1024, 27 regions | Zone-entry challenge cards and answer panels through `challengeUiPackId: 'chinaChallengeUi'` | Already present; keep | P2 done |
| China survey marker/gateway assets | `public/assets/expedition/excavation/china-survey-marker-gateway-pack.png` + `.json` | Real PNG runtime atlas, 1536x1024, 58 regions | Player marker, survey pins, room markers, gateways, exit gate, wall/gate map pieces | Already present; keep | P2 done |
| China enemy sprites | `public/assets/expedition/enemies/china/china-river-crab-sprites.png`, `china-watchtower-sentry-sprites.png`, `china-clay-guardian-enemy-sprites.png` + `.json`; fallback `china-enemy-guardian-sprites.png` | Real transparent PNG runtime atlases, now split by enemy family | China Journey regular enemies: river crabs, watchtower sentries, and clay guardian sentries | Present and now closer to the Egypt multi-pack pattern | P1 done |
| China guardian sprites | `public/assets/expedition/bosses/china-rammed-earth-sentinel-sprites.png` + `.json`; fallback `china-enemy-guardian-sprites.png` | Real transparent PNG boss atlas, still shared by the five China guardian encounters through `china-clay-guardian` | China mini-bosses: Clay Guardian, Bronze Gate Warden, Jade Seal Guardian, Archive Sentry Captain, Rammed-Earth Sentinel | Playable now, but repeated boss visual still weakens later-guardian variety | P1 done / P3 distinct later guardians |
| China collectibles/tools/relic assets | `public/assets/expedition/collectibles/journey-collectibles-pack.png` + `.json`; `public/assets/expedition/player/khopesh-weapon-pack.png` + `.json` | Real PNG atlases, but reused generic/Egypt-leaning assets. Khopesh is explicitly Egypt-themed. | Journey tools, relic shards, objective markers, upgrades, weapon swing | Replacing khopesh is important for China visual identity; collectibles can wait | P1 weapon, P3 collectibles |
| China evidence/museum images | `public/museum/china_*.jpg`, `china_*.png`; fallback `public/museum/china_generic.svg` | All China evidence image paths in `src/data.js` exist as real JPG/PNG files. Fallback is SVG. | Archaeology evidence cards, Lab/Museum/report image flow, Expedition evidence tokens by `ch_*` ids | Real evidence images are present; fallback only matters if an image is omitted later | P2 done; P3 replace fallback SVG |
| China civilisation profile image | `public/assets/civilisations/profile-china.png` | Real PNG, 1024x1024 | Bureau training profile / civilisation case image from `src/data.js` | Already present; keep | P3 done |
| China Stage Select character visual | `public/assets/expedition/stage-characters/ancient-china-character.png` | Real PNG, 1024x1536 | Expedition Stage Select header character | Already present; keep | P3 done |
| China excavation hazards/guardians | Uses China map atlas for terrain/markers plus config objects in `ExpeditionMode.jsx` | Mostly real map art, but hazard/guardian labels are data-driven and can fall back to simple canvas/label treatment depending draw path | China excavation map hazards and Site Watcher | Good enough for prototype; custom hazard icons can polish | P3 |
| China Journey route/section visuals | China background/environment pack, but Egypt section ids remain: `desert-entry`, `ruined-temple`, `catacombs`, `escape-sequence`, `dig-site-entrance` | Mixed: real China art over Egypt-authored section structure and some Egypt helper labels/messages | Journey route, objectives, transitions, gates and events | Needs copy/data pass before standalone-finished China | P1 |

## Missing Assets

No missing China runtime PNG/JSON files were found for currently wired China packs:

- `china-river-valley-parallax-pack.png/.json`
- `china-river-valley-environment-pack.png/.json`
- `china-room-map-pack.png/.json`
- `china-zone-challenge-ui-pack.png/.json`
- `china-survey-marker-gateway-pack.png/.json`
- `china-enemy-guardian-sprites.png/.json`
- `china-river-crab-sprites.png/.json`
- `china-watchtower-sentry-sprites.png/.json`
- `china-clay-guardian-enemy-sprites.png/.json`
- `china-rammed-earth-sentinel-sprites.png/.json`
- `ancient-china-character.png`
- `profile-china.png`

No missing `src/data.js` China evidence image paths were found. The audited evidence references all resolve under `public/museum/`.

The missing or not-yet-China-specific visual sets are:

- A China-specific player weapon pack to replace `khopesh-weapon-pack.png`.
- Optional distinct China guardian boss variants beyond the shared rammed-earth sentinel boss atlas.
- Optional China-specific Journey collectible/relic/tool variants if the generic archaeology pack feels too Egypt-coded.
- A PNG fallback replacement for `public/museum/china_generic.svg` if the app should avoid SVG fallbacks entirely.

## Reused Egypt Or Egypt-Authored Assets

- `public/assets/expedition/player/khopesh-weapon-pack.png` and `.json` are still the Journey weapon sprite atlas. This is the clearest Egypt-specific visual reuse.
- `src/components/expedition-journey/journeyLevelData.js` keeps Egypt route ids and structure: `desert-entry`, `ruined-temple`, `catacombs`, `escape-sequence`, `dig-site-entrance`.
- `SECTION_OBJECTIVES`, `OBJECTIVE_MARKERS`, `ROUTE_GATES`, `BOSS_KEY_ITEMS`, `GUARDIAN_KNOWLEDGE_QUESTIONS`, `GUARDIAN_KNOWLEDGE_CHALLENGES`, `SECTION_ATMOSPHERES`, `STORY_PROPS`, `ENVIRONMENT_EVENTS`, and `BOSS_INTROS` are still the shared Egypt-authored Journey model. China has enemy and mini-boss swaps, including river crab, watchtower sentry, and clay guardian regular-enemy families, but not a full China-specific Journey data set.
- Pass 2 fixed the China Journey route music cue from the shared desert track to the China `bamboo-forest` cue.
- Field-kit text still says the field guide helps identify "Egyptian pottery and architectural styles".
- Some Journey snapshot/debug fields still use `desertBackground...` names even when the China background pack is active. This is naming reuse rather than a visible asset problem.

## CSS-Only Or Canvas Placeholders

- The Journey renderer still has canvas fallback paths for backgrounds, platforms, hazards, gates, enemies, bosses, collectibles, and weapon art if PNG atlases fail or expected regions are missing.
- The excavation map still has canvas fallback behavior if map packs fail.
- China excavation hazards and Site Watcher are config-driven and may render with atlas-assisted markers plus canvas/label treatment rather than fully bespoke animated sprites.
- `public/museum/china_generic.svg` is still the China evidence fallback for missing evidence images.
- The stage scaffold values in `CHINA_EXPEDITION_SCAFFOLD.implementationSlots` still say `china-top-down-excavation-map-placeholder`, `china-zone-challenge-ui-placeholder`, `china-survey-marker-gateway-placeholder`, `china-enemies-guardian-sprites-placeholder`, `china-evidence-set-placeholder`, and `china-final-claim-placeholder`. These are planning labels, not all true runtime status anymore.

## Recommended PNG Filenames And Paths

Already present and wired:

- `public/assets/expedition/backgrounds/china-river-valley/china-river-valley-parallax-pack.png`
- `public/assets/expedition/environment/china-river-valley/china-river-valley-environment-pack.png`
- `public/assets/expedition/excavation/china-room-map-pack.png`
- `public/assets/expedition/excavation/china-zone-challenge-ui-pack.png`
- `public/assets/expedition/excavation/china-survey-marker-gateway-pack.png`
- `public/assets/expedition/enemies/china/china-enemy-guardian-sprites.png`
- `public/assets/expedition/enemies/china/china-river-crab-sprites.png`
- `public/assets/expedition/enemies/china/china-watchtower-sentry-sprites.png`
- `public/assets/expedition/enemies/china/china-clay-guardian-enemy-sprites.png`
- `public/assets/expedition/bosses/china-rammed-earth-sentinel-sprites.png`
- `public/assets/expedition/stage-characters/ancient-china-character.png`
- `public/assets/civilisations/profile-china.png`

Recommended new files:

- `public/assets/expedition/player/china-field-tool-weapon-pack.png`
- `public/assets/expedition/player/china-field-tool-weapon-pack.json`
- `public/assets/expedition/collectibles/china-journey-collectibles-pack.png`
- `public/assets/expedition/collectibles/china-journey-collectibles-pack.json`
- `public/assets/expedition/bosses/china-bronze-gate-warden-sprites.png`
- `public/assets/expedition/bosses/china-bronze-gate-warden-sprites.json`
- `public/assets/expedition/bosses/china-jade-seal-guardian-sprites.png`
- `public/assets/expedition/bosses/china-jade-seal-guardian-sprites.json`
- `public/museum/china_generic.png`

## Priority Order

P1 required for China Journey to look playable:

1. Replace the Egypt khopesh weapon pack with a China-safe field tool weapon pack.
2. Create a China-specific Journey data/copy pass for route names, objective names, route gates, section events, boss intros, and field-kit wording.
3. Update stale China scaffold implementation slot labels so planning UI/docs do not claim runtime assets are placeholders.

P2 required for China Excavation/Museum to feel complete:

1. Keep the current real China excavation room, challenge UI, survey marker, gateway, and evidence photo packs.
2. Replace `china_generic.svg` with `china_generic.png` if the project goal is "real image assets only".
3. Run a full natural China playthrough through Journey, Base Camp, excavation, evidence collection, final claim, Museum/report surfaces.

P3 polish only:

1. Add distinct boss sprite packs for later China guardians instead of using the shared rammed-earth sentinel pack for all five encounters.
2. Add China-specific collectible/relic/tool variants if the shared archaeology pack feels too generic or Egypt-coded.
3. Add bespoke excavation hazard/Site Watcher sprites if the map needs stronger visual identity.
4. Add more China-specific audio cues later if each section needs a distinct ambience beyond the current route-level China cue.

## Next Implementation Steps

1. Do a no-gameplay data/copy pass in the existing Journey data files: China route labels, objectives, route gate names/messages, boss intro cards, event names, field-kit copy, and scaffold slot labels.
2. Add and wire a China-specific field-tool weapon atlas through the existing player weapon loader. Do not add a new combat system.
3. Optional after that: split the shared rammed-earth sentinel into distinct China boss atlases while keeping the existing boss state machine and `spriteBossId` pattern.
4. Finish with a browser-verified natural China playthrough and an Egypt regression check.
