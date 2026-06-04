# Fast Fluid Combat Design

Date: 2026-06-04
Repo: `C:\Users\dmahe\Documents\LocalCodex\Archaeology-Dig-App`

## Purpose

Lost Site Expedition combat should stop feeling like Asha is simply clearing monsters out of the way. Combat should feel fast, fluid, risky, satisfying, and tied to the archaeology adventure: Asha survives by reading danger, moving well, restoring damaged memory, and using the site itself.

The target feel is:

> Asha dances through danger, earns momentum through clean timing, and changes the world by restoring what was broken.

This spec extends the existing Journey combat, enemy, trap, audio, puzzle, and room systems. It must not create a parallel combat engine.

## Canonical Systems

Use the existing implementation path:

- Journey runtime and combat loop: `src/components/ExpeditionJourney.jsx`
- Enemy, hazard, room, and route data: `src/components/expedition-journey/journeyLevelData.js`
- Hitboxes, player/enemy state helpers, and runtime creation: `src/components/expedition-journey/journeyUtils.js`
- Reusable trap runtime/editor helpers: `src/components/expedition-journey/journeyTraps.js`
- Expedition SFX registry and playback: `src/App.jsx`
- Existing combat tests: `src/components/expedition-journey/journeySecrets.test.js`, `src/components/expedition-journey/journeyEnemySprites.test.js`, `src/components/expedition-journey/journeyTraps.test.js`, `scripts/journeyCollisionTuning.test.mjs`

## Design Pillars

1. **Fast and fluid**
   Asha should respond quickly. Combat should reward movement, timing, and confident repositioning.

2. **Risk with readable danger**
   Enemies can hit harder, but they must telegraph attacks clearly through animation, body language, audio, and timing.

3. **Momentum instead of mashing**
   Clean hits, dodges, finishers, puzzle solves, and enemy finishes should restore flow. Misses, blocks, greedy attacks, and enemy hits should drain Endurance.

4. **World-integrated recovery**
   Recovery should come from restoring rooms, solving puzzles, reaching safe points, and finishing meaningful threats, not from generic constant regeneration.

5. **Restore behind, awaken ahead**
   Restored rooms become safer. Deeper rooms become more dangerous and smarter as the site reacts to Asha.

## Asha Combat Kit

### Starting Kit

Asha starts with:

- quick attack chain
- three-hit Flow Combo
- grounded directional dodge
- dodge-cancel
- jump
- basic enemy stomp/bounce behaviour already present

The first major combat pass should add or formalize:

- real combo timing window
- combo reset rules
- multi-target finisher damage and knockback
- dodge from start
- dodge-cancel rules
- stronger combat SFX and feedback

### Dodge

Dodge is available from the start. It is Asha's core defensive movement.

Rules:

- Ground-only for the first implementation.
- Directional: holding left/right dodges that direction.
- No held direction: dodge backward from Asha's facing direction.
- Moves Asha away; does not phase through enemies by default.
- Fixed Endurance cost.
- Short invulnerability window near the start of the dodge.
- Short recovery so it feels fast.
- Can be used during most actions, including attack windup, swing, and recoil.
- Cannot be used while being hit, knocked back, trap-stunned, locked by cinematic movement, or hard-landing.

Dodge-cancel trade-off:

- Dodge before a hit connects: combo resets.
- Dodge after a successful hit connects: combo is preserved for a short window.
- Dodge after a miss, blocked hit, or protected deflect: combo resets.
- Getting hit resets combo.

Later upgrade options:

- perfect dodge refund
- dodge-through-light-enemy relic
- air recovery twist without invulnerability
- true air dodge only if later playtesting demands it

### Flow Combo

Asha's three-hit combo is a skill rhythm, not automatic animation cycling.

Rules:

- Hit 1 opens the combo.
- Hit 2 is available only if the next attack is started inside the combo window.
- Hit 3 is a finisher only if the first two hits connected and timing is preserved.
- Miss, block, enemy hit, timeout, or pre-hit dodge resets to hit 1.
- A post-hit dodge preserves the combo window.
- Combo state should have subtle audio/visual feedback, not heavy tutorial text.

### Flow Finisher

The third combo hit is Asha's crowd-control payoff.

Rules:

- Wide multi-target sweep.
- Large damage.
- Strong knockback.
- Stronger hit-stop and camera punch.
- Unique finisher SFX.
- Dust or weapon-arc feedback.
- Costs extra Endurance up front.
- Refunds Endurance if it lands.
- Refunds more if it hits multiple enemies.
- Can give extra reward when it defeats an enemy.
- Missed finisher is expensive and resets combo.
- Blocked finisher resets combo and produces recoil/deflect feedback.

Primary target can take full damage. Secondary targets can take slightly reduced damage unless they are small enemies. Heavy guarded enemies should take damage but less knockback unless staggered or vulnerable.

### Jump Attack

Jump attack should connect platforming and combat, but it should come after the first dodge/combo slice.

Rules:

- Forward/downward aerial khopesh strike.
- Strong against flying or low enemies.
- Useful for closing distance.
- Risky landing recovery.
- Does not replace dodge or parry.
- Costs Endurance, but less than the finisher.

### Parry

Parry should be added later as an advanced high-skill option.

Rules:

- Not the core defensive move.
- Short active window.
- High reward if perfect.
- Failed parry leaves Asha exposed.
- Successful parry staggers enemies, restores Endurance, creates a strong clash effect, and opens a counter window.

## Endurance Model

Use one main survival meter. Do not add a separate health bar in the first combat overhaul.

Rename or present stamina thematically as **Endurance**.

States:

- **Steady:** normal movement and combat.
- **Strained:** low Endurance warning, stronger breath/audio/visual pressure.
- **Exhausted:** Endurance at zero; Asha is still alive but vulnerable.
- **Overwhelmed:** enemy hit pushes below zero and returns Asha to checkpoint/rescue.

Rules:

- Attacks cost Endurance.
- Dodge costs fixed Endurance.
- Finisher costs extra Endurance.
- Missed and blocked attacks cost extra Endurance.
- Traps, hazards, natural drain, and room pressure can reduce Endurance to zero but not below zero for now.
- Enemy and boss hits can push Endurance below zero.
- If an enemy or boss hit pushes Endurance below zero, Asha is overwhelmed and returns to checkpoint.
- Natural drain at zero allows a slow last-chance recovery.
- At zero, Asha can still move and use basic attacks, but cannot freely dodge or use finishers until she recovers enough Endurance.

Recovery sources:

- full restore from room Memory Seal interaction
- full restore after major room puzzle completion interaction
- major restore or full restore after boss/guardian defeat
- small restore from finishing enemies
- possible small restore from clean combo completion
- rare supplies or field caches

No constant normal combat regeneration in the first pass. The only automatic recovery is the slow last-chance recovery while exhausted at zero.

## Memory Seal Recovery

Recovery should be in-world and story-rich.

After meaningful puzzle completion, a restored room object becomes interactable. Interacting with it fully restores Endurance and shows that Asha changed the room.

Possible object types:

- restored Memory Seal
- repaired mural
- scribe tablet
- ritual table
- Queen's memory anchor
- field water/cache in exterior rooms
- survey station near Base Camp
- guardian seal after a boss

Rules:

- Full Endurance restore on interaction.
- One main restore per completed room or major room state.
- The interaction should add story, context, or emotional meaning.
- The room should visibly and audibly calm after restoration.
- Restored local rooms become safer.

Major Memory Seals can also increase max Endurance when difficulty rises with Asha.

Suggested max Endurance progression:

- start: 100
- first major seal: 115
- first guardian/boss: 130
- mid-region major puzzle: 145
- later guardian: 160

These numbers are illustrative. Final tuning should come from playtests.

## Site Awakening

Site Awakening is invisible to the player as a UI system.

The player should feel the world reacting through:

- enemies becoming smarter
- new attacks appearing
- longer pursuit
- better enemy coordination
- traps waking in deeper rooms
- Anubis lines changing tone
- restored rooms calming
- deeper rooms becoming more dangerous
- boss phases escalating

Do not show an Awakening meter.

Difficulty should scale mostly through behaviour, not raw stats.

Priority order:

1. New enemy attacks.
2. Smarter aggression and awareness.
3. Group pressure and spacing.
4. Trap/enemy interactions.
5. Heavier hit consequences.
6. Modest HP increases.

Use hybrid scaling:

- Each region has authored base difficulty.
- Asha max Endurance can apply a small adaptive multiplier.
- Early teaching enemies should stay capped and readable.
- Bosses and major enemies should be authored carefully instead of blindly scaled.

## Enemy Direction

Each enemy family needs a role.

- **Scarab:** fast charger, front shell deflect, weak from behind or after commitment.
- **Scorpion:** anti-jump sting, venom pressure, tail guard, punishes careless aerial play.
- **Snake:** long lunge, poison, readable coil tell.
- **Sand Wisp/Bat:** airborne pressure, disrupts lazy ground combos.
- **Mummy:** slow guarded sweep, punishes rushed attacks, clear counter window.
- **Guardian/Statue:** heavy poise, shockwave/slam, vulnerable after commitment.
- **Looter:** fast human pressure, dodge/retreat behaviour, throws dust or leads Asha toward traps.

Enemies should hit harder than they currently feel, but only alongside fair tells and new defensive tools.

Move toward internal 100-style health/damage scale so attacks can differ meaningfully:

- Asha light hit: about 12
- Asha second hit: about 16
- Asha finisher: about 34
- jump attack: about 24
- parry counter: about 40
- small enemy: about 45 HP
- scorpion/snake: about 70-90 HP
- mummy: about 130 HP
- guardian: about 180 HP

Final values should be tuned through short combat playtests.

## Traps And Room Combat

Traps should become tactical tools, not just punishment.

Use the existing reusable trap path in `journeyTraps.js`.

Future trap-combat ideas:

- pressure plates fire darts that can hit enemies
- cracked floors collapse under heavy enemies
- sand pits slow large enemies
- sacred seals spawn guardians when disturbed
- scarab lairs release swarms unless sealed
- enemies can trigger traps while chasing Asha
- restored room seals disable or calm local traps

For now, traps and hazards stop at zero Endurance. Later exceptions can be authored for crushing blocks, pits, boss arena traps, or late-game sacred blasts.

## Audio And Feedback

Combat needs stronger sound and feedback.

Add distinct cues for:

- dodge
- attack 1
- attack 2
- finisher
- missed swing
- blocked hit
- protected enemy deflect
- enemy hit by family
- enemy heavy windup
- perfect dodge
- parry clash
- exhausted breathing
- Endurance restored
- Memory Seal restored

Feedback should include:

- hit-stop
- camera punch
- dust
- weapon sparks
- enemy stagger
- screen-edge pressure at low Endurance
- subtle weapon glow while combo is preserved

Avoid large arcade text labels.

## Dramatic Room Reactivation

Restored rooms should usually remain safe, but selected story events can dramatically reactivate or corrupt them.

Rules:

- Reactivation is authored, not random.
- Use it sparingly for emotional or story moments.
- Reactivated rooms should show visible corruption or danger returning.
- The player should understand this as story consequence, not a broken promise.

Good triggers:

- major guardian defeat
- Anubis distrust moment
- stolen/corrupted memory reveal
- late-game return route
- escape sequence
- boss influence spreading backward

## Implementation Slices

### Slice 1: Core Combat Feel

- Add grounded directional dodge from start.
- Add dodge-cancel rules.
- Implement real combo window and reset rules.
- Preserve combo after landed-hit dodge-cancel.
- Add finisher damage/knockback/refund rules.
- Add stronger dodge, swing, hit, deflect, and finisher SFX.
- Add focused tests for combo reset/preserve contracts.

### Slice 2: Endurance Rules

- Present stamina as Endurance.
- Add exhausted state at zero.
- Make traps/hazards/natural drain stop at zero.
- Let enemy/boss hits push below zero and trigger checkpoint rescue.
- Add low/zero Endurance feedback.

### Slice 3: Memory Seal Recovery

- Add interactable full-restore room objects after solved puzzles.
- Restore Endurance on interaction.
- Add local room calming state.
- Add story text/audio/visual feedback.

### Slice 4: Enemy Threat Pass

- Convert combat to wider internal HP/damage tuning.
- Increase enemy damage enough that hits matter.
- Add smarter attacks and aggression by enemy family.
- Keep first teaching enemies readable.

### Slice 5: Advanced Combat And Room Tactics

- Add jump attack.
- Add perfect dodge reward.
- Add later parry.
- Add trap/enemy interactions.
- Add dramatic room reactivation.

## Testing And Verification

For each implementation slice:

- Add focused source/runtime tests around the changed contracts.
- Run relevant node tests first.
- Run `npm.cmd run lint`.
- Run `npm.cmd run build`.
- Browser-check the relevant combat flow where possible.
- Do not leave dev servers or browser helpers running.

Likely focused tests:

- combo resets on miss/block/hit/timeout
- combo preserves after landed-hit dodge-cancel
- finisher damages/knocks back multiple enemies
- dodge spends fixed Endurance and does not phase through enemies
- traps stop at zero Endurance
- enemy hits below zero trigger rescue
- Memory Seal interaction fully restores Endurance
- early teaching enemies remain fair after scaling

## Open Decisions

- Exact dodge key/button.
- Exact Endurance costs and restore values.
- Whether jump attack is available from start or very early.
- First Memory Seal object to implement.
- Which existing room should be the first full recovery anchor.
- Whether max Endurance upgrades appear in the first implementation slice or later.

## Recommendation

Begin implementation with Slice 1: Core Combat Feel.

This directly addresses button mashing before changing the broader progression economy. It also creates the combat foundation that Endurance, Memory Seals, smarter enemies, and trap interactions can build on.
