# Guardian Seal Placement Plan

Date: 2026-05-17

Scope: passive planning only for the future Guardian Seal and sacred pedestal placement in the Ancient Egypt Journey final route. This plan does not change gameplay, route gates, objectives, boss logic, excavation, or China.

## Current Final-Route Source Of Truth

Source file: `src/components/expedition-journey/journeyLevelData.js`.

### Final Section

- Section id: `dig-site-entrance`
- Current range: `start: X(6500)`, `end: WORLD_WIDTH`
- Current atmosphere title: `Base Camp is in sight. You have reached the dig.`
- Current final discovery entrance: `DISCOVERY_ENTRANCE`
  - id: `sealed-tomb-entrance`
  - x: `X(7968)`
  - y: `JY(182)`
  - width: `X(150)`
  - title: `Sealed Tomb Entrance`

### Ancient Construct

Current mini-boss entry:

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

Current awakening behavior is in `src/components/ExpeditionJourney.jsx`: the boss awakens when `Math.abs(b.x - player.x) < 400`. For the Ancient Construct at `X(7750)`, the practical wake boundary begins around authored `X(7350)`.

### Site Permit Seal

Current post-boss key item:

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

This should remain a post-Ancient-Construct reward unless a later copy pass deliberately renames it across tests and UI.

### Base Camp Survey Seal

Current final route gate:

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

This gate is the source of truth for Base Camp access. Do not change its requirements for the passive placement step.

### Dig-Site Entrance Objective

Current section objective:

```js
'dig-site-entrance': {
  title: 'Defeat the Guardian and Unlock Base Camp',
  total: 1,
  itemLabel: 'guardian seal',
}
```

Current objective progress is driven by Ancient Construct defeat. There is no current `OBJECTIVE_MARKERS` entry for `dig-site-entrance`.

### Nearby Final-Approach Props And Events

Useful existing story props:

- `permit-clue-marker` at `X(7040)`: carved permit wall marker
- `pyramid-base-guardian-fragment` at `X(7105)`: giant broken guardian piece near pyramid base
- `construct-warning-marker` at `X(7330)`: guardian approach marker
- `final-survey-lights` at `X(7505)`: final survey lights
- `base-banners` at `X(7485)`: massive paired chamber guardians
- `sealed-entrance-survey-lamps` at `X(7850)`: paired sealed entrance lamps
- `buried-stairway-marker` at `X(7945)`: buried stairway marker

Useful existing events:

- `dig-hidden-shrine-glow` at `X(7180)`: "A giant broken guardian piece rests near the pyramid base."
- `final-boundary` at `X(7330)`: "The chamber approach is protected by ancient guardians."
- `discovery-entrance-reveal` at `X(7970)`: "Massive guardian statues frame the sealed chamber entrance."

Relevant final-route platforms and hazards:

- Ground: `X(6500)` to `WORLD_WIDTH`, label `dig-site rise`
- `permit checkpoint`: `x: X(7075)`, `y: JY(282)`, width `145`
- `last ledge`: `x: X(7240)`, `y: JY(302)`, width `170`
- `final evidence step`: `x: X(7365)`, `y: JY(268)`, width `118`
- `guardian approach rest`: `x: X(7445)`, `y: JY(292)`, width `170`
- `survey-rope` hazard: `x: X(7135)`
- `dig-site-loose-slope-2` hazard: `x: X(7335)`

## Recommended Placement

### Passive Placement Target

Recommended first passive location:

- Sacred pedestal visual: `x: X(7330)`, `y: JY(306)`
- Guardian Seal visual sitting on pedestal: same authored center, visually stacked above the pedestal
- Data home for passive step: `STORY_PROPS`
- Suggested future ids:
  - `guardian-seal-pedestal-passive`
  - `guardian-seal-passive`

Why this location:

- It sits beside the existing `construct-warning-marker` and `final-boundary` event, so it reads as part of the protected chamber approach.
- It is just before the current Ancient Construct proximity wake boundary around `X(7350)`, reducing the chance that passive inspection wakes the boss early.
- It is far enough from `basecamp-seal` at `X(7950)` that it does not look like the final gate itself.
- It reinforces the opening/Scarab Queen guardian language before the final guardian domain.

### Future Trigger Placement

Recommended future trigger location:

- Trigger interaction point: `x: X(7330)` to `X(7340)`, `y: JY(306)`
- Keep it before the current proximity wake line unless the later trigger pass explicitly changes the Ancient Construct wake condition.
- If the later pass wants the seal on the `guardian approach rest` platform around `X(7445)` to `X(7505)`, it must first prevent the existing proximity rule from waking Ancient Construct early.

### Ancient Construct Awakening

Recommended awakening source:

- Keep Ancient Construct at `x: X(7750)` for the first trigger implementation.
- Keep arena bounds at `arenaStart: X(7560)` and `arenaEnd: X(7950)`.
- Let the future trigger reuse the existing boss intro/domain path so the player is moved to the arena start exactly as the current proximity awakening does.

### Distance To Final Gate

- Guardian Seal/passive pedestal at `X(7330)` is about 620 authored units before `basecamp-seal` at `X(7950)`.
- Ancient Construct at `X(7750)` is about 200 authored units before `basecamp-seal`.
- This spacing lets the seal read as the warning/trigger, the Ancient Construct as the response, and the Base Camp Survey Seal as the progression check after the boss.

## Passive Visual First Step

The next safe implementation should be visual-only:

1. Add one or two `STORY_PROPS` entries near `X(7330)`.
2. Map those prop types to the already created `egypt-sacred-traps` regions:
   - `sacredPedestalIdle`
   - `guardianSealIdle`
3. Do not add collision, pickup, objective progress, route-gate changes, or boss-awakening changes.
4. Do not make the visual pulse like a collectible yet, because that may confuse players if it cannot be picked up.
5. Use a label such as `Guardian Seal resting on a sacred pedestal` for debug/snapshot clarity, but do not render text on the asset.

Preferred passive first-step data:

```js
{ id: 'guardian-seal-pedestal-passive', sectionId: 'dig-site-entrance', type: 'sacred-pedestal', x: X(7330), y: JY(306), label: 'Guardian Seal resting on a sacred pedestal' }
```

Optional, only if the renderer needs separate layers:

```js
{ id: 'guardian-seal-passive', sectionId: 'dig-site-entrance', type: 'guardian-seal', x: X(7330), y: JY(286), label: 'Guardian Seal warning symbol' }
```

## Later Trigger Step

A future trigger prompt should convert the passive placement into a real trigger only after the passive visual is readable in browser smoke.

Recommended future path:

1. Add test coverage that locks current final-route requirements:
   - `basecamp-seal` requirements unchanged
   - `site-permit-seal` remains tied to `ancient-construct`
   - Ancient Construct health/damage/arena unchanged
2. Convert the passive seal into a trigger using the smallest existing system:
   - Prefer `OBJECTIVE_MARKERS` if marker collection can trigger special text without affecting section objective counts too broadly.
   - Otherwise use `STORY_PROPS` plus `ENVIRONMENT_EVENTS` first, then add pickup behavior only after the narrative beat works.
3. Reuse existing event notice and camera-shake systems for:
   - "You found the Guardian Seal."
   - "The chamber falls silent."
   - "The seal was not treasure. It was a warning."
4. Feed the final beat into the existing Ancient Construct boss intro/domain path.
5. Avoid duplicate boss state by using the same `awakened`, `seenBossIntroIds`, `bossIntro`, `bossDomain`, and arena-start behavior that the proximity path already uses.

## Risks

### Route Progression

Changing `basecamp-seal`, `dig-site-entrance`, or `site-permit-seal` too early could break the final handoff to Base Camp. The passive placement step should not touch those data objects.

### Replay Friction

The final route already has boss intro pause behavior. The future trigger should not add a second blocking dialogue or modal before the existing boss intro.

### Player Confusion

If the Guardian Seal looks collectible before it actually does anything, students may try to pick it up and think the game is broken. The passive visual should read as a ceremonial warning/pedestal first, not a glowing pickup.

### Boss/Base Camp Handoff

The Ancient Construct currently drops `site-permit-seal`, and `basecamp-seal` requires it. A future trigger must not replace that reward unless the whole final progression copy and tests are updated together.

### Proximity Awakening

Because Ancient Construct currently wakes when the player comes within 400 units of `X(7750)`, placing the passive seal at `X(7485)` or `X(7505)` would likely wake the boss before the player understands the seal. The safest passive placement is around `X(7330)` unless the future trigger pass changes the awakening condition.

## Testing Checklist For Future Passive Placement

- `node --test src/components/expedition-journey/journeySecrets.test.js`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`
- Browser smoke:
  - reach or debug-position to `dig-site-entrance`
  - confirm passive pedestal/seal is visible before Ancient Construct wakes
  - confirm no pickup prompt appears
  - confirm Ancient Construct still wakes by the current proximity rule only
  - confirm `site-permit-seal` and `basecamp-seal` behavior remains unchanged
