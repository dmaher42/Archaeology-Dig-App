import { useCallback, useEffect, useRef } from 'react';

import { JOURNEY_PROP_EDITOR_PANEL_POS_KEY } from './journeyConstants';

// DEV-only prop-editor panel positioning: remembers where you dragged the floating
// editor panel (persisted to localStorage) and restores it on reload. Extracted from
// ExpeditionJourney as the first self-contained slice of the editor decomposition.
export function useJourneyEditorPanelPosition() {
  const editorPanelRef = useRef(null);
  const editorPanelPosRef = useRef(null);
  const editorPanelDragRef = useRef(null);

  // Load the saved editor panel position so a dragged panel returns to where
  // you left it after a reload.
  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(JOURNEY_PROP_EDITOR_PANEL_POS_KEY);
      if (raw) {
        const pos = JSON.parse(raw);
        if (Number.isFinite(pos?.x) && Number.isFinite(pos?.y)) editorPanelPosRef.current = pos;
      }
    } catch {
      // Ignore corrupt saved position.
    }
  }, []);

  // Callback ref: when the panel mounts, apply any saved drag position.
  const setEditorPanelNode = useCallback((node) => {
    editorPanelRef.current = node;
    const pos = editorPanelPosRef.current;
    if (node && pos) {
      node.style.left = `${pos.x}px`;
      node.style.top = `${pos.y}px`;
      node.style.right = 'auto';
    }
  }, []);

  const resetEditorPanelPosition = useCallback(() => {
    const node = editorPanelRef.current;
    if (node) {
      node.style.left = '';
      node.style.top = '';
      node.style.right = '';
    }
    editorPanelPosRef.current = null;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(JOURNEY_PROP_EDITOR_PANEL_POS_KEY);
      } catch {
        // Ignore storage failures.
      }
    }
  }, []);

  const handleEditorPanelDragStart = useCallback((event) => {
    const node = editorPanelRef.current;
    if (!node || typeof window === 'undefined') return;
    // Let buttons / inputs inside the header behave normally.
    if (event.target.closest('button, input, select, textarea, a')) return;
    event.preventDefault();
    const rect = node.getBoundingClientRect();
    editorPanelDragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    node.style.right = 'auto';
    const handleMove = (moveEvent) => {
      const drag = editorPanelDragRef.current;
      if (!drag) return;
      const parentRect = node.offsetParent?.getBoundingClientRect?.()
        || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      const maxX = Math.max(0, parentRect.width - node.offsetWidth);
      const maxY = Math.max(0, parentRect.height - node.offsetHeight);
      const x = Math.max(0, Math.min(moveEvent.clientX - parentRect.left - drag.offsetX, maxX));
      const y = Math.max(0, Math.min(moveEvent.clientY - parentRect.top - drag.offsetY, maxY));
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      editorPanelPosRef.current = { x, y };
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      editorPanelDragRef.current = null;
      if (editorPanelPosRef.current) {
        try {
          window.localStorage.setItem(JOURNEY_PROP_EDITOR_PANEL_POS_KEY, JSON.stringify(editorPanelPosRef.current));
        } catch {
          // Ignore storage failures.
        }
      }
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, []);

  return { setEditorPanelNode, resetEditorPanelPosition, handleEditorPanelDragStart };
}
