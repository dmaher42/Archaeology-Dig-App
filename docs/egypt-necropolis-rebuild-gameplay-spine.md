# Egypt Necropolis Rebuild Gameplay Spine

This document is the rebuild target for the Desert Entry exterior. It keeps the art direction warm, semi-realistic, and archaeological, while making the gameplay route readable before final art is generated.

## Creative Target

- Asha is not in normal Ancient Egypt. She is in a mirror-world version of Egypt that is being corrupted and destroyed.
- The look should stay close to the older high-quality Egypt background: warm sunset, crumbling stone, believable ruins, and semi-realistic detail.
- The place should feel like a cross between the Valley of the Kings and the Memphite Necropolis: cliff-cut tombs, dry ridges, pyramids or pyramid silhouettes, mastaba-like ruins, broken causeways, and worn temple thresholds.
- Corruption should be subtle: glowing cracks, wrong shadows, drifting dust, damaged seals, and broken geometry. Avoid a full fantasy underworld look.

## Playable Route

1. Lower necropolis approach: Asha starts on a clear stone/sand path with low ruins and survey markers.
2. Ravine bridge combat: the floor breaks into a chasm. Asha must climb to the bridge deck and fight across it.
3. Mummification Chamber threshold: crossing the bridge should feel like reaching a real room entrance, not just another flat stretch.
4. Pyramid or cliff-face climb: after the first chamber route, Asha works upward through ledges, broken stairs, and false paths.
5. Upper doorway exits: rooms can enter from one level and exit higher or elsewhere so the world feels deeper, not like disconnected screens.
6. Scarab seal summit: the route should visually end at a high carved seal or doorway with the landscape dropping away beneath it.

## Required Gameplay Beats

- The ravine bridge is the first major environmental hazard. Enemies on the bridge are meant to knock Asha off, so dodge and parry matter.
- The playable bridge deck must be visually obvious and separate from the lower ravine floor.
- Falling from the bridge should read as a rescue/reset, not as a second walkable path.
- Ledges must read as climbable stonework, broken stairs, scaffolded ruins, or carved tomb edges.
- False ledges and cracked ledges should be visible in the art but slightly suspicious: broken edge, darker dust, loose rubble, or glowing cracks.
- Room entrances should be built into the cliff/pyramid face and aligned with real trigger/doorway locations.

## Art Layer Plan

- `skyLight`: opaque warm sunset sky and atmosphere only.
- `farPyramids`: distant pyramid and necropolis horizon forms.
- `distantCliffs`: Valley of the Kings cliff/ravine depth behind the route.
- `midNecropolisRuins`: non-colliding temple and necropolis ruins, including destination architecture.
- `groundBacking`: non-colliding sand/stone support beneath the route so the floor does not float.
- `groundLane`: the world-locked playable floor/bridge/ledge surface that moves accurately with Asha.
- `foregroundRubble`: low rubble, cracked stones, and edge detail that supports hazards without hiding the route.
- `foregroundDepth`: near dust, broken carved pieces, and subtle corruption passing in front of the camera.

The active manifest uses this eight-layer pack through `public/assets/expedition/backgrounds/desert-entry/desert-entry-parallax-pack.json`. Future work should keep this contract unless the renderer is deliberately changed.
