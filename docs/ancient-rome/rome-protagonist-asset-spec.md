# Rome protagonist — character asset spec

Spec for the **new Rome (Act 2) playable character**. This is a distinct character, not a reskinned Asha. Asha stays Egypt-only.

This document is the contract for the art deliverable: it tells the art tool exactly what to draw, at what dimensions, in what layout, so the finished sheet drops into the engine with no code surgery beyond bumping a version string.

---

## 0. Open inputs (your call before art starts)

- **Name & gender** of the Rome protagonist — pose directions below are written gender-neutrally; pick before generating faces/body.
- **Keep the existing file slot or rename?** Lowest-risk path keeps the current slot (see §6). A rename is 3 trivial line edits, listed in §6.

Everything else below is fixed by the engine or recommended by the design brief.

---

## 1. What it plugs into

The Rome hero atlas is already wired. The engine loads it here:

- Path constant: `PLAYER_ROME_HERO_SPRITE_ATLAS_JSON` → `assets/expedition/player/asha-rome-variant-spritesheet.json` ([romeConstants.js:11](../../src/components/expedition-journey/rome/romeConstants.js))
- Version constant: `PLAYER_ROME_HERO_SPRITE_VERSION` ([romeConstants.js:12](../../src/components/expedition-journey/rome/romeConstants.js))
- Selected automatically for the Rome journey via `getPlayerHeroSpriteConfig` (`characterId: 'asha-rome'`) ([journeyPlayerVisuals.js:203](../../src/components/expedition-journey/journeyPlayerVisuals.js))
- If the atlas is missing/broken, it falls back to the Egypt Asha atlas — so a half-finished sheet won't crash, it'll just show Asha.

**Deliverable = two files at the path above:** one PNG sprite sheet + one JSON descriptor. Then bump the version string. That's the whole integration.

---

## 2. Canvas & atlas technical contract (must match exactly)

The runtime reads a fixed schema. These numbers are **not** style choices — they come from the live Egypt atlas the engine already drives, and the Rome sheet must mirror them so scale, ground contact, and animation timing line up.

| Property | Value | Meaning |
|---|---|---|
| Frame cell size | **390 × 256 px** | every animation frame occupies one 390-wide, 256-tall cell |
| Grid layout | **8 columns × 15 rows** | one row per animation (see §3); frames left-to-right |
| Full sheet size | **3120 × 3840 px** | 8×390 wide, 15×256 tall |
| `frame.groundLineY` | **236** | the character's feet must rest on y=236 inside every cell |
| `frame.facing` | **"right"** | draw facing right; engine mirrors for left |
| `draw.height` | **130** | on-screen draw height in world px (keeps Rome the same size as Asha) |
| `draw.sourceHeight` | **224** | scale divisor — the standing pixel height of the character in-cell |
| Background | **transparent** | clean alpha, no halo (see §7 keying note) |

### The scale rule that bites if you ignore it
The engine scales the sprite by the **constant** `draw.sourceHeight` (224), *not* by each frame's bounding box. So the character must be drawn at a **consistent standing height across every frame** — roughly 224 px tall, feet at y=236. If one frame draws the body bigger, it will pop larger on screen during that animation. Crouches, lunges, and dodges legitimately change the bounding box (that's fine — `drawBounds` per frame handles horizontal centering), but the character's *scale* must stay constant.

### `draw` config block — carry these over verbatim
```jsonc
"draw": {
  "height": 130,
  "sourceHeight": 224,            // set to the actual standing height if you draw taller/shorter
  "integratedAttackTool": true,  // the gladius is painted INTO the frames (see §5)
  "suppressExternalWeapon": true,
  "suppressExternalWeaponDuringAttack": true,
  "suppressRuntimeAttackArc": true,
  "imageSmoothingQuality": "high",
  "frameDistance": { "run": 26, "walk": 24, "survey_walk": 34 },
  "rowScaleMultipliers": { "walk": 0.965, "run": 0.965, "survey_walk": 0.965, "attack_pick_swing_sweep": 1.16 },
  "frameScaleMultipliers": {},
  "fixedFrame": {},
  "attackChainRows": ["attack_pick_swing", "attack_pick_swing_alt", "attack_pick_swing_sweep"],
  "alternateAttackRows": ["attack_pick_swing", "attack_pick_swing_alt", "attack_pick_swing_sweep"]
}
```

### Per-frame `regions` + `drawBounds`
Every frame key needs a `regions` entry: its `x`/`y`/`w`/`h` in the sheet (the cell), plus a `drawBounds` (the tight box around the visible character inside that cell) and `groundLineY: 236`. **Recompute `drawBounds` from the actual Rome art** — do not copy Asha's values; the silhouette differs. Most sprite-packers emit this automatically.

---

## 3. Required animation rows

Keep the **exact row names** below — the runtime looks them up by string (e.g. the finisher logic only fires on a row literally named `attack_pick_swing_sweep`). The names are legacy ("pick_swing" dates to the khopesh) but renaming them breaks combat. Draw a gladius; keep the row names.

| Row name | Frames | Loop | What it depicts for Rome |
|---|---|---|---|
| `idle` | 8 | yes | standing guard, gladius low, subtle breathing |
| `walk` | 8 | yes | measured advance |
| `run` | 8 | yes | controlled run, cloak trailing |
| `survey_walk` | 8 | yes | cautious investigator creep (can reuse `run` art initially) |
| `jump` | 8 | no | takeoff → rise |
| `fall` | 8 | no | descent |
| `land` | 8 | no | impact recovery |
| `attack_pick_swing` | 8 | no | **hit 1** — short gladius thrust + forward step |
| `hurt` | 5 | no | stagger from damage |
| `interact` | 6 | no | reach/examine (can reuse `idle` art initially) |
| `climb` | 8 | no | ledge climb (can reuse `jump` art initially) |
| `push_pull` | 8 | no | brace and shove (can reuse attack entry art initially) |
| `attack_pick_swing_alt` | 8 | no | **hit 2** — cross / backhand cut |
| `attack_pick_swing_sweep` | 8 | no | **hit 3 / finisher** — committed lunging thrust |
| `dodge` | 8 | no | quick lateral/back step, low braced recovery |

### Staging the work (if you can't draw all 15 at once)
- **Essential first (11 rows):** idle, walk, run, jump, fall, land, hurt, dodge, and the three attack rows. These are what the player sees constantly.
- **Utility second (4 rows):** survey_walk, interact, climb, push_pull. The Egypt atlas literally reused other rows for these (survey_walk←run, interact←idle, climb←jump, push_pull←attack entry). You can ship the same way and upgrade later.

---

## 4. Combat-frame choreography (so the reach reads true)

The character inherits Asha's **92 px attack reach** ([journeyCombat.js:39](../../src/components/expedition-journey/journeyCombat.js)). The gladius is a *short* sword, so the reach must be sold by **arm + blade extension in the swing frames**, or the strike looks like it's hitting air. This is the single most important art instruction for Rome.

The engine slices each attack row into windup → swing → recoil:
- **Frame 0** = windup (coil back, plant the lead foot)
- **Middle frames** = swing (the strike — this is where the arm extends to full reach)
- **Last frame(s)** = recoil (recover to guard)

Choreograph each hit as a **forward lunge, not a sweep** — the Roman legion thrust, distinct from Asha's arcing khopesh:
- `attack_pick_swing` (hit 1): quick jab. Lead foot steps in on frames 2–4; blade reaches max extension ~frame 4.
- `attack_pick_swing_alt` (hit 2): backhand cross-cut to vary the rhythm; still forward-biased.
- `attack_pick_swing_sweep` (hit 3, finisher): the big one. The engine renders this row specially — frames 0–1 are windup, frames 2–5 the extension, frames 6–7 recovery. Draw a **deep committed lunge**: maximum body + blade extension at frames 4–5 to justify the 92 px reach. This row also gets a **1.16× scale bump** (already in the `draw` config) so the finisher reads as heavier — account for that so it doesn't clip the top of the cell.

Because `integratedAttackTool: true`, the gladius is painted into the body frames; the engine does **not** composite a separate weapon or draw a swing arc on top. What you draw is what shows.

---

## 4a. Reference sheet → atlas mapping

A locked character reference pack exists (turnaround F/R/B/L + details + action poses + weapon ref, 2026-06-25). Map its poses to engine rows as follows:

| Engine row | Reference pose | Note |
|---|---|---|
| `idle` | Idle guard | gladius low, breathing |
| `attack_pick_swing` (hit 1) | Step slash | forward step on the entry |
| `attack_pick_swing_alt` (hit 2) | Horizontal cut | rhythm variation |
| `attack_pick_swing_sweep` (finisher) | **Thrust** | the deep lunge — full forward extension to match the 92 px hitbox |
| recoil / return-to-guard | Recovery | tail frames of each attack |

**Finisher = Thrust, not Overhead.** The hitbox is a flat 92 px *forward* reach. The thrust extends body + blade straight forward so the pose lands where the damage is; an overhead strikes vertically and won't sell horizontal reach. Keep Overhead strike as optional flair / a future heavy-attack variant.

### Movement reference still to draw (the gap)
The reference pack covers idle + the full attack chain but **no locomotion**. These seven essential rows have no reference pose yet — generate them next, same character/style/facing:

`walk` · `run` · `jump` · `fall` · `land` · `hurt` · `dodge`

(`survey_walk`, `interact`, `climb`, `push_pull` can reuse `run`/`idle`/`jump`/attack-entry art as the Egypt atlas does, so they need no dedicated reference.)

### Sprite-pass consistency note
Use the **calm turnaround** as the canonical body proportions. AI action poses tend to bulk the figure up; because the engine scales by the constant `draw.sourceHeight` (224), the body must stay the *same size* across every frame or it pops during dynamic animations. Expect the fine gold filigree to read as texture, not shape, at 224 px — make sure the big blocks (purple mantle / cream tunic / dark skirt / steel greaves / blade) carry the read.

---

## 5. Weapon: the gladius

**Canonical blade = the broad gladius/spatha.** The thin estoc/rapier blade from early weapon refs is rejected — centuries too late and a weaker silhouette. A produced gladius weapon atlas already exists (`gladius-weapon-pack.json`, regions `gladiusIdle/Windup/Swing/Ready`) — use it as the **blade-design reference** (shape, length, bronze tone) so the painted-in gladius matches across the game. The Rome hero atlas is **integrated-tool** (blade painted into each frame), matching how Egypt's Asha works, which is the proven runtime path.

> Open technical question to confirm against the draw code before final integration: whether Rome is intended to composite the external gladius pack at runtime instead of painting it in. The safe default that's known to work is integrated (this spec). If you want runtime compositing instead, flag it and I'll verify the draw path first.

---

## 6. Art direction (the look)

Condensed from the character brief. Full rationale lives in the design discussion; this is the build-facing summary.

**Identity.** A Roman investigator with official standing — state authority picking through the ruins of its own empire. Reads as deliberate, disciplined, *not* a scrappy tomb-robber. The Act 2 plot is the buried senatorial archive and Rome's reach into Egypt, so the character should feel like they belong to Rome's bureaucratic-military machine.

**Silhouette (must NOT blend into the enemy roster).** Rome's enemies are pale ghostly legionnaires, bronze-armored gladiator revenants, huge pale marble golems, and a 228 px armored shield-bearing boss. So the hero is **leaner, mobile, cloaked, distinctly human** — not heavily armored, not stone, not ghostly. A **cloak/cape** gives a silhouette none of the enemies own and is the strongest single readability move at sprite scale.

**Palette — cool on warm (the opposite of Asha).** Rome's backgrounds are warm, dusty ochre ruins, so a warm character would camouflage. Signature:
- **Imperial / Tyrian purple** — primary accent (cloak or sash). The Roman status color, ties to the senatorial-archive plot, and cool enough to pop against ochre.
- **Iron / steel grey** — armor pieces, base value anchor.
- **Pale linen tunic** — keeps the character readable in the dark Thermae and ash-Vault sections where a fully dark figure would vanish.
- **Bronze trim** — small warm metallic accents to tie into the world without losing separation.

Background hexes to test against: warm ochre `#d4c9b8` / `#e8dcc8` (Sections 1–2, 4), dark `#2e3030` (Thermae), cool green-grey `#d4e8d4` (Vault). The purple+steel signature must read against all of them; the pale tunic is the insurance for the dark sections.

---

## 7. Production checklist & gotchas

- [ ] PNG sheet at **3120 × 3840**, 8 cols × 15 rows, 390×256 cells, **transparent background**.
- [ ] Character drawn **facing right**, feet on **y=236** in every cell, consistent **~224 px standing height**.
- [ ] All **15 rows** present with the **exact names** and frame counts in §3 (or the essential 11 with utility rows reusing others).
- [ ] Gladius **painted into** every frame; attack rows choreographed as **forward lunges** with full extension in the swing frames (§4).
- [ ] JSON includes `frame`, `draw` (§2 block verbatim), `rows`, and per-frame `regions` with recomputed `drawBounds`.
- [ ] **Keying:** export with a clean alpha edge — no white/colored halo. (Project has a history of white-fringe artifacts on exported sprites; check edges at 1× and 2× zoom.)
- [ ] Drop both files at `assets/expedition/player/asha-rome-variant-spritesheet.json` (+ matching `.png`).
- [ ] Bump `PLAYER_ROME_HERO_SPRITE_VERSION` in `romeConstants.js` to a new dated string so the cache busts.

### Optional rename to a non-Asha name (e.g. `rome-investigator`)
If you want the files and id to stop saying "asha-rome", edit three spots:
1. `PLAYER_ROME_HERO_SPRITE_ATLAS_JSON` path in `romeConstants.js`
2. `characterId: 'asha-rome'` in `getPlayerHeroSpriteConfig` ([journeyPlayerVisuals.js:206](../../src/components/expedition-journey/journeyPlayerVisuals.js))
3. The actual filenames on disk

Purely cosmetic — the engine doesn't care about the name, only that the path constant and the file agree.
