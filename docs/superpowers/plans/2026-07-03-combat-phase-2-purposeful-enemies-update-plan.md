# Combat Phase 2 Purposeful Enemies Update Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans before implementing this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Journey combat feel purposeful, responsive, dangerous, and satisfying by turning enemies into readable threats that ask Asha to dodge, jump, counter, and choose when fighting is worth it.

**Architecture:** Extend the existing Journey combat path. Keep simulation in `src/components/expedition-journey/useJourneySimulation.js`, reusable combat contracts in `src/components/expedition-journey/journeyCombat.js`, hitbox/runtime helpers in `src/components/expedition-journey/journeyUtils.js`, enemy encounter data in `src/components/expedition-journey/journeyLevelData.js`, and rendering/telegraphs in `src/components/expedition-journey/useJourneyRenderer.js`. Do not create a second combat engine.

**Tech Stack:** React 19, Vite, canvas Journey runtime, Node test runner, existing Expedition SFX and sprite atlas loaders.

---

## Audit Verdict

Combat already has a useful foundation: `J` light attack, `K` heavy follow-up/shove, `L` dodge, perfect dodge, Endurance, enemy windups, heavy telegraphs, counter windows, hit-stop, camera shake, creature hit sounds, shield deflects, enemy health tuning, and several enemy roles in data.

The player-facing problem is that these parts do not yet combine into a strong combat loop. Enemies have purpose written into data, but their live behavior still mostly reads as patrol, approach, standoff, windup, swing, recover. Running past enemies often remains easier than learning them. Jump is present as movement and basic bounce/stomp support, but it is not yet a core combat verb.

The next big improvement should not be a broad HP tweak. It should be a combat identity pass: enemy intent, family-specific abilities, jump/dodge decisions, stronger hit reactions, and route stakes that make fighting feel worth doing.

## Confirmed Current State

- Existing combat direction lives in `docs/superpowers/specs/2026-06-04-fast-fluid-combat-design.md`.
- Existing Slice 1 plan lives in `docs/superpowers/plans/2026-06-04-fast-fluid-combat-slice-1.md`.
- Current combat contracts live mostly in `src/components/expedition-journey/journeyCombat.js`.
- Current enemy AI and Asha combat execution live mostly in `src/components/expedition-journey/useJourneySimulation.js`.
- Current enemy roles and encounter intent notes live in `src/components/expedition-journey/journeyLevelData.js`.
- Current attack tells and combat effects are drawn through `src/components/expedition-journey/useJourneyRenderer.js`.
- Current hitbox/stomp/hurtbox helpers live in `src/components/expedition-journey/journeyUtils.js`.

## What Is Not Working Well Enough

1. **Enemies lack visible intent.**
   Enemy data includes `combatPurpose`, `encounterRole`, `combatRole`, `protectsRouteId`, and `pressureHint`, but the live AI does not yet make those roles obvious enough moment to moment.

2. **Most enemies share the same emotional rhythm.**
   The code supports different attack timings, heavy attacks, venom, shell deflects, and aerial enemies, but the player still experiences too much of the same chase-and-swing loop.

3. **Combat can be bypassed without enough consequence.**
   Some enemies guard routes or rewards, but many encounters can be treated as moving clutter. Running past should remain a valid choice sometimes, but it needs trade-offs: lost rewards, pursuit pressure, blocked route rewards, awakened hazards, or being forced into a worse position.

4. **Asha's timings need more flow.**
   Current attacks and dodge rules work, but the flow can still feel stop-start. The player needs clearer input buffering, shorter recovery where appropriate, stronger cancel rules, and more obvious reward for clean timing.

5. **Jump is underused in combat.**
   Asha can jump, double-jump in scoped opening areas, and bounce/stomp some enemies. That is not yet enough. Jump should become a combat decision: hop shockwaves, vault charges, aerial strike wisps, bait scorpion anti-air, and punish low sweeps.

6. **Hit satisfaction is present but not decisive.**
   There are hit sparks, slash overlays, hit-stop, camera shake, and sounds, but the best hit moments should feel sharper: enemy recoil, brief slowdown, sprite hit frames, cleaner defeat beats, and stronger Endurance feedback when Asha is hurt.

7. **The player is told to read danger, but enemy tells are still generic.**
   Gold/orange/red telegraphs are useful, but the game needs body-language tells tied to ability identity: scorpion tail raise, scarab shell brace, snake coil, mummy shoulder windup, guardian ground pulse, wisp dive shimmer.

## Recommended Direction

Build a focused **Purposeful Combat Vertical Slice** first, centered on the Egypt opening route from the first enemies through the Scarab Queen approach. Make three to five enemy families genuinely fun there, then spread the improved system outward.

Use this player promise:

> Asha wins by reading intent, moving with courage, and turning ancient danger against itself.

The target feel should draw from:

- **Hollow Knight:** readable enemy silhouettes, jump-as-combat-positioning, fast recoveries.
- **Prince of Persia / Ori:** acrobatic movement as survival, not just traversal.
- **Sekiro-light:** danger tells and satisfying deflect/dodge moments, but without becoming punishing or technical.
- **Dead Cells:** quick enemy family identity and sharp hit feedback.
- **Zelda-style adventure combat:** enemies guard routes, keys, memory objects, and secrets rather than existing as filler.

## Phase 1: Combat Intent System

**Purpose:** Make every enemy decide what it is trying to do.

**Files:**
- Modify: `src/components/expedition-journey/journeyCombat.js`
- Modify: `src/components/expedition-journey/useJourneySimulation.js`
- Modify: `src/components/expedition-journey/journeyLevelData.js`
- Test: `src/components/expedition-journey/journeyCombat.test.js`
- Test: `src/components/expedition-journey/journeySecrets.test.js`

- [ ] Add a small enemy intent resolver that converts existing data fields into live behavior tags: `guard`, `pressure`, `ambush`, `antiAir`, `rangedHarass`, `routeDeny`, `flank`, `retreat`, `bossPrep`.
- [ ] Keep the resolver data-driven so existing `encounterRole`, `combatRole`, and `protectsRouteId` are not wasted.
- [ ] Use intent to adjust awareness, pursuit, standoff distance, attack choice, and retreat behavior.
- [ ] Add debug snapshot fields so a playtest can report: enemy name, intent, selected ability, target reason, and current counter window.
- [ ] Add tests proving role data affects behavior without changing unrelated enemies.

## Phase 2: Enemy Family Abilities

**Purpose:** Make enemies ask different questions.

**Files:**
- Modify: `src/components/expedition-journey/journeyCombat.js`
- Modify: `src/components/expedition-journey/useJourneySimulation.js`
- Modify: `src/components/expedition-journey/useJourneyRenderer.js`
- Modify: `src/components/expedition-journey/journeyLevelData.js`
- Test: `src/components/expedition-journey/journeyCombat.test.js`
- Test: `src/components/expedition-journey/journeyEnemySprites.test.js`

- [ ] **Scarab:** make it a lane charger. Front shell deflects greedy hits, charge has strong direction commitment, Asha can dodge behind or jump-vault over selected charge windows, and back/counter hits feel rewarding.
- [ ] **Scorpion:** make it anti-air and venom control. Tail raise threatens jumpers, venom creates temporary slow zones, and the safe answer changes between dodge, wait, and punish.
- [ ] **Sand Wisp/Bat:** make it aerial harassment. It should interrupt lazy ground combos and reward jump attack or timed dodge.
- [ ] **Snake:** make it a long-lunge ambusher. It coils, commits, overshoots, and leaves a clear counter window.
- [ ] **Mummy:** make it a guarded duelist. Shielded windup punishes button mashing, but its committed sweep can be jumped or countered.
- [ ] **Guardian/Statue:** make it a heavy poise enemy. Slow slam, ground shockwave, jump-over response, large punish window after commitment.
- [ ] **Looter:** make it human and tactical. Retreat, dust throw, feint, and lure Asha toward traps or away from rewards.

## Phase 3: Asha Flow Retune

**Purpose:** Make hitting, dodging, and jumping feel better under the hand.

**Files:**
- Modify: `src/components/expedition-journey/journeyCombat.js`
- Modify: `src/components/expedition-journey/useJourneySimulation.js`
- Modify: `src/components/expedition-journey/journeyControlsReference.jsx`
- Modify: `src/components/expedition-journey/JourneyHudOverlays.jsx`
- Test: `src/components/expedition-journey/journeyCombat.test.js`
- Test: `src/components/expedition-journey/journeySecrets.test.js`

- [ ] Retune light attack startup, swing, recoil, and cooldown so `J` feels quick and decisive.
- [ ] Preserve the `J` then `K` heavy follow-up idea, but make the cue and reward clearer.
- [ ] Improve attack buffering so Asha feels responsive instead of locked out.
- [ ] Keep dodge grounded for now, but tighten recovery so a clean dodge feels like a deliberate reset, not a pause.
- [ ] Make perfect dodge feedback unmistakable: brief freeze, clear sound, enemy stagger, and immediate punish opportunity.
- [ ] Add an early jump attack: `J` while airborne becomes a forward/downward strike with landing recovery.
- [ ] Keep jump attack useful but risky. It should beat selected threats, not solve every fight.

## Phase 4: Encounter Stakes

**Purpose:** Give the player reasons to fight.

**Files:**
- Modify: `src/components/expedition-journey/journeyLevelData.js`
- Modify: `src/components/expedition-journey/useJourneySimulation.js`
- Modify: `src/components/expedition-journey/useJourneySnapshot.js`
- Test: `src/components/expedition-journey/journeySecrets.test.js`

- [ ] Categorize encounters as `teach`, `rewardGuard`, `routePressure`, `arena`, `bossPrep`, or `optionalThreat`.
- [ ] Let some enemies be safely bypassed, but attach consequences where needed: missed shard cache, enemy pursuit into next pocket, route reward stays locked, or hazard wakes up.
- [ ] Use fewer enemies with stronger identity rather than many small obstacles.
- [ ] Give key fights visible payoff: route opens, seal calms, shard cache becomes safe, nest stops spawning, bridge becomes safer, or Asha earns Endurance back.
- [ ] Add one combat arena that cannot be solved by sprinting past, but keep it short and fair.

## Phase 5: Feedback And Stress

**Purpose:** Make every important combat moment readable and satisfying.

**Files:**
- Modify: `src/components/expedition-journey/useJourneyRenderer.js`
- Modify: `src/components/expedition-journey/useJourneyDraw.js`
- Modify: `src/components/expedition-journey/JourneyHudOverlays.jsx`
- Modify: `src/App.jsx`
- Test: `src/components/expedition-journey/journeyEnemySprites.test.js`
- Test: `src/components/expedition-journey/journeyAudioSfx.test.js`

- [ ] Add family-specific windup sounds where useful.
- [ ] Add stronger hit reaction frames or draw-state choices for enemy hurt, stagger, counter, and defeated.
- [ ] Make Asha getting hit more stressful: stronger but brief screen pressure, Endurance delta, body reaction, and sound.
- [ ] Make low Endurance feel dangerous without cluttering the HUD.
- [ ] Reduce generic text notices during combat and lean on physical feedback.
- [ ] Keep color telegraphs, but pair them with body-language tells.

## Phase 6: First Vertical Slice

**Purpose:** Prove the new combat loop before spreading it.

**Recommended slice:** Egypt opening route through the Scarab Queen approach.

**Files:**
- Modify: `src/components/expedition-journey/journeyLevelData.js`
- Modify: `src/components/expedition-journey/useJourneySimulation.js`
- Modify: `src/components/expedition-journey/useJourneyRenderer.js`
- Test: `src/components/expedition-journey/journeySecrets.test.js`
- Test: `src/components/expedition-journey/journeyEnemySprites.test.js`

- [ ] Teach scarab charge: dodge behind or vault.
- [ ] Teach scorpion anti-air: do not jump blindly into raised tail.
- [ ] Teach wisp aerial pressure: jump attack or dodge through the dive.
- [ ] Teach shielded warden: wait for commitment, then punish.
- [ ] Let the scorpion nest become a short arena with a clear reason to destroy it.
- [ ] Make the Scarab Queen approach feel like the exam of those lessons.

## Phase 7: Verification Plan

Run this after each implementation slice:

- [ ] `node --test src\components\expedition-journey\journeyCombat.test.js`
- [ ] `node --test src\components\expedition-journey\journeyEnemySprites.test.js`
- [ ] `node --test src\components\expedition-journey\journeySecrets.test.js`
- [ ] `npm.cmd run build`
- [ ] Short browser playtest of the exact combat slice.

Browser playtest checklist:

- [ ] Asha's light attack feels immediate.
- [ ] Asha can dodge on purpose and recover quickly.
- [ ] Jump has at least two real combat uses.
- [ ] Each enemy family asks a different question.
- [ ] Running past enemies has understandable trade-offs.
- [ ] Getting hit creates stress without feeling unfair.
- [ ] Defeating enemies produces satisfying sound, hit-stop, reaction, and reward.
- [ ] The route feels more exciting with fewer, smarter threats.

## Implementation Order

1. Intent resolver and debug snapshot.
2. Asha flow retune.
3. Scarab and scorpion ability pass.
4. Jump attack and jump-response rules.
5. Wisp/bat and snake ability pass.
6. Encounter stakes for the opening route.
7. Feedback and audio polish.
8. Scarab Queen approach retune.
9. Browser playtest and tuning loop.

## Stop Conditions

- Stop before major sprite regeneration unless a character or enemy row is truly missing.
- Stop before changing broad route progression if the issue can be solved through encounter data.
- Stop if another active AI is editing the same combat files.
- Stop if changes would mix with unrelated Desert Entry visual WIP in a way that cannot be reviewed separately.

## Recommendation

Start with a playable opening-route vertical slice, not the entire game. The first implementation pass should make scarabs, scorpions, wisps, and the scorpion nest fun enough that the player wants to engage instead of sprint past. Once that feels good, extend the same intent system to mummies, guardians, snakes, Rome, and China.
