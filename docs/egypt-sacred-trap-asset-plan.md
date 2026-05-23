# Egypt Sacred Trap Asset Plan

Date: 2026-05-17

Scope: Ancient Egypt Journey hazard, reactive platform, route gate, and story-prop presentation. This plan does not add a new trap system, collision model, route layout, or gameplay rule. It prepares a focused asset set that can be wired into the existing environment atlas path used by `ExpeditionJourney.jsx`.

## Current Rendering Path

- Hazard data lives in `src/components/expedition-journey/journeyLevelData.js` as `HAZARDS`.
- Reactive collapsing platforms are normal `PLATFORMS` entries with a `reactive` object.
- Hazard collision still uses `getHazardHitbox` in `src/components/expedition-journey/journeyUtils.js`.
- Hazard drawing already asks the environment atlas for an asset through `getEnvironmentAssetKeyForHazard` in `src/components/expedition-journey/journeyRenderAssets.js`, then falls back to canvas shapes if no region is available.
- Reactive platforms already draw through `drawPlatform` in `src/components/ExpeditionJourney.jsx`; their warning state is currently a red pulse and shaking line, not a purpose-built cracked-state sprite.
- Route gates and sacred markers already use route-gate drawing plus story props; the current desert-temple atlas includes `sealedGate`, `ancientSeal`, and `routeDoor`, but not stateful seal/door/pedestal frames.

## Current Hazards

| id | label/name | section | current visual representation | sacred defence fit | gameplay readability | asset need |
| --- | --- | --- | --- | --- | --- | --- |
| `desert-low-ridge` | low sand ridge | Desert Entry | `softSand` atlas/fallback | Low; reads like natural terrain | Fair, but not ceremonial | Later pass or fold into pressure-plate/sand-warning family |
| `thorn-bush` | thorn bush | Desert Entry | `thornBush` atlas/fallback | Low; natural obstacle | Readable shape, not sacred | Replace or downplay if sacred pyramid tone is priority |
| `entry-sand-gust-line` | sand gust line | Desert Entry | generic fallback via `collapsingFloor` | Low; weather, not defence | Medium; label/message helps | Needs sand glyph warning if retained |
| `entry-unstable-chip` | unstable stone chip | Desert Entry | generic fallback via `collapsingFloor` | Medium; could be carved loose stone | Medium | Use `crackedPlatformIdle`/`crackedPlatformBreaking` treatment |
| `sand-pit` | soft sand | Desert Entry | `softSand` atlas/fallback | Medium; can become concealed sacred sand trap | Readable as hazard area | Add clearer warning glyph edge |
| `desert-soft-ridge` | soft sand ridge | Desert Entry | `softSand` atlas/fallback | Medium | Fair | Add glyph-edged soft sand variant later |
| `broken-ruins-loose-stones` | loose ruin stones | Desert Entry | `fallingRocks` atlas/fallback | Medium-high near guardian approach | Medium | Needs cracked/loose sacred stone state |
| `sealed-sand` | sealed sand | Desert Entry | generic fallback via `collapsingFloor` | High by name, weak visually | Medium-low; the word carries meaning more than the art | Map to `guardianSealIdle` or `pressurePlateIdle` |
| `temple-threshold-hairline-crack` | hairline floor crack | Ruined Temple | `groundCracked` atlas | High teaching warning state | Good but subtle | Use `crackedPlatformIdle` |
| `temple-loose-step` | loose stone step | Ruined Temple | `spikeTrap` alias | Medium, but current spike read is too arcade | Readable but thematically wrong | Use pressure plate or cracked platform |
| `temple-floor-crack` | floor crack | Ruined Temple | `spikeTrap` alias | High, but current spike read is wrong | Readable but misleading | Use `crackedPlatformBreaking` |
| `sandfall-warning-dust` | falling sand warning | Ruined Temple | `softSand` atlas | High as warning beat | Fair | Needs `fallingStoneWarning` |
| `sandfall-collapsing-stones` | collapsing stones | Ruined Temple | `fallingRocks` atlas | High | Fair, but generic rubble | Needs `fallingStoneActive` |
| `spike-trap` | temple trap | Ruined Temple | `spikeTrap` atlas/fallback | Medium-low; reads like arcade spikes | Very readable, but not respectful/sacred | Replace with `pressurePlatePressed` plus glyph warning |
| `sandfall-soft-pit` | sandfall soft pit | Ruined Temple | `softSand` atlas | Medium | Fair | Later soft-sand/glyph edge |
| `temple-falling-chip` | falling stone chip | Ruined Temple | `fallingRocks` atlas | High | Fair | Needs `fallingStoneWarning`/`fallingStoneActive` depending timing |
| `loose-temple-floor` | loose temple floor | Ruined Temple | generic fallback via `collapsingFloor` | High | Medium | Use `crackedPlatformBreaking` |
| `rolling-stones` | rolling stones | Ruined Temple | `fallingRocks` atlas/fallback | Medium-high if carved stone rollers | Good | Needs ceremonial carved rolling/falling stone cue |
| `catacomb-small-gap` | small dark gap | Catacombs | `darkPit` atlas/fallback | Medium | Good | No urgent new asset |
| `dark-gap` | dark gap | Catacombs | `darkPit` atlas/fallback | Medium | Good | No urgent new asset |
| `catacomb-gap-2` | narrow dark gap | Catacombs | `darkPit` atlas/fallback | Medium | Good | No urgent new asset |
| `catacomb-bat-pocket` | bat pocket | Catacombs | `darkPit` alias | Low as pyramid defence | Medium | Consider replacing with glyph tripwire/breathing dust later |
| `bat-cloud` | bat cloud | Catacombs | `darkPit`/fallback cloud style | Low; creature hazard, not defence | Medium | Not part of sacred trap priority |
| `glyph-tripwire` | glyph tripwire | Catacombs | generic fallback via `collapsingFloor` | Very high | Medium-low; name is stronger than current art | Needs `glyphTripwireIdle` and `glyphTripwireActive` |
| `escape-cracked-step` | cracked bridge step | Escape Sequence | `fallingRocks` alias | Medium | Fair | Use cracked platform state |
| `falling-blocks` | falling blocks | Escape Sequence | `fallingRocks` atlas/fallback | Medium-high | Good | Use `fallingStoneActive` |
| `escape-falling-chip` | falling stone chip | Escape Sequence | `fallingRocks` atlas | Medium-high | Fair | Use `fallingStoneWarning`/`fallingStoneActive` |
| `escape-dust-pocket` | dust pocket | Escape Sequence | `softSand` alias | Medium | Fair | Later glyph dust marker |
| `dust-wave` | dust wave | Escape Sequence | `softSand` alias/fallback dust | Medium | Medium | Later glyph/sand pulse asset |
| `warning-rubble` | warning rubble | Escape Sequence | generic fallback via `collapsingFloor` | Medium | Medium | Use `fallingStoneWarning` |
| `camp-low-rope` | low survey rope | Dig Site Entrance | `collapsingFloor` alias | Low; expedition equipment | Medium | Not sacred trap priority |
| `dig-site-loose-rope` | loose survey rope | Dig Site Entrance | `collapsingFloor` alias | Low | Medium | Not sacred trap priority |
| `loose-slope` | loose slope | Dig Site Entrance | `collapsingFloor` atlas/fallback | Medium | Fair | Later final-approach loose stone asset |
| `dig-site-loose-slope-2` | loose final slope | Dig Site Entrance | `collapsingFloor` alias | Medium | Fair | Later final-approach loose stone asset |
| `survey-rope` | survey rope | Dig Site Entrance | generic fallback via `collapsingFloor` | Low; expedition equipment | Medium | Not sacred trap priority |

## Current Reactive Platforms

| id | label/name | section | current visual representation | sacred defence fit | gameplay readability | asset need |
| --- | --- | --- | --- | --- | --- | --- |
| `catacomb-bone-dry-bridge` | bone-dry bridge | Catacombs | platform atlas plus red pulse/shake while timer runs | Medium; currently more fragile bridge than sacred mechanism | Good once stepped on, less clear before stepping | `crackedPlatformIdle`, `crackedPlatformBreaking`, `crackedPlatformBroken` |
| `escape-falling-stair` | falling stair | Escape Sequence | platform atlas plus red pulse/shake, then hidden until respawn | Medium-high if presented as ancient moving stair | Good after activation | `crackedPlatformIdle`, `crackedPlatformBreaking`, `crackedPlatformBroken` |
| `escape-broken-bridge-step` | broken bridge step | Escape Sequence | platform atlas plus red pulse/shake, then hidden until respawn | Medium | Good after activation | `crackedPlatformIdle`, `crackedPlatformBreaking`, `crackedPlatformBroken` |

## Missing Asset Set

Recommended atlas file:

- `public/assets/expedition/environment/desert-temple/egypt-sacred-traps-pack.png`
- `public/assets/expedition/environment/desert-temple/egypt-sacred-traps-pack.json`

Created first pack status:

- `guardianSealIdle`, `guardianSealActivated`, `sacredPedestalIdle`, and `sacredPedestalActivated` now exist in the atlas above.
- The pack is registered as a passive future environment pack id, `egypt-sacred-traps`, so the existing Journey environment loader can validate/load it by id without changing the active Egypt Journey pack.
- The remaining pressure plate, cracked platform, falling stone, glyph tripwire, and sealed door regions are still pending.
- The atlas is intentionally not wired into Journey gameplay yet; later passes should map these regions through the existing environment asset paths without changing collision, route, or boss logic.

Exact region keys:

- `pressurePlateIdle`
- `pressurePlatePressed`
- `crackedPlatformIdle`
- `crackedPlatformBreaking`
- `crackedPlatformBroken`
- `fallingStoneWarning`
- `fallingStoneActive`
- `glyphTripwireIdle`
- `glyphTripwireActive`
- `sealedDoorOpen`
- `sealedDoorClosing`
- `sealedDoorShut`
- `guardianSealIdle`
- `guardianSealActivated`
- `sacredPedestalIdle`
- `sacredPedestalActivated`

## Where Each Asset Should Be Used

| region key | current data targets | existing system to use |
| --- | --- | --- |
| `guardianSealIdle` | `sealed-sand`, route gates `temple-approach-seal`, `guardian-prep-seal`, `desert-seal`, story props `sand-seal-route-marker`, `broken-seal-marker`, `opening-sacred-threshold-guardian` | `getEnvironmentAssetKeyForHazard`, `drawRouteGate`, `getEnvironmentAssetKeyForStoryProp` |
| `guardianSealActivated` | route gate blocked/ready feedback and event beats such as `opening-sacred-threshold-watch` | existing route gate draw state and event shake/notice path |
| `sacredPedestalIdle` | `temple-threshold-hairline-crack`, `temple-loose-step`, `switch-1-raised-return-plinth`, story prop markers near switches/seals | platform/story prop atlas mapping |
| `sacredPedestalActivated` | `switch-1-raised-return-plinth` after `switch-1`, future route-open pedestal states | existing `requiresObjective` platform path |
| `pressurePlateIdle` | `spike-trap`, `temple-loose-step`, `sealed-sand` if kept as floor trigger | hazard atlas mapping |
| `pressurePlatePressed` | hazard hit feedback for `spike-trap`/pressure-plate family if later stateful drawing is added | current hazard hit path can initially show this only on hit/near state |
| `crackedPlatformIdle` | `temple-threshold-hairline-crack`, `entry-unstable-chip`, reactive platforms before activation | platform/hazard atlas mapping |
| `crackedPlatformBreaking` | `temple-floor-crack`, `loose-temple-floor`, reactive platform active timer | current reactive timer state in `drawPlatform` |
| `crackedPlatformBroken` | collapsed reactive platforms while waiting for respawn | current `collapsedPlatformIds` state in `drawPlatform` |
| `fallingStoneWarning` | `sandfall-warning-dust`, `temple-falling-chip`, `warning-rubble` | hazard atlas mapping |
| `fallingStoneActive` | `sandfall-collapsing-stones`, `falling-blocks`, `escape-falling-chip`, `rolling-stones` | hazard atlas mapping |
| `glyphTripwireIdle` | `glyph-tripwire` before contact | hazard atlas mapping |
| `glyphTripwireActive` | `glyph-tripwire` hit/near feedback | current hazard hit/near state |
| `sealedDoorOpen` | route gates when ready/open, `temple-door` story prop | `drawRouteGate` and story prop mapping |
| `sealedDoorClosing` | route gates while locked/near-blocked, possible cinematic event | route gate draw state if a later state hook is added |
| `sealedDoorShut` | locked route gates and `sealed-tomb-entrance` support art | route gate/story prop mapping |

## Priority Order

1. Guardian Seal and Sacred Pedestal: strongest bridge from the opening threshold to the Scarab Queen and route gates.
2. Pressure Plate and Pressed Plate: replaces the arcade-feeling `spike-trap` with a more respectful ancient mechanism.
3. Cracked Platform States: improves existing reactive platforms without changing their timing or collision.
4. Falling Stone Warning and Active: makes warning/active danger readable before damage.
5. Glyph Tripwire Idle and Active: turns the highest-concept trap into visible sacred defence.
6. Sealed Door Open/Closing/Shut: important, but route gates already read acceptably through existing seal art and messages.

## Visual Direction

- Ancient Egyptian sandstone and carved limestone shapes.
- Gold and lapis-blue accents used sparingly for sacred activation states.
- Clear silhouettes: round seal, square pressure plate, cracked slab, falling block, glowing glyph line, sealed doorway, pedestal.
- Game-camera-safe contrast and clean outlines.
- Warning states should glow or pulse before danger, not surprise the player.
- Adventure-readable and ceremonial: no gore, horror, realistic injury, skull piles, treasure-thief framing, or aggressive punishment language.
- Keep each state simple enough to read during fast side-view platforming.

## Proposed Implementation Sequence

1. Generate `egypt-sacred-traps-pack.png` and JSON with the exact region keys above.
2. Add a small environment trap pack loader or extend the existing environment asset loader only if it can support the new pack without replacing `desert-temple-pack`.
3. Map the most important current hazards first:
   - `sealed-sand` -> `guardianSealIdle`
   - `spike-trap` / `temple-loose-step` -> `pressurePlateIdle`
   - `temple-threshold-hairline-crack`, `temple-floor-crack`, `loose-temple-floor` -> cracked platform states
   - `sandfall-warning-dust`, `sandfall-collapsing-stones`, `temple-falling-chip` -> falling stone states
   - `glyph-tripwire` -> glyph tripwire states
4. Extend `drawPlatform` only enough to select cracked states from the existing reactive timer/collapsed state.
5. Extend `drawRouteGate`/story prop asset mapping only enough to use guardian seal and sealed door states.
6. Keep all collision, damage, timers, routes, and requirements unchanged.

## Testing Checklist

- `node --test src/components/expedition-journey/journeySecrets.test.js`
- `node --test src/components/expedition-journey/journeyEnemySprites.test.js`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`
- Browser smoke:
  - Egypt Journey starts.
  - Temple Approach Seal and Guardian Prep Seal still block/open by the same requirements.
  - Scarab Queen intro still appears naturally.
  - Hazard contact still costs the same stamina/time.
  - Reactive platforms still shift, collapse, respawn, and keep the same timers.
  - Route gates still show their existing messages and checklists.
  - No fallback/missing asset errors after the new atlas is wired.
