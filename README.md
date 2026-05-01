# Archaeology Dig App – Year 7 HASS Ancient History

An interactive classroom game for Year 7 HASS students learning how archaeologists use evidence to understand ancient civilisations.

This app turns archaeology into a playable investigation. Students recover finds from a dig site, classify evidence into historical categories, analyse clues, and use evidence to explain how people lived in the past.

## Classroom purpose

The app supports the Year 7 Ancient History unit **Investigating the Ancient Past / Ancient Civilisations**.

It is designed to help students move beyond simply naming artefacts and toward historical thinking:

- observing evidence
- classifying evidence
- making inferences
- recognising uncertainty
- using evidence to support explanations

The core learning idea is:

> Archaeologists do not just find objects and guess. They classify evidence, consider context, and use clues to build careful interpretations about the past.

## Student-friendly storyline

Students act as members of an archaeology team.

Their mission is to:

1. recover evidence from a threatened dig site
2. sort the evidence into the correct archaeology category
3. analyse what each piece of evidence might tell us
4. explain what the evidence reveals about ancient people and civilisations

## Curriculum alignment

This app supports Year 7 History learning by helping students practise:

- identifying primary evidence from the ancient past
- recognising different types of archaeological evidence
- classifying artefacts, remains, structures, environmental evidence, and symbolic evidence
- explaining what evidence can reveal about past societies
- understanding that evidence can be interpreted in different ways
- using historical terms such as **artefact**, **evidence**, **archaeology**, **source**, **context**, **interpretation**, and **civilisation**

It fits especially well after students have been introduced to:

- why we study history
- what evidence historians and archaeologists use
- ancient civilisations and settlement
- human migration and survival
- Lake Mungo / ancient Australia
- artefact sorting and interpretation activities

## Game structure

The app is built around a five-phase learning sequence.

### 1. Dig

Students recover finds from a threatened dig site under time pressure.

Random events such as sandstorms, floods, looters, or nightfall create urgency and make the dig feel like an active mission.

### 2. Sort

Students classify the recovered evidence into archaeology categories:

- **Objects people made** - tools, pottery, weapons, jewellery, money
- **Human remains** - bones, teeth, mummified bodies
- **Places and structures** - roads, tombs, temples, walls, drainage
- **Environmental evidence** - seeds, charcoal, shells, animal bones
- **Written or symbolic evidence** - symbols, writing, carvings, painted images

### 3. Lab

Students answer questions about each find and write short research notes about what it reveals.

This is the main evidence-analysis phase. The goal is not only to sort correctly, but to explain what the evidence might mean.

### 4. Museum

Students curate three strongest finds, write exhibition plaques, and build a final exhibition statement.

### 5. Report

Students review the full evidence set and print or export the final museum/report view.

## Civilisations and scenarios

The app includes scenario-based evidence from ancient and deep-time contexts, including:

- Ancient Egypt
- Indigenous Australia / Lake Mungo
- Ancient Rome
- Ancient China

Each scenario includes evidence cards with:

- find name
- evidence category
- discovery method
- clue
- analysis question
- multiple-choice options
- correct answer
- rationale

## Recommended classroom use

### Option 1: Whole-class projected game

Use the app on the board and have groups discuss each decision before the class chooses.

Best for:

- modelling archaeological thinking
- slower classes
- introducing the categories for the first time

### Option 2: Small-group challenge

Students play in groups on devices, then record a short evidence reflection in their books.

Best for:

- engagement
- collaborative decision-making
- revision after a lesson on artefacts or civilisations

### Option 3: Follow-up to the paper sorting activity

Use the app after students complete a cut-out sorting task.

This works well because students first learn the categories by hand, then apply the same thinking in a digital game.

## Suggested lesson flow

For a 50–60 minute lesson:

1. **Starter** – What evidence might survive from the ancient past?  
2. **Mini-teach** – Artefacts, evidence, context, classification, inference  
3. **Play** – Emergency excavation and sorting tent  
4. **Discuss** – Which evidence was easiest or hardest to classify?  
5. **Reflect** – What did one piece of evidence tell us about how people lived?

For a 110 minute lesson:

1. Quick recap or misconception correction  
2. Human migration / survival lesson  
3. Link migration to settlement and civilisation  
4. Play the Archaeology Dig App  
5. Complete an evidence reflection or Google Form  
6. Class discussion: What does evidence help us understand?

## Teacher prompts

Use these while students play:

- What type of evidence is this?
- What clue helped you decide?
- Could this evidence fit more than one category?
- What does this tell us about how people lived?
- What are we still unsure about?
- Is this strong evidence or weak evidence? Why?
- What extra evidence would help us make a better interpretation?

## Student reflection prompts

After playing, students can answer:

1. One piece of evidence I found was __________.
2. I classified it as __________ because __________.
3. This evidence might tell archaeologists __________.
4. Another possible interpretation is __________.
5. One thing we still cannot know for sure is __________.

## Key teaching principle

The game should not only be used as a matching or sorting activity.

The main learning comes when students explain:

> What does this evidence tell us about ancient people?

If students are only playing quickly, pause the game and ask them to justify their decisions.

## Current technical setup

This project is a React + Vite app.

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Main files

- `src/App.jsx` – main game flow and interface
- `src/data.js` – archaeology categories, random events, scenarios, evidence, clues, questions, rationales, and shared label helpers
- `src/index.css` – app styling
- `public/museum/` – museum and report imagery used by the evidence cards
- `package.json` – Vite scripts and dependencies

## Future improvement ideas

Possible next upgrades:

- Teacher Mode / Classroom Mode
- scenario selector for specific lessons
- skip-dig option for shorter lessons
- final Claim–Evidence–Reasoning report screen
- printable student reflection sheet
- Google Form export questions
- whole-class projection mode
- accessibility improvements for lower-literacy students
- clearer connection between migration, settlement, civilisation, and evidence

## Save and load

The app now supports both autosave and manual save/load.

- Autosave writes to local storage while the game is in progress.
- Save Progress downloads a JSON file.
- Load Progress restores a saved JSON file back into the same state model.

## Teaching vision

This app supports a wider unit approach:

> Humans changed → humans adapted → humans migrated → humans settled → civilisations developed → archaeologists use evidence to understand them.

The game is one part of that learning arc. Its purpose is to make students think like historians and archaeologists, not simply complete a digital task.
