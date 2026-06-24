# Asha Ground Plane Visual Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Asha and enemies feel grounded inside the Desert Entry panorama instead of standing on a pasted-on bottom strip.

**Architecture:** Keep the existing Journey canvas, panorama, collision data, and prop/editor systems. Add a focused Desert Entry visual ground-plane layer that shifts ground-level characters and enemies onto the painted plaza, replaces the flat bottom causeway strip with perspective-aware contact rendering, and adds motion cues near Asha's feet. This is a visual/rendering integration pass first; gameplay collision remains on the existing canonical Journey platform data unless follow-up testing proves physics needs a broader ground-plane migration.

**Tech Stack:** React, Vite, Journey canvas renderer, Node test runner.

---

### Task 1: Protect The Approved Ground-Plane Contract

**Files:**
- Modify: `src/components/expedition-journey/journeySecrets.test.js`
- Modify: `src/components/expedition-journey/useJourneyRenderer.js`
- Modify: `src/components/ExpeditionJourney.jsx`

- [ ] **Step 1: Add a failing source-contract test**

Add a focused test that requires the Desert Entry renderer to expose shared visual ground-plane helpers, entity offset use for Asha and enemies, and a perspective ground mode:

```js
test('desert entry uses a shared visual ground plane for Asha and enemies', () => {
  assert.match(journeyComponentSource, /getDesertEntryVisualGroundOffsetY/);
  assert.match(journeyComponentSource, /getGroundPlaneEntityRenderY/);
  assert.match(journeyComponentSource, /playerGroundPlaneRenderY/);
  assert.match(journeyComponentSource, /enemyGroundPlaneRenderY/);
  assert.match(useJourneyRendererSource, /desertEntryCausewayVisualMode\s*=\s*'perspective-plaza-ground-plane-v1'/);
  assert.match(useJourneyRendererSource, /drawDesertEntryGroundMotionCuesFrame/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test src/components/expedition-journey/journeySecrets.test.js --test-name-pattern "desert entry uses a shared visual ground plane"`

Expected: FAIL because the helpers and new render mode do not exist yet.

- [ ] **Step 3: Add the minimal implementation**

Add shared render helpers in `ExpeditionJourney.jsx`, use them when drawing Asha, enemies, and bosses, and add a renderer helper in `useJourneyRenderer.js` for the integrated plaza ground plane.

- [ ] **Step 4: Run the focused test again**

Run: `node --test src/components/expedition-journey/journeySecrets.test.js --test-name-pattern "desert entry uses a shared visual ground plane"`

Expected: PASS.

### Task 2: Integrate The Desert Entry Plaza

**Files:**
- Modify: `src/components/expedition-journey/useJourneyRenderer.js`
- Modify: `src/components/ExpeditionJourney.jsx`

- [ ] **Step 1: Replace the flat strip read**

Change the Desert Entry ground platform renderer so it draws a soft perspective trapezoid/contact layer, not a hard full-width bottom strip.

- [ ] **Step 2: Keep speed readable**

Add low-opacity moving chips, dust, and contact streaks near Asha only when she is moving on the Desert Entry ground plane.

- [ ] **Step 3: Keep enemies with Asha**

Apply the same render offset to regular enemies, scorpion nests, and mini-bosses when their feet are on the Desert Entry ground line.

- [ ] **Step 4: Avoid new background generation unless needed**

Use the existing panorama first. Generate or replace art only if browser screenshots show the existing plaza cannot support the integrated render plane.

### Task 3: Verify In Game

**Files:**
- Modify: `progress.md`

- [ ] **Step 1: Run focused source test**

Run: `node --test src/components/expedition-journey/journeySecrets.test.js --test-name-pattern "desert entry uses a shared visual ground plane"`

Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `npm.cmd run build`

Expected: PASS, allowing only existing non-fatal Vite size warnings.

- [ ] **Step 3: Run a short local browser check**

Open the Journey route locally, jump to Desert Entry if needed, and capture screenshots with Asha standing and running. Confirm:

- Asha's feet sit on the painted plaza, not the bottom strip.
- Enemies are visually on the same ground level as Asha.
- Running has readable motion through dust/chips/near-ground streaks.
- No new browser console error appears.

- [ ] **Step 4: Update progress notes**

Append a short entry to `progress.md` describing what changed, what was verified, and what remains for play-test review.
