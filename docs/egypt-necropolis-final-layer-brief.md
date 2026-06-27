# Egypt Necropolis Final Layer Brief

Use this brief for Desert Entry parallax regeneration. The files are wired into the active game manifest. Replace the PNG contents without changing the filenames or manifest keys unless the runtime contract changes.

## Runtime Contract

- Folder: `public/assets/expedition/backgrounds/desert-entry/`
- Manifest: `desert-entry-parallax-pack.json`
- Runtime mode: `layered-necropolis-playable-route`
- Style: semi-realistic, high-quality, warm sunset, believable archaeological ruin detail.
- Story: Asha is in a corrupted mirror-world version of Egypt, not normal Ancient Egypt.
- Corruption level: subtle. Use cracked gold light, disturbed dust, damaged seals, and impossible shadows. Avoid fantasy underworld skies, floating-island clutter, purple voids, and heavy supernatural palettes.

## Layer Files

### `desert-entry-egypt-true-sky-light-2026-06-27.png`

- Size: 2172 x 724.
- Background: opaque.
- Content: warm clouded sunset, sacred atmosphere, subtle haze.
- Must not contain terrain, ruins, characters, UI, or a gameplay floor.

### `desert-entry-egypt-true-far-pyramids-2026-06-27.png`

- Size: 2172 x 724.
- Background: transparent outside the distant horizon artwork.
- Content: distant pyramid silhouettes, low necropolis horizon, and warm desert haze.
- Must stay visually behind the cliffs and route.

### `desert-entry-egypt-true-distant-cliffs-2026-06-27.png`

- Size: 2172 x 724.
- Background: transparent above the cliff/ravine artwork.
- Content: Valley of the Kings cliff walls, eroded ridges, and desert-ravine depth.
- Must not create a false walkable surface at Asha's feet.

### `desert-entry-egypt-true-mid-necropolis-ruins-2026-06-27.png`

- Size: 2172 x 724.
- Background: transparent outside the ruined structures and terrain silhouettes.
- Content: Memphite Necropolis ruins, carved temple thresholds, broken columns, relief walls, and right-side destination architecture.
- Must remain non-colliding scenery behind the playable route.

### `desert-entry-egypt-true-ground-backing-2026-06-27.png`

- Size: 4096 x 220.
- Background: transparent where empty; painted terrain pixels should be solid.
- Content: non-colliding sand and stone body beneath the route.
- This layer supports the floor visually so the ground lane does not read as a floating ledge.

### `desert-entry-egypt-true-ground-lane-2026-06-27.png`

- Size: 4096 x 240.
- Background: transparent above the stone route; painted route pixels should be solid.
- Content: world-locked playable carved stone path, broken causeway slabs, shallow carved lip, and sandy edges.
- This is the visual source of truth for where Asha can run. It must not look like a distant background strip.

### `desert-entry-egypt-true-foreground-rubble-2026-06-27.png`

- Size: 4096 x 160.
- Background: transparent.
- Content: low edge rubble, broken carved stones, small warning cracks, subtle gold corruption veins.
- Must support hazards without hiding Asha, enemies, pickups, or the bridge deck.

### `desert-entry-egypt-true-foreground-depth-2026-06-27.png`

- Size: 4096 x 128.
- Background: transparent.
- Content: near dust, small foreground chips, shallow carved fragments, faint corruption flecks.
- Keep this light. It should add depth, not cover the walkable route.

## Prompt Core

Create a high-quality semi-realistic 2D side-scrolling game background for an Egyptian mirror-world necropolis, a cross between the Valley of the Kings and the Memphite Necropolis. Warm cinematic sunset colours, believable sandstone cliffs, pyramid silhouettes, mastaba ruins, broken causeway stones, cliff-cut tomb entrances, crumbling carved temple facade, archaeological realism, subtle supernatural corruption through cracked gold light and drifting dust. The scene must support side-scrolling platform gameplay with a clear readable route, ravine bridge combat, ledges for climbing toward upper tomb entrances, and no UI text or labels.

## Negative Prompt

No modern buildings, no tourists, no checkerboard matte, no text, no labels, no UI, no cartoon style, no flat vector art, no purple fantasy void, no floating islands as the main subject, no water river route, no oversized foreground objects blocking gameplay, no blurred stock-photo look, no single unreadable brown strip.

## Acceptance Check

- Asha's run path is obvious at a glance.
- The ravine bridge reads as dangerous but crossable.
- The lower ravine does not read as a walkable path.
- Ledges and upper entrances are visually believable.
- The art still feels like the older high-quality Egypt direction, not the rejected underworld set.
