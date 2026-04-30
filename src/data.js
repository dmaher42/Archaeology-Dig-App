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
    description: 'A huge sandstorm is blowing in! We need to hurry before the site is covered.',
    icon: Wind,
    time: 90,
    dangerColor: '#E89E5D'
  },
  {
    id: 'flood',
    title: 'Flash Flood Warning!',
    description: 'Heavy rain is flooding the site! We have to get the items out now.',
    icon: Droplets,
    time: 75,
    dangerColor: '#3b82f6'
  },
  {
    id: 'looters',
    title: 'Looters Spotted!',
    description: 'Tomb raiders are nearby. We must finish our work before they arrive!',
    icon: AlertTriangle,
    time: 80,
    dangerColor: '#f59e0b'
  },
  {
    id: 'nightfall',
    title: 'Generator Failure!',
    description: 'The power is out and it is getting dark! We cannot dig in the pitch black.',
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
      { id: 'eg_1', name: "Canopic Jar", type: "objects", discoveryMethod: "Dug up carefully in an underground tomb using small brushes.", clue: "A stone jar with a lid shaped like an animal head.", question: "What was this jar most likely used for?", options: ["To keep internal organs safe for the afterlife", "To store expensive oils and perfumes", "To hold the ashes of a common person", "To store sacred grains for food"], correct: 0, image: "museum/egypt_canopic_jar.png", rationale: "Egyptians believed the body had to be kept whole for the soul to recognize it. They put organs in four special jars during mummification." },
      { id: 'eg_2', name: "Faience Amulet", type: "objects", discoveryMethod: "Found by sifting sand through a fine screen.", clue: "A bright blue bead shaped like a beetle (scarab).", question: "Why did people carry these amulets?", options: ["As a magical lucky charm for protection", "As a way to show how much money they had", "As a coin to buy things at the temple", "As a small toy for children"], correct: 0 },
      { id: 'eg_3', name: "Bronze Mirror", type: "objects", discoveryMethod: "Found with a metal detector near old houses.", clue: "A shiny metal disc with a decorated handle.", question: "What does this mirror tell us about the people?", options: ["They used them to bounce sunlight into dark rooms", "They cared about their looks and social status", "Soldiers used them to send signals", "Priests used them for magic rituals"], correct: 1 },
      
      { id: 'eg_4', name: "Mummified Remains", type: "remains", discoveryMethod: "Found inside a stone coffin and scanned with an X-ray.", clue: "A human body dried with salts and wrapped in cloth.", question: "How was this body preserved?", options: ["They used special chemicals to keep the body from rotting", "A rare disease turned the skin hard", "It was a natural change caused by the hot desert air", "They used fire to dry the skin"], correct: 0, image: "museum/egypt_mummy.png" },
      { id: 'eg_5', name: "Cat Skeleton", type: "remains", discoveryMethod: "Dug up in a special animal graveyard.", clue: "Bones of a cat that were carefully wrapped in cloth.", question: "Why were cats buried like this?", options: ["They were kept as guards for the house", "Cats were seen as sacred symbols of gods", "They were used to help soldiers in battle", "They were the only animals allowed in tombs"], correct: 1 },
      { id: 'eg_6', name: "Worn Human Teeth", type: "remains", discoveryMethod: "Taken from a jawbone and looked at under a microscope.", clue: "Human teeth that are ground down and very flat.", question: "Why were their teeth so worn down?", options: ["They used their teeth as tools to soften leather", "Their bread had tiny bits of sand and grit in it", "It was a genetic problem that everyone had", "They sharpened their teeth to look like warriors"], correct: 1 },

      { id: 'eg_7', name: "Mudbrick Wall", type: "structures", discoveryMethod: "Found by looking at the different soil colors in a trench.", clue: "A thick wall made of dried mud and straw.", question: "Why did they use mud to build walls?", options: ["They used local materials to build strong houses", "The bricks were only used for fancy floors", "They brought the mud from other countries", "It was a temporary marker for a bigger stone wall"], correct: 0 },
      { id: 'eg_8', name: "Limestone Block", type: "structures", discoveryMethod: "Found using radar that sees through the ground.", clue: "A giant, perfectly cut stone block weighing 2 tons.", question: "What does this huge block show us?", options: ["It is a natural rock shaped by the wind", "They were experts at engineering and organizing workers", "It was built to stop the river from flooding", "It was a simple marker for a farm"], correct: 1 },
      { id: 'eg_9', name: "Tomb Shaft", type: "structures", discoveryMethod: "Found by clearing rocks from a vertical tunnel.", clue: "A deep hole in the ground leading to a hidden room.", question: "Why did they build these deep shafts?", options: ["To stay cool and hide from the hot sun", "To hide the tomb and protect it from robbers", "To reach water deep underground", "To use as a trash pit for old building materials"], correct: 1 },

      { id: 'eg_10', name: "Flax Seeds", type: "environment", discoveryMethod: "Found by mixing soil with water until the seeds floated.", clue: "Ancient seeds from a flax plant.", question: "What did they use flax for?", options: ["To make linen cloth for clothes and sails", "As a type of money for buying goods", "To make oil for lamps in the temple", "They just found it growing wild and didn't farm it"], correct: 0 },
      { id: 'eg_11', name: "Nile Silt Layer", type: "environment", discoveryMethod: "Taken from deep underground using a core drill.", clue: "A thick layer of rich, dark river mud.", question: "Why is this mud layer so important?", options: ["An earthquake caused the mud to sink", "The annual river floods created great farmland", "They moved the mud here to build their cities", "It shows a giant flood that destroyed everyone"], correct: 1 },
      { id: 'eg_12', name: "Dried Papyrus Reeds", type: "environment", discoveryMethod: "Found preserved in the dry desert sand.", clue: "Stems of a plant that grows in wet marshes.", question: "What was papyrus used for?", options: ["To make paper, boats, and baskets", "It was a weed that caused problems for farmers", "It was a strong material for building houses", "It was used as medicine for the rich"], correct: 0 },

      { id: 'eg_13', name: "Papyrus Scroll", type: "written", discoveryMethod: "Found inside a sealed jar and handled with gloves.", clue: "A thin sheet made of reeds with ink writing on it.", question: "What was usually written on these scrolls?", options: ["Taxes, laws, and ancient stories", "They were used as wallpaper for bedrooms", "Shopping lists for trading with other tribes", "Maps for sailors to use at sea"], correct: 0 },
      { id: 'eg_14', name: "Hieroglyph Carving", type: "written", discoveryMethod: "Found on a ruined wall and scanned with a laser.", clue: "Symbols like eyes, birds, and snakes carved into stone.", question: "What was the purpose of these symbols?", options: ["They were just decorations with no meaning", "It was a complex way of writing for religious texts", "It was a secret code used by soldiers", "It was a simple way to count cows"], correct: 1, image: "museum/egypt_hieroglyphs.png" },
      { id: 'eg_15', name: "Ostracon", type: "written", discoveryMethod: "Dug up in an ancient trash pile.", clue: "A broken piece of pottery with quick notes written in ink.", question: "Why did they write on broken pottery?", options: ["It was used for important legal documents", "It was a sacred item used in festivals", "It was used like 'scrap paper' for quick notes", "It was used as a piece in a board game"], correct: 2 }
    ]
  },
  {
    id: 'mungo',
    name: 'The Ancient Dry Lake',
    civilization: 'Indigenous Australia (Lake Mungo)',
    historicalContext: 'Lake Mungo shows that people have lived here for over 42,000 years. It has some of the world’s oldest ritual burials, proving a long and rich history.',
    evidence: [
      { id: 'mg_1', name: "Silcrete Stone Tool", type: "objects", discoveryMethod: "Found on the ground after the wind blew away the sand.", clue: "A sharp stone that has been carefully shaped.", question: "What does this tool tell us about the people?", options: ["They knew exactly how to shape stone into tools", "The stones were used as weights for tents", "They were used as tokens for trading", "The stone was broken naturally by the heat"], correct: 0, image: "museum/mungo_stone_tool.png" },
      { id: 'mg_2', name: "Grinding Stone", type: "objects", discoveryMethod: "Dug up and mapped using GPS.", clue: "A large, flat rock with a smooth, worn-out dip in the middle.", question: "What was this stone used for?", options: ["A seat for the leaders of the group", "To crush seeds and grains into flour", "A lid for an underground water hole", "A tool for making metal weapons"], correct: 1 },
      { id: 'mg_3', name: "Ochre Fragment", type: "objects", discoveryMethod: "Sifted from an old campsite layer.", clue: "A piece of soft, red rock with scratch marks on it.", question: "What was ochre used for?", options: ["To help melt metal like copper", "To make paint for art and ceremonies", "As a type of medicine for health", "To build waterproof clay walls"], correct: 1 },

      { id: 'mg_4', name: "Ritual Burial Skeleton", type: "remains", discoveryMethod: "Found in a sand dune and studied with great respect.", clue: "A human skeleton covered in red ochre powder.", question: "What does this burial tell us?", options: ["The red color happened naturally over time", "They had deep spiritual beliefs and cared for the dead", "The person was a victim of a violent fight", "The body was hidden to keep animals away"], correct: 1, image: "museum/mungo_ochre_burial.png", rationale: "Mungo Man and Mungo Lady are some of the oldest ritual burials ever found. The use of red paint shows they had complex spiritual beliefs 42,000 years ago." },
      { id: 'mg_5', name: "Cremated Bones", type: "remains", discoveryMethod: "Dated in a lab to find out how old they are.", clue: "Human bones that were burnt, broken, and then buried.", question: "What is special about these bones?", options: ["It is one of the world's earliest ritual cremations", "The bones were burnt by a natural bushfire", "They burnt the bones to make them easier to carry", "The person fell into a campfire by accident"], correct: 0 },
      { id: 'mg_6', name: "Megafauna Bone", type: "remains", discoveryMethod: "Dug up carefully near an ancient shoreline.", clue: "A giant bone from an extinct, massive kangaroo.", question: "What does this bone show?", options: ["They brought elephants to the desert", "People lived alongside and hunted giant extinct animals", "The bone is from a dinosaur", "They kept giant kangaroos as pets"], correct: 1 },

      { id: 'mg_7', name: "Ancient Hearth", type: "structures", discoveryMethod: "Found by looking for a patch of heat-hardened clay.", clue: "A circle of burnt rocks found in the ground.", question: "What was this circle used for?", options: ["A fireplace for warmth and cooking", "A mark left behind by a lightning strike", "A signal fire to talk to people far away", "To make steam for softening wood"], correct: 0 },
      { id: 'mg_8', name: "Fossilized Footprints", type: "structures", discoveryMethod: "Found in the mud and recorded with 3D cameras.", clue: "Hard mud showing the footprints of people running together.", question: "What do these footprints tell us?", options: ["They were doing a dance for a festival", "It shows a snapshot of how the group moved and hunted", "They were running away from a scary predator", "The marks were carved into the mud as art"], correct: 1 },
      { id: 'mg_9', name: "Stone Fish Trap", type: "structures", discoveryMethod: "Found using a drone when the river was dry.", clue: "A line of rocks placed intentionally in a riverbed.", question: "Why were these rocks placed here?", options: ["To catch fish in a smart and sustainable way", "The rocks were moved naturally by the water", "They were built as walls to stop other groups", "They were the base for a wooden bridge"], correct: 0 },

      { id: 'mg_10', name: "Shell Midden", type: "environment", discoveryMethod: "Dug up to see how many layers of shells there were.", clue: "A large pile of old mussel shells.", question: "What does this pile of shells mean?", options: ["The shells were used as a type of money", "It was a place where people lived and ate for a long time", "They used the shells to decorate their homes", "The shells were washed up by a huge flood"], correct: 1 },
      { id: 'mg_11', name: "Emu Egg Shells", type: "environment", discoveryMethod: "Found in an old fireplace and dated in a lab.", clue: "Burnt pieces of a very large bird egg.", question: "What does this tell us about their diet?", options: ["They kept emus as farm animals", "They gathered wild eggs and cooked them on fires", "The shells were used as armor for fighting", "The shells were used to carry water"], correct: 1 },
      { id: 'mg_12', name: "Lake Silt Layer", type: "environment", discoveryMethod: "Dug deep into the ground to find old mud.", clue: "Mud that only forms at the bottom of a deep lake.", question: "What does this old mud layer prove?", options: ["This dry desert was once a large, healthy lake", "They brought the mud here to make gardens", "There was one giant flood that lasted for months", "They lived in houses on stilts above the water"], correct: 0 },

      { id: 'mg_13', name: "Hand Stencil Rock Art", type: "written", discoveryMethod: "Found on a rock wall and scanned with a special camera.", clue: "An outline of a hand painted onto a rock with red paint.", question: "Why did people make these hand prints?", options: ["To show a deep connection to their land", "They were just 'signing' their name while traveling", "To keep track of how many people were in the group", "To teach children about human bones"], correct: 0, image: "museum/mungo_hand_stencil.png" },
      { id: 'mg_14', name: "Carved Boab Nut", type: "written", discoveryMethod: "Found in a dry cave which kept the nut from rotting.", clue: "A nut shell with patterns carved into it.", question: "What do the carvings show us?", options: ["The nut was used to carry sacred water", "The marks showed who owned the food", "They told stories through art on small objects", "They were used as tokens for a game"], correct: 2 },
      { id: 'mg_15', name: "Ceremonial Stone Arrangement", type: "written", discoveryMethod: "Mapped out using GPS across a large area.", clue: "Large stones placed in a massive pattern on the ground.", question: "What was the purpose of these stones?", options: ["The stones were moved naturally by the wind", "It was a sacred site, map, or calendar for the group", "It was a wall built for defense", "They were weights used to hold down tents"], correct: 1 }
    ]
  },
  {
    id: 'rome',
    name: 'The Mediterranean Empire',
    civilization: 'Ancient Rome',
    historicalContext: 'Rome was famous for its huge buildings and powerful army. From lead pipes to stone carvings, their items show a very organized and advanced society.',
    evidence: [
      { id: 'rm_1', name: "Bronze Sestertius", type: "objects", discoveryMethod: "Found with a metal detector in an old market.", clue: "A coin with the face of an Emperor on it.", question: "What do these coins tell us about Rome?", options: ["They were used as lucky charms for travelers", "They had a strong economy and used coins for news", "They used them to keep track of food for the poor", "They were only used to buy animals for the temple"], correct: 1, image: "museum/roman_coin.png" },
      { id: 'rm_2', name: "Gladius", type: "objects", discoveryMethod: "Dug up from an old battlefield.", clue: "A short, iron sword made for stabbing.", question: "What does this sword show about the Roman army?", options: ["They had a professional army with the same equipment", "It was a tool used for farming in the fields", "It was a fancy symbol for leaders, not for fighting", "It was used for cutting down thick bushes"], correct: 0, image: "museum/roman_gladius.png" },
      { id: 'rm_3', name: "Samian Ware", type: "objects", discoveryMethod: "Found in a trash pit and put back together.", clue: "High-quality, shiny red pottery made in large amounts.", question: "How was this pottery made?", options: ["It was only used for sacred oils in temples", "The red color was made to look like copper", "They had big factories and traded across the sea", "It was a rare item made only for the Emperor"], correct: 2 },

      { id: 'rm_4', name: "Gladiator Skull", type: "remains", discoveryMethod: "Found in a graveyard outside the city.", clue: "A skull with wounds that have healed over.", question: "What does this skull tell us about Roman life?", options: ["The person was hurt in a regular accident", "Violent sports and fighting were a big part of life", "They used surgery to fix brain problems", "The person was hurt in a big earthquake"], correct: 1, image: "museum/roman_skull.png", rationale: "Gladiators were a central part of Roman culture. Some survived their fights and received medical care, which we can see in their bones." },
      { id: 'rm_5', name: "Cremation Urn Ashes", type: "remains", discoveryMethod: "Sifted from a jar found in a tomb.", clue: "Burnt human bone fragments inside a labeled jar.", question: "Why were the ashes in a jar?", options: ["To keep the spirits of ancestors in the home", "Burning the dead was a formal way to say goodbye", "Only the most important people were burnt", "The jar was for salt and the bones are a mistake"], correct: 1 },
      { id: 'rm_6', name: "Lead Isotope Teeth", type: "remains", discoveryMethod: "Studied in a lab to find minerals in the teeth.", clue: "Teeth that have lead and minerals from a far-away place.", question: "What does this tell us about the person?", options: ["They traveled a long way and lived in a city with lead pipes", "They used lead as a spice in their food", "The lead came naturally from the local soil", "They worked in a factory that made lead"], correct: 0 },

      { id: 'rm_7', name: "Aqueduct Arch", type: "structures", discoveryMethod: "Measured above ground to see how it was built.", clue: "A giant stone bridge that carried water into the city.", question: "Why did the Romans build these?", options: ["As a fancy gateway for the city entrance", "To bring clean water to thousands of people", "As a wall to stop people from moving around", "As a high platform for religious parades"], correct: 1 },
      { id: 'rm_8', name: "Hypocaust", type: "structures", discoveryMethod: "Dug under a floor to see what was beneath it.", clue: "A system of pillars that let hot air flow under the floor.", question: "What was this system used for?", options: ["To stop the floor from getting wet during floods", "It was an advanced way to heat homes and baths", "It was a cold basement for storing food", "It was a secret tunnel for escaping a war"], correct: 1 },
      { id: 'rm_9', name: "Mosaic Floor", type: "structures", discoveryMethod: "Cleaned with brushes and sponges to show the colors.", clue: "A floor made of thousands of tiny colored stones.", question: "What does this floor tell us about Roman homes?", options: ["Rich people spent a lot on art and design", "The floor was a map for religious rituals", "It was a non-slip floor for athletes", "The colors were used to tell the time of day"], correct: 0 },

      { id: 'rm_10', name: "Volcanic Ash Layer", type: "environment", discoveryMethod: "Found by looking at the layers of soil in a hole.", clue: "A thick layer of ash and rock covering the city.", question: "What caused this layer of ash?", options: ["It was a building material brought from far away", "A natural disaster suddenly buried the whole site", "It was from a giant fire in the city factories", "The ash was used as fertilizer for gardens"], correct: 1 },
      { id: 'rm_11', name: "Olive Pits", type: "environment", discoveryMethod: "Found in an old sewer drain.", clue: "Thousands of old seeds from olive fruits.", question: "Why were there so many olive seeds?", options: ["They were used as fuel for heating houses", "Olives were a main part of their daily food and trade", "They were used as tiny bullets for fighting", "The trees were only grown for their wood"], correct: 1 },
      { id: 'rm_12', name: "Dormouse Bones", type: "environment", discoveryMethod: "Sifted from a special clay jar.", clue: "Bones of small rodents found inside a clay pot.", question: "Why were these bones in a jar?", options: ["There was a big rodent problem in the market", "They raised and ate these mice as a fancy treat", "They were kept as sacred pets in rich homes", "The mice got stuck in the jars during a flood"], correct: 1 },

      { id: 'rm_13', name: "Wax Tablet", type: "written", discoveryMethod: "Found in wet mud which kept the wood from rotting.", clue: "A wooden board with wax that was written on with a pen.", question: "What were these tablets used for?", options: ["For quick notes, schoolwork, or business", "As a lamp to see in dark libraries", "To seal letters so no one could read them", "As a cover to protect expensive paper"], correct: 0 },
      { id: 'rm_14', name: "Monumental Inscription", type: "written", discoveryMethod: "Photographed and studied on a public building.", clue: "Large letters carved deeply into a marble slab.", question: "Why were the letters so large and public?", options: ["It was a secret code for government taxes", "Many people could read public signs and news", "The letters were just for show and no one read them", "The slab was used to test the weight of the building"], correct: 1 },
      { id: 'rm_15', name: "Carbonized Scroll", type: "written", discoveryMethod: "Scanned with a special machine to read without unrolling.", clue: "A paper scroll burnt to charcoal by a volcano.", question: "What was usually inside these scrolls?", options: ["Big libraries of books, laws, and records", "They were used as fire starters for ceremonies", "They were used to store expensive herbs", "The paper was used to make strong fishing nets"], correct: 0 }
    ]
  },
  {
    id: 'china',
    name: 'The Eastern Dynasties',
    civilization: 'Ancient China',
    historicalContext: 'Ancient Chinese history lasted for thousands of years. Discoveries like the Terracotta Army and Oracle Bones show a society with early writing and complex beliefs.',
    evidence: [
      { id: 'ch_1', name: "Bronze Ding", type: "objects", discoveryMethod: "Dug up from a high-status burial pit.", clue: "A massive, heavy metal pot standing on three legs.", question: "What was this large pot used for?", options: ["For everyday cooking in small villages", "As a symbol of power in sacred rituals", "To store extra grain for the winter", "As a musical instrument for festivals"], correct: 1 },
      { id: 'ch_2', name: "Terracotta Fragment", type: "objects", discoveryMethod: "Dug up from a huge trench with brushes.", clue: "A piece of a life-sized clay soldier.", question: "Why did they make thousands of these statues?", options: ["To protect the Emperor's spirit in the afterlife", "To show the different groups of people in China", "To hold up the roof of the tomb", "As decorations for a public park"], correct: 0, image: "museum/china_terracotta.png" },
      { id: 'ch_3', name: "Jade Ornament", type: "objects", discoveryMethod: "Found using a fine screen in a tomb.", clue: "A beautifully carved green stone disc.", question: "Why was jade so important?", options: ["It was only used for making sharp knives", "It was a sacred stone that stood for purity and status", "It was used as a type of money for trade", "It was used as a weight to hold down blankets"], correct: 1, image: "museum/china_jade_dragon.png" },

      { id: 'ch_4', name: "Chariot Horse Skeletons", type: "remains", discoveryMethod: "Found in a pit next to an old wooden chariot.", clue: "Bones of several horses buried in a neat line.", question: "Why were the horses buried here?", options: ["They died from a sudden animal sickness", "They were sacrificed to help the dead in the afterlife", "To mark the spot of a big military win", "The pit was a place for old horses to be buried"], correct: 1, image: "museum/china_horse_skeletons.png", rationale: "In ancient China, horses and chariots were buried near tombs. This showed how important the person was." },
      { id: 'ch_5', name: "Silk-Wrapped Bones", type: "remains", discoveryMethod: "Studied under a microscope to find tiny fibers.", clue: "Human bones that have tiny bits of silk thread on them.", question: "What does this tell us about their clothing?", options: ["The silk came from spiders in the tomb", "They used silk as a bandage for wounds", "They were experts at making expensive silk clothes", "Silk was only used for decorating religious items"], correct: 2 },
      { id: 'ch_6', name: "Laborer Skeletons", type: "remains", discoveryMethod: "Found buried together inside a large wall.", clue: "Skeletons showing signs of hard work and not enough food.", question: "Who were these people?", options: ["Athletes who died during a big race", "Soldiers who died defending the wall", "They were buried as a ritual to make the wall strong", "Workers who were forced to build the massive wall"], correct: 3 },

      { id: 'ch_7', name: "Rammed Earth Wall", type: "structures", discoveryMethod: "Measured with GPS and soil samples.", clue: "A massive wall made of very tightly packed dirt.", question: "What does this wall tell us about the government?", options: ["They were powerful enough to organize many workers", "It was built to stop the fields from flooding", "It was a marker to show where a farm ended", "It was a high road for the army to move fast"], correct: 0 },
      { id: 'ch_8', name: "Wooden Pagoda Foundation", type: "structures", discoveryMethod: "Dug up to show the stone bases for tall wooden poles.", clue: "A square base made to hold up a very tall wooden tower.", question: "How were these towers built?", options: ["To hold up a giant wooden statue", "They used advanced wood-building to grow vertically", "As a lookout tower to watch for fires", "To protect the wood from hungry animals"], correct: 1 },
      { id: 'ch_9', name: "Ceramic Kiln", type: "structures", discoveryMethod: "Found near a huge pile of ash and broken pots.", clue: "A large oven built into a hillside.", question: "What was made in this large oven?", options: ["Sacred bread for ceremonies", "Large amounts of high-quality pottery", "It was a heater for a whole village", "It was a furnace for making bronze weapons"], correct: 1 },

      { id: 'ch_10', name: "Rice Grains", type: "environment", discoveryMethod: "Found in a wet pit using water to float the seeds.", clue: "Burnt grains of farmed rice.", question: "What was their main food source?", options: ["They relied on farming rice in wet fields", "Rice was only used to make special wine", "The rice was a luxury brought from far away", "The rice was used to pay government workers"], correct: 0 },
      { id: 'ch_11', name: "Mulberry Leaves", type: "environment", discoveryMethod: "Found inside a sealed jar.", clue: "Leaves from a Mulberry tree.", question: "Why did they grow Mulberry trees?", options: ["To make a special type of medicinal tea", "To feed silkworms so they could make silk", "To use as a material for building shelters", "To feed farm animals during the winter"], correct: 1 },
      { id: 'ch_12', name: "Millet Seeds", type: "environment", discoveryMethod: "Sifted from an old fireplace in the north.", clue: "Tiny seeds of a grain that grows in dry places.", question: "Why did they grow millet in the north?", options: ["It was only used to feed pet birds", "The dry climate meant they needed hardy crops", "The seeds were used to make strong concrete", "Millet was a weed that grew by accident"], correct: 1 },

      { id: 'ch_13', name: "Oracle Bone", type: "written", discoveryMethod: "Dug up and studied by language experts.", clue: "A turtle shell with symbols carved into it.", question: "What was the purpose of these shells?", options: ["To try and predict the future (prophecy)", "As a type of money for expensive trade", "A secret code used by merchants", "A plaque to honor a military leader"], correct: 0 },
      { id: 'ch_14', name: "Bamboo Slips", type: "written", discoveryMethod: "Dug up from a dry tomb and unrolled carefully.", clue: "Strips of bamboo tied together with writing on them.", question: "What was usually written on these slips?", options: ["They were used to make high-status furniture", "Books, laws, and official records", "They were used as light armor for soldiers", "Labels for identifying medicine"], correct: 1 },
      { id: 'ch_15', name: "Bronze Inscription", type: "written", discoveryMethod: "Cleaned carefully in a lab.", clue: "Symbols carved inside a metal ritual pot.", question: "What was written inside these pots?", options: ["Important history, treaties, or honors", "Secret codes that were meant to be hidden", "Instructions on how to use the pot", "The signature of the person who made it"], correct: 0 }
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
