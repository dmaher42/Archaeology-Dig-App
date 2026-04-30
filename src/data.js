import { Wind, Droplets, AlertTriangle, Moon } from 'lucide-react';

export const CATEGORIES = [
  {
    id: 'objects',
    title: 'Objects people made',
    description: 'tools, pottery, weapons, jewellery, money',
  },
  {
    id: 'remains',
    title: 'Human remains',
    description: 'bones, teeth, mummified bodies',
  },
  {
    id: 'structures',
    title: 'Places and structures',
    description: 'roads, tombs, temples, walls, drainage',
  },
  {
    id: 'environment',
    title: 'Environmental evidence',
    description: 'seeds, charcoal, shells, animal bones',
  },
  {
    id: 'written',
    title: 'Written or symbolic evidence',
    description: 'symbols, writing, carvings, painted images',
  }
];

export const RANDOM_EVENTS = [
  {
    id: 'sandstorm',
    title: 'Incoming Sandstorm!',
    description: 'A huge sandstorm is blowing in. Recover the finds before the site is covered.',
    icon: Wind,
    time: 90,
    dangerColor: '#E89E5D'
  },
  {
    id: 'flood',
    title: 'Flash Flood Warning!',
    description: 'Heavy rain is flooding the site. Move quickly before the trench is unsafe.',
    icon: Droplets,
    time: 75,
    dangerColor: '#3b82f6'
  },
  {
    id: 'looters',
    title: 'Looters Spotted!',
    description: 'Looters are nearby. Finish the recovery before the site is disturbed.',
    icon: AlertTriangle,
    time: 80,
    dangerColor: '#f59e0b'
  },
  {
    id: 'nightfall',
    title: 'Generator Failure!',
    description: 'The power is out and it is getting dark. Recover what you can before nightfall.',
    icon: Moon,
    time: 70,
    dangerColor: '#8b5cf6'
  }
];

export const SCENARIOS = [
  {
    id: 'egypt',
    name: 'The Desert River Valley',
    civilization: 'Ancient Egypt',
    historicalContext: 'The Nile Valley was home to a very long-lasting civilization. The dry desert sand helped preserve items like paper and cloth that would usually rot away.',
    evidence: [
      { id: 'eg_1', name: "Canopic Jar", type: "objects", discoveryMethod: "Dug up carefully in an underground tomb using small brushes.", clue: "A stone jar with a lid shaped like an animal head.", question: "Based on the clue, what does this jar suggest about Ancient Egyptian beliefs?", options: ["It suggests Egyptians believed organs needed to be protected for the afterlife.", "It suggests Egyptians used decorated jars mainly for cooking meals.", "It suggests Egyptians buried jars because stone was easy to find.", "It suggests Egyptians used animal-shaped lids only as decoration."], correct: 0, image: "museum/egypt_canopic_jar.jpg", rationale: "The canopic jar is evidence of burial beliefs. It suggests Egyptians believed the body and organs were important for the afterlife." },
      { id: 'eg_2', name: "Faience Amulet", type: "objects", discoveryMethod: "Found by sifting sand through a fine screen.", clue: "A bright blue bead shaped like a beetle (scarab).", question: "Based on the clue, what can this amulet suggest about Ancient Egyptian beliefs?", options: ["It suggests people carried protective objects linked to luck, religion or magic.", "It suggests people used blue beads as coins in markets.", "It suggests jewellery was only worn by children.", "It suggests scarab shapes were used mainly to label food jars."], correct: 0, image: "museum/egypt_faience_amulet.jpg", rationale: "The scarab amulet helps historians infer that beliefs about protection, luck and religion were part of daily life." },
      { id: 'eg_3', name: "Bronze Mirror", type: "objects", discoveryMethod: "Found with a metal detector near old houses.", clue: "A shiny metal disc with a decorated handle.", question: "What can historians infer from a decorated bronze mirror?", options: ["It suggests people only used mirrors to reflect sunlight into dark rooms.", "It suggests appearance, grooming or status mattered to some people.", "It suggests mirrors were mainly military signal tools.", "It suggests bronze objects were always used in temples."], correct: 1, image: "museum/egypt_bronze_mirror.jpg", rationale: "A decorated mirror suggests that appearance, personal care and social status may have mattered in daily life." },
      
      { id: 'eg_4', name: "Mummified Remains", type: "remains", discoveryMethod: "Found inside a stone coffin and scanned with an X-ray.", clue: "A human body dried with salts and wrapped in cloth.", question: "Based on the clue, what does mummification suggest about Ancient Egyptian beliefs?", options: ["It suggests Egyptians used a careful process to preserve bodies for religious reasons.", "It suggests bodies became preserved only by accident.", "It suggests Egyptians avoided burial rituals.", "It suggests wrapping bodies was mainly done to make transport easier."], correct: 0, image: "museum/egypt_mummy.png", rationale: "Mummified remains suggest Egyptians had strong beliefs about death, the body and the afterlife." },
      { id: 'eg_5', name: "Cat Skeleton", type: "remains", discoveryMethod: "Dug up in a special animal graveyard.", clue: "Bones of a cat that were carefully wrapped in cloth.", question: "Based on the clue, what does the carefully wrapped cat skeleton suggest?", options: ["It suggests cats were buried only because they were useful for hunting.", "It suggests cats could have religious or sacred meaning in Egyptian culture.", "It suggests cats were the only animals kept as pets.", "It suggests animal bones cannot tell historians anything useful."], correct: 1, rationale: "A carefully wrapped cat skeleton suggests animals could have religious importance and were sometimes treated with ritual care." },
      { id: 'eg_6', name: "Worn Human Teeth", type: "remains", discoveryMethod: "Taken from a jawbone and looked at under a microscope.", clue: "Human teeth that are ground down and very flat.", question: "What could worn human teeth help archaeologists understand about daily life?", options: ["They suggest people used their teeth mainly as tools for leatherwork.", "They suggest diet and food preparation affected people's health.", "They suggest everyone had the same genetic tooth problem.", "They suggest people sharpened teeth to show warrior status."], correct: 1, rationale: "Worn teeth can reveal information about diet, health and how food was prepared." },

      { id: 'eg_7', name: "Mudbrick Wall", type: "structures", discoveryMethod: "Found by looking at the different soil colors in a trench.", clue: "A thick wall made of dried mud and straw.", question: "Based on the clue, what does a mudbrick wall suggest about building materials?", options: ["It suggests people used local materials like mud and straw to build useful structures.", "It suggests mudbrick was used only for temporary shelters.", "It suggests the mud had to be imported from distant places.", "It suggests walls were built only for decoration."], correct: 0, rationale: "Mudbrick walls show how people used available local resources to build homes and structures." },
      { id: 'eg_8', name: "Limestone Block", type: "structures", discoveryMethod: "Found using radar that sees through the ground.", clue: "A giant, perfectly cut stone block weighing 2 tons.", question: "What can archaeologists infer from a large, precisely cut limestone block?", options: ["It is most likely a natural rock shaped by wind.", "It suggests organised labour, planning and engineering skill.", "It suggests limestone blocks were used only for farming boundaries.", "It suggests the society avoided large building projects."], correct: 1, image: "museum/egypt_limestone_block.jpg", rationale: "A large cut block suggests planning, technology and the ability to organise workers." },
      { id: 'eg_9', name: "Tomb Shaft", type: "structures", discoveryMethod: "Found by clearing rocks from a vertical tunnel.", clue: "A deep hole in the ground leading to a hidden room.", question: "Based on the clue, what does a deep tomb shaft suggest?", options: ["It suggests people built shafts mainly to escape the heat.", "It suggests burial places could be hidden or protected.", "It suggests people dug shafts mostly to find underground water.", "It suggests tombs were used as rubbish pits."], correct: 1, rationale: "A tomb shaft suggests burial practices, protection of the dead and concerns about tomb robbery." },

      { id: 'eg_10', name: "Flax Seeds", type: "environment", discoveryMethod: "Found by mixing soil with water until the seeds floated.", clue: "Ancient seeds from a flax plant.", question: "What can ancient flax seeds suggest about daily life and technology?", options: ["They suggest people used plants such as flax to make useful materials like linen.", "They suggest flax was used mainly as money.", "They suggest people did not farm plants.", "They suggest flax was only used as temple medicine."], correct: 0, image: "museum/egypt_flax_seeds.jpg", rationale: "Flax seeds can help historians understand farming, clothing, textiles and everyday materials." },
      { id: 'eg_11', name: "Nile Silt Layer", type: "environment", discoveryMethod: "Taken from deep underground using a core drill.", clue: "A thick layer of rich, dark river mud.", question: "What can a rich layer of Nile silt help historians understand?", options: ["It suggests an earthquake changed the farmland.", "It suggests river flooding helped create fertile farming land.", "It suggests people moved mud to build cities.", "It suggests one flood destroyed the whole civilisation."], correct: 1, rationale: "Nile silt is environmental evidence that helps explain why farming was successful near the river." },
      { id: 'eg_12', name: "Dried Papyrus Reeds", type: "environment", discoveryMethod: "Found preserved in the dry desert sand.", clue: "Stems of a plant that grows in wet marshes.", question: "Based on the clue, what can papyrus reeds suggest about Egyptian life?", options: ["They suggest people used natural plants to make materials such as paper, boats and baskets.", "They suggest papyrus was only a weed that damaged farms.", "They suggest papyrus was the main material for stone buildings.", "They suggest papyrus was used only by wealthy doctors."], correct: 0, rationale: "Papyrus reeds show how people used environmental resources for writing, transport and everyday objects." },

      { id: 'eg_13', name: "Papyrus Scroll", type: "written", discoveryMethod: "Found inside a sealed jar and handled with gloves.", clue: "A thin sheet made of reeds with ink writing on it.", question: "What can a written papyrus scroll help historians understand?", options: ["It can reveal records, stories, laws, taxes or beliefs from the past.", "It shows that papyrus was mainly used as wallpaper.", "It proves all ancient people could read and write.", "It shows scrolls were mostly used as sailing maps."], correct: 0, image: "museum/egypt_papyrus_scroll.jpg", rationale: "Written evidence can give direct clues about government, beliefs, stories and daily administration." },
      { id: 'eg_14', name: "Hieroglyph Carving", type: "written", discoveryMethod: "Found on a ruined wall and scanned with a laser.", clue: "Symbols like eyes, birds, and snakes carved into stone.", question: "Based on the clue, what does a hieroglyph carving suggest?", options: ["It suggests the symbols were decoration with no meaning.", "It suggests Egyptians used a complex writing system, often linked to religion and power.", "It suggests only soldiers used writing.", "It suggests hieroglyphs were used only to count animals."], correct: 1, image: "museum/egypt_hieroglyphs.jpg", rationale: "Hieroglyphs are written and symbolic evidence. They help historians understand language, beliefs and official messages." },
      { id: 'eg_15', name: "Ostracon", type: "written", discoveryMethod: "Dug up in an ancient trash pile.", clue: "A broken piece of pottery with quick notes written in ink.", question: "What does writing on broken pottery suggest about everyday communication?", options: ["It suggests broken pottery was used only for legal documents.", "It suggests pottery pieces were sacred festival objects.", "It suggests people reused cheap materials for notes, practice or records.", "It suggests pottery writing was mainly used for board games."], correct: 2, image: "museum/egypt_ostracon.jpg", rationale: "An ostracon shows that everyday writing could happen on reused materials, like scrap paper today." }
    ]
  },
  {
    id: 'mungo',
    name: 'The Ancient Dry Lake',
    civilization: 'Indigenous Australia (Lake Mungo)',
    historicalContext: "Lake Mungo shows that people have lived here for over 42,000 years. It has some of the world's oldest ritual burials, proving a long and rich history.",
    evidence: [
      { id: 'mg_1', name: "Silcrete Stone Tool", type: "objects", discoveryMethod: "Found on the ground after the wind blew away the sand.", clue: "A sharp stone that has been carefully shaped.", question: "Based on the clue, what does this stone tool suggest about people in the past?", options: ["It suggests people had skill and knowledge for shaping stone into useful tools.", "It suggests the stone was mainly used as a tent weight.", "It suggests the stone was broken naturally by heat.", "It suggests stone tools were used only as trade tokens."], correct: 0, image: "museum/mungo_stone_tool.png", rationale: "A shaped stone tool shows skill, planning and knowledge of materials." },
      { id: 'mg_2', name: "Grinding Stone", type: "objects", discoveryMethod: "Dug up and mapped using GPS.", clue: "A large, flat rock with a smooth, worn-out dip in the middle.", question: "What can a worn grinding stone suggest about daily life?", options: ["It suggests the stone was used as a seat for group leaders.", "It suggests people processed seeds or grains into food.", "It suggests the stone covered an underground waterhole.", "It suggests people used it to make metal weapons."], correct: 1, rationale: "A grinding stone helps archaeologists understand food preparation, diet and daily work." },
      { id: 'mg_3', name: "Ochre Fragment", type: "objects", discoveryMethod: "Sifted from an old campsite layer.", clue: "A piece of soft, red rock with scratch marks on it.", question: "What can a scratched piece of red ochre suggest?", options: ["It suggests ochre was used mainly to melt metal.", "It suggests ochre may have been used for art, ceremony or symbolic expression.", "It suggests ochre was only used as medicine.", "It suggests ochre was used to build waterproof walls."], correct: 1, rationale: "Ochre can suggest symbolic, artistic or ceremonial practices." },

      { id: 'mg_4', name: "Ritual Burial Skeleton", type: "remains", discoveryMethod: "Found in a sand dune and studied with great respect.", clue: "A human skeleton covered in red ochre powder.", question: "What is the most respectful interpretation supported by this burial evidence?", options: ["The red colour happened naturally and has no cultural meaning.", "The burial suggests spiritual beliefs and careful treatment of the dead.", "The person was definitely a victim of violence.", "The burial was only used to hide the body from animals."], correct: 1, rationale: "Burial evidence must be treated respectfully. The use of ochre suggests complex spiritual beliefs and care for the dead." },
      { id: 'mg_5', name: "Cremated Bones", type: "remains", discoveryMethod: "Dated in a lab to find out how old they are.", clue: "Human bones that were burnt, broken, and then buried.", question: "What can carefully buried cremated bones suggest about cultural practice?", options: ["They may show an early ritual cremation and respectful treatment of the dead.", "They prove the bones were burnt by an accidental bushfire.", "They show people burnt bones only to make them easier to carry.", "They prove the person accidentally fell into a fire."], correct: 0, rationale: "Cremated ancestral remains can provide evidence of ritual practice, belief and cultural care." },
      { id: 'mg_6', name: "Megafauna Bone", type: "remains", discoveryMethod: "Dug up carefully near an ancient shoreline.", clue: "A giant bone from an extinct, massive kangaroo.", question: "What can a megafauna bone help archaeologists understand?", options: ["It suggests people brought elephants into Australia.", "It suggests people may have lived alongside large extinct animals.", "It proves the bone came from a dinosaur.", "It shows giant kangaroos were kept as pets."], correct: 1, rationale: "Megafauna remains help archaeologists understand ancient environments and the animals people may have encountered." },

      { id: 'mg_7', name: "Ancient Hearth", type: "structures", discoveryMethod: "Found by looking for a patch of heat-hardened clay.", clue: "A circle of burnt rocks found in the ground.", question: "What can an ancient hearth suggest about daily life?", options: ["It suggests people used fire for warmth, cooking or gathering.", "It suggests lightning left a random mark.", "It suggests all fires were used only for long-distance signals.", "It suggests people used steam to soften wood."], correct: 0, rationale: "Hearths are evidence of cooking, warmth, campsites and daily life." },
      { id: 'mg_8', name: "Fossilized Footprints", type: "structures", discoveryMethod: "Found in the mud and recorded with 3D cameras.", clue: "Hard mud showing the footprints of people running together.", question: "What can fossilized footprints help archaeologists understand?", options: ["They prove the group was performing a festival dance.", "They provide a snapshot of movement, activity and people on Country.", "They prove people were running from a predator.", "They were most likely carved as art."], correct: 1, rationale: "Footprints can show movement and behaviour at a specific moment in the past." },
      { id: 'mg_9', name: "Stone Fish Trap", type: "structures", discoveryMethod: "Found using a drone when the river was dry.", clue: "A line of rocks placed intentionally in a riverbed.", question: "What does a planned line of rocks in a riverbed suggest?", options: ["It suggests people designed ways to catch fish and manage resources.", "It suggests the rocks were randomly moved by water.", "It suggests the rocks were only defensive walls.", "It suggests the rocks were the base of a bridge."], correct: 0, rationale: "A stone fish trap suggests environmental knowledge, technology and sustainable resource use." },

      { id: 'mg_10', name: "Shell Midden", type: "environment", discoveryMethod: "Dug up to see how many layers of shells there were.", clue: "A large pile of old mussel shells.", question: "What can a shell midden suggest about people's lives?", options: ["It suggests shells were mainly used as money.", "It suggests people ate shellfish and returned to or lived at a place over time.", "It suggests shells were only used to decorate homes.", "It suggests the shells were left by one huge flood."], correct: 1, rationale: "Middens can reveal diet, repeated activity and long-term connection to place." },
      { id: 'mg_11', name: "Emu Egg Shells", type: "environment", discoveryMethod: "Found in an old fireplace and dated in a lab.", clue: "Burnt pieces of a very large bird egg.", question: "What can burnt emu eggshells from a hearth suggest?", options: ["They suggest emus were kept as farm animals.", "They suggest people gathered and cooked wild food.", "They suggest eggshells were mainly used as armour.", "They suggest eggshells were used only to carry water."], correct: 1, rationale: "Burnt eggshells help archaeologists understand diet, food gathering and cooking." },
      { id: 'mg_12', name: "Lake Silt Layer", type: "environment", discoveryMethod: "Dug deep into the ground to find old mud.", clue: "Mud that only forms at the bottom of a deep lake.", question: "What can an old lake silt layer help historians understand?", options: ["It suggests the dry area was once part of a wetter lake environment.", "It suggests people carried mud there to make gardens.", "It proves one giant flood lasted for months.", "It proves everyone lived in houses above the water."], correct: 0, rationale: "Environmental evidence such as silt helps reconstruct past landscapes and climate." },

      { id: 'mg_13', name: "Hand Stencil Rock Art", type: "written", discoveryMethod: "Found on a rock wall and scanned with a special camera.", clue: "An outline of a hand painted onto a rock with red paint.", question: "What can hand stencil rock art suggest about people's connection to place?", options: ["It may show identity, presence and connection to Country.", "It was only a simple signature left by travellers.", "It was only used to count group members.", "It was made mainly to teach children about bones."], correct: 0, rationale: "Rock art can be symbolic evidence connected to identity, story, place and culture." },
      { id: 'mg_14', name: "Carved Boab Nut", type: "written", discoveryMethod: "Found in a dry cave which kept the nut from rotting.", clue: "A nut shell with patterns carved into it.", question: "What can carvings on a small object suggest?", options: ["The nut was used only to carry sacred water.", "The marks only showed who owned the food.", "People could tell stories or express meaning through portable objects.", "The object was mainly used as a game token."], correct: 2, rationale: "Carved objects can show symbolic communication, story and artistic expression." },
      { id: 'mg_15', name: "Ceremonial Stone Arrangement", type: "written", discoveryMethod: "Mapped out using GPS across a large area.", clue: "Large stones placed in a massive pattern on the ground.", question: "What can a large planned stone arrangement suggest?", options: ["The stones were moved into place naturally by wind.", "It may have been a significant cultural, sacred or mapping place.", "It was definitely a defensive wall.", "The stones were only used to hold down tents."], correct: 1, rationale: "Stone arrangements can be significant cultural evidence and should be interpreted carefully and respectfully." }
    ]
  },
  {
    id: 'rome',
    name: 'The Mediterranean Empire',
    civilization: 'Ancient Rome',
    historicalContext: 'Rome was famous for its huge buildings and powerful army. From lead pipes to stone carvings, their items show a very organized and advanced society.',
    evidence: [
      { id: 'rm_1', name: "Bronze Sestertius", type: "objects", discoveryMethod: "Found with a metal detector in an old market.", clue: "A coin with the face of an Emperor on it.", question: "What can a coin with an emperor's face suggest about Roman society?", options: ["Coins were mainly carried as lucky charms.", "Coins can show economy, leadership and public messages.", "Coins were only used to count food supplies.", "Coins were used only to buy temple animals."], correct: 1, image: "museum/roman_coin.jpg", rationale: "Coins can provide evidence about trade, economy, rulers and the spread of official messages." },
      { id: 'rm_2', name: "Gladius", type: "objects", discoveryMethod: "Dug up from an old battlefield.", clue: "A short, iron sword made for stabbing.", question: "What can a standard Roman sword suggest about the army?", options: ["It suggests Rome had organised soldiers using specialised equipment.", "It suggests the sword was mainly a farming tool.", "It suggests weapons were only status symbols, not used in fighting.", "It suggests soldiers used swords mostly to clear bushes."], correct: 0, rationale: "A gladius helps historians understand military organisation, technology and warfare." },
      { id: 'rm_3', name: "Samian Ware", type: "objects", discoveryMethod: "Found in a trash pit and put back together.", clue: "High-quality, shiny red pottery made in large amounts.", question: "What can mass-produced fine pottery suggest about Roman trade and production?", options: ["It was used only for sacred oils.", "The red colour was chosen only to imitate copper.", "It suggests large-scale production and trade networks.", "It was made only as a rare item for emperors."], correct: 2, rationale: "Samian ware suggests skilled production, trade and consumer goods across the Roman world." },

      { id: 'rm_4', name: "Gladiator Skull", type: "remains", discoveryMethod: "Found in a graveyard outside the city.", clue: "A skull with wounds that have healed over.", question: "What can healed injuries on a skull suggest about Roman life?", options: ["The person was hurt only in a common household accident.", "Violent entertainment and medical care may have been part of society.", "The evidence proves Roman surgery was always successful.", "The injury was definitely caused by an earthquake."], correct: 1, image: "museum/roman_skull.png", rationale: "Human remains can reveal injury, health, occupation and aspects of social life, but should be interpreted carefully." },
      { id: 'rm_5', name: "Cremation Urn Ashes", type: "remains", discoveryMethod: "Sifted from a jar found in a tomb.", clue: "Burnt human bone fragments inside a labeled jar.", question: "What can ashes inside a labelled urn suggest about Roman beliefs and customs?", options: ["The ashes were kept to trap spirits inside homes.", "Cremation could be a formal burial practice.", "Only the most powerful people were cremated.", "The bones were probably placed there by mistake."], correct: 1, image: "museum/roman_cremation_urn.jpg", rationale: "Cremation urns provide evidence of burial customs and beliefs about death." },
      { id: 'rm_6', name: "Lead Isotope Teeth", type: "remains", discoveryMethod: "Studied in a lab to find minerals in the teeth.", clue: "Teeth that have lead and minerals from a far-away place.", question: "What can minerals in teeth help archaeologists investigate?", options: ["They can suggest where a person lived, moved or what environment affected them.", "They prove people used lead as a food spice.", "They prove the lead always came from local soil.", "They show the person definitely worked in a lead factory."], correct: 0, rationale: "Scientific testing of teeth can help investigate movement, diet, health and environment." },

      { id: 'rm_7', name: "Aqueduct Arch", type: "structures", discoveryMethod: "Measured above ground to see how it was built.", clue: "A giant stone bridge that carried water into the city.", question: "What can an aqueduct help historians understand about Roman cities?", options: ["It was mainly a decorative city gateway.", "It suggests engineering skill and the organised supply of water.", "It was mainly built to stop people moving around.", "It was a high platform only for religious parades."], correct: 1, rationale: "Aqueducts show engineering, planning and the importance of water supply in Roman cities." },
      { id: 'rm_8', name: "Hypocaust", type: "structures", discoveryMethod: "Dug under a floor to see what was beneath it.", clue: "A system of pillars that let hot air flow under the floor.", question: "What does a hypocaust system suggest about Roman technology?", options: ["It was designed mostly to stop floors getting wet.", "It shows advanced heating technology for buildings and baths.", "It was mainly a cold basement for storing food.", "It was built as a secret escape tunnel."], correct: 1, rationale: "A hypocaust is evidence of engineering and comfort in some Roman buildings." },
      { id: 'rm_9', name: "Mosaic Floor", type: "structures", discoveryMethod: "Cleaned with brushes and sponges to show the colors.", clue: "A floor made of thousands of tiny colored stones.", question: "What can a detailed mosaic floor suggest about Roman homes?", options: ["Wealthy people could use art and design to show taste or status.", "Mosaic floors were mainly maps for rituals.", "They were used mostly as non-slip sports flooring.", "The colours were used to tell the time."], correct: 0, image: "museum/roman_mosaic_floor.jpg", rationale: "Mosaics can reveal wealth, art, design, values and social status." },

      { id: 'rm_10', name: "Volcanic Ash Layer", type: "environment", discoveryMethod: "Found by looking at the layers of soil in a hole.", clue: "A thick layer of ash and rock covering the city.", question: "What can a volcanic ash layer help archaeologists understand?", options: ["It was probably a building material brought from far away.", "It suggests a natural disaster suddenly buried or preserved a site.", "It was most likely ash from ordinary factory fires.", "It was mainly used as garden fertilizer."], correct: 1, rationale: "Environmental layers can explain how a site was destroyed, preserved or changed." },
      { id: 'rm_11', name: "Olive Pits", type: "environment", discoveryMethod: "Found in an old sewer drain.", clue: "Thousands of old seeds from olive fruits.", question: "What can many olive pits in an ancient drain suggest?", options: ["They were used mainly as heating fuel.", "Olives were likely important in diet, trade or everyday life.", "They were used as small weapons.", "Olive trees were grown only for wood."], correct: 1, rationale: "Food remains can reveal diet, farming, trade and daily habits." },
      { id: 'rm_12', name: "Dormouse Bones", type: "environment", discoveryMethod: "Sifted from a special clay jar.", clue: "Bones of small rodents found inside a clay pot.", question: "What can dormouse bones in a special jar suggest about Roman food culture?", options: ["They show there was only a rodent problem in the market.", "They suggest some Romans raised and ate dormice as a luxury food.", "They prove dormice were kept only as sacred pets.", "They show mice accidentally got trapped during a flood."], correct: 1, rationale: "Animal remains can reveal diet, wealth and unusual food customs." },

      { id: 'rm_13', name: "Wax Tablet", type: "written", discoveryMethod: "Found in wet mud which kept the wood from rotting.", clue: "A wooden board with wax that was written on with a pen.", question: "What can a wax writing tablet suggest about Roman communication?", options: ["It suggests people used reusable writing tools for notes, school or business.", "It was mainly used as a lamp.", "It was mainly used to seal letters.", "It was only a cover for expensive paper."], correct: 0, rationale: "Wax tablets are written evidence of communication, education and administration." },
      { id: 'rm_14', name: "Monumental Inscription", type: "written", discoveryMethod: "Photographed and studied on a public building.", clue: "Large letters carved deeply into a marble slab.", question: "What can a large public inscription suggest?", options: ["It was a secret code for government taxes.", "Public writing could communicate messages, honours or information to people.", "The letters were only decorative and never read.", "The stone was mainly used to test building weight."], correct: 1, rationale: "Public inscriptions can reveal politics, status, public messages and literacy." },
      { id: 'rm_15', name: "Carbonized Scroll", type: "written", discoveryMethod: "Scanned with a special machine to read without unrolling.", clue: "A paper scroll burnt to charcoal by a volcano.", question: "What can a carbonized scroll help historians understand?", options: ["It can preserve evidence of books, ideas, laws or records.", "It was mainly used as a fire starter.", "It was mainly used to store herbs.", "It was used to make fishing nets."], correct: 0, rationale: "Scrolls are written evidence that can reveal ideas, laws, records and literature." }
    ]
  },
  {
    id: 'china',
    name: 'The Eastern Dynasties',
    civilization: 'Ancient China',
    historicalContext: 'Ancient Chinese history lasted for thousands of years. Discoveries like the Terracotta Army and Oracle Bones show a society with early writing and complex beliefs.',
    evidence: [
      { id: 'ch_1', name: "Bronze Ding", type: "objects", discoveryMethod: "Dug up from a high-status burial pit.", clue: "A massive, heavy metal pot standing on three legs.", question: "What can a large bronze ding suggest about power and beliefs?", options: ["It was mainly used for everyday cooking in small villages.", "It suggests ritual, status and power were connected in society.", "It was mainly used to store grain.", "It was mainly a musical instrument."], correct: 1, rationale: "A bronze ding can suggest elite status, ritual practice and political or religious power." },
      { id: 'ch_2', name: "Terracotta Fragment", type: "objects", discoveryMethod: "Dug up from a huge trench with brushes.", clue: "A piece of a life-sized clay soldier.", question: "What can a life-sized terracotta soldier fragment suggest about the emperor's tomb?", options: ["It suggests people created figures to protect or serve the emperor in the afterlife.", "It suggests the statues showed ordinary people in China.", "It suggests the clay pieces were used mainly to hold up a roof.", "It suggests the statues were made for a public park."], correct: 0, rationale: "Terracotta soldiers suggest beliefs about power, death and the afterlife." },
      { id: 'ch_3', name: "Jade Ornament", type: "objects", discoveryMethod: "Found using a fine screen in a tomb.", clue: "A beautifully carved green stone disc.", question: "What can a carved jade ornament suggest about ancient Chinese values?", options: ["Jade was used only for sharp knives.", "Jade could represent purity, status, wealth or sacred meaning.", "Jade was used only as money.", "Jade was mainly used as a blanket weight."], correct: 1, rationale: "Jade objects can reveal beliefs, status and the importance of valued materials." },

      { id: 'ch_4', name: "Chariot Horse Skeletons", type: "remains", discoveryMethod: "Found in a pit next to an old wooden chariot.", clue: "Bones of several horses buried in a neat line.", question: "What can carefully buried horse skeletons suggest about status and belief?", options: ["The horses probably died from a random sickness.", "They may show sacrifice, status and beliefs about the afterlife.", "They were buried only to mark a battle site.", "The pit was simply a place for old horses."], correct: 1, image: "museum/china_horse_skeletons.png", rationale: "Animal remains in tomb contexts can suggest status, ritual and beliefs about death." },
      { id: 'ch_5', name: "Silk-Wrapped Bones", type: "remains", discoveryMethod: "Studied under a microscope to find tiny fibers.", clue: "Human bones that have tiny bits of silk thread on them.", question: "What can silk fibres found with human bones suggest?", options: ["The silk probably came from spiders in the tomb.", "Silk was only used as a medical bandage.", "It suggests skilled silk production and high-status clothing or burial practice.", "Silk was used only for religious decorations."], correct: 2, rationale: "Silk fibres can reveal technology, clothing, status and burial customs." },
      { id: 'ch_6', name: "Laborer Skeletons", type: "remains", discoveryMethod: "Found buried together inside a large wall.", clue: "Skeletons showing signs of hard work and not enough food.", question: "What can skeletons showing hard work and poor nutrition suggest?", options: ["They were athletes who died during a race.", "They were soldiers who died defending the wall.", "They were buried only to make the wall stronger.", "They may show forced labour and the human cost of large building projects."], correct: 3, rationale: "Human remains can provide evidence about labour, health, inequality and the cost of major construction." },

      { id: 'ch_7', name: "Rammed Earth Wall", type: "structures", discoveryMethod: "Measured with GPS and soil samples.", clue: "A massive wall made of very tightly packed dirt.", question: "What can a massive rammed earth wall suggest about government organisation?", options: ["It suggests leaders could organise workers, materials and large construction projects.", "It was mainly built to stop fields from flooding.", "It was only a farm boundary marker.", "It was mainly a raised road."], correct: 0, rationale: "Large walls suggest organisation, planning, labour and political power." },
      { id: 'ch_8', name: "Wooden Pagoda Foundation", type: "structures", discoveryMethod: "Dug up to show the stone bases for tall wooden poles.", clue: "A square base made to hold up a very tall wooden tower.", question: "What can a strong foundation for a tall wooden structure suggest?", options: ["It was mainly built to hold a giant statue.", "It suggests advanced building knowledge and vertical architecture.", "It was only a lookout for fires.", "It was mainly built to protect wood from animals."], correct: 1, rationale: "Foundations can reveal construction methods, engineering and religious or cultural buildings." },
      { id: 'ch_9', name: "Ceramic Kiln", type: "structures", discoveryMethod: "Found near a huge pile of ash and broken pots.", clue: "A large oven built into a hillside.", question: "What can a large ceramic kiln suggest about production and technology?", options: ["It was used mainly to bake sacred bread.", "It suggests people produced pottery using specialised technology.", "It was mainly a heater for a village.", "It was mainly a furnace for bronze weapons."], correct: 1, rationale: "A kiln shows craft production, technology and specialised work." },

      { id: 'ch_10', name: "Rice Grains", type: "environment", discoveryMethod: "Found in a wet pit using water to float the seeds.", clue: "Burnt grains of farmed rice.", question: "What can burnt rice grains suggest about food and farming?", options: ["They suggest rice farming was important for food.", "They suggest rice was used only for special wine.", "They suggest rice was always imported as a luxury.", "They suggest rice was used mainly to pay workers."], correct: 0, rationale: "Plant remains can reveal farming, diet and environmental adaptation." },
      { id: 'ch_11', name: "Mulberry Leaves", type: "environment", discoveryMethod: "Found inside a sealed jar.", clue: "Leaves from a Mulberry tree.", question: "What can mulberry leaves suggest about silk production?", options: ["They were grown mainly for medicinal tea.", "They may have been used to feed silkworms for silk production.", "They were mainly used as building material.", "They were grown only to feed farm animals."], correct: 1, rationale: "Mulberry leaves connect environmental evidence to silk technology and economic activity." },
      { id: 'ch_12', name: "Millet Seeds", type: "environment", discoveryMethod: "Sifted from an old fireplace in the north.", clue: "Tiny seeds of a grain that grows in dry places.", question: "What can millet seeds suggest about farming in northern China?", options: ["Millet was used only to feed pet birds.", "People grew crops suited to dry conditions.", "Millet seeds were mainly used to make concrete.", "Millet was only a weed that grew by accident."], correct: 1, rationale: "Millet seeds help historians understand farming choices, climate and diet." },

      { id: 'ch_13', name: "Oracle Bone", type: "written", discoveryMethod: "Dug up and studied by language experts.", clue: "A turtle shell with symbols carved into it.", question: "What can an oracle bone suggest about belief and writing?", options: ["It suggests people used writing in attempts to communicate with spirits or predict the future.", "It was mainly used as expensive money.", "It was only a secret merchant code.", "It was only a decorative plaque."], correct: 0, rationale: "Oracle bones show early writing and beliefs about prophecy, ancestors or spirits." },
      { id: 'ch_14', name: "Bamboo Slips", type: "written", discoveryMethod: "Dug up from a dry tomb and unrolled carefully.", clue: "Strips of bamboo tied together with writing on them.", question: "What can bamboo slips with writing suggest about government or learning?", options: ["They suggest information could be recorded, stored and shared.", "They were mainly used as building material.", "They were only used as firewood.", "They were mainly used as musical instruments."], correct: 0, rationale: "Bamboo slips are written evidence that can reveal administration, laws, learning or records." },
      { id: 'ch_15', name: "Bronze Inscription", type: "written", discoveryMethod: "Cleaned carefully in a lab.", clue: "Symbols carved inside a metal ritual pot.", question: "What can writing cast into bronze suggest?", options: ["It suggests bronze objects were only decorative.", "It suggests important messages, ownership, power or ritual memory could be preserved.", "It suggests writing was used only by farmers.", "It suggests bronze was used mainly because paper was unavailable."], correct: 1, rationale: "Bronze inscriptions can preserve official, ritual or family messages and reveal power, memory and belief." }
    ]
  }
];

export const ARTIFACT_TYPES = CATEGORIES.map(c => c.id);

export const getCategoryTitle = (categoryId) => {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return cat ? cat.title : categoryId;
};

export const getArtifactEraLabel = (artifact) => {
  for (const scenario of SCENARIOS) {
    if (scenario.evidence.some(e => e.id === artifact.id)) {
      return scenario.civilization;
    }
  }
  if (artifact.isRedHerring) return 'Modern';
  return 'Unknown Era';
};

export const RED_HERRINGS = [
  { 
    id: 'rh_1', 
    name: "Aluminium Soda Can", 
    type: "objects", 
    isRedHerring: true,
    discoveryMethod: "Found in the top layer of dirt.", 
    clue: "A crushed metal can with bright red paint and a pull-tab.", 
    question: "How did this get here?", 
    options: ["It was made by an unknown ancient group", "It is modern trash that has disturbed the site", "It was a special cup for ancient rituals", "It was traded from a far-away advanced group"], 
    correct: 1 
  },
  { 
    id: 'rh_2', 
    name: "Plastic Water Bottle", 
    type: "objects", 
    isRedHerring: true,
    discoveryMethod: "Found near a modern rabbit hole.", 
    clue: "A clear, flexible bottle made of plastic.", 
    question: "Why is this in an ancient layer of soil?", 
    options: ["Ancient people knew how to make plastic", "It was moved there by animals or modern digging", "It was used to store water in ancient times", "It was buried as a time capsule"], 
    correct: 1 
  },
  { 
    id: 'rh_3', 
    name: "Modern 2-Dollar Coin", 
    type: "objects", 
    isRedHerring: true,
    discoveryMethod: "Found with a metal detector in the trash pile.", 
    clue: "A small gold-colored coin with the year '2024' on it.", 
    question: "Does this coin tell us anything about the past?", 
    options: ["It proves the site was built in 2024", "It is a modern loss and tells us nothing about history", "Ancient people traded with modern people", "It was a weight used in an ancient market"], 
    correct: 1 
  }
];
