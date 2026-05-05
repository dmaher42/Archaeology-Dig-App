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
  CheckCircle2, AlertCircle, Tent, Search, Beaker, HelpCircle
} from 'lucide-react';
import { 
  getArtifactTheme, 
  getCategoryTitle,
  getSortingHint,
  getSortingSuccessMessage,
  CATEGORIES
} from '../utils/gameLogic';
import { getIcon } from './Icons';

const customCollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(args);
};

function DraggableArtifact({ artifact }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: artifact.id,
  });
  const theme = getArtifactTheme(artifact);
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1001,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`sort-artifact-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="sort-artifact-icon" style={{ color: theme.accent }}>
        {getIcon(artifact.type, 24)}
      </div>
      <div className="sort-artifact-copy">
        <div className="sort-artifact-name">{artifact.name}</div>
        <div className="sort-artifact-clue">{artifact.clue}</div>
      </div>
    </div>
  );
}

function CategoryBin({ categoryId, title, description, items }) {
  const { isOver, setNodeRef } = useDroppable({
    id: categoryId,
  });

  return (
    <div ref={setNodeRef} className={`category-bin ${isOver ? 'is-over' : ''}`}>
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
          <div className="category-bin-empty">Drop {title} here</div>
        )}
      </div>
    </div>
  );
}

export function SortPhase({ activeArtifacts, itemsLocation, setItemsLocation, onComplete, onBackToMenu, currentScenario }) {
  const [activeArtifactId, setActiveArtifactId] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', isError: false });
  const [attemptsMap, setAttemptsMap] = useState({});
  const [showTutorial, setShowTutorial] = useState(true);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const inventory = activeArtifacts.filter(item => itemsLocation[item.id] === 'inventory');
  const bins = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      items: activeArtifacts.filter(item => itemsLocation[item.id] === cat.id),
    }));
  }, [activeArtifacts, itemsLocation]);

  const sortedCount = activeArtifacts.length - inventory.length;
  const progressPercent = (sortedCount / activeArtifacts.length) * 100;
  const activeArtifact = activeArtifactId ? activeArtifacts.find(a => a.id === activeArtifactId) : null;

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
              <div style={{display: 'flex', alignItems: 'baseline', gap: '10px'}}>
                <h2>Phase 2: The Sorting Tent</h2>
                <span className="status-site-badge">{currentScenario?.civilization || 'Archaeological Site'}</span>
              </div>
              <p>Match each find to its correct category based on the clue.</p>
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
            <button className="btn" onClick={onBackToMenu}>Main Menu</button>
            <button className="btn primary-btn" onClick={onComplete} disabled={sortedCount < activeArtifacts.length}>
              Open Lab <Beaker size={18} />
            </button>
          </div>
        </div>

        <div className="sort-layout">
          <section className="sort-tray-panel">
            <div className="sort-tray-header">
              <span className="sort-panel-label">Recent finds</span>
              <span className="sort-panel-hint">Drag these into the bins</span>
            </div>
            <div className="sort-tray-list">
              {inventory.map(item => (
                <DraggableArtifact key={item.id} artifact={item} />
              ))}
              {inventory.length === 0 && (
                <div className="sort-tray-empty">
                  <CheckCircle2 size={32} />
                  <p>All items sorted!</p>
                  <button className="btn primary-btn" onClick={onComplete}>Next Phase</button>
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
                />
              ))}
            </div>
          </section>
        </div>

        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeArtifact ? <DraggableArtifact artifact={activeArtifact} /> : null}
        </DragOverlay>
      </DndContext>

      {feedback.message && (
        <div className={`sort-feedback ${feedback.isError ? 'error' : 'success'}`}>
          {feedback.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {showTutorial && sortedCount === 0 && (
        <div className="sort-tutorial-overlay" onClick={() => setShowTutorial(false)}>
           <div className="sort-tutorial-card glass-card">
              <HelpCircle size={32} className="sort-tutorial-icon" />
              <h3>How to sort</h3>
              <p>Drag each find from the tray on the left into one of the bins on the right.</p>
              <p><strong>Clues</strong> on the card will help you choose between <em>Artefacts / Objects, Human Remains, Features / Structures, Environmental Evidence,</em> or <em>Written Sources</em>.</p>
              <button className="btn primary-btn">Got it</button>
           </div>
        </div>
      )}
    </div>
  );
}
