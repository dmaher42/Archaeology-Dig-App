import { useCallback } from 'react';

import { CANVAS_WIDTH } from './journeyConstants';
import { clampCameraX } from './journeyLayout.js';

// DEV-only prop-editor outliner + on-canvas stack-picker selection. Extracted from
// ExpeditionJourney as a self-contained slice of the editor decomposition: every
// callback here is consumed only by the editor panel JSX. The shared placement state
// (propPlacementEditorRef) and resolvers stay in the component and are passed in.
export function useJourneyEditorOutliner({
  propPlacementEditorRef,
  stateRef,
  getRenderableStoryProps,
  refreshPropEditorUi,
  isEditorLockKeyLocked,
}) {
  const selectEditorPropFromOutliner = useCallback((propId) => {
    const editor = propPlacementEditorRef.current;
    const current = stateRef.current;
    editor.selectedPropId = propId;
    editor.selectedPlatformId = null;
    editor.selectedHazardId = null;
    editor.selectedArchId = null;
    editor.selectedCheckpointId = null;
    editor.selectedLairId = null;
    editor.selectedNestId = null;
    editor.dragging = null;
    // Recenter the camera so picking an off-screen prop brings it into view.
    const prop = getRenderableStoryProps(current).find(item => item.id === propId);
    if (prop && Number.isFinite(prop.x)) {
      const nextCameraX = clampCameraX(prop.x - CANVAS_WIDTH / 2);
      current.cameraX = nextCameraX;
      current.targetCameraX = nextCameraX;
    }
    refreshPropEditorUi();
  }, [propPlacementEditorRef, stateRef, getRenderableStoryProps, refreshPropEditorUi]);

  const toggleEditorPropHidden = useCallback((propId) => {
    const editor = propPlacementEditorRef.current;
    if (editor.hiddenIds.has(propId)) editor.hiddenIds.delete(propId);
    else editor.hiddenIds.add(propId);
    refreshPropEditorUi();
  }, [propPlacementEditorRef, refreshPropEditorUi]);

  const showAllEditorProps = useCallback(() => {
    const editor = propPlacementEditorRef.current;
    if (!editor.hiddenIds.size) return;
    editor.hiddenIds.clear();
    refreshPropEditorUi();
  }, [propPlacementEditorRef, refreshPropEditorUi]);

  const toggleEditorPropLockFromOutliner = useCallback((propId) => {
    const editor = propPlacementEditorRef.current;
    const key = `prop:${propId}`;
    if (editor.lockedItems.has(key)) {
      editor.lockedItems.delete(key);
    } else {
      editor.lockedItems.add(key);
      if (editor.selectedPropId === propId) editor.dragging = null;
    }
    refreshPropEditorUi();
  }, [propPlacementEditorRef, refreshPropEditorUi]);

  const setEditorOutlinerSearch = useCallback((value) => {
    propPlacementEditorRef.current.outlinerSearch = value;
    refreshPropEditorUi();
  }, [propPlacementEditorRef, refreshPropEditorUi]);

  // Select an entity chosen from the on-canvas stack picker (Alt/right-click). Selection
  // only — no drag — since the user is choosing among overlapping items, not grabbing one.
  const selectEditorEntityFromStack = useCallback((kind, id) => {
    const editor = propPlacementEditorRef.current;
    if (isEditorLockKeyLocked(`${kind}:${id}`)) {
      editor.stackPicker = null;
      refreshPropEditorUi();
      return;
    }
    editor.selectedPropId = null;
    editor.selectedPlatformId = null;
    editor.selectedHazardId = null;
    editor.selectedArchId = null;
    editor.selectedCheckpointId = null;
    editor.selectedLairId = null;
    editor.selectedNestId = null;
    editor.dragging = null;
    if (kind === 'prop') editor.selectedPropId = id;
    else if (kind === 'platform') editor.selectedPlatformId = id;
    else if (kind === 'hazard') editor.selectedHazardId = id;
    else if (kind === 'arch') editor.selectedArchId = id;
    else if (kind === 'checkpoint') editor.selectedCheckpointId = id;
    else if (kind === 'lair') editor.selectedLairId = id;
    else if (kind === 'nest') editor.selectedNestId = id;
    editor.stackPicker = null;
    refreshPropEditorUi();
  }, [propPlacementEditorRef, isEditorLockKeyLocked, refreshPropEditorUi]);

  const dismissEditorStackPicker = useCallback(() => {
    if (!propPlacementEditorRef.current.stackPicker) return;
    propPlacementEditorRef.current.stackPicker = null;
    refreshPropEditorUi();
  }, [propPlacementEditorRef, refreshPropEditorUi]);

  return {
    selectEditorPropFromOutliner,
    toggleEditorPropHidden,
    showAllEditorProps,
    toggleEditorPropLockFromOutliner,
    setEditorOutlinerSearch,
    selectEditorEntityFromStack,
    dismissEditorStackPicker,
  };
}
