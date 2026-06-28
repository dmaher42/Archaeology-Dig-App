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
  MUMMIFICATION_QUEST_ARCHAEOLOGIST_FIELDS,
  MUMMIFICATION_QUEST_CHECKLIST,
  MUMMIFICATION_QUEST_DESIGN_FIELDS,
  MUMMIFICATION_QUEST_EVIDENCE_CARDS,
  MUMMIFICATION_QUEST_EVIDENCE_CATEGORIES,
  MUMMIFICATION_QUEST_FIELD_REPORT_FIELDS,
  MUMMIFICATION_QUEST_FOCUS,
  MUMMIFICATION_QUEST_MATERIALS,
  MUMMIFICATION_QUEST_OBSERVATION_FIELDS,
  MUMMIFICATION_QUEST_REPORT_SECTIONS,
  MUMMIFICATION_QUEST_RESPECT_NOTE,
  MUMMIFICATION_QUEST_SAFETY_NOTE,
  MUMMIFICATION_QUEST_STAGE_IMAGES,
  MUMMIFICATION_QUEST_STAGES,
  MUMMIFICATION_QUEST_SYMBOL_BANK,
  MUMMIFICATION_QUEST_TITLE,
} from './mummificationQuestData';

const makeBlankFieldState = (fields) => Object.fromEntries(fields.map((field) => [field.id, '']));

const createEmptyQuestState = () => ({
  evidenceSort: Object.fromEntries(MUMMIFICATION_QUEST_EVIDENCE_CARDS.map((card) => [card.id, ''])),
  checklist: Object.fromEntries(MUMMIFICATION_QUEST_CHECKLIST.map((item) => [item.id, false])),
  observationLog: makeBlankFieldState(MUMMIFICATION_QUEST_OBSERVATION_FIELDS),
  sarcophagusDesign: makeBlankFieldState(MUMMIFICATION_QUEST_DESIGN_FIELDS),
  futureArchaeologist: makeBlankFieldState(MUMMIFICATION_QUEST_ARCHAEOLOGIST_FIELDS),
  fieldReport: makeBlankFieldState(MUMMIFICATION_QUEST_FIELD_REPORT_FIELDS),
});

const getCategoryLabel = (categoryId) => (
  MUMMIFICATION_QUEST_EVIDENCE_CATEGORIES.find((category) => category.id === categoryId)?.label || 'not sorted yet'
);

const filledCount = (values) => Object.values(values).filter((value) => String(value).trim()).length;

const formatOrBlank = (value) => String(value || '').trim() || 'Not recorded yet.';

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

function QuestImageCard({ asset, eyebrow = 'image', compact = false }) {
  const candidates = asset?.imageCandidates || [];
  const [imageIndex, setImageIndex] = useState(0);

  const currentImage = candidates[imageIndex];

  return (
    <figure className={`mummification-image-card ${compact ? 'mummification-image-card--compact' : ''}`}>
      {currentImage ? (
        <img
          src={currentImage}
          alt={asset.alt || asset.title}
          onError={() => setImageIndex((index) => index + 1)}
        />
      ) : (
        <div className="mummification-image-placeholder">
          <span>{asset?.placeholderLabel || eyebrow}</span>
          <strong>{asset?.title || 'Image placeholder'}</strong>
          <em>{asset?.missingHint || 'Image can be added later without breaking the lab.'}</em>
        </div>
      )}
      <figcaption>
        <span>{eyebrow}</span>
        <strong>{asset?.title || 'Classroom image'}</strong>
      </figcaption>
    </figure>
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
    const observations = questState.observationLog;
    const design = questState.sarcophagusDesign;
    const future = questState.futureArchaeologist;
    const report = questState.fieldReport;

    const reportContent = {
      prediction: formatOrBlank(observations.prediction),
      whatWeDid: formatOrBlank(report.whatWeDid),
      changedOverTime: [
        `Day 0: ${formatOrBlank(observations.day0)}`,
        `Week 1: ${formatOrBlank(observations.week1)}`,
        `Week 2: ${formatOrBlank(observations.week2)}`,
        `Final: ${formatOrBlank(observations.final)}`,
      ].join('\n'),
      modelsPreservation: formatOrBlank(report.modelsPreservation),
      modelLimits: formatOrBlank(report.modelLimits),
      designEvidence: [
        `Mummy name: ${formatOrBlank(design.mummyName)}`,
        `Identity or role: ${formatOrBlank(design.identityRole)}`,
        `Colours: ${formatOrBlank(design.colours)}`,
        `Symbols: ${formatOrBlank(design.symbols)}`,
        `Burial goods: ${formatOrBlank(design.burialGoods)}`,
        `Inscription: ${formatOrBlank(design.inscription)}`,
        `Design explanation: ${formatOrBlank(design.designExplanation)}`,
      ].join('\n'),
      futureInference: [
        `What the evidence suggests: ${formatOrBlank(future.evidenceSuggests)}`,
        `What could be misunderstood: ${formatOrBlank(future.couldBeMisunderstood)}`,
        `What we are still unsure about: ${formatOrBlank(future.stillUnsure)}`,
      ].join('\n'),
      thinkingChanged: formatOrBlank(report.thinkingChanged),
    };

    return [
      MUMMIFICATION_QUEST_TITLE,
      '',
      ...MUMMIFICATION_QUEST_REPORT_SECTIONS.flatMap((section) => [
        section.title,
        reportContent[section.id],
        '',
      ]),
      `Evidence sort: ${correctSortCount} of ${MUMMIFICATION_QUEST_EVIDENCE_CARDS.length} cards matched the strongest category.`,
    ].join('\n').trim();
  }, [correctSortCount, questState]);

  const stageProgress = useMemo(() => ({
    briefing: 1,
    'evidence-sort': sortedCount / MUMMIFICATION_QUEST_EVIDENCE_CARDS.length,
    'orange-practical': checkedCount / MUMMIFICATION_QUEST_CHECKLIST.length,
    'observation-log': filledCount(questState.observationLog) / MUMMIFICATION_QUEST_OBSERVATION_FIELDS.length,
    'sarcophagus-design': filledCount(questState.sarcophagusDesign) / MUMMIFICATION_QUEST_DESIGN_FIELDS.length,
    'future-archaeologist': filledCount(questState.futureArchaeologist) / MUMMIFICATION_QUEST_ARCHAEOLOGIST_FIELDS.length,
    'field-report': filledCount(questState.fieldReport) / MUMMIFICATION_QUEST_FIELD_REPORT_FIELDS.length,
  }), [checkedCount, questState, sortedCount]);

  const goToStage = (nextIndex) => {
    setStageIndex(Math.min(Math.max(nextIndex, 0), MUMMIFICATION_QUEST_STAGES.length - 1));
    setCopyStatus('');
  };

  const handleCopyReport = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable');
      }
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
      <QuestImageCard key="briefing-image" asset={MUMMIFICATION_QUEST_STAGE_IMAGES.briefing} eyebrow="briefing" />
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
      <section className="mummification-panel mummification-panel--wide">
        <h3>Briefing notes</h3>
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
              <QuestImageCard asset={card} eyebrow="evidence card" compact />
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
      <QuestImageCard
        key="orange-practical-image"
        asset={MUMMIFICATION_QUEST_STAGE_IMAGES['orange-practical']}
        eyebrow="practical"
      />
      <section className="mummification-panel">
        <h3>Materials</h3>
        <ul className="mummification-starter-list">
          {MUMMIFICATION_QUEST_MATERIALS.map((material) => (
            <li key={material}>{material}</li>
          ))}
        </ul>
      </section>
      <section className="mummification-panel mummification-panel--safety">
        <ShieldCheck size={26} />
        <h3>Teacher safety note</h3>
        <p>{MUMMIFICATION_QUEST_SAFETY_NOTE}</p>
      </section>
      <section className="mummification-panel mummification-panel--wide">
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
      {MUMMIFICATION_QUEST_OBSERVATION_FIELDS.map((field) => (
        <TextField
          key={field.id}
          id={`mummification-observation-${field.id}`}
          label={field.label}
          value={questState.observationLog[field.id]}
          placeholder={field.placeholder}
          rows={field.id === 'prediction' ? 2 : 3}
          onChange={(value) => updateSection('observationLog', field.id, value)}
        />
      ))}
    </div>
  );

  const renderDesignStudio = () => (
    <div className="mummification-stage-grid">
      <QuestImageCard
        key="sarcophagus-design-image"
        asset={MUMMIFICATION_QUEST_STAGE_IMAGES['sarcophagus-design']}
        eyebrow="sarcophagus"
      />
      <section className="mummification-panel">
        <h3>Symbol bank</h3>
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
      </section>
      <div className="mummification-form-grid mummification-panel--wide">
        {MUMMIFICATION_QUEST_DESIGN_FIELDS.map((field) => (
          <TextField
            key={field.id}
            id={`mummification-design-${field.id}`}
            label={field.label}
            value={questState.sarcophagusDesign[field.id]}
            placeholder={field.placeholder}
            rows={field.id === 'designExplanation' ? 4 : 2}
            onChange={(value) => updateSection('sarcophagusDesign', field.id, value)}
          />
        ))}
      </div>
    </div>
  );

  const renderFutureArchaeologist = () => (
    <div className="mummification-form-grid">
      {MUMMIFICATION_QUEST_ARCHAEOLOGIST_FIELDS.map((field) => (
        <TextField
          key={field.id}
          id={`mummification-archaeologist-${field.id}`}
          label={field.label}
          value={questState.futureArchaeologist[field.id]}
          placeholder={field.placeholder}
          onChange={(value) => updateSection('futureArchaeologist', field.id, value)}
        />
      ))}
      <section className="mummification-panel mummification-panel--wide">
        <h3>Respectful discussion reminder</h3>
        <p>
          Use evidence first, explain uncertainty, and disagree with ideas rather than people.
          Archaeological interpretations can be contested when evidence is incomplete.
        </p>
      </section>
    </div>
  );

  const renderFieldReport = () => (
    <div className="mummification-report-grid">
      <section className="mummification-panel">
        <h3>Final report notes</h3>
        <div className="mummification-report-fields">
          {MUMMIFICATION_QUEST_FIELD_REPORT_FIELDS.map((field) => (
            <TextField
              key={field.id}
              id={`mummification-report-${field.id}`}
              label={field.label}
              value={questState.fieldReport[field.id]}
              placeholder={field.placeholder}
              onChange={(value) => updateSection('fieldReport', field.id, value)}
            />
          ))}
        </div>
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
          <ArrowLeft size={16} /> Return to Menu
        </button>
        <div className="mummification-quest-title-block">
          <div className="training-kicker">Classroom Mode</div>
          <h2>{MUMMIFICATION_QUEST_TITLE}</h2>
          <p>
            Mummify an orange, design a sarcophagus, and interpret evidence.
          </p>
        </div>
        <div className="mummification-hero-note">
          <ShieldCheck size={18} />
          <span>Year 7 friendly. Teacher-led practical.</span>
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
              <ArrowLeft size={16} /> Back
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
