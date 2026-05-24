import { 
  Package, Skull, Landmark, Leaf, ScrollText, Moon
} from 'lucide-react';

export const CATEGORIES = [
  {
    id: 'objects',
    title: 'Artefacts / Objects',
    description: 'Human-made items that people used or valued.',
    icon: Package,
    color: '#f59e0b'
  },
  {
    id: 'remains',
    title: 'Human Remains',
    description: 'Physical evidence from people who lived in the past.',
    icon: Skull,
    color: '#a855f7'
  },
  {
    id: 'structures',
    title: 'Features / Structures',
    description: 'Built or changed places that remain at a site.',
    icon: Landmark,
    color: '#14b8a6'
  },
  {
    id: 'environment',
    title: 'Environmental Evidence',
    description: 'Natural evidence that helps explain the past environment.',
    icon: Leaf,
    color: '#84cc16'
  },
  {
    id: 'written',
    title: 'Written Sources',
    description: 'Writing, symbols or records from the past.',
    icon: ScrollText,
    color: '#60a5fa'
  }
];

export const RANDOM_EVENTS = [
  {
    id: 'storm',
    title: 'Dust Storm',
    description: 'A sudden storm has covered the site in dust! You have less time to dig.',
    icon: null, // Placeholder if needed, but we use Lucide in components
    time: 50,
    dangerColor: '#ef4444'
  },
  {
    id: 'flood',
    title: 'Flash Flood',
    description: 'Heavy rain has flooded the lower trenches. Move quickly!',
    icon: null,
    time: 45,
    dangerColor: '#3b82f6'
  },
  {
    id: 'night',
    title: 'Approaching Night',
    description: 'The sun is setting fast. Can you finish before it gets too dark?',
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
    spark: 'Uncover the secrets of the Pharaohs and the mystery of the Nile.',
    historicalContext: 'The Nile Valley was home to a very long-lasting civilization. The dry desert sand helped preserve items like paper and cloth that would usually rot away.',
    evidence: [
      { id: 'eg_1', name: "Canopic Jar", type: "objects", discoveryMethod: "Dug up carefully in an underground tomb using small brushes.", clue: "A stone jar with a lid shaped like an animal head.", question: "What does this jar tell us about what Egyptians believed?", options: ["They believed organs needed to be protected for the afterlife.", "They used decorated jars mainly for cooking meals.", "They buried jars because stone was easy to find.", "They used animal-shaped lids only as decoration."], correct: 0, image: "museum/egypt_canopic_jar.jpg", rationale: "The canopic jar is evidence of burial beliefs. It shows they believed the body and organs were important for the afterlife." },
      { id: 'eg_2', name: "Faience Amulet", type: "objects", discoveryMethod: "Found by sifting sand through a fine screen.", clue: "A bright blue bead shaped like a beetle (scarab).", question: "What does this amulet tell us about their daily life?", options: ["People carried lucky charms for protection and magic.", "People used blue beads as coins in markets.", "Jewellery was only worn by children.", "Scarab shapes were used mainly to label food jars."], correct: 0, image: "museum/egypt_faience_amulet.jpg", rationale: "The scarab amulet shows that beliefs about protection, luck and religion were part of daily life." },
      { id: 'eg_3', name: "Bronze Mirror", type: "objects", discoveryMethod: "Found with a metal detector near old houses.", clue: "A shiny metal disc with a decorated handle.", question: "What does a decorated mirror tell us about everyday life?", options: ["It shows mirrors were only used to bounce sunlight into dark rooms.", "It shows that people cared about how they looked and their social status.", "It shows mirrors were mainly military signal tools.", "It shows bronze objects were always used in temples."], correct: 1, image: "museum/egypt_bronze_mirror.jpg", labResult: "This object is made from bronze. Its surface is smooth and reflective, so a person could use it to see themselves.", rationale: "A decorated mirror shows that appearance, personal care and social status mattered in daily life." },
      
      { id: 'eg_4', name: "Mummified Remains", type: "remains", discoveryMethod: "Found inside a stone coffin and scanned with an X-ray.", clue: "A human body dried with salts and wrapped in cloth.", question: "Why did Ancient Egyptians dry and wrap bodies like this?", options: ["To preserve bodies carefully for religious reasons.", "The bodies became preserved only by accident.", "To avoid doing burial rituals.", "To make transport easier."], correct: 0, image: "museum/egypt_mummy.png", rationale: "Mummified remains show Egyptians had strong beliefs about death, the body and the afterlife." },
      { id: 'eg_5', name: "Cat Skeleton", type: "remains", discoveryMethod: "Dug up in a special animal graveyard.", clue: "Bones of a cat that were carefully wrapped in cloth.", question: "What does a carefully wrapped cat skeleton tell us?", options: ["Cats were buried only because they were useful for hunting.", "Cats had religious or sacred meaning in Egyptian culture.", "Cats were the only animals kept as pets.", "Animal bones cannot tell historians anything useful."], correct: 1, rationale: "A carefully wrapped cat skeleton shows animals could have religious importance and were sometimes treated with ritual care." },
      { id: 'eg_6', name: "Worn Human Teeth", type: "remains", discoveryMethod: "Taken from a jawbone and looked at under a microscope.", clue: "Human teeth that are ground down and very flat.", question: "What can worn human teeth tell us about how people lived?", options: ["They show people used their teeth mainly as tools for leatherwork.", "They show how diet and food preparation affected people's health.", "They show everyone had the same genetic tooth problem.", "They show people sharpened teeth to show warrior status."], correct: 1, labResult: "These human teeth are worn down. The surface shows signs of heavy use over time.", rationale: "Worn teeth reveal information about diet, health and how food was prepared." },

      { id: 'eg_7', name: "Mudbrick Wall", type: "structures", discoveryMethod: "Found by looking at the different soil colors in a trench.", clue: "A thick wall made of dried mud and straw.", question: "Why did they build walls out of mud and straw?", options: ["They used whatever local materials they could find to build useful structures.", "Mudbrick was used only for temporary shelters.", "The mud had to be imported from distant places.", "Walls were built only for decoration."], correct: 0, rationale: "Mudbrick walls show how people used available local resources to build homes and structures." },
      { id: 'eg_8', name: "Limestone Block", type: "structures", discoveryMethod: "Found using radar that sees through the ground.", clue: "A giant, perfectly cut stone block weighing 2 tons.", question: "What does a giant, perfectly cut limestone block tell us?", options: ["It is most likely a natural rock shaped by wind.", "It shows organised labour, planning and engineering skill.", "It shows limestone blocks were used only for farming boundaries.", "It shows the society avoided large building projects."], correct: 1, image: "museum/egypt_limestone_block.jpg", rationale: "A large cut block shows planning, technology and the ability to organise workers." },
      { id: 'eg_9', name: "Tomb Shaft", type: "structures", discoveryMethod: "Found by clearing rocks from a vertical tunnel.", clue: "A deep hole in the ground leading to a hidden room.", question: "What was the purpose of a deep tomb shaft?", options: ["To escape the heat.", "To hide or protect burial places from robbers.", "To find underground water.", "To use as a rubbish pit."], correct: 1, rationale: "A tomb shaft shows burial practices, protection of the dead and concerns about tomb robbery." },

      { id: 'eg_10', name: "Flax Seeds", type: "environment", discoveryMethod: "Found in a wet pit using water to float the seeds.", clue: "Ancient seeds from a flax plant.", question: "What do ancient flax seeds tell us about daily life?", options: ["People farmed plants like flax to make useful materials like linen cloth.", "Flax was used mainly as money.", "People did not farm plants.", "Flax was only used as temple medicine."], correct: 0, image: "museum/egypt_flax_seeds.jpg", rationale: "Flax seeds show farming, clothing, textiles and everyday materials." },
      { id: 'eg_11', name: "Nile Silt Layer", type: "environment", discoveryMethod: "Taken from deep underground using a core drill.", clue: "A thick layer of rich, dark river mud.", question: "What does this layer of deep river mud tell us?", options: ["An earthquake changed the farmland.", "River flooding helped create fertile farming land.", "People moved mud to build cities.", "One flood destroyed the whole civilisation."], correct: 1, rationale: "Nile silt is environmental evidence that explains why farming was successful near the river." },
      { id: 'eg_12', name: "Dried Papyrus Reeds", type: "environment", discoveryMethod: "Found preserved in the dry desert sand.", clue: "Stems of a plant that grows in wet marshes.", question: "What do papyrus reeds tell us about Egyptian life?", options: ["People used natural plants to make paper, boats and baskets.", "Papyrus was only a weed that damaged farms.", "Papyrus was the main material for stone buildings.", "Papyrus was used only by wealthy doctors."], correct: 0, rationale: "Papyrus reeds show how people used environmental resources for writing, transport and everyday objects." },

      { id: 'eg_13', name: "Papyrus Scroll", type: "written", discoveryMethod: "Found inside a sealed jar and handled with gloves.", clue: "A thin sheet made of reeds with ink writing on it.", question: "What can a written scroll tell historians?", options: ["It can reveal records, stories, laws, taxes or beliefs from the past.", "It shows that papyrus was mainly used as wallpaper.", "It proves all ancient people could read and write.", "It shows scrolls were mostly used as sailing maps."], correct: 0, image: "museum/egypt_papyrus_scroll.jpg", rationale: "Written evidence gives direct clues about government, beliefs, stories and daily administration." },
      { id: 'eg_14', name: "Hieroglyph Carving", type: "written", discoveryMethod: "Found on a ruined wall and scanned with a laser.", clue: "Symbols like eyes, birds, and snakes carved into stone.", question: "What does a hieroglyph carving tell us?", options: ["The symbols were decoration with no meaning.", "Egyptians used a complex writing system, often linked to religion and power.", "Only soldiers used writing.", "Hieroglyphs were used only to count animals."], correct: 1, image: "museum/egypt_hieroglyphs.jpg", labResult: "This stone carving has symbols cut into its surface. The symbols appear to be part of a writing system.", rationale: "Hieroglyphs are written and symbolic evidence. They help historians understand language, beliefs and official messages." },
      { id: 'eg_15', name: "Ostracon", type: "written", discoveryMethod: "Dug up in an ancient trash pile.", clue: "A broken piece of pottery with quick notes written in ink.", question: "What does writing on broken pottery tell us about everyday communication?", options: ["Broken pottery was used only for legal documents.", "Pottery pieces were sacred festival objects.", "People reused cheap materials for notes, practice or records.", "Pottery writing was mainly used for board games."], correct: 2, image: "museum/egypt_ostracon.jpg", rationale: "An ostracon shows that everyday writing could happen on reused materials, like scrap paper today." }
    ]
  },
  {
    id: 'mungo',
    name: 'Lake Mungo (The Ancient Dry Lake)',
    civilization: 'Indigenous Australia (Lake Mungo)',
    spark: "Discover the world's oldest ritual burials at an ancient dry lake.",
    historicalContext: "Lake Mungo shows that people have lived here for over 42,000 years. It has some of the world's oldest ritual burials, proving a long and rich history.",
    evidence: [
      { id: 'mg_1', name: "Silcrete Stone Tool", type: "objects", discoveryMethod: "Found on the ground after the wind blew away the sand.", clue: "A sharp stone that has been carefully shaped.", question: "What does this stone tool tell us about people in the past?", options: ["They had skill and knowledge to shape stone into useful tools.", "The stone was mainly used as a tent weight.", "The stone was broken naturally by heat.", "Stone tools were used only as trade tokens."], correct: 0, image: "museum/mungo_stone_tool.png", rationale: "A shaped stone tool shows skill, planning and knowledge of materials." },
      { id: 'mg_2', name: "Grinding Stone", type: "objects", discoveryMethod: "Dug up and mapped using GPS.", clue: "A large, flat rock with a smooth, worn-out dip in the middle.", question: "What does a worn-out grinding stone tell us?", options: ["The stone was used as a seat for group leaders.", "People ground up seeds and grains to make food.", "The stone covered an underground waterhole.", "People used it to make metal weapons."], correct: 1, rationale: "A grinding stone helps archaeologists understand food preparation, diet and daily work." },
      { id: 'mg_3', name: "Ochre Fragment", type: "objects", discoveryMethod: "Sifted from an old campsite layer.", clue: "A piece of soft, red rock with scratch marks on it.", question: "What does a scratched piece of red ochre tell us?", options: ["Ochre was used mainly to melt metal.", "Ochre may have been used for art, ceremony or body paint.", "Ochre was only used as medicine.", "Ochre was used to build waterproof walls."], correct: 1, rationale: "Ochre can show symbolic, artistic or ceremonial practices." },

      { id: 'mg_4', name: "Ritual Burial Skeleton", type: "remains", discoveryMethod: "Found in a sand dune and studied with great respect.", clue: "A human skeleton covered in red ochre powder.", question: "What does this burial evidence tell us?", options: ["The red colour happened naturally and has no meaning.", "It shows strong spiritual beliefs and careful, respectful treatment of the dead.", "The person was definitely a victim of violence.", "The burial was only used to hide the body from animals."], correct: 1, rationale: "Burial evidence must be treated respectfully. The use of ochre shows complex spiritual beliefs and care for the dead." },
      { id: 'mg_5', name: "Cremated Bones", type: "remains", discoveryMethod: "Dated in a lab to find out how old they are.", clue: "Human bones that were burnt, broken, and then buried.", question: "What do carefully buried cremated bones tell us?", options: ["They show early ritual cremation and respectful treatment of the dead.", "They prove the bones were burnt by an accidental bushfire.", "People burnt bones only to make them easier to carry.", "The person accidentally fell into a fire."], correct: 0, rationale: "Cremated ancestral remains provide evidence of ritual practice, belief and cultural care." },
      { id: 'mg_6', name: "Megafauna Bone", type: "remains", discoveryMethod: "Dug up carefully near an ancient shoreline.", clue: "A giant bone from an extinct, massive kangaroo.", question: "What does a megafauna bone help archaeologists understand?", options: ["People brought elephants into Australia.", "People lived alongside large, extinct animals.", "The bone came from a dinosaur.", "Giant kangaroos were kept as pets."], correct: 1, rationale: "Megafauna remains help archaeologists understand ancient environments and the animals people lived with." },

      { id: 'mg_7', name: "Ancient Hearth", type: "structures", discoveryMethod: "Found by looking for a patch of heat-hardened clay.", clue: "A circle of burnt rocks found in the ground.", question: "What does an ancient hearth tell us about daily life?", options: ["People used fire for warmth, cooking and gathering together.", "Lightning left a random mark.", "All fires were used only for long-distance signals.", "People used steam to soften wood."], correct: 0, rationale: "Hearths are evidence of cooking, warmth, campsites and daily life." },
      { id: 'mg_8', name: "Fossilized Footprints", type: "structures", discoveryMethod: "Found in the mud and recorded with 3D cameras.", clue: "Hard mud showing the footprints of people running together.", question: "What do fossilized footprints help archaeologists understand?", options: ["The group was performing a festival dance.", "They provide a snapshot of movement, activity and people on Country.", "People were running from a predator.", "They were most likely carved as art."], correct: 1, rationale: "Footprints can show movement and behaviour at a specific moment in the past." },
      { id: 'mg_9', name: "Stone Fish Trap", type: "structures", discoveryMethod: "Found using a drone when the river was dry.", clue: "A line of rocks placed intentionally in a riverbed.", question: "What does a planned line of rocks in a riverbed tell us?", options: ["People designed ways to catch fish and manage river resources.", "The rocks were randomly moved by water.", "The rocks were only defensive walls.", "The rocks were the base of a bridge."], correct: 0, rationale: "A stone fish trap shows environmental knowledge, technology and sustainable resource use." },

      { id: 'mg_10', name: "Shell Midden", type: "environment", discoveryMethod: "Dug up to see how many layers of shells there were.", clue: "A large pile of old mussel shells.", question: "What does a shell midden tell us about people's lives?", options: ["Shells were mainly used as money.", "People ate shellfish and lived at or returned to this place over a long time.", "Shells were only used to decorate homes.", "The shells were left by one huge flood."], correct: 1, rationale: "Middens reveal diet, repeated activity and long-term connection to a place." },
      { id: 'mg_11', name: "Emu Egg Shells", type: "environment", discoveryMethod: "Found in an old fireplace and dated in a lab.", clue: "Burnt pieces of a very large bird egg.", question: "What do burnt emu eggshells from a hearth tell us?", options: ["Emus were kept as farm animals.", "People gathered and cooked wild food.", "Eggshells were mainly used as armour.", "Eggshells were used only to carry water."], correct: 1, rationale: "Burnt eggshells help archaeologists understand diet, food gathering and cooking." },
      { id: 'mg_12', name: "Lake Silt Layer", type: "environment", discoveryMethod: "Dug deep into the ground to find old mud.", clue: "Mud that only forms at the bottom of a deep lake.", question: "What does an old lake silt layer tell us?", options: ["This dry area was once a wetter lake environment.", "People carried mud here to make gardens.", "One giant flood lasted for months.", "Everyone lived in houses above the water."], correct: 0, rationale: "Environmental evidence like silt helps reconstruct past landscapes and climate." },

      { id: 'mg_13', name: "Hand Stencil Rock Art", type: "written", discoveryMethod: "Found on a rock wall and scanned with a special camera.", clue: "An outline of a hand painted onto a rock with red paint.", question: "What does hand stencil rock art tell us about people and place?", options: ["It shows identity, presence and connection to Country.", "It was only a simple signature left by travellers.", "It was only used to count group members.", "It was made mainly to teach children about bones."], correct: 0, rationale: "Rock art can be symbolic evidence connected to identity, story, place and culture." },
      { id: 'mg_14', name: "Carved Boab Nut", type: "written", discoveryMethod: "Found in a dry cave which kept the nut from rotting.", clue: "A nut shell with patterns carved into it.", question: "What do carvings on a small object tell us?", options: ["The nut was used only to carry sacred water.", "The marks only showed who owned the food.", "People could tell stories or express meaning through portable objects.", "The object was mainly used as a game token."], correct: 2, rationale: "Carved objects show symbolic communication, story and artistic expression." },
      { id: 'mg_15', name: "Ceremonial Stone Arrangement", type: "written", discoveryMethod: "Mapped out using GPS across a large area.", clue: "Large stones placed in a massive pattern on the ground.", question: "What does a large, planned stone arrangement tell us?", options: ["The stones were moved into place naturally by wind.", "It was a highly significant cultural, sacred or mapping place.", "It was definitely a defensive wall.", "The stones were only used to hold down tents."], correct: 1, rationale: "Stone arrangements are significant cultural evidence and should be interpreted carefully and respectfully." }
    ]
  },
  {
    id: 'rome',
    name: 'The Mediterranean Empire',
    civilization: 'Ancient Rome',
    spark: 'Explore the engineering marvels and military power of the Mediterranean Empire.',
    historicalContext: 'Rome was famous for its huge buildings and powerful army. From lead pipes to stone carvings, their items show a very organized and advanced society.',
    evidence: [
      { id: 'rm_1', name: "Bronze Sestertius", type: "objects", discoveryMethod: "Found with a metal detector in an old market.", clue: "A coin with the face of an Emperor on it.", question: "What does a coin with an emperor's face tell us about Roman society?", options: ["Coins were mainly carried as lucky charms.", "Coins show economy, leadership and public messages.", "Coins were only used to count food supplies.", "Coins were used only to buy temple animals."], correct: 1, image: "museum/roman_coin.jpg", rationale: "Coins provide evidence about trade, economy, rulers and the spread of official messages." },
      { id: 'rm_2', name: "Gladius", type: "objects", discoveryMethod: "Dug up from an old battlefield.", clue: "A short, iron sword made for stabbing.", question: "What does a standard Roman sword tell us about the army?", options: ["Rome had organised soldiers using specialised equipment.", "The sword was mainly a farming tool.", "Weapons were only status symbols, not used in fighting.", "Soldiers used swords mostly to clear bushes."], correct: 0, image: "museum/roman_gladius.jpg", rationale: "A gladius helps historians understand military organisation, technology and warfare." },
      { id: 'rm_3', name: "Samian Ware", type: "objects", discoveryMethod: "Found in a trash pit and put back together.", clue: "High-quality, shiny red pottery made in large amounts.", question: "What does mass-produced fine pottery tell us about Roman trade?", options: ["It was used only for sacred oils.", "The red colour was chosen only to imitate copper.", "It shows large-scale production and trade networks.", "It was made only as a rare item for emperors."], correct: 2, image: "museum/roman_samian_ware.jpg", rationale: "Samian ware shows skilled production, trade and consumer goods across the Roman world." },

      { id: 'rm_4', name: "Gladiator Skull", type: "remains", discoveryMethod: "Found in a graveyard outside the city.", clue: "A skull with wounds that have healed over.", question: "What do healed injuries on a skull tell us about Roman life?", options: ["The person was hurt only in a common household accident.", "Violent entertainment and medical care may have been part of society.", "The evidence proves Roman surgery was always successful.", "The injury was definitely caused by an earthquake."], correct: 1, image: "museum/roman_skull.png", rationale: "Human remains reveal injury, health, occupation and aspects of social life, but should be interpreted carefully." },
      { id: 'rm_5', name: "Cremation Urn Ashes", type: "remains", discoveryMethod: "Sifted from a jar found in a tomb.", clue: "Burnt human bone fragments inside a labeled jar.", question: "What do ashes inside a labelled urn tell us about Roman beliefs?", options: ["The ashes were kept to trap spirits inside homes.", "Cremation could be a formal burial practice.", "Only the most powerful people were cremated.", "The bones were probably placed there by mistake."], correct: 1, image: "museum/roman_cremation_urn.jpg", rationale: "Cremation urns provide evidence of burial customs and beliefs about death." },
      { id: 'rm_6', name: "Lead Isotope Teeth", type: "remains", discoveryMethod: "Studied in a lab to find minerals in the teeth.", clue: "Teeth that have lead and minerals from a far-away place.", question: "What can minerals in teeth help archaeologists investigate?", options: ["Where a person lived, moved or what environment affected them.", "They prove people used lead as a food spice.", "They prove the lead always came from local soil.", "They show the person definitely worked in a lead factory."], correct: 0, image: "museum/roman_lead_isotope_teeth.jpg", rationale: "Scientific testing of teeth helps investigate movement, diet, health and environment." },

      { id: 'rm_7', name: "Aqueduct Arch", type: "structures", discoveryMethod: "Measured above ground to see how it was built.", clue: "A giant stone bridge that carried water into the city.", question: "What does an aqueduct tell historians about Roman cities?", options: ["It was mainly a decorative city gateway.", "It shows engineering skill and the organised supply of water.", "It was mainly built to stop people moving around.", "It was a high platform only for religious parades."], correct: 1, image: "museum/roman_aqueduct_arch.jpg", rationale: "Aqueducts show engineering, planning and the importance of water supply in Roman cities." },
      { id: 'rm_8', name: "Hypocaust", type: "structures", discoveryMethod: "Dug under a floor to see what was beneath it.", clue: "A system of pillars that let hot air flow under the floor.", question: "What does a hypocaust system tell us about Roman technology?", options: ["It was designed mostly to stop floors getting wet.", "It shows advanced heating technology for buildings and baths.", "It was mainly a cold basement for storing food.", "It was built as a secret escape tunnel."], correct: 1, image: "museum/roman_hypocaust.jpg", rationale: "A hypocaust is evidence of engineering and comfort in some Roman buildings." },
      { id: 'rm_9', name: "Mosaic Floor", type: "structures", discoveryMethod: "Cleaned with brushes and sponges to show the colors.", clue: "A floor made of thousands of tiny colored stones.", question: "What does a detailed mosaic floor tell us about Roman homes?", options: ["Wealthy people could use art and design to show taste or status.", "Mosaic floors were mainly maps for rituals.", "They were used mostly as non-slip sports flooring.", "The colours were used to tell the time."], correct: 0, image: "museum/roman_mosaic_floor.jpg", rationale: "Mosaics reveal wealth, art, design, values and social status." },

      { id: 'rm_10', name: "Volcanic Ash Layer", type: "environment", discoveryMethod: "Found by looking at the layers of soil in a hole.", clue: "A thick layer of ash and rock covering the city.", question: "What does a volcanic ash layer help archaeologists understand?", options: ["It was probably a building material brought from far away.", "It shows how a natural disaster suddenly buried or preserved a site.", "It was most likely ash from ordinary factory fires.", "It was mainly used as garden fertilizer."], correct: 1, image: "museum/roman_volcanic_ash_layer.jpg", rationale: "Environmental layers explain how a site was destroyed, preserved or changed." },
      { id: 'rm_11', name: "Olive Pits", type: "environment", discoveryMethod: "Found in an old sewer drain.", clue: "Thousands of old seeds from olive fruits.", question: "What do thousands of olive pits in an ancient drain tell us?", options: ["They were used mainly as heating fuel.", "Olives were likely important in diet, trade or everyday life.", "They were used as small weapons.", "Olive trees were grown only for wood."], correct: 1, image: "museum/roman_olive_pits.jpg", rationale: "Food remains reveal diet, farming, trade and daily habits." },
      { id: 'rm_12', name: "Dormouse Bones", type: "environment", discoveryMethod: "Sifted from a special clay jar.", clue: "Bones of small rodents found inside a clay pot.", question: "What do dormouse bones in a special jar tell us about Roman food?", options: ["They show there was only a rodent problem in the market.", "They show some Romans raised and ate dormice as a luxury food.", "They prove dormice were kept only as sacred pets.", "They show mice accidentally got trapped during a flood."], correct: 1, image: "museum/roman_dormouse_bones.jpg", rationale: "Animal remains reveal diet, wealth and unusual food customs." },

      { id: 'rm_13', name: "Wax Tablet", type: "written", discoveryMethod: "Found in wet mud which kept the wood from rotting.", clue: "A wooden board with wax that was written on with a pen.", question: "What does a wax writing tablet tell us about Roman communication?", options: ["People used reusable writing tools for notes, school or business.", "It was mainly used as a lamp.", "It was mainly used to seal letters.", "It was only a cover for expensive paper."], correct: 0, image: "museum/roman_wax_tablet.jpg", rationale: "Wax tablets are written evidence of communication, education and administration." },
      { id: 'rm_14', name: "Monumental Inscription", type: "written", discoveryMethod: "Photographed and studied on a public building.", clue: "Large letters carved deeply into a marble slab.", question: "What does a large public inscription tell us?", options: ["It was a secret code for government taxes.", "Public writing could communicate messages, honours or information to people.", "The letters were only decorative and never read.", "The stone was mainly used to test building weight."], correct: 1, image: "museum/roman_inscription.jpg", rationale: "Public inscriptions reveal politics, status, public messages and literacy." },
      { id: 'rm_15', name: "Carbonized Scroll", type: "written", discoveryMethod: "Scanned with a special machine to read without unrolling.", clue: "A paper scroll burnt to charcoal by a volcano.", question: "What does a carbonized scroll help historians understand?", options: ["It can preserve evidence of books, ideas, laws or records.", "It was mainly used as a fire starter.", "It was mainly used to store herbs.", "It was used to make fishing nets."], correct: 0, image: "museum/roman_carbonized_scroll.jpg", rationale: "Scrolls are written evidence that reveal ideas, laws, records and literature." }
    ]
  },
  {
    id: 'china',
    name: 'The Eastern Dynasties',
    civilization: 'Ancient China',
    spark: 'Unearth the treasures of the Eastern Dynasties and the origins of writing.',
    historicalContext: 'Ancient Chinese history lasted for thousands of years. Discoveries like the Terracotta Army and Oracle Bones show a society with early writing and complex beliefs.',
    evidence: [
      { id: 'ch_1', name: "Bronze Ding", type: "objects", discoveryMethod: "Dug up from a high-status burial pit.", clue: "A massive, heavy metal pot standing on three legs.", question: "What does a large bronze ding tell us about power and beliefs?", options: ["It was mainly used for everyday cooking in small villages.", "Ritual, status and power were connected in society.", "It was mainly used to store grain.", "It was mainly a musical instrument."], correct: 1, image: "museum/china_bronze_ding.jpg", rationale: "A bronze ding suggests elite status, ritual practice and political or religious power." },
      { id: 'ch_2', name: "Terracotta Fragment", type: "objects", discoveryMethod: "Dug up from a huge trench with brushes.", clue: "A piece of a life-sized clay soldier.", question: "What does a life-sized terracotta soldier fragment tell us about the emperor's tomb?", options: ["People created figures to protect or serve the emperor in the afterlife.", "The statues showed ordinary people in China.", "The clay pieces were used mainly to hold up a roof.", "The statues were made for a public park."], correct: 0, image: "museum/china_terracotta_fragment.jpg", rationale: "Terracotta soldiers show beliefs about power, death and the afterlife." },
      { id: 'ch_3', name: "Jade Ornament", type: "objects", discoveryMethod: "Found using a fine screen in a tomb.", clue: "A beautifully carved green stone disc.", question: "What does a carved jade ornament tell us about ancient Chinese values?", options: ["Jade was used only for sharp knives.", "Jade could represent purity, status, wealth or sacred meaning.", "Jade was used only as money.", "Jade was mainly used as a blanket weight."], correct: 1, image: "museum/china_jade_ornament.jpg", rationale: "Jade objects reveal beliefs, status and the importance of valued materials." },

      { id: 'ch_4', name: "Chariot Horse Skeletons", type: "remains", discoveryMethod: "Found in a pit next to an old wooden chariot.", clue: "Bones of several horses buried in a neat line.", question: "What do carefully buried horse skeletons tell us about status and belief?", options: ["The horses probably died from a random sickness.", "They may show sacrifice, status and beliefs about the afterlife.", "They were buried only to mark a battle site.", "The pit was simply a place for old horses."], correct: 1, image: "museum/china_horse_skeletons.png", rationale: "Animal remains in tomb contexts show status, ritual and beliefs about death." },
      { id: 'ch_5', name: "Silk-Wrapped Bones", type: "remains", discoveryMethod: "Studied under a microscope to find tiny fibers.", clue: "Human bones that have tiny bits of silk thread on them.", question: "What do silk fibres found with human bones tell us?", options: ["The silk probably came from spiders in the tomb.", "Silk was only used as a medical bandage.", "It shows skilled silk production and high-status clothing or burial practice.", "Silk was used only for religious decorations."], correct: 2, image: "museum/china_silk_wrapped_bones.jpg", rationale: "Silk fibres reveal technology, clothing, status and burial customs." },
      { id: 'ch_6', name: "Laborer Skeletons", type: "remains", discoveryMethod: "Found buried together inside a large wall.", clue: "Skeletons showing signs of hard work and not enough food.", question: "What do skeletons showing hard work and poor nutrition tell us?", options: ["They were athletes who died during a race.", "They were soldiers who died defending the wall.", "They were buried only to make the wall stronger.", "They show forced labour and the human cost of large building projects."], correct: 3, image: "museum/china_laborer_skeletons.jpg", rationale: "Human remains provide evidence about labour, health, inequality and the cost of major construction." },

      { id: 'ch_7', name: "Rammed Earth Wall", type: "structures", discoveryMethod: "Measured with GPS and soil samples.", clue: "A massive wall made of very tightly packed dirt.", question: "What does a massive rammed earth wall tell us about government organisation?", options: ["Leaders could organise workers, materials and large construction projects.", "It was mainly built to stop fields from flooding.", "It was only a farm boundary marker.", "It was mainly a raised road."], correct: 0, image: "museum/china_rammed_earth_wall.jpg", rationale: "Large walls show organisation, planning, labour and political power." },
      { id: 'ch_8', name: "Wooden Pagoda Foundation", type: "structures", discoveryMethod: "Dug up to show the stone bases for tall wooden poles.", clue: "A square base made to hold up a very tall wooden tower.", question: "What does a strong foundation for a tall wooden structure tell us?", options: ["It was mainly built to hold a giant statue.", "It shows advanced building knowledge and vertical architecture.", "It was only a lookout for fires.", "It was mainly built to protect wood from animals."], correct: 1, image: "museum/china_wooden_pagoda.jpg", rationale: "Foundations reveal construction methods, engineering and religious or cultural buildings." },
      { id: 'ch_9', name: "Ceramic Kiln", type: "structures", discoveryMethod: "Found near a huge pile of ash and broken pots.", clue: "A large oven built into a hillside.", question: "What does a large ceramic kiln tell us about production and technology?", options: ["It was used mainly to bake sacred bread.", "People produced pottery using specialised technology.", "It was mainly a heater for a village.", "It was mainly a furnace for bronze weapons."], correct: 1, image: "museum/china_ceramic_kiln.jpg", rationale: "A kiln shows craft production, technology and specialised work." },

      { id: 'ch_10', name: "Rice Grains", type: "environment", discoveryMethod: "Found in a wet pit using water to float the seeds.", clue: "Burnt grains of farmed rice.", question: "What do burnt rice grains tell us about food and farming?", options: ["Rice farming was important for food.", "Rice was used only for special wine.", "Rice was always imported as a luxury.", "Rice was used mainly to pay workers."], correct: 0, image: "museum/china_rice_grains.jpg", rationale: "Plant remains reveal farming, diet and environmental adaptation." },
      { id: 'ch_11', name: "Mulberry Leaves", type: "environment", discoveryMethod: "Found inside a sealed jar.", clue: "Leaves from a Mulberry tree.", question: "What do mulberry leaves tell us about silk production?", options: ["They were grown mainly for medicinal tea.", "They may have been used to feed silkworms for silk production.", "They were mainly used as building material.", "They were grown only to feed farm animals."], correct: 1, image: "museum/china_mulberry_leaves.jpg", rationale: "Mulberry leaves connect environmental evidence to silk technology and economic activity." },
      { id: 'ch_12', name: "Millet Seeds", type: "environment", discoveryMethod: "Sifted from an old fireplace in the north.", clue: "Tiny seeds of a grain that grows in dry places.", question: "What do millet seeds tell us about farming in northern China?", options: ["Millet was used only to feed pet birds.", "People grew crops suited to dry conditions.", "Millet seeds were mainly used to make concrete.", "Millet was only a weed that grew by accident."], correct: 1, image: "museum/china_millet_seeds.jpg", rationale: "Millet seeds help historians understand farming choices, climate and diet." },

      { id: 'ch_13', name: "Oracle Bone", type: "written", discoveryMethod: "Dug up and studied by language experts.", clue: "A turtle shell with symbols carved into it.", question: "What does an oracle bone tell us about belief and writing?", options: ["People used writing to try and communicate with spirits or predict the future.", "It was mainly used as expensive money.", "It was only a secret merchant code.", "It was only a decorative plaque."], correct: 0, image: "museum/china_oracle_bone.jpg", rationale: "Oracle bones show early writing and beliefs about prophecy, ancestors or spirits." },
      { id: 'ch_14', name: "Bamboo Slips", type: "written", discoveryMethod: "Dug up from a dry tomb and unrolled carefully.", clue: "Strips of bamboo tied together with writing on them.", question: "What do bamboo slips with writing tell us about government or learning?", options: ["Information could be recorded, stored and shared.", "They were mainly used as building material.", "They were only used as firewood.", "They were mainly used as musical instruments."], correct: 0, image: "museum/china_bamboo_slips.jpg", rationale: "Bamboo slips are written evidence that reveal administration, laws, learning or records." },
      { id: 'ch_15', name: "Bronze Inscription", type: "written", discoveryMethod: "Cleaned carefully in a lab.", clue: "Symbols carved inside a metal ritual pot.", question: "What does writing cast into bronze tell us?", options: ["Bronze objects were only decorative.", "Important messages, ownership, power or ritual memory could be preserved.", "Writing was used only by farmers.", "Bronze was used mainly because paper was unavailable."], correct: 1, image: "museum/china_bronze_inscription.jpg", rationale: "Bronze inscriptions preserve official, ritual or family messages and reveal power, memory and belief." }
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
    correct: 1,
    image: "museum/plastic_water_bottle.jpg"
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
    correct: 1,
    image: "museum/modern_coin.jpg"
  }
];

const BUREAU_CLUE_TYPES = ['Location', 'Rulers', 'Buildings', 'Beliefs', 'Inventions', 'Mysteries'];

const groupBureauProfileFacts = (caseItem) => {
  const rawFacts = caseItem.profileFacts || {};

  if (!Array.isArray(rawFacts)) {
    return BUREAU_CLUE_TYPES.reduce((acc, clueType) => {
      const value = rawFacts[clueType];
      if (Array.isArray(value)) {
        acc[clueType] = value.filter(Boolean);
      } else if (value) {
        acc[clueType] = [value];
      }
      return acc;
    }, {});
  }

  return rawFacts.reduce((acc, fact, index) => {
    const clueType = caseItem.clueTiers?.[index]?.category || BUREAU_CLUE_TYPES[index] || 'Mysteries';
    if (!acc[clueType]) acc[clueType] = [];
    if (fact) acc[clueType].push(fact);
    return acc;
  }, {});
};

const flattenBureauProfileFacts = (profileFacts) => {
  if (Array.isArray(profileFacts)) return profileFacts.filter(Boolean);
  return BUREAU_CLUE_TYPES.flatMap(clueType => profileFacts?.[clueType] || []).filter(Boolean);
};

const createBureauCase = (caseItem) => {
  const groupedProfileFacts = groupBureauProfileFacts(caseItem);
  const flatProfileFacts = flattenBureauProfileFacts(groupedProfileFacts);

  return {
    ...caseItem,
    clueTiers: caseItem.clueTiers || [],
    tier1SiteClue: caseItem.clueTiers?.[0]?.text || caseItem.tier1SiteClue || '',
    tier2SocietyClue: caseItem.clueTiers?.[1]?.text || caseItem.tier2SocietyClue || '',
    tier3LegacyClue: caseItem.clueTiers?.[2]?.text || caseItem.tier3LegacyClue || '',
    civilisationOptions: caseItem.civilisationOptions || [caseItem.civilisation],
    correctCivilisation: Number.isInteger(caseItem.correctCivilisation) ? caseItem.correctCivilisation : 0,
    answerOptions: caseItem.answerOptions || caseItem.civilisationOptions || [caseItem.civilisation],
    correctAnswer: Number.isInteger(caseItem.correctAnswer) ? caseItem.correctAnswer : 0,
    profileFacts: groupedProfileFacts,
    keywords: flattenBureauProfileFacts(caseItem.keywords || flatProfileFacts),
  };
};

const BUREAU_CASES_RAW = [
  {
    id: 'bureau_1',
    civilisation: 'Ancient Egypt',
    round: 'training',
    thumbnail: 'assets/civilisations/profile-egypt.png',
    caseTitle: 'The Desert River File',
    dateRange: '3150 BC - 30 BC',
    clueTiers: [
      {
        tier: 1,
        category: 'Location',
        text: 'This civilisation developed near a river in a desert region. Flooding helped people grow extra food.',
      },
      {
        tier: 2,
        category: 'Rulers',
        text: 'Pharaohs were seen as powerful rulers linked to the gods.',
      },
      {
        tier: 3,
        category: 'Buildings',
        text: 'People built pyramids and tombs to protect important burials.',
      },
    ],
    profileFacts: {
      Location: ['flooding helped farming'],
      Rulers: ['rulers were linked to gods'],
      Buildings: ['pyramids were tombs'],
    },
    keywords: ['Nile Flood', 'Pharaohs', 'Pyramids'],
    explanation: 'Flooding, pharaohs, and pyramids point clearly to Ancient Egypt.',
  },
  {
    id: 'bureau_2',
    civilisation: 'Ancient Greece',
    round: 'training',
    thumbnail: 'assets/civilisations/profile-greece.png',
    caseTitle: 'The Harbour File',
    dateRange: '800 BC - 146 BC',
    clueTiers: [
      {
        tier: 1,
        category: 'Location',
        text: 'This civilisation developed on a mountainous peninsula with many islands and natural harbours.',
      },
      {
        tier: 2,
        category: 'Rulers',
        text: 'Different city-states used different systems, including democracy in Athens and soldiers in Sparta.',
      },
      {
        tier: 3,
        category: 'Buildings',
        text: 'Temples, theatres, and stone columns were common.',
      },
    ],
    profileFacts: {
      Location: ['mountainous peninsula with many islands and natural harbours'],
      Rulers: ['Athens used democracy'],
      Buildings: ['temples, theatres, and stone columns'],
    },
    keywords: ['City-States', 'Democracy', 'Sparta'],
    explanation: 'The city-states and ideas like democracy point clearly to Ancient Greece.',
  },
  {
    id: 'bureau_3',
    civilisation: 'Ancient Rome',
    round: 'training',
    thumbnail: 'assets/civilisations/profile-rome.png',
    caseTitle: 'The Road File',
    dateRange: '753 BC - 476 AD',
    clueTiers: [
      {
        tier: 1,
        category: 'Location',
        text: 'This civilisation developed near hills and the coast of a major inland sea.',
      },
      {
        tier: 2,
        category: 'Rulers',
        text: 'It had a senate and later emperors.',
      },
      {
        tier: 3,
        category: 'Buildings',
        text: 'Roads, aqueducts, and amphitheatres linked the empire.',
      },
    ],
    profileFacts: {
      Location: ['hills and the coast of a major inland sea'],
      Rulers: ['had a senate', 'became an empire'],
      Buildings: ['roads, aqueducts, and amphitheatres'],
    },
    keywords: ['Senate', 'Laws', 'Empire'],
    explanation: 'The senate, laws, and roads point clearly to Ancient Rome.',
  },
  {
    id: 'bureau_4',
    civilisation: 'Ancient China',
    round: 'training',
    thumbnail: 'assets/civilisations/profile-china.png',
    caseTitle: 'The River Dynasty File',
    dateRange: '1600 BC - 220 AD',
    clueTiers: [
      {
        tier: 1,
        category: 'Location',
        text: 'This civilisation developed near a powerful river system where floods could be dangerous but also helped farming.',
      },
      {
        tier: 2,
        category: 'Rulers',
        text: 'It was ruled by dynasties, or ruling families.',
      },
      {
        tier: 3,
        category: 'Inventions',
        text: 'It invented paper and built early walls.',
      },
    ],
    profileFacts: {
      Location: ['powerful river system where floods helped farming'],
      Rulers: ['ruled by dynasties'],
      Inventions: ['invented paper', 'built early walls'],
    },
    keywords: ['Dynasties', 'Paper', 'Walls'],
    explanation: 'Dynasties, paper, and early walls point clearly to Ancient China.',
  },
  {
    id: 'bureau_5',
    civilisation: 'Maya',
    round: 'training',
    thumbnail: 'assets/civilisations/profile-maya.png',
    caseTitle: 'The Temple Sky File',
    dateRange: '2000 BC - 1500 AD',
    clueTiers: [
      {
        tier: 1,
        category: 'Location',
        text: 'This civilisation developed in a tropical rainforest and lowland region with large cities and temples.',
      },
      {
        tier: 2,
        category: 'Beliefs',
        text: 'People studied stars and planets to track time and plan calendars.',
      },
      {
        tier: 3,
        category: 'Buildings',
        text: 'They built religious pyramids.',
      },
    ],
    profileFacts: {
      Location: ['tropical rainforest and lowland region'],
      Beliefs: ['studied stars and planets', 'used calendars'],
      Buildings: ['built religious pyramids'],
    },
    keywords: ['Calendars', 'Stars', 'Pyramids'],
    explanation: 'Calendars, astronomy, and religious pyramids point clearly to the Maya.',
  },
  {
    id: 'bureau_6',
    civilisation: 'Inca',
    round: 'training',
    thumbnail: 'assets/civilisations/profile-inca.png',
    caseTitle: 'The Mountain Cord File',
    dateRange: '1438 AD - 1533 AD',
    clueTiers: [
      {
        tier: 1,
        category: 'Location',
        text: 'This civilisation developed in high mountains with steep land and different climates.',
      },
      {
        tier: 2,
        category: 'Rulers',
        text: 'Rulers organised labour, roads, storehouses, and terrace farming across difficult terrain.',
      },
      {
        tier: 3,
        category: 'Mysteries',
        text: 'It is linked to knotted cords used to keep records and to Machu Picchu.',
      },
    ],
    profileFacts: {
      Location: ['high mountains and the Andes'],
      Rulers: ['organised labour, roads, storehouses, and terrace farming'],
      Mysteries: ['used knotted cords to keep records', 'built mountain roads'],
    },
    keywords: ['Quipu', 'Andes', 'Machu Picchu'],
    explanation: 'The Andes, quipu, and mountain roads point clearly to the Inca.',
  },
  {
    id: 'bureau_7',
    civilisation: 'Indus Valley',
    round: 'challenge',
    caseTitle: 'The Drainage File',
    dateRange: '2600 BC - 1900 BC',
    clueTiers: [
      {
        tier: 1,
        category: 'Location',
        text: 'This civilisation developed near a river system where floods and seasonal rains helped farming.',
      },
      {
        tier: 2,
        category: 'Buildings',
        text: 'Its cities had drainage systems and straight streets.',
      },
      {
        tier: 3,
        category: 'Mysteries',
        text: 'Its writing has not been fully translated.',
      },
    ],
    profileFacts: {
      Location: ['river system, floods and seasonal rains'],
      Buildings: ['cities had drainage systems and straight streets'],
      Mysteries: ['writing has not been fully translated', 'used standard weights and seals'],
    },
    keywords: ['Drainage', 'Untranslated Writing', 'Seals'],
    explanation: 'Drainage systems and the still-mysterious writing point clearly to the Indus Valley.',
  },
  {
    id: 'bureau_8',
    civilisation: 'Babylon / Mesopotamia',
    round: 'challenge',
    caseTitle: 'The Two Rivers File',
    dateRange: '1894 BC - 539 BC',
    clueTiers: [
      {
        tier: 1,
        category: 'Location',
        text: 'This civilisation developed between two major rivers in a dry region where farming villages became cities.',
      },
      {
        tier: 2,
        category: 'Buildings',
        text: 'People built temples and ziggurats.',
      },
      {
        tier: 3,
        category: 'Rulers',
        text: 'It was known for laws and scribes who helped manage city life.',
      },
    ],
    profileFacts: {
      Location: ['located between two rivers'],
      Buildings: ['built temples and ziggurats'],
      Rulers: ['known for laws and scribes'],
    },
    keywords: ['Two Rivers', 'Laws', 'Ziggurat'],
    explanation: 'The two rivers, laws, and ziggurats point clearly to Babylon / Mesopotamia.',
  },
  {
    id: 'bureau_9',
    civilisation: 'Persia',
    round: 'challenge',
    caseTitle: 'The Empire Road File',
    dateRange: '550 BC - 330 BC',
    clueTiers: [
      {
        tier: 1,
        category: 'Location',
        text: 'This civilisation controlled dry plateaus and mountain regions that connected the East with the Mediterranean world.',
      },
      {
        tier: 2,
        category: 'Rulers',
        text: 'It used governors to manage far-off places.',
      },
      {
        tier: 3,
        category: 'Beliefs',
        text: 'It allowed different religions and ruled a large empire.',
      },
    ],
    profileFacts: {
      Location: ['dry plateaus and mountain regions'],
      Rulers: ['used governors'],
      Beliefs: ['allowed different religions'],
    },
    keywords: ['Governors', 'Religions', 'Empire'],
    explanation: 'Governors, religious tolerance, and the large empire point clearly to Persia.',
  },
  {
    id: 'bureau_10',
    civilisation: 'Byzantine',
    round: 'challenge',
    caseTitle: 'The Coastal City File',
    dateRange: '330 AD - 1453 AD',
    clueTiers: [
      {
        tier: 1,
        category: 'Location',
        text: 'This empire was centred on a coastal city that connected important trade routes.',
      },
      {
        tier: 2,
        category: 'Rulers',
        text: 'It was the Eastern Roman Empire.',
      },
      {
        tier: 3,
        category: 'Buildings',
        text: 'Justinian created a law code and the capital was Constantinople.',
      },
    ],
    profileFacts: {
      Location: ['coastal city that connected important trade routes'],
      Rulers: ['Eastern Roman Empire', 'Justinian created a law code'],
      Buildings: ['capital was Constantinople'],
    },
    keywords: ['Constantinople', 'Justinian', 'Eastern Roman Empire'],
    explanation: 'Constantinople, Justinian, and the Eastern Roman Empire point clearly to Byzantine.',
  },
  {
    id: 'bureau_11',
    civilisation: 'Ottoman',
    round: 'challenge',
    caseTitle: 'The Crossroads File',
    dateRange: '1299 AD - 1922 AD',
    clueTiers: [
      {
        tier: 1,
        category: 'Location',
        text: 'This empire controlled land around a major crossing point between Europe and Asia.',
      },
      {
        tier: 2,
        category: 'Rulers',
        text: 'It was ruled by sultans.',
      },
      {
        tier: 3,
        category: 'Buildings',
        text: 'It renamed Constantinople Istanbul.',
      },
    ],
    profileFacts: {
      Location: ['crossroads between Europe and Asia'],
      Rulers: ['ruled by sultans'],
      Buildings: ['renamed Constantinople Istanbul'],
    },
    keywords: ['Sultans', 'Istanbul', 'Crossroads'],
    explanation: 'Sultans, Istanbul, and the crossroads location point clearly to the Ottoman Empire.',
  },
  {
    id: 'bureau_12',
    civilisation: 'Aztec',
    round: 'challenge',
    caseTitle: 'The Island Capital File',
    dateRange: '1428 AD - 1521 AD',
    clueTiers: [
      {
        tier: 1,
        category: 'Location',
        text: 'This civilisation built its capital on an island in a lake, surrounded by mountains.',
      },
      {
        tier: 2,
        category: 'Beliefs',
        text: 'The sun was important in its beliefs.',
      },
      {
        tier: 3,
        category: 'Rulers',
        text: 'It was ruled by an emperor.',
      },
    ],
    profileFacts: {
      Location: ['capital was built on an island'],
      Beliefs: ['sun was important'],
      Rulers: ['ruled by an emperor'],
    },
    keywords: ['Tenochtitlan', 'Sun', 'Emperor'],
    explanation: 'The island capital, the sun, and the emperor point clearly to the Aztec.',
  },
];

export const BUREAU_CASES = BUREAU_CASES_RAW.map(createBureauCase);

export const BUREAU_COMPARISON_CHALLENGES = [
  {
    civilisations: ['Ancient Egypt', 'Indus Valley Civilisation'],
    title: 'Ancient Egypt + Indus Valley Civilisation',
    question: 'What was similar about Ancient Egypt and the Indus Valley Civilisation?',
    options: [
      'Both developed near rivers that supported farming, settlement, and larger communities.',
      'Both show the same burial customs.',
      'Both were built with modern machines.',
      'Both avoided writing and measurement.',
    ],
    correctAnswer: 0,
    explanation: 'Correct. Rivers helped both civilisations grow because they provided water, fertile soil, farming, and a place to settle.',
  },
  {
    civilisations: ['Ancient Greece', 'Ancient Rome'],
    title: 'Ancient Greece + Ancient Rome',
    question: 'What was similar about Ancient Greece and Ancient Rome?',
    options: [
      'Both left evidence of government, law, public life, architecture, and long-term influence.',
      'Both show the same river farming system.',
      'Both avoided public writing.',
      'Both were isolated from later history.',
    ],
    correctAnswer: 0,
    explanation: 'Correct. Both civilisations left strong evidence of government, law, public life, architecture, and long-term influence.',
  },
  {
    civilisations: ['Ancient China', 'Mayan Civilisation'],
    title: 'Ancient China + Mayan Civilisation',
    question: 'What was similar about Ancient China and the Mayan Civilisation?',
    options: [
      'Both show knowledge systems using writing, records, calendars, beliefs, or astronomy.',
      'Both show desert trade only.',
      'Both had no interest in calendars.',
      'Both relied on metal coins.',
    ],
    correctAnswer: 0,
    explanation: 'Correct. Both civilisations left writing, records, calendars, beliefs, and other knowledge systems.',
  },
  {
    civilisations: ['Babylonian Empire', 'Persian Empire'],
    title: 'Babylonian Empire + Persian Empire',
    question: 'What was similar about the Babylonian Empire and the Persian Empire?',
    options: [
      'Both show rulers using law, records, officials, and control to manage people and places.',
      'Both were small village communities.',
      'Both had no records.',
      'Both relied only on fishing.',
    ],
    correctAnswer: 0,
    explanation: 'Correct. Both empires used laws, records, and officials to help control large groups of people.',
  },
  {
    civilisations: ['Byzantine Empire', 'Ottoman Empire'],
    title: 'Byzantine Empire + Ottoman Empire',
    question: 'What was similar about the Byzantine Empire and the Ottoman Empire?',
    options: [
      'Both show Constantinople/Istanbul as a powerful centre where empire, trade, religion, and control changed over time.',
      'Both show the same tomb rituals.',
      'Both avoided city life.',
      'Both had no links to government.',
    ],
    correctAnswer: 0,
    explanation: 'Correct. The same important city mattered to both empires, so historians can see continuity and change over time.',
  },
  {
    civilisations: ['Inca Empire', 'Aztec Empire'],
    title: 'Inca Empire + Aztec Empire',
    question: 'What was similar about the Inca Empire and the Aztec Empire?',
    options: [
      'Both show powerful American empires using religion, tribute or labour, and organisation before Spanish arrival.',
      'Both show the same ocean trade routes.',
      'Both were modern industrial states.',
      'Both had no state control.',
    ],
    correctAnswer: 0,
    explanation: 'Correct. Both were powerful American empires that organised people, resources, religion, and power before Spanish arrival.',
  },
];

export const BUREAU_COMPARISON_DATA = BUREAU_COMPARISON_CHALLENGES;
export const BUREAU_COMPARISON_PAIRS = BUREAU_COMPARISON_CHALLENGES;
export const BUREAU_COMPARISONS = BUREAU_COMPARISON_CHALLENGES;
export const BUREAU_CASE_COMPARISONS = BUREAU_COMPARISON_CHALLENGES;

export const BUREAU_RESEARCH_FOCUS = Object.fromEntries(BUREAU_CASES.map((bureauCase) => ([
  bureauCase.civilisation,
  {
    spark: `${bureauCase.civilisation} fingerprinting`,
    lookFor: bureauCase.profileFacts,
    inquiryQuestion: `Which evidence most strongly points to ${bureauCase.civilisation}?`,
    evidenceReminder: 'Use the profile card to support your historical reasoning.',
  },
])));
