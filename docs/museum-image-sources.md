# Museum Exhibition Image Sources

This checklist covers every evidence item in `src/data.js`. Use it when sourcing images for the Phase 4 museum exhibition.

## Source Rules

- Prefer public-domain or open-access museum collection images.
- The Met Open Access collection is a strong first stop for Egypt, Rome, and China items because public-domain artwork images are released under CC0.
- Wikimedia Commons is a useful second stop, but each file page still needs its own license and attribution checked before download.
- For culturally sensitive human remains, especially Lake Mungo burials, prefer respectful context images, diagrams, landscapes, or non-human evidence rather than photographs of ancestral remains.
- Save final approved assets in `public/museum/` and update the matching `image` field in `src/data.js`.

## Current Local Assets

| File | Status |
| --- | --- |
| `museum/egypt_mummy.png` | Exists locally |
| `museum/mungo_stone_tool.png` | Exists locally |
| `museum/roman_skull.png` | Exists locally |
| `museum/roman_lead_pipe.png` | Exists locally, but no current evidence item points to it |
| `museum/china_horse_skeletons.png` | Exists locally |

## Ancient Egypt

| Evidence | Recommended image route | Best source route |
| --- | --- | --- |
| Canopic Jar | `museum/egypt_canopic_jar.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=egyptian%20canopic%20jar&showOnly=openAccess` |
| Faience Amulet | `museum/egypt_faience_amulet.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=egyptian%20faience%20scarab%20amulet&showOnly=openAccess` |
| Bronze Mirror | `museum/egypt_bronze_mirror.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=egyptian%20bronze%20mirror&showOnly=openAccess` |
| Mummified Remains | `museum/egypt_mummy.png` | Already local. If replacing, use museum/open-access mummy image with clear attribution. |
| Cat Skeleton | `museum/egypt_cat_mummy.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=egyptian%20cat%20mummy&showOnly=openAccess` |
| Worn Human Teeth | `museum/egypt_worn_teeth.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=ancient%20egyptian%20teeth%20archaeology&title=Special:MediaSearch&type=image` |
| Mudbrick Wall | `museum/egypt_mudbrick_wall.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=ancient%20egypt%20mudbrick%20wall&title=Special:MediaSearch&type=image` |
| Limestone Block | `museum/egypt_limestone_block.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=ancient%20egypt%20limestone%20block&title=Special:MediaSearch&type=image` |
| Tomb Shaft | `museum/egypt_tomb_shaft.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=ancient%20egypt%20tomb%20shaft&title=Special:MediaSearch&type=image` |
| Flax Seeds | `museum/egypt_flax_seeds.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=flax%20seeds%20archaeobotany&title=Special:MediaSearch&type=image` |
| Nile Silt Layer | `museum/egypt_nile_silt_layer.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Nile%20silt%20soil%20layer&title=Special:MediaSearch&type=image` |
| Dried Papyrus Reeds | `museum/egypt_papyrus_reeds.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=papyrus%20reeds%20Egypt&title=Special:MediaSearch&type=image` |
| Papyrus Scroll | `museum/egypt_papyrus_scroll.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=egyptian%20papyrus%20scroll&showOnly=openAccess` |
| Hieroglyph Carving | `museum/egypt_hieroglyphs.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=egyptian%20hieroglyph%20carving&showOnly=openAccess` |
| Ostracon | `museum/egypt_ostracon.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=egyptian%20ostracon&showOnly=openAccess` |

## Lake Mungo / Indigenous Australia

| Evidence | Recommended image route | Best source route |
| --- | --- | --- |
| Silcrete Stone Tool | `museum/mungo_stone_tool.png` | Already local. If replacing, use a verified museum or public-domain stone-tool image. |
| Grinding Stone | `museum/mungo_grinding_stone.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Aboriginal%20grinding%20stone&title=Special:MediaSearch&type=image` |
| Ochre Fragment | `museum/mungo_ochre_fragment.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=red%20ochre%20archaeology&title=Special:MediaSearch&type=image` |
| Ritual Burial Skeleton | `museum/mungo_ochre_burial.png` | Sensitive: prefer a respectful Lake Mungo landscape/context image or a simple diagram, not a human-remains photo. Search route: `https://commons.wikimedia.org/w/index.php?search=Lake%20Mungo%20landscape&title=Special:MediaSearch&type=image` |
| Cremated Bones | `museum/mungo_cremation_context.png` | Sensitive: use a neutral cremation-burial diagram or context image. Search route: `https://commons.wikimedia.org/w/index.php?search=archaeological%20cremation%20burial%20diagram&title=Special:MediaSearch&type=image` |
| Megafauna Bone | `museum/mungo_megafauna_bone.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Australian%20megafauna%20bone%20fossil&title=Special:MediaSearch&type=image` |
| Ancient Hearth | `museum/mungo_ancient_hearth.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=archaeological%20hearth%20stone%20circle&title=Special:MediaSearch&type=image` |
| Fossilized Footprints | `museum/mungo_footprints.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Willandra%20Lakes%20fossil%20footprints&title=Special:MediaSearch&type=image` |
| Stone Fish Trap | `museum/mungo_stone_fish_trap.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Aboriginal%20stone%20fish%20trap&title=Special:MediaSearch&type=image` |
| Shell Midden | `museum/mungo_shell_midden.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=shell%20midden%20archaeology%20Australia&title=Special:MediaSearch&type=image` |
| Emu Egg Shells | `museum/mungo_emu_egg_shells.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=emu%20eggshell%20archaeology&title=Special:MediaSearch&type=image` |
| Lake Silt Layer | `museum/mungo_lake_silt_layer.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Lake%20Mungo%20sediment%20layers&title=Special:MediaSearch&type=image` |
| Hand Stencil Rock Art | `museum/mungo_hand_stencil.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Australian%20Aboriginal%20hand%20stencil%20rock%20art&title=Special:MediaSearch&type=image` |
| Carved Boab Nut | `museum/mungo_carved_boab_nut.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=carved%20boab%20nut&title=Special:MediaSearch&type=image` |
| Ceremonial Stone Arrangement | `museum/mungo_stone_arrangement.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Aboriginal%20stone%20arrangement&title=Special:MediaSearch&type=image` |

## Ancient Rome

| Evidence | Recommended image route | Best source route |
| --- | --- | --- |
| Bronze Sestertius | `museum/roman_coin.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=roman%20sestertius&showOnly=openAccess` |
| Gladius | `museum/roman_gladius.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=roman%20gladius&showOnly=openAccess` |
| Samian Ware | `museum/roman_samian_ware.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Samian%20ware%20Roman%20pottery&title=Special:MediaSearch&type=image` |
| Gladiator Skull | `museum/roman_skull.png` | Already local. If replacing, use a respectful museum image with clear license. |
| Cremation Urn Ashes | `museum/roman_cremation_urn.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=roman%20cremation%20urn&showOnly=openAccess` |
| Lead Isotope Teeth | `museum/roman_teeth.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=archaeological%20teeth%20isotope%20analysis&title=Special:MediaSearch&type=image` |
| Aqueduct Arch | `museum/roman_aqueduct.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Roman%20aqueduct%20arch&title=Special:MediaSearch&type=image` |
| Hypocaust | `museum/roman_hypocaust.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Roman%20hypocaust&title=Special:MediaSearch&type=image` |
| Mosaic Floor | `museum/roman_mosaic_floor.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=roman%20mosaic%20floor&showOnly=openAccess` |
| Volcanic Ash Layer | `museum/roman_volcanic_ash.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Pompeii%20volcanic%20ash%20layer&title=Special:MediaSearch&type=image` |
| Olive Pits | `museum/roman_olive_pits.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=ancient%20olive%20pits%20archaeology&title=Special:MediaSearch&type=image` |
| Dormouse Bones | `museum/roman_dormouse_bones.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Roman%20dormouse%20archaeology&title=Special:MediaSearch&type=image` |
| Wax Tablet | `museum/roman_wax_tablet.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Roman%20wax%20tablet&title=Special:MediaSearch&type=image` |
| Monumental Inscription | `museum/roman_inscription.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=roman%20inscription%20marble&showOnly=openAccess` |
| Carbonized Scroll | `museum/roman_carbonized_scroll.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Herculaneum%20carbonized%20scroll&title=Special:MediaSearch&type=image` |

## Ancient China

| Evidence | Recommended image route | Best source route |
| --- | --- | --- |
| Bronze Ding | `museum/china_bronze_ding.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=Chinese%20bronze%20ding&showOnly=openAccess` |
| Terracotta Fragment | `museum/china_terracotta.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Terracotta%20Army%20fragment&title=Special:MediaSearch&type=image` |
| Jade Ornament | `museum/china_jade_ornament.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=Chinese%20jade%20ornament&showOnly=openAccess` |
| Chariot Horse Skeletons | `museum/china_horse_skeletons.png` | Already local. If replacing, use a tomb/chariot-horse image with clear license. |
| Silk-Wrapped Bones | `museum/china_silk_fibres.png` | Sensitive: use silk textile/fibre imagery rather than exposed human remains. The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=Chinese%20silk%20textile&showOnly=openAccess` |
| Laborer Skeletons | `museum/china_wall_laborers_context.png` | Sensitive: use Great Wall/rammed-earth construction context rather than human remains. Search route: `https://commons.wikimedia.org/w/index.php?search=Great%20Wall%20rammed%20earth%20construction&title=Special:MediaSearch&type=image` |
| Rammed Earth Wall | `museum/china_rammed_earth_wall.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Chinese%20rammed%20earth%20wall&title=Special:MediaSearch&type=image` |
| Wooden Pagoda Foundation | `museum/china_pagoda_foundation.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Chinese%20wooden%20pagoda%20foundation&title=Special:MediaSearch&type=image` |
| Ceramic Kiln | `museum/china_ceramic_kiln.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Chinese%20ceramic%20kiln%20archaeology&title=Special:MediaSearch&type=image` |
| Rice Grains | `museum/china_rice_grains.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=ancient%20rice%20grains%20archaeology&title=Special:MediaSearch&type=image` |
| Mulberry Leaves | `museum/china_mulberry_leaves.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=mulberry%20leaves%20silkworms&title=Special:MediaSearch&type=image` |
| Millet Seeds | `museum/china_millet_seeds.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=millet%20seeds%20archaeology&title=Special:MediaSearch&type=image` |
| Oracle Bone | `museum/china_oracle_bone.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=Chinese%20oracle%20bone&showOnly=openAccess` |
| Bamboo Slips | `museum/china_bamboo_slips.png` | Wikimedia Commons media search: `https://commons.wikimedia.org/w/index.php?search=Chinese%20bamboo%20slips&title=Special:MediaSearch&type=image` |
| Bronze Inscription | `museum/china_bronze_inscription.png` | The Met Open Access search: `https://www.metmuseum.org/art/collection/search?q=Chinese%20bronze%20inscription&showOnly=openAccess` |

