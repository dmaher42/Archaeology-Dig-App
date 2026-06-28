# Background And Layer Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the Journey background/layer cleanup so Egypt, China, and Rome draw only their active background contracts, stale fallback paths are retired or quarantined, and short browser checks prove the layers read correctly in play.

**Architecture:** Keep the existing Journey canvas, `loadDesertBackgroundAssetPack(...)`, `SECTION_BACKGROUND_PACKS`, and `useJourneyRenderer(...)` draw path. Do not add a second background loader or regenerate art unless browser screenshots prove the current active PNGs cannot meet the visual goal. Treat active layer manifests as the source of truth: Egypt `desert-entry` uses the eight-layer `layered-necropolis-playable-route` pack, China `china-river-valley` uses the five-layer `layered-parallax` pack, and Rome uses one five-layer pack per Rome section.

**Tech Stack:** React, Vite, Journey canvas renderer, Node test runner, ESLint, local Vite browser checks.

---

## Audit Baseline

Completed on 2026-06-28:

- Confirmed the active repo is `C:\Users\dmahe\Documents\LocalCodex\Archaeology-Dig-App`.
- Confirmed the worktree is mixed. Preserve unrelated mummification classroom-mode WIP and Rome boss WIP.
- Confirmed the active background source of truth is `src/components/expedition-journey/journeyBackgroundAssets.js`, `src/components/expedition-journey/rome/romeBackgroundAssets.js`, the background JSON manifests in `public/assets/expedition/backgrounds/`, and the draw order in `src/components/ExpeditionJourney.jsx` plus `src/components/expedition-journey/useJourneyRenderer.js`.
- Cleaned one stale China guard: `EXPECTED_CHINA_RIVER_VALLEY_BACKGROUND_KEYS` now covers `skyLayer`, `farMountains`, `riverValley`, `watchtowerRidge`, and `foregroundMist`; `chinaProductionSection.test.mjs` now expects `layered-parallax`.
- Verified: China background tests pass, Rome production background tests pass, Desert Entry background guard tests pass, direct ESLint on the touched China files passes, and the static manifest audit reports no missing keys or files for active Egypt/China/Rome packs.

This cleanup is internal only; the China test/contract fix should not create a visible gameplay difference.

---

### Task 1: Add One Shared Background Contract Test

**Files:**
- Create: `src/components/expedition-journey/journeyBackgroundLayers.test.mjs`
- Modify if needed: `src/components/expedition-journey/journeyBackgroundAssets.js`
- Modify if needed: `src/components/expedition-journey/rome/romeBackgroundAssets.js`

- [ ] **Step 1: Add a shared manifest contract test**

Create `src/components/expedition-journey/journeyBackgroundLayers.test.mjs` with this test shape:

```js
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  EXPECTED_CHINA_RIVER_VALLEY_BACKGROUND_KEYS,
  EXPECTED_DESERT_BACKGROUND_KEYS,
  SECTION_BACKGROUND_PACKS,
} from './journeyBackgroundAssets.js';
import { ROME_SECTION_BACKGROUND_PACKS } from './rome/romeBackgroundAssets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

const readPublicJson = async (assetPath) => JSON.parse(
  await readFile(path.join(repoRoot, 'public', ...assetPath.split('/')), 'utf8'),
);

const assertPackFiles = (pack, atlas) => {
  const imageNames = new Set([
    atlas.image,
    ...Object.values(atlas.regions || {}).map(region => region.image || atlas.image),
  ].filter(Boolean));
  for (const imageName of imageNames) {
    assert.ok(
      existsSync(path.join(repoRoot, 'public', ...pack.basePath.split('/'), imageName)),
      `${pack.basePath}${imageName} exists`,
    );
  }
};

test('active Journey background packs declare every runtime layer and image file', async () => {
  const expectedBySection = {
    'desert-entry': EXPECTED_DESERT_BACKGROUND_KEYS,
    'china-river-valley': EXPECTED_CHINA_RIVER_VALLEY_BACKGROUND_KEYS,
    ...Object.fromEntries(
      Object.entries(ROME_SECTION_BACKGROUND_PACKS).map(([sectionId, pack]) => [sectionId, pack.expectedKeys]),
    ),
  };

  for (const [sectionId, expectedKeys] of Object.entries(expectedBySection)) {
    const pack = SECTION_BACKGROUND_PACKS[sectionId];
    assert.ok(pack, `${sectionId} pack is registered`);
    const atlas = await readPublicJson(pack.atlasPath);
    for (const key of expectedKeys) {
      const region = atlas.regions?.[key];
      assert.ok(region, `${sectionId}:${key} is declared`);
      assert.ok(region.w > 0 && region.h > 0, `${sectionId}:${key} has drawable size`);
    }
    assertPackFiles(pack, atlas);
  }
});
```

- [ ] **Step 2: Run the new test**

Run: `node --test src/components/expedition-journey/journeyBackgroundLayers.test.mjs`

Expected: PASS. If it fails, fix the expected key list or the manifest path that is out of sync with the active renderer.

- [ ] **Step 3: Keep the older focused guards**

Run: `node --test src/components/expedition-journey/journeyChinaBackground.test.js src/components/expedition-journey/chinaProductionSection.test.mjs src/components/expedition-journey/rome/romeProductionSection.test.mjs`

Expected: PASS.

### Task 2: Retire Dead Desert Entry Branches

**Files:**
- Modify: `src/components/ExpeditionJourney.jsx`
- Modify: `src/components/expedition-journey/useJourneyRenderer.js`
- Modify: `src/components/expedition-journey/journeySecrets.test.js`
- Leave in place unless clearly unused: `src/components/expedition-journey/journeyDesertBackgroundPanels.js`

- [ ] **Step 1: Add a source guard for the active route**

Add or extend a focused test in `journeySecrets.test.js` so it protects these facts:

```js
test('Desert Entry background renderer uses the active layered route only', () => {
  assert.match(journeyBackgroundAssetsSource, /DESERT_BACKGROUND_DEPTH_MODE = 'desert-entry-necropolis-layered-playable-route-v1'/);
  assert.match(journeyComponentSource, /drawDesertEntryBackground\(ctx, section, cameraX\)/);
  assert.match(journeyComponentSource, /drawDesertEntryGroundLane\(ctx, section, cameraX\)/);
  assert.doesNotMatch(journeyComponentSource, /cleanDesertEntryPanoramaActive\s*=\s*true/);
  assert.doesNotMatch(journeyComponentSource, /full-canvas-route-crossfade-background-v1/);
});
```

- [ ] **Step 2: Remove or quarantine unreachable flags**

Inspect and simplify only the branches that are now unreachable because the active `desert-entry` pack draws first:

```text
DESERT_ENTRY_RESTORE_ORIGINAL_BACKDROP
cleanDesertEntryPanoramaActive
DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_IDS
DESERT_ENTRY_PRIMARY_BACKGROUND_PLATE_SEAM_MASKS
isDesertEntryRebuildBackgroundPlateProp
```

Expected result: active drawing still follows `drawDesertEntryBackground(...)`, then `drawDesertEntryGroundLane(...)`, then Journey props/actors/foreground occluders.

- [ ] **Step 3: Keep archived panel metadata clearly archived**

If `journeyDesertBackgroundPanels.js` remains, keep its `DESERT_ENTRY_PROCEDURAL_PANEL_FALLBACK_ENABLED = false` guard and its archived version name. Do not delete it in the same pass unless tests prove no import depends on it.

- [ ] **Step 4: Run focused Desert Entry tests**

Run:

```text
node --test --test-name-pattern "Desert Entry old active panorama|desert entry ground uses the painted background route|desert entry foreground depth pack stays transparent|Desert Entry background renderer uses the active layered route" src/components/expedition-journey/journeySecrets.test.js
node --test src/components/expedition-journey/journeyDesertBackgroundPanels.test.mjs
```

Expected: PASS.

### Task 3: Browser Visual Verification

**Files:**
- No source change unless screenshots show a real bug.
- Optional note update: `progress.md`

- [ ] **Step 1: Start the local app**

Run: `npm.cmd run dev -- --host 127.0.0.1 --port 5173`

Expected: local Vite server opens on port 5173. Stop only this server when done.

- [ ] **Step 2: Check Egypt Desert Entry**

Open: `http://127.0.0.1:5173/Archaeology-Dig-App/?play=exterior&clearJourneyEditorDraft=1`

Confirm:

- The first playable Egypt exterior uses the warm necropolis background, not an older panorama.
- Asha's feet sit on the stone/sand route lane.
- The route does not read as a pasted bottom strip.
- The ravine/ground backing does not rise into Asha's feet.

- [ ] **Step 3: Check Ancient China**

Open the app, choose Lost Site Expedition, then choose Ancient China from the stage cards.

Confirm:

- The first playable China screen shows the river-valley/wall/watchtower scene.
- No Egypt sky, desert, sphinx, pyramids, or temple art appears while assets load.
- Foreground mist does not expose checkerboard or transparent blank bands.

- [ ] **Step 4: Check Ancient Rome**

Open the app, choose Lost Site Expedition, then choose Ancient Rome from the stage cards.

Confirm:

- Via Sacra starts with Rome street/ruins depth layers.
- The foreground dust layer does not cover the player or flatten the road.
- Forum/thermae/basilica/vault packs remain file-valid through the shared background loader.

### Task 4: Asset Folder Cleanup Decision

**Files:**
- Read only first: `public/assets/expedition/backgrounds/`
- Optional delete only after explicit owner approval: retired PNGs/folders

- [ ] **Step 1: Produce an unused-background list**

Run a read-only scan that compares background PNG files against active JSON manifests and active source references.

Expected candidate folders to review, not auto-delete:

```text
public/assets/expedition/backgrounds/desert-entry-opening-rebuild/
old non-manifest PNGs inside public/assets/expedition/backgrounds/desert-entry/
old China composite or rejected checkerboard pack PNGs if no source still references them
```

- [ ] **Step 2: Ask before deleting assets**

Do not delete retired images in this implementation pass unless the owner explicitly approves the deletion list. A safer first pass is to document them as archived or unused.

### Task 5: Final Verification And Report

**Files:**
- Modify: `progress.md` only if source/runtime cleanup was completed.

- [ ] **Step 1: Run focused checks**

Run:

```text
node --test src/components/expedition-journey/journeyBackgroundLayers.test.mjs
node --test src/components/expedition-journey/journeyChinaBackground.test.js src/components/expedition-journey/chinaProductionSection.test.mjs
node --test src/components/expedition-journey/rome/romeProductionSection.test.mjs
node --test --test-name-pattern "Desert Entry old active panorama|desert entry ground uses the painted background route|desert entry foreground depth pack stays transparent|Desert Entry background renderer uses the active layered route" src/components/expedition-journey/journeySecrets.test.js
```

Expected: PASS.

- [ ] **Step 2: Run direct lint on touched files**

Run: `.\node_modules\.bin\eslint.cmd <changed-files>`

Expected: PASS. Avoid `npm.cmd run lint -- <files>` in this repo because the script includes `eslint .` and can start a broad lint run.

- [ ] **Step 3: Run production build if runtime files changed**

Run: `npm.cmd run build`

Expected: PASS, allowing only known bundle-size/runtime-resolved image warnings.

- [ ] **Step 4: Report plainly**

Tell the owner:

- What is confirmed.
- What is unclear.
- What changed.
- Why it changed there.
- What was tested.
- Whether the result is visible or internal only.
- Where to play next: Egypt `?play=exterior`, Ancient China stage, and Ancient Rome stage.
- Whether the result is local, committed, pushed, or live.
- Whether unrelated AI/WIP was included.
