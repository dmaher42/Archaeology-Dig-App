# Ancient China — Section One: PNG Asset Manifest & Image-Generation Prompts

This manifest covers every PNG the Ancient China Section One needs. The level is
**already playable** on the existing engine (procedural/vector fallbacks + the China
art already on disk). Dropping the PNGs below at the listed paths upgrades the visual
layer with **no code changes** — every path here matches a path the code already loads.

## Legend
- **[EXISTS]** — already on disk and wired by the engine. A regeneration prompt is
  provided so the art can be refreshed to a consistent style if desired.
- **[NEEDS ART]** — referenced by the level / brief but not yet on disk. Drop the PNG
  at the listed path (and, for inspectable artefact props, add the one registry entry
  noted in §Wiring) to activate.

## Shared style (prepend or assume on every prompt)
> 2D side-scrolling archaeology adventure game asset. Semi-realistic painterly style,
> clean readable silhouette, consistent warm natural lighting (soft late-afternoon sun),
> muted earthy palette (loess yellow, rammed-earth ochre, bronze, jade green, ink grey).
> Historically inspired Ancient China design. No text, no labels, no UI, no watermark,
> no border, no signature. Side-on orthographic game camera (flat, eye-level, no
> perspective distortion). Render only the subject described.

> **Exclusions on every prompt:** no pyramids, no Egyptian or Roman motifs, no
> hieroglyphs, no fantasy dragons as a main subject, no anime/martial-arts-fantasy
> styling, no modern objects, no people unless specified.

---

## 1. Backgrounds & environment

### ASSET NAME: Yellow River Valley parallax pack (multi-layer)
- **FILENAME:** `china-river-valley-parallax-pack.png` (+ `china-river-valley-parallax-pack.json` atlas)
- **FOLDER PATH:** `public/assets/expedition/backgrounds/china-river-valley/`
- **TYPE:** background (multi-layer parallax atlas)
- **SIZE:** 2048×720 per layer region; atlas regions keyed: `skyLayer`, `farMountains`, `riverValley`, `watchtowerRidge`, `foregroundMist`
- **TRANSPARENCY:** sky = opaque; `farMountains`/`riverValley`/`watchtowerRidge`/`foregroundMist` = transparent PNG (alpha)
- **STATUS:** **[EXISTS]** — drives the whole China journey via `drawChinaRiverValleyBackground`.
- **GAMEPLAY PURPOSE:** the scrolling backdrop for all five sections; horizontally tiling parallax layers.
- **COLLISION / ALIGNMENT NOTES:** non-collidable. Layers must tile seamlessly left↔right. Keep the lower ~120px of `foregroundMist` light so the playable floor stays readable.
- **ANIMATION NOTES:** none (parallax scroll handled in code).
- **IMAGE GENERATION PROMPT:**
> A wide horizontally-tileable multi-layer parallax background of the Yellow River valley in ancient China. Layer 1 sky: soft hazy late-afternoon sky, pale gold to dusty blue. Layer 2 far mountains: misty layered ridgelines, faint. Layer 3 river valley: the broad Yellow River curving through terraced loess farmland, low earthen village rooftops. Layer 4 watchtower ridge: silhouetted rammed-earth wall sections and timber watchtowers on a ridge. Layer 5 foreground mist: thin drifting low mist and a few reeds. Semi-realistic painterly game-art style, warm natural light, muted earthy palette, clean readable silhouettes, seamless left-right tiling, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Distant Yellow River valley back layer
- **FILENAME:** `china-river-valley-far-valley.png`
- **FOLDER PATH:** `public/assets/expedition/backgrounds/china-river-valley/`
- **TYPE:** background (far parallax layer; optional extra depth layer)
- **SIZE:** 2048×520
- **TRANSPARENCY:** transparent (alpha above the horizon line)
- **STATUS:** **[NEEDS ART]** (optional depth upgrade; `riverValley` region already covers this)
- **GAMEPLAY PURPOSE:** extra far-depth band of river + farmland behind the midground wall.
- **COLLISION / ALIGNMENT NOTES:** non-collidable, slowest parallax, tiling.
- **ANIMATION NOTES:** none.
- **IMAGE GENERATION PROMPT:**
> A distant, hazy horizontal band of the Yellow River winding through terraced farmland and low loess hills, seen from far away in ancient China. Very soft atmospheric perspective, desaturated warm tones, painterly game background, transparent above the horizon, seamless horizontal tiling, no foreground detail, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Rammed-earth Great Wall midground section
- **FILENAME:** `china-rammed-earth-gate.png`
- **FOLDER PATH:** `public/assets/expedition/environment/`
- **TYPE:** midground structure
- **SIZE:** 1024×640
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[EXISTS]**
- **GAMEPLAY PURPOSE:** the early-wall / gate structure dressing along the `rammed-earth-wall` section.
- **COLLISION / ALIGNMENT NOTES:** decorative; the walkable collision is the engine ground platform. Base of the wall should sit on `GROUND_Y` (595).
- **ANIMATION NOTES:** none.
- **IMAGE GENERATION PROMPT (regen):**
> A section of an early Chinese frontier defensive wall built from rammed earth (packed layered loess), with a simple timber-framed gate opening, weathered and partly eroded. Side-on game view, base flat for ground placement, warm light, painterly, transparent background, no text, no UI. [+ shared style/exclusions]

### ASSET NAME: Foreground walking path / ground strip
- **FILENAME:** `china-frontier-path-strip.png`
- **FOLDER PATH:** `public/assets/expedition/environment/china-river-valley/`
- **TYPE:** foreground ground tile (horizontally tiling strip)
- **SIZE:** 512×140 (tileable)
- **TRANSPARENCY:** transparent (top edge feathered)
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** the readable walkable floor surface along the frontier path; sits on the engine ground line.
- **COLLISION / ALIGNMENT NOTES:** the collidable floor is the engine platform at `GROUND_Y`; this art aligns its top surface to that line. Must tile seamlessly horizontally.
- **ANIMATION NOTES:** none.
- **IMAGE GENERATION PROMPT:**
> A horizontally-tileable foreground ground strip: packed dry yellow loess earth path with scattered pebbles, cart-wheel ruts, sparse dry grass tufts and a few fallen leaves. Top surface flat and readable for a platformer floor, warm light, painterly game art, seamless horizontal tiling, transparent background above the surface, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Watchtower
- **FILENAME:** `china-watchtower.png`
- **FOLDER PATH:** `public/assets/expedition/environment/china-river-valley/`
- **TYPE:** midground/foreground structure prop
- **SIZE:** 512×768
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** landmark + climbable-deck dressing in the `rammed-earth-wall` section (engine ledge platforms provide the actual footing).
- **COLLISION / ALIGNMENT NOTES:** base sits on `GROUND_Y`; the platform deck art should align to the `wall-watchtower` ledge (`JY(150)`).
- **ANIMATION NOTES:** none.
- **IMAGE GENERATION PROMPT:**
> A tall ancient Chinese frontier watchtower: square rammed-earth and timber tower with an upper open guard deck and a low tiled roof, a hanging signal lantern, weathered. Side-on game view, vertical silhouette, base flat for ground placement, warm light, painterly, transparent background, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Broken wall section (route opening)
- **FILENAME:** `china-broken-wall.png`
- **FOLDER PATH:** `public/assets/expedition/environment/china-river-valley/`
- **TYPE:** foreground structure / route feature
- **SIZE:** 768×512
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** the breach the player crosses in `rammed-earth-wall` (the `wall-breach-seal` gate sits here).
- **COLLISION / ALIGNMENT NOTES:** the gap reads as walkable; rubble at base is decorative (not collidable). Align breach centre to the gate x.
- **ANIMATION NOTES:** none.
- **IMAGE GENERATION PROMPT:**
> A collapsed section of an ancient Chinese rammed-earth frontier wall: a jagged breach with crumbled earthen blocks, exposed timber tie-beams and spilled rubble at the base, abandoned construction baskets nearby. Side-on game view, readable walkable gap in the middle, warm light, painterly, transparent background, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Sealed Imperial Gate (locked)
- **FILENAME:** `china-imperial-gate-sealed.png`
- **FOLDER PATH:** `public/assets/expedition/environment/china-river-valley/`
- **TYPE:** foreground structure / route gate
- **SIZE:** 768×900
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** the climactic locked gate (`imperial-gate-seal`); blocks the route until the Qin Imperial Mandate is claimed.
- **COLLISION / ALIGNMENT NOTES:** the closed doors align to the route-gate collision band; base on `GROUND_Y`. Keep doors centred and clearly *shut*.
- **ANIMATION NOTES:** pair with the "unlocked overlay" asset (below) for the open state.
- **IMAGE GENERATION PROMPT:**
> A monumental sealed imperial Chinese gate at a frontier: massive timber double doors bound with bronze studs and a heavy bronze locking bar, flanked by rammed-earth towers and tiled eaves, two tall vertical banners (plain, no text). The doors are firmly shut. Side-on game view, imposing vertical silhouette, base flat for ground placement, warm late light, painterly, transparent background, no text, no readable characters, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Final gate unlocked overlay (open glow)
- **FILENAME:** `china-imperial-gate-unlocked-overlay.png`
- **FOLDER PATH:** `public/assets/expedition/environment/china-river-valley/`
- **TYPE:** overlay FX (drawn over the gate when opened)
- **SIZE:** 768×900
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** shows the gate open + warm light spilling through when the mandate unlocks it.
- **COLLISION / ALIGNMENT NOTES:** aligned 1:1 over the sealed-gate art; no collision.
- **ANIMATION NOTES:** optional 2–3 frame glow pulse; single frame acceptable.
- **IMAGE GENERATION PROMPT:**
> The same monumental imperial Chinese gate now standing open: both timber doors swung inward, warm golden light and faint dust spilling through the opening onto the threshold, the bronze locking bar lifted aside. Side-on game view aligned to a closed-gate sprite, transparent background, soft volumetric light, painterly, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Hidden archive room background (interior)
- **FILENAME:** `china-archive-interior.png`
- **FOLDER PATH:** `public/assets/expedition/backgrounds/china-archive/`
- **TYPE:** background (interior, single backdrop)
- **SIZE:** 2048×720
- **TRANSPARENCY:** opaque (full rectangular background)
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** the underground "treasure room" backdrop for the `hidden-archive` section.
- **COLLISION / ALIGNMENT NOTES:** non-collidable; keep the lower band darker/flatter so shelves and the floor read clearly.
- **ANIMATION NOTES:** none (optional lantern flicker handled in code).
- **IMAGE GENERATION PROMPT:**
> Interior of a hidden underground ancient Chinese archive chamber: rammed-earth and stone walls, rows of wooden shelves holding bronze ritual vessels, stacked bamboo writing slips, sealed clay jars and lacquer boxes, lit by warm bronze oil lamps casting soft pools of light, dust motes in the air, a quiet sacred mood. Side-on game interior view, warm low light, painterly, opaque background, no text, no readable characters, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Archive room foreground props sheet
- **FILENAME:** `china-archive-foreground-props.png`
- **FOLDER PATH:** `public/assets/expedition/environment/china-archive/`
- **TYPE:** foreground prop sheet (shelves, jars, lamps)
- **SIZE:** 1024×768
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** layered foreground dressing (shelf edges, hanging lamps, jar clusters) for depth in the archive.
- **COLLISION / ALIGNMENT NOTES:** decorative only; keep clear of the walkable floor band.
- **ANIMATION NOTES:** none.
- **IMAGE GENERATION PROMPT:**
> A sheet of separated foreground props for an ancient Chinese archive interior: a hanging bronze oil lamp, a cluster of sealed clay storage jars, a low wooden shelf edge with bamboo slip bundles, a woven basket, a folded silk roll. Each object isolated with clear spacing on a transparent background, side-on game view, warm light, painterly, no text, no UI, no watermark. [+ shared style/exclusions]

---

## 2. Dynasty evidence artefacts (the learning + puzzle core)

> These six artefacts are the embedded HASS content. In code they are inspectable
> story props (`CHINA_STORY_PROPS`, currently shown with neutral vector stand-ins) and
> the four dynasty cards (`CHINA_DYNASTY_TIMELINE`) in the climax puzzle. See §Wiring
> to attach the PNGs. All are **transparent, interactable artefact props.**

### ASSET NAME: Shang bronze ritual vessel
- **FILENAME:** `china-artefact-shang-bronze-vessel.png`
- **FOLDER PATH:** `public/assets/expedition/artefacts/china/`
- **TYPE:** interactable artefact (Shang evidence)
- **SIZE:** 256×256
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** Shang evidence (`wall-shang-bronze` prop + `shang` timeline card).
- **COLLISION / ALIGNMENT NOTES:** sits on the ground/ledge; bottom-centre anchored, ~64px tall on screen.
- **ANIMATION NOTES:** static; engine adds a collectible glow.
- **IMAGE GENERATION PROMPT:**
> A single ancient Chinese Shang dynasty bronze ritual vessel (a ding-style three-legged cauldron) with green-brown patina and intricate taotie cast surface patterns, slightly worn and partly buried-looking. Centered, side-on game view, transparent background, warm museum light, painterly, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Cracked oracle bone
- **FILENAME:** `china-artefact-oracle-bone.png`
- **FOLDER PATH:** `public/assets/expedition/artefacts/china/`
- **TYPE:** interactable artefact (Shang evidence)
- **SIZE:** 256×192
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** Shang early-writing evidence (`wall-oracle-bone` prop).
- **COLLISION / ALIGNMENT NOTES:** small ground pickup, bottom-centre anchored, ~40px tall on screen.
- **ANIMATION NOTES:** static + glow.
- **IMAGE GENERATION PROMPT:**
> An ancient Chinese oracle bone: a flat aged ox shoulder-blade / turtle plastron fragment, cream and tan, with fine heat cracks and faint scratched proto-Chinese pictographs (abstract marks, NOT real readable characters). Centered, side-on game view, transparent background, warm light, painterly, no legible text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Bamboo writing slips
- **FILENAME:** `china-artefact-bamboo-slips.png`
- **FOLDER PATH:** `public/assets/expedition/artefacts/china/`
- **TYPE:** interactable artefact (archive evidence)
- **SIZE:** 256×256
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** archive set-dressing + early-record evidence.
- **COLLISION / ALIGNMENT NOTES:** ground/shelf pickup, bottom-centre anchored.
- **ANIMATION NOTES:** static + glow.
- **IMAGE GENERATION PROMPT:**
> A bundle of ancient Chinese bamboo writing slips: thin vertical bamboo strips bound together with cord and partly rolled, aged honey-brown, faint inked vertical marks (abstract, not readable). Centered, side-on game view, transparent background, warm light, painterly, no legible text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Zhou philosophy scroll
- **FILENAME:** `china-artefact-zhou-scroll.png`
- **FOLDER PATH:** `public/assets/expedition/artefacts/china/`
- **TYPE:** interactable artefact (Zhou evidence)
- **SIZE:** 256×256
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** Zhou evidence (`settle-zhou-scroll` prop + `zhou` timeline card).
- **COLLISION / ALIGNMENT NOTES:** ground pickup, bottom-centre anchored.
- **ANIMATION NOTES:** static + glow.
- **IMAGE GENERATION PROMPT:**
> A partly-unrolled ancient Chinese silk scroll on wooden rollers, aged ivory silk with faint brush-ink columns (abstract marks, not readable) and a simple yin-yang-like motif, a sense of scholarly calm. Centered, side-on game view, transparent background, warm light, painterly, no legible text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Qin Ban Liang coin
- **FILENAME:** `china-artefact-qin-coin.png`
- **FOLDER PATH:** `public/assets/expedition/artefacts/china/`
- **TYPE:** interactable artefact (Qin evidence)
- **SIZE:** 192×192
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** Qin currency-unification evidence (`archive-qin-coin` prop + `qin` timeline card).
- **COLLISION / ALIGNMENT NOTES:** small pickup, centre anchored.
- **ANIMATION NOTES:** static + glow.
- **IMAGE GENERATION PROMPT:**
> A single ancient Chinese Qin dynasty Ban Liang coin: a round bronze coin with a square central hole, worn green-brown patina, plain rim (no readable inscription). Centered, side-on game view, transparent background, warm light, painterly, no legible text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Qin law tablet (standardisation)
- **FILENAME:** `china-artefact-qin-law-tablet.png`
- **FOLDER PATH:** `public/assets/expedition/artefacts/china/`
- **TYPE:** interactable artefact (Qin evidence)
- **SIZE:** 256×256
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** Qin law/writing-unification evidence (pairs with the coin).
- **COLLISION / ALIGNMENT NOTES:** ground/ledge pickup, bottom-centre anchored.
- **ANIMATION NOTES:** static + glow.
- **IMAGE GENERATION PROMPT:**
> An ancient Chinese inscribed stone/bronze law tablet from the Qin unification era: a rectangular weathered slab with rows of regular carved seal-script-like marks (abstract, not readable) and a standardised official feel, one corner chipped. Centered, side-on game view, transparent background, warm light, painterly, no legible text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Han invention set (compass / paper / porcelain)
- **FILENAME:** `china-artefact-han-inventions.png`
- **FOLDER PATH:** `public/assets/expedition/artefacts/china/`
- **TYPE:** interactable artefact (Han evidence)
- **SIZE:** 320×256
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** Han invention evidence (`archive-han-invention` prop + `han` timeline card).
- **COLLISION / ALIGNMENT NOTES:** grouped pickup, bottom-centre anchored.
- **ANIMATION NOTES:** static + glow.
- **IMAGE GENERATION PROMPT:**
> A small grouped still-life of ancient Chinese Han dynasty inventions: a south-pointing lodestone compass (a spoon on a smooth bronze plate), a single sheet of early hemp paper, and a pale blue-white porcelain bowl, arranged together. Centered, side-on game view, transparent background, warm light, painterly, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Archive chest / storage box
- **FILENAME:** `china-archive-chest.png`
- **FOLDER PATH:** `public/assets/expedition/artefacts/china/`
- **TYPE:** interactable container
- **SIZE:** 320×256
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** the archive's locked record chest (reward/clue container).
- **COLLISION / ALIGNMENT NOTES:** sits on floor, bottom-centre anchored; provide a closed look (open state can be a second frame).
- **ANIMATION NOTES:** optional 2 frames (closed/open).
- **IMAGE GENERATION PROMPT:**
> An ancient Chinese lacquered wooden archive chest bound with bronze corner fittings and a bronze clasp, deep red-black lacquer with faint cloud-scroll patterns, sitting closed and slightly dusty. Side-on game view, base flat for floor placement, transparent background, warm light, painterly, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Dynasty timeline puzzle pedestal
- **FILENAME:** `china-puzzle-pedestal.png`
- **FOLDER PATH:** `public/assets/expedition/artefacts/china/`
- **TYPE:** interactable puzzle prop
- **SIZE:** 384×320
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]**
- **GAMEPLAY PURPOSE:** the in-archive pedestal marking where the dynasty timeline is restored.
- **COLLISION / ALIGNMENT NOTES:** sits at the `archive-pedestal` ledge; bottom-centre anchored; four empty inset slots visible on top.
- **ANIMATION NOTES:** optional glow when active.
- **IMAGE GENERATION PROMPT:**
> A low ancient Chinese stone/bronze altar pedestal with four shallow square inset slots in a row across its top surface and faint carved cloud motifs on the base, weathered, a soft jade-green glow in the empty slots. Side-on game view, base flat for floor placement, transparent background, warm light, painterly, no text, no UI, no watermark. [+ shared style/exclusions]

---

## 3. Enemies & hazards

> The three combat enemy types and five guardian bosses **already exist** and are wired
> (`journeyEnemySprites.js` / `journeyBossSprites.js`). Regen prompts let you refresh
> them to a consistent style. The brief's "corrupted frontier guard" ≈ **watchtower
> sentry**; "looter" ≈ reuse the **watchtower sentry** or **clay guardian** skins.

### ASSET NAME: Watchtower sentry (corrupted frontier guard) — sprite sheet
- **FILENAME:** `china-watchtower-sentry-sprites.png` (+ `.json` atlas)
- **FOLDER PATH:** `public/assets/expedition/enemies/china/`
- **TYPE:** enemy sprite atlas
- **SIZE:** atlas; per-frame ~96×128
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[EXISTS]**
- **GAMEPLAY PURPOSE:** the standing patrol enemy in the wall/settlement/gate sections.
- **COLLISION / ALIGNMENT NOTES:** feet anchored to baseline; hitbox ~34×42.
- **ANIMATION NOTES:** frames keyed: `watchtowerSentryIdle`, `…Walk1`, `…Walk2`, `…Windup`, `…Attack`, `…Hit`, `…Defeated`.
- **IMAGE GENERATION PROMPT (regen):**
> A side-view sprite sheet of an ancient Chinese frontier wall sentry as a hollow, memory-echo guardian: lamellar-style leather-and-bronze armour, a spear, faintly translucent dusty-blue spectral edge (a "memory echo", not gore). Frames: idle, two walk poses, attack wind-up, attack, hit-react, defeated. Consistent side-on game view, transparent background, even warm light, painterly, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Clay guardian (looter / heavy) — sprite sheet
- **FILENAME:** `china-clay-guardian-enemy-sprites.png` (+ `.json`)
- **FOLDER PATH:** `public/assets/expedition/enemies/china/`
- **TYPE:** enemy sprite atlas
- **SIZE:** atlas; per-frame ~112×128
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[EXISTS]**
- **GAMEPLAY PURPOSE:** the heavier, slower "reward guardian" that protects evidence routes.
- **COLLISION / ALIGNMENT NOTES:** feet anchored; hitbox ~40×46.
- **ANIMATION NOTES:** `clayGuardianIdle/Walk1/Walk2/Intro/Windup/Slam/Pulse/Shielded/CounterWindow/Hit/Defeated`.
- **IMAGE GENERATION PROMPT (regen):**
> A side-view sprite sheet of an animated terracotta-clay guardian warrior in the style of Qin tomb figures: cracked baked-clay body, simple armour sculpting, glowing seams of warm light at the cracks. Frames: idle, two walk, intro rise, wind-up, ground slam, energy pulse, shielded stance, counter-window flash, hit, defeated. Consistent side-on game view, transparent background, warm light, painterly, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: River crab (light hazard enemy) — sprite sheet
- **FILENAME:** `china-river-crab-sprites.png` (+ `.json`)
- **FOLDER PATH:** `public/assets/expedition/enemies/china/`
- **TYPE:** enemy sprite atlas
- **SIZE:** atlas; per-frame ~80×64
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[EXISTS]**
- **GAMEPLAY PURPOSE:** low-threat early "tutorial" enemies along the riverbank.
- **COLLISION / ALIGNMENT NOTES:** ground baseline; hitbox ~34×24.
- **ANIMATION NOTES:** `riverCrabIdle/Walk1/Walk2/Windup/Attack/Hit/Defeated`.
- **IMAGE GENERATION PROMPT (regen):**
> A side-view sprite sheet of a Yellow-River mud crab creature: muddy ochre carapace, raised claw, low and wide. Frames: idle, two scuttle, claw wind-up, claw snap, hit, defeated. Consistent side-on game view, transparent background, warm light, painterly, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: China guardian bosses (5) — sprite sheets
- **FILENAMES:** `china-clay-river-guardian-sprites.png`, `china-bronze-gate-warden-sprites.png`, `china-jade-seal-guardian-sprites.png`, `china-archive-sentry-captain-sprites.png`, `china-rammed-earth-sentinel-sprites.png` (each + `.json`)
- **FOLDER PATH:** `public/assets/expedition/bosses/`
- **TYPE:** boss sprite atlases
- **SIZE:** atlas; per-frame ~160×160
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[EXISTS]**
- **GAMEPLAY PURPOSE:** the five guardian encounters; the **Archive Sentry Captain** drops the Qin Imperial Mandate that opens the gate.
- **COLLISION / ALIGNMENT NOTES:** feet anchored; arenas defined in `CHINA_MINI_BOSSES`.
- **ANIMATION NOTES:** share the clay-guardian frame key set.
- **IMAGE GENERATION PROMPT (regen, example — Archive Sentry Captain):**
> A side-view boss sprite sheet of an ancient Chinese archive guardian captain: a tall lacquer-armoured figure with a bronze mask and a long jian sword, faint amber spectral aura, commanding stance. Frames: idle, two walk, intro, wind-up, heavy strike, energy pulse, shielded, counter-window, hit, defeated. Consistent side-on game view, transparent background, warm light, painterly, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Defensive crossbow trap
- **FILENAME:** `china-crossbow-trap.png`
- **FOLDER PATH:** `public/assets/expedition/environment/china-river-valley/`
- **TYPE:** hazard prop (wall-mounted auto-firing)
- **SIZE:** 192×192
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]** (functions now via the `arrow-trap` hazard + `chinaCrossbowTrap` SFX)
- **GAMEPLAY PURPOSE:** the wall/settlement `arrow-trap` hazards.
- **COLLISION / ALIGNMENT NOTES:** mounted on wall above the path; the firing line is the engine hazard volume.
- **ANIMATION NOTES:** optional 2 frames (loaded/fired).
- **IMAGE GENERATION PROMPT:**
> An ancient Chinese wall-mounted repeating crossbow trap: a horizontal bronze-and-timber crossbow frame fixed into a rammed-earth wall, drawn taut with a bronze bolt loaded. Side-on game view, transparent background, warm light, painterly, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Falling construction debris
- **FILENAME:** `china-falling-debris.png`
- **FOLDER PATH:** `public/assets/expedition/environment/china-river-valley/`
- **TYPE:** hazard prop
- **SIZE:** 192×192
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]** (functions now via the spike/rubble hazard)
- **GAMEPLAY PURPOSE:** the falling rammed-earth debris hazards near the broken wall.
- **COLLISION / ALIGNMENT NOTES:** falling collision is the engine hazard volume; art is the visual block.
- **ANIMATION NOTES:** single block; engine animates the fall.
- **IMAGE GENERATION PROMPT:**
> A chunk of falling rammed-earth wall debris: a broken block of packed yellow loess with embedded straw and a snapped timber tie-beam, dust trailing. Isolated, side-on game view, transparent background, warm light, painterly, no text, no UI, no watermark. [+ shared style/exclusions]

---

## 4. UI & feedback

### ASSET NAME: Evidence icons for UI (dynasty set)
- **FILENAME:** `china-evidence-icons.png` (+ `.json` atlas; regions `shang`, `zhou`, `qin`, `han`, `river`)
- **FOLDER PATH:** `public/assets/expedition/ui/china/`
- **TYPE:** UI icon atlas
- **SIZE:** 128×128 per icon region
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]** (the puzzle currently uses emoji badges as stand-ins)
- **GAMEPLAY PURPOSE:** HUD/checklist + timeline-puzzle card icons for each dynasty's evidence.
- **COLLISION / ALIGNMENT NOTES:** centred, consistent padding, flat readable at 32–48px.
- **ANIMATION NOTES:** none.
- **IMAGE GENERATION PROMPT:**
> A set of five matching flat game UI icons on transparent backgrounds, each in a soft circular bronze frame, warm earthy palette, clean readable silhouettes: (1) a Shang bronze vessel, (2) a Zhou silk scroll, (3) a Qin round square-holed coin, (4) a Han compass, (5) a jade river token. Consistent icon style, even lighting, painterly-but-clean, no text, no UI chrome beyond the frame, no watermark. [+ shared style/exclusions]

### ASSET NAME: Collectible glow / interaction marker
- **FILENAME:** `china-interaction-marker.png`
- **FOLDER PATH:** `public/assets/expedition/ui/china/`
- **TYPE:** UI marker / FX
- **SIZE:** 128×128
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[NEEDS ART]** (engine draws a vector glow now)
- **GAMEPLAY PURPOSE:** the "inspect / pick up" prompt glow over interactable artefacts and evidence.
- **COLLISION / ALIGNMENT NOTES:** centred over the target; no collision.
- **ANIMATION NOTES:** optional 3-frame pulse.
- **IMAGE GENERATION PROMPT:**
> A soft circular interaction glow marker for a game: a warm jade-gold radial halo with a subtle ring of faint cloud-scroll motifs, gently luminous, fading to transparent at the edges. Centered, transparent background, no text, no UI chrome, no watermark. [+ shared style/exclusions]

### ASSET NAME: Ancient China stage character portrait
- **FILENAME:** `ancient-china-character.png`
- **FOLDER PATH:** `public/assets/expedition/stage-characters/`
- **TYPE:** UI portrait
- **SIZE:** 512×512
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[EXISTS]**
- **GAMEPLAY PURPOSE:** stage-picker header character for Ancient China.
- **IMAGE GENERATION PROMPT (regen):**
> A friendly painterly portrait of Asha the archaeologist dressed for an ancient Chinese frontier expedition: practical explorer gear with a quilted travel coat, a satchel, hood lowered. Warm light, transparent background, no text, no UI, no watermark. [+ shared style/exclusions]

### ASSET NAME: Player — China explorer variant — sprite sheet
- **FILENAME:** `china-female-archaeologist-production-spritesheet.png` (+ `.json`)
- **FOLDER PATH:** `public/assets/expedition/player/`
- **TYPE:** player sprite atlas
- **SIZE:** atlas (existing frame layout)
- **TRANSPARENCY:** transparent PNG
- **STATUS:** **[EXISTS]** (wired via `PLAYER_CHINA_HERO_SPRITE_ATLAS_JSON`)
- **GAMEPLAY PURPOSE:** Asha's playable China variant (run / jump / attack / dodge / hit).
- **IMAGE GENERATION PROMPT (regen):**
> A side-view player sprite sheet of Asha, a female archaeologist-explorer in an ancient Chinese frontier setting: practical quilted coat, satchel, a short excavation tool/blade. Full action set: idle, run cycle, jump, fall, light attack, heavy attack, dodge/roll, hit-react, defeated. Consistent side-on game view, transparent background, even warm light, painterly, no text, no UI, no watermark. [+ shared style/exclusions]

---

## 5. Wiring notes (drop-in activation)

**Already active by path (no work):** the parallax background, the three enemy atlases,
the five boss atlases, the player sprite, the environment tile pack, the excavation packs
and the stage character all load from the paths above — regenerate in place to refresh.

**To activate a dynasty artefact PNG as an inspectable prop:**
1. Drop the PNG at the listed `public/assets/expedition/artefacts/china/` path.
2. Add one entry to `src/components/expedition-journey/lostSitePropRegistry.json`, e.g.:
   ```json
   {
     "id": "china_shang_bronze_vessel",
     "displayName": "Shang Bronze Ritual Vessel",
     "category": "China Artefacts",
     "assetPath": "assets/expedition/artefacts/china/china-artefact-shang-bronze-vessel.png",
     "defaultScale": 1,
     "defaultLayer": "foreground",
     "collidable": false,
     "inspectable": true
   }
   ```
3. In `chinaJourneyData.js`, change that prop's `sprite:` value (currently a neutral
   stand-in such as `'rubbleClusterSmall'`) to the new registry `id`
   (e.g. `sprite: 'china_shang_bronze_vessel'`). The inspect text/messages stay as-is.

**UI evidence icons / interaction marker:** drop the atlas at the `ui/china/` path; the
timeline puzzle swaps its emoji badges for the icon regions, and the journey swaps its
vector glow for the marker, when present (icon keys match `CHINA_DYNASTY_TIMELINE.icon`).

**Imperial gate open state:** ship `china-imperial-gate-sealed.png` + the
`…-unlocked-overlay.png`; the route-gate renderer draws the sealed art while locked and
composites the overlay when `imperial-gate-seal` opens.
