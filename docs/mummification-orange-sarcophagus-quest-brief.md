# Mummification Lab: Orange Mummy Quest Brief

## Purpose

Create a classroom-friendly Year 7 HASS History mode for Investigating the Ancient Past. Students use an orange as a safe model for mummification, design a sarcophagus for it, and interpret each other's design choices as archaeological evidence.

This first pass is a text/card MVP. It is not a replacement for Lost Site Expedition gameplay and does not add images, canvas drawing, generated assets or external dependencies.

## Learning Focus

- Preservation and mummification
- Ancient Egyptian afterlife beliefs
- Sarcophagus design
- Artefacts as evidence
- Interpretation and contestability
- Respectful discussion of human remains
- Metacognition: "My thinking changed because..."

## Classroom Framing

The orange is a model used to investigate preservation. Real mummified human remains should be discussed respectfully: they were people, not props or jokes. Students should separate the practical model from real human remains and use careful historical language.

## Teacher Safety Note

Run the orange practical only with teacher supervision. Follow school safety rules for cutting tools, salt or natron substitute, hygiene, allergies, storage, mould checks and disposal. The orange and any drying mixture are never for eating.

## MVP Stage Flow

1. Briefing
   - Establish the investigation question.
   - Connect mummification to preservation, afterlife beliefs and evidence.
   - Introduce respectful discussion norms.

2. Evidence Sort
   - Students sort clue cards into preservation, afterlife beliefs, sarcophagus design and interpretation.
   - Contestable evidence is framed as normal historical thinking, not failure.

3. Orange Practical Checklist
   - Students mark teacher-led safety and practical steps.
   - The checklist keeps the model's context: label, date, storage and observation record.

4. Observation Log
   - Students record changes in smell, texture, moisture, colour or firmness.
   - Students write an evidence-based preservation claim.

5. Sarcophagus Design Studio
   - Students plan name panels, colours, symbols and afterlife belief evidence.
   - Students consider what a future archaeologist might infer or misread.

6. Future Archaeologist Mode
   - Students interpret a peer's sarcophagus design.
   - Students name exact evidence, propose an interpretation, offer an alternative and ask a respectful question.

7. Field Report
   - Students combine practical evidence, design interpretation, uncertainty and changed thinking.
   - The MVP includes Copy Report and Print Report buttons.

## Current Implementation Boundaries

- New mode is reached from the main menu as "Mummification Lab".
- Content lives in `src/components/mummification-quest/mummificationQuestData.js`.
- UI lives in `src/components/MummificationQuestMode.jsx`.
- State is local React state only.
- The mode does not autosave in this first pass.
- Lost Site Journey gameplay is untouched.

## Next Pass Ideas

- Add teacher export presets or a printable worksheet view.
- Add a simple class discussion board prompt set.
- Add optional local save/reset controls if the lesson needs multi-session persistence.
- Add a more polished peer-review workflow once the classroom rhythm is tested.
