# Scarab Queen V2 Animation Contract

Permanent replacement source set for `public/assets/expedition/bosses/scarab-queen-sprites.png`.

## Runtime Contract

- Final atlas cells: 560 x 390 transparent PNG cells.
- Ground baseline: y=382 in every atlas cell.
- Facing: side view, facing left in source artwork.
- Scale: full standing/active body must fit inside 525 x 350 before atlas placement.
- Death/collapse frames may fit inside 525 x 260.
- Anchor: bottom center of the Queen stays stable unless the animation intentionally lunges.
- Background: transparent PNG source preferred. If chroma-key generation is used, remove the key before committing source sheets.
- No frame may touch its crop boundary after normalization.
- No frame may contain fragments from neighboring frames.

## Source Sheets

Each sheet is separate so timing, spacing, and cleanup remain animation-specific.

| Sheet key | Filename | Frames | Purpose |
| --- | --- | ---: | --- |
| `portrait` | `scarab-portrait.png` | 1 | Clean full-body static reference and UI/fallback pose. |
| `combat` | `scarab-combat.png` | 8 | Planted idle/combat breathing, no locomotion. |
| `walk` | `scarab-walk.png` | 8 | Heavy slow crawl with believable foot contact and no body sliding. |
| `run` | `scarab-run.png` | 8 | Low aggressive charge with clear weight shift. |
| `windup` | `scarab-attack-windup.png` | 6 | Rearing/mandible/claw anticipation before attack. |
| `acidSpit` | `scarab-acid-spit.png` | 8 | Head/mandible acid spit, acid emission included in-frame. |
| `acid` | `scarab-acid.png` | 6 | Acid projectile only, separate from Queen body. |
| `stagger` | `scarab-stagger.png` | 5 | Recoil/counter-window hit reaction. |
| `death` | `scarab-death.png` | 8 | Collapse to a stable grounded final pose. |

## Visual Requirements

- Same Scarab Queen identity across all sheets: black stone scarab shell, turquoise enamel inlays, gold trim, Egyptian crown-like head crest, glowing teal eyes, large armored claws and tail.
- Lighting should match the warm desert scene but keep readable teal/gold highlights.
- The Queen must look massive and premium, but her feet/legs must sell weight on the ground.
- Do not include UI, text, health bars, shadows, red circles, or environmental background.
- Keep generous transparent padding around each frame.

## Acceptance Checks

- Atlas builder produces all frame keys with no missing, empty, or edge-touching regions.
- Browser dev-panel jump to Scarab Queen shows `bossSpritesLoaded: true` and `bossSpriteFallbackActive: false`.
- Walk/run motion does not look like sliding.
- Death animation does not continue walking or expose neighbor-frame fragments.
- Queen does not obscure Asha for most of the encounter camera framing.
