# Lost Site Expedition Design Brief

This document is the design source of truth for future Codex work on Lost Site Expedition in Archaeology-Dig-App.

The project is a Year 7 HASS Ancient History / archaeology adventure game. The design priority is to make it feel like a real game first, then embed the learning through the things the player does: survey, tools, evidence, excavation, mapping, cataloguing, lab analysis, interpretation, and reporting.

## Current Source Of Truth

Use the current implementation before making changes.

- App entry and main state flow: `src/App.jsx`
- Lost Site Expedition shell, Base Camp, excavation, evidence, and report loop: `src/components/ExpeditionMode.jsx`
- Journey platformer orchestration: `src/components/ExpeditionJourney.jsx`
- Journey data, gates, enemies, objectives, collectibles, events, and helper modules: `src/components/expedition-journey/`
- Archaeology evidence and scenario data: `src/data.js`
- Main styling: `src/index.css`
- Running implementation notes: `progress.md`

Do not create parallel systems for progression, economy, player control, animation, evidence, inventory, excavation, lab, museum, report, Bureau, Base Camp, bosses, or Journey. Extend the canonical systems above.

## Design Vision

Lost Site Expedition should feel like a polished archaeology adventure, not a worksheet or quiz game.

The player should feel like an expedition hero entering an ancient site, gathering tools and evidence, overcoming guardians, unlocking seals, discovering a tomb entrance, returning to Base Camp, then excavating and analysing evidence.

Education should emerge through play. The player should learn archaeology by doing archaeology-like actions inside a game loop, not by being stopped repeatedly for disconnected questions.

## Core Experience

The current high-level flow is:

1. Journey Platformer
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

## Current Ancient Egypt Journey State

The Egypt Journey is the current vertical-slice focus.

Confirmed current direction:

- Relic shards unlock seals and fund Base Camp upgrades.
- Temple Approach Seal needs 4 relic shards.
- Guardian Prep Seal needs the desert objective plus 6 relic shards.
- Desert Map Seal needs Map Tablet, Scarab Queen defeat, Brush Handle, and 10 relic shards.
- Enemies can drop shards and have roles such as shard guard, cache guard, map tablet guard, and seal guard.
- Optional Upgrade Voucher Cache costs 2 relic shards and rewards Base Camp shard value.
- Switch 1 is wired as an objective and reveals/activates a return plinth.
- Broken Ruins Route, Temple Threshold Climb, and Sandfall / Collapsing Stone sections exist.
- Guardian quizzes are disabled for boss fights.
- The first 5-minute loop has been playtested and mostly works.

The next gameplay milestone is the Guardian Prep Seal / Scarab Queen readiness pass.

## Gameplay Principles

- Game first, education embedded.
- No quiz spam during core platforming.
- Every collectible must have a purpose.
- Enemies should guard routes, rewards, tools, or objectives.
- Gates and seals should communicate requirements clearly.
- Optional routes should reward curiosity but not be required for main progression.
- Bosses should feel earned through preparation.
- Discovery moments should feel cinematic and memorable.
- Systems should be extended, not duplicated.
- Wording should stay plain, classroom-friendly, and Year 7 readable.

## Opening Scene Direction

Future work should add a short dramatic opening before the first checkpoint.

It should feel like an expedition arrival, not a long cutscene. Keep it short, atmospheric, replayable, and easy to skip or replay through normal movement.

Story objective:

> Gather the shards. Recover the tools. Defeat my guardians. Only then will the excavation site open.

Design requirements:

- Establish that the player is entering an ancient site as an expedition hero.
- Explain shards, tools, guardians, and the excavation-site gate through story framing.
- Avoid heavy exposition.
- Avoid pausing the first run for a worksheet-like explanation.
- Reuse existing Journey cinematic, event, camera, boss/guardian, and checkpoint systems where possible.

## Archaeologist And Warrior-Guide Story Direction

The Egypt Journey can begin with the archaeologist arriving first. The archaeologist represents discovery, evidence, excavation, and interpretation.

The ancient Egyptian warrior-guide enters the story after the archaeologist realises they cannot pass the sealed route alone. The warrior-guide represents protection, passage, and cultural heritage. They should not feel like a generic combat character; their role is to help protect the site and its precious artefacts.

The guardian or boss challenges the archaeologist and blocks the excavation site. The player must gather shards, recover tools, defeat guardians, and open the route to the excavation site.

Possible short story lines:

Guardian:

> “You are not ready, explorer. My guardians hold the shards and tools of passage. Without them, the excavation site will remain sealed.”

Warrior-guide:

> “Then I will guide you. These artefacts must not be lost. Gather the shards, recover the tools, and we will open the way below.”

After the Journey and Discovery Entrance, the archaeologist role becomes central again through Base Camp, excavation, lab analysis, and report writing.

Keep this story short, dramatic, classroom-friendly, and replayable.

## Guardian And Boss Direction

Boss fights should feel like game encounters first.

Preparation should matter through route progress, recovered tools, relic shards, gates, positioning, combat rhythm, and visual warnings. Do not reintroduce quiz gating during boss fights unless the overall design direction changes.

The Scarab Queen readiness pass should check:

- Can a new player understand what the Guardian Prep Seal requires?
- Does the Map Tablet feel important before the boss?
- Are 6 relic shards fair to gather before the boss without feeling grindy?
- Are enemies placed so they guard meaningful progress rather than cluttering the route?
- Does the boss trigger feel earned after preparation?
- Does the post-boss reward clearly point toward the Desert Map Seal?

## Discovery Entrance Direction

The Discovery Entrance Sequence is a later staging milestone after the dramatic opening scene.

It should turn route progress into a memorable site-opening moment. It should connect the Journey Platformer to Base Camp and the excavation layer.

Use in-world cues where possible:

- carved stones
- ropes
- flags
- plinths
- seals
- field notes
- survey markers
- dust, light, stone movement, and temple rumble

Avoid making the moment feel like a UI reward screen pasted over scenery.

## Base Camp Direction

Base Camp is the preparation hub between Journey and excavation.

Its job is to make Journey rewards matter. Relic shards, tools, field-kit pieces, and optional discoveries should feed into practical expedition readiness.

Base Camp should support:

- spending shard value on useful upgrades
- explaining what recovered tools do
- preparing for excavation without adding a second economy
- making optional exploration feel worthwhile
- returning the player clearly to the next expedition action

Do not create a duplicate currency or voucher inventory unless the excavation layer proves it needs one.

## Excavation Layer Direction

The future excavation layer should feel Diablo-inspired but archaeology-focused.

The intended loop is:

1. Platformer Journey earns access to a site.
2. Base Camp prepares the player.
3. Player enters an excavation site.
4. Player surveys possible dig areas.
5. Player selects grid squares.
6. Player excavates carefully.
7. Player records artefacts in situ.
8. Player catalogues finds.
9. Player analyses them in the lab.
10. Player builds a claim/report from evidence.

This should align with the archaeology process:

- survey
- grids
- excavate
- map
- catalogue
- lab
- interpret
- report

The excavation layer should be game-like: route choice, risk, rewards, tools, readable feedback, and meaningful evidence decisions. It should not become a static quiz or worksheet.

## Education Layer Direction

Learning should be carried by the game verbs.

Prefer:

- evidence found in context
- tool choice affecting evidence quality
- grid and survey choices revealing or hiding opportunities
- artefact records that matter later
- lab analysis that changes interpretation
- claims built from collected evidence
- short field notes that support decision-making

Avoid:

- frequent detached quiz popups
- long text lectures during action
- disconnected trivia checks
- educational UI that interrupts core movement or combat without a strong reason

## Audio Direction

Future audio should move away from constant music and toward atmospheric sound.

Preferred sound palette:

- desert wind
- distant stone movement
- cave or tomb ambience
- subtle footsteps
- cloth and gear movement
- sand shifts
- torch and camp sounds
- low temple rumbles
- short dramatic boss encounter stingers

Audio should be classroom-friendly and not irritating over repeated play. Prefer short cues, soft loops, and clear event stingers over loud constant tracks.

## Art And Asset Direction

Target a high-quality cinematic desert archaeology style that remains readable on a classroom projector.

Art direction principles:

- Make the world feel archaeological, not like generic fantasy with pasted-on UI.
- Use in-world cues such as carved stones, ropes, flags, plinths, seals, field notes, and survey markers.
- Keep objectives visible without crowding the action.
- Avoid cheap UI pasted onto scenery.
- Avoid keeping unused prototype sprite sheets active.
- Maintain asset discipline and performance budget.
- Do not delete assets unless confirmed unused.

When adding assets, confirm they are wired into the live path before claiming they are active. Do not treat "asset exists in the repo" as proof that the live Expedition uses it.

## Performance Direction

Current browser memory around 97 MB is healthy.

Track memory as assets grow. Recommended soft targets:

- Main menu under 100 MB
- Egypt Journey start under 150 MB
- Boss area under 180 MB
- Base Camp under 200 MB
- Future excavation layer under 250 MB

Avoid loading future civilisation assets during Egypt Journey if possible. Prefer lazy-loading or stage-specific loading when adding larger art, audio, or civilisation packs.

## Implementation Rules

Before changing systems, inspect the existing canonical files and current diff.

Rules for future Codex work:

- Do not change gameplay without confirming the current implementation path.
- Do not create duplicate progression systems.
- Do not create duplicate economy systems.
- Do not create duplicate player controllers.
- Do not create duplicate animation systems.
- Do not create duplicate boss or guardian systems.
- Do not create duplicate excavation, evidence, lab, museum, or report systems.
- Extend existing Journey, Base Camp, excavation, evidence, lab, museum, and report systems.
- Preserve working tests.
- Use small, testable changes.
- Document uncertainty.
- Do not delete assets unless confirmed unused.
- Prefer browser verification for UI/gameplay changes.

Expected verification for gameplay/UI changes:

- `npm.cmd run lint`
- `npm.cmd run build`
- targeted Journey or Expedition tests where available
- browser smoke test for the changed route, mode, or UI

Known build warnings may mention existing runtime-resolved expedition images and a large bundle. Do not treat those as new failures unless they change or break the app.

## Documentation Rules

Future design notes should update this brief or `progress.md` depending on purpose.

- Use this brief for durable design direction, source-of-truth principles, milestones, and implementation guardrails.
- Use `progress.md` for dated work logs, verification results, screenshots, and current-pass findings.
- Keep design decisions practical enough that a future coding agent can act on them.
- Mark uncertainty clearly instead of filling gaps with guesses.

## Current Milestones

1. Guardian Prep Seal / Scarab Queen readiness pass
2. Dramatic opening scene with story-embedded instructions
3. Discovery Entrance Sequence
4. Base Camp reward/economy pass
5. Tutankhamun / excavation prototype
6. Lab/report reward loop
7. Future civilisation expansion only after Egypt vertical slice works
