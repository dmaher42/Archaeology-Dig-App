import { useMemo, useState } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  DragOverlay,
  useDraggable,
  useDroppable,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import { CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

// Ancient China Section One — the dynasty timeline puzzle.
//
// Reusable, self-contained ordering puzzle: the player drags the four dynasty
// evidence cards they gathered in the level into the correct chronological order
// (Shang -> Zhou -> Qin -> Han). Solving it "stabilises the memory" and confirms
// the imperial mandate. Built on @dnd-kit/core (the same drag system the
// excavation Sort phase uses) so it stays consistent with the rest of the game.
//
// This component is civilisation-agnostic: pass any ordered evidence set with the
// shape { id, order, dynasty, period, evidenceName, icon, clue, teach } and it
// becomes the timeline puzzle for that civilisation — the model for Egypt, Rome
// and Australia to reuse. The slot tray is DERIVED from the slot state, so there
// is a single source of truth (no double-set-state under React StrictMode).

const CHINA_EVIDENCE_ICON_ATLAS_SRC = `${import.meta.env.BASE_URL}assets/expedition/ui/china/china-evidence-icons.png`;
const ICON_ATLAS_COLUMNS = 5;
const ICON_ATLAS_INDEX_BY_KEY = {
  bronze: 0,
  shang: 0,
  scroll: 1,
  zhou: 1,
  coin: 2,
  qin: 2,
  compass: 3,
  han: 3,
  jade: 4,
  river: 4,
  default: 4,
};

const customCollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(args);
};

const palette = {
  ink: '#2c2014',
  parchment: '#f3e6c8',
  parchmentEdge: '#d8c096',
  gold: '#b8860b',
  good: '#3f7d4f',
  bad: '#b4633a',
};

function EvidenceIcon({ icon }) {
  const index = ICON_ATLAS_INDEX_BY_KEY[icon] ?? ICON_ATLAS_INDEX_BY_KEY.default;
  const position = ICON_ATLAS_COLUMNS <= 1 ? 0 : (index / (ICON_ATLAS_COLUMNS - 1)) * 100;
  return (
    <div
      aria-hidden="true"
      style={{
        width: 40,
        height: 40,
        borderRadius: 9,
        backgroundColor: 'rgba(184, 134, 11, 0.18)',
        backgroundImage: `url(${CHINA_EVIDENCE_ICON_ATLAS_SRC})`,
        backgroundSize: `${ICON_ATLAS_COLUMNS * 100}% 100%`,
        backgroundPosition: `${position}% 50%`,
        backgroundRepeat: 'no-repeat',
        border: '1px solid rgba(112, 76, 16, 0.28)',
        boxShadow: 'inset 0 0 0 1px rgba(255, 244, 210, 0.22)',
        flex: '0 0 auto',
      }}
    />
  );
}

function DynastyCard({ item, compact = false, state = 'idle' }) {
  const borderColor = state === 'correct' ? palette.good
    : state === 'wrong' ? palette.bad
    : palette.parchmentEdge;
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: compact ? '8px 10px' : '10px 12px',
        width: '100%',
        borderRadius: 12,
        background: `linear-gradient(180deg, ${palette.parchment}, #e9d6ad)`,
        border: `2px solid ${borderColor}`,
        boxShadow: '0 4px 10px rgba(40, 26, 12, 0.28)',
        color: palette.ink,
      }}
    >
      <EvidenceIcon icon={item.icon || 'default'} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
        <strong style={{ fontSize: 14 }}>{item.dynasty}</strong>
        <span style={{ fontSize: 12, opacity: 0.85 }}>{item.evidenceName}</span>
        {!compact && <span style={{ fontSize: 11, opacity: 0.7 }}>{item.clue}</span>}
        {state === 'correct' && (
          <span style={{ fontSize: 11, color: palette.good, fontWeight: 600 }}>{item.period} — {item.teach}</span>
        )}
      </div>
    </div>
  );
}

function DraggableCard({ item }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.35 : 1,
    cursor: 'grab',
    touchAction: 'none',
  };
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <DynastyCard item={item} compact />
    </div>
  );
}

function Slot({ index, label, item, state }) {
  const { isOver, setNodeRef } = useDroppable({ id: `slot-${index}` });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: palette.parchment, opacity: 0.85, minHeight: 14 }}>
        {label}
      </span>
      <div
        ref={setNodeRef}
        style={{
          width: '100%',
          minHeight: 78,
          borderRadius: 12,
          display: 'grid',
          placeItems: 'center',
          padding: 6,
          border: `2px dashed ${isOver ? palette.gold : 'rgba(243, 230, 200, 0.45)'}`,
          background: isOver ? 'rgba(184, 134, 11, 0.18)' : 'rgba(20, 14, 8, 0.35)',
          transition: 'background 120ms ease, border-color 120ms ease',
        }}
      >
        {item
          ? <DynastyCard item={item} compact state={state} />
          : <span style={{ fontSize: 22, color: 'rgba(243, 230, 200, 0.5)' }}>{index + 1}</span>}
      </div>
    </div>
  );
}

function TrayZone({ trayIds, byId, empty }) {
  const { isOver, setNodeRef } = useDroppable({ id: 'tray' });
  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
        minHeight: 70,
        padding: 10,
        borderRadius: 12,
        border: `2px solid ${isOver ? palette.gold : 'rgba(243, 230, 200, 0.25)'}`,
        background: 'rgba(20, 14, 8, 0.3)',
      }}
    >
      {empty
        ? <span style={{ color: 'rgba(243, 230, 200, 0.6)', alignSelf: 'center' }}>All evidence placed — confirm the order.</span>
        : trayIds.map((cardId) => (
          <div key={cardId} style={{ width: 'min(360px, 100%)' }}>
            <DraggableCard item={byId[cardId]} />
          </div>
        ))}
    </div>
  );
}

export default function DynastyTimelinePuzzle({
  dynasties = [],
  title = 'Restore the Dynasty Timeline',
  question = 'How did early China become unified under powerful dynasties and emperors?',
  onSolved,
}) {
  const count = dynasties.length;
  const byId = useMemo(() => Object.fromEntries(dynasties.map((d) => [d.id, d])), [dynasties]);

  // A stable, never-already-solved display order for tray cards (no randomness so
  // resume/StrictMode stays deterministic): take chronological order, reverse,
  // then rotate by one.
  const stableOrder = useMemo(() => {
    const ids = [...dynasties].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((d) => d.id);
    ids.reverse();
    if (ids.length > 2) ids.push(ids.shift());
    return ids;
  }, [dynasties]);

  const slotLabels = useMemo(
    () => Array.from({ length: count }, (_, i) => (i === 0 ? 'Earliest' : i === count - 1 ? 'Latest' : '')),
    [count],
  );

  const [slots, setSlots] = useState(() => Array(count).fill(null));
  const [activeId, setActiveId] = useState(null);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

  // Tray is derived: any card not currently sitting in a slot, in stable order.
  const trayIds = stableOrder.filter((id) => !slots.includes(id));
  const allPlaced = slots.every(Boolean);

  const placeCard = (cardId, target) => {
    setChecked(false);
    setSlots((prev) => {
      const next = prev.map((id) => (id === cardId ? null : id)); // pull card out of any slot
      if (target !== 'tray') {
        const slotIndex = Number(target.replace('slot-', ''));
        if (Number.isInteger(slotIndex) && slotIndex >= 0 && slotIndex < next.length) {
          next[slotIndex] = cardId; // displaced card (if any) falls back to the derived tray
        }
      }
      return next;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!active || !over) return;
    placeCard(active.id, over.id);
  };

  const handleCheck = () => {
    setChecked(true);
    if (slots.every((cardId, index) => byId[cardId]?.order === index)) setSolved(true);
  };

  const handleReset = () => {
    setSlots(Array(count).fill(null));
    setChecked(false);
  };

  const slotState = (index) => {
    if (solved) return 'correct';
    if (!checked || !slots[index]) return 'idle';
    return byId[slots[index]]?.order === index ? 'correct' : 'wrong';
  };

  const wrongCount = checked && !solved
    ? slots.filter((cardId, index) => cardId && byId[cardId]?.order !== index).length
    : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dynasty timeline puzzle"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        display: 'grid',
        placeItems: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(40, 28, 14, 0.82), rgba(8, 6, 4, 0.94))',
        padding: 16,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: 'min(840px, 100%)',
          borderRadius: 18,
          padding: '20px 22px 22px',
          background: 'linear-gradient(180deg, #3a2a18, #241810)',
          border: '1px solid rgba(184, 134, 11, 0.45)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55)',
          color: palette.parchment,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: palette.gold }}>
            Ancient China · Evidence Recovered
          </div>
          <h2 style={{ margin: '6px 0 4px', fontSize: 22 }}>{title}</h2>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
            The memory of China fractured. Place the evidence in the order the dynasties actually ruled.
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 12, fontStyle: 'italic', opacity: 0.7 }}>{question}</p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={(event) => setActiveId(event.active?.id ?? null)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6 }}>
            {slots.map((cardId, index) => (
              <Slot key={`slot-${index}`} index={index} label={slotLabels[index]} item={cardId ? byId[cardId] : null} state={slotState(index)} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '2px 0 14px', opacity: 0.7, fontSize: 11 }}>
            <span>Earliest dynasty</span>
            <ArrowRight size={14} />
            <span>Latest dynasty</span>
          </div>

          {!solved && (
            <TrayZone trayIds={trayIds} byId={byId} empty={trayIds.length === 0} />
          )}

          <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
            {activeId ? <div style={{ width: 'min(360px, 100%)' }}><DynastyCard item={byId[activeId]} compact /></div> : null}
          </DragOverlay>
        </DndContext>

        {checked && !solved && (
          <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, background: 'rgba(180, 99, 58, 0.18)', border: `1px solid ${palette.bad}`, fontSize: 13 }}>
            Not quite — {wrongCount} {wrongCount === 1 ? 'piece is' : 'pieces are'} out of order. Remember the line: <strong>Shang → Zhou → Qin → Han</strong>. Drag them to fix it.
          </div>
        )}

        {solved && (
          <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: 'rgba(63, 125, 79, 0.2)', border: `1px solid ${palette.good}`, fontSize: 13 }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <CheckCircle2 size={16} /> The memory stabilises.
            </strong>
            Shang bronze and writing, Zhou philosophy, Qin unification, Han invention — the line is whole. The Imperial Mandate is confirmed and the road into Imperial China is open.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
          {!solved && (
            <>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 14px', borderRadius: 10, cursor: 'pointer',
                  background: 'transparent', color: palette.parchment,
                  border: '1px solid rgba(243, 230, 200, 0.4)', fontSize: 13,
                }}
              >
                <RotateCcw size={15} /> Reset
              </button>
              <button
                type="button"
                onClick={handleCheck}
                disabled={!allPlaced}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 10,
                  cursor: allPlaced ? 'pointer' : 'not-allowed',
                  background: allPlaced ? `linear-gradient(180deg, ${palette.gold}, #8a6308)` : 'rgba(120, 96, 40, 0.4)',
                  color: '#fff', border: 'none', fontSize: 14, fontWeight: 600,
                  opacity: allPlaced ? 1 : 0.7,
                }}
              >
                Confirm the Timeline
              </button>
            </>
          )}
          {solved && (
            <button
              type="button"
              onClick={() => onSolved?.()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 22px', borderRadius: 10, cursor: 'pointer',
                background: `linear-gradient(180deg, ${palette.good}, #2c5c39)`,
                color: '#fff', border: 'none', fontSize: 15, fontWeight: 600,
              }}
            >
              Continue into Imperial China <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
