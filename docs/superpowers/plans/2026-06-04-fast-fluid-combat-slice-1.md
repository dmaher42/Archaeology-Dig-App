# Fast Fluid Combat Slice 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first combat-feel slice: grounded dodge, dodge-cancel, real combo timing/reset, multi-target finisher payoff, and stronger combat SFX.

**Architecture:** Extend the current Journey combat loop in `ExpeditionJourney.jsx` and keep helper contracts in `journeyUtils.js`. Add focused source/runtime tests to lock the behaviour before production edits. Do not create a new combat system.

**Tech Stack:** React 19, Vite, canvas Journey runtime, Node test runner, existing Expedition SFX registry.

---

## Files

- Modify: `src/components/ExpeditionJourney.jsx`
  - Add dodge constants/state handling.
  - Add combo timing/reset/preserve state.
  - Add finisher damage, knockback, refund, and SFX integration.
  - Add keyboard binding for dodge.
- Modify: `src/components/expedition-journey/journeyUtils.js`
  - Add initial state fields for dodge/combo.
  - Add small exported pure helpers if needed for testable combo/dodge state decisions.
- Modify: `src/App.jsx`
  - Add distinct SFX entries for dodge, combo attacks, finisher, missed swing, and finisher hit.
- Modify: `src/components/expedition-journey/journeySecrets.test.js`
  - Add source-level contract tests for dodge and combo integration.
- Add or modify: focused helper tests only if helper functions are added to `journeyUtils.js`.

## Task 1: Lock Slice 1 Source Contracts

- [ ] **Step 1: Add failing tests**

Add tests to `src/components/expedition-journey/journeySecrets.test.js` that assert:

- dodge constants exist
- dodge can interrupt attack windup/swing/recoil
- dodge before a landed hit resets combo
- dodge after a landed hit preserves combo
- combo timeout/miss/block/player-hit resets combo
- finisher uses a multi-target damage path and extra knockback
- finisher plays a dedicated SFX
- App defines dodge and finisher SFX

- [ ] **Step 2: Run failing test**

Run:

```powershell
node --test src\components\expedition-journey\journeySecrets.test.js
```

Expected: FAIL because Slice 1 constants and paths do not exist yet.

## Task 2: Add Combat State Fields And Helpers

- [ ] **Step 1: Add minimal state fields**

In `makeInitialJourneyState` or the existing initial state factory inside `journeyUtils.js`, add:

- `attackComboWindowTimer`
- `attackComboLanded`
- `attackComboPreserved`
- `attackComboStep`
- `dodgeTimer`
- `dodgeInvulnerableTimer`
- `dodgeRecoveryTimer`
- `dodgeDirection`
- `lastDodgeResult`

- [ ] **Step 2: Add pure helper functions if useful**

Add small helpers only if they reduce repeated component logic:

- `shouldPreserveComboAfterDodge(current)`
- `getNextComboStep(current)`
- `shouldResetComboForResult(result)`

- [ ] **Step 3: Run focused tests**

Run:

```powershell
node --test src\components\expedition-journey\journeySecrets.test.js
```

Expected: tests still fail on missing component integration, but helper import errors must be absent.

## Task 3: Implement Grounded Directional Dodge

- [ ] **Step 1: Add dodge constants in `ExpeditionJourney.jsx`**

Add constants near existing combat constants:

- `PLAYER_DODGE_STAMINA_COST`
- `PLAYER_DODGE_SPEED`
- `PLAYER_DODGE_DURATION`
- `PLAYER_DODGE_INVULNERABLE_DURATION`
- `PLAYER_DODGE_RECOVERY_DURATION`

- [ ] **Step 2: Add `queueDodge` callback**

Rules:

- blocked during briefing, failure, completion, cinematic locks, opening reveal locks, hit feedback, knockback, or if not on ground
- direction follows held movement input; no held direction dodges backward from facing
- fixed Endurance/stamina cost
- can interrupt attack windup, swing, and recoil
- if no attack hit landed, reset combo
- if attack hit landed, preserve combo window briefly
- clear active attack hitbox when dodge starts

- [ ] **Step 3: Update the step loop**

Rules:

- apply dodge velocity during dodge timer
- apply invulnerability during dodge invulnerability timer
- tick dodge timers down
- prevent normal horizontal input from overriding dodge movement until the dodge impulse is over

- [ ] **Step 4: Bind a key**

Use a low-conflict starting key such as `ShiftLeft`, `ShiftRight`, or `KeyL`, while keeping current `J`/`K` attack bindings.

## Task 4: Implement Real Flow Combo

- [ ] **Step 1: Add combo constants**

Add:

- `PLAYER_COMBO_WINDOW_DURATION`
- `PLAYER_COMBO_PRESERVE_AFTER_DODGE_DURATION`
- `PLAYER_COMBO_MAX_STEP = 3`
- `PLAYER_ATTACK_FINISHER_DAMAGE`

- [ ] **Step 2: Update attack queueing**

Rules:

- next attack advances only if combo window is active and previous hit landed
- otherwise reset to step 1
- step 3 uses existing `attack_pick_swing_sweep` row
- combo timeout resets to step 0/ready

- [ ] **Step 3: Update attack result handling**

Rules:

- on enemy hit: mark combo landed and open combo window
- on miss: reset combo and apply missed stamina penalty
- on protected hit/block/shell deflect: reset combo
- on player hit: reset combo
- after finisher: reset combo after result is resolved

## Task 5: Implement Flow Finisher Payoff

- [ ] **Step 1: Apply finisher damage**

Rules:

- step 1 and 2 deal normal damage
- step 3 deals larger damage
- all enemies hit by finisher receive knockback
- heavy/guarded enemies receive reduced knockback unless vulnerable

- [ ] **Step 2: Add Endurance refund**

Rules:

- finisher costs extra stamina up front
- refund some stamina if it hits
- refund more if multiple enemies are hit
- refund extra if an enemy is defeated

- [ ] **Step 3: Add feedback**

Rules:

- stronger hit-stop
- stronger camera punch
- finisher-specific combat effect
- finisher-specific SFX

## Task 6: Add SFX Registry Entries

- [ ] **Step 1: Add entries in `App.jsx`**

Add SFX keys:

- `dodgeStep`
- `attackSwing1`
- `attackSwing2`
- `attackFinisher`
- `attackMiss`
- `finisherHit`

Reuse existing generated and Kenney clips plus synth layers. Do not add new asset files in Slice 1.

- [ ] **Step 2: Route calls from Journey**

Use attack step to choose `attackSwing1`, `attackSwing2`, or `attackFinisher`. Play `attackMiss` on whiff and `finisherHit` on successful finisher impact.

## Task 7: Verify

- [ ] **Step 1: Run focused tests**

```powershell
node --test src\components\expedition-journey\journeySecrets.test.js
```

- [ ] **Step 2: Run enemy sprite/combat source tests**

```powershell
node --test src\components\expedition-journey\journeyEnemySprites.test.js
```

- [ ] **Step 3: Run collision tuning tests**

```powershell
node --test scripts\journeyCollisionTuning.test.mjs
```

- [ ] **Step 4: Run lint/build**

```powershell
npm.cmd run lint
npm.cmd run build
```

- [ ] **Step 5: Browser smoke check**

Start the dev server only for verification, run a short Journey combat check, then stop it.

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

## Stop Conditions

- If existing dirty Journey/editor work conflicts with combat sections, stop and report the conflict.
- If focused tests reveal unrelated current WIP failures, record them and continue only with narrower tests.
- If dodge feels impossible to validate without browser input, finish automated tests first, then browser-smoke only the movement/combat path.
