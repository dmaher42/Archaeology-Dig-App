import { useState, useMemo } from 'react'; 
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  MouseSensor, 
  TouchSensor, 
  DragOverlay,
  useDraggable,
  useDroppable,
  pointerWithin,
  rectIntersection
} from '@dnd-kit/core';
import { 
  CheckCircle2, AlertCircle, Tent, Beaker, HelpCircle, Search
} from 'lucide-react';
import { 
  getArtifactTheme, 
  getSortingHint,
  getSortingSuccessMessage,
  CATEGORIES
} from '../utils/gameLogic';
import { getIcon } from './Icons';
import { getAtlasRegionStyle, useFullInvestigationAssets } from './full-investigation/fullInvestigationAssets';

const formatConditionLabel = (condition) => {
  if (!condition) return '';
  return condition.charAt(0).toUpperCase() + condition.slice(1);
};

const customCollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(args);
};

function DraggableArtifact({ artifact, condition, assetStyle }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: artifact.id,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1001,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`sort-artifact-card ${assetStyle ? 'fi-asset-region fi-pending-evidence-card' : ''} ${isDragging ? 'dragging' : ''}`}
      data-fi-ui-asset={assetStyle ? 'pendingEvidenceCard' : undefined}
      style={{ ...(assetStyle || {}), ...(style || {}) }}
    >
      <div className="sort-artifact-icon sort-artifact-icon--neutral" aria-hidden="true">
        <Search size={22} />
      </div>
      <div className="sort-artifact-copy">
        <div className="sort-artifact-name">{artifact.name}</div>
        <div className="sort-artifact-clue">{artifact.clue}</div>
        {condition?.condition && (
          <div className={`sort-artifact-condition condition-${condition.condition}`}>
            Field condition: {formatConditionLabel(condition.condition)}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryBin({ categoryId, title, description, items, assetStyle }) {
  const { isOver, setNodeRef } = useDroppable({
    id: categoryId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`category-bin ${assetStyle ? 'fi-asset-region fi-category-folder' : ''} ${isOver ? 'is-over' : ''}`}
      data-fi-ui-asset={assetStyle ? 'categoryFolderBackground' : undefined}
      style={assetStyle}
    >
      <div className="category-bin-header">
        <div className="category-bin-header-copy">
          <span className="category-bin-title">{title}</span>
          <span className="category-bin-description">{description}</span>
        </div>
        <span className="category-bin-count">{items.length} finds</span>
      </div>
      <div className="category-bin-list">
        {items.map(item => {
          const theme = getArtifactTheme(item);
          return (
            <div key={item.id} className="category-bin-item">
              <div className="category-bin-item-icon" style={{ color: theme.accent }}>
                {getIcon(item.type, 16)}
              </div>
              <span className="category-bin-item-name">{item.name}</span>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="category-bin-empty">File {title} Here</div>
        )}
      </div>
    </div>
  );
}

export function SortPhase({ activeArtifacts, itemsLocation, setItemsLocation, onComplete, onBackToMenu, currentScenario, evidenceConditions = {} }) {
  const [activeArtifactId, setActiveArtifactId] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', isError: false });
  const [attemptsMap, setAttemptsMap] = useState({});
  const [showTutorial, setShowTutorial] = useState(true);
  const fullInvestigationAssets = useFullInvestigationAssets();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const inventory = activeArtifacts.filter(item => !itemsLocation[item.id] || itemsLocation[item.id] === 'inventory');
  const bins = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      items: activeArtifacts.filter(item => itemsLocation[item.id] === cat.id),
    }));
  }, [activeArtifacts, itemsLocation]);

  const sortedCount = activeArtifacts.length - inventory.length;
  const progressPercent = (sortedCount / activeArtifacts.length) * 100;
  const activeArtifact = activeArtifactId ? activeArtifacts.find(a => a.id === activeArtifactId) : null;
  const feedbackLabel = feedback.isError ? 'Try again' : 'Correct';
  const feedbackText = feedback.isError
    ? feedback.message.replace(/^Try again[:.]?\s*/i, '')
    : feedback.message.replace(/^Correct\.\s*/i, '');
  const pendingEvidenceStyle = getAtlasRegionStyle(fullInvestigationAssets, 'pendingEvidenceCard')
    || getAtlasRegionStyle(fullInvestigationAssets, 'neutralEvidenceSlip');
  const categoryFolderStyle = getAtlasRegionStyle(fullInvestigationAssets, 'categoryFolderBackground')
    || getAtlasRegionStyle(fullInvestigationAssets, 'openEvidenceFolder');

  const handleDragStart = (event) => {
    setActiveArtifactId(event.active?.id ?? null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveArtifactId(null);
    if (!active || !over) return;

    const artifactId = active.id;
    const categoryId = over.id;
    const artifact = activeArtifacts.find(a => a.id === artifactId);
    if (!artifact) return;

    const isCorrect = artifact.type === categoryId;
    if (isCorrect) {
      setItemsLocation(prev => ({ ...prev, [artifactId]: categoryId }));
      setFeedback({ message: getSortingSuccessMessage(artifact, categoryId), isError: false });
    } else {
      const currentAttempts = (attemptsMap[artifactId] || 0) + 1;
      setAttemptsMap(prev => ({ ...prev, [artifactId]: currentAttempts }));
      setFeedback({ message: getSortingHint(artifact, currentAttempts), isError: true });
    }
  };

  return (
    <div className="phase-container sort-phase">
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="phase-status-panel-compact sort-status-panel">
          <div className="status-panel-info">
            <div className="status-icon-box-small">
              <Tent size={20} />
            </div>
            <div className="status-text-content-horizontal">
              <div className="sort-status-title-row">
                <h2>Phase 2: Evidence Processing</h2>
                <span className="status-site-badge">{currentScenario?.civilization || 'Active Site'}</span>
              </div>
              <p>Categorize each piece of evidence based on the field notes.</p>
            </div>
          </div>

          <div className="status-panel-progress-compact">
            <div className="progress-label-group">
               <span className="progress-label-mini">PROGRESS</span>
               <span className="progress-count-mini">{sortedCount} / {activeArtifacts.length} sorted</span>
            </div>
            <div className="progress-bar-thin">
               <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="status-panel-actions-compact">
            <button className="btn sort-menu-btn" onClick={onBackToMenu}>Main Menu</button>
            <button className="btn primary-btn" onClick={onComplete} disabled={sortedCount < activeArtifacts.length}>
              Open Lab <Beaker size={18} />
            </button>
          </div>
        </div>

        <div className="sort-layout">
          <section className="sort-tray-panel">
            <div className="sort-tray-header">
              <span className="sort-panel-label">Pending Evidence</span>
              <span className="sort-panel-hint">Process these into the correct folders</span>
            </div>
            <div className={`sort-tray-list ${inventory.length === 0 ? 'is-complete' : ''}`}>
              {inventory.map(item => (
                <DraggableArtifact key={item.id} artifact={item} condition={evidenceConditions[item.id]} assetStyle={pendingEvidenceStyle} />
              ))}
              {inventory.length === 0 && (
                <div className="sort-tray-empty">
                  <CheckCircle2 size={32} />
                  <p>All evidence processed!</p>
                  <button className="btn primary-btn" onClick={onComplete}>Finalize Lab Report</button>
                </div>
              )}
            </div>
          </section>

          <section className="sort-bins-panel">
            <div className="sort-bins-grid">
              {bins.map(bin => (
                <CategoryBin 
                  key={bin.id} 
                  categoryId={bin.id} 
                  title={bin.title} 
                  description={bin.description} 
                  items={bin.items} 
                  assetStyle={categoryFolderStyle}
                />
              ))}
            </div>
          </section>
        </div>

        {feedback.message && (
          <div
            className={`sort-feedback ${feedback.isError ? 'error' : 'success'}`}
            role="status"
            aria-live="polite"
          >
            <span className="sort-feedback-icon" aria-hidden="true">
              {feedback.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            </span>
            <span className="sort-feedback-copy">
              <strong>{feedbackLabel}</strong>
              <span>{feedbackText}</span>
            </span>
          </div>
        )}

        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeArtifact ? <DraggableArtifact artifact={activeArtifact} condition={evidenceConditions[activeArtifact.id]} assetStyle={pendingEvidenceStyle} /> : null}
        </DragOverlay>
      </DndContext>

      {showTutorial && sortedCount === 0 && (
        <div className="sort-tutorial-overlay" onClick={() => setShowTutorial(false)}>
           <div className="sort-tutorial-card glass-card" onClick={(event) => event.stopPropagation()}>
              <HelpCircle size={32} className="sort-tutorial-icon" />
              <h3>Categorisation Protocol</h3>
              <p>Sort each piece of evidence into the correct folder.</p>
              <p>Use the field notes to decide whether the evidence is an artefact, human remain, structure, environmental clue, or written source.</p>
              <ul className="sort-tutorial-categories" aria-label="Evidence category reminder">
                <li><strong>Artefacts / Objects</strong><span>things people made or used</span></li>
                <li><strong>Human Remains</strong><span>physical evidence from people</span></li>
                <li><strong>Features / Structures</strong><span>built or changed places</span></li>
                <li><strong>Environmental Evidence</strong><span>natural clues</span></li>
                <li><strong>Written Sources</strong><span>writing, symbols or records</span></li>
              </ul>
              <button className="btn primary-btn" onClick={() => setShowTutorial(false)}>Got it</button>
           </div>
        </div>
      )}
    </div>
  );
}
