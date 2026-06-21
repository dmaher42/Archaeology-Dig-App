import { useEffect } from 'react';

export function useJourneyPlacementEditorPointerHandlers({
  JOURNEY_VERTICAL_OFFSET,
  PLATFORMS,
  buildEditorHoverStack,
  canvasRef,
  clamp,
  createPlatformFromEditorPalette,
  createPropFromEditorPalette,
  createTrapFromEditorPalette,
  draw,
  findEditableArchAt,
  findEditableCheckpointAt,
  findEditableHazardAt,
  findEditableNestAt,
  findEditablePlatformAt,
  findEditableScarabLairAt,
  findEditableStoryPropAt,
  getCheckpointEditorBaseCheckpointById,
  getEditedNestParams,
  getEditedStoryProp,
  getEditorEntityLabel,
  getGroundAwareStoryPropEditorEdit,
  getHazardEditorBaseHazardById,
  getMiniBossEditorBaseBossById,
  getPlatformEditorBasePlatformById,
  getPropEditorBasePropById,
  getPropEditorPointer,
  getPropEditorSelectedProp,
  getRenderableScorpionNests,
  getRouteGateEditorBaseDoorwayById,
  getRouteGateEditorBaseGateById,
  getScarabQueenLairPlacement,
  getStoryPropEditorBounds,
  hitTestPropTransformHandle,
  isEditorLockKeyLocked,
  propPlacementEditorRef,
  refreshPropEditorUi,
  snapJourneyPropCoordinate,
  stateRef,
  updateEditorHover,
}) {
  // Right-click over the canvas (and the stack-picker overlay) opens our own selection
  // list, so suppress the browser's native context menu there while the editor is on.
  // A document-level listener is needed because the stack-picker backdrop (fixed, full
  // viewport) becomes the contextmenu target the moment the picker opens, bypassing any
  // handler bound only to the canvas.
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    const handleContextMenu = (event) => {
      if (!propPlacementEditorRef.current.enabled) return;
      const target = event.target;
      const overPicker = target?.closest?.('.journey-prop-editor-stackpicker, .journey-prop-editor-stackpicker-backdrop');
      if (target === canvasRef.current || overPicker) event.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [canvasRef, propPlacementEditorRef]);

  const handlePointerDown = (e) => {
    const editor = propPlacementEditorRef.current;
    if (import.meta.env.DEV && editor.enabled) {
      const pointer = getPropEditorPointer(e);
      if (!pointer) return;
      if (editor.selectedPaletteKey) {
        if (String(editor.selectedPaletteKey).startsWith('trap:') || editor.selectedPaletteCategory === 'trap') {
          createTrapFromEditorPalette(pointer);
        } else if (String(editor.selectedPaletteKey).startsWith('platform:') || editor.selectedPaletteCategory === 'platform') {
          createPlatformFromEditorPalette(pointer);
        } else {
          createPropFromEditorPalette(pointer);
        }
        editor.dragging = null;
        e.preventDefault();
        draw();
        return;
      }
      // Alt+click or right-click opens a clickable list of every entity stacked under
      // the cursor, so buried props can be selected without Tab-cycling through them.
      const wantsStackPicker = e.button === 2 || (e.button === 0 && e.altKey);
      if (wantsStackPicker) {
        const stack = buildEditorHoverStack(pointer.screenX, pointer.screenY);
        editor.stackPicker = stack.length ? {
          clientX: e.clientX,
          clientY: e.clientY,
          items: stack.map(d => ({
            kind: d.kind,
            id: d.id,
            label: getEditorEntityLabel(d),
            locked: isEditorLockKeyLocked(`${d.kind}:${d.id}`),
          })),
        } : null;
        e.preventDefault();
        refreshPropEditorUi();
        return;
      }
      // Any normal click dismisses an open stack picker before selecting.
      if (editor.stackPicker) editor.stackPicker = null;
      // Transform handles on the already-selected prop take priority over re-selecting:
      // corner squares scale, the knob above rotates. Only fires on a precise handle
      // hit, so normal click-to-select/move below is untouched.
      if (editor.selectedPropId) {
        const current = stateRef.current;
        const selectedForHandle = getPropEditorSelectedProp(current);
        if (selectedForHandle && !isEditorLockKeyLocked(`prop:${selectedForHandle.id}`)) {
          const handleBounds = getStoryPropEditorBounds(selectedForHandle, current.cameraX || 0, current);
          const handle = hitTestPropTransformHandle(pointer.screenX, pointer.screenY, handleBounds);
          if (handle) {
            const cx = handleBounds.x + handleBounds.width / 2;
            const cy = handleBounds.y + handleBounds.height / 2;
            if (handle === 'rotate') {
              editor.dragging = {
                kind: 'prop-rotate',
                propId: selectedForHandle.id,
                cx,
                cy,
                startRotation: Number.isFinite(selectedForHandle.rotation) ? selectedForHandle.rotation : 0,
                startAngle: Math.atan2(pointer.screenY - cy, pointer.screenX - cx) * 180 / Math.PI,
              };
            } else {
              editor.dragging = {
                kind: 'prop-scale',
                propId: selectedForHandle.id,
                cx,
                cy,
                startScale: Number.isFinite(selectedForHandle.scale) ? selectedForHandle.scale : 1,
                startDist: Math.max(1, Math.hypot(pointer.screenX - cx, pointer.screenY - cy)),
              };
            }
            e.currentTarget.setPointerCapture?.(e.pointerId);
            e.preventDefault();
            draw();
            refreshPropEditorUi();
            return;
          }
        }
      }
      // If the user has Tab-cycled to a buried entity at this point, select that one
      // (what the hover preview shows). index 0 falls through to the normal cascade so
      // default clicks behave exactly as before.
      const hover = editor.hover;
      if (hover && hover.index > 0 && hover.stack && hover.stack.length > hover.index) {
        const clickStack = buildEditorHoverStack(pointer.screenX, pointer.screenY);
        const signature = clickStack.map(d => `${d.kind}:${d.id}`).join('|');
        if (signature === hover.signature) {
          const descriptor = clickStack[hover.index];
          if (!isEditorLockKeyLocked(`${descriptor.kind}:${descriptor.id}`)) {
            editor.selectedPropId = null;
            editor.selectedPlatformId = null;
            editor.selectedHazardId = null;
            editor.selectedArchId = null;
            editor.selectedCheckpointId = null;
            editor.selectedLairId = null;
            editor.selectedNestId = null;
            const { kind, entity } = descriptor;
            if (kind === 'prop') {
              editor.selectedPropId = entity.id;
              editor.dragging = { kind: 'prop', propId: entity.id, offsetX: pointer.worldX - entity.x, offsetY: pointer.worldY - entity.y };
            } else if (kind === 'platform') {
              const platformId = entity.id || entity.label;
              editor.selectedPlatformId = platformId;
              editor.dragging = { kind: 'platform', platformId, offsetX: pointer.worldX - entity.x, offsetY: pointer.worldY - entity.y };
            } else if (kind === 'hazard') {
              editor.selectedHazardId = entity.id;
              editor.dragging = { kind: 'hazard', hazardId: entity.id, offsetX: pointer.worldX - entity.x, offsetY: pointer.screenY - entity.y };
            } else if (kind === 'arch') {
              editor.selectedArchId = entity.editorId;
              const archX = entity.editorKind === 'doorway'
                ? (Number.isFinite(entity.anchorX) ? entity.anchorX : entity.blockX)
                : entity.x;
              editor.dragging = { kind: 'arch', archId: entity.editorId, offsetX: pointer.worldX - archX, offsetY: pointer.screenY - entity.y };
            } else if (kind === 'checkpoint') {
              editor.selectedCheckpointId = entity.id;
              editor.dragging = { kind: 'checkpoint', checkpointId: entity.id, offsetX: pointer.worldX - entity.x, offsetY: pointer.screenY - entity.y };
            } else if (kind === 'lair') {
              editor.selectedLairId = entity.id;
              const placement = getScarabQueenLairPlacement(entity);
              editor.dragging = { kind: 'lair', lairId: entity.id, offsetX: pointer.worldX - placement.x, offsetY: pointer.screenY - placement.y };
            } else if (kind === 'nest') {
              editor.selectedNestId = entity.id;
              const params = getEditedNestParams(entity);
              editor.dragging = { kind: 'nest', nestId: entity.id, offsetX: pointer.worldX - params.x, offsetY: pointer.worldY - params.y };
            }
            e.currentTarget.setPointerCapture?.(e.pointerId);
          } else {
            editor.dragging = null;
          }
          e.preventDefault();
          draw();
          refreshPropEditorUi();
          return;
        }
      }
      const selectedForcedFloor = editor.floorPickMode
        ? findEditablePlatformAt(pointer.screenX, pointer.screenY, { floorOnly: true })
        : null;
      // Scorpion nest takes priority over the crowded selection chain (but not forced
      // floor-pick mode). Handled here with an early return so the tested hazard ->
      // platform -> prop ordering below stays byte-for-byte intact.
      const selectedNest = selectedForcedFloor ? null : findEditableNestAt(pointer.screenX, pointer.screenY);
      if (selectedNest && !isEditorLockKeyLocked(`nest:${selectedNest.id}`)) {
        editor.selectedPropId = null;
        editor.selectedPlatformId = null;
        editor.selectedHazardId = null;
        editor.selectedArchId = null;
        editor.selectedCheckpointId = null;
        editor.selectedLairId = null;
        editor.selectedNestId = selectedNest.id;
        const params = getEditedNestParams(selectedNest);
        editor.dragging = {
          kind: 'nest',
          nestId: selectedNest.id,
          offsetX: pointer.worldX - params.x,
          offsetY: pointer.worldY - params.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
        e.preventDefault();
        draw();
        refreshPropEditorUi();
        return;
      }
      const selectedHazard = selectedForcedFloor ? null : findEditableHazardAt(pointer.screenX, pointer.screenY);
      const selectedLair = selectedHazard || selectedForcedFloor ? null : findEditableScarabLairAt(pointer.screenX, pointer.screenY);
      const selectedCheckpoint = selectedHazard || selectedLair || selectedForcedFloor ? null : findEditableCheckpointAt(pointer.screenX, pointer.screenY);
      const selectedArch = selectedHazard || selectedLair || selectedCheckpoint || selectedForcedFloor ? null : findEditableArchAt(pointer.screenX, pointer.screenY);
      const selectedSolidPlatform = selectedHazard || selectedLair || selectedCheckpoint || selectedArch || selectedForcedFloor
        ? null
        : findEditablePlatformAt(pointer.screenX, pointer.screenY, { includeFloors: false });
      const selectedProp = selectedHazard || selectedLair || selectedCheckpoint || selectedArch || selectedForcedFloor || selectedSolidPlatform ? null : findEditableStoryPropAt(pointer.screenX, pointer.screenY);
      const selectedFallbackFloor = editor.floorPickMode || selectedHazard || selectedLair || selectedCheckpoint || selectedArch || selectedSolidPlatform || selectedProp
        ? null
        : findEditablePlatformAt(pointer.screenX, pointer.screenY, { floorOnly: true });
      const selectedPlatform = selectedForcedFloor || selectedSolidPlatform || selectedFallbackFloor;
      editor.selectedPropId = selectedProp?.id || null;
      editor.selectedPlatformId = selectedPlatform ? selectedPlatform.id || selectedPlatform.label : null;
      editor.selectedHazardId = selectedHazard?.id || null;
      editor.selectedArchId = selectedArch?.editorId || null;
      editor.selectedCheckpointId = selectedCheckpoint?.id || null;
      editor.selectedLairId = selectedLair?.id || null;
      editor.selectedNestId = null;
      const selectedLockKey = selectedProp
        ? `prop:${selectedProp.id}`
        : selectedPlatform
          ? `platform:${selectedPlatform.id || selectedPlatform.label}`
        : selectedHazard
          ? `hazard:${selectedHazard.id}`
        : selectedArch
          ? `arch:${selectedArch.editorId}`
        : selectedCheckpoint
          ? `checkpoint:${selectedCheckpoint.id}`
        : selectedLair
          ? `lair:${selectedLair.id}`
        : null;
      if (isEditorLockKeyLocked(selectedLockKey)) {
        editor.dragging = null;
        e.preventDefault();
        draw();
        refreshPropEditorUi();
        return;
      }
      if (selectedProp) {
        editor.dragging = {
          kind: 'prop',
          propId: selectedProp.id,
          offsetX: pointer.worldX - selectedProp.x,
          offsetY: pointer.worldY - selectedProp.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else if (selectedPlatform) {
        editor.dragging = {
          kind: 'platform',
          platformId: selectedPlatform.id || selectedPlatform.label,
          offsetX: pointer.worldX - selectedPlatform.x,
          offsetY: pointer.worldY - selectedPlatform.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else if (selectedHazard) {
        editor.dragging = {
          kind: 'hazard',
          hazardId: selectedHazard.id,
          offsetX: pointer.worldX - selectedHazard.x,
          offsetY: pointer.screenY - selectedHazard.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else if (selectedLair) {
        const placement = getScarabQueenLairPlacement(selectedLair);
        editor.dragging = {
          kind: 'lair',
          lairId: selectedLair.id,
          offsetX: pointer.worldX - placement.x,
          offsetY: pointer.screenY - placement.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else if (selectedArch) {
        const archX = selectedArch.editorKind === 'doorway'
          ? Number.isFinite(selectedArch.anchorX) ? selectedArch.anchorX : selectedArch.blockX
          : selectedArch.x;
        editor.dragging = {
          kind: 'arch',
          archId: selectedArch.editorId,
          offsetX: pointer.worldX - archX,
          offsetY: pointer.screenY - selectedArch.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else if (selectedCheckpoint) {
        editor.dragging = {
          kind: 'checkpoint',
          checkpointId: selectedCheckpoint.id,
          offsetX: pointer.worldX - selectedCheckpoint.x,
          offsetY: pointer.screenY - selectedCheckpoint.y,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else {
        editor.dragging = null;
      }
      e.preventDefault();
      draw();
      refreshPropEditorUi();
      return;
    }
    if (!window.__expeditionDebugOverlay) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pointer = getPropEditorPointer(e);
    if (!pointer) return;

    const worldX = pointer.worldX;
    const worldY = pointer.worldY - JOURNEY_VERTICAL_OFFSET;

    const platform = PLATFORMS.find(p =>
      worldX >= p.x && worldX <= p.x + p.width &&
      worldY >= p.y && worldY <= p.y + p.height
    );

    if (platform) {
      window.__draggedPlatform = platform;
      window.__dragOffsetX = worldX - platform.x;
      window.__dragOffsetY = worldY - platform.y;
    }
  };

  const handlePointerMove = (e) => {
    const editor = propPlacementEditorRef.current;
    if (import.meta.env.DEV && editor.enabled && !editor.dragging && !editor.selectedPaletteKey) {
      const pointer = getPropEditorPointer(e);
      if (pointer) {
        updateEditorHover(pointer.screenX, pointer.screenY);
        draw();
      }
      return;
    }
    if (import.meta.env.DEV && editor.enabled && editor.dragging) {
      const pointer = getPropEditorPointer(e);
      if (!pointer) return;
      if (editor.dragging.kind === 'lair') {
        const baseLair = getMiniBossEditorBaseBossById(editor.dragging.lairId);
        if (!baseLair) return;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.screenY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        editor.miniBossEdits[baseLair.id] = {
          ...(editor.miniBossEdits[baseLair.id] || {}),
          lairX: nextX,
          lairY: nextY,
        };
      } else if (editor.dragging.kind === 'nest') {
        const baseNest = getRenderableScorpionNests().find(enemy => enemy.id === editor.dragging.nestId);
        if (!baseNest) return;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.worldY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        editor.scorpionNestEdits[baseNest.id] = {
          ...(editor.scorpionNestEdits[baseNest.id] || {}),
          x: nextX,
          y: nextY,
        };
      } else if (editor.dragging.kind === 'arch') {
        const [, id] = editor.dragging.archId.split(':');
        const baseArch = editor.dragging.archId.startsWith('doorway:')
          ? getRouteGateEditorBaseDoorwayById(id)
          : getRouteGateEditorBaseGateById(id);
        if (!baseArch) return;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.screenY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        if (editor.dragging.archId.startsWith('doorway:')) {
          editor.routeGateDoorwayEdits[id] = {
            ...(editor.routeGateDoorwayEdits[id] || {}),
            x: nextX,
            y: nextY,
          };
        } else {
          editor.routeGateEdits[id] = {
            ...(editor.routeGateEdits[id] || {}),
            x: nextX,
            y: nextY,
          };
        }
      } else if (editor.dragging.kind === 'checkpoint') {
        const baseCheckpoint = getCheckpointEditorBaseCheckpointById(editor.dragging.checkpointId);
        if (!baseCheckpoint) return;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.screenY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        editor.checkpointEdits[baseCheckpoint.id] = {
          ...(editor.checkpointEdits[baseCheckpoint.id] || {}),
          x: nextX,
          y: nextY,
        };
      } else if (editor.dragging.kind === 'hazard') {
        const baseHazard = getHazardEditorBaseHazardById(editor.dragging.hazardId);
        if (!baseHazard) return;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.screenY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        editor.hazardEdits[baseHazard.id] = {
          ...(editor.hazardEdits[baseHazard.id] || {}),
          x: nextX,
          y: nextY,
        };
      } else if (editor.dragging.kind === 'platform') {
        const basePlatform = getPlatformEditorBasePlatformById(editor.dragging.platformId);
        if (!basePlatform) return;
        const platformId = basePlatform.id || basePlatform.label;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.worldY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        editor.platformEdits[platformId] = {
          ...(editor.platformEdits[platformId] || {}),
          x: nextX,
          y: nextY,
        };
      } else if (editor.dragging.kind === 'prop-scale') {
        const baseProp = getPropEditorBasePropById(editor.dragging.propId);
        if (!baseProp) return;
        const dist = Math.hypot(pointer.screenX - editor.dragging.cx, pointer.screenY - editor.dragging.cy);
        const ratio = dist / editor.dragging.startDist;
        const nextScale = Math.round(clamp(editor.dragging.startScale * ratio, 0.1, 12) * 100) / 100;
        editor.edits[baseProp.id] = {
          ...(editor.edits[baseProp.id] || {}),
          scale: nextScale,
        };
      } else if (editor.dragging.kind === 'prop-rotate') {
        const baseProp = getPropEditorBasePropById(editor.dragging.propId);
        if (!baseProp) return;
        const angle = Math.atan2(pointer.screenY - editor.dragging.cy, pointer.screenX - editor.dragging.cx) * 180 / Math.PI;
        let nextRotation = editor.dragging.startRotation + (angle - editor.dragging.startAngle);
        nextRotation = ((nextRotation + 180) % 360 + 360) % 360 - 180; // normalize to (-180, 180]
        if (editor.gridSnap) nextRotation = Math.round(nextRotation / 15) * 15; // snap to 15° with grid snap on
        nextRotation = Math.round(nextRotation * 10) / 10;
        editor.edits[baseProp.id] = {
          ...(editor.edits[baseProp.id] || {}),
          rotation: nextRotation,
        };
      } else {
        const baseProp = getPropEditorBasePropById(editor.dragging.propId);
        if (!baseProp) return;
        const rawX = pointer.worldX - editor.dragging.offsetX;
        const rawY = pointer.worldY - editor.dragging.offsetY;
        const nextX = editor.gridSnap ? snapJourneyPropCoordinate(rawX, editor.gridSize) : Math.round(rawX);
        const nextY = editor.gridSnap ? snapJourneyPropCoordinate(rawY, editor.gridSize) : Math.round(rawY);
        const nextEdit = getGroundAwareStoryPropEditorEdit(getEditedStoryProp(baseProp) || baseProp, { x: nextX, y: nextY });
        editor.edits[baseProp.id] = {
          ...(editor.edits[baseProp.id] || {}),
          ...nextEdit,
        };
      }
      e.preventDefault();
      draw();
      refreshPropEditorUi();
      return;
    }
    if (!window.__draggedPlatform) return;
    const pointer = getPropEditorPointer(e);
    if (!pointer) return;

    const worldX = pointer.worldX;
    const worldY = pointer.worldY - JOURNEY_VERTICAL_OFFSET;

    window.__draggedPlatform.x = Math.round(worldX - window.__dragOffsetX);
    window.__draggedPlatform.y = Math.round(worldY - window.__dragOffsetY);
  };

  const handlePointerUp = (e) => {
    const editor = propPlacementEditorRef.current;
    if (import.meta.env.DEV && editor.dragging) {
      editor.dragging = null;
      e?.currentTarget?.releasePointerCapture?.(e.pointerId);
      refreshPropEditorUi();
      return;
    }
    if (window.__draggedPlatform) {
      console.log(`Platform ${window.__draggedPlatform.id} dragged to x: ${window.__draggedPlatform.x}, y: ${window.__draggedPlatform.y}`);
      window.__draggedPlatform = null;
    }
  };

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
