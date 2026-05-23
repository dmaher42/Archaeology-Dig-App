# Sphinx Boss Visual Brief

Date: 2026-05-17

## 1. Why The Rejected Asset Failed

The first procedural Sphinx draft is rejected and must not be wired into gameplay.

It failed because it did not read as The Sphinx at game scale. The silhouette looked like a mechanical Egyptian sarcophagus, boat, or drone with legs rather than a monumental lion-bodied guardian. The head and body did not clearly communicate a human/pharaoh head on a lion body, and the paws did not feel like huge grounded front paws planted in sand or stone.

The draft also felt too code-drawn and mechanical for the final boss. It had useful ideas, such as glowing glyphs and attack-state separation, but the core identity was wrong.

## 2. Approved Sphinx Identity

The Sphinx is the final protector of the Egypt expedition site.

It is a sacred ancient guardian, not a random monster, robot, treasure-hoarding boss, or generic stone brute. It protects artefacts, evidence, and the memory of the past. The player is not framed as a thief; the Journey should feel like proving care, respect, and readiness to enter the expedition site.

The Sphinx should feel:

- ancient Egyptian
- monumental
- sacred
- mysterious
- powerful
- protective
- adventure-readable
- impressive without becoming horror

## 3. Visual Requirements

The Sphinx must be unmistakably The Sphinx.

Required visual traits:

- lion body
- huge front paws planted on the ground
- Egyptian/pharaoh-style human head or headdress
- side-view 2D platformer boss stance
- stone body with gold or bronze trim
- lapis-blue and turquoise sacred accents
- glowing eyes during awakening and attack states
- carved glyph cracks that glow during power states
- heavy grounded silhouette
- dust or contact shadows under paws
- final-boss scale
- readable at gameplay scale and on large displays
- stylised 2D game art matching Lost Site Expedition

The body should feel like monumental sculpture that has come to life: stone mass first, sacred energy second. The front paws and chest should be large enough to establish scale and make the creature feel physically grounded.

## 4. Frame List

The future atlas should use these exact frame keys:

- `sphinxDormant`
- `sphinxAwakening`
- `sphinxIdle`
- `sphinxStep1`
- `sphinxStep2`
- `sphinxWindup`
- `sphinxPawSlam`
- `sphinxSandRoar`
- `sphinxGlyphBeam`
- `sphinxShielded`
- `sphinxCounterWindow`
- `sphinxHit`
- `sphinxDefeated`

Each frame should preserve the same character, side-view facing, body proportions, palette, and bottom-grounded anchor.

## 5. Combat Readability Notes

The Sphinx is a gameplay boss, so each frame must communicate state clearly.

- `sphinxDormant`: statue-like, still, carved stone guardian. No attack motion.
- `sphinxAwakening`: eyes and carved glyph cracks glow; dust lifts around paws.
- `sphinxIdle`: alert final-boss stance with paws grounded and head watching the player.
- `sphinxStep1` / `sphinxStep2`: slow heavy movement with weight shift and dust under the moving paws.
- `sphinxWindup`: clear warning pose before damage; shoulder lowers or one huge paw raises; eyes and glyphs brighten.
- `sphinxPawSlam`: close-range attack; huge paw impacts the ground with readable dust, cracks, or sacred shock.
- `sphinxSandRoar`: area attack; head rears back or mouth opens; sand and glyph wave spreads outward.
- `sphinxGlyphBeam`: ranged/line attack; glowing eyes, head, or chest glyph aims a sacred beam.
- `sphinxShielded`: defensive state; stone/glyph aura or closed guardian stance.
- `sphinxCounterWindow`: vulnerable state; lowered head or exposed glowing chest glyph makes the weak point obvious.
- `sphinxHit`: clear strike reaction without gore.
- `sphinxDefeated`: kneeling, lowered, cracked, or deactivated sacred guardian; energy fades, no gore.

Every attack must have a visible tell before damage. The player should be able to tell which attack is coming from the pose alone.

## 6. Negative Prompt / Do Not Include

Do not include:

- robot
- golem
- vehicle
- boat
- sarcophagus with legs
- sci-fi machine
- generic stone brute
- tiny unreadable frames
- front-facing-only illustration
- horror
- gore
- skull overload
- photorealism
- anime
- pixel art unless the existing game style specifically requires it
- random monster anatomy
- floating body or paws
- mismatched scale between frames
- poster composition
- text, labels, watermarks, UI, or background scenery

## 7. Future Asset Generation Prompt

Use case: stylized-concept
Asset type: 2D platformer final boss sprite sheet for Lost Site Expedition
Primary request: Create a high-quality sprite sheet of The Sphinx as a final boss guardian for an Ancient Egypt adventure platformer game.
Subject: unmistakable ancient Egyptian Sphinx with a lion body, huge grounded front paws, human/pharaoh-style head and headdress, monumental stone body, gold/bronze trim, lapis-blue and turquoise sacred accents, glowing eyes and glowing carved glyph cracks in power states.
Style/medium: clean stylised 2D game art, side-view platformer boss sprite, crisp readable shapes, polished fantasy archaeology adventure style.
Composition/framing: one horizontal sprite sheet with 13 evenly spaced transparent-background frames, all facing the same side-view direction, same character proportions, same scale, same bottom-grounded anchor, generous padding around each frame.
Lighting/mood: mysterious, sacred, ancient, impressive, protective; not horror.
Frame order and labels for production only: sphinxDormant, sphinxAwakening, sphinxIdle, sphinxStep1, sphinxStep2, sphinxWindup, sphinxPawSlam, sphinxSandRoar, sphinxGlyphBeam, sphinxShielded, sphinxCounterWindow, sphinxHit, sphinxDefeated.
Constraints: The Sphinx must read instantly as The Sphinx at small game scale. Emphasise lion body, massive grounded paws, pharaoh-style human head/headdress, stone sculpture mass, and sacred Egyptian details. Each attack state must have a clear readable tell. Keep all frames consistent in scale and silhouette.
Avoid: robot, golem, vehicle, boat, sarcophagus with legs, sci-fi machine, generic stone brute, front-facing-only illustration, photorealism, anime, horror, gore, skulls, tiny unreadable frames, floating paws, text, labels, watermarks, scenery, poster layout.

## 8. Validation Checklist Before Wiring

Before the Sphinx is wired into the stable `ancient-construct` slot, confirm:

- The atlas reads unmistakably as The Sphinx in the actual game camera.
- The lion body, human/pharaoh head, headdress, and huge grounded front paws are visible.
- All thirteen required frame keys exist in the JSON atlas.
- Every frame has a transparent background and enough padding.
- The bottom grounding is consistent across all frames.
- Walk/step frames do not float.
- Paw slam, sand roar, and glyph beam have distinct readable silhouettes.
- Shielded, counter window, hit, and defeated states are visibly different.
- The defeated frame is non-gory and adventure-readable.
- The sprite remains readable at gameplay scale and on large displays.
- The atlas validates with a boss asset validator.
- The Sphinx is not wired into `BOSS_SPRITE_PACKS` until the asset is approved.
- `ancient-construct` remains the internal boss id unless a separate migration is planned and tested.
- Route gates, key rewards, Base Camp, excavation, China, player controller, checkpoint logic, and opening scene logic remain unchanged.
