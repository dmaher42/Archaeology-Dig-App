import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clipboard,
  FileText,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import {
  MUMMIFICATION_QUEST_CHECKLIST,
  MUMMIFICATION_QUEST_EVIDENCE_CARDS,
  MUMMIFICATION_QUEST_EVIDENCE_CATEGORIES,
  MUMMIFICATION_QUEST_FOCUS,
  MUMMIFICATION_QUEST_RESPECT_NOTE,
  MUMMIFICATION_QUEST_SAFETY_NOTE,
  MUMMIFICATION_QUEST_SENTENCE_STARTERS,
  MUMMIFICATION_QUEST_STAGES,
  MUMMIFICATION_QUEST_SYMBOL_BANK,
  MUMMIFICATION_QUEST_TITLE,
} from './mummification-quest/mummificationQuestData';

const createEmptyQuestState = () => ({
  evidenceSort: Object.fromEntries(MUMMIFICATION_QUEST_EVIDENCE_CARDS.map((card) => [card.id, ''])),
  checklist: Object.fromEntries(MUMMIFICATION_QUEST_CHECKLIST.map((item) => [item.id, false])),
  observationLog: {
    dateRange: '',
    changes: '',
    preservationClaim: '',
    thinkingChanged: '',
  },
  sarcophagusDesign: {
    ownerName: '',
    colours: '',
    symbols: '',
    afterlifeBelief: '',
    evidenceMessage: '',
    possibleMisread: '',
  },
  futureArchaeologist: {
    observedDesign: '',
    evidenceNoticed: '',
    interpretation: '',
    alternative: '',
    respectfulQuestion: '',
  },
  fieldReport: {
    strongestEvidence: '',
    finalThinkingChanged: '',
  },
});

const getCategoryLabel = (categoryId) => (
  MUMMIFICATION_QUEST_EVIDENCE_CATEGORIES.find((category) => category.id === categoryId)?.label || 'Not sorted yet'
);

const filledCount = (values) => Object.values(values).filter((value) => String(value).trim()).length;

function TextField({ id, label, value, onChange, rows = 3, placeholder = '' }) {
  return (
    <label className="mummification-field" htmlFor={id}>
      <span>{label}</span>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function MummificationQuestMode({ onBackToMenu }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [questState, setQuestState] = useState(() => createEmptyQuestState());
  const [copyStatus, setCopyStatus] = useState('');

  const currentStage = MUMMIFICATION_QUEST_STAGES[stageIndex];
  const sortedCount = Object.values(questState.evidenceSort).filter(Boolean).length;
  const correctSortCount = MUMMIFICATION_QUEST_EVIDENCE_CARDS.filter(
    (card) => questState.evidenceSort[card.id] === card.correctCategoryId,
  ).length;
  const checkedCount = Object.values(questState.checklist).filter(Boolean).length;

  const updateSection = (section, key, value) => {
    setQuestState((state) => ({
      ...state,
      [section]: {
        ...state[section],
        [key]: value,
      },
    }));
  };

  const updateEvidenceSort = (cardId, categoryId) => {
    setQuestState((state) => ({
      ...state,
      evidenceSort: {
        ...state.evidenceSort,
        [cardId]: categoryId,
      },
    }));
  };

  const toggleChecklist = (itemId) => {
    setQuestState((state) => ({
      ...state,
      checklist: {
        ...state.checklist,
        [itemId]: !state.checklist[itemId],
      },
    }));
  };

  const reportText = useMemo(() => {
    const design = questState.sarcophagusDesign;
    const observations = questState.observationLog;
    const future = questState.futureArchaeologist;
    const field = questState.fieldReport;
    const sortedSummary = `${correctSortCount} of ${MUMMIFICATION_QUEST_EVIDENCE_CARDS.length} evidence cards matched the strongest category.`;

    return [
      MUMMIFICATION_QUEST_TITLE,
      '',
      `Orange mummy name or identity: ${design.ownerName || 'Not recorded yet'}`,
      `Preservation evidence: ${observations.preservationClaim || field.strongestEvidence || 'Not recorded yet'}`,
      `Observation record: ${observations.changes || 'Not recorded yet'}`,
      `Evidence sort result: ${sortedSummary}`,
      `Sarcophagus design choices: ${design.symbols || 'Not recorded yet'}`,
      `Afterlife belief shown: ${design.afterlifeBelief || 'Not recorded yet'}`,
      `Possible interpretation: ${future.interpretation || design.evidenceMessage || 'Not recorded yet'}`,
      `Alternative interpretation or uncertainty: ${future.alternative || design.possibleMisread || 'Not recorded yet'}`,
      `Respectful discussion point: ${future.respectfulQuestion || 'Not recorded yet'}`,
      `My thinking changed because: ${field.finalThinkingChanged || observations.thinkingChanged || 'Not recorded yet'}`,
    ].join('\n');
  }, [correctSortCount, questState]);

  const stageProgress = useMemo(() => ({
    briefing: 1,
    'evidence-sort': sortedCount / MUMMIFICATION_QUEST_EVIDENCE_CARDS.length,
    'orange-practical': checkedCount / MUMMIFICATION_QUEST_CHECKLIST.length,
    'observation-log': filledCount(questState.observationLog) / 4,
    'sarcophagus-design': filledCount(questState.sarcophagusDesign) / 6,
    'future-archaeologist': filledCount(questState.futureArchaeologist) / 5,
    'field-report': filledCount(questState.fieldReport) / 2,
  }), [checkedCount, questState, sortedCount]);

  const goToStage = (nextIndex) => {
    setStageIndex(Math.min(Math.max(nextIndex, 0), MUMMIFICATION_QUEST_STAGES.length - 1));
    setCopyStatus('');
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopyStatus('Report copied.');
    } catch {
      setCopyStatus('Copy was blocked by the browser. Use Print Report instead.');
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const renderBriefing = () => (
    <div className="mummification-stage-grid">
      <section className="mummification-panel">
        <h3>Learning focus</h3>
        <ul className="mummification-check-list">
          {MUMMIFICATION_QUEST_FOCUS.map((focus) => (
            <li key={focus}>
              <CheckCircle2 size={16} />
              <span>{focus}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mummification-panel mummification-panel--notice">
        <ShieldCheck size={24} />
        <h3>Respectful inquiry</h3>
        <p>{MUMMIFICATION_QUEST_RESPECT_NOTE}</p>
      </section>
      <section className="mummification-panel">
        <h3>Mission questions</h3>
        <div className="mummification-prompt-stack">
          {currentStage.prompts.map((prompt) => (
            <p key={prompt}>{prompt}</p>
          ))}
        </div>
      </section>
    </div>
  );

  const renderEvidenceSort = () => (
    <div className="mummification-evidence-sort">
      <div className="mummification-stage-summary">
        <strong>{sortedCount}/{MUMMIFICATION_QUEST_EVIDENCE_CARDS.length}</strong>
        <span>cards sorted</span>
        <strong>{correctSortCount}</strong>
        <span>strong matches</span>
      </div>
      <div className="mummification-category-strip">
        {MUMMIFICATION_QUEST_EVIDENCE_CATEGORIES.map((category) => (
          <div key={category.id} className="mummification-category-card">
            <strong>{category.label}</strong>
            <span>{category.prompt}</span>
          </div>
        ))}
      </div>
      <div className="mummification-card-grid">
        {MUMMIFICATION_QUEST_EVIDENCE_CARDS.map((card) => {
          const selectedCategoryId = questState.evidenceSort[card.id];
          const isCorrect = selectedCategoryId === card.correctCategoryId;

          return (
            <article key={card.id} className="mummification-evidence-card">
              <div>
                <h3>{card.title}</h3>
                <p>{card.clue}</p>
              </div>
              <div className="mummification-choice-row" aria-label={`Sort ${card.title}`}>
                {MUMMIFICATION_QUEST_EVIDENCE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={selectedCategoryId === category.id ? 'is-selected' : ''}
                    onClick={() => updateEvidenceSort(card.id, category.id)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              {selectedCategoryId && (
                <p className={isCorrect ? 'mummification-feedback is-correct' : 'mummification-feedback'}>
                  {isCorrect
                    ? card.reveal
                    : `Good thinking to test. Strongest match here: ${getCategoryLabel(card.correctCategoryId)}.`}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );

  const renderPracticalChecklist = () => (
    <div className="mummification-stage-grid">
      <section className="mummification-panel mummification-panel--safety">
        <ShieldCheck size={26} />
        <h3>Teacher safety note</h3>
        <p>{MUMMIFICATION_QUEST_SAFETY_NOTE}</p>
      </section>
      <section className="mummification-panel">
        <h3>Practical checklist</h3>
        <div className="mummification-check-stack">
          {MUMMIFICATION_QUEST_CHECKLIST.map((item) => (
            <label key={item.id} className="mummification-check-item">
              <input
                type="checkbox"
                checked={questState.checklist[item.id]}
                onChange={() => toggleChecklist(item.id)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );

  const renderObservationLog = () => (
    <div className="mummification-form-grid">
      <TextField
        id="mummification-date-range"
        label="Date range or lesson number"
        value={questState.observationLog.dateRange}
        rows={2}
        placeholder="Example: Lesson 1 to Lesson 3"
        onChange={(value) => updateSection('observationLog', 'dateRange', value)}
      />
      <TextField
        id="mummification-changes"
        label="What changed in the orange?"
        value={questState.observationLog.changes}
        placeholder="Record smell, texture, moisture, colour or firmness."
        onChange={(value) => updateSection('observationLog', 'changes', value)}
      />
      <TextField
        id="mummification-preservation-claim"
        label="Evidence-based preservation claim"
        value={questState.observationLog.preservationClaim}
        placeholder="The drying mixture helped preserve the orange because..."
        onChange={(value) => updateSection('observationLog', 'preservationClaim', value)}
      />
      <TextField
        id="mummification-thinking-changed"
        label="My thinking changed because..."
        value={questState.observationLog.thinkingChanged}
        onChange={(value) => updateSection('observationLog', 'thinkingChanged', value)}
      />
    </div>
  );

  const renderDesignStudio = () => (
    <div className="mummification-form-grid">
      <TextField
        id="mummification-owner-name"
        label="Name or identity panel for the sarcophagus"
        value={questState.sarcophagusDesign.ownerName}
        rows={2}
        onChange={(value) => updateSection('sarcophagusDesign', 'ownerName', value)}
      />
      <TextField
        id="mummification-colours"
        label="Colours and materials"
        value={questState.sarcophagusDesign.colours}
        rows={2}
        placeholder="Explain why you chose them."
        onChange={(value) => updateSection('sarcophagusDesign', 'colours', value)}
      />
      <label className="mummification-field mummification-field--full" htmlFor="mummification-symbols">
        <span>Symbol bank</span>
        <div className="mummification-symbol-bank" aria-label="Sarcophagus symbol ideas">
          {MUMMIFICATION_QUEST_SYMBOL_BANK.map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => updateSection(
                'sarcophagusDesign',
                'symbols',
                `${questState.sarcophagusDesign.symbols}${questState.sarcophagusDesign.symbols ? ', ' : ''}${symbol}`,
              )}
            >
              {symbol}
            </button>
          ))}
        </div>
        <textarea
          id="mummification-symbols"
          value={questState.sarcophagusDesign.symbols}
          rows={3}
          onChange={(event) => updateSection('sarcophagusDesign', 'symbols', event.target.value)}
        />
      </label>
      <TextField
        id="mummification-afterlife-belief"
        label="Afterlife belief shown by the design"
        value={questState.sarcophagusDesign.afterlifeBelief}
        onChange={(value) => updateSection('sarcophagusDesign', 'afterlifeBelief', value)}
      />
      <TextField
        id="mummification-evidence-message"
        label="What evidence message should a future archaeologist notice?"
        value={questState.sarcophagusDesign.evidenceMessage}
        onChange={(value) => updateSection('sarcophagusDesign', 'evidenceMessage', value)}
      />
      <TextField
        id="mummification-possible-misread"
        label="What could they misread or debate?"
        value={questState.sarcophagusDesign.possibleMisread}
        onChange={(value) => updateSection('sarcophagusDesign', 'possibleMisread', value)}
      />
    </div>
  );

  const renderFutureArchaeologist = () => (
    <div className="mummification-form-grid">
      <TextField
        id="mummification-observed-design"
        label="Whose sarcophagus design are you interpreting?"
        value={questState.futureArchaeologist.observedDesign}
        rows={2}
        onChange={(value) => updateSection('futureArchaeologist', 'observedDesign', value)}
      />
      <TextField
        id="mummification-evidence-noticed"
        label="Evidence noticed"
        value={questState.futureArchaeologist.evidenceNoticed}
        placeholder="Name the exact colour, symbol, placement or label you used as evidence."
        onChange={(value) => updateSection('futureArchaeologist', 'evidenceNoticed', value)}
      />
      <TextField
        id="mummification-interpretation"
        label="One interpretation"
        value={questState.futureArchaeologist.interpretation}
        onChange={(value) => updateSection('futureArchaeologist', 'interpretation', value)}
      />
      <TextField
        id="mummification-alternative"
        label="Another possible interpretation"
        value={questState.futureArchaeologist.alternative}
        onChange={(value) => updateSection('futureArchaeologist', 'alternative', value)}
      />
      <TextField
        id="mummification-respectful-question"
        label="Respectful discussion question"
        value={questState.futureArchaeologist.respectfulQuestion}
        placeholder="Example: Could this symbol mean protection, or might it show identity?"
        onChange={(value) => updateSection('futureArchaeologist', 'respectfulQuestion', value)}
      />
    </div>
  );

  const renderFieldReport = () => (
    <div className="mummification-report-grid">
      <section className="mummification-panel">
        <h3>Sentence starters</h3>
        <ul className="mummification-starter-list">
          {MUMMIFICATION_QUEST_SENTENCE_STARTERS.map((starter) => (
            <li key={starter}>{starter}</li>
          ))}
        </ul>
        <TextField
          id="mummification-strongest-evidence"
          label="Strongest evidence for your final report"
          value={questState.fieldReport.strongestEvidence}
          onChange={(value) => updateSection('fieldReport', 'strongestEvidence', value)}
        />
        <TextField
          id="mummification-final-thinking"
          label="My thinking changed because..."
          value={questState.fieldReport.finalThinkingChanged}
          onChange={(value) => updateSection('fieldReport', 'finalThinkingChanged', value)}
        />
      </section>
      <section className="mummification-panel mummification-report-preview">
        <div className="mummification-report-title">
          <FileText size={22} />
          <h3>Field Report Preview</h3>
        </div>
        <pre>{reportText}</pre>
        <div className="mummification-report-actions">
          <button type="button" className="btn primary-btn" onClick={handleCopyReport}>
            <Clipboard size={16} /> Copy Report
          </button>
          <button type="button" className="btn secondary-btn" onClick={handlePrintReport}>
            <Printer size={16} /> Print Report
          </button>
        </div>
        {copyStatus && <p className="mummification-copy-status">{copyStatus}</p>}
      </section>
    </div>
  );

  const renderStageContent = () => {
    switch (currentStage.id) {
      case 'briefing':
        return renderBriefing();
      case 'evidence-sort':
        return renderEvidenceSort();
      case 'orange-practical':
        return renderPracticalChecklist();
      case 'observation-log':
        return renderObservationLog();
      case 'sarcophagus-design':
        return renderDesignStudio();
      case 'future-archaeologist':
        return renderFutureArchaeologist();
      case 'field-report':
        return renderFieldReport();
      default:
        return null;
    }
  };

  return (
    <section className="phase-container mummification-quest-mode">
      <header className="mummification-quest-hero glass-card">
        <button type="button" className="mummification-back-btn" onClick={onBackToMenu}>
          <ArrowLeft size={16} /> Main Menu
        </button>
        <div className="mummification-quest-title-block">
          <div className="training-kicker">Classroom Mode</div>
          <h2>{MUMMIFICATION_QUEST_TITLE}</h2>
          <p>
            Mummify an orange, design a sarcophagus, then interpret design choices as
            archaeological evidence.
          </p>
        </div>
        <div className="mummification-hero-note">
          <ShieldCheck size={18} />
          <span>Teacher-led practical. Text-card MVP only.</span>
        </div>
      </header>

      <div className="mummification-quest-layout">
        <nav className="mummification-stage-nav glass-card" aria-label="Mummification Lab stages">
          {MUMMIFICATION_QUEST_STAGES.map((stage, index) => {
            const progress = stageProgress[stage.id] || 0;
            return (
              <button
                key={stage.id}
                type="button"
                className={index === stageIndex ? 'is-active' : ''}
                onClick={() => goToStage(index)}
              >
                <span className="mummification-stage-number">{index + 1}</span>
                <span>
                  <strong>{stage.title}</strong>
                  <em>{Math.round(progress * 100)}% noted</em>
                </span>
              </button>
            );
          })}
        </nav>

        <article className="mummification-stage-panel">
          <div className="mummification-stage-header">
            <div>
              <div className="training-kicker">{currentStage.role}</div>
              <h2>{currentStage.title}</h2>
              <p>{currentStage.studentGoal}</p>
            </div>
            <div className="mummification-stage-pill">
              Stage {stageIndex + 1} of {MUMMIFICATION_QUEST_STAGES.length}
            </div>
          </div>

          {renderStageContent()}

          <footer className="mummification-stage-footer">
            <button
              type="button"
              className="btn secondary-btn"
              onClick={() => goToStage(stageIndex - 1)}
              disabled={stageIndex === 0}
            >
              <ArrowLeft size={16} /> Previous
            </button>
            <button
              type="button"
              className="btn primary-btn"
              onClick={() => goToStage(stageIndex + 1)}
              disabled={stageIndex === MUMMIFICATION_QUEST_STAGES.length - 1}
            >
              Next <ArrowRight size={16} />
            </button>
          </footer>
        </article>
      </div>
    </section>
  );
}
