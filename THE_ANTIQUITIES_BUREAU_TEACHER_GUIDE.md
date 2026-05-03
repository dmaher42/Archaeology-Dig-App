# The Antiquities Bureau: Civilisation Cold Cases

## What this game is
Students act as junior historians in the Antiquities Bureau. They preview ancient civilisation case files by reading tiered clues, choosing the most likely civilisation, and writing the strongest historian's log entry. The game is a warm-up for the Ancient Civilisations booklet, not a replacement for it.

The goal is to practise:
- using evidence carefully
- identifying patterns across clues
- explaining historical reasoning
- comparing civilisations
- choosing a civilisation to investigate further in the booklet

## How students play
1. Open the Bureau mode from the app.
2. Read the briefing.
3. Start with Tier 1, then use the reveal buttons to unlock Tier 2 and Tier 3 if needed.
4. Choose the civilisation from four options.
5. Complete the Historian's Log question.
6. Read the feedback.
7. After every two cases, complete the Comparison Challenge.
8. Finish the case file set and review the final results screen.
9. Choose one civilisation to investigate further in the booklet.
10. Read the research focus card and use it to guide booklet notes.

## Scoring
- Correct after Tier 1: 3 points
- Correct after Tier 2: 2 points
- Correct after Tier 3: 1 point
- Correct Historian's Log: 1 point
- Correct Comparison Challenge: 2 points

The score is designed to reward careful evidence use, not speed.

## Lesson timing
### 20-minute option
- 2 minutes: teacher briefing
- 12 minutes: students complete 2 cases
- 6 minutes: class discussion about the evidence

### 40-minute option
- 5 minutes: teacher briefing
- 25 minutes: students complete 4 to 6 cases
- 10 minutes: comparison discussion and reflection

### 60-minute option
- 5 minutes: teacher briefing
- 35 minutes: students complete the full Bureau mode
- 10 minutes: pair or group reflection
- 10 minutes: choose a booklet civilisation and share research plans

## Reflection questions
- Which clue helped you most in each case?
- What made one civilisation more likely than the others?
- How did the Historian's Log change your thinking?
- What patterns did you notice in the comparison challenges?
- Which evidence felt strongest, and why?
- Which civilisation do you now want to research in the booklet?

## How to edit case data
- Bureau content lives in `src/data.js`.
- Each case should keep the same shape so the app can read it safely.
- Update the clue text, `civilisationOptions`, `correctCivilisation`, log question, log options, explanation, and comparison tags only.
- The older `answerOptions` and `correctAnswer` names are still supported for compatibility, but the Bureau mode now reads the civilisation-specific names first.
- Update the research focus cards in `src/data.js` if booklet guidance changes.
- Keep the clues short and evidence-based.
- Avoid adding runtime-generated questions or external data.

## Known limitations
- The game uses static local data only.
- There is no login, database, multiplayer, or external API.
- Bureau comparison questions are intentionally simple so the mode stays reliable in class.
- If you change the case order, the comparison pair flow should be checked again.
