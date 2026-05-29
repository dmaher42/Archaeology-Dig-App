# Character Sprite Pipeline

This document is the source of truth for future playable character, NPC, enemy, boss, and sprite-sheet work in Lost Site Expedition.

It exists to stop character identity drift, prevent broken or inconsistent sheets from being wired into runtime, and separate visual approval from implementation.

## Source Of Truth

- Asset-role audit: `docs/expedition-asset-tidy-audit.md`
- Running notes: `progress.md`
- Player atlas constants and active Egypt/China player paths: `src/components/expedition-journey/journeyConstants.js`
- Journey runtime drawing and character selection: `src/components/ExpeditionJourney.jsx`
- Boss sprite packs and expected keys: `src/components/expedition-journey/journeyBossSprites.js`
- Enemy sprite packs and expected keys: `src/components/expedition-journey/journeyEnemySprites.js`
- Player runtime asset root: `public/assets/expedition/player/`
- Boss runtime asset root: `public/assets/expedition/bosses/`
- Enemy runtime asset root: `public/assets/expedition/enemies/`
- Current Asha builder examples: `scripts/build_asha_final_production_atlas.py`, `scripts/build_asha_v5_atlas.py`, and `scripts/build_asha_new_idle_atlas.py`

Do not create a new loader, duplicate runtime path, or parallel sprite system when the existing Journey atlas loaders can be extended.

## Character Identity Rule

Every playable character, NPC, enemy, and boss needs an approved master reference before new animation rows are accepted.

For Asha, the master reference controls:

- face and hair
- outfit and armor details
- body proportions
- weapon shape and size
- color palette
- lighting direction
- outline thickness
- gameplay scale

Codex may flag visual or technical defects, but Codex must not self-approve character identity. Human approval decides whether a candidate truly looks like the approved character.

## Asset Roles

- `master-reference`: the approved visual identity for the character.
- `source`: raw supplied or generated art used by builder scripts.
- `candidate`: unapproved art being reviewed. Candidate art must not be wired into runtime loaders.
- `approved-source`: candidate art approved by the human for identity and visual quality, ready for technical import.
- `runtime-atlas`: PNG plus JSON atlas loaded by Journey, boss, enemy, or Expedition systems.
- `fallback`: known working runtime atlas kept available while a new atlas is being tested.
- `archive`: retained older source, candidate, or runtime material that is not currently active but may be useful for comparison or recovery.

## Required Sprite Sheet Contract

Every candidate sheet must declare and satisfy:

- exact frame count
- exact frame size
- horizontal row or defined grid layout
- transparent background, or a clearly declared keyed background for extraction
- no frame overlap
- no cropped limbs, heads, weapons, wings, tails, or attack effects
- consistent character scale and ground contact
- consistent character identity
- no labels, watermarks, checkerboard backgrounds, UI text, or borders
- side-view direction, usually facing right for Journey player sheets
- row purpose, such as idle, run, jump, attack, hurt, defeated, climb, interact, or boss windup

## Future Asha V6 High-Resolution Contract

`public/assets/expedition/player/asha-v6-hires-spritesheet.json` is an inactive template for the next Asha pass. It must not be wired into `PLAYER_HERO_SPRITE_ATLAS_JSON` until the real PNG exists and has been visually approved.

The V6 target is a transparent `4096x6144` PNG: `8` columns by `12` rows, with `512x512` cells. Rows stay in the existing player order: `idle`, `walk`, `run`, `survey_walk`, `jump`, `fall`, `land`, `attack_pick_swing`, `hurt`, `interact`, `climb`, `push_pull`.

The larger cells are for sharper source art and wider two-handed guardian-weapon motion. They do not change player collision, movement, physics, camera, platforms, enemies, or on-screen size. Runtime size remains controlled by atlas `draw.height`; the first V6 test setting is `draw.height: 132`, `draw.sourceHeight: 448`, and `frame.groundLineY: 472`.

Codex must flag technical and visual defects such as floating fragments, broken transparency, wrong frame counts, inconsistent scale, identity drift, weapon discontinuity, and cropped body parts before any runtime wiring.

## Approval Workflow

1. Generate candidate art outside the runtime pipeline.
2. Human reviews the candidate for identity, style, and visual quality.
3. Codex validates dimensions, frame count, transparency/keying, boundaries, and naming.
4. Codex copies only approved art into the correct source folder.
5. The existing builder script creates or updates the runtime atlas.
6. Runtime loaders are updated only after successful validation and human approval.
7. Codex creates contact sheets or preview crops for review before runtime wiring.
8. Codex runs the narrowest relevant validation, then `npm.cmd run lint`, `npm.cmd run build`, and a browser check when runtime visuals changed.

If frame boundaries are unclear, Codex must stop and ask for a clearer sheet or an explicit frame contract. Do not crop by guessing.

## Codex Rules

Codex must not:

- redesign the character
- mix multiple Asha identities in one runtime atlas
- use an unapproved candidate as runtime
- overwrite an active runtime atlas without a fallback or clear approval
- delete previous sheets without an asset audit
- invent a new loader if the current character, boss, or enemy loader can be extended
- crop by guessing when frame boundaries are unclear
- run broad scripted rewrites of data files without explicit approval
- treat source/reference files as clutter just because they are not currently runtime-loaded

Codex must:

- preserve dirty worktree changes unless explicitly told to discard them
- keep candidates out of runtime loaders until human approval
- make contact sheets or frame previews for visual approval
- report which files are runtime, source, candidate, fallback, or archive
- keep code changes separate from art approval whenever possible

## Recommended Asha Workflow

Do not generate or wire a full replacement Asha atlas in one pass.

1. Freeze one approved Asha master identity.
2. Generate one idle sheet from that master identity.
3. Human approves idle visually.
4. Codex imports idle as candidate or approved source, not runtime.
5. Generate run to match the approved idle.
6. Human approves run visually.
7. Generate jump to match idle and run.
8. Human approves jump visually.
9. Generate attack to match the same identity and weapon.
10. Human approves attack visually.
11. Generate hurt/defeated and any utility rows.
12. Rebuild the full atlas only after all required rows are approved.

Use this staged approach for enemies, bosses, and NPCs when identity or silhouette consistency matters.

## Prompt Templates

### Asha Idle

```text
Create a side-view transparent-background sprite row for Asha idle animation.
Match the approved Asha master reference exactly. Do not redesign the face, hair, armor, cloth, body proportions, weapon, palette, lighting direction, or outline thickness.
Output one horizontal row with [frame count] evenly spaced frames. Asha faces right. Keep the same scale, foot position, and weapon continuity in every frame. No text, labels, borders, shadows, checkerboard, or background.
```

### Asha Run

```text
Create a side-view transparent-background sprite row for Asha running.
Match the approved Asha master reference and the approved idle row exactly. Do not change outfit, face, body proportions, weapon shape, palette, lighting direction, or outline thickness.
Output one horizontal row with [frame count] evenly spaced frames. Asha faces right. Keep stride readable, feet uncropped, weapon connected to her hands, and scale consistent with the idle row. No text, labels, borders, shadows, checkerboard, or background.
```

### Asha Jump

```text
Create a side-view transparent-background sprite row for Asha jump, fall, and landing phases.
Match the approved Asha master reference, idle row, and run row exactly. Do not redesign the character or weapon.
Output one horizontal row with [frame count] evenly spaced frames. Asha faces right. Preserve body proportions, weapon continuity, readable silhouette, and consistent scale. No cropped limbs or weapon tips. No text, labels, borders, shadows, checkerboard, or background.
```

### Asha Attack

```text
Create a side-view transparent-background sprite row for Asha attacking with her approved weapon.
Match the approved Asha master reference and previous approved animation rows exactly. Do not alter face, hair, outfit, armor, body proportions, weapon design, palette, lighting direction, or outline thickness.
Output one horizontal row with [frame count] evenly spaced frames. Asha faces right. The weapon must stay connected to her hands, with no floating fragments, duplicate blades, or cropped weapon tips. No text, labels, borders, shadows, checkerboard, or background.
```

### Asha Hurt Or Defeated

```text
Create a side-view transparent-background sprite row for Asha hurt/defeated animation.
Match the approved Asha master reference and previous approved rows exactly. Do not redesign the character.
Output one horizontal row with [frame count] evenly spaced frames. Asha faces right. Keep body scale, outfit details, weapon continuity, and ground contact consistent. No gore, text, labels, borders, shadows, checkerboard, or background.
```

## Implementation Checklist

Before any sprite sheet is wired into gameplay, Codex must confirm:

- The task is using this LocalCodex repo, not an old OneDrive checkout.
- The character has an approved master reference.
- The sheet role is known: source, candidate, approved-source, runtime-atlas, fallback, or archive.
- Human visual approval exists for character identity before runtime wiring.
- The runtime path and loader are the existing canonical ones.
- Frame count, frame size, grid/row layout, transparency, and facing direction are documented.
- Contact sheets or preview crops were created for review.
- No floating fragments, overlap, cropped limbs, cropped weapons, labels, watermarks, or checkerboard artifacts are visible.
- The builder script is existing or narrowly extended; no duplicate loader was created.
- The previous working runtime atlas remains available as fallback until the new atlas is proven.
- Dirty worktree changes unrelated to the task were preserved.
- Broad scripted rewrites of data files were avoided unless explicitly approved.
- Relevant validators or focused tests passed.
- `npm.cmd run lint` and `npm.cmd run build` were run when runtime code or loaded assets changed.
- Browser verification was performed when a visual runtime asset changed, or the reason it was skipped was reported.

## Stopping Conditions

Stop and ask for human input when:

- the candidate does not clearly match the approved master identity
- frame boundaries are ambiguous
- source rows overlap or crop important body/weapon parts
- the sheet mixes multiple identities or art styles
- runtime wiring would require replacing a loader or changing a broad data structure
- approval status is missing

Do not keep making small runtime fixes to a visually broken character sheet. If identity, anatomy, silhouette, or weapon continuity is wrong, return to the candidate approval stage.
