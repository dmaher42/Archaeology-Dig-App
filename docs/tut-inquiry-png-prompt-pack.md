# Cold Case: KV62 — AI PNG generation prompt pack

Every PNG the Tutankhamun investigation mode needs that we could **not** source as a real
public-domain photo. Hand each prompt to your image AI (Midjourney, DALL·E, SDXL, etc.).

Real photos are already downloaded and placed — see
`public/assets/tut-inquiry/ATTRIBUTIONS.md`. Generate only the assets listed here.

---

## How to use this pack

1. **Keep the house style.** Paste the **Shared style preamble** at the front of *every*
   prompt so the whole mode looks like one product.
2. **Respect transparency.** Where a row says `alpha: yes`, generate on a plain background
   and cut it out, then run the project's de-fringe script so no white halo survives:
   `python scripts/strip_prop_white_fringe.py <file>` (same script used for journey props).
3. **Save to the path in each row** (under `public/assets/tut-inquiry/`). Filenames match the
   paths already referenced in `src/components/tut-inquiry/tutInquiryData.js`.
4. **Sensitivity rule (non-negotiable).** Human remains are shown only as *stylised scan
   reconstructions*, never as graphic photos of the real mummy. The CT/X-ray cards below are
   deliberately clinical and bloodless. This follows the rule already in
   `docs/museum-image-sources.md`.
5. **Aspect/size** are targets; generate larger and downscale for crispness.

### Shared style preamble (prepend to every prompt)

> Semi-realistic, photoreal-leaning digital illustration for an educational archaeology
> detective game. Warm museum lighting, fine detail, believable materials, restrained
> realism (not cartoon, not glossy 3D render). Muted desert-and-archive palette: sandstone,
> aged paper, deep lapis blue, oxidised brass, ember orange accents. Cohesive single art
> direction across the set. No text, no watermarks, no UI elements unless explicitly asked.

### Global negative prompt (append to every prompt)

> cartoon, anime, flat vector, neon, oversaturated, lens flare, text, watermark, signature,
> caption, logo, modern clothing on ancient figures, gore, blood, distressing imagery,
> distorted anatomy, extra fingers, low-res, jpeg artifacts.

---

## 1. Evidence card art — the AI-generated cards

Square-ish, framed within the card UI later. `512×512` unless noted. `alpha: no` (full-bleed
art, the card frame is drawn over it).

> The six **real-photo** evidence cards (malaria smear, floral collar, chariots, Hittite
> tablet, golden throne, Amarna colossus, KV55 skull) are already placed — do NOT regenerate.

### 1a. `evidence/ct-skull-postmortem.png` — "Skull fragments are post-mortem"
> [preamble] A clinical CT-scan reconstruction of an ancient Egyptian skull in profile,
> rendered as a translucent grey-blue medical volume render on a black radiology background.
> The skull is intact and undamaged. A few small loose bone fragments rest in the lower
> cavity, clearly separate and clean-edged. Faint horizontal scan-slice lines cross the
> image. Cold cyan-on-black clinical look, calm and scientific. No face, no skin, no soft
> tissue. `512×512`.

### 1b. `evidence/ct-femur-fracture.png` — "Fractured left thigh bone"
> [preamble] A CT-scan reconstruction of a single human thigh bone (femur) on a black
> radiology background, grey-blue translucent bone. A clean break crosses the lower shaft
> near the knee; a faint amber-coloured material (embalming resin) is visible seeping into
> the fracture line. Scan-slice grid faintly overlaid. Clinical, bloodless, scientific.
> `512×512`.

### 1c. `evidence/ct-club-foot.png` — "Club foot and bone necrosis"
> [preamble] A CT-scan reconstruction of a human foot skeleton on a black radiology
> background, grey-blue translucent bone. The foot is visibly turned inward (club foot); one
> or two small bones show a darker, mottled patch indicating necrosis. Faint scan lines.
> Clinical and calm. `512×512`.

### 1d. `evidence/crushed-chest.png` — "Missing ribs, sternum and heart"
> [preamble] A CT-scan reconstruction of a human ribcage in front view on a black radiology
> background, grey-blue translucent bone. The front ribs and breastbone are absent, leaving a
> dark hollow at the centre of the chest. Neutral, diagnostic, not gory. Faint scan-slice
> overlay. `512×512`.

### 1e. `evidence/xray-skull-fragments.png` — "Bone fragments inside the skull" (the 1968 card)
> [preamble] An aged 1960s-style black-and-white medical X-ray film of a human skull in
> profile, grainy, slightly yellowed at the edges as if photographed from an old light-box.
> Inside the skull a couple of bright loose fragments are visible. Vintage radiograph look,
> deliberately lower-tech and older-feeling than a modern CT image. No text. `512×512`.

### 1f. `evidence/walking-sticks.png` — "130 walking sticks and staves"
> [preamble] A semi-realistic still life of several ancient Egyptian wooden walking staves
> and ceremonial canes leaning together, some with gold-banded and inlaid handles, a few
> showing genuine wear at the tip. Warm tomb lighting against a dim sandstone wall, shallow
> depth of field. Museum-catalogue feel. `512×512`.

### 1g. `evidence/dismemberment-1925.png` — "The 1925 examination dismembered the body"
> [preamble] A 1920s sepia-toned archival scene: a cluttered excavation worktable with
> linen wrappings, conservation tools, brushes, glass plates and handwritten record cards
> under a hanging lamp. Suggests careful but invasive early examination. NO human remains
> visible — imply the work through tools and notes only. Grainy vintage photograph look.
> `512×512`.

### 1h. `evidence/burton-photo-chest.png` — "Burton's 1926 photo shows the chest intact" (hidden keystone)
> [preamble] A 1926 black-and-white archival archaeology photograph in Harry Burton's style:
> a glass photographic plate showing a beaded ceremonial chest covering of a royal mummy
> still complete and in place, with a small numbered excavation tag beside it. Crisp vintage
> monochrome, slight plate scratches and vignetting. Conveys "documentary evidence". No gore,
> beadwork and linen only. `512×512`.

### 1i. `evidence/dna-incest-kv35.png` — second parent plate (pairs with the real KV55 skull)
> [preamble] A clean early-20th-century scientific plate illustration of an ancient mummy
> skull in right profile against a neutral plate background, in the restrained academic style
> of 1912 anatomical survey figures, soft grey tones. Pairs visually with a matching skull
> plate. Respectful, scientific, non-graphic. `512×512`.

---

## 2. Expert & rival portraits

Consistent set, same lighting and framing, head-and-shoulders, modern present-day forensic/
academic professionals in a lab or archive setting. `512×640` portrait. `alpha: yes`
(cut out for placement over UI). Generate **2–3 expression variants** of each where noted
(neutral / explaining / concerned) using the same seed/character.

| File | Character brief |
| --- | --- |
| `experts/radiologist.png` | Dr. Nadia Halim, 40s, radiologist, in scrubs with a lanyard, standing by a glowing CT console, calm and precise. |
| `experts/geneticist.png` | Dr. Marcus Owusu, 30s–40s, geneticist, white lab coat, nitrile gloves, holding a pipette near a gel tray, thoughtful. |
| `experts/pathologist.png` | Dr. Elena Sokolova, 50s, forensic pathologist, lab coat, reading glasses pushed up, sceptical and rigorous expression. |
| `experts/egyptologist.png` | Dr. Sarah Whitfield, 40s, Egyptologist, field shirt and scarf, surrounded by archive boxes and photographs, warm and curious. |
| `experts/botanist.png` | Dr. Idris Farouk, 30s, archaeobotanist, holding a tray of dried plant specimens and tweezers, gentle and focused. |
| `experts/conservator.png` | Dr. Leila Mansour, 40s, conservator, apron and magnifier visor, careful and exacting. |
| `experts/rival.png` | Prof. Adrian Vance, 50s–60s, rival investigator, tweed jacket, theatrical and confident, slightly antagonistic — the "boss" of the inquest. |

> [preamble] Present-day professional head-and-shoulders portrait, semi-realistic painterly
> realism, soft key light from one side, shallow depth of field, neutral lab/archive
> background slightly blurred. Diverse, believable, dignified. Consistent style across the
> whole cast. Plain backdrop for clean cut-out. `512×640`, transparent-ready.

---

## 3. Scene backgrounds

Wide environment plates the stations and inquest sit on. `1920×1080`, `alpha: no`.
Leave the lower third visually calmer for UI overlay.

### 3a. `scenes/scan-suite.png`
> [preamble] Interior of a modern Egyptian museum CT-scan suite at night: a large medical CT
> scanner with a softly glowing gantry, a draped examination table (empty), monitors showing
> faint blue scan slices, cables, sandstone-coloured walls with a hint of ancient motifs.
> Ancient-meets-modern mood, cinematic but calm. Empty of people. `1920×1080`.

### 3b. `scenes/dna-lab.png`
> [preamble] Interior of a modern genetics laboratory: clean benches, sequencing machines,
> a backlit gel-electrophoresis tray glowing faint blue, racks of sample tubes, soft clinical
> lighting with warm accents. A single small ancient artefact in a sealed case on the bench
> ties it to Egypt. Empty of people. `1920×1080`.

### 3c. `scenes/records-room.png`
> [preamble] A 1920s-meets-present archive records room: tall wooden shelves of boxed
> excavation records, a large desk strewn with sepia photographs, magnifier, a brass lamp
> pooling warm light, framed Burton-style tomb prints on the wall. Scholarly, dusty, inviting.
> Empty of people. `1920×1080`.

### 3d. `scenes/inquest-chamber.png`
> [preamble] A dim lecture-theatre / inquiry chamber: a long table, a projection screen
> faintly showing a CT skull, empty chairs in shadow, one spotlight on a lectern. Tense,
> formal, debate-ready mood. Deep blues and warm lamp accents. Empty of people. `1920×1080`.

### 3e. `scenes/evidence-board-bg.png`
> [preamble] A large cork pinboard wall in a dim study, warm lamplight, faint shadows, empty
> and ready to be filled with pinned cards and red string. Subtle texture, calm neutral
> surface so bright cards read on top. `1920×1080`.

---

## 4. Sepia 1922 prologue frames

A short cinematic intro. `1600×900`, `alpha: no`, deliberately aged. We have **real** Burton
photos for most of this (`prologue/`), so generate only these stylised connective frames:

### 4a. `prologue/title-card.png`
> [preamble] A sepia-toned 1920s title frame: the dark doorway of a freshly opened tomb with
> a sliver of golden light spilling out, dust motes in the beam, an oil lamp at the threshold.
> Aged photograph grain, vignette. Evocative, reverent, mysterious. No text. `1600×900`.

### 4b. `prologue/handoff-modern.png`
> [preamble] A match-cut frame bridging past and present: the left half a sepia 1920s tomb
> photograph, the right half the same view rendered as a cool modern museum scan-lab, split
> down the middle. Conveys "the case re-opens today". `1600×900`.

---

## 5. UI atlas — `shared/tut-inquiry-ui-pack.png` (+ `.json`)

Single packed sprite atlas, mirroring `public/assets/full-investigation/shared/`. Generate
each region on transparent background (`alpha: yes`), then pack with the same tooling used for
the existing UI pack and write the matching `.json` region map. Region keys below match the
loader's expected-keys list (to be added in `tutInquiryAssets.js`).

| Region key | What to generate | Size |
| --- | --- | --- |
| `corkboardPanel` | Seamless cork-texture panel | 1024×768 |
| `evidenceCardFrame` | Aged-paper evidence card frame, pinhole at top, slot for art + caption | 360×480 |
| `evidenceCardBack` | Reverse of an evidence card, subtle dossier crest | 360×480 |
| `redString` | A length of taut red wool string with slight fray (tileable ends) | 512×32 |
| `pushPin` | A brass push-pin, top-down, small shadow | 64×64 |
| `stampContested` | Rubber-stamp mark reading-style **CONTESTED** in muted red, angled, distressed ink | 256×128 |
| `stampVerified` | Same style, teal-green, **VERIFIED** | 256×128 |
| `stampDebunked` | Same style, dark red, **DEBUNKED** | 256×128 |
| `dossierFolderCoral` | Manila case-file folder, coral tab (Murder) | 420×300 |
| `dossierFolderAmber` | Folder, amber tab (Accident) | 420×300 |
| `dossierFolderPurple` | Folder, purple tab (Frail health) | 420×300 |
| `dossierFolderTeal` | Folder, teal tab (Disease) | 420×300 |
| `dossierFolderGray` | Folder, grey tab (the Curse / folk) | 420×300 |
| `confidenceGauge` | Horizontal brass-framed meter, empty, for theory confidence bars | 480×64 |
| `ctConsoleBezel` | Dark medical-monitor bezel to frame the scan minigame | 1024×640 |
| `dnaGelFrame` | Backlit gel-tray frame with empty lanes for the band-match minigame | 1024×512 |
| `fieldJournalCover` | Worn leather field-journal cover, brass corner | 600×800 |
| `reportPage` | Clean report page with faint ruled sections (Field Report export) | 800×1100 |
| `archivePhotoFrame` | White-bordered vintage photo frame for Burton stills | 420×360 |
| `magnifier` | A round glass magnifier with brass rim (cross-reference tool) | 256×256 |

> [preamble] Single UI element on a transparent background, semi-realistic material rendering
> (paper, cork, brass, leather, glass), soft contact shadow, no text unless the row names a
> stamp word. Consistent lighting top-left. Crisp edges for clean atlas packing.

For the three **stamp** regions, the stamp word IS allowed as part of the art — render it as a
distressed rubber-stamp impression, slightly uneven ink, all-caps.

---

## 6. Menu card — `assets/menu/mode_tut_inquiry_art.png`

The fifth activity card on the main menu. **`1024×1024`, `alpha: no`** — matches the existing
`mode_*_art.png` cards exactly.

> [preamble] Key art for a game mode select card titled (conceptually) "Cold Case: KV62".
> The golden funerary mask of an Egyptian boy-king resting inside the glowing ring of a modern
> CT scanner gantry — ancient gold meeting cold blue medical light in one striking image.
> Wisps of scan-light cross the mask. Dramatic, premium, museum-at-night mood. Centred
> composition with room at the edges. Semi-realistic, photoreal-leaning. No text. `1024×1024`.

---

## Generation checklist

- [ ] 9 evidence card arts (§1a–1i)
- [ ] 7 portraits (§2) — plus optional expression variants
- [ ] 5 scene backgrounds (§3)
- [ ] 2 prologue connective frames (§4) — rest are real Burton photos
- [ ] ~20 UI atlas regions (§5) → pack into `tut-inquiry-ui-pack.png` + `.json`
- [ ] 1 menu card (§6)
- [ ] Run `strip_prop_white_fringe.py` on every `alpha: yes` asset
- [ ] Drop finished files at the exact paths above; paths already wired in `tutInquiryData.js`
