# Egypt Necropolis Final Layer Brief

Use this brief for the final Desert Entry background generation pass. The files already exist as seeded placeholders and are wired into the active game manifest. Replace the PNG contents without changing the filenames or manifest keys unless the runtime contract changes.

## Runtime Contract

- Folder: `public/assets/expedition/backgrounds/desert-entry/`
- Manifest: `desert-entry-parallax-pack.json`
- Runtime mode: `layered-necropolis-playable-route`
- Style: semi-realistic, high-quality, warm sunset, believable archaeological ruin detail.
- Story: Asha is in a corrupted mirror-world version of Egypt, not normal Ancient Egypt.
- Corruption level: subtle. Use cracked gold light, disturbed dust, damaged seals, and impossible shadows. Avoid fantasy underworld skies, floating-island clutter, purple voids, and heavy supernatural palettes.

## Layer Files

### `desert-entry-necropolis-sky-plate-2026-06-25.png`

- Size: 2172 x 724.
- Background: opaque.
- Content: Valley of the Kings cliff wall, Memphite Necropolis pyramid silhouettes or mastaba ruins, warm clouded sunset, crumbling temple or tomb facade on the right.
- Must leave the lower gameplay lane readable. Do not paint a competing false floor across the bottom.

### `desert-entry-necropolis-ground-lane-2026-06-25.png`

- Size: 4096 x 240.
- Background: transparent above the stone/sand route where possible, opaque or semi-opaque only on the route itself.
- Content: world-locked playable stone path, broken causeway slabs, ravine bridge deck sections, cracked ledges, sandy edges.
- This is the visual source of truth for where Asha can run. It must not look like a distant background strip.

### `desert-entry-necropolis-foreground-rubble-2026-06-25.png`

- Size: 4096 x 160.
- Background: transparent.
- Content: low edge rubble, broken carved stones, small warning cracks, subtle gold corruption veins.
- Must support hazards without hiding Asha, enemies, pickups, or the bridge deck.

### `desert-entry-necropolis-foreground-depth-2026-06-25.png`

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
