Current source-of-truth note:
- Lost Site Expedition is no longer treated as only a small MVP mode.
- It is now the main standalone archaeology adventure/platformer direction inside Archaeology-Dig-App.
- Future implementation should follow `docs/lost-site-expedition-production-bible.md`.
- The production bible now defines implementation hierarchy, room pipelines, asset roles, and quality expectations.

2026-07-04 Stuck-chase watchdog:
- Playtest feedback: enemies froze mid-chase. Cause: pursuit is leashed to patrolMin/Max plus ENEMY_AGGRO_PATROL_PADDING, and many opening-route enemies have very narrow patrol zones, so a chasing enemy pinned at the leash clamp stood facing Asha at an invisible wall indefinitely.
- Added a watchdog in the standoff movement branch: if the leash clamp holds the enemy away from Asha and it has already reached the clamped spot for ~0.9s, it drops aggro, turns toward its patrol centre, and walks home under a 2.2s patrolReturnTimer that gates pressing/chasing (attack initiation while defending is unaffected).
- Verified combat/enemy-sprite/source-guard suites (261 tests) and a production build.

2026-07-04 Combat readability pass (timing windows + grounded telegraphs):
- Playtest feedback: fights were hard to time and the colour telegraphs looked artificial. Raised the fast enemy windups so tells are humanly readable (default strike 0.38->0.55, scarab charge 0.42->0.58, bat swoop 0.36->0.5, looter dash 0.3->0.46; scorpion/snake/guardian were already 0.6+), widened the parry window 0.12->0.2, and extended dodge invulnerability 0.18->0.22.
- Replaced the floating telegraph rectangles and body-outline auras in the enemy renderer with grounded cues: a soft danger pool on the sand under the strike zone that grows with the windup, a reach tick/dot at the strike's far edge, a red expanding ground ring for unblockables, and a gold ground flash plus counter ring during the parry window. The gold/orange/red danger colour language is unchanged.
- Updated the source-guard pin for the scarab charge windup; verified combat/enemy-sprite/source-guard suites (261 tests), eslint, and a production build.
- Environment fix: machine-wide NODE_ENV=production had caused npm to strip dev tools (eslint/vite) from node_modules; reinstalled with --include=dev. The env var is still set globally and can bite again.

2026-07-04 Combat feel pass (attack buffering, dodge economy, snappier light hit):
- Added a 0.3s attack input buffer: J/K presses made while Asha is still mid-swing or recovering now fire the moment she is ready instead of being silently dropped; buffered presses expire if held too long, and the existing heavy follow-up buffering path is unchanged.
- Cut the dodge Endurance cost from 8 to 4 so dodging is clearly cheaper than eating a hit (enemy hits cost ~6-10); the perfect-dodge reward still refunds more than the dodge costs.
- Made the opening light attack snappier (windup 0.10 / swing 0.30 / recoil 0.14 / cooldown 0.30, was 0.12/0.42/0.18/0.38) so J feels quick and decisive; heavy, finisher, and air attack timings are untouched.
- Verified focused combat tests (23), enemy sprite/combat guards (51 with the combat suite), the full Journey source-guard suite (210), eslint, and a production build on the working machine.

2026-07-04 Legacy sand snake runtime cleanup:
- Deleted the old `sand-snake-sprites.json` and `sand-snake-sprites.png` runtime atlas files after the live enemy renderer and validator were already moved to the painted viper atlas.
- Kept the painted viper runtime atlas, source/candidate PNGs, and archived metadata because those still document the approved asset path and provenance.

2026-07-04 Painted viper candidate metadata archive:
- Moved the promoted Sand Viper candidate metadata into `public/assets/expedition/enemies/candidates/archive/` and marked it `archived-promoted`.
- Kept the candidate PNG/source PNG in place because the live painted viper runtime atlas still records the candidate image as provenance.

2026-07-04 Journey debug snapshot enemy atlas readout fix:
- Updated the AI/debug snapshot so enemy sprite reporting includes family-specific atlas paths and pack status instead of only the generic fallback enemy atlas path.
- The visible families map now shows when snakes are using the promoted painted viper atlas, while the older `enemySpriteAtlasPath` remains as the primary fallback path for compatibility.

2026-07-04 Snake ambush live-asset readability pass:
- Promoted the painted sand-viper candidate into a cleaned runtime atlas and wired the live snake renderer to `sand-viper-painted-sprites-2026-07-04.json` instead of the older snake sheet.
- Retuned the snake ambush as a clearer low-line threat: longer coil/read, slightly slower lunge, longer recovery, and a longer punish opening after the strike.
- Added a low amber threat line during snake attack tells so the incoming ground-level danger is easier to read without changing enemy health or damage.
- Verified focused snake sprite/combat tests, the snake ambush slice test, lint, build, the focused new atlas validator, and local serving of the new snake JSON/PNG through the app path.

2026-07-01 Desert Entry screenshot polish pass:
- Kept the pass on the existing Journey renderer and active layered Desert Entry image contract; no duplicate scene path and no new SVG particle layer.
- Added canvas-based atmospheric grading over the temple/background layer so the huge backdrop sits farther back and competes less with the playable foreground.
- Added canvas-based playable-floor occlusion/warmth near the ground lane so Asha, enemies, and props read as sitting in the same sand/stone space.
- Added a subtle warm enemy sprite rim/drop-shadow so dark enemies belong to the sunset lighting without changing their silhouettes or combat behavior.
- Quieted the local dev jump overlay until hover/focus so screenshots and playtesting read more like the actual game composition.
- Follow-up quick win: derived `desert-entry-necropolis-stitched-pushed-back-2026-07-01.png` from the active stitched mid-necropolis layer and wired it into the manifest, pushing the ruins back with lower contrast, softer detail, cooler colour, and darker buried bases.
- Dry plaza pass: replaced the smooth, pale `groundBacking` with `desert-entry-dry-plaza-ground-backing-2026-07-01.png`, a matte cracked-sand/rubble layer so the space between the gameplay path and ruins no longer reads as a river.
- Extended the same dry-plaza treatment into the world-locked `groundLane` via `desert-entry-dry-plaza-groundlane-2026-07-01.png`, breaking up the old flat orange top strip with cracks, stones, rubble, and dry grass while keeping the combat floor readable.
- Pushed the dry plaza layer upward toward the ruins and added a small canvas seam-breakup pass so the dry ground blends into the necropolis base instead of forming a ruler-straight horizontal platform edge.

2026-07-02 Desert Entry sky replacement pass:
- Generated and normalized `desert-entry-generated-sunburst-sky-2026-07-02.png` as a 2172x724 replacement for the active `skyLight` layer, matching the reference image's brighter sun-break clouds and warm cinematic amber tone.
- Retuned the selected sky into `desert-entry-generated-sunburst-sky-balanced-2026-07-02.png` after review because the first pass was too orange; the active version keeps the sun break but shifts the cloud mass toward cooler bronze/umber and dusty gold.
- Wired the new sky through `public/assets/expedition/backgrounds/desert-entry/desert-entry-parallax-pack.json` without adding a parallel background path.
- Ground layer follow-up: replaced the active `groundBacking` with `desert-entry-dry-plaza-ground-backing-softened-2026-07-02.png` and `foregroundRubble` with `desert-entry-foreground-rubble-integrated-2026-07-02.png`; tuned the backing lower/softer and the rubble lower/less opaque so the playable lane remains readable while the ruins-to-path join has more natural dusty support.
- Regenerated the unsuitable ground support assets instead of continuing narrow tweaks: `desert-entry-generated-dry-plaza-ground-backing-2026-07-02.png` is a fully opaque matte dry plaza backing, and `desert-entry-generated-foreground-rubble-solid-2026-07-02.png` is a chroma-key cleaned rubble strip with solid stone interiors and transparent gaps.
- Fixed the generated rubble draw order after playtest feedback: `foregroundRubble` is no longer drawn in the early atmosphere pass before `groundBacking`; it is now drawn in the Desert Entry ground-lane pass after backing/lane, so the solid rocks appear in front of the ground backing instead of being covered by it.

2026-07-04 Desert Entry ground-backing detail pass:
- Reworked the active non-colliding `groundBacking` into `desert-entry-warm-detailed-ground-backing-2026-07-04.png`, keeping the same layer slot but warming the colour and strengthening larger cracks/ruin texture so it should no longer read as a grey flat backing in-game.
- Wired the new PNG through the existing Desert Entry parallax manifest and updated the focused manifest guard; collision, player movement, enemies, and layer order were not changed.
- Baked the pasted Ritual Temple layer tuning into `desertLayerTuning.js`: parallax 1, height 764, width scale 1.1, base Y 605, and softer brightness/saturation/contrast so the temple should sit closer to the gameplay plane without dominating the scene.
- Replaced the active `skyLight` layer with `desert-entry-sky-only-cracked-gold-2026-07-04.png`, an opaque 2172x724 warm amber/gold sunset sky with subtle cracked-gold shimmer and no terrain baked into the layer.

2026-06-28 Mummification Lab local save and classroom support pass:
- Extended the existing `src/components/mummification-quest/` implementation; no duplicate app, no drawing canvas, no AI chat, and no Lost Site Expedition gameplay changes.
- Added device-local autosave for group responses using `archaeologyDigApp:mummificationQuest:v1`, plus a visible saved indicator and Reset Mummification Lab Progress action.
- Added the student glossary, success criteria panel, and collapsible Teacher Notes panel requested for the Year 7 classroom workflow.
- Improved the generated Field Report so it compiles group name, mummy name, prediction, practical checklist, observations, sarcophagus design choices, future archaeologist interpretation, and final reflection.

2026-06-28 Mummification Lab UI/UX polish pass:
- Kept the polish scoped to the new classroom mode and main menu card; Lost Site Journey gameplay was not changed.
- Updated the Mummification Lab menu card to use the generated lab briefing artwork instead of the generic investigation artwork.
- Improved lab readability, responsive layout, image fallback cards, hover/focus affordances, and stage navigation behavior.
- Fixed stage switching so moving between lab stages scrolls back to the current task instead of leaving students halfway down the previous screen.

2026-06-28 Mummification Lab MVP field-and-asset pass:
- Extended the existing feature-folder Mummification Lab rather than adding a duplicate root component or touching Lost Site Journey gameplay.
- Updated Evidence Sort to use the requested categories: preservation, ritual/belief, archaeological evidence, and causes decay.
- Added required observation, sarcophagus design, future archaeologist, and final report prompts, including "I predict the orange will change because..." and "My thinking changed because..."
- Wired the four tracked evidence-card images from `public/assets/mummification-quest/evidence-cards/` and added placeholder fallback cards for missing background, orange-practical, sarcophagus, CT scan, and decay-condition images.
- Verified focused lab tests, `npm.cmd run lint`, and `npm.cmd run build`.

2026-06-28 Mummification Lab generated asset pass:
- Generated the five previously missing classroom images with the built-in image generator and copied them into `public/assets/mummification-quest/`.
- Added `backgrounds/mummification-lab-briefing.png`, `orange-practical/orange-practical-materials.png`, `evidence-cards/ct-scan.png`, `orange-practical/decay-conditions.png`, and `sarcophagus/sarcophagus-design-studio.png`.
- Confirmed the saved images are classroom-friendly: orange model focus, no graphic human remains, no readable in-image labels, and consistent warm Egyptian classroom style.
- Updated the lab data test so primary image candidates now have to exist in the project.

2026-06-28 Mummification Lab classroom MVP:
- Added a new main-menu classroom mode: Mummification Lab / Orange Mummy Quest.
- The MVP is text/card based only, with no image generation, no canvas drawing, no new dependencies, and no changes to Lost Site Journey gameplay.
- It includes seven classroom stages: Briefing, Evidence Sort, Orange Practical Checklist, Observation Log, Sarcophagus Design Studio, Future Archaeologist Mode, and Field Report.
- The new mode uses local React state only for this first pass and skips autosave so it does not interfere with existing investigation or Bureau saves.
- Added a teacher safety note, respectful human-remains language, sarcophagus design prompts, metacognition prompts, Copy Report and Print Report actions, a data integrity test, and the brief at `docs/mummification-orange-sarcophagus-quest-brief.md`.

2026-06-25 China background bleed fix:
- Found a route-switch/loading weakness where the China Journey could fall through to the old generic temple backdrop before its `china-river-valley` PNG pack was ready.
- Patched the canonical China background renderer so China owns the frame with a China-coloured opaque base during PNG loading and before alpha-keyed parallax layers draw.
- Added a focused guard test for the loading path so Ancient China cannot display Egypt background art while the China pack is still resolving.

2026-06-27 Egypt true parallax rebuild:
- Superseded the older four-slot necropolis/skyPlate experiment with the active eight-layer Desert Entry contract in `public/assets/expedition/backgrounds/desert-entry/desert-entry-parallax-pack.json`.
- Active layer keys are now `skyLight`, `farPyramids`, `distantCliffs`, `midNecropolisRuins`, `groundBacking`, `groundLane`, `foregroundRubble`, and `foregroundDepth`.
- The regenerated PNGs use the `desert-entry-egypt-true-...-2026-06-27.png` filenames. The runtime draws the background layers at separate parallax speeds, draws `groundBacking` as non-colliding visual support, and keeps `groundLane` world-locked to the collision floor.
- The art direction is warm semi-realistic Valley of the Kings plus Memphite Necropolis with subtle mirror-world corruption. Avoid river scenery, heavy underworld palettes, cutout ruin plates, and pasted platform floors in future passes.
- Alignment polish pass: lowered the non-colliding `groundBacking` draw slot so it supports the route without rising into Asha's feet, slightly expanded the visible `groundLane` surface so the collision line sits inside the stone path, removed the old Egypt-only `-42px` visual ground offset that lifted Asha above the rebuilt route, softened the lane's lower lip so it no longer reads like a raised ledge, and removed residual chroma-key green from regenerated transparent layers.
- Temporary build-flow fix remains active: the Temple Threshold Hall auto-entry is disabled while the exterior route is being rebuilt, so Asha can run through the Temple Approach area without immediately entering the room.

2026-06-25 Civilisation separation audit pass 4:
- Separated China/Rome/Egypt Journey field-kit identity through the existing Journey data router instead of adding a parallel tool system.
- Added China-specific Journey tool names such as Soft Bamboo Brush, River Measuring Cord, and Dynasty Field Guide while preserving the canonical tool ids used by saves, pickups, scoring, and HUD state.
- Updated Expedition field-kit descriptions, Asha's explorer profile line, the China Journey start briefing, and generic objective-progress fallback so China/Rome no longer inherit Egypt-specific field-guide, Lost Map Tablet, or undefined objective copy.
- Added a source guard covering China tools, China route gates, China objectives, China start briefing copy, and Rome/Egypt tool routing so the three expedition identities stay separated.
- Updated the China asset audit: the next conflict pass should move to the China weapon/collectible visual reuse, especially replacing the Egypt khopesh weapon pack through the existing player weapon loader.

2026-06-24 Ancient Rome Section One production pass:
- Built Rome as a playable Journey section first, not an archive review screen: Ancient Rome now starts directly in the side-scrolling expedition flow with Rome-specific briefing copy.
- Created and wired real PNG assets for Rome backgrounds, route props, evidence icons, transparent enemy/boss atlases, Asha's Rome variant, gladius weapon art, and the Rome opening cinematic.
- Replaced Egypt/Anubis leakage in the Rome start path: the opening cinematic now uses Forum, Legate, Asha, and vault-sigil PNGs, and the skip-intro notice names the Legate.
- Added the Rome evidence spine for Republic-to-Empire discoveries and a timeline-locked vault gate so the HASS content is embedded through exploration/progression.
- Removed the unsupported Rome milestone from the Egypt doorway renderer and upgraded the Via Sacra playable background so the first gameplay screen reads as Ancient Rome.
- Verified focused Rome/prologue tests, a 29-file PNG alpha/existence audit, lint, production build, and a live browser playthrough from Ancient Rome start to playable Via Sacra.
- Follow-up Rome visual cleanup: replaced the Via Sacra opening source with `public/assets/expedition/backgrounds/rome-via-sacra/rome-via-sacra-source-no-temple-2026-06-24.png`, regenerated the active Rome Via Sacra parallax PNGs from that no-temple Roman street source, and added a Rome test guard so the opening does not regress to the old temple-front approach.
- Also routed Rome shard-gate hints through Rome-specific copy so the first Forum gate no longer inherits Egypt's ravine-bridge guidance in the playable Rome state.

2026-06-24 Civilisation separation audit first pass:
- Added an explicit Egypt-only Journey runtime guard so Temple Threshold, Mummification Chamber, Forgotten Mural, Scribe Chamber, Scarab Seal, Scarab Queen intro, and the opening first-shard echo no longer use the old "not China" shortcut.
- Cleaned Journey debug/fallback reporting so Rome does not report missing China guardian enemy sprites, and background fallback checks are scoped to the active civilisation's background pack list.
- Updated Rome production guards and Journey source guards to protect the separation and the civ-aware Rome/Egypt opening notice split.
- Verified: Rome production section tests, full Journey source-guard test file, targeted lint on changed files, production build, and a short Chrome browser state/screenshot check for Ancient China and Ancient Rome.
- Remaining separation work: Ancient China still uses the Egypt/Anubis opening cinematic and the shared debug scene id `egypt-exterior-route`; Rome still reports the Egypt environment pack id even though its Rome background pack and gladius weapon load correctly.

2026-06-24 Civilisation separation audit pass 3:
- Found the first playable China screen was falling back to a bare sky/ground look because the shared background readiness contract still expected the retired `farValley` key.
- Fixed the renderer handoff so China receives both `backgroundPackId` and `environmentPackId`; the China background draw path now recognises the active `china-river-valley` pack instead of falling through to canvas fallback.
- Rejected the active layered China PNG after browser review because its transparent bands exposed checkerboard blocks; switched the live manifest to the clean full rectangular `china-river-valley-parallax-pack.png` backdrop with `single-composited-backdrop` runtime mode.
- Separated China from the Egypt/Anubis opening path: China now has a short Watchtower/River Valley Seal intro, China-specific skip/aftershock notice, China overlay styling, and real PNG assets for the opening background, Asha cutscene sprite, watchtower, and sealed timber gate.
- Added `public/assets/expedition/player/china-asha-cutscene-2026-06-24.png`, derived from the cleaned China player atlas, so the intro uses the same hero identity as the playable China route instead of the generic stage-select character.
- Added focused China production guards for the clean background contract, renderer pack-id handoff, China opening copy, PNG asset existence, and no Anubis/Duat/scarab leakage in the China opening block.
- Verified focused Journey/Rome/China guards, `git diff --check`, lint, production build, and browser screenshots for the China opening overlay plus the first playable China screen.

2026-06-24 Desert Entry full background reset:
- Replaced several rejected Desert Entry background experiments and retired the old single panorama prop from generated placement overrides.
- The active Desert Entry exterior is now owned by the layered atlas path, with a dedicated world-locked gameplay ground lane instead of pasted-on background strips.
- A dev-only `?play=exterior` shortcut remains available to bypass the Arrival Threshold for visual checks while keeping normal `?play` behavior unchanged.
- The rejected intermediate background files were later removed during the 2026-06-25 Egypt necropolis cleanup pass so only the current necropolis layer slots remain in the active Desert Entry asset folder.
- Follow-up cleanup removed the old primary panorama renderer fallback and stale integrated-temple version labels. Future Desert Entry art work should replace the active necropolis layer PNGs/manifest contract, not resurrect the retired single-panorama path.

2026-06-24 Desert Entry layered game-art rebuild:
- Replaced the temporary single-strip ground approach with layered Desert Entry art: separate background plate, world-locked playable floor, rubble seam mask, and light foreground depth.
- Runtime now loads the active background from `journeyPlacementOverrides.generated.js` and draws the playable floor/mask/depth through the existing Journey renderer, leaving collision and platform data unchanged.
- New PNG assets live under `public/assets/expedition/backgrounds/desert-entry/` and are recorded in `desert-entry-parallax-pack.json` as the active layered game-art contract.
- Corrected the first layered-art haze pass by making the playable floor crisp and opaque at Asha's foot height, reducing the rubble mask to the seam, and keeping foreground depth limited to the lower screen edge.
- Verified Asha walking across Desert Entry in browser screenshots, then passed focused Desert Entry guards, full Journey guard files, lint, and build before any commit or publish.

2026-06-23 Desert Entry ground-plane integration:
- Reworked the Desert Entry route floor from a pasted-on bottom strip into a camera-view perspective plaza plane that blends into the existing painted panorama.
- Asha, her dodge trail, normal enemies, mini-bosses, attack tells, and key combat effects now render on the same raised visual ground plane while the proven collision floor remains unchanged.
- Added subtle run-motion ground streaks so Asha's speed is easier to read after the visual raise.
- No new background was generated in this pass; the existing Desert Entry panorama already had the correct plaza perspective once the overlay and actor render positions were fixed.
- Verified Journey source-contract tests, targeted changed-file lint, production build, and a headless Chrome gameplay capture with Asha running beside active scorpion enemies on the shared floor.

2026-06-21 Arrival Threshold Duat Echo Trial:
- Implemented the Arrival Threshold as Asha's first playable Duat threshold after the scarab transport, using the new high-resolution threshold chamber art and existing Journey opening flow.
- Added a story-tied practice combat sequence in the room: still echo, moving echo, and striking echo. The broken scarab breach stays locked until the trial is complete.
- Anubis now acknowledges the room trial before the main confrontation: "The threshold measured you", "It found motion. Not innocence", and "Do not mistake survival for passage."
- Fixed the dev quick-start path so `?play` starts in Arrival Threshold instead of jumping straight into the old Anubis cinematic.
- Verified focused opening tests, lint, production build, and a browser Journey check confirming blocked early exit, all three echo steps, breach exit, and Anubis handoff.

2026-06-20 Temple Approach ramp editor prop:
- Added the approved Temple Approach Gatehouse Ramp PNG to the Journey prop editor registry under a new `Temple Approach` category.
- Extended the editor palette template path so registry image props can preserve grounded depth, z-index, scene blend, contact ratio, shadow sizing, width scale, and non-collidable settings when stamped from the editor.
- Verified the ramp appears in `createJourneyPropPalette` as `Temple Approach Gatehouse Ramp` with the correct PNG path and grounded/no-sand defaults.
- `npm.cmd run build` passed. Broad Journey placement tests still have unrelated active-WIP failures around older scarab/Mummification route-history expectations.
- Follow-up alignment tweak: shifted the smooth Temple Approach ramp assist start from the far-left flat approach to the painted lower ramp lip, so Asha should stay on the flat ground until she actually reaches the stone ramp surface.
- Follow-up snap fix: changed the smooth ramp surface to begin at true `GROUND_Y` and lowered the snap-up tolerance from 340 to 72, so Asha should ease onto the first ramp stones instead of jumping upward at the ramp base.
- Lower-path bypass: ramp assist now requires climb intent (`Jump`/`W`/`ArrowUp`) or an already-raised foot position, so simply holding right should keep Asha on the lower foreground path under the Temple Approach instead of forcing her up the ramp.

2026-06-15 Asha heavy attack scale normalization:
- Fixed Asha's heavy attack visual scale in the existing Journey hero atlas renderer instead of replacing or regenerating character art.
- Added atlas metadata for row-level scaling on the heavy follow-up sweep and frame-level scaling on the plain K heavy mid-swing frames, preserving combat timing, collision, and the approved Asha sprite atlas.
- Updated the Asha reference-warrior atlas builder so future atlas rebuilds keep the same scale metadata.
- Verified focused Asha atlas tests, JSON metadata checks, Python builder syntax, targeted lint, production build, and a local browser Journey load with no console errors. Full `npm.cmd run lint` timed out in this dirty worktree, so targeted lint was used for the changed JS files.

2026-06-15 Asha run scale normalization:
- Continued the same existing Journey hero-atlas scale metadata path after play-test feedback that Asha looked larger while running.
- Measured idle at 135.22 rendered pixels high and walk/run/survey-walk at 138.71 before tuning; after play-test feedback that 0.975 still looked slightly too tall, lowered the movement row scale to 0.965 for `walk`, `run`, and `survey_walk`, bringing movement rows to about 133.85 rendered pixels high without changing collision, movement speed, animation timing, or source art.
- Updated both Asha reference-warrior atlas JSONs, the builder script, and focused atlas tests so the run-scale correction survives future rebuilds.

2026-06-14 Desert Entry first two area production pass:
- Replaced the fake Desert Entry full-canvas background morph with a single-plate camera-panned renderer mode, so the route cuts cleanly instead of fading one painting into another.
- Added high-resolution transparent PNG scene objects for the first Anubis trigger and the ravine-to-Mummification transition under `public/assets/expedition/environment/egypt-opening/desert-entry-production-2026-06-14/`.
- The first Asha area now has a physical scarab threshold aligned to the real Anubis trigger, and the ravine exit now has an enterable Mummification doorway aligned to the existing hidden route and doorway floor.
- Retired the old Mummification route-gate front/back props and suppressed the old abstract Guardian Prep Seal visual where the physical doorway now carries the transition read.
- Added focused Journey placement tests to protect the physical threshold, physical doorway, PNG transparency/assets, and clean-transition renderer contract.

2026-06-14 Desert Entry continuous background rebuild:
- Added a canonical continuous panel contract in `src/components/expedition-journey/journeyDesertBackgroundPanels.js` while restoring the generated PNG plates as the primary full-canvas route art.
- The Desert Entry route now has seven ordered panels from opening through Queen gateway, each with sky, far, mid, ground, and foreground layer roles, shared horizon/ground/light/style values, and explicit natural transition masks.
- `ExpeditionJourney.jsx` drew the continuous panels as fallback/structure, then rendered the PNG plates through a full-canvas camera-panned crossfade path; the later first-two-area pass replaced that morph with a clean single-plate handoff.
- Collision/platform data was scoped only where the ravine floor was tied to the broken visual read: the lower floor/recovery helpers under the bridge were split/removed so the bridge remains the safe crossing and the ravine reads as a real drop.
- Added `journeyDesertBackgroundPanels.test.mjs` plus updated placement/secret assertions for the new background contract. Focused panel and placement tests pass; the broad `journeySecrets.test.js` still has unrelated active-WIP failures in mummification exterior, Scarab Queen staging, registry/contact-layer expectations, and scorpion nest placement.

2026-06-13 Desert Entry first-spawn visual grounding:
- Confirmed the Journey renderer already supports standalone PNG props through `imageAssetKey` and `assetPath`, with depth, shadow, colour grading, and sand-overlap controls, so no new rendering system was needed.
- Added a quiet four-prop Asha/world grounding cluster at the first Desert Entry spawn using the existing `image-prop` path and cropped PNGs under `public/assets/expedition/environment/egypt-atmosphere/props/grounding-kit-2026-06-13-final/`.
- Removed two visual-only premium rubble contact-shadow props that read as floating distant ruins in the first viewport.
- Added focused placement test coverage so the first-spawn grounding props remain low, local to Asha, non-interactive, and real PNG-backed.
- Locked the opening-to-ravine far background to the first regenerated plate through the ravine approach so the sky, pyramids, sphinx, and distant temple mass no longer swap to a different painting while Asha moves through the first stretch.

2026-06-12 Desert Entry ravine bridge polish:
- Kept the bridge-route motivation in the existing Journey seal/shard guidance path rather than adding a separate tutorial.
- The required Temple Approach Seal shard now sits on the upper ravine bridge route, and the locked-seal HUD hint explicitly tells players to climb the bridge for the next shard while treating the lower path as recovery.
- Added focused test coverage so the bridge reward stays visible, required, and above the recovery path.
- Verified the focused Journey route tests, nearby Journey regression tests, targeted eslint, and production build.
- Fixed the missing visible room landmark at the Mummification exterior: the generated entrance prop is no longer retired behind the background plate and now renders as a route-edge structure again, with focused placement/room-entry tests updated to protect visible sacred-room exteriors.

2026-06-11 Desert Entry transition guidance update:
- Continued the Desert Entry rebuild follow-up by tightening route-gate guidance after the Mummification, Mural, Scribe, Queen, Desert Seal, and Ruined Temple gateway stretch.
- Added a reusable next-route-gate helper so HUD/debug/shard guidance ignores editor-only route markers and skips stale gates that are already behind Asha after the rebuilt path.
- Added focused route-gate tests alongside the existing placement-rebuild tests.
- Continued the transition pass by moving chamber entry/return math into tested Journey helpers; Mummification, Mural, and Scribe room returns now share the same verified doorway-platform centering contract.

2026-06-11 Desert Entry regenerated background batch:
- Generated four new Desert Entry route background plates for the rebuilt path: Mummification-to-Mural, Mural-to-Scribe, Scribe-to-Queen, and Queen/Seal-to-Ruined-Temple-gateway.
- Saved raw and normalized PNGs under `public/assets/expedition/backgrounds/desert-entry-regenerated/`; the normalized gameplay files are `2172x724` and had lower-right generated signature marks cropped out where needed.
- Wired the normalized plates into the existing Journey `image-prop` rendering path in `journeyPlacementOverrides.generated.js`, with non-colliding background-depth placements behind the rebuilt route beats.
- Added focused placement test coverage so the routed Desert Entry data keeps the regenerated plates, file paths, ordering, and disk assets intact.
- Browser debug capture verified the first regenerated plate in the live Journey canvas at the Mummification-to-Mural stretch; subsequent automated screenshots hit the animated-canvas capture timeout, so the remaining route points are covered by route-state checks, asset serving checks, dimensions, and renderer camera-window tests.

2026-06-05 Markdown audit update:
- Promoted `docs/docs-status.md` as the repo's Markdown interpretation map: what is absolute, what is current supporting context, what is specialist source, and what is historical/reference.
- Confirmed the absolute current docs are the Production Bible, Standalone Game Rule, Story Bible, Story Arc, and Egypt Act 1 Room Order.
- Updated `README.md` and `AGENTS.md` so future Codex passes see the docs-status guide and current source-of-truth hierarchy sooner.
- Corrected `AGENTS.md` current WIP notes: the active branch is `mummification-ritual-lock-upgrade`, with Journey/mummification-room files dirty, not the older Training Phase layout pass.
- No gameplay code, asset loaders, room data, or runtime systems were changed during this documentation audit.

2026-06-20 Desert Entry background recovery:
- Fast-forwarded local `main` to the remote clean-canyon fix, then restored the known-good Desert Entry recovery slice from `codex/journey-split-task-9-renderer-slice-next`.
- Reinstated the story-route mega panorama and purpose-built Temple Approach gatehouse ramp PNGs through the canonical Journey override path instead of adding a parallel background system.
- Restored matching Desert Entry renderer/data/test files so the clean causeway, no-sand-sheet rendering, purposeful combat metadata, and gatehouse/ramp placement remain aligned.
- Verified `journeyPlacementOverrides.test.mjs`, `journeySecrets.test.js`, and `journeyDesertBackgroundPanels.test.mjs`; next check is browser screenshot/build.

2026-06-20 Temple Threshold Hall first chunk:
- Wired the Temple Approach gatehouse door into a new playable Threshold Hall scene using the existing Journey sacred-room transition path instead of creating a parallel room system.
- Reused the approved dark interior threshold artwork as the full room background, added an invisible floor for Asha, and suppressed extra fake door art so the generated PNG remains the visual source of truth.
- Added first-pass room logic: exterior doorway entry, interior left-side return, right-side sealed-door warning beat, QA dev jump, and state flags for entered/cleared/active.
- Verified focused Journey tests, production build, and a browser screenshot showing Asha grounded inside the room with no browser errors. Next chunk should tune the exterior ramp/door approach so normal play reliably gets Asha to the doorway.

2026-06-20 Temple Approach ramp walk-up chunk:
- Converted the gatehouse approach from four large jump-style invisible ledges into a safer walk-up path by adding hidden contact steps under the purpose-built ramp art.
- Added a narrowly scoped Temple Approach ramp surface assist so holding right carries Asha up the realistic ramp to the gatehouse door without making the PNG itself collidable or changing the rest of the movement system.
- Added a QA-only `journey-temple-approach-ramp` jump for future browser checks of this exact area.
- Verified focused placement/secret tests, production build, a clean ramp screenshot, and a movement screenshot where Asha reaches the Threshold Hall from the ramp with no browser errors.
- Follow-up after play-test feedback: the first QA check started Asha too high on the ramp and missed the lower-approach failure. The ramp assist now catches Asha from the lower ground approach, no longer depends on the section flag, and the QA jump starts before the ramp. Verified again from before the ramp into the Threshold Hall.

2026-06-27 Egypt parallax step 1:
- Split the active Desert Entry necropolis rebuild into explicit depth-layer slots for the Journey renderer: `skyLight`, `farPyramids`, `distantCliffs`, and `midNecropolisRuins`.
- Replaced the old active `skyPlate` contract in the Desert Entry parallax manifest and asset loader so future work must provide separate background depth layers.
- Updated the renderer to draw the Egypt background at layered camera speeds before the existing non-colliding ground backing and world-locked playable floor are drawn.
- Kept collision, player placement, Temple Threshold Hall build-disable behavior, and the current playable floor alignment unchanged for this step.

2026-06-05 Mummification ritual-lock upgrade:
- Upgraded the existing Mummification Chamber (no new room/puzzle/progression system) from a guided "walk to glow and press interact" sequence into a tense, story-driven ritual lock, extending the in-place Journey chamber logic in `ExpeditionJourney.jsx` and the reusable interact primitives in `journeyUtils.js`.
- Reduced hand-holding: removed the auto-glow that revealed the correct plinth and softened the "next object" glow, so jar/fragment matching is genuine symbol inference; kept one short atmospheric hint per rite so it stays fair.
- Added a chamber "disturbance" reaction that reuses existing atmosphere systems — careless/wrong actions flare the candles, dim-flash the room, pulse the seal, and shake the camera (`mummificationChamberDisturbanceTimer` + `stirChamber`).
- Added a cold, judgement-only Anubis who speaks sparingly on repeated carelessness (`MUMMIFICATION_ANUBIS_WARNINGS`), never friendly, never revealing the larger theme.
- Rite 3 now offers three vessels (thin, bitter, sacred) with distinct wrong-clues; Rite 5 became a three-fragment ordering that restores a deliberately scratched-out name, planting the "the name was damaged by hand" beat without revealing the memory theme.
- Wrong jar/oil/fragment gives feedback but never resets completed rites; the exit seal stays locked until all five rites and their sub-steps are done.
- Revised chamber copy to stay sacred/tense/mysterious and avoid early "memory/teaching" framing.
- Updated and extended the focused mummification tests; verified lint and production build.

Original prompt: Implement "Lost Site Expedition" as a small MVP game mode in the Archaeology-Dig-App repo.

2026-05-31 update:
- Started Phase 1 developer visual prop placement mode by extending the existing Journey `STORY_PROPS` path instead of adding a new room format or editor.
- Added helper coverage for prop placement edit/export serialization, then wired dev-only `E` edit mode, click selection, mouse dragging, `G` grid snapping, `Delete` removal confirmation, and `Ctrl+S` export JSON for current-room canonical prop objects.
- Extended the same Phase 1 prop editor for Phase 2 creation and transforms: `P` opens a palette derived from current `STORY_PROPS`, palette clicks arm a prop, room clicks spawn into the same runtime/export list, `Ctrl+D` duplicates selected props, `Q`/`R` rotate, and scale/rotation export on the existing prop object shape when changed.
- Added Phase 3 editor polish: snap mode now draws a visual grid, selected props can adjust depth/layer/z-index directly in the existing editor panel, and `npm run journey:apply-prop-export -- <export.json>` applies the Phase 1/2 export JSON back into the canonical `STORY_PROPS` source path.
- Replaced the Mummification Chamber interior runtime background with the side-on puzzle-ready PNG `public/assets/expedition/environment/desert-temple/mummification-chamber-interior-side-scroll-2026-05-31.png`.
- Kept the existing Journey chamber system and interaction atlas, then realigned the chamber readable zones, inspection hitboxes, exit seal trigger, and entry spawn to the new shallower room layout.
- Verified the updated room in the browser through the existing Journey dev shortcut; the chamber rendered with the new art and no browser console warnings.
- Upgraded the Mummification Chamber ritual puzzle in the existing Journey chamber code instead of adding a parallel puzzle.
- The active ritual order now follows the readable rite sequence: embalming table, canopic jars, oils and resins, linen wrappings, then ritual tablet.
- Added an in-room next-rite guide and current-object glow so the puzzle teaches the next action.
- Wrong-order interactions now keep completed progress and give a next-step clue instead of resetting the ritual.
- Verified the new puzzle guard test, the focused mummification tests, lint, and production build. Browser-control canvas screenshots timed out, but the live app mounted the Journey shell and retained only the existing audio autoplay warnings.
- Started the Forgotten Mural Room upgrade: collecting all three broken scarab relic fragments now opens a slide-puzzle overlay instead of immediately restoring the mural.
- Added a 3x3 scarab-seal slide puzzle with movable relic-piece buttons, reset support, solve detection, and restoration payoff once solved.
- Added a dev-panel smoke shortcut for the Mural Slide Puzzle so the overlay can be checked without a long playthrough.
- Verified the focused mural puzzle test, lint, production build, and a live browser smoke check showing the 9-tile overlay with two movable pieces and the reset control. The browser still reports existing audio autoplay warnings.
- Upgraded the Forgotten Mural slide puzzle art from labelled placeholder tiles to a generated scarab-seal mural PNG at `public/assets/expedition/environment/desert-temple/forgotten-mural-relic-slide-puzzle-2026-06-01.png`; the overlay now slices that artwork across the 3x3 board.
- Reframed the Mural Room puzzle text around restoring a rearranged scarab seal image rather than taking treasure; completion now reveals the hidden mural clue that the Queen may have been gathering memory anchors to protect the dead.
- Added generated hidden mural reveal artwork at `public/assets/expedition/environment/desert-temple/forgotten-mural-hidden-memory-reveal-2026-06-01.png`; after the scarab slide puzzle is solved, the Mural Room wall now displays the new PNG art with a glow so the chamber change is obvious.
- Added Scribe Chamber exterior ground-blending props using existing Egypt atlas assets: jars, fallen tablet, rubble, collapsed stair stones, papyrus cases, column cap, pebble scatter, and sand drift now anchor the base without changing the room or puzzle logic.
- Replaced the Scribe Chamber exterior structure PNG in-place with the supplied blue/gold scarab-door building sheet crop while preserving the existing Journey asset key, prop entry, and room logic; polished the transparent silhouette so the sheet edge reads cleaner against the Egypt sky.
- Added the Phase 3 reusable trap/hazard system on the existing Journey `HAZARDS` path rather than creating a parallel room format.
- Added `journeyTraps.js` with typed trap defaults, trigger-zone math, editor-created trap objects, and runtime state transitions for Collapsing Stone Floor, Hidden Sand Pit, and Dart Launcher.
- Extended the developer placement editor so the palette has Props/Traps tabs, traps can be placed/dragged, selected traps expose type, size, trigger area, damage, cooldown, reset, depth, linked ids, and dart launcher direction/position, and trigger zones can be shown/hidden.
- Seeded the first three Egypt entry traps into the canonical room data as typed reusable traps while preserving the old hazard array and export path.
- Verified focused trap helper tests, export merge tests, lint, production build, `git diff --check`, and a live menu screenshot at `output/trap-system-smoke-2026-06-01.png`; broader `journeySecrets.test.js` still has unrelated active-WIP failures outside the trap helper surface.

2026-05-29 update:
- Began the immersion cleanup pass for artificial in-world labels and markers.
- Removed the generated text residue from `public/assets/expedition/excavation/egypt-gateway-pack.png` by making unused atlas areas transparent while preserving registered regions.
- Added generated Egypt exit-gate art into the existing gateway atlas as `exitArch` and `closedGateSlab`.
- Wired the excavation exit gate so the arch remains in-world and the stone slab appears only while mission objectives are incomplete, replacing the modern padlock/unlock overlay.
- Added source-level test coverage to prevent canvas text labels and padlock overlays from returning to the Expedition map draw path.
- Corrected the target to the side-scrolling Journey progress gates after screenshot review.
- Added `public/assets/expedition/environment/egypt-opening/route-gate-arch-pack.png` and wired `drawRouteGate` so every Journey progress gate renders as an in-world arch with a stone slab while closed, then an open arch when requirements are complete.
- Removed the route-gate padlock, glowing artificial ring, and in-world gate label from the Journey progress-gate renderer.
- Enlarged and split the Journey route-gate rendering into base and foreground layers so open gates read as walk-through arches: Asha can pass through the transparent opening while the stone frame occludes correctly.
- Kept already-opened Journey route gates visible as open arches instead of removing the prop, so the world still contains a doorway after the route unlocks.

2026-05-28 update:
- Added `docs/lost-site-expedition-production-bible.md` as the top-level production and implementation guide for Lost Site Expedition.
- Clarified the source-of-truth hierarchy between the Production Bible, Story Arc, Standalone Game Rule, Design Brief, Asset Audit, and Progress notes.
- Updated the README to reflect that Lost Site Expedition is now the primary standalone archaeology adventure direction inside the repo.
- Updated the design brief so it supports the Production Bible instead of competing with it.
- No gameplay systems, Journey logic, loaders, or assets were changed during this documentation consolidation pass.
- Added `docs/character-sprite-pipeline.md` as the source of truth for future character, enemy, NPC, boss, and sprite-sheet work.
- Added an `AGENTS.md` pointer requiring future sprite-related tasks to read the pipeline before editing assets or runtime loaders.
- The pipeline separates human visual approval from Codex implementation, keeps candidates out of runtime loaders until approved, requires contact sheets/previews, and forbids broad scripted data rewrites without explicit approval.

2026-05-27 update:
- Started the Training / Field Certification survey-to-excavation rework with a focused first slice.
- Added three inspectable survey zones for Training: Central Depression, Ridge Scatter, and Washout Edge.
- Survey now reveals field evidence and requires choosing an excavation area before moving to Grid.
- The selected survey area now seeds the Training board with a safe starter probe while preserving the classic Beginner, Intermediate, and Expert hidden-find counts.
- Training save normalization now preserves the exact saved excavation board instead of regenerating hidden-find positions on restore.
- Added focused Training logic tests for survey-zone clue safety, board sizing, survey score, and save/restore behavior.
- Verified `node --test src\utils\gameLogic.training.test.js`, `npm.cmd run lint`, `npm.cmd run build`, and a browser Training flow from Start Training through Survey, Grid, and Excavate.
- Browser check confirmed no console errors and no horizontal layout overflow in the checked Training flow.

2026-07-03 combat air-attack slice:
- Added an airborne J attack profile to the existing Journey combat system instead of creating a new combat path.
- Airborne J now uses quicker timing, a taller downward hitbox, a small forward/downward commitment, and an air-hit result that does not prime the grounded K heavy follow-up.
- Landing an air strike refunds its small Endurance cost and gives Asha a slight lift, so jump becomes a combat answer without replacing dodge/parry/ground combos.
- Verified focused combat tests, Journey source guards, enemy sprite/combat guards, lint, and a production build.
- Next tuning target: playtest whether air J feels useful against wisps and committed enemies without making scorpion anti-air irrelevant.

2026-07-03 combat wisp-dive slice:
- Added a shared Wisp/Bat Aerial Dive combat pattern so flying enemies can actively harass Asha from above instead of waiting to be run past.
- Wisps and bats now choose the dive when Asha is close underneath them, dip downward during the swing, show a pressure cue, and leave a clear counter window afterward.
- The dive tells the player to jump-strike with J or dodge through it, giving the previous airborne attack slice a real enemy role to answer.
- Verified the new combat helper test, Journey source guards, enemy sprite/combat guards, lint, production build, and a headless browser smoke load of the app menu.
- Next tuning target: play the first Sand Wisp pocket and adjust dive range/speed if it feels unfair or too easy to outrun.

2026-07-03 combat snake-ambush slice:
- Added a shared Snake Ambush Lunge pattern so snakes can coil and attack from mid-range instead of only acting like another close-range obstacle.
- Snakes now choose the low committed lunge when Asha is near but not already in melee range, with a clear warning line: jump or dodge the lunge, then punish the miss.
- Existing snake venom-on-hit remains in the runtime, so getting clipped by the lunge has a stress consequence instead of only a small bump.
- Created a non-runtime painted Sand Viper candidate at `public/assets/expedition/enemies/candidates/sand-viper-painted-candidate-2026-07-03-alpha.png`; it is deliberately not wired until the user approves the visual direction and it is repacked into the exact runtime atlas.
- Verified combat tests, Journey source guards, enemy sprite/combat guards, lint, production build, candidate alpha metadata, and a headless browser smoke load of the app menu.
- Next tuning target: play the first Sand Snake pocket and decide whether the painted candidate should replace the current cartoonish runtime snake sheet.

2026-07-03 combat scarab-stun teaching slice:
- Kept scarabs as armored front-shell enemies, but opened their armor while stunned, skidding, or in a counter window so Asha can damage them from either side after creating the opening.
- Extended the existing jump-vault answer with a longer skid/punish window and added a perfect-dodge scarab-charge skid that uses impact, sand-skid, and counter-window effects instead of explicit tutorial text.
- Removed the scarab-specific instructional notices for frontal shell hits and venom-boosted charges so players learn from deflect/skid visuals rather than a realism-breaking message.
- Verified focused combat rules, Journey source guards, enemy sprite/combat guards, lint, production build, and a headless Chrome smoke load into the Journey canvas.

2026-05-25 update:
- Completed the UI makeover for the "Archeologist Training" screen (Training Phase).
- Implemented the "Vintage Explorer Journal" aesthetic, featuring parchment textures, leather stitched borders, and classic serif typography.
- Updated `src/index.css` to add the vintage styles to the training phase components.
- Updated `src/components/TrainingPhase.jsx` to replace `glass-card` classes with the new `vintage-panel` classes.
- Expanded the width of the game to full screen by removing max-width constraints on `.expedition-shell` and updating `.expedition-layout` to use `1fr`.
- Completely rewrote `src/components/TrainingPhase.jsx` to replace the static drag-and-drop card game with a playable "Field Certification" mini-simulation, directly teaching the player the mechanics of surveying, gridding, excavating, mapping, and lab analysis.
- Completely overhauled `src/components/DigPhase.jsx` to function as a Minesweeper-style deduction puzzle. Empty tiles reveal adjacency numbers.
