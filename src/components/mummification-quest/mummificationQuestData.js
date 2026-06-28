export const MUMMIFICATION_QUEST_TITLE = 'Mummification Lab: Orange Mummy Quest';
export const MUMMIFICATION_QUEST_STORAGE_KEY = 'archaeologyDigApp:mummificationQuest:v1';

const PUBLIC_ASSET_BASE = `${import.meta.env?.BASE_URL || '/'}assets/mummification-quest`;

const evidenceAsset = (fileName) => `${PUBLIC_ASSET_BASE}/evidence-cards/${fileName}`;
const backgroundAsset = (fileName) => `${PUBLIC_ASSET_BASE}/backgrounds/${fileName}`;
const practicalAsset = (fileName) => `${PUBLIC_ASSET_BASE}/orange-practical/${fileName}`;
const sarcophagusAsset = (fileName) => `${PUBLIC_ASSET_BASE}/sarcophagus/${fileName}`;

export const MUMMIFICATION_QUEST_FOCUS = [
  'preservation',
  'mummification',
  'Ancient Egyptian afterlife beliefs',
  'sarcophagus design',
  'artefacts as evidence',
  'interpretation and contestability',
  'respectful discussion of human remains',
  'metacognition: "My thinking changed because..."',
];

export const MUMMIFICATION_QUEST_RESPECT_NOTE =
  'This classroom lab uses an orange as a safe model. When discussing real mummified human remains, use respectful language: these were people, not props.';

export const MUMMIFICATION_QUEST_SAFETY_NOTE =
  'Teacher safety note: teacher/adult handles cutting the orange. Follow school safety rules for cutting tools, salt or natron substitute, hygiene, allergies, storage, mould checks and disposal. The orange is never for eating.';

export const MUMMIFICATION_QUEST_GLOSSARY = [
  {
    term: 'artefact',
    definition: 'An object made, used or changed by people that can give clues about the past.',
  },
  {
    term: 'preservation',
    definition: 'Keeping something from decaying or changing too quickly.',
  },
  {
    term: 'mummification',
    definition: 'A process used in ancient Egypt to preserve a body for religious and afterlife beliefs.',
  },
  {
    term: 'sarcophagus',
    definition: 'A decorated coffin or stone case that could protect a mummy and show identity or beliefs.',
  },
  {
    term: 'ritual',
    definition: 'A repeated action or ceremony connected to beliefs, respect or community rules.',
  },
  {
    term: 'afterlife',
    definition: 'A belief that life continues in some form after death.',
  },
  {
    term: 'evidence',
    definition: 'A clue that helps support an explanation about the past.',
  },
  {
    term: 'interpretation',
    definition: 'An evidence-based explanation of what something might mean.',
  },
  {
    term: 'contestability',
    definition: 'The idea that people may disagree about the past when evidence is incomplete or can be read in more than one way.',
  },
];

export const MUMMIFICATION_QUEST_SUCCESS_CRITERIA = [
  'I can explain why Ancient Egyptians mummified bodies.',
  'I can describe how the orange model shows preservation.',
  'I can design a sarcophagus that shows identity, belief and protection.',
  'I can explain what a future archaeologist might infer.',
  'I can identify what could be misunderstood.',
  'I can reflect on how my thinking changed.',
];

export const MUMMIFICATION_QUEST_TEACHER_NOTES = [
  'adult handles cutting the orange',
  'wash hands after the practical',
  'dispose of mouldy oranges safely',
  'use respectful language when discussing death and human remains',
];

export const MUMMIFICATION_QUEST_STAGE_IMAGES = {
  briefing: {
    title: 'Ancient Egyptian mummification beliefs',
    alt: 'Ancient Egyptian mummification classroom briefing',
    imageCandidates: [backgroundAsset('mummification-lab-briefing.png')],
    placeholderLabel: 'backgrounds',
    missingHint: 'Add a briefing background image here later.',
  },
  'orange-practical': {
    title: 'Orange practical materials',
    alt: 'Orange practical materials for a teacher-led classroom model',
    imageCandidates: [practicalAsset('orange-practical-materials.png')],
    placeholderLabel: 'orange-practical',
    missingHint: 'Add an orange practical image here later.',
  },
  'sarcophagus-design': {
    title: 'Sarcophagus design ideas',
    alt: 'Sarcophagus design ideas for an orange mummy',
    imageCandidates: [
      sarcophagusAsset('sarcophagus-design-studio.png'),
      evidenceAsset('ChatGPT Image Jun 28, 2026, 07_16_50 AM (4).png'),
    ],
    placeholderLabel: 'sarcophagus',
    missingHint: 'Add a sarcophagus design image here later.',
  },
};

export const MUMMIFICATION_QUEST_EVIDENCE_CATEGORIES = [
  {
    id: 'preservation',
    label: 'preservation',
    prompt: 'Helps slow decay, dry the orange, or protect the model.',
  },
  {
    id: 'ritual-belief',
    label: 'ritual/belief',
    prompt: 'Shows ideas about identity, protection, organs, or the afterlife.',
  },
  {
    id: 'archaeological-evidence',
    label: 'archaeological evidence',
    prompt: 'Gives clues that archaeologists can observe, scan, compare, or interpret.',
  },
  {
    id: 'causes-decay',
    label: 'causes decay',
    prompt: 'Makes preservation harder, such as moisture, air, heat, or mould.',
  },
];

export const MUMMIFICATION_QUEST_EVIDENCE_CARDS = [
  {
    id: 'natron',
    title: 'Natron',
    clue: 'A salt-like drying mixture removes moisture. Your orange model uses a safe classroom substitute.',
    correctCategoryId: 'preservation',
    reveal: 'Natron helped dry bodies. Less moisture can slow decay, which is why this card is strongest as preservation evidence.',
    imageCandidates: [evidenceAsset('ChatGPT Image Jun 28, 2026, 07_16_49 AM (1).png')],
    alt: 'Natron-style drying salts with Ancient Egyptian materials',
  },
  {
    id: 'linen-bandages',
    title: 'Linen bandages',
    clue: 'Wrapped cloth protected the body and helped keep the person recognisable in burial traditions.',
    correctCategoryId: 'preservation',
    reveal: 'Wrapping could protect the body and hold materials in place. It also links preservation to identity.',
    imageCandidates: [evidenceAsset('ChatGPT Image Jun 28, 2026, 07_16_50 AM (3).png')],
    alt: 'Linen-wrapped mummy model with burial materials',
  },
  {
    id: 'canopic-jars',
    title: 'Canopic jars',
    clue: 'Decorated jars protected organs and point to beliefs about the body and the afterlife.',
    correctCategoryId: 'ritual-belief',
    reveal: 'Canopic jars are useful evidence for beliefs about protection, organs, identity and the afterlife.',
    imageCandidates: [evidenceAsset('ChatGPT Image Jun 28, 2026, 07_16_49 AM (2).png')],
    alt: 'Ancient Egyptian canopic jars',
  },
  {
    id: 'ct-scan',
    title: 'CT scan',
    clue: 'A non-invasive scan can reveal bones, wrappings, amulets or injuries without unwrapping remains.',
    correctCategoryId: 'archaeological-evidence',
    reveal: 'A CT scan helps archaeologists gather evidence respectfully while keeping remains protected.',
    imageCandidates: [evidenceAsset('ct-scan.png')],
    alt: 'Placeholder for a CT scan evidence card',
  },
  {
    id: 'moisture-air',
    title: 'Moisture and air',
    clue: 'Too much moisture, air, warmth or mould can make organic material decay faster.',
    correctCategoryId: 'causes-decay',
    reveal: 'Preservation is partly about controlling conditions that cause decay.',
    imageCandidates: [practicalAsset('decay-conditions.png')],
    alt: 'Placeholder for conditions that cause decay',
  },
  {
    id: 'sarcophagus-design',
    title: 'Sarcophagus design',
    clue: 'Names, colours, symbols and burial goods can become evidence about identity, belief and protection.',
    correctCategoryId: 'archaeological-evidence',
    reveal: 'A sarcophagus is not just decorative. Its choices can be interpreted as archaeological evidence, but interpretations can be contested.',
    imageCandidates: [evidenceAsset('ChatGPT Image Jun 28, 2026, 07_16_50 AM (4).png')],
    alt: 'Decorated Ancient Egyptian sarcophagus with protective symbols',
  },
];

export const MUMMIFICATION_QUEST_MATERIALS = [
  'orange',
  'teacher/adult cutting tool',
  'spoon or scoop',
  'salt or teacher-approved natron substitute',
  'paper towel or tray',
  'label and storage container',
  'gloves if required by class rules',
];

export const MUMMIFICATION_QUEST_CHECKLIST = [
  {
    id: 'teacher-safety',
    label: 'Teacher/adult explains safety rules and handles cutting the orange.',
  },
  {
    id: 'label-orange',
    label: 'Label the orange mummy with name, class and date.',
  },
  {
    id: 'record-day-zero',
    label: 'Record Day 0 observations before the drying mixture is added.',
  },
  {
    id: 'drying-mixture',
    label: 'Add the teacher-approved drying mixture as directed.',
  },
  {
    id: 'store-model',
    label: 'Store the orange safely where the teacher says it can be checked later.',
  },
  {
    id: 'clean-up',
    label: 'Clean hands, bench and equipment. The orange is never for eating.',
  },
];

export const MUMMIFICATION_QUEST_OBSERVATION_FIELDS = [
  {
    id: 'prediction',
    label: 'I predict the orange will change because...',
    placeholder: 'I predict the orange will change because...',
  },
  {
    id: 'day0',
    label: 'Day 0 observation',
    placeholder: 'Record smell, colour, texture, moisture and firmness.',
  },
  {
    id: 'week1',
    label: 'Week 1 observation',
    placeholder: 'What has changed? What evidence can you see or smell?',
  },
  {
    id: 'week2',
    label: 'Week 2 observation',
    placeholder: 'What is different from Day 0 and Week 1?',
  },
  {
    id: 'final',
    label: 'Final observation',
    placeholder: 'Use evidence to describe the final condition of the orange mummy.',
  },
];

export const MUMMIFICATION_QUEST_DESIGN_FIELDS = [
  {
    id: 'mummyName',
    label: 'mummy name',
    placeholder: 'Give your orange mummy a name.',
  },
  {
    id: 'identityRole',
    label: 'identity or role',
    placeholder: 'Example: scribe, musician, guardian, trader, student-made role.',
  },
  {
    id: 'colours',
    label: 'colours',
    placeholder: 'Choose colours and explain what they might suggest.',
  },
  {
    id: 'symbols',
    label: 'symbols',
    placeholder: 'List symbols such as eyes, wings, scarab, stars, river, lotus or name panel.',
  },
  {
    id: 'burialGoods',
    label: 'burial goods',
    placeholder: 'What small goods would be included, and what might they mean?',
  },
  {
    id: 'inscription',
    label: 'inscription',
    placeholder: 'Write a short respectful inscription for the sarcophagus.',
  },
  {
    id: 'designExplanation',
    label: 'explanation of design choices',
    placeholder: 'Explain how your design shows identity, belief and protection.',
  },
];

export const MUMMIFICATION_QUEST_SYMBOL_BANK = [
  'Name panel',
  'Protective eyes',
  'Wings',
  'Scarab',
  'Lotus',
  'River pattern',
  'Stars',
  'Offering bowl',
  'Journey to the afterlife',
];

export const MUMMIFICATION_QUEST_ARCHAEOLOGIST_FIELDS = [
  {
    id: 'evidenceSuggests',
    label: 'What the evidence suggests',
    placeholder: 'Use evidence from the sarcophagus design to make an inference.',
  },
  {
    id: 'couldBeMisunderstood',
    label: 'What could be misunderstood',
    placeholder: 'What might a future archaeologist read incorrectly?',
  },
  {
    id: 'stillUnsure',
    label: 'What we are still unsure about',
    placeholder: 'Name one uncertainty, missing clue or contestable interpretation.',
  },
];

export const MUMMIFICATION_QUEST_FIELD_REPORT_FIELDS = [
  {
    id: 'whatWeDid',
    label: 'What we did',
    placeholder: 'Summarise the practical steps in your own words.',
  },
  {
    id: 'modelsPreservation',
    label: 'How this models preservation',
    placeholder: 'Explain how drying and recording the orange helps model preservation.',
  },
  {
    id: 'modelLimits',
    label: 'What the orange model does not show',
    placeholder: 'Explain what is different between an orange model and real human remains.',
  },
  {
    id: 'thinkingChanged',
    label: 'My thinking changed because...',
    placeholder: 'My thinking changed because...',
  },
];

export const MUMMIFICATION_QUEST_REPORT_SECTIONS = [
  { id: 'prediction', title: 'My prediction' },
  { id: 'whatWeDid', title: 'What we did' },
  { id: 'changedOverTime', title: 'What changed over time' },
  { id: 'modelsPreservation', title: 'How this models preservation' },
  { id: 'modelLimits', title: 'What the orange model does not show' },
  { id: 'designEvidence', title: 'How my sarcophagus shows identity, belief and protection' },
  { id: 'futureInference', title: 'What a future archaeologist might infer' },
  { id: 'thinkingChanged', title: 'My thinking changed because...' },
];

export const MUMMIFICATION_QUEST_STAGES = [
  {
    id: 'briefing',
    title: 'Briefing',
    role: 'Mission briefing',
    studentGoal: 'Learn why preservation, identity and afterlife beliefs mattered in ancient Egyptian mummification.',
    prompts: [
      'Ancient Egyptians mummified bodies because they believed preservation, identity and the afterlife were connected.',
      'In this lab, an orange is used as a safe classroom model. The model helps us think about preservation without using human remains.',
      'A sarcophagus can be evidence because names, colours, symbols and burial goods can suggest identity, belief and protection.',
    ],
  },
  {
    id: 'evidence-sort',
    title: 'Evidence Sort',
    role: 'Evidence thinking',
    studentGoal: 'Classify evidence as preservation, ritual/belief, archaeological evidence, or causes decay.',
    prompts: [
      'Choose the strongest category for each card.',
      'If a card could fit more than one category, explain why the interpretation is contestable.',
    ],
  },
  {
    id: 'orange-practical',
    title: 'Orange Practical Checklist',
    role: 'Teacher-led practical',
    studentGoal: 'Use a safe orange model to track the steps of preservation and context recording.',
    prompts: [
      'Follow the teacher safety instructions.',
      'Record what was done so the model keeps its context as evidence.',
    ],
  },
  {
    id: 'observation-log',
    title: 'Observation Log',
    role: 'Conservation notes',
    studentGoal: 'Record changes over time and connect observations to preservation.',
    prompts: [
      'What changed in the orange over time?',
      'What evidence supports your preservation claim?',
      'My thinking changed because...',
    ],
  },
  {
    id: 'sarcophagus-design',
    title: 'Sarcophagus Design Studio',
    role: 'Design as evidence',
    studentGoal: 'Plan a sarcophagus that communicates identity, belief and protection.',
    prompts: [
      'Choose colours, symbols and burial goods for a reason.',
      'Explain what a future archaeologist might infer from your design.',
    ],
  },
  {
    id: 'future-archaeologist',
    title: 'Future Archaeologist Mode',
    role: 'Peer interpretation',
    studentGoal: 'Interpret a sarcophagus as evidence while admitting uncertainty and contestability.',
    prompts: [
      'What does the evidence suggest?',
      'What could be misunderstood?',
      'What are we still unsure about?',
    ],
  },
  {
    id: 'field-report',
    title: 'Field Report',
    role: 'Final explanation',
    studentGoal: 'Generate a report from your prediction, observations, design and interpretation.',
    prompts: [
      'Use evidence from the practical and sarcophagus design.',
      'Include one uncertainty or alternative interpretation.',
      'Finish with "My thinking changed because..."',
    ],
  },
];
