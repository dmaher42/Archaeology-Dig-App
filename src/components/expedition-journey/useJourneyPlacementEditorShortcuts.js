import { useEffect } from 'react';

export function useJourneyPlacementEditorShortcuts({
  DEFAULT_JOURNEY_PROP_EDITOR_ROTATION_STEP,
  DEFAULT_JOURNEY_PROP_EDITOR_SCALE_STEP,
  applyDefaultEditorLocks,
  deleteSelectedPropFromEditor,
  draw,
  duplicateSelectedPropInEditor,
  getEditedNestParams,
  getPropEditorSelectedNest,
  getPropEditorSelectedProp,
  isJourneyEditorFormTarget,
  propPlacementEditorRef,
  redoEditorChange,
  refreshPropEditorUi,
  savePropPlacementExport,
  stateRef,
  undoEditorChange,
  updateSelectedPropEditorTransform,
}) {
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    const handlePropEditorKeyDown = (event) => {
      if (isJourneyEditorFormTarget(event.target)) return;
      const editor = propPlacementEditorRef.current;
      // Plain E is reserved for the in-world Journey Room interact system, so the
      // dev prop-editor toggle requires Shift+E.
      if (event.code === 'KeyE' && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        editor.enabled = !editor.enabled;
        if (editor.enabled) {
          applyDefaultEditorLocks(stateRef.current);
        } else {
          editor.selectedPropId = null;
          editor.selectedPlatformId = null;
          editor.selectedHazardId = null;
          editor.selectedArchId = null;
          editor.selectedCheckpointId = null;
          editor.selectedLairId = null;
          editor.selectedNestId = null;
          editor.dragging = null;
          editor.hover = null;
        }
        refreshPropEditorUi();
        return;
      }
      if (!editor.enabled) return;
      // Tab cycles through entities stacked under the cursor (the hover preview updates,
      // and the next click selects whatever is highlighted).
      if (event.code === 'Tab' && editor.hover && editor.hover.stack && editor.hover.stack.length > 1) {
        event.preventDefault();
        const count = editor.hover.stack.length;
        const step = event.shiftKey ? -1 : 1;
        editor.hover = {
          ...editor.hover,
          index: ((editor.hover.index + step) % count + count) % count,
        };
        draw();
        return;
      }
      // Scorpion-nest tuning: keys adjust the selected nest's size/anchor/glow.
      const selectedNestForKeys = getPropEditorSelectedNest();
      if (selectedNestForKeys && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const id = selectedNestForKeys.id;
        const cur = getEditedNestParams(selectedNestForKeys);
        const applyNest = (patch) => {
          editor.scorpionNestEdits[id] = { ...(editor.scorpionNestEdits[id] || {}), ...patch };
          refreshPropEditorUi();
        };
        switch (event.code) {
          case 'BracketLeft':
            event.preventDefault();
            applyNest({ widthScale: Math.max(0.3, Number((cur.widthScale - 0.05).toFixed(2))) });
            return;
          case 'BracketRight':
            event.preventDefault();
            applyNest({ widthScale: Number((cur.widthScale + 0.05).toFixed(2)) });
            return;
          case 'Semicolon':
            event.preventDefault();
            applyNest({ yOffset: cur.yOffset - 1 });
            return;
          case 'Quote':
            event.preventDefault();
            applyNest({ yOffset: cur.yOffset + 1 });
            return;
          case 'Comma':
            event.preventDefault();
            applyNest({ glowYFactor: Number((cur.glowYFactor - 0.02).toFixed(2)) });
            return;
          case 'Period':
            event.preventDefault();
            applyNest({ glowYFactor: Number((cur.glowYFactor + 0.02).toFixed(2)) });
            return;
          case 'Digit9':
            event.preventDefault();
            applyNest({ glowSize: Math.max(0.1, Number((cur.glowSize - 0.05).toFixed(2))) });
            return;
          case 'Digit0':
            event.preventDefault();
            applyNest({ glowSize: Number((cur.glowSize + 0.05).toFixed(2)) });
            return;
          case 'Backslash':
            event.preventDefault();
            delete editor.scorpionNestEdits[id];
            refreshPropEditorUi();
            return;
          default:
            break;
        }
      }
      if (event.code === 'KeyG' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        editor.gridSnap = !editor.gridSnap;
        refreshPropEditorUi();
        return;
      }
      if (event.code === 'KeyP' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        editor.paletteOpen = !editor.paletteOpen;
        if (!editor.paletteOpen) editor.selectedPaletteKey = null;
        refreshPropEditorUi();
        return;
      }
      // Escape is two-stage while the palette is open: first press disarms the held
      // item (back to select/move clicks), second press closes the palette.
      if (event.code === 'Escape' && editor.paletteOpen) {
        event.preventDefault();
        if (editor.selectedPaletteKey) editor.selectedPaletteKey = null;
        else editor.paletteOpen = false;
        refreshPropEditorUi();
        return;
      }
      if (event.code === 'KeyT' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        editor.showTrapTriggers = !editor.showTrapTriggers;
        refreshPropEditorUi();
        return;
      }
      if (event.code === 'KeyH' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        editor.previewMode = !editor.previewMode;
        refreshPropEditorUi();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyZ') {
        event.preventDefault();
        if (event.shiftKey) redoEditorChange();
        else undoEditorChange();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyY') {
        event.preventDefault();
        redoEditorChange();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
        event.preventDefault();
        savePropPlacementExport();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyD') {
        event.preventDefault();
        duplicateSelectedPropInEditor();
        return;
      }
      // Anchor nudge: ; lifts and ' drops the selected prop's vertical anchor (yOffset),
      // mirroring the scorpion-nest anchor keys so any asset can be placed exactly. Hold
      // Shift for a coarse 10px step. Negative yOffset lifts the art up off the ground line.
      if ((event.code === 'Semicolon' || event.code === 'Quote') && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          const step = event.shiftKey ? 10 : 1;
          const direction = event.code === 'Semicolon' ? -1 : 1;
          const currentYOffset = Number.isFinite(selectedProp.yOffset) ? selectedProp.yOffset : 0;
          updateSelectedPropEditorTransform({ yOffset: Math.round(currentYOffset + direction * step) });
        }
        return;
      }
      // Arrow keys fine-nudge the selected prop's position (Shift = 10px). A/D still walk
      // the camera, so deselect (or use WASD) to move around. preventDefault + the gameplay
      // guard below stop the player from also moving while a prop is selected.
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code) && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          event.preventDefault();
          const step = event.shiftKey ? 10 : 1;
          const dx = event.code === 'ArrowLeft' ? -step : event.code === 'ArrowRight' ? step : 0;
          const dy = event.code === 'ArrowUp' ? -step : event.code === 'ArrowDown' ? step : 0;
          const currentX = Number.isFinite(selectedProp.x) ? selectedProp.x : 0;
          const currentY = Number.isFinite(selectedProp.y) ? selectedProp.y : 0;
          updateSelectedPropEditorTransform({ x: Math.round(currentX + dx), y: Math.round(currentY + dy) });
          return;
        }
      }
      if (event.code === 'KeyQ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          updateSelectedPropEditorTransform({
            rotation: (Number.isFinite(selectedProp.rotation) ? selectedProp.rotation : 0) - DEFAULT_JOURNEY_PROP_EDITOR_ROTATION_STEP,
          });
        }
        return;
      }
      if (event.code === 'KeyR' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          updateSelectedPropEditorTransform({
            rotation: (Number.isFinite(selectedProp.rotation) ? selectedProp.rotation : 0) + DEFAULT_JOURNEY_PROP_EDITOR_ROTATION_STEP,
          });
        }
        return;
      }
      if (event.code === 'KeyF' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          updateSelectedPropEditorTransform({ mirrorX: !selectedProp.mirrorX });
        }
        return;
      }
      if (event.code === 'KeyV' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          updateSelectedPropEditorTransform({ mirrorY: !selectedProp.mirrorY });
        }
        return;
      }
      if ((['Equal', 'NumpadAdd', 'NumpadMultiply'].includes(event.code) || event.key === '+' || event.key === '*') && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          updateSelectedPropEditorTransform({
            scale: (Number.isFinite(selectedProp.scale) ? selectedProp.scale : 1) + DEFAULT_JOURNEY_PROP_EDITOR_SCALE_STEP,
          });
        }
        return;
      }
      if ((['Minus', 'NumpadSubtract', 'NumpadDivide'].includes(event.code) || event.key === '-' || event.key === '_') && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const selectedProp = getPropEditorSelectedProp();
        if (selectedProp) {
          updateSelectedPropEditorTransform({
            scale: Math.max(0.1, (Number.isFinite(selectedProp.scale) ? selectedProp.scale : 1) - DEFAULT_JOURNEY_PROP_EDITOR_SCALE_STEP),
          });
        }
        return;
      }
      if (event.code === 'Delete' || event.code === 'Backspace') {
        event.preventDefault();
        deleteSelectedPropFromEditor();
      }
    };
    window.addEventListener('keydown', handlePropEditorKeyDown);
    return () => window.removeEventListener('keydown', handlePropEditorKeyDown);
  }, [
    DEFAULT_JOURNEY_PROP_EDITOR_ROTATION_STEP,
    DEFAULT_JOURNEY_PROP_EDITOR_SCALE_STEP,
    applyDefaultEditorLocks,
    deleteSelectedPropFromEditor,
    draw,
    duplicateSelectedPropInEditor,
    getEditedNestParams,
    getPropEditorSelectedNest,
    getPropEditorSelectedProp,
    isJourneyEditorFormTarget,
    propPlacementEditorRef,
    redoEditorChange,
    refreshPropEditorUi,
    savePropPlacementExport,
    stateRef,
    undoEditorChange,
    updateSelectedPropEditorTransform,
  ]);
}
