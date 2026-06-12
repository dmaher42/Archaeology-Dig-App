/**
 * Cold Case: KV62 — Tutankhamun investigation mode content.
 *
 * Phase 1 deliverable: the full investigation as plain, reviewable data.
 * No rendering here — components in TutInquiryMode.jsx consume this file the
 * same way the archaeology modes consume src/data.js.
 *
 * Design brief: docs/tut-mysterious-death-mode-design-brief.md
 * Curriculum anchor: Curicculum Docs/HASS_History_yr7_unit1_InvestigatingTheAncientPast.pdf
 *   ("Tutankhamun: A mysterious death" unit sequence).
 *
 * CONTENT-ACCURACY NOTE: the facts below reflect the mainstream published
 * findings (Harrison 1968 X-ray; Hawass et al. 2005 CT survey; Hawass et al.
 * 2010 JAMA DNA & malaria study) and the curriculum's own listed sources.
 * Re-verify any figure flagged with `// verify:` against the unit's sources
 * during the content review before the art/build phases.
 */

// ─────────────────────────────────────────────────────────────────────────────
// THEORIES — one per curriculum investigation prompt, plus a "folk" theory that
// exists to be dismantled (teaches source criticism by play, not by lecture).
// ─────────────────────────────────────────────────────────────────────────────

export const TUT_THEORIES = [
  {
    id: 'murder',
    label: 'Murder or assassination',
    color: 'coral',
    short: 'Tut was killed — a blow to the head, or a court plot.',
    leadExpertId: 'pathologist',
    dossierBriefing:
      'For decades a shadow on a 1968 X-ray was read as a fatal blow to the back of the '
      + 'skull. A boy king with no heir, a scheming court, a successor who seized the throne '
      + 'within days — the motive writes itself. Your job is to find out whether the body '
      + 'agrees with the story.',
    // Closing line shown if the player commits to this single theory.
    verdictNote:
      'The physical case for murder collapsed under the CT scanner. The "blow" was loose '
      + 'bone broken after death, during embalming or modern handling. The motive is real, '
      + 'the wound is not.',
  },
  {
    id: 'accident',
    label: 'A fall or accident',
    color: 'amber',
    short: 'A hunting or chariot accident broke his leg and led to death.',
    leadExpertId: 'radiologist',
    dossierBriefing:
      'Six chariots and a hoard of hunting gear were buried with him. The CT survey found a '
      + 'fresh break in the left thigh bone, with embalming resin seeping into the wound — an '
      + 'injury suffered in life, days before death. Did a crash or a fall start the chain '
      + 'that killed him?',
    verdictNote:
      'A genuine pre-death leg fracture is the strongest physical evidence on the table. '
      + 'On its own it need not be fatal — but an open break in an already-frail king is the '
      + 'spark that the disease evidence turns into a fire.',
  },
  {
    id: 'frailty',
    label: 'Frail health and inbreeding',
    color: 'purple',
    short: 'A weak body, deformed foot and inherited disorders from inbreeding.',
    leadExpertId: 'geneticist',
    dossierBriefing:
      'DNA from the royal mummies shows Tut\'s parents were brother and sister. The CT scan '
      + 'found a club foot, bone necrosis and a cleft palate. The tomb held 130 walking '
      + 'sticks. Was the king simply too fragile to survive a shock his body could not absorb?',
    verdictNote:
      'The inbreeding and the deformities are well evidenced and explain a frail king who '
      + 'walked with a cane. Frailty is rarely a sole cause of death — but it is the '
      + 'background condition that links every other theory together.',
  },
  {
    id: 'disease',
    label: 'Disease',
    color: 'teal',
    short: 'Malaria — its DNA was recovered from his tissues.',
    leadExpertId: 'geneticist',
    dossierBriefing:
      'In 2010 genetic tests found the DNA of Plasmodium falciparum — the deadliest malaria '
      + 'parasite — in Tut\'s remains, in more than one strain. Malaria was common and often '
      + 'fatal. Did infection, alone or on top of his other troubles, end the boy king\'s life?',
    verdictNote:
      'Severe malaria is firmly evidenced and was a real killer in ancient Egypt. The '
      + 'leading modern reading is not malaria alone but malaria striking a frail body '
      + 'already weakened by an infected broken leg.',
  },
  {
    id: 'curse',
    label: 'The pharaoh\'s curse',
    color: 'gray',
    short: 'A folk theory — included so you can take it apart.',
    leadExpertId: 'egyptologist',
    isFolkTheory: true,
    dossierBriefing:
      'Newspapers in the 1920s sold the story of a deadly curse on those who disturbed the '
      + 'tomb. This dossier is not here to be proved. It is here for you to test against '
      + 'evidence and expert reasoning — and to show how a good story can outrun the facts.',
    verdictNote:
      'No evidence supports a curse. The deaths attributed to it were ordinary, spread over '
      + 'many years, and statistically unremarkable. Dismantling the curse with sources is '
      + 'itself a lesson in how history resists a tidy story.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EXPERTS — each pairs a human role with a signature technology, the exact pair
// the curriculum asks students to identify.
// ─────────────────────────────────────────────────────────────────────────────

export const TUT_EXPERTS = [
  {
    id: 'radiologist',
    name: 'Dr. Nadia Halim',
    role: 'Radiologist',
    technology: 'CT scanner',
    station: 'scanSuite',
    portrait: 'assets/tut-inquiry/experts/radiologist.png',
    intro:
      'The scanner sees what the bandages hide. We took over 1,700 cross-section images of '
      + 'the king without unwrapping him. Read the bones — but remember a broken bone cannot '
      + 'tell you, by itself, whether the break happened before death or long after.',
    glossaryIds: ['ct-scan', 'compound-fracture'],
  },
  {
    id: 'geneticist',
    name: 'Dr. Marcus Owusu',
    role: 'Geneticist',
    technology: 'DNA sequencing',
    station: 'dnaLab',
    portrait: 'assets/tut-inquiry/experts/geneticist.png',
    intro:
      'Ancient DNA is fragile and easily contaminated, so we test, re-test, and control for '
      + 'our own DNA. Two questions: who were his parents, and what was living in his blood? '
      + 'Both answers are written in the same molecule.',
    glossaryIds: ['inbreeding', 'malaria', 'tutankhamun-syndrome'],
  },
  {
    id: 'pathologist',
    name: 'Dr. Elena Sokolova',
    role: 'Forensic pathologist',
    technology: 'Autopsy and trauma analysis',
    station: 'scanSuite',
    portrait: 'assets/tut-inquiry/experts/pathologist.png',
    intro:
      'In a forensic case the first thing I ask of any injury is: peri-mortem or '
      + 'post-mortem? Around the time of death, or after? Get that wrong and you can invent '
      + 'a murder that never happened.',
    glossaryIds: ['contestability', 'assassination', 'compound-fracture'],
  },
  {
    id: 'egyptologist',
    name: 'Dr. Sarah Whitfield',
    role: 'Egyptologist',
    technology: 'Archives and inscriptions',
    station: 'recordsRoom',
    portrait: 'assets/tut-inquiry/experts/egyptologist.png',
    intro:
      'Carter recorded over 5,000 objects, and Harry Burton photographed the tomb as it was '
      + 'opened. Those photographs are evidence in their own right — they freeze a moment we '
      + 'can never see again. Compare what the records say against what the body shows.',
    glossaryIds: ['theory', 'contestability'],
  },
  {
    id: 'botanist',
    name: 'Dr. Idris Farouk',
    role: 'Archaeobotanist',
    technology: 'Plant-remains analysis',
    station: 'recordsRoom',
    portrait: 'assets/tut-inquiry/experts/botanist.png',
    intro:
      'A collar of real flowers and fruit was placed on the coffin. Those species only '
      + 'bloom or ripen at certain times of year. Plants can tell you the season of a burial '
      + 'as surely as a calendar.',
    glossaryIds: [],
  },
  {
    id: 'conservator',
    name: 'Dr. Leila Mansour',
    role: 'Conservator',
    technology: 'Embalming and damage assessment',
    station: 'scanSuite',
    portrait: 'assets/tut-inquiry/experts/conservator.png',
    intro:
      'Resin, heat, linen, and the rough handling of 1925 all left marks on this body. '
      + 'Before you call any damage an injury, ask whether the embalmers — or later '
      + 'examiners — caused it. Much of what looks violent is simply preservation.',
    glossaryIds: ['contestability'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVIDENCE CARDS — the deck the player collects across the three stations and
// pins to the board. `links` gives each theory a weight in [-3..+3]:
//   positive  = supports that theory
//   negative  = weakens it
// `contestsCardId` + `whenContested` model contestability: collecting a newer,
// higher-reliability card can flip an older one to a contested state, changing
// its links. This is the curriculum's core concept made into the core mechanic.
// ─────────────────────────────────────────────────────────────────────────────

export const TUT_EVIDENCE = [
  {
    id: 'xray-skull-fragments',
    title: 'Bone fragments inside the skull',
    station: 'scanSuite',
    source: 'X-ray examination, R. Harrison',
    year: 1968,
    reliability: 2, // superseded by later imaging
    tech: 'X-ray',
    expertId: 'pathologist',
    image: 'assets/tut-inquiry/evidence/xray-skull-fragments.png',
    summary:
      'An X-ray shows loose pieces of bone inside the skull cavity. For decades this was '
      + 'read as proof of a blow to the back of the head.',
    detail:
      'A 1968 X-ray of the head revealed detached bone fragments. Sensational reports turned '
      + 'this into a murder weapon: someone struck the young king from behind. But an X-ray '
      + 'is a flat shadow — it cannot show when the bone broke.',
    links: { murder: 3, accident: 0, frailty: 0, disease: 0, curse: 0 },
    contestedBy: 'ct-skull-postmortem',
    whenContested: {
      links: { murder: -1, accident: 0, frailty: 0, disease: 0, curse: 0 },
      note:
        'Overturned by the 2005 CT scan: the fragments broke loose AFTER death, during '
        + 'embalming or modern handling — not from a blow in life.',
    },
  },
  {
    id: 'ct-skull-postmortem',
    title: 'Skull fragments are post-mortem',
    station: 'scanSuite',
    source: 'CT survey, Z. Hawass et al.',
    year: 2005,
    reliability: 5,
    tech: 'CT scan',
    expertId: 'radiologist',
    image: 'assets/tut-inquiry/evidence/ct-skull-postmortem.png',
    summary:
      'The CT scan shows no sign of a head wound. The loose fragments have no healing and '
      + 'no embalming resin on them — they broke after death.',
    detail:
      'High-resolution CT imaging found the skull intact with no fracture that occurred in '
      + 'life. The fragments matched bone broken during the mummification process or by the '
      + '1925 examination. The famous "murder blow" was an artefact of handling.',
    links: { murder: -2, accident: 0, frailty: 0, disease: 0, curse: -1 },
    debunks: 'xray-skull-fragments',
    keystone: true, // a major "myth buster" card
  },
  {
    id: 'ct-femur-fracture',
    title: 'Fractured left thigh bone',
    station: 'scanSuite',
    source: 'CT survey, Z. Hawass et al.',
    year: 2005,
    reliability: 5,
    tech: 'CT scan',
    expertId: 'radiologist',
    image: 'assets/tut-inquiry/evidence/ct-femur-fracture.png',
    summary:
      'A break in the left femur, just above the knee, with embalming resin inside the '
      + 'wound — meaning the skin was broken and the injury happened shortly before death.',
    detail:
      'The CT scan revealed a fracture of the left femur with no sign of healing, and '
      + 'embalming material had entered the break. That points to a compound fracture suffered '
      + 'in the last days of life — a serious open wound, wide open to infection.',
    links: { murder: 0, accident: 3, frailty: 1, disease: 1, curse: 0 },
  },
  {
    id: 'ct-club-foot',
    title: 'Club foot and bone necrosis',
    station: 'scanSuite',
    source: 'CT survey + 2010 study',
    year: 2010,
    reliability: 5,
    tech: 'CT scan',
    expertId: 'radiologist',
    image: 'assets/tut-inquiry/evidence/ct-club-foot.png',
    summary:
      'The left foot is club-shaped and shows Köhler disease — bone tissue dying from poor '
      + 'blood supply. Walking would have been painful.',
    detail:
      'Imaging showed a deformed left foot and necrosis (death) of bones in the foot. The '
      + 'king likely needed support to walk — which fits the many staves and canes found in '
      + 'the tomb, several showing wear.',
    links: { murder: 0, accident: 1, frailty: 3, disease: 0, curse: 0 },
  },
  {
    id: 'dna-malaria',
    title: 'Malaria parasite DNA',
    station: 'dnaLab',
    source: 'DNA study, Hawass et al., JAMA',
    year: 2010,
    reliability: 5,
    tech: 'DNA sequencing',
    expertId: 'geneticist',
    image: 'assets/tut-inquiry/evidence/dna-malaria.jpg', // real: P. falciparum blood smear (PD)
    summary:
      'Genes of Plasmodium falciparum — the deadliest malaria parasite — were found in '
      + 'Tut\'s tissues, in more than one strain.',
    detail:
      'The DNA screen detected multiple genes of the malaria parasite. Severe malaria can '
      + 'kill outright, or it can be the final blow to a body already fighting another '
      + 'serious injury such as an open fracture.',
    links: { murder: 0, accident: 0, frailty: 1, disease: 3, curse: 0 },
  },
  {
    id: 'dna-incest',
    title: 'Parents were full siblings',
    station: 'dnaLab',
    source: 'DNA kinship study (KV55 + KV35 Younger Lady)',
    year: 2010,
    reliability: 5,
    tech: 'DNA sequencing',
    expertId: 'geneticist',
    image: 'assets/tut-inquiry/evidence/dna-incest-kv55.png', // real: KV55 skull plate (PD); pair with KV35 in UI
    imageSecondary: 'assets/tut-inquiry/evidence/dna-incest-kv35.png', // AI/real composite — see prompt pack
    summary:
      'DNA matching of the royal mummies shows Tut\'s father and mother were brother and '
      + 'sister.',
    detail:
      'Comparing genetic markers across the royal mummies identified the KV55 body and the '
      + '"Younger Lady" from KV35 as full siblings — and as Tut\'s parents. Children of such '
      + 'close inbreeding face a higher risk of inherited disorders and frailty.',
    links: { murder: 0, accident: 0, frailty: 3, disease: 0, curse: 0 },
  },
  {
    id: 'walking-sticks',
    title: '130 walking sticks and staves',
    station: 'recordsRoom',
    source: "Carter's tomb inventory",
    year: 1922,
    reliability: 4,
    tech: 'Archive / catalogue',
    expertId: 'egyptologist',
    image: 'assets/tut-inquiry/evidence/walking-sticks.png',
    summary:
      'The tomb held about 130 walking sticks and staves, some worn from use.', // verify: count
    detail:
      'Among the thousands of objects were roughly 130 sticks and staves. Some show wear at '
      + 'the tip and handle. They may have been needed for a king who could not walk '
      + 'unaided — though staves were also royal symbols of authority, so this is contestable.',
    links: { murder: 0, accident: 0, frailty: 2, disease: 0, curse: 0 },
    contestable: true, // can be read as status symbol, not medical aid
  },
  {
    id: 'chariots',
    title: 'Six chariots and hunting gear',
    station: 'recordsRoom',
    source: "Carter's tomb inventory",
    year: 1922,
    reliability: 4,
    tech: 'Archive / catalogue',
    expertId: 'egyptologist',
    image: 'assets/tut-inquiry/evidence/chariots.jpg', // real: Burton antechamber chariots photo (PD)
    summary:
      'Six dismantled chariots plus bows, arrows and hunting equipment were buried with the '
      + 'king.',
    detail:
      'The tomb contained six chariots and an arsenal of hunting weapons. Some read this as '
      + 'an active, riding, hunting king — and so a candidate for a chariot or hunting '
      + 'accident. Others note these were standard royal grave goods, ceremonial as much as '
      + 'personal.',
    links: { murder: 0, accident: 2, frailty: -1, disease: 0, curse: 0 },
    contestable: true,
  },
  {
    id: 'crushed-chest',
    title: 'Missing ribs, sternum and heart',
    station: 'scanSuite',
    source: 'CT survey + examination records',
    year: 2005,
    reliability: 3,
    tech: 'CT scan',
    expertId: 'pathologist',
    image: 'assets/tut-inquiry/evidence/crushed-chest.png',
    summary:
      'The front of the chest — ribs and breastbone — is missing, and the heart was not in '
      + 'the body. Some argued a crushing injury, such as a chariot crash.',
    detail:
      'The breastbone and front ribs are absent and the heart is missing — unusual, since '
      + 'embalmers normally left the heart in place. A massive chest injury was proposed. But '
      + 'this damage is hotly contested: it may not date to the king\'s lifetime at all.',
    links: { murder: 1, accident: 2, frailty: 0, disease: 0, curse: 0 },
    contestedBy: 'burton-photo-chest',
    whenContested: {
      links: { murder: -1, accident: -2, frailty: 0, disease: 0, curse: 0 },
      note:
        'Burton\'s 1926 photographs show the chest beadwork still in place. The ribs were '
        + 'lost LATER — this is modern damage, not an ancient wound.',
    },
  },
  {
    id: 'dismemberment-1925',
    title: 'The 1925 examination dismembered the body',
    station: 'recordsRoom',
    source: 'Carter / Derry examination records',
    year: 1925,
    reliability: 4,
    tech: 'Archive / historical record',
    expertId: 'conservator',
    image: 'assets/tut-inquiry/evidence/dismemberment-1925.png',
    summary:
      'To free the body from the resin-glued coffin and mask, the 1925 team cut the mummy '
      + 'into pieces. Much "damage" dates from this, not from antiquity.',
    detail:
      'The mummy was stuck fast to its coffin by hardened resin. Carter\'s team used heat '
      + 'and force and separated the body into parts to recover it. This is the great '
      + 'contestability wildcard: it casts doubt on every claim of bodily injury.',
    links: { murder: -1, accident: -1, frailty: 0, disease: 0, curse: 0 },
    contestabilityWildcard: true, // weakens damage-based readings across the board
  },
  {
    id: 'burton-photo-chest',
    title: "Burton's 1926 photo shows the chest intact",
    station: 'recordsRoom',
    source: 'Harry Burton tomb photograph (cross-reference)',
    year: 1926,
    reliability: 5,
    tech: 'Photographic record',
    expertId: 'egyptologist',
    image: 'assets/tut-inquiry/evidence/burton-photo-chest.png',
    summary:
      'A 1926 photograph shows the ribcage and beaded chest covering still present — bones '
      + 'that are missing today. The chest damage is modern.',
    detail:
      'Cross-referencing Burton\'s photographs against the body\'s current state shows the '
      + 'front ribs and breastbone were there in 1926 and gone by later examinations. '
      + 'Whatever removed them happened in the modern era — so "crushed chest" cannot be a '
      + 'cause of the king\'s death.',
    links: { murder: -1, accident: -2, frailty: 0, disease: 0, curse: -1 },
    debunks: 'crushed-chest',
    keystone: true,
    hidden: true, // found only by the records cross-reference minigame
  },
  {
    id: 'floral-collar-season',
    title: 'Floral collar dates the burial to spring',
    station: 'recordsRoom',
    source: 'Archaeobotanical analysis of the embalming cache',
    year: 1932,
    reliability: 4,
    tech: 'Plant-remains analysis',
    expertId: 'botanist',
    image: 'assets/tut-inquiry/evidence/floral-collar-season.jpg', // real: MET floral collar, embalming cache (CC0)
    summary:
      'The flowers and fruit in the burial collar only bloom in spring. With ~70 days of '
      + 'embalming, that places death in winter.',
    detail:
      'The cornflowers, mandrake and other species in the collar flower or fruit in March '
      + 'or April. Egyptian embalming took around seventy days, so working backwards puts '
      + 'the death in the preceding winter. A timeline card — it constrains, rather than '
      + 'proves, the other theories.',
    links: { murder: 0, accident: 0, frailty: 0, disease: 0, curse: 0 },
    timelineCard: true,
  },
  {
    id: 'hittite-letter',
    title: "Widow's letter to the Hittite king",
    station: 'recordsRoom',
    source: 'Hittite royal archive (Deeds of Suppiluliuma)',
    year: -1324, // contemporaneous text; display as "ancient"
    reliability: 3,
    tech: 'Archive / inscription',
    expertId: 'egyptologist',
    image: 'assets/tut-inquiry/evidence/hittite-letter.jpg', // real: Deeds of Suppiluliuma tablet (CC BY-SA 4.0 — attribute)
    summary:
      'After the king\'s death his widow begged a foreign king to send a son to marry her, '
      + 'rather than wed a servant — hinting at a court in crisis.',
    detail:
      'A Hittite record preserves a remarkable letter from an Egyptian queen — likely Tut\'s '
      + 'widow Ankhesenamun — asking for a Hittite prince to become her husband and pharaoh. '
      + 'It suggests fear and a power vacuum, but it is circumstantial: it shows motive and '
      + 'turmoil, not a killing.',
    links: { murder: 2, accident: 0, frailty: 0, disease: 0, curse: 0 },
    circumstantial: true,
  },
  {
    id: 'successor-ay',
    title: 'Successor Ay took the throne quickly',
    station: 'recordsRoom',
    source: 'Inscriptions and tomb scenes',
    year: -1323,
    reliability: 3,
    tech: 'Archive / inscription',
    expertId: 'egyptologist',
    image: 'assets/tut-inquiry/evidence/successor-ay.jpg', // real: golden throne (Tut & Ankhesenamun) as court image (CC BY-SA 4.0 — attribute)
    summary:
      'The elder courtier Ay became king and is shown performing Tut\'s burial rites — and '
      + 'may have married the widow. Opportunity, but not proof.',
    detail:
      'Ay, an older official, succeeded the boy king and appears in the tomb performing the '
      + '"opening of the mouth" ritual, a role usually taken by the heir. To some this is '
      + 'suspicious opportunity; to others it is simply an experienced courtier steadying a '
      + 'kingdom. Motive without a murder weapon.',
    links: { murder: 2, accident: 0, frailty: 0, disease: 0, curse: 0 },
    circumstantial: true,
  },
  {
    id: 'amarna-art-body',
    title: 'Amarna art shows a strange royal body',
    station: 'recordsRoom',
    source: 'Art-historical analysis',
    year: 1907,
    reliability: 2,
    tech: 'Art analysis',
    expertId: 'egyptologist',
    image: 'assets/tut-inquiry/evidence/amarna-art-body.jpg', // real: Amarna colossal statue, elongated style (CC BY 2.0 — attribute)
    summary:
      'Statues from this royal family show wide hips, soft bellies and long skulls. Some '
      + 'proposed an inherited condition — "Tutankhamun syndrome".',
    detail:
      'The art of the Amarna period depicts the royal family with an unusual body shape. '
      + 'This inspired claims of a shared medical syndrome. But the CT scan found Tut\'s body '
      + 'reasonably normal in proportion — the art may be a deliberate religious style, not '
      + 'an anatomy lesson. Strongly contestable.',
    links: { murder: 0, accident: 0, frailty: 1, disease: 0, curse: 0 },
    contestable: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STATIONS — where evidence is gathered. Minigame parameters live here so the
// build phase can tune them without touching component logic.
// ─────────────────────────────────────────────────────────────────────────────

export const TUT_STATIONS = [
  {
    id: 'scanSuite',
    label: 'Scan suite',
    tech: 'CT scanner',
    icon: 'scan',
    expertIds: ['radiologist', 'pathologist', 'conservator'],
    scene: 'assets/tut-inquiry/scenes/scan-suite.png',
    blurb:
      'Sweep the scan plane through the body to surface findings. A careful, complete sweep '
      + 'reveals everything; a rushed one misses the subtle bones.',
    minigame: {
      type: 'scanSweep',
      revealsEvidenceIds: ['ct-skull-postmortem', 'ct-femur-fracture', 'ct-club-foot', 'crushed-chest'],
      sweepSegments: 6,
      missChanceWhenRushed: 0.4,
    },
  },
  {
    id: 'dnaLab',
    label: 'DNA lab',
    tech: 'DNA sequencing',
    icon: 'dna',
    expertIds: ['geneticist'],
    scene: 'assets/tut-inquiry/scenes/dna-lab.png',
    blurb:
      'Match marker bands across the royal mummies to rebuild the family tree, then run a '
      + 'pathogen screen. Mind the contamination controls.',
    minigame: {
      type: 'bandMatch',
      revealsEvidenceIds: ['dna-incest', 'dna-malaria'],
      mummies: ['Tutankhamun (KV62)', 'KV55 body', 'KV35 Younger Lady'],
      contaminationStep: true,
    },
  },
  {
    id: 'recordsRoom',
    label: 'Records room',
    tech: 'Archives & photographs',
    icon: 'books',
    expertIds: ['egyptologist', 'botanist', 'conservator'],
    scene: 'assets/tut-inquiry/scenes/records-room.png',
    blurb:
      'Carter\'s catalogue and Burton\'s photographs. Cross-reference a photo against the '
      + 'body\'s state today to find what changed since 1926.',
    minigame: {
      type: 'photoCrossReference',
      revealsEvidenceIds: [
        'walking-sticks', 'chariots', 'dismemberment-1925', 'floral-collar-season',
        'hittite-letter', 'successor-ay', 'amarna-art-body',
      ],
      // The hidden keystone is the reward for spotting the discrepancy.
      hiddenRevealId: 'burton-photo-chest',
      discrepancyPrompt:
        'Compare Burton\'s 1926 photograph with the body today. What is present in the '
        + 'photo that is missing now?',
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// THE INQUEST — the "boss". A rival investigator raises challenges; the player
// answers each by playing the correct evidence card from their board. Stakes are
// credibility, not health. `bestCardIds` are full marks; `acceptableCardIds`
// earn partial credit; anything else is rebutted.
// ─────────────────────────────────────────────────────────────────────────────

export const TUT_INQUEST = {
  rivalName: 'Prof. Adrian Vance',
  rivalPortrait: 'assets/tut-inquiry/experts/rival.png',
  intro:
    'You think you have a verdict. I am here to test it. For each claim I make, answer with '
    + 'your strongest piece of evidence — not your strongest opinion.',
  challenges: [
    {
      id: 'q-murder-blow',
      prompt:
        'The boy king was murdered — there is bone broken inside his very skull. What do you '
        + 'say to that?',
      bestCardIds: ['ct-skull-postmortem'],
      acceptableCardIds: ['dismemberment-1925'],
      successLine:
        'Conceded. The CT scan shows the fragments broke after death. The murder blow is a '
        + 'myth. Well argued.',
      failLine:
        'You have nothing to counter it? Then the murder story stands by default — and that '
        + 'should worry you.',
      teaches: 'A newer, higher-reliability technology can overturn an older reading.',
    },
    {
      id: 'q-chest-crash',
      prompt:
        'His ribs and breastbone are gone — surely a chariot smashed his chest and killed '
        + 'him.',
      bestCardIds: ['burton-photo-chest'],
      acceptableCardIds: ['dismemberment-1925'],
      successLine:
        'A photograph from 1926 showing the chest intact. So the damage is modern. I cannot '
        + 'argue with the camera.',
      failLine:
        'Without proof of when that damage happened, you cannot rule out the crash. The '
        + 'point goes to me.',
      teaches: 'Damage on a body is not automatically an ancient injury — date it first.',
    },
    {
      id: 'q-just-malaria',
      prompt:
        'Then it was simply malaria. One parasite, one cause. Why complicate it?',
      bestCardIds: ['ct-femur-fracture'],
      acceptableCardIds: ['dna-incest', 'ct-club-foot'],
      successLine:
        'An open, infected fracture on top of the malaria — and a frail, inbred body beneath '
        + 'both. Yes. A chain, not a single cause.',
      failLine:
        'If you will not bring the fracture or the frailty into it, then single-cause it is. '
        + 'But I think you are missing the bigger picture.',
      teaches: 'The strongest historical explanation is often a composite of several causes.',
    },
    {
      id: 'q-walking-sticks',
      prompt:
        'A hundred and thirty walking sticks! Plainly a cripple who could barely stand.',
      bestCardIds: ['ct-club-foot'],
      acceptableCardIds: ['dna-incest'],
      successLine:
        'Backed by the club foot and bone necrosis on the scan — the sticks were needed, not '
        + 'just symbolic. Agreed.',
      failLine:
        'Sticks were also symbols of royal power. Without medical evidence, your reading is '
        + 'just a guess.',
      teaches: 'An object can have more than one meaning; corroborate it with the body.',
    },
    {
      id: 'q-curse',
      prompt:
        'And what of the curse? So many who entered the tomb met untimely ends.',
      bestCardIds: ['successor-ay', 'floral-collar-season'],
      acceptableCardIds: ['dismemberment-1925'],
      anyEvidenceRebuts: true, // any sourced card beats an unsourced folk claim
      successLine:
        'Quite right — the deaths were ordinary, spread over years, and the story sold '
        + 'newspapers. A curse is not a cause. Source criticism wins.',
      failLine:
        'You let the ghost story stand unanswered? Evidence, not silence, is what dispels a '
        + 'myth.',
      teaches: 'A folk claim with no source loses to any properly sourced evidence.',
    },
  ],
  // The historically strongest position — rewarded above single-cause verdicts.
  compositeVerdict: {
    primaryTheoryId: 'disease',
    chainTheoryIds: ['frailty', 'accident', 'disease'],
    statement:
      'A frail king, weakened by inbreeding, broke his leg in an open fracture and then was '
      + 'struck by severe malaria. No single cause — a chain of them. Murder is unproven and '
      + 'the curse is a myth.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOSSARY — the curriculum's subject-specific language. Surfaced in-world on
// cards and in expert dialogue and tappable in the field journal — never drilled.
// ─────────────────────────────────────────────────────────────────────────────

export const TUT_GLOSSARY = [
  { id: 'theory', term: 'Theory', definition: 'A group of linked and tested ideas aimed at explaining something.' },
  { id: 'contestability', term: 'Contestability', definition: 'Open to challenge and debate; evidence that can be read more than one way.' },
  { id: 'assassination', term: 'Assassination', definition: 'The killing of a prominent person.' },
  { id: 'inbreeding', term: 'Inbreeding', definition: 'Reproduction between close relatives, which can raise the risk of birth defects.' },
  { id: 'malaria', term: 'Malaria', definition: 'An often-fatal disease carried by mosquitoes.' },
  { id: 'tutankhamun-syndrome', term: 'Tutankhamun syndrome', definition: 'A proposed (and contested) inherited condition with symptoms such as a soft, distended belly and flat feet.' },
  { id: 'compound-fracture', term: 'Compound fracture', definition: 'A break where the bone breaks the skin, leaving an open wound at high risk of infection.' },
  { id: 'club-foot', term: 'Club foot', definition: 'A deformity in which the foot is twisted inward.' },
  { id: 'ct-scan', term: 'CT scan', definition: 'A machine that builds detailed internal images of a body from many X-ray cross-sections.' },
];

// ─────────────────────────────────────────────────────────────────────────────
// SCORING & RANK — mirrors the expedition "Discovery Rank" end screen and feeds
// the exported Field Report that scaffolds the curriculum's summative task.
// ─────────────────────────────────────────────────────────────────────────────

export const TUT_SCORING = {
  // Points awarded at the verdict screen.
  weights: {
    evidenceCollected: 4,      // per card gathered
    keystoneDebunk: 25,        // each myth-busting debunk landed (skull, chest)
    expertConsulted: 6,        // per distinct expert spoken to
    inquestBest: 20,           // per challenge answered with the best card
    inquestAcceptable: 10,     // per challenge answered acceptably
    compositeVerdict: 40,      // committing to the evidence-linked composite
    hiddenPhotoFound: 15,      // Burton archive collectible photos
  },
  ranks: [
    { id: 'S', label: 'Lead Investigator', min: 280 },
    { id: 'A', label: 'Senior Analyst', min: 210 },
    { id: 'B', label: 'Field Researcher', min: 140 },
    { id: 'C', label: 'Junior Assistant', min: 0 },
  ],
  achievements: [
    { id: 'myth-buster', label: 'Myth Buster', requirement: 'Debunk the 1968 murder-blow claim.' },
    { id: 'cold-reading', label: 'Cold Reading', requirement: 'Find the ribcage discrepancy in Burton\'s photos.' },
    { id: 'composite-thinker', label: 'Composite Thinker', requirement: 'Link three theories into one chain in the inquest.' },
    { id: 'curse-breaker', label: 'Curse Breaker', requirement: 'Dismantle the curse theory with sourced evidence.' },
    { id: 'full-team', label: 'Whole Team', requirement: 'Consult all six experts in one investigation.' },
  ],
};

// Field Report scaffold — the verdict screen fills these slots from the player's
// actual run, producing a one-page export for the written/video assessment that
// responds to: "technology, human expertise and teamwork helped us discover the
// cause of death."
export const TUT_FIELD_REPORT_TEMPLATE = {
  prompts: [
    { id: 'technology', heading: 'Technology', lead: 'The technologies I used to read the evidence:' },
    { id: 'expertise', heading: 'Human expertise', lead: 'The experts I consulted and what each revealed:' },
    { id: 'teamwork', heading: 'Teamwork & debate', lead: 'How challenging and contesting evidence changed my thinking:' },
    { id: 'verdict', heading: 'My verdict', lead: 'My evidence-based conclusion on how Tutankhamun died:' },
    { id: 'changed-mind', heading: 'What changed my mind', lead: 'A claim I started out believing, and the evidence that overturned it:' },
  ],
};

export const TUT_DOSSIER_DEFAULT = 'accident';
