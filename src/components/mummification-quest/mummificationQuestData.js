export const MUMMIFICATION_QUEST_TITLE = 'Mummification Lab: Orange Mummy Quest';

export const MUMMIFICATION_QUEST_FOCUS = [
  'Preservation and mummification',
  'Ancient Egyptian afterlife beliefs',
  'Sarcophagus design as evidence',
  'Artefacts, interpretation and contestability',
  'Respectful discussion of human remains',
  'Metacognition: "My thinking changed because..."',
];

export const MUMMIFICATION_QUEST_RESPECT_NOTE =
  'This classroom lab uses an orange as a model. When discussing real mummified human remains, use respectful language: these were people, not props.';

export const MUMMIFICATION_QUEST_SAFETY_NOTE =
  'Teacher safety note: run the orange practical only with teacher supervision. Follow school safety rules for cutting tools, salt or natron substitute, hygiene, allergies, storage, mould checks and disposal. The orange is never for eating.';

export const MUMMIFICATION_QUEST_EVIDENCE_CATEGORIES = [
  {
    id: 'preservation',
    label: 'Preservation',
    prompt: 'What helped slow decay or protect the body?',
  },
  {
    id: 'afterlife',
    label: 'Afterlife Beliefs',
    prompt: 'What shows beliefs about life after death?',
  },
  {
    id: 'sarcophagus',
    label: 'Sarcophagus Design',
    prompt: 'What design choice communicates identity or status?',
  },
  {
    id: 'interpretation',
    label: 'Interpretation',
    prompt: 'What could be read in more than one way?',
  },
];

export const MUMMIFICATION_QUEST_EVIDENCE_CARDS = [
  {
    id: 'salt-drying',
    title: 'Drying mixture',
    clue: 'A salt or natron-style mixture draws moisture out of the orange peel.',
    correctCategoryId: 'preservation',
    reveal: 'Less moisture can slow decay. This models one purpose of mummification.',
  },
  {
    id: 'wrapped-body',
    title: 'Linen-style wrapping',
    clue: 'The orange mummy is wrapped and labelled before storage.',
    correctCategoryId: 'preservation',
    reveal: 'Wrapping helps protect the body and also turns the practical into a recorded object.',
  },
  {
    id: 'protective-symbols',
    title: 'Protective symbols',
    clue: 'A student adds eyes, wings or protective signs to the sarcophagus design.',
    correctCategoryId: 'afterlife',
    reveal: 'Protective images can point to beliefs about danger, protection and the afterlife.',
  },
  {
    id: 'painted-name',
    title: 'Painted name panel',
    clue: 'The sarcophagus includes a name, title or identity panel.',
    correctCategoryId: 'sarcophagus',
    reveal: 'Names and titles can help archaeologists interpret identity and social meaning.',
  },
  {
    id: 'colour-choice',
    title: 'Colour choice',
    clue: 'Gold, blue, green or black are chosen for decoration.',
    correctCategoryId: 'sarcophagus',
    reveal: 'Colours can communicate ideas, but archaeologists still need evidence before making a claim.',
  },
  {
    id: 'unclear-symbol',
    title: 'Unclear symbol',
    clue: 'A symbol looks important, but another student reads it differently.',
    correctCategoryId: 'interpretation',
    reveal: 'Evidence can be contested. A strong explanation names the clue and admits what is uncertain.',
  },
];

export const MUMMIFICATION_QUEST_CHECKLIST = [
  {
    id: 'teacher-ready',
    label: 'Teacher has explained the safety rules and practical steps.',
  },
  {
    id: 'orange-labelled',
    label: 'Orange mummy is labelled with name, class and date.',
  },
  {
    id: 'clean-workspace',
    label: 'Hands, bench and equipment are clean before and after the practical.',
  },
  {
    id: 'no-eating',
    label: 'Everyone understands the orange and mixture are not for eating.',
  },
  {
    id: 'drying-mixture',
    label: 'Drying mixture is added as directed by the teacher.',
  },
  {
    id: 'storage-recorded',
    label: 'Storage location and first observations are recorded.',
  },
];

export const MUMMIFICATION_QUEST_SYMBOL_BANK = [
  'Name panel',
  'Protective eyes',
  'Wings',
  'Scarab',
  'River pattern',
  'Stars',
  'Offerings',
  'Journey to the afterlife',
];

export const MUMMIFICATION_QUEST_SENTENCE_STARTERS = [
  'The strongest evidence is...',
  'One possible interpretation is...',
  'Another interpretation could be...',
  'My thinking changed because...',
  'I would discuss this respectfully by...',
];

export const MUMMIFICATION_QUEST_STAGES = [
  {
    id: 'briefing',
    title: 'Briefing',
    role: 'Mission briefing',
    studentGoal: 'Connect the orange model to preservation, evidence and respectful historical inquiry.',
    prompts: [
      'What problem were ancient Egyptian mummification methods trying to solve?',
      'Why does the sarcophagus matter as evidence, not just decoration?',
      'How can we discuss human remains respectfully?',
    ],
  },
  {
    id: 'evidence-sort',
    title: 'Evidence Sort',
    role: 'Evidence thinking',
    studentGoal: 'Sort clues into preservation, afterlife beliefs, sarcophagus design and interpretation.',
    prompts: [
      'Choose the strongest category for each clue.',
      'If a clue could fit two categories, explain why it is contestable.',
    ],
  },
  {
    id: 'orange-practical',
    title: 'Orange Practical Checklist',
    role: 'Teacher-led practical',
    studentGoal: 'Track the practical steps without treating the model as food or a joke.',
    prompts: [
      'Follow the teacher safety instructions.',
      'Record what was done so the model keeps its context.',
    ],
  },
  {
    id: 'observation-log',
    title: 'Observation Log',
    role: 'Conservation notes',
    studentGoal: 'Record observations and build an evidence-based preservation claim.',
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
    studentGoal: 'Plan a sarcophagus that communicates identity, protection and afterlife beliefs.',
    prompts: [
      'Choose symbols and colours for a reason.',
      'Explain what a future archaeologist might infer from your design.',
    ],
  },
  {
    id: 'future-archaeologist',
    title: 'Future Archaeologist Mode',
    role: 'Peer interpretation',
    studentGoal: 'Interpret another design using evidence while allowing more than one answer.',
    prompts: [
      'What can you infer from the design evidence?',
      'What could you be wrong about?',
      'How can you disagree respectfully?',
    ],
  },
  {
    id: 'field-report',
    title: 'Field Report',
    role: 'Final explanation',
    studentGoal: 'Summarise the practical, design evidence, interpretation and changed thinking.',
    prompts: [
      'Use evidence from the practical and sarcophagus design.',
      'Include one uncertainty or alternative interpretation.',
      'Finish with "My thinking changed because..."',
    ],
  },
];
