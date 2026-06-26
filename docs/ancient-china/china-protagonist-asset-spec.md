# China protagonist — character asset spec

Spec for the **new China (Ancient China section) playable character**. A distinct character, not a reskinned Asha. Asha stays Egypt-only.

Same structure as the Rome spec ([rome-protagonist-asset-spec.md](../ancient-rome/rome-protagonist-asset-spec.md)) — the engine atlas contract is identical across all three civilisations, so the deep technical detail lives there and the essentials are restated below.

---

## 0. Locked design (2026-06-25)

- **Identity:** male field scholar / investigator — learned, observant, disciplined. *Not* a soldier.
- **Weapon:** qiang (spear) — long reach naturally fits the inherited 92 px hitbox with no lunge tricks.
- **Palette:** indigo robe + cinnabar accent + jade detail — cool/vivid on warm loess (the same contrast logic as Rome: cool character on warm backgrounds, opposite of Asha).

---

## 1. What it plugs into

The China hero atlas is already wired:

- Path constant: `PLAYER_CHINA_HERO_SPRITE_ATLAS_JSON` → `assets/expedition/player/china-female-archaeologist-production-spritesheet.json` ([journeyConstants.js:50](../../src/components/expedition-journey/journeyConstants.js))
- Version constant: `PLAYER_CHINA_HERO_SPRITE_VERSION`
- Selected automatically for the China journey via `getPlayerHeroSpriteConfig` (`characterId: 'china-female-archaeologist'`) ([journeyPlayerVisuals.js:215](../../src/components/expedition-journey/journeyPlayerVisuals.js))
- An existing China atlas already occupies this slot (the placeholder female archaeologist) and follows the same schema — use it as the **structural template** the new sheet must match.

**Naming note:** the slot says "female", but the locked character is **male**. Two options:
- **Lowest friction:** drop the new male-scholar PNG + JSON at the same path — the filename is just a slot, the engine doesn't care.
- **Clean rename** (e.g. `china-scholar`): edit the path constant in `journeyConstants.js`, the `characterId` in `getPlayerHeroSpriteConfig`, and the filenames on disk. Cosmetic only.

Deliverable = PNG sheet + JSON descriptor at the slot, then bump the version string. If missing/broken it falls back to the legacy strip rather than crashing.

---

## 2. Engine atlas contract (identical to Rome — essentials restated)

| Property | Value |
|---|---|
| Frame cell | **390 × 256 px** |
| Grid | **8 columns × 15 rows** → full sheet **3120 × 3840 px** |
| `frame.groundLineY` | **236** (feet rest here every cell) |
| `frame.facing` | **"right"** |
| `draw.height` | **130** (on-screen size) |
| `draw.sourceHeight` | **224** (constant scale divisor) |
| Background | **transparent**, clean alpha |

**The scale rule:** the engine scales by the constant `draw.sourceHeight` (224), not per-frame bounds. Draw the character at a **consistent standing height across every frame** or he pops larger during dynamic animations.

**15 required rows, exact legacy names** (the combat code looks them up by string — the finisher only fires on a row named `attack_pick_swing_sweep`; keep the names even though you're drawing a spear, not a pick):

`idle` · `walk` · `run` · `survey_walk` · `jump` · `fall` · `land` · `attack_pick_swing` · `hurt` · `interact` · `climb` · `push_pull` · `attack_pick_swing_alt` · `attack_pick_swing_sweep` · `dodge`

Frame counts and the full `draw` config block (carry it over with `integratedAttackTool: true` — the spear is painted in) are in Rome spec §2–§3. Utility rows (`survey_walk`, `interact`, `climb`, `push_pull`) can reuse `run`/`idle`/`jump`/attack-entry art as the Egypt atlas does.

---

## 3. Combat choreography — the spear advantage

The qiang is **long**, so the inherited 92 px reach is justified naturally — no committed-lunge workaround like the gladius needed. Like Asha's khopesh polearm, the spear extends across the 390-wide cell during thrusts; that's expected, `drawBounds` per frame handles it. The whole three-hit chain is honest spear work:

| Engine row | Spear action |
|---|---|
| `attack_pick_swing` (hit 1) | quick forward thrust, lead-foot step |
| `attack_pick_swing_alt` (hit 2) | horizontal sweep or butt-end spin to vary rhythm |
| `attack_pick_swing_sweep` (finisher) | **deep lunging thrust** — max body + spear extension at frames 4–5; this row carries the built-in 1.16× scale bump, so leave headroom |

Thematically the long spear lets a small scholar hold the monumental clay guardians at bay — discipline and knowledge keeping brute force at distance.

---

## 4. Concept-art generation brief (paste-ready)

> **Male field scholar of frontier Han-era China — a learned, disciplined investigator, not a soldier.** Tall and upright, agile, human-scale. Wears a **flowing indigo robe** (deep cool blue) with a **cinnabar-red sash/cord** and small **jade-green** details; layered scholar's robes, not armor. Carries a **qiang (Chinese spear)** — slender bronze leaf-blade on a lacquered shaft taller than he is, with a red tassel below the blade. The spear can read as doubling for a surveyor's pole. Warm skin, dark hair bound in a scholar's topknot. Disciplined, observant bearing. Full-body, standing on dusty warm loess-gold ground with terraced river-valley and rammed-earth wall behind.

**Silhouette must contrast all three enemy types:**
- vs scuttling low **river crabs** → he is tall and upright
- vs bronze-armored **watchtower sentries** → he is robed, *not* soldierly
- vs massive earthen **clay / terracotta guardians** → he is small, light, mobile

The **flowing robe + sash + tall spear with tassel** give motion and a silhouette unlike any enemy — and the tassel is a strong readability cue at sprite scale.

**Palette — cool/vivid on warm.** China's backgrounds are warm loess-gold, so a warm character camouflages. Test the design against these background hexes: `#d8c197` / `#e6d8b4` (river frontier), `#d8bd90` (wall), `#c8a472` (settlement), `#bcd0c4` (the cool-green Hidden Archive interior), `#d8b890` (imperial gate). The indigo gives cool separation in the warm exteriors; the cinnabar is saturated enough to punch through ochre; in the dark archive, the cinnabar accent + lantern-warm skin keep him readable.

---

## 5. Reference poses to generate

Mirror the Rome reference pack:
- **Turnaround:** front / right / back / left
- **Combat:** idle guard, forward thrust (hit 1), horizontal sweep (hit 2), deep lunging-thrust finisher, recovery
- **Movement:** walk, run, jump, fall, land, hurt, dodge
- **Weapon ref:** the qiang (blade, shaft, tassel, full length)

---

## 6. Production checklist

- [ ] PNG **3120 × 3840**, 8×15 grid of 390×256 cells, **transparent** background.
- [ ] **Facing right**, feet on **y=236**, consistent **~224 px** standing height every frame.
- [ ] All **15 rows**, exact names, frame counts per Rome spec §3.
- [ ] Spear **painted into** every frame; attack rows are thrusts/sweeps at full reach (§3).
- [ ] JSON has `frame`, `draw` (Rome §2 block, `integratedAttackTool: true`), `rows`, per-frame `regions` with recomputed `drawBounds`.
- [ ] Clean keyed alpha — no halo (check edges at 1× and 2×).
- [ ] Decide slot **rename vs reuse** (§1); keep the indigo/cinnabar **saturated**.
- [ ] Drop files at the China slot + bump `PLAYER_CHINA_HERO_SPRITE_VERSION`.
