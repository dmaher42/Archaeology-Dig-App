# Guardian Seal Trigger Implementation Brief

Date: 2026-05-17

Scope: Future Ancient Egypt Journey final approach feature. This brief prepares a safe Guardian Seal trigger and Ancient Construct awakening sequence without implementing a new cutscene, dialogue, inventory, boss, objective, or route system.

## Current Final Approach Source Of Truth

### Ancient Construct Mini-Boss

Source: `src/components/expedition-journey/journeyLevelData.js`, `MINI_BOSSES`.

Current Egypt data:

```js
{
  id: 'ancient-construct',
  sectionId: 'dig-site-entrance',
  name: 'Ancient Construct',
  type: 'statue',
  x: X(7750),
  y: JY(300),
  width: 62,
  height: 60,
  patrolMin: X(7650),
  patrolMax: X(7935),
  speed: 54,
  health: 3,
  damage: 7,
  shards: 10,
  intro: 'Guardian Encounter: Ancient Construct. No excavation begins until the final seal is restored.',
  dialogue: 'No excavation begins until the final seal is restored.',
  domainName: 'Final Site Access Domain',
  arenaStart: X(7560),
  arenaEnd: X(7950),
}
```

Current runtime behavior:

- `ExpeditionJourney.jsx` awakens mini-bosses by proximity when the player comes within roughly 400 world pixels.
- The first awakening creates `current.bossIntro`, pauses briefly with `current.bossIntroPauseTimer`, applies camera shake, focuses the arena camera, and sets the current notice to the boss intro message.
- Ancient Construct already has boss attack pattern data in `BOSS_ATTACK_PHASE_OVERRIDES`: `construct-slam` and `core-pulse`.

### Site Permit Seal

Source: `src/components/expedition-journey/journeyLevelData.js`, `BOSS_KEY_ITEMS`.

Current data:

```js
{
  id: 'site-permit-seal',
  bossId: 'ancient-construct',
  gateId: 'basecamp-seal',
  sectionId: 'dig-site-entrance',
  name: 'Site Permit Seal',
  shortName: 'Permit',
  label: 'P',
  color: '#166534',
  rewardDetail: 'Base Camp can now open the excavation site.',
}
```

Current runtime behavior:

- The Site Permit Seal is treated like the other boss key items.
- It is revealed after the Ancient Construct is defeated, then recovered through the existing boss key item pickup path.
- Recovery feeds `collectedBossKeyIds`, `postBossReward`, route gate readiness, and the excavation kit pieces UI.

### Base Camp Seal

Source: `src/components/expedition-journey/journeyLevelData.js`, `ROUTE_GATES`.

Current data:

```js
{
  id: 'basecamp-seal',
  name: 'Base Camp Survey Seal',
  x: X(7950),
  y: JY(86),
  width: 34,
  height: 274,
  message: 'Collect enough route evidence before reporting to Base Camp.',
  requires: {
    objective: 'dig-site-entrance',
    miniBoss: 'ancient-construct',
    keyItem: 'site-permit-seal',
    shards: 22,
    checkpoint: 'dig-site-entrance',
  },
}
```

Current runtime behavior:

- The route gate already checks final objective progress, Ancient Construct defeat, Site Permit Seal collection, shard count, and checkpoint.
- It should remain the final progression gate into Base Camp/excavation.

### Dig-Site Entrance Objective

Source: `src/components/expedition-journey/journeyLevelData.js`, `SECTION_OBJECTIVES`.

Current data:

```js
'dig-site-entrance': {
  title: 'Defeat the Guardian and Unlock Base Camp',
  total: 1,
  itemLabel: 'guardian seal',
}
```

Current runtime behavior:

- `getObjectiveProgress('dig-site-entrance')` currently counts progress from `current.defeatedMiniBosses.has('ancient-construct')`.
- There is no current `OBJECTIVE_MARKERS` entry for `dig-site-entrance`.

### Final Approach Props And Events

Source: `STORY_PROPS`, `WORLD_CONTINUITY_LANDMARKS`, `ENVIRONMENT_EVENTS`, and `BOSS_INTROS`.

Already useful final approach props:

- `pyramid-base-guardian-fragment`: giant broken guardian piece near pyramid base.
- `construct-warning-marker`: guardian approach marker.
- `final-survey-lights`: final survey lights.
- `sealed-entrance-survey-lamps`: paired sealed entrance lamps.
- `buried-stairway-marker`: buried stairway marker.
- `base-banners`: massive paired chamber guardians.

Already useful final approach events:

- `dig-hidden-shrine-glow`: "A giant broken guardian piece rests near the pyramid base."
- `final-boundary`: "The chamber approach is protected by ancient guardians."
- `discovery-entrance-reveal`: "Massive guardian statues frame the sealed chamber entrance."

Existing Ancient Construct boss intro support:

```js
BOSS_INTROS['ancient-construct'] = {
  title: 'Final Guardian',
  message: 'The ancient construct powers on before Base Camp.',
  effect: 'camp light surge',
}
```

## Proposed Feature

The player reaches a final object that appears at first like a normal Journey collectible or route reward. It is actually the Guardian Seal.

The sequence should read like this:

1. The player reaches the final chamber approach.
2. The Guardian Seal sits on or near a sacred pedestal, using the same visual language as earlier seals.
3. Pickup or activation shows: "You found the Guardian Seal."
4. A short non-blocking silence/rumble moment follows: "The chamber falls silent."
5. The reveal reframes the object: "The seal was not treasure. It was a warning."
6. The Ancient Construct awakens using the existing boss intro path: "The guardian awakens."
7. The player fights the Ancient Construct.
8. Defeating the construct still reveals/recovers `site-permit-seal` and opens `basecamp-seal` only when all existing requirements are met.

The object should never feel like stolen treasure. It should feel like evidence, a warning, and a sacred mechanism responding to the player's presence.

## Recommended Smallest Implementation Path

Do not build a new cutscene system.

Use the existing Journey systems in this order:

1. Add a final trigger as an `OBJECTIVE_MARKERS` entry only if the marker collection path can trigger a special notice without disturbing existing objectives.
   - Suggested id: `guardian-seal-trigger`.
   - Suggested section: `dig-site-entrance`.
   - Suggested type: `guardian-seal`.
   - Suggested label: `Guardian Seal`.
   - Suggested position: near the final chamber approach before Ancient Construct proximity, around `X(7485)` to `X(7560)`.
2. If objective marker special handling is too broad, use a `STORY_PROPS` marker plus an `ENVIRONMENT_EVENTS` trigger first.
   - This is safer for a first pass because event notices and camera shake already exist.
   - It can stage the reveal text without changing objective completion.
3. Reuse existing event notice/camera shake behavior.
   - `ENVIRONMENT_EVENTS` already sets `current.notice`, `current.dynamicEnvironmentEvent` or `current.environmentEvent`, `current.cameraShakeTimer`, and `current.cameraShakeStrength`.
   - Use short durations and `card: false` for low replay friction.
4. Reuse the boss intro system for the actual awakening.
   - The current boss intro already focuses the arena, pauses briefly, shakes the camera, plays a transition stinger, and marks the boss awakened.
   - The future trigger should call or feed into this path rather than creating a second awakening state.
5. Reuse Ancient Construct sprite frames already recognized by `journeyBossSprites.js`.
   - `ancientConstructIntro`: dormant statue / awakening pose.
   - `ancientConstructWindup`: clear warning before slam.
   - `ancientConstructPulse`: sacred energy area attack.
6. Keep `site-permit-seal` as the post-defeat key item unless the design explicitly changes.
   - The trigger object can be named `Guardian Seal`.
   - The post-boss progression key can remain `Site Permit Seal` or be renamed in a later copy pass, but changing that affects gate text, kit UI, tests, and player understanding.

## Suggested Text

Use these exact lines as short notices or boss-intro copy:

- "You found the Guardian Seal."
- "The chamber falls silent."
- "The seal was not treasure. It was a warning."
- "The guardian awakens."

Suggested flow:

| Beat | Existing system | Text |
| --- | --- | --- |
| Pickup/activation | objective marker pickup or environment event notice | "You found the Guardian Seal." |
| Rumble/silence | environment event with subtle shake | "The chamber falls silent." |
| Reveal | cinematic/event notice, non-blocking if possible | "The seal was not treasure. It was a warning." |
| Boss intro | existing boss intro path | "The guardian awakens." |

## Required Assets

These should align with `docs/egypt-sacred-trap-asset-plan.md` so the final feature and trap set share one sacred visual family.

First asset pack now available:

- `public/assets/expedition/environment/desert-temple/egypt-sacred-traps-pack.png`
- `public/assets/expedition/environment/desert-temple/egypt-sacred-traps-pack.json`

This pack currently provides the Guardian Seal and sacred pedestal states only. The future trigger should still wait for a separate gameplay wiring pass.

Loader status: the pack is registered as passive/future environment pack id `egypt-sacred-traps`. It is available for validation and preview readiness, but the active Egypt Journey still uses `egypt-desert-temple`.

- `guardianSealIdle`
  - A readable seal collectible sitting on or above a stone pedestal.
  - Should look like evidence/ritual mechanism, not loot.
- `guardianSealActivated`
  - Same seal glowing with lapis-blue/gold energy.
  - Clear state change when the trigger is activated.
- `sacredPedestalIdle`
  - Stone pedestal with carved Egyptian geometry.
  - Quiet and readable before activation.
- `sacredPedestalActivated`
  - Pedestal lit from within, with a restrained sacred glow.
- `sealedDoorShut` or final chamber seal visual
  - A closed protected-chamber visual for the final approach/Base Camp Survey Seal area.
  - Should feel ceremonial and guarded, not a treasure vault.
- `ancientConstructIntro`
  - Needs dormant-statue feel: still, heavy, ancient, partially asleep.
  - Should read as a guardian awakening, not a monster jump scare.
- `ancientConstructPulse`
  - Needs sacred energy feel: readable pulse/shockwave from carved core or glyph lines.
  - Should communicate area danger clearly and fairly.

## Gameplay Constraints

- Do not frame the player as stealing treasure.
- Do not create a new cutscene or dialogue system.
- Preserve route progression:
  - `basecamp-seal` must still require `objective: 'dig-site-entrance'`.
  - It must still require Ancient Construct defeat.
  - It must still require `site-permit-seal`.
  - It must still require 22 shards and the `dig-site-entrance` checkpoint.
- Keep replay friction low.
  - Use short notices.
  - Avoid repeated blocking prompts.
  - Movement should only pause if reusing the existing boss intro pause.
- Keep adventure-readable:
  - Sacred/protected/preserved language.
  - No horror, gore, jump-scare framing, theft framing, or punishment language.
- Preserve Base Camp and excavation systems.
- Preserve Ancient China systems.

## What Not To Build Yet

- No new collectible inventory for Guardian Seals.
- No second boss awakening framework.
- No new cutscene timeline engine.
- No new dialogue modal.
- No new route gate type.
- No change to Ancient Construct health, damage, attacks, or rewards.
- No change to excavation unlock rules.
- No rewrite of `ExpeditionJourney.jsx`.

## Future Implementation Tasks

### Completed Passive Visual Staging

Files:

- Modified: `src/components/expedition-journey/journeyLevelData.js`
- Modified: `src/components/ExpeditionJourney.jsx`
- Modified: `src/components/expedition-journey/journeyRenderAssets.js`
- Modified: `src/components/expedition-journey/journeySecrets.test.js`

Status:

- Passive story props now place `sacred-pedestal` and `guardian-seal` near `X(7330)` in the `dig-site-entrance` final approach.
- The existing Journey story-prop renderer loads the `egypt-sacred-traps` atlas as a supplemental passive visual pack.
- Only idle regions are used: `sacredPedestalIdle` and `guardianSealIdle`.
- No Guardian Seal pickup, trigger, activated state, Ancient Construct awakening change, route-gate change, boss change, Base Camp change, excavation change, or China change has been implemented.

### Task 1: Lock Existing Behavior With Tests

Files:

- Modify: `src/components/expedition-journey/journeySecrets.test.js`

Add assertions proving:

- `basecamp-seal` requires `objective: 'dig-site-entrance'`, `miniBoss: 'ancient-construct'`, `keyItem: 'site-permit-seal'`, `shards: 22`, and `checkpoint: 'dig-site-entrance'`.
- Ancient Construct still has `health: 3` and `damage: 7`.
- `site-permit-seal` remains tied to `bossId: 'ancient-construct'` and `gateId: 'basecamp-seal'`.
- Ancient Construct sprite keys include `ancientConstructIntro`, `ancientConstructWindup`, and `ancientConstructPulse`.

Run:

```text
node --test src/components/expedition-journey/journeySecrets.test.js
```

Expected: pass before any feature change, so later edits protect the current contract.

### Task 2: Add A Data-Only First Staging Pass

Files:

- Modify: `src/components/expedition-journey/journeyLevelData.js`
- Modify: `src/components/expedition-journey/journeySecrets.test.js`

Smallest safe first pass:

- Add one `STORY_PROPS` entry near the final chamber approach:

```js
{ id: 'guardian-seal-pedestal', sectionId: 'dig-site-entrance', type: 'ceremonial-offering', x: X(7485), y: JY(306), label: 'Guardian Seal resting on a sacred pedestal' }
```

- Add one `ENVIRONMENT_EVENTS` entry near that pedestal:

```js
{ id: 'guardian-seal-warning', sectionId: 'dig-site-entrance', x: X(7485), name: 'Guardian Seal', message: 'The seal was not treasure. It was a warning.', type: 'shrine-glow', duration: 2.4, shake: 0.12, dynamic: true, card: false }
```

This is safe because it uses only story props and existing event notices. It does not awaken the boss early or alter progression.

Run:

```text
node --test src/components/expedition-journey/journeySecrets.test.js
npm.cmd run lint
npm.cmd run build
git diff --check
```

Expected: pass.

### Task 3: Wire The Real Trigger Only After Assets Exist

Files:

- Modify: `src/components/ExpeditionJourney.jsx`
- Modify: `src/components/expedition-journey/journeyLevelData.js`
- Modify: `src/components/expedition-journey/journeySecrets.test.js`

Use this only after `guardianSealIdle`, `guardianSealActivated`, `sacredPedestalIdle`, and `sacredPedestalActivated` exist.

Implementation direction:

- Add an explicit trigger id such as `guardian-seal-trigger`.
- On activation, set a short sequence of existing notices and a subtle camera shake.
- Feed the final beat into the existing Ancient Construct boss intro path.
- Avoid duplicate boss state by marking the existing `ancient-construct` boss awakened through the same variables the proximity path uses.

Do not complete this task until a browser smoke can verify:

- The trigger appears readable.
- Movement is not blocked longer than the existing boss intro pause.
- Ancient Construct awakens once.
- The Site Permit Seal remains a post-boss reward.

## Testing Plan

Required automated checks:

```text
node --test src/components/expedition-journey/journeySecrets.test.js
node --test src/components/expedition-journey/journeyEnemySprites.test.js
node --test src/components/expedition/baseCampShop.test.js
npm.cmd run lint
npm.cmd run build
git diff --check
```

Required browser smoke for the future implementation:

1. Start a fresh Ancient Egypt Journey.
2. Reach or debug-position to the final dig-site section.
3. Confirm the final approach still shows the pyramid/chamber/guardian props.
4. Collect or activate the Guardian Seal trigger.
5. Confirm the text sequence:
   - "You found the Guardian Seal."
   - "The chamber falls silent."
   - "The seal was not treasure. It was a warning."
   - "The guardian awakens."
6. Confirm Ancient Construct awakens exactly once.
7. Confirm the boss uses `ancientConstructIntro` during awakening.
8. Confirm `ancientConstructPulse` appears during area attack if reachable.
9. Defeat Ancient Construct.
10. Confirm Site Permit Seal still reveals and can be collected.
11. Confirm Base Camp Survey Seal still opens only after all final requirements are met.
12. Continue into Base Camp/excavation and confirm no excavation regressions.

## Recommendation

Do not implement the real trigger yet. The safest next pass is asset creation plus a data-only staging prop/event. The full awakening trigger should wait until the Guardian Seal and sacred pedestal assets exist, because the feature depends on the player noticing that the object is special before the Ancient Construct wakes.
