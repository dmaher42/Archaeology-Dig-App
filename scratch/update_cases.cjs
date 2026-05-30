const fs = require('fs');

const cases = [
  {
    id: 'bureau_1',
    civilisation: 'Ancient Egypt',
    round: '1',
    caseTitle: 'The River Kingdom File',
    dateRange: '3100 BC - 30 BC',
    clueTiers: [
      { tier: 1, category: 'Geography', text: 'This civilisation relied on a major river system and annual flooding to survive in an arid climate.' },
      { tier: 2, category: 'Society', text: 'Their rulers held absolute power and were believed to be connected to the gods.' },
      { tier: 3, category: 'Architecture', text: 'They built massive stone structures in the desert to serve as monumental tombs.' },
    ],
    profileFacts: {
      Geography: ['Desert river valley'],
      Society: ['Divine monarchs (Pharaohs)'],
      Architecture: ['Monumental stone tombs (Pyramids)'],
    },
    explanation: 'A desert river, divine rulers, and monumental pyramids point to Ancient Egypt.',
  },
  {
    id: 'bureau_2',
    civilisation: 'Ancient Greece',
    round: '1',
    caseTitle: 'The City-State File',
    dateRange: '800 BC - 146 BC',
    clueTiers: [
      { tier: 1, category: 'Geography', text: 'This civilisation developed in a mountainous region with a long coastline, relying heavily on the sea.' },
      { tier: 2, category: 'Society', text: 'Rather than a single empire, they lived in independent city-states with varied forms of government.' },
      { tier: 3, category: 'Legacy', text: 'They are famous for early democratic ideas, philosophical schools, and marble temples.' },
    ],
    profileFacts: {
      Geography: ['Mountainous peninsula', 'Extensive coastlines'],
      Society: ['Independent city-states', 'Early democracy in some cities'],
      Legacy: ['Philosophy', 'Marble temples (e.g. Parthenon)'],
    },
    explanation: 'Mountainous coastlines, independent city-states, and early democracy point to Ancient Greece.',
  },
  {
    id: 'bureau_3',
    civilisation: 'Ancient Rome',
    round: '1',
    caseTitle: 'The Imperial Legion File',
    dateRange: '753 BC - 476 AD',
    clueTiers: [
      { tier: 1, category: 'Geography', text: 'Starting from a single city, this society expanded to control lands all around a major inland sea.' },
      { tier: 2, category: 'Society', text: 'They maintained order through highly organized professional armies and complex legal codes.' },
      { tier: 3, category: 'Architecture', text: 'Their engineers are famous for building extensive road networks and massive aqueducts.' },
    ],
    profileFacts: {
      Geography: ['Mediterranean empire', 'Started from a single city'],
      Society: ['Professional armies (Legions)', 'Complex legal systems (Senate/Emperors)'],
      Architecture: ['Extensive roads', 'Aqueducts and amphitheatres'],
    },
    explanation: 'A Mediterranean empire, professional legions, and advanced aqueducts point to Ancient Rome.',
  },
  {
    id: 'bureau_4',
    civilisation: 'Ancient China',
    round: '2',
    caseTitle: 'The Dynasty File',
    dateRange: '1600 BC - 220 AD',
    clueTiers: [
      { tier: 1, category: 'Geography', text: 'This civilisation relied on a major river system and annual flooding to survive.' },
      { tier: 2, category: 'Society', text: 'They were ruled by successive powerful families who passed down authority over generations.' },
      { tier: 3, category: 'Architecture', text: 'They undertook massive defensive construction projects across vast northern borders.' },
    ],
    profileFacts: {
      Geography: ['Powerful river systems (Yellow, Yangtze)'],
      Society: ['Ruled by successive families (Dynasties)'],
      Architecture: ['Massive defensive walls in the north'],
      Inventions: ['Silk', 'Paper'],
    },
    explanation: 'Powerful dynasties, early paper, and massive defensive walls point to Ancient China.',
  },
  {
    id: 'bureau_5',
    civilisation: 'Maya',
    round: '2',
    caseTitle: 'The Jungle Temple File',
    dateRange: '2000 BC - 900 AD',
    clueTiers: [
      { tier: 1, category: 'Geography', text: 'This civilisation built large cities hidden within dense, tropical environments.' },
      { tier: 2, category: 'Knowledge', text: 'They developed a highly advanced understanding of astronomy and complex timekeeping.' },
      { tier: 3, category: 'Architecture', text: 'Their cities featured towering stone temples with terraced steps rising above the trees.' },
    ],
    profileFacts: {
      Geography: ['Dense tropical rainforests'],
      Knowledge: ['Advanced astronomy', 'Complex calendars'],
      Architecture: ['Terraced step pyramids'],
    },
    explanation: 'Jungle environments, advanced calendars, and step pyramids point to the Maya.',
  },
  {
    id: 'bureau_6',
    civilisation: 'Inca',
    round: '2',
    caseTitle: 'The Mountain Empire File',
    dateRange: '1438 AD - 1533 AD',
    clueTiers: [
      { tier: 1, category: 'Geography', text: 'This civilisation developed in a mountainous region, relying on terraced agriculture.' },
      { tier: 2, category: 'Infrastructure', text: 'They connected their vast territory with an incredible network of paved mountain trails.' },
      { tier: 3, category: 'Knowledge', text: 'They managed complex records without a written language, using systems of knotted cords.' },
    ],
    profileFacts: {
      Geography: ['High altitude mountain ranges (Andes)'],
      Infrastructure: ['Extensive paved mountain trails'],
      Knowledge: ['Record-keeping with knotted cords (Quipu)'],
      Architecture: ['Precision stonework without mortar'],
    },
    explanation: 'High mountain ranges, extensive trail networks, and quipu point to the Inca.',
  },
  {
    id: 'bureau_7',
    civilisation: 'Indus Valley',
    round: '3',
    caseTitle: 'The Grid City File',
    dateRange: '3300 BC - 1300 BC',
    clueTiers: [
      { tier: 1, category: 'Geography', text: 'This civilisation relied on a major river system and annual flooding to survive.' },
      { tier: 2, category: 'Architecture', text: 'Their society is famous for highly planned, grid-like cities with advanced plumbing.' },
      { tier: 3, category: 'Knowledge', text: 'They used intricately carved stone markers, but their writing system remains undeciphered today.' },
    ],
    profileFacts: {
      Geography: ['Fertile river floodplains'],
      Architecture: ['Planned grid cities', 'Advanced drainage and plumbing'],
      Knowledge: ['Undeciphered writing system', 'Carved stone seals'],
    },
    explanation: 'Grid cities, early plumbing, and undeciphered writing point to the Indus Valley.',
  },
  {
    id: 'bureau_8',
    civilisation: 'Babylon / Mesopotamia',
    round: '3',
    caseTitle: 'The Two Rivers File',
    dateRange: '3100 BC - 539 BC',
    clueTiers: [
      { tier: 1, category: 'Geography', text: 'This civilisation relied on a major river system and annual flooding to survive.' },
      { tier: 2, category: 'Society', text: 'They were pioneers of early urban life and organized, written law codes.' },
      { tier: 3, category: 'Architecture', text: 'They worshipped at massive, multi-tiered temple towers built of mud-brick.' },
    ],
    profileFacts: {
      Geography: ['Land between two major rivers'],
      Society: ['Early written law codes'],
      Architecture: ['Multi-tiered temple towers (Ziggurats)'],
      Knowledge: ['Wedge-shaped writing (Cuneiform)'],
    },
    explanation: 'The land between two rivers, early laws, and ziggurats point to Mesopotamia (Babylon).',
  },
  {
    id: 'bureau_9',
    civilisation: 'Persia',
    round: '3',
    caseTitle: 'The Royal Road File',
    dateRange: '550 BC - 330 BC',
    clueTiers: [
      { tier: 1, category: 'Geography', text: 'Starting from a dry plateau, this society expanded to control lands across three continents.' },
      { tier: 2, category: 'Society', text: 'They were known for their tolerance of different cultures and religions within their borders.' },
      { tier: 3, category: 'Infrastructure', text: 'The empire was efficiently managed by regional governors and a massive royal highway.' },
    ],
    profileFacts: {
      Geography: ['Dry plateaus and mountain regions', 'Spanned three continents'],
      Society: ['Religious and cultural tolerance', 'Regional governors (Satraps)'],
      Infrastructure: ['Well-maintained royal highways'],
    },
    explanation: 'A vast empire, cultural tolerance, and royal highways point to Ancient Persia.',
  },
  {
    id: 'bureau_10',
    civilisation: 'Byzantine',
    round: 'challenge',
    caseTitle: 'The Crossroads File',
    dateRange: '330 AD - 1453 AD',
    clueTiers: [
      { tier: 1, category: 'Geography', text: 'This empire was centered around a highly fortified, wealthy capital city at the crossroads of two continents.' },
      { tier: 2, category: 'Society', text: 'They maintained complex legal codes inherited from a previous massive empire.' },
      { tier: 3, category: 'Beliefs', text: 'They developed unique, orthodox Christian traditions that split from their western counterparts.' },
    ],
    profileFacts: {
      Geography: ['Crossroads of Europe and Asia', 'Highly fortified capital'],
      Society: ['Continuation of Roman law', 'Surviving eastern empire'],
      Beliefs: ['Eastern Orthodox Christianity'],
    },
    explanation: 'A crossroads capital, continuation of Roman law, and Orthodox Christianity point to the Byzantine Empire.',
  },
  {
    id: 'bureau_11',
    civilisation: 'Ottoman',
    round: 'challenge',
    caseTitle: 'The Gunpowder Empire File',
    dateRange: '1299 AD - 1922 AD',
    clueTiers: [
      { tier: 1, category: 'Geography', text: 'This empire was centered around a highly fortified, wealthy capital city at the crossroads of two continents.' },
      { tier: 2, category: 'Society', text: 'They were ruled by absolute monarchs and bridged the cultures of the east and west.' },
      { tier: 3, category: 'Technology', text: 'Their military was renowned for its early and devastating use of massive gunpowder artillery.' },
    ],
    profileFacts: {
      Geography: ['Crossroads of Europe and Asia'],
      Society: ['Ruled by absolute monarchs (Sultans)'],
      Technology: ['Early and devastating use of cannons'],
    },
    explanation: 'A crossroads capital, sultans, and early cannon use point to the Ottoman Empire.',
  },
  {
    id: 'bureau_12',
    civilisation: 'Aztec',
    round: 'challenge',
    caseTitle: 'The Island Capital File',
    dateRange: '1428 AD - 1521 AD',
    clueTiers: [
      { tier: 1, category: 'Geography', text: 'This civilisation built their magnificent capital city on an island in a central lake.' },
      { tier: 2, category: 'Society', text: 'They were a warrior society that dominated neighbours, demanding wealth and resources in return.' },
      { tier: 3, category: 'Beliefs', text: 'Their religion required intense, sometimes violent offerings to sustain the sun and the gods.' },
    ],
    profileFacts: {
      Geography: ['Capital city built on a lake island'],
      Society: ['Warrior society', 'Demanded tribute from neighbours'],
      Beliefs: ['Intense offerings for the sun god'],
    },
    explanation: 'An island capital, tribute demands, and strong sacrificial beliefs point to the Aztec Empire.',
  },
];

const util = require('util');

let rawStr = 'const BUREAU_CASES_RAW = [\n';
for (const c of cases) {
  rawStr += '  {\n';
  for (const [k, v] of Object.entries(c)) {
    if (k === 'clueTiers') {
      rawStr += '    clueTiers: [\n';
      for (const tier of v) {
        rawStr += '      { tier: ' + tier.tier + ', category: "' + tier.category + '", text: "' + tier.text + '" },\n';
      }
      rawStr += '    ],\n';
    } else if (k === 'profileFacts') {
      rawStr += '    profileFacts: {\n';
      for (const [cat, facts] of Object.entries(v)) {
        rawStr += '      ' + cat + ': [' + facts.map(f => '"' + f + '"').join(', ') + '],\n';
      }
      rawStr += '    },\n';
    } else {
      rawStr += '    ' + k + ': ' + JSON.stringify(v) + ',\n';
    }
  }
  rawStr += '  },\n';
}
rawStr += '];\n';

const fileContent = fs.readFileSync('src/data.js', 'utf8');

// The replacement logic:
// Replace createBureauCase completely to remove profileSummary mapping and flatProfileFacts
let newCreateBureauCase = 'const createBureauCase = (caseItem) => {\n' +
  '  const groupedProfileFacts = caseItem.profileFacts || groupBureauProfileFacts(caseItem);\n\n' +
  '  return {\n' +
  '    ...caseItem,\n' +
  '    clueTiers: caseItem.clueTiers || [],\n' +
  '    tier1SiteClue: caseItem.clueTiers?.[0]?.text || caseItem.tier1SiteClue || \'\',\n' +
  '    tier2SocietyClue: caseItem.clueTiers?.[1]?.text || caseItem.tier2SocietyClue || \'\',\n' +
  '    tier3LegacyClue: caseItem.clueTiers?.[2]?.text || caseItem.tier3LegacyClue || \'\',\n' +
  '    civilisationOptions: caseItem.civilisationOptions || [caseItem.civilisation],\n' +
  '    correctCivilisation: Number.isInteger(caseItem.correctCivilisation) ? caseItem.correctCivilisation : 0,\n' +
  '    answerOptions: caseItem.answerOptions || caseItem.civilisationOptions || [caseItem.civilisation],\n' +
  '    correctAnswer: Number.isInteger(caseItem.correctAnswer) ? caseItem.correctAnswer : 0,\n' +
  '    profileFacts: groupedProfileFacts,\n' +
  '  };\n' +
  '};\n';

let updatedContent = fileContent.replace(/const createBureauCase = [\s\S]*?};\n};/, newCreateBureauCase);

updatedContent = updatedContent.replace(/const BUREAU_CASES_RAW = [\s\S]*?];\n/, rawStr);

fs.writeFileSync('src/data.js', updatedContent);
console.log('Successfully updated data.js');
