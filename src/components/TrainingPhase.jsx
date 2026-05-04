import { useState, useLayoutEffect, useRef, useEffect } from 'react';
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
  Search, FileText, Pickaxe, MapPin, Beaker
} from 'lucide-react';
import confetti from 'canvas-confetti';

const TRAINING_STAGES = [
  { id: 'survey', title: 'Survey', purpose: 'Find a possible site' },
  { id: 'grid', title: 'Grid', purpose: 'Mark out the site so locations can be recorded' },
  { id: 'excavate', title: 'Excavate', purpose: 'Carefully uncover evidence' },
  { id: 'map', title: 'Map', purpose: 'Record where each find was discovered' },
  { id: 'lab', title: 'Lab', purpose: 'Analyse the finds to work out what they mean' },
];

const TRAINING_STAGE_ICONS = {
  survey: Search,
  grid: FileText,
  excavate: Pickaxe,
  map: MapPin,
  lab: Beaker,
};

const customCollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(args);
};

function TrainingStageCard({ stage, compact = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: stage.id,
  });
  const Icon = TRAINING_STAGE_ICONS[stage.id] ?? Search;
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
      className={`training-stage-card ${compact ? 'compact' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="training-stage-chip">
        <Icon size={18} />
      </div>
      <div className="training-stage-copy">
        <span className="training-stage-title">{stage.title}</span>
        <span className="training-stage-purpose">{stage.purpose}</span>
      </div>
    </div>
  );
}

function TrainingSlot({ index, stage }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `training-slot-${index}`,
  });

  return (
    <div ref={setNodeRef} className={`training-slot ${isOver ? 'is-over' : ''} ${stage ? 'filled' : ''}`}>
      <div className="training-slot-label">Step {index + 1}</div>
      {stage ? (
        <TrainingStageCard stage={stage} compact />
      ) : (
        <div className="training-slot-empty">
          <span>Drop stage here</span>
        </div>
      )}
    </div>
  );
}

function TrainingTray({ stages }) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'training-tray',
  });

  return (
    <div className={`training-tray ${isOver ? 'is-over' : ''}`} ref={setNodeRef}>
      <div className="training-tray-header">
        <span className="training-panel-kicker">Stage cards</span>
        <span className="training-tray-hint">Drag these into the correct order</span>
      </div>
      <div className="training-tray-list">
        {stages.map(stage => (
          <TrainingStageCard key={stage.id} stage={stage} />
        ))}
      </div>
    </div>
  );
}

export function TrainingPhase({ trainingPlacements, setTrainingPlacements, onBackToMenu }) {
  const [activeStageId, setActiveStageId] = useState(null);
  const didCelebrateRef = useRef(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const stageById = new Map(TRAINING_STAGES.map(s => [s.id, s]));
  const trayStages = TRAINING_STAGES.filter(s => !trainingPlacements.includes(s.id));
  const activeStage = activeStageId ? stageById.get(activeStageId) : null;

  const correctCount = trainingPlacements.reduce((count, stageId, index) => {
    return stageId === TRAINING_STAGES[index].id ? count + 1 : count;
  }, 0);

  const isComplete = correctCount === TRAINING_STAGES.length;

  useEffect(() => {
    if (isComplete && !didCelebrateRef.current) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      didCelebrateRef.current = true;
    }
    if (!isComplete) {
      didCelebrateRef.current = false;
    }
  }, [isComplete]);

  const handleDragStart = (event) => {
    setActiveStageId(event.active?.id ?? null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveStageId(null);
    if (!active || !over) return;

    const activeId = active.id;
    const overId = over.id;

    if (overId === 'training-tray') {
      setTrainingPlacements(prev => prev.map(stageId => (stageId === activeId ? null : stageId)));
      return;
    }

    if (typeof overId === 'string' && overId.startsWith('training-slot-')) {
      const slotIndex = Number(overId.replace('training-slot-', ''));
      if (Number.isNaN(slotIndex)) return;

      setTrainingPlacements(prev => {
        const next = [...prev];
        const currentIndex = next.indexOf(activeId);
        if (currentIndex !== -1) next[currentIndex] = null;
        next[slotIndex] = activeId;
        return next;
      });
    }
  };

  return (
    <section className="phase-container training-phase">
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="training-hero glass-card">
          <div className="training-hero-copy">
            <div className="training-kicker">Archaeologist Training</div>
            <h2>How Do We Investigate the Past?</h2>
            <p>
              Put the five archaeology stages in order.
            </p>
          </div>
          <div className="training-hero-actions">
            <button className="btn" type="button" onClick={onBackToMenu}>Back to menu</button>
          </div>
        </div>

        <div className="training-layout">
          <TrainingTray stages={trayStages} />
          <div className="training-board glass-card">
            <div className="training-board-header">
              <div>
                <div className="training-panel-kicker">Put these in order</div>
                <h3>Survey, Grid, Excavate, Map, Lab</h3>
              </div>
              <div className="training-progress">
                {correctCount}/5 correct
              </div>
            </div>

            <div className="training-slots">
              {TRAINING_STAGES.map((stage, index) => (
                <TrainingSlot
                  key={stage.id}
                  index={index}
                  stage={stageById.get(trainingPlacements[index]) ?? null}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="training-summary glass-card">
          {isComplete ? (
            <>
              <div className="training-success-message">You are ready to investigate the ancient past.</div>
              <p className="training-prompt">Why does the order matter?</p>
              <div className="training-answer-starter">
                If archaeologists move evidence before recording it, then...
              </div>
              <div className="training-summary-actions">
                <button className="btn primary-btn" type="button" onClick={onBackToMenu}>
                  Back to menu
                </button>
              </div>
            </>
          ) : (
            <div className="training-summary-copy">
              <span className="training-summary-title">Keep going</span>
              <p>
                Use the tray on the left to place each stage in the correct order.
              </p>
              <div className="training-summary-note">
                {correctCount}/5 stages are in the right place.
              </div>
            </div>
          )}
        </div>

        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeStage ? <TrainingStageCard stage={activeStage} compact /> : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
